// Klammerfront – Auswertung Kartenpfad Teil 12 (REQ-K12.01, K12.05): Tabellen aus Rohdaten von tools/messung-k12.mjs und aus der Konfiguration.
// Aufruf: node tools/basis-k12.mjs [--prefix kartenpfad12-basis] [--teil rechnung|messung|alle] [--json reports/<prefix>-auswertung.json] [--bot ohne] [--bots ohne,militaer,wirtschaft,verteidigung]
//   rechnung  Kosten der Wahlen, Kurs des Forschungsbudgets, Materialpreis der nächsten Karte, Preisanstieg der übrigen Investitionen (nur Konfiguration)
//   messung   Elastizität, Quellen je Stufe, Mindestabstand, Siegquote je Budget (Rohdaten reports/<prefix>-<bot>-b<n>.json und -regel.json)
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { median, mean, GEBREMST_S } from './ep-kennzahlen.mjs';
import { kursFaktorBei } from './sim-bot.mjs';
import { loadCore } from './load-core.mjs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad12-basis'), TEIL = arg('teil', 'alle'), JSON_OUT = arg('json', null), BOTS = arg('bots', arg('bot', 'ohne')).split(',');
process.env.KF_PACING = 'karten';
const { KF_CONFIG: C } = loadCore();
const out = {};
const f0 = x => x == null || !Number.isFinite(x) ? '–' : String(Math.round(x)), f1 = x => x == null || !Number.isFinite(x) ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ','), f3 = x => x == null || !Number.isFinite(x) ? '–' : (Math.round(x * 1000) / 1000).toFixed(3).replace('.', ','), f2 = x => x == null || !Number.isFinite(x) ? '–' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
const pc = x => x == null ? '–' : `${Math.round(100 * x)} %`;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const tab = (kopf, zeilen) => console.log(`| ${kopf.join(' | ')} |\n|${kopf.map(() => '---').join('|')}|\n${zeilen.map(z => `| ${z.join(' | ')} |`).join('\n')}\n`);

/* ---------- Rechnung aus der Konfiguration ---------- */
const B = C.KARTEN.budget, S = C.KARTEN.schwellen;
const MULT = [['ohne', 1], ['Akademie', 1.5], ['Stiftungshaus', 2], ['Lehrjahre II', 1.25], ['alle drei', 1.5 * 2 * 1.25]];       // Multiplikatoren auf den Kurs (budgetKurs)
const kursBei = (anteil, m = 1) => B.kurs * kursFaktorBei(B, anteil) * m;
const kosten = n => S.start * Math.pow(S.wachstum, n - 1);
if (TEIL === 'rechnung' || TEIL === 'alle'){
  console.log(`## Kosten der Wahlen (Kurve ${S.start} · ${S.wachstum}^(n−1), Mindestabstand ${C.KARTEN.minAbstand} s)\n`);
  tab(['n', 'Kosten E(n) (EP)', 'kumuliert'], Array.from({ length: 20 }, (_, i) => [i + 1, f0(kosten(i + 1)), f0(Array.from({ length: i + 1 }, (_, k) => kosten(k + 1)).reduce((a, b) => a + b, 0))]));
  out.kosten = Array.from({ length: 20 }, (_, i) => kosten(i + 1));
  console.log('## Kurs des Forschungsbudgets (EP je Material)\n');
  const ANT = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5];
  tab(['Anteil', ...MULT.map(m => m[0]), 'Kurs relativ zum kleinsten Anteil'], ANT.map(a => [pc(a), ...MULT.map(([, m]) => f3(kursBei(a, m))), pc(kursBei(a) / kursBei(ANT[0]))]));
  out.kurs = ANT.map(a => ({ anteil: a, ...Object.fromEntries(MULT.map(([n, m]) => [n, kursBei(a, m)])) }));
  console.log('Stützstellen des Reglers: ' + B.stufen.map((s, i) => `${pc(s)} → Faktor ${B.kursFaktor[i]}`).join(', ') + '; Zwischenwerte linear (nur Messung).\n');
  console.log('## Materialpreis der nächsten Karte (Kosten E(n) geteilt durch den Kurs; alle EP aus dem Budget gedacht)\n');
  const SH = [0.1, 0.2, 0.3, 0.4];
  tab(['n', ...SH.map(s => `Budget ${pc(s)}`)], [1, 2, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15].map(n => [n, ...SH.map(s => f0(kosten(n) / kursBei(s)))]));
  out.preis = Object.fromEntries([1, 2, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15].map(n => [n, Object.fromEntries(SH.map(s => [s, kosten(n) / kursBei(s)]))]));
  console.log('## Preisanstieg der übrigen Investitionen (Material je Kauf)\n');
  const reihe = (f, n) => Array.from({ length: n }, (_, k) => f(k));
  const faktor = r => Math.pow(r[r.length - 1] / r[0], 1 / (r.length - 1));
  const fab = reihe(k => C.FACTORY_BASE_COST * Math.pow(C.FACTORY_COST_GROWTH, k), 5), qual = reihe(k => C.UPGRADES.qualitaet.baseCost * Math.pow(C.UPGRADES.qualitaet.growth, k), 4), qua = reihe(k => C.UPGRADES.ausbau.baseCost * Math.pow(C.UPGRADES.ausbau.growth, k), 5);
  const einh = [C.UNITS.bogenschuetze.cost, C.UNITS.bogenschuetze.cost, C.UNITS.bogenschuetze.cost];
  const karte = reihe(k => kosten(k + 1) / kursBei(0.2), 12);
  const rows = [['Manufaktur (1.–5.)', fab.map(f0).join(' · '), faktor(fab)], ['Qualitätsstufe der Schmiede (1.–4.)', qual.map(f0).join(' · '), faktor(qual)], ['Quartier (1.–5.)', qua.map(f0).join(' · '), faktor(qua)],
    ['Einheit (Bogenschütze, je Kauf)', einh.map(f0).join(' · '), 1], ['Karte bei Budget 20 % (n = 1–12)', karte.slice(0, 4).map(f0).join(' · ') + ' …', faktor(karte)]];
  tab(['Investition', 'Preise der ersten Käufe', 'Faktor je Kauf'], rows.map(r => [r[0], r[1], f2(r[2])]));
  const anst = [faktor(fab), faktor(qual), faktor(qua)];
  const geo = a => Math.exp(a.reduce((s, x) => s + Math.log(x), 0) / a.length);
  console.log(`Mittlerer Faktor je Kauf: ${f2(geo(anst))} (Manufaktur, Schmiede, Quartier), ${f2(geo([...anst, 1]))} mit der Einheit (Preis gleich).\n`);
  out.anstieg = { fabrik: faktor(fab), qualitaet: faktor(qual), quartier: faktor(qua), einheit: 1, karte20: faktor(karte), mittelOhneEinheit: geo(anst), mittelMitEinheit: geo([...anst, 1]) };
}

/* ---------- Messung ---------- */
const lade = (bot, arm) => { const p = `reports/${PREFIX}-${bot}-${arm}.json`; return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).roh : null; };
const felder = rs => rs.filter(r => r.diff === (arg('diff', 'normal')) && r.profile === arg('profile', 'durchschnitt'));
/* Abstand zwischen Wahl n und n+1 (Erscheinen), Sekunden */
const abstandBei = (r, n) => { const a = (r.wahlen || []).find(w => w.n === n), b = (r.wahlen || []).find(w => w.n === n + 1); return a && b ? b.t - a.t : null; };
const gebremst = (ws, bis = Infinity) => ws.filter(w => w.w != null && w.n <= bis);
const kenn = rs => {
  const alle = rs.flatMap(r => r.wahlen || []), g = gebremst(alle);
  return { n: rs.length, siege: rs.filter(r => r.status === 'won').length / rs.length, patt: rs.filter(r => r.status !== 'won' && r.status !== 'lost').length / rs.length, dauer: median(rs.map(r => r.t)), wahlen: median(rs.map(r => (r.wahlen || []).length)),
    gebremst: g.length ? g.filter(w => w.w > GEBREMST_S).length / g.length : null, gebremst6: gebremst(alle, 6).length ? gebremst(alle, 6).filter(w => w.w > GEBREMST_S).length / gebremst(alle, 6).length : null,
    abstand: Object.fromEntries([5, 10, 13].map(n => [n, median(rs.map(r => abstandBei(r, n)))])), abstandAnzahl: Object.fromEntries([5, 10, 13].map(n => [n, rs.map(r => abstandBei(r, n)).filter(x => x != null).length])),
    rueckMax: median(rs.map(r => r.rueckMax)), rueck2: rs.filter(r => (r.rueckMax || 0) >= 2).length / rs.length, rueck3: rs.filter(r => (r.rueckMax || 0) >= 3).length / rs.length };
};
/* EP je Quelle zwischen zwei erreichten Schwellen (Median über die Partien), zusammengefasst zu Stufenbereichen */
const BEREICHE = [[1, 4], [5, 9], [10, 13], [14, 99]];
const QU = ['kill', 'tower', 'base', 'wave', 'budget', 'lager', 'trade', 'bounty', 'passive'];
const quellenJe = (rs, a, b) => {
  const je = rs.map(r => { const s = r.stufenSrc || []; const von = s.find(x => x.n === a - 1) || { src: {}, total: 0 }, bis = s.find(x => x.n === b); if (!bis) return null; const d = { gesamt: bis.total - von.total }; for (const k of Object.keys(bis.src)) d[k] = (bis.src[k] || 0) - (von.src[k] || 0); return d; }).filter(Boolean);
  if (!je.length) return null;
  const keys = new Set(je.flatMap(x => Object.keys(x))); const m = {}; for (const k of keys) m[k] = median(je.map(x => x[k] || 0)); m.partien = je.length;
  m.andere = Math.max(0, m.gesamt - QU.reduce((s, k) => s + (m[k] || 0), 0)); return m;
};
if (TEIL === 'messung' || TEIL === 'alle'){
  out.messung = {};
  for (const bot of BOTS){
    const arme = ['b0', 'b10', 'b20', 'b30', 'b40', 'regel'].filter(a => lade(bot, a));
    if (!arme.length){ console.log(`Keine Rohdaten für ${bot} (${PREFIX}).\n`); continue; }
    out.messung[bot] = { arme: {} };
    console.log(`## Bot ${bot}: Elastizität und Kennzahlen je Budget (${arg('diff', 'normal')}, ${arg('profile', 'durchschnitt')})\n`);
    const zeilen = arme.map(a => { const rs = felder(lade(bot, a)), k = kenn(rs); out.messung[bot].arme[a] = k; return [a === 'regel' ? 'Regel des Bots' : `${a.slice(1)} %`, k.n, pc(k.siege), mm(k.dauer), k.wahlen, pc(k.gebremst), pc(k.gebremst6), ...[5, 10, 13].map(n => `${f1(k.abstand[n])} s (${k.abstandAnzahl[n]})`), pc(k.patt)]; });
    tab(['Budget', 'Partien', 'Siege', 'Dauer (Median)', 'Wahlen (Median)', 'gebremst (>5 s)', 'gebremst bis Stufe 6', 'Abstand Stufe 5', 'Abstand Stufe 10', 'Abstand Stufe 13', 'Patt'], zeilen);
    const b0 = out.messung[bot].arme.b0;
    if (b0){
      console.log('Abstand bis zur nächsten Wahl gegenüber Budget 0 % (Elastizität):\n');
      tab(['Budget', 'Stufe 5', 'Stufe 10', 'Stufe 13'], arme.filter(a => /^b\d+$/.test(a) && a !== 'b0').map(a => [`${a.slice(1)} %`, ...[5, 10, 13].map(n => { const x = out.messung[bot].arme[a].abstand[n], y = b0.abstand[n]; return x == null || y == null ? '–' : `${x - y >= 0 ? '+' : ''}${Math.round(100 * (x - y) / y)} %`; })]));
    }
    for (const a of arme.filter(x => ['b0', 'b30', 'regel'].includes(x))){
      console.log(`EP je Quelle und Stufenbereich, Bot ${bot}, Budget ${a === 'regel' ? 'Regel' : a.slice(1) + ' %'} (Median der EP zwischen den erreichten Schwellen, Partien in Klammern)\n`);
      const rs = felder(lade(bot, a));
      const q = BEREICHE.map(([x, y]) => [x, y, quellenJe(rs, x, y)]).filter(e => e[2]);
      out.messung[bot][`quellen_${a}`] = q.map(([x, y, m]) => ({ von: x, bis: y, ...m }));
      tab(['Stufen', 'EP gesamt', ...QU.concat(['andere']).map(k => k), 'Partien'], q.map(([x, y, m]) => [`${x}–${y}`, f0(m.gesamt), ...QU.concat(['andere']).map(k => `${f0(m[k] || 0)} (${m.gesamt ? Math.round(100 * (m[k] || 0) / m.gesamt) : 0} %)`), m.partien]));
    }
  }
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));

// Klammerfront – Auswertung Kartenpfad Teil 8 (REQ-K8.01, K8.09): Taktung der Kartenwahl und EP-Quellen einer Messreihe (tools/messung-p6.mjs --set kategorien|ohne --prefix kartenpfad8-basis).
// Kennzahlen je Bot: Wahlen, Anteil gebremster Wahlen (Wartezeit über 5 s), Wartezeit, Übertrag, mittlerer Abstand vor und nach Minute 10, EP je Quelle bei Minute 5, 10, 15; dazu Siegquote, Patt, Dauer.
// Aufruf: node tools/basis-p8.mjs [--prefix kartenpfad8-basis] [--diff normal] [--profile durchschnitt] [--json reports/<prefix>-auswertung.json]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { kennzahlen, fasseZusammen, median, mean } from './ep-kennzahlen.mjs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad8-basis'), DIFF = arg('diff', 'normal'), PROF = arg('profile', 'durchschnitt'), JSON_OUT = arg('json', null);
const BOTS = [['militaer', 'kat-militaer-druck-aus'], ['wirtschaft', 'kat-wirtschaft-druck-aus'], ['verteidigung', 'kat-verteidigung-druck-aus'], ['ohne', 'felder-ohne-kat']];
const load = f => { const p = `reports/${PREFIX}-${f}.json`; return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).roh : null; };
const raw = Object.fromEntries(BOTS.map(([b, f]) => [b, load(f) || []]));
const pc = x => x == null ? '–' : `${Math.round(100 * x)} %`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const field = (rs, d = DIFF, p = PROF) => rs.filter(r => r.diff === d && r.profile === p);
const out = { prefix: PREFIX, bots: {} };

console.log(`AUSWERTUNG ${PREFIX} (${DIFF}, ${PROF}; Rohdaten reports/${PREFIX}-*.json)\n`);
console.log('Taktung der Kartenwahl\n');
console.log('| Bot | Partien | Wahlen (Median) | gebremste Wahlen (Wartezeit > 5 s) | Wartezeit Mittel | Übertrag Median (Anteil der Stufenkosten) | Abstand bis Min. 10 | Abstand nach Min. 10 | wartende Stufen (Median des Höchstwerts) |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [bot] of BOTS){
  const rs = field(raw[bot]); if (!rs.length) continue;
  const z = fasseZusammen(rs.map(r => r.wahlen || []));
  out.bots[bot] = { takt: z };
  console.log(`| ${bot} | ${rs.length} | ${z.wahlenMedian} | ${pc(z.gebremstAnteil)} | ${f1(z.wartezeitMittel)} s | ${pc(z.uebertragMedian)} | ${f1(z.abstandVor10)} s | ${f1(z.abstandNach10)} s | ${z.wartendMaxMedian} |`);
}

console.log('\nGebremste Wahlen und Abstand nach Minute 10 in allen Feldern (Bot ohne Kategorie und Kategorie-Bots, ohne Druck)\n');
console.log('| Bot | Grad | Profil | gebremst | Abstand nach Min. 10 | Wahlen | Siege | Patt |\n|---|---|---|---|---|---|---|---|');
for (const [bot] of BOTS){
  const cells = [...new Set(raw[bot].map(r => r.diff + '/' + r.profile))];
  for (const c of cells){
    const [d, p] = c.split('/'), rs = field(raw[bot], d, p), z = fasseZusammen(rs.map(r => r.wahlen || []));
    console.log(`| ${bot} | ${d} | ${p} | ${pc(z.gebremstAnteil)} | ${f1(z.abstandNach10)} s | ${z.wahlenMedian} | ${pc(rs.filter(r => r.status === 'won').length / rs.length)} | ${pc(rs.filter(r => r.status === 'running').length / rs.length)} |`);
  }
}

console.log(`\nEP je Quelle, kumuliert (Median über die Partien; ${DIFF}, ${PROF}) und Anteil an der Summe\n`);
const QUELLEN = ['kill', 'tower', 'base', 'wave', 'budget', 'lager', 'trade', 'bounty', 'andere'];
console.log(`| Bot | Minute | gesamt | ${QUELLEN.join(' | ')} |\n|---|---|---|${QUELLEN.map(() => '---|').join('')}`);
for (const [bot] of BOTS){
  const rs = field(raw[bot]); if (!rs.length) continue;
  out.bots[bot].quellen = {};
  for (const m of [300, 600, 900]){
    const s = rs.map(r => r.xpSrcAt && r.xpSrcAt[m]).filter(Boolean); if (!s.length) continue;
    const tot = median(s.map(x => x.total)), q = {};
    for (const k of QUELLEN) q[k] = k === 'andere' ? median(s.map(x => Object.entries(x).filter(([n]) => n !== 'total' && !QUELLEN.includes(n)).reduce((a, [, v]) => a + v, 0))) : median(s.map(x => x[k] || 0));
    out.bots[bot].quellen[m / 60] = { gesamt: tot, ...q };
    console.log(`| ${bot} | ${m / 60} | ${Math.round(tot)} (${s.length}/${rs.length}) | ${QUELLEN.map(k => `${Math.round(q[k])} (${tot ? Math.round(100 * q[k] / tot) : 0} %)`).join(' | ')} |`);
  }
}

console.log(`\nEP-Ertrag je Quelle im Zeitraum Minute 10–15 (Differenz der Mediane) – welche Quelle treibt den späten Überschuss?\n`);
console.log(`| Bot | ${QUELLEN.join(' | ')} | EP/min 10–15 | Stufenkosten Schritt (Median der Wahlen 12–15) |\n|---|${QUELLEN.map(() => '---|').join('')}---|---|`);
for (const [bot] of BOTS){
  const q = out.bots[bot] && out.bots[bot].quellen; if (!q || !q[10] || !q[15]) continue;
  const d = Object.fromEntries(QUELLEN.map(k => [k, (q[15][k] || 0) - (q[10][k] || 0)]));
  const tot = (q[15].gesamt || 0) - (q[10].gesamt || 0);
  out.bots[bot].quellenSpaet = { ...d, gesamt: tot };
  console.log(`| ${bot} | ${QUELLEN.map(k => `${Math.round(d[k])} (${tot ? Math.round(100 * d[k] / tot) : 0} %)`).join(' | ')} | ${Math.round(tot / 5)} | – |`);
}

console.log(`\nDauer und Patt (${DIFF}, ${PROF})\n`);
console.log('| Bot | Siege | Patt | Dauer Median |\n|---|---|---|---|');
for (const [bot] of BOTS){
  const rs = field(raw[bot]); if (!rs.length) continue;
  const row = { siege: rs.filter(r => r.status === 'won').length / rs.length, patt: rs.filter(r => r.status === 'running').length / rs.length, dauer: median(rs.map(r => r.t)) };
  out.bots[bot].dauer = row;
  console.log(`| ${bot} | ${pc(row.siege)} | ${pc(row.patt)} | ${mm(row.dauer)} |`);
}
const all = raw.ohne; const pattAlle = all.length ? all.filter(r => r.status === 'running').length / all.length : null;
out.pattOhneKategorieAlleFelder = pattAlle;
console.log(`\nPatt-Quote ohne Schalter, Bot ohne Kategorie, alle Felder: ${pattAlle == null ? '–' : (100 * pattAlle).toFixed(1).replace('.', ',')} % (${all.length} Partien)`);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));

// Klammerfront – Prüfung der Kriterien aus REQ-K12.05 für einen Kandidaten (Messreihe von tools/kalib-k12.mjs mit allen vier Bots und den Budgets 0, 10, 20, 30, 40 und regel).
// Aufruf: node tools/auswertung-k12.mjs --prefix kartenpfad12-kal3 --cand c3a [--md datei] [--json datei]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { feldKennzahlen, abstandBei } from './k12-kennzahlen.mjs';
import { median } from './ep-kennzahlen.mjs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad12-kal3'), CAND = arg('cand', 'c3a'), PROFILE = arg('profile', 'durchschnitt');
const BOTS = ['ohne', 'militaer', 'wirtschaft', 'verteidigung'], ARME = arg('arme', '0,10,20,30,40').split(','), REGELN = Object.fromEntries(arg('regeln', '').split(',').filter(Boolean).map(x => x.split('=')));       // --regeln ohne=30,militaer=20,…: der Arm mit dem Anteil der Bot-Regel dient als Arm „regel“
const lade = (bot, arm) => { const f = `reports/${PREFIX}-${CAND}-${bot}-b${arm}.json`; return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).roh.filter(r => r.profile === PROFILE) : null; };
const pc = x => x == null ? '–' : `${Math.round(100 * x)} %`, f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ','), f2 = x => x == null ? '–' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const K = {}, roh = {};
for (const b of BOTS){ K[b] = {}; roh[b] = {}; for (const a of [...ARME, 'regel']){ const rs = lade(b, a === 'regel' && REGELN[b] ? REGELN[b] : a); if (rs){ roh[b][a] = rs; K[b][a] = feldKennzahlen(rs); } } }
const ok = (x, t) => (x ? '✓' : '✗') + ' ' + t;
const rows = [], out = { cand: CAND, kriterien: {} };
const add = (name, wert, erfuellt, ziel) => { rows.push([name, ziel, wert, erfuellt ? '✓' : '✗']); out.kriterien[name] = { wert, erfuellt }; };

/* Elastizität ab Stufe 10: Budget 30 % gegenüber 0 %, gepaart nach Seed und Stufe (Bot ohne Kategorie) und gepoolt */
{
  const a0 = roh.ohne['0'], a30 = roh.ohne['30'];
  if (a0 && a30){
    const m0 = new Map(a0.map(r => [r.seed, r])), diffs = [];
    for (const r of a30){ const q = m0.get(r.seed); if (!q) continue; for (let n = 10; n <= 20; n++){ const x = abstandBei(r, n), y = abstandBei(q, n); if (x != null && y != null && y > 0) diffs.push((x - y) / y); } }
    const pool = K.ohne['30'].abstandAb10 && K.ohne['0'].abstandAb10 ? (K.ohne['30'].abstandAb10 - K.ohne['0'].abstandAb10) / K.ohne['0'].abstandAb10 : null, gep = median(diffs);
    add('Elastizität ab Stufe 10 (30 % gegen 0 %)', `gepaart ${gep == null ? '–' : Math.round(100 * gep) + ' %'} (${diffs.length} Paare), gepoolt ${pool == null ? '–' : Math.round(100 * pool) + ' %'}`, gep != null && gep <= -0.3, '≤ −30 %');
  }
}
if (K.ohne['0']) add('Grundlinie Budget 0 %: Wahlen (ohne Kategorie)', K.ohne['0'].wahlen, K.ohne['0'].wahlen >= 9 && K.ohne['0'].wahlen <= 11, '9–11');
if (K.ohne.regel) add('Korridor mit Regel: Wahlen · Dauer (ohne Kategorie)', `${K.ohne.regel.wahlen} · ${mm(K.ohne.regel.dauer)}`, K.ohne.regel.wahlen >= 12 && K.ohne.regel.wahlen <= 16 && K.ohne.regel.dauer >= 780 && K.ohne.regel.dauer <= 1020, '12–16 · 13–17 min');
/* Optimum: höchste Siegquote, bei Gleichstand kürzeste Dauer */
const opt = {};
for (const b of BOTS){
  const arme = ARME.filter(a => K[b][a]); if (!arme.length) continue;
  arme.sort((x, y) => (K[b][y].siege - K[b][x].siege) || (K[b][x].dauer - K[b][y].dauer));
  opt[b] = arme[0];
  const innen = opt[b] !== ARME[0] && opt[b] !== ARME[ARME.length - 1];
  add(`Optimum im Inneren, ${b}`, `${opt[b]} % (Siege ${pc(K[b][opt[b]].siege)}, Dauer ${mm(K[b][opt[b]].dauer)})`, innen, `> 0 % und < ${ARME[ARME.length - 1]} %`);
}
if (opt.wirtschaft && opt.militaer) add('Strategieabhängigkeit: Optimum Wirtschaft > Militär', `${opt.wirtschaft} % gegen ${opt.militaer} %`, Number(opt.wirtschaft) > Number(opt.militaer), 'Wirtschaft höher');
for (const b of BOTS) if (opt[b] && K[b]['0']) add(`Alternative, keine Pflicht, ${b}`, `${f1(100 * (K[b][opt[b]].siege - K[b]['0'].siege))} pp`, K[b][opt[b]].siege - K[b]['0'].siege <= 0.10 + 1e-9, 'Abstand ≤ 10 pp');
for (const b of BOTS) if (opt[b]) add(`Mindestabstand bindet beim Optimum, ${b}`, pc(K[b][opt[b]].gebremst), K[b][opt[b]].gebremst <= 0.15, '≤ 15 %');
/* Rückstau und Takt über alle vier Bots mit ihrer Regel */
{
  const alle = BOTS.flatMap(b => roh[b].regel || []);
  if (alle.length){
    const k = feldKennzahlen(alle);
    add('Rückstau: Partien mit höchstens einer offenen Wahl', pc(k.rueck1), k.rueck1 >= 0.9, '≥ 90 %');
    add('Rückstau: größter Wert', k.rueckMax, k.rueckMax <= 2, '≤ 2');
    const cvs = alle.map(r => { const ts = (r.wahlen || []).map(w => w.t), d = []; for (let i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1]); if (d.length < 3) return null; const m = d.reduce((a, b) => a + b, 0) / d.length; return Math.sqrt(d.reduce((a, b) => a + (b - m) ** 2, 0) / d.length) / m; }).filter(x => x != null);
    add('Takt: Variationskoeffizient (Median)', f2(median(cvs)), median(cvs) >= 0.25, '≥ 0,25');
  }
}
if (K.wirtschaft.regel) add('Siegquote Wirtschafts-Bot (Regel)', pc(K.wirtschaft.regel.siege), K.wirtschaft.regel.siege >= 0.92, '≥ 92 %');
let md = '| Kriterium | Ziel | Messwert | |\n|---|---|---|---|\n' + rows.map(r => `| ${r.join(' | ')} |`).join('\n') + '\n';
md += '\n| Bot | ' + [...ARME, 'regel'].map(a => a === 'regel' ? 'Regel' : a + ' %').join(' | ') + ' |\n|---|' + [...ARME, 'regel'].map(() => '---|').join('') + '\n';
for (const b of BOTS) md += `| ${b} (Siege · Dauer · Wahlen · gebremst) | ` + [...ARME, 'regel'].map(a => K[b][a] ? `${pc(K[b][a].siege)} · ${mm(K[b][a].dauer)} · ${K[b][a].wahlen} · ${pc(K[b][a].gebremst)}` : '–').join(' | ') + ' |\n';

/* Abstand bis zur nächsten Wahl je Stufe, Bot ohne Kategorie (Median; Partien in Klammern): zeigt, wo das Budget wirkt und wo der Mindestabstand deckelt */
{
  const arme = ARME.filter(a => roh.ohne[a]);
  if (arme.length){
    md += '\nAbstand bis zur nächsten Wahl je Stufe (Bot ohne Kategorie, Median in s, Partien in Klammern)\n\n| Stufe | ' + arme.map(a => a + ' %').join(' | ') + ' |\n|---|' + arme.map(() => '---|').join('') + '\n';
    for (let n = 2; n <= 12; n++) md += `| ${n} | ` + arme.map(a => { const v = roh.ohne[a].map(r => abstandBei(r, n)).filter(x => x != null); return v.length ? `${f1(median(v))} (${v.length})` : '–'; }).join(' | ') + ' |\n';
  }
}

/* Zeitpunkt der Wahl n (Erscheinen, Median in s): die Wirkung des Budgets als Zeit bis zur Stufe n */
{
  const arme = ARME.filter(a => roh.ohne[a]);
  if (arme.length){
    md += '\nZeitpunkt der Wahl n (Bot ohne Kategorie, Median in s, Partien in Klammern)\n\n| Wahl | ' + arme.map(a => a + ' %').join(' | ') + ' |\n|---|' + arme.map(() => '---|').join('') + '\n';
    for (let n = 1; n <= 12; n++) md += `| ${n} | ` + arme.map(a => { const v = roh.ohne[a].map(r => { const w = (r.wahlen || []).find(x => x.n === n); return w ? w.t : null; }).filter(x => x != null); return v.length ? `${Math.round(median(v))} (${v.length})` : '–'; }).join(' | ') + ' |\n';
  }
}
console.log(md);
if (arg('md')) writeFileSync(arg('md'), md);
if (arg('json')) writeFileSync(arg('json'), JSON.stringify({ ...out, opt, kennzahlen: K }, null, 1));

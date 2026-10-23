// Klammerfront – Übersicht aller Kalibrierkandidaten von Teil 12 (REQ-K12.05): liest die Rohdaten reports/kartenpfad12-kal*-<kandidat>-<bot>-b<n>.json.
// Aufruf: node tools/kandidaten-k12.mjs [--md datei]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { feldKennzahlen } from './k12-kennzahlen.mjs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
// [Runde, Präfix, Name, E0, g, Kurs, basisFaktor Normal]
const K = [
  [1, 'kal1', 'e150g112k20', 150, 1.12, 0.2, 9.5], [1, 'kal1', 'e150g112k80', 150, 1.12, 0.8, 9.5], [1, 'kal1', 'e150g120k40', 150, 1.2, 0.4, 9.5], [1, 'kal1', 'e250g120k40', 250, 1.2, 0.4, 9.5], [1, 'kal1', 'e250g120k80', 250, 1.2, 0.8, 9.5],
  [2, 'kal2', 'e200g120k100', 200, 1.2, 1.0, 9.5], [2, 'kal2', 'e280g120k100', 280, 1.2, 1.0, 9.5], [2, 'kal2', 'e350g120k100', 350, 1.2, 1.0, 9.5],
  [3, 'kal3', 'c3a', 280, 1.2, 1.0, 10.5], [4, 'kal4', 'c4a', 250, 1.2, 0.45, 11.5], [4, 'kal4', 'c4c', 250, 1.2, 0.7, 11], [5, 'kal5', 'c5a', 250, 1.2, 0.7, 10.5],
  [5, 'kal5', 'd1', 150, 1.3, 0.7, 10.5], [5, 'kal5', 'd2', 100, 1.33, 0.7, 10], [6, 'kal6', 'd3', 120, 1.3, 1.0, 10.5], [6, 'kal6', 'd4', 150, 1.3, 1.0, 11], [7, 'kal9', 'd5', 125, 1.3, 0.7, 10.5], [7, 'kal9', 'd6', 140, 1.27, 0.7, 10.5],
];
const lade = (pre, c, bot, b) => { const f = `reports/kartenpfad12-${pre}-${c}-${bot}-b${b}.json`; return existsSync(f) ? feldKennzahlen(JSON.parse(readFileSync(f, 'utf8')).roh.filter(r => r.profile === 'durchschnitt')) : null; };
const pc = x => x == null ? '–' : `${Math.round(100 * x)} %`;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f2 = x => String(x).replace('.', ',');
let md = '| Runde | Kandidat | E0 | g | Kurs | basisFaktor | ohne 0 %: Wahlen | ohne 30 %: Wahlen · Dauer · gebremst · Rückstau ≤ 1 | Wirtschaft 30 %: Wahlen · gebremst · Rückstau ≤ 1 · Siege |\n|---|---|---|---|---|---|---|---|---|\n';
for (const [r, pre, c, e0, g, k, bf] of K){
  const a = lade(pre, c, 'ohne', 0), b = lade(pre, c, 'ohne', 30), w = lade(pre, c, 'wirtschaft', 30);
  md += `| ${r} | ${c} | ${e0} | ${f2(g)} | ${f2(k)} | ${f2(bf)} | ${a ? a.wahlen : '–'} | ${b ? `${b.wahlen} · ${mm(b.dauer)} · ${pc(b.gebremst)} · ${pc(b.rueck1)}` : '–'} | ${w ? `${w.wahlen} · ${pc(w.gebremst)} · ${pc(w.rueck1)} · ${pc(w.siege)}` : '–'} |\n`;
}
console.log(md);
if (arg('md')) writeFileSync(arg('md'), md);

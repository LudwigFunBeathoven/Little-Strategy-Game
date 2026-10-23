// Klammerfront – mittleres Budget je Bot und Spielminute bei der Budgetregel (Teil 12, REQ-K12.06): liest die Messreihe von tools/kalib-k12.mjs (Arm mit dem Anteil der Regel).
// Aufruf: node tools/budgetphase-k12.mjs --prefix kartenpfad12-regel --cand d5 --regeln ohne=40,militaer=20,wirtschaft=30,verteidigung=30
//   Die Phasen des Spiels (früh, mitte, spät) hängen an der Referenzkurve und liegen in den ersten Minuten; deshalb Zeitabschnitte der Partie.
import { readFileSync, existsSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad12-regel'), CAND = arg('cand', 'd5'), REGELN = Object.fromEntries(arg('regeln', '').split(',').filter(Boolean).map(x => x.split('=')));
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const ABSCHNITTE = [[0, 3], [3, 6], [6, 9], [9, 12], [12, 99]];
let md = '| Bot | Anteil der Regel | ' + ABSCHNITTE.map(([a, b]) => b > 90 ? `ab Minute ${a}` : `Minute ${a}–${b}`).join(' | ') + ' |\n|---|---|' + ABSCHNITTE.map(() => '---|').join('') + '\n';
for (const [bot, pct] of Object.entries(REGELN)){
  const f = `reports/${PREFIX}-${CAND}-${bot}-b${pct}.json`; if (!existsSync(f)) continue;
  const rs = JSON.parse(readFileSync(f, 'utf8')).roh.filter(r => r.profile === 'durchschnitt' && r.budgetMin);
  const cell = ([a, b]) => { const v = rs.map(r => { const x = r.budgetMin.slice(a, b).filter(y => y != null); return x.length ? mean(x) : null; }).filter(y => y != null); return v.length ? `${Math.round(1000 * mean(v)) / 10} % (${v.length})` : '–'; };
  md += `| ${bot} | ${pct} % | ${ABSCHNITTE.map(cell).join(' | ')} |\n`;
}
console.log(md);

// Klammerfront – Messreihe Kartenpfad Teil 12 (REQ-K12.01, K12.05): ruft tools/sim-p5.mjs mit festen Budgetanteilen (--budget) je Bot auf; Rohdaten unter reports/<prefix>-<bot>-b<n>.{txt,json}.
// Aufruf: node tools/messung-k12.mjs [--prefix kartenpfad12-basis] [--bots ohne,militaer,wirtschaft,verteidigung] [--budgets 0,10,20,30,40] [--regel ja] [--runs 50] [--profile durchschnitt] [--diff normal] [--root <Verzeichnis des Codes>] [--druck aus|hoch]
//   Je Bot ein Lauf je Budget (-b<n>) und ein Lauf mit der Regel des Bots (-regel, wenn --regel ja). Bot „ohne“ = ohne Kategorie.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad12-basis'), RUNS = arg('runs', '50'), ROOT = resolve(arg('root', '.')), OUT = resolve(arg('out', 'reports')), DIFF = arg('diff', 'normal'), PROF = arg('profile', 'durchschnitt'), DRUCK = arg('druck', 'aus');
const BOTS = arg('bots', 'ohne,militaer,wirtschaft,verteidigung').split(','), BUDGETS = arg('budgets', '0,10,20,30,40').split(',').filter(Boolean), REGEL = arg('regel', 'ja') === 'ja';
mkdirSync(OUT, { recursive: true });
const run = (name, args) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [`${ROOT}/tools/sim-p5.mjs`, '--suite', 'felder', '--runs', RUNS, '--diffs', DIFF, '--profiles', PROF, '--druck', DRUCK, ...args, '--json', `${OUT}/${PREFIX}-${name}.json`], { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT, env: process.env });
  writeFileSync(`${OUT}/${PREFIX}-${name}.txt`, (r.stdout || '') + (r.stderr ? '\n' + r.stderr : ''));
  process.stderr.write(`${name}: ${Math.round((Date.now() - t0) / 1000)} s, Status ${r.status}\n`);
};
for (const bot of BOTS){
  const kat = bot === 'ohne' ? [] : ['--kat', bot];
  for (const b of BUDGETS) run(`${bot}-b${b}`, [...kat, '--budget', b]);
  if (REGEL) run(`${bot}-regel`, kat);
}

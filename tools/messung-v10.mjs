// Klammerfront – Messreihe Kartenpfad Teil 10 und 11 (REQ-K10.04, K10.05, K10.07, K11.04): ruft tools/sim-p5.mjs nacheinander auf und legt Text und Rohdaten unter reports/<prefix>-<name>.{txt,json} ab.
// Aufruf: node tools/messung-v10.mjs [--set kat|ohne|alle] [--runs 50] [--prefix kartenpfad10-basis] [--druck-kat verteidigung,militaer,wirtschaft] [--root <Verzeichnis des Codes>]
//   kat   Kategorie-Bots (Militär, Wirtschaft, Verteidigung), Normal, alle Profile, ohne Druck; Verteidigungs-Bot zusätzlich mit ?druck=hoch
//   ohne  Bot ohne Kategorie: alle Felder ohne Druck, Normal und Schwer mit ?druck=hoch
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const SET = arg('set', 'alle'), RUNS = arg('runs', '50'), PREFIX = arg('prefix', 'kartenpfad10'), ROOT = resolve(arg('root', '.')), OUT = resolve(arg('out', 'reports'));
const DRUCK_KAT = arg('druck-kat', 'verteidigung').split(',').filter(Boolean);
mkdirSync(OUT, { recursive: true });
const run = (name, args) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [`${ROOT}/tools/sim-p5.mjs`, ...args, '--json', `${OUT}/${PREFIX}-${name}.json`], { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT, env: process.env });
  writeFileSync(`${OUT}/${PREFIX}-${name}.txt`, (r.stdout || '') + (r.stderr ? '\n' + r.stderr : ''));
  process.stderr.write(`${name}: ${Math.round((Date.now() - t0) / 1000)} s, Status ${r.status}\n`);
};
const P = 'aktiv,durchschnitt,gelegentlich';
if (SET === 'kat' || SET === 'alle')
  for (const kat of ['militaer', 'wirtschaft', 'verteidigung']){
    run(`kat-${kat}-druck-aus`, ['--suite', 'felder', '--runs', RUNS, '--diffs', 'normal', '--profiles', P, '--kat', kat, '--druck', 'aus']);
    if (DRUCK_KAT.includes(kat)) run(`kat-${kat}-druck-hoch`, ['--suite', 'felder', '--runs', RUNS, '--diffs', 'normal', '--profiles', P, '--kat', kat, '--druck', 'hoch']);
  }
if (SET === 'ohne' || SET === 'alle'){
  run('felder-ohne-kat', ['--suite', 'felder', '--runs', RUNS]);
  run('felder-ohne-kat-druck-hoch', ['--suite', 'felder', '--runs', RUNS, '--diffs', 'normal,schwer', '--druck', 'hoch']);
}

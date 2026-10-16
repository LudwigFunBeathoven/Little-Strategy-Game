// Klammerfront – Messreihe Kartenpfad Teil 6 (REQ-K6.08): ruft tools/sim-p5.mjs nacheinander auf und legt Text und Rohdaten unter reports/kartenpfad6-<name>.{txt,json} ab.
// Aufruf: node tools/messung-p6.mjs [--set kategorien|ohne|doktrin|alle] [--runs 50] [--doktrinRuns 100] [--prefix kartenpfad6]
//   kategorien  Kategorie-Bots (Militär, Wirtschaft, Verteidigung), Normal und Schwer, ohne und mit druck=hoch, Profil durchschnitt
//   ohne        Bot ohne Kategorie, alle Grade und Profile, ohne und mit druck=hoch (Normal, Schwer)
//   doktrin     Paarvergleich der Doktrinen (Normal, durchschnitt), danach Schwer
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const SET = arg('set', 'alle'), RUNS = arg('runs', '50'), DRUNS = arg('doktrinRuns', '100'), PREFIX = arg('prefix', 'kartenpfad6');
mkdirSync('reports', { recursive: true });
const run = (name, args) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['tools/sim-p5.mjs', ...args, '--json', `reports/${PREFIX}-${name}.json`], { encoding: 'utf8', maxBuffer: 1 << 28 });
  writeFileSync(`reports/${PREFIX}-${name}.txt`, (r.stdout || '') + (r.stderr ? '\n' + r.stderr : ''));
  process.stderr.write(`${name}: ${Math.round((Date.now() - t0) / 1000)} s, Status ${r.status}\n`);
};
if (SET === 'kategorien' || SET === 'alle')
  for (const druck of ['aus', 'hoch']) for (const kat of ['militaer', 'wirtschaft', 'verteidigung'])
    run(`kat-${kat}-druck-${druck}`, ['--suite', 'felder', '--runs', RUNS, '--diffs', 'normal,schwer', '--profiles', 'aktiv,durchschnitt,gelegentlich', '--kat', kat, '--druck', druck]);
if (SET === 'ohne' || SET === 'alle'){
  run('felder-ohne-kat', ['--suite', 'felder', '--runs', RUNS]);
  run('felder-ohne-kat-druck-hoch', ['--suite', 'felder', '--runs', RUNS, '--diffs', 'normal,schwer', '--druck', 'hoch']);
}
if (SET === 'doktrin' || SET === 'alle'){
  run('doktrin-normal', ['--suite', 'doktrin', '--doktrinRuns', DRUNS]);
  run('doktrin-schwer', ['--suite', 'doktrin', '--doktrinRuns', DRUNS, '--doktrinDiff', 'schwer']);
}

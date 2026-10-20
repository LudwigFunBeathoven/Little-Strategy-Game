// Klammerfront – Kalibrierschritt Teil 8 (REQ-K8.02): Normal/durchschnitt für die drei Kategorie-Bots und den Bot ohne Kategorie, Dateien wie die Messreihe (Auswertung: tools/basis-p8.mjs --prefix <name>).
// Aufruf: node tools/kalibrierung-p8.mjs <name> [--runs 50] [--druck aus|hoch] [--gegnerfern aus] [--diff normal] [--profile durchschnitt]; Wertesätze per KF_OVERRIDE
import { spawnSync } from 'node:child_process';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const NAME = process.argv[2], GF = arg('gegnerfern', 'an'), RUNS = arg('runs', 50), DRUCK = arg('druck', 'aus'), DIFF = arg('diff', 'normal'), PROF = arg('profile', 'durchschnitt');
if (!NAME) { console.error('Aufruf: node tools/kalibrierung-p8.mjs <name>'); process.exit(1); }
for (const kat of ['militaer', 'wirtschaft', 'verteidigung', null]){
  const f = kat ? `kat-${kat}-druck-${DRUCK === 'hoch' ? 'hoch' : 'aus'}` : 'felder-ohne-kat' + (DRUCK === 'hoch' ? '-druck-hoch' : '');
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['tools/sim-p5.mjs', '--suite', 'felder', '--runs', RUNS, '--diffs', DIFF, '--profiles', PROF, ...(kat ? ['--kat', kat] : []), '--druck', DRUCK, '--gegnerfern', GF, '--json', `reports/${NAME}-${f}.json`], { encoding: 'utf8', maxBuffer: 1 << 28 });
  console.log(`${f}: ${Math.round((Date.now() - t0) / 1000)} s, Status ${r.status}`);
}

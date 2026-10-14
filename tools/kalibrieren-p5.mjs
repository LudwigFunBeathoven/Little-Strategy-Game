// Klammerfront – Kalibrierung für Kartenpfad Teil 5 (REQ-K5.03): mehrere Wertesätze nacheinander messen und die Zielgrößen nebeneinander zeigen.
// Aufruf:  node tools/kalibrieren-p5.mjs --runs 30 --sets '[{"name":"a","KARTEN":{"schwellen":{"wachstum":1.05}}}, …]' [--diffs normal] [--profiles durchschnitt,aktiv,gelegentlich]
//   Jeder Wertesatz ist ein KF_OVERRIDE (siehe tools/load-core.mjs, Name im Feld „name“). Ausgabe je Wertesatz und Feld: Siegquote, Dauer (Median), Wahlen (Median),
//   längste Lücke zwischen zwei Wahlen (Median, P90), Kennzahlen zu den Zielen aus REQ-K5.03: 12–16 Wahlen, Dauer 13–17 min, Lücke Median ≤ 120 s, P90 ≤ 180 s.
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const sets = JSON.parse(arg('sets', '[{"name":"Standard"}]')), runs = arg('runs', '30'), diffs = arg('diffs', 'normal'), profiles = arg('profiles', 'durchschnitt');
const extra = (arg('extra', '') || '').split(' ').filter(Boolean);
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
console.log('Satz | Grad | Profil | Siege | Dauer Median / P90 | Wahlen Median (Mittel) | Lücke Median / P90 s | Quellen Abschuss/Basis/Welle/Budget %');
for (const set of sets){
  const { name, ...override } = set, out = `/tmp/kal-p5-${process.pid}.json`;
  execFileSync('node', ['tools/sim-p5.mjs', '--suite', 'felder', '--runs', runs, '--diffs', diffs, '--profiles', profiles, '--json', out, ...extra],
    { env: { ...process.env, KF_OVERRIDE: JSON.stringify(override) }, stdio: ['ignore', 'ignore', 'ignore'] });
  const rep = JSON.parse(readFileSync(out, 'utf8')); unlinkSync(out);
  for (const f of rep.felder){
    const q = f.quellen || {}, p = v => v == null ? '–' : Math.round(100 * v);
    console.log(`${name} | ${f.diff} | ${f.profile} | ${f.siegquote} % | ${mm(f.dauerMedian)} / ${mm(f.dauerP90)} | ${f.wahlenMedian} (${f.wahlenMittel.toFixed(1)}) | ${Math.round(f.lueckeMedian)} / ${Math.round(f.lueckeP90)} | ${p(q.kill)}/${p(q.base)}/${p(q.wave)}/${p(q.budget)}`);
  }
}

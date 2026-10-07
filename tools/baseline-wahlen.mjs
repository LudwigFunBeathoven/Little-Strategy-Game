/* Basislinie der Kartenwahlen (REQ-KP.0): Zahl und Zeitpunkte der Kartenwahlen je Partie, je Profil und Strategie.
   Aufruf: node tools/baseline-wahlen.mjs [--runs 30] [--diff normal]   (Modus über KF_OVERRIDE='{"PACING_MODUS":"karten"}') */
import { playGame } from './sim-bot.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const runs = Number(arg('runs', 30)), diff = arg('diff', 'normal');
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const rows = [];
for (const strategy of ['gierig', 'einheiten-zuerst'])
  for (const profile of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const n = [], first = [], wins = [], times = [], dur = [];
    for (let i = 0; i < runs; i++){
      const r = playGame({ diff, seed: 1000 + i, profile, strategy });
      const dt = r.draftTimes.map(d => d.t);
      n.push(dt.length); if (dt.length) first.push(dt[0]);
      times.push(...dt.map(x => Math.round(x / 60 * 10) / 10)); dur.push(r.t / 60);
      wins.push(r.status === 'won' ? 1 : 0);
    }
    rows.push({ strategy, profile, wahlenMedian: med(n), ersteWahlS: Math.round(med(first)), siegquote: Math.round(100 * wins.reduce((a, b) => a + b, 0) / runs) + ' %', dauerMin: Math.round(med(dur) * 10) / 10, wahlMin: [...new Set(times)].length ? med(times) : null });
  }
console.table(rows);

/* Vergleichsbasis der Simulation (REQ-R.03): Siegquote, Median der Partiedauer und Zahl der Kartenwahlen je Feld (Schwierigkeit × Spielertyp × Strategie).
   Aufruf: node tools/vergleichsbasis.mjs [--runs 50] [--diff leicht,normal,schwer] [--profile aktiv,durchschnitt,gelegentlich,passiv] [--json datei]
   Gleiche Seeds in allen Feldern; Worker-Threads. */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => { const r = playGame(j); return { diff: j.diff, profile: j.profile, strategy: j.strategy, status: r.status, t: r.t, wahlen: r.draftTimes.length }; }));
} else {
  const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
  const RUNS = Number(arg('runs', 50)), DIFFS = arg('diff', 'leicht,normal,schwer').split(','), PROFILES = arg('profile', 'aktiv,durchschnitt,gelegentlich,passiv').split(',');
  const STRATS = ['gierig', 'einheiten-zuerst'];
  const jobs = [];
  DIFFS.forEach((diff, di) => PROFILES.forEach((profile, pi) => STRATS.forEach(strategy => {
    for (let r = 0; r < RUNS; r++) jobs.push({ diff, profile, strategy, seed: (1000 + r * 7919 + (di * 10 + pi) * 104729) >>> 0 });   // gleiche Seeds für beide Strategien
  })));
  const n = Math.max(1, Math.min(availableParallelism(), 8)), chunks = Array.from({ length: n }, () => []);
  jobs.forEach((j, i) => chunks[i % n].push(j));
  const res = (await Promise.all(chunks.map(c => new Promise((ok, no) => { const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } }); w.on('message', ok); w.on('error', no); })))).flat();
  const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const out = [];
  for (const diff of DIFFS) for (const profile of PROFILES) for (const strategy of STRATS){
    const rs = res.filter(r => r.diff === diff && r.profile === profile && r.strategy === strategy), won = rs.filter(r => r.status === 'won');
    out.push({ diff, profile, strategy, n: rs.length, siegquote: Math.round(1000 * won.length / rs.length) / 10, medianSiegMin: won.length ? Math.round(med(won.map(r => r.t)) / 6) / 10 : null,
               offen: rs.filter(r => r.status === 'running').length, wahlen: med(rs.map(r => r.wahlen)) });
  }
  console.log('Schwierigkeit | Spielertyp   | Strategie        | Siege % | Median Sieg (min) | offen | Wahlen (Median)');
  for (const o of out) console.log(`${o.diff.padEnd(13)} | ${o.profile.padEnd(12)} | ${o.strategy.padEnd(16)} | ${String(o.siegquote).padStart(7)} | ${String(o.medianSiegMin ?? '–').padStart(17)} | ${String(o.offen).padStart(5)} | ${o.wahlen}`);
  if (arg('json', null)) writeFileSync(arg('json'), JSON.stringify({ runs: RUNS, felder: out }, null, 1));
}

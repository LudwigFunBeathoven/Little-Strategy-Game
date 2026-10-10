// Klammerfront – Referenzlauf für den Wahl-Fahrplan des Branches „Kartenpfad“ (REQ-P.02).
// Aufruf:  node tools/referenzlauf.mjs [--runs 50] [--strategy einheiten-zuerst] [--profile durchschnitt] [--diff normal] [--pfad militaer] [--json reports/…json]
// Misst den EP-Stand (xpTotal) der Partien zu den Zielzeiten des Fahrplans (config.js, KARTEN.fahrplan.ziele, danach je takt Sekunden)
// und schlägt die Tabelle KARTEN.fahrplan.schwellen vor: Schritt n = Median-EP-Stand zur Zielzeit n minus Median-EP-Stand zur Zielzeit n−1
// (Median über die Partien, die zu dieser Zeit noch laufen). Schritte, zu denen weniger als MIN_ALIVE Partien laufen, werden mit dem letzten gesicherten Schritt fortgeschrieben.
// Der Fahrplan wird für diesen Bot eingestellt; Menschen erzeugen EP anders (Anforderung P, Abschnitt 5).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => { const r = playGame(j); return { seed: j.seed, status: r.status, t: r.t, xpAt: r.xpAt, wahlen: r.wahlen }; }));
} else {
  process.env.KF_PACING = 'karten';
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 50)), STRATEGY = arg('strategy', 'einheiten-zuerst'), PROFILE = arg('profile', 'durchschnitt'), DIFF = arg('diff', 'normal'), PFAD = arg('pfad', 'militaer');
  const COUNT = Number(arg('wahlen', 16)), MIN_ALIVE = Number(arg('minAlive', 10)), JSON_OUT = arg('json', null);
  const { loadCore } = await import('./load-core.mjs');
  const { KF_CONFIG: C } = loadCore();
  const f = C.KARTEN.fahrplan;
  const ziele = Array.from({ length: COUNT }, (_, i) => i < f.ziele.length ? f.ziele[i] : f.ziele[f.ziele.length - 1] + (i + 1 - f.ziele.length) * f.takt);
  const seedOf = r => (9000 + r * 7919) >>> 0;
  const jobs = Array.from({ length: RUNS }, (_, r) => ({ pacing: 'karten', diff: DIFF, profile: PROFILE, strategy: STRATEGY, pfad: PFAD, seed: seedOf(r), sampleXp: [0, ...ziele] }));
  const n = Math.max(1, Math.min(availableParallelism(), 8));
  const chunks = Array.from({ length: n }, () => []);
  jobs.forEach((j, i) => chunks[i % n].push(j));
  const results = (await Promise.all(chunks.filter(c => c.length).map(c => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } }); w.on('message', res); w.on('error', rej);
  })))).flat();

  const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const mm = t => `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const rows = [];
  let lastStep = null;
  for (let k = 0; k < COUNT; k++){
    // Schritt n: Median-EP-Stand zur Zielzeit n minus Median-EP-Stand zur Zielzeit n−1, beide über dieselben Partien (die bis Zielzeit n laufen);
    // ein Vergleich der Mediane verschiedener Gruppen ließe die Schritte springen, sobald schnelle Partien enden
    const alive = results.filter(r => r.xpAt[k + 1] != null);
    const cum = median(alive.map(r => r.xpAt[k + 1])), prev = median(alive.map(r => r.xpAt[k]));
    const medDiff = median(alive.map(r => r.xpAt[k + 1] - r.xpAt[k]));            // Ertrag je Partie im Abschnitt (zum Vergleich; stark von Wellenstößen abhängig)
    const stepB = alive.length >= MIN_ALIVE ? Math.max(1, Math.round(cum - prev)) : null;
    const step = stepB != null ? stepB : lastStep;
    if (stepB != null) lastStep = stepB;
    rows.push({ n: k + 1, ziel: ziele[k], alive: alive.length, medianStand: cum, medianErtrag: medDiff, schritt: step, fortgeschrieben: stepB == null });
  }
  console.log(`Referenzlauf: ${RUNS} Partien, ${STRATEGY}, ${PROFILE}, ${DIFF}, Pfad ${PFAD}; Siege ${results.filter(r => r.status === 'won').length}, offen ${results.filter(r => r.status === 'running').length}; Median Partieende ${mm(median(results.map(r => r.t)))}\n`);
  console.log('Wahl | Zielzeit | läuft noch | Median EP-Stand | Median Ertrag im Abschnitt | vorgeschlagener Schritt');
  for (const r of rows) console.log(`${String(r.n).padStart(4)} | ${mm(r.ziel).padStart(8)} | ${String(r.alive).padStart(10)} | ${String(r.medianStand == null ? '–' : Math.round(r.medianStand)).padStart(15)} | ${String(r.medianErtrag == null ? '–' : Math.round(r.medianErtrag)).padStart(26)} | ${String(r.schritt).padStart(8)}${r.fortgeschrieben ? ' (fortgeschrieben)' : ''}`);
  console.log(`\nschwellen: [${rows.map(r => r.schritt).join(', ')}],`);
  // Wahlzeiten, die der laufende Fahrplan in diesen Partien tatsächlich erzeugte (REQ-P.02): Median je Wahl gegen Zielzeit, Abstände, Zahl der Wahlen
  const q = (a, p) => { if (!a.length) return null; const s2 = [...a].sort((x, y) => x - y); return s2[Math.min(s2.length - 1, Math.floor(p * s2.length))]; };
  const wahlRows = [];
  console.log('\nWahl | Ziel  | Median | Abweichung | P10    | P90    | Partien');
  for (let k = 0; k < Math.min(COUNT, 12); k++){
    const ts = results.map(r => (r.wahlen || []).find(w => w.n === k + 1)).filter(Boolean).map(w => w.t);
    const m = median(ts);
    wahlRows.push({ n: k + 1, ziel: ziele[k], median: m, p10: q(ts, 0.1), p90: q(ts, 0.9), n_partien: ts.length });
    console.log(`${String(k + 1).padStart(4)} | ${mm(ziele[k])} | ${m == null ? '    –' : mm(m).padStart(6)} | ${m == null ? '        –' : ((m - ziele[k] >= 0 ? '+' : '') + Math.round(m - ziele[k]) + ' s').padStart(10)} | ${ts.length ? mm(q(ts, 0.1)).padStart(6) : '–'} | ${ts.length ? mm(q(ts, 0.9)).padStart(6) : '–'} | ${ts.length}`);
  }
  const gaps = [];
  for (const r of results){ const w = (r.wahlen || []).slice().sort((x, y) => x.n - y.n); for (let i = 1; i < w.length; i++) gaps.push(w[i].t - w[i - 1].t); }
  const inBand = gaps.filter(g => g >= f.minAbstand - 0.3 && g <= C.KARTEN.maxAbstand + 0.3).length;
  console.log(`\nAbstände: ${gaps.length}, davon ${f.minAbstand}–${C.KARTEN.maxAbstand} s: ${(100 * inBand / Math.max(1, gaps.length)).toFixed(1)} %, Median ${Math.round(median(gaps))} s, P10 ${Math.round(q(gaps, 0.1))} s, P90 ${Math.round(q(gaps, 0.9))} s`);
  console.log(`Wahlen je Partie: Median ${median(results.map(r => (r.wahlen || []).length))}; Partiedauer: Median ${mm(median(results.map(r => r.t)))}, P90 ${mm(q(results.map(r => r.t), 0.9))}`);
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ runs: RUNS, strategy: STRATEGY, profile: PROFILE, diff: DIFF, pfad: PFAD, ziele, rows, schwellen: rows.map(r => r.schritt), wahlRows }, null, 2));
}

// Klammerfront – Kalibrierung des Wahl-Fahrplans (REQ-P.02): KARTEN.fahrplan.schwellen aus Referenzläufen.
// Aufruf:  node tools/fahrplan-kalibrieren.mjs [--runs 50] [--iter 3] [--max 100] [--apply] [--json reports/…json]
//          [--strategy einheiten-zuerst] [--profile durchschnitt] [--diff normal] [--pfad militaer] [--wahlen 14]
// Ablauf je Durchgang: (1) Partien mit den aktuellen Schwellen spielen und den EP-Stand jede Sekunde festhalten, die tatsächlichen Wahlzeiten messen;
// (2) die Schwellen neu bestimmen: für Wahl n die kleinste kumulierte EP-Schwelle, bei der die Hälfte der Partien (Median) die Wahl zur Zielzeit n erreicht –
// gerechnet mit denselben Regeln wie das Spiel (Mindestabstand, Höchstabstand, freie Wahlen verschieben den Index der Tabelle), über die aufgezeichneten EP-Verläufe.
// Partien, die die Wahl nicht mehr erreichen (Sieg vorher), zählen als „später als jede Zielzeit“. EP-Verläufe hängen schwach von den Schwellen ab (andere Karten, anderes Tempo);
// darum mehrere Durchgänge. --apply schreibt die Tabelle in config.js. Der Fahrplan wird für diesen Bot eingestellt (Anforderung P, Abschnitt 5).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';

const GRID = 1500;                                                          // EP-Verlauf: jede Sekunde bis Minute 25

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  const times = Array.from({ length: GRID }, (_, i) => i + 1);
  parentPort.postMessage(workerData.jobs.map(j => {
    const r = playGame({ ...j, sampleXp: times });
    return { seed: j.seed, status: r.status, t: r.t, xp: r.xpAt.filter(x => x != null), wahlen: r.wahlen || [] };
  }));
} else {
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const has = name => process.argv.includes('--' + name);
  const RUNS = Number(arg('runs', 50)), ITER = Number(arg('iter', 3)), STRATEGY = arg('strategy', 'einheiten-zuerst'), PROFILE = arg('profile', 'durchschnitt');
  const DIFF = arg('diff', 'normal'), PFAD = arg('pfad', 'militaer'), N = Number(arg('wahlen', 14)), JSON_OUT = arg('json', null);
  process.env.KF_PACING = 'karten';
  const { loadCore } = await import('./load-core.mjs');
  const base = loadCore().KF_CONFIG.KARTEN, f0 = base.fahrplan;
  const MAXG = Number(arg('max', base.maxAbstand)), MING = Number(arg('min', f0.minAbstand));
  const X1 = arg('x1', null) == null ? null : Number(arg('x1'));
  const RESERVE = Number(arg('reserve', 5)), MODUS = arg('modus', 'median'), Q = Number(arg('q', 1));          // obergrenze: Q = Quantil (1 = Maximum)
  const ZF = Number(arg('zielfaktor', 1));                                    // Zielzeiten der Kalibrierung × Faktor (z. B. 0,9 für „aktiv“: 10 % früher)
  const zielFahrplan = Array.from({ length: N }, (_, i) => i < f0.ziele.length ? f0.ziele[i] : f0.ziele[f0.ziele.length - 1] + (i + 1 - f0.ziele.length) * f0.takt);
  const ziele = zielFahrplan.map(z => z * ZF);
  const seedOf = r => (9000 + r * 7919) >>> 0;
  const PROFILES = PROFILE.split(',');                                        // mehrere Profile: die Partien beider Profile gehen gemeinsam in die Kalibrierung
  const jobs = PROFILES.flatMap(profile => Array.from({ length: RUNS }, (_, r) => ({ pacing: 'karten', diff: DIFF, profile, strategy: STRATEGY, pfad: PFAD, seed: seedOf(r) })));
  const n = Math.max(1, Math.min(availableParallelism(), 8));

  const play = async steps => {
    const o = process.env.KF_OVERRIDE ? JSON.parse(process.env.KF_OVERRIDE) : {};              // Versuchswerte von außen (z. B. KARTEN.basisFaktor) bleiben erhalten
    o.KARTEN = { ...(o.KARTEN || {}), maxAbstand: MAXG, fahrplan: { ...((o.KARTEN || {}).fahrplan || {}), minAbstand: MING, schwellen: steps } };
    const env = { ...process.env, KF_OVERRIDE: JSON.stringify(o) };
    const chunks = Array.from({ length: n }, () => []);
    jobs.forEach((j, i) => chunks[i % n].push(j));
    return (await Promise.all(chunks.filter(c => c.length).map(c => new Promise((res, rej) => {
      const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c }, env }); w.on('message', res); w.on('error', rej);
    })))).flat();
  };

  const cmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;                              // Infinity-sicher
  const median = a => { if (!a.length) return null; const s = [...a].sort(cmp); return s[Math.floor(s.length / 2)]; };
  const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const qn = (a, p) => { if (!a.length) return null; const s = [...a].sort(cmp); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

  /* Wiedergabe der Wahlregeln über einen EP-Verlauf: Zeiten der Wahlen 1..N (Infinity = nicht mehr erreicht) */
  const cumOf = steps => m => { let s = 0; for (let k = 1; k <= m; k++) s += steps[Math.min(k, steps.length) - 1]; return s; };
  function replay(game, cumFn){
    const D = []; let last = 0, free = 0;
    for (let k = 1; k <= N; k++){
      const need = cumFn(k - free);
      let c = 0; if (need > 0){ c = Infinity; const xp = game.xp; let lo = 0, hi = xp.length - 1; if (xp[hi] >= need){ while (lo < hi){ const mid = (lo + hi) >> 1; if (xp[mid] >= need) hi = mid; else lo = mid + 1; } c = lo + 1; } }
      const minT = k === 1 ? 0 : last + MING;                               // vor der ersten Wahl kein Mindestabstand
      const due = Math.max(Math.min(zielFahrplan[k - 1], last + MAXG), minT);   // Zielzeit, Höchstabstand, Mindestabstand (wie dueTime() im Spiel)
      const ep = Math.max(c, minT);
      let d;
      if (ep <= due) d = ep; else { d = due; free++; }
      if (d > game.t) { for (let j = k; j <= N; j++) D.push(Infinity); break; }
      D.push(d); last = d;
    }
    return D;
  }
  /* neue kumulierte Schwellen: für Wahl k die kleinste, bei der der Median (alle Partien, Infinity = nie) die Zielzeit trifft */
  function calibrate(games, stepsNow){
    const X = [];                                                            // X[k-1] = kumulierte Schwelle der Wahl k
    const maxXp = Math.max(...games.map(g => g.xp[g.xp.length - 1] || 0)) + 1;
    for (let k = 1; k <= N; k++){
      const prev = k > 1 ? X[k - 2] : 0;
      if (k === 1 && X1 != null){ X.push(X1); continue; }                    // feste erste Schwelle (Schwer: die erste Karte muss vor der ersten großen Welle kommen)
      const medianAt = x => {
        const cum = m => m <= 0 ? 0 : m < k ? X[m - 1] : x + (m - k) * 0;  // Index > k bleibt hier ohne Bedeutung (Wiedergabe endet bei Wahl k)
        const Ds = games.map(g => replay(g, cum)[k - 1]);
        return median(Ds.map(d => d)) ;
      };
      let lo = prev + 1, hi = maxXp;
      if (medianAt(lo) >= ziele[k - 1]){ X.push(lo); continue; }             // schon die kleinste Schwelle kommt zu spät oder gerade recht
      for (let it = 0; it < 40 && hi - lo > 0.5; it++){ const mid = (lo + hi) / 2; if (medianAt(mid) < ziele[k - 1]) lo = mid; else hi = mid; }
      const a = lo, b = hi, ea = Math.abs(medianAt(a) - ziele[k - 1]), eb = Number.isFinite(medianAt(b)) ? Math.abs(medianAt(b) - ziele[k - 1]) : Infinity;
      X.push(Math.round(ea <= eb ? a : b));
    }
    const steps = X.map((x, i) => Math.max(1, Math.round(x - (i ? X[i - 1] : 0))));
    return steps;
  }
  /* Modus „obergrenze“: Schwelle der Wahl n = größter EP-Stand aller Referenzpartien zur Zielzeit n (+ Reserve). Kein Bot erreicht sie vor der Zielzeit; die Zeit (Höchstabstand)
     bestimmt den Takt, die EP belohnen nur Spiel, das über das Referenzniveau hinausgeht (Mindestabstand begrenzt den Vorsprung). Wahl 1 bleibt bei --x1. */
  function obergrenze(games){
    const X = [];
    for (let k = 1; k <= N; k++){
      if (k === 1 && X1 != null){ X.push(X1); continue; }
      const idx = Math.max(0, Math.round(zielFahrplan[k - 1]) - 1);
      const xs = games.filter(g => g.xp.length > idx).map(g => g.xp[idx]);
      const best = Q >= 1 ? Math.max(0, ...xs) : (qn(xs, Q) || 0);
      X.push(Math.max((X[k - 2] || 0) + 1, Math.ceil((best + RESERVE) / 5) * 5));
    }
    return X.map((x, i) => Math.max(1, x - (i ? X[i - 1] : 0)));
  }
  function report(games, label){
    console.log(`\n== ${label}: ${games.length} Partien, Siege ${games.filter(g => g.status === 'won').length}, Partiedauer Median ${mm(median(games.map(g => g.t)))}, P90 ${mm(qn(games.map(g => g.t), 0.9))}`);
    console.log('Wahl | Ziel  | Median | Abw.   | P10    | P90    | erreicht');
    const rows = [];
    for (let k = 0; k < N; k++){
      const ts = games.map(g => (g.wahlen.find(w => w.n === k + 1) || {}).t).filter(x => x != null);
      const m = median(ts);
      rows.push({ n: k + 1, ziel: ziele[k], median: m, p10: qn(ts, 0.1), p90: qn(ts, 0.9), erreicht: ts.length });
      console.log(`${String(k + 1).padStart(4)} | ${mm(ziele[k]).padStart(5)} | ${mm(m).padStart(6)} | ${m == null ? '     –' : ((m - ziele[k] >= 0 ? '+' : '') + Math.round(m - ziele[k]) + ' s').padStart(6)} | ${mm(qn(ts, 0.1)).padStart(6)} | ${mm(qn(ts, 0.9)).padStart(6)} | ${ts.length}`);
    }
    const gaps = [];
    for (const g of games){ const w = g.wahlen.slice().sort((a, b) => a.n - b.n); for (let i = 1; i < w.length; i++) gaps.push(w[i].t - w[i - 1].t); }
    const inBand = gaps.filter(x => x >= MING - 0.3 && x <= MAXG + 0.3).length;
    const counts = games.map(g => g.wahlen.length);
    console.log(`Abstände ${MING}–${MAXG} s: ${(100 * inBand / Math.max(1, gaps.length)).toFixed(1)} % von ${gaps.length}; Median ${Math.round(median(gaps))} s; Wahlen je Partie: Median ${median(counts)}`);
    return { rows, gapShare: inBand / Math.max(1, gaps.length), medianCount: median(counts), dauerMedian: median(games.map(g => g.t)), dauerP90: qn(games.map(g => g.t), 0.9), siege: games.filter(g => g.status === 'won').length };
  }

  let steps = arg('steps', null) ? JSON.parse(arg('steps')) : f0.schwellen.slice();
  let last = null;
  if (ITER === 0) last = report(await play(steps), `Messung mit Schritten [${steps.join(', ')}]`);
  for (let it = 1; it <= ITER; it++){
    const games = await play(steps);
    last = report(games, `Durchgang ${it} mit Schritten [${steps.join(', ')}]`);
    const next = MODUS === 'obergrenze' ? obergrenze(games) : calibrate(games, steps);
    // Vorhersage der Wiedergabe für die neuen Schritte (ohne neue Partien)
    const pred = games.map(g => replay(g, cumOf(next)));
    console.log(`Neue Schritte: [${next.join(', ')}]`);
    console.log('Vorhersage Median: ' + Array.from({ length: N }, (_, k) => mm(median(pred.map(d => d[k])))).join(' '));
    steps = next;
    if (it === ITER){ const games2 = await play(steps); last = report(games2, `Prüfung mit Schritten [${steps.join(', ')}]`); }
  }
  console.log(`\nschwellen: [${steps.join(', ')}],`);
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ runs: RUNS, strategy: STRATEGY, profile: PROFILE, diff: DIFF, pfad: PFAD, maxAbstand: MAXG, minAbstand: MING, ziele, schwellen: steps, ergebnis: last }, null, 2));
  if (has('apply')){
    const src = readFileSync(new URL('../config.js', import.meta.url), 'utf8');
    const out = src.replace(/(schwellen: )\[[^\]]*\](,)/, `$1[${steps.join(', ')}]$2`);
    if (out === src) console.log('config.js unverändert (Zeile nicht gefunden)'); else { writeFileSync(new URL('../config.js', import.meta.url), out); console.log('config.js aktualisiert'); }
  }
}

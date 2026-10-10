// Klammerfront – Messung für Kartenpfad Teil 4 (REQ-S.09).
// Aufruf:  node tools/sim-p4.mjs --suite basis [--runs 50] [--gierigRuns 20] [--json reports/kartenpfad4-basis.json]
//   basis  Ausgangslage vor allen Änderungen von Teil 4: Fabrikanteil im Raster (Minute 2/5/10), seltene und legendäre Karten je Partie
//          (angeboten, gewählt), verlorene Mauer-Lebenspunkte je Partie, Siegquoten und Wahlzeiten; 3 Grade × 3 Profile (schneller Bot), dazu „gierig“ (Normal, durchschnitt)
// Gleiche Seeds in allen Feldern. Die Simulation misst Stärke, nicht Spielspaß.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

const SLIM = r => ({ diff: r.diff, profile: r.profile, strategy: r.strategy, seed: r.seed, status: r.status, t: r.t, picks: r.picks, builtAt: r.builtAt, built: r.built,
  freeChoices: r.freeChoices, wahlen: r.wahlen || [], offers: r.offers, grid: r.grid, wallLost: r.wallLost, cards: r.cards, maxArmy: r.maxArmy });

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => Object.assign(SLIM(playGame(j)), { suite: j.suite, variant: j.variant })));
} else {
  process.env.KF_PACING = 'karten';
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 50)), GRUNS = Number(arg('gierigRuns', 20)), SUITE = arg('suite', 'basis'), JSON_OUT = arg('json', null), EZ = arg('strategy', 'einheiten-zuerst');
  const seedOf = (k, r) => (5000 + r * 7919 + k * 104729) >>> 0;
  const { loadCore } = await import('./load-core.mjs');
  const core = loadCore(), C = core.KF_CONFIG;
  const rarity = Object.fromEntries(core.KF_DRAFT_OPTIONS.map(o => [o.id, o.rarity || 'common']));
  const DIFFS = ['leicht', 'normal', 'schwer'], PROFILES = ['aktiv', 'durchschnitt', 'gelegentlich'];
  const base = { pacing: 'karten' };
  const jobs = [];
  if (SUITE === 'basis'){
    for (const diff of DIFFS) for (const profile of PROFILES) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'felder', diff, profile, strategy: EZ, pfad: 'militaer', variant: 'militaer', seed: seedOf(2, r) });
    for (let r = 0; r < GRUNS; r++)
      jobs.push({ ...base, suite: 'gierig', diff: 'normal', profile: 'durchschnitt', strategy: 'gierig', pfad: 'militaer', variant: 'militaer', seed: seedOf(3, r) });
  }
  const n = Math.max(1, Math.min(availableParallelism(), 8));
  const sorted = jobs.map((j, i) => ({ j, i })).sort((a, b) => (b.j.strategy === 'gierig') - (a.j.strategy === 'gierig'));
  const chunks = Array.from({ length: n }, () => []);
  sorted.forEach((x, i) => chunks[i % n].push(x.j));
  const t0 = Date.now();
  const results = (await Promise.all(chunks.filter(c => c.length).map(c => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } }); w.on('message', res); w.on('error', rej);
  })))).flat();
  process.stderr.write(`fertig in ${Math.round((Date.now() - t0) / 1000)} s, ${results.length} Partien\n\n`);

  const cmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;
  const median = a => { if (!a.length) return null; const s = [...a].sort(cmp); return s[Math.floor(s.length / 2)]; };
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const pc = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
  const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1);

  /* Kennzahlen einer Gruppe von Partien */
  const stat = rs => {
    const won = rs.filter(r => r.status === 'won');
    const gridAt = t => rs.map(r => r.grid && r.grid[t]).filter(Boolean);
    const fab = t => gridAt(t).map(g => g.types.fabrik || 0);
    const share = t => gridAt(t).filter(g => g.total > 0).map(g => (g.types.fabrik || 0) / g.total);
    const rareOf = (r, rar, chosen) => (r.offers || []).filter(o => rarity[o.id] === rar && (!chosen || o.chosen)).length;
    const bigGames = rs.filter(r => r.status !== 'running');
    return { n: rs.length, siegquote: pc(won.length, rs.length), niederlagen: pc(rs.filter(r => r.status === 'lost').length, rs.length), patt: pc(rs.filter(r => r.status === 'running').length, rs.length),
      siegMedian: median(won.map(r => r.t)), dauerMedian: median(rs.map(r => r.t)), wahlenMedian: median(rs.map(r => r.wahlen.length)),
      fabrikenMedian: { 120: median(fab(120)), 300: median(fab(300)), 600: median(fab(600)) },
      fabrikenMittel: { 120: mean(fab(120)), 300: mean(fab(300)), 600: mean(fab(600)) },
      fabrikAnteilGebaeude: { 120: mean(share(120)), 300: mean(share(300)), 600: mean(share(600)) },
      fabrikAnteilRaster: { 120: mean(fab(120)) / 9, 300: mean(fab(300)) / 9, 600: mean(fab(600)) / 9 },
      partienMitMinute: { 120: gridAt(120).length, 300: gridAt(300).length, 600: gridAt(600).length },
      seltenAngeboten: median(rs.map(r => rareOf(r, 'rare', false))), legendaerAngeboten: median(rs.map(r => rareOf(r, 'legendary', false))),
      seltenGewaehlt: median(rs.map(r => rareOf(r, 'rare', true))), legendaerGewaehlt: median(rs.map(r => rareOf(r, 'legendary', true))),
      seltenAngebotenMittel: mean(rs.map(r => rareOf(r, 'rare', false))), legendaerAngebotenMittel: mean(rs.map(r => rareOf(r, 'legendary', false))),
      seltenGewaehltMittel: mean(rs.map(r => rareOf(r, 'rare', true))), legendaerGewaehltMittel: mean(rs.map(r => rareOf(r, 'legendary', true))),
      mauerVerlustMedian: median(rs.map(r => r.wallLost)), mauerVerlustMittel: mean(rs.map(r => r.wallLost)), mauerVerlustSiege: median(won.map(r => r.wallLost)),
      angebote: bigGames.length };
  };
  const report = { suite: SUITE, runs: RUNS, gierigRuns: GRUNS, felder: [], gierig: null, seltenheit: Object.fromEntries(Object.entries(rarity).filter(([, v]) => v !== 'common')) };

  console.log(`BASISMESSUNG Teil 4 (${EZ}, ${RUNS} Partien je Feld, Modus karten, vor allen Änderungen)\n`);
  console.log('Grad    | Profil       | Siege | Nied. | Dauer | Fabriken Min 2/5/10 (Median) | Anteil an Gebäuden Min 10 | selten ang./gew. | legendär ang./gew. | Mauer-Verlust (Median)');
  for (const diff of DIFFS) for (const profile of PROFILES){
    const rs = results.filter(r => r.suite === 'felder' && r.diff === diff && r.profile === profile), s = stat(rs);
    report.felder.push({ diff, profile, ...s });
    console.log(`${diff.padEnd(7)} | ${profile.padEnd(12)} | ${String(s.siegquote).padStart(4)}% | ${String(s.niederlagen).padStart(4)}% | ${mm(s.dauerMedian).padStart(5)} | ${[120, 300, 600].map(t => `${s.fabrikenMedian[t] ?? '–'}`).join('/').padEnd(28)} | ${s.fabrikAnteilGebaeude[600] == null ? '–' : (100 * s.fabrikAnteilGebaeude[600]).toFixed(0) + ' %'}`.padEnd(104)
      + ` | ${f1(s.seltenAngeboten)}/${f1(s.seltenGewaehlt)}`.padEnd(19) + ` | ${f1(s.legendaerAngeboten)}/${f1(s.legendaerGewaehlt)}`.padEnd(21) + ` | ${s.mauerVerlustMedian}`);
  }
  const g = results.filter(r => r.suite === 'gierig');
  if (g.length){ report.gierig = stat(g);
    console.log(`\ngierig (Normal, durchschnitt, ${g.length} Partien): Siege ${report.gierig.siegquote} %, Fabriken Min 2/5/10 ${[120, 300, 600].map(t => report.gierig.fabrikenMedian[t] ?? '–').join('/')}, selten ${f1(report.gierig.seltenAngeboten)}/${f1(report.gierig.seltenGewaehlt)}, legendär ${f1(report.gierig.legendaerAngeboten)}/${f1(report.gierig.legendaerGewaehlt)}, Mauer-Verlust ${report.gierig.mauerVerlustMedian}`);
  }
  const nd = report.felder.filter(f => f.diff === 'normal' && f.profile === 'durchschnitt')[0];
  console.log(`\nNormal/durchschnitt: Fabriken im Mittel Min 2/5/10: ${[120, 300, 600].map(t => f1(nd.fabrikenMittel[t])).join(' / ')} von 9 Plätzen`);
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ...report, roh: results.map(r => ({ suite: r.suite, diff: r.diff, profile: r.profile, strategy: r.strategy, variant: r.variant, seed: r.seed, status: r.status, t: Math.round(r.t * 10) / 10, grid: r.grid, wallLost: r.wallLost, built: r.built, picks: r.picks, offers: r.offers, wahlen: r.wahlen && r.wahlen.map(w => ({ n: w.n, t: Math.round(w.t) })) })) }));
}

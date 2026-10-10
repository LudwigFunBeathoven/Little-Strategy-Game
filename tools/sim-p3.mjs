// Klammerfront – Messung für Kartenpfad Teil 3 (REQ-P.06): Wahlzeiten, Abstände, Partiedauer, Siegquoten, Pfad-Varianten, Wahlraten der Karten.
// Aufruf:  node tools/sim-p3.mjs [--runs 50] [--suite felder|varianten|gierig|bonus|alle] [--json reports/kartenpfad3-nach.json] [--strategy einheiten-zuerst]
//   felder     Leicht/Normal/Schwer × aktiv/durchschnitt/gelegentlich mit dem schnellen Bot („einheiten-zuerst“)
//   varianten  die drei Pfad-Varianten (militaer, wissen, festung) auf Normal, Profil durchschnitt
//   bonus      Bewertung der angebotenen Bonuskarten durch Vorausschau (45 s) in Partien von „einheiten-zuerst“, Normal, durchschnitt (Inventar REQ-P.05)
//   gierig     Bot mit Vorausschau („gierig“), Normal: durchschnitt mit allen drei Varianten, gelegentlich nur militaer, je --gierigRuns (30) Partien; aktiv braucht je Partie über drei Minuten und entfällt
// Gleiche Seeds in allen Feldern. Die Simulation misst Stärke, nicht Spielspaß.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

// Pfadkarten der Familien Bau und Technologie (für die Verteilung der ersten und zweiten Pfadkarte)
const G_PATH = new Set(['echtesMilitaer', 'pfadFestungsbau', 'metallverarbeitung', 'gelehrte', 'handel', 'fortgeschritteneTaktiken', 'ballistik', 'eiserneKlingen', 'befestigungskunde']);
const SLIM = r => ({ diff: r.diff, profile: r.profile, strategy: r.strategy, seed: r.seed, status: r.status, t: r.t, picks: r.picks, builtAt: r.builtAt,
  freeChoices: r.freeChoices, wahlen: r.wahlen || [], offers: r.offers, scan: r.scan, built: r.built, maxArmy: r.maxArmy, cards: r.cards });

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => Object.assign(SLIM(playGame(j)), { suite: j.suite, variant: j.variant })));
} else {
  process.env.KF_PACING = 'karten';
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 50)), GRUNS = Number(arg('gierigRuns', 30)), SUITE = arg('suite', 'alle'), JSON_OUT = arg('json', null), EZ = arg('strategy', 'einheiten-zuerst');
  const seedOf = (k, r) => (5000 + r * 7919 + k * 104729) >>> 0;
  const { loadCore } = await import('./load-core.mjs');
  const core = loadCore(), C = core.KF_CONFIG, F = C.KARTEN.fahrplan;
  const ZIELE = Array.from({ length: 14 }, (_, i) => i < F.ziele.length ? F.ziele[i] : F.ziele[F.ziele.length - 1] + (i + 1 - F.ziele.length) * F.takt);
  const DIFFS = ['leicht', 'normal', 'schwer'], PROFILES = ['aktiv', 'durchschnitt', 'gelegentlich'], VARIANTS = ['militaer', 'wissen', 'festung'];
  const base = { pacing: 'karten' };
  const jobs = [];
  if (SUITE === 'alle' || SUITE === 'felder')
    for (const diff of DIFFS) for (const profile of PROFILES) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'felder', diff, profile, strategy: EZ, pfad: 'militaer', variant: 'militaer', seed: seedOf(2, r) });
  if (SUITE === 'alle' || SUITE === 'varianten')
    for (const variant of VARIANTS) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'varianten', diff: 'normal', profile: 'durchschnitt', strategy: EZ, pfad: variant, variant, seed: seedOf(1, r) });
  if (SUITE === 'alle' || SUITE === 'gierig')
    for (const [profile, variants] of [['durchschnitt', VARIANTS], ['gelegentlich', ['militaer']]]) for (const variant of variants) for (let r = 0; r < GRUNS; r++)
      jobs.push({ ...base, suite: 'gierig', diff: 'normal', profile, strategy: 'gierig', pfad: variant, variant, seed: seedOf(3, r) });

  if (SUITE === 'bonus')
    for (let r = 0; r < RUNS; r++) jobs.push({ ...base, suite: 'bonus', diff: 'normal', profile: 'durchschnitt', strategy: EZ, pfad: 'militaer', variant: 'militaer', seed: seedOf(4, r), bonusScan: 45 });
  const n = Math.max(1, Math.min(availableParallelism(), 8));
  const sorted = jobs.map((j, i) => ({ j, i })).sort((a, b) => (b.j.strategy === 'gierig') - (a.j.strategy === 'gierig'));     // langsame zuerst: bessere Auslastung
  const chunks = Array.from({ length: n }, () => []);
  sorted.forEach((x, i) => chunks[i % n].push(x.j));
  const t0 = Date.now();
  const results = (await Promise.all(chunks.filter(c => c.length).map(c => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } }); w.on('message', res); w.on('error', rej);
  })))).flat();
  process.stderr.write(`fertig in ${Math.round((Date.now() - t0) / 1000)} s, ${results.length} Partien\n\n`);

  const cmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;
  const median = a => { if (!a.length) return null; const s = [...a].sort(cmp); return s[Math.floor(s.length / 2)]; };
  const qn = (a, p) => { if (!a.length) return null; const s = [...a].sort(cmp); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const pc = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;

  /* Kennzahlen einer Gruppe von Partien */
  const stat = rs => {
    const won = rs.filter(r => r.status === 'won'), open = rs.filter(r => r.status === 'running');
    const gaps = [];
    for (const r of rs){ const w = r.wahlen.slice().sort((a, b) => a.n - b.n); for (let i = 1; i < w.length; i++) gaps.push(w[i].t - w[i - 1].t); }
    const inBand = gaps.filter(g => g >= F.minAbstand - 0.3 && g <= C.KARTEN.maxAbstand + 0.3).length;
    const wahl = ZIELE.slice(0, 12).map((z, k) => {
      const ts = rs.map(r => (r.wahlen.find(w => w.n === k + 1) || {}).t).filter(x => x != null);
      return { n: k + 1, ziel: z, median: median(ts), p10: qn(ts, 0.1), p90: qn(ts, 0.9), partien: ts.length };
    });
    const built = type => rs.map(r => r.builtAt && r.builtAt[type]).filter(x => x != null);
    return { n: rs.length, siegquote: pc(won.length, rs.length), niederlagen: pc(rs.filter(r => r.status === 'lost').length, rs.length), patt: pc(open.length, rs.length),
      dauerMedian: median(rs.map(r => r.t)), dauerP90: qn(rs.map(r => r.t), 0.9), siegMedian: median(won.map(r => r.t)), siegP90: qn(won.map(r => r.t), 0.9),
      wahlenMedian: median(rs.map(r => r.wahlen.length)), freieWahlen: median(rs.map(r => r.freeChoices || 0)), abstandAnteil: gaps.length ? inBand / gaps.length : null, abstandMedian: median(gaps), abstandAnzahl: gaps.length,
      wahl, kaserneS: median(built('kaserne')), schmiedeS: median(built('schmiede')), universitaetS: median(built('universitaet')),
      kaserneAnteil: pc(built('kaserne').length, rs.length), schmiedeAnteil: pc(built('schmiede').length, rs.length), universitaetAnteil: pc(built('universitaet').length, rs.length) };
  };
  const report = { pfadIds: core.KF_PFAD.karten.map(k => k.id), runs: RUNS, ziele: ZIELE, fahrplan: F, maxAbstand: C.KARTEN.maxAbstand, basisFaktor: C.KARTEN.basisFaktor, felder: [], varianten: [], gierig: [], karten: {} };

  if (SUITE === 'alle' || SUITE === 'felder'){
    console.log(`FELDER (${EZ}, ${RUNS} Partien je Feld)\n`);
    console.log('Grad    | Profil       | Siege | Nied. | offen | Dauer Median | P90   | Wahlen | Abstände 45–65 s | Wahl 5 Median (Ziel 5:55) | Wahl 10 Median (Ziel 11:20)');
    for (const diff of DIFFS) for (const profile of PROFILES){
      const rs = results.filter(r => r.suite === 'felder' && r.diff === diff && r.profile === profile), s = stat(rs);
      report.felder.push({ diff, profile, ...s });
      console.log(`${diff.padEnd(7)} | ${profile.padEnd(12)} | ${String(s.siegquote).padStart(4)}% | ${String(s.niederlagen).padStart(4)}% | ${String(s.patt).padStart(4)}% | ${mm(s.dauerMedian).padStart(12)} | ${mm(s.dauerP90).padStart(5)} | ${String(s.wahlenMedian).padStart(6)} | ${s.abstandAnteil == null ? '–' : (100 * s.abstandAnteil).toFixed(1) + ' %'}`.padEnd(100) + ` | ${mm(s.wahl[4].median).padStart(6)} (${s.wahl[4].partien}) | ${mm(s.wahl[9].median).padStart(6)} (${s.wahl[9].partien})`);
    }
    console.log('\nWahlzeiten je Feld (Median; Ziel in Klammern)');
    console.log('Feld'.padEnd(26) + ZIELE.slice(0, 11).map((z, k) => `W${k + 1} ${mm(z)}`.padStart(11)).join(''));
    for (const f of report.felder) console.log(`${f.diff}/${f.profile}`.padEnd(26) + f.wahl.slice(0, 11).map(w => mm(w.median).padStart(11)).join(''));
  }
  if (SUITE === 'alle' || SUITE === 'varianten'){
    console.log(`\nPFAD-VARIANTEN (Normal, durchschnitt, ${EZ}, ${RUNS} Partien je Variante)\n`);
    console.log('Variante  | Siege | Dauer Median | Wahlen | Kaserne | Schmiede | Universität | 1. Pfadkarte (Anteil) | 2. Pfadkarte (Anteil)');
    for (const variant of VARIANTS){
      const rs = results.filter(r => r.suite === 'varianten' && r.variant === variant), s = stat(rs);
      const firsts = {}, seconds = {};
      for (const r of rs){ const pathPicks = (r.picks || []).filter(p => G_PATH.has(p.id)); if (pathPicks[0]) firsts[pathPicks[0].id] = (firsts[pathPicks[0].id] || 0) + 1; if (pathPicks[1]) seconds[pathPicks[1].id] = (seconds[pathPicks[1].id] || 0) + 1; }
      const fmtDist = d => Object.entries(d).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(100 * v / rs.length)} %`).join(', ');
      report.varianten.push({ variant, ...s, erste: firsts, zweite: seconds });
      console.log(`${variant.padEnd(9)} | ${String(s.siegquote).padStart(4)}% | ${mm(s.dauerMedian).padStart(12)} | ${String(s.wahlenMedian).padStart(6)} | ${mm(s.kaserneS).padStart(7)} | ${mm(s.schmiedeS).padStart(8)} | ${mm(s.universitaetS).padStart(11)} | ${fmtDist(firsts)} | ${fmtDist(seconds)}`);
    }
    const q = report.varianten.map(v => v.siegquote);
    report.variantenSpannweite = Math.max(...q) - Math.min(...q);
    console.log(`Spannweite der Siegquoten: ${report.variantenSpannweite.toFixed(1)} pp (Soll ≤ 15)`);
  }
  if (SUITE === 'alle' || SUITE === 'gierig'){
    console.log(`\nGIERIG (Normal, ${RUNS} Partien je Profil und Variante)\n`);
    for (const profile of ['durchschnitt', 'gelegentlich']){
      const rs = results.filter(r => r.suite === 'gierig' && r.profile === profile), s = stat(rs);
      report.gierig.push({ profile, ...s });
      console.log(`${profile.padEnd(12)} | Siege ${s.siegquote} % | Dauer Median ${mm(s.dauerMedian)} P90 ${mm(s.dauerP90)} | Wahlen ${s.wahlenMedian} | Wahl 5 ${mm(s.wahl[4].median)} Wahl 10 ${mm(s.wahl[9].median)} (${s.wahl[9].partien}) | Abstände ${s.abstandAnteil == null ? '–' : (100 * s.abstandAnteil).toFixed(1) + ' %'}`);
    }
    for (const v of VARIANTS){
      const rs = results.filter(r => r.suite === 'gierig' && r.variant === v && r.profile === 'durchschnitt');
      console.log(`  ${v.padEnd(9)} durchschnitt: Siege ${pc(rs.filter(r => r.status === 'won').length, rs.length)} %`);
    }
  }

  if (SUITE === 'bonus'){
    const m = {};
    for (const r of results) for (const e of r.scan || []){
      const ids = Object.keys(e.sc), mean = ids.reduce((a, id) => a + e.sc[id], 0) / ids.length, best = ids.reduce((a, id) => e.sc[id] > e.sc[a] ? id : a, ids[0]);
      for (const id of ids){ const x = m[id] || (m[id] = { angeboten: 0, vergleiche: 0, bester: 0, vorsprung: 0 }); x.angeboten++; if (ids.length >= 2){ x.vergleiche++; x.vorsprung += e.sc[id] - mean; if (id === best) x.bester++; } }
    }
    report.bonus = m;
    console.log(`BONUSKARTEN – Bewertung durch Vorausschau (45 s), ${RUNS} Partien Normal/durchschnitt\n`);
    console.log('Karte                  | angeboten | in Vergleichen (≥ 2 Bonuskarten) | beste Bonuskarte | Anteil | mittlerer Vorsprung');
    for (const [id, x] of Object.entries(m).sort((a, b) => (a[1].bester / Math.max(1, a[1].vergleiche)) - (b[1].bester / Math.max(1, b[1].vergleiche))))
      console.log(`${id.padEnd(22)} | ${String(x.angeboten).padStart(9)} | ${String(x.vergleiche).padStart(32)} | ${String(x.bester).padStart(16)} | ${(100 * x.bester / Math.max(1, x.vergleiche)).toFixed(0).padStart(5)} % | ${(x.vorsprung / Math.max(1, x.vergleiche)).toFixed(1).padStart(8)}`);
  }

  /* Wahlraten der Karten (Anteil der Angebote, in denen die Karte gewählt wurde), Bonus- und Technologiekarten */
  const rate = rs => {
    const m = {};
    for (const r of rs) for (const o of r.offers || []){ const e = m[o.id] || (m[o.id] = { angeboten: 0, gewaehlt: 0 }); e.angeboten++; if (o.chosen) e.gewaehlt++; }
    return m;
  };
  report.karten.ez = rate(results.filter(r => r.strategy === EZ && r.diff === 'normal'));
  report.karten.gierig = rate(results.filter(r => r.strategy === 'gierig'));
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ...report, roh: results.map(r => ({ suite: r.suite, diff: r.diff, profile: r.profile, strategy: r.strategy, variant: r.variant, seed: r.seed, status: r.status, t: Math.round(r.t * 10) / 10, wahlen: r.wahlen, picks: r.picks, builtAt: r.builtAt, freeChoices: r.freeChoices })) }));
}

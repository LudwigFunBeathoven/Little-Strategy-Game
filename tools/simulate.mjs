// Klammerfront – Balancing-Simulation (7.1)
// Aufruf:  node tools/simulate.mjs [--runs 20] [--suite alle|ziele|strategie|phasen] [--diff leicht,normal] [--json ergebnis.json]
//   ziele      Siegquote und Dauer je Schwierigkeitsgrad und Spielertyp (gierige Heuristik)
//   strategie  Zufall gegen gierige Heuristik: Gebäudewahl, Gebäudekombinationen, Draft-Wahlraten, Draft-Abstände
//   phasen     REQ-03: Klickanteil je Phase (SIM_CLICK_RATE) sowie Dauerklick / Stopp ab Phase Spät / nie klicken
//   ohneSchmiede  REQ-17: Normal, durchschnitt, gierige Heuristik ohne Schmiede (Soll: Siegquote ≥ 30 %)
//   --profile aktiv,durchschnitt   nur diese Spielertypen (Suite ziele)
//   kurz       Kurzsimulation nach Anhang A: Normal, Spielertyp durchschnitt, gierige Heuristik (Soll: 0 offen, Siegquote 20–100 %)
// Die Simulation misst Stärke, nicht Spielspaß. Auffälligkeiten werden berichtet, nicht automatisch wegbalanciert.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => Object.assign(playGame(j), { suite: j.suite })));
} else {
  const { loadCore } = await import('./load-core.mjs');
  const { KF_CONFIG: C } = loadCore();
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 20));
  const SUITE = arg('suite', 'alle');
  const JSON_OUT = arg('json', null);
  const DIFFS = SUITE === 'kurz' || SUITE === 'ohneSchmiede' ? ['normal'] : arg('diff', null) ? arg('diff').split(',') : C.DIFFICULTY_ORDER;
  const CPS = C.SIM_CLICK_RATE ?? 6;
  const PROFILE_FILTER = arg('profile', null) ? arg('profile').split(',') : null;

  const jobs = [];
  const seedOf = (k, r) => (1000 + r * 7919 + k * 104729) >>> 0;
  if (SUITE === 'alle' || SUITE === 'ziele')
    DIFFS.forEach((diff, di) => ['aktiv', 'durchschnitt', 'gelegentlich', 'passiv'].forEach((profile, pi) => {
      if (PROFILE_FILTER && !PROFILE_FILTER.includes(profile)) return;
      for (let r = 0; r < RUNS; r++) jobs.push({ suite: 'ziele', diff, profile, strategy: 'gierig', seed: seedOf(di * 10 + pi, r) });
    }));
  if (SUITE === 'ohneSchmiede')
    for (let r = 0; r < RUNS; r++) jobs.push({ suite: 'ziele', diff: 'normal', profile: 'durchschnitt', strategy: 'gierig', forbid: ['schmiede'], seed: seedOf(3, r) });
  if (SUITE === 'kurz')
    for (let r = 0; r < RUNS; r++) jobs.push({ suite: 'ziele', diff: 'normal', profile: 'durchschnitt', strategy: 'gierig', seed: seedOf(1, r) });
  if (SUITE === 'alle' || SUITE === 'strategie')
    DIFFS.forEach((diff, di) => ['zufall', 'gierig'].forEach((strategy, si) => {
      for (let r = 0; r < RUNS; r++) jobs.push({ suite: 'strategie', diff, profile: 'durchschnitt', strategy, seed: seedOf(100 + di * 10 + si, r) });
    }));
  if (SUITE === 'alle' || SUITE === 'phasen')
    DIFFS.forEach((diff, di) => ['always', 'stopLate', 'never'].forEach((clickPolicy, ci) => {
      for (let r = 0; r < RUNS; r++) jobs.push({ suite: 'phasen', diff, profile: 'aktiv', strategy: 'gierig', clickPolicy, cps: CPS, seed: seedOf(200 + di * 10 + ci, r) });
    }));

  const n = Math.max(1, Math.min(availableParallelism(), 8));
  const chunks = Array.from({ length: n }, () => []);
  jobs.forEach((j, i) => chunks[i % n].push(j));
  const t0 = Date.now();
  process.stderr.write(`${jobs.length} Partien auf ${n} Kernen …\n`);
  const results = (await Promise.all(chunks.map(c => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } });
    w.on('message', res); w.on('error', rej);
  })))).flat();
  process.stderr.write(`fertig in ${Math.round((Date.now() - t0) / 1000)} s\n\n`);

  const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const mmss = t => t == null ? '–' : `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
  const pct = (a, b) => b ? Math.round(100 * a / b) + ' %' : '–';
  const pad = (s, w) => String(s).padEnd(w);
  const lpad = (s, w) => String(s).padStart(w);
  const report = {};

  const Z = results.filter(r => r.suite === 'ziele');
  if (Z.length){
    console.log('ZIELE – Siegquote und Dauer (gierige Heuristik)\n');
    console.log('Schwierigkeit | Spielertyp   | Siege | Niederl. | offen | Median Sieg | Median Niederlage');
    report.ziele = [];
    for (const diff of DIFFS) for (const p of ['aktiv', 'durchschnitt', 'gelegentlich', 'passiv']){
      const R = Z.filter(r => r.diff === diff && r.profile === p);
      if (!R.length) continue;
      const w = R.filter(r => r.status === 'won'), l = R.filter(r => r.status === 'lost'), o = R.filter(r => r.status === 'running');
      report.ziele.push({ diff, profile: p, games: R.length, won: w.length, lost: l.length, open: o.length, medWin: median(w.map(r => r.t)), medLoss: median(l.map(r => r.t)) });
      console.log(`${pad(diff, 13)} | ${pad(p, 12)} | ${lpad(w.length, 5)} | ${lpad(l.length, 8)} | ${lpad(o.length, 5)} | ${lpad(mmss(median(w.map(r => r.t))), 11)} | ${lpad(mmss(median(l.map(r => r.t))), 10)}`);
    }
    console.log('');
  }

  const T = results.filter(r => r.suite === 'strategie');
  if (T.length){
    console.log('STRATEGIE – Zufall gegen gierige Heuristik (Spielertyp durchschnitt)\n');
    console.log('Schwierigkeit | Strategie | Siegquote | Median Sieg | Abrisse/Partie');
    report.strategie = [];
    for (const diff of DIFFS) for (const s of ['zufall', 'gierig']){
      const R = T.filter(r => r.diff === diff && r.strategy === s);
      const w = R.filter(r => r.status === 'won');
      const dem = R.reduce((a, r) => a + r.demolished, 0) / (R.length || 1);
      report.strategie.push({ diff, strategy: s, winRate: R.length ? w.length / R.length : null, medWin: median(w.map(r => r.t)), demolished: dem });
      console.log(`${pad(diff, 13)} | ${pad(s, 9)} | ${lpad(pct(w.length, R.length), 9)} | ${lpad(mmss(median(w.map(r => r.t))), 11)} | ${lpad(dem.toFixed(2), 8)}`);
    }
    console.log('\nWahlrate je Gebäudetyp (Anteil der Partien, in denen der Typ gebaut wurde)');
    console.log('Strategie | ' + C.BUILDINGS.map(t => pad(t, 12)).join(' | '));
    report.buildRates = {};
    for (const s of ['zufall', 'gierig']){
      const R = T.filter(r => r.strategy === s);
      report.buildRates[s] = Object.fromEntries(C.BUILDINGS.map(t => [t, R.length ? R.filter(r => r.built[t]).length / R.length : 0]));
      console.log(`${pad(s, 9)} | ` + C.BUILDINGS.map(t => pad(pct(R.filter(r => r.built[t]).length, R.length), 12)).join(' | '));
    }
    console.log('\nSiegquote je Gebäudekombination am Partieende (beide Strategien, alle Schwierigkeitsgrade, mind. 3 Partien)');
    const combos = {};
    for (const r of T) (combos[r.combo] ||= []).push(r);
    report.combos = {};
    Object.entries(combos).filter(([, R]) => R.length >= 3).sort((a, b) => b[1].length - a[1].length).forEach(([c, R]) => {
      report.combos[c] = { games: R.length, winRate: R.filter(r => r.status === 'won').length / R.length };
      console.log(`${pad(c, 40)} ${lpad(R.length, 4)} Partien  Siegquote ${lpad(pct(R.filter(r => r.status === 'won').length, R.length), 5)}`);
    });
    const G = T.filter(r => r.strategy === 'gierig');
    const offered = {}, picked = {};
    for (const r of G){
      for (const [k, v] of Object.entries(r.offered)) offered[k] = (offered[k] || 0) + v;
      for (const [k, v] of Object.entries(r.picked)) picked[k] = (picked[k] || 0) + v;
    }
    if (Object.keys(offered).length){
      console.log('\nDraft-Wahlrate je Option (gierige Heuristik; Soll 5–60 %)');
      report.pickRates = {};
      Object.keys(offered).sort().forEach(k => {
        const rate = (picked[k] || 0) / offered[k];
        report.pickRates[k] = { offered: offered[k], picked: picked[k] || 0, rate };
        const flag = rate < 0.05 || rate > 0.6 ? '  ← außerhalb' : '';
        console.log(`${pad(k, 20)} angeboten ${lpad(offered[k], 4)}  gewählt ${lpad(picked[k] || 0, 4)}  ${lpad(pct(picked[k] || 0, offered[k]), 5)}${flag}`);
      });
      console.log(`\nMedian-Abstand zwischen zwei Drafts je Phase (Soll ${C.DRAFT_INTERVAL_MIN_S}–${C.DRAFT_INTERVAL_MAX_S} s; beide Strategien)`);
      const gaps = { early: [], mid: [], late: [] }, first = [];
      for (const r of T){
        const d = r.draftTimes;
        if (d.length) first.push(d[0].t);
        // Abstand zählt zu der Phase, in der der Spieler zwischen beiden Drafts war (Stufe des vorigen Drafts)
        const phaseOf = lvl => lvl < C.PHASE_MID_LEVEL ? 'early' : lvl < C.PHASE_LATE_LEVEL ? 'mid' : 'late';
        for (let i = 1; i < d.length; i++) gaps[phaseOf(d[i - 1].level)].push(d[i].t - d[i - 1].t);
      }
      report.draftGaps = {};
      for (const ph of ['early', 'mid', 'late']){
        const m = median(gaps[ph]); report.draftGaps[ph] = m;
        const flag = m != null && (m < C.DRAFT_INTERVAL_MIN_S || m > C.DRAFT_INTERVAL_MAX_S) ? '  ← außerhalb' : '';
        console.log(`${pad(ph, 6)} ${lpad(m == null ? '–' : Math.round(m) + ' s', 7)}  (${gaps[ph].length} Abstände)${flag}`);
      }
      report.firstDraft = median(first);
      console.log(`Erster Draft (Median): ${Math.round(median(first) || 0)} s (Soll 60–90 s)`);
    }
    console.log('');
  }

  const P = results.filter(r => r.suite === 'phasen');
  if (P.length){
    console.log(`PHASEN – ${CPS} Klicks/s, gierige Heuristik, Spielertyp aktiv\n`);
    const withProd = P.filter(r => r.clickPolicy === 'always' && r.prod);
    if (withProd.length){
      console.log('Klickanteil an der Materialproduktion je Phase (Soll: Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %)');
      report.clickShare = {};
      for (const diff of DIFFS){
        const R = withProd.filter(r => r.diff === diff), row = {};
        for (const ph of ['early', 'mid', 'late']){
          const c = R.reduce((a, r) => a + (r.prod[ph]?.click || 0), 0), a = R.reduce((s, r) => s + (r.prod[ph]?.auto || 0), 0);
          row[ph] = c + a > 0 ? c / (c + a) : null;
        }
        report.clickShare[diff] = row;
        const f = v => v == null ? '–' : (v * 100).toFixed(1) + ' %';
        console.log(`${pad(diff, 8)} Früh ${lpad(f(row.early), 8)}  Mitte ${lpad(f(row.mid), 8)}  Spät ${lpad(f(row.late), 8)}`);
      }
      console.log('');
    }
    console.log('Siegquote nach Klickverhalten');
    console.log('Schwierigkeit | Dauerklick | Stopp ab Spät | nie klicken | Stopp/Dauer | nie/Dauer');
    report.clickPolicies = {};
    for (const diff of DIFFS){
      const q = pol => { const R = P.filter(r => r.diff === diff && r.clickPolicy === pol); return R.length ? R.filter(r => r.status === 'won').length / R.length : 0; };
      const a = q('always'), s = q('stopLate'), n0 = q('never');
      report.clickPolicies[diff] = { always: a, stopLate: s, never: n0 };
      console.log(`${pad(diff, 13)} | ${lpad((a * 100).toFixed(0) + ' %', 10)} | ${lpad((s * 100).toFixed(0) + ' %', 13)} | ${lpad((n0 * 100).toFixed(0) + ' %', 11)} | ${lpad(a ? (s / a * 100).toFixed(0) + ' %' : '–', 11)} | ${lpad(a ? (n0 / a * 100).toFixed(0) + ' %' : '–', 9)}`);
    }
    console.log('(Soll: Stopp/Dauer ≥ 95 %, nie/Dauer ≤ 50 %)\n');
  }
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ runs: RUNS, suite: SUITE, report }, null, 2));
}

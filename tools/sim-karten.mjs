// Klammerfront – Kurzsimulation des Branches „Kartenpfad“ (REQ-KP.09), Modus 'karten'.
// Aufruf:  node tools/sim-karten.mjs [--runs 50] [--suite alle|varianten|profile|paar] [--diff normal] [--json reports/kartenpfad-kurzsimulation.json]
//   varianten  Siegquote der drei Pfad-Varianten (militaer, wissen, festung), beide Strategien, Normal, Profil durchschnitt;
//              Kaserne bis Minute 6, Schmiede bis Minute 8, Zahl und Zeitpunkte der Kartenwahlen, Zeit von der Technologiekarte bis zur fertigen Einheit,
//              Wahlbreite je Karte (Anteil der Angebote, in denen sie gewählt wurde)
//   Optionen: --strategy gierig,einheiten-zuerst  --profiles aktiv,durchschnitt,gelegentlich
//   profile    Siegzeiten und Quoten je Spielertyp (aktiv, durchschnitt, gelegentlich), Partielänge (90. Perzentil), Patt-Quote
//   paar       Paarvergleich je Pfadkarte: gleicher Seed, Karte gesperrt (gebannt) gegen normal; Soll +3 … +25 pp
// Gleiche Seeds in allen Feldern. Die Simulation misst Stärke, nicht Spielspaß; Auffälligkeiten werden berichtet, nicht wegbalanciert.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync, mkdirSync } from 'node:fs';

const SLIM = r => ({ diff: r.diff, profile: r.profile, strategy: r.strategy, seed: r.seed, status: r.status, t: r.t, picks: r.picks, builtAt: r.builtAt, built: r.built,
  researchTimes: r.researchTimes, freeChoices: r.freeChoices, draftTimes: r.draftTimes, offered: r.offered, picked: r.picked, maxArmy: r.maxArmy, cards: r.cards });

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => Object.assign(SLIM(playGame(j)), { suite: j.suite, variant: j.variant, arm: j.arm, card: j.card })));
} else {
  process.env.KF_PACING = 'karten';
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 50)), SUITE = arg('suite', 'alle'), DIFF = arg('diff', 'normal'), JSON_OUT = arg('json', null);
  const STRATS = arg('strategy', 'gierig,einheiten-zuerst').split(','), VARIANTS = ['militaer', 'wissen', 'festung'];
  const PROFILES = arg('profiles', 'aktiv,durchschnitt,gelegentlich').split(',');       // „gierig“ mit Vorausschau braucht für „aktiv“ bis zu 2 Minuten je Partie: dafür --strategy einheiten-zuerst oder --profiles durchschnitt,gelegentlich
  const seedOf = (k, r) => (5000 + r * 7919 + k * 104729) >>> 0;
  const { loadCore } = await import('./load-core.mjs');
  const { KF_PFAD } = loadCore();
  const CARDS = KF_PFAD.karten.map(k => k.id);
  const jobs = [];
  const base = { pacing: 'karten', diff: DIFF };
  if (SUITE === 'alle' || SUITE === 'varianten')
    for (const strategy of STRATS) VARIANTS.forEach((variant, vi) => { for (let r = 0; r < RUNS; r++) jobs.push({ ...base, suite: 'varianten', profile: 'durchschnitt', strategy, pfad: variant, variant, seed: seedOf(1, r) }); });
  if (SUITE === 'alle' || SUITE === 'profile')
    for (const strategy of STRATS) for (const profile of PROFILES) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'profile', profile, strategy, pfad: 'militaer', variant: 'militaer', seed: seedOf(2, r) });
  if (SUITE === 'alle' || SUITE === 'paar')
    for (const strategy of STRATS) for (const card of CARDS) for (const arm of ['mit', 'ohne']) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'paar', profile: 'durchschnitt', strategy, pfad: 'militaer', variant: 'militaer', card, arm, banCards: arm === 'ohne' ? [card] : undefined, seed: seedOf(3, r) });

  const n = Math.max(1, Math.min(availableParallelism(), 8));
  const chunks = Array.from({ length: n }, () => []);
  jobs.forEach((j, i) => chunks[i % n].push(j));
  const t0 = Date.now();
  const results = (await Promise.all(chunks.filter(c => c.length).map(c => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: c } });
    w.on('message', res); w.on('error', rej);
  })))).flat();
  process.stderr.write(`fertig in ${Math.round((Date.now() - t0) / 1000)} s, ${results.length} Partien\n\n`);

  const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const q90 = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(0.9 * s.length) - 1)]; };
  const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const pc = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
  const pctS = v => v == null ? '–' : v.toFixed(0) + ' %';
  const TECH = ['fortgeschritteneTaktiken', 'ballistik', 'eiserneKlingen', 'befestigungskunde'];
  const UNIT_RES = { fortgeschritteneTaktiken: ['r_reiter', 'r_schild'], ballistik: ['r_armbrust', 'r_katapult'], eiserneKlingen: ['r_eisenwaffen'], befestigungskunde: ['r_mauerausbau3', 'r_turmausbau'] };
  const report = { runs: RUNS, diff: DIFF };

  /* Kennzahlen einer Gruppe von Partien */
  const stat = rs => {
    const won = rs.filter(r => r.status === 'won'), open = rs.filter(r => r.status === 'running');
    const k6 = rs.filter(r => r.builtAt && r.builtAt.kaserne !== undefined && r.builtAt.kaserne <= Math.min(360, r.t)).length;
    const s8 = rs.filter(r => r.builtAt && r.builtAt.schmiede !== undefined && r.builtAt.schmiede <= Math.min(480, r.t)).length;   // bis Minute 8 oder Partieende
    const delays = [];
    for (const r of rs) for (const p of r.picks || []) if (TECH.includes(p.id)){
      const done = (r.researchTimes || []).filter(x => (UNIT_RES[p.id] || []).includes(x.id) && x.t >= p.t).map(x => x.t);
      if (done.length) delays.push(Math.min(...done) - p.t);
    }
    return { n: rs.length, siegquote: pc(won.length, rs.length), patt: pc(open.length, rs.length), medianSiegS: median(won.map(r => r.t)), q90SiegS: q90(won.map(r => r.t)),
      kaserne6: pc(k6, rs.length), schmiede8: pc(s8, rs.length), wahlen: median(rs.map(r => (r.draftTimes || []).length)), freieWahlen: median(rs.map(r => r.freeChoices)),
      ersteWahlS: median(rs.map(r => r.draftTimes && r.draftTimes[0] ? r.draftTimes[0].t : null).filter(x => x != null)), techBisForschungS: median(delays), techForschungen: delays.length };
  };

  if (SUITE === 'alle' || SUITE === 'varianten'){
    console.log(`PFAD-VARIANTEN (${DIFF}, durchschnitt, ${RUNS} Partien je Feld)\n`);
    console.log('Strategie        | Variante | Siege  | offen | Median Sieg | P90 Sieg | Kaserne ≤6:00 | Schmiede ≤8:00 | Wahlen | 1. Wahl | Tech→Forschung fertig');
    report.varianten = [];
    for (const st of STRATS) for (const v of VARIANTS){
      const rs = results.filter(r => r.suite === 'varianten' && r.strategy === st && r.variant === v), s = stat(rs);
      report.varianten.push({ strategy: st, variante: v, ...s });
      console.log(`${st.padEnd(16)} | ${v.padEnd(8)} | ${pctS(s.siegquote).padStart(6)} | ${pctS(s.patt).padStart(5)} | ${mm(s.medianSiegS).padStart(11)} | ${mm(s.q90SiegS).padStart(8)} | ${pctS(s.kaserne6).padStart(13)} | ${pctS(s.schmiede8).padStart(14)} | ${String(s.wahlen).padStart(6)} | ${mm(s.ersteWahlS).padStart(7)} | ${s.techBisForschungS == null ? '–' : mm(s.techBisForschungS)} (${s.techForschungen})`);
    }
    for (const st of STRATS){
      const q = report.varianten.filter(x => x.strategy === st).map(x => x.siegquote);
      console.log(`  Spreizung der Siegquoten (${st}): ${Math.round(Math.max(...q) - Math.min(...q))} pp (Soll ≤ 15 pp)`);
    }
    // Wahlbreite: Anteil der Angebote, in denen die Karte gewählt wurde (alle Varianten, beide Strategien)
    const off = {}, pick = {};
    for (const r of results.filter(r => r.suite === 'varianten')){ for (const [id, k] of Object.entries(r.offered || {})) off[id] = (off[id] || 0) + k; for (const [id, k] of Object.entries(r.picked || {})) pick[id] = (pick[id] || 0) + k; }
    const ids = [...new Set([...CARDS, ...Object.keys(off)])];
    report.wahlbreite = ids.filter(id => off[id]).map(id => ({ id, angebote: off[id], gewaehlt: pick[id] || 0, rate: pc(pick[id] || 0, off[id]) }));
    console.log('\nWAHLBREITE – Pfadkarten (Anteil der Angebote, in denen die Karte gewählt wurde; Soll 5–60 %)');
    for (const w of report.wahlbreite.filter(w => CARDS.includes(w.id))) console.log(`  ${w.id.padEnd(26)} ${String(w.angebote).padStart(5)} Angebote, ${pctS(w.rate).padStart(5)}`);
    const bon = report.wahlbreite.filter(w => !CARDS.includes(w.id));
    console.log(`  Bonuskarten: ${bon.filter(w => w.rate < 5).length} unter 5 %, ${bon.filter(w => w.rate > 60).length} über 60 % (von ${bon.length})`);
    console.log('');
  }
  if (SUITE === 'alle' || SUITE === 'profile'){
    console.log(`PROFILE (${DIFF}, Variante militaer, ${RUNS} Partien je Feld)\n`);
    console.log('Strategie        | Profil       | Siege  | offen | Median Sieg | P90 Sieg | Wahlen | freie Wahlen');
    report.profile = [];
    for (const st of STRATS) for (const p of PROFILES){
      const s = stat(results.filter(r => r.suite === 'profile' && r.strategy === st && r.profile === p));
      report.profile.push({ strategy: st, profil: p, ...s });
      console.log(`${st.padEnd(16)} | ${p.padEnd(12)} | ${pctS(s.siegquote).padStart(6)} | ${pctS(s.patt).padStart(5)} | ${mm(s.medianSiegS).padStart(11)} | ${mm(s.q90SiegS).padStart(8)} | ${String(s.wahlen).padStart(6)} | ${s.freieWahlen}`);
    }
    for (const st of STRATS){
      const a = report.profile.find(x => x.strategy === st && x.profil === 'aktiv'), g = report.profile.find(x => x.strategy === st && x.profil === 'gelegentlich');
      if (a.medianSiegS && g.medianSiegS) console.log(`  Abstand aktiv ↔ gelegentlich (${st}): ${((g.medianSiegS - a.medianSiegS) / 60).toFixed(1)} min (Soll ≥ 4 min)`);
    }
    console.log('');
  }
  if (SUITE === 'alle' || SUITE === 'paar'){
    console.log(`PAARVERGLEICH je Pfadkarte (${DIFF}, durchschnitt, Variante militaer, gleicher Seed; Karte gesperrt gegen normal; Soll +3 … +25 pp)\n`);
    console.log('Strategie        | Karte                      | Siege mit | ohne  | Differenz');
    report.paar = [];
    for (const st of STRATS) for (const card of CARDS){
      const w = arm => results.filter(r => r.suite === 'paar' && r.strategy === st && r.card === card && r.arm === arm);
      const a = w('mit'), b = w('ohne'), qa = pc(a.filter(r => r.status === 'won').length, a.length), qb = pc(b.filter(r => r.status === 'won').length, b.length);
      report.paar.push({ strategy: st, karte: card, mit: qa, ohne: qb, differenz: qa - qb });
      console.log(`${st.padEnd(16)} | ${card.padEnd(26)} | ${pctS(qa).padStart(9)} | ${pctS(qb).padStart(5)} | ${(qa - qb >= 0 ? '+' : '') + (qa - qb).toFixed(0)} pp`);
    }
    console.log('');
  }
  if (JSON_OUT){ mkdirSync(new URL('../reports/', import.meta.url), { recursive: true }); writeFileSync(JSON_OUT, JSON.stringify(report, null, 1)); }
}

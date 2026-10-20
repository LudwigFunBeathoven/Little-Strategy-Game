// Klammerfront – Messung für Kartenpfad Teil 5 und 6 (REQ-K5.01, K5.10, K6.08).
// Aufruf:  node tools/sim-p5.mjs --suite felder [--runs 50] [--json reports/kartenpfad5-basis.json] [--label "Fahrplan aus"]
//   Filter: --diffs leicht,normal,schwer  --profiles aktiv,durchschnitt,gelegentlich  --strategy einheiten-zuerst|gierig  --kat militaer|wirtschaft|verteidigung  --druck hoch
//   budget  Paarvergleich des Forschungsbudgets (REQ-K5.05): derselbe Bot mit 0 %, 25 % und 50 %, Normal/durchschnitt (--budgetRuns, Standard 50)
//   doktrin Paarvergleich je Doktrin (REQ-K5.07): der Kategorie-Bot der Doktrin, Normal/durchschnitt (--doktrinDiff, --doktrinProfile), nur diese Doktrin im Pool (Arm „mit“) gegen keine Doktrin (Arm „ohne“),
//           Verteidigung mit druck=hoch (--druck aus | hoch schaltet für alle Kategorien um); dazu Arm „alle“ je Kategorie: Angebote mit Doktrin und gewählte Doktrinen (--doktrinRuns, Standard 100)
//   felder  Siegquote, Dauer, Wahlen je Partie, längste Lücke zwischen zwei Wahlen, EP je Minute in den Abschnitten 0–4, 4–8, 8–12, 12+ min,
//           Anteile der EP-Quellen, Hörsaal (Stufen, Kosten, Ertrag), Fabriken im Raster; 3 Grade × 3 Profile, schneller Bot, gleiche Seeds in allen Feldern
// „Fahrplan aus“ (Teil 4): KF_OVERRIDE='{"KARTEN":{"fahrplan":{"zielzeitIstFrist":false},"maxAbstand":1000000000}}' node tools/sim-p5.mjs …
// Die Simulation misst Stärke, nicht Spielspaß.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';

const EP_AT = [240, 480, 720];                                              // Grenzen der Abschnitte 0–4, 4–8, 8–12 min (Sekunden Spielzeit)
const SLIM = r => ({ diff: r.diff, profile: r.profile, strategy: r.strategy, seed: r.seed, status: r.status, t: r.t, xpAt: r.xpAt, xpSrcAt: r.xpSrcAt, xpTotal: r.xpTotal, xpKill: r.xpKill, xpTower: r.xpTower,
  xpPassive: r.xpPassive, xpBounty: r.xpBounty, xpSrc: r.xpSrc, wahlen: r.wahlen || [], freeChoices: r.freeChoices, researchTimes: r.researchTimes || [], research: r.research, grid: r.grid, built: r.built,
  wallLost: r.wallLost, variants: r.variants, cards: r.cards, maxArmy: r.maxArmy, level: r.level, picks: r.picks, offers: r.offers,
  doktrinOffers: r.doktrinOffers, doktrinOfferWahlen: r.doktrinOfferWahlen, doktrinen: r.doktrinen, upkeep: r.upkeep, towerKills: r.towerKills,
  weiter: r.weiter || [], katCounts: r.katCounts, synergie: r.synergie, doktrinP: r.doktrinP || [], trade: r.trade, milizUnits: r.milizUnits, zermuerbt: r.zermuerbt, nbEnd: r.nbEnd, slotsEnd: r.slotsEnd, haus: r.haus, fluegel: r.fluegel, kompanien: r.kompanien, gekauft: r.gekauft });

if (!isMainThread){
  const { playGame } = await import('./sim-bot.mjs');
  parentPort.postMessage(workerData.jobs.map(j => Object.assign(SLIM(playGame(j)), { suite: j.suite, variant: j.variant, druckName: j.druckName, arm: j.arm })));
} else {
  process.env.KF_PACING = 'karten';
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const RUNS = Number(arg('runs', 50)), SUITE = arg('suite', 'felder'), JSON_OUT = arg('json', null), EZ = arg('strategy', 'einheiten-zuerst'), LABEL = arg('label', '');
  const seedOf = (k, r) => (5000 + r * 7919 + k * 104729) >>> 0;
  const { loadCore } = await import('./load-core.mjs');
  const core = loadCore(), C = core.KF_CONFIG;
  const DIFFS = arg('diffs', 'leicht,normal,schwer').split(','), PROFILES = arg('profiles', 'aktiv,durchschnitt,gelegentlich').split(',');
  const KAT = arg('kat', null), DRUCK = arg('druck', 'aus');
  const base = { pacing: 'karten' };
  const jobs = [];
  if (SUITE === 'felder')
    for (const diff of DIFFS) for (const profile of PROFILES) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'felder', diff, profile, strategy: EZ, pfad: KAT ? undefined : 'militaer', kat: KAT || undefined, druck: DRUCK === 'hoch' ? 'hoch' : undefined, sampleXp: EP_AT, seed: seedOf(2, r) });

  if (SUITE === 'budget')
    for (const arm of [0, 1, 2]) for (const profile of PROFILES) for (const diff of DIFFS) for (let r = 0; r < RUNS; r++)
      jobs.push({ ...base, suite: 'budget', diff, profile, strategy: EZ, pfad: KAT ? undefined : 'militaer', kat: KAT || undefined, druck: DRUCK === 'hoch' ? 'hoch' : undefined, budget: arm, arm, sampleXp: EP_AT, seed: seedOf(7, r) });
  /* Doktrin, Kategorie des Bots (Mischdoktrinen: die zuerst genannte Kategorie), Sonderbau (null: keiner); Teil 6 (REQ-K6.05) ergänzt sieben Doktrinen */
  const DOKS = [['zunftordnung', 'wirtschaft'], ['stiftung', 'wirtschaft'], ['stehendesHeer', 'militaer'], ['vorstoss', 'militaer'], ['bollwerk', 'verteidigung'], ['ausfall', 'verteidigung'],
    ['elite', 'militaer'], ['massenaufgebot', 'militaer'], ['freihandel', 'wirtschaft'], ['raubbau', 'wirtschaft'], ['fabrikmiliz', 'wirtschaft'], ['grenzfeste', 'verteidigung'], ['zermuerbung', 'verteidigung']];
  const SONDERBAU = { zunftordnung: 'zunfthaus', stiftung: 'stiftungshaus', stehendesHeer: 'heerlager', bollwerk: 'bastion' };
  const DOK_FILTER = arg('doktrinen', null) ? arg('doktrinen').split(',') : null;
  const DRUNS = Number(arg('doktrinRuns', 100)), DDIFF = arg('doktrinDiff', 'normal'), DPROF = arg('doktrinProfile', 'durchschnitt');
  if (SUITE === 'doktrin'){
    const druckOf = kat => (arg('druck', 'auto') === 'auto' ? kat === 'verteidigung' : arg('druck') === 'hoch') ? 'hoch' : undefined;
    for (const [doc, kat] of DOKS.filter(d => !DOK_FILTER || DOK_FILTER.includes(d[0]))) for (const arm of ['mit', 'ohne']) for (let r = 0; r < DRUNS; r++)
      jobs.push({ ...base, suite: 'doktrin', diff: DDIFF, profile: DPROF, strategy: EZ, kat, variant: doc, arm, druck: druckOf(kat), banCards: DOKS.map(d => d[0]).filter(x => arm === 'ohne' || x !== doc), seed: seedOf(11, r) });
    if (arg('doktrinAlle', 'ja') !== 'nein') for (const kat of ['militaer', 'wirtschaft', 'verteidigung']) for (let r = 0; r < DRUNS; r++)
      jobs.push({ ...base, suite: 'doktrin', diff: DDIFF, profile: DPROF, strategy: EZ, kat, variant: kat, arm: 'alle', druck: druckOf(kat), seed: seedOf(11, r) });
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
  const sortN = a => [...a].sort(cmp);
  const median = a => { if (!a.length) return null; const s = sortN(a); return s[Math.floor(s.length / 2)]; };
  const pct = (a, p) => { if (!a.length) return null; const s = sortN(a); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
  const pc = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
  const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1);
  const f0 = x => x == null ? '–' : String(Math.round(x));
  const pc1b = v => v == null ? '–' : (100 * v).toFixed(1) + ' %';

  /* EP je Minute in den Abschnitten 0–4, 4–8, 8–12, 12+ min: Partien, die den Abschnitt höchstens 30 s berühren, zählen nicht; endet die Partie im Abschnitt, gilt die tatsächliche Dauer */
  const BOUNDS = [0, ...EP_AT, Infinity];
  function epRates(r){
    const out = [], at = k => k === 0 ? 0 : k <= EP_AT.length ? r.xpAt[k - 1] : r.xpTotal;
    for (let k = 0; k < BOUNDS.length - 1; k++){
      const a = BOUNDS[k], b = BOUNDS[k + 1];
      if (r.t < a + 30){ out.push(null); continue; }
      const end = Math.min(r.t, b), xe = r.t < b || b === Infinity ? r.xpTotal : r.xpAt[k], xs = k === 0 ? 0 : r.xpAt[k - 1];
      out.push(xe == null || xs == null ? null : (xe - xs) / ((end - a) / 60));
    }
    return out;
  }
  /* Lücken zwischen den Erscheinungszeiten der Wahlen (Start = 0); luecke = größte Lücke vor der letzten Wahl, mitEnde schließt die Zeit von der letzten Wahl bis zum Ende ein */
  function gaps(r){
    const ts = r.wahlen.map(w => w.t); let prev = 0, mx = 0;
    for (const t of ts){ mx = Math.max(mx, t - prev); prev = t; }
    return { luecke: mx, mitEnde: Math.max(mx, r.t - prev) };
  }
  const HOERSAAL_COST = (() => { const h = core.KF_RESEARCH.find(x => x.id === 'r_hoersaal'); let s = 0; return h.tiers.map(t => (s += t.cost)); })();
  /* Hörsaal: Fertigstellung je Stufe aus researchTimes, Material bis zur erreichten Stufe, EP je Minute ab Fertigstellung der ersten Stufe */
  function hoersaal(r){
    const ev = r.researchTimes.filter(x => x.id === 'r_hoersaal').sort((a, b) => a.tier - b.tier);
    if (!ev.length) return null;
    const t1 = ev[0].t;
    return { stufe: ev[ev.length - 1].tier, t: ev.map(e => e.t), kosten: HOERSAAL_COST[ev[ev.length - 1].tier - 1], epMin: r.t > t1 + 20 ? r.xpPassive / ((r.t - t1) / 60) : null };
  }

  const SRC = ['kill', 'tower', 'base', 'wave', 'budget', 'passive', 'bounty'];       // EP-Quellen (core.js, gainXp)
  const stat = rs => {
    const won = rs.filter(r => r.status === 'won');
    const gridAt = t => rs.map(r => r.grid && r.grid[t]).filter(Boolean);
    const fab = t => gridAt(t).map(g => g.types.fabrik || 0);
    const rates = rs.map(epRates), g = rs.map(gaps), hs = rs.map(hoersaal);
    const withH = hs.filter(Boolean);
    const sum = f => rs.reduce((a, r) => a + f(r), 0), total = sum(r => r.xpTotal);
    return { n: rs.length, siegquote: pc(won.length, rs.length), niederlagen: pc(rs.filter(r => r.status === 'lost').length, rs.length), patt: pc(rs.filter(r => r.status === 'running').length, rs.length),
      siegMedian: median(won.map(r => r.t)), dauerMedian: median(rs.map(r => r.t)), dauerP90: pct(rs.map(r => r.t), 0.9),
      wahlenMedian: median(rs.map(r => r.wahlen.length)), wahlenMittel: mean(rs.map(r => r.wahlen.length)), freieWahlenMittel: mean(rs.map(r => r.freeChoices || 0)),
      lueckeMedian: median(g.map(x => x.luecke)), lueckeP90: pct(g.map(x => x.luecke), 0.9), lueckeEndeMedian: median(g.map(x => x.mitEnde)), lueckeEndeP90: pct(g.map(x => x.mitEnde), 0.9),
      epMin: [0, 1, 2, 3].map(k => ({ median: median(rates.map(x => x[k]).filter(v => v != null)), n: rates.filter(x => x[k] != null).length })),
      epGesamtMedian: median(rs.map(r => r.xpTotal)),
      quellen: Object.fromEntries(SRC.map(k => [k, total ? sum(r => (r.xpSrc && r.xpSrc[k]) || 0) / total : null])),
      hoersaal: { anteil: pc(withH.length, rs.length), stufe: [1, 2, 3].map(k => pc(withH.filter(h => h.stufe >= k).length, rs.length)), t1Median: median(withH.map(h => h.t[0])),
        kostenMedian: median(withH.map(h => h.kosten)), epMinMedian: median(withH.map(h => h.epMin).filter(v => v != null)), epMinMittel: mean(withH.map(h => h.epMin).filter(v => v != null)) },
      fabrikenMedian: { 300: median(fab(300)), 600: median(fab(600)) }, fabrikenMittel: { 300: mean(fab(300)), 600: mean(fab(600)) },
      mauerVerlustMedian: median(rs.map(r => r.wallLost)),
      weiter: { fabrik: pc(rs.filter(r => (r.weiter || []).some(w => w.bereich === 'fabrik')).length, rs.length), universitaet: pc(rs.filter(r => (r.weiter || []).some(w => w.bereich === 'universitaet')).length, rs.length),
        tFabrikMedian: median(rs.map(r => (r.weiter || []).find(w => w.bereich === 'fabrik')).filter(Boolean).map(w => w.t)), tUniMedian: median(rs.map(r => (r.weiter || []).find(w => w.bereich === 'universitaet')).filter(Boolean).map(w => w.t)),
        ersetztMittel: mean(rs.map(r => (r.weiter || []).reduce((a, w) => a + w.ersetzt, 0))), ersetztMittelMit: mean(rs.filter(r => (r.weiter || []).length).map(r => (r.weiter || []).reduce((a, w) => a + w.ersetzt, 0))) },
      doktrinAngebote: { median: median(rs.map(r => r.doktrinOffers || 0)), mittel: mean(rs.map(r => r.doktrinOffers || 0)), ohneAnteil: pc(rs.filter(r => !(r.doktrinOffers > 0)).length, rs.length),
        erstesMedian: median(rs.filter(r => (r.doktrinOfferWahlen || []).length).map(r => r.doktrinOfferWahlen[0])) } };
  };
  const report = { suite: SUITE, runs: RUNS, label: LABEL, strategy: EZ, felder: [] };
  if (SUITE === 'felder'){
    const rows = [];
    for (const diff of DIFFS) for (const profile of PROFILES){
      const rs = results.filter(r => r.suite === 'felder' && r.diff === diff && r.profile === profile);
      const s = stat(rs); rows.push({ diff, profile, ...s }); report.felder.push({ diff, profile, ...s });
    }
    console.log(`FELDMESSUNG (${EZ}${KAT ? ', Kategorie ' + KAT : ''}${DRUCK === 'hoch' ? ', druck=hoch' : ''}, ${RUNS} Partien je Feld, Modus karten${LABEL ? ', ' + LABEL : ''})\n`);
    console.log('| Grad | Profil | Siege | Niederl. | Patt | Dauer Median | Dauer P90 | Wahlen Median (Mittel) | längste Lücke Median / P90 (s) | Lücke inkl. Ende Median / P90 (s) | Fabriken Min 5 / 10 (Median) |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${x.siegquote} % | ${x.niederlagen} % | ${x.patt} % | ${mm(x.dauerMedian)} | ${mm(x.dauerP90)} | ${x.wahlenMedian} (${f1(x.wahlenMittel)}) | ${f0(x.lueckeMedian)} / ${f0(x.lueckeP90)} | ${f0(x.lueckeEndeMedian)} / ${f0(x.lueckeEndeP90)} | ${x.fabrikenMedian[300] ?? '–'} / ${x.fabrikenMedian[600] ?? '–'} |`);
    console.log('\nAngebote mit Doktrin (Bot ohne Kategorie; Median, Mittel; erstes Angebot in Wahl; Partien ohne Doktrin-Angebot)\n');
    console.log('| Grad | Profil | Angebote Median (Mittel) | erstes Angebot in Wahl (Median) | ohne Doktrin-Angebot |');
    console.log('|---|---|---|---|---|');
    for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${x.doktrinAngebote.median} (${f1(x.doktrinAngebote.mittel)}) | ${x.doktrinAngebote.erstesMedian ?? '–'} | ${x.doktrinAngebote.ohneAnteil} % |`);
    console.log('\nWeiterentwicklungen (Anteil der Partien; Abschluss Median; ersetzte Varianten je Partie mit Weiterentwicklung, Mittel)\n');
    console.log('| Grad | Profil | Dampfkraft | Abschluss (Median) | Buchdruck | Abschluss (Median) | ersetzte Varianten (Mittel) |');
    console.log('|---|---|---|---|---|---|---|');
    for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${x.weiter.fabrik} % | ${mm(x.weiter.tFabrikMedian)} | ${x.weiter.universitaet} % | ${mm(x.weiter.tUniMedian)} | ${f1(x.weiter.ersetztMittelMit)} |`);
    console.log('\nEP je Minute (Median; Partien im Abschnitt in Klammern)\n');
    console.log('| Grad | Profil | 0–4 min | 4–8 min | 8–12 min | 12+ min | EP gesamt (Median) |');
    console.log('|---|---|---|---|---|---|---|');
    for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${x.epMin.map(e => `${f1(e.median)} (${e.n})`).join(' | ')} | ${f0(x.epGesamtMedian)} |`);
    console.log('\nEP-Quellen (Anteil am EP-Ertrag über alle Partien des Feldes)\n');
    console.log('| Grad | Profil | Abschüsse (Einheiten) | Türme | Basisschaden | abgewehrte Wellen | Forschungsbudget | Hörsaal |');
    console.log('|---|---|---|---|---|---|---|---|');
    const pc1 = v => v == null ? '–' : (100 * v).toFixed(1) + ' %';
    for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${pc1(x.quellen.kill)} | ${pc1(x.quellen.tower)} | ${pc1(x.quellen.base)} | ${pc1(x.quellen.wave)} | ${pc1(x.quellen.budget)} | ${pc1(x.quellen.passive)} |`);
    /* Wahlrate je Karte (REQ-K5.06, Hinweis): wie oft eine angebotene Karte gewählt wird, über alle Partien Normal (Bots messen sich selbst mit; nur Hinweis) */
    { const by = {}; for (const r of results.filter(x => x.suite === 'felder' && x.diff === 'normal')) for (const o of r.offers || []){ const e = by[o.id] || (by[o.id] = { a: 0, c: 0 }); e.a++; if (o.chosen) e.c++; }
      const list = Object.entries(by).map(([id, e]) => ({ id, angeboten: e.a, gewaehlt: e.c, rate: e.a ? Math.round(1000 * e.c / e.a) / 10 : null })).sort((a, b) => a.rate - b.rate);
      report.wahlraten = list;
      const out = list.filter(x => x.rate < 5 || x.rate > 60);
      console.log(`\nWahlrate je Karte (Normal, alle Profile, ${list.reduce((a, x) => a + x.angeboten, 0)} Angebote): ${list.length} Karten, außerhalb von 5–60 %: ${out.length}\n`);
      console.log(list.map(x => `${x.id} ${x.rate} % (${x.gewaehlt}/${x.angeboten})`).join(', ')); }
    if (rows.some(x => x.hoersaal.anteil > 0)){
      console.log('\nHörsaal (Anteil der Partien mit Stufe 1 / 2 / 3; Fertigstellung Stufe 1; Material bis zur erreichten Stufe; EP je Minute ab Fertigstellung)\n');
      console.log('| Grad | Profil | Partien mit Hörsaal | Stufe 1 / 2 / 3 | Stufe 1 fertig (Median) | Kosten (Median) | EP je Minute (Median / Mittel) |');
      console.log('|---|---|---|---|---|---|---|');
      for (const x of rows) console.log(`| ${x.diff} | ${x.profile} | ${x.hoersaal.anteil} % | ${x.hoersaal.stufe.map(v => v + ' %').join(' / ')} | ${mm(x.hoersaal.t1Median)} | ${f0(x.hoersaal.kostenMedian)} | ${f1(x.hoersaal.epMinMedian)} / ${f1(x.hoersaal.epMinMittel)} |`);
    }
  }
  if (SUITE === 'budget'){
    const rows = [];
    for (const diff of DIFFS) for (const profile of PROFILES) for (const arm of [0, 1, 2]){
      const rs = results.filter(r => r.suite === 'budget' && r.diff === diff && r.profile === profile && r.arm === arm), s = stat(rs);
      rows.push({ diff, profile, arm, ...s }); report.felder.push({ diff, profile, arm, ...s });
    }
    console.log(`FORSCHUNGSBUDGET – Paarvergleich (${EZ}${KAT ? ', Kategorie ' + KAT : ''}, ${RUNS} Partien je Arm, gleiche Seeds, Modus karten${LABEL ? ', ' + LABEL : ''})\n`);
    console.log('| Grad | Profil | Budget | Siege | Dauer Median | Wahlen Median (Mittel) | Differenz Wahlen (Median) | Differenz Siege | EP aus Budget |');
    console.log('|---|---|---|---|---|---|---|---|---|');
    for (const x of rows){
      const base0 = rows.find(y => y.diff === x.diff && y.profile === x.profile && y.arm === 0);
      console.log(`| ${x.diff} | ${x.profile} | ${[0, 25, 50][x.arm]} % | ${x.siegquote} % | ${mm(x.dauerMedian)} | ${x.wahlenMedian} (${f1(x.wahlenMittel)}) | ${x.arm ? '+' + (x.wahlenMedian - base0.wahlenMedian) : '–'} | ${x.arm ? (x.siegquote - base0.siegquote >= 0 ? '+' : '') + f1(x.siegquote - base0.siegquote) + ' pp' : '–'} | ${pc1b(x.quellen.budget)} |`);
    }
  }
  if (SUITE === 'doktrin'){
    const w = a => pc(a.filter(r => r.status === 'won').length, a.length), rows = [];
    console.log(`DOKTRINEN – Paarvergleich (${EZ}, ${DDIFF}/${DPROF}, ${DRUNS} Partien je Arm, gleiche Seeds, druck: ${arg('druck', 'auto') === 'auto' ? 'nur Verteidigung hoch' : arg('druck')}, Modus karten${LABEL ? ', ' + LABEL : ''})\n`);
    console.log('| Doktrin | Kategorie | Siege mit | Siege ohne | Differenz (pp) | Dauer Median mit / ohne | Wahlen Median mit / ohne | Mauer-Verlust mit / ohne | Turm-Abschüsse mit / ohne | Sonderbau gebaut (mit) |');
    console.log('|---|---|---|---|---|---|---|---|---|---|');
    for (const [doc, kat] of DOKS.filter(d => !DOK_FILTER || DOK_FILTER.includes(d[0]))){
      const mit = results.filter(r => r.suite === 'doktrin' && r.variant === doc && r.arm === 'mit'), ohne = results.filter(r => r.suite === 'doktrin' && r.variant === doc && r.arm === 'ohne');
      const sb = SONDERBAU[doc] || null;
      const gebaut = sb ? pc(mit.filter(r => (r.variants || []).some(v => v.id === sb)).length, mit.length) : null, gewaehlt = pc(mit.filter(r => (r.doktrinen || []).some(d => d.id === doc)).length, mit.length);
      const row = { doktrin: doc, kat, mit: w(mit), ohne: w(ohne), differenz: Math.round((w(mit) - w(ohne)) * 10) / 10, dauerMit: median(mit.map(r => r.t)), dauerOhne: median(ohne.map(r => r.t)), gewaehlt, sonderbauGebaut: gebaut,
        differenzWennGewaehlt: (() => { const g = mit.filter(r => (r.doktrinen || []).some(d => d.id === doc)); return g.length ? Math.round((w(g) - w(ohne)) * 10) / 10 : null; })() };
      rows.push(row);
      const wl = a => Math.round(mean(a.map(r => r.wallLost || 0))), tk = a => f1(mean(a.map(r => r.towerKills || 0))), wa = a => median(a.map(r => (r.wahlen || []).length));
      Object.assign(row, { wahlenMit: wa(mit), wahlenOhne: wa(ohne), mauerMit: wl(mit), mauerOhne: wl(ohne), turmMit: +tk(mit), turmOhne: +tk(ohne) });
      console.log(`| ${doc} | ${kat} | ${row.mit} % | ${row.ohne} % | ${row.differenz > 0 ? '+' : ''}${row.differenz} | ${mm(row.dauerMit)} / ${mm(row.dauerOhne)} | ${wa(mit)} / ${wa(ohne)} | ${wl(mit)} / ${wl(ohne)} | ${tk(mit)} / ${tk(ohne)} | ${gebaut == null ? '–' : gebaut + ' %'} (gewählt ${gewaehlt} %, Differenz bei Wahl ${row.differenzWennGewaehlt == null ? '–' : (row.differenzWennGewaehlt > 0 ? '+' : '') + row.differenzWennGewaehlt}) |`);
    }
    report.doktrin = rows;
    console.log('\nAngebote mit Doktrin (Arm „alle“: alle Doktrinen im Pool, Kategorie-Bot)\n');
    console.log('| Kategorie | Siege | Angebote mit Doktrin Median (Mittel) | Doktrinen gewählt Mittel | Erste Doktrin gewählt in Wahl (Median) | Erstes Angebot mit Doktrin in Wahl (Median) | Partien ohne Doktrin-Angebot | Unterhalt Median (Material) |');
    console.log('|---|---|---|---|---|---|---|---|');
    report.alle = [];
    for (const kat of ['militaer', 'wirtschaft', 'verteidigung']){
      const rs = results.filter(r => r.suite === 'doktrin' && r.arm === 'alle' && r.variant === kat);
      const row = { kat, siege: w(rs), angeboteMedian: median(rs.map(r => r.doktrinOffers || 0)), angeboteMittel: mean(rs.map(r => r.doktrinOffers || 0)), gewaehltMittel: mean(rs.map(r => (r.doktrinen || []).length)),
        ersteWahlMedian: median(rs.filter(r => (r.doktrinen || []).length).map(r => r.doktrinen[0].wahl)), ersteAngebotMedian: median(rs.filter(r => (r.doktrinOfferWahlen || []).length).map(r => r.doktrinOfferWahlen[0])), ohneAngebotAnteil: pc(rs.filter(r => !(r.doktrinOffers > 0)).length, rs.length), unterhaltMedian: median(rs.map(r => r.upkeep || 0)),
        gewaehltJeDoktrin: Object.fromEntries(DOKS.map(([d]) => [d, pc(rs.filter(r => (r.doktrinen || []).some(x => x.id === d)).length, rs.length)])) };
      report.alle.push(row);
      console.log(`| ${kat} | ${row.siege} % | ${row.angeboteMedian} (${f1(row.angeboteMittel)}) | ${f1(row.gewaehltMittel)} | ${row.ersteWahlMedian ?? '–'} | ${row.ersteAngebotMedian ?? '–'} | ${row.ohneAngebotAnteil} % | ${f0(row.unterhaltMedian)} |`);
    }
    console.log('\nGewählt je Doktrin (Anteil der Partien):', JSON.stringify(report.alle.map(r => r.gewaehltJeDoktrin)));
  }
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ...report, roh: results.map(r => ({ suite: r.suite, diff: r.diff, profile: r.profile, strategy: r.strategy, seed: r.seed, status: r.status, t: Math.round(r.t * 10) / 10,
    arm: r.arm, variant: r.variant, druckName: r.druckName, doktrinen: r.doktrinen, doktrinOffers: r.doktrinOffers, doktrinOfferWahlen: r.doktrinOfferWahlen, upkeep: r.upkeep, towerKills: r.towerKills, variants: r.variants, xpSrc: r.xpSrc, xpAt: r.xpAt, xpTotal: Math.round(r.xpTotal), xpKill: Math.round(r.xpKill), xpTower: Math.round(r.xpTower), xpPassive: Math.round(r.xpPassive), research: r.research, researchTimes: r.researchTimes,
    grid: r.grid, wallLost: r.wallLost, synergie: r.synergie, katCounts: r.katCounts, nbEnd: r.nbEnd, slotsEnd: r.slotsEnd, weiter: r.weiter, haus: r.haus, fluegel: r.fluegel, kompanien: r.kompanien, gekauft: r.gekauft, wahlen: r.wahlen && r.wahlen.map(w => ({ n: w.n, t: Math.round(w.t) })) })) }));
}

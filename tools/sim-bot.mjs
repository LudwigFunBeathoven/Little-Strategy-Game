// Klammerfront – Bots für die Balancing-Simulation (7.1).
// Ein Bot spielt eine Partie ohne Browser. Strategien: 'zufall', 'gierig' (Vorausschau per Kopie des Spielstands) und
// 'einheiten-zuerst' (REQ-6.09: tools/browser-bot.js – feste Bauordnung, Einheiten bis zum Limit, erste Karte).
export const STRATEGIES = ['gierig', 'einheiten-zuerst'];
import { loadCore } from './load-core.mjs';
import { directionTracker } from './sim-metrics.mjs';

const { KlammerCore, KF_CONFIG: C, KF_BROWSER_BOT, KF_NEIGHBORS } = loadCore();
export const CONFIG = C;
const DT = C.TICK_S;

/* Spielertypen: Klicks/s, Reaktionsintervall (s), Einheiten-Limit */
/* „verteidigung“: kauft keine Einheiten; Referenz dafür, dass reine Verteidigung verliert (REQ-21.4, REQ-41). */
export const PROFILES = {
  aktiv:        { cps: 3,   every: 0.25, cap: 30, useWall: true },
  durchschnitt: { cps: 1.5, every: 1,    cap: 22, useWall: true },
  gelegentlich: { cps: 0.7, every: 3,    cap: 15, useWall: false },
  passiv:       { cps: 0.3, every: 3,    cap: 10, useWall: false, noBuild: true, noUpgrades: true },
  verteidigung: { cps: 1.5, every: 1,    cap: 0,  useWall: true, noUnits: true },
};

const MAT_PRIO = ['presse', 'ausbau', 'qualitaet', 'zinseszins', 'turm_0', 'turm_2', 'mauer', 'kadenz_0', 'kadenz_2',
                  'reichweite_0', 'reichweite_2', 'stacheln', 'moertel'];
const GATE = C.GATE_LANE;
/* Anteil der Lebenspunkte je Abschnitt; das Tor zählt doppelt, weil es die Partie entscheidet */
function baseHealth(G){
  let s = 0, w = 0;
  G.S.sections.forEach((sec, i) => { const k = i === GATE ? 2 : 1; s += k * Math.max(0, sec.hp) / G.sectionMax(i); w += k; });
  return s / w;
}

/* Kleiner, seedbarer Zufall für Bot-Entscheidungen (getrennt vom Spielzufall) */
function botRng(seed){ let s = (seed ^ 0x9e3779b9) >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* Bots spielen wie ein neuer Spieler mit gestaffelter Einführung (REQ-47); KF_SKIP_INTRO=1 schaltet sie ab */
export function newGame(diff, seed, pacing){
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { intro: process.env.KF_SKIP_INTRO !== '1', pacing });
  return G;
}
function forkGame(G){
  const F = KlammerCore.create(); F.FX.on = false; F.S = G.snapshot();
  return F;
}

/* Bewertung eines Spielstands für die Vorausschau */
function score(G){
  const S = G.S, eMax = G.diffCfg().enemyBaseHp;
  if (S.status === 'won') return 1e6 - S.t;
  if (S.status === 'lost') return -1e6 + S.t;
  let army = 0;
  for (const u of S.units) if (u.side === 'p') army += u.hp * u.dmg / u.cdMax;
  return (1 - S.enemyBaseHp / eMax) * 100
       - (1 - baseHealth(G)) * 150
       + 12 * Math.log2(1 + G.matRate())
       + 8 * Math.log2(G.supplyCap()) + 10 * Math.log2(G.dmgMultP())
       + 6 * Math.log2(1 + army)
       + 4 * Math.log2(1 + S.material);
}

export class Bot {
  constructor(opts){
    this.o = Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true, strategy: 'gierig', clickPolicy: 'always',
                             horizon: 45, buildHorizon: 120, lookahead: true }, opts);
    this.rng = botRng(opts.seed || 1);
    this.clickAcc = 0; this.actAcc = 0; this.mix = 0; this.resNext = 0; this.resWait = C.SIM_RESEARCH_EVERY_S;
  }
  /* Vorausschau bis nach der Belagerungswelle, sobald sie innerhalb von SIM_SIEGE_LOOKAHEAD_S bevorsteht (REQ-48):
     sonst bewertet die Heuristik Karten und Gebäude, ohne den stärksten Angriff der Partie zu sehen */
  horizonFor(G, base){
    const S = G.S, until = S.siegeWaveT - S.t;
    if (S.siegeDone || until < 0 || until > C.SIM_SIEGE_LOOKAHEAD_S) return base;
    return Math.max(base, until + C.SIM_SIEGE_EVAL_S);
  }
  clickRateNow(G){
    const p = this.o.clickPolicy;
    if (p === 'never') return 0;
    if (p === 'stopLate' && G.phase && G.phase() === 'late') return 0;
    return this.o.cps;
  }
  /* ein Simulationsschritt inkl. Klicks und Entscheidungen */
  step(G, stats){
    if (G.S.pendingDraft){ this.draft(G, stats); }
    G.tick(DT);
    const rate = this.clickRateNow(G);
    this.clickAcc += rate * DT;
    while (this.clickAcc >= 1){ G.doClick(); this.clickAcc--; }
    this.actAcc += DT;
    if (this.actAcc >= this.o.every){ this.actAcc = 0; this.act(G, stats); }
  }
  chooseBuilding(G, slot, options, stats){
    if (options.length === 1) return options[0];
    if (this.o.uniFirst && options.includes('universitaet') && !G.has('universitaet')) return 'universitaet';   // Messung REQ-6.06
    if (this.o.strategy === 'zufall' || !this.o.lookahead) return options[Math.floor(this.rng() * options.length)];
    let best = null, bestScore = -Infinity;
    for (const type of options){
      const F = forkGame(G);
      F.buildAt(slot, type);
      const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 99 }));
      // Gebäude wirken langsamer als Draft-Optionen: längere Vorausschau
      const h = this.horizonFor(G, this.o.buildHorizon);
      for (let t = 0; t < h / DT && F.S.status === 'running'; t++) sub.step(F, null);
      const sc = score(F);
      if (sc > bestScore){ bestScore = sc; best = type; }
    }
    return best;
  }
  /* Bauplatz (REQ-6.07 a): Kandidaten sind der erste freie Platz und der Platz mit dem größten Nachbarschaftsnutzen; die gierige
     Heuristik vergleicht beide per Vorausschau, die Zufallsstrategie nimmt den Nachbarschaftsplatz */
  chooseSlot(G, first, type){
    let best = first, bg = -Infinity;
    G.S.slots.forEach((x, i) => { if (x) return; const g = G.neighborGain(i, type); if (g > bg + 1e-9){ bg = g; best = i; } });
    if (best === first || !(this.o.strategy === 'gierig' && this.o.lookahead)) return best;
    const sim = slot => { const F = forkGame(G); F.buildAt(slot, type);
      const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 44 }));
      const h = this.horizonFor(G, this.o.buildHorizon);
      for (let t = 0; t < h / DT && F.S.status === 'running'; t++) sub.step(F, null);
      return score(F); };
    return sim(best) >= sim(first) ? best : first;
  }
  /* Forschung wählen: höchstens alle SIM_RESEARCH_EVERY_S; die gierige Heuristik vergleicht die günstigsten bezahlbaren Forschungen
     per Vorausschau mit „nichts erforschen“ und startet nur bei Vorteil */
  research(G, stats){
    const S = G.S;
    if (!G.has('universitaet') || S.research.active.length >= G.researchSlots()) return;
    const pr = KF_BROWSER_BOT.pfadResearch(G);                            // Pfadforschung vor allem anderen (REQ-KP.09)
    if (pr){ if (G.startResearch(pr) && stats) stats.researched[pr] = (stats.researched[pr] || 0) + 1; return; }
    if (this.o.uniFirst){                                                  // Messung REQ-6.06: günstigste bezahlbare Forschung sofort
      const r = G.RESEARCH.filter(x => G.researchBlock(x.id) === null).sort((a, b) => G.researchCost(a.id) - G.researchCost(b.id))[0];
      if (r && G.startResearch(r.id) && stats) stats.researched[r.id] = (stats.researched[r.id] || 0) + 1;
      return;
    }
    if (S.t < this.resNext) return;
    const cand = G.RESEARCH.filter(r => G.researchBlock(r.id) === null).sort((a, b) => G.researchCost(a.id) - G.researchCost(b.id)).slice(0, C.SIM_RESEARCH_CANDIDATES);
    if (!cand.length) return;
    let pick = null;
    if (this.o.strategy === 'gierig' && this.o.lookahead){
      const sim = F => { const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 33 })); const h = this.horizonFor(G, this.o.buildHorizon);
                         for (let t = 0; t < h / DT && F.S.status === 'running'; t++) sub.step(F, null); return score(F); };
      let best = sim(forkGame(G)) + 2;                                  // Forschung nur bei klarem Vorteil
      for (const r of cand){ const F = forkGame(G); F.startResearch(r.id); const sc = sim(F); if (sc > best){ best = sc; pick = r.id; } }
    } else if (this.rng() < 0.5) pick = cand[Math.floor(this.rng() * cand.length)].id;
    if (pick && G.startResearch(pick)){ if (stats) stats.researched[pick] = (stats.researched[pick] || 0) + 1; this.resWait = C.SIM_RESEARCH_EVERY_S; this.resNext = S.t; }
    else { this.resNext = S.t + this.resWait; this.resWait = Math.min(C.SIM_RESEARCH_MAX_WAIT_S, this.resWait * 2); }   // nach Ablehnung seltener prüfen
  }
  /* Draft-Wahl (REQ-02): zufällig oder per Vorausschau */
  draft(G, stats){
    const offer = G.S.pendingDraft.options;
    let pick = 0;
    const pp = KF_BROWSER_BOT.pfadPick(G, offer, this.o.pfad);       // Pfadkarten der Bauordnung haben Vorrang (REQ-KP.09)
    if (pp !== null) pick = pp;
    else if (this.o.strategy === 'gierig' && this.o.lookahead && offer.length > 1){
      let bestScore = -Infinity;
      offer.forEach((id, i) => {
        const F = forkGame(G);
        F.chooseDraft(i);
        const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 77 }));
        const h = this.horizonFor(G, this.o.horizon);
        for (let t = 0; t < h / DT && F.S.status === 'running'; t++) sub.step(F, null);
        const sc = score(F);
        if (sc > bestScore){ bestScore = sc; pick = i; }
      });
    } else pick = Math.floor(this.rng() * offer.length);
    if (stats){
      for (const id of offer) stats.offered[id] = (stats.offered[id] || 0) + 1;
      const id = offer[pick];
      stats.picked[id] = (stats.picked[id] || 0) + 1;
      stats.draftTimes.push({ t: G.S.t, level: G.S.pendingDraft.level });
      // je angebotener Karte die Stufe, die sie gebracht hätte, und ob sie gewählt wurde (REQ-48)
      offer.forEach((oid, i) => stats.offers.push({ id: oid, tier: G.cardTaken(oid) + 1, chosen: i === pick }));
    }
    G.chooseDraft(pick);
  }
  act(G, stats){
    const S = G.S, o = this.o;
    if (S.status !== 'running') return;
    if (o.useWall) S.sections.forEach((sec, i) => { if (sec.hp < G.sectionMax(i) * 0.5) G.repair(i); });
    const own = S.units.filter(u => u.side === 'p').length;
    const threat = S.units.some(u => u.side === 'e' && u.x < 400);
    const trySpawn = n => { if (o.noUnits) return; for (let k = 0; k < n; k++){ if (own + S.queue.length >= o.cap) break; if (this.mix % 3 === 2 && G.unitUnlocked('werfer') ? G.spawn('werfer') : G.spawn('laeufer')) this.mix++; else break; } };
    // Die erste Fabrik hat Vorrang: ohne sie gibt es kein Einkommen außer Klicks
    const needFactory = G.factoryCount() === 0;
    if (threat && own < 4 && !needFactory) trySpawn(2);

    // „Universität zuerst“ (Messung REQ-6.06): solange die Universität fehlt, nur für sie sparen
    const saveForUni = o.uniFirst && !G.has('universitaet') && G.introShows('buildings') && G.factoryCount() > 0;
    // Bauen: passive Spieler bauen nur Fabriken
    const free = S.slots.findIndex(x => !x);
    if (free >= 0){
      const options = C.BUILDINGS.filter(b => G.buildBlock(free, b) === null && (!o.noBuild || b === 'fabrik') && !(o.forbid || []).includes(b) && (!saveForUni || b === 'universitaet'));
      if (options.length){
        const type = this.chooseBuilding(G, free, options, stats);
        const slot = this.chooseSlot(G, free, type);
        if (G.buildAt(slot, type) && stats) stats.built[type] = (stats.built[type] || 0) + 1;
      }
    }
    // Abriss: Zufalls-Bot reißt selten ab; gieriger Bot tauscht, sobald ein freigeschaltetes Gebäude fehlt
    if (!o.noBuild && free < 0){
      const missingUnlocked = C.BUILDINGS.filter(b => (S.pacing === 'karten' ? b !== 'fabrik' && G.isBuildable(b) : S.unlocked[b]) && !G.has(b));   // Modus karten: freigeschaltet über Karten (REQ-KP.01)
      if (o.strategy === 'zufall' && this.rng() < 0.01){
        const i = Math.floor(this.rng() * S.slots.length);
        if (G.demolish(i) && stats) stats.demolished++;
      } else if (o.strategy === 'gierig' && o.lookahead && missingUnlocked.length && S.material >= G.buildCost(missingUnlocked[0]) * 1.5){
        const cand = missingUnlocked[0];
        let best = -1, bestScore = score(G) + 5;          // Tausch nur bei klarem Vorteil
        const keep = forkGame(G);
        const subK = new Bot(Object.assign({}, o, { lookahead: false, strategy: 'zufall', seed: 55 }));
        for (let t = 0; t < o.horizon / DT && keep.S.status === 'running'; t++) subK.step(keep, null);
        bestScore = score(keep) + 5;
        for (let i = 0; i < S.slots.length; i++){
          const F = forkGame(G);
          F.demolish(i); F.buildAt(i, cand);
          const sub = new Bot(Object.assign({}, o, { lookahead: false, strategy: 'zufall', seed: 55 }));
          for (let t = 0; t < o.horizon / DT && F.S.status === 'running'; t++) sub.step(F, null);
          const sc = score(F);
          if (sc > bestScore){ bestScore = sc; best = i; }
        }
        if (best >= 0 && G.demolish(best)){
          if (stats) stats.demolished++;
          if (G.buildAt(best, cand) && stats) stats.built[cand] = (stats.built[cand] || 0) + 1;
        }
      }
    }
    // Welle vorziehen (REQ-6.07 c): gierig per Vorausschau (höchstens alle SIM_RUSH_EVERY_S), Zufall zufällig
    if (!o.noUnits && !G.waveRushBlock()){
      if (o.strategy === 'gierig' && o.lookahead){
        if (S.t >= (this.rushNext || 0)){
          this.rushNext = S.t + C.SIM_RUSH_EVERY_S;
          const sim = rush => { const F = forkGame(G); if (rush) F.rushWave();
            const sub = new Bot(Object.assign({}, o, { lookahead: false, strategy: 'zufall', seed: 66 }));
            for (let t = 0; t < o.horizon / DT && F.S.status === 'running'; t++) sub.step(F, null); return score(F); };
          if (sim(true) > sim(false) + 1 && G.rushWave() && stats) stats.rushes = (stats.rushes || 0) + 1;
        }
      } else if (this.rng() < 0.05 && G.rushWave() && stats) stats.rushes = (stats.rushes || 0) + 1;
    }
    // Forschung (REQ-5.07): gierig per Vorausschau über buildHorizon, Zufall zufällig; passive Profile forschen nicht
    if (!o.noUpgrades) this.research(G, stats);
    // Upgrades
    if (!o.noUpgrades && !saveForUni){
      for (const id of MAT_PRIO){
        if (!C.UPGRADES[id]) continue;
        const g = C.UPGRADES[id].group;
        if (!o.useWall && (g === 'mauer' || g.startsWith('turm')) && C.UPGRADES[id].base !== 'turm' && id !== 'mauer') continue;
        G.buy(id);
      }
    }
    // Einheiten mit Rücklage für Wirtschaft
    let econTarget = S.slots.some(x => !x) ? G.factoryCost() : Infinity;
    // „Universität zuerst“ (Messung REQ-6.06): für die Universität und danach für die günstigste Forschung sparen
    if (o.uniFirst){
      if (!G.has('universitaet') && G.isBuildable('universitaet') && G.introShows('buildings')) econTarget = G.buildCost('universitaet') / 0.7;
      else if (G.has('universitaet') && S.research.active.length < G.researchSlots()){
        const c = Math.min(...G.RESEARCH.filter(x => G.researchNext(x.id) && !['requires', 'maxed', 'locked'].includes(G.researchBlock(x.id))).map(x => G.researchCost(x.id)));
        if (Number.isFinite(c)) econTarget = c / 0.7;
      }
    }
    // Ist kein Bauplatz mehr frei (econTarget unendlich), gibt es nichts, wofür Material zurückzulegen wäre (REQ-R.03; vorher blieb es liegen)
    const reserve = threat || !Number.isFinite(econTarget) ? 0 : econTarget * 0.7;
    while (!o.noUnits && G.factoryCount() > 0 && S.material - reserve >= G.unitCost('laeufer') && own + S.queue.length < o.cap && !G.supplyFull()){
      const q = S.queue.length; trySpawn(1); if (S.queue.length === q) break;
    }
  }
}


/* Bewertung der angebotenen Bonuskarten (REQ-P.05, Inventar): je Karte Stand kopieren, Karte wählen, horizon Sekunden mit dem Zufalls-Bot spielen und den Spielstand bewerten.
   Alle Zweige starten vom selben Stand mit demselben Zufallsstrom; Unterschiede gehen auf die Karte zurück. */
function scanBonus(G, stats, prof, horizon){
  const offer = G.S.pendingDraft.options, sc = {};
  offer.forEach((id, i) => {
    if (G.OPT[id].pfad) return;
    const F = forkGame(G); F.chooseDraft(i);
    const sub = new Bot(Object.assign({}, prof, { lookahead: false, strategy: 'zufall', seed: 77 }));
    for (let t = 0; t < horizon / DT && F.S.status === 'running'; t++) sub.step(F, null);
    sc[id] = score(F);
  });
  if (Object.keys(sc).length) stats.scan.push({ t: G.S.t, level: G.S.pendingDraft.level, sc });
}

/* Eine vollständige Partie. Liefert Kennzahlen für den Bericht. */
/* Paarvergleich der Nachbarschaftsregeln (REQ-6.07 a): nbOff = Gebäudetyp, dessen Regel in dieser Partie ausgeschaltet ist */
export function playGame(job){
  const rule = job.nbOff ? KF_NEIGHBORS.find(r => r.building === job.nbOff) : null, per = rule ? rule.per : 0;
  if (rule) rule.per = 0;
  try { return playGameInner(job); } finally { if (rule) rule.per = per; }
}
function playGameInner({ diff, seed, profile, strategy = 'gierig', clickPolicy = 'always', cps, maxMin = 30, horizon = 45, forbid, uniFirst, forceResearch, lockResearch, noRush, pacing, pfad, banCards, sampleXp, bonusScan }){
  const prof = Object.assign({}, PROFILES[profile] || PROFILES.durchschnitt);
  if (cps !== undefined) prof.cps = cps;
  if (pfad) prof.pfad = pfad;                                              // Pfad-Variante (REQ-KP.09): militaer | wissen | festung
  const G = newGame(diff, seed, pacing);
  if (noRush) G.rushWave = () => false;                                   // Paarvergleich: ohne „Welle vorziehen“ (REQ-6.07 c)
  const stats = { built: {}, demolished: 0, offered: {}, picked: {}, draftTimes: [], offers: [], researched: {}, scan: [] };
  // Handlungen in den ersten SIM_STYLE_WINDOW_S Sekunden: Anteil der Einheitenkäufe (Merkmal der Strategie für compare-human)
  const acts = { units: 0, other: 0 };
  const picks = [], builtAt = {};                                            // Kartenpfad (REQ-KP.09): gewählte Karten mit Zeit, erste Bauzeit je Gebäude
  for (const name of ['spawn', 'buildAt', 'buy', 'startResearch', 'repair', 'chooseDraft']){
    const f = G[name];
    G[name] = (...a) => {
      const pickId = name === 'chooseDraft' && G.S.pendingDraft ? G.S.pendingDraft.options[a[0]] : null;
      const ok = f(...a);
      if (ok && pickId) picks.push({ t: G.S.t, id: pickId });
      if (ok && name === 'buildAt' && builtAt[a[1]] === undefined) builtAt[a[1]] = G.S.t; if (ok && name !== 'chooseDraft' && G.S.t <= C.SIM_STYLE_WINDOW_S){ if (name === 'spawn') acts.units++; else acts.other++; } return ok; };
  }
  let bot;
  if (strategy === 'einheiten-zuerst'){
    const recordDraft = F => {
      const offer = F.S.pendingDraft.options;
      if (bonusScan) scanBonus(F, stats, prof, bonusScan);
      for (const id of offer) stats.offered[id] = (stats.offered[id] || 0) + 1;
      const pi = KF_BROWSER_BOT.pfadPick(F, offer, prof.pfad), ci = pi === null ? 0 : pi;
      stats.picked[offer[ci]] = (stats.picked[offer[ci]] || 0) + 1;
      stats.draftTimes.push({ t: F.S.t, level: F.S.pendingDraft.level });
      offer.forEach((oid, i) => stats.offers.push({ id: oid, tier: F.cardTaken(oid) + 1, chosen: i === ci }));
    };
    const simple = KF_BROWSER_BOT(G, Object.assign({}, prof, forbid ? { forbid } : {}), {
      draft: recordDraft, built: type => { stats.built[type] = (stats.built[type] || 0) + 1; },
      researched: id => { stats.researched[id] = (stats.researched[id] || 0) + 1; } });
    bot = { step: () => simple.step(DT) };
  } else {
    const b = new Bot(Object.assign(prof, { strategy, clickPolicy, seed, horizon, forbid, uniFirst }));
    bot = { step: () => b.step(G, stats) };
  }
  const dirs = directionTracker({ lateralOf: G.lateralOf });
  const xpAt = sampleXp ? sampleXp.map(() => null) : null;                  // Referenzlauf (REQ-P.02): EP-Stand zu festen Zeitpunkten
  let wallFall = null, sx = 0;
  const steps = maxMin * 60 / DT;
  // Paarvergleich (REQ-6.06): Forschung gesperrt bzw. zum Zeitpunkt forceResearch.at in Stufe 1 geschenkt
  if (lockResearch || forceResearch) G.S.research.locked = [lockResearch || forceResearch.id];
  if (banCards) for (const id of banCards) G.S.research.banned.push(id);                     // Paarvergleich (REQ-KP.09): Karte gesperrt
  for (let i = 0; i < steps && G.S.status === 'running'; i++){
    if (forceResearch && G.S.t >= forceResearch.at && !G.S.research.done[forceResearch.id]){
      G.S.research.done[forceResearch.id] = 1; G.S.research.ver++;
    }
    bot.step();
    dirs.sample(G.S, DT);
    if (xpAt) while (sx < sampleXp.length && G.S.t >= sampleXp[sx]) xpAt[sx++] = G.S.xpTotal;
    if (wallFall === null && G.S.sections.some((s, k) => k !== GATE && s.hp <= 0)) wallFall = G.S.t;
  }
  const S = G.S;
  // Ungenutztes Material (REQ-6.07): Anteil des in der Spätphase erzeugten Materials, der am Ende im Bestand liegt
  const lateMade = S.stats.prod.late.click + S.stats.prod.late.auto;
  const unused = lateMade > 0 ? Math.min(S.material, lateMade) / lateMade : null;
  return {
    diff, profile, strategy, clickPolicy, seed,
    status: S.status, t: S.t,
    combo: S.slots.filter(Boolean).map(x => x.type).sort().join('+') || '–',
    built: stats.built, demolished: stats.demolished,
    offered: stats.offered, picked: stats.picked, draftTimes: stats.draftTimes, offers: stats.offers,
    wallFall, maxArmy: S.stats.maxArmy || 0, research: Object.keys(S.research.done), uni: !!stats.built.universitaet,
    xpPassive: S.stats.xpPassive || 0, xpKill: S.stats.xpKill || 0, fightShare: S.stats.armyTime ? (S.stats.fightTime || 0) / S.stats.armyTime : null,
    prod: S.stats ? S.stats.prod : null, level: S.level ?? null,
    cards: Object.keys(S.draft.stacks).filter(k => S.draft.stacks[k] > 0), waves: S.stats.waves || 0, wavesFull: S.stats.wavesFull || 0,
    unused, lateMade, dir: dirs.result(), unitShare: acts.units + acts.other ? acts.units / (acts.units + acts.other) : null,
    xpAt, wahlen: S.stats.wahlen || null, scan: stats.scan, picks, builtAt, freeChoices: S.stats.freeChoices || 0, researchTimes: S.stats.researchDone || [], rushSpent: S.stats.rushSpent || 0, interest: S.stats.interest || 0, waveRushes: S.stats.waveRushes || 0,
  };
}

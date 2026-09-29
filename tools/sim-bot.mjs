// Klammerfront – Bots für die Balancing-Simulation (7.1).
// Ein Bot spielt eine Partie ohne Browser. Strategien: 'zufall' und 'gierig' (Vorausschau per Kopie des Spielstands).
import { loadCore } from './load-core.mjs';

const { KlammerCore, KF_CONFIG: C } = loadCore();
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

export function newGame(diff, seed){
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
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
    this.clickAcc = 0; this.actAcc = 0; this.mix = 0;
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
    if (this.o.strategy === 'zufall' || !this.o.lookahead) return options[Math.floor(this.rng() * options.length)];
    let best = null, bestScore = -Infinity;
    for (const type of options){
      const F = forkGame(G);
      F.buildAt(slot, type);
      const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 99 }));
      // Gebäude wirken langsamer als Draft-Optionen: längere Vorausschau
      for (let t = 0; t < this.o.buildHorizon / DT && F.S.status === 'running'; t++) sub.step(F, null);
      const sc = score(F);
      if (sc > bestScore){ bestScore = sc; best = type; }
    }
    return best;
  }
  /* Draft-Wahl (REQ-02): zufällig oder per Vorausschau */
  draft(G, stats){
    const offer = G.S.pendingDraft.options;
    let pick = 0;
    if (this.o.strategy === 'gierig' && this.o.lookahead && offer.length > 1){
      let bestScore = -Infinity;
      offer.forEach((id, i) => {
        const F = forkGame(G);
        F.chooseDraft(i);
        const sub = new Bot(Object.assign({}, this.o, { lookahead: false, strategy: 'zufall', seed: 77 }));
        for (let t = 0; t < this.o.horizon / DT && F.S.status === 'running'; t++) sub.step(F, null);
        const sc = score(F);
        if (sc > bestScore){ bestScore = sc; pick = i; }
      });
    } else pick = Math.floor(this.rng() * offer.length);
    if (stats){
      for (const id of offer) stats.offered[id] = (stats.offered[id] || 0) + 1;
      const id = offer[pick];
      stats.picked[id] = (stats.picked[id] || 0) + 1;
      stats.draftTimes.push({ t: G.S.t, level: G.S.pendingDraft.level });
    }
    G.chooseDraft(pick);
  }
  act(G, stats){
    const S = G.S, o = this.o;
    if (S.status !== 'running') return;
    if (o.useWall) S.sections.forEach((sec, i) => { if (sec.hp < G.sectionMax(i) * 0.5) G.repair(i); });
    const own = S.units.filter(u => u.side === 'p').length;
    const threat = S.units.some(u => u.side === 'e' && u.x < 400);
    const trySpawn = n => { if (o.noUnits) return; for (let k = 0; k < n; k++){ if (own + S.queue.length >= o.cap) break; if (this.mix % 3 === 2 ? G.spawn('werfer') : G.spawn('laeufer')) this.mix++; else break; } };
    // Die erste Fabrik hat Vorrang: ohne sie gibt es kein Einkommen außer Klicks
    const needFactory = G.factoryCount() === 0;
    if (threat && own < 4 && !needFactory) trySpawn(2);

    // Bauen: passive Spieler bauen nur Fabriken
    const free = S.slots.findIndex(x => !x);
    if (free >= 0){
      const options = C.BUILDINGS.filter(b => G.buildBlock(free, b) === null && (!o.noBuild || b === 'fabrik') && !(o.forbid || []).includes(b));
      if (options.length){
        const type = this.chooseBuilding(G, free, options, stats);
        if (G.buildAt(free, type) && stats) stats.built[type] = (stats.built[type] || 0) + 1;
      }
    }
    // Abriss: Zufalls-Bot reißt selten ab; gieriger Bot tauscht, sobald ein freigeschaltetes Gebäude fehlt
    if (!o.noBuild && free < 0){
      const missingUnlocked = C.BUILDINGS.filter(b => S.unlocked[b] && !G.has(b));
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
    // Upgrades
    if (!o.noUpgrades){
      for (const id of MAT_PRIO){
        if (!C.UPGRADES[id]) continue;
        const g = C.UPGRADES[id].group;
        if (!o.useWall && (g === 'mauer' || g.startsWith('turm')) && C.UPGRADES[id].base !== 'turm' && id !== 'mauer') continue;
        G.buy(id);
      }
    }
    // Einheiten mit Rücklage für Wirtschaft
    const econTarget = S.slots.some(x => !x) ? G.factoryCost() : Infinity;
    const reserve = threat ? 0 : econTarget * 0.7;
    while (!o.noUnits && G.factoryCount() > 0 && S.material - reserve >= G.unitCost('laeufer') && own + S.queue.length < o.cap && !G.supplyFull()){
      const q = S.queue.length; trySpawn(1); if (S.queue.length === q) break;
    }
  }
}

/* Eine vollständige Partie. Liefert Kennzahlen für den Bericht. */
export function playGame({ diff, seed, profile, strategy = 'gierig', clickPolicy = 'always', cps, maxMin = 30, horizon = 45, forbid }){
  const prof = Object.assign({}, PROFILES[profile] || PROFILES.durchschnitt);
  if (cps !== undefined) prof.cps = cps;
  const G = newGame(diff, seed);
  const bot = new Bot(Object.assign(prof, { strategy, clickPolicy, seed, horizon, forbid }));
  const stats = { built: {}, demolished: 0, offered: {}, picked: {}, draftTimes: [] };
  const steps = maxMin * 60 / DT;
  for (let i = 0; i < steps && G.S.status === 'running'; i++) bot.step(G, stats);
  const S = G.S;
  return {
    diff, profile, strategy, clickPolicy, seed,
    status: S.status, t: S.t,
    combo: S.slots.filter(Boolean).map(x => x.type).sort().join('+') || '–',
    built: stats.built, demolished: stats.demolished,
    offered: stats.offered, picked: stats.picked, draftTimes: stats.draftTimes,
    prod: S.stats ? S.stats.prod : null, level: S.level ?? null,
    cards: Object.keys(S.draft.stacks).filter(k => S.draft.stacks[k] > 0), waves: S.stats.waves || 0, wavesFull: S.stats.wavesFull || 0,
  };
}

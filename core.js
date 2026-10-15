/* Klammerfront – Spiellogik.
   Kein Zugriff auf Seite, Fenster oder Speicher: dieselbe Datei läuft im Browser und im Simulator.
   Lädt nach config.js. Texte erscheinen hier nur als Schlüssel für die Sprachdateien. */
const KlammerCore = (() => {
'use strict';
const C = KF_CONFIG;
const W = C.LANE, PBW = C.PLAYER_BASE_WIDTH, EBW = C.ENEMY_BASE_WIDTH;
const LANES = C.LANE_COUNT, GATE = C.GATE_LANE, SLOTS = C.GRID_SIZE * C.GRID_SIZE;
const OPTIONS = (typeof KF_DRAFT_OPTIONS !== 'undefined') ? KF_DRAFT_OPTIONS : [];
/* Kartenpfad (REQ-KP.01, KP.02): Pfadkarten aus data/kartenpfad.js sind Optionen mit Familie; im Pool nur im Pacing-Modus 'karten' (drawOptions, optionAvailable).
   Aus ihren Datensätzen entstehen die Sperren (Schlüssel) und Upgrade-Stufen des Modus 'karten' samt ihrer Quelle (Karte oder Forschung). */
const PFAD = (typeof KF_PFAD !== 'undefined') ? KF_PFAD : null;
const PFAD_OPTIONS = PFAD ? PFAD.karten.map(k => ({ id: k.id, category: k.familie, family: k.familie, rarity: k.rarity || 'common', nameKey: k.nameKey, descKey: k.descKey, tiers: k.tiers, pfad: k })) : [];
/* Doktrinen (Teil 5, REQ-K5.07): aus data/doktrinen.js; Karten der Familie 'doktrin' mit einer Stufe, Wirkung und Einschränkung über dieselbe Pipeline wie die Karten */
const DOKTRINEN = (typeof KF_DOKTRINEN !== 'undefined') ? KF_DOKTRINEN : [];
const DOK = Object.fromEntries(DOKTRINEN.map(d => [d.id, d]));
const DOKTRIN_OPTIONS = DOKTRINEN.map(d => ({ id: d.id, category: 'doktrin', family: 'doktrin', rarity: 'doktrin', nameKey: d.nameKey, descKey: d.descKey, kat: d.kat,
  abWahl: C.DOKTRIN.abWahl, wirkt: d.wirkt, tiers: [{ effect: d.effect || [], drawback: d.drawback || [] }], doktrin: d }));
/* Karten des Teils 6 (data/karten6.js): übernommene Regeln der Linienstufen, Synergiekarten, Karten aus Gebäude-Ausbauten; nur im Modus karten (nurKarten) */
const KARTEN6_OPTIONS = (typeof KF_KARTEN6 !== 'undefined' ? KF_KARTEN6 : []).map(o => Object.assign({ nurKarten: true }, o));
const ALL_OPTIONS = [...OPTIONS, ...PFAD_OPTIONS, ...DOKTRIN_OPTIONS, ...KARTEN6_OPTIONS];
/* Gebäude-Varianten (Teil 4, REQ-S.05): aus data/varianten.js, nur im Modus karten; die Strategielinien aus Teil 4 und 5 entfallen (Teil 6, REQ-K6.02) */
const VARIANTEN = (typeof KF_VARIANTEN !== 'undefined') ? KF_VARIANTEN : null;
const VARIANTS = VARIANTEN ? VARIANTEN.varianten : [];
const VAR = Object.fromEntries(VARIANTS.map(v => [v.id, v]));
const OPT = Object.fromEntries(ALL_OPTIONS.map(o => [o.id, o]));
const PACING_DERIVED = (() => {
  if (!PFAD) return null;
  const gesperrt = new Set(), stufen = {}, quellen = {};
  /* Ein Schlüssel hat eine Quelle (Karte oder Forschung); öffnen ihn zwei, die sich gegenseitig ausschließen (Exklusivpfade), steht die Liste aller dort */
  const add = (key, quelle) => {
    const old = quellen[key];
    quellen[key] = old === undefined ? quelle : [].concat(old, quelle);
    const m = /^stufe:(\w+):(\d+)$/.exec(key);
    if (!m){ gesperrt.add(key); return; }
    const list = (stufen[m[1]] = stufen[m[1]] || []), e = list.find(x => x.ab === Number(m[2]));
    if (e) e.quelle = quellen[key]; else list.push({ ab: Number(m[2]), quelle: quellen[key] });
  };
  for (const k of PFAD.karten){
    for (const key of k.schaltetFrei || []) add(key, k.id);
    for (const r of k.oeffnetForschung || []) add('forschung:' + r, k.id);
  }
  for (const r of PFAD.forschungen || []) for (const key of r.schaltetFrei || []) add(key, r.id);
  return { gesperrt: [...gesperrt], stufen, quellen };
})();
const RESEARCH_BASE = (typeof KF_RESEARCH !== 'undefined') ? KF_RESEARCH : [];
const RESEARCH = [...RESEARCH_BASE, ...(typeof KF_PFAD !== 'undefined' && KF_PFAD.forschungen ? KF_PFAD.forschungen : [])];   // Forschungen der Pfadkarten gelten nur im Modus karten (researchBlock)
const RES = Object.fromEntries(RESEARCH.map(r => [r.id, r]));
const NEIGHBORS = (typeof KF_NEIGHBORS !== 'undefined') ? KF_NEIGHBORS : [];       // Nachbarschaftsregeln (REQ-6.07 a)
const NB_RULE = Object.fromEntries(NEIGHBORS.map(r => [r.building, r]));
/* Orthogonale Nachbarn eines Platzes im Raster (oben, unten, links, rechts) */
const adjacent = (i, diagonal = false) => { const g = C.GRID_SIZE, r = Math.floor(i / g), c = i % g, out = [];
  if (r > 0) out.push(i - g); if (r < g - 1) out.push(i + g); if (c > 0) out.push(i - 1); if (c < g - 1) out.push(i + 1);
  if (diagonal){ if (r > 0 && c > 0) out.push(i - g - 1); if (r > 0 && c < g - 1) out.push(i - g + 1); if (r < g - 1 && c > 0) out.push(i + g - 1); if (r < g - 1 && c < g - 1) out.push(i + g + 1); }
  return out; };
/* Stufenschwellen: kumulierte Erfahrungspunkte (EP) für Stufe n */
const xpStep = n => C.XP_BASE * Math.pow(C.XP_GROWTH, n - 1);
function xpForLevel(n){ let s = 0; for (let k = 1; k <= n; k++) s += xpStep(k); return s; }
const SAVE_VERSION = 11;                      // bei inkompatiblen Änderungen am Spielstand erhöhen (mit SAVE_KEY)
/* Werfer und seine Ersatzeinheiten teilen die Werfer-Karten (Lange Wurfarme …) */
const isThrower = type => (C.UNITS[type].base || type) === 'werfer';
const isRangedType = type => C.UNITS[type].range > C.RANGED_MIN_RANGE;

/* Seedbarer Zufallsgenerator (mulberry32). Der Zustand liegt im Spielstand, damit Kopien identisch weiterlaufen. */
function nextRandom(state){
  const s = (state + 0x6D2B79F5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/* Verteilung einer Gruppe von n Einheiten auf die Lanes (REQ-12.1).
   strong = Lane (oben oder unten) mit der stärkeren angekündigten Gegnerwelle. Kein Zufall. */
function distribute(n, strong){
  const O = C.LANE_ORDER;
  if (n <= 0) return [];
  if (n === 1) return [O[0]];
  if (n === 2) return [O[0], strong ?? O[1]];
  const out = [];
  for (let i = 0; i < n; i++) out.push(O[i % O.length]);
  return out;
}

function freshState(diff, seed){
  const lvl = {};
  for (const id in C.UPGRADES) lvl[id] = 0;
  const d = C.DIFFICULTY[diff || C.DEFAULT_DIFFICULTY];
  return {
    v: SAVE_VERSION, diff: diff || C.DEFAULT_DIFFICULTY, status: diff ? 'running' : 'setup', t: 0,
    rng: (seed >>> 0) || 1,
    material: 0, materialTotal: 0, xp: 0, xpTotal: 0,
    lvl, slots: new Array(SLOTS).fill(null), slotVer: 0, unlocked: {}, revealed: {}, kontorT: 0, intro: false,
    sections: C.SECTION_HP.map(hp => ({ hp, lastHit: -1e9, repairCd: 0 })), enemyBaseHp: d.enemyBaseHp,
    nextWave: C.WAVE_INTERVAL_S, waveNo: 0, nextOwnWave: C.WAVE_INTERVAL_S, ownWaveNo: 0, lastOrder: null, nextEnemy: [], nextEnemySiege: false, forms: [],
    // Belagerungswelle: die erste reguläre Welle ab Minute SIEGE_MINUTE (REQ-19.2)
    siegeWaveT: Math.ceil(C.SIEGE_MINUTE * 60 / C.WAVE_INTERVAL_S) * C.WAVE_INTERVAL_S, siegeAnnouncedAt: null, siegeDone: false, enemyQueue: [], queue: [], units: [], nextId: 1,
    turretCd: {}, enemyTurretCd: 0,
    druck: null,                      // Testschalter ?druck=hoch (Teil 4, REQ-S.08): null | 'hoch'; verstärkt die regulären Gegnerwellen ab C.DRUCK.hoch.abMinute
    pacing: 'standard', unlocks: {}, replace: {}, pacingVer: 0, pfad: { choices: 0, lastPickT: 0, sinceDoktrin: 0 },    // Pacing-Modus, geöffnete Schlüssel, Einheitenersatz (REQ-KP.01); ohne Modus leer
    budget: 0,                        // Forschungsbudget (Teil 5): Index in C.KARTEN.budget.stufen
    clicks: 0, kills: 0, losses: 0, firstWaveSeen: false, alarms: 0, waveSize: {},       // waveSize: Zahl der Einheiten je Gegnerwelle für die EP der abgewehrten Welle (Modus karten, Teil 5)
    hold: null,                       // Schonfrist (REQ-T.03): null | { maxS, size } – solange gesetzt, rückt die erste Gegnerwelle nicht aus
    firstBounty: false,               // Kriegsbeute (REQ-T2.04): ist die erste Gegnerwelle besiegt, reichen die EP mindestens für die erste Kartenwahl
    level: 0, pendingLevels: 0, pendingDraft: null, draft: { stacks: {}, ver: 0 }, emergencyUsed: 0,
    research: { done: {}, active: [], ver: 0, banned: [], fresh: false },     // Forschungsbaum der Universität (REQ-5.07)
    clickTimes: [],
    stats: { prod: { early: { click: 0, auto: 0, time: 0 }, mid: { click: 0, auto: 0, time: 0 }, late: { click: 0, auto: 0, time: 0 } } },
    log: [],
  };
}

function create(){
  let S = freshState(null, 1);
  const FX = { on: true, shots: [], fx: [], baseFlash: { p: [0, 0, 0], e: 0 }, lunge: new Map() };

  const rnd = () => { const [v, s] = nextRandom(S.rng); S.rng = s; return v; };
  function log(key, params){
    S.log.unshift({ t: S.t, key, params: params || {} });
    if (S.log.length > C.LOG_LINES) S.log.length = C.LOG_LINES;
  }
  /* Ereignisse für Zuhörer außerhalb der Logik (REQ-T.06): materialProduced { n, source }, buildingBuilt { type, slot }, unitBought { type },
     waveDeparted { side, size }, enemyWaveDefeated { waveNo }. Ohne Zuhörer geschieht nichts; die Logik hängt nie von ihnen ab. */
  const listeners = [];
  const emit = (name, data) => { for (const f of listeners) f(name, data); };
  function on(fn){ listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }
  let foesPresent = false;                       // für enemyWaveDefeated; nicht im Spielstand

  /* ---------- Draft-Modifikatoren (zwischengespeichert, bis sich die Wahl ändert) ---------- */
  let modCache = { ver: -1, key: null, mul: {}, add: {} };
  function mods(){
    const key = S.draft, ver = S.draft.ver + ':' + S.research.ver + ':' + (S.slotVer || 0);
    if (modCache.key === key && modCache.ver === ver) return modCache;
    const mul = {}, add = {};
    const apply = e => {
      if (e.mul !== undefined) mul[e.stat] = (mul[e.stat] ?? 1) * e.mul;
      if (e.add !== undefined) add[e.stat] = (add[e.stat] ?? 0) + e.add;
    };
    // Forschung wirkt über dieselbe Pipeline wie Karten (REQ-5.07); es zählt die höchste erforschte Stufe
    for (const [id, n] of Object.entries(S.research.done)){
      const tier = RES[id] && n > 0 ? RES[id].tiers[Math.min(n, RES[id].tiers.length) - 1] : null;
      if (!tier) continue;
      for (const e of tier.effect || []){
        if (e.mul !== undefined) mul[e.stat] = (mul[e.stat] ?? 1) * e.mul;
        if (e.add !== undefined) add[e.stat] = (add[e.stat] ?? 0) + e.add;
      }
    }
    // Es wirkt nur die höchste gewählte Stufe einer Karte; ihre Werte sind absolut (REQ-18.2/18.3)
    for (const [id, n] of Object.entries(S.draft.stacks)){
      const tier = cardTier(id, n); if (!tier) continue;
      for (const e of [...(tier.effect || []), ...(tier.drawback || [])]){
        if (!e.stat) continue;
        if (e.mul !== undefined) mul[e.stat] = (mul[e.stat] ?? 1) * e.mul;
        if (e.add !== undefined) add[e.stat] = (add[e.stat] ?? 0) + e.add;
      }
      // Synergie (REQ-45): stärker mit der Zahl gewählter Karten der eigenen Kategorie, die Karte selbst eingeschlossen
      const syn = OPT[id].synergy;
      if (syn) mul[syn.stat] = (mul[syn.stat] ?? 1) * (1 + synergyValue(id));
    }
    // Gebäude-Varianten (REQ-S.05): Wirkung je Variantentyp einmal (variantYield gilt je Gebäude, siehe matRate)
    for (const vid of standingVariants()) for (const e of VAR[vid].effect) if (e.stat !== 'variantYield') apply(e);
    modCache = { ver, key, mul, add };
    return modCache;
  }
  /* Stehende, fertige Varianten (je Variantentyp eine); nur im Modus karten */
  const standingVariants = () => S.pacing !== 'karten' ? [] : [...new Set(S.slots.filter(sl => sl && sl.variant && !sl.upg && VAR[sl.variant]).map(sl => sl.variant))];
  const mMul = stat => mods().mul[stat] ?? 1;
  /* Stufe n (1-basiert) einer Karte; null, wenn es sie nicht gibt */
  function cardTier(id, n){ const o = OPT[id]; if (!o || n <= 0) return null; const tiers = tiersOf(o); return tiers[Math.min(n, tiers.length) - 1]; }
  /* Stufen einer Karte im laufenden Modus: im Modus karten können sie in C.KARTEN.kartenTiers abweichen (Teil 4, REQ-S.02 C2, S.03) */
  const tiersOf = o => (S && S.pacing === 'karten' && C.KARTEN.kartenTiers && C.KARTEN.kartenTiers[o.id]) || o.tiers;
  const cardTaken = id => S.draft.stacks[id] || 0;
  const categoryCount = cat => Object.keys(S.draft.stacks).filter(id => S.draft.stacks[id] > 0 && OPT[id] && OPT[id].category === cat).length;
  const synergyValue = id => { const o = OPT[id]; return o && o.synergy && cardTaken(id) > 0 ? o.synergy.perCard * categoryCount(o.category) : 0; };
  const mAdd = stat => mods().add[stat] ?? 0;

  /* ---------- Pacing (REQ-KP.01): Freischaltungen, Upgrade-Stufen, Einheitenersatz ----------
     Im Modus 'standard' (oder ohne Eintrag in C.PACING) ist nichts gesperrt. */
  const pacingCfg = () => S.pacing === 'karten' && PACING_DERIVED ? PACING_DERIVED : ((S.pacing && C.PACING[S.pacing]) || null);
  const isGated = key => { const c = pacingCfg(); return !!c && !!c.gesperrt && c.gesperrt.includes(key); };
  const isOpen = key => !isGated(key) || !!S.unlocks[key];
  function unlockKey(key){
    if (isOpen(key)) return false;
    S.unlocks[key] = S.t || 0.001; S.pacingVer++;                      // Zeitpunkt der Freischaltung (Sitzungsprotokoll)
    return true;
  }
  /* Quelle erfüllt: Karte gewählt oder Forschung abgeschlossen */
  const sourceMet = q => Array.isArray(q) ? q.some(sourceMet) : (S.draft.stacks[q] || 0) > 0 || (S.research.done[q] || 0) > 0;
  /* Quelle, die für den nächsten Kauf des Upgrades fehlt (null = frei) */
  function stageSource(id){
    const c = pacingCfg(), list = c && c.stufen && c.stufen[id];
    if (!list) return null;
    const n = S.lvl[id] + 1;
    let best = null;
    for (const e of list) if (e.ab <= n && (!best || e.ab > best.ab)) best = e;
    return best && !sourceMet(best.quelle) ? best.quelle : null;
  }
  /* Sprachschlüssel für den Namen eines Inhalts: 'bau:kaserne' → bld.kaserne.name, 'einheit:werfer' → unit.werfer.name */
  const keyNameKey = key => { const [kind, id] = key.split(':'); return kind === 'bau' ? `bld.${id}.name` : kind === 'einheit' ? `unit.${id}.name` : kind === 'forschung' && RES[id] ? RES[id].nameKey : key; };
  /* Ausgeschlossen: eine Exklusivkarte wurde gewählt (REQ-KP.07); Forschungen und Einheiten, die nur die ausgeschlossene Karte öffnet, sind unerreichbar */
  const cardExcluded = id => { const o = OPT[id]; return !!(o && o.pfad && (o.pfad.exklusivMit || []).some(x => cardTaken(x) > 0)); };
  function sourceReachable(q){
    if (Array.isArray(q)) return q.some(sourceReachable);
    if (sourceMet(q)) return true;
    if (OPT[q]) return !cardExcluded(q);
    const card = PFAD_OPTIONS.find(o => (o.pfad.oeffnetForschung || []).includes(q));
    return !card || !cardExcluded(card.id);
  }
  const ownType = type => S.replace[type] || type;
  /* Werte einer Einheit nach Typ und Seite (ohne Zufall); makeUnit und der Einheitenersatz nutzen dieselbe Rechnung */
  function unitStats(side, type){
    const spec = C.UNITS[type], p = side === 'p';
    let hp = spec.hp * (p ? hpMultP() * mMul('unitHp') * (isThrower(type) ? mMul('werferHp') : 1) : enemyHpMult());
    if (p && isRangedType(type) && mAdd('rangedHpOne') > 0) hp = 1;                                   // Wagnis „Glaskanonen“: Fernkämpfer haben 1 Lebenspunkt
    return { speed: spec.speed, range: unitRange(side, type), ranged: isRangedType(type), hp, dmg: spec.dmg * (p ? dmgMultP() : enemyDmgMult()), cdMax: spec.cd * (p ? cdMultP() : 1) };
  }
  /* Einheitenersatz: ab jetzt entsteht to statt from; Einheiten in der Warteschlange und auf dem Feld werden aufgewertet, nichts wird gelöscht
     und die Lebenspunkte bleiben im selben Verhältnis. Gibt die Zahl der aufgewerteten Einheiten zurück. */
  function replaceUnit(from, to){
    if (!C.UNITS[from] || !C.UNITS[to] || from === to || S.replace[from] === to) return 0;
    S.replace[from] = to; S.pacingVer++;
    let n = 0;
    for (const q of S.queue) if (q.type === from){ q.type = to; n++; }
    for (const u of S.units){
      if (u.side !== 'p' || u.type !== from) continue;
      const s = unitStats('p', to), ratio = u.maxHp > 0 ? u.hp / u.maxHp : 1;
      Object.assign(u, { type: to, speed: s.speed, range: s.range, ranged: s.ranged, maxHp: s.hp, hp: s.hp * ratio, dmg: s.dmg, cdMax: s.cdMax });
      u.cd = Math.min(u.cd, u.cdMax);
      n++;
    }
    return n;
  }

  /* ---------- abgeleitete Werte ---------- */
  const has = b => S.slots.some(s => s && s.type === b && !s.upg);                     // ein Gebäude in Aufwertung wirkt nicht (REQ-S.05)
  const countType = type => S.slots.filter(s => s && s.type === type && !s.upg).length;
  const standingCount = type => S.slots.filter(s => s && s.type === type).length;       // auch Gebäude in Aufwertung: sie belegen den Platz
  // Wirksame Stufe: Upgrades eines abgerissenen Gebäudes bleiben gespeichert, wirken aber nicht (REQ-01.8)
  const lv = id => (C.BUILDINGS.includes(C.UPGRADES[id].group) && !has(C.UPGRADES[id].group)) ? 0 : S.lvl[id];
  const baseFactor   = () => { const b = C.KARTEN.basisFaktor; return typeof b === 'object' ? b[S.diff] ?? 1 : b; };       // Zahl oder Tabelle je Schwierigkeitsgrad
  /* Modus karten: längere Partien über die gegnerische Basis (basisFaktor); KARTEN.gegner überschreibt Werte des Grades nur in diesem Modus (Teil 5, REQ-K5.02: Schwer soll nicht mühelos gewonnen werden) */
  const diffCfg      = () => {
    if (S.pacing !== 'karten') return C.DIFFICULTY[S.diff];
    const over = C.KARTEN.gegner && C.KARTEN.gegner[S.diff], f = baseFactor();
    if (!over && f === 1) return C.DIFFICULTY[S.diff];
    return Object.assign({}, C.DIFFICULTY[S.diff], over || {}, f !== 1 ? { enemyBaseHp: C.DIFFICULTY[S.diff].enemyBaseHp * f } : {});
  };
  // Klickwert wächst nur über die gedeckelte Presse (REQ-03.3); Material kommt sonst aus Fabriken (REQ-16.2)
  const clickPower   = () => (1 + C.FX_PRESSE * lv('presse')) * mMul('clickYield');
  const factoryCount = () => countType('fabrik');
  // Nachtschicht (REQ-6.03, ersetzt die frühere Wirkung außerhalb der Partie): Fabriken in der Spätphase stärker
  const factoryRate  = () => C.FACTORY_BASE_RATE * mMul('factoryYield') * mMul('autoProd') * mMul('materialYield') * (phase() === 'late' ? mMul('lateYield') : 1);
  /* Karte Querverbindung (Teil 6, vorher Linie Wirtschaft Stufe 1): Nachbarschaftsboni zählen auch diagonale Nachbarn */
  const nbDiagonal = () => S.pacing === 'karten' && mAdd('nbDiagonal') > 0;
  /* Nachbarschaft (REQ-6.07 a): Zahl der passenden Nachbarn eines Gebäudes auf Platz i (höchstens rule.max) bzw. für einen Typ,
     der dort stünde (Vorschau); Wert der Regel = per × Zahl */
  function neighborCount(i, type, slots = S.slots){
    const rule = NB_RULE[type];
    if (!rule) return 0;
    let n = 0; for (const j of adjacent(i, nbDiagonal())) if (slots[j] && slots[j].type === rule.with && !slots[j].upg) n++;
    return Math.min(rule.max, n);
  }
  /* Zunfthaus (Sonderbau der Doktrin Zunftordnung): der Nachbarschaftsbonus dieser Fabrik wirkt im Vielfachen C.DOKTRIN.zunfthaus.nachbarFaktor */
  /* nbFabrik: Karte „Bessere Fabriken“, Stufe 2 und 3 (Teil 5): der Nachbarschaftsbonus aller Fabriken wirkt im Vielfachen */
  const nbFactor = (i, type, slots = S.slots) => {
    if (type !== 'fabrik' || S.pacing !== 'karten') return 1;
    const sl = slots[i];
    return mMul('nbFabrik') * (sl && sl.variant === 'zunfthaus' && !sl.upg ? C.DOKTRIN.zunfthaus.nachbarFaktor : 1);
  };
  const neighborValue = (i, type, slots) => { const rule = NB_RULE[type]; return rule ? rule.per * neighborCount(i, type, slots) * nbFactor(i, type, slots) : 0; };
  /* Summe der Regelwerte aller Gebäude eines Typs (Schmiede, Kaserne, Universität, Kontor gibt es je einmal) */
  const nbTotal = type => S.slots.reduce((a, sl, i) => a + (sl && sl.type === type && !sl.upg ? neighborValue(i, type) : 0), 0);
  /* Vorschau für Platz i und Typ: was das Gebäude dort erhielte und welchen Nachbarn es etwas gäbe */
  function neighborPreview(i, type){
    const slots = S.slots.slice(); slots[i] = { type };
    const gets = NB_RULE[type] ? { rule: NB_RULE[type], n: neighborCount(i, type, slots), value: neighborValue(i, type, slots) } : null;
    const gives = [];
    for (const j of adjacent(i, nbDiagonal())){
      const sl = S.slots[j]; if (!sl || !NB_RULE[sl.type] || NB_RULE[sl.type].with !== type) continue;
      const before = neighborValue(j, sl.type), after = neighborValue(j, sl.type, slots);
      if (after !== before) gives.push({ slot: j, type: sl.type, rule: NB_RULE[sl.type], delta: after - before });
    }
    return { gets, gives };
  }
  /* Nutzen eines Bauplatzes für einen Typ, ohne Einheit: erhaltene plus gegebene Regelwerte, jeweils in Richtung des Vorteils
     (negative Regeln wie Einheitenkosten zählen als Gewinn, wenn sie sinken). Für Bots und Sortierung, nicht für Spielregeln. */
  function neighborGain(i, type){
    const p = neighborPreview(i, type), sgn = r => Math.sign(r.per);
    return (p.gets ? p.gets.value * sgn(p.gets.rule) : 0) + p.gives.reduce((a, g) => a + g.delta * sgn(g.rule), 0);
  }
  // Fabriken einzeln: jede mit ihrem Nachbarschaftsbonus (Fabrik neben Fabrik)
  const variantYield = sl => {
    if (!sl.variant || sl.upg || S.pacing !== 'karten' || !VAR[sl.variant]) return 0;
    return VAR[sl.variant].effect.reduce((a, e) => a + (e.stat === 'variantYield' ? e.add : 0), 0);
  };
  const matRate      = () => factoryRate() * S.slots.reduce((a, sl, i) => a + (sl && sl.type === 'fabrik' && !sl.upg ? (1 + neighborValue(i, 'fabrik')) * (1 + variantYield(sl)) : 0), 0);
  // Grundstärke steigt je Stufe (REQ-17.2), die Schmiede multipliziert darauf (REQ-17.3)
  const levelStrength = () => 1 + C.UNIT_STRENGTH_PER_LEVEL * S.level;
  const qualityLevel = () => lv('qualitaet') + Math.floor(mAdd('startSmith'));       // startSmith: Karte Rekrutenzug Stufe II (Teil 6, vorher Linie Militär Stufe 2): Einheiten starten mit der nächsten Schmiede-Stufe
  const qualityMult  = () => Math.pow(1 + (C.FX_QUALITAET + mAdd('qualityBonus')) * mMul('smithEffect'), qualityLevel());       // smithEffect: Waffenschmiede (Teil 4)
  const hpMultP      = () => levelStrength() * qualityMult() * mMul('unitStrength');
  const dmgMultP     = () => levelStrength() * qualityMult() * mMul('unitStrength') * mMul('unitDmg');
  const cdMultP      = () => mMul('attackCd');
  const bountyMult   = () => mMul('xpGain');
  /* Abschnitte der Basis (REQ-13): 0 = Mauer oben, 1 = Tor, 2 = Mauer unten */
  const sectionMax   = i => (C.SECTION_HP[i] + C.FX_MAUER_HP * lv('mauer')) * mMul('wallHp');
  const sectionUp    = i => S.sections[i].hp > 0;
  const gateHp       = () => S.sections[GATE].hp;
  const towerId      = (base, lane) => `${base}_${lane}`;
  const towerBuilt   = lane => lv(towerId('turm', lane)) > 0;
  const towerActive  = lane => towerBuilt(lane) && sectionUp(lane);
  const turretDmg    = lane => C.PLAYER_TURRET.dmgPerLevel * lv(towerId('turm', lane)) * mMul('turretDmg');
  const turretRange  = lane => (C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel * lv(towerId('reichweite', lane))) * mMul('towerRange');
  const turretCd     = lane => C.PLAYER_TURRET.cd * Math.pow(C.PLAYER_TURRET.cdFactor, lv(towerId('kadenz', lane))) * mMul('towerCd');       // towerCd: Doktrin Vorstoß (Teil 5)
  /* Bastion (Sonderbau der Doktrin Bollwerk, Teil 5): feuert wie ein Turm in die Lane seiner Zeile (oben Lane 0, Mitte Tor-Lane, unten Lane 2); Schaden, Reichweite und Kadenz folgen den Türmen der Lane */
  const upLv         = id => C.UPGRADES[id] ? lv(id) : 0;
  const bastionLane  = i => Math.floor(i / C.GRID_SIZE);
  const bastionSlots = () => S.pacing !== 'karten' ? [] : S.slots.map((sl, i) => sl && sl.variant === 'bastion' && !sl.upg ? i : -1).filter(i => i >= 0);
  const bastionDmg   = lane => C.PLAYER_TURRET.dmgPerLevel * Math.max(C.DOKTRIN.bastion.grundStufe, upLv(towerId('turm', lane))) * C.DOKTRIN.bastion.schadenFaktor * mMul('turretDmg');
  const bastionRange = lane => (C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel * upLv(towerId('reichweite', lane))) * mMul('towerRange');
  const bastionCd    = lane => C.PLAYER_TURRET.cd * Math.pow(C.PLAYER_TURRET.cdFactor, upLv(towerId('kadenz', lane))) * mMul('towerCd');
  /* Gegnerstärke wächst linear; nach der Belagerungswelle kommt POST_SIEGE_GROWTH je Minute hinzu (REQ-19.4) */
  const postSiege    = () => S.siegeDone ? C.POST_SIEGE_GROWTH * Math.max(0, S.t - S.siegeWaveT) / 60 : 0;
  const enemyHpMult  = () => (1 + diffCfg().hpGrowth * S.t / 60 + postSiege()) * mMul('enemyHp');
  const enemyDmgMult = () => 1 + diffCfg().dmgGrowth * S.t / 60 + postSiege();
  const siegeIn      = () => S.siegeDone ? null : Math.max(0, S.siegeWaveT - S.t);
  const siegeAnnounced = () => !S.siegeDone && S.siegeAnnouncedAt !== null;
  const unitCost     = type => mMul('unitCost') === 0 ? 0 : Math.max(1, Math.round(C.UNITS[type].cost * mMul('unitCost') * (1 + nbTotal('schmiede'))));
  const spawnX       = () => PBW + mAdd('spawnOffset');
  const unitRange    = (side, type) => C.UNITS[type].range + (side === 'p' && isThrower(type) ? mAdd('werferRange') : 0);
  const PHASES       = ['early', 'mid', 'late'];
  const phase        = () => S.level < C.PHASE_MID_LEVEL ? 'early' : S.level < C.PHASE_LATE_LEVEL ? 'mid' : 'late';
  /* Modus karten (Teil 5, REQ-K5.03): Kartenwahlen aus dem Spielfluss. Die EP-Schwelle der Wahl n ist die Summe der Schritte 1 … n der Kurve C.KARTEN.schwellen
     (Schritt k = start × wachstum^(k−1), je Grad mit schwellenFaktor); die abgelaufene Spielzeit löst nie eine Wahl aus. Standard unverändert. */
  function xpSum(n){
    if (S.pacing !== 'karten') return xpForLevel(n);
    const k = C.KARTEN.schwellen, f = (C.KARTEN.schwellenFaktor && C.KARTEN.schwellenFaktor[S.diff]) ?? 1;
    let s = 0;
    for (let i = 1; i <= n; i++) s += k.start * Math.pow(k.wachstum, i - 1) * f;
    return s;
  }
  /* Mindestabstand (Modus karten): eine fällige Wahl erscheint frühestens minAbstand Sekunden nach der letzten; die EP darüber bleiben erhalten. Er verzögert nur. */
  const draftReady = () => S.pacing !== 'karten' || !S.stats.wahlen || S.t - S.pfad.lastPickT >= C.KARTEN.minAbstand;      // vor der ersten Wahl gibt es keinen Mindestabstand
  const xpNeed       = n => xpSum(n) * mMul('xpNeed');
  /* EP je Abschuss: im Modus karten je Grad aus C.KARTEN.xpMult (mehr Gegner bringen mehr EP), sonst DIFFICULTY.xpMult */
  const xpMult       = () => S.pacing === 'karten' && C.KARTEN.xpMult && C.KARTEN.xpMult[S.diff] !== undefined ? C.KARTEN.xpMult[S.diff] : C.DIFFICULTY[S.diff].xpMult;
  /* Fortschritt zur nächsten Kartenwahl: EP-Anteil. Modus karten: ist die Wahl fällig, durch den Mindestabstand aber aufgeschoben, steht der Balken voll. */
  const xpProgress   = () => {
    const need = xpNeed(S.level + 1) - xpNeed(S.level), cur = S.xpTotal - xpNeed(S.level);
    const waiting = S.pacing === 'karten' && S.pendingLevels > 0 && !S.pendingDraft;
    return { level: S.level, cur: waiting ? need : cur, need, frac: waiting ? 1 : Math.max(0, Math.min(1, cur / need)) };
  };
  // Kaserne: Gebäude = Ausbaustufe 1, „Ausbau“ bis Stufe 3; jede Stufe +KASERNE_SUPPLY_PER_LEVEL (REQ-17.1)
  const kaserneLevel = () => has('kaserne') ? 1 + lv('ausbau') : 0;
  const supplyCap    = () => Math.min(C.SUPPLY_CAP_MAX, Math.round((C.SUPPLY_CAP_START + C.KASERNE_SUPPLY_PER_LEVEL * kaserneLevel() + mAdd('supply') + nbTotal('kaserne')) * mMul('supplyMult')));
  /* Handelskontor (REQ-6.07 b): Deckel und nächster Zinsbetrag */
  const kontorCap = () => Math.round((C.KONTOR.capBase + C.KONTOR.capPerLevel * lv('zinseszins')) * (1 + nbTotal('kontor')) * mMul('kontorCap'));
  const kontorRaw = () => Math.min(kontorCap(), Math.floor(Math.max(0, S.material) / C.KONTOR.perN) * C.KONTOR.amount);
  const kontorNext = () => Math.floor(kontorRaw() * mMul('kontorYield'));         // kontorYield (Teil 4; wirkt heute nur noch mit einer Karte, die den Stat setzt)

  function upCost(id){
    const u = C.UPGRADES[id];
    let c = u.baseCost * Math.pow(u.growth, S.lvl[id]) * mMul('upgradeCost') * (id === 'ausbau' ? mMul('quartiereCost') : id === 'qualitaet' ? mMul('qualitaetCost') : 1);       // quartiereCost, qualitaetCost: Zahlmeisterei, Münzschmiede (Teil 5)
    return Math.ceil(c);
  }
  const isMaxed = id => C.UPGRADES[id].max !== undefined && S.lvl[id] >= C.UPGRADES[id].max;
  /* Wirkungslos (Patch 0.9.2): Das Versorgungslimit steht schon am harten Deckel; weitere Versorgung (Kaserne-Ausbau, Forschung, Karten) bringt nichts mehr */
  const supplyCapped = () => supplyCap() >= C.SUPPLY_CAP_MAX;
  const supplyOnly = effects => effects.length > 0 && effects.every(e => e.stat === 'supply' || e.stat === 'supplyMult');
  const noEffect = id => C.UPGRADES[id].group === 'kaserne' && supplyCapped();
  function isAvailable(id){
    const u = C.UPGRADES[id];
    if (C.BUILDINGS.includes(u.group) && !has(u.group)) return false;
    if (u.needs && S.lvl[u.needs] <= 0) return false;
    return true;
  }
  const canBuy = id => S.status === 'running' && isAvailable(id) && !stageSource(id) && !isMaxed(id) && !noEffect(id) && S[C.UPGRADES[id].cur] >= upCost(id);
  const builtCount = () => S.slots.filter(Boolean).length;
  /* Die n-te Fabrik kostet FACTORY_BASE_COST × FACTORY_COST_GROWTH^(n−1); nach einem Abriss sinkt der Preis wieder (REQ-16.2/16.5) */
  // Die erste Fabrik ist gratis (REQ-44)
  const factoryCost = () => C.FIRST_FACTORY_FREE && factoryCount() === 0 ? 0 : Math.ceil(C.FACTORY_BASE_COST * Math.pow(C.FACTORY_COST_GROWTH, factoryCount()) * mMul('factoryCost') * mMul('buildCost'));
  const buildCost = type => type === 'fabrik' ? factoryCost() : Math.ceil(C.BUILDING_COST[type] * mMul('buildCost'));
  const isBuildable = type => (C.START_BUILDINGS.includes(type) || !!S.unlocked[type]) && isOpen('bau:' + type);
  const refundFor = i => S.slots[i] ? Math.floor(S.slots[i].paid * C.REFUND_RATE) : 0;
  /* Warum ein Gebäude nicht baubar ist (null = baubar) */
  function buildBlock(i, type){
    if (S.status !== 'running') return 'notRunning';
    if (!C.BUILDINGS.includes(type)) return 'unknown';
    if (!introShows('buildings') && type !== 'fabrik') return 'hidden';
    if (!isBuildable(type)) return 'locked';
    if (type !== 'fabrik' && standingCount(type) >= C.MAX_PER_TYPE) return 'standing';
    if (i < 0 || i >= SLOTS || S.slots[i]) return 'occupied';
    if (doctrineLimit(type)) return 'limit';
    if (S.material < buildCost(type)) return 'material';
    return null;
  }
  /* Einschränkung einer Doktrin als Regel (Teil 5, REQ-K5.07): höchstens max Plätze mit den genannten Typen (Zunftordnung: vier Fabriken, Zunfthäuser eingeschlossen);
     gibt die Doktrin zurück, die das Bauen sperrt. Was schon steht, bleibt stehen. */
  const doctrineLimit = type => {
    if (S.pacing !== 'karten') return null;
    for (const d of activeDoctrines()) if (d.grenze && d.grenze.typen.includes(type) && S.slots.filter(sl => sl && d.grenze.typen.includes(sl.type)).length >= d.grenze.max) return d;
    return null;
  };
  /* Die Einschränkung gilt ab der Wahl, auch für Gebäude, die schon stehen (Teil 6, REQ-K6.01, ersetzt Auslegung 3 aus Teil 5): Zahl der Plätze, um die die Grenze einer Doktrin überschritten ist.
     Solange es welche gibt, ist der Sonderbau der Doktrin gesperrt (variantBlock 'excess'); neue Gebäude über der Grenze sind es ohnehin (doctrineLimit). */
  const doctrineExcess = d => d && d.grenze ? Math.max(0, S.slots.filter(sl => sl && d.grenze.typen.includes(sl.type)).length - d.grenze.max) : 0;
  const variantExcess = vid => { const v = VAR[vid]; return v && v.doktrin && S.pacing === 'karten' && cardTaken(v.doktrin) > 0 ? doctrineExcess(DOK[v.doktrin]) : 0; };
  const activeDoctrines = () => DOKTRINEN.filter(d => cardTaken(d.id) > 0);
  const doktrinCount = () => activeDoctrines().length;

  /* Forschungsbudget (Teil 5, REQ-K5.05): Der eingestellte Anteil des laufenden Materialertrags (Fabriken und Presse, nicht Klicks, Zinsen oder Beute) wird in EP umgewandelt.
     Nur im Modus karten und bei stehender Universität; der Kurs sinkt mit dem Anteil (kursFaktor), Karten und Sonderbauten können ihn heben (budgetKurs). */
  const budgetStufe = () => S.pacing === 'karten' && has('universitaet') ? (S.budget || 0) : 0;
  const budgetShare = () => C.KARTEN.budget.stufen[budgetStufe()] || 0;
  const budgetKurs  = () => C.KARTEN.budget.kurs * C.KARTEN.budget.kursFaktor[budgetStufe()] * mMul('budgetKurs');
  function setBudget(i){
    if (S.pacing !== 'karten' || !has('universitaet') || !(i >= 0 && i < C.KARTEN.budget.stufen.length)) return false;
    S.budget = i; return true;
  }
  /* Materialertrag je Sekunde nach Abzug des Forschungsbudgets (Anzeige) */
  /* Unterhalt (Doktrin Stehendes Heer, Teil 5): jede eigene Einheit auf dem Feld kostet mAdd('upkeep') Material je Minute */
  const upkeepRate = () => {
    if (S.pacing !== 'karten') return 0;
    const u = mAdd('upkeep'); if (!(u > 0)) return 0;
    let n = 0; for (const x of S.units) if (x.side === 'p') n++;
    return n * u / 60;
  };
  const incomeRate = () => (matRate() + autoPressCps() * clickPower()) * (1 - budgetShare()) - upkeepRate();
  function addProduction(n){
    const sh = budgetShare();
    if (sh > 0){
      const used = n * sh;
      S.stats.budgetMaterial = (S.stats.budgetMaterial || 0) + used;
      gainXp(used * budgetKurs(), 'budget');
      n -= used;
    }
    addMaterial(n);
  }
  function addMaterial(n, source){
    S.material += n; S.materialTotal += n;
    const p = S.stats.prod[phase()];
    if (source === 'click') p.click += n; else p.auto += n;
    if (listeners.length) emit('materialProduced', { n, source: source === 'click' ? 'click' : 'auto' });
  }

  /* ---------- Aktionen ---------- */
  /* Höchstens MAX_CLICKS_PER_SECOND Klicks je Sekunde Spielzeit zählen (REQ-03.4) */
  function doClick(){
    if (S.status !== 'running' || S.pendingDraft) return false;
    const ct = S.clickTimes;
    while (ct.length && ct[0] <= S.t - 1) ct.shift();
    if (ct.length >= C.MAX_CLICKS_PER_SECOND) return false;
    ct.push(S.t);
    // Ertrag der Presse = Maximum aus automatischem und manuellem Klicken (REQ-44): Jeder Klick bringt den Anteil,
    // um den die Klicks der letzten Sekunde die Rate der automatischen Presse übersteigen
    const n = ct.length, excess = Math.max(0, n - autoPressCps()) / n;
    if (excess > 0) addMaterial(clickPower() * excess, 'click');
    S.clicks++;
    return true;
  }
  /* Automatische Presse: ab Phase Mitte AUTO_PRESS_MID, ab Spät AUTO_PRESS_LATE der Referenzrate (Klicks/s) */
  function autoPressCps(){
    const ph = phase(), share = ph === 'late' ? C.AUTO_PRESS_LATE : ph === 'mid' ? C.AUTO_PRESS_MID : mAdd('autoPressEarly');
    return share * C.PRESS_REFERENCE_CPS * mMul('autoPress');
  }
  function buy(id){
    if (!canBuy(id)) return false;
    S[C.UPGRADES[id].cur] -= upCost(id);
    S.lvl[id]++;
    if (id === 'mauer') for (const s of S.sections) if (s.hp > 0) s.hp += C.FX_MAUER_HP * mMul('wallHp');
    if (C.UPGRADES[id].base === 'turm' && S.lvl[id] === 1) log('log.turret', { lane: '@lane.' + C.UPGRADES[id].tower });
    return true;
  }
  function buildAt(i, type){
    if (buildBlock(i, type)) return false;
    const cost = buildCost(type);
    S.material -= cost;
    S.slots[i] = { type, paid: cost }; S.slotVer++;
    log('log.built', { building: '@bld.' + type + '.name', slot: i + 1 });
    emit('buildingBuilt', { type, slot: i });
    return true;
  }
  /* Baut in den ersten freien Platz (Kurzform für Bots und Tests) */
  function build(type){
    const i = S.slots.findIndex(x => !x);
    return i >= 0 && buildAt(i, type);
  }
  function clampSections(){ S.sections.forEach((s, i) => { s.hp = Math.min(s.hp, sectionMax(i)); }); }
  function demolish(i){
    if (S.status !== 'running' || !S.slots[i]) return false;
    const refund = refundFor(i), type = S.slots[i].type;
    S.material += refund;
    S.slots[i] = null; S.slotVer++;                                        // eine abgerissene Variante verliert ihr Zeichen (REQ-S.04)
    clampSections();
    log('log.demolished', { building: '@bld.' + type + '.name', slot: i + 1, amount: refund });
    return true;
  }
  function unlockBuilding(type){ S.unlocked[type] = true; }
  /* ---------- Gebäude-Aufwertung (Teil 4, REQ-S.05) ----------
     Ein Grundgebäude lässt sich einmal in eine Variante aufwerten (je eine pro Kategorie). Der Platz behält Typ, Ausbaustufen und Nachbarschaftsregeln (slot.type bleibt der des Grundgebäudes);
     die Variante steht als slot.variant. Während der Aufwertung (slot.upg) wirkt das Gebäude nicht. Kosten: kostenFaktor × Baukosten des Grundgebäudes, nach einem Abriss gibt es
     die halbe Summe zurück wie bei jedem Gebäude (slot.paid). */
  /* Sonderbauten (Feld doktrin) gibt es nur mit ihrer Doktrin */
  const variantsOf = type => VARIANTS.filter(v => v.basis === type && (!v.doktrin || cardTaken(v.doktrin) > 0));
  /* Aufwertungen, die für den Platz i angeboten werden: ohne Variante alle des Typs; mit einer Grundvariante nur die Sonderbauten (sie lösen sie ab, die Kosten fallen voll an) */
  const variantsFor = i => { const sl = S.slots[i]; return !sl || sl.upg ? [] : variantsOf(sl.type).filter(v => !sl.variant || (v.doktrin && !VAR[sl.variant].doktrin)); };
  const variantBase = type => type === 'fabrik' ? C.FACTORY_BASE_COST : C.BUILDING_COST[type];
  const variantCost = vid => Math.ceil(variantBase(VAR[vid].basis) * (VAR[vid].kostenFaktor ?? (VAR[vid].doktrin ? C.DOKTRIN.sonderbau.kostenFaktor : C.AUFWERTUNG.kostenFaktor)) * mMul('variantCost'));
  /* Die Aufwertung eines Typs ist sichtbar, sobald ein Gebäude des Typs steht und die Partie Minute abMinute erreicht hat */
  const variantVisible = type => S.pacing === 'karten' && variantsOf(type).length > 0 && S.t >= C.AUFWERTUNG.abMinute * 60 && S.slots.some(sl => sl && sl.type === type);
  function variantBlock(i, vid){
    const v = VAR[vid], sl = S.slots[i];
    if (!v) return 'unknown';
    if (S.status !== 'running') return 'notRunning';
    if (S.pacing !== 'karten') return 'notInMode';
    if (!sl || sl.type !== v.basis) return 'noBuilding';
    if (v.doktrin && !cardTaken(v.doktrin)) return 'doctrine';
    if (variantExcess(vid) > 0) return 'excess';                                                     // Einschränkung der Doktrin gilt auch für den Bestand (Teil 6, REQ-K6.01)
    if (sl.variant && !(v.doktrin && !VAR[sl.variant].doktrin)) return 'done';                    // ein Sonderbau löst eine Grundvariante ab, sonst bleibt die Variante endgültig (Teil 5)
    if (sl.upg) return 'upgrading';
    if (!variantVisible(v.basis)) return 'hidden';
    if (S.material < variantCost(vid)) return 'material';
    return null;
  }
  function upgradeBuilding(i, vid){
    if (variantBlock(i, vid)) return false;
    const cost = variantCost(vid), sl = S.slots[i];
    S.material -= cost; sl.paid = (sl.paid || 0) + cost;
    sl.upg = { to: vid, t: 0 }; S.slotVer++;
    S.stats.variantsStarted = (S.stats.variantsStarted || 0) + 1;
    log('log.variantStart', { building: '@bld.' + sl.type + '.name', slot: i + 1, name: '@' + VAR[vid].nameKey });
    emit('buildingUpgrade', { type: sl.type, slot: i, variant: vid });
    return true;
  }
  function progressVariants(dt){
    S.slots.forEach((sl, i) => {
      if (!sl || !sl.upg) return;
      sl.upg.t += dt;
      if (sl.upg.t < C.AUFWERTUNG.dauerS) return;
      const vid = sl.upg.to;
      delete sl.upg; sl.variant = vid; S.slotVer++;
      (S.stats.variants = S.stats.variants || []).push({ id: vid, t: +S.t.toFixed(1) });
      log('log.variantDone', { building: '@bld.' + sl.type + '.name', slot: i + 1, name: '@' + VAR[vid].nameKey });
      emit('buildingVariant', { type: sl.type, slot: i, variant: vid });
    });
  }
  const repairCost = () => Math.ceil(C.REPAIR_COST * mMul('repairCost'));
  /* Reparatur je Abschnitt (REQ-13.6). Ein gefallener Abschnitt steht danach wieder, sein Turm feuert wieder. */
  function repair(i, factor = 1){
    if (i === undefined) i = GATE;
    const s = S.sections[i], cost = Math.ceil(repairCost() * factor);
    if (S.status !== 'running' || !s || S.material < cost || s.hp >= sectionMax(i) || s.repairCd > 0) return false;
    S.material -= cost;
    s.repairCd = C.REPAIR_COOLDOWN_S * mMul('repairCd');
    s.hp = Math.min(sectionMax(i), s.hp + C.REPAIR_AMOUNT);
    return true;
  }
  /* ---------- Formationen (REQ-42) ----------
     Alle Einheiten einer Welle in derselben Lane bilden eine Formation. Sie bewegt sich als Block mit FORMATION_SPEED.
     Aufbau: vorn Nahkämpfer in Reihen zu höchstens FORMATION_ROW_MAX quer zur Lane, dahinter die Fernkämpfer.
     Fällt eine Einheit, rücken die hinteren nach; die Reihen werden laufend neu gebildet. */
  const dirOf = side => side === 'p' ? 1 : -1;
  const baseX = side => side === 'p' ? W - EBW : PBW;
  function makeUnit(side, type, lane, x, form){
    const p = side === 'p', s = unitStats(side, type);
    if (p && lane === GATE && mMul('gateUnitHp') !== 1){ s.hp *= mMul('gateUnitHp'); }         // Garnison (Teil 4): Einheiten der Mitte am Tor mit mehr Lebenspunkten
    const u = {
      id: S.nextId++, side, type, lane, laneF: lane, home: lane, x: x ?? (p ? spawnX() : W - EBW), form: form ?? null, speed: s.speed,
      range: s.range, ranged: s.ranged,
      hp: s.hp, maxHp: s.hp, dmg: s.dmg,
      cdMax: s.cdMax, cd: 0, flash: 0, bob: rnd() * 6, row: 0, col: 0, rowSize: 1,
    };
    u.cd = u.cdMax * C.COMBAT.spawnStagger * rnd();                  // Versatz beim Entstehen: kein Gleichtakt einer Welle (REQ-6.02)
    return u;
  }
  /* ---------- Armee als gemeinsame Welle (REQ-5.06) ----------
     Eine Gruppe (S.forms) ist die Armee einer Seite (main) oder Nachschub auf dem Weg zu ihr. Alle Lanes einer Gruppe teilen die Front x.
     Je Lane stehen vorn Nahkämpfer in Reihen zu höchstens FORMATION_ROW_MAX, dahinter Fernkämpfer (Reihen werden laufend neu gebildet).
     Jede Einheit hat eine Heimat-Lane (home) und eine aktuelle Lane (lane); laneF ist die Querbewegung dazwischen. */
  function makeGroup(side, x){
    const g = { id: S.nextId++, side, main: !S.forms.some(o => o.side === side && o.main), state: 'march', x, t: 0, st: 0,
                size: 0, rows: 0, fighting: false, moving: false, lane: null, nextSlot: 0 };
    S.forms.push(g);
    return g;
  }
  /* Neue Gruppe mit allen Einheiten in einer Lane (Kurzform für Tests und Nachzügler); x = Front */
  function addFormation(side, lane, types, x){
    const g = makeGroup(side, x); g.lane = lane;
    for (const type of types) S.units.push(makeUnit(side, type, lane, x, g.id));
    layoutAll();
    return g;
  }
  /* Neue Gruppe aus [{ type, lane }] */
  function addGroup(side, placed, x){
    const g = makeGroup(side, x);
    for (const q of placed) S.units.push(makeUnit(side, q.type, q.lane, x, g.id));
    layoutAll();
    return g;
  }
  /* Reihen je Gruppe und Lane bilden und die Position jeder Einheit daraus ableiten */
  let fronts = new Map();                           // vorderste Reihe je Gruppe und Lane; nicht im Spielstand (Kopien per JSON)
  function layoutAll(){
    const byForm = new Map();
    fronts = new Map();
    for (const f of S.forms) byForm.set(f.id, Array.from({ length: LANES }, () => []));
    // Einheiten auf dem Weg in eine andere Lane erhalten ihren Platz in der Ziel-Lane schon beim Losgehen (hinten angereiht): so läuft
    // die Querbewegung direkt auf den Platz zu, ohne Sprung bei der Ankunft
    const alive = new Map();
    for (const u of S.units) if (u.hp > 0 && byForm.has(u.form)){
      alive.set(u.form, (alive.get(u.form) || 0) + 1);
      byForm.get(u.form)[u.lane].push(u);
    }
    for (const f of S.forms){
      const dir = dirOf(f.side), R = C.FORMATION_ROW_MAX;
      f.size = alive.get(f.id) || 0; f.rows = 0;
      byForm.get(f.id).forEach((m, lane) => {
        // Feste Plätze (REQ-6.01): Reihenfolge nach Ankunft in der Lane (slot), Neue hinten; Lücken füllen nur Einheiten von hinten
        const fresh = m.filter(u => u.slot == null || u.slotLane !== lane).sort((a, b) => a.id - b.id);
        for (const u of fresh){ u.slot = f.nextSlot = (f.nextSlot || 0) + 1; u.slotLane = lane; }
        const bySlot = (a, b) => a.slot - b.slot || a.id - b.id;
        const melee = m.filter(u => !u.ranged).sort(bySlot), ranged = m.filter(u => u.ranged).sort(bySlot);
        const rows = [];
        for (const g of [melee, ranged]) for (let i = 0; i < g.length; i += R) rows.push(g.slice(i, i + R));
        rows.forEach((r, ri) => r.forEach((u, ci) => {
          u.row = ri; u.col = ci; u.rowSize = r.length; u.formSize = m.length; u.x = f.x - dir * ri * C.ROW_GAP; u.moving = f.moving;
          if (u.laneF !== u.lane && u.toOff == null) u.toOff = colOffset(ci);
        }));
        f.rows = Math.max(f.rows, rows.length);
        fronts.set(f.id + ':' + lane, rows[0] || []);
      });
    }
    const gone = S.forms.filter(f => f.size === 0);
    S.forms = S.forms.filter(f => f.size > 0);
    // Fällt die Armee vollständig, wird die älteste verbliebene Gruppe dieser Seite zur Armee; sonst die nächste Welle ab dem Tor
    for (const g of gone) if (g.main){ const next = S.forms.find(o => o.side === g.side); if (next) next.main = true; }
  }
  /* Querplatz in der Reihe (REQ-6.01): feste Plätze über die volle Reihenbreite (FORMATION_ROW_MAX), nicht je Reihe zentriert. Kommt jemand
     hinzu oder fällt jemand hinter einer Einheit weg, bleibt ihr Platz; entsteht vor ihr eine Lücke, rückt sie stets zur selben Seite nach.
     (Die Füllung von der Mitte nach außen ließ nachrückende Einheiten bei jedem Schritt die Seite wechseln.) In Lane-Höhen. */
  const colOffset = col => (col - (C.FORMATION_ROW_MAX - 1) / 2) * C.ROW_SPREAD;
  /* Querposition einer Einheit in Lane-Einheiten, wie gezeichnet: Lane plus Querplatz. Auf dem Weg in eine andere Lane geht der Querplatz
     gleichmäßig vom alten in den neuen über (fromLane, fromOff beim Losgehen), damit die Bewegung ohne Sprung und in eine Richtung läuft. */
  function lateralOf(u){
    const to = colOffset(u.col || 0);
    if (u.laneF === u.lane || u.fromLane == null || u.fromLane === u.lane) return u.laneF + to;
    // unterwegs zählt der Zielplatz beim Losgehen (toOff): rückt die Ziel-Reihe während des Wechsels nach, springt die Bahn nicht
    const k = Math.max(0, Math.min(1, (u.laneF - u.fromLane) / (u.lane - u.fromLane))), end = u.toOff ?? to;
    return u.laneF + (u.fromOff ?? end) + (end - (u.fromOff ?? end)) * k;
  }
  /* Neues Lane-Ziel setzen und den Ausgangspunkt der Querbewegung merken; der Zielplatz wird nach der Neuordnung festgehalten */
  function setLane(u, lane){ u.fromOff = lateralOf(u) - u.laneF; u.fromLane = u.laneF; u.lane = lane; u.toOff = null; }
  const formMembers = f => S.units.filter(u => u.form === f.id && u.hp > 0);
  const mainOf = side => S.forms.find(f => f.side === side && f.main) || null;
  const spawnBlocked = lane => S.units.some(u => u.side === 'e' && u.lane === lane && Math.abs(u.x - (W - EBW)) < C.SPAWN_BLOCK_DIST);
  const gateBlocked = lane => S.units.some(u => u.side === 'p' && u.lane === lane && u.hp > 0 && u.x >= W - EBW - C.GATE_BLOCK_DIST);

  /* Kauf legt die Einheit in die Warteschlange; sie rückt mit der nächsten Welle aus (REQ-14.1/14.2) */
  /* Söldner (Karte Söldnertruppe, Teil 6, vorher Linie Wirtschaft Stufe 3): Einheiten über dem Versorgungslimit gegen Aufschlag; sie belegen keine Versorgung (merc in der Warteschlange) */
  const mercRule = () => S.pacing === 'karten' && mAdd('soeldner') > 0;
  const queueSupply = () => { let n = 0; for (const q of S.queue) if (!q.merc) n++; return n; };
  const atSupplyCap = () => queueSupply() >= supplyCap();
  const supplyFull = () => atSupplyCap() && !mercRule();                      // mit Söldnern ist die Warteschlange nie voll
  const unitIsMerc = () => atSupplyCap() && mercRule();
  const unitPrice = type => Math.ceil(unitCost(type) * (atSupplyCap() && mercRule() ? C.SOELDNER.kostenFaktor : 1));
  /* Schildträger erst nach der Forschung (REQ-5.07, Zweig D) */
  const unitUnlocked = type => (!C.UNITS[type].research || mAdd(C.UNITS[type].research) > 0) && isOpen('einheit:' + type);
  function spawn(type){
    const cost = unitPrice(ownType(type)), merc = atSupplyCap() && mercRule();
    if (S.status !== 'running' || supplyFull() || S.material < cost || !unitUnlocked(type)) return false;
    S.material -= cost;
    type = ownType(type);
    S.queue.push(merc ? { type, merc: true } : { type });
    if (merc) S.stats.mercs = (S.stats.mercs || 0) + 1;
    emit('unitBought', { type });
    return true;
  }

  /* ---------- Wellen ---------- */
  /* Nächste Gegnerwelle: Zusammensetzung und Lanes entstehen zu Beginn des Countdowns über den Spielzufall (REQ-14.3) */
  /* Größe der regulären bzw. der Belagerungswelle, die in Minute min der Spielzeit ausrückt */
  function enemyWaveSize(min, siege){
    const d = diffCfg();
    // Anlauf (REQ-6.08): bis Minute rampMin steigt die Grundwelle linear von startBase auf waveBase; danach unverändert
    const base = d.rampMin && min < d.rampMin ? d.startBase + (d.waveBase - d.startBase) * min / d.rampMin : d.waveBase;
    const druck = S.druck === 'hoch' && !siege && min >= C.DRUCK.hoch.abMinute ? C.DRUCK.hoch.faktor : 1;       // Testschalter hoher Druck (Teil 4, REQ-S.08)
    return Math.max(1, Math.min(Math.round(C.ENEMY_WAVE_MAX * druck), Math.round((base + d.waveGrowth * min) * (S.pacing === 'karten' ? 1 + (C.KARTEN.wellenFaktor - 1) * Math.min(1, min / C.KARTEN.wellenAnstiegMin) : 1) * druck))) * (siege ? C.SIEGE_STRENGTH : 1);   // Belagerungswelle: dreifache Größe (REQ-19.2)
  }
  function rollEnemyWave(){
    const d = diffCfg(), min = S.nextWave / 60;
    S.nextEnemySiege = !S.siegeDone && S.nextWave >= S.siegeWaveT;
    const size = enemyWaveSize(min, S.nextEnemySiege);
    const out = [];
    for (let i = 0; i < size; i++){
      const type = (min >= d.werferFrom && rnd() < d.werferShare) ? 'werfer' : 'laeufer';
      out.push({ type, lane: Math.floor(rnd() * LANES) });
    }
    return out;
  }
  const laneStrength = (wave, lane) => wave.reduce((a, q) => a + (q.lane === lane ? C.UNITS[q.type].cost : 0), 0);
  /* Lane oben oder unten mit der stärkeren angekündigten Gegnerwelle, bei Gleichstand oben (REQ-12.1) */
  const strongerLane = wave => laneStrength(wave, 2) > laneStrength(wave, 0) ? 2 : 0;
  /* Lanes für eine Gruppe: erst die Nahkämpfer, dann die Fernkämpfer, jeweils nach REQ-12.1 */
  function assignLanes(types, strong){
    if (mAdd('allMid') > 0) return types.map(type => ({ type, lane: GATE }));   // Alles auf die Mitte (REQ-45)
    const melee = types.filter(t => !isRangedType(t)), ranged = types.filter(isRangedType);
    const lm = distribute(melee.length, strong), lr = distribute(ranged.length, strong);
    return [...melee.map((type, i) => ({ type, lane: lm[i] })), ...ranged.map((type, i) => ({ type, lane: lr[i] }))];
  }
  /* Eigene Welle; der eigene Takt kann durch Karten vom Takt der Gegnerwellen abweichen (Große Armee, Blitzkrieg) */
  const ownWaveInterval = () => C.WAVE_INTERVAL_S * mMul('ownWaveInterval');
  function launchOwnWave(opts = {}){
    if (S.queue.length){
      // Kennzahl: Anteil der Wellen am Versorgungslimit (REQ-21.2)
      S.stats.waves = (S.stats.waves || 0) + 1;
      if (S.queue.length >= supplyCap()) S.stats.wavesFull = (S.stats.wavesFull || 0) + 1;
      const bought = S.queue.map(q => q.type);
      // Karte Rekrutenzug (Teil 6, vorher Linie Militär Stufe 1): die Kaserne bildet je Welle zusätzliche Einheiten aus (Läufer, ohne Kosten, außerhalb des Versorgungslimits)
      const types = bought.concat(has('kaserne') ? new Array(Math.floor(mAdd('extraUnit'))).fill(ownType('laeufer')) : []);
      // eine Gruppe über alle Lanes: Armee, falls es keine gibt, sonst Nachschub (REQ-5.06)
      const g = addGroup('p', assignLanes(types, strongerLane(S.nextEnemy)), deployX());
      if (opts.boost > 0) for (const u of S.units) if (u.form === g.id){ u.hp *= 1 + opts.boost; u.maxHp *= 1 + opts.boost; u.dmg *= 1 + opts.boost; }       // Gegenstoß: stärkere Welle
      if (opts.baseMult > 1) for (const u of S.units) if (u.form === g.id) u.baseMult = opts.baseMult;                                               // Ausbruch (Teil 6: Teil der Doktrin Ausfall): mehr Schaden an der gegnerischen Basis
      S.queue = [];
      S.lastOrder = bought;
      S.stats.maxArmy = Math.max(S.stats.maxArmy || 0, S.units.filter(u => u.side === 'p').length);
      emit('waveDeparted', { side: 'p', size: types.length });
    }
    // Dauerauftrag: Warteschlange mit der zuletzt ausgerückten Zusammensetzung füllen, soweit das Material reicht (REQ-45)
    if (mAdd('standingOrder') > 0 && S.lastOrder) for (const type of S.lastOrder) spawn(type);
    S.ownWaveNo++;
    S.nextOwnWave += ownWaveInterval();
  }
  function launchWave(){
    const enemy = S.nextEnemy;
    // Gegnerwelle: rückt geschlossen aus; was wegen Feldgrenze oder Belagerung nicht passt, folgt später.
    // Die Belagerungswelle rückt immer vollständig aus.
    const siege = S.nextEnemySiege;
    if (siege){ S.siegeDone = true; S.siegeWaveT = S.t; log('log.siege'); }
    if (S.pacing === 'karten') S.waveSize[S.waveNo + 1] = enemy.length;                       // für die EP der abgewehrten Welle (Teil 5)
    let field = S.units.filter(u => u.side === 'e').length;
    const now = [];
    for (const q of enemy){
      if (siege || (field < diffCfg().maxField && !gateBlocked(q.lane))){ now.push(q); field++; }
      else S.enemyQueue.push({ type: q.type, lane: q.lane, at: S.t, wave: S.waveNo + 1 });
    }
    if (now.length){ const g = addGroup('e', now, W - EBW); for (const u of S.units) if (u.form === g.id) u.wave = S.waveNo + 1; emit('waveDeparted', { side: 'e', size: now.length }); }   // gespiegelte Armeelogik für den Gegner (REQ-5.06); wave: Nummer der Welle (Teil 4)
    if (!S.firstWaveSeen){ S.firstWaveSeen = true; log('log.firstWave'); }
    S.waveNo++;
    S.nextWave += C.WAVE_INTERVAL_S;
    S.nextEnemy = rollEnemyWave();
  }
  /* Gegenstoß (Doktrin Ausfall, Teil 6): nach jeder vollständig abgewehrten Gegnerwelle rückt sofort eine eigene Welle aus (ohne Kosten, zusätzlich zum regelmäßigen Takt) */
  function counterWave(){
    if (!S.queue.length) return false;
    const keep = S.nextOwnWave;                                            // der Gegenstoß ist eine zusätzliche Welle: der regelmäßige Takt bleibt
    launchOwnWave({ boost: mAdd('counterBoost'), baseMult: mMul('counterBaseDmg') });
    S.nextOwnWave = keep;
    S.stats.counterWaves = (S.stats.counterWaves || 0) + 1;
    return true;
  }
  function onWaveRepelled(w){
    if (S.pacing !== 'karten') return;
    S.stats.wavesRepelled = (S.stats.wavesRepelled || 0) + 1;
    const size = S.waveSize[w]; delete S.waveSize[w];
    if (size) gainXp(C.KARTEN.epWelle.basis + C.KARTEN.epWelle.proEinheit * size, 'wave');            // abgewehrte Welle: EP, größere Wellen bringen mehr (Teil 5, REQ-K5.03)
    if (mAdd('counterWave') > 0 && !S.hold) counterWave();
    emit('waveRepelled', { wave: w });
  }
  /* Welle vorziehen (REQ-6.07 c): die Warteschlange rückt sofort als Welle aus; der Wellentakt beginnt neu. Braucht die Kaserne. */
  const waveRushCost = () => C.WAVE_RUSH.cost + C.WAVE_RUSH.perUnit * S.queue.length;
  function waveRushBlock(){
    if (S.status !== 'running') return 'notRunning';
    if (!has('kaserne')) return 'noKaserne';
    if ((S.waveRushCd || 0) > 0) return 'cooldown';
    if (!S.queue.length) return 'empty';
    if (S.material < waveRushCost()) return 'material';
    return null;
  }
  function rushWave(){
    if (waveRushBlock()) return false;
    S.material -= waveRushCost();
    S.waveRushCd = C.WAVE_RUSH.cdS;
    S.stats.waveRushes = (S.stats.waveRushes || 0) + 1;
    launchOwnWave();
    S.nextOwnWave = S.t + ownWaveInterval();                               // Takt beginnt neu
    return true;
  }
  const waveIn = () => Math.max(0, S.nextOwnWave - S.t);
  const enemyWaveIn = () => Math.max(0, S.nextWave - S.t);
  const ownOnField = () => S.units.reduce((n, u) => n + (u.side === 'p' ? 1 : 0), 0);
  /* Zustand der Armee für die Anzeige (REQ-5.03, REQ-5.06): march, fight, regroup oder none */
  function armyState(side){ const m = mainOf(side); return m ? m.state : 'none'; }
  /* Aufstellpunkt der eigenen Welle: am Tor, mit Vorposten weiter vorn, aber nie hinter der vordersten gegnerischen Einheit */
  function deployX(){
    let x = spawnX();
    for (const u of S.units) if (u.side === 'e' && u.hp > 0) x = Math.min(x, u.x - C.ROW_GAP);
    return Math.max(PBW, x);
  }
  const shot = s => { if (FX.on) FX.shots.push(s); };

  /* Schaden an einem Abschnitt der eigenen Basis. Ist eine Mauer gefallen, trifft es das Tor (REQ-13.3). */
  function hitSection(lane, dmg){
    const i = sectionUp(lane) ? lane : GATE;
    const s = S.sections[i];
    s.hp -= dmg; s.lastHit = S.t;
    FX.baseFlash.p[i] = 0.12;
    if (s.hp <= 0 && i !== GATE){
      s.hp = 0; log('log.wallDown', { lane: '@lane.' + i });
      // Verbrannte Erde: alle Gegner der Lane erleiden Schaden, wenn die Mauer fällt (REQ-45)
      const burn = mAdd('scorchedEarth');
      if (burn > 0) for (const u of S.units) if (u.side === 'e' && u.lane === i){ u.hp -= burn; u.flash = 0.12; }
    }
    return i;
  }
  function hitUnit(u, target){
    let dmg = u.dmg;
    if (u.side === 'p'){
      dmg *= mMul('dmgVsUnits') * (u.ranged ? mMul('rangedDmg') : 1);
      if (u.formSize >= (OPT.kriegstrommeln ? OPT.kriegstrommeln.condition.value + mAdd('drumsMin') : Infinity)) dmg *= mMul('drumsDmg');   // Kriegstrommeln (Stufe 3: schon ab weniger Einheiten, Teil 5)
    } else if (!target.ranged && target.row === 0 && target.rowSize >= C.FORMATION_ROW_MAX + mAdd('shieldMin')) dmg /= mMul('shieldHp');        // Schildwall (Stufe 2: schon bei weniger Nahkämpfern je Reihe, Teil 5)
    target.hp -= dmg; target.flash = 0.12;
    // eigenes Geschoss je Wurf, vom Platz des Werfers zum Platz des Ziels (REQ-6.02)
    if (u.ranged) shot({ from: u.id, to: target.id, x0: u.x, x1: target.x, lane: u.laneF, y0: lateralOf(u), y1: lateralOf(target), t: 0, dur: 0.3 });
    else lunge(u);
  }
  /* Schaden an der gegnerischen Basis (alle Quellen). Modus karten (Teil 5, REQ-K5.03): Jedes Prozent ihrer Lebenspunkte bringt EP (C.KARTEN.epBasis); der Takt sammelt, flushBaseXp schreibt gut. */
  let baseAcc = 0;
  function damageEnemyBase(dmg){ S.enemyBaseHp -= dmg; if (S.pacing === 'karten') baseAcc += dmg; }
  function flushBaseXp(){
    if (baseAcc <= 0) return;
    const pct = 100 * baseAcc / diffCfg().enemyBaseHp; baseAcc = 0;
    gainXp(pct * C.KARTEN.epBasis.proProzent, 'base');
  }
  function hitBase(u){
    if (!u.ranged) lunge(u);
    if (u.side === 'p'){ damageEnemyBase(u.dmg * mMul('dmgVsBase') * (u.baseMult || 1) * (u.ranged ? mMul('rangedDmg') : 1)); FX.baseFlash.e = 0.12; }
    else {
      hitSection(u.lane, u.dmg);
      if (!u.ranged && lv('stacheln') > 0){ u.hp -= C.FX_STACHELN_DMG * lv('stacheln'); u.flash = 0.12; }
    }
    if (u.ranged) shot({ from: u.id, to: null, x0: u.x, x1: u.side === 'p' ? W - EBW + 8 : PBW - 8, lane: u.laneF, y0: lateralOf(u), y1: u.laneF, t: 0, dur: 0.3 });
  }

  /* ---------- Einzelsimulation (REQ-5.05) ----------
     Jede Einheit wählt ihr Ziel selbst: den nächsten Gegner der eigenen Lane in Reichweite, bei Gleichstand die niedrigste Id.
     Ein Ziel bleibt, bis es fällt oder die Reichweite verlässt. Nahkämpfer brauchen Kontakt (MELEE_REACH), Fernkämpfer schießen
     über eigene Reihen. Ohne Einheit in Reichweite greift eine Einheit die Basis an, wenn diese in Reichweite ist.
     Alle Angriffe eines Ticks werden aus dem Zustand zu Tickbeginn bestimmt und danach gemeinsam angewendet; keine Seite hat
     einen Zugvorteil. Türme wählen ebenso einzelne Einheiten. Ziele liegen als Ids in einer Map außerhalb des Spielstands. */
  let targets = new Map();
  const reachOf = u => u.ranged ? u.range : C.MELEE_REACH;
  const fighting = u => u.hp > 0 && u.laneF === u.lane;        // während der Querbewegung weder Angreifer noch Ziel
  /* Je Seite und Lane die kampffähigen Einheiten, nach x sortiert: Zielsuche per Binärsuche statt über alle Einheiten */
  const byX = (p, q) => p.x - q.x || p.id - q.id;
  /* Beide Seiten in einem Durchlauf */
  function laneIndexBoth(){
    const idx = { p: [[], [], []], e: [[], [], []] };
    for (const u of S.units) if (fighting(u)) idx[u.side][u.lane].push(u);
    for (const a of idx.p) a.sort(byX);
    for (const a of idx.e) a.sort(byX);
    return idx;
  }
  /* Nächste Einheit zu x innerhalb von reach; bei gleichem Abstand die niedrigste Id */
  function nearestIn(arr, x, reach){
    let lo = 0, hi = arr.length;
    while (lo < hi){ const m = (lo + hi) >> 1; if (arr[m].x < x) lo = m + 1; else hi = m; }
    let best = null, bd = Infinity;
    // nach rechts, dann nach links, jeweils bis außer Reichweite oder weiter als das beste Ziel (ohne Hilfsfunktion: Leistung)
    for (let i = lo; i < arr.length; i++){
      const u = arr[i], d = Math.abs(u.x - x);
      if (d > reach) break;
      if (d < bd || (d === bd && u.id < best.id)){ bd = d; best = u; }
      if (d > bd) break;
    }
    for (let i = lo - 1; i >= 0; i--){
      const u = arr[i], d = Math.abs(u.x - x);
      if (d > reach) break;
      if (d < bd || (d === bd && u.id < best.id)){ bd = d; best = u; }
      if (d > bd) break;
    }
    return best;
  }
  const byId = new Map();
  function keepTarget(key, x, reach, lanes){
    const id = targets.get(key), tg = id !== undefined ? byId.get(id) : null;
    return tg && fighting(tg) && lanes.includes(tg.lane) && Math.abs(tg.x - x) <= reach ? tg : null;
  }
  const ONE_LANE = Array.from({ length: C.LANE_COUNT }, (_, l) => [l]);
  let byIdFor = null, byIdLen = -1;
  /* Streuung je Angriff (REQ-6.02): ± COMBAT.cdJitter, Mittelwert der Angriffspause unverändert */
  const nextCd = u => u.cdMax * (1 + C.COMBAT.cdJitter * (2 * rnd() - 1));
  function resolveCombat(dt){
    // Zuordnung Id → Einheit nur neu aufbauen, wenn sich die Einheitenliste geändert hat
    // dabei auch Ziele gefallener Einheiten vergessen
    if (byIdFor !== S.units || byIdLen !== S.units.length){
      byId.clear(); for (const u of S.units) byId.set(u.id, u); byIdFor = S.units; byIdLen = S.units.length;
      for (const key of [...targets.keys()]) if (!byId.has(key) && typeof key === 'number') targets.delete(key);
    }
    const idx = laneIndexBoth();
    const attacks = [], overkill = C.COMBAT.avoidOverkill, planned = overkill ? new Map() : null;
    // 1. Ziele bestimmen, Zustand zu Tickbeginn
    for (const u of S.units){
      u.flash = Math.max(0, u.flash - dt);
      if (u.hp <= 0) continue;
      u.cd -= dt;
      if (u.cd > 0 || u.laneF !== u.lane) continue;
      const reach = reachOf(u), foes = idx[u.side === 'p' ? 'e' : 'p'][u.lane];
      let tg = keepTarget(u.id, u.x, reach, ONE_LANE[u.lane]) || nearestIn(foes, u.x, reach);
      // Overkill-Vermeidung (Schalter COMBAT.avoidOverkill): reicht der in diesem Takt geplante Schaden schon für den Abschuss,
      // wählt ein Fernkämpfer das nächste andere Ziel in Reichweite
      if (tg && u.ranged && overkill && (planned.get(tg.id) || 0) >= tg.hp){
        let alt = null, bd = Infinity;
        for (const f of foes){ const d = Math.abs(f.x - u.x); if (d <= reach && (planned.get(f.id) || 0) < f.hp && (d < bd || (d === bd && f.id < alt.id))){ bd = d; alt = f; } }
        if (alt) tg = alt;
      }
      if (tg){ targets.set(u.id, tg.id); attacks.push({ u, tg }); u.cd = nextCd(u); if (overkill) planned.set(tg.id, (planned.get(tg.id) || 0) + u.dmg); continue; }
      targets.delete(u.id);
      if ((baseX(u.side) - u.x) * dirOf(u.side) <= reach){ attacks.push({ u, base: true }); u.cd = nextCd(u); }
    }
    // Gegnerischer Turm an der Mitte: zuerst Einheiten der Mitte, sonst die nächste einer anderen Lane (REQ-43)
    S.enemyTurretCd -= dt;
    if (S.enemyTurretCd <= 0){
      const x = W - EBW, r = C.ENEMY_TURRET.range, all = [GATE, ...C.LANE_ORDER.filter(l => l !== GATE)];
      // behaltenes Ziel einer anderen Lane zählt nur, solange die Mitte frei ist (Rangfolge wie REQ-5.05, Punkt 1)
      const mid = nearestIn(idx.p[GATE], x, r), kept = keepTarget('eT', x, r, all);
      let tg = kept && (kept.lane === GATE || !mid) ? kept : mid;
      if (!tg){ let bd = Infinity; for (const l of all) if (l !== GATE){ const c = nearestIn(idx.p[l], x, r); if (c && (x - c.x < bd || (x - c.x === bd && c.id < tg.id))){ bd = x - c.x; tg = c; } } }
      if (tg){ targets.set('eT', tg.id); attacks.push({ turret: 'e', tg, dmg: diffCfg().turretDmg * enemyDmgMult() }); S.enemyTurretCd = C.ENEMY_TURRET.cd; }
    }
    // Eigene Türme: zuerst Gegner der eigenen Lane, sonst der Mitte; inaktiv, solange der Abschnitt gefallen ist (REQ-13.2, REQ-43)
    for (const lane of C.TOWER_LANES){
      if (!towerActive(lane)) continue;
      S.turretCd[lane] = (S.turretCd[lane] || 0) - dt;
      if (S.turretCd[lane] > 0) continue;
      const r = turretRange(lane), key = 'pT' + lane;
      const own = nearestIn(idx.e[lane], PBW, r), kept = keepTarget(key, PBW, r, [lane, GATE]);
      const tg = (kept && (kept.lane === lane || !own) ? kept : own) || nearestIn(idx.e[GATE], PBW, r);
      if (tg){ targets.set(key, tg.id); attacks.push({ turret: lane, tg, dmg: turretDmg(lane) * (tg.type === 'werfer' ? mMul('turretVsRanged') : 1) }); S.turretCd[lane] = turretCd(lane); }
    }
    // Bastionen (Sonderbau der Doktrin Bollwerk): wie die Türme der Lane, jede mit eigener Abklingzeit
    for (const i of bastionSlots()){
      const lane = bastionLane(i);
      if (!sectionUp(lane)) continue;
      const ck = 'b' + i;
      S.turretCd[ck] = (S.turretCd[ck] || 0) - dt;
      if (S.turretCd[ck] > 0) continue;
      const r = bastionRange(lane), key = 'pB' + i;
      const own = nearestIn(idx.e[lane], PBW, r), kept = keepTarget(key, PBW, r, [lane, GATE]);
      const tg = (kept && (kept.lane === lane || !own) ? kept : own) || nearestIn(idx.e[GATE], PBW, r);
      if (tg){ targets.set(key, tg.id); attacks.push({ turret: lane, tg, dmg: bastionDmg(lane) * (tg.type === 'werfer' ? mMul('turretVsRanged') : 1) }); S.turretCd[ck] = bastionCd(lane); }
    }
    // 2. Alle Angriffe gemeinsam anwenden; überschüssiger Schaden verfällt
    for (const a of attacks){
      if (a.turret !== undefined){
        const alive = a.tg.hp > 0;
        a.tg.hp -= a.dmg; a.tg.flash = 0.12;
        if (alive && a.tg.hp <= 0 && a.turret !== 'e') a.tg.towerKill = true;                 // Abschuss durch einen eigenen Turm (Teil 4: Material, EP)
        shot(a.turret === 'e' ? { x0: W - EBW / 2, lane0: GATE, x1: a.tg.x, lane: a.tg.laneF, t: 0, dur: 0.18, turret: true }
                              : { x0: PBW - 9, lane0: a.turret, x1: a.tg.x, lane: a.tg.laneF, t: 0, dur: 0.18, turret: true });
      } else if (a.base) hitBase(a.u);
      else hitUnit(a.u, a.tg);
    }
  }
  /* Ausfallschritt im Nahkampf (nur Darstellung, außerhalb des Spielstands) */
  function lunge(u){ if (FX.on) FX.lunge.set(u.id, 0); }

  /* ---------- Zustände der Armee (REQ-5.06): Marsch → Kampf → Sammeln → Marsch ----------
     Marsch: gemeinsame Front über alle Lanes, Tempo der langsamsten Einheit; Nachschub mit Aufschlusstempo bis hinter die Armee.
     Kampf: sobald in irgendeiner Lane ein Gegner, eine Mauer oder die Basis in Kontaktreichweite ist; die Gruppe hält an.
       Jede Einheit: 1. Gegner in der Heimat-Lane → dorthin; 2. sonst in die kämpfende Lane (Mitte zuerst, dann die mit den meisten
       Gegnern, bei Gleichstand die obere); dort reiht sie sich ein (Nahkämpfer füllen vorn, Fernkämpfer dahinter).
     Sammeln: kein Gegner mehr in Kontaktreichweite plus Hysterese; alle kehren in ihre Heimat-Lane zurück, dann Marsch
       (spätestens nach ARMY.regroupTimeoutS).
     Ausnahme Mitte: Fällt die letzte Einheit mit Heimat Mitte, geben die äußeren Lanes Einheiten ab, bis die Mitte ein Drittel hat. */
  const AR = C.ARMY;
  const dirTo = side => dirOf(side);
  /* Abstand von der Front einer Gruppe zum nächsten Gegner, zur Mauer oder zur Basis in einer Lane */
  function threat(g, lane, foes){
    const dir = dirTo(g.side);
    let d = (baseX(g.side) - g.x) * dir;
    for (const u of foes[lane]){ const dd = (u.x - g.x) * dir; if (dd > -C.TARGET_BEHIND_TOLERANCE && dd < d) d = dd; }
    return d;
  }
  /* Zahl der Gegner einer Lane im Kampfbereich der Front, für die Wahl der kämpfenden Lane */
  function foesNear(g, lane, foes){
    const dir = dirTo(g.side), zone = AR.contactRange + AR.contactHysteresis + C.ROW_GAP * C.FORMATION_ROW_MAX;
    let n = 0;
    for (const u of foes[lane]){ const dd = (u.x - g.x) * dir; if (dd > -C.TARGET_BEHIND_TOLERANCE && dd <= zone) n++; }
    return n;
  }
  const groupSpeed = (g, members) => Math.min(...members.map(u => u.speed || C.UNITS[u.type].speed)) * (g.main ? 1 : AR.catchUpFactor);
  const lanesOf = members => { const c = new Array(LANES).fill(0); for (const u of members) c[u.home]++; return c; };
  /* Schwächste Lane (wenigste Einheiten nach Heimat), bei Gleichstand die Mitte, sonst die obere */
  function weakestLane(counts, side){
    if (side === 'p' && mAdd('allMid') > 0) return GATE;               // Alles auf die Mitte (REQ-45)
    let best = GATE;
    for (const l of [0, 2]) if (counts[l] < counts[best] || (counts[l] === counts[best] && best !== GATE && l < best)) best = l;
    return best;
  }
  /* Ausnahme Mitte: äußere Lanes geben Einheiten ab (Nahkämpfer zuerst, aus der volleren Lane), bis die Mitte ein Drittel hat */
  function refillMid(g){
    const m = formMembers(g), need = Math.ceil(m.length * AR.midRefillShare);
    const c = lanesOf(m);
    while (c[GATE] < need){
      // Nahkämpfer zuerst; unter gleichen Typen aus der volleren äußeren Lane (bei Gleichstand oben), dort die hinterste Einheit
      const outer = m.filter(u => u.home !== GATE);
      if (!outer.length) break;
      const pool = outer.some(u => !u.ranged) ? outer.filter(u => !u.ranged) : outer;
      const from = [0, 2].filter(l => pool.some(u => u.home === l)).sort((a, b) => c[b] - c[a] || a - b)[0];
      const pick = pool.filter(u => u.home === from).sort((a, b) => b.id - a.id)[0];
      pick.home = GATE; if (!g.fighting) setLane(pick, GATE); c[from]--; c[GATE]++;
    }
    log('log.midRefill');
  }
  /* Nachschub: hinter der Armee angekommen, verschmilzt er und füllt die schwächste Lane auf */
  function mergeInto(main, g){
    const c = lanesOf(formMembers(main));
    for (const u of formMembers(g).sort((a, b) => a.id - b.id)){
      const l = weakestLane(c, g.side);
      u.home = l; if (main.state !== 'fight') setLane(u, l);
      u.form = main.id; u.slot = null; c[l]++;                      // Nachschub reiht sich hinten ein (feste Plätze, REQ-6.01)
    }
    g.size = 0;
  }
  function updateArmies(dt){
    // Mitglieder je Gruppe in einem Durchlauf; Lage der Gegner zu Tickbeginn (Leistung: REQ-5.05)
    const mem = new Map();
    for (const f of S.forms) mem.set(f.id, []);
    for (const u of S.units) if (u.hp > 0){ const m = mem.get(u.form); if (m) m.push(u); }
    // Für die Lage einer Lane zählen auch Einheiten, die gerade in sie wechseln (Ziel-Lane): sonst laufen zwei Armeen in
    // verschiedenen Lanes einander hinterher und tauschen endlos die Lanes
    const bound = { p: [[], [], []], e: [[], [], []] };
    for (const u of S.units) if (u.hp > 0) bound[u.side][u.lane].push(u);
    let relayout = false;
    for (const g of S.forms){
      const members = mem.get(g.id), foes = bound[g.side === 'p' ? 'e' : 'p'], dir = dirTo(g.side);
      const dist = [threat(g, 0, foes), threat(g, 1, foes), threat(g, 2, foes)];
      const enter = dist.map(d => d <= AR.contactRange), stay = dist.map(d => d <= AR.contactRange + AR.contactHysteresis);
      // Zustandswechsel frühestens nach ARMY.minStateS im alten Zustand (REQ-6.01). Ausnahme: Marsch → Kampf sofort, sonst liefe die
      // Armee in den Gegner hinein; die Bewegung hält ohnehin an der Kontaktreichweite.
      const prevState = g.state, settled = (g.st || 0) >= AR.minStateS;
      if (g.state === 'march' && enter.some(Boolean)) g.state = 'fight';
      else if (g.state === 'fight' && settled && !stay.some(Boolean)){ g.state = 'regroup'; g.t = 0; }
      else if (g.state === 'regroup'){
        if (enter.some(Boolean)){ if (settled) g.state = 'fight'; }
        else {
          g.t += dt;
          if (settled && (g.t >= AR.regroupTimeoutS || members.every(u => u.lane === u.home && u.laneF === u.home))) g.state = 'march';
        }
      }
      if (g.state !== prevState){
        g.st = 0;
        if (g.state === 'regroup') for (const u of members) u.slot = null;       // beim Sammeln werden die Plätze neu vergeben
      } else g.st = (g.st || 0) + dt;
      g.fighting = g.state === 'fight';
      // Lane je Einheit
      let help = GATE;
      if (g.fighting && !stay[GATE]){
        let bn = -1;
        for (const l of [0, 2]) if (stay[l]){ const n = foesNear(g, l, foes); if (n > bn){ bn = n; help = l; } }
      }
      // Vorrang der Mitte (Fix aus I4.3, REQ-5.06): Einheiten in der Mitte helfen einer äußeren Lane nur dort, wo eigene Einheiten schon kämpfen
      const engaged = [false, false, false];
      if (g.fighting) for (const u of members) if (u.laneF === u.lane && stay[u.lane]) engaged[u.lane] = true;
      for (const u of members){
        let lane = g.fighting && !stay[u.home] ? help : u.home;
        if (g.fighting && lane !== GATE && lane !== u.home && u.lane === GATE && u.laneF === GATE && !engaged[lane]) lane = GATE;
        // Gebundene Lane-Wahl (REQ-6.01): eine helfende Einheit bleibt in ihrer Ziel-Lane, bis dort kein Gegner mehr ist;
        // nur ein Gegner in der eigenen Heimat-Lane ruft sie vorher zurück
        if (g.fighting && u.lane !== u.home && stay[u.lane] && !stay[u.home]) lane = u.lane;
        // Unterwegs bleibt das Ziel bis zur Ankunft: sonst entscheiden beide Seiten im selben Takt gegeneinander und tauschen
        // in jedem Takt die Lane (Befund I6.1: Mitte hilft oben, der Gegner der Mitte ebenso, beide kehren um …)
        if (g.fighting && u.laneF !== u.lane) lane = u.lane;
        // Nach der Ankunft bleibt eine Einheit mindestens ARMY.minLaneStayS in der Lane (kein sofortiges Umkehren, REQ-6.01)
        if (g.fighting && u.arrived != null && S.t - u.arrived < AR.minLaneStayS) lane = u.lane;
        if (u.lane !== lane){ setLane(u, lane); relayout = true; }
        // Querbewegung: während des Wechsels kämpft eine Einheit nicht und ist nicht greifbar; Totzone ARMY.deadZone
        if (u.laneF !== u.lane){
          const step = dt / C.LANE_SHIFT_S;
          u.laneF = Math.abs(u.lane - u.laneF) <= Math.max(step, AR.deadZone) ? u.lane : u.laneF + Math.sign(u.lane - u.laneF) * step;
          if (u.laneF === u.lane) u.arrived = S.t;                      // Ankunft: Mindestverweildauer beginnt
        }
      }
      // Bewegung nur im Marsch; bis auf Kontaktreichweite, Nachschub höchstens bis hinter die Armee
      g.moving = false;
      if (g.state === 'march' && members.length){
        let step = groupSpeed(g, members) * dt;
        for (const d of dist) step = Math.min(step, Math.max(0, d - AR.contactRange));
        const main = mainOf(g.side);
        if (main && main !== g){
          const rear = main.x - dir * (main.rows) * C.ROW_GAP;           // eine Reihe Abstand hinter der letzten Reihe
          step = Math.min(step, Math.max(0, (rear - g.x) * dir));
        }
        if (step > 0){ g.x += dir * step; for (const u of members) u.x += dir * step; g.moving = true; }
      }
    }
    // Nachschub hinter der Armee verschmilzt mit ihr
    for (const g of S.forms){
      const main = mainOf(g.side);
      if (!main || main === g || g.size === 0) continue;
      const rear = main.x - dirTo(g.side) * main.rows * C.ROW_GAP;
      if ((rear - g.x) * dirTo(g.side) <= 0.5){ mergeInto(main, g); relayout = true; }
    }
    if (relayout) layoutAll();
    resolveCombat(dt);                                                  // Lane-Index nach der Bewegung, einmal je Tick
    // Gruppen, die in diesem Schritt eine Einheit der Mitte verloren haben (für die Ausnahme Mitte)
    const lostMid = new Set(), repelledCheck = new Set();
    for (const u of S.units){
      if (u.hp > 0 || u.dead) continue;
      u.dead = true;
      if (u.home === GATE) lostMid.add(u.form);
      if (u.side === 'e'){
        const xp = C.UNITS[u.type].bounty * bountyMult() * xpMult() * (u.towerKill ? mMul('towerKillXp') : 1);
        S.stats.xpKill = (S.stats.xpKill || 0) + xp;
        if (u.towerKill) S.stats.xpTower = (S.stats.xpTower || 0) + xp;                      // Kennzahl: EP aus Turm-Abschüssen (Teil 5, REQ-K5.01)
        gainXp(xp, u.towerKill ? 'tower' : 'kill');
        S.kills++;
        if (u.towerKill && S.pacing === 'karten'){                                            // Turm-Abschuss (Teil 4): Zähler, Material (Karte Plünderung, Wachstube)
          S.stats.towerKills = (S.stats.towerKills || 0) + 1;
          const k = mAdd('towerKillMaterial');
          if (k > 0){ const m = C.UNITS[u.type].bounty * k; addMaterial(m, 'kill'); S.stats.towerMaterial = (S.stats.towerMaterial || 0) + m; }
        }
        if (u.wave) repelledCheck.add(u.wave);
      } else S.losses++;
      if (FX.on) FX.fx.push({ x: u.x, lane: u.laneF, t: 0, side: u.side, type: u.type });
    }
    const before = S.units.length;
    S.units = S.units.filter(u => !u.dead);
    const died = S.units.length !== before;
    // vollständig abgewehrte Gegnerwelle (Teil 4): keine Einheit und kein wartender Nachzügler der Welle mehr
    for (const w of repelledCheck) if (!S.units.some(x => x.side === 'e' && x.wave === w) && !S.enemyQueue.some(q => q.wave === w)) onWaveRepelled(w);
    // Ausnahme Mitte: die letzte Einheit der Mitte ist gefallen (Vorrang vor allen anderen Regeln)
    for (const g of S.forms) if (g.main && lostMid.has(g.id)){ const m = formMembers(g); if (m.length && !m.some(u => u.home === GATE)) refillMid(g); }
    // Kennzahl: Zeitanteil der eigenen Armee im Kampf (REQ-5.08)
    const pm = mainOf('p');
    if (pm){ S.stats.armyTime = (S.stats.armyTime || 0) + dt; if (pm.fighting) S.stats.fightTime = (S.stats.fightTime || 0) + dt; }
    if (died) layoutAll();
  }

  function checkReveals(){
    for (const id in C.UPGRADES){
      if (S.revealed[id] || !isAvailable(id)) continue;
      if (S[C.UPGRADES[id].cur] >= upCost(id) * C.REVEAL_AT || S.lvl[id] > 0){
        S.revealed[id] = true;
        const u = C.UPGRADES[id], base = u.base || id, name = '@upg.' + base + (base === 'turm' && S.lvl[id] === 0 ? '.build' : '.name');
        if (S.t > 1) log(u.tower !== undefined ? 'log.newTowerOption' : 'log.newOption', { name, lane: '@lane.' + u.tower });
      }
    }
    S.sections.forEach((s, i) => { if (!S.revealed['repair_' + i] && s.hp < sectionMax(i)) S.revealed['repair_' + i] = true; });
  }
  /* ---------- EP-Stufen und Draft (REQ-02, REQ-5.02) ---------- */
  /* EP aus einer Quelle ('kill', 'tower', 'base', 'wave', 'budget', 'passive', 'bounty'). Modus karten (Teil 5, REQ-K5.04): Lehrjahre (xpGain) wirkt auf alle EP-Quellen;
     Abschüsse tragen den Faktor schon in ihrem Wert (bountyMult), die Kriegsbeute des Tutorials bleibt unberührt. Zähler je Quelle für Bericht und Protokoll. */
  function gainXp(b, src){
    if (S.pacing === 'karten'){
      if (src !== 'kill' && src !== 'tower' && src !== 'bounty') b *= mMul('xpGain');
      const m = S.stats.xpSrc = S.stats.xpSrc || {}; m[src || 'other'] = (m[src || 'other'] || 0) + b;
    }
    S.xp += b; S.xpTotal += b;
    while (S.xpTotal >= xpNeed(S.level + 1)){
      S.level++; S.pendingLevels++;
      log('log.levelUp', { n: S.level });
    }
    if (!S.pendingDraft && S.pendingLevels > 0 && draftReady()) offerDraft();
  }
  /* Pfadkarten (Modus 'karten'): ziehbar ab der abWahl-ten Wahl, wenn ihre Voraussetzungen stehen und keine Exklusivkarte gewählt ist (REQ-KP.02) */
  const requirementMet = b => b.startsWith('gebaut:') ? has(b.slice(7)) : sourceMet(b);
  const isPathFamily = o => !!o.pfad && o.family === 'technologie';
  function pfadAvailable(o){
    const k = o.pfad;
    if (S.pacing !== 'karten' || cardTaken(o.id) > 0 || S.research.banned.includes(o.id)) return false;
    if (k.abWahl > S.pfad.choices + 1) return false;
    if (!(k.benoetigt || []).every(requirementMet)) return false;
    if (k.familie === 'technologie' && !has('universitaet')) return false;
    if ((k.exklusivMit || []).some(id => cardTaken(id) > 0)) return false;
    if (supplyCapped() && supplyOnly(tiersOf(o)[0].effect || [])) return false;       // Versorgung am Deckel (Wagnis „Volle Auslastung“): nur der Nachteil bliebe
    return true;
  }
  const cardRemoved = id => S.pacing === 'karten' && !!PFAD && (PFAD.entfallenKarten || []).includes(id);
  /* Nach der höchsten Stufe erscheint eine Karte nicht mehr; sonst liegt genau die nächste Stufe im Pool (REQ-18.2) */
  function optionAvailable(o){
    if (o.pfad) return pfadAvailable(o);
    const n = cardTaken(o.id), tiers = tiersOf(o);
    if (S.research.banned.includes(o.id)) return false;
    if (o.nurKarten && S.pacing !== 'karten') return false;                                                  // Karten des Teils 6 gibt es nur im Modus karten (data/karten6.js)
    if (cardRemoved(o.id)) return false;                                                                    // Teil 4 und 5: aus dem Pool des Modus karten gestrichen (REQ-S.02 C2, S.03, K5.06)
    if (o.doktrin && (S.pacing !== 'karten' || doktrinCount() >= C.DOKTRIN.max)) return false;               // Doktrinen: nur im Modus karten, höchstens C.DOKTRIN.max je Partie (Teil 5, REQ-K5.07)
    if (o.abWahl && o.abWahl > S.pfad.choices + 1) return false;
    if (n >= Math.min(tiers.length, C.CARD_MAX_TIER)) return false;
    if (o.requires){
      const r = o.requires;
      if (r.upgrade && !Object.keys(C.UPGRADES).some(id => (C.UPGRADES[id].base || id) === r.upgrade && S.lvl[id] > 0)) return false;
      if (r.building && !has(r.building)) return false;
      if (r.unit && !isOpen('einheit:' + r.unit)) return false;
    }
    if (o.wirkt && S.pacing === 'karten'){                                      // Angebotsbedingungen aus der Wirkung (REQ-P.05); der Standardmodus bleibt wie main
      const w = o.wirkt;
      if (w.building && !has(w.building)) return false;
      if (w.phase && PHASES.indexOf(phase()) < PHASES.indexOf(w.phase)) return false;
      if (w.freeSlot && !S.slots.some(x => !x)) return false;
      if (w.supply && supplyCap() < w.supply) return false;
      if (w.tower && !C.TOWER_LANES.some(towerBuilt)) return false;
      if (w.zinsdeckel && !(S.stats.zinsDeckel > 0)) return false;                  // Handelskontor: erst anbieten, wenn der Zinsdeckel erreicht wurde (Teil 4, REQ-S.03)
      if (w.ranged && !Object.keys(C.UNITS).some(ty => !C.UNITS[ty].base && unitUnlocked(ty) && isRangedType(ownType(ty)))) return false;       // eigene Grundtypen (Ersatztypen tragen base)
    }
    for (const e of tiers[n].effect || []) if (e.unlock && (S.unlocked[e.unlock] || C.START_BUILDINGS.includes(e.unlock))) return false;
    if (supplyCapped() && supplyOnly(tiers[n].effect || [])) return false;       // Versorgung am Deckel: die Karte brächte nur ihren Nachteil
    return true;
  }
  /* Glücksgriff (REQ-5.07): verschiebt Ziehgewicht von gewöhnlichen zu seltenen Karten */
  function rarityWeight(r){
    const w = C.CARD_RARITY_WEIGHTS, b = mAdd('rareBonus');
    return r === 'rare' ? w.rare + b : r === 'common' ? Math.max(0, w.common - b) : w[r];
  }
  const cardWeight = o => rarityWeight(o.rarity) * Math.pow(C.CARD_TIER_WEIGHT_BONUS, cardTaken(o.id));
  const draftSize = () => {
    const a = S.pacing === 'karten' ? C.KARTEN.angebot : null;           // Modus karten: 3 Karten, mit Universität 4 (REQ-P.04); Standard 2 bzw. 3
    return (has('universitaet') ? (a ? a.universitaet : C.DRAFT_OPTIONS_UNIVERSITY) : (a ? a.basis : C.DRAFT_OPTIONS_BASE)) + mAdd('draftSize');
  };
  /* Gewichtete Ziehung ohne Zurücklegen, über den seedbaren Spielzufall (REQ-45):
     höchstens eine legendäre Karte je Angebot; die letzte Karte kommt aus einer anderen Kategorie, falls sonst nur eine vertreten wäre */
  function drawOptions(k){
    let pool = OPTIONS.filter(optionAvailable);
    const out = [];
    while (out.length < k && pool.length){
      let cand = pool;
      const cats = new Set(out.map(id => OPT[id].category));
      if (out.length === k - 1 && cats.size === 1){
        const other = pool.filter(o => !cats.has(o.category));
        if (other.length) cand = other;
      }
      const total = cand.reduce((a, o) => a + cardWeight(o), 0);
      let r = rnd() * total, i = 0;
      while (i < cand.length - 1 && r >= cardWeight(cand[i])){ r -= cardWeight(cand[i]); i++; }
      const pick = cand[i];
      out.push(pick.id);
      pool = pool.filter(o => o !== pick && !(pick.rarity === 'legendary' && o.rarity === 'legendary'));
    }
    return out;
  }
  /* Angebot im Modus 'karten' (REQ-P.04, ersetzt REQ-KP.02): zwei Wege gegeneinander. Pfadplätze = min(KARTEN.pfadPlaetze, ziehbare Pfadkarten), der Rest sind Bonusplätze
     (aus Bonus- und Wagnis-Karten, höchstens eine Wagnis-Karte). Pfadkarten sind seit Teil 5 nur noch Technologie-Karten (erst mit Universität); sie werden nach Gewicht gezogen.
     Die Reihenfolge der Plätze wird gemischt. */
  const pickWeighted = (list, w) => {
    const total = list.reduce((a, o) => a + w(o), 0);
    let r = rnd() * total, i = 0;
    while (i < list.length - 1 && r >= w(list[i])){ r -= w(list[i]); i++; }
    return list[i];
  };
  const weightKarten = o => o.pfad ? (C.KARTEN.gewichte[o.id] ?? o.pfad.gewicht) : o.doktrin ? C.DOKTRIN.gewicht : cardWeight(o);
  /* Angebotsausgleich: ab Wahl abWahl erscheint spätestens in jeder spaetestensJe-ten Wahl eine Doktrin, solange noch eine fehlt (sie belegt einen Bonusplatz) */
  const doktrinDue = () => S.pacing === 'karten' && doktrinCount() < C.DOKTRIN.max && S.pfad.choices + 1 >= C.DOKTRIN.abWahl && S.pfad.sinceDoktrin >= C.DOKTRIN.spaetestensJe - 1;
  function drawOptionsKarten(k){
    const pool = ALL_OPTIONS.filter(optionAvailable);
    const pf = pool.filter(isPathFamily), rest = pool.filter(o => !isPathFamily(o));
    const out = [];
    const take = (o, list) => { out.push(o); const i = list.indexOf(o); if (i >= 0) list.splice(i, 1); };
    const slots = Math.min(C.KARTEN.pfadPlaetze, pf.length, k);
    while (out.length < slots && pf.length) take(pickWeighted(pf, weightKarten), pf);
    const doks = rest.filter(o => o.doktrin);
    if (doktrinDue() && doks.length && out.length < k) take(pickWeighted(doks, weightKarten), rest);
    while (out.length < k && rest.length){
      const hasWag = out.some(o => o.family === 'wagnis'), hasLeg = out.some(o => o.rarity === 'legendary'), hasDok = out.some(o => o.doktrin);
      const cand = rest.filter(o => !(o.family === 'wagnis' && hasWag) && !(o.rarity === 'legendary' && hasLeg) && !(o.doktrin && hasDok));
      if (!cand.length) break;
      take(pickWeighted(cand, weightKarten), rest);
    }
    while (out.length < k && pf.length) take(pickWeighted(pf, weightKarten), pf);       // Bonuskarten erschöpft: Pfadkarten füllen auf
    for (let i = out.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out.map(o => o.id);
  }
  function offerDraft(){
    const options = S.pacing === 'karten' ? drawOptionsKarten(draftSize()) : drawOptions(draftSize());
    if (!options.length){ S.pendingLevels = 0; return; }
    S.pendingDraft = { level: S.level - S.pendingLevels + 1, options, rerolled: 0, doktrinForced: doktrinDue() };       // doktrinForced: eine Doktrin war fällig (Bann behält sie)
    if (S.pacing === 'karten'){                                              // Angebote mit Doktrin zählen; ohne eine seit Wahl abWahl läuft der Zähler bis zur erzwungenen (Teil 5, REQ-K5.07)
      if (options.some(id => OPT[id].doktrin)){ S.pfad.sinceDoktrin = 0; S.stats.doktrinOffers = (S.stats.doktrinOffers || 0) + 1; (S.stats.doktrinOfferWahlen = S.stats.doktrinOfferWahlen || []).push(S.pfad.choices + 1); }       // Nummern der Wahlen mit Doktrin im Angebot (Kennzahl, Teil 6)
      else if (S.pfad.choices + 1 >= C.DOKTRIN.abWahl) S.pfad.sinceDoktrin++;
    }
    if (S.pacing === 'karten'){                                           // Protokoll je Wahl: Nummer, Erscheinen, Wahl (REQ-P.06)
      const d = S.pendingDraft; (S.stats.wahlen = S.stats.wahlen || []).push({ n: d.level, t: Math.round(S.t * 10) / 10, tp: null });
    }
  }
  /* Neu ziehen (REQ-5.07): alle Optionen der offenen Wahl neu ziehen, je Wahl höchstens mAdd('rerolls')-mal */
  const rerollsLeft = () => S.pendingDraft ? Math.max(0, mAdd('rerolls') - (S.pendingDraft.rerolled || 0)) : 0;
  function rerollDraft(){
    if (!S.pendingDraft || rerollsLeft() <= 0) return false;
    const options = S.pacing === 'karten' ? drawOptionsKarten(draftSize()) : drawOptions(draftSize());
    if (!options.length) return false;
    S.pendingDraft.options = options; S.pendingDraft.rerolled = (S.pendingDraft.rerolled || 0) + 1;
    return true;
  }
  /* Bann (REQ-5.07): eine angebotene Karte für diese Partie aus dem Pool nehmen; an ihre Stelle tritt eine neue */
  /* Pfadkarten der Familien Bau und Technologie sind die einzige Quelle ihrer Inhalte; sie lassen sich nicht bannen, sonst bliebe etwas unerreichbar (REQ-KP.06) */
  const canBan = id => !(OPT[id] && isPathFamily(OPT[id]));
  const bansLeft = () => Math.max(0, mAdd('bans') - S.research.banned.length);
  function banOption(i){
    const d = S.pendingDraft;
    if (!d || bansLeft() <= 0 || i < 0 || i >= d.options.length || !canBan(d.options[i])) return false;
    S.research.banned.push(d.options[i]);
    const rest = d.options.filter((_, k) => k !== i);
    const hasWag = rest.some(id => OPT[id] && OPT[id].family === 'wagnis');
    const hasDok = rest.some(id => OPT[id] && OPT[id].doktrin);
    const pool = (S.pacing === 'karten' ? ALL_OPTIONS : OPTIONS).filter(o => optionAvailable(o) && !rest.includes(o.id) && !(S.pacing === 'karten' && (isPathFamily(o) || (hasWag && o.family === 'wagnis') || (hasDok && o.doktrin))));       // Bann tauscht nur Bonusplätze (REQ-P.04)
    const total = pool.reduce((a, o) => a + cardWeight(o), 0);
    let repl = null;
    if (pool.length){ let r = rnd() * total, k = 0; while (k < pool.length - 1 && r >= cardWeight(pool[k])){ r -= cardWeight(pool[k]); k++; } repl = pool[k].id; }
    // war eine Doktrin fällig und die gebannte die einzige im Angebot, tritt eine andere Doktrin an ihre Stelle (Teil 5, REQ-K5.07)
    if (S.pacing === 'karten' && OPT[d.options[i]].doktrin && d.doktrinForced && !rest.some(id => OPT[id].doktrin)){
      const kp = pool.filter(o => o.doktrin); if (kp.length) repl = pickWeighted(kp, weightKarten).id;
    }
    d.options = repl ? d.options.map((id, k) => k === i ? repl : id) : rest;
    return true;
  }

  /* ---------- Forschung (REQ-5.07): Material und Zeit, eine gleichzeitig (Zweiter Forschungsplatz: zwei) ---------- */
  const researchTier = id => S.research.done[id] || 0;
  const researchSlots = () => 1 + mAdd('researchSlots');
  const researchNext = id => { const r = RES[id], n = researchTier(id); return r && n < r.tiers.length ? r.tiers[n] : null; };
  const researchCost = id => { const t = researchNext(id); return t ? t.cost : null; };
  function researchBlock(id){
    const r = RES[id];
    if (!r) return 'unknown';
    if (S.status !== 'running') return 'notRunning';
    if ((r.branch === 'pfad' && S.pacing !== 'karten') || (S.pacing === 'karten' && PFAD && (PFAD.entfallen || []).includes(id))) return 'notInMode';
    if (!has('universitaet')) return 'noUni';
    if (!isOpen('forschung:' + id)) return 'closed';
    if (!researchNext(id)) return 'maxed';
    if (S.research.locked && S.research.locked.includes(id)) return 'locked';   // nur Simulation: Paarvergleich gesperrt (REQ-6.06)
    if (r.requires && researchTier(r.requires.research) < r.requires.tier) return 'requires';
    if (S.research.active.some(a => a.id === id)) return 'active';
    if (supplyCapped() && supplyOnly(researchNext(id).effect || [])) return 'noEffect';
    if (S.research.active.length >= researchSlots()) return 'busy';
    if (S.material < researchCost(id)) return 'material';
    return null;
  }
  /* Beschleunigen gegen Material (REQ-6.06): die restliche Zeit einer laufenden Forschung sofort abschließen. Preis je gesparter Sekunde
     RESEARCH_RUSH.perS, je Stufe über der ersten um RESEARCH_RUSH.tierStep teurer; zugleich eine Material-Senke (REQ-6.07) */
  function rushCost(id){
    const a = S.research.active.find(x => x.id === id);
    if (!a) return null;
    return Math.ceil(Math.max(0, a.timeS - a.t) * C.RESEARCH_RUSH.perS * (1 + C.RESEARCH_RUSH.tierStep * (a.tier - 1)));
  }
  function rushResearch(id){
    const a = S.research.active.find(x => x.id === id), cost = rushCost(id);
    if (!a || S.status !== 'running' || !has('universitaet') || S.material < cost) return false;
    S.material -= cost; a.t = a.timeS;
    S.stats.rushSpent = (S.stats.rushSpent || 0) + cost;
    progressResearch(0);
    return true;
  }
  /* Ergebnis einer Pfadforschung (REQ-KP.04/05): Schlüssel öffnen, Einheiten ersetzen; Upgrade-Stufen öffnen sich über ihre Quelle (sourceMet) */
  function applyResearchResult(r){
    if (!r || r.branch !== 'pfad') return;
    for (const key of r.schaltetFrei || []) if (!key.startsWith('stufe:') && unlockKey(key)) log('log.unlockedKey', { what: '@' + keyNameKey(key) });
    for (const [from, to] of Object.entries(r.ersetzt || {})) replaceUnit(from, to);
  }
  function startResearch(id){
    if (researchBlock(id)) return false;
    const t = researchNext(id);
    S.material -= t.cost;
    S.research.active.push({ id, tier: researchTier(id) + 1, t: 0, timeS: t.timeS });
    return true;
  }
  /* Fortschritt nur, solange die Universität steht */
  function progressResearch(dt){
    if (!S.research.active.length || !has('universitaet')) return;
    // Universität neben Fabriken forscht schneller (Nachbarschaft, REQ-6.07 a): Forschungszeit × (1 + Regelwert)
    const speed = 1 / Math.max(0.1, 1 + nbTotal('universitaet'));
    for (const a of S.research.active) a.t += dt * speed;
    const done = S.research.active.filter(a => a.t >= a.timeS);
    if (!done.length) return;
    S.research.active = S.research.active.filter(a => a.t < a.timeS);
    for (const a of done){
      S.research.done[a.id] = a.tier; S.research.ver++; S.research.fresh = true;
      applyResearchResult(RES[a.id]);
      (S.stats.researchDone = S.stats.researchDone || []).push({ id: a.id, tier: a.tier, t: +S.t.toFixed(1) });   // Forschungstempo (REQ-6.06)
      log('log.research', { name: '@' + RES[a.id].nameKey, tier: a.tier });
    }
  }
  function chooseDraft(i){
    const d = S.pendingDraft;
    if (!d || i < 0 || i >= d.options.length) return false;
    const o = OPT[d.options[i]];
    S.draft.stacks[o.id] = cardTaken(o.id) + 1;
    S.draft.ver++;
    if (o.pfad){
      for (const key of o.pfad.schaltetFrei || []) if (!key.startsWith('stufe:') && unlockKey(key)) log('log.unlockedKey', { what: '@' + keyNameKey(key) });
      for (const r of o.pfad.oeffnetForschung || []) if (unlockKey('forschung:' + r)) S.research.fresh = true;
    }
    S.pfad.choices++; S.pfad.lastPickT = S.t;
    if (o.doktrin) (S.stats.doktrinen = S.stats.doktrinen || []).push({ id: o.id, wahl: S.pfad.choices, t: +S.t.toFixed(1) });
    for (const e of cardTier(o.id, S.draft.stacks[o.id]).effect || []){
      if (e.unlock){ unlockBuilding(e.unlock); log('log.unlocked', { building: '@bld.' + e.unlock + '.name' }); }
      if (e.grant === 'production') addMaterial(Math.max(matRate(), C.GRANT_MIN_RATE) * e.seconds);
    }
    clampSections();
    log('log.draft', { name: '@' + o.nameKey, tier: S.draft.stacks[o.id] });
    S.pendingDraft = null;
    S.pendingLevels--;
    if (S.stats.wahlen && S.stats.wahlen.length) S.stats.wahlen[S.stats.wahlen.length - 1].tp = Math.round(S.t * 10) / 10;
    if (S.pendingLevels > 0 && draftReady()) offerDraft();
    emit('cardChosen', { id: o.id });
    return true;
  }
  /* Automatisierungskarten (REQ-45): kaufen und reparieren selbst, sobald genug Material da ist */
  function automation(){
    const f = mAdd('autoRepairCost');
    if (f > 0) S.sections.forEach((s, i) => { if ((s.hp > 0 || i === GATE) && s.hp < sectionMax(i) * (OPT.instandhaltung.condition.value + mAdd('repairTh'))) repair(i, f); });
    const smith = mAdd('autoSmith');
    if (smith > 0 && has('schmiede') && S.material >= upCost('qualitaet') * smith) buy('qualitaet');
    const fab = mAdd('autoFactory');
    if (fab > 0 && S.slots.some(x => !x) && S.material >= Math.max(1, factoryCost()) * fab) build('fabrik');
    const tower = mAdd('autoTower');
    if (tower > 0) for (const lane of C.TOWER_LANES){ const id = towerId('turm', lane); if (S.lvl[id] > 0 && S.material >= upCost(id) * tower) buy(id); }
  }
  /* Bedingte Wirkungen */
  function applyConditionals(dt){
    const siege = mAdd('siegeDps');
    if (siege > 0 && (mAdd('siegeAlways') > 0 || S.units.some(u => u.side === 'p' && u.x >= W * C.SIEGE_LANE_FRACTION))) damageEnemyBase(siege * dt);       // siegeAlways: Sappeure Stufe 2 (Teil 5)
    const charges = mAdd('emergencyRepair') - S.emergencyUsed;
    if (charges > 0){
      const th = (OPT.notreserve && OPT.notreserve.condition.value) || 0;   // Tor unter 25 %: einmal vollständig reparieren
      if (gateHp() > 0 && gateHp() < sectionMax(GATE) * th){ S.sections[GATE].hp = sectionMax(GATE); S.emergencyUsed++; log('log.emergency'); }
    }
  }

  /* Nachzügler der Gegnerwellen und Notaufgebot */
  function spawnEnemies(){
    let field = S.units.filter(u => u.side === 'e').length;
    for (let i = 0; i < S.enemyQueue.length; i++){
      const q = S.enemyQueue[i];
      if (q.at > S.t) continue;
      if (spawnBlocked(q.lane)) continue;
      if (!q.alarm && (gateBlocked(q.lane) || field >= diffCfg().maxField)) continue;
      const g = addFormation('e', q.lane, [q.type], W - EBW);
      if (q.wave) for (const u of S.units) if (u.form === g.id) u.wave = q.wave;
      S.enemyQueue.splice(i, 1); i--; field++;
    }
  }

  /* Lagerdeckel: Materialertrag von C.LAGER.minuten Minuten, mindestens C.LAGER.min */
  const lagerDeckel = () => Math.max(C.LAGER.min, incomeRate() * 60 * C.LAGER.minuten);
  /* Unterhalt wird vom Material abgezogen; was fehlt, wird nicht nachgefordert (kein Minus) */
  function payUpkeep(dt){
    const paid = Math.min(Math.max(0, S.material), upkeepRate() * dt);
    S.material -= paid; S.stats.upkeep = (S.stats.upkeep || 0) + paid;
  }
  function tick(dt){
    if (S.status !== 'running') return;
    if (S.pendingDraft){                                    // offene Kartenwahl: pausiert das Spiel (Standard), läuft langsam oder weiter (KARTENBUEHNE.zeit, REQ-K2.02)
      const z = C.KARTENBUEHNE.zeit, f = z === 'lauf' ? 1 : z === 'langsam' ? C.KARTENBUEHNE.langsamFaktor : 0;
      if (!f) return;
      dt *= f;
    }
    S.t += dt;
    S.stats.prod[phase()].time += dt;
    // Aufgeschobene Wahl (Mindestabstand, REQ-P.02) erscheint, sobald der Abstand erreicht ist
    if (S.pacing === 'karten' && !S.pendingDraft && S.pendingLevels > 0 && draftReady()) offerDraft();
    addProduction(matRate() * dt);
    addProduction(autoPressCps() * clickPower() * dt);
    if (S.pacing === 'karten' && mAdd('upkeep') > 0) payUpkeep(dt);
    if (S.pacing === 'karten' && mAdd('lagerEp') > 0 && S.material > lagerDeckel()){       // Karte Lagerzehnt (Teil 6, vorher Linie Wirtschaft Stufe 2): Material über dem Lagerdeckel wird zu EP
      const over = S.material - lagerDeckel();
      S.material -= over; S.stats.lagerMaterial = (S.stats.lagerMaterial || 0) + over;
      gainXp(over * C.LAGER.kurs, 'lager');
    }
    for (const s of S.sections) s.repairCd = Math.max(0, (s.repairCd || 0) - dt);
    if (S.waveRushCd) S.waveRushCd = Math.max(0, S.waveRushCd - dt);
    if (lv('moertel') > 0) S.sections.forEach((s, i) => { if (s.hp > 0) s.hp = Math.min(sectionMax(i), s.hp + C.FX_MOERTEL_REGEN * lv('moertel') * dt); });
    // Maurerkolonne: stehende Mauern heilen, wenn sie WALL_REGEN_DELAY_S nicht getroffen wurden; das Tor nie (REQ-18.6)
    const wallRegen = mAdd('wallRegenPct') / 100;
    if (wallRegen > 0) S.sections.forEach((s, i) => {
      if ((i !== GATE || mAdd('regenGate') > 0) && s.hp > 0 && S.t - s.lastHit >= C.WALL_REGEN_DELAY_S) s.hp = Math.min(sectionMax(i), s.hp + sectionMax(i) * wallRegen * dt);
    });
    // Garnison (Teil 4): stehende Mauerabschnitte heilen x Lebenspunkte je Sekunde, ohne Wartezeit; das Tor nie (wie die Maurerkolonne)
    const wallFlat = mAdd('wallRegenFlat');
    if (wallFlat > 0) S.sections.forEach((s, i) => { if (i !== GATE && s.hp > 0) s.hp = Math.min(sectionMax(i), s.hp + wallFlat * dt); });
    // Handelskontor: Zinsen auf den Materialbestand, gedeckelt
    if (has('kontor')){
      S.kontorT += dt;
      if (S.kontorT >= C.KONTOR.intervalS){
        S.kontorT -= C.KONTOR.intervalS;
        const pay = kontorNext(), raw = kontorRaw();
        if (pay > 0){ addMaterial(pay); S.stats.interest = (S.stats.interest || 0) + pay; }
        if (S.pacing === 'karten' && raw > 0 && raw >= kontorCap()) S.stats.zinsDeckel = (S.stats.zinsDeckel || 0) + 1;       // Zinsdeckel erreicht (Angebotsbedingung Handelskontor, Teil 4)
      }
    }
    progressResearch(dt);
    progressVariants(dt);
    // Hörsaal: passiver EP-Ertrag (REQ-5.07, Zweig A); Kennzahl Anteil am EP-Ertrag (REQ-5.08)
    const xpPassive = mAdd('xpPassive') * dt;
    if (xpPassive > 0){ S.stats.xpPassive = (S.stats.xpPassive || 0) + xpPassive; gainXp(xpPassive, 'passive'); }
    if (S.t >= S.nextOwnWave) launchOwnWave();
    if (S.hold && S.t >= S.hold.maxS) releaseHold();     // Schonfrist läuft spätestens nach maxS aus (REQ-T.03)
    if (S.t >= S.nextWave && !S.hold) launchWave();
    automation();
    // Ankündigung SIEGE_WARNING_S vor der Belagerungswelle (REQ-19.3)
    if (!S.siegeDone && S.siegeAnnouncedAt === null && S.t >= S.siegeWaveT - C.SIEGE_WARNING_S - 1e-9){ S.siegeAnnouncedAt = S.t; log('log.siegeWarning'); }

    const eFrac = S.enemyBaseHp / diffCfg().enemyBaseHp;
    let alarmLevel = 0;
    C.ALARM_LEVELS.forEach((th, i) => { if (eFrac < th) alarmLevel = i + 1; });
    if (alarmLevel > S.alarms){
      S.alarms = alarmLevel;
      for (let i = 0; i < diffCfg().alarmSize; i++)
        S.enemyQueue.unshift({ type: i % C.ALARM_WERFER_EVERY === C.ALARM_WERFER_EVERY - 1 ? 'werfer' : 'laeufer',
                               lane: C.LANE_ORDER[i % LANES], at: S.t + Math.floor(i / LANES) * C.ALARM_SPACING_S, alarm: true });
      log('log.alarm');
    }
    spawnEnemies();
    updateArmies(dt);
    applyConditionals(dt);
    flushBaseXp();
    checkReveals();
    if (listeners.length || S.firstBounty){
      const present = S.enemyQueue.length > 0 || S.units.some(u => u.side === 'e' && u.hp > 0);
      if (foesPresent && !present){
        // Kriegsbeute: die erste besiegte Welle hebt die EP mindestens auf die Schwelle der nächsten Kartenwahl; liegt der Stand darüber, geschieht nichts
        if (S.firstBounty){
          S.firstBounty = false;
          const gap = xpNeed(1) - S.xpTotal;                 // Schwelle der ersten Kartenwahl
          if (gap > 0){ S.stats.xpBounty = gap; gainXp(gap, 'bounty'); emit('xpBounty', { n: gap }); }
        }
        emit('enemyWaveDefeated', { waveNo: S.waveNo });
      }
      foesPresent = present;
    }
    if (S.enemyBaseHp <= 0){ S.enemyBaseHp = 0; S.status = 'won';  log('log.won'); }
    else if (gateHp() <= 0){ S.sections[GATE].hp = 0; S.status = 'lost'; log('log.lost'); }
  }

  /* Neue Partie bzw. Spielstand übernehmen */
  /* Gestaffelte Einführung (REQ-47): welche Systeme schon sichtbar sind; ohne Einführung alle */
  function introShows(sys){
    if (!S.intro) return true;
    if (S.pacing === 'karten' && sys === 'buildings') return true;       // im Modus karten öffnen Karten die Gebäude, keine Stufe (REQ-KP.01)
    if (sys === 'waves') return S.waveNo >= 1 || S.ownWaveNo >= 1;
    if (sys === 'cards') return S.level >= 1;
    if (sys === 'buildings') return S.level >= C.INTRO_BUILDINGS_LEVEL;
    if (sys === 'siege') return siegeAnnounced();
    return true;
  }
  function newGame(diff, seed, opts = {}){
    S = freshState(diff, seed);
    S.pacing = opts.pacing || C.PACING_MODUS || 'standard';
    S.druck = opts.druck === 'hoch' ? 'hoch' : null;
    if (S.pacing === 'karten') S.enemyBaseHp = diffCfg().enemyBaseHp;
    S.intro = opts.intro === true;          // ohne Angabe (Tests, ältere Spielstände) volle Regeln ohne Einführung
    S.nextEnemy = rollEnemyWave();
    // Schonfrist (REQ-T.03): opts.hold = { maxS, size, bounty } – die erste Gegnerwelle besteht aus size Läufern und rückt erst nach releaseHold() oder nach maxS aus;
    // bounty: Kriegsbeute nach der ersten besiegten Welle (REQ-T2.04)
    if (opts.hold){
      S.hold = { maxS: opts.hold.maxS, size: opts.hold.size };
      S.firstBounty = opts.hold.bounty === true;
      S.nextEnemy = Array.from({ length: opts.hold.size }, () => ({ type: 'laeufer', lane: Math.floor(rnd() * LANES) }));
    }
    foesPresent = false;
    FX.shots = []; FX.fx = []; FX.lunge.clear(); targets = new Map();
    log('log.start', { diff: '@diff.' + diff + '.name' });
  }
  function adopt(saved){
    const base = freshState(saved.diff, saved.rng);
    S = Object.assign(base, saved, { units: [], forms: [], enemyQueue: [] });
    modCache = { ver: -1, key: null, mul: {}, add: {} };
    S.lvl = Object.assign(freshState(saved.diff, 1).lvl, saved.lvl || {});
    if (!Array.isArray(S.slots) || S.slots.length !== SLOTS) S.slots = new Array(SLOTS).fill(null);
    S.sections = S.sections.map(s => ({ hp: s.hp, lastHit: -1e9, repairCd: 0 }));
    if (!Array.isArray(S.queue)) S.queue = [];
    S.research = Object.assign(freshState(saved.diff, 1).research, saved.research || {});
    const shift = Math.max(0, S.t + C.RELOAD_WAVE_DELAY_S - S.nextWave);
    S.nextWave += shift;
    S.nextOwnWave = Math.max(S.nextOwnWave || 0, S.t + C.RELOAD_WAVE_DELAY_S);
    if (!S.siegeDone) S.siegeWaveT += shift;       // Belagerungswelle bleibt eine reguläre Welle im Takt
    if (!Array.isArray(S.nextEnemy) || !S.nextEnemy.length) S.nextEnemy = rollEnemyWave();
  }
  /* Schonfrist beenden. Die Gegnerwelle rückt sofort aus, falls sie fällig ist; der Takt bleibt dabei erhalten (wie beim Laden).
     normalFirstWave = true (Überspringen): die erste Welle hat wieder die Größe des Schwierigkeitsgrades, die Kriegsbeute entfällt. */
  function releaseHold(normalFirstWave = false){
    if (normalFirstWave) S.firstBounty = false;
    if (!S.hold) return false;
    S.hold = null;
    const shift = Math.max(0, S.t - S.nextWave);
    S.nextWave += shift;
    if (!S.siegeDone) S.siegeWaveT += shift;
    if (normalFirstWave && S.waveNo === 0) S.nextEnemy = rollEnemyWave();
    return true;
  }
  const snapshot = () => JSON.parse(JSON.stringify(S));

  return {
    get S(){ return S; }, set S(v){ S = v; }, FX,
    newGame, adopt, snapshot, tick, on, releaseHold, holdActive: () => !!S.hold,
    doClick, buy, build, buildAt, demolish, unlockBuilding, repair, repairCost, spawn, makeUnit,
    addFormation, addGroup, layoutAll, formMembers, mainOf, supplyCap, supplyFull, waveIn, enemyWaveIn, ownOnField, armyState, ownWaveInterval, categoryCount, synergyValue, xpNeed, strongerLane, assignLanes, laneStrength, siegeIn, siegeAnnounced, enemyHpMult, enemyDmgMult,
    enemyWaveSize, tiersOf, drawOptionsKarten, drawOptions, variantsFor, cardRemoved, DOK, DOKTRINEN, activeDoctrines, doktrinCount, doctrineLimit, doctrineExcess, variantExcess, doktrinDue, bastionSlots, bastionDmg, bastionCd, bastionRange, bastionLane, standingVariants, variantsOf, variantCost, variantVisible, variantBlock, upgradeBuilding, VAR, VARIANTS, canBuy, isAvailable, isMaxed, noEffect, supplyCapped, upCost, unitCost, unitPrice, unitIsMerc, lagerDeckel, buildCost, factoryCost, factoryCount, factoryRate, builtCount, has, countType, lv,
    kaserneLevel, levelStrength, qualityMult,
    buildBlock, isBuildable, introShows, refundFor, kontorCap, kontorNext, waveRushCost, waveRushBlock, rushWave,
    cardExcluded, sourceReachable, canBan, isPathFamily, keyNameKey, unitSource: type => PACING_DERIVED && S.pacing === 'karten' ? PACING_DERIVED.quellen['einheit:' + type] || null : null, keySource: key => PACING_DERIVED && S.pacing === 'karten' ? PACING_DERIVED.quellen[key] || null : null, isOpen, unlockKey, pacingKeys: () => PACING_DERIVED, ALL_OPTIONS, stageSource, sourceMet, ownType, unitStats, replaceUnit, pacing: () => S.pacing,
    offerDraft, chooseDraft, rerollDraft, rerollsLeft, banOption, bansLeft, RES, RESEARCH, researchTier, researchSlots, researchNext, researchCost, researchBlock, startResearch, rushCost, rushResearch, unitUnlocked,
    phase, xpProgress, gainXp, draftSize, colOffset, lateralOf, neighborCount, neighborValue, neighborPreview, neighborGain, NEIGHBORS, adjacent, mMul, mAdd, spawnX, unitRange, OPT, cardTaken, cardTier, cardWeight, optionAvailable,
    clickPower, matRate, incomeRate, upkeepRate, xpMult, setBudget, budgetStufe, budgetShare, budgetKurs, autoPressCps, hpMultP, dmgMultP, cdMultP, bountyMult, diffCfg,
    sectionMax, sectionUp, gateHp, towerBuilt, towerActive, 
    turretDmg, turretRange, turretCd,
  };
}

return { create, freshState, nextRandom, xpForLevel, xpStep, distribute, SLOTS, SAVE_VERSION };
})();

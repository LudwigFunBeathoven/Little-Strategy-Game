/* Klammerfront – Spiellogik.
   Kein Zugriff auf Seite, Fenster oder Speicher: dieselbe Datei läuft im Browser und im Simulator.
   Lädt nach config.js. Texte erscheinen hier nur als Schlüssel für die Sprachdateien. */
const KlammerCore = (() => {
'use strict';
const C = KF_CONFIG;
const W = C.LANE, PBW = C.PLAYER_BASE_WIDTH, EBW = C.ENEMY_BASE_WIDTH;
const LANES = C.LANE_COUNT, GATE = C.GATE_LANE, SLOTS = C.GRID_SIZE * C.GRID_SIZE;
const OPTIONS = (typeof KF_DRAFT_OPTIONS !== 'undefined') ? KF_DRAFT_OPTIONS : [];
const OPT = Object.fromEntries(OPTIONS.map(o => [o.id, o]));
/* Stufenschwellen: kumuliertes Altmetall für Stufe n */
const xpStep = n => C.XP_BASE * Math.pow(C.XP_GROWTH, n - 1);
function xpThreshold(n){ let s = 0; for (let k = 1; k <= n; k++) s += xpStep(k); return s; }
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
    v: 4, diff: diff || C.DEFAULT_DIFFICULTY, status: diff ? 'running' : 'setup', t: 0,
    rng: (seed >>> 0) || 1,
    material: 0, materialTotal: 0, scrap: 0, scrapTotal: 0,
    lvl, slots: new Array(SLOTS).fill(null), unlocked: {}, revealed: {}, kontorT: 0,
    sections: C.SECTION_HP.map(hp => ({ hp, lastHit: -Infinity })), enemyBaseHp: d.enemyBaseHp,
    nextWave: C.WAVE_INTERVAL_S, waveNo: 0, hold: false, nextEnemy: [], enemyQueue: [], queue: [], units: [], nextId: 1,
    turretCd: {}, enemyTurretCd: 0,
    clicks: 0, kills: 0, losses: 0, firstWaveSeen: false, alarms: 0,
    level: 0, pendingLevels: 0, pendingDraft: null, draft: { stacks: {}, ver: 0 }, emergencyUsed: 0,
    clickTimes: [],
    stats: { prod: { early: { click: 0, auto: 0, time: 0 }, mid: { click: 0, auto: 0, time: 0 }, late: { click: 0, auto: 0, time: 0 } } },
    log: [], savedAt: 0,
  };
}

function create(){
  let S = freshState(null, 1);
  const FX = { on: true, shots: [], fx: [], baseFlash: { p: [0, 0, 0], e: 0 } };

  const rnd = () => { const [v, s] = nextRandom(S.rng); S.rng = s; return v; };
  function log(key, params){
    S.log.unshift({ t: S.t, key, params: params || {} });
    if (S.log.length > C.LOG_LINES) S.log.length = C.LOG_LINES;
  }

  /* ---------- Draft-Modifikatoren (zwischengespeichert, bis sich die Wahl ändert) ---------- */
  let modCache = { ver: -1, key: null, mul: {}, add: {} };
  function mods(){
    const key = S.draft;
    if (modCache.key === key && modCache.ver === S.draft.ver) return modCache;
    const mul = {}, add = {};
    for (const [id, n] of Object.entries(S.draft.stacks)){
      const o = OPT[id]; if (!o || !n) continue;
      for (const e of [...(o.effect || []), ...(o.drawback || [])]){
        if (!e.stat) continue;
        if (e.mul !== undefined) mul[e.stat] = (mul[e.stat] ?? 1) * Math.pow(e.mul, n);
        if (e.add !== undefined) add[e.stat] = (add[e.stat] ?? 0) + e.add * n;
      }
    }
    modCache = { ver: S.draft.ver, key, mul, add };
    return modCache;
  }
  const mMul = stat => mods().mul[stat] ?? 1;
  const mAdd = stat => mods().add[stat] ?? 0;

  /* ---------- abgeleitete Werte ---------- */
  const has = b => S.slots.some(s => s && s.type === b);
  const countType = type => S.slots.filter(s => s && s.type === type).length;
  // Wirksame Stufe: Upgrades eines abgerissenen Gebäudes bleiben gespeichert, wirken aber nicht (REQ-01.8)
  const lv = id => (C.BUILDINGS.includes(C.UPGRADES[id].group) && !has(C.UPGRADES[id].group)) ? 0 : S.lvl[id];
  const diffCfg      = () => C.DIFFICULTY[S.diff];
  // Klickwert wächst nur über die gedeckelte Presse (REQ-03.3); Material kommt sonst aus Fabriken (REQ-16.2)
  const clickPower   = () => (1 + C.FX_PRESSE * lv('presse')) * mMul('clickYield');
  const factoryCount = () => countType('fabrik');
  const factoryRate  = () => C.FACTORY_BASE_RATE * mMul('factoryYield') * mMul('autoProd');
  const matRate      = () => factoryCount() * factoryRate();
  // Grundstärke steigt je Altmetall-Stufe (REQ-17.2), die Schmiede multipliziert darauf (REQ-17.3)
  const levelStrength = () => 1 + C.UNIT_STRENGTH_PER_LEVEL * S.level;
  const qualityMult  = () => Math.pow(1 + C.FX_QUALITAET, lv('qualitaet'));
  const hpMultP      = () => levelStrength() * qualityMult();
  const dmgMultP     = () => levelStrength() * qualityMult();
  const cdMultP      = () => 1;
  const bountyMult   = () => mMul('scrapGain');
  /* Abschnitte der Basis (REQ-13): 0 = Mauer oben, 1 = Tor, 2 = Mauer unten */
  const sectionMax   = i => (C.SECTION_HP[i] + C.FX_MAUER_HP * lv('mauer')) * mMul('wallHp');
  const sectionUp    = i => S.sections[i].hp > 0;
  const gateHp       = () => S.sections[GATE].hp;
  const offlineHours = () => C.OFFLINE_HOURS + mAdd('offlineHours');
  const towerId      = (base, lane) => `${base}_${lane}`;
  const towerBuilt   = lane => lv(towerId('turm', lane)) > 0;
  const towerActive  = lane => towerBuilt(lane) && sectionUp(lane);
  const turretDmg    = lane => C.PLAYER_TURRET.dmgPerLevel * lv(towerId('turm', lane));
  const turretRange  = lane => C.PLAYER_TURRET.range + C.PLAYER_TURRET.rangePerLevel * lv(towerId('reichweite', lane));
  const turretCd     = lane => C.PLAYER_TURRET.cd * Math.pow(C.PLAYER_TURRET.cdFactor, lv(towerId('kadenz', lane)));
  const escalation   = () => Math.pow(1 + C.ESCALATION_RATE, Math.max(0, S.t / 60 - C.ESCALATION_START_MIN));
  const enemyHpMult  = () => (1 + diffCfg().hpGrowth * S.t / 60) * mMul('enemyHp') * escalation();
  const enemyDmgMult = () => (1 + diffCfg().dmgGrowth * S.t / 60) * escalation();
  const unitCost     = type => Math.max(1, Math.round(C.UNITS[type].cost * mMul('unitCost')));
  const spawnX       = () => PBW + mAdd('spawnOffset');
  const unitRange    = (side, type) => C.UNITS[type].range + (side === 'p' && type === 'werfer' ? mAdd('werferRange') : 0);
  const rangedRows   = side => C.RANGED_RANGE_ROWS + (side === 'p' ? mAdd('rangedRows') : 0);
  const phase        = () => S.level < C.PHASE_MID_LEVEL ? 'early' : S.level < C.PHASE_LATE_LEVEL ? 'mid' : 'late';
  const xpProgress   = () => ({ level: S.level, cur: S.scrapTotal - xpThreshold(S.level), need: xpStep(S.level + 1) });
  // Kaserne: Gebäude = Ausbaustufe 1, „Ausbau“ bis Stufe 3; jede Stufe +KASERNE_SUPPLY_PER_LEVEL (REQ-17.1)
  const kaserneLevel = () => has('kaserne') ? 1 + lv('ausbau') : 0;
  const supplyCap    = () => C.SUPPLY_CAP_START + C.KASERNE_SUPPLY_PER_LEVEL * kaserneLevel() + mAdd('supply');
  // „Halten“ verbilligt Turm, Mauer und Reparatur (REQ-15.3)
  const holdFactor   = () => S.hold ? 1 - C.HOLD_DISCOUNT : 1;
  const holdDiscounted = id => { const g = C.UPGRADES[id].group; return g === 'mauer' || C.UPGRADES[id].tower !== undefined; };
  const interestRate = () => C.KONTOR.rate + C.FX_ZINSESZINS * lv('zinseszins');

  function upCost(id){
    const u = C.UPGRADES[id];
    let c = u.baseCost * Math.pow(u.growth, S.lvl[id]);
    if (holdDiscounted(id)) c *= holdFactor();
    return Math.ceil(c);
  }
  const isMaxed = id => C.UPGRADES[id].max !== undefined && S.lvl[id] >= C.UPGRADES[id].max;
  function isAvailable(id){
    const u = C.UPGRADES[id];
    if (C.BUILDINGS.includes(u.group) && !has(u.group)) return false;
    if (u.needs && S.lvl[u.needs] <= 0) return false;
    return true;
  }
  const canBuy = id => S.status === 'running' && isAvailable(id) && !isMaxed(id) && S[C.UPGRADES[id].cur] >= upCost(id);
  const builtCount = () => S.slots.filter(Boolean).length;
  /* Die n-te Fabrik kostet FACTORY_BASE_COST × FACTORY_COST_GROWTH^(n−1); nach einem Abriss sinkt der Preis wieder (REQ-16.2/16.5) */
  const factoryCost = () => Math.ceil(C.FACTORY_BASE_COST * Math.pow(C.FACTORY_COST_GROWTH, factoryCount()) * mMul('factoryCost'));
  const buildCost = type => type === 'fabrik' ? factoryCost() : C.BUILDING_COST[type];
  const isBuildable = type => C.START_BUILDINGS.includes(type) || !!S.unlocked[type];
  const refundFor = i => S.slots[i] ? Math.floor(S.slots[i].paid * C.REFUND_RATE) : 0;
  /* Warum ein Gebäude nicht baubar ist (null = baubar) */
  function buildBlock(i, type){
    if (S.status !== 'running') return 'notRunning';
    if (!C.BUILDINGS.includes(type)) return 'unknown';
    if (!isBuildable(type)) return 'locked';
    if (type !== 'fabrik' && countType(type) >= C.MAX_PER_TYPE) return 'standing';
    if (i < 0 || i >= SLOTS || S.slots[i]) return 'occupied';
    if (S.material < buildCost(type)) return 'material';
    return null;
  }

  function addMaterial(n, source){
    S.material += n; S.materialTotal += n;
    const p = S.stats.prod[phase()];
    if (source === 'click') p.click += n; else p.auto += n;
  }

  /* ---------- Aktionen ---------- */
  /* Höchstens MAX_CLICKS_PER_SECOND Klicks je Sekunde Spielzeit zählen (REQ-03.4) */
  function doClick(){
    if (S.status !== 'running' || S.pendingDraft) return false;
    const ct = S.clickTimes;
    while (ct.length && ct[0] <= S.t - 1) ct.shift();
    if (ct.length >= C.MAX_CLICKS_PER_SECOND) return false;
    ct.push(S.t);
    addMaterial(clickPower(), 'click');
    S.clicks++;
    return true;
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
    S.slots[i] = { type, paid: cost };
    log('log.built', { building: '@bld.' + type + '.name', slot: i + 1 });
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
    S.slots[i] = null;
    clampSections();
    log('log.demolished', { building: '@bld.' + type + '.name', slot: i + 1, amount: refund });
    return true;
  }
  function unlockBuilding(type){ S.unlocked[type] = true; }
  const repairCost = () => Math.ceil(C.REPAIR_COST * holdFactor());
  /* Reparatur je Abschnitt (REQ-13.6). Ein gefallener Abschnitt steht danach wieder, sein Turm feuert wieder. */
  function repair(i){
    if (i === undefined) i = GATE;
    const s = S.sections[i];
    if (S.status !== 'running' || !s || S.material < repairCost() || s.hp >= sectionMax(i)) return false;
    S.material -= repairCost();
    s.hp = Math.min(sectionMax(i), s.hp + C.REPAIR_AMOUNT);
    return true;
  }
  function makeUnit(side, type, lane, x){
    const spec = C.UNITS[type], p = side === 'p';
    const hp = spec.hp * (p ? hpMultP() * mMul('unitHp') * (type === 'werfer' ? mMul('werferHp') : 1) : enemyHpMult());
    return {
      id: S.nextId++, side, type, lane, x: x ?? (p ? spawnX() : W - EBW), range: unitRange(side, type), ranged: isRangedType(type),
      hp, maxHp: hp, dmg: spec.dmg * (p ? dmgMultP() : enemyDmgMult()),
      cdMax: spec.cd * (p ? cdMultP() : 1), cd: 0, flash: 0, moving: false, bob: rnd() * 6, rank: 0,
    };
  }
  const spawnBlocked = lane => S.units.some(u => u.side === 'e' && u.lane === lane && Math.abs(u.x - (W - EBW)) < C.SPAWN_BLOCK_DIST);
  const gateHeld = lane => S.units.some(u => u.side === 'p' && u.lane === lane && u.hp > 0 && u.x >= W - EBW - C.GATE_HOLD_DIST);

  /* Kauf legt die Einheit in die Warteschlange; sie rückt mit der nächsten Welle aus (REQ-14.1/14.2) */
  const supplyFull = () => S.queue.length >= supplyCap();
  function spawn(type){
    const cost = unitCost(type);
    if (S.status !== 'running' || supplyFull() || S.material < cost) return false;
    S.material -= cost;
    S.queue.push({ type });
    return true;
  }
  /* Wellenbefehl für die nächste Welle: Ausrücken (false) oder Halten (true) (REQ-15.1) */
  function setHold(on){
    if (S.status !== 'running') return false;
    S.hold = !!on;
    return true;
  }

  /* ---------- Wellen ---------- */
  /* Nächste Gegnerwelle: Zusammensetzung und Lanes entstehen zu Beginn des Countdowns über den Spielzufall (REQ-14.3) */
  function rollEnemyWave(){
    const d = diffCfg(), min = S.nextWave / 60;
    const size = Math.max(1, Math.round(d.waveBase + d.waveGrowth * min));
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
    const melee = types.filter(t => !isRangedType(t)), ranged = types.filter(isRangedType);
    const lm = distribute(melee.length, strong), lr = distribute(ranged.length, strong);
    return [...melee.map((type, i) => ({ type, lane: lm[i] })), ...ranged.map((type, i) => ({ type, lane: lr[i] }))];
  }
  /* Aufstellung in Formation: je Lane Nahkämpfer vorn, Fernkämpfer dahinter (REQ-12.3) */
  function formation(group){
    const byLane = {};
    for (const g of group) (byLane[g.lane] ||= []).push(g);
    const out = [];
    for (const lane in byLane){
      const g = byLane[lane].sort((a, b) => isRangedType(a.type) - isRangedType(b.type));
      g.forEach((q, k) => out.push(Object.assign({}, q, { lane: Number(lane), k })));
    }
    return out;
  }
  function launchWave(){
    const enemy = S.nextEnemy;
    // Eigene Welle: bei „Halten“ bleibt die Warteschlange stehen; der Befehl springt danach zurück (REQ-15.1/15.2)
    if (S.hold){ S.hold = false; if (S.queue.length) log('log.held', { n: S.queue.length }); }
    else if (S.queue.length){
      for (const q of formation(assignLanes(S.queue.map(q => q.type), strongerLane(enemy))))
        S.units.push(makeUnit('p', q.type, q.lane, deployX(q.lane) - q.k * C.ALLY_GAP));
      S.queue = [];
    }
    // Gegnerwelle: rückt geschlossen aus; was wegen Feldgrenze oder Belagerung nicht passt, folgt später
    let field = S.units.filter(u => u.side === 'e').length;
    for (const q of formation(enemy)){
      if (field < diffCfg().maxField && !gateHeld(q.lane)){ S.units.push(makeUnit('e', q.type, q.lane, W - EBW + q.k * C.ALLY_GAP)); field++; }
      else S.enemyQueue.push({ type: q.type, lane: q.lane, at: S.t });
    }
    if (!S.firstWaveSeen){ S.firstWaveSeen = true; log('log.firstWave'); }
    S.waveNo++;
    S.nextWave += C.WAVE_INTERVAL_S;
    S.nextEnemy = rollEnemyWave();
  }
  const waveIn = () => Math.max(0, S.nextWave - S.t);
  /* Aufstellpunkt einer Lane: am Tor, mit Vorposten weiter vorn, aber nie hinter der vordersten gegnerischen Einheit */
  function deployX(lane){
    let x = spawnX();
    for (const u of S.units) if (u.side === 'e' && u.lane === lane && u.hp > 0) x = Math.min(x, u.x - C.ALLY_GAP);
    return Math.max(PBW, x);
  }
  function nearestInLane(side, lane, x, range){
    let best = null, bd = Infinity;
    for (const u of S.units){
      if (u.hp <= 0 || u.side !== side || u.lane !== lane) continue;
      const dd = Math.abs(u.x - x);
      if (dd <= range && dd < bd){ bd = dd; best = u; }
    }
    return best;
  }
  const shot = s => { if (FX.on) FX.shots.push(s); };

  function updateTurrets(dt){
    // Gegnerischer Turm: nächste eigene Einheit in Reichweite, gleich in welcher Lane
    S.enemyTurretCd -= dt;
    if (S.enemyTurretCd <= 0){
      let tgt = null, bd = Infinity;
      for (const u of S.units){
        if (u.side !== 'p' || u.hp <= 0) continue;
        const dd = W - EBW - u.x;
        if (dd <= C.ENEMY_TURRET.range && dd < bd){ bd = dd; tgt = u; }
      }
      if (tgt){
        tgt.hp -= diffCfg().turretDmg * enemyDmgMult(); tgt.flash = 0.12;
        shot({ x0: W - EBW / 2, lane0: GATE, x1: tgt.x, lane: tgt.lane, t: 0, dur: 0.18, turret: true });
        S.enemyTurretCd = C.ENEMY_TURRET.cd;
      }
    }
    // Eigene Türme: nur Gegner der eigenen Lane, inaktiv solange der Abschnitt gefallen ist (REQ-13.2)
    for (const lane of C.TOWER_LANES){
      if (!towerActive(lane)) continue;
      S.turretCd[lane] = (S.turretCd[lane] || 0) - dt;
      if (S.turretCd[lane] > 0) continue;
      const tgt = nearestInLane('e', lane, PBW, turretRange(lane));
      if (tgt){
        tgt.hp -= turretDmg(lane) * (tgt.type === 'werfer' ? mMul('turretVsRanged') : 1); tgt.flash = 0.12;
        shot({ x0: PBW - 9, lane0: lane, x1: tgt.x, lane, t: 0, dur: 0.18, turret: true });
        S.turretCd[lane] = turretCd(lane);
      }
    }
  }

  /* Rang in der Lane-Kolonne: Zahl der eigenen Einheiten, die zwischen der Einheit und ihrem Ziel stehen (0 = vorn).
     Einheiten, die schon an der gegnerischen Kolonne vorbei sind, zählen nicht mit. */
  function computeRanks(){
    for (const u of S.units){
      if (u.hp <= 0) continue;
      const dir = u.side === 'p' ? 1 : -1;
      let reach = ((u.side === 'p' ? W - EBW : PBW) - u.x) * dir, rank = 0;
      for (const o of S.units) if (o.hp > 0 && o.lane === u.lane && o.side !== u.side){ const dd = (o.x - u.x) * dir; if (dd > -C.TARGET_BEHIND_TOLERANCE && dd < reach) reach = dd; }
      for (const o of S.units) if (o !== u && o.hp > 0 && o.lane === u.lane && o.side === u.side){ const dd = (o.x - u.x) * dir; if (dd > 0 && dd <= reach) rank++; }
      u.rank = rank;
    }
  }
  /* In der Kolonne kämpft vorn nur die vorderste Einheit; Fernkämpfer auch mit bis zu RANGED_RANGE_ROWS Einheiten vor sich (REQ-12.4) */
  const canAttack = u => u.ranged ? u.rank <= rangedRows(u.side) : u.rank === 0;

  /* Schaden an einem Abschnitt der eigenen Basis. Ist eine Mauer gefallen, trifft es das Tor (REQ-13.3). */
  function hitSection(lane, dmg){
    const i = sectionUp(lane) ? lane : GATE;
    const s = S.sections[i];
    s.hp -= dmg; s.lastHit = S.t;
    FX.baseFlash.p[i] = 0.12;
    if (s.hp <= 0 && i !== GATE){ s.hp = 0; log('log.wallDown', { lane: '@lane.' + i }); }
    return i;
  }

  function updateUnits(dt){
    const us = S.units;
    computeRanks();
    for (const u of us){
      if (u.hp <= 0) continue;
      const spec = C.UNITS[u.type], dir = u.side === 'p' ? 1 : -1;
      u.cd -= dt;
      u.flash = Math.max(0, u.flash - dt);
      u.moving = false;
      let target = null, dist = Infinity, allyGap = Infinity;
      for (const o of us){
        if (o === u || o.hp <= 0 || o.lane !== u.lane) continue;
        const dd = (o.x - u.x) * dir;
        if (o.side !== u.side){ if (dd > -C.TARGET_BEHIND_TOLERANCE && dd < dist){ dist = dd; target = o; } }
        // Nahkämpfer gehen durch eigene Fernkämpfer hindurch nach vorn (Formation, REQ-12.3)
        else if (dd > 0 && dd < allyGap && !(!u.ranged && o.ranged)) allyGap = dd;
      }
      const baseDist = ((u.side === 'p' ? W - EBW : PBW) - u.x) * dir;
      const range = u.range ?? spec.range;
      if (target && dist <= range){
        if (canAttack(u) && u.cd <= 0){
          u.cd = u.cdMax;
          target.hp -= u.dmg * (u.side === 'p' ? mMul('dmgVsUnits') : 1); target.flash = 0.12;
          if (u.ranged) shot({ x0: u.x, x1: target.x, lane: u.lane, t: 0, dur: 0.3 });
        }
      } else if (baseDist <= range){
        if (canAttack(u) && u.cd <= 0){
          u.cd = u.cdMax;
          if (u.side === 'p'){ S.enemyBaseHp -= u.dmg * mMul('dmgVsBase'); FX.baseFlash.e = 0.12; }
          else {
            hitSection(u.lane, u.dmg);
            if (!u.ranged && lv('stacheln') > 0){ u.hp -= C.FX_STACHELN_DMG * lv('stacheln'); u.flash = 0.12; }
          }
          if (u.ranged) shot({ x0: u.x, x1: u.side === 'p' ? W - EBW + 8 : PBW - 8, lane: u.lane, t: 0, dur: 0.3 });
        }
      } else if (allyGap > C.ALLY_GAP){
        let step = spec.speed * dt;
        if (target) step = Math.min(step, Math.max(0, dist - C.MELEE_STOP_DIST));
        u.x += dir * step;
        u.moving = step > 0;
      }
    }
    for (const u of us){
      if (u.hp > 0 || u.dead) continue;
      u.dead = true;
      if (u.side === 'e'){
        gainScrap(C.UNITS[u.type].bounty * bountyMult() * diffCfg().xpMult);
        S.kills++;
      } else S.losses++;
      if (FX.on) FX.fx.push({ x: u.x, lane: u.lane, t: 0, side: u.side });
    }
    S.units = us.filter(u => !u.dead);
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
  /* ---------- Altmetall-Stufen und Draft (REQ-02) ---------- */
  function gainScrap(b){
    S.scrap += b; S.scrapTotal += b;
    while (S.scrapTotal >= xpThreshold(S.level + 1)){
      S.level++; S.pendingLevels++;
      log('log.levelUp', { n: S.level });
    }
    if (!S.pendingDraft && S.pendingLevels > 0) offerDraft();
  }
  function optionAvailable(o){
    const n = S.draft.stacks[o.id] || 0;
    if (o.unique && n > 0) return false;
    if (o.maxStacks !== undefined && n >= o.maxStacks) return false;
    if (o.requires){
      if (o.requires.upgrade && !Object.keys(C.UPGRADES).some(id => (C.UPGRADES[id].base || id) === o.requires.upgrade && S.lvl[id] > 0)) return false;
      if (o.requires.building && !has(o.requires.building)) return false;
    }
    for (const e of o.effect || []) if (e.unlock && (S.unlocked[e.unlock] || C.START_BUILDINGS.includes(e.unlock))) return false;
    return true;
  }
  const draftSize = () => has('universitaet') ? C.DRAFT_OPTIONS_UNIVERSITY : C.DRAFT_OPTIONS_BASE;
  /* Gewichtete Ziehung ohne Zurücklegen, über den seedbaren Spielzufall */
  function drawOptions(k){
    const pool = OPTIONS.filter(optionAvailable), out = [];
    while (out.length < k && pool.length){
      const total = pool.reduce((a, o) => a + o.weight, 0);
      let r = rnd() * total, i = 0;
      while (i < pool.length - 1 && r >= pool[i].weight){ r -= pool[i].weight; i++; }
      out.push(pool[i].id);
      pool.splice(i, 1);
    }
    return out;
  }
  function offerDraft(){
    const options = drawOptions(draftSize());
    if (!options.length){ S.pendingLevels = 0; return; }
    S.pendingDraft = { level: S.level - S.pendingLevels + 1, options };
  }
  function chooseDraft(i){
    const d = S.pendingDraft;
    if (!d || i < 0 || i >= d.options.length) return false;
    const o = OPT[d.options[i]];
    S.draft.stacks[o.id] = (S.draft.stacks[o.id] || 0) + 1;
    S.draft.ver++;
    for (const e of o.effect || []){
      if (e.unlock){ unlockBuilding(e.unlock); log('log.unlocked', { building: '@bld.' + e.unlock + '.name' }); }
      if (e.grant === 'production') addMaterial(Math.max(matRate(), C.GRANT_MIN_RATE) * e.seconds);
    }
    clampSections();
    log('log.draft', { name: '@' + o.nameKey });
    S.pendingDraft = null;
    S.pendingLevels--;
    if (S.pendingLevels > 0) offerDraft();
    return true;
  }
  /* Bedingte Wirkungen */
  function applyConditionals(dt){
    const siege = mAdd('siegeDps');
    if (siege > 0 && S.units.some(u => u.side === 'p' && u.x >= W * C.SIEGE_LANE_FRACTION)) S.enemyBaseHp -= siege * dt;
    const charges = mAdd('emergencyRepair') - S.emergencyUsed;
    if (charges > 0){
      const th = (OPT.notreserve && OPT.notreserve.condition.value) || 0;
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
      if (!q.alarm && (gateHeld(q.lane) || field >= diffCfg().maxField)) continue;
      S.units.push(makeUnit('e', q.type, q.lane));
      S.enemyQueue.splice(i, 1); i--; field++;
    }
  }

  function tick(dt){
    if (S.status !== 'running' || S.pendingDraft) return;   // Draft pausiert das Spiel
    S.t += dt;
    S.stats.prod[phase()].time += dt;
    addMaterial(matRate() * dt);
    if (lv('moertel') > 0) S.sections.forEach((s, i) => { if (s.hp > 0) s.hp = Math.min(sectionMax(i), s.hp + C.FX_MOERTEL_REGEN * lv('moertel') * dt); });
    // Handelskontor: Zinsen auf den Materialbestand, gedeckelt
    if (has('kontor')){
      S.kontorT += dt;
      if (S.kontorT >= C.KONTOR.intervalS){
        S.kontorT -= C.KONTOR.intervalS;
        const cap = Math.max(C.KONTOR.capMin, matRate() * C.KONTOR.capSeconds);
        addMaterial(Math.min(cap, S.material * interestRate()));
      }
    }
    if (S.t >= S.nextWave) launchWave();
    if (!S.escalated && S.t / 60 >= C.ESCALATION_START_MIN){ S.escalated = true; log('log.escalation'); }

    const eFrac = S.enemyBaseHp / diffCfg().enemyBaseHp;
    let alarmLevel = 0;
    C.ALARM_THRESHOLDS.forEach((th, i) => { if (eFrac < th) alarmLevel = i + 1; });
    if (alarmLevel > S.alarms){
      S.alarms = alarmLevel;
      for (let i = 0; i < diffCfg().alarmSize; i++)
        S.enemyQueue.unshift({ type: i % C.ALARM_WERFER_EVERY === C.ALARM_WERFER_EVERY - 1 ? 'werfer' : 'laeufer',
                               lane: C.LANE_ORDER[i % LANES], at: S.t + Math.floor(i / LANES) * C.ALARM_SPACING_S, alarm: true });
      log('log.alarm');
    }
    spawnEnemies();
    updateTurrets(dt);
    updateUnits(dt);
    applyConditionals(dt);
    checkReveals();
    if (S.enemyBaseHp <= 0){ S.enemyBaseHp = 0; S.status = 'won';  log('log.won'); }
    else if (gateHp() <= 0){ S.sections[GATE].hp = 0; S.status = 'lost'; log('log.lost'); }
  }

  /* Neue Partie bzw. Spielstand übernehmen */
  function newGame(diff, seed){
    S = freshState(diff, seed);
    S.nextEnemy = rollEnemyWave();
    FX.shots = []; FX.fx = [];
    log('log.start', { diff: '@diff.' + diff + '.name' });
  }
  function adopt(saved){
    const base = freshState(saved.diff, saved.rng);
    S = Object.assign(base, saved, { units: [], enemyQueue: [] });
    modCache = { ver: -1, key: null, mul: {}, add: {} };
    S.lvl = Object.assign(freshState(saved.diff, 1).lvl, saved.lvl || {});
    if (!Array.isArray(S.slots) || S.slots.length !== SLOTS) S.slots = new Array(SLOTS).fill(null);
    S.sections = S.sections.map(s => ({ hp: s.hp, lastHit: -Infinity }));
    if (!Array.isArray(S.queue)) S.queue = [];
    S.nextWave = Math.max(S.nextWave, S.t + C.RELOAD_WAVE_DELAY_S);
    if (!Array.isArray(S.nextEnemy) || !S.nextEnemy.length) S.nextEnemy = rollEnemyWave();
  }
  /* Abwesenheit: nur Material wird nachgerechnet, die Front steht still */
  function applyAway(seconds){
    if (S.status !== 'running') return 0;
    const sec = Math.min(seconds, offlineHours() * 3600);
    if (sec < C.OFFLINE_MIN_S) return 0;
    const gain = matRate() * sec;
    if (gain >= 1){ addMaterial(gain); log('log.away', { seconds: sec, amount: gain }); }
    return gain;
  }
  const snapshot = () => JSON.parse(JSON.stringify(S));

  return {
    get S(){ return S; }, set S(v){ S = v; }, FX,
    newGame, adopt, snapshot, tick, applyAway,
    doClick, buy, build, buildAt, demolish, unlockBuilding, repair, repairCost, spawn, makeUnit, setHold,
    supplyCap, supplyFull, waveIn, strongerLane, assignLanes, laneStrength,
    canBuy, isAvailable, isMaxed, upCost, unitCost, buildCost, factoryCost, factoryCount, factoryRate, builtCount, has, countType, lv,
    kaserneLevel, levelStrength, qualityMult,
    buildBlock, isBuildable, refundFor, interestRate,
    chooseDraft, phase, xpProgress, draftSize, mMul, mAdd, spawnX, unitRange, rangedRows, OPT,
    clickPower, matRate, hpMultP, dmgMultP, cdMultP, bountyMult, diffCfg,
    sectionMax, sectionUp, gateHp, towerBuilt, towerActive, computeRanks, canAttack,
    offlineHours, turretDmg, turretRange, turretCd,
  };
}

return { create, freshState, nextRandom, xpThreshold, xpStep, distribute, SLOTS };
})();

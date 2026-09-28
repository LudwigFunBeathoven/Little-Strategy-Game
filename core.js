/* Klammerfront – Spiellogik.
   Kein Zugriff auf Seite, Fenster oder Speicher: dieselbe Datei läuft im Browser und im Simulator.
   Lädt nach config.js. Texte erscheinen hier nur als Schlüssel für die Sprachdateien. */
const KlammerCore = (() => {
'use strict';
const C = KF_CONFIG;
const W = C.LANE, PBW = C.PLAYER_BASE_WIDTH, EBW = C.ENEMY_BASE_WIDTH;

/* Seedbarer Zufallsgenerator (mulberry32). Der Zustand liegt im Spielstand, damit Kopien identisch weiterlaufen. */
function nextRandom(state){
  const s = (state + 0x6D2B79F5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

function freshState(diff, seed){
  const lvl = {};
  for (const id in C.UPGRADES) lvl[id] = 0;
  const d = C.DIFFICULTY[diff || C.DEFAULT_DIFFICULTY];
  return {
    v: 3, diff: diff || C.DEFAULT_DIFFICULTY, status: diff ? 'running' : 'setup', t: 0,
    rng: (seed >>> 0) || 1,
    material: 0, materialTotal: 0, scrap: 0, scrapTotal: 0,
    lvl, slots: new Array(C.BUILDING_SLOTS).fill(null), unlocked: {}, revealed: {}, kontorT: 0,
    baseHp: C.BASE_HP, enemyBaseHp: d.enemyBaseHp,
    nextWave: d.firstWave, enemyQueue: [], queue: [], units: [], nextId: 1,
    spawnCd: 0, turretCd: 0, enemyTurretCd: 0,
    clicks: 0, kills: 0, losses: 0, firstWaveSeen: false, eraReached: false, alarms: 0,
    log: [], savedAt: 0,
  };
}

function create(){
  let S = freshState(null, 1);
  const FX = { on: true, shots: [], fx: [], baseFlash: { p: 0, e: 0 } };

  const rnd = () => { const [v, s] = nextRandom(S.rng); S.rng = s; return v; };
  function log(key, params){
    S.log.unshift({ t: S.t, key, params: params || {} });
    if (S.log.length > C.LOG_LINES) S.log.length = C.LOG_LINES;
  }

  /* ---------- abgeleitete Werte ---------- */
  const has = b => S.slots.some(s => s && s.type === b);
  // Wirksame Stufe: Upgrades eines abgerissenen Gebäudes bleiben gespeichert, wirken aber nicht (REQ-01.8)
  const lv = id => (C.BUILDINGS.includes(C.UPGRADES[id].group) && !has(C.UPGRADES[id].group)) ? 0 : S.lvl[id];
  const diffCfg      = () => C.DIFFICULTY[S.diff];
  const clickPower   = () => Math.floor((1 + C.FX_PRESSE * lv('presse')) * (1 + C.FX_HYDRAULIK * lv('hydraulik')));
  const fertigerRate = () => C.FX_FERTIGER_RATE * (1 + C.FX_TAKT * lv('takt'));
  const matRate      = () => lv('fertiger') * fertigerRate();
  const hpMultP      = () => Math.pow(C.FX_RUESTUNG, lv('ruestung'));
  const dmgMultP     = () => Math.pow(C.FX_KLINGEN, lv('klingen'));
  const cdMultP      = () => Math.pow(C.FX_DRILL, lv('drill'));
  const bountyMult   = () => 1;
  const baseMax      = () => C.BASE_HP + C.FX_MAUER_HP * lv('mauer');
  const offlineHours = () => C.OFFLINE_HOURS + C.FX_NACHT_HOURS * lv('nacht');
  const turretDmg    = () => C.PLAYER_TURRET.dmgPerLevel * lv('turm');
  const turretRange  = () => C.PLAYER_TURRET.range + C.PLAYER_TURRET.rangePerLevel * lv('reichweite');
  const turretCd     = () => C.PLAYER_TURRET.cd * Math.pow(C.PLAYER_TURRET.cdFactor, lv('kadenz'));
  const enemyHpMult  = () => 1 + diffCfg().hpGrowth  * S.t / 60;
  const enemyDmgMult = () => 1 + diffCfg().dmgGrowth * S.t / 60;
  const unitCost     = type => Math.max(1, Math.round(C.UNITS[type].cost * (1 - C.FX_REKRUTIERUNG * lv('rekrutierung'))));
  const spawnGap     = () => C.SPAWN_GAP_S * Math.pow(C.FX_EXERZIER, lv('exerzierplatz'));
  const queueMax     = () => C.QUEUE_MAX + C.FX_STUBE * lv('stube');
  const interestRate = () => C.KONTOR.rate + C.FX_ZINSESZINS * lv('zinseszins');

  function upCost(id){
    const u = C.UPGRADES[id];
    let c = u.baseCost * Math.pow(u.growth, S.lvl[id]);
    if (id === 'fertiger') c *= (1 - C.FX_SERIE * lv('serie'));
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
  const nextSlotCost = () => builtCount() < C.BUILDING_SLOTS ? C.BUILD_COSTS[builtCount()] : Infinity;
  const isBuildable = type => C.START_BUILDINGS.includes(type) || !!S.unlocked[type];
  const countType = type => S.slots.filter(s => s && s.type === type).length;
  const refundFor = i => S.slots[i] ? Math.floor(S.slots[i].paid * C.REFUND_RATE) : 0;
  /* Warum ein Gebäude nicht baubar ist (null = baubar) */
  function buildBlock(i, type){
    if (S.status !== 'running') return 'notRunning';
    if (!C.BUILDINGS.includes(type)) return 'unknown';
    if (!isBuildable(type)) return 'locked';
    if (countType(type) >= C.MAX_PER_TYPE) return 'standing';
    if (i < 0 || i >= C.BUILDING_SLOTS || S.slots[i]) return 'occupied';
    if (S.material < nextSlotCost()) return 'material';
    return null;
  }

  function addMaterial(n){ S.material += n; S.materialTotal += n; }

  /* ---------- Aktionen ---------- */
  function doClick(){
    if (S.status !== 'running') return false;
    addMaterial(clickPower());
    S.clicks++;
    return true;
  }
  function buy(id){
    if (!canBuy(id)) return false;
    S[C.UPGRADES[id].cur] -= upCost(id);
    S.lvl[id]++;
    if (id === 'mauer') S.baseHp += C.FX_MAUER_HP;
    if (id === 'turm' && S.lvl.turm === 1) log('log.turret');
    return true;
  }
  function buildAt(i, type){
    if (buildBlock(i, type)) return false;
    const cost = nextSlotCost();
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
  function demolish(i){
    if (S.status !== 'running' || !S.slots[i]) return false;
    const refund = refundFor(i), type = S.slots[i].type;
    S.material += refund;
    S.slots[i] = null;
    if (S.baseHp > baseMax()) S.baseHp = baseMax();
    log('log.demolished', { building: '@bld.' + type + '.name', slot: i + 1, amount: refund });
    return true;
  }
  function unlockBuilding(type){ S.unlocked[type] = true; }
  function repair(){
    if (S.status !== 'running' || S.material < C.REPAIR_COST || S.baseHp >= baseMax()) return false;
    S.material -= C.REPAIR_COST;
    S.baseHp = Math.min(baseMax(), S.baseHp + C.REPAIR_AMOUNT);
    return true;
  }
  function makeUnit(side, type){
    const spec = C.UNITS[type], p = side === 'p';
    const hp = spec.hp * (p ? hpMultP() : enemyHpMult());
    return {
      id: S.nextId++, side, type, x: p ? PBW : W - EBW,
      hp, maxHp: hp, dmg: spec.dmg * (p ? dmgMultP() : enemyDmgMult()),
      cdMax: spec.cd * (p ? cdMultP() : 1), cd: 0, flash: 0, moving: false, bob: rnd() * 6,
    };
  }
  const spawnBlocked = side => S.units.some(u => u.side === side &&
    (side === 'p' ? u.x - PBW : (W - EBW) - u.x) < C.SPAWN_BLOCK_DIST);
  const gateHeld = () => S.units.some(u => u.side === 'p' && u.hp > 0 && u.x >= W - EBW - C.GATE_HOLD_DIST);

  function spawn(type){
    const cost = unitCost(type);
    if (S.status !== 'running' || S.queue.length >= queueMax() || S.material < cost) return false;
    S.material -= cost;
    S.queue.push(type);
    return true;
  }

  /* ---------- Simulation ---------- */
  function scheduleWave(){
    const d = diffCfg(), min = S.t / 60;
    const size = 1 + Math.floor(min / d.waveEvery);
    for (let i = 0; i < size; i++){
      const type = (min >= d.werferFrom && rnd() < d.werferShare) ? 'werfer' : 'laeufer';
      S.enemyQueue.push({ type, at: S.t + i * C.ENEMY_QUEUE_SPACING_S });
    }
    if (!S.firstWaveSeen){ S.firstWaveSeen = true; log('log.firstWave'); }
    S.nextWave = S.t + Math.max(d.intervalMin, d.intervalStart - d.intervalDrop * min);
  }
  function nearest(side, x, range){
    let best = null, bd = Infinity;
    for (const u of S.units){
      if (u.hp <= 0 || u.side !== side) continue;
      const dd = Math.abs(u.x - x);
      if (dd <= range && dd < bd){ bd = dd; best = u; }
    }
    return best;
  }
  const shot = s => { if (FX.on) FX.shots.push(s); };

  function updateTurrets(dt){
    S.enemyTurretCd -= dt;
    if (S.enemyTurretCd <= 0){
      const tgt = nearest('p', W - EBW, C.ENEMY_TURRET.range);
      if (tgt){
        tgt.hp -= diffCfg().turretDmg * enemyDmgMult(); tgt.flash = 0.12;
        shot({ x0: W - EBW / 2, x1: tgt.x, t: 0, dur: 0.18, turret: true });
        S.enemyTurretCd = C.ENEMY_TURRET.cd;
      }
    }
    if (lv('turm') > 0){
      S.turretCd -= dt;
      if (S.turretCd <= 0){
        const tgt = nearest('e', PBW, turretRange());
        if (tgt){
          tgt.hp -= turretDmg(); tgt.flash = 0.12;
          shot({ x0: PBW - 9, x1: tgt.x, t: 0, dur: 0.18, turret: true });
          S.turretCd = turretCd();
        }
      }
    }
  }

  function updateUnits(dt){
    const us = S.units;
    for (const u of us){
      if (u.hp <= 0) continue;
      const spec = C.UNITS[u.type], dir = u.side === 'p' ? 1 : -1;
      u.cd -= dt;
      u.flash = Math.max(0, u.flash - dt);
      u.moving = false;
      let target = null, dist = Infinity, allyGap = Infinity;
      for (const o of us){
        if (o === u || o.hp <= 0) continue;
        const dd = (o.x - u.x) * dir;
        if (o.side !== u.side){ if (dd > -C.TARGET_BEHIND_TOLERANCE && dd < dist){ dist = dd; target = o; } }
        else if (dd > 0 && dd < allyGap) allyGap = dd;
      }
      const baseDist = ((u.side === 'p' ? W - EBW : PBW) - u.x) * dir;
      const ranged = spec.range > C.RANGED_MIN_RANGE;
      if (target && dist <= spec.range){
        if (u.cd <= 0){
          u.cd = u.cdMax;
          target.hp -= u.dmg; target.flash = 0.12;
          if (ranged) shot({ x0: u.x, x1: target.x, t: 0, dur: 0.3 });
        }
      } else if (baseDist <= spec.range){
        if (u.cd <= 0){
          u.cd = u.cdMax;
          if (u.side === 'p'){ S.enemyBaseHp -= u.dmg; FX.baseFlash.e = 0.12; }
          else {
            S.baseHp -= u.dmg; FX.baseFlash.p = 0.12;
            if (!ranged && lv('stacheln') > 0){ u.hp -= C.FX_STACHELN_DMG * lv('stacheln'); u.flash = 0.12; }
          }
          if (ranged) shot({ x0: u.x, x1: u.side === 'p' ? W - EBW + 8 : PBW - 8, t: 0, dur: 0.3 });
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
        const b = C.UNITS[u.type].bounty * bountyMult();
        S.scrap += b; S.scrapTotal += b; S.kills++;
      } else S.losses++;
      if (FX.on) FX.fx.push({ x: u.x, t: 0, side: u.side });
    }
    S.units = us.filter(u => !u.dead);
  }

  function checkReveals(){
    for (const id in C.UPGRADES){
      if (S.revealed[id] || !isAvailable(id)) continue;
      if (S[C.UPGRADES[id].cur] >= upCost(id) * C.REVEAL_AT || S.lvl[id] > 0){
        S.revealed[id] = true;
        if (S.t > 1) log('log.newOption', { name: '@upg.' + id + (id === 'turm' && S.lvl.turm === 0 ? '.build' : '.name') });
      }
    }
    if (!S.revealed.repair && S.baseHp < baseMax()) S.revealed.repair = true;
  }
  function checkEra(){
    if (!S.eraReached && S.scrapTotal >= C.ERA2_AT){ S.eraReached = true; log('log.era2'); }
  }

  function tick(dt){
    if (S.status !== 'running') return;
    S.t += dt;
    addMaterial(matRate() * dt);
    S.spawnCd = Math.max(0, S.spawnCd - dt);
    if (lv('moertel') > 0) S.baseHp = Math.min(baseMax(), S.baseHp + C.FX_MOERTEL_REGEN * lv('moertel') * dt);
    if (S.queue.length && S.spawnCd <= 0 && !spawnBlocked('p')){
      S.units.push(makeUnit('p', S.queue.shift()));
      S.spawnCd = spawnGap();
    }
    // Handelskontor: Zinsen auf den Materialbestand, gedeckelt
    if (has('kontor')){
      S.kontorT += dt;
      if (S.kontorT >= C.KONTOR.intervalS){
        S.kontorT -= C.KONTOR.intervalS;
        const cap = Math.max(C.KONTOR.capMin, matRate() * C.KONTOR.capSeconds);
        addMaterial(Math.min(cap, S.material * interestRate()));
      }
    }
    if (S.t >= S.nextWave) scheduleWave();

    const eFrac = S.enemyBaseHp / diffCfg().enemyBaseHp;
    let alarmLevel = 0;
    C.ALARM_THRESHOLDS.forEach((th, i) => { if (eFrac < th) alarmLevel = i + 1; });
    if (alarmLevel > S.alarms){
      S.alarms = alarmLevel;
      for (let i = 0; i < diffCfg().alarmSize; i++)
        S.enemyQueue.unshift({ type: i % C.ALARM_WERFER_EVERY === C.ALARM_WERFER_EVERY - 1 ? 'werfer' : 'laeufer', at: S.t + i * C.ALARM_SPACING_S, alarm: true });
      log('log.alarm');
    }
    while (S.enemyQueue.length && S.enemyQueue[0].at <= S.t && !spawnBlocked('e')
           && (S.enemyQueue[0].alarm || (!gateHeld() && S.units.filter(u => u.side === 'e').length < diffCfg().maxField))){
      S.units.push(makeUnit('e', S.enemyQueue.shift().type));
    }
    updateTurrets(dt);
    updateUnits(dt);
    checkReveals();
    checkEra();
    if (S.enemyBaseHp <= 0){ S.enemyBaseHp = 0; S.status = 'won';  log('log.won'); }
    else if (S.baseHp <= 0){ S.baseHp = 0;     S.status = 'lost'; log('log.lost'); }
  }

  /* Neue Partie bzw. Spielstand übernehmen */
  function newGame(diff, seed){
    S = freshState(diff, seed);
    FX.shots = []; FX.fx = [];
    log('log.start', { diff: '@diff.' + diff + '.name' });
  }
  function adopt(saved){
    const base = freshState(saved.diff, saved.rng);
    S = Object.assign(base, saved, { units: [], enemyQueue: [] });
    S.lvl = Object.assign(freshState(saved.diff, 1).lvl, saved.lvl || {});
    if (!Array.isArray(S.queue)) S.queue = [];
    S.nextWave = S.t + C.RELOAD_WAVE_DELAY_S;
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
    doClick, buy, build, buildAt, demolish, unlockBuilding, repair, spawn,
    canBuy, isAvailable, isMaxed, upCost, unitCost, nextSlotCost, builtCount, has, lv,
    buildBlock, isBuildable, refundFor, spawnGap, queueMax, interestRate,
    clickPower, matRate, hpMultP, dmgMultP, cdMultP, bountyMult, baseMax, diffCfg,
    offlineHours, turretDmg, turretRange, turretCd,
  };
}

return { create, freshState, nextRandom };
})();

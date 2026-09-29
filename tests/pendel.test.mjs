// Tests Iteration 6, REQ-6.01: Formationen ohne Pendeln. Je Ursache ein Szenario mit festem Seed; zuerst rot gegen v0.6.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';
import { directionTracker } from '../tools/sim-metrics.mjs';

const TOP = 0, MID = 1, BOT = 2;
function game(){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  return { G, C: KF_CONFIG };
}
const set = (G, f, hp, dmg) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = hp; u.dmg = dmg; } };
const spread = (types, lanes) => types.map((type, i) => ({ type, lane: lanes[i % lanes.length] }));

/* Eine echte Partie mit dem Bot „Einheiten zuerst“ (derselbe Seed, der in v0.6 42 Wechsel je Sekunde zeigte) */
function seededGame(seed, diff = 'normal', seconds = 240){
  const { KlammerCore, KF_BROWSER_BOT } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { intro: true });
  const bot = KF_BROWSER_BOT(G, { cps: 1.5, every: 1, cap: 22, useWall: true });
  return { G, bot, seconds };
}

test('Ursache 1 – Zustandspendeln: jede Armee bleibt mindestens ARMY.minStateS in einem Zustand', () => {
  const { G, bot, seconds } = seededGame(105729);
  const C = loadCore().KF_CONFIG;
  const last = new Map(); let worst = Infinity;
  for (let i = 0; i < seconds * 20 && G.S.status === 'running'; i++){
    bot.step(0.05);
    for (const f of G.S.forms){
      const p = last.get(f.id);
      if (p && p.state !== f.state){ worst = Math.min(worst, G.S.t - p.since); last.set(f.id, { state: f.state, since: G.S.t }); }
      else if (!p) last.set(f.id, { state: f.state, since: G.S.t });
    }
  }
  assert.ok(worst >= C.ARMY.minStateS - 1e-9, `kürzeste Verweildauer ${worst.toFixed(2)} s`);
});

test('Ursache 2 – feste Plätze: helfende Einheiten reihen sich hinten ein, niemand rückt dafür nach hinten', () => {
  const { G } = game();
  // Armee über Mitte und oben, Ids abwechselnd: helfende Einheiten von oben haben kleinere Ids als manche der Mitte
  const a = G.addGroup('p', spread(Array(8).fill('laeufer'), [TOP, MID]), 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', MID, ['laeufer', 'laeufer'], 320); set(G, e, 1e6, 0);
  const rowOf = () => new Map(G.formMembers(a).filter(u => u.home === MID).map(u => [u.id, u.row]));
  G.tick(0.05);
  const before = rowOf();
  for (let i = 0; i < 60; i++) G.tick(0.05);                          // oben hilft der Mitte (Querbewegung 1,2 s)
  assert.ok(G.formMembers(a).some(u => u.home === TOP && u.lane === MID), 'oben hilft der Mitte');
  for (const [id, row] of rowOf()) assert.ok(row <= before.get(id), `Einheit ${id} rückte von Reihe ${before.get(id)} auf ${row}`);
});

test('Ursache 2 – feste Plätze: fällt ein Vordermann, rücken Einheiten nur nach vorn', () => {
  const { G } = game();
  const a = G.addFormation('p', MID, Array(8).fill('laeufer'), 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', MID, ['laeufer'], 320); set(G, e, 1e6, 0);
  G.tick(0.05);
  const before = new Map(G.formMembers(a).map(u => [u.id, { row: u.row, col: u.col }]));
  const front = G.formMembers(a).find(u => u.row === 0 && u.col === 2); front.hp = 0;
  G.tick(0.05);
  for (const u of G.formMembers(a)){
    const b = before.get(u.id);
    assert.ok(u.row < b.row || (u.row === b.row && u.col <= b.col), `Einheit ${u.id}: ${b.row}/${b.col} → ${u.row}/${u.col}`);
  }
});

test('Ursache 3 – gebundene Lane-Wahl: keine Einheit wechselt ihre Ziel-Lane öfter als zweimal je Sekunde', () => {
  const { G, bot, seconds } = seededGame(105729);
  const lanes = new Map(); let worst = 0;
  for (let i = 0; i < seconds * 20 && G.S.status === 'running'; i++){
    bot.step(0.05);
    for (const u of G.S.units){
      const r = lanes.get(u.id);
      if (!r){ lanes.set(u.id, { lane: u.lane, times: [] }); continue; }
      if (r.lane !== u.lane){ r.lane = u.lane; r.times.push(G.S.t); while (G.S.t - r.times[0] > 1) r.times.shift(); worst = Math.max(worst, r.times.length); }
    }
  }
  assert.ok(worst <= 2, `bis zu ${worst} Lane-Wechsel je Sekunde`);
});

test('Ursache 4 – konkurrierende Ziele: beim Sammeln bewegt sich jede Einheit quer nur in eine Richtung', () => {
  const { G } = game();
  const a = G.addGroup('p', spread(Array(6).fill('laeufer'), [TOP, MID, BOT]), 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', MID, ['laeufer'], 320); set(G, e, 1e6, 0);
  for (let i = 0; i < 40; i++) G.tick(0.05);                          // oben und unten helfen der Mitte
  for (const u of G.formMembers(e)) u.hp = 0;                         // Gegner fällt → Sammeln
  const dirs = new Map();
  for (let i = 0; i < 80; i++){
    const prev = new Map(G.formMembers(a).map(u => [u.id, u.laneF]));
    G.tick(0.05);
    for (const u of G.formMembers(a)){
      const d = Math.sign(u.laneF - prev.get(u.id));
      if (!d) continue;
      if (dirs.has(u.id)) assert.equal(d, dirs.get(u.id), `Einheit ${u.id} kehrt quer um`);
      dirs.set(u.id, d);
    }
  }
  assert.ok(G.formMembers(a).every(u => u.laneF === u.home), 'alle zurück in der Heimat-Lane');
});

test('Richtungswechsel in echten Partien: höchstens 2 je Einheit und Sekunde (beide Seiten, drei Seeds)', () => {
  for (const seed of [105729, 191056, 289648]){
    const { G, bot, seconds } = seededGame(seed, 'normal', 300);
    const tr = directionTracker({ lateralOf: G.lateralOf });
    for (let i = 0; i < seconds * 20 && G.S.status === 'running'; i++){ bot.step(0.05); tr.sample(G.S, 0.05); }
    const r = tr.result();
    assert.ok(r.maxPerSecond <= 2, `Seed ${seed}: ${r.maxPerSecond} Wechsel je Sekunde (Einheit ${r.worst && r.worst.id}, ${r.worst && r.worst.t} s, ${r.worst && r.worst.axis})`);
  }
});

test('Totzone: eine Einheit näher als ARMY.deadZone an ihrer Ziel-Lane bewegt sich quer nicht mehr', () => {
  const { G, C } = game();
  const a = G.addFormation('p', MID, ['laeufer'], 300); set(G, a, 1e6, 0);
  const u = G.formMembers(a)[0];
  u.laneF = MID + C.ARMY.deadZone / 2;
  G.tick(0.05);
  assert.equal(u.laneF, MID, 'rastet in der Totzone ein');
});

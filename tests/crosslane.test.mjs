// Tests Iteration 4, REQ-43: Lane-übergreifender Kampf.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1, BOT = 2;
function game(){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  return { G, C: KF_CONFIG };
}
const set = (G, f, hp, dmg) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = hp; u.dmg = dmg; } };
const run = (G, s) => { for (let i = 0; i < s * 20; i++) G.tick(0.05); };

test('Kein Wechsel, solange die eigene Lane ein Ziel hat', () => {
  const { G } = game();
  const own = G.addFormation('e', TOP, ['laeufer'], 330); set(G, own, 1e6, 0);
  const mid = G.addFormation('e', MID, ['laeufer'], 320); set(G, mid, 1e6, 0);
  const f = G.addFormation('p', TOP, ['laeufer', 'laeufer'], 300); set(G, f, 1e6, 0);
  run(G, 5);
  assert.equal(f.lane, TOP);
  assert.equal(f.laneF, TOP);
});

test('Ohne Ziel in der eigenen Lane: Wechsel in die Mitte, sichtbare Querbewegung', () => {
  const { G, C } = game();
  // Gegner greift das Tor an und steht; die obere Formation steht am Tor ohne Ziel in ihrer Lane
  const mid = G.addFormation('e', MID, ['laeufer'], C.PLAYER_BASE_WIDTH + 10); set(G, mid, 1e6, 0);
  const f = G.addFormation('p', TOP, ['laeufer'], C.PLAYER_BASE_WIDTH); set(G, f, 1e6, 0);
  G.tick(0.05);
  assert.equal(f.lane, MID, 'Ziel-Lane Mitte');
  assert.ok(f.laneF > TOP && f.laneF < MID, 'Querbewegung zwischen den Lanes');
  run(G, C.LANE_SHIFT_S + 0.2);
  assert.equal(f.laneF, MID, 'in der Mitte angekommen');
});

test('Kein direkter Wechsel zwischen oben und unten', () => {
  const { G } = game();
  const bot = G.addFormation('e', BOT, ['laeufer'], 330); set(G, bot, 1e6, 0);
  const f = G.addFormation('p', TOP, ['laeufer'], 300); set(G, f, 1e6, 0);
  for (let i = 0; i < 20 * 5; i++){ G.tick(0.05); assert.ok(f.laneF <= MID && f.lane !== BOT, 'nie Richtung unten'); }
  assert.equal(f.lane, TOP);
});

test('Rückkehr in die eigene Lane nach dem Kampf', () => {
  const { G, C } = game();
  const mid = G.addFormation('e', MID, ['laeufer'], C.PLAYER_BASE_WIDTH + 10); set(G, mid, 20, 0);
  const f = G.addFormation('p', TOP, ['laeufer', 'laeufer', 'laeufer'], C.PLAYER_BASE_WIDTH); set(G, f, 1e6, 50);
  run(G, C.LANE_SHIFT_S + 1);
  assert.equal(G.S.forms.filter(x => x.side === 'e').length, 0, 'Gegner besiegt');
  run(G, C.LANE_SHIFT_S + 0.5);
  assert.equal(f.lane, TOP);
  assert.equal(f.laneF, TOP);
  const x = f.x; run(G, 1);
  assert.ok(f.x > x, 'rückt weiter vor');
});

test('Türme: zuerst die eigene Lane, sonst Gegner in der Mitte', () => {
  const { G, C } = game();
  G.S.material = 1e6; G.buy('turm_0');
  const mid = G.addFormation('e', MID, ['laeufer'], C.PLAYER_BASE_WIDTH + 60); set(G, mid, 1e6, 0);
  mid.x = C.PLAYER_BASE_WIDTH + 60;
  run(G, 0.1);
  const m = G.formMembers(mid)[0];
  assert.ok(m.hp < 1e6, 'Turm oben trifft die Mitte, wenn oben niemand ist');
  const top = G.addFormation('e', TOP, ['laeufer'], C.PLAYER_BASE_WIDTH + 60); set(G, top, 1e6, 0);
  const hpMid = m.hp; G.S.turretCd[TOP] = 0;
  run(G, 0.05);
  assert.ok(G.formMembers(top)[0].hp < 1e6, 'eigene Lane hat Vorrang');
  assert.equal(m.hp, hpMid);
});

test('Für Gegner gelten dieselben Regeln', () => {
  const { G, C } = game();
  const p = G.addFormation('p', MID, ['laeufer'], 600); set(G, p, 1e6, 0);
  const e = G.addFormation('e', BOT, ['laeufer'], 630); set(G, e, 1e6, 0);
  G.tick(0.05);
  assert.equal(e.lane, MID);
});

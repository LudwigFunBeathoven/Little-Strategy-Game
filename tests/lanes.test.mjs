// Tests Inkrement 1: drei Lanes, Formation, Basis mit Abschnitten (REQ-11 bis REQ-13).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1, BOT = 2;
function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG, K: KlammerCore };
}
/* Nur die vorgegebenen Einheiten auf dem Feld: keine Gegnerwellen, kein gegnerischer Turm in Reichweite */
function quiet(G){ G.S.nextWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.enemyTurretCd = Infinity; }
function place(G, side, type, lane, x){ const u = G.makeUnit(side, type, lane, x); G.S.units.push(u); return u; }

test('Einheiten wechseln nie die Lane', () => {
  const { G } = game('normal', 11);
  G.S.material = 1e6;
  const lanes = new Map();
  for (let i = 0; i < 20 * 240 && G.S.status === 'running'; i++){
    if (G.S.pendingDraft) G.chooseDraft(0);
    if (i % 40 === 0){ G.spawn('laeufer'); G.spawn('werfer'); G.S.material = 1e6; }
    G.tick(0.05);
    for (const u of G.S.units){
      if (!lanes.has(u.id)) lanes.set(u.id, u.lane);
      assert.equal(u.lane, lanes.get(u.id), `Einheit ${u.id} hat die Lane gewechselt`);
    }
  }
  assert.ok(lanes.size > 20, 'genug Einheiten beobachtet');
  const used = new Set([...lanes.values()]);
  assert.deepEqual([...used].sort(), [TOP, MID, BOT]);
});

test('Verteilung für n = 1 bis 6 nach REQ-12.1', () => {
  const { K } = game();
  assert.deepEqual(Array.from(K.distribute(1, TOP)), [MID]);
  assert.deepEqual(Array.from(K.distribute(2, TOP)), [MID, TOP]);
  assert.deepEqual(Array.from(K.distribute(2, BOT)), [MID, BOT], 'zweite Einheit in die Lane mit der stärkeren Gegnerwelle');
  assert.deepEqual(Array.from(K.distribute(3, BOT)), [MID, TOP, BOT]);
  assert.deepEqual(Array.from(K.distribute(4, BOT)), [MID, TOP, BOT, MID]);
  assert.deepEqual(Array.from(K.distribute(5, BOT)), [MID, TOP, BOT, MID, TOP]);
  assert.deepEqual(Array.from(K.distribute(6, BOT)), [MID, TOP, BOT, MID, TOP, BOT]);
});

test('Fernkämpfer mit einer Einheit vor sich greift an, mit zwei nicht', () => {
  for (const [ahead, expectHit] of [[1, true], [2, false]]){
    const { G } = game();
    quiet(G);
    const enemy = place(G, 'e', 'laeufer', MID, 500);
    enemy.hp = enemy.maxHp = 1000; enemy.dmg = 0;
    for (let k = 0; k < ahead; k++){ const m = place(G, 'p', 'laeufer', MID, 440 - k * 15); m.dmg = 0; }
    const r = place(G, 'p', 'werfer', MID, 440 - ahead * 15);
    assert.ok(500 - r.x <= r.range, 'Ziel in Reichweite');
    G.tick(0.05);
    assert.equal(r.rank, ahead);
    assert.equal(enemy.hp < 1000, expectHit, `${ahead} Einheit(en) vor dem Fernkämpfer`);
  }
});

test('Formation: Nahkämpfer vorn, Fernkämpfer ohne Nahkämpfer in der Lane steht vorn', () => {
  const { G } = game();
  quiet(G);
  const r = place(G, 'p', 'werfer', TOP, 200);
  const m = place(G, 'p', 'laeufer', TOP, 170);        // Nahkämpfer hinter dem Fernkämpfer gekauft
  const solo = place(G, 'p', 'werfer', BOT, 150);
  G.tick(0.05);
  assert.equal(solo.rank, 0, 'Fernkämpfer allein in der Lane steht vorn');
  assert.ok(G.canAttack(solo));
  for (let i = 0; i < 20 * 20; i++) G.tick(0.05);
  assert.ok(m.x > r.x, 'Nahkämpfer hat den Fernkämpfer überholt');
  assert.equal(m.rank, 0);
  assert.equal(r.rank, 1);
});

test('Mauer oben fällt: Turm oben inaktiv, Gegner der oberen Lane greifen das Tor an', () => {
  const { G, C } = game();
  quiet(G);
  G.S.material = 1e6;
  assert.ok(G.buy('turm_0'));
  assert.ok(G.towerActive(TOP));
  G.S.sections[TOP].hp = 1;
  const e = place(G, 'e', 'laeufer', TOP, C.PLAYER_BASE_WIDTH + 5);
  e.hp = e.maxHp = 1e6; e.dmg = 50;
  const gateBefore = G.S.sections[MID].hp;
  for (let i = 0; i < 20 * 3; i++) G.tick(0.05);
  assert.equal(G.S.sections[TOP].hp, 0, 'Mauer oben gefallen');
  assert.equal(G.towerActive(TOP), false, 'Turm oben inaktiv');
  assert.ok(G.S.sections[MID].hp < gateBefore, 'Tor nimmt Schaden aus der oberen Lane');
  assert.ok(G.repair(TOP));
  assert.ok(G.towerActive(TOP), 'nach Reparatur wieder aktiv');
});

test('Tor auf 0 ergibt eine Niederlage', () => {
  const { G } = game();
  quiet(G);
  G.S.sections[MID].hp = 1;
  const e = place(G, 'e', 'laeufer', MID, 60 + 5);
  e.hp = e.maxHp = 1e6; e.dmg = 50;
  for (let i = 0; i < 20 * 3 && G.S.status === 'running'; i++) G.tick(0.05);
  assert.equal(G.S.status, 'lost');
});

test('Wände fallen, ohne die Partie zu beenden', () => {
  const { G } = game();
  quiet(G);
  G.S.sections[TOP].hp = 0; G.S.sections[BOT].hp = 0;
  G.tick(0.05);
  assert.equal(G.S.status, 'running');
});

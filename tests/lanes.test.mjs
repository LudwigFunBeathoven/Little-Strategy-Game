// Tests: drei Lanes, Aufbau der Formation, Basis mit Abschnitten (REQ-11 bis REQ-13, REQ-42).
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
function quiet(G){ G.S.nextWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity; }
function place(G, side, type, lane, x){ const u = G.makeUnit(side, type, lane, x); G.S.units.push(u); return u; }

test('Einheiten behalten ihre Heimat-Lane (REQ-11.2, seit REQ-43 mit Querbewegung zur Unterstützung)', () => {
  const { G } = game('normal', 11);
  G.S.material = 1e6;
  const home = new Map();
  for (let i = 0; i < 20 * 240 && G.S.status === 'running'; i++){
    if (G.S.pendingDraft) G.chooseDraft(0);
    if (i % 40 === 0){ G.spawn('laeufer'); G.spawn('werfer'); G.S.material = 1e6; }
    G.tick(0.05);
    const forms = new Map(G.S.forms.map(f => [f.id, f]));
    for (const u of G.S.units){
      const f = forms.get(u.form); if (!f) continue;
      if (!home.has(u.id)) home.set(u.id, f.home);
      assert.equal(f.home, home.get(u.id), `Einheit ${u.id} hat die Heimat-Lane gewechselt`);
      assert.ok(Math.abs(u.laneF - f.home) <= 1, 'höchstens eine Lane neben der Heimat');
    }
  }
  assert.ok(home.size > 20, 'genug Einheiten beobachtet');
  assert.deepEqual([...new Set(home.values())].sort(), [TOP, MID, BOT]);
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

// REQ-5.05 ersetzt REQ-12.4: Fernkämpfer schießen über alle eigenen Reihen, begrenzt nur durch ihre Reichweite
test('Fernkämpfer schießen über eigene Reihen, solange das Ziel in Reichweite ist', () => {
  for (const [melee, expectHit] of [[5, true], [6, true]]){
    const { G } = game();
    quiet(G);
    const e = G.addFormation('e', MID, ['laeufer'], 500);
    for (const u of G.formMembers(e)){ u.hp = u.maxHp = 1e6; u.dmg = 0; }
    const f = G.addFormation('p', MID, [...Array(melee).fill('laeufer'), 'werfer'], 490);
    const r = G.formMembers(f).find(u => u.ranged);
    for (const u of G.formMembers(f)) if (!u.ranged) u.dmg = 0;
    assert.equal(r.row, melee > 5 ? 2 : 1);
    const hp0 = G.formMembers(e)[0].hp;
    G.tick(0.05);
    assert.equal(G.formMembers(e)[0].hp < hp0, expectHit, `${melee} Nahkämpfer vor dem Fernkämpfer`);
  }
});

test('Formation: Nahkämpfer vorn, Fernkämpfer ohne Nahkämpfer stehen vorn', () => {
  const { G } = game();
  quiet(G);
  const f = G.addFormation('p', TOP, ['werfer', 'werfer', 'laeufer'], 200);
  const m = G.formMembers(f);
  assert.equal(m.find(u => !u.ranged).row, 0, 'Nahkämpfer vorn, auch wenn später gekauft');
  assert.ok(m.filter(u => u.ranged).every(u => u.row === 1));
  const solo = G.addFormation('p', BOT, ['werfer'], 150);
  assert.equal(G.formMembers(solo)[0].row, 0, 'Fernkämpfer allein stehen vorn');
});

test('Mauer oben fällt: Turm oben inaktiv, Gegner der oberen Lane greifen das Tor an', () => {
  const { G, C } = game();
  quiet(G);
  G.S.material = 1e6;
  assert.ok(G.buy('turm_0'));
  assert.ok(G.towerActive(TOP));
  G.S.sections[TOP].hp = 1;
  const e = G.addFormation('e', TOP, ['laeufer'], C.PLAYER_BASE_WIDTH + 5);
  for (const u of G.formMembers(e)){ u.hp = u.maxHp = 1e6; u.dmg = 50; }
  const gateBefore = G.S.sections[MID].hp;
  for (let i = 0; i < 20 * 3; i++) G.tick(0.05);
  assert.equal(G.S.sections[TOP].hp, 0, 'Mauer oben gefallen');
  assert.equal(G.towerActive(TOP), false, 'Turm oben inaktiv');
  assert.ok(G.S.sections[MID].hp < gateBefore, 'Tor nimmt Schaden aus der oberen Lane');
  assert.ok(G.repair(TOP));
  assert.ok(G.towerActive(TOP), 'nach Reparatur wieder aktiv');
});

test('Tor auf 0 ergibt eine Niederlage', () => {
  const { G, C } = game();
  quiet(G);
  G.S.sections[MID].hp = 1;
  const e = G.addFormation('e', MID, ['laeufer'], C.PLAYER_BASE_WIDTH + 5);
  for (const u of G.formMembers(e)){ u.hp = u.maxHp = 1e6; u.dmg = 50; }
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

// Tests Iteration 4, REQ-42: Formationen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const MID = 1;
function game(){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  return { G, C: KF_CONFIG };
}
const tough = (G, f) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = 1e6; u.dmg = 0; } };

test('Alle Einheiten einer Formation haben dieselbe Geschwindigkeit', () => {
  const { G, C } = game();
  const f = G.addFormation('p', MID, ['laeufer', 'werfer', 'laeufer', 'werfer', 'werfer'], 200);
  const before = new Map(G.formMembers(f).map(u => [u.id, u.x]));
  for (let i = 0; i < 20; i++) G.tick(0.05);
  const moved = G.formMembers(f).map(u => u.x - before.get(u.id));
  assert.ok(moved.every(d => Math.abs(d - moved[0]) < 1e-9), 'gleicher Weg für alle');
  assert.ok(Math.abs(moved[0] - C.UNITS.laeufer.speed * 1) < 1e-6, 'Weg = Marschtempo × Zeit');
});

test('Aufbau: höchstens FORMATION_ROW_MAX Nahkämpfer je Reihe, Fernkämpfer dahinter', () => {
  const { G, C } = game();
  const f = G.addFormation('p', MID, [...Array(7).fill('laeufer'), 'werfer', 'werfer'], 200);
  const m = G.formMembers(f);
  assert.equal(m.filter(u => u.row === 0).length, C.FORMATION_ROW_MAX);
  assert.ok(m.filter(u => u.row === 0).every(u => !u.ranged));
  assert.equal(m.filter(u => u.row === 1 && !u.ranged).length, 2, 'überzählige Nahkämpfer in Reihe 2');
  assert.ok(m.filter(u => u.ranged).every(u => u.row === 2), 'Fernkämpfer dahinter');
});

test('Formation hält an, sobald die vorderste Reihe Kontakt hat', () => {
  const { G, C } = game();
  const e = G.addFormation('e', MID, ['laeufer'], 400); tough(G, e);
  const f = G.addFormation('p', MID, ['laeufer', 'laeufer'], 300); tough(G, f);
  for (let i = 0; i < 20 * 6; i++) G.tick(0.05);
  const x = f.x;
  assert.ok(e.x - f.x <= C.MELEE_REACH + 1e-6, 'Kontakt');
  G.tick(0.05);
  assert.equal(f.x, x, 'steht');
});

test('Drei Nahkämpfer vorn verursachen den dreifachen Schaden eines einzelnen', () => {
  const dmgWith = n => {
    const { G } = game();
    const e = G.addFormation('e', MID, ['laeufer'], 400); tough(G, e);
    G.addFormation('p', MID, Array(n).fill('laeufer'), 390);
    const hp0 = G.formMembers(e)[0].hp;
    for (let i = 0; i < 20 * 10; i++) G.tick(0.05);
    return hp0 - G.formMembers(e)[0].hp;
  };
  const one = dmgWith(1), three = dmgWith(3);
  assert.ok(one > 0);
  assert.ok(Math.abs(three - 3 * one) < 1e-6, `${three} gegen 3 × ${one}`);
});

test('Fällt eine Einheit der vordersten Reihe, rückt die nächste auf', () => {
  const { G } = game();
  const f = G.addFormation('p', MID, Array(6).fill('laeufer'), 200);
  const front = G.formMembers(f).filter(u => u.row === 0);
  front[0].hp = 0;
  G.tick(0.05);
  assert.equal(G.formMembers(f).filter(u => u.row === 0).length, 5, 'Reihe wieder voll');
});

test('Eine Formation verschmilzt mit einer kämpfenden eigenen Formation', () => {
  const { G } = game();
  const e = G.addFormation('e', MID, ['laeufer'], 500); tough(G, e);
  const a = G.addFormation('p', MID, ['laeufer', 'laeufer'], 490); tough(G, a);
  const b = G.addFormation('p', MID, ['laeufer', 'werfer'], 300); tough(G, b);
  for (let i = 0; i < 20 * 10; i++) G.tick(0.05);
  assert.ok(a.fighting);
  assert.equal(G.S.forms.filter(f => f.side === 'p').length, 1, 'nur noch eine Formation');
  assert.equal(G.formMembers(G.S.forms.find(f => f.side === 'p')).length, 4);
});

test('Gegnerwellen rücken als eine Gruppe über ihre Lanes aus (REQ-5.06)', () => {
  const { G } = game();
  G.S.nextWave = G.S.t + 0.05;
  G.S.nextEnemy = [{ type: 'laeufer', lane: MID }, { type: 'werfer', lane: MID }, { type: 'laeufer', lane: 0 }];
  G.tick(0.05);
  const ef = G.S.forms.filter(f => f.side === 'e');
  assert.equal(ef.length, 1);
  assert.deepEqual(G.formMembers(ef[0]).map(u => u.lane).sort(), [0, MID, MID]);
});

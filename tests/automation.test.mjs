// Tests Iteration 4, REQ-44: automatische Presse, größere Armeen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.nextEnemy = [];
  return { G, C: KF_CONFIG };
}
const run = (G, s, cps = 0) => { let acc = 0; for (let i = 0; i < s * 20; i++){ acc += cps * 0.05; while (acc >= 1){ G.doClick(); acc--; } G.tick(0.05); } };

test('Automatische Presse: aus in Phase Früh, 50 % der Referenzrate in Mitte, 100 % in Spät', () => {
  const { G, C } = game();
  assert.equal(G.autoPressCps(), 0);
  G.S.level = C.PHASE_MID_LEVEL;
  assert.equal(G.autoPressCps(), C.PRESS_REFERENCE_CPS * 0.5);
  G.S.level = C.PHASE_LATE_LEVEL;
  assert.equal(G.autoPressCps(), C.PRESS_REFERENCE_CPS * 1.0);
});

test('Ertrag = Maximum aus automatischem und manuellem Klicken', () => {
  const yieldAt = (level, cps) => {
    const { G } = game(); G.S.level = level;
    const m0 = G.S.materialTotal; run(G, 10, cps);
    return (G.S.materialTotal - m0) / 10 / G.clickPower();
  };
  const { C } = game();
  const mid = C.PHASE_MID_LEVEL;
  assert.ok(Math.abs(yieldAt(mid, 0) - 3) < 0.1, 'nur Automatik: 3/s');
  assert.ok(Math.abs(yieldAt(mid, 2) - 3) < 0.1, '2 Klicks/s unter der Automatik: weiter 3/s');
  assert.ok(Math.abs(yieldAt(mid, 5) - 5) < 0.3, '5 Klicks/s: 5/s');
  assert.ok(Math.abs(yieldAt(0, 5) - 5) < 0.3, 'Phase Früh: nur manuell');
});

test('Reguläre Gegnerwellen wachsen bis ENEMY_WAVE_MAX', () => {
  const { G, C } = game();
  G.S.nextWave = 29 * 60; G.S.siegeDone = true;
  G.S.t = 29 * 60 - 20;
  G.S.nextEnemy = [];
  G.S.nextWave = G.S.t + 0.05; G.tick(0.05);
  assert.equal(G.S.nextEnemy.length, C.ENEMY_WAVE_MAX);
});

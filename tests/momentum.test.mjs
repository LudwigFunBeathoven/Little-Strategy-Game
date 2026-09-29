// Tests Iteration 5, REQ-5.08: Experiment „Schwung“ hinter EXPERIMENT.momentum (standardmäßig aus).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(on){
  const { KlammerCore, KF_CONFIG: C } = loadCore();
  C.EXPERIMENT.momentum = on;
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity;
  G.S.material = 1e4; G.build('fabrik');
  return { G, C };
}

test('Schwung aus: Klicks ändern die Automatik nicht', () => {
  assert.equal(loadCore().KF_CONFIG.EXPERIMENT.momentum, false, 'standardmäßig aus');
  const { G } = game(false);
  const r0 = G.matRate();
  for (let i = 0; i < 20; i++){ G.doClick(); G.tick(0.1); }
  assert.equal(G.momentumBonus(), 0);
  assert.equal(G.matRate(), r0);
});

test('Schwung an: Klicks laden bis zur Obergrenze, der Bonus klingt ohne Klicks ab', () => {
  const { G, C } = game(true);
  const r0 = G.matRate();
  assert.ok(r0 > 0, 'erste Fabrik produziert');
  for (let i = 0; i < 600; i++){ G.doClick(); G.tick(0.1); }       // 10 Klicks/s über 60 s
  assert.equal(G.momentumBonus(), C.MOMENTUM.max, 'gedeckelt');
  assert.ok(Math.abs(G.matRate() / r0 - (1 + C.MOMENTUM.max)) < 1e-9, 'Automatik mit Höchstbonus');
  for (let t = 0; t < 6 * C.MOMENTUM.decayS; t += 0.5) G.tick(0.5);
  assert.ok(G.momentumBonus() < 0.1 * C.MOMENTUM.max, 'abgeklungen');
});

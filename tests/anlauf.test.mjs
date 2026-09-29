// Tests Iteration 6, REQ-6.08: Anlauf der Gegnerwellen (Schalter über rampMin je Schwierigkeitsgrad).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

test('Anlauf aus (Standard): erste Welle wie in v0.6', () => {
  const { KlammerCore, KF_CONFIG: C } = loadCore();
  assert.equal(C.DIFFICULTY.schwer.rampMin, 0);
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('schwer', 9);
  assert.equal(G.S.nextEnemy.length, Math.round(C.DIFFICULTY.schwer.waveBase + C.DIFFICULTY.schwer.waveGrowth * C.WAVE_INTERVAL_S / 60));
});
test('Anlauf an: erste Welle kleiner, nach rampMin wie ohne Anlauf', () => {
  const { KlammerCore, KF_CONFIG: C } = loadCore();
  C.DIFFICULTY.schwer.rampMin = 6; C.DIFFICULTY.schwer.startBase = 1;
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('schwer', 9);
  assert.equal(G.S.nextEnemy.length, Math.round(1 + (3.5 - 1) * (C.WAVE_INTERVAL_S / 60) / 6 + C.DIFFICULTY.schwer.waveGrowth * C.WAVE_INTERVAL_S / 60));
});

// Fund aus den Testspielen (Debugging nach Teil 6): Hintere Reihen großer Formationen standen außerhalb des Feldes (gegnerische Fernkämpfer bis x = 1084 hinter der eigenen Basis).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

for (const pacing of ['standard', 'karten']) test(`Formationen bleiben im Feld (${pacing})`, () => {
  const { KlammerCore, KF_CONFIG: C } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3, { pacing });
  G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  const many = t => Array.from({ length: 12 * C.FORMATION_ROW_MAX }, () => t);
  G.addFormation('e', 1, [...many('laeufer'), ...many('werfer')], C.LANE - C.ENEMY_BASE_WIDTH);
  G.addFormation('p', 1, [...many('laeufer'), ...many('werfer')], C.PLAYER_BASE_WIDTH);
  for (let k = 0; k < 20; k++) G.tick(C.TICK_S);
  for (const u of G.S.units) assert.ok(u.x >= 0 && u.x <= C.LANE, `${u.side} ${u.type} x=${u.x}`);
});

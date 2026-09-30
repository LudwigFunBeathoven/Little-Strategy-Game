// Tests Iteration 6, REQ-6.07 a: Nachbarschaftsregeln im 3×3-Raster (data/neighbors.js), nur orthogonal.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(){
  const { KlammerCore, KF_CONFIG: C, KF_NEIGHBORS: NB } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 5, { intro: false });
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.material = 1e9;
  for (const b of C.BUILDINGS) G.unlockBuilding(b);
  const rule = t => NB.find(r => r.building === t);
  return { G, C, NB, rule };
}

test('genau eine Regel je Gebäudetyp', () => {
  const { C, NB } = game();
  assert.deepEqual([...NB.map(r => r.building)].sort(), [...C.BUILDINGS].sort());
});
test('Nachbarn nur orthogonal (3×3)', () => {
  const { G } = game();
  assert.deepEqual([...G.adjacent(4)].sort(), [1, 3, 5, 7]);
  assert.deepEqual([...G.adjacent(0)].sort(), [1, 3]);
  assert.deepEqual([...G.adjacent(8)].sort(), [5, 7]);
});
test('Fabrik neben Fabrik: Ertrag je angrenzender Fabrik', () => {
  const { G, C, rule } = game();
  G.buildAt(4, 'fabrik'); const one = G.matRate();
  G.buildAt(1, 'fabrik');
  assert.ok(Math.abs(G.matRate() - one * 2 * (1 + rule('fabrik').per)) < 1e-9);
  G.buildAt(0, 'fabrik');                                               // diagonal zu 4: zählt nicht für 4
  assert.equal(G.neighborCount(4, 'fabrik'), 1);
});
test('Schmiede neben Kaserne: Einheitenkosten; Kaserne neben Schmiede: Versorgung', () => {
  const { G, C, rule } = game();
  const cost0 = G.unitCost('laeufer');
  G.buildAt(0, 'kaserne'); const sup0 = G.supplyCap();
  G.buildAt(1, 'schmiede');
  assert.equal(G.unitCost('laeufer'), Math.max(1, Math.round(C.UNITS.laeufer.cost * (1 + rule('schmiede').per))));
  assert.equal(G.supplyCap(), sup0 + rule('kaserne').per);
  assert.ok(G.unitCost('laeufer') < cost0);
});
test('Universität neben Fabrik: Forschung schneller', () => {
  const { G, rule } = game();
  G.buildAt(4, 'universitaet'); G.buildAt(1, 'fabrik'); G.buildAt(3, 'fabrik');
  assert.ok(G.startResearch('r_neuziehen'));
  G.tick(1);
  const a = G.S.research.active[0];
  assert.ok(Math.abs(a.t - 1 / (1 + 2 * rule('universitaet').per)) < 1e-9, `Fortschritt ${a.t}`);
});
test('Vorschau: was ein Gebäude an einem Platz erhielte und gäbe', () => {
  const { G, rule } = game();
  G.buildAt(1, 'fabrik'); G.buildAt(3, 'universitaet');
  const p = G.neighborPreview(0, 'fabrik');
  assert.equal(p.gets.n, 1); assert.ok(Math.abs(p.gets.value - rule('fabrik').per) < 1e-9);
  const toUni = p.gives.find(g => g.slot === 3), toFab = p.gives.find(g => g.slot === 1);
  assert.ok(toUni && toUni.delta < 0, 'Universität forscht schneller');
  assert.ok(toFab && Math.abs(toFab.delta - rule('fabrik').per) < 1e-9, 'Nachbarfabrik gewinnt');
});

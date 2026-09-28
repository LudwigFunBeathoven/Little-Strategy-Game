// Tests der Spiellogik (7.3): Erstattung, ruhende Upgrades, Freischaltung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG };
}

test('Erstattung = floor(Baukosten × REFUND_RATE): 200 → 100', () => {
  const { G, C } = game();
  G.S.slots[0] = { type: 'schmiede', paid: 200 };
  assert.equal(C.REFUND_RATE, 0.5);
  assert.equal(G.refundFor(0), 100);
  const before = G.S.material;
  assert.ok(G.demolish(0));
  assert.equal(G.S.material - before, 100);
  assert.equal(G.S.slots[0], null);
});

test('Erstattung rundet ab', () => {
  const { G } = game();
  G.S.slots[1] = { type: 'fabrik', paid: 41 };
  assert.equal(G.refundFor(1), 20);
});

test('Bei Spielstart sind 4 Typen für 3 Slots wählbar, Handelskontor gesperrt', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  const buildable = C.BUILDINGS.filter(b => G.buildBlock(0, b) === null);
  assert.equal(C.BUILDING_SLOTS, 3);
  assert.deepEqual(Array.from(buildable).sort(), ['fabrik', 'kaserne', 'schmiede', 'universitaet']);
  assert.equal(G.buildBlock(0, 'kontor'), 'locked');
  G.unlockBuilding('kontor');
  assert.equal(G.buildBlock(0, 'kontor'), null);
});

test('Je Typ höchstens ein Gebäude', () => {
  const { G } = game();
  G.S.material = 1e6;
  assert.ok(G.buildAt(0, 'fabrik'));
  assert.equal(G.buildBlock(1, 'fabrik'), 'standing');
  assert.equal(G.buildAt(1, 'fabrik'), false);
});

test('Schmiede bauen, Upgrade kaufen, abreißen: Effekt ruht; neu bauen: Effekt wieder aktiv ohne Nachkauf', () => {
  const { G } = game();
  G.S.material = 1e6;
  const base = G.dmgMultP();
  assert.ok(G.buildAt(0, 'schmiede'));
  assert.ok(G.buy('klingen'));
  const boosted = G.dmgMultP();
  assert.ok(boosted > base);
  assert.ok(G.demolish(0));
  assert.equal(G.dmgMultP(), base, 'Effekt muss nach Abriss ruhen');
  assert.equal(G.S.lvl.klingen, 1, 'gekaufte Stufe bleibt gespeichert');
  assert.equal(G.canBuy('klingen'), false, 'ohne Schmiede kein Kauf');
  assert.ok(G.buildAt(2, 'schmiede'));
  assert.equal(G.dmgMultP(), boosted, 'Effekt nach Neubau wieder aktiv');
  assert.equal(G.S.lvl.klingen, 1, 'kein Nachkauf nötig');
});

test('Preis richtet sich nach der Zahl stehender Gebäude, Abriss macht den Platz sofort frei', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  G.buildAt(0, 'fabrik'); G.buildAt(1, 'schmiede');
  assert.equal(G.nextSlotCost(), C.BUILD_COSTS[2]);
  G.demolish(0);
  assert.equal(G.nextSlotCost(), C.BUILD_COSTS[1]);
  assert.equal(G.buildBlock(0, 'kaserne'), null);
});

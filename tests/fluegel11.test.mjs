// Tests Kartenpfad Teil 11, REQ-K11.01: Nachbarschaftsboni der Flügel des Haupthauses.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(){
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, { pacing: 'karten' });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  return { G, C: core.KF_CONFIG };
}
const put = (G, type, ...ix) => { for (const i of ix) G.S.slots[i] = { type, paid: 0 }; G.S.slotVer++; };
const haus = (G, ...fl) => { G.S.haus.stufe = Math.max(2, fl.length + 1); G.S.haus.fluegel = fl; G.S.slotVer++; };
const pick = (G, id) => { G.S.draft.stacks[id] = 1; G.S.draft.ver++; };
const ZIEL = { schatzkammer: ['fabrik', 'nbFactoryYield', 0.10], bibliothek: ['fabrik', 'nbResearchTime', -0.05], zeughaus: ['kaserne', 'nbUnitHp', 0.10], kanzlei: ['alle', 'nbVariantCost', -0.15] };

test('K11.01: Die Boni sind Eigenschaften der Flügel in den Daten (Vorgabewerte)', () => {
  const { C } = game();
  for (const [id, [ziel, stat, wert]] of Object.entries(ZIEL)){ const nb = C.HAUPTHAUS.fluegel[id].nachbar; assert.deepEqual([nb.ziel, nb.stat, nb.wert, nb.max], [ziel, stat, wert, 2], id); }
});

test('K11.01: Schatzkammer: +10 % Ertrag je Manufaktur auf den angrenzenden Plätzen, höchstens zwei Gebäude, nie das Haupthaus', () => {
  const { G } = game(); put(G, 'fabrik', 1, 3, 5, 7); haus(G, 'schatzkammer');
  assert.deepEqual([...G.fluegelNachbarn('schatzkammer')], [1, 3]);
  assert.ok(Math.abs(G.neighborValue(1, 'fabrik') - 0.10) < 1e-9); assert.ok(Math.abs(G.neighborValue(3, 'fabrik') - 0.10) < 1e-9);
  assert.equal(G.neighborValue(5, 'fabrik'), 0); assert.equal(G.neighborValue(7, 'fabrik'), 0);
  assert.equal(G.flNb('nbFactoryYield', 4), 0, 'kein Bonus an das Haupthaus');
});

test('K11.01: Querverbindung erweitert den Kreis auf die Diagonalen, nicht die Grenze von zwei Gebäuden', () => {
  const { G } = game(); put(G, 'fabrik', 0, 2, 6, 8); haus(G, 'schatzkammer');
  assert.deepEqual([...G.fluegelNachbarn('schatzkammer')], [], 'ohne Querverbindung keine orthogonalen Nachbarn');
  pick(G, 'querverbindung');
  assert.deepEqual([...G.fluegelNachbarn('schatzkammer')], [0, 2]);
  put(G, 'fabrik', 1); assert.deepEqual([...G.fluegelNachbarn('schatzkammer')], [0, 1], 'höchstens zwei, in der Reihenfolge der Plätze');
});

test('K11.01: Bauordnung multipliziert den Bonus des Flügels wie alle Nachbarschaftsboni', () => {
  const { G } = game(); put(G, 'fabrik', 1); haus(G, 'schatzkammer');
  const v0 = G.neighborValue(1, 'fabrik'); pick(G, 'bauordnung');
  assert.ok(Math.abs(G.neighborValue(1, 'fabrik') - v0 * G.mMul('nbAll')) < 1e-9 && G.mMul('nbAll') > 1);
});

test('K11.01: Bibliothek verkürzt die Forschungszeit um 5 % je Manufaktur (höchstens zwei); Zeughaus gibt neuen Einheiten +10 % Lebenspunkte, wenn die Kaserne angrenzt', () => {
  const { G } = game(); put(G, 'fabrik', 1, 3, 5); haus(G, 'bibliothek');
  assert.ok(Math.abs(G.flNbTotal('nbResearchTime') + 0.10) < 1e-9);
  const hp0 = G.unitStats('p', 'laeufer').hp; put(G, 'kaserne', 7); haus(G, 'zeughaus');
  assert.equal(G.flNbTotal('nbResearchTime'), 0, 'Flügel gewechselt: kein Bibliotheksbonus');
  assert.ok(Math.abs(G.unitStats('p', 'laeufer').hp / hp0 - 1.10) < 1e-9);
  G.S.slots[7] = null; G.S.slotVer++; assert.equal(G.unitStats('p', 'laeufer').hp, hp0, 'Kaserne nicht angrenzend: kein Bonus');
});

test('K11.01: Kanzlei senkt Kosten und Dauer der Aufwertung auf angrenzenden Plätzen um 15 %, nicht beim ersetzten Gebäude (Universität) und nicht im Haupthaus', () => {
  const { G, C } = game(); put(G, 'fabrik', 1); put(G, 'universitaet', 3); put(G, 'fabrik', 0); haus(G, 'kanzlei');
  const vid = Object.keys(G.VAR).find(v => G.VAR[v].basis === 'fabrik' && !G.VAR[v].doktrin);
  const c0 = G.variantCost(vid), d0 = C.AUFWERTUNG.dauerS;
  assert.deepEqual([...G.fluegelNachbarn('kanzlei')], [1]);
  assert.equal(G.variantCost(vid, 1), Math.ceil(c0 * 0.85) || G.variantCost(vid, 1)); assert.ok(G.variantCost(vid, 1) < c0);
  assert.ok(Math.abs(G.variantDauer(1) - d0 * 0.85) < 1e-9);
  assert.equal(G.variantCost(vid, 0), c0, 'nicht angrenzend'); assert.equal(G.variantDauer(0), d0);
  assert.equal(G.flNb('nbVariantCost', 3), 0, 'Universität: ersetztes Gebäude');
});

test('K11.01: Gutshof (Stufe I, kein Flügel) gibt nichts; die zwei Flügel der Residenz wirken unabhängig voneinander', () => {
  const { G } = game(); put(G, 'fabrik', 1, 3);
  assert.equal(G.hausStufe(), 1); assert.equal(G.neighborValue(1, 'fabrik'), 0);
  haus(G, 'schatzkammer', 'bibliothek');
  assert.ok(Math.abs(G.neighborValue(1, 'fabrik') - 0.10) < 1e-9); assert.ok(Math.abs(G.flNbTotal('nbResearchTime') + 0.10) < 1e-9);
  assert.deepEqual([[...G.fluegelNachbarn('schatzkammer')], [...G.fluegelNachbarn('bibliothek')]], [[1, 3], [1, 3]], 'jeder Flügel hat seine eigenen zwei Gebäude');
});

test('K11.01: Ein neuer Flügel lässt sich allein über die Daten anlegen (ohne Codeänderung)', () => {
  const { G, C } = game(); C.HAUPTHAUS.fluegel.testfluegel = { ersetzt: 'schmiede', nachbar: { ziel: 'kaserne', stat: 'nbUnitHp', wert: 0.5, max: 1 } };
  put(G, 'kaserne', 5); haus(G, 'testfluegel');
  const hp0 = G.unitStats('e', 'laeufer').hp;
  assert.deepEqual([...G.fluegelNachbarn('testfluegel')], [5]);
  assert.ok(Math.abs(G.flNbTotal('nbUnitHp') - 0.5) < 1e-9);
  void hp0; delete C.HAUPTHAUS.fluegel.testfluegel;
});

test('K11.01: Im Modus standard wirken Flügel nie', () => {
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  assert.equal(G.flNbTotal('nbUnitHp'), 0); assert.deepEqual([...G.fluegelNachbarn('zeughaus')], []);
});

/* ---------- K11.02 Bot-Regeln ---------- */
import { Bot } from '../tools/sim-bot.mjs';
test('K11.02: Der Bot stellt das vom Flügel gestärkte Gebäude neben das Haupthaus, solange ein angrenzender Platz frei ist und die Grenze des Flügels nicht erreicht ist', () => {
  const { G } = game(); haus(G, 'schatzkammer');
  G.S.material = 1e7; const bot = new Bot({ strategy: 'zufall', seed: 1 });
  assert.deepEqual([...G.fluegelPlaetze('fabrik')], [1, 3, 5, 7]);
  assert.equal(bot.chooseSlot(G, 0, 'fabrik'), 1, 'trotz freiem Platz 0 neben das Haupthaus');
  assert.deepEqual([...G.fluegelPlaetze('kaserne')], [], 'die Schatzkammer stärkt keine Kaserne');
  put(G, 'fabrik', 1, 3);
  assert.deepEqual([...G.fluegelPlaetze('fabrik')], [], 'beide Plätze des Flügels sind belegt');
  assert.notEqual(G.S.slots[bot.chooseSlot(G, 0, 'fabrik')], undefined);
  haus(G, 'schatzkammer', 'zeughaus');
  assert.ok(G.fluegelPlaetze('kaserne').length > 0);
  assert.equal(bot.chooseSlot(G, 0, 'kaserne'), G.fluegelPlaetze('kaserne')[0]);
});

test('K11.02: Der Schalter fluegel legt den ersten Flügel fest', () => {
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, { pacing: 'karten', fluegel: 'kanzlei' });
  G.S.haus.stufe = 2;
  assert.equal(G.fluegelBlock('zeughaus'), 'forced'); assert.equal(G.fluegelBlock('kanzlei'), null);
  const H = core.KlammerCore.create(); H.FX.on = false; H.newGame('normal', 7, { pacing: 'karten' }); H.S.haus.stufe = 2;
  assert.equal(H.fluegelBlock('zeughaus'), null, 'ohne Schalter frei');
});

// Tests Kartenpfad Teil 7, REQ-K7.10 (zweites Exemplar von Kaserne und Universität) und K7.11 (Gegenstöße der Doktrin Ausfall mit doppeltem Schaden an der Basis).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7){
  const core = loadCore();
  const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: core.KF_CONFIG };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type} auf ${i}: ${G.buildBlock(i, type)}`); };
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };

test('K7.10: Kaserne und Universität zweimal baubar (das zweite Exemplar teurer), Schmiede und Kontor einmal; Modus standard je einmal', () => {
  const { G, C } = game();
  for (const [type, i] of [['kaserne', 0], ['universitaet', 1], ['schmiede', 2], ['kontor', 3]]) place(G, type, i);
  const c1 = Math.ceil(C.BUILDING_COST.kaserne * C.ZWEITES.kaserne.kostenFaktor);
  assert.equal(G.buildCost('kaserne'), c1); assert.equal(G.buildBlock(5, 'kaserne'), null); assert.equal(G.buildBlock(5, 'universitaet'), null);
  assert.equal(G.buildBlock(5, 'schmiede'), 'standing'); assert.equal(G.buildBlock(5, 'kontor'), 'standing');
  place(G, 'kaserne', 5); place(G, 'universitaet', 6);
  assert.equal(G.buildBlock(7, 'kaserne'), 'standing', 'kein drittes Exemplar'); assert.equal(G.buildBlock(7, 'universitaet'), 'standing');
  const { G: S } = game('standard'); S.build('kaserne'); assert.equal(S.buildBlock(1, 'kaserne'), 'standing');
});

test('K7.10: Zweite Kaserne: +1 Läufer je Welle (ohne Versorgung) und eigene Quartiere-Stufen', () => {
  const { G, C } = game(); place(G, 'kaserne', 0);
  assert.equal(G.isAvailable('ausbau2'), false, 'ohne zweite Kaserne keine eigenen Quartiere');
  const cap1 = G.supplyCap();
  G.S.queue = [{ type: 'laeufer' }]; G.S.nextOwnWave = G.S.t; idle(G); G.tick(0.05);
  const one = G.S.units.filter(u => u.side === 'p').length;
  place(G, 'kaserne', 1); assert.ok(G.zweiteSteht('kaserne')); assert.equal(G.supplyCap(), cap1, 'das Gebäude selbst hebt die Versorgung nicht');
  G.S.units = []; G.S.forms = []; G.S.queue = [{ type: 'laeufer' }]; G.S.nextOwnWave = G.S.t; idle(G); G.tick(0.05);
  assert.equal(G.S.units.filter(u => u.side === 'p').length, one + C.ZWEITES.kaserne.laeufer, 'ein Läufer mehr je Welle');
  assert.ok(G.isAvailable('ausbau2')); G.S.material = 1e7; assert.ok(G.buy('ausbau2'));
  assert.equal(G.supplyCap(), cap1 + C.KASERNE_SUPPLY_PER_LEVEL, 'Quartiere der zweiten Kaserne');
  assert.ok(G.buy('ausbau')); assert.equal(G.supplyCap(), cap1 + 2 * C.KASERNE_SUPPLY_PER_LEVEL, 'beide Quartiere zählen');
  G.demolish(1); assert.equal(G.supplyCap(), cap1 + C.KASERNE_SUPPLY_PER_LEVEL, 'ohne zweite Kaserne wirken ihre Quartiere nicht'); assert.equal(G.isAvailable('ausbau2'), false);
});

test('K7.10: Zweite Universität: ein weiterer Forschungsplatz', () => {
  const { G } = game(); place(G, 'universitaet', 0);
  assert.equal(G.researchSlots(), 1);
  place(G, 'universitaet', 1); assert.equal(G.researchSlots(), 2);
  const free = G.RESEARCH.filter(r => r.branch !== 'pfad' && G.researchBlock(r.id) === null).slice(0, 2); assert.equal(free.length, 2);
  G.S.material = 1e7; assert.ok(G.startResearch(free[0].id)); assert.ok(G.startResearch(free[1].id));
  assert.ok(G.S.research.active.every(a => !a.bib), 'beide in Universitäten');
  G.demolish(1); assert.equal(G.researchSlots(), 1);
});

test('K7.11: Gegenstöße der Doktrin Ausfall richten doppelten Schaden an der gegnerischen Basis an', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); pick(G, 'ausfall');
  assert.equal(G.mMul('counterBaseDmg'), 2);
  G.S.queue = [{ type: 'laeufer' }];
  // Gegenstoß nach einer vollständig abgewehrten Welle: die Einheiten tragen den Faktor
  G.S.waveSize[1] = 1; G.S.stats.wavesRepelled = 0;
  const e = G.addFormation('e', 1, ['laeufer'], 500); const u = G.S.units.find(x => x.form === e.id); u.wave = 1; u.hp = 0;
  idle(G); G.tick(0.05);
  const counter = G.S.units.filter(x => x.side === 'p');
  assert.ok(counter.length >= 1 && counter.every(x => x.baseMult === 2), `Gegenstoß mit Faktor 2: ${JSON.stringify(counter.map(x => x.baseMult))}`);
  assert.equal(G.S.stats.counterWaves, 1);
});

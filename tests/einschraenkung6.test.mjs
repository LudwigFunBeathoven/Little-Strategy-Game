// Tests Kartenpfad Teil 6, REQ-K6.01: Die Einschränkung einer Doktrin gilt ab der Wahl, auch für den Bestand (Zunfthaus-Fehler).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';
import { loadI18n } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type} auf ${i}: ${G.buildBlock(i, type)}`); };
/* Wahl über den Weg des Spiels (offene Wahl, chooseDraft): nach diesem Aufruf ist kein Takt vergangen */
const choose = (G, id) => { G.S.pendingDraft = { level: 1, options: [id], rerolled: 0 }; G.S.pendingLevels = 1; assert.ok(G.chooseDraft(0), id); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };

test('K6.01, K7.05: Mit fünf Fabriken (Residenz) senkt die Zunftordnung die Grenze auf vier; das Zunfthaus ist erst nach dem Abriss auf vier baubar', () => {
  const { G } = game(); G.S.t = 200; G.S.haus.stufe = 3;                         // Teil 7: Residenz, Obergrenze 5
  for (const i of [0, 1, 2, 3, 5]) place(G, 'fabrik', i);
  assert.equal(G.countType('fabrik'), 5);
  assert.ok(!G.variantsOf('fabrik').some(v => v.id === 'zunfthaus'), 'ohne Doktrin gibt es den Sonderbau nicht');
  choose(G, 'zunftordnung');
  assert.equal(G.fabrikGrenze(), 4);
  assert.equal(G.variantExcess('zunfthaus'), 1);
  assert.equal(G.variantBlock(0, 'zunfthaus'), 'excess');
  G.S.material = 1e7;
  assert.equal(G.upgradeBuilding(0, 'zunfthaus'), false, 'die Aufwertung bleibt gesperrt');
  assert.equal(G.S.slots[0].upg, undefined);
  G.demolish(5);
  assert.equal(G.countType('fabrik'), 4);
  assert.equal(G.variantBlock(0, 'zunfthaus'), null, 'bei vier Fabriken frei');
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(0, 'zunfthaus'));
  finish(G); assert.equal(G.S.slots[0].variant, 'zunfthaus');
});

test('K6.01, K7.05: neue Fabriken über der gesenkten Grenze sind gesperrt; Zunfthäuser zählen mit; andere Gebäude bleiben baubar', () => {
  const { G, C } = game(); G.S.t = 200; G.S.haus.stufe = 3;
  for (const i of [0, 1, 2, 3, 5]) place(G, 'fabrik', i);
  choose(G, 'zunftordnung');
  assert.equal(G.buildBlock(6, 'fabrik'), 'fabrikGrenze'); assert.equal(G.buildAt(6, 'fabrik'), false);
  assert.equal(G.buildBlock(6, 'kontor'), null);
  G.demolish(5);
  assert.equal(G.buildBlock(5, 'fabrik'), 'fabrikGrenze', 'bei vier Plätzen ist die Grenze erreicht');
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(0, 'zunfthaus')); finish(G);
  assert.equal(G.countType('fabrik'), 4, 'ein Zunfthaus ist ein Fabrikplatz');
  assert.equal(G.buildBlock(5, 'fabrik'), 'fabrikGrenze');
  assert.ok(C.DOKTRIN.zunfthaus.nachbarFaktor > 1);
});

test('K6.01: Erklärzeile „Reiße zuerst N Fabriken ab.“ in beiden Sprachen', () => {
  const I = loadI18n();
  for (const lang of ['de', 'en']) for (const k of ['variant.reason.excess', 'variant.reason.excess.one']) assert.ok(I[lang][k], `${lang}: ${k}`);
  assert.match(I.de['variant.reason.excess'], /Reiße zuerst \{n\} Manufakturen ab\./);       // Teil 7: Fabrik heißt im Modus karten Manufaktur
  assert.ok(I.de['variant.reason.excess'].includes('{n}') && I.en['variant.reason.excess'].includes('{n}'));
});

test('K6.01: Bollwerk senkt den Fabrikertrag im selben Takt wie die Wahl, auch für schon stehende Fabriken', () => {
  const { G } = game(); G.S.haus.stufe = 3;
  for (const i of [0, 1, 2, 3, 5]) place(G, 'fabrik', i);
  const r0 = G.matRate(); assert.ok(r0 > 0);
  choose(G, 'bollwerk');
  assert.ok(Math.abs(G.matRate() / r0 - 0.85) < 1e-9, `Ertrag ${G.matRate()} gegen ${r0 * 0.85}`);
});

test('K6.01: Stiftung (Einheitenkosten), Vorstoß (Turmfeuerrate), Ausfall (Reparatur) und Stehendes Heer (Unterhalt) gelten im selben Takt', () => {
  { const { G } = game(); const c0 = G.unitCost('laeufer'); choose(G, 'stiftung'); assert.ok(Math.abs(G.unitCost('laeufer') / c0 - 1.2) < 0.06, `Kosten ${G.unitCost('laeufer')} gegen ${c0}`); }
  { const { G } = game(); const cd0 = G.turretCd(0); choose(G, 'vorstoss'); assert.ok(Math.abs(G.turretCd(0) / cd0 - 1.3) < 1e-9); }
  { const { G } = game(); const r0 = G.repairCost(); choose(G, 'ausfall'); assert.equal(G.repairCost(), r0 * 2); }
  { const { G } = game(); place(G, 'kaserne', 0); G.addFormation('p', 1, ['laeufer', 'laeufer', 'laeufer'], 300);
    assert.equal(G.upkeepRate(), 0); choose(G, 'stehendesHeer'); assert.ok(Math.abs(G.upkeepRate() - 3 / 60) < 1e-9, `Unterhalt ${G.upkeepRate()}`); }
});

test('K6.01: Im Modus standard gibt es weder Doktrin noch Grenze', () => {
  const { G } = game('standard'); for (let i = 0; i < 9; i++) place(G, 'fabrik', i);
  assert.equal(G.variantExcess('zunfthaus'), 0); assert.equal(G.doctrineExcess(G.DOK.zunftordnung), 0, 'ohne Haupthaus keine Grenze (Teil 7)'); assert.equal(G.S.haus, null);
  assert.equal(G.buildBlock(0, 'fabrik'), 'occupied');
});

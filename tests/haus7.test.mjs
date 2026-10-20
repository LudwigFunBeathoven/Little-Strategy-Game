// Tests Kartenpfad Teil 7, REQ-K7.02 und K7.04: Haupthaus im Mittelfeld, Obergrenze für Fabriken.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7){
  const core = loadCore();
  const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: core.KF_CONFIG, core };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type} auf ${i}: ${G.buildBlock(i, type)}`); };
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };

test('K7.02: Das Mittelfeld ist ab Start mit dem Haupthaus (Stufe I) belegt; acht Plätze bleiben frei; Modus standard ohne Haupthaus', () => {
  const { G, C } = game();
  assert.equal(C.HAUPTHAUS.platz, 4);
  assert.equal(G.S.slots[4].type, 'haupthaus'); assert.ok(G.S.slots[4].fixed);
  assert.equal(G.hausStufe(), 1);
  assert.equal(G.S.slots.filter(x => !x).length, 8);
  for (const type of C.BUILDINGS) assert.equal(G.buildBlock(4, type), 'occupied', type);
  const s = game('standard').G;
  assert.equal(s.S.haus, null); assert.ok(s.S.slots.every(x => !x)); assert.equal(s.hausStufe(), 0); assert.equal(s.fabrikGrenze(), Infinity);
});

test('K7.02: Das Haupthaus lässt sich nicht abreißen und nicht aufwerten', () => {
  const { G } = game(); G.S.t = 400;
  assert.equal(G.demolish(4), false);
  assert.equal(G.S.slots[4].type, 'haupthaus');
  assert.equal(G.variantsFor(4).length, 0);
  for (const v of G.VARIANTS) assert.notEqual(G.variantBlock(4, v.id), null, v.id);
  assert.equal(G.refundFor(4), 0);
});

test('K7.02: Das Haupthaus gibt und erhält keine Nachbarschaftsboni, auch nicht diagonal (Querverbindung)', () => {
  const { G, core } = game();
  for (const r of core.KF_NEIGHBORS){ assert.notEqual(r.building, 'haupthaus'); assert.notEqual(r.with, 'haupthaus'); }
  for (const type of ['fabrik', 'kaserne', 'schmiede', 'universitaet', 'kontor']){
    const p = G.neighborPreview(1, type);
    assert.ok(!p.gives.some(g => g.slot === 4), `${type}: gibt dem Haupthaus nichts`);
    assert.equal(p.gets ? p.gets.n : 0, 0, `${type} neben dem Haupthaus erhält nichts`);
  }
  place(G, 'fabrik', 1); place(G, 'fabrik', 3);
  assert.equal(G.neighborCount(1, 'fabrik'), 0); assert.equal(G.neighborCount(3, 'fabrik'), 0);
  pick(G, 'querverbindung');                                                       // diagonal: 1 und 3 sind Nachbarn über die Ecke, das Haupthaus zählt weiter nicht
  assert.equal(G.neighborCount(1, 'fabrik'), 1);
  assert.equal(G.neighborValue(4, 'haupthaus'), 0);
});

test('K7.04: Obergrenze 3/4/5 Fabrikplätze je Stufe; jede Form aus einer Fabrik zählt (Variante, Sonderbau, laufende Aufwertung)', () => {
  const { G, C } = game(); G.S.t = 400;
  assert.equal(JSON.stringify(C.HAUPTHAUS.fabrikGrenze), '[3,4,5]');
  for (const i of [0, 1, 2]) place(G, 'fabrik', i);
  assert.equal(G.fabrikPlaetze(), 3); assert.equal(G.fabrikGrenze(), 3);
  assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze'); assert.equal(G.buildAt(3, 'fabrik'), false);
  for (const type of ['kaserne', 'schmiede', 'universitaet', 'kontor']) assert.equal(G.buildBlock(3, type), null, `${type} bleibt baubar`);
  // Variante und laufende Aufwertung belegen weiter einen Fabrikplatz
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'während der Aufwertung');
  finish(G); assert.equal(G.S.slots[0].variant, 'manufaktur'); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'Variante');
  // Sonderbau (Bastion der Doktrin Bollwerk)
  pick(G, 'bollwerk'); G.S.material = 1e7; assert.ok(G.upgradeBuilding(1, 'bastion')); finish(G);
  assert.equal(G.S.slots[1].variant, 'bastion'); assert.equal(G.fabrikPlaetze(), 3); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'Sonderbau');
  // Stufe II und III heben die Grenze; Abriss gibt einen Platz frei
  G.S.haus.stufe = 2; assert.equal(G.fabrikGrenze(), 4); place(G, 'fabrik', 3); assert.equal(G.buildBlock(5, 'fabrik'), 'fabrikGrenze');
  G.S.haus.stufe = 3; assert.equal(G.fabrikGrenze(), 5); place(G, 'fabrik', 5); assert.equal(G.buildBlock(6, 'fabrik'), 'fabrikGrenze');
  G.demolish(5); assert.equal(G.buildBlock(5, 'fabrik'), null);
});

test('K7.04: Die Automatik (Karte „Fließband“) und Bots können die Grenze nicht umgehen; Spielstand behält das Haupthaus', () => {
  const { G, core } = game();
  for (const i of [0, 1, 2]) place(G, 'fabrik', i);
  assert.equal(G.build('fabrik'), false, 'build() nutzt dieselbe Prüfung');
  const snap = JSON.parse(JSON.stringify(G.snapshot()));
  const H = core.KlammerCore.create(); H.FX.on = false; H.adopt(snap);
  assert.equal(H.S.slots[4].type, 'haupthaus'); assert.equal(H.hausStufe(), 1); assert.equal(H.buildBlock(3, 'fabrik'), 'fabrikGrenze');
  assert.equal(core.KlammerCore.SAVE_VERSION, 12); assert.match(core.KF_CONFIG.SAVE_KEY, /v12$/);
});

test('K7.02, K7.04: Texte in beiden Sprachen (Reiter, Stufen, Grenze, Erklärzeile)', () => {
  const I = loadI18n();
  const keys = ['tab.haus', 'ex.tab.haus', 'tip.tab.haus', 'bld.haupthaus.name', 'bld.haupthaus.desc', 'haus.grenze', 'fab.stat.grenze', 'fx.haupthaus',
    ...[1, 2, 3].flatMap(n => [`haus.stufe.${n}.name`, `haus.stufe.${n}.desc`, `build.reason.fabrikGrenze.${n}`])];
  for (const lang of ['de', 'en']) for (const k of keys) assert.ok(I[lang][k], `${lang}: ${k}`);
  assert.equal(I.de['haus.stufe.1.name'], 'Gutshof'); assert.equal(I.de['haus.stufe.2.name'], 'Rathaus'); assert.equal(I.de['haus.stufe.3.name'], 'Residenz');
  assert.equal(I.en['haus.stufe.1.name'], 'Manor'); assert.equal(I.en['haus.stufe.2.name'], 'Town Hall'); assert.equal(I.en['haus.stufe.3.name'], 'Residence');
  assert.equal(I.de['build.reason.fabrikGrenze.1'].replace('{n}', '3'), 'Höchstens 3 Fabriken, mehr mit Stadtrecht.');
});

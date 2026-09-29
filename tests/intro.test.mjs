// Tests Iteration 4, REQ-47: Gestaffelte Einführung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(opts = { intro: true }){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, opts);
  return { G, C: KF_CONFIG };
}

test('Zu Beginn: Presse, Fabrik und Einheiten; Wellenleiste, Karten und Verstärkungsgebäude noch nicht', () => {
  const { G } = game();
  G.S.material = 1e6;
  assert.equal(G.buildBlock(0, 'fabrik'), null);
  for (const t of ['schmiede', 'kaserne', 'universitaet']) assert.equal(G.buildBlock(0, t), 'hidden', t);
  assert.equal(G.introShows('waves'), false);
  assert.equal(G.introShows('cards'), false);
  assert.equal(G.introShows('siege'), false);
  assert.ok(G.spawn('laeufer'), 'Einheiten sofort');
});

test('Reihenfolge: Wellenleiste mit der ersten Welle, Karten mit Stufe 1, Gebäude ab Stufe 2, Belagerung 60 s vorher', () => {
  const { G, C } = game();
  while (G.S.waveNo === 0 && G.S.ownWaveNo === 0) G.tick(0.05);
  assert.ok(G.introShows('waves'));
  G.S.level = 1; assert.ok(G.introShows('cards')); assert.equal(G.introShows('buildings'), false);
  G.S.level = C.INTRO_BUILDINGS_LEVEL; G.S.material = 1e6;
  assert.equal(G.buildBlock(0, 'schmiede'), null);
  G.S.t = G.S.siegeWaveT - C.SIEGE_WARNING_S - 1; G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.enemyBaseHp = 1e9;
  G.tick(0.05); assert.equal(G.introShows('siege'), false);
  for (let i = 0; i < 40; i++) G.tick(0.05);
  assert.ok(G.introShows('siege'));
});

test('Einführung überspringen: alle Systeme sofort sichtbar und baubar', () => {
  const { G } = game({ intro: false });
  G.S.material = 1e6;
  for (const sys of ['waves', 'cards', 'buildings']) assert.ok(G.introShows(sys), sys);
  for (const t of ['schmiede', 'kaserne', 'universitaet']) assert.equal(G.buildBlock(0, t), null, t);
});

test('Einführung bleibt im Spielstand erhalten', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3, { intro: false });
  const snap = JSON.parse(JSON.stringify(G.S));
  const H = KlammerCore.create(); H.adopt(snap);
  assert.equal(H.S.intro, false);
});

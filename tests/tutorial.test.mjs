// Tests Tutorial, REQ-T.01, T.04, T.06: Schrittlogik ohne Browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadI18n } from '../tools/load-core.mjs';

function load(){
  const ctx = { JSON, Number }; vm.createContext(ctx);
  for (const f of ['data/tutorial-steps.js', 'tutorial.js']) vm.runInContext(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx);
  vm.runInContext('globalThis.__o = { KF_TUTORIAL, KF_TUTORIAL_STEPS };', ctx);
  return ctx.__o;
}
const memoryStorage = () => { const m = new Map(); return { get: k => m.has(k) ? m.get(k) : null, set: (k, v) => m.set(k, v), m }; };
const plain = o => JSON.parse(JSON.stringify(o));
function tut(storage = memoryStorage()){
  const { KF_TUTORIAL, KF_TUTORIAL_STEPS } = load();
  return { T: KF_TUTORIAL.create(KF_TUTORIAL_STEPS, storage, 'kf.tut'), steps: KF_TUTORIAL_STEPS, storage };
}
const click = (T, n = 10, t = 1) => { for (let i = 0; i < n; i++) T.event('materialProduced', { n: 1, source: 'click' }, t); };
const view = T => plain(T.view());

test('Fünf Schritte in der Reihenfolge Fertigen, Bauen, Einheiten kaufen, Welle ausschicken, Sieg', () => {
  const { T, steps } = tut();
  assert.deepEqual([...steps.map(s => s.id)], ['fertigen', 'bauen', 'rekrutieren', 'ausruecken', 'sieg']);
  assert.ok(steps.length <= 5, 'höchstens fünf Dinge (Grundsatz 5)');
  T.start();
  assert.equal(T.view().step.id, 'fertigen');
  click(T, 9); assert.equal(T.view().step.id, 'fertigen', '9 Material genügen nicht');
  click(T, 1, 12); assert.equal(T.view().step.id, 'bauen');
  T.event('buildingBuilt', { type: 'fabrik', slot: 0 }, 20);
  assert.equal(T.view().step.id, 'rekrutieren');
  T.event('unitBought', { type: 'laeufer' }, 25); T.event('unitBought', { type: 'laeufer' }, 26);
  assert.equal(T.view().step.id, 'rekrutieren');
  T.event('unitBought', { type: 'werfer' }, 27);
  assert.equal(T.view().step.id, 'ausruecken');
  T.event('waveDeparted', { side: 'e', size: 2 }, 28);
  assert.equal(T.view().step.id, 'ausruecken', 'eine gegnerische Welle zählt nicht');
  T.event('waveDeparted', { side: 'p', size: 3 }, 30);
  assert.equal(T.view().phase, 'wait', 'bis zum Sieg keine Zeile');
  assert.equal(T.view().step.id, 'sieg');
  T.event('enemyWaveDefeated', { waveNo: 1 }, 50);
  assert.equal(T.view().phase, 'farewell');
  assert.equal(T.end('completed'), true);
  assert.equal(T.view().phase, 'off');
  assert.deepEqual(plain(T.data().stepTimes), { fertigen: 12, bauen: 20, rekrutieren: 27, ausruecken: 30, sieg: 50 });
  assert.equal(T.data().completed, true);
});

test('Reihenfolge vertauscht: Fabrik zuerst, dann fertigen – Schritt 2 gilt als erledigt, Schritt 1 läuft weiter', () => {
  const { T } = tut();
  T.start();
  T.event('buildingBuilt', { type: 'fabrik', slot: 0 }, 3);
  assert.equal(T.view().step.id, 'fertigen', 'Schritt 1 läuft weiter');
  assert.equal(T.isDone('bauen'), true);
  click(T, 10, 8);
  assert.equal(T.view().step.id, 'rekrutieren', 'Schritt 2 wird übersprungen');
});

test('Zähler laufen unabhängig vom aktuellen Schritt weiter (nichts sperren)', () => {
  const { T } = tut();
  T.start();
  for (let i = 0; i < 3; i++) T.event('unitBought', { type: 'laeufer' }, 5);
  T.event('waveDeparted', { side: 'p', size: 3 }, 6);
  assert.deepEqual(['rekrutieren', 'ausruecken'].map(id => T.isDone(id)), [true, true]);
  assert.equal(T.view().step.id, 'fertigen');
});

test('Vorführung der Figur zählt nicht als Fortschritt', () => {
  const { T } = tut();
  T.start();
  T.silently(() => T.event('materialProduced', { n: 1, source: 'click' }, 1));
  assert.equal(T.progress('fertigen'), 0);
  T.event('materialProduced', { n: 1, source: 'auto' }, 1);
  assert.equal(T.progress('fertigen'), 0, 'automatische Produktion zählt nicht');
  click(T, 1);
  assert.equal(T.progress('fertigen'), 1);
});

test('Ohne gestartetes Tutorial passiert nichts', () => {
  const { T } = tut();
  click(T, 20);
  assert.equal(T.view().phase, 'off');
  assert.equal(T.progress('fertigen'), 0);
});

test('Überspringen beendet das Tutorial in jedem Schritt und merkt den Schritt', () => {
  for (const [events, at] of [[[], 'fertigen'], [[['buildingBuilt', { type: 'fabrik' }]], 'fertigen'], [[['unitBought', {}], ['unitBought', {}], ['unitBought', {}]], 'fertigen']]){
    const { T } = tut(); T.start(); for (const [n, d] of events) T.event(n, d, 1);
    assert.equal(T.skip(), true);
    assert.equal(T.view().phase, 'off'); assert.equal(T.active(), false);
    assert.equal(T.data().skipped, true); assert.equal(T.data().skippedAt, at);
    assert.equal(T.skip(), false, 'zweites Mal ohne Wirkung');
  }
  const { T } = tut(); T.start(); click(T); T.event('buildingBuilt', {}, 1); for (let i = 0; i < 3; i++) T.event('unitBought', {}, 1); T.event('waveDeparted', { side: 'p' }, 1);
  T.skip(); assert.equal(T.data().skippedAt, 'sieg');
});

test('Fehlklicks zählen je Schritt', () => {
  const { T } = tut(); T.start();
  T.misclick(); T.misclick(); click(T); T.misclick();
  assert.deepEqual(plain(T.data().misclicks), { fertigen: 2, bauen: 1 });
});

test('Start: erste Partie eines Browsers; ?tutorial=1 erzwingt, ?tutorial=0 unterdrückt', () => {
  const { T, storage } = tut();
  assert.equal(T.due(null), true);
  T.start();
  assert.equal(storage.m.get('kf.tut'), 'started');
  const again = tut(storage).T;
  assert.equal(again.due(null), false, 'zweite Partie im selben Browser: kein Tutorial');
  assert.equal(again.due('1'), true);
  assert.equal(tut().T.due('0'), false);
  T.skip(); assert.equal(storage.m.get('kf.tut'), 'skipped');
});

test('Ohne Speicher startet das Tutorial jedes Mal; kaputter Speicher bricht nichts', () => {
  const broken = { get(){ throw new Error('blockiert'); }, set(){ throw new Error('blockiert'); } };
  const { T } = tut(broken);
  assert.equal(T.due(null), true);
  T.start(); assert.equal(T.active(), true);
  T.skip(); assert.equal(T.active(), false);
  assert.equal(tut(broken).T.due(null), true, 'jedes Mal');
});

test('Zustand überlebt Speichern und Laden mitten im Tutorial', () => {
  const { T } = tut(); T.start(); click(T, 4, 3); T.markDemoShown('fertigen'); T.misclick();
  const snap = T.snapshot();
  const { T: U } = tut(); U.restore(JSON.parse(JSON.stringify(snap)));
  assert.equal(U.active(), true); assert.equal(U.progress('fertigen'), 4); assert.equal(U.demoShown('fertigen'), true);
  click(U, 6, 9); assert.equal(U.view().step.id, 'bauen');
  const junk = tut().T; junk.restore('kaputt'); assert.equal(junk.active(), false);
  junk.restore({ active: true, done: null }); assert.equal(junk.view().step.id, 'fertigen');
});

test('Schritte: Texte in de und en, eine Zeile von höchstens etwa 60 Zeichen, bekannte Ereignisse und Ziele', () => {
  const I = loadI18n(), { steps } = tut();
  const events = ['materialProduced', 'buildingBuilt', 'unitBought', 'waveDeparted', 'enemyWaveDefeated'];
  assert.equal(new Set(steps.map(s => s.id)).size, steps.length, 'Kennungen eindeutig');
  for (const s of steps){
    assert.ok(events.includes(s.on), `${s.id}: Ereignis ${s.on}`);
    assert.ok(s.need > 0, `${s.id}: Schwellenwert`);
    assert.ok(['click', 'plot', 'units', 'waves', null].includes(s.target), `${s.id}: Ziel`);
    for (const l of ['de', 'en']){
      const txt = I[l][s.textKey];
      assert.ok(txt, `${s.textKey} fehlt in ${l}`);
      assert.ok(txt.length <= 60, `${s.textKey} (${l}) hat ${txt.length} Zeichen`);
    }
  }
});

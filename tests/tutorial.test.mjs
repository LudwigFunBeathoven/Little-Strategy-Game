// Tests Tutorial, REQ-T.01, T.04, T.06, T2.02 – T2.05: Schrittlogik ohne Browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadI18n } from '../tools/load-core.mjs';

function load(){
  const ctx = { JSON, Number }; vm.createContext(ctx);
  for (const f of ['data/tutorial-steps.js', 'tutorial.js']) vm.runInContext(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx);
  vm.runInContext('globalThis.__o = { KF_TUTORIAL, KF_TUTORIAL_STEPS, KF_TUTORIAL_GREETING, KF_TUTORIAL_FAREWELL };', ctx);
  return ctx.__o;
}
const memoryStorage = () => { const m = new Map(); return { get: k => m.has(k) ? m.get(k) : null, set: (k, v) => m.set(k, v), m }; };
const plain = o => JSON.parse(JSON.stringify(o));
function tut(storage = memoryStorage()){
  const { KF_TUTORIAL, KF_TUTORIAL_STEPS, KF_TUTORIAL_GREETING, KF_TUTORIAL_FAREWELL } = load();
  return { T: KF_TUTORIAL.create(KF_TUTORIAL_STEPS, storage, 'kf.tut', { greeting: KF_TUTORIAL_GREETING, farewell: KF_TUTORIAL_FAREWELL }),
           steps: KF_TUTORIAL_STEPS, greeting: [...KF_TUTORIAL_GREETING], farewell: [...KF_TUTORIAL_FAREWELL], storage };
}
/* gestartet, Begrüßung übersprungen: die Schritte lassen sich direkt prüfen */
const started = storage => { const x = tut(storage); x.T.start(); x.T.endGreeting(); return x; };
const click = (T, n = 10, t = 1) => { for (let i = 0; i < n; i++) T.event('materialProduced', { n: 1, source: 'click' }, t); };

test('Fünf Dinge: Klicken, Fabrik, Armee, Welle, Karte; dazwischen der Kampf ohne Sprechblase', () => {
  const { T, steps } = started();
  assert.deepEqual([...steps.map(s => s.id)], ['fertigen', 'bauen', 'rekrutieren', 'ausruecken', 'schlacht', 'karte']);
  assert.equal(steps.filter(s => !s.silent).length, 5, 'höchstens fünf Dinge (Grundsatz 5)');
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
  assert.equal(T.view().phase, 'wait', 'bis die erste Gegnerwelle besiegt ist, keine Sprechblase');
  T.event('enemyWaveDefeated', { waveNo: 1 }, 50);
  assert.equal(T.view().phase, 'step'); assert.equal(T.view().step.id, 'karte');
  T.event('cardChosen', { id: 'x' }, 55);
  assert.equal(T.view().phase, 'farewell'); assert.equal(T.view().index, 0);
  T.advanceFarewell(); assert.equal(T.view().index, 1);
  T.advanceFarewell(); assert.equal(T.view().phase, 'leaving');
  assert.equal(T.end('completed'), true);
  assert.equal(T.view().phase, 'off');
  assert.deepEqual(plain(T.data().stepTimes), { fertigen: 12, bauen: 20, rekrutieren: 27, ausruecken: 30, schlacht: 50, karte: 55 });
  assert.equal(T.data().completed, true);
});

test('Fällt die erste Welle nicht, bleibt das Tutorial im Schritt „Welle“/Kampf, bis eine Gegnerwelle besiegt ist', () => {
  const { T } = started();
  click(T); T.event('buildingBuilt', {}, 2); for (let i = 0; i < 3; i++) T.event('unitBought', {}, 3); T.event('waveDeparted', { side: 'p' }, 4);
  for (let t = 5; t < 400; t += 10) T.event('waveDeparted', { side: 'e', size: 3 }, t);
  assert.equal(T.view().phase, 'wait');
  assert.equal(T.isDone('karte'), false);
  T.event('enemyWaveDefeated', {}, 500);
  assert.equal(T.view().step.id, 'karte');
});

test('Begrüßung: zwei Sprechblasen, Klick oder Zeit zeigt die nächste; Klick auf Fertigen beendet sie', () => {
  const { T, greeting } = tut();
  T.start();
  assert.equal(greeting.length, 2);
  assert.deepEqual(plain(T.view()), { phase: 'greet', index: 0, textKey: greeting[0] });
  T.advanceGreeting();
  assert.equal(T.view().textKey, greeting[1]);
  T.advanceGreeting();
  assert.equal(T.view().phase, 'step'); assert.equal(T.view().step.id, 'fertigen');
  const b = tut().T; b.start();
  b.event('materialProduced', { n: 1, source: 'auto' }, 1); assert.equal(b.view().phase, 'greet', 'automatische Produktion beendet die Begrüßung nicht');
  b.event('materialProduced', { n: 1, source: 'click' }, 2);
  assert.equal(b.view().phase, 'step', 'Klick auf Fertigen beendet die Begrüßung'); assert.equal(b.progress('fertigen'), 1, 'Schritt 1 gilt als begonnen');
  const c = tut().T; c.start(); c.event('buildingBuilt', {}, 1);
  assert.equal(c.view().phase, 'step', 'ein erledigter Schritt beendet sie ebenfalls');
});

test('Reihenfolge vertauscht: Fabrik zuerst, dann fertigen – Schritt 2 gilt als erledigt, seine Sprechblase entfällt', () => {
  const { T } = started();
  T.event('buildingBuilt', { type: 'fabrik', slot: 0 }, 3);
  assert.equal(T.view().step.id, 'fertigen', 'Schritt 1 läuft weiter');
  assert.equal(T.isDone('bauen'), true);
  click(T, 10, 8);
  assert.equal(T.view().step.id, 'rekrutieren', 'Schritt 2 wird übersprungen, seine Erzählung nicht nachgeholt');
});

test('Zähler laufen unabhängig vom aktuellen Schritt weiter (nichts sperren)', () => {
  const { T } = started();
  for (let i = 0; i < 3; i++) T.event('unitBought', { type: 'laeufer' }, 5);
  T.event('waveDeparted', { side: 'p', size: 3 }, 6);
  assert.deepEqual(['rekrutieren', 'ausruecken'].map(id => T.isDone(id)), [true, true]);
  assert.equal(T.view().step.id, 'fertigen');
});

test('Vorführung der Figur zählt nicht als Fortschritt', () => {
  const { T } = started();
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
  const cases = [[() => {}, 'begruessung', false], [() => {}, 'fertigen', true],
    [T => { click(T); }, 'bauen', true], [T => { click(T); T.event('buildingBuilt', {}, 1); }, 'rekrutieren', true],
    [T => { click(T); T.event('buildingBuilt', {}, 1); for (let i = 0; i < 3; i++) T.event('unitBought', {}, 1); }, 'ausruecken', true],
    [T => { click(T); T.event('buildingBuilt', {}, 1); for (let i = 0; i < 3; i++) T.event('unitBought', {}, 1); T.event('waveDeparted', { side: 'p' }, 1); }, 'schlacht', true]];
  for (const [prep, at, noGreet] of cases){
    const { T } = tut(); T.start(); if (noGreet) T.endGreeting(); prep(T);
    assert.equal(T.skip(), true);
    assert.equal(T.view().phase, 'off'); assert.equal(T.active(), false);
    assert.equal(T.data().skipped, true); assert.equal(T.data().skippedAt, at);
    assert.equal(T.skip(), false, 'zweites Mal ohne Wirkung');
  }
});

test('Fehlklicks zählen je Schritt', () => {
  const { T } = started();
  T.misclick(); T.misclick(); click(T); T.misclick();
  assert.deepEqual(plain(T.data().misclicks), { fertigen: 2, bauen: 1 });
});

test('Protokoll: Dauer der Begrüßung und Klicks auf Sprechblasen', () => {
  const { T } = tut(); T.start();
  T.noteBubbleClick(); T.noteBubbleClick(); T.noteGreeting(7800.4); T.noteGreeting(1);
  const d = T.data();
  assert.equal(d.greetingMs, 7800); assert.equal(d.bubbleClicks, 2);
});

test('Start: erste Partie eines Browsers; ?tutorial=1 erzwingt, ?tutorial=0 unterdrückt; Partie ohne Tutorial zählt als gespielt', () => {
  const { T, storage } = tut();
  assert.equal(T.due(null), true);
  T.start();
  assert.equal(storage.m.get('kf.tut'), 'started');
  const again = tut(storage).T;
  assert.equal(again.due(null), false, 'zweite Partie im selben Browser: Tutorial aus');
  assert.equal(again.due('1'), true);
  assert.equal(tut().T.due('0'), false);
  T.skip(); assert.equal(storage.m.get('kf.tut'), 'skipped');
  const plainGame = tut(); plainGame.T.markPlayed();
  assert.equal(plainGame.storage.m.get('kf.tut'), 'declined');
  assert.equal(tut(plainGame.storage).T.due(null), false, 'auch wer die erste Partie ohne Tutorial spielt, bekommt es danach nicht mehr voreingestellt');
  const done = tut(); done.T.start(); done.T.markPlayed();
  assert.equal(done.storage.m.get('kf.tut'), 'started', 'markPlayed überschreibt nichts');
});

test('Ohne Speicher startet das Tutorial jedes Mal; kaputter Speicher bricht nichts', () => {
  const broken = { get(){ throw new Error('blockiert'); }, set(){ throw new Error('blockiert'); } };
  const { T } = tut(broken);
  assert.equal(T.due(null), true);
  T.start(); assert.equal(T.active(), true);
  T.markPlayed();
  T.skip(); assert.equal(T.active(), false);
  assert.equal(tut(broken).T.due(null), true, 'jedes Mal');
});

test('Zustand überlebt Speichern und Laden mitten im Tutorial', () => {
  const { T } = started(); click(T, 4, 3); T.markDemoShown('fertigen'); T.misclick();
  const snap = T.snapshot();
  const { T: U } = tut(); U.restore(JSON.parse(JSON.stringify(snap)));
  assert.equal(U.active(), true); assert.equal(U.progress('fertigen'), 4); assert.equal(U.demoShown('fertigen'), true);
  assert.equal(U.view().phase, 'step', 'die Begrüßung ist vorbei und kommt nicht wieder');
  click(U, 6, 9); assert.equal(U.view().step.id, 'bauen');
  const junk = tut().T; junk.restore('kaputt'); assert.equal(junk.active(), false);
  junk.restore({ active: true, done: null }); assert.equal(junk.view().phase, 'greet');
});

test('Texte: Erzählung höchstens 90, Auftrag höchstens 30 Zeichen, Begrüßung und Abschied in de und en; bekannte Ereignisse und Ziele', () => {
  const I = loadI18n(), { steps, greeting, farewell } = tut();
  const events = ['materialProduced', 'buildingBuilt', 'unitBought', 'waveDeparted', 'enemyWaveDefeated', 'cardChosen'];
  assert.equal(new Set(steps.map(s => s.id)).size, steps.length, 'Kennungen eindeutig');
  for (const s of steps){
    assert.ok(events.includes(s.on), `${s.id}: Ereignis ${s.on}`);
    assert.ok(s.need > 0, `${s.id}: Schwellenwert`);
    assert.ok(['click', 'plot', 'units', 'waves', 'cards', null].includes(s.target), `${s.id}: Ziel`);
    if (s.silent) continue;
    for (const l of ['de', 'en']){
      assert.ok(I[l][s.narrKey] && I[l][s.taskKey], `${s.id}: Texte in ${l}`);
      assert.ok(I[l][s.narrKey].length <= 90, `${s.narrKey} (${l}) hat ${I[l][s.narrKey].length} Zeichen`);
      assert.ok(I[l][s.taskKey].length <= 45, `${s.taskKey} (${l}) hat ${I[l][s.taskKey].length} Zeichen`);
    }
  }
  for (const key of [...greeting, ...farewell]) for (const l of ['de', 'en']){
    assert.ok(I[l][key], `${key} fehlt in ${l}`);
    assert.ok(I[l][key].length <= 90, `${key} (${l}) hat ${I[l][key].length} Zeichen`);
  }
});

test('Schritt 3 nennt die Einheit wie das Spiel (Läufer / Runner)', () => {
  const I = loadI18n();
  assert.match(I.de['tut.rekrutieren.task'], new RegExp(I.de['unit.laeufer.name']));
  assert.match(I.en['tut.rekrutieren.task'].toLowerCase(), new RegExp(I.en['unit.laeufer.name'].toLowerCase()));
  assert.match(I.de['tut.fertigen.task'], new RegExp(I.de['btn.click']));
  assert.match(I.en['tut.fertigen.task'], new RegExp(I.en['btn.click']));
});

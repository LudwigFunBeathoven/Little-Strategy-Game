// Tests Inkrement 6: Erstkontakt-Hinweise (REQ-20.2/20.3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadI18n } from '../tools/load-core.mjs';

function loadHints(){
  const ctx = { JSON }; vm.createContext(ctx);
  vm.runInContext(readFileSync(new URL('../hints.js', import.meta.url), 'utf8') + '\nglobalThis.__h = KF_HINTS;', ctx);
  return ctx.__h;
}
/* Browser-Speicher als Attrappe; mehrere Instanzen teilen ihn wie Tabs desselben Browsers */
function memoryStorage(){ const m = new Map(); return { get: k => m.has(k) ? m.get(k) : null, set: (k, v) => m.set(k, v), m }; }

test('Jeder Hinweis erscheint pro Browser nur einmal; nach dem Zurücksetzen wieder', () => {
  const H = loadHints(), store = memoryStorage();
  const a = H.create(store, 'kf.hints');
  for (const id of H.IDS){
    assert.equal(a.trigger(id), true, `${id} beim ersten Auftreten`);
    assert.equal(a.trigger(id), false, `${id} kein zweites Mal`);
  }
  const b = H.create(store, 'kf.hints');           // neuer Seitenaufruf im selben Browser
  for (const id of H.IDS) assert.equal(b.trigger(id), false, `${id} nach Neuladen nicht erneut`);
  b.reset();
  const c = H.create(store, 'kf.hints');
  for (const id of H.IDS) assert.equal(c.trigger(id), true, `${id} nach dem Zurücksetzen wieder`);
});

test('Betroffene Systeme: erste Welle, Spezialkarte, Abriss, Belagerungswelle', () => {
  assert.deepEqual(Array.from(loadHints().IDS).sort(), ['card', 'demolish', 'siege', 'wave']);
});

test('Nicht verfügbarer oder kaputter Speicher bricht nichts', () => {
  const H = loadHints();
  const broken = { get(){ throw new Error('blockiert'); }, set(){ throw new Error('blockiert'); } };
  const h = H.create(broken, 'k');
  assert.equal(h.trigger('wave'), true);
  assert.equal(h.trigger('wave'), false, 'im Speicher der Seite vermerkt');
  const junk = H.create({ get: () => '{kaputt', set(){} }, 'k');
  assert.equal(junk.trigger('card'), true);
});

test('Hinweistexte liegen in de und en, höchstens zwei Zeilen', () => {
  const I = loadI18n();
  for (const id of loadHints().IDS) for (const l of ['de', 'en']){
    const s = I[l]['hint.' + id];
    assert.ok(s, `hint.${id} fehlt in ${l}`);
    assert.ok(s.length <= 150, `hint.${id} (${l}) zu lang für zwei Zeilen: ${s.length} Zeichen`);
  }
});

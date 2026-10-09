// Tests Kartenpfad Teil 2 (REQ-K2.03, K2.05, K2.06): Kartentexte, Sprache, Hinweise.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

const core = loadCore(), I = loadI18n();
const BONUS = core.KF_DRAFT_OPTIONS, PFAD = [], RES = core.KF_RESEARCH;
const fill = s => s.replace(/\{[a-z0-9]+\}/gi, '12');

test('K2.03: jede Bonuskarte hat eine Wirkungszeile von höchstens 44 Zeichen (de und en)', () => {
  for (const o of BONUS) for (const lang of ['de', 'en']){
    const s = I[lang]['kp.eff.' + o.id];
    assert.ok(s, `${lang} kp.eff.${o.id} fehlt`);
    assert.ok(fill(s).length <= 44, `${lang} ${o.id}: „${s}“ ist ${fill(s).length} Zeichen lang`);
  }
});

test('K2.03: Platzhalter der Wirkungszeile kommen in der langen Beschreibung vor (gleiche Parameter je Stufe)', () => {
  for (const o of BONUS){
    const eff = I.de['kp.eff.' + o.id], desc = I.de[o.descKey] || '';
    for (const ph of eff.match(/\{[a-z0-9]+\}/gi) || []) assert.ok(desc.includes(ph), `${o.id}: ${ph} fehlt in der Beschreibung`);
  }
});

test('K2.03: keine Karte nennt in Wirkungszeile oder Beschreibung eine andere Karte oder Forschung', () => {
  const names = { de: new Map(), en: new Map() };
  for (const lang of ['de', 'en']){
    for (const o of [...BONUS, ...PFAD]) names[lang].set(o.id, I[lang][o.nameKey]);
    for (const r of RES) names[lang].set(r.id, I[lang][r.nameKey]);
  }
  const thing = lang => new Set(Object.keys(I[lang]).filter(k => /^(bld|unit)\.[a-z_]+\.name$/.test(k)).map(k => I[lang][k]));       // Gebäude und Einheiten dürfen genannt werden (Wirkung)
  const own = k => new Set([k.id, ...(k.oeffnetForschung || [])]);
  for (const o of [...BONUS, ...PFAD]) for (const lang of ['de', 'en']){
    const texts = [I[lang]['kp.eff.' + o.id] || '', I[lang][o.descKey] || ''];
    for (const [id, name] of names[lang]){
      if (own(o).has(id) || !name || name.length < 5 || thing(lang).has(name)) continue;
      for (const txt of texts) assert.ok(!new RegExp(`(^|[^\\p{L}])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu').test(txt), `${lang} ${o.id}: „${txt}“ nennt „${name}“`);
    }
  }
});

test('K2.06: dynamische Hinweise (disc:…) sind je Browser einmal; fremde Kennungen bleiben ungültig', () => {
  const ctx = { JSON }; vm.createContext(ctx);
  vm.runInContext(readFileSync(new URL('../hints.js', import.meta.url), 'utf8') + '\nglobalThis.__h = KF_HINTS;', ctx);
  const m = new Map(), store = { get: k => m.has(k) ? m.get(k) : null, set: (k, v) => m.set(k, v) };
  const a = ctx.__h.create(store, 'k');
  assert.equal(a.trigger('disc:tab:wall'), true);
  assert.equal(a.trigger('disc:tab:wall'), false);
  assert.equal(a.trigger('disc:tab:uni'), true);
  assert.equal(a.trigger('unbekannt'), false);
  assert.equal(ctx.__h.create(store, 'k').trigger('disc:tab:wall'), false, 'nach Neuladen nicht erneut');
});

test('K2.03/K2.06: Texte der Karten, Hinweise und Marken liegen in beiden Sprachen', () => {
  for (const k of ['kp.card.drawback', 'hint.disc.new', 'hint.disc.done', 'mark.new'])
    for (const lang of ['de', 'en']) assert.ok(I[lang][k], `${lang} ${k}`);
});

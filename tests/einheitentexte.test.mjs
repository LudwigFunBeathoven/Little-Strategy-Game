// Tests Kartenpfad Teil 4, REQ-S.01: Jede Einheit beider Modi hat Name, Kurzname und Symbol in beiden Sprachen;
// die Wellenvorschau (Reiter Armee) zeigt für jede Einheit einen Text ohne „undefined“.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

const I = loadI18n();
const { KF_CONFIG: C } = loadCore();
const units = Object.keys(C.UNITS);

test('S.01: Name und Kurzname je Einheit in de und en', () => {
  assert.ok(units.length >= 8, 'alle Einheiten des Standard- und des Kartenmodus');
  for (const lang of ['de', 'en']) for (const u of units) for (const part of ['name', 'short']){
    const s = I[lang][`unit.${u}.${part}`];
    assert.ok(typeof s === 'string' && s.trim() && !/undefined/.test(s), `${lang}: unit.${u}.${part}`);
  }
});

test('S.01: jede Einheit hat ein Symbol, das sich von dem der anderen Grundtypen unterscheidet', () => {
  for (const u of units) assert.ok(typeof C.UNITS[u].symbol === 'string' && C.UNITS[u].symbol.length >= 1, `Symbol von ${u}`);
  const own = u => C.UNITS[u].symbol;
  for (const [a, b] of [['laeufer', 'werfer'], ['laeufer', 'schild'], ['werfer', 'schild'], ['armbrust', 'katapult'], ['armbrust', 'werfer'], ['katapult', 'werfer'], ['reiter', 'laeufer']])
    assert.notEqual(own(a), own(b), `${a} und ${b} sind nicht zu unterscheiden`);
});

test('S.01: Wellenvorschau mit allen Einheiten enthält kein „undefined“ (Quelltext aus panels.js)', () => {
  const src = readFileSync(new URL('../panels.js', import.meta.url), 'utf8');
  const part = src.slice(src.indexOf('const unitSymbol'), src.indexOf('function renderPreview'));
  assert.ok(part.includes('countLine') && part.includes('countTitle'));
  for (const lang of ['de', 'en']){
    const ctx = { C, t: k => I[lang][k], Object, String };
    vm.createContext(ctx);
    vm.runInContext(part + '\nglobalThis.__f = { countLine, countTitle };', ctx);
    const group = units.map((type, i) => ({ type, lane: i % 3 }));
    for (let lane = 0; lane < 3; lane++){
      const line = ctx.__f.countLine(group, lane), title = ctx.__f.countTitle(group, lane);
      assert.ok(line && !/undefined|NaN/.test(line), `${lang} Lane ${lane}: ${line}`);
      assert.ok(!/undefined|NaN/.test(title), `${lang} Lane ${lane}: ${title}`);
    }
    // jede Einheit einzeln, in beiden Sprachen: Symbol und Kurzname erscheinen
    for (const type of units){
      const line = ctx.__f.countLine([{ type, lane: 0 }], 0), title = ctx.__f.countTitle([{ type, lane: 0 }], 0);
      assert.equal(line, `${C.UNITS[type].symbol}×1`);
      assert.equal(title, `${I[lang][`unit.${type}.short`]} ×1`);
    }
    assert.equal(ctx.__f.countLine([], 0), '–');
  }
});

test('S.01: Einheiten, die weder Symbol noch Kurzname haben, würden nicht mehr als „undefined“ erscheinen', () => {
  const src = readFileSync(new URL('../panels.js', import.meta.url), 'utf8');
  assert.ok(!/GLYPH/.test(src), 'keine zweite Symboltabelle in panels.js');
  const part = src.slice(src.indexOf('const unitSymbol'), src.indexOf('const countLine'));
  const ctx = { C: { UNITS: { neu: {} } }, t: () => 'Neuling', String };
  vm.createContext(ctx); vm.runInContext(part + '\nglobalThis.__s = unitSymbol("neu");', ctx);
  assert.equal(ctx.__s, 'N');
});

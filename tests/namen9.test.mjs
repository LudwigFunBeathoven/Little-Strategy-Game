// Teil 9, REQ-K9.06: Im Modus karten tragen keine zwei Elemente (Karte, Forschung, Einheit, Gebäude, Variante, Flügel, Doktrin) denselben Namen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sichtbar } from '../tools/textbudget.mjs';

const NAME = /^(?:draft|kp\.card|kp\.res|research|doctrine|unit|bld|var|variant|haus\.fluegel|kompanie)\.[A-Za-z0-9_.]*?name(?:\.[a-z0-9]+)?$/;
test('K9.06: keine zwei sichtbaren Elemente gleichen Namens', () => {
  const { I, keys } = sichtbar();
  for (const lang of ['de', 'en']){
    const seen = new Map(), dup = [];
    for (const k of keys.filter(k => NAME.test(k))){
      const base = k.replace(/\.karten$/, ''), v = I[lang][k];
      if (typeof v !== 'string' || /[{}]/.test(v)) continue;
      const other = seen.get(v);
      if (other && other.replace(/\.(t\d|nth|weiter)$/, '') !== base.replace(/\.(t\d|nth|weiter)$/, '')) dup.push(`${v}: ${other} = ${k}`);
      else seen.set(v, k);
    }
    assert.deepEqual(dup, [], lang);
  }
});

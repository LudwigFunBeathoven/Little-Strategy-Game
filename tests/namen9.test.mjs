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

/* K9.05, K9.06, K9.07: Suchtests über die sichtbaren Texte des Modus karten */
const alle = () => { const { I, keys } = sichtbar(); return ['de', 'en'].flatMap(l => keys.map(k => ({ l, k, v: I[l][k] }))).filter(x => typeof x.v === 'string'); };

test('K9.05: Designertext und Platzhalter fehlen', () => {
  const { I } = sichtbar();
  for (const l of ['de', 'en']){
    assert.ok(!/bewusst|on purpose|Abfluss|sink for/.test(I[l]['upg.presse.desc'] + I[l]['upg.qualitaet.desc']), l);
    assert.equal(I[l]['kp.vorschau'], undefined); assert.equal(I[l]['tip.kp.vorschau'], undefined);
    assert.ok(!/Stufenaufstieg|level-up/.test(I[l]['level.uniOn'] + I[l]['level.uniOff']), l);
  }
  assert.ok(/Forschung/.test(sichtbar().I.de['tip.tab.uni']));
  assert.ok(!/Reiter Karten|Cards tab/.test(sichtbar().I.de['tip.hud.draft.karten'] + sichtbar().I.en['tip.hud.draft.karten']));
});
test('K9.05: „Fabrik“ steht nur dort, wo das Gebäude nach dem Wasserrahmen gemeint ist', () => {
  const erlaubt = /^(bld\.fabrik\.(name\.weiter2?|nth)|kp\.(eff|res|card)\.(dampfkraft|wasserrahmen)(\.|$))/;
  const treffer = alle().filter(x => x.l === 'de' && /Fabrik/.test(x.v) && !erlaubt.test(x.k)).map(x => x.k);
  assert.deepEqual(treffer, []);
});
test('K9.06: entfallene Begriffe kommen in sichtbaren Texten nicht vor', () => {
  const de = /Handelskontor|\bLeben\b|\bkill\b/i, en = /hit points|\bkills?\b|\bforge\b/i;
  const bad = alle().filter(x => (x.l === 'de' ? de : en).test(x.v.replace(/\{kills\}/g, ''))).map(x => `${x.l} ${x.k}`);
  assert.deepEqual(bad, []);
});
test('K9.07: kein Phasenbegriff in sichtbaren Texten', () => {
  const bad = alle().filter(x => /^phase\./.test(x.k) || /\bPhase\b|Spätphase|\bphase\b|late phase/i.test(x.v)).map(x => `${x.l} ${x.k}`);
  assert.deepEqual(bad, []);
});

// Tests Kartenpfad Teil 9 (REQ-K9.02 …): Textregeln R1 bis R6 für die Kartenfläche und den Modus karten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';
import { inventar, sichtbar, limit, BUDGET } from '../tools/textbudget.mjs';

const core = loadCore(), I = loadI18n();
const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, { pacing: 'karten' });
const gone = new Set(core.KF_PFAD.entfallenKarten);
const cards = Object.values(G.OPT).filter(o => !gone.has(o.id));

test('K9.02: Jede Karte mit Nachteil (Stufe mit drawback oder Doktrin) hat in beiden Sprachen eine Nachteilszeile kp.drawback.<id>; Karten ohne Nachteil haben keine', () => {
  let n = 0;
  for (const o of cards){
    const tiers = G.tiersOf(o), mit = tiers.some(t => t.drawback) || !!o.doktrin;
    for (const lang of ['de', 'en']){
      const v = I[lang]['kp.drawback.' + o.id];
      if (mit) assert.ok(v && v.length > 0, `${lang}: kp.drawback.${o.id}`); else assert.equal(v, undefined, `${lang}: ${o.id} hat keinen Nachteil`);
    }
    if (mit) n++;
  }
  assert.ok(n >= 18, `Karten mit Nachteil: ${n}`);
  for (const lang of ['de', 'en']) assert.equal(I[lang]['kp.card.drawback'], undefined, 'der allgemeine Text „mit Nachteil“ entfällt');
});

test('K9.02/R3: Kartenname, Wirkungszeile und Nachteilszeile halten die Zeichenbudgets (de; en + 15 %)', () => {
  const inv = inventar(), bad = inv.rows.filter(r => ['karte', 'wirkung', 'nachteil'].includes(r.element) && (r.deOver || r.enOver));
  assert.deepEqual(bad.map(r => `${r.key}: ${r.de}/${r.deLimit} ${r.en}/${r.enLimit}`), []);
  assert.ok(inv.rows.filter(r => r.element === 'nachteil').length >= 18);
  assert.ok(inv.rows.filter(r => r.element === 'wirkung').length >= 40);
});

test('K9.02: Jede Karte der Pools hat eine Wirkungszeile; keine Nachteilszeile nennt eine andere Karte; keine Zeile enthält ein Platzhalter-Rest', () => {
  for (const o of cards) for (const lang of ['de', 'en']) assert.ok(I[lang]['kp.eff.' + o.id], `${lang}: kp.eff.${o.id}`);
  const names = new Set(cards.flatMap(o => ['de', 'en'].map(l => I[l][o.nameKey.replace(/$/, '')]).filter(Boolean)));
  for (const lang of ['de', 'en']) for (const [k, v] of Object.entries(I[lang])) if (/^kp\.drawback\./.test(k)) for (const nm of names) assert.ok(!v.includes(nm) || nm.length < 4, `${lang} ${k} nennt „${nm}“`);
});

test('K9.03: Im Modus karten wird draft.cat.* nicht mehr gerendert (nur im Standardmodus); die Tooltip-Bezeichnungen sind eindeutig', () => {
  const stage = new URL('../stage.js', import.meta.url), panels = new URL('../panels.js', import.meta.url);
  const fs = await_fs();
  const s = fs.readFileSync(stage, 'utf8');
  assert.match(s, /bandWord = o => G\.S\.pacing === 'karten' \? t\('kp\.fam\.' \+ familyOf\(o\)\) : /, 'Modus karten: Familie statt draft.cat.*');
  const T = I.de, E = I.en;
  assert.equal(new Set([T['tip.draft.category'], T['tip.draft.kat'], T['tip.draft.art'], T['tip.m.role']]).size, 4, 'vier verschiedene Bezeichnungen (de)');
  assert.equal(new Set([E['tip.draft.category'], E['tip.draft.kat'], E['tip.draft.art'], E['tip.m.role']]).size, 4, 'vier verschiedene Bezeichnungen (en)');
  assert.ok(fs.readFileSync(panels, 'utf8').includes("t('tip.draft.kat'), katLabel(o)"), 'Modus karten zeigt die Kategorie');
});
import { readFileSync } from 'node:fs';
function await_fs(){ return { readFileSync }; }

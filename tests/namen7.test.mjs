// Tests Kartenpfad Teil 7, REQ-K7.09: historisches Setting – Namen im Modus karten (Schlüssel mit Suffix .karten), Modus standard unverändert.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';
import { pruefe } from '../tools/sprachliste.mjs';

const I = loadI18n(), core = loadCore(), P = core.KF_PFAD, C = core.KF_CONFIG;
/* Text eines Schlüssels, wie ihn der Modus karten zeigt (t() in ui.js: Suffix .karten geht vor) */
const karten = (T, k) => T[k + '.karten'] ?? T[k];
/* Schlüssel, die der Modus karten nie zeigt: Karten, Forschungen und Ausbauten, die dort entfallen */
const gone = new Set([...P.entfallenKarten, ...P.entfallen.map(r => r.replace(/^r_/, '')), ...P.entfallenAusbauten]);
const hidden = k => { const m = k.match(/^(?:draft|kp\.eff|kp\.card|research|upg)\.([a-zA-Z_0-9]+)(\.|$)/); return !!m && gone.has(m[1]); };
/* Texte, die die neuen Stufen selbst benennen: Fabrik (nach Wasserrahmen) und Handelshaus (nach Fernhandel) sind dort die neuen Namen */
const STUFE = /^(kp\.(card|eff|res)\.(wasserrahmen|dampfkraft|fernhandel)(\.|$)|bld\.[a-z]+\.name\.weiter\d?$|tip\.kompanie$)/;
const OLD = { de: /Fabrik|Dampfmühle|Druckerei|Werkstatt/, en: /\bfactor(y|ies)\b|steam mill|print shop|workshop|trading house/i };

test('K7.09 Suchtest: Im Modus karten nennt kein sichtbarer Text die alten Namen (Fabrik als Grundgebäude, Dampfmühle, Druckerei, Werkstatt)', () => {
  for (const lang of ['de', 'en']){
    const T = I[lang], hits = [];
    for (const k of Object.keys(T)){
      if (k.endsWith('.karten') && T[k.slice(0, -7)] !== undefined) continue;            // Überschreibung: zählt über ihren Grundschlüssel
      if (hidden(k) || STUFE.test(k)) continue;
      const s = k.endsWith('.karten') ? T[k] : karten(T, k);
      if (OLD[lang].test(s)) hits.push(`${k}: ${s}`);
    }
    assert.deepEqual(hits, [], `${lang}: alte Namen\n${hits.join('\n')}`);
  }
});

test('K7.09: Namen der Tabelle in beiden Sprachen (Modus karten)', () => {
  const want = {
    de: { 'bld.fabrik.name': 'Manufaktur', 'var.manufaktur.name': 'Hofmanufaktur', 'var.werkstatt.name': 'Zeugmanufaktur', 'var.wachstube.name': 'Wachstube', 'bld.fabrik.name.weiter': 'Fabrik',
      'bld.fabrik.name.weiter2': 'Dampffabrik', 'bld.universitaet.name.weiter': 'Akademie', 'bld.kontor.name.weiter': 'Handelshaus', 'bld.schmiede.name.weiter': 'Gießerei',
      'haus.stufe.1.name': 'Gutshof', 'haus.stufe.2.name': 'Rathaus', 'haus.stufe.3.name': 'Residenz',
      'mauer.stufe.palisade': 'Palisade', 'mauer.stufe.ringmauer': 'Ringmauer', 'mauer.stufe.bastionsmauer': 'Bastionsmauer', 'turm.stufe.wachturm': 'Wachturm', 'turm.stufe.wehrturm': 'Wehrturm', 'turm.stufe.geschuetzturm': 'Geschützturm' },
    en: { 'bld.fabrik.name': 'Manufactory', 'bld.fabrik.name.weiter': 'Factory', 'bld.fabrik.name.weiter2': 'Steam Factory', 'bld.universitaet.name.weiter': 'Academy', 'bld.kontor.name.weiter': 'Trading House',
      'bld.schmiede.name.weiter': 'Foundry', 'haus.stufe.1.name': 'Manor', 'haus.stufe.2.name': 'Town Hall', 'haus.stufe.3.name': 'Residence',
      'mauer.stufe.palisade': 'Palisade', 'mauer.stufe.ringmauer': 'Curtain Wall', 'mauer.stufe.bastionsmauer': 'Bastion Wall', 'turm.stufe.wachturm': 'Watchtower', 'turm.stufe.wehrturm': 'Defence Tower', 'turm.stufe.geschuetzturm': 'Gun Tower' },
  };
  for (const lang of ['de', 'en']) for (const [k, v] of Object.entries(want[lang])) assert.equal(karten(I[lang], k), v, `${lang}: ${k}`);
  assert.notEqual(karten(I.en, 'bld.kontor.name'), karten(I.en, 'bld.kontor.name.weiter'), 'en: Kontor und Handelshaus heißen verschieden');
});

test('K7.09: Modus standard behält seine Namen', () => {
  assert.equal(I.de['bld.fabrik.name'], 'Fabrik'); assert.equal(I.en['bld.fabrik.name'], 'Factory');
  assert.equal(I.de['tut.bauen.task'], 'Baue eine Fabrik.'); assert.equal(I.de['tut.bauen.task.karten'], 'Baue eine Manufaktur.');
  assert.equal(I.de['draft.bessereFabriken.name'], 'Bessere Fabriken');
});

test('K7.09: Stufennamen von Mauer und Türmen steigen mit der Ausbaustufe; Texte vorhanden; Sprachregel für neue Kartentexte', () => {
  for (const kind of ['mauer', 'turm']){
    const list = C.STUFENNAMEN[kind]; assert.equal(list.length, 3);
    for (let i = 1; i < list.length; i++) assert.ok(list[i][0] > list[i - 1][0], `${kind}: aufsteigend`);
    for (const lang of ['de', 'en']) for (const [, k] of list) assert.ok(I[lang][`${kind}.stufe.${k}`], `${lang}: ${kind}.stufe.${k}`);
  }
  for (const lang of ['de', 'en']) for (const k of Object.keys(I[lang]).filter(k => /^(kp\.(card|eff|res)\.(stadtrecht|hofhaltung|wasserrahmen|fernhandel|geschuetzguss)|haus\.|kompanie)/.test(k)))
    assert.deepEqual(pruefe(lang, I[lang][k]), [], `${lang}: ${k}`);
});

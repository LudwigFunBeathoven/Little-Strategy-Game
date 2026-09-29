// Prüft die Sprachdateien (REQ-04): gleiche Schlüssel, keine sichtbaren Texte außerhalb der Sprachdateien.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadI18n } from '../tools/load-core.mjs';

const I = loadI18n();

test('de und en haben dieselben Schlüssel', () => {
  const de = Object.keys(I.de).sort(), en = Object.keys(I.en).sort();
  assert.deepEqual(de.filter(k => !en.includes(k)), [], 'fehlen in en');
  assert.deepEqual(en.filter(k => !de.includes(k)), [], 'fehlen in de');
});

test('Platzhalter stimmen je Schlüssel überein', () => {
  const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
  for (const k of Object.keys(I.de)) assert.equal(ph(I.de[k]), ph(I.en[k]), `Platzhalter in ${k}`);
});

test('index.html enthält außer dem Spieltitel keinen sichtbaren Text', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/[\s·+\/0-9:]+/g, ' ').trim().split(' ').filter(Boolean);
  assert.deepEqual(text.filter(w => w !== 'Klammerfront'), []);
});

test('Oberflächen-Dateien und core.js: keine festen Sätze', () => {
  for (const f of ['ui.js', 'render.js', 'hud.js', 'panels.js', 'session.js', 'core.js']){
    const code = readFileSync(new URL('../' + f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const strings = [...code.matchAll(/'([^'\\\n]*)'|`([^`\\]*)`/g)].map(m => m[1] ?? m[2]);
    const prose = strings.filter(s => /[A-Za-zÄÖÜäöüß]{3,}\s+[A-Za-zÄÖÜäöüß]{3,}/.test(s) && !/[.#\[\]=(){}$]/.test(s) && !/^(opt|slot|btn|diff|chip|link|field|seg)\b/.test(s) && s !== 'use strict' && !/\dpx /.test(s));
    assert.deepEqual(prose, [], `Texte in ${f}`);
  }
});

test('index.html lädt alle Spieldateien in der richtigen Reihenfolge', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(srcs, ['config.js', 'i18n/de.js', 'i18n/en.js', 'data/draft-options.js', 'data/research.js', 'hints.js', 'core.js', 'ui.js', 'render.js', 'hud.js', 'panels.js', 'session.js']);
});

// Sprach-Audit (REQ-KP.08): Tutorial-Schlüssel und Texte des Branches gegen die Wortliste in tools/sprachliste.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadI18n } from '../tools/load-core.mjs';
import { pruefe, VERBOTEN } from '../tools/sprachliste.mjs';

const I = loadI18n();
const PRAEFIXE = ['tut.', 'kp.'];          // Tutorial sowie Karten-, Forschungs- und Hinweistexte des Kartenpfads

test('Wortliste enthält die Mindestwörter', () => {
  for (const w of ['Horde', 'Soldat', 'Feldherr', 'Krieg', 'Beute', 'Schlacht', 'gebrochen', 'vernichte', 'töte', 'Waffe', 'Blut']) assert.ok(VERBOTEN.de.includes(w), w);
  for (const w of ['horde', 'soldier', 'commander', 'war', 'loot', 'battle', 'kill', 'destroy', 'weapon', 'blood']) assert.ok(VERBOTEN.en.includes(w), w);
});

test('Prüfung trifft Wortanfänge, nicht Zusammensetzungen mit anderem Anfang', () => {
  assert.deepEqual(pruefe('de', 'Die Horden rücken vor'), ['Horde']);
  assert.deepEqual(pruefe('de', 'Kriegsbeute'), ['Krieg']);
  assert.deepEqual(pruefe('de', 'Eisenwaffen'), []);
  assert.deepEqual(pruefe('en', 'The war is on'), ['war']);
  assert.deepEqual(pruefe('en', 'A warm welcome'), []);
});

test('Schlüssel mit Präfix tut. und kp. sind frei von verbotenen Wörtern (de und en)', () => {
  let n = 0;
  for (const lang of ['de', 'en'])
    for (const [k, v] of Object.entries(I[lang])){
      if (!PRAEFIXE.some(p => k.startsWith(p))) continue;
      n++;
      assert.deepEqual(pruefe(lang, v), [], `${lang} ${k}: „${v}“`);
    }
  assert.ok(n >= 30, 'Audit prüft eine nennenswerte Zahl von Schlüsseln');
});

test('Glossar: ersetzte Wörter kommen im Tutorial nicht mehr vor', () => {
  const alt = { de: ['Feldherr', 'Soldaten', 'rekrutier', 'Klinge', 'Kriegsbeute'], en: ['commander', 'soldiers', 'recruit', 'blades', 'war spoils'] };
  for (const lang of ['de', 'en'])
    for (const [k, v] of Object.entries(I[lang]).filter(([k]) => k.startsWith('tut.')))
      for (const w of alt[lang]) assert.ok(!v.toLowerCase().includes(w.toLowerCase()), `${lang} ${k} enthält „${w}“`);
});

test('Ersatztexte des Tutorials stehen wörtlich in den Sprachdateien (KP.08)', () => {
  assert.equal(I.de['tut.greet1'], 'Willkommen, Statthalter. Ich bin dein Quartiermeister.');
  assert.equal(I.en['tut.greet1'], 'Welcome, governor. I am your quartermaster.');
  assert.equal(I.de['tut.karte.task'], 'Wähle eine Karte. Sie verändert dein Reich.');
  assert.equal(I.de['tut.bye1.karten'], 'Mauer, Türme, Schmiede, Universität – alles steht bereit. Deine Karten weisen den Weg.');   // Teil 5: Grundausstattung ab Start
  assert.equal(I.de['tut.bye1'], 'Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden.');
  assert.equal(I.de['tut.bye2'], 'Was neu ist, ist markiert. Bewahre das Tor, Statthalter.');
  assert.equal(I.en['tut.xpBounty'], '+{n} experience');
});

/* Teil 9, REQ-K9.08: Textregeln R3 bis R6 für die sichtbaren Texte des Modus karten */
import { inventar, sichtbar } from '../tools/textbudget.mjs';

test('R3: kein sichtbarer Text überschreitet sein Zeichenbudget (de; en plus 15 %)', () => {
  const over = inventar().rows.filter(r => r.deOver || r.enOver).map(r => `${r.key}: de ${r.de}/${r.deLimit}, en ${r.en}/${r.enLimit}`);
  assert.deepEqual(over, []);
});

test('R4: kein Designertext (Begründungen der Balance, Absichten, Platzhalter)', () => {
  const sicht = sichtbar(), bad = [];
  const re = { de: /bewusst|Absicht|soll verhindern|damit .{0,20}nicht zu|Hier kommt später|folgt noch|TODO/i, en: /on purpose|intended to|to prevent|something more will appear|coming soon|TODO/i };
  for (const lang of ['de', 'en']) for (const k of sicht.keys) if (typeof sicht.I[lang][k] === 'string' && re[lang].test(sicht.I[lang][k])) bad.push(`${lang} ${k}`);
  assert.deepEqual(bad, []);
});

test('R5: Begriffe – „Leben“, „Handelskontor“, „hit points“, „forge“, „kill“ kommen nicht vor', () => {
  const sicht = sichtbar(), bad = [];
  const re = { de: /\bLeben\b|Handelskontor/, en: /hit points|\bforge\b|\bkills?\b/i };
  for (const lang of ['de', 'en']) for (const k of sicht.keys) if (typeof sicht.I[lang][k] === 'string' && re[lang].test(sicht.I[lang][k].replace(/\{kills\}/g, ''))) bad.push(`${lang} ${k}`);
  assert.deepEqual(bad, []);
});

test('R6: feste Zahlen im Text nur in der Liste der begründeten Ausnahmen', () => {
  const sicht = sichtbar();
  const ausnahmen = new Set(['tip.click.body', 'kp.stage.hint', 'kp.eff.glaskanonen', 'kp.card.glaskanonen.desc', 'kp.drawback.glaskanonen', 'kp.res.eisenwaffen.desc',
    'kp.eff.bollwerk', 'kp.eff.sammelruf', 'kp.eff.elite', 'kp.eff.raubbau', 'tip.weiter.one']);
  const bad = sicht.keys.filter(k => typeof sicht.I.de[k] === 'string' && /\d/.test(sicht.I.de[k].replace(/\{[^}]*\}/g, '')) && !ausnahmen.has(k));
  assert.deepEqual(bad, []);
});

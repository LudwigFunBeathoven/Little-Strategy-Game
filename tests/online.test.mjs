// Tests Iteration 6, REQ-6.03: reines Online-Spiel – kein Fortschritt außerhalb der Partie, Karte Nachtschicht mit Online-Wirkung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadCore } from '../tools/load-core.mjs';

const root = new URL('../', import.meta.url);
const read = f => readFileSync(new URL(f, root), 'utf8');

test('Suchtest: kein Offline-Bezug in core.js, data/ und i18n/', () => {
  const files = ['core.js', 'config.js', 'hints.js', ...readdirSync(new URL('data/', root)).map(f => 'data/' + f), 'i18n/de.js', 'i18n/en.js'];
  const hits = [];
  for (const f of files) read(f).split('\n').forEach((line, i) => { if (/offline|abwesen|\baway\b/i.test(line)) hits.push(`${f}:${i + 1}: ${line.trim()}`); });
  assert.deepEqual(hits, []);
});

test('Spiellogik ohne Nachrechnen von Abwesenheit', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create();
  assert.equal(G.applyAway, undefined);
  assert.equal(G.offlineHours, undefined);
  G.newGame('normal', 1);
  assert.equal('savedAt' in G.S, false, 'kein Zeitstempel im Spielstand');
});

test('Spielstand: Laden nach einer Stunde ändert nichts (keine Spielzeit vergeht)', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3);
  G.S.material = 1234; G.build('fabrik'); G.build('fabrik');
  for (let i = 0; i < 100; i++) G.tick(0.05);
  const saved = JSON.stringify(G.snapshot());
  const H = KlammerCore.create(); H.FX.on = false; H.adopt(JSON.parse(saved));
  assert.equal(H.S.material, G.S.material);
  assert.equal(H.S.t, G.S.t);
});

test('Nachtschicht: Fabriken produzieren nur in der Spätphase mehr', () => {
  const { KlammerCore, KF_CONFIG: C } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3);
  G.S.material = 1e4; G.build('fabrik');
  const early = G.factoryRate();
  G.S.draft.stacks.nachtschicht = 1; G.S.draft.ver = (G.S.draft.ver || 0) + 1;
  assert.equal(G.factoryRate(), early, 'Frühphase unverändert');
  G.S.level = C.PHASE_LATE_LEVEL;
  const withCard = G.factoryRate();
  G.S.draft.stacks.nachtschicht = 0; G.S.draft.ver++;
  assert.ok(Math.abs(withCard / G.factoryRate() - 1.25) < 1e-9, 'Spätphase +25 %');
});

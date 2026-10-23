// Tests Kartenpfad Teil 12, REQ-K12.01: Simulationsschalter für einen festen Budgetanteil (--budget).
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.KF_PACING = 'karten';
const { playGame, kursFaktorBei, CONFIG: C } = await import('../tools/sim-bot.mjs');

test('Der Kurs zwischen den Stützstellen des Reglers folgt der Geraden, außerhalb bleibt er gleich', () => {
  const B = { stufen: [0, 0.25, 0.5], kursFaktor: [1, 1, 0.7] };
  const cases = [[0.1, 1], [0.25, 1], [0.3, 0.94], [0.4, 0.82], [0.5, 0.7], [0.6, 0.7]];
  for (const [a, f] of cases) assert.ok(Math.abs(kursFaktorBei(B, a) - f) < 1e-9, `Anteil ${a}`);
});

test('Ein fester Budgetanteil gilt nur für die Partie, die Konfiguration kehrt zurück, EP je Quelle erscheinen je Stufe', () => {
  const vorher = JSON.stringify(C.KARTEN.budget);
  const r = playGame({ diff: 'normal', seed: 7, profile: 'durchschnitt', strategy: 'einheiten-zuerst', pacing: 'karten', budgetPct: 30, maxMin: 6 });
  assert.equal(JSON.stringify(C.KARTEN.budget), vorher, 'Konfiguration unverändert');
  assert.equal(r.budgetPct, 30);
  assert.ok((r.xpSrc.budget || 0) > 0, 'das Budget erzeugt EP');
  assert.ok(r.stufenSrc.length >= 2 && r.stufenSrc.every((s, i) => s.n === i + 1 && s.total >= (i ? r.stufenSrc[i - 1].total : 0)), 'Momentaufnahme je erreichter Schwelle');
});

test('Budget 0 % erzeugt keine Budget-EP', () => {
  const r = playGame({ diff: 'normal', seed: 7, profile: 'durchschnitt', strategy: 'einheiten-zuerst', pacing: 'karten', budgetPct: 0, maxMin: 4 });
  assert.equal(r.xpSrc.budget || 0, 0);
});

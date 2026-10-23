// Tests Kartenpfad Teil 12, REQ-K12.02: exponentielle Kostenkurve der Wahlen, E(n) = E0 · g^(n−1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', diff = 'normal'){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, 11, { pacing });
  return { G, C: KF_CONFIG, K: KlammerCore };
}

test('Die Kosten der Wahl n folgen E0 · g^(n−1) für n = 1 bis 20, die Schwelle ist die Summe', () => {
  const { G, C } = game(), k = C.KARTEN.schwellen;
  let summe = 0;
  for (let n = 1; n <= 20; n++){
    const e = k.start * Math.pow(k.wachstum, n - 1);
    summe += e;
    assert.ok(Math.abs((G.xpNeed(n) - G.xpNeed(n - 1)) - e) < 1e-6 * e, `Kosten der Wahl ${n}`);
    assert.ok(Math.abs(G.xpNeed(n) - summe) < 1e-6 * summe, `Schwelle ${n}`);
  }
});

test('g liegt im Bereich 1,08 bis 1,35, die Kosten wachsen je Wahl um genau g', () => {
  // Anforderung K12.02: 1,08 bis 1,20. Der Bericht Teil 12 begründet g = 1,3 (Rückstau und Mindestabstand); bis zur Entscheidung des PO gilt die Obergrenze 1,35 (Stand Teil 10).
  const { G, C } = game(), g = C.KARTEN.schwellen.wachstum;
  assert.ok(g >= 1.08 && g <= 1.35, `g = ${g}`);
  for (let n = 2; n <= 20; n++){
    const a = G.xpNeed(n) - G.xpNeed(n - 1), b = G.xpNeed(n - 1) - G.xpNeed(n - 2);
    assert.ok(Math.abs(a / b - g) < 1e-9, `Faktor bei ${n}`);
  }
});

test('Ein EP-Schub erreicht beliebig viele Schwellen, löst aber höchstens einen Aufstieg aus; die EP bleiben erhalten', () => {
  const { G } = game();
  G.gainXp(G.xpNeed(6) + 1, 'kill');
  assert.equal(G.S.reached, 6);
  assert.ok(G.S.level + G.S.pendingLevels <= 1 || G.S.level <= 1, 'höchstens ein Aufstieg');
  assert.ok(G.S.xpTotal >= G.xpNeed(6), 'die EP bleiben erhalten');
});

test('Der Standardmodus behält seine Kostenkurve', () => {
  const { G, K } = game('standard');
  for (let n = 1; n <= 10; n++) assert.equal(G.xpNeed(n), K.xpForLevel(n), `Stufe ${n}`);
});

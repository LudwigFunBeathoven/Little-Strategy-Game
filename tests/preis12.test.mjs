// Tests Kartenpfad Teil 12, REQ-K12.04: Preis der nächsten Karte und Wirkung der nächsten Reglerstufe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(seed = 11){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing: 'karten' });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  KF_CONFIG.AUTO_PRESS_MID = 0; KF_CONFIG.AUTO_PRESS_LATE = 0;                  // die automatische Presse hängt an der Phase und ändert den Ertrag, sobald die EP die Phase wechseln
  G.S.material = 1e5; for (let i = 0; i < 4; i++) G.build('fabrik'); G.build('universitaet'); G.S.materialTotal = 0;
  for (let i = 0; i < 3000; i++) G.tick(0.05);                                 // Anlauf der Fabriken abwarten: danach ist der Ertrag gleichbleibend
  G.S.xpTotal = 0; G.S.stats.xpSrc = {}; G.S.reached = 0; G.S.level = 0; G.S.pendingLevels = 0;
  return { G, C: KF_CONFIG };
}
/* Zeit bis zur nächsten erreichten Schwelle bei Regler i und einem gleichbleibenden Zufluss von rate EP je Sekunde aus Abschüssen */
function messeZeit(i, rate, seed){
  const { G } = game(seed); G.setBudget(i); const dt = 0.05; let t = 0;
  while (G.S.reached < 1 && t < 4000){ G.gainXp(rate * dt, 'kill'); G.tick(dt); t += dt; }
  return t;
}

test('Der Materialpreis der nächsten Karte ist fehlende EP durch den Kurs', () => {
  const { G } = game(); G.setBudget(1);
  const v = G.budgetVorschau(5), fehlt = G.xpNeed(1) - G.S.xpTotal;
  assert.ok(Math.abs(v.fehlt - fehlt) < 1e-9);
  assert.ok(Math.abs(v.material - fehlt / (G.budgetKurs() * G.mMul('xpGain'))) < 1e-6);
  G.gainXp(fehlt / 2, 'kill');
  const w = G.budgetVorschau(5);
  assert.ok(Math.abs(w.material - v.material / 2) < 1e-6, 'halb so viele EP fehlen, halber Preis');
});

test('Ohne Universität und im Standardmodus gibt es keine Vorschau', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3, { pacing: 'standard' });
  assert.equal(G.budgetVorschau(5), null);
  const k = KlammerCore.create(); k.FX.on = false; k.newGame('normal', 3, { pacing: 'karten' });
  assert.equal(k.budgetVorschau(5), null, 'Budget braucht Universität');
});

for (const [von, rate] of [[0, 2], [0, 6], [1, 3]]){
  test(`Angezeigte Zeit und Wirkung der nächsten Stufe weichen von der Simulation höchstens 10 % ab (Stufe ${von}, ${rate} EP/s)`, () => {
    const { G, C } = game(); if (von + 1 >= C.KARTEN.budget.stufen.length) return;
    G.setBudget(von);
    const r = rate + G.budgetEpRate(), v = G.budgetVorschau(r);
    const t0 = messeZeit(von, rate, 11), t1 = messeZeit(von + 1, rate, 11);
    assert.ok(Math.abs(v.sekunden - t0) <= 0.1 * t0 + 0.2, `Zeit ${v.sekunden} gegen ${t0}`);
    assert.ok(Math.abs(v.naechste.sekunden - t1) <= 0.1 * t1 + 0.2, `Zeit mit nächster Stufe ${v.naechste.sekunden} gegen ${t1}`);
    const echt = t0 - t1;
    assert.ok(Math.abs(v.naechste.frueher - echt) <= 0.1 * Math.max(echt, 1) + 0.2, `früher ${v.naechste.frueher} gegen ${echt}`);
  });
}

test('Hält der Mindestabstand die Karte zurück, meldet die Vorschau keine frühere Karte', () => {
  const { G } = game(); G.setBudget(0);
  G.S.stats.wahlen = [{ n: 1, t: 0 }]; G.S.pfad.lastPickT = G.S.t;
  const v = G.budgetVorschau(1000);
  assert.ok(v.restAbstand > 0);
  assert.equal(v.naechste.frueher, 0);
  assert.equal(v.naechste.abstandHaelt, true);
});

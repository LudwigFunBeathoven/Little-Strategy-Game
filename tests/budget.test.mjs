// Tests Kartenpfad Teil 5, REQ-K5.05: Forschungsbudget der Universität (Hörsaal entfällt im Modus karten).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 11){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG };
}
const withEco = G => { G.S.material = 1e5; for (let i = 0; i < 4; i++) G.build('fabrik'); G.build('universitaet'); G.S.materialTotal = 0; return G; };
const second = G => { const m0 = G.S.materialTotal, x0 = G.S.xpTotal, b0 = (G.S.stats.xpSrc || {}).budget || 0; for (let i = 0; i < 20; i++) G.tick(0.05); return { mat: G.S.materialTotal - m0, xp: G.S.xpTotal - x0, budget: ((G.S.stats.xpSrc || {}).budget || 0) - b0 }; };

test('Der eingestellte Anteil des Materialertrags wird abgezogen und zum Kurs in EP gutgeschrieben', () => {
  const { G, C } = game(); C.KARTEN.budget.abnahme = 0; withEco(G);       // ohne abnehmenden Ertrag (Teil 8): der Kurs bleibt über die Messsekunde gleich
  const k = C.KARTEN.budget, gross = G.matRate() + G.autoPressCps() * G.clickPower();
  const s0 = second(G);
  assert.ok(Math.abs(s0.mat - gross) < 1e-6 * gross + 1e-6, 'ohne Budget: voller Ertrag'); assert.equal(s0.budget, 0);
  for (const [i, share] of k.stufen.entries()){
    assert.ok(G.setBudget(i), `Stufe ${i}`);
    const s = second(G), rate = k.kurs * k.kursFaktor[i];
    assert.ok(Math.abs(s.mat - gross * (1 - share)) < 1e-6 * gross + 1e-6, `Material bei ${share}: ${s.mat} gegen ${gross * (1 - share)}`);
    assert.ok(Math.abs(s.budget - gross * share * rate) < 1e-6 * gross + 1e-6, `EP bei ${share}: ${s.budget} gegen ${gross * share * rate}`);
    assert.ok(Math.abs(G.incomeRate() - gross * (1 - share)) < 1e-9, 'Anzeige des Ertrags nach Abzug');
  }
});

test('Der Kurs sinkt flach mit dem Anteil: nie unter die Hälfte des Kurses beim kleinsten Anteil, die EP je Sekunde steigen mit dem Anteil (Teil 12, REQ-K12.03)', () => {
  const { G, C } = game(); withEco(G);
  const k = C.KARTEN.budget;
  assert.deepEqual(JSON.parse(JSON.stringify(k.stufen)), [0, 0.1, 0.2, 0.3, 0.4, 0.5]);
  const kurs = k.stufen.map((_, i) => { G.setBudget(i); return G.budgetKurs(); });
  for (let i = 1; i < kurs.length; i++){
    assert.ok(kurs[i] <= kurs[i - 1] + 1e-12, `Stufe ${i}: der Kurs steigt nicht`);
    assert.ok(k.stufen[i] * kurs[i] > k.stufen[i - 1] * kurs[i - 1], `Stufe ${i}: mehr Anteil bringt in der Summe mehr EP`);
  }
  assert.ok(Math.abs(kurs[1] - k.kurs) < 1e-12, 'kleinster Anteil zum Grundkurs');
  assert.ok(kurs[kurs.length - 1] >= 0.5 * kurs[1], 'höchster Anteil mindestens 50 % des Kurses beim kleinsten');
  assert.ok(kurs[kurs.length - 1] < kurs[1], 'aber degressiv');
});

test('Das Budget braucht die Universität, lässt sich jederzeit ändern und gilt nur im Modus karten', () => {
  const { G, C } = game(); G.S.material = 1e5; G.build('fabrik');
  assert.equal(G.setBudget(1), false, 'ohne Universität');
  assert.equal(G.budgetShare(), 0);
  G.build('universitaet');
  const top = C.KARTEN.budget.stufen.length - 1, share = C.KARTEN.budget.stufen[top];
  assert.ok(G.setBudget(top)); assert.equal(G.budgetShare(), share);
  assert.ok(G.setBudget(0)); assert.equal(G.budgetShare(), 0);
  assert.equal(G.setBudget(top + 1), false, 'unbekannte Stufe'); assert.equal(G.setBudget(-1), false);
  G.setBudget(top);
  const i = G.S.slots.findIndex(s => s && s.type === 'universitaet'); G.demolish(i);
  assert.equal(G.budgetShare(), 0, 'ohne Universität wirkt es nicht'); assert.equal(G.S.budget, top, 'die Einstellung bleibt');
  G.S.material = 1e5; G.build('universitaet'); assert.equal(G.budgetShare(), share, 'mit neuer Universität wirkt es wieder');
  const { G: S } = game('standard'); S.S.material = 1e5; S.build('universitaet');
  assert.equal(S.setBudget(top), false, 'Standardmodus: kein Forschungsbudget'); assert.equal(S.budgetShare(), 0);
});

test('Klicks, Zinsen und Beute bleiben unberührt; nur Fabriken und Presse speisen das Budget', () => {
  const { G } = game(); withEco(G); G.setBudget(2);
  const m0 = G.S.material; G.doClick();
  assert.ok(G.S.material - m0 > 0, 'ein Klick bringt vollen Ertrag'); assert.equal(((G.S.stats.xpSrc || {}).budget || 0), 0, 'Klicks erzeugen kein Budget-EP');
});

test('Hörsaal entfällt im Modus karten und bleibt im Standard erforschbar', () => {
  const { G } = game(); withEco(G);
  assert.equal(G.researchBlock('r_hoersaal'), 'notInMode');
  const { G: S } = game('standard'); S.S.material = 1e5; S.build('universitaet');
  assert.equal(S.researchBlock('r_hoersaal'), null);
  assert.equal(G.mAdd('xpPassive'), 0);
});

test('Lehrjahre und die Kartenwahl: das Budget bringt EP, die zur nächsten Wahl führen', () => {
  const { G, C } = game(); C.KARTEN.budget.abnahme = 0; withEco(G);
  G.S.draft.stacks.kriegserfahrung = 1; G.S.draft.ver++;
  G.setBudget(2);
  const s = second(G);
  const gross = G.matRate() + G.autoPressCps() * G.clickPower(), rate = G.budgetKurs();
  assert.ok(Math.abs(s.budget - gross * G.budgetShare() * rate * 1.3) < 1e-6 * gross, 'Lehrjahre wirken auf das Budget');
  // genug Sekunden: aus dem Budget allein wird eine Wahl fällig
  G.S.draft.stacks.kriegserfahrung = 0; G.S.draft.ver++;
  for (let i = 0; i < 20 * 800 && !G.S.pendingDraft; i++){ G.S.sections.forEach(x => { x.hp = 1e9; }); G.tick(0.05); }
  assert.ok(G.S.pendingDraft, 'Wahl aus Forschungsbudget');
  assert.ok(G.S.stats.xpSrc.budget > 0 && G.S.xpTotal >= G.xpNeed(1));
});

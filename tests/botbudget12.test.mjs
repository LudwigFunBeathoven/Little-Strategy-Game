// Tests Kartenpfad Teil 12, REQ-K12.06: Budgetregel der Bots (fester Anteil je Strategie).
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.KF_PACING = 'karten';
const { playGame, CONFIG: C } = await import('../tools/sim-bot.mjs');
const { loadCore } = await import('../tools/load-core.mjs');
const { KF_BROWSER_BOT: BOT } = loadCore();
const stufen = C.KARTEN.budget.stufen;
const BOTS = ['ohne', 'militaer', 'wirtschaft', 'verteidigung'];

test('Jeder Bot hat einen Anteil im Regler; der Wirtschafts-Bot investiert mehr als der Militär-Bot', () => {
  for (const b of BOTS){
    const a = BOT.BUDGET_ANTEIL[b];
    assert.ok(a >= 0 && a <= stufen[stufen.length - 1], `${b}: Anteil ${a}`);
    const i = BOT.budgetStufe({}, b);
    assert.ok(stufen[i] <= a + 1e-9 && (i === stufen.length - 1 || stufen[i + 1] > a + 1e-9), `${b}: größte Stufe unter dem Anteil`);
  }
  assert.ok(BOT.BUDGET_ANTEIL.wirtschaft > BOT.BUDGET_ANTEIL.militaer, 'Strategieabhängigkeit');
  assert.ok(BOT.BUDGET_ANTEIL.ohne > 0, 'der Bot ohne Kategorie nutzt das Budget (Korridor mit Investition)');
});

test('Der Bot stellt den Regler auf seinen Anteil, sobald die Universität steht; das mittlere Budget je Phase erscheint im Ergebnis', () => {
  for (const b of ['militaer', 'wirtschaft']){
    const r = playGame({ diff: 'normal', seed: 5, profile: 'durchschnitt', strategy: 'einheiten-zuerst', pacing: 'karten', kat: b, maxMin: 8 });
    const soll = stufen[BOT.budgetStufe({}, b)];
    // Ersetzt der Flügel Bibliothek die Universität, deckelt er das Budget (budgetMax); dann gilt der Anteil höchstens bis dorthin
    if (r.slotsEnd.includes('universitaet')) assert.ok(Math.abs(r.budgetEnd - soll) < 1e-6, `${b}: am Ende ${r.budgetEnd} gegen ${soll}`);
    else assert.ok(r.budgetEnd <= soll + 1e-9 && r.budgetEnd > 0, `${b}: am Ende ${r.budgetEnd} (Bibliothek), Regel ${soll}`);
    const m = r.budgetPhase;
    for (const ph of ['early', 'mid', 'late']) assert.ok(m[ph] == null || (m[ph] >= 0 && m[ph] <= soll + 1e-9), `${b}: mittleres Budget ${ph} ${m[ph]}`);
  }
});

test('Ein ausdrücklicher Anteil (--budget) hat Vorrang vor der Regel', () => {
  const r = playGame({ diff: 'normal', seed: 5, profile: 'durchschnitt', strategy: 'einheiten-zuerst', pacing: 'karten', kat: 'militaer', budgetPct: 10, maxMin: 8 });
  assert.ok(Math.abs(r.budgetEnd - 0.1) < 1e-6, `am Ende ${r.budgetEnd}`);
});

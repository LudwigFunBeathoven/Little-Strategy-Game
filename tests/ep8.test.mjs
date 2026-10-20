// Tests Kartenpfad Teil 8, REQ-K8.01: Protokoll der Kartenwahl-Taktung (Wartezeit am Mindestabstand, Übertrag) und die Kennzahlen daraus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCore } from '../tools/load-core.mjs';
import { kennzahlen, fasseZusammen } from '../tools/ep-kennzahlen.mjs';

function game(pacing = 'karten'){
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 11, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  return { G, C: core.KF_CONFIG };
}
const neutral = G => { G.S.pendingDraft.options[0] = 'maurerkolonne'; G.chooseDraft(0); G.S.sections.forEach(s => { s.hp = 1e9; }); };
const run = (G, seconds) => { for (let i = 0; i < 20 * seconds; i++){ G.S.sections.forEach(s => { s.hp = 1e9; }); G.tick(0.05); } };

test('K8.01: eine gleich erreichte Stufe erscheint ohne Wartezeit; weitere Stufen warten den Mindestabstand ab und wachsen als Rückstau (ohne Übertragsgrenze)', () => {
  const { G, C } = game(); C.KARTEN.uebertrag = null;
  G.gainXp(G.xpNeed(4) + 1, 'kill');                      // vier Stufen auf einmal
  const w = G.S.stats.wahlen;
  assert.equal(w.length, 1, 'erste Wahl sofort');
  assert.equal(w[0].w, 0); assert.equal(w[0].rest, 3);
  assert.equal(G.S.stats.stufenT.length, 4);
  neutral(G); run(G, C.KARTEN.minAbstand + 1);
  assert.equal(w.length, 2, 'zweite Wahl nach dem Mindestabstand');
  assert.ok(Math.abs(w[1].w - C.KARTEN.minAbstand) < 0.2, `Wartezeit ${w[1].w}`);
  assert.equal(w[1].rest, 2);
  assert.ok(w[1].ue > 0 && w[1].ue < 1, `Übertrag ${w[1].ue}`);
});

test('K8.01: Wartezeit entfällt, wenn die Stufe erst nach dem Mindestabstand erreicht wird', () => {
  const { G, C } = game(); C.KARTEN.uebertrag = null;
  G.gainXp(G.xpNeed(1) + 1, 'kill'); neutral(G);
  run(G, C.KARTEN.minAbstand + 10);
  G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1, 'kill');
  const w = G.S.stats.wahlen;
  assert.equal(w.length, 2); assert.equal(w[1].w, 0);
});

test('K8.01: Modus standard schreibt keine Taktungsdaten', () => {
  const { G } = game('standard');
  G.gainXp(1e4, 'kill');
  assert.equal(G.S.stats.stufenT, undefined);
});

test('K8.01: Kennzahlen – gebremste Wahlen, Abstand vor und nach Minute 10, Übertrag', () => {
  const wahlen = [{ n: 1, t: 70, lt: 70, w: 0, ue: 0.1, rest: 0 }, { n: 2, t: 140, lt: 100, w: 3, ue: 0.3, rest: 0 }, { n: 3, t: 650, lt: 610, w: 40, ue: 0.5, rest: 1 }, { n: 4, t: 695, lt: 620, w: 45, ue: 0.7, rest: 2 }];
  const k = kennzahlen(wahlen);
  assert.equal(k.wahlen, 4); assert.equal(k.gebremst, 2); assert.equal(k.gebremstAnteil, 0.5);
  assert.equal(k.abstandVor10, 70); assert.equal(k.abstandNach10, 277.5); assert.equal(k.wartendMax, 2);
  assert.equal(fasseZusammen([wahlen, wahlen]).gebremstAnteil, 0.5);
});

test('K8.01: Auswertung eines Sitzungsprotokolls (tools/ep-protokoll.mjs)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ep8-')), f = join(dir, 'p.json');
  writeFileSync(f, JSON.stringify({ diff: 'normal', pacing: 'karten', version: 'x', result: 'won', durationS: 800,
    stufen: [{ n: 1, stufeT: 70, erschienenS: 70, wartezeitS: 0, uebertrag: 0.1, wartend: 0 }, { n: 2, stufeT: 100, erschienenS: 140, wartezeitS: 30, uebertrag: 0.4, wartend: 1 }],
    xpBySourceAt: { 5: { total: 400, kill: 300, base: 100 } } }));
  const out = execFileSync(process.execPath, ['tools/ep-protokoll.mjs', f], { encoding: 'utf8' });
  assert.match(out, /gebremst \(Wartezeit über 5 s\): 1 \(50 %\)/); assert.match(out, /Minute 5/); assert.match(out, /\| kill \| 300 \|/);
});

test('K8.02 Übertrag: Eine wartende Stufe nimmt höchstens den Anteil uebertrag.anteil der Kosten der nächsten mit; der Rest verfällt', () => {
  const { G, C } = game();
  const U = C.KARTEN.uebertrag.anteil; assert.ok(U > 0 && U <= 0.25, 'höchstens 25 %');
  G.gainXp(G.xpNeed(1) + 1, 'kill'); neutral(G);          // erste Wahl: kein Mindestabstand
  const lvl = G.S.level;
  G.gainXp(G.xpNeed(lvl + 1) - G.S.xpTotal + 1e5, 'kill');            // sehr viele EP auf einmal: genau eine Stufe wartet
  assert.equal(G.S.pendingLevels, 1, 'höchstens eine wartende Stufe');
  assert.equal(G.S.level, lvl + 1);
  const cost = G.xpNeed(lvl + 2) - G.xpNeed(lvl + 1), carry = G.S.xpTotal - G.xpNeed(lvl + 1);
  assert.ok(Math.abs(carry - U * cost) < 1e-6, `Übertrag ${carry} gegen ${U * cost}`);
  assert.ok(G.S.stats.xpVerfall > 9e4, `verfallen: ${G.S.stats.xpVerfall}`);
  const p = G.xpProgress(); assert.ok(p.cur <= p.need);
  // weitere EP bei voller Stufe verfallen ebenfalls, der Stand bleibt am Übertrag
  const v0 = G.S.stats.xpVerfall; G.gainXp(500, 'kill');
  assert.ok(Math.abs(G.S.xpTotal - G.xpNeed(lvl + 1) - U * cost) < 1e-6); assert.ok(Math.abs(G.S.stats.xpVerfall - v0 - 500) < 1e-6);
  // nach der Wahl füllt sich der Balken ab dem Übertrag weiter
  run(G, C.KARTEN.minAbstand + 1); assert.ok(G.S.pendingDraft, 'die wartende Stufe erscheint nach dem Mindestabstand'); neutral(G);
  assert.equal(G.S.pendingLevels, 0);
  const x0 = G.S.xpTotal; G.gainXp(10, 'kill'); assert.ok(Math.abs(G.S.xpTotal - x0 - 10) < 1e-9, 'ohne wartende Stufe verfällt nichts');
});

test('K8.02 Übertrag: Die Wartezeit ist durch den Übertrag kürzer als der Mindestabstand, wenn die Stufe nahezu gefüllt ist; EP gehen nicht doppelt verloren', () => {
  const { G, C } = game();
  G.gainXp(G.xpNeed(1) + 1, 'kill'); neutral(G);
  const need = G.xpNeed(G.S.level + 1) - G.S.xpTotal;
  G.gainXp(need + 1, 'kill');                                          // Stufe erreicht, Mindestabstand läuft
  const u0 = G.S.xpTotal, v0 = G.S.stats.xpVerfall || 0;
  G.gainXp(1, 'kill');                                                  // weniger als der Übertrag: nichts verfällt
  assert.ok(Math.abs(G.S.xpTotal - u0 - 1) < 1e-9); assert.equal((G.S.stats.xpVerfall || 0), v0);
});

test('K8.02 Standardmodus: keine Übertragsgrenze, keine Stufenwartezeit, S.xp bleibt gleich xpTotal', () => {
  const { G } = game('standard');
  G.gainXp(1e4, 'kill'); assert.equal(G.S.xp, G.S.xpTotal); assert.equal(G.S.stats.xpVerfall, undefined);
});

test('K8.02 Abnehmender Ertrag des Forschungsbudgets: Kurs × 1 / (1 + Summe der Budget-EP / abnahme); ohne abnahme unverändert', () => {
  const { G, C } = game();
  C.KARTEN.budget.abnahme = 200; const a = C.KARTEN.budget.abnahme;
  assert.equal(G.budgetAbnahme(), 1, 'am Anfang voller Kurs');
  G.S.stats.xpSrc = { budget: a };         assert.ok(Math.abs(G.budgetAbnahme() - 0.5) < 1e-12, 'bei Summe = abnahme halber Kurs');
  G.S.stats.xpSrc = { budget: 3 * a };     assert.ok(Math.abs(G.budgetAbnahme() - 0.25) < 1e-12);
  const k = C.KARTEN.budget.kurs * C.KARTEN.budget.kursFaktor[0] * G.mMul('budgetKurs'); assert.ok(Math.abs(G.budgetKurs() - k * 0.25) < 1e-12);
  C.KARTEN.budget.abnahme = 0; assert.equal(G.budgetAbnahme(), 1);
});

test('K8.02 Verfall: Solange EP ohnehin verfallen, bleibt das Material beim Spieler (kein Forschungsbudget, kein Tausch Material → EP)', () => {
  const { G, C } = game(); C.KARTEN.budget.abnahme = 0;
  G.S.material = 1e5; for (let i = 0; i < 4; i++) G.build('fabrik'); G.build('universitaet'); G.setBudget(2);
  const secs = s => { const m0 = G.S.materialTotal, b0 = (G.S.stats.xpSrc || {}).budget || 0; for (let i = 0; i < 20 * s; i++){ G.S.sections.forEach(x => { x.hp = 1e9; }); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); } return { mat: G.S.materialTotal - m0, budget: ((G.S.stats.xpSrc || {}).budget || 0) - b0 }; };
  let s = secs(1); assert.ok(s.budget > 0, 'ohne wartende Stufe fließt das Budget');
  G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1, 'kill');                                          // Stufe erreicht (Wahl offen)
  if (G.S.pendingDraft) neutral(G);
  G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1, 'kill'); assert.equal(G.S.pendingLevels, 1);        // wartet auf den Mindestabstand
  G.gainXp(1e4, 'kill'); assert.ok(G.xpVerfaellt());
  const gross = G.matRate() + G.autoPressCps() * G.clickPower(); s = secs(1);
  assert.equal(s.budget, 0, 'kein Budget bei verfallenden EP'); assert.ok(Math.abs(s.mat - gross) < 1e-6 * gross + 1e-6, 'voller Materialertrag'); assert.ok(Math.abs(G.incomeRate() - gross) < 1e-9, 'Anzeige des Ertrags');
  C.DOKTRIN.freihandel && (G.S.stats.xpSrc = G.S.stats.xpSrc);
  assert.equal(G.tradeBlock('ep') === 'verfall' || G.tradeBlock('ep') === 'notAvailable', true, 'Tausch gesperrt (bei Freihandel mit Grund „verfall“)');
});

test('K8.02 Verfall: xpVerfaellt gilt nur im Modus karten und nur bei wartender Stufe', () => {
  const { G } = game('standard'); G.gainXp(1e4); assert.equal(G.xpVerfaellt(), false);
  const { G: K } = game(); assert.equal(K.xpVerfaellt(), false); K.gainXp(K.xpNeed(1) - 1, 'kill'); assert.equal(K.xpVerfaellt(), false, 'Stufe noch nicht erreicht');
  K.gainXp(1 + 1e4, 'kill'); assert.equal(K.xpVerfaellt(), true, 'Stufe erreicht, Übertrag voll'); neutral(K); assert.equal(K.xpVerfaellt(), false, 'nach der Wahl füllt sich der Balken wieder');
});

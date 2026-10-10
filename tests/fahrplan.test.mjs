// Tests Kartenpfad Teil 3, REQ-P.02: Wahl-Fahrplan (Schwellen aus der Tabelle, Mindest- und Höchstabstand, Protokoll je Wahl).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 11){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; });                       // keine Niederlage während der Zeitprüfung
  return { G, C: KF_CONFIG };
}
const immortal = G => G.S.sections.forEach(s => { s.hp = 1e9; });        // chooseDraft kappt die Lebenspunkte wieder auf das Maximum
const run = (G, seconds, stop = () => false) => { for (let i = 0; i < 20 * seconds && !stop(); i++) G.tick(0.05); };

test('Fahrplan: die Schwelle der Wahl n ist die Summe der Tabelle, über das Ende hinaus gilt der letzte Schritt', () => {
  const { G, C } = game('karten');
  const st = C.KARTEN.fahrplan.schwellen;
  let sum = 0;
  for (let n = 1; n <= st.length + 3; n++){ sum += st[Math.min(n, st.length) - 1]; assert.equal(Math.round(G.xpNeed(n)), Math.round(sum), `Wahl ${n}`); }
});

test('Fahrplan: der Standardmodus behält die EP-Stufen von main', () => {
  const { G, C } = game('standard');
  const { KlammerCore } = loadCore();
  for (let n = 1; n <= 8; n++) assert.equal(Math.round(G.xpNeed(n)), Math.round(KlammerCore.xpForLevel(n)), `Stufe ${n}`);
  assert.ok(C.XP_GROWTH > 1.5);
});

test('Fahrplan: Schwellen und Zielzeiten sind gleich auf allen Schwierigkeitsgraden', () => {
  const { KlammerCore } = loadCore();
  for (const diff of ['leicht', 'normal', 'schwer']){
    const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, 3, { pacing: 'karten' });
    assert.equal(Math.round(G.xpNeed(1)), Math.round(game('karten').G.xpNeed(1)), diff);
    assert.equal(Math.round(G.xpNeed(6)), Math.round(game('karten').G.xpNeed(6)), diff);
  }
});

test('Mindestabstand: bei hohem EP-Ertrag erscheint die nächste Wahl frühestens minAbstand nach der letzten, die EP bleiben erhalten', () => {
  const { G, C } = game('karten');
  const min = C.KARTEN.fahrplan.minAbstand;
  run(G, 5);
  G.gainXp(G.xpNeed(1) - G.S.xpTotal + 1);                          // erste Wahl: kein Mindestabstand
  assert.ok(G.S.pendingDraft, 'die erste Wahl erscheint sofort');
  G.chooseDraft(0); immortal(G);                                   // soeben gewählt
  const level = G.S.level;
  G.gainXp(G.xpNeed(level + 3) - G.S.xpTotal + 1);                  // drei Schwellen auf einmal
  assert.equal(G.S.pendingLevels, 3);
  assert.equal(G.S.pendingDraft, null, 'aufgeschoben: Mindestabstand nicht erreicht');
  const xp = G.S.xpTotal;
  const p = G.xpProgress(); assert.equal(p.cur, p.need, 'Balken steht voll, solange die Wahl aufgeschoben ist');
  const t0 = G.S.t;
  run(G, min - 1);
  assert.equal(G.S.pendingDraft, null, 'nach minAbstand − 1 s noch nichts');
  run(G, 2, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'nach minAbstand erscheint die Wahl');
  assert.ok(G.S.t - t0 >= min - 0.1 && G.S.t - t0 < min + 1, `Erscheinen nach ${G.S.t - t0} s`);
  assert.ok(G.S.xpTotal >= xp, 'EP gehen nicht verloren');
  // die zweite der drei fälligen Wahlen folgt wieder erst nach dem Mindestabstand
  G.chooseDraft(0); immortal(G);
  assert.equal(G.S.pendingDraft, null);
  assert.equal(G.S.pendingLevels, 2);
  run(G, min - 1);
  assert.equal(G.S.pendingDraft, null);
  run(G, 2, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'zweite Wahl nach weiteren minAbstand Sekunden');
});

test('Fälligkeit ohne EP: jede Wahl zur Zielzeit des Fahrplans, nie später als maxAbstand nach der letzten', () => {
  const { G, C } = game('karten');
  const f = C.KARTEN.fahrplan, max = C.KARTEN.maxAbstand;
  assert.equal(max, 100, 'Höchstabstand 100 s');
  const times = [];
  for (let n = 1; n <= 4; n++){
    run(G, 200, () => G.S.pendingDraft);
    assert.ok(G.S.pendingDraft, `Wahl ${n} fällig`);
    times.push(G.S.t);
    G.chooseDraft(0); immortal(G);
  }
  for (let n = 1; n <= 4; n++) assert.ok(Math.abs(times[n - 1] - f.ziele[n - 1]) < 1, `Wahl ${n} zur Zielzeit ${f.ziele[n - 1]} s (war ${times[n - 1].toFixed(1)} s)`);
  assert.equal(G.S.pfad.free, 4, 'alle vier ohne EP');
});

test('Fälligkeit: wer vor dem Fahrplan liegt, wird nicht vorgezogen; wer dahinter liegt, wartet höchstens maxAbstand', () => {
  const { G, C } = game('karten');
  const f = C.KARTEN.fahrplan;
  // erste Wahl mit EP früh (kein Mindestabstand), die zweite bleibt bei ihrer Zielzeit (Höchstabstand 100 s reicht darüber hinaus)
  run(G, 70);
  G.gainXp(G.xpNeed(1) - G.S.xpTotal + 1);
  assert.ok(G.S.pendingDraft); const t1 = G.S.t; G.chooseDraft(0); immortal(G);
  run(G, 300, () => G.S.pendingDraft);
  assert.ok(Math.abs(G.S.t - f.ziele[1]) < 1, `zweite Wahl zur Zielzeit ${f.ziele[1]} (war ${G.S.t.toFixed(1)}), obwohl die erste schon bei ${t1.toFixed(1)} lag`);
  // Spielstand weit hinter dem Fahrplan: nach der letzten Wahl höchstens maxAbstand
  G.chooseDraft(0); immortal(G);
  G.S.t += 1000; G.S.pfad.lastPickT = G.S.t;                         // Zielzeiten längst vorbei
  const base = G.S.t;
  run(G, C.KARTEN.fahrplan.minAbstand - 1);
  assert.equal(G.S.pendingDraft, null, 'nicht vor dem Mindestabstand');
  run(G, 3, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'nach dem Mindestabstand fällig');
  assert.ok(G.S.t - base < f.minAbstand + 2);
});

test('Protokoll je Wahl: Zielzeit des Fahrplans, Erscheinen und Wahl', () => {
  const { G, C } = game('karten');
  const f = C.KARTEN.fahrplan;
  run(G, f.ziele[0] + 2, () => G.S.pendingDraft);
  G.S.sections.forEach(s => { s.hp = 1e9; });
  const t = G.S.t; G.chooseDraft(0);
  const w = G.S.stats.wahlen;
  assert.equal(w.length, 1);
  assert.equal(w[0].n, 1); assert.equal(w[0].soll, f.ziele[0]);
  assert.ok(Math.abs(w[0].t - t) < 0.2); assert.ok(w[0].tp >= w[0].t);
  // ab dem Ende der Tabelle je takt Sekunden später
  assert.equal(G.sollZeit(f.ziele.length + 2), f.ziele[f.ziele.length - 1] + 2 * f.takt);
});

test('Standardmodus: kein Mindestabstand, kein Protokoll der Wahlzeiten', () => {
  const { G } = game('standard');
  run(G, 5);
  G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t;
  G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1);
  assert.ok(G.S.pendingDraft, 'sofort');
  assert.equal(G.S.stats.wahlen, undefined);
});

test('Tutorial: während Schonfrist und Kriegsbeute kommt keine Wahl nach Zeit; danach gilt der Fahrplan', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false;
  G.newGame('normal', 11, { pacing: 'karten', hold: { maxS: 400, size: 1, bounty: true } });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  run(G, 200);
  assert.equal(G.S.pendingDraft, null, 'bis zur ersten besiegten Welle keine Wahl nach Zeit');
  G.releaseHold(true);                                             // Überspringen: keine Kriegsbeute mehr, der Fahrplan gilt
  run(G, 5, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'nach dem Überspringen ist die erste Wahl überfällig und erscheint');
});

test('Schalter zielzeitIstFrist = false: Fälligkeit nur nach Höchstabstand (Vergleich mit REQ-P.02 wörtlich)', () => {
  const { G, C } = game('karten');
  C.KARTEN.fahrplan.zielzeitIstFrist = false;
  run(G, C.KARTEN.maxAbstand + 2, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft);
  assert.ok(Math.abs(G.S.t - C.KARTEN.maxAbstand) < 1, `erste Wahl nach ${G.S.t} s`);
});

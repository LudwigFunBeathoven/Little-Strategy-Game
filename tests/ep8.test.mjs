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

test('K8.01: eine gleich erreichte Stufe erscheint ohne Wartezeit; weitere Stufen warten den Mindestabstand ab und wachsen als Rückstau', () => {
  const { G, C } = game();
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
  const { G, C } = game();
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

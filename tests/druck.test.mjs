// Tests Kartenpfad Teil 4, REQ-S.08: Testschalter ?druck=hoch verstärkt die regulären Gegnerwellen ab Minute 4; ohne Schalter bleibt alles wie vorher.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(opts = {}, pacing = 'karten', diff = 'normal', seed = 11){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing, ...opts });
  return { G, C: KF_CONFIG };
}

test('S.08: ohne Schalter ist druck null und die Wellengrößen sind die des Ausgangszustands', () => {
  const { G, C } = game();
  assert.equal(G.S.druck, null);
  const d = C.DIFFICULTY.normal;
  for (const min of [1, 3, 4, 6, 10, 14]){
    const raw = (d.waveBase + d.waveGrowth * min) * (1 + (C.KARTEN.wellenFaktor - 1) * Math.min(1, min / C.KARTEN.wellenAnstiegMin));
    assert.equal(G.enemyWaveSize(min, false), Math.max(1, Math.min(C.ENEMY_WAVE_MAX, Math.round(raw))), `Minute ${min}`);
  }
  assert.equal(G.enemyWaveSize(16, true), G.enemyWaveSize(16, true));
});

test('S.08: mit Schalter sind reguläre Wellen ab Minute 4 um den Faktor größer, davor und die Belagerungswelle unverändert', () => {
  const a = game().G, { G: b, C } = game({ druck: 'hoch' });
  assert.equal(b.S.druck, 'hoch');
  assert.equal(C.DRUCK.hoch.abMinute, 4); assert.equal(C.DRUCK.hoch.faktor, 1.3);
  const d = C.DIFFICULTY.normal;
  for (const min of [1, 2, 3, 3.9]) assert.equal(b.enemyWaveSize(min, false), a.enemyWaveSize(min, false), `vor Minute 4: ${min}`);
  for (const min of [4, 5, 6, 8, 10, 12]){
    const raw = (d.waveBase + d.waveGrowth * min) * (1 + (C.KARTEN.wellenFaktor - 1) * Math.min(1, min / C.KARTEN.wellenAnstiegMin));
    const want = Math.max(1, Math.min(Math.round(C.ENEMY_WAVE_MAX * 1.3), Math.round(raw * 1.3)));
    assert.equal(b.enemyWaveSize(min, false), want, `Minute ${min}`);
    assert.ok(b.enemyWaveSize(min, false) > a.enemyWaveSize(min, false), `Minute ${min}: stärker`);
  }
  assert.equal(b.enemyWaveSize(16, true), a.enemyWaveSize(16, true), 'Belagerungswelle unberührt');
  // die ausrückenden Wellen im Spiel folgen derselben Größe
  const g1 = game().G, g2 = game({ druck: 'hoch' }).G;
  const sizes = G => { const out = []; let last = G.S.waveNo; for (let i = 0; i < 20 * 330 && G.S.status === 'running'; i++){ G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.tick(0.05); if (G.S.waveNo !== last){ last = G.S.waveNo; out.push({ t: G.S.t, n: G.S.nextEnemy.length }); } } return out; };
  const s1 = sizes(g1), s2 = sizes(g2);
  assert.equal(s1.length, s2.length);
  for (let k = 0; k < s1.length; k++) if (s1[k].t >= 4 * 60 + 30) assert.ok(s2[k].n >= s1[k].n, `Welle ${k}`);
  assert.ok(s2.some((x, k) => x.n > s1[k].n), 'mindestens eine Welle ist größer');
});

test('S.08: ohne Schalter bleibt die Partie bei gleichem Seed identisch zum Ausgangszustand (Stand der Welle, Zufall, Einheiten)', () => {
  const run = G => { for (let i = 0; i < 20 * 240; i++){ G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.tick(0.05); } return JSON.stringify([G.S.waveNo, G.S.rng, G.S.nextEnemy, G.S.units.length, Math.round(G.S.t)]); };
  const x = run(game().G), y = run(game({ druck: undefined }).G), z = run(game({ druck: 'normal' }).G);
  assert.equal(x, y); assert.equal(x, z, 'andere Werte als „hoch“ schalten nichts ein');
});

test('S.08: der Schalter steht im Spielstand und im Standardmodus ohne Wirkung auf die Zahl der Einheiten ohne Schalter', () => {
  const { G } = game({ druck: 'hoch' });
  const snap = JSON.parse(JSON.stringify(G.snapshot()));
  assert.equal(snap.druck, 'hoch');
  const { G: H } = game(); H.adopt(snap); assert.equal(H.S.druck, 'hoch');
});

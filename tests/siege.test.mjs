// Tests Inkrement 5: Belagerungswelle statt Eskalation (REQ-19).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG };
}
/* Partie kurz vor Minute 15 ansetzen; die Basis hält, damit nur die Wellenlogik zählt */
function nearSiege(G, C){
  G.S.t = 890; G.S.nextWave = 900; G.S.nextEnemy = [];
  G.S.sections.forEach(s => { s.hp = 1e9; });
  G.S.enemyBaseHp = 1e9;
}
function runUntil(G, cond, maxS = 200){
  for (let i = 0; i < maxS * 20 && !cond(); i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.05); }
}

test('Eskalation entfällt: keine Konstanten mehr', () => {
  const { C } = game();
  assert.ok(!('ESCALATION_RATE' in C) && !('ESCALATION_START_MIN' in C));
});

test('Ankündigung genau 60 s vor der Belagerungswelle in Minute 16', () => {
  const { G, C } = game();
  nearSiege(G, C);
  assert.equal(G.S.siegeWaveT, C.SIEGE_MINUTE * 60);
  assert.equal(G.siegeAnnounced(), false);
  runUntil(G, () => G.siegeAnnounced());
  assert.ok(Math.abs(G.S.siegeAnnouncedAt - (G.S.siegeWaveT - C.SIEGE_WARNING_S)) < 0.05 + 1e-9, `angekündigt bei ${G.S.siegeAnnouncedAt}`);
  runUntil(G, () => G.S.siegeDone);
  assert.ok(Math.abs(G.S.t - C.SIEGE_MINUTE * 60) < 0.05 + 1e-9, `Belagerungswelle bei ${G.S.t}`);
});

test('Belagerungswelle: Einheiten mit dreifacher Stärke, rückt vollständig aus', () => {
  const { G, C } = game();
  nearSiege(G, C);
  runUntil(G, () => G.S.nextEnemySiege);
  const d = C.DIFFICULTY.normal, normal = Math.max(1, Math.round(d.waveBase + d.waveGrowth * C.SIEGE_MINUTE));
  assert.equal(G.S.nextEnemy.length, normal, 'normale Größe');
  const seen = new Set(G.S.units.map(u => u.id));
  runUntil(G, () => G.S.siegeDone);
  const siege = G.S.units.filter(u => u.side === 'e' && !seen.has(u.id));
  assert.equal(siege.length, normal, 'rückt vollständig aus');
  for (const u of siege){
    assert.ok(u.siege);
    assert.ok(Math.abs(u.maxHp - C.UNITS[u.type].hp * G.enemyHpMult() * C.SIEGE_STRENGTH) < 1e-6, 'dreifache Lebenspunkte');
    assert.ok(Math.abs(u.dmg - C.UNITS[u.type].dmg * G.enemyDmgMult() * C.SIEGE_STRENGTH) < 1e-6, 'dreifacher Schaden');
  }
});

test('Nach der Belagerungswelle steigt die Gegnerstärke linear, nicht exponentiell', () => {
  const { G, C } = game();
  nearSiege(G, C);
  runUntil(G, () => G.S.siegeDone);
  const sample = [];
  for (let k = 0; k < 4; k++){ sample.push(G.enemyHpMult()); runUntil(G, () => false, 60); }
  const d1 = sample[1] - sample[0], d2 = sample[2] - sample[1], d3 = sample[3] - sample[2];
  assert.ok(Math.abs(d1 - d2) < 1e-6 && Math.abs(d2 - d3) < 1e-6, `gleiche Zuwächse je Minute: ${d1}, ${d2}, ${d3}`);
  assert.ok(Math.abs(d1 - (C.DIFFICULTY.normal.hpGrowth + C.POST_SIEGE_GROWTH)) < 1e-6);
});

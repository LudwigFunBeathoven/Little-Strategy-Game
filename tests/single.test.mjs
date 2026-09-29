// Tests Iteration 5, REQ-5.05: Einzelsimulation der Einheiten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const MID = 1;
function game(seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  return { G, C: KF_CONFIG };
}
const stats = (G, f, hp, dmg) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = hp; u.dmg = dmg; u.cd = 0; } };

test('Zwei Nahkämpfer gegen einen: beide greifen an', () => {
  const { G } = game();
  const e = G.addFormation('e', MID, ['laeufer'], 500); stats(G, e, 1000, 0);
  const p = G.addFormation('p', MID, ['laeufer', 'laeufer'], 490); stats(G, p, 1000, 5);
  G.tick(0.05);
  assert.equal(G.formMembers(e)[0].hp, 1000 - 2 * 5);
});

test('Ein Fernkämpfer wählt das nächste Ziel', () => {
  const { G } = game();
  const near = G.addFormation('e', MID, ['laeufer'], 560); stats(G, near, 1000, 0);
  const far = G.addFormation('e', MID, ['laeufer'], 580); stats(G, far, 1000, 0);
  const p = G.addFormation('p', MID, ['werfer'], 480); stats(G, p, 1000, 7);
  G.tick(0.05);
  assert.equal(G.formMembers(near)[0].hp, 1000 - 7, 'nächstes Ziel getroffen');
  assert.equal(G.formMembers(far)[0].hp, 1000, 'weiteres Ziel nicht');
});

test('Gleichstand: die niedrigste Einheiten-Id wird Ziel; ein Ziel bleibt, bis es fällt', () => {
  const { G } = game();
  const a = G.addFormation('e', MID, ['laeufer'], 560); stats(G, a, 1000, 0);
  const p = G.addFormation('p', MID, ['werfer'], 480); stats(G, p, 1000, 7);
  const b = G.addFormation('e', MID, ['laeufer'], 400); stats(G, b, 1000, 0);   // gleich weit auf der anderen Seite, höhere Id
  const ua = G.formMembers(a)[0], ub = G.formMembers(b)[0];
  ub.x = 480 - (ua.x - 480);
  G.tick(0.05);
  assert.ok(ua.hp < 1000 && ub.hp === 1000, 'niedrigere Id bei gleichem Abstand');
  ub.x = 470;                                                              // b kommt näher, a bleibt Ziel
  for (const u of G.formMembers(p)) u.cd = 0;
  G.tick(0.05);
  assert.equal(ub.hp, 1000, 'Ziel wechselt nicht, solange es lebt und in Reichweite ist');
});

test('Symmetrisches Duell endet mit beiden Einheiten tot (gleichzeitige Auflösung)', () => {
  const { G } = game();
  const e = G.addFormation('e', MID, ['laeufer'], 500); stats(G, e, 10, 10);
  const p = G.addFormation('p', MID, ['laeufer'], 490); stats(G, p, 10, 10);
  G.tick(0.05);
  assert.equal(G.S.units.length, 0, 'beide gefallen');
  assert.equal(G.S.kills, 1); assert.equal(G.S.losses, 1);
});

test('Nahkämpfer greifen nur bei Kontakt an; hintere Reihen rücken nach', () => {
  const { G, C } = game();
  const e = G.addFormation('e', MID, ['laeufer'], 500); stats(G, e, 1000, 0);
  const p = G.addFormation('p', MID, Array(7).fill('laeufer'), 500 - C.MELEE_REACH); stats(G, p, 1000, 1);
  G.tick(0.05);
  assert.equal(G.formMembers(e)[0].hp, 1000 - C.FORMATION_ROW_MAX, 'nur die vorderste Reihe (5) hat Kontakt');
  const front = G.formMembers(p).filter(u => u.row === 0);
  front[0].hp = 0;
  G.tick(0.05);
  assert.equal(G.formMembers(p).filter(u => u.row === 0).length, C.FORMATION_ROW_MAX, 'Reihe wieder voll');
});

test('Türme wählen eine einzelne Einheit', () => {
  const { G, C } = game();
  G.S.material = 1e6; G.buy('turm_0');
  const e = G.addFormation('e', 0, ['laeufer', 'laeufer', 'laeufer'], C.PLAYER_BASE_WIDTH + 40); stats(G, e, 1000, 0);
  G.S.turretCd[0] = 0;
  G.tick(0.05);
  assert.equal(G.formMembers(e).filter(u => u.hp < 1000).length, 1);
});

test('Gleicher Seed, gleiche Partie', () => {
  const play = () => {
    const { KlammerCore } = loadCore();
    const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 4242);
    G.S.material = 500; G.build('fabrik');
    for (let i = 0; i < 20 * 240; i++){ if (i % 40 === 0){ G.spawn('laeufer'); G.spawn('werfer'); } if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.05); }
    return JSON.stringify(G.S);
  };
  assert.equal(play(), play());
});

test('Leistung: ein Tick mit 2 × 60 Einheiten dauert im Median höchstens 1 ms', () => {
  const { G, C } = game();
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  for (let l = 0; l < 3; l++){
    const types = Array.from({ length: 20 }, (_, i) => i % 3 === 2 ? 'werfer' : 'laeufer');
    stats(G, G.addFormation('p', l, types, C.PLAYER_BASE_WIDTH + 200), 1e9, 1);
    stats(G, G.addFormation('e', l, types, C.PLAYER_BASE_WIDTH + 320), 1e9, 1);
  }
  for (let i = 0; i < 100; i++) G.tick(C.TICK_S);
  const t = [];
  for (let i = 0; i < 300; i++){ const t0 = process.hrtime.bigint(); G.tick(C.TICK_S); t.push(Number(process.hrtime.bigint() - t0) / 1e6); }
  t.sort((a, b) => a - b);
  assert.equal(G.S.units.length, 120);
  assert.ok(t[150] <= C.PERF_TICK_MAX_MS, `Median ${t[150].toFixed(3)} ms (Soll ≤ ${C.PERF_TICK_MAX_MS} ms, REQ-6.10)`);
});

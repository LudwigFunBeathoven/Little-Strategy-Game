// Tests Iteration 6, REQ-6.02: einzelne, sichtbar versetzte Angriffe. Zuerst rot gegen v0.6 (Gleichtakt).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.newGame('normal', seed);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  return { G, C: KF_CONFIG };
}
/* Zehn Werfer einer Welle gegen ein zähes Ziel in Reichweite; liefert je Takt die Zahl der Angriffe und der neuen Geschosse */
function volley(G, C, seconds){
  const a = G.addFormation('p', 1, Array(10).fill('werfer'), 300);
  const e = G.addFormation('e', 1, ['laeufer'], 300 + C.UNITS.werfer.range - 20);
  for (const u of G.S.units){ u.hp = u.maxHp = 1e9; if (u.side === 'e') u.dmg = 0; }
  e.state = 'fight'; a.state = 'fight';
  const ticks = [];
  for (let i = 0; i < seconds * 20; i++){
    const before = new Map(G.formMembers(a).map(u => [u.id, u.cd]));
    G.FX.shots = [];
    G.tick(0.05);
    const attacks = G.formMembers(a).filter(u => u.cd > before.get(u.id)).length;
    ticks.push({ t: G.S.t, attacks, shots: G.FX.shots.filter(s => !s.turret).length });
  }
  return ticks;
}

test('Zehn Werfer einer Welle greifen innerhalb von 2 s in mindestens fünf verschiedenen Takten an', () => {
  const { G, C } = game();
  const ticks = volley(G, C, 2);
  const distinct = ticks.filter(k => k.attacks > 0).length;
  assert.ok(distinct >= 5, `Angriffe in ${distinct} verschiedenen Takten: ${ticks.filter(k => k.attacks).map(k => k.attacks).join(',')}`);
});

test('Jeder Wurf hat ein eigenes Geschoss vom Werfer zu seinem Ziel', () => {
  const { G, C } = game();
  const ticks = volley(G, C, 6);
  const attacks = ticks.reduce((a, k) => a + k.attacks, 0), shots = ticks.reduce((a, k) => a + k.shots, 0);
  assert.ok(attacks > 0);
  assert.equal(shots, attacks, 'ein Geschoss je Angriff');
  const s = (() => { G.FX.shots = []; for (let i = 0; i < 40 && !G.FX.shots.length; i++) G.tick(0.05); return G.FX.shots.find(x => !x.turret); })();
  assert.ok(s && s.from != null && s.to != null, 'Geschoss kennt Werfer und Ziel');
  assert.ok(s.y0 != null && s.y1 != null, 'Start- und Zielhöhe je Einheit, nicht die Lane-Mitte');
});

test('Streuung ändert die mittlere Schadensrate nicht (±3 %)', () => {
  const { G, C } = game(11);
  const secs = 120, ticks = volley(G, C, secs);
  const attacks = ticks.reduce((a, k) => a + k.attacks, 0);
  const expected = 10 * secs / C.UNITS.werfer.cd;
  assert.ok(Math.abs(attacks / expected - 1) < 0.03, `${attacks} Angriffe, erwartet ${expected.toFixed(0)}`);
});

test('Auch Nahkämpfer: Versatz beim Entstehen', () => {
  const { G, C } = game();
  const a = G.addFormation('p', 1, Array(5).fill('laeufer'), 300);
  const cds = G.formMembers(a).map(u => u.cd);
  assert.ok(new Set(cds.map(c => c.toFixed(4))).size >= 4, `erste Angriffspausen ${cds.map(c => c.toFixed(2))}`);
  assert.ok(cds.every(c => c >= 0 && c <= C.UNITS.laeufer.cd + 1e-9));
});

test('Gleicher Seed, gleiche Angriffszeitpunkte', () => {
  const r1 = (() => { const { G, C } = game(5); return volley(G, C, 3).map(k => k.attacks).join(); })();
  const r2 = (() => { const { G, C } = game(5); return volley(G, C, 3).map(k => k.attacks).join(); })();
  assert.equal(r1, r2);
});

test('Overkill-Vermeidung (Schalter): Fernkämpfer verteilen sich, wenn ein Ziel schon genug Schaden erhält', () => {
  const run = on => {
    const { G, C } = game(3);
    C.COMBAT.avoidOverkill = on; C.COMBAT.spawnStagger = 0;           // alle werfen im selben Takt: der Fall, den die Regel betrifft
    const a = G.addFormation('p', 1, Array(6).fill('werfer'), 300);
    const e = G.addFormation('e', 1, ['laeufer', 'laeufer', 'laeufer'], 300 + C.UNITS.werfer.range - 20);
    for (const u of G.formMembers(e)){ u.hp = u.maxHp = G.formMembers(a)[0].dmg * 1.5; u.dmg = 0; }
    for (const u of G.formMembers(a)) u.hp = u.maxHp = 1e9;
    a.state = e.state = 'fight';
    G.tick(0.05);
    return G.formMembers(e).length;
  };
  assert.equal(loadCore().KF_CONFIG.COMBAT.avoidOverkill, false, 'standardmäßig aus');
  assert.ok(run(true) < run(false), 'mit Schalter fallen mehr Gegner im ersten Takt');
});

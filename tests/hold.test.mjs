// Tests Tutorial, REQ-T.03/T.06: Ereignisse für Zuhörer und Schonfrist (erste Gegnerwelle).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const HOLD = { maxS: 150, size: 2 };
function game(diff = 'leicht', seed = 5, opts = { intro: true, hold: HOLD }){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, opts);
  return { G, C: KF_CONFIG, KlammerCore };
}
const plain = o => JSON.parse(JSON.stringify(o));
const run = (G, s) => { for (let i = 0; i < s * 20; i++) G.tick(0.05); };

test('Ereignisse: Fertigen, Bauen, Einheit kaufen, Welle ausrücken', () => {
  const { G } = game('leicht', 5, { intro: true });
  const ev = []; G.on((name, d) => ev.push([name, d]));
  G.doClick();
  assert.deepEqual(ev.filter(e => e[0] === 'materialProduced' && e[1].source === 'click').map(e => e[1].n), [1]);
  assert.ok(G.build('fabrik'));
  assert.deepEqual(plain(ev.find(e => e[0] === 'buildingBuilt')[1]), { type: 'fabrik', slot: 0 });
  G.S.material = 100;
  assert.ok(G.spawn('laeufer'));
  assert.deepEqual(plain(ev.find(e => e[0] === 'unitBought')[1]), { type: 'laeufer' });
  run(G, 21);
  const dep = ev.filter(e => e[0] === 'waveDeparted' && e[1].side === 'p');
  assert.equal(dep.length, 1, 'die eigene Welle rückt einmal aus (eine leere Welle löst nichts aus)');
  assert.equal(dep[0][1].size, 1);
});

test('Ereignis „Gegnerwelle besiegt“ kommt, wenn der letzte Gegner fällt, und nur einmal je Welle', () => {
  const { G } = game('leicht', 9, { intro: true });
  const ev = []; G.on(name => ev.push(name));
  G.S.material = 1e4;
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  for (let i = 0; i < 400 * 20 && !ev.includes('enemyWaveDefeated') && G.S.status === 'running'; i++) G.tick(0.05);
  assert.ok(ev.includes('enemyWaveDefeated'), 'eine Welle wurde besiegt');
  assert.equal(ev.filter(n => n === 'enemyWaveDefeated').length, 1);
});

test('Schonfrist: kleine erste Welle aus Läufern, rückt nicht vor dem Zeitlimit aus', () => {
  const { G } = game();
  assert.ok(G.holdActive());
  assert.equal(G.S.nextEnemy.length, HOLD.size);
  assert.ok(G.S.nextEnemy.every(q => q.type === 'laeufer'));
  run(G, 100);
  assert.equal(G.S.waveNo, 0, 'bis 100 s keine Gegnerwelle');
  assert.equal(G.S.units.filter(u => u.side === 'e').length, 0);
  run(G, 51);
  assert.equal(G.S.waveNo, 1, 'nach dem Zeitlimit rückt sie aus');
  assert.equal(G.S.units.filter(u => u.side === 'e').length, HOLD.size);
  assert.equal(G.holdActive(), false);
});

test('Schonfrist endet mit releaseHold: Welle sofort, danach Takt ohne Stau', () => {
  const { G, C } = game();
  run(G, 60);
  assert.equal(G.S.waveNo, 0);
  const sw = G.S.siegeWaveT;
  assert.equal(G.releaseHold(), true);
  assert.equal(G.releaseHold(), false, 'zweites Mal ohne Wirkung');
  G.tick(0.05);
  assert.equal(G.S.waveNo, 1, 'fällige Welle rückt sofort aus, genau eine');
  assert.equal(G.S.units.filter(u => u.side === 'e').length, HOLD.size, 'die kleine Welle bleibt erhalten');
  run(G, C.WAVE_INTERVAL_S - 1);
  assert.equal(G.S.waveNo, 1, 'nächste Welle erst nach einem vollen Takt');
  assert.ok(G.S.siegeWaveT > sw, 'Belagerungswelle bleibt im Takt');
});

test('Überspringen: Schonfrist entfällt, erste Welle zum normalen Zeitpunkt und in normaler Größe', () => {
  const { G, C } = game();
  run(G, 5);
  assert.ok(G.releaseHold(true));
  run(G, C.WAVE_INTERVAL_S - 6);
  assert.equal(G.S.waveNo, 0, 'vor dem normalen Zeitpunkt nichts');
  run(G, 2);
  assert.equal(G.S.waveNo, 1, 'zum normalen Zeitpunkt');
  const d = C.DIFFICULTY.leicht, want = Math.max(1, Math.round(d.waveBase + d.waveGrowth * (C.WAVE_INTERVAL_S / 60)));
  assert.equal(G.S.units.filter(u => u.side === 'e').length, want);
});

test('Drei Läufer halten die kleine erste Welle', () => {
  const { G } = game();
  const ev = []; G.on(name => ev.push(name));
  G.S.material = 1e4;
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  run(G, C_WAVE(G));
  G.releaseHold();
  for (let i = 0; i < 120 * 20 && !ev.includes('enemyWaveDefeated'); i++) G.tick(0.05);
  assert.ok(ev.includes('enemyWaveDefeated'));
  assert.equal(G.S.status, 'running');
  assert.equal(G.S.sections[1].hp, G.sectionMax(1), 'das Tor blieb unberührt');
});
const C_WAVE = G => Math.ceil(G.waveIn()) + 1;

test('Die Schonfrist bleibt im Spielstand erhalten', () => {
  const { G, KlammerCore } = game();
  run(G, 10);
  const H = KlammerCore.create(); H.adopt(JSON.parse(JSON.stringify(G.S)));
  assert.deepEqual(JSON.parse(JSON.stringify(H.S.hold)), HOLD);
  assert.ok(H.holdActive());
});

test('Ohne Schonfrist ist nichts verändert: keine Sperre, normale erste Welle', () => {
  const { G } = game('leicht', 5, { intro: true });
  assert.equal(G.holdActive(), false);
  run(G, 21);
  assert.equal(G.S.waveNo, 1);
});

/* ---------- Kriegsbeute (REQ-T2.04) ---------- */
const BOUNTY = { maxS: 150, size: 2, bounty: true };
function fight(G){        // drei Läufer, Schonfrist enden lassen, bis die Welle besiegt ist
  const ev = []; G.on((name, d) => ev.push([name, d]));
  G.S.material = 1e4;
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  run(G, Math.ceil(G.waveIn()) + 1);
  G.releaseHold();
  for (let i = 0; i < 120 * 20 && !ev.some(e => e[0] === 'enemyWaveDefeated'); i++) G.tick(0.05);
  return ev;
}

test('Kriegsbeute: ist die erste Welle besiegt, reichen die EP für die erste Kartenwahl, die Wahl öffnet sich', () => {
  const { G } = game('leicht', 5, { intro: true, hold: BOUNTY });
  assert.equal(G.S.firstBounty, true);
  const ev = fight(G);
  const names = ev.map(e => e[0]);
  assert.ok(names.includes('xpBounty') && names.includes('enemyWaveDefeated'));
  assert.ok(names.indexOf('xpBounty') < names.indexOf('enemyWaveDefeated'), 'Beute vor der Meldung „besiegt“');
  assert.ok(G.S.xpTotal >= G.xpNeed(1), 'EP mindestens auf der Schwelle');
  assert.ok(G.S.level >= 1 && G.S.pendingDraft, 'die erste Kartenwahl steht an');
  assert.equal(G.S.firstBounty, false, 'nur für diese Welle');
  assert.ok(plain(ev.find(e => e[0] === 'xpBounty')[1]).n > 0);
});

test('Kriegsbeute: liegt der EP-Stand schon über der Schwelle, ändert sich nichts', () => {
  const { G } = game('leicht', 5, { intro: true, hold: BOUNTY });
  G.S.xpTotal = G.xpNeed(1) + 3; G.S.xp = G.S.xpTotal; G.S.level = 1; G.S.pendingLevels = 0;
  const ev = fight(G);
  assert.ok(!ev.some(e => e[0] === 'xpBounty'), 'keine Beute');
  assert.equal(G.S.stats.xpBounty, undefined);
  assert.equal(G.S.firstBounty, false);
});

test('Kriegsbeute entfällt beim Überspringen sofort; ohne Schonfrist gibt es sie nie', () => {
  const { G } = game('leicht', 5, { intro: true, hold: BOUNTY });
  run(G, 3);
  G.releaseHold(true);
  assert.equal(G.S.firstBounty, false);
  const ev = [];
  const { G: P } = game('leicht', 5, { intro: true });
  assert.equal(P.S.firstBounty, false);
  P.on(n => ev.push(n)); P.S.material = 1e4; for (let i = 0; i < 3; i++) P.spawn('laeufer');
  for (let i = 0; i < 120 * 20 && !ev.includes('enemyWaveDefeated'); i++) P.tick(0.05);
  assert.ok(!ev.includes('xpBounty') && P.S.stats.xpBounty === undefined);
});

test('Fällt die erste Welle nicht, läuft das Spiel weiter; die Beute kommt erst mit einer besiegten Welle', () => {
  const { G } = game('leicht', 5, { intro: true, hold: BOUNTY });
  run(G, 160);                       // keine Soldaten: die Schonfrist endet nach 150 s, die Welle rückt aus
  assert.equal(G.S.firstBounty, true, 'noch nicht besiegt');
  assert.equal(G.S.status, 'running');
});

test('Ereignis „Karte gewählt“', () => {
  const { G } = game('leicht', 5, { intro: true, hold: BOUNTY });
  const ev = []; G.on((n, d) => ev.push([n, plain(d)]));
  fight(G);
  assert.ok(G.chooseDraft(0));
  const c = ev.find(e => e[0] === 'cardChosen');
  assert.ok(c && typeof c[1].id === 'string');
});

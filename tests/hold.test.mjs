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

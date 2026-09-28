// Tests Inkrement 2: Wellen mit Versorgungslimit, Wellenbefehl „Halten“ (REQ-14, REQ-15).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1, BOT = 2;
function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG };
}
const own = G => G.S.units.filter(u => u.side === 'p').length;
const sig = list => list.map(q => q.type + '@' + q.lane).sort().join(',');

test('Einheiten rücken nur im Takt aus; die Warteschlange fasst nie mehr als SUPPLY_CAP', () => {
  const { G, C } = game();
  assert.equal(G.supplyCap(), C.SUPPLY_CAP_START);
  let departures = 0;
  for (let i = 0; i < 20 * 120; i++){
    G.S.material = 1e6;
    while (G.spawn('laeufer'));
    assert.ok(G.S.queue.length <= C.SUPPLY_CAP_START);
    const before = own(G), waveDue = G.S.t + 0.05 >= G.S.nextWave - 1e-9;
    if (G.S.pendingDraft) G.chooseDraft(0);
    G.tick(0.05);
    if (own(G) > before){
      departures++;
      assert.ok(waveDue, `Einheiten außerhalb des Takts bei t = ${G.S.t.toFixed(2)}`);
      assert.ok(own(G) - before <= C.SUPPLY_CAP_START);
    }
  }
  assert.ok(departures >= 5);
});

test('Kaufknöpfe sperren bei voller Versorgung', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  for (let i = 0; i < C.SUPPLY_CAP_START; i++) assert.ok(G.spawn('werfer'));
  assert.ok(G.supplyFull());
  assert.equal(G.spawn('laeufer'), false);
});

test('Leere Warteschlange: keine eigene Welle', () => {
  const { G, C } = game();
  for (let i = 0; i < 20 * (C.WAVE_INTERVAL_S + 1); i++) G.tick(0.05);
  assert.equal(G.S.waveNo, 1);
  assert.equal(own(G), 0);
});

test('Gegnervorschau stimmt mit der tatsächlichen Gegnerwelle überein (gleicher Seed)', () => {
  const a = game('normal', 4242).G, b = game('normal', 4242).G;
  assert.equal(sig(a.S.nextEnemy), sig(b.S.nextEnemy), 'gleicher Seed, gleiche Vorschau');
  for (let w = 0; w < 6; w++){
    const G = a;
    const preview = sig(G.S.nextEnemy);
    const seen = new Set(G.S.units.map(u => u.id)), queued = G.S.enemyQueue.length;
    while (G.S.waveNo === w){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.05); }
    const arrived = G.S.units.filter(u => u.side === 'e' && !seen.has(u.id)).map(u => ({ type: u.type, lane: u.lane }));
    const late = G.S.enemyQueue.slice(queued).filter(q => !q.alarm);
    assert.equal(sig([...arrived, ...late]), preview, `Welle ${w + 1}`);
  }
});

test('Verteilung der Welle nach 12.1 mit der stärkeren angekündigten Gegnerwelle', () => {
  const { G } = game();
  G.S.material = 1e6;
  G.S.nextEnemy = [{ type: 'laeufer', lane: BOT }, { type: 'werfer', lane: BOT }, { type: 'laeufer', lane: TOP }];
  G.spawn('laeufer'); G.spawn('laeufer'); G.spawn('werfer');
  while (G.S.waveNo === 0) G.tick(0.05);
  const p = G.S.units.filter(u => u.side === 'p');
  assert.deepEqual(Array.from(p.filter(u => u.type === 'laeufer').map(u => u.lane)).sort(), [MID, BOT].sort());
  assert.deepEqual(Array.from(p.filter(u => u.type === 'werfer').map(u => u.lane)), [MID]);
});

test('Halten: Reparatur kostet 70 %, Warteschlange bleibt, Befehl springt nach der Welle zurück', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  G.S.sections[MID].hp = 100;
  const normal = G.repairCost();
  assert.equal(normal, C.REPAIR_COST);
  G.spawn('laeufer'); G.spawn('werfer');
  assert.ok(G.setHold(true));
  assert.equal(G.repairCost(), Math.ceil(C.REPAIR_COST * (1 - C.HOLD_DISCOUNT)));
  assert.equal(G.repairCost(), 42);
  const m = G.S.material; G.repair(MID);
  assert.equal(m - G.S.material, 42);
  assert.ok(G.upCost('mauer') < Math.ceil(C.UPGRADES.mauer.baseCost), 'Mauer-Upgrade verbilligt');
  while (G.S.waveNo === 0) G.tick(0.05);
  assert.equal(G.S.hold, false, 'Befehl springt zurück');
  assert.equal(G.S.queue.length, 2, 'Warteschlange bleibt erhalten');
  assert.equal(own(G), 0);
  assert.equal(G.repairCost(), C.REPAIR_COST);
  while (G.S.waveNo === 1) G.tick(0.05);
  assert.equal(own(G), 2, 'rückt mit der folgenden Welle aus');
});

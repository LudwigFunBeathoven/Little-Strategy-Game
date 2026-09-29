// Tests Iteration 5, REQ-5.06: Armee als gemeinsame Welle (ersetzt die Lane-Regeln der Formationen aus REQ-43).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1, BOT = 2;
function game(){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  return { G, C: KF_CONFIG };
}
const set = (G, f, hp, dmg) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = hp; u.dmg = dmg; } };
const run = (G, s) => { for (let i = 0; i < Math.round(s * 20); i++) G.tick(0.05); };
const spread = (types, lanes) => types.map((type, i) => ({ type, lane: lanes[i % lanes.length] }));
const frontByLane = (G, f) => [TOP, MID, BOT].map(l => { const m = G.formMembers(f).filter(u => u.lane === l && u.row === 0); return m.length ? m[0].x : null; });

test('Marsch: alle Lanes halten eine gemeinsame Front, Tempo der langsamsten Einheit', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(Array(9).fill('laeufer'), [TOP, MID, BOT]), 200);
  set(G, a, 1e6, 0);
  G.formMembers(a)[4].speed = 10;                                          // eine langsame Einheit
  const x0 = a.x; run(G, 2);
  assert.equal(a.state, 'march');
  assert.ok(Math.abs(a.x - x0 - 10 * 2) < 1e-6, 'Tempo = langsamste Einheit');
  const fr = frontByLane(G, a);
  assert.ok(Math.max(...fr) - Math.min(...fr) <= C.ROW_GAP, `Front je Lane ${fr}`);
});

test('Marsch → Kampf, sobald in irgendeiner Lane ein Gegner in Kontaktreichweite ist; die ganze Armee hält', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(Array(6).fill('laeufer'), [TOP, MID, BOT]), 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', BOT, ['laeufer'], 340); set(G, e, 1e6, 0); e.state = 'fight';    // Gegner steht
  for (let i = 0; i < 200 && a.state === 'march'; i++) G.tick(0.05);
  assert.equal(a.state, 'fight');
  assert.ok(G.formMembers(e)[0].x - a.x <= C.ARMY.contactRange + 1e-6);
  const x = a.x; G.tick(0.05);
  assert.equal(a.x, x, 'Armee steht');
});

test('Kampf → Sammeln → Marsch; Hysterese beim Verlassen des Kampfes', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(Array(6).fill('laeufer'), [TOP, MID, BOT]), 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', BOT, ['laeufer'], 300 + C.ARMY.contactRange); set(G, e, 1e6, 0); e.state = 'fight';
  G.tick(0.05);
  assert.equal(a.state, 'fight');
  // Gegner weicht innerhalb der Hysterese zurück: Kampf bleibt
  e.x = a.x + C.ARMY.contactRange + C.ARMY.contactHysteresis * 0.5; G.tick(0.05);
  assert.equal(a.state, 'fight', 'Hysterese');
  // Gegner fällt: Sammeln, alle kehren heim; danach Marsch
  for (const u of G.formMembers(e)) u.hp = 0;
  G.tick(0.05);
  assert.equal(a.state, 'regroup');
  for (let i = 0; i < 200 && a.state === 'regroup'; i++) G.tick(0.05);
  assert.equal(a.state, 'march');
  assert.ok(G.formMembers(a).every(u => u.lane === u.home && u.laneF === u.home));
});

test('Sammeln endet spätestens nach dem Zeitlimit', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(Array(3).fill('laeufer'), [TOP, MID, BOT]), 300); set(G, a, 1e6, 0);
  a.state = 'regroup'; a.t = 0;
  for (const u of G.formMembers(a)) u.home = u.lane === TOP ? BOT : u.lane;   // Weg, der länger dauert als das Limit
  const shift = C.LANE_SHIFT_S; C.LANE_SHIFT_S = 60;
  run(G, C.ARMY.regroupTimeoutS + 0.1);
  C.LANE_SHIFT_S = shift;
  assert.equal(a.state, 'march');
});

test('Kampfreihenfolge: freie Lanes helfen, Mitte zuerst; eigene Lane mit Gegner geht vor', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(Array(6).fill('laeufer'), [TOP, MID, BOT]), 300); set(G, a, 1e6, 0);
  const eTop = G.addFormation('e', TOP, ['laeufer'], 300 + C.ARMY.contactRange); set(G, eTop, 1e6, 0); eTop.state = 'fight';
  const eMid = G.addFormation('e', MID, ['laeufer'], 300 + C.ARMY.contactRange); set(G, eMid, 1e6, 0); eMid.state = 'fight';
  G.tick(0.05);
  const m = G.formMembers(a);
  assert.ok(m.filter(u => u.home === TOP).every(u => u.lane === TOP), 'oben bleibt oben (eigener Gegner)');
  assert.ok(m.filter(u => u.home === MID).every(u => u.lane === MID), 'Mitte bleibt');
  assert.ok(m.filter(u => u.home === BOT).every(u => u.lane === MID), 'unten hilft der Mitte (Vorrang)');
});

test('Kampfreihenfolge ohne Mitte: Lane mit den meisten Gegnern, bei Gleichstand die obere', () => {
  for (const [nTop, nBot, want] of [[1, 2, BOT], [2, 1, TOP], [1, 1, TOP]]){
    const { G, C } = game();
    const a = G.addGroup('p', spread(Array(3).fill('laeufer'), [MID]), 300); set(G, a, 1e6, 0);
    const x = 300 + C.ARMY.contactRange;
    const t = G.addFormation('e', TOP, Array(nTop).fill('laeufer'), x); set(G, t, 1e6, 0); t.state = 'fight';
    const b = G.addFormation('e', BOT, Array(nBot).fill('laeufer'), x); set(G, b, 1e6, 0); b.state = 'fight';
    G.tick(0.05);
    assert.ok(G.formMembers(a).every(u => u.lane === want), `${nTop}:${nBot} → Lane ${want}`);
  }
});

test('Einreihen: Nahkämpfer schließen vorn Lücken, Fernkämpfer dahinter', () => {
  const { G, C } = game();
  const a = G.addGroup('p', [...spread(['laeufer', 'laeufer'], [TOP]), ...spread(['laeufer', 'laeufer', 'werfer'], [BOT])], 300); set(G, a, 1e6, 0);
  const e = G.addFormation('e', TOP, ['laeufer'], 300 + C.ARMY.contactRange); set(G, e, 1e6, 0); e.state = 'fight';
  run(G, C.LANE_SHIFT_S + 0.2);
  const top = G.formMembers(a).filter(u => u.lane === TOP);
  assert.equal(top.length, 5);
  assert.equal(top.filter(u => u.row === 0 && !u.ranged).length, 4, 'vier Nahkämpfer in der vordersten Reihe');
  assert.ok(top.filter(u => u.ranged).every(u => u.row === 1), 'Fernkämpfer dahinter');
});

test('Ausnahme Mitte: fällt die letzte Einheit der Mitte, geben die äußeren Lanes ab (Nahkämpfer zuerst)', () => {
  const { G } = game();
  const placed = [{ type: 'laeufer', lane: MID }, ...spread(['laeufer', 'werfer', 'laeufer', 'werfer', 'laeufer', 'werfer'], [TOP, BOT])];
  const a = G.addGroup('p', placed, 300); set(G, a, 1e6, 0);
  G.formMembers(a).find(u => u.home === MID).hp = 0;
  G.tick(0.05);
  const m = G.formMembers(a), mid = m.filter(u => u.home === MID);
  assert.equal(m.length, 6);
  assert.equal(mid.length, Math.ceil(6 / 3), 'ein Drittel der Armee');
  assert.ok(mid.every(u => !u.ranged), 'Nahkämpfer zuerst');
});

test('Nachschub: Aufschlusstempo, verschmilzt hinter der Armee und füllt die schwächste Lane', () => {
  const { G, C } = game();
  const a = G.addGroup('p', spread(['laeufer', 'laeufer', 'laeufer'], [MID, TOP, MID]), 600); set(G, a, 1e6, 0);
  a.state = 'fight';                                                         // Armee steht
  const e = G.addFormation('e', MID, ['laeufer'], 600 + C.ARMY.contactRange); set(G, e, 1e6, 0); e.state = 'fight';
  const r = G.addGroup('p', spread(['laeufer', 'laeufer'], [MID]), 300); set(G, r, 1e6, 0);
  assert.equal(r.main, false);
  const x0 = r.x; G.tick(0.05);
  assert.ok(Math.abs(r.x - x0 - C.UNITS.laeufer.speed * C.ARMY.catchUpFactor * 0.05) < 1e-6, 'Aufschlusstempo');
  run(G, 10);
  assert.equal(G.S.forms.filter(f => f.side === 'p').length, 1, 'verschmolzen');
  const homes = G.formMembers(a).map(u => u.home).sort();
  assert.deepEqual(homes, [TOP, TOP, MID, MID, BOT].sort(), 'erst unten (schwächste), dann oben (Gleichstand ohne Mitte → obere)');
});

test('Fällt die Armee vollständig, bildet die nächste Welle eine neue Armee', () => {
  const { G } = game();
  const a = G.addGroup('p', spread(['laeufer'], [MID]), 600); set(G, a, 1, 0);
  G.formMembers(a)[0].hp = 0; G.tick(0.05);
  assert.equal(G.mainOf('p'), null);
  G.S.material = 1e6; G.spawn('laeufer'); G.S.nextOwnWave = G.S.t;
  G.tick(0.05);
  assert.equal(G.mainOf('p').main, true);
});

test('Der Gegner folgt derselben Logik: Kampf an der Mauer, Zustand für beide Seiten', () => {
  const { G, C } = game();
  const e = G.addGroup('e', spread(['laeufer', 'laeufer', 'laeufer'], [TOP, MID, BOT]), C.PLAYER_BASE_WIDTH + 100); set(G, e, 1e6, 1);
  run(G, 5);
  assert.equal(e.state, 'fight');
  assert.equal(G.armyState('e'), 'fight');
  assert.ok(Math.abs(e.x - C.PLAYER_BASE_WIDTH - C.ARMY.contactRange) < 1.8);
});

test('Türme: zuerst die eigene Lane, sonst Gegner in der Mitte', () => {
  const { G, C } = game();
  G.S.material = 1e6; G.buy('turm_0');
  const e = G.addGroup('e', [{ type: 'laeufer', lane: MID }], C.PLAYER_BASE_WIDTH + 60); set(G, e, 1e6, 0); e.state = 'fight';
  run(G, 0.1);
  const m = G.formMembers(e)[0];
  assert.ok(m.hp < 1e6, 'Turm oben trifft die Mitte, wenn oben niemand ist');
  G.S.units.push(G.makeUnit('e', 'laeufer', TOP, C.PLAYER_BASE_WIDTH + 60, e.id)); G.layoutAll();
  const top = G.formMembers(e).find(u => u.lane === TOP); top.hp = top.maxHp = 1e6; top.dmg = 0;
  const hpMid = m.hp; G.S.turretCd[TOP] = 0;
  G.tick(0.05);
  assert.ok(top.hp < 1e6, 'eigene Lane hat Vorrang');
  assert.equal(m.hp, hpMid);
});

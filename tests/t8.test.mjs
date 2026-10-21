// Tests Kartenpfad Teil 8 (REQ-K8.04 …): Bezeichnung der Manufaktur, Reichweitenleiter, Gegner-Fernkampf, Belagerungsgerät, Grenzfeste.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadI18n } from '../tools/load-core.mjs';

test('K8.04: Der Schlüssel bld.fabrik.nth.karten entfällt; im Modus karten rendert panels.js die Bauoption ohne Ordnungszahl, Modus standard behält „Fabrik Nr. n“', () => {
  const I = loadI18n();
  for (const lang of ['de', 'en']) assert.equal(I[lang]['bld.fabrik.nth.karten'], undefined, `${lang}: Schlüssel entfernt`);
  assert.equal(I.de['bld.fabrik.nth'], 'Fabrik Nr. {n}'); assert.equal(I.en['bld.fabrik.nth'], 'Factory no. {n}');
  const src = readFileSync(new URL('../panels.js', import.meta.url), 'utf8');
  assert.match(src, /G\.pacing\(\) === 'karten' \? slotName\(\{ type: 'fabrik' \}\) : t\('bld\.fabrik\.nth'/, 'der Ordnungsschlüssel wird nur im Standardmodus gerendert');
  assert.ok(I.de['fab.stat.grenze'].includes('{n}/{max}') && I.de['haus.grenze.value'].includes('{m} von höchstens {n}'), 'die Zahl steht in der Grenzanzeige');
});

/* ---------- K8.05 Reichweitenleiter ---------- */
import { loadCore } from '../tools/load-core.mjs';
function game(pacing = 'karten', seed = 7){
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  return { G, C: core.KF_CONFIG };
}
const LADDER = ['werfer', 'bogenschuetze', 'armbrust', 'katapult', 'geschuetz'];

test('K8.05: Grundreichweiten im Modus karten: strikte Leiter mit mindestens 10 % Abstand, nach den Faktoren auf R_W, keine Reichweite sinkt', () => {
  const { G, C } = game(); const RW = C.UNITS.werfer.range, F = { werfer: 1, bogenschuetze: 1.3, armbrust: 1.5, katapult: 1.8, geschuetz: 2.2 };
  const r = LADDER.map(id => G.baseRange(id));
  for (let i = 1; i < r.length; i++) assert.ok(r[i] >= r[i - 1] * 1.1, `${LADDER[i]} ${r[i]} mindestens 10 % über ${LADDER[i - 1]} ${r[i - 1]}`);
  for (const id of LADDER){ assert.ok(Math.abs(G.baseRange(id) - RW * F[id]) <= 1, `${id}: ${G.baseRange(id)} gegen ${RW * F[id]}`); assert.ok(G.baseRange(id) >= C.UNITS[id].range, `${id} sinkt nicht`); }
  assert.equal(G.baseRange('werfer'), RW, 'Werfer unverändert');
  for (const id of LADDER) assert.equal(G.unitRange('e', id), Math.min(C.UNITS[id].range, C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel), `gegnerische ${id}: keine Leiter, höchstens Turm mit einer Reichweitenstufe`);
  const { G: S } = game('standard'); for (const id of LADDER) assert.equal(S.baseRange(id), C.UNITS[id].range, `Standardmodus: ${id} unverändert`);
});

test('K8.05: Die Leiter gilt auf allen Schmiede-Stufen und mit allen Ausbauten; Karten, die nur Türme betreffen, ändern keine Einheit', () => {
  const { G, C } = game();
  const ranges = () => LADDER.map(id => G.unitRange('p', id));
  const base = ranges();
  for (let q = 0; q <= 12; q++){ G.S.lvl.qualitaet = q; assert.deepEqual(ranges(), base, `Schmiede-Stufe ${q}`); }
  G.S.lvl.qualitaet = 0;
  for (const card of ['bastion', 'turmschule']){ G.S.draft.stacks = { [card]: 1 }; G.S.draft.ver++; assert.deepEqual(ranges(), base, `Karte ${card}`); }
  for (const id of Object.keys(C.UPGRADES)){ if (!/reichweite|ausbau|mauer/.test(id)) continue; G.S.lvl[id] = 3; assert.deepEqual(ranges(), base, `Ausbau ${id}`); G.S.lvl[id] = 0; }
  for (let i = 1; i < base.length; i++) assert.ok(base[i] > base[i - 1]);
});

test('K8.05: Lange Wurfarme (+25/+50 für Werfer und Bogenschütze) wirken wie bisher additiv; die Karte kann Bogenschütze und Werfer über die Grundreichweiten der nächsten Stufen heben (bekannte Folge, im Bericht)', () => {
  const { G, C } = game();
  for (const [stufe, add] of [[1, 25], [2, 50]]){
    G.S.draft.stacks = { langeWurfarme: stufe }; G.S.draft.ver++;
    assert.equal(G.unitRange('p', 'werfer'), C.UNITS.werfer.range + add); assert.equal(G.unitRange('p', 'bogenschuetze'), G.baseRange('bogenschuetze') + add);
    assert.equal(G.unitRange('p', 'armbrust'), G.baseRange('armbrust'), 'Armbrust nicht betroffen');
    assert.equal(G.unitRange('e', 'werfer'), C.UNITS.werfer.range, 'Gegner nicht betroffen');
  }
  // Stufe 2: Werfer 155 < Armbrust 158 (Leiter hält), Bogenschütze 187 > Armbrust 158 (die Leiter kippt)
  assert.ok(G.unitRange('p', 'werfer') < G.unitRange('p', 'armbrust')); assert.ok(G.unitRange('p', 'bogenschuetze') > G.unitRange('p', 'armbrust'));
});

/* ---------- K8.06 Gegner mit Bogen- und Armbrustschützen ---------- */
function rolled(G, minute, siege = false){ G.S.nextWave = minute * 60; G.S.siegeDone = !siege; G.S.siegeWaveT = siege ? 0 : 1e9; const w = G.rollEnemyWave(); return w; }
const count = (w, type) => w.filter(q => q.type === type).length;

test('K8.06: Bogenschützen erst ab der 1,5-fachen, Armbrustschützen ab der 2,5-fachen Größe der ersten Welle; je Typ höchstens 25 % der Welle', () => {
  const { G, C } = game(); const F = C.KARTEN.gegnerFern; assert.equal(F.bogen.ab, 1.5); assert.equal(F.armbrust.ab, 2.5); assert.equal(F.bogen.anteil, 0.25);
  const first = G.enemyWaveSize(0, false);
  let sawBogen = false, sawArm = false;
  for (let m = 0; m <= 16; m += 0.5) for (let k = 0; k < 12; k++){
    const size = G.enemyWaveSize(m, false), w = rolled(G, m), ratio = size / first;
    assert.equal(w.length, size);
    if (ratio < F.bogen.ab) assert.equal(count(w, 'bogenschuetze'), 0, `Minute ${m}: Stärke ${ratio.toFixed(2)} ohne Bogenschützen`);
    if (ratio < F.armbrust.ab) assert.equal(count(w, 'armbrust'), 0, `Minute ${m}: Stärke ${ratio.toFixed(2)} ohne Armbrustschützen`);
    assert.ok(count(w, 'bogenschuetze') <= Math.floor(0.25 * size) && count(w, 'armbrust') <= Math.floor(0.25 * size), `höchstens 25 % je Typ (Größe ${size})`);
    if (count(w, 'bogenschuetze')) sawBogen = true; if (count(w, 'armbrust')) sawArm = true;
  }
  assert.ok(sawBogen && sawArm, 'beide Typen kommen vor, sobald die Welle stark genug ist');
});

test('K8.06: Schalter ?gegnerfern=aus und Standardmodus: keine gegnerischen Bogen- und Armbrustschützen; die Wellengrößen bleiben gleich', () => {
  for (const opts of [{ pacing: 'karten', gegnerfern: 'aus' }, { pacing: 'standard' }]){
    const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3, opts);
    for (let m = 0; m <= 16; m += 1) for (let k = 0; k < 6; k++){ const w = rolled(G, m); assert.equal(count(w, 'bogenschuetze') + count(w, 'armbrust'), 0, `${JSON.stringify(opts)} Minute ${m}`); }
  }
  const a = game().G, core = loadCore(), b = core.KlammerCore.create(); b.FX.on = false; b.newGame('normal', 7, { pacing: 'karten', gegnerfern: 'aus' });
  assert.equal(a.enemyWaveSize(9, false), b.enemyWaveSize(9, false));
});

test('K8.06: Die Belagerungswelle (dreifache Größe) mischt Fernkämpfer bei; die Werte der Typen sind die der Einheiten, skaliert wie die übrigen Gegner', () => {
  const { G, C } = game(); const w = rolled(G, 16, true);
  assert.ok(count(w, 'bogenschuetze') > 0 && count(w, 'armbrust') > 0, 'Belagerungswelle');
  const L = G.unitStats('e', 'laeufer'), B = G.unitStats('e', 'bogenschuetze'), A = G.unitStats('e', 'armbrust');
  assert.ok(Math.abs(B.hp / L.hp - C.UNITS.bogenschuetze.hp / C.UNITS.laeufer.hp) < 1e-9 && Math.abs(A.dmg / L.dmg - C.UNITS.armbrust.dmg / C.UNITS.laeufer.dmg) < 1e-9, 'gleiche Skalierung wie Läufer');
  assert.equal(B.range, C.UNITS.bogenschuetze.range); assert.equal(A.range, C.UNITS.armbrust.range);
});

/* ---------- K8.07 Belagerungsgerät entfällt, Durchbruch Stufe II; K8.08 Grenzfeste ---------- */
test('K8.07: Belagerungsgerät ist im Modus karten nicht im Pool (Standardmodus unverändert); Durchbruch Stufe II trägt dessen Effekt (Basis verliert Lebenspunkte je Sekunde)', () => {
  const { G, C } = game();
  assert.ok(G.cardRemoved('belagerungsgeraet'), 'entfallen im Modus karten');
  for (let k = 0; k < 40; k++){ G.S.pfad.choices = 6; G.S.level = 8; assert.ok(!G.drawOptionsKarten(4, false).includes('belagerungsgeraet')); }
  const { G: S } = game('standard'); assert.ok(!S.cardRemoved('belagerungsgeraet'), 'Standardmodus behält die Karte');
  G.S.draft.stacks = { durchbruch: 1 }; G.S.draft.ver++; assert.equal(G.mMul('dmgVsBase'), 2); assert.equal(G.mAdd('siegeDps'), 0);
  G.S.draft.stacks = { durchbruch: 2 }; G.S.draft.ver++; assert.equal(G.mMul('dmgVsBase'), 2); assert.equal(G.mAdd('siegeDps'), 2);
  assert.equal(C.KARTEN.kartenTiers.belagerungsgeraet, undefined, 'keine Stufen mehr für die entfallene Karte');
  assert.equal(G.OPT.durchbruch.tiers.length, 2);
});

test('K8.07: Durchbruch Stufe II wirkt wie Stufe 2 von Belagerungsgerät: Stehen eigene Einheiten vor der gegnerischen Basis, verliert sie Lebenspunkte je Sekunde (Stufe I: nicht)', () => {
  const run = stufe => {
    const { G, C } = game(); G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.S.units = []; G.S.forms = [];
    G.S.draft.stacks = { durchbruch: stufe }; G.S.draft.ver++;
    const f = G.addFormation('p', 1, ['schild'], C.LANE - C.ENEMY_BASE_WIDTH - 60); for (const u of G.S.units) if (u.form === f.id){ u.dmg = 0; u.hp = u.maxHp = 1e9; }
    const hp0 = G.S.enemyBaseHp; for (let i = 0; i < 20 * 10; i++){ G.S.sections.forEach(s => { s.hp = 1e9; }); G.tick(0.05); }
    return hp0 - G.S.enemyBaseHp;
  };
  const d1 = run(1), d2 = run(2); assert.ok(d2 - d1 >= 2 * 9, `Stufe II: ${d2} gegen Stufe I: ${d1}`);
});

test('K8.08: Grenzfeste verlängert den Abstand der eigenen Wellen nur noch um 10 % (vorher 25 %); der Effekt bleibt', () => {
  const { G } = game(); const d = G.DOK.grenzfeste;
  assert.equal(JSON.stringify(d.drawback.map(x => [x.stat, x.mul])), JSON.stringify([['ownWaveInterval', 1.1]])); assert.equal(JSON.stringify(d.effect.map(x => [x.stat, x.add])), JSON.stringify([['towerKillMaterial', 3]]));
});

/* PO-Entscheidung zu Teil 8: Kein Gegner reicht weiter als ein eigener Turm mit einer Reichweitenstufe (Standard: Grundreichweite + rangePerLevel; im Modus karten bringt schon die erste Stufe der Turmschule mehr) */
test('Gegnerische Reichweiten liegen nie über dem Turm mit einer Reichweitenstufe', () => {
  for (const pacing of ['karten', 'standard']){
    const { G, C } = game(pacing); const grenze = C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel;
    for (const type of Object.keys(C.UNITS)) assert.ok(G.baseRange(type, 'e') <= grenze, `${pacing}: ${type} ${G.baseRange(type, 'e')} ≤ ${grenze}`);
    for (const type of ['bogenschuetze', 'armbrust']) assert.ok(G.baseRange(type, 'e') <= grenze);
  }
});

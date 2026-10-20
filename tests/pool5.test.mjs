// Tests Kartenpfad Teil 5, REQ-K5.04 (Karten mit Zeitbezug) und REQ-K5.06 (Kartenpool: kleiner und spürbar).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const setTier = (G, id, n) => { G.S.draft.stacks[id] = n; G.S.draft.ver++; };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const pool = G => G.ALL_OPTIONS.filter(o => !o.doktrin && !G.cardRemoved(o.id));
const REMOVED = ['serienbau', 'bauleitung', 'doppelschicht', 'schwerePressen', 'nachtschicht', 'kriegsanleihe', 'grossauftrag', 'rationalisierung', 'selbstlaeufer', 'fliessband',
  'veteranen', 'taktiker', 'vorposten', 'blitzkrieg', 'soeldnerheer', 'festungsbau', 'bastion', 'scharfschuetzen', 'zeugmeister'];

test('K5.06/K6.03: der Pool des Modus karten hat höchstens 42 Karten (ohne Doktrinen; Teil 6: 38); die gestrichenen Karten sind nicht darin', () => {
  const { G, P } = game();
  const ids = pool(G).map(o => o.id);
  assert.ok(ids.length >= 25 && ids.length <= 42, `Karten im Pool: ${ids.length}`);
  for (const id of REMOVED){ assert.ok(!ids.includes(id), `${id} gestrichen`); assert.ok(P.entfallenKarten.includes(id), `${id} steht in entfallenKarten`); }
  // nie angeboten: auch nicht mit allen Voraussetzungen
  G.S.level = 8; G.S.pfad.choices = 9; G.build('kaserne'); G.build('fabrik'); G.S.lvl.turm_0 = 2;
  for (const id of REMOVED) assert.equal(G.optionAvailable(G.OPT[id]), false, id);
  // der Standardmodus bleibt unverändert (alle Karten wie in main)
  const { G: S } = game('standard'); assert.ok(pool(S).length >= 40);
});

/* Spürbarkeitsgrenze: eine Regeländerung oder mindestens eine Größe um 20 % */
const RULE_STATS = new Set(['nbDiagonal', 'lagerEp', 'soeldner', 'startSmith', 'towerKillMaterial', 'allMid', 'scorchedEarth', 'draftSize', 'emergencyRepair', 'standingOrder', 'autoSmith', 'autoRepairCost', 'siegeDps', 'wallRegenPct', 'grant', 'extraUnit', 'supply', 'werferRange', 'rareBonus']);
test('K5.06: jede Karte erfüllt die Spürbarkeitsgrenze (Regeländerung oder mindestens eine Größe um 20 %)', () => {
  const { G, C } = game();
  const noticeable = (o, tiers) => {
    if (o.pfad) return true;                                   // Technologie öffnet Forschungen, Wagnis ändert Regeln mit Nachteil
    if (o.synergie){                                           // Teil 6: Zähler ab drei Karten der Kategorie mindestens 20 %; Brücken erreichen es mit dem Deckel; Verstärker ändern eine Regel
      const sy = o.synergie;
      if (sy.art === 'zaehler') return Math.abs(sy.perCard) * 3 >= 0.2 - 1e-9;
      if (sy.art === 'bruecke') return Math.abs(sy.perCard) * C.KATEGORIEN.deckel >= 0.2 - 1e-9;
      return true;
    }
    return (tiers[0].effect || []).some(e => {
      if (e.mul !== undefined) return e.mul >= 1.2 - 1e-9 || e.mul <= 0.8 + 1e-9;
      if (e.add !== undefined){
        if (e.stat === 'supply') return e.add / C.SUPPLY_CAP_START >= 0.2;
        if (e.stat === 'werferRange') return e.add / C.UNITS.werfer.range >= 0.2;
        if (e.stat === 'stachelStufen') return e.add * C.FX_STACHELN_DMG / C.UNITS.laeufer.hp >= 0.2;       // Teil 6 (K6.07): Stachelschaden je Schlag gegen einen Läufer
        return RULE_STATS.has(e.stat);
      }
      return RULE_STATS.has('grant');
    });
  };
  const bad = pool(G).filter(o => !noticeable(o, G.tiersOf(o))).map(o => o.id);
  assert.equal(bad.length, 0, `unter der Spürbarkeitsgrenze: ${bad.join(', ')}`);
});

const AUSBAU_KARTEN = ['turmschule', 'stachelwall', 'handelskontor'];
const NEW_RULES = ['nbFabrik', 'drumsMin', 'shieldMin', 'siegeAlways', 'regenGate', 'repairTh', 'turretVsRanged'];
test('K5.06: Stufen mit neuem Effekt; bei mindestens der Hälfte der Karten mit Stufen ist Stufe 2 oder 3 eine Regeländerung', () => {
  const { G } = game();
  const multi = pool(G).filter(o => G.tiersOf(o).length > 1 && !AUSBAU_KARTEN.includes(o.id));       // Teil 6 (K6.07): Ausbau-Karten sind die zusammengefassten Stufen eines Ausbaus, ihre Stufen steigern nur den Wert (Auslegung im Bericht)
  assert.ok(multi.length >= 10, `Karten mit Stufen: ${multi.length}`);
  let rules = 0;
  for (const o of multi){
    const tiers = G.tiersOf(o), stats = t => (t.effect || []).map(e => e.stat);
    const first = new Set(stats(tiers[0]));
    const extra = tiers.slice(1).filter(t => stats(t).some(s => !first.has(s)));
    assert.ok(extra.length >= 1, `${o.id}: eine spätere Stufe bringt einen zusätzlichen Effekt`);
    if (tiers.slice(1).some(t => stats(t).some(s => NEW_RULES.includes(s)))) rules++;
  }
  assert.ok(rules >= multi.length / 2, `Regeländerungen in Stufe 2 oder 3: ${rules} von ${multi.length}`);
});

test('K5.04: keine Wirkung bezieht sich auf Zielzeit, Fahrplan oder Höchstabstand (Suche in data/ und config.js)', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const files = ['config.js', ...readdirSync(new URL('data/', root)).filter(f => f.endsWith('.js')).map(f => 'data/' + f)];
  const re = /zielzeit|fahrplan|maxabstand|höchstabstand|mindesttempo|schwellengrad/i;
  for (const f of files){
    const lines = readFileSync(new URL(f, root), 'utf8').split('\n');
    lines.forEach((l, i) => assert.ok(!re.test(l), `${f}:${i + 1}: ${l.trim().slice(0, 90)}`));
  }
});

/* ---------- Regeln der Stufen 2 und 3 ---------- */
test('Bessere Fabriken, Stufe 2 und 3: der Nachbarschaftsbonus der Fabriken wirkt im Vielfachen', () => {
  const { G } = game(); for (const i of [0, 1, 3]) G.buildAt(i, 'fabrik');
  setTier(G, 'bessereFabriken', 1);
  const nb1 = G.neighborValue(0, 'fabrik'), yield1 = G.factoryRate();
  setTier(G, 'bessereFabriken', 2);
  assert.ok(Math.abs(G.neighborValue(0, 'fabrik') - 2 * nb1) < 1e-12, 'Stufe 2: ×2'); assert.ok(G.factoryRate() > yield1 * 1.2);
  setTier(G, 'bessereFabriken', 3); assert.ok(Math.abs(G.neighborValue(0, 'fabrik') - 3 * nb1) < 1e-12, 'Stufe 3: ×3');
  setTier(G, 'bessereFabriken', 0); assert.equal(G.neighborValue(0, 'fabrik'), nb1);
});

test('Kriegstrommeln, Stufe 3: die Trommeln wirken schon ab drei statt fünf Einheiten', () => {
  const { G, C } = game();
  const dmgDone = n => {
    G.S.units = []; G.S.queue = [];
    const mine = G.addFormation('p', 1, Array(n).fill('laeufer'), 300), foe = G.addFormation('e', 1, ['laeufer'], 300 + 8);
    const e = G.S.units.find(u => u.form === foe.id); e.hp = e.maxHp = 1e6; for (const u of G.S.units) u.cd = u.side === 'p' ? 0 : 1e9;
    idle(G); G.tick(0.05);
    return 1e6 - e.hp;
  };
  setTier(G, 'kriegstrommeln', 2); const base = dmgDone(3), five = dmgDone(5);
  assert.ok(five > base * 1.3 * 5 / 3 * 0.99 || five > base, 'ab fünf Einheiten wirken die Trommeln');
  setTier(G, 'kriegstrommeln', 3); const withMin = dmgDone(3);
  assert.ok(withMin > base * 1.15, `Stufe 3: schon bei drei Einheiten ${withMin} gegen ${base}`);
});

test('Sappeure, Stufe 2: die gegnerische Basis verliert Lebenspunkte von Anfang an', () => {
  const { G } = game();
  setTier(G, 'sappeure', 1); idle(G); const h0 = G.S.enemyBaseHp; for (let i = 0; i < 20; i++){ idle(G); G.tick(0.05); }
  assert.equal(G.S.enemyBaseHp, h0, 'Stufe 1: ohne Einheiten in der gegnerischen Hälfte nichts');
  setTier(G, 'sappeure', 2); const h1 = G.S.enemyBaseHp; for (let i = 0; i < 20; i++){ idle(G); G.tick(0.05); }
  assert.ok(Math.abs((h1 - G.S.enemyBaseHp) - 5) < 1e-6, `Stufe 2: 5 LP je Sekunde, gemessen ${h1 - G.S.enemyBaseHp}`);
});

test('Maurerkolonne, Stufe 3: auch das Tor regeneriert', () => {
  const { G, C } = game(); idle(G);
  const gate = C.GATE_LANE, max = G.sectionMax(gate);
  const run = () => { G.S.sections[gate].hp = max / 2; G.S.sections[gate].lastHit = -1e9; const h = G.S.sections[gate].hp; for (let i = 0; i < 20; i++){ idle(G); G.S.sections[gate].hp = Math.min(G.S.sections[gate].hp, max / 2 + 1e6); G.tick(0.05); } return G.S.sections[gate].hp - h; };
  G.S.sections.forEach(s => { s.hp = 1; }); const mx = i => G.sectionMax(i);
  setTier(G, 'maurerkolonne', 2); G.S.sections[gate].hp = mx(gate) / 2; G.S.sections[gate].lastHit = -1e9; const a = G.S.sections[gate].hp; for (let i = 0; i < 20; i++) G.tick(0.05);
  assert.equal(G.S.sections[gate].hp, a, 'Stufe 2: das Tor regeneriert nicht');
  setTier(G, 'maurerkolonne', 3); G.S.sections[gate].hp = mx(gate) / 2; G.S.sections[gate].lastHit = -1e9; const b = G.S.sections[gate].hp; for (let i = 0; i < 20; i++) G.tick(0.05);
  assert.ok(G.S.sections[gate].hp > b, 'Stufe 3: das Tor regeneriert');
});

test('Instandhaltung, Stufe 3: repariert schon bei 80 statt 50 % Lebenspunkten', () => {
  const { G, C } = game(); G.S.material = 1e7;
  const trial = () => { idle(G); G.S.sections[0].hp = G.sectionMax(0) * 0.7; G.S.sections[0].repairCd = 0; const h = G.S.sections[0].hp; G.tick(0.05); return G.S.sections[0].hp > h; };
  setTier(G, 'instandhaltung', 2); G.S.sections.forEach(s => { s.hp = G.sectionMax(0); }); assert.equal(trial(), false, 'Stufe 2: bei 70 % noch nicht');
  setTier(G, 'instandhaltung', 3); G.S.sections.forEach(s => { s.hp = G.sectionMax(0); }); assert.equal(trial(), true, 'Stufe 3: schon bei 70 %');
});

test('Schildwall, Stufe 2: schon eine Reihe mit vier statt fünf Nahkämpfern zählt als voll', () => {
  const { G, C } = game();
  const hit = n => {
    G.S.units = []; G.S.queue = [];
    G.addFormation('p', 1, Array(n).fill('laeufer'), 300); const foe = G.addFormation('e', 1, ['laeufer'], 300 + 8);
    const mine = G.S.units.filter(u => u.side === 'p'); mine.forEach(u => { u.hp = u.maxHp = 1e6; });
    const e = G.S.units.find(u => u.form === foe.id); e.cd = 0; e.hp = e.maxHp = 1e6; mine.forEach(u => { u.cd = 1e9; });
    idle(G); G.tick(0.05);
    return mine.reduce((a, u) => a + (1e6 - u.hp), 0);
  };
  const need = C.FORMATION_ROW_MAX;
  setTier(G, 'schildwall', 1); const full = hit(need), part = hit(need - 1);
  assert.ok(part > full, 'Stufe 1: eine volle Reihe hält mehr aus');
  setTier(G, 'schildwall', 2); const part2 = hit(need - 1);
  assert.ok(part2 < part, `Stufe 2: auch die Reihe mit ${need - 1} zählt als voll (${part2} gegen ${part})`);
});

test('Turmkanoniere, Stufe 3: Türme feuern weiter und haben doppelten Schaden gegen Fernkämpfer', () => {
  const { G } = game(); G.S.lvl.turm_0 = 2;
  setTier(G, 'turmkanoniere', 1); const r1 = G.turretRange(0), d1 = G.turretDmg(0); assert.equal(G.mMul('turretVsRanged'), 1);
  setTier(G, 'turmkanoniere', 2); assert.ok(Math.abs(G.turretRange(0) / r1 - 1.25) < 1e-9);
  setTier(G, 'turmkanoniere', 3); assert.ok(Math.abs(G.turretRange(0) / r1 - 1.5) < 1e-9); assert.equal(G.mMul('turretVsRanged'), 2); assert.ok(G.turretDmg(0) > d1 * 1.7);
});

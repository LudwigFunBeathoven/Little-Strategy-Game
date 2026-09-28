// Tests Inkrement 4: Spezialkarten mit Stufen (REQ-18).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1;
function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG, KF_DRAFT_OPTIONS } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG, K: KlammerCore, OPTS: KF_DRAFT_OPTIONS };
}
function toLevel(G, K, n){ G.S.scrapTotal = K.xpThreshold(n) - 1; G.S.scrap = G.S.scrapTotal; }
function levelUp(G){
  G.S.units.push({ id: 9999 + G.S.level, side: 'e', type: 'laeufer', lane: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0, moving: false, bob: 0 });
  G.tick(0.05);
}
function force(G, id){ G.S.pendingDraft = { level: G.S.level + 1, options: [id] }; G.S.pendingLevels = 1; G.chooseDraft(0); }

test('Stufe II erscheint nie vor Stufe I; nach Stufe III erscheint die Karte nicht mehr', () => {
  for (let seed = 1; seed <= 60; seed++){
    const { G, K, OPTS } = game('normal', seed);
    G.S.material = 1e6; G.build('universitaet'); G.build('fabrik'); G.buy('turm_0');
    const shown = {};
    for (let lvl = 1; lvl <= 25; lvl++){
      toLevel(G, K, lvl); levelUp(G);
      const d = G.S.pendingDraft; if (!d) break;
      for (const id of d.options){
        const tier = G.cardTaken(id) + 1, o = OPTS.find(x => x.id === id);
        assert.ok(tier <= o.tiers.length, `${id}: Stufe ${tier} nach der höchsten Stufe`);
        (shown[id] ||= []).push(tier);
      }
      // Bevorzugt Karten mit mehreren Stufen wählen, damit hohe Stufen erreicht werden
      const pick = d.options.findIndex(id => OPTS.find(x => x.id === id).tiers.length > 1);
      G.chooseDraft(Math.max(0, pick));
    }
    for (const [id, tiers] of Object.entries(shown))
      for (let i = 1; i < tiers.length; i++) assert.ok(tiers[i] >= tiers[i - 1], `${id}: Stufe sinkt`);
  }
});

test('Stufe ersetzt die vorige im Pool; Werte gelten absolut', () => {
  const { G, C } = game();
  G.S.material = 1e6; G.build('fabrik');
  const base = G.factoryRate();
  force(G, 'bessereFabriken');
  assert.ok(Math.abs(G.factoryRate() - base * 1.25) < 1e-9);
  force(G, 'bessereFabriken');
  assert.ok(Math.abs(G.factoryRate() - base * 1.6) < 1e-9, 'Stufe II: +60 %, nicht 1,25 × 1,6');
  force(G, 'bessereFabriken');
  assert.ok(Math.abs(G.factoryRate() - base * 2.2) < 1e-9);
  assert.equal(G.optionAvailable(G.OPT.bessereFabriken), false, 'nach Stufe III nicht mehr im Pool');
  assert.equal(G.cardTaken('bessereFabriken'), C.CARD_MAX_TIER);
});

test('Ziehgewicht der nächsten Stufe steigt je Wahl um CARD_TIER_WEIGHT_BONUS', () => {
  const { G, C } = game();
  const w0 = G.cardWeight(G.OPT.schwerePressen);
  force(G, 'schwerePressen');
  assert.equal(G.cardWeight(G.OPT.schwerePressen), w0 * C.CARD_TIER_WEIGHT_BONUS);
  force(G, 'schwerePressen');
  assert.equal(G.cardWeight(G.OPT.schwerePressen), w0 * C.CARD_TIER_WEIGHT_BONUS ** 2);
});

test('Nachteil wächst mit der Stufe (Schwere Pressen)', () => {
  const { G } = game();
  const m0 = G.sectionMax(TOP);
  force(G, 'schwerePressen'); const m1 = G.sectionMax(TOP);
  force(G, 'schwerePressen'); const m2 = G.sectionMax(TOP);
  assert.ok(m1 < m0 && m2 < m1);
});

test('Maurerkolonne heilt nicht, solange ein Treffer weniger als 5 s zurückliegt, und heilt nie das Tor', () => {
  const { G, C } = game();
  G.S.nextWave = Infinity; G.S.nextEnemy = [];
  force(G, 'maurerkolonne');
  assert.equal(C.WALL_REGEN_DELAY_S, 5);
  G.S.sections[TOP].hp = 100; G.S.sections[TOP].lastHit = G.S.t;
  G.S.sections[MID].hp = 100; G.S.sections[MID].lastHit = -1e9;
  for (let i = 0; i < 20 * 4.9; i++) G.tick(0.05);
  assert.equal(G.S.sections[TOP].hp, 100, 'kein Heilen innerhalb von 5 s nach einem Treffer');
  for (let i = 0; i < 20 * 2; i++) G.tick(0.05);
  assert.ok(G.S.sections[TOP].hp > 100, 'heilt danach');
  assert.equal(G.S.sections[MID].hp, 100, 'Tor heilt nie');
});

test('Ohne Fabrik wird das Handelskontor nie angeboten', () => {
  for (let seed = 1; seed <= 40; seed++){
    const { G, K } = game('normal', seed);
    G.S.material = 1e6; G.build('universitaet');
    for (let lvl = 1; lvl <= 12; lvl++){
      toLevel(G, K, lvl); levelUp(G);
      const d = G.S.pendingDraft; if (!d) break;
      assert.ok(!d.options.includes('handelskontor'), `Seed ${seed}: Handelskontor ohne Fabrik angeboten`);
      G.chooseDraft(0);
    }
  }
  const { G } = game();
  G.S.material = 1e6; G.build('fabrik');
  assert.ok(G.optionAvailable(G.OPT.handelskontor));
});

test('Weitschuss: Fernkämpfer greift mit zwei Einheiten vor sich an', () => {
  const { G } = game();
  G.S.nextWave = Infinity; G.S.enemyTurretCd = Infinity;
  force(G, 'weitschuss');
  const e = G.makeUnit('e', 'laeufer', MID, 500); e.hp = e.maxHp = 1000; e.dmg = 0; G.S.units.push(e);
  for (const x of [440, 425]){ const m = G.makeUnit('p', 'laeufer', MID, x); m.dmg = 0; G.S.units.push(m); }
  G.S.units.push(G.makeUnit('p', 'werfer', MID, 410));
  G.tick(0.05);
  assert.ok(e.hp < 1000);
});

// Tests Iteration 4, REQ-45: Kartenausbau (Kategorien, Seltenheit, Synergien, neue Karten).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const TOP = 0, MID = 1;
function game(seed = 7){
  const { KlammerCore, KF_CONFIG, KF_DRAFT_OPTIONS } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed);
  return { G, C: KF_CONFIG, OPTS: KF_DRAFT_OPTIONS };
}
const force = (G, id) => { G.S.pendingDraft = { level: G.S.level + 1, options: [id] }; G.S.pendingLevels = 1; G.chooseDraft(0); };
function levelUp(G){
  G.S.xpTotal = G.xpNeed(G.S.level + 1) - 1; G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 90000 + G.S.level, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 });
  G.tick(0.05);
}
/* Viele Angebote über verschiedene Seeds und Spielstände */
function offers(n = 60){
  const out = [];
  for (let seed = 1; seed <= n; seed++){
    const { G } = game(seed);
    G.S.material = 1e6; G.build('universitaet'); G.build('fabrik'); G.build('schmiede'); G.buy('turm_0');
    G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity;
    for (let k = 0; k < 20; k++){
      levelUp(G);
      const d = G.S.pendingDraft; if (!d) break;
      out.push(Array.from(d.options));
      G.chooseDraft(k % d.options.length);
    }
  }
  return out;
}

test('Pool: mindestens 36 Karten, fünf Kategorien mit je mindestens 6, mindestens 6 Synergiekarten', () => {
  const { C, OPTS } = game();
  assert.ok(OPTS.length >= 36);
  for (const cat of C.CARD_CATEGORIES) assert.ok(OPTS.filter(o => o.category === cat).length >= 6, `${cat}: mindestens 6`);
  assert.ok(OPTS.filter(o => o.synergy).length >= 6);
  assert.deepEqual({ ...C.CARD_RARITY_WEIGHTS }, { common: 70, rare: 25, legendary: 5 });
});

test('Legendäre Karten: einmalig, mit Nachteil', () => {
  const { OPTS } = game();
  const leg = OPTS.filter(o => o.rarity === 'legendary');
  assert.ok(leg.length >= 2);
  for (const o of leg){
    assert.equal(o.tiers.length, 1, `${o.id} einmalig`);
    assert.ok(o.tiers[0].drawback && o.tiers[0].drawback.length, `${o.id} mit Nachteil`);
  }
});

test('Kein Angebot enthält zwei legendäre Karten; jedes Angebot enthält mindestens zwei Kategorien', () => {
  const { OPTS } = game();
  const byId = Object.fromEntries(OPTS.map(o => [o.id, o]));
  const all = offers();
  assert.ok(all.length > 500);
  for (const off of all){
    assert.ok(off.filter(id => byId[id].rarity === 'legendary').length <= 1, `zwei legendäre: ${off}`);
    if (off.length >= 2) assert.ok(new Set(off.map(id => byId[id].category)).size >= 2, `eine Kategorie: ${off}`);
  }
  assert.ok(all.some(off => off.some(id => byId[id].rarity === 'legendary')), 'legendäre Karten kommen vor');
});

test('Synergiewerte stimmen bei 0, 1 und 3 gewählten Karten der Kategorie', () => {
  const { G } = game();
  const per = G.OPT.veteranen.synergy.perCard;
  assert.equal(G.synergyValue('veteranen'), 0, 'nicht gewählt: 0');
  const base = G.dmgMultP();
  force(G, 'veteranen');
  assert.equal(G.categoryCount('armee'), 1);
  assert.ok(Math.abs(G.synergyValue('veteranen') - per * 1) < 1e-12, 'nur sie selbst: 1 Karte');
  assert.ok(Math.abs(G.dmgMultP() - base * (1 + per)) < 1e-9);
  force(G, 'drill'); force(G, 'kriegstrommeln');
  assert.equal(G.categoryCount('armee'), 3);
  assert.ok(Math.abs(G.synergyValue('veteranen') - per * 3) < 1e-12, '3 Karten');
  assert.ok(Math.abs(G.dmgMultP() - base * (1 + 3 * per)) < 1e-9);
  force(G, 'zinnen');
  assert.equal(G.categoryCount('armee'), 3, 'andere Kategorien zählen nicht');
});

test('Rationalisierung: Fabriken +5 % je Automatisierungskarte', () => {
  const { G } = game();
  G.S.material = 1e6; G.build('fabrik');
  const r0 = G.factoryRate();
  force(G, 'rationalisierung'); force(G, 'fliessband'); force(G, 'bauleitung');
  assert.ok(Math.abs(G.factoryRate() - r0 * 1.15) < 1e-9);
});

test('Große Armee: Versorgungslimit ×2 (höchstens 15), eigener Takt 40 s', () => {
  const { G, C } = game();
  force(G, 'grosseArmee');
  assert.equal(G.supplyCap(), 6);
  assert.equal(G.ownWaveInterval(), 40);
  G.S.material = 1e9; G.build('kaserne'); while (G.buy('ausbau'));
  assert.equal(G.supplyCap(), C.SUPPLY_CAP_MAX);
});

test('Alles auf die Mitte: alle Einheiten in die Mitte, +40 % Stärke, Mauern −30 %', () => {
  const { G } = game();
  const hp0 = G.sectionMax(TOP), str0 = G.dmgMultP();
  force(G, 'allesAufDieMitte');
  assert.deepEqual(Array.from(G.assignLanes(['laeufer', 'laeufer', 'werfer'], 0).map(x => x.lane)), [MID, MID, MID]);
  assert.ok(Math.abs(G.dmgMultP() - str0 * 1.4) < 1e-9);
  assert.ok(Math.abs(G.sectionMax(TOP) - hp0 * 0.7) < 1e-9);
});

test('Instandhaltung repariert Abschnitte unter 50 % zum vergünstigten Preis', () => {
  const { G, C } = game();
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity;
  force(G, 'instandhaltung');
  G.S.material = 1000; G.S.sections[TOP].hp = 100;
  G.tick(0.05);
  assert.equal(G.S.sections[TOP].hp, 100 + C.REPAIR_AMOUNT);
  assert.equal(1000 - G.S.material, Math.ceil(C.REPAIR_COST * 0.8));
});

test('Dauerauftrag füllt die Warteschlange mit der letzten Zusammensetzung', () => {
  const { G } = game();
  G.S.nextWave = Infinity;
  force(G, 'dauerauftrag');
  G.S.material = 1e6;
  G.spawn('laeufer'); G.spawn('werfer'); G.spawn('laeufer');
  while (G.S.ownWaveNo === 0) G.tick(0.05);
  assert.deepEqual(Array.from(G.S.queue.map(q => q.type)), ['laeufer', 'werfer', 'laeufer']);
});

test('Werkmeister kauft die Schmiede-Stufe ab dem doppelten Preis', () => {
  const { G } = game();
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity;
  G.S.material = 1e6; G.build('schmiede');
  force(G, 'werkmeister');
  G.S.material = G.upCost('qualitaet') * 2 - 1; G.tick(0.05);
  assert.equal(G.S.lvl.qualitaet, 0);
  G.S.material = G.upCost('qualitaet') * 2; G.tick(0.05);
  assert.equal(G.S.lvl.qualitaet, 1);
});

test('Kriegstrommeln wirken erst ab Formationen mit 5 Einheiten', () => {
  const dmg = (n, card) => {
    const { G } = game();
    G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
    if (card) force(G, 'kriegstrommeln');
    const e = G.addFormation('e', MID, ['laeufer'], 400);
    for (const u of G.formMembers(e)){ u.hp = u.maxHp = 1e6; u.dmg = 0; }
    const f = G.addFormation('p', MID, Array(n).fill('laeufer'), 390);
    const hp0 = G.formMembers(e)[0].hp; G.tick(0.05);
    return (hp0 - G.formMembers(e)[0].hp) / Math.min(n, 5);
  };
  assert.ok(Math.abs(dmg(4, true) - dmg(4, false)) < 1e-9, 'unter 5: keine Wirkung');
  assert.ok(Math.abs(dmg(5, true) - dmg(5, false) * 1.15) < 1e-9, 'ab 5: +15 %');
});

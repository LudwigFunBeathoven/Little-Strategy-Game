// Tests der Spiellogik: Erstattung, ruhende Upgrades, Freischaltung, Draft, Phasen, 3×3-Raster (REQ-16/17).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(diff = 'normal', seed = 7){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return { G, C: KF_CONFIG };
}

test('Erstattung = floor(Baukosten × REFUND_RATE): 200 → 100', () => {
  const { G, C } = game();
  G.S.slots[0] = { type: 'schmiede', paid: 200 };
  assert.equal(C.REFUND_RATE, 0.5);
  assert.equal(G.refundFor(0), 100);
  const before = G.S.material;
  assert.ok(G.demolish(0));
  assert.equal(G.S.material - before, 100);
  assert.equal(G.S.slots[0], null);
});

test('Erstattung rundet ab', () => {
  const { G } = game();
  G.S.slots[1] = { type: 'fabrik', paid: 41 };
  assert.equal(G.refundFor(1), 20);
});

test('Neun Plätze; bei Spielstart 4 Typen wählbar, Handelskontor gesperrt', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  const buildable = C.BUILDINGS.filter(b => G.buildBlock(0, b) === null);
  assert.equal(G.S.slots.length, 9);
  assert.deepEqual(Array.from(buildable).sort(), ['fabrik', 'kaserne', 'schmiede', 'universitaet']);
  assert.equal(G.buildBlock(0, 'kontor'), 'locked');
  G.unlockBuilding('kontor');
  assert.equal(G.buildBlock(0, 'kontor'), null);
});

test('Verstärkungsgebäude je einmal, Fabriken mehrfach', () => {
  const { G } = game();
  G.S.material = 1e6;
  for (const type of ['schmiede', 'kaserne', 'universitaet']){
    assert.ok(G.build(type));
    assert.equal(G.buildBlock(8, type), 'standing', `zweite ${type} nicht baubar`);
  }
  assert.ok(G.build('fabrik')); assert.ok(G.build('fabrik')); assert.ok(G.build('fabrik'));
  assert.equal(G.factoryCount(), 3);
});

test('Erste Fabrik gratis; die n-te kostet FACTORY_BASE_COST × 1,6^(n−1); nach Abriss sinkt der Preis', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  assert.equal(C.FACTORY_COST_GROWTH, 1.6);
  assert.equal(C.FIRST_FACTORY_FREE, true);
  assert.equal(G.factoryCost(), 0, 'erste Fabrik gratis (REQ-44)');
  G.build('fabrik');
  assert.equal(G.factoryCost(), Math.ceil(C.FACTORY_BASE_COST * 1.6));
  G.build('fabrik');
  assert.equal(G.factoryCost(), Math.ceil(C.FACTORY_BASE_COST * 1.6 * 1.6), 'dritte Fabrik: 1,6²-Fache');
  const m = G.S.material; G.build('fabrik');
  assert.equal(m - G.S.material, Math.ceil(C.FACTORY_BASE_COST * 1.6 * 1.6), 'bezahlter Preis');
  G.demolish(0);
  assert.equal(G.factoryCost(), Math.ceil(C.FACTORY_BASE_COST * 1.6 * 1.6), 'Preis richtet sich nach der aktuellen Zahl');
});

test('Fabriken erzeugen FACTORY_BASE_RATE Material pro Sekunde; keine Fertiger mehr', () => {
  const { G, C } = game();
  assert.ok(!('fertiger' in C.UPGRADES));
  G.S.material = 1e6;
  G.build('fabrik'); G.build('fabrik');
  assert.equal(G.matRate(), 2 * C.FACTORY_BASE_RATE);
});

test('Kaserne: +2 Versorgung je Stufe, Stufe 2 = 7; harte Obergrenze SUPPLY_CAP_MAX', () => {
  const { G, C } = game();
  G.S.material = 1e9;
  assert.equal(G.supplyCap(), 3);
  G.build('kaserne');
  assert.equal(G.supplyCap(), 5);
  assert.ok(G.buy('ausbau'));
  assert.equal(G.kaserneLevel(), 2);
  assert.equal(G.supplyCap(), 7);
  while (G.buy('ausbau'));
  assert.equal(G.supplyCap(), 15, 'Stufe 6');
  G.S.draft.stacks.aushebung = 2; G.S.draft.ver++;
  assert.equal(G.supplyCap(), C.SUPPLY_CAP_MAX, 'Karten heben nicht über die Obergrenze');
});

test('Einheitenstärke steigt mit den Stufen auch ohne Schmiede', () => {
  const { G, C } = game();
  assert.equal(G.has('schmiede'), false);
  const base = G.dmgMultP();
  G.S.level = 4;
  assert.ok(Math.abs(G.dmgMultP() - base * (1 + 4 * C.UNIT_STRENGTH_PER_LEVEL)) < 1e-9);
  assert.ok(G.hpMultP() > 1);
  const u = G.makeUnit('p', 'laeufer', 1);
  assert.ok(Math.abs(u.hp - C.UNITS.laeufer.hp * (1 + 4 * C.UNIT_STRENGTH_PER_LEVEL)) < 1e-9);
});

test('Schmiede: Qualitätsstufen mit Kostenwachstum 2,5', () => {
  const { G, C } = game();
  G.S.material = 1e6; G.build('schmiede');
  const c0 = G.upCost('qualitaet'); G.buy('qualitaet');
  assert.equal(G.upCost('qualitaet'), Math.ceil(c0 * C.SMITHY_COST_GROWTH));
  assert.equal(C.SMITHY_COST_GROWTH, 2.5);
});

test('Schmiede bauen, Upgrade kaufen, abreißen: Effekt ruht; neu bauen: Effekt wieder aktiv ohne Nachkauf', () => {
  const { G } = game();
  G.S.material = 1e6;
  const base = G.dmgMultP();
  assert.ok(G.buildAt(0, 'schmiede'));
  assert.ok(G.buy('qualitaet'));
  const boosted = G.dmgMultP();
  assert.ok(boosted > base);
  assert.ok(G.demolish(0));
  assert.equal(G.dmgMultP(), base, 'Effekt muss nach Abriss ruhen');
  assert.equal(G.S.lvl.qualitaet, 1, 'gekaufte Stufe bleibt gespeichert');
  assert.equal(G.canBuy('qualitaet'), false, 'ohne Schmiede kein Kauf');
  assert.ok(G.buildAt(2, 'schmiede'));
  assert.equal(G.dmgMultP(), boosted, 'Effekt nach Neubau wieder aktiv');
  assert.equal(G.S.lvl.qualitaet, 1, 'kein Nachkauf nötig');
});

test('Abriss macht den Platz sofort frei', () => {
  const { G } = game();
  G.S.material = 1e6;
  G.buildAt(0, 'fabrik'); G.buildAt(1, 'schmiede');
  G.demolish(0);
  assert.equal(G.buildBlock(0, 'kaserne'), null);
});

/* ---------- REQ-02 Draft ---------- */
function toLevel(G, n){ G.S.scrapTotal = G.xpNeed(n) - 1; G.S.scrap = G.S.scrapTotal; }
function killFor(G, amount){ // Altmetall über den regulären Weg gutschreiben
  G.S.units.push({ id: 999, side: 'e', type: 'laeufer', x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0, moving: false, bob: 0 });
  G.tick(0.05);
}

test('Stufenaufstieg pausiert das Spiel und bietet 2 Optionen, mit Universität 3', () => {
  const { G, C } = game();
  toLevel(G, 1); killFor(G);
  assert.equal(G.S.level, 1);
  assert.ok(G.S.pendingDraft, 'Draft offen');
  assert.equal(G.S.pendingDraft.options.length, C.DRAFT_OPTIONS_BASE);
  const t = G.S.t; G.tick(0.05); G.tick(0.05);
  assert.equal(G.S.t, t, 'Spielzeit steht während des Drafts');
  G.chooseDraft(0);
  assert.equal(G.S.pendingDraft, null);
  G.S.material = 1e6; G.buildAt(0, 'universitaet');
  toLevel(G, 2); killFor(G);
  assert.equal(G.S.pendingDraft.options.length, C.DRAFT_OPTIONS_UNIVERSITY);
});

test('Gleicher Seed ergibt dieselbe Angebotsfolge', () => {
  const seq = seed => {
    const { G } = game('normal', seed), out = [];
    for (let lvl = 1; lvl <= 6; lvl++){ toLevel(G, lvl); killFor(G); out.push(Array.from(G.S.pendingDraft.options).join(',')); G.chooseDraft(0); }
    return out;
  };
  assert.deepEqual(seq(12345), seq(12345));
  assert.notDeepEqual(seq(12345), seq(54321));
});

test('Kein Angebot enthält eine Karte doppelt; nach der höchsten Stufe erscheint eine Karte nie wieder', () => {
  const { KF_DRAFT_OPTIONS } = loadCore();
  for (let seed = 1; seed <= 40; seed++){
    const { G } = game('normal', seed);
    G.S.material = 1e6; G.buildAt(0, 'universitaet'); G.buildAt(1, 'fabrik');
    for (let lvl = 1; lvl <= 14; lvl++){
      toLevel(G, lvl); killFor(G);
      const d = G.S.pendingDraft; if (!d) break;
      const opts = Array.from(d.options);
      assert.equal(new Set(opts).size, opts.length, 'Duplikat im Angebot');
      for (const id of opts){
        const o = KF_DRAFT_OPTIONS.find(x => x.id === id);
        assert.ok(G.cardTaken(id) < o.tiers.length, `${id} über der höchsten Stufe angeboten`);
      }
      G.chooseDraft(0);
    }
  }
});

test('Handelskontor erst nach Wahl der Karte baubar', () => {
  const { G } = game();
  G.S.material = 1e6;
  assert.equal(G.buildBlock(0, 'kontor'), 'locked');
  G.S.pendingDraft = { level: 1, options: ['handelskontor'] }; G.S.pendingLevels = 1;
  G.chooseDraft(0);
  assert.equal(G.buildBlock(0, 'kontor'), null);
});

test('Kartendaten sind vollständig und deklarativ (tiers ersetzt maxStacks)', () => {
  const { KF_DRAFT_OPTIONS, KF_CONFIG: C } = loadCore();
  assert.ok(KF_DRAFT_OPTIONS.length >= 36, 'mindestens 36 Karten');
  for (const o of KF_DRAFT_OPTIONS){
    for (const f of ['id', 'category', 'rarity', 'nameKey', 'descKey', 'tiers']) assert.ok(o[f] !== undefined, `${o.id}: ${f} fehlt`);
    assert.ok(!('maxStacks' in o) && !('unique' in o) && !('effect' in o) && !('weight' in o), `${o.id}: altes Format`);
    assert.ok(o.tiers.length >= 1 && o.tiers.length <= C.CARD_MAX_TIER, `${o.id}: 1 bis ${C.CARD_MAX_TIER} Stufen`);
    for (const tr of o.tiers) assert.ok(Array.isArray(tr.effect) && (tr.effect.length || o.synergy), `${o.id}: Stufe ohne Wirkung`);
    assert.ok(C.CARD_CATEGORIES.includes(o.category), `${o.id}: Kategorie`);
    assert.ok(o.rarity in C.CARD_RARITY_WEIGHTS, `${o.id}: Seltenheit`);
  }
});

/* ---------- REQ-03 Phasen ---------- */
test('Phasen folgen der Stufe: Früh < 2, Mitte < 5, Spät ab 5', () => {
  const { G, C } = game();
  const at = lvl => { G.S.level = lvl; return G.phase(); };
  assert.equal(C.PHASE_MID_LEVEL, 2); assert.equal(C.PHASE_LATE_LEVEL, 5);
  assert.deepEqual([0, 1, 2, 4, 5, 9].map(at), ['early', 'early', 'mid', 'mid', 'late', 'late']);
});

test('Höchstens MAX_CLICKS_PER_SECOND Klicks je Sekunde zählen', () => {
  const { G, C } = game();
  let counted = 0;
  for (let i = 0; i < 25; i++) if (G.doClick()) counted++;
  assert.equal(counted, C.MAX_CLICKS_PER_SECOND);
  for (let i = 0; i < 21; i++) G.tick(0.05);          // gut eine Sekunde später
  assert.ok(G.doClick(), 'nach einer Sekunde zählen Klicks wieder');
});

test('Klickwert ist gedeckelt; nur die Presse erhöht ihn', () => {
  const { G, C } = game();
  G.S.material = 1e9;
  while (G.buy('presse'));
  assert.equal(G.S.lvl.presse, C.UPGRADES.presse.max);
  assert.equal(G.clickPower(), 1 + C.FX_PRESSE * C.UPGRADES.presse.max);
  const before = G.clickPower();
  G.buildAt(0, 'fabrik'); G.buildAt(1, 'fabrik');
  assert.equal(G.clickPower(), before, 'Fabriken verändern den Klickwert nicht');
  assert.ok(!('hydraulik' in C.UPGRADES), 'Hydraulik ist umgebaut');
});

test('Produktion wird je Phase getrennt nach Klick und Automatik erfasst', () => {
  const { G } = game();
  G.doClick(); G.S.material = 1e6; G.build('fabrik'); G.tick(0.05);
  const p = G.S.stats.prod.early;
  assert.ok(p.click >= 1 && p.auto > 0);
});

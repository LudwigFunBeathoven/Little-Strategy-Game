// Tests der Spiellogik (7.3): Erstattung, ruhende Upgrades, Freischaltung.
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

test('Bei Spielstart sind 4 Typen für 3 Slots wählbar, Handelskontor gesperrt', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  const buildable = C.BUILDINGS.filter(b => G.buildBlock(0, b) === null);
  assert.equal(C.BUILDING_SLOTS, 3);
  assert.deepEqual(Array.from(buildable).sort(), ['fabrik', 'kaserne', 'schmiede', 'universitaet']);
  assert.equal(G.buildBlock(0, 'kontor'), 'locked');
  G.unlockBuilding('kontor');
  assert.equal(G.buildBlock(0, 'kontor'), null);
});

test('Je Typ höchstens ein Gebäude', () => {
  const { G } = game();
  G.S.material = 1e6;
  assert.ok(G.buildAt(0, 'fabrik'));
  assert.equal(G.buildBlock(1, 'fabrik'), 'standing');
  assert.equal(G.buildAt(1, 'fabrik'), false);
});

test('Schmiede bauen, Upgrade kaufen, abreißen: Effekt ruht; neu bauen: Effekt wieder aktiv ohne Nachkauf', () => {
  const { G } = game();
  G.S.material = 1e6;
  const base = G.dmgMultP();
  assert.ok(G.buildAt(0, 'schmiede'));
  assert.ok(G.buy('klingen'));
  const boosted = G.dmgMultP();
  assert.ok(boosted > base);
  assert.ok(G.demolish(0));
  assert.equal(G.dmgMultP(), base, 'Effekt muss nach Abriss ruhen');
  assert.equal(G.S.lvl.klingen, 1, 'gekaufte Stufe bleibt gespeichert');
  assert.equal(G.canBuy('klingen'), false, 'ohne Schmiede kein Kauf');
  assert.ok(G.buildAt(2, 'schmiede'));
  assert.equal(G.dmgMultP(), boosted, 'Effekt nach Neubau wieder aktiv');
  assert.equal(G.S.lvl.klingen, 1, 'kein Nachkauf nötig');
});

test('Preis richtet sich nach der Zahl stehender Gebäude, Abriss macht den Platz sofort frei', () => {
  const { G, C } = game();
  G.S.material = 1e6;
  G.buildAt(0, 'fabrik'); G.buildAt(1, 'schmiede');
  assert.equal(G.nextSlotCost(), C.BUILD_COSTS[2]);
  G.demolish(0);
  assert.equal(G.nextSlotCost(), C.BUILD_COSTS[1]);
  assert.equal(G.buildBlock(0, 'kaserne'), null);
});

/* ---------- REQ-02 Draft ---------- */
function toLevel(G, n){ const { KlammerCore } = loadCore(); G.S.scrapTotal = KlammerCore.xpThreshold(n) - 1; G.S.scrap = G.S.scrapTotal; }
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

test('Kein Angebot enthält eine Option doppelt; einmalige Optionen erscheinen nach der Wahl nie wieder', () => {
  const { KF_DRAFT_OPTIONS } = loadCore();
  for (let seed = 1; seed <= 40; seed++){
    const { G } = game('normal', seed);
    G.S.material = 1e6; G.buildAt(0, 'universitaet');
    const takenUnique = new Set();
    for (let lvl = 1; lvl <= 12; lvl++){
      toLevel(G, lvl); killFor(G);
      const d = G.S.pendingDraft; if (!d) break;
      const opts = Array.from(d.options);
      assert.equal(new Set(opts).size, opts.length, 'Duplikat im Angebot');
      for (const id of opts) assert.ok(!takenUnique.has(id), `einmalige Option ${id} erneut angeboten`);
      const pick = opts[0];
      if (KF_DRAFT_OPTIONS.find(o => o.id === pick).unique) takenUnique.add(pick);
      G.chooseDraft(0);
      for (const [id, n] of Object.entries(G.S.draft.stacks)){
        const o = KF_DRAFT_OPTIONS.find(x => x.id === id);
        if (o.maxStacks) assert.ok(n <= o.maxStacks, `${id} über Obergrenze`);
      }
    }
  }
});

test('Handelskontor erst nach Wahl der Draft-Option baubar', () => {
  const { G } = game();
  G.S.material = 1e6;
  assert.equal(G.buildBlock(0, 'kontor'), 'locked');
  // Draft mit Handelskontor erzwingen
  G.S.pendingDraft = { level: 1, options: ['handelskontor'] }; G.S.pendingLevels = 1;
  G.chooseDraft(0);
  assert.equal(G.buildBlock(0, 'kontor'), null);
});

test('Optionsdaten sind vollständig und deklarativ', () => {
  const { KF_DRAFT_OPTIONS } = loadCore();
  assert.ok(KF_DRAFT_OPTIONS.length >= 10 && KF_DRAFT_OPTIONS.length <= 12);
  for (const o of KF_DRAFT_OPTIONS){
    for (const f of ['id', 'category', 'nameKey', 'descKey', 'effect', 'weight']) assert.ok(o[f] !== undefined, `${o.id}: ${f} fehlt`);
    assert.ok(o.unique || o.maxStacks, `${o.id}: unique oder maxStacks nötig`);
    assert.ok(['upgrade', 'building'].includes(o.category));
  }
});

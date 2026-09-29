// Tests Iteration 5, REQ-5.07: Universität mit Forschungsbaum.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(){
  const { KlammerCore, KF_CONFIG, KF_RESEARCH } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.material = 1e6;
  return { G, C: KF_CONFIG, R: KF_RESEARCH, KlammerCore };
}
/* Forschung bis zur Stufe n abschließen, über den regulären Weg */
function research(G, id, n = 1){
  for (let k = G.researchTier(id); k < n; k++){
    G.S.material = 1e6;
    assert.ok(G.startResearch(id), `${id} startet`);
    for (let i = 0; i < 2000 && G.S.research.active.length; i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.5); }
  }
}

test('Forschung: nur mit Universität, kostet Material und Zeit, eine gleichzeitig, Voraussetzungen', () => {
  const { G } = game();
  assert.equal(G.researchBlock('r_logistik'), 'noUni');
  G.build('universitaet');
  const m0 = G.S.material, cost = G.researchCost('r_logistik'), time = G.researchNext('r_logistik').timeS;
  assert.ok(G.startResearch('r_logistik'));
  assert.equal(m0 - G.S.material, cost, 'Materialkosten');
  assert.equal(G.researchBlock('r_drill'), 'busy', 'eine Forschung gleichzeitig');
  for (let t = 0; t < time - 1; t += 0.5) G.tick(0.5);
  assert.equal(G.researchTier('r_logistik'), 0, 'noch nicht fertig');
  G.tick(1.01);
  assert.equal(G.researchTier('r_logistik'), 1, 'nach timeS erforscht');
  assert.ok(G.researchCost('r_logistik') > cost, 'Kosten steigen je Stufe');
  assert.equal(G.researchBlock('r_zweiterplatz'), null, 'Voraussetzung Logistik I erfüllt');
  assert.equal(G.researchBlock('r_schildtraeger'), 'requires', 'Schildträger braucht Drill I');
});

test('Ohne Universität ruht die laufende Forschung', () => {
  const { G } = game();
  G.build('universitaet');
  G.startResearch('r_logistik');
  G.demolish(G.S.slots.findIndex(s => s && s.type === 'universitaet'));
  for (let i = 0; i < 400; i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.5); }
  assert.equal(G.researchTier('r_logistik'), 0);
  assert.equal(G.S.research.active.length, 1);
});

test('Wirkungen: Hörsaal, Weitblick, Glücksgriff, Ingenieurwesen, Logistik, Drill, Metallurgie, Maurerkunst', () => {
  const { G, C } = game();
  G.build('universitaet'); G.build('fabrik');
  const base = { draft: G.draftSize(), bld: G.buildCost('kaserne'), fab: G.factoryCost(), sup: G.supplyCap(), wave: G.ownWaveInterval(), rate: G.factoryRate() };
  research(G, 'r_hoersaal');
  const xp0 = G.S.xpTotal; G.tick(1);
  assert.ok(Math.abs(G.S.xpTotal - xp0 - G.RES.r_hoersaal.tiers[0].effect[0].add) < 1e-9, 'Hörsaal: passive EP je Sekunde');
  research(G, 'r_weitblick'); assert.equal(G.draftSize(), base.draft + 1);
  research(G, 'r_ingenieur'); assert.equal(G.buildCost('kaserne'), Math.ceil(C.BUILDING_COST.kaserne * 0.9));
  assert.ok(G.factoryCost() < base.fab, 'auch Fabriken');
  research(G, 'r_logistik', 2); assert.equal(G.supplyCap(), base.sup + 2);
  G.S.draft.stacks = {}; G.S.draft.ver++;                       // Karten aus Stufenaufstiegen neutralisieren
  const wave0 = G.ownWaveInterval(), rate0 = G.factoryRate();
  research(G, 'r_drill'); G.S.draft.stacks = {}; G.S.draft.ver++; assert.ok(Math.abs(G.ownWaveInterval() - wave0 * 0.92) < 1e-9);
  research(G, 'r_metallurgie'); G.S.draft.stacks = {}; G.S.draft.ver++; assert.ok(Math.abs(G.factoryRate() - rate0 * 1.1) < 1e-9);
  research(G, 'r_maurerkunst');
  G.S.sections[0].hp = 10; assert.ok(G.repair(0));
  assert.ok(Math.abs(G.S.sections[0].repairCd - C.REPAIR_COOLDOWN_S * 0.85) < 1e-9, 'Maurerkunst: kürzere Abklingzeit');
  G.S.draft.stacks = {}; G.S.draft.ver++;
  const rare = G.OPT.veteranen, common = G.OPT.drill, wR = G.cardWeight(rare), wC = G.cardWeight(common);
  research(G, 'r_gluecksgriff'); G.S.draft.stacks = {}; G.S.draft.ver++;
  assert.equal(G.cardWeight(rare) - wR, 10); assert.equal(wC - G.cardWeight(common), 10);
});

test('Neu ziehen und Bann wirken auf die offene Kartenwahl', () => {
  const { G } = game();
  G.build('universitaet');
  research(G, 'r_neuziehen'); research(G, 'r_bann');
  G.S.xpTotal = G.xpNeed(1); G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 99999, side: 'e', type: 'laeufer', lane: 1, laneF: 1, home: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 });
  G.tick(0.05);
  assert.ok(G.S.pendingDraft);
  assert.equal(G.rerollsLeft(), 1);
  assert.ok(G.rerollDraft()); assert.equal(G.rerollsLeft(), 0); assert.equal(G.rerollDraft(), false);
  const banned = G.S.pendingDraft.options[0];
  assert.ok(G.banOption(0));
  assert.ok(!G.S.pendingDraft.options.includes(banned), 'gebannte Karte ersetzt');
  assert.equal(G.optionAvailable(G.OPT[banned]), false, 'nicht mehr im Pool');
  assert.equal(G.bansLeft(), 0); assert.equal(G.banOption(0), false);
});

test('Freischaltungen: Schildträger, zweiter Forschungsplatz, Schmiede-Ausbau', () => {
  const { G, C } = game();
  G.build('universitaet'); G.build('schmiede');
  assert.equal(G.spawn('schild'), false, 'Schildträger gesperrt');
  research(G, 'r_drill'); research(G, 'r_schildtraeger');
  assert.ok(G.spawn('schild'));
  research(G, 'r_logistik'); research(G, 'r_zweiterplatz');
  assert.ok(G.startResearch('r_ingenieur') && G.startResearch('r_metallurgie'), 'zwei gleichzeitig');
  for (let i = 0; i < 2000 && G.S.research.active.length; i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.5); }
  G.buy('qualitaet'); const q = G.qualityMult();
  research(G, 'r_schmiedeausbau');
  assert.ok(Math.abs(G.qualityMult() - q * (1 + C.FX_QUALITAET + 0.02) / (1 + C.FX_QUALITAET)) < 1e-9);
});

test('Schildträger bremst die Armee (Tempo der langsamsten Einheit)', () => {
  const { G, C } = game();
  G.S.units = []; G.S.forms = [];
  const a = G.addGroup('p', [{ type: 'laeufer', lane: 1 }, { type: 'schild', lane: 1 }], 200);
  const x0 = a.x; G.tick(1);
  assert.ok(Math.abs(a.x - x0 - C.UNITS.schild.speed) < 1e-6);
});

test('Forschungsstand wird gespeichert und geladen', () => {
  const { G, KlammerCore } = game();
  G.build('universitaet');
  research(G, 'r_logistik', 2); G.startResearch('r_drill'); G.tick(5);
  const H = KlammerCore.create(); H.adopt(JSON.parse(JSON.stringify(G.S)));
  assert.equal(H.researchTier('r_logistik'), 2);
  assert.equal(H.supplyCap(), G.supplyCap());
  assert.equal(H.S.research.active[0].id, 'r_drill');
  assert.ok(Math.abs(H.S.research.active[0].t - 5) < 1e-9);
});

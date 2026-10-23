// Tests Kartenpfad Teil 4, REQ-S.05 (Gebäude-Aufwertung zu Varianten); seit Teil 6 ohne Strategielinien und Zeichen (REQ-K6.02).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal', tweak = null){
  const { KlammerCore, KF_CONFIG, KF_VARIANTEN } = loadCore();
  if (tweak) tweak(KF_CONFIG);
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  G.S.material = 1e7;
  return { G, C: KF_CONFIG, L: KF_VARIANTEN };
}
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; G.unlockKey('bau:' + type); assert.ok(G.buildAt(i, type), `${type} bauen`); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = 1e9; }); G.tick(0.05); } };

test('S.05: Aufwertung erst ab Minute 3 und nur mit stehendem Gebäude des Typs (Modus karten)', () => {
  const { G } = game();
  place(G, 'fabrik', 0);
  assert.equal(G.variantBlock(0, 'manufaktur'), 'hidden', 'vor Minute 3 verborgen');
  assert.equal(G.variantVisible('fabrik'), false);
  assert.equal(G.variantBlock(1, 'manufaktur'), 'noBuilding');
  G.S.t = 179; assert.equal(G.variantVisible('fabrik'), false);
  G.S.t = 180; assert.equal(G.variantVisible('fabrik'), true);
  assert.equal(G.variantBlock(0, 'manufaktur'), null);
  assert.equal(G.variantBlock(0, 'exerzierplatz'), 'noBuilding', 'Variante gehört zu einem anderen Grundgebäude');
  assert.equal(G.variantVisible('kaserne'), false, 'keine Kaserne');
  const { G: S } = game('standard'); S.build('fabrik'); S.S.t = 400;
  assert.equal(S.variantBlock(0, 'manufaktur'), 'notInMode');
});

test('S.05: Kosten = zweifache Baukosten des Grundgebäudes, Aufwertung dauert 10 s, danach steht die Variante; nicht umkehrbar außer durch Abriss', () => {
  const { G, C } = game();
  place(G, 'fabrik', 0); G.S.t = 200;
  assert.equal(G.variantCost('manufaktur'), 2 * C.FACTORY_BASE_COST);
  place(G, 'kaserne', 1);
  assert.equal(G.variantCost('exerzierplatz'), 2 * C.BUILDING_COST.kaserne);
  G.S.material = 1000;
  assert.equal(G.upgradeBuilding(0, 'manufaktur'), true);
  assert.equal(G.S.material, 1000 - 2 * C.FACTORY_BASE_COST);
  assert.equal(G.S.slots[0].type, 'fabrik'); assert.ok(G.S.slots[0].upg);
  assert.equal(G.variantBlock(0, 'werkstatt'), 'upgrading');
  finish(G, 9); assert.ok(G.S.slots[0].upg, 'nach 9 s noch in Arbeit');
  finish(G, 2);
  assert.equal(G.S.slots[0].variant, 'manufaktur'); assert.ok(!G.S.slots[0].upg);
  assert.equal(G.variantBlock(0, 'werkstatt'), 'done', 'endgültig');
  assert.equal(G.upgradeBuilding(0, 'werkstatt'), false);
  // Abriss: halbe Summe aus Baukosten und Aufwertung zurück, Platz frei
  const paid = G.S.slots[0].paid, m = G.S.material;
  assert.ok(G.demolish(0)); assert.equal(G.S.slots[0], null);
  assert.equal(G.S.material, m + Math.floor(paid * C.REFUND_RATE));
  G.S.material = 1e6; assert.ok(G.buildAt(0, 'fabrik'), 'Neubau möglich'); assert.equal(G.S.slots[0].variant, undefined);
});

test('S.05: Während der Aufwertung wirkt das Gebäude nicht (Fabrik, Kaserne)', () => {
  const { G } = game();
  place(G, 'fabrik', 0); place(G, 'fabrik', 1); place(G, 'kaserne', 2); G.S.t = 200;
  const rate = G.matRate(), cap = G.supplyCap();
  assert.ok(G.has('kaserne'));
  G.S.material = 1e6; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.ok(G.upgradeBuilding(2, 'exerzierplatz'));
  assert.ok(G.matRate() < rate * 0.6, `Fabrik in Aufwertung liefert nichts: ${G.matRate()} < ${rate}`);
  assert.equal(G.has('kaserne'), false, 'Kaserne in Aufwertung wirkt nicht');
  assert.ok(G.supplyCap() < cap);
  // der Platz bleibt belegt: Teil 7 (REQ-K7.10) erlaubt im Modus karten zwei Kasernen; die in Aufwertung zählt als erste
  assert.equal(G.buildBlock(3, 'kaserne'), null); place(G, 'kaserne', 3); assert.equal(G.buildBlock(5, 'kaserne'), 'standing', 'der Platz bleibt belegt');
  G.demolish(3);
  finish(G);
  assert.ok(G.has('kaserne')); assert.equal(G.supplyCap(), cap);
  assert.ok(G.matRate() > rate, 'Manufaktur liefert mehr als eine Fabrik');
});

test('S.05: Variante behält Ausbaustufen und Nachbarschaftsregeln des Grundgebäudes', () => {
  const { G } = game();
  place(G, 'kaserne', 3); G.S.lvl.ausbau = 2; G.S.t = 200;                     // Teil 7: das Mittelfeld (4) gehört dem Haupthaus
  const cap = G.supplyCap();
  place(G, 'schmiede', 0);                                                       // Kaserne neben Schmiede (Platz 3 und 0): Nachbarschaftsbonus
  const withNb = G.supplyCap(); assert.ok(withNb >= cap);
  G.S.material = 1e6; assert.ok(G.upgradeBuilding(3, 'exerzierplatz')); finish(G);
  assert.equal(G.S.lvl.ausbau, 2, 'Ausbaustufe unverändert'); assert.equal(G.supplyCap(), withNb, 'Versorgung und Nachbarschaft wie vorher');
  assert.equal(G.S.slots[3].type, 'kaserne'); assert.equal(G.S.slots[3].variant, 'exerzierplatz');
});

test('S.05: Manufaktur wirkt je Gebäude, Werkstatt und die übrigen Varianten einmal', () => {
  const { G, C, L } = game();
  for (const i of [0, 2, 6]) place(G, 'fabrik', i); G.S.t = 200; G.S.material = 1e6;                // nicht benachbart: kein Nachbarschaftsbonus im Weg
  const r0 = G.matRate();
  assert.ok(G.upgradeBuilding(0, 'werkstatt')); finish(G);
  assert.ok(G.mMul('unitCost') < 1 && Math.abs(G.mMul('unitCost') - L.varianten.find(v => v.id === 'werkstatt').effect[0].mul) < 1e-9);
  assert.ok(Math.abs(G.matRate() - r0) < 1e-9, 'Werkstatt liefert wie eine Fabrik');
  assert.ok(G.upgradeBuilding(2, 'manufaktur')); assert.ok(G.upgradeBuilding(6, 'manufaktur')); finish(G);
  const yield1 = L.varianten.find(v => v.id === 'manufaktur').effect[0].add;
  assert.ok(Math.abs(G.matRate() / r0 - (1 + 2 * (1 + yield1)) / 3) < 1e-6, `Mehrertrag je Manufaktur: ${G.matRate() / r0}`);
});

test('S.05: Spielstand-Version 15 (Teil 12) und Zustand der Aufwertung im Spielstand', () => {
  const { G } = game();
  assert.equal(loadCore().KlammerCore.SAVE_VERSION, 15);
  place(G, 'fabrik', 0); G.S.t = 200; G.S.material = 1e6; G.upgradeBuilding(0, 'manufaktur');
  const snap = JSON.parse(JSON.stringify(G.snapshot()));
  assert.ok(snap.slots[0].upg);
  const { G: H } = game(); H.adopt(snap);
  assert.ok(H.S.slots[0].upg); finish(H);
  assert.equal(H.S.slots[0].variant, 'manufaktur');
});

/* ---------- Wirkung der Varianten im Spiel ---------- */
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };

test('S.05 Varianten: Wachstube, Garnison, Waffenschmiede, Rüstkammer wirken wie beschrieben', () => {
  const { G, L } = game();
  place(G, 'fabrik', 0); place(G, 'kaserne', 1); place(G, 'schmiede', 2); G.S.t = 200; G.S.material = 1e6; G.S.lvl.qualitaet = 2;
  const q0 = G.qualityMult(), w0 = G.sectionMax(0), t0 = G.mMul('turretDmg');
  const ef = id => L.varianten.find(v => v.id === id).effect;
  assert.ok(G.upgradeBuilding(0, 'wachstube')); assert.ok(G.upgradeBuilding(1, 'garnison')); assert.ok(G.upgradeBuilding(2, 'waffenschmiede')); finish(G);
  assert.ok(Math.abs(G.mMul('turretDmg') / t0 - ef('wachstube')[0].mul) < 1e-9, 'Wachstube: Turmschaden');
  assert.equal(G.mAdd('towerKillMaterial'), ef('wachstube')[1].add, 'Wachstube: Material je Turm-Abschuss');
  assert.equal(G.mAdd('wallRegenFlat'), ef('garnison')[0].add); assert.equal(G.mMul('gateUnitHp'), ef('garnison')[1].mul);
  assert.ok(G.qualityMult() > q0 * 1.04, `Waffenschmiede: Qualität ×1,5 der Wirkung (${q0} → ${G.qualityMult()})`);
  assert.ok(Math.abs((G.qualityMult() - 1) / (q0 - 1) - 1.5) < 0.2);
  // Garnison: Mauer heilt, Einheiten am Tor haben mehr Leben
  G.S.sections[0].hp = G.sectionMax(0) - 100; idle(G); G.S.sections[0].hp = G.sectionMax(0) - 100;
  const h0 = G.S.sections[0].hp; for (let i = 0; i < 20; i++){ G.S.pendingDraft = null; G.tick(0.05); }
  assert.ok(G.S.sections[0].hp > h0, 'Mauer heilt');
  const mid = G.addFormation('p', 1, ['laeufer'], 100), top = G.addFormation('p', 0, ['laeufer'], 100);
  const hp = f => G.S.units.find(u => u.form === f.id).maxHp;
  assert.ok(Math.abs(hp(mid) / hp(top) - ef('garnison')[1].mul) < 1e-9, 'Einheit in der Mitte (Tor) mit mehr Lebenspunkten');
  // Rüstkammer
  const { G: R } = game(); place(R, 'schmiede', 2); R.S.t = 200; const wr0 = R.sectionMax(0);
  R.S.material = 1e6; assert.ok(R.upgradeBuilding(2, 'ruestkammer')); finish(R);
  assert.ok(Math.abs(R.sectionMax(0) / wr0 - ef('ruestkammer')[0].mul) < 1e-9);
});


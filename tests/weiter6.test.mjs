// Tests Kartenpfad Teil 6, REQ-K6.06: Weiterentwicklungen von Fabrik (Dampfkraft) und Universität (Buchdruck).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 5){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  if (pacing === 'karten'){ G.S.haus = null; G.S.slots[4] = null; }       // Teil 7: diese Tests prüfen Regeln ohne Haupthaus (alle neun Plätze frei, keine Obergrenze für Fabriken; tests/haus7.test.mjs prüft das Haupthaus)
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type}: ${G.buildBlock(i, type)}`); };
const pick = (G, ...ids) => { for (const id of ids){ G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; for (const r of (G.OPT[id].pfad || {}).oeffnetForschung || []) G.unlockKey('forschung:' + r); } G.S.draft.ver++; };       // wie die Wahl der Karte: ihre Forschungen öffnen sich
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const run = (G, secs) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); } };
const upgrade = (G, i, vid) => { G.S.t = Math.max(G.S.t, 200); G.S.material = 1e7; assert.ok(G.upgradeBuilding(i, vid), `${vid}: ${G.variantBlock(i, vid)}`); run(G, 11); assert.equal(G.S.slots[i].variant, vid); };
const research = (G, id) => { G.S.material = 1e7; assert.equal(G.researchBlock(id), null, `${id}: ${G.researchBlock(id)}`); assert.ok(G.startResearch(id)); run(G, G.RES[id].tiers[0].timeS + 2); assert.equal(G.researchTier(id), 1, `${id} fertig`); };
const setup = () => {
  const { G, C } = game(); G.S.t = 200;
  place(G, 'universitaet', 5); for (let i = 0; i < 4; i++) place(G, 'fabrik', i); place(G, 'schmiede', 6);
  return { G, C };
};

test('K6.06: Karten Dampfkraft und Buchdruck: Technologie, Kategorie Wirtschaft, erst mit Universität (und Fabrik), ab Wahl 3', () => {
  const { G } = game();
  for (const [id, forsch] of [['dampfkraft', 'r_dampfkraft'], ['buchdruck', 'r_buchdruck']]){
    const o = G.OPT[id]; assert.ok(o, id); assert.equal(o.family, 'technologie'); assert.equal(JSON.stringify(G.katsOf(o)), JSON.stringify(['wirtschaft']));
    assert.equal(JSON.stringify(o.pfad.oeffnetForschung), JSON.stringify([forsch])); assert.equal(o.pfad.abWahl, 3);
    assert.equal(G.optionAvailable(o), false, `${id}: ohne Universität nicht angeboten`);
  }
  place(G, 'universitaet', 5); G.S.pfad.choices = 2;
  assert.equal(G.optionAvailable(G.OPT.buchdruck), true); assert.equal(G.optionAvailable(G.OPT.dampfkraft), false, 'Dampfkraft setzt eine Fabrik voraus');
  place(G, 'fabrik', 0); assert.equal(G.optionAvailable(G.OPT.dampfkraft), true);
  G.S.pfad.choices = 1; assert.equal(G.optionAvailable(G.OPT.dampfkraft), false, 'vor Wahl 3 nicht');
  // Forschung öffnet erst mit der Karte
  assert.notEqual(G.researchBlock('r_dampfkraft'), null); pick(G, 'dampfkraft'); G.S.material = 1e7; assert.equal(G.researchBlock('r_dampfkraft'), null);
  assert.notEqual(G.researchBlock('r_buchdruck'), null);
  const { G: S } = game('standard'); assert.equal(S.optionAvailable(S.OPT.dampfkraft), false); assert.equal(S.optionAvailable(S.OPT.buchdruck), false);
});

test('K6.06 Dampfkraft: Grundvarianten ersetzt, Sonderbau und Ausbaustufen bleiben, kein Erstattungswert für die Varianten', () => {
  const { G, C } = setup();
  pick(G, 'zunftordnung');
  upgrade(G, 0, 'manufaktur'); upgrade(G, 1, 'werkstatt'); upgrade(G, 2, 'wachstube'); upgrade(G, 3, 'zunfthaus'); upgrade(G, 6, 'waffenschmiede');
  G.S.lvl.presse = 3; G.S.lvl.qualitaet = 2;
  const lvl0 = JSON.stringify(G.S.lvl), paid0 = G.S.slots[0].paid, base = G.buildCost ? null : null;
  assert.ok(paid0 > 0); const refund0 = G.refundFor(0);
  pick(G, 'dampfkraft'); G.S.t = Math.max(G.S.t, 200);
  assert.equal(G.weiterErsetzt('r_dampfkraft'), 3, 'Tooltip: drei Grundvarianten der Fabriken');
  const y0 = G.mMul('factoryYield'), c0 = G.clickPower();
  research(G, 'r_dampfkraft');
  assert.equal(G.weiterDone('fabrik'), true); assert.equal(G.weiterDone('universitaet'), false);
  for (const i of [0, 1, 2]) assert.equal(G.S.slots[i].variant, undefined, `Platz ${i}: Grundvariante ersetzt`);
  assert.equal(G.S.slots[3].variant, 'zunfthaus', 'Sonderbau bleibt'); assert.equal(G.S.slots[6].variant, 'waffenschmiede', 'Varianten anderer Gebäude bleiben');
  assert.equal(JSON.stringify(G.S.lvl), lvl0, 'Ausbaustufen bleiben');
  assert.ok(G.S.slots.slice(0, 4).every(sl => sl.type === 'fabrik'), 'die Gebäude bleiben Fabriken (Dampfmühlen)');
  assert.ok(Math.abs(G.mMul('factoryYield') / y0 - 1.4) < 1e-9, 'Ertrag +40 %'); assert.ok(Math.abs(G.clickPower() / c0 - 2) < 1e-9, 'Klickertrag ×2');
  assert.ok(G.S.slots[0].paid < paid0, 'bezahlte Variantenkosten fallen aus dem Erstattungswert'); assert.ok(G.refundFor(0) < refund0);
  const st = G.S.stats.weiter; assert.equal(st.length, 1); assert.equal(st[0].id, 'r_dampfkraft'); assert.equal(st[0].bereich, 'fabrik'); assert.equal(st[0].ersetzt, 3);
  assert.equal(G.weiterErsetzt('r_dampfkraft'), 0, 'danach ist nichts mehr zu ersetzen');
  assert.equal(G.researchBlock('r_dampfkraft'), 'maxed', 'eine Weiterentwicklung je Bereich');
  // die Wirkung der ersetzten Varianten ist weg (Manufaktur: Ertrag je Gebäude), die Wirkung des Sonderbaus bleibt (Zunfthaus: Nachbarbonus ×3)
  assert.equal(G.standingVariants().includes('manufaktur'), false); assert.equal(G.standingVariants().includes('zunfthaus'), true);
});

test('K6.06 Dampfkraft: Dampfmühlen lassen sich wieder zu Varianten aufwerten; laufende Aufwertung zu einer Grundvariante entfällt, die zum Sonderbau bleibt', () => {
  const { G } = setup();
  pick(G, 'zunftordnung', 'dampfkraft');
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.ok(G.upgradeBuilding(3, 'zunfthaus'));
  assert.equal(G.weiterErsetzt('r_dampfkraft'), 1, 'laufende Aufwertung zur Grundvariante zählt');
  const sl0 = G.S.slots[0], sl3 = G.S.slots[3]; research(G, 'r_dampfkraft');
  assert.equal(G.S.slots[0].upg, undefined); assert.equal(G.S.slots[0].variant, undefined);
  assert.ok(sl3.upg || sl3.variant === 'zunfthaus', 'Sonderbau läuft weiter');
  run(G, 12); assert.equal(G.S.slots[3].variant, 'zunfthaus'); assert.equal(sl0.variant, undefined);
  // danach wieder aufwertbar, Kosten wie bisher
  const cost = G.variantCost('manufaktur');
  G.S.material = 1e7; const m0 = G.S.material; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.equal(m0 - G.S.material, cost); run(G, 11);
  assert.equal(G.S.slots[0].variant, 'manufaktur'); assert.ok(G.standingVariants().includes('manufaktur'));
  assert.equal(G.weiterDone('fabrik'), true, 'die Dampfmühle bleibt');
});

test('K6.06 Dampfkraft: Neubauten sind ebenfalls Dampfmühlen (Ertrag und Anzeige folgen dem Bereich)', () => {
  const { G } = setup(); pick(G, 'dampfkraft'); const r0 = G.matRate(); research(G, 'r_dampfkraft');
  const per = G.matRate() / 4; place(G, 'fabrik', 4);
  assert.ok(G.matRate() > per * 4, 'die neue Fabrik trägt bei');
  assert.ok(G.matRate() > r0 * 1.3, 'Ertrag deutlich über der Zeit vor der Weiterentwicklung');
});

test('K6.06 Buchdruck: Forschungen dauern halb so lang (auch laufende), der Kurs des Forschungsbudgets steigt um die Hälfte', () => {
  const { G, C } = setup();
  const base = G.RESEARCH.find(r => r.branch !== 'pfad' && G.researchBlock(r.id) === null); assert.ok(base, 'eine Grundforschung ist startbar');
  G.S.material = 1e7; assert.ok(G.startResearch(base.id));
  const a = G.S.research.active[0]; idle(G); G.tick(1); const dt0 = a.t; assert.ok(dt0 > 0);
  G.setBudget(2); const k0 = G.budgetKurs();
  pick(G, 'buchdruck'); G.S.t = Math.max(G.S.t, 200);
  assert.equal(G.weiterErsetzt('r_buchdruck'), 0, 'die Universität hat keine Grundvarianten');
  // die Forschung selbst läuft mit normalem Tempo, bis sie fertig ist; die Grundforschung profitiert ab dem Abschluss
  G.S.research.active.length = 0; G.S.research.active.push(a);
  G.S.material = 1e7; G.S.research.done.r_buchdruck = 1; G.S.research.ver++;
  const t1 = a.t; idle(G); G.tick(1); const dt1 = a.t - t1;
  assert.ok(Math.abs(dt1 / dt0 - 2) < 1e-6, `laufende Forschung doppelt so schnell: ${dt1} gegen ${dt0}`);
  assert.ok(Math.abs(G.budgetKurs() / k0 - 1.5) < 1e-9, 'Budgetkurs ×1,5');
  assert.equal(G.weiterDone('universitaet'), true);
  // künftige Forschungen: Dauer halbiert (Fortschritt je Sekunde ×2 bei sonst gleicher Rechnung)
  G.S.research.active.length = 0; G.S.material = 1e7;
  const next = G.RESEARCH.find(r => r.branch !== 'pfad' && r.id !== base.id && G.researchBlock(r.id) === null); assert.ok(next, 'eine weitere Grundforschung');
  assert.ok(G.startResearch(next.id));
  const b = G.S.research.active[0]; idle(G); G.tick(1);
  assert.ok(Math.abs(b.t - 2 * dt0) < 1e-6, `Fortschritt in einer Sekunde ${b.t} gegen ${2 * dt0} (doppelt so schnell wie vor dem Buchdruck)`);
});

test('K6.06 Buchdruck: Der Fortschritt der Forschung läuft nur mit stehender Universität; die Druckerei trägt den neuen Namen im Modus karten', () => {
  const { G } = setup(); pick(G, 'buchdruck'); research(G, 'r_buchdruck');
  assert.equal(G.weiterDone('universitaet'), true);
  G.demolish(5); assert.equal(G.has('universitaet'), false);
  assert.equal(G.mMul('researchTime'), 0.5, 'Abgeschlossenes bleibt wirksam');
  const { G: S } = game('standard'); assert.equal(S.weiterDone('universitaet'), false); assert.equal(S.mMul('researchTime'), 1);
});

test('K6.06: Zählt für die Kategorie Wirtschaft und passt in den Pool (höchstens 38 Karten ohne Doktrinen)', () => {
  const { G, C } = game();
  pick(G, 'dampfkraft'); assert.equal(G.katCounts().wirtschaft, 1);
  const pool = G.ALL_OPTIONS.filter(o => !o.doktrin && !G.cardRemoved(o.id));
  assert.ok(pool.length <= C.KATEGORIEN.poolMax, `Karten im Pool: ${pool.length}`);
});

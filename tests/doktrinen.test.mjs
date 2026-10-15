// Tests Kartenpfad Teil 5, REQ-K5.07: Doktrinen und Sonderbauten (ersetzen die Schlüsselkarten aus Teil 4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal'){
  const { KlammerCore, KF_CONFIG, KF_LINIEN, KF_DOKTRINEN } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG, L: KF_LINIEN, D: KF_DOKTRINEN };
}
const IDS = ['zunftordnung', 'stiftung', 'stehendesHeer', 'vorstoss', 'bollwerk', 'ausfall'];
const LINE = { zunftordnung: 'wirtschaft', stiftung: 'wirtschaft', stehendesHeer: 'militaer', vorstoss: 'militaer', bollwerk: 'verteidigung', ausfall: 'verteidigung' };
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), type); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };
const upgrade = (G, i, vid) => { G.S.t = Math.max(G.S.t, 200); G.S.material = 1e7; assert.ok(G.upgradeBuilding(i, vid), `${vid}: ${G.variantBlock(i, vid)}`); finish(G); assert.equal(G.S.slots[i].variant, vid); };
const offered = (G, id) => G.optionAvailable(G.OPT[id]);

test('K5.07: sechs Doktrinen, zwei je Linie, je drei Zeichen ihrer Linie, eine Stufe, Wirkung und Einschränkung', () => {
  const { G, L, D, C } = game();
  assert.equal(JSON.stringify(D.map(d => d.id).sort()), JSON.stringify([...IDS].sort()));
  assert.equal(C.DOKTRIN.max, 2); assert.equal(C.DOKTRIN.zeichen, 3);
  for (const l of L.linien) assert.equal(D.filter(d => d.linie === l).length, 2, l);
  for (const d of D){
    const o = G.OPT[d.id];
    assert.equal(o.family, 'doktrin'); assert.equal(o.tiers.length, 1); assert.equal(o.abWahl, C.DOKTRIN.abWahl);
    assert.deepEqual([].concat(L.zeichen[d.id]), Array(C.DOKTRIN.zeichen).fill(LINE[d.id]), `${d.id}: drei Zeichen`);
    assert.equal(d.linie, LINE[d.id]);
    assert.ok((d.drawback && d.drawback.length) || d.grenze, `${d.id}: bindende Einschränkung`);
    assert.ok((d.effect && d.effect.length) || d.sonderbau, `${d.id}: Effekt oder Sonderbau`);
    if (d.sonderbau){ const v = G.VAR[d.sonderbau]; assert.ok(v, `${d.id}: Sonderbau ${d.sonderbau}`); assert.equal(v.doktrin, d.id); assert.equal(v.linie, d.linie); }
  }
});

test('K5.07: Doktrinen erscheinen erst ab Wahl 3, nur im Modus karten und nur mit Wirkung', () => {
  const { G } = game();
  for (const id of IDS) assert.equal(offered(G, id), false, `${id}: ohne Gebäude nicht angeboten`);
  place(G, 'kaserne', 0); place(G, 'universitaet', 1); place(G, 'fabrik', 2);
  G.S.pfad.choices = 1;
  for (const id of IDS) assert.equal(offered(G, id), false, `${id} vor Wahl 3`);
  G.S.pfad.choices = 2;
  for (const id of IDS) assert.equal(offered(G, id), true, `${id} ab Wahl 3 mit Wirkung`);
  const { G: S } = game('standard'); S.S.pfad.choices = 5; S.buildAt(0, 'kaserne'); S.buildAt(1, 'fabrik');
  for (const id of IDS) assert.equal(S.optionAvailable(S.OPT[id]), false, `${id} im Standardmodus`);
  const { G: H } = game(); H.S.pfad.choices = 4; place(H, 'fabrik', 0);
  assert.equal(offered(H, 'zunftordnung'), true); assert.equal(offered(H, 'bollwerk'), true);
  for (const id of ['stiftung', 'stehendesHeer', 'vorstoss', 'ausfall']) assert.equal(offered(H, id), false, `${id}: ohne Universität bzw. Kaserne`);
});

test('K5.07: eine dritte Doktrin wird nie angeboten', () => {
  const { G } = game();
  place(G, 'kaserne', 0); place(G, 'universitaet', 1); place(G, 'fabrik', 2);
  G.S.pfad.choices = 6; G.S.level = 8;
  pick(G, 'vorstoss');
  assert.equal(G.doktrinCount(), 1);
  const open = IDS.filter(id => id !== 'vorstoss' && offered(G, id)); assert.ok(open.length >= 4);
  pick(G, 'ausfall');
  assert.equal(G.doktrinCount(), 2);
  for (const id of IDS) assert.equal(offered(G, id), false, `${id} nach der zweiten Doktrin`);
  for (let n = 0; n < 60; n++){ G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = -1e9; G.offerDraft(); assert.ok(!G.S.pendingDraft.options.some(id => G.OPT[id].doktrin), 'kein Doktrin-Angebot'); G.S.pfad.choices++; }
  assert.equal(G.doktrinDue(), false);
});

test('K5.07: Sonderbauten gibt es nur mit ihrer Doktrin', () => {
  const { G } = game(); G.S.t = 200;
  place(G, 'fabrik', 0); place(G, 'kaserne', 1); place(G, 'universitaet', 2);
  for (const [type, vid, doc] of [['fabrik', 'zunfthaus', 'zunftordnung'], ['fabrik', 'bastion', 'bollwerk'], ['universitaet', 'stiftungshaus', 'stiftung'], ['kaserne', 'heerlager', 'stehendesHeer']]){
    assert.ok(!G.variantsOf(type).some(v => v.id === vid), `${vid} ohne ${doc} nicht in der Liste`);
    const i = G.S.slots.findIndex(s => s && s.type === type);
    assert.equal(G.variantBlock(i, vid), 'doctrine');
    assert.equal(G.upgradeBuilding(i, vid), false);
    pick(G, doc);
    assert.ok(G.variantsOf(type).some(v => v.id === vid), `${vid} mit ${doc} in der Liste`);
    assert.equal(G.variantBlock(i, vid), null);
  }
  const g = game().G; g.S.t = 200; place(g, 'fabrik', 0); pick(g, 'zunftordnung');
  const { C: CC } = game();
  assert.equal(g.variantCost('zunfthaus'), Math.ceil(CC.FACTORY_BASE_COST * CC.DOKTRIN.sonderbau.kostenFaktor), 'teurer als eine Grundvariante');
  assert.ok(g.variantCost('zunfthaus') > g.variantCost('manufaktur'));
});

test('K5.07 Zunftordnung: Zunfthaus mit dreifachem Nachbarschaftsbonus; höchstens vier Fabriken und Zunfthäuser, die Aktion ist sonst gesperrt', () => {
  const { G, C } = game(); G.S.t = 200;
  for (const i of [0, 1, 3, 4]) place(G, 'fabrik', i);                         // 2×2-Block: je zwei Nachbarn
  const per = 0.06;
  pick(G, 'zunftordnung');
  const r0 = G.matRate();                                                    // mit den drei Zeichen der Doktrin erreicht die Linie Wirtschaft Stufe 1 (Material +10 %)
  assert.equal(G.lineState().wirtschaft.stage, 1);
  upgrade(G, 0, 'zunfthaus');
  const n = G.neighborCount(0, 'fabrik'), gain = G.factoryRate() * per * n * (C.DOKTRIN.zunfthaus.nachbarFaktor - 1);        // die Linie Wirtschaft zählt seit Stufe 1 auch diagonale Nachbarn
  assert.ok(Math.abs(G.matRate() - (r0 + gain)) < 1e-9, `Ertrag ${G.matRate()} gegen ${r0 + gain}`);
  // Grenze: vier Plätze belegt
  assert.equal(G.buildBlock(2, 'fabrik'), 'limit');
  assert.equal(G.buildAt(2, 'fabrik'), false);
  assert.equal(G.doctrineLimit('fabrik').id, 'zunftordnung');
  assert.equal(G.buildBlock(2, 'kontor'), null, 'andere Gebäude bleiben baubar');
  G.demolish(4); assert.equal(G.buildBlock(4, 'fabrik'), null, 'nach einem Abriss wieder frei');
  // schon Vorhandenes bleibt stehen (kein Zwangsabriss): mit sechs Fabriken vor der Wahl bleiben alle stehen, neue sind gesperrt; der Sonderbau ist erst frei, wenn die Grenze erfüllt ist (Teil 6, REQ-K6.01, tests/einschraenkung6.test.mjs)
  const h = game().G; for (let i = 0; i < 6; i++) place(h, 'fabrik', i); pick(h, 'zunftordnung');
  assert.equal(h.countType('fabrik'), 6); assert.equal(h.buildBlock(6, 'fabrik'), 'limit');
  // Standardmodus kennt die Grenze nicht
  const s = game('standard').G; for (let i = 0; i < 6; i++) place(s, 'fabrik', i); assert.equal(s.buildBlock(6, 'fabrik'), null);
});

test('K5.07 Stiftung: Stiftungshaus verdoppelt den Kurs des Forschungsbudgets; Einheiten kosten 20 % mehr', () => {
  const { G, C } = game(); G.S.t = 200;
  place(G, 'universitaet', 0); place(G, 'fabrik', 1); G.setBudget(2);
  const k0 = G.budgetKurs(), c0 = G.unitCost('laeufer');
  pick(G, 'stiftung');
  assert.ok(Math.abs(G.unitCost('laeufer') / c0 - 1.2) < 0.06, `Einheitenkosten ${G.unitCost('laeufer')} gegen ${c0}`);
  assert.equal(G.budgetKurs(), k0, 'ohne Stiftungshaus unverändert');
  upgrade(G, 0, 'stiftungshaus');
  assert.ok(Math.abs(G.budgetKurs() / k0 - 2) < 1e-9, 'Kurs ×2');
  assert.ok(G.has('universitaet'));
  const x0 = (G.S.stats.xpSrc || {}).budget || 0; for (let i = 0; i < 20; i++){ idle(G); G.tick(0.05); }
  const dx = ((G.S.stats.xpSrc || {}).budget || 0) - x0, gross = G.matRate() + G.autoPressCps() * G.clickPower();
  assert.ok(Math.abs(dx - gross * 0.5 * G.budgetKurs()) < 1e-6 * gross + 1e-6, `EP aus dem Budget ${dx}`);
});

test('K5.07 Stehendes Heer: Heerlager gibt Versorgung +6; jede Einheit kostet Unterhalt in Material je Minute', () => {
  const { G, C } = game(); G.S.t = 200;
  place(G, 'kaserne', 0); place(G, 'fabrik', 1);
  pick(G, 'stehendesHeer');
  const cap0 = G.supplyCap();
  upgrade(G, 0, 'heerlager');
  assert.equal(G.supplyCap(), Math.min(C.SUPPLY_CAP_MAX, cap0 + 6), 'Versorgung +6 über die Aufwertung');
  assert.equal(G.upkeepRate(), 0, 'ohne Einheiten kein Unterhalt');
  G.addFormation('p', 1, ['laeufer', 'laeufer', 'werfer'], 200);
  const d = G.S.forms.find(f => f.side === 'p'); assert.ok(d);
  const up = G.mAdd('upkeep'); assert.ok(up > 0);
  assert.ok(Math.abs(G.upkeepRate() - 3 * up / 60) < 1e-12);
  G.S.material = 1000; const m0 = G.S.material, u0 = G.S.stats.upkeep || 0, prod = G.matRate() + G.autoPressCps() * G.clickPower();
  for (let i = 0; i < 20; i++){ idle(G); G.S.units.forEach(u => { u.cd = 1e9; }); G.tick(0.05); }
  const paid = (G.S.stats.upkeep || 0) - u0;
  assert.ok(Math.abs(paid - 3 * up / 60) < 1e-9, `Unterhalt ${paid}`);
  assert.ok(Math.abs((G.S.material - m0) - (prod - paid)) < 1e-6 * prod + 1e-6, 'Material = Ertrag minus Unterhalt');
  G.S.material = 0; G.S.units.forEach(u => { u.cd = 1e9; });
  const s0 = G.S.material; G.tick(0.05); assert.ok(G.S.material >= 0 && s0 === 0);
  // Anzeige
  assert.ok(Math.abs(G.incomeRate() - (G.matRate() + G.autoPressCps() * G.clickPower() - G.upkeepRate())) < 1e-9);
});

test('K5.07 Vorstoß: eigene Wellen rücken doppelt so oft aus, die Türme feuern 30 % langsamer', () => {
  const { G, C } = game();
  place(G, 'kaserne', 0); G.S.lvl.turm_0 = 1;
  const w0 = G.ownWaveInterval(), t0 = G.turretCd(0);
  pick(G, 'vorstoss');
  assert.ok(Math.abs(G.ownWaveInterval() / w0 - 0.5) < 1e-9);
  assert.ok(Math.abs(G.turretCd(0) / t0 - 1.3) < 1e-9);
  const n0 = G.S.ownWaveNo; G.S.nextOwnWave = G.S.t + 1;
  for (let k = 0; k < 20 * 41; k++){ idle(G); G.S.nextWave = 1e9; G.tick(0.05); }
  assert.ok(G.S.ownWaveNo - n0 >= 4, `Wellen in 41 s: ${G.S.ownWaveNo - n0}`);
});

test('K5.07 Bollwerk: Bastion feuert über die Mauer in die Lane ihrer Zeile, Abschüsse bringen doppelte EP, Fabriken liefern 15 % weniger', () => {
  const { G, C } = game(); G.S.t = 200;
  place(G, 'fabrik', 0); place(G, 'fabrik', 4); place(G, 'fabrik', 7);
  const r0 = G.matRate();
  pick(G, 'bollwerk');
  assert.ok(Math.abs(G.factoryRate() / (C.FACTORY_BASE_RATE * G.mMul('materialYield')) - 0.85) < 1e-9, 'Fabriken −15 %');
  upgrade(G, 0, 'bastion'); upgrade(G, 4, 'bastion'); upgrade(G, 7, 'bastion');
  assert.equal(JSON.stringify(G.bastionSlots()), '[0,4,7]'); assert.equal(JSON.stringify([0, 4, 7].map(G.bastionLane)), '[0,1,2]');
  assert.ok(G.matRate() > 0, 'die Fabrik unter der Bastion arbeitet weiter');
  const dmg = C.PLAYER_TURRET.dmgPerLevel * C.DOKTRIN.bastion.grundStufe * C.DOKTRIN.bastion.schadenFaktor;
  assert.equal(G.bastionDmg(0), dmg * G.mMul('turretDmg'));
  // Ziel in Lane 2 (Zeile 3): ein Gegner mit viel Leben verliert genau den Schaden der Bastion
  G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  const f = G.addFormation('e', 2, ['laeufer'], 60); const u = G.S.units.find(x => x.form === f.id); u.hp = u.maxHp = 1e6; u.cd = 1e9;
  G.S.turretCd = {}; idle(G); G.tick(0.05);
  assert.ok(Math.abs((1e6 - u.hp) - G.bastionDmg(2)) < 1e-6, `Schaden ${1e6 - u.hp} gegen ${G.bastionDmg(2)}`);
  // Abschuss: doppelte EP, als Turm-Abschuss gezählt
  const f2 = G.addFormation('e', 0, ['laeufer'], 60); const v = G.S.units.find(x => x.form === f2.id); v.hp = 1; v.cd = 1e9;
  const xp0 = G.S.xpTotal; G.S.turretCd = {}; idle(G); G.tick(0.05); idle(G); G.tick(0.05);
  assert.ok(v.dead || G.S.units.every(x => x.id !== v.id), 'Gegner gefallen');
  assert.ok(G.S.stats.towerKills >= 1);
  assert.ok(Math.abs((G.S.xpTotal - xp0) - C.UNITS.laeufer.bounty * G.bountyMult() * G.xpMult() * 2) < 1e-6, `EP ${G.S.xpTotal - xp0}`);
  // ohne stehenden Abschnitt feuert die Bastion nicht
  G.S.sections[2].hp = 0; const f3 = G.addFormation('e', 2, ['laeufer'], 60); const w = G.S.units.find(x => x.form === f3.id); w.hp = w.maxHp = 1e6; w.cd = 1e9; G.S.turretCd = {};
  G.tick(0.05); assert.equal(w.hp, 1e6, 'Mauer gefallen: keine Wirkung');
});

test('K5.07 Ausfall: nach jeder abgewehrten Welle rückt ein Gegenstoß mit +100 % Stärke aus, die Reparatur kostet das Doppelte', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); idle(G); G.S.lvl.turm_0 = 3; G.S.waveNo = 4;
  const rc0 = G.repairCost();
  pick(G, 'ausfall');
  assert.equal(G.repairCost(), rc0 * 2);
  const f = G.addFormation('e', 0, ['laeufer'], 60); for (const u of G.S.units) if (u.form === f.id){ u.wave = 5; u.hp = 1; }
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  for (let i = 0; i < 200 && G.S.units.some(u => u.side === 'e'); i++){ idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); }
  assert.equal(G.S.stats.counterWaves, 1, 'ohne Linienstufe');
  const mine = G.S.units.filter(u => u.side === 'p'); assert.equal(mine.length, 3);
  const base = G.unitStats('p', 'laeufer');
  for (const u of mine){ assert.ok(Math.abs(u.dmg / base.dmg - 2) < 1e-6, 'Schaden +100 %'); assert.ok(Math.abs(u.maxHp / base.hp - 2) < 1e-6, 'Leben +100 %'); }
});

test('K5.07: Doktrin trägt drei Zeichen der Linie; zwei Doktrinen derselben Linie reichen für Stufe 2', () => {
  const { G } = game();
  pick(G, 'bollwerk');
  assert.equal(G.lineState().verteidigung.signs, 3); assert.equal(G.lineState().verteidigung.stage, 1);
  pick(G, 'ausfall');
  assert.equal(G.lineState().verteidigung.signs, 6);
  assert.equal(G.lineState().militaer.signs, 0);
});

/* ---------- Angebotsausgleich ---------- */
function richState(seed){
  const { G, C } = game('karten', seed);
  place(G, 'kaserne', 0); place(G, 'universitaet', 1); place(G, 'fabrik', 2); G.S.level = 5; G.S.t = 200;
  return { G, C };
}
test('K5.07: ab Wahl 3 enthält spätestens jedes dritte Angebot eine Doktrin (solange noch Platz ist)', () => {
  let maxGap = 0, offers = 0, withDok = 0;
  for (let seed = 1; seed <= 40; seed++){
    const { G } = richState(seed);
    let gap = 0;
    for (let n = 1; n <= 14; n++){
      G.S.pfad.choices = n - 1; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = -1e9;
      G.offerDraft();
      const ids = G.S.pendingDraft.options, dok = ids.filter(id => G.OPT[id].doktrin);
      assert.ok(dok.length <= 1, 'höchstens eine Doktrin je Angebot');
      if (n < 3){ assert.equal(dok.length, 0, `Wahl ${n}: keine Doktrin vor Wahl 3`); continue; }
      offers++; if (dok.length){ withDok++; gap = 0; } else { gap++; maxGap = Math.max(maxGap, gap); }
      assert.ok(gap <= 2, `Seed ${seed}, Wahl ${n}: ${gap} Angebote in Folge ohne Doktrin`);
    }
  }
  assert.ok(maxGap <= 2); assert.ok(withDok / offers > 0.3, `Anteil der Angebote mit Doktrin ${(withDok / offers).toFixed(2)}`);
});

test('K5.07: ohne Doktrin mit Wirkung kein Zwang; der Zähler läuft ab Wahl 3', () => {
  const { G } = game();
  G.S.pfad.choices = 2; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.level = 5;
  G.offerDraft();
  assert.ok(!G.S.pendingDraft.options.some(id => G.OPT[id].doktrin));
  assert.equal(G.S.pfad.sinceDoktrin, 1);
  G.S.pendingDraft = null; G.S.pfad.choices = 3; G.offerDraft(); assert.equal(G.S.pfad.sinceDoktrin, 2);
  assert.equal(G.S.stats.doktrinOffers, undefined);
});

test('K5.07: führt der Spieler eine Linie, ziehen ihre Doktrinen mit höherem Gewicht', () => {
  const count = lead => {
    let hits = 0, n = 0;
    for (let seed = 1; seed <= 200; seed++){
      const { G } = richState(seed);
      if (lead) pick(G, 'stehendesHeer');                              // drei Zeichen Militär: die Linie führt
      G.S.pfad.choices = 6; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.sinceDoktrin = 2; G.S.pfad.lastPickT = -1e9;
      G.offerDraft();
      if (G.S.pendingDraft.options.includes('vorstoss')) hits++;
      n++;
    }
    return hits / n;
  };
  const lead = count(true), none = count(false);
  assert.ok(lead > none * 1.5, `mit Führung des Militärs häufiger: ${lead} gegen ${none}`);
});

test('K5.07: Bann einer fälligen Doktrin ersetzt sie durch eine andere Doktrin', () => {
  const { G } = richState(3);
  G.S.pfad.choices = 6; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.sinceDoktrin = 2; G.S.pfad.lastPickT = -1e9;
  G.offerDraft();
  const i = G.S.pendingDraft.options.findIndex(id => G.OPT[id].doktrin);
  assert.ok(i >= 0); assert.equal(G.S.pendingDraft.doktrinForced, true);
  G.S.research.done.r_bann = 1; G.S.research.ver++;
  assert.ok(G.banOption(i)); assert.ok(G.S.pendingDraft.options.some(id => G.OPT[id].doktrin), 'wieder eine Doktrin im Angebot');
});

test('K5.07: Wahl einer Doktrin steht im Protokoll (stats.doktrinen) und zählt als Karte', () => {
  const { G } = richState(5);
  G.S.pfad.choices = 3; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.sinceDoktrin = 2; G.S.pfad.lastPickT = -1e9;
  G.offerDraft();
  const i = G.S.pendingDraft.options.findIndex(id => G.OPT[id].doktrin); assert.ok(i >= 0);
  const id = G.S.pendingDraft.options[i];
  assert.equal(G.S.stats.doktrinOffers, 1);
  assert.ok(G.chooseDraft(i));
  assert.equal(G.S.stats.doktrinen.length, 1); assert.equal(G.S.stats.doktrinen[0].id, id); assert.equal(G.S.stats.doktrinen[0].wahl, 4);
  assert.equal(G.cardTaken(id), 1);
});

/* ---------- Texte ---------- */
import { loadI18n } from '../tools/load-core.mjs';
test('K5.07: Texte der Doktrinen und Sonderbauten in de und en; Wirkungszeile höchstens 44 Zeichen, nennt keine andere Karte', () => {
  const I = loadI18n(), { C, D, G, L } = (() => { const g = game(); return { C: g.C, D: g.D, G: g.G, L: g.L }; })();
  const pct = x => Math.round(x * 100), num = n => n % 1 ? String(n).replace('.', ',') : String(n);
  const val = e => e.mul !== undefined ? pct(Math.abs(e.mul - 1)) : e.add;
  for (const lang of ['de', 'en']){
    const T = I[lang], fill = (s, p) => s.replace(/\{(\w+)\}/g, (_, k) => { assert.ok(k in p, `${lang}: Platzhalter {${k}} in „${s}“ ohne Wert`); return String(p[k]); });
    for (const d of D){
      const p = { nb: C.DOKTRIN.zunfthaus.nachbarFaktor, bd: pct(C.DOKTRIN.bastion.schadenFaktor - 1) };
      if (d.grenze) p.g = d.grenze.max;
      (d.effect || []).forEach((e, i) => { p['e' + (i + 1)] = e.stat === 'ownWaveInterval' ? num(e.mul) : e.stat === 'counterBoost' ? pct(e.add) : val(e); });
      (d.drawback || []).forEach((e, i) => { p['d' + (i + 1)] = val(e); p['d' + (i + 1) + 'p'] = e.mul !== undefined ? pct(Math.abs(e.mul - 1)) : val(e); });
      const v = d.sonderbau && G.VAR[d.sonderbau]; if (v) v.effect.forEach((e, i) => { p['s' + (i + 1)] = e.stat === 'budgetKurs' ? num(e.mul) : val(e); });
      for (const k of [d.nameKey, d.descKey, 'kp.eff.' + d.id]) assert.ok(T[k], `${lang}: ${k}`);
      const eff = fill(T['kp.eff.' + d.id], p);
      assert.ok(eff.length <= 44, `${lang} kp.eff.${d.id}: ${eff.length} Zeichen: „${eff}“`);
      fill(T[d.descKey], p);
      for (const other of D) if (other.id !== d.id) assert.ok(!eff.includes(T[other.nameKey]), `${lang} ${d.id}: nennt ${other.id}`);
      assert.ok(fill(T[d.descKey], p).length > eff.length, 'Detailzeile nennt mehr als die Wirkungszeile');
    }
    for (const v of L.varianten.filter(x => x.doktrin)) for (const k of [v.nameKey, v.descKey, `var.${v.id}.eff`]) assert.ok(T[k], `${lang}: ${k}`);
    for (const k of ['draft.cat.doktrin', 'draft.rarity.doktrin', 'kp.fam.doktrin', 'build.reason.limit']) assert.ok(T[k], `${lang}: ${k}`);
  }
});

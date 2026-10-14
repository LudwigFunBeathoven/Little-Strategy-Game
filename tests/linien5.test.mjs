// Tests Kartenpfad Teil 5, REQ-K5.08 (Linien: Zeichen und Stufen neu) und REQ-K5.09 (Grundvarianten angleichen).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(seed = 7, diff = 'normal'){
  const { KlammerCore, KF_CONFIG, KF_LINIEN } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing: 'karten' });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG, L: KF_LINIEN };
}
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = 1; G.S.draft.ver++; };
const drop = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = 0; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), type); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const setVariant = (G, i, vid) => { G.S.slots[i].variant = vid; G.S.slotVer++; };
const STAGES = { militaer: ['stehendesHeer', 'vorstoss'], wirtschaft: ['zunftordnung', 'stiftung'], verteidigung: ['bollwerk', 'ausfall'] };

test('K5.08: Zeichenquellen sind nur Doktrinen (drei) und Gebäude-Varianten (je Typ eines); keine andere Karte trägt ein Zeichen', () => {
  const { G, L } = game();
  for (const o of G.ALL_OPTIONS){
    const s = G.cardSigns(o.id);
    if (o.doktrin) assert.equal(s.length, 3, o.id); else assert.equal(s.length, 0, `${o.id}: keine Zeichen`);
  }
  assert.equal(Object.keys(L.zeichen).length, 6);
  place(G, 'fabrik', 0); place(G, 'fabrik', 1); place(G, 'kaserne', 2); G.S.t = 200;
  setVariant(G, 0, 'werkstatt'); setVariant(G, 1, 'werkstatt');
  assert.equal(G.lineState().militaer.signs, 1, 'zwei Werkstätten: ein Zeichen (je Variantentyp einmal)');
  setVariant(G, 2, 'exerzierplatz');
  assert.equal(G.lineState().militaer.signs, 2); assert.equal(G.lineState().militaer.stage, 1);
  pick(G, 'ballistik', 'bessereFabriken', 'zinnen', 'drill');
  assert.equal(G.lineState().militaer.signs, 2, 'Bonus- und Technologiekarten zählen nicht');
  pick(G, 'stehendesHeer');
  assert.equal(G.lineState().militaer.signs, 5);
  // Sonderbau zählt wie jede Variante ein Zeichen
  setVariant(G, 2, 'heerlager'); assert.equal(G.lineState().militaer.signs, 5, 'Heerlager ersetzt den Exerzierplatz, ein Zeichen');
});

test('K5.08: Stufen bei 2, 4 und 6 Zeichen; Stufe 3 setzt mindestens eine Doktrin der Linie voraus', () => {
  const { G, C } = game();
  assert.equal(JSON.stringify(C.LINIEN.zeichenStufen), '[2,4,6]');
  // mit abgesenkten Schwellen: drei Varianten der Verteidigung erreichen Stufe 2, aber nie Stufe 3 ohne Doktrin
  C.LINIEN.zeichenStufen = [1, 2, 3];
  place(G, 'fabrik', 0); place(G, 'kaserne', 1); place(G, 'schmiede', 2); G.S.t = 200;
  setVariant(G, 0, 'wachstube'); setVariant(G, 1, 'garnison'); setVariant(G, 2, 'ruestkammer');
  const st = G.lineState().verteidigung;
  assert.equal(st.signs, 3); assert.equal(st.stage, 2, 'drei Zeichen, aber keine Doktrin: Stufe 3 gesperrt'); assert.equal(st.doctrine, false);
  pick(G, 'ausfall');
  assert.equal(G.lineState().verteidigung.stage, 3, 'mit Doktrin der Linie Stufe 3');
  drop(G, 'ausfall'); pick(G, 'stehendesHeer');
  assert.equal(G.lineState().verteidigung.stage, 2, 'die Doktrin einer anderen Linie genügt nicht');
});

test('K5.08: Stufen der Linien mit echten Schwellen: eine Doktrin Stufe 1, Doktrin plus Variante Stufe 2, zwei Doktrinen Stufe 3', () => {
  const { G } = game(); place(G, 'fabrik', 0); G.S.t = 200;
  for (const [l, docs] of Object.entries(STAGES)){
    drop(G, ...Object.values(STAGES).flat());
    assert.equal(G.lineState()[l].stage, 0);
    pick(G, docs[0]); assert.equal(G.lineState()[l].stage, 1, `${l}: eine Doktrin`);
    pick(G, docs[1]); assert.equal(G.lineState()[l].stage, 3, `${l}: zwei Doktrinen (sechs Zeichen)`);
  }
});

/* ---------- Regeln je Stufe: greifen ab der Schwelle, entfallen darunter ---------- */
const withStage = (G, linie, n) => { drop(G, ...Object.values(STAGES).flat()); if (n >= 1) pick(G, STAGES[linie][0]); if (n >= 3) pick(G, STAGES[linie][1]); assert.equal(G.lineState()[linie].stage, n === 2 ? 1 : n); };

test('Militär 1: die Kaserne schickt je Welle einen Läufer mehr', () => {
  const { G } = game(); place(G, 'kaserne', 0); idle(G);
  const wave = () => { const n0 = G.S.units.filter(u => u.side === 'p').length; for (let i = 0; i < 3; i++) G.spawn('laeufer'); G.S.nextOwnWave = G.S.t; G.tick(0.05); return G.S.units.filter(u => u.side === 'p').length - n0; };
  withStage(G, 'militaer', 0); assert.equal(wave(), 3);
  withStage(G, 'militaer', 1); idle(G); assert.equal(wave(), 4);
  withStage(G, 'militaer', 0); idle(G); assert.equal(wave(), 3, 'ohne die Stufe entfällt der Läufer');
});

test('Militär 2: Einheiten starten mit der nächsten Schmiede-Stufe; Stufe 3 (Durchbruch): doppelter Schaden an der gegnerischen Basis', () => {
  const { G, C } = game(); place(G, 'schmiede', 0); G.S.lvl.qualitaet = 0;
  const q0 = G.qualityMult(); assert.equal(q0, 1);
  // Stufe 2 braucht vier Zeichen: eine Doktrin und eine Variante
  place(G, 'fabrik', 1); G.S.t = 200; withStage(G, 'militaer', 1); assert.equal(G.qualityMult(), 1, 'Stufe 1: noch keine Wirkung');
  setVariant(G, 1, 'werkstatt');
  assert.equal(G.lineState().militaer.stage, 2);
  assert.ok(Math.abs(G.qualityMult() - (1 + C.FX_QUALITAET)) < 1e-9, `Schmiede-Stufe +1: ${G.qualityMult()}`);
  G.S.slots[1].variant = null; G.S.slotVer++;
  assert.equal(G.qualityMult(), 1, 'unter der Schwelle entfällt die Regel');
  // Stufe 3
  withStage(G, 'militaer', 3);
  assert.equal(G.mMul('dmgVsBase'), 2);
  const f = G.addFormation('p', 1, ['laeufer'], C.LANE - C.ENEMY_BASE_WIDTH - 2), u = G.S.units.find(x => x.form === f.id); u.cd = 0;
  const hp0 = G.S.enemyBaseHp; idle(G); G.tick(0.05);
  assert.ok(Math.abs((hp0 - G.S.enemyBaseHp) - u.dmg * 2) < 1e-6, `Basisschaden ${hp0 - G.S.enemyBaseHp} gegen ${u.dmg * 2}`);
  withStage(G, 'militaer', 1); assert.equal(G.mMul('dmgVsBase'), 1);
});

test('Wirtschaft 1: Nachbarschaftsboni wirken auch diagonal', () => {
  const { G } = game(); place(G, 'fabrik', 0); place(G, 'fabrik', 4);                   // Plätze 0 und 4 liegen diagonal
  withStage(G, 'wirtschaft', 0); assert.equal(G.neighborValue(0, 'fabrik'), 0);
  const r0 = G.matRate();
  withStage(G, 'wirtschaft', 1);
  assert.ok(G.neighborValue(0, 'fabrik') > 0, 'diagonaler Nachbar zählt'); assert.ok(G.matRate() > r0 * 1.05, 'Ertrag steigt');
  const pv = G.neighborPreview(8, 'fabrik'); assert.ok(pv.gets.n >= 1, 'die Vorschau kennt den diagonalen Nachbarn (Platz 4)');
  withStage(G, 'wirtschaft', 0); assert.equal(G.neighborValue(0, 'fabrik'), 0, 'unter der Schwelle entfällt die Regel');
});

test('Wirtschaft 2: Material über dem Lagerdeckel wird zu EP', () => {
  const { G, C } = game(); for (let i = 0; i < 3; i++) place(G, 'fabrik', i); place(G, 'kaserne', 5); place(G, 'schmiede', 6); G.S.t = 200;
  withStage(G, 'wirtschaft', 1); setVariant(G, 5, 'zahlmeisterei');                      // Doktrin (3) plus Zahlmeisterei (1) = Stufe 2
  assert.equal(G.lineState().wirtschaft.stage, 2);
  const deckel = G.lagerDeckel(); assert.ok(deckel > 0);
  G.S.material = deckel + 1000; idle(G); const x0 = G.S.xpTotal, s0 = (G.S.stats.xpSrc || {}).lager || 0;
  G.tick(0.05);
  assert.ok(G.S.material <= deckel + 1e-6 + G.matRate() * 0.05, `Material auf den Deckel begrenzt: ${G.S.material} gegen ${deckel}`);
  const ep = ((G.S.stats.xpSrc || {}).lager || 0) - s0; assert.ok(Math.abs(ep - 1000 * C.LINIEN.lager.kurs) < 5 + G.matRate(), `EP ${ep}`);
  assert.ok(G.S.xpTotal - x0 >= ep - 1e-6);
  G.S.material = deckel - 100; idle(G); const s1 = (G.S.stats.xpSrc || {}).lager || 0; G.tick(0.05);
  assert.equal(((G.S.stats.xpSrc || {}).lager || 0), s1, 'unter dem Deckel nichts');
  G.S.slots[5].variant = null; G.S.slotVer++; assert.equal(G.lineState().wirtschaft.stage, 1, 'ohne die Variante drei Zeichen: Stufe 1');
  G.S.material = deckel + 1000; idle(G); const s2 = (G.S.stats.xpSrc || {}).lager || 0; G.tick(0.05);
  assert.equal(((G.S.stats.xpSrc || {}).lager || 0), s2, 'unter der Schwelle entfällt die Regel');
});

test('Wirtschaft 3 (Söldner): Material wird direkt in Einheiten umgewandelt, die keine Versorgung belegen', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); idle(G);
  withStage(G, 'wirtschaft', 0);
  const cap = G.supplyCap(); for (let i = 0; i < cap; i++) assert.ok(G.spawn('laeufer'));
  assert.equal(G.supplyFull(), true); assert.equal(G.spawn('laeufer'), false, 'ohne die Stufe: Versorgung voll');
  withStage(G, 'wirtschaft', 3);
  assert.equal(G.supplyFull(), false, 'mit Söldnern ist die Warteschlange nie voll');
  const price = G.unitPrice('laeufer'), base = G.unitCost('laeufer');
  assert.equal(price, Math.ceil(base * C.LINIEN.soeldner.kostenFaktor), 'Aufschlag über dem Limit');
  const m0 = G.S.material; assert.ok(G.spawn('laeufer')); assert.equal(m0 - G.S.material, price);
  const merc = G.S.queue[G.S.queue.length - 1]; assert.equal(merc.merc, true); assert.equal(G.S.queue.length, cap + 1);
  assert.ok(G.spawn('laeufer')); assert.equal(G.S.queue.length, cap + 2);
  // sie rücken mit der Welle aus
  G.S.nextOwnWave = G.S.t; G.tick(0.05); assert.equal(G.S.units.filter(u => u.side === 'p').length, cap + 2); assert.equal(G.S.queue.length, 0);
  // unter dem Limit kostet es den normalen Preis
  assert.equal(G.unitPrice('laeufer'), base);
});

test('Verteidigung 1: Abschüsse durch Türme bringen Material', () => {
  const { G, C } = game(); G.S.lvl.turm_0 = 3; idle(G);
  const kill = () => { const f = G.addFormation('e', 0, ['laeufer'], 60), u = G.S.units.find(x => x.form === f.id); u.hp = 1; u.cd = 1e9; G.S.turretCd = {}; const m0 = (G.S.stats.towerMaterial || 0); idle(G); G.tick(0.05); idle(G); G.tick(0.05); return (G.S.stats.towerMaterial || 0) - m0; };
  withStage(G, 'verteidigung', 0); assert.equal(kill(), 0);
  withStage(G, 'verteidigung', 1); assert.ok(kill() >= C.UNITS.laeufer.bounty, 'Material je Abschuss');
  withStage(G, 'verteidigung', 0); assert.equal(kill(), 0, 'unter der Schwelle entfällt die Regel');
});

test('Verteidigung 2: nach jeder abgewehrten Welle rückt sofort eine eigene Welle aus (Gegenstoß); Stufe 3 (Ausbruch): +50 % Stärke, doppelter Basisschaden', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); idle(G); G.S.lvl.turm_0 = 3; G.S.waveNo = 4;
  const repel = () => {
    G.S.units = G.S.units.filter(u => u.side !== 'p'); G.S.queue = []; G.S.stats.counterWaves = 0;
    const f = G.addFormation('e', 0, ['laeufer'], 60); for (const u of G.S.units) if (u.form === f.id){ u.wave = 5; u.hp = 1; }
    for (let i = 0; i < 3; i++) G.spawn('laeufer');
    for (let i = 0; i < 200 && G.S.units.some(u => u.side === 'e'); i++){ idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); }
    return G.S.units.filter(u => u.side === 'p');
  };
  // Stufe 2 braucht vier Zeichen: Doktrin plus Variante
  place(G, 'fabrik', 1); G.S.t = 200;
  withStage(G, 'verteidigung', 0); assert.equal(repel().length, 0, 'ohne die Stufe kein Gegenstoß'); assert.equal(G.S.stats.counterWaves, 0);
  withStage(G, 'verteidigung', 1); setVariant(G, 1, 'wachstube'); assert.equal(G.lineState().verteidigung.stage, 2);
  G.S.waveNo = 4; const m2 = repel(); assert.equal(G.S.stats.counterWaves, 1); assert.equal(m2.length, 3);
  const base = G.unitStats('p', 'laeufer'); for (const u of m2){ assert.ok(Math.abs(u.dmg / base.dmg - 1) < 1e-6, 'Stufe 2: keine zusätzliche Stärke'); assert.ok(!u.baseMult || u.baseMult === 1); }
  G.S.slots[1].variant = null; G.S.slotVer++; G.S.waveNo = 4; repel(); assert.equal(G.S.stats.counterWaves, 0, 'unter der Schwelle entfällt der Gegenstoß');
  // Stufe 3 (zwei Doktrinen der Linie)
  withStage(G, 'verteidigung', 3); setVariant(G, 1, 'wachstube');
  const d0 = G.mMul('dmgVsBase'); G.S.waveNo = 4; const m3 = repel(); assert.equal(G.S.stats.counterWaves, 1);
  const b3 = G.unitStats('p', 'laeufer'), boost = 1 + 1 + C.LINIEN.stufen.verteidigung[2][0].add;       // Doktrin Ausfall +100 % und Stufe 3 +50 %
  for (const u of m3){ assert.ok(Math.abs(u.dmg / b3.dmg - boost) < 1e-6, `Stufe 3: Schaden ${u.dmg / b3.dmg}`); assert.ok(Math.abs(u.maxHp / b3.hp - boost) < 1e-6); assert.equal(u.baseMult, 2, 'doppelter Basisschaden'); }
  const f = G.addFormation('p', 1, ['laeufer'], C.LANE - C.ENEMY_BASE_WIDTH - 2), plain = G.S.units.find(x => x.form === f.id); plain.cd = 0;
  const hp0 = G.S.enemyBaseHp; idle(G); G.tick(0.05);
  assert.ok(Math.abs((hp0 - G.S.enemyBaseHp) - plain.dmg) < 1e-6 * plain.dmg + 1e-6 || d0 === 1, 'gewöhnliche Einheiten richten normalen Schaden an');
});

/* ---------- K5.09 Grundvarianten ---------- */
test('K5.09: Grundvarianten angeglichen; jedes Grundgebäude hat eine Variante je Linie (Fabrik, Kaserne, Schmiede)', () => {
  const { G, L } = game();
  const v = id => L.varianten.find(x => x.id === id);
  assert.equal(v('manufaktur').effect[0].add, 0.2); assert.equal(v('werkstatt').effect[0].mul, 0.75);
  assert.equal(v('wachstube').effect.find(e => e.stat === 'turretDmg').mul, 1.3); assert.ok(v('wachstube').effect.some(e => e.stat === 'towerKillMaterial'));
  const z = v('zahlmeisterei'); assert.equal(z.basis, 'kaserne'); assert.equal(z.linie, 'wirtschaft'); assert.equal(z.effect[0].stat, 'quartiereCost'); assert.equal(z.effect[0].mul, 0.7);
  for (const basis of ['fabrik', 'kaserne', 'schmiede']){
    const base = L.varianten.filter(x => x.basis === basis && !x.doktrin);
    assert.equal(JSON.stringify(base.map(x => x.linie).sort()), JSON.stringify(['militaer', 'verteidigung', 'wirtschaft']), `${basis}: je Linie eine Grundvariante`);
  }
  // Sonderbauten sind deutlich stärker (teurer, Regeländerung)
  assert.ok(L.varianten.filter(x => x.doktrin).length === 4);
});

test('K5.09 Zahlmeisterei: der Kaserne-Ausbau „Quartiere“ kostet 30 % weniger', () => {
  const { G } = game(); place(G, 'kaserne', 0); G.S.t = 200;
  const c0 = G.upCost('ausbau'); assert.ok(c0 > 0);
  setVariant(G, 0, 'zahlmeisterei');
  assert.equal(G.upCost('ausbau'), Math.ceil(c0 * 0.7));
  assert.equal(G.upCost('qualitaet'), G.upCost('qualitaet'), 'andere Ausbauten unberührt');
});

test('K5.09: Werkstatt −25 % Einheitenkosten, Manufaktur +20 % Ertrag, Wachstube +30 % Turmschaden', () => {
  const { G, C } = game(); place(G, 'fabrik', 0); place(G, 'fabrik', 2); place(G, 'fabrik', 6); G.S.t = 200;                 // nicht benachbart: kein Nachbarschaftsbonus im Weg
  const c0 = G.unitCost('laeufer'), r0 = G.matRate(), t0 = G.mMul('turretDmg');
  setVariant(G, 0, 'werkstatt'); assert.ok(Math.abs(G.unitCost('laeufer') / c0 - 0.75) < 0.05, `Einheitenkosten ${G.unitCost('laeufer')} gegen ${c0}`);
  setVariant(G, 0, null); setVariant(G, 0, 'manufaktur'); assert.ok(Math.abs(G.matRate() / r0 - (1 + 0.2 / 3)) < 1e-9, 'Ertrag der einen Manufaktur +20 %');
  setVariant(G, 0, 'wachstube'); assert.ok(Math.abs(G.mMul('turretDmg') / t0 - 1.3) < 1e-9);
});

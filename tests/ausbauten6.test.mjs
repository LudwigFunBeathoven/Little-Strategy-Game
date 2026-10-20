// Tests Kartenpfad Teil 6, REQ-K6.07: Gebäude-Ausbauten als Karten (Turmschule, Stachelwall, Zinsmeister, Maurerkolonne).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 9){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type}: ${G.buildBlock(i, type)}`); };
const stack = (G, id, n) => { G.S.draft.stacks[id] = n; G.S.draft.ver++; };
const EXPECT_GONE = ['reichweite_0', 'reichweite_2', 'kadenz_0', 'kadenz_2', 'stacheln', 'moertel', 'zinseszins'];
const BASICS = ['presse', 'qualitaet', 'ausbau', 'mauer', 'turm_0', 'turm_2'];       // Grundlagen aus dem Leitsatz: Presse, Schmiede, Quartiere, Mauerausbau, Türme bauen

test('K6.07: sieben Ausbauten entfallen im Modus karten (nicht kaufbar, nicht sichtbar); im Standardmodus bleiben sie', () => {
  const { G, P } = game();
  assert.equal(JSON.stringify([...P.entfallenAusbauten].sort()), JSON.stringify([...EXPECT_GONE].sort()));
  place(G, 'kaserne', 0); place(G, 'kontor', 1); place(G, 'schmiede', 2); G.S.lvl.turm_0 = 1; G.S.lvl.turm_2 = 1;
  for (const id of EXPECT_GONE){ assert.equal(G.ausbauRemoved(id), true, id); assert.equal(G.isAvailable(id), false, `${id}: nicht verfügbar`); assert.equal(G.canBuy(id), false, `${id}: nicht kaufbar`); }
  const { G: S } = game('standard');
  place(S, 'kontor', 1); S.S.lvl.turm_0 = 1; S.S.lvl.turm_2 = 1; S.S.revealed = {};
  for (const id of EXPECT_GONE){ assert.equal(S.ausbauRemoved(id), false, id); }
  for (const id of ['reichweite_0', 'kadenz_2', 'zinseszins', 'stacheln', 'moertel']) assert.equal(S.isAvailable(id), true, `${id}: Standardmodus unverändert`);
  assert.equal(S.canBuy('reichweite_0'), true); assert.ok(S.buy('stacheln'));
});

test('K6.07: Grundlagen bleiben ohne Karte erreichbar (Presse, Schmiede bis Stufe 3, Quartiere, Mauerausbau, Türme bauen)', () => {
  const { G } = game();
  place(G, 'kaserne', 0); place(G, 'schmiede', 1); G.S.material = 1e7;
  for (const id of BASICS){
    if (id === 'turm_0' || id === 'turm_2') assert.equal(G.isAvailable(id), true, id);
    G.S.material = 1e7;
    assert.equal(G.ausbauRemoved(id), false, `${id}: nicht gestrichen`);
    assert.equal(G.canBuy(id), true, `${id}: ohne Karte kaufbar`);
  }
  G.S.lvl.qualitaet = 2; G.S.material = 1e7; assert.equal(G.canBuy('qualitaet'), true, 'Schmiede bis Stufe 3 ohne Karte');
  assert.ok(G.buy('turm_0')); assert.ok(G.buy('mauer')); assert.ok(G.buy('ausbau'));
  assert.equal(G.canBuy('reichweite_0'), false, 'der Turmausbau selbst ist Karte');
});

test('K6.07 Turmschule: Reichweite und Abklingzeit der Karte (Stufe III) übertreffen den ganzen Ausbau; sie wirkt nicht mit Freihandel', () => {
  const { G, C } = game(); const { G: S } = game('standard');
  G.S.lvl.turm_0 = 1; S.S.lvl.turm_0 = 1; S.S.lvl.reichweite_0 = C.UPGRADES.reichweite_0.max; S.S.lvl.kadenz_0 = C.UPGRADES.kadenz_0.max;
  const r0 = G.turretRange(0), c0 = G.turretCd(0), rFull = S.turretRange(0), cFull = S.turretCd(0);
  assert.equal(r0, C.TOWER_RANGE);
  const tiers = G.tiersOf(G.OPT.turmschule); assert.equal(tiers.length, 3);
  for (const n of [1, 2, 3]){
    stack(G, 'turmschule', n);
    assert.ok(G.turretRange(0) > r0, `Stufe ${n}: Reichweite`); assert.ok(G.turretCd(0) < c0, `Stufe ${n}: Abklingzeit`);
    if (n > 1) assert.ok(G.turretRange(0) > rPrev && G.turretCd(0) < cPrev, `Stufe ${n} stärker als ${n - 1}`);
    var rPrev = G.turretRange(0), cPrev = G.turretCd(0);                           // eslint-disable-line no-var
    const noticeable = tiers[n - 1].effect.every(e => e.mul >= 1.2 - 1e-9 || e.mul <= 0.8 + 1e-9); assert.ok(noticeable, `Stufe ${n}: spürbar`);
  }
  assert.ok(G.turretRange(0) >= rFull, `Reichweite ${G.turretRange(0)} gegen ganzen Ausbau ${rFull}`);
  assert.ok(G.turretCd(0) <= cFull, `Abklingzeit ${G.turretCd(0)} gegen ganzen Ausbau ${cFull}`);
  // Freihandel sperrt wie die Ausbauten
  stack(G, 'freihandel', 1); assert.equal(G.turretRange(0), r0); assert.ok(Math.abs(G.turretCd(0) - c0) < 1e-12);
  const { G: H } = game(); H.S.lvl.turm_0 = 1; stack(H, 'freihandel', 1); H.S.pfad.choices = 10; assert.equal(H.optionAvailable(H.OPT.turmschule), false, 'nicht im Angebot mit Freihandel');
});

test('K6.07 Stachelwall: sieben Stachelstufen (Stufe III) übertreffen die fünf Stufen des Ausbaus', () => {
  const { G, C } = game(); const { G: S } = game('standard');
  S.S.lvl.stacheln = C.UPGRADES.stacheln.max;
  assert.equal(G.stachelStufen(), 0); const full = S.stachelStufen(); assert.equal(full, 5);
  const t = G.tiersOf(G.OPT.stachelwall); assert.equal(t.length, 3);
  let prev = 0; for (const n of [1, 2, 3]){ stack(G, 'stachelwall', n); assert.ok(G.stachelStufen() > prev); prev = G.stachelStufen(); assert.ok(G.stachelStufen() * C.FX_STACHELN_DMG / C.UNITS.laeufer.hp >= 0.2, `Stufe ${n}: spürbar`); }
  assert.ok(G.stachelStufen() >= full, 'Stufe III wirkt mindestens wie der ganze Ausbau');
});

test('K6.07 Zinsmeister: Stufen der Karte Handelskontor heben den Zinsdeckel mindestens so hoch wie der ganze Ausbau', () => {
  const { G, C } = game(); const { G: S } = game('standard');
  place(G, 'kontor', 1); place(S, 'kontor', 1); S.S.lvl.zinseszins = C.UPGRADES.zinseszins.max;
  const t = G.tiersOf(G.OPT.handelskontor); assert.equal(t.length, 3);
  const base = G.kontorCap(), full = S.kontorCap(); assert.ok(full >= base * 5);
  let prev = base; for (const n of [1, 2, 3]){ stack(G, 'handelskontor', n); assert.ok(G.kontorCap() > prev, `Stufe ${n}`); assert.ok(G.kontorCap() / base >= 2 - 1e-9, `Stufe ${n}: spürbar`); prev = G.kontorCap(); }
  assert.ok(G.kontorCap() >= full, `Deckel ${G.kontorCap()} gegen ganzen Ausbau ${full}`);
  const { G: T } = game('standard'); assert.equal(T.tiersOf(T.OPT.handelskontor).length, 1, 'Standardmodus: eine Stufe wie in main');
});

test('K6.07 Maurerkolonne: Stufe III regeneriert mindestens so viel wie der ganze Ausbau Mörtelkolonne', () => {
  const { G, C } = game();
  const full = C.FX_MOERTEL_REGEN * C.UPGRADES.moertel.max;                                  // Lebenspunkte je Sekunde und Abschnitt
  stack(G, 'maurerkolonne', 3);
  for (let i = 0; i < 3; i++) assert.ok(G.sectionMax(i) * G.mAdd('wallRegenPct') / 100 >= full, `Abschnitt ${i}: ${G.sectionMax(i) * G.mAdd('wallRegenPct') / 100} gegen ${full}`);
});

test('K6.07: der Pool bleibt bei höchstens 42 Karten ohne Doktrinen (Teil 7); verbrannteErde ist gestrichen, die Ausbau-Karten sind Verteidigung bzw. Wirtschaft', () => {
  const { G, C } = game();
  const pool = G.ALL_OPTIONS.filter(o => !o.doktrin && !G.cardRemoved(o.id));
  assert.ok(pool.length <= C.KATEGORIEN.poolMax, `Karten im Pool: ${pool.length}`);
  assert.equal(G.cardRemoved('verbrannteErde'), true);
  for (const id of ['turmschule', 'stachelwall']){ assert.equal(JSON.stringify(G.katsOf(G.OPT[id])), JSON.stringify(['verteidigung'])); assert.equal(G.OPT[id].nurKarten, true); }
  const { G: S } = game('standard'); for (const id of ['turmschule', 'stachelwall']) assert.equal(S.optionAvailable(S.OPT[id]), false, `${id}: nicht im Standardmodus`);
  assert.equal(S.cardRemoved('verbrannteErde'), false, 'im Standardmodus unverändert');
});

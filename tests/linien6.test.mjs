// Tests Kartenpfad Teil 6, REQ-K6.02: Die Strategielinien entfallen; ihre Regeln sind Karten, die in Stufe I wie die frühere Linienstufe wirken.
// Dazu die Grundvarianten aus Teil 5 (REQ-K5.09), die bleiben.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal'){
  const core = loadCore();
  const G = core.KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: core.KF_CONFIG, L: core.KF_VARIANTEN, core };
}
const setTier = (G, id, n) => { G.S.draft.stacks[id] = n; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), type); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const setVariant = (G, i, vid) => { G.S.slots[i].variant = vid; G.S.slotVer++; };

test('K6.02: im Modus karten gibt es kein Zeichen, keine Linienstufe und keine Linienanzeige', () => {
  const { G, C, core } = game();
  for (const name of ['lineState', 'lines', 'cardSigns']) assert.equal(G[name], undefined, `G.${name} entfällt`);
  assert.equal(C.LINIEN, undefined, 'config.js kennt keine Linien mehr');
  assert.equal(core.KF_LINIEN, undefined);
  for (const o of G.ALL_OPTIONS) assert.equal(o.zeichen, undefined, o.id);
  assert.equal(core.KF_VARIANTEN.zeichen, undefined); assert.equal(core.KF_VARIANTEN.linien, undefined);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(!/hudLines|hud-lines|lineRow|kc-sign/.test(html), 'keine Linienanzeige in der Leiste');
  for (const lang of ['de', 'en']){
    const I = loadI18n()[lang];
    assert.deepEqual(Object.keys(I).filter(k => /^(line\.|hud\.lines|hint\.linie_|tip\.hud\.lines|tip\.line\.)/.test(k)), [], `${lang}: keine Linientexte`);
  }
  const hints = readFileSync(new URL('../hints.js', import.meta.url), 'utf8');
  assert.ok(!/linie_/.test(hints), 'kein Linienhinweis');
  // Doktrinen und Varianten tragen kein Zeichen: nach Wahl der Doktrin zählt nichts als Linie
  G.S.draft.stacks.bollwerk = 1; G.S.draft.ver++;
  assert.equal(G.mAdd('towerKillMaterial'), 0, 'keine Linienstufe wirkt');
});

test('K6.02: Doktrinen und Varianten tragen eine Kategorie statt eines Zeichens', () => {
  const { G, L, core } = game();
  const KATS = ['militaer', 'wirtschaft', 'verteidigung'], ok = k => [].concat(k).length >= 1 && [].concat(k).length <= 2 && [].concat(k).every(x => KATS.includes(x));       // Teil 6: Mischdoktrinen tragen eine Liste mit zwei Kategorien
  for (const d of core.KF_DOKTRINEN) assert.ok(ok(d.kat), d.id);
  for (const v of L.varianten){ assert.ok(ok(v.kat), v.id); assert.equal(v.linie, undefined); }
  assert.ok(G.VARIANTS.length === L.varianten.length);
});

const CARD_IDS = ['querverbindung', 'lagerzehnt', 'soeldnertruppe', 'rekrutenzug', 'durchbruch', 'pluenderung'];
test('K6.02: sechs Karten aus den Linienregeln; nur im Modus karten; Kategorien nach der Zuordnung', () => {
  const { G } = game();
  const kat = { querverbindung: ['wirtschaft'], lagerzehnt: ['wirtschaft'], soeldnertruppe: ['wirtschaft', 'militaer'], rekrutenzug: ['militaer'], durchbruch: ['militaer'], pluenderung: ['verteidigung'] };
  for (const id of CARD_IDS){ const o = G.OPT[id]; assert.ok(o, id); assert.deepEqual([].concat(o.kat), kat[id], `${id}: Kategorie`); assert.equal(o.nurKarten, true); }
  assert.equal(G.OPT.soeldnertruppe.rarity, 'rare'); assert.equal(G.OPT.durchbruch.rarity, 'rare');
  const { G: S } = game('standard'); S.S.level = 6; place(S, 'kaserne', 0); place(S, 'fabrik', 1); S.S.lvl.turm_0 = 1; S.S.pfad.choices = 8;
  for (const id of CARD_IDS) assert.equal(S.optionAvailable(S.OPT[id]), false, `${id} im Standardmodus nicht im Pool`);
  assert.ok(!S.drawOptions(2).some(id => CARD_IDS.includes(id)));
});

test('K6.02 Rekrutenzug: Stufe I schickt je Welle einen Läufer mehr (wie Linie Militär Stufe 1), Stufe II dazu eine Schmiede-Stufe mehr (wie Stufe 2)', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); place(G, 'schmiede', 1); idle(G); G.S.lvl.qualitaet = 0;
  const wave = () => { const n0 = G.S.units.filter(u => u.side === 'p').length; for (let i = 0; i < 3; i++) G.spawn('laeufer'); G.S.nextOwnWave = G.S.t; G.tick(0.05); return G.S.units.filter(u => u.side === 'p').length - n0; };
  assert.equal(wave(), 3);
  setTier(G, 'rekrutenzug', 1); idle(G); assert.equal(wave(), 4); assert.equal(G.qualityMult(), 1, 'Stufe I: keine Schmiede-Stufe');
  setTier(G, 'rekrutenzug', 2); idle(G); assert.equal(wave(), 4, 'der Läufer wird nicht verdoppelt');
  assert.ok(Math.abs(G.qualityMult() - (1 + C.FX_QUALITAET)) < 1e-9, `Schmiede-Stufe +1: ${G.qualityMult()}`);
  setTier(G, 'rekrutenzug', 0); idle(G); assert.equal(wave(), 3, 'ohne die Karte entfällt der Läufer'); assert.equal(G.qualityMult(), 1);
});

test('K6.02 Durchbruch: doppelter Schaden an der gegnerischen Basis', () => {
  const { G, C } = game();
  const hit = () => { const f = G.addFormation('p', 1, ['laeufer'], C.LANE - C.ENEMY_BASE_WIDTH - 2), u = G.S.units.find(x => x.form === f.id); u.cd = 0; const hp0 = G.S.enemyBaseHp; idle(G); G.tick(0.05); G.S.units = []; G.S.forms = []; return { d: hp0 - G.S.enemyBaseHp, dmg: u.dmg }; };
  let r = hit(); assert.ok(Math.abs(r.d - r.dmg) < 1e-6);
  setTier(G, 'durchbruch', 1); r = hit(); assert.ok(Math.abs(r.d - r.dmg * 2) < 1e-6, `Basisschaden ${r.d} gegen ${r.dmg * 2}`);
});

test('K6.02 Querverbindung: Nachbarschaftsboni wirken auch diagonal', () => {
  const { G } = game(); place(G, 'fabrik', 0); place(G, 'fabrik', 4);                   // Plätze 0 und 4 liegen diagonal
  assert.equal(G.neighborValue(0, 'fabrik'), 0);
  const r0 = G.matRate();
  setTier(G, 'querverbindung', 1);
  assert.ok(G.neighborValue(0, 'fabrik') > 0, 'diagonaler Nachbar zählt'); assert.ok(G.matRate() > r0 * 1.05, 'Ertrag steigt');
  const pv = G.neighborPreview(8, 'fabrik'); assert.ok(pv.gets.n >= 1, 'die Vorschau kennt den diagonalen Nachbarn (Platz 4)');
  setTier(G, 'querverbindung', 0); assert.equal(G.neighborValue(0, 'fabrik'), 0);
});

test('K6.02 Lagerzehnt: Material über dem Lagerdeckel wird zu EP', () => {
  const { G, C } = game(); for (let i = 0; i < 3; i++) place(G, 'fabrik', i); G.S.t = 200;
  const deckel = G.lagerDeckel(); assert.ok(deckel > 0);
  G.S.material = deckel + 1000; idle(G); assert.equal((G.S.stats.xpSrc || {}).lager || 0, 0);
  G.tick(0.05); assert.ok(G.S.material > deckel + 900, 'ohne die Karte bleibt das Material liegen');
  setTier(G, 'lagerzehnt', 1);
  G.S.material = deckel + 1000; idle(G); const s0 = (G.S.stats.xpSrc || {}).lager || 0;
  G.tick(0.05);
  assert.ok(G.S.material <= deckel + 1e-6 + G.matRate() * 0.05, `Material auf den Deckel begrenzt: ${G.S.material} gegen ${deckel}`);
  const ep = ((G.S.stats.xpSrc || {}).lager || 0) - s0; assert.ok(Math.abs(ep - 1000 * C.LAGER.kurs) < 5 + G.matRate(), `EP ${ep}`);
  G.S.material = deckel - 100; idle(G); const s1 = (G.S.stats.xpSrc || {}).lager || 0; G.tick(0.05);
  assert.equal(((G.S.stats.xpSrc || {}).lager || 0), s1, 'unter dem Deckel nichts');
});

test('K6.02 Söldnertruppe: Einheiten über dem Versorgungslimit gegen Aufschlag, ohne Versorgung', () => {
  const { G, C } = game(); place(G, 'kaserne', 0); idle(G);
  const cap = G.supplyCap(); for (let i = 0; i < cap; i++) assert.ok(G.spawn('laeufer'));
  assert.equal(G.supplyFull(), true); assert.equal(G.spawn('laeufer'), false, 'ohne die Karte: Versorgung voll');
  setTier(G, 'soeldnertruppe', 1);
  assert.equal(G.supplyFull(), false, 'mit Söldnern ist die Warteschlange nie voll');
  const price = G.unitPrice('laeufer'), base = G.unitCost('laeufer');
  assert.equal(price, Math.ceil(base * C.SOELDNER.kostenFaktor), 'Aufschlag über dem Limit');
  const m0 = G.S.material; assert.ok(G.spawn('laeufer')); assert.equal(m0 - G.S.material, price);
  assert.equal(G.S.queue[G.S.queue.length - 1].merc, true); assert.equal(G.S.queue.length, cap + 1);
  G.S.nextOwnWave = G.S.t; G.tick(0.05); assert.equal(G.S.units.filter(u => u.side === 'p').length, cap + 1); assert.equal(G.S.queue.length, 0);
  assert.equal(G.unitPrice('laeufer'), base, 'unter dem Limit der normale Preis');
});

test('K6.02 Plünderung: Abschüsse durch Türme bringen Material', () => {
  const { G, C } = game(); G.S.lvl.turm_0 = 3; idle(G);
  const kill = () => { const f = G.addFormation('e', 0, ['laeufer'], 60), u = G.S.units.find(x => x.form === f.id); u.hp = 1; u.cd = 1e9; G.S.turretCd = {}; const m0 = (G.S.stats.towerMaterial || 0); idle(G); G.tick(0.05); idle(G); G.tick(0.05); return (G.S.stats.towerMaterial || 0) - m0; };
  assert.equal(kill(), 0);
  setTier(G, 'pluenderung', 1); assert.ok(kill() >= C.UNITS.laeufer.bounty, 'Material je Abschuss');
  setTier(G, 'pluenderung', 0); assert.equal(kill(), 0);
});

test('K6.02: Texte der übernommenen Karten in de und en (Name, Beschreibung, Wirkungszeile von höchstens 44 Zeichen)', () => {
  const { G } = game(), I = loadI18n(), fill = s => s.replace(/\{[a-z0-9]+\}/gi, '12');
  for (const lang of ['de', 'en']) for (const id of CARD_IDS){
    const o = G.OPT[id], T = I[lang];
    assert.ok(T[o.nameKey] && T[o.descKey], `${lang} ${id}`);
    assert.ok(T['kp.eff.' + id] && fill(T['kp.eff.' + id]).length <= 44, `${lang} kp.eff.${id}`);
    for (const ph of T['kp.eff.' + id].match(/\{[a-z0-9]+\}/gi) || []) assert.ok(T[o.descKey].includes(ph), `${lang} ${id}: ${ph} in der Beschreibung`);
  }
  assert.ok(I.de['draft.rekrutenzug.desc.t2.karten'] && I.en['draft.rekrutenzug.desc.t2.karten']);
});

/* ---------- K5.09 Grundvarianten (bleiben) ---------- */
test('K5.09: Grundvarianten angeglichen; jedes Grundgebäude hat eine Variante je Kategorie (Fabrik, Kaserne, Schmiede)', () => {
  const { L } = game();
  const v = id => L.varianten.find(x => x.id === id);
  assert.equal(v('manufaktur').effect[0].add, 0.2); assert.equal(v('werkstatt').effect[0].mul, 0.75);
  assert.equal(v('wachstube').effect.find(e => e.stat === 'turretDmg').mul, 1.3); assert.ok(v('wachstube').effect.some(e => e.stat === 'towerKillMaterial'));
  const z = v('zahlmeisterei'); assert.equal(z.basis, 'kaserne'); assert.equal(z.kat, 'wirtschaft'); assert.equal(z.effect[0].stat, 'quartiereCost'); assert.equal(z.effect[0].mul, 0.7);
  for (const basis of ['fabrik', 'kaserne', 'schmiede']){
    const base = L.varianten.filter(x => x.basis === basis && !x.doktrin);
    assert.equal(JSON.stringify(base.map(x => x.kat).sort()), JSON.stringify(['militaer', 'verteidigung', 'wirtschaft']), `${basis}: je Kategorie eine Grundvariante`);
  }
  assert.ok(L.varianten.filter(x => x.doktrin).length === 4);
});

test('K5.09 Zahlmeisterei: der Kaserne-Ausbau „Quartiere“ kostet 30 % weniger', () => {
  const { G } = game(); place(G, 'kaserne', 0); G.S.t = 200;
  const c0 = G.upCost('ausbau'); assert.ok(c0 > 0);
  setVariant(G, 0, 'zahlmeisterei');
  assert.equal(G.upCost('ausbau'), Math.ceil(c0 * 0.7));
});

test('K5.09: Werkstatt −25 % Einheitenkosten, Manufaktur +20 % Ertrag, Wachstube +30 % Turmschaden', () => {
  const { G } = game(); place(G, 'fabrik', 0); place(G, 'fabrik', 2); place(G, 'fabrik', 6); G.S.t = 200;                 // nicht benachbart: kein Nachbarschaftsbonus im Weg
  const c0 = G.unitCost('laeufer'), r0 = G.matRate(), t0 = G.mMul('turretDmg');
  setVariant(G, 0, 'werkstatt'); assert.ok(Math.abs(G.unitCost('laeufer') / c0 - 0.75) < 0.05, `Einheitenkosten ${G.unitCost('laeufer')} gegen ${c0}`);
  setVariant(G, 0, null); setVariant(G, 0, 'manufaktur'); assert.ok(Math.abs(G.matRate() / r0 - (1 + 0.2 / 3)) < 1e-9, 'Ertrag der einen Manufaktur +20 %');
  setVariant(G, 0, 'wachstube'); assert.ok(Math.abs(G.mMul('turretDmg') / t0 - 1.3) < 1e-9);
});

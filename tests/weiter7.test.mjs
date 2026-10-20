// Tests Kartenpfad Teil 7, REQ-K7.06 und K7.07: Handelshaus mit Söldnerkompanien, Gießerei mit Geschützen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7){
  const core = loadCore();
  const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: core.KF_CONFIG, core };
}
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type} auf ${i}: ${G.buildBlock(i, type)}`); };
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const run = (G, secs) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };
/* Weiterentwicklung über den Weg des Spiels: Karte, Forschung, Abschluss */
function weiter(G, card, res){
  pick(G, card); G.unlockKey('forschung:' + res); G.S.material = 1e7;
  assert.ok(G.startResearch(res), `${res}: ${G.researchBlock(res)}`);
  run(G, G.RES[res].tiers[0].timeS * 1.6 + 1);
  assert.equal(G.researchTier(res), 1, `${res} abgeschlossen`);
}

test('K7.06: Fernhandel braucht Forschungsort und Kontor; ohne Kontor keine Forschung', () => {
  const { G } = game(); G.S.pfad.choices = 3;
  assert.equal(G.optionAvailable(G.OPT.fernhandel), false, 'ohne Universität und Kontor');
  place(G, 'universitaet', 0); assert.equal(G.optionAvailable(G.OPT.fernhandel), false, 'ohne Kontor');
  place(G, 'kontor', 1); assert.equal(G.optionAvailable(G.OPT.fernhandel), true);
  assert.equal(G.katsOf(G.OPT.fernhandel).join(), 'wirtschaft');
  pick(G, 'fernhandel'); G.unlockKey('forschung:r_fernhandel');
  G.demolish(1); assert.equal(G.researchBlock('r_fernhandel'), 'needsBuilding');
  place(G, 'kontor', 1); assert.equal(G.researchBlock('r_fernhandel'), null);
});

test('K7.06: Söldnerkompanie rückt sofort aus, belegt keine Versorgung; Kosten, Anstieg und Abklingzeit greifen; Zinsen bleiben', () => {
  const { G, C } = game(); place(G, 'universitaet', 0); place(G, 'kontor', 1); G.S.pfad.choices = 3;
  assert.equal(G.handelshaus(), false); assert.equal(G.kompanieBlock(), 'notAvailable');
  weiter(G, 'fernhandel', 'r_fernhandel');
  assert.ok(G.handelshaus()); assert.ok(G.weiterDone('kontor'));
  const H = C.HANDELSHAUS;
  assert.equal(G.kompanieKosten(), H.kosten);
  G.S.material = H.kosten; const u0 = G.S.units.filter(u => u.side === 'p').length, q0 = G.queueSupply();
  assert.ok(G.hireKompanie());
  assert.equal(G.S.material, 0);
  const comp = G.S.units.filter(u => u.side === 'p' && u.kompanie);
  assert.equal(G.S.units.filter(u => u.side === 'p').length - u0, H.kompanie.laeufer + H.kompanie.werfer, 'die Kompanie steht sofort auf dem Feld');
  assert.equal(comp.filter(u => u.type === 'laeufer').length, H.kompanie.laeufer); assert.equal(comp.filter(u => u.type === 'werfer').length, H.kompanie.werfer);
  assert.equal(G.queueSupply(), q0, 'keine Versorgung belegt'); assert.equal(G.supplyFull(), false);
  const st = G.unitStats('p', 'laeufer'); assert.ok(Math.abs(comp.find(u => u.type === 'laeufer').maxHp - st.hp) < 1e-9, 'Werte der aktuellen Schmiede-Stufe');
  // Abklingzeit und Preisanstieg
  G.S.material = 1e7; assert.equal(G.kompanieBlock(), 'cooldown'); assert.equal(G.hireKompanie(), false);
  assert.equal(G.kompanieKosten(), Math.ceil(H.kosten * H.wachstum));
  run(G, H.cdS - 1); assert.equal(G.kompanieBlock(), 'cooldown'); run(G, 1.5); assert.equal(G.kompanieBlock(), null);
  G.S.material = G.kompanieKosten() - 1; assert.equal(G.kompanieBlock(), 'material');
  assert.equal(G.S.stats.kompanien.length, 1);
  // Zinsen des Kontors bleiben
  assert.equal(G.zinsQuelle(), 'kontor'); assert.ok(G.kontorCap() > 0);
  // Standardmodus: nichts davon
  const { G: S } = game('standard'); assert.equal(S.handelshaus(), false); assert.equal(S.optionAvailable(S.OPT.fernhandel), false);
});

test('K7.07: Geschütz erst nach Abschluss von Geschützguss baubar (mit Kaserne); Schmiede wird Gießerei, Grundvarianten entfallen', () => {
  const { G, C } = game(); place(G, 'universitaet', 0); place(G, 'schmiede', 1); place(G, 'kaserne', 2); G.S.pfad.choices = 3; G.S.t = 400;
  assert.equal(G.unitUnlocked('geschuetz'), false); assert.equal(G.spawn('geschuetz'), false);
  assert.equal(G.optionAvailable(G.OPT.geschuetzguss), true); assert.equal(G.katsOf(G.OPT.geschuetzguss).length, 0, 'neutral');
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(1, 'waffenschmiede')); run(G, C.AUFWERTUNG.dauerS + 1); assert.equal(G.S.slots[1].variant, 'waffenschmiede');
  G.S.lvl.qualitaet = 3;
  weiter(G, 'geschuetzguss', 'r_geschuetzguss');
  assert.ok(G.weiterDone('schmiede')); assert.equal(G.S.slots[1].variant, undefined, 'Grundvariante ersetzt'); assert.equal(G.S.lvl.qualitaet, 3, 'Qualitätsstufen bleiben');
  assert.ok(G.unitUnlocked('geschuetz'));
  G.demolish(2); assert.equal(G.unitUnlocked('geschuetz'), false, 'ohne Kaserne keine Geschütze');
  const { G: S } = game('standard'); assert.equal(S.unitUnlocked('geschuetz'), false);
});

test('K7.07: Geschütz belegt zwei Plätze der Versorgung; dreifacher Schaden an der gegnerischen Basis; langsam, große Reichweite', () => {
  const { G, C } = game(); place(G, 'universitaet', 0); place(G, 'schmiede', 1); place(G, 'kaserne', 2); G.S.pfad.choices = 3;
  weiter(G, 'geschuetzguss', 'r_geschuetzguss');
  const cap = G.supplyCap(); assert.ok(cap >= 5, `Versorgung ${cap}`);
  G.S.queue = []; G.S.material = 1e7;
  assert.ok(G.spawn('geschuetz')); assert.equal(G.queueSupply(), 2);
  while (G.queueSupply() + 2 <= cap) assert.ok(G.spawn('geschuetz'));
  assert.equal(G.spawn('geschuetz'), cap - G.queueSupply() >= 2, 'ein weiteres Geschütz passt nicht');
  if (cap - G.queueSupply() >= 1) assert.ok(G.spawn('laeufer'), 'ein Läufer passt noch');
  const g = C.UNITS.geschuetz, l = C.UNITS.laeufer;
  assert.ok(g.speed < l.speed && g.range > C.UNITS.katapult.range && g.hp < l.hp, 'langsam, große Reichweite, wenig Lebenspunkte');
  assert.equal(g.versorgung, 2); assert.equal(g.baseMult, 3);
  // Schaden an der Basis: ein Geschütz in Reichweite der gegnerischen Basis, allein
  const W = C.LANE - C.ENEMY_BASE_WIDTH;
  G.S.units = []; G.S.forms = [];
  const f = G.addFormation('p', 1, ['geschuetz'], W - 100); const u = G.S.units.find(x => x.form === f.id); u.cd = 0;
  const hp0 = G.S.enemyBaseHp; idle(G); G.tick(0.05);
  assert.ok(Math.abs((hp0 - G.S.enemyBaseHp) - u.dmg * 3 * G.mMul('dmgVsBase')) < 1e-6, `Schaden ${hp0 - G.S.enemyBaseHp} gegen ${u.dmg * 3}`);
  assert.ok(G.S.stats.gekauft.geschuetz >= 2);
});

test('K7.06, K7.07: Texte in beiden Sprachen; Wirkungszeilen höchstens 44 Zeichen; Name nach der Weiterentwicklung', () => {
  const I = loadI18n();
  const keys = ['kompanie.name', 'ex.kompanie', 'ex.kompanie.cd', 'tip.kompanie', 'unit.geschuetz.name', 'unit.geschuetz.short', 'bld.kontor.name.weiter', 'bld.schmiede.name.weiter',
    ...['fernhandel', 'geschuetzguss'].flatMap(id => [`kp.card.${id}.name`, `kp.card.${id}.desc`, `kp.eff.${id}`, `kp.res.${id}.name`, `kp.res.${id}.desc`])];
  for (const lang of ['de', 'en']) for (const k of keys) assert.ok(I[lang][k], `${lang}: ${k}`);
  for (const lang of ['de', 'en']) for (const id of ['fernhandel', 'geschuetzguss']) assert.ok(I[lang][`kp.eff.${id}`].length <= 44, `${lang} kp.eff.${id}: ${I[lang][`kp.eff.${id}`].length}`);
  assert.equal(I.de['bld.kontor.name.weiter'], 'Handelshaus'); assert.equal(I.de['bld.schmiede.name.weiter'], 'Gießerei');
  assert.equal(I.en['bld.kontor.name.weiter'], 'Trading House'); assert.equal(I.en['bld.schmiede.name.weiter'], 'Foundry');
});

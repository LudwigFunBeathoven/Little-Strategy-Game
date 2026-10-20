// Tests Kartenpfad Teil 7, REQ-K7.02 und K7.04: Haupthaus im Mittelfeld, Obergrenze für Fabriken.
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
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };

test('K7.02: Das Mittelfeld ist ab Start mit dem Haupthaus (Stufe I) belegt; acht Plätze bleiben frei; Modus standard ohne Haupthaus', () => {
  const { G, C } = game();
  assert.equal(C.HAUPTHAUS.platz, 4);
  assert.equal(G.S.slots[4].type, 'haupthaus'); assert.ok(G.S.slots[4].fixed);
  assert.equal(G.hausStufe(), 1);
  assert.equal(G.S.slots.filter(x => !x).length, 8);
  for (const type of C.BUILDINGS) assert.equal(G.buildBlock(4, type), 'occupied', type);
  const s = game('standard').G;
  assert.equal(s.S.haus, null); assert.ok(s.S.slots.every(x => !x)); assert.equal(s.hausStufe(), 0); assert.equal(s.fabrikGrenze(), Infinity);
});

test('K7.02: Das Haupthaus lässt sich nicht abreißen und nicht aufwerten', () => {
  const { G } = game(); G.S.t = 400;
  assert.equal(G.demolish(4), false);
  assert.equal(G.S.slots[4].type, 'haupthaus');
  assert.equal(G.variantsFor(4).length, 0);
  for (const v of G.VARIANTS) assert.notEqual(G.variantBlock(4, v.id), null, v.id);
  assert.equal(G.refundFor(4), 0);
});

test('K7.02: Das Haupthaus gibt und erhält keine Nachbarschaftsboni, auch nicht diagonal (Querverbindung)', () => {
  const { G, core } = game();
  for (const r of core.KF_NEIGHBORS){ assert.notEqual(r.building, 'haupthaus'); assert.notEqual(r.with, 'haupthaus'); }
  for (const type of ['fabrik', 'kaserne', 'schmiede', 'universitaet', 'kontor']){
    const p = G.neighborPreview(1, type);
    assert.ok(!p.gives.some(g => g.slot === 4), `${type}: gibt dem Haupthaus nichts`);
    assert.equal(p.gets ? p.gets.n : 0, 0, `${type} neben dem Haupthaus erhält nichts`);
  }
  place(G, 'fabrik', 1); place(G, 'fabrik', 3);
  assert.equal(G.neighborCount(1, 'fabrik'), 0); assert.equal(G.neighborCount(3, 'fabrik'), 0);
  pick(G, 'querverbindung');                                                       // diagonal: 1 und 3 sind Nachbarn über die Ecke, das Haupthaus zählt weiter nicht
  assert.equal(G.neighborCount(1, 'fabrik'), 1);
  assert.equal(G.neighborValue(4, 'haupthaus'), 0);
});

test('K7.04: Obergrenze 3/4/5 Fabrikplätze je Stufe; jede Form aus einer Fabrik zählt (Variante, Sonderbau, laufende Aufwertung)', () => {
  const { G, C } = game(); G.S.t = 400;
  assert.equal(JSON.stringify(C.HAUPTHAUS.fabrikGrenze), '[3,4,5]');
  for (const i of [0, 1, 2]) place(G, 'fabrik', i);
  assert.equal(G.fabrikPlaetze(), 3); assert.equal(G.fabrikGrenze(), 3);
  assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze'); assert.equal(G.buildAt(3, 'fabrik'), false);
  for (const type of ['kaserne', 'schmiede', 'universitaet', 'kontor']) assert.equal(G.buildBlock(3, type), null, `${type} bleibt baubar`);
  // Variante und laufende Aufwertung belegen weiter einen Fabrikplatz
  G.S.material = 1e7; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'während der Aufwertung');
  finish(G); assert.equal(G.S.slots[0].variant, 'manufaktur'); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'Variante');
  // Sonderbau (Bastion der Doktrin Bollwerk)
  pick(G, 'bollwerk'); G.S.material = 1e7; assert.ok(G.upgradeBuilding(1, 'bastion')); finish(G);
  assert.equal(G.S.slots[1].variant, 'bastion'); assert.equal(G.fabrikPlaetze(), 3); assert.equal(G.buildBlock(3, 'fabrik'), 'fabrikGrenze', 'Sonderbau');
  // Stufe II und III heben die Grenze; Abriss gibt einen Platz frei
  G.S.haus.stufe = 2; assert.equal(G.fabrikGrenze(), 4); place(G, 'fabrik', 3); assert.equal(G.buildBlock(5, 'fabrik'), 'fabrikGrenze');
  G.S.haus.stufe = 3; assert.equal(G.fabrikGrenze(), 5); place(G, 'fabrik', 5); assert.equal(G.buildBlock(6, 'fabrik'), 'fabrikGrenze');
  G.demolish(5); assert.equal(G.buildBlock(5, 'fabrik'), null);
});

test('K7.04: Die Automatik (Karte „Fließband“) und Bots können die Grenze nicht umgehen; Spielstand behält das Haupthaus', () => {
  const { G, core } = game();
  for (const i of [0, 1, 2]) place(G, 'fabrik', i);
  assert.equal(G.build('fabrik'), false, 'build() nutzt dieselbe Prüfung');
  const snap = JSON.parse(JSON.stringify(G.snapshot()));
  const H = core.KlammerCore.create(); H.FX.on = false; H.adopt(snap);
  assert.equal(H.S.slots[4].type, 'haupthaus'); assert.equal(H.hausStufe(), 1); assert.equal(H.buildBlock(3, 'fabrik'), 'fabrikGrenze');
  assert.equal(core.KlammerCore.SAVE_VERSION, 12); assert.match(core.KF_CONFIG.SAVE_KEY, /v12$/);
});

test('K7.02, K7.04: Texte in beiden Sprachen (Reiter, Stufen, Grenze, Erklärzeile)', () => {
  const I = loadI18n();
  const keys = ['tab.haus', 'ex.tab.haus', 'tip.tab.haus', 'bld.haupthaus.name', 'bld.haupthaus.desc', 'haus.grenze', 'fab.stat.grenze', 'fx.haupthaus',
    ...[1, 2, 3].flatMap(n => [`haus.stufe.${n}.name`, `haus.stufe.${n}.desc`, `build.reason.fabrikGrenze.${n}`])];
  for (const lang of ['de', 'en']) for (const k of keys) assert.ok(I[lang][k], `${lang}: ${k}`);
  assert.equal(I.de['haus.stufe.1.name'], 'Gutshof'); assert.equal(I.de['haus.stufe.2.name'], 'Rathaus'); assert.equal(I.de['haus.stufe.3.name'], 'Residenz');
  assert.equal(I.en['haus.stufe.1.name'], 'Manor'); assert.equal(I.en['haus.stufe.2.name'], 'Town Hall'); assert.equal(I.en['haus.stufe.3.name'], 'Residence');
  assert.equal(I.de['build.reason.fabrikGrenze.1'].replace('{n}', '3'), 'Höchstens 3 Fabriken, mehr mit Stadtrecht.');
});

/* ---------- K7.03: Stufen über Karten, Ausbau, Flügel ---------- */
const offer = G => { G.S.pendingDraft = null; G.S.pendingLevels = 1; G.offerDraft(); const d = G.S.pendingDraft; G.S.pendingDraft = null; G.S.pendingLevels = 0; return d ? d.options : []; };
const stufe = (G, n) => { const C = loadCore().KF_CONFIG; for (let k = 2; k <= n; k++){ pick(G, k === 2 ? 'stadtrecht' : 'hofhaltung'); G.S.material = 1e7; assert.ok(G.hausAusbau(), `Ausbau ${k}: ${G.hausBlock()}`); finish(G, C.HAUPTHAUS.dauerS + 1); } };

test('K7.03: Stadtrecht ab Wahl 2 im Angebot (Pfadplatz, nicht bannbar), spätestens in Wahl 5 garantiert; ohne Universität', () => {
  const { G } = game();
  assert.equal(G.optionAvailable(G.OPT.stadtrecht), false, 'Wahl 1: noch nicht');
  G.S.pfad.choices = 1; assert.equal(G.optionAvailable(G.OPT.stadtrecht), true, 'Wahl 2: ziehbar, ohne Universität');
  assert.ok(G.isPathFamily(G.OPT.stadtrecht)); assert.equal(G.canBan('stadtrecht'), false);
  assert.equal(G.OPT.stadtrecht.family, 'weiterentwicklung'); assert.equal(G.katsOf(G.OPT.stadtrecht).length, 0, 'neutral');
  // Garantie: in Wahl 5 liegt Stadtrecht in jedem Angebot, solange es nicht gewählt ist
  for (let seed = 1; seed <= 40; seed++){ const g = game('karten', seed).G; g.S.pfad.choices = 4; assert.ok(offer(g).includes('stadtrecht'), `Wahl 5, Seed ${seed}`); }
  // Wahl 2 ohne Universität: Stadtrecht ist die einzige ziehbare Pfadkarte und belegt einen Pfadplatz; mit Universität zieht es nach Gewicht gegen die Technologiekarten
  for (let seed = 1; seed <= 20; seed++){ const g = game('karten', seed).G; g.S.pfad.choices = 1; assert.ok(offer(g).includes('stadtrecht'), `Wahl 2 ohne Universität, Seed ${seed}`); }
  let early = 0; for (let seed = 1; seed <= 40; seed++){ const g = game('karten', seed).G; g.S.pfad.choices = 1; place(g, 'universitaet', 0); if (offer(g).includes('stadtrecht')) early++; }
  assert.ok(early >= 20, `Wahl 2 mit Universität: meist im Angebot (${early}/40)`);
  assert.equal(game('standard').G.optionAvailable(game('standard').G.OPT.stadtrecht), false, 'nicht im Modus standard');
});

test('K7.03: Stufe II und III nur nach Wahl der Karte und Bezahlung; Ausbau dauert; Grenze und Flügel wie in der Tabelle', () => {
  const { G, C } = game(); G.S.material = 0;
  assert.equal(G.hausBlock(), 'noCard'); assert.equal(G.hausAusbau(), false);
  pick(G, 'stadtrecht');
  assert.equal(G.hausBlock(), 'material');
  G.S.material = C.HAUPTHAUS.kosten[1];
  assert.ok(G.hausAusbau()); assert.equal(G.S.material, 0); assert.equal(G.hausBlock(), 'building');
  finish(G, C.HAUPTHAUS.dauerS - 1); assert.equal(G.hausStufe(), 1, 'nach 14 s noch Gutshof'); assert.equal(G.fabrikGrenze(), 3);
  finish(G, 2); assert.equal(G.hausStufe(), 2); assert.equal(G.fabrikGrenze(), 4); assert.equal(G.fluegelFrei(), 1);
  assert.equal(G.S.stats.haus[0].stufe, 2);
  // Hofhaltung: frühestens zwei Wahlen nach dem Abschluss von Stadtrecht
  const w = G.S.pfad.choices;
  assert.equal(G.optionAvailable(G.OPT.hofhaltung), false, 'direkt danach nicht');
  G.S.pfad.choices = w + 1; assert.equal(G.optionAvailable(G.OPT.hofhaltung), true, 'zwei Wahlen später');
  assert.equal(G.hausBlock(), 'noCard');
  pick(G, 'hofhaltung'); G.S.material = C.HAUPTHAUS.kosten[2] - 1; assert.equal(G.hausBlock(), 'material');
  G.S.material = 1e7; assert.ok(G.hausAusbau()); finish(G, C.HAUPTHAUS.dauerS + 1);
  assert.equal(G.hausStufe(), 3); assert.equal(G.fabrikGrenze(), 5); assert.equal(G.fluegelFrei(), 2, 'zwei Flügel offen, keiner gewählt');
  assert.equal(G.hausBlock(), 'maxed'); assert.equal(G.hausKarteOffen(4), false);
  // Flügel: endgültig, jeder einmal, höchstens zwei
  assert.ok(G.chooseFluegel('kanzlei')); assert.equal(G.chooseFluegel('kanzlei'), false); assert.equal(G.fluegelBlock('kanzlei'), 'taken');
  assert.ok(G.chooseFluegel('zeughaus')); assert.equal(G.fluegelBlock('bibliothek'), 'noSlot'); assert.equal(G.S.haus.fluegel.length, 2);
  assert.equal(G.fluegelBlock('turm'), 'unknown');
});

test('K7.03 Flügel Bibliothek: Technologiekarten und Forschung ohne Universität, ×1,5 Dauer, Budget bis 25 %; Buchdruck braucht eine Universität', () => {
  const { G, C } = game(); G.S.pfad.choices = 3;
  assert.equal(G.optionAvailable(G.OPT.fortgeschritteneTaktiken), false, 'ohne Universität keine Technologie');
  stufe(G, 2); assert.ok(G.chooseFluegel('bibliothek'));
  assert.equal(G.optionAvailable(G.OPT.fortgeschritteneTaktiken), true, 'mit Bibliothek ziehbar');
  assert.equal(G.optionAvailable(G.OPT.buchdruck), false, 'Buchdruck braucht eine Universität');
  pick(G, 'fortgeschritteneTaktiken'); G.unlockKey('forschung:r_reiter');
  assert.equal(G.researchSlots(), 1); assert.equal(G.researchBlock('r_reiter'), null);
  G.S.material = 1e7; assert.ok(G.startResearch('r_reiter'));
  const a = G.S.research.active[0]; assert.equal(a.bib, true);
  idle(G); G.tick(0.05); assert.ok(Math.abs(a.t - 0.05 / C.HAUPTHAUS.fluegel.bibliothek.zeitFaktor) < 1e-9, `Fortschritt ${a.t}`);
  finish(G, Math.ceil(a.timeS * 1.5) + 1); assert.equal(G.researchTier('r_reiter'), 1, 'abgeschlossen'); assert.ok(G.unitUnlocked('reiter'));
  // Budget: höchstens 25 % ohne Universität
  assert.equal(G.budgetMax(), C.HAUPTHAUS.fluegel.bibliothek.budgetMax); assert.equal(G.setBudget(2), false); assert.ok(G.setBudget(1)); assert.equal(G.budgetShare(), 0.25);
  // Buchdruck in der Bibliothek gesperrt
  pick(G, 'buchdruck'); G.unlockKey('forschung:r_buchdruck'); assert.equal(G.researchBlock('r_buchdruck'), 'noUni');
  // mit Universität: zwei Plätze, der erste in der Universität ohne Aufschlag
  place(G, 'universitaet', 0); assert.equal(G.researchSlots(), 2); assert.equal(G.budgetMax(), 2);
  G.unlockKey('forschung:r_schild'); G.S.research.done.r_reiter = 1;
  assert.ok(G.startResearch('r_buchdruck')); assert.equal(G.S.research.active.find(x => x.id === 'r_buchdruck').bib, undefined, 'Buchdruck in der Universität');
});

test('K7.03 Flügel Zeughaus: Qualitätsstufen 1 und 2 ohne Schmiede; mit Schmiede alle Stufen', () => {
  const { G, C } = game(); stufe(G, 2);
  assert.equal(G.isAvailable('qualitaet'), false, 'ohne Schmiede und Zeughaus');
  assert.ok(G.chooseFluegel('zeughaus'));
  assert.ok(G.isAvailable('qualitaet'));
  G.S.material = 1e7; assert.ok(G.buy('qualitaet')); assert.ok(G.buy('qualitaet'));
  assert.equal(G.zeughausMax('qualitaet'), true); assert.equal(G.canBuy('qualitaet'), false); assert.equal(G.buy('qualitaet'), false);
  assert.equal(G.lv('qualitaet'), C.HAUPTHAUS.fluegel.zeughaus.schmiedeStufen); assert.ok(G.qualityMult() > 1);
  place(G, 'schmiede', 0); assert.equal(G.zeughausMax('qualitaet'), false); assert.ok(G.buy('qualitaet')); assert.equal(G.lv('qualitaet'), 3, 'mit Schmiede weiter');
});

test('K7.03 Flügel Schatzkammer: Zinsen ohne Kontor mit halbem Deckel; ein Kontor zahlt den vollen Deckel, nicht beides', () => {
  const { G, C } = game(); stufe(G, 2);
  idle(G); G.S.material = 1e6; G.S.kontorT = 0; const m0 = G.S.material; G.tick(C.KONTOR.intervalS); assert.equal(G.zinsQuelle(), null);
  assert.ok(G.chooseFluegel('schatzkammer')); assert.equal(G.zinsQuelle(), 'schatzkammer');
  const cap = G.kontorCap();
  place(G, 'kontor', 0); const full = G.kontorCap(); G.demolish(0);
  assert.ok(Math.abs(cap - full * C.HAUPTHAUS.fluegel.schatzkammer.deckelAnteil) <= 1, `Deckel ${cap} gegen ${full}`);
  idle(G); G.S.material = 1e6; G.S.kontorT = 0; G.S.stats.interest = 0; for (let k = 0; k < C.KONTOR.intervalS * 20 + 1; k++){ idle(G); G.tick(0.05); }
  assert.equal(G.S.stats.interest, cap, 'Zinsen bis zum halben Deckel');
  place(G, 'kontor', 0); assert.equal(G.zinsQuelle(), 'kontor'); assert.equal(G.kontorCap(), full);
});

test('K7.03 Flügel Kanzlei: eine Karte mehr je Angebot; Kanzlei und Universität zusammen höchstens 4', () => {
  const { G, C } = game(); stufe(G, 2);
  assert.equal(G.draftSize(), C.KARTEN.angebot.basis);
  assert.ok(G.chooseFluegel('kanzlei')); assert.equal(G.draftSize(), C.KARTEN.angebot.universitaet);
  place(G, 'universitaet', 0); assert.equal(G.draftSize(), 4, 'nicht zusätzlich');
  G.S.pfad.choices = 2; assert.equal(offer(G).length, 4);
});

test('K7.03: Texte der Karten und Flügel in beiden Sprachen; Wirkungszeilen höchstens 44 Zeichen', () => {
  const I = loadI18n();
  const keys = ['kp.fam.weiterentwicklung', 'haus.ausbau', 'ex.haus.ausbau', 'haus.fluegel.title', 'haus.fluegel.choose', 'ex.fluegel', 'log.hausDone', 'log.fluegel',
    ...['stadtrecht', 'hofhaltung'].flatMap(id => [`kp.card.${id}.name`, `kp.card.${id}.desc`, `kp.eff.${id}`]),
    ...['bibliothek', 'zeughaus', 'schatzkammer', 'kanzlei'].flatMap(id => [`haus.fluegel.${id}.name`, `haus.fluegel.${id}.desc`, `haus.fluegel.${id}.eff`])];
  for (const lang of ['de', 'en']) for (const k of keys) assert.ok(I[lang][k], `${lang}: ${k}`);
  for (const lang of ['de', 'en']) for (const id of ['stadtrecht', 'hofhaltung']) assert.ok(I[lang][`kp.eff.${id}`].length <= 44, `${lang} kp.eff.${id}`);
  assert.equal(I.de['kp.card.stadtrecht.name'], 'Stadtrecht'); assert.equal(I.de['kp.card.hofhaltung.name'], 'Hofhaltung');
});

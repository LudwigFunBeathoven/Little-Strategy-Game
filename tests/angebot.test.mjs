// Tests Kartenpfad Teil 3, REQ-P.05: Angebotsbedingungen aus der Wirkung, Kartentitel im Modus karten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

function game(seed = 7, level = 1){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing: 'karten' });
  G.S.material = 1e7; G.S.level = level; G.S.pfad.choices = 8;
  G.build('fabrik');                                                     // wie im Spiel: die erste Fabrik steht in den ersten Sekunden
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
const bonus = G => G.ALL_OPTIONS.filter(o => !o.pfad && !o.doktrin);
const open = (G, ...keys) => keys.forEach(k => G.unlockKey(k));
const offered = (G, id) => G.optionAvailable(G.OPT[id]);
const exhaust = (G, id) => { G.S.draft.stacks[id] = G.OPT[id].tiers.length; G.S.draft.ver++; };

/* Je Bonuskarte: ein Spielstand, in dem ihre Wirkung null wäre (nicht angeboten), und einer, in dem sie wirkt (angeboten).
   Karten ohne Strukturbedingung wirken ab Spielbeginn; ihr „Wirkung null“-Zustand ist die höchste Stufe (nichts mehr zu gewinnen). */
const CAPPED = G => { G.build('kaserne'); G.S.lvl.ausbau = 5; G.S.research.done.r_logistik = 3; G.S.research.ver++; };   // Versorgungslimit am Deckel (15)
const GONE = { entfaellt: true };                                      // im Modus karten gestrichen (Teil 4: serienbau, bauleitung; Teil 5 K5.06: Rest), siehe tests/pool5.test.mjs
const CASES = {
  // Wirtschaft
  bessereFabriken: { off: G => G.S.slots.forEach((s, i) => { if (s && s.type === 'fabrik') G.S.slots[i] = null; }) },
  schwerePressen: GONE, doppelschicht: GONE, grossauftrag: GONE, rationalisierung: GONE, serienbau: GONE, bauleitung: GONE, nachtschicht: GONE, selbstlaeufer: GONE,
  handelskontor:   { off: G => {}, on: G => { open(G, 'bau:kontor'); G.build('kontor'); G.S.stats.zinsDeckel = 1; }, base: G => { G.S.level = 3; } },   // Teil 4: erst, wenn der Zinsdeckel erreicht wurde
  kriegserfahrung: {}, kriegsanleihe: GONE,                              // Teil 5: Kriegserfahrung kehrt in den Pool zurück (REQ-K5.04)
  // Armee
  aushebung:       { off: CAPPED },
  grosseArmee:     { off: CAPPED },
  kriegstrommeln:  { off: G => {}, on: G => { G.build('kaserne'); } },        // Teil 5: Versorgung 5 gibt es mit der Kaserne (3 + 2), ohne Karte
  schildwall:      { off: G => {}, on: G => { G.build('kaserne'); } },
  weitschuss: GONE, langeWurfarme: GONE,                                   // Teil 6 (REQ-K6.03): Pool höchstens 38 Karten, siehe tests/kategorien6.test.mjs
  drill: {}, belagerungsgeraet: {}, sappeure: GONE, vorposten: GONE, veteranen: GONE, taktiker: GONE,
  // Basis
  turmkanoniere:   { off: G => {}, on: G => { G.S.lvl.turm_0 = 1; } },
  bastion: GONE, scharfschuetzen: GONE, zeugmeister: GONE, festungsbau: GONE,
  maurerkolonne: {}, zinnen: GONE, notreserve: GONE,
  // Automatisierung
  werkmeister: GONE, instandhaltung: GONE, dauerauftrag: {}, fliessband: GONE,
  // Sonderregel
  allesAufDieMitte: {}, verbrannteErde: GONE, gluecksritter: {}, blitzkrieg: GONE, soeldnerheer: GONE,
  // Teil 6 (REQ-K6.02): übernommene Regeln der Linienstufen
  querverbindung:  { off: G => G.S.slots.forEach((s, i) => { if (s && s.type === 'fabrik') G.S.slots[i] = null; }) },
  lagerzehnt:      { off: G => { G.S.level = 1; } },
  soeldnertruppe:  { off: G => {}, on: G => { G.build('kaserne'); } },
  rekrutenzug:     { off: G => {}, on: G => { G.build('kaserne'); } },
  durchbruch: {},
  // Teil 6 (REQ-K6.03): Synergiekarten erscheinen erst mit zwei Karten ihrer Kategorie (synergieAb); darunter ist ihre Wirkung zu klein
  gilde:            { off: G => { G.S.draft.stacks.bessereFabriken = 0; G.S.draft.ver++; }, on: G => { G.S.draft.stacks.bessereFabriken = 1; G.S.draft.stacks.kriegserfahrung = 1; G.S.draft.ver++; } },
  waffenbrueder:    { off: G => {}, on: G => { G.S.draft.stacks.aushebung = 1; G.S.draft.stacks.drill = 1; G.S.draft.ver++; } },
  wehrverband:      { off: G => {}, on: G => { G.S.lvl.turm_0 = 1; G.S.draft.stacks.maurerkolonne = 1; G.S.draft.stacks.stachelwall = 1; G.S.draft.ver++; } },
  bauordnung:       { off: G => {}, on: G => { G.S.draft.stacks.bessereFabriken = 1; G.S.draft.stacks.kriegserfahrung = 1; G.S.draft.ver++; } },
  sammelruf:        { off: G => {}, on: G => { G.build('kaserne'); G.S.draft.stacks.aushebung = 1; G.S.draft.stacks.drill = 1; G.S.draft.ver++; } },
  kriegswirtschaft: { off: G => {}, on: G => { G.S.draft.stacks.aushebung = 1; G.S.draft.stacks.drill = 1; G.S.draft.ver++; } },
  wehrhandel:       { off: G => {}, on: G => { G.S.draft.stacks.maurerkolonne = 1; G.S.draft.stacks.stachelwall = 1; G.S.draft.ver++; } },
  grenzwacht:       { off: G => {}, on: G => { G.S.draft.stacks.aushebung = 1; G.S.draft.stacks.drill = 1; G.S.draft.ver++; } },
  pluenderung:     { off: G => {}, on: G => { G.S.lvl.turm_0 = 1; } },
  // Teil 6 (REQ-K6.07): Ausbauten als Karten
  turmschule:      { off: G => {}, on: G => { G.S.lvl.turm_0 = 1; } },
  stachelwall: {},
};

test('Jede Bonuskarte ist in der Fallliste erfasst', () => {
  const { G } = game();
  for (const o of bonus(G)) assert.ok(o.id in CASES, `Fallliste: ${o.id}`);
  for (const id of Object.keys(CASES)) assert.ok(G.OPT[id], `unbekannte Karte ${id}`);
});

for (const [id, c] of Object.entries(CASES)){
  test(`Angebotsbedingung ${id}: bei Wirkung null nicht angeboten, mit Wirkung angeboten`, () => {
    if (c.entfaellt){ const { G } = game(11, 6); assert.equal(offered(G, id), false, `${id}: im Modus karten gestrichen`); return; }
    // angeboten: Grundzustand (Fabrik steht, Platz frei), Stufe der Partie hoch genug
    { const { G } = game(11, 6); if (c.base) c.base(G); if (c.on) c.on(G);
      assert.equal(offered(G, id), true, `${id}: mit Wirkung angeboten`); }
    // nicht angeboten
    { const { G } = game(11, 6);
      if (c.off) c.off(G); else exhaust(G, id);
      assert.equal(offered(G, id), false, `${id}: ohne Wirkung nicht angeboten`); }
  });
}

test('Standardmodus: die neuen Angebotsbedingungen gelten nicht (wie main)', () => {
  const { KlammerCore } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 3, { pacing: 'standard' });
  G.S.slots.forEach((s, i) => { if (s && s.type === 'fabrik') G.S.slots[i] = null; });
  assert.equal(G.has('fabrik'), false);
  assert.equal(G.optionAvailable(G.OPT.bessereFabriken), true);
  G.S.level = 1; assert.equal(G.optionAvailable(G.OPT.nachtschicht), true);
});

/* ---------- Zufällige Spielstände: keine angebotene Karte hat Wirkung null ---------- */
const hasB = (G, b) => G.S.slots.some(s => s && s.type === b);
const free = G => G.S.slots.some(s => !s);
const ZERO = {   // unabhängige Bewertung: wäre die Wirkung im Spielstand null?
  bessereFabriken: G => !hasB(G, 'fabrik'), schwerePressen: G => !hasB(G, 'fabrik'), doppelschicht: G => !hasB(G, 'fabrik'),
  grossauftrag: G => !hasB(G, 'fabrik'), rationalisierung: G => !hasB(G, 'fabrik'),
  serienbau: G => !free(G), bauleitung: G => !free(G),
  nachtschicht: G => G.S.level < 5, selbstlaeufer: G => G.S.level < 2,
  handelskontor: G => !hasB(G, 'kontor'), werkmeister: G => !hasB(G, 'schmiede'),
  aushebung: G => G.supplyCap() >= 15, grosseArmee: G => G.supplyCap() >= 15,
  kriegstrommeln: G => G.supplyCap() < 5, schildwall: G => G.supplyCap() < 5,
  weitschuss: G => !['werfer', 'armbrust', 'katapult'].some(t => G.isOpen('einheit:' + t)),
  langeWurfarme: G => !G.isOpen('einheit:werfer'),
  querverbindung: G => !hasB(G, 'fabrik'), lagerzehnt: G => G.S.level < 2, soeldnertruppe: G => !hasB(G, 'kaserne'), rekrutenzug: G => !hasB(G, 'kaserne'), pluenderung: G => !(G.S.lvl.turm_0 > 0 || G.S.lvl.turm_2 > 0),
  turmkanoniere: G => !(G.S.lvl.turm_0 > 0 || G.S.lvl.turm_2 > 0), bastion: G => !(G.S.lvl.turm_0 > 0 || G.S.lvl.turm_2 > 0),
  scharfschuetzen: G => !(G.S.lvl.turm_0 > 0 || G.S.lvl.turm_2 > 0), zeugmeister: G => !(G.S.lvl.turm_0 > 0 || G.S.lvl.turm_2 > 0),
};

test('1.000 Angebote in zufälligen Spielständen: keine angebotene Bonuskarte hat Wirkung null', () => {
  let offers = 0, checked = 0;
  for (let seed = 1; seed <= 1000; seed++){
    const { G } = game(seed, 1 + (seed % 9));
    const r = k => ((seed * 2654435761 + k * 40503 + k * k * 7919) >>> 0) % 1000 / 1000;
    // zufälliger Zustand: Gebäude, Einheiten, Türme, Versorgung, Platz
    open(G, 'bau:kaserne', 'bau:schmiede', 'bau:universitaet', 'bau:kontor');
    if (r(1) < 0.5) G.build('kaserne');
    if (r(2) < 0.4) G.build('schmiede');
    if (r(3) < 0.4) G.build('kontor');
    if (r(4) < 0.3) G.S.slots.forEach((s, i) => { if (s && s.type === 'fabrik') G.S.slots[i] = null; });
    if (r(5) < 0.3) for (let i = 0; i < G.S.slots.length; i++) if (!G.S.slots[i]) G.S.slots[i] = { type: 'fabrik' };
    if (r(6) < 0.4) open(G, 'einheit:werfer');
    if (r(7) < 0.3) G.S.lvl.turm_0 = 1 + Math.floor(r(8) * 3);
    if (r(10) < 0.2) G.S.research.done.r_logistik = 3;
    G.S.draft.ver++; G.S.research.ver++;
    G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = G.S.t - 1000; G.S.xpTotal = G.xpNeed(G.S.level + 1);
    G.S.pendingDraft = null;
    const ids = G.ALL_OPTIONS.filter(G.optionAvailable);
    // der Angebotsfilter selbst: jede Karte des Pools, die Wirkung null hätte, ist ausgeschlossen
    for (const o of ids){ if (o.pfad) continue; checked++; if (ZERO[o.id]) assert.equal(ZERO[o.id](G), false, `${o.id} im Pool trotz Wirkung null (Seed ${seed})`); }
    offers++;
  }
  assert.equal(offers, 1000); assert.ok(checked > 15000, `geprüfte Karten: ${checked}`);       // Teil 6: kleinerer Pool (7 Karten gestrichen, Synergiekarten erscheinen selten)
});

/* ---------- Kartentitel ---------- */
test('Kein Kartentitel kommt im Modus karten doppelt vor (de und en)', () => {
  const I18N = loadI18n();
  const { G } = game();
  for (const lang of ['de', 'en']){
    const name = o => I18N[lang][o.nameKey + '.karten'] ?? I18N[lang][o.nameKey];
    const seen = new Map();
    for (const o of G.ALL_OPTIONS){
      const n = name(o); assert.ok(n, `${lang}: Name für ${o.id}`);
      assert.ok(!seen.has(n), `${lang}: Titel „${n}“ doppelt (${seen.get(n)} und ${o.id})`);
      seen.set(n, o.id);
    }
  }
});

test('Die Bonuskarte Festungsbau behält ihren Namen: die gleichnamige Pfadkarte entfiel mit Teil 5', () => {
  const I18N = loadI18n();
  assert.equal(I18N.de['draft.festungsbau.name'], 'Festungsbau');
  assert.equal(I18N.de['draft.festungsbau.name.karten'], undefined, 'kein Sondername mehr im Modus karten');
  assert.equal(I18N.de['kp.card.festungsbau.name'], undefined, 'die Pfadkarte gibt es nicht mehr');
});

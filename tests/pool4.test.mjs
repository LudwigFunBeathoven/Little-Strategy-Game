// Tests Kartenpfad Teil 4, REQ-S.02 (C2, C4) und REQ-S.03: Kartenpool bereinigt, Kaserne ab Start, Gelehrte/Metallverarbeitung in Wahl 1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal', tweak = null){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  if (tweak) tweak(KF_CONFIG);
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
const offered = (G, id) => G.optionAvailable(G.OPT[id]);
const choose = (G, id) => { G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const REMOVED_CARDS = ['kriegserfahrung', 'serienbau', 'bauleitung'], REMOVED_RESEARCH = ['r_ingenieur'];

test('S.02 C2 / S.03: gestrichene Karten sind im Modus karten nie ziehbar, im Modus standard unverändert', () => {
  for (const seed of [1, 2, 3]){
    const { G } = game('karten', seed);
    G.S.material = 1e7; G.S.level = 6; G.S.pfad.choices = 9; G.build('fabrik');
    for (const id of REMOVED_CARDS) assert.equal(offered(G, id), false, `${id} (karten, Seed ${seed})`);
    // Stichprobe: 300 Angebote an wechselnden Spielständen enthalten keine gestrichene Karte
    for (let i = 0; i < 300; i++){
      G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.level = 1 + (i % 12); G.S.pfad.choices = i % 12;
      G.S.slots.fill(null); if (i % 3) G.build('fabrik');
      const opts = G.S.pacing === 'karten' ? G.drawOptionsKarten(4) : [];
      for (const id of opts) assert.ok(!REMOVED_CARDS.includes(id), `${id} im Angebot ${i}`);
    }
  }
  const { G: S } = game('standard');
  S.S.material = 1e7;
  for (const id of ['kriegserfahrung', 'serienbau', 'bauleitung']) assert.ok(S.OPT[id], `${id} existiert`);
  assert.equal(offered(S, 'kriegserfahrung'), true, 'Standard: Kriegserfahrung weiter ziehbar');
  assert.equal(offered(S, 'bauleitung'), true, 'Standard: Bauleitung weiter ziehbar');
});

test('S.03: Forschung „Ingenieurskunst“ (nur Baukosten) entfällt im Modus karten, im Standard erforschbar', () => {
  const { G } = game('karten');
  G.S.material = 1e7; G.unlockKey('bau:universitaet'); G.S.slots[0] = { type: 'universitaet' };
  for (const id of REMOVED_RESEARCH) assert.equal(G.researchBlock(id), 'notInMode', id);
  const { G: S } = game('standard');
  S.S.material = 1e7; S.S.slots[0] = { type: 'universitaet' };
  for (const id of REMOVED_RESEARCH) assert.equal(S.researchBlock(id), null, `${id} im Standard`);
});

test('S.03: kein Inhalt des Modus karten wirkt allein auf Baukosten', () => {
  const { C, P } = game('karten');
  const KOSTEN = ['factoryCost', 'buildCost', 'autoFactory'];
  const all = loadCore();
  const removed = new Set([...(P.entfallenKarten || []), ...(P.entfallen || [])]);
  for (const o of all.KF_DRAFT_OPTIONS){
    if (removed.has(o.id)) continue;
    const tiers = (C.KARTEN.kartenTiers && C.KARTEN.kartenTiers[o.id]) || o.tiers;
    for (const tr of tiers) assert.ok((tr.effect || []).some(e => !KOSTEN.includes(e.stat) || e.grant) || !(tr.effect || []).length, `${o.id}: nur Baukosten`);
  }
  for (const r of all.KF_RESEARCH){
    if (removed.has(r.id)) continue;
    for (const tr of r.tiers) assert.ok((tr.effect || []).some(e => !KOSTEN.includes(e.stat)) || !(tr.effect || []).length, `${r.id}: nur Baukosten`);
  }
  for (const id of REMOVED_CARDS.concat(REMOVED_RESEARCH)) assert.ok(removed.has(id), `${id} steht in der Streichliste`);
});

test('S.02 C2: Glücksritter verlängert den Wellenabstand und ändert keine EP-Schwelle (karten); Standard unverändert', () => {
  const { G, C } = game('karten');
  const need = [1, 2, 5].map(n => G.xpNeed(n));
  choose(G, 'gluecksritter');
  assert.deepEqual([1, 2, 5].map(n => G.xpNeed(n)), need, 'keine EP-Schwelle ändert sich');
  assert.equal(G.mMul('xpNeed'), 1);
  assert.equal(G.mMul('ownWaveInterval'), C.KARTEN.kartenTiers.gluecksritter[0].drawback[0].mul);
  assert.equal(G.mMul('ownWaveInterval'), 1.25, 'Abstand der eigenen Wellen +25 %');
  assert.equal(G.mAdd('draftSize'), 1);
  // tatsächlicher Wellenabstand
  const a = game('karten').G, b = game('karten').G;
  choose(b, 'gluecksritter');
  assert.ok(Math.abs(b.ownWaveInterval() / a.ownWaveInterval() - 1.25) < 1e-9, `Wellenabstand ${b.ownWaveInterval()} vs ${a.ownWaveInterval()}`);
  const { G: S, C: SC } = game('standard');
  choose(S, 'gluecksritter');
  assert.equal(S.mMul('xpNeed'), 1.15, 'Standard: Stufen kosten 15 % mehr EP');
  assert.equal(S.mMul('ownWaveInterval'), 1);
  assert.equal(SC.KARTEN.kartenTiers.gluecksritter[0].drawback[0].stat, 'ownWaveInterval');
});

test('S.03: Söldnerheer im Modus karten mit Produktion × 0,8 statt × 0,6', () => {
  const { G } = game('karten'); choose(G, 'soeldnerheer');
  assert.equal(G.mMul('autoProd'), 0.8);
  assert.equal(G.mMul('unitCost'), 0);
  const { G: S } = game('standard'); choose(S, 'soeldnerheer');
  assert.equal(S.mMul('autoProd'), 0.6);
});

test('S.03: Handelskontor wird im Modus karten erst angeboten, wenn der Zinsdeckel erreicht wurde', () => {
  const { G, C } = game('karten');
  G.S.material = 1e7; G.S.level = 3; G.S.pfad.choices = 9;
  G.unlockKey('bau:kontor'); G.build('kontor');
  assert.equal(offered(G, 'handelskontor'), false, 'Kontor steht, Deckel nicht erreicht');
  // Zinszahlung unterhalb des Deckels erreicht ihn nicht
  G.S.material = 100; G.S.kontorT = C.KONTOR.intervalS; G.tick(0.05);
  assert.ok(!(G.S.stats.zinsDeckel > 0));
  assert.equal(offered(G, 'handelskontor'), false);
  // Zahlung am Deckel
  G.S.material = 1e6; G.S.kontorT = C.KONTOR.intervalS; G.tick(0.05);
  assert.ok(G.S.stats.zinsDeckel > 0, 'Deckel erreicht');
  assert.equal(offered(G, 'handelskontor'), true);
  // Standard: wie bisher, sobald das Kontor steht
  const { G: S } = game('standard'); S.S.material = 1e7; S.build('kontor');
  assert.equal(offered(S, 'handelskontor'), true);
  assert.equal(S.S.stats.zinsDeckel, undefined, 'Standard: keine neuen Zähler');
});

test('S.02 C4: Kaserne ist ab Start baubar, Werfer erst mit „Echtes Militär“ (+2 Versorgung)', () => {
  const { G } = game('karten');
  G.S.material = 1e7;
  assert.equal(G.isBuildable('kaserne'), true, 'baubar ohne Karte');
  assert.equal(G.buildBlock(0, 'kaserne'), null);
  assert.equal(G.buildAt(0, 'kaserne'), true);
  assert.equal(G.unitUnlocked('laeufer'), true);
  assert.equal(G.unitUnlocked('werfer'), false, 'Werfer erst mit der Karte');
  const cap = G.supplyCap();
  choose(G, 'echtesMilitaer');
  G.unlockKey('einheit:werfer');
  assert.equal(G.supplyCap() - cap, 2, '+2 Versorgung');
  assert.equal(G.unitUnlocked('werfer'), true);
  // Ausbau (Grundausbau darüber hinaus) bleibt an Forschung gebunden
  assert.ok(G.stageSource('ausbau'), 'Ausbau der Kaserne braucht weiterhin Forschung');
  const { P } = game('karten');
  const c = P.karten.find(k => k.id === 'echtesMilitaer');
  assert.ok(!c.schaltetFrei.includes('bau:kaserne'));
  assert.equal(G.pacingKeys().gesperrt.filter(k => k === 'bau:kaserne').length, 0, 'Kaserne nicht gesperrt');
});

test('S.02 C4: Gelehrte und Metallverarbeitung sind in der ersten Wahl ziehbar', () => {
  const { G } = game('karten');
  assert.equal(G.S.pfad.choices, 0);
  assert.equal(offered(G, 'gelehrte'), true);
  assert.equal(offered(G, 'metallverarbeitung'), true);
  assert.equal(offered(G, 'echtesMilitaer'), true);
  assert.equal(offered(G, 'handel'), false, 'Handel braucht Gelehrte');
  // über viele erste Angebote erscheinen beide
  const seen = new Set();
  for (let seed = 1; seed <= 60; seed++){
    const { G: g } = game('karten', seed);
    for (const id of g.drawOptionsKarten(3)) seen.add(id);
  }
  for (const id of ['gelehrte', 'metallverarbeitung']) assert.ok(seen.has(id), `${id} in einer ersten Wahl gezogen`);
});

test('S.02 C3: Schwellen je Grad überschreiben nur den betroffenen Grad', () => {
  const base = game('karten').C.KARTEN.fahrplan.schwellen, n = 4;
  const sum = st => st.slice(0, n).reduce((a, b) => a + b, 0);
  const tweak = C => { C.KARTEN.schwellenGrad = { schwer: base.map(x => x * 2) }; };
  const ref = ['leicht', 'normal'].map(d => game('karten', 3, d).G.xpNeed(n));
  const schwer = game('karten', 3, 'schwer', tweak).G, leicht = game('karten', 3, 'leicht', tweak).G, normal = game('karten', 3, 'normal', tweak).G;
  assert.equal(Math.round(schwer.xpNeed(n)), Math.round(sum(base.map(x => x * 2))), 'Schwer nutzt eigene Schwellen');
  assert.equal(Math.round(leicht.xpNeed(n)), Math.round(ref[0]), 'Leicht unverändert');
  assert.equal(Math.round(normal.xpNeed(n)), Math.round(ref[1]), 'Normal unverändert');
  assert.equal(Math.round(leicht.xpNeed(n)), Math.round(sum(base)));
});

test('S.02 C3: Tabelle der Schwellen für Schwer: erste Schwelle wie der Fahrplan, die übrigen höher; Leicht und Normal ohne eigene Tabelle', () => {
  const { C } = game('karten');
  const base = C.KARTEN.fahrplan.schwellen, sw = C.KARTEN.schwellenGrad.schwer;
  assert.equal(sw.length, base.length);
  assert.equal(sw[0], base[0], 'Wahl 1 unverändert (die erste Karte muss vor der ersten großen Welle kommen)');
  for (let i = 1; i < base.length; i++) assert.ok(sw[i] > base[i], `Schritt ${i + 1} höher als im Fahrplan`);
  assert.equal(C.KARTEN.schwellenGrad.leicht, undefined);
  assert.equal(C.KARTEN.schwellenGrad.normal, undefined);
  // im Spiel: Schwer braucht für Wahl 3 mehr EP als Normal, Leicht und Normal gleich viel
  const need = d => Math.round(game('karten', 3, d).G.xpNeed(3));
  assert.ok(need('schwer') > need('normal'));
  assert.equal(need('leicht'), need('normal'));
  // Standardmodus: Tabelle wirkt nicht
  const { G: S } = game('standard', 3, 'schwer');
  assert.equal(Math.round(S.xpNeed(3)), Math.round(game('standard', 3, 'normal').G.xpNeed(3)));
});

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
const REMOVED_CARDS = ['serienbau', 'bauleitung'], REMOVED_RESEARCH = ['r_ingenieur'];       // Teil 5 (REQ-K5.04): Kriegserfahrung kehrt in den Pool zurück

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
  assert.equal(offered(game('karten').G, 'kriegserfahrung'), true, 'Teil 5: Kriegserfahrung im Modus karten wieder ziehbar');
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

test('Teil 5 (K5.04): Glücksritter hat im Modus karten wieder den EP-Nachteil (Stufen kosten 15 % mehr EP), keinen Wellenabstand mehr', () => {
  const { G, C } = game('karten');
  const need = [1, 2, 5].map(n => G.xpNeed(n));
  choose(G, 'gluecksritter');
  assert.equal(G.mMul('xpNeed'), 1.15, 'Stufen kosten 15 % mehr EP');
  assert.deepEqual([1, 2, 5].map(n => G.xpNeed(n)), need.map(x => x * 1.15), 'jede EP-Schwelle steigt um 15 %');
  assert.equal(G.mMul('ownWaveInterval'), 1, 'der Wellenabstand bleibt');
  assert.equal(G.mAdd('draftSize'), 1);
  assert.equal(C.KARTEN.kartenTiers.gluecksritter, undefined, 'keine eigene Fassung im Modus karten');
  const { G: S } = game('standard');
  choose(S, 'gluecksritter');
  assert.equal(S.mMul('xpNeed'), 1.15, 'Standard: wie bisher');
  assert.equal(S.mMul('ownWaveInterval'), 1);
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

test('Teil 5 (REQ-K5.02): Kaserne und Werfer sind ab Start da; Versorgung steigt nur durch Kauf (Quartiere)', () => {
  const { G, C } = game('karten');
  G.S.material = 1e7;
  assert.equal(G.supplyCap(), C.SUPPLY_CAP_START, 'ohne Kaserne gilt der Startwert');
  assert.equal(G.isBuildable('kaserne'), true, 'baubar ohne Karte');
  assert.equal(G.buildBlock(0, 'kaserne'), null);
  assert.equal(G.buildAt(0, 'kaserne'), true);
  assert.equal(G.unitUnlocked('laeufer'), true);
  assert.equal(G.unitUnlocked('werfer'), true, 'Werfer ohne Karte');
  assert.equal(G.supplyCap(), C.SUPPLY_CAP_START + C.KASERNE_SUPPLY_PER_LEVEL, 'die Kaserne gibt die erste Stufe');
  const cap = G.supplyCap();
  assert.equal(G.stageSource('ausbau'), null, 'Quartiere ohne Forschung kaufbar');
  assert.ok(G.buy('ausbau')); assert.equal(G.supplyCap() - cap, C.KASERNE_SUPPLY_PER_LEVEL, '+2 Versorgung je Stufe');
  // keine Karte, keine Forschung und kein Spielzustand hebt die Versorgung ohne Kauf (Karten mit Versorgungswirkung sind Bonuskarten oder Wagnis)
  const { P, G: H } = game('karten');
  for (const k of P.karten) if (k.familie === 'technologie') for (const t of k.tiers) assert.ok(!(t.effect || []).some(e => e.stat === 'supply'), `${k.id} gibt Versorgung`);
  for (const r of P.forschungen) for (const t of r.tiers) assert.ok(!(t.effect || []).some(e => e.stat === 'supply' || e.stat === 'supplyMult'), `${r.id} gibt Versorgung`);
  assert.equal(H.supplyCap(), C.SUPPLY_CAP_START);
  assert.equal(G.pacingKeys().gesperrt.filter(k => k === 'bau:kaserne' || k === 'einheit:werfer').length, 0, 'weder Kaserne noch Werfer gesperrt');
});

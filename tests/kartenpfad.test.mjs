// Tests Kartenpfad, REQ-KP.01/KP.02/KP.06: Startzustand, Freischaltung, Angebot, Rückstandsgewicht.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 5){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
const offer = G => { G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.xpTotal = G.xpNeed(G.S.level + 1); G.S.xp = G.S.xpTotal;
  G.tick(0.05); if (!G.S.pendingDraft){ G.S.level++; G.S.pendingLevels = 1; G.S.xpTotal = G.xpNeed(G.S.level); G.S.xp = G.S.xpTotal; } return G; };
const draw = G => { G.S.pendingLevels = 1; G.S.pendingDraft = null; G.S.level++; G.gainXp ? G.gainXp(0) : 0; };
// Angebot direkt über den Kern anstoßen: Stufe anheben und EP setzen
function newOffer(G){
  G.S.level = G.S.level + 1; G.S.pendingLevels = 1; G.S.pendingDraft = null;
  G.S.xpTotal = G.xpNeed(G.S.level); G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 90000 + G.S.nextId++, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 });
  for (let i = 0; i < 5 && !G.S.pendingDraft; i++) G.tick(0.05);
  return G.S.pendingDraft;
}

test('Startzustand karten: nur Fabrik und Läufer, alles Weitere gesperrt, Quelle bekannt', () => {
  const { G, P } = game('karten');
  G.S.material = 1e5;
  for (const b of ['kaserne', 'schmiede', 'universitaet', 'kontor']){ assert.equal(G.isBuildable(b), false, b); assert.equal(G.build(b), false); assert.ok(G.keySource('bau:' + b), `Quelle für ${b}`); }
  assert.ok(G.build('fabrik')); assert.ok(G.spawn('laeufer'));
  assert.equal(G.unitUnlocked('werfer'), false); assert.ok(G.unitSource('werfer'));
  for (const id of ['turm_0', 'turm_2', 'mauer', 'stacheln', 'moertel']) assert.ok(G.stageSource(id), `Stufe ${id} gesperrt`);
  assert.equal(G.stageSource('presse'), null, 'Presse bleibt frei');
});

test('Startzustand standard: unverändert, alles baubar', () => {
  const { G } = game('standard');
  for (const b of ['kaserne', 'schmiede', 'universitaet', 'kontor']) assert.equal(G.isBuildable(b), true);
  assert.equal(G.stageSource('mauer'), null);
});

test('Bau-Karte schaltet genau ihre Inhalte frei', () => {
  const { G, P } = game('karten');
  const card = P.karten.find(k => k.id === 'echtesMilitaer');
  G.S.pendingDraft = { level: 1, options: ['echtesMilitaer', 'bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1;
  const supply0 = G.supplyCap();
  assert.ok(G.chooseDraft(0));
  assert.ok(G.isBuildable('kaserne') && G.unitUnlocked('werfer'));
  assert.equal(G.isBuildable('schmiede'), false, 'nur die genannten Inhalte');
  assert.equal(G.supplyCap(), supply0 + 2, '+2 Versorgung');
  G.S.material = 1e5; assert.ok(G.build('kaserne'));
  const g2 = game('karten').G; g2.S.pendingDraft = { level: 1, options: ['pfadFestungsbau', 'bessereFabriken'], rerolled: 0 }; g2.S.pendingLevels = 1;
  g2.chooseDraft(0);
  assert.equal(g2.stageSource('mauer'), null); assert.equal(g2.stageSource('turm_0'), null);
  assert.equal(g2.isBuildable('kaserne'), false);
});

test('Graphtest: jeder gesperrte Inhalt hat eine Quelle, Voraussetzungsketten sind auflösbar und ohne Zyklus', () => {
  const { G, P } = game('karten');
  const q = G.pacingKeys();
  for (const key of q.gesperrt) assert.ok(q.quellen[key], key);
  for (const [up, list] of Object.entries(q.stufen)) for (const e of list) assert.ok(e.quelle, up);
  const byId = Object.fromEntries([...P.karten, ...(P.forschungen || [])].map(x => [x.id, x]));
  const state = {};
  const visit = id => {
    const x = byId[id]; if (!x) return;
    assert.notEqual(state[id], 1, `Zyklus bei ${id}`);
    if (state[id] === 2) return;
    state[id] = 1;
    for (const b of x.benoetigt || []) if (!b.startsWith('gebaut:')) { assert.ok(byId[b], `unbekannte Voraussetzung ${b}`); visit(b); }
    state[id] = 2;
  };
  for (const id of Object.keys(byId)) visit(id);
  // erreichbar: jede Quelle ist eine Karte oder Forschung des Datensatzes
  for (const src of Object.values(q.quellen)) assert.ok(byId[src], `Quelle ${src}`);
});

test('Angebote: mindestens eine Bonuskarte, mindestens eine Pfadkarte (wenn ziehbar), höchstens eine Wagnis-Karte, keine Technologie ohne Universität', () => {
  let offers = 0;
  for (let seed = 1; seed <= 1000; seed++){
    const { G } = game('karten', seed);
    const d = newOffer(G); if (!d) continue;
    offers++;
    const os = d.options.map(id => G.OPT[id]);
    assert.ok(os.some(o => !o.pfad), `Bonus (${seed})`);
    const drawable = G.ALL_OPTIONS.some(o => o.pfad && (o.family === 'bau' || o.family === 'technologie') && G.optionAvailable(o));
    if (drawable) assert.ok(os.some(o => o.pfad && (o.family === 'bau' || o.family === 'technologie')), `Pfadkarte (${seed})`);
    assert.ok(os.filter(o => o.family === 'wagnis').length <= 1);
    assert.ok(!os.some(o => o.family === 'technologie'), 'ohne Universität keine Technologie');
    assert.equal(new Set(d.options).size, d.options.length, 'keine doppelte Karte');
  }
  assert.ok(offers > 900);
});

test('Nicht gewählte Pfadkarte bleibt im Stapel; gewählte erscheint nicht erneut', () => {
  const { G } = game('karten', 3);
  G.S.pendingDraft = { level: 1, options: ['echtesMilitaer', 'pfadFestungsbau'], rerolled: 0 }; G.S.pendingLevels = 1;
  G.chooseDraft(0);
  assert.equal(G.cardTaken('echtesMilitaer'), 1);
  assert.equal(G.optionAvailable(G.OPT.echtesMilitaer), false, 'gewählt: nie wieder');
  assert.equal(G.optionAvailable(G.OPT.festungsbau), true, 'nicht gewählt: wieder ziehbar');
});

test('Rückstandsgewicht und harte Grenze: eine ziehbare Bau-Karte erscheint spätestens in der dritten Wahl nach der Freigabe', () => {
  for (let seed = 1; seed <= 300; seed++){
    const { G, C } = game('karten', seed);
    // Bei zwei Plätzen je Angebot bleibt ein Platz der Bonuskarte; die Grenze gilt daher, solange höchstens drei Bau-Karten zugleich ziehbar sind:
    // Echtes Militär ist gewählt, die übrigen Bau-Karten werden nie gewählt
    G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++;
    const release = {}, first = {};
    for (let choice = 1; choice <= 10; choice++){
      const d = newOffer(G); if (!d) break;
      for (const k of ['pfadFestungsbau', 'metallverarbeitung', 'gelehrte']){
        if (release[k] === undefined && G.optionAvailable(G.OPT[k])) release[k] = choice;
        if (first[k] === undefined && d.options.includes(k)) first[k] = choice;
      }
      G.chooseDraft(d.options.findIndex(id => !G.OPT[id].pfad));
    }
    for (const k of Object.keys(release)) assert.ok(first[k] !== undefined && first[k] - release[k] <= C.KARTEN.maxWarten - 1, `${k}: frei ab Wahl ${release[k]}, erstmals angeboten in Wahl ${first[k]} (Seed ${seed})`);
  }
});

test('Kartenkennungen sind eindeutig (Bonus- und Pfadkarten)', () => {
  const { G } = game('karten');
  const ids = G.ALL_OPTIONS.map(o => o.id);
  assert.equal(new Set(ids).size, ids.length);
});

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
  assert.equal(G.supplyCap(), supply0 + 3, '+3 Versorgung');
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
  for (const src of Object.values(q.quellen).flat()) assert.ok(byId[src], `Quelle ${src}`);
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

/* ---------- Universität als Forschungsstätte (REQ-KP.04) ---------- */
function withUni(seed = 9){
  const g = game('karten', seed), { G } = g;
  G.S.material = 1e6; G.unlockKey('bau:universitaet'); G.build('universitaet');
  G.S.draft.stacks.pfadFestungsbau = 1; G.S.draft.ver++;
  return g;
}
const pickCard = (G, id) => { G.S.pendingDraft = { level: 1, options: [id, 'bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1; return G.chooseDraft(0); };

test('Technologiekarte öffnet genau ihre Forschungen; vorher sind sie gesperrt', () => {
  const { G } = withUni();
  for (const id of ['r_mauerausbau3', 'r_turmausbau']) assert.equal(G.researchBlock(id), 'closed', id);
  assert.ok(pickCard(G, 'befestigungskunde'));
  for (const id of ['r_mauerausbau3', 'r_turmausbau']) assert.equal(G.researchBlock(id), null, id);
});

test('Pfadforschung gilt nur im Modus karten; im Standard ist sie nicht vorhanden', () => {
  const { G } = game('standard'); G.S.material = 1e6; G.build('universitaet');
  assert.equal(G.researchBlock('r_mauerausbau3'), 'notInMode');
});

test('Forschung läuft nur bei laufender Spielzeit; Abschluss öffnet die Stufe', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  assert.equal(G.stageSource('mauer') === null, true, 'Stufe 2 durch Festungsbau offen');
  G.buy('mauer');
  assert.equal(G.stageSource('mauer'), 'r_mauerausbau3', 'Stufe 3 braucht die Forschung');
  assert.ok(G.startResearch('r_mauerausbau3'));
  const a = G.S.research.active[0], t0 = a.t;
  G.S.pendingDraft = { level: 1, options: ['bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1;   // offene Wahl pausiert die Zeit
  for (let i = 0; i < 40; i++) G.tick(0.05);
  assert.equal(a.t, t0, 'Pause: kein Fortschritt');
  G.S.pendingDraft = null; G.S.pendingLevels = 0;
  for (let i = 0; i < 60 * 20 + 5; i++) G.tick(0.05);
  assert.equal(G.researchTier('r_mauerausbau3'), 1);
  assert.equal(G.stageSource('mauer'), null);
  assert.ok(G.buy('mauer'), 'Stufe 3 kaufbar');
});

test('Ein Forschungsplatz nimmt keine zweite Forschung an; mit zweitem Platz laufen beide', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  assert.ok(G.startResearch('r_mauerausbau3'));
  assert.equal(G.researchBlock('r_turmausbau'), 'busy');
  G.S.draft.stacks.x = 0; G.S.research.done.r_logistik = 1; G.S.research.done.r_zweiterplatz = 1; G.S.research.ver++;
  assert.equal(G.researchSlots(), 2);
  assert.ok(G.startResearch('r_turmausbau'));
  assert.equal(G.S.research.active.length, 2);
});

test('Abriss der Universität: Fertiges bleibt wirksam, Laufendes pausiert', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  G.S.research.done.r_mauerausbau3 = 1; G.S.research.ver++;
  G.S.lvl.mauer = 1;
  assert.equal(G.stageSource('mauer'), null, 'Stufe 3 offen dank Forschung');
  assert.ok(G.startResearch('r_turmausbau'));
  const i = G.S.slots.findIndex(s => s && s.type === 'universitaet');
  G.demolish(i);
  const a = G.S.research.active[0], t0 = a.t;
  for (let i2 = 0; i2 < 100; i2++) G.tick(0.05);
  assert.equal(a.t, t0, 'ohne Universität kein Fortschritt');
  assert.equal(G.researchTier('r_mauerausbau3'), 1, 'abgeschlossen bleibt');
  assert.equal(G.stageSource('mauer'), null, 'die Wirkung bleibt');
  G.build('universitaet');
  for (let i2 = 0; i2 < 100; i2++) G.tick(0.05);
  assert.ok(a.t > t0, 'mit neuer Universität geht es weiter');
});

/* ---------- Upgrade-Stufen, Einheitenersatz, neue Einheiten (REQ-KP.05) ---------- */
test('Jede Upgrade-Stufe ab 2 hat genau eine Quelle; ohne Quelle nicht kaufbar', () => {
  const { G, C } = game('karten');
  const q = G.pacingKeys();
  for (const [up, list] of Object.entries(q.stufen)){
    assert.ok(C.UPGRADES[up], `Upgrade ${up} existiert`);
    const abs = list.map(e => e.ab);
    assert.equal(new Set(abs).size, abs.length, `${up}: jede Stufe genau eine Quelle`);
    for (const e of list) assert.ok(e.ab >= 1);
  }
  G.S.material = 1e7; G.build('fabrik');
  G.unlockKey('bau:schmiede'); G.unlockKey('bau:kaserne'); G.build('schmiede'); G.build('kaserne');
  assert.equal(G.buy('ausbau'), false, 'Kaserne-Ausbau 2 braucht Forschung Reiter');
  for (let i = 0; i < 3; i++) assert.ok(G.buy('qualitaet'), `Schmiede Stufe 1, Kauf ${i + 1}`);
  assert.equal(G.buy('qualitaet'), false, 'Schmiede-Ausbau 2 braucht Forschung Eisenwaffen');
  G.S.research.done.r_reiter = 1; G.S.research.done.r_eisenwaffen = 1; G.S.research.ver++;
  assert.ok(G.buy('ausbau') && G.buy('qualitaet'));
});

test('Neue Einheiten: Reiter und Schildträger erst nach der Forschung, Karte öffnet sie', () => {
  const { G } = withUni(); G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.unlockKey('bau:kaserne');
  for (const u of ['reiter', 'schild']) assert.equal(G.unitUnlocked(u), false, u);
  assert.equal(G.researchBlock('r_reiter'), 'closed');
  assert.ok(pickCard(G, 'fortgeschritteneTaktiken'));
  assert.equal(G.researchBlock('r_reiter'), null); assert.equal(G.researchBlock('r_schild'), null);
  assert.ok(G.startResearch('r_reiter'));
  for (let i = 0; i < 20 * 80; i++) G.tick(0.05);
  assert.equal(G.researchTier('r_reiter'), 1);
  assert.ok(G.unitUnlocked('reiter') && !G.unitUnlocked('schild'));
  assert.ok(G.spawn('reiter') && G.S.queue.at(-1).type === 'reiter');
  assert.equal(G.stageSource('ausbau'), null, 'Kaserne-Ausbau 2 durch Forschung Reiter');
  assert.equal(G.researchBlock('r_schildtraeger'), 'notInMode', 'alte Forschung entfällt im Modus karten');
});

test('Eisenwaffen: Einheitenersatz wertet Warteschlange und Feld auf, die Zahl bleibt gleich', () => {
  const { G } = withUni(); G.S.draft.stacks.metallverarbeitung = 1; G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.unlockKey('einheit:werfer');
  assert.ok(pickCard(G, 'eiserneKlingen'));
  G.spawn('laeufer'); G.spawn('werfer');
  G.addFormation('p', 1, ['laeufer', 'werfer', 'laeufer'], 120);
  const before = G.S.units.length + G.S.queue.length;
  assert.ok(G.startResearch('r_eisenwaffen'));
  assert.ok(G.rushResearch('r_eisenwaffen'), 'Beschleunigen schließt sofort ab');
  assert.equal(G.researchTier('r_eisenwaffen'), 1);
  const own = G.S.units.filter(u => u.side === 'p');
  assert.ok(!own.some(u => u.type === 'laeufer' || u.type === 'werfer'), 'keine Läufer und Werfer mehr');
  assert.ok(own.some(u => u.type === 'schwertkaempfer') && own.some(u => u.type === 'bogenschuetze'));
  assert.ok(G.S.queue.every(q => ['schwertkaempfer', 'bogenschuetze'].includes(q.type)));
  assert.equal(G.S.units.length + G.S.queue.length, before, 'nichts gelöscht');
  assert.equal(G.ownType('laeufer'), 'schwertkaempfer');
  assert.ok(G.unitStats('p', 'bogenschuetze').hp > 0);
});

test('Ersatzeinheiten erben die Werfer-Karten (Lange Wurfarme)', () => {
  const { G } = game('karten'); G.S.draft.stacks.langeWurfarme = 1; G.S.draft.ver++;
  assert.equal(G.unitRange('p', 'bogenschuetze'), game('karten').C.UNITS.bogenschuetze.range + 25);
});

/* ---------- Wagnis, Exklusivpfad, Mindesttempo (REQ-KP.06, KP.07) ---------- */
test('Wagnis-Karten wirken dauerhaft mit Nachteil', () => {
  const { G } = withUni(); G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.unlockKey('einheit:werfer');
  G.addFormation('p', 1, ['laeufer', 'werfer'], 100);
  const hp0 = G.unitStats('p', 'werfer').hp, d0 = G.mMul('rangedDmg');
  assert.ok(pickCard(G, 'glaskanonen'));
  assert.equal(G.mMul('rangedDmg'), d0 * 2);
  assert.equal(G.unitStats('p', 'werfer').hp, 1, 'Fernkämpfer haben 1 Lebenspunkt');
  assert.equal(G.unitStats('p', 'laeufer').hp > 1, true, 'Nahkämpfer unberührt');
  const g2 = withUni().G; g2.S.draft.stacks.echtesMilitaer = 1; g2.S.draft.ver++;
  const sup = g2.supplyCap(), m0 = g2.mMul('materialYield');
  assert.ok(pickCard(g2, 'volleAuslastung'));
  assert.equal(g2.mMul('materialYield'), m0 * 0.5);
  assert.ok(g2.supplyCap() >= Math.min(g2.C_MAX || 99, sup * 2) || g2.supplyCap() > sup, 'Versorgung steigt');
  assert.ok(hp0 > 1);
});

test('Wagnis: höchstens eine je Angebot, erst ab Wahl 5 und nur mit Echtem Militär', () => {
  const { G } = game('karten', 4); G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.S.pfad.choices = 4;
  assert.equal(G.optionAvailable(G.OPT.glaskanonen), true);
  const g2 = game('karten', 4).G; g2.S.pfad.choices = 4;
  assert.equal(g2.optionAvailable(g2.OPT.glaskanonen), false, 'ohne Echtes Militär');
  const g3 = game('karten', 4).G; g3.S.draft.stacks.echtesMilitaer = 1; g3.S.pfad.choices = 3;
  assert.equal(g3.optionAvailable(g3.OPT.glaskanonen), false, 'vor Wahl 5');
});

test('Exklusivpaar: nach Wahl einer Karte erscheint die andere nie wieder; ihre Forschung und Einheiten entfallen', () => {
  for (const [a, b] of [['fortgeschritteneTaktiken', 'ballistik'], ['ballistik', 'fortgeschritteneTaktiken']]){
    const { G } = withUni(); G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.S.pfad.choices = 3;
    assert.equal(G.optionAvailable(G.OPT[a]) && G.optionAvailable(G.OPT[b]), true, 'vorher beide ziehbar');
    assert.ok(pickCard(G, a));
    assert.equal(G.optionAvailable(G.OPT[b]), false);
    assert.equal(G.cardExcluded(b), true);
    for (let seed = 1; seed <= 300; seed++){ const g = withUni(seed).G; g.S.draft.stacks.echtesMilitaer = 1; g.S.draft.stacks[a] = 1; g.S.draft.ver++; g.S.pfad.choices = 5;
      const d = newOffer(g); if (d) assert.ok(!d.options.includes(b), `${b} erscheint nicht (Seed ${seed})`); }
  }
  const { G } = withUni(); G.S.draft.stacks.echtesMilitaer = 1; G.S.pfad.choices = 3; pickCard(G, 'ballistik');
  assert.equal(G.stageSource('ausbau') !== null, true);
  assert.ok(G.startResearch('r_armbrust')); G.rushResearch('r_armbrust');
  assert.equal(G.stageSource('ausbau'), null, 'Kaserne-Ausbau 2 öffnet auch über die Fernkampflinie');
  assert.ok(G.unitUnlocked('armbrust'));
});

test('Mindesttempo: nach maxAbstand ohne Wahl wird die nächste fällig, die EP-Schwelle der folgenden bleibt', () => {
  const { G, C } = game('karten', 6);
  G.S.sections.forEach(s => { s.hp = 1e9; });
  const nextThreshold = G.xpNeed(G.S.level + 1);                  // Schwelle der nächsten EP-Wahl vor der freien Wahl
  for (let i = 0; i < 20 * (C.KARTEN.maxAbstand + 2) && !G.S.pendingDraft; i++) G.tick(0.05);
  assert.ok(G.S.pendingDraft, 'Wahl fällig nach maxAbstand');
  assert.ok(G.S.t >= C.KARTEN.maxAbstand && G.S.t < C.KARTEN.maxAbstand + 2);
  assert.equal(G.S.level, 1); assert.equal(G.S.pfad.free, 1);
  assert.equal(G.xpNeed(G.S.level + 1), nextThreshold, 'Schwelle der folgenden Wahl unverändert');
  G.chooseDraft(0);
  assert.equal(G.S.pendingDraft, null);
  const t1 = G.S.t;
  for (let i = 0; i < 20 * (C.KARTEN.maxAbstand - 5) && !G.S.pendingDraft; i++) G.tick(0.05);
  assert.equal(G.S.pendingDraft, null, 'bis maxAbstand keine weitere freie Wahl');
});

test('Standardmodus: kein Mindesttempo, keine Pfadkarten im Angebot', () => {
  const { G, C } = game('standard', 6); G.S.sections.forEach(s => { s.hp = 1e9; });
  for (let i = 0; i < 20 * (C.KARTEN.maxAbstand + 30); i++) G.tick(0.05);
  assert.equal(G.S.pfad.free, 0);
});

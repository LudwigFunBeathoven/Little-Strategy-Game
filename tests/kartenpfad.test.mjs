// Tests Kartenpfad, REQ-KP.01/KP.02/KP.06, ab Teil 5 (REQ-K5.02): Startzustand mit Grundausstattung, Technologie- und Wagnis-Karten, Angebot, Forschung der Universität.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 5){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', seed, { pacing });
  return { G, C: KF_CONFIG, P: KF_PFAD };
}
// Angebot direkt über den Kern anstoßen: Stufe anheben und EP setzen
function newOffer(G){
  G.S.level = G.S.level + 1; G.S.pendingLevels = 1; G.S.pendingDraft = null;
  if (G.S.pacing === 'karten') G.S.pfad.lastPickT = G.S.t - 1000;          // Mindestabstand (REQ-P.02) erfüllt: die Wahl soll sofort erscheinen
  G.S.xpTotal = G.xpNeed(G.S.level); G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 90000 + G.S.nextId++, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 });
  for (let i = 0; i < 5 && !G.S.pendingDraft; i++) G.tick(0.05);
  return G.S.pendingDraft;
}

test('Teil 5, Startzustand karten: Grundausstattung ab Start, nur Technologie-Inhalte sind gesperrt, jede Sperre hat eine Quelle', () => {
  const { G, C } = game('karten');
  G.S.material = 1e5;
  for (const b of C.BUILDINGS){ assert.equal(G.isBuildable(b), true, b); assert.equal(G.keySource('bau:' + b), null, `keine Quelle für ${b}`); }
  for (const b of ['kaserne', 'schmiede', 'universitaet', 'kontor', 'fabrik']) assert.ok(G.build(b), `${b} baubar`);
  for (const u of ['laeufer', 'werfer']) assert.equal(G.unitUnlocked(u), true, u);
  assert.ok(G.spawn('werfer'));
  for (const id of ['turm_0', 'turm_2', 'mauer', 'stacheln', 'moertel', 'reichweite_0', 'kadenz_0', 'presse', 'ausbau']) assert.equal(G.stageSource(id), null, `Stufe ${id} frei`);
  for (const u of ['reiter', 'schild', 'armbrust', 'katapult']){ assert.equal(G.unitUnlocked(u), false, u); assert.ok(G.unitSource(u), `Quelle für ${u}`); }
  G.S.lvl.qualitaet = 3; assert.ok(G.stageSource('qualitaet'), 'Schmiede-Stufe 4 braucht Eisenwaffen');
});

test('Startzustand standard: unverändert, alles baubar', () => {
  const { G } = game('standard');
  for (const b of ['kaserne', 'schmiede', 'universitaet', 'kontor']) assert.equal(G.isBuildable(b), true);
  assert.equal(G.stageSource('mauer'), null);
});

test('Keine Bau-Karte im Pool: Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte und Handel gibt es nicht (REQ-K5.02)', () => {
  const { G, P } = game('karten');
  for (const id of ['echtesMilitaer', 'pfadFestungsbau', 'metallverarbeitung', 'gelehrte', 'handel']){ assert.equal(G.OPT[id], undefined, id); assert.ok(!P.karten.some(k => k.id === id)); }
  assert.ok(G.ALL_OPTIONS.every(o => o.family !== 'bau'));
  assert.ok(!P.karten.some(k => (k.schaltetFrei || []).some(key => key.startsWith('bau:'))), 'keine Karte schaltet ein Gebäude frei');
  for (let seed = 1; seed <= 40; seed++){ const g = game('karten', seed).G; for (const id of g.drawOptionsKarten(4)) assert.ok(g.OPT[id].family !== 'bau'); }
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
    for (const b of x.benoetigt || []) if (!b.startsWith('gebaut:') && b !== 'forschungsort') { assert.ok(byId[b], `unbekannte Voraussetzung ${b}`); visit(b); }       // forschungsort: Universität oder Bibliothek (Teil 7)
    state[id] = 2;
  };
  for (const id of Object.keys(byId)) visit(id);
  for (const src of Object.values(q.quellen).flat()) assert.ok(byId[src], `Quelle ${src}`);
});

/* Zustand für die Angebotstabelle (REQ-P.04): Teilmenge der Technologiekarten schon gewählt, Universität ja/nein, Wahl-Nummer */
const TECH = ['fortgeschritteneTaktiken', 'ballistik', 'eiserneKlingen', 'befestigungskunde'];
function tableState(seed){
  const { G, C } = game('karten', seed);
  const r = k => ((seed * 2654435761 + k * 40503 + k * k * 7919) >>> 0) % 1000 / 1000;
  const uni = seed % 2 === 1;
  if (uni){ G.S.material = 1e6; G.build('universitaet'); }
  const level = 1 + (seed % 12);
  G.S.pfad.choices = level - 1;
  TECH.forEach((id, i) => { if (r(10 + i) < 0.3) G.S.draft.stacks[id] = 1; });
  if (seed % 7 === 0) for (const id of TECH) G.S.draft.stacks[id] = 1;                                        // nichts mehr ziehbar
  if (seed % 7 === 3){                                                                                         // genau eine Pfadkarte ziehbar
    for (const id of TECH) G.S.draft.stacks[id] = 1;
    delete G.S.draft.stacks[['eiserneKlingen', 'befestigungskunde'][(seed >> 1) % 2]];
  }
  if (seed % 7 === 0 || seed % 7 === 3) G.S.draft.stacks.stadtrecht = 1;                                    // Teil 7: auch die Karte des Haupthauses ist eine Pfadkarte
  G.S.draft.ver++;
  return { G, C, uni };
}
const pathCount = (G, ids) => ids.filter(id => G.isPathFamily(G.OPT[id])).length;

test('Angebot folgt der Tabelle: Pfadplätze = min(2, ziehbare Technologiekarten), Rest Bonus; Größe 3, mit Universität 4; höchstens eine Wagnis-Karte (REQ-P.04)', () => {
  const cells = {}; let offers = 0;
  for (let seed = 1; seed <= 1000; seed++){
    const { G, uni } = tableState(seed);
    const drawable = G.ALL_OPTIONS.filter(o => G.isPathFamily(o) && G.optionAvailable(o)).length;
    const d = newOffer(G); if (!d) continue;
    offers++;
    const os = d.options.map(id => G.OPT[id]), k = uni ? 4 : 3;
    assert.equal(os.length, k, `Größe (${seed})`);
    assert.equal(pathCount(G, d.options), Math.min(2, drawable), `Pfadplätze bei ${drawable} ziehbaren (${seed})`);
    assert.ok(os.filter(o => o.family === 'wagnis').length <= 1, 'höchstens eine Wagnis-Karte');
    assert.equal(os.filter(o => !G.isPathFamily(o)).length, k - Math.min(2, drawable), 'Rest sind Bonusplätze');
    assert.ok(uni || !os.some(o => o.family === 'technologie'), 'ohne Universität keine Technologie');
    assert.equal(new Set(d.options).size, d.options.length, 'keine doppelte Karte');
    cells[`${Math.min(2, drawable)}/${k}`] = (cells[`${Math.min(2, drawable)}/${k}`] || 0) + 1;
  }
  assert.ok(offers > 900, `Angebote: ${offers}`);
  for (const cell of ['0/3', '0/4', '1/4', '2/4']) assert.ok(cells[cell] > 0, `Feld ${cell} der Tabelle wurde geprüft: ${JSON.stringify(cells)}`);
});

test('Neu ziehen behält die Zahl der Pfadplätze; Bann tauscht nur Bonusplätze', () => {
  for (let seed = 1; seed <= 200; seed++){
    const { G } = tableState(seed);
    const d = newOffer(G); if (!d) continue;
    const n0 = pathCount(G, d.options), len0 = d.options.length;
    G.S.research.done.r_neuziehen = 2; G.S.research.done.r_bann = 2; G.S.research.ver++;
    if (G.rerollsLeft() > 0){
      assert.ok(G.rerollDraft());
      assert.equal(pathCount(G, G.S.pendingDraft.options), n0, `Pfadplätze nach Neu ziehen (${seed})`);
      assert.equal(G.S.pendingDraft.options.length, len0);
    }
    if (G.bansLeft() > 0){
      const i = G.S.pendingDraft.options.findIndex(id => G.canBan(id));
      if (i >= 0){
        assert.ok(G.banOption(i));
        assert.equal(pathCount(G, G.S.pendingDraft.options), n0, `Pfadplätze nach Bann (${seed})`);
        assert.ok(G.S.pendingDraft.options.filter(id => G.OPT[id].family === 'wagnis').length <= 1);
      }
    }
  }
});

test('Nicht gewählte Technologiekarte bleibt im Stapel; gewählte erscheint nicht erneut', () => {
  const { G } = game('karten', 3);
  G.S.material = 1e6; G.build('universitaet');
  G.S.pendingDraft = { level: 1, options: ['eiserneKlingen', 'befestigungskunde'], rerolled: 0 }; G.S.pendingLevels = 1;
  G.chooseDraft(0);
  assert.equal(G.cardTaken('eiserneKlingen'), 1);
  assert.equal(G.optionAvailable(G.OPT.eiserneKlingen), false, 'gewählt: nie wieder');
  assert.equal(G.optionAvailable(G.OPT.befestigungskunde), true, 'nicht gewählt: wieder ziehbar');
});

test('Kartenkennungen sind eindeutig (Bonus- und Pfadkarten)', () => {
  const { G } = game('karten');
  const ids = G.ALL_OPTIONS.map(o => o.id);
  assert.equal(new Set(ids).size, ids.length);
});

/* ---------- Universität als Forschungsstätte (REQ-KP.04) ---------- */
function withUni(seed = 9){
  const g = game('karten', seed), { G } = g;
  G.S.material = 1e6; G.build('universitaet');
  return g;
}
const pickCard = (G, id) => { G.S.pendingDraft = { level: 1, options: [id, 'bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1; return G.chooseDraft(0); };

test('Technologiekarte öffnet genau ihre Forschungen; vorher sind sie gesperrt', () => {
  const { G } = withUni();
  for (const id of ['r_wehrgang', 'r_schiessscharten']) assert.equal(G.researchBlock(id), 'closed', id);
  assert.ok(pickCard(G, 'befestigungskunde'));
  for (const id of ['r_wehrgang', 'r_schiessscharten']) assert.equal(G.researchBlock(id), null, id);
  assert.equal(G.researchBlock('r_eisenwaffen'), 'closed', 'nur die Forschungen der gewählten Karte');
});

test('Pfadforschung gilt nur im Modus karten; im Standard ist sie nicht vorhanden', () => {
  const { G } = game('standard'); G.S.material = 1e6; G.build('universitaet');
  assert.equal(G.researchBlock('r_wehrgang'), 'notInMode');
});

test('Forschung läuft nur bei laufender Spielzeit; Abschluss wirkt und öffnet die Schmiede-Stufe 4', () => {
  const { G } = withUni(); pickCard(G, 'eiserneKlingen'); G.build('schmiede');
  G.S.lvl.qualitaet = 3;
  assert.equal(G.stageSource('qualitaet'), 'r_eisenwaffen', 'Stufe 4 braucht die Forschung');
  assert.equal(G.canBuy('qualitaet'), false);
  assert.ok(G.startResearch('r_eisenwaffen'));
  const a = G.S.research.active[0], t0 = a.t;
  G.S.pendingDraft = { level: 1, options: ['bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1;   // offene Wahl pausiert die Zeit
  for (let i = 0; i < 40; i++) G.tick(0.05);
  assert.equal(a.t, t0, 'Pause: kein Fortschritt');
  G.S.pendingDraft = null; G.S.pendingLevels = 0;
  G.S.sections.forEach(s => { s.hp = 1e9; });
  for (let i = 0; i < 20 * 60 + 5; i++){ G.S.pendingDraft = null; G.S.pendingLevels = 0; G.tick(0.05); }
  assert.equal(G.researchTier('r_eisenwaffen'), 1);
  assert.equal(G.stageSource('qualitaet'), null);
  G.S.material = 1e6; assert.ok(G.buy('qualitaet'), 'Stufe 4 kaufbar');
});

test('Wehrgänge und Schießscharten wirken über die Pipeline der Karten', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  const wall0 = G.sectionMax(1), dmg0 = G.mMul('turretDmg');
  G.S.research.done.r_wehrgang = 1; G.S.research.done.r_schiessscharten = 1; G.S.research.ver++;
  assert.ok(Math.abs(G.sectionMax(1) / wall0 - 1.3) < 1e-9, 'Mauern +30 %');
  assert.ok(Math.abs(G.mMul('repairCd') - 0.7) < 1e-9);
  assert.ok(Math.abs(G.mMul('turretDmg') / dmg0 - 1.3) < 1e-9);
  assert.equal(G.mMul('turretVsRanged'), 2);
});

test('Ein Forschungsplatz nimmt keine zweite Forschung an; mit zweitem Platz laufen beide', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  assert.ok(G.startResearch('r_wehrgang'));
  assert.equal(G.researchBlock('r_schiessscharten'), 'busy');
  G.S.draft.stacks.x = 0; G.S.research.done.r_logistik = 1; G.S.research.done.r_zweiterplatz = 1; G.S.research.ver++;
  assert.equal(G.researchSlots(), 2);
  assert.ok(G.startResearch('r_schiessscharten'));
  assert.equal(G.S.research.active.length, 2);
});

test('Abriss der Universität: Fertiges bleibt wirksam, Laufendes pausiert', () => {
  const { G } = withUni(); pickCard(G, 'befestigungskunde');
  G.S.sections.forEach(s => { s.hp = 1e9; });
  G.S.research.done.r_wehrgang = 1; G.S.research.ver++;
  assert.ok(G.mMul('repairCd') < 1, 'Wirkung der fertigen Forschung');
  assert.ok(G.startResearch('r_schiessscharten'));
  const i = G.S.slots.findIndex(s => s && s.type === 'universitaet');
  G.demolish(i);
  const a = G.S.research.active[0], t0 = a.t;
  for (let i2 = 0; i2 < 100; i2++) G.tick(0.05);
  assert.equal(a.t, t0, 'ohne Universität kein Fortschritt');
  assert.equal(G.researchTier('r_wehrgang'), 1, 'abgeschlossen bleibt');
  assert.ok(G.mMul('repairCd') < 1, 'die Wirkung bleibt');
  G.build('universitaet');
  for (let i2 = 0; i2 < 100; i2++) G.tick(0.05);
  assert.ok(a.t > t0, 'mit neuer Universität geht es weiter');
});

/* ---------- Upgrade-Stufen, Einheitenersatz, neue Einheiten (REQ-KP.05) ---------- */
test('Jede Upgrade-Stufe mit Quelle hat genau eine Quelle; Quartiere (Kaserne-Ausbau) sind ohne Karte kaufbar', () => {
  const { G, C } = game('karten');
  const q = G.pacingKeys();
  for (const [up, list] of Object.entries(q.stufen)){
    assert.ok(C.UPGRADES[up], `Upgrade ${up} existiert`);
    const abs = list.map(e => e.ab);
    assert.equal(new Set(abs).size, abs.length, `${up}: jede Stufe genau eine Quelle`);
    for (const e of list) assert.ok(e.ab >= 1);
  }
  G.S.material = 1e7; G.build('fabrik'); G.build('schmiede'); G.build('kaserne');
  const cap = G.supplyCap();
  assert.ok(G.buy('ausbau'), 'Quartiere: Ausbau der Kaserne ohne Forschung');
  assert.equal(G.supplyCap(), cap + C.KASERNE_SUPPLY_PER_LEVEL, 'Versorgung steigt nur durch den Kauf');
  for (let i = 0; i < 3; i++) assert.ok(G.buy('qualitaet'), `Schmiede Stufe ${i + 1}`);
  assert.equal(G.buy('qualitaet'), false, 'Schmiede-Stufe 4 braucht die Forschung Eisenwaffen');
  G.S.research.done.r_eisenwaffen = 1; G.S.research.ver++;
  assert.ok(G.buy('qualitaet'));
});

test('Neue Einheiten: Reiter und Schildträger erst nach der Forschung, Karte öffnet sie', () => {
  const { G } = withUni(); G.build('kaserne');
  for (const u of ['reiter', 'schild']) assert.equal(G.unitUnlocked(u), false, u);
  assert.equal(G.researchBlock('r_reiter'), 'closed');
  assert.ok(pickCard(G, 'fortgeschritteneTaktiken'));
  assert.equal(G.researchBlock('r_reiter'), null); assert.equal(G.researchBlock('r_schild'), null);
  assert.ok(G.startResearch('r_reiter'));
  G.S.sections.forEach(s => { s.hp = 1e9; });
  for (let i = 0; i < 20 * 80; i++) G.tick(0.05);
  assert.equal(G.researchTier('r_reiter'), 1);
  assert.ok(G.unitUnlocked('reiter') && !G.unitUnlocked('schild'));
  assert.ok(G.spawn('reiter') && G.S.queue.at(-1).type === 'reiter');
  assert.equal(G.researchBlock('r_schildtraeger'), 'notInMode', 'alte Forschung entfällt im Modus karten');
});

test('Eisenwaffen: Einheitenersatz wertet Warteschlange und Feld auf, die Zahl bleibt gleich', () => {
  const { G } = withUni(); G.build('kaserne');
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

/* ---------- Wagnis, Exklusivpfad (REQ-KP.06, KP.07) ---------- */
test('Wagnis-Karten wirken dauerhaft mit Nachteil', () => {
  const { G } = withUni(); G.build('kaserne');
  G.addFormation('p', 1, ['laeufer', 'werfer'], 100);
  const hp0 = G.unitStats('p', 'werfer').hp, d0 = G.mMul('rangedDmg');
  assert.ok(pickCard(G, 'glaskanonen'));
  assert.equal(G.mMul('rangedDmg'), d0 * 2);
  assert.equal(G.unitStats('p', 'werfer').hp, 1, 'Fernkämpfer haben 1 Lebenspunkt');
  assert.equal(G.unitStats('p', 'laeufer').hp > 1, true, 'Nahkämpfer unberührt');
  const g2 = withUni().G; g2.build('kaserne');
  const sup = g2.supplyCap(), m0 = g2.mMul('materialYield');
  assert.ok(pickCard(g2, 'volleAuslastung'));
  assert.equal(g2.mMul('materialYield'), m0 * 0.5);
  assert.ok(g2.supplyCap() > sup, 'Versorgung steigt');
  assert.ok(hp0 > 1);
});

test('Wagnis: höchstens eine je Angebot, erst ab Wahl 5 und nur mit Kaserne', () => {
  const { G } = game('karten', 4); G.S.material = 1e6; G.build('kaserne'); G.S.pfad.choices = 4;
  assert.equal(G.optionAvailable(G.OPT.glaskanonen), true);
  const g2 = game('karten', 4).G; g2.S.pfad.choices = 4;
  assert.equal(g2.optionAvailable(g2.OPT.glaskanonen), false, 'ohne Kaserne');
  const g3 = game('karten', 4).G; g3.S.material = 1e6; g3.build('kaserne'); g3.S.pfad.choices = 3;
  assert.equal(g3.optionAvailable(g3.OPT.glaskanonen), false, 'vor Wahl 5');
});

test('Exklusivpaar: nach Wahl einer Karte erscheint die andere nie wieder; ihre Forschung und Einheiten entfallen', () => {
  for (const [a, b] of [['fortgeschritteneTaktiken', 'ballistik'], ['ballistik', 'fortgeschritteneTaktiken']]){
    const { G } = withUni(); G.S.pfad.choices = 3;
    assert.equal(G.optionAvailable(G.OPT[a]) && G.optionAvailable(G.OPT[b]), true, 'vorher beide ziehbar');
    assert.ok(pickCard(G, a));
    assert.equal(G.optionAvailable(G.OPT[b]), false);
    assert.equal(G.cardExcluded(b), true);
    for (let seed = 1; seed <= 300; seed++){ const g = withUni(seed).G; g.S.draft.stacks[a] = 1; g.S.draft.ver++; g.S.pfad.choices = 5;
      const d = newOffer(g); if (d) assert.ok(!d.options.includes(b), `${b} erscheint nicht (Seed ${seed})`); }
  }
  const { G } = withUni(); G.build('kaserne'); G.S.pfad.choices = 3; pickCard(G, 'ballistik');
  assert.ok(G.startResearch('r_armbrust')); G.rushResearch('r_armbrust');
  assert.ok(G.unitUnlocked('armbrust'));
});

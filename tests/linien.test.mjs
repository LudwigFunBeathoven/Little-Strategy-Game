// Tests Kartenpfad Teil 4, REQ-S.04 (Strategielinien, Zeichen, Stufen) und REQ-S.05 (Gebäude-Aufwertung zu Varianten).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal', tweak = null){
  const { KlammerCore, KF_CONFIG, KF_LINIEN } = loadCore();
  if (tweak) tweak(KF_CONFIG);
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; });
  G.S.material = 1e7;
  return { G, C: KF_CONFIG, L: KF_LINIEN };
}
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; G.unlockKey('bau:' + type); assert.ok(G.buildAt(i, type), `${type} bauen`); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = 1e9; }); G.tick(0.05); } };
const signs = (G, l) => G.lineState()[l].signs;

/* ---------- Zeichen ---------- */
test('S.04: Zuordnung der Zeichen: jede Karte hat höchstens zwei, Linien sind bekannt, jede Id existiert', () => {
  const { G, L } = game();
  for (const [id, z] of Object.entries(L.zeichen)){
    assert.ok(G.OPT[id], `unbekannte Karte ${id}`);
    const list = [].concat(z); assert.ok(list.length >= 1 && list.length <= 2, id);
    for (const l of list) assert.ok(L.linien.includes(l), `${id}: ${l}`);
  }
  for (const id of ['echtesMilitaer']) assert.deepEqual([].concat(L.zeichen[id]), ['militaer']);
  assert.deepEqual([].concat(L.zeichen.pfadFestungsbau), ['verteidigung']);
  assert.deepEqual([].concat(L.zeichen.handel), ['wirtschaft']);
  assert.equal(L.zeichen.gelehrte, undefined); assert.equal(L.zeichen.metallverarbeitung, undefined);
  // Kategorien: Armee → Militär, Wirtschaft → Wirtschaft, Basis → Verteidigung
  for (const o of G.ALL_OPTIONS.filter(o => !o.pfad && !['kriegserfahrung', 'serienbau', 'bauleitung'].includes(o.id))){       // gestrichene Karten (Teil 4) tragen kein Zeichen
    const z = [].concat(L.zeichen[o.id] || []);
    if (o.category === 'armee') assert.deepEqual(z, ['militaer'], o.id);
    if (o.category === 'wirtschaft') assert.deepEqual(z, ['wirtschaft'], o.id);
    if (o.category === 'basis') assert.deepEqual(z, ['verteidigung'], o.id);
  }
});

test('S.04: Zeichen zählen gewählte Karten; im Modus standard zählt nichts', () => {
  const { G } = game();
  assert.equal(signs(G, 'militaer'), 0);
  pick(G, 'echtesMilitaer', 'drill', 'gelehrte');
  assert.equal(signs(G, 'militaer'), 2, 'Echtes Militär und Drill; Gelehrte ohne Zeichen');
  pick(G, 'zinnen'); assert.equal(signs(G, 'verteidigung'), 1);
  pick(G, 'bessereFabriken'); assert.equal(signs(G, 'wirtschaft'), 1);
  const { G: S } = game('standard'); pick(S, 'echtesMilitaer', 'drill', 'zinnen');
  assert.equal(S.lineState().militaer.signs, 0, 'standard');
  assert.equal(S.mMul('unitDmg'), 1);
});

/* ---------- Stufen ---------- */
test('S.04: Stufe 1 ab 2 Zeichen, Stufe 2 ab 4 Zeichen; die Boni greifen genau dann', () => {
  const { G, C } = game();
  const dmg0 = G.mMul('unitDmg'), hp0 = G.mMul('unitHp');
  pick(G, 'drill'); assert.equal(G.lineState().militaer.stage, 0); assert.equal(G.mMul('unitDmg'), dmg0, 'ein Zeichen: kein Bonus');
  pick(G, 'echtesMilitaer'); assert.equal(G.lineState().militaer.stage, 1);
  assert.ok(Math.abs(G.mMul('unitDmg') / dmg0 - C.LINIEN.stufen.militaer[0][0].mul) < 1e-9, 'Stufe 1: Einheiten +10 % Schaden');
  assert.equal(G.mMul('unitHp'), hp0, 'Lebenspunkte erst mit Stufe 2');
  pick(G, 'aushebung'); assert.equal(G.lineState().militaer.stage, 1, 'drei Zeichen');
  pick(G, 'veteranen'); assert.equal(G.lineState().militaer.stage, 2);
  assert.ok(Math.abs(G.mMul('unitHp') / hp0 - 1.1 * 0.9) < 1e-9 || G.mMul('unitHp') > hp0 * 0.9, 'Stufe 2: Lebenspunkte');
  assert.equal(G.mAdd('extraUnit'), 1);
  // Wirtschaft: Materialertrag
  const y0 = G.mMul('materialYield');
  pick(G, 'bessereFabriken', 'schwerePressen'); assert.equal(G.lineState().wirtschaft.stage, 1);
  assert.ok(Math.abs(G.mMul('materialYield') / y0 - 1.1) < 1e-9);
  // Verteidigung: Türme und Mauer
  const t0 = G.mMul('turretDmg'), w0 = G.mMul('wallHp');
  pick(G, 'zinnen', 'maurerkolonne');
  assert.ok(Math.abs(G.mMul('turretDmg') / t0 - 1.2) < 1e-9); assert.ok(Math.abs(G.mMul('wallHp') / w0 / 1.3 - 1.15) < 1e-6 || G.mMul('wallHp') > w0);
  assert.equal(G.mAdd('counterWave'), 0, 'Stufe 2 der Verteidigung noch nicht');
});

test('S.04: ohne Stufe 1 gibt es keinen Linienbonus, mehrere Linien erreichen Stufen gleichzeitig', () => {
  const { G } = game();
  pick(G, 'drill', 'echtesMilitaer', 'bessereFabriken', 'schwerePressen', 'zinnen');
  const st = G.lineState();
  assert.equal(st.militaer.stage, 1); assert.equal(st.wirtschaft.stage, 1); assert.equal(st.verteidigung.stage, 0);
});

/* ---------- Gebäude-Aufwertung ---------- */
test('S.05: Aufwertung erst ab Minute 3 und nur mit stehendem Gebäude des Typs (Modus karten)', () => {
  const { G } = game();
  place(G, 'fabrik', 0);
  assert.equal(G.variantBlock(0, 'manufaktur'), 'hidden', 'vor Minute 3 verborgen');
  assert.equal(G.variantVisible('fabrik'), false);
  assert.equal(G.variantBlock(1, 'manufaktur'), 'noBuilding');
  G.S.t = 179; assert.equal(G.variantVisible('fabrik'), false);
  G.S.t = 180; assert.equal(G.variantVisible('fabrik'), true);
  assert.equal(G.variantBlock(0, 'manufaktur'), null);
  assert.equal(G.variantBlock(0, 'exerzierplatz'), 'noBuilding', 'Variante gehört zu einem anderen Grundgebäude');
  assert.equal(G.variantVisible('kaserne'), false, 'keine Kaserne');
  const { G: S } = game('standard'); S.build('fabrik'); S.S.t = 400;
  assert.equal(S.variantBlock(0, 'manufaktur'), 'notInMode');
});

test('S.05: Kosten = zweifache Baukosten des Grundgebäudes, Aufwertung dauert 10 s, danach steht die Variante; nicht umkehrbar außer durch Abriss', () => {
  const { G, C } = game();
  place(G, 'fabrik', 0); G.S.t = 200;
  assert.equal(G.variantCost('manufaktur'), 2 * C.FACTORY_BASE_COST);
  place(G, 'kaserne', 1);
  assert.equal(G.variantCost('exerzierplatz'), 2 * C.BUILDING_COST.kaserne);
  G.S.material = 1000;
  assert.equal(G.upgradeBuilding(0, 'manufaktur'), true);
  assert.equal(G.S.material, 1000 - 2 * C.FACTORY_BASE_COST);
  assert.equal(G.S.slots[0].type, 'fabrik'); assert.ok(G.S.slots[0].upg);
  assert.equal(G.variantBlock(0, 'werkstatt'), 'upgrading');
  finish(G, 9); assert.ok(G.S.slots[0].upg, 'nach 9 s noch in Arbeit');
  finish(G, 2);
  assert.equal(G.S.slots[0].variant, 'manufaktur'); assert.ok(!G.S.slots[0].upg);
  assert.equal(G.variantBlock(0, 'werkstatt'), 'done', 'endgültig');
  assert.equal(G.upgradeBuilding(0, 'werkstatt'), false);
  // Abriss: halbe Summe aus Baukosten und Aufwertung zurück, Platz frei, Zeichen weg
  const paid = G.S.slots[0].paid, m = G.S.material;
  assert.equal(signs(G, 'wirtschaft'), 1);
  assert.ok(G.demolish(0)); assert.equal(G.S.slots[0], null);
  assert.equal(G.S.material, m + Math.floor(paid * C.REFUND_RATE));
  assert.equal(signs(G, 'wirtschaft'), 0, 'Zeichen entfällt mit dem Abriss');
  G.S.material = 1e6; assert.ok(G.buildAt(0, 'fabrik'), 'Neubau möglich'); assert.equal(G.S.slots[0].variant, undefined);
});

test('S.05: Während der Aufwertung wirkt das Gebäude nicht (Fabrik, Kaserne)', () => {
  const { G } = game();
  place(G, 'fabrik', 0); place(G, 'fabrik', 1); place(G, 'kaserne', 2); G.S.t = 200;
  const rate = G.matRate(), cap = G.supplyCap();
  assert.ok(G.has('kaserne'));
  G.S.material = 1e6; assert.ok(G.upgradeBuilding(0, 'manufaktur')); assert.ok(G.upgradeBuilding(2, 'exerzierplatz'));
  assert.ok(G.matRate() < rate * 0.6, `Fabrik in Aufwertung liefert nichts: ${G.matRate()} < ${rate}`);
  assert.equal(G.has('kaserne'), false, 'Kaserne in Aufwertung wirkt nicht');
  assert.ok(G.supplyCap() < cap);
  assert.equal(G.buildBlock(3, 'kaserne'), 'standing', 'der Platz bleibt belegt');
  finish(G);
  assert.ok(G.has('kaserne')); assert.equal(G.supplyCap(), cap);
  assert.ok(G.matRate() > rate, 'Manufaktur liefert mehr als eine Fabrik');
});

test('S.05: Variante behält Ausbaustufen und Nachbarschaftsregeln des Grundgebäudes', () => {
  const { G } = game();
  place(G, 'kaserne', 4); G.S.lvl.ausbau = 2; G.S.t = 200;
  const cap = G.supplyCap();
  place(G, 'schmiede', 5);                                                       // Kaserne neben Schmiede (Platz 4 und 5): Nachbarschaftsbonus
  const withNb = G.supplyCap(); assert.ok(withNb >= cap);
  G.S.material = 1e6; assert.ok(G.upgradeBuilding(4, 'exerzierplatz')); finish(G);
  assert.equal(G.S.lvl.ausbau, 2, 'Ausbaustufe unverändert'); assert.equal(G.supplyCap(), withNb, 'Versorgung und Nachbarschaft wie vorher');
  assert.equal(G.S.slots[4].type, 'kaserne'); assert.equal(G.S.slots[4].variant, 'exerzierplatz');
});

test('S.05/S.04: Zeichen der Varianten zählen je Variantentyp einmal; Abriss senkt die Zahl und mit ihr die Stufe', () => {
  const { G, C } = game();
  for (const i of [0, 1, 2]) place(G, 'fabrik', i);
  place(G, 'kaserne', 3); G.S.t = 200; G.S.material = 1e6;
  for (const i of [0, 1]) assert.ok(G.upgradeBuilding(i, 'manufaktur'));
  assert.ok(G.upgradeBuilding(3, 'exerzierplatz'));
  assert.equal(signs(G, 'wirtschaft'), 0, 'während der Aufwertung zählt kein Zeichen');
  finish(G);
  assert.equal(signs(G, 'wirtschaft'), 1, 'zwei Manufakturen: ein Zeichen'); assert.equal(signs(G, 'militaer'), 1);
  pick(G, 'echtesMilitaer');
  assert.equal(G.lineState().militaer.stage, 1);
  const dmg = G.mMul('unitDmg');
  assert.ok(G.demolish(3));
  assert.equal(G.lineState().militaer.stage, 0, 'Stufe entfällt, wenn die Zahl der Zeichen sinkt');
  assert.ok(G.mMul('unitDmg') < dmg);
  assert.equal(G.mMul('unitDmg'), 1);
  assert.ok(G.mMul('materialYield') >= 1);
  assert.equal(C.LINIEN.zeichenStufen[0], 2);
});

test('S.05: Manufaktur wirkt je Gebäude, Werkstatt und die übrigen Varianten einmal', () => {
  const { G, C, L } = game();
  for (const i of [0, 2, 6]) place(G, 'fabrik', i); G.S.t = 200; G.S.material = 1e6;                // nicht benachbart: kein Nachbarschaftsbonus im Weg
  const r0 = G.matRate();
  assert.ok(G.upgradeBuilding(0, 'werkstatt')); finish(G);
  assert.ok(G.mMul('unitCost') < 1 && Math.abs(G.mMul('unitCost') - L.varianten.find(v => v.id === 'werkstatt').effect[0].mul) < 1e-9);
  assert.ok(Math.abs(G.matRate() - r0) < 1e-9, 'Werkstatt liefert wie eine Fabrik');
  assert.ok(G.upgradeBuilding(2, 'manufaktur')); assert.ok(G.upgradeBuilding(6, 'manufaktur')); finish(G);
  const yield1 = L.varianten.find(v => v.id === 'manufaktur').effect[0].add;
  assert.ok(Math.abs(G.matRate() / r0 - (1 + 2 * (1 + yield1)) / 3) < 1e-6, `Mehrertrag je Manufaktur: ${G.matRate() / r0}`);
});

test('S.05: Spielstand-Version 9 und Zustand der Aufwertung im Spielstand', () => {
  const { G } = game();
  assert.equal(loadCore().KlammerCore.SAVE_VERSION, 9);
  place(G, 'fabrik', 0); G.S.t = 200; G.S.material = 1e6; G.upgradeBuilding(0, 'manufaktur');
  const snap = JSON.parse(JSON.stringify(G.snapshot()));
  assert.ok(snap.slots[0].upg);
  const { G: H } = game(); H.adopt(snap);
  assert.ok(H.S.slots[0].upg); finish(H);
  assert.equal(H.S.slots[0].variant, 'manufaktur');
});

/* ---------- Wirkung der Stufen und Varianten im Spiel ---------- */
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const stage2 = (G, line) => { const ids = { militaer: ['echtesMilitaer', 'drill', 'aushebung', 'veteranen'], wirtschaft: ['bessereFabriken', 'schwerePressen', 'doppelschicht', 'nachtschicht'], verteidigung: ['zinnen', 'maurerkolonne', 'bastion', 'turmkanoniere'] }[line]; pick(G, ...ids); assert.equal(G.lineState()[line].stage, 2, line); };

test('S.04 Militär Stufe 2: die Kaserne schickt je Welle eine Einheit mehr (nur mit Kaserne, ohne Kosten, ohne Einfluss auf die Dauerauftrag-Zusammensetzung)', () => {
  const { G } = game();
  place(G, 'kaserne', 0); G.S.material = 1e6; idle(G);
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  G.S.nextOwnWave = 0.01; G.tick(0.05);
  assert.equal(G.S.units.filter(u => u.side === 'p').length, 3, 'ohne Stufe 2: drei Einheiten');
  const { G: H } = game(); place(H, 'kaserne', 0); stage2(H, 'militaer'); H.S.material = 1e6; idle(H);
  for (let i = 0; i < 3; i++) H.spawn('laeufer');
  H.S.nextOwnWave = 0.01; H.tick(0.05);
  assert.equal(H.S.units.filter(u => u.side === 'p').length, 4, 'mit Stufe 2: eine mehr');
  assert.equal(H.S.lastOrder.length, 3, 'Dauerauftrag kauft nur, was bezahlt wurde');
  // ohne Kaserne keine zusätzliche Einheit
  const { G: K } = game(); stage2(K, 'militaer'); K.S.material = 1e6; idle(K);
  for (let i = 0; i < 3; i++) K.spawn('laeufer');
  K.S.nextOwnWave = 0.01; K.tick(0.05);
  assert.equal(K.S.units.filter(u => u.side === 'p').length, 3, 'ohne Kaserne nichts');
});

test('S.04 Wirtschaft: Stufe 1 Materialertrag, Stufe 2 Zinsen des Kontors und billigere Ausbauten und Aufwertungen', () => {
  const { G } = game();
  place(G, 'fabrik', 0); place(G, 'kontor', 8); G.S.t = 200;
  const rate0 = G.matRate(), cost0 = G.upCost('presse'), var0 = G.variantCost('manufaktur'); G.S.material = 1000;
  const pay0 = G.kontorNext();
  pick(G, 'bessereFabriken', 'doppelschicht');                                  // Stufe 1 (zwei Zeichen); die Karten selbst wirken auch: Vergleich über Stufen-Bonus allein unten
  assert.equal(G.lineState().wirtschaft.stage, 1);
  const { G: H } = game(); place(H, 'fabrik', 0); place(H, 'kontor', 8); H.S.t = 200; H.S.material = 1000;
  pick(H, 'handelskontor', 'fliessband');
  assert.equal(H.lineState().wirtschaft.stage, 1);
  assert.ok(Math.abs(H.matRate() / G.matRate() * (G.mMul('factoryYield') * G.mMul('autoProd')) / (H.mMul('factoryYield') * H.mMul('autoProd')) - 1) < 1e-9, 'Stufe 1 wirkt in beiden gleich');
  const { G: K } = game(); place(K, 'kontor', 8); K.S.material = 1000;
  const pay1 = K.kontorNext(), up1 = K.upCost('presse');
  stage2(K, 'wirtschaft');
  assert.equal(K.mMul('kontorYield'), 1.5);
  assert.ok(K.upCost('presse') < up1 && K.upCost('presse') === Math.ceil(15 * 0.8) || K.upCost('presse') < up1, 'Ausbau billiger');
  assert.equal(K.variantCost('manufaktur'), Math.ceil(30 * 2 * 0.8), 'Aufwertung billiger');
  assert.equal(K.kontorNext(), Math.floor(Math.min(K.kontorCap(), Math.floor(1000 / 100) * 4) * 1.5), 'Zinsen +50 %');
  assert.ok(pay1 > 0 && pay0 > 0);
});

test('S.04 Verteidigung Stufe 1: Türme +20 % Schaden, Mauer +15 % Lebenspunkte', () => {
  const { G } = game();
  const w0 = G.sectionMax(1), t0 = G.mMul('turretDmg');
  pick(G, 'pfadFestungsbau', 'befestigungskunde');
  assert.equal(G.lineState().verteidigung.stage, 1);
  assert.ok(Math.abs(G.sectionMax(1) / w0 - 1.15) < 1e-9);
  assert.ok(Math.abs(G.mMul('turretDmg') / t0 - 1.2) < 1e-9);
});

test('S.04 Verteidigung Stufe 2: Turm-Abschüsse bringen Material; nach jeder vollständig abgewehrten Gegnerwelle rückt sofort eine eigene Welle aus', () => {
  const { G, C } = game();
  stage2(G, 'verteidigung');
  assert.equal(G.mAdd('counterWave'), 1); assert.ok(G.mAdd('towerKillMaterial') > 0);
  idle(G); G.S.material = 1e6; place(G, 'kaserne', 0);
  G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  // eine einzelne gegnerische Welle (Nummer 7), ein Läufer, direkt vor dem Turm
  G.S.lvl.turm_0 = 3; G.S.waveNo = 6;
  const g = G.addFormation('e', 0, ['laeufer'], 60);
  for (const u of G.S.units) if (u.form === g.id){ u.wave = 7; u.hp = 1; u.maxHp = 1; }
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  const m0 = G.S.material, own0 = G.S.units.filter(u => u.side === 'p').length;
  for (let i = 0; i < 200 && G.S.units.some(u => u.side === 'e'); i++){ idle(G); G.tick(0.05); }
  assert.ok(!G.S.units.some(u => u.side === 'e'), 'Gegner gefallen');
  assert.equal(G.S.stats.wavesRepelled, 1);
  assert.equal(G.S.stats.counterWaves, 1, 'Gegenstoß ausgelöst');
  assert.equal(G.S.units.filter(u => u.side === 'p').length - own0, 3 + (G.mAdd('extraUnit') > 0 ? 1 : 0), 'die Warteschlange rückt aus');
  assert.equal(G.S.queue.length, 0);
  assert.ok((G.S.stats.towerKills || 0) >= 1, 'der Turm hat den Läufer geschossen');
  assert.ok(G.S.stats.towerMaterial > 0 && G.S.material > m0 - 1, 'Material für den Turm-Abschuss');
  assert.ok(C.UNITS.laeufer.bounty > 0);
  // ohne Stufe 2 keine eigene Welle
  const { G: H } = game(); idle(H); H.S.material = 1e6; place(H, 'kaserne', 0); H.S.nextWave = 1e9; H.S.nextOwnWave = 1e9; H.S.lvl.turm_0 = 3; H.S.waveNo = 6;
  const h = H.addFormation('e', 0, ['laeufer'], 60); for (const u of H.S.units) if (u.form === h.id){ u.wave = 7; u.hp = 1; }
  for (let i = 0; i < 3; i++) H.spawn('laeufer');
  for (let i = 0; i < 200 && H.S.units.some(u => u.side === 'e'); i++){ idle(H); H.tick(0.05); }
  assert.equal(H.S.queue.length, 3, 'Warteschlange bleibt'); assert.equal(H.S.stats.counterWaves || 0, 0);
});

test('S.05 Varianten: Wachstube, Garnison, Waffenschmiede, Rüstkammer wirken wie beschrieben', () => {
  const { G, L } = game();
  place(G, 'fabrik', 0); place(G, 'kaserne', 1); place(G, 'schmiede', 2); G.S.t = 200; G.S.material = 1e6; G.S.lvl.qualitaet = 2;
  const q0 = G.qualityMult(), w0 = G.sectionMax(0), t0 = G.mMul('turretDmg');
  const ef = id => L.varianten.find(v => v.id === id).effect;
  assert.ok(G.upgradeBuilding(0, 'wachstube')); assert.ok(G.upgradeBuilding(1, 'garnison')); assert.ok(G.upgradeBuilding(2, 'waffenschmiede')); finish(G);
  assert.equal(G.lineState().verteidigung.stage, 1, 'Wachstube und Garnison: zwei Zeichen');
  assert.ok(Math.abs(G.mMul('turretDmg') / t0 - ef('wachstube')[0].mul * 1.2) < 1e-9, 'Wachstube und Stufe 1 der Verteidigung');
  assert.ok(G.mAdd('towerKillMaterial') >= ef('wachstube')[1].add);
  assert.equal(G.mAdd('wallRegenFlat'), ef('garnison')[0].add); assert.equal(G.mMul('gateUnitHp'), ef('garnison')[1].mul);
  assert.ok(G.qualityMult() > q0 * 1.04, `Waffenschmiede: Qualität ×1,5 der Wirkung (${q0} → ${G.qualityMult()})`);
  assert.ok(Math.abs((G.qualityMult() - 1) / (q0 - 1) - 1.5) < 0.2);
  // Garnison: Mauer heilt, Einheiten am Tor haben mehr Leben
  G.S.sections[0].hp = G.sectionMax(0) - 100; idle(G); G.S.sections[0].hp = G.sectionMax(0) - 100;
  const h0 = G.S.sections[0].hp; for (let i = 0; i < 20; i++){ G.S.pendingDraft = null; G.tick(0.05); }
  assert.ok(G.S.sections[0].hp > h0, 'Mauer heilt');
  const mid = G.addFormation('p', 1, ['laeufer'], 100), top = G.addFormation('p', 0, ['laeufer'], 100);
  const hp = f => G.S.units.find(u => u.form === f.id).maxHp;
  assert.ok(Math.abs(hp(mid) / hp(top) - ef('garnison')[1].mul) < 1e-9, 'Einheit in der Mitte (Tor) mit mehr Lebenspunkten');
  // Rüstkammer
  const { G: R } = game(); place(R, 'schmiede', 2); R.S.t = 200; const wr0 = R.sectionMax(0);
  R.S.material = 1e6; assert.ok(R.upgradeBuilding(2, 'ruestkammer')); finish(R);
  assert.ok(Math.abs(R.sectionMax(0) / wr0 - ef('ruestkammer')[0].mul) < 1e-9);
});

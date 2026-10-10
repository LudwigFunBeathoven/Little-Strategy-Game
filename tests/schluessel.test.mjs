// Tests Kartenpfad Teil 4, REQ-S.06 (Schlüsselkarten) und REQ-S.07 (Angebotsausgleich).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal'){
  const { KlammerCore, KF_CONFIG, KF_LINIEN } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7;
  return { G, C: KF_CONFIG, L: KF_LINIEN };
}
const KEYS = ['drillmeister', 'vorhut', 'handelsnetz', 'ruecklage', 'bollwerk', 'gegenstoss'];
const LINE = { drillmeister: 'militaer', vorhut: 'militaer', handelsnetz: 'wirtschaft', ruecklage: 'wirtschaft', bollwerk: 'verteidigung', gegenstoss: 'verteidigung' };
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; G.unlockKey('bau:' + type); assert.ok(G.buildAt(i, type), type); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const finish = (G, secs = 11) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.tick(0.05); } };
const offered = (G, id) => G.optionAvailable(G.OPT[id]);

test('S.06: sechs Schlüsselkarten, zwei je Linie, je zwei Zeichen der Linie, selten oder legendär, eine Stufe, kein Nachteil', () => {
  const { G, L } = game();
  const keys = G.ALL_OPTIONS.filter(o => o.schluessel);
  assert.equal(JSON.stringify(keys.map(o => o.id).sort()), JSON.stringify([...KEYS].sort()));
  for (const l of L.linien) assert.equal(keys.filter(o => o.schluessel === l).length, 2, l);
  for (const o of keys){
    assert.deepEqual([].concat(L.zeichen[o.id]), [o.schluessel, o.schluessel], `${o.id}: zwei Zeichen`);
    assert.ok(['rare', 'legendary'].includes(o.rarity), o.id);
    assert.equal(o.tiers.length, 1); assert.ok(!o.tiers[0].drawback, `${o.id} ohne Nachteil`);
    assert.equal(o.abWahl, 3);
    assert.equal(LINE[o.id], o.schluessel);
  }
});

test('S.06: Schlüsselkarten erscheinen erst ab Wahl 3, nur im Modus karten und nur mit Wirkung', () => {
  const { G } = game();
  place(G, 'kaserne', 0); place(G, 'kontor', 1); G.S.lvl.turm_0 = 1; G.S.level = 5;
  for (const i of [2, 3]) place(G, 'fabrik', i);
  G.S.t = 200; for (const i of [2, 3]) G.S.slots[i].variant = 'manufaktur'; G.S.slotVer++;
  G.S.slots[0].variant = 'exerzierplatz'; G.S.slotVer++;
  G.S.pfad.choices = 1;
  for (const id of KEYS) assert.equal(offered(G, id), false, `${id} vor Wahl 3`);
  G.S.pfad.choices = 2;
  for (const id of KEYS) assert.equal(offered(G, id), true, `${id} ab Wahl 3 mit Wirkung`);
  const { G: S } = game('standard'); S.S.pfad.choices = 5; place(S, 'kaserne', 0);
  for (const id of KEYS) assert.equal(S.optionAvailable(S.OPT[id]), false, `${id} im Standardmodus`);
  // ohne Wirkung nicht angeboten
  const { G: H } = game(); H.S.pfad.choices = 4; H.S.level = 5;
  for (const id of KEYS) assert.equal(offered(H, id), id === 'gegenstoss' ? false : false, `${id} ohne Voraussetzung (Kaserne, Kontor, Variante, Turm)`);
  place(H, 'kaserne', 0); assert.equal(offered(H, 'vorhut'), true); assert.equal(offered(H, 'gegenstoss'), true); assert.equal(offered(H, 'drillmeister'), false);
  place(H, 'kontor', 1); assert.equal(offered(H, 'ruecklage'), true);
  assert.equal(offered(H, 'handelsnetz'), false);
  assert.equal(offered(H, 'bollwerk'), false, 'kein Turm');
  H.S.lvl.turm_0 = 1; assert.equal(offered(H, 'bollwerk'), true);
});

test('S.06 Drillmeister: mit Exerzierplatz starten die Einheiten mit der nächsten Schmiede-Stufe', () => {
  const { G, C } = game();
  place(G, 'kaserne', 0); place(G, 'schmiede', 5); G.S.t = 200; G.S.lvl.qualitaet = 0;
  pick(G, 'drillmeister');
  assert.equal(G.qualityMult(), 1, 'ohne Exerzierplatz keine Wirkung');
  G.S.slots[0].variant = 'exerzierplatz'; G.S.slotVer++;
  assert.ok(Math.abs(G.qualityMult() - (1 + C.FX_QUALITAET)) < 1e-9, 'Stufe 1 der Schmiede ohne Schmiede');
  G.S.lvl.qualitaet = 2;
  assert.ok(Math.abs(G.qualityMult() - Math.pow(1 + C.FX_QUALITAET, 3)) < 1e-9, 'nächste Stufe: 3 statt 2');
  const hp = G.addFormation('p', 0, ['laeufer'], 100); assert.ok(G.S.units.find(u => u.form === hp.id).maxHp > 30 * 1.1);
});

test('S.06 Vorhut: jede eigene Welle rückt mit zwei zusätzlichen Läufern aus', () => {
  const { G } = game(); place(G, 'kaserne', 0); idle(G);
  pick(G, 'vorhut');
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  G.S.nextOwnWave = 0.01; G.tick(0.05);
  assert.equal(G.S.units.filter(u => u.side === 'p').length, 5, '3 gekaufte plus 2 zusätzliche');
  assert.equal(G.S.units.filter(u => u.side === 'p' && u.type === 'laeufer').length, 5);
  assert.equal(G.S.lastOrder.length, 3);
});

test('S.06 Handelsnetz: jede Manufaktur erhöht den Ertrag aller anderen, mit Deckel', () => {
  const { G, C } = game();
  for (const i of [0, 2, 6, 8]) place(G, 'fabrik', i); G.S.t = 200; G.S.material = 1e6;
  for (const i of [0, 2]) assert.ok(G.upgradeBuilding(i, 'manufaktur')); finish(G);
  const r2 = G.matRate();
  pick(G, 'handelsnetz');
  // zwei Manufakturen: je +10 % durch die andere
  const per = G.factoryRate();
  const expect = (a, n) => per * ((a * (1 + 0.4 + Math.min(C.LINIEN.schluessel.handelsnetzDeckel, 0.1 * (a - 1)))) + n);
  assert.ok(Math.abs(G.matRate() - expect(2, 2)) < 1e-6, `Manufakturen mit Netz: ${G.matRate()} vs ${expect(2, 2)}`);
  assert.ok(G.matRate() > r2);
  G.S.material = 1e6; for (const i of [6, 8]) assert.ok(G.upgradeBuilding(i, 'manufaktur')); finish(G);
  assert.ok(Math.abs(G.matRate() - expect(4, 0)) < 1e-6, 'vier Manufakturen: Zuschlag je 30 %');
  // Deckel
  const { G: H } = game(); for (let i = 0; i < 9; i++) place(H, 'fabrik', i); H.S.t = 200; H.S.material = 1e7;
  for (let i = 0; i < 9; i++) assert.ok(H.upgradeBuilding(i, 'manufaktur')); finish(H, 12);
  pick(H, 'handelsnetz');
  const wantCap = 1 + 0.4 + C.LINIEN.schluessel.handelsnetzDeckel;
  const sum = H.S.slots.reduce((a, sl, i) => a + (sl.variant === 'manufaktur' ? (1 + H.neighborValue(i, 'fabrik')) * wantCap : 0), 0);
  assert.ok(Math.abs(H.matRate() - H.factoryRate() * sum) < 1e-6, 'neun Manufakturen: der Zuschlag steht am Deckel');
});

test('S.06 Rücklage: der Zinsdeckel des Kontors wächst mit jeder Kartenwahl', () => {
  const { G } = game(); place(G, 'kontor', 0);
  const cap0 = G.kontorCap();
  pick(G, 'ruecklage'); G.S.pfad.choices = 5;
  assert.equal(G.kontorCap(), Math.round(cap0 * (1 + 0.15 * 5)));
  G.S.pfad.choices = 10; assert.ok(G.kontorCap() > cap0 * 2);
});

test('S.06 Bollwerk: Türme +50 % Schaden, Abschüsse durch Türme bringen doppelte EP', () => {
  const { G } = game();
  G.S.lvl.turm_0 = 3; const t0 = G.turretDmg(0);
  pick(G, 'bollwerk');
  assert.ok(Math.abs(G.turretDmg(0) / t0 - 1.5 * 1.2) < 1e-9, 'Bollwerk ×1,5 und Stufe 1 der Verteidigung (zwei Zeichen) ×1,2');
  const kill = x => { const f = G.addFormation('e', 0, ['laeufer'], 60); for (const u of G.S.units) if (u.form === f.id){ u.hp = 1; } const xp0 = G.S.xpTotal; for (let i = 0; i < 100 && G.S.units.some(u => u.side === 'e'); i++){ idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); } return G.S.xpTotal - xp0; };
  const { G: H } = game(); H.S.lvl.turm_0 = 3;
  const xpPlain = (() => { const f = H.addFormation('e', 0, ['laeufer'], 60); for (const u of H.S.units) if (u.form === f.id) u.hp = 1; const xp0 = H.S.xpTotal; for (let i = 0; i < 100 && H.S.units.some(u => u.side === 'e'); i++){ idle(H); H.S.nextWave = 1e9; H.S.nextOwnWave = 1e9; H.tick(0.05); } return H.S.xpTotal - xp0; })();
  const xpBoost = kill();
  assert.ok(xpPlain > 0); assert.ok(Math.abs(xpBoost / xpPlain - 2) < 1e-9, `doppelte EP: ${xpBoost} vs ${xpPlain}`);
});

test('S.06 Gegenstoß: nach jeder abgewehrten Gegnerwelle rückt eine eigene Welle mit +30 % Stärke aus', () => {
  const { G } = game(); place(G, 'kaserne', 0); idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.S.lvl.turm_0 = 3; G.S.waveNo = 4;
  pick(G, 'gegenstoss');
  const f = G.addFormation('e', 0, ['laeufer'], 60); for (const u of G.S.units) if (u.form === f.id){ u.wave = 5; u.hp = 1; }
  for (let i = 0; i < 3; i++) G.spawn('laeufer');
  for (let i = 0; i < 200 && G.S.units.some(u => u.side === 'e'); i++){ idle(G); G.tick(0.05); }
  assert.equal(G.S.stats.counterWaves, 1);
  const mine = G.S.units.filter(u => u.side === 'p');
  assert.equal(mine.length, 3);
  const base = G.unitStats('p', 'laeufer');
  for (const u of mine){ assert.ok(Math.abs(u.dmg / base.dmg - 1.3) < 1e-6, 'Schaden +30 %'); assert.ok(Math.abs(u.maxHp / base.hp - 1.3) < 1e-6, 'Leben +30 %'); }
});

/* ---------- Angebotsausgleich ---------- */
function richState(seed){
  const { G, C } = game('karten', seed);
  place(G, 'kaserne', 0); place(G, 'kontor', 1); G.S.lvl.turm_0 = 1; G.S.level = 5;
  for (const i of [2, 3]) place(G, 'fabrik', i);
  G.S.t = 200; for (const i of [2, 3]) G.S.slots[i].variant = 'manufaktur'; G.S.slots[0].variant = 'exerzierplatz'; G.S.slotVer++;
  return { G, C };
}
test('S.07: ab Wahl 3 enthält spätestens jedes dritte Angebot eine Schlüsselkarte (über viele Partien und Wahlen)', () => {
  let maxGap = 0, offers = 0, withKey = 0;
  for (let seed = 1; seed <= 40; seed++){
    const { G } = richState(seed);
    let gap = 0;
    for (let n = 1; n <= 14; n++){
      G.S.pfad.choices = n - 1; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = -1e9;
      G.offerDraft();
      const ids = G.S.pendingDraft.options, key = ids.some(id => G.OPT[id].schluessel);
      if (n < 3){ assert.ok(!key, `Wahl ${n}: keine Schlüsselkarte vor Wahl 3`); continue; }
      offers++; if (key){ withKey++; gap = 0; } else { gap++; maxGap = Math.max(maxGap, gap); }
      assert.ok(gap <= 2, `Seed ${seed}, Wahl ${n}: ${gap} Angebote in Folge ohne Schlüsselkarte`);
      G.S.draft.stacks[ids[0]] = 0;                                   // nichts wählen, nur Angebote ziehen
    }
  }
  assert.ok(maxGap <= 2); assert.ok(withKey / offers > 0.3, `Anteil der Angebote mit Schlüsselkarte ${(withKey / offers).toFixed(2)}`);
});

test('S.07: ohne Schlüsselkarte mit Wirkung kein Zwang; der Zähler läuft ab Wahl 3', () => {
  const { G } = game();
  G.S.pfad.choices = 2; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.level = 5; place(G, 'fabrik', 0);
  G.offerDraft();
  assert.ok(!G.S.pendingDraft.options.some(id => G.OPT[id].schluessel));
  assert.equal(G.S.pfad.sinceKey, 1);
  G.S.pendingDraft = null; G.S.pfad.choices = 3; G.offerDraft(); assert.equal(G.S.pfad.sinceKey, 2);
  assert.equal(G.S.stats.keyOffers, undefined);
});

test('S.07: führt der Spieler eine Linie, zieht ihre Schlüsselkarte mit höherem Gewicht', () => {
  const count = lead => {
    let hits = 0, n = 0;
    for (let seed = 1; seed <= 150; seed++){
      const { G } = richState(seed);
      if (lead === 'verteidigung') pick(G, 'zinnen', 'maurerkolonne');
      if (lead === 'wirtschaft') pick(G, 'bessereFabriken', 'schwerePressen');
      G.S.pfad.choices = 6; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.sinceKey = 2; G.S.pfad.lastPickT = -1e9;
      G.offerDraft();
      for (const id of G.S.pendingDraft.options) if (G.OPT[id].schluessel === 'verteidigung') hits++;
      n++;
    }
    return hits / n;
  };
  assert.ok(count('verteidigung') > count(null) * 1.3, `mit Führung der Verteidigung häufiger: ${count('verteidigung')} vs ${count(null)}`);
});

test('S.07: Bann einer fälligen Schlüsselkarte ersetzt sie durch eine andere Schlüsselkarte', () => {
  const { G } = richState(3);
  G.S.pfad.choices = 6; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.sinceKey = 2; G.S.pfad.lastPickT = -1e9;
  G.offerDraft();
  const i = G.S.pendingDraft.options.findIndex(id => G.OPT[id].schluessel);
  assert.ok(i >= 0);
  G.S.research.done.r_bann = 1; G.S.research.ver++;
  const only = G.S.pendingDraft.options.filter(id => G.OPT[id].schluessel).length === 1;
  if (only){ assert.ok(G.banOption(i)); assert.ok(G.S.pendingDraft.options.some(id => G.OPT[id].schluessel), 'wieder eine Schlüsselkarte im Angebot'); }
});

// Tests Kartenpfad Teil 6, REQ-K6.03: Kategorien und Synergiekarten (Zähler, Verstärker, Brücken), Angebotsgewichtung, Pool.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadI18n } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 7, diff = 'normal'){
  const core = loadCore();
  const G = core.KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  if (pacing === 'karten'){ G.S.haus = null; G.S.slots[4] = null; }       // Teil 7: diese Tests prüfen Regeln ohne Haupthaus (alle neun Plätze frei, keine Obergrenze für Fabriken; tests/haus7.test.mjs prüft das Haupthaus)
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: core.KF_CONFIG, core };
}
const setTier = (G, id, n) => { G.S.draft.stacks[id] = n; G.S.draft.ver++; };
const pick = (G, ...ids) => { for (const id of ids) setTier(G, id, (G.S.draft.stacks[id] || 0) + 1); };
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), type); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const WIRT = ['bessereFabriken', 'kriegserfahrung', 'querverbindung', 'lagerzehnt', 'handelskontor'];
const MIL = ['aushebung', 'drill', 'kriegstrommeln', 'schildwall', 'belagerungsgeraet', 'dauerauftrag', 'grosseArmee', 'allesAufDieMitte'];
const VERT = ['maurerkolonne', 'stachelwall', 'pluenderung', 'befestigungskunde', 'turmkanoniere'];       // die ersten beiden ändern den Turmschaden nicht
const SYN = ['gilde', 'waffenbrueder', 'wehrverband', 'bauordnung', 'sammelruf', 'kriegswirtschaft', 'wehrhandel', 'grenzwacht'];

test('K6.03: Kategorien Wirtschaft, Militär, Verteidigung; jede Karte gehört zu genau einer Kategorie, ist neutral oder zählt als Brücke für zwei', () => {
  const { G, C } = game();
  assert.equal(JSON.stringify(C.KATEGORIEN.liste), JSON.stringify(['wirtschaft', 'militaer', 'verteidigung']));
  for (const o of G.ALL_OPTIONS){
    const ks = G.katsOf(o);
    assert.ok(ks.length <= 2, o.id); for (const k of ks) assert.ok(C.KATEGORIEN.liste.includes(k), `${o.id}: ${k}`);
    if (ks.length === 2) assert.ok(o.synergie || o.id === 'soeldnertruppe' || o.id === 'soeldnerheer' || o.doktrin, `${o.id}: Brücke`);
  }
  // Zuordnung nach der Anforderung: Armee → Militär, Basis → Verteidigung, Wirtschaft → Wirtschaft; Sonderregel und Wagnis neutral, wo nichts eindeutig ist
  const kat = id => G.katsOf(G.OPT[id]).join('+');
  for (const id of ['aushebung', 'drill', 'kriegstrommeln', 'schildwall', 'belagerungsgeraet']) assert.equal(kat(id), 'militaer', id);
  for (const id of ['maurerkolonne', 'turmkanoniere']) assert.equal(kat(id), 'verteidigung', id);
  for (const id of ['bessereFabriken', 'kriegserfahrung', 'handelskontor']) assert.equal(kat(id), 'wirtschaft', id);
  for (const id of ['fortgeschritteneTaktiken', 'ballistik', 'eiserneKlingen']) assert.equal(kat(id), 'militaer', id);
  assert.equal(kat('befestigungskunde'), 'verteidigung');
  for (const id of ['gluecksritter', 'volleAuslastung']) assert.equal(kat(id), '', `${id} neutral`);
  assert.equal(kat('soeldnertruppe'), 'wirtschaft+militaer');
});

test('K6.03 Zählregel: jede Karte einmal, jede weitere Stufe einmal, eine Doktrin zweimal, Mischformen für beide Kategorien, neutrale gar nicht', () => {
  const { G, C } = game();
  assert.equal(JSON.stringify(G.katCounts()), JSON.stringify({ wirtschaft: 0, militaer: 0, verteidigung: 0 }));
  pick(G, 'aushebung'); assert.equal(G.katCounts().militaer, 1);
  pick(G, 'aushebung'); assert.equal(G.katCounts().militaer, 2, 'die zweite Stufe zählt noch einmal');
  pick(G, 'gluecksritter'); assert.equal(G.katCounts().militaer + G.katCounts().wirtschaft + G.katCounts().verteidigung, 2, 'neutral zählt nicht');
  pick(G, 'stehendesHeer'); assert.equal(G.katCounts().militaer, 2 + C.KATEGORIEN.doktrin, 'eine Doktrin zählt doppelt'); assert.equal(C.KATEGORIEN.doktrin, 2);
  pick(G, 'soeldnertruppe'); assert.equal(G.katCounts().wirtschaft, 1); assert.equal(G.katCounts().militaer, 3 + C.KATEGORIEN.doktrin, 'Brücke: für beide');
  pick(G, 'kriegswirtschaft'); assert.equal(G.katCounts().wirtschaft, 2); assert.equal(G.katCounts().militaer, 4 + C.KATEGORIEN.doktrin);
  const { G: S } = game('standard'); pick(S, 'drill'); assert.equal(JSON.stringify(S.katCounts()), JSON.stringify({ wirtschaft: 0, militaer: 0, verteidigung: 0 }), 'im Standardmodus zählt nichts');
});

test('K6.03: acht Synergiekarten in drei Arten; Namen, Kategorien und Werte der Anforderung (Startwerte)', () => {
  const { G, C } = game();
  for (const id of SYN){ const o = G.OPT[id]; assert.ok(o && o.synergie, id); assert.equal(o.nurKarten, true); assert.ok(['zaehler', 'verstaerker', 'bruecke'].includes(o.synergie.art), id); }
  const art = id => G.OPT[id].synergie.art, kat = id => G.katsOf(G.OPT[id]).join('+');
  assert.equal(['gilde', 'waffenbrueder', 'wehrverband'].map(art).join(), 'zaehler,zaehler,zaehler');
  assert.equal(['bauordnung', 'sammelruf'].map(art).join(), 'verstaerker,verstaerker');
  assert.equal(['kriegswirtschaft', 'wehrhandel', 'grenzwacht'].map(art).join(), 'bruecke,bruecke,bruecke');
  assert.equal(['gilde', 'waffenbrueder', 'wehrverband', 'bauordnung', 'sammelruf'].map(kat).join(), 'wirtschaft,militaer,verteidigung,wirtschaft,militaer');
  assert.equal(['kriegswirtschaft', 'wehrhandel', 'grenzwacht'].map(kat).join(), 'wirtschaft+militaer,wirtschaft+verteidigung,militaer+verteidigung');
  assert.equal(C.KATEGORIEN.deckel, 8);
  // Startwerte der Anforderung (Waffenbrüder: 7 statt 5 %, damit der Zähler ab drei Karten 20 % erreicht, siehe STAND, Auslegung)
  const sy = id => G.OPT[id].synergie;
  assert.equal(sy('gilde').perCard, 0.08); assert.equal(sy('gilde').stat, 'materialYield'); assert.equal(sy('gilde').zaehlt, 'wirtschaft');
  assert.equal(sy('waffenbrueder').stat, 'unitDmg'); assert.equal(sy('waffenbrueder').zaehlt, 'militaer');
  assert.equal(sy('wehrverband').perCard, 0.08); assert.equal(sy('wehrverband').stat, 'turretDmg'); assert.equal(sy('wehrverband').zaehlt, 'verteidigung');
  assert.equal(sy('kriegswirtschaft').zaehlt, 'militaer'); assert.equal(sy('kriegswirtschaft').perCard, -0.05); assert.equal(sy('kriegswirtschaft').stat, 'unitCost');
  assert.equal(sy('wehrhandel').zaehlt, 'verteidigung'); assert.equal(sy('wehrhandel').perCard, 0.03); assert.equal(sy('wehrhandel').stat, 'materialYield');
  assert.equal(sy('grenzwacht').zaehlt, 'militaer'); assert.equal(sy('grenzwacht').perCard, 0.05); assert.equal(sy('grenzwacht').stat, 'wallHp');
  assert.equal(sy('sammelruf').zaehlt, 'militaer'); assert.equal(sy('sammelruf').perN, 2); assert.equal(sy('sammelruf').stat, 'extraUnit');
  assert.equal(sy('bauordnung').fix.mul, 2); assert.equal(sy('bauordnung').fix.stat, 'nbAll');
});

test('K6.03 Zähler: wächst mit der Zahl der Karten der Kategorie, die Karte selbst eingeschlossen; Spürbarkeitsgrenze 20 % ab drei Karten', () => {
  const { G } = game();
  for (const [id, set] of [['gilde', WIRT], ['waffenbrueder', MIL], ['wehrverband', VERT]]){
    const o = G.OPT[id], stat = o.synergie.stat;
    pick(G, id); const one = G.mMul(stat);                                   // nur die Karte selbst
    assert.ok(Math.abs(one - (1 + o.synergie.perCard)) < 1e-9, `${id}: mit einer Karte ${one}`);
    pick(G, set[0], set[1]);                                                  // drei Karten der Kategorie
    const v = G.mMul(stat); assert.ok(v >= 1.2 - 1e-9, `${id}: ab drei Karten mindestens +20 % (${v})`);
    assert.ok(Math.abs(v - (1 + 3 * o.synergie.perCard)) < 1e-9, `${id}: drei Karten ${v}`);
  }
});

test('K6.03 Deckel: Zähler zählen höchstens acht Karten der Kategorie', () => {
  const { G, C } = game();
  pick(G, 'gilde'); const perCard = G.OPT.gilde.synergie.perCard;
  for (const id of WIRT) pick(G, id);
  for (const id of ['bessereFabriken', 'kriegserfahrung']) pick(G, id);          // Stufe II zählt noch einmal
  for (const id of ['bessereFabriken', 'zunftordnung']) pick(G, id);
  assert.ok(G.katCounts().wirtschaft > C.KATEGORIEN.deckel, `Zahl ${G.katCounts().wirtschaft}`);
  assert.ok(Math.abs(G.mMul('materialYield') - (1 + perCard * C.KATEGORIEN.deckel)) < 1e-9, `Faktor ${G.mMul('materialYield')}`);
  const syn = G.synergieNow('gilde');
  assert.equal(syn.n, C.KATEGORIEN.deckel); assert.ok(Math.abs(syn.value - perCard * C.KATEGORIEN.deckel) < 1e-9);
});

test('K6.03 Gilde, Waffenbrüder, Wehrverband: Wirkung im Spiel', () => {
  const { G } = game(); for (let i = 0; i < 3; i++) place(G, 'fabrik', i * 2);
  const r0 = G.matRate(); pick(G, 'gilde', 'bessereFabriken'); const rg = G.mMul('factoryYield');
  assert.ok(Math.abs(G.matRate() / r0 - rg * (1 + 2 * 0.08)) < 1e-9, `Gilde: +16 % bei zwei Wirtschaftskarten (${G.matRate() / r0})`);
  const d0 = G.dmgMultP(); pick(G, 'waffenbrueder', 'aushebung'); assert.ok(Math.abs(G.dmgMultP() / d0 - (1 + 2 * G.OPT.waffenbrueder.synergie.perCard)) < 1e-9);
  G.S.lvl.turm_0 = 2; const t0 = G.turretDmg(0); pick(G, 'wehrverband', 'maurerkolonne'); assert.ok(Math.abs(G.turretDmg(0) / t0 - (1 + 2 * 0.08)) < 1e-9);
});

test('K6.03 Verstärker: Bauordnung verdoppelt die Nachbarschaftsboni; Sammelruf +1 Einheit je zwei Militärkarten (extraUnit)', () => {
  const { G } = game(); place(G, 'fabrik', 0); place(G, 'fabrik', 1);
  const nb0 = G.neighborValue(0, 'fabrik'); assert.ok(nb0 > 0);
  pick(G, 'bauordnung'); assert.ok(Math.abs(G.neighborValue(0, 'fabrik') - 2 * nb0) < 1e-9, 'Fabrik neben Fabrik ×2');
  place(G, 'kaserne', 4); place(G, 'schmiede', 5);
  const v = G.neighborValue(4, 'kaserne'); assert.ok(v > 0);
  const { G: H } = game(); place(H, 'kaserne', 4); place(H, 'schmiede', 5);
  assert.ok(Math.abs(v - 2 * H.neighborValue(4, 'kaserne')) < 1e-9, 'auch andere Nachbarschaftsboni');
  const { G: K } = game(); place(K, 'kaserne', 0); idle(K);
  const wave = () => { const n0 = K.S.units.filter(u => u.side === 'p').length; for (let i = 0; i < 3; i++) K.spawn('laeufer'); K.S.nextOwnWave = K.S.t; K.tick(0.05); idle(K); return K.S.units.filter(u => u.side === 'p').length - n0; };
  assert.equal(wave(), 3);
  pick(K, 'sammelruf'); assert.equal(K.mAdd('extraUnit'), 0, 'eine Militärkarte: noch kein Läufer');
  pick(K, 'aushebung'); assert.equal(K.mAdd('extraUnit'), 1, 'zwei Militärkarten: +1'); assert.equal(wave(), 4);
  pick(K, 'drill', 'schildwall'); assert.equal(K.mAdd('extraUnit'), 2, 'vier Militärkarten: +2');
});

test('K6.03 Brücken zählen für beide Kategorien; ihr Wert folgt der gezählten Kategorie', () => {
  const { G } = game();
  pick(G, 'kriegswirtschaft'); assert.equal(G.katCounts().wirtschaft, 1); assert.equal(G.katCounts().militaer, 1);
  const c0 = G.unitCost('laeufer');
  pick(G, 'aushebung', 'drill');                                              // zwei weitere Militärkarten: drei Karten zählen → −15 % Einheitenkosten
  assert.ok(Math.abs(G.mMul('unitCost') - (1 - 0.05 * 3)) < 1e-9, `Einheitenkosten ×${G.mMul('unitCost')}`);
  assert.ok(G.unitCost('laeufer') < c0);
  const { G: H } = game(); pick(H, 'wehrhandel', 'maurerkolonne', 'turmkanoniere');
  assert.equal(H.katCounts().wirtschaft, 1); assert.equal(H.katCounts().verteidigung, 3);
  assert.ok(Math.abs(H.mMul('materialYield') - (1 + 0.03 * 3)) < 1e-9, 'Wehrhandel: +3 % je Verteidigungskarte');
  const { G: K } = game(); pick(K, 'grenzwacht', 'drill', 'aushebung', 'kriegstrommeln');
  assert.ok(Math.abs(K.mMul('wallHp') - (1 + 0.05 * 4)) < 1e-9, 'Grenzwacht: +5 % Mauer-Leben je Militärkarte (vier zählen, sie selbst eingeschlossen)');
  assert.equal(K.katCounts().verteidigung, 1, 'die Brücke zählt auch für die Verteidigung');
});

test('K6.03 Anzeige: Synergiekarten nennen ihren aktuellen Wert (synergieNow)', () => {
  const { G } = game();
  assert.equal(G.synergieNow('waffenbrueder').n, 0, 'ohne Karten der Kategorie zählt nichts');
  pick(G, 'drill', 'aushebung');
  const now = G.synergieNow('waffenbrueder', true);                                  // wird gewählt: die Karte zählt mit
  assert.equal(now.n, 3); assert.ok(Math.abs(now.value - 3 * G.OPT.waffenbrueder.synergie.perCard) < 1e-9);
  pick(G, 'waffenbrueder'); const now2 = G.synergieNow('waffenbrueder'); assert.equal(now2.n, 3); assert.ok(Math.abs(now2.value - now.value) < 1e-9);
  assert.equal(G.synergieNow('drill'), null, 'keine Synergiekarte');
});

/* ---------- Angebot ---------- */
function offerState(seed){
  const { G, C } = game('karten', seed);
  place(G, 'kaserne', 0); place(G, 'universitaet', 1); place(G, 'fabrik', 2); place(G, 'fabrik', 3); place(G, 'schmiede', 4); G.S.lvl.turm_0 = 2; G.S.level = 6; G.S.t = 200;
  return { G, C };
}
const offerOnce = G => { G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = -1e9; G.S.pfad.choices = 6; G.offerDraft(); return G.S.pendingDraft.options; };

test('K6.03 Angebot: die führende Kategorie (mindestens zwei Karten Vorsprung) erhält doppeltes Gewicht', () => {
  const { G } = offerState(1);
  assert.equal(G.katLead(), null);
  pick(G, 'aushebung', 'drill'); assert.equal(G.katLead(), 'militaer', 'zwei Karten Vorsprung vor den anderen Kategorien');
  const { G: H } = offerState(2); pick(H, 'aushebung', 'drill', 'maurerkolonne'); assert.equal(H.katLead(), null, 'nur ein Punkt Vorsprung vor der Verteidigung');
  assert.equal(G.weightKarten(G.OPT.kriegstrommeln), 2 * G.cardWeight(G.OPT.kriegstrommeln), 'Karten der führenden Kategorie ziehen mit doppeltem Gewicht');
  assert.equal(G.weightKarten(G.OPT.zinnen), G.cardWeight(G.OPT.zinnen), 'andere Kategorien unverändert');
  assert.equal(G.weightKarten(G.OPT.gluecksritter), G.cardWeight(G.OPT.gluecksritter), 'neutrale Karten unverändert');
  // Häufigkeit im Angebot: die kleinste Kategorie (Verteidigung) führt mit zwei Karten Vorsprung und erscheint häufiger
  const share = lead => {
    let v = 0, all = 0;
    for (let seed = 1; seed <= 200; seed++){
      const { G } = offerState(seed); if (lead) pick(G, 'maurerkolonne', 'stachelwall');
      for (const id of offerOnce(G)){ all++; if (G.katsOf(G.OPT[id]).includes('verteidigung')) v++; }
    }
    return v / all;
  };
  const a = share(true), b = share(false);
  assert.ok(a > b * 1.2, `Verteidigungsanteil im Angebot: mit Führung ${a.toFixed(2)} gegen ${b.toFixed(2)}`);
});

test('K6.03 Angebot: ein Angebot mit drei oder mehr Karten enthält mindestens eine Karte außerhalb der führenden Kategorie', () => {
  let checked = 0, withOther = 0;
  for (const lead of [['aushebung', 'drill', 'kriegstrommeln', 'schildwall'], ['maurerkolonne', 'turmkanoniere', 'zinnen', 'pluenderung'], ['bessereFabriken', 'kriegserfahrung', 'querverbindung', 'lagerzehnt']]){
    for (let seed = 1; seed <= 120; seed++){
      const { G } = offerState(seed); pick(G, ...lead);
      const l = G.katLead(); assert.ok(l, 'Vorsprung');
      const ids = offerOnce(G); assert.ok(ids.length >= 3);
      checked++; if (ids.some(id => !G.katsOf(G.OPT[id]).includes(l))) withOther++;
    }
  }
  assert.equal(withOther, checked, `${checked - withOther} von ${checked} Angeboten nur aus der führenden Kategorie`);
});

test('K6.03 Angebot: Bann und Neu ziehen halten die Regel der Fremdkategorie', () => {
  for (let seed = 1; seed <= 80; seed++){
    const { G } = offerState(seed); pick(G, 'aushebung', 'drill', 'kriegstrommeln', 'schildwall'); G.S.research.done.r_bann = 1; G.S.research.done.r_neuziehen = 2; G.S.research.ver++;
    const l = G.katLead(); offerOnce(G);
    for (let n = 0; n < 2; n++){
      const i = G.S.pendingDraft.options.findIndex(id => G.canBan(id));
      if (i >= 0 && G.bansLeft() > 0) G.banOption(i);
      assert.ok(G.S.pendingDraft.options.some(id => !G.katsOf(G.OPT[id]).includes(l)), `Seed ${seed}: Bann`);
      if (G.rerollsLeft() > 0) { G.rerollDraft(); assert.ok(G.S.pendingDraft.options.some(id => !G.katsOf(G.OPT[id]).includes(l)), `Seed ${seed}: Neu ziehen`); }
    }
  }
});

test('K6.03 Angebot: Synergiekarten erscheinen erst mit genug Karten ihrer Kategorie und nur im Modus karten', () => {
  const { G } = offerState(3);
  for (const id of ['gilde', 'waffenbrueder', 'wehrverband', 'sammelruf', 'kriegswirtschaft', 'wehrhandel', 'grenzwacht']) assert.equal(G.optionAvailable(G.OPT[id]), false, `${id} ohne Karten der Kategorie`);
  pick(G, 'aushebung', 'drill'); assert.equal(G.optionAvailable(G.OPT.waffenbrueder), true);
  assert.equal(G.optionAvailable(G.OPT.kriegswirtschaft), true, 'Brücke zählt die Militärkarten');
  assert.equal(G.optionAvailable(G.OPT.gilde), false);
  const { G: S } = game('standard'); S.S.level = 6; place(S, 'kaserne', 0); S.S.pfad.choices = 8; pick(S, 'aushebung', 'drill');
  for (const id of SYN) assert.equal(S.optionAvailable(S.OPT[id]), false, `${id} im Standardmodus`);
});

test('K6.03 Pool: höchstens 38 Karten ohne Doktrinen; keine Karte doppelt; die gestrichenen Karten sind nicht im Angebot', () => {
  const { G, C } = game();
  const pool = G.ALL_OPTIONS.filter(o => !o.doktrin && !G.cardRemoved(o.id));
  assert.ok(pool.length <= C.KATEGORIEN.poolMax && C.KATEGORIEN.poolMax === 38, `Karten im Pool: ${pool.length}`);
  assert.equal(new Set(pool.map(o => o.id)).size, pool.length);
  const per = Object.fromEntries(['wirtschaft', 'militaer', 'verteidigung', 'neutral'].map(k => [k, pool.filter(o => (G.katsOf(o).join() || 'neutral').split(',').includes(k)).length]));
  for (const k of ['wirtschaft', 'militaer', 'verteidigung']) assert.ok(per[k] >= 7, `${k}: ${per[k]} Karten (Zähler brauchen Karten)`);
});

test('K6.03 Texte: Synergiekarten in de und en (Name, Beschreibung, Wirkungszeile bis 44 Zeichen, aktueller Wert)', () => {
  const { G } = game(), I = loadI18n(), fill = s => s.replace(/\{[a-z0-9]+\}/gi, '12');
  for (const lang of ['de', 'en']){
    const T = I[lang];
    for (const id of SYN){
      const o = G.OPT[id];
      assert.ok(T[o.nameKey] && T[o.descKey], `${lang} ${id}`);
      assert.ok(T['kp.eff.' + id] && fill(T['kp.eff.' + id]).length <= 44, `${lang} kp.eff.${id}: „${T['kp.eff.' + id]}“`);
      for (const ph of T['kp.eff.' + id].match(/\{[a-z0-9]+\}/gi) || []) assert.ok(T[o.descKey].includes(ph), `${lang} ${id}: ${ph} in der Beschreibung`);
    }
    for (const k of ['kat.wirtschaft.name', 'kat.militaer.name', 'kat.verteidigung.name', 'kat.neutral.name', 'kat.now', 'kat.counts.title', 'tip.kat.counts', 'kat.art.zaehler', 'kat.art.verstaerker', 'kat.art.bruecke']) assert.ok(T[k], `${lang}: ${k}`);
  }
});

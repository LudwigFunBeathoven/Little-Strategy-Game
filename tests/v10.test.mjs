// Tests Kartenpfad Teil 10: Reichweitenleiter (REQ-K10.03), Fernkämpfer kämpfen aus maximaler Reichweite (REQ-K10.04), Rückstau der Stufenaufstiege (REQ-K10.05).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const MID = 1;
function game(opts = {}){
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', opts.seed || 7, { pacing: 'karten' });
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  return { G, C: core.KF_CONFIG };
}
const tough = (G, f, hp = 1e9) => { for (const u of G.formMembers(f)){ u.hp = u.maxHp = hp; u.dmg = 0; } };
const still = (G, f) => { tough(G, f); for (const u of G.formMembers(f)) u.speed = 1e-9; };       // ein (praktisch) stehendes Ziel; 0 gälte als „kein Wert“
const run = (G, s) => { for (let i = 0; i < Math.round(s * 20); i++) G.tick(0.05); };
const FERN = ['werfer', 'bogenschuetze', 'armbrust', 'katapult', 'geschuetz'];

/* ---------- K10.03 Reichweiten ---------- */
test('K10.03: Reichweitenleiter 1,0 / 1,3 / 1,6 / 1,8 / 2,0 · R_W; Werfer ist der Anker; Herkunft der Geschützreichweite: nur die Grundwerte, keine Ausbauten', () => {
  const { G, C } = game(); const RW = C.UNITS.werfer.range;
  const F = { werfer: 1, bogenschuetze: 1.3, armbrust: 1.6, katapult: 1.8, geschuetz: 2.0 };
  for (const id of FERN) assert.ok(Math.abs(G.unitRange('p', id) - RW * F[id]) <= 1, `${id}: ${G.unitRange('p', id)} gegen ${RW * F[id]}`);
  assert.equal(G.unitRange('p', 'geschuetz'), C.KARTEN.reichweiten.geschuetz, 'ohne Ausbau und Karte gilt der Grundwert');
});

test('K10.03: Die Reihenfolge der Leiter gilt mit allen reichweitenwirksamen Ausbauten, Karten und Schmiedestufen', () => {
  const { G, C } = game();
  const order = () => { const r = FERN.map(id => G.unitRange('p', id)); for (let i = 1; i < r.length; i++) assert.ok(r[i] > r[i - 1], `${FERN[i]} ${r[i]} über ${FERN[i - 1]} ${r[i - 1]}`); return r; };
  order();
  for (const [card, tiers] of [['langeWurfarme', 2], ['bastion', 3], ['turmschule', 3]]){
    for (let tier = 1; tier <= tiers; tier++){ G.S.draft.stacks = { [card]: tier }; G.S.draft.ver++; order(); }
  }
  G.S.draft.stacks = {}; G.S.draft.ver++;
  for (let q = 0; q <= 12; q++){ G.S.lvl.qualitaet = q; order(); }
  for (const id of Object.keys(C.UPGRADES)){ G.S.lvl[id] = 3; order(); G.S.lvl[id] = 0; }
  // alle Karten mit einem Reichweiten-Effekt auf Einheiten (Stat werferRange) in allen Stufen
  const opts = Object.values(G.OPT).filter(o => G.tiersOf(o).some(t => (t.effect || []).some(e => e.stat === 'werferRange')));
  assert.ok(opts.length >= 1, 'Karte mit Reichweite gefunden');
  for (const o of opts) for (let tier = 1; tier <= G.tiersOf(o).length; tier++){ G.S.draft.stacks = { [o.id]: tier }; G.S.draft.ver++; order(); }
});

test('K10.03: Kein gegnerischer Fernkämpfer reicht weiter als ein Turm mit einer Reichweitenstufe; Bogen- und Armbrustschützen folgen derselben Leiter', () => {
  const { G, C } = game(); const lim = C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel;
  for (const id of FERN) assert.ok(G.unitRange('e', id) <= lim, `gegnerische ${id} ${G.unitRange('e', id)} über ${lim}`);
  assert.ok(G.unitRange('e', 'werfer') < G.unitRange('e', 'bogenschuetze') && G.unitRange('e', 'bogenschuetze') < G.unitRange('e', 'armbrust'), 'Leiter der Gegner: Werfer < Bogen < Armbrust');
});

/* ---------- K10.04 Fernkämpfer halten ---------- */
const TOL = 0.05;
test('K10.04: Ein Fernkämpfer hält im Abstand seiner Reichweite (Toleranz 5 %) zu einer Einheit, feuert von dort und rückt nicht weiter vor', () => {
  for (const type of FERN){
    const { G } = game();
    const a = G.addGroup('p', [{ type, lane: MID }], 200); tough(G, a);
    const e = G.addFormation('e', MID, ['laeufer'], 900); still(G, e);
    const u = G.formMembers(a)[0], r = u.range;
    run(G, 40);
    const d = G.formMembers(e)[0].x - u.x;
    assert.ok(d <= r * (1 + TOL) && d >= r * (1 - TOL), `${type}: Abstand ${d.toFixed(1)} bei Reichweite ${r}`);
    const x = u.x; run(G, 5); assert.equal(u.x, x, `${type}: bleibt stehen, solange das Ziel in Reichweite ist`);
  }
});

test('K10.04: Gegen Mauer und Basis halten eigene und gegnerische Fernkämpfer im Abstand ihrer Reichweite', () => {
  for (const type of FERN){
    const { G, C } = game(); const W = C.LANE;
    const a = G.addGroup('p', [{ type, lane: MID }], 300); tough(G, a);
    const u = G.formMembers(a)[0]; run(G, 90);
    const d = (W - C.ENEMY_BASE_WIDTH) - u.x;
    assert.ok(d <= u.range * (1 + TOL) && d >= u.range * (1 - TOL), `eigener ${type} vor der gegnerischen Basis: ${d.toFixed(1)} bei ${u.range}`);
  }
  for (const type of ['werfer', 'bogenschuetze', 'armbrust']){
    const { G, C } = game();
    const e = G.addGroup('e', [{ type, lane: MID }], 700); tough(G, e);
    const u = G.formMembers(e)[0]; run(G, 90);
    const d = u.x - C.PLAYER_BASE_WIDTH;
    assert.ok(d <= u.range * (1 + TOL) && d >= u.range * (1 - TOL), `gegnerischer ${type} vor der eigenen Mauer: ${d.toFixed(1)} bei ${u.range}`);
  }
});

test('K10.04: Fällt das Ziel und ist kein weiteres in Reichweite, rückt der Fernkämpfer vor, bis das nächste Ziel in Reichweite kommt; er weicht nie zurück', () => {
  const { G } = game();
  const a = G.addGroup('p', [{ type: 'bogenschuetze', lane: MID }], 200); tough(G, a);
  const e1 = G.addFormation('e', MID, ['laeufer'], 600); still(G, e1);
  const e2 = G.addFormation('e', MID, ['laeufer'], 900); still(G, e2);
  const u = G.formMembers(a)[0];
  run(G, 30); const held = u.x, t1 = G.formMembers(e1)[0];
  assert.ok(t1.x - held <= u.range * (1 + TOL));
  t1.hp = 0;                                                                 // erstes Ziel fällt
  let last = u.x, back = 0;
  for (let i = 0; i < 20 * 40; i++){ G.tick(0.05); if (u.x < last - 1e-9) back++; last = u.x; }
  assert.equal(back, 0, 'kein Zurückweichen');
  const t2 = G.formMembers(e2)[0], d = t2.x - u.x;
  assert.ok(u.x > held + 50, `rückt vor: ${held.toFixed(0)} → ${u.x.toFixed(0)}`);
  assert.ok(d <= u.range * (1 + TOL) && d >= u.range * (1 - TOL), `hält am zweiten Ziel: ${d.toFixed(1)} bei ${u.range}`);
});

test('K10.04: Nähert sich ein Gegner, hält der Fernkämpfer seine Stellung (kein Zurückweichen)', () => {
  const { G } = game();
  const a = G.addGroup('p', [{ type: 'armbrust', lane: MID }], 300); tough(G, a);
  const e = G.addFormation('e', MID, ['laeufer'], 900); tough(G, e);          // marschiert auf die Armbrust zu
  const u = G.formMembers(a)[0]; let last = u.x, back = 0;
  for (let i = 0; i < 20 * 60; i++){ G.tick(0.05); if (u.x < last - 1e-9) back++; last = u.x; }
  assert.equal(back, 0);
});

test('K10.04: Im Standardmodus bleibt das Verhalten unverändert (Fernkämpfer marschieren mit der Gruppe)', () => {
  const core = loadCore(); const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = []; G.S.enemyTurretCd = Infinity;
  const a = G.addGroup('p', [{ type: 'werfer', lane: MID }, { type: 'laeufer', lane: MID }], 200);
  run(G, 5); const u = G.formMembers(a).find(x => x.type === 'werfer');
  assert.ok(Math.abs(u.x - (a.x - u.row * core.KF_CONFIG.ROW_GAP)) < 1e-9, 'bleibt auf seinem Platz in der Formation');
});

/* ---------- K10.05 Rückstau ---------- */
test('K10.05: Ein EP-Schub über mehrere Stufen erzeugt genau einen Aufstieg; die EP bleiben erhalten und die weiteren Schwellen folgen nach den Wahlen', () => {
  const { G, C } = game(); C.KARTEN.minAbstand = 0;
  G.gainXp(G.xpNeed(5) + 1, 'kill');
  assert.equal(G.S.level, 1, 'ein Aufstieg'); assert.equal(G.S.pendingLevels, 1); assert.equal(G.S.reached, 5); assert.equal(G.rueckstau(), 5);
  assert.ok(G.S.xpTotal > G.xpNeed(5), 'EP nicht verloren');
  for (let k = 1; k <= 5; k++){
    assert.ok(G.S.pendingDraft, `Wahl ${k} offen`); assert.equal(G.S.level, k); assert.equal(G.S.pendingLevels, 1, 'nie mehr als ein offener Aufstieg');
    G.S.pendingDraft.options[0] = 'maurerkolonne'; G.chooseDraft(0); G.tick(0.05);
  }
  assert.equal(G.S.pendingDraft, null); assert.equal(G.rueckstau(), 0); assert.equal(G.S.level, 5);
});

test('K10.05: Dynamischer Anstieg (Arm B): wird eine Schwelle früher als ref nach der vorigen erreicht, steigen die Kosten der nächsten höchstens bis max; langsamer erreichte bleiben unverändert', () => {
  const { G, C } = game(); C.KARTEN.schwellen.dyn = { ref: 60, max: 2 };
  const step = k => C.KARTEN.schwellen.start * Math.pow(C.KARTEN.schwellen.wachstum, k - 1);
  G.S.t = 100; G.gainXp(G.xpNeed(1) + 1, 'kill');                       // Schwelle 1 nach 100 s
  assert.equal(G.S.pfad.mult[1], 1, 'Schwelle 1 liegt über ref: Faktor 1');
  G.S.t = 130; G.gainXp(G.xpNeed(2) - G.S.xpTotal + 1, 'kill');          // Schwelle 2 nach 30 s: ref/30 = 2
  assert.equal(G.S.pfad.mult[2], 2);
  G.S.t = 135; G.gainXp(G.xpNeed(3) - G.S.xpTotal + 1, 'kill');          // nach 5 s: ref/5 = 12, begrenzt auf max
  assert.equal(G.S.pfad.mult[3], 2);
  assert.ok(Math.abs((G.xpNeed(4) - G.xpNeed(3)) - step(4) * 2) < 1e-6, 'Kosten der Schwelle 4 verdoppelt');
});

/* ---------- K10.02 Einheitentexte ---------- */
import { loadI18n } from '../tools/load-core.mjs';
test('K10.02: Jede Einheit des Modus karten hat einen Text aus zwei Sätzen, höchstens 140 Zeichen (en 161), ohne Platzhalter; die Ausrückregel steht im Reiter Armee', () => {
  const I = loadI18n(); const { G, C } = game();
  const ids = Object.keys(C.UNITS);
  assert.equal(ids.length, 9);
  for (const id of ids) for (const lang of ['de', 'en']){
    const s = I[lang][`unit.${id}.desc`]; assert.ok(s, `${lang}: unit.${id}.desc fehlt`);
    assert.ok(s.length <= (lang === 'en' ? 161 : 140), `${lang} ${id}: ${s.length} Zeichen`);
    assert.ok(!/[{}]/.test(s), `${lang} ${id}: Platzhalter`);
    assert.equal(s.split(/(?<=[.:;])\s+/).filter(x => /[.]$/.test(x)).length, 2, `${lang} ${id}: zwei Sätze`);
  }
  for (const lang of ['de', 'en']){
    assert.ok(I[lang]['tip.tab.army.karten'].includes('{max}'), `${lang}: Versorgungslimit als Zahl im Reiter Armee`);
    assert.ok(I[lang]['tip.m.key'] && I[lang]['tip.m.merc'] && I[lang]['tip.merc.value']);
  }
});

test('K10.02: Die Aussagen der Texte folgen den Werten (Rang bei Lebenspunkten, Schaden, Kosten, Tempo)', () => {
  const { G, C } = game(); const U = C.UNITS, dps = id => U[id].dmg / U[id].cd;
  const melee = ['laeufer', 'schild', 'reiter', 'schwertkaempfer'], fern = ['werfer', 'armbrust', 'katapult', 'bogenschuetze', 'geschuetz'];
  assert.equal(Object.keys(U).sort((a, b) => U[a].cost - U[b].cost)[0], 'laeufer', 'Läufer: billigste Einheit');
  assert.equal(melee.sort((a, b) => U[b].hp - U[a].hp)[0], 'schild', 'Schildträger: die meisten Lebenspunkte');
  assert.ok(U.schild.speed <= Math.min(...Object.values(U).map(u => u.speed)) + 4 && U.schild.speed < U.laeufer.speed, 'Schildträger: langsam');
  assert.equal(melee.sort((a, b) => dps(b) - dps(a))[0], 'reiter', 'Reiter: höchster Schaden je Sekunde unter den Nahkämpfern');
  assert.ok(U.reiter.cost > U.laeufer.cost && U.reiter.cost > U.schwertkaempfer.cost && U.reiter.hp < U.schwertkaempfer.hp + 5, 'Reiter: teurer, kaum mehr Lebenspunkte');
  assert.ok(U.schwertkaempfer.dmg > U.laeufer.dmg && U.schwertkaempfer.hp > U.laeufer.hp && U.schwertkaempfer.cost > U.laeufer.cost, 'Schwertkämpfer gegen Läufer');
  assert.equal(fern.sort((a, b) => U[a].hp - U[b].hp)[0], 'werfer', 'Werfer: die wenigsten Lebenspunkte unter den Fernkämpfern');
  assert.ok(U.bogenschuetze.dmg > U.werfer.dmg && U.bogenschuetze.cost > U.werfer.cost && G.baseRange('bogenschuetze') > G.baseRange('werfer'), 'Bogenschütze gegen Werfer');
  assert.ok(U.armbrust.dmg > U.bogenschuetze.dmg && U.armbrust.cd > U.bogenschuetze.cd && U.armbrust.cost > U.bogenschuetze.cost && G.baseRange('armbrust') > G.baseRange('bogenschuetze'), 'Armbrust gegen Bogen');
  assert.equal(Object.keys(U).sort((a, b) => U[b].dmg - U[a].dmg)[0], 'katapult', 'Katapult: höchster Schaden je Schuss'); assert.equal(fern.sort((a, b) => U[b].cd - U[a].cd)[0], 'katapult', 'Katapult feuert am seltensten');
  assert.equal(Object.keys(U).sort((a, b) => U[b].cost - U[a].cost)[0], 'geschuetz', 'Geschütz: teuerste Einheit'); assert.equal(Object.keys(U).sort((a, b) => U[a].speed - U[b].speed)[0], 'geschuetz', 'Geschütz: langsamste Einheit');
  assert.equal(U.geschuetz.baseMult, 3); assert.equal(U.geschuetz.versorgung, 2); assert.equal(fern.sort((a, b) => G.baseRange(b) - G.baseRange(a))[0], 'geschuetz', 'Geschütz: größte Reichweite');
});

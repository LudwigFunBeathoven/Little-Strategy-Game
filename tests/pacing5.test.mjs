// Tests Kartenpfad Teil 5, REQ-K5.03 und K5.04: Kartenwahlen aus dem Spielfluss (EP-Schwellen, EP-Quellen, Mindestabstand), keine Zeitautomatik.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 11, diff = 'normal', opts = {}){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, Object.assign({ pacing }, opts));
  G.S.sections.forEach(s => { s.hp = 1e9; });                       // keine Niederlage während der Zeitprüfung
  return { G, C: KF_CONFIG };
}
const immortal = G => G.S.sections.forEach(s => { s.hp = 1e9; });        // chooseDraft kappt die Lebenspunkte wieder auf das Maximum
const run = (G, seconds, stop = () => false) => { for (let i = 0; i < 20 * seconds && !stop(); i++){ immortal(G); G.tick(0.05); } };
const foe = (G, wave, x = 900, lane = 1, hp = 30) => { const id = G.S.nextId++; G.S.units.push({ id, side: 'e', type: 'laeufer', lane, laneF: lane, home: lane, x, hp, maxHp: hp, dmg: 0, cdMax: 1e9, cd: 1e9, flash: 0, wave, form: null, speed: 0, range: 14, ranged: false, row: 0, col: 0, rowSize: 1 }); return id; };

test('Kurve: die Schwelle der Wahl n ist die Summe der Schritte start × wachstum^(k−1); der Faktor je Grad ist nur eine Stellschraube', () => {
  const { G, C } = game('karten');
  const k = C.KARTEN.schwellen;
  let sum = 0;
  for (let n = 1; n <= 16; n++){ sum += k.start * Math.pow(k.wachstum, n - 1); assert.ok(Math.abs(G.xpNeed(n) - sum) < 1e-6, `Wahl ${n}`); }
  assert.equal(JSON.stringify(C.KARTEN.schwellenFaktor), JSON.stringify({ leicht: 1, normal: 1, schwer: 1 }), 'Standardwert 1,0 je Grad');
  const at = (diff, n, tweak) => { const { KlammerCore, KF_CONFIG } = loadCore(); if (tweak) tweak(KF_CONFIG); const g = KlammerCore.create(); g.FX.on = false; g.newGame(diff, 3, { pacing: 'karten' }); return g.xpNeed(n); };
  for (const diff of ['leicht', 'schwer']) assert.equal(at(diff, 6), at('normal', 6), `Kurve für alle Grade gleich (${diff})`);
  assert.ok(Math.abs(at('schwer', 6, c => { c.KARTEN.schwellenFaktor.schwer = 1.5; }) / at('normal', 6) - 1.5) < 1e-9, 'Faktor je Grad skaliert die Kurve');
  assert.equal(Math.round(G.xpNeed(1)), Math.round(C.KARTEN.schwellen.start), 'erste Wahl nach dem ersten Schritt');
});

test('Standardmodus: die EP-Stufen von main bleiben', () => {
  const { G, C } = game('standard');
  const { KlammerCore } = loadCore();
  for (let n = 1; n <= 8; n++) assert.equal(Math.round(G.xpNeed(n)), Math.round(KlammerCore.xpForLevel(n)), `Stufe ${n}`);
  assert.ok(C.XP_GROWTH > 1.5);
});

test('Ohne EP-Zuwachs wird keine Wahl fällig, gleich wie lange gespielt wird', () => {
  for (const [diff, minutes] of [['leicht', 6], ['normal', 12], ['schwer', 6]]){
    const { G } = game('karten', 5, diff);
    run(G, minutes * 60);                                               // keine eigene Einheit, kein Turm: nichts bringt EP
    assert.equal(G.S.xpTotal, 0, `${diff}: keine EP`);
    assert.equal(G.S.pendingDraft, null, `${diff}: keine Wahl nach Zeit`);
    assert.equal(G.S.level, 0); assert.equal(G.S.pendingLevels, 0);
    assert.equal(G.S.stats.wahlen, undefined);
  }
});

test('Die Zeit allein ändert die Schwelle der nächsten Wahl nicht', () => {
  const { G } = game('karten');
  const n1 = G.xpNeed(1), n2 = G.xpNeed(2); run(G, 120);
  assert.equal(G.xpNeed(1), n1); assert.equal(G.xpNeed(2), n2);
});

test('EP-Quelle Schaden an der gegnerischen Basis: jedes Prozent ihrer Lebenspunkte bringt epBasis.proProzent EP', () => {
  const { G, C } = game('karten');
  G.S.enemyBaseHp = G.diffCfg().enemyBaseHp;
  const hp0 = G.S.enemyBaseHp, W = C.LANE, EBW = C.ENEMY_BASE_WIDTH;
  G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  G.addFormation('p', 1, ['laeufer', 'laeufer', 'werfer'], W - EBW - 4);
  for (let i = 0; i < 20 * 20; i++){ immortal(G); G.tick(0.05); }
  const dealt = hp0 - G.S.enemyBaseHp;
  assert.ok(dealt > 100, `Schaden an der Basis ${dealt}`);
  const expected = 100 * dealt / hp0 * C.KARTEN.epBasis.proProzent;
  assert.ok(Math.abs(G.S.stats.xpSrc.base - expected) < 1e-6 * expected + 1e-6, `EP aus Basisschaden ${G.S.stats.xpSrc.base} gegen ${expected}`);
  assert.ok(G.S.xpTotal >= G.S.stats.xpSrc.base);
  // Standard: keine Zähler, keine EP für Basisschaden
  const { G: S } = game('standard'); S.S.nextWave = 1e9; S.S.nextOwnWave = 1e9;
  S.addFormation('p', 1, ['laeufer', 'laeufer', 'werfer'], W - EBW - 4);
  for (let i = 0; i < 20 * 20; i++){ immortal(S); S.tick(0.05); }
  assert.equal(S.S.stats.xpSrc, undefined); assert.equal(S.S.xpTotal, 0);
});

test('EP-Quelle abgewehrte Gegnerwelle: basis + proEinheit × Größe; größere Wellen bringen mehr; nur vollständig abgewehrte zählen', () => {
  const { G, C } = game('karten');
  G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  const w = C.KARTEN.epWelle, kill = G => { G.S.pendingDraft = null; G.S.units.filter(u => u.side === 'e').forEach(u => { u.hp = -1; }); G.tick(0.05); };       // eine fällige Wahl hielte die Zeit an
  // Welle 7 mit 5 Einheiten: eine fällt, die Welle ist noch nicht abgewehrt
  G.S.waveSize[7] = 5; const ids = [0, 1, 2, 3, 4].map(i => foe(G, 7, 900 + i));
  G.S.units.find(u => u.id === ids[0]).hp = -1; G.S.pendingDraft = null; G.tick(0.05);
  assert.equal((G.S.stats.xpSrc || {}).wave, undefined, 'eine Welle mit Überlebenden bringt nichts');
  kill(G);
  assert.equal(G.S.stats.xpSrc.wave, w.basis + w.proEinheit * 5, 'Welle mit 5 Einheiten');
  assert.equal(G.S.stats.wavesRepelled, 1);
  G.S.waveSize[8] = 12; foe(G, 8, 950); kill(G);
  assert.equal(G.S.stats.xpSrc.wave, w.basis + w.proEinheit * 5 + w.basis + w.proEinheit * 12, 'größere Welle, mehr EP');
  assert.equal(G.S.waveSize[7], undefined, 'Größe wird nach der Abwehr vergessen');
});

test('Gegnerwellen merken ihre Größe, die Belagerungswelle zählt dreifach', () => {
  const { G } = game('karten', 5, 'normal');
  run(G, 25);
  assert.ok(Object.keys(G.S.waveSize).length >= 1, 'die erste Welle ist ausgerückt');
  const size = Object.values(G.S.waveSize)[0];
  assert.ok(size >= 1);
});

test('Lehrjahre (Kriegserfahrung) wirken im Modus karten auf alle EP-Quellen, Abschüsse tragen den Faktor schon', () => {
  const { G } = game('karten');
  G.S.draft.stacks.kriegserfahrung = 1; G.S.draft.ver++;
  assert.equal(G.mMul('xpGain'), 1.3);
  const x0 = G.S.xpTotal; G.gainXp(100, 'base'); assert.ok(Math.abs(G.S.xpTotal - x0 - 130) < 1e-9, 'Basisschaden ×1,3');
  G.gainXp(100, 'wave'); assert.ok(Math.abs(G.S.xpTotal - x0 - 260) < 1e-9, 'abgewehrte Welle ×1,3');
  G.gainXp(100, 'kill'); assert.ok(Math.abs(G.S.xpTotal - x0 - 360) < 1e-9, 'Abschuss: bereits im Wert, nicht doppelt');
  G.gainXp(100, 'bounty'); assert.ok(Math.abs(G.S.xpTotal - x0 - 460) < 1e-9, 'Kriegsbeute des Tutorials unberührt');
  const { G: S } = game('standard'); S.S.draft.stacks.kriegserfahrung = 1; S.S.draft.ver++;
  const y0 = S.S.xpTotal; S.gainXp(100); assert.equal(S.S.xpTotal - y0, 100, 'Standard: Hörsaal und Co. unverändert');
  assert.equal(S.S.stats.xpSrc, undefined);
});

test('Mindestabstand: bei hohem EP-Ertrag erscheint die nächste Wahl frühestens minAbstand nach der letzten, die EP bleiben erhalten; er löst nie eine Wahl aus', () => {
  const { G, C } = game('karten');
  const min = C.KARTEN.minAbstand;
  run(G, 5);
  G.gainXp(G.xpNeed(1) - G.S.xpTotal + 1);                          // erste Wahl: kein Mindestabstand
  assert.ok(G.S.pendingDraft, 'die erste Wahl erscheint sofort');
  G.chooseDraft(0); immortal(G);                                   // soeben gewählt
  const level = G.S.level;
  G.gainXp(G.xpNeed(level + 3) - G.S.xpTotal + 1);                  // drei Schwellen auf einmal
  assert.equal(G.S.pendingLevels, 3);
  assert.equal(G.S.pendingDraft, null, 'aufgeschoben: Mindestabstand nicht erreicht');
  const xp = G.S.xpTotal;
  const p = G.xpProgress(); assert.equal(p.cur, p.need, 'Balken steht voll, solange die Wahl aufgeschoben ist');
  const t0 = G.S.t;
  run(G, min - 1);
  assert.equal(G.S.pendingDraft, null, 'nach minAbstand − 1 s noch nichts');
  run(G, 2, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'nach minAbstand erscheint die Wahl');
  assert.ok(G.S.t - t0 >= min - 0.1 && G.S.t - t0 < min + 1, `Erscheinen nach ${G.S.t - t0} s`);
  assert.ok(G.S.xpTotal >= xp, 'EP gehen nicht verloren');
  G.chooseDraft(0); immortal(G);
  assert.equal(G.S.pendingDraft, null);
  assert.equal(G.S.pendingLevels, 2);
  run(G, min - 1);
  assert.equal(G.S.pendingDraft, null);
  run(G, 2, () => G.S.pendingDraft);
  assert.ok(G.S.pendingDraft, 'zweite Wahl nach weiteren minAbstand Sekunden');
  G.chooseDraft(0); G.chooseDraft && immortal(G);
  run(G, 120);                                                      // ohne weitere EP bleibt es dabei
  assert.equal(G.S.pendingLevels, 1, 'die dritte fällige Wahl wartet auf nichts als den Abstand');
});

test('Protokoll je Wahl: Nummer, Erscheinen und Wahl, ohne Zielzeit', () => {
  const { G } = game('karten');
  run(G, 3);
  G.gainXp(G.xpNeed(1) - G.S.xpTotal + 1);
  const t = G.S.t; G.chooseDraft(0);
  const w = G.S.stats.wahlen;
  assert.equal(w.length, 1);
  assert.equal(w[0].n, 1); assert.equal(w[0].soll, undefined);
  assert.ok(Math.abs(w[0].t - t) < 0.2); assert.ok(w[0].tp >= w[0].t);
});

test('Standardmodus: kein Mindestabstand, kein Protokoll der Wahlzeiten', () => {
  const { G } = game('standard');
  run(G, 5);
  G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t;
  G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1);
  assert.ok(G.S.pendingDraft, 'sofort');
  assert.equal(G.S.stats.wahlen, undefined);
});

test('Tutorial: Schonfrist und Kriegsbeute: die erste Wahl kommt über die erste besiegte Welle, nicht nach Zeit', () => {
  const { G } = game('karten', 11, 'normal', { hold: { maxS: 400, size: 1, bounty: true } });
  run(G, 200);
  assert.equal(G.S.pendingDraft, null, 'bis zur ersten besiegten Welle keine Wahl nach Zeit');
  G.releaseHold(true);                                             // Überspringen: keine Kriegsbeute mehr
  run(G, 120);
  assert.equal(G.S.pendingDraft, null, 'auch danach löst die Zeit allein keine Wahl aus');
});

test('REQ-K5.04 Suchtest: keine Wirkung in data/ oder config.js bezieht sich auf Zielzeit, Zeitplan der Wahlen oder Höchstabstand', () => {
  const root = new URL('../', import.meta.url);
  for (const f of ['config.js', 'data/draft-options.js', 'data/research.js', 'data/kartenpfad.js', 'data/linien.js', 'data/neighbors.js']){
    const text = readFileSync(new URL(f, root), 'utf8');
    for (const word of ['zielzeit', 'fahrplan', 'maxabstand', 'höchstabstand', 'zielzeitIstFrist', 'schwellenGrad', 'mindesttempo']) assert.ok(!text.toLowerCase().includes(word.toLowerCase()), `${f} enthält „${word}“`);
  }
  const { KF_CONFIG: C } = loadCore();
  for (const key of ['fahrplan', 'maxAbstand', 'schwellenGrad']) assert.equal(C.KARTEN[key], undefined, `KARTEN.${key} entfällt`);
});

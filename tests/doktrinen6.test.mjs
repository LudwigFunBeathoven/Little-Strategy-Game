// Tests Kartenpfad Teil 6, REQ-K6.04 und K6.05: Zufallsfaktor der Doktrinen und die neuen Doktrinen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(pacing = 'karten', seed = 11, diff = 'normal'){
  const { KlammerCore, KF_CONFIG, KF_DOKTRINEN } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed, { pacing });
  G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 1e7; G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9;
  return { G, C: KF_CONFIG, D: KF_DOKTRINEN };
}
const pick = (G, ...ids) => { for (const id of ids) G.S.draft.stacks[id] = (G.S.draft.stacks[id] || 0) + 1; G.S.draft.ver++; };
const place = (G, type, i) => { G.S.material = 1e7; assert.ok(G.buildAt(i, type), `${type}: ${G.buildBlock(i, type)}`); };
const idle = G => { G.S.pendingDraft = null; G.S.pendingLevels = 0; G.S.pfad.lastPickT = G.S.t; G.S.sections.forEach(x => { x.hp = Math.max(x.hp, 1e9); }); };
const run = (G, secs) => { for (let k = 0; k < secs * 20; k++){ idle(G); G.S.nextWave = 1e9; G.S.nextOwnWave = 1e9; G.tick(0.05); } };
const rich = seed => { const { G, C } = game('karten', seed); place(G, 'kaserne', 0); place(G, 'universitaet', 1); place(G, 'fabrik', 2); G.S.level = 5; G.S.t = 200; return { G, C }; };
const offerAt = (G, wahl) => { G.S.pfad.choices = wahl - 1; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.pfad.lastPickT = -1e9; G.offerDraft(); return G.S.pendingDraft.options; };
const hasDok = (G, ids) => ids.filter(id => G.OPT[id].doktrin);

/* ---------- K6.04: Zufallsfaktor ---------- */
test('K6.04: vor Wahl 3 keine Doktrin und kein Würfeln; ab Wahl 3 beginnt p bei 15 %', () => {
  const { G, C } = rich(1);
  assert.equal(C.DOKTRIN.p.start, 0.15); assert.equal(C.DOKTRIN.p.schritt, 0.15);
  assert.equal(G.S.pfad.pDoktrin, 0.15);
  for (const w of [1, 2]){ const o = offerAt(G, w); assert.equal(hasDok(G, o).length, 0, `Wahl ${w}`); assert.equal(G.S.stats.doktrinP, undefined, 'vor Wahl 3 wird nicht gewürfelt'); assert.equal(G.S.pfad.pDoktrin, 0.15); }
  assert.equal(G.doktrinChance(), false);
  G.S.pfad.choices = 2; assert.equal(G.doktrinChance(), true);
});

test('K6.04: p steigt um 15 Prozentpunkte je Angebot ohne Doktrin und fällt nach einem Angebot mit Doktrin auf 15 % zurück', () => {
  let ohne = 0, mit = 0, maxP = 0;
  for (let seed = 1; seed <= 60; seed++){
    const { G, C } = rich(seed);
    for (let w = 3; w <= 12; w++){
      const p0 = G.S.pfad.pDoktrin, o = offerAt(G, w), m = hasDok(G, o).length > 0, p1 = G.S.pfad.pDoktrin;
      const log = G.S.stats.doktrinP[G.S.stats.doktrinP.length - 1];
      assert.equal(log.n, w); assert.equal(log.p, p0); assert.equal(log.mit, m);
      if (m){ mit++; assert.equal(p1, C.DOKTRIN.p.start, `Seed ${seed}, Wahl ${w}: nach Doktrin zurück auf Start`); }
      else { ohne++; assert.ok(Math.abs(p1 - Math.min(1, p0 + C.DOKTRIN.p.schritt)) < 1e-9, `Seed ${seed}, Wahl ${w}: ${p0} → ${p1}`); maxP = Math.max(maxP, p1); }
      if (m) break;                                   // weiter zählt erst die Wahl der Doktrin (eigener Test)
    }
  }
  assert.ok(ohne > 0 && mit > 0, `ohne ${ohne}, mit ${mit}`);
  assert.ok(maxP > 0.15, 'p ist gestiegen');
});

test('K6.04: bei p = 100 % enthält jedes Angebot genau eine Doktrin, nie zwei', () => {
  const { G } = rich(2);
  for (let n = 0; n < 200; n++){
    G.S.pfad.pDoktrin = 1;
    const o = offerAt(G, 3 + (n % 8)), d = hasDok(G, o);
    assert.equal(d.length, 1, `Angebot ${n}: ${o.join(',')}`); assert.equal(G.S.pendingDraft.doktrinRoll, true);
  }
  for (let n = 0; n < 300; n++){ G.S.pfad.pDoktrin = 0.5; assert.ok(hasDok(G, offerAt(G, 3 + (n % 8))).length <= 1, 'nie zwei Doktrinen in einem Angebot'); }
});

test('K6.04: bei p = 0 würfelt kein Angebot eine Doktrin (sie kann nur als gewöhnliche Bonuskarte auftreten)', () => {
  const { G } = rich(3);
  for (let n = 0; n < 50; n++){ G.S.pfad.pDoktrin = 0; offerAt(G, 4); assert.equal(G.S.pendingDraft.doktrinRoll, false); }
});

test('K6.04: höchstens zwei Doktrinen je Partie; danach würfelt nichts mehr', () => {
  const { G } = rich(4);
  pick(G, 'elite', 'freihandel'); assert.equal(G.doktrinCount(), 2); assert.equal(G.doktrinChance(), false);
  const p = G.S.pfad.pDoktrin;
  for (let w = 3; w <= 15; w++) assert.equal(hasDok(G, offerAt(G, w)).length, 0, `Wahl ${w}`);
  assert.equal(G.S.pfad.pDoktrin, p, 'p bleibt stehen');
  assert.equal(G.S.stats.doktrinP, undefined);
});

test('K6.04: Verteilung des ersten Angebots mit Doktrin: Median höchstens Wahl 5', () => {
  const first = [];
  for (let seed = 1; seed <= 150; seed++){
    const { G } = rich(seed); let n = 0;
    for (let w = 3; w <= 14; w++){ if (hasDok(G, offerAt(G, w)).length){ n = w; break; } }
    first.push(n || 99);
  }
  first.sort((a, b) => a - b);
  const med = first[Math.floor(first.length / 2)];
  assert.ok(med <= 5, `Median des ersten Doktrin-Angebots: Wahl ${med}`);
  assert.ok(first[0] >= 3, 'frühestens Wahl 3');
});

test('K6.04: Modus standard kennt Zufallsfaktor und Doktrinen nicht', () => {
  const { G } = game('standard'); G.S.level = 5;
  for (let w = 1; w <= 12; w++){ G.S.pfad.choices = w - 1; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.offerDraft(); assert.equal(hasDok(G, G.S.pendingDraft.options).length, 0); }
  assert.equal(G.doktrinChance(), false); assert.equal(G.S.stats.doktrinP, undefined);
});

/* ---------- K6.05: neue Doktrinen ---------- */
test('K6.05 Elite: Einheiten doppelt so stark, Versorgung halbiert', () => {
  const { G } = game(); place(G, 'kaserne', 0);
  const u0 = G.makeUnit('p', 'laeufer', 0, 100, 1), cap0 = G.supplyCap();
  pick(G, 'elite');
  const u1 = G.makeUnit('p', 'laeufer', 0, 100, 1);
  assert.ok(Math.abs(u1.maxHp / u0.maxHp - 2) < 1e-9, 'Leben ×2'); assert.ok(Math.abs(u1.dmg / u0.dmg - 2) < 1e-9, 'Schaden ×2');
  assert.equal(G.supplyCap(), Math.round(cap0 * 0.5)); assert.ok(G.supplyCap() < cap0);
});

test('K6.05 Massenaufgebot: Läufer kosten die Hälfte und ein Läufer mehr je Welle; andere Einheiten sind gesperrt', () => {
  const { G } = game(); place(G, 'kaserne', 0);
  const l0 = G.unitCost('laeufer'), w0 = G.unitCost('werfer'), x0 = G.mAdd('extraUnit');
  assert.equal(G.unitDoctrineBlock('werfer'), null);
  pick(G, 'massenaufgebot');
  assert.ok(Math.abs(G.unitCost('laeufer') / l0 - 0.5) < 0.05, `Läuferkosten ${G.unitCost('laeufer')} gegen ${l0}`);
  assert.equal(G.unitCost('werfer'), w0, 'Werferkosten unverändert');
  assert.equal(G.mAdd('extraUnit'), x0 + 1);
  assert.equal(G.unitDoctrineBlock('werfer').id, 'massenaufgebot'); assert.equal(G.unitDoctrineBlock('laeufer'), null);
  assert.equal(G.unitUnlocked('werfer'), false); assert.equal(G.unitUnlocked('laeufer'), true);
  // die Sperre gilt sofort, auch für Einheiten, die schon im Spiel sind (Bestand wird nicht entfernt, es wird nur nichts Neues gekauft)
  const { G: S } = game('standard'); assert.equal(S.unitDoctrineBlock('werfer'), null);
});

test('K6.05 Freihandel: Tausch im Kontor, Türme auf Stufe 1, Turmausbauten gesperrt, auch im Bestand', () => {
  const { G, C } = game(); G.S.t = 200;
  const FH = C.DOKTRIN.freihandel;
  G.S.lvl.turm_0 = 3; G.S.lvl.reichweite_0 = 2; G.S.lvl.turm_2 = 1;
  const r0 = G.turretRange(0), t3 = G.lv('turm_0');
  assert.equal(t3, 3);
  assert.equal(G.tradeBlock('ep'), 'notAvailable');
  pick(G, 'freihandel');
  assert.equal(G.tradeBlock('ep'), 'noKontor'); place(G, 'kontor', 0); assert.equal(G.tradeBlock('ep'), null);
  // Türme: wirksame Stufe 1, Ausbauten ohne Wirkung und gesperrt
  assert.equal(G.lv('turm_0'), 1, 'Bestand: Turm auf Stufe 3 wirkt nur noch als Stufe 1'); assert.equal(G.lv('reichweite_0'), 0);
  assert.ok(G.turretRange(0) <= r0, 'Reichweite nicht höher');
  assert.equal(G.towerBlocked('reichweite_0').id, 'freihandel'); assert.equal(G.towerBlocked('turm_0').id, 'freihandel'); assert.equal(G.towerBlocked('turm_2').id, 'freihandel');
  assert.equal(G.canBuy('turm_0'), false); assert.equal(G.canBuy('reichweite_0'), false);
  G.S.lvl.turm_0 = 0; G.S.lvl.reichweite_0 = 0; G.S.lvl.turm_2 = 0;
  assert.equal(G.towerBlocked('turm_0'), null, 'der erste Turm bleibt baubar'); assert.ok(G.canBuy('turm_0')); G.buy('turm_0');
  assert.equal(G.canBuy('turm_0'), false, 'Stufe 2 gesperrt');
  // Tausch Material → EP
  G.S.material = 1000; const xp0 = G.S.xpTotal, m0 = G.S.material;
  assert.ok(G.tradeMaterialToXp());
  assert.equal(G.S.material, m0 - FH.stapelMaterial); assert.ok(Math.abs(G.S.xpTotal - xp0 - FH.stapelMaterial * FH.kursEp) < 1e-9, `EP ${G.S.xpTotal - xp0}`);
  G.S.material = FH.stapelMaterial - 1; assert.equal(G.tradeBlock('ep'), 'material'); assert.equal(G.tradeMaterialToXp(), false);
  // Tausch EP → Material: nur Fortschritt zur nächsten Stufe ist tauschbar
  G.gainXp(100, 'kill'); const fort = G.xpFortschritt(); assert.ok(fort >= FH.stapelEp);
  G.S.material = 0; const xp1 = G.S.xpTotal; assert.ok(G.tradeXpToMaterial());
  assert.equal(G.S.xpTotal, xp1 - FH.stapelEp); assert.equal(G.S.material, FH.stapelEp * FH.kursMaterial);
  assert.ok(G.xpFortschritt() >= 0, 'nie unter den Stand der erreichten Stufe');
  while (G.xpFortschritt() >= FH.stapelEp) G.tradeXpToMaterial();
  assert.equal(G.tradeBlock('material'), 'xp'); assert.ok(G.xpFortschritt() >= 0);
  assert.ok(FH.kursEp * FH.kursMaterial < 1, 'der Tausch im Kreis verliert');
  // ohne die Doktrin kein Tausch
  const { G: H } = game(); place(H, 'kontor', 0); assert.equal(H.tradeBlock('ep'), 'notAvailable'); assert.equal(H.tradeMaterialToXp(), false);
});

test('K6.05 Raubbau: Fabriken liefern anfangs das Doppelte, der Mehrertrag verfällt in Stufen, ein Neubau erneuert ihn', () => {
  const { G, C } = game(); G.S.t = 100;
  place(G, 'fabrik', 0); const r0 = G.matRate(); assert.ok(r0 > 0);
  pick(G, 'raubbau');
  const R = C.DOKTRIN.raubbau;
  G.tick(0.05); const t0 = G.S.slots[0].raubT0; assert.ok(t0 >= 100, 'die Fabrik zählt ab jetzt');
  assert.ok(Math.abs(G.matRate() / r0 - (1 + R.bonus)) < 1e-6, `Ertrag ×${G.matRate() / r0}`);
  assert.equal(G.raubbauStufen(G.S.slots[0]), R.stufen);
  run(G, R.verfallS + 1);
  assert.equal(G.raubbauStufen(G.S.slots[0]), R.stufen - 1);
  assert.ok(Math.abs(G.matRate() / r0 - (1 + R.bonus * (R.stufen - 1) / R.stufen)) < 1e-6, 'eine Stufe weniger');
  G.S.t += R.verfallS * R.stufen; assert.equal(G.raubbauStufen(G.S.slots[0]), 0); assert.ok(Math.abs(G.matRate() / r0 - 1) < 1e-6, 'ganz verfallen: Grundertrag');
  G.demolish(0); place(G, 'fabrik', 0); G.tick(0.05);
  assert.equal(G.raubbauStufen(G.S.slots[0]), R.stufen, 'Neubau erneuert die Stufen'); assert.ok(Math.abs(G.matRate() / r0 - (1 + R.bonus)) < 1e-6);
  // Standardmodus: kein Raubbau
  const { G: S } = game('standard'); place(S, 'fabrik', 0); assert.equal(S.raubbauFactor(S.S.slots[0]), 1);
});

test('K6.05 Fabrikmiliz: jede Fabrik stellt je Minute einen Läufer ohne Versorgung, die Erträge sinken um 30 %', () => {
  const { G, C } = game(); G.S.t = 100;
  place(G, 'fabrik', 0); place(G, 'fabrik', 1); const r0 = G.matRate(), q0 = G.S.queue.length;
  pick(G, 'fabrikmiliz');
  assert.ok(Math.abs(G.matRate() / r0 - 0.7) < 1e-9, 'Ertrag −30 %');
  run(G, C.DOKTRIN.fabrikmiliz.intervalS + 1);
  const neu = G.S.queue.slice(q0); assert.equal(neu.length, 2, 'zwei Fabriken, ein Aufgebot');
  for (const q of neu){ assert.equal(q.merc, true, 'ohne Versorgung'); assert.equal(G.ownType('laeufer'), q.type); }
  assert.equal(G.S.stats.milizUnits, 2);
  run(G, C.DOKTRIN.fabrikmiliz.intervalS); assert.equal(G.S.queue.length - q0, 4);
  const { G: S } = game('standard'); place(S, 'fabrik', 0); S.S.draft.stacks.fabrikmiliz = 1; S.S.draft.ver++; run(S, 70); assert.equal(S.S.queue.length, 0, 'Standardmodus: kein Aufgebot');
});

test('K6.05 Grenzfeste: Turm-Abschüsse bringen Material, höchstens fünf Fabriken; Bestand bleibt, neue sind gesperrt', () => {
  const { G } = game(); G.S.t = 100;
  for (let i = 0; i < 7; i++) place(G, 'fabrik', i);
  assert.equal(G.mAdd('towerKillMaterial'), 0);
  pick(G, 'grenzfeste');
  assert.equal(G.mAdd('towerKillMaterial'), 3);
  assert.equal(G.countType('fabrik'), 7, 'Bestand bleibt stehen');
  assert.equal(G.buildBlock(7, 'fabrik'), 'limit'); assert.equal(G.doctrineLimit('fabrik').id, 'grenzfeste');
  assert.equal(G.doctrineExcess(G.DOK.grenzfeste), 2);
  G.demolish(0); G.demolish(1); G.demolish(2); assert.equal(G.countType('fabrik'), 4); assert.equal(G.buildBlock(0, 'fabrik'), null, 'unter der Grenze wieder baubar');
  // Kategorien: Mischdoktrin zählt für Wirtschaft und Verteidigung
  const k = G.katCounts(); assert.ok(k.wirtschaft >= 2 && k.verteidigung >= 2, `Mischdoktrin: ${JSON.stringify(k)}`);
});

test('K6.05 Zermürbung: Gegner verlieren vor der Mauer einmalig ein Viertel ihrer Lebenspunkte, Quartiere kosten die Hälfte mehr', () => {
  const { G, C } = game(); place(G, 'kaserne', 0);
  const c0 = G.upCost('ausbau'); pick(G, 'zermuerbung');
  assert.equal(G.upCost('ausbau'), Math.ceil(c0 * 1.5), 'Quartiere ×1,5');
  const near = G.makeUnit('e', 'laeufer', 0, 50 + C.PLAYER_BASE_WIDTH, 0), far = G.makeUnit('e', 'laeufer', 0, 1000 + C.PLAYER_BASE_WIDTH, 0);
  near.cd = far.cd = 1e9; G.S.units.push(near, far);
  const hn = near.hp, hf = far.hp;
  G.tick(0.05);
  assert.ok(Math.abs(near.hp - Math.max(1, hn - near.maxHp * 0.25)) < 1e-6, 'nah: −25 %'); assert.equal(near.worn, true);
  assert.equal(far.hp, hf, 'fern: unberührt'); assert.ok(!far.worn);
  const h1 = near.hp; G.tick(0.05); assert.equal(near.hp, h1, 'nur einmal');
  assert.equal(G.S.stats.zermuerbt, 1);
});

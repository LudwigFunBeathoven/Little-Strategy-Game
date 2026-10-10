// Patch 0.9.2: Upgrades, Forschungen und Karten ohne Wirkung (Versorgungslimit am harten Deckel).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

let MODE = 'standard';
function game(){
  const { KlammerCore, KF_CONFIG, KF_PFAD } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('leicht', 11, { intro: false, pacing: MODE });
  G.S.material = 1e7;
  if (MODE === 'karten'){                                                // Modus karten: alle Pfadkarten gewählt, alle Schlüssel offen – geprüft wird allein die Wirkung
    for (const k of KF_PFAD.karten){
      if (k.familie === 'wagnis') continue;                              // Wagnis „Volle Auslastung“ verdoppelt die Versorgung: eigener Test
      G.S.draft.stacks[k.id] = 1;
      for (const key of k.schaltetFrei || []) if (!key.startsWith('stufe:')) G.unlockKey(key);
      for (const r of k.oeffnetForschung || []) G.unlockKey('forschung:' + r);
    }
    for (const r of KF_PFAD.forschungen || []) G.S.research.done[r.id] = 1;       // Pfadforschungen fertig: Upgrade-Stufen offen (Quelle „stufe:ausbau:1“ liegt an Reiter/Armbrust)
    for (const r of ['r_logistik', 'r_drill']) G.unlockKey('forschung:' + r);
    G.S.draft.ver++; G.S.research.ver++;
  }
  G.build('kaserne'); G.build('universitaet');
  return { G, C: KF_CONFIG };
}

for (const mode of ['standard', 'karten']){
test(`[${mode}] Kaserne-Ausbau: bringt Versorgung, solange der Deckel nicht erreicht ist`, () => {
  MODE = mode;
  const { G } = game();
  assert.equal(G.supplyCapped(), false);
  assert.equal(G.noEffect('ausbau'), false);
  const before = G.supplyCap();
  assert.equal(G.buy('ausbau'), true);
  assert.ok(G.supplyCap() > before, 'Ausbau erhöht das Limit');
});

test(`[${mode}] Kaserne-Ausbau: am Deckel von 15 nicht mehr kaufbar (kein „15 → 15“)`, () => {
  MODE = mode;
  const { G, C } = game();
  G.S.research.done.r_logistik = 3; G.S.research.ver++;                 // +3 Versorgung aus der Forschung
  let n = 0;
  while (!G.noEffect('ausbau') && G.canBuy('ausbau') && n++ < 10) G.buy('ausbau');
  assert.ok(G.supplyCap() >= C.SUPPLY_CAP_MAX, `Deckel erreicht (${G.supplyCap()})`);
  const lvl = G.S.lvl.ausbau, m = G.S.material;
  assert.ok(lvl < C.UPGRADES.ausbau.max, 'der Deckel kommt vor der letzten Ausbaustufe');
  assert.equal(G.noEffect('ausbau'), true);
  assert.equal(G.canBuy('ausbau'), false);
  assert.equal(G.buy('ausbau'), false);
  assert.equal(G.S.lvl.ausbau, lvl); assert.equal(G.S.material, m, 'kein Material abgebucht');
});

test(`[${mode}] Forschung Logistik: am Deckel gesperrt mit Grund „noEffect“, sonst frei`, () => {
  MODE = mode;
  const { G, C } = game();
  assert.equal(G.researchBlock('r_logistik'), null);
  assert.equal(G.researchBlock('r_drill'), null);
  G.S.research.done.r_logistik = 1; G.S.research.ver++;
  let n = 0; while (G.canBuy('ausbau') && G.supplyCap() < C.SUPPLY_CAP_MAX && n++ < 10) G.buy('ausbau');
  G.S.draft.stacks.aushebung = 3; G.S.draft.ver++;
  assert.ok(G.supplyCap() >= C.SUPPLY_CAP_MAX, `Deckel erreicht (${G.supplyCap()})`);
  assert.equal(G.researchBlock('r_logistik'), 'noEffect');
  assert.equal(G.researchBlock('r_drill'), null, 'andere Forschungen bleiben frei');
});

test(`[${mode}] Karten nur für Versorgung stehen am Deckel nicht mehr zur Wahl (Aushebung, Große Armee)`, () => {
  MODE = mode;
  const { G, C } = game();
  assert.equal(G.optionAvailable(G.OPT.aushebung), true);
  assert.equal(G.optionAvailable(G.OPT.grosseArmee), true);
  G.S.research.done.r_logistik = 3; G.S.research.ver++;
  let n = 0; while (G.canBuy('ausbau') && G.supplyCap() < C.SUPPLY_CAP_MAX && n++ < 10) G.buy('ausbau');
  assert.ok(G.supplyCap() >= C.SUPPLY_CAP_MAX, `Deckel erreicht (${G.supplyCap()})`);
  assert.equal(G.optionAvailable(G.OPT.aushebung), false);
  assert.equal(G.optionAvailable(G.OPT.grosseArmee), false);
  assert.equal(G.optionAvailable(G.OPT.drill), true, 'andere Karten bleiben wählbar');
});
}

test('[karten] Wagnis „Volle Auslastung“ (Versorgung × 2) erscheint am Deckel nicht mehr, davor schon', () => {
  MODE = 'karten';
  const { G, C } = game();
  G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; G.S.pfad.choices = 6;
  assert.equal(G.supplyCapped(), false);
  assert.equal(G.optionAvailable(G.OPT.volleAuslastung), true);
  G.S.research.done.r_logistik = 3; G.S.research.ver++;
  let n = 0; while (G.canBuy('ausbau') && G.supplyCap() < C.SUPPLY_CAP_MAX && n++ < 10) G.buy('ausbau');
  assert.ok(G.supplyCap() >= C.SUPPLY_CAP_MAX, `Deckel erreicht (${G.supplyCap()})`);
  assert.equal(G.optionAvailable(G.OPT.volleAuslastung), false);
});

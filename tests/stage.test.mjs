// Tests Kartenbühne, REQ-KP.03: Spielzeit bei offener Wahl (pause, langsam, lauf).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

function game(zeit){
  const { KlammerCore, KF_CONFIG } = loadCore();
  KF_CONFIG.KARTENBUEHNE.zeit = zeit;
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('leicht', 7, { intro: false });
  G.S.xpTotal = G.xpNeed(2); G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 99990, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 });
  G.tick(0.05);
  return { G, C: KF_CONFIG };
}
const open = ({ G }) => { for (let i = 0; i < 40 && !G.S.pendingDraft; i++){ G.S.xpTotal = G.xpNeed(G.S.level + 1); G.S.xp = G.S.xpTotal; G.tick(0.05); } return !!G.S.pendingDraft; };

test('Standard: offene Wahl pausiert Spielzeit, Material und Einheiten', () => {
  const g = game('pause'); assert.equal(g.C.KARTENBUEHNE.zeit, 'pause');
  g.G.S.xpTotal = g.G.xpNeed(g.G.S.level + 1); g.G.S.xp = g.G.S.xpTotal;
  g.G.S.pendingDraft || g.G.tick(0.05);
  if (!g.G.S.pendingDraft) assert.ok(open(g));
  const a = JSON.stringify([g.G.S.t, g.G.S.material, g.G.S.units.map(u => u.x)]);
  for (let i = 0; i < 100; i++) g.G.tick(0.05);
  assert.equal(JSON.stringify([g.G.S.t, g.G.S.material, g.G.S.units.map(u => u.x)]), a);
});

test('langsam: die Spielzeit läuft mit dem Faktor, lauf: voll', () => {
  for (const [zeit, faktor] of [['langsam', 0.2], ['lauf', 1]]){
    const g = game(zeit); assert.ok(open(g) || g.G.S.pendingDraft);
    const t0 = g.G.S.t;
    for (let i = 0; i < 100; i++) g.G.tick(0.05);
    const f = (g.G.S.t - t0) / 5;
    assert.ok(Math.abs(f - (zeit === 'langsam' ? g.C.KARTENBUEHNE.langsamFaktor : 1)) < 1e-6, `${zeit}: Faktor ${f}`);
    assert.ok(g.G.S.pendingDraft, 'die Wahl bleibt offen');
  }
});

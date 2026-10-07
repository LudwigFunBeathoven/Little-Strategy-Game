// Tests Tutorial, REQ-T.06: Partien ohne Tutorial bleiben durch die Tutorial-Änderung unverändert.
// Die Werte wurden mit REQ-R.03 (Bot-Korrektur bei vollem Raster) neu erzeugt (vorher Version 0.7, Commit 2211210); gleicher Seed muss dasselbe Ergebnis liefern.
// Ändert jemand absichtlich Regeln oder Balancing, müssen diese Werte bewusst neu erzeugt werden (Skript im Test unten).
import test from 'node:test';
import assert from 'node:assert/strict';
import { playGame } from '../tools/sim-bot.mjs';

const GOLDEN = [
 {
  "diff": "leicht",
  "seed": 101,
  "profile": "aktiv",
  "strategy": "gierig",
  "status": "won",
  "t": 359.55,
  "level": 3,
  "maxArmy": 30,
  "waves": 16,
  "wavesFull": 11,
  "cards": [
   "fliessband",
   "schwerePressen",
   "werkmeister"
  ],
  "unitShare": 0.6413,
  "built": {
   "fabrik": 5,
   "kaserne": 1,
   "schmiede": 1,
   "kontor": 1,
   "universitaet": 1
  }
 },
 {
  "diff": "normal",
  "seed": 202,
  "profile": "durchschnitt",
  "strategy": "gierig",
  "status": "won",
  "t": 382.7,
  "level": 4,
  "maxArmy": 22,
  "waves": 19,
  "wavesFull": 7,
  "cards": [
   "bessereFabriken",
   "kriegsanleihe",
   "doppelschicht",
   "grossauftrag"
  ],
  "unitShare": 0.6444,
  "built": {
   "fabrik": 5,
   "kaserne": 1,
   "schmiede": 1,
   "kontor": 1,
   "universitaet": 1
  }
 },
 {
  "diff": "normal",
  "seed": 303,
  "profile": "durchschnitt",
  "strategy": "einheiten-zuerst",
  "status": "won",
  "t": 374.2,
  "level": 4,
  "maxArmy": 22,
  "waves": 19,
  "wavesFull": 11,
  "cards": [
   "fliessband",
   "turmkanoniere",
   "schwerePressen",
   "bessereFabriken"
  ],
  "unitShare": 0.7033,
  "built": {
   "fabrik": 5,
   "kaserne": 1,
   "schmiede": 1,
   "kontor": 1,
   "universitaet": 1
  }
 },
 {
  "diff": "schwer",
  "seed": 404,
  "profile": "aktiv",
  "strategy": "einheiten-zuerst",
  "status": "won",
  "t": 349.75,
  "level": 5,
  "maxArmy": 30,
  "waves": 18,
  "wavesFull": 10,
  "cards": [
   "kriegstrommeln",
   "taktiker",
   "bastion",
   "vorposten",
   "doppelschicht"
  ],
  "unitShare": 0.7245,
  "built": {
   "fabrik": 5,
   "kaserne": 1,
   "schmiede": 1,
   "kontor": 1,
   "universitaet": 1
  }
 }
];

for (const g of GOLDEN){
  test(`Partie ohne Tutorial unverändert: ${g.diff} ${g.profile} ${g.strategy} Seed ${g.seed}`, () => {
    const r = playGame({ diff: g.diff, seed: g.seed, profile: g.profile, strategy: g.strategy, maxMin: 12 });
    const got = { status: r.status, t: +r.t.toFixed(3), level: r.level, maxArmy: r.maxArmy, waves: r.waves, wavesFull: r.wavesFull || 0,
                  cards: [...r.cards], unitShare: r.unitShare == null ? null : +r.unitShare.toFixed(4), built: { ...r.built } };
    const want = { status: g.status, t: g.t, level: g.level, maxArmy: g.maxArmy, waves: g.waves, wavesFull: g.wavesFull, cards: g.cards, unitShare: g.unitShare, built: g.built };
    assert.deepEqual(got, want);
  });
}

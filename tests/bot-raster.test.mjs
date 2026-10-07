// REQ-R.03: Der Simulations-Bot hält bei vollem Raster kein Material zurück.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Bot, PROFILES, newGame } from '../tools/sim-bot.mjs';

function setup(strategy){
  const G = newGame('normal', 7);
  G.S.slots = G.S.slots.map(() => ({ type: 'fabrik', paid: 0 }));        // alle neun Plätze belegt: es gibt nichts mehr zu bauen
  G.S.material = 2000;
  const bot = new Bot(Object.assign({}, PROFILES.durchschnitt, { strategy, seed: 3, lookahead: false }));
  return { G, bot };
}

for (const strategy of ['zufall', 'gierig']){
  test(`Bot (${strategy}) kauft bei vollem Raster Einheiten, statt Material zurückzuhalten`, () => {
    const { G, bot } = setup(strategy);
    assert.ok(!G.S.slots.some(x => !x), 'Raster voll');
    bot.act(G, null);
    assert.ok(G.S.queue.length > 0, `Warteschlange nach act: ${G.S.queue.length}`);
  });
}

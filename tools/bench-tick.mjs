// Tick-Zeit messen (REQ-5.05, REQ-5.09): 2 × n Einheiten in allen drei Lanes, Median über viele Ticks.
// Aufruf: node tools/bench-tick.mjs [--units 60] [--ticks 400]
import { loadCore } from './load-core.mjs';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? Number(process.argv[i + 1]) : def; };
const N = arg('units', 60), TICKS = arg('ticks', 400);
const { KlammerCore, KF_CONFIG: C } = loadCore();

function setup(){
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7);
  G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = [];
  G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
  const per = Math.ceil(N / C.LANE_COUNT);
  for (let l = 0; l < C.LANE_COUNT; l++){
    const types = k => Array.from({ length: k }, (_, i) => i % 3 === 2 ? 'werfer' : 'laeufer');
    G.addFormation('p', l, types(per), C.PLAYER_BASE_WIDTH + 200);
    G.addFormation('e', l, types(per), C.PLAYER_BASE_WIDTH + 320);
  }
  // Einheiten robust, damit die Zahl über die Messung konstant bleibt
  for (const u of G.S.units){ u.hp = u.maxHp = 1e9; }
  return G;
}
const G = setup();
for (let i = 0; i < 100; i++) G.tick(C.TICK_S);          // Aufwärmen, Kontakt herstellen
const times = [];
for (let i = 0; i < TICKS; i++){ const t0 = process.hrtime.bigint(); G.tick(C.TICK_S); times.push(Number(process.hrtime.bigint() - t0) / 1e6); }
times.sort((a, b) => a - b);
const q = p => times[Math.min(times.length - 1, Math.floor(times.length * p))];
console.log(JSON.stringify({ units: G.S.units.length, medianMs: +q(0.5).toFixed(4), p95Ms: +q(0.95).toFixed(4) }));

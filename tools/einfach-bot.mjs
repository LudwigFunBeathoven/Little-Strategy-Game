// Klammerfront – Gegenprobe zur Simulation (I5.9): der einfache Browser-Bot (tools/browser-bot.js, ohne Vorausschau) je Profil und Schwierigkeitsgrad.
// Aufruf: node tools/einfach-bot.mjs [profil] [partien]      Beispiel: node tools/einfach-bot.mjs aktiv 50
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { PROFILES } from './sim-bot.mjs';

const root = new URL('../', import.meta.url);
const ctx = { Math, Date, JSON, console, Intl }; vm.createContext(ctx);
for (const f of ['config.js', 'data/draft-options.js', 'data/research.js', 'core.js', 'tools/browser-bot.js'])
  vm.runInContext(readFileSync(new URL(f, root), 'utf8'), ctx, { filename: f });
const prof = process.argv[2] || 'aktiv', N = Number(process.argv[3]) || 20;
const mmss = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
for (const diff of ['leicht', 'normal', 'schwer']){
  const won = [];
  for (let s = 0; s < N; s++){
    const G = vm.runInContext('KlammerCore.create()', ctx); G.FX.on = false; G.newGame(diff, 1000 + s);
    const bot = vm.runInContext('KF_BROWSER_BOT', ctx)(G, PROFILES[prof]);
    while (G.S.status === 'running' && G.S.t < 1800) bot.step(0.05);
    if (G.S.status === 'won') won.push(G.S.t);
  }
  won.sort((a, b) => a - b);
  console.log(`${prof.padEnd(12)} ${diff.padEnd(7)} Siege ${String(won.length).padStart(3)}/${N}  Median Sieg ${won.length ? mmss(won[Math.floor(won.length / 2)]) : '–'}`);
}

// Klammerfront — Balancing-Simulator
// Lädt die Kernlogik direkt aus index.html und lässt Bots viele Partien spielen.
// Aufruf:  node tools/simulate.mjs [Runden pro Kombination, Standard 8]

import { loadCore } from './load-core.mjs';

const RUNS = Number(process.argv[2] || 8);
const MAX_MIN = 30;

function makeGame(diff, seed){
  const { KlammerCore, KF_CONFIG } = loadCore();
  const G = KlammerCore.create(); G.FX.on = false; G.newGame(diff, seed);
  return Object.assign(G, { DIFFICULTY: KF_CONFIG.DIFFICULTY });
}

// Spielertypen: Klicks pro Sekunde, Reaktionsintervall (s), Einheiten-Limit, Nutzung von Gebäuden/Upgrades
const PROFILES = {
  aktiv:        { cps:3,   every:0.25, cap:30, build:true,  upgrades:true,  scrapUse:true  },
  durchschnitt: { cps:1.5,   every:1,    cap:22, build:true,  upgrades:true,  scrapUse:true  },
  gelegentlich: { cps:0.7,  every:3,    cap:15, build:true,  upgrades:true,  scrapUse:false },
  passiv:       { cps:0.3, every:3,    cap:10, build:false, upgrades:false, scrapUse:false },
};
const BUILD_ORDER = ['fabrik', 'schmiede', 'universitaet'];
const MAT_PRIO   = ['fertiger', 'presse', 'takt', 'hydraulik', 'serie', 'klingen', 'ruestung', 'drill'];
const SCRAP_PRIO = ['turm', 'beute', 'logistik', 'mauer', 'kadenz', 'reichweite', 'stacheln', 'moertel'];

function play(diff, prof, seed){
  const K = makeGame(diff, seed);
  const S = () => K.S;
  let clickAcc = 0, actAcc = 0, mix = 0;
  const dt = 0.05;
  for (let i = 0; i < MAX_MIN * 60 / dt; i++){
    K.tick(dt);
    clickAcc += prof.cps * dt;
    while (clickAcc >= 1){ K.doClick(); clickAcc--; }
    actAcc += dt;
    if (actAcc >= prof.every){
      actAcc = 0;
      if (prof.scrapUse && S().baseHp < K.baseMax() * 0.5) K.repair();
      const own = S().units.filter(u => u.side === 'p').length;
      const threat = S().units.some(u => u.side === 'e' && u.x < 400);
      const trySpawn = (n = 5) => { for (let k = 0; k < n; k++){ if (own + S().queue.length >= prof.cap) break; if (mix % 3 === 2 ? K.spawn('werfer') : K.spawn('laeufer')) mix++; else break; } };
      // Bei Bedrohung zuerst verteidigen, sonst zuerst investieren (wie ein Mensch, der spart)
      if (threat && own < 4) trySpawn(2);
      if (prof.build) for (const b of BUILD_ORDER) if (K.build(b)) break;
      if (prof.upgrades){
        for (const id of MAT_PRIO) K.buy(id);
        if (prof.scrapUse) for (const id of SCRAP_PRIO) K.buy(id);
        else { K.buy('turm'); K.buy('mauer'); }
      } else K.buy('fertiger');
      // Rücklage für den nächsten Bauplatz halten, solange keine Bedrohung besteht
      const econTarget = Math.min(K.upCost('fertiger'), prof.build && S().slots.includes(null) ? K.nextSlotCost() : Infinity);
      const reserve = threat ? 0 : econTarget * 0.7;
      while (S().material - reserve >= 12 && own + S().queue.length < prof.cap && S().queue.length < 5){ const q = S().queue.length; trySpawn(1); if (S().queue.length === q) break; }
    }
    if (S().status !== 'running') break;
  }
  return { status:S().status, t:S().t, ebase:S().enemyBaseHp / K.DIFFICULTY[diff].enemyBaseHp };
}

const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const mmss = t => t == null ? '–' : `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;

console.log(`${RUNS} Partien je Kombination, Abbruch nach ${MAX_MIN} min\n`);
console.log('Schwierigkeit | Spielertyp   | Siege | Niederl. | offen | Median Sieg | Median Niederlage');
for (const diff of ['leicht', 'normal', 'schwer']){
  for (const [pname, prof] of Object.entries(PROFILES)){
    const res = [];
    for (let r = 0; r < RUNS; r++) res.push(play(diff, prof, 1000 + r * 7919));
    const won = res.filter(r => r.status === 'won'), lost = res.filter(r => r.status === 'lost'), open = res.filter(r => r.status === 'running');
    console.log(`${diff.padEnd(13)} | ${pname.padEnd(12)} | ${String(won.length).padStart(5)} | ${String(lost.length).padStart(8)} | ${String(open.length).padStart(5)} | ${mmss(median(won.map(r => r.t))).padStart(11)} | ${mmss(median(lost.map(r => r.t))).padStart(10)}`);
  }
}

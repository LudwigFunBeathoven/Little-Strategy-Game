// Klammerfront – Testspiele mit Invarianten-Prüfung in jedem Takt (Material, EP, Einheiten im Feld, Mauer, Angebote, Doktrinen, Forschung, Varianten,
// Determinismus einer Kopie ab Minute 5, Speichern/Laden über adopt). Bot „Einheiten zuerst“, 3 Grade × 3 Profile × n Seeds, je Partie bis 30 min.
// Aufruf: node tools/testspiele.mjs <Pfad zum Repo> [standard|karten] [Seeds je Feld] [militaer,wirtschaft,verteidigung]
// Läuft auch gegen einen Checkout von main (gleiche Schnittstellen: tools/load-core.mjs, tools/browser-bot.js).
import { pathToFileURL } from 'node:url';
const [repo, pacing = 'standard', nSeeds = '10', katArg = ''] = process.argv.slice(2);
if (pacing === 'karten') process.env.KF_PACING = 'karten';
const { resolve } = await import('node:path');
const { loadCore } = await import(pathToFileURL(resolve(repo) + '/tools/load-core.mjs'));
const core = loadCore();
const { KlammerCore, KF_CONFIG: C, KF_BROWSER_BOT } = core;
const PROFILES = { aktiv: { cps: 3, every: 0.25, cap: 30, useWall: true }, durchschnitt: { cps: 1.5, every: 1, cap: 22, useWall: true }, gelegentlich: { cps: 0.7, every: 3, cap: 15, useWall: false } };
const kats = katArg ? katArg.split(',') : [null];
const issues = new Map(); const note = (k, d) => { const e = issues.get(k) || { n: 0, ex: d }; e.n++; issues.set(k, e); };
const fin = x => typeof x === 'number' && Number.isFinite(x);
let games = 0, statusCount = {}, totalT = 0;
for (const diff of ['easy', 'normal', 'hard'].map(d => C.DIFFICULTY[d] ? d : ({ easy: 'leicht', normal: 'normal', hard: 'schwer' })[d]))
for (const prof of Object.keys(PROFILES)) for (const kat of kats) for (let s = 0; s < Number(nSeeds); s++){
  const seed = 1000 + s * 7919;
  const G = KlammerCore.create(); G.FX.on = false;
  try { G.newGame(diff, seed, { pacing }); } catch (e) { note('newGame wirft', e.message); continue; }
  const bot = KF_BROWSER_BOT(G, Object.assign({}, PROFILES[prof], kat ? { kat, pfad: (KF_BROWSER_BOT.KAT_PFAD || {})[kat] } : {}), {});
  const tag = `${diff}/${prof}/${kat || '-'}/${seed}`;
  let lastXp = 0, lastT = -1, forked = false;
  try {
    for (let k = 0; k < 30 * 60 / C.TICK_S && G.S.status === 'running'; k++){
      bot.step(C.TICK_S);
      const S = G.S;
      if (!fin(S.material)) note('Material nicht endlich', tag);
      if (S.material < -1e-6) note('Material negativ', `${tag} t=${S.t.toFixed(1)} ${S.material}`);
      if (!fin(S.xpTotal)) note('EP nicht endlich', tag);
      if (S.xpTotal < lastXp - 1e-6 && !(S.stats && S.stats.tradeXp)) note('EP sinken', `${tag} t=${S.t.toFixed(1)}`);
      lastXp = S.xpTotal;
      if (S.t <= lastT) note('Zeit steht/läuft rückwärts', tag); lastT = S.t;
      for (const u of S.units){
        if (!fin(u.hp) || !fin(u.x) || !fin(u.laneF)) { note('Einheit mit NaN', `${tag} ${u.type}`); break; }
        if (u.hp > u.maxHp + 1e-6) note('Einheit über maxHp', `${tag} ${u.type} ${u.hp}/${u.maxHp}`);
        if (u.x < -1 || u.x > C.LANE + 1) note('Einheit außerhalb des Feldes', `${tag} ${u.side} ${u.type} x=${u.x.toFixed(0)}`);
        if (u.laneF < -0.01 || u.laneF > C.LANE_COUNT - 1 + 0.01) note('Einheit außerhalb der Lanes', `${tag} laneF=${u.laneF}`);
      }
      S.sections.forEach((sec, i) => { if (!fin(sec.hp)) note('Mauer NaN', tag); else if (sec.hp > G.sectionMax(i) + 1e-6) note('Mauer über Maximum', `${tag} ${i} ${sec.hp}/${G.sectionMax(i)}`); });
      if (!fin(S.enemyBaseHp)) note('Gegnerbasis NaN', tag);
      if (S.pendingDraft){ const o = S.pendingDraft.options; if (new Set(o).size !== o.length) note('Karte doppelt im Angebot', `${tag} ${o}`); if (o.some(id => !G.OPT[id])) note('unbekannte Karte im Angebot', tag); }
      if (G.doktrinCount && G.doktrinCount() > C.DOKTRIN.max) note('mehr Doktrinen als erlaubt', tag);
      if (S.research && S.research.active.length > (G.researchSlots ? G.researchSlots() : 1)) note('zu viele Forschungen gleichzeitig', tag);
      if (S.slots.some(sl => sl && sl.variant && G.VAR && (!G.VAR[sl.variant] || G.VAR[sl.variant].basis !== sl.type))) note('Variante passt nicht zum Gebäude', tag);
      if (S.slots.some(sl => sl && !C.BUILDINGS.includes(sl.type))) note('unbekanntes Gebäude', tag);
      // Determinismus: Kopie ab Minute 5 läuft 60 s gleich weiter
      if (!forked && S.t >= 300){
        forked = true;
        const A = KlammerCore.create(); A.FX.on = false; A.S = G.snapshot();
        const B = KlammerCore.create(); B.FX.on = false; B.S = G.snapshot();
        for (let j = 0; j < 60 / C.TICK_S; j++){ A.tick(C.TICK_S); B.tick(C.TICK_S); }
        if (JSON.stringify(A.S) !== JSON.stringify(B.S)) note('Kopien laufen auseinander (Determinismus)', tag);
        // Speichern und Laden (adopt) ohne Fehler
        const D = KlammerCore.create(); D.FX.on = false;
        try { const r = D.adopt(JSON.parse(JSON.stringify(G.S))); if (r === false) note('adopt lehnt aktuellen Stand ab', tag); D.tick(C.TICK_S); } catch (e) { note('adopt/Tick wirft', e.message); }
      }
    }
  } catch (e) { note('Ausnahme im Spiel', `${tag}: ${e.message} ${(e.stack || '').split('\n')[1] || ''}`); }
  games++; statusCount[G.S.status] = (statusCount[G.S.status] || 0) + 1; totalT += G.S.t;
}
console.log(`${repo.split('/').pop()} pacing=${pacing} kats=${katArg || '-'}: ${games} Partien, Ergebnis ${JSON.stringify(statusCount)}, Spielzeit ${(totalT / 3600).toFixed(1)} h`);
for (const [k, v] of issues) console.log(`  ${k}: ${v.n}× (z. B. ${String(v.ex).slice(0, 160)})`);
if (!issues.size) console.log('  keine Verletzung');

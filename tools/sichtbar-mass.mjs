// Kennzahl „sichtbare Bedienelemente“ (REQ-K2.08): fester Lauf (Seed, Bot „einheiten-zuerst“, Profil „durchschnitt“, Normal),
// gemessen in Minute 1, 5 und 10. Zählt Knöpfe und Reiter, die der Spieler sieht (checkVisibility), ohne offene Bühne.
// Aufruf: node tools/sichtbar-mass.mjs [--root <Ordner>] [--query "pacing=karten"] [--label x] [--json datei]
// Braucht Playwright (nicht Teil des Projekts), wie tests/browser-check.mjs.
import http from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]]] : a, []));
const root = resolve(args.root || new URL('../', import.meta.url).pathname) + '/';
const query = args.query || 'pacing=karten', SEED = Number(args.seed || 424242);
const { chromium } = await import('playwright');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !existsSync(f)){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' }); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${server.address().port}/index.html?dev=1&tutorial=0&lang=de&difficulty=normal&${query}`);
await p.evaluate(() => { localStorage.setItem('klammerfront.skipIntro', '0'); });
await p.waitForTimeout(400);
await p.addScriptTag({ path: join(root, 'tools/browser-bot.js') });
const PROFILE = { cps: 3, every: 2.5, cap: 14, useWall: true };                         // „durchschnitt“ aus tools/sim-bot.mjs
await p.evaluate(({ seed, query }) => {
  const pacing = new URLSearchParams(query).get('pacing') || undefined;
  __kf.G.newGame('normal', seed, { pacing, intro: true });
  window.__bot = KF_BROWSER_BOT(__kf.G, window.__PROFILE || null);
  __kf.requestRender();
}, { seed: SEED, query });
/* Zählt, was der Spieler zu sehen bekäme: alle Reiterflächen werden für die Messung kurz aufgeklappt (sonst zählte nur der offene Reiter);
   „Rahmen“ (Menü, Kamera, Raster-Plätze, Hinweisknopf) ist in jeder Phase gleich und wird getrennt ausgewiesen. */
const sample = () => p.evaluate(() => {
  const panels = [...document.querySelectorAll('.tabpanel')], was = panels.map(x => x.hidden);
  panels.forEach(x => { const tab = document.getElementById('tab-' + x.id.replace('panel-', '')); x.hidden = !(tab && !tab.hidden); });
  const FRAME = /^(pauseBtn|langBtn|newBtn|sessionBtn|camRealm|camFront|camFollow|hintOk|tutSkipBtn|resumeBtn)$/;
  const btn = [...document.querySelectorAll('button, [role="tab"]')]
    .filter(e => e.checkVisibility() && !e.closest('#modal, .modal, #stage') && e.getBoundingClientRect().width > 0)
    .map(e => ({ k: (e.id || '') + '|' + (e.dataset.tooltip || '') + '|' + (e.querySelector('.btn-label, .opt-name') || e).textContent.trim().slice(0, 24), frame: FRAME.test(e.id) || (e.dataset.tooltip || '').startsWith('grid:') }));
  const hud = [...document.querySelectorAll('.hud-item')].filter(e => e.checkVisibility()).map(e => 'hud|' + (e.dataset.tooltip || e.id));
  panels.forEach((x, i) => { x.hidden = was[i]; });
  return { game: btn.filter(x => !x.frame).map(x => x.k).concat(hud), frame: btn.filter(x => x.frame).length };
});
const out = {};
for (const minute of [1, 5, 10]){
  await p.evaluate(({ s, prof }) => { if (!window.__bot2) window.__bot2 = KF_BROWSER_BOT(__kf.G, prof);
    const stop = s; while (__kf.G.S.t < stop && __kf.G.S.status === 'running') window.__bot2.step(0.05); }, { s: minute * 60, prof: PROFILE });
  await p.evaluate(() => { __kf.requestRender(); }); await p.waitForTimeout(300);
  const sm = await sample(), els = sm.game; out['min' + minute] = { n: els.length, frame: sm.frame, els };
  if (args.verbose) console.error(minute, await p.evaluate(() => { const S = __kf.G.S; return JSON.stringify({ t: Math.round(S.t), st: S.status, slots: S.slots.filter(Boolean).map(x => x.type), lvl: S.level, pend: !!S.pendingDraft, xp: Math.round(S.xpTotal), own: S.ownWaveNo }); }));
}
const first = new Set(out.min1.els);
out.neu1bis10 = out.min10.els.filter(x => !first.has(x)).length;
const res = { label: args.label || query, query, seed: SEED, min1: out.min1.n, min5: out.min5.n, min10: out.min10.n, neu1bis10: out.neu1bis10, rahmen: out.min1.frame };
console.log(JSON.stringify(res));
if (args.json) writeFileSync(args.json, JSON.stringify(Object.assign(res, { elemente: { min1: out.min1.els, min5: out.min5.els, min10: out.min10.els } }), null, 1));
await b.close(); server.close();

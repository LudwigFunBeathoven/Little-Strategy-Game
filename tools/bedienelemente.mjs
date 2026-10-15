// Sichtbare Bedienelemente bei Minute 1 und 10 (REQ-K6.08, Basismessung und Abnahme). Braucht Playwright (nicht Teil des Projekts).
// Aufruf: node tools/bedienelemente.mjs [--json reports/kartenpfad6-bedienelemente-basis.json] [--profiles aktiv,durchschnitt] [--diff normal] [--query "pacing=karten"]
// Gezählt werden Schaltflächen, Reiter, Eingabefelder und Verweise, die sichtbar sind (checkVisibility); jeder Reiter wird einmal geöffnet, die Elemente aller Reiter und der Leiste gelten als
// ein Satz (je Element einmal). Ein Bot spielt die Partie bis zum Zeitpunkt (Einheiten zuerst, Profil wie in tools/sim-bot.mjs). Headless-Chromium: gezählt wird, was im Bild steht.
import http from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); } catch (e){ console.log('Playwright nicht installiert – Messung übersprungen.'); process.exit(0); }
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const root = new URL('../', import.meta.url).pathname;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !existsSync(f)){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' }); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const { PROFILES } = await import('./sim-bot.mjs');
const botSrc = new URL('./browser-bot.js', import.meta.url).pathname;
const profiles = arg('profiles', 'aktiv,durchschnitt').split(','), diff = arg('diff', 'normal'), query = arg('query', 'pacing=karten'), out = arg('json', null);
const POINTS = [60, 600];
const b = await chromium.launch();
const rows = [];
for (const profile of profiles){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=de&difficulty=${diff === 'normal' ? 'normal' : diff === 'leicht' ? 'easy' : 'hard'}&${query}`); await p.waitForTimeout(400);
  await p.addScriptTag({ path: botSrc });
  await p.evaluate(prof => { window.__bot = KF_BROWSER_BOT(__kf.G, prof); document.querySelector('#hintBox').hidden = true; }, PROFILES[profile]);
  for (const at of POINTS){
    for (let k = 0; k < 60; k++){
      const t = await p.evaluate(() => { for (let i = 0; i < 400 && __kf.G.S.status === 'running'; i++) window.__bot.step(0.05); return __kf.G.S.t; });
      await p.waitForTimeout(20);
      if (t >= at) break;
    }
    // laufende Kartenwahl abschließen, damit die Bühne die Bedienelemente nicht verdeckt
    await p.evaluate(() => { const G = __kf.G; while (G.S.pendingDraft) G.chooseDraft(0); __kf.requestRender(); });
    await p.waitForTimeout(700);
    const r = await p.evaluate(async () => {
      const SEL = 'button, [role="button"], [role="tab"], input, select, a[href]';
      const seen = new Set(), perTab = {};
      const visible = () => [...document.querySelectorAll(SEL)].filter(e => e.checkVisibility && e.checkVisibility() && e.getClientRects().length && !e.closest('[hidden]'));
      const tabs = [...document.querySelectorAll('#tabs [role="tab"]')].filter(e => !e.hidden && e.checkVisibility());
      const grab = name => { const v = visible(); perTab[name] = v.length; for (const e of v) seen.add(e); };
      grab('(Ausgangsbild)');
      for (const t of tabs){ t.click(); await new Promise(r => setTimeout(r, 250)); grab(t.id || t.textContent.trim().slice(0, 12)); }
      const lanes = seen.size;
      return { t: Math.round(__kf.G.S.t), status: __kf.G.S.status, bedienelemente: lanes, reiter: tabs.length, jeReiter: perTab, tooltips: [...seen].filter(e => e.dataset && e.dataset.tooltip).length };
    });
    rows.push({ profile, diff, minute: at / 60, ...r });
    console.log(`${profile} ${diff} Minute ${at / 60}: t=${r.t} s, ${r.bedienelemente} Bedienelemente in ${r.reiter} Reiter (${r.tooltips} mit Tooltip)`, JSON.stringify(r.jeReiter));
  }
  await ctx.close();
}
if (out) writeFileSync(out, JSON.stringify({ hinweis: 'Headless-Chromium 1280×720, je Element einmal über Leiste und alle sichtbaren Reiter', query, rows }, null, 1));
await b.close(); server.close();

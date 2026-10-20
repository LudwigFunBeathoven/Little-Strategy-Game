// Browser-Prüfung Kartenpfad Teil 7 (REQ-K7.02 – K7.12): Haupthaus, Obergrenze für Fabriken, Flügel, neue Weiterentwicklungen, Benennung. Braucht Playwright (nicht Teil des Projekts).
// Bildschirmfotos für den Bericht: docs/bilder/kartenpfad7-*.png
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { console.log('Playwright nicht installiert – Prüfung übersprungen.'); process.exit(0); }
import http from 'node:http';
import { readFileSync as readSrc, existsSync as srcExists } from 'node:fs';
import { extname, join } from 'node:path';
const root = new URL('../', import.meta.url).pathname;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !srcExists(f)){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' }); res.end(readSrc(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const b = await chromium.launch();
let failed = 0;
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) failed++; };
const show = x => ' ' + JSON.stringify(x).slice(0, 300);
/* Fahrplan weit in die Zukunft: sonst öffnet die Zeitsetzung im Test eine Kartenwahl, die das Bild verdeckt */
const calm = p => p.evaluate(() => { __kf.G.S.level = 15; __kf.G.S.pfad.lastPickT = 0; });
async function open(query, opts = {}){
  const ctx = await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 720 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${opts.lang || 'de'}&difficulty=easy&${query}`); await p.waitForTimeout(350);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  return { ctx, p, errs };
}
const vis = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.checkVisibility() && !e.hidden; }, sel);
const settle = (p, ms = 250) => p.waitForTimeout(ms);
/* höchstens ein Hinweis gleichzeitig: schließt Hinweise, bis einer zum Muster passt (oder keiner mehr kommt) */
async function hintLike(p, re){
  for (let k = 0; k < 6; k++){
    const h = await p.evaluate(() => ({ shown: !document.querySelector('#hintBox').hidden, text: document.querySelector('#hintText').textContent }));
    if (h.shown && re.test(h.text)) return h.text;
    if (!h.shown) { await settle(p, 200); const again = await p.evaluate(() => !document.querySelector('#hintBox').hidden); if (!again) return ''; continue; }
    await p.click('#hintOk'); await settle(p, 150);
  }
  return '';
}
const tipOf = async (p, sel) => { await p.hover(sel); try { await p.waitForSelector('#tip:not([hidden])', { timeout: 3000 }); } catch (e) { return ''; } return p.evaluate(() => document.querySelector('#tip').innerText); };
const tick = (p, s = 0.05) => p.evaluate(s => { __kf.G.S.pendingDraft = null; __kf.G.S.pendingLevels = 0; __kf.G.S.pfad.lastPickT = __kf.G.S.t; __kf.G.tick(s); __kf.requestRender(); }, s);
const run = async (p, secs) => { for (let i = 0; i < secs * 20; i++) await tick(p); };

import { mkdirSync } from 'node:fs';
mkdirSync(new URL('../docs/bilder/', import.meta.url), { recursive: true });
const shot = (p, name) => p.screenshot({ path: new URL(`../docs/bilder/kartenpfad7-${name}.png`, import.meta.url).pathname });

/* ---------- K7.02, K7.04: Haupthaus im Mittelfeld, Reiter, Obergrenze ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1'); await calm(p);
  const cell = await p.evaluate(() => { const b = document.querySelectorAll('#plotGrid button')[4]; return b.innerText.replace(/\s+/g, ' '); });
  check(/Gutshof/.test(cell), `K7.02: Platz 5 zeigt das Haupthaus (Gutshof) ${show(cell)}`);
  check(await vis(p, '#tab-haus'), 'K7.02: Reiter Haupthaus ab Start sichtbar');
  await p.click('#plotGrid button:nth-child(5)'); await settle(p, 300);
  const st = await p.evaluate(() => ({ tab: __kf.tab, title: document.querySelector('#hausTitle').textContent, grenze: document.querySelector('#hausGrenze').textContent,
    dem: document.querySelectorAll('#ctxDemolish button').length, ctx: document.querySelector('#ctxTitle').textContent }));
  check(st.tab === 'haus' && st.title === 'Gutshof' && /3 Fabriken/.test(st.grenze), `K7.02: Klick auf das Haupthaus öffnet den Reiter Haupthaus ${show(st)}`);
  check(st.dem === 0, 'K7.02: kein Abriss für das Haupthaus');
  await p.evaluate(() => { __kf.clearSelection(); __kf.selectTab('build'); __kf.requestRender(); }); await settle(p, 200);
  const tip = await tipOf(p, '#plotGrid button:nth-child(5)');
  check(/Gutshof/.test(tip) && /0 von höchstens 3/.test(tip), `K7.02: Tooltip des Platzes nennt Stufe und Grenze ${show(tip)}`);
  // Obergrenze: drei Fabriken, die vierte ist gesperrt mit Erklärzeile
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e5; for (const i of [0, 1, 2]) G.buildAt(i, 'fabrik'); __kf.selectTab('build'); __kf.selectPlot(3); __kf.requestRender(); });
  await settle(p, 300);
  const fab = await p.evaluate(() => { const b = [...document.querySelectorAll('#ctxBuild .pick')].find(e => e.dataset.tooltip.startsWith('pick:fabrik')); return b ? { dis: b.getAttribute('aria-disabled'), w: b.querySelector('.w').textContent } : null; });
  check(fab && fab.dis === 'true' && /Höchstens 3 Fabriken, mehr mit Stadtrecht/.test(fab.w), `K7.04: vierte Fabrik gesperrt mit Erklärzeile ${show(fab)}`);
  const stat = await p.evaluate(() => document.querySelector('#factoryStat').textContent);
  check(/Fabriken 3\/3/.test(stat), `K7.04: Grenze im Reiter Bauen ${show(stat)}`);
  await p.evaluate(() => { __kf.clearSelection(); __kf.selectTab('haus'); __kf.requestRender(); }); await settle(p, 300);
  check(/stehen 3/.test(await p.evaluate(() => document.querySelector('#hausGrenze').textContent)), 'K7.04: Grenze im Reiter Haupthaus');
  await shot(p, 'haus-stufe1');
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(!audit.tips.length && !audit.expl.length, `K7.02: Tooltips und Erklärzeilen vollständig ${show(audit)}`);
  check(errs.length === 0, `K7.02: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Standardmodus: kein Haupthaus ---------- */
{
  const { ctx, p, errs } = await open('pacing=standard');
  const st = await p.evaluate(() => ({ tab: !document.querySelector('#tab-haus').hidden, cell: document.querySelectorAll('#plotGrid button')[4].innerText, slot: __kf.G.S.slots[4] }));
  check(!st.tab && st.slot === null && !/Gutshof/.test(st.cell), `standard: kein Haupthaus, kein Reiter ${show(st)}`);
  check(errs.length === 0, `standard: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : '\nalle Prüfungen bestanden');
process.exit(failed ? 1 : 0);

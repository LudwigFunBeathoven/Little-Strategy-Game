// Browser-Prüfung Kartenpfad Teil 12 (REQ-K12.04): Preis der nächsten Karte und Wirkung der nächsten Reglerstufe im Reiter Universität und im Tooltip des Stapels.
// Braucht Playwright (nicht Teil des Projekts). Bildschirmfotos für den Bericht: docs/bilder/kartenpfad12-*.png
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
const show = x => ' ' + JSON.stringify(x).slice(0, 400);

for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${lang}&difficulty=normal&pacing=karten&entdecken=0&buehne=1&zeit=pause`); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  await p.evaluate(() => {
    const G = __kf.G; G.S.material = 1e6;
    G.S.slots[0] = { type: 'universitaet', paid: 0 }; for (const i of [1, 2, 3]) G.S.slots[i] = { type: 'fabrik', paid: 0 };
    G.S.slotVer++; G.setBudget(1);
    G.S.xpTotal = 40; G.gainXp(0, 'kill');
    xpHist.length = 0; xpHist.push({ t: G.S.t - 10, v: G.S.xpTotal - 50 });       // gleitende Rate 5 EP/s
    __kf.selectTab('uni'); __kf.requestRender();
  });
  await p.waitForTimeout(400);
  const panel = await p.evaluate(() => document.querySelector('#budgetNext').textContent);
  check(/≈ [\d.,]+ (Material|material)/.test(panel) && /\+\d+ %/.test(panel) && !/[{}]/.test(panel), `[${lang}] Reiter Universität nennt Preis und Wirkung der nächsten Stufe${show(panel)}`);
  const tip = await p.evaluate(() => { const c = __kf.tipContent('deck'); return [c.title, c.body, ...(c.rows || []).flat()].join(' | '); });
  check(/≈ [\d.,]+ (Material|material)/.test(tip) && /\+\d+ %/.test(tip) && !/[{}]/.test(tip), `[${lang}] Tooltip des Stapels nennt dieselben Werte${show(tip)}`);
  const same = await p.evaluate(() => { const z = budgetZeilen(); return z.length === 2 && document.querySelector('#budgetNext').textContent === z.join(' · '); });
  check(same, `[${lang}] Reiter und Tooltip nutzen dieselben Zeilen`);
  // höchste Stufe: keine Zeile zur nächsten Stufe
  const top = await p.evaluate(() => { __kf.G.setBudget(__kf.C.KARTEN.budget.stufen.length - 1); __kf.requestRender(); return budgetZeilen().length; });
  check(top === 1, `[${lang}] höchste Stufe: nur der Preis der nächsten Karte (${top} Zeile)`);
  await p.evaluate(() => { __kf.G.setBudget(1); __kf.requestRender(); }); await p.waitForTimeout(300);
  if (lang === 'de'){
    await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad12-universitaet.png') });
    const sym = await p.$('[data-tooltip="deck"]');
    if (sym && await sym.isVisible()){ await sym.hover(); await p.waitForTimeout(1400); await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad12-stapel-tooltip.png') }); }
    else check(false, 'Kartensymbol sichtbar für den Tooltip-Screenshot');
  }
  check(errs.length === 0, `[${lang}] keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte grün');
process.exit(failed ? 1 : 0);

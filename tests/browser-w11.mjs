// Browser-Prüfung Kartenpfad Teil 11 (REQ-K11.03): Anzeige der Flügel-Nachbarschaft (Tooltip, Reiter Haupthaus, Hervorhebung der begünstigten Plätze). Braucht Playwright (nicht Teil des Projekts).
// Bildschirmfotos für den Bericht: docs/bilder/kartenpfad11-*.png
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
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${lang}&difficulty=normal&pacing=karten&entdecken=0&buehne=0&zeit=pause`); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  for (const [name, fl, stufe] of [['rathaus', ['schatzkammer'], 2], ['residenz', ['schatzkammer', 'zeughaus'], 3]]){
    await p.evaluate(([fl, stufe]) => {
      const G = __kf.G; G.S.material = 1e7;
      G.S.slots[4] = { type: 'haupthaus', paid: 0, fixed: true };
      for (const i of [1, 3, 5]) G.S.slots[i] = { type: 'fabrik', paid: 0 };
      G.S.slots[7] = { type: 'kaserne', paid: 0 };
      G.S.haus.stufe = stufe; G.S.haus.fluegel = fl; G.S.slotVer++;
      __kf.selectPlot(4); __kf.selectTab('build'); __kf.requestRender();
    }, [fl, stufe]);
    await p.waitForTimeout(300);
    const tip = await p.evaluate(() => { const c = __kf.tipContent('grid:4'); return [c.title, c.body, ...(c.rows || []).flat()].join(' | '); });
    const hl = await p.evaluate(() => __kf.G.S.haus.fluegel.flatMap(id => [...__kf.G.fluegelNachbarn(id)]));
    check(/schatzkammer|Schatzkammer|Treasury/i.test(tip) && /[1-9]/.test(tip) && !/[{}]/.test(tip), `[${lang}] ${name}: Tooltip des Haupthauses nennt Bonus und Plätze${show(tip)}`);
    check(hl.length >= 2 && hl.every(i => i !== 4), `[${lang}] ${name}: begünstigte Plätze ${hl}`);
    await p.hover('#plotGrid [role=gridcell] >> nth=4'); await p.waitForTimeout(250);
    const nbl = await p.evaluate(() => [...document.querySelectorAll('#hausNbList li')].map(e => e.textContent));
    check(nbl.length === fl.length && nbl.every(x => !/[{}]/.test(x)), `[${lang}] ${name}: Reiter Haupthaus nennt je Flügel Bonus und Plätze${show(nbl)}`);
    const nbPrev = await p.evaluate(() => { const pr = __kf.G.neighborPreview(1, 'fabrik'); return pr.fluegel.map(f => f.id); });
    check(nbPrev.includes('schatzkammer'), `[${lang}] ${name}: Nachbarschaftszeile führt den Flügel als Geber ${nbPrev}`);
    if (lang === 'de') await p.screenshot({ path: join(root, `docs/bilder/kartenpfad11-${name}.png`) });
  }
  check(errs.length === 0, `[${lang}] keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte grün');
process.exit(failed ? 1 : 0);

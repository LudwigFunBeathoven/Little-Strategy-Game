// Browser-Prüfung Kartenpfad, Inkrement X.2: Das Tutorial erklärt im Modus karten das Haupthaus in der Mitte (zwei Sprechblasen ohne Auftrag, Rahmen auf dem Platz des Haupthauses);
// im Standardmodus gibt es den Schritt nicht. Braucht Playwright (nicht Teil des Projekts). Bildschirmfoto: docs/bilder/kartenpfad-tutorial-haupthaus.png
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
const tx = (p, key) => p.evaluate(k => __kf.t(k), key);
const bubble = p => p.evaluate(() => ({ hidden: document.querySelector('#tutBubble').hidden, narr: document.querySelector('#tutBubbleNarr').textContent, taskHidden: document.querySelector('#tutBubbleTask').hidden, clickable: document.querySelector('#tutBubble').classList.contains('clickable'),
  phase: __kf.Tutorial.view().phase, step: (__kf.Tutorial.view().step || {}).id || null, world: __kf.TutUI.target ? __kf.TutUI.target.world : null,
  marked: [...document.querySelectorAll('.tut-target')].map(e => e.dataset.tooltip || e.id), vis: (() => { const r = document.querySelector('#tutBubble').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; })() }));

for (const lang of ['de', 'en']) for (const modus of ['karten', 'standard']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('kfInit')){ localStorage.clear(); sessionStorage.setItem('kfInit', '1'); } });
  await p.goto(base + `index.html?dev=1&pacing=${modus}&lang=${lang}&difficulty=easy&tutorial=1&entdecken=0`); await p.waitForTimeout(400);
  await p.evaluate(() => { __kf.Tutorial.endGreeting(); __kf.requestRender(); }); await p.waitForTimeout(150);
  await p.evaluate(() => { const G = __kf.G; for (let i = 0; i < 12; i++) G.doClick(); }); await p.waitForTimeout(200);
  await p.evaluate(() => { __kf.G.S.material = 400; __kf.G.build('fabrik'); __kf.requestRender(); });
  await p.waitForTimeout(500);
  const tag = `[${lang}/${modus}]`;
  if (modus === 'karten'){
    await p.evaluate(() => __kf.selectTab('build')); await p.waitForTimeout(300);
    const a = await bubble(p);
    check(a.phase === 'info' && a.step === 'haus' && !a.hidden && a.narr === await tx(p, 'tut.haus1') && a.taskHidden && a.clickable, `${tag} Haupthaus-Erklärung: erste Sprechblase ohne Auftrag, anklickbar${show(a)}`);
    check(a.world === 4 && a.marked.includes('grid:4'), `${tag} Rahmen liegt auf dem Platz des Haupthauses (Welt und Raster)${show([a.world, a.marked])}`);
    check(a.vis, `${tag} Sprechblase liegt im Bild`);
    if (lang === 'de') await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad-tutorial-haupthaus.png') });
    await p.click('#tutBubble'); await p.waitForTimeout(250);
    const c = await bubble(p);
    check(c.phase === 'info' && c.narr === await tx(p, 'tut.haus2'), `${tag} zweite Sprechblase${show(c)}`);
    await p.click('#tutBubble'); await p.waitForFunction(() => __kf.Tutorial.view().phase === 'step', null, { timeout: 4000 }).catch(() => {});
    const d = await bubble(p);
    check(d.phase === 'step' && d.step === 'rekrutieren', `${tag} danach folgt „Einheiten kaufen“ ${show(d)}`);
    // nichts gesperrt: Spiel läuft weiter, kein Rahmen mehr auf dem Haupthaus
    check(!d.marked.includes('grid:4'), `${tag} Rahmen vom Haupthaus verschwunden`);
  } else {
    const a = await bubble(p);
    check(a.phase === 'step' && a.step === 'rekrutieren', `${tag} Standardmodus: kein Erklärschritt, direkt „Einheiten kaufen“${show(a)}`);
  }
  check(errs.length === 0, `${tag} keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
// Erklärung entfällt, wenn der Spieler schon weiter ist
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage();
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('kfInit')){ localStorage.clear(); sessionStorage.setItem('kfInit', '1'); } });
  await p.goto(base + 'index.html?dev=1&pacing=karten&lang=de&difficulty=easy&tutorial=1&entdecken=0'); await p.waitForTimeout(400);
  await p.evaluate(() => { __kf.Tutorial.endGreeting(); const G = __kf.G; for (let i = 0; i < 12; i++) G.doClick(); G.S.material = 400; G.build('fabrik'); for (let i = 0; i < 3; i++) G.spawn('laeufer'); __kf.requestRender(); });
  await p.waitForTimeout(500);
  const a = await bubble(p);
  check(a.step !== 'haus' && a.phase !== 'info', `Schon weiter (Einheiten gekauft): die Erklärung wird nicht nachgeholt${show(a)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte grün');
process.exit(failed ? 1 : 0);

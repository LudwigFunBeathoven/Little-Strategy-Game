// Browser-Prüfung Kartenpfad Teil 10 (REQ-K10.01): kein offener Platzhalter auf dem echten Darstellungsweg (Kartenfläche, Tooltips, Arbeitsbereich), je Sprache. Braucht Playwright (nicht Teil des Projekts).
// Bildschirmfotos für den Bericht: docs/bilder/kartenpfad10-*.png
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
const show = x => ' ' + JSON.stringify(x).slice(0, 600);
const OPEN = /[{}]|undefined|NaN|\[object/;

for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${lang}&difficulty=normal&pacing=karten&entdecken=0&buehne=1&zeit=pause`); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; const G = __kf.G; G.S.level = 15; G.S.pfad.lastPickT = 0; });
  // 1. Kartenfläche und Kartentooltip: alle Karten, alle Stufen
  const ids = await p.evaluate(() => Object.keys(__kf.G.OPT).filter(id => !__kf.G.cardRemoved(id)));       // nur Karten, die der Modus karten anbietet
  const bad = []; let nCards = 0, lv = 100;
  for (let i = 0; i < ids.length; i += 4){
    const group = ids.slice(i, i + 4);
    const tiers = await p.evaluate(g => Math.max(...g.map(id => __kf.G.tiersOf(__kf.G.OPT[id]).length)), group);
    for (let tier = 1; tier <= tiers; tier++){
      const res = await p.evaluate(([g, tier, lv]) => {
        const G = __kf.G;
        for (const id of g) G.S.draft.stacks[id] = Math.min(tier, G.tiersOf(G.OPT[id]).length) - 1;
        G.S.pendingDraft = { level: lv, options: g, rerolled: 0 }; G.S.pendingLevels = Math.max(1, G.S.pendingLevels); __kf.requestRender();
        return g.map((id, k) => __kf.tipContent('draftopt:' + k)).map(c => [c.title, c.body, ...(c.rows || []).flat(), c.foot || ''].join(' | '));
      }, [group, tier, lv++]);
      await p.waitForTimeout(150);
      const faces = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ id: e.dataset.i, txt: e.textContent })));
      group.forEach((id, k) => { nCards++; for (const s of [res[k], (faces[k] || {}).txt || '']) if (OPEN.test(s)) bad.push([id, tier, s.slice(0, 160)]); });
    }
  }
  check(nCards >= ids.length && bad.length === 0, `[${lang}] K10.01: ${nCards} Karten/Stufen (Fläche und Tooltip) ohne offenen Platzhalter ${show(bad.slice(0, 6))}`);
  // 2. Tooltips von Einheiten, Ausbauten, Forschung, Flügeln, Haupthaus, Feldern
  const tips = await p.evaluate(() => {
    const G = __kf.G, C = __kf.C, out = [];
    const ids = new Set([...Object.keys(C.UNITS).filter(u => C.UNITS[u].key).map(u => 'unit:' + u), ...Object.keys(C.UPGRADES).filter(u => !G.ausbauRemoved(u)).map(u => 'upg:' + u), ...Object.keys(G.RES).map(r => 'res:' + r),
      ...Object.keys(C.HAUPTHAUS.fluegel).map(f => 'fluegel:' + f), 'haus', ...G.S.slots.map((s, i) => 'grid:' + i), 'budget:0', 'budget:1', 'budget:2', 'click', 'kat:wirtschaft', 'kat:militaer', 'kat:verteidigung']);
    for (const e of document.querySelectorAll('[data-tooltip]')) ids.add(e.dataset.tooltip);       // alles, was die Oberfläche tatsächlich anbietet
    for (const id of ids){
      try { const c = __kf.tipContent(id); out.push([id, [c.title, c.body, ...(c.rows || []).flat(), c.reason || '', c.foot || ''].join(' | ')]); }
      catch (e) { out.push([id, 'FEHLER ' + e.message]); }
    }
    return out;
  });
  const badTip = tips.filter(([id, s]) => OPEN.test(s) || /^FEHLER/.test(s));
  check(tips.length > 40 && badTip.length === 0, `[${lang}] K10.01: ${tips.length} Tooltips (Einheiten, Ausbauten, Forschung, Flügel, Felder) ohne offenen Platzhalter ${show(badTip.slice(0, 6))}`);
  // 3. Arbeitsbereich: sichtbarer Text aller Reiter
  const badDom = [];
  for (const tab of await p.evaluate(() => [...document.querySelectorAll('[data-tab]')].map(e => e.dataset.tab))){
    await p.evaluate(t => __kf.selectTab(t), tab); await p.waitForTimeout(120);
    const txt = await p.evaluate(() => document.querySelector('#work, #panel, body').innerText);
    if (OPEN.test(txt)) badDom.push([tab, (txt.match(/.{0,40}[{}].{0,40}/) || [''])[0]]);
  }
  check(badDom.length === 0, `[${lang}] K10.01: Reiter des Arbeitsbereichs ohne offenen Platzhalter ${show(badDom)}`);
  // 4. Bildschirmfotos der Technologiekarten
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.wasserrahmen = 0; G.S.draft.stacks.dampfkraft = 0; G.S.pendingDraft = { level: 300, options: ['wasserrahmen', 'dampfkraft'], rerolled: 0 }; G.S.pendingLevels = 1; __kf.requestRender(); });
  await p.waitForTimeout(1400);
  const two = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => e.textContent));
  check(two.length === 2 && /30 ?%/.test(two[0]) && /40 ?%/.test(two[1]), `[${lang}] K10.01: Wasserrahmen +30 %, Dampfkraft +40 % ${show(two)}`);
  await p.screenshot({ path: join(root, `docs/bilder/kartenpfad10-technologiekarten-${lang}.png`) });
  check(errs.length === 0, `[${lang}] keine Konsolenfehler ${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte grün');
process.exit(failed ? 1 : 0);

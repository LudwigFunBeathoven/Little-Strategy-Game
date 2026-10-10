// Browser-Prüfung Kartenpfad Teil 4 (REQ-S.04, S.05): Gebäude-Aufwertung am Gebäude, Strategielinien in der Leiste. Braucht Playwright (nicht Teil des Projekts).
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

/* ---------- S.05: Aufwertung am Gebäude ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('fabrik'); G.build('fabrik'); __kf.selectTab('build'); __kf.selectPlot(0); __kf.requestRender(); });
  await settle(p, 300);
  check(!(await vis(p, '[data-tooltip^="variant:"]')), 'S.05: vor Minute 3 keine Aufwertung sichtbar');
  await p.evaluate(() => { __kf.G.S.t = 181; __kf.G.S.pfad.lastPickT = 181; __kf.requestRender(); }); await settle(p, 300);
  const picks = await p.evaluate(() => [...document.querySelectorAll('#ctxVariants .pick')].map(e => ({ tip: e.dataset.tooltip, text: e.innerText.replace(/\s+/g, ' ').slice(0, 160), dis: e.getAttribute('aria-disabled'), expl: !!e.querySelector('.expl') && e.querySelector('.expl').textContent.trim().length > 0 })));
  check(picks.length === 3 && picks.every(x => x.expl), `S.05: drei Varianten der Fabrik mit Erklärzeile ${show(picks.map(x => x.text))}`);
  check(picks.every(x => /\d+ Material/.test(x.text)), 'S.05: Kosten stehen am Knopf');
  const hint = await hintLike(p, /Variante/);
  check(/Variante/.test(hint), `S.05: Erstkontakt-Hinweis beim ersten Erscheinen ${show(hint)}`);
  // Tooltip der Variante
  const tip = await tipOf(p, '#ctxVariants .pick:nth-child(2)');
  check(/Manufaktur/.test(tip) && /Dauer/.test(tip), `S.05: Tooltip der Variante ${show(tip)}`);
  await p.mouse.move(5, 5);
  // Aufwerten
  await p.click('#ctxVariants .pick:nth-child(2)'); await settle(p, 300);
  const st = await p.evaluate(() => ({ upg: !!__kf.G.S.slots[0].upg, cell: document.querySelectorAll('#plotGrid button')[0].innerText.replace(/\s+/g, ' '), text: document.querySelector('#ctxText').textContent, picks: document.querySelectorAll('#ctxVariants .pick').length }));
  check(st.upg && /Aufwertung noch/.test(st.cell) && /Manufaktur/.test(st.text) && st.picks === 0, `S.05: Aufwertung läuft, Raster und Kopf zeigen sie ${show(st)}`);
  await run(p, 11); await settle(p, 300);
  const done = await p.evaluate(() => ({ variant: __kf.G.S.slots[0].variant, title: document.querySelector('#ctxTitle').textContent, cell: document.querySelectorAll('#plotGrid button')[0].innerText.replace(/\s+/g, ' '), picks: document.querySelectorAll('#ctxVariants .pick').length }));
  check(done.variant === 'manufaktur' && /Manufaktur/.test(done.title) && /Manufaktur/.test(done.cell) && done.picks === 0, `S.05: Variante steht, keine weitere Aufwertung angeboten ${show(done)}`);
  check(!(await vis(p, '#hudLines')), 'S.04: vor Stufe 1 ist kein Linienelement sichtbar');
  check(errs.length === 0, `S.05: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- S.04: Linien in der Leiste ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.drill = 1; G.S.draft.ver++; __kf.requestRender(); }); await settle(p, 250);
  check(!(await vis(p, '#hudLines')), 'S.04: ein Zeichen: keine Linie sichtbar');
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; __kf.requestRender(); }); await settle(p, 400);
  const hud = await p.evaluate(() => ({ vis: !!document.querySelector('#hudLines') && document.querySelector('#hudLines').checkVisibility(), text: document.querySelector('#lineRow').innerText.replace(/\s+/g, ' ') }));
  check(hud.vis && /Militär 1/.test(hud.text) && /2\/4/.test(hud.text), `S.04: Linie Militär Stufe 1 erscheint mit Zeichen bis zur nächsten Stufe ${show(hud)}`);
  const lh = await hintLike(p, /Linie Militär/);
  check(/Linie Militär, Stufe 1/.test(lh) && /10 %/.test(lh), `S.04: Hinweis „Militär Stufe 1“ mit einer Zeile Wirkung ${show(lh)}`);
  const tip = await tipOf(p, '#hudLines');
  check(/Linien/.test(tip) && /Schaden/.test(tip), `S.04: Tooltip der Linienanzeige ${show(tip)}`);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(JSON.stringify(audit.tips) === '[]' || (audit.tips && audit.tips.length === 0), `Tooltip-Audit leer ${show(audit.tips)}`);
  check(JSON.stringify(audit.expl) === '[]' || (audit.expl && audit.expl.length === 0), `Erklärzeilen-Audit leer ${show(audit.expl)}`);
  // Sprache en
  await p.evaluate(() => __kf.setLang('en')); await settle(p, 300);
  const en = await p.evaluate(() => document.querySelector('#lineRow').innerText.replace(/\s+/g, ' '));
  check(/Military 1/.test(en), `S.04: englische Texte ${show(en)}`);
  check(errs.length === 0, `S.04: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- S.04: Zeichen an den Karten erst nach der ersten Linienstufe ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1');
  let lvl = 0; const offer = ids => p.evaluate(([ids, lv]) => { const G = __kf.G; G.S.pendingDraft = { level: lv, options: ids, rerolled: 0 }; G.S.pendingLevels = Math.max(1, G.S.pendingLevels); __kf.requestRender(); }, [ids, ++lvl]);
  await offer(['drill', 'zinnen', 'gelehrte']); await settle(p, 1500);
  const before = await p.evaluate(() => [...document.querySelectorAll('.kcard .kc-sign')].map(e => e.textContent));
  check(before.length === 0, `S.04: vor Stufe 1 kein Zeichen an den Karten ${show(before)}`);
  await p.evaluate(() => { const G = __kf.G; G.S.pendingDraft = null; G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.stacks.aushebung = 1; G.S.draft.ver++; });
  await offer(['drill', 'zinnen', 'gelehrte']); await settle(p, 1500);
  const after = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => (e.querySelector('.kc-sign') || {}).textContent || ''));
  check(/Militär/.test(after[0]) && /Verteidigung/.test(after[1]) && after[2] === '', `S.04: nach Stufe 1: Zeichen an Drill und Zinnen, keines an Gelehrte ${show(after)}`);
  check(errs.length === 0, `S.04 Karten: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Standardmodus: nichts davon ---------- */
{
  const { ctx, p, errs } = await open('pacing=standard');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('fabrik'); G.S.t = 400; G.S.pfad.lastPickT = 400; __kf.selectTab('build'); __kf.selectPlot(0); G.S.draft.stacks.drill = 1; G.S.draft.stacks.echtesMilitaer = 1; G.S.draft.ver++; __kf.requestRender(); });
  await settle(p, 400);
  check(!(await vis(p, '#ctxVariants .pick')) && !(await vis(p, '#hudLines')), 'standard: keine Aufwertung, keine Linienanzeige');
  check(errs.length === 0, `standard: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : '\nalle Prüfungen bestanden');
process.exit(failed ? 1 : 0);

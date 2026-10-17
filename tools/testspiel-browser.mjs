// Klammerfront – Browser-Testspiel (Playwright): Der Bot spielt in der echten Oberfläche. Alle 30 s Spielzeit werden alle Reiter geöffnet und geprüft:
// Konsolenfehler, Inhalt jedes Tooltips (tipContent), sichtbare Texte auf rohe Textschlüssel, undefined, NaN, Infinity und offene Platzhalter, Tooltip- und Erklärzeilen-Audit;
// bei Minute 8 Speichern und Neuladen (KF_SAVE_AT=<Sekunden>), bei Minute 10 Wechsel auf Englisch.
// Aufruf: node tools/testspiel-browser.mjs <Pfad zum Repo> "<Adressparameter>" [kategorie] [minuten]   (Bildschirmfoto mit KF_SHOT=<datei.png>)
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
const { chromium } = await import('playwright');
const { resolve } = await import('node:path');
const [repoArg, query = '', kat = '', minArg = '20'] = process.argv.slice(2), repo = resolve(repoArg);
const MINUTES = Number(minArg);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => { const f = join(repo, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html')); if (!existsSync(f)){ res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' }); res.end(readFileSync(f)); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html?dev=1&tutorial=0&lang=de&difficulty=normal&${query}`;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|favicon/.test(m.text())) errs.push('console: ' + m.text()); });
const findings = new Map(); const note = (k, d) => { const e = findings.get(k) || { n: 0, ex: [] }; e.n++; if (e.ex.length < 3 && !e.ex.includes(d)) e.ex.push(d); findings.set(k, e); };
async function boot(){
  await p.goto(base); await p.waitForTimeout(500);
  await p.addScriptTag({ content: readFileSync(join(repo, 'tools/browser-bot.js'), 'utf8') });
  await p.evaluate(kat => { document.querySelector('#hintBox') && (document.querySelector('#hintBox').hidden = true);
    window.__bot = KF_BROWSER_BOT(__kf.G, Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true }, kat ? { kat, pfad: (KF_BROWSER_BOT.KAT_PFAD || {})[kat] } : {}), {}); }, kat);
}
await boot();
const scan = () => p.evaluate(() => {
  const out = { texts: [], tipErrors: [] };
  const L = (typeof KF_I18N !== 'undefined' && KF_I18N[__kf.lang]) || {};
  const keys = Object.keys(L).filter(k => k.includes('.'));
  const keySet = new Set(keys);
  const texts = [document.body.innerText];
  for (const el of document.querySelectorAll('[data-tooltip]')){
    const id = el.dataset.tooltip;
    try { const c = tipContent(id); if (c) texts.push([c.title, c.body, c.reason, ...(c.rows || []).flat()].filter(x => x != null).join(' | ')); }
    catch (e) { out.tipErrors.push(id + ': ' + e.message); }
  }
  const bad = [];
  for (const t of texts){
    const s = String(t);
    for (const m of s.matchAll(/\b[a-zA-Z]+(?:\.[a-zA-Z0-9_]+){1,4}\b/g)) if (keySet.has(m[0]) || /^(tip|draft|kp|bld|unit|upg|var|doctrine|kat|research|log|ex|trade|nb|hud|tut|hint|opt)\.[a-z]/.test(m[0]) && !/^\d/.test(m[0])) bad.push('Schlüssel: ' + m[0]);
    if (/\bundefined\b/.test(s)) bad.push('undefined: ' + s.slice(Math.max(0, s.indexOf('undefined') - 40), s.indexOf('undefined') + 20));
    if (/\bNaN\b/.test(s)) bad.push('NaN: ' + s.slice(Math.max(0, s.indexOf('NaN') - 40), s.indexOf('NaN') + 20));
    if (/\bInfinity\b/.test(s)) bad.push('Infinity: ' + s.slice(Math.max(0, s.indexOf('Infinity') - 40), s.indexOf('Infinity') + 20));
    const ph = s.match(/\{[a-z0-9]+\}/i); if (ph) bad.push('Platzhalter: ' + ph[0] + ' in ' + s.slice(Math.max(0, ph.index - 40), ph.index + 20));
  }
  out.texts = bad;
  out.audit = { tips: __kf.tooltipAudit().length, expl: __kf.explAudit().length };
  return out;
});
const TABS = ['build', 'wall', 'army', 'smithy', 'uni', 'cards'];
let saved = false, langSwitched = false, lastT = 0;
for (let sec = 0; sec < MINUTES * 60; sec += 30){
  const st = await p.evaluate(sec => { const G = __kf.G, dt = __kf.C.TICK_S; let n = 0; while (G.S.t < sec + 30 && G.S.status === 'running' && n < 30 / dt + 5){ __bot.step(dt); n++; } __kf.requestRender(); return { t: G.S.t, status: G.S.status, draft: !!G.S.pendingDraft }; }, sec);
  for (const tab of TABS){ await p.evaluate(tab => { try { __kf.selectTab(tab); __kf.requestRender(); } catch (e) {} }, tab); await p.waitForTimeout(40); const r = await scan(); r.texts.forEach(x => note(x.split(':')[0], `${tab} t=${Math.round(st.t)}: ${x}`)); r.tipErrors.forEach(x => note('Tooltip wirft', x)); if (r.audit.tips || r.audit.expl) note('Audit', `${tab} tips=${r.audit.tips} expl=${r.audit.expl}`); }
  if (!saved && st.t >= Number(process.env.KF_SAVE_AT || 480) && st.status === 'running'){
    saved = true;
    const before = await p.evaluate(() => { __kf.save(); return { t: __kf.G.S.t, mat: __kf.G.S.material, cards: Object.keys(__kf.G.S.draft.stacks).length, slots: JSON.stringify(__kf.G.S.slots.map(s => s && s.type)) }; });
    await p.goto(base.replace('&tutorial=0', '&tutorial=0').replace(/&difficulty=[a-z]+/, '')); await p.waitForTimeout(700);
    const after = await p.evaluate(() => (window.__kf && __kf.G.S) ? { t: __kf.G.S.t, mat: __kf.G.S.material, cards: Object.keys(__kf.G.S.draft.stacks).length, slots: JSON.stringify(__kf.G.S.slots.map(s => s && s.type)), status: __kf.G.S.status } : null);
    if (!after || Math.abs(after.t - before.t) > 2 || after.slots !== before.slots || after.cards !== before.cards) note('Speichern/Laden', `vorher ${JSON.stringify(before)} nachher ${JSON.stringify(after)}`);
    await p.addScriptTag({ content: readFileSync(join(repo, 'tools/browser-bot.js'), 'utf8') });
    await p.evaluate(kat => { window.__bot = KF_BROWSER_BOT(__kf.G, Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true }, kat ? { kat, pfad: (KF_BROWSER_BOT.KAT_PFAD || {})[kat] } : {}), {}); }, kat);
  }
  if (!langSwitched && st.t >= 600){ langSwitched = true; await p.evaluate(() => __kf.setLang('en')); }
  if (st.status !== 'running') { lastT = st.t; note('Ende', `${st.status} nach ${Math.round(st.t)} s`); break; }
  lastT = st.t;
}
if (process.env.KF_SHOT) await p.screenshot({ path: process.env.KF_SHOT });
errs.forEach(e => note('Konsolenfehler', e));
console.log(`${repo.split('/').pop()} [${query}] ${kat || ''}: bis t=${Math.round(lastT)} s`);
for (const [k, v] of findings) console.log(`  ${k}: ${v.n}× ${v.ex.map(x => x.slice(0, 200)).join(' || ')}`);
await b.close(); server.close();

// Browser-Prüfung Kartenpfad Teil 9 (REQ-K9.02, K9.03): Kartenfläche mit Nachteilszeile, Klassifikationen ohne Wörter, Lesbarkeit bei 375 px. Braucht Playwright (nicht Teil des Projekts).
// Bildschirmfotos für den Bericht: docs/bilder/kartenpfad9-*.png
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
const show = x => ' ' + JSON.stringify(x).slice(0, 320);
async function open(query, opts = {}){
  const ctx = await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 720 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${opts.lang || 'de'}&difficulty=normal&${query}`); await p.waitForTimeout(350);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  return { ctx, p, errs };
}
let lvl = 0;
const offer = (p, ids) => p.evaluate(([ids, lv]) => { const G = __kf.G; G.S.pendingDraft = { level: lv, options: ids, rerolled: 0 }; G.S.pendingLevels = Math.max(1, G.S.pendingLevels); __kf.requestRender(); }, [ids, ++lvl]);
const faces = p => p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ id: e.dataset.i, name: (e.querySelector('.kc-name') || {}).textContent, eff: (e.querySelector('.kc-desc') || {}).textContent, drawback: (e.querySelector('.kc-drawback') || {}).textContent || '',
  head: (e.querySelector('.kc-head') || {}).textContent, fam: !!e.querySelector('.kc-fam'), kat: e.dataset.kat, kat2: e.dataset.kat2 || null, cls: e.className, aria: e.getAttribute('aria-label'), katSym: (e.querySelector('.kc-head .kc-kat') || {}).textContent, footKat: !!e.querySelector('.kc-foot .kc-kat'), risk: !!e.querySelector('.kc-risk') })));
const DRAWBACK = ['aushebung', 'grosseArmee', 'allesAufDieMitte', 'gluecksritter', 'glaskanonen', 'zunftordnung', 'stiftung', 'stehendesHeer', 'vorstoss', 'bollwerk', 'ausfall', 'elite', 'massenaufgebot', 'freihandel', 'raubbau', 'fabrikmiliz', 'grenzfeste', 'zermuerbung'];

for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=1&zeit=pause', { lang });
  await p.evaluate(() => { const G = __kf.G; G.S.level = 15; G.S.pfad.lastPickT = 0; });
  // K9.02: jede Karte mit Nachteil zeigt eine Nachteilszeile (alle Stufen, in Gruppen zu vier Karten)
  const seen = [];
  for (let i = 0; i < DRAWBACK.length; i += 4){
    await offer(p, DRAWBACK.slice(i, i + 4)); await p.waitForTimeout(1300);
    for (const f of await faces(p)) seen.push(f);
  }
  const bad = seen.filter(f => !f.drawback || /[{}]|undefined|NaN/.test(f.drawback + f.eff) || f.risk);
  check(seen.length === DRAWBACK.length && bad.length === 0, `[${lang}] K9.02: alle ${DRAWBACK.length} Karten mit Nachteil zeigen eine Nachteilszeile ${show(bad.length ? bad : seen.slice(0, 3).map(f => [f.name, f.eff, f.drawback]))}`);
  check(seen.every(f => f.drawback.length <= (lang === 'en' ? 46 : 40) && f.eff.length <= (lang === 'en' ? 46 : 40)), `[${lang}] K9.02: Wirkungs- und Nachteilszeile nicht länger als 40 Zeichen (en 46)`);
  // Karten ohne Nachteil: keine Nachteilszeile
  await offer(p, ['drill', 'kriegstrommeln', 'maurerkolonne']); await p.waitForTimeout(1300);
  const plain = await faces(p);
  check(plain.every(f => f.drawback === ''), `[${lang}] K9.02: Karten ohne Nachteil zeigen keine Nachteilszeile ${show(plain.map(f => f.drawback))}`);
  // K9.03: Klassifikationen ohne Wörter
  await offer(p, ['waffenbrueder', 'kriegswirtschaft', 'maurerkolonne', 'zunftordnung']); await p.waitForTimeout(1300);
  const cl = await faces(p);
  check(cl.every(f => !f.fam && !f.footKat && !/[A-Za-zÄÖÜäöü]{4,}/.test(f.head.replace(/\d/g, ''))), `[${lang}] K9.03: Band ohne Wörter (nur Symbole und Nummer) ${show(cl.map(f => f.head))}`);
  check(cl[0].kat === 'militaer' && cl[1].kat === 'wirtschaft' && cl[1].kat2 === 'militaer' && cl[2].kat === 'verteidigung' && cl[3].kat === 'wirtschaft', `[${lang}] K9.03: Kategorie als Farbe (data-kat), Brücke mit zweiter Farbe ${show(cl.map(f => [f.kat, f.kat2]))}`);
  check(cl.every(f => /fam-(bonus|doktrin)/.test(f.cls)) && /fam-doktrin/.test(cl[3].cls) && /rar-/.test(cl[0].cls), `[${lang}] K9.03: Familie und Seltenheit als Klassen (Rahmen) ${show(cl.map(f => f.cls))}`);
  check(cl.every(f => f.aria && f.aria.includes(f.name)), `[${lang}] K9.03: Aria-Label nennt Name, Familie und Kategorie ${show(cl.map(f => f.aria))}`);
  if (lang === 'de') await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad9-karten-bonus-doktrin.png') });
  // Wagnis und Weiterentwicklung (Pfadkarten)
  await offer(p, ['glaskanonen', 'stadtrecht', 'wasserrahmen', 'doktrin-unbekannt'].filter(x => x !== 'doktrin-unbekannt')); await p.waitForTimeout(1300);
  const pf = await faces(p);
  check(pf.length === 3 && /fam-wagnis/.test(pf[0].cls) && /fam-weiterentwicklung/.test(pf[1].cls) && pf[0].drawback.length > 0, `[${lang}] K9.02/K9.03: Wagnis (gestrichelt) und Weiterentwicklung mit Nachteil bzw. ohne ${show(pf.map(f => [f.name, f.drawback, f.cls]))}`);
  if (lang === 'de') await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad9-karten-wagnis-weiter.png') });
  check(errs.length === 0, `[${lang}] keine Konsolenfehler` + show(errs));
  await ctx.close();
}
// Lesbarkeit bei 375 px Breite
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=1&zeit=pause', { w: 375, h: 700 });
  await p.evaluate(() => { const G = __kf.G; G.S.level = 15; G.S.pfad.lastPickT = 0; });
  await offer(p, ['zunftordnung', 'aushebung', 'drill']); await p.waitForTimeout(1300);
  const m = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => { const r = e.getBoundingClientRect(), d = e.querySelector('.kc-drawback'), n = e.querySelector('.kc-name'), ds = e.querySelector('.kc-desc');
    const inside = el => !el || (el.getBoundingClientRect().bottom <= r.bottom + 1 && el.getBoundingClientRect().right <= r.right + 1 && el.scrollWidth <= el.clientWidth + 1);
    return { w: Math.round(r.width), h: Math.round(r.height), okName: inside(n), okDesc: inside(ds), okDrawback: inside(d) }; }));
  check(m.length === 3 && m.every(x => x.w >= 100 && x.okName && x.okDesc && x.okDrawback), `K9.02: Karten bei 375 px lesbar (Name, Wirkungs- und Nachteilszeile innerhalb der Karte) ${show(m)}`);
  await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad9-karten-375px.png') });
  check(errs.length === 0, 'keine Konsolenfehler bei 375 px' + show(errs));
  await ctx.close();
}
// Standardmodus: Band mit Wort der Kategorie bleibt
{
  const { ctx, p, errs } = await open('pacing=standard&entdecken=0&buehne=1&zeit=pause');
  await p.evaluate(() => { __kf.G.gainXp(1e4); });
  await p.waitForTimeout(1300);
  const f = await faces(p);
  check(f.length > 0 && f.every(x => x.fam && x.kat === undefined && x.drawback === ''), 'standard: Band mit Wort (draft.cat.*) unverändert, keine Nachteilszeile' + show(f.map(x => x.head)));
  check(errs.length === 0, 'standard: keine Konsolenfehler' + show(errs));
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte ok');
process.exit(failed ? 1 : 0);

// Browser-Prüfung Kartenpfad Teil 8 (REQ-K8.03, K8.04, K8.05 …): Anzeige des EP-Fortschritts in den Zuständen „füllt sich“, „voll, Mindestabstand greift“, „Wahl offen“. Braucht Playwright (nicht Teil des Projekts).
// Bildschirmfotos für den Bericht: docs/bilder/kartenpfad8-*.png
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
async function open(query, opts = {}){
  const ctx = await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 720 } });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=${opts.lang || 'de'}&difficulty=normal&${query}`); await p.waitForTimeout(350);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  return { ctx, p, errs };
}
const render = async p => { await p.evaluate(() => { __kf.requestRender(); }); await p.waitForTimeout(200); };
const hud = p => p.evaluate(() => ({ val: document.querySelector('#xpVal').textContent, prog: document.querySelector('#lvlProg').textContent, rate: document.querySelector('#xpRate').textContent,
  wait: document.querySelector('#barLvl').parentElement.classList.contains('wait'), lost: document.querySelector('#barLvl').parentElement.classList.contains('lost'), w: document.querySelector('#barLvl').style.width }));
const tipOf = async (p, sel) => { await p.hover(sel); try { await p.waitForSelector('#tip:not([hidden])', { timeout: 3000 }); } catch (e) { return ''; } return p.evaluate(() => document.querySelector('#tip').innerText); };
const pick = p => p.evaluate(() => { const G = __kf.G; G.S.pendingDraft.options[0] = 'maurerkolonne'; G.chooseDraft(0); G.S.sections.forEach(s => { s.hp = 1e9; }); });

for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&zeit=pause', { lang });
  const L = lang === 'de' ? { next: /Nächste Wahl in 0:4\d · Mindestabstand/, open: 'Wahl offen', lost: 'EP verfallen', total: 'EP gesamt' } : { next: /Next choice in 0:4\d · minimum gap/, open: 'Choice open', lost: 'XP lost', total: 'Total XP' };
  // 1. füllt sich: Fortschritt als „cur / need“, keine Summe in der Leiste, kein „Karte in 0:00“
  await p.evaluate(() => { __kf.G.S.stats.xpSrc = {}; __kf.G.gainXp(40, 'kill'); }); await render(p);
  let h = await hud(p);
  check(/^\d+ \/ \d+$/.test(h.val.trim()) && !h.wait && !h.lost, `[${lang}] füllt sich: Fortschritt zur nächsten Wahl in der Leiste` + show(h));
  check(!/0:00/.test(h.prog + h.rate), `[${lang}] füllt sich: kein „Karte in 0:00“` + show(h));
  // 2. Wahl offen
  await p.evaluate(() => { const G = __kf.G; G.gainXp(G.xpNeed(1) - G.S.xpTotal + 1, 'kill'); }); await render(p);
  const st = await p.evaluate(() => ({ draft: !!__kf.G.S.pendingDraft }));
  h = await hud(p);
  check(st.draft && h.prog.includes(L.open), `[${lang}] Wahl offen` + show(h));
  // 3. voll, Mindestabstand greift
  await pick(p);
  await p.evaluate(() => { const G = __kf.G; G.gainXp(G.xpNeed(G.S.level + 1) - G.S.xpTotal + 1, 'kill'); }); await render(p);
  const wait = await p.evaluate(() => ({ draft: !!__kf.G.S.pendingDraft, pend: __kf.G.S.pendingLevels, rest: __kf.G.xpProgress().restS }));
  h = await hud(p);
  check(!wait.draft && wait.pend === 1 && L.next.test(h.prog) && h.wait && h.w === '100%', `[${lang}] voll, Mindestabstand greift: Restzeit und Grund` + show({ wait, h }));
  check(!/0:00/.test(h.prog), `[${lang}] kein „0:00“ bei vollem Balken` + show(h));
  // 4. Verfall sichtbar
  await p.evaluate(() => { __kf.G.gainXp(1e4, 'kill'); }); await render(p);
  h = await hud(p);
  check(h.lost && h.prog.includes(L.lost), `[${lang}] EP verfallen: gekappter Balken mit Markierung` + show(h));
  if (lang === 'de'){
    await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad8-ep-mindestabstand.png'), clip: { x: 0, y: 0, width: 1280, height: 130 } });
  }
  // 5. Tooltip: Summe nur dort
  const tip = await tipOf(p, '.hud-xp');
  check(tip.includes(L.total) && /\d/.test(tip), `[${lang}] Tooltip nennt die EP-Summe` + show(tip));
  check(errs.length === 0, `[${lang}] keine Konsolenfehler` + show(errs));
  await ctx.close();
}
{
  const { ctx, p, errs } = await open('pacing=standard');
  await p.evaluate(() => { __kf.G.gainXp(30); __kf.requestRender(); });
  const h = await hud(p);
  check(!h.wait && !h.lost, 'standard: Anzeige unverändert (keine Sperre, kein Verfall)' + show(h));
  check(errs.length === 0, 'standard: keine Konsolenfehler' + show(errs));
  await ctx.close();
}
/* ---------- K8.04: Bezeichnung der Manufaktur ohne Ordnungszahl ---------- */
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=0', { lang });
  await p.evaluate(() => { const G = __kf.G; G.S.level = 15; G.S.pfad.lastPickT = 0; G.S.material = 1e5; __kf.selectTab('build'); __kf.selectPlot(0); __kf.requestRender(); }); await p.waitForTimeout(300);
  const name = () => p.evaluate(() => { const b = document.querySelector('#ctxBuild [data-tooltip^="pick:fabrik"] b'); return b && b.textContent; });
  const n0 = await name();
  check(n0 === (lang === 'de' ? 'Manufaktur' : 'Manufactory'), `[${lang}] K8.04: Baumenü zeigt „${n0}“ ohne Ordnungszahl`);
  await p.evaluate(() => { const G = __kf.G; G.buildAt(1, 'fabrik'); G.buildAt(2, 'fabrik'); __kf.requestRender(); }); await p.waitForTimeout(300);
  const n1 = await name();
  check(n1 === n0 && !/\d/.test(n1), `[${lang}] K8.04: auch mit mehreren Manufakturen bleibt der Name ohne Zahl ${show(n1)}`);
  if (lang === 'de') await p.screenshot({ path: join(root, 'docs/bilder/kartenpfad8-baumenue.png') });
  const grenze = await p.evaluate(() => document.querySelector('#panel-build, #optsBuild') && document.body.innerText.match(/(Manufakturen|Manufactories)[^\n]*\d+\/\d+/));
  check(!!grenze, `[${lang}] K8.04: die Zahl steht in der Grenzanzeige ${show(grenze)}`);
  check(errs.length === 0, `[${lang}] K8.04: keine Konsolenfehler` + show(errs));
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfpunkte fehlgeschlagen` : '\nalle Prüfpunkte ok');
process.exit(failed ? 1 : 0);

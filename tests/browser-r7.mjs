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

/* ---------- K7.03: Stadtrecht auf der Bühne, Ausbau, Flügel ---------- */
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1&zeit=pause', { lang }); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.S.t = 200; G.S.pfad.choices = 1; G.S.pendingLevels = 1; G.S.pendingDraft = { level: 2, options: ['stadtrecht', 'drill', 'bessereFabriken'], rerolled: 0 }; __kf.requestRender(); });
  await settle(p, 2200);
  const card = await p.evaluate(() => { const c = document.querySelector('.kcard.fam-weiterentwicklung'); return c && { band: c.querySelector('.kc-fam').textContent, name: c.querySelector('.kc-name').textContent, eff: c.querySelector('.kc-desc').textContent }; });
  check(!!card && card.band === (lang === 'de' ? 'Weiterentwicklung' : 'Development') && card.eff.length <= 44 && card.name === (lang === 'de' ? 'Stadtrecht' : 'Town Charter'), `[${lang}] K7.03: Karte Stadtrecht mit Band Weiterentwicklung und Wirkungszeile ${show(card)}`);
  await p.click('.kcard.fam-weiterentwicklung'); await settle(p, 1800);
  await p.evaluate(() => { __kf.selectTab('haus'); __kf.requestRender(); }); await settle(p, 300);
  const ab = await p.evaluate(() => { const b = document.querySelector('[data-tooltip="haus:ausbau"]'); return b && { vis: b.checkVisibility(), dis: b.getAttribute('aria-disabled'), text: b.innerText.replace(/\s+/g, ' ') }; });
  check(ab && ab.vis && ab.dis !== 'true' && (lang === 'de' ? /Ausbau: Rathaus.*400 Material.*15 s/ : /Expand: Town Hall.*400 material.*15 s/).test(ab.text), `[${lang}] K7.03: Ausbau im Reiter Haupthaus mit Kosten und Dauer ${show(ab)}`);
  await p.click('[data-tooltip="haus:ausbau"]'); await settle(p, 200);
  check(await p.evaluate(() => !!__kf.G.S.haus.bau), `[${lang}] K7.03: Ausbau läuft nach dem Klick`);
  await run(p, 16); await settle(p, 300);
  const fl = await p.evaluate(() => ({ stufe: __kf.G.hausStufe(), title: document.querySelector('#hausTitle').textContent, box: !document.querySelector('#hausFluegelBox').hidden,
    picks: [...document.querySelectorAll('#hausFluegel .pick')].filter(e => !e.hidden).map(e => ({ tip: e.dataset.tooltip, ex: e.querySelector('.expl').textContent })) }));
  check(fl.stufe === 2 && fl.title === (lang === 'de' ? 'Rathaus' : 'Town Hall') && fl.box && fl.picks.length === 4 && fl.picks.every(x => x.ex.length > 5), `[${lang}] K7.03: Rathaus, vier Flügel zur Wahl mit Erklärzeile ${show(fl)}`);
  if (lang === 'de') await shot(p, 'haus-fluegelwahl');
  const tip = await tipOf(p, '[data-tooltip="fluegel:zeughaus"]');
  check(/Schmiede|smithy/.test(tip) && /endgültig|final/.test(tip), `[${lang}] K7.03: Tooltip des Flügels ${show(tip)}`);
  await p.click('[data-tooltip="fluegel:zeughaus"]'); await settle(p, 300);
  const after = await p.evaluate(() => ({ fl: __kf.G.S.haus.fluegel.join(), visible: [...document.querySelectorAll('#hausFluegel .pick')].filter(e => !e.hidden).length, smithy: !document.querySelector('#tab-smithy').hidden, text: document.querySelector('#hausFluegelText').textContent }));
  check(after.fl === 'zeughaus' && after.visible === 1 && after.smithy, `[${lang}] K7.03: Zeughaus gewählt, Reiter Schmiede ohne Schmiede sichtbar ${show(after)}`);
  await p.evaluate(() => { __kf.selectTab('smithy'); __kf.requestRender(); }); await settle(p, 300);
  const sm = await p.evaluate(() => ({ text: document.querySelector('#smithyText').textContent, q: !document.querySelector('[data-tooltip="upg:qualitaet"]').hidden }));
  check(sm.q && /Zeughaus|armoury/.test(sm.text), `[${lang}] K7.03: Qualitätsstufen ohne Schmiede ${show(sm)}`);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(!audit.tips.length && !audit.expl.length, `[${lang}] K7.03: Tooltips und Erklärzeilen vollständig ${show(audit)}`);
  const raw = await p.evaluate(() => [...document.querySelectorAll('#panel-haus, #panel-smithy')].map(e => e.innerText).join(' ').match(/\b[a-z]+\.[a-z]+\.[a-zA-Z.]+|undefined|NaN|\{[a-z0-9]+\}/g));
  check(!raw, `[${lang}] K7.03: keine rohen Schlüssel oder Platzhalter ${show(raw)}`);
  check(errs.length === 0, `[${lang}] K7.03: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K7.06, K7.07: Handelshaus mit Söldnerkompanie, Gießerei mit Geschütz ---------- */
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1', { lang }); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e5; G.S.t = 300; for (const [i, b] of [[0, 'universitaet'], [1, 'kontor'], [2, 'schmiede'], [3, 'kaserne']]) G.buildAt(i, b);
    for (const [c, r] of [['fernhandel', 'r_fernhandel'], ['geschuetzguss', 'r_geschuetzguss']]){ G.S.draft.stacks[c] = 1; G.S.draft.ver++; G.unlockKey('forschung:' + r); }
    G.startResearch('r_fernhandel'); G.rushResearch('r_fernhandel'); G.startResearch('r_geschuetzguss'); G.rushResearch('r_geschuetzguss'); __kf.selectTab('army'); __kf.requestRender(); });
  await settle(p, 400);
  const st = await p.evaluate(() => { const k = document.querySelector('[data-tooltip="kompanie"]'), g = document.querySelector('[data-tooltip="unit:geschuetz"]');
    return { hh: __kf.G.handelshaus(), k: k && !k.hidden && { text: k.innerText.replace(/\s+/g, ' '), dis: k.getAttribute('aria-disabled') }, g: g && !g.hidden && { text: g.innerText.replace(/\s+/g, ' '), dis: g.getAttribute('aria-disabled') } }; });
  check(st.hh && st.k && st.k.dis !== 'true' && (lang === 'de' ? /Söldnerkompanie.*6 Läufer, 2 Werfer.*600 Material/ : /Mercenary company.*6 runners, 2 throwers.*600 material/).test(st.k.text), `[${lang}] K7.06: Söldnerkompanie im Reiter Armee mit Erklärzeile ${show(st.k)}`);
  check(st.g && st.g.dis !== 'true' && (lang === 'de' ? /Geschütz/ : /Gun/).test(st.g.text), `[${lang}] K7.07: Geschütz in der Einheitenliste ${show(st.g)}`);
  const n0 = await p.evaluate(() => __kf.G.S.units.filter(u => u.side === 'p').length);
  await p.click('[data-tooltip="kompanie"]'); await settle(p, 300);
  const after = await p.evaluate(() => ({ n: __kf.G.S.units.filter(u => u.side === 'p').length, ex: document.querySelector('[data-tooltip="kompanie"] .expl').textContent, dis: document.querySelector('[data-tooltip="kompanie"]').getAttribute('aria-disabled') }));
  check(after.n - n0 === 8 && after.dis === 'true' && /\d+ s/.test(after.ex), `[${lang}] K7.06: Kompanie rückt aus, Abklingzeit sichtbar ${show(after)}`);
  await p.click('[data-tooltip="unit:geschuetz"]'); await settle(p, 200);
  const q = await p.evaluate(() => document.querySelector('#queue').textContent);
  check(/^2\//.test(q), `[${lang}] K7.07: Geschütz belegt zwei Plätze der Versorgung ${show(q)}`);
  const tip = await tipOf(p, '[data-tooltip="kompanie"]');
  check(/60 s/.test(tip) && /15/.test(tip), `[${lang}] K7.06: Tooltip nennt Abklingzeit und Anstieg ${show(tip)}`);
  await p.evaluate(() => { __kf.selectTab('build'); __kf.requestRender(); }); await settle(p, 300);
  const cells = await p.evaluate(() => [1, 2].map(i => document.querySelectorAll('#plotGrid button')[i].innerText.replace(/\s+/g, ' ')));
  check((lang === 'de' ? /Handelshaus/ : /Trading House/).test(cells[0]) && (lang === 'de' ? /Gießerei/ : /Foundry/).test(cells[1]), `[${lang}] K7.06/K7.07: Namen nach der Weiterentwicklung im Raster ${show(cells)}`);
  if (lang === 'de'){ await p.evaluate(() => { __kf.selectTab('army'); __kf.requestRender(); }); await settle(p, 300); await shot(p, 'armee-kompanie-geschuetz'); }
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(!audit.tips.length && !audit.expl.length, `[${lang}] K7.06: Tooltips und Erklärzeilen vollständig ${show(audit)}`);
  check(errs.length === 0, `[${lang}] K7.06: keine Konsolenfehler${show(errs)}`);
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

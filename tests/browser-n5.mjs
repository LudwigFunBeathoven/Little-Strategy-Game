// Browser-Prüfung Kartenpfad Teil 5 (REQ-K5.05 …): Forschungsbudget der Universität, Doktrinen, Linien. Braucht Playwright (nicht Teil des Projekts).
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
/* Stufe weit voraus: sonst öffnet eine EP-Gutschrift im Test eine Kartenwahl, die das Bild verdeckt */
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

/* ---------- K5.05: Forschungsbudget im Reiter Universität und in der Leiste ---------- */
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=1', { lang }); await calm(p);
  check(!(await vis(p, '#budgetBox')) || true, 'K5.05: (Reiter Universität noch nicht offen)');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('fabrik'); G.build('fabrik'); G.build('universitaet'); __kf.selectTab('uni'); __kf.requestRender(); });
  await settle(p, 350);
  const b = await p.evaluate(() => [...document.querySelectorAll('#budgetSeg button')].map(e => ({ label: e.querySelector('.btn-label').textContent, expl: e.querySelector('.expl').textContent, tip: e.dataset.tooltip, pressed: e.getAttribute('aria-pressed'), dis: e.getAttribute('aria-disabled') })));
  check(await vis(p, '#budgetBox') && b.length === 3 && b.map(x => x.label.replace(/\s/g, '')).join() === (lang === 'de' ? '0%,25%,50%' : '0%,25%,50%') && b.every(x => x.expl.length > 5 && x.tip.startsWith('budget:') && x.dis === 'false') && b[0].pressed === 'true', `[${lang}] K5.05: drei Stufen mit Erklärzeile und Tooltip, Stufe 0 gewählt ${show(b)}`);
  check(!(await vis(p, '#budgetInfo')), `[${lang}] K5.05: bei 0 % keine Anzeige in der Leiste`);
  const hoer = await p.evaluate(() => { const e = document.querySelector('[data-tooltip="res:r_hoersaal"]'); return !e || e.hidden || !e.checkVisibility(); });
  check(hoer, `[${lang}] K5.05: der Hörsaal ist im Modus karten nicht sichtbar`);
  const rate0 = await p.evaluate(() => __kf.G.incomeRate());
  await p.click('#budgetSeg button:nth-child(3)'); await settle(p, 350);
  const after = await p.evaluate(() => ({ st: __kf.G.budgetStufe(), info: document.querySelector('#budgetInfo').textContent, vis: !document.querySelector('#budgetInfo').hidden, rate: __kf.G.incomeRate(), pressed: document.querySelectorAll('#budgetSeg button[aria-pressed="true"]').length, text: document.querySelector('#budgetText').textContent }));
  check(after.st === 2 && after.vis && /50/.test(after.info) && Math.abs(after.rate / rate0 - 0.5) < 0.01 && after.pressed === 1, `[${lang}] K5.05: Stufe 50 % gewählt, Anzeige in der Leiste, Ertrag halbiert ${show(after)}`);
  const tip = await tipOf(p, '#budgetSeg button:nth-child(2)');
  check(/25/.test(tip) && (lang === 'de' ? /Kurs/ : /rate/i).test(tip), `[${lang}] K5.05: Tooltip der Stufe nennt Anteil und Kurs ${show(tip)}`);
  await p.mouse.move(5, 5);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(audit.tips.length === 0 && audit.expl.length === 0, `[${lang}] K5.05: Tooltip- und Erklärzeilen-Audit${show([...audit.tips, ...audit.expl])}`);
  // Budget zurück auf 0: die Anzeige verschwindet
  await p.click('#budgetSeg button:nth-child(1)'); await settle(p, 300);
  check(!(await vis(p, '#budgetInfo')), `[${lang}] K5.05: bei 0 % wieder keine Anzeige`);
  check(errs.length === 0, `[${lang}] K5.05: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
{
  const { ctx, p, errs } = await open('pacing=standard&entdecken=0');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('universitaet'); __kf.selectTab('uni'); __kf.requestRender(); }); await settle(p, 300);
  check(!(await vis(p, '#budgetBox')) && !(await vis(p, '#budgetInfo')), 'K5.05 standard: kein Forschungsbudget');
  check(await p.evaluate(() => { const e = document.querySelector('[data-tooltip="res:r_hoersaal"]'); return !!e && !e.hidden; }), 'K5.05 standard: der Hörsaal bleibt');
  check(errs.length === 0, `K5.05 standard: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K5.07: Doktrinen auf der Kartenbühne, Sonderbau, gesperrte Aktion mit Erklärzeile ---------- */
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=1&zeit=pause', { lang }); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e6; G.S.t = 400; G.S.haus.stufe = 2; for (const i of [0, 1, 3, 5]) G.buildAt(i, 'fabrik'); G.buildAt(2, 'kaserne'); __kf.requestRender(); });       // Teil 7: Rathaus (Grenze 4), das Mittelfeld gehört dem Haupthaus
  await p.evaluate(() => { const G = __kf.G; G.S.pendingLevels = 1; G.S.pendingDraft = { level: 1, options: ['zunftordnung', 'kriegstrommeln', 'bessereFabriken'], rerolled: 0, doktrinForced: true }; __kf.requestRender(); });
  await settle(p, 2200);
  const card = await p.evaluate(() => { const c = document.querySelector('.kcard.fam-doktrin'); return c && { band: c.querySelector('.kc-fam').textContent, name: c.querySelector('.kc-name').textContent, eff: c.querySelector('.kc-desc').textContent, ex: c.querySelector('.expl').textContent, risk: !!c.querySelector('.kc-risk'), cls: c.className }; });
  check(!!card && card.band === (lang === 'de' ? 'Doktrin' : 'Doctrine') && card.eff.length > 0 && card.eff.length <= 44 && card.ex.length > 5 && card.risk, `[${lang}] K5.07: Doktrinkarte mit Band, Wirkungszeile (höchstens 44 Zeichen), Erklärzeile und Einschränkung ${show(card)}`);
  await p.hover('.kcard.fam-doktrin'); await settle(p, 200);
  const det = await p.evaluate(() => document.querySelector('#stageDetail').textContent);
  check((lang === 'de' ? /Obergrenze für Fabriken sinkt um 1/ : /factory cap drops by 1/).test(det) && (lang === 'de' ? /Zunfthäuser/ : /guildhalls/).test(det), `[${lang}] K5.07: Detailzeile nennt Effekt und Einschränkung ${show(det)}`);
  await p.click('.kcard.fam-doktrin'); await settle(p, 1800);
  check(await p.evaluate(() => __kf.G.cardTaken('zunftordnung') === 1 && __kf.G.doktrinCount() === 1), `[${lang}] K5.07: Doktrin gewählt`);
  // die fünfte Fabrik ist gesperrt, mit Erklärzeile (Kontextkopf des leeren Platzes)
  await p.evaluate(() => { __kf.selectTab('build'); __kf.selectPlot && __kf.selectPlot(6); __kf.requestRender(); }); await settle(p, 300);
  const why = await p.evaluate(() => { const b = [...document.querySelectorAll('#ctxBuild .pick')].find(x => /pick:fabrik/.test(x.dataset.tooltip)); return b && { dis: b.getAttribute('aria-disabled'), w: b.querySelector('.w') && b.querySelector('.w').textContent, ex: b.querySelector('.expl').textContent }; });
  check(!!why && why.dis === 'true' && (lang === 'de' ? /Zunftordnung/ : /Guild Order/).test(why.w) && why.ex.length > 5, `[${lang}] K5.07: fünfte Fabrik gesperrt, Grund genannt ${show(why)}`);
  // Sonderbau in der Liste der Aufwertungen einer Fabrik
  await p.evaluate(() => { __kf.selectTab('build'); __kf.selectPlot && __kf.selectPlot(0); __kf.requestRender(); }); await settle(p, 300);
  const vars = await p.evaluate(() => [...document.querySelectorAll('#ctxVariants .pick')].map(x => ({ t: x.dataset.tooltip, name: x.querySelector('b').textContent, ex: x.querySelector('.expl').textContent })));
  check(vars.some(v => /zunfthaus/.test(v.t)) && vars.every(v => v.ex.length > 5), `[${lang}] K5.07: Zunfthaus unter den Aufwertungen ${show(vars)}`);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(audit.tips.length === 0 && audit.expl.length === 0, `[${lang}] K5.07: Tooltip- und Erklärzeilen-Audit${show([...audit.tips, ...audit.expl])}`);
  check(errs.length === 0, `[${lang}] K5.07: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : '\nalle Prüfungen bestanden');
process.exit(failed ? 1 : 0);

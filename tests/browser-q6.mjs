// Browser-Prüfung Kartenpfad Teil 4 und 6 (REQ-S.05, K6.01 – K6.08): Gebäude-Aufwertung am Gebäude, keine Strategielinien, Kategorien und Synergiekarten. Braucht Playwright (nicht Teil des Projekts).
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
  check(st.upg && /Aufwertung noch/.test(st.cell) && /Hofmanufaktur/.test(st.text) && st.picks === 0, `S.05: Aufwertung läuft, Raster und Kopf zeigen sie ${show(st)}`);
  await run(p, 11); await settle(p, 300);
  const done = await p.evaluate(() => ({ variant: __kf.G.S.slots[0].variant, title: document.querySelector('#ctxTitle').textContent, cell: document.querySelectorAll('#plotGrid button')[0].innerText.replace(/\s+/g, ' '), picks: document.querySelectorAll('#ctxVariants .pick').length }));
  check(done.variant === 'manufaktur' && /Hofmanufaktur/.test(done.title) && /Hofmanufaktur/.test(done.cell)       /* Teil 7: die Variante heißt Hofmanufaktur */ && done.picks === 0, `S.05: Variante steht, keine weitere Aufwertung angeboten ${show(done)}`);
  check(!(await vis(p, '#hudLines')), 'K6.02: kein Linienelement in der Leiste');
  check(errs.length === 0, `S.05: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.02: keine Strategielinien; Doktrin und übernommene Karten ohne Zeichen ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.stehendesHeer = 1; G.S.draft.stacks.drill = 1; G.S.draft.ver++; __kf.requestRender(); }); await settle(p, 400);
  check(!(await vis(p, '#hudLines')) && (await p.evaluate(() => !document.querySelector('#hudLines') && !document.querySelector('#lineRow'))), 'K6.02: keine Linienanzeige, auch nicht nach einer Doktrin');
  const hint = await p.evaluate(() => !document.querySelector('#hintBox').hidden ? document.querySelector('#hintText').textContent : '');
  check(!/Linie/.test(hint), `K6.02: kein Linienhinweis ${show(hint)}`);
  let lvl = 0; const offer = ids => p.evaluate(([ids, lv]) => { const G = __kf.G; G.S.pendingDraft = { level: lv, options: ids, rerolled: 0 }; G.S.pendingLevels = Math.max(1, G.S.pendingLevels); __kf.requestRender(); }, [ids, ++lvl]);
  await offer(['vorstoss', 'rekrutenzug', 'durchbruch']); await settle(p, 1500);
  const cards = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ sign: !!e.querySelector('.kc-sign'), name: (e.querySelector('.kc-name') || {}).textContent, desc: (e.querySelector('.kc-desc') || {}).textContent })));
  check(cards.length === 3 && cards.every(c => !c.sign), `K6.02: kein Zeichen an den Karten ${show(cards)}`);
  check(/Rekrutenzug/.test(cards[1].name) && /Läufer/.test(cards[1].desc) && /Durchbruch/.test(cards[2].name), `K6.02: übernommene Karten mit Wirkungszeile ${show(cards)}`);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(JSON.stringify(audit.tips) === '[]', `Tooltip-Audit leer ${show(audit.tips)}`);
  check(JSON.stringify(audit.expl) === '[]', `Erklärzeilen-Audit leer ${show(audit.expl)}`);
  await p.evaluate(() => __kf.setLang('en')); await settle(p, 400);
  const en = await p.evaluate(() => [...document.querySelectorAll('.kcard .kc-name')].map(e => e.textContent));
  check(/Recruit levy/.test(en[1]) && /Breakthrough/.test(en[2]), `K6.02: englische Namen ${show(en)}`);
  check(errs.length === 0, `K6.02: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.03: Kategorie auf den Karten, aktueller Wert der Synergiekarten, Karten je Kategorie im Reiter Karten ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; for (const id of ['aushebung', 'drill']) G.S.draft.stacks[id] = 1; G.S.draft.ver++; __kf.selectTab('cards'); __kf.requestRender(); }); await settle(p, 400);
  check(await p.evaluate(() => document.querySelector('#katCounts').hidden), 'K6.03: Karten je Kategorie sind vor der ersten Synergiekarte nicht sichtbar (Entdecken)');
  let lvl = 0; const offer = ids => p.evaluate(([ids, lv]) => { const G = __kf.G; G.S.pendingDraft = { level: lv, options: ids, rerolled: 0 }; G.S.pendingLevels = Math.max(1, G.S.pendingLevels); __kf.requestRender(); }, [ids, ++lvl]);
  await offer(['waffenbrueder', 'kriegswirtschaft', 'maurerkolonne']); await settle(p, 1500);
  const cards = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ band: (e.querySelector('.kc-fam') || {}).textContent, kat: (e.querySelector('.kc-kat') || {}).textContent, now: (e.querySelector('.kc-now') || {}).textContent || '', desc: (e.querySelector('.kc-desc') || {}).textContent })));
  check(cards.length === 3 && /Militär/.test(cards[0].kat) && /Wirtschaft \+ Militär/.test(cards[1].kat) && /Verteidigung/.test(cards[2].kat), `K6.03: Kategorie am Fuß der Karte, Brücke mit beiden ${show(cards)}`);
  check(/derzeit \+21 %/.test(cards[0].now) && /derzeit [−-]15 %/.test(cards[1].now) && cards[2].now === '', `K6.03: Synergiekarten zeigen ihren aktuellen Wert, andere Karten nicht ${show(cards.map(c => c.now))}`);
  check(/Schaden \+7 % je Militärkarte/.test(cards[0].desc), `K6.03: Wirkungszeile der Synergiekarte ${show(cards[0].desc)}`);
  const tip = await tipOf(p, '.kcard:nth-child(1)');
  check(/Kategorie/.test(tip) && /Zähler/.test(tip) && /derzeit \+21 %/.test(tip), `K6.03: Tooltip nennt Kategorie, Art und Wert ${show(tip)}`);
  await p.mouse.move(5, 5);
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(JSON.stringify(audit.tips) === '[]' && JSON.stringify(audit.expl) === '[]', `K6.03: Tooltip- und Erklärzeilen-Audit leer ${show(audit)}`);
  await p.keyboard.press('1'); await settle(p, 1500);
  await p.evaluate(() => { __kf.G.S.pendingDraft = null; __kf.selectTab('cards'); __kf.requestRender(); }); await settle(p, 500);
  const kc = await p.evaluate(() => ({ hidden: document.querySelector('#katCounts').hidden, text: document.querySelector('#katCountsRow').innerText.replace(/\s+/g, ' '), chosen: __kf.G.S.draft.stacks.waffenbrueder }));
  check(kc.chosen === 1 && !kc.hidden && /Militär 3/.test(kc.text) && /Wirtschaft 0/.test(kc.text) && /Verteidigung 0/.test(kc.text), `K6.03: nach der ersten Synergiekarte zeigt der Reiter Karten die Zahl je Kategorie ${show(kc)}`);
  const ktip = await tipOf(p, '#katCounts');
  check(/Karten je Kategorie/.test(ktip) && /Militär/.test(ktip) && /führt/.test(ktip), `K6.03: Tooltip der Kategorien nennt die führende Kategorie ${show(ktip)}`);
  await p.evaluate(() => __kf.setLang('en')); await settle(p, 400);
  const en = await p.evaluate(() => document.querySelector('#katCountsRow').innerText.replace(/\s+/g, ' '));
  check(/Military 3/.test(en), `K6.03: englische Texte ${show(en)}`);
  check(errs.length === 0, `K6.03: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.04: Doktrinen haben auf der Bühne eine eigene Rückseite und einen eigenen Rahmen ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=1&buehne=1');
  await p.evaluate(() => { const G = __kf.G; G.S.pendingDraft = { level: 1, options: ['vorstoss', 'drill', 'glaskanonen'], rerolled: 0 }; G.S.pendingLevels = 1; __kf.requestRender(); }); await settle(p, 1500);
  const backs = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ doktrin: e.classList.contains('rar-doktrin'), back: (e.querySelector('.kc-back') || {}).textContent })));
  check(backs[0].doktrin && backs[0].back.replace(/\uFE0E/g, '') === '\u2691' && backs[1].back.replace(/\uFE0E/g, '') === '\u25C6' && !backs[1].doktrin, `K6.04: Doktrin mit eigenem Rahmen und eigener Rückseite ${show(backs)}`);
  check(errs.length === 0, `K6.04: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.05: neue Doktrinen in der Oberfläche (Tausch im Kontor, gesperrte Einheiten und Türme, Raubbau am Platz) ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=0'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.t = 200; G.S.material = 5000; G.buildAt(0, 'kontor'); G.buildAt(1, 'fabrik'); G.buildAt(2, 'kaserne'); G.S.lvl.turm_0 = 3; __kf.selectTab('build'); __kf.selectPlot(0); __kf.requestRender(); }); await settle(p, 300);
  const vTrade = async () => p.evaluate(() => [...document.querySelectorAll('[data-tooltip^="trade:"]')].filter(e => !e.hidden && e.checkVisibility()).map(e => e.innerText.replace(/\s+/g, ' ')));
  check((await vTrade()).length === 0, 'K6.05 Freihandel: ohne Doktrin keine Tauschknöpfe');
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.freihandel = 1; G.S.draft.ver++; __kf.requestRender(); }); await settle(p, 300);
  const tr = await p.evaluate(() => [...document.querySelectorAll('[data-tooltip^="trade:"]')].map(e => ({ tip: e.dataset.tooltip, hidden: e.hidden || !e.checkVisibility(), text: e.innerText.replace(/\s+/g, ' '), expl: !!e.querySelector('.expl') && e.querySelector('.expl').textContent.trim().length > 0, dis: e.getAttribute('aria-disabled') })));
  check(tr.length === 2 && tr.every(x => !x.hidden && x.expl), `K6.05 Freihandel: zwei Tauschknöpfe mit Erklärzeile ${show(tr)}`);
  check(tr.find(x => x.tip === 'trade:ep').dis !== 'true', 'K6.05 Freihandel: Material → EP ist mit Material frei');
  check(tr.find(x => x.tip === 'trade:mat').dis === 'true', 'K6.05 Freihandel: EP → Material ist ohne tauschbare EP gesperrt');
  const tip = await tipOf(p, '[data-tooltip="trade:mat"]');
  check(/EP/.test(tip) && /Fortschritt|Wahl|Stufe/.test(tip), `K6.05 Freihandel: Tooltip nennt den Grund ${show(tip)}`);
  const x0 = await p.evaluate(() => ({ m: __kf.G.S.material, x: __kf.G.S.xpTotal }));
  await p.click('[data-tooltip="trade:ep"]'); await settle(p, 200);
  const x1 = await p.evaluate(() => ({ m: __kf.G.S.material, x: __kf.G.S.xpTotal }));
  check(x1.m < x0.m && x1.x > x0.x, `K6.05 Freihandel: Klick tauscht Material gegen EP ${show([x0, x1])}`);
  // Turmausbau gesperrt, auch im Bestand
  await p.evaluate(() => { __kf.selectTab('wall'); __kf.requestRender(); }); await settle(p, 300);
  const tw = await p.evaluate(() => { const e = document.querySelector('[data-tooltip="upg:turm_0"]'); return e ? { dis: e.getAttribute('aria-disabled'), hidden: e.hidden || !e.checkVisibility(), tip: e.dataset.tooltip } : null; });       // Teil 6 (K6.07): Reichweite und Feuerrate sind Karten; gesperrt bleibt die höhere Turmstufe
  check(tw && !tw.hidden && tw.dis === 'true', `K6.05 Freihandel: Turmausbau gesperrt ${show(tw)}`);
  const ttip = tw ? await tipOf(p, '[data-tooltip="upg:turm_0"]') : '';
  check(/Freihandel/.test(ttip), `K6.05 Freihandel: Tooltip nennt die Doktrin ${show(ttip)}`);
  // Massenaufgebot: andere Einheiten gesperrt, mit Grund
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.freihandel = 0; G.S.draft.stacks.massenaufgebot = 1; G.S.draft.ver++; __kf.selectTab('army'); __kf.requestRender(); }); await settle(p, 300);
  const un = await p.evaluate(() => { const e = document.querySelector('[data-tooltip="unit:werfer"]'); return e ? { hidden: e.hidden || !e.checkVisibility(), dis: e.getAttribute('aria-disabled') } : null; });
  check(un && !un.hidden && un.dis === 'true', `K6.05 Massenaufgebot: Werfer sichtbar, aber gesperrt ${show(un)}`);
  const utip = await tipOf(p, '[data-tooltip="unit:werfer"]');
  check(/Massenaufgebot/.test(utip), `K6.05 Massenaufgebot: Tooltip nennt die Doktrin ${show(utip)}`);
  const ul = await p.evaluate(() => { const e = document.querySelector('[data-tooltip="unit:laeufer"]'); return e ? e.getAttribute('aria-disabled') : 'fehlt'; });
  check(ul !== 'true', 'K6.05 Massenaufgebot: Läufer bleiben kaufbar');
  // Raubbau: Faktor am Platz
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.massenaufgebot = 0; G.S.draft.stacks.raubbau = 1; G.S.draft.ver++; G.tick(0.05); __kf.selectTab('build'); __kf.clearSelection(); __kf.requestRender(); }); await settle(p, 300);
  const cell = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  check(/Raubbau ×2/.test(cell), 'K6.05 Raubbau: der Platz der Fabrik nennt den Faktor');
  await p.evaluate(() => __kf.setLang('en')); await settle(p, 300);
  const en = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  check(/Overexploitation|Raubbau/.test(en) === true, 'K6.05: englische Texte vorhanden');
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(JSON.stringify(audit.tips) === '[]' && JSON.stringify(audit.expl) === '[]', `K6.05: Tooltip- und Erklärzeilen-Audit leer ${show(audit)}`);
  check(errs.length === 0, `K6.05: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.06: Weiterentwicklung der Fabrik (Tooltip nennt die Zahl der ersetzten Varianten, Anzeigename, Abschluss); seit Teil 7 ist die erste Stufe der Wasserrahmen ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=0'); await calm(p);
  await p.evaluate(() => {
    const G = __kf.G; G.S.t = 300; G.S.pfad.lastPickT = 300; G.S.material = 1e6;
    G.buildAt(0, 'fabrik'); G.buildAt(1, 'fabrik'); G.buildAt(2, 'fabrik'); G.buildAt(5, 'universitaet');
    G.S.slots[0].variant = 'manufaktur'; G.S.slots[1].variant = 'werkstatt'; G.S.slotVer++;
    G.S.draft.stacks.wasserrahmen = 1; G.S.draft.ver++; G.unlockKey('forschung:r_wasserrahmen'); __kf.selectTab('uni'); __kf.requestRender();
  });
  await settle(p, 400);
  const tip = await tipOf(p, '[data-tooltip="res:r_wasserrahmen"]');
  check(/Ersetzt 2 Varianten/.test(tip) && /Fabriken/.test(tip) && /Ertrag \+30 %/.test(tip) && !/research\.branchOf/.test(tip), `K6.06: Tooltip der Forschung nennt die ersetzten Varianten ${show(tip)}`);
  await p.mouse.move(5, 5);
  await p.evaluate(() => { const G = __kf.G; G.startResearch('r_wasserrahmen'); G.rushResearch('r_wasserrahmen'); G.tick(0.05); __kf.selectTab('build'); __kf.clearSelection(); __kf.requestRender(); }); await settle(p, 400);
  const st = await p.evaluate(() => ({ v: __kf.G.S.slots.slice(0, 3).map(s => s.variant || null), w: __kf.G.S.stats.weiter, text: document.querySelectorAll('#plotGrid button')[0].innerText.replace(/\s+/g, ' ') }));
  check(JSON.stringify(st.v) === '[null,null,null]' && st.w && st.w[0].ersetzt === 2, `K6.06: Grundvarianten ersetzt, Protokoll ${show(st.w)}`);
  check(/^Platz 1 Fabrik( ·|$)/.test(st.text), `K6.06, K7.09: der Platz heißt nach dem Wasserrahmen Fabrik ${show(st.text)}`);
  await p.evaluate(() => __kf.setLang('en')); await settle(p, 300);
  check(/ Factory( ·|$)/.test(await p.evaluate(() => document.querySelectorAll('#plotGrid button')[0].innerText.replace(/\s+/g, ' '))), 'K6.06, K7.09: englischer Name Factory');
  const audit = await p.evaluate(() => ({ tips: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(JSON.stringify(audit.tips) === '[]' && JSON.stringify(audit.expl) === '[]', `K6.06: Tooltip- und Erklärzeilen-Audit leer ${show(audit)}`);
  check(errs.length === 0, `K6.06: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.07: Ausbauten als Karten (die Ausbauten entfallen im Reiter, die Karten tragen ihre Namen und Wirkungszeilen) ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=1');
  await p.evaluate(() => { const G = __kf.G; G.S.pendingDraft = { level: 1, options: ['turmschule', 'stachelwall', 'handelskontor'], rerolled: 0 }; G.S.pendingLevels = 1; __kf.requestRender(); }); await settle(p, 1500);
  const cards = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(e => ({ name: (e.querySelector('.kc-name') || {}).textContent, eff: (e.querySelector('.kc-desc') || {}).textContent, kat: (e.querySelector('.kc-kat') || {}).textContent })));
  check(cards.length === 3 && /Turmschule/.test(cards[0].name) && /Stachelwall/.test(cards[1].name) && /Zinsmeister/.test(cards[2].name), `K6.07: Namen der Ausbau-Karten ${show(cards.map(c => c.name))}`);
  check(cards.every(c => c.eff && c.eff.length > 0 && c.eff.length <= 44 && !/\{/.test(c.eff)), `K6.07: Wirkungszeilen ${show(cards.map(c => c.eff))}`);
  await ctx.close();
}
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=0'); await calm(p);
  await p.evaluate(() => { const G = __kf.G; G.S.t = 400; G.S.pfad.lastPickT = 400; G.S.material = 1e6; G.buildAt(0, 'kontor'); G.S.lvl.turm_0 = 1; G.S.lvl.stacheln = 0; G.S.revealed = Object.fromEntries(Object.keys(__kf.G.C ? {} : {}).map(k => [k, true])); for (const id of ['reichweite_0', 'kadenz_0', 'stacheln', 'moertel', 'zinseszins', 'mauer']) G.S.revealed[id] = true; __kf.selectTab('wall'); __kf.requestRender(); });
  await settle(p, 400);
  const vis2 = await p.evaluate(() => ['reichweite_0', 'kadenz_0', 'stacheln', 'moertel', 'mauer'].map(id => { const e = document.querySelector(`[data-tooltip="upg:${id}"]`); return [id, !!e && !e.hidden && e.checkVisibility()]; }));
  check(JSON.stringify(vis2) === JSON.stringify([['reichweite_0', false], ['kadenz_0', false], ['stacheln', false], ['moertel', false], ['mauer', true]]), `K6.07: Ausbauten im Reiter Mauer entfallen, der Mauerausbau bleibt ${show(vis2)}`);
  await p.evaluate(() => { __kf.selectTab('build'); __kf.selectPlot(0); __kf.requestRender(); }); await settle(p, 300);
  check(!(await vis(p, '[data-tooltip="upg:zinseszins"]')), 'K6.07: Kontor-Ausbau entfällt');
  check(errs.length === 0, `K6.07: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K6.08: Sitzungsprotokoll Format 3 (Kategorie je gewählter Karte, Synergiewerte, Weiterentwicklungen, p je Wahl) ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten&entdecken=0&buehne=0&debug=1');
  await p.evaluate(() => {
    const G = __kf.G; G.S.t = 300; G.S.pfad.lastPickT = 300;
    G.S.pendingDraft = { level: 1, options: ['bessereFabriken', 'kriegserfahrung'], rerolled: 0 }; G.S.pendingLevels = 1; G.chooseDraft(0);
    G.S.pendingDraft = { level: 2, options: ['gilde', 'drill'], rerolled: 0 }; G.S.pendingLevels = 1; G.chooseDraft(0);
    G.S.pfad.choices = 2; G.S.pendingDraft = null; G.S.pendingLevels = 1; G.S.level = 5; G.offerDraft();
    G.S.stats.weiter = [{ id: 'r_dampfkraft', bereich: 'fabrik', t: 400, ersetzt: 2 }]; G.tick(0.05);
  });
  const s = await p.evaluate(() => { const s = __kf.session(); return { fv: s.formatVersion, drafts: s.drafts.map(d => [d.chosen, d.kat]), kat: s.kategorien, syn: s.synergie, weiter: s.weiterentwicklungen, dp: s.doktrinP }; });
  check(s.fv === 3 && JSON.stringify(s.drafts) === JSON.stringify([['bessereFabriken', ['wirtschaft']], ['gilde', ['wirtschaft']]]), `K6.08: Kategorie je gewählter Karte im Protokoll ${show(s.drafts)}`);
  check(s.kat && s.kat.wirtschaft === 2 && s.syn && s.syn.gilde && s.syn.gilde.n === 2 && s.syn.gilde.wert > 0, `K6.08: Karten je Kategorie und Wert der Synergiekarte ${show([s.kat, s.syn])}`);
  check(JSON.stringify(s.weiter) === JSON.stringify([{ id: 'r_dampfkraft', bereich: 'fabrik', t: 400, ersetzteVarianten: 2 }]), `K6.08: Weiterentwicklung mit Zeitpunkt und ersetzten Varianten ${show(s.weiter)}`);
  check(Array.isArray(s.dp) && s.dp.length === 1 && s.dp[0].n === 3 && s.dp[0].p === 0.15, `K6.08: p des Doktrin-Faktors je Wahl ${show(s.dp)}`);
  check(errs.length === 0, `K6.08: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Standardmodus: nichts davon ---------- */
{
  const { ctx, p, errs } = await open('pacing=standard');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('fabrik'); G.S.t = 400; G.S.pfad.lastPickT = 400; __kf.selectTab('build'); __kf.selectPlot(0); G.S.draft.stacks.drill = 1; G.S.draft.stacks.kriegstrommeln = 1; G.S.draft.ver++; __kf.requestRender(); });
  await settle(p, 400);
  check(!(await vis(p, '#ctxVariants .pick')) && !(await vis(p, '#hudLines')), 'standard: keine Aufwertung, keine Linienanzeige');
  check(errs.length === 0, `standard: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
await b.close(); server.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : '\nalle Prüfungen bestanden');
process.exit(failed ? 1 : 0);

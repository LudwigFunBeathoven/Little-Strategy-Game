// Browser-Prüfung Version 0.9: Kartenwahl als Ablauf, Entdecken (REQ-K2.01 – K2.07), Fehlerbehebungen B1–B2. Vorgabe ohne Schalter: Bühne und Entdecken an. Braucht Playwright (nicht Teil des Projekts), Aufbau wie tests/browser-check.mjs.
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

/* Neue Partie mit Parametern; Hinweise und Speicher zurückgesetzt */
async function open(query = '', opts = {}){
  const ctx = await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 720 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  if (query.includes('intro=0')) await ctx.addInitScript(() => { try { localStorage.setItem('klammerfront.skipIntro', '1'); } catch (e) {} });       // ohne gestaffelte Einführung
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&lang=de&difficulty=easy&${query}`); await p.waitForTimeout(350);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  return { ctx, p, errs };
}
const vis = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.checkVisibility() && !e.hidden; }, sel);
const tick = (p, s = 0.05) => p.evaluate(s => { __kf.G.tick(s); __kf.requestRender(); }, s);
const settle = (p, ms = 250) => p.waitForTimeout(ms);
const levelUp = (p, n = 1) => p.evaluate(n => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + n); G.S.xp = G.S.xpTotal;
  G.S.units.push({ id: 99000 + G.S.level, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); }, n);

/* ---------- K2.01: freie Bildmitte ---------- */
for (const mode of ['', 'intro=0']){
  const { ctx, p, errs } = await open(mode); const tag = mode || 'Vorgabe';
  const r = await p.evaluate(() => { const x = innerWidth / 2, y = innerHeight / 2, el = document.elementFromPoint(x, y), o = [];
    for (const [fx, fy] of [[.5, .5], [.5, .3], [.5, .7], [.4, .5], [.6, .5]]) o.push(document.elementFromPoint(innerWidth * fx, innerHeight * fy).closest('#stage, #cardSym') ? 'bühne' : 'frei');
    return { center: el.id || el.tagName, stageHidden: document.getElementById('stage').hidden, stageDisplay: getComputedStyle(document.getElementById('stage')).display, deck: !!document.getElementById('deckBtn'), samples: o,
      sym: (() => { const s = document.getElementById('cardSym').getBoundingClientRect(); return s.top < 80; })() }; });
  check(r.stageHidden && r.stageDisplay === 'none' && !r.deck && r.samples.every(x => x === 'frei'), `[${tag}] K2.01: außerhalb einer Wahl liegt nichts von der Bühne in der Bildmitte, kein Dauerstapel ${JSON.stringify(r)}`);
  await p.evaluate(() => { __kf.G.S.xpTotal = 5; __kf.G.S.xp = 5; __kf.requestRender(); }); await settle(p);
  const sym = await p.evaluate(() => { const e = document.getElementById('cardSym'), r = e.getBoundingClientRect(); return { vis: e.checkVisibility(), inBar: r.top < 80, fill: e.querySelector('#deckFill').style.height }; });
  check(sym.vis && sym.inBar && parseFloat(sym.fill) > 0, `[${tag}] K2.01: Kartensymbol mit Füllstand in der Ressourcenleiste ${JSON.stringify(sym)}`);
  // Klick in die Bildmitte erreicht die Spielwelt
  const hit = await p.evaluate(() => { const c = document.getElementById('lane').getBoundingClientRect(); const x = c.left + c.width / 2, y = c.top + c.height / 2;
    let got = null; const f = e => { got = e.target.id; }; document.addEventListener('pointerdown', f, true); const el = document.elementFromPoint(x, y); document.removeEventListener('pointerdown', f, true); return el.id; });
  check(hit === 'lane', `[${tag}] K2.01: die Bildmitte der Welt nimmt Klicks an (${hit})`);
  // aufgeschobene Wahl: Symbol pulsiert, Klick öffnet
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.click('#stageLater'); await settle(p, 120);
  check(await p.evaluate(() => document.getElementById('cardSym').classList.contains('pulse') && document.getElementById('stage').hidden), `[${tag}] K2.01: aufgeschobene Wahl: Symbol pulsiert, Bühne zu`);
  await p.click('#cardSym'); await settle(p, 120);
  check(await vis(p, '#stage'), `[${tag}] K2.01: Klick auf das Symbol öffnet die Bühne`);
  check(errs.length === 0, `[${tag}] K2.01: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K2.02/K2.03: Ablauf und Vorderseite ---------- */
{
  const { ctx, p, errs } = await open();
  await levelUp(p, 1);
  await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const t0 = Date.now();
  const early = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(c => c.classList.contains('back-up')));
  check(early.length >= 2 && early.some(x => x), `K2.02: Karten erscheinen als Rückseiten (${JSON.stringify(early)})`);
  await p.waitForFunction(() => ![...document.querySelectorAll('.kcard')].some(c => c.classList.contains('back-up')), null, { timeout: 3000 });
  const tFlip = Date.now() - t0;
  check(tFlip <= 800 + 150, `K2.02: Erscheinen plus Aufdecken ≤ 800 ms (gemessen ${tFlip} ms, Toleranz 150 ms)`);
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  const tLock = Date.now() - t0;
  check(tLock >= 380, `K2.02: Eingabesperre endet frühestens 400 ms nach dem Erscheinen (${tLock} ms)`);
  // Vorderseite: Band, Name, Symbol, genau eine Wirkungszeile, Stufenpunkte, einheitliche Rückseite
  const face = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(c => ({ band: c.querySelector('.kc-fam').textContent, name: c.querySelector('.kc-name').textContent, art: !!c.querySelector('.kc-art').textContent,
    eff: c.querySelector('.kc-desc').textContent, effLen: c.querySelector('.kc-desc').textContent.length, dots: c.querySelector('.kc-tier').textContent, back: !!c.querySelector('.kc-back'), lines: c.querySelectorAll('.kc-desc, .kc-unlock, .kc-needs').length })));
  check(face.every(f => f.band && f.name && f.art && f.eff && f.effLen <= 44 && /[●○]/.test(f.dots) && f.back && f.lines === 1), `K2.03: Karte mit Band, Name, Symbol, einer Wirkungszeile ≤ 44 Zeichen, Stufenpunkten, Rückseite ${JSON.stringify(face[0])}`);
  const det = await p.evaluate(() => { document.querySelectorAll('.kcard')[0].focus(); return document.getElementById('stageDetail').textContent; });
  await settle(p, 80);
  check(!/Stapel|zurück/.test(await p.evaluate(() => document.getElementById('stageDetail').textContent)), `K2.03: Detailzeile ohne Hinweis auf die Rückkehr in den Stapel`);
  // Wahl: Karte fliegt, Rest zurück; Dauer ≤ 700 ms bis zum Abschluss; Marke am Wirkort
  const pick = 0;
  const c0 = Date.now();
  await p.evaluate(i => document.querySelectorAll('.kcard')[i].click(), Math.max(0, pick));
  await settle(p, 120);
  const fly = await p.evaluate(() => ({ clones: document.querySelectorAll('#stageFly .kcard').length, pending: !!__kf.G.S.pendingDraft, stageOpen: !document.getElementById('stage').hidden }));
  check(fly.clones >= 2 && fly.pending && fly.stageOpen, `K2.02: während des Abräumens fliegen die Karten, die Wahl gilt erst am Ende ${JSON.stringify(fly)}`);
  const frozen0 = await p.evaluate(() => __kf.G.S.t); await settle(p, 200);
  check(await p.evaluate(t => __kf.G.S.t === t, frozen0), 'K2.02: Spielzeit steht bis zum Ende des Abräumens (zeit = pause)');
  await p.waitForFunction(() => !__kf.G.S.pendingDraft, null, { timeout: 2000 });
  const tClear = Date.now() - c0;
  check(tClear <= 700 + 200, `K2.02: Wirkung plus Abräumen ≤ 700 ms (${tClear} ms, Toleranz 200 ms)`);
  await settle(p, 100);
  const after = await p.evaluate(() => ({ stage: document.getElementById('stage').hidden, fly: document.querySelectorAll('#stageFly .kcard').length,
    glow: [...document.querySelectorAll('.fx-glow')].map(e => e.id || e.dataset.tooltip), marks: [...document.querySelectorAll('i.new:not([hidden])')].map(e => e.parentElement.id || e.parentElement.textContent.slice(0, 20)) }));
  check(after.stage && after.fly === 0 && (after.glow.length >= 1), `K2.02: Bühne zu, Wirkort leuchtet ${JSON.stringify(after)}`);
  check(errs.length === 0, `K2.02: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
// reduzierte Bewegung: keine Flugkopien, sofortige Wahl
{
  const { ctx, p } = await open('', { reduced: true });
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  check(await p.evaluate(() => ![...document.querySelectorAll('.kcard')].some(c => c.classList.contains('back-up'))), 'K2.02: prefers-reduced-motion: Karten stehen sofort aufgedeckt da');
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await settle(p, 60);
  check(await p.evaluate(() => !__kf.G.S.pendingDraft && document.getElementById('stage').hidden && document.querySelectorAll('#stageFly .kcard').length === 0), 'K2.02: prefers-reduced-motion: Wahl gilt sofort, keine Bewegung');
  await ctx.close();
}
// mehrere offene Wahlen: die zweite folgt ohne Stapel-Rückkehr
{
  const { ctx, p } = await open();
  await levelUp(p, 2); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await settle(p, 150);
  const mid = await p.evaluate(() => ({ fades: [...document.querySelectorAll('#stageFly .kcard')].length }));
  await p.waitForFunction(() => __kf.G.S.pendingLevels === 1, null, { timeout: 2000 });
  await settle(p, 120);
  check(await vis(p, '#stage') && await p.evaluate(() => document.getElementById('stageFly').children.length === 0), `K2.02: zweite Wahl folgt auf der Bühne ${JSON.stringify(mid)}`);
  await ctx.close();
}

/* ---------- K2.04: Sichtbarkeit je Tabellenzeile (Standardmodus) ---------- */
{
  const { ctx, p, errs } = await open('intro=0');
  const v = async () => p.evaluate(() => { const g = id => { const e = document.getElementById(id); return !!e && e.checkVisibility(); };
    return { build: g('tab-build'), army: g('tab-army'), wall: g('tab-wall'), smithy: g('tab-smithy'), uni: g('tab-uni'), cards: g('tab-cards'), xp: !!document.querySelector('.hud-xp').checkVisibility(), sym: g('cardSym'),
      supply: !!document.getElementById('hudSoldiers').closest('.hud-item').checkVisibility(), armyst: !!document.getElementById('armyState').closest('.hud-item').checkVisibility(),
      waves: g('hudWaves'), mat: !!document.getElementById('material').checkVisibility() }; });
  let s = await v();
  check(s.build && s.army && s.mat && s.waves && !s.wall && !s.smithy && !s.uni && !s.cards && !s.xp && !s.sym && !s.supply && !s.armyst, `K2.04: Start: nur Bauen, Armee, Material, Wellen ${JSON.stringify(s)}`);
  await p.evaluate(() => { __kf.G.S.material = 100000; __kf.G.tick(0.05); __kf.G.tick(0.05); __kf.requestRender(); }); await settle(p, 200);
  s = await v(); check(s.wall, `K2.04: Reiter Mauer & Türme erscheint bei der ersten möglichen Handlung ${JSON.stringify(s)}`);
  await p.evaluate(() => { const G = __kf.G; G.S.xpTotal = 3; G.S.xp = 3; __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.xp && s.sym, 'K2.04: EP und Kartensymbol ab dem ersten EP-Gewinn');
  await p.evaluate(() => { __kf.G.S.material = 100000; __kf.G.spawn('laeufer'); __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.supply, 'K2.04: Versorgung ab der ersten gekauften Einheit');
  await p.evaluate(() => { __kf.G.S.ownWaveNo = 1; __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.armyst, 'K2.04: Armeezustand ab der ersten eigenen Welle');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e6; G.build('schmiede'); G.build('universitaet'); __kf.requestRender(); }); await settle(p, 200);
  s = await v(); check(s.smithy && s.uni, 'K2.04: Reiter Schmiede und Universität, sobald die Gebäude stehen');
  await p.evaluate(() => { const G = __kf.G; G.demolish(G.S.slots.findIndex(x => x && x.type === 'schmiede')); __kf.requestRender(); }); await settle(p, 200);
  s = await v(); check(s.smithy, 'K2.04: der Reiter eines abgerissenen Gebäudes bleibt');
  await p.evaluate(() => { __kf.selectTab('smithy'); }); await settle(p, 150);
  check(await p.evaluate(() => document.getElementById('smithyText').textContent.includes(__kf.t('panel.smithy.none'))), 'K2.04: abgerissene Schmiede: „nicht gebaut“');
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  s = await v(); check(s.cards, 'K2.04: Reiter Karten, sobald eine Wahl ansteht');
  check(errs.length === 0, `K2.04: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
{
  const { ctx, p } = await open('intro=0');                                // Kaserne-Abschnitt und Forschung
  await p.evaluate(() => __kf.selectTab('army')); await settle(p, 150);
  check(await vis(p, '#armyKaserne'), 'K2.04: Kaserne-Abschnitt sichtbar, sobald die Kaserne baubar ist (ohne Einführung)');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e6; G.build('universitaet'); __kf.selectTab('uni'); __kf.requestRender(); }); await settle(p, 250);
  const res = await p.evaluate(() => [...document.querySelectorAll('#panel-uni .opt')].filter(e => e.checkVisibility()).map(e => e.dataset.tooltip));
  const need = await p.evaluate(() => __kf.G.RESEARCH.filter(r => __kf.G.researchBlock(r.id) === 'requires').map(r => 'res:' + r.id));
  check(res.length >= 3 && need.length >= 1 && need.every(id => !res.includes(id)), `K2.04: Forschung erst, wenn ihre Voraussetzung erfüllt ist (verborgen: ${need.join(',')})`);
  await ctx.close();
}

/* ---------- K2.05: Sammlung, keine Spuren gesperrter Inhalte ---------- */
{
  const { ctx, p } = await open('intro=0');
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await p.waitForFunction(() => !__kf.G.S.pendingDraft, null, { timeout: 2000 });
  await p.evaluate(() => __kf.selectTab('cards')); await settle(p, 250);
  const col = await p.evaluate(() => ({ tags: [...document.querySelectorAll('#chosen .opt-tag')].length, heads: [...document.querySelectorAll('#chosen .fam-h')].length, banned: !document.getElementById('bannedList').hidden, hint: !document.getElementById('collHint').hidden }));
  check(col.tags === 1 && col.heads === 1 && col.banned && col.hint, `K2.05: Sammlung zeigt gewählte Karten nach Kategorie gruppiert und die gebannten ${JSON.stringify(col)}`);
  const txt = await p.evaluate(() => document.body.innerText);
  check(!/Öffnet mit|Freischaltung: Karte|Pfadübersicht/.test(txt), 'K2.05: keine Quellenangaben im sichtbaren Text');
  await ctx.close();
}

/* ---------- K2.06: Marke „neu“, genau ein Hinweis je Moment ---------- */
{
  const { ctx, p } = await open('intro=0');
  await settle(p, 600);                                                    // Grundlinie
  const hints = () => p.evaluate(() => JSON.parse(localStorage.getItem(__kf.C.HINTS_KEY) || '[]').filter(x => x.startsWith('disc:')));
  check((await hints()).length === 0, 'K2.06: vor dem Moment kein Entdeckungshinweis');
  // drei gleichzeitige Freischaltungen in einem Bild: Reiter Mauer & Türme, EP/Kartensymbol, Versorgung
  await p.evaluate(() => { const G = __kf.G; G.S.xpTotal = 3; G.S.xp = 3; G.S.material = 100000; G.spawn('laeufer'); G.tick(0.05); G.tick(0.05); __kf.requestRender(); }); await settle(p, 500);
  const h1 = await hints();
  check(h1.length === 1, `K2.06: drei gleichzeitige Freischaltungen lösen genau einen Hinweis aus ${JSON.stringify(h1)}`);
  check(await vis(p, '#tab-wall i.new'), 'K2.06: neuer Reiter trägt die Marke „neu“ am Reiterknopf');
  check(await p.evaluate(() => __kf.C.ENTDECKEN.einblendenMs <= 300), 'K2.06: Einblenden höchstens 300 ms (Konfiguration)');
  await p.evaluate(() => __kf.selectTab('wall')); await settle(p, (await p.evaluate(() => __kf.C.UI.newSeenMs)) + 600);
  await p.evaluate(() => __kf.selectTab('build')); await settle(p, 200);
  check(!(await vis(p, '#tab-wall i.new')), 'K2.06: die Marke verschwindet, nachdem der Reiter angesehen wurde');
  await ctx.close();
}

/* ---------- B1: Kontext eines Gebäudes zeigt nur dessen eigene Ausbauten ---------- */
{
  const { ctx, p, errs } = await open('intro=0');
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e6; G.build('universitaet'); G.build('kontor'); G.S.revealed.zinseszins = true; G.S.lvl.zinseszins = 2; __kf.requestRender(); });
  const iU = await p.evaluate(() => __kf.G.S.slots.findIndex(x => x && x.type === 'universitaet')), iK = await p.evaluate(() => __kf.G.S.slots.findIndex(x => x && x.type === 'kontor'));
  await p.evaluate(i => __kf.selectPlot(i), iU); await settle(p, 250);
  check(!(await vis(p, '#optsKontor')) && !(await vis(p, '[data-tooltip="upg:zinseszins"]')), 'B1: Universität gewählt: kein Kontor-Ausbau im Kontextkopf');
  await p.evaluate(i => __kf.selectPlot(i), iK); await settle(p, 250);
  check(await vis(p, '[data-tooltip="upg:zinseszins"]'), 'B1: Handelskontor gewählt: Kontor-Ausbau sichtbar');
  check(errs.length === 0, `B1: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- B2: In der Pause erzeugen Klicks nichts ---------- */
{
  const { ctx, p } = await open();
  await p.evaluate(() => { __kf.setPaused(true); }); await settle(p, 200);
  const m0 = await p.evaluate(() => __kf.G.S.materialTotal);
  for (let i = 0; i < 10; i++){ await p.evaluate(() => document.getElementById('clickBtn').dispatchEvent(new PointerEvent('pointerdown', { button: 0, isPrimary: true, bubbles: true }))); }
  await p.evaluate(() => document.getElementById('clickBtn').click());
  const r = await p.evaluate(() => ({ m: __kf.G.S.materialTotal, direct: __kf.G.doClick(), clicks: __kf.G.S.clickTimes.length, dis: document.getElementById('clickBtn').getAttribute('aria-disabled') }));
  check(r.m === m0 && r.direct === false && r.clicks === 0 && r.dis === 'true', `B2: Pause: Klickfeld gesperrt, kein Ertrag ${JSON.stringify(r)}`);
  await p.evaluate(() => __kf.setPaused(false)); await settle(p, 200);
  check(await p.evaluate(() => { const a = __kf.G.S.materialTotal; __kf.G.doClick(); return __kf.G.S.materialTotal > a; }), 'B2: nach „Weiter“ zählen Klicks wieder');
  await ctx.close();
}

/* ---------- K2.07: Schalter ---------- */
{
  const a = await open('entdecken=0&buehne=0');
  const sa = await a.p.evaluate(() => ({ tabs: [...document.querySelectorAll('[role=tab]')].filter(e => e.checkVisibility()).map(e => e.id), sym: document.getElementById('cardSym').checkVisibility(), stageOn: __kf.Stage.on(), disc: __kf.Disc.on() }));
  check(sa.tabs.includes('tab-wall') && sa.tabs.includes('tab-uni') && !sa.sym && !sa.stageOn && !sa.disc, `K2.07: ?entdecken=0&buehne=0 zeigt die Oberfläche von Version 0.8 ${JSON.stringify(sa)}`);
  await a.ctx.close();
  const c = await open('');
  const sc = await c.p.evaluate(() => ({ tabs: [...document.querySelectorAll('[role=tab]')].filter(e => e.checkVisibility()).map(e => e.id), body: document.body.classList.contains('disc'), stageOn: __kf.Stage.on() }));
  check(sc.body && sc.stageOn && sc.tabs.join() === 'tab-build,tab-army', `K2.07: Vorgabe: Entdecken und Bühne an, zu Beginn nur Bauen und Armee ${JSON.stringify(sc)}`);
  await levelUp(c.p, 1); await c.p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const cat = await c.p.evaluate(() => [...document.querySelectorAll('.kc-fam')].map(e => e.textContent));
  check(cat.length >= 2 && cat.every(x => /Wirtschaft|Armee|Basis|Automatisierung|Sonderregel/.test(x)), `K2.07: das Band zeigt die Kategorie ${JSON.stringify(cat)}`);
  await c.p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await c.p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await c.p.waitForFunction(() => !__kf.G.S.pendingDraft, null, { timeout: 2000 });
  await settle(c.p, 200);
  check(c.errs.length === 0, `K2.07: keine Konsolenfehler${show(c.errs)}`);
  await c.ctx.close();
  const d = await open('vorschau=naechste&zeit=lauf');
  const sd = await d.p.evaluate(() => ({ time: __kf.C.KARTENBUEHNE.zeit, prev: __kf.C.ENTDECKEN.vorschau, tp: document.getElementById('tabPrev').checkVisibility() }));
  check(sd.time === 'lauf' && sd.prev === 'naechste' && sd.tp, `K2.07: ?vorschau=naechste zeigt ein „?“ in der Reiterleiste, ?zeit=lauf setzt den Lauf ${JSON.stringify(sd)}`);
  await levelUp(d.p, 1); await d.p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const t1 = await d.p.evaluate(() => __kf.G.S.t); await settle(d.p, 500);
  check(await d.p.evaluate(t => __kf.G.S.t > t, t1), 'K2.02/K2.07: bei zeit = lauf läuft die Spielzeit bei offener Wahl weiter');
  await d.ctx.close();
}

await b.close(); server.close();
process.exit(failed ? 1 : 0);

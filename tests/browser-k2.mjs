// Browser-Prüfung Kartenpfad Teil 2 (REQ-K2.01 – K2.07). Braucht Playwright (nicht Teil des Projekts), Aufbau wie tests/browser-check.mjs.
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
async function open(query, opts = {}){
  const ctx = await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 720 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
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
for (const mode of ['pacing=karten', 'pacing=standard&buehne=1']){
  const { ctx, p, errs } = await open(mode); const tag = mode.split('&')[0];
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
  const { ctx, p, errs } = await open('pacing=karten');
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
  const pick = await p.evaluate(() => __kf.G.S.pendingDraft.options.findIndex(id => __kf.G.OPT[id].pfad));
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
  const { ctx, p } = await open('pacing=karten', { reduced: true });
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  check(await p.evaluate(() => ![...document.querySelectorAll('.kcard')].some(c => c.classList.contains('back-up'))), 'K2.02: prefers-reduced-motion: Karten stehen sofort aufgedeckt da');
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await settle(p, 60);
  check(await p.evaluate(() => !__kf.G.S.pendingDraft && document.getElementById('stage').hidden && document.querySelectorAll('#stageFly .kcard').length === 0), 'K2.02: prefers-reduced-motion: Wahl gilt sofort, keine Bewegung');
  await ctx.close();
}
// mehrere offene Wahlen: die zweite folgt ohne Stapel-Rückkehr
{
  const { ctx, p } = await open('pacing=karten');
  await levelUp(p, 2); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await settle(p, 150);
  const mid = await p.evaluate(() => ({ fades: [...document.querySelectorAll('#stageFly .kcard')].length }));
  await p.waitForFunction(() => __kf.G.S.pendingLevels === 1, null, { timeout: 2000 });
  await settle(p, 120);
  check(await vis(p, '#stage') && await p.evaluate(() => document.getElementById('stageFly').children.length === 0), `K2.02: zweite Wahl folgt auf der Bühne ${JSON.stringify(mid)}`);
  await ctx.close();
}

/* ---------- K2.04: Sichtbarkeit je Tabellenzeile ---------- */
{
  const { ctx, p, errs } = await open('pacing=karten');
  const v = async () => p.evaluate(() => { const g = id => { const e = document.getElementById(id); return !!e && e.checkVisibility(); };
    return { build: g('tab-build'), army: g('tab-army'), wall: g('tab-wall'), smithy: g('tab-smithy'), uni: g('tab-uni'), cards: g('tab-cards'),
      kaserne: g('armyKaserne') && document.getElementById('tab-army') && true, xp: !!document.querySelector('.hud-xp').checkVisibility(), sym: g('cardSym'),
      supply: !!document.getElementById('hudSoldiers').closest('.hud-item').checkVisibility(), armyst: !!document.getElementById('armyState').closest('.hud-item').checkVisibility(),
      waves: g('hudWaves'), mat: !!document.getElementById('material').checkVisibility() }; });
  let s = await v();
  check(s.build && s.army && s.mat && s.waves && !s.wall && !s.smithy && !s.uni && !s.cards && !s.xp && !s.sym && !s.supply && !s.armyst, `K2.04: Start: nur Bauen, Armee, Material, Wellen ${JSON.stringify(s)}`);
  const armyKas = () => p.evaluate(() => { __kf.selectTab('army'); const e = document.getElementById('armyKaserne'); return e.checkVisibility(); });
  await settle(p, 100);
  check(!(await armyKas()), 'K2.04: Kaserne-Abschnitt nicht sichtbar, solange die Kaserne nicht baubar ist');
  await p.evaluate(() => { __kf.G.unlockKey('bau:kaserne'); __kf.requestRender(); }); await settle(p, 150);
  check(await armyKas(), 'K2.04: Kaserne-Abschnitt sichtbar, sobald die Kaserne baubar ist');
  await p.evaluate(() => { __kf.G.S.material = 100000; __kf.G.tick(0.05); __kf.G.tick(0.05); __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.wall, `K2.04: Reiter Mauer & Türme erscheint bei der ersten möglichen Handlung ${JSON.stringify(s)}`);
  await p.evaluate(() => { const G = __kf.G; G.S.xpTotal = 3; G.S.xp = 3; __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.xp && s.sym, 'K2.04: EP und Kartensymbol ab dem ersten EP-Gewinn');
  await p.evaluate(() => { __kf.G.S.material = 100000; __kf.G.spawn('laeufer'); __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.supply, 'K2.04: Versorgung ab der ersten gekauften Einheit');
  await p.evaluate(() => { __kf.G.S.ownWaveNo = 1; __kf.requestRender(); }); await settle(p, 150);
  s = await v(); check(s.armyst, 'K2.04: Armeezustand ab der ersten eigenen Welle');
  await p.evaluate(() => { const G = __kf.G; G.unlockKey('bau:schmiede'); G.unlockKey('bau:universitaet'); G.S.material = 1e6; G.build('schmiede'); G.build('universitaet'); __kf.requestRender(); }); await settle(p, 200);
  s = await v(); check(s.smithy && s.uni, 'K2.04: Reiter Schmiede und Universität, sobald die Gebäude stehen');
  await p.evaluate(() => { const G = __kf.G; G.demolish(G.S.slots.findIndex(x => x && x.type === 'schmiede')); __kf.requestRender(); }); await settle(p, 200);
  s = await v(); check(s.smithy, 'K2.04: der Reiter eines abgerissenen Gebäudes bleibt');
  await p.evaluate(() => { __kf.selectTab('smithy'); }); await settle(p, 150);
  check(await p.evaluate(() => document.getElementById('smithyText').textContent.includes(__kf.t('panel.smithy.none'))), 'K2.04: abgerissene Schmiede: „nicht gebaut“');
  // Karten-Reiter nach der ersten Wahl
  await levelUp(p, 1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  s = await v(); check(s.cards, 'K2.04: Reiter Karten, sobald eine Wahl ansteht');
  // Forschung: nur geöffnete sind sichtbar
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await settle(p, 900);
  await p.evaluate(() => __kf.selectTab('uni')); await settle(p, 200);
  const res = await p.evaluate(() => ({ closed: [...document.querySelectorAll('#panel-uni .opt')].filter(e => e.checkVisibility() && e.dataset.tooltip === 'res:r_reiter').length,
    aria: [...document.querySelectorAll('#panel-uni .opt')].filter(e => e.checkVisibility()).map(e => e.dataset.tooltip) }));
  check(res.closed === 0, `K2.04: gesperrte Forschung (Reiter) nicht sichtbar ${JSON.stringify(res.aria)}`);
  await p.evaluate(() => { __kf.G.unlockKey('forschung:r_reiter'); __kf.requestRender(); }); await settle(p, 200);
  check(await vis(p, '[data-tooltip="res:r_reiter"]'), 'K2.04: Forschung sichtbar, sobald sie geöffnet ist');
  check(errs.length === 0, `K2.04: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- K2.05: kein sichtbarer Text nennt Gesperrtes ---------- */
{
  const { ctx, p } = await open('pacing=karten');
  await p.evaluate(() => { __kf.G.S.material = 2500; });
  const names = await p.evaluate(() => { const t = __kf.t, G = __kf.G, C = __kf.C; return { locked: [t('unit.werfer.name'), t('unit.schild.name'), t('unit.armbrust.name'), t('unit.katapult.name'), t('bld.schmiede.name'), t('bld.universitaet.name'), t('bld.kontor.name'), 'Festungsbau', 'Echtes Militär', 'Metallverarbeitung', 'Gelehrte'] }; });
  const texts = [];
  for (const tab of ['build', 'army', 'wall']){
    await p.evaluate(tab => { __kf.selectTab(tab); __kf.selectPlot(0); }, tab); await settle(p, 200);
    texts.push(await p.evaluate(() => document.body.innerText));
  }
  await p.evaluate(() => __kf.selectTab('cards')); await settle(p, 150); texts.push(await p.evaluate(() => document.body.innerText));
  const all = texts.join('\n'), hit = names.locked.filter(n => new RegExp(`(^|[^\\p{L}])${n}([^\\p{L}]|$)`, 'u').test(all));
  // Der Name der Kaserne darf stehen, weil sie baubar ist; Gesperrtes (Werfer, Schmiede, Universität …) nicht.
  check(hit.length === 0, `K2.05: im sichtbaren Text kommt kein gesperrter Inhalt vor${show(hit)}`);
  check(!/Freischaltung: Karte|Öffnet mit|Pfadübersicht/.test(all) && await p.evaluate(() => !document.getElementById('pathList') || document.getElementById('pathList').hidden), 'K2.05: keine Quellenangabe („Freischaltung: Karte …“, „Öffnet mit“), keine Pfadübersicht');
  await ctx.close();
}

/* ---------- K2.06: Marke „neu“ und genau ein Hinweis je Moment ---------- */
{
  const { ctx, p } = await open('pacing=karten&dev=1');
  await settle(p, 600);                                                    // Grundlinie
  const hints = () => p.evaluate(() => JSON.parse(localStorage.getItem(__kf.C.HINTS_KEY) || '[]').filter(x => x.startsWith('disc:')));
  check((await hints()).length === 0, 'K2.06: vor dem Moment kein Entdeckungshinweis');
  // drei gleichzeitige Freischaltungen: Reiter Mauer & Türme, Kaserne-Abschnitt, EP/Kartensymbol – in einem Bild
  await p.evaluate(() => { const G = __kf.G; G.unlockKey('bau:kaserne'); G.S.xpTotal = 3; G.S.xp = 3; G.S.material = 100000; G.tick(0.05); G.tick(0.05); __kf.requestRender(); }); await settle(p, 500);
  const h1 = await hints();
  check(h1.length === 1, `K2.06: drei gleichzeitige Freischaltungen lösen genau einen Hinweis aus ${JSON.stringify(h1)}`);
  check(await vis(p, '#tab-wall i.new'), 'K2.06: neuer Reiter trägt die Marke „neu“ am Reiterknopf');
  const fade = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--x') + '|' + (parseFloat(__kf.C.ENTDECKEN.einblendenMs) <= 300));
  check(fade.endsWith('true'), 'K2.06: Einblenden höchstens 300 ms (Konfiguration)');
  await p.evaluate(() => __kf.selectTab('wall')); await settle(p, (await p.evaluate(() => __kf.C.UI.newSeenMs)) + 600);
  await p.evaluate(() => __kf.selectTab('build')); await settle(p, 200);
  check(!(await vis(p, '#tab-wall i.new')), 'K2.06: die Marke verschwindet, nachdem der Reiter angesehen wurde');
  await ctx.close();
}

/* ---------- K2.07: standard mit Schaltern, standard ohne Schalter ---------- */
{
  const a = await open('pacing=standard');
  const sa = await a.p.evaluate(() => ({ tabs: [...document.querySelectorAll('[role=tab]')].filter(e => e.checkVisibility()).map(e => e.id), sym: document.getElementById('cardSym').checkVisibility(), stage: document.getElementById('stage').hidden, hud: [...document.querySelectorAll('.hud-item')].filter(e => e.checkVisibility()).length }));
  check(sa.tabs.includes('tab-wall') && sa.tabs.includes('tab-uni') && !sa.sym && sa.stage, `K2.07: standard ohne Schalter wie main (alle Reiter, kein Kartensymbol) ${JSON.stringify(sa)}`);
  await a.ctx.close();
  const c = await open('pacing=standard&entdecken=1&buehne=1');
  const sc = await c.p.evaluate(() => ({ tabs: [...document.querySelectorAll('[role=tab]')].filter(e => e.checkVisibility()).map(e => e.id), body: document.body.classList.contains('disc'), stageOn: __kf.Stage.on() }));
  check(sc.body && sc.stageOn && sc.tabs.join() === 'tab-build,tab-army', `K2.07: standard mit ?entdecken=1&buehne=1: nur Bauen und Armee zu Beginn ${JSON.stringify(sc)}`);
  await levelUp(c.p, 1); await c.p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const cat = await c.p.evaluate(() => [...document.querySelectorAll('.kc-fam')].map(e => e.textContent));
  check(cat.length >= 2 && !cat.includes('Bonus'), `K2.07: mit der Bühne zeigt das Band die Kategorie statt der Familie ${JSON.stringify(cat)}`);
  await c.p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await c.p.evaluate(() => document.querySelectorAll('.kcard')[0].click()); await c.p.waitForFunction(() => !__kf.G.S.pendingDraft, null, { timeout: 2000 });
  await settle(c.p, 200);
  check(c.errs.length === 0, `K2.07: standard mit Schaltern: keine Konsolenfehler${show(c.errs)}`);
  await c.ctx.close();
  // Vorschau und Lauf
  const d = await open('pacing=karten&vorschau=naechste&zeit=lauf');
  const sd = await d.p.evaluate(() => ({ time: __kf.C.KARTENBUEHNE.zeit, prev: __kf.C.ENTDECKEN.vorschau }));
  check(sd.time === 'lauf' && sd.prev === 'naechste', `K2.07: ?vorschau=naechste und ?zeit=lauf setzen die Konfiguration ${JSON.stringify(sd)}`);
  await levelUp(d.p, 1); await d.p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const t1 = await d.p.evaluate(() => __kf.G.S.t); await settle(d.p, 500);
  check(await d.p.evaluate(t => __kf.G.S.t > t, t1), 'K2.02/K2.07: bei zeit = lauf läuft die Spielzeit bei offener Wahl weiter');
  await d.ctx.close();
}

await b.close(); server.close();
process.exit(failed ? 1 : 0);

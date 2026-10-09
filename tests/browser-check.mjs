// Optionale Browser-Prüfung. Braucht Playwright, das NICHT zum Projekt gehört:
//   npx playwright install chromium   (einmalig, außerhalb des Projekts)
//   node tests/browser-check.mjs
// Prüft je Sprache: Start ohne Fehler in der Konsole, Tooltip-Abdeckung, Erklärzeile an jedem Knopf (REQ-20.1),
// Tooltip-Verzögerung, Tooltip im Fenster, keine deutschen Reste in der englischen Oberfläche, keine fehlenden Schlüssel,
// Erstkontakt-Hinweise nur einmal pro Browser und wieder nach dem Zurücksetzen (REQ-20.2/20.3).
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { console.log('Playwright nicht installiert – Browser-Prüfung übersprungen.'); process.exit(0); }

// Die Seite wird über einen lokalen HTTP-Server geladen, nicht als file://: Chromium verliert den localStorage von file://-Seiten beim Neuladen
// gelegentlich vollständig (beobachtet: 1 von 12 Läufen; über HTTP 0 von 40), was Prüfungen mit Neuladen zufällig scheitern ließ.
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
// ?tutorial=0: die bisherigen Abläufe starten über den Startdialog; das Tutorial hat unten eigene Prüfungen (REQ-T.04)
const url = base + 'index.html?dev=1&tutorial=0&pacing=standard&entdecken=0&buehne=0';          // die bisherigen Abläufe (Version 0.8) bleiben per Adresse erreichbar und werden so geprüft
const urlTutorial = base + 'index.html?dev=1&pacing=standard&entdecken=0&buehne=0';   // Tutorial-Prüfungen hängen ?lang= und ?difficulty= an (überspringen den Startbildschirm)
const b = await chromium.launch();
let failed = 0;
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) failed++; };
const show = list => list.length ? ' ' + JSON.stringify(list.slice(0, 3)) : '';

for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const warns = [], errors = [];
  p.on('console', m => {
    if (m.type() === 'warning' && m.text().includes('[i18n]')) warns.push(m.text());
    if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errors.push(m.text());
  });
  p.on('pageerror', e => errors.push(e.message));
  // Frischer Browser-Speicher je Sprache, danach bleibt er über das spätere Neuladen erhalten
  await p.goto(url);
  await p.evaluate(l => { localStorage.clear(); localStorage.setItem('klammerfront.lang', l); }, lang);
  await p.reload(); await p.waitForTimeout(300);
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0, `[${lang}] Startbildschirm: alle Elemente mit Tooltip`);
  const startExpl = await p.evaluate(() => __kf.explAudit());
  check(startExpl.length === 0, `[${lang}] Startbildschirm: jeder Knopf mit Erklärzeile${show(startExpl)}`);
  await p.click('[data-tooltip="skipIntro"]');
  check(await p.evaluate(() => document.querySelector('[data-tooltip="skipIntro"]').getAttribute('aria-pressed') === 'true'), `[${lang}] „Einführung überspringen“ lässt sich einschalten`);
  await p.click('.card .btn-primary');

  // Partie vorantreiben, damit alle Bereiche sichtbar werden; das Ergebnisfenster darf nicht aufgehen
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e5; G.S.enemyBaseHp = 1e9;
    for (const t of ['fabrik', 'fabrik', 'schmiede', 'kaserne', 'universitaet']) G.build(t);
    G.S.sections.forEach(s => { s.hp = 1e9; });
    for (let i = 0; i < 20 * 90 && G.S.status === 'running'; i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.05); if (i % 10 === 0){ G.doClick(); for (const id in __kf.C.UPGRADES) G.buy(id); G.spawn('laeufer'); } }
    G.S.sections.forEach((s, i) => { s.hp = G.sectionMax(i) * 0.6; });
    G.S.pendingDraft = null; G.S.pendingLevels = 0; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { if (!document.querySelector('#modal').hidden) document.querySelector('#modal').hidden = true; });
  check(await p.evaluate(() => !document.querySelector('#hintBox').hidden), `[${lang}] Erstkontakt-Hinweis erscheint`);
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0, `[${lang}] Spiel: alle interaktiven Elemente mit Tooltip`);
  const gameExpl = await p.evaluate(() => __kf.explAudit());
  check(gameExpl.length === 0, `[${lang}] Spiel: jeder Knopf mit Erklärzeile${show(gameExpl)}`);
  const before = await p.evaluate(() => document.querySelector('#hintText').textContent);
  await p.click('#hintOk');
  check(await p.evaluate(b => document.querySelector('#hintBox').hidden || document.querySelector('#hintText').textContent !== b, before), `[${lang}] Hinweis lässt sich wegklicken`);
  await p.evaluate(() => { while (!document.querySelector('#hintBox').hidden) document.querySelector('#hintOk').click(); });

  // Kontextkopf: leerer Bauplatz, Kaserne, Schmiede, Mauer – Erklärzeilen und Tooltips auch dort
  for (const sel of [() => __kf.selectPlot(__kf.G.S.slots.findIndex(s => !s)), () => __kf.selectPlot(__kf.G.S.slots.findIndex(s => s && s.type === 'kaserne')),
                     () => __kf.selectPlot(__kf.G.S.slots.findIndex(s => s && s.type === 'schmiede')), () => __kf.selectSection(0)]){
    await p.evaluate(sel); await p.waitForTimeout(150);
    const ex = await p.evaluate(() => __kf.explAudit()), tt = await p.evaluate(() => __kf.tooltipAudit());
    check(ex.length === 0 && tt.length === 0, `[${lang}] Kontextkopf ${await p.evaluate(() => JSON.stringify(__kf.ctxSel))}: Erklärzeilen und Tooltips${show(ex.concat(tt))}`);
  }
  // Jeder Reiter: Erklärzeilen an allen sichtbaren Knöpfen
  await p.evaluate(() => __kf.clearSelection());
  for (const tab of ['build', 'wall', 'army', 'smithy', 'uni', 'cards']){
    await p.evaluate(id => __kf.selectTab(id), tab); await p.waitForTimeout(120);
    const ex = await p.evaluate(() => __kf.explAudit());
    check(ex.length === 0 && await p.evaluate(id => __kf.tab === id, tab), `[${lang}] Reiter ${tab}: sichtbar, jeder Knopf mit Erklärzeile${show(ex)}`);
  }
  await p.evaluate(() => __kf.selectTab('build'));

  await p.locator('#clickBtn').scrollIntoViewIfNeeded();
  await p.mouse.move(2, 2); await p.waitForTimeout(100);
  const box = await p.locator('#clickBtn').boundingBox();
  await p.mouse.move(box.x + 10, box.y + 10);
  await p.waitForSelector('#tip:not([hidden])', { timeout: 3000 });
  const delay = await p.evaluate(() => __kf.Tip.lastDelay);
  check(Math.abs(delay - (await p.evaluate(() => __kf.C.TOOLTIP_DELAY_MS))) <= 100, `[${lang}] Tooltip-Verzögerung ${Math.round(delay)} ms (± 100 ms)`);
  const r = await p.$eval('#tip', e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
  check(r, `[${lang}] Tooltip vollständig im Fenster`);
  await p.mouse.move(5, 5);
  if (lang === 'en'){
    const text = await p.evaluate(() => document.body.innerText + [...document.querySelectorAll('[role="tabpanel"]')].map(e => e.textContent).join(' '));
    const hits = [...new Set(text.match(/[äöüßÄÖÜ]|\b(und|der|die|das|Stufe|Gegner|Einheiten|Bauplatz|Material pro|Welle)\b/g) || [])];
    check(hits.length === 0, `[en] keine deutschen Reste${show(hits)}`);
  }

  // Hinweise: nach Neuladen nicht erneut, nach dem Zurücksetzen wieder
  await p.reload(); await p.waitForTimeout(400);
  // Hinweise, die der geladene Spielstand beim Start auslöst (z. B. Kartenwahl), zuerst wegklicken
  await p.evaluate(() => { while (!document.querySelector('#hintBox').hidden) document.querySelector('#hintOk').click(); });
  const again = await p.evaluate(() => { __kf.showHint('buildings'); return document.querySelector('#hintBox').hidden ? null : document.querySelector('#hintText').textContent; });
  check(again === null, `[${lang}] gesehener Hinweis erscheint nach Neuladen nicht erneut${again ? ' ' + again : ''}`);
  const afterReset = await p.evaluate(() => { __kf.Hints.reset(); __kf.showHint('buildings'); return !document.querySelector('#hintBox').hidden; });
  check(afterReset, `[${lang}] Hinweis erscheint nach dem Zurücksetzen wieder`);

  check(warns.length === 0, `[${lang}] keine fehlenden Sprachschlüssel${show(warns)}`);
  check(errors.length === 0, `[${lang}] keine Fehler in der Konsole${show(errors)}`);
  await ctx.close();
}
// REQ-46 und REQ-5.03: drei Bänder, Scrollen, Bauplatz-Klick, Bildzeit
import { mkdirSync, writeFileSync } from 'node:fs';
const shotDir = new URL('../reports/screens/', import.meta.url);
mkdirSync(shotDir, { recursive: true });
for (const [w, h] of [[1280, 720], [1366, 768], [1920, 1080], [2560, 1440]]){
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  const noH = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  check(noH, `[${w}×${h}] keine waagrechte Bildlaufleiste`);
  const bands = await p.evaluate(() => { const H = innerHeight, g = id => document.getElementById(id).getBoundingClientRect();
    return { H, hud: g('hud').height, world: g('worldband').height, work: g('work').height, bottom: g('work').bottom,
             noV: document.documentElement.scrollHeight <= H && document.body.scrollHeight <= H, B: __kf.C.UI }; });
  const hudOk = bands.hud >= bands.B.hudMinPx - 1 && bands.hud <= bands.B.hudMaxPx + 1 &&
                (Math.abs(bands.hud / bands.H - bands.B.bands.hud) <= 0.02 || Math.abs(bands.hud - bands.B.hudMinPx) <= 1 || Math.abs(bands.hud - bands.B.hudMaxPx) <= 1);
  const worldOk = Math.abs(bands.world / bands.H - bands.B.bands.world) <= 0.02;
  const workOk = Math.abs(bands.work / bands.H - bands.B.bands.work) <= 0.02 || Math.abs(bands.hud + bands.world + bands.work - bands.H) <= 1;
  check(hudOk && worldOk && workOk && bands.noV && Math.abs(bands.bottom - bands.H) <= 1,
    `[${w}×${h}] Bänder: Leiste ${Math.round(bands.hud)} px, Welt ${(100 * bands.world / bands.H).toFixed(1)} %, Arbeitsbereich ${(100 * bands.work / bands.H).toFixed(1)} %; kein Dokument-Scroll`);
  // ohne EP: eine Kartenwahl würde den Reiter wechseln (REQ-6.04) und die Reiter-Prüfungen stören
  await p.evaluate(() => { for (const u of Object.values(__kf.C.UNITS)) u.bounty = 0; });
  await p.evaluate(() => { const G = __kf.G; G.S.nextWave = G.S.t + 15; G.S.material = 1e5; for (const t of ['fabrik', 'schmiede', 'kaserne', 'universitaet']) G.build(t);
    for (let l = 0; l < 3; l++){ G.addFormation('p', l, Array(8).fill('laeufer').concat(['werfer', 'werfer', 'werfer']), 560); G.addFormation('e', l, Array(6).fill('laeufer').concat(['werfer']), 640); }
    for (const u of G.S.units) if (u.id % 3 === 0) u.hp = u.maxHp * 0.5;
    __kf.selectPlot(5); __kf.Cam.goTo(__kf.Cam.frontTarget() + 150); });
  await p.waitForTimeout(300);
  // Bildschirmfoto für den Bericht, auch als Beleg der Lesbarkeit der Einheiten bei 1280×720 (REQ-5.03)
  await p.screenshot({ path: new URL(`i5-layout-${w}x${h}.png`, shotDir).pathname });
  await p.evaluate(() => { const G = __kf.G; G.S.nextWave = 1e9; });
  // Klick auf Objekte in der Welt öffnet den passenden Reiter mit Kontextkopf (je Objekttyp)
  // Heimat-Reiter je Gebäude (REQ-6.05): Kaserne → Armee
  for (const [kind, want] of [['fabrik', 'build'], ['schmiede', 'smithy'], ['kaserne', 'army'], ['universitaet', 'uni'], ['frei', 'build'], ['mauer', 'wall']]){
    await p.evaluate(() => { __kf.clearSelection(); __kf.selectTab('army'); __kf.Cam.goTo(0); });
    await p.waitForTimeout(60);
    const pt = await p.evaluate(k => { const S = __kf.G.S;
      const r = k === 'mauer' ? __kf.sectionRects[0] : __kf.plotRects[k === 'frei' ? S.slots.findIndex(s => !s) : S.slots.findIndex(s => s && s.type === k)];
      return __kf.worldToScreen(r.x + r.w / 2, r.y + r.h / 2); }, kind);
    await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(80);
    const st = await p.evaluate(() => ({ tab: __kf.tab, head: !document.querySelector('#ctxHead').hidden, sel: __kf.sel }));
    check(st.tab === want && st.head, `[${w}×${h}] Klick auf ${kind}: Reiter ${st.tab}, Kontextkopf ${st.head ? 'sichtbar' : 'fehlt'}`);
  }
  // Esc und Klick ins Leere heben die Auswahl auf; der Reiter bleibt
  await p.keyboard.press('Escape'); await p.waitForTimeout(60);
  check(await p.evaluate(() => __kf.sel === null && __kf.tab === 'wall'), `[${w}×${h}] Esc hebt die Auswahl auf, Reiter bleibt`);
  await p.evaluate(() => __kf.selectPlot(0)); await p.waitForTimeout(150);
  const empty = await p.evaluate(() => { while (!document.querySelector('#hintBox').hidden) document.querySelector('#hintOk').click();
    const r = document.querySelector('#lane').getBoundingClientRect(); return __kf.worldToScreen(__kf.Cam.x + r.width * 0.6, r.height - 20); });
  await p.mouse.click(empty.x, empty.y); await p.waitForTimeout(150);
  check(await p.evaluate(() => __kf.sel === null && __kf.tab === 'build'), `[${w}×${h}] Klick auf leere Stelle hebt die Auswahl auf`);
  // Alle Reiter per Tastatur erreichbar (Tab-Taste in die Leiste, dann Pfeiltasten)
  await p.evaluate(() => { __kf.selectTab('build'); document.querySelector('#tab-build').focus(); });
  const seenTabs = [];
  for (let k = 0; k < 6; k++){ seenTabs.push(await p.evaluate(() => __kf.tab)); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); }
  const visTabs = await p.evaluate(() => [...document.querySelectorAll('[role="tab"]')].filter(b => !b.hidden).map(b => b.id.slice(4)));
  check(visTabs.every(id => seenTabs.includes(id)), `[${w}×${h}] alle Reiter per Tastatur erreichbar (${[...new Set(seenTabs)].join(', ')})`);
  await p.evaluate(() => { __kf.G.S.units = []; __kf.G.S.forms = []; __kf.clearSelection(); });
  const cam = () => p.evaluate(() => __kf.Cam.x);
  const box = await p.locator('#lane').boundingBox();
  await p.evaluate(() => __kf.Cam.goTo(0));
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await p.mouse.wheel(0, 200); await p.waitForTimeout(100);
  check(await cam() > 0, `[${w}×${h}] Mausrad scrollt`);
  await p.evaluate(() => __kf.Cam.goTo(0));
  await p.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2); await p.mouse.down();
  await p.mouse.move(box.x + box.width * 0.8 - 150, box.y + box.height / 2, { steps: 5 }); await p.mouse.up();
  const dragged = await cam();
  check(Math.abs(dragged - 150) <= 2, `[${w}×${h}] Ziehen scrollt (${Math.round(dragged)} px)`);
  await p.evaluate(() => __kf.Cam.goTo(0));
  await p.locator('#lane').focus();
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('d');
  check(Math.abs(await cam() - 2 * (await p.evaluate(() => __kf.C.SCROLL_STEP_PX))) < 1, `[${w}×${h}] Pfeiltaste und D scrollen`);
  await p.keyboard.press('a'); await p.keyboard.press('ArrowLeft');
  check(await cam() === 0, `[${w}×${h}] Pfeiltaste und A scrollen zurück`);
  await p.evaluate(() => { const el = document.querySelector('#worldScroll'); el.value = '1000'; el.dispatchEvent(new Event('input')); });
  check(Math.abs(await cam() - await p.evaluate(() => __kf.Cam.max())) < 1, `[${w}×${h}] Scrollleiste scrollt`);
  await p.click('#camRealm'); await p.waitForTimeout(50);
  check(await cam() === 0, `[${w}×${h}] „Reich“ springt zum Reich`);
  // Klick auf Bauplatz 5 (Mitte): wählt ihn aus, ohne zu scrollen; kleine Bewegung unter der Schwelle bleibt ein Klick
  await p.evaluate(() => { __kf.G.S.slots[4] = null; });
  const r = await p.evaluate(() => __kf.plotRects[4]);
  await p.mouse.move(box.x + r.x + r.w / 2, box.y + r.y + r.h / 2); await p.mouse.down();
  await p.mouse.move(box.x + r.x + r.w / 2 + 3, box.y + r.y + r.h / 2); await p.mouse.up(); await p.waitForTimeout(100);
  const sel = await p.evaluate(() => __kf.ctxSel);
  check(sel.kind === 'plot' && sel.i === 4 && await cam() === 0, `[${w}×${h}] Klick auf Bauplatz wählt ihn aus, ohne zu scrollen`);
  // Front folgen und Bildzeit mit 60 Einheiten
  await p.evaluate(() => { const G = __kf.G; G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity;
    G.addFormation('p', 1, Array(30).fill('laeufer'), 900); G.addFormation('e', 0, Array(30).fill('laeufer'), 1400); });
  await p.click('#camFront'); await p.waitForTimeout(50);
  check(await cam() > 0, `[${w}×${h}] „Front“ springt zur vordersten Formation`);
  await p.evaluate(() => __kf.Cam.goTo(0));
  await p.click('#camFollow'); await p.waitForTimeout(1500);
  check(await p.evaluate(() => __kf.Cam.follow) && await cam() > 0, `[${w}×${h}] „Front folgen“ führt die Kamera nach`);
  await p.click('#camFollow');
  const seen = await p.evaluate(() => { __kf.Cam.goTo(__kf.Cam.frontTarget()); return __kf.G.S.units.length; });
  const ms = await p.evaluate(() => __kf.benchDraw(60));
  check(ms <= 20, `[${w}×${h}] Bildzeit mit ${seen} Einheiten: Median ${ms.toFixed(2)} ms (≤ 20 ms)`);
  check(errors.length === 0, `[${w}×${h}] keine Fehler${show(errors)}`);
  await ctx.close();
}

// REQ-5.01: Eingabe. Klicks mit menschlicher Haltedauer, Treffer in der Welt, Klickfeld, Latenz, devicePixelRatio 1 und 2
const quantile = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };
for (const dsf of [1, 2]){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; const G = __kf.G;
    G.S.nextWave = 1e9; G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e9; }); G.S.material = 5000; for (let i = 0; i < 4; i++) G.build('fabrik'); });
  const tag = `[Eingabe, dpr ${dsf}]`;
  // Umrechnung Bildschirm ↔ Welt: Hin und zurück bei verschiedenen Kamerapositionen
  const round = await p.evaluate(() => { let worst = 0;
    for (const cx of [0, 137, 400, __kf.Cam.max()]){ __kf.Cam.goTo(cx);
      for (const [x, y] of [[40, 30], [__kf.Cam.x + 300, 200], [__kf.Cam.x + 900, 350]]){
        const sc = __kf.worldToScreen(x, y), w = __kf.screenToWorld(sc.x, sc.y); worst = Math.max(worst, Math.hypot(w.x - x, w.y - y)); } }
    __kf.Cam.goTo(0); return worst; });
  check(round < 0.01, `${tag} screenToWorld ist die Umkehrung von worldToScreen (Abweichung ${round.toFixed(4)} px)`);

  // Bau-Option mit 120 ms gedrückter Taste bei laufender Produktion (Befund PO: mehrere Klicks nötig)
  let built = 0;
  for (let k = 0; k < 4; k++){
    const free = await p.evaluate(() => { const i = __kf.G.S.slots.findIndex(s => !s); __kf.selectPlot(i); __kf.G.S.material = 1e6; return i; });
    await p.waitForTimeout(120);
    const bx = await p.evaluate(() => { const e = document.querySelector('#ctxBuild .pick'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await p.mouse.move(bx.x, bx.y); await p.mouse.down(); await p.waitForTimeout(120); await p.mouse.up(); await p.waitForTimeout(80);
    if (await p.evaluate(i => !!__kf.G.S.slots[i], free)) built++;
  }
  check(built === 4, `${tag} Bau-Option mit 120 ms Haltedauer: ${built} von 4 gebaut`);
  // Einheitenknopf mit 120 ms Haltedauer
  let queued = 0;
  await p.evaluate(() => { __kf.G.S.nextOwnWave = 1e9; __kf.selectTab('army'); });
  await p.waitForTimeout(60);
  for (let k = 0; k < 10; k++){
    await p.evaluate(() => { __kf.G.S.queue = []; __kf.G.S.material = 1e6; });
    const bx = await p.evaluate(() => { const e = document.querySelector('[data-tooltip="unit:laeufer"]'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + 24, y: r.y + r.height / 2 }; });
    await p.mouse.move(bx.x, bx.y); await p.mouse.down(); await p.waitForTimeout(120); await p.mouse.up(); await p.waitForTimeout(40);
    if (await p.evaluate(() => __kf.G.S.queue.length === 1)) queued++;
  }
  check(queued === 10, `${tag} „Läufer“ mit 120 ms Haltedauer: ${queued} von 10`);

  // 100 Klicks an zufälligen Punkten (Seed) in freien Bauplätzen, laufendes Spiel, wechselnde Kamera, Zitterbewegung unter der Schwelle
  await p.evaluate(() => { const G = __kf.G; G.S.slots = G.S.slots.map(() => null); __kf.clearSelection(); });
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let hits = 0;
  for (let k = 0; k < 100; k++){
    const target = Math.floor(rnd() * 9);
    const pt = await p.evaluate(([i, a, bb, c]) => {
      __kf.clearSelection(); const r = __kf.plotRects[i];
      __kf.Cam.goTo(Math.min(__kf.Cam.max(), r.x) * c);        // Bauplatz bleibt sichtbar
      const wx = r.x + 2 + a * (r.w - 4), wy = r.y + 2 + bb * (r.h - 4);
      return __kf.worldToScreen(wx, wy);
    }, [target, rnd(), rnd(), rnd()]);
    await p.waitForTimeout(20);
    const jitter = Math.floor(rnd() * 5);                           // 0–4 px, unter der Ziehschwelle
    await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.mouse.move(pt.x + jitter, pt.y); await p.mouse.up();
    await p.waitForTimeout(20);
    const sel = await p.evaluate(() => __kf.ctxSel);
    if (sel.kind === 'plot' && sel.i === target) hits++;
  }
  check(hits === 100, `${tag} 100 Klicks in freie Bauplätze: ${hits} Treffer`);

  // Klickfeld: 50 Klicks in 5 s ergeben +50 (Klickdeckel angehoben); Latenz bis zur sichtbaren Änderung
  // kleiner Bestand, damit jeder Klick die Anzeige sichtbar ändert (die Leiste schreibt nur geänderte Werte)
  await p.evaluate(() => { __kf.C.MAX_CLICKS_PER_SECOND = 100; __kf.Cam.goTo(0); __kf.G.S.material = 100;
    window.__lat = []; let t0 = null;
    document.querySelector('#clickBtn').addEventListener('pointerdown', () => { t0 = performance.now(); }, true);
    new MutationObserver(() => { if (t0 !== null){ window.__lat.push(performance.now() - t0); t0 = null; } })
      .observe(document.querySelector('#material'), { subtree: true, childList: true, characterData: true }); });
  const c0 = await p.evaluate(() => __kf.G.S.clicks);
  await p.evaluate(() => document.querySelector('#clickBtn').scrollIntoView({ block: 'center' }));
  const cb = await p.locator('#clickBtn').boundingBox();
  for (let k = 0; k < 50; k++){ await p.mouse.move(cb.x + 20, cb.y + 20); await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up(); await p.waitForTimeout(58); }
  const c1 = await p.evaluate(() => __kf.G.S.clicks);
  check(c1 - c0 === 50, `${tag} 50 Klicks auf das Klickfeld in 5 s: +${c1 - c0}`);
  const lat = await p.evaluate(() => window.__lat);
  check(lat.length >= 45 && quantile(lat, 0.5) <= 20 && quantile(lat, 0.95) <= 50,
    `${tag} Latenz Klickfeld bis DOM-Änderung: Median ${quantile(lat, 0.5)?.toFixed(1)} ms, p95 ${quantile(lat, 0.95)?.toFixed(1)} ms (${lat.length} Messungen; Soll ≤ 20 / ≤ 50)`);
  // Klick in die Welt bis zum nächsten gezeichneten Bild mit Auswahlrahmen
  const wl = [];
  for (let k = 0; k < 20; k++){
    const pt = await p.evaluate(i => { __kf.clearSelection(); const r = __kf.plotRects[i]; return __kf.worldToScreen(r.x + r.w / 2, r.y + r.h / 2); }, k % 9);
    await p.mouse.move(pt.x, pt.y);
    await p.evaluate(() => { window.__t0 = null; document.querySelector('#lane').addEventListener('pointerdown', () => { window.__t0 = performance.now(); window.__done = new Promise(r => requestAnimationFrame(() => r(performance.now() - window.__t0))); }, { once: true, capture: true }); });
    await p.mouse.down(); await p.mouse.up();
    wl.push(await p.evaluate(() => window.__done));
  }
  check(quantile(wl, 0.5) <= 20 && quantile(wl, 0.95) <= 50, `${tag} Latenz Welt-Klick bis nächstes Bild: Median ${quantile(wl, 0.5).toFixed(1)} ms, p95 ${quantile(wl, 0.95).toFixed(1)} ms`);
  check(errors.length === 0, `${tag} keine Fehler${show(errors)}`);
  await ctx.close();
}

// Spielstand älterer Version: wird verworfen und auf dem Startbildschirm gemeldet (Iteration 5, Abschnitt 1)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.save.v6', JSON.stringify({ v: 6, diff: 'normal' })); });
  await p.reload(); await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ text: document.querySelector('#mText').textContent, open: !document.querySelector('#modal').hidden,
    note: __kf.t('start.oldSave'), left: localStorage.getItem('klammerfront.save.v6') }));
  check(r.open && r.text.includes(r.note) && r.left === null, 'Alter Spielstand: Hinweis auf dem Startbildschirm, danach entfernt');
  await p.reload(); await p.waitForTimeout(300);
  check(!(await p.evaluate(() => document.querySelector('#mText').textContent.includes(__kf.t('start.oldSave')))), 'Alter Spielstand: Hinweis nur einmal');
  await ctx.close();
}

// REQ-6.04: Kartenwahl öffnet den Reiter Karten automatisch; Eingabesperre; Rückkehr zum vorigen Reiter samt Auswahl; mehrere Wahlen
// nacheinander; bei gedrückter Maustaste erst nach dem Loslassen, ohne verlorenen Klick. REQ-6.05: Kaserne im Reiter Armee
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  const levelUp = n => p.evaluate(n => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + n); G.S.xp = G.S.xpTotal;
    G.S.units.push({ id: 99990 + n, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); }, n);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; __kf.selectSection(1); });
  await levelUp(2);
  await p.waitForFunction(() => __kf.tab === 'cards', null, { timeout: 3000 }).catch(() => {});
  const st = await p.evaluate(() => ({ pending: !!__kf.G.S.pendingDraft, tab: __kf.tab, locked: document.querySelector('#draftOffer').classList.contains('locked'),
    n: document.querySelectorAll('#draftOffer .card-pick').length, levels: __kf.G.S.pendingLevels, modal: !document.querySelector('#modal').hidden }));
  check(st.pending && st.tab === 'cards' && st.locked && st.n >= 2 && !st.modal, `Kartenwahl: Reiter Karten öffnet sich selbst, Knöpfe gesperrt und blenden ein ${JSON.stringify(st)}`);
  await p.click('#draftOffer .card-pick'); await p.waitForTimeout(40);
  check(await p.evaluate(() => !!__kf.G.S.pendingDraft && __kf.G.S.pendingLevels === 2), 'Kartenwahl: Klick innerhalb der Sperrzeit wählt keine Karte');
  const t0 = await p.evaluate(() => __kf.G.S.t);
  await p.waitForTimeout(450);
  check(await p.evaluate(t => __kf.G.S.t === t, t0), 'Kartenwahl: das Spiel steht bis zur Wahl (wie in v0.6)');
  await p.click('#draftOffer .card-pick'); await p.waitForTimeout(120);
  const second = await p.evaluate(() => ({ pending: !!__kf.G.S.pendingDraft, tab: __kf.tab, locked: document.querySelector('#draftOffer').classList.contains('locked') }));
  check(second.pending && second.tab === 'cards' && second.locked, `Kartenwahl: zweite Wahl folgt direkt, wieder mit Sperre ${JSON.stringify(second)}`);
  await p.waitForTimeout(450);
  await p.click('#draftOffer .card-pick'); await p.waitForTimeout(120);
  const back = await p.evaluate(() => ({ pending: !!__kf.G.S.pendingDraft, tab: __kf.tab, sel: __kf.sel, chosen: Object.values(__kf.G.S.draft.stacks).reduce((a, n) => a + n, 0) }));   // Summe der Stufen: dieselbe Karte kann zweimal gewählt werden (Zufall)
  check(!back.pending && back.tab === 'wall' && back.sel && back.sel.kind === 'section' && back.sel.lane === 1 && back.chosen === 2,
    `Kartenwahl: nach der letzten Wahl zurück im vorigen Reiter mit voriger Auswahl ${JSON.stringify(back)}`);
  // Gehaltener Klick auf das Klickfeld, währenddessen entsteht eine Kartenwahl: Reiter wechselt erst nach dem Loslassen, der Klick zählt
  await p.evaluate(() => { __kf.selectTab('army'); __kf.G.S.material = 0; });
  const cb = await p.evaluate(() => { const r = document.querySelector('#clickBtn').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const clicks0 = await p.evaluate(() => __kf.G.S.clicks);
  await p.mouse.move(cb.x, cb.y); await p.mouse.down();
  await levelUp(1); await p.waitForTimeout(150);
  const held = await p.evaluate(() => __kf.tab);
  await p.mouse.up(); await p.waitForTimeout(150);
  const after = await p.evaluate(() => ({ tab: __kf.tab, clicks: __kf.G.S.clicks }));
  check(held === 'army' && after.tab === 'cards' && after.clicks === clicks0 + 1, `Kartenwahl bei gehaltenem Klick: Reiter erst nach dem Loslassen (${held} → ${after.tab}), Klick gezählt (${after.clicks - clicks0})`);
  await p.waitForTimeout(450); await p.click('#draftOffer .card-pick'); await p.waitForTimeout(120);
  // Kaserne im Reiter Armee: ohne Kaserne Status und Knopf „Kaserne bauen“ → Reiter Bauen, Kaserne vorausgewählt
  await p.evaluate(() => { __kf.G.S.material = 1e5; __kf.selectTab('army'); }); await p.waitForTimeout(100);
  const k0 = await p.evaluate(() => ({ status: document.querySelector('#kaserneStatus').textContent, btn: !document.querySelector('[data-tooltip="kaserneBuild"]').hidden }));
  await p.click('[data-tooltip="kaserneBuild"]'); await p.waitForTimeout(150);
  const k1 = await p.evaluate(() => ({ tab: __kf.tab, sel: __kf.sel, pre: document.activeElement?.dataset.tooltip || '', cls: document.activeElement?.classList.contains('preselected'),
    stacks: Object.keys(__kf.G.S.draft.stacks).join(), slots: __kf.G.S.slots.map(x => x && x.type).join() }));
  check(k0.btn && /Kaserne/.test(k0.status) && k1.tab === 'build' && k1.sel?.kind === 'plot' && /^pick:kaserne/.test(k1.pre) && k1.cls,
    `Kaserne bauen aus dem Reiter Armee: ${JSON.stringify(k1)}`);
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  await p.evaluate(() => __kf.selectTab('army')); await p.waitForTimeout(100);
  const k2 = await p.evaluate(() => ({ built: __kf.G.has('kaserne'), btn: !document.querySelector('[data-tooltip="kaserneBuild"]').hidden, status: document.querySelector('#kaserneStatus').textContent,
    upg: !document.querySelector('[data-tooltip="upg:ausbau"]').hidden, audit: __kf.tooltipAudit().length + __kf.explAudit().length }));
  check(k2.built && !k2.btn && /Stufe 1/.test(k2.status) && k2.upg && k2.audit === 0, `Kaserne im Reiter Armee: Stufe und Ausbau sichtbar, Audits grün ${JSON.stringify(k2)}`);
  // Welle vorziehen (REQ-6.07 c) im Reiter Armee; Zinsen des Handelskontors in der Leiste (REQ-6.07 b)
  // Karte „Dauerauftrag“ (Stat standingOrder) füllte die Warteschlange nach dem Ausrücken sofort wieder; sie ist hier zufällig gewählt worden und wird ausgeschlossen
  await p.evaluate(() => { const G = __kf.G; for (const [id, o] of Object.entries(G.OPT)) if (o.tiers.some(t => (t.effect || []).some(e => e.stat === 'standingOrder'))) delete G.S.draft.stacks[id]; G.S.draft.ver++; G.S.material = 1e5; G.S.nextOwnWave = G.S.t + 60; G.spawn('laeufer'); G.spawn('laeufer'); G.buildAt(8, 'kontor'); });
  await p.waitForTimeout(150);
  const w0 = await p.evaluate(() => ({ vis: !document.querySelector('[data-tooltip="waveRush"]').hidden, dis: document.querySelector('[data-tooltip="waveRush"]').getAttribute('aria-disabled'),
    q: __kf.G.S.queue.length, rate: document.querySelector('#rate').textContent }));
  await p.click('[data-tooltip="waveRush"]'); await p.waitForTimeout(150);
  const w1 = await p.evaluate(() => ({ q: __kf.G.S.queue.length, cd: __kf.G.S.waveRushCd > 0, dis: document.querySelector('[data-tooltip="waveRush"]').getAttribute('aria-disabled') }));
  check(w0.vis && w0.dis !== 'true' && w0.q === 2 && w1.q === 0 && w1.cd && w1.dis === 'true', `Welle vorziehen: Warteschlange rückt aus, danach Abklingzeit ${JSON.stringify({ w0, w1 })}`);
  check(/Zinsen \+\d+\/\d+ in \d+ s/.test(w0.rate), `Leiste zeigt Zinsen und Deckel („${w0.rate}“)`);
  check(errors.length === 0, `Kartenwahl und Kaserne: keine Fehler${show(errors)}`);
  await ctx.close();
}

// REQ-5.04: Bauen in genau zwei Klicks aus der Welt und aus dem Knopfraster; Bau vollständig per Tastatur
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; const G = __kf.G; G.S.nextWave = 1e9; G.S.material = 1e5; __kf.selectTab('army'); });
  await p.waitForTimeout(60);
  let clicks = 0;
  const click = async (x, y) => { clicks++; await p.mouse.click(x, y, { delay: 90 }); await p.waitForTimeout(60); };
  const centre = async sel => p.evaluate(q => { const e = document.querySelector(q); e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  // aus der Welt: Bauplatz 5, dann erste Option
  let pt = await p.evaluate(() => { const r = __kf.plotRects[4]; return __kf.worldToScreen(r.x + r.w / 2, r.y + r.h / 2); });
  await click(pt.x, pt.y);
  const opt1 = await centre('#ctxBuild .pick'); await click(opt1.x, opt1.y);
  const r1 = await p.evaluate(() => ({ built: __kf.G.S.slots[4], sel: __kf.sel, head: !document.querySelector('#ctxHead').hidden, dem: document.querySelectorAll('#ctxDemolish button').length }));
  check(clicks === 2 && !!r1.built && r1.sel?.i === 4 && r1.head && r1.dem > 0, `Bauen aus der Welt: ${clicks} Klicks, Platz bleibt ausgewählt und zeigt Abriss ${JSON.stringify(r1.built)}`);
  // aus dem Knopfraster: Platz 6, dann Option „Kaserne“ (Reiter vorher auf Armee)
  clicks = 0;
  await p.evaluate(() => __kf.selectTab('army')); await p.waitForTimeout(60);
  await p.click('#tab-build'); await p.waitForTimeout(60);
  pt = await centre('#plotGrid [data-tooltip="grid:5"]'); await click(pt.x, pt.y);
  const opt2 = await centre('#ctxBuild [data-tooltip^="pick:kaserne"]'); await click(opt2.x, opt2.y);
  await p.waitForTimeout(200);            // Ausbau-Option erscheint mit dem nächsten Logik-Tick (Freischaltung nach Bestand)
  await p.evaluate(() => __kf.selectTab('army')); await p.waitForTimeout(80);
  const r2 = await p.evaluate(() => ({ built: __kf.G.S.slots[5], ausbau: !document.querySelector('#optsKaserne').hidden && !document.querySelector('[data-tooltip="upg:ausbau"]').hidden }));
  check(clicks === 2 && r2.built?.type === 'kaserne' && r2.ausbau, `Bauen aus dem Knopfraster: ${clicks} Klicks, Kaserne gebaut, Ausbau im Reiter Armee`);
  // Nicht bezahlbare Option bleibt sichtbar, gesperrt, nennt die fehlende Menge
  await p.evaluate(() => { __kf.G.S.material = 3; __kf.selectPlot(6); }); await p.waitForTimeout(80);
  const poor = await p.evaluate(() => [...document.querySelectorAll('#ctxBuild .pick')].map(b => ({ dis: b.getAttribute('aria-disabled'), w: b.querySelector('.w').textContent })));
  check(poor.length >= 3 && poor.filter(o => o.dis === 'true' && /\d/.test(o.w)).length >= 2, `Nicht bezahlbare Optionen: sichtbar, gesperrt, mit fehlender Menge ${JSON.stringify(poor[1])}`);
  // Tastatur: Fokus ins Raster, Pfeiltasten zu Platz 8, Enter wählt, Enter baut
  await p.evaluate(() => { __kf.G.S.material = 1e5; __kf.clearSelection(); document.querySelector('#plotGrid [data-tooltip="grid:0"]').tabIndex = 0; document.querySelector('#plotGrid [data-tooltip="grid:0"]').focus(); });
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowRight');
  const focused = await p.evaluate(() => document.activeElement.dataset.tooltip);
  await p.keyboard.press('Enter'); await p.waitForTimeout(120);
  const onPick = await p.evaluate(() => document.activeElement.dataset.tooltip || '');
  await p.keyboard.press('Enter'); await p.waitForTimeout(80);
  const r3 = await p.evaluate(() => __kf.G.S.slots[7]);
  check(focused === 'grid:7' && onPick.startsWith('pick:') && !!r3, `Bau per Tastatur: Fokus ${focused}, dann ${onPick}, gebaut ${r3 && r3.type}`);
  check(errors.length === 0, `Bauen: keine Fehler${show(errors)}`);
  await ctx.close();
}

// REQ-5.11: Sitzungsprotokoll (?debug=1) einer Bot-Partie im Browser wird von compare-human.mjs dem eigenen Profil zugeordnet
// REQ-5.09: Durchlauftest je Schwierigkeitsgrad bis Sieg oder Niederlage, Konsole ohne Fehler und Warnungen
{
  const { execFileSync } = await import('node:child_process');
  const { PROFILES } = await import('../tools/sim-bot.mjs');
  const protoDir = new URL('../reports/protokolle/', import.meta.url);
  mkdirSync(protoDir, { recursive: true });
  const botSrc = new URL('../tools/browser-bot.js', import.meta.url).pathname;
  const playBot = async (diff, profile, maxS) => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
    const p = await ctx.newPage();
    const issues = [];
    p.on('pageerror', e => issues.push('Fehler: ' + e.message));
    p.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ERR_CERT|fonts\.g/.test(m.text())) issues.push(m.type() + ': ' + m.text()); });
    await p.goto(url.replace('dev=1', 'debug=1'));
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
    await p.reload(); await p.waitForTimeout(300);
    await p.evaluate(d => __kf.startGame(d), diff); await p.waitForTimeout(100);
    await p.addScriptTag({ path: botSrc });
    await p.evaluate(prof => { window.__bot = KF_BROWSER_BOT(__kf.G, prof); __kf.sessionReset(); document.querySelector('#hintBox').hidden = true; }, PROFILES[profile]);
    // in Schritten zu 20 s Spielzeit, dazwischen zeichnet und aktualisiert die Seite (Konsole prüft auch Oberfläche und Zeichnen)
    for (let k = 0; k < maxS / 20; k++){
      const st = await p.evaluate(() => { for (let i = 0; i < 400 && __kf.G.S.status === 'running'; i++) window.__bot.step(0.05); return __kf.G.S.status; });
      await p.waitForTimeout(25);
      if (st !== 'running') break;
    }
    const proto = await p.evaluate(() => __kf.session());
    const sessionBtn = await p.evaluate(() => !document.querySelector('#sessionBtn').hidden && __kf.explAudit().length === 0 && __kf.tooltipAudit().length === 0);
    await ctx.close();
    return { proto, issues, sessionBtn };
  };
  for (const profile of ['aktiv', 'durchschnitt', 'gelegentlich', 'passiv']){
    const { proto, issues, sessionBtn } = await playBot('normal', profile, 300);
    const file = new URL(`bot-${profile}.json`, protoDir).pathname;
    writeFileSync(file, JSON.stringify(proto, null, 2));
    const res = execFileSync('node', [new URL('../tools/compare-human.mjs', import.meta.url).pathname, file], { encoding: 'utf8' });
    const got = (res.match(/nächstes Bot-Profil: (\w+)/) || [])[1], strat = (res.match(/nächste Strategie: (\S+)/) || [])[1];
    // Die Bot-Partie im Browser spielt „Einheiten zuerst“ (REQ-6.09): Profil und Strategie müssen erkannt werden; passiv kauft kaum und bleibt offen
    // Die Strategie-Zuordnung (REQ-6.09) wird ausgegeben, aber nicht geprüft: das Merkmal trennt die Strategien nur schwach (STAND, Auslegung 5)
    check(got === profile && sessionBtn && !!strat,
      `Protokoll einer Bot-Partie (${profile}, ${Math.round(proto.durationS)} s, ${proto.clicks} Klicks, ${proto.actions.length} Handlungen) → compare-human: ${got}, Strategie ${strat} (gespielt: einheiten-zuerst)`);
    check(issues.length === 0, `Protokoll-Partie ${profile}: Konsole ohne Fehler und Warnungen${show(issues)}`);
  }
  for (const diff of ['leicht', 'normal', 'schwer']){
    const { proto, issues } = await playBot(diff, 'aktiv', 30 * 60);
    check(proto.result === 'won' || proto.result === 'lost', `Durchlauftest ${diff}: Partie endet (${proto.result} nach ${Math.floor(proto.durationS / 60)}:${String(Math.round(proto.durationS % 60)).padStart(2, '0')})`);
    check(issues.length === 0, `Durchlauftest ${diff}: Konsole ohne Fehler und Warnungen${show(issues)}`);
  }
}

// REQ-6.01: Über 10 Sekunden Kampf zeigt keine gezeichnete Einheit ein Hin-und-her-Muster (Positionsprüfung je Bild);
// dazu das Debug-Protokoll je Einheit (?debug=1)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url.replace('dev=1', 'debug=1'));
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(() => __kf.startGame('normal')); await p.waitForTimeout(100);
  await p.evaluate(() => {
    const G = __kf.G, W = G.S;
    document.querySelector('#hintBox').hidden = true;
    W.nextWave = 1e9; W.nextOwnWave = 1e9; W.enemyQueue = []; W.units = []; W.forms = []; W.enemyBaseHp = 1e12; W.sections.forEach(s => { s.hp = 1e12; });
    // eigene Armee über alle Lanes, Gegner nur in der Mitte: oben und unten helfen, Querbewegung und Einreihen
    const types = Array.from({ length: 15 }, (_, i) => ({ type: i % 3 === 2 ? 'werfer' : 'laeufer', lane: i % 3 }));
    const a = G.addGroup('p', types, 700);
    const e = G.addGroup('e', Array.from({ length: 8 }, (_, i) => ({ type: i % 4 === 3 ? 'werfer' : 'laeufer', lane: 1 })), 760);
    for (const u of W.units){ u.hp = u.maxHp = 1e7; }
    __kf.Cam.follow = false; __kf.Cam.goTo(wx(730) - 500);
  });
  const frames = await p.evaluate(() => new Promise(res => {
    const out = [], t0 = performance.now();
    const f = () => { out.push({ t: performance.now() - t0, pos: __kf.drawnPositions() }); if (performance.now() - t0 < 10000) requestAnimationFrame(f); else res(out); };
    requestAnimationFrame(f);
  }));
  const tracks = new Map();
  let worst = { n: 0 };
  for (const fr of frames) for (const q of fr.pos){
    let r = tracks.get(q.id);
    if (!r){ tracks.set(q.id, { x: q.x, y: q.y, sx: 0, sy: 0, times: [] }); continue; }
    for (const [axis, d] of [['sx', q.x - r.x], ['sy', q.y - r.y]]){
      if (Math.abs(d) < 0.05) continue;
      const sgn = Math.sign(d);
      if (r[axis] && sgn !== r[axis]){ r.times.push(fr.t); while (fr.t - r.times[0] > 1000) r.times.shift(); if (r.times.length > worst.n) worst = { n: r.times.length, id: q.id, t: Math.round(fr.t) }; }
      r[axis] = sgn;
    }
    r.x = q.x; r.y = q.y;
  }
  const inFight = await p.evaluate(() => __kf.G.S.forms.filter(f => f.side === 'p').map(f => f.state).join());
  check(frames.length > 300 && tracks.size >= 20 && worst.n <= 2,
    `Kampfbild 10 s: ${frames.length} Bilder, ${tracks.size} Einheiten, höchstens ${worst.n} Richtungswechsel je Einheit und Sekunde (Soll ≤ 2)${worst.id ? `, Einheit ${worst.id} bei ${worst.t} ms` : ''}; Armee: ${inFight}`);
  const log = await p.evaluate(() => { const l = __kf.unitLog(); return { n: l.length, keys: l.length ? Object.keys(l[0]).join() : '' }; });
  check(log.n > 0 && /state/.test(log.keys) && /lane/.test(log.keys) && /row/.test(log.keys) && /dirX/.test(log.keys), `Debug-Protokoll je Einheit: ${log.n} Einträge (${log.keys})`);
  check(errs.length === 0, `Kampfbild: keine Fehler${show(errs)}`);
  await ctx.close();
}

// REQ-6.03: reines Online-Spiel. Laden nach einer Stunde Systemzeit ändert nichts und startet pausiert; verdeckter Tab pausiert
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(() => __kf.startGame('normal')); await p.waitForTimeout(100);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.build('fabrik'); G.build('fabrik'); G.S.material = 777; });
  await p.waitForTimeout(500);
  // Tab verdecken: Spielzeit steht, danach „Weiter“ in der Spielwelt
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const t0 = await p.evaluate(() => __kf.G.S.t); await p.waitForTimeout(800);
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(200);
  const hid = await p.evaluate(() => ({ t: __kf.G.S.t, paused: __kf.paused, btn: !document.querySelector('#resumeBtn').hidden, label: document.querySelector('#resumeBtn .btn-label').textContent }));
  check(hid.t === t0 && hid.paused && hid.btn && hid.label === 'Weiter', `Tab verdeckt: Spielzeit steht (${t0.toFixed(2)} → ${hid.t.toFixed(2)}), „Weiter“ sichtbar`);
  await p.click('#resumeBtn'); await p.waitForTimeout(300);
  check(await p.evaluate(() => !__kf.paused && document.querySelector('#resumeBtn').hidden && __kf.G.S.t > 0), 'Weiter: Partie läuft wieder');
  // Speichern, Systemzeit eine Stunde vorstellen, laden: Ressourcen unverändert, Partie pausiert
  await p.click('#pauseBtn'); await p.waitForTimeout(100);           // angehalten speichern: das Speichern beim Verlassen der Seite sieht denselben Stand
  const before = await p.evaluate(() => { __kf.save(); return { m: __kf.G.S.material, t: __kf.G.S.t }; });
  await p.addInitScript(() => { const real = Date.now; Date.now = () => real() + 3600 * 1000; });
  await p.reload(); await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ m: __kf.G.S.material, t: __kf.G.S.t, paused: __kf.paused, btn: !document.querySelector('#resumeBtn').hidden }));
  check(Math.abs(after.m - before.m) < 1e-6 && Math.abs(after.t - before.t) < 1e-6 && after.paused && after.btn,
    `Laden eine Stunde später: Material ${before.m.toFixed(1)} → ${after.m.toFixed(1)}, Zeit unverändert, pausiert mit „Weiter“`);
  check(errs.length === 0, `Online-Prüfung: keine Fehler${show(errs)}`);
  await ctx.close();
}

// REQ-6.07 a: Nachbarschaftsvorschau beim Bauen und im Raster
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(() => __kf.startGame('normal')); await p.waitForTimeout(100);
  await p.evaluate(() => { const G = __kf.G; document.querySelector('#hintBox').hidden = true; G.S.material = 1e5; G.buildAt(4, 'fabrik'); __kf.selectPlot(1); });
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => ({ pick: document.querySelector('#ctxBuild [data-tooltip="pick:fabrik:1"] .nb')?.textContent || '',
    uni: document.querySelector('#ctxBuild [data-tooltip="pick:universitaet:1"] .nb')?.textContent || '' }));
  check(/Fabrik neben Fabrik/.test(r.pick) && /Platz 5/.test(r.pick) && /Universität neben Fabrik/.test(r.uni),
    `Nachbarschaftsvorschau: Fabrik auf Platz 2 neben Fabrik auf Platz 5 („${r.pick}“), Universität („${r.uni}“)`);
  await p.evaluate(() => { __kf.G.buildAt(1, 'fabrik'); __kf.selectTab('build'); }); await p.waitForTimeout(150);
  const cell = await p.evaluate(() => document.querySelector('#plotGrid [data-tooltip="grid:4"] .expl').textContent);
  check(/Nachbarschaft/.test(cell), `Raster zeigt den Nachbarschaftsbonus („${cell}“)`);
  check(errs.length === 0, `Nachbarschaft: keine Fehler${show(errs)}`);
  await ctx.close();
}

// REQ-47: Gestaffelte Einführung (frischer Browser, Einführung an)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { __kf.selectPlot(4); __kf.G.S.material = 1e5; });
  await p.waitForTimeout(150);
  const intro = await p.evaluate(() => { return {
    wave: document.querySelector('#hudWaves').hidden, cards: document.querySelector('#tab-cards').hidden,
    picks: [...document.querySelectorAll('#ctxBuild .pick')].map(b => b.dataset.tooltip.split(':')[1]) }; });
  check(intro.wave && intro.cards && intro.picks.join() === 'fabrik', `Einführung: zu Beginn weder Wellenleiste noch Karten, nur Fabrik baubar ${JSON.stringify(intro.picks)}`);
  await p.evaluate(() => { __kf.G.S.level = 2; __kf.selectPlot(4); });
  await p.waitForTimeout(150);
  const later = await p.evaluate(() => ({ cards: document.querySelector('#tab-cards').hidden, picks: document.querySelectorAll('#ctxBuild .pick').length }));
  check(!later.cards && later.picks >= 4, `Einführung: ab Stufe 2 Karten und Verstärkungsgebäude sichtbar`);
  await ctx.close();
}

// REQ-T.01 – T.05, T2.01 – T2.07: Tutorial „Erste Schritte“, Startbildschirm und Erstkontakt-Hinweise (frischer Browser je Prüfung)
// Die URL-Parameter ?lang= und ?difficulty= überspringen den Startbildschirm (REQ-T2.01); ohne sie beginnt keine Partie ohne Dialog.
async function freshTutorialPage(lang = 'de', query = '&difficulty=easy', locale = 'en-US'){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, locale });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); if (m.type() === 'warning' && m.text().includes('[i18n]')) errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  // Der Spielstand wird beim Verlassen der Seite geschrieben; „kfDropSave“ löscht ihn erst nach dem Neuladen (zweiter Start im selben Browser)
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('kfInit')){ localStorage.clear(); sessionStorage.setItem('kfInit', '1'); }
    if (sessionStorage.getItem('kfDropSave')){ localStorage.removeItem('klammerfront.save.v8'); sessionStorage.removeItem('kfDropSave'); } });
  // query: null = nur ?dev=1 (Startbildschirm); „!…“ = Parameter unverändert; sonst wird ?lang= ergänzt
  const q = query === null ? '' : query.startsWith('!') ? query.slice(1) : (query.includes('lang=') ? '' : `&lang=${lang}`) + query;
  await p.goto(urlTutorial + q); await p.waitForTimeout(300);
  return { ctx, p, errs };
}
const tutState = p => p.evaluate(() => { const v = __kf.Tutorial.view(); return { phase: v.phase, step: v.step && v.step.id, index: v.index, active: __kf.Tutorial.active(),
  narr: document.querySelector('#tutBubble').hidden ? null : document.querySelector('#tutBubbleNarr').textContent,
  task: document.querySelector('#tutBubble').hidden || document.querySelector('#tutBubbleTask').hidden ? null : document.querySelector('#tutBubbleTask').textContent,
  marked: [...document.querySelectorAll('.tut-target')].map(e => e.id || e.dataset.tooltip || e.className.slice(0, 24)),
  t: __kf.G.S.t, hold: __kf.G.S.hold, diff: __kf.G.S.diff, modal: !document.querySelector('#modal').hidden, hint: !document.querySelector('#hintBox').hidden,
  status: __kf.G.S.status, lang: __kf.lang }; });
const tx = (p, key, params) => p.evaluate(([k, pr]) => __kf.t(k, pr), [key, params || null]);
const waitStep = (p, id) => p.waitForFunction(i => { const v = __kf.Tutorial.view(); return v.phase === 'step' && v.step.id === i; }, id, { timeout: 30000 });
const waitText = p => p.waitForFunction(() => __kf.Tutorial.view().phase === 'step' && !document.querySelector('#tutBubble').hidden, null, { timeout: 20000 });
const endGreeting = async p => { await p.evaluate(() => { __kf.Tutorial.endGreeting(); __kf.requestRender(); }); await p.waitForTimeout(150); };

// Startbildschirm (REQ-T2.01): vor jeder Partie, Voreinstellungen der ersten Partie, letzte Wahl danach
{
  const { ctx, p, errs } = await freshTutorialPage('de', null, 'de-DE');
  const a = await p.evaluate(() => ({ modal: !document.querySelector('#modal').hidden, status: __kf.G.S.status, lang: __kf.lang,
    diffs: [...document.querySelectorAll('.diff')].map(x => x.getAttribute('aria-pressed') + '|' + (x.querySelector('.rec-tag') ? x.querySelector('.rec-tag').textContent : '')),
    tut: document.querySelector('[data-tooltip="tutorialSwitch"]').getAttribute('aria-pressed'), start: document.querySelector('.card .btn-primary .btn-label').textContent,
    visible: (() => { const r = document.querySelector('[data-tooltip="tutorialSwitch"]').getBoundingClientRect(); return r.bottom <= innerHeight; })() }));
  check(a.modal && a.status === 'setup', 'Startbildschirm: ohne URL-Parameter beginnt keine Partie ohne Dialog');
  check(a.lang === 'de' && a.diffs.join() === `true|empfohlen für den Einstieg,false|,false|` && a.tut === 'true' && a.start === 'Partie beginnen', `Startbildschirm, leerer Speicher: Browsersprache, Leicht „empfohlen“ und Tutorial vorausgewählt ${JSON.stringify(a)}`);
  check(a.visible, 'Startbildschirm: der Tutorial-Schalter liegt bei 1280×800 im sichtbaren Bereich');
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0 && (await p.evaluate(() => __kf.explAudit())).length === 0, 'Startbildschirm: Tooltips und Erklärzeilen vollständig');
  // Wahl Englisch und Schwer
  await p.click('[data-tooltip="lang:en"]'); await p.click('[data-tooltip="diff:schwer"]'); await p.waitForTimeout(150);
  const rec = await p.evaluate(() => document.querySelector('.rec-tag') ? document.querySelector('.rec-tag').textContent : null);
  check(rec === 'recommended for beginners', `Startbildschirm: Sprachwechsel wirkt sofort, Zusatz bleibt bei Leicht (${rec})`);
  await p.click('.card .btn-primary'); await p.waitForTimeout(600);
  const g = await tutState(p);
  check(g.status === 'running' && g.diff === 'schwer' && g.lang === 'en' && g.phase === 'greet' && g.narr === await tx(p, 'tut.greet1'), `Englisch und Schwer: Partie läuft, Tutorial erscheint auf Englisch ${JSON.stringify(g)}`);
  check(g.narr === 'Welcome, governor. I am your quartermaster.' && g.hold && g.hold.size === 2, 'Tutorial auf Schwer: Schonfrist mit kleiner erster Welle gilt unabhängig vom Grad');
  // Sprachwechsel während des Tutorials: die Sprechblase wechselt ohne Neuladen
  await p.click('#langBtn'); await p.waitForTimeout(250);
  const de = await tutState(p);
  check(de.lang === 'de' && de.narr === 'Willkommen, Statthalter. Ich bin dein Quartiermeister.', `Sprachwechsel im Tutorial: Sprechblase sofort in der neuen Sprache (${de.narr})`);
  await p.click('#langBtn'); await p.waitForTimeout(100);
  // Überspringen: nach dem Tutorial gelten die Schwer-Werte
  await p.click('#tutSkipBtn'); await p.waitForTimeout(250);
  const sk = await p.evaluate(() => ({ diff: __kf.G.S.diff, hp: __kf.G.S.enemyBaseHp, want: __kf.C.DIFFICULTY.schwer.enemyBaseHp, waveBase: __kf.G.diffCfg().waveBase, hold: __kf.G.S.hold, bounty: __kf.G.S.firstBounty, active: __kf.Tutorial.active() }));
  check(!sk.active && !sk.hold && !sk.bounty && sk.diff === 'schwer' && sk.hp === sk.want && sk.waveBase === 3.5, `Nach dem Tutorial gelten die Schwer-Werte, Schonfrist und Kriegsbeute sind weg ${JSON.stringify(sk)}`);
  // zweite Partie: letzte Wahl vorausgewählt, Tutorial aus, keine Empfehlung
  await p.click('#newBtn'); await p.waitForTimeout(250);
  const b2 = await p.evaluate(() => ({ lang: __kf.lang, diffs: [...document.querySelectorAll('.diff')].map(x => x.getAttribute('aria-pressed')).join(), tut: document.querySelector('[data-tooltip="tutorialSwitch"]').getAttribute('aria-pressed'), rec: !!document.querySelector('.rec-tag') }));
  check(b2.lang === 'en' && b2.diffs === 'false,false,true' && b2.tut === 'false' && !b2.rec, `Zweite Partie: letzte Sprache und Stufe vorausgewählt, Tutorial aus ${JSON.stringify(b2)}`);
  await p.click('.card .btn-primary'); await p.waitForTimeout(300);
  const s2 = await tutState(p);
  check(s2.status === 'running' && s2.diff === 'schwer' && !s2.active && !s2.modal, 'Zweite Partie ohne Tutorial startet auf der gewählten Stufe');
  check(errs.length === 0, `Startbildschirm: keine Fehler${show(errs)}`);
  await ctx.close();
}

// URL-Parameter: ?lang= / ?difficulty= überspringen den Startbildschirm, ?tutorial=0|1 schaltet das Tutorial
{
  const a = await freshTutorialPage('de', '&lang=en&difficulty=hard&tutorial=0');
  const sa = await tutState(a.p);
  check(sa.status === 'running' && sa.diff === 'schwer' && sa.lang === 'en' && !sa.active && !sa.modal, `?lang=en&difficulty=hard&tutorial=0: Partie ohne Dialog und ohne Tutorial ${JSON.stringify(sa)}`);
  await a.ctx.close();
  const c = await freshTutorialPage('de', '&lang=de');
  check((await tutState(c.p)).status === 'running', '?lang=de allein überspringt den Startbildschirm');
  await c.ctx.close();
  const d = await freshTutorialPage('de', '&difficulty=normal&tutorial=0');
  await d.p.goto(urlTutorial + '&difficulty=easy&tutorial=1'); await d.p.waitForTimeout(300);
  const sd = await tutState(d.p);
  check(sd.active && sd.diff === 'leicht' && sd.phase === 'greet', '?tutorial=1 erzwingt das Tutorial auch ohne erste Partie');
  await d.ctx.close();
  const e = await freshTutorialPage('de', '!&tutorial=0', 'de-DE');
  const se = await e.p.evaluate(() => ({ modal: !document.querySelector('#modal').hidden, tut: document.querySelector('[data-tooltip="tutorialSwitch"]').getAttribute('aria-pressed') }));
  check(se.modal && se.tut === 'false', '?tutorial=0 ohne Sprache und Stufe: Dialog mit ausgeschaltetem Tutorial');
  await e.ctx.close();
}

// Regressionstest (REQ-T2.01): eine Partie beginnt nur nach dem Startbildschirm oder mit den URL-Parametern
{
  const { readFileSync: rd } = await import('node:fs');
  const ui = rd(new URL('../ui.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const calls = [...ui.matchAll(/startGame\(/g)].length - 1;                                   // abzüglich der Definition
  check(calls === 2, `Regressionstest: startGame wird nur an zwei Stellen aufgerufen (Dialog, URL-Parameter): ${calls}`);
  check(/else if \(skipStart\)\{ startGame\(/.test(ui) && /onClick|startGame\(pickDiff/.test(ui) && /const skipStart = !!\(LANG_PARAM \|\| DIFF_PARAM\)/.test(ui), 'Regressionstest: Start ohne Dialog nur mit ?lang= oder ?difficulty=');
}

// Durchlauf mit leerem Speicher in beiden Sprachen (REQ-T2.02 – T2.05, Akzeptanz insgesamt)
for (const lang of ['de', 'en']){
  const { ctx, p, errs } = await freshTutorialPage(lang);
  await p.evaluate(() => { __kf.C.TUTORIAL.greetMs = 600; });
  const s0 = await tutState(p);
  check(!s0.modal && s0.active && s0.diff === 'leicht' && s0.hold && s0.hold.maxS === 150 && s0.phase === 'greet', `[${lang}] Tutorial: erste Partie, Begrüßung läuft, Schonfrist ${JSON.stringify(s0.hold)}`);
  check(await p.evaluate(() => !document.querySelector('#tutSkipBtn').hidden), `[${lang}] Tutorial: Knopf „Überspringen“ sichtbar`);
  check(s0.narr === await tx(p, 'tut.greet1') && s0.task === null && s0.marked.length === 0, `[${lang}] Begrüßung 1: Erzählung ohne Auftrag, kein Rahmen`);
  check(await p.evaluate(() => !document.querySelector('#tutBubbleMore').hidden && document.querySelector('#tutBubble').classList.contains('clickable')), `[${lang}] Begrüßung: Symbol „Klick führt weiter“ sichtbar`);
  await p.click('#tutBubble'); await p.waitForTimeout(150);
  check((await tutState(p)).narr === await tx(p, 'tut.greet2'), `[${lang}] Begrüßung 2 nach Klick auf die Sprechblase`);
  await waitText(p);                                           // nach Ablauf der Zeit (verkürzt) beginnt Schritt 1: Vorführung, dann Zeile
  const s1 = await tutState(p);
  check(s1.step === 'fertigen' && s1.marked.join() === 'clickBtn' && s1.narr === await tx(p, 'tut.fertigen.narr') && s1.task === await tx(p, 'tut.fertigen.task'), `[${lang}] Schritt 1: Erzählung und Auftrag am Klickfeld, genau ein Ziel ${JSON.stringify(s1.marked)}`);
  check(await p.evaluate(() => !document.querySelector('#tutBubble').classList.contains('clickable') && document.querySelector('#tutBubbleMore').hidden), `[${lang}] Schritt 1: Blase an einen Auftrag gebunden, kein Klick-Symbol`);
  check(await p.evaluate(() => __kf.G.S.material) === 1 && await p.evaluate(() => __kf.Tutorial.progress('fertigen')) === 0, `[${lang}] Schritt 1: die Figur hat einmal gefertigt, zählt aber nicht für den Spieler`);
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0 && (await p.evaluate(() => __kf.explAudit())).length === 0, `[${lang}] Tutorial: Tooltips und Erklärzeilen vollständig`);
  for (let i = 0; i < 10; i++){ await p.click('#clickBtn'); await p.waitForTimeout(100); }
  await waitStep(p, 'bauen'); await waitText(p);
  const s2 = await tutState(p);
  check(s2.marked.length === 1 && s2.marked[0] === 'grid:0' && s2.narr === await tx(p, 'tut.bauen.narr') && s2.task === await tx(p, 'tut.bauen.task'), `[${lang}] Schritt 2: freier Bauplatz hervorgehoben, Erzählung und Auftrag ${JSON.stringify(s2.marked)}`);
  const pr = await p.evaluate(() => { const r = __kf.plotRects[0]; return __kf.worldToScreen(r.x + r.w / 2, r.y + r.h / 2); });
  await p.mouse.click(pr.x, pr.y); await p.waitForTimeout(250);
  const s2b = await tutState(p);
  check(s2b.marked.length === 1 && s2b.marked[0].startsWith('pick:fabrik'), `[${lang}] Schritt 2: nach der Platzwahl die Fabrik-Option ${JSON.stringify(s2b.marked)}`);
  await p.click('#ctxBuild .pick'); await waitStep(p, 'rekrutieren'); await p.waitForTimeout(200);
  const s3 = await tutState(p);
  check(s3.marked.join() === 'tab-army' && await p.evaluate(() => __kf.tab) === 'build' && s3.narr === await tx(p, 'tut.rekrutieren.narr'), `[${lang}] Schritt 3: erst der Reiterknopf Armee, das Tutorial wechselt den Reiter nicht selbst ${JSON.stringify(s3.marked)}`);
  await p.waitForTimeout(600); check(await p.evaluate(() => __kf.tab) === 'build', `[${lang}] Schritt 3: Reiter bleibt Bauen, bis der Spieler wechselt`);
  await p.click('#tab-army'); await p.waitForTimeout(250);
  const s3b = await tutState(p);
  check(s3b.marked.length === 1 && s3b.marked[0] === 'unit:laeufer' && s3b.task === await tx(p, 'tut.rekrutieren.task'), `[${lang}] Schritt 3: Kaufknopf Läufer, Auftrag nennt die Einheit wie das Spiel ${JSON.stringify(s3b.marked)}`);
  for (let i = 0; i < 80 && !(await p.evaluate(() => __kf.Tutorial.isDone('rekrutieren'))); i++){ await p.keyboard.press('1'); await p.click('#clickBtn'); await p.waitForTimeout(150); }
  await waitStep(p, 'ausruecken'); await p.waitForTimeout(250);
  const s4 = await tutState(p);
  check(s4.marked.join() === 'hudWaves' && s4.narr === await tx(p, 'tut.ausruecken.narr') && s4.task === await tx(p, 'tut.ausruecken.task'), `[${lang}] Schritt 4: Wellen-Countdown in der Leiste ${JSON.stringify(s4.marked)}`);
  check(await p.evaluate(() => __kf.G.S.waveNo) === 0 && await p.evaluate(() => __kf.G.holdActive()), `[${lang}] Schonfrist: vor dem Ausrücken keine Gegnerwelle`);
  await p.waitForFunction(() => __kf.Tutorial.isDone('ausruecken'), null, { timeout: 40000 });
  const s5 = await tutState(p);
  check(s5.phase === 'wait' && s5.narr === null && s5.marked.length === 0 && await p.evaluate(() => !__kf.G.holdActive() && __kf.G.S.waveNo >= 1 && __kf.Cam.follow), `[${lang}] Schritt 4 erledigt: Schonfrist endet, Welle rückt aus, Kamera folgt, im Kampf keine Sprechblase`);
  // erste Gegnerwelle besiegt → Kriegsbeute → Kartenwahl öffnet sich → Sprechblase am Reiter „Karten“
  await p.waitForFunction(() => __kf.Tutorial.view().step && __kf.Tutorial.view().step.id === 'karte' && !document.querySelector('#tutBubble').hidden, null, { timeout: 120000 });
  const s6 = await p.evaluate(() => ({ xp: __kf.G.S.xpTotal, need: __kf.G.xpNeed(1), pending: !!__kf.G.S.pendingDraft, tab: __kf.tab, follow: __kf.Cam.follow, narr: document.querySelector('#tutBubbleNarr').textContent,
    task: document.querySelector('#tutBubbleTask').textContent, marked: [...document.querySelectorAll('.tut-target')].map(e => e.id),
    bubbleBottom: document.querySelector('#tutBubble').getBoundingClientRect().bottom, cardsTop: document.querySelector('#draftOffer').getBoundingClientRect().top }));
  check(s6.xp >= s6.need && s6.pending && s6.tab === 'cards' && !s6.follow, `[${lang}] Erste Welle besiegt: EP ≥ Schwelle, Kartenwahl öffnet sich selbst ${JSON.stringify({ xp: s6.xp, need: s6.need })}`);
  check(s6.narr === await tx(p, 'tut.karte.narr') && s6.task === await tx(p, 'tut.karte.task') && s6.marked.join() === 'tab-cards', `[${lang}] Kartenwahl: Sprechblase mit Erzählung und Auftrag am Reiter „Karten“`);
  check(s6.bubbleBottom <= s6.cardsTop, `[${lang}] Kartenwahl: Sprechblase verdeckt keine Karte (${Math.round(s6.bubbleBottom)} ≤ ${Math.round(s6.cardsTop)})`);
  check(await p.evaluate(() => document.querySelector('#hintBox').hidden), `[${lang}] Kartenwahl: kein Erstkontakt-Hinweis während des Tutorials`);
  await p.waitForTimeout(500); await p.click('#draftOffer .card-pick'); await p.waitForTimeout(400);
  const f1 = await tutState(p);
  check(f1.phase === 'farewell' && f1.narr === await tx(p, 'tut.bye1') && f1.task === null, `[${lang}] Abschied 1 nach der Kartenwahl`);
  check(await p.evaluate(() => __kf.Cam.x === 0), `[${lang}] Abschied: Kamera zeigt das Reich, die Figur steht vor dem Tor`);
  await p.click('#tutBubble'); await p.waitForTimeout(250);
  check((await tutState(p)).narr === await tx(p, 'tut.bye2'), `[${lang}] Abschied 2 nach Klick`);
  await p.click('#tutBubble'); await p.waitForTimeout(250);
  check((await tutState(p)).phase === 'leaving', `[${lang}] danach geht die Figur durch das Tor zurück`);
  await p.waitForFunction(() => !__kf.Tutorial.active(), null, { timeout: 15000 }); await p.waitForTimeout(150);
  check(await p.evaluate(() => document.querySelector('#tutBubble').hidden && document.querySelector('#tutSkipBtn').hidden && document.querySelectorAll('.tut-target').length === 0 && !__kf.G.holdActive() && __kf.G.S.status === 'running'), `[${lang}] Ende: Figur, Zeile, Rahmen und Knopf verschwunden, freies Spiel`);
  const data = await p.evaluate(() => __kf.Tutorial.data());
  check(data.completed && !data.skipped && data.stepTimes.karte <= 180 && data.greetingMs > 0 && data.bubbleClicks >= 3, `[${lang}] Tutorial in unter 3:00 min Spielzeit (${data.stepTimes.karte} s), Protokoll: Begrüßung ${data.greetingMs} ms, ${data.bubbleClicks} Klicks auf Blasen`);
  check(errs.length === 0, `[${lang}] Tutorial: keine Fehler und keine fehlenden Schlüssel${show(errs)}`);
  // Hinweise und „neu“ übernehmen nach dem Tutorial: „neu“ am Reiter Karten ist angesehen, Hinweise erscheinen später
  await ctx.close();
}

// Reihenfolge vertauscht: erst bauen, dann fertigen; die Sprechblase des vorweg erledigten Schritts entfällt
{
  const { ctx, p, errs } = await freshTutorialPage();
  await endGreeting(p);
  await waitText(p);
  await p.evaluate(() => { __kf.selectPlot(0); }); await p.waitForTimeout(200);
  await p.click('#ctxBuild .pick'); await p.waitForTimeout(250);
  const a = await tutState(p);
  check(a.step === 'fertigen' && await p.evaluate(() => __kf.Tutorial.isDone('bauen')), `Reihenfolge vertauscht: Schritt 2 erledigt, Schritt 1 läuft weiter ${a.step}`);
  for (let i = 0; i < 10; i++){ await p.click('#clickBtn'); await p.waitForTimeout(90); }
  await p.waitForTimeout(250);
  const b3 = await tutState(p);
  check(b3.step === 'rekrutieren' && b3.narr === await tx(p, 'tut.rekrutieren.narr'), 'Reihenfolge vertauscht: nach dem Fertigen geht es mit Schritt 3 weiter, Erzählung von Schritt 2 wird nicht nachgeholt');
  check(errs.length === 0, `Reihenfolge vertauscht: keine Fehlermeldung${show(errs)}`);
  await ctx.close();
}

// Begrüßung: Klick auf „Fertigen“ beendet sie, Schritt 1 gilt als begonnen; Zeit lässt sie weiterlaufen
{
  const { ctx, p } = await freshTutorialPage();
  await p.click('#clickBtn'); await p.waitForTimeout(150);
  const a = await tutState(p);
  check(a.phase === 'step' && a.step === 'fertigen' && await p.evaluate(() => __kf.Tutorial.progress('fertigen')) === 1, `Begrüßung: Klick auf Fertigen beendet sie, Schritt 1 gilt als begonnen ${JSON.stringify([a.phase, a.step])}`);
  await ctx.close();
  const c2 = await freshTutorialPage();
  await c2.p.evaluate(() => { __kf.C.TUTORIAL.greetMs = 400; });
  await c2.p.waitForFunction(() => __kf.Tutorial.view().phase === 'step', null, { timeout: 5000 });
  check(true, 'Begrüßung: jede Sprechblase bleibt stehen und geht nach der Anzeigezeit von selbst weiter');
  await c2.ctx.close();
}

// Überspringen in jedem Schritt beendet Tutorial, Schonfrist und Kriegsbeute; erste Gegnerwelle zum normalen Zeitpunkt
for (const stepId of ['begruessung', 'fertigen', 'bauen', 'rekrutieren', 'ausruecken']){
  const { ctx, p, errs } = await freshTutorialPage();
  await p.waitForTimeout(200);
  await p.evaluate(id => { const T = __kf.Tutorial;
    const order = ['begruessung', 'fertigen', 'bauen', 'rekrutieren', 'ausruecken'];
    if (id !== 'begruessung') T.endGreeting();
    for (const prev of order.slice(1, order.indexOf(id))){
      if (prev === 'fertigen') for (let i = 0; i < 10; i++) T.event('materialProduced', { n: 1, source: 'click' }, 1);
      if (prev === 'bauen') T.event('buildingBuilt', { type: 'fabrik', slot: 0 }, 1);
      if (prev === 'rekrutieren') for (let i = 0; i < 3; i++) T.event('unitBought', { type: 'laeufer' }, 1);
    }
    __kf.requestRender(); }, stepId);
  await p.waitForTimeout(250);
  const before = await tutState(p);
  check(stepId === 'begruessung' ? before.phase === 'greet' : before.step === stepId, `Überspringen: Ausgangsschritt ${stepId} ${JSON.stringify([before.phase, before.step])}`);
  await p.click('#tutSkipBtn'); await p.waitForTimeout(200);
  const st = await tutState(p);
  check(!st.active && !st.hold && st.marked.length === 0 && st.narr === null && await p.evaluate(() => !__kf.G.S.firstBounty), `Überspringen in „${stepId}“ beendet Tutorial, Schonfrist und Kriegsbeute`);
  const times = await p.evaluate(() => { const G = __kf.G; G.S.nextWave = 20; G.S.t = Math.min(G.S.t, 10);
    for (let i = 0; i < 25 * 20 && G.S.waveNo === 0; i++){ G.tick(0.05); } return { t: +G.S.t.toFixed(1), waveNo: G.S.waveNo }; });
  check(times.waveNo === 1 && times.t >= 19.9 && times.t <= 20.2, `Überspringen in „${stepId}“: erste Gegnerwelle zum normalen Zeitpunkt (${times.t} s)`);
  const d = await p.evaluate(() => __kf.Tutorial.data());
  check(d.skipped && d.skippedAt === stepId, `Überspringen in „${stepId}“: Schritt im Protokoll ${d.skippedAt}`);
  check(errs.length === 0, `Überspringen in „${stepId}“: keine Fehler${show(errs)}`);
  await ctx.close();
}

// Schritt 4 mit Kaserne: der Knopf „Welle vorziehen“ ist das Ziel, die Kamera folgt nicht (REQ-T.01)
{
  const { ctx, p, errs } = await freshTutorialPage();
  await waitStep(p, 'fertigen').catch(() => {}); await endGreeting(p);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e4; G.S.level = 2; __kf.Tutorial.event('materialProduced', { n: 10, source: 'click' }, G.S.t);   // Schritt 1 erledigt (ab Stufe 2 presst eine Automatik mit, Klicks brächten weniger)
    G.buildAt(0, 'fabrik'); G.buildAt(1, 'kaserne'); for (let i = 0; i < 3; i++) G.spawn('laeufer'); __kf.requestRender(); });
  await p.waitForTimeout(300);
  const a = await tutState(p);
  check(a.step === 'ausruecken' && a.marked.join() === 'tab-army', `Schritt 4 mit Kaserne: zuerst der Reiterknopf Armee ${JSON.stringify(a)}`);
  await p.click('#tab-army'); await p.waitForTimeout(250);
  const b2 = await tutState(p);
  check(b2.marked.length === 1 && b2.marked[0] === 'waveRush', `Schritt 4 mit Kaserne: Knopf „Welle vorziehen“ ${JSON.stringify(b2.marked)}`);
  await p.click('[data-tooltip="waveRush"]'); await p.waitForTimeout(300);
  check(await p.evaluate(() => __kf.Tutorial.isDone('ausruecken') && !__kf.Cam.follow && !__kf.G.holdActive()), 'Schritt 4 mit Kaserne: erledigt, Schonfrist endet, Kamera bleibt frei');
  check(errs.length === 0, `Schritt 4 mit Kaserne: keine Fehler${show(errs)}`);
  await ctx.close();
}

// Keine Pause im Tutorial: verdeckter Tab und Neuladen pausieren das Tutorial nicht, ein freies Spiel schon (REQ-6.03)
{
  const { ctx, p } = await freshTutorialPage();
  const hide = hidden => p.evaluate(h => { Object.defineProperty(document, 'hidden', { get: () => h, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, hidden);
  await hide(true); await hide(false); await p.waitForTimeout(200);
  const a = await p.evaluate(() => ({ paused: __kf.paused, resume: !document.querySelector('#resumeBtn').hidden }));
  check(!a.paused && !a.resume, `Tutorial: verdeckter Tab pausiert das Spiel nicht, kein „Weiter“ ${JSON.stringify(a)}`);
  const t0 = await p.evaluate(() => __kf.G.S.t); await p.waitForTimeout(500);
  check(await p.evaluate(t => __kf.G.S.t > t, t0), 'Tutorial: die Zeit läuft nach dem Tabwechsel weiter');
  await p.evaluate(() => __kf.save()); await p.reload(); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ paused: __kf.paused, active: __kf.Tutorial.active(), resume: !document.querySelector('#resumeBtn').hidden }));
  check(r.active && !r.paused && !r.resume, `Tutorial: nach dem Neuladen läuft die Partie ohne „Weiter“ ${JSON.stringify(r)}`);
  await p.click('#tutSkipBtn'); await p.waitForTimeout(150);
  await hide(true); await hide(false); await p.waitForTimeout(150);
  check(await p.evaluate(() => __kf.paused && !document.querySelector('#resumeBtn').hidden), 'Freies Spiel: verdeckter Tab pausiert weiterhin (REQ-6.03)');
  await ctx.close();
}

// Sitzungsprotokoll (REQ-T.07, T2.): Schrittzeiten, Fehlklicks, Begrüßung, Klicks auf Blasen, Sprache und Stufe; Vorführung zählt nicht als Klick
{
  const { ctx, p } = await freshTutorialPage('de', '&difficulty=easy&debug=1');
  await p.evaluate(() => { __kf.C.TUTORIAL.greetMs = 300; });
  await p.click('#tutBubble'); await p.waitForTimeout(150);
  await waitText(p);
  await p.click('#tab-wall'); await p.click('#tab-army'); await p.click('#tab-build'); await p.waitForTimeout(100);
  for (let i = 0; i < 10; i++){ await p.click('#clickBtn'); await p.waitForTimeout(90); }
  await p.waitForTimeout(300);
  const s = await p.evaluate(() => { const d = __kf.session(); return { clicks: d.clicks, step: d.tutorial.stepTimes.fertigen, miss: d.tutorial.misclicks, btn: !document.querySelector('#sessionBtn').hidden,
    lang: d.lang, diff: d.diff, greet: d.tutorial.greetingMs, bubble: d.tutorial.bubbleClicks }; });
  check(s.btn && s.clicks === 10 && s.step > 0 && s.miss.fertigen === 3, `Protokoll: Tutorial-Felder, Fehlklicks und Klicks ohne Vorführung ${JSON.stringify(s)}`);
  check(s.lang === 'de' && s.diff === 'leicht' && s.greet > 0 && s.bubble === 1, `Protokoll: Sprache, Stufe, Dauer der Begrüßung, Klicks auf Blasen ${JSON.stringify([s.lang, s.diff, s.greet, s.bubble])}`);
  await ctx.close();
}

// Quartiermeister bei 1280×720: gut erkennbar, Bildschirmfoto für den Bericht
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
  await p.goto(urlTutorial + '&lang=de&difficulty=easy'); await p.waitForTimeout(900);
  const r = await p.evaluate(() => { const f = __kf.TutUI.target; const el = document.querySelector('#tutBubble').getBoundingClientRect(); return { bubble: [Math.round(el.left), Math.round(el.top), Math.round(el.width), Math.round(el.height)], inside: el.left >= 0 && el.right <= innerWidth && el.top >= 0 && el.bottom <= innerHeight, scale: __kf.C.TUTORIAL.guideScale }; });
  await p.screenshot({ path: new URL('../reports/screens/t2-quartiermeister-1280x720.png', import.meta.url).pathname });
  check(r.inside && r.scale === 1.2, `Quartiermeister bei 1280×720: Sprechblase im Bild, Größe ×${r.scale}; Bildschirmfoto reports/screens/t2-quartiermeister-1280x720.png`);
  await ctx.close();
}

// Erstkontakt-Hinweise: nie während des Tutorials, höchstens einer, schließen sich nach der Frist, „neu“-Marken
{
  const { ctx, p, errs } = await freshTutorialPage();
  await p.evaluate(() => { __kf.C.UI.hintAutoMs = 600; __kf.showHint('siege'); __kf.showHint('wall'); }); await p.waitForTimeout(200);
  check(await p.evaluate(() => document.querySelector('#hintBox').hidden), 'Hinweise erscheinen nicht, solange das Tutorial läuft');
  await p.click('#tutSkipBtn'); await p.waitForTimeout(250);
  const first = await p.evaluate(() => ({ visible: !document.querySelector('#hintBox').hidden, text: document.querySelector('#hintText').textContent }));
  const siegeText = await tx(p, 'hint.siege', { x: await p.evaluate(() => __kf.C.SIEGE_STRENGTH) });
  check(first.visible && first.text === siegeText, `Nach dem Tutorial erscheint der erste Hinweis (${first.text})`);
  const texts = new Set();
  for (let i = 0; i < 20; i++){ await p.waitForTimeout(100); const v = await p.evaluate(() => ({ vis: !document.querySelector('#hintBox').hidden, text: document.querySelector('#hintText').textContent })); if (v.vis) texts.add(v.text); }
  check(texts.size === 2, `Hinweise nacheinander, immer nur einer sichtbar (${texts.size} verschiedene)`);
  await p.waitForTimeout(900);
  check(await p.evaluate(() => document.querySelector('#hintBox').hidden), 'Hinweise schließen sich nach der Frist von selbst');
  // „neu“: Stufe 2 schaltet Gebäude und Karten frei; Marken verschwinden nach dem Ansehen
  await p.evaluate(() => { __kf.C.UI.newSeenMs = 400; __kf.G.S.material = 1e5; __kf.G.S.level = 2; __kf.selectPlot(4); }); await p.waitForTimeout(250);
  const n1 = await p.evaluate(() => ({ picks: [...document.querySelectorAll('#ctxBuild .pick')].filter(x => !x.querySelector('i.new').hidden).map(x => x.dataset.tooltip.split(':')[1]),
                                     cards: !document.querySelector('#tab-cards i.new').hidden }));
  check(n1.picks.includes('schmiede') && n1.picks.includes('kaserne') && !n1.picks.includes('fabrik') && n1.cards, `Neu freigeschaltete Bau-Optionen und Reiter tragen „neu“ ${JSON.stringify(n1)}`);
  await p.waitForTimeout(700);
  const n2 = await p.evaluate(() => ({ picks: [...document.querySelectorAll('#ctxBuild .pick i.new')].filter(x => !x.hidden).length }));
  check(n2.picks === 0, 'Die Marke „neu“ an Bau-Optionen verschwindet, nachdem sie angesehen wurden');
  await p.click('#tab-cards'); await p.waitForTimeout(700); await p.click('#tab-build'); await p.waitForTimeout(250);
  check(await p.evaluate(() => document.querySelector('#tab-cards i.new').hidden), 'Die Marke „neu“ am Reiter verschwindet nach dem Ansehen');
  // Markierungen bleiben nach dem Neuladen erhalten
  await p.evaluate(() => __kf.save()); await p.reload(); await p.waitForTimeout(300);
  check(await p.evaluate(() => document.querySelector('#tab-cards i.new').hidden), 'Gesehene Markierungen bleiben im Spielstand');
  check(errs.length === 0, `Hinweise und Markierungen: keine Fehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Kartenbühne (REQ-KP.03) ---------- */
for (const [vw, vh] of [[1280, 720], [1920, 1080]]){
  const ctx = await b.newContext({ viewport: { width: vw, height: vh } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'index.html?dev=1&tutorial=0&pacing=standard&buehne=1&lang=de&difficulty=easy'); await p.waitForTimeout(400);
  const lv = n => p.evaluate(n => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + n); G.S.xp = G.S.xpTotal;
    G.S.units.push({ id: 99990 + n, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); }, n);
  const st = () => p.evaluate(() => { const g = id => document.getElementById(id), r = g('stageCards').getBoundingClientRect(), cs = [...g('stageCards').children];
    return { vis: !g('stage').hidden, pending: !!__kf.G.S.pendingDraft, levels: __kf.G.S.pendingLevels, tab: __kf.tab, n: cs.length,
      cx: (r.left + r.width / 2) / innerWidth, cy: (r.top + r.height / 2) / innerHeight, locked: g('stageCards').classList.contains('locked'),
      inView: cs.every(c => { const q = c.getBoundingClientRect(); return q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight; }),
      w: cs[0] ? cs[0].offsetWidth : 0, deck: !g('cardSym').hidden, oldBox: !g('draftBox').offsetParent === false }; });
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; __kf.selectTab ? 0 : 0; });
  check(await p.evaluate(() => !document.getElementById('cardSym').hidden), `[${vw}] Kartenbühne: Kartensymbol ist vor der ersten Wahl sichtbar (ohne Entdecken)`);
  const tab0 = await p.evaluate(() => __kf.tab);
  await lv(2); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 }).catch(() => {});
  const s1 = await st();
  check(s1.vis && s1.pending && s1.n >= 2 && Math.abs(s1.cx - 0.5) <= 0.05 && Math.abs(s1.cy - 0.5) <= 0.05, `[${vw}] Kartenbühne: Bühne offen, Kartenreihe in der Bildmitte ${JSON.stringify(s1)}`);
  check(s1.inView && s1.w >= 160 && s1.w <= 260 && s1.w >= Math.min(260, vw * 0.14) - 1, `[${vw}] Kartenbühne: alle Karten sichtbar, Breite im Rahmen (${s1.w}px)`);
  check(s1.tab === tab0 && s1.locked, `[${vw}] Kartenbühne: Reiter unverändert, Karten in der Eingabesperre gesperrt`);
  const audit = await p.evaluate(() => ({ tip: __kf.tooltipAudit(), expl: __kf.explAudit() }));
  check(audit.tip.length === 0 && audit.expl.length === 0, `[${vw}] Kartenbühne: Tooltip und Erklärzeile an jedem Element${show([...audit.tip, ...audit.expl])}`);
  // Klick in der Sperre wählt nichts
  await p.evaluate(() => { document.querySelector('.kcard').click(); });
  check((await st()).pending && (await st()).levels === 2, `[${vw}] Kartenbühne: Klick innerhalb der Eingabesperre wählt keine Karte`);
  // Spielzeit steht still, solange die Bühne offen ist (zeit = pause)
  const before = await p.evaluate(() => ({ t: __kf.G.S.t, m: __kf.G.S.material, u: JSON.stringify(__kf.G.S.units.map(u => u.x)) }));
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ t: __kf.G.S.t, m: __kf.G.S.material, u: JSON.stringify(__kf.G.S.units.map(u => u.x)) }));
  check(JSON.stringify(before) === JSON.stringify(after), `[${vw}] Kartenbühne: Spielstand ändert sich bei offener Bühne nicht`);
  // nach der Sperre wählt ein Klick, und die Bühne zeigt die zweite Wahl
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.click('.kcard >> nth=0'); await p.waitForTimeout(900);
  const s2 = await st();
  check(s2.pending && s2.levels === 1 && s2.vis && s2.tab === tab0, `[${vw}] Kartenbühne: zwei Wahlen nacheinander, die zweite öffnet sich ${JSON.stringify(s2)}`);
  // Tastatur: Ziffer wählt
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.keyboard.press('2'); await p.waitForTimeout(900);
  const s3 = await st();
  check(!s3.pending && !s3.vis && s3.tab === tab0, `[${vw}] Kartenbühne: Taste 2 wählt, die Bühne schließt, derselbe Reiter ${JSON.stringify(s3)}`);
  check(await p.evaluate(() => Object.values(__kf.G.S.draft.stacks).reduce((a, c) => a + c, 0) === 2), `[${vw}] Kartenbühne: beide Karten gewählt`);
  // Später: Bühne klappt ein, Wahl bleibt offen, Stapel pulsiert, Klick öffnet
  await lv(1); await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.click('#stageLater'); await p.waitForTimeout(80);
  const f1 = await p.evaluate(() => ({ hidden: document.getElementById('stage').hidden, pending: !!__kf.G.S.pendingDraft, pulse: document.getElementById('cardSym').classList.contains('pulse') }));
  check(f1.hidden && f1.pending && f1.pulse, `[${vw}] Kartenbühne: „Später“ klappt ein, Wahl bleibt offen, Stapel pulsiert ${JSON.stringify(f1)}`);
  await p.click('#cardSym'); await p.waitForTimeout(80);
  check((await st()).vis, `[${vw}] Kartenbühne: Klick auf den Stapel öffnet die Bühne wieder`);
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  await p.keyboard.press('1'); await p.waitForTimeout(900);
  // Sammlung im Reiter Karten: keine Wahl dort
  await p.click('#tab-cards'); await p.waitForTimeout(150);
  check(await p.evaluate(() => document.getElementById('draftBox').offsetParent === null && !document.getElementById('collHint').hidden), `[${vw}] Kartenbühne: Reiter Karten ist nur Sammlung`);
  // Maustaste gedrückt: Bühne öffnet erst nach dem Loslassen
  const box = await (await p.$('#clickBtn')).boundingBox();
  await p.mouse.move(box.x + 10, box.y + 10); await p.mouse.down(); await lv(1); await p.waitForTimeout(250);
  const h1 = await st();
  await p.mouse.up(); await p.waitForTimeout(250);
  const h2 = await st();
  check(h1.pending && !h1.vis && h2.vis, `[${vw}] Kartenbühne: bei gedrückter Maustaste öffnet sie erst nach dem Loslassen ${JSON.stringify([h1.vis, h2.vis])}`);
  check(errs.length === 0, `[${vw}] Kartenbühne: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}
// Kartenbühne aus (Standardmodus): die Wahl bleibt im Reiter Karten
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto(base + 'index.html?dev=1&tutorial=0&pacing=standard&lang=de&difficulty=easy'); await p.waitForTimeout(400);
  await p.evaluate(() => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + 1); G.S.xp = G.S.xpTotal;
    G.S.units.push({ id: 99991, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); });
  await p.waitForFunction(() => __kf.tab === 'cards', null, { timeout: 3000 }).catch(() => {});
  const o = await p.evaluate(() => ({ tab: __kf.tab, stage: document.getElementById('stage').hidden, deck: document.getElementById('cardSym').hidden, box: !document.getElementById('draftBox').hidden }));
  check(o.tab === 'cards' && o.stage && o.deck && o.box, `Kartenbühne aus: Wahl im Reiter Karten wie in v0.8 ${JSON.stringify(o)}`);
  await ctx.close();
}

/* ---------- Modus karten: gesperrte Inhalte, Pfadkarten auf der Bühne (REQ-KP.01, KP.02) ---------- */
for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if ((m.type() === 'error' || (m.type() === 'warning' && m.text().includes('[i18n]'))) && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + `index.html?dev=1&tutorial=0&pacing=karten&entdecken=0&lang=${lang}&difficulty=easy`); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; __kf.G.S.material = 3000; __kf.selectPlot(1); }); await p.waitForTimeout(250);
  const srcName = id => p.evaluate(id => __kf.t(__kf.G.OPT[id].nameKey), id);
  const buildTxt = await p.evaluate(() => [...document.querySelectorAll('#ctxBuild .pick')].map(x => ({ type: x.dataset.tooltip.split(':')[1], dis: x.getAttribute('aria-disabled'), txt: x.textContent })));
  const kas = buildTxt.find(x => x.type === 'kaserne'), fab = buildTxt.find(x => x.type === 'fabrik');
  check(kas && kas.dis === 'true' && kas.txt.includes(await srcName('echtesMilitaer')) && fab && fab.dis !== 'true', `[${lang}] Karten: Kaserne gesperrt mit Quelle „${kas && kas.txt.slice(-40)}“, Fabrik frei`);
  await p.evaluate(() => __kf.selectTab('army')); await p.waitForTimeout(150);
  const werfer = await p.evaluate(() => { const b = document.querySelector('[data-tooltip="unit:werfer"]'); return { vis: b && !b.hidden, dis: b && b.getAttribute('aria-disabled'), txt: b ? b.textContent : '', fresh: b ? !b.querySelector('i.new').hidden : null }; });
  check(werfer.vis && werfer.dis === 'true' && werfer.txt.includes(await srcName('echtesMilitaer')) && werfer.fresh === false, `[${lang}] Karten: Werfer sichtbar, gesperrt, nennt die Karte, ohne Marke „neu“`);
  await p.evaluate(() => __kf.selectTab('wall')); await p.waitForTimeout(150);
  const wall = await p.evaluate(() => ['upg:mauer', 'upg:turm_0', 'upg:stacheln'].map(k => { const b = document.querySelector(`[data-tooltip="${k}"]`); return b && !b.hidden && b.getAttribute('aria-disabled') === 'true' && b.textContent; }));
  check(wall.every(x => x && x.includes(lang === 'de' ? 'Festungsbau' : 'Fortification')), `[${lang}] Karten: Mauerstufe, Turm und Stachelwall sind gesperrt und nennen die Karte Festungsbau`);
  check((await p.evaluate(() => ({ t: __kf.tooltipAudit().length, e: __kf.explAudit().length }))).t === 0 && (await p.evaluate(() => __kf.explAudit().length)) === 0, `[${lang}] Karten: Tooltip und Erklärzeile an jedem Element (Startzustand)`);
  // erste Wahl: Pfadkarte auf der Bühne mit „Schaltet frei:“
  await p.evaluate(() => { const G = __kf.G; G.S.level = 1; G.S.pendingLevels = 1; G.S.xpTotal = G.xpNeed(1); G.S.xp = G.S.xpTotal;
    G.S.units.push({ id: 99990, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); });
  await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 3000 });
  const cards = await p.evaluate(() => [...document.querySelectorAll('.kcard')].map(c => ({ fam: [...c.classList].find(x => x.startsWith('fam-')), txt: c.textContent })));
  check(cards.length >= 2 && cards.some(c => c.fam !== 'fam-bonus' && /⌂|▲|⇧/.test(c.txt)) && cards.some(c => c.fam === 'fam-bonus'), `[${lang}] Karten: Angebot mit Pfad- und Bonuskarte, Pfadkarte nennt, was sie freischaltet ${JSON.stringify(cards.map(c => c.fam))}`);
  // Detailzeile der Pfadkarte nennt die Rückkehr in den Stapel
  await p.evaluate(() => { const i = [...document.querySelectorAll('.kcard')].findIndex(c => !c.classList.contains('fam-bonus')); document.querySelectorAll('.kcard')[i].focus(); });
  await p.waitForTimeout(100);
  check(!(await p.evaluate(() => document.getElementById('stageDetail').textContent)).includes(await p.evaluate(() => __kf.t('kp.card.returns'))), `[${lang}] Karten: Detailzeile ohne Hinweis auf die Rückkehr in den Stapel (REQ-K2.03)`);
  const aud = await p.evaluate(() => ({ t: __kf.tooltipAudit(), e: __kf.explAudit() }));
  check(aud.t.length === 0 && aud.e.length === 0, `[${lang}] Karten: Bühne mit Pfadkarten: Tooltip und Erklärzeile${show([...aud.t, ...aud.e])}`);
  // Pfadkarte wählen: Inhalt wird baubar
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 3000 });
  const pickedId = await p.evaluate(() => { const d = __kf.G.S.pendingDraft; const i = d.options.findIndex(id => __kf.G.OPT[id].pfad); __kf.G.chooseDraft(i); return d.options[i]; });
  const opened = await p.evaluate(id => ({ card: id, kaserne: __kf.G.isBuildable('kaserne'), werfer: __kf.G.unitUnlocked('werfer'), mauer: !__kf.G.stageSource('mauer'), schmiede: __kf.G.isBuildable('schmiede') }), pickedId);
  check((opened.card === 'echtesMilitaer' && opened.kaserne && opened.werfer && !opened.schmiede) || (opened.card === 'pfadFestungsbau' && opened.mauer && !opened.kaserne) || (!['echtesMilitaer', 'pfadFestungsbau'].includes(opened.card) && !opened.kaserne), `[${lang}] Karten: gewählte Pfadkarte schaltet genau ihre Inhalte frei ${JSON.stringify(opened)}`);
  check(errs.length === 0, `[${lang}] Karten: keine Konsolenfehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Tutorial im Modus karten: Kartenwahl auf der Bühne, Abschied „Karten öffnen den Weg“ (REQ-KP.08, KP.03) ---------- */
for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); if (m.type() === 'warning' && m.text().includes('[i18n]')) errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('kfInit')){ localStorage.clear(); sessionStorage.setItem('kfInit', '1'); } });
  await p.goto(base + `index.html?dev=1&pacing=karten&lang=${lang}&difficulty=easy&tutorial=1`); await p.waitForTimeout(400);
  await endGreeting(p); await waitText(p);
  // Schritte 1 bis 4 über die Spiellogik erledigen, danach die erste Welle besiegen lassen
  for (let i = 0; i < 12; i++){ await p.click('#clickBtn'); await p.waitForTimeout(100); }
  await p.evaluate(() => { const G = __kf.G; G.S.material = 400; G.build('fabrik'); for (let i = 0; i < 3; i++) G.spawn('laeufer'); G.S.sections.forEach(s => { s.hp = 1e6; }); });
  await p.waitForFunction(() => __kf.Tutorial.view().step && __kf.Tutorial.view().step.id !== 'fertigen', null, { timeout: 20000 });
  await p.evaluate(() => { const G = __kf.G; G.rushWave && G.rushWave(); G.releaseHold && G.releaseHold(false); for (let i = 0; i < 20 * 150 && !(__kf.Tutorial.view().step && __kf.Tutorial.view().step.id === 'karte'); i++){ G.S.material = Math.max(G.S.material, 100); G.spawn('laeufer'); G.tick(0.05); } });
  await p.waitForFunction(() => __kf.Tutorial.view().step && __kf.Tutorial.view().step.id === 'karte' && !document.querySelector('#tutBubble').hidden, null, { timeout: 30000 });
  await p.waitForTimeout(500);                                  // Blase setzt sich nach dem Austeilen an ihren Platz
  const s6 = await p.evaluate(() => { const bb = document.querySelector('#tutBubble').getBoundingClientRect(), cr = document.querySelector('#stageCards').getBoundingClientRect();
    return { stage: !document.querySelector('#stage').hidden, tab: __kf.tab, narr: document.querySelector('#tutBubbleNarr').textContent, task: document.querySelector('#tutBubbleTask').textContent, bubbleBottom: bb.bottom, cardsTop: cr.top }; });
  check(s6.stage && s6.narr === await tx(p, 'tut.karte.narr') && s6.task === await tx(p, 'tut.karte.task'), `[${lang}] Tutorial/karten: erste Kartenwahl auf der Bühne mit Erzählung und Auftrag ${JSON.stringify([s6.stage, s6.tab])}`);
  check(s6.bubbleBottom <= s6.cardsTop, `[${lang}] Tutorial/karten: Sprechblase sitzt über der Bühne und verdeckt keine Karte (${Math.round(s6.bubbleBottom)} ≤ ${Math.round(s6.cardsTop)})`);
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 5000 });
  await p.click('.kcard >> nth=0'); await p.waitForTimeout(1100);
  const f1 = await tutState(p);
  check(f1.phase === 'farewell' && f1.narr === await tx(p, 'tut.bye1.karten'), `[${lang}] Tutorial/karten: Abschied 1 im Modus karten „${f1.narr}“`);
  check(errs.length === 0, `[${lang}] Tutorial/karten: keine Fehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Universität im Modus karten (REQ-KP.04) ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'index.html?dev=1&tutorial=0&pacing=karten&entdecken=0&lang=de&difficulty=easy'); await p.waitForTimeout(400);
  await p.evaluate(() => { const G = __kf.G; G.S.material = 5000; G.unlockKey('bau:universitaet'); G.build('universitaet'); document.querySelector('#hintBox').hidden = true; __kf.selectTab('uni'); }); await p.waitForTimeout(250);
  const u1 = await p.evaluate(() => ({ box: !document.getElementById('resPfad').hidden, groups: [...document.querySelectorAll('#resPfad .res-group:not([hidden])')].map(g => g.textContent), dis: [...document.querySelectorAll('[data-tooltip="res:r_mauerausbau3"]')].map(b => b.getAttribute('aria-disabled')) }));
  check(u1.box && u1.groups.length >= 1 && u1.groups.some(g => g.includes('Befestigungskunde') && g.includes('Öffnet mit: Karte Befestigungskunde')) && u1.groups.length === 4 && u1.dis[0] === 'true', `Universität/karten: Pfadforschung gruppiert nach Quellkarte, gesperrt mit „Öffnet mit: Karte …“ ${JSON.stringify(u1.groups)}`);
  await p.evaluate(() => { const G = __kf.G; G.S.draft.stacks.pfadFestungsbau = 1; G.S.pendingDraft = { level: 1, options: ['befestigungskunde', 'bessereFabriken'], rerolled: 0 }; G.S.pendingLevels = 1; G.chooseDraft(0); G.startResearch('r_mauerausbau3'); __kf.requestRender(); });
  await p.waitForTimeout(300);
  const u2 = await p.evaluate(() => ({ run: document.getElementById('resActive').textContent, dis: document.querySelector('[data-tooltip="res:r_turmausbau"]').getAttribute('aria-disabled'), txt: document.querySelector('[data-tooltip="res:r_turmausbau"]').textContent }));
  check(u2.run.includes('Mauerausbau III') && u2.run.includes('0:40') && !u2.txt.includes('Öffnet mit'), `Universität/karten: laufende Forschung mit Restzeit, zweite Forschung geöffnet ${JSON.stringify([u2.run.slice(0, 40), u2.dis])}`);
  const a = await p.evaluate(() => ({ t: __kf.tooltipAudit().length, e: __kf.explAudit().length }));
  check(a.t === 0 && a.e === 0 && errs.length === 0, `Universität/karten: Tooltips, Erklärzeilen, keine Fehler${show(errs)}`);
  // Sammlung mit Pfadübersicht: Status je Pfadkarte und Forschung
  await p.evaluate(() => __kf.selectTab('cards')); await p.waitForTimeout(250);
  const pl = await p.evaluate(() => [...document.querySelectorAll('#pathList li')].map(li => li.textContent));
  check(pl.length === 18 && pl.some(x => x.includes('Befestigungskunde') && x.includes('gewählt')) && pl.some(x => x.includes('Mauerausbau III') && x.includes('läuft')) && pl.some(x => x.includes('Ballistik') && x.includes('gesperrt')) && pl.some(x => x.includes('Gelehrte') && x.includes('verfügbar')), `Sammlung/karten: Pfadübersicht mit Status (${pl.length} Einträge) ${JSON.stringify(pl.slice(0, 4))}`);
  // Standardmodus: keine Pfadforschung
  const ctx2 = await b.newContext({ viewport: { width: 1280, height: 720 } }), p2 = await ctx2.newPage();
  await p2.goto(base + 'index.html?dev=1&tutorial=0&pacing=standard&lang=de&difficulty=easy'); await p2.waitForTimeout(300);
  check(await p2.evaluate(() => document.getElementById('resPfad').hidden && [...document.querySelectorAll('[data-tooltip="res:r_mauerausbau3"]')].every(b => b.hidden)), 'Universität/standard: keine Pfadforschung sichtbar');
  await ctx2.close(); await ctx.close();
}

/* ---------- Armee im Modus karten: neue Einheiten, Einheitenersatz (REQ-KP.05) ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if ((m.type() === 'error' || (m.type() === 'warning' && m.text().includes('[i18n]'))) && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + 'index.html?dev=1&tutorial=0&pacing=karten&entdecken=0&lang=de&difficulty=easy'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; __kf.G.S.material = 5000; __kf.selectTab('army'); }); await p.waitForTimeout(250);
  const names = () => p.evaluate(() => [...document.querySelectorAll('#optsUnits .opt')].filter(b => !b.hidden).map(b => b.querySelector('.opt-name span:nth-child(2)').textContent));
  check((await names()).join() === 'Läufer,Werfer,Schildträger,Reiter,Armbrustschütze,Katapult' && await p.evaluate(() => ['werfer', 'schild', 'reiter', 'armbrust', 'katapult'].every(u => document.querySelector(`[data-tooltip="unit:${u}"]`).getAttribute('aria-disabled') === 'true')), `Armee/karten: Läufer frei, alle weiteren Einheiten sichtbar und gesperrt ${JSON.stringify(await names())}`);
  await p.evaluate(() => { const G = __kf.G; G.unlockKey('einheit:werfer'); G.S.research.done.r_reiter = 1; G.unlockKey('einheit:reiter'); G.S.research.ver++; G.spawn('laeufer'); __kf.requestRender(); }); await p.waitForTimeout(250);
  const n2 = await names();
  check(n2.includes('Reiter') && await p.evaluate(() => document.querySelector('[data-tooltip="unit:reiter"]').getAttribute('aria-disabled')) === 'false', `Armee/karten: Reiter nach der Forschung verfügbar ${JSON.stringify(n2)}`);
  await p.evaluate(() => { const G = __kf.G; G.S.research.done.r_eisenwaffen = 1; G.S.research.ver++; G.replaceUnit('laeufer', 'schwertkaempfer'); G.replaceUnit('werfer', 'bogenschuetze'); __kf.requestRender(); }); await p.waitForTimeout(250);
  const n3 = await names();
  check(n3.includes('Schwertkämpfer') && n3.includes('Bogenschütze') && !n3.includes('Läufer'), `Armee/karten: Einheitenersatz benennt die Knöpfe um ${JSON.stringify(n3)}`);
  check(await p.evaluate(() => __kf.G.S.queue.every(q => q.type === 'schwertkaempfer')), 'Armee/karten: Warteschlange aufgewertet');
  const a = await p.evaluate(() => ({ t: __kf.tooltipAudit().length, e: __kf.explAudit().length }));
  check(a.t === 0 && a.e === 0 && errs.length === 0, `Armee/karten: Tooltips, Erklärzeilen, keine Fehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Sitzungsprotokoll Format 2: Kartenwahlen (REQ-R.04) ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + 'index.html?debug=1&tutorial=0&lang=de&difficulty=easy&pacing=standard&entdecken=0&buehne=0'); await p.waitForTimeout(400);
  const lv = n => p.evaluate(n => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + n); G.S.xp = G.S.xpTotal;
    G.S.units.push({ id: 99900 + n + G.S.level, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); }, n);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  for (let i = 0; i < 2; i++){
    await lv(1);
    await p.waitForFunction(() => __kf.tab === 'cards' && !document.querySelector('#draftOffer').classList.contains('locked') && document.querySelectorAll('#draftOffer .card-pick').length >= 2, null, { timeout: 5000 });
    await p.waitForTimeout(250);
    await p.click('#draftOffer .card-pick >> nth=0'); await p.waitForTimeout(150);
  }
  const d = await p.evaluate(() => { const s = __kf.session(); return { fv: s.formatVersion, drafts: s.drafts }; });
  const ok = d.fv === 2 && d.drafts.length >= 2 && d.drafts.every(x => typeof x.chosen === 'string' && Array.isArray(x.offered) && x.offered.length >= 2 && x.offered.includes(x.chosen)
    && typeof x.thinkMs === 'number' && x.thinkMs >= 400 && x.rerolled === 0 && x.banned === 0 && typeof x.level === 'number' && typeof x.t === 'number');
  check(ok, `Protokoll Format 2: ${d.drafts.length} Kartenwahlen mit Karte, Alternativen, Bedenkzeit, Neu ziehen und Bannen ${JSON.stringify(d.drafts[0])}`);
  check(errs.length === 0, `Protokoll: keine Fehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Tutorial in der Vorgabe (Entdecken und Bühne an): Kartenwahl auf der Bühne (REQ-K2.02, K2.04) ---------- */
for (const lang of ['de', 'en']){
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); if (m.type() === 'warning' && m.text().includes('[i18n]')) errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('kfInit')){ localStorage.clear(); sessionStorage.setItem('kfInit', '1'); } });
  await p.goto(base + `index.html?dev=1&pacing=standard&lang=${lang}&difficulty=easy&tutorial=1`); await p.waitForTimeout(400);
  await endGreeting(p); await waitText(p);
  // Schritte 1 bis 4 über die Spiellogik erledigen, danach die erste Welle besiegen lassen
  for (let i = 0; i < 12; i++){ await p.click('#clickBtn'); await p.waitForTimeout(100); }
  await p.evaluate(() => { const G = __kf.G; G.S.material = 400; G.build('fabrik'); for (let i = 0; i < 3; i++) G.spawn('laeufer'); G.S.sections.forEach(s => { s.hp = 1e6; }); });
  await p.waitForFunction(() => __kf.Tutorial.view().step && __kf.Tutorial.view().step.id !== 'fertigen', null, { timeout: 20000 });
  await p.evaluate(() => { const G = __kf.G; G.rushWave && G.rushWave(); G.releaseHold && G.releaseHold(false); for (let i = 0; i < 20 * 150 && !(__kf.Tutorial.view().step && __kf.Tutorial.view().step.id === 'karte'); i++){ G.S.material = Math.max(G.S.material, 100); G.spawn('laeufer'); G.tick(0.05); } });
  await p.waitForFunction(() => __kf.Tutorial.view().step && __kf.Tutorial.view().step.id === 'karte' && !document.querySelector('#tutBubble').hidden, null, { timeout: 30000 });
  await p.waitForTimeout(500);                                  // Blase setzt sich nach dem Austeilen an ihren Platz
  const s6 = await p.evaluate(() => { const bb = document.querySelector('#tutBubble').getBoundingClientRect(), cr = document.querySelector('#stageCards').getBoundingClientRect();
    return { stage: !document.querySelector('#stage').hidden, tab: __kf.tab, narr: document.querySelector('#tutBubbleNarr').textContent, task: document.querySelector('#tutBubbleTask').textContent, bubbleBottom: bb.bottom, cardsTop: cr.top }; });
  check(s6.stage && s6.narr === await tx(p, 'tut.karte.narr') && s6.task === await tx(p, 'tut.karte.task'), `[${lang}] Tutorial/Vorgabe: erste Kartenwahl auf der Bühne mit Erzählung und Auftrag ${JSON.stringify([s6.stage, s6.tab])}`);
  check(s6.bubbleBottom <= s6.cardsTop, `[${lang}] Tutorial/Vorgabe: Sprechblase sitzt über der Bühne und verdeckt keine Karte (${Math.round(s6.bubbleBottom)} ≤ ${Math.round(s6.cardsTop)})`);
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked'), null, { timeout: 5000 });
  await p.click('.kcard >> nth=0'); await p.waitForTimeout(1100);
  const f1 = await tutState(p);
  check(f1.phase === 'farewell' && f1.narr === await tx(p, 'tut.bye1'), `[${lang}] Tutorial/Vorgabe: Abschied 1 „${f1.narr}“`);
  // Während des Abschieds folgt eine weitere Wahl (zwei verschiedene Kartentypen in der Sammlung); danach verschwindet der Quartiermeister
  await p.evaluate(() => { const G = __kf.G; G.S.xpTotal = G.xpNeed(G.S.level + 1); G.S.xp = G.S.xpTotal; G.S.units.push({ id: 99991, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); });
  await p.waitForFunction(() => !document.getElementById('stage').hidden, null, { timeout: 5000 }).catch(() => {});
  await p.waitForFunction(() => !document.getElementById('stageCards').classList.contains('locked') || document.getElementById('stage').hidden, null, { timeout: 5000 }).catch(() => {});
  if (await p.evaluate(() => !document.getElementById('stage').hidden)){ await p.click('.kcard >> nth=1'); await p.waitForTimeout(1100); }
  const gone = await p.waitForFunction(() => __kf.Tutorial.view().phase === 'off', null, { timeout: 40000 }).then(() => true).catch(() => false);
  check(gone, `[${lang}] Tutorial/Vorgabe: der Quartiermeister verlässt das Bild (Phase „off“)`);
  check(errs.length === 0, `[${lang}] Tutorial/Vorgabe: keine Fehler${show(errs)}`);
  await ctx.close();
}

/* ---------- Prüfliste vor dem Teilen (REQ-R.05): öffentliche Fassung ohne Parameter ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const external = [], issues = [];
  p.on('request', r => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') issues.push(m.text()); }); p.on('pageerror', e => issues.push(e.message));
  await p.goto(base + 'index.html'); await p.waitForTimeout(600);
  const start = await p.evaluate(() => ({ modal: !document.querySelector('#modal').hidden, lang: !!document.querySelector('[data-tooltip="lang:de"]'), diffs: document.querySelectorAll('[data-tooltip^="diff:"]').length,
    tut: !!document.querySelector('[data-tooltip="tutorialSwitch"], [data-tooltip="tutorial"]') || !!document.querySelector('.card [aria-pressed]'), kf: typeof window.__kf, sessionBtnHidden: document.querySelector('#sessionBtn').hidden }));
  check(start.modal && start.lang && start.diffs === 3, `Öffentliche Fassung: Startbildschirm bei leerem Speicher (Sprache, drei Schwierigkeitsgrade) ${JSON.stringify(start)}`);
  check(start.kf === 'undefined' && start.sessionBtnHidden, 'Öffentliche Fassung: keine Testschnittstelle, Protokollknopf verborgen (nur mit ?debug=1)');
  await p.click('.card .btn-primary'); await p.waitForTimeout(2500);
  check(await p.evaluate(() => !!document.querySelector('#tutBubble') && !document.querySelector('#tutBubble').hidden), 'Öffentliche Fassung: Partie startet mit Tutorial in der ersten Partie');
  check(external.length === 0, `Öffentliche Fassung: keine externen Abrufe${show(external)}`);
  check(issues.length === 0, `Öffentliche Fassung: keine Konsolenfehler oder Warnungen${show(issues)}`);
  // Im Branch Kartenpfad ist der Modus per ?pacing= wählbar (auf main nicht: dort ist ein anderer Modus als standard nicht erreichbar, REQ-R.01)
  const ctx2 = await b.newContext({ viewport: { width: 1280, height: 720 } }), p2 = await ctx2.newPage();
  await p2.goto(base + 'index.html?pacing=standard&dev=1&lang=de&difficulty=easy&tutorial=0'); await p2.waitForTimeout(500);
  check(await p2.evaluate(() => { const G = __kf.G; return !G.S.pacing || G.S.pacing === 'standard'; }), 'Branch: ?pacing=standard schaltet auf das Verhalten von main');
  await ctx2.close();
  await ctx.close();
}

await b.close();
server.close();
process.exit(failed ? 1 : 0);

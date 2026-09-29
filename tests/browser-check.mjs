// Optionale Browser-Prüfung. Braucht Playwright, das NICHT zum Projekt gehört:
//   npx playwright install chromium   (einmalig, außerhalb des Projekts)
//   node tests/browser-check.mjs
// Prüft je Sprache: Start ohne Fehler in der Konsole, Tooltip-Abdeckung, Erklärzeile an jedem Knopf (REQ-20.1),
// Tooltip-Verzögerung, Tooltip im Fenster, keine deutschen Reste in der englischen Oberfläche, keine fehlenden Schlüssel,
// Erstkontakt-Hinweise nur einmal pro Browser und wieder nach dem Zurücksetzen (REQ-20.2/20.3).
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { console.log('Playwright nicht installiert – Browser-Prüfung übersprungen.'); process.exit(0); }

const url = new URL('../index.html?dev=1', import.meta.url).href;
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
  check(await p.evaluate(() => !document.querySelector('#hintBox').hidden), `[${lang}] Hinweis zur ersten Welle erscheint`);
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
  const again = await p.evaluate(() => { __kf.showHint('wave'); return document.querySelector('#hintBox').hidden ? null : document.querySelector('#hintText').textContent; });
  check(again === null, `[${lang}] gesehener Hinweis erscheint nach Neuladen nicht erneut${again ? ' ' + again : ''}`);
  const afterReset = await p.evaluate(() => { __kf.Hints.reset(); __kf.showHint('wave'); return !document.querySelector('#hintBox').hidden; });
  check(afterReset, `[${lang}] Hinweis erscheint nach dem Zurücksetzen wieder`);

  check(warns.length === 0, `[${lang}] keine fehlenden Sprachschlüssel${show(warns)}`);
  check(errors.length === 0, `[${lang}] keine Fehler in der Konsole${show(errors)}`);
  await ctx.close();
}
// REQ-46 und REQ-5.03: drei Bänder, Scrollen, Bauplatz-Klick, Bildzeit
import { mkdirSync } from 'node:fs';
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
  await p.evaluate(() => { const G = __kf.G; G.S.nextWave = G.S.t + 15; G.S.material = 1e5; for (const t of ['fabrik', 'schmiede', 'kaserne', 'universitaet']) G.build(t);
    for (let l = 0; l < 3; l++){ G.addFormation('p', l, Array(8).fill('laeufer').concat(['werfer', 'werfer', 'werfer']), 560); G.addFormation('e', l, Array(6).fill('laeufer').concat(['werfer']), 640); }
    for (const u of G.S.units) if (u.id % 3 === 0) u.hp = u.maxHp * 0.5;
    __kf.selectPlot(5); __kf.Cam.goTo(__kf.Cam.frontTarget() + 150); });
  await p.waitForTimeout(300);
  // Bildschirmfoto für den Bericht, auch als Beleg der Lesbarkeit der Einheiten bei 1280×720 (REQ-5.03)
  await p.screenshot({ path: new URL(`i5-layout-${w}x${h}.png`, shotDir).pathname });
  await p.evaluate(() => { const G = __kf.G; G.S.nextWave = 1e9; });
  // Klick auf Objekte in der Welt öffnet den passenden Reiter mit Kontextkopf (je Objekttyp)
  for (const [kind, want] of [['fabrik', 'build'], ['schmiede', 'smithy'], ['kaserne', 'build'], ['universitaet', 'uni'], ['frei', 'build'], ['mauer', 'wall']]){
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
  const empty = await p.evaluate(() => __kf.worldToScreen(__kf.Cam.x + innerWidth * 0.6, 12));
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
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.save.v5', JSON.stringify({ v: 5, diff: 'normal' })); });
  await p.reload(); await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ text: document.querySelector('#mText').textContent, open: !document.querySelector('#modal').hidden,
    note: __kf.t('start.oldSave'), left: localStorage.getItem('klammerfront.save.v5') }));
  check(r.open && r.text.includes(r.note) && r.left === null, 'Alter Spielstand: Hinweis auf dem Startbildschirm, danach entfernt');
  await p.reload(); await p.waitForTimeout(300);
  check(!(await p.evaluate(() => document.querySelector('#mText').textContent.includes(__kf.t('start.oldSave')))), 'Alter Spielstand: Hinweis nur einmal');
  await ctx.close();
}

// REQ-5.03: Kartenwahl als Hinweis in der Leiste, kein automatischer Reiterwechsel; Wahl im Reiter Karten
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); localStorage.setItem('klammerfront.skipIntro', '1'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; __kf.selectTab('army'); const G = __kf.G;
    G.S.xpTotal = G.xpNeed(1); G.S.xp = G.S.xpTotal; G.S.units.push({ id: 99999, side: 'e', type: 'laeufer', lane: 1, laneF: 1, x: 500, hp: -1, maxHp: 1, dmg: 0, cdMax: 1, cd: 0, flash: 0 }); });
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ pending: !!__kf.G.S.pendingDraft, btn: !document.querySelector('#draftBtn').hidden, tab: __kf.tab,
    mark: !document.querySelector('#tab-cards .mark').hidden, modal: !document.querySelector('#modal').hidden }));
  check(st.pending && st.btn && st.tab === 'army' && st.mark && !st.modal, `Kartenwahl: Hinweis in der Leiste und Markierung am Reiter, kein Reiterwechsel, kein Dialog ${JSON.stringify(st)}`);
  await p.click('#draftBtn'); await p.waitForTimeout(80);
  check(await p.evaluate(() => __kf.tab === 'cards' && document.querySelectorAll('#draftOffer .card-pick').length >= 2), 'Kartenwahl: Klick auf den Hinweis öffnet den Reiter Karten mit den Optionen');
  const t0 = await p.evaluate(() => __kf.G.S.t);
  await p.waitForTimeout(300);
  check(await p.evaluate(t => __kf.G.S.t === t, t0), 'Kartenwahl: das Spiel steht bis zur Wahl');
  await p.click('#draftOffer .card-pick'); await p.waitForTimeout(80);
  check(await p.evaluate(() => !__kf.G.S.pendingDraft && document.querySelector('#draftBtn').hidden && document.querySelectorAll('#chosen .opt-tag').length === 1), 'Kartenwahl: Karte gewählt, Hinweis verschwindet');
  check(errors.length === 0, `Kartenwahl: keine Fehler${show(errors)}`);
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
  const r2 = await p.evaluate(() => ({ built: __kf.G.S.slots[5], ausbau: !document.querySelector('#optsKaserne').hidden && !document.querySelector('[data-tooltip="upg:ausbau"]').hidden }));
  check(clicks === 2 && r2.built?.type === 'kaserne' && r2.ausbau, `Bauen aus dem Knopfraster: ${clicks} Klicks, Kaserne mit Ausbau im Kontextkopf`);
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
    picks: [...document.querySelectorAll('#ctxBuild .pick')].map(b => b.dataset.tooltip.split(':')[1]),
    hint: document.querySelector('#hintText').textContent }; });
  check(intro.wave && intro.cards && intro.picks.join() === 'fabrik', `Einführung: zu Beginn weder Wellenleiste noch Karten, nur Fabrik baubar ${JSON.stringify(intro.picks)}`);
  check(intro.hint === await p.evaluate(() => __kf.t('hint.start')), `Einführung: Hinweis zum Start`);
  await p.evaluate(() => { __kf.G.S.level = 2; __kf.selectPlot(4); });
  await p.waitForTimeout(150);
  const later = await p.evaluate(() => ({ cards: document.querySelector('#tab-cards').hidden, picks: document.querySelectorAll('#ctxBuild .pick').length }));
  check(!later.cards && later.picks >= 4, `Einführung: ab Stufe 2 Karten und Verstärkungsgebäude sichtbar`);
  await ctx.close();
}

await b.close();
process.exit(failed ? 1 : 0);

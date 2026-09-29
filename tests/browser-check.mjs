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

  // Kontextfeld: leerer Bauplatz, bebauter Bauplatz, Basis – Erklärzeilen und Tooltips auch dort
  for (const sel of [() => __kf.selectPlot(__kf.G.S.slots.findIndex(s => !s)), () => __kf.selectPlot(__kf.G.S.slots.findIndex(s => s && s.type === 'schmiede')), () => __kf.selectBase()]){
    await p.evaluate(sel); await p.waitForTimeout(150);
    const ex = await p.evaluate(() => __kf.explAudit()), tt = await p.evaluate(() => __kf.tooltipAudit());
    check(ex.length === 0 && tt.length === 0, `[${lang}] Kontextfeld ${await p.evaluate(() => JSON.stringify(__kf.ctxSel))}: Erklärzeilen und Tooltips${show(ex.concat(tt))}`);
  }

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
    const text = await p.evaluate(() => document.body.innerText);
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
// REQ-46: Layout, Scrollen, Bauplatz-Klick, Bildzeit
for (const [w, h] of [[1280, 720], [1920, 1080]]){
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('#hintBox').hidden = true; });
  const noH = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  check(noH, `[${w}×${h}] keine waagrechte Bildlaufleiste`);
  const vis = await p.evaluate(() => { const r = document.querySelector('#lane').getBoundingClientRect(), s = document.querySelector('.side').getBoundingClientRect();
    return r.width > 0 && r.bottom <= innerHeight && s.left >= r.right; });
  check(vis, `[${w}×${h}] Spielwelt und Seitenleiste nebeneinander im Fenster`);
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

// REQ-47: Gestaffelte Einführung (frischer Browser, Einführung an)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('klammerfront.lang', 'de'); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('.card .btn-primary'); await p.waitForTimeout(200);
  const intro = await p.evaluate(() => { __kf.selectPlot(4); __kf.G.S.material = 1e5; return {
    wave: document.querySelector('#secWave').hidden, cards: document.querySelector('#secCards').hidden,
    picks: [...document.querySelectorAll('#ctxBuild .pick')].map(b => b.dataset.tooltip.split(':')[1]),
    hint: document.querySelector('#hintText').textContent }; });
  check(intro.wave && intro.cards && intro.picks.join() === 'fabrik', `Einführung: zu Beginn weder Wellenleiste noch Karten, nur Fabrik baubar ${JSON.stringify(intro.picks)}`);
  check(intro.hint === await p.evaluate(() => __kf.t('hint.start')), `Einführung: Hinweis zum Start`);
  await p.evaluate(() => { __kf.G.S.level = 2; __kf.selectPlot(4); });
  await p.waitForTimeout(150);
  const later = await p.evaluate(() => ({ cards: document.querySelector('#secCards').hidden, picks: document.querySelectorAll('#ctxBuild .pick').length }));
  check(!later.cards && later.picks >= 4, `Einführung: ab Stufe 2 Karten und Verstärkungsgebäude sichtbar`);
  await ctx.close();
}

await b.close();
process.exit(failed ? 1 : 0);

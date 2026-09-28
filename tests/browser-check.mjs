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
  await p.addInitScript(l => { try { if (!sessionStorage.getItem('kf.init')){ localStorage.clear(); localStorage.setItem('klammerfront.lang', l); sessionStorage.setItem('kf.init', '1'); } } catch (e) {} }, lang);
  await p.goto(url); await p.waitForTimeout(300);
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0, `[${lang}] Startbildschirm: alle Elemente mit Tooltip`);
  const startExpl = await p.evaluate(() => __kf.explAudit());
  check(startExpl.length === 0, `[${lang}] Startbildschirm: jeder Knopf mit Erklärzeile${show(startExpl)}`);
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
  await p.click('#hintOk');
  check(await p.evaluate(() => document.querySelector('#hintBox').hidden), `[${lang}] Hinweis lässt sich wegklicken`);

  // Bauplatz-Dialog und Kartenwahl: Erklärzeilen auch dort
  await p.evaluate(() => { document.querySelectorAll('.slot-btn')[8].click(); });
  await p.waitForTimeout(200);
  const dlgExpl = await p.evaluate(() => __kf.explAudit());
  check(dlgExpl.length === 0, `[${lang}] Bau-Dialog: jeder Knopf mit Erklärzeile${show(dlgExpl)}`);
  await p.keyboard.press('Escape');
  await p.evaluate(() => { document.querySelector('#modal').hidden = true; });

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
    const hits = [...new Set(text.match(/[äöüßÄÖÜ]|\b(und|der|die|das|Stufe|Gegner|Einheiten|Bauplatz|Material pro|Welle|Halten)\b/g) || [])];
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
await b.close();
process.exit(failed ? 1 : 0);

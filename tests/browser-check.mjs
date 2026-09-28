// Optionale Browser-Prüfung (REQ-04/05). Braucht Playwright, das NICHT zum Projekt gehört:
//   npx playwright install chromium   (einmalig, außerhalb des Projekts)
//   node tests/browser-check.mjs
// Prüft: Tooltip-Abdeckung (null Elemente ohne Tooltip), Tooltip-Verzögerung, Tooltip im Fenster,
// keine deutschen Reste in der englischen Oberfläche, keine Konsolenwarnungen zu fehlenden Schlüsseln.
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { console.log('Playwright nicht installiert – Browser-Prüfung übersprungen.'); process.exit(0); }

const url = new URL('../index.html?dev=1', import.meta.url).href;
const b = await chromium.launch();
let failed = 0;
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) failed++; };

for (const lang of ['de', 'en']){
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const warns = [];
  p.on('console', m => { if (m.type() === 'warning' && m.text().includes('[i18n]')) warns.push(m.text()); });
  await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('klammerfront.lang', l); } catch (e) {} }, lang);
  await p.goto(url); await p.waitForTimeout(300);
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0, `[${lang}] Startbildschirm: alle Elemente mit Tooltip`);
  await p.click('.card .btn-primary');
  // Partie vorantreiben, damit alle Bereiche sichtbar werden
  await p.evaluate(() => { const G = __kf.G; G.S.material = 1e5; G.buildAt(0, 'fabrik'); G.buildAt(1, 'schmiede'); G.buildAt(2, 'kaserne');
    for (let i = 0; i < 20 * 120 && G.S.status === 'running'; i++){ if (G.S.pendingDraft) G.chooseDraft(0); G.tick(0.05); if (i % 10 === 0){ G.doClick(); for (const id in __kf.C.UPGRADES) G.buy(id); G.spawn('laeufer'); } } });
  await p.waitForTimeout(400);
  if (!(await p.$eval('#modal', e => e.hidden))) await p.evaluate(() => { if (__kf.G.S.pendingDraft) __kf.G.chooseDraft(0); document.querySelector('#modal').hidden = true; });
  check((await p.evaluate(() => __kf.tooltipAudit())).length === 0, `[${lang}] Spiel: alle interaktiven Elemente mit Tooltip`);
  const box = await p.locator('#clickBtn').boundingBox();
  await p.mouse.move(box.x + 10, box.y + 10);
  await p.waitForSelector('#tip:not([hidden])', { timeout: 3000 });
  const delay = await p.evaluate(() => __kf.Tip.lastDelay);
  check(Math.abs(delay - (await p.evaluate(() => __kf.C.TOOLTIP_DELAY_MS))) <= 100, `[${lang}] Tooltip-Verzögerung ${Math.round(delay)} ms (± 100 ms)`);
  const r = await p.$eval('#tip', e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
  check(r, `[${lang}] Tooltip vollständig im Fenster`);
  if (lang === 'en'){
    const text = await p.evaluate(() => document.body.innerText);
    const hits = [...new Set(text.match(/[äöüßÄÖÜ]|\b(und|der|die|das|Stufe|Gegner|Einheiten|Bauplatz|Material pro)\b/g) || [])];
    check(hits.length === 0, `[en] keine deutschen Reste ${hits.length ? JSON.stringify(hits) : ''}`);
  }
  check(warns.length === 0, `[${lang}] keine fehlenden Sprachschlüssel ${warns.slice(0, 3).join(' ')}`);
  await p.close();
}
await b.close();
process.exit(failed ? 1 : 0);

// Bildzeit im Browser bei 20/40/80 Einheiten insgesamt (REQ-S.09, nur berichten). Braucht Playwright (nicht Teil des Projekts).
// Aufruf: node tools/bildzeit.mjs [--json reports/kartenpfad4-bildzeit.json]
// Gemessen: Zeichnen eines Bildes (benchDraw, Median über 60 Bilder, mit Zwangsausführung der Zeichenbefehle) und Tick der Logik (Mittel über 400 Ticks).
// Headless-Chromium ohne Grafikkarte: die absoluten Werte gelten nur zum Vergleich vorher/nachher auf derselben Maschine.
import http from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); } catch (e){ console.log('Playwright nicht installiert – Messung übersprungen.'); process.exit(0); }
const root = new URL('../', import.meta.url).pathname;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !existsSync(f)){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' }); res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const out = process.argv.indexOf('--json') > 0 ? process.argv[process.argv.indexOf('--json') + 1] : null;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await p.goto(base + 'index.html?dev=1&tutorial=0&lang=de&difficulty=easy&pacing=karten&entdecken=0&buehne=0'); await p.waitForTimeout(500);
const rows = [];
for (const total of [20, 40, 80]){
  const r = await p.evaluate(total => {
    const G = __kf.G, C = __kf.C;
    G.S.nextWave = Infinity; G.S.nextOwnWave = Infinity; G.S.enemyQueue = []; G.S.units = []; G.S.forms = [];
    G.S.enemyBaseHp = 1e12; G.S.sections.forEach(s => { s.hp = 1e12; });
    const per = Math.ceil(total / 2 / C.LANE_COUNT);
    for (let l = 0; l < C.LANE_COUNT; l++){
      const types = k => Array.from({ length: k }, (_, i) => i % 3 === 2 ? 'werfer' : 'laeufer');
      G.addFormation('p', l, types(per), C.PLAYER_BASE_WIDTH + 200);
      G.addFormation('e', l, types(per), C.PLAYER_BASE_WIDTH + 320);
    }
    for (const u of G.S.units){ u.hp = u.maxHp = 1e9; }
    for (let i = 0; i < 100; i++) G.tick(C.TICK_S);
    const t0 = performance.now(); for (let i = 0; i < 400; i++) G.tick(C.TICK_S);        // Mittel über 400 Ticks: performance.now() ist auf 0,1 ms gerundet
    return { units: G.S.units.length, drawMs: __kf.benchDraw(60), tickMs: (performance.now() - t0) / 400 };
  }, total);
  rows.push({ soll: total, einheiten: r.units, zeichnenMs: +r.drawMs.toFixed(2), tickMs: +r.tickMs.toFixed(3) });
}
console.log('Einheiten (soll) | Einheiten | Zeichnen ms | Tick ms');
for (const r of rows) console.log(`${String(r.soll).padStart(16)} | ${String(r.einheiten).padStart(9)} | ${String(r.zeichnenMs).padStart(11)} | ${r.tickMs}`);
if (out) writeFileSync(out, JSON.stringify({ rows, hinweis: 'Headless-Chromium ohne Grafikkarte, Median' }, null, 1));
await b.close(); server.close();

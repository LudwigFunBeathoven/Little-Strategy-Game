/* Klammerfront – Spielwelt: Canvas, Kamera, Zeichnen (REQ-46, REQ-5.03).
   Lädt nach ui.js; nutzt dessen gemeinsame Namen (C, G, $, t). Ausgeführt wird erst beim Start in ui.js. */
'use strict';
/* ================= Zeichnen: Spielwelt mit Reich und Kamera (REQ-46) =================
   Die Welt ist WORLD_WIDTH_FACTOR-mal so breit wie der Anzeigebereich. Links liegt das Reich (3×3-Raster in Draufsicht,
   von der Mauer umschlossen), zur Lane-Seite Mauer oben mit Turm, Tor, Mauer unten mit Turm. Rechts die gegnerische Basis. */
const cv = $('lane'), ctx = cv.getContext('2d');
let cw = 0, ch = 0, dpr = 1, COL = {};
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = C.LANE, PBW = C.PLAYER_BASE_WIDTH, EBW = C.ENEMY_BASE_WIDTH, GATE = C.GATE_LANE;
const PAD = 10, ENTRY = 70;          // Rand in px; Strecke (Spieleinheiten), auf der eigene Einheiten vom Tor in ihre Lane ziehen

function readColors(){
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['bg', 'surface', 'surface-2', 'ink', 'ink-soft', 'ink-faint', 'rule', 'rule-strong', 'steel', 'steel-soft', 'rust', 'rust-soft', 'ground', 'brass', 'brass-soft'])
    COL[k] = cs.getPropertyValue('--' + k).trim();
}
function resize(){
  const r = cv.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cw = Math.max(1, r.width); ch = Math.max(1, r.height);
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  Cam.goTo(Cam.x);
}
/* Geometrie in Weltpixeln */
const laneH     = () => (ch - 2 * PAD) / C.LANE_COUNT;
const laneTop   = l => PAD + l * laneH();
const laneMid   = l => laneTop(l) + laneH() / 2;
const realmSize = () => ch - 2 * PAD;
const realmR    = () => PAD + realmSize();
const worldW    = () => cw * C.WORLD_WIDTH_FACTOR;
const laneScale = () => (worldW() - realmR() - PAD) / (W - PBW);
const wx        = x => realmR() + (x - PBW) * laneScale();

/* Kamera: Position = linker Rand des Bildes in Weltpixeln */
const Cam = {
  x: 0, follow: false,
  max(){ return Math.max(0, worldW() - cw); },
  goTo(x){ this.x = Math.max(0, Math.min(this.max(), x)); },
  /* vorderste eigene Formation etwa bei zwei Dritteln des Bildes */
  frontTarget(){
    let fx = -Infinity;
    for (const f of G.S.forms) if (f.side === 'p') fx = Math.max(fx, f.x);
    return fx === -Infinity ? 0 : wx(fx) - cw * 0.65;
  },
  update(dt){ if (this.follow) this.goTo(this.x + (this.frontTarget() - this.x) * Math.min(1, dt * C.CAMERA_FOLLOW_RATE)); },
};

function hpBar(x, y, w, frac, col){
  ctx.fillStyle = COL['surface-2']; ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), 4);
}
/* Gebäude-Icons aus v0.3 (main), unverändert übernommen */
function drawBuilding(kind, cx, gy, s){
  ctx.fillStyle = COL.steel;
  if (kind === 'fabrik'){
    const w = 20 * s, h = 12 * s, x = cx - w / 2;
    ctx.fillRect(x, gy - h, w, h);
    ctx.beginPath();
    for (let i = 0; i < 3; i++){ const tx = x + i * w / 3; ctx.moveTo(tx, gy - h); ctx.lineTo(tx, gy - h - 6 * s); ctx.lineTo(tx + w / 3, gy - h); }
    ctx.fill();
    ctx.fillRect(x + w - 5 * s, gy - h - 12 * s, 3.5 * s, 12 * s);
  } else if (kind === 'schmiede'){
    const w = 18 * s, h = 11 * s, x = cx - w / 2;
    ctx.fillRect(x, gy - h, w, h);
    ctx.beginPath(); ctx.moveTo(x - 2 * s, gy - h); ctx.lineTo(cx, gy - h - 8 * s); ctx.lineTo(x + w + 2 * s, gy - h); ctx.fill();
    ctx.fillRect(x + 3 * s, gy - h - 9 * s, 3 * s, 6 * s);
    ctx.fillStyle = COL.brass; ctx.fillRect(cx - 2.5 * s, gy - 6 * s, 5 * s, 6 * s);
  } else if (kind === 'kaserne'){
    const w = 20 * s, h = 10 * s, x = cx - w / 2;
    ctx.fillRect(x, gy - h, w, h);
    ctx.fillRect(x + 2 * s, gy - h - 4 * s, w - 4 * s, 4 * s);
    ctx.fillRect(cx - 0.8 * s, gy - h - 16 * s, 1.6 * s, 12 * s);          // Fahnenmast
    ctx.fillStyle = COL.brass; ctx.fillRect(cx + 0.8 * s, gy - h - 16 * s, 6 * s, 4 * s);
  } else if (kind === 'kontor'){
    const w = 16 * s, h = 14 * s, x = cx - w / 2;
    ctx.fillRect(x, gy - h, w, h);
    ctx.beginPath(); ctx.moveTo(x - 1 * s, gy - h); ctx.lineTo(x + w / 2, gy - h - 5 * s); ctx.lineTo(x + w + 1 * s, gy - h); ctx.fill();
    ctx.fillStyle = COL.brass; ctx.beginPath(); ctx.arc(cx, gy - h / 2, 3 * s, 0, Math.PI * 2); ctx.fill();   // Münze
  } else if (kind === 'universitaet'){
    const w = 20 * s, x = cx - w / 2;
    ctx.fillRect(x, gy - 3 * s, w, 3 * s);
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 1.5 * s + i * 5.3 * s, gy - 12 * s, 2.2 * s, 9 * s);
    ctx.fillRect(x - 1 * s, gy - 14 * s, w + 2 * s, 2.5 * s);
    ctx.beginPath(); ctx.moveTo(x - 1 * s, gy - 14 * s); ctx.lineTo(cx, gy - 20 * s); ctx.lineTo(x + w + 1 * s, gy - 14 * s); ctx.fill();
  }
}

/* Trefferflächen für Klicks, in Weltpixeln; beim Zeichnen des Reichs gefüllt */
let plotRects = [], sectionRects = [];
function drawRealm(){
  const S = G.S, s = realmSize(), x0 = PAD, y0 = PAD, wt = Math.max(8, s * 0.06), gap = Math.max(4, s * 0.025);
  ctx.fillStyle = COL['surface-2']; ctx.fillRect(x0, y0, s, s);
  // Parzellen im 3×3-Raster
  const inner = s - 2 * wt - 4 * gap, cell = inner / C.GRID_SIZE;
  plotRects = [];
  for (let i = 0; i < KlammerCore.SLOTS; i++){
    const r = Math.floor(i / C.GRID_SIZE), c = i % C.GRID_SIZE;
    const px = x0 + wt + gap + c * (cell + gap), py = y0 + wt + gap + r * (cell + gap);
    plotRects.push({ i, x: px, y: py, w: cell, h: cell });
    const on = !!sel && sel.kind === 'plot' && sel.i === i, sl = S.slots[i];
    ctx.fillStyle = sl ? COL.surface : COL.bg; ctx.fillRect(px, py, cell, cell);
    ctx.strokeStyle = on ? COL.brass : COL['rule-strong']; ctx.lineWidth = on ? 3 : 1;
    if (!sl) ctx.setLineDash([4, 4]);
    ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
    ctx.setLineDash([]);
    if (sl) drawBuilding(sl.type, px + cell / 2, py + cell * 0.72, cell / 34);
    else {
      ctx.fillStyle = COL['ink-faint'];
      const k = cell * 0.18, t2 = Math.max(2, cell * 0.04);
      ctx.fillRect(px + cell / 2 - k, py + cell / 2 - t2 / 2, 2 * k, t2);
      ctx.fillRect(px + cell / 2 - t2 / 2, py + cell / 2 - k, t2, 2 * k);
    }
  }
  // Mauer rundherum; die rechte Seite besteht aus den drei Abschnitten (REQ-13)
  ctx.fillStyle = COL.steel;
  ctx.fillRect(x0, y0, s, wt); ctx.fillRect(x0, y0 + s - wt, s, wt); ctx.fillRect(x0, y0, wt, s);
  sectionRects = [];
  for (let l = 0; l < C.LANE_COUNT; l++){
    const top = laneTop(l), h = laneH(), sx0 = x0 + s - wt, sec = S.sections[l], max = G.sectionMax(l), frac = Math.max(0, sec.hp) / max;
    sectionRects.push({ lane: l, x: sx0 - wt, y: top, w: wt * 3, h });
    if (sec.hp > 0 || l === GATE){
      ctx.fillStyle = COL.steel; ctx.fillRect(sx0, top, wt, h);
      // Schäden sichtbar: Risse, je mehr Schaden desto mehr
      const cracks = Math.round((1 - frac) * 8);
      ctx.fillStyle = COL['rust-soft'];
      for (let k = 0; k < cracks; k++) ctx.fillRect(sx0 + (k % 2) * wt * 0.45, top + h * (0.08 + 0.11 * k), wt * 0.55, Math.max(2, h * 0.04));
      if (l === GATE){ ctx.fillStyle = COL.bg; ctx.fillRect(sx0 + wt * 0.2, top + h * 0.3, wt * 0.6, h * 0.4); }
    } else {
      ctx.fillStyle = COL['rule-strong'];            // Trümmer der gefallenen Mauer
      for (let k = 0; k < 5; k++) ctx.fillRect(sx0 + (k % 2) * wt * 0.4, top + h * (0.1 + 0.18 * k), wt * 0.6, h * 0.1);
    }
    if (G.FX.baseFlash.p[l] > 0){ ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(sx0, top, wt, h); }
    if (sel && sel.kind === 'section' && sel.lane === l){ ctx.strokeStyle = COL.brass; ctx.lineWidth = 3; ctx.strokeRect(sx0 - 2, top + 1, wt + 4, h - 2); }
    if (C.TOWER_LANES.includes(l) && G.towerBuilt(l)){
      const tsz = wt * 1.4;
      ctx.fillStyle = G.towerActive(l) ? COL.ink : COL['ink-faint'];
      ctx.fillRect(sx0 + wt / 2 - tsz / 2, top + h / 2 - tsz / 2, tsz, tsz);
      ctx.fillStyle = COL.bg; ctx.fillRect(sx0 + wt / 2 - tsz / 6, top + h / 2 - tsz / 6, tsz / 3, tsz / 3);
    }
    hpBar(sx0 + wt + 4, top + 6, Math.min(60, h * 0.5), frac, COL.steel);
  }
}
function drawLanes(){
  const x0 = realmR(), x1 = wx(W - EBW);
  for (let l = 0; l < C.LANE_COUNT; l++){
    const top = laneTop(l), h = laneH();
    ctx.fillStyle = l % 2 ? COL.surface : COL.bg; ctx.fillRect(x0, top, x1 - x0, h);
    ctx.fillStyle = COL.rule;
    for (let x = PBW + 100; x < W - EBW; x += 100) ctx.fillRect(wx(x), top + h - 6, 1, 4);
  }
  ctx.strokeStyle = COL['rule-strong']; ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
  for (let l = 1; l < C.LANE_COUNT; l++){ ctx.beginPath(); ctx.moveTo(x0, laneTop(l)); ctx.lineTo(x1, laneTop(l)); ctx.stroke(); }
  ctx.setLineDash([]);
}
function drawEnemyBase(){
  const S = G.S, x0 = wx(W - EBW), w = wx(W) - x0, top = PAD, h = ch - 2 * PAD;
  ctx.fillStyle = COL.rust; ctx.fillRect(x0, top, w, h);
  ctx.fillStyle = COL.surface;
  for (let l = 0; l < C.LANE_COUNT; l++) ctx.fillRect(x0 + 4, laneMid(l) - 10, Math.min(12, w * 0.3), 20);
  if (G.FX.baseFlash.e > 0){ ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, top, w - 2, h); }
  ctx.fillStyle = COL.ink; ctx.fillRect(x0 + w / 2 - 6, laneMid(GATE) - 6, 12, 12);
  hpBar(x0 - 70, top + 4, 64, S.enemyBaseHp / G.diffCfg().enemyBaseHp, COL.rust);
}
/* Position einer Einheit: Weltpixel x, Mitte der (auch halben) Lane plus Platz in der Reihe quer zur Lane (REQ-42) */
function unitPos(u){
  let lane = u.laneF ?? u.lane;
  const toGate = u.side === 'p' || (u.lane !== GATE && !G.sectionUp(u.lane));
  if (toGate){ const p = Math.max(0, Math.min(1, (u.x - PBW) / ENTRY)); lane = GATE + (lane - GATE) * p; }
  return { x: wx(u.x), y: laneMid(lane) + (G.lateralOf(u) - u.laneF) * laneH() };
}
const LUNGE_S = 0.18;
/* Gezeichnete Position folgt der Logik-Position weich (REQ-6.01, Ursache 5): Aufrücken und Platzwechsel springen nicht, sondern gleiten.
   Totzone UI.unitEaseSnapPx; bei reduzierter Bewegung ohne Nachführen. Nur Darstellung, nicht im Spielstand. */
const shown = new Map();
let easeK = 1;
function easedPos(u){
  const p = unitPos(u), s = shown.get(u.id);
  if (!s || reduceMotion){ shown.set(u.id, { x: p.x, y: p.y, seen: true }); return p; }
  s.x += (p.x - s.x) * easeK; s.y += (p.y - s.y) * easeK; s.seen = true;
  if (Math.abs(p.x - s.x) < C.UI.unitEaseSnapPx) s.x = p.x;
  if (Math.abs(p.y - s.y) < C.UI.unitEaseSnapPx) s.y = p.y;
  return { x: s.x, y: s.y };
}
/* Für die Browser-Prüfung: gezeichnete Positionen je Einheit (ohne Ausfallschritt) */
function drawnPositions(){ return [...shown].map(([id, v]) => ({ id, x: v.x, y: v.y })); }
function drawUnit(u){
  const p = easedPos(u), r = Math.max(3.5, Math.min(8, laneH() * 0.055)), dir = u.side === 'p' ? 1 : -1;
  const lt = G.FX.lunge.get(u.id);
  if (lt !== undefined && !reduceMotion) p.x += dir * r * 0.9 * Math.sin(Math.PI * lt / LUNGE_S);   // Ausfallschritt im Nahkampf (REQ-5.05)
  if (p.x < realmR() - 4) return;                        // noch im Tor
  ctx.fillStyle = u.flash > 0 ? COL.ink : (u.side === 'p' ? COL.steel : COL.rust);
  if (u.type === 'schild'){
    ctx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r);                                                // Schildträger: Quadrat mit breitem Schild
    ctx.fillRect(p.x + dir * r * 1.1 - (dir < 0 ? r * 0.7 : 0), p.y - r * 1.3, r * 0.7, r * 2.6);
  } else if (!u.ranged){
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();                       // Nahkämpfer: Kreis mit Schild
    ctx.fillRect(p.x + dir * r * 0.9 - (dir < 0 ? r * 0.5 : 0), p.y - r, r * 0.5, r * 2);
  } else {
    ctx.beginPath(); ctx.moveTo(p.x + dir * r * 1.2, p.y); ctx.lineTo(p.x - dir * r, p.y - r); ctx.lineTo(p.x - dir * r, p.y + r);   // Fernkämpfer: Dreieck
    ctx.closePath(); ctx.fill();
  }
  if (u.hp < u.maxHp){
    ctx.fillStyle = COL['surface-2']; ctx.fillRect(p.x - r, p.y - r - 4, 2 * r, 2);
    ctx.fillStyle = u.side === 'p' ? COL.steel : COL.rust; ctx.fillRect(p.x - r, p.y - r - 4, 2 * r * Math.max(0, u.hp / u.maxHp), 2);
  }
}
/* Markierungspfeil am Rand, wenn ein Abschnitt außerhalb des Bildes Schaden nimmt (REQ-46) */
function drawEdgeMarkers(now){
  const S = G.S;
  for (const r of sectionRects){
    if (r.x + r.w > Cam.x) continue;
    if (S.t - S.sections[r.lane].lastHit > C.EDGE_MARKER_S) continue;
    const y = r.y + r.h / 2, x = Cam.x + 6, a = reduceMotion ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(now / 160));
    ctx.globalAlpha = a; ctx.fillStyle = COL.rust;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y - 11); ctx.lineTo(x + 16, y + 11); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
function draw(realDt, now){
  const FX = G.FX;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, cw, ch);
  ctx.setTransform(dpr, 0, 0, dpr, -Cam.x * dpr, 0);
  drawLanes();
  drawRealm();
  drawEnemyBase();
  for (let l = 0; l < C.LANE_COUNT; l++) FX.baseFlash.p[l] = Math.max(0, FX.baseFlash.p[l] - realDt);
  FX.baseFlash.e = Math.max(0, FX.baseFlash.e - realDt);
  const left = Cam.x - 40, right = Cam.x + cw + 40;
  easeK = 1 - Math.exp(-realDt / C.UI.unitEaseS);
  for (const v of shown.values()) v.seen = false;
  for (const u of G.S.units){ const x = wx(u.x); if (x > left && x < right) drawUnit(u); }
  for (const [id, v] of shown) if (!v.seen) shown.delete(id);         // außerhalb des Bildes oder gefallen: beim nächsten Auftauchen ohne Gleiten
  for (const [id, lt] of FX.lunge){ if (lt + realDt >= LUNGE_S) FX.lunge.delete(id); else FX.lunge.set(id, lt + realDt); }
  FX.shots = FX.shots.filter(s => (s.t += realDt) < s.dur);
  for (const s of FX.shots){
    const p = s.t / s.dur, y1 = laneMid(s.lane ?? GATE);
    if (s.turret){
      const x0 = s.lane0 === undefined ? wx(s.x0) : (s.x0 >= W - EBW - 1 ? wx(s.x0) : realmR() - 4), y0 = laneMid(s.lane0 ?? GATE);
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 1 - p; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(wx(s.x1), y1); ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      // eigenes Geschoss je Wurf: vom Platz des Werfers zum Platz des Ziels, im Bogen (REQ-6.02)
      const x = wx(s.x0 + (s.x1 - s.x0) * p);
      const ya = s.y0 != null ? laneMid(s.y0) : y1, yb = s.y1 != null ? laneMid(s.y1) : y1;
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, ya + (yb - ya) * p - Math.sin(p * Math.PI) * laneH() * 0.12, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  FX.fx = FX.fx.filter(f => (f.t += realDt) < Math.max(0.4, C.UI.fadeS));
  if (!reduceMotion){
    for (const f of FX.fx){
      // gefallene Einheit verblasst an ihrer Stelle (REQ-5.10)
      if (f.type && f.t < C.UI.fadeS){
        ctx.globalAlpha = 0.5 * (1 - f.t / C.UI.fadeS); ctx.fillStyle = f.side === 'p' ? COL.steel : COL.rust;
        const r = Math.max(3.5, Math.min(8, laneH() * 0.055)); ctx.fillRect(wx(f.x) - r, laneMid(f.lane) - r * 0.6, 2 * r, r * 1.2);
        ctx.globalAlpha = 1;
      }
      if (f.t >= 0.4) continue;
      const p = f.t / 0.4;
      ctx.strokeStyle = f.side === 'p' ? COL.steel : COL.rust;
      ctx.globalAlpha = 1 - p; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(wx(f.x), laneMid(f.lane), 3 + p * 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  drawEdgeMarkers(now);
  ctx.fillStyle = COL['ink-faint'];
  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right'; ctx.fillText(t('lane.enemy'), wx(W - EBW) - 6, ch - 4);
}

/* Einzige Umrechnung Bildschirm → Welt (REQ-5.01): CSS-Pixel relativ zur Canvas, CSS-Skalierung der Canvas und Kameraversatz.
   devicePixelRatio wirkt nur auf die Auflösung der Zeichenfläche, nicht auf diese Koordinaten. */
function screenToWorld(clientX, clientY){
  const r = cv.getBoundingClientRect();
  return { x: (clientX - r.left) * (cw / r.width) + Cam.x, y: (clientY - r.top) * (ch / r.height) };
}
function worldToScreen(x, y){
  const r = cv.getBoundingClientRect();
  return { x: r.left + (x - Cam.x) * (r.width / cw), y: r.top + y * (r.height / ch) };
}
function syncScrollbar(){
  const v = String(Math.round(Cam.max() ? Cam.x / Cam.max() * 1000 : 0)), el = $('worldScroll');
  if (el.value !== v && document.activeElement !== el) el.value = v;
}
/* Bildzeit messen (REQ-44): Median über n Zeichnungen, für die Browser-Prüfung */
function benchDraw(n = 60){
  const times = [];
  // getImageData erzwingt das Ausführen der Zeichenbefehle, sonst misst man nur deren Aufzeichnung
  for (let i = 0; i < n; i++){ const t0 = performance.now(); draw(1 / 60, t0); ctx.getImageData(0, 0, 1, 1); times.push(performance.now() - t0); }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

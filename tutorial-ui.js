/* Klammerfront – Tutorial „Erste Schritte“, Anzeige (REQ-T.02, T.04): Quartiermeister in der Spielwelt, pulsierender Rahmen um das Ziel,
   Sprechblase, Randpfeil, Knopf „Überspringen“. Die Schrittlogik steht in tutorial.js (ohne Seitenzugriff), die Schritte in
   data/tutorial-steps.js. Hier wird nichts gesperrt und nichts abgedunkelt; das Tutorial wechselt nie selbst den Reiter (REQ-5.03).
   Lädt nach panels.js. Gezeichnet wird mit den vorhandenen Canvas- und CSS-Mitteln, ohne eigene Grafikdateien. */
'use strict';

const TutUI = (() => {
  const T = C.TUTORIAL;
  const bubble = $('tutBubble'), bubbleText = $('tutBubbleText');
  let marked = [];                    // Elemente mit Rahmen
  let target = null;                  // aktuelles Ziel: { els, world, textKey, anchor }
  let demo = null;                    // laufende Vorführung: { id, kind, t0, clicked }
  let fig = null;                     // Bildschirmrechteck der Figur (für die Sprechblase)
  let farewellTimer = null, farewellEnd = 0, camByTutorial = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hasWorld = () => cv && cw > 0;

  /* ---------- Ziel des aktuellen Schritts, aus dem Zustand der Oberfläche abgeleitet ---------- */
  const tabBtn = id => tabEls[id].btn;
  function resolve(view){
    if (view.phase === 'farewell') return { els: [], world: null, textKey: view.step.textKey, anchor: 'figure' };
    if (view.phase !== 'step') return null;
    const S = G.S, step = view.step, own = el => ({ els: [el], world: null, textKey: step.textKey, anchor: el });
    switch (step.target){
      case 'click': return own($('clickBtn'));
      case 'plot': {
        if (sel && sel.kind === 'plot' && !S.slots[sel.i]){
          // Platz gewählt: die Fabrik-Option im Kontextkopf; liegt der Kontextkopf in einem anderen Reiter, zuerst dessen Reiterknopf
          const p = ctxVisible() ? picks.find(q => q.type === 'fabrik') : null;
          return p ? own(p.b) : own(tabBtn('build'));
        }
        const i = S.slots.findIndex(x => !x);
        if (i < 0) return null;
        return { els: activeTab === 'build' ? [gridEls[i].btn] : [], world: i, textKey: step.textKey, anchor: 'figure' };
      }
      case 'units': {
        if (activeTab !== 'army') return own(tabBtn('army'));
        // fehlt das Material, zeigt der Quartiermeister zuerst auf das Klickfeld
        if (S.material < G.unitCost('laeufer') && !G.supplyFull()) return Object.assign(own($('clickBtn')), { textKey: TUT_STEPS_FIRST_TEXT() });
        return own(optEls.unit_laeufer.btn);
      }
      case 'waves': {
        // Knopf zum sofortigen Ausschicken, falls das Spiel einen hat und er jetzt wirkt (z. B. „Welle vorziehen“ mit Kaserne)
        if (G.has('kaserne') && !G.waveRushBlock()) return activeTab !== 'army' ? own(tabBtn('army')) : own(waveRushBtn);
        return own($('hudWaves'));
      }
    }
    return null;
  }
  const TUT_STEPS_FIRST_TEXT = () => Tutorial.steps[0].textKey;

  /* ---------- Vorführung (Schritt 1 und 2): erst die Handlung, dann die Zeile ---------- */
  function maybeStartDemo(view){
    if (demo || view.phase !== 'step' || !view.step.demo || Tutorial.demoShown(view.step.id)) return;
    if (paused || modalOpen || G.S.status !== 'running' || G.S.pendingDraft || !hasWorld()) return;
    demo = { id: view.step.id, kind: view.step.demo, t0: performance.now() + (G.S.t < 2 ? T.startDelayMs : 200), clicked: false };
  }
  function endDemo(){ if (!demo) return; Tutorial.markDemoShown(demo.id); demo = null; requestRender(); }
  /* Je Bild: Zeitablauf der Vorführung und Lage der Sprechblase */
  function frame(now){
    if (demo){
      if (Tutorial.isDone(demo.id)) endDemo();
      else {
        const p = (now - demo.t0) / T.demoMs;
        if (p >= 0.5 && demo.kind === 'click' && !demo.clicked){
          demo.clicked = true;
          Session.silently(() => Tutorial.silently(() => { if (G.doClick()) requestRender(); }));    // die Figur fertigt einmal; der Zähler steigt, zählt aber nicht für den Spieler
        }
        if (p >= 1) endDemo();
      }
    }
    placeBubble();
  }

  /* ---------- Rahmen und Zeile (aus renderTutorial, höchstens zehnmal je Sekunde) ---------- */
  function setMarked(els){
    for (const el of marked) if (!els.includes(el)) el.classList.remove('tut-target');
    for (const el of els) el.classList.add('tut-target');
    marked = els.slice();
  }
  function render(){
    const view = Tutorial.view(), skip = $('tutSkipBtn');
    setHidden(skip, !Tutorial.active());
    document.documentElement.style.setProperty('--tut-pulse', T.pulseMs + 'ms');
    document.documentElement.style.setProperty('--tut-bubble-max', T.bubbleMaxPx + 'px');
    if (view.phase === 'off'){ target = null; demo = null; setMarked([]); bubble.hidden = true; return; }
    maybeStartDemo(view);
    if (view.phase === 'farewell' && !farewellTimer){
      farewellEnd = performance.now() + T.farewellMs;
      farewellTimer = setTimeout(() => { farewellTimer = null; finish('completed'); }, T.farewellMs);
    }
    target = demo ? null : resolve(view);                           // während der Vorführung noch kein Rahmen und keine Zeile
    setMarked(target ? target.els.filter(el => el.offsetParent !== null) : []);
    const show = !!target && !modalOpen;
    if (show) setText(bubbleText, t(target.textKey));
    setHidden(bubble, !show);
    bubble.setAttribute('aria-label', t('tut.name'));
  }
  function anchorRect(){
    if (!target) return null;
    if (target.anchor === 'figure') return fig;
    const el = target.anchor;
    if (!el || el.offsetParent === null) return null;
    return el.getBoundingClientRect();
  }
  function placeBubble(){
    if (bubble.hidden) return;
    const a = anchorRect();
    if (!a){ bubble.style.visibility = 'hidden'; return; }
    bubble.style.visibility = '';
    const r = bubble.getBoundingClientRect(), gap = T.bubbleGapPx, cx = a.left + a.width / 2;
    let x = cx - r.width / 2, y = a.top - r.height - gap, cls = 'above';
    if (y < 4){ y = a.bottom + gap; cls = 'below'; }
    x = clamp(x, 8, window.innerWidth - 8 - r.width);
    y = clamp(y, 4, window.innerHeight - 4 - r.height);
    bubble.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    bubble.style.setProperty('--tail-x', clamp(cx - x, 14, Math.max(14, r.width - 14)) + 'px');
    bubble.classList.toggle('above', cls === 'above'); bubble.classList.toggle('below', cls === 'below');
  }

  /* ---------- Quartiermeister, Zeigelinie und Rahmen in der Spielwelt (aus render.js, je Bild) ---------- */
  function draw(now){
    const view = Tutorial.view();
    if (view.phase === 'off'){ fig = null; return; }
    const s = Math.max(0.8, Math.min(1.4, laneH() / 90)), fx = realmR() + 30 * s, bob = reduceMotion ? 0 : Math.sin(now / 420) * 1.6 * s;
    const fy = laneMid(GATE) - laneH() * 0.36 + bob;
    const fade = view.phase === 'farewell' ? clamp((farewellEnd - now) / 700, 0, 1) : 1;
    const dp = demo ? (now - demo.t0) / T.demoMs : -1;                    // < 0: noch nicht begonnen, 0 … 1: läuft
    ctx.save();
    ctx.globalAlpha = 0.92 * fade;
    // Schein, damit die Figur auch auf dem Bauplatz-Grau auffällt
    ctx.fillStyle = COL['brass-soft']; ctx.beginPath(); ctx.arc(fx, fy - 6 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
    // Körper (Mantel), Kopf, Kappe in Messing, Stab als Zeigegerät
    ctx.fillStyle = COL.steel;
    ctx.beginPath(); ctx.moveTo(fx - 4.5 * s, fy - 9 * s); ctx.lineTo(fx + 4.5 * s, fy - 9 * s); ctx.lineTo(fx + 7.5 * s, fy + 8 * s); ctx.lineTo(fx - 7.5 * s, fy + 8 * s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(fx, fy - 14 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COL.brass;
    ctx.beginPath(); ctx.moveTo(fx - 6.5 * s, fy - 16 * s); ctx.lineTo(fx, fy - 25 * s); ctx.lineTo(fx + 6.5 * s, fy - 16 * s); ctx.closePath(); ctx.fill();
    // Vorführen „Fertigen“: der Arm geht nach unten, ein Ring breitet sich aus
    const press = demo && demo.kind === 'click' && dp >= 0.35 && dp < 0.7 ? 1 : 0;
    ctx.strokeStyle = COL.brass; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fx + 4 * s, fy - 6 * s); ctx.lineTo(fx + 12 * s, fy - 10 * s + press * 9 * s); ctx.stroke();
    if (demo && demo.kind === 'click' && dp >= 0.5 && dp < 1){
      const q = (dp - 0.5) / 0.5;
      ctx.globalAlpha = (1 - q) * fade; ctx.beginPath(); ctx.arc(fx + 12 * s, fy - 1 * s, (4 + q * 14) * s, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 0.92 * fade;
    }
    ctx.restore();
    fig = (() => { const p = worldToScreen(fx, fy - 26 * s), q = worldToScreen(fx, fy + 8 * s); return { left: p.x - 9, right: p.x + 9, top: p.y, bottom: q.y, width: 18, height: q.y - p.y }; })();
    // Ziel in der Welt: pulsierender Rahmen um den Bauplatz, Zeigelinie während der Vorführung, Randpfeil außerhalb des Bildes
    const tw = target ? target.world : (demo && demo.kind === 'plot' ? G.S.slots.findIndex(x => !x) : null);
    if (tw !== null && tw >= 0 && plotRects[tw]){
      const r = plotRects[tw], pulse = reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(now * 2 * Math.PI / T.pulseMs);
      if (demo && demo.kind === 'plot' && dp >= 0.15){
        ctx.save(); ctx.strokeStyle = COL.brass; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -now / 40;
        ctx.globalAlpha = Math.min(1, (dp - 0.15) / 0.2); ctx.beginPath(); ctx.moveTo(fx - 6 * s, fy - 8 * s); ctx.lineTo(r.x + r.w / 2, r.y + r.h / 2); ctx.stroke(); ctx.restore();
      }
      if (target || (demo && dp >= 0.3)){
        ctx.save(); ctx.strokeStyle = COL.brass; ctx.lineWidth = 2 + 2 * pulse; ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); ctx.restore();
      }
      const cxw = r.x + r.w / 2, cy = r.y + r.h / 2;
      if (cxw < Cam.x || cxw > Cam.x + cw){
        const dir = cxw < Cam.x ? -1 : 1, ax = dir < 0 ? Cam.x + 6 : Cam.x + cw - 6;
        ctx.save(); ctx.fillStyle = COL.brass; ctx.globalAlpha = 0.6 + 0.4 * pulse;
        ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(ax - dir * 16, cy - 11); ctx.lineTo(ax - dir * 16, cy + 11); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
  }

  /* ---------- Fortschritt aus der Spiellogik (G.on) ---------- */
  function onProgress(done){
    for (const id of done){
      // Schritt „Welle ausschicken“ erledigt: Schonfrist endet, die Gegnerwelle rückt gleichzeitig aus (im selben Takt, REQ-T.03);
      // die Kamera folgt dem Ausmarsch, sofern der Spieler sie nicht selbst bewegt hat (REQ-T.01)
      if (id === 'ausruecken'){
        G.releaseHold();
        if (!Cam.touched && !Cam.follow){ Cam.follow = true; camByTutorial = true; }
      }
    }
    requestRender();
  }
  function releaseCamera(){ if (camByTutorial){ Cam.follow = false; camByTutorial = false; } }
  /* Ende: nach der Abschiedszeile (completed) oder per Knopf (skipped) */
  function finish(kind){
    clearTimeout(farewellTimer); farewellTimer = null; demo = null;
    if (kind === 'skipped'){ Tutorial.skip(); G.releaseHold(true); } else Tutorial.end(kind);
    releaseCamera();
    requestRender();
  }
  function skip(){ if (Tutorial.active()) finish('skipped'); }
  /* Fehlklick: Zeigerdruck außerhalb des hervorgehobenen Ziels zählt für das Sitzungsprotokoll (REQ-T.07) */
  function onPointer(e){
    if (!Tutorial.active() || e.button !== 0 || modalOpen || !target || demo) return;
    const el = e.target instanceof Element ? e.target : null;
    if (!el || el.closest('#tutSkipBtn') || el.closest('.modal')) return;
    if (target.els.some(x => x.contains(el))) return;
    if (target.world !== null && target.world !== undefined && el === cv){
      const p = screenToWorld(e.clientX, e.clientY), r = plotRects[target.world];
      if (r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return;
    }
    Tutorial.misclick();
  }
  function init(){
    G.on((name, data) => { const done = Tutorial.event(name, data, G.S.t); if (done.length) onProgress(done); });
    $('tutSkipBtn').addEventListener('click', skip);
    document.addEventListener('pointerdown', onPointer, true);
  }
  /* Neue Partie: nicht übernommene Zustände der Anzeige zurücksetzen */
  function reset(){ clearTimeout(farewellTimer); farewellTimer = null; demo = null; target = null; setMarked([]); releaseCamera(); Cam.touched = false; }
  return { init, render, draw, frame, skip, reset, get target(){ return target; }, get demo(){ return demo; } };
})();
const renderTutorial = TutUI.render, drawTutorial = TutUI.draw, tutorialFrame = TutUI.frame;

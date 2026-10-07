/* Klammerfront – Tutorial „Erste Schritte“, Anzeige (REQ-T.02, T.04, T2.02 – T2.07): Quartiermeister in der Spielwelt, pulsierender Rahmen um das Ziel,
   Sprechblase mit Erzählung und Auftrag, Randpfeil, Knopf „Überspringen“. Die Schrittlogik steht in tutorial.js (ohne Seitenzugriff), die Schritte in
   data/tutorial-steps.js. Hier wird nichts gesperrt und nichts abgedunkelt; das Tutorial wechselt nie selbst den Reiter (REQ-5.03).
   Lädt nach panels.js. Gezeichnet wird mit den vorhandenen Canvas- und CSS-Mitteln, ohne eigene Grafikdateien. */
'use strict';

const TutUI = (() => {
  const T = C.TUTORIAL;
  const bubble = $('tutBubble'), narrEl = $('tutBubbleNarr'), taskEl = $('tutBubbleTask'), moreEl = $('tutBubbleMore');
  let marked = [];                    // Elemente mit Rahmen
  let target = null;                  // aktuelles Ziel: { els, world, narrKey, taskKey, anchor, clickable }
  let demo = null;                    // laufende Vorführung: { id, kind, t0, clicked }
  let fig = null;                     // Bildschirmrechteck der Figur (für die Sprechblase)
  let camByTutorial = false, rushShown = false;     // rushShown: Schritt 4 zeigte einen Knopf zum sofortigen Ausschicken
  let bubbleKey = '', shownAt = 0, prevPhase = 'off', greetStart = 0, leaveStart = 0, dodge = 0, lastDraw = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hasWorld = () => cv && cw > 0;
  /* Text je Pacing-Modus überschreibbar (REQ-T2.05): Schlüssel mit Modus-Suffix, sonst der Standard */
  const tx = key => { const m = G.S.pacing; return m && m !== 'standard' && KF_I18N[lang] && KF_I18N[lang][key + '.' + m] !== undefined ? t(key + '.' + m) : t(key); };

  /* ---------- Ziel des aktuellen Schritts, aus dem Zustand der Oberfläche abgeleitet ---------- */
  const tabBtn = id => tabEls[id].btn;
  function resolve(view){
    // Begrüßung und Abschied: Sprechblasen ohne Auftrag an der Figur, ein Klick zeigt die nächste (REQ-T2.02, T2.05)
    if (view.phase === 'greet' || view.phase === 'farewell') return { els: [], world: null, narrKey: view.textKey, taskKey: null, anchor: 'figure', clickable: true };
    if (view.phase !== 'step') return null;
    const S = G.S, step = view.step, own = el => ({ els: [el], world: null, narrKey: step.narrKey, taskKey: step.taskKey, anchor: el, clickable: false });
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
        return { els: activeTab === 'build' ? [gridEls[i].btn] : [], world: i, narrKey: step.narrKey, taskKey: step.taskKey, anchor: 'figure', clickable: false };
      }
      case 'units': {
        if (activeTab !== 'army') return own(tabBtn('army'));
        // fehlt das Material, zeigt der Quartiermeister zuerst auf das Klickfeld (nur der Auftrag, Erzählung wird nie nachgeholt)
        if (S.material < G.unitCost('laeufer') && !G.supplyFull()) return Object.assign(own($('clickBtn')), { narrKey: null, taskKey: Tutorial.steps[0].taskKey });
        return own(optEls.unit_laeufer.btn);
      }
      case 'waves': {
        // Knopf zum sofortigen Ausschicken, falls das Spiel einen hat und er jetzt wirkt (z. B. „Welle vorziehen“ mit Kaserne)
        rushShown = G.has('kaserne') && !G.waveRushBlock();
        if (rushShown) return activeTab !== 'army' ? own(tabBtn('army')) : own(waveRushBtn);
        return own($('hudWaves'));
      }
      case 'cards': {
        // erste Kartenwahl: Sprechblase am Reiter „Karten“, der sich selbst öffnet; sie liegt über dem Reiter und verdeckt keine Karte
        if (Stage.on()){                                            // Kartenbühne: die Sprechblase sitzt über der Bühne und verdeckt keine Karte (REQ-KP.03)
          if (!S.pendingDraft) return null;
          if (Stage.folded) return own($('deckBtn'));
          return { els: [], world: null, narrKey: step.narrKey, taskKey: step.taskKey, anchor: $('stageHead'), clickable: false };
        }
        if (!S.pendingDraft || !tabVisible('cards')) return null;
        return own(tabBtn('cards'));
      }
    }
    return null;
  }

  /* ---------- Vorführung (Schritt 1 und 2): erst die Handlung, dann die Zeile ---------- */
  function maybeStartDemo(view){
    if (demo || view.phase !== 'step' || !view.step.demo || Tutorial.demoShown(view.step.id)) return;
    if (Tutorial.progress(view.step.id) > 0){ Tutorial.markDemoShown(view.step.id); return; }       // der Spieler war schneller: keine Vorführung
    if (paused || modalOpen || G.S.status !== 'running' || G.S.pendingDraft || !hasWorld()) return;
    demo = { id: view.step.id, kind: view.step.demo, t0: performance.now() + (G.S.t < 2 ? T.startDelayMs : 200), clicked: false };
  }
  function endDemo(){ if (!demo) return; Tutorial.markDemoShown(demo.id); demo = null; requestRender(); }
  /* Sprechblase ohne Auftrag: nächste zeigen bzw. Begrüßung beenden (Klick oder Ablauf der Zeit) */
  function advanceBubble(byClick){
    const v = Tutorial.view();
    if (v.phase !== 'greet' && v.phase !== 'farewell') return;
    if (byClick) Tutorial.noteBubbleClick();
    if (v.phase === 'greet') Tutorial.advanceGreeting(); else Tutorial.advanceFarewell();
    requestRender();
  }
  /* Je Bild: Zeitablauf der Vorführung, Auto-Weiter der Sprechblasen, Abgang der Figur, Lage der Sprechblase */
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
    const v = Tutorial.view();
    if ((v.phase === 'greet' || v.phase === 'farewell') && !paused && !modalOpen && bubbleKey && now - shownAt >= T.greetMs) advanceBubble(false);
    if (v.phase === 'leaving'){
      if (!leaveStart) leaveStart = now;
      if (now - leaveStart >= T.leaveMs) finish('completed');
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
    const view = Tutorial.view(), skip = $('tutSkipBtn'), now = performance.now();
    setHidden(skip, !Tutorial.active());
    const root = document.documentElement.style;
    root.setProperty('--tut-pulse', T.pulseMs + 'ms'); root.setProperty('--tut-bubble-max', T.bubbleMaxPx + 'px'); root.setProperty('--tut-fade', T.fadeMs + 'ms');
    // Dauer der Begrüßung für das Sitzungsprotokoll (REQ-T2.02)
    if (view.phase === 'greet' && !greetStart) greetStart = now;
    if (prevPhase === 'greet' && view.phase !== 'greet' && greetStart){ Tutorial.noteGreeting(now - greetStart); greetStart = 0; }
    // Abschied: Der Quartiermeister steht vor dem Tor; die Kamera geht dafür einmal zum Reich zurück (nicht mehr folgen)
    if (view.phase === 'farewell' && prevPhase !== 'farewell'){ Cam.follow = false; Cam.goTo(0); camByTutorial = false; }
    prevPhase = view.phase;
    if (view.phase === 'off'){ target = null; demo = null; bubbleKey = ''; leaveStart = 0; greetStart = 0; setMarked([]); bubble.hidden = true; return; }
    maybeStartDemo(view);
    target = demo ? null : resolve(view);                           // während der Vorführung noch kein Rahmen und keine Zeile
    setMarked(target ? target.els.filter(el => el.offsetParent !== null) : []);
    const show = !!target && !modalOpen;
    if (show){
      const key = view.phase + ':' + (view.index ?? '') + ':' + (view.step ? view.step.id : '') + ':' + target.narrKey + ':' + target.taskKey + ':' + lang;
      setText(narrEl, target.narrKey ? tx(target.narrKey) : ''); setHidden(narrEl, !target.narrKey);
      setText(taskEl, target.taskKey ? tx(target.taskKey) : ''); setHidden(taskEl, !target.taskKey);
      setHidden(moreEl, !target.clickable);
      bubble.classList.toggle('clickable', target.clickable);
      if (target.clickable) bubble.setAttribute('title', t('tut.more')); else bubble.removeAttribute('title');
      if (key !== bubbleKey){                                       // neue Sprechblase: sanft einblenden (REQ-T2.07), Anzeigezeit beginnt
        bubbleKey = key; shownAt = now;
        bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
      }
    } else bubbleKey = '';
    setHidden(bubble, !show);
    bubble.setAttribute('aria-label', t('tut.name'));
  }
  function anchorRect(){
    if (!target) return null;
    if (target.anchor === 'figure'){
      // liegt die Figur außerhalb des Bildes (Kamera verschoben), zeigt die Sprechblase an den linken Rand der Welt
      const wr = $('world').getBoundingClientRect();
      if (!fig || fig.right < wr.left || fig.left > wr.right) return { left: wr.left + 30, right: wr.left + 50, top: wr.top + 10, bottom: wr.top + 40, width: 20, height: 30 };
      return fig;
    }
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
    const dt = lastDraw ? Math.min(0.1, (now - lastDraw) / 1000) : 0; lastDraw = now;
    const s = clamp(laneH() / 90, 0.8, 1.4) * T.guideScale, bob = reduceMotion ? 0 : Math.sin(now / 420) * 1.6 * s;
    let fx = realmR() + 30 * s, fy = laneMid(GATE) - laneH() * 0.36 + bob, fade = 1;
    // Weicht seitlich aus, wenn eine eigene Einheit beim Ausrücken in ihre Nähe kommt (REQ-T2.06)
    let near = false;
    for (const u of G.S.units){
      if (u.side !== 'p') continue;
      const p = shown.get(u.id); if (!p) continue;
      if (Math.abs(p.x - fx) < 24 * s && Math.abs(p.y - fy) < 32 * s){ near = true; break; }
    }
    dodge = clamp(dodge + (near ? 1 : -1) * dt * 5, 0, 1);
    fy -= dodge * laneH() * 0.5;
    // Abgang: zurück durch das Tor, dabei verblassen (REQ-T2.05)
    let leaveP = 0;
    if (view.phase === 'leaving'){
      leaveP = leaveStart ? clamp((now - leaveStart) / T.leaveMs, 0, 1) : 0;
      fx += (realmR() - 8 * s - fx) * leaveP; fy += (laneMid(GATE) - fy) * leaveP; fade = 1 - leaveP;
    }
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
    fig = (() => { const p = worldToScreen(fx, fy - 26 * s), q = worldToScreen(fx, fy + 8 * s); return { left: p.x - 9 * s, right: p.x + 9 * s, top: p.y, bottom: q.y, width: 18 * s, height: q.y - p.y }; })();
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
      // die Kamera folgt dem Ausmarsch, sofern Schritt 4 den Countdown zeigte und der Spieler die Kamera nicht selbst bewegt hat (REQ-T.01)
      if (id === 'ausruecken'){
        G.releaseHold();
        if (!rushShown && !Cam.touched && !Cam.follow){ Cam.follow = true; camByTutorial = true; }
      }
      if (id === 'schlacht') releaseCamera();                       // der Kampf ist entschieden
    }
    requestRender();
  }
  function releaseCamera(){ if (camByTutorial && !Cam.touched) Cam.follow = false; camByTutorial = false; }
  /* Ende: nach dem Abgang der Figur (completed) oder per Knopf (skipped, beendet auch Schonfrist und Kriegsbeute) */
  function finish(kind){
    demo = null; leaveStart = 0; greetStart = 0;
    if (kind === 'skipped'){ Tutorial.skip(); G.releaseHold(true); } else Tutorial.end(kind);
    releaseCamera();
    requestRender();
  }
  function skip(){ if (Tutorial.active()) finish('skipped'); }
  /* Fehlklick: Zeigerdruck außerhalb des hervorgehobenen Ziels zählt für das Sitzungsprotokoll (REQ-T.07); nur bei Schritten mit Auftrag */
  function onPointer(e){
    if (!Tutorial.active() || e.button !== 0 || modalOpen || !target || target.clickable || demo) return;
    const el = e.target instanceof Element ? e.target : null;
    if (!el || el.closest('#tutSkipBtn') || el.closest('.modal') || el.closest('#tutBubble')) return;
    if (target.els.some(x => x.contains(el))) return;
    if (target.world !== null && target.world !== undefined && el === cv){
      const p = screenToWorld(e.clientX, e.clientY), r = plotRects[target.world];
      if (r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return;
    }
    Tutorial.misclick();
  }
  function init(){
    G.on((name, data) => {
      const done = Tutorial.event(name, data, G.S.t); if (done.length) onProgress(done);
      if (name === 'xpBounty') floatNow('xp', data.n, t('tut.xpBounty', { n: fmt(data.n) }));   // Erfahrung als schwebende Zahl (REQ-T2.04)
    });
    $('tutSkipBtn').addEventListener('click', skip);
    bubble.addEventListener('click', () => { if (target && target.clickable) advanceBubble(true); });
    document.addEventListener('pointerdown', onPointer, true);
  }
  /* Neue Partie: nicht übernommene Zustände der Anzeige zurücksetzen */
  function reset(){ demo = null; target = null; bubbleKey = ''; leaveStart = 0; greetStart = 0; dodge = 0; prevPhase = 'off'; setMarked([]); releaseCamera(); Cam.touched = false; }
  return { init, render, draw, frame, skip, reset, get target(){ return target; }, get demo(){ return demo; } };
})();
const renderTutorial = TutUI.render, drawTutorial = TutUI.draw, tutorialFrame = TutUI.frame;

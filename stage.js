/* Klammerfront – Kartenbühne (REQ-KP.03): die Kartenwahl in der Bildmitte, Stapel am unteren Rand der Bildmitte.
   Der Arbeitsbereich wechselt keinen Reiter; der Reiter „Karten“ bleibt Sammlung (nur Ansicht). Spielzeit bei offener Bühne: KARTENBUEHNE.zeit
   (Standard Pause, wie in v0.6: core.js hält die Zeit an, solange eine Wahl offen ist). Texte nur aus den Sprachdateien, Zahlen aus config.js. */
'use strict';
const Stage = (() => {
  const K = C.KARTENBUEHNE;
  const flag = URL_PARAMS.get('buehne');
  const enabled = () => flag === '1' ? true : flag === '0' ? false : C.UI.kartenbuehne !== null && C.UI.kartenbuehne !== undefined ? !!C.UI.kartenbuehne : G.S.pacing === 'karten';
  let lvlKey = null, lvlOpenedAt = 0;                                     // erstes Öffnen der Bühne je Wahl: Bedenkzeit für das Sitzungsprotokoll
  let key = '', openedAt = -Infinity, folded = false, focusI = 0, lockMs = C.UI.draftLockMs, hover = -1, built = false, wasVisible = false;
  let leaving = false, chain = false, dealing = false, flyEls = [];
  let hoverMs = [], hoverAt = -1, hoverI = -1;                          // Zeit unter dem Zeiger je Karte (Protokoll, REQ-K2.08)
  const hoverStop = () => { if (hoverI >= 0 && hoverAt >= 0) hoverMs[hoverI] = (hoverMs[hoverI] || 0) + performance.now() - hoverAt; hoverI = -1; hoverAt = -1; };                      // Abräumen läuft; auf eine Wahl folgt gleich die nächste; fliegende Kopien der Karten
  const el = {};
  const ids = ['stage', 'stageFly', 'stageHead', 'stageCards', 'stageDetail', 'stageTools', 'stageReroll', 'stageLater', 'stageBans', 'cardSym', 'deckFill', 'deckCount', 'deckExpl'];
  const reveal = () => window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function on(){ return enabled(); }
  /* Bühne sichtbar (offene Wahl, nicht eingeklappt) */
  function visible(){ return on() && !!G.S.pendingDraft && G.S.status === 'running' && !folded && !!key; }
  function locked(){ return performance.now() - openedAt < lockMs; }

  function layout(){
    const w = window.innerWidth, st = document.documentElement.style;
    const cw = Math.min(K.kartenMaxPx, Math.max(K.kartenMinPx, Math.round(w * K.kartenBreitePct / 100)));
    st.setProperty('--kw', cw + 'px');
    st.setProperty('--stage-dim', String(K.abdunkelung));
    st.setProperty('--k-lift', K.hebenPct + '%');
    st.setProperty('--k-flip', K.aufdeckMs + 'ms');
    el.stage.classList.toggle('two-rows', w < K.zweiZeilenBisPx);
  }
  function symbol(o){ return K.symbole[o.category] || K.symbole.bonus; }
  const hasKey = k => !!(KF_I18N[lang] && KF_I18N[lang][k]);
  /* Eine Wirkungszeile auf der Karte (REQ-K2.03): nur die unmittelbare Wirkung, keine Folgekarten */
  function effLine(o, tier){
    return hasKey('kp.eff.' + o.id) ? t('kp.eff.' + o.id, optParams(o, tier)) : t(o.descKey, optParams(o, tier));
  }
  const hasDrawback = (o, tier) => !!(o.tiers[Math.min(tier, o.tiers.length) - 1] || {}).drawback;
  /* Rahmenfarbe = Seltenheit, Band = Kategorie der Karte */
  const bandWord = o => t('draft.cat.' + o.category);

  function build(d){
    const list = el.stageCards; list.innerHTML = '';
    const n = d.options.length;
    if (!hoverMs.length || hoverMs.length !== n) hoverMs = new Array(n).fill(0);
    d.options.forEach((id, i) => {
      const o = G.OPT[id], tier = G.cardTaken(id) + 1;
      const b = document.createElement('button');
      b.type = 'button'; b.className = ['kcard', cardClass(o)].join(' '); b.dataset.tooltip = 'draftopt:' + i; b.dataset.i = String(i);
      const rot = n > 1 ? (-K.faecherGrad + 2 * K.faecherGrad * i / (n - 1)) : 0;
      b.style.setProperty('--rot', rot.toFixed(2) + 'deg');
      b.style.setProperty('--delay', (i * K.aufdeckAbstandMs) + 'ms');
      const face = document.createElement('span'); face.className = 'kc-face';
      const head = document.createElement('span'); head.className = 'kc-head';
      const sym = document.createElement('i'); sym.className = 'kc-sym'; sym.setAttribute('aria-hidden', 'true'); sym.textContent = symbol(o);
      const fam = document.createElement('span'); fam.className = 'kc-fam'; fam.textContent = bandWord(o);
      const num = document.createElement('span'); num.className = 'kc-key'; num.textContent = String(i + 1);
      head.append(sym, fam, num);
      const nm = document.createElement('b'); nm.className = 'kc-name'; nm.textContent = cardName(o, tier);
      const art = document.createElement('span'); art.className = 'kc-art'; art.setAttribute('aria-hidden', 'true'); art.textContent = symbol(o);
      const ds = document.createElement('span'); ds.className = 'kc-desc'; ds.textContent = effLine(o, tier);
      const foot = document.createElement('span'); foot.className = 'kc-foot';
      const dots = document.createElement('span'); dots.className = 'kc-tier'; dots.setAttribute('aria-hidden', 'true');
      dots.textContent = '●'.repeat(tier) + '○'.repeat(o.tiers.length - tier);
      foot.append(dots);
      if (hasDrawback(o, tier)){ const r = document.createElement('span'); r.className = 'kc-risk'; r.textContent = t('kp.card.drawback'); foot.appendChild(r); }
      const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = t('ex.kp.card', { tier: optLimit(o) });
      face.append(head, nm, art, ds, foot, ex);
      const back = document.createElement('span'); back.className = 'kc-back'; back.setAttribute('aria-hidden', 'true'); back.textContent = '\u25C6';
      b.append(face, back);
      b.addEventListener('click', () => choose(i));
      b.addEventListener('pointerenter', () => { hover = i; hoverStop(); hoverI = i; hoverAt = performance.now(); detail(); });
      b.addEventListener('pointerleave', () => { if (hover === i) hover = -1; hoverStop(); detail(); });
      b.addEventListener('focus', () => { focusI = i; detail(); });
      list.appendChild(b);
    });
    // Bann: je Karte ein Knopf, solange Banne übrig sind (wie in v0.6)
    const bans = el.stageBans; bans.innerHTML = '';
    if (G.bansLeft() > 0) d.options.forEach((id, i) => {
      bans.appendChild(mkButton('btn-ghost', t('draft.ban', { name: cardName(G.OPT[id], G.cardTaken(id) + 1) }),
        () => { if (locked() || leaving) return; const c = el.stageCards.children[i]; if (c && c.animate && reveal()) c.animate([{ opacity: 1, transform: getComputedStyle(c).transform }, { opacity: 0, transform: 'scale(.6) rotate(8deg)' }], { duration: 180, fill: 'forwards' }); setTimeout(() => { if (G.S.pendingDraft && G.banOption(i)){ chain = true; key = ''; requestRender(); } }, reveal() ? 190 : 0); }, 'ban:' + i, t('ex.draft.ban', { n: G.bansLeft() })));
    });
    const dealMs = reveal() && !chain ? K.austeilMs : 0, flipMs = reveal() ? (n - 1) * K.aufdeckAbstandMs + K.aufdeckMs : 0;
    lockMs = Math.max(reveal() ? K.sperreMinMs : C.UI.draftLockMs, dealMs + flipMs);       // Sperre endet mit der letzten aufgedeckten Karte, frühestens nach sperreMinMs (REQ-K2.02)
    dealing = reveal();
    if (reveal()) deal(dealMs); else dealing = false;
    chain = false;
  }
  /* Austeilen: Karten fliegen als Rückseiten aus dem Kartensymbol der Leiste an ihren Platz und decken nacheinander (links nach rechts) auf (REQ-K2.02) */
  function deal(dealMs){
    const cards = [...el.stageCards.children], from = el.cardSym.getBoundingClientRect(), n = cards.length;
    cards.forEach(c => c.classList.add('back-up'));
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(), dx = from.left + from.width / 2 - (r.left + r.width / 2), dy = from.top + from.height / 2 - (r.top + r.height / 2);
      const rot = getComputedStyle(c).getPropertyValue('--rot') || '0deg', t0 = i * K.aufdeckAbstandMs;
      if (dealMs > 0 && c.animate) c.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.18) rotate(0deg)`, opacity: .9 }, { transform: `translate(0, 0) scale(1) rotate(${rot})`, opacity: 1 }],
        { duration: dealMs, delay: t0, easing: 'ease-out', fill: 'backwards' });
      setTimeout(() => {                                                    // Aufdecken: Rückseite schrumpft, Vorderseite wächst
        if (!c.isConnected) return;
        if (c.animate) c.animate([{ transform: `rotate(${rot}) scaleX(1)` }, { transform: `rotate(${rot}) scaleX(0)`, offset: .5 }, { transform: `rotate(${rot}) scaleX(1)` }], { duration: K.aufdeckMs, easing: 'ease-in-out' });
        setTimeout(() => c.classList.remove('back-up'), c.animate ? K.aufdeckMs / 2 : 0);
      }, dealMs + t0);
    });
    setTimeout(() => { dealing = false; requestRender(); }, dealMs + (n - 1) * K.aufdeckAbstandMs + K.aufdeckMs + 20);
  }
  /* Wirkort der gewählten Karte (REQ-K2.02): betroffenes Element der Leiste (Wirtschaft, Armee, Basis), sonst der Reiter „Karten“. mark = Schlüssel der Markierung „neu“. */
  const vis = e => e && e.isConnected && e.getClientRects().length > 0 && !e.closest('[hidden]');
  function effectTarget(o){
    const tab = id => ({ el: $('tab-' + id), mark: 'tab:' + id });
    const hudOf = { wirtschaft: 'hud:material', armee: 'hud:soldiers', basis: 'hud:walls' }[o.category];
    const he = hudOf && document.querySelector(`.hud-item[data-tooltip="${hudOf}"]`);
    if (he && vis(he)) return { el: he, mark: null };
    return tab('cards');
  }
  /* Eine fliegende Kopie der Karte von ihrem Platz zum Ziel (Mitte), schrumpfend */
  function flyClone(card, to, ms, fade){
    const r = card.getBoundingClientRect(), c = card.cloneNode(true);
    Object.assign(c.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: 0, pointerEvents: 'none', zIndex: 30, transform: getComputedStyle(card).transform });
    c.classList.remove('back-up'); c.removeAttribute('data-tooltip'); c.tabIndex = -1;
    el.stageFly.appendChild(c); flyEls.push(c);
    const vw = window.innerWidth, vh = window.innerHeight;
    const tx = Math.max(8, Math.min(vw - 8, to.left + to.width / 2)), ty = Math.max(8, Math.min(vh - 8, to.top + to.height / 2));     // außerhalb des Bildes: an den Rand
    const dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2);
    c.animate([{ transform: getComputedStyle(card).transform, opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(0deg)`, opacity: fade ? 0 : .95 }], { duration: ms, easing: 'ease-in', fill: 'forwards' });
  }
  function choose(i){
    if (locked() || leaving || !G.S.pendingDraft) return;
    const d = G.S.pendingDraft;
    if (!reveal()){ commit(i, null); return; }
    leaving = true; Tip.hide();
    const o = G.OPT[d.options[i]], tg = effectTarget(o), cards = [...el.stageCards.children];
    const more = G.S.pendingLevels > 1, sym = el.cardSym.getBoundingClientRect();
    cards.forEach((c, k) => flyClone(c, k === i ? (tg.el ? tg.el.getBoundingClientRect() : sym) : sym, k === i ? K.wirkflugMs : K.wirkflugMs, k !== i && more));
    el.stageCards.style.visibility = 'hidden'; el.stageTools.style.visibility = 'hidden'; el.stageDetail.style.visibility = 'hidden'; el.stageHead.style.visibility = 'hidden';
    document.body.classList.add('stage-leaving');
    setTimeout(() => { commit(i, tg); }, K.abraeumenMs);
  }
  function commit(i, tg){
    const more = G.S.pendingLevels > 1;
    leaving = false; flyEls.forEach(e => e.remove()); flyEls = [];
    document.body.classList.remove('stage-leaving');
    for (const e of [el.stageCards, el.stageTools, el.stageDetail, el.stageHead]) e.style.visibility = '';
    if (G.S.pendingDraft && G.chooseDraft(i)){
      key = ''; hover = -1; chosenKey = ''; chain = more;
      if (tg){ if (tg.mark) NewMarks.flag(tg.mark); if (tg.el){ tg.el.classList.add('fx-glow'); setTimeout(() => tg.el.classList.remove('fx-glow'), K.leuchtMs); } }
      requestRender();
    }
  }
  /* Detailzeile: Wirkung der überfahrenen oder fokussierten Karte */
  function detail(){
    const d = G.S.pendingDraft; if (!d) return;
    const i = hover >= 0 ? hover : focusI, id = d.options[i];
    if (id === undefined){ setText(el.stageDetail, t('kp.stage.hint', { n: d.options.length })); return; }
    const o = G.OPT[id], tier = G.cardTaken(id) + 1;
    const parts = [`${cardName(o, tier)} – ${t(o.descKey, optParams(o, tier))}`, optLimit(o)].filter(Boolean);       // REQ-K2.03: nur die unmittelbare Wirkung, keine Folgekarten
    setText(el.stageDetail, parts.join(' · '));
  }

  function render(){
    if (!built) return;
    const S = G.S, run = S.status === 'running', d = run ? S.pendingDraft : null, active = on();
    document.body.classList.toggle('stage-on', active);
    const vis = visible();
    document.body.classList.toggle('stage-open', vis);
    if (vis !== wasVisible){ wasVisible = vis; renderHint(); }
    // Kartensymbol in der Ressourcenleiste (REQ-K2.01); kein Bühnenelement außerhalb einer Wahl
    setHidden(el.cardSym, !(active && run && Disc.shows('hud:cardSym')));
    if (active && run){
      const x = G.xpProgress(), total = Object.values(S.draft.stacks).reduce((a, b) => a + b, 0);
      { const h = (100 * Math.max(0, Math.min(1, x.cur / x.need))).toFixed(0) + '%'; if (el.deckFill.style.height !== h) el.deckFill.style.height = h; }
      setText(el.deckCount, total ? fmt(total) : '');
      setText(el.deckExpl, t('ex.kp.deck', { cur: fmt(Math.max(0, x.cur)), need: fmt(x.need) }));
      el.cardSym.classList.toggle('pulse', !!d && folded);
    }
    if (!active || !d){ key = ''; folded = false; chain = chain && !!d; setHidden(el.stage, true); return; }
    const k = d.level + ':' + d.options.join() + ':' + (d.rerolled || 0) + ':' + G.bansLeft() + ':' + lang;
    if (d.level !== lvlKey){ lvlKey = d.level; lvlOpenedAt = performance.now(); }
    if (k !== key){
      if (pointerHeld && !key) return;                                    // Maustaste gedrückt: erst nach dem Loslassen öffnen (kein verlorener Klick)
      const fresh = !key || key.split(':')[0] !== k.split(':')[0] || key.split(':')[1] !== k.split(':')[1];
      key = k; if (fresh){ folded = false; focusI = 0; hover = -1; }
      openedAt = performance.now();
      layout(); build(d); detail();
      setTimeout(requestRender, lockMs + 20);                             // Sperre endet: Karten freigeben
    }
    setHidden(el.stage, folded);
    if (folded) return;
    const more = S.pendingLevels - 1;
    const headKey = d.level + ':' + more + ':' + lang;
    if (el.stageHead.dataset.k !== headKey){
      el.stageHead.dataset.k = headKey; el.stageHead.textContent = t('kp.stage.title', { n: d.level });
      if (more > 0){ const q = document.createElement('small'); q.textContent = t('draft.queue', { n: more }); el.stageHead.appendChild(q); }
    }
    const lk = locked();
    el.stageCards.classList.toggle('locked', lk);
    for (const b of el.stageCards.children) setDis(b, lk);
    setHidden(el.stageReroll.parentElement, !(G.mAdd('rerolls') > 0));
    setText(el.stageReroll.querySelector('.expl'), t('ex.draft.reroll', { n: G.rerollsLeft() }));
    setDis(el.stageReroll, G.rerollsLeft() <= 0 || lk);
    el.stageReroll.querySelector('.btn-label').textContent = t('draft.reroll');
    el.stageLater.querySelector('.btn-label').textContent = t('kp.stage.later');
    setText(el.stageLater.querySelector('.expl'), t('ex.kp.later'));
    for (const b of el.stageBans.children) setDis(b, lk);
  }
  /* „Später“ klappt die Bühne ein; ein Klick auf den Stapel (oder die Leiste) öffnet sie wieder */
  function fold(){ if (!G.S.pendingDraft) return; folded = true; Tip.hide(); requestRender(); }
  function reopen(){ if (!G.S.pendingDraft || !folded) return; folded = false; openedAt = performance.now(); setTimeout(requestRender, lockMs + 20); requestRender(); }

  function keydown(e){
    if (!visible() || e.ctrlKey || e.metaKey || e.altKey) return;
    const cards = [...el.stageCards.children], n = cards.length;
    let handled = true;
    if (/^[1-9]$/.test(e.key)){ const i = Number(e.key) - 1; if (i < n) choose(i); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){ focusI = (focusI + 1) % n; cards[focusI].focus({ preventScroll: true }); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ focusI = (focusI + n - 1) % n; cards[focusI].focus({ preventScroll: true }); }
    else handled = false;
    if (handled){ e.preventDefault(); e.stopPropagation(); }
  }
  function init(){
    for (const id of ids) el[id] = $(id);
    built = true;
    el.stageReroll.addEventListener('click', () => { if (!isDis(el.stageReroll) && !leaving && G.rerollDraft()){ key = ''; requestRender(); } });       // neu gezogen wird neu ausgeteilt (REQ-K2.02)
    el.stageLater.addEventListener('click', fold);
    el.cardSym.addEventListener('click', reopen);
    document.addEventListener('keydown', keydown, true);
    window.addEventListener('resize', () => { if (built) layout(); });
    layout();
  }
  /* Zeit unter dem Zeiger je Karte seit dem Öffnen dieser Wahl; danach zurückgesetzt */
  function takeHover(){ hoverStop(); const h = hoverMs.map(x => Math.round(x)); hoverMs = []; return h; }
  const thinkMs = () => on() && lvlKey !== null ? Math.round(performance.now() - lvlOpenedAt) : null;
  return { init, render, on, thinkMs, takeHover, visible, reopen, fold, locked, get dealing(){ return dealing; }, get leaving(){ return leaving; }, effectTarget, get folded(){ return folded; }, get el(){ return el; } };
})();

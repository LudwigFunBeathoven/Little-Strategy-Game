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
  const el = {};
  const ids = ['stage', 'stageHead', 'stageCards', 'stageDetail', 'stageTools', 'stageReroll', 'stageLater', 'stageBans', 'deckBtn', 'deckFill', 'deckCount', 'deckExpl'];
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
  const familyOf = o => o.family || 'bonus';
  function symbol(o){ return K.symbole[o.pfad ? o.family : o.category] || K.symbole.bonus; }
  /* Inhalte einer Pfadkarte mit Symbol: „Schaltet frei:“, „Öffnet Forschung:“ (REQ-KP.03) */
  const contentSymbol = key => K.inhaltSymbole[key.split(':')[0]] || '';
  function pathLines(o){
    const k = o.pfad, out = [];
    if (!k) return out;
    const un = (k.schaltetFrei || []).map(key => `${contentSymbol(key)} ${keyLabel(key)}`);
    if (un.length) out.push(t('kp.card.unlocks', { list: un.join(', ') }));
    const op = (k.oeffnetForschung || []).map(id => `${K.inhaltSymbole.forschung} ${keyLabel('forschung:' + id)}`);
    if (op.length) out.push(t('kp.card.opens', { list: op.join(', ') }));
    return out;
  }
  function needsLine(o){
    const k = o.pfad;
    if (!k || !(k.benoetigt || []).length) return '';
    return t('kp.card.needs', { list: k.benoetigt.map(b => b.startsWith('gebaut:') ? t('kp.card.built', { name: t(`bld.${b.slice(7)}.name`) }) : (G.OPT[b] ? t(G.OPT[b].nameKey) : (G.RES[b] ? t(G.RES[b].nameKey) : b))).join(', ') });
  }

  function build(d){
    const list = el.stageCards; list.innerHTML = '';
    const n = d.options.length;
    d.options.forEach((id, i) => {
      const o = G.OPT[id], tier = G.cardTaken(id) + 1;
      const b = document.createElement('button');
      b.type = 'button'; b.className = ['kcard', cardClass(o), 'fam-' + familyOf(o)].join(' '); b.dataset.tooltip = 'draftopt:' + i; b.dataset.i = String(i);
      const rot = n > 1 ? (-K.faecherGrad + 2 * K.faecherGrad * i / (n - 1)) : 0;
      b.style.setProperty('--rot', rot.toFixed(2) + 'deg');
      b.style.setProperty('--delay', (i * K.aufdeckAbstandMs) + 'ms');
      const head = document.createElement('span'); head.className = 'kc-head';
      const sym = document.createElement('i'); sym.className = 'kc-sym'; sym.setAttribute('aria-hidden', 'true'); sym.textContent = symbol(o);
      const fam = document.createElement('span'); fam.className = 'kc-fam'; fam.textContent = o.pfad ? t('kp.fam.' + o.family) : `${t('kp.fam.bonus')} · ${t('draft.cat.' + o.category)}`;
      const num = document.createElement('span'); num.className = 'kc-key'; num.textContent = String(i + 1);
      head.append(sym, fam, num);
      const nm = document.createElement('b'); nm.className = 'kc-name'; nm.textContent = cardName(o, tier);
      const art = document.createElement('span'); art.className = 'kc-art'; art.setAttribute('aria-hidden', 'true'); art.textContent = symbol(o);
      const ds = document.createElement('span'); ds.className = 'kc-desc'; ds.textContent = t(o.descKey, optParams(o, tier));
      for (const line of pathLines(o)){ const u = document.createElement('span'); u.className = 'kc-unlock'; u.textContent = line; ds.appendChild(u); }
      const nd = needsLine(o); if (nd){ const u = document.createElement('span'); u.className = 'kc-needs'; u.textContent = nd; ds.appendChild(u); }
      const foot = document.createElement('span'); foot.className = 'kc-foot';
      const dots = document.createElement('span'); dots.className = 'kc-tier'; dots.setAttribute('aria-hidden', 'true');
      dots.textContent = '●'.repeat(tier) + '○'.repeat(o.tiers.length - tier);
      const rar = document.createElement('span'); rar.className = 'kc-rar'; rar.textContent = t('draft.rarity.' + o.rarity);
      foot.append(dots, rar);
      const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = t('ex.kp.card', { tier: optLimit(o) });
      b.append(head, nm, art, ds, foot, ex);
      b.addEventListener('click', () => choose(i));
      b.addEventListener('pointerenter', () => { hover = i; detail(); });
      b.addEventListener('pointerleave', () => { if (hover === i) hover = -1; detail(); });
      b.addEventListener('focus', () => { focusI = i; detail(); });
      list.appendChild(b);
    });
    // Bann: je Karte ein Knopf, solange Banne übrig sind (wie in v0.6)
    const bans = el.stageBans; bans.innerHTML = '';
    if (G.bansLeft() > 0) d.options.forEach((id, i) => {
      if (!G.canBan(id)) return;                                      // Pfadkarten sind einzige Quelle ihrer Inhalte (REQ-KP.06)
      bans.appendChild(mkButton('btn-ghost', t('draft.ban', { name: cardName(G.OPT[id], G.cardTaken(id) + 1) }),
        () => { if (!locked() && G.banOption(i)){ key = ''; requestRender(); } }, 'ban:' + i, t('ex.draft.ban', { n: G.bansLeft() })));
    });
    lockMs = Math.max(C.UI.draftLockMs, reveal() ? (n - 1) * K.aufdeckAbstandMs + K.aufdeckMs : 0);
    el.stageCards.classList.toggle('reveal', reveal());
  }
  function choose(i){
    if (locked() || !G.S.pendingDraft) return;
    if (G.chooseDraft(i)){ key = ''; hover = -1; chosenKey = ''; requestRender(); }
  }
  /* Detailzeile: Wirkung der überfahrenen oder fokussierten Karte */
  function detail(){
    const d = G.S.pendingDraft; if (!d) return;
    const i = hover >= 0 ? hover : focusI, id = d.options[i];
    if (id === undefined){ setText(el.stageDetail, t('kp.stage.hint', { n: d.options.length })); return; }
    const o = G.OPT[id], tier = G.cardTaken(id) + 1;
    const parts = [`${cardName(o, tier)} – ${t(o.descKey, optParams(o, tier))}`, ...pathLines(o), needsLine(o), o.pfad && (o.pfad.exklusivMit || []).length ? t('kp.card.excludes', { list: o.pfad.exklusivMit.map(x => t(G.OPT[x].nameKey)).join(', ') }) : '', o.pfad ? t('kp.card.returns') : '', optLimit(o)].filter(Boolean);
    setText(el.stageDetail, parts.join(' · '));
  }

  function render(){
    if (!built) return;
    const S = G.S, run = S.status === 'running', d = run ? S.pendingDraft : null, active = on();
    document.body.classList.toggle('stage-on', active);
    const vis = visible();
    document.body.classList.toggle('stage-open', vis);
    if (vis !== wasVisible){ wasVisible = vis; renderHint(); }
    // Stapel: dauerhaft sichtbar, solange die Partie läuft
    setHidden(el.deckBtn, !(active && run));
    if (active && run){
      const x = G.xpProgress(), total = Object.values(S.draft.stacks).reduce((a, b) => a + b, 0);
      setWidth(el.deckFill, 100 * Math.max(0, Math.min(1, x.cur / x.need)));
      setText(el.deckCount, t('kp.deck.count', { n: total }));
      setText(el.deckExpl, t('ex.kp.deck', { cur: fmt(Math.max(0, x.cur)), need: fmt(x.need) }));
      el.deckBtn.classList.toggle('pulse', !!d && folded);
    }
    if (!active || !d){ key = ''; folded = false; setHidden(el.stage, true); return; }
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
    el.stageReroll.addEventListener('click', () => { if (!isDis(el.stageReroll) && G.rerollDraft()){ key = ''; requestRender(); } });
    el.stageLater.addEventListener('click', fold);
    el.deckBtn.addEventListener('click', reopen);
    document.addEventListener('keydown', keydown, true);
    window.addEventListener('resize', () => { if (built) layout(); });
    layout();
  }
  const thinkMs = () => on() && lvlKey !== null ? Math.round(performance.now() - lvlOpenedAt) : null;
  return { init, render, on, thinkMs, visible, reopen, fold, locked, get folded(){ return folded; }, get el(){ return el; } };
})();

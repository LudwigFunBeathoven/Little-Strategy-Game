/* Klammerfront – Arbeitsbereich, unteres Band (REQ-5.03): Klickfeld links, rechts Reiter mit Kontextkopf.
   Reiter: Bauen, Mauer & Türme, Armee, Schmiede (erst mit Schmiede), Universität, Karten.
   Ein Klick auf ein Objekt in der Welt öffnet dessen Reiter und zeigt es im Kontextkopf; Esc oder ein Klick ins Leere hebt die Auswahl auf.
   Kein automatischer Reiterwechsel ohne Handlung des Spielers – mit einer Ausnahme: Eine anstehende Kartenwahl öffnet den Reiter Karten
   (REQ-6.04) und kehrt danach zum vorigen Reiter samt Auswahl zurück. Knöpfe entstehen einmal bzw. nur bei geänderter Auswahl (REQ-5.01). */
'use strict';

const TABS = ['build', 'wall', 'army', 'smithy', 'uni', 'cards'];
/* Markierung „neu“ (REQ-T.05): Reiter, Bau-Optionen und Einheiten, die erst im Lauf der Partie erscheinen, tragen bis zum ersten Ansehen
   (UI.newSeenMs sichtbar) eine Marke. Was beim Start schon sichtbar ist, gilt als bekannt (Grundlinie). Gesehenes liegt im Spielstand (ui). */
const NewMarks = (() => {
  let seen = new Set(), baseline = true, since = new Map(), touched = new Set();
  const ids = () => [...TABS.filter(tabVisible).map(x => 'tab:' + x),
                     ...C.BUILDINGS.filter(b => G.isBuildable(b) && (b === 'fabrik' || G.introShows('buildings'))).map(b => 'pick:' + b),
                     ...Object.keys(C.UNITS).filter(u => !C.UNITS[u].replacement && G.unitUnlocked(u)).map(u => 'unit:' + u)];
  return {
    isNew: id => !baseline && !seen.has(id),
    /* Der Inhalt ist gerade zu sehen; nach UI.newSeenMs gilt er als angesehen. */
    view(id){
      if (baseline || seen.has(id)) return;
      touched.add(id);
      const t0 = since.get(id) ?? performance.now(); since.set(id, t0);
      if (performance.now() - t0 >= C.UI.newSeenMs){ seen.add(id); since.delete(id); }
    },
    /* Am Ende eines Bildaufbaus: nicht mehr sichtbare Inhalte beginnen von vorn; Grundlinie der Partie festlegen. */
    endRender(){
      for (const id of since.keys()) if (!touched.has(id)) since.delete(id);
      touched.clear();
      if (baseline && G.S.status === 'running'){ for (const id of ids()) seen.add(id); baseline = false; }
    },
    reset(){ seen = new Set(); baseline = true; since.clear(); touched.clear(); },
    snapshot: () => baseline ? undefined : { seen: [...seen] },
    restore(o){ since.clear(); touched.clear(); if (o && Array.isArray(o.seen)){ seen = new Set(o.seen); baseline = false; } else { seen = new Set(); baseline = true; } },
  };
})();
let activeTab = 'build';
/* Auswahl in der Welt: null | { kind: 'plot', i } | { kind: 'section', lane } */
let sel = null, ctxKey = '', demolishArmed = false, picks = [];
const tabEls = {}, gridEls = [];

/* Reiter eines Objekts: Heimat-Reiter des Gebäudes aus UI.homeTab (REQ-6.05); freie Bauplätze gehören zu Bauen */
function tabForSel(s){
  if (!s) return null;
  if (s.kind === 'section') return 'wall';
  const sl = G.S.slots[s.i];
  return sl ? C.UI.homeTab[sl.type] : 'build';
}
function tabVisible(id){
  if (id === 'smithy') return G.has('schmiede');
  if (id === 'cards') return G.introShows('cards');
  return true;
}
function selectTab(id, byUser){
  if (!TABS.includes(id) || !tabVisible(id)) return;
  activeTab = id;
  if (byUser && tabEls[id]) tabEls[id].btn.focus({ preventScroll: true });
  requestRender();
}
function selectPlot(i){ sel = { kind: 'plot', i }; demolishArmed = false; ctxKey = ''; selectTab(tabForSel(sel)); }
function selectSection(lane){ sel = { kind: 'section', lane }; demolishArmed = false; ctxKey = ''; selectTab('wall'); }
function clearSelection(){ if (!sel) return; sel = null; demolishArmed = false; ctxKey = ''; requestRender(); }
/* Zum Bauen eines Gebäudetyps springen: erster freier Platz, auf dem er baubar wäre; die Option wird hervorgehoben und fokussiert */
let kaserneBuildBtn = null, waveRushBtn = null, preselect = null;
function goBuild(type){
  const i = G.S.slots.findIndex((x, k) => !x && !['hidden', 'standing'].includes(G.buildBlock(k, type)));
  preselect = type;
  if (i >= 0) selectPlot(i); else { clearSelection(); selectTab('build'); }
}

/* ---------- Kartenwahl öffnet sich automatisch (REQ-6.04) ----------
   Entsteht eine Kartenwahl, wechselt der Arbeitsbereich in den Reiter Karten (nach dem Loslassen einer gedrückten Maustaste).
   Die Kartenknöpfe nehmen Klicks erst UI.draftLockMs nach dem Öffnen an und blenden in dieser Zeit ein. Mehrere Wahlen folgen
   nacheinander; danach kehrt der Arbeitsbereich zum vorigen Reiter samt Auswahl zurück. */
let pointerHeld = false, draftAuto = null, draftShownKey = '', draftOpenedAt = -Infinity;
function draftLocked(){ return performance.now() - draftOpenedAt < C.UI.draftLockMs; }
function autoDraft(){
  if (Stage.on()) return;                                              // die Kartenbühne öffnet sich selbst und wechselt keinen Reiter (REQ-KP.03)
  const S = G.S, d = S.status === 'running' ? S.pendingDraft : null;
  if (d){
    const key = d.level + ':' + d.options.join();
    if (key === draftShownKey || pointerHeld) return;                   // schon gezeigt, oder Maustaste gedrückt: nach dem Loslassen
    if (!draftAuto) draftAuto = { tab: activeTab, sel };
    draftShownKey = key;
    activeTab = 'cards';
    draftOpenedAt = performance.now();
    draftKey = '';
    setTimeout(requestRender, C.UI.draftLockMs + 20);                   // Sperre endet: Knöpfe freigeben
  } else if (draftAuto){
    const back = draftAuto; draftAuto = null; draftShownKey = '';
    sel = back.sel; ctxKey = '';
    activeTab = tabVisible(back.tab) ? back.tab : 'build';
  } else draftShownKey = '';
}

/* Wirkung eines Gebäudes für Erklärzeilen: neu gebaut (built = false) oder wie es gerade wirkt */
function bldEffect(type, built){
  switch (type){
    case 'fabrik': return t('fx.fabrik', { rate: fmt1(G.factoryRate()) });
    case 'schmiede': return t('fx.schmiede', { n: G.S.lvl.qualitaet });
    case 'kaserne': return t('fx.kaserne', { n: built ? G.kaserneLevel() : 1, m: C.KASERNE_SUPPLY_PER_LEVEL * (built ? G.kaserneLevel() : 1) });
    case 'universitaet': return t('fx.universitaet', { n: C.DRAFT_OPTIONS_UNIVERSITY });
    case 'kontor': return t('fx.kontor', { amount: C.KONTOR.amount, n: C.KONTOR.perN, s: C.KONTOR.intervalS, cap: G.kontorCap() });
  }
  return '';
}

function buildPanels(){
  // Reiterleiste: Pfeiltasten, Pos1 und Ende wechseln den Reiter (Tastaturbedienung, REQ-5.03)
  const bar = $('tabs');
  for (const id of TABS){
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'tab-' + id; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'panel-' + id);
    b.dataset.tooltip = 'tab:' + id;
    b.innerHTML = '<span class="btn-label"></span><span class="expl"></span><i class="mark" hidden></i><i class="new" hidden></i>';
    b.addEventListener('click', () => selectTab(id, true));
    bar.appendChild(b);
    tabEls[id] = { btn: b, label: b.children[0], expl: b.children[1], mark: b.children[2], fresh: b.children[3], panel: $('panel-' + id) };
  }
  bar.addEventListener('keydown', e => {
    const vis = TABS.filter(tabVisible), i = vis.indexOf(activeTab);
    const next = e.key === 'ArrowRight' ? vis[(i + 1) % vis.length] : e.key === 'ArrowLeft' ? vis[(i - 1 + vis.length) % vis.length]
               : e.key === 'Home' ? vis[0] : e.key === 'End' ? vis[vis.length - 1] : null;
    if (next){ e.preventDefault(); selectTab(next, true); }
  });
  // Kaserne im Reiter Armee (REQ-6.05): ohne Kaserne führt ein Knopf in den Reiter Bauen, Kaserne vorausgewählt
  kaserneBuildBtn = mkButton('btn-ghost', '', () => goBuild('kaserne'), 'kaserneBuild', '');
  $('kaserneBuild').appendChild(kaserneBuildBtn);
  // Welle vorziehen (REQ-6.07 c)
  waveRushBtn = mkButton('btn-ghost', '', () => { if (G.rushWave()) requestRender(); }, 'waveRush', '');
  $('kaserneBuild').appendChild(waveRushBtn);
  // Kartenwahl (REQ-6.04): gedrückte Maustaste merken; der Reiter öffnet erst nach dem Loslassen
  document.addEventListener('pointerdown', () => { pointerHeld = true; }, true);
  document.addEventListener('pointerup', () => { pointerHeld = false; requestRender(); }, true);
  document.addEventListener('pointercancel', () => { pointerHeld = false; requestRender(); }, true);
  // Knopfraster der Bauplätze (REQ-5.04): Maus oder Tastatur; Pfeiltasten bewegen den Fokus, Enter wählt den Platz
  // und springt zur ersten baubaren Option, ein zweites Enter baut
  const grid = $('plotGrid');
  for (let i = 0; i < KlammerCore.SLOTS; i++){
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'gridcell'); b.dataset.tooltip = 'grid:' + i; b.tabIndex = i === 0 ? 0 : -1;
    b.innerHTML = '<span class="btn-label"></span><span class="expl"></span>';
    b.addEventListener('click', e => {
      selectPlot(i);
      if (e.detail === 0) requestAnimationFrame(() => { renderPanels(); const first = [...document.querySelectorAll('#ctxBuild .pick')].find(p => !isDis(p)); (first || b).focus(); });
    });
    grid.appendChild(b);
    gridEls.push({ btn: b, label: b.children[0], expl: b.children[1] });
  }
  grid.addEventListener('keydown', e => {
    const i = gridEls.findIndex(g => g.btn === document.activeElement);
    if (i < 0) return;
    const N = C.GRID_SIZE, r = Math.floor(i / N), c = i % N;
    const to = e.key === 'ArrowRight' ? r * N + (c + 1) % N : e.key === 'ArrowLeft' ? r * N + (c + N - 1) % N
             : e.key === 'ArrowDown' ? ((r + 1) % N) * N + c : e.key === 'ArrowUp' ? ((r + N - 1) % N) * N + c : -1;
    if (to >= 0){ e.preventDefault(); gridEls.forEach((g, k) => { g.btn.tabIndex = k === to ? 0 : -1; }); gridEls[to].btn.focus(); }
  });
  for (const id in C.UPGRADES) optEls[id] = makeOpt($(GROUP_BOX[C.UPGRADES[id].group]), '', 'upg:' + id, () => G.buy(id));
  for (const id in C.UNITS) if (!C.UNITS[id].replacement) optEls['unit_' + id] = makeOpt($('optsUnits'), 'unit', 'unit:' + id, () => G.spawn(id));
  for (let i = 0; i < C.LANE_COUNT; i++) optEls['repair_' + i] = makeOpt($('optsRepair'), '', 'repair:' + i, () => G.repair(i));
  ctxRepairOpt = makeOpt($('ctxRepair'), '', 'repair:' + C.GATE_LANE, () => { if (sel && sel.kind === 'section') G.repair(sel.lane); });
  // Forschungsbaum: ein Knopf je Forschung, einmal erzeugt (REQ-5.07)
  const BRANCH_BOX = { lehre: 'resLehre', archiv: 'resArchiv', forschung: 'resForschung', freischaltung: 'resFreischaltung' };
  // Pfadforschungen (REQ-KP.04): gruppiert nach der Technologiekarte, die sie öffnet
  const resGroups = resGroupsAll;
  for (const o of G.ALL_OPTIONS) if (o.pfad && (o.pfad.oeffnetForschung || []).length){
    const g = document.createElement('div'); g.className = 'res-group'; g.hidden = true;
    const h = document.createElement('h3'); h.className = 'sub'; const opts = document.createElement('div'); opts.className = 'opts';
    g.append(h, opts); $('resPfad').appendChild(g); resGroups[o.id] = { g, h, opts };
  }
  for (const r of G.RESEARCH){
    if (r.branch === 'pfad'){
      const card = G.ALL_OPTIONS.find(o => o.pfad && (o.pfad.oeffnetForschung || []).includes(r.id));
      resEls[r.id] = makeOpt(resGroups[card.id].opts, 'res', 'res:' + r.id, () => G.startResearch(r.id));
      resEls[r.id].card = card.id; resEls[r.id].group = resGroups[card.id];
    } else resEls[r.id] = makeOpt($(BRANCH_BOX[r.branch]), 'res', 'res:' + r.id, () => G.startResearch(r.id));
  }
  $('rerollBtn').addEventListener('click', () => { if (!isDis($('rerollBtn')) && G.rerollDraft()){ draftKey = ''; requestRender(); } });
  // Klickfeld löst auf pointerdown aus (REQ-5.01); Tastatur (Enter, Leertaste) kommt als click ohne Zeigerereignis
  const press = () => { if (!isDis($('clickBtn'))){ G.doClick(); requestRender(); } };
  $('clickBtn').addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary) press(); });
  $('clickBtn').addEventListener('click', e => { if (e.detail === 0) press(); });
  $('hintOk').addEventListener('click', dismissHint);
  $('camRealm').addEventListener('click', () => { Cam.follow = false; Cam.touched = true; Cam.goTo(0); });
  $('camFront').addEventListener('click', () => { Cam.follow = false; Cam.touched = true; Cam.goTo(Cam.frontTarget()); });
  $('camFollow').addEventListener('click', () => { Cam.follow = !Cam.follow; Cam.touched = true; requestRender(); });
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (Stage.visible()) return;                                   // Ziffern gehören der Kartenbühne
    for (const [id, spec] of Object.entries(C.UNITS)) if (e.key === spec.key){ G.spawn(id); requestRender(); }
  });
}
/* Sprache gewechselt: dynamisch aufgebaute Knöpfe neu beschriften */
function onLangChange(){ ctxKey = ''; draftKey = ''; chosenKey = ''; previewKey = ''; lastLogKey = ''; }

/* ---------- Nachbarschaft (REQ-6.07 a): Texte für Regel, Vorschau und Raster ---------- */
const nbFmt = (rule, v) => (v > 0 ? '+' : v < 0 ? '−' : '') + (rule.stat === 'supplyAdj' ? fmtNum(Math.abs(v)) : t('nb.pct', { v: pct(Math.abs(v)) }));
const nbRuleText = rule => t(rule.nameKey, { v: nbFmt(rule, rule.per), max: fmtNum(rule.max) });
function nbPreviewText(i, type){
  const p = G.neighborPreview(i, type), parts = [];
  if (p.gets) parts.push(p.gets.n > 0 ? t('nb.gets', { rule: nbRuleText(p.gets.rule), n: p.gets.n, total: nbFmt(p.gets.rule, p.gets.value) })
                                      : t('nb.getsNone', { rule: nbRuleText(p.gets.rule) }));
  for (const g of p.gives) parts.push(t('nb.gives', { name: t(`bld.${g.type}.name`), slot: g.slot + 1, delta: nbFmt(g.rule, g.delta) }));
  return parts.join(' · ');
}

/* ---------- Kontextkopf: ausgewähltes Objekt mit seinen Aktionen ---------- */
function updatePicks(){
  for (const p of picks){
    const block = G.buildBlock(p.i, p.type), cost = G.buildCost(p.type), why = buildReason(block, cost, p.type);
    setText(p.nm, p.type === 'fabrik' ? t('bld.fabrik.nth', { n: G.factoryCount() + 1 }) : t(`bld.${p.type}.name`));
    setText(p.ex, t('ex.line', { effect: bldEffect(p.type, false), cost: costText('material', cost) }));
    setText(p.w, why || ''); setHidden(p.w, !why);
    setText(p.nb, nbPreviewText(p.i, p.type));
    setDis(p.b, !!block);
    setText(p.fresh, t('mark.new')); setHidden(p.fresh, !NewMarks.isNew('pick:' + p.type));
    NewMarks.view('pick:' + p.type);
  }
}
/* Kontextkopf sichtbar im Reiter des Objekts; Bauplätze und ihre Gebäude zeigt er auch im Reiter Bauen,
   damit nach einem Bau kein Reiterwechsel nötig ist (REQ-5.04) */
const ctxVisible = () => !!sel && (tabForSel(sel) === activeTab || (sel.kind === 'plot' && activeTab === 'build'));
function renderContext(){
  const S = G.S, show = ctxVisible();
  setHidden($('ctxHead'), !show);
  const plot = show && sel.kind === 'plot', sl = plot ? S.slots[sel.i] : null, sec = show && sel.kind === 'section' ? sel.lane : null;
  setHidden($('ctxBuilding'), !sl);
  setHidden($(GROUP_BOX.kontor), !(sl && sl.type === 'kontor'));
  setHidden($('ctxRepair'), sec === null);
  if (plot && !sl){
    setText($('ctxTitle'), t('slot.label', { n: sel.i + 1 }));
    setText($('ctxText'), t('slot.dialogText'));
  } else if (sl){
    setText($('ctxTitle'), t('ctx.building', { name: t(`bld.${sl.type}.name`), n: sel.i + 1 }));
    setText($('ctxText'), `${t(`bld.${sl.type}.desc`)} ${bldEffect(sl.type, true)}.`);
  } else if (sec !== null){
    setText($('ctxTitle'), t('repair.' + sec));
    setText($('ctxText'), t(sec === C.GATE_LANE ? 'tip.repair.gate' : 'tip.repair.wall'));
    updateOpt(ctxRepairOpt, 'repair', sec);
  }
  // Knöpfe nur bei geänderter Auswahl oder Optionsmenge neu bauen, nie wegen Material oder Zeit (REQ-5.01)
  const key = [lang, show, JSON.stringify(sel), JSON.stringify(S.slots), demolishArmed, S.status, JSON.stringify(S.unlocked),
               C.BUILDINGS.map(b => plot && !sl ? ['hidden', 'standing'].includes(G.buildBlock(sel.i, b)) : 0).join()].join('|');
  if (key === ctxKey){ updatePicks(); return; }
  ctxKey = key;
  const build = $('ctxBuild'), dem = $('ctxDemolish');
  build.innerHTML = ''; dem.innerHTML = ''; picks = [];
  if (plot && !sl){
    const i = sel.i;
    for (const type of C.BUILDINGS){
      const block = G.buildBlock(i, type);
      if (block === 'standing' || block === 'hidden') continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pick'; b.dataset.tooltip = `pick:${type}:${i}`;
      const nm = document.createElement('b');
      const c = document.createElement('span'); c.className = 'c';
      const d = document.createElement('span'); d.className = 'd'; d.textContent = t(`bld.${type}.desc`);
      const ex = document.createElement('span'); ex.className = 'expl';
      const w = document.createElement('span'); w.className = 'w';
      const nb = document.createElement('span'); nb.className = 'nb';
      const fresh = document.createElement('i'); fresh.className = 'new'; fresh.hidden = true;
      b.append(nm, c, d, ex, nb, w, fresh);
      b.addEventListener('click', () => { if (!isDis(b) && G.buildAt(i, type)){ ctxKey = ''; requestRender(); } });
      build.appendChild(b);
      picks.push({ type, i, b, nm, ex, w, nb, fresh });
    }
    updatePicks();
  }
  if (sl){
    const i = sel.i, refund = refundText(G.refundFor(i));
    if (!demolishArmed) dem.appendChild(mkButton('btn-ghost', t('slot.demolish'), () => { demolishArmed = true; showHint('demolish'); ctxKey = ''; requestRender(); }, 'demolish:' + i, t('ex.demolish', { refund })));
    else {
      dem.appendChild(mkButton('btn-danger', t('demolish.confirm'), () => { G.demolish(i); demolishArmed = false; ctxKey = ''; requestRender(); }, 'confirmDemolish:' + i, t('ex.demolish', { refund })));
      dem.appendChild(mkButton('btn-ghost', t('slot.cancel'), () => { demolishArmed = false; ctxKey = ''; requestRender(); }, 'cancel', t('ex.cancel')));
    }
  }
}

/* ---------- Kaufknöpfe (Upgrades, Einheiten, Reparatur): nur Inhalt und Zustand ändern sich ---------- */
let ctxRepairOpt = null;
const resEls = {}, resGroupsAll = {};
function updateOpt(el, kind, a){
  const S = G.S;
  if (kind === 'repair'){
    const i = a;
    el.btn.dataset.tooltip = 'repair:' + i;
    setText(el.label, t('repair.' + i));
    setText(el.expl, S.sections[i].repairCd > 0 ? t('tip.repairCd', { s: Math.ceil(S.sections[i].repairCd) })
      : t('ex.repair', { n: fmt(C.REPAIR_AMOUNT), cost: costText('material', G.repairCost()) }));
    setDis(el.btn, !!repairReason(i));
  }
}
function renderOpts(){
  const S = G.S;
  for (const id in C.UPGRADES){
    const u = C.UPGRADES[id], el = optEls[id], lv = S.lvl[id];
    setHidden(el.btn, !(G.isAvailable(id) && (S.revealed[id] || (S.pacing === 'karten' && G.stageSource(id)))));
    if (el.btn.hidden) continue;
    setText(el.label, baseOf(id) === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${baseOf(id)}.name`));
    setHidden(el.tag, lv === 0);
    if (lv > 0) setText(el.tag, u.max !== undefined ? `${lv}/${u.max}` : String(lv));
    setText(el.expl, explUpgrade(id));
    setDis(el.btn, !G.canBuy(id));
  }
  for (const id in C.UNITS){
    if (C.UNITS[id].replacement) continue;                                     // Ersatzeinheiten haben keinen eigenen Knopf (REQ-KP.05)
    const spec = C.UNITS[id], el = optEls['unit_' + id];
    setHidden(el.btn, !G.unitUnlocked(id) && !(S.pacing === 'karten' && G.unitSource(id) && G.sourceReachable(G.unitSource(id))));       // gesperrte Einheiten bleiben sichtbar, ausgegraut (REQ-KP.01)
    setHidden(el.kbd, false); setText(el.kbd, spec.key);
    setText(el.label, t(`unit.${G.ownType(id)}.name`));
    const open = G.unitUnlocked(id);                                          // gesperrt sichtbar: keine Marke „neu“, erst nach der Freischaltung
    setText(el.fresh, t('mark.new')); setHidden(el.fresh, el.btn.hidden || !open || !NewMarks.isNew('unit:' + id));
    if (activeTab === 'army' && !el.btn.hidden && open) NewMarks.view('unit:' + id);
    setText(el.expl, explUnit(id));
    setDis(el.btn, !!unitReason(id));
  }
  for (let i = 0; i < C.LANE_COUNT; i++){
    const r = optEls['repair_' + i];
    setHidden(r.btn, !S.revealed['repair_' + i]);
    r.btn.classList.toggle('selected', !!sel && sel.kind === 'section' && sel.lane === i);
    updateOpt(r, 'repair', i);
  }
}

/* ---------- Spezialkarten (REQ-18, REQ-45): Wahl im Reiter Karten statt im Dialog ---------- */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const cardName = (o, tier) => o.tiers.length > 1 ? `${t(o.nameKey)} ${ROMAN[tier]}` : t(o.nameKey);
/* Werte für die Kartentexte: Faktoren als Prozent, außer echte Vielfache; Anteile als Prozent */
const FACTOR_STATS = ['supplyMult', 'ownWaveInterval'], SHARE_STATS = ['autoRepairCost', 'autoPressEarly'];
function optParams(o, tier){
  const val = e => e.mul !== undefined ? (FACTOR_STATS.includes(e.stat) ? fmtNum(e.mul) : pct(Math.abs(e.mul - 1)))
    : e.add !== undefined ? (SHARE_STATS.includes(e.stat) ? pct(e.add) : fmtNum(e.add)) : e.seconds !== undefined ? e.seconds : '';
  const tr = o.tiers[Math.max(1, tier) - 1], p = {};
  (tr.effect || []).forEach((e, i) => { p['e' + (i + 1)] = val(e); });
  (tr.drawback || []).forEach((e, i) => { p['d' + (i + 1)] = val(e); });
  if (o.condition && o.condition.value !== undefined) p.c1 = o.condition.value < 1 ? pct(o.condition.value) : o.condition.value;
  if (o.synergy) p.syn = pct(o.synergy.perCard);
  p.s = C.WALL_REGEN_DELAY_S;
  return p;
}
const fmtNum = n => n % 1 ? fmt1(n) : fmt(n);
/* Zeilen für Kartentooltips: Kategorie, Seltenheit, aktuelle Synergie */
function cardRows(o, extra){
  const rows = [[t('tip.draft.category'), t('draft.cat.' + o.category)], [t('tip.draft.rarity'), t('draft.rarity.' + o.rarity)], ...extra];
  if (o.synergy){
    const n = G.categoryCount(o.category) + (G.cardTaken(o.id) ? 0 : 1);
    rows.push([t('tip.draft.synergy'), '+' + pct(o.synergy.perCard * n) + ' %']);
  }
  return rows;
}
const cardClass = o => `cat-${o.category} rar-${o.rarity}`;
function optLimit(o){
  const n = G.cardTaken(o.id) + 1;
  return t('draft.tierOf', { n: ROMAN[n], max: ROMAN[o.tiers.length] });
}
/* Pfadübersicht (REQ-KP.03, Soll): Pfadkarten und Forschungen mit Status – gesperrt, verfügbar, gewählt, ausgeschlossen bzw. erforscht, läuft */
function pathStatus(){
  const out = [];
  for (const o of G.ALL_OPTIONS){
    if (!o.pfad) continue;
    const taken = G.cardTaken(o.id) > 0, st = taken ? 'chosen' : G.cardExcluded(o.id) ? 'excluded' : G.optionAvailable(o) ? 'available' : 'locked';
    out.push({ kind: 'card', id: o.id, family: o.family, st });
    for (const rid of o.pfad.oeffnetForschung || []){
      const r = G.RES[rid]; if (!r) continue;
      const rst = G.researchTier(rid) > 0 ? 'done' : G.S.research.active.some(a => a.id === rid) ? 'running' : st === 'excluded' ? 'excluded' : G.isOpen('forschung:' + rid) ? 'available' : 'locked';
      out.push({ kind: 'res', id: rid, family: o.family, st: rst });
    }
  }
  return out;
}
let chosenKey = '', draftKey = '';
function renderChosen(){
  const ps = Stage.on() ? pathStatus() : [];
  const st = G.S.draft.stacks, key = lang + JSON.stringify(st) + JSON.stringify(G.S.research.banned) + Stage.on() + ps.map(x => x.id + x.st).join();
  if (key === chosenKey) return;
  // Sammlung (Kartenbühne): Hinweis und gebannte Karten; gewählt wird auf der Bühne (REQ-KP.03)
  const coll = Stage.on(), banned = G.S.research.banned || [];
  setHidden($('collHint'), !coll); setHidden($('bannedHead'), !coll); setHidden($('bannedList'), !coll); setHidden($('pathHead'), !coll); setHidden($('pathList'), !coll);
  if (coll){
    setText($('collHint'), t('kp.collection.hint'));
    const pl = $('pathList'); pl.innerHTML = '';
    for (const x of ps){
      const li = document.createElement('li'); li.className = [x.st, x.kind === 'res' ? 'sub-i' : '', 'fam-' + x.family].join(' ');
      const nm = document.createElement('span'); nm.textContent = x.kind === 'card' ? t(G.OPT[x.id].nameKey) : t(G.RES[x.id].nameKey);
      const sp = document.createElement('span'); sp.className = 'st'; sp.textContent = t('kp.path.status.' + x.st);
      li.append(nm, sp); pl.appendChild(li);
    }
    const bl = $('bannedList'); bl.innerHTML = '';
    if (!banned.length){ const e = document.createElement('span'); e.className = 'hint'; e.textContent = t('kp.collection.noneBanned'); bl.appendChild(e); }
    for (const id of banned){
      const o = G.OPT[id]; if (!o) continue;
      const tag = document.createElement('span'); tag.className = 'opt-tag ' + cardClass(o); tag.dataset.tooltip = 'chosen:' + id;
      const b = document.createElement('b'); b.textContent = t(o.nameKey); tag.appendChild(b); bl.appendChild(tag);
    }
  }
  chosenKey = key;
  const box = $('chosen'); box.innerHTML = '';
  const ids = Object.keys(st).filter(id => st[id] > 0);
  if (!ids.length){ const e = document.createElement('span'); e.className = 'hint'; e.textContent = t('level.none'); box.appendChild(e); return; }
  for (const id of ids){
    const o = G.OPT[id], tag = document.createElement('span');
    tag.className = 'opt-tag ' + cardClass(o); tag.dataset.tooltip = 'chosen:' + id;
    const b = document.createElement('b'); b.textContent = cardName(o, st[id]);
    tag.appendChild(b);
    box.appendChild(tag);
  }
}
function renderDraft(){
  const S = G.S, d = S.pendingDraft;
  setHidden($('draftBox'), !d);
  setHidden($('draftTools'), !(d && G.mAdd('rerolls') > 0));
  setText($('rerollBtn').querySelector('.expl'), t('ex.draft.reroll', { n: G.rerollsLeft() }));
  setDis($('rerollBtn'), G.rerollsLeft() <= 0);
  const key = lang + JSON.stringify(d) + G.bansLeft();
  if (key === draftKey) return;
  draftKey = key;
  const list = $('draftOffer'); list.innerHTML = '';
  if (!d) return;
  setText($('draftTitle'), t('draft.eyebrow', { n: d.level }));
  const more = S.pendingLevels - 1;
  setText($('draftText'), t('draft.text') + (more > 0 ? ' ' + t('draft.queue', { n: more }) : ''));
  // Bann: je angebotener Karte ein Knopf, solange Banne übrig sind (REQ-5.07)
  const bans = $('banTools'); bans.innerHTML = '';
  if (G.bansLeft() > 0) d.options.forEach((id, i) => {
    bans.appendChild(mkButton('btn-ghost', t('draft.ban', { name: cardName(G.OPT[id], G.cardTaken(id) + 1) }),
      () => { if (G.banOption(i)){ draftKey = ''; requestRender(); } }, 'ban:' + i, t('ex.draft.ban', { n: G.bansLeft() })));
  });
  d.options.forEach((id, i) => {
    const o = G.OPT[id], tier = G.cardTaken(id) + 1;
    const b = document.createElement('button');
    b.type = 'button'; b.className = ['pick', 'card-pick', cardClass(o)].join(' '); b.dataset.tooltip = 'draftopt:' + i;
    const nm = document.createElement('b'); nm.textContent = cardName(o, tier);
    const k = document.createElement('span'); k.className = 'k'; k.textContent = `${t('draft.cat.' + o.category)} · ${t('draft.rarity.' + o.rarity)}`;
    const ds = document.createElement('span'); ds.className = 'd'; ds.textContent = t(o.descKey, optParams(o, tier));
    const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = t('ex.card', { tier: optLimit(o) });
    b.append(nm, k, ds, ex);
    b.addEventListener('click', () => { if (draftLocked() || isDis(b)) return; if (G.S.pendingDraft && G.chooseDraft(i)){ chosenKey = ''; requestRender(); } });
    list.appendChild(b);
  });
}
/* Sperre und Einblenden der Kartenknöpfe nach dem automatischen Öffnen */
function renderDraftLock(){
  const locked = draftLocked();
  $('draftOffer').classList.toggle('locked', locked);
  for (const b of $('draftOffer').children) setDis(b, locked);
}

/* ---------- Armee: Vorschau je Lane (REQ-14.3) und Ereignisse ---------- */
const GLYPH = { laeufer: '\u25A0', werfer: '\u25B2', schild: '\u25C6', reiter: '\u25C7', schwertkaempfer: '\u25A0', bogenschuetze: '\u25B2' };
let previewKey = '', lastLogKey = '';
function countLine(group, lane){
  const n = {};
  for (const q of group) if (q.lane === lane) n[q.type] = (n[q.type] || 0) + 1;
  return Object.keys(C.UNITS).filter(k => n[k]).map(k => `${GLYPH[k]}×${n[k]}`).join(' ') || '–';
}
function renderPreview(){
  const S = G.S, enemy = S.nextEnemy || [], own = G.assignLanes(S.queue.map(q => q.type), G.strongerLane(enemy));
  const key = lang + JSON.stringify(enemy) + JSON.stringify(own);
  if (key === previewKey) return;
  previewKey = key;
  const box = $('wavePreview'); box.innerHTML = '';
  const cell = (cls, text) => { const e = document.createElement('span'); if (cls) e.className = cls; e.textContent = text; box.appendChild(e); };
  cell('', ''); cell('p', t('preview.own')); cell('e', t('preview.enemy'));
  for (let l = 0; l < C.LANE_COUNT; l++){ cell('', t('lane.' + l)); cell('p', countLine(own, l)); cell('e', countLine(enemy, l)); }
}
function logParams(entry){
  const p = Object.assign({}, entry.params);
  if (p.seconds !== undefined) p.duration = dur(p.seconds);
  if (p.amount !== undefined) p.amount = fmt(p.amount);
  if (p.tier !== undefined) p.tier = ROMAN[p.tier];
  return p;
}
function renderLog(){
  const S = G.S, logKey = lang + S.log.map(l => l.t + l.key).join('|');
  if (logKey === lastLogKey) return;
  lastLogKey = logKey;
  const ol = $('log'); ol.innerHTML = '';
  for (const l of S.log){
    const li = document.createElement('li');
    const ts = document.createElement('span'); ts.className = 'ts'; ts.textContent = clock(l.t);
    li.append(ts, document.createTextNode(t(l.key, logParams(l))));
    ol.appendChild(li);
  }
}

/* ---------- Universität: Forschungsbaum (REQ-5.07) ---------- */
const researchName = (r, tier) => r.tiers.length > 1 ? `${t(r.nameKey)} ${ROMAN[tier]}` : t(r.nameKey);
function researchParams(r, tier){
  const e = (r.tiers[Math.max(1, tier) - 1].effect || [])[0] || {};
  return { e1: e.mul !== undefined ? pct(Math.abs(e.mul - 1)) : e.add !== undefined ? fmtNum(e.add) : '' };
}
function researchReason(id){
  const b = G.researchBlock(id), r = G.RES[id];
  switch (b){
    case null: case 'maxed': return null;
    case 'notRunning': return t('tip.notRunning');
    case 'noUni': return t('tip.needsBuilding', { name: t('bld.universitaet.name') });
    case 'requires': return t('research.requires', { name: researchName(G.RES[r.requires.research], r.requires.tier) });
    case 'closed': { const src = G.keySource('forschung:' + id); return t('kp.res.opensWith', { name: src && G.OPT[src] ? t(G.OPT[src].nameKey) : '' }); }
    case 'active': return t('research.running');
    case 'busy': return t('research.busy', { n: G.researchSlots() });
    case 'material': return missing('material', G.researchCost(id), G.S.material);
  }
  return null;
}
let resRunKey = '';
function renderResearch(){
  const S = G.S;
  const inMode = r => G.researchBlock(r.id) !== 'notInMode';
  setHidden($('resPfad'), S.pacing !== 'karten');
  for (const [cid, g] of Object.entries(resGroupsAll)) setHidden(g.g, S.pacing !== 'karten' || G.cardExcluded(cid));
  for (const r of G.RESEARCH){
    const el = resEls[r.id], n = G.researchTier(r.id), next = G.researchNext(r.id);
    setHidden(el.btn, !inMode(r));
    if (!inMode(r)) continue;
    if (el.group) setText(el.group.h, t(G.OPT[el.card].nameKey));
    setText(el.label, researchName(r, Math.min(n + 1, r.tiers.length)));
    setHidden(el.tag, n === 0);
    if (n > 0) setText(el.tag, `${n}/${r.tiers.length}`);
    setText(el.expl, G.researchBlock(r.id) === 'closed' ? researchReason(r.id) : next ? t('research.expl', { effect: t(r.descKey, researchParams(r, n + 1)), cost: costText('material', next.cost), s: next.timeS })
                          : t('opt.max'));
    setDis(el.btn, !!G.researchBlock(r.id));
  }
  // Laufende Forschung mit Fortschrittsbalken; Knoten nur neu bei geänderter Liste
  const box = $('resActive'), key = lang + S.research.active.map(a => a.id + a.tier).join();
  if (key !== resRunKey){
    resRunKey = key; box.innerHTML = '';
    for (const a of S.research.active){
      const row = document.createElement('div'); row.className = 'res-run';
      row.innerHTML = '<span></span><span class="num"></span><span class="bar steel"><i></i></span>';
      row.children[0].textContent = t('research.runningName', { name: researchName(G.RES[a.id], a.tier) });
      // Beschleunigen gegen Material (REQ-6.06)
      const id = a.id;
      row.appendChild(mkButton('btn-ghost rush', t('research.rush'), () => { if (G.rushResearch(id)) requestRender(); }, 'rush:' + id, ''));
      box.appendChild(row);
    }
  }
  S.research.active.forEach((a, i) => {
    const row = box.children[i]; if (!row) return;
    setText(row.children[1], clock(Math.max(0, Math.ceil(a.timeS - a.t))));
    setWidth(row.children[2].firstChild, 100 * Math.min(1, a.t / a.timeS));
    const rb = row.children[3], cost = G.rushCost(a.id);
    setText(rb.querySelector('.expl'), t('ex.research.rush', { cost: costText('material', cost), s: Math.max(0, Math.ceil(a.timeS - a.t)) }));
    setDis(rb, S.status !== 'running' || S.material < cost);
  });
  if (activeTab === 'uni') S.research.fresh = false;
  // Rückmeldung bei abgeschlossener Forschung (REQ-6.06): kurzer Hinweis über dem Arbeitsbereich, dazu die Markierung am Reiter
  const done = S.stats.researchDone || [];
  if (done.length !== resDoneSeen){
    if (done.length > resDoneSeen && resDoneSeen >= 0){ const d = done[done.length - 1]; toast(t('research.doneToast', { name: researchName(G.RES[d.id], d.tier) })); }
    resDoneSeen = done.length;
  }
}
let resDoneSeen = -1, toastTimer = null;
function toast(text){
  const el = $('toast'); if (!el) return;
  setText(el, text); setHidden(el, false);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => setHidden(el, true), C.UI.toastMs);
}

/* ---------- Gesamter Arbeitsbereich ---------- */
function renderPanels(){
  const S = G.S, running = S.status === 'running';
  autoDraft();
  if (!tabVisible(activeTab)) activeTab = 'build';                      // Reiter verschwunden (Schmiede abgerissen)
  for (const id of TABS){
    const el = tabEls[id], on = id === activeTab;
    setHidden(el.btn, !tabVisible(id));
    el.btn.setAttribute('aria-selected', String(on));
    el.btn.tabIndex = on ? 0 : -1;
    setText(el.label, t('tab.' + id));
    setText(el.expl, t('ex.tab.' + id));
    setHidden(el.panel, !on);
    // „neu“ am Reiter, bis er einmal angesehen wurde
    setText(el.fresh, t('mark.new'));
    setHidden(el.fresh, !tabVisible(id) || on || !NewMarks.isNew('tab:' + id));
    if (on) NewMarks.view('tab:' + id);
  }
  // Markierung: Reiter mit neuem Inhalt (offene Kartenwahl)
  setHidden(tabEls.cards.mark, !(S.pendingDraft && activeTab !== 'cards' && !Stage.on()));
  setHidden(tabEls.uni.mark, !(S.research.fresh && activeTab !== 'uni'));

  // Klickfeld
  const cp = G.clickPower(), cpText = cp < 10 && cp % 1 ? fmt1(cp) : fmt(cp), auto = G.autoPressCps();
  setText($('clickHint'), cpText);
  setText($('clickExpl'), auto > 0 ? t('ex.clickAuto', { n: fmt1(auto) }) : t('ex.click', { n: cpText }));
  setText($('perClick'), t('hud.perClick', { n: cpText }));
  setDis($('clickBtn'), !running);
  $('clickBtn').classList.toggle('late', G.phase() === 'late');   // REQ-03.5: tritt in Phase Spät zurück

  renderOpts();
  renderContext();
  renderDraftLock();
  // Kaserne im Reiter Armee (REQ-6.05)
  const kas = G.has('kaserne');
  setText($('kaserneStatus'), kas ? t('kaserne.status.built', { n: G.kaserneLevel(), m: G.supplyCap() }) : t('kaserne.status.none'));
  setHidden(kaserneBuildBtn, kas);
  setText(kaserneBuildBtn.querySelector('.btn-label'), t('kaserne.build'));
  setText(kaserneBuildBtn.querySelector('.expl'), t('ex.kaserne.build', { cost: costText('material', G.buildCost('kaserne')) }));
  setDis(kaserneBuildBtn, !running);
  setHidden(waveRushBtn, !kas);
  setText(waveRushBtn.querySelector('.btn-label'), t('wave.rush'));
  setText(waveRushBtn.querySelector('.expl'), S.waveRushCd > 0 ? t('ex.wave.rushCd', { s: Math.ceil(S.waveRushCd) })
    : t('ex.wave.rush', { n: S.queue.length, cost: costText('material', G.waveRushCost()) }));
  setDis(waveRushBtn, !!G.waveRushBlock());
  // vorausgewählte Bau-Option (Knopf „Kaserne bauen“): hervorheben und fokussieren, sobald sie sichtbar ist
  if (preselect){
    const p = picks.find(q => q.type === preselect);
    for (const q of picks) q.b.classList.toggle('preselected', q === p);
    if (p){ p.b.focus({ preventScroll: true }); preselect = null; }
    else if (activeTab !== 'build') preselect = null;
  }
  setHidden($('buildHint'), !!sel && sel.kind === 'plot');
  $('tabBody').classList.toggle('side-by-side', activeTab === 'build');
  for (let i = 0; i < gridEls.length; i++){
    const g = gridEls[i], sl = S.slots[i];
    setText(g.label, t('grid.cell', { n: i + 1 }));
    // Raster: Gebäude mit ihrem aktuellen Nachbarschaftsbonus (REQ-6.07 a)
    const nbv = sl ? G.neighborValue(i, sl.type) : 0, rule = sl ? G.NEIGHBORS.find(r => r.building === sl.type) : null;
    setText(g.expl, sl ? t(`bld.${sl.type}.name`) + (nbv && rule ? ' · ' + t('nb.cell', { total: nbFmt(rule, nbv) }) : '') : t('grid.free'));
    g.btn.classList.toggle('built', !!sl);
    g.btn.setAttribute('aria-selected', String(!!sel && sel.kind === 'plot' && sel.i === i));
  }
  setText($('factoryStat'), t('fab.stat', { n: G.factoryCount(), rate: fmt1(G.factoryRate()), next: costText('material', G.factoryCost()) }));
  // Armee
  setText($('queue'), `${S.queue.length}/${G.supplyCap()}`);
  setText($('ownCount'), fmt(G.ownOnField()));
  setText($('losses'), fmt(S.losses));
  setText($('kills'), fmt(S.kills));
  renderPreview();
  renderLog();
  $('camFollow').setAttribute('aria-pressed', String(Cam.follow));
  setText($('camFollowExpl'), t(Cam.follow ? 'ex.cam.followOn' : 'ex.cam.followOff'));
  // Schmiede, Universität, Karten
  setText($('smithyText'), t('panel.smithy.text', { n: S.lvl.qualitaet }));
  setText($('uniInfo'), t(G.has('universitaet') ? 'level.uniOn' : 'level.uniOff', { n: G.draftSize() }) + ' ' + t(G.has('universitaet') ? 'research.intro' : 'research.needUni', { n: G.researchSlots() }));
  renderResearch();
  renderDraft();
  renderChosen();
  NewMarks.endRender();
}

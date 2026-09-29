/* Klammerfront – Arbeitsbereich, unteres Band (REQ-5.03): Klickfeld links, rechts Reiter mit Kontextkopf.
   Reiter: Bauen, Mauer & Türme, Armee, Schmiede (erst mit Schmiede), Universität, Karten.
   Ein Klick auf ein Objekt in der Welt öffnet dessen Reiter und zeigt es im Kontextkopf; Esc oder ein Klick ins Leere hebt die Auswahl auf.
   Kein automatischer Reiterwechsel ohne Handlung des Spielers. Knöpfe entstehen einmal bzw. nur bei geänderter Auswahl (REQ-5.01). */
'use strict';

const TABS = ['build', 'wall', 'army', 'smithy', 'uni', 'cards'];
let activeTab = 'build';
/* Auswahl in der Welt: null | { kind: 'plot', i } | { kind: 'section', lane } */
let sel = null, ctxKey = '', demolishArmed = false, picks = [];
const tabEls = {}, gridEls = [];

/* Reiter eines Objekts: Schmiede und Universität haben eigene Reiter, übrige Gebäude und Bauplätze gehören zu Bauen */
function tabForSel(s){
  if (!s) return null;
  if (s.kind === 'section') return 'wall';
  const sl = G.S.slots[s.i];
  return sl && sl.type === 'schmiede' ? 'smithy' : sl && sl.type === 'universitaet' ? 'uni' : 'build';
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

/* Wirkung eines Gebäudes für Erklärzeilen: neu gebaut (built = false) oder wie es gerade wirkt */
function bldEffect(type, built){
  switch (type){
    case 'fabrik': return t('fx.fabrik', { rate: fmt1(G.factoryRate()) });
    case 'schmiede': return t('fx.schmiede', { n: G.S.lvl.qualitaet });
    case 'kaserne': return t('fx.kaserne', { n: built ? G.kaserneLevel() : 1, m: C.KASERNE_SUPPLY_PER_LEVEL * (built ? G.kaserneLevel() : 1) });
    case 'universitaet': return t('fx.universitaet', { n: C.DRAFT_OPTIONS_UNIVERSITY });
    case 'kontor': return t('fx.kontor', { percent: fmt1(G.interestRate() * 100), s: C.KONTOR.intervalS });
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
    b.innerHTML = '<span class="btn-label"></span><span class="expl"></span><i class="mark" hidden></i>';
    b.addEventListener('click', () => selectTab(id, true));
    bar.appendChild(b);
    tabEls[id] = { btn: b, label: b.children[0], expl: b.children[1], mark: b.children[2], panel: $('panel-' + id) };
  }
  bar.addEventListener('keydown', e => {
    const vis = TABS.filter(tabVisible), i = vis.indexOf(activeTab);
    const next = e.key === 'ArrowRight' ? vis[(i + 1) % vis.length] : e.key === 'ArrowLeft' ? vis[(i - 1 + vis.length) % vis.length]
               : e.key === 'Home' ? vis[0] : e.key === 'End' ? vis[vis.length - 1] : null;
    if (next){ e.preventDefault(); selectTab(next, true); }
  });
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
  for (const id in C.UNITS) optEls['unit_' + id] = makeOpt($('optsUnits'), 'unit', 'unit:' + id, () => G.spawn(id));
  for (let i = 0; i < C.LANE_COUNT; i++) optEls['repair_' + i] = makeOpt($('optsRepair'), '', 'repair:' + i, () => G.repair(i));
  ctxRepairOpt = makeOpt($('ctxRepair'), '', 'repair:' + C.GATE_LANE, () => { if (sel && sel.kind === 'section') G.repair(sel.lane); });
  // Klickfeld löst auf pointerdown aus (REQ-5.01); Tastatur (Enter, Leertaste) kommt als click ohne Zeigerereignis
  const press = () => { if (!isDis($('clickBtn'))){ G.doClick(); requestRender(); } };
  $('clickBtn').addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary) press(); });
  $('clickBtn').addEventListener('click', e => { if (e.detail === 0) press(); });
  $('hintOk').addEventListener('click', dismissHint);
  $('camRealm').addEventListener('click', () => { Cam.follow = false; Cam.goTo(0); });
  $('camFront').addEventListener('click', () => { Cam.follow = false; Cam.goTo(Cam.frontTarget()); });
  $('camFollow').addEventListener('click', () => { Cam.follow = !Cam.follow; requestRender(); });
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    for (const [id, spec] of Object.entries(C.UNITS)) if (e.key === spec.key){ G.spawn(id); requestRender(); }
  });
}
/* Sprache gewechselt: dynamisch aufgebaute Knöpfe neu beschriften */
function onLangChange(){ ctxKey = ''; draftKey = ''; chosenKey = ''; previewKey = ''; lastLogKey = ''; }

/* ---------- Kontextkopf: ausgewähltes Objekt mit seinen Aktionen ---------- */
function updatePicks(){
  for (const p of picks){
    const block = G.buildBlock(p.i, p.type), cost = G.buildCost(p.type), why = buildReason(block, cost);
    setText(p.nm, p.type === 'fabrik' ? t('bld.fabrik.nth', { n: G.factoryCount() + 1 }) : t(`bld.${p.type}.name`));
    setText(p.ex, t('ex.line', { effect: bldEffect(p.type, false), cost: costText('material', cost) }));
    setText(p.w, why || ''); setHidden(p.w, !why);
    setDis(p.b, !!block);
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
  for (const g of ['kaserne', 'kontor']) setHidden($(GROUP_BOX[g]), !(sl && sl.type === g));
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
      b.append(nm, c, d, ex, w);
      b.addEventListener('click', () => { if (!isDis(b) && G.buildAt(i, type)){ ctxKey = ''; requestRender(); } });
      build.appendChild(b);
      picks.push({ type, i, b, nm, ex, w });
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
    setHidden(el.btn, !(G.isAvailable(id) && S.revealed[id]));
    if (el.btn.hidden) continue;
    setText(el.label, baseOf(id) === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${baseOf(id)}.name`));
    setHidden(el.tag, lv === 0);
    if (lv > 0) setText(el.tag, u.max !== undefined ? `${lv}/${u.max}` : String(lv));
    setText(el.expl, explUpgrade(id));
    setDis(el.btn, !G.canBuy(id));
  }
  for (const id in C.UNITS){
    const spec = C.UNITS[id], el = optEls['unit_' + id];
    setHidden(el.kbd, false); setText(el.kbd, spec.key);
    setText(el.label, t(`unit.${id}.name`));
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
let chosenKey = '', draftKey = '';
function renderChosen(){
  const st = G.S.draft.stacks, key = lang + JSON.stringify(st);
  if (key === chosenKey) return;
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
  const key = lang + JSON.stringify(d);
  if (key === draftKey) return;
  draftKey = key;
  const list = $('draftOffer'); list.innerHTML = '';
  if (!d) return;
  setText($('draftTitle'), t('draft.eyebrow', { n: d.level }));
  const more = S.pendingLevels - 1;
  setText($('draftText'), t('draft.text') + (more > 0 ? ' ' + t('draft.queue', { n: more }) : ''));
  d.options.forEach((id, i) => {
    const o = G.OPT[id], tier = G.cardTaken(id) + 1;
    const b = document.createElement('button');
    b.type = 'button'; b.className = ['pick', 'card-pick', cardClass(o)].join(' '); b.dataset.tooltip = 'draftopt:' + i;
    const nm = document.createElement('b'); nm.textContent = cardName(o, tier);
    const k = document.createElement('span'); k.className = 'k'; k.textContent = `${t('draft.cat.' + o.category)} · ${t('draft.rarity.' + o.rarity)}`;
    const ds = document.createElement('span'); ds.className = 'd'; ds.textContent = t(o.descKey, optParams(o, tier));
    const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = t('ex.card', { tier: optLimit(o) });
    b.append(nm, k, ds, ex);
    b.addEventListener('click', () => { if (G.S.pendingDraft && G.chooseDraft(i)){ chosenKey = ''; requestRender(); } });
    list.appendChild(b);
  });
}

/* ---------- Armee: Vorschau je Lane (REQ-14.3) und Ereignisse ---------- */
const GLYPH = { laeufer: '■', werfer: '▲' };
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

/* ---------- Gesamter Arbeitsbereich ---------- */
function renderPanels(){
  const S = G.S, running = S.status === 'running';
  if (!tabVisible(activeTab)) activeTab = 'build';                      // Reiter verschwunden (Schmiede abgerissen)
  for (const id of TABS){
    const el = tabEls[id], on = id === activeTab;
    setHidden(el.btn, !tabVisible(id));
    el.btn.setAttribute('aria-selected', String(on));
    el.btn.tabIndex = on ? 0 : -1;
    setText(el.label, t('tab.' + id));
    setText(el.expl, t('ex.tab.' + id));
    setHidden(el.panel, !on);
  }
  // Markierung: Reiter mit neuem Inhalt (offene Kartenwahl)
  setHidden(tabEls.cards.mark, !(S.pendingDraft && activeTab !== 'cards'));

  // Klickfeld
  const cp = G.clickPower(), cpText = cp < 10 && cp % 1 ? fmt1(cp) : fmt(cp), auto = G.autoPressCps();
  setText($('clickHint'), cpText);
  setText($('clickExpl'), auto > 0 ? t('ex.clickAuto', { n: fmt1(auto) }) : t('ex.click', { n: cpText }));
  setText($('perClick'), t('hud.perClick', { n: cpText }));
  setDis($('clickBtn'), !running);
  $('clickBtn').classList.toggle('late', G.phase() === 'late');   // REQ-03.5: tritt in Phase Spät zurück

  renderOpts();
  renderContext();
  setHidden($('buildHint'), !!sel && sel.kind === 'plot');
  $('tabBody').classList.toggle('side-by-side', activeTab === 'build');
  for (let i = 0; i < gridEls.length; i++){
    const g = gridEls[i], sl = S.slots[i];
    setText(g.label, t('grid.cell', { n: i + 1 }));
    setText(g.expl, sl ? t(`bld.${sl.type}.name`) : t('grid.free'));
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
  setText($('uniInfo'), t(G.has('universitaet') ? 'level.uniOn' : 'level.uniOff', { n: G.draftSize() }));
  renderDraft();
  renderChosen();
}

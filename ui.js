/* Klammerfront – Browser-Teil: Sprache, Speichern, Oberfläche, Zeichnen, Hauptschleife.
   Sichtbare Texte kommen ausschließlich aus den Sprachdateien (t()). */
(() => {
'use strict';
const C = KF_CONFIG;
const G = KlammerCore.create();
const $ = id => document.getElementById(id);

/* ================= Sprache ================= */
function storageGet(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
function storageSet(k, v){ try { localStorage.setItem(k, v); } catch (e) { /* Speicher nicht verfügbar */ } }
function defaultLang(){
  const saved = storageGet(C.LANG_KEY);
  if (C.LANGUAGES.includes(saved)) return saved;
  return (navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en';
}
let lang = defaultLang();
let nf, nf1;
function setLang(l){
  lang = C.LANGUAGES.includes(l) ? l : C.FALLBACK_LANG;
  storageSet(C.LANG_KEY, lang);
  const locale = t('meta.locale');
  nf  = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  nf1 = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  document.documentElement.lang = lang;
  applyStaticTexts();
}
function t(key, params){
  let s = KF_I18N[lang] && KF_I18N[lang][key];
  if (s === undefined){
    console.warn(`[i18n] Schlüssel fehlt in "${lang}": ${key}`);
    s = KF_I18N[C.FALLBACK_LANG][key];
    if (s === undefined) return key;
  }
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => {
    const v = params[k];
    if (v === undefined) return m;
    return (typeof v === 'string' && v[0] === '@') ? t(v.slice(1)) : v;
  });
  return s;
}
function applyStaticTexts(){
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('lane').setAttribute('aria-label', t('lane.aria'));
  $('footVersion').textContent = t('foot.version', { v: C.VERSION });
}

/* ================= Zahlen und Zeit ================= */
function fmt(n){
  n = Math.floor(n);
  const a = Math.abs(n);
  if (a >= 1e9)  return t('num.billion',  { n: nf1.format(n / 1e9) });
  if (a >= 1e6)  return t('num.million',  { n: nf1.format(n / 1e6) });
  if (a >= 1e4)  return t('num.thousand', { n: nf1.format(n / 1e3) });
  return nf.format(n);
}
const fmt1 = n => nf1.format(n);
const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function dur(sec){
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? t('time.hm', { h, m }) : t('time.m', { m: Math.max(1, m) });
}
const pct = x => Math.round(x * 100);
/* Kennzahlen für die Beschreibungen, direkt aus der Konfiguration */
const DESC_PARAMS = {
  fertiger:   () => ({ n: fmt1(C.FX_FERTIGER_RATE), m: C.FX_FERTIGER_MILESTONE }),
  presse:     () => ({ n: C.FX_PRESSE }),
  druckluft:  () => ({ percent: pct(C.FX_DRUCKLUFT - 1) }),
  takt:       () => ({ percent: pct(C.FX_TAKT - 1) }),
  serie:      () => ({ percent: pct(C.FX_SERIE) }),
  klingen:    () => ({ percent: pct(C.FX_KLINGEN - 1) }),
  ruestung:   () => ({ percent: pct(C.FX_RUESTUNG - 1) }),
  drill:      () => ({ percent: pct(1 - C.FX_DRILL) }),
  rekrutierung:  () => ({ percent: pct(C.FX_REKRUTIERUNG) }),
  exerzierplatz: () => ({ percent: pct(1 - C.FX_EXERZIER) }),
  stube:         () => ({ n: C.FX_STUBE }),
  zinseszins:    () => ({ percent: fmt1(C.FX_ZINSESZINS * 100) }),
  nacht:      () => ({ n: C.FX_NACHT_HOURS }),
  mauer:      () => ({ n: C.FX_MAUER_HP }),
  stacheln:   () => ({ n: C.FX_STACHELN_DMG }),
  moertel:    () => ({ n: C.FX_MOERTEL_REGEN }),
  turm:       () => ({ n: C.PLAYER_TURRET.dmgPerLevel }),
  reichweite: () => ({ n: C.PLAYER_TURRET.rangePerLevel }),
  kadenz:     () => ({ percent: pct(1 - C.PLAYER_TURRET.cdFactor) }),
};
const costText = (cur, n) => t(cur === 'scrap' ? 'cost.scrap' : 'cost.material', { n: fmt(n) });


/* ================= Tooltips (REQ-05) ================= */
const isDis = el => el.getAttribute('aria-disabled') === 'true';
function setDis(el, d){ el.setAttribute('aria-disabled', d ? 'true' : 'false'); }
/* Kennzahl je Upgrade: Wert vor und nach dem Kauf */
const METRICS = {
  fertiger:   ['tip.m.matRate',      () => G.matRate(), v => fmt1(v)],
  presse:     ['tip.m.perClick',     () => G.clickPower(), v => fmt(v)],
  druckluft:  ['tip.m.matRate',      () => G.matRate(), v => fmt1(v)],
  takt:       ['tip.m.matRate',      () => G.matRate(), v => fmt1(v)],
  serie:      ['tip.m.fertigerCost', () => G.upCost('fertiger'), v => fmt(v)],
  klingen:    ['tip.m.dmg',          () => C.UNITS.laeufer.dmg * G.dmgMultP(), v => fmt1(v)],
  ruestung:   ['tip.m.hp',           () => C.UNITS.laeufer.hp * G.hpMultP(), v => fmt(v)],
  drill:      ['tip.m.atkRate',      () => 1 / (C.UNITS.laeufer.cd * G.cdMultP()), v => fmt1(v)],
  rekrutierung:  ['tip.m.unitCost',  () => G.unitCost('laeufer'), v => fmt(v)],
  exerzierplatz: ['tip.m.spawnGap',  () => G.spawnGap(), v => fmt1(v)],
  stube:         ['tip.m.queueMax',  () => G.queueMax(), v => fmt(v)],
  zinseszins:    ['tip.m.interest',  () => G.interestRate() * 100, v => fmt1(v) + ' %'],
  nacht:      ['tip.m.offline',      () => G.offlineHours(), v => fmt(v)],
  mauer:      ['tip.m.baseMax',      () => G.baseMax(), v => fmt(v)],
  stacheln:   ['tip.m.thorns',       () => C.FX_STACHELN_DMG * G.S.lvl.stacheln, v => fmt(v)],
  moertel:    ['tip.m.regen',        () => C.FX_MOERTEL_REGEN * G.S.lvl.moertel, v => fmt1(v)],
  turm:       ['tip.m.turretDmg',    () => G.turretDmg(), v => fmt(v)],
  reichweite: ['tip.m.turretRange',  () => G.turretRange(), v => fmt(v)],
  kadenz:     ['tip.m.turretRate',   () => 60 / G.turretCd(), v => fmt(v)],
};
function previewUpgrade(id){
  const [label, f, show] = METRICS[id];
  const before = f(); G.S.lvl[id]++; const after = f(); G.S.lvl[id]--;
  return [t(label), `${show(before)} → ${show(after)}`];
}
function missing(cur, need, have){ return t('tip.missing', { n: costText(cur, Math.ceil(need - have)) }); }
function buildReason(block, cost){
  switch (block){
    case null: return null;
    case 'notRunning': return t('tip.notRunning');
    case 'locked': return t('build.reason.locked');
    case 'standing': return t('build.reason.standing');
    case 'material': return missing('material', cost, G.S.material);
  }
  return null;
}
function upgradeReason(id){
  const S = G.S, u = C.UPGRADES[id];
  if (S.status !== 'running') return t('tip.notRunning');
  if (G.isMaxed(id)) return t('tip.maxed');
  if (C.BUILDINGS.includes(u.group) && !G.has(u.group)) return t('tip.needsBuilding', { name: t(`bld.${u.group}.name`) });
  if (u.needs && S.lvl[u.needs] <= 0) return t('tip.needsTower');
  if (S[u.cur] < G.upCost(id)) return missing(u.cur, G.upCost(id), S[u.cur]);
  return null;
}
function unitReason(id){
  const S = G.S, c = G.unitCost(id);
  if (S.status !== 'running') return t('tip.notRunning');
  if (S.queue.length >= G.queueMax()) return t('tip.queueFull');
  if (S.material < c) return missing('material', c, S.material);
  return null;
}
/* Inhalt je Tooltip-Kennung: { title, body, rows:[[label, value]], reason } */
function tipContent(id){
  const S = G.S, [kind, a, b] = id.split(':');
  switch (kind){
    case 'upg': {
      const u = C.UPGRADES[a], lv = S.lvl[a];
      const rows = [[t('tip.level'), u.max !== undefined ? `${lv}/${u.max}` : String(lv)]];
      if (!G.isMaxed(a)) rows.push(previewUpgrade(a), [t('tip.cost'), costText(u.cur, G.upCost(a))]);
      return { title: a === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${a}.name`),
               body: t(`upg.${a}.desc`, DESC_PARAMS[a]()), rows, reason: upgradeReason(a) };
    }
    case 'unit': {
      const spec = C.UNITS[a];
      return { title: t(`unit.${a}.name`), body: t('tip.unit.body', { max: G.queueMax(), k: spec.key }),
               rows: [[t('tip.m.role'), t(G.unitRange('p', a) > C.RANGED_MIN_RANGE ? 'unit.role.ranged' : 'unit.role.melee')],
                      [t('tip.m.unitHp'), fmt(spec.hp * G.hpMultP() * G.mMul('unitHp') * (a === 'werfer' ? G.mMul('werferHp') : 1))],
                      [t('tip.m.unitDmg'), fmt1(spec.dmg * G.dmgMultP())],
                      [t('tip.m.range'), fmt(G.unitRange('p', a))], [t('tip.cost'), costText('material', G.unitCost(a))]],
               reason: unitReason(a) };
    }
    case 'repair': {
      const after = Math.min(G.baseMax(), S.baseHp + C.REPAIR_AMOUNT);
      const reason = S.status !== 'running' ? t('tip.notRunning') : S.baseHp >= G.baseMax() ? t('tip.baseFull')
        : S.material < C.REPAIR_COST ? missing('material', C.REPAIR_COST, S.material) : null;
      return { title: t('repair.name'), body: t('tip.repair.body'),
               rows: [[t('tip.m.baseHp'), `${fmt(S.baseHp)} → ${fmt(after)}`], [t('tip.cost'), costText('material', C.REPAIR_COST)]], reason };
    }
    case 'click':
      return { title: t('btn.click'), body: t('tip.click.body', { max: C.MAX_CLICKS_PER_SECOND }), rows: [[t('tip.m.perClick'), fmt1(G.clickPower())], [t('tip.m.matRate'), fmt1(G.matRate())]],
               reason: S.status !== 'running' ? t('tip.notRunning') : null };
    case 'slot': {
      const sl = S.slots[a];
      if (!sl) return { title: t('slot.label', { n: Number(a) + 1 }), body: t('tip.slot.empty'), rows: [[t('tip.cost'), costText('material', G.nextSlotCost())]] };
      return { title: t(`bld.${sl.type}.name`), body: t('tip.slot.built'),
               rows: [[t('tip.refund'), costText('material', G.refundFor(Number(a)))]] };
    }
    case 'pick': {
      const cost = G.nextSlotCost(), block = G.buildBlock(Number(b), a);
      return { title: t(`bld.${a}.name`), body: t('tip.pick.body', { desc: t(`bld.${a}.desc`), n: Number(b) + 1 }),
               rows: [[t('tip.cost'), costText('material', cost)]], reason: buildReason(block, cost) };
    }
    case 'demolish':  return { title: t('slot.demolish'), body: t('tip.demolish.body'), rows: [[t('tip.refund'), costText('material', G.refundFor(Number(a)))]] };
    case 'confirmDemolish': return { title: t('demolish.confirm'), body: t('tip.confirmDemolish.body', { refund: costText('material', G.refundFor(Number(a))) }) };
    case 'cancel': return { title: t('slot.cancel'), body: t('tip.cancel.body') };
    case 'draftopt': {
      const d = S.pendingDraft; if (!d) return { title: '' };
      const o = G.OPT[d.options[a]];
      return { title: t(o.nameKey), body: t(o.descKey, optParams(o)),
               rows: [[t('tip.draft.category'), t('draft.cat.' + o.category)], [t('tip.draft.limit'), optLimit(o)]],
               reason: null, foot: t('tip.draft.choose') };
    }
    case 'chosen': {
      const o = G.OPT[a];
      return { title: t(o.nameKey), body: t(o.descKey, optParams(o)) };
    }
    case 'new':   return { title: t('hdr.newGame'), body: t('tip.new.body') };
    case 'lang':  return { title: t('lang.' + a), body: t('tip.lang.body') };
    case 'diff':  return { title: t(`diff.${a}.name`), body: t(`diff.${a}.desc`) };
    case 'start': return { title: t('start.go'), body: t('tip.start.body') };
    case 'back':  return { title: t('start.back'), body: t('tip.back.body') };
    case 'again': return { title: t('result.again'), body: t('tip.again.body') };
  }
  return { title: id };
}

const Tip = (() => {
  const el = document.createElement('div');
  el.id = 'tip'; el.setAttribute('role', 'tooltip'); el.hidden = true;
  document.body.appendChild(el);
  let target = null, timer = null, visible = false, mode = 'mouse', mx = 0, my = 0;
  let touchStart = null, suppressClick = false, lastTouch = -Infinity;

  function cancel(){ clearTimeout(timer); timer = null; }
  function hide(){ cancel(); visible = false; el.hidden = true; target = null; }
  function schedule(tgt, m){
    cancel(); target = tgt; mode = m; scheduledAt = performance.now();
    timer = setTimeout(show, m === 'touch' ? C.TOUCH_TOOLTIP_MS : C.TOOLTIP_DELAY_MS);
  }
  let scheduledAt = 0, lastDelay = null;
  function show(){
    timer = null; lastDelay = performance.now() - scheduledAt;
    if (!target || !document.body.contains(target) || target.closest('[hidden]')){ hide(); return; }
    visible = true; fill(); el.hidden = false; place();
    if (mode === 'touch') suppressClick = true;
  }
  function fill(){
    const c = tipContent(target.dataset.tooltip);
    el.innerHTML = '';
    const add = (cls, text) => { const d = document.createElement('div'); d.className = cls; d.textContent = text; el.appendChild(d); return d; };
    add('tt', c.title);
    if (c.body) add('tb', c.body);
    if (c.rows && c.rows.length){
      const r = document.createElement('div'); r.className = 'tr';
      for (const [k, v] of c.rows){ const s1 = document.createElement('span'); s1.textContent = k; const s2 = document.createElement('span'); s2.textContent = v; r.append(s1, s2); }
      el.appendChild(r);
    }
    if (c.reason) add('tw', c.reason);
    if (c.foot) add('tb', c.foot);
  }
  function place(){
    const r = el.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, m = C.TOOLTIP_MARGIN;
    let x, y;
    if (mode === 'focus'){
      const b = target.getBoundingClientRect();
      x = b.left; y = b.bottom + 6;
      if (y + r.height > vh - m) y = b.top - r.height - 6;
    } else if (mode === 'touch'){
      x = mx - r.width / 2; y = my - r.height - C.TOOLTIP_OFFSET_Y;
      if (y < m) y = my + C.TOOLTIP_OFFSET_Y;
    } else {
      x = mx + C.TOOLTIP_OFFSET_X; y = my + C.TOOLTIP_OFFSET_Y;
      if (x + r.width > vw - m) x = mx - r.width - C.TOOLTIP_OFFSET_X;
      if (y + r.height > vh - m) y = my - r.height - C.TOOLTIP_OFFSET_Y;
    }
    x = Math.max(m, Math.min(x, vw - m - r.width));
    y = Math.max(m, Math.min(y, vh - m - r.height));
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  const tipTarget = e => e.target instanceof Element ? e.target.closest('[data-tooltip]') : null;

  document.addEventListener('mouseover', e => {
    if (performance.now() - lastTouch < C.TOUCH_MOUSE_GUARD_MS) return;
    const tgt = tipTarget(e);
    mx = e.clientX; my = e.clientY;
    if (tgt && tgt === target && mode === 'mouse') return;       // Bewegung innerhalb desselben Elements
    hide();
    if (tgt) schedule(tgt, 'mouse');
  });
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (visible && mode === 'mouse') place(); });
  document.addEventListener('mouseout', e => {
    if (target && mode === 'mouse' && !(e.relatedTarget instanceof Node && target.contains(e.relatedTarget))) hide();
  });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch'){
      lastTouch = performance.now();
      const tgt = tipTarget(e);
      hide();
      if (tgt){ touchStart = { x: e.clientX, y: e.clientY }; mx = e.clientX; my = e.clientY; schedule(tgt, 'touch'); }
    } else hide();
  }, true);
  document.addEventListener('pointermove', e => {
    if (touchStart && timer && Math.hypot(e.clientX - touchStart.x, e.clientY - touchStart.y) > C.TOUCH_MOVE_TOLERANCE_PX) cancel();
  }, true);
  document.addEventListener('pointerup', e => { if (e.pointerType === 'touch'){ lastTouch = performance.now(); touchStart = null; if (timer) cancel(); } }, true);
  document.addEventListener('pointercancel', () => { touchStart = null; cancel(); }, true);
  document.addEventListener('contextmenu', e => { if (tipTarget(e) && (timer || visible) && mode === 'touch') e.preventDefault(); });
  document.addEventListener('click', e => {
    if (suppressClick){ suppressClick = false; e.preventDefault(); e.stopPropagation(); return; }
  }, true);
  document.addEventListener('focusin', e => {
    if (performance.now() - lastTouch < C.TOUCH_MOUSE_GUARD_MS) return;   // Fokus durch Antippen, nicht durch Tastatur
    const tgt = tipTarget(e);
    if (tgt && tgt.matches(':focus-visible')){ hide(); schedule(tgt, 'focus'); }
  });
  document.addEventListener('focusout', () => { if (mode === 'focus') hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (visible && mode !== 'mouse') place(); }, true);

  return { refresh(){ if (visible){ if (!target || !document.body.contains(target)) hide(); else { fill(); place(); } } }, hide, get visible(){ return visible; }, get lastDelay(){ return lastDelay; } };
})();

/* Entwicklungsmodus (?dev=1): meldet interaktive Elemente ohne Tooltip */
const DEV = /[?&]dev=1\b/.test(location.search);
function tooltipAudit(){
  const sel = 'button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  return [...document.querySelectorAll(sel)].filter(e => !e.dataset.tooltip).map(e => e.outerHTML.slice(0, 100));
}
if (DEV) setInterval(() => { const m = tooltipAudit(); if (m.length) console.warn('[tooltip] ohne Tooltip:', m); }, C.DEV_AUDIT_MS);

/* ================= Speichern ================= */
function save(){
  const S = G.S;
  if (S.status === 'setup') return;
  storageSet(C.SAVE_KEY, JSON.stringify(Object.assign(G.snapshot(), { units: [], enemyQueue: [], savedAt: Date.now() })));
}
function load(){
  const raw = storageGet(C.SAVE_KEY);
  if (!raw) return false;
  try {
    const d = JSON.parse(raw);
    if (!d || d.v !== 3 || !C.DIFFICULTY[d.diff]) return false;
    G.adopt(d);
    if (d.savedAt) G.applyAway((Date.now() - d.savedAt) / 1000);
    return true;
  } catch (e) { return false; }
}
function readRecords(){ try { return JSON.parse(storageGet(C.RECORDS_KEY)) || {}; } catch (e) { return {}; } }
function writeRecord(diff, time){
  const r = readRecords();
  if (!r[diff] || time < r[diff]){ r[diff] = time; storageSet(C.RECORDS_KEY, JSON.stringify(r)); return true; }
  return false;
}

/* ================= Startbildschirm und Ergebnis ================= */
let modalOpen = false, resultShownFor = null;
let pickDiff = C.DEFAULT_DIFFICULTY, canCancel = false;
function mkButton(cls, text, onClick, tip){
  const b = document.createElement('button');
  b.type = 'button'; b.className = cls; b.textContent = text;
  if (tip) b.dataset.tooltip = tip;
  b.addEventListener('click', e => { if (!isDis(b)) onClick(e); });
  return b;
}
function openStart(cancelable){
  modalOpen = true; canCancel = cancelable;
  if (G.S.status !== 'setup') pickDiff = G.S.diff;
  renderStart();
  $('modal').hidden = false;
  $('mBody').querySelector('button').focus();
}
function renderStart(){
  const rec = readRecords();
  $('mEyebrow').textContent = t('start.eyebrow');
  $('mTitle').textContent = t('start.title');
  $('mText').textContent = canCancel ? t('start.discard') : t('start.note');
  const body = $('mBody'); body.innerHTML = '';

  const langField = document.createElement('div'); langField.className = 'field';
  const ll = document.createElement('span'); ll.className = 'field-label'; ll.textContent = t('start.language');
  const seg = document.createElement('div'); seg.className = 'seg';
  for (const l of C.LANGUAGES){
    const b = mkButton('', t('lang.' + l), () => { setLang(l); renderStart(); render(); }, 'lang:' + l);
    b.setAttribute('aria-pressed', String(l === lang));
    seg.appendChild(b);
  }
  langField.append(ll, seg);

  const diffField = document.createElement('div'); diffField.className = 'field';
  const dl = document.createElement('span'); dl.className = 'field-label'; dl.textContent = t('start.difficulty');
  const diffs = document.createElement('div'); diffs.className = 'diffs';
  for (const key of C.DIFFICULTY_ORDER){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'diff'; b.dataset.tooltip = 'diff:' + key;
    b.setAttribute('aria-pressed', String(key === pickDiff));
    const nm = document.createElement('b'); nm.textContent = t(`diff.${key}.name`);
    const rc = document.createElement('span'); rc.className = 'rec'; rc.textContent = rec[key] ? t('start.record', { time: clock(rec[key]) }) : '';
    const ds = document.createElement('span'); ds.className = 'd'; ds.textContent = t(`diff.${key}.desc`);
    b.append(nm, rc, ds);
    b.addEventListener('click', () => { pickDiff = key; renderStart(); });
    diffs.appendChild(b);
  }
  diffField.append(dl, diffs);
  body.append(langField, diffField);

  const act = $('mActions'); act.innerHTML = '';
  if (canCancel) act.appendChild(mkButton('btn-ghost', t('start.back'), closeModal, 'back'));
  act.appendChild(mkButton('btn-primary', t('start.go'), () => startGame(pickDiff), 'start'));
}
function openResult(){
  modalOpen = true;
  const S = G.S, won = S.status === 'won';
  const record = won && writeRecord(S.diff, S.t);
  const p = { diff: '@diff.' + S.diff + '.name', time: clock(S.t) };
  $('mEyebrow').textContent = t(won ? 'result.won.eyebrow' : 'result.lost.eyebrow', p);
  $('mTitle').textContent = t(won ? 'result.won.title' : 'result.lost.title');
  $('mText').textContent = won
    ? t('result.won.text', { kills: fmt(S.kills), material: fmt(S.materialTotal) }) + (record ? ' ' + t('result.record') : '')
    : t('result.lost.text', { kills: fmt(S.kills) });
  $('mBody').innerHTML = '';
  const act = $('mActions'); act.innerHTML = '';
  const b = mkButton('btn-primary', t('result.again'), () => openStart(false), 'again');
  act.appendChild(b);
  $('modal').hidden = false;
  b.focus();
}
function closeModal(){ Tip.hide(); modalOpen = false; $('modal').hidden = true; last = performance.now(); acc = 0; }
function startGame(diff){
  G.newGame(diff, (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
  resultShownFor = null;
  save();
  closeModal();
  render();
}

/* ================= Oberfläche ================= */
const optEls = {};
function makeOpt(parent, cls, tip, onClick){
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'opt ' + (cls || ''); b.dataset.tooltip = tip;
  b.innerHTML = '<span class="opt-name"></span><span class="opt-cost num"></span>';
  b.addEventListener('click', () => { if (!isDis(b)){ onClick(); render(); } });
  parent.appendChild(b);
  return { btn: b, name: b.children[0], cost: b.children[1] };
}
const GROUP_BOX = { fertigung: 'optsFertigung', fabrik: 'optsFabrik', schmiede: 'optsSchmiede', kaserne: 'optsKaserne', kontor: 'optsKontor', mauer: 'optsMauer', turm: 'optsTurm' };

function buildUI(){
  for (const id in C.UPGRADES) optEls[id] = makeOpt($(GROUP_BOX[C.UPGRADES[id].group]), '', 'upg:' + id, () => G.buy(id));
  for (const id in C.UNITS) optEls['unit_' + id] = makeOpt($('optsUnits'), 'unit', 'unit:' + id, () => G.spawn(id));
  optEls.repair = makeOpt($('optsRepair'), '', 'repair', () => G.repair());
  for (let i = 0; i < C.BUILDING_SLOTS; i++){
    const card = document.createElement('button');
    card.type = 'button'; card.className = 'slot slot-btn'; card.dataset.tooltip = 'slot:' + i;
    card.innerHTML = '<span class="slot-head"><span class="slot-no"></span><span class="slot-cost"></span></span><span class="slot-body"></span>';
    card.addEventListener('click', () => { if (!isDis(card)) openSlotDialog(i); });
    $('slots').appendChild(card);
  }
  $('clickBtn').addEventListener('click', () => { if (!isDis($('clickBtn'))){ G.doClick(); render(); } });
  $('newBtn').addEventListener('click', () => openStart(G.S.status === 'running'));
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    for (const [id, spec] of Object.entries(C.UNITS)) if (e.key === spec.key){ G.spawn(id); render(); }
  });
}

let slotKey = '';
function renderSlots(){
  const S = G.S, cost = G.nextSlotCost();
  const key = lang + JSON.stringify(S.slots) + '|' + cost + '|' + S.status;
  if (key === slotKey) return;
  slotKey = key;
  const cards = $('slots').children;
  for (let i = 0; i < cards.length; i++){
    const card = cards[i], body = card.querySelector('.slot-body'), costEl = card.querySelector('.slot-cost');
    card.querySelector('.slot-no').textContent = t('slot.label', { n: i + 1 });
    const sl = S.slots[i];
    body.innerHTML = '';
    setDis(card, S.status !== 'running');
    if (sl){
      card.className = 'slot slot-btn built';
      costEl.textContent = t('slot.built');
      const nm = document.createElement('span'); nm.className = 'slot-name'; nm.textContent = t(`bld.${sl.type}.name`);
      body.appendChild(nm);
    } else {
      card.className = 'slot slot-btn';
      costEl.textContent = costText('material', cost);
      const cta = document.createElement('span'); cta.className = 'slot-cta'; cta.textContent = t('slot.choose');
      body.appendChild(cta);
    }
  }
}

/* Draft (REQ-02) */
function optParams(o){
  const val = e => e.mul !== undefined ? pct(Math.abs(e.mul - 1)) : e.add !== undefined ? e.add : e.seconds !== undefined ? e.seconds : '';
  const p = {};
  if (o.effect && o.effect[0]) p.e1 = val(o.effect[0]);
  if (o.drawback && o.drawback[0]) p.d1 = val(o.drawback[0]);
  if (o.condition && o.condition.value !== undefined) p.c1 = pct(o.condition.value);
  return p;
}
function optLimit(o){
  const n = (G.S.draft.stacks[o.id] || 0) + 1;
  return o.unique ? t('draft.unique') : t('draft.stack', { n, max: o.maxStacks });
}
let chosenKey = '';
function renderChosen(){
  const st = G.S.draft.stacks, key = lang + JSON.stringify(st);
  if (key === chosenKey) return;
  chosenKey = key;
  const box = $('chosen'); box.innerHTML = '';
  const ids = Object.keys(st).filter(id => st[id] > 0);
  if (!ids.length){ const e = document.createElement('span'); e.className = 'hint'; e.textContent = t('level.none'); box.appendChild(e); return; }
  for (const id of ids){
    const o = G.OPT[id], tag = document.createElement('span');
    tag.className = 'opt-tag'; tag.dataset.tooltip = 'chosen:' + id;
    const b = document.createElement('b'); b.textContent = t(o.nameKey);
    tag.appendChild(b);
    if (st[id] > 1) tag.appendChild(document.createTextNode(` ×${st[id]}`));
    box.appendChild(tag);
  }
}
function openDraft(){
  const S = G.S, d = S.pendingDraft;
  const list = document.createElement('div'); list.className = 'diffs';
  d.options.forEach((id, i) => {
    const o = G.OPT[id];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pick'; b.dataset.tooltip = 'draftopt:' + i;
    const nm = document.createElement('b'); nm.textContent = t(o.nameKey);
    const k = document.createElement('span'); k.className = 'k'; k.textContent = t('draft.cat.' + o.category);
    const ds = document.createElement('span'); ds.className = 'd'; ds.textContent = t(o.descKey, optParams(o));
    b.append(nm, k, ds);
    b.addEventListener('click', () => { if (G.S.pendingDraft && G.chooseDraft(i)){ chosenKey = ''; closeModal(); render(); } });
    list.appendChild(b);
  });
  const more = S.pendingLevels - 1;
  showDialog({ eyebrow: t('draft.eyebrow', { n: d.level }), title: t('draft.title'),
               text: t('draft.text') + (more > 0 ? ' ' + t('draft.queue', { n: more }) : ''), body: [list], actions: [], wide: true,
               focus: list.firstChild });
}

/* Dialoge für Bauplätze (REQ-01.5 / 01.6) */
function showDialog({ eyebrow, title, text, body, actions, focus, wide }){
  Tip.hide();
  modalOpen = true;
  document.querySelector('#modal .card').classList.toggle('wide', !!wide);
  $('mEyebrow').textContent = eyebrow || '';
  $('mTitle').textContent = title;
  $('mText').textContent = text || '';
  const mb = $('mBody'); mb.innerHTML = ''; (body || []).forEach(n => mb.appendChild(n));
  const act = $('mActions'); act.innerHTML = ''; (actions || []).forEach(n => act.appendChild(n));
  $('modal').hidden = false;
  (focus || act.lastChild || mb.firstChild)?.focus();
}
function openSlotDialog(i){
  const S = G.S, sl = S.slots[i];
  const cancel = mkButton('btn-ghost', t('slot.cancel'), closeModal, 'cancel');
  if (!sl){
    const cost = G.nextSlotCost(), list = document.createElement('div'); list.className = 'diffs';
    for (const type of C.BUILDINGS){
      const block = G.buildBlock(i, type);
      if (block === 'standing') continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pick'; b.dataset.tooltip = `pick:${type}:${i}`;
      const nm = document.createElement('b'); nm.textContent = t(`bld.${type}.name`);
      const c = document.createElement('span'); c.className = 'c'; c.textContent = costText('material', cost);
      const d = document.createElement('span'); d.className = 'd'; d.textContent = t(`bld.${type}.desc`);
      b.append(nm, c, d);
      const why = buildReason(block, cost);
      if (why){ const w = document.createElement('span'); w.className = 'w'; w.textContent = why; b.appendChild(w); }
      setDis(b, !!block);
      b.addEventListener('click', () => { if (!isDis(b) && G.buildAt(i, type)){ slotKey = ''; closeModal(); render(); } });
      list.appendChild(b);
    }
    showDialog({ eyebrow: t('yard.title'), title: t('slot.label', { n: i + 1 }), text: t('slot.dialogText', { cost: costText('material', cost) }),
                 body: [list], actions: [cancel], focus: list.querySelector('.pick:not([aria-disabled="true"])') || cancel });
  } else {
    const refund = costText('material', G.refundFor(i));
    const del = mkButton('btn-ghost', t('slot.demolish'), () => openDemolishConfirm(i), 'demolish:' + i);
    showDialog({ eyebrow: t('slot.label', { n: i + 1 }), title: t(`bld.${sl.type}.name`),
                 text: t('slot.bldText', { desc: t(`bld.${sl.type}.desc`), refund }), actions: [del, cancel], focus: cancel });
  }
}
function openDemolishConfirm(i){
  const sl = G.S.slots[i];
  if (!sl) return closeModal();
  const refund = costText('material', G.refundFor(i));
  const ok = mkButton('btn-danger', t('demolish.confirm'), () => { G.demolish(i); slotKey = ''; closeModal(); render(); }, 'confirmDemolish:' + i);
  const cancel = mkButton('btn-ghost', t('slot.cancel'), closeModal, 'cancel');
  showDialog({ eyebrow: t('slot.label', { n: i + 1 }), title: t('demolish.title', { name: t(`bld.${sl.type}.name`) }),
               text: t('demolish.text', { refund, percent: pct(C.REFUND_RATE) }), actions: [cancel, ok], focus: cancel });
}

function logParams(entry){
  const p = Object.assign({}, entry.params);
  if (p.seconds !== undefined) p.duration = dur(p.seconds);
  if (p.amount !== undefined) p.amount = fmt(p.amount);
  return p;
}

let lastLogKey = '';
function render(){
  const S = G.S, running = S.status === 'running';
  $('material').textContent = fmt(S.material);
  $('rate').textContent = t('hud.perSecond', { n: fmt1(G.matRate()) });
  const cp = G.clickPower(), cpText = cp < 10 && cp % 1 ? fmt1(cp) : fmt(cp);
  $('perClick').textContent = t('hud.perClick', { n: cpText });
  $('clickHint').textContent = cpText;
  $('scrap').textContent = fmt(S.scrap);
  $('clock').textContent = clock(S.t);
  $('kills').textContent = fmt(S.kills);
  $('ownCount').textContent = S.units.filter(u => u.side === 'p').length;
  $('losses').textContent = fmt(S.losses);
  $('queue').textContent = `${S.queue.length}/${G.queueMax()}`;
  $('diffLabel').textContent = S.status === 'setup' ? '' : t(`diff.${S.diff}.name`);
  $('eraLabel').textContent = S.status === 'setup' ? '' : t('hdr.level', { n: S.level, phase: t('phase.' + G.phase()) });
  $('scrapLabel').textContent = t('hud.scrapLevel', { n: S.level });
  setDis($('clickBtn'), !running);
  $('clickBtn').classList.toggle('late', G.phase() === 'late');   // REQ-03.5: tritt in Phase Spät zurück

  for (const id in C.UPGRADES){
    const u = C.UPGRADES[id], el = optEls[id], lv = S.lvl[id];
    el.btn.hidden = !(G.isAvailable(id) && S.revealed[id]);
    if (el.btn.hidden) continue;
    const label = id === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${id}.name`);
    el.name.textContent = label;
    if (lv > 0){ const em = document.createElement('em'); em.textContent = u.max !== undefined ? `${lv}/${u.max}` : String(lv); el.name.appendChild(em); }
    el.cost.textContent = G.isMaxed(id) ? t('opt.max') : costText(u.cur, G.upCost(id));
    setDis(el.btn, !G.canBuy(id));
  }
  for (const id in C.UNITS){
    const spec = C.UNITS[id], el = optEls['unit_' + id], c = G.unitCost(id);
    el.name.innerHTML = '';
    const kbd = document.createElement('kbd'); kbd.textContent = spec.key;
    el.name.append(kbd, document.createTextNode(t(`unit.${id}.name`)));
    el.cost.textContent = costText('material', c);
    setDis(el.btn, !!unitReason(id));
  }
  const r = optEls.repair;
  r.btn.hidden = !S.revealed.repair;
  r.name.textContent = t('repair.name');
  r.cost.textContent = costText('material', C.REPAIR_COST);
  setDis(r.btn, !running || S.material < C.REPAIR_COST || S.baseHp >= G.baseMax());

  $('hintFabrik').hidden = G.has('fabrik');
  $('hintSchmiede').hidden = G.has('schmiede');
  $('hintKaserne').hidden = G.has('kaserne');
  const kontorKnown = G.has('kontor') || !!S.unlocked.kontor;
  $('hintKontor').hidden = kontorKnown;
  $('subKontor').hidden = false;

  const eMax = G.diffCfg().enemyBaseHp;
  $('hpP').textContent = `${fmt(Math.max(0, S.baseHp))} / ${fmt(G.baseMax())}`;
  $('hpE').textContent = `${fmt(Math.max(0, S.enemyBaseHp))} / ${fmt(eMax)}`;
  $('barP').style.width = (100 * Math.max(0, S.baseHp) / G.baseMax()) + '%';
  $('barE').style.width = (100 * Math.max(0, S.enemyBaseHp) / eMax) + '%';
  const xp = G.xpProgress();
  $('lvlLabel').textContent = t('level.progress', { n: xp.level + 1 });
  $('lvlProg').textContent = `${fmt(Math.max(0, xp.cur))} / ${fmt(xp.need)}`;
  $('barLvl').style.width = (100 * Math.max(0, Math.min(1, xp.cur / xp.need))) + '%';
  $('uniInfo').textContent = t(G.has('universitaet') ? 'level.uniOn' : 'level.uniOff', { n: G.draftSize() });
  renderChosen();

  renderSlots();
  Tip.refresh();

  const logKey = lang + S.log.map(l => l.t + l.key).join('|');
  if (logKey !== lastLogKey){
    lastLogKey = logKey;
    const ol = $('log'); ol.innerHTML = '';
    for (const l of S.log){
      const li = document.createElement('li');
      const ts = document.createElement('span'); ts.className = 'ts'; ts.textContent = clock(l.t);
      li.append(ts, document.createTextNode(t(l.key, logParams(l))));
      ol.appendChild(li);
    }
  }
  if (S.status === 'running' && S.pendingDraft && !modalOpen) openDraft();
  if ((S.status === 'won' || S.status === 'lost') && resultShownFor !== S.t && !modalOpen){
    resultShownFor = S.t;
    save();
    openResult();
  }
}

/* ================= Zeichnen ================= */
const cv = $('lane'), ctx = cv.getContext('2d');
let cw = 0, ch = 0, dpr = 1, COL = {};
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = C.LANE, PBW = C.PLAYER_BASE_WIDTH, EBW = C.ENEMY_BASE_WIDTH;

function readColors(){
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['surface', 'surface-2', 'ink', 'ink-faint', 'rule', 'rule-strong', 'steel', 'rust', 'ground', 'brass'])
    COL[k] = cs.getPropertyValue('--' + k).trim();
}
function resize(){
  const r = cv.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cw = r.width; ch = r.height;
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
}
const GY = () => ch - 34;
function hpBar(x, y, w, frac, col){
  ctx.fillStyle = COL['surface-2']; ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), 4);
}
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
function drawPlayerBase(){
  const S = G.S, sx = cw / W, gy = GY(), s = Math.max(0.7, Math.min(1.25, sx * 1.15));
  const slotX = [14, 37, 60];
  for (let i = 0; i < C.BUILDING_SLOTS; i++){
    const cx = slotX[i] * sx, b = S.slots[i] && S.slots[i].type;
    if (b) drawBuilding(b, cx, gy, s);
    else {
      ctx.strokeStyle = COL['rule-strong']; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.strokeRect(cx - 9 * s, gy - 7 * s, 18 * s, 7 * s);
      ctx.setLineDash([]);
    }
  }
  const x0 = 74 * sx, w = (PBW - 74) * sx, h = 62;
  ctx.fillStyle = COL.steel; ctx.fillRect(x0, gy - h, w, h);
  const mw = w / 3;
  ctx.fillRect(x0, gy - h - 7, mw, 7); ctx.fillRect(x0 + 2 * mw, gy - h - 7, mw, 7);
  if (S.lvl.stacheln > 0){
    ctx.fillStyle = COL.ink;
    for (let i = 0; i < 4; i++){ const y = gy - 10 - i * 12; ctx.beginPath(); ctx.moveTo(x0 + w, y); ctx.lineTo(x0 + w + 5, y - 3); ctx.lineTo(x0 + w, y - 6); ctx.fill(); }
  }
  if (G.FX.baseFlash.p > 0){ ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, gy - h, w - 2, h); }
  if (S.lvl.turm > 0){
    ctx.fillStyle = COL.ink;
    const tx = x0 + w / 2;
    ctx.fillRect(tx - 6, gy - h - 17, 12, 10);
    ctx.fillRect(tx + 4, gy - h - 15, 11 + S.lvl.reichweite * 2, 3);
  }
  hpBar(x0 - 4, gy - h - 28, w + 8, S.baseHp / G.baseMax(), COL.steel);
}
function drawEnemyBase(){
  const S = G.S, sx = cw / W, gy = GY();
  const x0 = (W - EBW) * sx, w = EBW * sx, h = 62;
  ctx.fillStyle = COL.rust; ctx.fillRect(x0, gy - h, w, h);
  const mw = w / 5;
  for (let i = 0; i < 5; i += 2) ctx.fillRect(x0 + i * mw, gy - h - 7, mw, 7);
  ctx.fillStyle = COL.surface; ctx.fillRect(x0 + 4, gy - 20, 8, 20);
  if (G.FX.baseFlash.e > 0){ ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, gy - h, w - 2, h); }
  ctx.fillStyle = COL.ink;
  const tx = x0 + w / 2;
  ctx.fillRect(tx - 6, gy - h - 17, 12, 10);
  ctx.fillRect(tx - 15, gy - h - 15, 11, 3);
  hpBar(x0 + 2, gy - h - 28, w - 4, S.enemyBaseHp / G.diffCfg().enemyBaseHp, COL.rust);
}
function drawUnit(u, now){
  const sx = cw / W, gy = GY();
  const us = Math.max(0.75, Math.min(1.5, sx * 1.4));
  const px = u.x * sx;
  const bob = (!reduceMotion && u.moving) ? Math.abs(Math.sin(now / 90 + u.bob)) * 1.5 : 0;
  ctx.fillStyle = u.flash > 0 ? COL.ink : (u.side === 'p' ? COL.steel : COL.rust);
  if (u.type === 'laeufer'){
    const bw = 9 * us, bh = 14 * us;
    ctx.fillRect(px - bw / 2, gy - bh - bob, bw, bh);
    ctx.beginPath(); ctx.arc(px, gy - bh - 4 * us - bob, 3.4 * us, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(u.side === 'p' ? px + bw / 2 : px - bw / 2 - 6 * us, gy - bh * 0.7 - bob, 6 * us, 2 * us);
  } else {
    const bw = 8 * us, bh = 11 * us;
    ctx.beginPath();
    ctx.moveTo(px - bw / 2, gy - bob); ctx.lineTo(px + bw / 2, gy - bob); ctx.lineTo(px, gy - bh - bob);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(px, gy - bh - 3.5 * us - bob, 3 * us, 0, Math.PI * 2); ctx.fill();
  }
  if (u.hp < u.maxHp){
    const w = 14 * us, y = gy - 27 * us - 4;
    ctx.fillStyle = COL['surface-2']; ctx.fillRect(px - w / 2, y, w, 2);
    ctx.fillStyle = u.side === 'p' ? COL.steel : COL.rust; ctx.fillRect(px - w / 2, y, w * Math.max(0, u.hp / u.maxHp), 2);
  }
}
function draw(realDt, now){
  const FX = G.FX;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const sx = cw / W, gy = GY();
  ctx.fillStyle = COL.ground; ctx.fillRect(0, gy, cw, 2);
  ctx.fillStyle = COL.rule;
  for (let x = 200; x < W; x += 100) ctx.fillRect(x * sx, gy + 8, 1, 6);
  drawPlayerBase();
  drawEnemyBase();
  FX.baseFlash.p = Math.max(0, FX.baseFlash.p - realDt);
  FX.baseFlash.e = Math.max(0, FX.baseFlash.e - realDt);
  for (const u of G.S.units) drawUnit(u, now);
  FX.shots = FX.shots.filter(s => (s.t += realDt) < s.dur);
  for (const s of FX.shots){
    const p = s.t / s.dur;
    if (s.turret){
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 1 - p; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.x0 * sx, gy - 76); ctx.lineTo(s.x1 * sx, gy - 10); ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      const x = (s.x0 + (s.x1 - s.x0) * p) * sx, y = gy - 14 - Math.sin(p * Math.PI) * 26;
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  FX.fx = FX.fx.filter(f => (f.t += realDt) < 0.4);
  if (!reduceMotion){
    for (const f of FX.fx){
      const p = f.t / 0.4;
      ctx.strokeStyle = f.side === 'p' ? COL.steel : COL.rust;
      ctx.globalAlpha = 1 - p; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(f.x * sx, gy - 8, 3 + p * 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.fillStyle = COL['ink-faint'];
  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';  ctx.fillText(t('lane.player'), 6, ch - 10);
  ctx.textAlign = 'right'; ctx.fillText(t('lane.enemy'), cw - 6, ch - 10);
}

/* ================= Hauptschleife ================= */
let last = performance.now(), acc = 0, uiAcc = 0, hiddenAt = null;
function frame(now){
  const dt = Math.min(C.MAX_FRAME_S, (now - last) / 1000);
  last = now;
  if (!modalOpen){
    acc += dt;
    while (acc >= C.TICK_S){ G.tick(C.TICK_S); acc -= C.TICK_S; }
  }
  uiAcc += dt;
  draw(dt, now);
  if (uiAcc >= C.UI_REFRESH_S){ uiAcc = 0; render(); }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden){ hiddenAt = Date.now(); save(); }
  else {
    if (hiddenAt) G.applyAway((Date.now() - hiddenAt) / 1000);
    hiddenAt = null; last = performance.now(); acc = 0;
    render();
  }
});
window.addEventListener('pagehide', save);
window.addEventListener('resize', resize);
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);
new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
setInterval(() => { if (G.S.status === 'running') save(); }, C.AUTOSAVE_MS);

// Schnittstelle für automatisierte Browser-Tests
window.__kf = { G, C, t, setLang, startGame, tooltipAudit, Tip, get lang(){ return lang; } };

setLang(lang);
buildUI();
readColors();
resize();
if (load()){ render(); }
else { render(); openStart(false); }
requestAnimationFrame(frame);
})();

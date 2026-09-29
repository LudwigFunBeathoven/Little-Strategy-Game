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
  if (typeof renderHint === 'function' && document.getElementById('hintBox')) renderHint();
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
  presse:     () => ({ n: C.FX_PRESSE }),
  qualitaet:  () => ({ percent: pct(C.FX_QUALITAET) }),
  ausbau:     () => ({ n: C.KASERNE_SUPPLY_PER_LEVEL }),
  zinseszins:    () => ({ percent: fmt1(C.FX_ZINSESZINS * 100) }),
  mauer:      () => ({ n: C.FX_MAUER_HP }),
  stacheln:   () => ({ n: C.FX_STACHELN_DMG }),
  moertel:    () => ({ n: C.FX_MOERTEL_REGEN }),
  turm:       () => ({ n: C.PLAYER_TURRET.dmgPerLevel }),
  reichweite: () => ({ n: C.PLAYER_TURRET.rangePerLevel }),
  kadenz:     () => ({ percent: pct(1 - C.PLAYER_TURRET.cdFactor) }),
};
const costText = (cur, n) => n === 0 ? t('cost.free') : t(cur === 'xp' ? 'cost.xp' : 'cost.material', { n: fmt(n) });
const refundText = n => t('cost.material', { n: fmt(n) });   // Erstattung 0 heißt 0 Material, nicht „gratis“


/* ================= Tooltips (REQ-05) ================= */
const isDis = el => el.getAttribute('aria-disabled') === 'true';
function setDis(el, d){ const v = d ? 'true' : 'false'; if (el.getAttribute('aria-disabled') !== v) el.setAttribute('aria-disabled', v); }
/* Nur geänderte Werte schreiben (REQ-5.01): unveränderte Knoten bleiben unberührt, der Zeiger verliert nie sein Ziel */
function setText(el, s){ s = String(s); if (el.textContent !== s) el.textContent = s; }
function setHidden(el, h){ h = !!h; if (el.hidden !== h) el.hidden = h; }
function setWidth(el, p){ const v = p.toFixed(2) + '%'; if (el.style.width !== v) el.style.width = v; }
/* Neuzeichnen der Oberfläche höchstens einmal je Bild: Handler melden nur Bedarf an */
let uiDirty = true;
function requestRender(){ uiDirty = true; }
/* Kennzahl je Upgrade: Wert vor und nach dem Kauf */
const METRICS = {
  presse:     ['tip.m.perClick',     () => G.clickPower(), v => fmt(v)],
  qualitaet:  ['tip.m.strength',     () => G.qualityMult() * 100, v => fmt(v) + ' %'],
  ausbau:     ['tip.m.queueMax',     () => G.supplyCap(), v => fmt(v)],
  zinseszins:    ['tip.m.interest',  () => G.interestRate() * 100, v => fmt1(v) + ' %'],
  mauer:      ['tip.m.baseMax',      () => G.sectionMax(C.GATE_LANE), v => fmt(v)],
  stacheln:   ['tip.m.thorns',       () => C.FX_STACHELN_DMG * G.S.lvl.stacheln, v => fmt(v)],
  moertel:    ['tip.m.regen',        () => C.FX_MOERTEL_REGEN * G.S.lvl.moertel, v => fmt1(v)],
  turm:       ['tip.m.turretDmg',    lane => G.turretDmg(lane), v => fmt(v)],
  reichweite: ['tip.m.turretRange',  lane => G.turretRange(lane), v => fmt(v)],
  kadenz:     ['tip.m.turretRate',   lane => 60 / G.turretCd(lane), v => fmt(v)],
};
/* Turm-Upgrades gibt es je Turm (REQ-13.6); Texte und Kennzahlen teilen sie sich über base */
const baseOf = id => C.UPGRADES[id].base || id;
function previewUpgrade(id){
  const [label, m, show] = METRICS[baseOf(id)], f = () => m(C.UPGRADES[id].tower);
  const before = f(); G.S.lvl[id]++; const after = f(); G.S.lvl[id]--;
  return [t(label), `${show(before)} → ${show(after)}`];
}
/* Erklärzeile unter jedem Kaufknopf: Wirkung · Kosten (REQ-20.1) */
function explUpgrade(id){
  if (G.isMaxed(id)) return t('opt.max');
  const [label, change] = previewUpgrade(id);
  return t('ex.line', { effect: `${label} ${change}`, cost: costText(C.UPGRADES[id].cur, G.upCost(id)) });
}
function explUnit(id){
  if (G.supplyFull()) return t('tip.supplyFull', { n: G.S.queue.length, max: G.supplyCap() });   // Grund der Sperre (REQ-14.2)
  const spec = C.UNITS[id], hp = spec.hp * G.hpMultP() * G.mMul('unitHp') * (id === 'werfer' ? G.mMul('werferHp') : 1);
  return t('ex.unit', { role: t(G.unitRange('p', id) > C.RANGED_MIN_RANGE ? 'unit.role.ranged' : 'unit.role.melee'), hp: fmt(hp), cost: costText('material', G.unitCost(id)) });
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
function repairReason(i){
  const S = G.S, cost = G.repairCost();
  if (S.status !== 'running') return t('tip.notRunning');
  if (S.sections[i].hp >= G.sectionMax(i)) return t('tip.baseFull');
  if (S.sections[i].repairCd > 0) return t('tip.repairCd', { s: Math.ceil(S.sections[i].repairCd) });
  if (S.material < cost) return missing('material', cost, S.material);
  return null;
}
function unitReason(id){
  const S = G.S, c = G.unitCost(id);
  if (S.status !== 'running') return t('tip.notRunning');
  if (G.supplyFull()) return t('tip.supplyFull', { n: S.queue.length, max: G.supplyCap() });
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
      const base = baseOf(a), where = u.tower !== undefined ? t('tower.where', { lane: t('lane.' + u.tower) }) + ' ' : '';
      return { title: base === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${base}.name`),
               body: where + t(`upg.${base}.desc`, DESC_PARAMS[base]()), rows, reason: upgradeReason(a) };
    }
    case 'unit': {
      const spec = C.UNITS[a];
      return { title: t(`unit.${a}.name`), body: t('tip.unit.body', { max: G.supplyCap(), k: spec.key }),
               rows: [[t('tip.m.role'), t(G.unitRange('p', a) > C.RANGED_MIN_RANGE ? 'unit.role.ranged' : 'unit.role.melee')],
                      [t('tip.m.unitHp'), fmt(spec.hp * G.hpMultP() * G.mMul('unitHp') * (a === 'werfer' ? G.mMul('werferHp') : 1))],
                      [t('tip.m.unitDmg'), fmt1(spec.dmg * G.dmgMultP())],
                      [t('tip.m.range'), fmt(G.unitRange('p', a))], [t('tip.cost'), costText('material', G.unitCost(a))]],
               reason: unitReason(a) };
    }
    case 'repair': {
      const i = Number(a), sec = S.sections[i], max = G.sectionMax(i), cost = G.repairCost();
      const after = Math.min(max, sec.hp + C.REPAIR_AMOUNT);
      return { title: t('repair.' + i), body: t(i === C.GATE_LANE ? 'tip.repair.gate' : 'tip.repair.wall'),
               rows: [[t('tip.m.baseHp'), `${fmt(sec.hp)} → ${fmt(after)}`], [t('tip.cost'), costText('material', cost)]], reason: repairReason(i) };
    }
    case 'click':
      return { title: t('btn.click'), body: t('tip.click.body', { max: C.MAX_CLICKS_PER_SECOND }), rows: [[t('tip.m.perClick'), fmt1(G.clickPower())], [t('tip.m.matRate'), fmt1(G.matRate())]],
               reason: S.status !== 'running' ? t('tip.notRunning') : null };
    case 'cam': return { title: t('cam.' + a), body: t('tip.cam.' + a) };
    case 'world': return { title: t('tip.world.title'), body: t('tip.world.body') };
    case 'scroll': return { title: t('tip.scroll.title'), body: t('tip.scroll.body') };
    case 'ctxBase': return { title: t('ctx.toBase'), body: t('tip.ctxBase.body') };
    case 'pick': {
      const cost = G.buildCost(a), block = G.buildBlock(Number(b), a);
      return { title: t(`bld.${a}.name`), body: t('tip.pick.body', { desc: t(`bld.${a}.desc`), n: Number(b) + 1 }),
               rows: [[t('tip.cost'), costText('material', cost)]], reason: buildReason(block, cost) };
    }
    case 'demolish':  return { title: t('slot.demolish'), body: t('tip.demolish.body'), rows: [[t('tip.refund'), refundText(G.refundFor(Number(a)))]] };
    case 'confirmDemolish': return { title: t('demolish.confirm'), body: t('tip.confirmDemolish.body', { refund: refundText(G.refundFor(Number(a))) }) };
    case 'cancel': return { title: t('slot.cancel'), body: t('tip.cancel.body') };
    case 'draftopt': {
      const d = S.pendingDraft; if (!d) return { title: '' };
      const o = G.OPT[d.options[a]], tier = G.cardTaken(o.id) + 1;
      return { title: cardName(o, tier), body: t(o.descKey, optParams(o, tier)),
               rows: cardRows(o, [[t('tip.draft.limit'), optLimit(o)]]),
               reason: null, foot: t('tip.draft.choose') };
    }
    case 'chosen': {
      const o = G.OPT[a], tier = G.cardTaken(a);
      const rows = tier < o.tiers.length ? [[t('tip.draft.next'), cardName(o, tier + 1)]] : [[t('tip.draft.limit'), t('draft.maxed')]];
      return { title: cardName(o, tier), body: t(o.descKey, optParams(o, tier)), rows: cardRows(o, rows) };
    }
    case 'new':   return { title: t('hdr.newGame'), body: t('tip.new.body') };
    case 'lang':  return { title: t('lang.' + a), body: t('tip.lang.body') };
    case 'diff':  return { title: t(`diff.${a}.name`), body: t(`diff.${a}.desc`) };
    case 'start': return { title: t('start.go'), body: t('tip.start.body') };
    case 'back':  return { title: t('start.back'), body: t('tip.back.body') };
    case 'again': return { title: t('result.again'), body: t('tip.again.body') };
    case 'resetHints': return { title: t('start.resetHints'), body: t('tip.resetHints.body') };
    case 'skipIntro': return { title: t('start.skipIntro'), body: t('tip.skipIntro.body') };
    case 'hintOk': return { title: t('hint.ok'), body: t('tip.hintOk.body') };
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
/* Jeder sichtbare Knopf trägt eine Erklärzeile (REQ-20.1) */
function explAudit(){
  return [...document.querySelectorAll('button')].filter(b => !b.closest('[hidden]') && b.offsetParent !== null)
    .filter(b => { const e = b.querySelector('.expl'); return !e || !e.textContent.trim(); }).map(e => e.outerHTML.slice(0, 100));
}
if (DEV) setInterval(() => {
  const m = tooltipAudit(); if (m.length) console.warn('[tooltip] ohne Tooltip:', m);
  const x = explAudit(); if (x.length) console.warn('[expl] ohne Erklärzeile:', x);
}, C.DEV_AUDIT_MS);

/* ================= Speichern ================= */
function save(){
  const S = G.S;
  if (S.status === 'setup') return;
  storageSet(C.SAVE_KEY, JSON.stringify(Object.assign(G.snapshot(), { units: [], enemyQueue: [], savedAt: Date.now() })));
}
/* Spielstände älterer Versionen (anderer Schlüssel oder andere Versionsnummer) werden nicht übernommen, sondern dem Spieler
   auf dem Startbildschirm gemeldet und erst danach entfernt (Anforderung Iteration 5, Abschnitt 1) */
let discardedSave = false;
function findStaleSaves(){
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if (k && k.startsWith(C.SAVE_PREFIX) && k !== C.SAVE_KEY) keys.push(k);
    }
  } catch (e) { /* Speicher nicht verfügbar */ }
  return keys;
}
function dropStaleSaves(keys){ try { keys.forEach(k => localStorage.removeItem(k)); } catch (e) { /* Speicher nicht verfügbar */ } }
function load(){
  const stale = findStaleSaves();
  if (stale.length){ discardedSave = true; dropStaleSaves(stale); }
  const raw = storageGet(C.SAVE_KEY);
  if (!raw) return false;
  try {
    const d = JSON.parse(raw);
    if (!d || d.v !== KlammerCore.SAVE_VERSION || !C.DIFFICULTY[d.diff]){ discardedSave = true; dropStaleSaves([C.SAVE_KEY]); return false; }
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

/* ================= Erstkontakt-Hinweise (REQ-20.2/20.3) ================= */
const Hints = KF_HINTS.create({ get: storageGet, set: storageSet }, C.HINTS_KEY);
const hintQueue = [];
function showHint(id){
  if (!Hints.trigger(id)) return;
  hintQueue.push(id);
  renderHint();
}
function renderHint(){
  const box = $('hintBox'), id = hintQueue[0];
  box.hidden = !id;
  if (!id) return;
  $('hintTitle').textContent = t('hint.title');
  $('hintText').textContent = t('hint.' + id, { x: C.SIEGE_STRENGTH, cap: G.supplyCap() });
  $('hintOk').querySelector('.btn-label').textContent = t('hint.ok');
  $('hintOk').querySelector('.expl').textContent = t('ex.hintOk');
}
function dismissHint(){ hintQueue.shift(); renderHint(); }

/* ================= Startbildschirm und Ergebnis ================= */
let modalOpen = false, resultShownFor = null;
let pickDiff = C.DEFAULT_DIFFICULTY, canCancel = false;
/* Knopf mit Beschriftung und Erklärzeile darunter (REQ-20.1) */
function mkButton(cls, text, onClick, tip, expl){
  const b = document.createElement('button');
  b.type = 'button'; b.className = cls;
  const nm = document.createElement('span'); nm.className = 'btn-label'; nm.textContent = text;
  const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = expl || '';
  b.append(nm, ex);
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
  $('mText').textContent = (discardedSave ? t('start.oldSave') + ' ' : '') + (canCancel ? t('start.discard') : t('start.note'));
  const body = $('mBody'); body.innerHTML = '';

  const langField = document.createElement('div'); langField.className = 'field';
  const ll = document.createElement('span'); ll.className = 'field-label'; ll.textContent = t('start.language');
  const seg = document.createElement('div'); seg.className = 'seg';
  for (const l of C.LANGUAGES){
    const b = mkButton('', t('lang.' + l), () => { setLang(l); renderStart(); render(); }, 'lang:' + l, t('ex.lang.' + l));
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
    const d = C.DIFFICULTY[key];
    const ex = document.createElement('span'); ex.className = 'expl';
    ex.textContent = t('ex.diff', { hp: fmt(d.enemyBaseHp), size: fmt1(d.waveBase), growth: fmt1(d.waveGrowth) });
    b.append(nm, rc, ds, ex);
    b.addEventListener('click', () => { pickDiff = key; renderStart(); });
    diffs.appendChild(b);
  }
  diffField.append(dl, diffs);
  const hintField = document.createElement('div'); hintField.className = 'field';
  const hl = document.createElement('span'); hl.className = 'field-label'; hl.textContent = t('start.hints');
  const hb = mkButton('btn-ghost', t('start.resetHints'), () => { Hints.reset(); hb.querySelector('.expl').textContent = t('ex.resetHints.done'); }, 'resetHints', t('ex.resetHints'));
  const hrow = document.createElement('div'); hrow.className = 'seg'; hrow.appendChild(hb);
  // Einführung überspringen (REQ-47): alle Systeme von Anfang an sichtbar; die Wahl bleibt im Browser gespeichert
  const skip = storageGet(C.INTRO_SKIP_KEY) === '1';
  const sb = mkButton('btn-ghost', t('start.skipIntro'), () => { storageSet(C.INTRO_SKIP_KEY, skip ? '0' : '1'); renderStart(); },
    'skipIntro', t(skip ? 'ex.skipIntro.on' : 'ex.skipIntro.off'));
  sb.setAttribute('aria-pressed', String(skip));
  hrow.appendChild(sb);
  hintField.append(hl, hrow);
  body.append(langField, diffField, hintField);

  const act = $('mActions'); act.innerHTML = '';
  if (canCancel) act.appendChild(mkButton('btn-ghost', t('start.back'), closeModal, 'back', t('ex.back')));
  act.appendChild(mkButton('btn-primary', t('start.go'), () => startGame(pickDiff), 'start', t('ex.start', { diff: t(`diff.${pickDiff}.name`) })));
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
  const b = mkButton('btn-primary', t('result.again'), () => openStart(false), 'again', t('ex.again'));
  act.appendChild(b);
  $('modal').hidden = false;
  b.focus();
}
function closeModal(){ Tip.hide(); modalOpen = false; $('modal').hidden = true; last = performance.now(); acc = 0; }
function startGame(diff){
  discardedSave = false;
  G.newGame(diff, (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0, { intro: storageGet(C.INTRO_SKIP_KEY) !== '1' });
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
  b.innerHTML = '<span class="opt-name"><kbd hidden></kbd><span></span><em hidden></em></span><span class="expl"></span>';
  b.addEventListener('click', () => { if (!isDis(b)){ onClick(); requestRender(); } });
  parent.appendChild(b);
  const nm = b.children[0];
  return { btn: b, name: nm, kbd: nm.children[0], label: nm.children[1], tag: nm.children[2], expl: b.children[1] };
}
const GROUP_BOX = { fertigung: 'optsFertigung', schmiede: 'optsSchmiede', kaserne: 'optsKaserne', kontor: 'optsKontor', mauer: 'optsMauer', turm_0: 'optsTurm0', turm_2: 'optsTurm2' };

function buildUI(){
  for (const id in C.UPGRADES) optEls[id] = makeOpt($(GROUP_BOX[C.UPGRADES[id].group]), '', 'upg:' + id, () => G.buy(id));
  for (const id in C.UNITS) optEls['unit_' + id] = makeOpt($('optsUnits'), 'unit', 'unit:' + id, () => G.spawn(id));
  for (let i = 0; i < C.LANE_COUNT; i++) optEls['repair_' + i] = makeOpt($('optsRepair'), '', 'repair:' + i, () => G.repair(i));
  // Klickfeld löst auf pointerdown aus (REQ-5.01); Tastatur (Enter, Leertaste) kommt als click ohne Zeigerereignis
  const press = () => { if (!isDis($('clickBtn'))){ G.doClick(); requestRender(); } };
  $('clickBtn').addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary) press(); });
  $('clickBtn').addEventListener('click', e => { if (e.detail === 0) press(); });
  $('hintOk').addEventListener('click', dismissHint);
  $('newBtn').addEventListener('click', () => openStart(G.S.status === 'running'));
  $('camRealm').addEventListener('click', () => { Cam.follow = false; Cam.goTo(0); });
  $('camFront').addEventListener('click', () => { Cam.follow = false; Cam.goTo(Cam.frontTarget()); });
  $('camFollow').addEventListener('click', () => { Cam.follow = !Cam.follow; requestRender(); });
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.repeat) return;
    for (const [id, spec] of Object.entries(C.UNITS)) if (e.key === spec.key){ G.spawn(id); requestRender(); }
  });
}

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

/* ================= Kontext-Panel (REQ-46): Bauplatz, Gebäude oder Basis ================= */
let ctxSel = { kind: 'base' }, ctxKey = '', demolishArmed = false, picks = [];
function updatePicks(){
  for (const p of picks){
    const block = G.buildBlock(p.i, p.type), cost = G.buildCost(p.type), why = buildReason(block, cost);
    setText(p.nm, p.type === 'fabrik' ? t('bld.fabrik.nth', { n: G.factoryCount() + 1 }) : t(`bld.${p.type}.name`));
    setText(p.ex, t('ex.line', { effect: bldEffect(p.type, false), cost: costText('material', cost) }));
    setText(p.w, why || ''); setHidden(p.w, !why);
    setDis(p.b, !!block);
  }
}
function selectPlot(i){ ctxSel = { kind: 'plot', i }; demolishArmed = false; ctxKey = ''; requestRender(); }
function selectBase(){ ctxSel = { kind: 'base' }; demolishArmed = false; ctxKey = ''; requestRender(); }
function renderContext(){
  const S = G.S, plot = ctxSel.kind === 'plot', sl = plot ? S.slots[ctxSel.i] : null;
  $('ctxBase').hidden = plot;
  $('ctxBuilding').hidden = !sl;
  for (const g of ['schmiede', 'kaserne', 'kontor']) $(GROUP_BOX[g]).hidden = !(sl && sl.type === g);
  if (!plot){
    $('ctxTitle').textContent = t('ctx.base');
    $('ctxText').textContent = t('ctx.baseText');
  } else if (!sl){
    $('ctxTitle').textContent = t('slot.label', { n: ctxSel.i + 1 });
    $('ctxText').textContent = t('slot.dialogText');
  } else {
    $('ctxTitle').textContent = t('ctx.building', { name: t(`bld.${sl.type}.name`), n: ctxSel.i + 1 });
    $('ctxText').textContent = `${t(`bld.${sl.type}.desc`)} ${bldEffect(sl.type, true)}.`;
  }
  // Knöpfe werden nur neu gebaut, wenn sich die Auswahl oder die Menge der Optionen ändert, nie wegen Material oder Zeit (REQ-5.01);
  // Kosten, Sperre und Begründung werden danach in den bestehenden Knöpfen aktualisiert
  const key = [lang, JSON.stringify(ctxSel), JSON.stringify(S.slots), demolishArmed, S.status, JSON.stringify(S.unlocked),
               C.BUILDINGS.map(b => plot && !sl ? G.buildBlock(ctxSel.i, b) === 'hidden' || G.buildBlock(ctxSel.i, b) === 'standing' : 0).join()].join('|');
  if (key === ctxKey){ updatePicks(); return; }
  ctxKey = key;
  const build = $('ctxBuild'), dem = $('ctxDemolish'), nav = $('ctxNav');
  build.innerHTML = ''; dem.innerHTML = ''; nav.innerHTML = ''; picks = [];
  if (plot && !sl){
    const i = ctxSel.i;
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
    const i = ctxSel.i, refund = refundText(G.refundFor(i));
    if (!demolishArmed) dem.appendChild(mkButton('btn-ghost', t('slot.demolish'), () => { demolishArmed = true; showHint('demolish'); ctxKey = ''; requestRender(); }, 'demolish:' + i, t('ex.demolish', { refund })));
    else {
      dem.appendChild(mkButton('btn-danger', t('demolish.confirm'), () => { G.demolish(i); demolishArmed = false; ctxKey = ''; requestRender(); }, 'confirmDemolish:' + i, t('ex.demolish', { refund })));
      dem.appendChild(mkButton('btn-ghost', t('slot.cancel'), () => { demolishArmed = false; ctxKey = ''; requestRender(); }, 'cancel', t('ex.cancel')));
    }
  }
  if (plot) nav.appendChild(mkButton('btn-ghost', t('ctx.toBase'), selectBase, 'ctxBase', t('ex.ctx.toBase')));
}

/* Draft (REQ-02) */
/* Spezialkarten (REQ-18): Werte der gezeigten Stufe, Name mit römischer Stufenzahl */
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
    tag.className = 'opt-tag ' + cardClass(o); tag.dataset.tooltip = 'chosen:' + id;
    const b = document.createElement('b'); b.textContent = cardName(o, st[id]);
    tag.appendChild(b);
    box.appendChild(tag);
  }
}
function openDraft(){
  const S = G.S, d = S.pendingDraft;
  const list = document.createElement('div'); list.className = 'diffs';
  d.options.forEach((id, i) => {
    const o = G.OPT[id], tier = G.cardTaken(id) + 1;
    const b = document.createElement('button');
    b.type = 'button'; b.className = ['pick', 'card-pick', cardClass(o)].join(' '); b.dataset.tooltip = 'draftopt:' + i;
    const nm = document.createElement('b'); nm.textContent = cardName(o, tier);
    const k = document.createElement('span'); k.className = 'k'; k.textContent = `${t('draft.cat.' + o.category)} · ${t('draft.rarity.' + o.rarity)}`;
    const ds = document.createElement('span'); ds.className = 'd'; ds.textContent = t(o.descKey, optParams(o, tier));
    const ex = document.createElement('span'); ex.className = 'expl'; ex.textContent = t('ex.card', { tier: optLimit(o) });
    b.append(nm, k, ds, ex);
    b.addEventListener('click', () => { if (G.S.pendingDraft && G.chooseDraft(i)){ chosenKey = ''; closeModal(); requestRender(); } });
    list.appendChild(b);
  });
  showHint('card');
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
/* Wellen-Leiste über dem Schlachtfeld: Countdown und Befehl (REQ-14.1, REQ-15.4) */
function renderWave(){
  const S = G.S;
  $('waveLabel').textContent = t('wave.next', { n: S.ownWaveNo + 1 });
  $('waveIn').textContent = clock(Math.ceil(G.waveIn()));
  // Belagerungswelle: Countdown ab der Ankündigung (REQ-19.3)
  const siege = G.siegeAnnounced();
  $('siegeInfo').hidden = !siege;
  if (siege) $('siegeInfo').textContent = t('wave.siege', { time: clock(Math.ceil(G.siegeIn())), x: C.SIEGE_STRENGTH });
  renderPreview();

}

/* Vorschau je Lane (REQ-14.3): angekündigte Gegnerwelle und Verteilung der eigenen Warteschlange; ■ Nahkampf, ▲ Fernkampf */
const GLYPH = { laeufer: '\u25A0', werfer: '\u25B2' };
let previewKey = '';
function countLine(group, lane){
  const n = {};
  for (const q of group) if (q.lane === lane) n[q.type] = (n[q.type] || 0) + 1;
  return Object.keys(C.UNITS).filter(k => n[k]).map(k => `${GLYPH[k]}\u00D7${n[k]}`).join(' ') || '\u2013';
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

let lastLogKey = '';
function render(){
  uiDirty = false;
  const S = G.S, running = S.status === 'running';
  $('material').textContent = fmt(S.material);
  $('rate').textContent = t('hud.perSecond', { n: fmt1(G.matRate() + G.autoPressCps() * G.clickPower()) });
  const cp = G.clickPower(), cpText = cp < 10 && cp % 1 ? fmt1(cp) : fmt(cp);
  $('perClick').textContent = t('hud.perClick', { n: cpText });
  $('clickHint').textContent = cpText;
  const auto = G.autoPressCps();
  $('clickExpl').textContent = auto > 0 ? t('ex.clickAuto', { n: fmt1(auto) }) : t('ex.click', { n: cpText });
  $('newExpl').textContent = t('ex.newGame');
  $('clock').textContent = clock(S.t);
  $('kills').textContent = fmt(S.kills);
  $('ownCount').textContent = S.units.filter(u => u.side === 'p').length;
  $('losses').textContent = fmt(S.losses);
  $('queue').textContent = `${S.queue.length}/${G.supplyCap()}`;
  renderWave();
  $('diffLabel').textContent = S.status === 'setup' ? '' : t(`diff.${S.diff}.name`);
  $('eraLabel').textContent = S.status === 'setup' ? '' : t('hdr.level', { n: S.level, phase: t('phase.' + G.phase()) });
  setText($('xpLabel'), t('hud.xpLevel', { n: S.level, amount: fmt(S.xp) }));
  setDis($('clickBtn'), !running);
  $('clickBtn').classList.toggle('late', G.phase() === 'late');   // REQ-03.5: tritt in Phase Spät zurück

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
    const spec = C.UNITS[id], el = optEls['unit_' + id], c = G.unitCost(id);
    setHidden(el.kbd, false); setText(el.kbd, spec.key);
    setText(el.label, t(`unit.${id}.name`));
    setText(el.expl, explUnit(id));
    setDis(el.btn, !!unitReason(id));
  }
  for (let i = 0; i < C.LANE_COUNT; i++){
    const r = optEls['repair_' + i];
    setHidden(r.btn, !S.revealed['repair_' + i]);
    setText(r.label, t('repair.' + i));
    setText(r.expl, S.sections[i].repairCd > 0 ? t('tip.repairCd', { s: Math.ceil(S.sections[i].repairCd) })
      : t('ex.repair', { n: fmt(C.REPAIR_AMOUNT), cost: costText('material', G.repairCost()) }));
    setDis(r.btn, !!repairReason(i));
  }

  $('factoryStat').textContent = t('fab.stat', { n: G.factoryCount(), rate: fmt1(G.factoryRate()), next: costText('material', G.factoryCost()) });

  const eMax = G.diffCfg().enemyBaseHp;
  for (let i = 0; i < C.LANE_COUNT; i++){
    const hp = Math.max(0, S.sections[i].hp), max = G.sectionMax(i);
    $('hpP' + i).textContent = hp > 0 || i === C.GATE_LANE ? `${fmt(hp)} / ${fmt(max)}` : t('hud.fallen');
    $('barP' + i).style.width = (100 * hp / max) + '%';
  }
  $('hpE').textContent = `${fmt(Math.max(0, S.enemyBaseHp))} / ${fmt(eMax)}`;
  $('barE').style.width = (100 * Math.max(0, S.enemyBaseHp) / eMax) + '%';
  const xp = G.xpProgress();
  $('lvlLabel').textContent = t('level.progress', { n: xp.level + 1 });
  $('lvlProg').textContent = `${fmt(Math.max(0, xp.cur))} / ${fmt(xp.need)}`;
  $('barLvl').style.width = (100 * Math.max(0, Math.min(1, xp.cur / xp.need))) + '%';
  $('uniInfo').textContent = t(G.has('universitaet') ? 'level.uniOn' : 'level.uniOff', { n: G.draftSize() });
  renderChosen();

  renderContext();
  $('camFollow').setAttribute('aria-pressed', String(Cam.follow));
  $('camFollowExpl').textContent = t(Cam.follow ? 'ex.cam.followOn' : 'ex.cam.followOff');
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
  // Gestaffelte Einführung (REQ-47): Bereiche erscheinen mit ihrem System, jedes mit einmaligem Hinweis
  $('secWave').hidden = !G.introShows('waves');
  $('secCards').hidden = !G.introShows('cards');
  if (S.status === 'running'){
    showHint('start');
    if (G.introShows('waves') && (S.waveNo >= 1 || S.ownWaveNo >= 1)) showHint('wave');
    if (G.introShows('buildings') && (S.level >= C.INTRO_BUILDINGS_LEVEL || !S.intro)) showHint('buildings');
    if (G.siegeAnnounced()) showHint('siege');
  }
  if (S.status === 'running' && S.pendingDraft && !modalOpen) openDraft();
  if ((S.status === 'won' || S.status === 'lost') && resultShownFor !== S.t && !modalOpen){
    resultShownFor = S.t;
    save();
    openResult();
  }
}

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
    const sel = ctxSel.kind === 'plot' && ctxSel.i === i, sl = S.slots[i];
    ctx.fillStyle = sl ? COL.surface : COL.bg; ctx.fillRect(px, py, cell, cell);
    ctx.strokeStyle = sel ? COL.brass : COL['rule-strong']; ctx.lineWidth = sel ? 3 : 1;
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
  const spread = laneH() * 0.15, mid = ((u.rowSize || 1) - 1) / 2;
  return { x: wx(u.x), y: laneMid(lane) + ((u.col || 0) - mid) * spread };
}
function drawUnit(u){
  const p = unitPos(u), r = Math.max(3.5, Math.min(8, laneH() * 0.055)), dir = u.side === 'p' ? 1 : -1;
  if (p.x < realmR() - 4) return;                        // noch im Tor
  ctx.fillStyle = u.flash > 0 ? COL.ink : (u.side === 'p' ? COL.steel : COL.rust);
  if (!u.ranged){
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
  for (const u of G.S.units){ const x = wx(u.x); if (x > left && x < right) drawUnit(u); }
  FX.shots = FX.shots.filter(s => (s.t += realDt) < s.dur);
  for (const s of FX.shots){
    const p = s.t / s.dur, y1 = laneMid(s.lane ?? GATE);
    if (s.turret){
      const x0 = s.lane0 === undefined ? wx(s.x0) : (s.x0 >= W - EBW - 1 ? wx(s.x0) : realmR() - 4), y0 = laneMid(s.lane0 ?? GATE);
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 1 - p; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(wx(s.x1), y1); ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      const x = wx(s.x0 + (s.x1 - s.x0) * p);
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y1 - Math.sin(p * Math.PI) * laneH() * 0.12, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  FX.fx = FX.fx.filter(f => (f.t += realDt) < 0.4);
  if (!reduceMotion){
    for (const f of FX.fx){
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

/* ================= Scrollen (REQ-46): Mausrad, Ziehen ab UI.dragThresholdPx, Pfeiltasten und A/D, Scrollleiste ================= */
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
function handleWorldClick(clientX, clientY){
  const p = screenToWorld(clientX, clientY), hit = r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const plot = plotRects.find(hit);
  if (plot) return selectPlot(plot.i);
  if (sectionRects.find(hit)) selectBase();
}
(() => {
  let down = null, dragging = false;
  const userScroll = x => { Cam.follow = false; Cam.goTo(x); };
  cv.addEventListener('pointerdown', e => { if (e.button !== 0) return; down = { x: e.clientX, y: e.clientY, camX: Cam.x }; dragging = false; });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (!dragging && Math.hypot(dx, e.clientY - down.y) >= C.UI.dragThresholdPx){ dragging = true; cv.classList.add('dragging'); }
    if (dragging) userScroll(down.camX - dx);
  });
  window.addEventListener('pointerup', e => {
    if (!down) return;
    if (!dragging && e.target === cv) handleWorldClick(down.x, down.y);   // Treffer am Druckpunkt, nicht am Loslassen
    down = null; dragging = false; cv.classList.remove('dragging');
  });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    userScroll(Cam.x + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY));
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey || e.target === $('worldScroll')) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a'){ userScroll(Cam.x - C.SCROLL_STEP_PX); e.preventDefault(); }
    if (k === 'arrowright' || k === 'd'){ userScroll(Cam.x + C.SCROLL_STEP_PX); e.preventDefault(); }
  });
  $('worldScroll').addEventListener('input', e => userScroll(Number(e.target.value) / 1000 * Cam.max()));
})();
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
  Cam.update(dt);
  draw(dt, now);
  syncScrollbar();
  if (uiDirty || uiAcc >= C.UI_REFRESH_S){ uiAcc = 0; render(); }
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
if (window.ResizeObserver) new ResizeObserver(resize).observe($('world'));
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);
new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
setInterval(() => { if (G.S.status === 'running') save(); }, C.AUTOSAVE_MS);

// Schnittstelle für automatisierte Browser-Tests
window.__kf = { G, C, t, screenToWorld, worldToScreen, requestRender, setLang, startGame, tooltipAudit, explAudit, Tip, Hints, showHint, Cam, benchDraw, selectPlot, selectBase,
                get plotRects(){ return plotRects; }, get ctxSel(){ return ctxSel; }, get lang(){ return lang; } };

setLang(lang);
buildUI();
readColors();
resize();
if (load()){ render(); }
else { render(); openStart(false); }
requestAnimationFrame(frame);
})();

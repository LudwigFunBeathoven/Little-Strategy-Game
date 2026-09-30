/* Klammerfront – Browser-Teil: Verdrahtung, Sprache, Tooltips, Eingabe, Speichern, Hauptschleife (REQ-5.03).
   Aufteilung ohne Build-Schritt: ui.js lädt zuerst und stellt die gemeinsamen Namen bereit (C, G, $, t, fmt …);
   render.js (Spielwelt), hud.js (Ressourcenleiste) und panels.js (Arbeitsbereich) laden danach.
   Gestartet wird erst, wenn alle Dateien geladen sind (DOMContentLoaded).
   Sichtbare Texte kommen ausschließlich aus den Sprachdateien (t()). */
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  if (typeof renderHint === 'function' && document.getElementById('hintBox')) renderHint();
  $('lane').setAttribute('aria-label', t('lane.aria'));
  $('footVersion').textContent = t('foot.version', { v: C.VERSION });
  if (typeof onLangChange === 'function') onLangChange();
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
    case 'tab':   return { title: t('tab.' + a), body: t('tip.tab.' + a) };
    case 'hud':   return hudTip(a);
    case 'menu':  return { title: t('menu.' + a), body: t('tip.menu.' + a) };
    case 'draftBtn': return { title: t('hud.draft'), body: t('tip.hud.draft') };
    case 'rush': { const act = S.research.active.find(x => x.id === a);
      return { title: t('research.rush'), body: t('tip.research.rush', { name: act ? researchName(G.RES[a], act.tier) : '' }),
               rows: act ? [[t('tip.cost'), costText('material', G.rushCost(a))], [t('research.time'), t('research.seconds', { s: Math.ceil(Math.max(0, act.timeS - act.t)) })]] : [] }; }
    case 'kaserneBuild': return { title: t('kaserne.build'), body: t('tip.kaserne.build'), rows: [[t('tip.cost'), costText('material', G.buildCost('kaserne'))]] };
    case 'res': { const r = G.RES[a], n = G.researchTier(a), next = G.researchNext(a);
      const rows = [[t('tip.level'), `${n}/${r.tiers.length}`]];
      // Wirkung als Vorher/Nachher (REQ-6.06)
      if (next) rows.push([t('tip.research.before'), n ? researchParams(r, n).e1 : '–'], [t('tip.research.after'), researchParams(r, n + 1).e1]);
      if (next) rows.push([t('tip.cost'), costText('material', next.cost)], [t('research.time'), t('research.seconds', { s: next.timeS })]);
      return { title: researchName(r, Math.min(n + 1, r.tiers.length)), body: t(r.descKey, researchParams(r, Math.min(n + 1, r.tiers.length))) + ' ' + t('research.branchOf.' + r.branch),
               rows, reason: researchReason(a) }; }
    case 'reroll': return { title: t('draft.reroll'), body: t('tip.draft.reroll', { n: G.rerollsLeft() }) };
    case 'ban': { const d = S.pendingDraft; const id = d && d.options[a];
      return { title: id ? t('draft.ban', { name: cardName(G.OPT[id], G.cardTaken(id) + 1) }) : t('draft.reroll'), body: t('tip.draft.ban', { n: G.bansLeft() }) }; }
    case 'grid': { const sl = S.slots[a];
      return { title: t('slot.label', { n: Number(a) + 1 }), body: sl ? t(`bld.${sl.type}.name`) + ' · ' + t(`bld.${sl.type}.desc`) : t('tip.grid.empty') }; }
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
  storageSet(C.SAVE_KEY, JSON.stringify(Object.assign(G.snapshot(), { units: [], enemyQueue: [] })));
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
    // Reines Online-Spiel (REQ-6.03): beim Laden vergeht keine Spielzeit, die Partie beginnt pausiert
    if (G.S.status === 'running') setPaused(true);
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


/* ================= Eingabe in der Spielwelt (REQ-46, REQ-5.01) ================= */
/* Klick in die Welt: Objekt auswählen und seinen Reiter öffnen; leere Stelle hebt die Auswahl auf (REQ-5.03) */
function handleWorldClick(clientX, clientY){
  const p = screenToWorld(clientX, clientY), hit = r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const plot = plotRects.find(hit);
  if (plot) return selectPlot(plot.i);
  const sec = sectionRects.find(hit);
  if (sec) return selectSection(sec.lane);
  clearSelection();
}
function wireWorldInput(){
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
    if (e.key === 'Escape'){ clearSelection(); return; }
    if (e.target instanceof Element && e.target.closest('[role="tablist"], [role="grid"]')) return;   // Pfeiltasten gehören dort dem Widget
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a'){ userScroll(Cam.x - C.SCROLL_STEP_PX); e.preventDefault(); }
    if (k === 'arrowright' || k === 'd'){ userScroll(Cam.x + C.SCROLL_STEP_PX); e.preventDefault(); }
  });
  $('worldScroll').addEventListener('input', e => userScroll(Number(e.target.value) / 1000 * Cam.max()));
}
/* ================= Drei Bänder (REQ-5.03): Leiste 10 % (56–80 px), Spielwelt 50 %, Arbeitsbereich Rest ================= */
function bandHeights(H){
  const B = C.UI.bands, hud = Math.round(Math.min(C.UI.hudMaxPx, Math.max(C.UI.hudMinPx, H * B.hud))), world = Math.round(H * B.world);
  return { hud, world, work: H - hud - world };
}
function layoutBands(){
  const h = bandHeights(window.innerHeight), st = document.documentElement.style;
  st.setProperty('--band-hud', h.hud + 'px'); st.setProperty('--band-world', h.world + 'px'); st.setProperty('--band-work', h.work + 'px');
  resize();
}

/* ================= Gesamtaktualisierung: höchstens einmal je Bild (REQ-5.01) ================= */
function render(){
  uiDirty = false;
  const S = G.S;
  renderHud();
  renderPanels();
  Tip.refresh();
  // Gestaffelte Einführung (REQ-47): Systeme erscheinen nacheinander, jedes mit einmaligem Hinweis
  if (S.status === 'running'){
    showHint('start');
    if (G.introShows('waves') && (S.waveNo >= 1 || S.ownWaveNo >= 1)) showHint('wave');
    if (G.introShows('buildings') && (S.level >= C.INTRO_BUILDINGS_LEVEL || !S.intro)) showHint('buildings');
    if (S.pendingDraft) showHint('card');
    if (G.has('universitaet')) showHint('research');
    if (G.siegeAnnounced()) showHint('siege');
  }
  if ((S.status === 'won' || S.status === 'lost') && resultShownFor !== S.t && !modalOpen){
    resultShownFor = S.t;
    save();
    openResult();
  }
}

/* ================= Hauptschleife ================= */
/* Spiellogik im festen Takt TICK_S, Zeichnen in requestAnimationFrame. Pause (Menü) und Dialoge halten die Logik an;
   eine offene Kartenwahl hält sie in core.js an (unverändert aus v0.5). */
let last = performance.now(), acc = 0, uiAcc = 0, paused = false;
function setPaused(p){ paused = !!p; last = performance.now(); acc = 0; requestRender(); }
function frame(now){
  const dt = Math.min(C.MAX_FRAME_S, (now - last) / 1000);
  last = now;
  if (!modalOpen && !paused){
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

/* ================= Start, sobald render.js, hud.js und panels.js geladen sind ================= */
function boot(){
  document.addEventListener('visibilitychange', () => {
    // Tab verdeckt: speichern und pausieren; beim Zurückkehren steht „Weiter“ in der Spielwelt (REQ-6.03)
    if (document.hidden){ save(); if (G.S.status === 'running') setPaused(true); }
    else { last = performance.now(); acc = 0; requestRender(); }
  });
  window.addEventListener('pagehide', save);
  window.addEventListener('resize', layoutBands);
  if (window.ResizeObserver) new ResizeObserver(resize).observe($('world'));
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  setInterval(() => { if (G.S.status === 'running') save(); }, C.AUTOSAVE_MS);

  // Schnittstelle für automatisierte Browser-Tests
  window.__kf = { G, C, t, save, session: () => Session.data, sessionReset: () => Session.reset(), unitLog: id => Session.unitLog(id), drawnPositions: () => drawnPositions(), screenToWorld, worldToScreen, requestRender, setLang, startGame, tooltipAudit, explAudit, Tip, Hints, showHint, Cam, benchDraw,
                  selectPlot, selectSection, clearSelection, selectTab, setPaused,
                  get plotRects(){ return plotRects; }, get sectionRects(){ return sectionRects; }, get sel(){ return sel; }, get ctxSel(){ return sel || { kind: 'none' }; },
                  get tab(){ return activeTab; }, get paused(){ return paused; }, get lang(){ return lang; } };

  setLang(lang);
  document.documentElement.style.setProperty('--draft-lock', C.UI.draftLockMs + 'ms');
  layoutBands();
  buildHud();
  buildPanels();
  wireWorldInput();
  Session.init();
  readColors();
  resize();
  if (load()){ render(); }
  else { render(); openStart(false); }
  requestAnimationFrame(frame);
}
document.addEventListener('DOMContentLoaded', boot);

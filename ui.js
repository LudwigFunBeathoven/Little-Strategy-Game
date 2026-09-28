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
  fertiger:   () => ({ n: fmt1(C.FX_FERTIGER_RATE) }),
  presse:     () => ({ n: C.FX_PRESSE }),
  hydraulik:  () => ({ percent: pct(C.FX_HYDRAULIK) }),
  takt:       () => ({ percent: pct(C.FX_TAKT) }),
  serie:      () => ({ percent: pct(C.FX_SERIE) }),
  klingen:    () => ({ percent: pct(C.FX_KLINGEN - 1) }),
  ruestung:   () => ({ percent: pct(C.FX_RUESTUNG - 1) }),
  drill:      () => ({ percent: pct(1 - C.FX_DRILL) }),
  logistik:   () => ({ percent: pct(C.FX_LOGISTIK) }),
  beute:      () => ({ percent: pct(C.FX_BEUTE) }),
  nacht:      () => ({ n: C.FX_NACHT_HOURS }),
  mauer:      () => ({ n: C.FX_MAUER_HP }),
  stacheln:   () => ({ n: C.FX_STACHELN_DMG }),
  moertel:    () => ({ n: C.FX_MOERTEL_REGEN }),
  turm:       () => ({ n: C.PLAYER_TURRET.dmgPerLevel }),
  reichweite: () => ({ n: C.PLAYER_TURRET.rangePerLevel }),
  kadenz:     () => ({ percent: pct(1 - C.PLAYER_TURRET.cdFactor) }),
};
const costText = (cur, n) => t(cur === 'scrap' ? 'cost.scrap' : 'cost.material', { n: fmt(n) });

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
function mkButton(cls, text, onClick){
  const b = document.createElement('button');
  b.type = 'button'; b.className = cls; b.textContent = text;
  b.addEventListener('click', onClick);
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
    const b = mkButton('', t('lang.' + l), () => { setLang(l); renderStart(); render(); });
    b.setAttribute('aria-pressed', String(l === lang));
    seg.appendChild(b);
  }
  langField.append(ll, seg);

  const diffField = document.createElement('div'); diffField.className = 'field';
  const dl = document.createElement('span'); dl.className = 'field-label'; dl.textContent = t('start.difficulty');
  const diffs = document.createElement('div'); diffs.className = 'diffs';
  for (const key of C.DIFFICULTY_ORDER){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'diff';
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
  if (canCancel) act.appendChild(mkButton('link', t('start.back'), closeModal));
  act.appendChild(mkButton('btn-primary', t('start.go'), () => startGame(pickDiff)));
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
  const b = mkButton('btn-primary', t('result.again'), () => openStart(false));
  act.appendChild(b);
  $('modal').hidden = false;
  b.focus();
}
function closeModal(){ modalOpen = false; $('modal').hidden = true; last = performance.now(); acc = 0; }
function startGame(diff){
  G.newGame(diff, (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
  resultShownFor = null;
  save();
  closeModal();
  render();
}

/* ================= Oberfläche ================= */
const optEls = {};
function makeOpt(parent, cls){
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'opt ' + (cls || '');
  b.innerHTML = '<span class="opt-name"></span><span class="opt-cost num"></span><span class="opt-desc"></span>';
  parent.appendChild(b);
  return { btn: b, name: b.children[0], cost: b.children[1], desc: b.children[2] };
}
const GROUP_BOX = { fertigung: 'optsFertigung', fabrik: 'optsFabrik', schmiede: 'optsSchmiede', universitaet: 'optsUni', mauer: 'optsMauer', turm: 'optsTurm' };

function buildUI(){
  for (const id in C.UPGRADES){
    const el = makeOpt($(GROUP_BOX[C.UPGRADES[id].group]));
    el.btn.addEventListener('click', () => { G.buy(id); render(); });
    optEls[id] = el;
  }
  for (const id in C.UNITS){
    const el = makeOpt($('optsUnits'), 'unit');
    el.btn.addEventListener('click', () => { G.spawn(id); render(); });
    optEls['unit_' + id] = el;
  }
  const r = makeOpt($('optsRepair'));
  r.btn.addEventListener('click', () => { G.repair(); render(); });
  optEls.repair = r;
  for (let i = 0; i < C.BUILDING_SLOTS; i++){
    const card = document.createElement('div');
    card.className = 'slot';
    card.innerHTML = '<div class="slot-head"><span class="slot-no"></span><span class="slot-cost"></span></div><div class="slot-body"></div>';
    $('slots').appendChild(card);
  }
  $('clickBtn').addEventListener('click', () => { G.doClick(); render(); });
  $('newBtn').addEventListener('click', () => openStart(G.S.status === 'running'));
  document.addEventListener('keydown', e => {
    if (modalOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    for (const [id, spec] of Object.entries(C.UNITS)) if (e.key === spec.key){ G.spawn(id); render(); }
  });
}

let slotKey = '';
function renderSlots(){
  const S = G.S, n = G.builtCount(), cost = G.nextSlotCost();
  const key = lang + S.slots.join(',') + '|' + (S.material >= cost) + '|' + S.status;
  if (key === slotKey) return;
  slotKey = key;
  const cards = $('slots').children;
  for (let i = 0; i < cards.length; i++){
    const card = cards[i], body = card.querySelector('.slot-body'), costEl = card.querySelector('.slot-cost');
    card.querySelector('.slot-no').textContent = t('slot.label', { n: i + 1 });
    const b = S.slots[i];
    body.innerHTML = '';
    if (b){
      card.className = 'slot built';
      costEl.textContent = t('slot.built');
      const nm = document.createElement('div'); nm.className = 'slot-name'; nm.textContent = t(`bld.${b}.name`);
      const ds = document.createElement('div'); ds.className = 'slot-desc'; ds.textContent = t(`bld.${b}.desc`);
      body.append(nm, ds);
    } else if (i === n){
      card.className = 'slot';
      costEl.textContent = costText('material', C.BUILD_COSTS[i]);
      const ch = document.createElement('div'); ch.className = 'slot-choices';
      for (const k of C.BUILDINGS){
        if (G.has(k)) continue;
        const btn = mkButton('chip', t('slot.buildBtn', { name: t(`bld.${k}.name`) }), () => { G.build(k); slotKey = ''; render(); });
        btn.disabled = S.status !== 'running' || S.material < cost;
        ch.appendChild(btn);
      }
      body.appendChild(ch);
    } else {
      card.className = 'slot locked';
      costEl.textContent = costText('material', C.BUILD_COSTS[i]);
      const ds = document.createElement('div'); ds.className = 'slot-desc'; ds.textContent = t('slot.locked', { n: i });
      body.appendChild(ds);
    }
  }
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
  $('perClick').textContent = t('hud.perClick', { n: fmt(G.clickPower()) });
  $('clickHint').textContent = fmt(G.clickPower());
  $('scrap').textContent = fmt(S.scrap);
  $('clock').textContent = clock(S.t);
  $('kills').textContent = fmt(S.kills);
  $('ownCount').textContent = S.units.filter(u => u.side === 'p').length;
  $('losses').textContent = fmt(S.losses);
  $('queue').textContent = `${S.queue.length}/${C.QUEUE_MAX}`;
  $('diffLabel').textContent = S.status === 'setup' ? '' : t(`diff.${S.diff}.name`);
  $('eraLabel').textContent = t(S.eraReached ? 'hdr.era2' : 'hdr.era1');
  $('clickBtn').disabled = !running;

  for (const id in C.UPGRADES){
    const u = C.UPGRADES[id], el = optEls[id], lv = S.lvl[id];
    el.btn.hidden = !(G.isAvailable(id) && S.revealed[id]);
    if (el.btn.hidden) continue;
    const label = id === 'turm' && lv === 0 ? t('upg.turm.build') : t(`upg.${id}.name`);
    const level = u.max !== undefined ? t('opt.levelMax', { n: lv, max: u.max }) : t('opt.level', { n: lv });
    el.name.textContent = label;
    el.cost.textContent = G.isMaxed(id) ? t('opt.max') : costText(u.cur, G.upCost(id));
    el.desc.textContent = `${level} · ${t(`upg.${id}.desc`, DESC_PARAMS[id]())}`;
    el.btn.disabled = !G.canBuy(id);
  }
  for (const id in C.UNITS){
    const spec = C.UNITS[id], el = optEls['unit_' + id], c = G.unitCost(id);
    el.name.innerHTML = '';
    const kbd = document.createElement('kbd'); kbd.textContent = spec.key;
    el.name.append(kbd, document.createTextNode(t(`unit.${id}.name`)));
    el.cost.textContent = costText('material', c);
    el.desc.textContent = t('unit.stats', {
      role: t(spec.range > C.RANGED_MIN_RANGE ? 'unit.role.ranged' : 'unit.role.melee'),
      hp: fmt(spec.hp * G.hpMultP()), dmg: fmt1(spec.dmg * G.dmgMultP()),
    });
    el.btn.disabled = !running || S.material < c || S.queue.length >= C.QUEUE_MAX;
  }
  const r = optEls.repair;
  r.btn.hidden = !S.revealed.repair;
  r.name.textContent = t('repair.name');
  r.cost.textContent = costText('scrap', C.REPAIR_COST);
  r.desc.textContent = t('repair.desc', { n: C.REPAIR_AMOUNT });
  r.btn.disabled = !running || S.scrap < C.REPAIR_COST || S.baseHp >= G.baseMax();

  $('hintFabrik').hidden = G.has('fabrik');
  $('hintSchmiede').hidden = G.has('schmiede');
  $('hintUni').hidden = G.has('universitaet');
  $('hintWall').hidden = S.lvl.turm > 0 || S.lvl.mauer > 0;

  const eMax = G.diffCfg().enemyBaseHp;
  $('hpP').textContent = `${fmt(Math.max(0, S.baseHp))} / ${fmt(G.baseMax())}`;
  $('hpE').textContent = `${fmt(Math.max(0, S.enemyBaseHp))} / ${fmt(eMax)}`;
  $('barP').style.width = (100 * Math.max(0, S.baseHp) / G.baseMax()) + '%';
  $('barE').style.width = (100 * Math.max(0, S.enemyBaseHp) / eMax) + '%';
  $('eraProg').textContent = `${fmt(Math.min(S.scrapTotal, C.ERA2_AT))} / ${fmt(C.ERA2_AT)}`;
  $('barEra').style.width = (100 * Math.min(1, S.scrapTotal / C.ERA2_AT)) + '%';

  renderSlots();

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
    const cx = slotX[i] * sx, b = S.slots[i];
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
window.__kf = { G, C, t, setLang, startGame, get lang(){ return lang; } };

setLang(lang);
buildUI();
readColors();
resize();
if (load()){ render(); }
else { render(); openStart(false); }
requestAnimationFrame(frame);
})();

/* Klammerfront – Ressourcenleiste, oberes Band (REQ-5.03).
   Von links nach rechts: Soldaten, Material, EP mit Fortschritt, Wellen, Mauer, Zustand der Armee, Zeit und Phase, Kartenwahl, Menü.
   Alle Elemente werden einmal erzeugt; renderHud() schreibt nur geänderte Werte (REQ-5.01). */
'use strict';

/* EP-Ertrag je Sekunde: gleitend über die letzten XP_RATE_WINDOW_S Sekunden Spielzeit */
const xpHist = [];
function xpRate(){
  const S = G.S;
  if (!xpHist.length || S.t < xpHist[xpHist.length - 1].t) xpHist.length = 0;         // neue Partie
  if (!xpHist.length || S.t - xpHist[xpHist.length - 1].t >= 1) xpHist.push({ t: S.t, v: S.xpTotal });
  while (xpHist.length > 1 && S.t - xpHist[0].t > C.UI.xpRateWindowS) xpHist.shift();
  const a = xpHist[0], dt = S.t - a.t;
  return dt > 0 ? (S.xpTotal - a.v) / dt : 0;
}

const hudEl = {};
/* Schwebende Zahlen (REQ-5.10): Material- und EP-Gewinn der letzten Sekunde, höchstens eine je Quelle und Sekunde */
const floatLast = { t: null, mat: 0, xp: 0 };
function floatGain(){
  const S = G.S;
  if (floatLast.t === null || S.t < floatLast.t){ Object.assign(floatLast, { t: S.t, mat: S.materialTotal, xp: S.xpTotal }); return; }
  if (S.t - floatLast.t < 1) return;
  const dm = S.materialTotal - floatLast.mat, dx = S.xpTotal - floatLast.xp;
  Object.assign(floatLast, { t: S.t, mat: S.materialTotal, xp: S.xpTotal });
  if (reduceMotion || S.status !== 'running') return;
  for (const [el, v] of [[hudEl.material, dm], [hudEl.xpVal, dx]]){
    if (v < 1) continue;
    const f = document.createElement('span'); f.className = 'float'; f.classList.add('num'); f.textContent = '+' + fmt(v);
    el.parentElement.appendChild(f);
    setTimeout(() => f.remove(), C.UI.floatMs);
  }
}
function buildHud(){
  for (const id of ['hudSoldiers', 'material', 'rate', 'xpVal', 'xpRate', 'barLvl', 'lvlProg', 'waveIn', 'enemyWaveIn', 'siegeInfo',
                    'hudWaves', 'armyState', 'clock', 'eraLabel', 'diffLabel', 'draftBtn', 'pauseBtn', 'langBtn', 'newBtn'])
    hudEl[id] = $(id);
  for (let i = 0; i < C.LANE_COUNT; i++){ hudEl['hpP' + i] = $('hpP' + i); hudEl['barP' + i] = $('barP' + i); }
  hudEl.draftBtn.addEventListener('click', () => selectTab('cards', true));
  hudEl.pauseBtn.addEventListener('click', () => setPaused(!paused));
  hudEl.langBtn.addEventListener('click', () => { setLang(C.LANGUAGES[(C.LANGUAGES.indexOf(lang) + 1) % C.LANGUAGES.length]); requestRender(); });
  hudEl.newBtn.addEventListener('click', () => openStart(G.S.status === 'running'));
}
/* Tooltips der Leiste */
function hudTip(item){
  const S = G.S;
  switch (item){
    case 'soldiers': return { title: t('hud.soldiers'), body: t('tip.hud.soldiers'), rows: [[t('front.field'), fmt(G.ownOnField())], [t('front.supply'), fmt(G.supplyCap())], [t('front.losses'), fmt(S.losses)]] };
    case 'material': return { title: t('hud.material'), body: t('tip.hud.material'), rows: [[t('tip.m.matRate'), fmt1(G.matRate() + G.autoPressCps() * G.clickPower())]] };
    case 'xp': { const x = G.xpProgress();
      return { title: t('hud.xp'), body: t('tip.hud.xp'), rows: [[t('level.progress', { n: x.level + 1 }), `${fmt(Math.max(0, x.cur))} / ${fmt(x.need)}`], [t('tip.hud.xpRate'), fmt1(xpRate())]] }; }
    case 'waves': return { title: t('hud.waves'), body: t('tip.hud.waves', { s: C.WAVE_INTERVAL_S }) };
    case 'walls': return { title: t('hud.walls'), body: t('tip.hud.walls') };
    case 'army': return { title: t('hud.army'), body: t('tip.hud.army') };
    case 'time': return { title: t('hdr.clock'), body: t('tip.hud.time') };
  }
  return { title: item };
}
function renderHud(){
  const S = G.S, running = S.status === 'running', E = hudEl;
  setText(E.hudSoldiers, `${fmt(G.ownOnField())}/${fmt(G.supplyCap())}`);
  setText(E.material, fmt(S.material));
  setText(E.rate, t('hud.perSecond', { n: fmt1(G.matRate() + G.autoPressCps() * G.clickPower()) }));
  const x = G.xpProgress();
  setText(E.xpVal, fmt(S.xp));
  setText(E.xpRate, t('hud.perSecond', { n: fmt1(xpRate()) }));
  setText(E.lvlProg, t('hud.toLevel', { n: x.level + 1, cur: fmt(Math.max(0, x.cur)), need: fmt(x.need) }));
  setWidth(E.barLvl, 100 * Math.max(0, Math.min(1, x.cur / x.need)));
  // Wellen erst mit der ersten Welle (REQ-47)
  setHidden(E.hudWaves, !G.introShows('waves'));
  setText(E.waveIn, clock(Math.ceil(G.waveIn())));
  setText(E.enemyWaveIn, clock(Math.ceil(G.enemyWaveIn())));
  const siege = G.siegeAnnounced();
  setHidden(E.siegeInfo, !siege);
  if (siege) setText(E.siegeInfo, t('wave.siege', { time: clock(Math.ceil(G.siegeIn())), x: C.SIEGE_STRENGTH }));
  for (let i = 0; i < C.LANE_COUNT; i++){
    const hp = Math.max(0, S.sections[i].hp), max = G.sectionMax(i);
    setText(E['hpP' + i], hp > 0 || i === C.GATE_LANE ? fmt(hp) : t('hud.fallen'));
    setWidth(E['barP' + i], 100 * hp / max);
  }
  setText(E.armyState, paused ? t('army.paused') : t('army.' + G.armyState('p')));
  setText(E.clock, clock(S.t));
  setText(E.eraLabel, S.status === 'setup' ? '' : t('hdr.level', { n: S.level, phase: t('phase.' + G.phase()) }));
  setText(E.diffLabel, S.status === 'setup' ? '' : t(`diff.${S.diff}.name`));
  // Offene Kartenwahl: auffälliger Hinweis, öffnet den Reiter Karten; kein automatischer Wechsel (REQ-5.03)
  setHidden(E.draftBtn, !(running && S.pendingDraft));
  if (S.pendingDraft) setText(E.draftBtn.querySelector('.expl'), t('ex.hud.draft', { n: S.pendingLevels }));
  E.pauseBtn.setAttribute('aria-pressed', String(paused));
  setText(E.pauseBtn.querySelector('.btn-label'), t(paused ? 'menu.resume' : 'menu.pause'));
  setText(E.pauseBtn.querySelector('.expl'), t(paused ? 'ex.menu.resume' : 'ex.menu.pause'));
  setDis(E.pauseBtn, !running);
  setText(E.langBtn.querySelector('.btn-label'), t('lang.' + C.LANGUAGES[(C.LANGUAGES.indexOf(lang) + 1) % C.LANGUAGES.length]));
  setText(E.langBtn.querySelector('.expl'), t('ex.menu.lang'));
  setText(E.newBtn.querySelector('.expl'), t('ex.newGame'));
  floatGain();
}

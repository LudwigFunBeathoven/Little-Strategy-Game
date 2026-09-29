/* Klammerfront – Sitzungsprotokoll für Spieltests mit Menschen (REQ-5.11).
   Nur mit ?debug=1 aktiv. Zeichnet dieselben Kennzahlen auf wie die Simulation (tools/simulate.mjs) und dazu die Merkmale, nach denen
   tools/compare-human.mjs eine Partie dem nächstliegenden Bot-Profil zuordnet: Klicks je Sekunde, Reaktionsintervall (Abstand zwischen
   Handlungen), größte Zahl eigener Einheiten (Feld und Warteschlange), Mauernutzung.
   Die Aktionen der Spiellogik werden dazu umhüllt; das Spiel selbst ändert sich nicht. Export als JSON über den Knopf „Protokoll“. */
'use strict';

const DEBUG = /[?&]debug=1\b/.test(location.search);
const Session = (() => {
  let P = null, lastSample = -1, lastPhase = null;
  const ACTIONS = ['spawn', 'buy', 'buildAt', 'demolish', 'repair', 'startResearch', 'rerollDraft', 'banOption'];
  function reset(){
    const S = G.S;
    P = { format: 'klammerfront-session', formatVersion: 1, version: C.VERSION, lang, diff: S.diff, startedAt: new Date().toISOString(),
          result: S.status, durationS: 0, clicks: 0, clicksPerMinute: [], clicksByPhase: { early: 0, mid: 0, late: 0 }, timeByPhase: { early: 0, mid: 0, late: 0 },
          actions: [], drafts: [], research: [], maxUnits: 0, maxArmy: 0, firstWallFallS: null, wallUse: { repairs: 0, upgrades: 0 }, kills: 0, losses: 0 };
    lastSample = S.t; lastPhase = G.phase();
  }
  const record = (kind, extra) => { P.actions.push(Object.assign({ t: +G.S.t.toFixed(2), kind }, extra || {})); };
  /* Stichprobe nach jedem Logik-Tick: Phasenzeit, Einheiten, erster Mauerfall, Ergebnis */
  function sample(){
    const S = G.S;
    if (!P || S.t < lastSample){ reset(); return; }                       // neue Partie
    const dt = S.t - lastSample; lastSample = S.t;
    const ph = G.phase(); P.timeByPhase[ph] += dt; lastPhase = ph;
    P.maxUnits = Math.max(P.maxUnits, G.ownOnField() + S.queue.length);
    P.maxArmy = Math.max(P.maxArmy, S.stats.maxArmy || 0);
    if (P.firstWallFallS === null && S.sections.some((s, i) => i !== C.GATE_LANE && s.hp <= 0)) P.firstWallFallS = +S.t.toFixed(1);
    P.durationS = +S.t.toFixed(1); P.result = S.status; P.kills = S.kills; P.losses = S.losses; P.diff = S.diff;
  }
  function wrap(){
    const orig = {};
    for (const name of ACTIONS){
      orig[name] = G[name];
      G[name] = (...args) => {
        const ok = orig[name](...args);
        if (ok && P){
          record(name, { arg: args[0] });
          if (name === 'repair') P.wallUse.repairs++;
          if (name === 'buy' && /^(mauer|stacheln|moertel|turm|reichweite|kadenz)/.test(String(args[0]))) P.wallUse.upgrades++;
          if (name === 'startResearch') P.research.push({ t: +G.S.t.toFixed(1), id: args[0], tier: G.researchTier(args[0]) + 1 });
        }
        return ok;
      };
    }
    const click = G.doClick;
    G.doClick = () => {
      const ok = click();
      if (ok && P){
        const m = Math.floor(G.S.t / 60);
        while (P.clicksPerMinute.length <= m) P.clicksPerMinute.push(0);
        P.clicksPerMinute[m]++; P.clicks++; P.clicksByPhase[G.phase()]++;
      }
      return ok;
    };
    const choose = G.chooseDraft;
    G.chooseDraft = i => {
      const d = G.S.pendingDraft, id = d && d.options[i];
      const ok = choose(i);
      if (ok && P){ P.drafts.push({ t: +G.S.t.toFixed(1), level: d.level, chosen: id, offered: d.options.slice() }); record('chooseDraft', { arg: id }); }
      return ok;
    };
    const tick = G.tick;
    G.tick = dt => { tick(dt); sample(); };
  }
  function exportJSON(){
    sample();
    const blob = new Blob([JSON.stringify(P, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `klammerfront-protokoll-${P.diff}-${P.startedAt.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function init(){
    if (!DEBUG) return;
    wrap(); reset();
    const b = $('sessionBtn');
    b.hidden = false;
    b.addEventListener('click', exportJSON);
  }
  return { init, get data(){ if (P) sample(); return P; }, reset };
})();

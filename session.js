/* Klammerfront – Sitzungsprotokoll für Spieltests mit Menschen (REQ-5.11).
   Nur mit ?debug=1 aktiv. Zeichnet dieselben Kennzahlen auf wie die Simulation (tools/simulate.mjs) und dazu die Merkmale, nach denen
   tools/compare-human.mjs eine Partie dem nächstliegenden Bot-Profil zuordnet: Klicks je Sekunde, Reaktionsintervall (Abstand zwischen
   Handlungen), größte Zahl eigener Einheiten (Feld und Warteschlange), Mauernutzung.
   Die Aktionen der Spiellogik werden dazu umhüllt; das Spiel selbst ändert sich nicht. Export als JSON über den Knopf „Protokoll“. */
'use strict';

// Debug-Modus: ?debug=1, #debug oder im Testbuild fest eingeschaltet (window.KF_DEBUG = true vor den Skripten, REQ-6.11)
const DEBUG = /[?&]debug=1\b/.test(location.search) || /(^#|[#&])debug\b/.test(location.hash) || window.KF_DEBUG === true;
const Session = (() => {
  let P = null, lastSample = -1, lastPhase = null, muted = 0, draftActs = { rerolled: 0, banned: 0 }, doneSeen = 0, unlockSeen = new Set();     // muted: Handlungen des Quartiermeisters zählen nicht als Spielerhandlung
  /* Debug-Protokoll je Einheit (REQ-6.01): Zustand der Gruppe, Lane, Querbewegung, Platz, Bewegungsrichtung je Takt; die letzten
     UI.debugUnitLogS Sekunden. Abruf: __kf.unitLog(id) in der Konsole oder im exportierten Protokoll (unitLog). */
  let unitLog = [];
  const lastPos = new Map();
  function sampleUnits(){
    const S = G.S, state = new Map(S.forms.map(f => [f.id, f.state]));
    for (const u of S.units){
      const p = lastPos.get(u.id), sx = p ? Math.sign(+(u.x - p.x).toFixed(6)) : 0, sy = p ? Math.sign(+(u.laneF - p.laneF).toFixed(6)) : 0;
      lastPos.set(u.id, { x: u.x, laneF: u.laneF });
      unitLog.push({ t: +S.t.toFixed(2), id: u.id, side: u.side, state: state.get(u.form) || null, home: u.home, lane: u.lane,
                     laneF: +u.laneF.toFixed(3), row: u.row, col: u.col, x: +u.x.toFixed(1), dirX: sx, dirLane: sy });
    }
    const from = S.t - C.UI.debugUnitLogS;
    let k = 0; while (k < unitLog.length && unitLog[k].t < from) k++;
    if (k) unitLog = unitLog.slice(k);
    if (lastPos.size > 4 * S.units.length + 50){ const ids = new Set(S.units.map(u => u.id)); for (const id of lastPos.keys()) if (!ids.has(id)) lastPos.delete(id); }
  }
  const ACTIONS = ['spawn', 'buy', 'buildAt', 'demolish', 'repair', 'startResearch', 'rerollDraft', 'banOption'];
  function reset(){
    const S = G.S;
    P = { format: 'klammerfront-session', formatVersion: 2, version: C.VERSION, lang, diff: S.diff, pacing: S.pacing, stage: Stage.on(), startedAt: new Date().toISOString(),
          result: S.status, durationS: 0, clicks: 0, clicksPerMinute: [], clicksByPhase: { early: 0, mid: 0, late: 0 }, timeByPhase: { early: 0, mid: 0, late: 0 },
          actions: [], drafts: [], research: [], researchDone: [], unlocks: [], maxUnits: 0, maxArmy: 0, firstWallFallS: null, wallUse: { repairs: 0, upgrades: 0 }, kills: 0, losses: 0 };
    lastSample = S.t; lastPhase = G.phase(); draftActs = { rerolled: 0, banned: 0 }; doneSeen = 0; unlockSeen = new Set();
  }
  const record = (kind, extra) => { P.actions.push(Object.assign({ t: +G.S.t.toFixed(2), kind }, extra || {})); };
  /* Stichprobe nach jedem Logik-Tick: Phasenzeit, Einheiten, erster Mauerfall, Ergebnis */
  function sample(){
    const S = G.S;
    if (!P || S.t < lastSample){ reset(); unitLog = []; lastPos.clear(); return; }   // neue Partie
    const dt = S.t - lastSample; lastSample = S.t;
    const ph = G.phase(); P.timeByPhase[ph] += dt; lastPhase = ph;
    P.maxUnits = Math.max(P.maxUnits, G.ownOnField() + S.queue.length);
    P.maxArmy = Math.max(P.maxArmy, S.stats.maxArmy || 0);
    if (P.firstWallFallS === null && S.sections.some((s, i) => i !== C.GATE_LANE && s.hp <= 0)) P.firstWallFallS = +S.t.toFixed(1);
    for (const [key, t0] of Object.entries(S.unlocks || {})) if (!unlockSeen.has(key)){ unlockSeen.add(key); P.unlocks.push({ t: +Number(t0).toFixed(1), key }); }   // Freischaltungen mit Zeitpunkt
    // abgeschlossene Forschungen mit Zeitpunkt (Kartenpfad, REQ-KP.09)
    const done = S.stats.researchDone || [];
    while (doneSeen < done.length){ P.researchDone.push({ t: done[doneSeen].t, id: done[doneSeen].id, tier: done[doneSeen].tier }); doneSeen++; }
    P.durationS = +S.t.toFixed(1); P.result = S.status; P.kills = S.kills; P.losses = S.losses; P.diff = S.diff; P.lang = lang;
  }
  function wrap(){
    const orig = {};
    for (const name of ACTIONS){
      orig[name] = G[name];
      G[name] = (...args) => {
        const ok = orig[name](...args);
        if (ok && P && !muted){
          record(name, { arg: args[0] });
          if (name === 'repair') P.wallUse.repairs++;
          if (name === 'buy' && /^(mauer|stacheln|moertel|turm|reichweite|kadenz)/.test(String(args[0]))) P.wallUse.upgrades++;
          if (name === 'rerollDraft') draftActs.rerolled++;
          if (name === 'banOption') draftActs.banned++;
          if (name === 'startResearch') P.research.push({ t: +G.S.t.toFixed(1), id: args[0], tier: G.researchTier(args[0]) + 1 });
        }
        return ok;
      };
    }
    const click = G.doClick;
    G.doClick = () => {
      const ok = click();
      if (ok && P && !muted){
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
      // Kartenpfad (REQ-KP.09): gewählte Karte mit Alternativen, Bedenkzeit (ms seit dem ersten Öffnen der Bühne dieser Wahl), Neu ziehen und Bannen
      if (ok && P){ P.drafts.push({ t: +G.S.t.toFixed(1), level: d.level, chosen: id, offered: d.options.slice(), thinkMs: Stage.on() ? Stage.thinkMs() : draftThinkMs(), rerolled: draftActs.rerolled, banned: draftActs.banned, family: G.OPT[id] ? (G.OPT[id].family || 'bonus') : null }); draftActs = { rerolled: 0, banned: 0 }; record('chooseDraft', { arg: id }); }
      return ok;
    };
    const tick = G.tick;
    G.tick = dt => { tick(dt); sample(); sampleUnits(); };
  }
  function exportJSON(){
    sample();
    const blob = new Blob([JSON.stringify(Object.assign({}, P, { tutorial: Tutorial.data(), unitLog }), null, 2)], { type: 'application/json' });
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
  /* Handlungen innerhalb von fn (Vorführung des Quartiermeisters) nicht protokollieren */
  const silently = fn => { muted++; try { return fn(); } finally { muted--; } };
  return { init, silently, get data(){ if (P){ sample(); P.tutorial = Tutorial.data(); } return P; }, reset, unitLog: id => id == null ? unitLog : unitLog.filter(e => e.id === id) };
})();

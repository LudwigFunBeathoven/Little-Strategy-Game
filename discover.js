/* Klammerfront – Sichtbarkeitsregel „nur, was jetzt nutzbar ist“ (REQ-K2.04).
   Reine Anzeigelogik: liest den Spielstand, ändert ihn nie. Jedes Element hat eine Bedingung („sichtbar ab“); ist sie einmal erfüllt,
   bleibt das Element in dieser Partie sichtbar (Raster-Zeile „Merker“). Ausgeschaltet (Modus standard ohne ?entdecken=1) liefert Disc.shows immer true
   und die alten Regeln der Oberfläche gelten unverändert. Texte nur aus den Sprachdateien, Zahlen aus config.js. */
'use strict';
const Disc = (() => {
  const flag = URL_PARAMS.get('entdecken');
  const on = () => flag === '1' ? true : flag === '0' ? false : C.UI.entdecken !== null && C.UI.entdecken !== undefined ? !!C.UI.entdecken : G.S.pacing === 'karten';
  const wallUpgrade = id => ['mauer', 'turm_0', 'turm_2'].includes(C.UPGRADES[id].group);
  const cardsChosen = S => Object.values(S.draft.stacks).reduce((a, b) => a + b, 0);
  /* Tabelle: Schlüssel → Bedingung. Dieselbe Tabelle füllt die Zuordnung im Bericht (descKey = Zeile der Sprachdatei). */
  const VIS = {
    'tab:build':   { when: () => true },
    'tab:army':    { when: () => true },
    'tab:wall':    { when: S => C.LANE_COUNT > 0 && (Object.keys(S.revealed).some(k => S.revealed[k] && (k.startsWith('repair_') || wallUpgrade(k)))) },
    'tab:smithy':  { when: () => G.has('schmiede') },
    'tab:uni':     { when: () => G.has('universitaet') },
    'tab:cards':   { when: S => !!S.pendingDraft || cardsChosen(S) > 0 },
    'army:kaserne': { when: () => G.isBuildable('kaserne') || G.has('kaserne') },
    'hud:material': { when: () => true },
    'hud:waves':   { when: () => true },
    'hud:walls':   { when: () => true },
    'hud:time':    { when: () => true },
    'hud:menu':    { when: () => true },
    'hud:xp':      { when: S => S.xpTotal > 0 },
    'hud:cardSym': { when: S => S.xpTotal > 0 },
    'hud:supply':  { when: S => S.queue.length > 0 || S.ownWaveNo >= 1 || G.ownOnField() > 0 },
    'hud:army':    { when: S => S.ownWaveNo >= 1 },
    'hud:interest': { when: () => G.has('kontor') },
    'hud:neighbor': { when: S => S.slots.filter(Boolean).length >= 2 },
  };
  let latch = new Map(), latchFor = null;
  function shows(key){
    if (!on()) return true;
    const S = G.S;
    if (latchFor !== S.stats){ latch = new Map(); latchFor = S.stats; }
    if (latch.get(key)) return true;
    const v = VIS[key] ? !!VIS[key].when(S) : true;
    if (v) latch.set(key, true);
    return v;
  }
  /* ---------- Entdeckungsmoment (REQ-K2.06) ----------
     Taucht ein bedienbares Element erstmals auf (verborgen → sichtbar), blendet es ein (ENTDECKEN.einblendenMs); alle Elemente des Moments sammeln sich,
     und flush() liefert genau einen Hinweis: Reiter vor Bauoption vor Einheit vor Ausbau vor Forschung vor Sonstigem. */
  const E = C.ENTDECKEN, PRIO = ['tab', 'pick', 'unit', 'upg', 'res', 'hud', 'other'];
  let armed = false, warm = 0, found = new Map();
  const IGNORE = '#stage, #modal, #tutBubble, #hintBox, #toast, #tip, #draftBtn, #resumeBtn, #tutSkipBtn, .hud-menu, #sessionBtn';
  const kindOf = k => PRIO.includes(k.split(':')[0]) ? k.split(':')[0] : 'other';
  const nameOf = e => { const n = e.querySelector('.btn-label, .opt-name > span:nth-child(2), .hud-l, .sub, b'); return (n || e).textContent.trim().replace(/\s+/g, ' ').slice(0, 40); };
  const names = new Map();
  function noticed(el){
    el.classList.add('disc-in');
    setTimeout(() => el.classList.remove('disc-in'), E.einblendenMs + 40);
    const key = el.dataset.tooltip || (el.id ? 'id:' + el.id : '');
    if (!key) return;
    noteVisible(key);
    if (!armed || found.has(key)) return;
    const name = nameOf(el); if (!name) return;
    names.set(key, name); found.set(key, kindOf(key));
  }
  const noteVisible = key => { if (typeof Session !== 'undefined' && Session.noteVisible) Session.noteVisible(key, G.S.t); };
  const CTRL = 'button, [role="tab"], .hud-item, .barracks, .res-group, .res-tree > div, .opt, .pick';
  if (typeof MutationObserver !== 'undefined'){
    new MutationObserver(recs => {
      if (!on()) return;
      for (const r of recs){
        const el = r.target;
        if (r.oldValue === null || el.hidden || !el.matches || !el.matches(CTRL) || el.closest(IGNORE)) continue;       // war sichtbar oder bleibt verborgen
        noticed(el);
      }
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true });
  }
  let doneKey = null;
  /* Forschung fertig: Hinweis und Markierung am Ergebnis; ersetzt die übrigen Funde desselben Moments */
  function announceDone(key, name){ names.set(key, name); doneKey = key; }
  function flush(){
    if (doneKey){ const k = doneKey; doneKey = null; found = new Map(); return 'disc:' + k; }
    if (!found.size) return null;
    const best = [...found.entries()].sort((a, b) => PRIO.indexOf(a[1]) - PRIO.indexOf(b[1]))[0][0];
    found = new Map();
    return 'disc:' + best;
  }
  const hintText = id => { const key = id.slice(5); const e = document.querySelector(`[data-tooltip="${key}"]`); const n = (e && e.isConnected ? nameOf(e) : '') || names.get(key) || key;
    return t(key.startsWith('done:') ? 'hint.disc.done' : 'hint.disc.new', { name: n }); };
  function reset(){ doneKey = null; armed = false; warm = 0; found = new Map(); latch = new Map(); latchFor = null; }
  function tick(){ if (!armed && ++warm >= 3) armed = true; }               // die ersten Bilder einer Partie gelten als Grundlinie
  return { on, shows, announceDone, VIS, keys: () => Object.keys(VIS), flush, hintText, reset, tick, names, get armed(){ return armed; } };
})();

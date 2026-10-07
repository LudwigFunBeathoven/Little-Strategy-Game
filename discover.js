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
  return { on, shows, VIS, keys: () => Object.keys(VIS) };
})();

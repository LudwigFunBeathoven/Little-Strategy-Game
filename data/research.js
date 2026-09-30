/* Klammerfront – Forschungsbaum der Universität (REQ-5.07), Aufbau analog zu data/draft-options.js.
   Forschung kostet Material und Zeit, nie EP. Eine Forschung gleichzeitig (Zweiter Forschungsplatz: zwei).
   Wirkungen laufen über dieselbe Pipeline wie die Karten (mMul/mAdd in core.js); es wirkt die höchste erforschte Stufe.
   Felder:
     id        eindeutige Kennung (Präfix r_, damit sie nicht mit Karten-Ids kollidiert)
     branch    'lehre' (A, EP-Automatik) | 'archiv' (B, Kartenmanipulation) | 'forschung' (C, global) | 'freischaltung' (D)
     nameKey, descKey   Schlüssel in i18n/*.js; {e1} = Wert der Wirkung der gezeigten Stufe
     tiers     [{ cost, timeS, effect }]: Kosten in Material, Dauer in Sekunden Spielzeit; Werte je Stufe absolut
     requires  optional: { research, tier } – Voraussetzung im Baum
   Werte kalibriert per Simulation (I5.7/I5.8); I6.6: Zeiten halbiert, Kosten −40 %, Hörsaal bis 35 % des aktiven EP-Ertrags (REQ-6.06). */
const KF_RESEARCH = [
  /* ---------- A Lehre: passiver EP-Ertrag, teuer und langsam ---------- */
  { id: 'r_hoersaal', branch: 'lehre', nameKey: 'research.hoersaal.name', descKey: 'research.hoersaal.desc',
    tiers: [{ cost: 300, timeS: 30, effect: [{ stat: 'xpPassive', add: 0.15 }] },
            { cost: 720, timeS: 45, effect: [{ stat: 'xpPassive', add: 0.35 }] },
            { cost: 1560, timeS: 60, effect: [{ stat: 'xpPassive', add: 0.55 }] }] },

  /* ---------- B Archiv: Kartenmanipulation ---------- */
  { id: 'r_weitblick', branch: 'archiv', nameKey: 'research.weitblick.name', descKey: 'research.weitblick.desc',
    tiers: [{ cost: 420, timeS: 30, effect: [{ stat: 'draftSize', add: 1 }] }] },
  { id: 'r_neuziehen', branch: 'archiv', nameKey: 'research.neuziehen.name', descKey: 'research.neuziehen.desc',
    tiers: [{ cost: 100, timeS: 15, effect: [{ stat: 'rerolls', add: 1 }] },
            { cost: 360, timeS: 30, effect: [{ stat: 'rerolls', add: 2 }] }] },
  { id: 'r_bann', branch: 'archiv', nameKey: 'research.bann.name', descKey: 'research.bann.desc',
    tiers: [{ cost: 100, timeS: 15, effect: [{ stat: 'bans', add: 1 }] },
            { cost: 360, timeS: 30, effect: [{ stat: 'bans', add: 2 }] }] },
  { id: 'r_gluecksgriff', branch: 'archiv', nameKey: 'research.gluecksgriff.name', descKey: 'research.gluecksgriff.desc',
    tiers: [{ cost: 210, timeS: 20, effect: [{ stat: 'rareBonus', add: 10 }] },
            { cost: 480, timeS: 35, effect: [{ stat: 'rareBonus', add: 20 }] }] },

  /* ---------- C Forschung: globale Verbesserungen ---------- */
  { id: 'r_ingenieur', branch: 'forschung', nameKey: 'research.ingenieur.name', descKey: 'research.ingenieur.desc',
    tiers: [{ cost: 180, timeS: 20, effect: [{ stat: 'buildCost', mul: 0.85 }] },
            { cost: 420, timeS: 30, effect: [{ stat: 'buildCost', mul: 0.72 }] },
            { cost: 840, timeS: 40, effect: [{ stat: 'buildCost', mul: 0.6 }] }] },
  { id: 'r_logistik', branch: 'forschung', nameKey: 'research.logistik.name', descKey: 'research.logistik.desc',
    tiers: [{ cost: 210, timeS: 20, effect: [{ stat: 'supply', add: 1 }] },
            { cost: 480, timeS: 30, effect: [{ stat: 'supply', add: 2 }] },
            { cost: 960, timeS: 40, effect: [{ stat: 'supply', add: 3 }] }] },
  { id: 'r_drill', branch: 'forschung', nameKey: 'research.drill.name', descKey: 'research.drill.desc',
    tiers: [{ cost: 180, timeS: 20, effect: [{ stat: 'ownWaveInterval', mul: 0.92 }] },
            { cost: 420, timeS: 30, effect: [{ stat: 'ownWaveInterval', mul: 0.85 }] },
            { cost: 840, timeS: 40, effect: [{ stat: 'ownWaveInterval', mul: 0.8 }] }] },
  { id: 'r_metallurgie', branch: 'forschung', nameKey: 'research.metallurgie.name', descKey: 'research.metallurgie.desc',
    tiers: [{ cost: 180, timeS: 20, effect: [{ stat: 'materialYield', mul: 1.15 }] },
            { cost: 420, timeS: 30, effect: [{ stat: 'materialYield', mul: 1.3 }] },
            { cost: 840, timeS: 40, effect: [{ stat: 'materialYield', mul: 1.45 }] }] },
  { id: 'r_maurerkunst', branch: 'forschung', nameKey: 'research.maurerkunst.name', descKey: 'research.maurerkunst.desc',
    tiers: [{ cost: 100, timeS: 15, effect: [{ stat: 'repairCd', mul: 0.75 }] },
            { cost: 360, timeS: 30, effect: [{ stat: 'repairCd', mul: 0.55 }] }] },

  /* ---------- D Freischaltungen (Soll) ---------- */
  { id: 'r_schildtraeger', branch: 'freischaltung', nameKey: 'research.schildtraeger.name', descKey: 'research.schildtraeger.desc',
    requires: { research: 'r_drill', tier: 1 },
    tiers: [{ cost: 360, timeS: 30, effect: [{ stat: 'unlockSchild', add: 1 }] }] },
  { id: 'r_zweiterplatz', branch: 'freischaltung', nameKey: 'research.zweiterplatz.name', descKey: 'research.zweiterplatz.desc',
    requires: { research: 'r_logistik', tier: 1 },
    tiers: [{ cost: 540, timeS: 45, effect: [{ stat: 'researchSlots', add: 1 }] }] },
  { id: 'r_schmiedeausbau', branch: 'freischaltung', nameKey: 'research.schmiedeausbau.name', descKey: 'research.schmiedeausbau.desc',
    requires: { research: 'r_metallurgie', tier: 1 },
    tiers: [{ cost: 420, timeS: 35, effect: [{ stat: 'qualityBonus', add: 0.02 }] }] },
];

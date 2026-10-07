/* Klammerfront – Kartenpfad (Branch exp/kartenpfad, REQ-KP.01, KP.02): Pfadkarten und Freischaltungen, deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' ist dieser Inhalt nicht im Pool und nichts gesperrt.
   Felder einer Karte:
     id, familie    Kennung; 'bau' | 'technologie' | 'wagnis' (die Familie 'bonus' sind die Karten aus data/draft-options.js)
     rarity         'common' | 'rare' | 'legendary' (Anzeige); gewicht = Grundgewicht im Angebot (relativ zu den Pfadkarten)
     abWahl         frühestens ab der n-ten Kartenwahl im Angebot
     benoetigt      Liste: Karten-Ids, Forschungs-Ids oder 'gebaut:<gebäude>', die vorhanden sein müssen
     schaltetFrei   Schlüssel: 'bau:<gebäude>', 'einheit:<typ>', 'stufe:<upgrade>:<n>' (Kauf ab Stufe n)
     oeffnetForschung   Forschungs-Ids, die in der Universität verfügbar werden (nur Technologie)
     exklusivMit    Karten-Ids, die sich gegenseitig ausschließen
     tiers          Wirkung wie bei den Bonuskarten (stat, mul/add); Pfadkarten haben meist eine Stufe
     nameKey, descKey   Texte (Präfix kp.card.), {e1} = Wert der ersten Wirkung
   Werte sind Startwerte (REQ-KP.02), Kalibrierung per Simulation. */
const KF_PFAD = {
  karten: [
    /* ---------- Bau: schaltet Gebäude oder Ausbaustufen sofort frei ---------- */
    { id: 'echtesMilitaer', familie: 'bau', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: [],
      schaltetFrei: ['bau:kaserne', 'einheit:werfer'],
      nameKey: 'kp.card.echtesMilitaer.name', descKey: 'kp.card.echtesMilitaer.desc', tiers: [{ effect: [{ stat: 'supply', add: 2 }] }] },
    { id: 'pfadFestungsbau', familie: 'bau', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: [],
      schaltetFrei: ['stufe:turm_0:1', 'stufe:turm_2:1', 'stufe:mauer:1', 'stufe:stacheln:1', 'stufe:moertel:1'],
      nameKey: 'kp.card.festungsbau.name', descKey: 'kp.card.festungsbau.desc', tiers: [{ effect: [] }] },
    { id: 'metallverarbeitung', familie: 'bau', rarity: 'common', gewicht: 10, abWahl: 2, benoetigt: [],
      schaltetFrei: ['bau:schmiede'],
      nameKey: 'kp.card.metallverarbeitung.name', descKey: 'kp.card.metallverarbeitung.desc', tiers: [{ effect: [] }] },
    { id: 'gelehrte', familie: 'bau', rarity: 'common', gewicht: 10, abWahl: 2, benoetigt: [],
      schaltetFrei: ['bau:universitaet'],
      nameKey: 'kp.card.gelehrte.name', descKey: 'kp.card.gelehrte.desc', tiers: [{ effect: [] }] },
    { id: 'handel', familie: 'bau', rarity: 'common', gewicht: 10, abWahl: 4, benoetigt: ['gelehrte'],
      schaltetFrei: ['bau:kontor'],
      nameKey: 'kp.card.handel.name', descKey: 'kp.card.handel.desc', tiers: [{ effect: [] }] },
    /* ---------- Technologie: öffnet Forschungsoptionen in der Universität (REQ-KP.04) ---------- */
    { id: 'fortgeschritteneTaktiken', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 3, benoetigt: ['echtesMilitaer', 'gebaut:universitaet'],
      exklusivMit: ['ballistik'], oeffnetForschung: ['r_reiter', 'r_schild'],
      nameKey: 'kp.card.fortgeschritteneTaktiken.name', descKey: 'kp.card.fortgeschritteneTaktiken.desc', tiers: [{ effect: [] }] },
    { id: 'ballistik', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 3, benoetigt: ['echtesMilitaer', 'gebaut:universitaet'],
      exklusivMit: ['fortgeschritteneTaktiken'], oeffnetForschung: ['r_armbrust', 'r_katapult'],
      nameKey: 'kp.card.ballistik.name', descKey: 'kp.card.ballistik.desc', tiers: [{ effect: [] }] },
    { id: 'eiserneKlingen', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 4, benoetigt: ['metallverarbeitung', 'gebaut:universitaet'],
      oeffnetForschung: ['r_eisenwaffen'],
      nameKey: 'kp.card.eiserneKlingen.name', descKey: 'kp.card.eiserneKlingen.desc', tiers: [{ effect: [] }] },
    /* ---------- Wagnis: spielverändernd mit Nachteil, dauerhaft (REQ-KP.07) ---------- */
    { id: 'glaskanonen', familie: 'wagnis', rarity: 'wagnis', gewicht: 4, abWahl: 5, benoetigt: ['echtesMilitaer'],
      nameKey: 'kp.card.glaskanonen.name', descKey: 'kp.card.glaskanonen.desc',
      tiers: [{ effect: [{ stat: 'rangedDmg', mul: 2 }], drawback: [{ stat: 'rangedHpOne', add: 1 }] }] },
    { id: 'volleAuslastung', familie: 'wagnis', rarity: 'wagnis', gewicht: 4, abWahl: 5, benoetigt: ['echtesMilitaer'],
      nameKey: 'kp.card.volleAuslastung.name', descKey: 'kp.card.volleAuslastung.desc',
      tiers: [{ effect: [{ stat: 'supplyMult', mul: 2 }], drawback: [{ stat: 'materialYield', mul: 0.5 }] }] },
    { id: 'befestigungskunde', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 4, benoetigt: ['pfadFestungsbau', 'gebaut:universitaet'],
      oeffnetForschung: ['r_mauerausbau3', 'r_turmausbau'],
      nameKey: 'kp.card.befestigungskunde.name', descKey: 'kp.card.befestigungskunde.desc', tiers: [{ effect: [] }] },
  ],

  /* Forschungen der Pfadkarten (REQ-KP.04); Schema wie data/research.js, dazu:
       schaltetFrei   Schlüssel, die der Abschluss öffnet ('einheit:<typ>', 'stufe:<upgrade>:<n>')
       ersetzt        Einheitenersatz { von: nach }
     Geöffnet werden sie durch die Technologiekarte, die sie in oeffnetForschung nennt. Kosten und Dauer sind Startwerte (REQ-KP.04). */
  /* Forschungen, die im Modus karten entfallen, weil eine Pfadforschung sie ersetzt (Schildträger) */
  entfallen: ['r_schildtraeger'],
  forschungen: [
    { id: 'r_reiter', branch: 'pfad', nameKey: 'kp.res.reiter.name', descKey: 'kp.res.reiter.desc',
      schaltetFrei: ['einheit:reiter', 'stufe:ausbau:1'], tiers: [{ cost: 320, timeS: 75, effect: [] }] },
    { id: 'r_schild', branch: 'pfad', nameKey: 'kp.res.schild.name', descKey: 'kp.res.schild.desc',
      schaltetFrei: ['einheit:schild'], tiers: [{ cost: 320, timeS: 75, effect: [{ stat: 'unlockSchild', add: 1 }] }] },
    { id: 'r_armbrust', branch: 'pfad', nameKey: 'kp.res.armbrust.name', descKey: 'kp.res.armbrust.desc',
      schaltetFrei: ['einheit:armbrust', 'stufe:ausbau:1'], tiers: [{ cost: 320, timeS: 75, effect: [] }] },
    { id: 'r_katapult', branch: 'pfad', nameKey: 'kp.res.katapult.name', descKey: 'kp.res.katapult.desc',
      schaltetFrei: ['einheit:katapult'], tiers: [{ cost: 360, timeS: 90, effect: [] }] },
    { id: 'r_eisenwaffen', branch: 'pfad', nameKey: 'kp.res.eisenwaffen.name', descKey: 'kp.res.eisenwaffen.desc',
      schaltetFrei: ['stufe:qualitaet:4'], ersetzt: { laeufer: 'schwertkaempfer', werfer: 'bogenschuetze' }, tiers: [{ cost: 400, timeS: 90, effect: [] }] },
    { id: 'r_mauerausbau3', branch: 'pfad', nameKey: 'kp.res.mauerausbau3.name', descKey: 'kp.res.mauerausbau3.desc',
      schaltetFrei: ['stufe:mauer:2'], tiers: [{ cost: 300, timeS: 60, effect: [] }] },
    { id: 'r_turmausbau', branch: 'pfad', nameKey: 'kp.res.turmausbau.name', descKey: 'kp.res.turmausbau.desc',
      schaltetFrei: ['stufe:turm_0:2', 'stufe:turm_2:2', 'stufe:reichweite_0:1', 'stufe:reichweite_2:1', 'stufe:kadenz_0:1', 'stufe:kadenz_2:1'], tiers: [{ cost: 300, timeS: 60, effect: [] }] },
  ],
};

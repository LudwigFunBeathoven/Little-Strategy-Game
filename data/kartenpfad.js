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
    { id: 'befestigungskunde', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 4, benoetigt: ['pfadFestungsbau', 'gebaut:universitaet'],
      oeffnetForschung: ['r_mauerausbau3', 'r_turmausbau'],
      nameKey: 'kp.card.befestigungskunde.name', descKey: 'kp.card.befestigungskunde.desc', tiers: [{ effect: [] }] },
  ],

  /* Forschungen der Pfadkarten (REQ-KP.04); Schema wie data/research.js, dazu:
       schaltetFrei   Schlüssel, die der Abschluss öffnet ('einheit:<typ>', 'stufe:<upgrade>:<n>')
       ersetzt        Einheitenersatz { von: nach }
     Geöffnet werden sie durch die Technologiekarte, die sie in oeffnetForschung nennt. Kosten und Dauer sind Startwerte (REQ-KP.04). */
  forschungen: [
    { id: 'r_mauerausbau3', branch: 'pfad', nameKey: 'kp.res.mauerausbau3.name', descKey: 'kp.res.mauerausbau3.desc',
      schaltetFrei: ['stufe:mauer:2'], tiers: [{ cost: 300, timeS: 60, effect: [] }] },
    { id: 'r_turmausbau', branch: 'pfad', nameKey: 'kp.res.turmausbau.name', descKey: 'kp.res.turmausbau.desc',
      schaltetFrei: ['stufe:turm_0:2', 'stufe:turm_2:2', 'stufe:reichweite_0:1', 'stufe:reichweite_2:1', 'stufe:kadenz_0:1', 'stufe:kadenz_2:1'], tiers: [{ cost: 300, timeS: 60, effect: [] }] },
  ],
};

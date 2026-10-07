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
  ],
};

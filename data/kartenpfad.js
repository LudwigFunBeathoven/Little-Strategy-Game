/* Klammerfront – Kartenpfad (Branch exp/kartenpfad, REQ-KP.01, KP.02; Teil 5 REQ-K5.02): Technologie- und Wagnis-Karten und ihre Forschungen, deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' ist dieser Inhalt nicht im Pool und nichts gesperrt.
   Teil 5 (Leitsatz des PO): Die Grundlagen jeder Strategie sind ohne Karte verfügbar (Fabrik, Kaserne, Mauer, Türme, Schmiede, Universität, Kontor, Läufer, Werfer samt ihren Ausbaustufen);
   Karten öffnen eine Strategie. Die Bau-Karten (Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel) entfallen.
   Felder einer Karte:
     id, kat, familie   Kennung; Kategorie (Teil 6, REQ-K6.03: 'wirtschaft' | 'militaer' | 'verteidigung', ohne Eintrag neutral); 'technologie' | 'wagnis' (die Familie 'bonus' sind die Karten aus data/draft-options.js, die Familie 'doktrin' steht in data/doktrinen.js)
     rarity         'common' | 'rare' | 'legendary' (Anzeige); gewicht = Grundgewicht im Angebot (relativ zu den anderen Pfadkarten)
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
    /* ---------- Technologie: öffnet Forschungsoptionen in der Universität (REQ-KP.04); erscheint, sobald eine Universität steht (Teil 5, REQ-K5.02) ---------- */
    { id: 'fortgeschritteneTaktiken', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['gebaut:universitaet'],
      exklusivMit: ['ballistik'], oeffnetForschung: ['r_reiter', 'r_schild'],
      nameKey: 'kp.card.fortgeschritteneTaktiken.name', descKey: 'kp.card.fortgeschritteneTaktiken.desc', tiers: [{ effect: [] }] },
    { id: 'ballistik', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['gebaut:universitaet'],
      exklusivMit: ['fortgeschritteneTaktiken'], oeffnetForschung: ['r_armbrust', 'r_katapult'],
      nameKey: 'kp.card.ballistik.name', descKey: 'kp.card.ballistik.desc', tiers: [{ effect: [] }] },
    { id: 'eiserneKlingen', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['gebaut:universitaet'],
      oeffnetForschung: ['r_eisenwaffen'],
      nameKey: 'kp.card.eiserneKlingen.name', descKey: 'kp.card.eiserneKlingen.desc', tiers: [{ effect: [] }] },
    /* Teil 5: Mauer-, Turm- und Ausbaustufen gehören zur Grundausstattung; Befestigungskunde öffnet stattdessen zwei Forschungen mit eigener Wirkung (Vorschlag, zur Bestätigung) */
    { id: 'befestigungskunde', kat: 'verteidigung', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['gebaut:universitaet'],
      oeffnetForschung: ['r_wehrgang', 'r_schiessscharten'],
      nameKey: 'kp.card.befestigungskunde.name', descKey: 'kp.card.befestigungskunde.desc', tiers: [{ effect: [] }] },
    /* ---------- Wagnis: spielverändernd mit Nachteil, dauerhaft (REQ-KP.07); Fernkämpfer und Armee setzen eine Kaserne voraus ---------- */
    { id: 'glaskanonen', kat: 'militaer', familie: 'wagnis', rarity: 'wagnis', gewicht: 4, abWahl: 5, benoetigt: ['gebaut:kaserne'],
      nameKey: 'kp.card.glaskanonen.name', descKey: 'kp.card.glaskanonen.desc',
      tiers: [{ effect: [{ stat: 'rangedDmg', mul: 2 }], drawback: [{ stat: 'rangedHpOne', add: 1 }] }] },
    { id: 'volleAuslastung', familie: 'wagnis', rarity: 'wagnis', gewicht: 4, abWahl: 5, benoetigt: ['gebaut:kaserne'],
      nameKey: 'kp.card.volleAuslastung.name', descKey: 'kp.card.volleAuslastung.desc',
      tiers: [{ effect: [{ stat: 'supplyMult', mul: 2 }], drawback: [{ stat: 'materialYield', mul: 0.5 }] }] },
  ],

  /* Forschungen der Pfadkarten (REQ-KP.04); Schema wie data/research.js, dazu:
       schaltetFrei   Schlüssel, die der Abschluss öffnet ('einheit:<typ>', 'stufe:<upgrade>:<n>')
       ersetzt        Einheitenersatz { von: nach }
     Geöffnet werden sie durch die Technologiekarte, die sie in oeffnetForschung nennt. Kosten und Dauer sind Startwerte (REQ-KP.04). */
  /* Forschungen, die im Modus karten entfallen: Schildträger (eine Pfadforschung ersetzt sie), Ingenieurskunst (Teil 4, REQ-S.03: nur Baukosten) und der Hörsaal (Teil 5, REQ-K5.05:
     das Forschungsbudget der Universität ersetzt ihn) */
  entfallen: ['r_schildtraeger', 'r_ingenieur', 'r_hoersaal'],
  /* Karten, die im Modus karten nicht im Pool sind (Teil 4): Serienbau und Bauleitung (REQ-S.03: einzige Wirkung verbilligt bzw. beschleunigt das Bauen). Im Modus standard bleiben sie unverändert.
     Kriegserfahrung kehrt mit Teil 5 zurück (REQ-K5.04, dort unter dem Namen „Lehrjahre“, Pool-Eintrag in data/draft-options.js). */
  entfallenKarten: ['serienbau', 'bauleitung',
    /* Teil 5 (REQ-K5.06): unter der Spürbarkeitsgrenze, doppelt belegt oder zeitbezogen; je Karte die Maßnahme steht im Bericht (Inventar) */
    'doppelschicht', 'schwerePressen', 'nachtschicht', 'kriegsanleihe', 'grossauftrag', 'rationalisierung', 'selbstlaeufer', 'fliessband',   // Wirtschaft und Automatisierung
    'veteranen', 'taktiker', 'vorposten', 'blitzkrieg', 'soeldnerheer',                                                                         // Armee und Sonderregel
    'festungsbau', 'bastion', 'scharfschuetzen', 'zeugmeister',                                                                                  // Basis und Automatisierung
    /* Teil 6 (REQ-K6.03): Pool höchstens 38 Karten ohne Doktrinen; gestrichen wurden die schwächsten und die, deren Wirkung eine neue Karte übernimmt (Vorschlag im Bericht) */
    'weitschuss', 'sappeure', 'zinnen', 'notreserve', 'werkmeister', 'instandhaltung', 'langeWurfarme'],
  forschungen: [
    { id: 'r_reiter', branch: 'pfad', nameKey: 'kp.res.reiter.name', descKey: 'kp.res.reiter.desc',
      schaltetFrei: ['einheit:reiter'], tiers: [{ cost: 320, timeS: 45, effect: [] }] },
    { id: 'r_schild', branch: 'pfad', nameKey: 'kp.res.schild.name', descKey: 'kp.res.schild.desc',
      schaltetFrei: ['einheit:schild'], tiers: [{ cost: 320, timeS: 45, effect: [{ stat: 'unlockSchild', add: 1 }] }] },
    { id: 'r_armbrust', branch: 'pfad', nameKey: 'kp.res.armbrust.name', descKey: 'kp.res.armbrust.desc',
      schaltetFrei: ['einheit:armbrust'], tiers: [{ cost: 320, timeS: 45, effect: [] }] },
    { id: 'r_katapult', branch: 'pfad', nameKey: 'kp.res.katapult.name', descKey: 'kp.res.katapult.desc',
      schaltetFrei: ['einheit:katapult'], tiers: [{ cost: 360, timeS: 50, effect: [] }] },
    { id: 'r_eisenwaffen', branch: 'pfad', nameKey: 'kp.res.eisenwaffen.name', descKey: 'kp.res.eisenwaffen.desc',
      schaltetFrei: ['stufe:qualitaet:4'], ersetzt: { laeufer: 'schwertkaempfer', werfer: 'bogenschuetze' }, tiers: [{ cost: 400, timeS: 50, effect: [] }] },
    /* Ersatz für Mauerausbau III und Turmausbau (Teil 5): beide Stufen gehören zur Grundausstattung */
    { id: 'r_wehrgang', branch: 'pfad', nameKey: 'kp.res.wehrgang.name', descKey: 'kp.res.wehrgang.desc',
      tiers: [{ cost: 300, timeS: 40, effect: [{ stat: 'wallHp', mul: 1.3 }, { stat: 'repairCd', mul: 0.7 }] }] },
    { id: 'r_schiessscharten', branch: 'pfad', nameKey: 'kp.res.schiessscharten.name', descKey: 'kp.res.schiessscharten.desc',
      tiers: [{ cost: 300, timeS: 40, effect: [{ stat: 'turretDmg', mul: 1.3 }, { stat: 'turretVsRanged', mul: 2 }] }] },
  ],
};

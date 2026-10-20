/* Klammerfront – Kartenpfad (Branch exp/kartenpfad, REQ-KP.01, KP.02; Teil 5 REQ-K5.02): Technologie- und Wagnis-Karten und ihre Forschungen, deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' ist dieser Inhalt nicht im Pool und nichts gesperrt.
   Teil 5 (Leitsatz des PO): Die Grundlagen jeder Strategie sind ohne Karte verfügbar (Fabrik, Kaserne, Mauer, Türme, Schmiede, Universität, Kontor, Läufer, Werfer samt ihren Ausbaustufen);
   Karten öffnen eine Strategie. Die Bau-Karten (Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel) entfallen.
   Felder einer Karte:
     id, kat, familie   Kennung; Kategorie (Teil 6, REQ-K6.03: 'wirtschaft' | 'militaer' | 'verteidigung', ohne Eintrag neutral); 'technologie' | 'wagnis' (die Familie 'bonus' sind die Karten aus data/draft-options.js, die Familie 'doktrin' steht in data/doktrinen.js)
     rarity         'common' | 'rare' | 'legendary' (Anzeige); gewicht = Grundgewicht im Angebot (relativ zu den anderen Pfadkarten)
     abWahl         frühestens ab der n-ten Kartenwahl im Angebot
     benoetigt      Liste: Karten-Ids, Forschungs-Ids, 'gebaut:<gebäude>' oder 'forschungsort' (Universität oder Flügel Bibliothek, Teil 7), die vorhanden sein müssen
     garantieWahl   Teil 7: spätestens in dieser Wahl liegt die Karte im Angebot (auf einem Pfadplatz), solange sie ziehbar ist
     haus           Teil 7 (Familie weiterentwicklung): Stufe des Haupthauses, die die Karte öffnet; ziehbar, wenn das Haupthaus eine Stufe darunter steht
                    und seit deren Abschluss HAUPTHAUS.abstandWahlen Wahlen vergangen sind (Stufe I steht ab Start)
     schaltetFrei   Schlüssel: 'bau:<gebäude>', 'einheit:<typ>', 'stufe:<upgrade>:<n>' (Kauf ab Stufe n)
     oeffnetForschung   Forschungs-Ids, die in der Universität verfügbar werden (nur Technologie)
     exklusivMit    Karten-Ids, die sich gegenseitig ausschließen
     tiers          Wirkung wie bei den Bonuskarten (stat, mul/add); Pfadkarten haben meist eine Stufe
     nameKey, descKey   Texte (Präfix kp.card.), {e1} = Wert der ersten Wirkung
   Werte sind Startwerte (REQ-KP.02), Kalibrierung per Simulation. */
const KF_PFAD = {
  karten: [
    /* ---------- Weiterentwicklung des Haupthauses (Teil 7, REQ-K7.03): neutral, ohne Universität, belegt einen Pfadplatz; nach der Wahl Ausbau gegen Material (C.HAUPTHAUS) ---------- */
    { id: 'stadtrecht', familie: 'weiterentwicklung', rarity: 'common', gewicht: 20, abWahl: 2, garantieWahl: 5, haus: 2,
      nameKey: 'kp.card.stadtrecht.name', descKey: 'kp.card.stadtrecht.desc', tiers: [{ effect: [] }] },
    { id: 'hofhaltung', familie: 'weiterentwicklung', rarity: 'rare', gewicht: 20, abWahl: 2, benoetigt: ['stadtrecht'], haus: 3,
      nameKey: 'kp.card.hofhaltung.name', descKey: 'kp.card.hofhaltung.desc', tiers: [{ effect: [] }] },
    /* ---------- Technologie: öffnet Forschungsoptionen in der Universität (REQ-KP.04); erscheint, sobald eine Universität steht (Teil 5, REQ-K5.02) oder der Flügel Bibliothek (Teil 7: 'forschungsort') ---------- */
    { id: 'fortgeschritteneTaktiken', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['forschungsort'],
      exklusivMit: ['ballistik'], oeffnetForschung: ['r_reiter', 'r_schild'],
      nameKey: 'kp.card.fortgeschritteneTaktiken.name', descKey: 'kp.card.fortgeschritteneTaktiken.desc', tiers: [{ effect: [] }] },
    { id: 'ballistik', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['forschungsort'],
      exklusivMit: ['fortgeschritteneTaktiken'], oeffnetForschung: ['r_armbrust', 'r_katapult'],
      nameKey: 'kp.card.ballistik.name', descKey: 'kp.card.ballistik.desc', tiers: [{ effect: [] }] },
    { id: 'eiserneKlingen', kat: 'militaer', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['forschungsort'],
      oeffnetForschung: ['r_eisenwaffen'],
      nameKey: 'kp.card.eiserneKlingen.name', descKey: 'kp.card.eiserneKlingen.desc', tiers: [{ effect: [] }] },
    /* Teil 5: Mauer-, Turm- und Ausbaustufen gehören zur Grundausstattung; Befestigungskunde öffnet stattdessen zwei Forschungen mit eigener Wirkung (Vorschlag, zur Bestätigung) */
    { id: 'befestigungskunde', kat: 'verteidigung', familie: 'technologie', rarity: 'common', gewicht: 10, abWahl: 1, benoetigt: ['forschungsort'],
      oeffnetForschung: ['r_wehrgang', 'r_schiessscharten'],
      nameKey: 'kp.card.befestigungskunde.name', descKey: 'kp.card.befestigungskunde.desc', tiers: [{ effect: [] }] },
    /* ---------- Weiterentwicklungen (Teil 6, REQ-K6.06): Technologiekarte → Forschung → das ganze Gebäude wird ersetzt; eine je Bereich und Partie ---------- */
    { id: 'dampfkraft', kat: 'wirtschaft', familie: 'technologie', rarity: 'rare', gewicht: 10, abWahl: 3, benoetigt: ['forschungsort', 'gebaut:fabrik'],
      oeffnetForschung: ['r_dampfkraft'],
      nameKey: 'kp.card.dampfkraft.name', descKey: 'kp.card.dampfkraft.desc', tiers: [{ effect: [] }] },
    { id: 'buchdruck', kat: 'wirtschaft', familie: 'technologie', rarity: 'rare', gewicht: 10, abWahl: 3, benoetigt: ['gebaut:universitaet'],
      oeffnetForschung: ['r_buchdruck'],
      nameKey: 'kp.card.buchdruck.name', descKey: 'kp.card.buchdruck.desc', tiers: [{ effect: [] }] },
    /* Teil 7 (REQ-K7.06, K7.07): Weiterentwicklungen mit Schaden an der gegnerischen Basis – Kontor → Handelshaus (Söldnerkompanien), Schmiede → Gießerei (Geschütze) */
    { id: 'fernhandel', kat: 'wirtschaft', familie: 'technologie', rarity: 'rare', gewicht: 10, abWahl: 3, benoetigt: ['forschungsort', 'gebaut:kontor'],
      oeffnetForschung: ['r_fernhandel'],
      nameKey: 'kp.card.fernhandel.name', descKey: 'kp.card.fernhandel.desc', tiers: [{ effect: [] }] },
    { id: 'geschuetzguss', familie: 'technologie', rarity: 'rare', gewicht: 10, abWahl: 3, benoetigt: ['forschungsort', 'gebaut:schmiede'],
      oeffnetForschung: ['r_geschuetzguss'],
      nameKey: 'kp.card.geschuetzguss.name', descKey: 'kp.card.geschuetzguss.desc', tiers: [{ effect: [] }] },
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
       weiter         Weiterentwicklung (Teil 6, REQ-K6.06) { bereich: Gebäudetyp }: Der Abschluss ersetzt die Grundvarianten aller Gebäude dieses Typs (ohne Erstattung); Sonderbauten bleiben, Ausbaustufen auch
       nurUni         Teil 7: nur in einer Universität erforschbar, nicht im Flügel Bibliothek des Haupthauses
       gebaeude       Teil 7: ohne stehendes Gebäude dieses Typs keine Forschung (Fernhandel: Kontor)
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
    'weitschuss', 'sappeure', 'zinnen', 'notreserve', 'werkmeister', 'instandhaltung', 'langeWurfarme',
    /* Teil 6 (REQ-K6.07): zwei neue Ausbau-Karten brauchen Platz im Pool (Grenze 38); gestrichen wird die Karte mit der seltensten und schwächsten Wirkung */
    'verbrannteErde'],
  /* Gebäude-Ausbauten, die im Modus karten entfallen, weil eine Karte sie übernimmt (Teil 6, REQ-K6.07; die Grundlagen bleiben: Turm bauen, Mauerausbau, Quartiere, Presse, Schmiede):
     Reichweite und Feuerrate der Türme → Karte Turmschule, Stachelwall → Karte Stachelwall, Mörtelkolonne → Karte Maurerkolonne, Kontor-Ausbau (Zinseszins) → Karte Handelskontor (Stufen, Name Zinsmeister) */
  entfallenAusbauten: ['reichweite_0', 'reichweite_2', 'kadenz_0', 'kadenz_2', 'stacheln', 'moertel', 'zinseszins'],
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
    /* Weiterentwicklungen (Teil 6, REQ-K6.06; Kosten und Dauer sind Startwerte): Fabriken werden zu Dampfmühlen (Ertrag +40 %, Klickertrag ×2), die Universität zur Druckerei (Forschung halb so lang, Budgetkurs ×1,5) */
    { id: 'r_dampfkraft', branch: 'pfad', nameKey: 'kp.res.dampfkraft.name', descKey: 'kp.res.dampfkraft.desc', weiter: { bereich: 'fabrik' },
      tiers: [{ cost: 800, timeS: 60, effect: [{ stat: 'factoryYield', mul: 1.4 }, { stat: 'clickYield', mul: 2 }] }] },
    { id: 'r_buchdruck', branch: 'pfad', nameKey: 'kp.res.buchdruck.name', descKey: 'kp.res.buchdruck.desc', weiter: { bereich: 'universitaet' }, nurUni: true,       // nurUni (Teil 7): nicht in der Bibliothek
      tiers: [{ cost: 600, timeS: 50, effect: [{ stat: 'researchTime', mul: 0.5 }, { stat: 'budgetKurs', mul: 1.5 }] }] },
    /* Teil 7: Handelshaus (Söldnerkompanien im Reiter Armee, C.HANDELSHAUS) und Gießerei (Geschütze in der Kaserne, C.UNITS.geschuetz); gebaeude: ohne dieses Gebäude keine Forschung */
    { id: 'r_fernhandel', branch: 'pfad', nameKey: 'kp.res.fernhandel.name', descKey: 'kp.res.fernhandel.desc', weiter: { bereich: 'kontor' }, gebaeude: 'kontor',
      tiers: [{ cost: 500, timeS: 40, effect: [] }] },
    { id: 'r_geschuetzguss', branch: 'pfad', nameKey: 'kp.res.geschuetzguss.name', descKey: 'kp.res.geschuetzguss.desc', weiter: { bereich: 'schmiede' },
      tiers: [{ cost: 500, timeS: 40, effect: [] }] },
    /* Ersatz für Mauerausbau III und Turmausbau (Teil 5): beide Stufen gehören zur Grundausstattung */
    { id: 'r_wehrgang', branch: 'pfad', nameKey: 'kp.res.wehrgang.name', descKey: 'kp.res.wehrgang.desc',
      tiers: [{ cost: 300, timeS: 40, effect: [{ stat: 'wallHp', mul: 1.3 }, { stat: 'repairCd', mul: 0.7 }] }] },
    { id: 'r_schiessscharten', branch: 'pfad', nameKey: 'kp.res.schiessscharten.name', descKey: 'kp.res.schiessscharten.desc',
      tiers: [{ cost: 300, timeS: 40, effect: [{ stat: 'turretDmg', mul: 1.3 }, { stat: 'turretVsRanged', mul: 2 }] }] },
  ],
};

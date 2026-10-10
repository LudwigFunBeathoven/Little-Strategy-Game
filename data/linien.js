/* Klammerfront – Strategielinien, Zeichen und Gebäude-Varianten (Branch exp/kartenpfad, Teil 4, REQ-S.04, S.05), deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' bleibt alles wie in main. Der Spieler wählt keine Linie: Karten und Gebäude-Varianten tragen
   Zeichen einer Linie, die Linie mit den meisten Zeichen prägt seine Partie. Stufen und ihre Boni stehen in config.js (LINIEN), Werte der Varianten hier.
   zeichen     Karten-Id → Linie (ein Zeichen) oder [Linie, Linie] (zwei Zeichen, Schlüsselkarten); ohne Eintrag: kein Zeichen.
               Zugeordnet nach Kategorie (Armee → Militär, Wirtschaft → Wirtschaft, Basis → Verteidigung), Automatisierung und Sonderregel einzeln.
   varianten   Gebäude-Aufwertung (einmal, endgültig; Abriss und Neubau möglich):
     id, basis, linie   Kennung, Grundgebäude, Linie (die Variante trägt ein Zeichen dieser Linie)
     effect             Wirkung wie bei den Karten (stat, mul/add); wirkt einmal je Variantentyp, sobald eine Variante dieses Typs fertig steht.
                        Ausnahme: stat 'variantYield' (Manufaktur) gilt je Gebäude.
     nameKey, descKey   Texte (Präfix var.), {e1}, {e2} = Werte der Wirkungen
   Werte sind Startwerte (REQ-S.05), Kalibrierung per Simulation. */
const KF_LINIEN = {
  linien: ['militaer', 'wirtschaft', 'verteidigung'],
  zeichen: {
    /* Pfadkarten (Gelehrte und Metallverarbeitung ohne Zeichen) */
    echtesMilitaer: 'militaer', pfadFestungsbau: 'verteidigung', handel: 'wirtschaft',
    fortgeschritteneTaktiken: 'militaer', ballistik: 'militaer', eiserneKlingen: 'militaer', befestigungskunde: 'verteidigung',
    /* Wagnis-Karten (Glaskanonen, Volle Auslastung) ohne Zeichen: sie verändern die Regeln für alle Linien */
    /* Wirtschaft */
    bessereFabriken: 'wirtschaft', schwerePressen: 'wirtschaft', doppelschicht: 'wirtschaft', nachtschicht: 'wirtschaft',
    kriegsanleihe: 'wirtschaft', handelskontor: 'wirtschaft', grossauftrag: 'wirtschaft',
    /* Armee */
    aushebung: 'militaer', kriegstrommeln: 'militaer', schildwall: 'militaer', drill: 'militaer', belagerungsgeraet: 'militaer',
    langeWurfarme: 'militaer', vorposten: 'militaer', weitschuss: 'militaer', sappeure: 'militaer', veteranen: 'militaer', taktiker: 'militaer',
    /* Basis */
    maurerkolonne: 'verteidigung', turmkanoniere: 'verteidigung', bastion: 'verteidigung', zinnen: 'verteidigung',
    notreserve: 'verteidigung', scharfschuetzen: 'verteidigung', festungsbau: 'verteidigung',
    /* Automatisierung: je nach Gegenstand */
    instandhaltung: 'verteidigung', zeugmeister: 'verteidigung',               // Reparatur und Türme
    fliessband: 'wirtschaft', rationalisierung: 'wirtschaft', selbstlaeufer: 'wirtschaft',   // Presse und Fabriken
    dauerauftrag: 'wirtschaft', werkmeister: 'wirtschaft',                     // selbsttätige Ausgaben für Einheiten und Schmiede
    /* Sonderregel: je nach Gegenstand; Glücksritter (Kartenzahl), Große Armee und Blitzkrieg (Wellentakt) ohne Zeichen.
       Zeichenquellen (ohne Schlüsselkarten): Militär 15, Wirtschaft 14, Verteidigung 13 – ohne Absicht des Spielers soll keine Linie von selbst vorn liegen (Bericht kartenpfad-4). */
    soeldnerheer: 'wirtschaft', allesAufDieMitte: 'verteidigung', verbrannteErde: 'verteidigung',
    /* Schlüsselkarten (REQ-S.06): zwei Zeichen ihrer Linie */
    drillmeister: ['militaer', 'militaer'], vorhut: ['militaer', 'militaer'],
    handelsnetz: ['wirtschaft', 'wirtschaft'], ruecklage: ['wirtschaft', 'wirtschaft'],
    bollwerk: ['verteidigung', 'verteidigung'], gegenstoss: ['verteidigung', 'verteidigung'],
  },
  varianten: [
    /* Fabrik */
    { id: 'werkstatt',    basis: 'fabrik',   linie: 'militaer',     effect: [{ stat: 'unitCost', mul: 0.9 }],
      nameKey: 'var.werkstatt.name',    descKey: 'var.werkstatt.desc' },
    { id: 'manufaktur',   basis: 'fabrik',   linie: 'wirtschaft',   effect: [{ stat: 'variantYield', add: 0.4 }],
      nameKey: 'var.manufaktur.name',   descKey: 'var.manufaktur.desc' },
    { id: 'wachstube',    basis: 'fabrik',   linie: 'verteidigung', effect: [{ stat: 'turretDmg', mul: 1.15 }, { stat: 'towerKillMaterial', add: 1 }],
      nameKey: 'var.wachstube.name',    descKey: 'var.wachstube.desc' },
    /* Kaserne */
    { id: 'exerzierplatz', basis: 'kaserne', linie: 'militaer',     effect: [{ stat: 'unitDmg', mul: 1.1 }, { stat: 'unitHp', mul: 1.1 }],
      nameKey: 'var.exerzierplatz.name', descKey: 'var.exerzierplatz.desc' },
    { id: 'garnison',      basis: 'kaserne', linie: 'verteidigung', effect: [{ stat: 'wallRegenFlat', add: 2 }, { stat: 'gateUnitHp', mul: 1.2 }],
      nameKey: 'var.garnison.name',      descKey: 'var.garnison.desc' },
    /* Schmiede (Soll) */
    { id: 'waffenschmiede', basis: 'schmiede', linie: 'militaer',    effect: [{ stat: 'smithEffect', mul: 1.5 }],
      nameKey: 'var.waffenschmiede.name', descKey: 'var.waffenschmiede.desc' },
    { id: 'ruestkammer',    basis: 'schmiede', linie: 'verteidigung', effect: [{ stat: 'wallHp', mul: 1.15 }],
      nameKey: 'var.ruestkammer.name',    descKey: 'var.ruestkammer.desc' },
  ],
};

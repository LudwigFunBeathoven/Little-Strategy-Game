/* Klammerfront – Gebäude-Varianten (Branch exp/kartenpfad, Teil 4, REQ-S.05; Teil 6, REQ-K6.02: ohne Strategielinien und Zeichen), deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' bleibt alles wie in main. Die Strategielinien aus Teil 4 und 5 entfallen (Teil 6): Varianten tragen kein Zeichen mehr,
   die Kategorien (Wirtschaft, Militär, Verteidigung) zählen Karten (core.js, KATEGORIEN in config.js). Werte der Aufwertung (Kosten, Dauer) stehen in config.js (AUFWERTUNG).
   varianten   Gebäude-Aufwertung (einmal, endgültig; Abriss und Neubau möglich):
     id, basis, kat     Kennung, Grundgebäude, Kategorie der Variante (nur Farbe der Markierung im Raster und Wahl der Kategorie-Bots; die Variante zählt nicht als Karte)
     doktrin            nur Sonderbauten (Teil 5): Id der Doktrin, ohne die die Variante nicht angeboten wird
     kostenFaktor       optional: Kosten × Baukosten des Grundgebäudes statt des Standards (AUFWERTUNG bzw. DOKTRIN.sonderbau)
     effect             Wirkung wie bei den Karten (stat, mul/add); wirkt einmal je Variantentyp, sobald eine Variante dieses Typs fertig steht.
                        Ausnahme: stat 'variantYield' (Manufaktur) gilt je Gebäude.
     nameKey, descKey   Texte (Präfix var.), {e1}, {e2} = Werte der Wirkungen
   Werte sind Startwerte (REQ-S.05), Kalibrierung per Simulation. */
const KF_VARIANTEN = {
  varianten: [
    /* Fabrik */
    { id: 'werkstatt',    basis: 'fabrik',   kat: 'militaer',     effect: [{ stat: 'unitCost', mul: 0.75 }],
      nameKey: 'var.werkstatt.name',    descKey: 'var.werkstatt.desc' },
    { id: 'manufaktur',   basis: 'fabrik',   kat: 'wirtschaft',   effect: [{ stat: 'variantYield', add: 0.2 }],
      nameKey: 'var.manufaktur.name',   descKey: 'var.manufaktur.desc' },
    { id: 'wachstube',    basis: 'fabrik',   kat: 'verteidigung', effect: [{ stat: 'turretDmg', mul: 1.3 }, { stat: 'towerKillMaterial', add: 1 }],
      nameKey: 'var.wachstube.name',    descKey: 'var.wachstube.desc' },
    /* Kaserne */
    { id: 'exerzierplatz', basis: 'kaserne', kat: 'militaer',     effect: [{ stat: 'unitDmg', mul: 1.1 }, { stat: 'unitHp', mul: 1.1 }],
      nameKey: 'var.exerzierplatz.name', descKey: 'var.exerzierplatz.desc' },
    { id: 'garnison',      basis: 'kaserne', kat: 'verteidigung', effect: [{ stat: 'wallRegenFlat', add: 2 }, { stat: 'gateUnitHp', mul: 1.2 }],
      nameKey: 'var.garnison.name',      descKey: 'var.garnison.desc' },
    /* Sonderbauten (Teil 5, REQ-K5.07): nur mit der Doktrin (Feld doktrin) aufzuwerten, teurer (C.DOKTRIN.sonderbau.kostenFaktor), deutlich stärker als die Grundvarianten.
       Ihre Wirkung steht hier (effect, einmal je Variantentyp) oder in core.js über C.DOKTRIN (Zunfthaus: Nachbarschaftsbonus je Gebäude, Bastion: feuert). */
    { id: 'zunfthaus',     basis: 'fabrik',       kat: 'wirtschaft',   doktrin: 'zunftordnung', effect: [],
      nameKey: 'var.zunfthaus.name',     descKey: 'var.zunfthaus.desc' },
    { id: 'bastion',       basis: 'fabrik',       kat: 'verteidigung', doktrin: 'bollwerk',     effect: [],
      nameKey: 'var.bastion.name',       descKey: 'var.bastion.desc' },
    { id: 'stiftungshaus', basis: 'universitaet', kat: 'wirtschaft',   doktrin: 'stiftung',     kostenFaktor: 2, effect: [{ stat: 'budgetKurs', mul: 2 }],
      nameKey: 'var.stiftungshaus.name', descKey: 'var.stiftungshaus.desc' },
    { id: 'heerlager',     basis: 'kaserne',      kat: 'militaer',     doktrin: 'stehendesHeer', effect: [{ stat: 'supply', add: 6 }],
      nameKey: 'var.heerlager.name',     descKey: 'var.heerlager.desc' },
    { id: 'zahlmeisterei',  basis: 'kaserne', kat: 'wirtschaft',   effect: [{ stat: 'quartiereCost', mul: 0.7 }],
      nameKey: 'var.zahlmeisterei.name', descKey: 'var.zahlmeisterei.desc' },
    /* Schmiede (Soll) */
    { id: 'waffenschmiede', basis: 'schmiede', kat: 'militaer',    effect: [{ stat: 'smithEffect', mul: 1.5 }],
      nameKey: 'var.waffenschmiede.name', descKey: 'var.waffenschmiede.desc' },
    { id: 'ruestkammer',    basis: 'schmiede', kat: 'verteidigung', effect: [{ stat: 'wallHp', mul: 1.15 }],
      nameKey: 'var.ruestkammer.name',    descKey: 'var.ruestkammer.desc' },
    { id: 'muenzschmiede',  basis: 'schmiede', kat: 'wirtschaft',   effect: [{ stat: 'qualitaetCost', mul: 0.75 }],
      nameKey: 'var.muenzschmiede.name',  descKey: 'var.muenzschmiede.desc' },
  ],
};

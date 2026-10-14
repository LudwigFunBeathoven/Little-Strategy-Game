/* Klammerfront – Strategielinien, Zeichen und Gebäude-Varianten (Branch exp/kartenpfad, Teil 4, REQ-S.04, S.05), deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' bleibt alles wie in main. Der Spieler wählt keine Linie: Karten und Gebäude-Varianten tragen
   Zeichen einer Linie, die Linie mit den meisten Zeichen prägt seine Partie. Stufen und ihre Boni stehen in config.js (LINIEN), Werte der Varianten hier.
   zeichen     Karten-Id → [Linie, Linie, Linie] (drei Zeichen einer Doktrin); ohne Eintrag: kein Zeichen. Seit Teil 5 tragen nur Doktrinen Zeichen.
   varianten   Gebäude-Aufwertung (einmal, endgültig; Abriss und Neubau möglich):
     id, basis, linie   Kennung, Grundgebäude, Linie (die Variante trägt ein Zeichen dieser Linie)
     doktrin            nur Sonderbauten (Teil 5): Id der Doktrin, ohne die die Variante nicht angeboten wird
     kostenFaktor       optional: Kosten × Baukosten des Grundgebäudes statt des Standards (LINIEN.aufwertung bzw. DOKTRIN.sonderbau)
     effect             Wirkung wie bei den Karten (stat, mul/add); wirkt einmal je Variantentyp, sobald eine Variante dieses Typs fertig steht.
                        Ausnahme: stat 'variantYield' (Manufaktur) gilt je Gebäude.
     nameKey, descKey   Texte (Präfix var.), {e1}, {e2} = Werte der Wirkungen
   Werte sind Startwerte (REQ-S.05), Kalibrierung per Simulation. */
const KF_LINIEN = {
  linien: ['militaer', 'wirtschaft', 'verteidigung'],
  zeichen: {
    /* Teil 5 (REQ-K5.08): Zeichen tragen nur Doktrinen (je drei, C.DOKTRIN.zeichen) und Gebäude-Varianten (siehe unten); Bonus-, Technologie- und Wagnis-Karten tragen keines */
    zunftordnung: ['wirtschaft', 'wirtschaft', 'wirtschaft'], stiftung: ['wirtschaft', 'wirtschaft', 'wirtschaft'],
    stehendesHeer: ['militaer', 'militaer', 'militaer'], vorstoss: ['militaer', 'militaer', 'militaer'],
    bollwerk: ['verteidigung', 'verteidigung', 'verteidigung'], ausfall: ['verteidigung', 'verteidigung', 'verteidigung'],
  },
  varianten: [
    /* Fabrik */
    { id: 'werkstatt',    basis: 'fabrik',   linie: 'militaer',     effect: [{ stat: 'unitCost', mul: 0.75 }],
      nameKey: 'var.werkstatt.name',    descKey: 'var.werkstatt.desc' },
    { id: 'manufaktur',   basis: 'fabrik',   linie: 'wirtschaft',   effect: [{ stat: 'variantYield', add: 0.2 }],
      nameKey: 'var.manufaktur.name',   descKey: 'var.manufaktur.desc' },
    { id: 'wachstube',    basis: 'fabrik',   linie: 'verteidigung', effect: [{ stat: 'turretDmg', mul: 1.3 }, { stat: 'towerKillMaterial', add: 1 }],
      nameKey: 'var.wachstube.name',    descKey: 'var.wachstube.desc' },
    /* Kaserne */
    { id: 'exerzierplatz', basis: 'kaserne', linie: 'militaer',     effect: [{ stat: 'unitDmg', mul: 1.1 }, { stat: 'unitHp', mul: 1.1 }],
      nameKey: 'var.exerzierplatz.name', descKey: 'var.exerzierplatz.desc' },
    { id: 'garnison',      basis: 'kaserne', linie: 'verteidigung', effect: [{ stat: 'wallRegenFlat', add: 2 }, { stat: 'gateUnitHp', mul: 1.2 }],
      nameKey: 'var.garnison.name',      descKey: 'var.garnison.desc' },
    /* Sonderbauten (Teil 5, REQ-K5.07): nur mit der Doktrin (Feld doktrin) aufzuwerten, teurer (C.DOKTRIN.sonderbau.kostenFaktor), deutlich stärker als die Grundvarianten.
       Ihre Wirkung steht hier (effect, einmal je Variantentyp) oder in core.js über C.DOKTRIN (Zunfthaus: Nachbarschaftsbonus je Gebäude, Bastion: feuert). */
    { id: 'zunfthaus',     basis: 'fabrik',       linie: 'wirtschaft',   doktrin: 'zunftordnung', effect: [],
      nameKey: 'var.zunfthaus.name',     descKey: 'var.zunfthaus.desc' },
    { id: 'bastion',       basis: 'fabrik',       linie: 'verteidigung', doktrin: 'bollwerk',     effect: [],
      nameKey: 'var.bastion.name',       descKey: 'var.bastion.desc' },
    { id: 'stiftungshaus', basis: 'universitaet', linie: 'wirtschaft',   doktrin: 'stiftung',     kostenFaktor: 2, effect: [{ stat: 'budgetKurs', mul: 2 }],
      nameKey: 'var.stiftungshaus.name', descKey: 'var.stiftungshaus.desc' },
    { id: 'heerlager',     basis: 'kaserne',      linie: 'militaer',     doktrin: 'stehendesHeer', effect: [{ stat: 'supply', add: 6 }],
      nameKey: 'var.heerlager.name',     descKey: 'var.heerlager.desc' },
    { id: 'zahlmeisterei',  basis: 'kaserne', linie: 'wirtschaft',   effect: [{ stat: 'quartiereCost', mul: 0.7 }],
      nameKey: 'var.zahlmeisterei.name', descKey: 'var.zahlmeisterei.desc' },
    /* Schmiede (Soll) */
    { id: 'waffenschmiede', basis: 'schmiede', linie: 'militaer',    effect: [{ stat: 'smithEffect', mul: 1.5 }],
      nameKey: 'var.waffenschmiede.name', descKey: 'var.waffenschmiede.desc' },
    { id: 'ruestkammer',    basis: 'schmiede', linie: 'verteidigung', effect: [{ stat: 'wallHp', mul: 1.15 }],
      nameKey: 'var.ruestkammer.name',    descKey: 'var.ruestkammer.desc' },
    { id: 'muenzschmiede',  basis: 'schmiede', linie: 'wirtschaft',   effect: [{ stat: 'qualitaetCost', mul: 0.75 }],
      nameKey: 'var.muenzschmiede.name',  descKey: 'var.muenzschmiede.desc' },
  ],
};

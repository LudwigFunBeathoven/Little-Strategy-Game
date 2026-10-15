/* Klammerfront – Karten des Branches exp/kartenpfad, Teil 6 (REQ-K6.02, K6.03, K6.07), deklarativ.
   Gilt nur im Pacing-Modus 'karten' (Feld nurKarten, wird in core.js gesetzt); im Modus 'standard' sind diese Karten nicht im Pool. Schema wie data/draft-options.js, dazu:
     kat         Kategorie der Karte (Teil 6, REQ-K6.03): 'wirtschaft' | 'militaer' | 'verteidigung' oder eine Liste mit zwei Kategorien (Brücke: zählt für beide); ohne Eintrag: neutral
     category    nur die Darstellung der älteren Oberfläche (Farbklasse): wirtschaft | armee | basis | sonderregel; sie folgt der Kategorie
     synergie    Synergiekarte (REQ-K6.03): { art: 'zaehler' | 'verstaerker' | 'bruecke', zaehlt: Kategorie, stat, perCard (mul: Faktor je Karte) | perN + add (add: je perN Karten) }

   Übernommene Regeln der Strategielinien (REQ-K6.02, Teil 5: Linienstufen): Jede Karte wirkt in Stufe I wie die frühere Linienstufe (dieselben Werte; tests/linien6.test.mjs).
   Neue Karten und Werte sind Startwerte, Kalibrierung per Simulation; Namen sind Platzhalter (der PO kann sie ändern). */
const KF_KARTEN6 = [
  /* ---------- Übernommene Regeln der Linienstufen (REQ-K6.02) ---------- */
  { id: 'querverbindung', category: 'wirtschaft', kat: 'wirtschaft', rarity: 'common', nameKey: 'draft.querverbindung.name', descKey: 'draft.querverbindung.desc', wirkt: { building: 'fabrik' },
    tiers: [{ effect: [{ stat: 'nbDiagonal', add: 1 }] }] },                                                      // frühere Linie Wirtschaft, Stufe 1: Nachbarschaftsboni wirken auch diagonal
  { id: 'lagerzehnt', category: 'wirtschaft', kat: 'wirtschaft', rarity: 'common', nameKey: 'draft.lagerzehnt.name', descKey: 'draft.lagerzehnt.desc', wirkt: { phase: 'mid' },
    tiers: [{ effect: [{ stat: 'lagerEp', add: 1 }] }] },                                                         // frühere Linie Wirtschaft, Stufe 2: Material über dem Lagerdeckel wird zu EP
  { id: 'soeldnertruppe', category: 'wirtschaft', kat: ['wirtschaft', 'militaer'], rarity: 'rare', nameKey: 'draft.soeldnertruppe.name', descKey: 'draft.soeldnertruppe.desc', wirkt: { building: 'kaserne' },
    tiers: [{ effect: [{ stat: 'soeldner', add: 1 }] }] },                                                        // frühere Linie Wirtschaft, Stufe 3: Söldner über dem Versorgungslimit (Brücke Wirtschaft + Militär)
  { id: 'rekrutenzug', category: 'armee', kat: 'militaer', rarity: 'common', nameKey: 'draft.rekrutenzug.name', descKey: 'draft.rekrutenzug.desc', wirkt: { building: 'kaserne' },
    tiers: [{ effect: [{ stat: 'extraUnit', add: 1 }] },                                                          // frühere Linie Militär, Stufe 1: die Kaserne schickt je Welle einen Läufer mehr
            { effect: [{ stat: 'extraUnit', add: 1 }, { stat: 'startSmith', add: 1 }] }] },                       // Stufe II: frühere Linie Militär, Stufe 2 – neue Einheiten starten mit einer Schmiede-Stufe mehr
  { id: 'durchbruch', category: 'armee', kat: 'militaer', rarity: 'rare', nameKey: 'draft.durchbruch.name', descKey: 'draft.durchbruch.desc',
    tiers: [{ effect: [{ stat: 'dmgVsBase', mul: 2 }] }] },                                                       // frühere Linie Militär, Stufe 3: doppelter Schaden an der gegnerischen Basis
  { id: 'pluenderung', category: 'basis', kat: 'verteidigung', rarity: 'common', nameKey: 'draft.pluenderung.name', descKey: 'draft.pluenderung.desc', wirkt: { tower: true },
    tiers: [{ effect: [{ stat: 'towerKillMaterial', add: 1 }] }] },                                               // frühere Linie Verteidigung, Stufe 1: Abschüsse durch Türme bringen Material
];

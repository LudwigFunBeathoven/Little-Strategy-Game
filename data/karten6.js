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

  /* ---------- Gebäude-Ausbauten als Karten (REQ-K6.07): Die Ausbauten Reichweite und Feuerrate der Türme (Turmschule) und Stachelwall der Mauer entfallen im Modus karten (KF_PFAD.entfallenAusbauten);
     ihre Karte wirkt in der letzten Stufe mindestens so stark wie alle Stufen des Ausbaus zusammen (tests/ausbauten6.test.mjs). Dazu kommen Zinsmeister (Kontor-Ausbau; Stufen der Karte Handelskontor, config.js KARTEN.kartenTiers)
     und Maurerkolonne (Mörtelkolonne; bestehende Karte). Stufen sind Gesamtwerte, nicht Zuwächse. ---------- */
  { id: 'turmschule', category: 'basis', kat: 'verteidigung', rarity: 'common', nameKey: 'draft.turmschule.name', descKey: 'draft.turmschule.desc', wirkt: { tower: true }, turmAusbau: true,
    tiers: [{ effect: [{ stat: 'rangeAusbau', mul: 1.2 }, { stat: 'cdAusbau', mul: 0.8 }] },
            { effect: [{ stat: 'rangeAusbau', mul: 1.45 }, { stat: 'cdAusbau', mul: 0.62 }] },
            { effect: [{ stat: 'rangeAusbau', mul: 1.7 }, { stat: 'cdAusbau', mul: 0.45 }] }] },        // Ausbau: Reichweite 4 × +20 auf 120 (× 1,67), Feuerrate 5 × 0,87 (× 0,50)
  { id: 'stachelwall', category: 'basis', kat: 'verteidigung', rarity: 'common', nameKey: 'draft.stachelwall.name', descKey: 'draft.stachelwall.desc',
    tiers: [{ effect: [{ stat: 'stachelStufen', add: 3 }] },
            { effect: [{ stat: 'stachelStufen', add: 5 }] },
            { effect: [{ stat: 'stachelStufen', add: 7 }] }] },                                        // Ausbau: fünf Stufen; Stachelstufen wirken wie die Stufen des Ausbaus (4 Schaden je Stufe und Schlag)

  /* ---------- Synergiekarten (REQ-K6.03): Wirkung nach der Zahl gewählter Karten einer Kategorie (höchstens KATEGORIEN.deckel; sie erscheinen ab KATEGORIEN.synergieAb Karten der Kategorie) ----------
     Zähler (zaehler): Wirkung wächst mit der Zahl der Karten der eigenen Kategorie. Verstärker (verstaerker): vervielfacht eine Mechanik (fix: fester Wert, perN + add: je perN Karten add).
     Brücke (bruecke): gehört zu zwei Kategorien (kat ist eine Liste, die Karte zählt für beide) und wirkt nach den Karten der Kategorie zaehlt. perCard: Faktor je Karte (mul = 1 + perCard × Karten). */
  { id: 'gilde', category: 'wirtschaft', kat: 'wirtschaft', rarity: 'common', nameKey: 'draft.gilde.name', descKey: 'draft.gilde.desc', wirkt: { building: 'fabrik' },
    synergie: { art: 'zaehler', zaehlt: 'wirtschaft', stat: 'materialYield', perCard: 0.08 }, tiers: [{ effect: [] }] },
  { id: 'waffenbrueder', category: 'armee', kat: 'militaer', rarity: 'common', nameKey: 'draft.waffenbrueder.name', descKey: 'draft.waffenbrueder.desc',
    synergie: { art: 'zaehler', zaehlt: 'militaer', stat: 'unitDmg', perCard: 0.07 }, tiers: [{ effect: [] }] },      // 7 statt 5 % je Karte: Spürbarkeitsgrenze (ab drei Karten mindestens 20 %)
  { id: 'wehrverband', category: 'basis', kat: 'verteidigung', rarity: 'common', nameKey: 'draft.wehrverband.name', descKey: 'draft.wehrverband.desc', wirkt: { tower: true },
    synergie: { art: 'zaehler', zaehlt: 'verteidigung', stat: 'turretDmg', perCard: 0.08 }, tiers: [{ effect: [] }] },
  { id: 'bauordnung', category: 'wirtschaft', kat: 'wirtschaft', rarity: 'common', nameKey: 'draft.bauordnung.name', descKey: 'draft.bauordnung.desc', wirkt: { building: 'fabrik' },
    synergie: { art: 'verstaerker', zaehlt: 'wirtschaft', fix: { stat: 'nbAll', mul: 2 } }, tiers: [{ effect: [] }] },
  { id: 'sammelruf', category: 'armee', kat: 'militaer', rarity: 'common', nameKey: 'draft.sammelruf.name', descKey: 'draft.sammelruf.desc', wirkt: { building: 'kaserne' },
    synergie: { art: 'verstaerker', zaehlt: 'militaer', stat: 'extraUnit', perN: 2, add: 1 }, tiers: [{ effect: [] }] },
  { id: 'kriegswirtschaft', category: 'wirtschaft', kat: ['wirtschaft', 'militaer'], rarity: 'rare', nameKey: 'draft.kriegswirtschaft.name', descKey: 'draft.kriegswirtschaft.desc',
    synergie: { art: 'bruecke', zaehlt: 'militaer', stat: 'unitCost', perCard: -0.05 }, tiers: [{ effect: [] }] },
  { id: 'wehrhandel', category: 'wirtschaft', kat: ['wirtschaft', 'verteidigung'], rarity: 'rare', nameKey: 'draft.wehrhandel.name', descKey: 'draft.wehrhandel.desc', wirkt: { building: 'fabrik' },
    synergie: { art: 'bruecke', zaehlt: 'verteidigung', stat: 'materialYield', perCard: 0.03 }, tiers: [{ effect: [] }] },
  { id: 'grenzwacht', category: 'basis', kat: ['militaer', 'verteidigung'], rarity: 'rare', nameKey: 'draft.grenzwacht.name', descKey: 'draft.grenzwacht.desc',
    synergie: { art: 'bruecke', zaehlt: 'militaer', stat: 'wallHp', perCard: 0.05 }, tiers: [{ effect: [] }] },
];

/* Klammerfront – zentrale Konfiguration.
   Alle Spielwerte stehen hier. Der Spielcode enthält keine eigenen Zahlenwerte für Balancing oder Regeln.
   Texte stehen nicht hier, sondern in i18n/de.js und i18n/en.js. */
const KF_CONFIG = {
  VERSION: '0.9.2-kartenpfad-3',
  SAVE_KEY: 'klammerfront.save.v8',          // Branch: eigene, höhere Spielstand-Version als main (7)
  SAVE_PREFIX: 'klammerfront.save.',   // ältere Spielstände unter diesem Präfix werden erkannt und mit Hinweis verworfen
  RECORDS_KEY: 'klammerfront.records.v1',
  LANG_KEY: 'klammerfront.lang',
  HINTS_KEY: 'klammerfront.hints.v1',   // gesehene Erstkontakt-Hinweise (REQ-20.3)
  TUTORIAL_KEY: 'klammerfront.tutorial.v1',   // Merker „erste Partie“: fehlt er, ist es die erste Partie dieses Browsers (REQ-T.04, T2.01)
  DIFFICULTY_KEY: 'klammerfront.difficulty',  // zuletzt gewählter Schwierigkeitsgrad (REQ-T2.01)
  PACING_MODUS: 'karten',                      // Pacing-Modus: 'standard' (alles wie bisher; Testbuild: ?pacing=standard) oder 'karten' oder ein Modus aus PACING; wählt auch überschriebene Tutorial-Texte (REQ-T2.05)
  /* Pacing-Modi (REQ-KP.01): Der Modus 'standard' sperrt nichts. Ein Modus sperrt die Schlüssel in gesperrt, bis unlockKey() sie öffnet
     ('bau:<gebäude>', 'einheit:<typ>', 'forschung:<id>'), und bindet Upgrade-Stufen an eine Quelle (Karte oder Forschung):
     stufen: { <upgrade>: [{ ab: n, quelle: id }] } – der Kauf der Stufe n und aller höheren verlangt die Quelle mit dem größten ab <= n. */
  PACING: {},
  /* Kartenpfad (REQ-KP.02, KP.06): Angebot im Modus 'karten'; Startwerte, per Simulation zu kalibrieren */
  KARTEN: {
    rueckstandPlus: 0.5,        // Gewichtszuschlag je Wahl, in der eine ziehbare Bau-Karte nicht im Angebot erschien (Faktor auf das Grundgewicht)
    /* Wahl-Fahrplan (REQ-P.02): Zielzeit je Wahl in Sekunden Spielzeit (Profil „durchschnitt“, Normal); ab Wahl 11 je takt Sekunden später.
       Eine Wahl wird fällig, wenn die EP-Schwelle erreicht ist (schwellen: EP-Schritt je Wahl; über das Tabellenende gilt der letzte Schritt) oder maxAbstand nach der letzten Wahl
       vergangen ist; frühestens minAbstand nach der letzten Wahl, die EP darüber bleiben erhalten. Gleich auf allen Schwierigkeitsgraden.
       Kalibrierung: node tools/fahrplan-kalibrieren.mjs --profile aktiv,durchschnitt --modus obergrenze --x1 43 (Messung und Ableitung im Bericht kartenpfad-3).
       Wahl 1: 43 EP (die erste Karte muss auf Schwer vor der ersten großen Welle kommen); ab Wahl 2: größter EP-Stand aller Referenzpartien zur Zielzeit. Die Mitte der Partie
       bringt kaum EP (die Belagerung hält die Gegnerwellen auf), darum bestimmt dort die Zeit den Takt; die EP belohnen Spiel, das über das Referenzniveau hinausgeht. */
    fahrplan: {
      ziele: [90, 160, 225, 290, 355, 420, 485, 550, 615, 680],
      takt: 65,
      minAbstand: 45,
      schwellen: [43, 177, 210, 200, 255, 285, 430, 435, 455, 485, 690, 250],
    },
    wellenFaktor: 1.5,           // Modus karten: reguläre Gegnerwellen wachsen bis auf × wellenFaktor, linear über wellenAnstiegMin Minuten (Standard unverändert)
    wellenAnstiegMin: 8,
    basisFaktor: 4.5,            // Modus karten: Lebenspunkte der gegnerischen Basis × basisFaktor (längere Partien, ohne die frühen Wellen zu verschärfen); REQ-P.03: 3,5 → 4,5 (Median Normal/durchschnitt 11:50 statt 10:30)
    gewichte: {},               // optionale Überschreibung der Grundgewichte einzelner Pfadkarten { id: gewicht } (Versuche; sonst gilt gewicht aus data/kartenpfad.js)
    maxAbstand: 65,             // Höchstabstand (Mindesttempo): steht nach so vielen Sekunden Spielzeit seit der letzten Wahl keine an, wird die nächste fällig (REQ-KP.06, P.02); vor der ersten Wahl zählt fahrplan.ziele[0] − maxAbstand als „letzte Wahl“.
                                // Anforderung: 100 s. Gemessen: ohne EP-Ertrag in der Mitte der Partie (Belagerung) verfehlt 100 s die Zielzeiten ab Wahl 8 um bis zu 100 s; 65 s = takt (Abweichung, zur Bestätigung)
    angebot: { basis: 3, universitaet: 4 },   // Karten je Angebot im Modus karten (REQ-P.04); Standard: DRAFT_OPTIONS_BASE / _UNIVERSITY
    pfadPlaetze: 2,             // Plätze für Pfadkarten (Bau, Technologie) je Angebot, wenn so viele ziehbar sind; der Rest sind Bonusplätze (REQ-P.04)
    maxWarten: 3,               // eine ziehbare Bau-Karte erscheint spätestens in der n-ten Wahl nach ihrer Freigabe (harte Grenze)
  },
  LANGUAGES: ['de', 'en'],
  FALLBACK_LANG: 'en',

  /* Zeit und Ablauf */
  TICK_S: 0.05,                 // 20 Logik-Schritte pro Sekunde
  MAX_FRAME_S: 1,               // längster Frame, der nachgeholt wird
  UI_REFRESH_S: 0.1,
  AUTOSAVE_MS: 5000,
  LOG_LINES: 5,

  /* Tooltips (REQ-05) */
  TOOLTIP_DELAY_MS: 1000,       // Entscheidung Product Owner: 1000 statt 2000 ms
  TOUCH_TOOLTIP_MS: 500,
  TOOLTIP_OFFSET_X: 14,
  TOOLTIP_OFFSET_Y: 18,
  TOOLTIP_MARGIN: 8,
  TOUCH_MOVE_TOLERANCE_PX: 10,
  TOUCH_MOUSE_GUARD_MS: 800,
  DEV_AUDIT_MS: 2000,

  /* Schlachtfeld: drei Lanes (REQ-11). Index 0 = oben, 1 = Mitte, 2 = unten. */
  LANE: 1000,
  LANE_COUNT: 3,
  GATE_LANE: 1,                 // Das Tor liegt am Ende der mittleren Lane
  LANE_ORDER: [1, 0, 2],        // Reihenfolge Mitte, oben, unten (REQ-12.1/12.2)
  PLAYER_BASE_WIDTH: 60,
  ENEMY_BASE_WIDTH: 44,
  SPAWN_BLOCK_DIST: 12,
  /* Formationen (REQ-42) */
  FORMATION_ROW_MAX: 5,         // höchstens so viele Einheiten je Reihe quer zur Lane
  ROW_GAP: 16,                  // Abstand zwischen zwei Reihen
  ROW_SPREAD: 0.15,             // Abstand zweier Plätze einer Reihe quer zur Lane, in Lane-Höhen (Darstellung und Messung)
  MELEE_REACH: 14,              // Kontaktabstand der vordersten Nahkampfreihe
  /* Lane-übergreifender Kampf (REQ-43) */
  LANE_SHIFT_S: 1.2,            // Dauer der Querbewegung in eine Nachbar-Lane
  TOWER_RANGE: 120,             // Grundreichweite der eigenen Türme (bisher PLAYER_TURRET.range)

  /* Armee als gemeinsame Welle (REQ-5.06); gilt gespiegelt auch für den Gegner */
  ARMY: {
    contactRange: 14,           // Abstand der Front zu Gegner, Mauer oder Basis, ab dem die Armee in den Kampf geht (Nahkampf-Kontakt)
    contactHysteresis: 16,      // Zusatzabstand für das Verlassen des Kampfes (verhindert Flattern zwischen Kampf und Sammeln)
    regroupTimeoutS: 4,         // Sammeln endet spätestens nach dieser Zeit
    catchUpFactor: 1.5,         // Aufschlusstempo des Nachschubs relativ zum Marschtempo
    speedRule: 'slowest',       // Marschtempo = langsamste Einheit der Armee
    midRefillShare: 1 / 3,      // fällt die letzte Einheit der Mitte, erhält die Mitte diesen Anteil der Armee (aufgerundet)
    minStateS: 0.5,             // Mindestverweildauer je Zustand (Marsch, Kampf, Sammeln), gegen Zustandspendeln (REQ-6.01)
    minLaneStayS: 1.5,          // nach der Ankunft in einer Lane bleibt eine Einheit im Kampf mindestens so lange dort
    deadZone: 0.02,             // Totzone quer (in Lanes): näher an der Ziel-Lane rastet eine Einheit ein und bewegt sich nicht mehr
  },

  /* Angriffe (REQ-6.02): Versatz und Streuung gegen Gleichtakt; alles über den Spielzufall S.rng */
  COMBAT: {
    cdJitter: 0.10,             // jede Angriffspause ± diesen Anteil (gleichverteilt, Mittelwert unverändert)
    spawnStagger: 1.0,          // erste Angriffspause beim Entstehen: zufälliger Anteil 0 … spawnStagger der Angriffspause
    avoidOverkill: false,       // Fernkämpfer meiden Ziele, deren im selben Takt geplanter Schaden schon für den Abschuss reicht (Soll, Schalter)
  },

  /* Oberfläche (REQ-5.01, REQ-5.03) */
  UI: {
    dragThresholdPx: 6,         // ab dieser Zeigerbewegung ist eine Geste in der Welt ein Ziehen, darunter ein Klick
    bands: { hud: 0.10, world: 0.50, work: 0.40 },   // Anteile der Fensterhöhe: Ressourcenleiste, Spielwelt, Arbeitsbereich
    hudMinPx: 56, hudMaxPx: 80,                      // Grenzen der Ressourcenleiste; der Arbeitsbereich erhält den Rest
    xpRateWindowS: 30,          // EP je Sekunde in der Leiste: gleitend über diese Spielzeit
    floatMs: 900,               // Dauer der schwebenden Zahlen bei Material- und EP-Gewinn (REQ-5.10)
    fadeS: 0.6,                 // gefallene Einheiten verblassen so lange
    unitEaseS: 0.08,            // gezeichnete Einheiten folgen ihrer Position mit dieser Zeitkonstante (kein Springen beim Aufrücken, REQ-6.01)
    unitEaseSnapPx: 0.3,        // Totzone der Darstellung: näher als so viele Pixel wird nicht mehr nachgeführt
    // Heimat-Reiter je Gebäudetyp (REQ-6.05): ein Klick auf das Gebäude in der Welt öffnet diesen Reiter
    homeTab: { fabrik: 'build', kaserne: 'army', schmiede: 'smithy', universitaet: 'uni', kontor: 'build' },
    draftLockMs: 400,
    entdecken: true,            // Sichtbarkeitsregel „nur, was jetzt nutzbar ist“ (REQ-K2.04–K2.06): true/false erzwingt, null = nur im Pacing-Modus 'karten'; URL ?entdecken=1|0
    kartenbuehne: true,         // Kartenwahl als Bühne mit Ablauf (REQ-KP.03, K2.01–K2.03): true/false erzwingt, null = nur im Pacing-Modus 'karten'; URL ?buehne=1|0
    hintAutoMs: 8000,           // ein Erstkontakt-Hinweis schließt sich nach so langer Zeit von selbst (REQ-T.05)
    newSeenMs: 1500,            // Markierung „neu“: so lange muss der Inhalt sichtbar sein, bis er als angesehen gilt (REQ-T.05)
    toastMs: 2500,              // kurzer Hinweis über dem Arbeitsbereich (abgeschlossene Forschung, REQ-6.06)           // Kartenwahl: Knöpfe nehmen Klicks erst so lange nach dem automatischen Öffnen an und blenden ein (REQ-6.04)
    debugUnitLogS: 15,          // Debug-Protokoll je Einheit (?debug=1): so viele Sekunden Spielzeit werden vorgehalten
  },

  /* Entdecken (REQ-K2.04 – K2.06) */
  ENTDECKEN: {
    vorschau: 'keine',          // 'keine' oder 'naechste': höchstens ein Platzhalter „?“ je Bereich (REQ-K2.04, Soll); URL ?vorschau=naechste
    einblendenMs: 300,          // neues Element blendet so lange ein (höchstens 300)
    hinweisMs: 8000,            // Erstkontakt-Hinweis zu neuem Inhalt schließt nach so vielen ms (REQ-K2.06)
  },
  /* Kartenbühne (REQ-KP.03, K2.02) */
  KARTENBUEHNE: {
    zeit: 'pause',              // Spielzeit bei offener Bühne: 'pause' (wie v0.6), 'langsam' (Faktor langsamFaktor) oder 'lauf'
    langsamFaktor: 0.2,
    abdunkelung: 0.45,          // Deckkraft des Schleiers über der Spielwelt
    kartenBreitePct: 16,        // Kartenbreite in Prozent der Fensterbreite (14–18), begrenzt durch:
    kartenMinPx: 160, kartenMaxPx: 260,
    zweiZeilenBisPx: 900,       // unter dieser Fensterbreite liegt die Reihe in zwei Zeilen
    austeilMs: 220,             // Karten fliegen aus dem Symbol der Ressourcenleiste an ihren Platz (REQ-K2.02); Erscheinen + Aufdecken ≤ 800 ms
    aufdeckMs: 110,             // eine Karte deckt so lange auf (höchstens 120)
    aufdeckAbstandMs: 100,      // Abstand zwischen zwei Karten (links nach rechts)
    sperreMinMs: 400,           // Eingabesperre: endet mit der letzten aufgedeckten Karte, frühestens so viele ms nach dem Erscheinen
    wirkflugMs: 450,            // die gewählte Karte fliegt zu ihrem Wirkort, die übrigen zurück in den Stapel (Wirkung + Abräumen ≤ 700 ms)
    abraeumenMs: 700,           // Gesamtdauer vom Klick bis zum Ende des Abräumens; die Spielzeit steht bei zeit = pause bis dahin
    leuchtMs: 1600,             // Wirkort leuchtet nach der Wahl so lange auf
    faecherGrad: 6,             // äußerste Karten stehen um so viele Grad schief
    hebenPct: 8,                // überfahrene oder fokussierte Karte hebt sich um so viel
    inhaltSymbole: { bau: '\u2302', einheit: '\u25B2', stufe: '\u21E7', forschung: '\u2697' },   // Symbole für Inhalte auf den Karten (Gebäude, Einheit, Ausbaustufe, Forschung)
    symbole: { wirtschaft: '\u25CE', armee: '\u2694', basis: '\u2616', automatisierung: '\u2699', sonderregel: '\u2605', bonus: '\u25C6', bau: '\u25A3', technologie: '\u2699', wagnis: '\u26A0' },
  },

  /* Tutorial „Erste Schritte“ (REQ-T.01 – T.04): Schritte in data/tutorial-steps.js, Texte in den Sprachdateien */
  TUTORIAL: {
    holdMaxS: 150,              // Schonfrist: die erste Gegnerwelle rückt spätestens nach so vielen Sekunden aus (REQ-T.03)
    firstWaveSize: 2,           // erste Gegnerwelle der Tutorial-Partie: so viele Läufer; drei eigene Läufer halten sie (auf jedem Schwierigkeitsgrad)
    greetMs: 4000,              // jede Sprechblase ohne Auftrag (Begrüßung, Abschied) bleibt mindestens so lange stehen; ein Klick zeigt sofort die nächste (REQ-T2.02)
    leaveMs: 1800,              // Abgang der Figur durch das Tor nach dem Abschied (REQ-T2.05)
    fadeMs: 180,                // Einblenden einer Sprechblase (REQ-T2.07, höchstens 200 ms)
    guideScale: 1.2,            // Darstellungsgröße der Figur gegenüber dem Grundmaß (REQ-T2.06)
    startDelayMs: 900,          // Pause, bevor die Figur die erste Handlung vorführt
    demoMs: 1800,               // Dauer einer Vorführung; erst danach erscheint die Zeile
    farewellMs: 4500,           // so lange steht die Abschiedszeile, dann verschwindet die Figur
    pulseMs: 900,               // Takt des pulsierenden Rahmens
    bubbleGapPx: 10,            // Abstand der Sprechblase zum Ziel
    bubbleMaxPx: 280,
  },

  /* Spielwelt und Kamera (REQ-46) */
  WORLD_WIDTH_FACTOR: 2,        // die Welt ist doppelt so breit wie der Anzeigebereich
  SCROLL_STEP_PX: 80,           // Pfeiltasten und A/D
  CAMERA_FOLLOW_RATE: 3,        // „Front folgen“: Annäherung je Sekunde
  EDGE_MARKER_S: 1.5,           // so lange nach einem Treffer zeigt der Randpfeil einen Abschnitt außerhalb des Bildes
  TARGET_BEHIND_TOLERANCE: 6,
  RANGED_MIN_RANGE: 30,         // ab dieser Reichweite gilt eine Einheit als Fernkämpfer
  GATE_BLOCK_DIST: 20,           // Belagerung: so nah am gegnerischen Tor blockieren eigene Einheiten den Nachschub
  ALARM_SPACING_S: 0.4,
  ALARM_LEVELS: [2 / 3, 1 / 3],
  ALARM_WERFER_EVERY: 3,
  /* Belagerungswelle statt Eskalation (REQ-19): in Minute SIEGE_MINUTE greift eine Welle mit SIEGE_STRENGTH-facher Größe an,
     SIEGE_WARNING_S vorher angekündigt. Danach wächst die Gegnerstärke linear um POST_SIEGE_GROWTH je Minute. */
  SIEGE_MINUTE: 16,
  SIEGE_STRENGTH: 3,
  SIEGE_WARNING_S: 60,
  /* Gestaffelte Einführung (REQ-47): Verstärkungsgebäude ab dieser Stufe; Einstellung „Einführung überspringen“ im Browser */
  INTRO_BUILDINGS_LEVEL: 2,
  INTRO_SKIP_KEY: 'klammerfront.skipIntro',
  POST_SIEGE_GROWTH: 1.1,       // I4.8: 0,6 → 1,1; mit Formationen hielt reine Verteidigung auf Leicht sonst bis Minute 29 (REQ-21.4)
  RELOAD_WAVE_DELAY_S: 5,

  /* Wellen (REQ-14/15): eigene und gegnerische Wellen rücken im selben Takt aus */
  WAVE_INTERVAL_S: 20,
  SUPPLY_CAP_START: 3,          // Versorgungslimit: Höchstzahl an Einheiten pro Welle
  SUPPLY_CAP_MAX: 15,           // harte Obergrenze, auch mit Karten (REQ-44)
  ENEMY_WAVE_MAX: 15,           // reguläre Gegnerwellen wachsen bis zu dieser Größe (REQ-44)

  /* Basis: drei Abschnitte am Ende der Lanes (REQ-13). Mauer oben, Tor, Mauer unten.
     Reparatur je Abschnitt, Kosten in Material. */
  SECTION_HP: [400, 600, 400],
  REPAIR_COST: 60,
  REPAIR_AMOUNT: 100,
  REPAIR_COOLDOWN_S: 5,         // je Abschnitt; ohne Grenze repariert ein reicher Spieler schneller, als der Gegner Schaden macht (Patt)
  TOWER_LANES: [0, 2],          // Turm oben auf der Mauer oben, Turm unten auf der Mauer unten

  /* Einheiten */
  UNITS: {
    laeufer: { key: '1', cost: 12, hp: 30, dmg: 5, cd: 0.8, range: 14,  bounty: 8,  speed: 34 },   // speed: Marschtempo; die Armee geht im Tempo der langsamsten Einheit
    werfer:  { key: '2', cost: 30, hp: 18, dmg: 7, cd: 1.3, range: 105, bounty: 15, speed: 34 },
    // Schildträger (REQ-5.07, Zweig D): viel Lebenspunkte, langsam; bremst die ganze Armee (gewollter Zielkonflikt)
    schild:  { key: '3', cost: 40, hp: 110, dmg: 3, cd: 1.0, range: 14,  bounty: 12, speed: 24, research: 'unlockSchild' },
    /* Einheiten des Kartenpfads (REQ-KP.05): Datensätze ohne neues Verhalten und ohne neue Grafik. farbton = Farbname aus der Palette (Punkt auf der Figur).
       replacement: entsteht nur als Ersatz für base (Einheitenersatz, kein eigener Knopf); Werte und Kosten sind Startwerte. Versorgung: jede Einheit zählt 1. */
    reiter:          { key: '4', cost: 28, hp: 40, dmg: 7, cd: 0.7, range: 14,  bounty: 12, speed: 52, farbton: 'brass' },
    schwertkaempfer: { cost: 16, hp: 42, dmg: 7, cd: 0.8, range: 14,  bounty: 10, speed: 34, replacement: true, base: 'laeufer', farbton: 'brass' },
    armbrust:        { key: '5', cost: 44, hp: 24, dmg: 12, cd: 1.8, range: 140, bounty: 20, speed: 34, farbton: 'rust' },
    katapult:        { key: '6', cost: 70, hp: 40, dmg: 22, cd: 3.0, range: 170, bounty: 28, speed: 24, farbton: 'rust' },
    bogenschuetze:   { cost: 36, hp: 22, dmg: 9, cd: 1.2, range: 120, bounty: 17, speed: 34, replacement: true, base: 'werfer',  farbton: 'brass' },
  },

  /* Bauplätze: 3×3-Raster, alle ab Start offen (REQ-16.1).
     Abriss erstattet REFUND_RATE des tatsächlich gezahlten Preises; Upgrades ruhen und leben beim Neubau wieder auf. */
  GRID_SIZE: 3,
  MAX_PER_TYPE: 1,              // gilt nur für Verstärkungsgebäude; Fabriken sind mehrfach baubar
  REFUND_RATE: 0.5,
  /* Fabriken (REQ-16.2): die n-te Fabrik kostet FACTORY_BASE_COST × FACTORY_COST_GROWTH^(n−1) */
  FACTORY_BASE_RATE: 2.5,       // Material pro Sekunde je Fabrik
  FACTORY_BASE_COST: 30,
  FACTORY_COST_GROWTH: 1.6,
  BUILDING_COST: { schmiede: 200, kaserne: 150, universitaet: 300, kontor: 250 },   // Verstärkungsgebäude, je einmal baubar
  BUILDINGS: ['fabrik', 'schmiede', 'kaserne', 'universitaet', 'kontor'],
  START_BUILDINGS: ['fabrik', 'schmiede', 'kaserne', 'universitaet', 'kontor'],   // I6.8: Handelskontor ohne Karte baubar (REQ-6.07 b)
  // Handelskontor (REQ-6.07 b): alle intervalS Sekunden je volle perN Material im Bestand amount Material, höchstens bis zum Deckel
  // capBase + capPerLevel × Stufe „Kontor-Ausbau“; Nachbarschaft und Karte Handelskontor heben den Deckel prozentual
  KONTOR: { intervalS: 10, perN: 100, amount: 4, capBase: 20, capPerLevel: 20 },
  // Kaserne: Welle vorziehen (REQ-6.07 c): die nächste eigene Welle rückt sofort aus; Kosten cost + perUnit je Einheit, Abklingzeit cdS
  WAVE_RUSH: { cost: 80, perUnit: 12, cdS: 60 },   // I6.8: per Simulation, Wirkung auf Schwer (gierig) +22 pp statt +48 pp bei 40/6/30

  /* Upgrades. group = Gebäude oder Bereich; cur = Währung; max = Höchststufe; needs = Voraussetzung */
  UPGRADES: {
    presse:     { group: 'fertigung',    baseCost: 15,  growth: 2.5,  cur: 'material', max: 2 },     // Klickwert gedeckelt (REQ-03.3)
    /* Schmiede: Qualitätsstufen mit stark steigenden Kosten, Abfluss für überschüssiges Material (REQ-17.3) */
    qualitaet:  { group: 'schmiede',     baseCost: 80,  cur: 'material' },   // Wachstum: SMITHY_COST_GROWTH
    /* Kaserne: das Gebäude ist Ausbaustufe 1, „Ausbau“ hebt auf Stufe 2 und 3 (REQ-17.1) */
    ausbau:     { group: 'kaserne',      baseCost: 250, growth: 2.0,  cur: 'material', max: 5 },   // Stufe 6: 3 + 6 × 2 = 15
    zinseszins: { group: 'kontor',       baseCost: 300, growth: 2.0,  cur: 'material', max: 4 },
    mauer:      { group: 'mauer',        baseCost: 120, growth: 1.6,  cur: 'material' },
    stacheln:   { group: 'mauer',        baseCost: 150, growth: 1.8,  cur: 'material', max: 5 },
    moertel:    { group: 'mauer',        baseCost: 180, growth: 1.9,  cur: 'material', max: 5 },
    /* Türme: Upgrades je Turm getrennt (REQ-13.6). base = gemeinsamer Text, tower = Lane des Turms */
    turm_0:       { group: 'turm_0', base: 'turm',       tower: 0, baseCost: 100, growth: 1.9, cur: 'material' },
    reichweite_0: { group: 'turm_0', base: 'reichweite', tower: 0, baseCost: 160, growth: 1.8, cur: 'material', max: 4, needs: 'turm_0' },
    kadenz_0:     { group: 'turm_0', base: 'kadenz',     tower: 0, baseCost: 200, growth: 1.9, cur: 'material', max: 5, needs: 'turm_0' },
    turm_2:       { group: 'turm_2', base: 'turm',       tower: 2, baseCost: 100, growth: 1.9, cur: 'material' },
    reichweite_2: { group: 'turm_2', base: 'reichweite', tower: 2, baseCost: 160, growth: 1.8, cur: 'material', max: 4, needs: 'turm_2' },
    kadenz_2:     { group: 'turm_2', base: 'kadenz',     tower: 2, baseCost: 200, growth: 1.9, cur: 'material', max: 5, needs: 'turm_2' },
  },
  REVEAL_AT: 0.5,               // Option erscheint, sobald die Hälfte des Preises vorhanden ist

  /* Wirkungen der Upgrades */
  FX_PRESSE: 1,
  SMITHY_COST_GROWTH: 2.5,
  FX_QUALITAET: 0.05,           // Schmiede: Schaden und Lebenspunkte je Qualitätsstufe (I4.8: 0,12 → 0,05, Ausgleich zur höheren Grundstärke)
  KASERNE_SUPPLY_PER_LEVEL: 2,  // Versorgungslimit je Ausbaustufe der Kaserne: 3 → 5 → … → 15
  UNIT_STRENGTH_PER_LEVEL: 0.16,// Grundstärke je Stufe, auch ohne Schmiede (REQ-17.2; I4.8: 0,08 → 0,16, damit Partien ohne Schmiede ≥ 30 % gewinnen)
  FX_MAUER_HP: 150,             // je Abschnitt
  FX_STACHELN_DMG: 4,
  FX_MOERTEL_REGEN: 1,

  /* Türme */
  PLAYER_TURRET: { dmgPerLevel: 5, cd: 1.0, rangePerLevel: 20, cdFactor: 0.87 },
  ENEMY_TURRET:  { cd: 1.2, range: 95 },

  /* EP-Stufen und Draft (REQ-02). Erfahrungspunkte (EP) werden nur gesammelt, nicht ausgegeben.
     Stufe n verlangt XP_BASE × XP_GROWTH^(n−1) EP zusätzlich zur vorigen Stufe (kumulierte Summe). */
  XP_BASE: 47,                  // I4.8: 40 → 47, damit der Median-Abstand der Karten im Frühspiel ≥ 45 s liegt (REQ-48)
  XP_GROWTH: 1.55,              // I5.8: 1,4 → 1,55, Kartenabstand im Frühspiel wieder ≥ 45 s (die Armee sammelt EP schneller)
  DRAFT_OPTIONS_BASE: 2,
  DRAFT_OPTIONS_UNIVERSITY: 3,
  CARD_MAX_TIER: 3,             // Spezialkarten: höchstens Stufe III (REQ-18.2)
  CARD_TIER_WEIGHT_BONUS: 1.5,  // Ziehgewicht der nächsten Stufe steigt je Wahl um diesen Faktor
  CARD_RARITY_WEIGHTS: { common: 70, rare: 25, legendary: 5 },   // Ziehgewicht je Seltenheit (REQ-45)
  CARD_CATEGORIES: ['wirtschaft', 'armee', 'basis', 'automatisierung', 'sonderregel'],
  WALL_REGEN_DELAY_S: 5,        // Maurerkolonne: so lange ohne Treffer, bevor eine Mauer heilt
  DRAFT_INTERVAL_MIN_S: 45,
  DRAFT_INTERVAL_MAX_S: 150,
  GRANT_MIN_RATE: 1,            // Kriegsanleihe: mindestens so viel Material pro Sekunde wird gutgeschrieben
  SIEGE_LANE_FRACTION: 0.5,     // Sappeure: ab dieser Lane-Position steht eine Einheit in der gegnerischen Hälfte

  /* Spielphasen (REQ-03), abgeleitet aus der Stufe */
  PHASE_MID_LEVEL: 2,
  PHASE_LATE_LEVEL: 5,
  RESEARCH_RUSH: { perS: 6, tierStep: 0.5 },   // Forschung beschleunigen: Material je gesparter Sekunde, +50 % je Stufe über der ersten (REQ-6.06)
  PERF_TICK_MAX_MS: 1,          // Leistungsziel (REQ-6.10): Median eines Logik-Takts mit 2 × 60 Einheiten in Node höchstens so lange
  SIM_CLICK_RATE: 6,            // Klicks/s des Mess-Bots für die Klickanteile
  SIM_STYLE_WINDOW_S: 300,
  SIM_RUSH_EVERY_S: 10,         // gierige Heuristik prüft „Welle vorziehen“ höchstens so oft per Vorausschau (REQ-6.07 c)
  SIM_RESEARCH_FORCE_S: 180,    // Paarvergleich der Forschung: Zeitpunkt, zu dem die Forschung in Stufe 1 geschenkt wird (REQ-6.06)      // Anteil der Einheitenkäufe an allen Handlungen in diesem Zeitraum (Strategie-Merkmal, REQ-6.09)
  SIM_SIEGE_LOOKAHEAD_S: 120,   // Bot-Vorausschau reicht bis nach der Belagerungswelle, sobald sie so nah ist (REQ-48)
  SIM_SIEGE_EVAL_S: 40,         // … und so lange über ihr Ausrücken hinaus
  SIM_RESEARCH_EVERY_S: 60,     // nach einer abgelehnten Forschung prüfen Bots erst wieder nach dieser Zeit, danach doppelt so lange …
  SIM_RESEARCH_MAX_WAIT_S: 240, // … bis höchstens so lange (Rechenzeit der Vorausschau)
  SIM_RESEARCH_CANDIDATES: 2,   // gierige Heuristik vergleicht die so vielen günstigsten bezahlbaren Forschungen
  MAX_CLICKS_PER_SECOND: 10,    // darüber hinausgehende Klicks verfallen (Schutz gegen Autoklicker)
  /* Automatische Presse (REQ-44): Anteil der Referenzrate ab Phase Mitte bzw. Spät */
  PRESS_REFERENCE_CPS: 6,
  AUTO_PRESS_MID: 0.5,
  AUTO_PRESS_LATE: 1.0,
  FIRST_FACTORY_FREE: true,

  /* Schwierigkeitsgrade: verändern nur den Gegner. xpMult gleicht aus, dass leichte Stufen weniger Abschüsse liefern,
     damit Stufen und Phasen in allen Schwierigkeitsgraden ähnlich schnell kommen.
     Gegnerwelle: waveBase + waveGrowth × Minute Einheiten (gerundet), Lanes zufällig über den Spielzufall. */
  DIFFICULTY: {
    leicht: { enemyBaseHp: 26000, waveBase: 1,  waveGrowth: 0.45,
              werferFrom: 2,   werferShare: 0.30, hpGrowth: 0.05, dmgGrowth: 0.04, turretDmg: 5, maxField: 18, alarmSize: 4, xpMult: 1.45 },
    normal: { enemyBaseHp: 26000, waveBase: 2,  waveGrowth: 0.7,
              werferFrom: 1.5, werferShare: 0.35, hpGrowth: 0.08, dmgGrowth: 0.06, turretDmg: 6, maxField: 24, alarmSize: 6, xpMult: 1.0 },
    // Anlauf (REQ-6.08): bis Minute rampMin steigt die Grundwelle von startBase auf waveBase; rampMin 0 = aus. Standard aus: Simulation I6.5
    // zeigt einen Zielkonflikt (Anlauf schützt „passiv“ kaum, lässt aber „gelegentlich“ gewinnen); Entscheidung beim PO (STAND, Befund REQ-6.08)
    schwer: { enemyBaseHp: 46000, waveBase: 3.5, waveGrowth: 1.0, startBase: 1, rampMin: 0,
              werferFrom: 1,   werferShare: 0.40, hpGrowth: 0.07, dmgGrowth: 0.07, turretDmg: 7, maxField: 30, alarmSize: 10, xpMult: 1.8 },
  },
  DIFFICULTY_ORDER: ['leicht', 'normal', 'schwer'],
  DEFAULT_DIFFICULTY: 'normal',
};
KF_CONFIG.UPGRADES.qualitaet.growth = KF_CONFIG.SMITHY_COST_GROWTH;

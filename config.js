/* Klammerfront – zentrale Konfiguration.
   Alle Spielwerte stehen hier. Der Spielcode enthält keine eigenen Zahlenwerte für Balancing oder Regeln.
   Texte stehen nicht hier, sondern in i18n/de.js und i18n/en.js. */
const KF_CONFIG = {
  VERSION: '0.4',
  SAVE_KEY: 'klammerfront.save.v4',
  RECORDS_KEY: 'klammerfront.records.v1',
  LANG_KEY: 'klammerfront.lang',
  HINTS_KEY: 'klammerfront.hints.v1',   // gesehene Erstkontakt-Hinweise (REQ-20.3)
  LANGUAGES: ['de', 'en'],
  FALLBACK_LANG: 'en',

  /* Zeit und Ablauf */
  TICK_S: 0.05,                 // 20 Logik-Schritte pro Sekunde
  MAX_FRAME_S: 1,               // längster Frame, der nachgeholt wird
  UI_REFRESH_S: 0.1,
  AUTOSAVE_MS: 5000,
  OFFLINE_MIN_S: 10,
  OFFLINE_HOURS: 8,
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
  RANGED_RANGE_ROWS: 1,         // Fernkämpfer greifen an, solange höchstens so viele eigene Einheiten vor ihnen stehen (REQ-12.4)
  PLAYER_BASE_WIDTH: 60,
  ENEMY_BASE_WIDTH: 44,
  SPAWN_BLOCK_DIST: 12,
  ALLY_GAP: 15,
  MELEE_STOP_DIST: 12,
  TARGET_BEHIND_TOLERANCE: 6,
  RANGED_MIN_RANGE: 30,         // ab dieser Reichweite gilt eine Einheit als Fernkämpfer
  GATE_HOLD_DIST: 20,           // Belagerung: so nah am gegnerischen Tor blockieren eigene Einheiten den Nachschub
  ALARM_SPACING_S: 0.4,
  ALARM_THRESHOLDS: [2 / 3, 1 / 3],
  ALARM_WERFER_EVERY: 3,
  /* Belagerungswelle statt Eskalation (REQ-19): in Minute SIEGE_MINUTE greift eine Welle mit SIEGE_STRENGTH-facher Größe an,
     SIEGE_WARNING_S vorher angekündigt. Danach wächst die Gegnerstärke linear um POST_SIEGE_GROWTH je Minute. */
  SIEGE_MINUTE: 16,
  SIEGE_STRENGTH: 3,
  SIEGE_WARNING_S: 60,
  POST_SIEGE_GROWTH: 0.6,       // Vorgabe 0,10; kalibriert in I7: erst ab 0,5 fällt reine Verteidigung bis Minute 25 (REQ-21.4)
  RELOAD_WAVE_DELAY_S: 5,

  /* Wellen (REQ-14/15): eigene und gegnerische Wellen rücken im selben Takt aus */
  WAVE_INTERVAL_S: 20,
  SUPPLY_CAP_START: 3,          // Versorgungslimit: Höchstzahl an Einheiten pro Welle
  HOLD_DISCOUNT: 0.3,           // „Halten“: Turm, Mauer und Reparatur so viel günstiger

  /* Basis: drei Abschnitte am Ende der Lanes (REQ-13). Mauer oben, Tor, Mauer unten.
     Reparatur je Abschnitt, Kosten in Material. */
  SECTION_HP: [400, 600, 400],
  REPAIR_COST: 60,
  REPAIR_AMOUNT: 100,
  REPAIR_COOLDOWN_S: 5,         // je Abschnitt; ohne Grenze repariert ein reicher Spieler schneller, als der Gegner Schaden macht (Patt)
  TOWER_LANES: [0, 2],          // Turm oben auf der Mauer oben, Turm unten auf der Mauer unten

  /* Einheiten */
  UNITS: {
    laeufer: { key: '1', cost: 12, hp: 30, dmg: 5, cd: 0.8, speed: 38, range: 14,  bounty: 8 },
    werfer:  { key: '2', cost: 30, hp: 18, dmg: 7, cd: 1.3, speed: 30, range: 105, bounty: 15 },
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
  START_BUILDINGS: ['fabrik', 'schmiede', 'kaserne', 'universitaet'],   // Handelskontor nur per Draft (REQ-02)
  KONTOR: { intervalS: 10, rate: 0.01, capSeconds: 30, capMin: 20 },   // Zinsen: alle intervalS Sekunden rate × Bestand, höchstens capSeconds Automatik-Ertrag

  /* Upgrades. group = Gebäude oder Bereich; cur = Währung; max = Höchststufe; needs = Voraussetzung */
  UPGRADES: {
    presse:     { group: 'fertigung',    baseCost: 15,  growth: 2.5,  cur: 'material', max: 2 },     // Klickwert gedeckelt (REQ-03.3)
    /* Schmiede: Qualitätsstufen mit stark steigenden Kosten, Abfluss für überschüssiges Material (REQ-17.3) */
    qualitaet:  { group: 'schmiede',     baseCost: 80,  cur: 'material' },   // Wachstum: SMITHY_COST_GROWTH
    /* Kaserne: das Gebäude ist Ausbaustufe 1, „Ausbau“ hebt auf Stufe 2 und 3 (REQ-17.1) */
    ausbau:     { group: 'kaserne',      baseCost: 250, growth: 2.0,  cur: 'material', max: 2 },
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
  FX_QUALITAET: 0.12,           // Schmiede: Schaden und Lebenspunkte je Qualitätsstufe (Faktor 1,12 je Stufe; I7: vorher 0,25)
  KASERNE_SUPPLY_PER_LEVEL: 2,  // Versorgungslimit je Ausbaustufe der Kaserne: 3 → 5 → 7 → 9
  UNIT_STRENGTH_PER_LEVEL: 0.08,// Grundstärke je Altmetall-Stufe, auch ohne Schmiede (REQ-17.2; Vorgabe 0,05, I7: 0,08, damit Partien ohne Schmiede ≥ 30 % gewinnen)
  FX_ZINSESZINS: 0.005,         // zusätzlicher Zinssatz je Stufe
  FX_MAUER_HP: 150,             // je Abschnitt
  FX_STACHELN_DMG: 4,
  FX_MOERTEL_REGEN: 1,

  /* Türme */
  PLAYER_TURRET: { dmgPerLevel: 5, cd: 1.0, range: 120, rangePerLevel: 20, cdFactor: 0.87 },
  ENEMY_TURRET:  { cd: 1.2, range: 95 },

  /* Altmetall-Stufen und Draft (REQ-02). Altmetall wird nur gesammelt, nicht ausgegeben.
     Stufe n verlangt XP_BASE × XP_GROWTH^(n−1) Altmetall zusätzlich zur vorigen Stufe (kumulierte Summe). */
  XP_BASE: 40,
  XP_GROWTH: 1.4,
  DRAFT_OPTIONS_BASE: 2,
  DRAFT_OPTIONS_UNIVERSITY: 3,
  CARD_MAX_TIER: 3,             // Spezialkarten: höchstens Stufe III (REQ-18.2)
  CARD_TIER_WEIGHT_BONUS: 1.5,  // Ziehgewicht der nächsten Stufe steigt je Wahl um diesen Faktor
  WALL_REGEN_DELAY_S: 5,        // Maurerkolonne: so lange ohne Treffer, bevor eine Mauer heilt
  DRAFT_INTERVAL_MIN_S: 45,
  DRAFT_INTERVAL_MAX_S: 150,
  GRANT_MIN_RATE: 1,            // Kriegsanleihe: mindestens so viel Material pro Sekunde wird gutgeschrieben
  SIEGE_LANE_FRACTION: 0.5,     // Sappeure: ab dieser Lane-Position steht eine Einheit in der gegnerischen Hälfte

  /* Spielphasen (REQ-03), abgeleitet aus der Stufe */
  PHASE_MID_LEVEL: 2,
  PHASE_LATE_LEVEL: 5,
  SIM_CLICK_RATE: 6,            // Klicks/s des Mess-Bots für die Klickanteile
  MAX_CLICKS_PER_SECOND: 10,    // darüber hinausgehende Klicks verfallen (Schutz gegen Autoklicker)

  /* Schwierigkeitsgrade: verändern nur den Gegner. xpMult gleicht aus, dass leichte Stufen weniger Abschüsse liefern,
     damit Stufen und Phasen in allen Schwierigkeitsgraden ähnlich schnell kommen.
     Gegnerwelle: waveBase + waveGrowth × Minute Einheiten (gerundet), Lanes zufällig über den Spielzufall. */
  DIFFICULTY: {
    leicht: { enemyBaseHp: 4800, waveBase: 1,   waveGrowth: 0.3,
              werferFrom: 2,   werferShare: 0.30, hpGrowth: 0.03, dmgGrowth: 0.04, turretDmg: 5, maxField: 18, alarmSize: 4, xpMult: 1.45 },
    normal: { enemyBaseHp: 5000, waveBase: 2,   waveGrowth: 0.6,
              werferFrom: 1.5, werferShare: 0.35, hpGrowth: 0.08, dmgGrowth: 0.06, turretDmg: 6, maxField: 24, alarmSize: 6, xpMult: 1.0 },
    schwer: { enemyBaseHp: 5500, waveBase: 2,   waveGrowth: 0.9,
              werferFrom: 1,   werferShare: 0.40, hpGrowth: 0.07, dmgGrowth: 0.05, turretDmg: 7, maxField: 30, alarmSize: 10, xpMult: 1.15 },
  },
  DIFFICULTY_ORDER: ['leicht', 'normal', 'schwer'],
  DEFAULT_DIFFICULTY: 'normal',
};
KF_CONFIG.UPGRADES.qualitaet.growth = KF_CONFIG.SMITHY_COST_GROWTH;

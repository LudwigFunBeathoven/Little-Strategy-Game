/* Klammerfront – zentrale Konfiguration.
   Alle Spielwerte stehen hier. Der Spielcode enthält keine eigenen Zahlenwerte für Balancing oder Regeln.
   Texte stehen nicht hier, sondern in i18n/de.js und i18n/en.js. */
const KF_CONFIG = {
  VERSION: '0.3',
  SAVE_KEY: 'klammerfront.save.v3',
  RECORDS_KEY: 'klammerfront.records.v1',
  LANG_KEY: 'klammerfront.lang',
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

  /* Schlachtfeld */
  LANE: 1000,
  PLAYER_BASE_WIDTH: 92,
  ENEMY_BASE_WIDTH: 44,
  SPAWN_BLOCK_DIST: 12,
  ALLY_GAP: 15,
  MELEE_STOP_DIST: 12,
  TARGET_BEHIND_TOLERANCE: 6,
  RANGED_MIN_RANGE: 30,         // ab dieser Reichweite gilt eine Einheit als Fernkämpfer
  GATE_HOLD_DIST: 20,           // Belagerung: so nah am gegnerischen Tor blockieren eigene Einheiten den Nachschub
  ENEMY_QUEUE_SPACING_S: 0.7,
  ALARM_SPACING_S: 0.4,
  ALARM_THRESHOLDS: [2 / 3, 1 / 3],
  ALARM_WERFER_EVERY: 3,
  RELOAD_WAVE_DELAY_S: 5,

  /* Basis */
  BASE_HP: 600,
  REPAIR_COST: 25,
  REPAIR_AMOUNT: 100,

  /* Einheiten */
  SPAWN_GAP_S: 0.5,
  QUEUE_MAX: 5,
  UNITS: {
    laeufer: { key: '1', cost: 12, hp: 30, dmg: 5, cd: 0.8, speed: 38, range: 14,  bounty: 8 },
    werfer:  { key: '2', cost: 30, hp: 18, dmg: 7, cd: 1.3, speed: 30, range: 105, bounty: 15 },
  },

  /* Bauplätze (Preis richtet sich nach der Zahl der bereits stehenden Gebäude) */
  BUILDING_SLOTS: 3,
  BUILD_COSTS: [40, 350, 1200],
  BUILDINGS: ['fabrik', 'schmiede', 'universitaet'],

  /* Upgrades. group = Gebäude oder Bereich; cur = Währung; max = Höchststufe; needs = Voraussetzung */
  UPGRADES: {
    fertiger:   { group: 'fertigung',    baseCost: 30,  growth: 1.3,  cur: 'material' },
    presse:     { group: 'fertigung',    baseCost: 15,  growth: 1.6,  cur: 'material' },
    hydraulik:  { group: 'fabrik',       baseCost: 120, growth: 2.0,  cur: 'material', max: 6 },
    takt:       { group: 'fabrik',       baseCost: 150, growth: 1.9,  cur: 'material', max: 10 },
    serie:      { group: 'fabrik',       baseCost: 200, growth: 2.2,  cur: 'material', max: 5 },
    klingen:    { group: 'schmiede',     baseCost: 60,  growth: 1.6,  cur: 'material' },
    ruestung:   { group: 'schmiede',     baseCost: 60,  growth: 1.6,  cur: 'material' },
    drill:      { group: 'schmiede',     baseCost: 150, growth: 2.0,  cur: 'material', max: 5 },
    logistik:   { group: 'universitaet', baseCost: 30,  growth: 1.8,  cur: 'scrap',    max: 5 },
    beute:      { group: 'universitaet', baseCost: 40,  growth: 1.7,  cur: 'scrap',    max: 8 },
    nacht:      { group: 'universitaet', baseCost: 50,  growth: 2.0,  cur: 'scrap',    max: 4 },
    mauer:      { group: 'mauer',        baseCost: 40,  growth: 1.6,  cur: 'scrap' },
    stacheln:   { group: 'mauer',        baseCost: 50,  growth: 1.8,  cur: 'scrap',    max: 5 },
    moertel:    { group: 'mauer',        baseCost: 60,  growth: 1.9,  cur: 'scrap',    max: 5 },
    turm:       { group: 'turm',         baseCost: 40,  growth: 1.9,  cur: 'scrap' },
    reichweite: { group: 'turm',         baseCost: 60,  growth: 1.8,  cur: 'scrap',    max: 4, needs: 'turm' },
    kadenz:     { group: 'turm',         baseCost: 70,  growth: 1.9,  cur: 'scrap',    max: 5, needs: 'turm' },
  },
  REVEAL_AT: 0.5,               // Option erscheint, sobald die Hälfte des Preises vorhanden ist

  /* Wirkungen der Upgrades */
  FX_FERTIGER_RATE: 1.0,
  FX_TAKT: 0.25,
  FX_SERIE: 0.10,
  FX_PRESSE: 1,
  FX_HYDRAULIK: 0.25,
  FX_KLINGEN: 1.2,
  FX_RUESTUNG: 1.2,
  FX_DRILL: 0.9,
  FX_LOGISTIK: 0.08,
  FX_BEUTE: 0.2,
  FX_NACHT_HOURS: 4,
  FX_MAUER_HP: 150,
  FX_STACHELN_DMG: 4,
  FX_MOERTEL_REGEN: 1,

  /* Türme */
  PLAYER_TURRET: { dmgPerLevel: 5, cd: 1.0, range: 120, rangePerLevel: 20, cdFactor: 0.87 },
  ENEMY_TURRET:  { cd: 1.2, range: 95 },

  /* Zeitalter (wird in REQ-02 durch Stufen ersetzt) */
  ERA2_AT: 500,

  /* Schwierigkeitsgrade: verändern nur den Gegner */
  DIFFICULTY: {
    leicht: { enemyBaseHp: 1100, firstWave: 15, intervalStart: 11, intervalMin: 5,   intervalDrop: 0.5, waveEvery: 6,
              werferFrom: 2,   werferShare: 0.30, hpGrowth: 0.03, dmgGrowth: 0.04, turretDmg: 5, maxField: 18, alarmSize: 4 },
    normal: { enemyBaseHp: 2200, firstWave: 12, intervalStart: 10, intervalMin: 4,   intervalDrop: 0.6, waveEvery: 5,
              werferFrom: 1.5, werferShare: 0.35, hpGrowth: 0.08, dmgGrowth: 0.06, turretDmg: 6, maxField: 24, alarmSize: 6 },
    schwer: { enemyBaseHp: 2800, firstWave: 10, intervalStart: 9,  intervalMin: 3,   intervalDrop: 0.8, waveEvery: 4,
              werferFrom: 1,   werferShare: 0.40, hpGrowth: 0.14, dmgGrowth: 0.10, turretDmg: 7, maxField: 30, alarmSize: 10 },
  },
  DIFFICULTY_ORDER: ['leicht', 'normal', 'schwer'],
  DEFAULT_DIFFICULTY: 'normal',
};

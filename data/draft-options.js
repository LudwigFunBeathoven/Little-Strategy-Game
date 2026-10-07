/* Klammerfront – Spezialkarten (REQ-45, vorher REQ-18).
   Neue Karten werden hier ergänzt, ohne das Kartensystem zu ändern.
   Felder:
     id         eindeutige Kennung
     category   'wirtschaft' | 'armee' | 'basis' | 'automatisierung' | 'sonderregel'
     rarity     'common' | 'rare' | 'legendary'; Ziehgewicht aus CARD_RARITY_WEIGHTS. Legendäre Karten sind einmalig,
                ändern eine Spielregel und haben einen spürbaren Nachteil; höchstens eine je Angebot.
     nameKey    Schlüssel für den Namen in i18n/*.js; die Oberfläche hängt die Stufe als römische Zahl an
     descKey    Schlüssel für die Beschreibung; {e1} = Wert der Wirkung, {d1} = Wert des Nachteils, {syn} = Synergie je Karte
     tiers      Stufen I bis höchstens CARD_MAX_TIER: [{ effect, drawback? }]. Werte je Stufe absolut, nicht addiert.
                effect/drawback: Liste von { stat, mul } | { stat, add } | { unlock } | { grant, seconds }
     synergy    optional: { stat, perCard } – Wirkung × (1 + perCard × Zahl gewählter Karten der eigenen Kategorie, sie selbst eingeschlossen)
     condition  optional: wann die Wirkung greift ({ type, value })
     requires   optional: Voraussetzung für das Angebot ({ upgrade } | { building })
   Werte sind Vorgaben, Kalibrierung in I4.8. */
const KF_DRAFT_OPTIONS = [
  /* ---------- Wirtschaft ---------- */
  { id: 'bessereFabriken', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.bessereFabriken.name', descKey: 'draft.bessereFabriken.desc',
    tiers: [{ effect: [{ stat: 'factoryYield', mul: 1.25 }] }, { effect: [{ stat: 'factoryYield', mul: 1.6 }] }, { effect: [{ stat: 'factoryYield', mul: 2.2 }] }] },
  { id: 'schwerePressen', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.schwerePressen.name', descKey: 'draft.schwerePressen.desc',
    tiers: [{ effect: [{ stat: 'autoProd', mul: 1.4 }],  drawback: [{ stat: 'wallHp', mul: 0.85 }] },
            { effect: [{ stat: 'autoProd', mul: 1.75 }], drawback: [{ stat: 'wallHp', mul: 0.7 }] },
            { effect: [{ stat: 'autoProd', mul: 2.2 }],  drawback: [{ stat: 'wallHp', mul: 0.55 }] }] },
  { id: 'serienbau', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.serienbau.name', descKey: 'draft.serienbau.desc',
    tiers: [{ effect: [{ stat: 'factoryCost', mul: 0.85 }] }, { effect: [{ stat: 'factoryCost', mul: 0.7 }] }] },
  { id: 'doppelschicht', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.doppelschicht.name', descKey: 'draft.doppelschicht.desc',
    tiers: [{ effect: [{ stat: 'autoProd', mul: 1.25 }], drawback: [{ stat: 'clickYield', mul: 0.5 }] },
            { effect: [{ stat: 'autoProd', mul: 1.5 }],  drawback: [{ stat: 'clickYield', mul: 0.25 }] }] },
  { id: 'nachtschicht', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.nachtschicht.name', descKey: 'draft.nachtschicht.desc',
    tiers: [{ effect: [{ stat: 'lateYield', mul: 1.25 }] }, { effect: [{ stat: 'lateYield', mul: 1.5 }] }] },   // I6.3: Online-Wirkung ersetzt die frühere Wirkung außerhalb der Partie
  { id: 'kriegserfahrung', category: 'wirtschaft', rarity: 'common', nameKey: 'draft.kriegserfahrung.name', descKey: 'draft.kriegserfahrung.desc',
    tiers: [{ effect: [{ stat: 'xpGain', mul: 1.3 }] }, { effect: [{ stat: 'xpGain', mul: 1.6 }] }] },
  { id: 'kriegsanleihe', category: 'wirtschaft', rarity: 'rare', nameKey: 'draft.kriegsanleihe.name', descKey: 'draft.kriegsanleihe.desc',
    tiers: [{ effect: [{ grant: 'production', seconds: 60 }],  drawback: [{ stat: 'enemyHp', mul: 1.08 }] },
            { effect: [{ grant: 'production', seconds: 90 }],  drawback: [{ stat: 'enemyHp', mul: 1.16 }] },
            { effect: [{ grant: 'production', seconds: 120 }], drawback: [{ stat: 'enemyHp', mul: 1.25 }] }] },
  { id: 'handelskontor', category: 'wirtschaft', rarity: 'rare', nameKey: 'draft.handelskontor.name', descKey: 'draft.handelskontor.desc',
    requires: { building: 'kontor' }, tiers: [{ effect: [{ stat: 'kontorCap', mul: 1.5 }] }] },   // I6.8: Kontor ist Startgebäude; Karte hebt den Zinsdeckel
  { id: 'grossauftrag', category: 'wirtschaft', rarity: 'rare', nameKey: 'draft.grossauftrag.name', descKey: 'draft.grossauftrag.desc',
    synergy: { stat: 'factoryYield', perCard: 0.06 }, tiers: [{ effect: [] }] },

  /* ---------- Armee ---------- */
  { id: 'aushebung', category: 'armee', rarity: 'common', nameKey: 'draft.aushebung.name', descKey: 'draft.aushebung.desc',
    tiers: [{ effect: [{ stat: 'supply', add: 1 }], drawback: [{ stat: 'unitHp', mul: 0.9 }] },
            { effect: [{ stat: 'supply', add: 2 }], drawback: [{ stat: 'unitHp', mul: 0.8 }] }] },
  { id: 'kriegstrommeln', category: 'armee', rarity: 'common', nameKey: 'draft.kriegstrommeln.name', descKey: 'draft.kriegstrommeln.desc',
    condition: { type: 'formationSize', value: 5 },
    tiers: [{ effect: [{ stat: 'drumsDmg', mul: 1.15 }] }, { effect: [{ stat: 'drumsDmg', mul: 1.25 }] }, { effect: [{ stat: 'drumsDmg', mul: 1.4 }] }] },
  { id: 'schildwall', category: 'armee', rarity: 'common', nameKey: 'draft.schildwall.name', descKey: 'draft.schildwall.desc',
    condition: { type: 'fullMeleeRow' },
    tiers: [{ effect: [{ stat: 'shieldHp', mul: 1.2 }] }, { effect: [{ stat: 'shieldHp', mul: 1.35 }] }] },
  { id: 'drill', category: 'armee', rarity: 'common', nameKey: 'draft.drill.name', descKey: 'draft.drill.desc',
    tiers: [{ effect: [{ stat: 'attackCd', mul: 0.9 }] }, { effect: [{ stat: 'attackCd', mul: 0.8 }] }] },
  { id: 'belagerungsgeraet', category: 'armee', rarity: 'common', nameKey: 'draft.belagerungsgeraet.name', descKey: 'draft.belagerungsgeraet.desc',
    tiers: [{ effect: [{ stat: 'dmgVsBase', mul: 1.6 }], drawback: [{ stat: 'dmgVsUnits', mul: 0.8 }] },
            { effect: [{ stat: 'dmgVsBase', mul: 2.2 }], drawback: [{ stat: 'dmgVsUnits', mul: 0.65 }] }] },
  { id: 'langeWurfarme', category: 'armee', rarity: 'common', nameKey: 'draft.langeWurfarme.name', descKey: 'draft.langeWurfarme.desc', requires: { unit: 'werfer' },
    tiers: [{ effect: [{ stat: 'werferRange', add: 25 }], drawback: [{ stat: 'werferHp', mul: 0.85 }] },
            { effect: [{ stat: 'werferRange', add: 50 }], drawback: [{ stat: 'werferHp', mul: 0.7 }] }] },
  { id: 'vorposten', category: 'armee', rarity: 'common', nameKey: 'draft.vorposten.name', descKey: 'draft.vorposten.desc',
    tiers: [{ effect: [{ stat: 'spawnOffset', add: 150 }], drawback: [{ stat: 'wallHp', mul: 0.85 }] }] },
  { id: 'weitschuss', category: 'armee', rarity: 'rare', nameKey: 'draft.weitschuss.name', descKey: 'draft.weitschuss.desc',
    tiers: [{ effect: [{ stat: 'rangedDmg', mul: 1.2 }] }] },
  { id: 'sappeure', category: 'armee', rarity: 'rare', nameKey: 'draft.sappeure.name', descKey: 'draft.sappeure.desc',
    condition: { type: 'enemyHalf' }, tiers: [{ effect: [{ stat: 'siegeDps', add: 2 }] }, { effect: [{ stat: 'siegeDps', add: 5 }] }] },
  { id: 'veteranen', category: 'armee', rarity: 'rare', nameKey: 'draft.veteranen.name', descKey: 'draft.veteranen.desc',
    synergy: { stat: 'unitStrength', perCard: 0.04 }, tiers: [{ effect: [] }] },
  { id: 'taktiker', category: 'armee', rarity: 'rare', nameKey: 'draft.taktiker.name', descKey: 'draft.taktiker.desc',
    synergy: { stat: 'dmgVsBase', perCard: 0.05 }, tiers: [{ effect: [] }] },

  /* ---------- Basis ---------- */
  { id: 'maurerkolonne', category: 'basis', rarity: 'common', nameKey: 'draft.maurerkolonne.name', descKey: 'draft.maurerkolonne.desc',
    condition: { type: 'notHitFor' },
    tiers: [{ effect: [{ stat: 'wallRegenPct', add: 0.5 }] }, { effect: [{ stat: 'wallRegenPct', add: 1 }] }, { effect: [{ stat: 'wallRegenPct', add: 2 }] }] },
  { id: 'turmkanoniere', category: 'basis', rarity: 'common', nameKey: 'draft.turmkanoniere.name', descKey: 'draft.turmkanoniere.desc',
    requires: { upgrade: 'turm' },
    tiers: [{ effect: [{ stat: 'turretDmg', mul: 1.4 }] }, { effect: [{ stat: 'turretDmg', mul: 1.8 }] }, { effect: [{ stat: 'turretDmg', mul: 2.5 }] }] },
  { id: 'bastion', category: 'basis', rarity: 'common', nameKey: 'draft.bastion.name', descKey: 'draft.bastion.desc',
    requires: { upgrade: 'turm' },
    tiers: [{ effect: [{ stat: 'towerRange', mul: 1.25 }] }, { effect: [{ stat: 'towerRange', mul: 1.5 }] }] },
  { id: 'zinnen', category: 'basis', rarity: 'common', nameKey: 'draft.zinnen.name', descKey: 'draft.zinnen.desc',
    tiers: [{ effect: [{ stat: 'wallHp', mul: 1.15 }] }, { effect: [{ stat: 'wallHp', mul: 1.3 }] }] },
  { id: 'notreserve', category: 'basis', rarity: 'rare', nameKey: 'draft.notreserve.name', descKey: 'draft.notreserve.desc',
    condition: { type: 'gateBelow', value: 0.25 }, tiers: [{ effect: [{ stat: 'emergencyRepair', add: 1 }] }] },
  { id: 'scharfschuetzen', category: 'basis', rarity: 'rare', nameKey: 'draft.scharfschuetzen.name', descKey: 'draft.scharfschuetzen.desc',
    condition: { type: 'vsRanged' }, requires: { upgrade: 'turm' }, tiers: [{ effect: [{ stat: 'turretVsRanged', mul: 2 }] }] },
  { id: 'festungsbau', category: 'basis', rarity: 'rare', nameKey: 'draft.festungsbau.name', descKey: 'draft.festungsbau.desc',
    synergy: { stat: 'wallHp', perCard: 0.05 }, tiers: [{ effect: [] }] },

  /* ---------- Automatisierung ---------- */
  { id: 'instandhaltung', category: 'automatisierung', rarity: 'common', nameKey: 'draft.instandhaltung.name', descKey: 'draft.instandhaltung.desc',
    condition: { type: 'sectionBelow', value: 0.5 },
    tiers: [{ effect: [{ stat: 'autoRepairCost', add: 0.8 }] }, { effect: [{ stat: 'autoRepairCost', add: 0.65 }] }, { effect: [{ stat: 'autoRepairCost', add: 0.5 }] }] },
  { id: 'fliessband', category: 'automatisierung', rarity: 'common', nameKey: 'draft.fliessband.name', descKey: 'draft.fliessband.desc',
    tiers: [{ effect: [{ stat: 'autoPress', mul: 1.25 }, { stat: 'autoPressEarly', add: 0.25 }] },
            { effect: [{ stat: 'autoPress', mul: 1.5 }, { stat: 'autoPressEarly', add: 0.25 }] }] },
  { id: 'dauerauftrag', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.dauerauftrag.name', descKey: 'draft.dauerauftrag.desc',
    tiers: [{ effect: [{ stat: 'standingOrder', add: 1 }] }] },
  { id: 'werkmeister', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.werkmeister.name', descKey: 'draft.werkmeister.desc',
    requires: { building: 'schmiede' }, tiers: [{ effect: [{ stat: 'autoSmith', add: 2 }] }] },
  { id: 'bauleitung', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.bauleitung.name', descKey: 'draft.bauleitung.desc',
    tiers: [{ effect: [{ stat: 'autoFactory', add: 2 }] }] },
  { id: 'zeugmeister', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.zeugmeister.name', descKey: 'draft.zeugmeister.desc',
    requires: { upgrade: 'turm' }, tiers: [{ effect: [{ stat: 'autoTower', add: 3 }] }] },
  { id: 'rationalisierung', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.rationalisierung.name', descKey: 'draft.rationalisierung.desc',
    synergy: { stat: 'factoryYield', perCard: 0.05 }, tiers: [{ effect: [] }] },
  { id: 'selbstlaeufer', category: 'automatisierung', rarity: 'rare', nameKey: 'draft.selbstlaeufer.name', descKey: 'draft.selbstlaeufer.desc',
    synergy: { stat: 'autoPress', perCard: 0.10 }, tiers: [{ effect: [] }] },

  /* ---------- Sonderregel ---------- */
  { id: 'grosseArmee', category: 'sonderregel', rarity: 'legendary', nameKey: 'draft.grosseArmee.name', descKey: 'draft.grosseArmee.desc',
    tiers: [{ effect: [{ stat: 'supplyMult', mul: 2 }], drawback: [{ stat: 'ownWaveInterval', mul: 2 }] }] },
  { id: 'allesAufDieMitte', category: 'sonderregel', rarity: 'legendary', nameKey: 'draft.allesAufDieMitte.name', descKey: 'draft.allesAufDieMitte.desc',
    tiers: [{ effect: [{ stat: 'allMid', add: 1 }, { stat: 'unitStrength', mul: 1.4 }], drawback: [{ stat: 'wallHp', mul: 0.7 }] }] },
  { id: 'blitzkrieg', category: 'sonderregel', rarity: 'legendary', nameKey: 'draft.blitzkrieg.name', descKey: 'draft.blitzkrieg.desc',
    tiers: [{ effect: [{ stat: 'ownWaveInterval', mul: 0.6 }], drawback: [{ stat: 'unitHp', mul: 0.75 }] }] },
  { id: 'soeldnerheer', category: 'sonderregel', rarity: 'legendary', nameKey: 'draft.soeldnerheer.name', descKey: 'draft.soeldnerheer.desc',
    tiers: [{ effect: [{ stat: 'unitCost', mul: 0 }], drawback: [{ stat: 'autoProd', mul: 0.6 }] }] },
  { id: 'verbrannteErde', category: 'sonderregel', rarity: 'legendary', nameKey: 'draft.verbrannteErde.name', descKey: 'draft.verbrannteErde.desc',
    tiers: [{ effect: [{ stat: 'scorchedEarth', add: 300 }], drawback: [{ stat: 'repairCost', mul: 2 }] }] },
  { id: 'gluecksritter', category: 'sonderregel', rarity: 'rare', nameKey: 'draft.gluecksritter.name', descKey: 'draft.gluecksritter.desc',
    tiers: [{ effect: [{ stat: 'draftSize', add: 1 }], drawback: [{ stat: 'xpNeed', mul: 1.15 }] }] },
];

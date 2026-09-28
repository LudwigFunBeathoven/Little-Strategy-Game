/* Klammerfront – Spezialkarten (REQ-18, bisher Draft-Optionen REQ-02.7).
   Neue Karten werden hier ergänzt, ohne das Kartensystem zu ändern.
   Felder:
     id         eindeutige Kennung
     category   'upgrade' (Verstärkung) oder 'building' (Gebäude-Freischaltung)
     nameKey    Schlüssel für den Namen in i18n/*.js; die Oberfläche hängt die Stufe als römische Zahl an
     descKey    Schlüssel für die Beschreibung (höchstens drei Zeilen); {e1} = Wert der Wirkung, {d1} = Wert des Nachteils
     tiers      Stufen I bis höchstens CARD_MAX_TIER: [{ effect, drawback? }]. Werte je Stufe absolut, nicht addiert.
                Stufe n+1 erscheint erst nach Wahl von Stufe n und ersetzt sie im Pool (REQ-18.2).
                effect/drawback: Liste von { stat, mul } | { stat, add } | { unlock } | { grant, seconds }
     condition  optional: wann die Wirkung greift ({ type, value })
     weight     relative Ziehungswahrscheinlichkeit; nach jeder Wahl × CARD_TIER_WEIGHT_BONUS
     requires   optional: Voraussetzung für das Angebot ({ upgrade } | { building })
   Bekannte stats: autoProd, factoryYield, factoryCost, offlineHours, supply, rangedRows, clickYield, wallHp, wallRegenPct,
                   unitCost, unitHp, werferHp, werferRange, dmgVsBase, dmgVsUnits, turretDmg, turretVsRanged, scrapGain,
                   siegeDps, spawnOffset, emergencyRepair, enemyHp
   Werte sind Vorgaben aus Iteration 3 (REQ-18.6), Kalibrierung in I7. */
const KF_DRAFT_OPTIONS = [
  /* Pool aus REQ-18.6 */
  { id: 'bessereFabriken', category: 'upgrade', nameKey: 'draft.bessereFabriken.name', descKey: 'draft.bessereFabriken.desc', weight: 10,
    tiers: [{ effect: [{ stat: 'factoryYield', mul: 1.25 }] },
            { effect: [{ stat: 'factoryYield', mul: 1.6 }] },
            { effect: [{ stat: 'factoryYield', mul: 2.2 }] }] },
  { id: 'schwerePressen', category: 'upgrade', nameKey: 'draft.schwerePressen.name', descKey: 'draft.schwerePressen.desc', weight: 10,
    tiers: [{ effect: [{ stat: 'autoProd', mul: 1.4 }],  drawback: [{ stat: 'wallHp', mul: 0.85 }] },
            { effect: [{ stat: 'autoProd', mul: 1.75 }], drawback: [{ stat: 'wallHp', mul: 0.7 }] },
            { effect: [{ stat: 'autoProd', mul: 2.2 }],  drawback: [{ stat: 'wallHp', mul: 0.55 }] }] },
  { id: 'maurerkolonne', category: 'upgrade', nameKey: 'draft.maurerkolonne.name', descKey: 'draft.maurerkolonne.desc', weight: 8,
    condition: { type: 'notHitFor' },
    tiers: [{ effect: [{ stat: 'wallRegenPct', add: 0.5 }] },
            { effect: [{ stat: 'wallRegenPct', add: 1 }] },
            { effect: [{ stat: 'wallRegenPct', add: 2 }] }] },
  { id: 'notreserve', category: 'upgrade', nameKey: 'draft.notreserve.name', descKey: 'draft.notreserve.desc', weight: 8,
    condition: { type: 'gateBelow', value: 0.25 },
    tiers: [{ effect: [{ stat: 'emergencyRepair', add: 1 }] }] },
  { id: 'aushebung', category: 'upgrade', nameKey: 'draft.aushebung.name', descKey: 'draft.aushebung.desc', weight: 10,
    tiers: [{ effect: [{ stat: 'supply', add: 1 }], drawback: [{ stat: 'unitHp', mul: 0.9 }] },
            { effect: [{ stat: 'supply', add: 2 }], drawback: [{ stat: 'unitHp', mul: 0.8 }] }] },
  { id: 'weitschuss', category: 'upgrade', nameKey: 'draft.weitschuss.name', descKey: 'draft.weitschuss.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'rangedRows', add: 1 }] }] },
  { id: 'turmkanoniere', category: 'upgrade', nameKey: 'draft.turmkanoniere.name', descKey: 'draft.turmkanoniere.desc', weight: 8,
    requires: { upgrade: 'turm' },
    tiers: [{ effect: [{ stat: 'turretDmg', mul: 1.4 }] },
            { effect: [{ stat: 'turretDmg', mul: 1.8 }] },
            { effect: [{ stat: 'turretDmg', mul: 2.5 }] }] },
  { id: 'handelskontor', category: 'building', nameKey: 'draft.handelskontor.name', descKey: 'draft.handelskontor.desc', weight: 10,
    requires: { building: 'fabrik' },
    tiers: [{ effect: [{ unlock: 'kontor' }] }] },

  /* Übrige Karten aus Iteration 2 und I3, Stufen nach Vorschlag (docs/STAND.md) */
  { id: 'scharfschuetzen', category: 'upgrade', nameKey: 'draft.scharfschuetzen.name', descKey: 'draft.scharfschuetzen.desc', weight: 8,
    condition: { type: 'vsRanged' }, requires: { upgrade: 'turm' },
    tiers: [{ effect: [{ stat: 'turretVsRanged', mul: 2 }] }] },
  { id: 'schrottsammler', category: 'upgrade', nameKey: 'draft.schrottsammler.name', descKey: 'draft.schrottsammler.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'scrapGain', mul: 1.3 }] },
            { effect: [{ stat: 'scrapGain', mul: 1.6 }] }] },
  { id: 'belagerungsgeraet', category: 'upgrade', nameKey: 'draft.belagerungsgeraet.name', descKey: 'draft.belagerungsgeraet.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'dmgVsBase', mul: 1.6 }], drawback: [{ stat: 'dmgVsUnits', mul: 0.8 }] },
            { effect: [{ stat: 'dmgVsBase', mul: 2.2 }], drawback: [{ stat: 'dmgVsUnits', mul: 0.65 }] }] },
  { id: 'sappeure', category: 'upgrade', nameKey: 'draft.sappeure.name', descKey: 'draft.sappeure.desc', weight: 7,
    condition: { type: 'enemyHalf' },
    tiers: [{ effect: [{ stat: 'siegeDps', add: 2 }] },
            { effect: [{ stat: 'siegeDps', add: 5 }] }] },
  { id: 'vorposten', category: 'upgrade', nameKey: 'draft.vorposten.name', descKey: 'draft.vorposten.desc', weight: 7,
    tiers: [{ effect: [{ stat: 'spawnOffset', add: 150 }], drawback: [{ stat: 'wallHp', mul: 0.85 }] }] },
  { id: 'langeWurfarme', category: 'upgrade', nameKey: 'draft.langeWurfarme.name', descKey: 'draft.langeWurfarme.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'werferRange', add: 25 }], drawback: [{ stat: 'werferHp', mul: 0.85 }] },
            { effect: [{ stat: 'werferRange', add: 50 }], drawback: [{ stat: 'werferHp', mul: 0.7 }] }] },
  { id: 'doppelschicht', category: 'upgrade', nameKey: 'draft.doppelschicht.name', descKey: 'draft.doppelschicht.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'autoProd', mul: 1.25 }], drawback: [{ stat: 'clickYield', mul: 0.5 }] },
            { effect: [{ stat: 'autoProd', mul: 1.5 }],  drawback: [{ stat: 'clickYield', mul: 0.25 }] }] },
  { id: 'kriegsanleihe', category: 'upgrade', nameKey: 'draft.kriegsanleihe.name', descKey: 'draft.kriegsanleihe.desc', weight: 7,
    tiers: [{ effect: [{ grant: 'production', seconds: 60 }],  drawback: [{ stat: 'enemyHp', mul: 1.08 }] },
            { effect: [{ grant: 'production', seconds: 90 }],  drawback: [{ stat: 'enemyHp', mul: 1.16 }] },
            { effect: [{ grant: 'production', seconds: 120 }], drawback: [{ stat: 'enemyHp', mul: 1.25 }] }] },
  { id: 'serienbau', category: 'upgrade', nameKey: 'draft.serienbau.name', descKey: 'draft.serienbau.desc', weight: 8,
    tiers: [{ effect: [{ stat: 'factoryCost', mul: 0.85 }] },
            { effect: [{ stat: 'factoryCost', mul: 0.7 }] }] },
  { id: 'nachtschicht', category: 'upgrade', nameKey: 'draft.nachtschicht.name', descKey: 'draft.nachtschicht.desc', weight: 5,
    tiers: [{ effect: [{ stat: 'offlineHours', add: 4 }] },
            { effect: [{ stat: 'offlineHours', add: 8 }] }] },
];

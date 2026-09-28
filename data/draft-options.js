/* Klammerfront – Draft-Optionen (REQ-02.7).
   Neue Optionen werden hier ergänzt, ohne das Draft-System zu ändern.
   Felder:
     id         eindeutige Kennung
     category   'upgrade' (starke Verstärkung) oder 'building' (Gebäude-Freischaltung)
     nameKey    Schlüssel für den Namen in i18n/*.js
     descKey    Schlüssel für die Beschreibung (höchstens drei Zeilen)
     effect     Liste von Wirkungen: { stat, mul } | { stat, add } | { unlock } | { grant, seconds }
     condition  optional: wann die Wirkung greift ({ type, value })
     drawback   optional: Liste von Nachteilen im selben Format wie effect
     weight     relative Ziehungswahrscheinlichkeit
     unique     true = einmalig; sonst maxStacks = Obergrenze für Mehrfachwahl
     requires   optional: Voraussetzung für das Angebot ({ upgrade } | { building })
   Bekannte stats: autoProd, clickYield, wallHp, unitCost, unitHp, werferHp, werferRange, dmgVsBase, dmgVsUnits,
                   turretVsRanged, scrapGain, siegeDps, spawnOffset, emergencyRepair, enemyHp */
const KF_DRAFT_OPTIONS = [
  { id: 'schwerePressen', category: 'upgrade', nameKey: 'draft.schwerePressen.name', descKey: 'draft.schwerePressen.desc',
    effect: [{ stat: 'autoProd', mul: 1.35 }], drawback: [{ stat: 'wallHp', mul: 0.75 }], weight: 10, maxStacks: 2 },
  { id: 'akkordlohn', category: 'upgrade', nameKey: 'draft.akkordlohn.name', descKey: 'draft.akkordlohn.desc',
    effect: [{ stat: 'unitCost', mul: 0.7 }], drawback: [{ stat: 'unitHp', mul: 0.85 }], weight: 10, maxStacks: 2 },
  { id: 'scharfschuetzen', category: 'upgrade', nameKey: 'draft.scharfschuetzen.name', descKey: 'draft.scharfschuetzen.desc',
    effect: [{ stat: 'turretVsRanged', mul: 2 }], condition: { type: 'vsRanged' }, weight: 8, unique: true,
    requires: { upgrade: 'turm' } },
  { id: 'notreserve', category: 'upgrade', nameKey: 'draft.notreserve.name', descKey: 'draft.notreserve.desc',
    effect: [{ stat: 'emergencyRepair', add: 1 }], condition: { type: 'wallBelow', value: 0.25 }, weight: 8, unique: true },
  { id: 'handelskontor', category: 'building', nameKey: 'draft.handelskontor.name', descKey: 'draft.handelskontor.desc',
    effect: [{ unlock: 'kontor' }], weight: 10, unique: true },
  { id: 'schrottsammler', category: 'upgrade', nameKey: 'draft.schrottsammler.name', descKey: 'draft.schrottsammler.desc',
    effect: [{ stat: 'scrapGain', mul: 1.3 }], weight: 8, maxStacks: 2 },
  { id: 'belagerungsgeraet', category: 'upgrade', nameKey: 'draft.belagerungsgeraet.name', descKey: 'draft.belagerungsgeraet.desc',
    effect: [{ stat: 'dmgVsBase', mul: 1.6 }], drawback: [{ stat: 'dmgVsUnits', mul: 0.8 }], weight: 8, maxStacks: 2 },
  { id: 'sappeure', category: 'upgrade', nameKey: 'draft.sappeure.name', descKey: 'draft.sappeure.desc',
    effect: [{ stat: 'siegeDps', add: 2.5 }], condition: { type: 'enemyHalf' }, weight: 7, unique: true },
  { id: 'vorposten', category: 'upgrade', nameKey: 'draft.vorposten.name', descKey: 'draft.vorposten.desc',
    effect: [{ stat: 'spawnOffset', add: 150 }], drawback: [{ stat: 'wallHp', mul: 0.85 }], weight: 7, unique: true },
  { id: 'langeWurfarme', category: 'upgrade', nameKey: 'draft.langeWurfarme.name', descKey: 'draft.langeWurfarme.desc',
    effect: [{ stat: 'werferRange', add: 25 }], drawback: [{ stat: 'werferHp', mul: 0.85 }], weight: 8, maxStacks: 2 },
  { id: 'doppelschicht', category: 'upgrade', nameKey: 'draft.doppelschicht.name', descKey: 'draft.doppelschicht.desc',
    effect: [{ stat: 'autoProd', mul: 1.4 }], drawback: [{ stat: 'clickYield', mul: 0.5 }], weight: 8, maxStacks: 2 },
  { id: 'kriegsanleihe', category: 'upgrade', nameKey: 'draft.kriegsanleihe.name', descKey: 'draft.kriegsanleihe.desc',
    effect: [{ grant: 'production', seconds: 90 }], drawback: [{ stat: 'enemyHp', mul: 1.05 }], weight: 7, maxStacks: 3 },
];

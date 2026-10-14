/* Klammerfront – Doktrinen (Branch exp/kartenpfad, Teil 5, REQ-K5.07), deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' gibt es keine Doktrinen.
   Eine Doktrin ist eine starke Karte mit drei Teilen: einem Effekt (Regeländerung oder mindestens +30 %), einem Sonderbau oder einer Fähigkeit, die nur sie freischaltet,
   und einer bindenden Einschränkung, die einen anderen Weg verengt. Höchstens C.DOKTRIN.max Doktrinen je Partie; sie ersetzen die Schlüsselkarten aus Teil 4.
   Felder:
     id, linie      Kennung; Linie ('militaer' | 'wirtschaft' | 'verteidigung'). Die Doktrin trägt C.DOKTRIN.zeichen (drei) Zeichen dieser Linie.
     sonderbau      Kennung der Variante (data/linien.js, Feld sonderbau), die nur mit dieser Doktrin aufgewertet werden kann; null: kein Sonderbau.
                    Die Wirkung des Sonderbaus steht an der Variante (sie gilt, solange er fertig steht: ein Invest).
     effect         Wirkung mit der Wahl der Doktrin (stat, mul | add) wie bei den Karten; bei Doktrinen mit Sonderbau meist leer.
     drawback       bindende Einschränkung als Wirkung (stat, mul | add); gilt mit der Wahl und bis zum Ende der Partie.
     grenze         bindende Einschränkung als Regel: { max: n, typen: [Gebäudetypen] } – höchstens n Plätze mit diesen Typen; die Aktion „Bauen“ ist sonst gesperrt, mit Erklärzeile.
     wirkt          Angebotsbedingung wie bei den Bonuskarten (data/draft-options.js): die Doktrin erscheint nur, wenn ihre Wirkung im Spielstand etwas bewirkt.
     nameKey, descKey, effKey   Texte (Präfix doctrine.); {e1} … = Werte der Wirkungen, {d1} = Wert der Einschränkung
   Namen und Werte sind Startwerte (REQ-K5.07), Kalibrierung per Simulation. */
const KF_DOKTRINEN = [
  /* ---------- Wirtschaft ---------- */
  { id: 'zunftordnung', linie: 'wirtschaft', sonderbau: 'zunfthaus', effect: [], drawback: [],
    grenze: { max: 4, typen: ['fabrik'] }, wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.zunftordnung.name', descKey: 'doctrine.zunftordnung.desc' },
  { id: 'stiftung', linie: 'wirtschaft', sonderbau: 'stiftungshaus', effect: [], drawback: [{ stat: 'unitCost', mul: 1.2 }],
    wirkt: { building: 'universitaet' },
    nameKey: 'doctrine.stiftung.name', descKey: 'doctrine.stiftung.desc' },
  /* ---------- Militär ---------- */
  { id: 'stehendesHeer', linie: 'militaer', sonderbau: 'heerlager', effect: [], drawback: [{ stat: 'upkeep', add: 1 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.stehendesHeer.name', descKey: 'doctrine.stehendesHeer.desc' },
  { id: 'vorstoss', linie: 'militaer', sonderbau: null, effect: [{ stat: 'ownWaveInterval', mul: 0.5 }], drawback: [{ stat: 'towerCd', mul: 1.3 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.vorstoss.name', descKey: 'doctrine.vorstoss.desc' },
  /* ---------- Verteidigung ---------- */
  { id: 'bollwerk', linie: 'verteidigung', sonderbau: 'bastion', effect: [{ stat: 'towerKillXp', mul: 2 }], drawback: [{ stat: 'factoryYield', mul: 0.85 }],
    wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.bollwerk.name', descKey: 'doctrine.bollwerk.desc' },
  { id: 'ausfall', linie: 'verteidigung', sonderbau: null, effect: [{ stat: 'counterWave', add: 1 }, { stat: 'counterBoost', add: 1 }], drawback: [{ stat: 'repairCost', mul: 2 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.ausfall.name', descKey: 'doctrine.ausfall.desc' },
];

/* Klammerfront – Doktrinen (Branch exp/kartenpfad, Teil 5, REQ-K5.07), deklarativ.
   Gilt nur im Pacing-Modus 'karten'; im Modus 'standard' gibt es keine Doktrinen.
   Eine Doktrin ist eine starke Karte mit drei Teilen: einem Effekt (Regeländerung oder mindestens +30 %), einem Sonderbau oder einer Fähigkeit, die nur sie freischaltet,
   und einer bindenden Einschränkung, die einen anderen Weg verengt. Höchstens C.DOKTRIN.max Doktrinen je Partie; sie ersetzen die Schlüsselkarten aus Teil 4.
   Felder:
     id, kat        Kennung; Kategorie ('militaer' | 'wirtschaft' | 'verteidigung'); Mischdoktrinen (Teil 6, REQ-K6.05) tragen eine Liste mit zwei Kategorien und zählen für beide.
                    Eine Doktrin zählt C.KATEGORIEN.doktrin-mal für ihre Kategorie (Teil 6, REQ-K6.03; die Zeichen und Linien aus Teil 5 entfallen).
     sonderbau      Kennung der Variante (data/varianten.js, Feld doktrin an der Variante), die nur mit dieser Doktrin aufgewertet werden kann; null: kein Sonderbau.
                    Die Wirkung des Sonderbaus steht an der Variante (sie gilt, solange er fertig steht: ein Invest).
     effect         Wirkung mit der Wahl der Doktrin (stat, mul | add) wie bei den Karten; bei Doktrinen mit Sonderbau meist leer.
     drawback       bindende Einschränkung als Wirkung (stat, mul | add); gilt mit der Wahl und bis zum Ende der Partie.
     grenze         bindende Einschränkung als Regel: { max: n, typen: [Gebäudetypen] } – höchstens n Plätze mit diesen Typen; die Aktion „Bauen“ ist sonst gesperrt, mit Erklärzeile.
                    Seit Teil 7 nutzt keine Doktrin mehr diese Form; die Zunftordnung senkt die Obergrenze für Fabriken des Haupthauses (drawback fabrikGrenze) und gilt ebenso für den Bestand.
                    Teil 6 (REQ-K6.01): gilt ab der Wahl auch für den Bestand: Er bleibt stehen, aber der Sonderbau der Doktrin ist gesperrt, solange mehr Plätze stehen (Erklärzeile „Reiße zuerst N Fabriken ab.“).
     wirkt          Angebotsbedingung wie bei den Bonuskarten (data/draft-options.js): die Doktrin erscheint nur, wenn ihre Wirkung im Spielstand etwas bewirkt.
     nameKey, descKey, effKey   Texte (Präfix doctrine.); {e1} … = Werte der Wirkungen, {d1} = Wert der Einschränkung
   Namen und Werte sind Startwerte (REQ-K5.07), Kalibrierung per Simulation. */
const KF_DOKTRINEN = [
  /* ---------- Wirtschaft ---------- */
  /* Teil 7 (REQ-K7.05): Die Obergrenze für Fabriken des Haupthauses (höchstens 3/4/5) macht die frühere Grenze (höchstens 4) wirkungslos; die Zunftordnung senkt sie stattdessen um eins */
  { id: 'zunftordnung', kat: 'wirtschaft', sonderbau: 'zunfthaus', effect: [], drawback: [{ stat: 'fabrikGrenze', add: -1 }],
    wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.zunftordnung.name', descKey: 'doctrine.zunftordnung.desc' },
  { id: 'stiftung', kat: 'wirtschaft', sonderbau: 'stiftungshaus', effect: [], drawback: [{ stat: 'unitCost', mul: 1.2 }],
    wirkt: { building: 'universitaet' },
    nameKey: 'doctrine.stiftung.name', descKey: 'doctrine.stiftung.desc' },
  /* ---------- Militär ---------- */
  { id: 'stehendesHeer', kat: 'militaer', sonderbau: 'heerlager', effect: [], drawback: [{ stat: 'upkeep', add: 1 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.stehendesHeer.name', descKey: 'doctrine.stehendesHeer.desc' },
  { id: 'vorstoss', kat: 'militaer', sonderbau: null, effect: [{ stat: 'ownWaveInterval', mul: 0.5 }], drawback: [{ stat: 'towerCd', mul: 1.3 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.vorstoss.name', descKey: 'doctrine.vorstoss.desc' },
  /* ---------- Verteidigung ---------- */
  { id: 'bollwerk', kat: 'verteidigung', sonderbau: 'bastion', effect: [{ stat: 'towerKillXp', mul: 2 }], drawback: [{ stat: 'factoryYield', mul: 0.85 }],
    wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.bollwerk.name', descKey: 'doctrine.bollwerk.desc' },
  /* Teil 6: „Ausbruch“ (Linie Verteidigung, Stufe 3: Gegenstoß-Einheiten richten doppelten Schaden an der gegnerischen Basis an) ist Teil dieser Doktrin */
  { id: 'ausfall', kat: 'verteidigung', sonderbau: null, effect: [{ stat: 'counterWave', add: 1 }, { stat: 'counterBoost', add: 1 }, { stat: 'counterBaseDmg', mul: 2 }], drawback: [{ stat: 'repairCost', mul: 2 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.ausfall.name', descKey: 'doctrine.ausfall.desc' },

  /* ---------- Teil 6 (REQ-K6.05): sechs neue Doktrinen, dazu Zermürbung (Soll) ----------
     Neue Größen: runnerCost (Kosten der Läufer ×), onlyRunners (nur Läufer kaufbar), freihandel (Tausch im Kontor), towerMax (höchste Turmstufe), raubbau (Ertragsstufen der Fabriken), raubbauVerfall (nur als Markierung der Einschränkung),
     fabrikMiliz (Läufer aus den Fabriken), zermuerbung (Anteil der Lebenspunkte, den Gegner vor der Mauer verlieren). Mischformen tragen eine Liste in kat und zählen für beide Kategorien. */
  { id: 'elite', kat: 'militaer', sonderbau: null, effect: [{ stat: 'unitHp', mul: 2 }, { stat: 'unitDmg', mul: 2 }], drawback: [{ stat: 'supplyMult', mul: 0.5 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.elite.name', descKey: 'doctrine.elite.desc' },
  { id: 'massenaufgebot', kat: 'militaer', sonderbau: null, effect: [{ stat: 'runnerCost', mul: 0.5 }, { stat: 'extraUnit', add: 1 }], drawback: [{ stat: 'onlyRunners', add: 1 }],
    wirkt: { building: 'kaserne' },
    nameKey: 'doctrine.massenaufgebot.name', descKey: 'doctrine.massenaufgebot.desc' },
  { id: 'freihandel', kat: 'wirtschaft', sonderbau: null, effect: [{ stat: 'freihandel', add: 1 }], drawback: [{ stat: 'towerMax', add: 1 }],
    wirkt: { building: 'kontor' },
    nameKey: 'doctrine.freihandel.name', descKey: 'doctrine.freihandel.desc' },
  { id: 'raubbau', kat: 'wirtschaft', sonderbau: null, effect: [{ stat: 'raubbau', add: 1 }], drawback: [{ stat: 'raubbauVerfall', add: 1 }],
    wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.raubbau.name', descKey: 'doctrine.raubbau.desc' },
  /* Der Name „Kriegswirtschaft“ gehört der Brückenkarte (data/karten6.js); die Doktrin heißt Fabrikmiliz */
  { id: 'fabrikmiliz', kat: ['wirtschaft', 'militaer'], sonderbau: null, effect: [{ stat: 'fabrikMiliz', add: 1 }], drawback: [{ stat: 'materialYield', mul: 0.7 }],
    wirkt: { building: 'fabrik' },
    nameKey: 'doctrine.fabrikmiliz.name', descKey: 'doctrine.fabrikmiliz.desc' },
  /* Teil 7 (REQ-K7.05): statt höchstens 5 Fabriken (durch die Obergrenze des Haupthauses wirkungslos) rücken die eigenen Wellen seltener aus */
  { id: 'grenzfeste', kat: ['wirtschaft', 'verteidigung'], sonderbau: null, effect: [{ stat: 'towerKillMaterial', add: 3 }], drawback: [{ stat: 'ownWaveInterval', mul: 1.25 }],
    wirkt: { tower: true },
    nameKey: 'doctrine.grenzfeste.name', descKey: 'doctrine.grenzfeste.desc' },
  { id: 'zermuerbung', kat: 'verteidigung', sonderbau: null, effect: [{ stat: 'zermuerbung', add: 0.25 }], drawback: [{ stat: 'quartiereCost', mul: 1.5 }],
    wirkt: { tower: true },
    nameKey: 'doctrine.zermuerbung.name', descKey: 'doctrine.zermuerbung.desc' },
];

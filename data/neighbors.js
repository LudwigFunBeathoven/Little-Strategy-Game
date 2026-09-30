/* Klammerfront – Nachbarschaftsregeln im 3×3-Raster (REQ-6.07 a), deklarativ.
   Genau eine Regel je Gebäudetyp. Nachbarn sind nur orthogonal angrenzende Plätze (oben, unten, links, rechts).
   Felder:
     building  Gebäudetyp, der die Regel trägt
     with      Gebäudetyp des Nachbarn, der den Bonus auslöst
     stat      Wirkung (siehe core.js, neighborMul/neighborAdd)
     per       Wert je angrenzendem Nachbarn des Typs `with`
     max       höchstens so viele Nachbarn zählen
     nameKey   Text der Regel in i18n/*.js; {v} = Wert je Nachbar, {n} = Zahl der Nachbarn
   Werte per Simulation kalibriert (I6.7). */
const KF_NEIGHBORS = [
  { building: 'fabrik',       with: 'fabrik',  stat: 'factoryAdj',   per: 0.06,  max: 4, nameKey: 'nb.fabrik' },        // Fabrik: +Ertrag dieser Fabrik
  { building: 'schmiede',     with: 'kaserne', stat: 'unitCostAdj',  per: -0.08, max: 1, nameKey: 'nb.schmiede' },      // Einheitenkosten
  { building: 'kaserne',      with: 'schmiede', stat: 'supplyAdj',   per: 1,     max: 1, nameKey: 'nb.kaserne' },       // Versorgungslimit
  { building: 'universitaet', with: 'fabrik',  stat: 'researchTimeAdj', per: -0.08, max: 3, nameKey: 'nb.universitaet' }, // Forschungszeit
  { building: 'kontor',       with: 'fabrik',  stat: 'kontorCapAdj', per: 0.25,  max: 4, nameKey: 'nb.kontor' },        // Zinsdeckel
];

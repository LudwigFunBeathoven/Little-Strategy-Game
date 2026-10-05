/* Klammerfront – Schritte des Tutorials „Erste Schritte“ (REQ-T.01, T.06), deklarativ.
   Jeder Schritt wartet auf ein Ereignis der Spiellogik (core.js, G.on): on = Ereignisname, where = Bedingung an die Ereignisdaten,
   sum = Feld, das aufaddiert wird (sonst zählt jedes Ereignis 1), need = Schwellenwert. Schritte zählen unabhängig von ihrer Reihenfolge
   (Grundsatz 4): Was der Spieler vorab erledigt, gilt als erledigt.
   target = Ziel der Hervorhebung (die Oberfläche löst es auf: click, plot, units, waves); demo = Handlung, die die Figur einmal vorführt
   (click, plot); textKey = Zeile in den Sprachdateien (höchstens etwa 60 Zeichen). farewell = Abschiedszeile: erscheint erst, wenn das
   Ziel erreicht ist, danach verschwindet die Figur; bis dahin steht keine Zeile da. */
const KF_TUTORIAL_STEPS = [
  { id: 'fertigen',    on: 'materialProduced', where: { source: 'click' }, sum: 'n', need: 10, target: 'click', demo: 'click', textKey: 'tut.fertigen' },
  { id: 'bauen',       on: 'buildingBuilt',                                           need: 1,  target: 'plot',  demo: 'plot',  textKey: 'tut.bauen' },
  { id: 'rekrutieren', on: 'unitBought',                                              need: 3,  target: 'units',                textKey: 'tut.rekrutieren' },
  { id: 'ausruecken',  on: 'waveDeparted',     where: { side: 'p' },                  need: 1,  target: 'waves',                textKey: 'tut.ausruecken' },
  { id: 'sieg',        on: 'enemyWaveDefeated',                                       need: 1,  target: null,    farewell: true, textKey: 'tut.sieg' },
];

/* Klammerfront – Schritte des Tutorials „Erste Schritte“ (REQ-T.01, T.06, T2.02 – T2.05), deklarativ.
   Jeder Schritt wartet auf ein Ereignis der Spiellogik (core.js, G.on): on = Ereignisname, where = Bedingung an die Ereignisdaten,
   sum = Feld, das aufaddiert wird (sonst zählt jedes Ereignis 1), need = Schwellenwert. Schritte zählen unabhängig von ihrer Reihenfolge
   (Grundsatz 4): Was der Spieler vorab erledigt, gilt als erledigt, seine Sprechblase entfällt, Erzählung wird nie nachgeholt.
   target = Ziel der Hervorhebung (die Oberfläche löst es auf: click, plot, units, waves, cards); demo = Handlung, die die Figur einmal vorführt
   (click, plot); narrKey = Erzählung (warum, höchstens etwa 90 Zeichen), taskKey = Auftrag (höchstens etwa 30 Zeichen).
   silent = Schritt ohne Sprechblase (hier: der Kampf, bis die erste Gegnerwelle besiegt ist); er zählt nicht zu den „höchstens fünf Dingen“.
   Texte stehen in den Sprachdateien; je Pacing-Modus überschreibbar über Schlüssel mit Suffix (tut.bye1.<modus>), sonst gilt der Standard. */
const KF_TUTORIAL_STEPS = [
  { id: 'fertigen',    on: 'materialProduced', where: { source: 'click' }, sum: 'n', need: 10, target: 'click', demo: 'click', narrKey: 'tut.fertigen.narr',    taskKey: 'tut.fertigen.task' },
  { id: 'bauen',       on: 'buildingBuilt',                                           need: 1,  target: 'plot',  demo: 'plot',  narrKey: 'tut.bauen.narr',       taskKey: 'tut.bauen.task' },
  { id: 'rekrutieren', on: 'unitBought',                                              need: 3,  target: 'units',                narrKey: 'tut.rekrutieren.narr', taskKey: 'tut.rekrutieren.task' },
  { id: 'ausruecken',  on: 'waveDeparted',     where: { side: 'p' },                  need: 1,  target: 'waves',                narrKey: 'tut.ausruecken.narr',  taskKey: 'tut.ausruecken.task' },
  { id: 'schlacht',    on: 'enemyWaveDefeated',                                       need: 1,  target: null,    silent: true },
  { id: 'karte',       on: 'cardChosen',                                              need: 1,  target: 'cards',                narrKey: 'tut.karte.narr',       taskKey: 'tut.karte.task' },
];
/* Begrüßung nach Partiebeginn (REQ-T2.02) und Abschied nach der ersten Kartenwahl (REQ-T2.05): je zwei Sprechblasen */
const KF_TUTORIAL_GREETING = ['tut.greet1', 'tut.greet2'];
const KF_TUTORIAL_FAREWELL = ['tut.bye1', 'tut.bye2'];

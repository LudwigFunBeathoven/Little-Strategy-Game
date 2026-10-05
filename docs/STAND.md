# Klammerfront – Stand Tutorial „Erste Schritte“ (v0.8)

Grundlage: `docs/anforderungen-tutorial.md`. Branch: `tutorial` (von `main`, Commit `2211210`, v0.7).
Stand von Iteration 6: `docs/archiv/STAND-iteration-6.md`, Bericht `docs/bericht-iteration-6.md`.

**Starten:** `index.html` im Browser öffnen. Tutorial erzwingen: `?tutorial=1`, unterdrücken: `?tutorial=0`. Spieltest-Modus: `?debug=1`.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| T.0 | Anforderungen ablegen, Basislinie der Simulation sichern | T.06 | fertig |
| T.1 | Ereignisse und Schonfrist in `core.js` | T.03, T.06 | fertig |
| T.2 | `tutorial.js`, `data/tutorial-steps.js` | T.01, T.04, T.06 | fertig |
| T.3 | Quartiermeister, Hervorhebung, Start, Überspringen | T.02, T.04 | fertig |
| T.4 | Erstkontakt-Hinweise, Markierung „neu“ | T.05 | fertig |
| T.5 | Messung, Tests, Doku, Abnahme | T.07 | fertig |

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz        # beide Strategien, je 20 Partien Normal durchschnitt
node tools/bench-tick.mjs                   # Tick-Zeit mit 2 × 60 Einheiten
```

## Prüfergebnisse
- T.0: `npm test` 139/139. Neu `tests/unveraendert.test.mjs`: vier Partien (beide Strategien, Leicht bis Schwer, feste Seeds) mit den Werten
  aus v0.7; sie müssen nach jeder Tutorial-Änderung unverändert herauskommen (REQ-T.06).

- T.1: `npm test` 147/147 (neu `tests/hold.test.mjs`), Tick-Zeit Median 0,15 ms mit 120 Einheiten; die vier Partien aus T.0 liefern unverändert
  dieselben Werte. `core.js` bietet `on(fn)` für Ereignisse (`materialProduced`, `buildingBuilt`, `unitBought`, `waveDeparted`,
  `enemyWaveDefeated`) und eine Schonfrist: `newGame(…, { hold: { maxS, size } })`, `releaseHold(normalFirstWave)`, `holdActive()`;
  Zustand `S.hold` (im Spielstand, ohne Versionsänderung: fehlt er, gilt `null`). Ohne Zuhörer und ohne `hold` ändert sich nichts.
- T.2: `npm test` 158/158 (neu `tests/tutorial.test.mjs`: Schritte in Reihenfolge, vertauschte Reihenfolge, Zähler unabhängig vom aktuellen Schritt,
  Vorführung zählt nicht, Überspringen in jedem Schritt, Fehlklicks, Start/`?tutorial`, Speicher fehlt oder ist kaputt, Speichern und Laden,
  Texte in beiden Sprachen höchstens 60 Zeichen). `tutorial.js` hat keinen Zugriff auf Seite oder Fenster; Schritte in `data/tutorial-steps.js`.
- T.3: `npm test` 158/158, Browser-Prüfung 195/195 (bisherige Abläufe laufen mit `?tutorial=0`; die Prüfung „Hinweis zum Start“ entfällt mit dem
  Hinweis). Probelauf im Browser: ein direkt bedienender Spieler schließt alle fünf Schritte nach rund 40 s Spielzeit ab (Ziel ≤ 2:30 min).
  Neu `tutorial-ui.js` (Figur, Rahmen, Sprechblase, Randpfeil, Überspringen, Kamera), Knopf „Tutorial überspringen“ in der Leiste, „Tutorial
  wiederholen“ im Dialog „Neue Partie“. Der Dialog scrollt jetzt bei niedrigen Fenstern, „Spiel starten“ bleibt unten sichtbar.
- T.4: Hinweise: einer gleichzeitig, nie im Tutorial (Auslöser prüfen erst danach), schließen nach 8 s oder per Klick, eine Zeile (≤ 90 Zeichen, geprüft in
  `tests/hints.test.mjs`); neu: Mauer, Türme, Schmiede, Kontor (mit Zinsen), Nachbarschaft; gestrichen: Start, erste Welle (Tutorial). Marke „neu“ (`NewMarks` in
  `panels.js`): Reiter, Bau-Optionen, Einheiten; Grundlinie beim Start, „angesehen“ nach 1,5 s, Zustand im Spielstand.
- T.5: `npm test` 162/162; Browser-Prüfung BROWSER_ANZAHL (neu: Tutorial-Ablauf in beiden Sprachen, vertauschte Reihenfolge, Überspringen in vier Schritten, zweiter Start,
  `?tutorial`, Hinweise, „neu“, Protokoll, Schritt 4 mit Kaserne). Kurzsimulation unverändert (9:09 / 6:13, je 100 %), Tick-Zeit 0,13 ms. Zwei bereits vorhandene,
  zufallsabhängige Prüfungen robust gemacht (Dauerauftrag bei „Welle vorziehen“, dieselbe Karte zweimal bei „Kartenwahl“).
- Offen/unerklärt: Die Browser-Prüfung „Zweiter Start im selben Browser“ schlug in einzelnen Läufen fehl (Tutorial startete erneut). Die Prüfung meldet jetzt den Zustand des
  Browser-Speichers vor und nach dem Neuladen; FLAKE_NOTIZ

## Auslegungen und Abweichungen (zur Zustimmung durch den PO)
Siehe `docs/bericht-tutorial.md`, Abschnitt 2 (15 Punkte). Wichtigste: (1) die gestaffelte Freischaltung bleibt, nur die Hinweistexte der Einführung entfallen;
(2) `exp/kartenpfad` und `exp/zeitalter` gibt es im Repository nicht; (3) „Menü“ ist der Dialog „Neue Partie“; (4) Version 0.8, Spielstand-Version unverändert.

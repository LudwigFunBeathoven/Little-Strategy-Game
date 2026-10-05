# Klammerfront – Stand Tutorial „Erste Schritte“ (v0.8)

Grundlage: `docs/anforderungen-tutorial.md`. Branch: `tutorial` (von `main`, Commit `2211210`, v0.7).
Stand von Iteration 6: `docs/archiv/STAND-iteration-6.md`, Bericht `docs/bericht-iteration-6.md`.

**Starten:** `index.html` im Browser öffnen. Tutorial erzwingen: `?tutorial=1`, unterdrücken: `?tutorial=0`. Spieltest-Modus: `?debug=1`.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| T.0 | Anforderungen ablegen, Basislinie der Simulation sichern | T.06 | fertig |
| T.1 | Ereignisse und Schonfrist in `core.js` | T.03, T.06 | offen |
| T.2 | `tutorial.js`, `data/tutorial-steps.js` | T.01, T.04, T.06 | offen |
| T.3 | Quartiermeister, Hervorhebung, Start, Überspringen | T.02, T.04 | offen |
| T.4 | Erstkontakt-Hinweise, Markierung „neu“ | T.05 | offen |
| T.5 | Messung, Tests, Doku, Abnahme | T.07 | offen |

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

## Auslegungen und Abweichungen (zur Bestätigung durch den PO)
Noch keine.

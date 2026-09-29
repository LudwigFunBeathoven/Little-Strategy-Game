# Klammerfront – Stand Iteration 4

Grundlage: `docs/anforderungen-iteration-4.md`, Plan: `docs/plan-iteration-4.md`. Branch: `3x3-und-3-Lanes-Spiel` (das Dokument nennt `iteration-3`).
Stand von Iteration 3: `docs/archiv/STAND-iteration-3.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Prio | Status |
|---|---|---|---|---|
| I4.1 | „Halten“ entfernen | 41 | P0 | offen |
| I4.2 | Formation | 42 | P0 | offen |
| I4.3 | Lane-übergreifender Kampf | 43 | P0 | offen |
| I4.4 | Automatisierung und große Armeen | 44 | P1 | offen |
| I4.5 | Kartenausbau | 45 | P1 | offen |
| I4.6 | Vertikales Layout, Reich in der Spielwelt, Scrollen | 46 | P1 | offen |
| I4.7 | Gestaffelte Einführung | 47 | P2 | offen |
| I4.8 | Simulation, Balancing, Bericht, Merge-Bereitschaft | 48 | P2 | offen |

Abgleich mit Version 1: Nach Version 1 wurden keine Inkremente umgesetzt; es gibt nichts abzugleichen.

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz
```

## Prüfergebnisse

## Abweichungen und Auslegungen

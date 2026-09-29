# Klammerfront – Stand Iteration 4

Grundlage: `docs/anforderungen-iteration-4.md`, Plan: `docs/plan-iteration-4.md`. Branch: `3x3-und-3-Lanes-Spiel` (das Dokument nennt `iteration-3`).
Stand von Iteration 3: `docs/archiv/STAND-iteration-3.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Prio | Status |
|---|---|---|---|---|
| I4.1 | „Halten“ entfernen | 41 | P0 | fertig |
| I4.2 | Formation | 42 | P0 | fertig |
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
- I4.1: `npm test` 52/52, Browser-Prüfung grün, Kurzsimulation 20 Siege, 0 offen. Suche nach `hold`/„Halten“ in `*.js`, `*.mjs`, `*.html`: keine Treffer.

- I4.2: `npm test` 59/59, Browser-Prüfung grün, Kurzsimulation 16 Siege, 4 Niederlagen, 0 offen.
  Anti-Patt-Regeln (10 Partien je Stufe und Profil, 150 Partien): mit allen 0 %, ohne alle 2 % Patts; ohne alle bleibt aber die reine
  Verteidigung auf Leicht in 3 von 10 Partien bis Minute 30 stehen. Mit nur der Reparatur-Abklingzeit: 0 % Patts, Verteidigung verliert immer.

## Abweichungen und Auslegungen
1. **Suche nach „hold“ wörtlich genommen:** Auch Namen, die das Wort nur zufällig enthalten, sind umbenannt: `xpThreshold` → `xpTotal`,
   `ALARM_THRESHOLDS` → `ALARM_LEVELS`, `GATE_HOLD_DIST` → `GATE_BLOCK_DIST`, „stillgehalten“ → „stillgestanden“.
   Die Simulationsreihe `halten` entfällt. Rohdaten aus Iteration 3 unter `reports/` bleiben unverändert.
2. **Anti-Patt-Regeln (REQ-42):** Entfernt: Belagerung als Stärke je Einheit (Regel 21, jetzt wieder dreifache Größe) und das
   Nachskalieren der Gegner im Feld (22). **Behalten: Reparatur-Abklingzeit (23).** Wörtlich verlangt REQ-42 das Entfernen aller drei, weil die
   Patt-Quote ohne sie bei 2 % liegt. Ohne Regel 23 verfehlt aber REQ-21.4 (reine Verteidigung verliert bis Minute 25) auf Leicht.
3. **Reihen werden laufend aufgefüllt:** Fällt eine Einheit der vordersten Reihe, rückt sofort eine aus der nächsten Reihe nach, nicht erst,
   wenn die ganze Reihe gefallen ist. Fernkämpfer ohne Nahkämpfer bilden selbst die vorderste Reihe.
4. **Verschmelzen** gilt, sobald eine Formation eine stehende (kämpfende oder angreifende) eigene Formation derselben Lane einholt.
5. **Spielstände:** `ui.js` prüfte seit I3 noch auf Version 3; gespeicherte Partien wurden nie geladen. Jetzt gilt `KlammerCore.SAVE_VERSION` (5).

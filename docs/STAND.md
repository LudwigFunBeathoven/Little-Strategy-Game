# Klammerfront – Stand Iteration 4

Grundlage: `docs/anforderungen-iteration-4.md`, Plan: `docs/plan-iteration-4.md`. Branch: `3x3-und-3-Lanes-Spiel` (das Dokument nennt `iteration-3`).
Stand von Iteration 3: `docs/archiv/STAND-iteration-3.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Prio | Status |
|---|---|---|---|---|
| I4.1 | „Halten“ entfernen | 41 | P0 | fertig |
| I4.2 | Formation | 42 | P0 | fertig |
| I4.3 | Lane-übergreifender Kampf | 43 | P0 | fertig |
| I4.4 | Automatisierung und große Armeen | 44 | P1 | fertig |
| I4.5 | Kartenausbau | 45 | P1 | fertig |
| I4.6 | Vertikales Layout, Reich in der Spielwelt, Scrollen | 46 | P1 | fertig |
| I4.7 | Gestaffelte Einführung | 47 | P2 | fertig |
| I4.8 | Simulation, Balancing, Bericht, Merge-Bereitschaft | 48 | P2 | fertig (Merge wartet auf Freigabe) |

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
- I4.3: `npm test` 65/65, Browser-Prüfung grün, Kurzsimulation ohne offene Partie. Serie mit 10 Partien je Feld: 0 % Patts;
  Schwer ist mit Formationen und Lane-Wechsel deutlich schwerer geworden (aktiv 2/10, durchschnitt 0/10), die reine Verteidigung hält auf
  Leicht bis knapp 27 Minuten. Beides ist Kalibrierung in I4.8.

- I4.4: `npm test` 68/68, Browser-Prüfung grün, Kurzsimulation 19 Siege, 1 Niederlage, 0 offen.

- I4.5: `npm test` 79/79, Browser-Prüfung grün, Kurzsimulation 17 Siege, 3 Niederlagen, 0 offen. 41 Karten nach `docs/plan-iteration-4.md`.

- I4.6: `npm test` 79/79, Browser-Prüfung grün (neu: 1280×720 und 1920×1080 ohne waagrechte Bildlaufleiste, Mausrad, Ziehen,
  Pfeiltasten/A/D, Scrollleiste, Sprungknöpfe, „Front folgen“, Bauplatz-Klick ohne Scrollen, Kontextfeld mit Tooltips und Erklärzeilen).
  Bildzeit mit 60 Einheiten im Bild: Median 0,3 ms (1280×720) bzw. 0,7 ms (1920×1080), Soll ≤ 20 ms. Kurzsimulation 17 Siege, 3 Niederlagen, 0 offen.

- I4.7: `npm test` 83/83, Browser-Prüfung grün (neu: Startzustand der Einführung, Freischaltung ab Stufe 2, Schalter „Einführung überspringen“).
  Kurzsimulation mit Einführung 20 Siege, 0 offen; ohne Einführung (`KF_SKIP_INTRO=1`) 17 Siege, 3 Niederlagen, 0 offen.
  Der Bot gewinnt mit Einführung öfter, weil er früh kein Material in Verstärkungsgebäude steckt; Einordnung in I4.8.

- I4.8: `npm test` 83/83, Browser-Prüfung grün. Serie: 3.000 Partien (ziele), 1.800 (phasen), 300 (strategie), 100 (ohne Schmiede),
  450 (ohne Einführung); Patt-Quote 0 %. Kurzsimulation 12 Siege, 8 Niederlagen, 0 offen. Kalibrierung, Abnahmetabelle und Auffälligkeiten in `docs/bericht-iteration-4.md`, Rohdaten unter `reports/i4-*`.

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
6. **Vorrang der Mitte (REQ-43):** Formationen oben und unten wechseln frei in die Mitte. Eine Formation der Mitte hilft einer Seiten-Lane
   nur dort, wo der Gegner schon kämpft. Ohne diese Einschränkung tauschten zwei zielfreie Formationen gegenseitig die Lanes.
7. **Eigene Lane geht vor, auch während der Unterstützung:** Taucht in der Heimat-Lane ein Ziel auf, kehrt die Formation sofort zurück.
8. **Während der Querbewegung kämpft eine Formation nicht** und ist für Gegner nicht greifbar; sie wird erst nach Ankunft Teil der neuen Lane.
9. **REQ-11.2 „kein Lane-Wechsel“** ist durch REQ-43 ersetzt; der Test prüft jetzt, dass Einheiten ihre Heimat-Lane behalten und
   höchstens eine Lane daneben stehen.
10. **Gegnerischer Turm** steht an der Mitte: erst Einheiten der Mitte, sonst die nächste Einheit einer anderen Lane.
11. **„Front folgen“ und die Messung der Bildzeit (REQ-44)** kommen mit dem scrollbaren Weltbild in I4.6; vorher gibt es keine Kamera,
    und das Zeichnen wird dort ohnehin neu gebaut.
12. **Maximum aus Automatik und Klicken:** Jeder manuelle Klick bringt den Anteil, um den die Klicks der letzten Sekunde die Rate der
    Automatik übersteigen. Beispiel Phase Mitte (Automatik 3/s): 2 Klicks/s bringen nichts zusätzlich, 5 Klicks/s ergeben 5/s.
    Für die Kennzahl „Klickanteil“ (REQ-03) zählt nur dieser Überschuss als Klick.
13. **Kaserne bis Stufe 6:** „Ausbau“ geht jetzt bis Stufe 6 (3 + 6 × 2 = 15), damit die Obergrenze von 15 ohne Karten erreichbar ist.
    Das Dokument sagt „weiter um 2 je Stufe“; ich lese „weiter“ als „weiterhin, auch über Stufe 3 hinaus“.
14. **Belagerungswelle** darf die Grenze von 15 Einheiten überschreiten (dreifache Größe); die Grenze gilt für reguläre Wellen.
15. **Kartenliste:** umgesetzt wie im Plan vorgelegt (41 Karten); die Freigabe durch den PO steht noch aus. Änderungen sind reine
    Datenänderungen in `data/draft-options.js` plus Texte.
16. **Zwei Kategorien je Angebot:** Wären alle bisher gezogenen Karten aus einer Kategorie, kommt die letzte Karte aus einer anderen.
    Bei nur einer möglichen Karte (Pool fast leer) kann das Angebot aus einer Kategorie bestehen.
17. **Große Armee und Blitzkrieg** ändern nur den Takt der eigenen Wellen; Gegnerwellen bleiben bei 20 s. Sonst wäre der Nachteil keiner.
    Der Countdown in der Wellenleiste zeigt deshalb den eigenen Takt.
18. **Synergie:** Die Karte selbst zählt mit. Bei 0 gewählten Karten (Karte nicht gewählt) ist die Wirkung 0, bei 1 Karte +perCard.
19. **Schildwall** wirkt als Schadensminderung (Schaden ÷ 1,2) für Nahkämpfer einer vollen vordersten Reihe; das entspricht +20 % Lebenspunkten.
20. **Instandhaltung** repariert wie der Knopf (100 LP), unterliegt also auch der Abklingzeit von 5 s.
21. **Bauplätze nur über die Spielwelt:** Die bisherigen Bauplatz-Karten entfallen; ein Bauplatz wird per Klick in der gezeichneten Welt gewählt,
    Bauen, Ausbauen und Abriss laufen im Kontextfeld der Seitenleiste. Mit der Tastatur allein sind Bauplätze damit nicht erreichbar
    (Scrollen schon). Falls das gebraucht wird: Auswahl per Zifferntaste 1–9 wäre ein kleiner Nachtrag.
22. **Bildzeit** wird einschließlich Ausführung der Zeichenbefehle gemessen (`getImageData` nach jedem Bild), sonst misst man nur deren Aufzeichnung.
    Die Messung im Kopflos-Browser nutzt Software-Zeichnung; echte Geräte mit Grafikkarte liegen eher darunter.
23. **Abriss in zwei Schritten** im Kontextfeld (erster Klick fragt, zweiter reißt ab) statt eines Bestätigungsdialogs.
24. **Einführung in der Simulation:** Bots spielen wie ein neuer Spieler mit Einführung (Gebäude erst ab Stufe 2). `KF_SKIP_INTRO=1` schaltet sie ab.
    In `core.js` ist die Einführung ohne Angabe aus (Tests, ältere Spielstände); die Oberfläche schaltet sie für neue Partien ein.
25. **Einführung überspringen** ist ein Schalter auf dem Startbildschirm, der im Browser gespeichert bleibt und ab der nächsten Partie gilt.
26. **Hinweise je System:** neu „Start“ (Presse, Fabrik, Einheiten) und „Verstärkungsgebäude“ (ab Stufe 2); vorhanden: Welle, Karte, Belagerung.
    Das Handelskontor bleibt wie bisher an seine Karte gebunden und erscheint während der Einführung ebenfalls erst ab Stufe 2.
    Die Wellenleiste erscheint mit der ersten eigenen oder gegnerischen Welle, je nachdem, was zuerst ausrückt.
27. **Karten über +25 pp** (Große Armee, Söldnerheer) sind berichtet, nicht abgeschwächt (Regel in `CLAUDE.md`); REQ-48 verlangt „keine Karte über +25 pp“.
    Die Entscheidung liegt beim PO.
28. **Vergleichswert einer Karte** ist „angeboten und nicht gewählt“; eine Partie zählt je Karte und Stufe höchstens einmal, und wer die Karte irgendwann
    gewählt hat, zählt nicht mehr zu „nicht gewählt“. Bewertet werden wie bisher die Profile aktiv und durchschnitt; Meldung erst ab 5 Partien je Seite.
29. **Kalibrierung über mehr als die genannten Konstanten:** Neben `XP_BASE`, `POST_SIEGE_GROWTH` und `UNIT_STRENGTH_PER_LEVEL` sind
    `FX_QUALITAET`, `enemyBaseHp`, `waveGrowth` und Leicht `hpGrowth` geändert (Begründung im Bericht).

# Klammerfront – Stand Iteration 5

Grundlage: `docs/anforderungen-iteration-5.md`. Branch: `iteration-5` (von `main` nach Fast-Forward von v0.5, Commit `42aad39`).
Stand von Iteration 4: `docs/archiv/STAND-iteration-4.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| I5.0 | Merge v0.5 → `main`, Branch, Basislinie | – | fertig |
| I5.1 | Eingabe: Ursache belegen, beheben | 5.01 | fertig |
| I5.2 | Umbenennung zu EP | 5.02 | fertig |
| I5.3 | Drei Bänder, Aufteilung von `ui.js` | 5.03 | fertig |
| I5.4 | Bauen über den Arbeitsbereich, Tastatur | 5.04 | fertig |
| I5.5 | Einzelsimulation | 5.05 | fertig |
| I5.6 | Armee als gemeinsame Welle | 5.06 | offen |
| I5.7 | Universität | 5.07 | offen |
| I5.8 | Balancing-Serie | 5.08 | offen |
| I5.9 | Polish, Fehlerbehebung, Testpaket, Bericht | 5.09–5.11 | offen |

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz
node tools/bench-tick.mjs          # Tick-Zeit mit 2 × 60 Einheiten
```

## Basislinie (I5.0, v0.5 unverändert)
| Messung | Wert | Wie gemessen |
|---|---|---|
| Kurzserie Ziele, 50 Partien je Feld (750) | Dauer 4:19 min auf 4 Kernen; Patt-Quote 0 % | `node tools/simulate.mjs --runs 50 --suite ziele`, Rohdaten `reports/i5-basis-ziele.*` |
| Bildzeit mit 60 Einheiten im Bild | Median 0,30 ms (1280×720), 0,70 ms (1920×1080) | `__kf.benchDraw(60)` in der Browser-Prüfung, kopflos |
| Tick-Zeit, 2 × 60 Einheiten in Kontakt | Median 0,09–0,11 ms, p95 0,24–0,34 ms | `node tools/bench-tick.mjs` (neu) |
| Eingabelatenz Klickfeld (Druck → DOM-Änderung) | Median 2,0 ms, p95 3,9 ms (40 Klicks) | Playwright, `pointerdown` bis erste DOM-Mutation |
| Eingabelatenz Klick in die Welt (Druck → nächstes Bild) | Median 15,7 ms, p95 17,4 ms (30 Klicks) | Playwright, Ereignis bis nächstes `requestAnimationFrame` |
| **Klick mit 120 ms Haltedauer** auf Bau-Option im Kontextfeld | **0 von 4** ausgeführt | Playwright, laufende Produktion (4 Fabriken) |
| **Klick mit 120 ms Haltedauer** auf „Läufer“ | **0 von 10** ausgeführt | Playwright |

Kennzahlen der Basisserie (Median Sieg; Siegquote):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv | verteidigung |
|---|---|---|---|---|---|
| Leicht | 5:28 · 100 % | 6:09 · 100 % | 7:32 · 100 % | 0 % | 0 %, spätestens 23:06 |
| Normal | 6:51 · 92 % | 10:04 · 86 % | 11:28 · 42 % | 0 % | 0 %, spätestens 20:46 |
| Schwer | 8:59 · 84 % | 10:23 · 52 % | 11:39 · 26 % | 0 % | 0 %, spätestens 21:07 |

## Prüfergebnisse
- I5.5: `npm test` 93/93 (neu: zwei gegen einen, nächstes Ziel, Gleichstand und Zielbindung, symmetrisches Duell, Kontakt und Nachrücken, Turm mit
  Einzelziel, gleicher Seed = gleiche Partie, Tick ≤ 1 ms), Browser-Prüfung grün. Kurzsimulation mit 200 Partien: 144 Siege, 56 Niederlagen,
  **0 offen**, Dauer 1:39 min. Tick-Zeit mit 2 × 60 Einheiten: Median 0,11 ms, p95 0,25 ms (Basislinie 0,09–0,11 / 0,24–0,34).
- I5.4: `npm test` 85/85, Browser-Prüfung 166/166, Kurzsimulation unverändert. Neue Prüfpunkte: Bau aus der Welt in genau zwei Klicks (Platz bleibt
  ausgewählt, Abriss sichtbar), aus dem Knopfraster in genau zwei Klicks (Kaserne mit Ausbau im Kontextkopf), nicht bezahlbare Optionen sichtbar, gesperrt
  und mit fehlender Menge, Bau vollständig per Tastatur (Pfeiltasten im Raster, Enter wählt, Enter baut).
- I5.3: `npm test` 85/85, Browser-Prüfung 161/161, Kurzsimulation unverändert 12 Siege, 8 Niederlagen, 0 offen.
  Bänder (Leiste / Welt / Arbeitsbereich): 1280×720 72 px / 50,0 % / 40,0 %; 1366×768 77 px / 50,0 % / 40,0 %; 1920×1080 80 px (Höchstwert) / 50,0 % / 42,6 %;
  2560×1440 80 px / 50,0 % / 44,4 %; nirgends Dokument-Scroll. Bildzeit mit 60 Einheiten 0,3–0,8 ms. Bildschirmfotos: `reports/screens/i5-layout-*.png`.
  Neue Prüfpunkte: Klick auf Fabrik, Schmiede, Kaserne, Universität, freien Platz und Mauer öffnet den passenden Reiter mit Kontextkopf;
  Esc und Klick ins Leere heben die Auswahl auf; alle Reiter per Tastatur; Erklärzeilen in jedem Reiter; Kartenwahl über die Leiste.
  `ui.js` 1.167 → 644 Zeilen; neu `render.js` (263), `hud.js` (79), `panels.js` (341).
- I5.2: `npm test` 85/85 (neu: Suchtest nach „Altmetall“/„scrap“/„Schrott“), Browser-Prüfung grün (neu: Hinweis bei altem Spielstand),
  Kurzsimulation unverändert 12 Siege, 8 Niederlagen, 0 offen. `SAVE_VERSION` 6, `SAVE_KEY` `klammerfront.save.v6`.
- I5.1: `npm test` 83/83, Browser-Prüfung 78/78, Kurzsimulation 12 Siege, 8 Niederlagen, 0 offen (Logik unverändert).
  Neue Prüfpunkte (je bei devicePixelRatio 1 und 2): Bau-Option und „Läufer“ mit 120 ms Haltedauer, 100 Klicks an zufälligen Punkten freier Bauplätze
  bei wechselnder Kamera und 0–4 px Zittern, 50 Klicks auf das Klickfeld in 5 s, Latenz Klickfeld (Median 13–14 ms, p95 15–16 ms) und Welt-Klick
  bis zum nächsten Bild (Median 12 ms, p95 13–14 ms), Umkehrbarkeit `screenToWorld`/`worldToScreen`.
  Derselbe Test gegen v0.5: Bau 0 von 4, „Läufer“ 0 von 10, Klickfeld-Latenz ab dem Drücken 43 ms (Auslösung erst beim Loslassen); Treffer in der Welt 100 von 100.
- I5.0: Basislinie oben. `main` per Fast-Forward auf `42aad39` (v0.5 plus Entwicklungsreport), Branch `iteration-5` von dort.

## Befund REQ-5.01: welche Hypothese zutraf
**Hypothese 1 (DOM-Neuaufbau) trifft zu und erklärt den Befund vollständig.**
- Das Kontextfeld baute seine Bau-Knöpfe neu, sobald sich der ganzzahlige Materialbestand änderte (der Bestand war Teil des Schlüssels für den Neuaufbau).
  Mit vier Fabriken geschah das neunmal je Sekunde. Ein menschlicher Klick (Drücken bis Loslassen 80–150 ms) traf beim Loslassen einen neuen Knopf;
  der Browser löst dann kein `click` aus. Messung: 0 von 4 Bauten bei 120 ms Haltedauer.
- Die Einheiten- und Upgrade-Knöpfe blieben erhalten, aber ihre Beschriftung (Taste, Stufenzahl) wurde bei jeder Aktualisierung (alle 100 ms) neu
  erzeugt. Traf das Drücken diese inneren Elemente, ging der Klick ebenso verloren: 0 von 10 bei „Läufer“.
- Hypothese 2 (Ziehen schluckt Klicks) und 3 (Trefferprüfung) treffen nicht zu: 100 von 100 Treffern auch mit v0.5. Die Ziehschwelle lag bereits bei 5 px.
- Hypothese 4 (Bedienführung): Der Bau brauchte schon in v0.5 zwei Klicks (Feld, Option); unklar war nur, dass die zweite oft verloren ging.
- Hypothese 5 (Kopplung an den Tick): trifft nicht zu. Das Klickfeld löste aber erst beim Loslassen aus, das kostet die Haltedauer (43 ms im Test).

**Behebung:** Knöpfe werden nur neu gebaut, wenn sich Auswahl oder Optionsmenge ändern; Kosten, Sperre und Begründung werden in den bestehenden
Knöpfen aktualisiert. Beschriftungen haben feste Kindelemente, geschrieben wird nur bei geänderten Werten (`setText`, `setHidden`, `setDis`).
Das Klickfeld löst auf `pointerdown` aus (Tastatur weiter über `click`). Handler fordern das Neuzeichnen nur an; die Oberfläche aktualisiert höchstens
einmal je Bild. Ziehschwelle 6 px (`UI.dragThresholdPx`), gemessen als Abstand statt nur waagrecht; die Trefferprüfung nutzt den Druckpunkt.
Eine Funktion `screenToWorld` (mit CSS-Skalierung und Kamera) für alle Treffer in der Canvas. Spielflächen mit `touch-action: manipulation`
und `user-select: none`. Tastenwiederholung löst keine Einheitenkäufe aus.

## Auslegungen
1. **Basis des Branches:** `main` wurde auf `42aad39` vorgespult, nicht auf das im Dokument genannte `36a71ee`; der einzige Unterschied ist der
   Entwicklungsreport (`docs/report-entwicklung.md`).
2. **Tastatur am Klickfeld:** Enter und Leertaste lösen weiterhin über `click` aus (ohne Zeigerereignis, erkennbar an `detail = 0`); gedrückt gehaltene
   Tasten wiederholen nicht, weil Browser für Knöpfe nur beim Loslassen bzw. einmal auslösen.
3. **Latenz-Messung:** Ab dem `pointerdown` bis zur ersten DOM-Änderung am Materialzähler bzw. bis zum nächsten `requestAnimationFrame` nach einem Welt-Klick.
   Die Anzeige folgt dadurch im nächsten Bild (höchstens 16,7 ms bei 60 Hz), nicht mehr sofort im Handler.
4. **Umbenennung:** `S.scrap`/`S.scrapTotal` → `S.xp`/`S.xpTotal`, `gainScrap` → `gainXp`, Kartenwert `scrapGain` → `xpGain`. Die bisherige
   Funktion `xpTotal(n)` (kumulierte Schwelle) heißt jetzt `xpForLevel(n)`, damit sie nicht mit `S.xpTotal` verwechselt wird.
   Die Karte „Schrottsammler“ heißt „Kriegserfahrung“ (`kriegserfahrung`, englisch „Battle experience“), Wirkung unverändert.
5. **Suchtest** prüft `.js`, `.mjs`, `.html`, `.md`, `.json` außerhalb von `docs/`, `reports/` und `CHANGELOG.md` auf „Altmetall“, „scrap“ und „Schrott“.
   `docs/` gilt als Archiv (Anforderungen und Berichte früherer Iterationen zitieren den alten Begriff).
6. **Alter Spielstand:** Beim Laden werden Schlüssel mit dem Präfix `klammerfront.save.` außer dem aktuellen sowie ein aktueller Schlüssel mit falscher
   Versionsnummer erkannt. Der Startbildschirm meldet das einmal („Dein Spielstand stammt aus einer älteren Version …“), die Daten werden dabei entfernt.
7. **Aufteilung ohne Build-Schritt:** Die vier Dateien teilen sich den globalen Namensraum klassischer Skripte (keine Module, damit `index.html` weiter
   per Doppelklick läuft). `ui.js` lädt zuerst und stellt `C`, `G`, `$`, `t`, `fmt` und die Hilfen bereit, danach `render.js`, `hud.js`, `panels.js`.
   Gestartet wird bei `DOMContentLoaded`, also erst wenn alle vier geladen sind.
8. **Bandhöhen:** Leiste 10 % der Fensterhöhe, begrenzt auf 56–80 px; Spielwelt 50 %; der Arbeitsbereich erhält den Rest. Ab 800 px Fensterhöhe greift die
   Obergrenze der Leiste, der Arbeitsbereich liegt dann über 40 % (1920×1080: 42,6 %). Die Prüfung ± 2 % gilt deshalb für Leiste (oder deren Grenze)
   und Spielwelt; beim Arbeitsbereich prüft sie, dass die drei Bänder das Fenster lückenlos füllen.
9. **Kartenwahl:** Der Dialog entfällt. Eine offene Wahl erscheint als pulsierender Knopf in der Leiste und als Punkt am Reiter „Karten“; gewählt wird im Reiter.
   Das Spiel steht bis zur Wahl (unverändert, Logik in `core.js`).
10. **Menü in der Leiste:** Pause, Sprachwechsel (wechselt reihum zwischen den Sprachen), Neue Partie (Startbildschirm wie bisher mit Schwierigkeit und Einführung).
11. **Kontextkopf:** steht über dem Reiterinhalt und erscheint nur, wenn der aktive Reiter zum ausgewählten Objekt gehört (Wechselt der Spieler selbst den Reiter,
    bleibt die Auswahl in der Welt markiert). Schmiede → Reiter Schmiede, Universität → Reiter Universität, übrige Gebäude und freie Plätze → Bauen,
    Mauer, Tor und Türme → Mauer & Türme.
12. **Zustand der Armee** in der Leiste zeigt bis I5.6 „Kampf“, sobald eine eigene Formation kämpft, sonst „Marsch“ (Sammeln kommt mit I5.6).
13. **EP je Sekunde** in der Leiste: gleitender Mittelwert über 30 s Spielzeit (`UI.xpRateWindowS`).
14. **Ereignisprotokoll, Wellenvorschau und Abschüsse** stehen im Reiter Armee; Kamera-Knöpfe und Scrollleiste unter der Spielwelt; die Lebenspunkte der
    gegnerischen Basis zeigt weiter der Balken an der Basis in der Welt.
15. **Hinweisfenster** liegt jetzt oben unter der Leiste statt unten, damit es den Arbeitsbereich nicht verdeckt.
16. **Tastaturbau:** Enter auf einem Rasterplatz wählt ihn und setzt den Fokus auf die erste baubare Option; ein zweites Enter baut. Mit der Maus springt der
    Fokus nicht, damit sich nichts unter dem Zeiger verschiebt.
17. **Kontextkopf im Reiter Bauen:** Für Bauplätze erscheint er auch dann im Reiter Bauen, wenn das Gebäude einen eigenen Reiter hat (Schmiede, Universität).
    So bleibt der Platz nach dem Bau ausgewählt und zeigt Abriss, ohne dass der Reiter wechselt. Die Upgrades der Schmiede stehen im Reiter Schmiede.
18. **Bewegung bleibt bis I5.6 bei den Formationen aus v0.5** (gemeinsames Tempo, Halt bei Kontakt der vordersten Reihe, Lane-Wechsel als Formation).
    Neu ist nur der Kampf: jede Einheit wählt ihr Ziel selbst, hat ihre eigene Abklingzeit, und alle Angriffe eines Ticks werden gleichzeitig angewendet.
    Regel (b) „Gegner einer anderen Lane“ läuft bis I5.6 über den Lane-Wechsel der ganzen Formation.
19. **Reihenregel für Fernkämpfer entfällt** (REQ-5.05, Punkt 3, ersetzt REQ-12.4): Fernkämpfer schießen über alle eigenen Reihen, begrenzt durch ihre Reichweite.
    `RANGED_RANGE_ROWS` ist entfernt. Die Karte **Weitschuss**, die diese Regel lockerte, liefe ins Leere; sie gibt jetzt **+20 % Schaden der Fernkämpfer**.
    Das ist eine Änderung an einer bestehenden Karte, keine neue Karte.
20. **Rangfolge vor Zielbindung:** Ein behaltenes Ziel aus einer nachrangigen Lane (Turm: Nachbar-Lane statt eigener) wird aufgegeben, sobald in der
    vorrangigen Lane ein Gegner in Reichweite ist. Innerhalb derselben Lane bleibt das Ziel, bis es fällt oder die Reichweite verlässt.
21. **Gleichzeitigkeit:** Ziele werden aus dem Zustand zu Tickbeginn bestimmt, danach werden alle Treffer angewendet. Wirkungen, die erst durch den Treffer
    entstehen (Stacheln der Mauer), treffen den Angreifer im selben Schritt.

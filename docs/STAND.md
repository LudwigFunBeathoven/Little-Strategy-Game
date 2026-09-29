# Klammerfront – Stand Iteration 5

Grundlage: `docs/anforderungen-iteration-5.md`. Branch: `iteration-5` (von `main` nach Fast-Forward von v0.5, Commit `42aad39`).
Stand von Iteration 4: `docs/archiv/STAND-iteration-4.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| I5.0 | Merge v0.5 → `main`, Branch, Basislinie | – | fertig |
| I5.1 | Eingabe: Ursache belegen, beheben | 5.01 | fertig |
| I5.2 | Umbenennung zu EP | 5.02 | fertig |
| I5.3 | Drei Bänder, Aufteilung von `ui.js` | 5.03 | offen |
| I5.4 | Bauen über den Arbeitsbereich, Tastatur | 5.04 | offen |
| I5.5 | Einzelsimulation | 5.05 | offen |
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

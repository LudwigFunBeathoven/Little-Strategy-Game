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
| I5.6 | Armee als gemeinsame Welle | 5.06 | fertig |
| I5.7 | Universität | 5.07 | fertig |
| I5.8 | Balancing-Serie | 5.08 | fertig |
| I5.9 | Polish, Fehlerbehebung, Testpaket, Bericht | 5.09–5.11 | fertig |

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
- I5.9: `npm test` 109/109 (neu `tests/momentum.test.mjs`), Browser-Prüfung 180/180 (neu: Sitzungsprotokoll je Profil, Zuordnung durch
  `compare-human.mjs` 4 von 4 richtig; Durchlauftest Leicht/Normal/Schwer bis Sieg, Konsole ohne Fehler und Warnungen). Kurzsimulation 15 Siege,
  5 Niederlagen, 0 offen. **Leistung:** Bildzeit mit 60 Einheiten 0,30 ms (1280×720) und 0,60 ms (1920×1080), Basislinie 0,30/0,70 ms: erfüllt.
  Tick-Zeit: im direkten Wechsel mit v0.5 (gleiche Maschine, 5 × 1.000 Ticks, `bench-tick.mjs` auf beiden Ständen) Median 0,10 ms gegen 0,065 ms,
  **+50 %, Soll ≤ +20 % verfehlt**; p95 0,20–0,26 gegen 0,18 ms (+10–40 %). Der in I5.0 notierte Basiswert 0,09–0,11 ms war unter Last gemessen
  und zu hoch. Ursache: Jede Einheit sucht ihr Ziel selbst (REQ-5.05); in v0.5 kämpfte nur die vorderste Reihe. Drei Optimierungen ohne
  Änderung des Ergebnisses (Kurzsimulation vorher/nachher identisch) brachten keine messbare Verbesserung. Absolut kostet die Logik bei 120 Einheiten
  2 ms je Sekunde Spielzeit (20 Ticks); spürbar ist das nicht. Vorschlag: Soll für die Tick-Zeit auf „≤ 1 ms bei 2 × 60 Einheiten“ umstellen.
  Versionsnummer 0.6 (`config.js`, `package.json`).
  **Gegenprobe mit dem einfachen Bot** (`tools/einfach-bot.mjs`, 50 Partien je Feld, `reports/i5-einfacher-bot.txt`): Der Browser-Bot ohne
  Vorausschau (feste Bauordnung, stets Einheiten bis zum Limit, erste Karte) gewinnt Normal „aktiv“ 50/50 nach 5:17 und Schwer „aktiv“ 50/50
  nach 6:09; die gierige Heuristik der Simulation mit denselben Profilwerten 88 % nach 6:44 bzw. 50 % nach 11:00. Die Kalibrierung aus I5.8
  stützt sich auf einen Bot, den eine einfache Spielweise deutlich schlägt. Siehe Bericht, „Auffälligkeiten“ und „Offen“.
- I5.8: Abnahmeserie 200 Partien je Feld (3.000 Ziele, 1.800 Phasen, 300 Strategie, 100 ohne Schmiede, 600 Experiment Schwung), 0 offen.
  Rohdaten `reports/i5-ziele.*`, `i5-phasen.*`, `i5-strategie.*`, `i5-ohneSchmiede.*`, `i5-experiment-schwung.*`; Zwischenrunden mit 50 je Feld
  `reports/i5-8-start|runde2|runde3-ziele.*`. Rechenzeit: 1.223 s für 3.000 Partien, 2,1 s je simulierter Spielstunde.
  **Messfehler „101 %“:** Die Spalte „nie/Dauer“ ist das Verhältnis zweier Siegquoten, kein Anteil (Auslegung 40). Die Simulation zeigt jetzt
  beide Quoten und die Median-Siegzeiten daneben.
  **Hebel in der vorgegebenen Reihenfolge** (Start = Stand I5.7, gegnerische Basis 11.000/13.000/15.000):
  1. Automatik: Hörsaal (EP-Automatik) von 0,25/0,6/1,1 auf 0,1/0,25/0,4 EP/s. Hörsaal III entspricht rechnerisch 25 % des EP-Ertrags aus
     Abschüssen eines aktiven Spielers auf Normal (Soll ≤ 25 %). Die Presse blieb unverändert (Klickanteile im Korridor).
  2. Große Armee und Söldnerheer: nicht geändert. Große Armee liegt nach dem Armeemodell bei +7 pp (v0.5: +38); Söldnerheer +32 pp bei nur
     10 Partien mit Wahl (Auffälligkeit, keine belastbare Grundlage).
  3. Gegnerstärke: Die gebündelte Armee (I5.6) gewann zu schnell (Start: Normal durchschnitt 6:22, Schwer aktiv 6:01). Gegnerische Basis
     Leicht/Normal/Schwer 26.000/26.000/46.000; Schwer Grundwelle 3,5 statt 2, Schadenszuwachs 0,07 statt 0,05, EP-Faktor 1,8 statt 1,15
     (sonst kamen Karten auf Schwer so selten, dass auch „aktiv“ scheiterte: 16 % Siege in Runde 3). `XP_GROWTH` 1,4 → 1,55, damit der
     Kartenabstand im Frühspiel ≥ 45 s bleibt (die Armee sammelt EP schneller).
  4. Experiment „Schwung“ (`EXPERIMENT.momentum`, aus): simuliert, Ergebnis im Bericht.
- I5.7: `npm test` 106/106 (neu `tests/research.test.mjs`: Universität, Kosten, Zeit, eine gleichzeitig, Voraussetzungen, Ruhen ohne Universität,
  je Wirkung ein Test, Neu ziehen und Bann, Freischaltungen, Schildträger bremst die Armee, Speichern und Laden), Browser-Prüfung 166/166.
  Universität gebaut (Normal, gierig, 30 Partien): 90 % (Soll ≥ 40 %). Kurzsimulation mit 200 Partien: 197 Siege, 3 Niederlagen, 0 offen, 61 s.
  **Patt gefunden und behoben:** Mit Forschung blieb 1 von 200 Partien offen (Seed 1246065). Ursache: Beide Armeen standen in verschiedenen Lanes und
  liefen einander hinterher (eigene Armee oben → Mitte, Gegner Mitte → oben), niemand traf. Behebung: Vorrang der Mitte wie in I4.3 (Einheiten in der
  Mitte helfen einer äußeren Lane nur, wo eigene Einheiten schon kämpfen) und die Lage einer Lane zählt auch Einheiten, die gerade in sie wechseln.
  Die Simulation gibt offene Partien jetzt mit Seed aus. Rechenzeit: Die gierige Heuristik prüft Forschung nach einer Ablehnung erst nach 30, 60, 120 s
  erneut (vorher alle 10 s: 1.128 s statt 61 s für 200 Partien).
- I5.6: `npm test` 99/99 (neu `tests/army.test.mjs`: gemeinsame Front und Tempo, Marsch → Kampf, Hysterese, Kampf → Sammeln → Marsch, Zeitlimit,
  Kampfreihenfolge mit Vorrang der Mitte, meisten Gegnern und oben, Einreihen, Ausnahme Mitte, Nachschub mit Aufschlusstempo und schwächster Lane,
  neue Armee nach Totalverlust, Gegner mit derselben Logik, Türme; `tests/crosslane.test.mjs` entfällt), Browser-Prüfung 166/166.
  **Pattprüfung vor jedem Balancing:** Kurzsimulation mit 200 Partien 198 Siege, 2 Niederlagen, 0 offen; Serie mit 50 Partien je Feld (750):
  0 offen, Dauer 2:18 min (Basislinie 4:19). Zeitanteil der Armee im Kampf: Median 55 %. Tick-Zeit mit 2 × 60 Einheiten: Median 0,10–0,11 ms
  (Basislinie 0,093 ms, gleiche Maschine, gleicher Messlauf; +10–18 %). Rohdaten `reports/i5-6-ziele.*`, Bildschirmfoto der Front im Marsch
  `reports/screens/i5-armee-marsch-1280x720.png`.
  Patt-Risiken aus REQ-5.06: (1) ein einzelner Gegner hält die Armee an – fällt schnell, Kampf-Zeitanteil 55 %, keine offene Partie; (2) Sammeln ohne Ende –
  Zeitlimit 4 s, getestet; (3) Flattern zwischen Sammeln und Kampf – Hysterese 16, getestet; (4) Warten auf die langsamste Einheit – alle Einheiten
  gleich schnell, Partien kürzer als in v0.5. **Die Armee ist durch die Bündelung deutlich stärker**: Normal „durchschnitt“ gewinnt 98 % nach 6:19
  (v0.5: 86 % nach 10:04). Ausgleich in I5.8.
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
22. **Gruppe statt Formation je Lane:** Jede Welle ist eine Gruppe über alle Lanes (`S.forms` enthält jetzt Gruppen). Die älteste Gruppe einer Seite ist die Armee;
    fällt sie ganz, übernimmt die nächste vorhandene Gruppe, sonst die nächste Welle ab dem Tor.
23. **Kontaktreichweite = Nahkampf-Kontakt (14):** Die Armee hält, sobald die Front auf 14 an einen Gegner, die Mauer oder die Basis heranrückt. Bei einem
    größeren Wert stünde die Armee außerhalb der Nahkampfreichweite still. Fernkämpfer schießen auch im Marsch auf alles in Reichweite.
    Hysterese 16: Kampf endet erst, wenn nichts mehr innerhalb von 30 ist.
24. **„Gegner in der eigenen Lane“** heißt: die Heimat-Lane ist im Kampfbereich (Gegner, Mauer oder Basis innerhalb 30 von der Front). Einheiten ohne Kampf
    in der Heimat-Lane gehen in die kämpfende Lane: Mitte zuerst; sonst die mit den meisten Gegnern im Kampfbereich der Front (Tiefe: fünf Reihen);
    bei Gleichstand die obere.
25. **Ausnahme Mitte** wird ausgelöst, wenn die letzte Einheit mit **Heimat** Mitte fällt (nicht, wenn Einheiten die Mitte verlassen, um zu helfen; sonst
    entstünde eine Schleife zwischen Nachrücken und Helfen). Abgegeben wird je Schritt die hinterste Einheit der volleren äußeren Lane; Nahkämpfer
    vor Fernkämpfern über beide Lanes hinweg.
26. **Nachschub** steht, wenn er die Armee erreicht, eine Reihe hinter deren letzter Reihe und verschmilzt dort. Jede Einheit geht einzeln in die dann
    schwächste Lane (nach Heimat gezählt); Gleichstand mit der Mitte → Mitte, sonst → oben. Mit „Alles auf die Mitte“ bleibt alles in der Mitte.
27. **Aufstellung der eigenen Welle:** am Tor (bzw. Vorposten), aber nie vor dem vordersten Gegner in irgendeiner Lane (vorher je Lane).
28. **Gegnerische Wellen** rücken als eine Gruppe aus; Nachzügler aus der Warteschlange (Feldgrenze, Belagerung, Notaufgebot) als eigene kleine Gruppen,
    die als Nachschub zur gegnerischen Armee aufschließen.
29. **Leistung:** Reihen werden nur neu gebildet, wenn sich Lanes oder Bestand ändern; im Marsch rücken die Einheiten mit ihrer Front. Der Lane-Index wird
    einmal je Tick für beide Seiten gebaut.
30. **Forschung wirkt dauerhaft**, auch wenn die Universität später abgerissen wird (anders als Gebäude-Upgrades, REQ-01.8). Laufende Forschung ruht ohne
    Universität und läuft nach dem Neubau weiter. Begründung: Forschung ist Wissen, kein Ausbau des Gebäudes.
31. **Neu ziehen** gilt je Kartenwahl (Zähler je offener Wahl); **Bann** gilt für die ganze Partie: Die gebannte Karte verlässt den Pool, an ihre Stelle im
    aktuellen Angebot tritt eine neu gezogene. Beides nur mit offener Kartenwahl im Reiter Karten.
32. **Glücksgriff** verschiebt Ziehgewicht von gewöhnlichen zu seltenen Karten (70/25/5 → 60/35/5 bzw. 50/45/5); legendäre bleiben bei 5.
33. **Metallurgie** erhöht den Ertrag der Fabriken, nicht Klicks und Presse („Materialertrag“ als automatischer Ertrag gelesen).
34. **Ingenieurwesen** senkt die Kosten aller Gebäude einschließlich Fabriken.
35. **Schmiede-Ausbau:** Die Qualitätsstufe der Schmiede hat keine Obergrenze, eine „weitere Ausbaustufe“ gäbe es also schon. Umgesetzt als stärkere
    Stufen: jede Qualitätsstufe wirkt 2 Prozentpunkte mehr (5 % → 7 % je Stufe).
36. **Voraussetzungen im Zweig D:** Schildträger braucht Drill I, Zweiter Forschungsplatz braucht Logistik I, Schmiede-Ausbau braucht Metallurgie I.
37. **Schildträger** (Taste 3): 110 LP, 3 Schaden, Tempo 24 statt 34, 40 Material. Nur für den Spieler (keine neuen Gegnertypen). Die Armee geht im Tempo
    der langsamsten Einheit; ein Schildträger bremst also die ganze Armee.
38. **Bots und Forschung:** Die gierige Heuristik prüft höchstens alle 10 s die vier günstigsten bezahlbaren Forschungen per Vorausschau (120 s bzw. bis nach
    der Belagerungswelle) gegen „nichts erforschen“ und startet nur bei klarem Vorteil; die Zufallsstrategie forscht zufällig; „passiv“ forscht nicht.
    Neu ziehen und Bann nutzen die Bots nicht.
39. **Vorrang der Mitte im Armeemodell:** Einheiten, die in der Mitte stehen, wechseln in eine äußere kämpfende Lane nur, wenn dort schon eigene Einheiten
    im Kampfbereich stehen; sonst halten sie die Mitte, und der Gegner kommt zu ihnen (dessen Einheiten haben in ihrer Lane keinen Gegner und helfen
    der Mitte). Das ist die Regel aus I4.3, die REQ-5.06 ausdrücklich beibehält; ohne sie tauschten zwei Armeen endlos die Lanes (Patt, siehe I5.7).
40. **„101 %“ (REQ-5.08):** Die Spalte „nie/Dauer“ teilt die Siegquote von „nie klicken“ durch die von „Dauerklick“; über 100 % heißt, dass
    „nie klicken“ in der Stichprobe öfter gewann. Kein Rechenfehler, aber eine irreführende Darstellung. Behoben durch Anzeige beider Quoten
    samt Median-Siegzeit. Der Zielwert „nie/Dauer ≤ 50 %“ bleibt als Verhältnis bestehen.
41. **Anteil der EP-Automatik (REQ-5.08):** gemessen als EP aus dem Hörsaal geteilt durch alle EP (Hörsaal plus Abschüsse), Normal, aktiv.
    Die Bots erforschen den Hörsaal selten (42 von 1.180 Partien mit Universität), der gemessene Anteil ist deshalb 0 %. Die Simulation weist
    zusätzlich den rechnerischen Anteil von Hörsaal III am Abschuss-Ertrag eines aktiven Spielers aus; er ist die belastbare Kennzahl.
42. **Profilabstand Leicht aktiv ↔ gelegentlich** als Differenz der Median-Siegzeiten.
43. **Forschungen gegen +25 pp:** Vergleich „erforscht“ gegen „nicht erforscht“ in Partien mit Universität. Alle Forschungen liegen bei −27 bis
    −73 pp. Das ist eine Verzerrung durch die Partiedauer (wer lange spielt, forscht mehr; lange Partien gehen eher verloren), kein Befund über
    die Stärke. Ein fairer Vergleich bräuchte „bezahlbar und nicht erforscht“ je Zeitpunkt, analog zu den Karten; offen.
44. **Experiment „Schwung“:** Jeder Klick lädt einen Speicher um 0,01, der mit 20 s Zeitkonstante abklingt; die Automatik (Fabriken, Presse)
    erhält den Speicherstand als Bonus, höchstens +50 %. Drei Klicks je Sekunde halten den Höchstwert. Die Klickausbeute selbst bleibt unverändert.
45. **Sitzungsprotokoll:** Der Knopf „Protokoll“ erscheint nur mit `?debug=1` oben rechts. Das Protokoll umhüllt die öffentlichen Aktionen der
    Spiellogik und ändert das Spiel nicht. „Größte Armee“ zählt Einheiten auf dem Feld und in der Warteschlange; „Reaktionsintervall“ ist der
    Median der Abstände zwischen zwei Handlungen (Klicks auf das Klickfeld zählen nicht als Handlung).
46. **Bot im Browser** (`tools/browser-bot.js`): vereinfachter Bot ohne Vorausschau, der die Profilparameter aus `tools/sim-bot.mjs` nutzt. Er
    dient dem Durchlauftest und der Protokollprüfung; für Balancing gilt weiter die Simulation. Der Durchlauftest beschleunigt nicht über
    `KF_OVERRIDE` (Abweichung vom Wortlaut), sondern rechnet je Schritt 20 s Spielzeit mit unveränderten Werten und lässt die Seite dazwischen
    zeichnen; so läuft die echte Partie in wenigen Sekunden durch, und die Konsole prüft trotzdem Oberfläche und Zeichnen.
47. **Schwebende Zahlen** zeigen den Material- und EP-Gewinn der letzten Sekunde, je Quelle höchstens eine je Sekunde, nicht bei reduzierter Bewegung.
    Gefallene Einheiten verblassen 0,6 s. Zähler in der Leiste haben feste Breiten (Ziffern gleicher Breite).

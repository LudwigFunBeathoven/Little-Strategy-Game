# Klammerfront – Bericht Iteration 5 (v0.6)

Stand: 29.09.2026 · Branch `iteration-5` (zehn Commits `I5.0`–`I5.9` auf `main`, Fast-Forward möglich) · Zielgruppe: Entwickler und PO

## Kurzfassung
Bedienung, Kampf und Fortschritt sind umgebaut: Klicks gehen nicht mehr verloren (Ursache belegt und behoben), die Oberfläche hat drei Bänder,
jede Einheit kämpft einzeln, die Armee rückt als gemeinsame Welle vor, und die Universität hat einen Forschungsbaum. Die Abnahmeserie
(6.000 Partien, 0 Patts) trifft 23 von 27 Zielwerten; verfehlt sind Schwer „durchschnitt“, drei Karten über +25 pp, „nie klicken“ auf Leicht
und Normal sowie die Wahlraten von sieben Karten, außerdem das Leistungsziel für die Tick-Zeit. Wichtigster Befund: Ein einfacher Bot ohne Vorausschau schlägt die gierige Heuristik der Simulation deutlich
(Schwer 100 % nach 6:09 statt 50 % nach 11:00); die Kalibrierung ist deshalb nur so gut wie dieser Bot, und ein Spieltest mit Menschen sollte
vor weiterem Balancing stehen.

## 1. Zeitleiste
| Commit | Inkrement | Inhalt |
|---|---|---|
| `cb8712e` | I5.0 | `main` per Fast-Forward auf v0.5 (`42aad39`), Branch `iteration-5`, Basislinie (Serie, Bildzeit, Tick-Zeit, Eingabelatenz) |
| `5bb91bb` | I5.1 | Eingabe: Knöpfe bleiben beim Aktualisieren erhalten, Klickfeld auf `pointerdown`, eine Umrechnung Bildschirm → Welt |
| `17f9e4c` | I5.2 | Erfahrungspunkte (EP) statt Altmetall, auch im Code; Spielstand-Version 6 mit Hinweis |
| `5884d23` | I5.3 | Drei Bänder, `ui.js` aufgeteilt in `ui`/`render`/`hud`/`panels`, Kartenwahl im Reiter |
| `c1fb292` | I5.4 | Bauen in zwei Klicks aus Welt oder Knopfraster, vollständig per Tastatur |
| `c2d41db` | I5.5 | Einzelsimulation: Ziel und Abklingzeit je Einheit, gleichzeitige Auflösung, Türme mit Einzelzielen |
| `51cdf90` | I5.6 | Armee als gemeinsame Welle: Marsch, Kampf, Sammeln, Nachschub, Ausnahme Mitte; Gegner mit derselben Logik |
| `e8728ac` | I5.7 | Universität mit 13 Forschungen in vier Zweigen, Schildträger; Patt durch Lane-Tausch behoben |
| I5.8 | I5.8 | Balancing-Serie mit 200 Partien je Feld, Experiment „Schwung“ |
| I5.9 | I5.9 | Polish, Sitzungsprotokoll, Durchlauftest, Testleitfaden, Gegenprobe mit einfachem Bot, dieser Bericht |

## 2. Architektur
| Datei | Zeilen | Rolle |
|---|---|---|
| `config.js` | 215 | Alle Zahlen; neu `ARMY`, `UI`, `EXPERIMENT`, `MOMENTUM` |
| `data/draft-options.js` | 123 | 41 Spezialkarten |
| `data/research.js` | 62 | Forschungsbaum, deklarativ; Wirkungen über dieselbe Pipeline wie Karten (`mods()`) |
| `core.js` | 984 | Spiellogik ohne DOM (v0.5: 788) |
| `ui.js` | 655 | Gemeinsame Namen, Tooltips, Eingabe, Speichern, Dialoge, Hauptschleife (v0.5: 1.117 für alles) |
| `render.js` | 285 | Canvas, Kamera, `screenToWorld`/`worldToScreen` |
| `hud.js` | 96 | Ressourcenleiste |
| `panels.js` | 441 | Arbeitsbereich: Klickfeld, Reiter, Kontextkopf, Kartenwahl, Forschung |
| `session.js` | 83 | Sitzungsprotokoll (`?debug=1`) |
| `tools/` | 669 | Simulation, Bots, `bench-tick.mjs`, `compare-human.mjs`, `browser-bot.js`, `einfach-bot.mjs` |
| `tests/` | 1.941 | 16 Testdateien (109 Tests) und `browser-check.mjs` (180 Prüfpunkte) |

Ladereihenfolge der klassischen Skripte (gemeinsamer globaler Gültigkeitsbereich, kein Build): `config`, `i18n`, `data`, `hints`, `core`, `ui`,
`render`, `hud`, `panels`, `session`; gestartet wird nach `DOMContentLoaded`.

**Invarianten**, alle durch Tests abgesichert: `core.js` ohne DOM; Zufall nur über `S.rng`; keine Regelzahlen außerhalb von `config.js`/`data/`;
keine sichtbaren Texte außerhalb von `i18n/`; Spielstand azyklisches JSON (Ziele der Einheiten liegen als Ids in einer Map außerhalb des Spielstands);
jedes interaktive Element mit `data-tooltip` und Erklärzeile; `SAVE_VERSION` 6.

**Oberfläche:** Die Seite aktualisiert höchstens einmal je Bild (`requestRender`). Schreibende Hilfen (`setText`, `setHidden`, `setDis`, `setWidth`)
ändern das DOM nur bei geänderten Werten; Knöpfe werden nur neu gebaut, wenn sich Auswahl oder Optionsmenge ändern. Das war die Ursache der
verlorenen Klicks (STAND, „Befund REQ-5.01“).

**Kampf je Tick:** Produktion → Wellen ausrücken → Armeezustand je Gruppe (Marsch/Kampf/Sammeln, Lane je Einheit, Bewegung, Verschmelzen) →
Lane-Index beider Seiten (nach x sortiert) → Ziele aller Einheiten und Türme aus dem Zustand zu Tickbeginn → alle Treffer gemeinsam anwenden →
Verluste, EP, Ausnahme Mitte.

## 3. Mechanik
| Bereich | v0.5 | v0.6 |
|---|---|---|
| Kampf | ganze vorderste Reihe plus Fernkämpfer-Reihen | jede Einheit mit eigenem Ziel (nächster Gegner in Reichweite, Gleichstand niedrigste Id), gleichzeitige Auflösung |
| Truppen | Formation je Welle und Lane | eine Armee je Seite über alle Lanes; hält bei jedem Kontakt, sammelt sich danach; Nachschub schließt auf |
| Fortschritt | Karten | Karten plus Forschung (Material und Zeit, eine gleichzeitig, mit Logistik II zwei) |
| Einheiten | Läufer, Werfer | plus Schildträger (Forschung), bremst die Armee |
| Bedienung | Seitenleiste mit Kontextfeld | drei Bänder, Reiter, Knopfraster, zwei Klicks je Bau, Tastatur |
| Begriffe | Altmetall | Erfahrungspunkte (EP) |

## 4. Qualitätssicherung
- `npm test`: 109 Tests (v0.5: 83). Neu u. a. `single.test.mjs` (Einzelsimulation), `army.test.mjs`, `research.test.mjs`, `naming.test.mjs`
  (Suchtest nach „Altmetall“), `momentum.test.mjs`.
- `npm run test:browser`: 180 Prüfpunkte (v0.5: 62). Neu: Bänder bei vier Auflösungen ohne Dokument-Scroll, Kontextwechsel je Gebäude,
  Zwei-Klick-Bau aus Welt und Raster, Bau per Tastatur, Klicks mit 120 ms Haltedauer, 100 Weltklicks mit Kamera und Zittern bei devicePixelRatio 1
  und 2, Eingabelatenz, Kartenwahl im Reiter, Hinweis bei altem Spielstand, Sitzungsprotokoll je Profil mit Zuordnung durch `compare-human.mjs`
  (4 von 4 richtig), Durchlauftest Leicht/Normal/Schwer bis Partieende ohne Konsolenfehler.
- Eingabe (REQ-5.01): Bau-Option und „Läufer“ mit 120 ms Haltedauer 4/4 und 10/10 (v0.5: 0/4 und 0/10). Latenz Klickfeld bis DOM-Änderung Median
  14–15 ms, Welt-Klick bis nächstes Bild 12–14 ms (ein Bild).
- Leistung (REQ-5.09): Bildzeit mit 60 Einheiten 0,30 ms (1280×720) und 0,60 ms (1920×1080), Basislinie 0,30/0,70 ms. Tick-Zeit siehe §7.
- Bildschirmfotos: `reports/screens/i5-layout-*.png` (vier Auflösungen), `reports/screens/i5-armee-marsch-1280x720.png`.

## 5. Kennzahlen im Vergleich (Abnahmeserie, 200 Partien je Feld, gierige Heuristik)
Median Sieg · Siegquote. Basis = v0.5 (I5.0, 50 je Feld). Rohdaten `reports/i5-ziele.*`.

| Schwierigkeit | Spielertyp | Soll | v0.5 | v0.6 | |
|---|---|---|---|---|---|
| Leicht | aktiv | 5–7 min | 5:28 · 100 % | 6:16 · 100 % | ✔ |
| Leicht | durchschnitt | 6–9 min | 6:09 · 100 % | 8:58 · 100 % | ✔ |
| Leicht | gelegentlich | Sieg, 10–18 min | 7:32 · 100 % | 11:39 · 99 % | ✔ |
| Leicht | passiv | darf verlieren | 0 % | 1 % | ✔ |
| Normal | aktiv | 6–9 min | 6:51 · 92 % | 6:44 · 89 % | ✔ |
| Normal | durchschnitt | 9–13 min | 10:04 · 86 % | 9:53 · 66 % | ✔ |
| Normal | gelegentlich | darf verlieren | 11:28 · 42 % | 9:53 · 21 % | ✔ |
| Normal | passiv | verliert | 0 % | 0 % | ✔ |
| Schwer | aktiv | 8–12 min | 8:59 · 84 % | 11:00 · 50 % | ✔ |
| Schwer | durchschnitt | 13–20 min | 10:23 · 52 % | 9:25 · 28 % | ✘ |
| Schwer | gelegentlich | verliert (≤ 5 %) | 26 % | 0,5 % | ✔ |
| Schwer | passiv | verliert | 0 % | 0 % | ✔ |

| Kennzahl | Soll | v0.6 | |
|---|---|---|---|
| Patt-Quote | ≤ 2 % | 0 von 6.000 | ✔ |
| „verteidigung“ | gewinnt nie, verliert bis Minute 25 | 0 %, spätestens 23:03 | ✔ |
| „aktiv“ ≥ „durchschnitt“ (Siegquote) | je Schwierigkeit | 100/100, 89/66, 50/28 | ✔ |
| **Profilabstand Leicht aktiv ↔ gelegentlich** | ≥ 4 min | 5:23 (v0.5: 2:04) | ✔ |
| **Anteil EP-Automatik** (Normal, aktiv) | ≤ 25 % | gemessen 0 %; Hörsaal III rechnerisch 25 % | ✔ (knapp) |
| **Zeitanteil der Armee im Kampf** | berichten | 63 % | – |
| Ohne Schmiede, Normal | ≥ 30 % | 34 % | ✔ |
| Karten über +25 pp | keine | 3: Alles auf die Mitte +38, Dauerauftrag +34, Söldnerheer +32 | ✘ |
| Forschungen über +25 pp | keine | keine (alle negativ, verzerrt, Auslegung 43) | ✔ |
| Klickanteil Früh/Mitte/Spät | ≥ 50 / 10–30 / ≤ 3 % | 61–65 / 23–26 / 1–2 % | ✔ |
| Stopp/Dauer | ≥ 95 % | 99 / 110 / 95 % | ✔ |
| nie/Dauer (Verhältnis der Siegquoten) | ≤ 50 % | Leicht 101 %, Normal 75 %, Schwer 0 % | ✘ |
| Erster Draft | 60–90 s | 85 s | ✔ |
| Draft-Abstand je Phase | 45–150 s | 49 / 54 / 123 s | ✔ |
| Draft-Wahlrate je Option | 5–60 % | 7 Karten außerhalb (s. u.) | ✘ |
| Universität gebaut (Normal, gierig) | ≥ 40 % | 100 % | ✔ |

Draft-Wahlraten außerhalb: Schwere Pressen 76 %, Großauftrag 66 %, Doppelschicht 63 %, Bessere Fabriken 61 %, Zinnen 4 %,
Alles auf die Mitte 89 % (9 Angebote). Wirtschaftskarten werden von der gierigen Heuristik bevorzugt (51 % gegen 27 % bei Basis).

**Hebel (REQ-5.08) in der vorgegebenen Reihenfolge** – Einzelheiten und Zwischenrunden in `docs/STAND.md`, I5.8:
1. Automatik: Hörsaal 0,25/0,6/1,1 → 0,1/0,25/0,4 EP/s. Presse unverändert.
2. Große Armee, Söldnerheer: nicht geändert. Große Armee liegt nach dem Armeemodell bei +7 pp (v0.5: +38); Söldnerheer wurde nur in 10 Partien gewählt.
3. Gegnerstärke: Basis 26.000/26.000/46.000 (v0.5: 11.000/13.000/15.000); Schwer Grundwelle 3,5, Schadenszuwachs 0,07, EP-Faktor 1,8; `XP_GROWTH` 1,55.
4. Experiment „Schwung“: unten.

**Experiment „Schwung“** (`EXPERIMENT.momentum`, standardmäßig aus; 50 Partien je Feld, `reports/i5-experiment-schwung.*`):

| Feld | aus (200 je Feld) | an (50 je Feld) |
|---|---|---|
| Leicht aktiv / gelegentlich | 6:16 / 11:39 → Abstand 5:23 | 8:18 / 11:01 → Abstand 2:43 |
| Normal aktiv | 89 % · 6:44 | 100 % · 9:38 |
| Normal gelegentlich | 21 % | 8 % |
| Schwer aktiv | 50 % · 11:00 | 58 % · 12:18 |
| Schwer gelegentlich | 0,5 % | 6 % |

Schwung vergrößert den Abstand der Siegquoten auf Normal, verlängert aber alle Siege der Bots um 1–3 Minuten und halbiert den Zeitabstand auf Leicht;
Schwer „gelegentlich“ reißt die 5-%-Grenze. **Empfehlung: nicht einführen.** Die längeren Partien sind ein Artefakt der Heuristik (mehr Material
fließt in Wirtschaft statt in die Armee, siehe §6), sagen also wenig über Menschen. Frühestens nach dem Spieltest erneut prüfen.

## 6. Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die gierige Heuristik ist schwach.** Der einfache Bot aus dem Durchlauftest (`tools/browser-bot.js`: feste Bauordnung, stets Einheiten bis zum
   Limit, erste Karte, keine Vorausschau) gewinnt mit denselben Profilwerten fast alles schneller (`tools/einfach-bot.mjs`, 50 je Feld,
   `reports/i5-einfacher-bot.txt`):

   | Profil | Leicht | Normal | Schwer |
   |---|---|---|---|
   | aktiv | 100 % · 5:13 | 100 % · 5:17 | 100 % · 6:09 |
   | durchschnitt | 100 % · 6:01 | 100 % · 6:22 | 100 % · 7:10 |
   | gelegentlich | 100 % · 7:30 | 96 % · 7:29 | 12 % · 8:50 |
   | passiv | 0 % | 0 % | 0 % |

   Die Korridore sind gegen die gierige Heuristik kalibriert. Ein Mensch, der einfach laufend Einheiten schickt, dürfte Schwer in 6–7 Minuten
   gewinnen. Das Problem bestand vermutlich schon früher, fällt aber erst jetzt auf, weil es vorher keinen zweiten Bot gab. Derselbe Effekt erklärt
   zwei weitere Befunde: Mehr Klicks machen die Heuristik langsamer (Leicht „nie klicken“ 7:19 gegen „Dauerklick“ 9:55), und „Schwung“ verlängert die
   Partien. Mehr Material fließt bei der Heuristik in Wirtschaft, die Armee kommt später.
2. **Schwer ist für langsame Starter sehr hart:** „gelegentlich“ und „passiv“ verlieren im Median nach 1:29 bzw. 1:27, weil die Grundwelle (3,5) das Tor
   vor der ersten Verteidigung erreicht. Das erfüllt „verliert“, fühlt sich für Menschen aber wie ein Absturz an.
3. **„nie klicken“ gewinnt auf Leicht so oft wie „Dauerklick“** (100 % gegen 99 %). Ursache: kostenlose erste Fabrik (REQ-44) plus Automatik reichen auf
   Leicht; dazu der Heuristik-Effekt aus Punkt 1. Ein Widerspruch zwischen REQ-44 und „Aktive belohnen“, den nur der PO auflösen kann.
4. **Drei Karten über +25 pp:** Dauerauftrag +34 pp mit belastbarer Stichprobe (165/124); Alles auf die Mitte (46/9) und Söldnerheer (10/48) mit
   kleinen Vergleichsgruppen. Dauerauftrag kauft automatisch Einheiten nach und behebt damit genau die Schwäche der Heuristik (Punkt 1).
5. **Forschungsvergleich verzerrt:** Alle Forschungen liegen bei −27 bis −73 pp, weil lange (eher verlorene) Partien mehr Forschung enthalten.
   Die Bots erforschen den Hörsaal kaum (42 von 1.180 Partien), daher der gemessene EP-Automatik-Anteil von 0 %.
6. Die Armee steht 63 % der Zeit im Kampf (v0.5 ohne Zustand). Partien dauern damit nicht länger; der Zeitanteil ist eine Beobachtung, kein Problem.

## 7. Fehler, die durchgerutscht sind
- **Basislinie der Tick-Zeit zu hoch gemessen.** Der I5.0-Wert (0,09–0,11 ms) entstand parallel zu einer Simulation. Im direkten Wechsel mit v0.5
  auf derselben Maschine: v0.5 0,065 ms, v0.6 0,10 ms Median (**+50 %, Soll ≤ +20 % verfehlt**), p95 +10–40 %. Die Vergleiche in I5.5 und I5.6
  waren deshalb zu günstig. Ursache: Jede Einheit sucht ihr Ziel selbst (REQ-5.05). Drei Optimierungen in I5.9 (kein Hilfsobjekt je Zielsuche,
  ein Lane-Index je Tick, Aufräumen nur nach Verlusten) änderten das Ergebnis nicht (Kurzsimulation identisch) und die Zeit kaum. Absolut sind es
  2 ms Rechenzeit je Sekunde Spielzeit bei 120 Einheiten.
- **Patt durch Lane-Tausch** (I5.7, Seed 1246065): zwei Armeen in verschiedenen Lanes liefen einander hinterher. Behoben mit dem Vorrang der Mitte aus
  I4.3, den das neue Armeemodell zunächst nicht übernommen hatte. Seitdem gibt die Simulation offene Partien mit Seed aus.
- **Rechenzeit der Simulation** stieg mit der Forschungs-Vorausschau auf das 19-Fache; behoben durch Rückstellung nach Ablehnung (60 s, verdoppelnd bis 240 s).

## 8. Technische Schulden und Risiken
- Zwei Bot-Implementierungen (`sim-bot.mjs` mit Vorausschau, `browser-bot.js` ohne) mit stark unterschiedlicher Stärke. Die Balancing-Werkzeuge
  sollten die stärkere Spielweise abdecken, sonst kalibrieren sie gegen einen Strohmann.
- Forschungsvergleich braucht einen fairen Vergleichswert („bezahlbar und nicht erforscht“), analog zu den Karten.
- Tick-Zeit: Soll relativ zu v0.5 ist mit Einzelsimulation nicht erreichbar, ohne das Modell zu vereinfachen. Vorschlag: absolutes Soll (≤ 1 ms bei 2 × 60 Einheiten).
- `ui.js` ist mit 655 Zeilen weiter die größte Oberflächendatei (Tooltips, Eingabe, Speichern, Dialoge).
- Die Abnahmeserie (6.000 Partien) braucht auf vier Kernen rund 45 Minuten; die Vorausschau der Heuristik dominiert.

## 9. Offen für den Product Owner
1. **Wie weiter mit dem Balancing?** Empfehlung: erst Spieltest mit Menschen nach `docs/testleitfaden-iteration-5.md` (Protokolle zeigen, ob Menschen
   eher wie der einfache Bot oder wie die Heuristik spielen), dann die Heuristik um „Einheiten zuerst“ ergänzen und neu kalibrieren.
   Die Alternative, jetzt gegen den einfachen Bot nachzuschärfen, würde Schwer deutlich schwerer machen, ohne Daten von Menschen.
2. **Experiment „Schwung“:** Empfehlung, nicht einführen (§5).
3. **Dauerauftrag, Söldnerheer, Alles auf die Mitte** über +25 pp: abschwächen oder beobachten? Vorschlag: Dauerauftrag beobachten, bis die Heuristik
   repariert ist (die Karte gleicht deren Schwäche aus).
4. **Schwer, früher Verlust nach 1:30:** Grundwelle später einsetzen (z. B. erste Welle Schwer wie Normal, danach 3,5)?
5. **„nie klicken“ auf Leicht:** Soll Klicken auf Leicht spürbar mehr bringen (dann erste Fabrik nicht mehr kostenlos oder Automatik später)?
6. **Tick-Zeit:** Soll auf einen absoluten Wert umstellen (Vorschlag ≤ 1 ms)?
7. Aus Iteration 4 weiter offen: Freigabe der Kartenliste; Handelskontor (gebaut in 5–11 % der Partien, Streichkandidat nach dem Spieltest).
   Erledigt: Tastaturzugang zu Bauplätzen (I5.4), Große Armee (+7 pp).
8. **Merge nach `main`:** `iteration-5` ist per Fast-Forward übernehmbar; wartet auf Freigabe.

Zu bestätigende Auslegungen (vollständige Liste 1–47 in `docs/STAND.md`): Weitschuss gibt +20 % Fernkampfschaden statt einer Reihenregel (5);
Forschung wirkt nach Abriss der Universität weiter (30); Durchlauftest ohne `KF_OVERRIDE`, mit unveränderten Werten im Schnelldurchlauf (46);
„101 %“ als Verhältnis zweier Siegquoten (40); EP-Automatik rechnerisch über Hörsaal III (41).

## Quellen
`docs/anforderungen-iteration-5.md`, `docs/STAND.md`, `docs/testleitfaden-iteration-5.md`, `CHANGELOG.md`.
Rohdaten: `reports/i5-basis-ziele.*` (Basislinie), `reports/i5-ziele.*` (3.000), `reports/i5-phasen.*` (1.800), `reports/i5-strategie.*` (300),
`reports/i5-ohneSchmiede.*` (100), `reports/i5-experiment-schwung.*` (600), `reports/i5-einfacher-bot.txt` (600), Zwischenrunden
`reports/i5-8-*`, Sitzungsprotokolle der Bot-Partien `reports/protokolle/`.

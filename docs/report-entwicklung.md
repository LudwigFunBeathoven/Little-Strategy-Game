# Klammerfront – Entwicklungsreport v0.1 bis v0.5

Stand: 29.09.2026 · Branch `3x3-und-3-Lanes-Spiel` (Commit `36a71ee`) · Zielgruppe: Entwickler

## Kurzfassung
Klammerfront ist in drei Tagen von einem Einzeldatei-Prototyp (v0.1) zu einem modularen Browser-Spiel ohne Build-Schritt gewachsen:
5.100 Zeilen, 83 Logiktests, eine Playwright-Prüfung mit 62 Prüfpunkten und eine Bot-Simulation, die je Abnahme mehrere tausend Partien spielt.
Die Architektur hat die drei Umbauten des Kampfsystems (Einzel-Lane → drei Lanes → Formationen mit Lane-Wechsel) ohne Neuschreiben getragen,
weil Spiellogik, Zahlen, Texte und Oberfläche von Anfang an getrennt waren. Die offenen Probleme liegen im Balancing, nicht im Code:
Die Spielertypen unterscheiden sich in der Simulation zu wenig, und seit Iteration 2 verfehlen dieselben zwei bis drei Zielkorridore.

## 1. Zeitleiste
| Version | Iteration | Datum | Commits | Kern der Änderung |
|---|---|---|---|---|
| v0.1 | – | 27.09. | vor Git | Einzeldatei: Klick-Ökonomie, eine Lane, Läufer und Werfer, Speichern, Offline-Fortschritt |
| v0.2 | – | 27.09. | `b25a9b3` (Ausgangsstand) | Drei Bauplätze, Mauer/Turm, drei Schwierigkeitsgrade, Warteschlange |
| v0.3 | 2 | 28.09. | `REQ-0x` je Anforderung, eigene Branches mit Merge | Sprachen, Tooltips, Bauplätze als Wahl, Altmetall-Stufen mit Draft, Spielphasen; Aufteilung in Module |
| v0.4 | 3 | 28.09. | `I3.1`–`I3.7`, linear | Drei Lanes, Wellen mit Versorgungslimit, 3×3-Raster, Kartenstufen, Belagerungswelle, Erklärzeilen |
| v0.5 | 4 | 29.09. | `I4.0`–`I4.8`, linear | Formationen, Lane-übergreifender Kampf, Automatik, 41 Karten, scrollbare Spielwelt, Einführung |

`main` steht auf v0.3 (`306878c`) und ist Vorfahr des Branches; der Merge ist ein Fast-Forward ohne Konflikte.
Iteration 2 wurde außerhalb dieses Repositories mit einem Branch je Anforderung entwickelt und als Zip übernommen; seit Iteration 3 gilt ein
Commit je Inkrement auf einem Branch, jedes Inkrement spielbar (Kriterien in `CLAUDE.md`, „Arbeitsweise in Inkrementen“).

## 2. Architektur heute
| Datei | Zeilen | Rolle |
|---|---|---|
| `config.js` | 187 | Alle Zahlen: Balancing, Regeln, Zeiten, Schwierigkeitsgrade |
| `data/draft-options.js` | 123 | 41 Spezialkarten, deklarativ (`tiers`, `effect`, `category`, `rarity`, `synergy`) |
| `core.js` | 788 | Spiellogik, ohne DOM; läuft identisch im Browser, in Tests und im Simulator |
| `ui.js` | 1.117 | DOM, Canvas, Kamera, Eingabe, Tooltips, Dialoge, Speichern |
| `hints.js` | 31 | Erstkontakt-Hinweise; Speicher wird injiziert |
| `i18n/de.js`, `i18n/en.js` | je 370 | Alle sichtbaren Texte, identische Schlüssel |
| `tools/` | 475 | Loader (`load-core.mjs`), Bots (`sim-bot.mjs`), Simulation mit Worker-Threads (`simulate.mjs`) |
| `tests/` | 1.269 | 12 Testdateien für `node --test`, dazu `browser-check.mjs` (Playwright) |

**Invarianten**, die jede Iteration gehalten hat und die Tests absichern:
- `core.js` greift nicht auf `document`, `window` oder `localStorage` zu. Der Loader lädt `config.js`, Karten und `core.js` in einen `vm`-Kontext;
  `KF_OVERRIDE` überschreibt Konfigurationswerte für Versuche ohne Dateiänderung.
- Zufall nur über den seedbaren Generator im Spielstand (`S.rng`). Gleicher Seed, gleiche Partie; Vorschau und tatsächliche Gegnerwelle sind identisch (Test).
- Keine Regelzahlen in `core.js`/`ui.js`, keine sichtbaren Texte außerhalb von `i18n/` (Tests prüfen beides).
- Spielstand ist reines JSON mit Versionsnummer (`SAVE_VERSION` = 5, `SAVE_KEY` v5). Transiente Kampfdaten (vorderste Reihe, Ziel einer Formation)
  liegen in Closure-Maps, nicht im Spielstand, damit Schnappschüsse azyklisch bleiben. Die Bots nutzen dieselben Schnappschüsse für ihre Vorausschau.
- Jedes interaktive Element hat `data-tooltip`, jeder Knopf eine Erklärzeile; `__kf.tooltipAudit()` und `__kf.explAudit()` prüfen das im Browser.

**Ablauf je Tick** (`core.tick`, feste Schrittweite `TICK_S`): Produktion und Automatik → eigene und gegnerische Wellen ausrücken →
Formationen bewegen, Lane wählen, verschmelzen → Kampf (vorderste Reihe plus Fernkämpfer) → Türme → Basis/Abschnitte → Altmetall, Stufen, Draft →
Freischaltungen. Die Oberfläche liest nur `G.S` und ruft Aktionen (`build`, `spawn`, `chooseDraft` …) auf.

## 3. Entwicklung der Mechanik
| Bereich | v0.2 | v0.3 (It. 2) | v0.4 (It. 3) | v0.5 (It. 4) |
|---|---|---|---|---|
| Schlachtfeld | eine Lane | eine Lane | drei Lanes, feste Kolonne je Lane | Formationen (Reihen ≤ 5), Unterstützung der Nachbar-Lane |
| Kampf | vorderste Einheit | vorderste Einheit | vorderste Nahkampfeinheit, Fernkämpfer mit ≤ 1 Einheit vor sich | ganze vorderste Reihe plus Fernkämpfer-Reihen |
| Eigene Truppen | Einzelkauf | Einzelkauf | Wellen alle 20 s, Versorgungslimit, Befehl „Halten“ | eigener Wellentakt, Limit bis 15, „Halten“ entfernt |
| Wirtschaft | Fertiger | Phasen, Klickdeckel | Fabriken im 3×3-Raster | automatische Presse ab Phase Mitte, erste Fabrik kostenlos |
| Fortschritt | Zeitalter | Altmetall-Stufen mit Draft (12 Optionen) | Karten mit Stufen I–III (18 Karten) | 41 Karten, Kategorien, Seltenheit, Synergien |
| Druck gegen Patts | – | Tor belagert, Eskalation ab Min. 16 | Belagerungswelle Min. 16, linearer Zuwachs, 3 Zusatzregeln | 2 Zusatzregeln entfernt, Reparatur-Abklingzeit bleibt |
| Oberfläche | eine Seite | Sprachen, Tooltips | Erklärzeilen, Hinweise | Spielwelt mit Kamera, Reich in Draufsicht, Seitenleiste mit Kontextfeld, Einführung |

## 4. Qualitätssicherung
| | v0.3 | v0.4 | v0.5 |
|---|---|---|---|
| Logiktests (`npm test`) | 20 | 53 | 83 |
| Browser-Prüfung | Start, Tooltips, Sprachen | + Erklärzeilen, Hinweise | + Layout bei 1280×720 und 1920×1080, alle Scrollwege, Kontextfeld, Einführung, Bildzeit |
| Abnahmeserie | 2.700 Partien | 3.800 | 5.650 |

Die Simulation ist das eigentliche Balancing-Werkzeug. Bots spielen mit fünf Profilen (aktiv, durchschnitt, gelegentlich, passiv, verteidigung),
die sich in Klicks/s, Reaktionsintervall, Einheitenlimit und Mauernutzung unterscheiden. Die Strategie „gierig“ bewertet Karten, Gebäude und Abrisse
per Vorausschau auf einer Kopie des Spielstands (45 s für Karten, 120 s für Gebäude, seit I4.8 bis 40 s nach der Belagerungswelle, sobald sie
höchstens 120 s entfernt ist). Die Serie läuft auf vier Kernen in etwa 30 Minuten (3.000 Partien Ziele: 14 Minuten).

Neue Kennzahlen in Iteration 4: Siegquote „Karte angeboten und gewählt“ gegen „angeboten und nicht gewählt“ je Stufe (ersetzt den verzerrten Vergleich
„mit/ohne Karte“ aus Iteration 3), Wahlraten je Kategorie und Seltenheit, Anteil der Partien mit legendärer Karte, größte eigene Armee,
Zeit bis zum ersten Mauerfall, Bildzeit.

## 5. Kennzahlen im Vergleich
Median bis zum Sieg und Siegquote, gierige Heuristik (Iteration 2: 50 Partien je Feld, Iteration 3 und 4: 200).

| Feld | Soll | v0.3 | v0.4 | v0.5 |
|---|---|---|---|---|
| Leicht aktiv | 5–7 min | 5:19 ✔ | 5:09 ✔ | 5:27 ✔ |
| Leicht durchschnitt | 6–9 min | 5:40 ✘ | 6:21 ✔ | 6:08 ✔ |
| Leicht gelegentlich | Sieg, 10–18 min | 82 % · 10:10 ✔ | 62 % · 7:36 ✘ | 100 % · 7:32 ✘ |
| Normal aktiv | 6–9 min | 8:19 ✔ | 7:18 ✔ | 6:40 ✔ |
| Normal durchschnitt | 9–13 min | 10:25 ✔ | 9:32 ✔ | 9:20 ✔ |
| Schwer aktiv | 8–12 min | 11:54 ✔ | 8:39 ✔ | 8:45 ✔ |
| Schwer durchschnitt | 13–20 min | 12:28 ✘ | 10:40 ✘ | 10:31 ✘ |
| Schwer gelegentlich | verliert | 0 % ✔ | 2 % ≈ | 30 % ✘ |
| Patt-Quote | ≤ 2 % | 1 von 600 | 0 % | 0 % |

| Weitere Kennzahl | Soll | v0.3 | v0.4 | v0.5 |
|---|---|---|---|---|
| Klickanteil Früh / Mitte / Spät (Normal) | ≥ 50 / 10–30 / ≤ 3 % | 68 / 18 / 0 % ✔ | 64 / 50 / 37 % ✘ | 62 / 24 / 1 % ✔ |
| Nie klicken / Dauerklick | ≤ 50 % | 0 % ✔ | 0 % ✔ | Leicht 101 % ✘, Normal 49 %, Schwer 21 % |
| Kartenabstand Frühspiel | ≥ 45 s | 56 s ✔ | 37 s ✘ | 50 s ✔ |
| Ohne Schmiede auf Normal | ≥ 30 % | – | 32 % ✔ | 28 % ✘ |
| Karten über +25 pp | keine | – | keine | 2 (legendär) |

## 6. Was wiederkehrt
1. **Patts sind die Standardgefahr jedes Kampfsystems.** Jede Iteration hat neue Patt-Ursachen erzeugt: endloses Nachschieben (It. 2), Staus alter
   Einheiten, Reparatur schneller als Schaden (It. 3). Gegenmittel waren jeweils Regeln, die Zeitdruck erzeugen. Mit Formationen (I4.2) wurden zwei davon
   überflüssig und entfernt; die Reparatur-Abklingzeit bleibt, weil reine Verteidigung auf Leicht sonst bis Minute 30 hält.
   Regel für neue Kampfmechaniken: erst Kurzsimulation mit offener Partie als Abbruchkriterium, dann Balancing.
2. **Die Spielerprofile trennen schlecht.** Seit Iteration 3 unterscheiden sich aktiv und gelegentlich auf Leicht um rund zwei Minuten statt um fünf bis
   zehn. Ursache war zuerst das Versorgungslimit (alle Profile rücken voll aus), seit Iteration 4 die Automatik. Stärkere Gegner treffen alle Profile
   gleich; über Schwierigkeitswerte lässt sich der Abstand nicht herstellen. Das ist eine Designfrage, keine Kalibrierung.
3. **Lebenspunkte der gegnerischen Basis wirken kaum auf die Dauer.** Mit Formationen fällt die Basis, sobald die Front bricht; +25 % Lebenspunkte
   verlängern Partien um etwa 15 s. Die Werte stiegen deshalb von rund 5.000 auf 11.000–15.000. Die Partiedauer steuert der Zeitpunkt des Durchbruchs.
4. **Kennzahlen haben eingebaute Verzerrungen.** „Mit/ohne Karte“ bevorzugte kurze Partien (It. 3); „gewählt/nicht gewählt“ bevorzugt, was die Heuristik
   für gut hält (It. 4). Die Heuristik selbst gewichtet Wirtschaft hoch, was die Wahlraten der Wirtschaftskarten über 60 % treibt (seit It. 2).
   Wahlraten und Kartendifferenzen sind Hinweise, keine Beweise.
5. **Balancing-Ziele stehen im Konflikt.** „Ohne Schmiede ≥ 30 %“ verlangt höhere Grundstärke, die jede Partie leichter macht; ausgeglichen wurde über
   schwächere Schmiede und stärkere Gegnerwellen. Jede Änderung einer globalen Konstante verschiebt alle 15 Felder.
6. **Streuung unterschätzt.** Vorversuche mit 12–20 Partien lagen bei „ohne Schmiede“ zwischen 7 % und 55 %; die Serie mit 100 Partien ergab 28 %.
   Entscheidungen sollten auf mindestens 50 Partien je Feld beruhen.

## 7. Fehler, die durchgerutscht sind
| Fehler | Seit | Entdeckt | Ursache | Absicherung |
|---|---|---|---|---|
| Gespeicherte Partien wurden nie geladen | v0.4 | I4.2 | `ui.js` prüfte fest auf eine veraltete Versionsnummer statt auf die aus `core.js` | `KlammerCore.SAVE_VERSION` als einzige Quelle |
| Zirkuläre Referenz im Spielstand | I4.2 (Entwicklung) | sofort | Formation hielt Verweis auf Einheiten | transiente Daten in Closure-Maps |
| Zwei zielfreie Formationen tauschten endlos die Lanes | I4.3 (Entwicklung) | Test | symmetrische Unterstützungsregel | Vorrang der Mitte |
| Tests hingen nach verlorener Partie | I4.4 (Entwicklung) | Testlauf | Schleife ohne Statusprüfung | Status-Wächter in Testhilfen |
| Bildzeit 0 ms gemessen | I4.6 (Entwicklung) | Plausibilität | Canvas-Befehle werden gepuffert | `getImageData` nach jedem Bild |

## 8. Technische Schulden und Risiken
- **`ui.js` (1.117 Zeilen)** vereint Kamera, Zeichnen, Eingabe, Tooltips und Kontextfeld. Nächster sinnvoller Schnitt: Zeichnen und Kamera in `render.js`.
- **Barrierefreiheit:** Bauplätze sind nur per Mausklick in der Canvas-Welt erreichbar; Scrollen und alle übrigen Knöpfe gehen per Tastatur.
- **Browser-Prüfung** braucht Playwright außerhalb des Projekts (im Container per Symlink auf eine globale Installation) und läuft kopflos mit
  Software-Zeichnung; die Bildzeit auf echter Hardware ist nicht gemessen.
- **Bot-Modell:** Die Profile sind Annahmen, nicht aus Spielerdaten abgeleitet. Alle Zielkorridore beziehen sich auf diese Annahmen.
- **Simulationsdauer** steigt mit jeder Vorausschau; die Belagerungs-Vorausschau (I4.8) verlängert Partien im Bot um die Zeit bis nach Minute 16.
- **Spielstand-Migration** gibt es nicht; jede inkompatible Änderung verwirft alte Partien (bewusst, bisher ohne echte Spieler).

## 9. Offen
Aus `docs/bericht-iteration-4.md`: Freigabe der Kartenliste; Umgang mit Große Armee und Söldnerheer (+38/+32 pp); Entscheidung, ob Gelegenheitsspieler
spürbar schlechter abschneiden sollen (Automatik); Handelskontor nach einem Test mit Menschen; Tastaturzugang zu Bauplätzen; Merge nach `main`.
Der wichtigste nächste Schritt ist ein Test mit Menschen: Seit Iteration 2 stützt sich jede Balancing-Entscheidung ausschließlich auf Bots.

## Quellen
Berichte `docs/bericht-iteration-2.md`, `-3.md`, `-4.md`; Stand und Auslegungen `docs/STAND.md`, `docs/archiv/STAND-iteration-3.md`;
Rohdaten `reports/req*` (Iteration 2 und 3) und `reports/i4-*` (Iteration 4); `CHANGELOG.md`; `git log`.

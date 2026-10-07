# Klammerfront – Bericht MVP-Veröffentlichung (v0.8.1)

Stand 07.10.2026. Anforderungen: `docs/anforderungen-mvp-release.md`. Stand je Inkrement: `docs/STAND.md` (Abschnitt „MVP-Veröffentlichung“).

## Ergebnis in drei Sätzen
`main` enthält jetzt die ruhigere Tutorial-Sprache mit Sprach-Audit, die Korrektur des Simulations-Bots und das erweiterte Sitzungsprotokoll; die Spielwerte sind unverändert. Der öffentliche Build ist als Version 0.8.1 freigegeben und kommt ohne externe Abrufe, ohne Testschnittstelle und ohne einen anderen Modus als `standard` aus. Mit dem korrigierten Bot gewinnt der MVP auf Normal und Schwer deutlich früher als bisher gemessen; mehrere Zielkorridore sind damit verfehlt (Abschnitt R.03), eine Neukalibrierung findet nicht statt.

## Ergebnisse je Anforderung
| REQ | Ergebnis |
|---|---|
| R.01 Voraussetzungen | erfüllt, Befund in `docs/STAND.md`. Tutorial Teil 1 und 2 auf `main`; Unterbau `5c2f57b` mit `PACING_MODUS: 'standard'`; kein anderer Modus per Adresse erreichbar (`?pacing=` gibt es nur im Branch, `C.PACING` ist leer). **Repository ist öffentlich** (`public`), Pages aktiv; die Quelle von Pages ließ sich aus der Arbeitsumgebung nicht lesen (siehe Offen). |
| R.02 Tutorial-Sprache | erfüllt. Glossar und Ersatztexte, „Statthalter“/“governor”, Quartiermeister, „Erfahrung“/“experience”; Sprach-Audit grün (alle `tut.`-Schlüssel, beide Sprachen, Wortanfang); Längenregel eingehalten; Playwright-Durchlauf in beiden Sprachen grün; Golden-Test der Simulation unverändert durch die Texte (vor R.2). |
| R.03 Bot-Korrektur | erfüllt. Test `tests/bot-raster.test.mjs` war auf dem Stand vor der Korrektur rot (Warteschlange leer bei neun belegten Plätzen und 2.000 Material) und ist grün. Golden-Test im selben Commit neu erzeugt. Vergleichsbasis 50 Partien je Feld, beide Strategien: unten. |
| R.04 Protokollfelder | erfüllt. Format 2 mit `thinkMs`, `rerolled`, `banned` je Kartenwahl; `tools/compare-human.mjs` liest es und alte Protokolle; Test mit zwei Kartenwahlen in der Browser-Prüfung. |
| R.05 Veröffentlichung | siehe unten (Prüfliste und Link). |
| R.06 Abgleich mit dem Branch | siehe unten. |

## R.03 Vergleichsbasis vorher und nachher
50 Partien je Feld (3 Schwierigkeitsgrade × 4 Spielertypen × 2 Strategien), gleiche Seeds; Rohdaten `reports/vergleichsbasis-vorher.*`, `reports/vergleichsbasis-nachher.*`. Werte: Siegquote %, Median der Siegdauer in Minuten, Median der Kartenwahlen je Partie. Keine offene Partie in keinem Feld (Patt-Quote 0 %).

| Grad | Typ | Strategie | Siege vorher → nachher | Median min | Wahlen |
|---|---|---|---|---|---|
| Leicht | aktiv | gierig | 100 → 100 | 6,3 → 6,0 | 4 → 3 |
| Leicht | aktiv | einheiten-zuerst | 100 → 100 | 5,6 → 5,6 | 3 → 3 |
| Leicht | durchschnitt | gierig | 100 → 100 | 8,9 → 6,8 | 6 → 4 |
| Leicht | durchschnitt | einheiten-zuerst | 100 → 100 | 6,2 → 6,2 | 3 → 3 |
| Leicht | gelegentlich | gierig | 100 → 100 | 10,2 → 7,8 | 6 → 4 |
| Leicht | gelegentlich | einheiten-zuerst | 100 → 100 | 7,5 → 7,5 | 3 → 3 |
| Leicht | passiv | gierig | 2 → 8 | 9,5 → 9,9 | 5 → 6 |
| Leicht | passiv | einheiten-zuerst | 4 → 4 | 12,6 → 12,6 | 6 → 6 |
| Normal | aktiv | gierig | 100 → 100 | 6,6 → 6,1 | 4 → 4 |
| Normal | aktiv | einheiten-zuerst | 100 → 100 | 5,5 → 5,5 | 3 → 3 |
| Normal | durchschnitt | gierig | 98 → 100 | 9,4 → 6,9 | 6 → 4 |
| Normal | durchschnitt | einheiten-zuerst | 100 → 100 | 6,2 → 6,2 | 3 → 3 |
| Normal | gelegentlich | gierig | 52 → 100 | 12,4 → 7,9 | 8 → 4 |
| Normal | gelegentlich | einheiten-zuerst | 100 → 100 | 7,7 → 7,7 | 3 → 3 |
| Normal | passiv | beide | 0 → 0 | – | 3 → 3 |
| Schwer | aktiv | gierig | 92 → 100 | 9,4 → 6,4 | 9 → 6 |
| Schwer | aktiv | einheiten-zuerst | 100 → 100 | 6,0 → 6,0 | 6 → 6 |
| Schwer | durchschnitt | gierig | 70 → 100 | 11,1 → 7,5 | 10 → 6 |
| Schwer | durchschnitt | einheiten-zuerst | 98 → 98 | 7,0 → 7,0 | 6 → 6 |
| Schwer | gelegentlich | gierig | 0 → 10 | – → 9,5 | 2 → 2 |
| Schwer | gelegentlich | einheiten-zuerst | 8 → 8 | 9,2 → 9,2 | 1 → 1 |
| Schwer | passiv | beide | 0 → 0 | – | 0–1 → 0–1 |

Die Strategie „einheiten-zuerst“ ändert sich fast nicht: Sie hielt nie Material zurück. Die Veränderung liegt bei „gierig“.

**Bewertung gegen die Zielkorridore (Information für Iteration 7, keine Neukalibrierung):**
- **Verfehlt, weil zu schnell** (Median bis zum Sieg unter dem Korridor): Normal durchschnitt (Ziel 9–13 min: gierig 6,9, einheiten-zuerst 6,2); Schwer aktiv (Ziel 8–12: 6,4 / 6,0); Schwer durchschnitt (Ziel 13–20: 7,5 / 7,0); Leicht gelegentlich (Ziel 10–18: 7,8 / 7,5). Vor der Korrektur lagen die Werte der gierigen Strategie noch im Korridor (Normal durchschnitt 9,4; Schwer aktiv 9,4), die der Strategie „einheiten-zuerst“ schon vorher darunter.
- **Verfehlt:** Schwer gelegentlich soll höchstens 5 % Siege haben; gierig 10 %, einheiten-zuerst 8 % (letzteres bestand schon vorher).
- **Eingehalten:** Normal aktiv (6,1 / 5,5 grenzwertig bis leicht darunter), Leicht aktiv und durchschnitt, passive Spieler verlieren auf Normal und Schwer, Patt-Quote 0 %.
- Lesart: Die Spieler-Bots sind stärker als bei der Kalibrierung angenommen; das Spiel ist für sie auf Normal und Schwer zu leicht. Ob Menschen ebenso erleben, klären die Spieltests.

## R.05 Prüfliste vor dem Teilen
| Prüfpunkt | Ergebnis |
|---|---|
| Kein Modus außer `standard` erreichbar | erfüllt (Test: `?pacing=karten` wirkungslos) |
| Keine Konsolenfehler oder Warnungen beim Durchlauftest je Schwierigkeitsgrad | erfüllt (Durchlauftest Leicht, Normal, Schwer) |
| Keine externen Abrufe außer den Spieldateien | erfüllt, **nachdem** die Schriften von Google Fonts entfernt wurden (Systemschriften als Ersatz; Aussehen weicht leicht ab) |
| Debug-Funktionen nur mit `?debug=1` sichtbar | erfüllt: Protokollknopf verborgen, `window.__kf` nur mit `?dev=1` oder `?debug=1` |
| Startbildschirm mit Sprache, Schwierigkeitsgrad, Tutorial-Schalter bei leerem Speicher | erfüllt (Test) |
| `npm test`, Browser-Prüfung, Sprach-Audit | grün (187 Tests; Browser-Prüfung ohne Fehler) |

Version 0.8.1 (`config.js`, `package.json`), `CHANGELOG.md` für Tester geschrieben, Testleitfaden `docs/testleitfaden-mvp.md`.

**Öffentlicher Link:** https://ludwigfunbeathoven.github.io/Little-Strategy-Game/ (Branch `MVP`, Fast-Forward von `main`). Ergebnis der Prüfung im frischen Profil: siehe Abschnitt „Nachtrag zur Veröffentlichung“ am Ende.

## Bildschirmfotos der ersten Sprechblase
- Deutsch: `docs/bilder/mvp-tutorial-sprechblase-de.png`
- Englisch: `docs/bilder/mvp-tutorial-sprechblase-en.png`

## Auffälligkeiten
1. Der Bot-Fehler wirkte nur bei vollem Raster, aber in jeder Partie, in der das Raster voll wurde; er verlängerte die Partien der gierigen Strategie um 2 bis 4 Minuten.
2. Die Strategie „einheiten-zuerst“ ist schon seit Iteration 6 auf allen Graden schneller als die Korridore; die Korrektur ändert daran nichts.
3. Das Repository ist öffentlich: Auch der Branch `exp/kartenpfad` (Code, Berichte, Rohdaten) ist dort lesbar. „Privat“ gilt für die spielbare Fassung, nicht für den Code.

## Offen für den PO
1. **Pages-Quelle bestätigen** (Repository-Einstellungen, Pages): Das Anforderungsdokument nennt `main`, `CLAUDE.md` den Branch `MVP`. Ich habe beide auf denselben Stand gebracht; welcher gilt, konnte ich nicht lesen (Schnittstelle gesperrt).
2. **Repository privat stellen?** Wenn der Prototyp wirklich privat bleiben soll, genügt ein unveröffentlichter Branch nicht.
3. **Schriften:** Soll das Spiel die Plex-Schriften mitliefern (Dateien einbetten), damit das Aussehen wieder dem früheren entspricht? Das wäre eine eigene Änderung.
4. **Iteration 7:** Kalibrierung gegen den korrigierten Bot und gegen Daten aus Spieltests (Abschnitt R.03).
5. **Tag `v0.8.1`:** Aus der Cloud-Umgebung nicht pushbar; bitte als Release auf `MVP` anlegen.

## Nachtrag zur Veröffentlichung
- `MVP` ist per Fast-Forward auf `main` gesetzt (Release-Commit `d03c57e`, danach nur Dokumentation); Version 0.8.1.
- **Öffentlicher Link nicht geprüft:** Aus der Cloud-Umgebung ist `ludwigfunbeathoven.github.io` gesperrt (die Netzwerkrichtlinie verweigert die Verbindung). Der Akzeptanztest „Link im frischen Browserprofil“ ist deshalb **offen**. Ersatz: Die Browser-Prüfung lädt dieselben Dateien über einen lokalen Server in ein frisches Profil (Startbildschirm → Tutorial → freies Spiel, keine Fehler, keine externen Abrufe, Abschnitt „Öffentliche Fassung“). Bitte den Link einmal in einem privaten Fenster öffnen; GitHub Pages braucht nach dem Push einige Minuten.
- Der Tag `v0.8.1` lässt sich von hier nicht setzen (siehe Offen, Punkt 5).

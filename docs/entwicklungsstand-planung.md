# Klammerfront – Entwicklungsstand für die Planung

Stand 09.10.2026. Zusammengestellt aus den jeweils letzten Entwicklungsberichten von `main`, dem veröffentlichten MVP und dem Branch `exp/kartenpfad`, damit die nächsten Anforderungen darauf aufbauen können. Die Berichte stehen unverändert im Anhang A bis C (Überschriften um zwei Stufen eingerückt); Abschnitt 1 bis 4 fasst zusammen.

## 1. Auf einen Blick
| Linie | Branch / Link | Version | Commit | Inhalt |
|---|---|---|---|---|
| `main` | `main` | 0.9.2 | `73e1590` | Basisspiel (v0.8.1: Tutorial, Startbildschirm, ruhigere Sprache, korrigierter Bot) plus Kartenbühne und Entdecken (0.9), Fehlerbehebungen 0.9.1 und 0.9.2 |
| veröffentlichter MVP | Branch `MVP`, GitHub Pages `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/` | 0.9.2 | `73e1590` | **identisch mit `main`**: `MVP` wird per Fast-Forward auf `main` gesetzt |
| Kartenbranch | `exp/kartenpfad` | 0.9-kartenpfad | `b2fb090` | Experiment „Kartenpfad“: Karten steuern das Pacing (Teil 1) und Darstellung sowie Entdecken (Teil 2); nicht in `main` |

Hinweis: `exp/kartenpfad` enthält `main` bis v0.8.1 und eigene Fehlerbehebungen (Kontext-Ausbau, Pause-Klicks, gesperrte Ausbauten). Nur in `main`/`MVP` stehen die Korrekturen 0.9.2 (wirkungslose Upgrades am Versorgungsdeckel, Anzeige „Schmiede-Ausbau“) und die Textsymbole der Karten (0.9.1). Der Anzeigefehler aus 0.9.1 (Absturz bei der zweiten Kartenwahl) entstand beim Übernehmen in `main` und betrifft den Branch nicht. Vor dem nächsten Zusammenführen ist `main` in den Kartenbranch einzumischen.

## 2. Das Spiel in drei Sätzen
Browser-Spiel zwischen *Universal Paperclips* (Klicken, Idle-Ökonomie) und *Age of War* (Lane-Kampf): Der Spieler klickt Material, baut Fabriken und Gebäude im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Abschüsse bringen Erfahrung (EP); jeder Stufenaufstieg bietet 2 (mit Universität 3; im Modus karten 3 bzw. 4) Spezialkarten mit bis zu drei Stufen. Die Partie ist verloren, wenn das Tor fällt; gewonnen, wenn die gegnerische Basis fällt.

Arbeitsweise: Der Product Owner (Nick) ist kein Entwickler; Kommunikation auf Deutsch, knapp, Ergebnis zuerst; Abweichungen von Anforderungen werden begründet und nachgefragt. Alle Spielwerte stehen in `config.js`, alle sichtbaren Texte in `i18n/de.js` und `i18n/en.js`; keine Zahlen für Balancing im Code. Prüfungen: `npm test`, `npm run test:browser` (Playwright), Balancing-Simulation `tools/simulate.mjs`. `main` bleibt das Basisspiel; Features, die den Kern des Spiels ändern, entstehen zuerst im Kartenbranch.

## 3. Was ist wo?
| Funktion | `main` / MVP | Kartenbranch |
|---|---|---|
| Spielregeln, Wellen, Kampf, Balancing | v0.8.1, unverändert | wie `main`, im Modus `karten` mit eigenem Pacing |
| Kartenwahl | Bühne mit Ablauf (Austeilen, Aufdecken, Flug zum Wirkort), Wirkungszeile je Karte, Kartensymbol in der Leiste | gleich, zusätzlich Kartenfamilien (Bau, Technologie, Bonus, Wagnis) |
| Freischaltung durch Karten (Gebäude, Einheiten, Ausbaustufen, Forschungen) | nein: alles ab Start nutzbar | ja: Pfadkarten und Forschungen öffnen Inhalte, neue Einheiten (Reiter, Armbrustschütze, Katapult) |
| „Nur, was jetzt nutzbar ist“ (Entdecken) | an, Schalter `?entdecken=0` | an im Modus `karten` |
| Schalter per Adresse | `?buehne=`, `?entdecken=`, `?vorschau=naechste`, `?zeit=lauf` | zusätzlich `?pacing=standard\|karten` |
| Tutorial „Erste Schritte“ | ja (Quartiermeister, Statthalter) | ja, mit Abschlusstext für den Modus `karten` |
| Sitzungsprotokoll (`?debug=1`) | Format 2, mit Entdeckungszeiten und Hover je Karte | wie `main` plus Familien und Freischaltungen |
| Spielstand-Version | 7 | 8 (ältere Spielstände werden verworfen) |

## 4. Offene Punkte aus den Berichten (Entscheidungen für die Planung)
1. **Zukunft des Kartenpfads:** Der Modus `karten` ist spielbar, aber ungetestet mit Menschen; Bots gewinnen fast immer (Abschnitt „Auffälligkeiten“ in Anhang C). Spieltest nach `docs/testleitfaden-kartenpfad.md` und `docs/testleitfaden-ui-0.9.md`; danach entscheiden, ob und in welchem Umfang der Pfad nach `main` kommt (Kriterien in `docs/anforderungen-kartenpfad-2.md`, Abschnitt 5).
2. **Entschieden (PO, 09.10.2026):** Kartenbühne und Entdecken bleiben in `main` und im MVP voreingestellt an (Schalter `?buehne=0`, `?entdecken=0` für die alte Oberfläche). Grundsatz bleibt: Features, die das Spiel im Kern ändern, entstehen zuerst im Kartenbranch; der Modus `karten` (Karten schalten Inhalte frei) bleibt dort.
3. **Zielwerte der Messung „sichtbare Bedienelemente“** (Minute 1 höchstens ein Drittel von Minute 10) im Modus `karten`: knapp verfehlt (16 statt 13); Stellschrauben im Bericht (Anhang C, Nachtrag).
4. **Balancing:** Bots sind stärker als kalibriert (Normal und Schwer deutlich unter den Zielkorridoren, `docs/bericht-mvp-release.md`); Iteration 7 soll gegen den korrigierten Bot und gegen Daten aus Spieltests kalibrieren. Keine globale Neukalibrierung vorher.
5. **Namensdopplung** „Festungsbau“ (Bonus- und Pfadkarte) im Kartenbranch.
6. **Schriften:** Das Spiel nutzt Systemschriften statt der früheren Plex-Schriften; Einbetten wäre eine eigene Änderung.
7. **GitHub Pages:** Die Quelle (`main` oder `MVP`) ist aus der Cloud-Umgebung nicht prüfbar; Tags (`v0.9.x`) kann nur der PO als Release auf GitHub anlegen.
8. **Weitere Wirkungslosigkeit prüfen:** Die Audit-Messung deckt keine Kampfwerte ab (Türme, Mauer, Schaden); sie sollten in einer Simulation auf Nullwirkung geprüft werden.

---

## Anhang A: Bericht `main` – Version 0.9 (Kartenbühne und Entdecken, mit Nachträgen 0.9.1 und 0.9.2; „v0.9.0“ im Abschnitt „Offen“ ist durch `v0.9.2` überholt)
Quelle: `docs/bericht-ui-0.9.md` auf `main`.

### Klammerfront – Bericht Version 0.9: Kartenbühne und Entdecken

Stand 09.10.2026. Anforderungen: `docs/anforderungen-kartenpfad-2.md` (Teil 2 des Branches `exp/kartenpfad`), Bericht des Branches: `docs/bericht-kartenpfad-2.md` auf `exp/kartenpfad`. Stand je Inkrement: `docs/STAND.md`.

#### Ergebnis in drei Sätzen
Aus dem Branch `exp/kartenpfad` ist nur die Oberfläche in `main` und den MVP übernommen: Kartenwahl als Ablauf auf einer Bühne, freie Bildmitte, Kartensymbol in der Leiste und die Regel „nur, was jetzt nutzbar ist“, beides voreingestellt an. Spielregeln, Spielwerte, Spielstand-Version (7) und Simulation sind unverändert (Golden-Test, Kurzsimulation); der Modus `karten` mit Pfadkarten bleibt im Branch. Zwei Fehler, die schon in 0.8.1 steckten, sind behoben: das falsche „Kontor-Ausbau“ im Kontext der Universität und Klickertrag in der Pause.

#### Entscheidungen des PO (09.10.2026)
- Bühne und Entdecken in `main` und im MVP voreingestellt **an**; zum Vergleich bleibt die alte Oberfläche per `?buehne=0&entdecken=0` erreichbar.
- Der Modus `karten` bleibt im Branch.

#### Was in 0.9 steckt
| Bereich | Inhalt |
|---|---|
| Bildmitte | Kein Dauerstapel mehr; Fortschritt zur nächsten Wahl als Kartensymbol mit Füllstand in der Leiste, pulsiert bei aufgeschobener Wahl. Außerhalb einer Wahl liegt nichts von der Bühne im Bild. |
| Ablauf der Wahl | Karten fliegen aus der Leiste, decken von links nach rechts auf (Erscheinen plus Aufdecken ≈ 400 ms, Sperre ≈ 460 ms), die gewählte Karte fliegt zu ihrem Wirkort, der Rest zurück (≈ 700 ms). Spielzeit steht in dieser Zeit (`?zeit=lauf` lässt sie laufen). Bei reduzierter Bewegung keine Animation. |
| Karte | Band mit Kategorie, Name, Symbol, eine Wirkungszeile (höchstens 44 Zeichen, alle 41 Karten geprüft), Stufenpunkte, Seltenheit als Rahmen, Hinweis „mit Nachteil“, einheitliche Rückseite, Details unter den Karten. |
| Entdecken | Reiter, Abschnitte, Anzeigen und Ausbauten erscheinen erst, wenn sie nutzbar sind; neues Element blendet ein, trägt „neu“, löst genau einen Hinweis je Moment aus; nach fertiger Forschung Hinweis und Marke. |
| Schalter | `?buehne=1\|0`, `?entdecken=1\|0`, `?vorschau=naechste`, `?zeit=pause\|langsam\|lauf` (siehe `docs/testleitfaden-ui-0.9.md`). |
| Protokoll (`?debug=1`) | Sichtbarkeitszeit und erste Ansicht je Element, Zeit unter dem Zeiger je Karte, aktive Schalter. |

#### Fehlerbehebungen
| Nr. | Befund | Ursache | Behebung |
|---|---|---|---|
| 1 | Bei gewählter Universität erscheint „Kontor-Ausbau“ | Container mit `display: flex` überschrieb `hidden` (bestand in 0.8.1) | `.opts[hidden]` |
| 2 | In der Pause erzeugen etwa 6 Klicks Material (bestand in 0.8.1) | Die Logik kennt die Pause nicht, die Klickzeit steht still, das Limit von 6 je Sekunde blieb je Pause frei | Klickertrag in Pause und Dialogen gesperrt, Knopf gesperrt |

#### Messung „sichtbare Bedienelemente“
Fester Lauf (Seed 424242, Bot „einheiten-zuerst“, „durchschnitt“, Normal), `tools/sichtbar-mass.mjs`, Rohdaten `reports/sichtbar-*.json`; ohne den gleichbleibenden Rahmen von 16 Elementen.

| Oberfläche | Minute 1 | Minute 5 | Minute 10 |
|---|---|---|---|
| 0.8.1 (vorher) | 42 | 46 | 46 |
| 0.9, Vorgabe (Entdecken an) | 24 | 29 | 29 |
| 0.9 mit `?buehne=0&entdecken=0` | 39 | 43 | 43 |

Minute 1 sinkt um 43 %. Die Zeile „0.9 mit Schaltern aus“ liegt drei unter 0.8.1, weil der Fehler 1 behoben ist (ein sonst sichtbarer Container entfällt). Im Standardspiel ist von Anfang an vieles nutzbar; das Verhältnis Minute 1 zu Minute 10 liegt bei 0,83. Das Drittel-Ziel galt für den Modus `karten` und ist dort knapp verfehlt (Bericht des Branches).

#### Prüfungen
| Prüfung | Ergebnis |
|---|---|
| `npm test` (194 Tests, Golden-Test unverändert) | grün |
| `tests/browser-check.mjs` (bisherige Abläufe mit `?buehne=0&entdecken=0`, Tutorial in beiden Oberflächen, öffentliche Fassung) | grün |
| `tests/browser-k2.mjs` (55 Prüfungen: Bildmitte, Ablauf, Karte, Sichtbarkeit, Sammlung, Hinweise, Fehler 1 und 2, Schalter) | grün |
| Kurzsimulation `standard` | 100 % Siege, keine offene Partie, unverändert |
| Öffentliche Fassung: keine externen Abrufe, keine Konsolenfehler, keine Testschnittstelle | grün |

#### Auslegungen und Auffälligkeiten
1. Das Band zeigt die Kategorie (es gibt im Standard keine Familien); die Sammlung ist nach Kategorie gruppiert.
2. „Nicht im DOM“ ist als „nicht dargestellt“ umgesetzt (`hidden`, nicht fokussierbar).
3. Die gestaffelte Einführung (Gebäude ab Stufe 2) bleibt; der Hinweis „Neu: Schmiede, Kaserne …“ erscheint zusätzlich zu den Entdeckungshinweisen.
4. Wiederholte Animationen können bei vielen Wahlen ermüden; Dauern stehen in `config.js` (`KARTENBUEHNE`).
5. Nicht geprüft: Die öffentliche Seite (GitHub Pages) ist aus der Cloud-Umgebung nicht erreichbar; die Quelle von Pages (`main` oder `MVP`) ist weiter offen (siehe `docs/bericht-mvp-release.md`).

#### Offen für den PO
1. Release `v0.9.0` auf `MVP` auf GitHub anlegen (Tags lassen sich von hier nicht setzen).
2. Öffentlichen Link in einem privaten Fenster öffnen und eine Partie mit Tutorial spielen.
3. Spieltest nach `docs/testleitfaden-ui-0.9.md`; der Branch `exp/kartenpfad` (Modus `karten`) bleibt für die Kartenpfad-Entscheidung bestehen.

#### Nachträge nach der Veröffentlichung
| Version | Datum | Inhalt |
|---|---|---|
| 0.9.1 | 09.10.2026 | **Behoben: Absturz der Anzeige nach der zweiten Kartenwahl.** Ein Tippfehler in der Sortierung der Sammlung brach das Zeichnen ab, sobald zwei verschiedene Karten gewählt waren (Kartenwahl blieb stehen, Tutorial-Figur verschwand nicht). Test: acht Wahlrunden hintereinander. Außerdem: Kartensymbole als Text statt als Emoji (⚔ erschien unter Windows blau), Entwicklerprüfung ohne falsche Meldung. |
| 0.9.2 | 09.10.2026 | **Wirkungslose Upgrades:** Kaserne-Ausbau, Forschung „Logistik“ und reine Versorgungskarten (Aushebung, Große Armee) entfallen am harten Deckel des Versorgungslimits von 15 („Versorgungslimit am Maximum“, kein Abbuchen); „Schmiede-Ausbau“ zeigt seine Wirkung („2 Prozentpunkte“ statt „0,0“); Anzeige der EP je Sekunde des Hörsaals mit zwei Nachkommastellen. Kennzahlen der Simulation praktisch unverändert (Normal, durchschnitt: 6:55 und 6:13 Minuten). Test `tests/noeffect.test.mjs`. |

Ein Audit aller Upgrades, Forschungen und Karten (Kennzahlen vor und nach dem Kauf in einem späten Zustand) fand keine weiteren wirkungslosen Käufe außerhalb des Kampfes; die Wirkung von Kampfwerten (Türme, Mauer, Schaden) lässt sich so nicht messen und ist nicht geprüft.


---

## Anhang B: Bericht veröffentlichter MVP – Version 0.8.1 (Prüfliste und Veröffentlichung)
Quelle: `docs/bericht-mvp-release.md` auf `main`. Der MVP entspricht seither `main` (Stand oben); die Prüfliste gilt als Vorlage für künftige Veröffentlichungen.

### Klammerfront – Bericht MVP-Veröffentlichung (v0.8.1)

Stand 07.10.2026. Anforderungen: `docs/anforderungen-mvp-release.md`. Stand je Inkrement: `docs/STAND.md` (Abschnitt „MVP-Veröffentlichung“).

#### Ergebnis in drei Sätzen
`main` enthält jetzt die ruhigere Tutorial-Sprache mit Sprach-Audit, die Korrektur des Simulations-Bots und das erweiterte Sitzungsprotokoll; die Spielwerte sind unverändert. Der öffentliche Build ist als Version 0.8.1 freigegeben und kommt ohne externe Abrufe, ohne Testschnittstelle und ohne einen anderen Modus als `standard` aus. Mit dem korrigierten Bot gewinnt der MVP auf Normal und Schwer deutlich früher als bisher gemessen; mehrere Zielkorridore sind damit verfehlt (Abschnitt R.03), eine Neukalibrierung findet nicht statt.

#### Ergebnisse je Anforderung
| REQ | Ergebnis |
|---|---|
| R.01 Voraussetzungen | erfüllt, Befund in `docs/STAND.md`. Tutorial Teil 1 und 2 auf `main`; Unterbau `5c2f57b` mit `PACING_MODUS: 'standard'`; kein anderer Modus per Adresse erreichbar (`?pacing=` gibt es nur im Branch, `C.PACING` ist leer). **Repository ist öffentlich** (`public`), Pages aktiv; die Quelle von Pages ließ sich aus der Arbeitsumgebung nicht lesen (siehe Offen). |
| R.02 Tutorial-Sprache | erfüllt. Glossar und Ersatztexte, „Statthalter“/“governor”, Quartiermeister, „Erfahrung“/“experience”; Sprach-Audit grün (alle `tut.`-Schlüssel, beide Sprachen, Wortanfang); Längenregel eingehalten; Playwright-Durchlauf in beiden Sprachen grün; Golden-Test der Simulation unverändert durch die Texte (vor R.2). |
| R.03 Bot-Korrektur | erfüllt. Test `tests/bot-raster.test.mjs` war auf dem Stand vor der Korrektur rot (Warteschlange leer bei neun belegten Plätzen und 2.000 Material) und ist grün. Golden-Test im selben Commit neu erzeugt. Vergleichsbasis 50 Partien je Feld, beide Strategien: unten. |
| R.04 Protokollfelder | erfüllt. Format 2 mit `thinkMs`, `rerolled`, `banned` je Kartenwahl; `tools/compare-human.mjs` liest es und alte Protokolle; Test mit zwei Kartenwahlen in der Browser-Prüfung. |
| R.05 Veröffentlichung | siehe unten (Prüfliste und Link). |
| R.06 Abgleich mit dem Branch | siehe unten. |

#### R.03 Vergleichsbasis vorher und nachher
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

#### R.05 Prüfliste vor dem Teilen
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

#### Bildschirmfotos der ersten Sprechblase
- Deutsch: `docs/bilder/mvp-tutorial-sprechblase-de.png`
- Englisch: `docs/bilder/mvp-tutorial-sprechblase-en.png`

#### Auffälligkeiten
1. Der Bot-Fehler wirkte nur bei vollem Raster, aber in jeder Partie, in der das Raster voll wurde; er verlängerte die Partien der gierigen Strategie um 2 bis 4 Minuten.
2. Die Strategie „einheiten-zuerst“ ist schon seit Iteration 6 auf allen Graden schneller als die Korridore; die Korrektur ändert daran nichts.
3. Das Repository ist öffentlich: Auch der Branch `exp/kartenpfad` (Code, Berichte, Rohdaten) ist dort lesbar. „Privat“ gilt für die spielbare Fassung, nicht für den Code.

#### Offen für den PO
1. **Pages-Quelle bestätigen** (Repository-Einstellungen, Pages): Das Anforderungsdokument nennt `main`, `CLAUDE.md` den Branch `MVP`. Ich habe beide auf denselben Stand gebracht; welcher gilt, konnte ich nicht lesen (Schnittstelle gesperrt).
2. **Repository privat stellen?** Wenn der Prototyp wirklich privat bleiben soll, genügt ein unveröffentlichter Branch nicht.
3. **Schriften:** Soll das Spiel die Plex-Schriften mitliefern (Dateien einbetten), damit das Aussehen wieder dem früheren entspricht? Das wäre eine eigene Änderung.
4. **Iteration 7:** Kalibrierung gegen den korrigierten Bot und gegen Daten aus Spieltests (Abschnitt R.03).
5. **Tag `v0.8.1`:** Aus der Cloud-Umgebung nicht pushbar; bitte als Release auf `MVP` anlegen.

#### Nachtrag zur Veröffentlichung
- `MVP` ist per Fast-Forward auf `main` gesetzt (Release-Commit `d03c57e`, danach nur Dokumentation); Version 0.8.1.
- **Öffentlicher Link nicht geprüft:** Aus der Cloud-Umgebung ist `ludwigfunbeathoven.github.io` gesperrt (die Netzwerkrichtlinie verweigert die Verbindung). Der Akzeptanztest „Link im frischen Browserprofil“ ist deshalb **offen**. Ersatz: Die Browser-Prüfung lädt dieselben Dateien über einen lokalen Server in ein frisches Profil (Startbildschirm → Tutorial → freies Spiel, keine Fehler, keine externen Abrufe, Abschnitt „Öffentliche Fassung“). Bitte den Link einmal in einem privaten Fenster öffnen; GitHub Pages braucht nach dem Push einige Minuten.
- Der Tag `v0.8.1` lässt sich von hier nicht setzen (siehe Offen, Punkt 5).


---

## Anhang C: Bericht Kartenbranch `exp/kartenpfad`
Zwei Teile: Teil 1 (Kartenpfad, Pacing durch Karten) und Teil 2 (Darstellung und Entdecken). Quellen: `docs/bericht-kartenpfad.md`, `docs/bericht-kartenpfad-2.md` auf `exp/kartenpfad`.

### C.1 Teil 2 (zuletzt)

### Klammerfront – Bericht Kartenpfad Teil 2: Kartendarstellung und Entdecken

Branch `exp/kartenpfad`, Stand 07.10.2026. Anforderungen: `docs/anforderungen-kartenpfad-2.md`. Stand je Inkrement und Auslegungen 19–25: `docs/STAND-kartenpfad.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-2.md`.

#### Ergebnis in drei Sätzen
Die Bildmitte ist außerhalb einer Kartenwahl frei, die Wahl läuft als Ablauf (Austeilen, Aufdecken, Flug zum Wirkort, Rückkehr in den Stapel), und das Spiel zeigt nur noch, was nutzbar ist; alles ist reine Oberfläche, `core.js` und die Spielwerte sind unverändert, der Modus `standard` ohne Schalter ist identisch zu `main` (Golden-Test, Messung). Ein Ziel ist verfehlt: In Minute 1 zeigt der Modus `karten` 16 statt höchstens 13 Bedienelementen (K2.08, ein Drittel von 39); der Abstand hat benannte Ursachen und Stellschrauben (unten). Alle Schalter lassen sich per Adresse setzen; Testbuild und Leitfaden liegen bei.

#### Ergebnis je Anforderung
| REQ | Ergebnis |
|---|---|
| K2.01 Bildmitte frei | erfüllt. Ursache: Dauerstapel `#deckBtn` (fixiert, Bildmitte unten, immer sichtbar). Ersetzt durch Kartensymbol mit Füllstand in der Leiste; außerhalb einer Wahl kein Bühnenelement (`display: none`), Klicks erreichen die Welt. Tests in beiden Modi. |
| K2.02 Ablauf | erfüllt. Erscheinen plus Aufdecken gemessen 391 ms (Soll ≤ 800), Eingabesperre 459 ms (frühestens 400), Wirkung plus Abräumen 709 ms (Soll ≤ 700, Messtoleranz 200 ms; Konfiguration 700 ms). Zeit steht bei `pause` bis zum Ende des Abräumens, läuft bei `?zeit=lauf`. `prefers-reduced-motion`: keine Bewegung. Neu ziehen: Karten werden neu ausgeteilt; Bannen: die Karte blendet aus. Mehrere offene Wahlen folgen ohne Rückkehr in den Stapel. Die Sprechblase des Tutorials erscheint erst nach dem Aufdecken. |
| K2.03 Vorderseite | erfüllt. Band (Familie, im Standard mit Bühne die Kategorie), Name, Symbol, genau eine Wirkungszeile (≤ 44 Zeichen, Test für alle 41 Bonuskarten und die Pfadkarten), Stufenpunkte, Seltenheit als Rahmen, einheitliche Rückseite; Detailzeile bei Zeiger oder Fokus. Test: keine Karte nennt eine fremde Karte oder Forschung. |
| K2.04 Sichtbarkeit | erfüllt. Tabelle unten; ein Test je Zeile. Der Kernrahmen (Menü, Kamera, Raster, Hinweisknopf) bleibt. Vorschau `?vorschau=naechste` (Soll): höchstens ein „?“ je Bereich (Reiterleiste, Einheitenliste). |
| K2.05 Keine Spuren | erfüllt. Pfadübersicht, „Öffnet mit“, „Freischaltung: Karte …“ entfallen; Sammlung nach Familie und Stufe, dazu die gebannten Karten. Textsuche-Test über alle Reiter. Der Graph-Test aus Teil 1 bleibt. |
| K2.06 Entdeckungsmoment | erfüllt. Einblenden 300 ms, Marke „neu“ (Reiter, Bauoption, Einheit, Ausbau, Forschung), genau ein Hinweis je Moment (Test: drei gleichzeitige Freischaltungen → ein Hinweis), Hinweis und Marke nach fertiger Forschung. |
| K2.07 Schalter | erfüllt. Tabelle unten; `standard` ohne Schalter identisch (Golden-Test, Messung 42/46/46 vorher wie nachher); Lauf `standard` mit `?entdecken=1&buehne=1` in der Browser-Prüfung. |
| K2.08 Messung, Protokoll, Leitfaden | Messung und Protokoll erfüllt, Ziel verfehlt (unten). |

#### K2.08 Sichtbare Bedienelemente
Fester Lauf: Seed 424242, Bot „einheiten-zuerst“, Profil „durchschnitt“, Normal, `tools/sichtbar-mass.mjs`; gezählt werden Knöpfe, Reiter und Leistenelemente (alle Reiter aufgeklappt, nur Reiter mit sichtbarem Knopf), ohne den gleichbleibenden Rahmen von 16 Elementen (Menü, Kamera, 9 Raster-Plätze, Hinweis). Rohdaten `reports/sichtbar-*.json` (mit Liste der Elemente).

| Zustand | Minute 1 | Minute 5 | Minute 10 | neu zwischen 1 und 10 |
|---|---|---|---|---|
| nach Teil 1, `karten` | 47 | 49 | 49 | 19 |
| nach Teil 2, `karten` (Entdecken an), nach den Fehlerbehebungen vom 09.10. | **16** | 28 | 39 | 26 |
| nach Teil 1, `standard` | 42 | 46 | 46 | 8 |
| nach Teil 2, `standard` ohne Schalter | 42 | 46 | 46 | 8 |
| nach Teil 2, `standard` mit `?entdecken=1&buehne=1` | 28 | 32 | 31 | 9 |

Lesart: Minute 1 sinkt im Modus `karten` von 47 auf 16 (−66 %), das Verhältnis zu Minute 10 von 0,96 auf 0,41; das Ziel 0,33 (≤ 13) ist **knapp verfehlt** (vor den Fehlerbehebungen: 22, Verhältnis 0,51; die fünf gesperrten Mauer- und Turmoptionen zählten noch mit). Der Bot hat in Minute 1 schon 5 Fabriken gebaut, Einheiten gekauft und drei Wellen geschickt; das öffnet Versorgung, Armee und die fünf Mauer- und Turmoptionen auf einmal (16 = 7 Leistenelemente, Klickfeld mit Presse, 3 bis 4 Reiter, 2 Einheiten, Kaserne). Stellschrauben, falls das Ziel gelten soll (jeweils Entscheidung des PO, nicht umgesetzt): (a) (erledigt: gesperrte Mauer- und Turmoptionen sind verborgen), (b) Armee- und Versorgungsanzeige zu einer Anzeige verschmelzen, (c) den Reiter Mauer & Türme erst mit der ersten gegnerischen Welle öffnen. Ein Mensch öffnet in Minute 1 weniger als der Bot.

#### Zuordnung K2.04: sichtbar ab
| Element | sichtbar ab |
|---|---|
| Reiter Bauen, Armee; Material, Wellen, Mauer, Zeit, Menü | Start |
| Reiter Mauer & Türme | erste mögliche Handlung dort (erste enthüllte Mauer-, Turm- oder Reparaturoption) |
| Reiter Schmiede / Universität | Gebäude gebaut; der Reiter bleibt nach Abriss („nicht gebaut“) |
| Reiter Karten | Wahl ansteht oder erste Wahl getroffen |
| Abschnitt Kaserne (Reiter Armee) | Kaserne baubar |
| Bauoption (Kontext) | freigeschaltet (Karte) und Platz gewählt |
| Einheit | freigeschaltet oder erforscht |
| Ausbaustufe | vorige Stufe gekauft und Quelle erfüllt (`isAvailable`, `revealed`) |
| Forschung | geöffnet, Voraussetzung erfüllt, Universität gebaut |
| EP und Kartensymbol | erster EP-Gewinn |
| Versorgung | erste gekaufte Einheit |
| Armeezustand | erste eigene Welle |
| Zinsen / Nachbarschaftsbonus | Kontor bzw. zweites Gebäude gebaut |
| leere Spalten und Abschnitte | nie sichtbar (Mauer-, Forschungsspalten, Pfadgruppen) |

#### Zuordnung K2.07: Schalter und Modi
| Schalter | `karten` (Standard) | `standard` (Standard) | URL |
|---|---|---|---|
| `UI.kartenbuehne` (K2.01–K2.03) | an | aus | `?buehne=1\|0` |
| `UI.entdecken` (K2.04–K2.06) | an | aus | `?entdecken=1\|0` |
| `ENTDECKEN.vorschau` | keine | keine | `?vorschau=naechste` |
| `KARTENBUEHNE.zeit` | pause | pause | `?zeit=pause\|langsam\|lauf` |

Abbildung in `standard` mit Schaltern: Forschung sichtbar, wenn Voraussetzung erfüllt und Universität gebaut (kein „Öffnet mit“, im Standard gibt es keine Öffnung durch Karten); Bauoptionen und Einheiten wie im Standard freigeschaltet (Stufe 2 der gestaffelten Einführung bleibt); das Band zeigt die Kategorie statt der Familie.

#### Bildschirmfotos
`docs/bilder/k2-buehne-austeilen.png` (Karten fliegen aus der Leiste), `k2-buehne-offen.png` (Bühne, aufgedeckt, Vorderseiten), `k2-buehne-wirkflug.png` (Flug zum Wirkort), `k2-nach-wahl.png` (nach der Wahl, Wirkort leuchtet), `k2-ui-min1-karten.png`, `k2-ui-min10-karten.png`, `k2-ui-min10-standard.png`, `k2-rueckseite.png`.

#### Prüfungen
`npm test` (217 Tests, Golden-Test unverändert), Browser-Prüfung `tests/browser-check.mjs` und `tests/browser-k2.mjs` (REQ-K2.01–K2.07), Kurzsimulation `standard` unverändert (100 % Siege, keine offene Partie), Bot-Messläufe deterministisch.

#### Auffälligkeiten (berichtet, nicht behoben)
1. Knöpfe mit Klassenregeln (`.btn-ghost`) blieben trotz `hidden` sichtbar („Welle vorziehen“ ohne Kaserne). Bei Entdecken behoben, in `main` bestehend; Patch dort möglich.
2. Wellen-Anzeige ist bei Entdecken von Anfang an sichtbar (K2.04), im Standard erst mit der ersten Welle.
3. Karten mit Nachteil zeigen „mit Nachteil“ auf der Vorderseite; der Wortlaut steht erst in der Detailzeile.

#### Offen für den PO
1. Ziel K2.08 (Minute 1 ≤ ein Drittel): Stellschraube wählen (a, b oder c) oder Ziel anpassen.
2. Auslegungen 19–25 bestätigen (`docs/STAND-kartenpfad.md`), besonders 21 (nur erste Wirkung auf der Karte) und 22 (Ausschluss ohne Namen).
3. Übernahme nach `main` ist nicht Teil dieses Auftrags; Kriterien: Abschnitt 5 der Anforderungen.

#### Nachtrag 09.10.: Fehlerbehebung nach dem Spieltest
| Nr. | Befund | Ursache | Behebung |
|---|---|---|---|
| 1 | Bei gewählter Universität erscheint das Fenster „Kontor-Ausbau“ | Der Container der Kontor-Ausbauten hatte `display: flex` und überschrieb das Attribut `hidden`; der Fehler besteht auch in `main` | `.opts[hidden]` verbirgt den Container |
| 2 | In der Pause erzeugen etwa 6 Klicks Material | Die Spiellogik kennt die Pause nicht; die Klickzeit steht still, so blieb das Klicklimit von 6 je Sekunde bei jeder Pause frei | Klickertrag in Pause und Dialogen gesperrt (Aktion und Knopf); Test; besteht auch in `main` |
| 3 | Mauer-, Turm- und weitere Ausbauten stehen ausgegraut mit „Nur per Spezialkarte freischaltbar“ da | Bei Entdecken blieb der Ausbau sichtbar, sobald er bezahlbar war, auch wenn die Karte fehlte | Gesperrte Ausbauten verborgen; ein bereits gekaufter Ausbau, dessen Folgestufe gesperrt ist, zeigt „Nächste Stufe noch nicht verfügbar“ (ohne Verweis auf Karte oder Forschung) |
| 4 | Reiter „Mauer & Türme“ erscheint vor der Karte | Bedingung zählte jeden bezahlbaren Ausbau | Der Reiter erscheint, sobald dort etwas nutzbar ist: ein freigeschalteter Ausbau oder eine Reparatur (Reparaturen sind ohne Karte nutzbar, der Reiter kann daher mit dem ersten Schaden an der Mauer erscheinen) |

Tests: `tests/browser-k2.mjs` (B1–B4); Browser-Prüfung und `npm test` grün.


### C.2 Teil 1

### Klammerfront – Bericht Branch „Kartenpfad“ (Teil 1)

Branch `exp/kartenpfad`, Version 0.9-kartenpfad, Stand 07.10.2026. Anforderungen: `docs/anforderungen-kartenpfad.md`. Stand je Inkrement und alle Auslegungen: `docs/STAND.md`.

#### Ergebnis in drei Sätzen
Alle Inkremente KP.0 bis KP.7 sind umgesetzt und spielbar; `npm test` (208 Tests) und die Browser-Prüfung sind grün, der Standardmodus ist unverändert. Karten schalten Gebäude, Einheiten, Ausbaustufen und Forschungen frei, die Wahl liegt auf einer Kartenbühne in der Bildmitte. Die erste Simulation zeigte, dass der Pfad in 6-Minuten-Partien mit drei Wahlen kaum erreicht wird; nach dem Balancing (Entscheidung des PO) dauern Partien 9–10 Minuten mit 8–9 Wahlen, die Bots gewinnen aber weiter fast immer.

#### Entscheidungen des PO
- Auftrag und Standards laut Anforderungsdokument (3 Karten je Angebot, 4 mit Universität; Pause bei offener Bühne; gemeinsame Auswahl über alle Familien).
- Unterbau zuerst auf `main` (Standardmodus unverändert), danach der Branch darauf aufgesetzt.
- Balancing-Vorschläge (Wahlen, Forschungsdauer, Versorgung, Partielänge, Kennzahlen) vollständig freigegeben.

#### Umgesetzt je Inkrement
| Inkrement | Inhalt | Ergebnis |
|---|---|---|
| KP.0 | Voraussetzungen, Unterbau (`PACING_MODUS`, Freischaltlogik, Stufen mit Quelle, Einheitenersatz), Basislinie | fertig; auf `main` (`5c2f57b`) |
| KP.1 | Tutorial-Sprache nach Glossar, Sprach-Audit | fertig |
| KP.2 | Kartenbühne, Stapel, Tastatur, Sammlung im Reiter „Karten“ mit Pfadübersicht | fertig |
| KP.3 | Kartenfamilien, Bau-Karten, Startzustand `karten`, Meilenstein-Platz, Rückstandsgewicht | fertig |
| KP.4 | Universität als Forschungsstätte | fertig |
| KP.5 | Upgrade-Stufen, neue Einheiten, Einheitenersatz | fertig |
| KP.6 | Wagnis-Karten, Exklusivpaar, Mindesttempo | fertig |
| KP.7 | Bots, Kurzsimulation, Protokollfelder, Balancing, Testbuild | fertig; Abschlussserie läuft (siehe Offen) |

#### Inventar zur Freigabe
**Karten nach Familie**
- Bonus: 41 vorhandene Karten (Wirtschaft 9, Armee 11, Basis 7, Automatisierung 8, Sonderregel 6). Keine hat eine freischaltende Wirkung, daher ist nichts umzuordnen. Vier brauchen einen Turm, eine den Werfer, zwei ein Gebäude (Bedingung bestand schon).
- Bau (5): Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel.
- Technologie (4): Fortgeschrittene Taktiken, Ballistik (exklusiv zueinander), Eiserne Klingen, Befestigungskunde.
- Wagnis (2): Glaskanonen, Volle Auslastung.

**Bestehende Forschungen (13).** Alle bleiben Grundforschung (verfügbar, sobald die Universität steht). Ausnahme: „Schildträger“ (alt) entfällt im Modus karten und wird durch die Pfadforschung ersetzt. Neu: Reiter, Schildträger, Eisenwaffen, Mauerausbau III, Turmausbau, Armbrustschütze, Katapult (7).

**Upgrade-Stufen mit genau einer Quelle**
| Upgrade | frei (Stufe 1) | gesperrt | Quelle |
|---|---|---|---|
| Schmiede: Qualitätsstufe | Kauf 1–3 | ab Kauf 4 | Forschung Eisenwaffen |
| Kaserne: Ausbau | Kaserne selbst | ab Kauf 1 | Forschung Reiter oder Armbrustschütze (Linien schließen sich aus) |
| Mauer: Verstärkung | – | Kauf 1 / ab Kauf 2 | Karte Festungsbau / Forschung Mauerausbau III |
| Stachelwall, Mörtelkolonne | – | alle | Karte Festungsbau |
| Turm: errichten, Kaliber | – | Kauf 1 / ab Kauf 2 | Karte Festungsbau / Forschung Turmausbau |
| Reichweite, Feuerrate (Turm) | – | alle | Forschung Turmausbau |
| Zinseszins (Kontor), Presse | alle frei | – | – |

#### Abnahmekriterien
| Kriterium | Ergebnis |
|---|---|
| Startzustand `karten` entspricht der Liste; `standard` unverändert | erfüllt (Tests, Golden-Test) |
| Bau-Karte öffnet genau ihre Inhalte; gesperrte Inhalte nennen die Quelle | erfüllt (Test, Browser-Prüfung, `explAudit`) |
| Graphtest: jede Quelle erreichbar, keine Zyklen | erfüllt |
| 1.000 Angebote: ≥ 1 Bonuskarte, Pfadkarte wenn ziehbar, ≤ 1 Wagnis, keine Technologie ohne Universität | erfüllt |
| Nicht gewählte Pfadkarte kehrt zurück; gewählte nicht | erfüllt |
| Bühne: Mitte ±5 %, alle Karten lesbar bei 1280×720 und 1920×1080 | erfüllt (Bilder unten) |
| Eingabesperre, Maustaste gedrückt, zwei Wahlen nacheinander, Reiter bleibt | erfüllt (Browser-Prüfung) |
| Spielstand steht bei offener Bühne still (`pause`) | erfüllt (Test) |
| Technologiekarte öffnet Forschungen; Forschung nur bei laufender Zeit; Plätze; Abriss | erfüllt (Tests) |
| Einheitenersatz wertet auf, Zahl bleibt gleich | erfüllt (Test) |
| Wagnis, Exklusivpaar, Mindesttempo | erfüllt (Tests) |
| Sprach-Audit grün; Texte in beiden Sprachen; Längenregel | erfüllt |
| Simulation `standard` mit gleichem Seed identisch | erfüllt (Golden-Test) |
| Kaserne bis Minute 6 ≥ 90 %, Schmiede bis Minute 8 ≥ 80 % | teilweise (siehe Kennzahlen) |
| Strategievielfalt der Pfad-Varianten ≤ 15 pp | erfüllt in den Zwischenserien (3–15 pp) |
| Wahlbreite je Karte 5–60 % | teilweise: Echtes Militär und Gelehrte über 60 %, Bonuskarten teils unter 5 % |
| Paarvergleich +3 … +25 pp | steht aus; für Bau-Karten nicht erreichbar (einzige Quelle) |
| Partielänge P90 ≤ 20 min, Patt ≤ 2 % | erfüllt (Partien enden nach 6–11 min, keine offenen) |

#### Kennzahlen
**Basislinie Standardmodus** (Normal, 20 Partien): 3–7 Wahlen je Partie, erste Wahl nach 76–86 s.

**Erste Serie, Modus karten, Startwerte des Dokuments** (Normal, durchschnitt, 40 Partien je Feld): Siegquote 63–100 %, Median bis zum Sieg 5:40–6:20 min, 3 Wahlen, Kaserne bis 6:00 in 53–100 %, Schmiede bis 8:00 in 0–68 %.

**Kalibrierung** (Normal, durchschnitt, „Militär zuerst“, 8–10 Partien je Strategie):
| Einstellung | Siege | Median | Wahlen |
|---|---|---|---|
| Startwerte | 10/10 | 5,5–5,6 min | 4 |
| Wellen ×1,4 (alle) | 1/10 (gierig) | – | 1 |
| Basis ×2,2 | 10/10 | 8,7 min | 6–7 |
| Basis ×3,5, Wellen bis ×1,5 | 10/10 | 10,4–11,2 min | 7–8 |
| zusätzlich EP-Wachstum 1,12 (übernommen) | 8/8 | 9,2–10,4 min | 8–9 |

Die Zeit von der Technologiekarte bis zur fertigen Einheit lag in den Serien bei 1:00–1:30 min (Forschungsdauer 45–50 s plus Wartezeit auf Material).

#### Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Bots gewinnen fast immer.** Auch nach dem Balancing liegt die Siegquote bei 100 %. Der Bot ist kein Mensch; ein Spieltest muss Wartezeit und Wahlzeit klären.
2. **Fehler im Simulations-Bot.** Bei vollem Raster hielt er Material zurück und kaufte keine Einheiten. Im Modus karten (frühe Niederlagen) ist das korrigiert. Im Standardmodus bleibt es, damit die Vergleichswerte gelten; mit Korrektur gewänne der Standard-Bot schneller (Median 6:42 statt 9:17 min, 10 Partien). Vergleiche zwischen den Modi gelten daher nur mit Vorbehalt.
3. **Ein Faktor auf alle Gegnerwellen scheitert.** Die ersten Wellen entscheiden; bei ×1,4 verlor die gierige Strategie 9 von 10 Partien.
4. **Frühes Spiel im Modus karten.** Ohne Mauer-Stufen, Türme und Kaserne-Ausbau fehlen Material-Senken; vor der Korrektur lagen bis zu 2.500 Material ungenutzt.
5. **Die Bau-Karten sind einzige Quellen.** Ihr Paarvergleich zeigt zwangsläufig mehr als +25 pp; das Kriterium gilt nur für Technologie und Wagnis.

#### Abweichungen und Auslegungen (zur Bestätigung)
Vollständig in `docs/STAND.md` (Nr. 1–18). Die wichtigsten:
1. `branch-konzepte-pacing.md` fehlt im Repository; der Unterbau folgt dem Anforderungsdokument.
2. Pfadkarte „Festungsbau“ heißt wie die Bonuskarte „Festungsbau“ (Kennung `pfadFestungsbau`); Vorschlag: Bonuskarte im Modus karten umbenennen.
3. Pfadkarten der Familien Bau und Technologie sind nicht bannbar (einzige Quelle ihrer Inhalte).
4. Harte Grenze „dritte Wahl“ nur, solange höchstens drei Bau-Karten zugleich warten; sie arbeitet als Warteschlange.
5. Kaserne-Ausbau 2 hat zwei Quellen, die sich ausschließen (Reiter oder Armbrustschütze), damit beide Linien Versorgung bekommen.
6. Gebäude-Ausbaustufen den vorhandenen Upgrades zugeordnet (Tabelle oben); Presse und Zinseszins bleiben frei.
7. Das Audit prüft die Präfixe `tut.` und `kp.`; die Wortliste trifft am Wortanfang (damit „Eisenwaffen“ zulässig ist).
8. Zweiter Forschungsplatz = die bestehende Forschung „Zweiter Platz“.
9. Wagnis-Karten mit eigener Seltenheit und Gewicht 4 (gegenüber 10 bei Pfadkarten).
10. Balancing über Basis- und Wellenfaktor, EP-Wachstum und Forschungsdauer (Werte siehe `docs/STAND.md`, Abschnitt Balancing).

#### Bildschirmfotos
- Kartenbühne 1280×720: `docs/bilder/kartenbuehne-1280x720.png`
- Kartenbühne 1920×1080: `docs/bilder/kartenbuehne-1920x1080.png`
- Erste Sprechblase deutsch: `docs/bilder/tutorial-sprechblase-de.png`, englisch: `docs/bilder/tutorial-sprechblase-en.png`

#### Testbuild
Spielbar: https://claude.ai/artifact/UqAfaz9fzuAtNFMHxyUfqt (privat, Protokollexport an). Leitfaden: `docs/testleitfaden-kartenpfad.md`; Protokollformat 2 enthält gewählte Karte mit Alternativen, Bedenkzeit, Neu ziehen, Bannen, Freischaltungen und Forschungen mit Zeit. GitHub Pages bietet keinen Link je Branch; der Link ist ein Artifact.

#### Offen für den PO
1. **Abschlussserie:** `sim-karten` mit 30 Partien je Feld läuft (Rohdaten `reports/kartenpfad-*`); der Paarvergleich je Karte (rund 2.200 Partien, 2–3 Stunden) ist noch nicht gelaufen. Beide Ergebnisse folgen als Nachtrag.
2. **Zielpartielänge:** 9–10 min liegt knapp unter dem vorgeschlagenen Ziel von 10–14 min. Weiter erhöhen oder erst den Spieltest abwarten?
3. **Namensdopplung** „Festungsbau“ (Bonus und Pfad), Namen „Statthalter“/„Quartiermeister“ bestätigen.
4. **Freigabe:** Kein Merge nach `main` oder `MVP`, bevor du zustimmst; der Branch ist Experiment.


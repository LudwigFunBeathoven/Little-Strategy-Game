# Klammerfront – Entwicklungsstand und Entscheidungen für die Planung

Stand 15.10.2026, nach Kartenpfad Teil 5. Das Dokument ist in sich abgeschlossen: Es nennt Stand, Spielregeln des Modus `karten`, Messwerte, Befunde und die Entscheidungen, die vor dem nächsten Entwicklungsschritt fallen müssen.
Es ersetzt `docs/entwicklungsstand-planung-kartenpfad-4.md` als Einstieg. Dessen Befunde A bis I und Entscheidungen D1 bis D9 sind in Abschnitt 4 und 5 mit ihrem heutigen Stand nachgeführt; die Berichte von `main`, MVP und Teil 1 bis 4 bleiben gültig.

## 0. Auftrag an Cowork (zum Einfügen vor dem Dokument)
> Du planst den nächsten Entwicklungsschritt des Browser-Spiels „Klammerfront“ für den Product Owner Nick (kein Entwickler; Deutsch, knapp, Ergebnis zuerst, schwache Annahmen offen benennen).
> Lies das folgende Dokument. Entscheide nichts aus Abschnitt 5 selbst; stelle zu jeder Entscheidung, die den Zuschnitt berührt, eine Rückfrage mit Empfehlung. Erzeuge danach ein Anforderungsdokument im Stil der bisherigen (Abschnitt 7): Ziel, nummerierte Anforderungen REQ-<Kürzel>.<nn> mit Akzeptanzkriterien, Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, Abschnitt „Schwache Annahmen und offene Punkte“.
> Fehlt eine Zahl, sag es und schlage eine Messung vor. Unterscheide in jedem Akzeptanzkriterium, ob es mit Bots messbar ist oder erst im Spieltest mit Menschen. Prüfe vor jedem Kriterium auf Siegquote, ob die Bots das Feld überhaupt trennen (Befund E: Normal gewinnen alle Bots 100 %).

## 1. Auf einen Blick
| Linie | Version | Stand | Inhalt |
|---|---|---|---|
| `main` | 0.9.2 | Commit `73e1590` | Basisspiel mit Tutorial, Startbildschirm, Kartenbühne und Entdecken (an). Unverändert seit Teil 3 |
| veröffentlichter MVP | 0.9.2 | identisch mit `main` | GitHub Pages `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/` |
| Kartenbranch `exp/kartenpfad` | 0.9.2-kartenpfad-5 | Commit `c2ff557` (N.7), danach nur Dokumente | Experiment: Grundausstattung ab Start, Pacing aus dem Spielfluss, Forschungsbudget, Doktrinen mit Sonderbauten, Linien als Regeländerungen, kleinerer Kartenpool. Nicht auf `main`, nicht im MVP. Spielstand-Version 10 (Teil 4: 9) |
| privater Testbuild | wie Kartenbranch | `https://claude.ai/artifact/29Pt2xSiSmjAeZvRJBeUhP` | spielbar, Sitzungsprotokoll immer an, nur für den Eigentümer sichtbar (Freigabe über „Teilen“ der Seite). Die Testbuilds von Teil 4 (`XkPEqoEHjZThGfXSKfGaAC`) und Teil 3 (`KtUqgPYNPHyc29vDXvMbHb`) sind überholt |

Prüfstand: `npm test` 353 Tests grün, `npm run test:browser` 589 Prüfpunkte grün, Modus `standard` unverändert (Golden-Test).

Offen auf GitHub und im Repository:
- Das Release-Tag `v0.9.2` auf `MVP` kann nur der PO anlegen (aus der Cloud-Umgebung nicht möglich).
- Der Sitzungsbranch `3x3-und-3-Lanes-Spiel` ist unberührt; gearbeitet wurde nur auf `exp/kartenpfad`, wie die Anforderung es vorgibt.
- Eine Datei `/n0.done` im Wurzelverzeichnis der Cloud-Umgebung stammt aus einem früheren Skriptfehler; die Sicherheitsprüfung hat das Löschen abgelehnt. Sie gehört nicht zum Projekt und liegt nicht im Repository.

## 2. Das Spiel und die Arbeitsweise
Browser-Spiel zwischen *Universal Paperclips* (Klicken, Idle-Ökonomie) und *Age of War* (Lane-Kampf). Der Spieler klickt Material, baut Fabriken und Gebäude im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Abschüsse bringen Erfahrung (EP).
Jeder Stufenaufstieg bietet Spezialkarten mit bis zu drei Stufen. Die Partie ist verloren, wenn das Tor fällt, gewonnen, wenn die gegnerische Basis fällt. Drei Schwierigkeitsgrade (Leicht, Normal, Schwer).

**Modus `karten` (nur im Kartenbranch):** Alle Grundgebäude, Türme und Werfer gibt es ab Start. Karten öffnen Strategien (Technologie, Doktrinen, Bonus, Wagnis), sie schalten keine Grundlagen mehr frei. Die Kartenwahl entsteht aus dem Spielfluss (EP), nicht aus der Zeit.
**Modus `standard`:** alles ab Start nutzbar, Verhalten von `main`. Im Branch per `?pacing=standard` erreichbar und durch einen Test an `main` gebunden. Alle Regeln aus Teil 4 und 5 gelten nur im Modus `karten`.

Arbeitsregeln, die Anforderungen beachten müssen:
- Alle Spielwerte stehen in `config.js`, alle sichtbaren Texte in `i18n/de.js` und `i18n/en.js` (Schlüssel identisch; Modus-Suffix `.karten` überschreibt den Standardtext); Zufall nur über den seedbaren Generator im Spielstand.
- Features, die das Spiel im Kern ändern, entstehen zuerst im Kartenbranch (Grundsatz des PO). Ein Release entsteht nur, wenn der PO eine Iteration nach `main` freigibt; `MVP` folgt `main` per Fast-Forward.
- Fertig heißt: `npm test` (353 Tests) und `npm run test:browser` (589 Prüfpunkte) grün, Kurzsimulation ohne offene Partie, neue Knöpfe mit Tooltip und Erklärzeile, Bericht mit Abnahmetabelle. Ändert sich die Spielstand-Version (jetzt 10), verlieren Spieler ihren Spielstand.
- Weicht eine Umsetzung von einer Anforderung ab, wird begründet und nachgefragt.

### Regeln des Modus `karten` nach Teil 5 (neu seit dem Stand von Teil 4)
**Grundausstattung.** Fabrik, Kaserne, Schmiede, Universität, Kontor, Läufer, Werfer sowie alle Ausbaustufen von Mauer, Türmen und Kaserne gibt es ohne Karte. Die Kaserne hat die Ausbaustufen „Quartiere“ (+2 Versorgung je Stufe); Versorgung wächst nur durch Kauf oder Doktrin (Heerlager +6).
Bau-Karten und „Echtes Militär“ entfallen. Technologie-Karten (erst mit stehender Universität) öffnen die Forschungen für Reiter, Schild, Armbrust, Katapult, Eisenwaffen, Wehrgang und Schießscharten.

**Kartenwahl aus dem Spielfluss.** Eine Wahl wird fällig, wenn die EP die Schwelle erreichen: Schritt k = 70 × 1,05^(k−1) × Faktor je Grad (Faktor Standard 1). Der Mindestabstand von 45 s ist nur eine Bremse zwischen zwei Wahlen. Es gibt keine Zielzeit, keinen Höchstabstand und keine Zeitautomatik; das Kartensymbol zeigt den EP-Fortschritt.
EP-Quellen: Abschüsse (auch durch Türme), Schaden an der gegnerischen Basis (10 EP je Prozent der Basis-LP), vollständig abgewehrte Gegnerwelle (4 + 2 EP je Einheit der Welle), Forschungsbudget, Material über dem Lagerdeckel (Linie Wirtschaft Stufe 2), Beute (Tutorial). Der Hörsaal (passive EP über die Zeit) entfällt.

**Forschungsbudget.** Reiter Universität, drei Knöpfe 0 / 25 / 50 %. Der gewählte Anteil des laufenden Materialertrags (Fabriken und Presse) wird zu EP; Kurs 0,08 EP je Material, bei 50 % × 0,7 (je höher der Anteil, desto schlechter der Kurs).

**Doktrinen.** Sechs Karten der Familie `doktrin`; jede trägt drei Zeichen ihrer Linie, einen Effekt, einen Sonderbau (außer Vorstoß und Ausfall) und eine bindende Einschränkung. Ab Wahl 3, spätestens in jedem dritten Angebot eine (Bonusplatz, nie zwei in einem Angebot), höchstens zwei je Partie; wer eine Linie führt (mindestens zwei Zeichen), zieht deren Doktrinen mit dreifachem Gewicht.

| Linie | Doktrin | Sonderbau | Effekt | Einschränkung |
|---|---|---|---|---|
| Wirtschaft | Zunftordnung | Fabrik → Zunfthaus (3× Baukosten) | Nachbarschaftsbonus des Zunfthauses ×3 | höchstens 4 Fabriken und Zunfthäuser |
| Wirtschaft | Stiftung | Universität → Stiftungshaus (2× Baukosten) | Kurs des Forschungsbudgets ×2 | Einheiten +20 % Kosten |
| Militär | Stehendes Heer | Kaserne → Heerlager (3×) | Versorgung +6 | jede Einheit auf dem Feld kostet 1 Material je Minute Unterhalt |
| Militär | Vorstoß | – | eigene Wellen im halben Abstand | Türme feuern 30 % langsamer |
| Verteidigung | Bollwerk | Fabrik → Bastion (3×): Turm im Raster | Bastion mit 1,5 × Turmschaden; Abschüsse durch Türme und Bastionen bringen doppelte EP | Fabriken −15 % Ertrag |
| Verteidigung | Ausfall | – | Gegenstoß nach jeder abgewehrten Welle, +100 % Stärke | Reparatur der Mauer kostet das Doppelte |

**Zeichen und Linien (neu gefasst).** Zeichen tragen nur die sechs Doktrinen (je drei) und Gebäude-Varianten (eines je Variantentyp, Grundvariante oder Sonderbau). Bonus-, Technologie- und Wagnis-Karten tragen keines. Stufe 1 ab 2, Stufe 2 ab 4, Stufe 3 ab 6 Zeichen; Stufe 3 setzt eine gewählte Doktrin der Linie voraus. Die Oberfläche zeigt eine Linie erst mit ihrer Stufe 1.
Die Stufen sind Regeländerungen, keine Prozentboni:

| Linie | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|
| Militär | Kaserne schickt je Welle 1 Läufer mehr | Neue Einheiten starten mit einer Schmiede-Stufe mehr | Durchbruch: doppelter Schaden an der gegnerischen Basis |
| Wirtschaft | Nachbarschaftsboni wirken auch diagonal | Material über dem Lagerdeckel wird zu EP (Lagerdeckel = Ertrag von 3 min, mindestens 1500) | Söldner: Einheiten über dem Versorgungslimit, ohne Versorgung, +50 % Kosten |
| Verteidigung | Abschüsse durch Türme bringen Material | Gegenstoß nach jeder abgewehrten Welle | Ausbruch: Gegenstöße +50 % Stärke und doppelter Schaden an der Basis |

**Gebäude-Aufwertung und Varianten.** Ab Minute 3 lässt sich ein stehendes Gebäude einmal zu einer Variante aufwerten; sie ruht während der Aufwertung. Eine Grundvariante ist endgültig, ein Sonderbau löst sie ab (Auslegung 1).

| Gebäude | Militär | Wirtschaft | Verteidigung |
|---|---|---|---|
| Fabrik | Werkstatt: Einheitenkosten −25 % (vorher −10 %) | Manufaktur: Ertrag +20 % (vorher +40 %) | Wachstube: Türme +30 % Schaden und Material je Turm-Abschuss (vorher +15 %) |
| Kaserne | Exerzierplatz | Zahlmeisterei (neu): Quartiere −30 % | Garnison |
| Schmiede | Waffenschmiede | Münzschmiede (neu): Ausbau −25 % | Rüstkammer |

**Kartenpool.** 28 Karten (22 Bonus, 4 Technologie, 2 Wagnis) statt 45; jede Karte erfüllt die Spürbarkeitsgrenze (Regeländerung oder mindestens 20 % Größe). 13 Karten haben Stufen mit neuem Effekt, bei 7 ist Stufe 2 oder 3 eine Regeländerung. Angebot: 3 Karten, mit Universität 4; zwei Pfadplätze, der Rest Bonusplätze.
**Schwer:** Grundwelle der Gegner im Modus `karten` 4,0 (Normal 2,0). **Testschalter** `?druck=hoch`: reguläre Gegnerwellen ab Minute 4 um ein Drittel größer; Standard aus.

## 3. Was Teil 5 geliefert hat
Anforderung: `docs/anforderungen-kartenpfad-5.md`, Bericht: `docs/bericht-kartenpfad-5.md` (alle Tabellen, Kartenpool-Inventar, 18 Auslegungen), Testleitfaden: `docs/testleitfaden-kartenpfad-5.md`, Stand je Inkrement: `docs/STAND-kartenpfad.md`. Inkremente N.0 bis N.7, alle fertig, nichts gestrichen.

| REQ | Inhalt | Ergebnis |
|---|---|---|
| K5.01 | Basismessung | Fahrplan abgeschaltet: nur 3 Wahlen in 16:44, längste Lücke 424 s, 2 % Siege. Ohne neue EP-Quellen taugt der Spielfluss nicht als Takt (Befund A) |
| K5.02 | Grundausstattung ab Start | Test: alle Gebäude und Einheiten ab Start; keine Bau-Karte im Pool. Schwer, „durchschnitt“: 74 → 86 % Siege (Ziel 70–90 %) nur mit Grundwelle 4,0 (Befund D) |
| K5.03 | Pacing aus dem Spielfluss | Normal, „durchschnitt“: 14 Wahlen in 13:35, längste Lücke 89 s im Median, 142 s P90 (Ziele: 12–16 Wahlen, 13–17 min, 120/180 s). „gelegentlich“ liegt mit 125/191 s knapp darüber |
| K5.04 | Karten und Upgrades mit Zeitbezug | Alles Zeitgebundene entfernt oder umgeschrieben (Fahrplan, Höchstabstand, Hörsaal, Nachtschicht, Glücksritter-Fassung); Test `pool5.test.mjs`, Inventar im Bericht |
| K5.05 | Forschungsbudget | Umgesetzt, Hörsaal entfällt. **Verfehlt:** 50 % gegen 0 % bringt +2 (durchschnitt) und +1 (aktiv) Wahlen statt +3; Siegquote +0 pp (Befund I) |
| K5.06 | Kartenpool bereinigen | 28 Karten, Stufen mit neuem Effekt; Wahlrate 5–60 % bis auf zwei Pfad-Artefakte der Bots (Befund K) |
| K5.07 | Doktrinen und Sonderbauten | Sechs Doktrinen, vier Sonderbauten, Einschränkungen; 3 bis 4 Angebote mit Doktrin je Partie (Ziel ≥ 3). **Verfehlt:** Paarvergleich +5 bis +25 pp nicht messbar (Befund E) |
| K5.08 | Linien neu | Stufen als Regeländerungen; Verteidigungs-Bot mit `?druck=hoch`: 14:02 Median, 0 % offen (vorher 23:57, 4 %); Linien-Bots 2 pp auseinander (Normal, ohne Schalter) |
| K5.09 | Grundvarianten angleichen | Fabriken ohne Variante bei Minute 10: 0 bis 4 (Ziel ≤ 4); größter Anteil einer Grundvariante 24,6 % (Grenze 60 %) |
| K5.10 | Bots, Messung, Bericht, Testbuild | Linien-Bots mit Doktrinen, Sonderbauten und Budgetregel; Messwerkzeuge `sim-p5`, `bericht-p5`, `kalibrieren-p5`; Protokollfelder; Testbuild; Testleitfaden |

Nicht angefasst (laut Anforderung): Druckkurve und Belagerung, Raster (bleibt 3×3), neue Grafik, Einheitenverhalten, Leistungsoptimierung, `main`, Spieltest.

## 4. Befunde
**A. Der Spielfluss trägt den Takt nur mit neuen EP-Quellen.** Ohne Fahrplan und ohne neue Quellen: 3 Wahlen in 16:44, 424 s längste Lücke. Ursache: Ab etwa Minute 2:30 belagert die Armee das gegnerische Tor, die Gegnerwellen sind blockiert, Abschüsse bleiben aus. Mit 10 EP je Prozent Basisschaden (vorher 4) und EP für abgewehrte Wellen liegen die EP in Minute 4 bis 8 bei 70 je Minute (vorher 27); die längste Lücke bei 89 s.
Die ersten Wahlen fallen im Wesentlichen im Mindestabstand von 45 s (viele Abschüsse in der Eröffnung); danach bestimmt der Basisschaden den Takt.

**B. Schwächere Profile bekommen mehr Wahlen, nicht weniger.** Die Annahme eines Schneeballs bestätigt sich nicht: Normal bekommt „aktiv“ 12 Wahlen, „durchschnitt“ 14, „gelegentlich“ 18. Die Partie dauert 12:58, 13:35 und 20:21 Minuten. Die Zahl der Wahlen folgt der Partiedauer. Erklärung (nicht gesondert geprüft): Wer langsam spielt, sammelt über die lange Partie mehr EP aus Abschüssen und abgewehrten Wellen.

**C. Lange Partien bekommen eine EP-Flut und überschreiten die alten Zielkorridore.** „gelegentlich“ auf Normal: 12+ min 1.250 EP je Minute (nach der Belagerungswelle in Minute 16 fallen viele Gegner), 18 Wahlen (Obergrenze durch den Mindestabstand), Dauer 20:21 Median; auf Leicht 19:23. Das Kriterium aus Iteration 6 (90. Perzentil der Siege ≤ 20 min) ist für diese Felder voraussichtlich verletzt; Teil 5 hat es nicht nachgemessen.
Auch die Korridore in `CLAUDE.md` (Iteration 2 bis 5) gelten nicht mehr: Normal, „aktiv“ 12:58 (Korridor 6–9), „durchschnitt“ 13:35 (9–13), Schwer „aktiv“ 12:18 (8–12). Das ist die Folge der PO-Entscheidung „Partie von etwa 15 Minuten“, aber die Korridore sind nicht fortgeschrieben (F6).

**D. Schwer hängt an einem Sprung in der Eröffnung.** Grundwelle 3,8 und 4,0 liefern 86 bis 87,5 % Siege (Schwer, „durchschnitt“), 4,2 nur 20 %. „gelegentlich“ verliert auf Schwer immer (1:29, Ziel „verliert“); „aktiv“ gewinnt 100 %. Die Grundausstattung (Kaserne, Werfer, Türme ab Start) hat Befund A aus Teil 4 beseitigt; die Grundwelle wurde dafür von 3,5 auf 4,0 angehoben, um die Siegquote im Korridor (70–90 %) zu halten. Der Übergang ist ein Sprung, kein Verlauf; für Menschen ist die Lage unbekannt.

**E. Die Doktrinen lassen sich in der Siegquote nicht messen.** Normal gewinnen alle Bots mit und ohne Doktrin 100 %. Auf Schwer (90 bis 92 %, mit `?druck=hoch` 73 bis 77 %) verlieren in beiden Armen dieselben Seeds in der Eröffnung, vor der ersten Doktrin (Wahl 5 bis 8). Auch `?druck=hoch` mit Faktor 2,0 hält die Normal-Bots bei 100 %.
Als Ersatzmaß dienen Dauer, Wahlen, Mauerverlust und Turm-Abschüsse (Tabelle in Abschnitt 8). Ergebnis: **Die Militär-Doktrinen verkürzen die Partie um 2:38 (Stehendes Heer) und 3:10 Minuten (Vorstoß); der Mauerverlust sinkt von 34 auf 14 und 11.** Die Wirtschafts- und Verteidigungs-Doktrinen verändern die Dauer um 21 bis 27 s (länger), also nicht.

**F. Verteidigungsdoktrinen greifen nur, wenn Gegner die Mauer erreichen.** Die Belagerung (Befund 4.1 aus Teil 3, in Teil 4 und 5 ausdrücklich nicht angefasst) hält die Gegnerwellen auf: 0,3 Turm-Abschüsse je Partie, 0 bis 5 Gegenstöße. Bastion und Ausfall sind in der Simulation fast wirkungslos; Bollwerk kostet 15 % Fabrikertrag. Der Mauerverlust liegt bei Bollwerk höher als ohne (98 gegen 52), also entgegengesetzt zur Erwartung; die Ursache wurde nicht untersucht (Fortschreibung von Befund C aus Teil 4).

**G. Die Wirtschaftsdoktrinen wirken nicht auf die Siegzeit.** Der Wirtschaft-Bot hat Material im Überfluss, die Wellengröße begrenzt die Versorgung. Zunftordnung: 14:34 gegen 14:07 ohne; Stiftung: 14:31 gegen 14:07. Das Stiftungshaus baute der Bot beim dreifachen Preis (900) in 4 % der Partien, beim zweifachen (600) in 93 % (Auslegung 14). Lager und Söldner wirken nur beim Wirtschaft-Bot (Stufe 2 und 3 in 100 % der Partien ab 5:55 bzw. 7:44).

**H. Linienstufen kommen später als in Teil 4, Stufe 3 trotzdem früh.** Stufe 1 liegt bei 5:02 bis 5:50 (Teil 4: 3:10), weil Zeichen nur noch von Varianten (ab Minute 3) und Doktrinen kommen (Wahl 3 frühestens, im Median Wahl 6 bis 8). Stufe 3 liegt bei Minute 6:52 bis 7:57: Eine Doktrin (3 Zeichen) plus eine Variante geben Stufe 2, eine zweite Doktrin Stufe 3. Als „eigener Weg zum Sieg“ kommt Stufe 3 früh. Stellschrauben: Zeichenzahl der Doktrin, Schwelle 6, Wahl, ab der eine Doktrin erscheint.

**I. Das Forschungsbudget bringt höchstens +2 Wahlen.** Bei 50 % wandelt die Universität 18 bis 27 % der EP um; mehr Kurs (0,12; 0,16) hebt den Anteil auf 35 bis 42 %, aber die Zahl der Wahlen nicht über +2, weil Mindestabstand (45 s) und Partiedauer sie begrenzen. Eine flachere Schwellenkurve (Wachstum 1,07) ändert daran nichts. Die Annahme „reines Forschen wird dominant“ bestätigt sich nicht (Siegquote +0 pp, Dauer ±0:50).

**J. Die Fabrik-Dominanz ist gebrochen, solange ein Linien-Bot spielt.** Bei Minute 10 stehen 0 bis 4 reine Fabriken (Teil 4: 5,5); der Bot ohne Linie hält 5, weil er nie aufwertet. Verteilung der Aufwertungen (2.874 fertige Varianten): Manufaktur 24,6 %, Bastion 17,3 %, Zunfthaus 15,1 %, Werkstatt 9,1 %, Wachstube 8,4 %, die übrigen je höchstens 3,5 %. Sonderbauten zusammen 37,6 %. Der Verteidigungs-Bot baut im Mittel 3,3 Bastionen bei Minute 10 (Fabrikplätze): Die Frage nach den Fabriken verlagert sich auf die Bastion, harmlos in der Simulation.

**K. Der Bot ohne Linienwahl läuft in keine bestimmte Linie mehr** (Teil 4, Befund F: 100 % Militär). Stufe 1 erreicht er in Militär 26 / 30 %, Wirtschaft 26 / 34 %, Verteidigung 18 / 32 % der Partien (ohne / mit `?druck=hoch`), Stufe 2 und 3 in höchstens 6 %; Ursache: Karten tragen keine Zeichen mehr. Wahlraten (9.558 Angebote, Normal): 32 von 34 Karten zwischen 6 und 42 %, Doktrinen 12 bis 23 %; „Fortgeschrittene Taktiken“ (100 %) und „Eiserne Klingen“ (87 %) liegen über der Grenze, weil der Militär-Pfad der Bots sie zuerst wählt (misst den Bot, nicht die Karte).

**L. Messbasis und Leistung.** Alle Messwerte stammen von Bots (Befund I aus Teil 4 gilt unverändert); sie messen Machbarkeit, nicht, ob Menschen eine Doktrin bewusst wählen, den Sonderbau finden, das Budget verstehen oder die höhere Zahl von Wahlen als ermüdend erleben. Die Tick-Zeit liegt bei 0,22 ms im Median (P95 0,43 ms; Soll 1 ms) mit 120 Einheiten. Die Bildzeit im Browser (`tools/bildzeit.mjs`) steht nicht im Bericht von Teil 5.

### Stand der Befunde aus Teil 4
| Befund (Teil 4) | Stand |
|---|---|
| A Schwer hängt an der ersten Karte | behoben durch die Grundausstattung (Kaserne, Werfer, Türme ab Start); neue Form: Sprung in der Eröffnung (Befund D) |
| B Varianten brechen die Fabrik-Dominanz nicht | für Linien-Bots behoben (Befund J); für Menschen offen (Spieltest) |
| C Verteidigung ist langsam | Tempo behoben (14:02 mit `?druck=hoch`, 0 % offen); die Ursache, die Belagerung, besteht (Befund F) |
| D Schlüsselkarten bewirken wenig | Schlüsselkarten entfallen, durch Doktrinen ersetzt; Doktrinen für Wirtschaft und Verteidigung wirken in der Simulation ebenfalls wenig (Befunde F, G) |
| E Wirtschaft kann ihr Material nicht umsetzen | Stufe 3 „Söldner“ und Stufe 2 „Lagerdeckel → EP“ setzen es um; Linien-Bots liegen 2 pp auseinander (4 pp mit `?druck=hoch`; Teil 4: 15 bis 17 pp). Die Versorgung +2 aus Teil 4 entfällt |
| F Bot ohne Absicht läuft in Militär | behoben (Befund K) |
| G Wahlzeiten, Dauer, Leistung | Fahrplan entfällt; neue Werte in Befund A bis C und L |
| H Schwer „gelegentlich“ verliert in 60 % | verliert jetzt in 100 % (Ziel „verliert“) |
| I Messwerte stammen von Bots | besteht (Befund L) |

## 5. Entscheidungen
Reihenfolge nach Dringlichkeit. „Blockiert“ heißt: Der nächste Schritt lässt sich ohne Antwort nicht sauber zuschneiden. Die Nummern F1 bis F10 sind neu (F für Frage); die drei Fragen aus der Abschlussmeldung von Teil 5 sind F1, F2 und F3. Der Stand der Entscheidungen D1 bis D9 aus Teil 4 steht in der Tabelle am Ende des Abschnitts.

### F1 Doktrinen jetzt stärken oder erst nach dem Spieltest? (blockiert für den Zuschnitt)
- **Stand:** Befunde E, F, G. Die Simulation beurteilt nur die Militär-Doktrinen (Partie 2:38 bis 3:10 kürzer). Wirtschaft und Verteidigung wirken nicht messbar.
- **Optionen:** (a) Spieltest abwarten, Doktrinen unverändert; (b) Werte jetzt anheben (Zunfthaus-Faktor 3 → 5, Bastion 1,5 → 2,5; ein Versuch mit diesen Werten zeigte allein keinen Effekt in der Simulation); (c) Einschränkungen lockern.
- **Empfehlung:** (a). Ein Anheben ohne Messgröße ist Raten, und die Bots können Wirtschaft und Verteidigung nicht beurteilen. Der Leitfaden fragt nach Strafe oder Entscheidung (Frage 5) und nach dem Sonderbau (Frage 6).

### F2 Mindestabstand 45 s auf 35 s senken? (Forschungsbudget)
- **Stand:** Befund I. Das Budget bringt +2 statt +3 Wahlen; mehr Kurs hilft nicht. Das Kriterium K5.05 ist verfehlt.
- **Optionen:** (a) Mindestabstand 45 s lassen, das Kriterium auf +2 Wahlen senken; (b) Mindestabstand 35 s; (c) Kurs 0,12 oder 0,16 (bringt nicht mehr Wahlen, nur einen höheren Anteil der Budget-EP).
- **Empfehlung:** (a). Ein kürzerer Abstand erhöht die Zahl der Wahlen auch in langen Partien, die schon an der Obergrenze liegen (18 Wahlen, Befund C), und die Ermüdung (E8) ist unbekannt. (b) erst, wenn der Spieltest keine Ermüdung zeigt.

### F3 Stufe 3 der Linien später? (Befund H)
- **Stand:** Stufe 3 liegt bei Minute 6:52 bis 7:57; Doktrinen erscheinen in Wahl 5 bis 8.
- **Optionen:** (a) lassen; (b) Doktrinen erst ab einer späteren Wahl anbieten (Wert in `config.js`); (c) Schwelle von 6 auf mehr Zeichen; (d) Zeichen je Doktrin von drei auf zwei.
- **Empfehlung:** (a) bis zum Spieltest. Die Bots wählen Doktrinen gezielt, Menschen vermutlich später oder gar nicht; die Lage für Menschen ist unbekannt. Bei Bedarf (b), weil es nur den Zeitpunkt verschiebt, nicht die Regeln.

### F4 Verteidigung, Belagerung und Druckkurve (Fortschreibung von D4)
- **Stand:** Befund F. Zwei Teile in Folge haben die Belagerung ausgeschlossen; jetzt hängen zwei Doktrinen (Bollwerk, Ausfall) und die Linie Verteidigung an einer Mechanik, die in der Simulation nicht auslöst.
- **Optionen:** (a) Spieltest zuerst (Frage 10 im Leitfaden, mit `?druck=hoch`); (b) Teil 6: Belagerung blockiert nur einen Teil der Wellen, oder Wellen wachsen schneller, wenn die Armee am Tor steht; (c) die Verteidigungsdoktrinen so umbauen, dass sie ohne Gegner an der Mauer wirken.
- **Empfehlung:** (a), danach (b), wenn Menschen die Verteidigung als wirkungslos erleben. (c) verschiebt das Problem. Der Spieltest kostet nur Zeit; ein Umbau von Belagerung und Druckkurve ändert alle Zielkorridore.

### F5 Schwer: Grundwelle 4,0 bestätigen?
- **Stand:** Befund D. 3,8 und 4,0 liefern 86 bis 87,5 %, 4,2 nur 20 %.
- **Optionen:** (a) 4,0 bestätigen; (b) 3,8 (mehr Abstand zur Klippe); (c) die Eröffnung auf Schwer entschärfen (erste Gegnerwelle erst nach der ersten Wahl; berührt die Druckkurve).
- **Empfehlung:** (a). Der Wert liegt im Korridor (70–90 %). Die Klippe zeigt nur, dass die Eröffnung die Partie entscheidet; ob sie bei Menschen an derselben Stelle liegt, entscheidet der Spieltest mit Schwer-Teilnehmern. Zeigt er Niederlagen in den ersten zwei Minuten, dann (b).

### F6 Zielkorridore und Partiedauer fortschreiben (Befund C)
- **Stand:** Die Korridore in `CLAUDE.md` stammen aus Iteration 2 bis 6 (z. B. Normal, „durchschnitt“ 9–13 min). Die Messwerte liegen darüber, gewollt durch die PO-Entscheidung „etwa 15 Minuten“. „gelegentlich“ auf Normal (20:21) und Leicht (19:23) liegt über dem Kriterium aus Iteration 6 (90. Perzentil der Siege ≤ 20 min).
- **Optionen:** (a) Korridore neu aus der Messung nach Teil 5 festlegen und in `CLAUDE.md` ersetzen (nach dem Spieltest); (b) die Partielänge für „gelegentlich“ kappen (Basis-Lebenspunkte `basisFaktor` senken, verkürzt aber alle Profile); (c) lassen.
- **Empfehlung:** (a), nach dem Spieltest. Ein Bot „gelegentlich“ bildet einen sehr passiven Menschen ab; die Partielänge echter Spieler ist unbekannt.

### F7 Auslegungen aus dem Bericht bestätigen (blockiert für Teil 6, nicht für den Spieltest)
Die 18 Auslegungen stehen im Bericht (`docs/bericht-kartenpfad-5.md`) und in `docs/STAND-kartenpfad.md`. Diese verändern das Spiel am meisten:

| Nr. | Auslegung | Empfehlung |
|---|---|---|
| 1 | Sonderbau löst eine Grundvariante ab (Kosten fallen voll an) | bestätigen; ohne die Regel ist die Doktrin für Wirtschaft und Verteidigung wirkungslos: Alle Fabriken waren schon Manufakturen, bevor die Zunftordnung erschien |
| 2 | Bastion ist eine Fabrik-Variante, feuert in die Lane ihrer Zeile mit 1,5 × Turmschaden der Stufe max(2, Turm) und schweigt bei gefallener Mauer | bestätigen; ein eigenes Gebäude braucht ein größeres Raster (ausgeschlossen) |
| 3 | Die Grenze der Zunftordnung zählt Fabrikplätze (Zunfthäuser eingeschlossen); Bestand bleibt stehen | bestätigen |
| 4 | Drei Zeichen je Doktrin zählen sofort | bestätigen; die Zahl ist eine Stellschraube (F3) |
| 5 | Angebotsausgleich: erste Doktrin in Wahl 3, danach spätestens im dritten Angebot ohne Doktrin; keine mehr nach der zweiten | bestätigen |
| 6 | Lagerdeckel = Materialertrag von 3 Minuten (mindestens 1500); Material darüber wird zu EP (Kurs 0,08). Im Spiel gab es keinen Lagerdeckel | bestätigen; Alternative Zinsdeckel des Kontors (etwa 500 Material) würde größere Aufwertungen blockieren |
| 7 | Söldner laufen über denselben Einheitenknopf (1,5 × Kosten, keine Versorgung, rücken mit der nächsten Welle aus) | bestätigen; ein eigener Knopf kostet Platz in der Oberfläche |
| 8 | „Neue Einheiten starten mit der ersten Schmiede-Stufe“ gilt als eine Stufe mehr, auch ohne Schmiede | bestätigen; als Mindeststufe 1 wäre die Regel für jeden Spieler mit Schmiede wirkungslos |
| 9 | Durchbruch und Ausbruch verdoppeln den Schaden an der gegnerischen Basis (alle Einheiten bzw. Gegenstoß-Einheiten); mit Ausfall zählen die Stärkezuschläge zusammen (+150 %) | bestätigen |
| 10 | Münzschmiede (optional in der Anforderung) umgesetzt | bestätigen; jedes Grundgebäude hat eine Variante je Linie |
| 11 | Pool 45 → 28 Karten; gestrichene Karten über `KF_PFAD.entfallenKarten` zurückholbar | bestätigen; die Liste im Bericht prüfen, ob eine Lieblingskarte fehlt |
| 12 | Die Regeländerungen der Kartenstufen sind Vorschläge (z. B. Kriegstrommeln III ab drei Einheiten, Schildwall II) | bestätigen |
| 13 | Der Paarvergleich der Doktrinen misst keine Siegquote; Ersatzmaße (Befund E) | bestätigen; die Stärke beurteilt der Spieltest |
| 14 | Stiftungshaus kostet das Zweifache der Baukosten, nicht das Dreifache | bestätigen; beim Dreifachen baute es der Bot in 4 % der Partien |
| 15–18 | Kalibrierung (Start 70, Wachstum 1,05, 10 EP je Prozent, Schwer 4,0), Budget-Kurs bleibt 0,08, Fabrik-Kriterium nur für Linien-Bots, Zählung „Angebote mit Doktrin“ | bestätigen |

### F8 Spieltest: Rahmen und Abnahmekriterien (blockiert; Fortschreibung von D7)
- **Stand:** Testleitfaden `docs/testleitfaden-kartenpfad-5.md`: je Person zwei Partien (Normal; die zweite mit `?druck=hoch`), etwa 45 Minuten. Vier Fragen sind Kriterien aus der Anforderung (Mensch): bewusste Strategie (mindestens die Hälfte), Karte, die die Partie verändert hat (mindestens zwei Drittel), kein Leerlauf (keine Person), Linie bemerkt (mindestens die Hälfte); sechs weitere Fragen zu Doktrin, Sonderbau, Budget, Kartenpool, Grundausstattung und Verteidigung.
  Das Protokoll enthält zusätzlich EP je Quelle (`xpBySource`), Budget-Einstellungen, gewählte Doktrinen (`doktrinen[]`), Angebote mit Doktrin, Unterhalt, Linien und Varianten.
- **Zu entscheiden:** Teilnehmerzahl und Profile (Vorschlag aus Teil 3 und 4: sechs bis acht Personen, zwei erfahren, zwei auf Leicht mit Tutorial, zwei auf Schwer); Abnahme.
- **Empfehlung:** Spieltest vor Änderungen an F1, F3 und F4; F5 bekommt Schwer-Teilnehmer. F2, F6, F7 können vorher fallen, weil sie nur Werte und Kriterien betreffen.

### F9 Weg des Kartenpfads nach `main` (Gate; Fortschreibung von D8)
- **Stand:** Der Modus `karten` umfasst jetzt Grundausstattung, Pacing aus dem Spielfluss, Budget, Doktrinen, Linien und einen kleineren Pool. Er ist mit Bots getestet, mit Menschen nicht. Spielstand-Version 10 (ältere Spielstände werden verworfen).
- **Zu entscheiden:** Kriterien für einen Release 0.10 (Vorschlag: Spieltest-Abnahme aus F8 erfüllt, F1 bis F5 entschieden, Browser- und Unit-Tests grün, Modus `standard` weiter durch den Golden-Test an `main` gebunden) und ob `karten` Standardmodus wird oder ein wählbarer Modus im Startbildschirm.
- **Empfehlung:** Erst nach dem Spieltest. Ein wählbarer Modus im Startbildschirm hält `main` stabil; ein Wechsel des Standards betrifft Spielstand, Tutorial und die Zielkorridore von `main`.

### F10 Kalibrierung gegen Bots oder Menschen (Fortschreibung von D9)
- **Stand:** Alle Zielwerte stammen aus Bot-Läufen. Die Linien-Bots sind absichtlich extrem; die Schwellenkurve ist an den schnellen Bot angepasst.
- **Empfehlung:** Nach dem Spieltest die Profile an echten Sitzungen anpassen (`tools/compare-human.mjs`), dann kalibrieren; Doktrin- und Linienwerte erst danach anfassen.

### Kleine offene Punkte aus Teil 3 und 4
| Nr. | Thema | Stand |
|---|---|---|
| E7 | Hinweis bei vollem Raster | wahrscheinlich hinfällig: Der Anlass (Schmiede, Universität, Kontor warten auf eine Karte, das Raster füllt sich mit Fabriken) entfällt durch die Grundausstattung; nicht gemessen. Vorschlag: streichen, im Spieltest beobachten |
| E8 | Ermüdung der Bühne | **offen**, Spieltest. Die Wahlen steigen von 10 auf 12 bis 18; jede Bühne zeigt Zeichen, Doktrin und Wirkungszeile (Frage 5 aus Teil 3) |
| E13 | Tag `v0.9.2`, Testbuild | **offen**, nur der PO kann das Tag anlegen; Testbuild privat |
| – | Namen der Doktrinen, Sonderbauten und Stufen | Platzhalter aus der Anforderung unverändert; der PO kann sie ändern (Sprachregel: Schlüssel `kp.*` und `tut.*` ohne Wörter aus `tools/sprachliste.mjs`) |

### Stand der Entscheidungen aus Teil 4
| Nr. (Teil 4) | Thema | Stand |
|---|---|---|
| D1 | Schwer: erste Karte absichern | gegenstandslos durch die Grundausstattung; neue Form als F5 |
| D2 | Dritte Linienstufe, Versorgung +2 | ersetzt: Linien neu gefasst (K5.08), Stufe 3 braucht eine Doktrin, die Versorgung +2 entfällt (Söldner); Zeitpunkt als F3 |
| D3 | Fabrik-Dominanz und Bauraster | für Linien-Bots gelöst (Befund J), für Menschen im Spieltest; Raster bleibt 3×3 |
| D4 | Verteidigung, Belagerung, Druckkurve | offen, als F4 |
| D5 | Schlüsselkarten stärker machen | gegenstandslos (Doktrinen ersetzen sie); ähnliche Frage als F1 |
| D6 | Auslegungen aus Teil 4 | Nr. 1 bis 3 gelten weiter; Nr. 4 (Aufwertungen −20 %), Nr. 8 (Schlüsselkartennamen) und Nr. 10 (Schwer-Schwellen des Fahrplans) sind gegenstandslos; 11 bis 13 unverändert; die 18 Auslegungen aus Teil 5 als F7 |
| D7 | Spieltest | offen, als F8 (Leitfaden Teil 5 ersetzt den aus Teil 4) |
| D8 | Gate nach `main` | offen, als F9 |
| D9 | Kalibrierung | offen, als F10 |

## 6. Empfohlener nächster Schritt
1. **Spieltest** (F8) mit dem Testbuild von Teil 5: Strategie bewusst gewählt, Doktrin verstanden, Sonderbau gefunden, Budget benutzt, Takt, Leerlauf, Ermüdung, Verteidigung mit `?druck=hoch`, Schwer-Start.
2. **Kleine Entscheidungen vorab**, unabhängig vom Spieltest: F2 (Kriterium auf +2 Wahlen), F5, F6 und F7 (Auslegungen).
3. **Anforderung Teil 6** nach dem Spieltest, Inhalt abhängig von den Ergebnissen: F1 (Doktrinen), F4 (Belagerung und Druckkurve), F3 (Stufe 3), danach F9 (Gate) und F10 (Kalibrierung). Ein neues REQ-Kürzel wählen (Teil 3: P, Teil 4: S, Teil 5: K5).

Zu klären, bevor Cowork die Anforderungen zuschneidet: F1, F3, F4 und F8.

## 7. Form der Anforderungsdokumente und Randbedingungen für Cowork
- **Stil:** Titel „Anforderungen Branch Kartenpfad, Teil N: …“. Aufbau: 1. Ziel und Umfang (mit „Nicht im Umfang“), 2. Anforderungen REQ-<Kürzel>.nn (Teil 3: P, Teil 4: S, Teil 5: K5; für Teil 6 ein neues Kürzel), je mit Ziel, Anforderungen und Akzeptanzkriterien (messbar: Zahl, Test, Bericht), 3. Entscheidungen des PO, 4. Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, 5. „Schwache Annahmen und offene Punkte“ (Annahme, Risiko, Standard).
- **Umsetzung durch Claude Code:** je Inkrement ein Commit `N.<n>: <Inhalt>` (Teil 5; Teil 4: `L.<n>`, Teil 3: `P.<n>`), Bericht mit Ergebnis in drei Sätzen, Entscheidungen des PO, Auslegungen zur Bestätigung, Abnahmetabelle, Kennzahlen vorher und nachher, Auffälligkeiten (berichtet, nicht wegbalanciert). Messung: 50 Partien je Feld, gleiche Seeds in allen Feldern.
- **Messwerkzeuge im Repository:** `tools/sim-p5.mjs` (`--suite felder|budget|doktrin`; Optionen `--runs`, `--diffs`, `--profiles`, `--doktrinRuns`, `--doktrinDiff`, `--doktrinAlle`, `--druck`), `tools/sim-p4.mjs` (`--suite basis|linien`), `tools/bericht-p5.mjs` (Tabellen aus den Rohdaten), `tools/kalibrieren-p5.mjs` (mehrere Wertesätze per `KF_OVERRIDE` nacheinander), `tools/bildzeit.mjs` (Bildzeit im Browser), `tools/bench-tick.mjs` (Tick-Zeit), dazu aus früheren Teilen `tools/sim-p3.mjs`, `tools/referenzlauf.mjs`. Rohdaten unter `reports/kartenpfad5-*`.
  Versuche ohne Dateiänderung: `KF_OVERRIDE='{"KARTEN":{"schwellen":{"start":70,"wachstum":1.05}}}' node tools/sim-p5.mjs …`.
- **Grenzen der Messung:** Zwei Bots („einheiten-zuerst“ schnell, „gierig“ mit Vorausschau) plus drei Linien-Bots und ein Bot ohne Linie. Differenzen unter etwa 10 pp sind bei 50 Partien nicht von Zufall zu trennen. **Die Siegquote trennt nicht, wo alle Bots 100 % gewinnen** (Normal) oder dieselben Eröffnungs-Seeds verlieren (Schwer): Kriterien wie „+5 bis +25 pp je Doktrin“ sind so nicht prüfbar (Befund E). Anforderungen sollten Ersatzmaße (Dauer, Wahlen, Mauerverlust) oder einen schärferen Druck nennen und Kriterien an Menschen in den Spieltest legen.
- **Feste Zusagen im Code:** Modus `standard` identisch zu `main` (Golden-Test `tests/unveraendert.test.mjs`, nicht ohne Grund neu erzeugen); alle Regeln aus Teil 4 und 5 gelten nur bei `S.pacing === 'karten'`; nach Änderungen an `S.slots` von außen `S.slotVer++`, sonst veraltet der Cache der Modifikatoren; jede Karte braucht eine Wirkungszeile `kp.eff.<id>` (höchstens 44 Zeichen) in beiden Sprachen; jeder Knopf Tooltip (`data-tooltip`) und Erklärzeile; gesperrte Knöpfe über `aria-disabled`.
- **Wichtige Stellschrauben (alle in `config.js`):** `KARTEN` (`schwellen` {start, wachstum}, `schwellenFaktor` je Grad, `minAbstand`, `epBasis`, `epWelle`, `budget`, `gegner` je Grad, `kartenTiers`, `angebot`, `pfadPlaetze`, `gewichte`, `basisFaktor`), `LINIEN` (`zeichenStufen`, `maxStufe`, `stufen`, `aufwertung`, `lager`, `soeldner`), `DOKTRIN` (`max`, `sonderbau.kostenFaktor`, Parameter der Einschränkungen), `DRUCK`. Werte der Doktrinen in `data/doktrinen.js`, Zeichen und Varianten in `data/linien.js`, Pfadkarten und Forschungen in `data/kartenpfad.js`, Bonuskarten in `data/draft-options.js`.

## 8. Kennzahlen (schneller Bot, 50 Partien je Feld; vorher → nachher)
„Vorher“ ist der Stand nach Teil 4 (Commit `fdd5a9c`), in N.0 mit denselben Seeds gemessen; „nachher“ der Endstand von Teil 5 (Commit `c2ff557`). Rohdaten: `reports/kartenpfad5-*`. Die Tabellen sind mit `tools/bericht-p5.mjs` erzeugt.
Die Zeile „schwer · gelegentlich“ enthält nur Niederlagen nach rund anderthalb Minuten; der Median beschreibt dort die Niederlagen, nicht die Siege.

### Felder: Siegquote, Dauer, Wahlen, längste Lücke (schneller Bot, 50 Partien je Feld) – vorher → nachher

| Grad | Profil | Siege | Dauer Median | Wahlen Median | längste Lücke Median / P90 (s) |
|---|---|---|---|---|---|
| leicht | aktiv | 100 → 100 % | 11:02 → 12:45 | 9 → 11 | 85 / 90 → 106 / 122 |
| leicht | durchschnitt | 100 → 100 % | 11:30 → 14:13 | 10 → 12 | 90 / 90 → 116 / 134 |
| leicht | gelegentlich | 100 → 100 % | 13:34 → 19:23 | 12 → 15 | 90 / 90 → 144 / 198 |
| normal | aktiv | 100 → 100 % | 10:44 → 12:58 | 9 → 12 | 86 / 87 → 98 / 115 |
| normal | durchschnitt | 100 → 100 % | 11:49 → 13:35 | 10 → 14 | 85 / 86 → 89 / 142 |
| normal | gelegentlich | 100 → 100 % | 14:00 → 20:21 | 12 → 18 | 85 / 86 → 125 / 191 |
| schwer | aktiv | 100 → 100 % | 9:53 → 12:18 | 8 → 15 | 100 / 100 → 66 / 73 |
| schwer | durchschnitt | 74 → 86 % | 11:06 → 13:19 | 9 → 17 | 100 / 100 → 78 / 91 |
| schwer | gelegentlich | 40 → 0 % | 1:52 → 1:29 | 1 → 0 | 61 / 100 → 0 / 0 |

### EP je Minute (Median) und Anteil der EP-Quellen – nachher

| Grad | Profil | 0–4 min | 4–8 min | 8–12 min | 12+ min | Abschüsse | Türme | Basisschaden | abgewehrte Wellen |
|---|---|---|---|---|---|---|---|---|---|
| leicht | aktiv | 43,7 | 58,0 | 177,3 | 169,2 | 12,1 % | 0,0 % | 85,0 % | 2,9 % |
| leicht | durchschnitt | 50,9 | 46,5 | 127,2 | 215,7 | 41,6 % | 0,0 % | 48,2 % | 10,2 % |
| leicht | gelegentlich | 47,9 | 40,0 | 73,7 | 851,1 | 65,8 % | 0,0 % | 18,2 % | 16,0 % |
| normal | aktiv | 65,7 | 61,3 | 187,6 | 170,9 | 23,2 % | 0,1 % | 72,2 % | 4,6 % |
| normal | durchschnitt | 93,4 | 70,0 | 179,2 | 261,3 | 56,0 % | 0,1 % | 31,8 % | 12,1 % |
| normal | gelegentlich | 93,8 | 44,0 | 87,6 | 1250,0 | 72,4 % | 0,0 % | 11,4 % | 15,9 % |
| schwer | aktiv | 195,7 | 137,7 | 241,8 | 163,0 | 37,7 % | 2,7 % | 52,1 % | 7,5 % |
| schwer | durchschnitt | 213,2 | 81,0 | 200,7 | 200,6 | 54,5 % | 3,2 % | 30,7 % | 11,5 % |
| schwer | gelegentlich | 21,9 | – | – | – | 85,9 % | 0,0 % | 0,0 % | 14,1 % |

### EP je Minute (Median) – vorher (Stand nach Teil 4)

| Grad | Profil | 0–4 min | 4–8 min | 8–12 min | 12+ min |
|---|---|---|---|---|---|
| leicht | aktiv | 15,4 | 33,2 | 47,3 | 523,4 |
| leicht | durchschnitt | 23,9 | 31,6 | 41,7 | 21,0 |
| leicht | gelegentlich | 29,7 | 17,4 | 49,3 | 31,2 |
| normal | aktiv | 23,1 | 33,8 | 46,0 | – |
| normal | durchschnitt | 39,5 | 27,2 | 40,8 | 901,6 |
| normal | gelegentlich | 66,5 | 8,9 | 51,8 | 30,9 |
| schwer | aktiv | 139,0 | 65,8 | 102,4 | – |
| schwer | durchschnitt | 225,0 | 54,9 | 82,4 | 33,0 |
| schwer | gelegentlich | 76,8 | 208,1 | 109,6 | 33,0 |

### Forschungsbudget: 0 %, 25 %, 50 % (Normal, 50 Partien je Arm, gleiche Seeds)

| Profil | Budget | Siege | Dauer Median | Wahlen Median (Mittel) | Differenz Wahlen | EP aus Budget |
|---|---|---|---|---|---|---|
| aktiv | 0 % | 100 % | 13:04 | 13 (12,5) | – | 0,0 % |
| aktiv | 25 % | 100 % | 12:12 | 13 (12,9) | +0 | 19,7 % |
| aktiv | 50 % | 100 % | 12:25 | 14 (14,1) | +1 | 27,3 % |
| durchschnitt | 0 % | 100 % | 14:21 | 14 (15,2) | – | 0,0 % |
| durchschnitt | 25 % | 100 % | 13:05 | 15 (15,2) | +1 | 17,0 % |
| durchschnitt | 50 % | 100 % | 13:22 | 16 (16,6) | +2 | 18,1 % |

### Linien-Bots (Normal, durchschnitt, 50 Partien je Zeile) – vorher (Teil 4, nur `druck=hoch`) und nachher

| Bot | Druck | Siege | Dauer Median | Stufe 1 / 2 / 3 (Median) | Fabriken ohne Variante, Minute 10 (Median) |
|---|---|---|---|---|---|
| ohne | aus | 100 % | 14:15 | – | 5 |
| ohne | hoch | 100 → 100 % | 11:44 → 14:29 | – | 5 |
| militaer | aus | 100 % | 11:11 | 5:02 (100 %) / 6:18 (90 %) / 6:53 (90 %) | 4 |
| militaer | hoch | 100 → 100 % | 12:21 → 11:02 | 5:03 (100 %) / 6:05 (98 %) / 6:52 (98 %) | 4 |
| wirtschaft | aus | 100 % | 14:39 | 5:43 (100 %) / 5:55 (100 %) / 7:44 (100 %) | 0 |
| wirtschaft | hoch | 82 → 96 % | 15:47 → 14:46 | 5:50 (100 %) / 6:45 (100 %) / 7:57 (100 %) | 0 |
| verteidigung | aus | 98 % | 13:58 | 5:14 (100 %) / 6:31 (98 %) / 7:27 (98 %) | 0 |
| verteidigung | hoch | 96 → 100 % | 23:57 → 14:02 | 5:10 (100 %) / 6:31 (100 %) / 7:26 (100 %) | 0 |

### Varianten je Linien-Bot (Anteil der Partien mit mindestens einer fertigen Variante dieses Typs)

- **militaer**: werkstatt 100 %, exerzierplatz 88 %, waffenschmiede 100 %, heerlager 66 %
- **wirtschaft**: manufaktur 100 %, zahlmeisterei 100 %, muenzschmiede 100 %, zunfthaus 86 %, stiftungshaus 88 %
- **verteidigung**: wachstube 96 %, bastion 86 %, garnison 100 %, ruestkammer 100 %

Verteilung aller Aufwertungen (2874 fertige Varianten, alle Bots): werkstatt 9,1 %, exerzierplatz 3,0 %, waffenschmiede 3,5 %, heerlager 2,4 %, manufaktur 24,6 %, zahlmeisterei 3,5 %, muenzschmiede 3,5 %, zunfthaus 15,1 %, stiftungshaus 2,8 %, wachstube 8,4 %, bastion 17,3 %, garnison 3,5 %, ruestkammer 3,5 %. Größter Anteil einer Grundvariante: 24,6 %.

### Doktrinen im Paarvergleich (Endstand: Normal, durchschnitt, Verteidigung mit druck=hoch)

| Doktrin | Linie | Siege mit / ohne | Dauer Median mit / ohne | Wahlen Median mit / ohne | Mauer-Verlust mit / ohne | Turm-Abschüsse mit / ohne | Sonderbau gebaut |
|---|---|---|---|---|---|---|---|
| zunftordnung | wirtschaft | 100 % / 100 % | 14:34 / 14:07 | 17 / 16 | 43 / 60 | 0.6 / 0.3 | 100 % |
| stiftung | wirtschaft | 100 % / 100 % | 14:31 / 14:07 | 17 / 16 | 84 / 60 | 0.5 / 0.3 | 93 % |
| stehendesHeer | militaer | 100 % / 100 % | 10:49 / 13:27 | 11 / 13 | 14 / 34 | 0.3 / 0.3 | 100 % |
| vorstoss | militaer | 100 % / 100 % | 10:17 / 13:27 | 11 / 13 | 11 / 34 | 0.3 / 0.3 | – |
| bollwerk | verteidigung | 100 % / 100 % | 13:46 / 13:25 | 15 / 15 | 98 / 52 | 0.3 / 0.3 | 100 % |
| ausfall | verteidigung | 100 % / 100 % | 13:48 / 13:25 | 15 / 15 | 25 / 52 | 0.3 / 0.3 | – |

Angebote mit Doktrin je Partie (alle sechs im Pool, Linien-Bot):

| Linie | Angebote Median (Mittel) | Doktrinen gewählt (Mittel) | erste Doktrin in Wahl (Median) |
|---|---|---|---|
| militaer | 3 (3,0) | 1,6 | 6 |
| wirtschaft | 4 (3,7) | 1,9 | 8 |
| verteidigung | 4 (3,6) | 1,9 | 8 |

Zusatzlauf Doktrinen: Die Läufe `reports/kartenpfad5-doktrin-normal-druck.json` und `-doktrin-schwer.json` entstanden vor dem Preis des Stiftungshauses von 2 statt 3 Baukosten; ihre Tabellen zeigen für die Stiftung 4 % gebaute Stiftungshäuser.
Spannweite der Siegquoten der drei Linien-Bots (Normal, „durchschnitt“): 2 pp ohne Schalter (100 / 100 / 98 %), 4 pp mit `?druck=hoch` (100 / 96 / 100 %); Hypothese: höchstens 20 pp.

## 9. Schwache Annahmen in diesem Stand
- **Die Doktrinen wirken, weil sie hart einschränken.** Nur für Militär gemessen (Partie 2:38 bis 3:10 kürzer); für Wirtschaft und Verteidigung zeigt die Simulation keine Wirkung. Ob die Einschränkungen sich wie eine Entscheidung oder wie eine Strafe anfühlen, zeigt nur der Spieltest (Frage 5).
- **Menschen wählen Doktrinen und Sonderbauten bewusst.** Unbelegt. Die Linien-Bots wählen die Karte mit den meisten Zeichen ihrer Linie; Menschen sehen den Sonderbau erst nach der Wahl und müssen ein Gebäude aufwerten (und gegebenenfalls ein bestehendes ablösen).
- **Bots als Maß für Stärke und Takt.** Das Schwellenmodell (70 × 1,05^(k−1)) ist an den schnellen Bot kalibriert. Ob Menschen im Takt von 12 bis 17 Wahlen in 13 bis 14 Minuten liegen und ob die Bühne ermüdet, zeigt nur der Spieltest.
- **Die Belagerung bleibt.** Die Annahme aus Teil 5 („Neue EP-Quellen schließen die Lücke“) bestätigt sich (89 s), die Verteidigungsdoktrinen bleiben aber an eine Mechanik gebunden, die in der Simulation nicht auslöst (Befund F).
- **Schwer bleibt kalibriert, aber nicht abgesichert.** Der Sprung zwischen 4,0 und 4,2 (86 % → 20 %) zeigt, dass eine kleine Abweichung der Menschen von den Bots die Partie kippt.
- **Das Forschungsbudget ist eine steuerbare Quelle.** Es bringt +2 Wahlen und keinen Siegvorteil; ob Menschen den Regler benutzen und den schlechteren Kurs verstehen (Frage 7), ist offen. Eine Quelle, die kaum etwas ändert, kann ein totes Bedienelement sein.
- **Das Freischalten fehlt nicht.** Mit der Grundausstattung entfallen die Bau-Karten; Technologie-Karten und Sonderbauten sollen das Gefühl tragen. Ungeprüft (Frage 9).
- **Die alten Zielkorridore bleiben als Maßstab brauchbar.** Widerlegt: Sie liegen unter den neuen Messwerten (Befund C, F6).
- **Alle Spielzahlen dieses Dokuments stammen von Bots.** Ausnahmen sind die Zählung der Tests und Prüfpunkte und die Tick-Zeit (Benchmark).

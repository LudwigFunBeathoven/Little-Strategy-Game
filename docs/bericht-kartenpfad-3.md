# Bericht Kartenpfad Teil 3: Pacing und Qualität der Kartenwahl (v0.9.2-kartenpfad-3)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-3.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-3.md`. Rohdaten: `reports/kartenpfad3-*.json`.
Messung: einheiten-zuerst („schneller Bot“), je Feld 50 Partien, gleiche Seeds; dazu der Bot mit Vorausschau („gierig“), 30 Partien je Profil und Variante (aktiv entfällt: über drei Minuten Rechenzeit je Partie).

## Ergebnis
Zehn Kartenwahlen kommen jetzt in gleichmäßigem Takt: Auf Normal liegt der Median jeder Wahl 1 bis 10 bei „durchschnitt“ höchstens 14 s neben der Zielzeit, in 100 % der Fälle liegen 45 bis 100 s zwischen zwei Wahlen, und die Partie dauert im Median 11:56 Minuten (vorher 10:25). Das Angebot stellt zwei Pfadkarten gegen Bonuskarten, kein Bonuskarten-Angebot hat mehr Wirkung null, und die Siegquoten der Pfad-Varianten liegen innerhalb von 12 Prozentpunkten.
Die Anforderung ließ sich an einer Stelle nicht wörtlich umsetzen: Die EP tragen den Takt nicht, weil die Belagerung die Mitte der Partie EP-arm macht; deshalb ist die Zielzeit zugleich die späteste Fälligkeit (Abweichung 1, zur Bestätigung). Auf Schwer liegen die Wahlen früh im Fahrplan voraus (bis 86 s), weil die EP dort schneller fließen.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| P.01 | `npm test`, `npm run test:browser`, `tests/browser-k2.mjs` grün | `npm test`: 283 grün (in `main` 221 plus 62 neue). Browser: siehe Abschnitt „Prüfstand“. |
| P.01 | Golden-Test: `standard` im Branch identisch zu `main` 0.9.2 | grün (`tests/unveraendert.test.mjs`; alle neuen Regeln gelten nur im Modus `karten`). |
| P.01 | Kurzsimulation `karten` ohne offene Partien | erfüllt: offen 0 % in allen neun Feldern der Endmessung. |
| P.01 | Konfliktliste | Abschnitt „Konfliktliste“. |
| P.02 | Normal, durchschnitt: Median der Wahlzeit je Wahl 1–10 innerhalb ±20 s | **erfüllt**: größte Abweichung −14 s (Wahl 1), sonst 0 bis −7 s. |
| P.02 | Abstand zwischen zwei Wahlen 45–100 s in ≥ 95 % | **erfüllt**: 100 % (alle Felder). |
| P.02 | Normal, aktiv: Wahl 5 nicht später als Zielzeit; Wahl 10 höchstens 20 % früher | **erfüllt**: Wahl 5 bei 5:55 (Ziel 5:55), Wahl 10 bei 11:18 (6 von 50 Partien erreichen sie; Grenze 9:04). |
| P.02 | gelegentlich: Wahlzeiten berichten | Tabelle „Wahlzeiten je Feld“. |
| P.02 | Test: Mindest- und Höchstabstand greifen | `tests/fahrplan.test.mjs` (10 Tests). |
| P.03 | Normal, durchschnitt: Median der Partiedauer 10–14 min | **erfüllt**: 11:56 (Bot mit Vorausschau 12:02). |
| P.03 | Median der Wahlen je Partie 9–11 | **erfüllt**: 10 (Bot mit Vorausschau 10). |
| P.03 | P90 der Dauer ≤ 20 min auf allen Feldern; Patt ≤ 2 % | **erfüllt**: größter P90 15:41 (Normal, gelegentlich); Patt 0 %. |
| P.03 | Siegquoten vorher und nachher | Tabelle „Vorher und nachher“. |
| P.04 | Test: 1.000 Angebote folgen der Tabelle | `tests/kartenpfad.test.mjs`, alle sechs Felder der Tabelle geprüft. |
| P.04 | Test: Grenze „spätestens dritte Wahl“ mit zwei Pfadplätzen | `tests/kartenpfad.test.mjs` (300 Seeds). |
| P.04 | Siegquoten der Pfad-Varianten innerhalb 15 pp | **erfüllt**: schneller Bot 98 / 98 / 86 % (12 pp), Bot mit Vorausschau 100 / 100 / 100 %. |
| P.04 | Verteilung der ersten und zweiten Pfadkarte | Tabelle „Pfad-Varianten“; Befund: „Wissen zuerst“ und „Militär zuerst“ sind in Wahl 1 und 2 identisch (Auffälligkeit 3). |
| P.05 | Test je Bonuskarte: nicht angeboten bei Wirkung null, angeboten mit Wirkung | `tests/angebot.test.mjs` (41 Karten). |
| P.05 | Test: keine angebotene Karte mit Wirkung null (1.000 Spielstände) | `tests/angebot.test.mjs`, über 20.000 geprüfte Karten. |
| P.05 | Inventar im Bericht | Abschnitt „Inventar der seltenen Karten“. |
| P.05 | Kein Kartentitel doppelt (Modus karten) | `tests/angebot.test.mjs`, Deutsch und Englisch. |
| P.06 | Bericht, Grafik, Testbuild | dieser Bericht, `docs/bilder/kartenpfad3-wahlzeiten.svg`, Testbuild siehe Antwort an den PO. |

## Auslegungen und Abweichungen (zur Bestätigung)
1. **Fälligkeit nach Fahrplan statt allein nach EP-Schwelle und Höchstabstand (weicht von REQ-P.02 ab).** Die Anforderung leitet die EP-Schwellen aus dem Median-EP-Ertrag des Referenzlaufs ab und stützt sich auf einen Höchstabstand von 100 s. Das trägt nicht, weil die Mitte der Partie kaum EP bringt: Die Belagerung hält die regulären Gegnerwellen auf, EP kommen in Stößen (Notaufgebot bei zwei Dritteln und einem Drittel der gegnerischen Basis).
   Der Median-EP-Stand des Referenzlaufs wächst zwischen 2:40 und 5:55 nur von 151 auf 168. Zwei Messungen mit dem Schalter `zielzeitIstFrist: false` (Fälligkeit allein nach EP und 100 s, 100 Partien):
   *Schwellen aus dem Median (wörtlich nach Anforderung):* Wahl 2 −27 s, Wahl 3 −46 s, Wahl 5 −78 s, Wahl 10 −96 s; Median-Abstand 45 s (der Mindestabstand bestimmt den Takt), Partie 10:50.
   *Hohe Schwellen (Obergrenze der Referenzläufe):* Wahl 2 +16 s, Wahl 3 +51 s, Wahl 5 +120 s, Wahl 10 +186 s; der Höchstabstand von 100 s bestimmt den Takt, Partie 13:14.
   Umgesetzt: Eine Wahl wird fällig bei erreichter EP-Schwelle, **spätestens zur Zielzeit der Wahl**, spätestens 100 s nach der letzten Wahl, frühestens 45 s nach der letzten. Höchstabstand und Mindestabstand bleiben wie in der Anforderung. Wörtliche Fassung: `KARTEN.fahrplan.zielzeitIstFrist = false`.
2. **EP-Schwellen aus der Obergrenze der Referenzläufe (weicht von REQ-P.02 ab).** Wahl 1: 43 EP. Ab Wahl 2: der größte EP-Stand von 200 Referenzpartien („aktiv“ und „durchschnitt“) zur Zielzeit. Kein Referenzspieler löst eine Wahl vor ihrer Zielzeit aus. Wer deutlich mehr EP erzeugt als der Bot (Hörsaal-Forschung, Kriegserfahrung), bekommt die Wahl früher, begrenzt durch den Mindestabstand.
   Folge: EP-Karten und die Forschung „Hörsaal“ verlieren im Modus `karten` den größten Teil ihrer Wirkung (Inventar, Befund 6). Neu ableiten: `node tools/fahrplan-kalibrieren.mjs --profile aktiv,durchschnitt --modus obergrenze --x1 43 --apply`.
3. **Erste Schwelle 43 EP statt 64 (Median bei 1:30).** Auf Schwer fällt das Tor nach rund zwei Minuten, wenn die erste Karte (Echtes Militär, Kaserne) später als etwa 75 s kommt. Gemessen (Schwer, durchschnitt, 50 Partien, Zwischenstand der Einstellung): Schwelle 64 → 16 % Siege, Schwelle 43 → 86 %. Auf Normal erscheint die erste Wahl damit im Median bei 1:16 (−14 s zur Zielzeit), auf Leicht bei 1:30, auf Schwer bei 0:50.
4. **Erste Wahl ohne Mindestabstand; im Tutorial nie nach Zeit.** Vor der ersten Wahl gibt es keine „letzte Wahl“. Solange Schonfrist oder Kriegsbeute des Tutorials laufen, kommt die erste Wahl über die Kriegsbeute (die EP-Garantie bleibt); danach gilt der Fahrplan.
5. **Angebot mit 3 Karten, mit Universität 4.** Die Tabelle in REQ-P.04 und die Anforderung Teil 1 („Standard 3 Karten, Universität +1“) setzen drei und vier Karten voraus. Die Umsetzung aus Teil 1 gab es nur mit zwei und drei Karten (Wert aus `main`). Im Modus `karten` gilt jetzt `KARTEN.angebot` = 3 und 4; der Modus `standard` bleibt bei 2 und 3. Mit der Karte „Glücksritter“ erscheinen bis zu fünf Karten; sie passen auf der Bühne ab 1024 px Fensterbreite.
6. **Gleiches Gewicht aller Bau-Karten.** Echtes Militär (30) und Metallverarbeitung (20) hatten mehr Gewicht als Festungsbau, Gelehrte und Handel (je 10). Jetzt gilt überall 10.
7. **Basis-HP je Schwierigkeitsgrad (einzige Stellschraube, REQ-P.03).** `KARTEN.basisFaktor`: Leicht 5,5, Normal 5,5, Schwer 3,0 (vorher 3,5 für alle). Mit einer Zahl für alle Grade (5,5) hätte „gelegentlich“ auf Schwer 40 % gewonnen und das 90. Perzentil der Dauer 23:57 erreicht (Soll ≤ 20 min).
8. **Bann tauscht nur Bonusplätze.** Sonst hätte der Ersatz einer gebannten Karte die Zahl der Pfadplätze verändert (REQ-P.04: Neu ziehen und Bann halten die Zahl).
9. **Angebotsbedingungen im neuen Feld `wirkt`**, nur im Modus `karten` ausgewertet. Das vorhandene Feld `requires` gilt in beiden Modi; „Fabrik steht“ dort einzutragen hätte den Modus `standard` verändert (Golden-Test). Wirkung null ist dynamisch gelesen: Eine Karte erscheint nicht, wenn ihr Gegenstand fehlt (Fabrik, freier Bauplatz, Fernkämpfer, Versorgungsgruppe ab 5, Phase der Partie). Bedingte Wirkungen, die später eintreten können (Sappeure ab halber gegnerischer Basis, Notreserve bei fast gefallenem Tor), zählen als Wirkung.
10. **Korrektur am schnellen Bot, nicht am Spiel.** Der Bot füllte das Raster mit Fabriken, solange die Kaserne gesperrt war, und konnte sie später nicht mehr bauen; „Festung zuerst“ gewann deshalb nur 40 % (`reports/kartenpfad3-zwischenstand-bot-ohne-abriss.json`). Der Bot reißt im Modus `karten` jetzt eine Fabrik ab, wenn ein freigeschaltetes Gebäude fehlt (der Bot „gierig“ tat das schon und gewann mit allen Varianten 100 %). Dieselbe Falle trifft Menschen, die vor der ersten Kaserne alle neun Plätze bebauen (Auffälligkeit 4).

## Vorher und nachher (schneller Bot, Medianwerte)
„Vorher“ ist der Stand nach dem Abgleich mit `main` (Commit b9187c7, alte Regeln, Basis-HP 3,5), gleiche Seeds. Anmerkung: Der Bot „nachher“ reißt bei vollem Raster Fabriken ab (Abweichung 10).

| Feld | Siege vorher → nachher | Dauer Median vorher → nachher | Wahlen Median | Wahl 5 vorher → nachher | Wahl 10 vorher → nachher |
|---|---|---|---|---|---|
| Normal · aktiv | 100 % → 100 % | 9:01 → 10:24 | 8 → 9 | 5:01 → 5:55 | 8:08 → 11:18 (6 Partien erreichen sie) |
| Normal · durchschnitt | 100 % → 100 % | 10:25 → 11:56 | 9 → 10 | 5:40 → 5:55 | 10:21 → 11:20 |
| Normal · gelegentlich | 96 % → 98 % | 12:36 → 14:56 | 11 → 13 | 5:35 → 5:55 | 10:34 → 11:20 |
| Leicht · durchschnitt | 100 % → 100 % | 10:43 → 11:37 | 8 → 10 | 5:50 → 5:55 | 11:35 → 11:20 |
| Schwer · aktiv | 80 % → 96 % | 7:29 → 9:33 | 12 → 8 | 1:32 → 5:43 | 4:33 → 11:20 (1 Partie) |
| Schwer · durchschnitt | 82 % → 96 % | 9:25 → 11:23 | 13 → 10 | 1:34 → 5:38 | 5:21 → 11:20 |
| Schwer · gelegentlich | 54 % → 66 % | 9:32 → 14:07 | 14 → 12 | 1:34 → 4:44 | 6:04 → 11:20 |

## Kennzahlen der Endmessung
#### Felder (Strategie einheiten-zuerst, 50 Partien je Feld)

| Grad | Profil | Siege | Niederlagen | offen | Dauer Median | Dauer P90 | Wahlen (Median) | Abstände 45–100 s |
|---|---|---|---|---|---|---|---|---|
| leicht | aktiv | 100 % | 0 % | 0 % | 10:14 | 11:27 | 8 | 100.0 % |
| leicht | durchschnitt | 100 % | 0 % | 0 % | 11:37 | 12:07 | 10 | 100.0 % |
| leicht | gelegentlich | 100 % | 0 % | 0 % | 14:26 | 15:02 | 12 | 100.0 % |
| normal | aktiv | 100 % | 0 % | 0 % | 10:24 | 11:11 | 9 | 100.0 % |
| normal | durchschnitt | 100 % | 0 % | 0 % | 11:56 | 13:20 | 10 | 100.0 % |
| normal | gelegentlich | 98 % | 2 % | 0 % | 14:56 | 15:41 | 13 | 100.0 % |
| schwer | aktiv | 96 % | 4 % | 0 % | 9:33 | 10:39 | 8 | 100.0 % |
| schwer | durchschnitt | 96 % | 4 % | 0 % | 11:23 | 11:52 | 10 | 100.0 % |
| schwer | gelegentlich | 66 % | 34 % | 0 % | 14:07 | 14:52 | 12 | 100.0 % |

#### Wahlzeiten je Feld (Median, Abweichung zur Zielzeit)

| Feld | W1 (1:30) | W2 (2:40) | W3 (3:45) | W4 (4:50) | W5 (5:55) | W6 (7:00) | W7 (8:05) | W8 (9:10) | W9 (10:15) | W10 (11:20) | W11 (12:25) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| leicht/aktiv | 1:30 (+0 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 6:54 (−6 s) | 8:05 (+0 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:02 (−18 s) | 12:21 (−4 s) |
| leicht/durchschnitt | 1:30 (+0 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 7:00 (+0 s) | 8:05 (+0 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:20 (+0 s) | 12:25 (+0 s) |
| leicht/gelegentlich | 1:30 (+0 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 7:00 (+0 s) | 8:05 (+0 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:20 (+0 s) | 12:25 (+0 s) |
| normal/aktiv | 1:16 (−14 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 6:50 (−10 s) | 8:05 (+0 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:18 (−2 s) | – |
| normal/durchschnitt | 1:16 (−14 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 7:00 (+0 s) | 7:58 (−7 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:20 (+0 s) | 12:12 (−13 s) |
| normal/gelegentlich | 1:16 (−14 s) | 2:40 (+0 s) | 3:45 (+0 s) | 4:50 (+0 s) | 5:55 (+0 s) | 7:00 (+0 s) | 8:05 (+0 s) | 9:10 (+0 s) | 10:15 (+0 s) | 11:20 (+0 s) | 12:25 (+0 s) |
| schwer/aktiv | 0:50 (−40 s) | 1:35 (−65 s) | 2:32 (−73 s) | 4:11 (−39 s) | 5:43 (−12 s) | 6:40 (−20 s) | 8:03 (−2 s) | 9:05 (−5 s) | 9:55 (−20 s) | 11:20 (+0 s) | – |
| schwer/durchschnitt | 0:50 (−40 s) | 1:35 (−65 s) | 2:21 (−84 s) | 3:58 (−52 s) | 5:38 (−17 s) | 6:47 (−13 s) | 7:45 (−20 s) | 9:10 (+0 s) | 9:55 (−20 s) | 11:20 (+0 s) | – |
| schwer/gelegentlich | 0:50 (−40 s) | 1:34 (−66 s) | 2:19 (−86 s) | 3:04 (−106 s) | 4:44 (−71 s) | 6:23 (−37 s) | 7:55 (−10 s) | 8:50 (−20 s) | 10:15 (+0 s) | 11:20 (+0 s) | 12:05 (−20 s) |

Grafik: Fahrplan gegen gemessenen Median (Normal, drei Profile; dazu Schwer · durchschnitt, wo die Abweichung liegt).

![Wahlzeiten gegen Fahrplan](bilder/kartenpfad3-wahlzeiten.svg)

#### Wahlen vor der Zielzeit (Anteil der Wahlen 2–10, die mehr als 5 s vor dem Fahrplan erschienen)

| Feld | Anteil früher | davon Median der Verfrühung |
|---|---|---|
| leicht/aktiv | 24.7 % | 20 s |
| leicht/durchschnitt | 17.3 % | 20 s |
| leicht/gelegentlich | 18.9 % | 20 s |
| normal/aktiv | 11.6 % | 19 s |
| normal/durchschnitt | 15.7 % | 20 s |
| normal/gelegentlich | 11.3 % | 20 s |
| schwer/aktiv | 68.3 % | 38 s |
| schwer/durchschnitt | 71.6 % | 49 s |
| schwer/gelegentlich | 71.7 % | 68 s |

Auf Schwer erscheinen sieben von zehn Wahlen vor der Zielzeit, auf Normal und Leicht gut jede siebte bis fünfte. Auf Normal sind das die Wahlen von Partien mit ungewöhnlich hohem EP-Ertrag; auf Schwer liegt der EP-Ertrag über dem Referenzniveau, weil die Gegnerwellen zahlreicher und stärker sind. Die Schwellen sind nach Vorgabe für alle Grade gleich; die Abweichung ist berichtet (REQ-P.02).

#### Zeitpunkte der Gebäude (Median, Anteil der Partien mit dem Gebäude)

| Feld | Kaserne | Schmiede | Universität |
|---|---|---|---|
| leicht/aktiv | 1:30 (100 %) | 3:45 (100 %) | 2:40 (100 %) |
| leicht/durchschnitt | 1:39 (100 %) | 4:51 (100 %) | 2:43 (100 %) |
| leicht/gelegentlich | 1:41 (100 %) | 3:46 (100 %) | 2:48 (100 %) |
| normal/aktiv | 1:16 (100 %) | 3:45 (100 %) | 2:40 (100 %) |
| normal/durchschnitt | 1:28 (100 %) | 3:46 (100 %) | 2:46 (100 %) |
| normal/gelegentlich | 1:41 (100 %) | 4:53 (100 %) | 2:45 (100 %) |
| schwer/aktiv | 0:54 (100 %) | 3:13 (96 %) | 1:45 (96 %) |
| schwer/durchschnitt | 1:17 (96 %) | 2:31 (96 %) | 2:11 (96 %) |
| schwer/gelegentlich | 2:11 (66 %) | 2:33 (66 %) | 3:15 (66 %) |

#### Pfad-Varianten (Normal, durchschnitt)

| Variante | Siege | Dauer Median | Wahlen | Kaserne | Schmiede | Universität | erste Pfadkarte | zweite Pfadkarte |
|---|---|---|---|---|---|---|---|---|
| militaer | 98 % | 11:55 | 10 | 1:28 | 3:46 | 2:45 | echtesMilitaer 100 % | gelehrte 68 %, metallverarbeitung 32 % |
| wissen | 98 % | 11:55 | 10 | 1:28 | 3:46 | 2:45 | echtesMilitaer 100 % | gelehrte 68 %, metallverarbeitung 32 % |
| festung | 86 % | 14:40 | 13 | 3:26 | 5:51 | 2:41 | pfadFestungsbau 100 % | gelehrte 76 %, echtesMilitaer 24 % |

Spannweite der Siegquoten: 12.0 Prozentpunkte (Soll ≤ 15).

#### Bot mit Vorausschau („gierig“, Normal, drei Pfad-Varianten gemischt)

| Profil | Siege | Dauer Median | Dauer P90 | Wahlen | Wahl 5 | Wahl 10 | Abstände 45–100 s |
|---|---|---|---|---|---|---|---|
| durchschnitt | 100 % | 12:02 | 14:09 | 10 | 5:55 | 11:20 (75) | 100.0 % |
| gelegentlich | 100 % | 14:46 | 15:23 | 13 | 5:55 | 11:20 (30) | 100.0 % |

## Inventar der seltenen Karten (REQ-P.05)
Bonuskarten, die in unter 5 % der Angebote gewählt werden. Ausgangsdaten: Wahlrate der Bots (unten) und die Bewertung jeder angebotenen Bonuskarte durch 45 s Vorausschau (`tools/sim-p3.mjs --suite bonus`, 100 Partien). Die Wahlrate der Bots misst die Bots mit: Beide nehmen Pfadkarten zuerst, der schnelle Bot wählt unter den übrigen die erste Karte, der Bot mit Vorausschau die beste nach seiner Bewertung. **Es sind keine Werte geändert; die Liste geht zur Entscheidung an den PO.** Angebotsbedingungen sind ergänzt (Abschnitt Auslegung 9).

| Karte | Wahlrate schneller Bot / Vorausschau-Bot / beste Bonuskarte | Ursache | Vorschlag |
|---|---|---|---|
| Serienbau | 0 % / 0 % / nie im Vergleich | Wirkung zu schwach: Fabrikkosten −15 / −30 % wirken nur auf künftige Fabriken, und die Karte erscheint nur bei freiem Bauplatz (Bedingung), also früh | Wirkung auf alle Gebäudekosten (`buildCost`) ausweiten, sonst im Modus `karten` aus dem Pool |
| Bauleitung | 0 % / 0 % / nie im Vergleich | Wirkung zu schwach: baut nur Fabriken, die der Spieler ohnehin baut; erscheint nur bei freiem Bauplatz | im Modus `karten` aus dem Pool, oder baut alle freigeschalteten Gebäude |
| Große Armee (legendär) | 6 % / 0 % / nie im Vergleich | selten angeboten (16 und 1 Mal in 150 Partien): legendär, am Versorgungsdeckel gefiltert; der Nachteil (Wellenabstand × 2) wiegt schwer | behalten, Seltenheit ist gewollt |
| Zeugmeister | 17 % / 0 % (21 Angebote) / 15 % | Bot-abhängig: Auto-Kauf von Turm-Upgrades ist für den Vorausschau-Bot ohne Gewinn in 45 s | behalten, im Spieltest prüfen |
| Handelskontor | 13 % / 0 % (8 Angebote) / 11 % | Bedingung fehlt: der höhere Zinsdeckel wirkt erst, wenn der Deckel erreicht ist, und das Kontor steht selten früh (Handel-Pfadkarte ab Wahl 4) | Bedingung ergänzen: erst anbieten, wenn der Zinsdeckel erreicht ist |
| Notreserve | 18 % / 4 % / 19 % | Einmalwirkung bei Tor unter 25 %; die Bots reparieren vorher | behalten (Versicherung), im Spieltest prüfen |
| Söldnerheer (legendär) | 15 % / 9 % / 3 % | Wirkung gegen Nachteil: kostenlose Einheiten gegen − 40 % Produktion; Vorausschau bewertet den Nachteil höher | Nachteil abschwächen (Produktion × 0,8) |
| Zinnen | 14 % / 6 % / 6 % | Wirkung zu schwach in der Messung: Mauern verlieren selten Lebenspunkte; +15 / +30 % wirken kaum | Wirkung anheben (+20 / +40 %) oder behalten |
| Kriegserfahrung | 14 % / 8 % / 21 % | **Passt nicht zum Modus:** EP bestimmen den Takt nicht mehr (Auslegung 2) | aus dem Pool nehmen oder EP einen Zweck geben (zum Beispiel verkürzen EP die Zeit bis zur nächsten Wahl) |
| Glücksritter | 17 % / 17 % / 18 % | **Nachteil wirkungslos im Modus:** „Stufen kosten 15 % mehr EP“ ändert den Takt nicht, die Karte bringt eine Karte mehr je Wahl ohne spürbaren Preis (bis zu fünf Karten) | anderen Nachteil (zum Beispiel Wellenabstand) oder aus dem Pool |

Zwei weitere Fälle ohne Bedarf: Wagnis „Volle Auslastung“ (0 von 5 Angeboten) erscheint nach der Korrektur am Deckel nicht mehr; Technologiekarte Ballistik (3 % beim Vorausschau-Bot) ist Teil des Exklusivpaars mit Fortgeschrittene Taktiken.

#### Bonuskarten: Anteil der Angebote mit mindestens zwei Bonuskarten, in denen die Karte nach 45 s Vorausschau am besten abschnitt

| Karte | angeboten | Vergleiche | Anteil „beste Bonuskarte“ |
|---|---|---|---|
| serienbau | 14 | 0 | – |
| bauleitung | 4 | 0 | – |
| grosseArmee | 1 | 0 | – |
| soeldnerheer | 10 | 9 | 3 % |
| zinnen | 109 | 94 | 6 % |
| handelskontor | 19 | 19 | 11 % |
| festungsbau | 39 | 35 | 13 % |
| verbrannteErde | 7 | 6 | 14 % |
| zeugmeister | 19 | 19 | 15 % |
| werkmeister | 41 | 41 | 17 % |
| blitzkrieg | 6 | 6 | 17 % |
| instandhaltung | 132 | 117 | 18 % |
| gluecksritter | 39 | 34 | 18 % |
| scharfschuetzen | 11 | 11 | 19 % |
| notreserve | 44 | 38 | 19 % |
| schildwall | 130 | 123 | 19 % |
| kriegserfahrung | 131 | 121 | 21 % |
| kriegstrommeln | 108 | 96 | 22 % |
| bastion | 30 | 30 | 23 % |
| langeWurfarme | 113 | 108 | 23 % |
| drill | 106 | 95 | 24 % |
| maurerkolonne | 115 | 109 | 25 % |
| sappeure | 43 | 39 | 27 % |
| vorposten | 92 | 82 | 28 % |
| selbstlaeufer | 46 | 44 | 28 % |
| dauerauftrag | 47 | 41 | 30 % |
| turmkanoniere | 29 | 29 | 30 % |
| fliessband | 130 | 119 | 35 % |
| kriegsanleihe | 42 | 37 | 36 % |
| grossauftrag | 46 | 42 | 38 % |
| veteranen | 44 | 40 | 40 % |
| rationalisierung | 44 | 39 | 40 % |
| taktiker | 48 | 39 | 41 % |
| weitschuss | 40 | 39 | 49 % |
| doppelschicht | 123 | 117 | 49 % |
| aushebung | 60 | 38 | 61 % |
| nachtschicht | 86 | 86 | 62 % |
| bessereFabriken | 111 | 102 | 72 % |
| belagerungsgeraet | 105 | 91 | 74 % |
| schwerePressen | 120 | 110 | 80 % |
| allesAufDieMitte | 4 | 4 | 100 % |

#### Wahlrate je Karte (einheiten-zuerst, Normal, alle Profile)

| Karte | angeboten | gewählt | Wahlrate |
|---|---|---|---|
| bauleitung | 18 | 0 | 0.0 % |
| serienbau | 32 | 0 | 0.0 % |
| volleAuslastung (Pfad) | 5 | 0 | 0.0 % |
| grosseArmee | 16 | 1 | 6.3 % |
| verbrannteErde | 31 | 2 | 6.5 % |
| allesAufDieMitte | 23 | 2 | 8.7 % |
| blitzkrieg | 34 | 3 | 8.8 % |
| aushebung | 251 | 23 | 9.2 % |
| rationalisierung | 185 | 18 | 9.7 % |
| dauerauftrag | 175 | 18 | 10.3 % |
| festungsbau | 181 | 21 | 11.6 % |
| belagerungsgeraet | 346 | 43 | 12.4 % |
| schildwall | 379 | 48 | 12.7 % |
| handelskontor | 78 | 10 | 12.8 % |
| weitschuss | 152 | 20 | 13.2 % |
| vorposten | 375 | 51 | 13.6 % |
| zinnen | 369 | 51 | 13.8 % |
| kriegserfahrung | 405 | 56 | 13.8 % |
| pfadFestungsbau (Pfad) | 1594 | 222 | 13.9 % |
| grossauftrag | 172 | 24 | 14.0 % |
| ballistik (Pfad) | 382 | 54 | 14.1 % |
| maurerkolonne | 394 | 56 | 14.2 % |
| instandhaltung | 405 | 58 | 14.3 % |
| kriegstrommeln | 368 | 53 | 14.4 % |
| soeldnerheer | 41 | 6 | 14.6 % |
| bastion | 127 | 19 | 15.0 % |
| veteranen | 162 | 25 | 15.4 % |
| langeWurfarme | 339 | 53 | 15.6 % |
| drill | 399 | 63 | 15.8 % |
| werkmeister | 150 | 24 | 16.0 % |
| doppelschicht | 362 | 58 | 16.0 % |
| fliessband | 378 | 61 | 16.1 % |
| bessereFabriken | 366 | 60 | 16.4 % |
| gluecksritter | 187 | 31 | 16.6 % |
| zeugmeister | 65 | 11 | 16.9 % |
| schwerePressen | 383 | 67 | 17.5 % |
| sappeure | 196 | 35 | 17.9 % |
| selbstlaeufer | 167 | 30 | 18.0 % |
| notreserve | 144 | 26 | 18.1 % |
| handel (Pfad) | 1143 | 211 | 18.5 % |
| kriegsanleihe | 184 | 34 | 18.5 % |
| taktiker | 177 | 36 | 20.3 % |
| nachtschicht | 302 | 62 | 20.5 % |
| turmkanoniere | 135 | 28 | 20.7 % |
| scharfschuetzen | 66 | 15 | 22.7 % |
| glaskanonen (Pfad) | 21 | 5 | 23.8 % |
| befestigungskunde (Pfad) | 485 | 137 | 28.2 % |
| metallverarbeitung (Pfad) | 498 | 300 | 60.2 % |
| eiserneKlingen (Pfad) | 473 | 292 | 61.7 % |
| fortgeschritteneTaktiken (Pfad) | 364 | 241 | 66.2 % |
| echtesMilitaer (Pfad) | 369 | 300 | 81.3 % |
| gelehrte (Pfad) | 300 | 300 | 100.0 % |

#### Wahlrate je Karte („gierig“ mit Vorausschau, Normal)

| Karte | angeboten | gewählt | Wahlrate |
|---|---|---|---|
| zeugmeister | 21 | 0 | 0.0 % |
| serienbau | 22 | 0 | 0.0 % |
| bauleitung | 4 | 0 | 0.0 % |
| handelskontor | 8 | 0 | 0.0 % |
| grosseArmee | 1 | 0 | 0.0 % |
| ballistik (Pfad) | 206 | 6 | 2.9 % |
| notreserve | 46 | 2 | 4.3 % |
| bastion | 76 | 4 | 5.3 % |
| zinnen | 96 | 6 | 6.3 % |
| langeWurfarme | 118 | 8 | 6.8 % |
| handel (Pfad) | 629 | 44 | 7.0 % |
| dauerauftrag | 40 | 3 | 7.5 % |
| schildwall | 93 | 7 | 7.5 % |
| turmkanoniere | 63 | 5 | 7.9 % |
| kriegserfahrung | 134 | 11 | 8.2 % |
| soeldnerheer | 11 | 1 | 9.1 % |
| festungsbau | 32 | 3 | 9.4 % |
| kriegstrommeln | 98 | 11 | 11.2 % |
| sappeure | 40 | 5 | 12.5 % |
| werkmeister | 32 | 4 | 12.5 % |
| instandhaltung | 102 | 13 | 12.7 % |
| scharfschuetzen | 22 | 3 | 13.6 % |
| veteranen | 35 | 5 | 14.3 % |
| maurerkolonne | 133 | 20 | 15.0 % |
| selbstlaeufer | 41 | 7 | 17.1 % |
| gluecksritter | 35 | 6 | 17.1 % |
| aushebung | 77 | 14 | 18.2 % |
| pfadFestungsbau (Pfad) | 464 | 96 | 20.7 % |
| verbrannteErde | 9 | 2 | 22.2 % |
| kriegsanleihe | 45 | 10 | 22.2 % |
| befestigungskunde (Pfad) | 265 | 59 | 22.3 % |
| fliessband | 83 | 19 | 22.9 % |
| drill | 121 | 28 | 23.1 % |
| taktiker | 41 | 10 | 24.4 % |
| rationalisierung | 39 | 10 | 25.6 % |
| doppelschicht | 111 | 29 | 26.1 % |
| vorposten | 106 | 32 | 30.2 % |
| glaskanonen (Pfad) | 6 | 2 | 33.3 % |
| bessereFabriken | 115 | 41 | 35.7 % |
| allesAufDieMitte | 18 | 7 | 38.9 % |
| blitzkrieg | 5 | 2 | 40.0 % |
| grossauftrag | 36 | 15 | 41.7 % |
| schwerePressen | 153 | 67 | 43.8 % |
| nachtschicht | 65 | 29 | 44.6 % |
| weitschuss | 32 | 15 | 46.9 % |
| fortgeschritteneTaktiken (Pfad) | 196 | 100 | 51.0 % |
| metallverarbeitung (Pfad) | 218 | 120 | 55.0 % |
| belagerungsgeraet | 130 | 72 | 55.4 % |
| eiserneKlingen (Pfad) | 179 | 113 | 63.1 % |
| echtesMilitaer (Pfad) | 158 | 120 | 75.9 % |
| gelehrte (Pfad) | 120 | 120 | 100.0 % |

## Konfliktliste P.01 (Abgleich mit `main` 0.9.2)
Gemischt wurde `origin/main` (Commit 73e1590) in `exp/kartenpfad`, Commit b9187c7. Konflikte und ihre Auflösung:
| Datei | Konflikt | Auflösung |
|---|---|---|
| `config.js` | Version, Spielstand-Schlüssel, Blöcke `ENTDECKEN` und `KARTENBUEHNE` | Version `0.9.2-kartenpfad-3`, Schlüssel `klammerfront.save.v8` (Branch); beide Blöcke vereint: Symbole des Branches (`inhaltSymbole`, Familiensymbole), Schalter `UI.entdecken` und `UI.kartenbuehne` nun `true` wie `main` |
| `core.js` | Wirkungsprüfung (Versorgungsdeckel) gegen Pacing-Logik des Branches | beides übernommen; `supplyCapped`, `supplyOnly`, `noEffect` aus `main`, Pacing aus dem Branch |
| `discover.js`, `stage.js` | Branch-Fassung gegen Fassung aus `main` (Symbole) | Branch-Fassung als Obermenge, Korrekturen aus `main` (Textsymbole `\uFE0E`) übernommen |
| `index.html`, `ui.js`, `panels.js` | Oberfläche, Forschungsliste, Gruppierung der gewählten Karten | Branch-Oberfläche als Obermenge mit den Korrekturen aus `main`; `renderResearch` neu zusammengesetzt (Sichtbarkeit nach Quelle) |
| `i18n/de.js`, `i18n/en.js` | beide Seiten ergänzten Schlüssel | Vereinigung, Schlüsselparität geprüft |
| `CHANGELOG.md`, `CLAUDE.md`, `docs/STAND.md` | beide Seiten schrieben Abschnitte | beide Abschnitte behalten; `docs/STAND.md` stammt aus `main`, Branch-Stand in `docs/STAND-kartenpfad.md` |
| `package.json`, `tests/*` | Testskripte | `test:browser` startet drei Skripte; `browser-k2.mjs` (Modus `karten`) und `browser-k2-standard.mjs` (aus `main`, Modus `standard`) getrennt; Annahmen der Tests an die gemeinsamen Schalter-Voreinstellungen angepasst |

Nachträglich angepasst, weil `main` die Schalter `entdecken` und `buehne` standardmäßig einschaltet: Browser-Prüfungen für den „alten“ Standardmodus setzen `?entdecken=0&buehne=0` ausdrücklich.
Wirkungsprüfung im Modus `karten`: Der Test aus 0.9.2 läuft jetzt in beiden Modi; ein Fund (Wagnis „Volle Auslastung“ am Versorgungsdeckel), behoben.

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Schwer läuft im Fahrplan voraus** (Wahl 3 um 84 s bei „durchschnitt“, Wahl 4 um 106 s bei „gelegentlich“): Der EP-Ertrag liegt dort über dem Normal-Niveau, auf dem die Schwellen stehen. Pro-Grad-Schwellen sind die Abhilfe; die Anforderung verlangt gleiche Schwellen.
2. **Die Mitte der Partie bringt kaum EP.** Die Belagerung hält die Gegnerwellen auf, EP kommen in Stößen. Das ist die Ursache von Abweichung 1 und hat zwei Folgen: Die EP-Leiste wäre ohne Zeitanteil irreführend (jetzt füllt sich das Kartensymbol nach EP oder Zeit, je nachdem, was weiter ist), und EP-Karten verlieren Wirkung (Inventar). Eine EP-Quelle über die Zeit (Grundsold) würde den Fahrplan wieder an die EP binden; das ist eine Wirtschaftsänderung außerhalb des Umfangs.
3. **„Wissen zuerst“ und „Militär zuerst“ sind in Wahl 1 und 2 dieselbe Wahl.** Gelehrte erscheint erst ab Wahl 2, in Wahl 1 stehen immer Echtes Militär und Festungsbau. Beide Varianten wählen zuerst Echtes Militär und danach Gelehrte oder Metallverarbeitung; ihre Messwerte sind gleich (98 % Siege, 11:55). Abhilfe wäre `abWahl: 1` für Gelehrte und Metallverarbeitung (Daten in `data/kartenpfad.js`). Das ändert den Start: Echtes Militär wäre in Wahl 1 nicht mehr sicher, und auf Schwer entscheidet die Kaserne nach 75 s über die Partie.
4. **Wer vor der ersten Kaserne alle neun Plätze bebaut, kann die Kaserne nicht mehr bauen** (ohne Abriss). Der Bot rutschte hier in „Festung zuerst“ auf 40 % Siege. Ein Hinweis im Spiel („Kein Platz frei: eine Fabrik abreißen“) wäre eine kleine Oberflächenänderung; nicht umgesetzt.
5. **Die Bühne erscheint zehnmal in elf Minuten.** Die Ermüdung lässt sich nur im Spieltest messen (Bedenkzeit je Wahl im Protokoll: `thinkMs`).
6. **EP-Karten und Hörsaal** (Inventar): Kriegserfahrung, Glücksritter-Nachteil und die passive EP der Hörsaal-Forschung ändern den Takt nur noch für Spieler über dem Referenzniveau.
7. **„Festung zuerst“ gewinnt mit dem schnellen Bot 86 %** (Dauer 14:40, 13 Wahlen), weil Kaserne und Schmiede erst nach 3:26 und 5:51 stehen; mit Vorausschau 100 %.
8. **Leicht und Normal unterscheiden sich kaum** (gleiche Faktoren und Schwellen; die Gegnerstärke trägt den Unterschied).

## Prüfstand
BROWSERPRUEFUNG

## Offene Punkte für den PO
- **Bestätigung der Abweichungen 1 bis 3** (Fälligkeit nach Fahrplan, Schwellen aus der Obergrenze, erste Schwelle 43 EP). Wörtliche Fassung nach Anforderung per Schalter möglich, verfehlt aber die Zeittreue (Abweichung 1).
- **Entscheidung über das Inventar** (Tabelle oben): EP-Karten (Kriegserfahrung, Glücksritter), Serienbau, Bauleitung, Söldnerheer, Zinnen, Handelskontor.
- **Pro-Grad-Schwellen** für Leicht und Schwer? Die Anforderung verlangt gleiche Schwellen; Schwer läuft bis zu 106 s voraus.
- **`abWahl: 1` für Gelehrte** (Auffälligkeit 3), damit „Wissen zuerst“ ein eigener Weg ist? Kostet Sicherheit beim Start.
- **Hinweis bei vollem Raster** (Auffälligkeit 4).
- **Spieltest** mit dem Testleitfaden: Der Fahrplan ist für einen Bot eingestellt; Menschen erzeugen EP anders (REQ-P.06, Abschnitt 5).

## Reproduktion
```
npm test
node tools/sim-p3.mjs --runs 50 --suite alle --json reports/kartenpfad3-nach.json     # Felder, Varianten, gierig (mit --gierigRuns 30); rund 25 Minuten
node tools/sim-p3.mjs --runs 100 --suite bonus --json reports/kartenpfad3-bonuskarten.json
node tools/bericht-p3.mjs reports/kartenpfad3-nach.json docs/bilder/kartenpfad3-wahlzeiten.svg    # Tabellen und Grafik
node tools/fahrplan-kalibrieren.mjs --runs 100 --iter 2 --profile aktiv,durchschnitt --x1 43 --modus obergrenze   # Schwellen prüfen
```

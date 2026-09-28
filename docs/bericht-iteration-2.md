# Klammerfront – Umsetzungsbericht Iteration 2

Stand: 28.09.2026 · Version 0.3 · Grundlage: `docs/anforderungen-iteration-2.md`

## Ergebnis
Alle fünf Anforderungen sind umgesetzt, in der Reihenfolge aus Abschnitt 8, je Anforderung ein Branch mit `REQ-0x`-Commits.
20 automatische Tests laufen ohne Abhängigkeiten (`npm test`), die Browser-Prüfung (`npm run test:browser`) meldet keine Fehler.
Die Simulation umfasst für die Abnahme 2.700 Partien (1.800 für REQ-03, 600 Zielquoten, 300 Strategievergleich).
Drei Kennzahlen liegen außerhalb der Sollwerte; sie sind unten berichtet und nicht wegbalanciert.

## Entscheidungen des Product Owners (28.09.2026)
| Punkt | Entscheidung |
|---|---|
| Altmetall wird heute ausgegeben (02.1) | Altmetall ist nur noch Erfahrung. Mauer, Turm und Reparatur kosten Material. |
| Handelskontor (es gibt keinen Verkauf) | Zinsen: alle 10 s 1 % des Materialbestands, höchstens 30 s Automatik-Ertrag. |
| Tooltip-Verzögerung | 1.000 ms |
| Freigabe | Plan für alle fünf Anforderungen am Stück freigegeben, inkl. Kaserne und Draft-Pool. |

## Abweichungen und Auslegungen (zur Bestätigung)
1. **Stufenschwelle (02.2).** Wörtlich gelesen („Schwelle für Stufe n = XP_BASE × XP_GROWTH^(n−1) kumuliertes Altmetall“) läge der zweite Draft rund 20 s nach dem ersten und verletzte das Mindestintervall von 45 s. Umgesetzt: Jede Stufe verlangt XP_BASE × XP_GROWTH^(n−1) *zusätzlich*; die Schwelle ist die kumulierte Summe.
2. **Universität.** Das Dokument verweist auf „03.6“, das es nicht gibt. Einzige Wirkung ist die dritte Draft-Option (02.4). Die bisherigen Forschungen: Logistik → Kaserne (Rekrutierung), Nachtschicht → Fabrik, Beuteverwertung → Draft-Option „Schrottsammler“.
3. **Klick-Upgrades (03.3).** Stärkere Presse auf 2 Stufen gedeckelt (Klickwert höchstens 3). Hydraulik zu „Druckluft“ umgebaut (skaliert Fertiger statt Klick).
4. **Zusätzliche Regeln, die das Dokument nicht nennt.** Ohne sie endeten bis zu 40 % der Simulationspartien im Patt. Bitte bestätigen oder verwerfen:
   - *Tor belagert:* Stehen mindestens 3 Gegner am eigenen Aufstellpunkt, lassen sich keine Einheiten aufstellen. Beendet den Fleischwolf, in dem man mit unbegrenztem Material endlos Einheiten nachschiebt.
   - *Eskalation:* Ab Minute 16 wird der Gegner jede Minute um 40 % stärker. Wer seine Überlegenheit nicht in einen Durchbruch umsetzt, verliert.
   - *XP-Faktor je Schwierigkeitsgrad* (Leicht 1,45 · Normal 1,0 · Schwer 1,15): Ohne ihn kämen Stufen auf Leicht zu langsam, und die Phasen-Sollwerte wären dort nicht erreichbar.
5. **Branches.** Die Branches liegen im mitgelieferten Git-Verlauf. Von Cowork aus ist kein Push nach GitHub möglich.
6. **Dateistruktur.** Die eine HTML-Datei ist aufgeteilt, weil 7.2 und 04.3 eigene Dateien verlangen. Kein Build-Schritt, keine Abhängigkeiten.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| 01 | 4 Typen für 3 Slots bei Spielstart | erfüllt (Test) |
| 01 | Abriss bei Baukosten 200 erstattet 100 | erfüllt (Test) |
| 01 | Schmiede-Upgrade ruht nach Abriss, wirkt nach Neubau ohne Nachkauf | erfüllt (Test) |
| 01 | Handelskontor erst nach Draft baubar | erfüllt (Test) |
| 02 | Stufenaufstieg pausiert, 2 Optionen, mit Universität 3 | erfüllt (Test) |
| 02 | Keine Duplikate, einmalige Optionen nie wieder | erfüllt (Test, 40 Seeds × 12 Stufen) |
| 02 | Gleicher Seed, gleiche Angebotsfolge | erfüllt (Test) |
| 02 | Median-Abstand je Phase 45–150 s | erfüllt: Früh 56 s · Mitte 59 s · Spät 94 s; erster Draft 63 s |
| 02 | Jede Option in 5–60 % gewählt | **9 von 12 erfüllt**; Schwere Pressen 76 %, Kriegsanleihe 70 %, Sappeure 60,3 % |
| 03 | Klickanteil Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 % | erfüllt, siehe Tabelle unten |
| 03 | Stopp ab Spät ≥ 95 % der Dauerklick-Siegquote | erfüllt: 100 % · 102 % · 103 % |
| 03 | Nie klicken ≤ 50 % der Dauerklick-Siegquote | erfüllt: 0 % in allen Stufen |
| 03 | Ziel-Siegquoten bleiben erfüllt | **überwiegend**; Abweichungen siehe unten |
| 04 | Schlüsselmengen de/en identisch | erfüllt (Test) |
| 04 | Keine sichtbaren Texte außerhalb der Sprachdateien | erfüllt (Tests für index.html, ui.js, core.js) |
| 04 | Vollständige Partie in beiden Sprachen ohne Reste | erfüllt (Browser-Prüfung) |
| 05 | Tooltip-Prüfung meldet null Elemente | erfüllt (Browser-Prüfung, beide Sprachen) |
| 05 | Tooltip nach Verzögerung ± 100 ms, nie außerhalb des Fensters | erfüllt: 1.001–1.002 ms |
| 05 | Deaktivierter Kaufknopf zeigt fehlenden Betrag | erfüllt („Fehlt: 30 Material“) |

## Kennzahlen REQ-03 (200 Läufe je Schwierigkeitsgrad und Klickverhalten, 6 Klicks/s)
| Schwierigkeit | Klickanteil Früh | Mitte | Spät | Siegquote Dauerklick | Stopp ab Spät | nie klicken |
|---|---|---|---|---|---|---|
| Leicht | 68,1 % | 19,2 % | 2,7 % | 100 % | 100 % | 0 % |
| Normal | 67,6 % | 17,6 % | 0,0 % | 92 % | 94 % | 0 % |
| Schwer | 73,0 % | 27,7 % | 0,0 % | 81 % | 83 % | 0 % |

## Zielquoten (50 Partien je Feld, gierige Heuristik)
| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 100 % · 5:19 | 100 % · 5:40 | 82 % · 10:10 | 0 % |
| Normal | 90 % · 8:19 | 86 % · 10:25 | 0 % | 0 % |
| Schwer | 64 % · 11:54 | 78 % · 12:28 | 0 % | 0 % |

Abweichungen vom Zielkorridor: Leicht/durchschnitt gewinnt 20 s zu früh (Soll 6–9 min), Schwer/durchschnitt 30 s zu früh (Soll 13–20 min).
Schwer/aktiv verliert 34 % der Partien, fast alle nach Minute 20 durch die Eskalation. Eine von 600 Partien blieb offen.

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die Schmiede ist faktisch Pflicht.** Kombinationen mit Schmiede gewinnen 73–100 %. Ohne Schmiede bleibt die Einheitenstärke bei 1,0, und die Eskalation gewinnt. Das erklärt die späten Niederlagen von Schwer/aktiv.
2. **Die Kaserne ist zu schwach.** Die gierige Heuristik baut sie nur in 21 % der Partien (Fabrik 84 %, Schmiede 75 %). „Masse statt Qualität“ greift kaum, weil in der Lane nur die vorderste Nahkampfeinheit kämpft. Vorschlag: Kaserne-Upgrade „Doppelreihe“ (zwei Nahkämpfer greifen gleichzeitig an) oder günstigere Einheiten mit spürbarem Stapeleffekt.
3. **Wirtschafts-Optionen dominieren den Draft.** Schwere Pressen (76 %) und Kriegsanleihe (70 %) liegen über 60 %. Ein Teil davon geht auf die Bewertungsfunktion der Heuristik zurück, die Produktion stark gewichtet. Eine Testrunde mit Menschen sollte klären, ob das Spieler genauso sehen.
4. **Handelskontor.** Es hilft nur zusammen mit einer Fabrik (mit Fabrik und Schmiede 85 % Siege, mit Fabrik und Universität 7 %). Zinsen auf einen kleinen Bestand bringen wenig.
5. **Zahlen wachsen idle-typisch.** In Phase Spät liefert die Automatik mehrere hundert bis tausend Material pro Sekunde. Das ist die Voraussetzung für höchstens 3 % Klickanteil und verändert das Spielgefühl.

## Offen für den Product Owner
1. Die drei Zusatzregeln aus „Abweichungen“, Punkt 4, bestätigen oder verwerfen.
2. Kaserne stärken (Vorschlag oben) oder als Nischengebäude belassen.
3. Draft-Ausreißer abschwächen oder nach einem Test mit Menschen belassen.
4. Handy-Layout: funktionsfähig, aber nicht für Touch-Spiel optimiert.

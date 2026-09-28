# Klammerfront – Umsetzungsbericht Iteration 3

Stand: 28.09.2026 · Version 0.4 · Grundlage: `docs/anforderungen-iteration-3.md` · Stand je Inkrement: `docs/STAND.md`

## Ergebnis
Alle sieben Inkremente sind umgesetzt, auf dem Branch `3x3-und-3-Lanes-Spiel` mit je einem Commit `I3.x` (I5 und I6 in einem gemeinsamen Commit).
53 automatische Tests laufen ohne Abhängigkeiten (`npm test`), die Browser-Prüfung (`npm run test:browser`) ist in beiden Sprachen grün.
Die Abschluss-Simulation umfasst 3.800 Partien, davon 3.000 in der Serie nach REQ-21.3; Patt-Quote 0 %, reine Verteidigung verliert immer. Verfehlt werden zwei der zwölf Zielkorridore, die Klickanteile im Mittel- und Spätspiel und der Kartenabstand im Frühspiel; das ist unten berichtet und nicht wegbalanciert.

**Starten:** `index.html` im Browser öffnen.

## Klartext-Zusammenfassung
- Das Schlachtfeld hat drei Bahnen. Deine Einheiten verteilen sich selbst, Nahkämpfer vorn, Fernkämpfer dahinter. Deine Basis besteht aus zwei Mauern mit Türmen und dem Tor; fällt das Tor, ist die Partie verloren.
- Einheiten rücken alle 20 Sekunden gemeinsam als Welle aus, begrenzt durch das Versorgungslimit. Die Kaserne hebt das Limit. „Halten“ spart 30 % bei Mauer, Turm und Reparatur.
- Material kommt vom Klicken und aus Fabriken im 3×3-Raster. Die Schmiede ist nicht mehr Pflicht: Ohne sie gewinnen Bots auf Normal 32 % der Partien (Iteration 2: nahe 0 %).
- Spezialkarten haben Stufen I–III. In Minute 16 greift eine angekündigte Belagerungswelle an; wer bis dahin nicht angreift, verliert.
- Jeder Knopf erklärt in einer Zeile Wirkung und Kosten. Beim ersten Kontakt mit einem neuen System erscheint einmal ein kurzer Hinweis.

## Entscheidungen, die der PO bestätigen sollte
Die vollständige Liste mit Begründung steht in `docs/STAND.md`, Abschnitt „Abweichungen und Auslegungen“ (25 Punkte). Die wichtigsten:

| Nr. | Punkt | Warum |
|---|---|---|
| 1 | „Tor belagert“ entfällt schon in I1 statt I2 | Je Lane angewandt blockierte die Regel die Warteschlange dauerhaft (Patt) |
| 6 | Rang in der Kolonne zählt nur Einheiten zwischen Einheit und Ziel | Eine Einheit hinter der gegnerischen Front blockierte sonst ihre eigene Kolonne (Patt) |
| 21 | Belagerungswelle: dreifache Stärke je Einheit, nicht dreifache Anzahl | In der Kolonne kämpfen nur die vordersten Einheiten; mehr Einheiten wirken kaum |
| 22 | Gegner im Feld wachsen mit jeder Welle mit | Ein Stau alter Einheiten hielt die Feldgrenze besetzt (Patt) |
| 23 | Reparatur je Abschnitt höchstens alle 5 s | Reiche Spieler reparierten schneller, als der Gegner Schaden machte (Patt) |
| 11 | Schmiede: ein Upgrade „Qualitätsstufe“ statt Klingen, Rüstung, Drill | 17.3 beschreibt Qualitätsstufen; ein Upgrade ist der klarere Materialabfluss |
| 12 | Kaserne: das Gebäude ist Ausbaustufe 1 | Sonst bringt der Bau der Kaserne allein nichts |
| 16 | Stufen der übrigen Karten | 18.6 verlangt einen Vorschlag; Tabelle in `docs/STAND.md` |

## Kalibrierung (REQ-21.5, nur Konstanten in `config.js`)
| Konstante | Vorgabe / vorher | Jetzt | Grund |
|---|---|---|---|
| `POST_SIEGE_GROWTH` | 0,10 | 0,6 | Erst ab 0,5 verliert „nur Verteidigung“ bis Minute 25 auf allen Stufen |
| `UNIT_STRENGTH_PER_LEVEL` | 0,05 | 0,08 | Partien ohne Schmiede ≥ 30 % Siege |
| `FX_QUALITAET` (Schmiede je Stufe) | 0,25 | 0,12 | Schmiede nicht mehr Pflicht; Zielkorridore mit Schmiede halten |
| `enemyBaseHp` Leicht / Normal / Schwer | 1.500 / 2.200 / 3.800 | 4.800 / 5.000 / 5.500 | Siege kamen 1–3 Minuten zu früh |
| Leicht `waveBase` / `waveGrowth` | 1,5 / 0,4 | 1 / 0,3 | „gelegentlich“ verlor auf Leicht nach knapp 3 Minuten |
| Normal `waveGrowth` | 0,8 | 0,6 | I3: Partien ohne Schmiede |
| Schwer `waveGrowth`, `hpGrowth`, `dmgGrowth` | 1,3 / 0,17 / 0,10 | 0,9 / 0,07 / 0,05 | „durchschnitt“ überlebte die Belagerungswelle sonst kaum |
| `FACTORY_BASE_RATE` / `FACTORY_BASE_COST` | neu | 2,5 / 30 | Vorgabe „per Simulation“ |
| `REPAIR_COOLDOWN_S` | neu | 5 | gegen Patts, siehe oben |

## Abnahmekriterien
| Inkr. | Kriterium | Ergebnis |
|---|---|---|
| I1 | Einheiten wechseln nie die Lane | erfüllt (Test) |
| I1 | Verteilung n = 1 bis 6 nach 12.1; Übergangsregel 12.2 | erfüllt (Test; der Test zu 12.2 entfiel mit I2, siehe `STAND.md`) |
| I1 | Fernkämpfer mit einer Einheit vor sich greift an, mit zwei nicht; ohne Nahkämpfer steht er vorn | erfüllt (Test) |
| I1 | Mauer oben fällt: Turm oben inaktiv, Gegner greifen das Tor an; Tor auf 0 = Niederlage | erfüllt (Test) |
| I2 | Ausrücken nur im Takt, Warteschlange ≤ Versorgungslimit | erfüllt (Test) |
| I2 | Gegnervorschau = tatsächliche Welle (gleicher Seed) | erfüllt (Test, 6 Wellen) |
| I2 | „Halten“: Reparatur kostet 70 %, Befehl springt zurück | erfüllt (Test: 42 statt 60 Material) |
| I2 | Kurzsimulation 0 offen ohne „Tor belagert“ | erfüllt |
| I3 | Neun Plätze; dritte Fabrik kostet 1,6² × erste; zweites Verstärkungsgebäude nicht baubar | erfüllt (Test) |
| I3 | Kaserne Stufe 2 → Versorgungslimit 7 | erfüllt (Test) |
| I3 | Einheitenstärke steigt mit Stufen ohne Schmiede | erfüllt (Test) |
| I3 | Ohne Schmiede auf Normal ≥ 30 % Siege | erfüllt: 16 von 50 = 32 % (nach Kalibrierung) |
| I4 | Stufe II nie vor Stufe I, nach Stufe III nie wieder | erfüllt (Test, 60 Seeds × 25 Stufen) |
| I4 | Maurerkolonne heilt nicht < 5 s nach Treffer, nie das Tor | erfüllt (Test) |
| I4 | Ohne Fabrik nie Handelskontor | erfüllt (Test, 40 Seeds) |
| I5 | Ankündigung genau 60 s vorher; danach linear statt exponentiell | erfüllt (Test) |
| I5 | Kurzsimulation 0 offen | erfüllt |
| I6 | Jeder Knopf mit Erklärzeile | erfüllt (Browser-Prüfung, Spiel, Startbildschirm, Bau-Dialog, beide Sprachen) |
| I6 | Hinweis pro Browser einmal, nach Zurücksetzen wieder | erfüllt (Test und Browser-Prüfung) |
| I7 | Patt-Quote ≤ 2 % | erfüllt: 0 von 3.000 |
| I7 | „nur Verteidigung“ gewinnt 0 %, endet spätestens Minute 25 | erfüllt: 0 Siege, späteste Niederlage 23:58 |
| I7 | „aktiv“ gewinnt je Stufe mindestens so oft wie „durchschnitt“ | erfüllt: 100/100 · 100/100 · 96/77 % |
| I7 | Zielkorridore aus Iteration 2 | **9 von 12 Feldern**; Abweichungen unten |
| I7 | Karten mit Differenz über +25 Prozentpunkten berichten | keine Karte über +25 (höchste: Schrottsammler +4) |

## Kennzahlen der Serie (REQ-21.3: 200 Partien je Schwierigkeitsgrad und Spielerprofil, gierige Heuristik)
| Schwierigkeit | Profil | Siege | Niederlagen | offen | Median Sieg | Soll | Wellen am Limit |
|---|---|---|---|---|---|---|---|
| Leicht | aktiv | 100 % | 0 % | 0 | 5:09 | 5–7 min ✓ | 78 % |
| Leicht | durchschnitt | 100 % | 0 % | 0 | 6:21 | 6–9 min ✓ | 76 % |
| Leicht | gelegentlich | 62 % | 39 % | 0 | 7:36 | Sieg, 10–18 min **✗** | 57 % |
| Leicht | passiv | 0 % | 100 % | 0 | – | darf verlieren ✓ | 37 % |
| Leicht | verteidigung | 0 % | 100 % | 0 | – (spätestens 23:58) | verliert bis Min. 25 ✓ | – |
| Normal | aktiv | 100 % | 0 % | 0 | 7:18 | 6–9 min ✓ | 89 % |
| Normal | durchschnitt | 100 % | 0 % | 0 | 9:32 | 9–13 min ✓ | 82 % |
| Normal | gelegentlich | 5 % | 96 % | 0 | 11:13 | darf verlieren ✓ | 78 % |
| Normal | passiv | 0 % | 100 % | 0 | – | verliert ✓ | 13 % |
| Normal | verteidigung | 0 % | 100 % | 0 | – (spätestens 23:13) | verliert bis Min. 25 ✓ | – |
| Schwer | aktiv | 96 % | 4 % | 0 | 8:39 | 8–12 min ✓ | 90 % |
| Schwer | durchschnitt | 77 % | 23 % | 0 | 10:40 | 13–20 min **✗** (zu früh) | 88 % |
| Schwer | gelegentlich | 2 % | 99 % | 0 | 10:30 | verliert **≈** (3 Siege) | 77 % |
| Schwer | passiv | 0 % | 100 % | 0 | – | verliert ✓ | 6 % |
| Schwer | verteidigung | 0 % | 100 % | 0 | – (spätestens 23:16) | verliert bis Min. 25 ✓ | – |

Kurzsimulation nach Anhang A (20 Partien Normal, durchschnitt): 18 Siege, 2 Niederlagen, 0 offen.

Profile: aktiv und durchschnitt halten, sobald ein Abschnitt unter 50 % fällt; gelegentlich und passiv halten nie; „verteidigung“ hält immer und kauft keine Einheiten (REQ-21.1).

### Wellenbefehl als Strategie (Normal, durchschnitt, je 50 Partien)
| Strategie | Siegquote | Median Sieg |
|---|---|---|
| nie halten | 100 % | 9:08 |
| halten, sobald ein Abschnitt unter 50 % fällt | 100 % | 9:09 |

### Gebäude (Strategievergleich, 30 Partien je Schwierigkeitsgrad und Strategie)
| Strategie | Fabrik | Schmiede | Kaserne | Universität | Handelskontor |
|---|---|---|---|---|---|
| Zufall | 100 % | 100 % | 100 % | 86 % | 37 % |
| gierig | 100 % | 100 % | 100 % | 82 % | 30 % |

Siegquote je Gebäudekombination: 6 Fabriken + Kaserne + Schmiede + Universität 98 % (96 Partien); mit Handelskontor statt einer Fabrik 89 % (37);
mit Handelskontor statt Universität 82 % (17). Siegquote gierig gegen Zufall: Leicht 100/100 %, Normal 100/100 %, Schwer 73/90 %.
Ohne Schmiede (eigene Reihe, Normal, durchschnitt): 32 % Siege, Median 12:15.

### Spezialkarten
Wahlrate (gierige Heuristik, Soll 5–60 %): 15 von 18 Karten im Soll; über 60 %: Schwere Pressen 66 %, Sappeure 65 %, Kriegsanleihe 62 %;
am seltensten Lange Wurfarme 11 %.

Siegquote mit gegen ohne Karte (aktiv und durchschnitt, 1.200 Partien): alle Differenzen zwischen −7 und +4 Prozentpunkten, keine über +25.
Die Kennzahl ist verzerrt: Längere Partien bringen mehr Stufen und damit mehr Karten, lange Partien enden aber häufiger mit einer Niederlage.
Das erklärt die durchweg leicht negativen Werte. Bei 95 % Siegen in diesen Profilen trennt die Kennzahl kaum; aussagekräftiger ist sie in engen Feldern
(ohne Schmiede: Bessere Fabriken −40, Aushebung −29, Sappeure +17, Lange Wurfarme +19 Prozentpunkte bei je 13–33 Partien).

Median-Abstand zwischen zwei Kartenwahlen: Früh 37 s (Soll ≥ 45 s), Mitte 48 s, Spät 76 s; erste Karte nach 84 s (Soll 60–90 s).

### Klickanteile nach REQ-03 (50 Partien je Schwierigkeitsgrad und Klickverhalten, 6 Klicks/s)
| Schwierigkeit | Klickanteil Früh | Mitte | Spät | Siegquote Dauerklick | Stopp ab Spät | nie klicken |
|---|---|---|---|---|---|---|
| Leicht | 63,7 % | 50,1 % | 40,5 % | 100 % | 100 % | 0 % |
| Normal | 63,8 % | 49,5 % | 37,3 % | 100 % | 100 % | 0 % |
| Schwer | 64,9 % | 48,1 % | 32,9 % | 100 % | 94 % | 0 % |

Soll: Früh ≥ 50 % ✓, Mitte 10–30 % **✗**, Spät ≤ 3 % **✗**; Stopp/Dauer ≥ 95 % (Schwer 94 %, knapp **✗**); nie/Dauer ≤ 50 % ✓.

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Klicken bleibt bis zum Schluss wichtig.** Die Zahl der Fabriken ist durch die neun Bauplätze begrenzt. Die Automatik bleibt deshalb im Spätspiel
   in derselben Größenordnung wie sechs Klicks pro Sekunde mit gedeckelter Presse (18 Material/s); gemessen sind 33–41 % Klickanteil statt ≤ 3 %.
   Den Sollwert zu erreichen hieße, den Fabrikertrag um mehr als das Zehnfache zu erhöhen. Das habe ich nicht getan: Material wäre dann kein
   knappes Gut mehr, und die Schmiede als Abfluss liefe ins Leere.
2. **Das Versorgungslimit ist der Engpass.** 76–90 % der eigenen Wellen der aktiven Profile rücken voll aus. Deshalb unterscheiden sich die Profile
   in der Siegzeit wenig, und „gelegentlich“ gewinnt auf Leicht so schnell wie „durchschnitt“ (7:36 statt 10–18 min) oder verliert früh gegen die
   ersten Wellen, bevor die erste Fabrik steht (39 % Niederlagen, Median 3:47).
3. **Wenige Einheiten gehen zuerst in die Mitte (12.1).** Gegner verteilen sich zufällig. Spieler mit kleinen Wellen verlieren deshalb früh die
   Seitenmauern. Die Regel schützt das Tor, macht den Frühstart aber hart.
4. **Nur die vordersten Einheiten kämpfen (12.4).** Die Anzahl der Einheiten zählt deshalb wenig, Stärke je Einheit viel. Das hat drei neue
   Regeln gegen Patts erzwungen (Punkte 21–23 oben) und macht die Belagerungswelle erst mit Stärke je Einheit wirksam.
5. **„Halten“ ändert die Siegquote der Bots nicht** (100 % gegen 100 %, gleiche Siegzeit). Die Heuristik nutzt den Rabatt, gewinnt aber schon vorher.
   Ob „Halten“ für Menschen ein Werkzeug ist, zeigt erst ein Test mit Spielern.
6. **Schwer: gierig schlechter als Zufall** (73 % gegen 90 %). Die Vorausschau von 45–120 s bewertet Wirtschaft höher als Verteidigung und
   unterschätzt die Belagerungswelle in Minute 16.
7. **Handelskontor bleibt schwach.** Kombinationen mit Kontor gewinnen 82–89 % gegen 98 % ohne; der Platz fehlt einer Fabrik oder der Universität.

## Offen für den Product Owner
1. Die Abweichungen und Auslegungen in `docs/STAND.md` bestätigen oder verwerfen, vor allem die drei neuen Regeln gegen Patts (21–23).
2. Kalibrierte Werte abweichend von den Vorgaben bestätigen: `POST_SIEGE_GROWTH` 0,6 statt 0,10, `UNIT_STRENGTH_PER_LEVEL` 0,08 statt 0,05.
3. Sollwerte „Klickanteil Mitte/Spät“ (REQ-03) für das Fabrikmodell neu festlegen, etwa Mitte 20–50 %, Spät ≤ 40 %, oder Fabrikertrag mit der Stufe wachsen lassen.
4. Leicht/gelegentlich und Schwer/durchschnitt: Korridore anpassen oder eine eigene Stellschraube für den Frühstart (z. B. erste Fabrik gratis) freigeben.
5. Kartenwahl zu früh im Frühspiel (37 s statt ≥ 45 s): Stufenschwelle `XP_BASE` anheben oder den Sollwert lockern.
6. Test mit Menschen: Verständlichkeit von Wellen, Vorschau und „Halten“; Handy-Layout bleibt zurückgestellt (funktioniert, ohne horizontales Scrollen).

## Rohdaten
`reports/req21-*.txt` und `.json`. Nachrechnen: `node tools/simulate.mjs --runs 200 --suite ziele` (etwa eine Stunde auf vier Kernen).

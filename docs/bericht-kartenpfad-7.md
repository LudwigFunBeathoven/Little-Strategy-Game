# Bericht Kartenpfad Teil 7: Haupthaus, Fabrikgrenze, Weiterentwicklungen, historisches Setting (v0.9.2-kartenpfad-7)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-7.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-7.md`. Stand je Inkrement: `docs/STAND-kartenpfad.md`. Rohdaten: `reports/kartenpfad7-*`.
Messung: schneller Bot („einheiten-zuerst“), 50 Partien je Feld, gleiche Seeds vorher und nachher. Kategorie-Bots Normal und Schwer, drei Profile, ohne und mit `?druck=hoch` (1 800 Partien); Bot ohne Kategorie alle neun Felder, dazu Normal und Schwer mit `?druck=hoch` (750 Partien);
Doktrinen Zunftordnung, Ausfall, Grenzfeste im Paarvergleich (50 Partien je Arm, Normal, durchschnitt, ohne Druck). Auswertung `node tools/basis-p7.mjs --prefix kartenpfad7` (vorher: `--prefix kartenpfad7-basis`).
„Vorher“ ist der Stand nach Teil 6 (R.0, Basismessung), „nachher“ der Stand nach R.7 mit korrigiertem Bot (Abschnitt „Bot-Fehler während der Messung“).

## Ergebnis
Alle zwölf Anforderungen sind umgesetzt, die Soll-Anforderungen K7.10 und K7.11 eingeschlossen; 442 Unit-Tests und 695 Browser-Prüfpunkte sind grün, der Modus `standard` ist unverändert (Golden-Test), die Spielstand-Version steht auf 12.
Bauen wird zur Entscheidung: Kein Bot hält am Ende mehr alle vier Spezialgebäude (Schmiede beim Militär-Bot in 12 % der Partien, Universität beim Bot ohne Kategorie in 20 %; vorher je 100 %), das Rathaus steht im Median in Wahl 4–5, Wasserrahmen und Buchdruck schließen nach 5:51 und 6:19 min ab (vorher Dampfkraft 14:31, Buchdruck 15:18).
Der Preis ist Stabilität: Patts steigen ohne Schalter von 0,7 auf 2,4 %, mit `?druck=hoch` von 1,7 auf 4,0 % (Bot ohne Kategorie); die Spannweite der Kategorie-Bots sinkt von 9:19 auf 7:55 min, bleibt aber über dem Ziel von 5 min; die Grenzfeste kostet 24 Prozentpunkte Siege.

## Zielwerte im Überblick (REQ-K7.12)
| Kennzahl | Zielwert | Ergebnis |
|---|---|---|
| Spannweite Dauer-Mediane der Kategorie-Bots (Normal) | ≤ 5 min (Teil 6: 9:11) | **verfehlt**: 7:55 (Militär 12:44, Wirtschaft 16:28, Verteidigung 20:39); vorher 9:19 |
| Wahlen je Partie, Partiedauer (Normal, durchschnitt, Bot ohne Kategorie) | 12–16 Wahlen, 13–17 min | **erfüllt**: 15 Wahlen, 15:34 (Kalibrierung `basisFaktor` Normal 10,5 → 9,5) |
| Siegquote Schwer, durchschnitt | 70–90 % | **erfüllt**: 84 % (vorher 88 %) |
| Patt-Quote mit `?druck=hoch` | ≤ 2 % | **verfehlt**: Bot ohne Kategorie 4,0 % über alle Felder (vorher 1,7 %); Verteidigung 7,7 %, Wirtschaft 2,7 %, Militär 1,0 % |
| Fabrikplätze bei Minute 10 | nie über der Grenze; Verteilung | **erfüllt**: 0 von 191 Partien; Verteilung in der Tabelle „Fabrikplätze“ |
| Stadtrecht abgeschlossen | Median ≤ Wahl 5 | **erfüllt**: Wahl 4 (Militär, Verteidigung, ohne), Wahl 5 (Wirtschaft); fertig nach 4:00–4:46 min |
| Wasserrahmen, Buchdruck abgeschlossen (Wirtschafts-Bot) | Median Minute 6–9 | **knapp**: Buchdruck 6:19 erfüllt; Wasserrahmen 5:51, neun Sekunden zu früh |
| Sichtbare Bedienelemente Minute 10 | höchstens 5 mehr als nach Teil 6 (54 / 53) | **erfüllt**: 58 / 57 (+4) |
| Partie ohne Universität, Schmiede oder Kontor | ≥ Hälfte der Tester | offen (Spieltest). Bots: Militär ohne Schmiede 88 %, ohne Kategorie ohne Universität 80 %, Verteidigung ohne Schmiede 70 % |
| Weiterentwicklung als Fortschritt / Bauen als Entscheidung | ≥ Hälfte der Tester | offen: Spieltest nach `docs/testleitfaden-kartenpfad-7.md` |

## Entscheidungen des PO (aus der Anforderung)
Haupthaus im Mittelfeld ohne Nachbarschaft und ohne Lebenspunkte; Stufen über Karten, je Stufe ein Flügel; feste Obergrenze 3/4/5 für Fabrikplätze; Zunftordnung und Grenzfeste mit neuen Einschränkungen; Handelshaus mit Söldnerkompanien, Gießerei mit Geschützen; höchstens zwei Stufen je Gebäude, Wasserrahmen neu, Dampfkraft als zweite Stufe;
historische Namen 1350–1850; zweites Exemplar von Kaserne und Universität; Ausfall mit Basisschaden; Kriterien zur Stärke über Dauer, Wahlen, Mauerverlust, Fabrikzahl und Spannweite.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| K7.01 | Tabelle Basismessung | Abschnitt „Basismessung und Vergleich“; `reports/kartenpfad7-basis-auswertung.txt`. |
| K7.02 | Test: Mittelfeld ab Start belegt, nicht abreißbar, kein Nachbarschaftsbonus von oder an das Haupthaus | `tests/haus7.test.mjs`. |
| K7.02 | Bildschirmfoto des Rasters und des Reiters | `docs/bilder/kartenpfad7-haus-stufe1.png` (Gutshof, Reiter Haupthaus), `kartenpfad7-haus-residenz.png` (Residenz mit zwei Flügeln). |
| K7.03 | Test: Stufe II und III nur nach Karte und Bezahlung; Grenze und Flügel wie in der Tabelle | `tests/haus7.test.mjs` (13 Tests). |
| K7.03 | Test je Flügel; Kanzlei und Universität zusammen höchstens 4 Karten | `tests/haus7.test.mjs`. |
| K7.03 | Test: mit Bibliothek ohne Universität Technologiekarten wählen und erforschen | `tests/haus7.test.mjs`; Bild `kartenpfad7-haus-fluegelwahl.png`. |
| K7.03 | Simulation: Stadtrecht im Median spätestens in Wahl 5; Anteil mit Residenz | **erfüllt**: Wahl 4–5; Residenz in 98–100 % der Partien, fertig nach 7:51–9:42 min. |
| K7.04 | Test: Grenze greift für jede Form aus einer Fabrik | `tests/haus7.test.mjs` (Grundform, Variante, Sonderbau, Weiterentwicklung, während der Aufwertung). |
| K7.04 | Simulation: Fabrikplätze bei Minute 10 nie über der Grenze; Belegung | **erfüllt**: 0 von 191. |
| K7.05 | Test je Doktrin | `tests/doktrinen.test.mjs`, `doktrinen6.test.mjs`, `einschraenkung6.test.mjs`. |
| K7.06 | Test: Kompanie rückt aus, belegt keine Versorgung, Kosten und Abklingzeit greifen | `tests/weiter7.test.mjs`. |
| K7.06 | Simulation: Wirtschafts-Bot, Normal: Dauer sinkt gegenüber 17:11 | **erfüllt, mit Einschränkung**: 16:28; die Siegquote sinkt aber von 100 auf 90 % (4 % Patt, 6 % Niederlagen). |
| K7.07 | Test: Geschütz erst nach Abschluss; Schadensfaktor an der Basis | `tests/weiter7.test.mjs`. |
| K7.07 | Simulation: Spannweite ≤ 5 min; Patt mit `?druck=hoch` ≤ 2 % | **verfehlt**: 7:55; 4,0 %. |
| K7.08 | Simulation: Wasserrahmen und Buchdruck Median Minute 6–9 (Wirtschafts-Bot) | **knapp**: 5:51 und 6:19. |
| K7.08 | Bericht: Anteil der Partien mit Dampfkraft und Zeitpunkt | Wirtschaft 72 % nach 11:08, ohne Kategorie 24 % nach 17:18, Verteidigung 14 % nach 23:35, Militär nie. |
| K7.09 | Suchtest über `i18n/` im Modus karten; Sprach-Audit | `tests/namen7.test.mjs`, `tests/sprache.test.mjs`; Zuordnung im Abschnitt „Namen“. |
| K7.10 | Test je Gebäude; wie oft der freie Platz belegt wird | `tests/zweites7.test.mjs`. Bots: zweite Universität zeitweise in 8 von 50 Partien (Wirtschaft), zweite Kaserne in 1–2; am Ende fast nie (Auffälligkeit 5). |
| K7.11 | Verteidigungs-Bot mit Ausfall, Normal: Median der Dauer unter 17 min | **verfehlt**: 20:16 (ohne Doktrin 23:07). |
| K7.12 | Bots, Messung, Bericht, Testbuild, Testleitfaden, Protokoll; Spielstand-Version 12; Golden-Test | `tools/browser-bot.js`, `tools/basis-p7.mjs`, dieser Bericht, privater Testbuild, `docs/testleitfaden-kartenpfad-7.md`; `session.js` Format 4; `SAVE_KEY` `klammerfront.save.v12`; `tests/unveraendert.test.mjs`. |

## Basismessung und Vergleich (Normal, durchschnitt, je Bot 50 Partien)

### Fabrikplätze im Raster (Median; Mittel in Klammern)
| Bot | Minute 2 vorher → nachher | Minute 5 | Minute 10 | Verteilung Minute 10 nachher |
|---|---|---|---|---|
| Militär | 4 → 3 | 5 → 4 | 5 → 5 (4,8) | 4: 8, 5: 33 |
| Wirtschaft | 4 → 3 | 5 → 4 (3,5) | 5 → 4 (4,0) | 3: 8, 4: 32, 5: 10 |
| Verteidigung | 4 → 3 | 5 → 4 | 5 → 5 (4,8) | 4: 12, 5: 38 |
| ohne Kategorie | 4 → 3 | 5 → 4 | 5 → 5 (4,6) | 3: 2, 4: 14, 5: 34 |

Die Grenze wirkt früh: Bei Minute 2 und 5 steht je eine Fabrik weniger als vorher. Bei Minute 10 haben drei Bots ihre fünfte Fabrik wieder; nur der Wirtschafts-Bot erreicht die Residenz später (9:42) und bleibt eine Fabrik zurück.

### Belegung der Plätze am Partieende (Anteil der Partien mit dem Gebäude)
| Bot | Schmiede vorher → nachher | Universität | Kontor | Kaserne | Flügel |
|---|---|---|---|---|---|
| Militär | 100 → 12 % | 100 → 92 % | 100 → 100 % | 100 % | Zeughaus, Kanzlei |
| Wirtschaft | 100 → 100 % | 100 → 94 % | 100 → 84 % | 100 % | Schatzkammer, Bibliothek |
| Verteidigung | 100 → 30 % | 100 → 76 % | 100 → 100 % | 100 % | Bibliothek, Zeughaus |
| ohne Kategorie | 100 → 100 % | 100 → 20 % | 100 → 100 % | 100 % | Kanzlei, Bibliothek |

Freie Plätze am Ende: keine. Ein zweites Exemplar steht am Ende in 1 von 200 Partien. Das Gebäude, dessen Aufgabe ein Flügel übernimmt, weicht der nächsten Fabrik (Bot-Regel, Auslegung 10).

### Nachbarschaft und Synergien am Partieende
| Bot | Nachbarschaft Fabriken (Median) vorher → nachher | Bauordnung gewählt | Gilde gewählt (Wert) |
|---|---|---|---|
| Militär | 0,36 → 0,24 | 0 → 0 % | 0 → 2 % |
| Wirtschaft | 3,60 → 1,44 | 96 → 94 % | 92 → 82 % (+64 %) |
| Verteidigung | 0,48 → 0,24 | 10 → 4 % | 8 → 6 % |
| ohne Kategorie | 0,60 → 0,36 | 28 → 14 % | 14 → 12 % |

Das Mittelfeld fehlt den Fabrikketten, wie in K7.02 vorhergesagt: Der Wirtschafts-Bot verliert 60 % seines Nachbarschaftswerts.

### Weiterentwicklungen (Anteil der Partien mit Abschluss · Abschluss Median)
| Bot | Wasserrahmen | Dampfkraft vorher → nachher | Buchdruck vorher → nachher | Fernhandel | Geschützguss |
|---|---|---|---|---|---|
| Militär | 2 % · 10:47 | 2 % · 14:06 → – | 2 % · 8:58 → 10 % · 7:29 | 6 % · 5:36 | 10 % · 4:44 |
| Wirtschaft | 100 % · 5:51 | 60 % · 14:31 → 72 % · 11:08 | 60 % · 15:18 → 94 % · 6:19 | 84 % · 6:42 | 82 % · 11:38 |
| Verteidigung | 40 % · 18:23 | 32 % · 17:27 → 14 % · 23:35 | 38 % · 19:19 → 24 % · 20:13 | 32 % · 17:27 | 30 % · 6:03 |
| ohne Kategorie | 72 % · 11:34 | 60 % · 12:19 → 24 % · 17:18 | 74 % · 11:45 → 20 % · 8:15 | 58 % · 13:36 | 100 % · 7:50 |

Haupthaus, Kompanien, Geschütze: Rathaus fertig nach 4:00 bis 4:46 min, Residenz nach 7:51 bis 9:42 min. Söldnerkompanien kauft nur der Wirtschafts-Bot (im Mittel 1,0 je Partie). Geschütze je Partie im Mittel: Wirtschaft 21,0, ohne Kategorie 22,5, Verteidigung 9,2, Militär 0,4.

### Dauer und Patt (Normal, durchschnitt)
| Bot | Siege vorher → nachher | Patt | Dauer Median | Wahlen | Patt mit `?druck=hoch`, alle Felder | Feld Normal/durchschnitt mit Druck: Siege / Patt |
|---|---|---|---|---|---|---|
| Militär | 100 → 100 % | 0 → 0 % | 11:38 → 12:44 | 12 → 13 | 0 → 1,0 % | 100 / 0 % (vorher 100 / 0) |
| Wirtschaft | 100 → 90 % | 0 → 4 % | 17:11 → 16:28 | 21 → 20 | 1,3 → 2,7 % | 74 / 12 % (vorher 92 / 4) |
| Verteidigung | 98 → 94 % | 2 → 6 % | 20:57 → 20:39 | 21 → 22 | 2,7 → 7,7 % | 72 / 24 % (vorher 86 / 14) |
| ohne Kategorie | 100 → 96 % | 0 → 2 % | 15:01 → 15:34 | 15 → 15 | 1,7 → 4,0 % | 92 / 8 % (vorher 98 / 0) |

Schwer, durchschnitt: Militär 84 → 86 %, Wirtschaft 86 → 78 %, Verteidigung 90 → 88 %, ohne Kategorie 88 → 84 %. Spannweite: Normal 9:19 → 7:55, Schwer 7:23 → 6:29.

### Bot ohne Kategorie, alle Felder (ohne Druck)
| Grad | Profil | Siege vorher → nachher | Patt nachher | Dauer Median vorher → nachher | Wahlen |
|---|---|---|---|---|---|
| Leicht | aktiv | 100 → 100 % | 0 % | 12:46 → 13:36 | 11 → 11 |
| Leicht | durchschnitt | 100 → 94 % | 4 % | 15:00 → 18:42 | 12 → 15 |
| Leicht | gelegentlich | 96 → 68 % | 12 % | 19:43 → 20:44 | 15 → 17 |
| Normal | aktiv | 100 → 98 % | 0 % | 13:49 → 14:19 | 13 → 13 |
| Normal | durchschnitt | 100 → 96 % | 2 % | 15:01 → 15:34 | 15 → 15 |
| Normal | gelegentlich | 92 → 76 % | 2 % | 18:48 → 17:55 | 16 → 16 |
| Schwer | aktiv | 100 → 98 % | 0 % | 12:00 → 12:49 | 15 → 15 |
| Schwer | durchschnitt | 88 → 84 % | 2 % | 12:49 → 14:58 | 16 → 18 |
| Schwer | gelegentlich | 0 → 0 % | 0 % | – | – |

Patt über alle Felder: 0,7 → 2,4 % (ohne Schalter), 1,7 → 4,0 % (mit `?druck=hoch`). Normal wurde über `basisFaktor` nachkalibriert, Leicht und Schwer nicht (Auslegung 26).

### Doktrinen im Paarvergleich (Normal, durchschnitt, Kategorie-Bot der Doktrin, 50 Partien je Arm, ohne Druck)
| Doktrin | Siege mit / ohne | Differenz | Dauer Median mit / ohne | Mauerverlust mit / ohne | Teil 6 (Differenz, Dauer mit) |
|---|---|---|---|---|---|
| Zunftordnung (Grenze −1) | 100 / 100 % | 0 pp | 16:17 / 15:50 | 0 / 0 | 0 pp, 16:17 |
| Ausfall (Gegenstoß × 2 an der Basis) | 100 / 92 % | +8 pp | 20:16 / 23:07 | 258 / 388 | +4 pp, 20:19 (Teil 6 mit Druck) |
| Grenzfeste (Wellenabstand × 1,25) | 68 / 92 % | **−24 pp** | 26:15 / 23:07 | 669 / 388 | −5 pp, 23:20 |

Rohdaten `reports/kartenpfad7-doktrin-normal.*`.

## Ursache der Patts
Patt-Partien des Wirtschafts-Bots und des Bots ohne Kategorie kaufen im Median 117 bzw. 133 Geschütze, gewonnene 5 bzw. 11. Das ist Folge, nicht Ursache: Wer lange spielt, kauft viel. Die Patt-Partien des Verteidigungs-Bots haben keine Geschütze.
Zwei Gegenproben (vor der Bot-Korrektur gemessen, Normal, durchschnitt, 50 Partien je Arm, `reports/kartenpfad7-gegenproben/`) bestätigen das: Geschütze mit Tempo 34 statt 20 und eine Messung ganz ohne Geschütze ändern die Patt-Quote nur im Rauschen (Wirtschaft 6 → 2 % in beiden Armen, Verteidigung 8 → 6 %).
Als Ursache bleibt die Obergrenze: weniger Fabriken in den ersten fünf Minuten, kein Mittelfeld für Fabrikketten. Die Gegenprobe mit Grenze 4/5/6 (unten) zeigt, dass eine höhere Grenze die Patts senkt, aber nicht ohne Nebenwirkung.

### Gegenprobe: Obergrenze 4/5/6 statt 3/4/5 (korrigierter Bot, gleiche Seeds, `reports/kartenpfad7-gegenproben/g456-*`)
| Bot / Feld | Siege 3/4/5 → 4/5/6 | Patt | Dauer Median |
|---|---|---|---|
| Militär, Normal/durchschnitt | 100 → 100 % | 0 → 0 % | 12:44 → 13:34 |
| Wirtschaft, Normal/durchschnitt | 90 → 100 % | 4 → 0 % | 16:28 → 15:45 |
| Verteidigung, Normal/durchschnitt | 94 → 96 % | 6 → 4 % | 20:39 → 19:46 |
| ohne Kategorie, Leicht/durchschnitt | 94 → 100 % | 4 → 0 % | 18:42 → 17:20 |
| ohne Kategorie, Leicht/gelegentlich | 68 → 50 % | 12 → 8 % | 20:44 → 20:09 |
| ohne Kategorie, Normal/durchschnitt | 96 → 98 % | 2 → 2 % | 15:34 → **19:34** (18 Wahlen) |
| ohne Kategorie, Normal/gelegentlich | 76 → 74 % | 2 → 4 % | 17:55 → 20:12 |
| ohne Kategorie, Schwer/durchschnitt | 84 → 88 % | 2 → 0 % | 14:58 → 13:31 |

Patt über alle Felder (Bot ohne Kategorie, ohne Schalter): 2,4 → 1,6 %. Spannweite der Kategorie-Bots: 7:55 → 6:12.
Die höhere Grenze stabilisiert die Kategorie-Bots und Schwer, löst aber nicht alles: Der Bot ohne Kategorie wird auf Normal vier Minuten langsamer und fällt aus dem Korridor 13–17 min, Leicht/gelegentlich verliert weiter. Eine Fabrik mehr auf dem Gutshof verschiebt bei ihm Universität und Stadtrecht nach hinten. 4/5/6 bräuchte eine eigene Kalibrierung.

## Bot-Fehler während der Messung
Die Gegenprobe mit Grenze 4/5/6 deckte einen Fehler im Simulations-Bot auf: Fehlte ein Spezialgebäude, das er nicht bezahlen konnte, baute er eine zweite Kaserne; bei vollem Raster riss er dann eine Fabrik ab, um Platz zu schaffen, baute sie mangels Material wieder auf und so fort. Das Material reichte nie für das Haupthaus.
Korrektur (Commit „R.7: Bot-Korrektur“): Abriss zuerst des zweiten Exemplars, eine Fabrik nur, wenn das fehlende Gebäude bezahlbar ist; ein zweites Exemplar erst, wenn kein Spezialgebäude mehr fehlt. Alle Zahlen dieses Berichts stammen aus der Messung nach der Korrektur.
Bei Grenze 3/4/5 war der Fehler selten (die alte Abrissregel greift erst ab vier Fabriken); er verschob Militär 11:39 → 12:44 und ohne Kategorie 15:07 → 15:34 sowie die Patt-Quoten um höchstens einen Prozentpunkt.

## Namen (K7.09)
Nur Modus karten, über Schlüssel mit Suffix `.karten`; Modus standard unverändert.

| Bisher | Neu (de) | Neu (en) |
|---|---|---|
| Fabrik (Grundgebäude) | Manufaktur | Manufactory |
| Variante Manufaktur | Hofmanufaktur | Court Manufactory |
| Variante Werkstatt | Zeugmanufaktur | Arms Manufactory |
| – (nach Wasserrahmen) | Fabrik | Factory |
| Dampfmühle | Dampffabrik | Steam Factory |
| Universität nach Buchdruck | Akademie | Academy |
| Kontor | Kontor | Trading post |
| Kontor nach Fernhandel | Handelshaus | Trading House |
| Schmiede nach Geschützguss | Gießerei | Foundry |
| Haupthaus Stufe I / II / III | Gutshof / Rathaus / Residenz | Manor / Town Hall / Residence |
| Doktrin Fabrikmiliz | Bürgerwehr | Citizen Militia |

Stufennamen (nur Anzeige, `C.STUFENNAMEN`):

| Bauwerk | Ausbaustufe | Name (de / en) |
|---|---|---|
| Mauer (Ausbau „Verstärkung“) | 0–1 | Palisade / Palisade |
| | 2–3 | Ringmauer / Curtain Wall |
| | ab 4 | Bastionsmauer / Bastion Wall |
| Türme (Ausbau der Türme) | 1–2 | Wachturm / Watchtower |
| | 3–4 | Wehrturm / Defence Tower |
| | ab 5 | Geschützturm / Gun Tower |

Der Name steht in der Überschrift des Reiters „Mauer & Türme“ und im Tooltip des Ausbaus („Ringmauer → Bastionsmauer ab Stufe 4“).

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die Obergrenze kostet Stabilität.** Wirtschafts-Bot: 90 % Siege, 4 % Patt ohne Schalter (vorher 100 / 0), mit `?druck=hoch` 74 % und 12 %. Verteidigungs-Bot mit Druck: 24 % Patt (vorher 14 %). Er wird schneller, aber unzuverlässiger.
2. **Leicht und „gelegentlich“ verlieren deutlich.** Bot ohne Kategorie: Leicht/gelegentlich 96 → 68 % Siege (12 % Patt), Leicht/durchschnitt 100 → 94 %, Normal/gelegentlich 92 → 76 %. Nur Normal/durchschnitt wurde nachkalibriert.
3. **Grenzfeste ist mit der neuen Einschränkung zu teuer:** −24 Prozentpunkte, 26:15 min (Teil 6: −5 pp). Längere Abstände der eigenen Wellen treffen gerade den Verteidigungs-Bot, der ohnehin wenig angreift.
4. **Ausfall verkürzt die Partie um knapp drei Minuten (23:07 → 20:16), aber nicht unter 17 min.** Der doppelte Basisschaden wirkt nur bei Gegenstößen; der Verteidigungs-Bot erreicht die Basis selten.
5. **Das zweite Exemplar bleibt fast ungenutzt.** Auf dem Gutshof stehen bei Minute 2 fünf bis sechs von neun Plätzen; das Rathaus kommt nach rund vier Minuten, bevor Material für den neunten Platz da ist. Danach braucht jede Stufe den Platz für eine Fabrik.
6. **Wasserrahmen schließt beim Wirtschafts-Bot 9 s vor dem Korridor ab** (5:51). Der Bot spart gezielt auf geöffnete Weiterentwicklungen; ein Mensch wird später fertig.
7. **Buchdruck beim Bot ohne Kategorie nur in 20 % der Partien:** Er ersetzt die Universität durch Kanzlei und Bibliothek, Buchdruck braucht aber eine Universität (Auslegung 7).
8. **Bot ohne Kategorie bleibt nur dank der Kalibrierung im Korridor** (15 Wahlen, 15:34); ohne sie lag er bei 20:17 min.

## Auslegungen und Abweichungen (zur Bestätigung)
Nummern 1–24 stehen in `docs/STAND-kartenpfad.md` (Abschnitt „Auslegungen Teil 7“); die wichtigsten:
- 1: Zunftordnung auf dem Gutshof senkt die Grenze auf 2.
- 4: Stadtrecht liegt ab Wahl 2 fast immer im Angebot; die Garantie in Wahl 5 greift selten.
- 6: Der Ausbau des Haupthauses ist eine eigene, bezahlte Aktion im Reiter Haupthaus, nicht Teil der Kartenwahl.
- 11: Geschütze treffen keine gegnerischen Türme (eigene Einheiten greifen Türme nicht an); der dreifache Schaden wirkt nur an der Basis. Die Anforderung nennt „Basis und Türme“.
- 15: Volle Auslastung gestrichen (Pool 42).
- 18: „Manufaktur“ als Gattungsname in allgemeinen Texten, auch wenn der Platz nach dem Wasserrahmen „Fabrik“ heißt.
- 22: Die zweite Kaserne hebt die Versorgung nicht selbst; das zweite Exemplar kostet das 1,5-Fache.

Neu in R.7:
25. **Flügel des Bots ohne Kategorie: Kanzlei + Bibliothek.** Die Anforderung nennt nur die Kategorie-Bots. Mit Zeughaus riss der Bot die Schmiede ab und wurde langsamer (20:17 min).
26. **Kalibrierung nur auf Normal:** `basisFaktor` Normal 10,5 → 9,5 (einzige Stellschraube der Partiedauer). Leicht (8,0) und Schwer (7,5) unverändert; Schwer liegt mit 84 % im Korridor, Leicht ist gemessen, aber nicht nachkalibriert.
27. **Zunftordnung bei vollem Bestand:** Senkt die Doktrin die Grenze unter die Zahl stehender Fabriken, bleibt der Bestand; das Zunfthaus ist gesperrt, bis die Grenze erfüllt ist (Regel aus Teil 6).

## Offen für den PO
1. **Obergrenze 3/4/5 beibehalten oder auf 4/5/6 heben?** 3/4/5 erzwingt die Wahl zwischen Fabrik und Spezialgebäude früh (Ziel des Teils), kostet aber Siege und Stabilität. Zahlen der Gegenprobe oben: 4/5/6 senkt die Patts (2,4 → 1,6 %) und gibt dem Wirtschafts-Bot alle Siege zurück, schiebt aber den Bot ohne Kategorie auf Normal auf 19:34 min. Empfehlung: 3/4/5 für den Spieltest behalten (die Entscheidung beim Bauen ist das Ziel dieses Teils) und erst nach dem Spieltest entscheiden; wird es 4/5/6, folgt eine Kalibrierung von `basisFaktor` je Grad.
2. **Spannweite der Kategorie-Bots:** Weder Kompanien noch Geschütze noch Ausfall bringen den Verteidigungs-Bot unter 20 min. Der Engpass liegt im Bot (er kauft wenige Einheiten), nicht nur in den Regeln. Vorschlag: das Ziel auf „≤ 5 min ohne Verteidigung“ oder auf die Siegquote mit `?druck=hoch` umstellen, oder dem Verteidigungs-Bot eine Angriffsregel geben.
3. **Grenzfeste:** Einschränkung abschwächen (Wellenabstand × 1,1) oder ersetzen (z. B. Mauerreparatur kostet Material).
4. **Leicht neu kalibrieren** (`basisFaktor` Leicht), nachdem Frage 1 entschieden ist.
5. **Zweites Exemplar:** In der jetzigen Form fast ein toter Platz für Bots. Im Spieltest beobachten (Frage 7 im Testleitfaden); bei Bestätigung billiger machen oder streichen.
6. **Geschütze gegen Türme** (Auslegung 11): Soll der dreifache Schaden auch gegnerische Türme treffen? Dafür müssten eigene Einheiten Türme angreifen können, eine Regeländerung im Kampf.

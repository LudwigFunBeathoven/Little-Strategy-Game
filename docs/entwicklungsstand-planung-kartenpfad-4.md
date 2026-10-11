# Klammerfront – Entwicklungsstand und Entscheidungen für die Planung

Stand 11.10.2026, nach Kartenpfad Teil 4. Das Dokument ist in sich abgeschlossen: Es nennt Stand, Spielregeln des Modus `karten`, Messwerte, Befunde und die Entscheidungen, die vor dem nächsten Entwicklungsschritt fallen müssen.
Es ersetzt `docs/entwicklungsstand-planung-kartenpfad-3.md` als Einstieg. Dessen Befunde 4.1 bis 4.8 und Entscheidungen E1 bis E13 sind in Abschnitt 4 und 5 mit ihrem heutigen Stand nachgeführt; die Berichte von `main`, MVP und Teil 1 bis 3 bleiben gültig.

## 0. Auftrag an Cowork (zum Einfügen vor dem Dokument)
> Du planst den nächsten Entwicklungsschritt des Browser-Spiels „Klammerfront“ für den Product Owner Nick (kein Entwickler; Deutsch, knapp, Ergebnis zuerst, schwache Annahmen offen benennen).
> Lies das folgende Dokument. Entscheide nichts aus Abschnitt 5 selbst; stelle zu jeder Entscheidung, die den Zuschnitt berührt, eine Rückfrage mit Empfehlung. Erzeuge danach ein Anforderungsdokument im Stil der bisherigen (Abschnitt 7): Ziel, nummerierte Anforderungen REQ-<Kürzel>.<nn> mit Akzeptanzkriterien, Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, Abschnitt „Schwache Annahmen und offene Punkte“.
> Fehlt eine Zahl, sag es und schlage eine Messung vor. Unterscheide in jedem Akzeptanzkriterium, ob es mit Bots messbar ist oder erst im Spieltest mit Menschen.

## 1. Auf einen Blick
| Linie | Version | Stand | Inhalt |
|---|---|---|---|
| `main` | 0.9.2 | Commit `73e1590` | Basisspiel mit Tutorial, Startbildschirm, Kartenbühne und Entdecken (an). Unverändert seit Teil 3 |
| veröffentlichter MVP | 0.9.2 | identisch mit `main` | GitHub Pages `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/` |
| Kartenbranch `exp/kartenpfad` | 0.9.2-kartenpfad-4 | Commit `2f17604` (Bericht), danach nur Dokumente | Experiment: Karten steuern das Pacing, dazu Strategielinien, Gebäude-Aufwertung, Schlüsselkarten. Nicht auf `main`, nicht im MVP. Spielstand-Version 9 |
| privater Testbuild | wie Kartenbranch | `https://claude.ai/artifact/XkPEqoEHjZThGfXSKfGaAC` | spielbar, Sitzungsprotokoll immer an, nur für den Eigentümer sichtbar (Freigabe über „Teilen“ der Seite). Der Testbuild von Teil 3 (`KtUqgPYNPHyc29vDXvMbHb`) ist überholt |

Offen auf GitHub: Das Release-Tag `v0.9.2` auf `MVP` kann nur der PO anlegen (aus der Cloud-Umgebung nicht möglich).

## 2. Das Spiel und die Arbeitsweise
Browser-Spiel zwischen *Universal Paperclips* (Klicken, Idle-Ökonomie) und *Age of War* (Lane-Kampf). Der Spieler klickt Material, baut Fabriken und Gebäude im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Abschüsse bringen Erfahrung (EP).
Jeder Stufenaufstieg bietet Spezialkarten mit bis zu drei Stufen. Die Partie ist verloren, wenn das Tor fällt, gewonnen, wenn die gegnerische Basis fällt. Drei Schwierigkeitsgrade (Leicht, Normal, Schwer).

**Modus `karten` (nur im Kartenbranch):** Am Start gibt es Fabrik, Kaserne und Läufer. Karten schalten die übrigen Gebäude (Schmiede, Universität, Kontor), Einheiten, Ausbaustufen und Forschungen frei. Vier Kartenfamilien: Bau, Technologie (nur mit Universität), Bonus, Wagnis (Spielregel mit Nachteil).
Eine Kartenwahl ist fällig bei erreichter EP-Schwelle, spätestens zur Zielzeit (Fahrplan: zehn Wahlen in gut elf Minuten), frühestens 45 s und spätestens 100 s nach der letzten.
**Modus `standard`:** alles ab Start nutzbar, Verhalten von `main`. Im Branch per `?pacing=standard` erreichbar und durch einen Test an `main` gebunden. Alle Regeln aus Teil 4 gelten nur im Modus `karten`.

Arbeitsregeln, die Anforderungen beachten müssen:
- Alle Spielwerte stehen in `config.js`, alle sichtbaren Texte in `i18n/de.js` und `i18n/en.js` (Schlüssel identisch); Zufall nur über den seedbaren Generator im Spielstand.
- Features, die das Spiel im Kern ändern, entstehen zuerst im Kartenbranch (Grundsatz des PO). Ein Release entsteht nur, wenn der PO eine Iteration nach `main` freigibt; `MVP` folgt `main` per Fast-Forward.
- Fertig heißt: `npm test` (336 Tests) und `npm run test:browser` (vier Playwright-Skripte, 552 Prüfpunkte) grün, Kurzsimulation ohne offene Partie, neue Knöpfe mit Tooltip und Erklärzeile, Bericht mit Abnahmetabelle. Ändert sich die Spielstand-Version (jetzt 9), verlieren Spieler ihren Spielstand.
- Weicht eine Umsetzung von einer Anforderung ab, wird begründet und nachgefragt.

### Regeln des Modus `karten` nach Teil 4 (neu seit dem Stand von Teil 3)
**Zeichen und Linien.** Es gibt drei Strategielinien: Militär, Wirtschaft, Verteidigung. Der Spieler wählt keine; Karten und Gebäude-Varianten tragen null, ein oder zwei Zeichen einer Linie. Die Linie mit den meisten Zeichen prägt die Partie.
Stufe 1 ab 2, Stufe 2 ab 4, Stufe 3 ab 6 Zeichen; die Boni der Stufen wirken zusammen. Die Oberfläche zeigt eine Linie erst mit ihrer Stufe 1 (Leiste „Linien“, ein Hinweis); davor sind weder Linien noch Zeichen sichtbar. Zeichenquellen ohne Schlüsselkarten: Militär 15, Wirtschaft 14, Verteidigung 13.

| Linie | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|
| Militär | Einheiten +10 % Schaden | Kaserne schickt je Welle einen Läufer mehr; Einheiten +10 % Leben | Einheiten +10 % Schaden und Leben |
| Wirtschaft | Materialertrag +10 % | Zinsen des Kontors +50 %; Ausbauten und Aufwertungen −20 % Kosten | Materialertrag +10 %; Zinsen +25 %; Versorgung +2 |
| Verteidigung | Türme +20 % Schaden, Mauer +15 % Leben | Turm-Abschüsse bringen Material; nach jeder abgewehrten Gegnerwelle rückt sofort eine eigene Welle aus | Gegenstoß-Wellen +30 % stärker; Türme +20 % Schaden |

**Gebäude-Aufwertung.** Ab Minute 3 lässt sich ein stehendes Gebäude einmal und endgültig zu einer Variante aufwerten (Abriss und Neubau möglich). Kosten: das Zweifache der Baukosten, Dauer 10 s, in der das Gebäude ruht. Jede Variante trägt ein Zeichen ihrer Linie.

| Grundgebäude | Militär | Wirtschaft | Verteidigung |
|---|---|---|---|
| Fabrik | Werkstatt: Einheitenkosten −10 % | Manufaktur: Ertrag +40 % je Gebäude | Wachstube: Türme +15 % Schaden, Turm-Abschüsse bringen Material |
| Kaserne | Exerzierplatz: Einheiten +10 % Schaden und Leben | – | Garnison: Mauer heilt 2 LP/s, Einheiten der Mitte +20 % Leben |
| Schmiede | Waffenschmiede: Schmiede-Ausbauten ×1,5 | – | Rüstkammer: Mauer +15 % Leben |

**Schlüsselkarten.** Sechs Karten, zwei je Linie, je zwei Zeichen, ab Wahl 3, nur wenn ihre Wirkung im Spielstand etwas bewirkt: Drillmeister und Vorhut (Militär), Handelsnetz und Rücklage (Wirtschaft), Bollwerk und Gegenstoß (Verteidigung). Angebotsausgleich: spätestens jede dritte Wahl ab Wahl 3 eine Schlüsselkarte; wer eine Linie führt, bekommt deren Schlüsselkarte mit dreifachem Gewicht.
**Gestrichen:** Kriegserfahrung, Serienbau, Bauleitung, Forschung Ingenieurskunst. Glücksritter verlängert den Wellenabstand (+25 %); Söldnerheer vermindert die Produktion nur noch auf × 0,8.
**Testschalter** `?druck=hoch`: reguläre Gegnerwellen sind ab Minute 4 um ein Drittel größer. Standard aus; die Druckkurve selbst ist unverändert.

## 3. Was Teil 4 geliefert hat
Anforderung: `docs/anforderungen-kartenpfad-4.md`, Bericht: `docs/bericht-kartenpfad-4.md` (alle Tabellen, 13 Auslegungen, Bilder), Testleitfaden: `docs/testleitfaden-kartenpfad-4.md`. Inkremente L.0 bis L.6, alle fertig, nichts gestrichen.

| REQ | Inhalt | Ergebnis |
|---|---|---|
| S.01 | Fehler „undefined“ in der Warteschlange | Ursache: In der Symboltabelle fehlten Armbrustschütze und Katapult. Behoben, Symbol je Einheit in `config.js`, Test für alle Einheiten in beiden Sprachen. `main` nicht betroffen |
| S.02 | Pacing und Start (C1–C4) | Fahrplan bleibt; Kriegserfahrung gestrichen; Glücksritter verlängert den Wellenabstand; eigene Schwellen für Schwer; Kaserne ab Start; Gelehrte und Metallverarbeitung ab Wahl 1. Schwer: Wahlen im Median höchstens 41 s vor der Zielzeit (vorher 84 s). **Befund 4.2 entfällt nicht** (Befund A unten) |
| S.03 | Kartenpool bereinigen | Serienbau, Bauleitung, Ingenieurskunst gestrichen; Inventar der seltenen Karten umgesetzt (Handelskontor erst mit erreichtem Zinsdeckel, Söldnerheer abgeschwächt). Standard unverändert |
| S.04 | Strategielinien | Zeichen, Stufen 1 bis 3, Boni, Sichtbarkeit erst ab Stufe 1. Stufe 3 ist ein Soll unter Bedingung und umgesetzt (Entscheidung D2) |
| S.05 | Gebäude-Aufwertung | Fabrik, Kaserne und Schmiede, sieben Varianten. Fabrik-Dominanz bleibt (Befund B) |
| S.06 / S.07 | Schlüsselkarten, Angebotsausgleich | Sechs Karten; im Median drei Angebote je Partie; größter Zuwachs der Siegquote +8 pp (Grenze: 25 pp) |
| S.08 | Testschalter `?druck=hoch` | Test: Wellen ab Minute 4 um den Faktor stärker, ohne Schalter identisch |
| S.09 | Messung, Bots, Bericht, Testbuild | Linien-Bots (Militär, Wirtschaft, Verteidigung), Paarvergleich der Schlüsselkarten, Bildzeit, Testleitfaden mit fünf Zusatzfragen, Testbuild |

Nicht angefasst (laut Anforderung): Druckkurve und Belagerung, Raster (bleibt 3×3), Leistungsoptimierung (nur gemessen), Grafik, `main`.

## 4. Befunde
**A. Schwer hängt weiter an der ersten Karte (Fortschreibung von Befund 4.2).** Die Kaserne ab Start und „Gelehrte“ in Wahl 1 haben das Problem verschoben, nicht beseitigt. Schwer, „durchschnitt“, 50 Partien: Siegquote 96 → 74 %; „gelegentlich“ 66 → 40 %; „aktiv“ 96 → 100 %.
Mit Echtes Militär in Wahl 1 gewinnen 29 von 29 Partien, mit Gelehrte 5 von 15, mit Metallverarbeitung 3 von 6; die Niederlagen fallen zwischen 1:38 und 2:25. Ohne Echtes Militär fehlen der Werfer und zwei Punkte Versorgung (die Karte gibt jetzt +2 statt +3). Folge zweier Entscheidungen des PO: Wissen zuerst soll ein eigener Weg sein, die Druckkurve bleibt.

**B. Varianten brechen die Fabrik-Dominanz nicht.** Bei Minute 10 stehen im Mittel 5,4 bis 5,6 reine Fabriken im Raster (vorher 5,5; 60 % der Gebäude). Die Varianten wandeln ein bis zwei Fabriken um (Werkstatt, Wachstube je eine, Manufaktur alle). Die Bots füllen das Raster mit Fabriken, solange Schmiede, Universität und Kontor auf eine Karte warten (Fortschreibung von Befund 4.5; die Kaserne blockiert nicht mehr).

**C. Die Linie Verteidigung ist langsam.** Sie gewinnt 91 bis 96 %, braucht aber 22 bis 24 Minuten (Militär 12:14, Wirtschaft 15:47) und bleibt in 2 bis 7 % der Partien offen (Patt). Bei Bots, die früh angreifen (ohne Linie, Militär), verliert die Mauer 54 bis 96 Lebenspunkte je Partie, bei Wirtschaft rund 570, bei Verteidigung 1.000 bis 1.640. Das ist die Wirkung der Belagerung (Befund 4.1): Eigene Einheiten am gegnerischen Tor halten die regulären Wellen auf, Mauer und Türme bekommen kaum Arbeit. `?druck=hoch` (× 1,3 Wellengröße) ändert daran wenig.

**D. Schlüsselkarten bewirken in der Simulation wenig.** Differenz der Siegquote mit/ohne Karte (50 Partien je Arm, `druck=hoch`): Drillmeister 0, Vorhut 0, Bollwerk 0, Gegenstoß +8, Rücklage −4, Handelsnetz −4 pp. Der Standardfehler einer solchen Differenz liegt bei 50 Partien um 7 pp; die −4 pp sind kein Beleg für Schaden. Militär gewinnt ohnehin 100 %, die beiden Wirtschaftskarten laufen in das Versorgungslimit.

**E. Die Wirtschaftslinie kann ihr Material nicht umsetzen.** Der Wirtschaft-Bot erzeugt das Zwei- bis Dreifache an Material (Minute 10: 45/s gegen 16/s), das Versorgungslimit begrenzt die Welle auf 7 statt 12 Einheiten. Ohne Stufe-3-Versorgung: 83 % Siege (77 % mit `druck=hoch`), Spannweite der drei Linien 23 pp; mit Versorgung +2: 83 % und 85 %, Spannweite 17 und 15 pp. Dies ist die einzige Wirkung, die ich der Anforderung hinzugefügt habe (Entscheidung D2).

**F. Ohne Absicht läuft ein Bot in die Linie Militär.** Der Bot ohne Linienwahl erreicht Militär Stufe 1 in allen Partien nach 4:50, Wirtschaft und Verteidigung in 52 bis 62 % nach 9 bis 10 Minuten. Ursache ist sein Pfad (Echtes Militär, Taktik, Ballistik, Eiserne Klingen tragen Zeichen); die Quellen sind ausgeglichen verteilt (15/14/13). Ob Menschen ebenso in eine Linie laufen, zeigt nur der Spieltest.

**G. Wahlzeiten, Dauer und Leistung halten.** Normal, „durchschnitt“: Dauer 11:49 (vorher 11:56), 10 Wahlen; Patt 0 % auf allen neun Feldern. Bildzeit 0,6 ms je Bild und 0,18 ms je Logik-Takt bei 84 Einheiten (headless, ohne Grafikkarte); Teil 4 verändert sie nicht.

**H. Schwer, „gelegentlich“, verliert in 60 % der Partien** (vorher 34 %). Das entspricht dem Zielkorridor („verliert“) und folgt aus Befund A.

**I. Alle Messwerte stammen von Bots** (unverändert Befund 4.8). Die Linien-Bots folgen ihrer Linie stur und zeigen Stärke und Engpässe; sie zeigen nicht, ob Menschen eine Linie wählen, ob sie die Aufwertung finden oder ob sie die Zeichen bemerken.

### Stand der Befunde aus Teil 3
| Befund (Teil 3) | Stand |
|---|---|
| 4.1 Die Mitte der Partie bringt kaum EP | besteht; Fahrplan sichert den Takt über die Zeit (C1 bestätigt). Berührt Befund C |
| 4.2 Schwer hängt an der ersten Karte | besteht in anderer Form (Befund A) |
| 4.3 Schwer läuft im Fahrplan voraus | behoben: Abweichung höchstens 41 s (eigene Schwellen ab Wahl 2, × 2) |
| 4.4 „Wissen zuerst“ ist kein eigener Weg | formal behoben (Gelehrte ab Wahl 1); der Weg verliert auf Schwer (Befund A) |
| 4.5 Das volle Raster blockiert die Kaserne | Kaserne ab Start; Schmiede, Universität und Kontor sind weiter betroffen, kein Hinweis im Spiel (E7 offen) |
| 4.6 EP-Karten verlieren im Modus `karten` ihre Wirkung | Kriegserfahrung gestrichen, Glücksritter umgebaut; die passive EP der Forschung Hörsaal bleibt |
| 4.7 Die Zeit trägt die Anzeige | unverändert |
| 4.8 Messwerte von Bots | besteht (Befund I) |

## 5. Entscheidungen
Reihenfolge nach Dringlichkeit. „Blockiert“ heißt: Der nächste Schritt lässt sich ohne Antwort nicht sauber zuschneiden. Die Nummern D1 bis D9 sind neu; der Stand der Entscheidungen E1 bis E13 aus Teil 3 steht in der Tabelle am Ende des Abschnitts.

### D1 Schwer: erste Karte absichern? (blockiert für Schwer)
- **Stand:** Befund A. Auf Schwer entscheidet Wahl 1 die Partie, sofern Echtes Militär nicht gewählt wird.
- **Optionen:** (a) so lassen; Schwer ist für Geübte, „Wissen zuerst“ ein Wagnis; (b) auf Schwer in Wahl 1 immer Echtes Militär anbieten (Pfadplatz fest); (c) die erste Gegnerwelle auf Schwer erst nach der ersten Wahl ausrücken lassen (berührt die Gegnerstärke und den Tutorialablauf nicht, aber die Druckkurve).
- **Empfehlung:** (b). Klein, in `config.js` schaltbar, nimmt nur auf Schwer einen von mehreren Wegen. (a) ist vertretbar, wenn der Spieltest zeigt, dass Menschen auf Schwer die Kaserne rechtzeitig bekommen; die Bots tun es bei „Wissen zuerst“ nicht.

### D2 Dritte Linienstufe und Versorgung +2 bestätigen (blockiert)
- **Stand:** Die Anforderung nennt Stufe 3 als Soll, falls Stufe 2 in der Mehrzahl der Partien vor Minute 8 erreicht wird. Gemessen: Linien-Bots erreichen Stufe 2 nach 3:45 bis 5:55; der Bot ohne Linie Militär Stufe 2 im Median nach 8:05 (87 % der Partien). Werte der Stufe 3 sind mein Vorschlag. Die Versorgung +2 in der Wirtschaftsstufe 3 ist meine Ergänzung (Befund E).
- **Optionen:** (a) bestätigen; (b) Stufe 3 streichen (`maxStufe: 2`, ein Wert in `config.js`); (c) Stufe 3 behalten, Versorgung durch anderen Bonus ersetzen.
- **Empfehlung:** (a). Ohne die Versorgung liegt die Spannweite der drei Linien mit `druck=hoch` bei 23 pp; die Hypothese der Anforderung war höchstens 20.

### D3 Fabrik-Dominanz und Bauraster
- **Stand:** Befund B. Die Anforderung schließt ein wachsendes Raster aus (Entscheidung B2) und verlangt, Manufaktur-Werte zuerst anzupassen.
- **Optionen:** (a) Spieltest abwarten, dort Anteil der Fabriken und Verteilung der Varianten messen; (b) Aufwertung billiger oder stärker machen; (c) abnehmender Ertrag je zusätzlicher Fabrik; (d) Raster wachsen lassen (Ausschluss aufheben).
- **Empfehlung:** (a). Die Bots füllen das Raster mechanisch; das Verhalten von Menschen ist unbekannt. (c) und (d) ändern die Wirtschaft und alle Zielkorridore und gehören in einen eigenen Teil.

### D4 Verteidigung, Belagerung und Druckkurve (Fortschreibung von E11 und B4)
- **Stand:** Befund C. Verteidigung gewinnt, aber langsam und ohne Fortschrittsgefühl; der Testschalter erzeugt nur beim Verteidigungs-Bot spürbaren Druck. Die Ursache liegt in der Belagerung (Befund 4.1), die in Teil 4 ausdrücklich nicht angefasst wurde.
- **Optionen:** (a) Spieltest zuerst (Frage 5 im Leitfaden); (b) Druckkurve als nächster Teil: Belagerung blockiert nur einen Teil der Wellen oder Wellen wachsen schneller, wenn die Armee am Tor steht; (c) die Verteidigung stärker in Angriff umwandeln, etwa den Bonus „Gegenstoß-Wellen +30 %“ von Stufe 3 in Stufe 2 ziehen (Versuch mit 24 Partien: 100 % Siege, Dauer 22:22, mit `druck=hoch` weiter 21 % offen; kein Gewinn an Tempo).
- **Empfehlung:** (a), danach (b), wenn Menschen die Verteidigung als wirkungslos erleben. (c) verschiebt das Problem.

### D5 Schlüsselkarten stärker machen?
- **Stand:** Befund D. Alle Werte liegen weit unter der Grenze von 25 pp je Karte. Die Wirtschaftskarten laufen in das Versorgungslimit.
- **Optionen:** (a) Spieltest entscheidet, ob Menschen die Karten als „besonders stark“ erleben; (b) Werte anheben; (c) Rücklage und Handelsnetz umbauen, so dass sie nicht von der Versorgung abhängen.
- **Empfehlung:** (a). Messung mit 50 Partien trennt Differenzen unter etwa 10 pp nicht von Zufall.

### D6 Auslegungen aus dem Bericht bestätigen (blockiert für Teil 5, nicht für den Spieltest)
Die 13 Auslegungen stehen im Bericht. Diese ändern das Spiel am meisten:

| Nr. | Auslegung | Empfehlung |
|---|---|---|
| 1 | Variante ist ein Merkmal des Platzes (`slot.variant`), kein neuer Gebäudetyp | bestätigen; Regeln und Ausbaustufen laufen unverändert |
| 2 | Zeichen von Varianten zählen je Variantentyp einmal (zwei Manufakturen = ein Zeichen) | bestätigen; sonst entscheidet eine Fabrikreihe jede Linie |
| 3 | Wirkung einer Variante einmal je Typ, außer dem Ertrag der Manufaktur (je Gebäude) | bestätigen |
| 4 | „Aufwertungen −20 %“ gilt für Ausbauten und für die Gebäude-Aufwertung | bestätigen; beide Werte getrennt einstellbar |
| 8 | Schlüsselkarten „Drillmeister“ und „Bollwerk“ statt „Drill“ und „Bastion“ (Namen sind schon vergeben) | bestätigen; Namen sind Platzhalter |
| 10 | Schwer: Schwellen ab Wahl 2 = Fahrplan × 2 (Faktor 1,6 und 1,8 ließen Wahl 3 bei −62 und −50 s) | bestätigen; Wahl 1 bleibt bei 43 EP |
| 11–13 | Kurzname der Einheiten, Nachbarschafts-Vorschau ohne gesperrten Partner, Zusatzfunktionen (Aktion „Aufwerten“, Leiste „Linien“, Hinweise, Protokollfelder) | bestätigen |

### D7 Spieltest: Rahmen und Abnahmekriterien (blockiert; Fortschreibung von E9)
- **Stand:** Testleitfaden `docs/testleitfaden-kartenpfad-4.md` liegt vor: eine Partie je Person, etwa 35 Minuten, sechs Fragen aus Teil 3 plus fünf neue (Linie bemerkt, bewusst gespielt, Aufwertung, starke Karte, Verteidigung mit `?druck=hoch`). Das Protokoll enthält zusätzlich `druck`, `lines` (Stufen mit Zeitpunkt), `variants[]` und `wallHpLost`.
- **Zu entscheiden:** Teilnehmerzahl und Profile (Vorschlag aus Teil 3: sechs bis acht Personen, zwei erfahren, zwei auf Leicht mit Tutorial, zwei auf Schwer; Hälfte mit `?druck=hoch`); Abnahme. Vorschlag für die Zusatzkriterien: mindestens die Hälfte der Personen erreicht Stufe 1 einer Linie bis Minute 10; mindestens die Hälfte wertet bis Minute 5 ein Gebäude auf; keine Variante macht über 70 % aller Aufwertungen aus; höchstens eine Person findet die Aufwertung nicht ohne Hilfe. Die Kriterien aus Teil 3 (Median der Wahlabweichung ±30 s, Dauer 10–14 min im Median, kein Abbruch in den ersten fünf Minuten) bleiben.
- **Empfehlung:** Spieltest vor Änderungen an D1, D3, D4 und D5. Er entscheidet zwischen den Optionen. D1 und D2 sind klein und können vorher fallen.

### D8 Weg des Kartenpfads nach `main` (Gate; Fortschreibung von E10)
- **Stand:** Der Modus `karten` ist jetzt Pacing, Strategielinien, Aufwertung und Schlüsselkarten in einem. Er ist mit Bots getestet, mit Menschen nicht. Spielstand-Version 9 (ältere werden verworfen).
- **Zu entscheiden:** Kriterien für einen Release 0.10 (Vorschlag: Spieltest-Abnahme aus D7 erfüllt, D1 bis D2 entschieden, Browser- und Unit-Tests grün, Modus `standard` weiter durch den Golden-Test an `main` gebunden) und ob `karten` Standardmodus wird oder ein wählbarer Modus im Startbildschirm.
- **Empfehlung:** Erst nach dem Spieltest. Ein wählbarer Modus im Startbildschirm hält `main` stabil.

### D9 Kalibrierung gegen Bots oder Menschen (Fortschreibung von E12)
- **Stand:** Alle Zielkorridore stammen aus Bot-Läufen. Die Linien-Bots sind absichtlich extrem.
- **Empfehlung:** Nach dem Spieltest die Profile an echten Sitzungen anpassen (`tools/compare-human.mjs`), dann kalibrieren; Linienwerte erst danach anfassen.

### Stand der Entscheidungen aus Teil 3
| Nr. (Teil 3) | Thema | Stand |
|---|---|---|
| E1 | Fälligkeit nach Fahrplan | bestätigt (C1), umgesetzt |
| E2 | Rolle der EP | Kriegserfahrung gestrichen, Glücksritter umgebaut (C2); EP bleiben Taktgeber für aktive Spieler; Hörsaal unverändert |
| E3 | Schwellen je Grad | umgesetzt (C3), Schwer × 2 ab Wahl 2 (D6, Nr. 10) |
| E4 | Start auf Schwer | Kaserne ab Start (C4) umgesetzt; Wirkung: Schwer schwerer; offen als D1 |
| E5 | „Wissen zuerst“ | umgesetzt (Gelehrte, Metallverarbeitung ab Wahl 1); Folge in D1 |
| E6 | Inventar seltener Karten | umgesetzt (C5) |
| E7 | Hinweis bei vollem Raster | **offen**, nicht in Teil 4 enthalten; Aufwertung bietet Fabriken eine zweite Verwendung, ersetzt den Hinweis nicht |
| E8 | Ermüdung der Bühne | **offen**, Spieltest (Bühnen enthalten jetzt zusätzlich Zeichen und Schlüsselkarten) |
| E9 | Spieltest | offen, als D7 |
| E10 | Gate nach `main` | offen, als D8 |
| E11 | Druckkurve | zurückgestellt (B4), nur Testschalter; als D4 |
| E12 | Kalibrierung | offen, als D9 |
| E13 | Tag `v0.9.2`, Testbuild | **offen**, nur der PO kann das Tag anlegen; Testbuild privat |

## 6. Empfohlener nächster Schritt
1. **D1 und D2 entscheiden** (je ein Wert in `config.js`, Umsetzung unter einer Stunde).
2. **Spieltest** (D7) mit dem Testbuild von Teil 4: Linie bemerkt, Aufwertung gefunden, Schlüsselkarten, Schwer-Start, Takt, Ermüdung.
3. **Kleine Korrekturen vorab**, unabhängig vom Spieltest: Hinweis bei vollem Raster (E7).
4. **Anforderung Teil 5** nach dem Spieltest, Inhalt abhängig von den Ergebnissen: D3 (Fabrik-Dominanz), D4 (Druckkurve und Belagerung), D5 (Schlüsselkarten), danach D8 (Gate) und D9 (Kalibrierung).

Zu klären, bevor Cowork die Anforderungen zuschneidet: D1, D2 und D7.

## 7. Form der Anforderungsdokumente und Randbedingungen für Cowork
- **Stil:** Titel „Anforderungen Branch Kartenpfad, Teil N: …“. Aufbau: 1. Ziel und Umfang (mit „Nicht im Umfang“), 2. Anforderungen REQ-<Kürzel>.nn (Teil 3: P, Teil 4: S; für Teil 5 ein neues Kürzel), je mit Ziel, Anforderungen und Akzeptanzkriterien (messbar: Zahl, Test, Bericht), 3. Entscheidungen des PO, 4. Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, 5. „Schwache Annahmen und offene Punkte“ (Annahme, Risiko, Standard).
- **Umsetzung durch Claude Code:** je Inkrement ein Commit `L.<n>: <Inhalt>` (Teil 4; Teil 3: `P.<n>`), Bericht mit Ergebnis in drei Sätzen, Entscheidungen des PO, Auslegungen zur Bestätigung, Abnahmetabelle, Kennzahlen vorher und nachher, Auffälligkeiten (berichtet, nicht wegbalanciert). Messung: 50 Partien je Feld, gleiche Seeds in allen Feldern.
- **Messwerkzeuge im Repository:** `tools/sim-p4.mjs` (Basis, Linien-Bots mit und ohne `druck=hoch`, Paarvergleich der Schlüsselkarten), `tools/bericht-p4.mjs` (Tabellen), `tools/bildzeit.mjs` (Bildzeit im Browser), dazu aus Teil 3 `tools/sim-p3.mjs`, `tools/fahrplan-kalibrieren.mjs`, `tools/referenzlauf.mjs`. Versuche ohne Dateiänderung: `KF_OVERRIDE='{"LINIEN":{…}}' node tools/sim-p4.mjs …`.
- **Grenzen der Messung:** Zwei Bots („einheiten-zuerst“ schnell, „gierig“ mit Vorausschau; „aktiv“ ist mit dem Vorausschau-Bot nicht messbar) plus drei Linien-Bots. Differenzen unter etwa 10 pp sind bei 50 Partien nicht von Zufall zu trennen. Bei Anforderungen an Menschen gehören Spieltest-Kriterien ins Akzeptanzkriterium.
- **Feste Zusagen im Code:** Modus `standard` identisch zu `main` (Golden-Test `tests/unveraendert.test.mjs`, nicht ohne Grund neu erzeugen); alle Regeln aus Teil 4 gelten nur bei `S.pacing === 'karten'`; nach Änderungen an `S.slots` von außen `S.slotVer++`, sonst veraltet der Cache der Modifikatoren.
- **Wichtige Stellschrauben (alle in `config.js`):** `LINIEN` (`zeichenStufen`, `maxStufe`, `stufen`, `aufwertung`, `schluessel`), `DRUCK`, `KARTEN` (`fahrplan`, `schwellenGrad`, `kartenTiers`, `maxAbstand`, `basisFaktor`, `angebot`, `pfadPlaetze`, `maxWarten`, `wellenFaktor`, `wellenAnstiegMin`). Zeichen und Werte der Varianten stehen in `data/linien.js`, Schlüsselkarten in `data/draft-options.js`.

## 8. Kennzahlen (schneller Bot, 50 Partien je Feld; vorher → nachher)
„Vorher“ ist der Stand vor Teil 4 (Commit `60f5868`), gleiche Seeds.

| Feld | Siege | Dauer Median | Wahlen (Median) |
|---|---|---|---|
| Leicht · aktiv | 100 → 100 % | 10:14 → 11:02 | 8 → 9 |
| Leicht · durchschnitt | 100 → 100 % | 11:37 → 11:30 | 10 → 10 |
| Leicht · gelegentlich | 100 → 100 % | 14:26 → 13:34 | 12 → 12 |
| Normal · aktiv | 100 → 100 % | 10:24 → 10:44 | 9 → 9 |
| Normal · durchschnitt | 100 → 100 % | 11:56 → 11:49 | 10 → 10 |
| Normal · gelegentlich | 98 → 100 % | 14:56 → 14:00 | 13 → 12 |
| Schwer · aktiv | 96 → 100 % | 9:33 → 9:53 | 8 → 8 |
| Schwer · durchschnitt | 96 → 74 % | 11:23 → 11:06 | 10 → 9 |
| Schwer · gelegentlich | 66 → 40 % | 14:07 → 1:52 | 12 → 1 |

Die letzte Zeile enthält überwiegend Niederlagen nach rund zwei Minuten; der Median beschreibt dort die Niederlagen, nicht die Siege.

Linien-Bots (Normal, „durchschnitt“, 100 Partien je Zeile; ohne / mit `druck=hoch`):

| Bot | Siege | Dauer Median | Patt | Stufe 1 / 2 / 3 (Median) |
|---|---|---|---|---|
| ohne Linie | 100 / 100 % | 11:43 / 11:49 | 0 / 0 % | – |
| Militär | 100 / 100 % | 12:29 / 12:14 | 0 / 0 % | 3:10 / 3:45 / 5:55 |
| Wirtschaft | 83 / 85 % | 15:44 / 15:47 | 0 / 0 % | 3:11 / 5:55 / 8:05 |
| Verteidigung | 96 / 91 % | 21:52 / 24:06 | 2 / 7 % | 3:10 / 3:45 / 5:55 |

Spannweite der Siegquoten der drei Linien-Bots: 17 pp ohne Schalter, 15 pp mit `druck=hoch` (Hypothese: höchstens 20 pp).

## 9. Schwache Annahmen in diesem Stand
- **Menschen bemerken die implizite Linie.** Unbelegt. Die Linien-Bots erreichen Stufe 1 nach 3:10, ein Spieler ohne Absicht nach etwa 5 bis 10 Minuten. Erst Frage 1 und 2 des Leitfadens zeigen, ob die Anzeige überrascht, bestätigt oder stört.
- **Die Aufwertung wird gefunden und genutzt.** Sie ist eine Aktion am angeklickten Gebäude ab Minute 3; Bots nutzen sie nach Programm. Ob Menschen sie suchen müssen, ist unbekannt.
- **Der Testschalter `?druck=hoch` macht Verteidigung beurteilbar.** Nach Befund C nur eingeschränkt: Bei Spielern, die angreifen, bleibt die Mauer fast unberührt.
- **Bots als Maß für Stärke und Wahlqualität.** Die Linien-Bots wählen extrem. Die Schlüsselkarten messen sie als Differenz zweier Arme; ihr Urteil über „besonders stark“ ersetzt den Spieltest nicht.
- **Der Fahrplan trifft Menschen** (unverändert aus Teil 3). Die Schwellen sind an Bots kalibriert; auf Schwer wurden sie in Teil 4 verdoppelt, um 41 s Abweichung zu erreichen, ebenfalls an Bots.
- **Zehn Bühnen in elf Minuten sind ein gutes Tempo** (unverändert), und jede Bühne zeigt jetzt mehr (Zeichen, Schlüsselkarten, Wirkungszeile). Ermüdung ist nur im Spieltest beurteilbar.
- **Die Kaserne ab Start macht Schwer leichter** (Annahme der Anforderung). Widerlegt: Schwer, „durchschnitt“, gewinnt 74 % statt 96 %.

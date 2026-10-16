# Bericht Kartenpfad Teil 6: Synergien, Doktrinen und Weiterentwicklungen (v0.9.2-kartenpfad-6)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-6.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-6.md`. Stand je Inkrement: `docs/STAND-kartenpfad.md`. Rohdaten: `reports/kartenpfad6-*`.
Messung: schneller Bot („einheiten-zuerst“), je Feld 50 Partien, gleiche Seeds in allen Feldern (Grad × Profil, 450 Partien); Kategorie-Bots 50 Partien je Zeile und Profil, Normal und Schwer, ohne und mit `?druck=hoch` (1 800 Partien);
Doktrinen im Paarvergleich 100 Partien je Arm (Normal) und 50 je Arm (Schwer, siehe Abweichung 1). Werkzeuge: `tools/messung-p6.mjs`, `tools/sim-p5.mjs`, `tools/kategorien-p6.mjs`, `tools/bedienelemente.mjs`; die Tabellen unten erzeugt `node tools/bericht-p6.mjs`.
„Vorher“ ist der Stand von `exp/kartenpfad` nach Teil 5 (Commit `40de382`), gemessen in Q.0 mit denselben Seeds.

## Ergebnis
Alle acht Anforderungen sind umgesetzt, K6.07 (Soll) mit vier von vier bis sechs Ausbauten: @@TESTS@@ Der Modus `standard` ist unverändert (Golden-Test), die Spielstand-Version steht auf 11.
Der Bot ohne Kategorie erreicht die Zielwerte aus Teil 5 weiter: Normal, „durchschnitt“ braucht 15 Wahlen und 15:01 min (vorher 14 und 13:35), Schwer, „durchschnitt“ gewinnt 88 % (vorher 86 %), die Doktrin erscheint im Median in 5 Angeboten und zuerst in Wahl 4 (vorher 4 und 5);
die sichtbaren Bedienelemente bei Minute 10 sinken von 62 / 59 auf 54 / 53.
Zwei Zielwerte verfehle ich: Die Mediane der Partiedauer der drei Kategorie-Bots liegen auf Normal 9:11 min auseinander (Ziel 3 min, nach Teil 5 waren es 3:28), und die Patt-Quote liegt mit `?druck=hoch` bei 2,3 % (Bot ohne Kategorie und Verteidigungs-Bot; Ziel höchstens 2 %).
Beides hat dieselbe Ursache: Nur Militär-Karten beschleunigen die Zerstörung der gegnerischen Basis. Gibt man dem Verteidigungs- oder Wirtschafts-Bot Durchbruch (doppelter Schaden an der Basis) von Beginn an, sinkt seine Dauer von 20:35 auf 12:17 bzw. von 17:11 auf 11:57 min.
Ob und wie die beiden anderen Kategorien einen Abschluss bekommen, ist eine Entscheidung des PO (Abschnitt „Offen für den PO“); ich habe nichts nachgestellt.

## Zielwerte im Überblick (REQ-K6.08)
| Kennzahl | Zielwert | Ergebnis |
|---|---|---|
| Angebote mit Doktrin je Partie (Normal, durchschnitt) | Median 3–5 | **erfüllt**: 5 (Bot ohne Kategorie; Kategorie-Bots 3, 3, 4); vorher 4 |
| Erstes Angebot mit Doktrin | Median ≤ Wahl 5 | **erfüllt**: Wahl 4 (alle Bots); vorher 5 |
| Partiedauer der Kategorie-Bots (Normal) | Mediane innerhalb 3 min | **verfehlt**: 9:11 (Militär 11:38, Wirtschaft 17:11, Verteidigung 20:49); mit `?druck=hoch` 10:56; Schwer 7:23; nach Teil 5 3:28 (Auffälligkeit 1) |
| Wahlen je Partie, Partiedauer (Normal, durchschnitt) | 12–16 Wahlen, 13–17 min | **erfüllt**: 15 Wahlen, 15:01 (Bot ohne Kategorie); die EP-Schwellen blieben unverändert |
| Siegquote Schwer, durchschnitt | 70–90 % | **erfüllt**: 88 % (Bot ohne Kategorie), Kategorie-Bots 84–90 % |
| Sichtbare Bedienelemente Minute 10 | nicht höher als nach Teil 5 | **erfüllt**: 54 (aktiv) und 53 (durchschnitt) gegen 62 und 59; Minute 1: 29 gegen 35 und 30 |
| Patt-Quote | höchstens 2 % | **teilweise**: ohne Schalter 0,7 % (Bot ohne Kategorie) und 0–1 % (Kategorie-Bots); mit `?druck=hoch` 2,3 % (Bot ohne Kategorie und Verteidigung); Einzelfelder Auffälligkeit 2 |
| Karten bewusst kombiniert / Doktrin als Wendepunkt / Weiterentwicklung als Fortschritt | Mensch | offen: Spieltest nach `docs/testleitfaden-kartenpfad-6.md` |

## Entscheidungen des PO (aus der Anforderung)
Strategielinien entfallen, Synergien über drei Kategorien; Doktrinen ausbauen, keine festen Momente, steigender Zufallsfaktor, höchstens zwei je Partie; Weiterentwicklungen zunächst für Fabrik und Universität; Varianten bleiben und werden durch eine Weiterentwicklung ersetzt;
einige Gebäude-Upgrades wandern in Karten; Einschränkungen einer Doktrin gelten sofort, auch für den Bestand (Zunfthaus); Belagerung und Druckkurve nicht in diesem Teil; aus Teil 5: Mindestabstand 45 s bleibt, Schwer-Grundwelle 4,0, Auslegungen bestätigt außer Nr. 3.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| K6.01 | Test: neun Fabriken, Zunftordnung gewählt: kein Zunfthaus; nach Abriss auf vier baubar | `tests/einschraenkung6.test.mjs` (6 Tests). |
| K6.01 | Test je Doktrin: Einschränkung greift im selben Takt wie die Wahl | `tests/einschraenkung6.test.mjs`, `tests/doktrinen.test.mjs`, `tests/doktrinen6.test.mjs`. |
| K6.02 | Test: kein Zeichen, keine Linienstufe, keine Linienanzeige im Modus karten | `tests/linien6.test.mjs`, Browser `tests/browser-q6.mjs` (Block K6.02). |
| K6.02 | Test: jede übernommene Regel wirkt als Karte wie vorher als Stufe | `tests/linien6.test.mjs`. |
| K6.02 | Bedienelemente Minute 10 nicht höher als nach Teil 5 | **erfüllt**: 54 / 53 gegen 62 / 59 (`reports/kartenpfad6-bedienelemente-nach.json`). |
| K6.03 | Test: Zählung je Kategorie, Doktrin doppelt, Mischformen beide Kategorien, Deckel | `tests/kategorien6.test.mjs` (15 Tests). |
| K6.03 | Test: Angebot ab drei Karten enthält eine Karte außerhalb der führenden Kategorie (auch Bann, Neu ziehen) | `tests/kategorien6.test.mjs`. Dabei einen Fehler gefunden und behoben: Der Ersatz einer gebannten Doktrin kam aus der führenden Kategorie. |
| K6.03 | Simulation: Mediane der Partiedauer der drei Kategorie-Bots innerhalb 3 min (Normal) | **verfehlt**: 9:11 (Auffälligkeit 1). |
| K6.03 | Bericht je Bot: Karten der eigenen Kategorie bei Partieende, Wert der Zähler | Tabellen „Karten je Kategorie bei Partieende“ und „Synergiekarten am Partieende“. |
| K6.04 | Test: p steigt und fällt wie beschrieben; nie zwei Doktrinen im Angebot; keine dritte | `tests/doktrinen6.test.mjs` (7 Tests zum Zufallsfaktor). |
| K6.04 | Simulation: Angebote mit Doktrin Median 3–5, erstes Angebot spätestens Wahl 5, Partien ohne Angebot | **erfüllt**: 5, Wahl 4, 0 % ohne Angebot (Normal, durchschnitt); Tabelle „Bot ohne Kategorie“. |
| K6.05 | Test je Doktrin: Effekt, Sonderbau, Einschränkung; Mischformen zählen in beiden Kategorien | `tests/doktrinen6.test.mjs` (7 Tests zu den neuen Doktrinen), `tests/doktrinen.test.mjs`. |
| K6.05 | Bericht je Doktrin mit Ersatzmaßen im Paarvergleich, Normal und Schwer, Verteidigung mit `?druck=hoch` | Tabellen „Doktrinen im Paarvergleich“ (Normal 100 Partien je Arm, Schwer 50). |
| K6.06 | Test: alle Fabriken Dampfmühlen; Grundvarianten ersetzt, Sonderbauten unverändert, Ausbaustufen erhalten | `tests/weiter6.test.mjs` (7 Tests), Browser `tests/browser-q6.mjs` (Block K6.06). |
| K6.06 | Test: Buchdruck verkürzt laufende und künftige Forschungen, ändert den Budgetkurs | `tests/weiter6.test.mjs`. |
| K6.06 | Bericht: Zeitpunkt des Abschlusses (Median), ersetzte Varianten je Partie, Anteil der Partien je Kategorie-Bot | Tabelle „Kategorie-Bots“, Spalten „Dampfkraft / Buchdruck“ und „ersetzte Varianten“. |
| K6.07 | Test: jede Karte aus einem Ausbau wirkt mindestens so stark wie der ganze Ausbau | `tests/ausbauten6.test.mjs` (Turmschule, Stachelwall, Zinsmeister, Maurerkolonne). |
| K6.07 | Test: Grundlagen bleiben ohne Karte erreichbar | `tests/ausbauten6.test.mjs`. |
| K6.07 | Liste im Bericht | Abschnitt „Ausbauten als Karten“. |
| K6.08 | Kategorie-Bots, vierter Bot ohne Kategorie; warten mit dem Aufwerten, wenn Dampfkraft geöffnet ist | `tools/browser-bot.js` (`aufwerten`, `weiterOffen`, `PFAD_RESEARCH`, Freihandel-Tausch). |
| K6.08 | Protokoll: Kategorie je Karte, Synergiewerte, Weiterentwicklungen, ersetzte Varianten, p je Wahl | `session.js` (Format 3), Browser `tests/browser-q6.mjs` (Block K6.08). |
| K6.08 | Spielstand-Version 11; Modus `standard` identisch zu `main` | `tests/unveraendert.test.mjs` (Golden-Test), `SAVE_KEY` `klammerfront.save.v11`. |
| K6.08 | Testbuild, Testleitfaden | Privater Testbuild (Link in der Antwort); `docs/testleitfaden-kartenpfad-6.md`. |

## Zuordnungen
### Kategorien (Pool im Modus karten)
Pool ohne Doktrinen: **38 Karten** (Obergrenze 38); mit den 13 Doktrinen 51. Neutral sind nur Glücksritter und Volle Auslastung.

| Kategorie | Karten | davon Doktrinen |
|---|---|---|
| Militär (20) | Aushebung (2 Stufen), Kriegstrommeln (3), Schildwall (2), Drill (2), Belagerungsgerät (2), Dauerauftrag, Große Armee, Alles auf die Mitte, Rekrutenzug (2), Durchbruch, Waffenbrüder, Sammelruf; Technologie: Fortgeschrittene Taktiken, Ballistik, Eiserne Klingen; Wagnis: Glaskanonen | Stehendes Heer, Vorstoß, Elite, Massenaufgebot |
| Wirtschaft (13) | Bessere Fabriken (3), Lehrjahre (2), Zinsmeister (Handelskontor, 3), Querverbindung, Lagerzehnt, Gilde, Bauordnung; Technologie: Dampfkraft, Buchdruck | Zunftordnung, Stiftung, Freihandel, Raubbau |
| Verteidigung (10) | Maurerkolonne (3), Turmkanoniere (3), Turmschule (3), Stachelwall (3), Plünderung, Wehrverband; Technologie: Befestigungskunde | Bollwerk, Ausfall, Zermürbung |
| Brücken (6) | Söldnertruppe, Kriegswirtschaft (Wirtschaft + Militär); Wehrhandel, Grenzfeste* (Wirtschaft + Verteidigung); Grenzwacht (Militär + Verteidigung); Fabrikmiliz* (Wirtschaft + Militär) | * Doktrin |
| neutral (2) | Glücksritter, Volle Auslastung | |

Ohne Doktrinen und Brücken stehen 16 Militär-, 9 Wirtschafts- und 7 Verteidigungs-Karten im Pool; Militär ist die größte Kategorie (Auffälligkeit 6).

### Übernommene Linienregeln (K6.02)
| Frühere Linienstufe | Karte | Kategorie |
|---|---|---|
| Militär 1: Kaserne schickt je Welle einen Läufer mehr | Rekrutenzug, Stufe I | Militär |
| Militär 2: neue Einheiten starten mit einer Schmiede-Stufe mehr | Rekrutenzug, Stufe II | Militär |
| Militär 3: doppelter Schaden an der gegnerischen Basis | Durchbruch (selten) | Militär |
| Wirtschaft 1: Nachbarschaftsboni auch diagonal | Querverbindung | Wirtschaft |
| Wirtschaft 2: Material über dem Lagerdeckel wird zu EP | Lagerzehnt | Wirtschaft |
| Wirtschaft 3: Söldner über dem Versorgungslimit | Söldnertruppe (selten) | Wirtschaft + Militär |
| Verteidigung 1: Material je Turm-Abschuss | Plünderung | Verteidigung |
| Verteidigung 2: Gegenstoß | Doktrin Ausfall (trug den Gegenstoß schon) | Verteidigung |
| Verteidigung 3: Ausbruch (Gegenstoß-Einheiten, doppelter Schaden an der Basis) | Teil der Doktrin Ausfall | Verteidigung |

### Ausbauten als Karten (K6.07)
| Ausbau (entfällt im Modus karten) | Karte | Stärke gegen den ganzen Ausbau |
|---|---|---|
| Reichweite und Feuerrate der Türme (beide Türme) | Turmschule (neu, 3 Stufen) | Stufe III: Reichweite ×1,7 gegen ×1,67; Abklingzeit ×0,45 gegen ×0,50. Ohne Wirkung mit der Doktrin Freihandel. |
| Stachelwall der Mauer (5 Stufen) | Stachelwall (neu, 3 Stufen) | Stufe III: sieben Stachelstufen gegen fünf |
| Kontor-Ausbau (Zinseszins, 4 Stufen) | Zinsmeister (Stufen der Karte Handelskontor im Modus karten) | Stufe III: Zinsdeckel ×5,5 gegen ×5 |
| Mörtelkolonne der Mauer (5 Stufen) | Maurerkolonne (bestehende Karte, 3 Stufen) | Stufe III: 2 % der Lebenspunkte je Sekunde, mindestens 5 je Sekunde und Abschnitt gegen 5 |
| Schmiede ab der dritten Stufe | **nicht umgesetzt** | Auslegung 20 |

Grundlagen ohne Karte: Turm bauen, Mauerausbau, Quartiere (Kaserne-Ausbau), Presse, Schmiede bis Stufe 3 (`tests/ausbauten6.test.mjs`).
Gestrichen für Platz im Pool: Weitschuss, Sappeure, Zinnen, Notreserve, Werkmeister, Instandhaltung, Lange Wurfarme (Teil 6, K6.03) und Verbrannte Erde (K6.07); Vorschlag, der PO kann tauschen (`KF_PFAD.entfallenKarten`).

@@TABELLEN@@

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die Kategorie-Bots enden weit auseinander, weil nur Militär die Basis beschleunigt.** Normal, „durchschnitt“: Militär 11:38, Wirtschaft 17:11, Verteidigung 20:49 min (nach Teil 5: 10:32, 14:12, 13:35). Alle drei Bots wählen ihre Kategorie stur; die Karten, die den Schaden an der gegnerischen Basis erhöhen
   (Durchbruch, Belagerungsgerät), sind Militär. Versuch mit 30 Partien je Zeile: Durchbruch von Beginn an senkt Verteidigung von 20:35 auf 12:17 und Wirtschaft von 17:11 auf 11:57 min; Gegenstoß (Doktrin Ausfall) von Beginn an bringt Verteidigung nur auf 19:33, Plünderung gar nichts (20:35).
   Das Sperren einzelner Kartengruppen ändert die Verteidigung nur um höchstens 1:21 min (ohne Ausbau-Karten 19:14; ohne Synergiekarten, neue Doktrinen, Linienregel-Karten oder Weiterentwicklungen 20:33 bis 20:41). Die Ursache ist also nicht eine einzelne neue Karte, sondern das Fehlen einer Karte zum Beenden der Partie in zwei Kategorien.
   Ein Mensch nimmt die Militär-Karte, wenn sie kommt; der Bot ohne Kategorie, der auch Militär-Karten nimmt, liegt bei 15:01.
2. **Patt bei `?druck=hoch`.** Verteidigungs-Bot Normal, „durchschnitt“: 12 % offen nach 30 min (Teil 4: 4 %, Teil 5: 0 %), Wirtschafts-Bot 4 % (Teil 5: 2 %). Der Bot ohne Kategorie, Profil „gelegentlich“, Normal, `?druck=hoch`: 14 % (nach Teil 5: 8 %). Ohne Schalter höchstens 4 % in einem Feld (Leicht, „gelegentlich“).
   Belagerung und Druckkurve sind laut Anforderung nicht Teil von Teil 6; hier liegt der Grund, warum diese Zahlen auffallen, aber nicht hier behoben werden.
3. **Zähler wirken stark, wenn der Bot bei einer Kategorie bleibt.** Mit acht gezählten Karten: Gilde +64 % Materialertrag, Waffenbrüder +56 % Schaden, Wehrverband +64 % Turmschaden, Bauordnung ×2, Sammelruf +4 Läufer je Welle. Die Kategorie-Bots enden mit 13 bis 19 Karten der eigenen Kategorie und 1 bis 6 in den anderen;
   der Bot ohne Kategorie mit 7 / 5 / 4. Die Regel „eine Karte außerhalb der führenden Kategorie im Angebot“ ändert das Verhalten eines Bots nicht, der sie ignoriert. Ob Menschen sie annehmen, zeigt der Spieltest.
4. **Dampfkraft kommt spät und ersetzt wenig.** Wirtschafts-Bot Normal: Dampfkraft in 60 % der Partien, Abschluss im Median 14:31 min, im Schnitt 3,1 ersetzte Varianten (Manufakturen). Buchdruck 60 %, 15:18 min. Der Militär-Bot nimmt beide Karten in 2 % der Partien, der Verteidigungs-Bot in 28 % (Dampfkraft) und 36 % (Buchdruck).
   Bei Partien von 17 min nützt eine Dampfmühle nach 14:31 min wenig (+40 % Ertrag für die letzten drei Minuten); der Verlust der Manufakturen trifft früher. Frage 4 im Testleitfaden prüft, ob Menschen warten.
5. **Doktrinen im Paarvergleich (Normal).** Elite macht die Partie schneller (9:42 gegen 10:57 min, Mauerverlust 18 gegen 82). Bollwerk (−11 pp), Zermürbung (−9 pp), Grenzfeste (−5 pp) und Freihandel (−3 pp) verlieren Siege und Zeit, alle mit dem Verteidigungs- bzw. Wirtschafts-Bot und teils mit `?druck=hoch`;
   Freihandel dehnt die Partie von 15:56 auf 20:20 min und kostet Mauer (137 gegen 6). Die Bots nutzen den Tausch nur mit Überschuss. Die Einschränkung ist dort die eigentliche Wirkung; ob sie sich als Entscheidung anfühlt, zeigt der Spieltest.
   Die Differenzen in der Siegquote sind klein, weil Normal fast nur Siege liefert; Dauer, Wahlen und Mauerverlust tragen die Aussage (Auffälligkeit aus Teil 5, unverändert).
6. **Pool nach Kategorie ungleich.** Ohne Brücken und Doktrinen: Militär 16, Wirtschaft 9, Verteidigung 7 Karten. Das erklärt zum Teil, warum der Verteidigungs-Bot seine Karten früher aufbraucht: Er wählt seine Kategorie-Karten in 58–71 % der Angebote, die Doktrinen in 100 %. Die Wahlrate ist für Kategorie-Bots deshalb kein Maß (Hinweis zu K5.06).
7. **Wahlraten (Bot ohne Kategorie).** Alle Teil-6-Karten liegen zwischen 5 und 60 %; außerhalb liegen nur drei Technologie-Karten der Pfadreihenfolge (Fortgeschrittene Taktiken 100 %, Eiserne Klingen 92 %, Befestigungskunde 73 %, unverändert gegenüber Teil 5).
8. **Einmaliger Zeitüberschuss in der Browser-Prüfung.** Ein Lauf von `tests/browser-check.mjs` brach im Tutorial-Schritt „Karte“ mit einem Zeitüberschuss (120 s) ab; derselbe Lauf wiederholt war grün (406 Prüfpunkte). Eine Ursache habe ich nicht gefunden. Die Maschine war zu dieser Zeit mit weiteren Läufen belegt.

## Auslegungen und Abweichungen (zur Bestätigung)
Die Auslegungen 1 bis 24 stehen in `docs/STAND-kartenpfad.md`, Abschnitt „Auslegungen Teil 6“. Die wichtigsten, mit Frage:
1. **Doktrin-Paarvergleich auf Schwer mit 50 statt 100 Partien je Arm.** Der Lauf mit 100 Partien überschritt das Zeitlimit der Umgebung (Normal allein dauerte 68 min). Die Aussage der Tabelle ändert das nicht; für 100 Partien den Lauf mit `node tools/messung-p6.mjs --set doktrin` außerhalb dieser Umgebung wiederholen.
2. **Sieben statt sechs neue Doktrinen (13 insgesamt).** Zermürbung (Soll) ist dabei; Wehrpflicht und Igelstellung (Soll) fehlen. Fabrikmiliz heißt die Doktrin „Kriegswirtschaft“ der Anforderung, weil die Brückenkarte den Namen trägt. Frage: Namen so lassen?
3. **Raubbau: vier Ertragsstufen statt „verliert eine Ausbaustufe“.** Fabriken haben keine Ausbaustufen. Frage: so, oder soll der Verfall anders aussehen?
4. **Freihandel: Tausch in Stapeln** (200 Material gegen 16 EP, 20 EP gegen 120 Material); nur die EP über dem Stand der erreichten Stufe sind tauschbar. Startwerte.
5. **K6.07 vier Ausbauten, Schmiede nicht.** Frage: Schmiede ab Stufe 3 als Karte oder weglassen?
6. **Stufen der Ausbau-Karten steigern nur den Wert** (K5.06 verlangte eine Regeländerung in späteren Stufen). Frage: Zusatzeffekt in Stufe III?
7. **Namen** (Dampfkraft, Buchdruck, Dampfmühle, Druckerei, Zinsmeister, Turmschule, Stachelwall, alle Synergiekarten) sind Platzhalter; die Sprachregel gilt.
8. **Verbrannte Erde gestrichen** für Platz im Pool (Grenze 38).
9. **Die Bots bleiben stur** („bevorzugen“ ist als „wählen immer“ umgesetzt); ein Bot, der die Basis-Karten der anderen Kategorie mitnimmt, würde die Spannweite auf einen Teil verkürzen und zugleich die Aussagekraft der Kategorie-Messung verringern.

## Offen für den PO
1. **Abschluss für Wirtschaft und Verteidigung (Auffälligkeit 1).** Drei Wege: (a) so lassen und den Spieltest urteilen lassen (Anforderung: „Bots als Maß“); (b) einer Brücke oder Doktrin der beiden Kategorien einen Schaden an der Basis geben (z. B. Grenzfeste oder Ausfall); (c) eine neue Karte je Kategorie, die die Zerstörung der Basis beschleunigt.
   Meine Empfehlung: (a) bis zum Spieltest, weil die Zahl aus Bot-Sturheit entsteht; bei (b) oder (c) gehört die Messung mit Seed-Vergleich dazu.
2. **Patt mit `?druck=hoch`** (Auffälligkeit 2): zusammen mit der Runde zu Belagerung und Druckkurve behandeln.
3. **Soll-Doktrinen Wehrpflicht und Igelstellung** und **Schmiede ab Stufe 3** (K6.07): nachliefern oder streichen?
4. **Spielstand-Version 11:** ältere Stände werden verworfen (wie in CHANGELOG und `docs/STAND-kartenpfad.md` vermerkt).
5. **Spieltest** nach dem Leitfaden; die drei [Mensch]-Kriterien sind offen.

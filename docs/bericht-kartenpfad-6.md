# Bericht Kartenpfad Teil 6: Synergien, Doktrinen und Weiterentwicklungen (v0.9.2-kartenpfad-6)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-6.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-6.md`. Stand je Inkrement: `docs/STAND-kartenpfad.md`. Rohdaten: `reports/kartenpfad6-*`.
Messung: schneller Bot („einheiten-zuerst“), je Feld 50 Partien, gleiche Seeds in allen Feldern (Grad × Profil, 450 Partien); Kategorie-Bots 50 Partien je Zeile und Profil, Normal und Schwer, ohne und mit `?druck=hoch` (1 800 Partien);
Doktrinen im Paarvergleich 100 Partien je Arm (Normal) und 50 je Arm (Schwer, siehe Abweichung 1). Werkzeuge: `tools/messung-p6.mjs`, `tools/sim-p5.mjs`, `tools/kategorien-p6.mjs`, `tools/bedienelemente.mjs`; die Tabellen unten erzeugt `node tools/bericht-p6.mjs`.
„Vorher“ ist der Stand von `exp/kartenpfad` nach Teil 5 (Commit `40de382`), gemessen in Q.0 mit denselben Seeds.

## Ergebnis
Alle acht Anforderungen sind umgesetzt, K6.07 (Soll) mit vier von vier bis sechs Ausbauten: 413 Unit-Tests und 629 Browser-Prüfpunkte (fünf Suiten) sind grün. Der Modus `standard` ist unverändert (Golden-Test), die Spielstand-Version steht auf 11.
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

## Kennzahlen der Serie
Tabellen aus `node tools/bericht-p6.mjs`; Rohdaten unter `reports/kartenpfad6-*`. Der Bot ohne Kategorie ist der vierte Bot der Anforderung (Pfadreihenfolge, kein Budget).

### Bot ohne Kategorie: vorher (nach Teil 5) und nachher (50 Partien je Feld, gleiche Seeds)

| Grad | Profil | Siege vorher → nachher | Patt nachher | Dauer Median vorher → nachher | Wahlen Median vorher → nachher | Doktrin-Angebote Median (erstes in Wahl) | Partien ohne Doktrin-Angebot |
|---|---|---|---|---|---|---|---|
| Leicht | aktiv | 100 → 100 % | 0 % | 12:45 → 12:46 | 11 → 11 | 4 (4) | 0 % |
| Leicht | durchschnitt | 100 → 100 % | 0 % | 14:13 → 15:00 | 12 → 12 | 5 (4) | 0 % |
| Leicht | gelegentlich | 100 → 96 % | 4 % | 19:23 → 19:43 | 15 → 15 | 5 (4) | 0 % |
| Normal | aktiv | 100 → 100 % | 0 % | 12:58 → 13:49 | 12 → 13 | 4 (4) | 0 % |
| Normal | durchschnitt | 100 → 100 % | 0 % | 13:35 → 15:01 | 14 → 15 | 5 (4) | 0 % |
| Normal | gelegentlich | 100 → 90 % | 2 % | 20:21 → 18:48 | 18 → 16 | 6 (5) | 0 % |
| Schwer | aktiv | 100 → 100 % | 0 % | 12:18 → 12:00 | 15 → 15 | 5 (4) | 0 % |
| Schwer | durchschnitt | 86 → 88 % | 0 % | 13:19 → 12:49 | 17 → 16 | 5 (4) | 12 % |
| Schwer | gelegentlich | 0 → 0 % | 0 % | 1:29 → 1:29 | 0 → 0 | 0 (–) | 100 % |

### Bot ohne Kategorie mit `?druck=hoch` (Normal, Schwer)

| Grad | Profil | Siege | Patt | Dauer Median | Wahlen Median |
|---|---|---|---|---|---|
| Normal | aktiv | 100 % | 0 % | 13:50 | 13 |
| Normal | durchschnitt | 98 % | 0 % | 15:21 | 15 |
| Normal | gelegentlich | 82 % | 14 % | 19:17 | 17 |
| Schwer | aktiv | 100 % | 0 % | 12:25 | 15 |
| Schwer | durchschnitt | 88 % | 0 % | 12:40 | 16 |
| Schwer | gelegentlich | 0 % | 0 % | 1:29 | 0 |

### Kategorie-Bots (Profil durchschnitt, 50 Partien je Zeile)

| Grad | Druck | Bot | Siege | Niederl. | Patt | Dauer Median | Dauer P90 | Wahlen Median | Dampfkraft / Buchdruck (Anteil, Abschluss Median) | ersetzte Varianten je Partie mit Weiterentwicklung |
|---|---|---|---|---|---|---|---|---|---|---|
| Normal | aus | Militär | 100 % | 0 % | 0 % | 11:38 | 15:21 | 12 | 2 % 14:06 / 2 % 8:58 | 0,5 |
| Normal | aus | Wirtschaft | 98 % | 2 % | 0 % | 17:11 | 21:30 | 21 | 60 % 14:31 / 60 % 15:18 | 3,1 |
| Normal | aus | Verteidigung | 100 % | 0 % | 0 % | 20:49 | 23:51 | 21 | 28 % 16:59 / 36 % 18:27 | 0,3 |
| Normal | hoch | Militär | 100 % | 0 % | 0 % | 11:26 | 15:31 | 12 | 4 % 15:12 / 0 % – | 1,0 |
| Normal | hoch | Wirtschaft | 94 % | 2 % | 4 % | 17:24 | 27:10 | 22 | 74 % 14:11 / 72 % 15:13 | 2,3 |
| Normal | hoch | Verteidigung | 88 % | 0 % | 12 % | 22:22 | 30:00 | 24 | 46 % 20:10 / 44 % 22:06 | 0,3 |
| Schwer | aus | Militär | 84 % | 14 % | 2 % | 10:01 | 12:42 | 12 | 2 % 10:58 / 2 % 18:16 | 0,0 |
| Schwer | aus | Wirtschaft | 86 % | 14 % | 0 % | 16:07 | 21:21 | 20 | 64 % 13:26 / 62 % 14:00 | 2,0 |
| Schwer | aus | Verteidigung | 90 % | 10 % | 0 % | 17:24 | 22:14 | 21 | 36 % 15:52 / 40 % 14:51 | 0,5 |
| Schwer | hoch | Militär | 86 % | 14 % | 0 % | 10:12 | 12:50 | 12 | 0 % – / 8 % 10:33 | 0,0 |
| Schwer | hoch | Wirtschaft | 84 % | 16 % | 0 % | 15:41 | 25:00 | 20 | 58 % 13:28 / 58 % 14:18 | 2,2 |
| Schwer | hoch | Verteidigung | 88 % | 10 % | 2 % | 18:20 | 24:55 | 21 | 40 % 17:59 / 34 % 13:40 | 0,3 |

Spannweite der Dauer-Mediane (größter minus kleinster Bot): normal/aus 9:11, normal/hoch 10:56, schwer/aus 7:23, schwer/hoch 8:08

### Kategorie-Bots, alle Profile (ohne Druck)

| Grad | Profil | Militär Siege / Dauer / Wahlen | Wirtschaft Siege / Dauer / Wahlen | Verteidigung Siege / Dauer / Wahlen |
|---|---|---|---|---|
| Normal | aktiv | 100 % / 11:08 / 11 | 98 % / 16:29 / 20 | 100 % / 15:58 / 17 |
| Normal | durchschnitt | 100 % / 11:38 / 12 | 98 % / 17:11 / 21 | 100 % / 20:49 / 21 |
| Normal | gelegentlich | 100 % / 11:34 / 12 | 86 % / 17:37 / 22 | 94 % / 19:37 / 20 |
| Schwer | aktiv | 96 % / 10:02 / 12 | 98 % / 14:41 / 19 | 100 % / 13:55 / 18 |
| Schwer | durchschnitt | 84 % / 10:01 / 12 | 86 % / 16:07 / 20 | 90 % / 17:24 / 21 |
| Schwer | gelegentlich | 0 % / 1:29 / 0 | 0 % / 1:29 / 0 | 0 % / 1:29 / 0 |

### Doktrinen im Paarvergleich (Normal, durchschnitt, 100 Partien je Arm, gleiche Seeds)

| Doktrin | Kategorie des Bots | Siege mit | Siege ohne | Differenz (pp) | Dauer Median mit / ohne | Wahlen Median mit / ohne | Mauerverlust mit / ohne | Turm-Abschüsse mit / ohne | gewählt (Arm mit) | Sonderbau gebaut |
|---|---|---|---|---|---|---|---|---|---|---|
| zunftordnung | wirtschaft | 100 % | 100 % | 0 | 16:17 / 15:56 | 20 / 20 | 53 / 6 | 0.6 / 0.3 | 100 % | 100 % |
| stiftung | wirtschaft | 99 % | 100 % | -1 | 15:57 / 15:56 | 20 / 20 | 82 / 6 | 0.5 / 0.3 | 100 % | 100 % |
| stehendesHeer | militaer | 100 % | 100 % | 0 | 11:55 / 10:57 | 12 / 11 | 55 / 82 | 0.3 / 0.3 | 100 % | 100 % |
| vorstoss | militaer | 100 % | 100 % | 0 | 11:33 / 10:57 | 12 / 11 | 68 / 82 | 0.3 / 0.3 | 100 % | – |
| bollwerk | verteidigung | 85 % | 96 % | -11 | 24:28 / 23:06 | 26 / 26 | 106 / 57 | 37.2 / 25 | 100 % | 100 % |
| ausfall | verteidigung | 100 % | 96 % | +4 | 20:19 / 23:06 | 22 / 26 | 31 / 57 | 4.7 / 25 | 100 % | – |
| elite | militaer | 100 % | 100 % | 0 | 9:42 / 10:57 | 11 / 11 | 18 / 82 | 0.3 / 0.3 | 100 % | – |
| massenaufgebot | militaer | 100 % | 100 % | 0 | 12:05 / 10:57 | 12 / 11 | 54 / 82 | 0.4 / 0.3 | 100 % | – |
| freihandel | wirtschaft | 97 % | 100 % | -3 | 20:20 / 15:56 | 26 / 20 | 137 / 6 | 0.4 / 0.3 | 100 % | – |
| raubbau | wirtschaft | 100 % | 100 % | 0 | 14:56 / 15:56 | 18 / 20 | 17 / 6 | 0.3 / 0.3 | 100 % | – |
| fabrikmiliz | wirtschaft | 99 % | 100 % | -1 | 16:47 / 15:56 | 21 / 20 | 24 / 6 | 0.4 / 0.3 | 100 % | – |
| grenzfeste | verteidigung | 91 % | 96 % | -5 | 23:20 / 23:06 | 26 / 26 | 165 / 57 | 29.5 / 25 | 100 % | – |
| zermuerbung | verteidigung | 87 % | 96 % | -9 | 24:20 / 23:06 | 27 / 26 | 86 / 57 | 38.8 / 25 | 100 % | – |

### Angebote mit Doktrin (Normal; Arm „alle“: alle 13 Doktrinen im Pool, Kategorie-Bot)

| Kategorie | Siege | Angebote mit Doktrin Median (Mittel) | Doktrinen gewählt (Mittel) | erstes Angebot in Wahl (Median) | erste Doktrin gewählt in Wahl (Median) | Partien ohne Angebot |
|---|---|---|---|---|---|---|
| militaer | 100 % | 3 (3,1) | 1,5 | 4 | 5 | 0 % |
| wirtschaft | 99 % | 3 (3,7) | 2,0 | 4 | 6 | 0 % |
| verteidigung | 89 % | 4 (4,1) | 1,9 | 4 | 5 | 0 % |

Gewählt je Doktrin (Anteil der Partien je Kategorie-Bot: Militär / Wirtschaft / Verteidigung):

zunftordnung 0 / 31 / 2 %, stiftung 0 / 29 / 0 %, stehendesHeer 25 / 1 / 0 %, vorstoss 31 / 4 / 1 %, bollwerk 0 / 0 / 40 %, ausfall 0 / 1 / 45 %, elite 44 / 3 / 3 %, massenaufgebot 24 / 0 / 2 %, freihandel 0 / 31 / 2 %, raubbau 0 / 29 / 0 %, fabrikmiliz 29 / 31 / 3 %, grenzfeste 1 / 38 / 53 %, zermuerbung 0 / 0 / 38 %

### Doktrinen im Paarvergleich (Schwer, durchschnitt, 50 Partien je Arm, gleiche Seeds)

| Doktrin | Kategorie des Bots | Siege mit | Siege ohne | Differenz (pp) | Dauer Median mit / ohne | Wahlen Median mit / ohne | Mauerverlust mit / ohne | Turm-Abschüsse mit / ohne | gewählt (Arm mit) | Sonderbau gebaut |
|---|---|---|---|---|---|---|---|---|---|---|
| zunftordnung | wirtschaft | 94 % | 94 % | 0 | 16:20 / 15:41 | 21 / 20 | 539 / 539 | 10.7 / 10.7 | 94 % | 94 % |
| stiftung | wirtschaft | 94 % | 94 % | 0 | 16:36 / 15:41 | 21 / 20 | 539 / 539 | 10.7 / 10.7 | 94 % | 92 % |
| stehendesHeer | militaer | 92 % | 92 % | 0 | 10:18 / 10:11 | 13 / 12 | 569 / 591 | 10.8 / 10.8 | 92 % | 92 % |
| vorstoss | militaer | 90 % | 92 % | -2 | 10:01 / 10:11 | 12 / 12 | 585 / 591 | 10.8 / 10.8 | 92 % | – |
| bollwerk | verteidigung | 94 % | 96 % | -2 | 17:34 / 16:41 | 22 / 21 | 665 / 569 | 34.9 / 14.8 | 96 % | 96 % |
| ausfall | verteidigung | 96 % | 96 % | 0 | 16:13 / 16:41 | 20 / 21 | 525 / 569 | 11.8 / 14.8 | 96 % | – |
| elite | militaer | 92 % | 92 % | 0 | 8:55 / 10:11 | 11 / 12 | 556 / 591 | 10.8 / 10.8 | 92 % | – |
| massenaufgebot | militaer | 90 % | 92 % | -2 | 10:36 / 10:11 | 13 / 12 | 618 / 591 | 10.8 / 10.8 | 92 % | – |
| freihandel | wirtschaft | 88 % | 94 % | -6 | 21:02 / 15:41 | 27 / 20 | 741 / 539 | 11 / 10.7 | 94 % | – |
| raubbau | wirtschaft | 94 % | 94 % | 0 | 15:27 / 15:41 | 19 / 20 | 547 / 539 | 10.7 / 10.7 | 94 % | – |
| fabrikmiliz | wirtschaft | 94 % | 94 % | 0 | 16:49 / 15:41 | 21 / 20 | 557 / 539 | 10.7 / 10.7 | 94 % | – |
| grenzfeste | verteidigung | 94 % | 96 % | -2 | 16:53 / 16:41 | 21 / 21 | 603 / 569 | 24.6 / 14.8 | 96 % | – |
| zermuerbung | verteidigung | 96 % | 96 % | 0 | 16:39 / 16:41 | 21 / 21 | 567 / 569 | 16.9 / 14.8 | 96 % | – |

### Angebote mit Doktrin (Schwer; Arm „alle“: alle 13 Doktrinen im Pool, Kategorie-Bot)

| Kategorie | Siege | Angebote mit Doktrin Median (Mittel) | Doktrinen gewählt (Mittel) | erstes Angebot in Wahl (Median) | erste Doktrin gewählt in Wahl (Median) | Partien ohne Angebot |
|---|---|---|---|---|---|---|
| militaer | 90 % | 3 (2,9) | 1,4 | 4 | 6 | 8 % |
| wirtschaft | 92 % | 3 (3,5) | 1,9 | 4 | 6 | 6 % |
| verteidigung | 92 % | 4 (3,9) | 1,8 | 4 | 6 | 4 % |

Gewählt je Doktrin (Anteil der Partien je Kategorie-Bot: Militär / Wirtschaft / Verteidigung):

zunftordnung 0 / 28 / 0 %, stiftung 0 / 30 / 2 %, stehendesHeer 28 / 2 / 2 %, vorstoss 24 / 2 / 2 %, bollwerk 0 / 2 / 38 %, ausfall 0 / 0 / 36 %, elite 22 / 0 / 2 %, massenaufgebot 28 / 0 / 2 %, freihandel 0 / 14 / 2 %, raubbau 0 / 28 / 0 %, fabrikmiliz 36 / 36 / 2 %, grenzfeste 2 / 44 / 46 %, zermuerbung 0 / 0 / 48 %

### Karten je Kategorie bei Partieende (normal, durchschnitt, druck aus, 50 Partien je Bot; Median, Mittel in Klammern)

| Bot | Militär | Wirtschaft | Verteidigung | führende Kategorie (Anteil der Partien: Militär / Wirtschaft / Verteidigung) |
|---|---|---|---|---|
| Militär | 13 (12,9) | 1 (1,3) | 1 (1,0) | 100 % / 0 % / 0 % |
| Wirtschaft | 6 (6,4) | 17 (17,0) | 4 (3,8) | 0 % / 100 % / 0 % |
| Verteidigung | 4 (3,8) | 3 (3,6) | 19 (18,0) | 0 % / 0 % / 100 % |
| ohne Kategorie | 7 (7,5) | 5 (5,2) | 4 (4,3) | 52 % / 10 % / 2 % |

### Synergiekarten am Partieende (Anteil der Partien mit der Karte · Wert im Median · gezählte Karten im Median)

| Bot | waffenbrueder | sammelruf | gilde | bauordnung | wehrverband |
|---|---|---|---|---|---|
| Militär | 42 % · +56 % · 8 | 52 % · +4 Läufer · 8 | 0 % | 0 % | 0 % |
| Wirtschaft | 20 % · +56 % · 8 | 16 % · +4 Läufer · 8 | 90 % · +64 % · 8 | 96 % · ×2,0 · 8 | 16 % · +40 % · 5 |
| Verteidigung | 6 % · +35 % · 5 | 4 % · +2 Läufer · 4 | 12 % · +48 % · 6 | 10 % · ×2,0 · 6 | 96 % · +64 % · 8 |
| ohne Kategorie | 30 % · +49 % · 7 | 32 % · +4 Läufer · 8 | 16 % · +56 % · 7 | 26 % · ×2,0 · 6 | 26 % · +40 % · 5 |


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
   Schwer (50 Partien je Arm): Elite wieder schneller (8:55 gegen 10:11 min), Freihandel −6 pp bei 21:02 gegen 15:41 min; alle übrigen Differenzen höchstens ±2 pp.
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

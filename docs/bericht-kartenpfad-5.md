# Bericht Kartenpfad Teil 5: Grundausstattung, Doktrinen und Pacing aus dem Spielfluss (v0.9.2-kartenpfad-5)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-5.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-5.md`. Stand je Inkrement: `docs/STAND-kartenpfad.md`. Rohdaten: `reports/kartenpfad5-*` (die beiden Zusatzläufe `-doktrin-normal-druck` und `-doktrin-schwer` entstanden vor dem Preis des Stiftungshauses von 2 statt 3 Baukosten; ihre Tabellen für die Stiftung zeigen 4 % gebaute Stiftungshäuser).
Messung: schneller Bot („einheiten-zuerst“), je Feld 50 Partien, gleiche Seeds in allen Feldern (Grad × Profil, 450 Partien); Linien-Bots 50 Partien je Zeile (Normal, durchschnitt); Doktrinen im Paarvergleich 100 Partien je Arm; Forschungsbudget 50 Partien je Arm. Die Simulation misst Stärke, nicht Spielspaß.
„Vorher“ ist der Stand von `exp/kartenpfad` nach Teil 4 (Commit fdd5a9c), gemessen in N.0 mit denselben Seeds; „nachher“ der Endstand von Teil 5.

## Ergebnis
Alle zehn Anforderungen sind umgesetzt: 353 Tests und 589 Browser-Prüfpunkte sind grün, der Modus `standard` ist unverändert (Golden-Test), die Spielstand-Version steht auf 10. Von den Zielwerten in K5.10 sind neun erreicht: Normal, „durchschnitt“ braucht 14 Wahlen in 13:35 Minuten bei einer längsten Lücke von 89 s (P90: 142 s); Schwer, „durchschnitt“ gewinnt 86 %; die Linien-Bots liegen 2 Prozentpunkte auseinander, der Verteidigungs-Bot braucht mit `?druck=hoch` 14:02 Minuten ohne offene Partie; im Median erscheinen 3 bis 4 Angebote mit Doktrin.
Zwei Zielwerte verfehle ich: Die Doktrinen lassen sich in der Siegquote nicht messen, weil die Bots auf Normal 100 % gewinnen und auf Schwer dieselben Eröffnungs-Seeds verlieren (der Paarvergleich zeigt +0 pp; als Ersatzmaß dienen Dauer, Wahlen und Mauerverlust); das Forschungsbudget bringt mit 50 % gegen 0 % +2 statt +3 Wahlen, weil Mindestabstand und Partiedauer die Zahl der Wahlen begrenzen.

## Entscheidungen des PO (aus der Anforderung)
Leitsatz „Grundlagen jeder Strategie ohne Karte, Karten öffnen Strategien“; Alle Grundgebäude, Türme und Werfer ab Start, Bau-Karten entfallen; Versorgung bleibt ein Invest; Pacing aus dem Spielfluss ohne Zeitautomatismus; Doktrinen ersetzen die Schlüsselkarten, mit harten Einschränkungen, höchstens zwei je Partie; Zeichen nur von Doktrinen und Varianten; Linienstufen als Regeländerungen, Stufe 3 als eigener Weg zum Sieg; das Forschungsbudget ersetzt den Hörsaal; Kartenpool 25 bis 30 Karten mit Stufen, die einen neuen Effekt bringen; Partie von etwa 15 Minuten mit 12 bis 16 Wahlen als Kalibrierziel.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| K5.01 | Basismessung vor allen Änderungen | `reports/kartenpfad5-basis-*`: Normal, durchschnitt: 10 Wahlen, 11:49, längste Lücke 85 s (der Fahrplan sichert den Takt); **mit abgeschaltetem Fahrplan** nur 3 Wahlen in 16:44 und eine Lücke von 424 s (Siege 2 %): Ohne neue EP-Quellen taugt der Spielfluss nicht als Takt. |
| K5.02 | Test: alle genannten Gebäude und Einheiten ab Start baubar bzw. kaufbar; keine Bau-Karte im Pool | `tests/kartenpfad.test.mjs`, `tests/pool5.test.mjs`. |
| K5.02 | Test: Versorgung steigt nur durch Kauf oder Doktrin | `tests/kartenpfad.test.mjs` (Quartiere +2 je Stufe), `tests/doktrinen.test.mjs` (Heerlager +6). |
| K5.02 | Simulation: Schwer, durchschnitt, Siegquote 70–90 % | **erfüllt**: 86 % (vorher 74 %). Dafür Grundwelle von Schwer im Modus karten 4,0 statt 3,5 (`KARTEN.gegner`); 4,2 kippt in 20 %, die Eröffnung entscheidet (Auffälligkeit 5). |
| K5.02 | Bericht: Siegquote Schwer je Profil vorher/nachher | aktiv 100 → 100 %, durchschnitt 74 → 86 %, gelegentlich 40 → 0 %. Tabelle „Felder“. |
| K5.03 | Test: ohne EP-Zuwachs keine Wahl, unabhängig von der Spielzeit | `tests/pacing5.test.mjs`. |
| K5.03 | Normal, durchschnitt: Median 12–16 Wahlen, Dauer 13–17 min | **erfüllt**: 14 Wahlen, 13:35 (vorher 10 und 11:49). |
| K5.03 | Längste Lücke zwischen zwei Wahlen: Median ≤ 120 s, P90 ≤ 180 s | **erfüllt für „durchschnitt“ und „aktiv“**: 89 / 142 s und 98 / 115 s; „gelegentlich“ liegt bei 125 / 191 s (Tabelle „Felder“). |
| K5.03 | Bericht: Wahlen je Profil und Grad, Anteil jeder EP-Quelle | Tabellen „Felder“ und „EP je Minute und Quelle“. |
| K5.04 | Suche über `data/` und `config.js`: keine Wirkung bezieht sich auf Zielzeit, Fahrplan oder Höchstabstand; Inventar | **erfüllt**: `tests/pool5.test.mjs`; Inventar Abschnitt „Karten und Upgrades mit Zeitbezug“. |
| K5.05 | Test: Budget wandelt den Anteil um, der Kurs sinkt, Hörsaal entfällt | `tests/budget.test.mjs` (6 Tests), Browser `tests/browser-n5.mjs`. |
| K5.05 | Simulation: 50 % gegen 0 %: mindestens 3 Wahlen mehr, höchstens +15 pp | **teilweise**: +2 Wahlen („durchschnitt“), +1 („aktiv“), +0 pp. Mehr Kurs (0,12; 0,16) bringt nicht mehr Wahlen (Auffälligkeit 6). |
| K5.06 | Pool 25–30 Karten (ohne Doktrinen); Inventar | **erfüllt**: 28 Karten (22 Bonus, 4 Technologie, 2 Wagnis) statt 45; Inventar Abschnitt „Kartenpool“. |
| K5.06 | Test: jede Karte erfüllt die Spürbarkeitsgrenze | `tests/pool5.test.mjs`. |
| K5.06 | Stufen mit neuem Effekt; mindestens die Hälfte der Karten mit Stufen mit Regeländerung | **erfüllt**: 13 Karten mit Stufen, bei 7 ist Stufe 2 oder 3 eine Regeländerung (`tests/pool5.test.mjs`). |
| K5.06 | Wahlrate je Karte 5–60 % (Hinweis) | Abschnitt „Wahlraten“. |
| K5.07 | Test je Doktrin: Effekt, Sonderbau und Einschränkung greifen; eine dritte Doktrin wird nie angeboten | `tests/doktrinen.test.mjs` (17 Tests). |
| K5.07 | Paarvergleich 100 Partien: jede Doktrin +5 bis +25 pp | **nicht messbar** (Auffälligkeit 1): alle Differenzen 0 pp (Normal 100 % Siege in beiden Armen). Ersatzmaße: Tabelle „Doktrinen im Paarvergleich“. |
| K5.07 | Simulation: Angebote mit Doktrin im Median ≥ 3 | **erfüllt**: 3 bis 4 je Partie (Linien-Bots mit allen sechs Doktrinen im Pool). |
| K5.08 | Test: Zählung der Zeichen nach neuer Regel, Stufe 3 nur mit Doktrin; Regel greift genau ab ihrer Schwelle und entfällt darunter | `tests/linien5.test.mjs` (15 Tests). |
| K5.08 | Verteidigungs-Bot mit `druck=hoch`: Dauer Median ≤ 18 min, Patt ≤ 2 % | **erfüllt**: Median 14:02, offen 0 % (ohne Schalter 13:58 und 2 %) (vorher 23:57 und 4 %). |
| K5.08 | Bericht: in welcher Linie landet der Bot ohne Linienwahl? | In keiner bestimmten: Stufe 1 erreicht er in Militär 26 / 30 %, Wirtschaft 26 / 34 %, Verteidigung 18 / 32 % der Partien (ohne / mit `druck=hoch`), Stufe 2 und 3 in höchstens 6 %; vorher lief er in 100 % in die Linie Militär. Ursache: Karten tragen keine Zeichen mehr. |
| K5.09 | Fabriken ohne Variante bei Minute 10: Median ≤ 4 | **erfüllt für die Linien-Bots** (Militär 4, Wirtschaft 0, Verteidigung 0; vorher 5,5); der Bot ohne Linie hat 5, weil er nie aufwertet. |
| K5.09 | Keine Grundvariante in mehr als 60 % der Aufwertungen | **erfüllt**: größter Anteil 24,6 % (Manufaktur); Tabelle „Linien-Bots“. |
| K5.10 | Bots: Linien-Bots wählen Doktrinen und Varianten, Budget Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %; vierter Bot ohne Linie | `tools/browser-bot.js` (`LINIEN_BUDGET`, `aufwerten` mit Sonderbau), `tools/sim-p4.mjs --suite linien`, `tools/sim-p5.mjs --suite doktrin`. |
| K5.10 | Protokoll: EP je Quelle, Budget-Einstellungen, gewählte Doktrinen | `session.js`: `xpBySource`, `actions[]` mit `setBudget`, `doktrinen[]`, `doktrinAngebote`, `unterhalt`. |
| K5.10 | Spielstand-Version 10; Modus `standard` identisch zu `main` | `tests/unveraendert.test.mjs` (Golden-Test), `tests/linien.test.mjs`. |
| K5.10 | Testbuild, Testleitfaden | Privater Testbuild (Link in der Antwort); `docs/testleitfaden-kartenpfad-5.md`. |

## Karten und Upgrades mit Zeitbezug (REQ-K5.04)
| Inhalt | Maßnahme |
|---|---|
| Wahl-Fahrplan: Zielzeiten, `zielzeitIstFrist` | entfernt (N.2); die Wahl hängt nur noch an der EP-Schwelle |
| Höchstabstand (`maxAbstand`) | entfernt (N.2) |
| Mindesttempo (freie Wahlen) | entfernt (N.2) |
| Schwellen je Grad (`schwellenGrad`) | ersetzt durch einen Faktor je Grad (`schwellenFaktor`, Standard 1) |
| Füllung des Kartensymbols nach Zeit | entfernt; sie zeigt nur den EP-Fortschritt |
| Hörsaal I–III (passive EP über die Zeit) | im Modus karten entfernt (N.3); das Forschungsbudget ersetzt ihn |
| Kriegserfahrung | zurück im Pool als „Lehrjahre“, Wirkung auf alle EP-Quellen (N.2) |
| Glücksritter | Fassung mit längerem Wellenabstand entfernt; wieder +15 % EP je Stufe (N.2) |
| Nachtschicht (Wirkung nur in der Phase „spät“) | gestrichen (N.4) |
| Protokollfelder `sollS`, `maxAbstand` | entfernt |

## Kartenpool (REQ-K5.06)
Spürbarkeitsgrenze: eine Regeländerung oder mindestens eine Größe um 20 %. Maßnahmen:

| Karte | Kategorie | Maßnahme | Begründung |
|---|---|---|---|
| Bessere Fabriken | Wirtschaft | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Schwere Pressen | Wirtschaft | gestrichen | zusammengelegt in Bessere Fabriken (gleiche Größe, Nachteil Mauer entfällt) |
| Serienbau | Wirtschaft | gestrichen | gestrichen (Teil 4): wirkte nur auf Baukosten |
| Doppelschicht | Wirtschaft | gestrichen | gestrichen: Produktion +25 % mit Nachteil bei Klicks, den es nach der Eröffnung nicht gibt; zusammengelegt mit Bessere Fabriken |
| Nachtschicht | Wirtschaft | gestrichen | gestrichen: Wirkung nur in der Phase „spät“, unter der Spürbarkeitsgrenze (+25 %) und zeitgebunden |
| Lehrjahre | Wirtschaft | verstärkt, umbenannt „Lehrjahre“ | kehrt zurück (K5.04); wirkt auf alle EP-Quellen; Stufe II zusätzlich Budgetkurs +25 % |
| Kriegsanleihe | Wirtschaft | gestrichen | gestrichen: einmaliger Zuschuss, kein dauerhafter Effekt |
| Handelskontor | Wirtschaft | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Großauftrag | Wirtschaft | gestrichen | gestrichen: Synergie +6 % je Karte, unter der Grenze |
| Aushebung | Armee | verstärkt: Stufen mit zusätzlichem Effekt | neue Stufen (siehe unten) |
| Kriegstrommeln | Armee | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | Stufe I von +15 % auf +25 % angehoben |
| Schildwall | Armee | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Drill | Armee | verstärkt: Stufen mit zusätzlichem Effekt | Stufe I von −10 % auf −20 % Angriffsintervall angehoben |
| Belagerungsgerät | Armee | verstärkt: Stufen mit zusätzlichem Effekt | neue Stufen (siehe unten) |
| Lange Wurfarme | Armee | verstärkt: Stufen mit zusätzlichem Effekt | neue Stufen (siehe unten) |
| Vorposten | Armee | gestrichen | gestrichen: Wirkung gering (Einheiten starten 150 weiter vorn), Nachteil Mauer |
| Weitschuss | Armee | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Sappeure | Armee | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Veteranen | Armee | gestrichen | gestrichen: Synergie +4 % je Karte, unter der Grenze |
| Taktiker | Armee | gestrichen | gestrichen: Synergie +5 % je Karte, unter der Grenze |
| Maurerkolonne | Basis | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Turmkanoniere | Basis | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Bastion | Basis | gestrichen | gestrichen: Name und Wirkung (Reichweite) gehören jetzt der Bastion der Doktrin Bollwerk; Reichweite steht in Turmkanoniere II |
| Zinnen | Basis | verstärkt: Stufen mit zusätzlichem Effekt | Stufe I von +15 % auf +25 % angehoben |
| Notreserve | Basis | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Scharfschützen | Basis | gestrichen | zusammengelegt in Turmkanoniere III (doppelter Schaden gegen Fernkämpfer) |
| Festungsbau | Basis | gestrichen | gestrichen: Synergie +5 % je Karte, unter der Grenze (die Pfadkarte Befestigungskunde bleibt) |
| Instandhaltung | Automatisierung | verstärkt: Stufen mit neuem Effekt, Regeländerung in Stufe 2 oder 3 | neue Stufen (siehe unten) |
| Fließband | Automatisierung | gestrichen | gestrichen: wirkt auf die Klickpresse (Eröffnung) |
| Dauerauftrag | Automatisierung | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Werkmeister | Automatisierung | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Bauleitung | Automatisierung | gestrichen | gestrichen (Teil 4): wirkte nur auf die Bauzeit |
| Zeugmeister | Automatisierung | gestrichen | gestrichen: automatisiert den Turmausbau, wenig Entscheidung |
| Rationalisierung | Automatisierung | gestrichen | gestrichen: Synergie +5 % je Karte, unter der Grenze |
| Selbstläufer | Automatisierung | gestrichen | gestrichen: Synergie +10 % auf die Presse, die nach der Eröffnung keine Rolle spielt |
| Große Armee | Sonderregel | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Alles auf die Mitte | Sonderregel | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Blitzkrieg | Sonderregel | gestrichen | gestrichen: die Doktrin Vorstoß übernimmt „Wellen doppelt so oft“ |
| Söldnerheer | Sonderregel | gestrichen | gestrichen: der Name und die Idee gehören der Linie Wirtschaft (Stufe 3 „Söldner“) |
| Verbrannte Erde | Sonderregel | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Glücksritter | Sonderregel | bleibt | Spürbarkeitsgrenze erfüllt (Regeländerung oder Größe ab 20 %) |
| Fortgeschrittene Taktiken | Technologie | bleibt | öffnet Forschungen der Universität (Regeländerung) |
| Ballistik | Technologie | bleibt | öffnet Forschungen der Universität (Regeländerung) |
| Eiserne Klingen | Technologie | bleibt | öffnet Forschungen der Universität (Regeländerung) |
| Befestigungskunde | Technologie | bleibt | öffnet Forschungen der Universität (Regeländerung) |
| Glaskanonen | Wagnis | bleibt | Wagnis: spielverändernd mit Nachteil |
| Volle Auslastung | Wagnis | bleibt | Wagnis: spielverändernd mit Nachteil |

Stufen mit neuem Effekt (Modus karten, `KARTEN.kartenTiers`): Bessere Fabriken II/III Nachbarschaftsbonus der Fabriken ×2 / ×3 (Regel); Lehrjahre II Budgetkurs +25 %; Aushebung II Einheiten −10 % Kosten; Drill II Einheiten +10 % Lebenspunkte; Kriegstrommeln III wirken schon ab drei statt fünf Einheiten (Regel); Schildwall II eine Reihe mit vier Nahkämpfern zählt als voll (Regel); Belagerungsgerät II Basis verliert 2 LP/s; Lange Wurfarme II Fernkämpfer +10 % Schaden; Sappeure II arbeiten von Anfang an (Regel); Maurerkolonne III auch das Tor regeneriert (Regel); Turmkanoniere II Reichweite +25 %, III +50 % und doppelter Schaden gegen Fernkämpfer (Regel); Zinnen II Reparaturen −50 %; Instandhaltung III repariert schon bei 80 % (Regel).

## Doktrinen und Sonderbauten (REQ-K5.07)
| Linie | Doktrin | Sonderbau / Fähigkeit | Effekt | Einschränkung |
|---|---|---|---|---|
| Wirtschaft | Zunftordnung | Fabrik → Zunfthaus (3-fache Kosten) | Nachbarschaftsbonus des Zunfthauses ×3 | höchstens 4 Fabriken und Zunfthäuser; Gesperrtes mit Erklärzeile |
| Wirtschaft | Stiftung | Universität → Stiftungshaus (2-fache Kosten) | Kurs des Forschungsbudgets ×2 | Einheiten +20 % Kosten |
| Militär | Stehendes Heer | Kaserne → Heerlager (3-fache Kosten) | Versorgung +6 | jede Einheit auf dem Feld kostet 1 Material je Minute Unterhalt |
| Militär | Vorstoß | – | eigene Wellen im halben Abstand | Türme feuern 30 % langsamer |
| Verteidigung | Bollwerk | Fabrik → Bastion (3-fache Kosten): Turm im Raster | Bastion 1,5 × Turmschaden; Abschüsse durch Türme und Bastionen bringen doppelte EP | Fabriken −15 % Ertrag |
| Verteidigung | Ausfall | – | Gegenstoß nach jeder abgewehrten Welle, +100 % Stärke | Reparatur der Mauer kostet das Doppelte |

Jede Doktrin trägt drei Zeichen ihrer Linie, erscheint ab Wahl 3 und spätestens in jedem dritten Angebot (Bonusplatz), höchstens zwei je Partie; wer eine Linie führt (mindestens zwei Zeichen), zieht deren Doktrinen mit dreifachem Gewicht.

## Linien und Stufen (REQ-K5.08)
Zeichen: Doktrin drei, Gebäude-Variante eines je Variantentyp (Grundvariante oder Sonderbau), Karten keine. Stufen bei 2, 4, 6 Zeichen; Stufe 3 setzt eine Doktrin der Linie voraus.
| Linie | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|
| Militär | Kaserne schickt je Welle 1 Läufer mehr | Neue Einheiten starten mit einer Schmiede-Stufe mehr | Durchbruch: doppelter Schaden an der gegnerischen Basis |
| Wirtschaft | Nachbarschaftsboni wirken auch diagonal | Material über dem Lagerdeckel wird zu EP | Söldner: Einheiten über dem Versorgungslimit, ohne Versorgung, +50 % Kosten |
| Verteidigung | Abschüsse durch Türme bringen Material | Gegenstoß nach jeder abgewehrten Welle | Ausbruch: Gegenstöße +50 % Stärke und doppelter Schaden an der Basis |

## Grundvarianten (REQ-K5.09)
Manufaktur +20 % Ertrag (vorher +40 %), Werkstatt −25 % Einheitenkosten (−10 %), Wachstube +30 % Turmschaden und Material je Turm-Abschuss (+15 %); neu: Zahlmeisterei (Kaserne, Quartiere −30 %) und Münzschmiede (Schmiede, Ausbau −25 %), damit jedes Grundgebäude eine Variante je Linie hat.

## Kennzahlen

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


## Wahlraten
Messung über alle Profile auf Normal (9558 Angebote). Zwei von 34 Karten liegen außerhalb von 5 bis 60 %: **Fortgeschrittene Taktiken (100 %)** und **Eiserne Klingen (87 %)**; beide wählt der Pfad „Militär“ der Bots vor allem anderen (Pfadreihenfolge), die Zahl misst den Bot, nicht die Karte. Alle übrigen liegen zwischen 6 % (Volle Auslastung) und 42 % (Befestigungskunde); die Doktrinen zwischen 12 und 23 %, die Bonuskarten zwischen 16 und 36 %. Rohdaten: `reports/kartenpfad5-nachher-felder.json` (`wahlraten`).

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die Doktrinen lassen sich in der Siegquote nicht messen.** Normal: alle Bots gewinnen 100 % mit und ohne Doktrin. Auf Schwer gewinnen die Linien-Bots 90 bis 92 % (mit `druck=hoch` 73 bis 77 %); die Verlustseeds sind in beiden Armen dieselben und fallen in die Eröffnung, vor der ersten Doktrin (Wahl 5 bis 8). Selbst `druck=hoch` mit dem Faktor 2,0 hält die Normal-Bots bei 100 %. Der Paarvergleich liefert deshalb nur Dauer, Wahlen, Mauerverlust und Turm-Abschüsse. Ergebnis: **Die Militär-Doktrinen verkürzen die Partie um 2:38 (Stehendes Heer) und 3:10 Minuten (Vorstoß); der Mauerverlust sinkt von 34 auf 14 und 11.** Die Wirtschafts- und Verteidigungs-Doktrinen verlängern die Dauer um 21 bis 27 s und verändern sie damit nicht.
2. **Verteidigungsdoktrinen greifen nur, wenn Gegner die Mauer erreichen.** Die Belagerung hält die Gegnerwellen auf (Teil 4, Auffälligkeit 3, unverändert): Turm-Abschüsse 0,3 je Partie, Gegenstöße 0 bis 5. Bastion und Ausfall sind in der Simulation fast wirkungslos; Bollwerk kostet 15 % Fabrikertrag.
3. **Die Wirtschaftsdoktrinen wirken nicht auf die Siegzeit.** Der Wirtschaft-Bot hat Material im Überfluss; die Wellengröße begrenzt die Versorgung. Die Zunftordnung bringt in der Simulation keine Zeit (14:34 gegen 14:07), die Stiftung kostet 24 s (14:31) bei 93 % gebauten Stiftungshäusern (Auslegung 14).
4. **Stufe 3 der Linien liegt bei Minute 7 bis 8.** Eine Doktrin (3 Zeichen) plus eine Variante geben Stufe 2, eine zweite Doktrin Stufe 3; die Doktrinen erscheinen in Wahl 5 bis 8 (Minute 4 bis 7), weil die ersten fünf Wahlen im Mindestabstand von 45 s fallen (Eröffnung mit vielen Abschüssen). Als „Weg zum Sieg“ kommt Stufe 3 früh. Stellschrauben: Zeichenzahl der Doktrin, Schwelle 6, Wahl ab der eine Doktrin erscheint.
5. **Schwer hängt an der Eröffnung.** Grundwelle 3,8 und 4,0 liefern 87,5 %, 4,2 nur 20 % („gelegentlich“ verliert immer bei 1:30). Der Übergang ist ein Sprung, kein Verlauf.
6. **Das Forschungsbudget bringt höchstens +2 Wahlen.** Bei 50 % wandelt die Universität 18 bis 28 % der EP um; mehr Kurs (0,12, 0,16) lässt die Quelle auf 35 bis 42 % steigen, aber die Zahl der Wahlen nicht über +2, weil der Mindestabstand (45 s) und die Partiedauer sie begrenzen. Die Schwellenkurve (Wachstum 1,07 statt 1,05) ändert daran nichts.
7. **Die Mitte der Partie ist EP-arm, nicht wahlarm.** Ab Minute 2:30 belagert die Armee die gegnerische Basis; die Gegnerwellen sind blockiert, die Abschüsse bleiben aus. Seit 10 EP je Prozent Basisschaden (vorher 4) liegen die EP in Minute 4–8 bei 70 je Minute (vorher 27), die längste Lücke bei 89 s (85 s mit Fahrplan).
8. **Lange Partien bekommen eine EP-Flut.** „gelegentlich“ auf Normal: 12+ min 1250 EP je Minute, 18 Wahlen (Obergrenze durch den Mindestabstand), weil nach der Belagerungswelle in Minute 16 viele Gegner fallen. Es betrifft nur Partien über 16 Minuten.
9. **Die Fabrik-Dominanz ist gebrochen, solange ein Linien-Bot spielt.** Bei Minute 10 stehen 0 bis 4 reine Fabriken (vorher 5,5); der Bot ohne Linie hat weiterhin 5.
10. **Lager und Söldner** wirken in der Simulation nur beim Wirtschaft-Bot (Stufe 2/3 in 100 % der Partien ab 5:55 bzw. 7:44).

## Auslegungen und Abweichungen (zur Bestätigung)
1. **Sonderbau löst Grundvariante ab (K5.07).** Eine Grundvariante ist endgültig, außer für einen Sonderbau: Wer die Doktrin erst nach der Aufwertung wählt (Wahl 3 liegt meist nach Minute 3), kann eine Werkstatt, Manufaktur oder Wachstube zum Sonderbau aufwerten; die Kosten fallen voll an. Ohne diese Regel wäre die Doktrin für Wirtschaft und Verteidigung wirkungslos: In der Messung waren alle Fabriken schon Manufakturen, bevor die Zunftordnung erschien.
2. **Bastion ist eine Fabrik-Variante (K5.07).** Das Raster hat keinen Platz für ein eigenes Turmgebäude; die Bastion ersetzt die Variante einer Fabrik, die Fabrik darunter arbeitet weiter. Sie feuert in die Lane ihrer Zeile (oben Lane 0, Mitte Tor-Lane, unten Lane 2) mit 1,5 × dem Turmschaden der Stufe max(2, Turm der Lane); Kadenz und Reichweite wie die Türme der Lane. Sie schweigt, solange der Mauerabschnitt ihrer Lane gefallen ist.
3. **Grenze der Zunftordnung** zählt Plätze mit Typ Fabrik (Zunfthäuser sind Fabrikplätze). Schon Stehendes bleibt stehen; gesperrt ist nur der Neubau.
4. **Drei Zeichen je Doktrin** zählen sofort: Eine Doktrin allein bringt die Linie auf Stufe 1 (nach Teil 4: zwei Zeichen), zwei Doktrinen derselben Linie auf Stufe 2 (vier Zeichen).
5. **Angebotsausgleich:** erste mögliche Doktrin in Wahl 3, danach spätestens in jedem dritten Angebot ohne Doktrin (wie die Schlüsselkarten in Teil 4); nach der zweiten gewählten Doktrin keine mehr.
6. **Lagerdeckel (K5.08, Wirtschaft Stufe 2).** Im Spiel gab es keinen Lagerdeckel (der Zinsdeckel des Kontors begrenzt nur die Zinsen). Auslegung: Lagerdeckel = Materialertrag von drei Minuten (mindestens 1500); Material darüber wird jede Sekunde zu EP zum Kurs 0,08 EP je Material (`C.LINIEN.lager`). Alternative: Deckel am Zinsdeckel des Kontors (dann etwa 500 Material, das würde größere Aufwertungen blockieren).
7. **Söldner (K5.08, Wirtschaft Stufe 3).** Ist die Warteschlange am Versorgungslimit, wirbt derselbe Einheitenknopf Söldner an: Kosten × 1,5 (`C.LINIEN.soeldner.kostenFaktor`), sie belegen keine Versorgung und rücken mit der nächsten Welle aus. Es gibt keinen eigenen Knopf; die Erklärzeile nennt „Söldner, keine Versorgung“.
8. **„Neue Einheiten starten mit der ersten Schmiede-Stufe“ (Militär Stufe 2)** gilt als „eine Schmiede-Stufe mehr“ (`startSmith` + 1, wie der Drillmeister aus Teil 4), auch ohne Schmiede. Alternative: Mindeststufe 1, dann wäre die Regel für jeden Spieler mit Schmiede wirkungslos.
9. **Durchbruch** (Militär Stufe 3) verdoppelt den Schaden aller eigenen Einheiten an der gegnerischen Basis, **Ausbruch** (Verteidigung Stufe 3) den der Gegenstoß-Einheiten. Mit der Doktrin Ausfall zählt der Stärkezuschlag der Gegenstöße doppelt: +100 % (Doktrin) + 50 % (Stufe) = +150 %.
10. **Münzschmiede (K5.09, „optional“)** ist umgesetzt, damit jedes Grundgebäude eine Variante je Linie hat und alle Linien gleich viele Zeichen aus Varianten erreichen können (drei).
11. **Pool von 45 auf 28 Karten (K5.06).** Streichungen und Zusammenlegungen siehe Zeile N.4. Wer eine gestrichene Karte vermisst, kann sie im Modus karten über `KF_PFAD.entfallenKarten` zurückholen; im Modus standard bleibt der Pool wie in main.
12. **Regeländerungen der Stufen 2 und 3** sind Vorschläge (Namen der Stufen: Bessere Fabriken II „Nachbarschaftsbonus ×2“, Kriegstrommeln III „ab drei Einheiten“, Schildwall II „Reihe mit vier Nahkämpfern zählt als voll“, Sappeure II „von Anfang an“, Maurerkolonne III „auch das Tor“, Turmkanoniere III „doppelt gegen Fernkämpfer“, Instandhaltung III „schon bei 80 %“).
13. **Der Paarvergleich der Doktrinen misst keine Siegquote (K5.07).** Normal: alle Linien-Bots gewinnen 100 % mit und ohne Doktrin; Schwer: dieselben Seeds verlieren in der Eröffnung. Messung ersatzweise über Dauer, Wahlen, Mauerverlust und Turm-Abschüsse (Tabelle im Bericht). Gewonnene Einsicht: die Zahl ist ein Machbarkeitsmaß; die Stärke beurteilt der Spieltest.
14. **Stiftungshaus kostet das Zweifache der Baukosten der Universität (600 Material), nicht das Dreifache.** Mit dem Dreifachen (900) baute der Wirtschaft-Bot es in 4 % der Partien, mit dem Zweifachen in 93 %. Weitere Sonderbauten bleiben beim Dreifachen (`DOKTRIN.sonderbau.kostenFaktor`).
15. **Kalibrierung (K5.03).** Schwellenkurve 70 × 1,05^(k−1), 10 EP je Prozent Basisschaden und 4 + 2 EP je Einheit einer abgewehrten Welle. Gemessen wurden sieben Wertesätze (Start 50 bis 80, Wachstum 1,03 bis 1,07, 4 bis 12 EP je Prozent); Start 70, Wachstum 1,05, 10 EP liefert die kürzeste Lücke (89 s) bei 14 Wahlen. Schwer: Grundwelle 4,0 (Normal bleibt 2,0).
16. **Forschungsbudget (K5.05) bleibt bei Kurs 0,08.** Kurs 0,12 und 0,16 bringen nicht mehr Wahlen (+2 und +1), nur einen höheren Anteil der Budget-EP; der Mindestabstand begrenzt die Wahlen.
17. **Fabrik-Kriterium (K5.09)** gilt für die Linien-Bots; der Bot ohne Linie wertet nie auf und hält 5 reine Fabriken.
18. **„Angebote mit Doktrin“ (K5.07)** zählt Wahlen, in deren Angebot mindestens eine Doktrin liegt (höchstens eine je Angebot), bis zur zweiten gewählten Doktrin.

## Schwache Annahmen der Anforderung: Stand
| Annahme | Stand nach Teil 5 |
|---|---|
| Neue EP-Quellen schließen die Lücke in der Mitte | **Bestätigt**: Basisschaden (10 EP je %) und abgewehrte Wellen halten die längste Lücke bei 89 s (Normal, durchschnitt). Ohne sie: 424 s. |
| Pacing aus dem Spielfluss: Schneeball und Abwärtsspirale | **Teilweise sichtbar**: „gelegentlich“ bekommt 18 Wahlen, „aktiv“ 12 (Tabelle „Felder“); die Spreizung entsteht durch die längere Partie, nicht durch Stärke. |
| Schwer wird über mehr Gegner auch reicher an Karten | **Bestätigt**: Schwer, durchschnitt: 17 Wahlen (Normal 14); die Grundwelle 4,0 hält die Siegquote bei 86 %. |
| Harte Einschränkungen machen Doktrinen unattraktiv | **Nicht messbar** (Auffälligkeit 1); Stiftung kostet in der Simulation 24 s, Militär gewinnt 2:38 bis 3:10 Minuten. Entscheidet der Spieltest. |
| Bau-Karten entfallen: das Gefühl des Freischaltens | **Offen**; Testleitfaden Frage 9. |
| Forschungsbudget: reines Forschen wird dominant | **Nicht bestätigt**: +2 Wahlen, Siegquote +0 pp, Dauer ±0:50. |
| 12–16 Wahlen in 15 Minuten ermüden | **Offen**; Spieltest (Frage 5 aus Teil 3). |
| Bastion im Raster verlagert die Fabrik-Frage | **Bestätigt, aber harmlos**: Verteidigung-Bot baut im Mittel 3,3 Bastionen bei Minute 10 (Plätze der Fabriken), 0 reine Fabriken. |
| Bots als Maß | **Begrenzt** (Auffälligkeit 1): Bots messen Machbarkeit; die Doktrinen lassen sich nur im Spieltest beurteilen. |
| Platzhalternamen unkritisch | Namen aus der Anforderung unverändert; „Söldnerheer“ und „Bastion“ als Karten entfallen, weil Linienstufe und Sonderbau die Namen tragen. |

## Offene Punkte für den PO
1. **Doktrinen ohne Messung stärken oder lassen?** Die Simulation zeigt nur für Militär eine Wirkung. Vorschlag: Spieltest abwarten; falls Wirtschaft und Verteidigung schwach wirken, Zunfthaus-Faktor 3 → 5, Bastion 1,5 → 2,5 (Versuch A zeigt allein keinen Effekt in der Simulation).
2. **Forschungsbudget:** +2 statt +3 Wahlen akzeptieren, oder Mindestabstand 45 s → 35 s?
3. **Stufe 3 der Linien früher oder später?** Siehe Auffälligkeit 4.
4. **Verteidigung ohne Gegner an der Mauer:** Die Belagerung bleibt (Ausschluss in K5); ein Folgeschritt „Druckkurve“ würde Bollwerk und Ausfall erst wirksam machen.
5. **Schwer:** Grundwelle 4,0 bestätigen (Auffälligkeit 5).
6. **Auslegungen** bestätigen, besonders 1 (Sonderbau löst Grundvariante ab), 6 (Lagerdeckel), 7 (Söldner), 8 (Schmiede-Stufe).
7. **Spieltest** nach `docs/testleitfaden-kartenpfad-5.md` (je Person zwei Partien, eine mit `?druck=hoch`).

## Wie nachspielen
- Feldmessung: `node tools/sim-p5.mjs --suite felder --runs 50 --json reports/…json`; Forschungsbudget: `--suite budget`; Doktrinen: `--suite doktrin --doktrinRuns 100` (`--druck hoch`, `--doktrinDiff schwer`).
- Linien-Bots: `node tools/sim-p4.mjs --suite linien --runs 50`. Mehrere Wertesätze: `node tools/kalibrieren-p5.mjs --runs 30 --sets '[…]'`. Tabellen: `node tools/bericht-p5.mjs --vorher … --nachher … --linien … --doktrin …`.
- Versuche ohne Dateiänderung: `KF_OVERRIDE='{"KARTEN":{"schwellen":{"start":70,"wachstum":1.05}}}' node tools/sim-p5.mjs …`.
- Browser: `npm run test:browser` (Playwright).

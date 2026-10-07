# Klammerfront – Bericht Kartenpfad Teil 2: Kartendarstellung und Entdecken

Branch `exp/kartenpfad`, Stand 07.10.2026. Anforderungen: `docs/anforderungen-kartenpfad-2.md`. Stand je Inkrement und Auslegungen 19–25: `docs/STAND-kartenpfad.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-2.md`.

## Ergebnis in drei Sätzen
Die Bildmitte ist außerhalb einer Kartenwahl frei, die Wahl läuft als Ablauf (Austeilen, Aufdecken, Flug zum Wirkort, Rückkehr in den Stapel), und das Spiel zeigt nur noch, was nutzbar ist; alles ist reine Oberfläche, `core.js` und die Spielwerte sind unverändert, der Modus `standard` ohne Schalter ist identisch zu `main` (Golden-Test, Messung). Ein Ziel ist verfehlt: In Minute 1 zeigt der Modus `karten` 22 statt höchstens 14 Bedienelementen (K2.08, ein Drittel von 43); der Abstand hat benannte Ursachen und Stellschrauben (unten). Alle Schalter lassen sich per Adresse setzen; Testbuild und Leitfaden liegen bei.

## Ergebnis je Anforderung
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

## K2.08 Sichtbare Bedienelemente
Fester Lauf: Seed 424242, Bot „einheiten-zuerst“, Profil „durchschnitt“, Normal, `tools/sichtbar-mass.mjs`; gezählt werden Knöpfe, Reiter und Leistenelemente (alle Reiter aufgeklappt, nur Reiter mit sichtbarem Knopf), ohne den gleichbleibenden Rahmen von 16 Elementen (Menü, Kamera, 9 Raster-Plätze, Hinweis). Rohdaten `reports/sichtbar-*.json` (mit Liste der Elemente).

| Zustand | Minute 1 | Minute 5 | Minute 10 | neu zwischen 1 und 10 |
|---|---|---|---|---|
| nach Teil 1, `karten` | 47 | 49 | 49 | 19 |
| nach Teil 2, `karten` (Entdecken an) | **22** | 35 | 43 | 27 |
| nach Teil 1, `standard` | 42 | 46 | 46 | 8 |
| nach Teil 2, `standard` ohne Schalter | 42 | 46 | 46 | 8 |
| nach Teil 2, `standard` mit `?entdecken=1&buehne=1` | 28 | 32 | 31 | 9 |

Lesart: Minute 1 sinkt im Modus `karten` von 47 auf 22 (−53 %), das Verhältnis zu Minute 10 von 0,96 auf 0,51; das Ziel 0,33 (≤ 14) ist **verfehlt**. Der Bot hat in Minute 1 schon 5 Fabriken gebaut, Einheiten gekauft und drei Wellen geschickt; das öffnet Versorgung, Armee und die fünf Mauer- und Turmoptionen auf einmal (22 = 7 Leistenelemente, Klickfeld mit Presse, 4 Reiter, 5 Mauer- und Turmoptionen, 2 Einheiten, Kaserne). Stellschrauben, falls das Ziel gelten soll (jeweils Entscheidung des PO, nicht umgesetzt): (a) die fünf Mauer- und Turmoptionen erst nach dem ersten Mauerschaden zeigen (Spielregel `REVEAL_AT`), (b) Armee- und Versorgungsanzeige zu einer Anzeige verschmelzen, (c) den Reiter Mauer & Türme erst mit der ersten gegnerischen Welle öffnen. Ein Mensch öffnet in Minute 1 weniger als der Bot.

## Zuordnung K2.04: sichtbar ab
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

## Zuordnung K2.07: Schalter und Modi
| Schalter | `karten` (Standard) | `standard` (Standard) | URL |
|---|---|---|---|
| `UI.kartenbuehne` (K2.01–K2.03) | an | aus | `?buehne=1\|0` |
| `UI.entdecken` (K2.04–K2.06) | an | aus | `?entdecken=1\|0` |
| `ENTDECKEN.vorschau` | keine | keine | `?vorschau=naechste` |
| `KARTENBUEHNE.zeit` | pause | pause | `?zeit=pause\|langsam\|lauf` |

Abbildung in `standard` mit Schaltern: Forschung sichtbar, wenn Voraussetzung erfüllt und Universität gebaut (kein „Öffnet mit“, im Standard gibt es keine Öffnung durch Karten); Bauoptionen und Einheiten wie im Standard freigeschaltet (Stufe 2 der gestaffelten Einführung bleibt); das Band zeigt die Kategorie statt der Familie.

## Bildschirmfotos
`docs/bilder/k2-buehne-austeilen.png` (Karten fliegen aus der Leiste), `k2-buehne-offen.png` (Bühne, aufgedeckt, Vorderseiten), `k2-buehne-wirkflug.png` (Flug zum Wirkort), `k2-nach-wahl.png` (nach der Wahl, Wirkort leuchtet), `k2-ui-min1-karten.png`, `k2-ui-min10-karten.png`, `k2-ui-min10-standard.png`, `k2-rueckseite.png`.

## Prüfungen
`npm test` (217 Tests, Golden-Test unverändert), Browser-Prüfung `tests/browser-check.mjs` und `tests/browser-k2.mjs` (REQ-K2.01–K2.07), Kurzsimulation `standard` unverändert (100 % Siege, keine offene Partie), Bot-Messläufe deterministisch.

## Auffälligkeiten (berichtet, nicht behoben)
1. Knöpfe mit Klassenregeln (`.btn-ghost`) blieben trotz `hidden` sichtbar („Welle vorziehen“ ohne Kaserne). Bei Entdecken behoben, in `main` bestehend; Patch dort möglich.
2. Wellen-Anzeige ist bei Entdecken von Anfang an sichtbar (K2.04), im Standard erst mit der ersten Welle.
3. Karten mit Nachteil zeigen „mit Nachteil“ auf der Vorderseite; der Wortlaut steht erst in der Detailzeile.

## Offen für den PO
1. Ziel K2.08 (Minute 1 ≤ ein Drittel): Stellschraube wählen (a, b oder c) oder Ziel anpassen.
2. Auslegungen 19–25 bestätigen (`docs/STAND-kartenpfad.md`), besonders 21 (nur erste Wirkung auf der Karte) und 22 (Ausschluss ohne Namen).
3. Übernahme nach `main` ist nicht Teil dieses Auftrags; Kriterien: Abschnitt 5 der Anforderungen.

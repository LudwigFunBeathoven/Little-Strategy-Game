# Klammerfront – Plan Iteration 4

Stand: 29.09.2026 · Grundlage: `docs/anforderungen-iteration-4.md`

## Abgleich (Abschnitt 0.3)
Nach Version 1 der Anforderungen wurde nichts umgesetzt. Der Branch beginnt auf dem Stand von I3.7.

**Branch:** Das Dokument nennt `iteration-3`. Gearbeitet wird im bestehenden Branch `3x3-und-3-Lanes-Spiel`, der den gesamten Stand von Iteration 3 trägt.
Ein Umbenennen ist vor dem Merge möglich, aber nicht nötig.

## Merge-Risiko (Abschnitt 0.4)
`git diff main...3x3-und-3-Lanes-Spiel --stat` (vor Iteration 4): 37 Dateien, +3.298 / −668 Zeilen.

`main` steht auf `306878c` (Übernahme von v0.3 aus dem Zip). Dieser Commit ist Vorfahre des Branches; auf `main` gibt es seitdem keine eigenen Commits.
**Der Merge ist ein Fast-Forward, Konflikte sind nicht zu erwarten.** Das Risiko entsteht nur, wenn bis zum Merge jemand direkt auf `main` committet.
Dann betreffen Konflikte fast sicher `ui.js`, `core.js`, `config.js`, `index.html` und die Sprachdateien, weil der Branch sie großflächig umgebaut hat.

Die Gebäude-Icons aus `main` (`drawBuilding` in `ui.js` von v0.3) wurden in I3.1 entfernt und werden in I4.6 zurückgeholt.

## Reihenfolge und Prüfung
I4.1 bis I4.8 nacheinander, je Inkrement: `npm test`, `npm run test:browser`, Kurzsimulation, Commit `I4.x:`, `docs/STAND.md`.

## Kartenliste für REQ-45 (zur Freigabe)
41 Karten in fünf Kategorien. Seltenheit: G = gewöhnlich (Gewicht 70), S = selten (25), L = legendär (5, einmalig, ändert eine Regel, mit Nachteil).
„Syn.“ = Synergie: wird mit der Zahl gewählter Karten der Kategorie stärker (die Karte selbst zählt mit). Werte sind Vorgaben, Kalibrierung in I4.8.

### Wirtschaft (9)
| Karte | Selt. | Stufen | Wirkung | Nachteil |
|---|---|---|---|---|
| Bessere Fabriken | G | I–III | Fabrikertrag +25 / +60 / +120 % | – |
| Schwere Pressen | G | I–III | Fabrikproduktion +40 / +75 / +120 % | Abschnitte −15 / −30 / −45 % LP |
| Serienbau | G | I–II | Fabriken −15 / −30 % Kosten | – |
| Doppelschicht | G | I–II | Fabrikproduktion +25 / +50 % | Klickertrag −50 / −75 % |
| Nachtschicht | G | I–II | Abwesenheit +4 / +8 h | – |
| Schrottsammler | G | I–II | Altmetall +30 / +60 % | – |
| Kriegsanleihe | S | I–III | Material für 60 / 90 / 120 s Produktion | Gegner +8 / +16 / +25 % LP |
| Handelskontor | S | I | Handelskontor baubar (braucht Fabrik) | – |
| Großauftrag | S, Syn. | I | Fabrikertrag +6 % je Wirtschaftskarte | – |

### Armee (11)
| Karte | Selt. | Stufen | Wirkung | Nachteil |
|---|---|---|---|---|
| Aushebung | G | I–II | Versorgungslimit +1 / +2 | Einheiten −10 / −20 % LP |
| Kriegstrommeln | G | I–III | Formationen ab 5 Einheiten +15 / +25 / +40 % Schaden | – |
| Schildwall | G | I–II | Voll besetzte Nahkampfreihe +20 / +35 % LP | – |
| Drill | G | I–II | Einheiten greifen 10 / 20 % schneller an | – |
| Belagerungsgerät | G | I–II | Schaden gegen Basen +60 / +120 % | gegen Einheiten −20 / −35 % |
| Lange Wurfarme | G | I–II | Werfer-Reichweite +25 / +50 | Werfer −15 / −30 % LP |
| Vorposten | G | I | Start 150 weiter vorn | Abschnitte −15 % LP |
| Weitschuss | S | I | Fernkämpfer: eine Reihe mehr vor sich erlaubt | – |
| Sappeure | S | I–II | Gegnerische Basis −2 / −5 LP/s, solange eigene Einheiten in der gegnerischen Hälfte stehen | – |
| Veteranen | S, Syn. | I | Einheitenstärke +4 % je Armeekarte | – |
| Taktiker | S, Syn. | I | Schaden gegen Basen +5 % je Armeekarte | – |

### Basis (7)
| Karte | Selt. | Stufen | Wirkung | Nachteil |
|---|---|---|---|---|
| Maurerkolonne | G | I–III | Stehende Mauern regenerieren 0,5 / 1 / 2 % LP/s nach 5 s ohne Treffer | – |
| Turmkanoniere | G | I–III | Turmschaden +40 / +80 / +150 % (braucht Turm) | – |
| Bastion | G | I–II | Türme +25 / +50 % Reichweite (braucht Turm) | – |
| Zinnen | G | I–II | Alle Abschnitte +15 / +30 % LP | – |
| Notreserve | S | I | Tor unter 25 %: einmal voll repariert | – |
| Scharfschützen | S | I | Turmschaden gegen Fernkämpfer +100 % (braucht Turm) | – |
| Festungsbau | S, Syn. | I | Alle Abschnitte +5 % LP je Basiskarte | – |

### Automatisierung (8)
| Karte | Selt. | Stufen | Wirkung | Nachteil |
|---|---|---|---|---|
| Instandhaltung | G | I–III | Abschnitte unter 50 % werden automatisch repariert, zu 80 / 65 / 50 % der Kosten | – |
| Fließband | G | I–II | Automatische Presse +25 / +50 %, ab Phase Früh mit 25 % | – |
| Dauerauftrag | S | I | Füllt die Warteschlange bei jedem Takt mit der zuletzt gekauften Zusammensetzung, soweit das Material reicht | – |
| Werkmeister | S | I | Schmiede kauft ihre nächste Stufe selbst ab dem doppelten Preis im Bestand | – |
| Bauleitung | S | I | Baut auf einem freien Platz selbst eine Fabrik ab dem doppelten Preis im Bestand | – |
| Zeugmeister | S | I | Türme kaufen „Kaliber“ selbst ab dem dreifachen Preis im Bestand | – |
| Rationalisierung | S, Syn. | I | Fabriken +5 % je Automatisierungskarte | – |
| Selbstläufer | S, Syn. | I | Automatische Presse +10 % je Automatisierungskarte | – |

### Sonderregel (6)
| Karte | Selt. | Stufen | Wirkung | Nachteil |
|---|---|---|---|---|
| Große Armee | L | I | Versorgungslimit ×2 (Obergrenze 15 bleibt) | Wellentakt 40 s statt 20 s |
| Alles auf die Mitte | L | I | Alle eigenen Einheiten gehen in die Mitte, +40 % Stärke | Mauern −30 % LP |
| Blitzkrieg | L | I | Wellentakt 12 s statt 20 s | Einheiten −25 % LP |
| Söldnerheer | L | I | Einheiten kosten kein Material | Fabrikproduktion −40 % |
| Verbrannte Erde | L | I | Fällt eine Mauer, erleiden alle Gegner ihrer Lane 300 Schaden | Reparaturen kosten das Doppelte |
| Glücksritter | S | I | Eine Karte mehr je Angebot | Stufen brauchen 15 % mehr Altmetall |

Synergiekarten: Großauftrag, Veteranen, Taktiker, Festungsbau, Rationalisierung, Selbstläufer (6).
Entfallen gegenüber I3: keine; alle 18 Karten bleiben, zugeordnet nach Kategorie.

## Auslegungen, die ich ohne Rückfrage treffe (Defaults)
- „Front folgen“ (REQ-44) kommt mit dem scrollbaren Weltbild in I4.6; vorher gibt es keine Kamera.
- Formation: Lücken in der vordersten Reihe füllen sich sofort aus den hinteren Reihen auf (Reihen werden laufend neu gebildet).
- Gestaffelte Einführung: Mauer- und Turm-Upgrades erscheinen mit der ersten Welle; das Dokument nennt sie nicht.
- Die Verstärkungsgebäude sind vor Stufe 2 auch in der Spiellogik gesperrt, nicht nur ausgeblendet (sonst unterscheiden sich Bots und Menschen).

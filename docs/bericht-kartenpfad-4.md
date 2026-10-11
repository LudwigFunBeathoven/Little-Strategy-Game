# Bericht Kartenpfad Teil 4: Strategielinien, Gebäude-Aufwertung und Kartenpool (v0.9.2-kartenpfad-4)

Branch `exp/kartenpfad`, nicht auf `main` oder `MVP`. Anforderungen: `docs/anforderungen-kartenpfad-4.md`. Testleitfaden: `docs/testleitfaden-kartenpfad-4.md`. Stand je Inkrement: `docs/STAND-kartenpfad.md`. Rohdaten: `reports/kartenpfad4-*`.
Messung: schneller Bot („einheiten-zuerst“), je Feld 50 Partien, gleiche Seeds in allen Feldern; Linien-Bots je Zeile 100 Partien (Normal, durchschnitt); Schlüsselkarten im Paarvergleich 50 Partien je Arm. Die Simulation misst Stärke, nicht Spielspaß.
„Vorher“ ist der Stand von `exp/kartenpfad` vor Teil 4 (Commit 60f5868), gemessen in L.0 mit denselben Seeds.

## Ergebnis
Alle neun Anforderungen sind umgesetzt: 336 Tests und 552 Browser-Prüfpunkte sind grün, der Modus `standard` ist unverändert, die Wahlen auf Schwer liegen im Median höchstens 41 s vor ihrer Zielzeit (vorher 84 s), und die drei Linien-Bots liegen mit `?druck=hoch` 15 Prozentpunkte auseinander (Hypothese: höchstens 20). Drei Befunde widersprechen der Anforderung: Befund 4.2 entfällt nicht (Schwer, „durchschnitt“, 74 % statt 96 %, weil „Wissen zuerst“ dort früh verliert), die Varianten brechen die Fabrik-Dominanz nicht (5,4 bis 5,6 reine Fabriken bei Minute 10) und die Schlüsselkarten heben die Siegquote um höchstens 8 Prozentpunkte. Dreizehn Auslegungen und Abweichungen brauchen die Bestätigung des PO, darunter eine dritte Stufe der Linien, Versorgung +2 in deren Wirtschaftsstufe und doppelte EP-Schwellen auf Schwer.

## Entscheidungen des PO (aus der Anforderung)
B2 d/e: Aufwertung der Gebäude zu Varianten, Streichung der Baukosten-Inhalte; B4: Druckkurve bleibt, nur der Testschalter `?druck=hoch`; C1 bis C5: Fälligkeit nach Fahrplan bleibt, Kriegserfahrung entfällt und Glücksritter verlängert den Wellenabstand, eigene Schwellen für Schwer, Kaserne ab Start, Inventar der seltenen Karten; A1: Raster bleibt 3×3. Umsetzungsreihenfolge L.0 bis L.6 nach Abbruchregel; alle Inkremente sind fertig, nichts wurde gestrichen.

## Abnahmekriterien
| REQ | Kriterium | Ergebnis |
|---|---|---|
| S.01 | Ursache dokumentiert, Fehler behoben | **erfüllt**: Der Symboltabelle `GLYPH` in `panels.js` fehlten Armbrustschütze und Katapult (`GLYPH[…]` war `undefined`). Symbol jetzt je Einheit in `config.js`; `docs/STAND-kartenpfad.md`. |
| S.01 | Test: jede Einheit hat Name, Kurzname, Symbol in beiden Sprachen; Vorschau ohne `undefined` | `tests/einheitentexte.test.mjs` (4 Tests). |
| S.01 | Prüfen, ob `main` betroffen ist | **nicht betroffen**: `main` hat nur Läufer, Werfer und Schildträger, alle mit Zeichen. Keine Behebung dort. |
| S.01 | Bildschirmfoto der Warteschlange mit allen Einheiten | `docs/bilder/kartenpfad4-warteschlange.png`. |
| S.02 | Test: Kriegserfahrung im Modus `karten` nie im Angebot, in `standard` unverändert | `tests/pool4.test.mjs` (300 Angebote an wechselnden Spielständen, drei Seeds). |
| S.02 | Test: Glücksritter verlängert den Wellenabstand, ändert keine EP-Schwelle | `tests/pool4.test.mjs`: Abstand ×1,25, `xpNeed` unverändert; Standard ×1,15 wie bisher. |
| S.02 | Schwer, „durchschnitt“: keine Wahl im Median mehr als 45 s vor der Zielzeit | **erfüllt**: Abweichung −40, −35, −41, −9, 0 … s (vorher −40, −65, −84, −52, −17 …). Tabelle „Abweichung der Wahlzeit“. |
| S.02 | Test: Kaserne ab Start baubar; Gelehrte und Metallverarbeitung in Wahl 1 ziehbar | `tests/pool4.test.mjs`; Browser: `tests/browser-check.mjs`. |
| S.02 | Siegquote Schwer vorher und nachher (Befund 4.2 sollte entfallen) | **Befund 4.2 entfällt nicht**: 96 % → 74 % (durchschnitt), 66 % → 40 % (gelegentlich), 96 % → 100 % (aktiv). Auffälligkeit 1. |
| S.03 | Test: keine gestrichene Karte, Forschung oder Ausbaustufe erreichbar; Standard unverändert | `tests/pool4.test.mjs`, `tests/angebot.test.mjs`, Golden-Test. Liste: Abschnitt „Gestrichene Inhalte“. |
| S.04 | Test: Zeichen werden korrekt gezählt, auch beim Abriss | `tests/linien.test.mjs` (Abriss senkt Zeichen und Stufe; zwei Manufakturen zählen einmal). |
| S.04 | Test: Boni greifen genau ab 2 bzw. 4 Zeichen und entfallen bei sinkender Zahl | `tests/linien.test.mjs` (Stufen 1 bis 3, Wirkung jeder Stufe im Spiel). |
| S.04 | Test: vor Stufe 1 ist kein Linienelement sichtbar | `tests/browser-l4.mjs`: Leiste, Zeichen an Karten und Varianten verborgen bis Stufe 1. |
| S.04 | Zuordnungstabelle der Zeichen | Abschnitt „Zuordnung der Zeichen“. |
| S.05 | Test: Aufwertung ersetzt das Gebäude, behält Ausbaustufen, nicht umkehrbar außer durch Abriss | `tests/linien.test.mjs`. |
| S.05 | Test: während der Aufwertungszeit wirkt das Gebäude nicht | `tests/linien.test.mjs` (Fabrik, Kaserne). |
| S.05 | Messung: Anteil der Fabriken am Raster bei Minute 5 und 10, vorher und nachher | Tabelle „Fabriken im Raster“. Auffälligkeit 2. |
| S.05 | Bericht: Verteilung der Varianten je Linien-Bot | Tabelle „Linien-Bots“, zweite Tabelle. |
| S.06 | Test je Karte: Wirkung greift wie beschrieben | `tests/schluessel.test.mjs` (sechs Karten). |
| S.06 | Simulation: keine Schlüsselkarte hebt die Siegquote eines Linien-Bots um mehr als 25 pp (`druck=hoch`) | **erfüllt**: größter Zuwachs +8 pp. Tabelle „Schlüsselkarten“. Auffälligkeit 4. |
| S.07 | Simulation: im Median mindestens drei Angebote mit Schlüsselkarte je Partie (Normal, durchschnitt) | **erfüllt**: Median 3 (schneller Bot ohne Linie), Linien-Bots 3 bis 8. |
| S.07 | Test: Regel „spätestens jede dritte Wahl ab Wahl 3“ greift | `tests/schluessel.test.mjs` (40 Partien, 12 Angebote je Partie: nie mehr als zwei Angebote in Folge ohne Schlüsselkarte). |
| S.08 | Test: mit Schalter Wellen ab Minute 4 um den Faktor stärker, ohne Schalter identisch | `tests/druck.test.mjs`. |
| S.09 | Basismessung vor allen Änderungen | `reports/kartenpfad4-basis.*`, `reports/kartenpfad4-bildzeit-basis.json`. |
| S.09 | Wahlzeiten, Partiedauer, Wahlen: Werte aus Teil 3 halten | **erfüllt**: Normal, durchschnitt 11:49 (vorher 11:56), 10 Wahlen. |
| S.09 | Patt ≤ 2 % | **erfüllt** auf allen neun Feldern (0 %). Die Linie Verteidigung bleibt in 2 bis 7 % offen (Auffälligkeit 3). |
| S.09 | Bildzeit bei 20/40/80 Einheiten | Tabelle „Bildzeit“; nur berichten. |
| S.09 | Bericht, Testleitfaden, Testbuild, Spielstand-Version 9 | dieser Bericht, `docs/testleitfaden-kartenpfad-4.md`, privater Testbuild https://claude.ai/artifact/XkPEqoEHjZThGfXSKfGaAC, `SAVE_VERSION` 9. |

## Zuordnung der Zeichen (REQ-S.04)
Zeichen tragen Karten und Variantentypen; Schlüsselkarten tragen zwei (◆◆), Pfadkarten sind mit * markiert. Quelle: `data/linien.js`.
Vorschlag der Anforderung für Pfadkarten übernommen (Echtes Militär → Militär, Festungsbau → Verteidigung, Handel → Wirtschaft, Gelehrte und Metallverarbeitung ohne Zeichen); die übrigen Pfadkarten sind nach Gegenstand zugeordnet (Technologie der Armee → Militär, Befestigungskunde → Verteidigung).
Automatisierung: Instandhaltung und Zeugmeister → Verteidigung (Reparatur, Türme); Fließband, Rationalisierung, Selbstläufer, Dauerauftrag und Werkmeister → Wirtschaft (selbsttätige Ausgaben und Erträge). Sonderregel: Söldnerheer → Wirtschaft, Alles auf die Mitte und Verbrannte Erde → Verteidigung; Große Armee, Blitzkrieg und Glücksritter ohne Zeichen. Wagnis-Karten (Glaskanonen, Volle Auslastung) ohne Zeichen, weil sie die Regeln für alle Linien verändern.

| Linie | Zeichenquellen | Karten |
|---|---|---|
| Militär | 17 | Aushebung, Kriegstrommeln, Schildwall, Drill, Belagerungsgerät, Lange Wurfarme, Vorposten, Weitschuss, Sappeure, Veteranen, Taktiker, Drillmeister ◆◆, Vorhut ◆◆, Echtes Militär *, Fortgeschrittene Taktiken *, Ballistik *, Eiserne Klingen * |
| Wirtschaft | 16 | Bessere Fabriken, Schwere Pressen, Doppelschicht, Nachtschicht, Kriegsanleihe, Handelskontor, Großauftrag, Fließband, Dauerauftrag, Werkmeister, Rationalisierung, Selbstläufer, Söldnerheer, Handelsnetz ◆◆, Rücklage ◆◆, Handel * |
| Verteidigung | 15 | Maurerkolonne, Turmkanoniere, Bastion, Zinnen, Notreserve, Scharfschützen, Mauerwerk, Instandhaltung, Zeugmeister, Alles auf die Mitte, Verbrannte Erde, Bollwerk ◆◆, Gegenstoß ◆◆, Festungsbau *, Befestigungskunde * |
| ohne Zeichen | 7 | Große Armee, Blitzkrieg, Glücksritter, Metallverarbeitung *, Gelehrte *, Glaskanonen *, Volle Auslastung * |

Zeichenquellen ohne Schlüsselkarten: Militär 15, Wirtschaft 14, Verteidigung 13. Die erste Fassung (Armee, Automatisierung und Sonderregel überwiegend Militär) gab Militär 23 Quellen gegen 11 (Wirtschaft) und 12 (Verteidigung); ein Spieler ohne Absicht wäre von selbst in die Linie Militär gelaufen. Varianten: je Variantentyp ein Zeichen (Auslegung 2).

## Gestrichene Inhalte (REQ-S.03)
Im Modus `karten` nicht erreichbar, im Modus `standard` unverändert (`KF_PFAD.entfallenKarten`, `KF_PFAD.entfallen`):
- **Karten:** Kriegserfahrung (EP × 1,3 bzw. 1,6; REQ-S.02 C2), **Serienbau** (Fabrikkosten × 0,85 bzw. × 0,7), **Bauleitung** (baut selbsttätig Fabriken).
- **Forschung:** **Ingenieurskunst** (Baukosten × 0,85 / 0,72 / 0,6).
- **Ausbauten:** keiner. Kein Ausbau (`UPGRADES`) und keine Nachbarschaftsregel verbilligt oder beschleunigt allein den Bau von Gebäuden; die Regel „Schmiede neben Kaserne“ wirkt auf Einheitenkosten.
Das Handelskontor wird erst angeboten, wenn der Zinsdeckel erreicht wurde; Söldnerheer vermindert die Produktion nur auf × 0,8 (vorher × 0,6). Große Armee, Zeugmeister, Notreserve und Zinnen bleiben, wie entschieden.

## Gebäude-Varianten (REQ-S.05)
Aufwerten kostet das Zweifache der Baukosten (Fabrik: 60 Material), dauert 10 s (das Gebäude ruht), ist sichtbar ab Minute 3 mit stehendem Gebäude des Typs und endgültig; Abriss erstattet die Hälfte der gezahlten Summe. Werte in `data/linien.js` und `LINIEN.aufwertung` (`config.js`).

| Grundgebäude | Militär | Wirtschaft | Verteidigung |
|---|---|---|---|
| Fabrik | Werkstatt: Einheitenkosten −10 % | Manufaktur: Ertrag +40 % je Gebäude | Wachstube: Türme +15 % Schaden, Turm-Abschüsse bringen Material |
| Kaserne | Exerzierplatz: Einheiten +10 % Schaden und Leben | – | Garnison: Mauer heilt 2 LP/s, Einheiten der Mitte +20 % Leben |
| Schmiede | Waffenschmiede: Schmiede-Ausbauten ×1,5 | – | Rüstkammer: Mauer +15 % Leben |

## Linien und Stufen (REQ-S.04)
Stufe 1 ab 2, Stufe 2 ab 4, Stufe 3 ab 6 Zeichen; die Boni der Stufen wirken zusammen (`LINIEN.stufen` in `config.js`).

| Linie | Stufe 1 | Stufe 2 | Stufe 3 (Soll, eigener Vorschlag) |
|---|---|---|---|
| Militär | Einheiten +10 % Schaden | Kaserne schickt je Welle einen Läufer mehr; Einheiten +10 % Leben | Einheiten +10 % Schaden und +10 % Leben |
| Wirtschaft | Materialertrag +10 % | Zinsen des Kontors +50 %; Ausbauten und Aufwertungen −20 % | Materialertrag +10 %; Zinsen +25 %; Versorgung +2 |
| Verteidigung | Türme +20 % Schaden, Mauer +15 % Leben | Turm-Abschüsse bringen Material (1,5 × EP-Wert); nach jeder abgewehrten Gegnerwelle rückt sofort eine eigene Welle aus | Gegenstoß-Wellen +30 % stärker; Türme +20 % Schaden |

**Dritte Stufe:** Die Anforderung verlangt sie, falls Stufe 2 in der Mehrzahl der Partien vor Minute 8 erreicht wird. Gemessen: Die Linien-Bots erreichen Stufe 2 in allen Partien nach 3:45 bis 5:55 Minuten; der schnelle Bot ohne Linie erreicht Militär Stufe 2 im Median nach 8:05 (87 % der Partien). Die Stufe 3 ist darum umgesetzt; ihre Werte sind mein Vorschlag (zur Bestätigung).

## Schlüsselkarten (REQ-S.06, S.07)
Sechs Karten, zwei je Linie, je zwei Zeichen, eine Stufe, kein Nachteil, ab Wahl 3 und nur, wenn die Wirkung im Spielstand etwas bewirkt. Namen weichen von den Vorschlägen ab, wo ein Name schon eine gewöhnliche Karte trägt („Drill“, „Bastion“).

| Karte | Linie | Seltenheit | Wirkung | Angeboten, wenn … |
|---|---|---|---|---|
| Drillmeister | Militär | legendär | Solange ein Exerzierplatz steht, starten alle Einheiten mit der nächsten Schmiede-Stufe | ein Exerzierplatz steht |
| Vorhut | Militär | selten | Jede eigene Welle rückt mit zwei zusätzlichen Läufern aus | die Kaserne steht |
| Handelsnetz | Wirtschaft | legendär | Jede Manufaktur erhöht den Ertrag aller anderen um 10 % (Deckel +50 %) | mindestens zwei Manufakturen stehen |
| Rücklage | Wirtschaft | selten | Der Zinsdeckel des Kontors wächst je bisheriger Kartenwahl um 15 % | das Kontor steht |
| Bollwerk | Verteidigung | selten | Türme +50 % Schaden; Turm-Abschüsse bringen doppelte EP | ein Turm ist gebaut |
| Gegenstoß | Verteidigung | legendär | Nach jeder abgewehrten Gegnerwelle rückt sofort eine eigene Welle mit +30 % Stärke aus | die Kaserne steht |

**Angebotsausgleich:** Ab Wahl 3 erscheint spätestens in jeder dritten Wahl mindestens eine Schlüsselkarte, auf einem Bonusplatz. Führt der Spieler eine Linie (mindestens zwei Zeichen), zieht deren Schlüsselkarte mit dreifachem Gewicht. Ein Bann ersetzt eine fällige Schlüsselkarte durch eine andere. Werte: `LINIEN.schluessel`.
Die zwei Zeichen einer Schlüsselkarte heben ihre Linie sofort auf Stufe 1: Das Bollwerk wirkt mit dem Bonus der Stufe 1 (Türme × 1,5 × 1,2).

## Kennzahlen: Felder vorher und nachher

Schneller Bot, 50 Partien je Feld. „Nachher“ ist der Stand dieses Berichts.

### Felder: Siegquote, Dauer, Wahlen (schneller Bot, 50 Partien je Feld) – vorher → nachher

| Grad | Profil | Siege | Niederlagen | offen (Patt) | Dauer Median | Wahlen Median |
|---|---|---|---|---|---|---|
| leicht | aktiv | 100,0 → 100,0 % | 0,0 → 0,0 % | 0,0 → 0,0 % | 10:14 → 11:02 | 8 → 9 |
| leicht | durchschnitt | 100,0 → 100,0 % | 0,0 → 0,0 % | 0,0 → 0,0 % | 11:37 → 11:30 | 10 → 10 |
| leicht | gelegentlich | 100,0 → 100,0 % | 0,0 → 0,0 % | 0,0 → 0,0 % | 14:26 → 13:34 | 12 → 12 |
| normal | aktiv | 100,0 → 100,0 % | 0,0 → 0,0 % | 0,0 → 0,0 % | 10:24 → 10:44 | 9 → 9 |
| normal | durchschnitt | 100,0 → 100,0 % | 0,0 → 0,0 % | 0,0 → 0,0 % | 11:56 → 11:49 | 10 → 10 |
| normal | gelegentlich | 98,0 → 100,0 % | 2,0 → 0,0 % | 0,0 → 0,0 % | 14:56 → 14:00 | 13 → 12 |
| schwer | aktiv | 96,0 → 100,0 % | 4,0 → 0,0 % | 0,0 → 0,0 % | 9:33 → 9:53 | 8 → 8 |
| schwer | durchschnitt | 96,0 → 74,0 % | 4,0 → 26,0 % | 0,0 → 0,0 % | 11:23 → 11:06 | 10 → 9 |
| schwer | gelegentlich | 66,0 → 40,0 % | 34,0 → 60,0 % | 0,0 → 0,0 % | 14:07 → 1:52 | 12 → 1 |

### Fabriken im Raster (Mittel von neun Plätzen; Median in Klammern) – vorher → nachher, Normal

| Profil | Minute 2 | Minute 5 | Minute 10 | Anteil an den Gebäuden, Minute 10 |
|---|---|---|---|---|
| aktiv | 7,0 (7) → 6,5 (6) | 6,0 (6) → 5,9 (6) | 5,4 (5) → 5,4 (5) | 60 → 60 % |
| durchschnitt | 6,0 (6) → 5,4 (5) | 6,1 (6) → 6,0 (6) | 5,5 (6) → 5,6 (6) | 61 → 62 % |
| gelegentlich | 3,4 (3) → 4,4 (4) | 6,1 (6) → 6,1 (6) | 5,4 (5) → 5,4 (5) | 60 → 60 % |

### Seltene und legendäre Karten je Partie (Median; Mittel in Klammern) – vorher → nachher, angeboten / gewählt

| Grad | Profil | selten angeboten | selten gewählt | legendär angeboten | legendär gewählt |
|---|---|---|---|---|---|
| leicht | aktiv | 5,0 (5,2) → 8,0 (8,9) | 0,0 (0,5) → 1,0 (1,4) | 0,0 (0,2) → 1,0 (0,7) | 0,0 (0,0) → 0,0 (0,1) |
| leicht | durchschnitt | 6,0 (5,8) → 7,0 (7,5) | 1,0 (1,0) → 1,0 (1,1) | 0,0 (0,5) → 0,0 (0,6) | 0,0 (0,1) → 0,0 (0,0) |
| leicht | gelegentlich | 9,0 (9,2) → 11,0 (11,3) | 2,0 (1,7) → 2,0 (1,9) | 0,0 (0,6) → 1,0 (0,8) | 0,0 (0,1) → 0,0 (0,1) |
| normal | aktiv | 4,0 (4,8) → 7,0 (7,2) | 1,0 (0,8) → 1,0 (0,9) | 0,0 (0,3) → 0,0 (0,6) | 0,0 (0,0) → 0,0 (0,1) |
| normal | durchschnitt | 6,0 (6,2) → 7,0 (8,2) | 1,0 (0,9) → 1,0 (1,2) | 0,0 (0,3) → 0,0 (0,6) | 0,0 (0,0) → 0,0 (0,1) |
| normal | gelegentlich | 11,0 (10,7) → 11,0 (10,7) | 2,0 (1,7) → 2,0 (1,8) | 0,0 (0,6) → 1,0 (1,0) | 0,0 (0,1) → 0,0 (0,1) |
| schwer | aktiv | 4,0 (3,6) → 6,0 (6,4) | 0,0 (0,4) → 1,0 (0,8) | 0,0 (0,3) → 0,0 (0,4) | 0,0 (0,0) → 0,0 (0,0) |
| schwer | durchschnitt | 5,0 (5,0) → 6,0 (5,4) | 1,0 (0,9) → 1,0 (0,9) | 0,0 (0,4) → 0,0 (0,5) | 0,0 (0,1) → 0,0 (0,0) |
| schwer | gelegentlich | 6,0 (5,7) → 1,0 (4,5) | 1,0 (0,8) → 0,0 (0,7) | 0,0 (0,3) → 0,0 (0,5) | 0,0 (0,1) → 0,0 (0,1) |

### Verlorene Lebenspunkte der Mauer je Partie (Mittel; Median) – vorher → nachher

| Grad | Profil | Mauer-Verlust |
|---|---|---|
| leicht | aktiv | 53 (0) → 31 (0) |
| leicht | durchschnitt | 81 (0) → 20 (0) |
| leicht | gelegentlich | 92 (0) → 67 (0) |
| normal | aktiv | 75 (0) → 66 (0) |
| normal | durchschnitt | 122 (0) → 76 (0) |
| normal | gelegentlich | 147 (32) → 53 (0) |
| schwer | aktiv | 397 (104) → 174 (109) |
| schwer | durchschnitt | 382 (115) → 836 (420) |
| schwer | gelegentlich | 561 (210) → 887 (1372) |

### Abweichung der Wahlzeit vom Fahrplan (Median − Zielzeit in Sekunden, Wahl 1, 2, 3 …)

| Feld | vorher | nachher |
|---|---|---|
| schwer / durchschnitt | -40, -65, -84, -52, -17, -13, -20, 0, -20, 0 | -40, -35, -41, -9, 0, 0, -3, 0, 0 |
| schwer / gelegentlich | -40, -66, -86, -106, -71, -37, -10, -20, 0, 0 | -40 |
| schwer / aktiv | -40, -65, -73, -39, -12, -20, -2, -5 | -40, -45, -14, 0, 0, 0, 0, 0 |
| normal / durchschnitt | -14, 0, 0, 0, 0, 0, -7, 0, 0, 0 | -14, 0, 0, 0, 0, 0, -20, 0, 0, 0 |
| leicht / durchschnitt | 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 | 0, 0, 0, 0, 0, 0, 0, -5, 0, 0 |

„gierig“ (Normal, durchschnitt, 20 Partien): Siege 100,0 → 100,0 %, Dauer Median 11:45 → 11:23, Fabriken Minute 10 5,7 → 5,7.

## Kennzahlen: Linien-Bots

### Linien-Bots (Normal, durchschnitt, 100 Partien je Zeile)

| Bot | Druck | Siege | Niederlagen | Patt | Dauer Median | Stufe 1 | Stufe 2 | Stufe 3 | Schlüsselkarten-Angebote (Median) | gewählt (Mittel) | Mauer-Verlust (Mittel) | Turm-Abschüsse | Gegenstöße |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ohne | aus | 100,0 % | 0,0 % | 0,0 % | 11:43 | – | – | – | 3 | 0,5 | 90 | 0,0 | 0,3 |
| ohne | hoch | 100,0 % | 0,0 % | 0,0 % | 11:49 | – | – | – | 3 | 0,5 | 54 | 0,0 | 0,4 |
| militaer | aus | 100,0 % | 0,0 % | 0,0 % | 12:29 | 100 % 3:10 | 100 % 3:45 | 100 % 5:55 | 3 | 1,9 | 78 | 0,0 | 0,0 |
| militaer | hoch | 100,0 % | 0,0 % | 0,0 % | 12:14 | 100 % 3:10 | 100 % 3:45 | 100 % 5:55 | 3 | 1,9 | 96 | 0,0 | 0,0 |
| wirtschaft | aus | 83,0 % | 17,0 % | 0,0 % | 15:44 | 100 % 3:11 | 100 % 5:55 | 99 % 8:05 | 4 | 1,6 | 577 | 0,0 | 0,0 |
| wirtschaft | hoch | 85,0 % | 15,0 % | 0,0 % | 15:47 | 100 % 3:11 | 99 % 5:55 | 98 % 8:05 | 5 | 1,7 | 569 | 0,0 | 0,0 |
| verteidigung | aus | 96,0 % | 2,0 % | 2,0 % | 21:52 | 100 % 3:10 | 100 % 3:45 | 100 % 5:55 | 7 | 2,4 | 1016 | 15,9 | 28,8 |
| verteidigung | hoch | 91,0 % | 2,0 % | 7,0 % | 24:06 | 100 % 3:10 | 100 % 3:45 | 100 % 5:55 | 8 | 2,5 | 1642 | 19,5 | 34,4 |

Fabriken ohne Variante am Raster (Mittel von neun Plätzen):

| Bot | Druck | Minute 5 | Minute 10 | Varianten je Partie | Anteil der Partien mit … |
|---|---|---|---|---|---|
| ohne | aus | 6,0 | 5,4 | 0,0 | – |
| ohne | hoch | 6,1 | 5,4 | 0,0 | – |
| militaer | aus | 5,9 | 5,4 | 4,1 | werkstatt 100 %, exerzierplatz 100 %, waffenschmiede 70 % |
| militaer | hoch | 5,9 | 5,5 | 4,2 | werkstatt 100 %, exerzierplatz 100 %, waffenschmiede 74 % |
| wirtschaft | aus | 0,0 | 0,0 | 6,9 | manufaktur 100 % |
| wirtschaft | hoch | 0,0 | 0,0 | 6,9 | manufaktur 100 % |
| verteidigung | aus | 6,1 | 5,5 | 5,0 | wachstube 100 %, garnison 100 %, ruestkammer 96 % |
| verteidigung | hoch | 6,2 | 5,5 | 5,2 | wachstube 100 %, garnison 100 %, ruestkammer 98 % |

Spannweite der Siegquoten der drei Linien-Bots: ohne Schalter 17,0 pp, mit `druck=hoch` 15,0 pp (Hypothese ≤ 20).

Stufen: „100 % 3:10“ heißt: in allen Partien erreicht, Median 3:10 Minuten. Die Zeitpunkte 3:10 (Stufe 1) und 3:45 (Stufe 2) ergeben sich aus dem Bot: Er wertet alle Gebäude seiner Linie auf, sobald die Aufwertung sichtbar wird (Minute 3). Der Wert „ohne“ ist der schnelle Bot ohne Linie.

## Kennzahlen: Schlüsselkarten im Paarvergleich

Linien-Bot mit und ohne die Karte (Bann), Normal, durchschnitt, `druck=hoch`, 50 Partien je Arm, gleiche Seeds.

| Karte | Linie | Siege mit | Siege ohne | Differenz | in Partien gewählt | Siege, wenn gewählt (Differenz) | Dauer Median mit / ohne |
|---|---|---|---|---|---|---|---|
| drillmeister | militaer | 100,0 % | 100,0 % | 0,0 pp | 78,0 % | 100,0 % (0,0 pp) | 12:33 / 11:58 |
| vorhut | militaer | 100,0 % | 100,0 % | 0,0 pp | 98,0 % | 100,0 % (0,0 pp) | 12:33 / 11:59 |
| handelsnetz | wirtschaft | 84,0 % | 88,0 % | -4,0 pp | 64,0 % | 81,3 % (-6,7 pp) | 15:08 / 15:22 |
| ruecklage | wirtschaft | 84,0 % | 88,0 % | -4,0 pp | 86,0 % | 81,4 % (-6,6 pp) | 15:08 / 14:22 |
| bollwerk | verteidigung | 86,0 % | 86,0 % | 0,0 pp | 100,0 % | 86,0 % (0,0 pp) | 23:11 / 24:26 |
| gegenstoss | verteidigung | 86,0 % | 78,0 % | +8,0 pp | 72,0 % | 86,1 % (+8,1 pp) | 23:11 / 25:58 |

## Bildzeit

| Einheiten | Zeichnen vorher / nachher | Tick vorher / nachher |
|---|---|---|
| 24 / 24 | 0.8 / 0.7 ms | 0.207 / 0.175 ms |
| 42 / 42 | 0.5 / 0.5 ms | 0.143 / 0.135 ms |
| 84 / 84 | 0.7 / 0.6 ms | 0.168 / 0.18 ms |

## Bilder
- Leiste „Linien“ (alle drei Linien auf Stufe 1), Varianten im Raster (Marke in der Farbe der Linie), Aktion „Aufwerten“ am Gebäude: `docs/bilder/kartenpfad4-linien-aufwertung.png`.
- Kartenwahl mit Zeichen (nach der ersten Linienstufe): `docs/bilder/kartenpfad4-karten-zeichen.png`.
- Wellenvorschau mit allen Einheiten (S.01): `docs/bilder/kartenpfad4-warteschlange.png`.

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Befund 4.2 bleibt, in anderer Gestalt.** Auf Schwer, „durchschnitt“, hängt die Partie weiter an der ersten Karte. Mit Echtes Militär in Wahl 1 gewinnen 29 von 29 Partien, mit Gelehrte 5 von 15, mit Metallverarbeitung 3 von 6; die Niederlagen fallen zwischen 1:38 und 2:25. Die Kaserne ab Start verschiebt das Problem von „keine Kaserne“ auf „kein Werfer und zwei Punkte weniger Versorgung“ (Echtes Militär gibt jetzt +2 statt +3). Das Ergebnis folgt aus zwei Entscheidungen des PO: Wissen zuerst soll ein eigener Weg sein, die Druckkurve bleibt. Optionen: (a) so lassen; Schwer ist für Geübte, „Wissen zuerst“ ein Wagnis; (b) auf Schwer in Wahl 1 immer Echtes Militär anbieten; (c) die erste Welle auf Schwer erst nach der ersten Wahl ausrücken lassen. Ich empfehle (b).
2. **Die Fabrik-Dominanz bleibt.** Bei Minute 10 stehen 5,4 bis 5,6 reine Fabriken im Raster (vorher 5,5; 60 % der Gebäude). Die Varianten wandeln ein oder zwei Fabriken um (Werkstatt, Wachstube je eine, Manufaktur alle). Das Raster füllen die Bots mit Fabriken, solange die Schmiede, die Universität und das Kontor eine Karte brauchen. Ob Menschen es anders halten, zeigt erst der Spieltest.
3. **Die Linie Verteidigung ist langsam.** Sie gewinnt 91 bis 96 %, braucht aber 22 bis 24 Minuten (Linien Militär 12:14, Wirtschaft 15:47) und bleibt in 2 bis 7 % der Partien offen. Mit `druck=hoch` fallen im Mittel 19,5 Abschüsse auf die Türme (ohne 15,9); die Mauer verliert 1.642 Lebenspunkte (ohne Schalter 1.016, der schnelle Bot ohne Linie 54). Der Gegenstoß löst 29 bis 34 Wellen je Partie aus, sie sind klein. Die Linie bietet in der Simulation Sicherheit, aber kaum Fortschritt; Stufe 2 wandelt Abwehr nur schwach in Angriff um.
4. **Die Schlüsselkarten bewirken in der Simulation wenig.** Differenz der Siegquote mit/ohne Karte: Drillmeister und Vorhut 0 pp (Militär gewinnt ohnehin 100 %), Bollwerk 0 pp, Gegenstoß +8 pp, Rücklage und Handelsnetz −4 pp (−7 pp, wenn gewählt). Die beiden Wirtschaftskarten verdrängen andere Karten und bringen Erträge, die am Versorgungslimit verpuffen. Die Obergrenze (+25 pp) ist gewahrt; ob die Karten „besonders stark“ wirken, zeigt der Spieltest.
5. **Die Wirtschaftslinie kann ihr Material nicht umsetzen.** Der Wirtschaft-Bot erzeugt das Zwei- bis Dreifache an Material (Minute 10: 45/s gegen 16/s), die Versorgung begrenzt aber die Welle (7 statt 12 Einheiten bei Minute 10). Ergebnis ohne Stufe-3-Versorgung: 83 % Siege (ohne Schalter), 77 % (`druck=hoch`), Spannweite 23 pp; die Partie dauert 15 Minuten und trifft die Belagerungswelle in Minute 16 (die meisten Niederlagen um 16:49). Mit Versorgung +2 in Stufe 3: 83 % und 85 %. Das ist die einzige Stelle, an der ich die Wirkung einer Stufe ergänzt habe (Auslegung 9).
6. **Ohne Absicht läuft ein Bot in die Linie Militär.** Der schnelle Bot ohne Linie (Pfad „Militär“) erreicht Militär Stufe 1 in allen Partien nach 4:50, Wirtschaft und Verteidigung in 52 bis 62 % nach 9 bis 10 Minuten. Das liegt an seinem Pfad (Echtes Militär, Taktik, Ballistik, Eiserne Klingen tragen Zeichen) und an den 15 Zeichenquellen der Linie; die Verteilung der Quellen ist ausgeglichen (15/14/13).
7. **Seltene Karten erscheinen häufiger, legendäre kaum.** Schneller Bot, Normal, durchschnitt: im Mittel seltene Karten angeboten 8,2 je Partie (vorher 6,2), gewählt 1,2 (0,9); legendäre angeboten 0,6 (0,3), gewählt 0,1 (0,0). Die Schlüsselkarten tragen den Zuwachs; das Gewicht der übrigen legendären Karten blieb unverändert.
8. **Schwer, „gelegentlich“, verliert jetzt in 60 % der Partien** (vorher 34 %), meist zwischen 1:38 und 2:25. Das entspricht dem Zielkorridor („verliert“), folgt aber aus demselben Mechanismus wie Auffälligkeit 1.
9. **Die Bildzeit ist unauffällig:** 0,6 ms je Bild und 0,18 ms je Logik-Takt bei 84 Einheiten (vorher 0,7 und 0,17 ms; headless, ohne Grafikkarte). Teil 4 verändert sie nicht.

## Auslegungen und Abweichungen (zur Bestätigung)
1. **Eine Variante ist ein Merkmal des Platzes, kein neuer Gebäudetyp** (weicht vom Vorschlag „`ersetzt` für Gebäudetypen“ ab). Der Platz bleibt Fabrik, Kaserne oder Schmiede (`slot.type`), die Variante steht in `slot.variant`. Ausbaustufen, Nachbarschaftsregeln, Versorgung, Voraussetzungen und Abriss laufen unverändert; ein neuer Typ hätte jede Stelle berührt, die einen Typ abfragt. Fachlich gleich: Das Gebäude wird ersetzt und behält Stufen und Regeln.
2. **Zeichen von Varianten zählen je Variantentyp einmal.** Zwei Manufakturen sind ein Zeichen; ihr Mehrertrag gilt je Gebäude. Sonst bräuchte „alles Manufaktur“ keine Karte für Stufe 2.
3. **Wirkung einer Variante: einmal je Variantentyp**, außer dem Ertrag der Manufaktur (je Gebäude).
4. **„Aufwertungen −20 % Kosten“ (Wirtschaft, Stufe 2)** gilt für die Ausbauten der Gebäude und für die Gebäude-Aufwertung; beide Werte sind getrennt einstellbar (`upgradeCost`, `variantCost`).
5. **„Einheiten am Tor“ (Garnison)** sind die Einheiten der Mitte-Lane. **„Mauer und Türme +x % Leben“ (Rüstkammer)**: Türme haben keine eigenen Lebenspunkte; die Rüstkammer erhöht die Mauer.
6. **„Kaserne bildet eine zusätzliche Einheit aus“ (Militär, Stufe 2):** je ausrückender Welle ein zusätzlicher Läufer ohne Kosten, außerhalb des Versorgungslimits, nur mit stehender Kaserne und nicht in leeren Wellen. Dasselbe gilt für die Vorhut (zwei Läufer).
7. **„Vollständig abgewehrte Gegnerwelle“:** alle Einheiten einer Gegnerwelle und ihre wartenden Nachzügler sind gefallen (je Welle, nicht „Feld leer“); Alarmeinheiten zählen nicht. Der Gegenstoß ist eine zusätzliche Welle; der regelmäßige Takt bleibt (erste Fassung: Takt beginnt neu, das verlängerte die Pausen zwischen großen Wellen).
8. **Schlüsselkarten umbenannt:** „Drill“ → **Drillmeister**, „Bastion“ → **Bollwerk**, weil beide Namen gewöhnliche Karten tragen (Drill: Angriffstempo, Bastion: Turmreichweite). Zwei Karten mit gleichem Namen verstoßen gegen die Namensregel aus Teil 3. Die Namen sind Platzhalter nach der Sprachregel.
9. **Dritte Stufe und Versorgung +2 in Stufe 3 der Wirtschaft:** Die Anforderung stellt die dritte Stufe als Soll unter Bedingung; ihre Werte hat die Anforderung nicht festgelegt. Die Versorgung ergänze ich, weil Wirtschaft ohne sie ihr Material nicht in Stärke umsetzt (Auffälligkeit 5). Ändert die PO-Tabelle nicht, ergänzt nur die Stufe 3.
10. **Schwer: Schwellen ab Wahl 2 = Fahrplan × 2** statt „leicht höher“. Gemessen (Schwer, durchschnitt, 60 Partien): Faktor 1,6 lässt Wahl 3 bei −62 s, Faktor 1,8 bei −50 s, Faktor 2 hält alle Wahlen bei höchstens −41 s. Grund: Auf Schwer zählt jeder Abschuss 1,8-fach (`xpMult`). Wahl 1 bleibt bei 43 EP (−40 s; die erste Karte muss vor der ersten großen Welle kommen).
11. **„Kurzname“ (S.01)** gab es im Code nicht. Ich lege ihn als kurze Bezeichnung an (`unit.<id>.short`) und zeige ihn im Hinweistext der Wellenvorschau.
12. **Die Nachbarschafts-Vorschau nennt keinen gesperrten Partner mehr** („Kaserne neben Schmiede“, solange die Schmiede nicht baubar ist). Die Kaserne ab Start machte das sichtbar; es verstieß gegen K2.05.
13. **Zusätzlich zur Anforderung:** Kontextkopf-Aktion „Aufwerten“ mit Erklärzeile und Tooltip, Leistenanzeige „Linien“, Hinweise je Linie und für die Aufwertung, Protokollfelder (`druck`, `lines`, `variants`, `wallHpLost`), Browserprüfung `tests/browser-l4.mjs`, Dokumentation in `CLAUDE.md`, `CHANGELOG.md`.

## Schwache Annahmen der Anforderung: Stand
| Annahme | Stand nach Teil 4 |
|---|---|
| Die implizite Linie wird bemerkt, bevor sie angezeigt wird | **Offen**; nur der Spieltest zeigt es (Testleitfaden, Frage 1). Die Anzeige erscheint mit Stufe 1; Linien-Bots erreichen sie nach 3:10, ein Spieler ohne Absicht nach etwa 5 bis 10 Minuten. |
| Varianten brechen die Fabrik-Dominanz | **Nicht bestätigt** (Auffälligkeit 2). |
| Verteidigung zahlt sich nur mit Druck aus | **Nicht bestätigt**: Auch mit `druck=hoch` kommen die Gegner kaum bis zur Mauer (Auffälligkeit 3). |
| Die Kaserne ab Start macht Schwer leichter | **Widerlegt**: Schwer, durchschnitt, gewinnt 74 % statt 96 % (Auffälligkeit 1). |
| Weniger Karten nach dem Streichen verdünnen das Angebot | **Nicht gemessen als Verdünnung**; der Bonuspool hat 38 Karten plus sechs Schlüsselkarten (vorher 41), die Angebote sind gefüllt (Tests). |
| Bots genügen als Maß | **Begrenzt**: Die Linien-Bots wählen extrem (immer die Linie). Sie zeigen Stärke und Engpässe (Versorgung), nicht, ob Menschen eine Linie wählen. |
| Platzhalternamen bleiben unkritisch | Zwei Schlüsselkarten umbenannt (Auslegung 8). |
| Bonuswerte brauchen Kalibrierung unter 25 pp je Karte | **Eingehalten** (+8 pp), die Wirkung der Karten ist eher zu schwach als zu stark. |

## Offene Punkte für den PO
1. **Schwer und „Wissen zuerst“** (Auffälligkeit 1): (a) so lassen, (b) in Wahl 1 auf Schwer immer Echtes Militär anbieten, (c) erste Welle später. Empfehlung (b).
2. **Dritte Stufe und ihre Werte** sowie **Versorgung +2 in Stufe 3 der Wirtschaft** bestätigen oder streichen (Auslegung 9).
3. **Linie Verteidigung**: mehr Fortschritt gewünscht? Ansatz: Stufe 2 gibt dem Gegenstoß +30 % Stärke (Messung mit 24 Partien: 100 % Siege ohne Schalter, Dauer 22:22, bei `druck=hoch` weiter 21 % offen; kein Gewinn an Tempo).
4. **Schlüsselkarten stärker machen?** Die Werte liegen weit unter der Grenze von 25 pp; die Beobachtung im Spieltest entscheidet.
5. **Auslegungen 1 bis 8** bestätigen, besonders 2 (Zeichen je Variantentyp), 4 (Aufwertungen = Ausbauten und Varianten) und 8 (Namen).
6. **Spieltest** nach dem Leitfaden (fünf Zusatzfragen); mit `?druck=hoch` für die Verteidigung.

## Wie nachspielen
- Basismessung und Feldmessung: `node tools/sim-p4.mjs --suite basis --runs 50 --gierigRuns 20 --json reports/…json`.
- Linien-Bots: `node tools/sim-p4.mjs --suite linien --runs 100`; Paarvergleich: `--suite schluessel --druck hoch`. Tabellen: `node tools/bericht-p4.mjs --vorher … --nachher … --linien … --schluessel …`.
- Bildzeit: `node tools/bildzeit.mjs`. Browser: `npm run test:browser` (Playwright).
- Versuche ohne Dateiänderung: `KF_OVERRIDE='{"LINIEN":{"stufen":…}}' node tools/sim-p4.mjs …`.

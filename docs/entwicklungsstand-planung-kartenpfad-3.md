# Klammerfront – Entwicklungsstand und Entscheidungen für die Planung

Stand 10.10.2026, nach Kartenpfad Teil 3. Das Dokument ist in sich abgeschlossen: Es nennt Stand, Messwerte, Befunde und die Entscheidungen, die vor dem nächsten Entwicklungsschritt fallen müssen.
Es ersetzt `docs/entwicklungsstand-planung.md` (Stand 09.10., vor Teil 3) als Einstieg; die dortigen Anhänge A bis C bleiben als Berichte von `main`, MVP und Teil 1/2 gültig.

## 0. Auftrag an Cowork (zum Einfügen vor dem Dokument)
> Du planst den nächsten Entwicklungsschritt des Browser-Spiels „Klammerfront“ für den Product Owner Nick (kein Entwickler; Deutsch, knapp, Ergebnis zuerst, schwache Annahmen offen benennen).
> Lies das folgende Dokument. Entscheide nichts aus Abschnitt 5 selbst; stelle zu jeder Entscheidung, die den Zuschnitt berührt, eine Rückfrage mit Empfehlung. Erzeuge danach ein Anforderungsdokument im Stil der bisherigen (Abschnitt 7): Ziel, nummerierte Anforderungen REQ-<Kürzel>.<nn> mit Akzeptanzkriterien, Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, Abschnitt „Schwache Annahmen und offene Punkte“.
> Fehlt eine Zahl, sag es und schlage eine Messung vor.

## 1. Auf einen Blick
| Linie | Version | Stand | Inhalt |
|---|---|---|---|
| `main` | 0.9.2 | Commit `73e1590` | Basisspiel mit Tutorial, Startbildschirm, Kartenbühne und Entdecken (an), Korrektur wirkungsloser Upgrades |
| veröffentlichter MVP | 0.9.2 | identisch mit `main` | GitHub Pages `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/` |
| Kartenbranch `exp/kartenpfad` | 0.9.2-kartenpfad-3 | Commit `aa2e2f8` (Bericht), danach nur Dokumente | Experiment: Karten steuern das Pacing. `main` 0.9.2 ist eingemischt. Nicht auf `main`, nicht im MVP |
| privater Testbuild | wie Kartenbranch | `https://claude.ai/artifact/KtUqgPYNPHyc29vDXvMbHb` | spielbar, Sitzungsprotokoll immer an, nur für den Eigentümer sichtbar (Freigabe über „Teilen“ der Seite) |

Offen auf GitHub: Das Release-Tag `v0.9.2` auf `MVP` kann nur der PO anlegen (aus der Cloud-Umgebung nicht möglich).

## 2. Das Spiel und die Arbeitsweise
Browser-Spiel zwischen *Universal Paperclips* (Klicken, Idle-Ökonomie) und *Age of War* (Lane-Kampf). Der Spieler klickt Material, baut Fabriken und Gebäude im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Abschüsse bringen Erfahrung (EP).
Jeder Stufenaufstieg bietet Spezialkarten mit bis zu drei Stufen. Die Partie ist verloren, wenn das Tor fällt, gewonnen, wenn die gegnerische Basis fällt. Drei Schwierigkeitsgrade (Leicht, Normal, Schwer).

**Modus `karten` (nur im Kartenbranch):** Am Start gibt es nur Fabrik und Läufer. Karten schalten Gebäude (Kaserne, Schmiede, Universität, Kontor), Einheiten, Ausbaustufen und Forschungen frei. Vier Kartenfamilien: Bau, Technologie (nur mit Universität), Bonus, Wagnis (Spielregel mit Nachteil).
**Modus `standard`:** alles ab Start nutzbar, Verhalten von `main`. Im Branch per `?pacing=standard` erreichbar und durch einen Test an `main` gebunden.

Arbeitsregeln, die Anforderungen beachten müssen:
- Alle Spielwerte stehen in `config.js`, alle sichtbaren Texte in `i18n/de.js` und `i18n/en.js` (Schlüssel identisch); Zufall nur über den seedbaren Generator im Spielstand.
- Features, die das Spiel im Kern ändern, entstehen zuerst im Kartenbranch (Grundsatz des PO). Ein Release entsteht nur, wenn der PO eine Iteration nach `main` freigibt; `MVP` folgt `main` per Fast-Forward.
- Fertig heißt: `npm test` (283 Tests) und `npm run test:browser` (drei Playwright-Skripte) grün, Kurzsimulation ohne offene Partie, neue Knöpfe mit Tooltip und Erklärzeile, Bericht mit Abnahmetabelle. Ändert sich die Spielstand-Version (jetzt 8), verlieren Spieler ihren Spielstand.
- Weicht eine Umsetzung von einer Anforderung ab, wird begründet und nachgefragt.

## 3. Was Teil 3 geliefert hat
Anforderung: `docs/anforderungen-kartenpfad-3.md`, Bericht: `docs/bericht-kartenpfad-3.md` (mit allen Tabellen und der Grafik).

| REQ | Inhalt | Ergebnis |
|---|---|---|
| P.01 | `main` 0.9.2 eingemischt, Wirkungsprüfung auch im Modus `karten` | erfüllt; ein Fund behoben (Wagnis „Volle Auslastung“ erschien am Versorgungsdeckel und brachte nur ihren Nachteil) |
| P.02 | Wahl-Fahrplan: zehn Wahlen in gut elf Minuten, Zielzeiten 1:30, 2:40, 3:45, 4:50 … 11:20, danach alle 65 s; Mindestabstand 45 s, Höchstabstand 100 s | Normal/durchschnitt: Median jeder Wahl 1–10 höchstens 14 s neben der Zielzeit, 100 % der Abstände zwischen 45 und 100 s. **Mit Abweichung** (Entscheidung 1) |
| P.03 | Partiedauer 10–14 min über die Lebenspunkte der gegnerischen Basis | Normal/durchschnitt Median 11:56 (vorher 10:25), 10 Wahlen, 90. Perzentil höchstens 15:41 in allen neun Feldern, Patt 0 % |
| P.04 | Angebot: 3 Karten (mit Universität 4), bis zu zwei Pfadkarten, höchstens eine Wagnis-Karte | Tabelle über 1.000 Angebote getestet; Siegquote der drei Pfad-Varianten 98/98/86 % (12 pp, Soll ≤ 15); mit Vorausschau-Bot 100/100/100 % |
| P.05 | Angebotsbedingungen für alle 41 Bonuskarten, Inventar seltener Karten, Bonuskarte „Festungsbau“ heißt im Modus `karten` „Mauerwerk“ | Bedingungen und Umbenennung fertig; Inventar liegt zur Entscheidung vor (Entscheidung 6) |
| P.06 | Messung (50 Partien je Feld), Bericht, privater Testbuild mit Protokoll je Wahl (Zielzeit und tatsächliche Zeit) | geliefert |

Nicht angefasst (laut Anforderung): Wirtschaft, Stärke der Gegnerwellen, neue Gebäude, Grafik, `main`.

## 4. Befunde
**4.1 Die Mitte der Partie bringt kaum EP.** Der Median-EP-Stand eines Referenzspielers („durchschnitt“, Normal) wächst zwischen 2:40 und 5:55 nur von 151 auf 168 EP, bis 11:20 auf 414. EP entstehen aus Abschüssen. Sobald die eigene Armee am gegnerischen Tor steht, hält die Belagerung die regulären Gegnerwellen auf; EP kommen dann in Stößen (Notaufgebot der Gegner bei zwei Dritteln und einem Drittel der Basis, Belagerungswelle in Minute 16).
Folge: Ein Takt, der auf EP-Schwellen beruht, ist nicht herstellbar. Gemessen mit Schwellen aus dem Median (wörtlich nach Anforderung): Wahl 2 um 27 s zu früh, Wahl 5 um 78 s, Wahl 10 um 96 s; der Mindestabstand von 45 s bestimmt dann den Takt. Mit hohen Schwellen und 100 s Höchstabstand: Wahl 5 um 120 s zu spät, Wahl 10 um 186 s.

**4.2 Schwer hängt an der ersten Karte.** Auf Schwer fällt das Tor nach rund zwei Minuten, wenn Echtes Militär (Kaserne) später als etwa 75 s kommt. Die erste Karte entscheidet dort die Partie. Gemessen (Schwer, durchschnitt, 50 Partien, Zwischenstand der Einstellung): erste Schwelle 64 EP → 16 % Siege, 43 EP → 86 %.

**4.3 Schwer läuft im Fahrplan voraus.** Der EP-Ertrag liegt auf Schwer über dem Normal-Niveau, auf dem die Schwellen stehen. Wahl 3 erscheint bei „durchschnitt“ 84 s zu früh, Wahl 4 bei „gelegentlich“ 106 s; sieben von zehn Wahlen kommen vor der Zielzeit. Auf Leicht und Normal sind es 11 bis 25 %.

**4.4 „Wissen zuerst“ ist kein eigener Weg.** Gelehrte (Universität) erscheint erst ab Wahl 2; in Wahl 1 stehen immer Echtes Militär und Festungsbau. Die Varianten „Militär zuerst“ und „Wissen zuerst“ wählen deshalb dieselben Karten (beide 98 % Siege, 11:55).

**4.5 Das volle Raster blockiert die Kaserne.** Wer die Fabriken auf alle neun Plätze setzt, bevor die Kaserne freigeschaltet ist, kann sie nicht mehr bauen (ohne Abriss). Der schnelle Bot tat das und gewann in „Festung zuerst“ nur 40 %; ein Hinweis oder eine Abriss-Hilfe im Spiel fehlt. Der Bot reißt jetzt eine Fabrik ab.

**4.6 EP-Karten und Hörsaal verlieren im Modus `karten` ihre Wirkung** auf den Takt: Kriegserfahrung (+30/+60 % EP), der Nachteil des Glücksritters („Stufen kosten 15 % mehr EP“), die passive EP der Forschung Hörsaal. Sie wirken nur noch für Spieler über dem Referenzniveau.

**4.7 Die Zeit trägt jetzt die Anzeige.** Das Kartensymbol in der Leiste füllt sich nach EP oder nach Zeit, je nachdem, was weiter ist („Karte in 0:42“).

**4.8 Alle Messwerte stammen von Bots.** Zwei Bots: „einheiten-zuerst“ (schnell, einfache Regeln) und „gierig“ (Vorausschau per Kopie des Spielstands, über drei Minuten Rechenzeit je „aktiv“-Partie, deshalb dort nicht gemessen). Beide wählen Pfadkarten zuerst. Menschen erzeugen EP anders, wählen Karten anders und bauen anders.

## 5. Entscheidungen
Reihenfolge nach Dringlichkeit. „Blockiert“ heißt: Der nächste Schritt lässt sich ohne Antwort nicht sauber zuschneiden.

### E1 Fälligkeit nach Fahrplan bestätigen (blockiert)
- **Stand:** Eine Wahl wird fällig bei erreichter EP-Schwelle, spätestens zur Zielzeit der Wahl, spätestens 100 s nach der letzten, frühestens 45 s nach der letzten. Die Anforderung sah nur EP-Schwellen und den Höchstabstand vor; das verfehlt den Fahrplan (Befund 4.1). Wörtliche Fassung bleibt per Schalter `zielzeitIstFrist: false` erreichbar.
- **Optionen:** (a) bestätigen; (b) wörtliche Fassung, Zeittreue entfällt; (c) EP wieder an den Takt binden, indem die EP-Quelle gleichmäßig wird (Grundsold über die Zeit; Wirtschaftsänderung, siehe E2).
- **Empfehlung:** (a). (c) erst nach dem Spieltest, weil unbekannt ist, wie Menschen EP erzeugen.

### E2 Welche Rolle haben EP im Modus `karten`? (blockiert)
- **Stand:** EP bestimmen den Takt nur für Spieler über dem Bot-Niveau (Befund 4.6). Die EP-Leiste zeigt Zeit oder EP.
- **Optionen:** (a) Ist-Zustand, EP-Karten umbauen oder streichen; (b) EP verkürzen die Wartezeit linear (zum Beispiel 1 EP = 0,3 s; bei stoßartigen EP ungleichmäßig, aber wirksam); (c) Grundsold: EP-Zufluss über die Zeit, damit Schwellen wieder tragen (ändert die Wirtschaft); (d) EP aus dem Modus entfernen, Leiste zeigt nur Zeit.
- **Empfehlung:** (a) bis zum Spieltest; danach (b) oder (d). (c) vermeiden, weil es die Wirtschaft und alle Zielkorridore verschiebt.

### E3 Eigene Schwellen je Schwierigkeitsgrad? (blockiert für Schwer)
- **Stand:** Die Anforderung verlangt gleiche Schwellen für alle Grade. Auf Schwer liegt der Fahrplan bis zu 106 s voraus (Befund 4.3). Die Basis-HP-Faktoren sind bereits je Grad verschieden (Leicht 5,5, Normal 5,5, Schwer 3,0).
- **Optionen:** (a) gleiche Schwellen lassen, Abweichung hinnehmen; (b) Schwellen je Grad (Schwer höher), Kalibrierung per Werkzeug in unter einer Stunde.
- **Empfehlung:** (b), zusammen mit E4.

### E4 Start auf Schwer: erste Karte absichern?
- **Stand:** Erste Schwelle 43 EP; erste Wahl im Median bei 0:50 (Schwer), 1:16 (Normal), 1:30 (Leicht, nach Zeit). Die Zielzeit 1:30 gilt für Normal; Befund 4.2.
- **Optionen:** (a) so lassen; (b) Echtes Militär in Wahl 1 garantieren (Pfadplatz fest); (c) auf Schwer die Kaserne als Startgebäude freigeben; (d) kleinere erste Gegnerwelle auf Schwer im Modus `karten` (berührt die Gegnerstärke).
- **Empfehlung:** (a) bis der Spieltest zeigt, ob Menschen auf Schwer die Kaserne rechtzeitig bekommen; (b) als erste Maßnahme, falls nicht.

### E5 „Wissen zuerst“ zu einem eigenen Weg machen?
- **Stand:** Befund 4.4. Ursache: Gelehrte und Metallverarbeitung erscheinen erst ab Wahl 2 (`abWahl` in `data/kartenpfad.js`).
- **Optionen:** (a) lassen, die Variante streichen; (b) `abWahl: 1` für Gelehrte und Metallverarbeitung. Dann stehen in Wahl 1 vier ziehbare Pfadkarten, zwei davon im Angebot; Echtes Militär ist nicht mehr sicher.
- **Empfehlung:** (b) nur zusammen mit E4 (b), sonst verliert Schwer an Sicherheit.

### E6 Inventar der seltenen Bonuskarten
Karten, die in unter 5 % der Angebote gewählt werden (Wahlrate der Bots, dazu Bewertung nach 45 s Vorausschau; beides misst die Bots mit). Werte sind nicht geändert, Angebotsbedingungen ergänzt.

| Karte | Ursache | Vorschlag |
|---|---|---|
| Serienbau | Wirkung zu schwach (Fabrikkosten nur für künftige Fabriken), erscheint nur bei freiem Bauplatz | Wirkung auf alle Gebäudekosten ausweiten, sonst aus dem Pool |
| Bauleitung | baut nur Fabriken, die der Spieler ohnehin baut | aus dem Pool oder alle freigeschalteten Gebäude bauen |
| Große Armee (legendär) | selten angeboten (Deckel, Nachteil Wellenabstand × 2) | behalten |
| Zeugmeister | Bot-abhängig (Auto-Kauf von Turm-Upgrades) | behalten, im Spieltest prüfen |
| Handelskontor | Zinsdeckel wirkt erst, wenn er erreicht ist | Bedingung ergänzen: erst anbieten, wenn der Deckel erreicht ist |
| Notreserve | Einmalwirkung, Bots reparieren vorher | behalten |
| Söldnerheer (legendär) | Nachteil (Produktion − 40 %) wiegt schwerer als die Wirkung | Nachteil abschwächen (Produktion × 0,8) |
| Zinnen | Mauern verlieren in der Messung selten Lebenspunkte | Wirkung anheben (+20/+40 %) oder behalten |
| Kriegserfahrung | passt nicht zum Modus (E2) | aus dem Pool oder umbauen (E2) |
| Glücksritter | Nachteil „EP-Stufen + 15 %“ ist wirkungslos; bis zu fünf Karten je Wahl ohne spürbaren Preis | anderer Nachteil (zum Beispiel Wellenabstand) oder aus dem Pool |

- **Empfehlung:** Die Vorschläge übernehmen, Kriegserfahrung und Glücksritter mit E2 entscheiden; „behalten“-Karten im Spieltest beobachten.

### E7 Hinweis bei vollem Raster
- **Stand:** Befund 4.5. Menschen haben denselben Fehlerfall wie der Bot, ohne Anleitung im Spiel.
- **Optionen:** (a) nichts; (b) Hinweis im Bauen-Reiter „Kein Platz frei: Fabrik abreißen“; (c) beim Freischalten eines Gebäudes ohne freien Platz einen Platz frei machen lassen.
- **Empfehlung:** (b), kleine Oberflächenänderung; im Spieltest prüfen, ob (a) genügt.

### E8 Angebotsgröße und Ermüdung der Bühne
- **Stand:** Das Spiel hatte 2 (mit Universität 3) Karten je Wahl; Teil 3 setzt 3 und 4 um. Mit Glücksritter erscheinen bis zu fünf. Die Bühne passt dafür ab 1024 px Fensterbreite. Zehn Bühnen in elf Minuten sind nur im Spieltest bewertbar (Bedenkzeit je Wahl im Protokoll).
- **Entscheidung:** Spieltest abwarten. Bei sichtbarer Ermüdung: Abstand vergrößern (Takt 80 s, acht Wahlen) oder Karten je Wahl senken. Beide Werte stehen in `config.js`.

### E9 Spieltest: Rahmen und Abnahmekriterien (blockiert)
- **Stand:** Alle Fahrplanwerte sind für Bots eingestellt. Der Testleitfaden (`docs/testleitfaden-kartenpfad-3.md`) liegt vor; das Protokoll (`?debug=1`, im Testbuild immer an) enthält je Wahl Zielzeit und tatsächliche Zeit, Bedenkzeit, gewählte Karte und Alternativen.
- **Zu entscheiden:** Teilnehmerzahl und Profile (Vorschlag: sechs bis acht Personen, zwei davon erfahren, Normal; zwei auf Leicht mit Tutorial; zwei auf Schwer); Abnahme (Vorschlag: Median der Abweichung je Wahl innerhalb ±30 s, höchstens jede dritte Wahl um mehr als 30 s früher als geplant, Partiedauer 10–14 min im Median, kein Teilnehmer bricht in den ersten fünf Minuten ab).
- **Empfehlung:** Den Spieltest vor Änderungen an E2 bis E5 und E8 durchführen; er entscheidet zwischen den Optionen.

### E10 Weg des Kartenpfads nach `main` (Gate)
- **Stand:** Der Modus `karten` ist spielbar und mit Bots getestet, mit Menschen nicht. Er ändert den Kern des Spiels (Freischaltung durch Karten, Takt der Wahlen, Basis-HP), darum bleibt er im Branch. Spielstand-Version 8 (ältere werden verworfen).
- **Zu entscheiden:** Kriterien für einen Release 0.10 (Vorschlag: Spieltest-Abnahme aus E9 erfüllt, E1 bis E3 entschieden, Inventar umgesetzt, Browser- und Unit-Tests grün, Modus `standard` weiter durch den Golden-Test an `main` gebunden) und ob `karten` der Standardmodus des Spiels wird oder ein wählbarer Modus im Startbildschirm.
- **Empfehlung:** Erst nach dem Spieltest. Ein wählbarer Modus im Startbildschirm hält die Linie `main` stabil.

### E11 Druckkurve der Gegnerwellen und Mitte der Partie
- **Stand:** Die Anforderung nannte die Druckkurve als eigenes Dokument („Anforderung 3“). Eingaben aus Teil 3: Die Belagerung hält die Wellen auf (Befund 4.1); die Basis hat × 5,5 (Leicht, Normal) bzw. × 3,0 (Schwer) Lebenspunkte; reguläre Wellen wachsen linear bis × 1,5 über 8 Minuten (`wellenFaktor`, `wellenAnstiegMin`); das Notaufgebot der Gegner bei zwei Dritteln und einem Drittel der Basis ist die einzige EP-Quelle in der Mitte. Die Mitte der Partie kann sich ziehen, wenn der Druck gleich bleibt.
- **Zu entscheiden:** Ob die Druckkurve der nächste Schritt ist oder der Spieltest; ob die Belagerung weiter alle regulären Wellen blockieren soll (sie macht die Mitte EP-arm und ereignislos).
- **Empfehlung:** Spieltest zuerst; die Druckkurve danach mit den Beobachtungen zur Mitte der Partie.

### E12 Kalibrierung gegen Bots oder Menschen
- **Stand:** Alle Zielkorridore (Siegquote, Dauer je Grad und Profil) stammen aus Bot-Läufen. `main` liegt auf Normal und Schwer deutlich unter den alten Zielkorridoren (Bericht MVP). Iteration 7 sollte gegen den korrigierten Bot und Spieltestdaten kalibrieren; bisher gilt „keine globale Neukalibrierung“.
- **Empfehlung:** Nach dem Spieltest die Profile „aktiv“, „durchschnitt“, „gelegentlich“ an echten Sitzungen anpassen (`tools/compare-human.mjs` ordnet Protokolle dem nächsten Bot-Profil zu), dann kalibrieren.

### E13 Release-Tag `v0.9.2` und Testbuild
- Tag `v0.9.2` auf `MVP`: nur der PO kann ihn anlegen.
- Der Testbuild ist privat. Für Tester muss der Eigentümer die Seite über „Teilen“ freigeben; die Seite wird nicht öffentlich.

## 6. Empfohlener nächster Schritt
1. **Spieltest** (Entscheidung E9) mit dem Testbuild: Takt, Wahlqualität, Ermüdung, Schwer-Start, Dauer.
2. **Kleine Korrekturen vorab**, unabhängig vom Spieltest: Inventar (E6, ohne EP-Karten), Hinweis bei vollem Raster (E7), Bedingung für das Handelskontor.
3. **Anforderung Teil 4** nach dem Spieltest, Inhalt abhängig von den Ergebnissen: E2 (EP), E3/E4 (Grade und Start), E5 (Wege), E11 (Druckkurve), danach E10 (Gate).
4. **Kalibrierung** (E12) erst mit Spieltestdaten.

Zu klären, bevor Cowork die Anforderungen zuschneidet: E1, E2, E3 und E9.

## 7. Form der Anforderungsdokumente und Randbedingungen für Cowork
- **Stil:** Titel „Anforderungen Branch Kartenpfad, Teil N: …“. Aufbau: 1. Ziel und Umfang (mit „Nicht im Umfang“), 2. Anforderungen REQ-P.nn bzw. neues Kürzel, je mit Ziel, Anforderungen und Akzeptanzkriterien (messbar: Zahl, Test, Bericht), 3. Entscheidungen des PO, 4. Inkrementplan mit Abbruchregel und Priorität bei knappem Budget, 5. „Schwache Annahmen und offene Punkte“ (Annahme, Risiko, Standard).
- **Umsetzung durch Claude Code:** je Inkrement ein Commit `P.<n>: <Inhalt>`, Bericht mit Ergebnis je REQ, Konfliktliste, Kennzahlen vor und nach der Änderung, Auslegungen zur Bestätigung. Messung: 50 Partien je Feld, gleiche Seeds.
- **Messwerkzeuge im Repository:** `tools/sim-p3.mjs` (Felder, Varianten, Bot mit Vorausschau, Bonuskarten-Bewertung), `tools/fahrplan-kalibrieren.mjs` (Schwellen ableiten und prüfen), `tools/referenzlauf.mjs`, `tools/bericht-p3.mjs` (Tabellen und Grafik). Eine Vollmessung dauert rund 25 Minuten auf vier Kernen.
- **Grenzen der Messung:** Die Bots wählen Pfadkarten zuerst; Wahlraten von Bonuskarten messen die Bots mit. „Aktiv“ lässt sich mit dem Vorausschau-Bot nicht messen (Rechenzeit). Bei Anforderungen an Menschen gehören Spieltest-Kriterien ins Akzeptanzkriterium.
- **Feste Zusagen im Code:** Modus `standard` identisch zu `main` (Golden-Test `tests/unveraendert.test.mjs`); neue Regeln des Modus `karten` dürfen den Standardmodus nicht berühren (Beispiel: Feld `wirkt` an Karten gilt nur im Modus `karten`, `requires` gilt in beiden).
- **Wichtige Stellschrauben (alle in `config.js`, Abschnitt `KARTEN`):** `fahrplan` (`ziele`, `takt`, `minAbstand`, `schwellen`, `zielzeitIstFrist`), `maxAbstand`, `basisFaktor` (je Grad), `angebot` (3/4), `pfadPlaetze`, `maxWarten`, `wellenFaktor`, `wellenAnstiegMin`.

## 8. Kennzahlen (Endmessung, schneller Bot, 50 Partien je Feld)
| Feld | Siege | Dauer Median | Dauer 90. Perzentil | Wahlen (Median) |
|---|---|---|---|---|
| Leicht · aktiv | 100 % | 10:14 | 11:27 | 8 |
| Leicht · durchschnitt | 100 % | 11:37 | 12:07 | 10 |
| Leicht · gelegentlich | 100 % | 14:26 | 15:02 | 12 |
| Normal · aktiv | 100 % | 10:24 | 11:11 | 9 |
| Normal · durchschnitt | 100 % | 11:56 | 13:20 | 10 |
| Normal · gelegentlich | 98 % | 14:56 | 15:41 | 13 |
| Schwer · aktiv | 96 % | 9:33 | 10:39 | 8 |
| Schwer · durchschnitt | 96 % | 11:23 | 11:52 | 10 |
| Schwer · gelegentlich | 66 % | 14:07 | 14:52 | 12 |

Wahlzeiten Normal · durchschnitt (Median; Zielzeit in Klammern): W1 1:16 (1:30), W2 2:40, W3 3:45, W4 4:50, W5 5:55, W6 7:00, W7 7:58 (8:05), W8 9:10, W9 10:15, W10 11:20, W11 12:12 (12:25).
Vorher (Stand nach Abgleich mit `main`, alte Regeln): Normal · durchschnitt 100 % Siege, Dauer 10:25, 9 Wahlen, Wahlzeiten unregelmäßig (1:08, 1:36, 3:28, 4:49, 5:40, 6:07, 7:59, 8:34, 9:07, 10:21); Schwer · durchschnitt 82 % Siege.
Pfad-Varianten (Normal, durchschnitt): Militär zuerst 98 %, Wissen zuerst 98 %, Festung zuerst 86 % (schneller Bot); alle 100 % (Vorausschau-Bot).

## 9. Schwache Annahmen in diesem Stand
- **Der Fahrplan trifft Menschen.** Er ist an einem Bot kalibriert; die EP-Schwellen sind ein Maximum über Bot-Läufe. Menschen können überall früher oder später liegen. Nur der Spieltest zeigt es.
- **Zehn Bühnen in elf Minuten sind ein gutes Tempo.** Unbelegt. Die Anforderung nennt das selbst als Risiko; die Werte sind einstellbar.
- **Bots als Maß für Stärke und Wahlqualität.** Die Bots wählen Pfadkarten stur zuerst und messen Bonuskarten verzerrt. Das Inventar der seltenen Karten ist deshalb ein Hinweis, kein Beleg.
- **Gleiche Schwellen für alle Grade** (Vorgabe der Anforderung) ist nach den Messungen nicht haltbar für Schwer.
- **EP als Taktgeber** war die Grundannahme der Anforderung P.02. Die Messung widerlegt sie für diesen Spielaufbau (Befund 4.1).

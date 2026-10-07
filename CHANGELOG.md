# Änderungen

## v0.9-kartenpfad – Branch `exp/kartenpfad` (Experiment, Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad.md`, Bericht `docs/bericht-kartenpfad.md`, Testleitfaden `docs/testleitfaden-kartenpfad.md`.
**Spielstand-Version 8 (vorher 7): ältere Spielstände werden mit Hinweis verworfen.**
- KP.0 Pacing-Unterbau (auch auf `main`, Standardmodus unverändert): Schalter `PACING_MODUS`, Freischaltlogik, Upgrade-Stufen mit Quelle, Einheitenersatz.
- KP.08 Tutorial-Sprache: Statthalter statt Feldherr, Wellen statt Horden, Einheiten statt Soldaten, Erfahrung statt Kriegsbeute, „aufstellen“, „bestanden“; Sprach-Audit mit Wortliste (`tools/sprachliste.mjs`, `tests/sprache.test.mjs`).
- KP.03 Kartenbühne: Wahl in der Bildmitte (Schleier, Fächer, Aufdecken, Tasten 1–9, „Später“, Stapel mit Füllstand); Reiter „Karten“ wird Sammlung mit Pfadübersicht. Spielzeit bei offener Wahl: Pause (wie bisher).
- KP.01/02/06 Modus `karten`: Start mit Fabrik und Läufer; vier Kartenfamilien (Bonus, Bau, Technologie, Wagnis); Meilenstein-Platz, Bonuskarte je Angebot, Rückstandsgewicht mit harter Grenze, Mindesttempo (180 s).
- KP.04/05 Universität als Forschungsstätte der Technologiekarten; Upgrade-Stufen mit genau einer Quelle; neue Einheiten (Reiter, Schwertkämpfer, Bogenschütze, Armbrustschütze, Katapult) als Datensätze; Einheitenersatz durch Forschung.
- KP.07 Wagnis-Karten (Glaskanonen, Volle Auslastung) und Exklusivpaar Fortgeschrittene Taktiken / Ballistik.
- KP.09 Simulation `tools/sim-karten.mjs`, Protokollformat 2 (Karte, Alternativen, Bedenkzeit, Neu ziehen, Bannen, Freischaltungen, Forschungen).
- `?pacing=standard` zeigt das Verhalten von `main` (Karten im Reiter, nichts gesperrt).

## v0.8 – Tutorial „Erste Schritte“ (Oktober 2026)
Korrektur nach Spieltest: Im Tutorial pausiert weder ein verdeckter Tab noch das Neuladen die Partie (kein „Weiter“-Klick); im freien Spiel gilt REQ-6.03 unverändert.
Teil 2 (06.10.2026, Anforderungen `docs/anforderungen-tutorial-2.md`):
- REQ-T2.01 Startbildschirm vor jeder Partie: Sprache, Schwierigkeitsgrad (Leicht „empfohlen für den Einstieg“ in der ersten Partie), Schalter Tutorial (erste Partie an,
  danach aus), „Partie beginnen“. Das Tutorial läuft auf jedem Grad. Neu `?lang=` und `?difficulty=easy|normal|hard` (überspringen den Dialog für Tests). Behebt: Teil 1 ließ
  die erste Partie ohne Dialog immer auf Leicht starten.
- REQ-T2.02/T2.03 Erzählung: Begrüßung (zwei Sprechblasen, Horden aus dem Osten), jeder Schritt mit Erzählung und Auftrag; Blasen ohne Auftrag zeigen ein Klick-Symbol.
- REQ-T2.04/T2.05 Kartenwahl als fünfter Schritt: Nach der ersten besiegten Welle hebt die Kriegsbeute die EP auf die Schwelle der ersten Kartenwahl (schwebende Zahl);
  danach Abschied mit zwei Sprechblasen, die Figur geht durch das Tor zurück.
- REQ-T2.06/T2.07 Figur ×1,2, weicht ausrückenden Einheiten aus; Sprechblasen blenden sanft ein, Auftrag fett abgesetzt.
- Sitzungsprotokoll: Sprache, Stufe, Dauer der Begrüßung, Klicks auf Sprechblasen. Hinweis „Karte“ entfällt (Erzählung ersetzt ihn).

Teil 1:
- REQ-T.01/T.02 Tutorial in der ersten Partie: Der Quartiermeister führt Fertigen und Bauen vor, danach erscheint eine Zeile mit pulsierendem
  Rahmen um das Ziel (Klickfeld, Bauplatz, Läufer-Knopf, Wellen-Countdown). Fünf Schritte: Fertigen, Bauen, Einheiten kaufen, Welle ausschicken,
  erster Sieg; dann Abschiedszeile „Bauen, rüsten, halten.“ Nichts wird gesperrt, nichts abgedunkelt; Schritte zählen unabhängig von der Reihenfolge.
- REQ-T.03 Schonfrist: Die erste Gegnerwelle der Tutorial-Partie (zwei Läufer) rückt erst aus, wenn die eigene Welle ausgerückt ist, spätestens nach 150 s.
- REQ-T.04 Start ohne Dialog auf Leicht, Knopf „Überspringen“ in der Leiste, „Tutorial wiederholen“ im Dialog „Neue Partie“, `?tutorial=1` / `?tutorial=0`.
- REQ-T.05 Erstkontakt-Hinweise: einer gleichzeitig, nie im Tutorial, schließen sich nach 8 s, eine Zeile; neu für Mauer, Türme, Schmiede, Handelskontor
  und Nachbarschaft; Hinweise zu Start und erster Welle entfallen (Tutorial). Marke „neu“ an frisch freigeschalteten Reitern, Bau-Optionen und Einheiten.
- REQ-T.06/T.07 `core.js` meldet Ereignisse (`on`), neue Dateien `tutorial.js`, `tutorial-ui.js`, `data/tutorial-steps.js`; Sitzungsprotokoll mit Schrittzeiten,
  Überspringen und Fehlklicks, Auswertung in `tools/compare-human.mjs`. Spielstand-Version unverändert (7).
- Der Dialog „Neue Partie“ scrollt bei niedrigen Fenstern; „Spiel starten“ bleibt sichtbar.

## v0.7 – Iteration 6 (30.09.2026)
- REQ-6.01 Formationen pendeln nicht mehr: Mindestverweildauer je Armeezustand, feste Plätze, gebundene Lane-Wahl (Hauptursache: beide Seiten
  tauschten in jedem Takt die Lane), gleitende Querbewegung, Totzone, weich nachgeführte Darstellung; Debug-Protokoll je Einheit.
- REQ-6.02 Angriffe versetzt: zufällige erste Angriffspause, ± 10 % Streuung, eigenes Geschoss je Wurf vom Werfer zum Ziel; Overkill-Schalter (aus).
- REQ-6.03 Reines Online-Spiel: kein Fortschritt außerhalb der Partie, Pause bei verdecktem Tab, Laden startet pausiert; Karte Nachtschicht
  wirkt jetzt in der Spätphase (+25 %/+50 % Fabrikertrag). Spielstand-Version 7.
- REQ-6.04/6.05 Kartenwahl öffnet sich automatisch (400 ms Eingabesperre, Rückkehr zum vorigen Reiter); Kaserne im Reiter Armee; Heimat-Reiter je Gebäude.
- REQ-6.06 Universität: Forschung schneller und billiger, Beschleunigen gegen Material, Hörsaal bis 35 %, Hinweis bei Abschluss, EP/s und
  Zeit bis zur nächsten Karte in der Leiste.
- REQ-6.07 Nachbarschaftsboni im 3×3-Raster mit Vorschau; Handelskontor ohne Karte baubar, gedeckelte Zinsen (Karte Handelskontor hebt den Deckel);
  „Welle vorziehen“ in der Kaserne.
- REQ-6.08 Anlauf der Gegnerwellen als Schalter (aus: Zielkonflikt, Entscheidung beim PO).
- REQ-6.09/6.10 Zweite Simulationsstrategie „einheiten-zuerst“, neue Kennzahlen; Experiment „Schwung“ entfernt; Leistungsziel ≤ 1 ms je Takt.
- REQ-6.11 Abnahmeserie mit beiden Strategien, Bericht, Testbuild mit Protokoll.
- Spieltest PO: gestrichelte Frontlinie der eigenen Armee im Marsch entfernt (REQ-5.06 meinte die gemeinsame Front aller Lanes, keine sichtbare Linie; das gemeinsame Vorrücken bleibt).

## v0.6 – Iteration 5 (29.09.2026)
- REQ-5.01 Klicks kommen an: Knöpfe werden beim Aktualisieren nicht mehr ersetzt (vorher gingen Klicks mit normaler Haltedauer verloren),
  „Fertigen“ löst beim Drücken aus, Ziehschwelle 6 px, eine Umrechnung Bildschirm → Welt; Oberfläche höchstens einmal je Bild.
- REQ-5.02 Altmetall heißt Erfahrungspunkte (EP), auch im Code. Spielstand-Version 6; alte Spielstände werden mit Hinweis verworfen.
- REQ-5.03 Oberfläche in drei Bändern (Leiste, Spielwelt, Arbeitsbereich mit Reitern und Kontextkopf); `ui.js` aufgeteilt in
  `ui.js`, `render.js`, `hud.js`, `panels.js`. Kartenwahl im Reiter statt im Dialog, Pause und Sprachwechsel in der Leiste.
- REQ-5.04 Bauen in zwei Klicks aus der Welt oder aus dem Knopfraster, vollständig per Tastatur.
- REQ-5.05 Jede Einheit wird einzeln simuliert: eigenes Ziel, eigene Abklingzeit, gleichzeitige Auflösung; Türme mit Einzelzielen.
  Die Karte Weitschuss gibt jetzt +20 % Fernkampfschaden (die Reihenregel, die sie lockerte, entfällt).
- REQ-5.06 Die Armee rückt als gemeinsame Welle vor: Marsch, Kampf, Sammeln; Nachschub schließt auf; Ausnahme Mitte; der Gegner folgt derselben Logik.
- REQ-5.07 Universität mit Forschungsbaum (13 Forschungen in vier Zweigen), neue Einheit Schildträger.
- REQ-5.08 Balancing: gegnerische Basis Leicht/Normal/Schwer 26.000/26.000/46.000, Schwer mit größerer Grundwelle und mehr EP;
  `XP_GROWTH` 1,55, Hörsaal 0,1/0,25/0,4 EP/s. Experiment „Schwung“ (aus) simuliert.
- REQ-5.09–5.11 Durchlauftest je Schwierigkeitsgrad, Sitzungsprotokoll `?debug=1`, `tools/compare-human.mjs`, Testleitfaden,
  schwebende Zahlen, verblassende Einheiten, feste Zählerbreiten. Gegenprobe `tools/einfach-bot.mjs`.

## v0.5 – Iteration 4 (29.09.2026)
- REQ-41 Wellenbefehl „Halten“ entfernt, samt Rabatt, Texten und Simulationsreihe.
- REQ-42 Formationen: gemeinsames Tempo, Reihen zu höchstens fünf Nahkämpfern, Fernkämpfer dahinter, Verschmelzen; gilt auch für Gegner.
  Anti-Patt-Regeln „Belagerung je Einheit“ und „Nachskalieren im Feld“ entfernt, Reparatur-Abklingzeit behalten.
- REQ-43 Lane-übergreifender Kampf: Unterstützung der Nachbar-Lane, Vorrang der Mitte, Rückkehr bei Gegnern in der eigenen Lane.
- REQ-44 Automatische Presse (Phase Mitte/Spät), erste Fabrik kostenlos, Versorgungslimit bis 15, Automatisierungskarten.
- REQ-45 41 Spezialkarten in fünf Kategorien mit Seltenheit (legendär: einmalig, mit Nachteil) und Synergien; eigener Takt für eigene Wellen.
- REQ-46 Neues Layout: Spielwelt links mit Reich in Draufsicht, Seitenleiste rechts mit Kontextfeld; Scrollen per Mausrad, Ziehen, Tasten und Leiste,
  Sprungknöpfe und „Front folgen“.
- REQ-47 Gestaffelte Einführung mit Hinweis je System, Option „Einführung überspringen“.
- REQ-48 Bot-Vorausschau über die Belagerungswelle, neue Kennzahlen (Karten gewählt/nicht gewählt je Stufe, Wahlraten je Kategorie und Seltenheit,
  legendäre Karten, größte Armee, erster Mauerfall, Bildzeit), Kalibrierung, Bericht in `docs/bericht-iteration-4.md`.
- Behoben: Gespeicherte Partien wurden seit v0.4 nicht geladen (Versionsprüfung).
- Spielstand-Version 5; ältere Spielstände starten neu.

## v0.4 – Iteration 3 (28.09.2026)
- REQ-11–13 Drei Lanes mit fester Formation; Basis aus Mauer oben, Tor und Mauer unten mit zwei Türmen.
- REQ-14/15 Wellen alle 20 s mit Versorgungslimit, Gegnervorschau je Lane, Wellenbefehl „Halten“.
- REQ-16/17 3×3-Raster mit Fabriken statt Fertigern; Kaserne hebt das Versorgungslimit, Schmiede mit Qualitätsstufen, Einheiten +5 % je Stufe.
- REQ-18 Spezialkarten mit Stufen I–III; neu: Maurerkolonne, Aushebung, Weitschuss, Turmkanoniere.
- REQ-19 Belagerungswelle in Minute 16 statt Eskalation.
- REQ-20 Erklärzeile an jedem Knopf, Erstkontakt-Hinweise.
- REQ-21 Neue Bots und Kennzahlen, Balancing über die Konfiguration, Bericht in `docs/bericht-iteration-3.md`.
- Entfallen: Fertiger, Eskalation, „Tor belagert“, Rekrutierung, Exerzierplatz, Große Stube, Akkordlohn.
- Neu gegen Patts: Reparatur je Abschnitt höchstens alle 5 s; Gegner im Feld wachsen mit jeder Welle mit.

## v0.3 – Iteration 2 (28.09.2026)
- REQ-04 Sprachwahl Deutsch/Englisch auf dem Startbildschirm; alle Texte in `i18n/`.
- REQ-05 Tooltips für alle Bedienelemente, einheitlicher Stil für klickbare Flächen.
- REQ-01 Bauplätze als Wahl: 5 Gebäudetypen (neu: Kaserne, Handelskontor), Abriss mit 50 % Erstattung, ruhende Upgrades.
- REQ-02 Altmetall-Stufen mit Draft (ersetzt das Zeitalter-Konzept); 12 Draft-Optionen.
- REQ-03 Spielphasen: Klickwert gedeckelt, Automatik skaliert; höchstens 10 Klicks/s.
- Altmetall wird nicht mehr ausgegeben; Mauer, Turm und Reparatur kosten Material.
- Neue Mechaniken gegen Patts: Tor-Belagerung des eigenen Aufstellpunkts, Eskalation ab Minute 16.
- Code aufgeteilt in `config.js`, `core.js`, `ui.js`, `data/`, `i18n/`; Tests mit dem Node-Test-Runner.

## v0.2 (27.09.2026)
- Drei Bauplätze (Fabrik, Schmiede, Universität), Mauer- und Turm-Upgrades, drei Schwierigkeitsgrade, Einheiten-Warteschlange.

## v0.1 (27.09.2026)
- Erster spielbarer Prototyp: Klick-Ökonomie, Lane mit Läufer und Werfer, Gegnerwellen, Speichern, Offline-Fortschritt.

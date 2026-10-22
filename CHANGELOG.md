# Änderungen

## v0.9.2-kartenpfad-11 – Branch `exp/kartenpfad`, Teil 10 und 11, Tutorial-Inkrement (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-10-11.md`, Berichte `docs/bericht-kartenpfad-10.md` und `-11.md`, Testleitfaden `docs/testleitfaden-kartenpfad-11.md`. **Spielstand-Version 14** (ältere Stände gehen verloren).
- **Technologiekarten** zeigen den Wert der Forschung (Wasserrahmen +30 %, Dampfkraft +40 %) statt `{e1}`; einstufige Karten ohne Stufenpunkt; die Leiste unter der Bühne zeigt Wirkung und Nachteil getrennt.
- **Einheitentexte:** Jeder Einheitentooltip beschreibt die Einheit (zwei Sätze), dazu „Taste“ und „Söldner“ in der Tabelle; die Ausrückregel steht im Reiter Armee.
- **Reichweiten:** Werfer 105 · Bogenschütze 137 · Armbrustschütze 168 · Katapult 189 · Geschütz 210; die Reihenfolge gilt auch mit Lange Wurfarme. Gegnerische Schützen folgen der Leiter (höchstens 140).
- **Fernkämpfer halten** (eigene und gegnerische), sobald ein Ziel in Reichweite ist, und rücken nach dem Fall des Ziels vor.
- **Rückstau:** Schwelle und Aufstieg sind getrennt (ein EP-Schub löst höchstens einen Aufstieg aus); vorläufig steilere Kosten (Wachstum 1,35, Mindestabstand 40 s, Arm C2); Stärke und Phase der Einheiten folgen einer festen Referenzkurve.
- **Flügel mit Nachbarschaftsbonus:** Schatzkammer +10 % Ertrag, Bibliothek −5 % Forschungszeit, Zeughaus +10 % Lebenspunkte neuer Einheiten, Kanzlei −15 % Kosten und Dauer der Aufwertung; je Flügel höchstens zwei Gebäude auf den an das Haupthaus angrenzenden Plätzen; Hervorhebung beim Überfahren des Haupthauses. Schalter `?fluegel=<id>` legt den ersten Flügel fest.
- **Tutorial (Modus karten):** erklärt nach der ersten Manufaktur das Haupthaus in der Mitte (zwei Sprechblasen ohne Auftrag, Rahmen auf dem Platz des Haupthauses); entfällt, wenn der Spieler schon weiter ist.
- **Entscheidungen des PO:** Gegner-Reichweite höchstens 140; Rückstau-Arm C2 gilt (Wachstum 1,35, Abstand 40 s); Ziel Nachbarschaftswert gesenkt auf 1,0.
- **Werkzeuge:** `tools/messung-v10.mjs`, `vergleich-v10.mjs`, `arme-v10.mjs`, `fluegelvergleich-v11.mjs`, `reichweiten-v10.mjs`, `einheitentabelle-v10.mjs`; Browser-Prüfungen `tests/browser-v10.mjs`, `tests/browser-w11.mjs`.

## v0.9.2-kartenpfad-8 – Branch `exp/kartenpfad`, Teil 8 und 9 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-8-9.md`, Berichte `docs/bericht-kartenpfad-8.md` und `-9.md`, Testleitfaden `docs/testleitfaden-kartenpfad-9.md`. **Spielstand-Version 13: ältere Spielstände werden verworfen.**
- **Wahltakt:** Die Leiste zeigt den Fortschritt zur nächsten Wahl und bei vollem Balken „Nächste Wahl in 0:23 · Mindestabstand“ (kein „Karte in 0:00“ mehr). Die EP-Summe steht im Tooltip. Hebel für Übertragsgrenze und abnehmenden Budgetertrag sind vorhanden, aber ausgeschaltet (Ziel „gebremst ≤ 15 %“ nicht erreicht).
- **Manufaktur** ohne Ordnungszahl; die Zahl steht in der Grenzanzeige.
- **Reichweitenleiter** der eigenen Fernkämpfer: Werfer 105 < Bogenschütze 137 < Armbrust 158 < Katapult 189 < Geschütz 231.
- **Gegner mit Bogen- und Armbrustschützen** (experimentell, `?gegnerfern=aus` schaltet ab).
- **Belagerungsgerät entfällt;** Durchbruch Stufe II gibt Basisschaden. Grenzfeste verlängert den Wellenabstand um 10 % (vorher 25 %).
- **Karten:** Nachteilszeile mit `▼` auf der Kartenfläche; Kategorie als Farbe und Symbol, Familie als Rahmen, Seltenheit als Ring.
- **Texte:** Zeichenbudgets (R3) eingehalten, Designertext und veraltete Aussagen entfernt, Begriffe vereinheitlicht („Kontor“, „Lebenspunkte“, „Abschuss“), zehn Namenskollisionen aufgelöst, Phasenanzeige und Vorschau-Platzhalter entfernt; Zahlen über Platzhalter.
- **Werkzeuge:** `tools/basis-p8.mjs`, `tools/ep-protokoll.mjs`, `tools/textbudget.mjs`, `tools/kalibrierung-p8.mjs`, `tools/texte-md.mjs` (Textübersicht `docs/texte-kartenpfad.md`).

## v0.9.2-kartenpfad-7 – Branch `exp/kartenpfad`, Teil 7 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-7.md`, Bericht `docs/bericht-kartenpfad-7.md`, Testleitfaden `docs/testleitfaden-kartenpfad-7.md`. **Spielstand-Version 12: ältere Spielstände werden verworfen.** Der Modus `standard` ist unverändert (Golden-Test `tests/unveraendert.test.mjs`).
- **Haupthaus im Mittelfeld:** steht ab Start als Gutshof, lässt sich nicht abreißen, hat keine Nachbarn; eigener Reiter „Haupthaus“. Acht Bauplätze bleiben frei.
- **Obergrenze für Manufakturen:** 3 auf dem Gutshof, 4 im Rathaus, 5 in der Residenz; jede Form aus einer Manufaktur zählt. Die Karten Stadtrecht (ab Wahl 2, spätestens Wahl 5) und Hofhaltung geben den Ausbau frei (400 bzw. 900 Material, 15 s).
- **Flügel:** Jede neue Stufe bringt einen Flügel nach Wahl, endgültig: Bibliothek (Forschung ohne Universität), Zeughaus (Qualitätsstufen 1–2 ohne Schmiede), Schatzkammer (Zinsen ohne Kontor, halber Deckel), Kanzlei (eine Karte mehr je Angebot, höchstens 4).
- **Doktrinen:** Zunftordnung senkt die Obergrenze um eins; Grenzfeste verlängert den Abstand der eigenen Wellen um 25 % (statt höchstens fünf Fabriken).
- **Neue Weiterentwicklungen:** Fernhandel (Kontor → Handelshaus mit Söldnerkompanien: 6 Läufer und 2 Werfer ohne Versorgung, 600 Material, +15 % je Kauf, 60 s Abklingzeit), Geschützguss (Schmiede → Gießerei; neue Einheit Geschütz: langsam, große Reichweite, Versorgung 2, dreifacher Schaden an der gegnerischen Basis).
- **Produktion in zwei Stufen:** Wasserrahmen (Manufaktur → Fabrik, Ertrag × 1,3, ab Wahl 3) und Dampfkraft als zweite Stufe (Fabrik → Dampffabrik, ab Wahl 8). Buchdruck, Fernhandel und Geschützguss kommen früher (ab Wahl 3) und forschen kürzer (30 s).
- **Historische Namen** im Modus karten: Manufaktur, Fabrik, Dampffabrik, Akademie, Handelshaus, Gießerei, Gutshof, Rathaus, Residenz; Mauer Palisade → Ringmauer → Bastionsmauer, Türme Wachturm → Wehrturm → Geschützturm; Fabrikmiliz heißt Bürgerwehr.
- **Zweites Exemplar** von Kaserne (ein Läufer mehr je Welle, eigene Quartiere) und Universität (weiterer Forschungsplatz), Kosten × 1,5. Schmiede und Kontor bleiben einmalig.
- **Kartenpool:** Volle Auslastung gestrichen; 42 Karten ohne Doktrinen.
- **Balancing:** Lebenspunkte der gegnerischen Basis auf Normal × 9,5 (vorher 10,5).
- **Protokoll Format 4:** Haupthaus-Stufen, Flügel, Fabrikplätze je Minute, Söldnerkompanien, Geschütze, Belegung am Ende; Aktionen `hausAusbau`, `chooseFluegel`, `hireKompanie`.

## v0.9.2-kartenpfad-6 – Branch `exp/kartenpfad`, Teil 6 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-6.md`, Bericht `docs/bericht-kartenpfad-6.md`, Testleitfaden `docs/testleitfaden-kartenpfad-6.md`. **Spielstand-Version 11: ältere Spielstände werden verworfen.** Der Modus `standard` ist unverändert (Golden-Test `tests/unveraendert.test.mjs`).
- **Fehler behoben (Zunfthaus):** Die Einschränkung einer Doktrin gilt ab der Wahl, auch für Gebäude, die schon stehen; der Sonderbau bleibt gesperrt, bis die Grenze erfüllt ist.
- **Strategielinien entfallen:** keine Zeichen, keine Linienstufen, keine Anzeige „Linien“. Die Regeln der Linienstufen sind Karten (Querverbindung, Lagerzehnt, Söldnertruppe, Rekrutenzug, Durchbruch, Plünderung); „Ausbruch“ gehört zur Doktrin Ausfall.
- **Kategorien und Synergiekarten:** Jede Karte trägt eine Kategorie (Wirtschaft, Militär, Verteidigung; Brücken zählen für zwei). Acht Synergiekarten wirken nach der Zahl der Karten einer Kategorie (höchstens acht zählen) und zeigen ihren Wert auf der Karte. Die führende Kategorie erscheint doppelt so oft; jedes Angebot enthält eine Karte einer anderen Kategorie. Pool: 38 Karten ohne Doktrinen.
- **Doktrinen:** Statt „spätestens jede dritte Wahl“ würfelt jedes Angebot ab Wahl 3 mit 15 % eine Doktrin (+15 Prozentpunkte je Angebot ohne Doktrin). Sieben neue Doktrinen (Elite, Massenaufgebot, Freihandel, Raubbau, Fabrikmiliz, Grenzfeste, Zermürbung), 13 insgesamt, höchstens zwei je Partie.
- **Weiterentwicklungen:** Dampfkraft (Fabriken werden zu Dampfmühlen: Ertrag +40 %, Klickertrag ×2) und Buchdruck (Forschungen halb so lang, Budgetkurs ×1,5) ersetzen die Grundvarianten des Gebäudes ohne Erstattung; Sonderbauten bleiben. Der Tooltip der Forschung nennt die Zahl der ersetzten Varianten.
- **Ausbauten als Karten:** Turmschule, Stachelwall, Zinsmeister (Handelskontor) und Maurerkolonne ersetzen die Ausbauten Reichweite, Feuerrate, Stachelwall, Mörtelkolonne und Kontor-Ausbau. Verbrannte Erde ist gestrichen.
- **Protokoll Format 3:** Kategorie je gewählter Karte, Karten je Kategorie, Werte der Synergiekarten, Weiterentwicklungen, p des Doktrin-Faktors je Wahl.
- **Bots und Messung:** Kategorie-Bots statt Linien-Bots; `tools/messung-p6.mjs`, `tools/bedienelemente.mjs`. Sichtbare Bedienelemente bei Minute 10: 54 / 53 (vorher 62 / 59).
- Behoben nebenbei: Pfadforschungen zeigten im Tooltip den rohen Schlüssel `research.branchOf.pfad`.
- **Debugging nach Teil 6:** Hintere Reihen großer Formationen standen außerhalb des Spielfelds (gegnerische Fernkämpfer hinter ihrer Basis, für Nahkämpfer unerreichbar); jetzt auf das Feld begrenzt, Test `tests/feldgrenze.test.mjs`. Der Fehler steckt auch in `main` (dort bisher nicht erreicht). Neue Werkzeuge `tools/testspiele.mjs`, `tools/testspiel-browser.mjs`.

## v0.9.2-kartenpfad-5 – Branch `exp/kartenpfad`, Teil 5 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-5.md`, Bericht `docs/bericht-kartenpfad-5.md`, Testleitfaden `docs/testleitfaden-kartenpfad-5.md`. **Spielstand-Version 10: ältere Spielstände werden verworfen.** Der Modus `standard` ist unverändert (Golden-Test).
- **Grundausstattung ab Start:** Fabrik, Kaserne, Schmiede, Universität, Kontor, Läufer, Werfer, Türme und alle Ausbauten gibt es ohne Karte; die Bau-Karten (auch Echtes Militär) entfallen. Die Versorgung wächst nur durch Kauf (Kaserne-Ausbau „Quartiere“, +2 je Stufe) oder Doktrin. Befestigungskunde öffnet zwei neue Forschungen (Wehrgang, Schießscharten).
- **Kartenwahl aus dem Spielfluss:** Eine Wahl wird fällig, wenn die EP die Schwelle erreichen (Kurve 70 × 1,05^(k−1)); kein Fahrplan, keine Zielzeit, kein Höchstabstand. Neue EP-Quellen: Schaden an der gegnerischen Basis (10 EP je Prozent) und vollständig abgewehrte Gegnerwellen. Normal, durchschnitt: 14 Wahlen, 13:35 Minuten, längste Lücke 89 s (Median).
- **Forschungsbudget** der Universität (0 / 25 / 50 % des Materialertrags werden zu EP, schlechterer Kurs bei höherem Anteil); der Hörsaal entfällt.
- **Sechs Doktrinen** ersetzen die Schlüsselkarten: Zunftordnung, Stiftung, Stehendes Heer, Vorstoß, Bollwerk, Ausfall; je mit Sonderbau oder Fähigkeit und bindender Einschränkung, höchstens zwei je Partie. Sonderbauten: Zunfthaus, Stiftungshaus, Heerlager, Bastion.
- **Linien neu:** Zeichen tragen nur Doktrinen (drei) und Gebäude-Varianten; Stufe 3 braucht eine Doktrin; die Stufen sind Regeln (Läufer, Schmiede-Stufe, Durchbruch; Diagonale, Lagerdeckel, Söldner; Turm-Material, Gegenstoß, Ausbruch). Grundvarianten angeglichen, neu: Zahlmeisterei, Münzschmiede.
- **Kartenpool:** 28 statt 45 Karten, Stufen mit neuem Effekt (sieben Regeländerungen); Kriegserfahrung heißt „Lehrjahre“, Glücksritter hat wieder einen EP-Nachteil.
- **Schwer** (nur Modus karten): Grundwelle 4,0 statt 3,5; Siegquote „durchschnitt“ 86 %.

## v0.9.2-kartenpfad-4 – Branch `exp/kartenpfad`, Teil 4 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-4.md`, Bericht `docs/bericht-kartenpfad-4.md`, Testleitfaden `docs/testleitfaden-kartenpfad-4.md`. **Spielstand-Version 9: ältere Spielstände werden verworfen.** Der Modus `standard` ist identisch zu `main` 0.9.2.
- **Fehler „undefined“** in der Wellenvorschau (Armbrustschütze, Katapult) behoben: Das Symbol steht jetzt je Einheit in `config.js`; Test über alle Einheiten und beide Sprachen. `main` ist nicht betroffen.
- **Start:** Die Kaserne ist ab Spielstart baubar; „Echtes Militär“ schaltet nur noch den Werfer frei (+2 Versorgung). Gelehrte und Metallverarbeitung sind ab Wahl 1 ziehbar. Schwer hat eigene, höhere EP-Schwellen: keine Wahl liegt im Median mehr als 40 s vor ihrer Zielzeit (vorher bis 84 s).
- **Kartenpool bereinigt:** Kriegserfahrung, Serienbau, Bauleitung und die Forschung Ingenieurskunst entfallen. Glücksritter verlängert den Abstand der eigenen Wellen um 25 % (statt EP-Aufschlag), Söldnerheer vermindert die Produktion nur noch auf × 0,8, das Handelskontor wird erst angeboten, wenn der Zinsdeckel erreicht ist.
- **Strategielinien Militär, Wirtschaft, Verteidigung:** Karten und Gebäude-Varianten tragen Zeichen; ab 2, 4 und 6 Zeichen einer Linie wirken die Stufen 1, 2 und 3. Die Anzeige „Linien“ erscheint erst mit Stufe 1 einer Linie, Zeichen an Karten und Varianten danach.
- **Gebäude-Aufwertung:** Fabrik, Kaserne und Schmiede lassen sich ab Minute 3 einmal zu einer Variante aufwerten (Werkstatt, Manufaktur, Wachstube; Exerzierplatz, Garnison; Waffenschmiede, Rüstkammer). Kosten das Zweifache der Baukosten, zehn Sekunden Bauzeit, das Gebäude ruht dabei.
- **Schlüsselkarten:** sechs starke Karten mit zwei Zeichen (Drillmeister, Vorhut, Handelsnetz, Rücklage, Bollwerk, Gegenstoß) ab Wahl 3; spätestens in jeder dritten Wahl erscheint eine, wenn ihre Wirkung im Spiel etwas bewirkt.
- **Testschalter `?druck=hoch`:** reguläre Gegnerwellen ab Minute 4 um ein Drittel größer (Standard aus); steht im Protokoll.

## v0.9.2-kartenpfad-3 – Branch `exp/kartenpfad`, Teil 3 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-3.md`, Bericht `docs/bericht-kartenpfad-3.md`, Testleitfaden `docs/testleitfaden-kartenpfad-3.md`. `main` 0.9.2 ist eingemischt. Spielstand-Version (8) unverändert; der Modus `standard` ist identisch zu `main` 0.9.2.
- **Wahl-Fahrplan:** zehn Kartenwahlen in gut elf Minuten (Zielzeiten 1:30, 2:40, 3:45 … 11:20, danach alle 65 s). Eine Wahl wird fällig, sobald die EP-Schwelle erreicht ist, spätestens zur Zielzeit, frühestens 45 s nach der letzten. Das Kartensymbol zeigt die Zeit bis zur nächsten Wahl. Protokoll je Wahl mit Zielzeit und tatsächlicher Zeit.
- **Partiedauer:** die gegnerische Basis hat mehr Lebenspunkte (Leicht und Normal × 4,5, Schwer × 3,0): Normal, durchschnitt endet im Median nach 11:40.
- **Angebot mit zwei Wegen:** 3 Karten (mit Universität 4); bis zu zwei davon sind Pfadkarten, der Rest Bonuskarten (höchstens eine Wagnis-Karte). Alle Bau-Karten haben gleiches Gewicht.
- **Keine wirkungslosen Karten:** Bonuskarten erscheinen nur, wenn ihre Wirkung im Spielstand etwas bewirkt (Fabrik, freier Bauplatz, Phase, Versorgung, Fernkämpfer). Die Wagnis-Karte „Volle Auslastung“ erscheint am Versorgungsdeckel nicht mehr.
- **Mauerwerk:** die Bonuskarte „Festungsbau“ heißt im Modus `karten` „Mauerwerk“, die Pfadkarte behält den Namen.

## v0.9-kartenpfad-2 – Branch `exp/kartenpfad`, Teil 2 (Oktober 2026; nicht auf `main` oder `MVP`)
Anforderungen: `docs/anforderungen-kartenpfad-2.md`, Bericht `docs/bericht-kartenpfad-2.md`, Testleitfaden `docs/testleitfaden-kartenpfad-2.md`. Spielwerte und Spielstand-Version (8) unverändert.
- Kein Dauerstapel mehr in der Bildmitte: Fortschritt zur nächsten Wahl als Kartensymbol mit Füllstand in der Ressourcenleiste.
- Kartenwahl als Ablauf: Karten fliegen aus der Leiste, decken von links nach rechts auf, die gewählte Karte fliegt zu ihrem Wirkort, der Rest zurück in den Stapel. Kartenvorderseite mit Band, Name, Symbol, einer Wirkungszeile, Stufenpunkten und Rahmen nach Seltenheit; einheitliche Rückseite.
- „Nur, was jetzt nutzbar ist“: Reiter, Abschnitte, Knöpfe und Leistenelemente erscheinen erst, wenn sie nutzbar sind; keine ausgegrauten Sperren, keine Pfadübersicht, kein „Öffnet mit“. Neue Elemente blenden ein, tragen „neu“ und lösen genau einen Hinweis aus.
- Schalter per Adresse: `?buehne=1|0`, `?entdecken=1|0`, `?vorschau=naechste`, `?zeit=lauf`. Ohne Schalter ist `standard` unverändert.
- Protokoll (`?debug=1`): Sichtbarkeitszeit und Entdeckungszeit je Element, Hover je Karte, aktive Schalter.

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

## v0.9.2 – Upgrades ohne Wirkung (09.10.2026)
Spielstand-Version (7) unverändert, Kennzahlen der Simulation praktisch unverändert (Normal, durchschnitt: 6:55 und 6:13 Minuten wie zuvor).
- **Behoben: Der Ausbau der Kaserne zeigte „Versorgungslimit 15 → 15“** und ließ sich für 4.000 Material kaufen, obwohl das Limit am harten Deckel von 15 stand (Karten, Forschung und Nachbarschaft liefern oft schon Versorgung). Am Deckel ist der Ausbau jetzt gesperrt („Versorgungslimit am Maximum“) und bucht nichts ab.
- **Ebenso:** Die Forschung „Logistik“ ist am Deckel gesperrt, und die reinen Versorgungskarten (Aushebung, Große Armee) erscheinen dort nicht mehr im Angebot, denn sie brächten nur ihren Nachteil.
- **Behoben: „Schmiede-Ausbau“ zeigte „wirkt 0,0 Prozentpunkte stärker“.** Die Forschung wirkte schon (jede Qualitätsstufe +2 statt +5 Prozent mehr Stärke), nur die Anzeige rundete den Wert weg; jetzt steht dort „2 Prozentpunkte“. Das gilt auch für die EP je Sekunde des Hörsaals (0,15 statt 0,2).

## v0.9.1 – Korrektur zu 0.9 (09.10.2026)
Nur Fehlerbehebungen, Spielwerte und Spielstand-Version (7) unverändert.
- **Behoben: Die Anzeige fror nach der zweiten Kartenwahl ein** (die Kartenwahl blieb offen, das Spiel schien zu hängen, der Quartiermeister des Tutorials verschwand nicht mehr). Ursache: ein Tippfehler in der Sortierung der Sammlung (Reiter „Karten“), der erst ab zwei verschiedenen gewählten Karten auslöste; er brach das Zeichnen der Oberfläche ab. Test `tests/browser-k2.mjs` („Regression“) wählt acht Runden nacheinander.
- **Behoben:** Das Kartensymbol Armee erschien unter Windows als blaues Emoji; Symbole werden jetzt als Text gezeichnet.
- Die Entwicklerprüfung `?dev=1` meldete die fliegenden Kartenbilder fälschlich als Knöpfe ohne Tooltip.

## v0.9.0 – Kartenbühne und Entdecken (Oktober 2026)
Anforderungen: `docs/anforderungen-kartenpfad-2.md`, Bericht `docs/bericht-ui-0.9.md`. Spielwerte, Spielregeln und Spielstand-Version (7) unverändert; ein vorhandener Spielstand bleibt erhalten.
Für Tester:
- **Die Kartenwahl ist ein Ablauf.** Die Karten fliegen aus der Leiste, decken nacheinander auf, die gewählte fliegt zu ihrem Wirkort, der Rest zurück. Jede Karte zeigt eine Zeile zur Wirkung, Stufenpunkte und den Rahmen ihrer Seltenheit; Details stehen unter den Karten. Die Ziffern 1 bis 5 wählen eine Karte. Der Fortschritt zur nächsten Wahl steht als Kartensymbol in der Ressourcenleiste.
- **Das Spiel zeigt, was jetzt nutzbar ist.** Reiter, Abschnitte und Anzeigen erscheinen erst, wenn sie etwas zu tun geben (z. B. EP nach dem ersten Abschuss, Schmiede mit der Schmiede). Neues blendet ein, trägt „neu“ und meldet sich mit einem Hinweis.
- **Behoben:** Bei gewählter Universität erschien das Fenster „Kontor-Ausbau“; in der Pause erzeugten etwa sechs Klicks noch Material.
- Zum Vergleich mit der alten Oberfläche: `?buehne=0&entdecken=0` an die Adresse hängen.
Für Entwickler:
- Neu: `stage.js`, `discover.js`; Schalter in `config.js` (`UI.kartenbuehne`, `UI.entdecken`, `ENTDECKEN`, `KARTENBUEHNE`); `core.js` kennt nur `KARTENBUEHNE.zeit`. Messung `tools/sichtbar-mass.mjs`; Tests `tests/k2.test.mjs`, `tests/browser-k2.mjs`.

## v0.8.1 – MVP zum Teilen (07.10.2026)
Anforderungen: `docs/anforderungen-mvp-release.md`, Bericht `docs/bericht-mvp-release.md`. Spielwerte und Spielstand-Version (7) unverändert; ein vorhandener Spielstand bleibt erhalten.
Für Tester:
- **Ruhigere Sprache im Tutorial.** Du wirst als „Statthalter“ angesprochen, der Quartiermeister erklärt in sachlichem Ton: aus „Horden“ werden „Wellen“, aus „Soldaten“ „Einheiten“, aus „Kriegsbeute“ „Erfahrung“; Einheiten werden „aufgestellt“, die erste Welle ist „bestanden“. Deutsch und Englisch.
- **Keine Verbindung ins Netz mehr außer dem Spiel selbst.** Die Schriften kommen aus dem System statt von Google Fonts; das Aussehen kann auf manchen Geräten leicht abweichen.
- **Spieltests:** Mit `?debug=1` erfasst das Protokoll je Kartenwahl die gewählte Karte, die Alternativen, die Bedenkzeit sowie Neu ziehen und Bannen (Protokollformat 2; ältere Protokolle bleiben lesbar). Ohne `?debug=1` gibt es keinen Protokollknopf und keine Testschnittstelle.
Für Entwickler:
- Sprach-Audit (`tools/sprachliste.mjs`, `tests/sprache.test.mjs`): Tutorial-Texte dürfen keine Wörter der Liste enthalten.
- Der Simulations-Bot hielt bei vollem Raster Material zurück und kaufte keine Einheiten; behoben (`tests/bot-raster.test.mjs`). Golden-Test und Vergleichsbasis neu (`tools/vergleichsbasis.mjs`, `reports/vergleichsbasis-*`): Partien des Bots sind im Mittel kürzer; die Spielregeln haben sich nicht geändert.

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

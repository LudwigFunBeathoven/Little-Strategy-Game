# Anforderungen Branch Kartenpfad, Teil 10 und 11: Nacharbeiten zu Teil 8 und 9, Haupthaus als Nachbar

Stand: 21.10.2026 · Product Owner: Nick · Planung: Cowork · Umsetzung: Claude Code

- Branch `exp/kartenpfad`, Ausgangsstand nach Teil 9.
- Ablage: `docs/anforderungen-kartenpfad-10-11.md`. Ersetzt `anforderungen-kartenpfad-10.md` vom selben Tag.
- Kürzel: Teil 10 REQ-K10, Commits `V.<n>`; Teil 11 REQ-K11, Commits `W.<n>`.
- Teil 11 beginnt nach Teil 10. Die Endmessung von Teil 10 ist die Basismessung von Teil 11. Greift keine Abbruchregel, setzt Claude Code ohne eigene Freigabe fort.

## 1. Ziel und Umfang

**Teil 10** behebt, was der PO nach Teil 8 und 9 beobachtet hat: offene Platzhalter auf Karten, Einheitentooltips ohne Aussage zur Einheit, zu hohe Reichweiten, Fernkämpfer, die weiter vorrücken, statt aus maximaler Reichweite zu kämpfen, ein Rückstau mehrerer Stufenaufstiege.

**Teil 11** gibt den Flügeln des Haupthauses Nachbarschaftsboni. Damit ist die PO-Entscheidung aus Teil 7 (K7.02: „Haupthaus ohne Nachbarschaft“) teilweise aufgehoben. Hypothese aus dem Bericht Teil 7: Das gesperrte Mittelfeld kostet den Fabrikketten Nachbarschaftswert und trägt zu den Patts bei.

Nach diesem Durchgang folgt der Spieltest mit Menschen. Die Spielregeln im Modus `standard` bleiben unverändert (Golden-Test).

**Nicht im Umfang:** weitere Textkürzung und die elf R6-Ausnahmen (erst nach dem Spieltest); Obergrenze der Manufakturen (bleibt 3/4/5, Entscheidung nach dem Spieltest); Druckkurve, Phasenmechanik, Belagerung, Epochen; Nachbarschaftsboni an das Haupthaus; neue Karten oder Einheiten.

## 2. Anforderungen

### Teil 10

#### REQ-K10.01 Offene Platzhalter und leere Zeilen auf der Kartenfläche
Befund: Wasserrahmen zeigt „Manufaktur → Fabrik: Ertrag +{e1} %“. Vermutete Ursache: Teil 9 hat feste Zahlen nach R6 in Platzhalter umgewandelt; bei Pfadkarten gehört der Wert zur Pfadforschung (`kp.res.wasserrahmen`) und wird nicht eingesetzt. Das Sprach-Audit prüfte mit Beispielwerten.
- Alle sichtbaren Texte des Modus karten zeigen die tatsächlichen Spielwerte: Wasserrahmen +30 %, Dampfkraft +40 %. Der Wert kommt aus der Forschung. V.0 listet alle betroffenen Schlüssel.
- Leere Zeilen werden nicht dargestellt. Der Punkt unter der Wirkungszeile der Karte Wasserrahmen entfällt, wenn er keine Information trägt.
- Prüfen: Unter der Kartenbühne erscheint beim Überfahren einer Karte der alte Langtext mit „Nachteil: …“ als Fließtext (Karte Alles auf die Mitte). Ist die Leiste beabsichtigt, folgt sie R1 und R2; sonst entfällt sie.

Akzeptanz: [Bot] Browser-Test über den echten Darstellungsweg: alle Karten aller Familien und Stufen, alle Tooltips von Gebäuden, Einheiten, Forschung und Flügeln, je Sprache; `{` oder `}` lassen den Test fehlschlagen. [Bot] Bildschirmfotos Wasserrahmen und Dampfkraft. [Mensch] Kein offener Platzhalter in Nicks Partie.

#### REQ-K10.02 Einheitentexte
Befund: Jeder Einheitentooltip beginnt mit derselben Ausrückregel (`tip.unit.body`).
- Je Einheit ein Text `unit.<id>.desc` aus zwei Sätzen: (1) was die Einheit ist, (2) Stärken und Schwächen. Budget höchstens 140 Zeichen je Sprache.
- Die Wertetabelle bleibt: Rolle, Lebenspunkte, Schaden, Reichweite, Kosten. Die Taste steht als eigene Zeile „Taste“; Söldner erhalten die Zeile „Söldner, keine Versorgung“.
- Die Ausrückregel steht einmal im Reiter Armee (`tip.tab.army` oder eine Zeile im Arbeitsbereich), mit dem Versorgungslimit als Zahl.
- Stärken und Schwächen folgen aus dem Rang der Einheit bei Lebenspunkten, Schaden, Reichweite, Tempo und Kosten. Widerspricht ein Entwurf aus Anhang A den Werten, gelten die Werte.

Akzeptanz: [Bot] Test: jede Einheit des Modus karten hat einen Text, Budget eingehalten. [Bot] Bericht: Tabelle je Einheit mit Aussage und belegendem Wert. [Bot] Suchtest: `tip.unit.body` erscheint im Modus karten nicht mehr im Einheitentooltip. [Mensch] Nick kann nach dem Lesen sagen, wofür die Einheit gut ist.

#### REQ-K10.03 Reichweiten
Anker bleibt die heutige Grundreichweite des Werfers R_W. Multiplikatoren:

| Einheit | Teil 8 | Teil 10 |
|---|---|---|
| Werfer | 1,0 | 1,0 |
| Bogenschütze | 1,3 | 1,3 |
| Armbrustschütze | 1,5 | 1,6 |
| Katapult | 1,8 | 1,8 [Vorschlag Cowork] |
| Geschütz | 2,2 | 2,0 |

- V.0 dokumentiert absolut: R_W, Grundreichweite eigener und gegnerischer Türme, Länge einer Lane. Außerdem die Herkunft der im Tooltip angezeigten Geschützreichweite von 231 (welche Ausbauten oder Karten, wie gestapelt).
- Ausbauten und Karten mit Reichweite behalten ihre Wirkung. Die Reihenfolge der Leiter gilt auf allen Stufen.
- Gegnerische Bogen- und Armbrustschützen folgen derselben Leiter.
- Die Bedingung aus K8.06 bleibt: Gegnerische Fernkämpfer reichen nicht über die Grundreichweite der eigenen Türme hinaus. Mit K10.04 wird sie tragend.

Akzeptanz: [Bot] Tabelle der Reichweiten vorher und nachher, absolut und relativ, einschließlich Türme und Lane-Länge. [Bot] Test der Reihenfolge mit allen reichweitenwirksamen Ausbauten und Karten. [Bot] Test: kein gegnerischer Fernkämpfer überschreitet die Grundreichweite der eigenen Türme. [Mensch] Nick empfindet die Reichweiten als passend.

#### REQ-K10.04 Fernkämpfer kämpfen aus maximaler Reichweite
Gilt für Werfer, Bogenschütze, Armbrustschütze, Katapult und Geschütz.
- **Halten:** Ein Fernkämpfer bleibt stehen, sobald ein gültiges Ziel (Einheit, Mauer, Tor, Basis) in Reichweite ist, und feuert aus dieser Entfernung.
- **Nicht vorrücken:** Solange ein Ziel in Reichweite ist, rückt er nicht weiter vor.
- **Weiterziehen:** Fällt das Ziel und ist kein weiteres in Reichweite, rückt er vor, bis das nächste Ziel in Reichweite kommt.
- **Kein Zurückweichen:** Nähert sich ein Gegner, hält er seine Stellung.
- Nahkämpfer bleiben unverändert. Das Verhalten gilt für eigene und gegnerische Fernkämpfer [Vorschlag Cowork].

Folgen, die V.0 und V.4 prüfen und berichten: Formationen trennen sich in vorrückende Nahkampfreihe und haltende Fernkampfreihe; Folgen für Formationsboni (Kriegstrommeln, Schildwall), das Nachrücken in die Mitte (`log.midRefill`) und den Armeezustand in der Ressourcenleiste. Kein Umbau dieser Systeme. Eigene Geschütze bleiben vor der gegnerischen Basis stehen; liegt ihre Reichweite über der Grundreichweite gegnerischer Türme, beschießen sie die Basis unangreifbar. Zu berichten, nicht zu korrigieren („Geschütze gegen Türme“).

Akzeptanz: [Bot] Unit-Test: Ein Fernkämpfer hält im Abstand seiner Reichweite (Toleranz 5 %) zu Einheit, Mauer und Basis, rückt nach dem Fall des Ziels vor und weicht nicht zurück. [Bot] Simulation (Kategorie-Bots, Normal, durchschnitt; Verteidigungs-Bot zusätzlich mit `?druck=hoch`): Siegquote, Patt, Mauerverlust, Dauer vorher/nachher; Ziel: Patt steigt um höchstens 1 Prozentpunkt. [Bot] Kurze Bildfolge einer Lane mit haltenden Fernkämpfern. [Mensch] Nick sieht Fernkämpfer aus maximaler Reichweite kämpfen.

#### REQ-K10.05 Rückstau der Stufenaufstiege (Experiment)
Befund: Die Kartenbühne meldete „5 weitere Stufenaufstiege“, also sechs offene Wahlen hintereinander.

Schritt 1, Diagnose (V.0): Wann entsteht der Rückstau, welche EP-Quelle treibt ihn? Greifen Übertragsgrenze und Mindestabstand wie in K8.02? Kandidaten: mehrere Stufen in einem Takt durch einen EP-Schub (abgewehrte Welle, Basisschaden, Freihandel, Lagerzehnt) oder der Übertrag wird nur einmal je Takt gekappt. Ein Programmfehler wird in allen Armen behoben; ein EP-Schub löst dann höchstens einen Aufstieg aus.

Schritt 2, Experiment (V.5). Der PO gibt Balancing-Werte frei, auch den Mindestabstand. Arme, je 50 Partien je Feld, gleiche Seeds:

| Arm | Inhalt |
|---|---|
| A | Steilere Kostenkurve: Kosten je Stufe wachsen geometrisch; Faktor kalibrieren |
| B | Dynamischer Anstieg: Wird eine Stufe schneller als ein Referenzabstand erreicht, steigen die Kosten der nächsten Stufe zusätzlich, begrenzt auf einen Höchstfaktor |
| C | Arm A mit Mindestabstand 40 s statt 45 s |
| D | Arm B mit Mindestabstand 40 s statt 45 s |

Auswahlregel: Gewählt wird der Arm, der alle Kriterien erfüllt; erfüllen mehrere, gewinnt der mit den wenigsten Parametern; erfüllt keiner, gilt die Abbruchregel.

Akzeptanz: [Bot] Befund zur Ursache im Bericht. [Bot] In mindestens 90 % der Partien nie mehr als eine offene Wahl, in keiner Partie mehr als zwei (alle Bots, Normal, durchschnitt). [Bot] Bot ohne Kategorie, Normal, durchschnitt: 12–16 Wahlen, 13–17 min. [Bot] Profil „aktiv“ mehr Wahlen je Minute als „durchschnitt“, dieses mehr als „gelegentlich“. [Bot] Variationskoeffizient der Abstände zwischen Wahlen je Partie im Median mindestens 0,25. [Bot] Tabelle aller Arme im Bericht, auch der verworfenen. [Bot] Unit-Test: Ein EP-Schub über mehrere Stufen erzeugt genau einen Aufstieg. [Mensch] Kein Rückstau mehrerer Wahlen in Nicks Partie.

#### REQ-K10.06 Stabiler Browser-Test
Befund: `tests/browser-check.mjs` schwankt in „Abschied 1“ und „Abschied 2“. Ursache klären; Wartezeiten nach Uhr durch Wartebedingungen auf einen Zustand ersetzen. Akzeptanz: [Bot] Zehn aufeinanderfolgende Läufe grün, je Sprache.

#### REQ-K10.07 Abschluss Teil 10
Messung wie in Teil 8 nach V.6 (zugleich Basismessung von Teil 11). Bericht `docs/bericht-kartenpfad-10.md`; Stand in `docs/STAND-kartenpfad.md`. Spielstand-Version erhöhen, falls sich das Format ändert. Akzeptanz: [Bot] Golden-Test, Unit-Tests und Browser-Prüfpunkte grün.

### Teil 11

#### REQ-K11.01 Nachbarschaftsboni der Flügel
- **Nachbarn:** Jeder gewählte Flügel gibt einen Bonus an die orthogonal angrenzenden Bauplätze des Mittelfelds. Mit Querverbindung zählen auch die diagonalen.
- **Grenze:** Je Flügel profitieren höchstens zwei Gebäude. Querverbindung erweitert den Kreis, nicht diese Grenze.
- **Bauordnung** multipliziert den Bonus wie alle anderen Nachbarschaftsboni.
- **Kein Bonus an das Haupthaus.** Der Gutshof hat keinen Flügel. Die beiden Flügel der Residenz wirken unabhängig voneinander.
- **Kein Bonus an das ersetzte Gebäude.**
- **Datenmodell:** Der Bonus ist eine Eigenschaft des Flügels in den Daten. Künftige Epochen ergänzen neue Flügel ohne Sonderlogik.

Vorgabewerte [Vorschlag Cowork, Kalibrierung in W.3/W.4]:

| Flügel | Ersetzt teilweise | Bonus an angrenzende | Vorgabe |
|---|---|---|---|
| Schatzkammer | Kontor | Manufakturen: Ertrag | +10 % je Manufaktur |
| Bibliothek | Universität | Manufakturen: Forschungszeit | −5 % je Manufaktur |
| Zeughaus | Schmiede | Kaserne: Lebenspunkte neuer Einheiten | +10 % |
| Kanzlei | Universität (Kartenzahl) | alle Gebäude: Kosten und Dauer der Aufwertung zur Variante | −15 % |

Kein Flügel erzeugt EP. Akzeptanz: [Bot] Tests je Flügel: Bonus, Grenze von zwei Gebäuden, Querverbindung, Bauordnung, kein Bonus an Haupthaus und Gutshof. [Bot] Test: Boni über die Flügeldaten definiert; ein neuer Testflügel ohne Codeänderung.

#### REQ-K11.02 Bot-Regeln
Bots stellen das Gebäude, das ihr Flügel stärkt, bevorzugt neben das Haupthaus. Flügelwahl der Bots wie Teil 7. Für K11.04 lässt sich der erste Flügel erzwingen (`?fluegel=<id>`). Akzeptanz: [Bot] Test der Platzierungsregel; Bericht über die Belegung der Nachbarplätze am Partieende je Bot.

#### REQ-K11.03 Anzeige
Tooltip des Haupthauses und Reiter Haupthaus nennen je Flügel Bonus und begünstigte Plätze. Beim Überfahren des Haupthauses werden die begünstigten Plätze hervorgehoben. Die Nachbarschaftszeilen (`nb.gets`, `nb.gives`) führen den Flügel als Geber. Texte nach R3, Platzhalter mit echten Werten. Akzeptanz: [Bot] Bildschirmfotos Rathaus mit einem Flügel, Residenz mit zwei Flügeln, je mit Hervorhebung. [Mensch] Nick erkennt ohne Erklärung, welche Plätze ein Flügel stärkt.

#### REQ-K11.04 Wirkung und Kalibrierung
Basis ist die Endmessung von Teil 10. Akzeptanz (alle [Bot]): Nachbarschaftswert der Manufakturen beim Wirtschafts-Bot am Partieende im Median ≥ 2,5 (Teil 6: 3,60; Teil 7: 1,44). Patt-Quote ohne Schalter (Bot ohne Kategorie, alle Felder) ≤ 1,5 % (Teil 7: 2,4 %); mit `?druck=hoch` ≤ 3 % (Teil 7: 4,0 %); liegt die Basis schon darunter, darf sie nicht steigen. Siegquote Wirtschafts-Bot, Normal, durchschnitt ≥ 96 % (Teil 7: 90 %). Bot ohne Kategorie: 12–16 Wahlen, 13–17 min bleiben erfüllt. Kein dominanter Flügel: Paarvergleich mit erzwungenem ersten Flügel, Spannweite der Siegquoten je Bot ≤ 10 Prozentpunkte; kein Flügel ist für alle vier Bots die schnellste Wahl.

#### REQ-K11.05 Abschluss Teil 11 und Vorbereitung des Spieltests
Bericht `docs/bericht-kartenpfad-11.md` mit Vorher-nachher-Tabellen. Testleitfaden `docs/testleitfaden-kartenpfad-11.md` (Teil 7 bis 11; Fragen zu Kartenwahl-Rhythmus, Einheitentexten und Reichweiten, Verhalten der Fernkämpfer, Flügelwahl und Platzierung, Lesbarkeit bei 375 px). `docs/texte-kartenpfad.md` neu erzeugen. Privater Testbuild. Akzeptanz: [Bot] Golden-Test, Unit-Tests und Browser-Prüfpunkte grün.

## 3. Entscheidungen des PO
1. Technologiekarten zeigen den tatsächlichen Wert (Wasserrahmen: +30 %).
2. Einheitentooltips: ein Satz zur Einheit, einer zu Stärken und Schwächen; die Ausrückregel entfällt dort.
3. Reichweiten: Werfer bleibt Anker, nur die Multiplikatoren sinken (1,0 / 1,3 / 1,6 / 2,0).
4. Fernkämpfer kämpfen aus maximaler Reichweite und rücken nicht weiter vor.
5. Gegen den Rückstau darf mit Balancing-Werten experimentiert werden: dynamischer Anstieg der EP je Stufe und/oder Mindestabstand 40 s.
6. Flügel des Haupthauses erbringen Nachbarschaftsboni.
7. Diese Runde umfasst Teil 10 und Teil 11. Danach folgt der Spieltest.
8. Weitere Textkürzung und die R6-Ausnahmen erst nach dem Spieltest.

Vorschläge von Cowork, die der PO noch bestätigen kann: Katapult 1,8; Fernkampfverhalten auch für den Gegner; Zielwerte für Rückstau und Variationskoeffizient (K10.05); Flügelboni und Grenze von zwei Gebäuden (K11.01); Zielwerte K11.04.

## 4. Inkrementplan mit Abbruchregel
Teil 10: V.0 Diagnose (K10.01, K10.03–K10.05) · V.1 Platzhalter, leere Zeilen, Leiste, Darstellungstest · V.2 Einheitentexte · V.3 Reichweiten · V.4 Fernkampfverhalten · V.5 Rückstau-Experiment, Auswahl des Arms · V.6 Browser-Test · V.7 Messung, Bericht.
Teil 11: W.1 Boni, Datenmodell · W.2 Bot-Regeln, `?fluegel` · W.3 Anzeige · W.4 Messung, Kalibrierung, Flügelvergleich · W.5 Bericht, Testleitfaden, Testbuild.

Abbruchregeln:
- *Fernkampfverhalten (V.4):* Steigt die Patt-Quote um mehr als 1 Prozentpunkt, wird das berichtet und nicht über andere Hebel wegbalanciert; das Verhalten bleibt aktiv, der PO entscheidet. Brechen Formationsboni funktional, wird das berichtet; kein Umbau.
- *Rückstau (V.5):* Erfüllt kein Arm alle Kriterien, wählt Claude Code vorläufig den Arm mit dem geringsten Rückstau, markiert die Wahl als vorläufig und setzt mit Teil 11 fort. Der Mindestabstand sinkt nicht unter 40 s.
- *Kalibrierung (W.4):* Erreicht die Patt-Quote nach höchstens drei Kalibrierschritten ihr Ziel nicht, stoppt die Kalibrierung; Bericht mit Zahlen. Die Obergrenze wird nicht verändert.
- *Flügelvergleich (W.4):* Ist ein Flügel für alle Bots dominant und lässt sich das nicht über seinen Wert beheben, wird das berichtet.
- *Immer:* Ein roter Golden-Test schließt jedes Inkrement aus.

## 5. Schwache Annahmen und offene Punkte
1. Platzhalter: Ursache aus dem Screenshot erschlossen; V.0 bestätigt sie.
2. Reichweite 231: Herkunft unklar; enthält sie Ausbauten, liegt die Grundreichweite niedriger als angenommen.
3. Arm B koppelt die Kosten an den Zeitabstand; zu stark eingestellt liefert er Karten im festen Takt (Zeitautomatismus). Die Schwelle 0,25 ist gesetzt, nicht hergeleitet.
4. Fernkampfverhalten kann Patts erhöhen; gegen Mauern hängt die Verteidigung an der Bedingung aus K10.03.
5. Flügelboni sind Schätzungen; die Kanzlei könnte die schwächste Wahl sein.
6. Bots platzieren nach Regeln; ob Menschen die Plätze neben dem Haupthaus nutzen, zeigt erst der Spieltest.
7. Der Bericht Teil 8 lag Cowork nicht vor.

## Anhang A: Entwürfe der Einheitentexte (gegen die Werte prüfen)
| Einheit | Entwurf |
|---|---|
| Läufer | Leichter Nahkämpfer, billig und schnell aufgestellt. Stark in der Masse, einzeln rasch geschlagen. |
| Werfer | Wirft aus der zweiten Reihe. Trifft auf Abstand, hält im Nahkampf wenig aus. |
| Schwertkämpfer | Nahkämpfer mit Eisenwaffen. Mehr Schaden und Lebenspunkte als der Läufer, dafür teurer. |
| Schildträger | Zäher Nahkämpfer für die erste Reihe. Hält viel aus, ist langsam und bremst die ganze Armee. |
| Bogenschütze | Fernkämpfer mit größerer Reichweite als der Werfer. Wirksam hinter einer Nahkampfreihe, ohne Schutz verwundbar. |
| Armbrustschütze | Fernkämpfer mit hoher Durchschlagskraft. Reicht weiter als der Bogen, kostet mehr. |
| Reiter | Schneller Nahkämpfer. Erreicht die Front als Erster, ist teuer. |
| Katapult | Wurfmaschine mit großer Reichweite. Stark gegen Formationen, schwach auf kurze Distanz. |
| Geschütz | Schwere Waffe der Gießerei. Größte Reichweite und dreifacher Schaden an der Basis; langsam und im Nahkampf wehrlos. |

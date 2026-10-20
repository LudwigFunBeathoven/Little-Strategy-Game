# Anforderungen Branch Kartenpfad, Teil 8 und 9: EP-Pacing, Reichweiten, Kartenbereinigung und Text

Stand: 20.10.2026 · Product Owner: Nick · Planung: Cowork · Umsetzung: Claude Code

- Branch `exp/kartenpfad`, Ausgangsstand v0.9.2-kartenpfad-7, Spielstand-Version 12.
- Ablage: `docs/anforderungen-kartenpfad-8-9.md`.
- Kürzel: Teil 8 REQ-K8, Commits `T.<n>`; Teil 9 REQ-K9, Commits `U.<n>`.
- Reihenfolge: Teil 9 beginnt nach Abschluss von Teil 8, weil die Texte dann die neuen Werte beschreiben. Greift in Teil 8 keine Abbruchregel, setzt Claude Code direkt mit Teil 9 fort.

## 1. Ziel und Umfang

**Teil 8** behebt Schwächen, die einen Spieltest mit Menschen verzerren würden:
- Ab der zweiten Partiehälfte taktet der Mindestabstand von 45 s die Kartenwahl, nicht mehr der Spielfluss.
- Fernkampfeinheiten unterscheiden sich kaum in der Reichweite.
- Die Karte Belagerungsgerät ist schwächer als ihr Nachteil.
- Die Doktrin Grenzfeste kostet 24 Prozentpunkte Siege (Bericht Teil 7).

**Teil 9** reduziert den Text und macht ihn tragfähiger. Prüffrage: Erfasst der Spieler eine Karte samt Nachteil in wenigen Sekunden?

Beide Teile gelten nur im Modus `karten`. Die Spielregeln im Modus `standard` bleiben unverändert (Golden-Test `tests/unveraendert.test.mjs`). Textkorrekturen an gemeinsamen Schlüsseln sind erlaubt, wenn der Text auch im Modus `standard` richtig bleibt (Namenskollisionen, Designertext). Modusspezifische Inhalte laufen wie bisher über das Suffix `.karten`.

**Nicht im Umfang**
- Mechanik der Spielphasen (automatische Presse, Gegnerwachstum je Minute, Belagerungswelle) und Druckkurve der Gegner. Teil 9 entfernt nur die Phasenanzeige.
- Nachbarschaftsboni der Flügel; Entscheidung über die Obergrenze 3/4/5 oder 4/5/6.
- Nachkalibrierung von Leicht (Bericht Teil 7, offener Punkt 4).
- Zweites Exemplar von Kaserne und Universität; Geschütze gegen Türme (Auslegung 11).
- Mehrfachbau weiterer Gebäude.
- Epochen (Age-up), historische Namen für Einheiten.

## 2. Anforderungen

### Teil 8

#### REQ-K8.01 Basismessung und EP-Diagnose

Messung vor jeder Änderung (T.0), aufgebaut wie in Teil 7: Bot ohne Kategorie in allen Feldern, Kategorie-Bots auf Normal und Schwer, 50 Partien je Feld, gleiche Seeds.

Zusätzliche Kennzahlen:
- EP je Quelle (Abschüsse, Basisschaden, abgewehrte Wellen, Forschungsbudget, Lagerzehnt, Sonstige), kumuliert bei Minute 5, 10 und 15.
- Für jeden Stufenaufstieg: Zeitpunkt, Wartezeit am Mindestabstand (wie lange der Balken voll stand, bevor die Wahl erschien) und EP-Übertrag in die nächste Stufe (Anteil der Stufenkosten).
- Anteil gebremster Wahlen: Wahlen mit Wartezeit über 5 s.
- Mittlerer Abstand zwischen zwei Wahlen, getrennt vor und nach Minute 10.

Das Sitzungsprotokoll (`menu.session`) wird um dieselben Daten ergänzt. Ein Werkzeug wertet Protokolle menschlicher Partien mit denselben Kennzahlen aus.

Hypothese des PO: Nach einem Aufstieg füllt sich der Balken fast sofort wieder, danach wartet die Wahl den Rest des Mindestabstands ab. Ergebnis: Ab einem gewissen Ausbau gibt es alle 45 s eine Karte.

Akzeptanzkriterien:
- [Bot] Tabelle der Kennzahlen je Bot im Bericht; Rohdaten unter `reports/kartenpfad8-basis-*`.
- [Bot] Befund zur Hypothese: bestätigt oder widerlegt, mit der Quelle oder den Quellen, die den Überschuss treiben.
- [Bot] Werkzeug zur Auswertung eines Sitzungsprotokolls, z. B. `tools/ep-protokoll.mjs`.
- [Mensch] Nick exportiert das Protokoll einer eigenen Partie auf Normal; die Auswertung zeigt die Kennzahlen dieser Partie.

#### REQ-K8.02 EP-Pacing über das Balancing der EP

Der Mindestabstand von 45 s bleibt als Bremse unverändert, soll aber nur ausnahmsweise greifen. Die Kartenwahl folgt dem Spielfluss.

Hebel wählt Claude Code auf Grundlage von K8.01, in dieser Reihenfolge bevorzugt:
1. Kostenkurve der Stufen, z. B. geometrisch steigend, sodass sie mit dem EP-Einkommen der zweiten Partiehälfte Schritt hält.
2. Abnehmender Ertrag der Quelle, die den Überschuss treibt. Vermutlich ist das das Forschungsbudget, weil es an den Materialertrag gekoppelt ist.
3. Begrenzter Übertrag: höchstens 25 % der Kosten der nächsten Stufe. EP, die bei vollem Balken während des Mindestabstands anfallen, verfallen.

Kein neuer Zeitautomatismus. Der Mindestabstand selbst bleibt unverändert.

Akzeptanzkriterien:
- [Bot] Anteil gebremster Wahlen höchstens 15 % je Bot (Normal, durchschnitt); Vorher-Wert aus K8.01.
- [Bot] Bot ohne Kategorie, Normal, durchschnitt: 12–16 Wahlen und 13–17 min bleiben erfüllt.
- [Bot] Mittlerer Abstand zwischen Wahlen nach Minute 10 mindestens 55 s (alle Bots, Normal, durchschnitt).
- [Bot] Patt-Quote ohne Schalter (Bot ohne Kategorie, alle Felder) steigt um höchstens 0,5 Prozentpunkte gegenüber K8.01.
- [Bot] Unit-Tests für Übertrag und Verfall.
- [Mensch] Nach Minute 10 steht der Balken in Nicks Partie nicht mehr regelmäßig voll, während die Wahl auf sich warten lässt.

#### REQ-K8.03 Anzeige des EP-Fortschritts

- Die Ressourcenleiste zeigt den Fortschritt zur nächsten Wahl. Die kumulierte EP-Summe steht nur im Tooltip.
- Greift der Mindestabstand, zeigt die Anzeige Restzeit und Grund, etwa „Nächste Wahl in 0:23 · Mindestabstand“. „Karte in 0:00“ bei vollem Balken ist ausgeschlossen.
- Die Zeitschätzung (`hud.xpEta`) berücksichtigt den Mindestabstand.
- Verfallen EP nach K8.02, ist das am Balken sichtbar, z. B. durch einen gekappten Balken mit Markierung.

Akzeptanzkriterien:
- [Bot] Test der Anzeige in den Zuständen „füllt sich“, „voll, Mindestabstand greift“ und „Wahl offen“.
- [Bot] Bildschirmfoto bei greifendem Mindestabstand: `docs/bilder/kartenpfad8-ep-mindestabstand.png`.
- [Mensch] Nick versteht ohne Erklärung, warum die Wahl wartet.

#### REQ-K8.04 Bezeichnung der Manufaktur

- Manufakturen erscheinen im Modus karten im Baumenü und auf dem Bauplatz ohne Ordnungszahl: „Manufaktur“, nach Wasserrahmen „Fabrik“, nach Dampfkraft „Dampffabrik“.
- Die Zahl steht nur in der Grenzanzeige (`fab.stat.grenze`, `haus.grenze.value`). Wo eine Unterscheidung nötig ist, genügt die Bauplatznummer (`ctx.building`).
- Keine Regeländerung: Schmiede und Kontor bleiben einmal baubar, Kaserne und Universität zweimal.

Akzeptanzkriterien:
- [Bot] Suchtest: `bld.fabrik.nth.karten` wird im Modus karten nicht mehr gerendert.
- [Bot] Bildschirmfoto des Baumenüs.

#### REQ-K8.05 Reichweitenleiter der Fernkämpfer

Verbindlich ist eine strikte Reihenfolge der Grundreichweiten mit mindestens 10 % Abstand je Stufe:

Werfer < Bogenschütze < Armbrustschütze < Katapult < Geschütz

Vorgabewerte, bezogen auf die heutige Grundreichweite des Werfers R_W:

| Einheit | Grundreichweite |
|---|---|
| Werfer | R_W (unverändert) |
| Bogenschütze | 1,3 × R_W |
| Armbrustschütze | 1,5 × R_W |
| Katapult | 1,8 × R_W |
| Geschütz | 2,2 × R_W |

Regeln dazu:
- Reichweiten, die heute schon höher liegen, sinken nicht.
- Ausbau „Reichweite“ und Kartenboni wirken weiter additiv beziehungsweise multiplikativ wie bisher.
- T.0 dokumentiert die heutigen Reichweiten aller Einheiten sowie die Grundreichweite eigener und gegnerischer Türme.

Akzeptanzkriterien:
- [Bot] Tabelle der Reichweiten vorher und nachher, einschließlich Türme.
- [Bot] Test: Die Reihenfolge gilt auf allen Schmiede-Stufen und mit allen reichweitenwirksamen Karten und Ausbauten.
- [Bot] Simulation: Siegquote, Patt und Dauer der Kategorie-Bots vorher und nachher.
- [Bot] Bericht: Lage der Geschützreichweite relativ zur Grundreichweite gegnerischer Türme. Keine Anpassung an dieser Stelle, das entscheidet der PO.

#### REQ-K8.06 Gegner mit Bogen- und Armbrustschützen (experimentell)

- Ab einer Schwelle der Wellenstärke mischen gegnerische Wellen Bogenschützen bei, ab einer höheren Schwelle Armbrustschützen.
- Die Schwellen hängen an der Wellenstärke, nicht direkt an der Uhr. Dass die Wellenstärke heute selbst an der Uhr hängt, ist bis zur Runde Druckkurve hinzunehmen.
- Vorgaben:
  - Bogenschützen ab der 1,5-fachen Stärke der ersten Welle.
  - Armbrustschützen ab der 2,5-fachen Stärke.
  - Je Typ höchstens 25 % der Einheiten einer Welle.
- Werte wie die eigenen Einheiten einschließlich Reichweite nach K8.05, skaliert wie die übrigen Gegnertypen.
- Bedingung: Gegnerische Fernkämpfer reichen nicht über die Grundreichweite der eigenen Türme hinaus. Kollidiert das mit K8.05, gilt die Abbruchregel in Abschnitt 4.
- Schalter `?gegnerfern=aus` schaltet die Neuerung für Vergleichsmessungen ab. Im Modus karten ist sie standardmäßig an.

Akzeptanzkriterien:
- [Bot] Test: Bogen- und Armbrustschützen erscheinen erst ab ihrer Schwelle; der Schalter wirkt.
- [Bot] Paarvergleich mit und ohne Schalter (alle Kategorie-Bots und Bot ohne Kategorie, Normal, durchschnitt; Verteidigungs-Bot zusätzlich auf Schwer und mit `?druck=hoch`). Gemessen werden Siegquote, Patt, Mauerverlust und Dauer.
- [Bot] Zielwert: Patt-Quote mit `?druck=hoch` steigt um höchstens 1 Prozentpunkt.
- [Mensch] Gegnerische Fernkämpfer sind in der Lane als solche erkennbar.

#### REQ-K8.07 Belagerungsgerät entfernen [Vorschlag Cowork, vor Start durch PO bestätigen]

- Im Modus karten entfällt die Karte aus dem Pool (42 → 41 Karten).
- Der Effekt ihrer Stufe 2 (die gegnerische Basis verliert dauerhaft Lebenspunkte je Sekunde) wird Stufe 2 der Karte Durchbruch.
- Alternative bei Ablehnung: Belagerungsgerät ohne Nachteil, nur im Angebot, wenn eine Gießerei steht.

Akzeptanzkriterien:
- [Bot] Test: Karte nicht im Pool; Durchbruch Stufe 2 wirkt wie beschrieben.
- [Bot] Wahlrate von Durchbruch und Siegquote der Kategorie-Bots vorher und nachher.

#### REQ-K8.08 Grenzfeste abschwächen [Vorschlag Cowork, vor Start durch PO bestätigen]

- Einschränkung: Wellenabstand × 1,25 → × 1,10. Der Effekt bleibt unverändert.

Akzeptanzkriterium:
- [Bot] Paarvergleich wie in Teil 7 (Normal, durchschnitt, Verteidigungs-Bot, 50 Partien je Arm). Die Differenz der Siegquote liegt bei mindestens −10 Prozentpunkten (Teil 7: −24).

#### REQ-K8.09 Messung, Bericht, Spielstand

- Messung wie K8.01 nach dem letzten Inkrement.
- Bericht `docs/bericht-kartenpfad-8.md` mit Vorher-nachher-Tabellen und Auffälligkeiten.
- Stand je Inkrement in `docs/STAND-kartenpfad.md`.
- Spielstand-Version 13, falls sich das gespeicherte Format ändert. Ältere Stände werden mit `start.oldSave` abgewiesen.

Akzeptanzkriterien:
- [Bot] Golden-Test grün, alle Unit-Tests und Browser-Prüfpunkte grün.
- [Bot] Bericht und Rohdaten unter `reports/kartenpfad8-*`.

### Teil 9

#### Textregeln (gelten für alle sichtbaren Texte des Modus karten)

- **R1 Kartenfläche:** Name, eine Wirkungszeile, höchstens eine Nachteilszeile, höchstens eine Bedingungszeile (z. B. „nur mit Turm“). Alles Weitere steht im Tooltip.
- **R2 Nachteile:** Sie stehen immer auf der Kartenfläche, in eigener Zeile und visuell abgesetzt (eigenes Zeichen, eigene Farbe), nie nur im Fließtext.
- **R3 Zeichenbudgets** (Deutsch, mit eingesetzten Beispielwerten):

  | Element | Höchstens |
  |---|---|
  | Kartenname | 22 Zeichen |
  | Wirkungszeile | 40 Zeichen |
  | Nachteilszeile | 40 Zeichen |
  | Bedingungszeile | 30 Zeichen |
  | Gebäudebeschreibung | 110 Zeichen |
  | Tooltip-Text | 180 Zeichen |
  | Hinweis | 100 Zeichen |

  Englisch: dieselben Budgets plus 15 %.
- **R4 Kein Designertext:** keine Begründungen der Balance, keine Absichten, keine Platzhalter.
- **R5 Eindeutigkeit:** ein Begriff je Sache, ein Name je Element, in beiden Sprachen.
- **R6 Zahlen:** über Platzhalter, nicht fest im Text (Beispiele: `kp.eff.dampfkraft` „+40 %“, `log.siegeWarning` „dreifach“).
- **R7 Ton:** wie in Teil 7, ruhig und sachlich; die Anrede „Statthalter“ nur im Tutorial.

#### REQ-K9.01 Textinventar

- Werkzeug, z. B. `tools/textbudget.mjs`, das je sichtbarem Schlüssel des Modus karten die Zeichen mit eingesetzten Beispielwerten zählt und Verstöße gegen R3 meldet.
- Dazu die Gesamtzeichenzahl Deutsch und Englisch als Ausgangswert.

Akzeptanzkriterium:
- [Bot] Ausgangsbericht `reports/kartenpfad9-textinventar.txt`.

#### REQ-K9.02 Kartenfläche nach R1 und R2

Gilt für Bonuskarten, Wagnisse, Doktrinen, Technologien und Weiterentwicklungen, auf allen Stufen.

- Nachteilszeile für jede Karte mit Nachteil. Ausdrücklich betroffen sind die vier Karten, deren Kurzzeile (`kp.eff.*`) den Nachteil heute weglässt: Aushebung, Große Armee, Glücksritter, Alles auf die Mitte. Belagerungsgerät entfällt mit K8.07.
- `kp.card.drawback` („mit Nachteil“) entfällt zugunsten der konkreten Zeile.
- Doktrinen: Die Einschränkung ist die Nachteilszeile, der Sonderbau gehört zur Wirkung.

Akzeptanzkriterien:
- [Bot] Test: Jede Karte mit Nachteilsparameter (`d1`, `d1p` oder Einschränkung) zeigt eine nicht leere Nachteilszeile auf der Kartenfläche.
- [Bot] Test R3 für alle Karten.
- [Bot] Bildschirmfotos der Kartenbühne mit Bonus, Wagnis, Doktrin und Weiterentwicklung.
- [Mensch] Nick nennt bei fünf zufällig gezogenen Karten den Nachteil jeweils innerhalb von drei Sekunden.

#### REQ-K9.03 Klassifikationen auf der Karte

Heute trägt eine Karte bis zu fünf Klassifikationen: Seltenheit, Familie, Kategorie, Art der Synergie und alte Kategorien (`draft.cat.*`).

Künftig sichtbar auf der Fläche:

| Klassifikation | Darstellung |
|---|---|
| Kategorie (Wirtschaft, Militär, Verteidigung, Neutral) | Farbe mit Symbol |
| Familie (Bonus, Wagnis, Doktrin, Technologie, Weiterentwicklung) | Rahmen |
| Seltenheit | Rahmenakzent, ohne Wort |

Nur im Tooltip:
- Art der Synergie (Zähler, Brücke, Verstärker) und Synergiewert.

Im Modus karten nicht mehr angezeigt:
- Alte Kategorien `draft.cat.*`.

Die Tooltip-Bezeichnungen „Art“ und „Typ“ werden eindeutig zugeordnet (`tip.draft.category`, `tip.draft.art`, `tip.m.role`).

Akzeptanzkriterien:
- [Bot] Suchtest: `draft.cat.*` wird im Modus karten nicht gerendert.
- [Bot] Bildschirmfoto.
- [Mensch] Nick erkennt die Kategorie einer Karte ohne Tooltip.

#### REQ-K9.04 Gebäude, Reiter, Tooltips kürzen

Kürzen nach R3. Schwerpunkte:
- Gebäude: `bld.kaserne.desc.karten`, `bld.universitaet.desc.karten`
- Pfadkarten: `kp.card.fernhandel.desc`, `kp.card.geschuetzguss.desc`, `kp.card.stadtrecht.desc`, `kp.card.hofhaltung.desc`
- Doktrinbeschreibungen `doctrine.*.desc`
- Tooltips: `tip.kat.counts`, `tip.click.body`, `tip.trade.body`, `tip.fluegel.body`

Was gestrichen wird, entfällt. Es wandert nicht in einen zweiten Tooltip.

Akzeptanzkriterien:
- [Bot] Die Gesamtzeichenzahl der sichtbaren deutschen Texte des Modus karten sinkt um mindestens 25 % gegenüber K9.01.
- [Bot] Keine Verstöße gegen R3. Höchstens 10 begründete Ausnahmen, aufgelistet im Bericht.

#### REQ-K9.05 Designertext und veraltete Aussagen

Designertext entfernen:
- `upg.presse.desc`: Satz zur Absicht.
- `upg.qualitaet.desc`: „der Abfluss für überschüssiges Material“.
- `tip.kp.vorschau` und `kp.vorschau`: Platzhalter. Das Element wird ausgeblendet, solange es keinen Inhalt hat.

Veraltete Aussagen korrigieren:
- `tip.hud.xp`: EP kommen aus mehreren Quellen, nicht nur aus Abschüssen.
- `tip.tab.uni`: Die Forschung fehlt.
- `tip.hud.draft`: Im Modus karten öffnet sich die Bühne, nicht der Reiter Karten.
- `level.uniOff` und `level.uniOn`: „je Angebot“ statt „je Stufenaufstieg“.
- Texte des Modus karten mit „Fabrik“, wo die Manufaktur gemeint ist.

Akzeptanzkriterien:
- [Bot] Suchtest über die genannten Schlüssel.
- [Bot] Suchtest: „Fabrik“ erscheint in sichtbaren Texten des Modus karten nur dort, wo das Gebäude nach Wasserrahmen gemeint ist.

#### REQ-K9.06 Begriffe und Namenskollisionen

Begriffe:

| Sache | Deutsch | Englisch | Entfällt |
|---|---|---|---|
| Lebenspunkte | „Lebenspunkte“ im Fließtext, „LP“ in Kurzzeilen | „health“, „HP“ | „Leben“, „hit points“ |
| Abschuss | „Abschuss“ | „takedown“ | „kill“ |
| Schmiede | „Schmiede“ | „smithy“ | „forge“ |
| Kontor | „Kontor“ | „trading post“ | „Handelskontor“ (wird zu leicht mit „Handelshaus“ verwechselt) |

Kollisionen auflösen (Vorschläge):

| Element | Heute | Vorschlag |
|---|---|---|
| Flügel Zeughaus (EN) | „Armoury“, gleich wie Variante Rüstkammer | „Arsenal“ |
| Karte Söldnertruppe | EN „Mercenary company“, gleich wie Söldnerkompanie des Handelshauses | „Söldnerwerbung“ / „Hired Swords“ |
| Forschung Wehrgänge (EN) | „Battlements“, gleich wie Karte Zinnen | „Wall Walks“ |

Akzeptanzkriterien:
- [Bot] Test: Im Modus karten tragen keine zwei verschiedenen Elemente denselben Namen, je Sprache.
- [Bot] Suchtest auf die entfallenden Begriffe.

#### REQ-K9.07 Phasenanzeige entfernen

- Die Ressourcenleiste zeigt keine Phase mehr (`hdr.level` ohne `{phase}`).
- Texte, die Phasen nennen, beschreiben den tatsächlichen Auslöser. Beispiel `tip.click.body`: ab wann die Presse selbst arbeitet.
- Die Phasenmechanik bleibt unverändert.

Akzeptanzkriterien:
- [Bot] Suchtest: Kein Phasenbegriff (`phase.*`, „Phase“) ist im Modus karten sichtbar.
- [Bot] Golden-Test grün.

#### REQ-K9.08 Sprach-Audit und Textübersicht

- `tests/sprache.test.mjs` wird um R3 bis R6 erweitert.
- Die Textübersicht `docs/texte-kartenpfad.md` wird neu erzeugt, im Format der bisherigen Übersicht und mit einer Spalte für die Zeichenzahl.

Akzeptanzkriterium:
- [Bot] Tests grün, Datei liegt vor.

#### REQ-K9.09 Abschluss Teil 9

- Bericht `docs/bericht-kartenpfad-9.md`.
- Kurzmessung: Die Kennzahlen aus K8.09 bleiben innerhalb des Rauschens, denn Teil 9 ändert keine Regeln.
- Testleitfaden `docs/testleitfaden-kartenpfad-9.md`, der Teil 7 bis 9 abdeckt. Ergänzte Fragen:
  - Nachteile einer Karte erfassen.
  - Wartezeit bis zur nächsten Wahl verstehen.
  - Gegnerische Fernkämpfer erkennen.

Akzeptanzkriterium:
- [Bot] Alle Tests und Browser-Prüfpunkte grün; privater Testbuild verfügbar.

## 3. Entscheidungen des PO

1. Das EP-Problem wird über das Balancing der EP gelöst. Der Mindestabstand bleibt als Bremse.
2. Kein Mehrfachbau, wo er keinen Sinn ergibt. Bei der Manufaktur ändert sich nur die Bezeichnung.
3. Der Gegner erhält experimentell mit stärkeren Wellen Bogen- und Armbrustschützen.
4. Neue Fernkampfeinheiten erhalten höhere Reichweiten als der Werfer, das Geschütz die höchste.
5. Belagerungsgerät wird angepasst oder entfernt.
6. Weniger, aber bedeutungsvollerer Text. Nachteile einer Karte müssen schnell erfassbar sein.
7. Die Spielphasen sollen langfristig entfallen; das Pacing soll aus den Handlungen des Spielers und der Stärke der Gegnerwellen entstehen. In diesen Teilen entfällt nur die Anzeige, die Mechanik folgt mit der Druckkurve.
8. Der Zeitpunkt des Spieltests mit Menschen ist offen.

**Vorschläge von Cowork, vor Start durch den PO zu bestätigen**
- K8.07 Entfernen von Belagerungsgerät (Alternative siehe dort).
- K8.08 Grenzfeste mit Wellenabstand × 1,10.
- Reichweitenfaktoren (K8.05) sowie Schwellen und Turmbedingung (K8.06).
- Zeichenbudgets R3 und Zielwert −25 % (K9.04).
- Begriffe und Namensvorschläge (K9.06).

## 4. Inkrementplan mit Abbruchregel

### Teil 8

| Commit | Inhalt | REQ |
|---|---|---|
| T.0 | Basismessung, EP-Diagnose, Protokoll-Auswertung, Reichweitentabelle | K8.01 |
| T.1 | EP-Balancing und Anzeige | K8.02, K8.03 |
| T.2 | Bezeichnung der Manufaktur | K8.04 |
| T.3 | Reichweitenleiter | K8.05 |
| T.4 | Gegnerische Bogen- und Armbrustschützen | K8.06 |
| T.5 | Belagerungsgerät, Grenzfeste | K8.07, K8.08 |
| T.6 | Messung, Bericht, Spielstand | K8.09 |

**Abbruchregeln Teil 8**

*Nach T.0*
- Zeigt die Diagnose einen Programmfehler in Stufenlogik oder Anzeige, wird er in T.1 als Fehlerbehebung korrigiert. Erst danach wird geprüft, ob zusätzlich ein Balancing nötig ist.
- Betrifft der Fehler auch `main`, gilt die Branch-Regel: Behebung im `fix/`-Branch auf `main`, danach `main` in den Branch mischen.
- Widerlegt die Diagnose die Hypothese ohne erkennbare Ursache, stoppt Claude Code nach T.0 und berichtet.

*In T.1*
- Liegen Wahlen oder Dauer nach höchstens drei Kalibrierschritten außerhalb des Korridors, stoppt Claude Code und berichtet die Zahlen.
- Der Mindestabstand wird nicht verändert.

*In T.3 und T.4*
- Lassen sich die Reichweitenleiter und die Turmbedingung aus K8.06 nicht gleichzeitig erfüllen, berichtet Claude Code die Werte und setzt T.4 ohne Reichweitenänderung der gegnerischen Fernkämpfer fort. Die Entscheidung trifft der PO.
- Steigt mit T.4 die Patt-Quote mit `?druck=hoch` um mehr als 1 Prozentpunkt, wird das berichtet, nicht über andere Hebel wegbalanciert. Der Schalter steht dann standardmäßig auf aus; Entscheidung PO.

*Immer*
- Ein roter Golden-Test schließt jedes Inkrement aus.

### Teil 9

| Commit | Inhalt | REQ |
|---|---|---|
| U.0 | Textinventar | K9.01 |
| U.1 | Kartenfläche und Nachteilszeilen | K9.02 |
| U.2 | Klassifikationen | K9.03 |
| U.3 | Kürzen | K9.04 |
| U.4 | Designertext, veraltete Aussagen | K9.05 |
| U.5 | Begriffe, Namenskollisionen | K9.06 |
| U.6 | Phasenanzeige | K9.07 |
| U.7 | Sprach-Audit, Textübersicht, Bericht, Testleitfaden | K9.08, K9.09 |

**Abbruchregeln Teil 9**
- Lässt sich R3 bei mehr als zehn Texten nur mit Informationsverlust einhalten, legt Claude Code die Liste mit Kürzungsvorschlägen vor. Kürzen um jeden Preis ist nicht verlangt.
- Ist die Kartenfläche nach R1 bei 375 px Breite nicht lesbar, wird mit Bildschirmfoto berichtet und das Layout vor U.2 geklärt.

## 5. Schwache Annahmen und offene Punkte

1. **EP-Hypothese:** Sie stützt sich auf Nicks Beobachtung und einen Screenshot. Die Bot-Messung hat bisher Wahlen gezählt, keine Wartezeiten. T.0 klärt das.
2. **Verfall von EP:** Verfallende EP bei vollem Balken können sich als Strafe anfühlen. Die Ursache lässt sich besser über die Kostenkurve als über den Verfall beheben; der Verfall ist die dritte Wahl, nicht die erste.
3. **Bots und Gegner-Fernkampf:** Bots gewinnen auf Normal fast immer. Der Effekt gegnerischer Fernkämpfer kann bei Menschen deutlich stärker ausfallen; das zeigt erst der Spieltest.
4. **Gegnerschwellen:** Die Wellenstärke hängt heute an der Uhr. Die Schwellen in K8.06 erben das bis zur Runde Druckkurve.
5. **Geschütze und gegnerische Türme:** Eine Geschützreichweite über der gegnerischen Turmreichweite macht Geschütze für Türme unangreifbar. Das ist zusammen mit Auslegung 11 (Geschütze gegen Türme) zu entscheiden.
6. **Zielwert −25 %:** Er ist gesetzt, nicht hergeleitet. Maßgeblich sind R1 bis R3; der Zielwert dient als Kontrolle.
7. **Synergiezählung:** Das Entfernen von Belagerungsgerät ändert die Kartenzahl einer Kategorie und damit Synergiezählungen. Im Bericht prüfen.
8. **Spieltest:** Teil 8 und 9 sind so geschnitten, dass sie vor einem Spieltest abgeschlossen sein können. Der Zeitpunkt bleibt offen.

# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 2: Kartendarstellung und Entdecken

Stand: 07.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-2.md` · Branch: `exp/kartenpfad`
Bezug: `docs/bericht-kartenpfad.md`, `docs/anforderungen-kartenpfad.md`, `docs/anforderungen-mvp-release.md`

## 0. Auftrag in Kürze

Diese Iteration verbessert zwei Dinge im Prototyp:

1. **Kartendarstellung:** Die Karten erscheinen wie ein Deck nur im Moment der Wahl in der Bildmitte. Außerhalb der Wahl ist die Mitte frei. Die gewählte Karte zeigt sichtbar, wo sie wirkt.
2. **Entdecken:** Die Oberfläche zeigt nur, was der Spieler jetzt nutzen kann. Neues erscheint im Moment der Freischaltung. Bäume und Vorschauen auf Gesperrtes entfallen. Das entlastet die überladene Oberfläche und schafft einen explorativen Teil.

**Nicht Teil dieses Auftrags:** Pacing, Balancing, neue Gebäude, Änderungen an Karten oder Wellen. Dafür folgt ein eigenes Dokument.

**Ausblick `main`:** Liefern beide Pakete gute Ergebnisse, erwägt der PO die Übernahme in `main` und den MVP. Beide Pakete werden deshalb so gebaut, dass sie auch im Modus `standard` laufen, hinter Schaltern, die dort standardmäßig aus sind. So lässt sich im privaten Testbuild prüfen, ob Entdecken auch im MVP Spaß macht, ohne `main` zu verändern.

## 1. Arbeitsgrundlagen

- **Voraussetzung:** Der Abgleich aus `docs/anforderungen-mvp-release.md` REQ-R.06 ist erfolgt (`main` in den Branch gemischt, `docs/STAND-kartenpfad.md` angelegt). Falls nicht, zuerst nachholen.
- **Vor Beginn lesen:** `CLAUDE.md`, `docs/STAND-kartenpfad.md`, `docs/bericht-kartenpfad.md`, dieses Dokument. Dieses Dokument muss im Repository liegen; ältere Fassungen gelten nicht.
- **Invarianten** gelten unverändert: `core.js` ohne DOM; Zufall nur über `S.rng`; Zahlen nur in `config.js` bzw. `data/`, Texte nur in `i18n/`; Spielstand als azyklisches JSON; Tooltip und Erklärzeile an jedem sichtbaren Bedienelement.
- **Reine Oberfläche:** Beide Pakete ändern keine Spiellogik. Die Bot-Simulation liefert in beiden Modi bei gleichem Seed dieselben Ergebnisse wie vorher.
- **Sichtbarkeit ist eine Funktion des Spielstands.** Was sichtbar ist, ergibt sich aus dem aktuellen Spielstand und wird nicht gesondert gespeichert. Ausnahme: die Markierung „neu“ und die Erstkontakt-Hinweise, die wie bisher je Browser gemerkt werden.
- **Fehler, die auch `main` betreffen,** werden nach der Regel aus `docs/anforderungen-kartenpfad.md` Abschnitt 1 auf `main` behoben.
- **Testbuild bleibt privat.**

## 2. Schalter

| Schalter | Werte | Standard `karten` | Standard `standard` |
|---|---|---|---|
| `UI.kartenbuehne` | an, aus | an | aus |
| `KARTENBUEHNE.zeit` | `pause`, `lauf` | `pause` | `pause` |
| `UI.entdecken` | an, aus | an | aus |
| `ENTDECKEN.vorschau` | `keine`, `naechste` | `keine` | `keine` |

Für Tests lassen sich alle Schalter per URL setzen (`?buehne=1`, `?entdecken=1`, `?vorschau=naechste`, `?zeit=lauf`). Im Modus `standard` mit allen Schaltern aus ist das Spiel identisch zu `main`.

## 3. Anforderungen

| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| K2.01 | Freie Bildmitte außerhalb der Wahl | Muss | K2.1 |
| K2.02 | Ablauf der Wahl: austeilen, aufdecken, wirken | Muss | K2.2 |
| K2.03 | Aufbau der Karte | Muss | K2.3 |
| K2.04 | Sichtbarkeitsregeln | Muss | K2.4 |
| K2.05 | Bäume und Vorschauen entfernen | Muss | K2.4 |
| K2.06 | Entdeckungsmoment | Muss | K2.5 |
| K2.07 | Entdecken im Modus `standard` | Muss | K2.6 |
| K2.08 | Messung, Testbuild, Bericht | Muss | K2.7 |

---

### REQ-K2.01 Freie Bildmitte außerhalb der Wahl

**Befund (PO):** In der Mitte des Spielbildschirms liegt dauerhaft ein Grafikartefakt. Das Kartendeck soll nur beim Auswählen in der Mitte erscheinen.

**Anforderungen**

- Ursache in `docs/STAND-kartenpfad.md` festhalten (vermutlich der dauerhafte Stapel aus KP.2).
- Außerhalb einer Wahl zeichnet die Bühne nichts: kein Stapel, keine Abdunklung, kein unsichtbares Element, das Klicks abfängt.
- Der Fortschritt zur nächsten Wahl steht nur in der Ressourcenleiste: ein kleines Kartensymbol mit Füllstand neben dem EP-Wert. Eine offene, zurückgestellte Wahl lässt das Symbol pulsieren; ein Klick darauf öffnet die Bühne.

**Akzeptanzkriterien**

- Playwright: Ohne offene Wahl liegt kein Element der Bühne im DOM bzw. auf der Canvas (Pixelvergleich der Bildmitte mit einer Aufnahme ohne Bühne).
- Klicks in der Bildmitte erreichen ohne offene Wahl die Spielwelt (Bauplatz, Gebäude).

---

### REQ-K2.02 Ablauf der Wahl: austeilen, aufdecken, wirken

**Ziel:** Die Wahl wirkt wie ein Kartenzug am Tisch, und der Spieler sieht, wohin seine Entscheidung geht.

**Ablauf**

1. **Erscheinen:** Der Stapel gleitet vom Kartensymbol der Ressourcenleiste in die Bildmitte; die Spielwelt wird abgedunkelt.
2. **Austeilen und Aufdecken:** Die Karten werden einzeln ausgeteilt und umgedreht, von links nach rechts.
3. **Wahl:** Klick oder Tasten `1`–`4`. Die gewählte Karte hebt sich kurz hervor.
4. **Wirken:** Die gewählte Karte fliegt zu der Stelle, an der sie wirkt (Tabelle unten), und löst sich dort auf. Das Ziel trägt danach die Markierung „neu“.
5. **Abräumen:** Die übrigen Karten gleiten zurück in den Stapel, der Stapel zurück in die Ressourcenleiste.

**Wirkort je Familie**

| Familie | Wirkort |
|---|---|
| Bau | Neue Bauoption im Reiter „Bauen“; liegt der Reiter nicht offen, sein Reiterknopf |
| Technologie | Reiterknopf „Universität“ |
| Bonus | Das betroffene Element (Reiter, Ressourcenwert, Armee); ohne eindeutiges Ziel der Reiterknopf „Karten“ |
| Wagnis | Ressourcenleiste |

**Regeln**

- Gesamtdauer: Erscheinen und Aufdecken ≤ 800 ms, Wirken und Abräumen ≤ 700 ms (Werte in `config.js`).
- Die Eingabesperre endet, wenn die letzte Karte aufgedeckt ist, frühestens 400 ms nach dem Erscheinen.
- Mit `KARTENBUEHNE.zeit = 'pause'` steht das Spiel vom Erscheinen bis zum Ende des Abräumens. Mit `lauf` läuft es weiter; die Animation blockiert keine Eingabe außerhalb der Bühne.
- Liegt der Wirkort außerhalb des sichtbaren Bereichs, fliegt die Karte zum Rand in seine Richtung.
- `prefers-reduced-motion`: Karten erscheinen und verschwinden ohne Bewegung; der Wirkort wird nur markiert.
- Neu ziehen: Die angebotenen Karten gleiten zurück, neue werden ausgeteilt. Bannen: Die gebannte Karte verblasst, ein Ersatz wird ausgeteilt.
- Mehrere offene Wahlen: Nach dem Abräumen beginnt die nächste Wahl ohne Rückkehr des Stapels.
- Die Sprechblase des Tutorials zur ersten Wahl erscheint erst nach dem Aufdecken, oberhalb der Karten.

**Akzeptanzkriterien**

- Playwright: Ablauf vollständig, Dauer innerhalb der Grenzen; nach der Wahl trägt der Wirkort die Markierung „neu“.
- Test: Bei `pause` ändert sich der Spielstand vom Erscheinen bis zum Abräumen nicht.
- Test: Bei `prefers-reduced-motion` keine Bewegung, gleiche Funktion.

---

### REQ-K2.03 Aufbau der Karte

**Ziel:** Eine Karte ist auf einen Blick lesbar. Die Entscheidung ist informiert, ohne die weitere Entwicklung zu verraten.

**Vorderseite**

- Familienband oben (Farbe und Wort).
- Name.
- Symbol aus den vorhandenen Zeichenmitteln.
- Eine Wirkungszeile, höchstens etwa 40 Zeichen: bei Bau „Schaltet frei: Schmiede“, bei Technologie „Öffnet Forschung: Reiter, Schildträger“, bei Bonus die Kernwirkung.
- Stufe als Punkte; Seltenheit über die Rahmenfarbe.

**Details** erscheinen beim Überfahren oder Fokussieren in einer Zeile unter der Kartenreihe: genaue Werte, Vorher/Nachher bei Boni, Voraussetzungen, die bereits erfüllt sind.

**Grenze der Information:** Die Karte nennt nur ihre direkte Wirkung. Folgekarten, spätere Forschungen und die Hinweise „Kehrt in den Stapel zurück“ entfallen.

**Rückseite:** Einheitlich für alle Karten, sichtbar beim Austeilen und im Stapel.

**Akzeptanzkriterien**

- Bildschirmfotos bei 1280×720 und 1920×1080: alle Vorderseiten ohne Überfahren lesbar.
- Test: Kein Kartentext nennt eine Karte oder Forschung, die nicht direkte Wirkung dieser Karte ist.
- `tooltipAudit` und `explAudit` grün.

---

### REQ-K2.04 Sichtbarkeitsregeln

**Grundregel:** Ein Element ist sichtbar, sobald der Spieler es nutzen kann oder sobald es eine Entscheidung beeinflusst. Vorher existiert es in der Oberfläche nicht, auch nicht ausgegraut.

Diese Regel ersetzt im Branch die Regel aus `docs/anforderungen-kartenpfad.md` REQ-KP.01, nach der gesperrte Inhalte ausgegraut sichtbar sind und ihre Quelle nennen.

**Anwendung (Vorschlag; Claude Code prüft jede Zeile gegen den Spielstand und berichtet Abweichungen)**

| Element | Sichtbar ab |
|---|---|
| Reiter „Bauen“ | Start |
| Reiter „Armee“ | Start (Läufer sind kaufbar; Tutorial-Schritt 3) |
| Abschnitt „Kaserne“ im Reiter „Armee“ | Kaserne baubar |
| Reiter „Mauer & Türme“ | Erste Aktion an Mauer oder Turm möglich (Reparatur, Ausbau) |
| Reiter „Schmiede“ | Schmiede gebaut |
| Reiter „Universität“ | Universität gebaut |
| Reiter „Karten“ (Sammlung) | Nach der ersten Wahl |
| Bauoption eines Gebäudes | Freigeschaltet |
| Einheit im Kaufbereich | Freigeschaltet bzw. erforscht |
| Ausbaustufe | Vorherige Stufe gekauft und Quelle erfüllt |
| Forschung | Geöffnet und Universität gebaut |
| Ressourcenleiste: Material, Wellen, Mauer, Zeit, Menü | Start |
| Ressourcenleiste: EP und Kartensymbol | Erster EP-Gewinn |
| Ressourcenleiste: Versorgung | Erste gekaufte Einheit |
| Ressourcenleiste: Armeezustand | Erste eigene Welle rückt aus |
| Zinsen, Nachbarschaftsbonus | Handelskontor gebaut bzw. zweites Gebäude gebaut |

**Regeln**

- Elemente erscheinen, verschwinden aber nicht wieder. Ausnahme: Reiter eines abgerissenen Gebäudes bleiben sichtbar und zeigen „nicht gebaut“, damit erforschte Wirkungen auffindbar bleiben.
- Jedes Ziel eines Tutorial-Schritts ist sichtbar, wenn der Schritt beginnt.
- Leere Bereiche entstehen nicht: Ein Reiter ohne sichtbaren Inhalt wird nicht angezeigt.
- Die Reihenfolge der Reiter bleibt fest; neue Reiter erscheinen an ihrem Platz, ohne dass andere springen.
- **Soll – Vorschau `naechste`:** Mit `ENTDECKEN.vorschau = 'naechste'` erscheint je Bereich höchstens ein Platzhalter „?“ für das nächste erreichbare Element, ohne Namen und ohne Quelle. Zweck: Im Spieltest vergleichen, ob ein Hinweis auf „da kommt noch etwas“ die Neugier stärkt.

**Akzeptanzkriterien**

- Test je Zeile der Tabelle: Element vor der Bedingung nicht im DOM, danach sichtbar.
- Playwright-Durchlauf des Tutorials in beiden Modi grün.
- Bot-Simulation in beiden Modi mit gleichem Seed unverändert.

---

### REQ-K2.05 Bäume und Vorschauen entfernen

- Die Pfadübersicht im Reiter „Karten“ entfällt. Die Sammlung zeigt nur gewählte Karten mit Stufe, nach Familie gruppiert, und gebannte Karten.
- Die Universität zeigt nur geöffnete Forschungen. Der Hinweis „Öffnet mit: Karte …“ entfällt.
- Tooltips und Erklärzeilen nennen keine gesperrten Inhalte und keine Quellen für Gesperrtes.
- Die Graphprüfung aus Teil 1 (jede Quelle erreichbar, keine Zyklen) bleibt als Test bestehen; sie betrifft die Daten, nicht die Anzeige.

**Akzeptanzkriterium:** Suchtest über `i18n/` und die gerenderten Texte eines Durchlaufs: Kein sichtbarer Text nennt einen Inhalt, der zu diesem Zeitpunkt gesperrt ist.

---

### REQ-K2.06 Entdeckungsmoment

**Ziel:** Jede Freischaltung ist ein kleiner Moment. Der Spieler merkt, dass etwas Neues da ist, und findet es.

**Anforderungen**

- Ein neu sichtbares Element blendet weich ein (≤ 300 ms) und trägt die Markierung „neu“, bis der Spieler es einmal angesehen oder benutzt hat.
- Ein neuer Reiter trägt die Markierung am Reiterknopf, solange darin etwas Neues liegt.
- Erstkontakt-Hinweise wie in `anforderungen-tutorial.md` REQ-T.05: eine Zeile, höchstens einer gleichzeitig, 8 s oder Klick, einmal je Browser, nie während eines Tutorial-Schritts. Die Texte folgen der Sprachregel aus REQ-M.02 und nennen nur das Neue selbst.
- Erscheinen mehrere Elemente zugleich (etwa durch eine Karte), wird nur ein Hinweis gezeigt; die übrigen Elemente tragen nur die Markierung.
- Nach Abschluss einer Forschung: Hinweis und Markierung am Ergebnis (neue Einheit im Reiter „Armee“, neue Ausbaustufe).

**Akzeptanzkriterien**

- Test: Element erscheint mit Markierung; Markierung verschwindet nach Ansicht oder Benutzung.
- Test: Bei drei gleichzeitig freigeschalteten Elementen erscheint genau ein Hinweis.

---

### REQ-K2.07 Entdecken im Modus `standard`

**Ziel:** Im privaten Testbuild prüfen, ob Entdecken auch im MVP Spaß macht.

**Anforderungen**

- Mit `?entdecken=1` gelten K2.04 bis K2.06 auch im Modus `standard`. Die Tabelle aus K2.04 wird für den Modus `standard` sinngemäß angewandt; im MVP sind mehr Inhalte von Beginn an nutzbar, daher erscheinen dort weniger Elemente später. Die Zuordnung steht im Bericht.
- Forschungen im Modus `standard`: sichtbar sind nur Forschungen, deren Voraussetzungen erfüllt sind.
- Mit `?buehne=1` gilt K2.01 bis K2.03 auch im Modus `standard`, mit den vorhandenen Bonuskarten. Statt der Familie zeigt die Karte ihre Kategorie (Wirtschaft, Armee, Basis, Automatisierung, Sonderregel).
- Ohne Parameter bleibt der Modus `standard` identisch zu `main` (Golden-Test).

**Akzeptanzkriterien**

- Golden-Test grün ohne Parameter.
- Playwright-Durchlauf im Modus `standard` mit `?entdecken=1&buehne=1`: Tutorial, freies Spiel, Kartenwahl ohne Fehler.

---

### REQ-K2.08 Messung, Testbuild, Bericht

**Kennzahl „sichtbare Bedienelemente“:** Zahl der sichtbaren, bedienbaren Elemente (Knöpfe, Reiter, Kaufoptionen, Werte der Ressourcenleiste) bei Minute 1, 5 und 10, gemessen in einem festen Durchlauf (Seed, Bot „einheiten-zuerst“, Profil „durchschnitt“, Normal).

| Messung | Zielwert |
|---|---|
| Vorher (Stand nach Teil 1) und nachher, beide Modi | berichten |
| Minute 1 im Modus `karten` mit Entdecken | ≤ ein Drittel des Werts bei Minute 10 |
| Zahl der Elemente, die zwischen Minute 1 und 10 neu erscheinen | berichten |

**Protokoll (`?debug=1`), zusätzlich:**

- Zeitpunkt, zu dem ein Element sichtbar wird, und Zeitpunkt der ersten Ansicht oder Benutzung („Entdeckungszeit“),
- Überfahren je Karte während einer Wahl,
- aktive Schalter.

**Testleitfaden** `docs/testleitfaden-kartenpfad-2.md`, je Tester zwei Partien: Modus `karten`, dann Modus `standard` mit Entdecken. Fragen:

1. Hast du etwas Neues entdeckt, das dich überrascht hat?
2. Hast du etwas gesucht und nicht gefunden?
3. Wirkte die Kartenwahl wie eine wichtige Entscheidung?
4. Hat die Pause während der Wahl gestört?
5. War dir klar, was eine Karte bewirkt, bevor du sie gewählt hast?
6. Welche Partie hat dir mehr Spaß gemacht, und warum?

Optional ein dritter Durchlauf mit `?vorschau=naechste` oder `?zeit=lauf`.

**Bericht** `docs/bericht-kartenpfad-2.md`: Ergebnis je REQ, Kennzahlen vorher/nachher, Zuordnungstabellen aus K2.04 und K2.07, Bildschirmfotos (Bühne beim Aufdecken, Karte vorn und Rückseite, Oberfläche bei Minute 1 und 10 in beiden Modi), Auslegungen.

## 4. Inkrementplan

| Inkrement | Inhalt | REQ |
|---|---|---|
| K2.0 | Voraussetzungen; Kennzahl „sichtbare Bedienelemente“ für den Stand nach Teil 1 messen | K2.08 |
| K2.1 | Freie Bildmitte, Kartensymbol in der Ressourcenleiste | K2.01 |
| K2.2 | Ablauf der Wahl | K2.02 |
| K2.3 | Aufbau der Karte | K2.03 |
| K2.4 | Sichtbarkeitsregeln, Bäume und Vorschauen entfernen | K2.04, K2.05 |
| K2.5 | Entdeckungsmoment | K2.06 |
| K2.6 | Entdecken und Bühne im Modus `standard` per Schalter | K2.07 |
| K2.7 | Messung, Protokoll, Testleitfaden, Bericht, Testbuild | K2.08 |

**Abbruchregel:** Jedes Inkrement ist spielbar. Priorität bei knappem Budget: K2.1 → K2.4 → K2.3 → K2.7 (mindestens Bericht und Testbuild) → K2.6 → K2.5 → K2.2. Die Animationen aus K2.2 sind der größte Aufwand und für die Kernfrage am wenigsten entscheidend.

## 5. Schwache Annahmen und offene Punkte

| Punkt | Risiko | Standard |
|---|---|---|
| Verborgene Entwicklung | Planung wird schwerer, Frust über Zufall steigt („Wann kommt die Kaserne?“) | Karte nennt direkte Wirkung; Grenze „spätestens dritte Wahl“ bleibt; Frage 2 im Testleitfaden |
| Entdecken im MVP | Im Modus `standard` ist vieles von Beginn an nutzbar; der Effekt fällt dort womöglich klein aus | Messung und Vergleichspartie im Testleitfaden |
| Animationen | Wiederholte Animationen ermüden bei 8–9 Wahlen je Partie | Dauern konfigurierbar; im Spieltest beobachten |
| Wiederholte Partien | Wer alles einmal entdeckt hat, verliert den Überraschungseffekt | Hinnehmen; Wiederspielwert kommt aus Kartenfolge und Pfaden |
| Vorschau `naechste` | Zusätzlicher Aufwand für eine Testvariante | Soll; entfällt bei knappem Budget |

**Kriterien für eine spätere Übernahme nach `main`** (Entscheidung des PO nach dem Spieltest):

- Testleitfaden: Mehrheit der Tester bevorzugt die Partie mit Entdecken bzw. Bühne oder sieht keinen Nachteil.
- Frage 2 („gesucht und nicht gefunden“) zeigt keine wiederkehrende Lücke.
- Tutorial läuft in beiden Modi fehlerfrei.
- Golden-Test und Leistungsziel unverändert.

Die Übernahme selbst ist nicht Teil dieses Auftrags. Sie folgt mit einem eigenen Dokument für `main`.

## 6. Definition of Done

- `npm test` und `browser-check.mjs` grün; neue Tests je REQ.
- Bot-Simulation in beiden Modi mit gleichem Seed unverändert; Golden-Test grün.
- Kennzahlen, Bildschirmfotos und Zuordnungstabellen im Bericht.
- `docs/STAND-kartenpfad.md`, `CHANGELOG.md`, Testleitfaden aktualisiert.
- Testbuild privat verfügbar, mit allen Schaltern per URL.

# Klammerfront – Anforderungen Tutorial „Erste Schritte“

Stand: 04.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-tutorial.md`

## 0. Auftrag in Kürze

Ein Tutorial führt in der ersten Partie durch drei Grundlagen:

1. Fertigen per Klick,
2. ein Gebäude bauen,
3. Einheiten kaufen und mit einer Welle ausschicken.

Es läuft im echten Spiel, ohne Pausen und ohne Textseiten. Nach etwa zwei Minuten ist es vorbei. Alles Weitere entdeckt der Spieler selbst: Mauer, Türme, Schmiede, Universität, Handelskontor, die Tiefe der Karten. Pacing und die vorhandenen Erstkontakt-Hinweise tragen ihn dorthin.

**Vorbild ist *Kingdom: New Lands*:**

- Ein Geist des früheren Herrschers führt den Spieler.
- Er zeigt Handlungen vor und deutet auf Ziele.
- Er spricht fast nicht, nur „Build, expand, defend“.
- Danach verschwindet er.
- Das Tutorial lässt sich überspringen.

Klammerfront hat mehr Zahlen und Bedienfelder als *Kingdom*. Ganz ohne Text geht es deshalb nicht. Erlaubt ist eine Zeile je Schritt.

## 1. Grundsätze

1. **Vorzeigen, dann nachmachen.** Eine Führungsfigur, der „Quartiermeister“, führt jede Handlung einmal vor. Danach ist der Spieler dran.
2. **Im Spiel, nie davor.** Keine Startseite mit Erklärungen, kein Modaldialog, keine Pause. Die Partie läuft vom ersten Moment an.
3. **Eine Zeile je Schritt,** höchstens etwa 60 Zeichen. Alles Weitere erklären die vorhandenen Tooltips und Erklärzeilen.
4. **Nichts sperren.** Der Spieler kann jederzeit anderes tun. Erledigt er einen Schritt vorzeitig oder auf anderem Weg, gilt er als erledigt.
5. **Nur das Fundament.** Das Tutorial erklärt höchstens fünf Dinge. Für alles Spätere gibt es Erstkontakt-Hinweise im Moment der Freischaltung.
6. **Unabhängig vom Pacing-Modus.** Die Schritte hängen an Spielereignissen, nicht an Gebäuden oder Karten einer bestimmten Spielphase. Damit funktioniert das Tutorial im heutigen Spiel und in beiden Experiment-Branches (`exp/kartenpfad`, `exp/zeitalter`).

## 2. Anforderungen

| REQ | Titel | Priorität |
|---|---|---|
| T.01 | Ablauf der fünf Schritte | Muss |
| T.02 | Führungsfigur und Hervorhebung | Muss |
| T.03 | Schonfrist in der Tutorial-Partie | Muss |
| T.04 | Start, Überspringen, Wiederholen | Muss |
| T.05 | Entdecken nach dem Tutorial | Muss |
| T.06 | Technik und Invarianten | Muss |
| T.07 | Messung | Soll |

### REQ-T.01 Ablauf der fünf Schritte

| # | Ziel | Auslösendes Ereignis (Schritt erledigt) | Zeile (Entwurf) | Hervorhebung |
|---|---|---|---|---|
| 1 | Fertigen | 10 Material per Klick gefertigt | „Fertige Material. Klick!“ | Klickfeld |
| 2 | Bauen | Erstes Gebäude auf einem Bauplatz errichtet (die erste Fabrik ist kostenlos) | „Eine Fabrik fertigt für dich.“ | Freier Bauplatz in der Welt und im Reiter *Bauen* |
| 3 | Einheiten kaufen | Drei Einheiten gekauft | „Rekrutiere drei Läufer.“ | Reiter *Armee*, Kaufknopf |
| 4 | Welle ausschicken | Die eigene Welle rückt aus | „Sie marschieren mit der nächsten Welle.“ | Wellen-Countdown in der Ressourcenleiste, danach die Armee in der Welt |
| 5 | Erster Sieg | Erste gegnerische Welle besiegt | „Gut. Bauen, rüsten, halten.“ (Abschiedszeile) | – |

**Regeln**

- Die Schritte erscheinen nacheinander. Ist ein Ziel bereits erfüllt, wird der Schritt übersprungen.
- **Schritt 4:**
  - Hat das Spiel einen Knopf zum sofortigen Ausschicken (z. B. „Welle vorziehen“ aus Iteration 6), zeigt der Schritt diesen Knopf.
  - Sonst zeigt er den Countdown. Die Kamera folgt dann dem Ausmarsch, sofern der Spieler sie nicht selbst bewegt.
- Nach Schritt 5 verabschiedet sich der Quartiermeister und verschwindet. Die folgende Kartenwahl öffnet sich nach der Regel aus Iteration 6. Für die erste Kartenwahl gibt es einmalig eine Zusatzzeile: „Wähle eine Karte. Jede verändert dein Reich.“
- **Zieldauer:** Ein neuer Spieler schließt alle fünf Schritte in höchstens 2:30 min ab.

### REQ-T.02 Führungsfigur und Hervorhebung

- **Quartiermeister:** eine kleine Figur in der Welt vor dem Tor, gezeichnet mit den vorhandenen Mitteln (Farbton der eigenen Seite, ohne neue Grafikdateien).
- **Vorführen:**
  - Zu Schritt 1 und 2 führt die Figur die Handlung einmal vor. Sie fertigt einmal, und der Zähler steigt sichtbar. Sie zeigt auf den Bauplatz.
  - Erst danach erscheint die Zeile.
- **Zeigen:** Die Zeile erscheint als Sprechblase an der Figur. Bei Zielen im Arbeitsbereich erscheint sie direkt am hervorgehobenen Element.
- **Hervorhebung:** pulsierender Rahmen um das Ziel, höchstens ein Ziel gleichzeitig. Keine Abdunklung des übrigen Bildschirms, da diese den Spieler sperren würde (Grundsatz 4).
- Liegt das Ziel außerhalb des sichtbaren Weltausschnitts, zeigt ein Pfeil am Rand die Richtung.
- **Reiterwechsel:** Für Ziele in einem anderen Reiter wird zuerst der Reiterknopf hervorgehoben. Das Tutorial wechselt Reiter nie selbst; die Regel aus REQ-5.03 gilt weiter.

### REQ-T.03 Schonfrist in der Tutorial-Partie

- Die erste gegnerische Welle rückt erst aus, wenn Schritt 4 erledigt ist, spätestens aber nach einem Zeitlimit (Wert in `config.js`, Vorschlag 150 s).
- Die erste gegnerische Welle der Tutorial-Partie ist klein genug, dass drei Läufer sie halten (Wert in `config.js`).
- Danach läuft die Partie mit den normalen Werten des gewählten Schwierigkeitsgrades. Die Tutorial-Partie startet immer auf Leicht.
- Die Schonfrist gilt nur, solange das Tutorial aktiv ist. Wird es übersprungen, entfällt sie sofort.

### REQ-T.04 Start, Überspringen, Wiederholen

- Das Tutorial startet automatisch in der ersten Partie eines Browsers. Merker in `localStorage`, Zugriff in `try/catch`. Fehlt der Speicher, startet es jedes Mal mit Überspringen-Knopf.
- Ein Knopf „Tutorial überspringen“ ist während des Tutorials immer sichtbar (Ressourcenleiste). Überspringen beendet es sofort; die Partie läuft normal weiter.
- Im Menü: „Tutorial wiederholen“ startet eine neue Partie mit Tutorial.
- Mit `?tutorial=1` lässt sich das Tutorial erzwingen, mit `?tutorial=0` unterdrücken (für Tests und Spieltests).

### REQ-T.05 Entdecken nach dem Tutorial

- Die vorhandenen Erstkontakt-Hinweise (`hints.js`) bleiben das Werkzeug für alle späteren Mechaniken. Sie erscheinen, wenn ein Inhalt erstmals verfügbar wird: Mauer, Türme, Schmiede, Universität, Handelskontor, Nachbarschaftsboni, Zinsen, Zeitalter bzw. Technologiekarten.
- **Regeln für Hinweise:**
  - höchstens einer gleichzeitig,
  - nie während eines Tutorial-Schritts,
  - eine Zeile,
  - schließt sich nach 8 s oder per Klick,
  - erscheint je Browser nur einmal.
- **Neu freigeschaltete Inhalte** (Reiter, Gebäudeoptionen, Einheiten) tragen beim ersten Erscheinen eine Markierung „neu“. Sie verschwindet, wenn der Spieler den Inhalt einmal angesehen hat. Das ist der Entdeckungsmoment; die Erklärung liefern Tooltip und Erklärzeile.
- **Die bisherige Einführung aus v0.5/v0.6 entfällt.** Ihre Texte werden geprüft: Was zu den fünf Schritten gehört, wandert ins Tutorial, der Rest in Erstkontakt-Hinweise. Die Zuordnung steht im Bericht.

### REQ-T.06 Technik und Invarianten

- Eigene Datei `tutorial.js` ohne Spielregeln. Sie hört auf Ereignisse, die `core.js` bereits auslöst oder neu auslöst (`materialProduced`, `buildingBuilt`, `unitBought`, `waveDeparted`, `enemyWaveDefeated`). `core.js` kennt das Tutorial nicht.
- **Ausnahme Schonfrist:** Sie wird über einen Konfigurationswert gesteuert, den `ui.js` beim Start einer Tutorial-Partie setzt. `core.js` bleibt ohne DOM.
- Schrittdefinitionen deklarativ in `data/tutorial-steps.js` (Ziel-Ereignis, Schwellenwert, Hervorhebung, Text-Schlüssel). Texte in `i18n/de.js` und `i18n/en.js`.
- Die Bot-Simulation läuft immer ohne Tutorial. Ein Test stellt sicher, dass Partien ohne Tutorial durch diese Änderung unverändert bleiben (gleicher Seed, gleiches Ergebnis wie vorher).
- Das Tutorial nutzt keine eigenen Zeichendateien. Figur, Rahmen und Pfeil entstehen mit den vorhandenen Canvas- und CSS-Mitteln.

### REQ-T.07 Messung (Soll)

- Das Sitzungsprotokoll (`?debug=1`) erfasst: Zeitpunkt jedes erledigten Schritts, Überspringen (ja/nein, in welchem Schritt), Zahl der Klicks außerhalb des hervorgehobenen Ziels je Schritt.
- `tools/compare-human.mjs` wertet diese Felder aus. Wo Spieler hängen bleiben, zeigt sich an langen Schrittzeiten und vielen Fehlklicks.

## 3. Akzeptanzkriterien

- **Playwright:** Ein neuer Browser (leerer Speicher) startet mit Tutorial. Alle fünf Schritte werden nacheinander erledigt, Abschluss in unter 2:30 min Spielzeit bei direkter Bedienung.
- **Playwright, Reihenfolge vertauscht:** Erst eine Fabrik bauen, dann fertigen → Schritt 2 gilt als erledigt, Schritt 1 läuft weiter; keine Fehlermeldung.
- **Überspringen:** Knopf beendet das Tutorial in jedem Schritt; die Schonfrist entfällt (Test: erste Gegnerwelle startet zum normalen Zeitpunkt).
- **Zweiter Start** im selben Browser: kein Tutorial. Menü „Tutorial wiederholen“: Tutorial startet.
- **Erstkontakt-Hinweise:** nie während eines Tutorial-Schritts, nie mehr als einer gleichzeitig.
- `tooltipAudit` und `explAudit` grün; alle Texte in beiden Sprachen; keine Konsolenfehler.
- Bot-Simulation mit gleichem Seed liefert dieselben Ergebnisse wie vor der Änderung.

## 4. Einordnung und offene Punkte

| Punkt | Standard |
|---|---|
| Zeitpunkt der Umsetzung | Auf `main`, nach dem gemeinsamen Unterbau für die Pacing-Branches. Beide Branches erben das Tutorial. |
| Tutorial-Partie auf Leicht | Ja; Wahl des Schwierigkeitsgrades erst ab der zweiten Partie |
| Abschiedszeile | Anlehnung an „Build, expand, defend“: „Bauen, rüsten, halten.“ |
| Werfer, Mauer, Karten im Tutorial | Nein; Erstkontakt-Hinweise und Pacing |
| Name der Führungsfigur | „Quartiermeister“, änderbar |

**Schwache Annahme:** Ein Tutorial von zwei Minuten setzt voraus, dass die übrigen Mechaniken sich über Tooltips und Erklärzeilen selbst erklären. Ob das stimmt, zeigt nur ein Spieltest mit Menschen, die das Spiel nicht kennen. Der Testleitfaden sollte deshalb eine Partie ohne jede Hilfe von außen enthalten. Die Messung aus REQ-T.07 zeigt, wo der Faden reißt.

## Quellen

| Quelle | URL | Vertrauen | Anmerkung |
|---|---|---|---|
| Kingdom Wiki, Ghost | https://kingdomthegame.fandom.com/wiki/Ghost | Mittel | Community-Wiki; Führung durch Vorzeigen und Zeigen, Abschiedszeile „Build, expand, defend“, überspringbar |
| Wikipedia, Kingdom: New Lands | https://en.wikipedia.org/wiki/Kingdom:_New_Lands | Mittel | Münzen als einzige Schnittstelle |

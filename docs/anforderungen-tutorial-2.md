# Klammerfront – Anforderungen Tutorial, Teil 2: Erzählung, Kartenabschluss, Startauswahl

Stand: 06.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-tutorial-2.md` · Baut auf `docs/anforderungen-tutorial.md` auf

## 0. Auftrag in Kürze

Die Mechanik des Tutorials funktioniert. Der Test zeigt drei Lücken:

1. **Keine Erzählung.** Der Quartiermeister erklärt Handlungen, aber nicht, warum sie nötig sind. Es fehlen Begrüßung und ein Rahmen.
2. **Das Ende ist offen.** Die erste Kartenwahl gehört zum Fundament des Spiels und soll den Abschluss des Tutorials bilden.
3. **Sprache und Schwierigkeitsgrad lassen sich vor der Partie nicht mehr wählen.** Vermutliche Ursache: Teil 1 hat das Tutorial ohne Startseite und immer auf Leicht starten lassen. Das war eine Fehlvorgabe im Anforderungsdokument und wird hier korrigiert.

Die übrigen Regeln aus Teil 1 gelten weiter:

- Das Spiel läuft, nichts wird gesperrt, Schritte zählen auch in anderer Reihenfolge.
- Das Tutorial ist überspringbar.
- Die Bot-Simulation läuft ohne Tutorial.

## 1. Anforderungen

| REQ | Titel | Priorität |
|---|---|---|
| T2.01 | Startauswahl: Sprache, Schwierigkeitsgrad, Tutorial | Muss |
| T2.02 | Erzählrahmen und Begrüßung | Muss |
| T2.03 | Erzählte Schritte | Muss |
| T2.04 | Abschluss mit der ersten Kartenwahl | Muss |
| T2.05 | Einladung zum Entdecken und Entlassung ins freie Spiel | Muss |
| T2.06 | Quartiermeister 20 % größer | Muss |
| T2.07 | Darstellung der Sprechblasen | Soll |

---

### REQ-T2.01 Startauswahl: Sprache, Schwierigkeitsgrad, Tutorial

**Befund (PO):** Vor der Partie fehlen die Wahl von Sprache und Schwierigkeitsgrad.

**Zuerst prüfen:**

- Wann ist die Auswahl verschwunden? Prüfen über `git log` und die Tests.
- Wahrscheinlich startet der Tutorial-Pfad die Partie direkt und umgeht dabei den bisherigen Startdialog.
- Ursache in `docs/STAND.md` festhalten.

**Anforderungen**

- **Startbildschirm vor jeder neuen Partie,** kurz und ohne Erklärtexte:
  - **Sprache:** Deutsch, Englisch. Standard ist beim ersten Start die Browsersprache (Deutsch, wenn sie mit `de` beginnt, sonst Englisch), danach die zuletzt gewählte.
  - **Schwierigkeitsgrad:** Leicht, Normal, Schwer. Bei der ersten Partie ist Leicht vorausgewählt und trägt den Zusatz „empfohlen für den Einstieg“; danach die zuletzt gewählte Stufe.
  - **Tutorial:** Schalter. Bei der ersten Partie an, danach aus.
  - Knopf „Partie beginnen“.
- **Das Tutorial läuft auf jedem Schwierigkeitsgrad.**
  - Die Schonfrist und die kleine erste Gegnerwelle aus REQ-T.03 gelten unabhängig vom Grad.
  - Danach gelten die Werte des gewählten Grades.
  - Diese Regel ersetzt in REQ-T.03 den Satz „Die Tutorial-Partie startet immer auf Leicht“.
- **Wechsel im Spiel:**
  - Die Sprache lässt sich weiterhin über das Menü wechseln, auch während des Tutorials. Sprechblasen erscheinen dann sofort in der neuen Sprache.
  - Der Schwierigkeitsgrad lässt sich nur vor der Partie wählen.
- Die Merker für Sprache, Grad und „erste Partie“ liegen in `localStorage`; jeder Zugriff in `try/catch`.
- Die URL-Parameter `?tutorial=1` und `?tutorial=0` aus Teil 1 bleiben. Neu: `?lang=de|en` und `?difficulty=easy|normal|hard` überspringen den Startbildschirm für Tests.

**Akzeptanzkriterien**

- Playwright, leerer Speicher: Der Startbildschirm erscheint; Leicht und Tutorial sind vorausgewählt; die Sprache folgt der Browsersprache.
- Wahl Englisch und Schwer → die Partie läuft auf Englisch und Schwer, das Tutorial erscheint auf Englisch. Nach dem Tutorial entspricht die Gegnerstärke den Schwer-Werten (Test über den Spielstand).
- Zweite Partie: Die letzte Wahl ist vorausgewählt, das Tutorial ist aus.
- Sprachwechsel während eines Tutorial-Schritts: Die Sprechblase wechselt ohne Neuladen.
- Ein Regressionstest stellt sicher, dass keine Partie ohne vorherigen Startbildschirm beginnt, außer mit den URL-Parametern.

---

### REQ-T2.02 Erzählrahmen und Begrüßung

**Rahmen (Entwurf, vom PO änderbar):** Horden aus dem Osten rücken vor. Das Tor des Spielers ist das letzte, das noch steht. Der Quartiermeister ist ein altgedienter Versorger der Truppe und begrüßt den neuen Feldherrn. Mehr Hintergrund braucht das Tutorial nicht. Weitere Erzählung kann später über Karten- und Gebäudetexte entstehen.

**Begrüßung:**

- Zwei Sprechblasen nach Partiebeginn, bevor Schritt 1 hervorgehoben wird.
- Jede bleibt mindestens 4 s stehen (Wert in `config.js`); ein Klick auf die Blase zeigt sofort die nächste.
- Klickt der Spieler währenddessen schon auf „Fertigen“, endet die Begrüßung, und Schritt 1 gilt als begonnen.
- Die Partie läuft während der Begrüßung; die Schonfrist schützt sie.

| # | Deutsch (Entwurf) | Englisch (Entwurf) |
|---|---|---|
| B1 | „Willkommen, Feldherr. Ich bin dein Quartiermeister.“ | “Welcome, commander. I am your quartermaster.” |
| B2 | „Die Horden aus dem Osten rücken vor. Unser Tor ist das letzte, das noch steht.“ | “The hordes from the east are coming. Our gate is the last one still standing.” |

---

### REQ-T2.03 Erzählte Schritte

Jede Sprechblase hat zwei Teile:

- **Erzählung:** ein Satz, warum der Schritt nötig ist.
- **Auftrag:** eine kurze, hervorgehobene Handlungsanweisung.

Die Blase bleibt stehen, bis der Schritt erledigt ist. Die Hervorhebungen aus REQ-T.02 bleiben unverändert.

| Schritt | Erzählung (DE) | Auftrag (DE) | Narration (EN) | Task (EN) |
|---|---|---|---|---|
| 1 Klicken | „Ohne Material keine Mauer und keine Klinge. Fang mit eigener Hand an.“ | „Klicke auf Fertigen.“ | “No material, no walls, no blades. Start with your own hands.” | “Click Produce.” |
| 2 Fabrik | „Deine Hände werden müde. Eine Fabrik fertigt weiter, während du anderes tust.“ | „Baue eine Fabrik.“ | “Your hands will tire. A factory keeps producing while you do other things.” | “Build a factory.” |
| 3 Armee | „Material allein hält keine Horde auf. Wir brauchen Soldaten.“ | „Rekrutiere drei Läufer.“ | “Material alone won't stop a horde. We need soldiers.” | “Recruit three runners.” |
| 4 Welle | „Deine Soldaten rücken mit der nächsten Welle aus und stellen sich der Horde.“ | „Sieh zu, wie sie ausrücken.“ | “Your soldiers march out with the next wave to face the horde.” | “Watch them march.” |

**Regeln**

- Länge: Erzählung höchstens etwa 90 Zeichen, Auftrag höchstens etwa 30 Zeichen. Diese Regel ersetzt die Grenze von 60 Zeichen aus Teil 1.
- Wird ein Schritt vorzeitig erledigt, entfällt seine Sprechblase. Erzählung wird nie nachgeholt.
- Die bisherigen Schritttexte aus Teil 1 werden durch diese ersetzt. Alle Texte stehen in `i18n/de.js` und `i18n/en.js`.
- Die Einheitenbezeichnung in Schritt 3 („Läufer“/“runners”) muss der Bezeichnung im Spiel entsprechen; Claude Code gleicht sie mit dem vorhandenen Text-Schlüssel ab.

---

### REQ-T2.04 Abschluss mit der ersten Kartenwahl

**Ziel:** Wehrt der Spieler die erste gegnerische Welle mit seinen Soldaten ab, reichen die EP genau für die erste Kartenwahl. Diese Wahl ist der letzte Tutorial-Schritt.

**Anforderungen**

- **EP-Garantie:**
  - Ist die erste gegnerische Welle der Tutorial-Partie vollständig besiegt, wird der EP-Stand mindestens auf die Schwelle der ersten Kartenwahl angehoben. Im Spiel erscheint das als „Kriegsbeute“ mit schwebender Zahl.
  - Liegt der Stand bereits darüber, ändert sich nichts.
  - Die Garantie gilt nur im Tutorial und nur für diese Welle.
- **Wer zählt:** Abschüsse durch Türme zählen mit. Die erste Tutorial-Welle ist so klein, dass sie in der Regel vor den Türmen fällt.
- **Erzählung zur Kartenwahl** (Sprechblase am Reiter „Karten“, der sich nach der Regel aus Iteration 6 automatisch öffnet):

| | Deutsch (Entwurf) | Englisch (Entwurf) |
|---|---|---|
| Erzählung | „Die erste Welle ist gebrochen. Aus jedem Kampf lernen wir etwas.“ | “The first wave is broken. Every battle teaches us something.” |
| Auftrag | „Wähle eine Karte. Sie verändert dein Reich.“ | “Choose a card. It will change your realm.” |

- Die Eingabesperre der Kartenwahl (400 ms) gilt weiter. Die Sprechblase verdeckt keine Karte.
- Die Kartenwahl ersetzt den bisherigen Schritt 5 „Erster Sieg“ aus REQ-T.01. Das Tutorial hat damit fünf Schritte: Klicken, Fabrik, Armee, Welle, Karte.

**Akzeptanzkriterien**

- Playwright: Erste Gegnerwelle besiegt → EP ≥ Schwelle → Kartenwahl öffnet sich → Sprechblase sichtbar.
- Test: Liegt der EP-Stand vor dem Sieg schon über der Schwelle, bleibt er unverändert.
- Test: Ohne Tutorial gibt es keine Kriegsbeute (gleicher Seed, gleiche EP wie vorher).
- Fällt die erste Welle nicht, weil die Soldaten verlieren, läuft das Spiel normal weiter. Das Tutorial bleibt in Schritt 4, bis eine gegnerische Welle besiegt ist.

---

### REQ-T2.05 Einladung zum Entdecken und Entlassung ins freie Spiel

- Nach der ersten Kartenwahl verabschiedet sich der Quartiermeister mit zwei Sprechblasen, je mindestens 4 s oder bis zum Klick:

| # | Deutsch (Entwurf) | Englisch (Entwurf) |
|---|---|---|
| A1 | „Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden.“ | “Walls, towers, forge, university – much is waiting to be discovered.” |
| A2 | „Was neu ist, ist markiert. Halte das Tor, Feldherr.“ | “Whatever is new is marked. Hold the gate, commander.” |

- Danach geht der Quartiermeister durch das Tor zurück und verblasst. Das Tutorial ist beendet, die Schonfrist entfällt, die Partie läuft als freies Spiel weiter.
- Die „neu“-Markierungen und Erstkontakt-Hinweise aus REQ-T.05 übernehmen ab hier.
- Die erwähnten Inhalte müssen zum Pacing-Modus passen: In `exp/kartenpfad` und `exp/zeitalter` nennt A1 nur Inhalte, die dort grundsätzlich vorkommen. Die Texte sind je Modus überschreibbar (Text-Schlüssel mit Modus-Suffix, Standard als Rückfall).

---

### REQ-T2.06 Quartiermeister 20 % größer

- Darstellungsgröße der Figur ×1,2 gegenüber dem jetzigen Stand, Wert in `config.js` (`TUTORIAL.guideScale = 1.2`).
- Die Figur bleibt vor dem Tor und verdeckt keine eigene Einheit beim Ausrücken. Bei Bedarf weicht sie seitlich aus.
- Auch bei 1280×720 ist sie gut erkennbar; Bildschirmfoto im Bericht.

---

### REQ-T2.07 Darstellung der Sprechblasen (Soll)

- Erzählung in normaler Schrift, Auftrag darunter fett oder farblich abgesetzt.
- Sanftes Einblenden (≤ 200 ms). Kein Schreibmaschinen-Effekt, damit Lesen nicht verzögert wird.
- Die Blase passt sich der Textlänge an und bleibt bei Englisch und Deutsch innerhalb des Bildschirms.
- Ein kleines Symbol zeigt, dass ein Klick auf die Blase weiterführt, sofern die Blase nicht an einen Auftrag gebunden ist.

## 2. Akzeptanz insgesamt

- Playwright-Durchlauf mit leerem Speicher:
  1. Startbildschirm,
  2. Begrüßung,
  3. vier erzählte Schritte,
  4. erste Gegnerwelle besiegt,
  5. Kartenwahl,
  6. Abschied,
  7. freies Spiel.

  Erledigt in beiden Sprachen und in unter 3:00 min Spielzeit bei direkter Bedienung.
- Überspringen in jedem Schritt beendet Tutorial, Schonfrist und Kriegsbeute sofort.
- `tooltipAudit` und `explAudit` grün; alle neuen Texte in beiden Sprachen; keine Konsolenfehler.
- Bot-Simulation mit gleichem Seed liefert dieselben Ergebnisse wie vor der Änderung.
- Das Sitzungsprotokoll (`?debug=1`) erfasst zusätzlich: gewählte Sprache und Grad, Dauer der Begrüßung, ob Sprechblasen per Klick übersprungen wurden.

## 3. Offene Punkte mit gesetztem Standard

| Punkt | Standard |
|---|---|
| Erzählrahmen „Horden aus dem Osten, letztes Tor“ | Übernehmen; Texte sind Entwürfe des PO und jederzeit änderbar |
| Anrede „Feldherr“ / “commander” | Übernehmen |
| Tutorial-Länge | Ziel unter 3:00 min (vorher 2:30), wegen Begrüßung und Kartenwahl |
| Kriegsbeute sichtbar machen | Ja, als schwebende Zahl; kein eigener Text |
| Erzählung über das Tutorial hinaus | Nicht in diesem Auftrag; später über Karten- und Gebäudetexte |

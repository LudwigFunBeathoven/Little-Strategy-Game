# Klammerfront – Anforderungen Iteration 5 (v0.6)

Stand: 29.09.2026 · Basis: Branch `3x3-und-3-Lanes-Spiel`, Commit `36a71ee` (v0.5) · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-iteration-5.md`

## 0. Auftrag in Kürze

Iteration 5 macht aus v0.5 eine Version, die Menschen testen können. Schwerpunkte:

- **Kampf:** Die eigene Armee rückt als eine gemeinsame Welle über alle drei Lanes vor. Jede Einheit wird einzeln simuliert und greift einzeln an.
- **Bedienung:** Klicks kommen zuverlässig und ohne spürbare Verzögerung an. Die Oberfläche wird in drei horizontale Bänder umgebaut.
- **Fortschritt:** Altmetall heißt künftig Erfahrungspunkte (EP). Die Universität erhält einen Forschungsbaum mit vier Zweigen.
- **Qualität:** Balancing gegen die bestehenden Zielkorridore, Fehlerbehebung, Polish und ein Testpaket für Spieltests mit Menschen.

Jedes Inkrement ist spielbar und ein Commit (`I5.0`–`I5.9`, linear). Reihenfolge und Abbruchregel stehen in Abschnitt 4.

## 1. Arbeitsgrundlagen

- **Vor Beginn lesen:** `CLAUDE.md` (Abschnitt „Arbeitsweise in Inkrementen“), `docs/STAND.md`, `docs/bericht-iteration-4.md`, dieses Dokument.
- **Branching:** Zuerst v0.5 per Fast-Forward nach `main` übernehmen (laut Entwicklungsreport konfliktfrei). Danach Branch `iteration-5` von `main`.
- **Invarianten aus v0.5 gelten unverändert:**
  - `core.js` ohne `document`, `window`, `localStorage`.
  - Zufall nur über `S.rng`; gleicher Seed, gleiche Partie.
  - Keine Regelzahlen außerhalb von `config.js` bzw. `data/`, keine sichtbaren Texte außerhalb von `i18n/`.
  - Spielstand ist azyklisches JSON; transiente Kampfdaten in Closure-Maps.
  - Jedes interaktive Element hat `data-tooltip` und eine Erklärzeile; `__kf.tooltipAudit()` und `__kf.explAudit()` bleiben grün.
- **Spielstand:** `SAVE_VERSION` wird 6. Keine Migration. Ein verworfener alter Spielstand wird dem Spieler mit einem Hinweis angezeigt, nicht still gelöscht.
- **Auslegungsregel:** Wo dieses Dokument eine Regel offenlässt, trifft Claude Code eine Annahme, dokumentiert sie in `docs/STAND.md` unter „Auslegungen“ und arbeitet weiter. Rückfrage an den Product Owner nur bei einem Widerspruch zwischen zwei Anforderungen.
- **Lehren aus Iteration 2–4, verbindlich:**
  - Jede neue Kampfmechanik zuerst per Kurzsimulation auf Patts prüfen (Abbruchkriterium: offene Partie nach 30 Minuten), erst dann balancieren.
  - Balancing-Entscheidungen auf mindestens 50 Partien je Feld, Abnahme auf 200.
  - Wahlraten und Kartendifferenzen sind Hinweise, keine Beweise; die gierige Heuristik gewichtet Wirtschaft zu hoch.

## 2. Ziele und Nicht-Ziele

**Ziele**

1. Die Armee wirkt als ein Verband, der auf den Gegner zurollt; Kämpfe entstehen aus einzelnen Einheiten.
2. Jeder Klick wird im nächsten Bild sichtbar beantwortet; Bauen gelingt mit höchstens zwei Klicks.
3. Die Oberfläche folgt dem Schema Leiste (10 %) – Spielwelt (50 %) – Arbeitsbereich (40 %).
4. Die Universität ist ein eigenständiger Fortschrittspfad neben Karten und Schmiede.
5. Die Zielkorridore aus dem Entwicklungsreport (Abschnitt 5) werden erreicht; aktive Spieler schneiden spürbar besser ab als Gelegenheitsspieler.
6. Ein Spieltest mit Menschen liefert Daten, die mit den Bot-Profilen vergleichbar sind.

**Nicht-Ziele**

- Kein Umbau des Handelskontors (erst nach dem Test mit Menschen).
- Keine Spielstand-Migration, kein Build-Schritt, kein Framework.
- Keine Optimierung für Bildschirme unter 1280×720 oder Touch-Geräte über das in REQ-5.01 Genannte hinaus.
- Keine neuen Gegnertypen; keine Erweiterung der Kartenliste über Anpassungen im Balancing hinaus.
- Keine Töne.

## 3. Anforderungen

| REQ | Titel | PO-Punkt | Priorität | Inkrement |
|---|---|---|---|---|
| 5.01 | Eingabe: zuverlässige und schnelle Klicks | 3, 5 | Muss | I5.1 |
| 5.02 | Erfahrungspunkte statt Altmetall | 4 | Muss | I5.2 |
| 5.03 | Oberfläche in drei Bändern | 7 | Muss | I5.3 |
| 5.04 | Bauen über den Arbeitsbereich | 3, 7 | Muss | I5.4 |
| 5.05 | Einzelsimulation der Einheiten | 2 | Muss | I5.5 |
| 5.06 | Armee als gemeinsame Welle | 1 | Muss | I5.6 |
| 5.07 | Universität mit Forschungsbaum | 4, 6 | Muss (Zweige A–C), Soll (Zweig D) | I5.7 |
| 5.08 | Balancing | 7d | Muss | I5.8 |
| 5.09 | Fehlerbehebung und technische Schulden | 7d | Muss | laufend, Abschluss I5.9 |
| 5.10 | Polish | 7d | Soll | I5.9 |
| 5.11 | Testpaket für Spieltests mit Menschen | – (Report §9) | Muss | I5.9 |

---

### REQ-5.01 Eingabe: zuverlässige und schnelle Klicks

**Befund (PO):** Für den Bau auf einem Feld sind teils mehrere Klicks nötig. Die Reaktion auf Klicks wirkt insgesamt träge. Die Ursache ist nicht bekannt.

**Vorgehen:** Erst reproduzieren und die Ursache belegen, dann beheben. Ein Playwright-Test zeigt den Fehler vor der Behebung rot und danach grün.

**Zu prüfende Hypothesen**, nach geschätzter Wahrscheinlichkeit:

1. *DOM-Neuaufbau je Tick:* Seitenleiste oder Kontextfeld werden per `innerHTML` neu geschrieben. Ein Knopf wird zwischen `pointerdown` und `pointerup` ersetzt; `click` feuert nicht.
2. *Kamera-Ziehen schluckt Klicks:* Die Erkennung des Ziehens hat keine Schwelle; schon ein Pixel Mausbewegung gilt als Scrollen.
3. *Trefferprüfung in der Canvas:* Die Umrechnung Bildschirm → Welt ignoriert Kameraversatz, CSS-Skalierung oder `devicePixelRatio`; Klicks am Feldrand verfehlen.
4. *Bedienführung:* Der erste Klick wählt das Feld, erst der zweite baut. Dann liegt kein Fehler vor, aber eine unklare Führung (wird in REQ-5.04 gelöst).
5. *Kopplung an den Logik-Tick:* Eine Aktion wird erst im nächsten Tick ausgeführt oder angezeigt.

**Anforderungen**

- Interaktive Elemente werden einmal erzeugt und danach nur in Inhalt und Zustand aktualisiert (Text, `disabled`, Klassen). Kein Neuaufbau eines Elements, über dem der Zeiger steht.
- Zeichnen in `requestAnimationFrame`, Spiellogik im festen Takt `TICK_S`. Die Oberfläche aktualisiert höchstens einmal je Bild und nur geänderte Werte.
- Das Klickfeld löst auf `pointerdown` aus; alle übrigen Knöpfe auf `click`.
- Ziehschwelle für die Kamera (Vorschlag 6 px, Wert in `config.js`, Abschnitt UI). Unterhalb der Schwelle ist die Geste ein Klick.
- Eine einzige Funktion `screenToWorld` für alle Treffer in der Canvas; getestet für verschiedene Kamerapositionen und `devicePixelRatio` 1 und 2.
- Jede Eingabe erhält im nächsten Bild eine sichtbare Rückmeldung (Druckzustand, Zähler, Auswahlrahmen).
- Auf Spielflächen `touch-action: manipulation` und `user-select: none` (verhindert Verzögerung durch Doppeltipp-Zoom und versehentliche Textauswahl).
- Keine automatische Wiederholung bei gedrückter Maustaste: Sie würde die Kennzahlen zum Klickanteil verfälschen.

**Akzeptanzkriterien**

- Playwright: 100 Klicks an zufälligen Punkten (Seed) innerhalb freier Bauplätze, bei laufendem Spiel und wechselnder Kameraposition, ergeben 100 Treffer.
- 50 Klicks auf das Klickfeld in 5 Sekunden erhöhen den Zähler um 50 (Klickdeckel im Test per `KF_OVERRIDE` angehoben).
- Zeit von der Eingabe bis zur sichtbaren Änderung, gemessen wie die Bildzeit (`getImageData` bzw. DOM-Mutation): Median ≤ 20 ms, p95 ≤ 50 ms im kopflosen Browser.
- In `docs/STAND.md` steht, welche Hypothese zutraf.

---

### REQ-5.02 Erfahrungspunkte statt Altmetall

**Anforderungen**

- Altmetall heißt überall **Erfahrungspunkte**, kurz **EP** (englisch: *Experience*, *XP*).
- Die Umbenennung umfasst sichtbare Texte (`i18n/de.js`, `i18n/en.js`) und interne Bezeichner (z. B. `scrap` → `xp`), damit Code und Oberfläche dieselben Begriffe verwenden.
- Die Mechanik bleibt unverändert: EP-Quellen, Stufen und Kartenwahl wie in v0.5. Passive EP-Erzeugung kommt erst mit REQ-5.07.

**Akzeptanzkriterien**

- Ein Test findet in Quelltext, Daten und Texten keine Fundstelle von „Altmetall“ oder dem alten internen Bezeichner mehr (Ausnahme: `CHANGELOG.md` und archivierte Berichte).
- Alle bestehenden Tests laufen nach Anpassung der Bezeichner grün.

---

### REQ-5.03 Oberfläche in drei Bändern

Die Oberfläche wird horizontal gegliedert. Die bisherige Seitenleiste entfällt; ihr Inhalt wandert in Leiste und Arbeitsbereich.

| Band | Höhe | Inhalt |
|---|---|---|
| Ressourcenleiste | 10 % (min. 56 px, max. 80 px) | Siehe unten |
| Spielwelt | 50 % | Reich (3×3), Mauer, drei Lanes, Gegnerbasis; horizontal scrollbar wie in v0.5 |
| Arbeitsbereich | 40 % | Klickfeld links fest, rechts Reiter mit kontextabhängiger Ansicht |

**Ressourcenleiste** (immer sichtbar, von links nach rechts):

- Aktive Soldaten: auf dem Feld / Versorgungslimit.
- Material: Bestand und Ertrag je Sekunde.
- EP: Bestand, Ertrag je Sekunde, Fortschrittsbalken bis zur nächsten Kartenwahl.
- Nächste eigene Welle (Countdown), nächste gegnerische Welle; Warnung vor der Belagerungswelle.
- Lebenspunkte der Mauer.
- Zustand der Armee: Marsch, Kampf oder Sammeln (REQ-5.06).
- Spielzeit und Phase; Menü (Pause, Sprache, neue Partie).
- Eine offene Kartenwahl erscheint als auffälliger Hinweis; ein Klick darauf öffnet den Reiter „Karten“.

**Spielwelt:** Aufbau und Darstellung wie in v0.5. Die Welt skaliert vertikal auf die Bandhöhe; drei Lanes und Reich sind ohne vertikales Scrollen vollständig sichtbar.

**Arbeitsbereich:**

- Links, etwa ein Viertel der Breite: Klickfeld, immer sichtbar.
- Rechts: Reiter
  - *Bauen* (3×3-Raster, Fabriken, Abriss),
  - *Mauer & Türme*,
  - *Armee* (Einheiten und Wellenzusammensetzung, soweit in v0.5 vorhanden),
  - *Schmiede* (erst sichtbar, wenn freigeschaltet),
  - *Universität*,
  - *Karten* (offene Wahl, gewählte Karten mit Stufen).
- **Kontextabhängige Standardansicht:**
  - Standard ist der zuletzt gewählte Reiter, beim Start *Bauen*.
  - Ein Klick auf ein Objekt in der Spielwelt (Bauplatz, Gebäude, Mauer, Turm) öffnet den passenden Reiter, markiert das Objekt in der Welt und zeigt es oben im Reiter als Kontextkopf mit seinen Aktionen (Bauen, Ausbauen, Abreißen, Reparieren).
  - `Esc` oder ein Klick auf eine leere Stelle der Welt hebt die Auswahl auf; der Reiter bleibt.
  - Kein automatischer Reiterwechsel ohne Handlung des Spielers, auch nicht bei einer offenen Kartenwahl. Die Oberfläche verschiebt sich nie unter dem Mauszeiger.
- Reiter mit neuem Inhalt tragen eine Markierung (neue Kartenwahl, Forschung fertig).
- Paneele scrollen bei Bedarf intern vertikal; die Seite selbst hat keine Scrollleisten.
- Das Kontextfeld aus v0.5 geht im Kontextkopf auf. Die Einführung wird an das neue Layout angepasst.

**Technik:** `ui.js` (1.117 Zeilen) wird aufgeteilt, ohne Build-Schritt:

- `render.js` – Canvas, Kamera, Zeichnen;
- `hud.js` – Ressourcenleiste;
- `panels.js` – Arbeitsbereich und Reiter;
- `ui.js` – Verdrahtung, Eingabe, Speichern.

Die Bandhöhen stehen in `config.js` (Abschnitt UI).

**Akzeptanzkriterien**

- Playwright bei 1280×720, 1366×768, 1920×1080 und 2560×1440: Bandhöhen innerhalb ± 2 % des Sollwerts bzw. innerhalb der Mindest-/Höchstwerte; kein Dokument-Scroll; Bildschirmfotos werden im Bericht abgelegt.
- Klick auf ein Gebäude in der Welt öffnet dessen Reiter mit Kontextkopf (Test je Objekttyp).
- Alle Reiter sind per Tastatur erreichbar.
- `tooltipAudit` und `explAudit` sind grün.
- Die Lesbarkeit der Einheiten bei 1280×720 ist per Bildschirmfoto belegt (die Spielwelt hat dort nur rund 360 px Höhe).

---

### REQ-5.04 Bauen über den Arbeitsbereich

**Anforderungen**

- Ein Klick auf einen freien Bauplatz in der Welt öffnet den Reiter *Bauen*, wählt den Platz aus und zeigt sofort alle Gebäudeoptionen mit Kosten. Ein Klick auf eine Option baut. **Höchstens zwei Klicks vom Feld zum Bau.**
- Der Reiter *Bauen* zeigt das 3×3-Raster zusätzlich als Knopfraster. Bauen ist damit ohne die Welt und per Tastatur möglich (Pfeiltasten, Enter). Das schließt den offenen Punkt „Tastaturzugang zu Bauplätzen“ aus Report §9.
- Nicht bezahlbare Optionen bleiben sichtbar, sind deaktiviert und nennen die fehlende Menge.
- Nach dem Bau bleibt der Platz ausgewählt und zeigt das neue Gebäude mit Ausbau und Abriss.

**Akzeptanzkriterien**

- Test: freies Feld → gebautes Gebäude in genau zwei Klicks, aus Welt und aus Knopfraster.
- Test: Bau vollständig per Tastatur.

---

### REQ-5.05 Einzelsimulation der Einheiten

**Ist (v0.5):** Formationen kämpfen als Block: die ganze vorderste Reihe plus Fernkämpfer-Reihen.
**Soll:** Jede Einheit ist eigenständig: Position (Lane, x, Platz in der Formation), Lebenspunkte, eigene Angriffsabklingzeit, eigenes Ziel.

**Regeln**

1. **Zielwahl je Einheit, deterministisch:**
   - (a) Gegner in der aktuellen Lane in Reichweite, der nächste zuerst.
   - (b) Nur wenn dort keiner ist: Gegner einer anderen Lane nach den Regeln aus REQ-5.06.
   - Bei Gleichstand gewinnt die niedrigste Einheiten-ID. Ein Ziel bleibt bestehen, bis es fällt oder die Reichweite verlässt.
2. **Nahkämpfer** greifen nur bei Kontakt an. Fällt eine Einheit vorn, rücken hintere Nahkämpfer innerhalb der Formation nach.
3. **Fernkämpfer** schießen über eigene Reihen; Reichweite je Typ in `config.js`.
4. **Gleichzeitige Auflösung:** Alle Angriffe eines Ticks werden aus dem Zustand zu Tickbeginn bestimmt und danach gemeinsam angewendet. Keine Seite hat einen Zugvorteil.
5. Ein Treffer wirkt auf genau ein Ziel; überschüssiger Schaden verfällt. Karteneffekte auf Einheiten wirken weiter, nun je Einheit.
6. Türme wählen ebenfalls einzelne Einheiten als Ziel (Regeln wie Punkt 1).
7. Ziele werden gemäß Invariante als IDs in Closure-Maps geführt, nicht als Objektverweise im Spielstand.

**Leistung**

- Zielsuche je Lane vorsortiert, keine quadratische Suche über alle Einheiten des Feldes.
- Richtwert: ein Tick mit 2 × 60 Einheiten ≤ 1 ms in Node.
- Die Abnahmeserie darf höchstens 30 % länger dauern als die Basislinie aus I5.0.

**Darstellung**

- Jede Einheit an ihrer eigenen Position.
- Kurze Angriffsanzeige: Ausfallschritt im Nahkampf, sichtbares Geschoss im Fernkampf.
- Treffer lassen die Einheit kurz aufblitzen; Lebenspunktbalken nur bei beschädigten Einheiten.

**Akzeptanzkriterien**

- Tests: zwei Nahkämpfer gegen einen – beide greifen an; ein Fernkämpfer wählt das nächste Ziel; ein symmetrisches Duell endet mit beiden Einheiten tot (Gleichzeitigkeit); gleicher Seed, gleiche Partie.
- Kurzsimulation mit 200 Partien: keine offene Partie nach 30 Minuten.

---

### REQ-5.06 Armee als gemeinsame Welle

**Befund (PO, Screenshot v0.5):** Die Verbände stehen je Lane an unterschiedlichen Stellen; jede Lane zieht einzeln. Oben und unten stehen die Einheiten weit hinten, in der Mitte weit vorn.

**Begriffe**

- **Armee:** alle eigenen Einheiten auf dem Feld, die zum Hauptverband gehören.
- **Heimat-Lane:** die Lane, der eine Einheit zugewiesen ist.
- **Front:** x-Position der vordersten Reihe der Armee, gleich für alle Lanes.
- **Kontaktreichweite:** Abstand, ab dem ein Gegner die Armee in den Kampf zwingt (Wert in `config.js`).

**Zustände der Armee**

| Zustand | Verhalten | Übergang |
|---|---|---|
| **Marsch** | Alle Lanes halten eine gemeinsame Front. Tempo = langsamste Einheit der Armee. Nahkämpfer vorn, Fernkämpfer dahinter. | → Kampf, sobald in irgendeiner Lane ein Gegner (Einheit, Turm, Mauer, Basis) in Kontaktreichweite kommt. |
| **Kampf** | Die gesamte Armee hält an. Jede Einheit kämpft nach der Reihenfolge unten. | → Sammeln, sobald in keiner Lane mehr ein Gegner in Kontaktreichweite ist. |
| **Sammeln** | Jede Einheit kehrt in ihre Heimat-Lane zurück; die Formation ordnet sich neu. Die Front wird auf die Spitze der hintersten Lane gesetzt. | → Marsch, sobald alle Einheiten auf Position sind oder das Sammel-Zeitlimit abläuft (Vorschlag 4 s). |

**Kampfreihenfolge je Einheit** (Vorgabe des PO):

1. Gegner in der eigenen Lane.
2. Ist die eigene Lane frei: Gegner in einer anderen Lane. Die Einheit wechselt dorthin und reiht sich hinter der kämpfenden Formation ein (Nahkämpfer schließen vorn Lücken, Fernkämpfer stellen sich dahinter). Bei mehreren Kampf-Lanes hat die Mitte Vorrang, danach die Lane mit den meisten Gegnern, bei Gleichstand die obere.
3. Keine Gegner mehr: Sammeln in der Heimat-Lane, danach gemeinsamer Vormarsch.

**Ausnahme Mitte:** Fällt die letzte eigene Einheit der mittleren Lane, wird die Mitte sofort neu besetzt. Das hat Vorrang vor allen anderen Regeln, auch im Kampf.

- Die äußeren Lanes geben Einheiten ab, bis die Mitte ein Drittel der Armee hat (aufgerundet).
- Nahkämpfer werden bevorzugt abgegeben.
- Die Heimat-Lane der abgegebenen Einheiten ändert sich dauerhaft.

**Nachschub**

- Neue Wellen rücken als eigener Verband aus und laufen mit Aufschlusstempo (Vorschlag: 1,5 × Marschtempo) zur Armee.
- Unterwegs kämpfen sie nach denselben Regeln.
- Hinter der Armee angekommen, verschmelzen sie mit ihr und füllen die schwächste Lane auf (bei Gleichstand die Mitte).
- Fällt die Armee vollständig, bildet die nächste Welle ab dem Tor eine neue Armee.

**Gegnerseite:** Gegnerische Wellen einschließlich Belagerungswelle folgen derselben Logik, gespiegelt. Eine gemeinsame Implementierung in `core.js` für beide Seiten.

**Abgelöst:** Die Lane-Wahl und Unterstützungsregel der Formationen aus v0.5. Der Vorrang der Mitte (Fix aus I4.3) bleibt als Regel erhalten.

**Patt-Risiken, ausdrücklich zu prüfen**

1. Ein einzelner Gegner in einer Lane hält die gesamte Armee an. Erwartung: Er fällt schnell, weil alle freien Einheiten helfen. Messen: Anteil der Zeit im Zustand Kampf, Partiedauer.
2. Sammeln ohne Ende, weil Einheiten ihre Position nicht erreichen. Gegenmittel: Zeitlimit.
3. Beide Armeen außerhalb der Kontaktreichweite im Wechsel zwischen Sammeln und Kampf. Gegenmittel: Hysterese bei der Kontaktreichweite.
4. Die Armee wartet dauerhaft auf die langsamste Einheit. Messen: Partiedauer gegen v0.5.

**Darstellung**

- Zustand der Armee in der Ressourcenleiste.
- Im Marsch eine dezente Frontlinie über alle drei Lanes.

**Akzeptanzkriterien**

- Tests für jeden Zustandsübergang, für die Kampfreihenfolge, die Ausnahme Mitte und das Verschmelzen des Nachschubs.
- Im Marsch weicht die Front zwischen den Lanes höchstens um eine Einheitenbreite ab (Test und Bildschirmfoto).
- Kurzsimulation mit 200 Partien vor jedem Balancing: keine offene Partie nach 30 Minuten; Patt-Quote ≤ 2 %.

---

### REQ-5.07 Universität mit Forschungsbaum

**Befund (PO):** Die Universität ist zu schwach.
**Soll:** Vier Forschungszweige, deklarativ in `data/research.js` (Aufbau analog zu `data/draft-options.js`: `id`, `branch`, `tiers`, `cost`, `timeS`, `effect`, `requires`).

**Mechanik**

- Forschung kostet Material und Zeit. Kein EP, da EP die Kartenstufen treibt und eine zweite Verwendung die Kartenwahl verzögern würde.
- Eine Forschung gleichzeitig; Kosten steigen je Stufe.
- Effekte laufen über dieselbe Effekt-Pipeline wie Karten. Kein zweites Effektsystem.
- Die Zahlen unten sind Vorschläge; Claude Code legt sie per Simulation fest.

| Zweig | Forschung | Stufen | Effekt (Vorschlag) |
|---|---|---|---|
| **A Lehre** (EP-Automatik) | Hörsaal | I–III | Passiver EP-Ertrag. Teuer und langsam: Auf Stufe III höchstens 25 % des EP-Ertrags eines aktiven Spielers zur selben Spielzeit (Normal). |
| **B Archiv** (Kartenmanipulation) | Weitblick | I | +1 Kartenoption je Wahl |
| | Neu ziehen | I–II | 1× bzw. 2× je Kartenwahl alle Optionen neu ziehen |
| | Bann | I–II | 1 bzw. 2 Karten für diese Partie aus dem Pool entfernen |
| | Glücksgriff | I–II | Höhere Chance auf seltene Karten (+x pp) |
| **C Forschung** (global) | Ingenieurwesen | I–III | Gebäudekosten −x % |
| | Logistik | I–III | Versorgungslimit +1 je Stufe |
| | Drill | I–III | Takt der eigenen Wellen −x % |
| | Metallurgie | I–III | Materialertrag +x % |
| | Maurerkunst | I–II | Reparatur-Abklingzeit der Mauer −x % |
| **D Freischaltungen** (Soll) | Schildträger | I | Neue Einheit: Nahkampf, viele Lebenspunkte, langsam. Senkt das Armeetempo (REQ-5.06); dieser Zielkonflikt ist gewollt. |
| | Zweiter Forschungsplatz | I | Zwei Forschungen gleichzeitig |
| | Schmiede-Ausbau | I | Weitere Ausbaustufe der Schmiede |

**Oberfläche:** Reiter *Universität* mit einer Spalte je Zweig, laufender Forschung mit Fortschrittsbalken, Erklärzeile und Tooltip je Knopf.

**Bots:** Die gierige Strategie bewertet Forschungen per Vorausschau (wie Gebäude, 120 s). Die übrigen Profile nutzen die Universität nach einfachen Regeln.

**Akzeptanzkriterien**

- Test je Effekt; Forschungsstand wird gespeichert und geladen.
- Keine einzelne Forschung verändert die Siegquote um mehr als +25 pp (gleiche Messung wie bei Karten).
- Die Universität wird in der Abnahmeserie (Normal, gierig) in mindestens 40 % der Partien gebaut. Liegt der Wert darunter, ist sie weiter zu schwach.

---

### REQ-5.08 Balancing

**Grundsatz (PO-Entscheidung 29.09.2026):** Aktive Spieler werden belohnt. Die Zielkorridore aus Report §5 bleiben unverändert. Mehr Automatik (Presse, EP) darf den Abstand zwischen den Profilen nicht weiter verkleinern.

**Reihenfolge:** Balancing erst nach I5.5–I5.7. Einzelsimulation, Armeelogik und Universität verschieben alle 15 Felder.

**Vorab: Messfehler beheben.** „Nie klicken / Dauerklick“ zeigt auf Leicht 101 %. Ein Anteil über 100 % ist unmöglich; Definition und Berechnung sind vor jeder Balancing-Entscheidung zu prüfen.

**Zielwerte, die v0.5 verfehlt, und neue Kennzahlen**

| Kennzahl | Soll | v0.5 |
|---|---|---|
| Leicht gelegentlich | Sieg, 10–18 min | 100 % · 7:32 ✘ |
| Schwer durchschnitt | 13–20 min | 10:31 ✘ |
| Schwer gelegentlich | verliert (Siegquote ≤ 5 %) | 30 % ✘ |
| Ohne Schmiede auf Normal | ≥ 30 % | 28 % ✘ |
| Karten oder Forschungen über +25 pp | keine | 2 (Große Armee +38, Söldnerheer +32) ✘ |
| **Neu:** Profilabstand Leicht aktiv ↔ gelegentlich (Median) | ≥ 4 min | ca. 2 min |
| **Neu:** Anteil EP-Automatik am EP-Ertrag (Normal, aktiv) | ≤ 25 % | – |
| **Neu:** Zeitanteil der Armee im Zustand Kampf | berichten | – |

Alle übrigen Korridore aus Report §5 (Partiedauer je Feld, Patt-Quote ≤ 2 %, Klickanteile je Phase, Kartenabstand im Frühspiel ≥ 45 s) gelten weiter und dürfen nicht kippen.

**Hebel, in dieser Reihenfolge zu prüfen**

1. Automatik (Presse, EP-Hörsaal) teurer oder später verfügbar.
2. Große Armee und Söldnerheer abschwächen.
3. Stärke der Gegnerwellen je Schwierigkeitsgrad.
4. **Experiment „Schwung“** hinter dem Schalter `EXPERIMENT.momentum` in `config.js`, standardmäßig aus: Klicks erhöhen die Leistung der Automatik zeitweise (Vorschlag: bis +50 % für 20 s). Aktives Spiel wird belohnt, ohne Nichtklicker zu bestrafen. Nur simulieren und im Bericht auswerten; die Einführung entscheidet der PO.

**Akzeptanzkriterien:** Abnahmeserie mit 200 Partien je Feld; Tabelle im Format von Report §5, ergänzt um die neuen Kennzahlen; verfehlte Korridore mit Ursache und Vorschlag.

---

### REQ-5.09 Fehlerbehebung und technische Schulden

- Messfehler „101 %“ (siehe REQ-5.08).
- Hinweis bei verworfenem Spielstand (siehe Abschnitt 1).
- Aufteilung von `ui.js` (in REQ-5.03), Tastaturzugang zu Bauplätzen (in REQ-5.04).
- Offene Fehler aus `docs/STAND.md` abarbeiten oder begründet zurückstellen.
- **Durchlauftest:** Ein Playwright-Skript spielt je Schwierigkeitsgrad eine Partie bis Sieg oder Niederlage (beschleunigt über `KF_OVERRIDE`). Konsole ohne Fehler und Warnungen.
- **Leistung:** Bildzeit und Tick-Zeit verschlechtern sich um höchstens 20 % gegenüber der Basislinie aus I5.0.

---

### REQ-5.10 Polish (Soll)

- Rückmeldungen: Trefferaufblitzen, kurzes Verblassen gefallener Einheiten, schwebende Zahlen bei Material- und EP-Gewinn (gedrosselt, höchstens eine je Quelle und Sekunde).
- Übergänge zwischen Reitern ≤ 150 ms; keine Layoutsprünge beim Aktualisieren von Zahlen (feste Breiten für Zähler).
- Markierungen an Reitern (siehe REQ-5.03).
- Einführung an Layout und Armeelogik angepasst.

---

### REQ-5.11 Testpaket für Spieltests mit Menschen

**Begründung:** Seit Iteration 2 stützt sich jede Balancing-Entscheidung ausschließlich auf Bots (Report §9). Die Bot-Profile sind Annahmen.

**Anforderungen**

- **Debug-Modus** `?debug=1`: Exportiert ein Sitzungsprotokoll als JSON mit denselben Kennzahlen wie die Simulation:
  - Klicks je Minute und Phase,
  - Zeitpunkte der Kartenwahl, gewählte Karten und Forschungen,
  - größte Armee, Zeit bis zum ersten Mauerfall,
  - Ergebnis und Dauer.
- **Auswertung:** `tools/compare-human.mjs` liest Protokolle ein und ordnet jede Partie dem nächstliegenden Bot-Profil zu (Klicks/s, Reaktionsintervall, Einheitenlimit, Mauernutzung).
- **Testleitfaden** `docs/testleitfaden-iteration-5.md`:
  - Ablauf: eine Partie Leicht ohne Anleitung, eine Partie Normal;
  - sechs bis acht Beobachtungsfragen (u. a. „Wo hast du zweimal geklickt?“, „Wann wusstest du nicht, was zu tun ist?“);
  - Protokollvorlage.

**Akzeptanzkriterien:** Eine Bot-Partie im Browser erzeugt ein Protokoll, das `compare-human.mjs` ihrem eigenen Profil zuordnet.

## 4. Inkrementplan

| Inkrement | Inhalt | REQ | Abnahme |
|---|---|---|---|
| I5.0 | Merge v0.5 → `main`, Branch `iteration-5`, Basislinie: Kurzserie mit 50 Partien je Feld, Bildzeit, Tick-Zeit, Eingabelatenz, Dauer der Serie | – | Basiswerte in `docs/STAND.md` |
| I5.1 | Eingabe: Ursache belegen, beheben | 5.01 | Tests grün, Befund dokumentiert |
| I5.2 | Umbenennung zu EP | 5.02 | Suchtest grün |
| I5.3 | Drei Bänder, Aufteilung von `ui.js` | 5.03 | Layout-Tests bei vier Auflösungen |
| I5.4 | Bauen über den Arbeitsbereich, Tastatur | 5.04 | Zwei-Klick- und Tastaturtest |
| I5.5 | Einzelsimulation | 5.05 | Tests, Kurzsimulation ohne Patt |
| I5.6 | Armee als gemeinsame Welle | 5.06 | Tests, Kurzsimulation ohne Patt |
| I5.7 | Universität | 5.07 | Tests, Bots nutzen Forschung |
| I5.8 | Balancing-Serie | 5.08 | 200 Partien je Feld, Tabelle |
| I5.9 | Polish, Fehlerbehebung, Testpaket, Bericht | 5.09–5.11 | Definition of Done |

Die EP-Umbenennung liegt vor dem Layout-Umbau, damit die neuen Paneele gleich mit den neuen Begriffen entstehen.

**Abbruchregel bei knappem Budget:** Jedes abgeschlossene Inkrement ist spielbar. Wird das Budget knapp, gilt diese Priorität:

1. I5.1, I5.3, I5.4 (Bedienung),
2. I5.5, I5.6 (Kampf),
3. I5.2,
4. Testpaket aus I5.9,
5. I5.7,
6. I5.8,
7. Polish.

Ein halb fertiges Inkrement wird nicht committet. Stattdessen wird der Stand in `docs/STAND.md` beschrieben.

## 5. Offene Punkte mit gesetztem Standard

Claude Code setzt die Spalte „Standard“ um, sofern der PO vorher nichts anderes festlegt.

| Punkt | Risiko | Standard |
|---|---|---|
| Gesamte Armee hält bei jedem Kontakt | Längere Partien; die Belagerungswelle trifft auf eine stehende Armee | Umsetzen, Kampf-Zeitanteil und Partiedauer messen |
| Neubesetzung der Mitte | Menge offen | Ein Drittel der Armee, Nahkämpfer zuerst |
| Gegner nutzt dieselbe Armeelogik | Gegner wird berechenbarer | Ja, ein gemeinsamer Code-Pfad |
| Tempo = langsamste Einheit | Schildträger bremst die ganze Armee | Ja, als gewollter Zielkonflikt |
| Automatik gegen „Aktive belohnen“ | EP-Hörsaal verkleinert den Profilabstand | Automatik teuer; „Schwung“ nur als Experiment |
| Forschung kostet Material, nicht EP | EP als Währung würde Kartenwahlen verzögern | Material |
| Kartenwahl pausiert das Spiel | Verhalten aus v0.5 | Unverändert |
| Spielwelt bei 1280×720 nur ca. 360 px hoch | Einheiten schwer lesbar | Welt skaliert vertikal; Bildschirmfoto-Prüfung, bei Bedarf Einheitengröße anpassen |

## 6. Definition of Done

- `npm test` grün; neue Tests für jede REQ.
- `browser-check.mjs` grün, einschließlich der neuen Prüfpunkte (Bänder, Kontextwechsel, Zwei-Klick-Bau, Eingabelatenz, Durchlauftest ohne Konsolenfehler).
- Abnahmeserie mit 200 Partien je Feld; Ergebnisse gegen die Korridore aus REQ-5.08.
- Invarianten aus Abschnitt 1 eingehalten; Tests dazu grün.
- Dokumentation:
  - `docs/bericht-iteration-5.md` im Aufbau des Entwicklungsreports,
  - `docs/STAND.md` mit Auslegungen und Basislinie,
  - `CHANGELOG.md`,
  - `docs/testleitfaden-iteration-5.md`.
- Branch `iteration-5` per Fast-Forward nach `main` übernehmbar.

## Anhang A: Neue Konfigurationswerte (Vorschlag)

```js
ARMY: {
  contactRange,        // Abstand, ab dem Kampf beginnt
  contactHysteresis,   // Zusatzabstand für das Verlassen des Kampfes
  regroupTimeoutS: 4,  // Sammel-Zeitlimit
  catchUpFactor: 1.5,  // Aufschlusstempo des Nachschubs
  speedRule: 'slowest',
  midRefillShare: 1/3, // Anteil der Armee für die Mitte nach Totalverlust
},
UNIT_TYPES[typ]: { attackCooldownS, range, speed },
UI: {
  dragThresholdPx: 6,
  bands: { hud: 0.10, world: 0.50, work: 0.40 },
  hudMinPx: 56, hudMaxPx: 80,
},
EXPERIMENT: { momentum: false },
// Forschungen in data/research.js
```

## Anhang B: Zuordnung der PO-Punkte

| PO-Punkt | Inhalt | REQ |
|---|---|---|
| 1 | Armee als gemeinsame Welle | 5.06 |
| 2 | Einheiten einzeln simuliert und angreifend | 5.05 |
| 3 | Mehrfachklicks beim Bauen | 5.01, 5.04 |
| 4 | Altmetall → EP, EP-Automatik in der Universität | 5.02, 5.07 (Zweig A) |
| 5 | Responsivität beim Klicken | 5.01 |
| 6 | Universität stärken | 5.07 |
| 7a–c | Drei horizontale Bänder, kontextabhängiger Arbeitsbereich | 5.03, 5.04 |
| 7d | Balancing und Bugfixing | 5.08, 5.09, 5.10 |

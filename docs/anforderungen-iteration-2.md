# Klammerfront – Entwicklungsanforderungen Iteration 2

Stand: 28.09.2026 · Status: zur Umsetzung freigegeben, offene Punkte in Abschnitt 9

## 0. Arbeitsanweisung an den Coding-Agenten

- Lies zuerst die bestehende Codebasis. Bestehende Bezeichner (Ressourcen, Gebäude, Einheiten, Altmetall, Schwierigkeitsgrade, Simulation) haben Vorrang vor den Begriffen in diesem Dokument.
- Lege vor jeder Anforderung einen kurzen Plan vor: betroffene Dateien, neue Module, Risiken. Erst nach Freigabe umsetzen.
- Setze die Anforderungen in der Reihenfolge aus Abschnitt 8 um. Je Anforderung ein eigener Branch, Commits mit Präfix `REQ-0x`.
- Alle Zahlenwerte als benannte Konstanten in einer zentralen Konfigurationsdatei (Abschnitt 7.2). Keine Zahlenwerte direkt im Spielcode.
- Stack unverändert lassen. Keine neuen Abhängigkeiten ohne Rückfrage.
- Weicht die Umsetzung von einer Anforderung ab, begründe das und frage nach. Nichts stillschweigend anders lösen.
- Nach jeder Anforderung die Balancing-Simulation laufen lassen und die Kennzahlen aus 7.1 berichten.

## 1. Begriffe

| Begriff | Bedeutung |
|---|---|
| Klammern | Primärressource, die Presse/Klick erzeugen (Namen aus dem Code übernehmen) |
| Altmetall | Erfahrungsressource; löst Stufenaufstiege aus (REQ-02) |
| Slot | Bauplatz in der Spielerbasis; es gibt 3 |
| Gebäudetyp | Schmiede, Fabrik, Universität und neue Typen (REQ-01) |
| Stufe | Erreichte Altmetall-Schwelle; jede Stufe löst einen Draft aus |
| Draft | Pausiertes Auswahlfenster mit 2–3 Optionen, von denen genau eine gewählt wird |
| Phase | Früh, Mitte, Spät; abgeleitet aus der Stufe (REQ-03) |

---

## 2. REQ-01 Gebäudeslots als Wahl, mit Teilrückerstattung

Ziel: Die Belegung der Slots wird zur strategischen Entscheidung. Heute ist sie festgelegt.

| ID | Anforderung |
|---|---|
| 01.1 | Die Basis hat 3 Slots (`BUILDING_SLOTS = 3`). |
| 01.2 | Es gibt 5 Gebäudetypen. 4 sind ab Spielstart baubar, der 5. nur über eine Draft-Option (REQ-02). |
| 01.3 | Bestehende Typen: Schmiede (Einheiten-Upgrades), Fabrik (Presse-/Fertiger-Upgrades), Universität (Wirkung siehe 03.6). Neue Typen, Vorschlag: **Kaserne** (ab Start; Einheiten schneller oder günstiger ausbilden, also Masse statt Qualität der Schmiede) und **Handelskontor** (nur per Draft; höherer Erlös je verkaufter Klammer). Namen und Effekte bestätigt der Product Owner (Abschnitt 9). |
| 01.4 | Je Typ höchstens ein Gebäude gleichzeitig (`MAX_PER_TYPE = 1`). |
| 01.5 | Klick auf einen leeren Slot öffnet eine Auswahl aller baubaren Typen mit Kosten, Kurzbeschreibung und, falls nicht bezahlbar, dem fehlenden Betrag. |
| 01.6 | Klick auf ein stehendes Gebäude bietet neben den bisherigen Funktionen „Abreißen". Ein Bestätigungsdialog zeigt den Erstattungsbetrag. Ohne Bestätigung kein Abriss. |
| 01.7 | Erstattung = `floor(Baukosten × REFUND_RATE)`, Default `REFUND_RATE = 0.5`. Erstattet werden nur die Baukosten, nicht die im Gebäude gekauften Upgrades. |
| 01.8 | Beim Abriss werden die im Gebäude gekauften Upgrades deaktiviert, aber gespeichert. Wird derselbe Typ erneut gebaut, sind sie ohne erneuten Kauf wieder aktiv. Zweck: Effekte dürfen sich nicht durch Bauen, Kaufen und Abreißen stapeln. |
| 01.9 | Abriss und Neubau sind jederzeit möglich. Der freie Slot ist sofort wieder bebaubar. |

Akzeptanzkriterien
- [ ] Bei Spielstart sind 4 Typen für 3 Slots wählbar.
- [ ] Abriss eines Gebäudes mit Baukosten 200 erstattet 100.
- [ ] Schmiede bauen, Upgrade kaufen, abreißen: Upgrade-Effekt inaktiv. Schmiede neu bauen: Effekt aktiv, ohne Nachkauf.
- [ ] Handelskontor ist erst nach Wahl der entsprechenden Draft-Option baubar.

---

## 3. REQ-02 Altmetall-Stufen mit Draft (ersetzt im MVP das Epochenkonzept)

Ziel: Fortschritt erzeugt in regelmäßigen Abständen eine strategische Wahl zwischen 2–3 Optionen.

| ID | Anforderung |
|---|---|
| 02.1 | Altmetall wird zur reinen Erfahrungsressource: Es wird gesammelt, aber nicht ausgegeben. Die Quelle bleibt wie im bestehenden Code. **Falls Altmetall heute ausgegeben werden kann: betroffene Stellen melden und einen Vorschlag für die Umstellung vorlegen, bevor du etwas änderst.** |
| 02.2 | Schwelle für Stufe n: `XP_BASE × XP_GROWTH^(n−1)` kumuliertes Altmetall. Default `XP_GROWTH = 1.4`; `XP_BASE` per Simulation so kalibrieren, dass der erste Draft nach 60–90 s fällt. |
| 02.3 | Erreicht der Spieler eine Stufe, pausiert das Spiel und das Draft-Fenster öffnet sich. Der Spieler wählt genau eine Option, danach läuft das Spiel weiter. Mehrere gleichzeitig erreichte Stufen werden nacheinander abgearbeitet. |
| 02.4 | Anzahl Optionen: `DRAFT_OPTIONS_BASE = 2`, mit stehender Universität `DRAFT_OPTIONS_UNIVERSITY = 3`. |
| 02.5 | Zwei Kategorien im Optionspool: (a) **Starke Upgrades**: genau ein Effekt; starke Effekte sind an eine Bedingung oder einen Nachteil gebunden. (b) **Gebäude-Freischaltung**: schaltet einen nicht startverfügbaren Typ frei (MVP: Handelskontor). |
| 02.6 | Angebotsregeln: keine doppelte Option im selben Angebot; einmalige Optionen verschwinden nach der Wahl aus dem Pool; stapelbare Optionen haben eine Obergrenze; Ziehung gewichtet; Zufall über einen seedbaren Zufallsgenerator, damit Simulationen reproduzierbar sind. |
| 02.7 | Optionen deklarativ in einer Datendatei, nicht im Draft-Code. Felder: `id`, `category`, `nameKey`, `descKey` (i18n), `effect`, `condition` (optional), `drawback` (optional), `weight`, `unique` oder `maxStacks`, `requires` (optional). Neue Optionen lassen sich ohne Änderung am Draft-System ergänzen. |
| 02.8 | Initialer Pool mit 10–12 Optionen. Beschreibung je Option höchstens drei Zeilen. Beispiele als Startpunkt, Werte per Simulation kalibrieren: |

| Option | Kategorie | Effekt |
|---|---|---|
| Schwere Pressen | Upgrade | +50 % automatische Produktion; Mauer −20 % Lebenspunkte |
| Akkordlohn | Upgrade | Einheiten −30 % Kosten; Einheiten −15 % Lebenspunkte |
| Scharfschützen | Upgrade | Turmschaden +100 % gegen Fernkämpfer |
| Notreserve | Upgrade, einmalig | Fällt die Mauer unter 25 %, wird sie einmal vollständig repariert |
| Handelskontor | Gebäude-Freischaltung, einmalig | Handelskontor wird baubar |

Die übrigen Optionen schlägt der Coding-Agent vor und legt sie zur Freigabe vor.

Akzeptanzkriterien
- [ ] Stufenaufstieg pausiert das Spiel und zeigt 2 Optionen, mit Universität 3.
- [ ] Kein Angebot enthält eine Option doppelt; einmalige Optionen erscheinen nach der Wahl nie wieder.
- [ ] Gleicher Seed ergibt dieselbe Angebotsfolge.
- [ ] Simulation: Median-Abstand zwischen zwei Drafts liegt in jeder Phase zwischen `DRAFT_INTERVAL_MIN_S = 45` und `DRAFT_INTERVAL_MAX_S = 150` Sekunden.
- [ ] Simulation: Jede Option wird, wenn angeboten, in 5–60 % der Fälle gewählt. Abweichungen werden berichtet.

---

## 4. REQ-03 Spielphasen: Klicken nur zu Beginn

Ziel: Manuelles Klicken ist im Frühspiel die Haupteinnahme und verliert danach an Gewicht. Im Spätspiel zählen ausschließlich strategische Entscheidungen.

| ID | Anforderung |
|---|---|
| 03.1 | Phasen werden über die Stufe definiert, nicht über Zeit: Früh bis Stufe `PHASE_MID_LEVEL − 1` (Default 2), Mitte bis Stufe `PHASE_LATE_LEVEL − 1` (Default 5), Spät ab Stufe 5. |
| 03.2 | Zielanteil manueller Klicks an der gesamten Klammer-Produktion, gemessen mit einem Simulations-Bot mit `SIM_CLICK_RATE = 6` Klicks/s: Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %. |
| 03.3 | Umsetzung: Der Klickertrag wächst nicht oder nur gedeckelt. Die automatische Produktion skaliert über Fabrik, Draft und Upgrades. Bestehende Upgrades, die den Klickwert skalieren, identifizieren und deckeln oder umbauen. |
| 03.4 | Gezählte Klicks sind auf `MAX_CLICKS_PER_SECOND = 10` begrenzt; darüber hinausgehende Klicks verfallen. Schützt die Balance gegen Autoklicker. |
| 03.5 | Optional: In Phase Spät tritt der Klick-Button optisch zurück (kleiner, gedämpft), bleibt aber bedienbar. |

Akzeptanzkriterien (Simulation, je Schwierigkeitsgrad mindestens 200 Läufe)
- [ ] Anteile aus 03.2 werden eingehalten.
- [ ] Ein Bot, der ab Phase Spät nicht mehr klickt, erreicht mindestens 95 % der Siegquote des Dauerklick-Bots.
- [ ] Ein Bot, der nie klickt, erreicht höchstens 50 % der Siegquote des Dauerklick-Bots. Klicken bleibt zu Beginn relevant.
- [ ] Die bestehenden Ziel-Siegquoten der drei Schwierigkeitsgrade bleiben erfüllt.

---

## 5. REQ-04 Sprachwahl Deutsch/Englisch

| ID | Anforderung |
|---|---|
| 04.1 | Der Startbildschirm enthält die Sprachwahl (Deutsch, English), die Wahl des Schwierigkeitsgrads (bestehende drei Stufen) und „Spiel starten". |
| 04.2 | Voreinstellung: Browsersprache beginnt mit `de` → Deutsch, sonst Englisch. Die letzte Wahl wird lokal gespeichert (Browser-Speicher, Zugriff in try/catch; bei Fehler gilt die Voreinstellung). |
| 04.3 | Alle sichtbaren Texte (Oberfläche, Tooltips, Draft-Optionen, Meldungen, Dialoge) liegen in zwei Sprachdateien `de` und `en` mit identischen Schlüsseln. Keine fest codierten Texte im Spielcode. |
| 04.4 | Werte über Platzhalter (`{cost}`, `{percent}`). Zahlenformat über `Intl.NumberFormat` je Sprache (1.234,5 bzw. 1,234.5). Kurzformen großer Zahlen sprachabhängig (Tsd./Mio. bzw. k/M). |
| 04.5 | Fehlt ein Schlüssel: Fallback auf Englisch und Warnung in der Konsole. |
| 04.6 | Das Layout verträgt deutsche Texte, die rund 30 % länger sind als englische, ohne Abschneiden oder Überlappen. |
| 04.7 | Sprachwechsel im MVP nur auf dem Startbildschirm. Der Spieltitel bleibt unübersetzt (Abschnitt 9). |

Akzeptanzkriterien
- [ ] Automatischer Test: Die Schlüsselmengen von `de` und `en` sind identisch.
- [ ] Außerhalb der Sprachdateien finden sich keine sichtbaren Texte im UI-Code.
- [ ] Eine vollständige Partie ist in beiden Sprachen ohne fremdsprachige Reste spielbar.

---

## 6. REQ-05 Tooltips und Erkennbarkeit klickbarer Flächen

| ID | Anforderung |
|---|---|
| 05.1 | Jedes interaktive Element erhält einen Tooltip. Umsetzung zentral: eine Tooltip-Komponente, Zuordnung per Attribut (z. B. `data-tooltip="<i18n-Schlüssel>"`). |
| 05.2 | Anzeige nach `TOOLTIP_DELAY_MS = 2000` ms ununterbrochenem Hovern, am Mauszeiger mit kleinem Versatz, stets vollständig im sichtbaren Fenster. Der Tooltip verschwindet sofort beim Verlassen oder Klicken und blockiert keine Klicks. |
| 05.3 | Inhalt: Name, höchstens drei Zeilen Erklärung, aktuelle Werte (Kosten, Stufe, Wirkung vor und nach dem Kauf, z. B. „Schaden 12 → 15"). Bei deaktivierten Elementen der Grund, z. B. „Fehlt: 80 Klammern". Werte aktualisieren sich, solange der Tooltip sichtbar ist. |
| 05.4 | Tastaturfokus zeigt den Tooltip ebenfalls. Auf Touch-Geräten zeigt langes Drücken (`TOUCH_TOOLTIP_MS = 500`) den Tooltip, ohne die Aktion auszulösen. |
| 05.5 | Lange Erklärtexte auf dem Bildschirm entfallen. Sichtbar bleiben kurze Beschriftungen; die Erklärung wandert in den Tooltip. |
| 05.6 | Einheitlicher Stil für alle klickbaren Flächen: Rahmen oder Schatten, Hover- und Druckzustand, Mauszeiger `pointer`. Deaktivierte Elemente sichtbar gedämpft, Mauszeiger `not-allowed`, Tooltip bleibt. Mindestgröße 32 × 32 px. Nicht interaktive Elemente tragen diesen Stil nicht. |
| 05.7 | Im Entwicklungsmodus meldet eine Prüfung jedes interaktive Element ohne Tooltip-Schlüssel in der Konsole. |

Akzeptanzkriterien
- [ ] Die Prüfung aus 05.7 meldet null Elemente ohne Tooltip.
- [ ] Der Tooltip erscheint nach 2 s (± 100 ms) und ragt nie aus dem Fenster.
- [ ] Ein deaktivierter Kaufknopf zeigt den fehlenden Betrag.

---

## 7. Querschnitt

### 7.1 Balancing-Simulation erweitern
- Bot-Strategien für Slotwahl, Abriss und Draft ergänzen, mindestens „Zufall" und „gierige Heuristik".
- Bericht je Serie: Siegquote je Schwierigkeitsgrad; Median-Abstand zwischen Drafts je Phase; Klickanteil je Phase; Wahlrate je Draft-Option und je Gebäudetyp; Siegquote je Gebäudekombination.
- Die Simulation misst Stärke, nicht Spielspaß. Auffälligkeiten berichten, nicht automatisch wegbalancieren.

### 7.2 Zentrale Konfiguration (Defaults)

| Konstante | Default | REQ |
|---|---|---|
| `BUILDING_SLOTS` | 3 | 01 |
| `MAX_PER_TYPE` | 1 | 01 |
| `REFUND_RATE` | 0.5 | 01 |
| `XP_BASE` | per Simulation | 02 |
| `XP_GROWTH` | 1.4 | 02 |
| `DRAFT_OPTIONS_BASE` | 2 | 02 |
| `DRAFT_OPTIONS_UNIVERSITY` | 3 | 02 |
| `DRAFT_INTERVAL_MIN_S` / `_MAX_S` | 45 / 150 | 02 |
| `PHASE_MID_LEVEL` | 2 | 03 |
| `PHASE_LATE_LEVEL` | 5 | 03 |
| `SIM_CLICK_RATE` | 6 | 03 |
| `MAX_CLICKS_PER_SECOND` | 10 | 03 |
| `TOOLTIP_DELAY_MS` | 2000 | 05 |
| `TOUCH_TOOLTIP_MS` | 500 | 05 |

### 7.3 Tests
Unit-Tests für: Erstattungsberechnung; Deaktivierung und Reaktivierung von Upgrades beim Abriss; Draft-Ziehung (Seed, keine Duplikate, einmalige Optionen); Schlüsselgleichheit der Sprachdateien; Tooltip-Abdeckung.

---

## 8. Reihenfolge der Umsetzung

1. REQ-04 Sprachwahl: zuerst, damit alle folgenden Texte direkt als Schlüssel entstehen.
2. REQ-05 Tooltips: baut auf den Sprachdateien auf.
3. REQ-01 Slots und Abriss.
4. REQ-02 Altmetall-Draft.
5. REQ-03 Phasen-Balancing: zuletzt, weil es die fertigen Systeme voraussetzt.

Die Simulation (7.1) wird ab Schritt 3 laufend mitgeführt.

## 9. Offene Entscheidungen (Product Owner)

| Punkt | Default bis zur Entscheidung |
|---|---|
| Namen und Effekte der zwei neuen Gebäude | Kaserne (ab Start), Handelskontor (per Draft) |
| Ohne Universität nur 2 Draft-Optionen, als gewollter Nachteil | ja |
| Tooltip-Verzögerung: 2 s liegt am langsamen Ende üblicher Werte (meist 0,5–1 s) | 2000 ms, Test mit 1000 ms empfohlen |
| Englischer Spieltitel | Titel bleibt „Klammerfront" |

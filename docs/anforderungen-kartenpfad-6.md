# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 6: Synergien, Doktrinen und Weiterentwicklungen

Stand: 15.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-6.md` · Branch: `exp/kartenpfad`
Bezug: `docs/entwicklungsstand-planung-kartenpfad-5.md` (Stand 15.10.2026), `docs/bericht-kartenpfad-5.md`, `docs/anforderungen-kartenpfad-5.md`

## 1. Ziel und Umfang

**Eindrücke des PO nach Teil 5**

- Das Spiel macht im aktuellen Stand Spaß; starke Karten fühlen sich gut an.
- Die Doktrinen wirken als besonders starke Karten direkt und gut. Sie sollen ausgebaut werden.
- Eisenwaffen ist stark und fühlt sich wie eine Weiterentwicklung an. Das Muster soll es auch für andere Bereiche geben.
- Mit den Strategielinien kommen zu viele Systeme ins Spiel. Stattdessen sollen Karten stärker miteinander wirken.
- Fehler: Das Zunfthaus lässt sich bauen, obwohl mehr als vier Fabriken stehen.

**Ziel:** Teil 6 vereinfacht das Spiel und stärkt die Karten:

1. Die Strategielinien entfallen. Karten wirken über Synergien zwischen drei Kategorien zusammen.
2. Doktrinen werden ausgebaut. Sie erscheinen über einen Zufallsfaktor, der mit jeder Wahl ohne Doktrin steigt.
3. Fabrik und Universität erhalten je eine Weiterentwicklung nach dem Muster von Eisenwaffen. Sie ersetzt die Varianten des Gebäudes.
4. Einige Gebäude-Upgrades wandern in Karten.
5. Die Einschränkungen der Doktrinen gelten sofort und auch für den Bestand.

**Nicht im Umfang**

- Belagerung, Druckkurve, Gegnerwellen (Entscheidung PO: eigene Runde). Folge: Karten und Doktrinen der Kategorie Verteidigung bleiben in der Simulation schwach messbar (Befund F aus Teil 5).
- Weiterentwicklungen für Türme, Mauer, Kontor.
- Raster (bleibt 3×3), neue Grafik, neue Einheitenverhalten, Leistungsoptimierung.
- Änderungen an `main` und am Modus `standard`.
- Spieltest mit Menschen (folgt nach Teil 6; Fragen in REQ-K6.08).

**Hinweis zur Messung:** Auf Normal gewinnen alle Bots 100 % (Befund E aus Teil 5). Kriterien zur Stärke nutzen deshalb Ersatzmaße (Dauer, Wahlen, Mauerverlust, Materialbestand) oder Schwer und `?druck=hoch`. Jedes Kriterium ist markiert: **[Bot]** (Simulation, Test) oder **[Mensch]** (Spieltest).

## 2. Anforderungen

| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| K6.01 | Einschränkungen der Doktrinen gelten sofort (Zunfthaus) | Muss | Q.0 |
| K6.02 | Strategielinien entfallen, Regeln wandern in Karten | Muss | Q.1 |
| K6.03 | Kategorien und Synergiekarten | Muss | Q.2 |
| K6.04 | Doktrinen: steigender Zufallsfaktor | Muss | Q.3 |
| K6.05 | Doktrinen: Pool ausbauen | Muss | Q.3 |
| K6.06 | Weiterentwicklungen für Fabrik und Universität | Muss | Q.4 |
| K6.07 | Gebäude-Upgrades in Karten | Soll | Q.5 |
| K6.08 | Bots, Messung, Bericht, Testbuild | Muss | Q.0, Q.6 |

---

### REQ-K6.01 Einschränkungen der Doktrinen gelten sofort (Zunfthaus)

**Befund (PO):** Nach Wahl der Zunftordnung lässt sich das Zunfthaus bauen, auch wenn mehr als vier Fabriken stehen. Ursache ist Auslegung 3 aus Teil 5 („Bestand bleibt stehen“). Die Einschränkung bindet dadurch nie.

**Regel für alle Doktrinen**

- Die Einschränkung gilt ab der Wahl der Doktrin, auch für Gebäude, die bereits stehen.
- Der Sonderbau ist erst verfügbar, wenn die Einschränkung erfüllt ist.
- Zunftordnung: Die Aufwertung zum Zunfthaus bleibt gesperrt, solange mehr als vier Fabriken und Zunfthäuser zusammen stehen. Erklärzeile: „Reiße zuerst N Fabriken ab.“ Neue Fabriken über die Grenze sind gesperrt.
- Bollwerk: Die Einschränkung (Fabriken −15 % Ertrag) gilt sofort für alle Fabriken.
- Die übrigen Einschränkungen (Unterhalt, Turmfeuerrate, Einheitenkosten, Reparatur) gelten bereits sofort; Claude Code prüft das per Test.
- Auslegung 3 aus Teil 5 entfällt.

**Akzeptanzkriterien**

- Test: Mit neun Fabriken ist nach Wahl der Zunftordnung kein Zunfthaus baubar; nach Abriss auf vier ist es baubar **[Bot]**.
- Test je Doktrin: Einschränkung greift im selben Takt wie die Wahl **[Bot]**.

---

### REQ-K6.02 Strategielinien entfallen, Regeln wandern in Karten

**Entfällt im Modus `karten`**

- Zeichen an Doktrinen und Varianten, Linienstufen 1 bis 3, die Anzeige „Linien“ in der Leiste, der Linienhinweis.
- Die Gewichtung des Angebots nach führender Linie (ersetzt durch K6.03).

**Bleibt**

- Gebäude-Varianten (ohne Zeichen; zu ihrem Ersatz siehe K6.06).
- Doktrinen und Sonderbauten.

**Regeln der Linienstufen wandern in Karten.** Die Stufen enthielten gute Regeländerungen. Sie werden zu Bonuskarten oder Teil einer Doktrin; Claude Code legt die Zuordnung im Bericht vor. Mindestens:

| Bisherige Stufe | Neu als | Kategorie |
|---|---|---|
| Nachbarschaftsboni wirken auch diagonal | Bonuskarte | Wirtschaft |
| Material über dem Lagerdeckel wird zu EP | Bonuskarte | Wirtschaft |
| Söldner: Einheiten über dem Versorgungslimit | Bonuskarte (selten) | Wirtschaft und Militär (Brücke, siehe K6.03) |
| Kaserne schickt je Welle 1 Läufer mehr | Bonuskarte | Militär |
| Durchbruch: doppelter Schaden an der gegnerischen Basis | Bonuskarte (selten) | Militär |
| Abschüsse durch Türme bringen Material | Bonuskarte | Verteidigung |
| Gegenstoß nach abgewehrter Welle | bleibt in der Doktrin Ausfall | Verteidigung |

Stufe 2 der Linie Militär („Neue Einheiten starten mit einer Schmiede-Stufe mehr“) und „Ausbruch“ entfallen oder werden Kartenstufen; Vorschlag im Bericht.

**Akzeptanzkriterien**

- Test: Im Modus `karten` existiert kein Zeichen, keine Linienstufe, keine Linienanzeige **[Bot]**.
- Test: Jede übernommene Regel wirkt als Karte wie vorher als Stufe **[Bot]**.
- Zahl der sichtbaren Bedienelemente bei Minute 10 nicht höher als nach Teil 5 **[Bot]**.

---

### REQ-K6.03 Kategorien und Synergiekarten

**Kategorien:** Wirtschaft, Militär, Verteidigung. Jede Karte gehört zu genau einer Kategorie oder ist neutral. Mischdoktrinen (K6.05) und Brücken zählen für beide ihrer Kategorien.

- Zuordnung der bestehenden Karten (Vorschlag): Armee → Militär; Basis → Verteidigung; Wirtschaft → Wirtschaft; Automatisierung einzeln zuordnen; Sonderregel und Wagnis neutral, außer die Wirkung gehört eindeutig zu einer Kategorie. Technologiekarten: Fortgeschrittene Taktiken, Ballistik, Eiserne Klingen → Militär; Befestigungskunde → Verteidigung. Zuordnung im Bericht.
- Das Kartenband zeigt die Kategorie wie bisher.

**Zählregel:** Jede gewählte Karte zählt einmal für ihre Kategorie; jede weitere Stufe derselben Karte zählt ebenfalls einmal. Eine Doktrin zählt zweimal (Wert in `config.js`).

**Drei Arten von Synergiekarten** (Namen Platzhalter, Werte Startwerte)

| Art | Prinzip | Karten (mindestens) |
|---|---|---|
| Zähler | Wirkung wächst mit der Zahl der Karten einer Kategorie | Gilde (Wirtschaft): +8 % Materialertrag je Wirtschaftskarte · Waffenbrüder (Militär): +5 % Schaden je Militärkarte · Wehrverband (Verteidigung): +8 % Turmschaden je Verteidigungskarte |
| Verstärker | vervielfacht eine Mechanik | Bauordnung (Wirtschaft): Nachbarschaftsboni ×2 · Sammelruf (Militär): Wellengröße +1 Einheit je zwei Militärkarten |
| Brücke | verbindet zwei Kategorien | Kriegswirtschaft (Wirtschaft + Militär): jede Militärkarte senkt Einheitenkosten um 5 % · Wehrhandel (Wirtschaft + Verteidigung): jede Verteidigungskarte bringt +3 % Materialertrag · Grenzwacht (Militär + Verteidigung): jede Militärkarte +5 % Mauer-Lebenspunkte |

**Regeln**

- **Deckel:** Zähler und Brücken zählen höchstens 8 Karten (Wert in `config.js`).
- **Anzeige:** Synergiekarten zeigen ihren aktuellen Wert auf der Karte und im Tooltip („derzeit +24 %“). Die Sammlung im Reiter „Karten“ zeigt die Zahl je Kategorie, sobald die erste Synergiekarte gewählt ist (Entdecken).
- **Angebot:** Die führende Kategorie (mindestens zwei Karten Vorsprung) erhält doppeltes Gewicht. Jedes Angebot mit drei oder mehr Karten enthält mindestens eine Karte einer anderen Kategorie oder eine neutrale.
- **Spürbarkeitsgrenze** aus Teil 5 gilt: Ein Zähler muss ab drei Karten der Kategorie mindestens 20 % bewirken.
- Poolgröße einschließlich der übernommenen Regeln und der Synergiekarten: höchstens 38 Karten ohne Doktrinen. Ist die Grenze überschritten, schlägt Claude Code Streichungen vor.

**Akzeptanzkriterien**

- Test: Zählung je Kategorie, Doktrin zählt doppelt, Mischformen zählen in beiden Kategorien, Deckel greift **[Bot]**.
- Test: Angebot mit drei oder mehr Karten enthält mindestens eine Karte außerhalb der führenden Kategorie **[Bot]**.
- Simulation, Kategorie-Bots (K6.08), Normal: Median der Partiedauer der drei Bots liegt innerhalb von 3 min; Bericht je Bot: Zahl der Karten der eigenen Kategorie bei Partieende und Wert der Zähler **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester gibt an, Karten bewusst kombiniert zu haben **[Mensch]**.

---

### REQ-K6.04 Doktrinen: steigender Zufallsfaktor

**Entscheidung PO:** Keine festen Doktrin-Momente. Ein Zufallsfaktor steigt mit jeder Wahl ohne Doktrin.

**Regel**

- Ab Wahl 3 hat jedes Angebot eine Chance p, eine Doktrin zu enthalten.
- Startwert p = 15 %. Nach jedem Angebot ohne Doktrin steigt p um 15 Prozentpunkte. Nach einem Angebot mit Doktrin fällt p auf den Startwert zurück. Werte in `config.js`.
- Die Doktrin belegt einen Bonusplatz; nie zwei Doktrinen in einem Angebot.
- Höchstens zwei Doktrinen je Partie; danach erscheinen keine mehr.
- Der bisherige Angebotsausgleich (Doktrin spätestens im dritten Angebot, dreifaches Gewicht der führenden Linie) entfällt. Innerhalb der Doktrinen erhält die führende Kategorie doppeltes Gewicht (K6.03).
- Doktrinen sind auf der Bühne als besondere Karten erkennbar (eigener Rahmen, eigene Rückseite).

**Akzeptanzkriterien**

- Test: p steigt und fällt wie beschrieben; nie zwei Doktrinen in einem Angebot; keine dritte Doktrin **[Bot]**.
- Simulation, Normal, „durchschnitt“: Angebote mit Doktrin je Partie im Median 3–5; erstes Angebot mit Doktrin im Median spätestens in Wahl 5 (Teil 5: Wahl 6 bis 8); Anteil der Partien ohne Doktrin-Angebot berichten **[Bot]**.

---

### REQ-K6.05 Doktrinen: Pool ausbauen

**Ziel:** Etwa zwölf Doktrinen, darunter Mischformen zweier Kategorien. Jede Doktrin hat einen starken Effekt (Regeländerung oder mindestens +30 %), gegebenenfalls einen Sonderbau und eine bindende Einschränkung (K6.01).

**Bestand (bleibt):** Zunftordnung, Stiftung, Stehendes Heer, Vorstoß, Bollwerk, Ausfall.

**Neu (Muss)**

| Kategorie | Doktrin (Platzhalter) | Effekt | Einschränkung |
|---|---|---|---|
| Militär | Elite | Einheiten doppelte Lebenspunkte und doppelter Schaden | Versorgung halbiert |
| Militär | Massenaufgebot | Läufer −50 % Kosten, +1 Läufer je Welle | Werfer und Spezialeinheiten gesperrt |
| Wirtschaft | Freihandel | Material und EP im Kontor frei tauschbar (Kurs in `config.js`) | Türme nicht über Stufe 1 |
| Wirtschaft | Raubbau | Fabrikertrag ×2 | jede Fabrik verliert alle 3 min eine Ausbaustufe |
| Wirtschaft + Militär | Kriegswirtschaft | Jede Fabrik stellt alle 60 s einen Läufer ohne Versorgung | Materialertrag −30 % |
| Wirtschaft + Verteidigung | Grenzfeste | Turm-Abschüsse bringen dreifach Material | höchstens 5 Fabriken |

**Neu (Soll):** Zermürbung (Verteidigung: Gegnerwellen verlieren vor der Mauer 25 % Lebenspunkte; Kaserne-Ausbauten +50 % Kosten), Wehrpflicht (Militär + Verteidigung: überlebende Verteidiger einer abgewehrten Welle schließen sich der nächsten eigenen Welle an; Forschungsbudget gesperrt), Igelstellung (Verteidigung: ein zusätzlicher Turmplatz je Lane; eigene Wellen nur jede zweite Runde).

**Hinweis:** Grenzfeste, Zermürbung und Wehrpflicht hängen an Gegnern, die die Mauer erreichen. Solange die Belagerung bleibt (nicht im Umfang), wirken sie in der Simulation schwach. Das ist bekannt und kein Abbruchgrund.

**Akzeptanzkriterien**

- Test je Doktrin: Effekt, Sonderbau (falls vorhanden) und Einschränkung greifen; Mischformen zählen in beiden Kategorien **[Bot]**.
- Bericht je Doktrin mit Ersatzmaßen (Dauer, Wahlen, Mauerverlust, Materialbestand) im Paarvergleich, Normal und Schwer, Verteidigung zusätzlich mit `?druck=hoch` **[Bot]**.
- Spieltest: Mindestens zwei Drittel der Tester nennen eine Doktrin als Wendepunkt ihrer Partie **[Mensch]**.

---

### REQ-K6.06 Weiterentwicklungen für Fabrik und Universität

**Muster (wie Eisenwaffen):** Technologiekarte → Forschung in der Universität → der ganze Bereich wird ersetzt. Eine Weiterentwicklung je Bereich und Partie.

| Bereich | Technologiekarte / Forschung (Platzhalter) | Wirkung | Kategorie |
|---|---|---|---|
| Fabrik | Dampfkraft | Alle Fabriken werden zu Dampfmühlen: +40 % Ertrag gegenüber der Fabrik, Klickertrag ×2 | Wirtschaft |
| Universität | Buchdruck | Forschungen −50 % Dauer; Kurs des Forschungsbudgets ×1,5 | Wirtschaft |

**Ersatz der Varianten (Entscheidung PO):** Die Weiterentwicklung ersetzt die Grundvarianten des Gebäudes. Wer eine Fabrik zur Manufaktur, Werkstatt oder Wachstube aufgewertet hat, verliert diese Variante mit Dampfkraft; das Gebäude wird zur Dampfmühle. Aufwerten oder auf die Weiterentwicklung warten wird damit zur Investitionsfrage.

- Die Kosten der ersetzten Varianten werden nicht erstattet.
- Sonderbauten aus Doktrinen (Zunfthaus, Bastion, Stiftungshaus) bleiben erhalten (Standard, PO kann ändern), weil sie an die Doktrin gebunden sind.
- Nach der Weiterentwicklung lassen sich Dampfmühlen wieder zu Varianten aufwerten (Startwert: gleiche Varianten auf Basis der Dampfmühle, Kosten wie bisher).
- Der Tooltip der Forschung nennt vorab, wie viele Varianten sie ersetzt („Ersetzt 3 Varianten“).
- Ausbaustufen bleiben erhalten.

**Akzeptanzkriterien**

- Test: Nach Abschluss sind alle Fabriken Dampfmühlen; Grundvarianten ersetzt, Sonderbauten unverändert, Ausbaustufen erhalten **[Bot]**.
- Test: Buchdruck verkürzt laufende und künftige Forschungen und ändert den Budgetkurs **[Bot]**.
- Bericht: Zeitpunkt des Abschlusses (Median), Zahl der ersetzten Varianten je Partie, Anteil der Partien mit Weiterentwicklung je Kategorie-Bot **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester beschreibt die Weiterentwicklung als Fortschritt; kein Tester empfindet den Verlust der Varianten als unverständlich **[Mensch]**.

---

### REQ-K6.07 Gebäude-Upgrades in Karten (Soll)

**Ziel (PO):** Einige Gebäude-Upgrades werden Karten. Das macht Karten wirksamer und entlastet die Reiter.

**Grenze aus dem Leitsatz:** Die Grundlagen jeder Strategie bleiben ohne Karte: Bau aller Grundgebäude, die ersten Ausbaustufen, Versorgung über „Quartiere“. In Karten wandern nur Spezialisierungen.

**Anforderungen**

- Claude Code inventarisiert die Ausbauten und schlägt vier bis sechs vor, die als Karte stärker wirken. Kandidaten: Reichweite und Feuerrate der Türme, Stachelwall und Mörtelkolonne der Mauer, Zinseszins des Kontors, Schmiede ab der dritten Stufe.
- Mehrere Stufen eines Ausbaus werden zu einer Karte mit Kartenstufen zusammengefasst. Jede Karte erfüllt die Spürbarkeitsgrenze.
- Die Ausbauten entfallen im Reiter, sobald sie Karte sind.
- Liste im Bericht.

**Akzeptanzkriterien**

- Test: Jede Karte aus einem Ausbau wirkt mindestens so stark wie alle Stufen des Ausbaus zusammen **[Bot]**.
- Test: Grundlagen aus dem Leitsatz bleiben ohne Karte erreichbar **[Bot]**.

---

### REQ-K6.08 Bots, Messung, Bericht, Testbuild

**Basismessung (Q.0):** Stand nach Teil 5, gleiche Seeds: Angebote mit Doktrin je Partie, erste Doktrin, Partiedauer und Wahlen je Feld, Zahl der sichtbaren Bedienelemente bei Minute 1 und 10.

**Bots:** Die Linien-Bots werden Kategorie-Bots (Wirtschaft, Militär, Verteidigung). Sie bevorzugen Karten und Doktrinen ihrer Kategorie und warten mit dem Aufwerten der Fabriken, wenn Dampfkraft geöffnet ist (Regel in `tools/`). Ein vierter Bot wählt ohne Kategorie.

**Simulation:** 50 Partien je Feld; Kategorie-Bots auf Normal und Schwer, ohne und mit `?druck=hoch`; Paarvergleich der Doktrinen mit 100 Partien.

**Zielwerte im Überblick**

| Kennzahl | Zielwert | Prüfung |
|---|---|---|
| Angebote mit Doktrin je Partie (Normal, durchschnitt) | Median 3–5 | [Bot] |
| Erstes Angebot mit Doktrin | Median ≤ Wahl 5 | [Bot] |
| Partiedauer der Kategorie-Bots (Normal) | Mediane innerhalb 3 min | [Bot] |
| Wahlen je Partie, Partiedauer (Normal, durchschnitt) | Werte aus Teil 5 halten: 12–16 Wahlen, 13–17 min | [Bot] |
| Siegquote Schwer, durchschnitt | 70–90 % | [Bot] |
| Sichtbare Bedienelemente Minute 10 | nicht höher als nach Teil 5 | [Bot] |
| Patt-Quote | ≤ 2 % | [Bot] |
| Karten bewusst kombiniert | ≥ Hälfte der Tester | [Mensch] |
| Doktrin als Wendepunkt | ≥ zwei Drittel der Tester | [Mensch] |
| Weiterentwicklung als Fortschritt | ≥ Hälfte der Tester | [Mensch] |

**Bericht:** `docs/bericht-kartenpfad-6.md` mit Ergebnis je REQ, Zuordnungen (Kategorien, übernommene Linienregeln, Upgrades als Karten), Kennzahlen vorher und nachher, Auslegungen zur Bestätigung.

**Testbuild und Testleitfaden:** privater Testbuild; `docs/testleitfaden-kartenpfad-6.md` mit den [Mensch]-Kriterien als Fragen; zusätzlich: „Hast du mit dem Aufwerten gewartet, weil eine Weiterentwicklung kommen konnte?“ Protokoll: Kategorie je gewählter Karte, Werte der Synergiekarten bei Partieende, Zeitpunkt jeder Weiterentwicklung, ersetzte Varianten, p des Doktrin-Faktors je Wahl.

**Spielstand-Version:** 11; ältere Stände werden verworfen. Modus `standard` bleibt identisch zu `main` (Golden-Test).

## 3. Entscheidungen des PO

| Thema | Entscheidung |
|---|---|
| Strategielinien | Entfallen; Synergien über drei Kategorien |
| Doktrinen | Ausbauen; keine festen Momente, steigender Zufallsfaktor je Wahl ohne Doktrin; höchstens zwei je Partie |
| Weiterentwicklungen | Zunächst zwei Bereiche (Fabrik, Universität) |
| Belagerung und Druckkurve | Nicht in diesem Teil; eigene Runde |
| Varianten | Bleiben; werden durch eine Weiterentwicklung ersetzt |
| Gebäude-Upgrades | Einige wandern in Karten |
| Zunfthaus | Einschränkungen gelten sofort, auch für den Bestand |
| Aus Teil 5 (Empfehlungen übernommen) | Mindestabstand 45 s bleibt, Kriterium Forschungsbudget +2 Wahlen (F2); Schwer-Grundwelle 4,0 (F5); Auslegungen bestätigt außer Nr. 3 (F7); Zielkorridore und Spieltest nach Teil 6 (F6, F8) |

## 4. Inkrementplan

| Inkrement | Inhalt | REQ |
|---|---|---|
| Q.0 | Basismessung; Einschränkungen der Doktrinen sofort (Zunfthaus) | K6.08, K6.01 |
| Q.1 | Linien entfernen, Linienregeln als Karten | K6.02 |
| Q.2 | Kategorien, Synergiekarten, Angebotsgewichtung, Anzeige | K6.03 |
| Q.3 | Doktrinen: Zufallsfaktor, sechs neue Doktrinen (Soll: drei weitere) | K6.04, K6.05 |
| Q.4 | Weiterentwicklungen Fabrik und Universität, Ersatz der Varianten | K6.06 |
| Q.5 | Gebäude-Upgrades in Karten | K6.07 |
| Q.6 | Kategorie-Bots, Simulation, Bericht, Testbuild, Testleitfaden | K6.08 |

Commits `Q.<n>: <Inhalt>`. Jedes Inkrement ist spielbar.

**Reihenfolge:** Q.1 und Q.2 gehören zusammen. Nach Q.1 ist das Spiel ohne Linien spielbar, aber ärmer; Q.2 füllt die Lücke. Nach Q.2, Q.3 und Q.4 wird geprüft, ob Wahlen je Partie und Partiedauer noch im Rahmen aus Teil 5 liegen; falls nicht, werden die EP-Schwellen nachkalibriert.

**Abbruchregel:** Priorität bei knappem Budget: Q.0 → Q.1 → Q.3 → Q.2 → Q.6 (mindestens Bericht und Testbuild) → Q.4 → Q.5. Innerhalb von Q.3 entfallen zuerst die Soll-Doktrinen; innerhalb von Q.4 zuerst Buchdruck.

## 5. Schwache Annahmen und offene Punkte

| Annahme | Risiko | Standard |
|---|---|---|
| Synergien ersetzen die Linien gleichwertig | Zähler belohnen, alles auf eine Kategorie zu setzen; die Partie wird eindimensional | Deckel bei 8 Karten; Fremdkategorie in jedem Angebot; Wert der Zähler berichten |
| Spieler erkennen Synergien | Ohne sichtbaren Wert bleibt die Kombination unbemerkt | Aktueller Wert auf der Karte; Spieltest |
| Steigender Zufallsfaktor | Partien ohne Doktrin oder mit zwei sehr frühen Doktrinen | Startwert und Anstieg in `config.js`; Verteilung berichten |
| Verteidigung ohne Gegner an der Mauer | Karten und Doktrinen der Kategorie Verteidigung bleiben schwach, solange die Belagerung alle Wellen aufhält | Bewusst hingenommen; Belagerung in einer eigenen Runde |
| Ersatz der Varianten fühlt sich wie Investition an | Kann sich wie Strafe anfühlen, wenn der Spieler es nicht vorher weiß | Hinweis im Tooltip; Spieltest-Frage |
| Upgrades in Karten | Berührt den Leitsatz „Grundlagen ohne Karte“ | Nur Spezialisierungen; Test der Grundlagen |
| Poolgröße | Neue Synergiekarten und übernommene Regeln vergrößern den Pool wieder | Obergrenze 38 ohne Doktrinen |
| Bots als Maß | Normal trennt die Siegquote nicht; Kategorie-Bots folgen stur ihrer Kategorie | Ersatzmaße; Urteil im Spieltest |
| Namen der Synergiekarten, Doktrinen und Weiterentwicklungen | Platzhalter | Übernehmen, PO kann ändern; Sprachregel gilt |

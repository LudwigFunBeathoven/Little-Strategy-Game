# Klammerfront – Anforderungen Iteration 3

Stand: 28.09.2026 · Grundlage: Umsetzungsbericht Iteration 2 (v0.3) · Status: freigegeben. Die Defaults gelten, bis der PO widerspricht.

## 0. Ziel und Leitplanken

**Ziel:** Das Kampfmodell wechselt von einer Lane auf drei Lanes mit fester Formation. Die Wirtschaft wechselt von endlosen Fertigern auf Fabriken in einem 3×3-Raster.

**Befunde aus Iteration 2, die damit gelöst werden sollen:**
- Die Schmiede ist Pflicht (73–100 % Siege mit Schmiede).
- Die Kaserne ist wirkungslos (21 % Baurate).
- Ohne Zusatzregeln endeten bis zu 40 % der Partien im Patt.
- Einheiten sind im Spätspiel zu billig.

**Leitplanken:**
- Das Spiel ist nach jedem Inkrement spielbar (CLAUDE.md, Anhang A).
- Priorität: **P0** = Inkremente 1–3, der neue spielbare Kern. **P1** = Inkremente 4–5. **P2** = Inkremente 6–7.
- Nicht Teil dieser Iteration: Handy- und Touch-Layout, manueller Lane-Schalter, Epochen.

## 1. Entscheidungen zu Iteration 2

| Punkt aus dem Bericht | Entscheidung |
|---|---|
| Stufenschwelle additiv gelesen | Bestätigt |
| XP-Faktor je Schwierigkeitsgrad | Bestätigt |
| Regel „Tor belagert" | Entfällt mit Inkrement 2 (REQ-14.5) |
| Eskalation +40 %/min ab Minute 16 | Bleibt bis Inkrement 5, dann durch REQ-19 ersetzt |
| Draft-Ausreißer (Schwere Pressen, Kriegsanleihe) | Erst in Inkrement 7 mit neuer Kennzahl bewerten |
| Handy-Layout | Zurückgestellt |

## 2. Begriffe (neu oder geändert)

| Begriff | Bedeutung |
|---|---|
| Lane | Eine von drei Bahnen: oben, Mitte, unten |
| Welle | Gemeinsamer Abmarsch aller Einheiten in der Warteschlange im festen Takt |
| Versorgungslimit | Höchstzahl an Einheiten pro Welle |
| Wellenbefehl | „Ausrücken" oder „Halten" für die nächste Welle |
| Abschnitt | Mauer oben, Tor (Mitte), Mauer unten; jeweils mit eigenen Lebenspunkten |
| Fabrik | Gebäude, das Material produziert; ersetzt die Fertiger |
| Verstärkungsgebäude | Schmiede, Kaserne, Universität, Handelskontor; jeweils einmal baubar |
| Spezialkarte | Anzeigename der Draft-Optionen |
| Kartenstufe | Stufe I–III einer Spezialkarte |

## 3. Inkrementplan

| Inkr. | Inhalt | REQ | Prio |
|---|---|---|---|
| I1 | Drei Lanes, Formation, Basis mit Abschnitten | 11, 12, 13 | P0 |
| I2 | Wellen mit Versorgungslimit, Wellenbefehl „Halten" | 14, 15 | P0 |
| I3 | 3×3-Raster, Fabriken, Umbau von Kaserne und Schmiede | 16, 17 | P0 |
| I4 | Spezialkarten mit Stufen | 18 | P1 |
| I5 | Belagerungswelle statt Eskalation | 19 | P1 |
| I6 | Erklärzeilen an allen Buttons, Erstkontakt-Hinweise | 20 | P2 |
| I7 | Simulation, Balancing, Bericht | 21 | P2 |

Für jedes Inkrement gilt die Definition „spielbar" aus Anhang A. Neue UI-Elemente bekommen ihre Erklärzeile sofort (CLAUDE.md). I6 ergänzt nur die fehlenden Elemente aus Iteration 2 und die Hinweise.

---

## 4. Inkrement 1 (P0)

### REQ-11 Drei Lanes

| ID | Anforderung |
|---|---|
| 11.1 | Zwischen eigener und gegnerischer Basis liegen drei Lanes: oben, Mitte, unten (`LANE_COUNT = 3`). |
| 11.2 | Einheiten bleiben in ihrer Lane und kämpfen nur gegen Gegner derselben Lane. Es gibt keinen Lane-Wechsel. |
| 11.3 | Die gegnerische Basis behält eine Lebensleiste. Eigene Einheiten greifen sie vom Ende jeder Lane aus an. Die Siegbedingung aus Iteration 2 bleibt. |
| 11.4 | Die Lanes sind klar getrennt dargestellt. Nah- und Fernkämpfer sind an ihrer Form unterscheidbar. |

### REQ-12 Formation und Verteilung

| ID | Anforderung |
|---|---|
| 12.1 | **Verteilung einer Gruppe von n Einheiten.** Zuerst werden die Nahkämpfer verteilt, danach die Fernkämpfer, jeweils nach dieser Regel: 1 → Mitte. 2 → Mitte und die Lane mit der stärkeren angekündigten Gegnerwelle (bei Gleichstand oben). 3 → je Lane eine. Ab 4 reihum Mitte, oben, unten. Kein Zufall. |
| 12.2 | **Übergang bis Inkrement 2:** Solange es noch keine Wellen gibt, bekommt jede gekaufte Einheit die nächste Lane in der Reihenfolge Mitte, oben, unten. |
| 12.3 | **Formation je Lane:** Nahkämpfer stehen vorn, Fernkämpfer dahinter, unabhängig von der Kaufreihenfolge. Gibt es in einer Lane keine Nahkämpfer, stehen die Fernkämpfer vorn. |
| 12.4 | **Reichweite:** Ein Fernkämpfer greift an, wenn höchstens `RANGED_RANGE_ROWS = 1` eigene Einheiten vor ihm stehen. In der Lane-Kolonne kämpft vorn nur die vorderste Einheit. |
| 12.5 | Für Gegner gelten dieselben Regeln. |

### REQ-13 Basis: Abschnitte, Türme, Tor

| ID | Anforderung |
|---|---|
| 13.1 | Am Ende jeder Lane liegt ein Abschnitt: Mauer oben, Tor, Mauer unten. Jeder Abschnitt hat eigene Lebenspunkte. |
| 13.2 | Der Turm oben steht auf der Mauer oben, der Turm unten auf der Mauer unten. Jeder greift nur Gegner seiner Lane an. Fällt sein Abschnitt, ist der Turm bis zur Reparatur inaktiv. |
| 13.3 | Fällt ein Mauerabschnitt, ziehen die Gegner dieser Lane zum Tor weiter. |
| 13.4 | Fällt das Tor auf 0, ist die Partie verloren. Das Tor ist die Lebensleiste der Basis und wird entsprechend sichtbar dargestellt. |
| 13.5 | Eigene Einheiten starten am Tor und laufen in ihre Lane. |
| 13.6 | Kosten in Material wie in Iteration 2. Turm-Upgrades gelten je Turm getrennt. Mauer-Upgrades wirken auf alle drei Abschnitte. Reparatur erfolgt je Abschnitt. |

**Akzeptanzkriterien I1**
- [ ] Test: Einheiten wechseln nie die Lane.
- [ ] Test: Verteilung für n = 1 bis 6 entspricht 12.1. Test für die Übergangsregel 12.2.
- [ ] Test: Ein Fernkämpfer mit einer Einheit vor sich greift an, mit zwei Einheiten vor sich nicht. Ein Fernkämpfer ohne Nahkämpfer in der Lane steht vorn.
- [ ] Test: Fällt die Mauer oben, ist der Turm oben inaktiv, und die Gegner der oberen Lane greifen das Tor an.
- [ ] Test: Tor auf 0 ergibt eine Niederlage.

---

## 5. Inkrement 2 (P0)

### REQ-14 Wellen mit Versorgungslimit

| ID | Anforderung |
|---|---|
| 14.1 | Ein Kauf legt die Einheit in eine Warteschlange. Alle `WAVE_INTERVAL_S = 20` Sekunden rückt die Warteschlange als Welle aus. Der Countdown ist sichtbar. |
| 14.2 | Die Warteschlange fasst höchstens `SUPPLY_CAP` Einheiten, zu Beginn `SUPPLY_CAP_START = 3`. Ist sie voll, sind Kaufknöpfe deaktiviert und zeigen den Grund, z. B. „Versorgung voll: 3/3". |
| 14.3 | Gegnerwellen kommen im selben Takt. Zusammensetzung und Lane-Verteilung entstehen zu Beginn des Countdowns über den seedbaren Zufallsgenerator. Sie werden je Lane als Vorschau angezeigt (Symbol je Einheitentyp und Anzahl). |
| 14.4 | Ist die Warteschlange leer, rückt keine eigene Welle aus. |
| 14.5 | Die Regel „Tor belagert" aus Iteration 2 entfällt. |
| 14.6 | Ab jetzt gilt die Verteilung nach 12.1 für die gesamte Welle, einschließlich der Regel zur stärkeren Gegnerwelle. |

### REQ-15 Wellenbefehl „Halten"

| ID | Anforderung |
|---|---|
| 15.1 | Ein Schalter legt den Befehl für die nächste Welle fest: „Ausrücken" (Standard) oder „Halten". Nach dieser Welle springt er automatisch auf „Ausrücken" zurück. |
| 15.2 | Bei „Halten" bleibt die Warteschlange erhalten und rückt mit der folgenden Welle aus. Das Versorgungslimit gilt weiter. |
| 15.3 | Solange „Halten" aktiv ist, kosten Turm-Upgrades, Mauer-Upgrades und Reparaturen `HOLD_DISCOUNT = 0.3` weniger. |
| 15.4 | „Halten" ist in der Oberfläche eindeutig erkennbar, etwa durch eine andere Farbe des Countdowns und ein Basis-Symbol. |

**Akzeptanzkriterien I2**
- [ ] Test: Einheiten rücken nur im Takt aus. Die Warteschlange nimmt nie mehr als `SUPPLY_CAP` Einheiten auf.
- [ ] Test: Die Gegnervorschau stimmt mit der tatsächlichen Gegnerwelle überein (gleicher Seed).
- [ ] Test: Bei „Halten" kostet eine Reparatur 70 % des Normalpreises, und der Befehl springt nach der Welle zurück.
- [ ] Kurzsimulation: 0 Partien offen, obwohl „Tor belagert" entfallen ist.

---

## 6. Inkrement 3 (P0)

### REQ-16 3×3-Raster und Fabriken

| ID | Anforderung |
|---|---|
| 16.1 | Die Basis hat neun Bauplätze im 3×3-Raster, alle ab Start offen (`GRID_SIZE = 3`). |
| 16.2 | Die Fertiger entfallen. Material kommt aus Fabriken; jede erzeugt `FACTORY_BASE_RATE` Material pro Sekunde. Fabriken sind mehrfach baubar. Die n-te Fabrik kostet `FACTORY_BASE_COST × FACTORY_COST_GROWTH^(n−1)` (Default für das Wachstum: 1,6). |
| 16.3 | Verstärkungsgebäude (Schmiede, Kaserne, Universität, Handelskontor) sind je einmal baubar (`MAX_PER_TYPE = 1`). |
| 16.4 | Die bisherigen Upgrades des Fabrik-Gebäudes und der Fertiger (u. a. Nachtschicht, Druckluft) werden zu Spezialkarten, in I3 zunächst ohne Stufen. Einzelne Fabriken haben kein eigenes Upgrade-Menü. |
| 16.5 | Abriss und 50 % Erstattung gelten weiter. Der Preis der nächsten Fabrik richtet sich nach der aktuellen Anzahl, sinkt nach einem Abriss also wieder. |
| 16.6 | Die Presse (Klick) bleibt Einnahmequelle des Frühspiels. Die Sollwerte aus REQ-03 gelten weiter und werden in I7 neu gemessen. |

### REQ-17 Kaserne und Schmiede neu

| ID | Anforderung |
|---|---|
| 17.1 | Jede Ausbaustufe der Kaserne hebt das Versorgungslimit um `KASERNE_SUPPLY_PER_LEVEL = 2` (3 → 5 → 7 → 9). Die bisherige Wirkung (günstiger oder schneller) entfällt. |
| 17.2 | Die Grundstärke aller Einheiten steigt je Altmetall-Stufe um `UNIT_STRENGTH_PER_LEVEL = 0.05`. Das gilt ohne Schmiede. |
| 17.3 | Die Schmiede verstärkt in Qualitätsstufen mit stark steigenden Kosten (`SMITHY_COST_GROWTH = 2.5`). Sie ist damit der Abfluss für überschüssiges Material. |

**Akzeptanzkriterien I3**
- [ ] Test: Neun Plätze. Die dritte Fabrik kostet das 1,6²-Fache der ersten. Ein zweites Verstärkungsgebäude desselben Typs ist nicht baubar.
- [ ] Test: Kaserne Stufe 2 ergibt ein Versorgungslimit von 7.
- [ ] Test: Die Einheitenstärke steigt mit den Stufen auch ohne Schmiede.
- [ ] Kurzsimulation: Partien ohne Schmiede gewinnen auf Normal mindestens 30 % (Iteration 2: nahe 0 %).

---

## 7. Inkrement 4 (P1)

### REQ-18 Spezialkarten mit Stufen

| ID | Anforderung |
|---|---|
| 18.1 | Die Draft-Optionen heißen in der Oberfläche „Spezialkarte" (en: „Special card"). |
| 18.2 | Karten haben bis zu `CARD_MAX_TIER = 3` Stufen. Stufe n+1 erscheint erst nach Wahl von Stufe n und ersetzt sie im Pool. Nach jeder Wahl steigt das Ziehgewicht der nächsten Stufe um den Faktor `CARD_TIER_WEIGHT_BONUS = 1.5`. |
| 18.3 | Bei Karten mit Nachteil wächst der Nachteil mit der Stufe. |
| 18.4 | Datenmodell: Das Feld `tiers: [{effect, drawback?}]` ersetzt `maxStacks`. Der Anzeigename trägt die Stufe als römische Zahl. |
| 18.5 | `requires`: Das Handelskontor wird nur angeboten, wenn mindestens eine Fabrik steht. |
| 18.6 | Pool mit Defaults, Werte werden in I7 kalibriert: |

| Karte | Stufen | Effekt I / II / III | Nachteil I / II / III |
|---|---|---|---|
| Bessere Fabriken | 3 | Fabrikertrag +25 / +60 / +120 % | – |
| Schwere Pressen | 3 | Produktion +40 / +75 / +120 % | Mauerabschnitte −15 / −30 / −45 % Lebenspunkte |
| Maurerkolonne | 3 | Mauerabschnitte regenerieren 0,5 / 1 / 2 % ihrer maximalen Lebenspunkte pro Sekunde, wenn sie 5 s lang nicht getroffen wurden. Das Tor ist ausgenommen. | – |
| Notreserve | 1 | Fällt das Tor unter 25 %, wird es einmal vollständig repariert | – |
| Aushebung (ersetzt Akkordlohn) | 2 | Versorgungslimit +1 / +2 | Einheiten −10 / −20 % Lebenspunkte |
| Weitschuss | 1 | `RANGED_RANGE_ROWS` +1 | – |
| Turmkanoniere | 3 | Turmschaden +40 / +80 / +150 % | – |
| Handelskontor | 1 | Freischaltung; setzt eine Fabrik voraus | – |
| Übrige bestehende Karten | – | Übernehmen. Stufen nach Ermessen des Agenten, Vorschlag im Plan vorlegen. | – |

**Akzeptanzkriterien I4**
- [ ] Test: Stufe II erscheint nie vor Stufe I. Nach Stufe III erscheint die Karte nicht mehr.
- [ ] Test: Maurerkolonne heilt nicht, solange ein Treffer weniger als 5 s zurückliegt, und heilt nie das Tor.
- [ ] Test: Ohne Fabrik wird das Handelskontor nie angeboten.

---

## 8. Inkrement 5 (P1)

### REQ-19 Belagerungswelle statt Eskalation

| ID | Anforderung |
|---|---|
| 19.1 | Die Eskalation (+40 % pro Minute ab Minute 16) entfällt. |
| 19.2 | In Minute `SIEGE_MINUTE = 16` greift eine Belagerungswelle mit `SIEGE_STRENGTH = 3` facher Stärke einer normalen Gegnerwelle an. |
| 19.3 | Die Belagerungswelle wird `SIEGE_WARNING_S = 60` Sekunden vorher mit sichtbarem Countdown angekündigt. |
| 19.4 | Nach der Belagerungswelle steigt die Gegnerstärke linear um `POST_SIEGE_GROWTH = 0.10` pro Minute. |

**Akzeptanzkriterien I5**
- [ ] Test: Ankündigung genau 60 s vor der Belagerungswelle. Danach steigt die Stärke linear, nicht exponentiell.
- [ ] Kurzsimulation: 0 Partien offen.

---

## 9. Inkrement 6 (P2)

### REQ-20 Erklärungen

| ID | Anforderung |
|---|---|
| 20.1 | Jeder Button trägt unter der Beschriftung eine Zeile „Wirkung · Kosten", z. B. „Fabrik · +12/s · 150 Material". Der Tooltip mit 1.000 ms Verzögerung bleibt für Details. Diese Regel ersetzt Vorgabe 05.5 aus Iteration 2. |
| 20.2 | Beim ersten Auftreten eines Systems erscheint einmalig ein kurzer Hinweis (höchstens 2 Zeilen, wegklickbar). Betroffen sind: erste Welle, erste Spezialkarte, erster „Halten"-Befehl, erster Abriss, Ankündigung der Belagerungswelle. |
| 20.3 | Gesehene Hinweise werden im Browser-Speicher vermerkt (Zugriff in try/catch). Auf dem Startbildschirm gibt es „Hinweise zurücksetzen". |
| 20.4 | Alle Texte liegen in `de` und `en`. |

**Akzeptanzkriterien I6**
- [ ] Browser-Prüfung: Jeder Button hat eine Erklärzeile.
- [ ] Test: Jeder Hinweis erscheint pro Browser nur einmal; nach dem Zurücksetzen erscheint er wieder.

---

## 10. Inkrement 7 (P2)

### REQ-21 Simulation, Balancing, Bericht

| ID | Anforderung |
|---|---|
| 21.1 | **Bots:** Sie nutzen die automatische Verteilung. Wellenbefehl als Strategie: „nie Halten" und „Halten, sobald ein Abschnitt unter 50 % fällt". Neu ist der Bot „nur Verteidigung": immer „Halten", keine Einheiten. |
| 21.2 | **Neue Kennzahlen:** Siegquote bei Wahl je Karte im Vergleich zur Siegquote ohne sie (Differenz in Prozentpunkten); Patt-Quote; Anteil der Wellen am Versorgungslimit; Siegquote je Gebäudekombination; Klickanteile je Phase nach REQ-03. |
| 21.3 | **Serie:** 200 Partien je Schwierigkeitsgrad und Spielerprofil. |
| 21.4 | **Sollwerte:** Die Zielkorridore aus Iteration 2 gelten. Zusätzlich: Patt-Quote höchstens 2 %. Der Bot „nur Verteidigung" gewinnt 0 %, seine Partien enden spätestens in Minute 25. Das Profil „aktiv" gewinnt je Schwierigkeitsgrad mindestens so oft wie „durchschnitt". |
| 21.5 | **Balancing** ausschließlich über Konstanten der Konfiguration. Karten mit einer Differenz über +25 Prozentpunkte werden berichtet und nicht automatisch abgeschwächt. |
| 21.6 | **Bericht:** `docs/bericht-iteration-3.md` nach CLAUDE.md, Abschnitt „Abschluss einer Iteration". |

---

## 11. Konfiguration (neue Konstanten, Defaults)

| Konstante | Default | REQ |
|---|---|---|
| `LANE_COUNT` | 3 | 11 |
| `RANGED_RANGE_ROWS` | 1 | 12 |
| `WAVE_INTERVAL_S` | 20 | 14 |
| `SUPPLY_CAP_START` | 3 | 14 |
| `HOLD_DISCOUNT` | 0.3 | 15 |
| `GRID_SIZE` | 3 | 16 |
| `FACTORY_BASE_RATE` / `FACTORY_BASE_COST` | per Simulation | 16 |
| `FACTORY_COST_GROWTH` | 1.6 | 16 |
| `MAX_PER_TYPE` | 1 (nur Verstärkungsgebäude) | 16 |
| `KASERNE_SUPPLY_PER_LEVEL` | 2 | 17 |
| `UNIT_STRENGTH_PER_LEVEL` | 0.05 | 17 |
| `SMITHY_COST_GROWTH` | 2.5 | 17 |
| `CARD_MAX_TIER` | 3 | 18 |
| `CARD_TIER_WEIGHT_BONUS` | 1.5 | 18 |
| `WALL_REGEN_DELAY_S` | 5 | 18 |
| `SIEGE_MINUTE` | 16 | 19 |
| `SIEGE_STRENGTH` | 3 | 19 |
| `SIEGE_WARNING_S` | 60 | 19 |
| `POST_SIEGE_GROWTH` | 0.10 | 19 |

Konstanten, die mit Iteration 3 entfallen (Fertiger, Eskalation, „Tor belagert"), werden entfernt, nicht auskommentiert.

---

## Anhang A: Definition „spielbar"

Ein Inkrement ist fertig, wenn alle Punkte erfüllt sind:
1. Das Spiel startet auf dem dokumentierten Weg ohne Fehler in der Konsole. Fehlt eine Startanleitung, wird sie ins README geschrieben.
2. `npm test` ist grün. `npm run test:browser` ist grün, sofern vorhanden.
3. Kurzsimulation mit 20 Partien auf Normal und gieriger Heuristik: keine offene Partie, Siegquote zwischen 20 % und 100 %.
4. Neue Texte liegen in `de` und `en`, neue Buttons haben Tooltip und Erklärzeile.
5. Commit `I3.x: <Inkrement>` auf `iteration-3`, und `docs/STAND.md` ist aktualisiert.

## Anhang B: Nach Abschluss an den PO berichten

- Wie das Spiel gestartet wird (eine Zeile).
- Die Klartext-Zusammenfassung nach CLAUDE.md.
- Welche Inkremente fertig sind und welche offen bleiben, mit Grund.

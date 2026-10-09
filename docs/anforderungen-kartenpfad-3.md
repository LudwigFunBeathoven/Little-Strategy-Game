# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 3: Pacing und Qualität der Kartenwahl
 
Stand: 09.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-3.md` · Branch: `exp/kartenpfad`
Bezug: Entwicklungsstand vom 09.10.2026 (`main` 0.9.2, Branch 0.9-kartenpfad), `docs/bericht-kartenpfad.md`, `docs/bericht-kartenpfad-2.md`, `docs/anforderungen-kartenpfad-2.md`
 
## 0. Auftrag in Kürze
 
Teil 3 macht den Modus `karten` reif für den ersten Spieltest mit Menschen. Er umfasst drei Schritte:
 
1. **Abgleich:** `main` 0.9.2 wird in den Branch gemischt.
2. **Pacing:** Kartenwahlen folgen einem Fahrplan. Zehn Wahlen verteilen sich gleichmäßig über eine Partie von 10–14 Minuten.
3. **Qualität der Wahl:** Jedes Angebot enthält eine echte Abwägung. Pflichtkarten stehen gegeneinander, wirkungslose Karten werden nicht angeboten.
**Befund (PO):** Kartenwahlen kommen am Anfang zu früh und später zu selten. Ursache laut Bericht: Die EP-Schwellen steigen je Wahl um 12 %, während der EP-Ertrag mit dem Armee-Limit stagniert. Echtes Militär und Gelehrte werden in über 60 % der Angebote gewählt; mehrere Bonuskarten liegen unter 5 %.
 
**Nicht Teil dieses Auftrags:** Wirtschaft und Druckkurve der Gegner (außer der einen Stellschraube in REQ-P.03), Spieltest, neue Gebäude, Grafik, Änderungen an `main`. Dafür folgen eigene Dokumente.
 
## 1. Entscheidungen des PO
 
| Thema | Entscheidung |
|---|---|
| Partiedauer im Modus `karten` | 10–14 Minuten (Median, Profil „durchschnitt“, Normal) |
| Zahl der Kartenwahlen | 10 je Partie |
| Prototyp | Bleibt privat; kein Merge nach `main` |
 
## 2. Arbeitsgrundlagen
 
- **Vor Beginn lesen:** `CLAUDE.md`, `docs/STAND-kartenpfad.md` (bzw. die Stand-Datei des Branches), `docs/bericht-kartenpfad.md`, `docs/bericht-kartenpfad-2.md`, dieses Dokument. Dieses Dokument muss im Repository liegen; ältere Fassungen gelten nicht.
- **Invarianten** gelten unverändert: `core.js` ohne DOM; Zufall nur über `S.rng`; Zahlen nur in `config.js` bzw. `data/`, Texte nur in `i18n/`; Spielstand als azyklisches JSON; Tooltip und Erklärzeile an jedem sichtbaren Bedienelement.
- **Modus `standard`** im Branch bleibt nach dem Abgleich identisch zu `main` 0.9.2 (Golden-Test).
- **Fehler, die auch `main` betreffen,** werden auf `main` behoben (eigener `fix/…`-Branch), danach in den Branch gemischt.
- **Simulation:** 50 Partien je Feld. Keine Serien über mehrere Stunden (kein Paarvergleich je Karte).
- **Grenze der Simulation:** Bots gewinnen fast immer. Wahlraten der Bots zeigen ihre Bauordnung, nicht die Attraktivität einer Karte. Siegquoten werden berichtet, sind aber kein Abnahmekriterium außer in REQ-P.06.
## 3. Anforderungen
 
| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| P.01 | Abgleich mit `main` 0.9.2 | Muss | P.0 |
| P.02 | Wahl-Fahrplan | Muss | P.1, P.2 |
| P.03 | Partiedauer 10–14 Minuten | Muss | P.3 |
| P.04 | Angebot mit echter Abwägung | Muss | P.4 |
| P.05 | Keine wirkungslosen Karten im Angebot; Pool bereinigen | Muss | P.5 |
| P.06 | Messung, Bericht, Testbuild | Muss | P.6 |
 
---
 
### REQ-P.01 Abgleich mit `main` 0.9.2
 
**Ausgangslage:** Der Branch enthält `main` bis v0.8.1 und eigene Fehlerbehebungen. In `main` stehen zusätzlich die Oberfläche 0.9 (Bühne, Entdecken), die Textsymbole der Karten (0.9.1) und die Korrekturen 0.9.2 (wirkungslose Upgrades am Versorgungsdeckel, Anzeige „Schmiede-Ausbau“).
 
**Anforderungen**
 
- `main` (Commit `73e1590` oder neuer) in `exp/kartenpfad` mischen.
- **Konfliktregeln:**
  - Oberfläche (Bühne, Ablauf der Wahl, Kartenaufbau, Entdecken, Kartensymbol): Fassung aus `main`. Der Branch ergänzt nur, was der Modus `karten` braucht (Kartenfamilien, Wirkorte der Familien, Freischaltungen).
  - Fehlerbehebungen, die in beiden Linien existieren (Kontext-Ausbau, Klicks in der Pause): Fassung aus `main`. Die Branch-Fassung entfällt.
  - Branch-eigene Korrektur „gesperrte Ausbauten“ bleibt.
  - Spielregeln und Werte des Modus `karten`: Fassung des Branches.
- **Spielstand:** Der Branch behält eine eigene, höhere Version als `main` (derzeit 8) und das eigene Schlüsselpräfix für `localStorage`.
- **Stand-Dokument:** Der Branch führt `docs/STAND-kartenpfad.md`; `docs/STAND.md` stammt aus `main`. Falls noch nicht getrennt, jetzt trennen.
- **Wirkungsprüfung:** Die Prüfung auf wirkungslose Upgrades aus 0.9.2 läuft auch im Modus `karten`. Gefundene Fälle werden im Branch behoben und berichtet.
**Akzeptanzkriterien**
 
- `npm test`, `npm run test:browser` und `tests/browser-k2.mjs` grün.
- Golden-Test: Modus `standard` im Branch identisch zu `main` 0.9.2.
- Kurzsimulation Modus `karten` läuft ohne offene Partien; Kennzahlen vor und nach dem Abgleich im Bericht.
- Liste der Konflikte und ihrer Auflösung im Bericht.
---
 
### REQ-P.02 Wahl-Fahrplan
 
**Ziel:** Kartenwahlen kommen in gleichmäßigem Takt über die ganze Partie. Der Spieler trifft die zentrale Entscheidung des Spiels etwa jede Minute.
 
**Fahrplan** (Profil „durchschnitt“, Normal; Werte in `config.js`, Abschnitt `KARTEN.fahrplan`):
 
| Wahl | Zielzeit | Abstand zur vorherigen |
|---|---|---|
| 1 | 1:30 | – |
| 2 | 2:40 | 70 s |
| 3 | 3:45 | 65 s |
| 4 | 4:50 | 65 s |
| 5 | 5:55 | 65 s |
| 6 | 7:00 | 65 s |
| 7 | 8:05 | 65 s |
| 8 | 9:10 | 65 s |
| 9 | 10:15 | 65 s |
| 10 | 11:20 | 65 s |
| ab 11 | je 65 s | 65 s |
 
Die erste Wahl fällt mit dem Ende des Tutorials zusammen; die EP-Garantie des Tutorials bleibt.
 
**Mechanik**
 
- **Schwellen aus dem Fahrplan:** Die EP-Schwelle der Wahl n entspricht dem Median-EP-Ertrag des Referenzlaufs zwischen Zielzeit n−1 und Zielzeit n. Referenzlauf: korrigierter Simulations-Bot aus `main`, Profil „durchschnitt“, Normal. Die Schwellen stehen als Tabelle in `config.js`. Der Wachstumsfaktor (derzeit 1,12) entfällt.
- **Mindestabstand:** Zwischen zwei Wahlen liegen mindestens 45 s Spielzeit. EP über der Schwelle werden mitgenommen.
- **Höchstabstand:** Steht 100 s nach der letzten Wahl keine neue an, wird sie fällig (bisheriges Mindesttempo, Wert angepasst).
- **Aktive Spieler** dürfen vor dem Fahrplan liegen, höchstens um den Mindestabstand begrenzt. Das bleibt die Belohnung für aktives Spiel.
- **Schwierigkeitsgrade:** Die Schwellen sind für alle Grade gleich. Abweichungen der Wahlzeiten auf Leicht und Schwer werden berichtet.
- **Anzeige:** Das Kartensymbol in der Ressourcenleiste zeigt den Fortschritt zur nächsten Wahl wie bisher.
**Akzeptanzkriterien** (Kurzsimulation, 50 Partien je Feld)
 
- Normal, „durchschnitt“: Median der Wahlzeit je Wahl 1–10 innerhalb von ±20 s der Zielzeit.
- Normal, „durchschnitt“: In ≥ 95 % der Fälle liegt der Abstand zwischen zwei Wahlen zwischen 45 s und 100 s.
- Normal, „aktiv“: Wahl 5 im Median nicht später als die Zielzeit, Wahl 10 höchstens 20 % früher als die Zielzeit.
- Normal, „gelegentlich“: Wahlzeiten berichten.
- Test: Mindest- und Höchstabstand greifen (konstruierter Spielstand mit hohem bzw. null EP-Ertrag).
---
 
### REQ-P.03 Partiedauer 10–14 Minuten
 
**Befund:** Partien im Modus `karten` dauern derzeit 9–10 Minuten. Zehn Wahlen brauchen bis Wahl 10 rund 11:20 Minuten. Ohne längere Partien ist der Fahrplan nicht erfüllbar.
 
**Anforderungen**
 
- Eine einzige Stellschraube für die Partiedauer: die Lebenspunkte der gegnerischen Basis (Wert in `config.js`, nur im Modus `karten`). Claude Code wählt den Wert per Simulation.
- Die Stärke der gegnerischen Wellen bleibt unverändert. Die Druckkurve folgt mit Anforderung 3 in einem eigenen Dokument.
- Lässt sich das Ziel mit dieser Stellschraube nicht erreichen, wird das mit Ursache und Vorschlag berichtet. Weitere Werte werden nicht geändert.
**Akzeptanzkriterien**
 
- Normal, „durchschnitt“: Median der Partiedauer 10–14 min.
- Median der Zahl der Wahlen je Partie 9–11.
- 90. Perzentil der Partiedauer ≤ 20 min auf allen Feldern; Patt-Quote ≤ 2 %.
- Siegquoten je Feld vorher und nachher berichtet.
---
 
### REQ-P.04 Angebot mit echter Abwägung
 
**Ziel:** Eine Wahl stellt zwei Wege der Entwicklung gegeneinander. Die Entscheidung liegt dann in der Reihenfolge der Pfade.
 
**Regeln für das Angebot** (ersetzt die Zusammensetzung aus Teil 1, REQ-KP.02)
 
| Ziehbare Pfadkarten | Angebot mit 3 Karten | Angebot mit 4 Karten (Universität) |
|---|---|---|
| 0 | 3 Bonus | 4 Bonus |
| 1 | 1 Pfad, 2 Bonus | 1 Pfad, 3 Bonus |
| 2 oder mehr | 2 Pfad, 1 Bonus | 2 Pfad, 2 Bonus |
 
- Höchstens eine Wagnis-Karte je Angebot; sie belegt einen Bonusplatz.
- Die Grenze „Bau-Karte erscheint spätestens in der dritten Wahl nach ihrer Freigabe“ bleibt. Sie bestimmt, welche zwei Pfadkarten gezeigt werden, wenn mehr als zwei ziehbar sind.
- Sonst werden die Pfadkarten nach Gewicht gezogen. Echtes Militär und Gelehrte haben kein höheres Gewicht als andere Bau-Karten.
- Neu ziehen behält die Zahl der Pfadplätze.
- Technologiekarten erscheinen weiterhin erst, wenn die Universität steht.
**Akzeptanzkriterien**
 
- Test (Seed-Reihe über 1.000 Angebote): Jedes Angebot folgt der Tabelle.
- Test: Grenze „spätestens dritte Wahl“ greift auch mit zwei Pfadplätzen.
- Kurzsimulation mit den drei Pfad-Varianten („Militär zuerst“, „Wissen zuerst“, „Festung zuerst“): Siegquoten innerhalb von 15 pp. Dieses Kriterium prüft, ob alle Wege tragen.
- Bericht: Verteilung der ersten und zweiten gewählten Pfadkarte je Pfad-Variante.
---
 
### REQ-P.05 Keine wirkungslosen Karten im Angebot; Pool bereinigen
 
**Grundregel:** Eine Karte wird nur angeboten, wenn ihre Wirkung im aktuellen Spielstand größer als null ist. Beispiel: Eine Karte, die Türme verstärkt, erscheint erst, wenn ein Turm steht oder baubar ist.
 
**Anforderungen**
 
- Jede Bonuskarte erhält eine Angebotsbedingung, die aus ihrer Wirkung abgeleitet ist (Daten in `data/`). Vorhandene Bedingungen bleiben.
- **Inventar der seltenen Karten:** Alle Bonuskarten, die im Modus `karten` in unter 5 % der Angebote gewählt werden, kommen auf eine Liste. Für jede gibt Claude Code eine Ursache an (Bedingung fehlt, Wirkung zu schwach, passt nicht zum Modus) und schlägt eine Maßnahme vor: Bedingung ergänzen, Wirkung anpassen oder im Modus `karten` aus dem Pool nehmen. Die Liste geht vor der Umsetzung der Werteänderungen an den PO; Bedingungen dürfen direkt ergänzt werden.
- **Namensdopplung:** Die Bonuskarte „Festungsbau“ heißt im Modus `karten` „Mauerwerk“ (Text-Schlüssel mit Modus-Suffix). Die Pfadkarte behält den Namen „Festungsbau“.
**Akzeptanzkriterien**
 
- Test: Für jede Bonuskarte gibt es einen Spielstand, in dem sie nicht angeboten wird, weil ihre Wirkung null wäre, und einen, in dem sie angeboten wird.
- Test (1.000 Angebote über Simulationsläufe): Keine angebotene Karte hat im jeweiligen Spielstand Wirkung null.
- Inventar im Bericht.
- Kein Kartentitel kommt im Modus `karten` doppelt vor (Test).
---
 
### REQ-P.06 Messung, Bericht, Testbuild
 
**Simulation:** 50 Partien je Feld (Leicht, Normal, Schwer; Profile „aktiv“, „durchschnitt“, „gelegentlich“) mit dem korrigierten Simulations-Bot; zusätzlich die drei Pfad-Varianten auf Normal.
 
**Zu berichten**
 
| Kennzahl | Zielwert |
|---|---|
| Wahlzeiten 1–10 je Profil, Median und Streuung | Normal „durchschnitt“: ±20 s zum Fahrplan |
| Abstände zwischen Wahlen | 45–100 s in ≥ 95 % |
| Wahlen je Partie | Median 9–11 |
| Partiedauer | Median 10–14 min; P90 ≤ 20 min |
| Patt-Quote | ≤ 2 % |
| Siegquote der drei Pfad-Varianten | innerhalb 15 pp |
| Siegquote je Feld | berichten |
| Wahlrate je Bonus- und Technologiekarte | berichten; Liste unter 5 % mit Maßnahmen |
| Zeitpunkte von Kaserne, Schmiede, Universität | berichten |
 
Eine Grafik der Wahlzeiten (Fahrplan gegen gemessenen Median je Profil) gehört in den Bericht.
 
**Bericht:** `docs/bericht-kartenpfad-3.md` mit Ergebnis je REQ, Konfliktliste aus P.01, Inventar aus P.05, Kennzahlen vor und nach der Änderung, Auslegungen zur Bestätigung.
 
**Testbuild:** privat, mit Protokollexport (`?debug=1`). Das Protokoll enthält zusätzlich je Wahl die Zielzeit des Fahrplans und die tatsächliche Zeit.
 
## 4. Inkrementplan
 
| Inkrement | Inhalt | REQ |
|---|---|---|
| P.0 | Abgleich mit `main` 0.9.2; Wirkungsprüfung im Modus `karten` | P.01 |
| P.1 | Basislinie: Wahlzeiten, Abstände, Partiedauer nach dem Abgleich messen | P.02 |
| P.2 | Fahrplan, Schwellen aus dem Referenzlauf, Mindest- und Höchstabstand | P.02 |
| P.3 | Partiedauer über die Lebenspunkte der gegnerischen Basis | P.03 |
| P.4 | Angebotsregeln mit zwei Pfadplätzen | P.04 |
| P.5 | Angebotsbedingungen, Inventar seltener Karten, Umbenennung | P.05 |
| P.6 | Simulation, Bericht, Testbuild | P.06 |
 
**Reihenfolge:** P.2 und P.3 hängen zusammen. Nach P.3 wird der Referenzlauf für die Schwellen wiederholt, weil längere Partien den EP-Ertrag in der Spätphase verändern.
 
**Abbruchregel:** Jedes Inkrement ist spielbar. Priorität bei knappem Budget: P.0 → P.2 → P.3 → P.6 (mindestens Bericht und Testbuild) → P.4 → P.5.
 
## 5. Schwache Annahmen und offene Punkte
 
| Punkt | Risiko | Standard |
|---|---|---|
| Referenzlauf mit einem Bot | Der Fahrplan wird für einen Bot eingestellt, der fast immer gewinnt. Menschen erzeugen anders EP. | Spieltest (Anforderung 4) prüft die Wahlzeiten mit dem Protokoll |
| Zehn Wahlen in elf Minuten | Bei acht bis neun Wahlen ohne Pause kann die Bühne ermüden | Dauern der Animation in `config.js`; Beobachtung im Spieltest |
| Längere Partien nur über die gegnerische Basis | Die Mitte der Partie kann sich ziehen, wenn der Druck der Wellen gleich bleibt | Druckkurve mit Anforderung 3 |
| Zwei Pfadplätze | Weniger Platz für Boni; Bonuskarten werden seltener gewählt | Wahlraten berichten; Inventar aus P.05 |
| Gleiche Schwellen für alle Grade | Auf Schwer kommen Wahlen später | Berichten; Anpassung nach dem Spieltest |
| Name „Mauerwerk“ | Vom PO noch nicht bestätigt | Übernehmen, PO kann ändern |
 
## 6. Definition of Done
 
- `npm test`, `npm run test:browser`, `tests/browser-k2.mjs` grün; neue Tests je REQ.
- Modus `standard` im Branch identisch zu `main` 0.9.2.
- Kennzahlen aus P.06 im Bericht; verfehlte Zielwerte mit Ursache und Vorschlag.
- `docs/STAND-kartenpfad.md`, `CHANGELOG.md` und Testleitfaden aktualisiert.
- Testbuild privat verfügbar.

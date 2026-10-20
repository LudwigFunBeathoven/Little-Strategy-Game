# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 7: Haupthaus, Fabrikgrenze, neue Weiterentwicklungen und historisches Setting

Stand: 20.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-7.md` · Branch: `exp/kartenpfad`
Bezug: `docs/bericht-kartenpfad-6.md`, `docs/anforderungen-kartenpfad-6.md`, Recherche `klammerfront/recherche-bauen-und-setting.md` (Projekt, Abschnitte 2–5a)

## 1. Ziel und Umfang

**Befund (PO):** Bauen bleibt eintönig. Es entstehen immer Kaserne, Universität, Schmiede und dann möglichst viele Fabriken. Kartenziehen und Weiterentwicklungen bewähren sich; zwei weitere Bereiche sollen eine Weiterentwicklung erhalten. Das Spiel soll ein historisierendes Setting bekommen.

**Ursache (Recherche, validiert am Bericht zu Teil 6):** Die Fabrik ist das einzige Gebäude, dessen Nutzen mit der Zahl wächst; eine zweite Universität, Schmiede oder Kaserne bringt nichts. Material ist im Überfluss, kauft aber keinen Abschluss. Nur Militär-Karten beschleunigen die Zerstörung der gegnerischen Basis (Auffälligkeit 1: Militär 11:38, Wirtschaft 17:11, Verteidigung 20:49 min).

**Grundsatz (PO, gilt weiter):** Die Grundlagen jeder Strategie sind ohne Karte verfügbar. Zentrale Entwicklungen werden über Karten bestimmt.

**Ziel:** Fünf Änderungen:

1. Ein Haupthaus im Mittelfeld. Seine Stufen kommen über Karten, mit jeder Stufe wächst ein Flügel an, der Grundfunktionen eines Spezialgebäudes übernimmt.
2. Eine feste Obergrenze für Fabriken, die mit der Stufe des Haupthauses wächst.
3. Zwei neue Weiterentwicklungen mit Schaden an der gegnerischen Basis: Kontor → Handelshaus, Schmiede → Gießerei.
4. Die bestehenden Weiterentwicklungen kommen früher; höchstens zwei Stufen je Gebäude und Partie.
5. Historisierendes Setting (etwa 1350–1850) für Gebäude, Stufen und Weiterentwicklungen.

**Nicht im Umfang**

- Belagerung und Druckkurve (eigene Runde).
- Weiterentwicklungen für Mauer, Türme und Kaserne.
- Historische Namen für Einheiten (offene Frage, Abschnitt 5).
- Lagewerte für einzelne Bauplätze.
- Neue Grafik; das Haupthaus bekommt ein Symbol aus den vorhandenen Zeichenmitteln.
- Patch 0.9.3 für `main` (Formationen außerhalb des Feldes): eigene Entscheidung des PO.
- Änderungen an `main` und am Modus `standard`.

**Hinweis zur Messung:** Normal trennt die Siegquote kaum (fast nur Siege). Kriterien zur Stärke nutzen Dauer, Wahlen, Mauerverlust, Fabrikzahl und die Spannweite der Kategorie-Bots. Jedes Kriterium ist markiert: **[Bot]** oder **[Mensch]**.

## 2. Anforderungen

| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| K7.01 | Basismessung | Muss | R.0 |
| K7.02 | Haupthaus im Mittelfeld | Muss | R.1 |
| K7.03 | Haupthaus-Stufen über Karten, Flügel | Muss | R.2 |
| K7.04 | Feste Obergrenze für Fabriken | Muss | R.1 |
| K7.05 | Doktrinen an die Obergrenze anpassen | Muss | R.1 |
| K7.06 | Weiterentwicklung Kontor → Handelshaus | Muss | R.3 |
| K7.07 | Weiterentwicklung Schmiede → Gießerei | Muss | R.3 |
| K7.08 | Bestehende Weiterentwicklungen früher | Muss | R.4 |
| K7.09 | Historisches Setting: Benennung | Muss | R.5 |
| K7.10 | Zweites Exemplar von Kaserne und Universität | Soll | R.6 |
| K7.11 | Ausfall mit Schaden an der Basis | Soll | R.6 |
| K7.12 | Bots, Messung, Bericht, Testbuild | Muss | R.0, R.7 |

---

### REQ-K7.01 Basismessung

Stand nach Teil 6, gleiche Seeds, 50 Partien je Feld:

- Fabriken (einschließlich Varianten und Sonderbauten auf Fabrikplätzen) im Raster bei Minute 2, 5 und 10, je Bot.
- Belegung der übrigen Plätze (welches Gebäude, wie oft doppelt).
- Werte der Nachbarschafts-Synergien (Bauordnung, Gilde) am Partieende.
- Zeitpunkt des Abschlusses von Dampfkraft und Buchdruck je Bot.
- Spannweite der Dauer-Mediane der Kategorie-Bots, Patt-Quote mit `?druck=hoch`.

**Akzeptanzkriterium:** Tabelle im Bericht **[Bot]**.

---

### REQ-K7.02 Haupthaus im Mittelfeld

**Anforderungen**

- Im Modus `karten` steht ab Start im Mittelfeld des 3×3-Rasters das Haupthaus, Stufe I „Gutshof“. Es lässt sich nicht abreißen, versetzen oder aufwerten (Varianten); seine Entwicklung läuft über K7.03.
- Für andere Gebäude bleiben acht Plätze.
- Das Haupthaus gibt und erhält keine Nachbarschaftsboni. Folge: Fabrikketten verlieren das Mittelfeld, ihren Platz mit den meisten Nachbarn. Das ist beabsichtigt und wird gemessen (K7.12).
- Klick auf das Haupthaus öffnet einen eigenen Reiter „Haupthaus“ (Stufe, Flügel, Obergrenze für Fabriken). Der Reiter folgt den Regeln von Entdecken: sichtbar ab Start, Flügel erst mit Stufe II.
- Fällt das Tor, gilt die Partie weiter als verloren; das Haupthaus hat keine Lebenspunkte.

**Akzeptanzkriterien**

- Test: Mittelfeld ab Start belegt, nicht abreißbar, kein Nachbarschaftsbonus von oder an das Haupthaus **[Bot]**.
- Bildschirmfoto des Rasters und des Reiters im Bericht **[Bot]**.

---

### REQ-K7.03 Haupthaus-Stufen über Karten, Flügel

**Grundsatz:** Die Stufen des Haupthauses sind zentrale Entwicklungen und kommen deshalb über Karten. Jede Stufe öffnet einen Flügel nach Wahl des Spielers.

**Stufen**

| Stufe | Name | Karte (Familie Weiterentwicklung, neutral) | Wirkung |
|---|---|---|---|
| I | Gutshof | – (ab Start) | Obergrenze 3 Fabriken; kein Flügel |
| II | Rathaus | Stadtrecht | Obergrenze 4 Fabriken; erster Flügel |
| III | Residenz | Hofhaltung (benötigt Stadtrecht) | Obergrenze 5 Fabriken; zweiter Flügel |

- Die Karten brauchen keine Universität. Nach der Wahl kostet der Ausbau Material (Startwert: Stadtrecht 400, Hofhaltung 900) und dauert 15 s.
- **Angebot:** Stadtrecht ab Wahl 2, spätestens in der fünften Wahl; Hofhaltung frühestens zwei Wahlen nach Abschluss von Stadtrecht. Die Karten belegen einen Pfadplatz.

**Flügel** (je Stufe einer nach Wahl, höchstens zwei je Partie; jeder Flügel nur einmal)

| Flügel | Wirkung | Ersetzt teilweise |
|---|---|---|
| Bibliothek | Ein eigener Forschungsplatz. Technologiekarten erscheinen auch ohne Universität. Forschungen dauern dort ×1,5. Forschungsbudget bis 25 % | Universität |
| Zeughaus | Schmiede-Ausbauten Stufe 1 und 2 ohne Schmiede | Schmiede |
| Schatzkammer | Zinsen auf den Materialbestand, Deckel 50 % des Kontors | Kontor |
| Kanzlei | Eine Karte mehr je Angebot; nicht zusätzlich zur Universität (höchstens 4 Karten) | Kartenwahl der Universität |

- Die Wahl des Flügels ist endgültig.
- Das Spezialgebäude bleibt in seinem Bereich stärker: Universität mit 50 % Budget und ohne Zeitaufschlag, Schmiede mit allen Stufen und Varianten, Kontor mit vollem Zinsdeckel und Weiterentwicklung (K7.06).
- Weiterentwicklungen, deren Forschung eine Universität brauchte, lassen sich auch in der Bibliothek erforschen; Ausnahme: Buchdruck braucht eine Universität.

**Akzeptanzkriterien**

- Test: Stufe II und III nur nach Wahl der Karte und Bezahlung; Obergrenze und Flügel wie in der Tabelle **[Bot]**.
- Test je Flügel: Wirkung greift; Kanzlei und Universität zusammen ergeben höchstens 4 Karten **[Bot]**.
- Test: Mit Bibliothek und ohne Universität lassen sich Technologiekarten wählen und erforschen **[Bot]**.
- Simulation: Stadtrecht im Median spätestens in Wahl 5 abgeschlossen; Anteil der Partien mit Residenz berichten **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester spielt eine Partie ohne mindestens eines der Gebäude Universität, Schmiede oder Kontor **[Mensch]**.

---

### REQ-K7.04 Feste Obergrenze für Fabriken

**Regel:** Erlaubt sind 3, 4 bzw. 5 Fabrikplätze auf Haupthaus-Stufe I, II bzw. III. Als Fabrikplatz zählt jedes Gebäude, das aus einer Fabrik hervorgeht: Grundform (künftig Manufaktur, K7.09), Grundvarianten, Sonderbauten (Zunfthaus, Bastion) und die Stufen der Weiterentwicklung.

**Rechnung, die die Regel beabsichtigt:** Acht freie Plätze. Auf Stufe I: drei Fabrikplätze, Kaserne, Universität, Schmiede, Kontor, ein Platz frei. Auf Stufe III: fünf Fabrikplätze und nur drei Plätze für die vier übrigen Gebäude. Wer wächst, muss ein Spezialgebäude durch einen Flügel ersetzen oder weglassen.

**Anforderungen**

- Bau über der Grenze ist gesperrt, mit Erklärzeile („Höchstens 3 Fabriken, mehr mit Stadtrecht“).
- Die Anzeige der Grenze steht im Reiter „Bauen“ und im Reiter „Haupthaus“.
- Bestand über der Grenze entsteht nicht, weil die Grenze nur steigt.

**Akzeptanzkriterien**

- Test: Grenze greift für jede Form, die aus einer Fabrik hervorgeht **[Bot]**.
- Simulation: Fabrikplätze bei Minute 10 nie über der Grenze; Belegung der übrigen Plätze im Bericht **[Bot]**.

---

### REQ-K7.05 Doktrinen an die Obergrenze anpassen

Die Grenzen der Doktrinen Zunftordnung (höchstens 4 Fabriken) und Grenzfeste (höchstens 5) werden durch K7.04 teilweise wirkungslos. Neue Einschränkungen (Startwerte, Claude Code kann begründet abweichen):

| Doktrin | Bisherige Einschränkung | Neue Einschränkung |
|---|---|---|
| Zunftordnung | höchstens 4 Fabriken und Zunfthäuser | Obergrenze für Fabriken −1 |
| Grenzfeste | höchstens 5 Fabriken | Abstand der eigenen Wellen +25 % |

Die Regel aus Teil 6 gilt weiter: Eine Einschränkung greift sofort, auch für den Bestand; der Sonderbau erst, wenn sie erfüllt ist.

**Akzeptanzkriterium:** Test je Doktrin **[Bot]**.

---

### REQ-K7.06 Weiterentwicklung Kontor → Handelshaus

**Ziel:** Die Wirtschaft erhält einen Weg zum Sieg. Ihr Materialüberschuss wird zu Angriffskraft.

**Muster (wie bisher):** Technologiekarte „Fernhandel“ (Wirtschaft) → Forschung in Universität oder Bibliothek → Kontor wird Handelshaus.

**Wirkung**

- Das Handelshaus bietet **Söldnerkompanien** an: Gegen Material rückt sofort eine Gruppe von Einheiten aus, die keine Versorgung belegt und die gegnerische Basis angreift.
- Startwerte: Kompanie aus 6 Läufern und 2 Werfern der aktuellen Schmiede-Stufe, Kosten 600 Material, Abklingzeit 60 s, Kosten steigen je Kauf um 15 %.
- Zinsen des Kontors bleiben erhalten.
- Ohne Kontor keine Forschung „Fernhandel“.

**Akzeptanzkriterien**

- Test: Kompanie rückt aus, belegt keine Versorgung, Kosten und Abklingzeit greifen **[Bot]**.
- Simulation, Wirtschafts-Bot, Normal: Median der Partiedauer sinkt gegenüber Teil 6 (17:11 min); Ergebnis berichten **[Bot]**.

---

### REQ-K7.07 Weiterentwicklung Schmiede → Gießerei

**Ziel:** Ein Weg zum Sieg, der allen Strategien offensteht.

**Muster:** Technologiekarte „Geschützguss“ (neutral) → Forschung in Universität oder Bibliothek → Schmiede wird Gießerei.

**Wirkung**

- Die Kaserne kann **Geschütze** ausbilden: langsam, wenig Lebenspunkte, große Reichweite, dreifacher Schaden an der gegnerischen Basis und an Türmen. Sie belegen Versorgung (Startwert 2 je Geschütz).
- Schmiede-Ausbauten und Varianten der Schmiede bleiben erhalten; Grundvarianten der Schmiede werden ersetzt (Regel aus Teil 6).
- Neue Einheit als Datensatz (Name, Werte, Farbton, Symbol), keine neue Grafik.

**Akzeptanzkriterien**

- Test: Geschütz erst nach Abschluss baubar; Schadensfaktor an der Basis greift **[Bot]**.
- Simulation, Normal: Spannweite der Dauer-Mediane der drei Kategorie-Bots höchstens 5 min (Teil 6: 9:11) **[Bot]**.
- Simulation, `?druck=hoch`: Patt-Quote berichten, Ziel höchstens 2 % (Teil 6: 2,3 %, Verteidigungs-Bot 12 %) **[Bot]**.

---

### REQ-K7.08 Bestehende Weiterentwicklungen früher

**Befund (Teil 6, Auffälligkeit 4):** Dampfkraft schließt im Median nach 14:31 min ab, Buchdruck nach 15:18 min. Bei Partien von etwa 15 min kommt der Nutzen zu spät, der Verlust der Varianten früher.

**Anforderungen**

- **Höchstens zwei Stufen je Gebäude und Partie.** Die Produktion bekommt eine neue erste Weiterentwicklung:
  - „Wasserrahmen“ (Wirtschaft): Manufaktur → Fabrik. Ertrag +30 % gegenüber der Manufaktur.
  - „Dampfkraft“ wird die zweite Stufe: Fabrik → Dampffabrik. Benötigt Wasserrahmen; seltene Karte, frühestens ab Wahl 8.
- **Früher anbieten, kürzer forschen:** Wasserrahmen und Buchdruck ab Wahl 3, Forschungsdauer so gewählt, dass der Abschluss im Median zwischen Minute 6 und 9 liegt (Wirtschafts-Bot, Normal). Gilt sinngemäß für Fernhandel und Geschützguss.
- Die Regel zum Ersatz der Grundvarianten bleibt; der Tooltip nennt die Zahl der ersetzten Varianten.

**Akzeptanzkriterien**

- Simulation, Wirtschafts-Bot, Normal: Abschluss von Wasserrahmen und Buchdruck im Median zwischen Minute 6 und 9 **[Bot]**.
- Bericht: Anteil der Partien mit Dampfkraft und Zeitpunkt **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester beschreibt eine Weiterentwicklung als Fortschritt **[Mensch]**.

---

### REQ-K7.09 Historisches Setting: Benennung

**Zeitspanne:** etwa 1350–1850 (Spätmittelalter bis frühe Industrialisierung). Belege in der Recherche, Abschnitt 4.

**Umbenennungen im Modus `karten`**

| Bisher | Neu | Anmerkung |
|---|---|---|
| Fabrik (Grundgebäude) | Manufaktur | Stufe I der Produktion |
| Variante Manufaktur | Hofmanufaktur | vermeidet die Doppelung |
| Variante Werkstatt | Zeugmanufaktur | |
| Variante Wachstube | Wachstube | bleibt |
| – (neu, K7.08) | Fabrik | nach Wasserrahmen |
| Dampfmühle | Dampffabrik | nach Dampfkraft |
| Universität nach Buchdruck („Druckerei“) | Akademie | |
| Kontor nach Fernhandel | Handelshaus | K7.06 |
| Schmiede nach Geschützguss | Gießerei | K7.07 |
| Haupthaus | Gutshof, Rathaus, Residenz | K7.03 |

**Weitere Anforderungen**

- Stufen der Mauer erhalten historische Namen in der Reihenfolge Palisade → Ringmauer → Bastionsmauer; Türme Wachturm → Wehrturm → Geschützturm. Claude Code ordnet die Namen den vorhandenen Ausbaustufen zu; die Zuordnung steht im Bericht. Nur Namen, keine Regeln.
- Wirkungszeilen und Tooltips verwenden die neuen Namen in beiden Sprachen. Englische Entsprechungen: Manufactory, Factory, Steam Factory, Academy, Trading House, Foundry, Manor, Town Hall, Residence, Palisade, Curtain Wall, Bastion Wall, Watchtower, Defence Tower, Gun Tower.
- Die Sprachregel des Tutorials gilt weiter für Tutorial-Texte und neue Kartentexte. Namen von Bauwerken (Bastion, Geschützturm) sind zulässig.
- Modus `standard` behält seine Namen (Golden-Test).

**Akzeptanzkriterien**

- Suchtest über `i18n/` im Modus `karten`: keine alten Namen aus der Tabelle in sichtbaren Texten **[Bot]**.
- Sprach-Audit grün **[Bot]**.

---

### REQ-K7.10 Zweites Exemplar von Kaserne und Universität (Soll)

**Begründung:** Auf Stufe I bleibt ein Platz frei (K7.04). Ohne Nutzen für ein zweites Exemplar bleibt er leer.

- Zweite Kaserne: +1 Läufer je Welle und eigene Quartiere-Stufen.
- Zweite Universität: ein weiterer Forschungsplatz.
- Schmiede und Kontor sind je Partie nur einmal baubar (Muster aus *Northgard*: ein Gebäude je Typ).

**Akzeptanzkriterium:** Test je Gebäude; Bericht, wie oft der freie Platz belegt wird und womit **[Bot]**.

---

### REQ-K7.11 Ausfall mit Schaden an der Basis (Soll)

**Befund (Teil 6):** Die Verteidigung hat keinen Abschluss. Weg (b) aus „Offen für den PO“: Gegenstöße der Doktrin Ausfall richten doppelten Schaden an der gegnerischen Basis an (wie früher „Ausbruch“).

**Akzeptanzkriterium:** Verteidigungs-Bot mit Ausfall, Normal: Median der Partiedauer berichten, Ziel unter 17 min **[Bot]**.

---

### REQ-K7.12 Bots, Messung, Bericht, Testbuild

**Bots**

- Die Kategorie-Bots wählen die Karten Stadtrecht und Hofhaltung, sobald sie erscheinen.
- Flügel nach fester Regel: Militär Zeughaus, Kanzlei; Wirtschaft Schatzkammer, Bibliothek; Verteidigung Bibliothek, Zeughaus.
- Neutrale Karten (Geschützguss) nehmen alle Bots, wenn keine Karte der eigenen Kategorie im Angebot ist.
- Der Wirtschafts-Bot kauft Söldnerkompanien, sobald Material über dem Doppelten des Preises liegt.

**Zielwerte im Überblick**

| Kennzahl | Zielwert | Prüfung |
|---|---|---|
| Spannweite Dauer-Mediane der Kategorie-Bots (Normal) | ≤ 5 min (Teil 6: 9:11) | [Bot] |
| Wahlen je Partie, Partiedauer (Normal, durchschnitt, Bot ohne Kategorie) | 12–16 Wahlen, 13–17 min | [Bot] |
| Siegquote Schwer, durchschnitt | 70–90 % | [Bot] |
| Patt-Quote mit `?druck=hoch` | ≤ 2 % (berichten, Belagerung unverändert) | [Bot] |
| Fabrikplätze bei Minute 10 | nie über der Grenze; Verteilung berichten | [Bot] |
| Stadtrecht abgeschlossen | Median ≤ Wahl 5 | [Bot] |
| Wasserrahmen, Buchdruck abgeschlossen | Median Minute 6–9 | [Bot] |
| Sichtbare Bedienelemente Minute 10 | höchstens 5 mehr als nach Teil 6 (54 / 53) | [Bot] |
| Partie ohne Universität, Schmiede oder Kontor | ≥ Hälfte der Tester | [Mensch] |
| Weiterentwicklung als Fortschritt | ≥ Hälfte der Tester | [Mensch] |
| Bauen als Entscheidung erlebt | ≥ Hälfte der Tester | [Mensch] |

**Bericht:** `docs/bericht-kartenpfad-7.md` mit Ergebnis je REQ, Basismessung, Belegung der Plätze vorher und nachher, Namenszuordnung (K7.09), Auslegungen zur Bestätigung.

**Testbuild und Testleitfaden:** privater Testbuild; `docs/testleitfaden-kartenpfad-7.md` mit den [Mensch]-Kriterien als Fragen, dazu: „Welchen Flügel hast du gewählt, und welches Gebäude hast du dafür nicht gebaut?“ Protokoll zusätzlich: Haupthaus-Stufe mit Zeitpunkt, Flügel, Fabrikplätze je Minute, Söldnerkompanien und Geschütze.

**Spielstand-Version:** 12; ältere Stände werden verworfen. Modus `standard` identisch zu `main` (Golden-Test).

## 3. Entscheidungen des PO

| Thema | Entscheidung |
|---|---|
| Haupthaus | Im Mittelfeld, mit Flügeln; Bibliothek mit eigenem Forschungsplatz, Zeughaus mit Schmiede-Ausbau |
| Fabriken | Feste Obergrenze nach Stufe des Haupthauses |
| Neue Weiterentwicklungen | Kontor → Handelshaus, Schmiede → Gießerei |
| Setting | Etwa 1350–1850; höchstens zwei Stufen je Gebäude und Partie; erste Stufe früher |
| Grundsatz | Zentrale Entwicklungen werden über Karten bestimmt (Haupthaus-Stufen, Weiterentwicklungen) |

## 4. Inkrementplan

| Inkrement | Inhalt | REQ |
|---|---|---|
| R.0 | Basismessung | K7.01 |
| R.1 | Haupthaus Stufe I, Obergrenze für Fabriken, Doktrinen angepasst | K7.02, K7.04, K7.05 |
| R.2 | Karten Stadtrecht und Hofhaltung, Flügel | K7.03 |
| R.3 | Handelshaus mit Söldnerkompanien, Gießerei mit Geschützen | K7.06, K7.07 |
| R.4 | Wasserrahmen, Dampfkraft als zweite Stufe, frühere Weiterentwicklungen | K7.08 |
| R.5 | Benennung | K7.09 |
| R.6 | Zweites Exemplar, Ausfall mit Basisschaden | K7.10, K7.11 |
| R.7 | Bots, Simulation, Bericht, Testbuild, Testleitfaden | K7.12 |

Commits `R.<n>: <Inhalt>`. Jedes Inkrement ist spielbar.

**Kartenpool:** Mit Stadtrecht, Hofhaltung, Wasserrahmen, Fernhandel und Geschützguss wächst der Pool um fünf Karten. Die Obergrenze steigt von 38 auf 42 Karten ohne Doktrinen; liegt der Pool darüber, schlägt Claude Code Streichungen vor.

**Kalibrierung:** Nach R.3 und R.4 prüfen, ob Wahlen und Partiedauer im Rahmen bleiben; falls nicht, EP-Schwellen oder Lebenspunkte der gegnerischen Basis nachstellen und berichten.

**Abbruchregel:** Priorität bei knappem Budget: R.0 → R.1 → R.2 → R.3 → R.7 (mindestens Bericht und Testbuild) → R.4 → R.5 → R.6. Innerhalb von R.3 entfällt zuletzt die Gießerei, weil sie allen Kategorien einen Abschluss gibt.

## 5. Schwache Annahmen und offene Punkte

| Annahme | Risiko | Standard |
|---|---|---|
| Obergrenze und Haupthaus machen Bauen zur Entscheidung | Spieler füllen die Grenze sofort und bauen danach wie bisher; die Entscheidung verlagert sich nur auf die Wahl des Flügels | Belegung der Plätze messen; Frage im Testleitfaden |
| Stadtrecht kommt zuverlässig | Ohne Stadtrecht bleibt die Grenze bei 3 Fabriken; die Partie fühlt sich gedrosselt an | Garantie spätestens Wahl 5 |
| Söldnerkompanien und Geschütze schließen die Lücke der Kategorien | Sie können zur neuen Standardlösung aller Strategien werden; die Kategorien gleichen sich an | Spannweite der Bots und Wahlraten messen; Kosten steigen je Kauf |
| Ein freier Platz auf Stufe I | Ohne K7.10 bleibt er leer | K7.10 als Soll; Belegung berichten |
| Haupthaus ohne Nachbarschaftsboni | Bauordnung und Gilde verlieren Wert; Wirtschaftskarten werden schwächer | Werte am Partieende vorher und nachher berichten |
| Früher abgeschlossene Weiterentwicklungen | Varianten werden seltener gebaut, weil sie früh ersetzt werden | Zahl der ersetzten Varianten berichten |
| Historische Namen | Begriffe wie Manufaktur und Fabrik verlieren Klarheit für Spieler ohne Vorwissen | Wirkungszeile erklärt die Funktion; Spieltest |
| Einheiten mit historischen Namen | Offen | Frage an den PO für die nächste Runde (etwa Pikenier, Musketier) |
| Bots als Maß | Normal trennt die Siegquote nicht; Kategorie-Bots folgen stur ihrer Kategorie | Ersatzmaße; Urteil im Spieltest |
| Namen der neuen Karten (Stadtrecht, Hofhaltung, Wasserrahmen, Fernhandel, Geschützguss) | Platzhalter | Übernehmen, PO kann ändern |

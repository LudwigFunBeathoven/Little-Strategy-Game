# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 5: Grundausstattung, Doktrinen und Pacing aus dem Spielfluss
 
Stand: 14.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-5.md` · Branch: `exp/kartenpfad`
Bezug: `docs/entwicklungsstand-planung-kartenpfad-4.md` (Stand 11.10.2026), `docs/bericht-kartenpfad-4.md`, `docs/anforderungen-kartenpfad-4.md`
 
## 1. Ziel und Umfang
 
**Befund (PO):** Zwischen den Strategien sind kaum Unterschiede spürbar. Viele Karten fühlen sich schwach an; stark wirken nur Freischaltungen wie Eisenwaffen oder Echtes Militär. In einer Partie gab es nur neun Kartenwahlen. Der Hörsaal kostet viel und bringt wenig. Die Gebäude-Aufwertung ist eine gute Idee, aber zu lose mit den Karten verbunden.
 
**Diagnose aus Teil 4:**
 
- Fast alle Boni sind +10 % oder +20 %. Gewirkt hat nur, was eine Regel ändert (Gegenstoß, einzige Schlüsselkarte mit messbarer Wirkung, +8 pp).
- Keine Karte schließt etwas aus; ohne Verzicht entsteht keine Strategie.
- Linien entstehen nebenbei aus 13–15 Zeichenquellen je Linie, meist Bonuskarten. Der Bot ohne Linienwahl landet von selbst im Militär (Befund F).
- Die Manufaktur (+40 %) ist den anderen Fabrik-Varianten weit überlegen; bei Minute 10 stehen im Median 5,5 Fabriken (Befund B).
- Wirtschaft erzeugt Material ohne Abnehmer (Befund E); Verteidigung gewinnt, braucht aber 22–24 min und hängt in 2–7 % der Partien fest (Befund C).
- Schwer hängt an Werfer und Versorgung aus „Echtes Militär“ (Befund A: 29 von 29 Siegen mit der Karte in Wahl 1).
**Leitsatz (PO):** Die Grundlagen jeder Strategie sind ohne Karte verfügbar. Karten öffnen eine Strategie. Der Spieler passt sich den Karten an, die er früh zieht.
 
**Ziel:** Sechs Hebel:
 
1. Grundausstattung ab Start; Bau-Karten entfallen; Versorgung bleibt ein Invest.
2. Kartenwahlen entstehen aus dem Spielfluss (Stärke von Gegner und Spieler); der Zeitautomatismus entfällt.
3. Universität mit Forschungsbudget als steuerbare EP-Quelle.
4. Doktrinen: starke Karten mit Sonderbau und bindender Einschränkung.
5. Linien mit wenigen, gewichtigen Zeichenquellen; Stufen als Regeländerungen, Stufe 3 als eigener Weg zum Sieg.
6. Kleinerer, stärkerer Kartenpool.
**Nicht im Umfang:**
 
- Druckkurve der Gegner und Belagerung (Testschalter `?druck=hoch` bleibt).
- Raster (bleibt 3×3), neue Grafik, neue Einheitenverhalten.
- Leistungsoptimierung.
- Änderungen an `main` und am Modus `standard`.
- Spieltest mit Menschen (folgt nach Teil 5; Kriterien in REQ-K5.10).
## 2. Anforderungen
 
| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| K5.01 | Basismessung | Muss | N.0 |
| K5.02 | Grundausstattung ab Start, Bau-Karten entfallen | Muss | N.1 |
| K5.03 | Pacing aus dem Spielfluss | Muss | N.2 |
| K5.04 | Karten und Upgrades mit Zeitbezug | Muss | N.2 |
| K5.05 | Forschungsbudget der Universität | Muss | N.3 |
| K5.06 | Kartenpool: kleiner und spürbar | Muss | N.4 |
| K5.07 | Doktrinen und Sonderbauten | Muss | N.5 |
| K5.08 | Linien: Zeichen und Stufen neu | Muss | N.6 |
| K5.09 | Grundvarianten angleichen | Muss | N.6 |
| K5.10 | Bots, Messung, Bericht, Testbuild | Muss | N.7 |
 
In den Akzeptanzkriterien steht je Kriterium, ob es **[Bot]** (Simulation, Test) oder **[Mensch]** (Spieltest) geprüft wird.
 
---
 
### REQ-K5.01 Basismessung
 
Vor allen Änderungen, mit dem Stand nach Teil 4 (50 Partien je Feld, schneller Bot):
 
- **Hörsaal:** EP je Minute, Kosten, Zeitpunkt des Kaufs, Anteil der Partien mit Hörsaal.
- **Fahrplan aus:** Mit `zielzeitIstFrist: false` und ohne Höchstabstand: Zahl der Wahlen je Partie, längste Lücke zwischen zwei Wahlen, EP je Minute in den Abschnitten 0–4, 4–8, 8–12, 12+ min. Diese Messung zeigt, wie groß die EP-Lücke in der Mitte ohne Zeitautomatismus ist (Befund 4.1).
- **EP-Quellen heute:** Anteil von Abschüssen durch Einheiten, Türme und Hörsaal am EP-Ertrag.
- Fabrikanteil bei Minute 5 und 10; Siegquote und Dauer der drei Linien-Bots mit `?druck=hoch`.
**Akzeptanzkriterium:** Tabelle im Bericht **[Bot]**.
 
---
 
### REQ-K5.02 Grundausstattung ab Start, Bau-Karten entfallen
 
**Anforderungen**
 
- Im Modus `karten` sind ab Start baubar bzw. verfügbar: Fabrik, Kaserne, Mauer und ihre Ausbaustufen, Türme und ihre Ausbaustufen, Schmiede, Universität, Kontor, Läufer, Werfer.
- **Bau-Karten entfallen:** Gelehrte, Metallverarbeitung, Festungsbau, Handel. „Echtes Militär“ entfällt ebenfalls.
- **Versorgung bleibt ein Invest (Entscheidung PO):** Die bisherigen +2 Versorgung aus „Echtes Militär“ gibt es nicht kostenlos. Versorgung steigt nur über Käufe, mindestens über einen Kaserne-Ausbau „Quartiere“ (+2 Versorgung je Stufe, Kosten in `config.js`). Weitere Quellen nur über Doktrinen (K5.07).
- **Technologiekarten bleiben** (Fortgeschrittene Taktiken, Ballistik, Eiserne Klingen, Befestigungskunde). Sie schalten Einheiten und Forschungen frei und erscheinen, sobald eine Universität steht. Inhalte, die bisher Befestigungskunde öffnete und die nun zur Grundausstattung gehören, werden ersetzt; Claude Code schlägt den Ersatz vor.
- Der Hinweis „Kein Platz frei“ (E7) entfällt, weil kein Gebäude mehr durch eine Karte blockiert sein kann.
- Tutorial, Abschiedstext A1 und Erstkontakt-Hinweise des Modus `karten` werden an die Grundausstattung angepasst.
**Akzeptanzkriterien**
 
- Test: Alle genannten Gebäude und Einheiten sind ab Start baubar bzw. kaufbar; keine Bau-Karte ist im Pool **[Bot]**.
- Test: Versorgung steigt nur durch Kauf oder Doktrin **[Bot]**.
- Simulation Schwer, „durchschnitt“: Siegquote 70–90 % (Teil 4: 74 %, stark abhängig von Wahl 1) **[Bot]**.
- Bericht: Siegquote Schwer je Profil vorher und nachher **[Bot]**.
---
 
### REQ-K5.03 Pacing aus dem Spielfluss
 
**Grundsatz (Entscheidung PO):** Kartenwahlen ergeben sich aus der Stärke der Gegner und der Stärke des Spielers. Es gibt keinen Automatismus auf Basis der abgelaufenen Zeit.
 
**Entfällt**
 
- Fahrplan mit Zielzeiten (`KARTEN.fahrplan`, `zielzeitIstFrist`),
- Höchstabstand (`maxAbstand`, bisher 100 s),
- Füllung des Kartensymbols nach Zeit („Karte in 0:42“); das Symbol zeigt nur noch EP bis zur nächsten Wahl.
**Bleibt**
 
- EP-Schwellen je Wahl (neu kalibriert, siehe unten).
- Mindestabstand von 45 s als Bremse gegen Kartenflut. Er löst keine Wahl aus, er verzögert nur.
**EP-Quellen aus dem Spielfluss**
 
Befund 4.1 zeigt: Ohne neue Quellen bringt die Mitte der Partie kaum EP, weil die Belagerung der gegnerischen Basis die regulären Wellen aufhält. Deshalb erhalten Ereignisse des Spielflusses EP:
 
| Quelle | Hängt ab von | Startwert |
|---|---|---|
| Abschüsse durch Einheiten und Türme | Gegner und Spieler | wie bisher |
| Schaden an der gegnerischen Basis | Spieler | x EP je 1 % Basis-Lebenspunkte |
| Vollständig abgewehrte Gegnerwelle | Gegner und Spieler | y EP je Welle, steigt mit der Wellengröße |
| Forschungsbudget der Universität | Investition des Spielers | siehe K5.05 |
 
Werte in `config.js`; Claude Code wählt sie per Simulation.
 
**Schwellen und Kalibrierung**
 
- Die Schwellen bilden eine Kurve in `config.js`; ein fester Wachstumsfaktor ist zulässig, wenn er die Ziele trifft.
- **Kalibrierziel (Normal, „durchschnitt“):** 12–16 Wahlen je Partie bei einer Partiedauer von etwa 15 min.
- Schwellen sind für alle Grade gleich. Mehr Gegner auf Schwer bringen mehr EP; das ist im Sinn des Grundsatzes. Ein Faktor je Grad bleibt als Stellschraube in `config.js`, Standard 1,0.
- Die Partiedauer wird über die Lebenspunkte der gegnerischen Basis eingestellt (wie in Teil 3).
**Akzeptanzkriterien**
 
- Test: Ohne EP-Zuwachs wird keine Wahl fällig, unabhängig von der Spielzeit **[Bot]**.
- Normal, „durchschnitt“: Median 12–16 Wahlen je Partie; Median der Partiedauer 13–17 min **[Bot]**.
- Längste Lücke zwischen zwei Wahlen: Median ≤ 120 s, 90. Perzentil ≤ 180 s (Messgröße, kein Mechanismus) **[Bot]**.
- Bericht: Wahlen je Partie für „aktiv“, „durchschnitt“, „gelegentlich“ auf allen Graden; Anteil jeder EP-Quelle **[Bot]**.
- Spieltest: Kein Tester berichtet eine Phase, in der „lange nichts passiert“ **[Mensch]**.
---
 
### REQ-K5.04 Karten und Upgrades mit Zeitbezug
 
**Anforderungen**
 
- Claude Code inventarisiert alle Karten, Forschungen und Ausbauten, deren Wirkung sich auf den Zeitautomatismus der Kartenwahl bezieht oder nur unter ihm Sinn ergab. Jede wird entfernt oder auf EP umgeschrieben. Liste mit Maßnahme im Bericht.
- Mit K5.03 zählen EP wieder für den Takt. Daraus folgt:
  - „Kriegserfahrung“ kehrt in den Pool zurück, umbenannt nach der Sprachregel (Vorschlag: „Lehrjahre“), mit Wirkung auf alle EP-Quellen.
  - „Glücksritter“ erhält wieder einen EP-Nachteil (Stufen kosten +15 % EP); der Nachteil aus Teil 4 (Wellenabstand +25 %) entfällt.
**Akzeptanzkriterien**
 
- Suchtest über `data/` und `config.js`: Keine Wirkung bezieht sich auf Zielzeit, Fahrplan oder Höchstabstand **[Bot]**.
- Inventar im Bericht **[Bot]**.
---
 
### REQ-K5.05 Forschungsbudget der Universität
 
**Befund (PO):** Der Hörsaal kostet viele Ressourcen und fühlt sich schwach an.
 
**Anforderungen**
 
- Der Hörsaal entfällt im Modus `karten`.
- Die Universität erhält ein **Forschungsbudget:** Der Spieler stellt ein, welcher Anteil des laufenden Materialertrags in EP umgewandelt wird: 0, 25 oder 50 % (Stufen in `config.js`).
- Der Kurs sinkt mit dem Anteil (abnehmender Ertrag), damit reines Forschen nicht die beste Strategie wird. Startwert: 25 % zum Kurs k, 50 % zum Kurs 0,7 k.
- Die Einstellung lässt sich jederzeit ändern; sie steht im Reiter „Universität“ und als kleine Anzeige in der Ressourcenleiste, sobald sie über 0 % steht.
- Das Budget löst Befund E: Überschüssiges Material hat einen Abnehmer.
**Akzeptanzkriterien**
 
- Test: Material wird im eingestellten Anteil abgezogen und zum Kurs in EP gutgeschrieben **[Bot]**.
- Simulation: Ein Bot mit 50 % Budget erhält im Median mindestens drei Wahlen mehr als derselbe Bot mit 0 %; seine Siegquote liegt höchstens 15 pp über der des Bots mit 0 % **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester verändert das Budget mindestens einmal **[Mensch]**.
---
 
### REQ-K5.06 Kartenpool: kleiner und spürbar
 
**Spürbarkeitsgrenze:** Eine Karte bleibt im Pool, wenn sie eine Regel ändert oder mindestens eine Größe um 20 % verschiebt. Karten darunter werden zusammengelegt, verstärkt oder gestrichen.
 
**Anforderungen**
 
- Inventar aller Bonus-, Technologie- und Wagnis-Karten des Modus `karten` mit Maßnahme (bleibt, verstärkt, zusammengelegt, gestrichen). Ziel: 25–30 Karten im Pool, ohne Doktrinen.
- **Stufen mit neuem Effekt:** Wird eine Karte zum zweiten oder dritten Mal gewählt, bringt sie einen zusätzlichen Effekt. Für mindestens die Hälfte der verbleibenden Karten mit Stufen ist Stufe 2 oder 3 eine Regeländerung.
- Bonuskarten tragen keine Linienzeichen mehr (siehe K5.08).
- Angebotsbedingung aus Teil 3 bleibt: Eine Karte erscheint nur, wenn ihre Wirkung im Spielstand größer als null ist.
**Akzeptanzkriterien**
 
- Inventar im Bericht; Zahl der Karten im Pool 25–30 **[Bot]**.
- Test: Jede Karte erfüllt die Spürbarkeitsgrenze (Datenprüfung) **[Bot]**.
- Wahlrate je Karte 5–60 % (Bots messen sich selbst mit; nur Hinweis) **[Bot]**.
- Spieltest: Mindestens zwei Drittel der Tester nennen eine Karte, die ihre Partie verändert hat **[Mensch]**.
---
 
### REQ-K5.07 Doktrinen und Sonderbauten
 
**Grundidee:** Eine Doktrin hat drei Teile:
 
- einen starken Effekt (Regeländerung oder mindestens +30 %),
- einen Sonderbau oder eine Fähigkeit, die nur sie freischaltet,
- eine bindende Einschränkung, die einen anderen Weg verengt.
Doktrinen ersetzen die sechs Schlüsselkarten aus Teil 4.
 
**Doktrinen des Prototyps** (Namen Platzhalter, Werte Startwerte)
 
| Linie | Doktrin | Sonderbau / Fähigkeit | Effekt | Einschränkung |
|---|---|---|---|---|
| Wirtschaft | Zunftordnung | Fabrik → Zunfthaus | Nachbarschaftsbonus der Zunfthäuser ×3 | höchstens 4 Fabriken und Zunfthäuser zusammen |
| Wirtschaft | Stiftung | Universität → Stiftungshaus | Kurs des Forschungsbudgets ×2 | Einheiten +20 % Kosten |
| Militär | Stehendes Heer | Kaserne → Heerlager | Versorgung +6 (über die Aufwertung, also ein Invest) | jede Einheit kostet Unterhalt in Material je Minute |
| Militär | Vorstoß | – | Eigene Wellen rücken doppelt so oft aus | Türme feuern 30 % langsamer |
| Verteidigung | Bollwerk | Bastion: Turm als Gebäude im Raster, feuert über die Mauer | Bastionen +50 % Schaden gegenüber Türmen; Abschüsse bringen doppelte EP | Fabriken −15 % Ertrag |
| Verteidigung | Ausfall | – | Nach jeder abgewehrten Welle rückt ein Gegenstoß aus (ohne Linienstufe); Gegenstöße +100 % Stärke | Reparatur der Mauer kostet das Doppelte |
 
**Regeln**
 
- Höchstens zwei Doktrinen je Partie (Wert in `config.js`). Nach der zweiten erscheinen keine weiteren.
- Doktrinen erscheinen ab Wahl 3. Angebotsausgleich wie in Teil 4: spätestens jede dritte Wahl eine Doktrin; wer eine Linie führt, bekommt deren Doktrin mit erhöhtem Gewicht.
- Jede Doktrin trägt drei Zeichen ihrer Linie.
- Sonderbauten entstehen über die vorhandene Gebäude-Aufwertung und gibt es nur mit der Doktrin. Wird eine Einschränkung verletzt (z. B. fünfte Fabrik), ist die Aktion gesperrt, mit Erklärzeile.
- Die Detailzeile der Karte nennt Effekt und Einschränkung.
**Akzeptanzkriterien**
 
- Test je Doktrin: Effekt, Sonderbau und Einschränkung greifen **[Bot]**.
- Test: Eine dritte Doktrin wird nie angeboten **[Bot]**.
- Paarvergleich mit 100 Partien (Normal, Linien-Bot der Doktrin, mit `?druck=hoch` für Verteidigung): jede Doktrin +5 bis +25 pp Siegquote **[Bot]**.
- Simulation: Angebote mit Doktrin je Partie im Median ≥ 3 **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester gibt an, ihre Spielweise an eine Doktrin angepasst zu haben **[Mensch]**.
---
 
### REQ-K5.08 Linien: Zeichen und Stufen neu
 
**Zeichenquellen**
 
- Doktrin: drei Zeichen.
- Gebäude-Variante (Grundvariante oder Sonderbau): ein Zeichen.
- Bonus-, Technologie- und Wagnis-Karten: kein Zeichen.
- Stufen bleiben bei 2, 4 und 6 Zeichen. **Stufe 3 setzt mindestens eine Doktrin der Linie voraus.** Ohne diese Regel wäre Stufe 3 allein über Varianten erreichbar.
**Stufen als Regeländerungen** (ersetzen die Boni aus Teil 4; Werte Startwerte)
 
| Linie | Stufe 1 | Stufe 2 | Stufe 3: Weg zum Sieg |
|---|---|---|---|
| Militär | Kaserne schickt je Welle einen Läufer mehr | Neue Einheiten starten mit der ersten Schmiede-Stufe | **Durchbruch:** Einheiten richten an der gegnerischen Basis doppelten Schaden an |
| Wirtschaft | Nachbarschaftsboni wirken auch diagonal | Material über dem Lagerdeckel wird zu EP | **Söldner:** Material lässt sich direkt in Einheiten umwandeln, die keine Versorgung belegen |
| Verteidigung | Abschüsse durch Türme bringen Material | Nach jeder abgewehrten Welle rückt sofort eine eigene Welle aus (Gegenstoß) | **Ausbruch:** Gegenstöße +50 % Stärke und doppelter Schaden an der gegnerischen Basis |
 
- Sichtbarkeit wie in Teil 4: Linien und Zeichen erscheinen erst mit Stufe 1.
- Die bisherigen Prozent-Boni der Linien entfallen.
**Akzeptanzkriterien**
 
- Test: Zählung der Zeichen nach neuer Regel, Stufe 3 nur mit Doktrin **[Bot]**.
- Test je Stufe: Regel greift genau ab ihrer Schwelle und entfällt beim Unterschreiten **[Bot]**.
- Verteidigungs-Bot mit `?druck=hoch`: Median der Partiedauer ≤ 18 min, Patt-Quote ≤ 2 % (Teil 4: 22–24 min, 2–7 %) **[Bot]**.
- Bot ohne Linienwahl: Bericht, in welcher Linie er landet (Befund F) **[Bot]**.
- Spieltest: Mindestens die Hälfte der Tester bemerkt eine Linie **[Mensch]**.
---
 
### REQ-K5.09 Grundvarianten angleichen
 
**Befund B:** Die Manufaktur (+40 %) schlägt Werkstatt (−10 % Einheitenkosten) und Wachstube (+15 % Turmschaden) deutlich.
 
**Anforderungen**
 
- Grundvarianten ohne Doktrin bleiben verfügbar, werden aber im Wert angeglichen. Startwerte: Manufaktur +20 % Ertrag, Werkstatt −25 % Einheitenkosten, Wachstube +30 % Turmschaden und Material je Turm-Abschuss.
- Die Kaserne erhält eine Wirtschafts-Variante (Vorschlag: Zahlmeisterei, Ausbau „Quartiere“ −30 % Kosten), damit jedes Grundgebäude eine Variante je Linie hat. Schmiede: Wirtschafts-Variante optional.
- Sonderbauten (K5.07) sind deutlich stärker als Grundvarianten.
**Akzeptanzkriterien**
 
- Fabrikanteil bei Minute 10: Median ≤ 4 Fabriken ohne Variante und Zunfthaus (Teil 4: 5,5) **[Bot]**.
- Verteilung der Varianten je Linien-Bot im Bericht; keine Grundvariante in mehr als 60 % der Aufwertungen über alle Bots **[Bot]**.
---
 
### REQ-K5.10 Bots, Messung, Bericht, Testbuild
 
**Bots:** Die drei Linien-Bots wählen Doktrinen und Varianten ihrer Linie und stellen das Forschungsbudget nach einer festen Regel ein (Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %). Ein vierter Bot wählt ohne Linie.
 
**Simulation:** 50 Partien je Feld, alle Grade und Profile; Linien-Bots auf Normal ohne und mit `?druck=hoch`; Paarvergleich der Doktrinen mit 100 Partien.
 
**Zielwerte im Überblick**
 
| Kennzahl | Zielwert | Prüfung |
|---|---|---|
| Wahlen je Partie (Normal, durchschnitt) | Median 12–16 | [Bot] |
| Partiedauer (Normal, durchschnitt) | Median 13–17 min | [Bot] |
| Längste Lücke zwischen Wahlen | Median ≤ 120 s, P90 ≤ 180 s | [Bot] |
| Siegquote Schwer, durchschnitt | 70–90 % | [Bot] |
| Linien-Bots, Normal, `druck=hoch` | Siegquoten innerhalb 15 pp | [Bot] |
| Verteidigung, `druck=hoch` | Dauer Median ≤ 18 min, Patt ≤ 2 % | [Bot] |
| Doktrinen im Paarvergleich | je +5 bis +25 pp | [Bot] |
| Fabriken bei Minute 10 | Median ≤ 4 | [Bot] |
| Forschungsbudget 50 % gegen 0 % | ≥ 3 Wahlen mehr, ≤ +15 pp | [Bot] |
| Patt-Quote | ≤ 2 % | [Bot] |
| Strategie bewusst gewählt | ≥ Hälfte der Tester | [Mensch] |
| Karte, die die Partie verändert hat | ≥ zwei Drittel der Tester | [Mensch] |
| Phase, in der lange nichts passiert | kein Tester | [Mensch] |
 
**Bericht:** `docs/bericht-kartenpfad-5.md` mit Ergebnis je REQ, Basismessung, Inventaren (K5.04, K5.06), Kennzahlen vorher und nachher, Auslegungen zur Bestätigung.
 
**Testbuild und Testleitfaden:** privater Testbuild; `docs/testleitfaden-kartenpfad-5.md` mit den [Mensch]-Kriterien als Fragen, je Tester zwei Partien (Normal; eine davon mit `?druck=hoch`). Das Protokoll erfasst zusätzlich EP je Quelle, Einstellungen des Forschungsbudgets und gewählte Doktrinen.
 
**Spielstand-Version:** 10; ältere Stände werden verworfen. Modus `standard` bleibt identisch zu `main` (Golden-Test).
 
## 3. Entscheidungen des PO
 
| Thema | Entscheidung |
|---|---|
| Leitsatz | Grundlagen jeder Strategie ohne Karte; Karten öffnen Strategien |
| Grundausstattung | Alle Grundgebäude, Türme und Werfer ab Start; Bau-Karten entfallen |
| Versorgung | Bleibt ein Invest; keine kostenlose Versorgung ab Start |
| Pacing | Aus dem Spielfluss (Stärke von Gegner und Spieler); kein Zeitautomatismus; Karten und Upgrades mit Zeitbezug entfernen oder umschreiben |
| Doktrinen | Ersetzen die Schlüsselkarten; harte Einschränkungen; höchstens zwei je Partie |
| Zeichen | Nur Doktrinen und Varianten; Bonuskarten ohne Zeichen |
| Linienstufen | Regeländerungen; Stufe 3 als eigener Weg zum Sieg |
| Universität | Forschungsbudget ersetzt den Hörsaal |
| Kartenpool | Kleiner und stärker (25–30 Karten), Stufen mit neuem Effekt |
| Partie | Etwa 15 Minuten, 12–16 Kartenwahlen (Kalibrierziel, kein Mechanismus) |
 
## 4. Inkrementplan
 
| Inkrement | Inhalt | REQ |
|---|---|---|
| N.0 | Basismessung | K5.01 |
| N.1 | Grundausstattung, Bau-Karten und Echtes Militär entfernen, Ausbau „Quartiere“ | K5.02 |
| N.2 | Zeitautomatismus entfernen, neue EP-Quellen, Schwellen kalibrieren, Karten mit Zeitbezug | K5.03, K5.04 |
| N.3 | Forschungsbudget | K5.05 |
| N.4 | Kartenpool bereinigen, Stufen mit neuem Effekt | K5.06 |
| N.5 | Doktrinen und Sonderbauten | K5.07 |
| N.6 | Linien neu, Grundvarianten angleichen | K5.08, K5.09 |
| N.7 | Bots, Simulation, Bericht, Testbuild, Testleitfaden | K5.10 |
 
Commits `N.<n>: <Inhalt>`. Jedes Inkrement ist spielbar.
 
**Reihenfolge:** N.2 und N.3 hängen zusammen; die Schwellen werden nach N.3 und nach N.5 erneut kalibriert, weil Budget und Doktrinen den EP-Ertrag verändern.
 
**Abbruchregel:** Priorität bei knappem Budget: N.0 → N.1 → N.2 → N.3 → N.5 → N.7 (mindestens Bericht und Testbuild) → N.6 → N.4. Ohne N.4 bleibt der alte Pool, die Doktrinen sind trotzdem testbar. Innerhalb von N.5 entfallen zuerst die Doktrinen ohne Sonderbau (Vorstoß, Ausfall).
 
## 5. Schwache Annahmen und offene Punkte
 
| Annahme | Risiko | Standard |
|---|---|---|
| Neue EP-Quellen schließen die Lücke in der Mitte | Die Belagerung bleibt unverändert; Schaden an der Basis kommt in Stößen. Die Mitte kann weiter arm an Wahlen sein | Basismessung N.0; Messgröße „längste Lücke“; Druckkurve als Folgeschritt |
| Pacing aus dem Spielfluss | Wer stark ist, bekommt mehr Karten und wird stärker (Schneeball); wer zurückliegt, bekommt weniger (Abwärtsspirale) | Abgewehrte Wellen bringen EP auch dem Verteidiger; Spreizung der Wahlen zwischen Profilen berichten |
| Schwer wird über mehr Gegner auch reicher an Karten | Schwer kann leichter wirken als gedacht | Faktor je Grad als Stellschraube, Standard 1,0 |
| Harte Einschränkungen der Doktrinen | Können sich wie Strafe anfühlen und Doktrinen unattraktiv machen | Paarvergleich +5 bis +25 pp; Spieltest |
| Bau-Karten entfallen | Das Gefühl „ich schalte etwas frei“ wird seltener | Technologiekarten und Sonderbauten tragen es; Spieltest |
| Forschungsbudget | Bei zu gutem Kurs wird reines Forschen dominant | Abnehmender Kurs; Grenze +15 pp |
| 12–16 Wahlen in 15 Minuten | Die Bühne kann ermüden | Animationsdauern in `config.js`; Spieltest |
| Bastion im Raster | Kann die Fabrik-Frage auf die Bastion verlagern | Fabrikanteil und Variantenverteilung messen |
| Bots als Maß | Bots folgen ihrer Linie stur und messen Kartenwahlen verzerrt | [Bot]-Kriterien nur für Machbarkeit; Urteil im Spieltest |
| Namen der Doktrinen, Sonderbauten und Stufen | Platzhalter | Übernehmen, PO kann ändern; Sprachregel gilt |

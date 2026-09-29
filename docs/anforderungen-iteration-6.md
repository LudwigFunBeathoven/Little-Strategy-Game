# Klammerfront – Anforderungen Iteration 6 (v0.7)
 
Stand: 29.09.2026 · Basis: Branch `main` (v0.6) · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-iteration-6.md`
 
## 0. Auftrag in Kürze
 
Iteration 6 ist eine Stabilisierungsiteration. Sie bringt kein neues System. Sie behebt:
 
- die Fehler im Kampfbild (pendelnde Formationen, Würfe im Gleichtakt),
- Bedienlücken (Kartenwahl, Kaserne),
- die Offline-Reste aus v0.1.
Außerdem macht sie Universität und Wirtschaft zu echten Entscheidungsfeldern, mit vorhandenen Gebäuden. Das Balancing bekommt eine zweite Referenz, den Bot „Einheiten zuerst“. Eine globale Neukalibrierung folgt erst in Iteration 7 mit Daten aus Spieltests mit Menschen.
 
**Begründung:**
 
- Das Balancing von v0.6 ist gegen einen zu schwachen Simulations-Bot eingestellt (Briefing §5.1).
- Die Fehler treffen den Teil des Spiels, der Testern am meisten Spaß macht: den Aufmarsch der Armee.
- Nach dem Vollausbau fehlen wirtschaftliche Entscheidungen.
## 1. Arbeitsgrundlagen
 
- **Vor Beginn lesen:** `CLAUDE.md`, `docs/STAND.md`, `docs/bericht-iteration-5.md`, `docs/anforderungen-iteration-5.md`, dieses Dokument.
- **Branch:** `iteration-6` von `main`. Commits `I6.0`–`I6.9`, linear, jedes Inkrement spielbar.
- **Invarianten aus Iteration 5 gelten unverändert:**
  - `core.js` ohne DOM,
  - Zufall nur über `S.rng`,
  - Zahlen nur in `config.js` bzw. `data/`, Texte nur in `i18n/`,
  - Spielstand als azyklisches JSON,
  - Tooltip und Erklärzeile an jedem Bedienelement.
- **Spielstand:** `SAVE_VERSION` wird 7; alte Stände werden mit Hinweis verworfen.
- **Auslegungen** dokumentiert Claude Code in `docs/STAND.md`. Abweichungen und Balancing-Auffälligkeiten werden berichtet und nicht still wegbalanciert.
- **Fehler zuerst belegen:** Für jeden Fehler (REQ-6.01, 6.02) zuerst einen Test schreiben, der ihn rot zeigt. Die Ursache in `docs/STAND.md` festhalten, dann beheben.
- **Balancing-Zahlen nicht raten:** Dieses Dokument legt Ziele und Prüfverfahren fest. Konkrete Werte ermittelt Claude Code per Simulation, mit mindestens 50 Partien je Feld für Entscheidungen und 200 für die Abnahme.
## 2. Bestätigte PO-Entscheidungen
 
| Thema | Entscheidung |
|---|---|
| Experiment „Schwung“ | Verworfen; Code und Konfiguration entfernen. |
| Leistungsziel | ≤ 1 ms je Spielschritt mit 120 Einheiten (ersetzt „+20 % gegenüber Vorversion“). |
| Karte „Weitschuss“ | +20 % Fernkampfschaden (Auslegung aus Iteration 5 bestätigt). |
| Forschung nach Abriss der Universität | Wirkt weiter (bestätigt). |
| Durchlauftest | Echte Werte im Schnelldurchlauf (bestätigt). |
| Handelskontor | Bleibt und wird umgebaut (REQ-6.07). |
| Sitzungslänge | Das Spiel ist ein reines Online-Spiel mit höchstens etwa 20 Minuten je Partie. |
 
## 3. Anforderungen
 
| REQ | Titel | PO-Befund | Priorität | Inkrement |
|---|---|---|---|---|
| 6.01 | Formationen ohne Pendeln | 6 | Muss | I6.1 |
| 6.02 | Einzelne, sichtbar versetzte Angriffe | 7 | Muss | I6.2 |
| 6.03 | Offline-Reste entfernen, Pause bei verdecktem Tab | 1 | Muss | I6.3 |
| 6.04 | Kartenwahl öffnet sich automatisch | 4 | Muss | I6.4 |
| 6.05 | Kaserne im Reiter „Armee“, Heimat-Reiter je Gebäude | 5 | Muss | I6.4 |
| 6.06 | Universität stärken | 3 | Muss | I6.6 |
| 6.07 | Wirtschaft: Entscheidungen nach dem Vollausbau | 2 | Soll | I6.7, I6.8 |
| 6.08 | Schwer: kein Verlust vor Minute 4 | Briefing §6.4 | Muss | I6.5 |
| 6.09 | Referenz-Bot „Einheiten zuerst“ | Briefing §6.1, §6.3 | Muss | I6.0 |
| 6.10 | Aufräumen | Briefing §6.2, §6.6 | Muss | I6.5 |
| 6.11 | Abnahme, Bericht, Testbuild | – | Muss | I6.9 |
 
---
 
### REQ-6.01 Formationen ohne Pendeln
 
**Befund (PO):** Einheiten springen in Millisekunden hin und her. Der Screenshot zeigt drei Einheiten genau auf der Frontlinie; naheliegend ist ein Pendeln um diese Linie.
 
**Zu prüfende Ursachen**, nach geschätzter Wahrscheinlichkeit:
 
1. *Zustandspendeln:* Die Armee wechselt in aufeinanderfolgenden Takten zwischen Kampf und Sammeln oder zwischen Sammeln und Marsch, weil die Hysterese fehlt oder zu klein ist. Hinweis: Die Armee steht 63 % der Zeit im Kampf.
2. *Instabile Platzvergabe:* Formationsplätze werden in jedem Takt neu sortiert; bei Gleichstand tauschen zwei Einheiten ihre Plätze.
3. *Lane-Wahl ohne Bindung:* Eine unterstützende Einheit wählt ihre Ziel-Lane in jedem Takt neu; bei Gleichstand wechselt sie hin und her (vergleichbar mit dem Fehler aus I4.3).
4. *Konkurrierende Ziele:* Formationsplatz, Aufschluss zur Front und Sammelposition ziehen eine Einheit in verschiedene Richtungen.
5. *Nur Darstellung:* Die Interpolation zwischen zwei Takten zeichnet falsch.
**Anforderungen**
 
- **Diagnose:** Ein Debug-Protokoll je Einheit (Zustand, Lane, Platz, Bewegungsrichtung je Takt), einschaltbar mit `?debug=1`.
- **Mindestverweildauer** je Armeezustand (Wert in `config.js`, Vorschlag 0,5 s); Kontakt-Hysterese prüfen und bei Bedarf vergrößern.
- **Feste Plätze:** Eine Einheit behält ihren Formationsplatz, bis sie fällt oder die Armee sammelt. Lücken füllen nur Einheiten von hinten.
- **Gebundene Lane-Wahl:** Eine unterstützende Einheit bleibt in ihrer Ziel-Lane, bis diese frei von Gegnern ist.
- **Totzone:** Liegt eine Einheit näher als ε an ihrem Ziel, bewegt sie sich nicht (ε in `config.js`).
**Kennzahl „Richtungswechsel“:** Anzahl der Vorzeichenwechsel der Bewegung je Einheit und Sekunde, ohne Wechsel durch Tod oder durch einen Zustandswechsel der Armee.
 
**Akzeptanzkriterien**
 
- Kurzsimulation mit 200 Partien: Keine Einheit wechselt die Richtung öfter als zweimal je Sekunde. Der Median liegt nahe null; der Wert wird berichtet.
- Szenariotests für jede der fünf Ursachen mit festem Seed.
- Playwright: Über 10 Sekunden im Kampf zeigt keine Einheit ein Hin-und-her-Muster (Positionsprüfung je Bild).
- Der Zeitanteil der Armee im Kampf wird vor und nach der Korrektur berichtet.
---
 
### REQ-6.02 Einzelne, sichtbar versetzte Angriffe
 
**Befund (PO):** Werfer werfen als Gruppe; es wirkt, als würden je Lane alle Nah- und alle Fernkämpfer als eine Einheit simuliert.
 
**Zuerst prüfen:** REQ-5.05 hat Einzelsimulation eingeführt. Wahrscheinlicher ist Gleichtakt: Alle Einheiten einer Welle entstehen im selben Takt mit derselben Angriffspause und greifen danach dauerhaft synchron an.
 
- Test: Angriffszeitpunkte der Werfer einer Welle erfassen.
- Stellt sich heraus, dass die Simulation tatsächlich gruppiert, ist das ein Fehler gegen REQ-5.05 und wird als solcher behoben.
**Anforderungen**
 
- **Versatz beim Entstehen:** Die erste Angriffspause jeder Einheit beginnt mit einem zufälligen Anteil ihrer Angriffspause (0–100 %, über `S.rng`).
- **Streuung je Angriff:** ± 10 % auf jede Angriffspause (Wert in `config.js`, über `S.rng`). Die mittlere Schadensrate bleibt unverändert.
- **Eigenes Geschoss je Wurf:** Jedes Geschoss fliegt sichtbar vom Werfer zu seinem Ziel.
- **Nahkampf:** Auch Nahkämpfer bekommen Versatz und Streuung.
- *Soll:* Fernkämpfer meiden ein Ziel, dessen erwarteter Schaden bereits für einen Abschuss reicht (Overkill-Vermeidung). Hinter einem Schalter in `config.js`; Auswirkung auf die Kennzahlen berichten.
**Akzeptanzkriterien**
 
- Zehn Werfer einer Welle greifen innerhalb von 2 Sekunden in mindestens fünf verschiedenen Takten an.
- Die Anzahl der Geschosse entspricht der Anzahl der Angriffe (Test).
- Gleicher Seed, gleiche Partie.
- Die Siegquoten der Abnahmeserie verschieben sich um höchstens 3 pp je Feld gegenüber I6.1; größere Verschiebungen werden berichtet.
---
 
### REQ-6.03 Offline-Reste entfernen, Pause bei verdecktem Tab
 
**Befund (PO):** Einige Karten bringen Offline-Boni. Klammerfront ist ein reines Online-Spiel mit Partien bis etwa 20 Minuten.
 
**Anforderungen**
 
- **Offline-Fortschritt entfernen:** Beim Laden eines Spielstands vergeht keine Spielzeit. Das Spiel startet pausiert.
- **Karten mit Offline-Bezug** identifizieren und im Bericht auflisten. Jede wird durch einen Online-Effekt derselben Kategorie und Seltenheit ersetzt. Gibt es keinen sinnvollen Ersatz, wird die Karte gestrichen. Die Liste legt Claude Code dem PO im Bericht zur Freigabe vor.
- **Pause bei verdecktem Tab:** Das Spiel pausiert automatisch, wenn der Tab verdeckt wird (`visibilitychange`), und zeigt beim Zurückkehren „Weiter“.
- **Texte:** Alle Texte, Tooltips und die Einführung werden von Offline-Bezügen bereinigt.
- **Neue Kennzahl „Partielänge“:** 90. Perzentil der Partiedauer je Feld ≤ 20 min, über alle Profile mit Sieg.
**Akzeptanzkriterien**
 
- Test: Spielstand speichern, Systemzeit um eine Stunde vorstellen, laden → Ressourcen unverändert.
- Suchtest: kein Offline-Bezug mehr in `core.js`, `data/` und `i18n/` (Archiv und `CHANGELOG.md` ausgenommen).
- Playwright: Tab verdecken → Spielzeit steht.
---
 
### REQ-6.04 Kartenwahl öffnet sich automatisch
 
**Anforderungen**
 
- Steht eine Kartenwahl an, öffnet sich der Reiter „Karten“ automatisch. Diese Anforderung ersetzt für diesen einen Fall die Regel aus REQ-5.03, nach der sich Reiter nie ohne Handlung des Spielers wechseln.
- **Eingabesperre:** Die Kartenknöpfe nehmen Klicks erst 400 ms nach dem Öffnen an (Wert in `config.js`) und blenden in dieser Zeit ein.
- **Keine gestörte Eingabe:** Ist beim Auslösen eine Maustaste gedrückt, öffnet sich der Reiter erst nach dem Loslassen.
- **Rückkehr:** Nach der Wahl kehrt der Arbeitsbereich zum vorherigen Reiter zurück, einschließlich der vorherigen Auswahl.
- Mehrere offene Kartenwahlen werden nacheinander angeboten.
- Das Verhalten beim Spieltempo (Pause oder keine Pause während der Wahl) bleibt wie in v0.6.
**Akzeptanzkriterien**
 
- Test: Kartenwahl entsteht → Reiter „Karten“ aktiv; ein Klick innerhalb der Sperrzeit wählt keine Karte; nach der Wahl ist der vorherige Reiter aktiv.
- Test: Eine Kartenwahl entsteht während eines gehaltenen Klicks auf dem Klickfeld → kein verlorener Klick, der Reiter öffnet danach.
---
 
### REQ-6.05 Kaserne im Reiter „Armee“, Heimat-Reiter je Gebäude
 
**Anforderungen**
 
- Der Reiter „Armee“ erhält einen Abschnitt „Kaserne“: Status (gebaut oder nicht, Stufe), Ausbauten mit Kosten und Wirkung.
- Ist keine Kaserne gebaut, führt ein Knopf „Kaserne bauen“ in den Reiter „Bauen“, mit Kaserne vorausgewählt.
- Ein Klick auf die Kaserne in der Spielwelt öffnet den Reiter „Armee“.
- **Heimat-Reiter:** Jeder Gebäudetyp ist genau einem Reiter zugeordnet. Die Zuordnung steht als Tabelle in `config.js` (Abschnitt UI) und wird im Bericht aufgeführt.
**Akzeptanzkriterien**
 
- Test: Jeder Gebäudetyp hat genau einen Heimat-Reiter; ein Klick in der Welt öffnet ihn.
- `tooltipAudit` und `explAudit` sind grün.
---
 
### REQ-6.06 Universität stärken
 
**Befund (PO):** Die Universität wirkt schwach. EP steigen langsam, Forschung dauert lange.
 
**Einordnung:** Iteration 5 hat den passiven EP-Ertrag bewusst gedeckelt (≤ 25 % des EP-Ertrags eines aktiven Spielers), um aktive Spieler zu belohnen. Der Hauptansatz dieser Anforderung sind deshalb kürzere Forschungszeiten und spürbarere Effekte. Mehr passive EP sind nur ein Nebenhebel.
 
**Anforderungen**
 
- **Tempo:** Forschungszeiten und -kosten so einstellen, dass
  - das Profil „durchschnitt“ auf Normal die erste Forschung vor Minute 3 abschließen kann und
  - bis Minute 10 mindestens fünf Forschungen abschließt.
- **Beschleunigen mit Material:** Eine laufende Forschung lässt sich gegen Material beschleunigen. Der Preis je gesparter Sekunde steigt mit der Stufe. Das ist zugleich eine Material-Senke für REQ-6.07.
- **Lehre:** Deckel für den passiven EP-Anteil auf 35 % anheben (PO-Standard, siehe Abschnitt 5). Der EP-Ertrag je Sekunde und die geschätzte Zeit bis zur nächsten Kartenwahl stehen in der Ressourcenleiste.
- **Spürbarkeit:** Abgeschlossene Forschungen erhalten eine sichtbare Rückmeldung (Hinweis und Markierung am Reiter). Die Wirkung steht im Tooltip als Vorher/Nachher-Wert.
- **Messverfahren gegen die Verzerrung aus v0.6:** Wirkung je Forschung per Paarvergleich messen. Gleicher Seed, gleiche Strategie; einmal wird die Forschung zu einem festen Zeitpunkt erzwungen, einmal gesperrt.
**Akzeptanzkriterien**
 
- Die Tempo-Ziele oben sind erreicht (Simulation, Profil „durchschnitt“, Normal).
- Im Paarvergleich bringt jede Forschung mindestens +3 pp und höchstens +25 pp Siegquote. Abweichungen werden berichtet.
- Anteil der passiven EP ≤ 35 % beim Profil „aktiv“ auf Normal.
---
 
### REQ-6.07 Wirtschaft: Entscheidungen nach dem Vollausbau (Soll)
 
**Befund (PO):** Sind alle Fabriken gebaut, gibt es keine interessanten wirtschaftlichen Entscheidungen mehr. Außerhalb der Universität fehlen gute Verwendungen für Material.
 
**Kennzahl „ungenutztes Material“:** Anteil des in der Spätphase produzierten Materials, der bis Partieende unverbraucht im Bestand bleibt. v0.6 messen und berichten; Ziel ≤ 20 % beim Profil „durchschnitt“ auf Normal.
 
**Maßnahmen**, in dieser Reihenfolge; jede ist ein eigenes, spielbares Inkrement:
 
**a) Nachbarschaftsboni im 3×3-Raster** (Vorbild *9 Kings*, *Islanders*) – I6.7
 
- Jeder Gebäudetyp erhält genau eine Nachbarschaftsregel für orthogonal angrenzende Felder. Die Regeln stehen deklarativ in `data/`.
- Vorschläge, zu prüfen und zu kalibrieren:
  - Fabrik neben Fabrik: Ertrag +x %.
  - Schmiede neben Kaserne: Einheitenkosten −x %.
  - Universität neben Fabrik: Forschungszeit −x %.
  - Handelskontor neben Fabrik: Zinsdeckel +x.
- **Vorschau:** Beim Bauen und bei ausgewähltem Bauplatz zeigt das Raster den Bonus, den ein Gebäude an dieser Stelle erhielte und gäbe.
- Abriss und Umbau werden damit zur Entscheidung. Die Teilrückerstattung beim Abriss bleibt wie in v0.6.
**b) Handelskontor mit gedeckelten Zinsen** (Vorbild *Teamfight Tactics*, *Balatro*) – I6.8
 
- In festem Takt zahlt das Handelskontor Zinsen auf den Materialbestand: je volle N Material ein fester Betrag, höchstens bis zu einem Deckel.
- Ausbaustufen des Kontors heben den Deckel.
- Die Ressourcenleiste zeigt den nächsten Zinsbetrag und den Deckel.
**c) Kaserne: „Welle vorziehen“** – I6.8
 
- Aktion im Reiter „Armee“: Die nächste eigene Welle rückt sofort aus.
- Kosten in Material, eigene Abklingzeit.
- Belohnt aktive Spieler und bindet Material.
**Akzeptanzkriterien**
 
- „Ungenutztes Material“ ≤ 20 % (Normal, durchschnitt) mit beiden Bots.
- Handelskontor in mindestens 20 % der Partien gebaut; Siegquoten-Effekt ≤ +25 pp.
- Keine Nachbarschaftsregel hebt die Siegquote um mehr als +25 pp.
- Abstand Leicht aktiv ↔ gelegentlich bleibt ≥ 4 min.
- Die Bots nutzen Nachbarschaft, Zinsen und „Welle vorziehen“; die gierige Heuristik bewertet sie per Vorausschau.
---
 
### REQ-6.08 Schwer: kein Verlust vor Minute 4
 
**Befund (Briefing §5.3):** Die Profile „gelegentlich“ und „passiv“ verlieren auf Schwer nach etwa 1:30, weil die Grundwelle das Tor vor jeder Verteidigung erreicht.
 
**Anforderungen**
 
- Die erste gegnerische Welle auf Schwer kommt später oder ist kleiner. Der Druck ab der Spielmitte bleibt unverändert.
- Die Stellschraube wählt Claude Code per Simulation.
**Akzeptanzkriterien**
 
- Auf Schwer verliert kein Profil vor Minute 4 (Minimum über 200 Partien).
- Schwer „gelegentlich“ gewinnt weiterhin höchstens 5 % der Partien.
---
 
### REQ-6.09 Referenz-Bot „Einheiten zuerst“
 
**Befund (Briefing §5.1):** Ein einfacher Bot gewinnt mit denselben Profilwerten schneller als der Simulations-Bot.
 
**Anforderungen**
 
- Der einfache Bot wird als zweite Strategie „einheiten-zuerst“ fest in `tools/` aufgenommen: feste Bauordnung, schickt ständig Einheiten bis zum Limit, nimmt die erste Karte. Er gilt für alle Profile.
- Jede Abnahmeserie berichtet beide Strategien nebeneinander.
- **Keine globale Neukalibrierung in dieser Iteration.** Angepasst werden nur REQ-6.06 bis 6.08. Dazu kommen Karten, die bei *beiden* Strategien mehr als +25 pp bringen; betrifft das Dauerauftrag, Söldnerheer oder Alles auf die Mitte, werden sie abgeschwächt.
- Das Werkzeug `tools/compare-human.mjs` ordnet Protokolle von Menschen künftig beiden Strategien zu.
**Akzeptanzkriterien**
 
- Serie mit beiden Strategien läuft; Tabelle im Bericht.
- Karten über +25 pp bei beiden Strategien: keine.
---
 
### REQ-6.10 Aufräumen
 
- Experiment „Schwung“ vollständig entfernen (Code, Konfiguration, Tests, Texte).
- Leistungstest auf ein festes Ziel umstellen: ≤ 1 ms je Spielschritt mit 120 Einheiten in Node.
- Die bestätigten Auslegungen (Abschnitt 2) in `docs/STAND.md` als entschieden markieren.
- Durchlauftest je Schwierigkeitsgrad ohne Konsolenfehler und Warnungen.
---
 
### REQ-6.11 Abnahme, Bericht, Testbuild
 
- Abnahmeserie mit 200 Partien je Feld, beiden Strategien, allen Zielwerten aus Briefing §7 sowie den neuen Kennzahlen:
  - Richtungswechsel,
  - Partielänge (90. Perzentil),
  - ungenutztes Material,
  - Anteil passiver EP,
  - Forschungstempo.
- `docs/bericht-iteration-6.md` im bisherigen Aufbau. Er enthält die Liste der ersetzten Offline-Karten zur Freigabe durch den PO.
- Testbuild für Spieltests mit Menschen: `?debug=1` mit Protokollexport; Testleitfaden an die Änderungen angepasst.
## 4. Inkrementplan
 
| Inkrement | Inhalt | REQ |
|---|---|---|
| I6.0 | Basislinie v0.6 mit beiden Strategien (50 Partien je Feld), Kennzahlen „ungenutztes Material“ und „Richtungswechsel“ messen | 6.09 |
| I6.1 | Formationen ohne Pendeln | 6.01 |
| I6.2 | Versetzte Einzelangriffe, eigene Geschosse | 6.02 |
| I6.3 | Offline-Reste, Pause bei verdecktem Tab, Kartenersatz | 6.03 |
| I6.4 | Kartenwahl automatisch, Kaserne im Reiter „Armee“ | 6.04, 6.05 |
| I6.5 | „Schwung“ entfernen, Leistungsziel, Schwer-Start | 6.10, 6.08 |
| I6.6 | Universität | 6.06 |
| I6.7 | Nachbarschaftsboni | 6.07 a |
| I6.8 | Handelskontor mit Zinsen, „Welle vorziehen“ | 6.07 b, c |
| I6.9 | Abnahmeserie, Bericht, Testbuild | 6.11 |
 
**Spieltest (Aufgabe des PO):** Nach I6.4 ist das Kampfbild bereinigt. Dann drei bis fünf Personen je zwei Partien spielen lassen (Leicht ohne Anleitung, Normal), mit Protokollexport und Testleitfaden. Die Ergebnisse gehen in Iteration 7 ein.
 
**Abbruchregel:** Jedes abgeschlossene Inkrement ist spielbar. Bei knappem Budget gilt diese Priorität:
 
1. I6.1–I6.4,
2. I6.0,
3. I6.5,
4. I6.6,
5. I6.9 (mindestens Bericht und Testbuild),
6. I6.7,
7. I6.8.
Ein halb fertiges Inkrement wird nicht committet; der Stand wird in `docs/STAND.md` beschrieben.
 
## 5. Offene Punkte mit gesetztem Standard
 
| Punkt | Risiko | Standard |
|---|---|---|
| Passiver EP-Deckel 35 % statt 25 % | Schwächt „aktive belohnen“ leicht | 35 %; Profilabstand ≥ 4 min muss halten, sonst zurück auf 25 % |
| Eingabesperre der Kartenwahl 400 ms | Zu lang wirkt träge, zu kurz verliert Klicks | 400 ms |
| Ersatz für Offline-Karten | Ersatzeffekt verschiebt Wahlraten | Gleiche Kategorie und Seltenheit; Liste zur Freigabe im Bericht |
| Nachbarschaft nur orthogonal | Diagonal wäre reicher, aber schwerer lesbar | Orthogonal |
| „Welle vorziehen“ neben der Karte Dauerauftrag | Doppelte Wirkung beim Nachschub | Abklingzeit so wählen, dass die Kombination unter +25 pp bleibt; sonst berichten |
| Overkill-Vermeidung der Fernkämpfer | Verändert die Schadensverteilung | Standardmäßig aus; Wirkung berichten |
| Globale Neukalibrierung | Balancing bleibt gegen den schwächeren Bot eingestellt | Erst Iteration 7 mit Daten von Menschen |
 
## 6. Definition of Done
 
- `npm test` und `browser-check.mjs` grün, mit neuen Tests je REQ.
- Invarianten eingehalten.
- Abnahmeserie mit beiden Strategien. Verfehlte Zielwerte sind mit Ursache und Vorschlag berichtet.
- Leistungsziel ≤ 1 ms je Spielschritt mit 120 Einheiten erreicht.
- `docs/bericht-iteration-6.md`, `docs/STAND.md`, `CHANGELOG.md` und der Testleitfaden sind aktualisiert.
- Branch `iteration-6` per Fast-Forward nach `main` übernehmbar.
## Anhang: Zuordnung der PO-Befunde
 
| Befund | Inhalt | REQ |
|---|---|---|
| 1 | Offline-Boni | 6.03 |
| 2 | Wirtschaft ohne Entscheidungen | 6.07, 6.06 (Beschleunigen mit Material) |
| 3 | Universität schwach | 6.06 |
| 4 | Kartenwahl automatisch öffnen | 6.04 |
| 5 | Kaserne fehlt im Arbeitsbereich | 6.05 |
| 6 | Formationen pendeln | 6.01 |
| 7 | Werfer werfen als Gruppe | 6.02 |
| Briefing §6.1–6.7 | Offene Entscheidungen | Abschnitt 2, 6.08, 6.09, 6.10 |

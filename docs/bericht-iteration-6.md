# Klammerfront – Bericht Iteration 6 (v0.7)

Stand: 30.09.2026 · Branch `iteration-6` (Commits `I6.0`–`I6.9` auf `main`, Fast-Forward möglich) · Zielgruppe: Entwickler und PO

## Ergebnis in drei Sätzen
Das Kampfbild ist bereinigt: Die „Millisekunden-Sprünge“ waren ein Lane-Tausch beider Seiten in jedem Takt (bis zu 42 Richtungswechsel je
Einheit und Sekunde, jetzt höchstens 8 in seltenen Umordnungen, Median nahe null), und die Würfe im Gleichtakt kamen von identischen
Angriffspausen einer Welle. Kartenwahl, Kaserne, Offline-Reste, Universität und Wirtschaft sind wie gefordert umgesetzt; die
Abnahmeserie mit beiden Strategien (12.000 Partien, 0 Patts) trifft die meisten Zielwerte. Offen sind vor allem eine PO-Entscheidung
(Schwer: früher Verlust gegen „gelegentlich verliert“, REQ-6.08) und ein deutlicher Stärkezuwachs der gierigen Heuristik durch die neuen
Wirtschaftsmittel, der in Iteration 7 mit den Spieltestdaten neu einzustellen ist.

## 1. Zeitleiste
| Commit | Inkrement | Inhalt |
|---|---|---|
| `986e8c3` | I6.0 | Basislinie v0.6 mit Strategie „einheiten-zuerst“, Kennzahlen Richtungswechsel, Partielänge, ungenutztes Material, Forschungstempo |
| `dfcd7fc` | I6.1 | Formationen ohne Pendeln |
| `41d111a` | I6.2 | Versetzte Einzelangriffe, eigenes Geschoss je Wurf |
| `9558d46` | I6.3 | Offline-Reste entfernt, Pause bei verdecktem Tab, Nachtschicht mit Online-Wirkung |
| `6032402` | I6.4 | Kartenwahl öffnet sich automatisch, Kaserne im Reiter Armee, Heimat-Reiter |
| `9ee8881` | I6.5 | Schwung entfernt, Leistungsziel ≤ 1 ms, Anlauf für Schwer (aus, Zielkonflikt) |
| `4ca5d72` | I6.6 | Universität: Tempo, Beschleunigen gegen Material, Rückmeldung, Paarvergleich |
| `18ae7c4` | I6.7 | Nachbarschaftsboni mit Vorschau |
| `a309872` | I6.8 | Handelskontor mit gedeckelten Zinsen, „Welle vorziehen“ |
| I6.9 | I6.9 | Abnahmeserie, Bericht, Testbuild |

## 2. Architektur
Keine neue Datei im Spielkern außer `data/neighbors.js` (Nachbarschaftsregeln, deklarativ). Werkzeuge: `tools/sim-metrics.mjs`
(Richtungswechsel je Takt), `tools/browser-bot.js` ist zugleich Durchlauftest-Bot und Simulationsstrategie „einheiten-zuerst“
(eine Quelle, von Playwright in die Seite und von der Simulation in ihren vm-Kontext geladen). Neue Suiten: `forschung`, `nachbarn`,
`wirtschaft`; `ziele`, `kurz`, `ohneSchmiede` spielen beide Strategien mit denselben Seeds.
Spielstand-Version 7. Invarianten unverändert und getestet (Kern ohne DOM, Zufall nur über `S.rng`, Zahlen in `config.js`/`data/`,
Texte in `i18n/`, azyklisches JSON, Tooltip und Erklärzeile an jedem Bedienelement).
Tests: 21 Testdateien, 135 Logiktests (v0.6: 109), Browser-Prüfung 196 Punkte (v0.6: 180). Leistung: Median eines Takts mit 120 Einheiten
0,14 ms (Soll ≤ 1 ms, `PERF_TICK_MAX_MS`).

## 3. Befunde der Fehler (REQ-6.01, REQ-6.02)
**Pendeln.** Drei der fünf vermuteten Ursachen trafen zu, belegt mit zuerst roten Tests (`tests/pendel.test.mjs`):
1. *Lane-Wahl ohne Bindung (Hauptursache):* Eine Einheit der Mitte half oben, der Gegner der Mitte ebenso; beide Seiten entschieden im selben
   Takt gegeneinander und tauschten in jedem Takt die Lane (21 Lane-Wechsel je Sekunde). Behebung: Ziel bis zur Ankunft gebunden, helfende
   Einheiten bleiben, bis ihre Lane frei ist, Mindestverweildauer 1,5 s nach Ankunft.
2. *Instabile Platzvergabe:* Reihen wurden nach Id sortiert, Nachschub brachte alte Platznummern mit, jede Reihe zentrierte sich bei jeder
   Änderung neu. Behebung: feste Plätze nach Ankunft, Nachschub hinten, feste Querplätze, gleitende Querbewegung vom alten zum neuen Platz.
3. *Zustandspendeln:* Wechsel zwischen Kampf, Sammeln und Marsch nach 0,05 s. Behebung: Mindestverweildauer 0,5 s (außer Marsch → Kampf).
Nicht zutreffend: konkurrierende Ziele. Teilweise: Darstellung (Aufrücken als Sprung) – die gezeichnete Position folgt jetzt weich.
Debug-Protokoll je Einheit mit `?debug=1` (`__kf.unitLog(id)`, im Export `unitLog`).

**Würfe im Gleichtakt.** Keine Gruppierung: Die Simulation arbeitet seit Iteration 5 je Einheit. Alle Einheiten einer Welle starteten aber
mit Angriffspause 0 und gleicher Pause danach, und alle Geschosse einer Lane flogen aus der Lane-Mitte. Behebung: zufällige erste Pause,
± 10 % Streuung je Angriff (über `S.rng`), jedes Geschoss vom Platz des Werfers zum Platz seines Ziels. Overkill-Vermeidung als Schalter (aus;
angeschaltet +4 bis +10 pp für die gierige Heuristik).

## 4. Kennzahlen der Abnahmeserie
200 Partien je Feld und Strategie (`reports/i6-ziele.*`, 6.000 Partien), dazu Phasen (1.800), Strategie (300), ohne Schmiede (200),
Forschung (1.450), Nachbarschaft (300), Wirtschaft (1.200) und Vergleichsserien. Median Sieg · Siegquote.

| Schwierigkeit | Profil | Ziel | v0.6 gierig | v0.7 gierig | v0.7 einheiten-zuerst |
|---|---|---|---|---|---|
| Leicht | aktiv | 5–7 min | 6:24 · 100 % | 6:13 · 100 % ✔ | 5:34 · 100 % ✔ |
| Leicht | durchschnitt | 6–9 min | 8:58 · 100 % | 8:57 · 100 % ✔ | 6:12 · 100 % ✔ |
| Leicht | gelegentlich | Sieg, 10–18 min | 11:49 · 96 % | 10:26 · 100 % ✔ | 7:28 · 100 % ✘ |
| Leicht | passiv | darf verlieren | 0 % | 2 % ✔ | 2 % ✔ |
| Normal | aktiv | 6–9 min | 6:45 · 88 % | 6:43 · 100 % ✔ | 5:26 · 100 % ✘ |
| Normal | durchschnitt | 9–13 min | 9:39 · 64 % | 9:32 · 95 % ✔ | 6:12 · 100 % ✘ |
| Normal | gelegentlich | darf verlieren | 18 % | 55 % ✔ | 100 % ✔ |
| Normal | passiv | verliert | 0 % | 0 % ✔ | 0 % ✔ |
| Schwer | aktiv | 8–12 min | 10:23 · 52 % | 9:32 · 91 % ✔ | 5:51 · 100 % ✘ |
| Schwer | durchschnitt | 13–20 min | 7:54 · 28 % | 11:19 · 68 % ✘ | 7:01 · 99 % ✘ |
| Schwer | gelegentlich | verliert (≤ 5 %) | 0 % | 0 % ✔ | 5 % ✔ |
| Schwer | passiv | verliert | 0 % | 0 % ✔ | 0 % ✔ |

(v0.6: Basislinie I6.0 mit 50 Partien je Feld.)

| Kennzahl | Soll | gierig | einheiten-zuerst | |
|---|---|---|---|---|
| Patt-Quote | ≤ 2 % | 0 von 3.000 | 0 von 3.000 | ✔ |
| „verteidigung“ | gewinnt nie, verliert bis Minute 25 | 0 %, spätestens 22:45 | 0 %, spätestens 16:32 | ✔ |
| „aktiv“ ≥ „durchschnitt“ | je Schwierigkeit | ja | ja | ✔ |
| Profilabstand Leicht aktiv ↔ gelegentlich | ≥ 4 min | 4:13 | 1:54 | ✔ / ✘ |
| **Richtungswechsel** je Einheit und Sekunde | ≤ 2 | höchstens 8, Median 0,005, 553 von 3.000 Partien mit mehr als 2 | höchstens 5, Median 0,002, 46 von 3.000 | ✘ |
| **Partielänge**, 90. Perzentil der Siege | ≤ 20:00 | höchstens 15:12 | höchstens 12:39 | ✔ |
| **Ungenutztes Material** (Normal, durchschnitt) | ≤ 20 % | 4 % | 6 % | ✔ |
| **Passive EP** (Hörsaal III rechnerisch, Normal aktiv) | ≤ 35 % | 34 % | 47 % | ✔ / ✘ |
| **Forschungstempo** (Normal, durchschnitt) | erste < 3:00, bis Minute 10 ≥ 5 | siehe §5 | | |
| Früheste Niederlage auf Schwer | nicht vor 4:00 | 1:21 | 1:26 | ✘ (PO) |
| Handelskontor gebaut | ≥ 20 % | 90 % | 85 % | ✔ |
| Handelskontor, Wirkung (Paarvergleich) | ≤ +25 pp | Normal −2, Schwer −22 | Normal 0, Schwer −2 | ✔ |
| „Welle vorziehen“, Wirkung (Paarvergleich) | ≤ +25 pp | Normal +8, Schwer +22 | Normal 0, Schwer −2 | ✔ |
| Nachbarschaftsregel, Wirkung je Regel | ≤ +25 pp | −4 … +6 | | ✔ |
| Karten über +25 pp bei beiden Strategien | keine | keine | | ✔ |
| Ohne Schmiede, Normal durchschnitt | ≥ 30 % | 75 % | 100 % | ✔ |
| Klickanteil Früh / Mitte / Spät | ≥ 50 / 10–30 / ≤ 3 % | 60–65 / 22–25 / 1–2 % | | ✔ |
| Stopp/Dauer | ≥ 95 % | 100 / 100 / 96 % | | ✔ |
| nie/Dauer | ≤ 50 % | Leicht 100 %, Normal 80 %, Schwer 0 % | | ✘ |
| Erster Draft / Abstand je Phase | 60–90 s / 45–150 s | 85 s / 48, 56, 95 s | | ✔ |
| Draft-Wahlrate je Option | 5–60 % | 7 Karten außerhalb | | ✘ |
| Universität gebaut (Normal, gierig) | ≥ 40 % | 62 % | | ✔ |
| Zeitanteil der Armee im Kampf | berichten | 65 % | 73 % | – |
| Tick-Zeit mit 120 Einheiten | ≤ 1 ms | 0,14 ms | | ✔ |

## 5. Universität (REQ-6.06)
Rohdaten `reports/i6-forschung.*` (50 Partien je Arm, Normal durchschnitt).

| Spielweise | erste Forschung fertig (Median) | vor 3:00 | bis Minute 10 fertig (Median) |
|---|---|---|---|
| gierig | nie | 0 % | 0 |
| einheiten-zuerst | 4:11 | 0 % | 2 |
| uni-zuerst (Universität als erstes Verstärkungsgebäude) | 2:44 | 100 % | 15 |

Das Tempo-Soll (erste Forschung vor 3:00, bis Minute 10 mindestens 5) erreicht nur, wer die Universität früh baut. Das war die Auslegung
in I6.6: Das Soll beschreibt, was möglich ist, nicht was jeder Bot tut. Die gierige Heuristik baut die Universität in 62 % der Partien, forscht
aber auf diesem Feld im Median nie, weil ihre Vorausschau (45 s) den späteren Nutzen einer Forschung nicht sieht.

Paarvergleich (Stufe 1 bei 3:00 geschenkt gegen gesperrt, gierig, Soll +3 … +25 pp): Hörsaal, Weitblick, Logistik, Schmiedeausbau je +4 pp;
Drill und Metallurgie +2 pp; Neu ziehen, Bann, Glücksgriff, Maurerkunst, Schildträger ±0; Ingenieur −4, Zweiter Platz −2. Keine Forschung
über +25 pp. **Die Messung ist nach I6.7/I6.8 kaum noch aussagekräftig:** Die Grundquote dieses Felds liegt jetzt bei 90–96 %, eine Forschung
kann kaum noch etwas hinzufügen (Deckeneffekt), und das Rauschen bei 50 Partien beträgt etwa ± 10 pp. In I6.6, vor Nachbarschaft und Kontor,
lagen Logistik (+16), Drill (+10) und Schmiedeausbau (+6) klar im Soll. Für Iteration 7 sollte der Paarvergleich auf Schwer laufen.

Passive EP: Hörsaal III brächte einem aktiven Spieler auf Normal rechnerisch 34 % (gierig) bzw. 47 % (einheiten-zuerst) seines EP-Ertrags;
Soll ≤ 35 %. Bei „einheiten-zuerst“ liegt der Wert höher; die Ursache ist nicht untersucht (vermutlich kürzere Partien mit weniger Abschüssen je Minute).

## 6. Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Die gierige Heuristik ist deutlich stärker geworden.** Schwer „aktiv“ 52 → 91 %, Schwer „durchschnitt“ 28 → 68 %, Normal „gelegentlich“
   18 → 55 %. Ursache sind die neuen Wirtschaftsmittel, die der Bot per Vorausschau nutzt: günstigere Forschung, Nachbarschaft,
   Handelskontor (jetzt ohne Karte) und „Welle vorziehen“. Einzeln bleibt jedes Mittel unter +25 pp; zusammen verschieben sie die Kurve.
   „Einheiten zuerst“ war schon vorher fast immer siegreich und hat sich kaum verändert. Die beiden Strategien liegen damit näher beieinander
   – das ist gewünscht –, aber auf dem Niveau der stärkeren. Eine Neukalibrierung sieht die Anforderung erst für Iteration 7 vor.
2. **„Nie klicken“ gewinnt auf Leicht so oft wie „Dauerklick“** und ist auf Normal nur 20 % schlechter; mit Kontor und Automatik lohnt sich das
   Klicken für die Bots wenig. Spieltest abwarten.
3. **Richtungswechsel:** Die Restfälle sind einzelne Umordnungen im langen Kampf (Nahkämpfer setzen sich vor Fernkämpfer, eine helfende
   Einheit kommt an und zieht nach der Mindestzeit weiter). Kein Takt-für-Takt-Muster mehr; Playwright sieht über 10 s Kampf höchstens einen
   Wechsel je Einheit und Sekunde. Eine weitere Absenkung verlangte, die Regel „Nahkämpfer vorn“ für Nachzügler aufzuweichen.
4. **Draft-Wahlraten:** Wirtschaftskarten (Schwere Pressen 73 %, Großauftrag 71 %, Doppelschicht 70 %, Kriegsanleihe 68 %) werden zu oft gewählt,
   Verbrannte Erde (3 Angebote) nie.
5. **Die Kennzahl „ungenutztes Material“ misst die Beobachtung des PO nicht.** Schon v0.6 lag bei 5 %: Die Bots geben alles für Einheiten aus.
   Ob Menschen nach dem Vollausbau Material horten, zeigt nur der Spieltest.
6. **Kontor-Vergleich „gebaut gegen nicht gebaut“** (+85 pp) ist verzerrt: Partien ohne Kontor sind die, die vor Stufe 2 verloren gehen.
   Belastbar ist der Paarvergleich der Suite `wirtschaft`.

## 7. Fehler, die durchgerutscht sind
- **Verborgener Knopf fing Klicks ab (I6.3):** Der Knopf „Weiter“ blieb wegen `display:flex` trotz `hidden` als unsichtbare Fläche über der
  Mitte der Spielwelt. Gefunden von der Browser-Prüfung (Mausrad scrollte nicht), im I6.3-Commit behoben, bevor er gepusht wurde.
- **Test-Commit mit roten Tests (I6.2):** Der erste I6.2-Commit enthielt vier Tests, die noch von Angriffspause 0 ausgingen; vor dem Push
  ersetzt.
- **Werkzeugausfall:** Während I6.6 fiel die Freigabeprüfung für Befehle aus; die Arbeit wurde unterbrochen und nach „weiter“ fortgesetzt.
  I6.6 und I6.7 sind dennoch getrennte, einzeln geprüfte Commits.

## 8. Technische Schulden und Risiken
- Zwei Bot-Strategien mit sehr unterschiedlicher Stärke; die Balancing-Aussagen hängen an der Wahl. Daten von Menschen fehlen weiterhin.
- Viele Paarvergleiche mit 40–50 Partien je Arm: Differenzen unter ± 10–20 pp sind nicht von null zu unterscheiden (REQ-6.02 „≤ 3 pp“ ist
  so nicht prüfbar).
- Die Abnahmeserie braucht auf vier Kernen gut 1,5 Stunden; die Vorausschau der gierigen Heuristik prüft jetzt auch Bauplätze und
  „Welle vorziehen“.
- Das Strategie-Merkmal in `compare-human.mjs` trennt die Strategien nur schwach (63 % gegen 71–74 % Einheitenkäufe).

## 9. Offen für den Product Owner
1. **REQ-6.08, Schwer-Start – Entscheidung nötig.** Beide Kriterien zugleich sind mit der erlaubten Stellschraube nicht erreichbar
   (Tabelle in `docs/STAND.md`). Anlauf an: „passiv“ überlebt kaum länger (bis 3:56), „gelegentlich“ gewinnt dann 20–90 %. Anlauf aus (Standard):
   Verlust nach 1:21. Vorschlag: Anlauf aus lassen und in Iteration 7 mit Spieltestdaten zusammen mit dem Druck ab der Spielmitte neu einstellen.
2. **Freigabe Kartenänderungen:**
   - **Nachtschicht** (einzige Karte mit Offline-Bezug, Wirtschaft, gewöhnlich): bisher „Fabriken arbeiten bei Abwesenheit 4/8 Stunden länger“
     (im Spiel wirkungslos), neu „in der Spätphase produzieren die Fabriken 25 %/50 % mehr“.
   - **Handelskontor** (Wirtschaft, selten): Das Kontor ist jetzt ohne Karte baubar (sonst wäre „in mindestens 20 % der Partien gebaut“ nicht
     erreichbar); die Karte hebt stattdessen den Zinsdeckel um 50 %. Abweichung von „Handelskontor bleibt und wird umgebaut“: bitte bestätigen.
3. **Stärkezuwachs der gierigen Heuristik** (Auffälligkeit 1): in Iteration 7 mit den Spieltestdaten neu einstellen oder vorher einzelne
   Mittel verteuern?
4. **Richtungswechsel knapp über dem Soll** (Auffälligkeit 3): so lassen und im Spieltest beobachten?
5. **Heimat-Reiter** (bitte bestätigen): Fabrik → Bauen, Kaserne → Armee, Schmiede → Schmiede, Universität → Universität, Handelskontor → Bauen.
6. **Merge nach `main`:** `iteration-6` ist per Fast-Forward übernehmbar; wartet auf Freigabe.
7. **Spieltest** (Aufgabe des PO): Testbuild mit Protokoll ist veröffentlicht; Ablauf in `docs/testleitfaden-iteration-6.md`.

Weitere Auslegungen (Nr. 1–22) stehen in `docs/STAND.md`.

## Quellen
`docs/anforderungen-iteration-6.md`, `docs/STAND.md`, `docs/testleitfaden-iteration-6.md`, `CHANGELOG.md`.
Rohdaten: `reports/i6-basis-ziele.*`, `reports/i6-ziele.*`, `reports/i6-phasen.*`, `reports/i6-strategie.*`, `reports/i6-ohneSchmiede.*`,
`reports/i6-forschung.*`, `reports/i6-6-forschung.*`, `reports/i6-7-nachbarn.*`, `reports/i6-8-*`, `reports/i6-5-schwer-*`, `reports/i6-2-*`,
`reports/i6-1-kurz.*`.

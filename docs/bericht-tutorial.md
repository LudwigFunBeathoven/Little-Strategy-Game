# Klammerfront – Bericht Tutorial „Erste Schritte“ (v0.8)

Stand: 05.10.2026 · Branch `tutorial` (von `main`, v0.7) · Status: **wartet auf Freigabe nach `main`**
Grundlage: `docs/anforderungen-tutorial.md` · Stand je Inkrement: `docs/STAND.md` · Testleitfaden: `docs/testleitfaden-tutorial.md`
**Teil 2 (`docs/bericht-tutorial-2.md`) löst Teile dieses Berichts ab:** Startbildschirm vor jeder Partie (statt Start ohne Dialog auf Leicht), fünf Schritte mit
Kartenwahl als Abschluss (statt „Erster Sieg“), Begrüßung und Abschied. Die Auslegungen und Zahlen unten beschreiben den Stand von Teil 1.

## Ergebnis in drei Sätzen
Das Tutorial ist umgesetzt: Die erste Partie eines Browsers startet ohne Dialog auf Leicht, der Quartiermeister führt Fertigen und Bauen vor, danach
zeigen Zeile und pulsierender Rahmen Einheiten kaufen und die Welle ausschicken, bis der erste Sieg die Abschiedszeile auslöst. Alle Akzeptanzkriterien
sind durch Tests belegt, und Partien ohne Tutorial liefern mit denselben Seeds dieselben Ergebnisse wie in v0.7. Offen ist eine Auslegung der Anforderung
(Abschnitt 2, Punkt 1) sowie die Frage, ob das Tutorial Menschen trägt; das zeigt nur der Spieltest.

## 1. Entscheidungen des PO (Anforderung, Abschnitt 4)
| Punkt | Entscheidung | Umsetzung |
|---|---|---|
| Zeitpunkt | Auf `main` | Branch `tutorial`; Übernahme nach `main` nach Freigabe. Die Experiment-Branches `exp/kartenpfad`, `exp/zeitalter` gibt es im Repository nicht (Punkt 2) |
| Tutorial-Partie | Leicht, Schwierigkeitswahl erst ab der zweiten Partie | `C.TUTORIAL.diff`; die erste Partie startet ohne Dialog |
| Abschiedszeile | „Bauen, rüsten, halten.“ | `tut.sieg` (en: „Good. Build, arm, hold.“) |
| Werfer, Mauer, Karten im Tutorial | Nein | nur Erstkontakt-Hinweise und Pacing |
| Name der Figur | „Quartiermeister“ | `tut.name`, einzige Stelle für den Namen |

## 2. Abweichungen und Auslegungen (zur Bestätigung)
1. **„Die bisherige Einführung entfällt“ (REQ-T.05) – ausgelegt als: Die Hinweistexte entfallen, die gestaffelte Freischaltung bleibt.** Gemeint ist offenbar die
   Einführung als Anleitung. Die Staffelung selbst (Wellenleiste ab erster Welle, Karten ab Stufe 1, Verstärkungsgebäude ab Stufe 2, `introShows`) ist
   Pacing, nicht Text, und die Bots spielen mit ihr. Entfiele sie, änderten sich alle Simulationsergebnisse; das widerspräche der geforderten Prüfung
   „Partien ohne Tutorial bleiben unverändert“ (REQ-T.06) und dem Grundsatz „Pacing und Hinweise tragen den Spieler“ (Abschnitt 0). Der Schalter „Einführung
   überspringen“ im Dialog bleibt. **Frage:** Soll die Staffelung auch fallen (dann wäre eine neue Basislinie der Simulation nötig)?
2. **Experiment-Branches:** `exp/kartenpfad` und `exp/zeitalter` existieren im Repository nicht, ebenso keine Zeitalter oder Technologiekarten. Die dafür
   genannten Erstkontakt-Hinweise entfallen deshalb. Das Tutorial hängt wie gefordert nur an Spielereignissen und läuft damit auch dort.
3. **„Menü“ = Dialog „Neue Partie“:** „Tutorial wiederholen“ steht dort neben „Hinweise zurücksetzen“ und „Einführung überspringen“. Die Leiste hat keinen Platz
   für einen weiteren Dauer-Knopf.
4. **Knopf in der Leiste heißt „Überspringen“** (Erklärzeile „Tutorial beenden“, Tooltip „Tutorial überspringen“), damit die Leiste auch bei 1024 px Breite nicht
   überlappt.
5. **Erste Gegnerwelle der Tutorial-Partie:** zwei Läufer (`firstWaveSize`). Die normale erste Welle auf Leicht ist ein Läufer; zwei sind eine kleine Probe und
   von drei Läufern sicher zu halten (belegt im Test „Drei Läufer halten die kleine erste Welle“). Zeitlimit wie vorgeschlagen 150 s.
6. **Schritt 3 mit Hilfsziel:** Fehlt das Material für den Läufer, zeigt das Tutorial auf das Klickfeld und wiederholt dessen Zeile („Fertige Material. Klick!“).
   Das steht nicht in der Anforderung, verhindert aber einen toten Moment: ein grauer Knopf mit Rahmen.
7. **Schritt 5 ohne Zeile:** Wie in der Tabelle steht bis zum Sieg keine Zeile und kein Rahmen; das Tutorial ist weiter aktiv (Knopf „Überspringen“ sichtbar,
   Hinweise gesperrt). Die Kamera folgt dem Ausmarsch und wird mit dem Ende des Tutorials wieder freigegeben.
8. **Kamera folgt nur beim Countdown-Fall** (nicht, wenn Schritt 4 den Knopf „Welle vorziehen“ zeigt), wie in der Regel zu Schritt 4 beschrieben.
9. **Neue Hinweise lösen erst nach dem Tutorial aus.** Was dann noch zutrifft (z. B. Schmiede gebaut), wird nachgeholt; während des Tutorials geht kein Hinweis „verloren“.
10. **Marke „neu“ gilt je Partie, nicht je Browser:** Die Grundlinie (was beim Start sichtbar ist) gilt als bekannt, „angesehen“ heißt 1,5 s sichtbar (`UI.newSeenMs`),
    bei Reitern: geöffnet. Der Zustand liegt im Spielstand. Je Browser wäre eine Alternative; dann gäbe es in der zweiten Partie keine Marken mehr.
11. **Die Vorführung der Figur ist echt:** Sie fertigt einmal wirklich (1 Material, 1 Klick im Spielstand), zählt aber weder für das Tutorial noch im
    Sitzungsprotokoll.
12. **Hinweise insgesamt auf eine Zeile gekürzt** (höchstens 90 Zeichen, vorher bis 120) und schließen sich nach 8 s, auch die bestehenden. Gestrichen: die
    Hinweise „Start“ und „Erste Welle“ (Inhalt jetzt im Tutorial) sowie die ungenutzten Texte `hint.schmiede` und `hint.kaserne`.
13. **Version 0.8**, Spielstand-Version unverändert (7): Der Spielstand erhält optional `hold` (Schonfrist), `tut` und `ui` (Anzeige); fehlen sie, gilt „kein Tutorial“.
14. **`?tutorial=1` ersetzt eine vorhandene Partie** durch eine neue Tutorial-Partie (Autospeicherung wird überschrieben); gedacht für Tests und Spieltests.
15. **Bestehende Spieler:** Wer in v0.7 gespielt hat und keinen Spielstand mehr hat, bekommt das Tutorial einmal, weil der Merker fehlt.

## 3. Zuordnung der bisherigen Einführung (REQ-T.05)
| Bisher (v0.5/v0.6) | Neu |
|---|---|
| Hinweis „Start“: Fertigen, Fabrik bauen, Einheiten in die Warteschlange | Tutorial, Schritte 1 – 3 |
| Hinweis „Erste Welle“: Wellentakt, Armee marschiert auf allen Lanes | Tutorial, Schritt 4 (Countdown); das Armeeverhalten sieht man im Spiel |
| Hinweis „Gebäude“ (Stufe 2) | bleibt, auf eine Zeile gekürzt |
| Hinweis „Karte“ | bleibt, jetzt die geforderte Zusatzzeile „Wähle eine Karte. Jede verändert dein Reich.“ |
| Hinweise „Forschung“, „Abriss“, „Belagerung“ | bleiben, auf eine Zeile gekürzt |
| – | **neu:** Mauer, Türme, Schmiede, Handelskontor (mit Zinsen), Nachbarschaft |
| Gestaffelte Freischaltung (`introShows`) | bleibt (Auslegung 1) |
| – | **neu:** Marke „neu“ an Reitern, Bau-Optionen, Einheiten |

## 4. Abnahmekriterien
| Kriterium | Ergebnis | Beleg |
|---|---|---|
| Neuer Browser startet mit Tutorial, fünf Schritte in unter 2:30 min | ✔ | Browser-Prüfung beider Sprachen; direkte Bedienung: Schritte nach 6, 9, 13, 20 und 40 s Spielzeit |
| Reihenfolge vertauscht: erst Fabrik, dann fertigen | ✔ | Browser-Prüfung; `tests/tutorial.test.mjs` |
| Überspringen in jedem Schritt beendet das Tutorial, Schonfrist entfällt, erste Welle zum normalen Zeitpunkt | ✔ | Browser-Prüfung (vier Ausgangsschritte); `tests/hold.test.mjs` |
| Zweiter Start im selben Browser ohne Tutorial; „Tutorial wiederholen“ startet es | ✔ | Browser-Prüfung beider Sprachen |
| `?tutorial=1` erzwingt, `?tutorial=0` unterdrückt | ✔ | Browser-Prüfung |
| Hinweise nie während eines Schritts, höchstens einer gleichzeitig, nach 8 s zu | ✔ | Browser-Prüfung (Frist verkürzt) |
| `tooltipAudit`, `explAudit` grün, beide Sprachen, keine Konsolenfehler | ✔ | Browser-Prüfung |
| Bot-Simulation mit gleichem Seed unverändert | ✔ | `tests/unveraendert.test.mjs` (vier Partien), Kurzsimulation 9:09 / 6:13, je 100 % |
| Messung: Schrittzeiten, Überspringen, Fehlklicks | ✔ | `tests/tutorial-messung.test.mjs`, Browser-Prüfung des Protokolls |
| Tick-Zeit mit 120 Einheiten ≤ 1 ms | ✔ | 0,13 ms |
| `core.js` ohne DOM, keine festen Texte, Zahlen in `config.js`/`data/` | ✔ | `tests/i18n.test.mjs`, Durchsicht |

## 5. Kennzahlen
- `npm test`: 162/162. Browser-Prüfung: 276 Prüfungen.
- Kurzsimulation (je 20 Partien Normal durchschnitt): gierig 9:09 · 100 %, einheiten-zuerst 6:13 · 100 %, keine offene Partie; identisch zu v0.7.
- Tutorial-Partie bei direkter Bedienung (Probelauf): fertigen 5,6 s, bauen 9,2 s, Einheiten 13,2 s, Welle 20,0 s, erster Sieg 39,8 s. Die Zeit bis zur Welle richtet sich
  nach dem Wellentakt (alle 20 s); Menschen brauchen mehr, Zieldauer ≤ 2:30 min.

## 6. Auffälligkeiten (berichtet, nicht geändert)
1. **Die Zeiten sind Bot-Zeiten.** Wie lange Menschen brauchen, zeigt erst der Spieltest. Der Testleitfaden hat dafür eine Partie ohne jede Hilfe von außen.
2. **Ein Flackern der Browser-Prüfung „Zweiter Start im selben Browser“** trat in einzelnen Läufen auf. Ursache: Chromium verliert den `localStorage` von `file://`-Seiten beim
   Neuladen gelegentlich vollständig (1 von 12 Läufen; über HTTP 0 von 40). Kein Fehler im Spiel. Die Browser-Prüfung lädt die Seite jetzt über einen lokalen HTTP-Server.
   Für Spieler heißt das: Wer das Spiel als Datei (`file://`) öffnet, kann in seltenen Fällen seinen Spielstand verlieren; über eine Webadresse (MVP) tritt das nicht auf.
3. **Zwei bereits vorhandene Prüfungen waren vom Zufall abhängig** und sind robust gemacht: „Welle vorziehen“ (die zufällig gewählte Karte Dauerauftrag füllte die Warteschlange wieder) und
   „Kartenwahl: zurück im vorigen Reiter“ (dieselbe Karte konnte zweimal gewählt werden).
4. **Der Dialog „Neue Partie“ war bei 720 px Höhe schon vorher höher als das Fenster** (852 px); der Knopf „Spiel starten“ lag teilweise außerhalb. Jetzt scrollt der Dialog,
   der Knopf bleibt unten sichtbar.
5. **Nicht geprüft:** Bedienung auf Touch-Geräten und sehr kleinen Fenstern (die Zeigerereignisse sind dieselben, aber nicht eigens getestet); Screenreader (Zeile als `role="status"`,
   Figur nur im Canvas).
6. **Schritt 3 zählt jede Einheit** (auch Werfer), die Zeile nennt Läufer; bei Tastenkürzel `2` zählt der Schritt trotzdem.

## 7. Offen für den PO
1. **Staffelung der Einführung (Abschnitt 2, Punkt 1):** bleibt sie, oder fällt sie ganz? Fällt sie, ist die Simulation neu zu messen.
2. **Freigabe nach `main`**, danach Veröffentlichung nach `MVP` (Regel in `CLAUDE.md`: nur auf Freigabe des PO). Tags kann ich nicht pushen; das Release `v0.8` legen Sie bei Bedarf auf GitHub an.
3. **Spieltest mit Menschen, die das Spiel nicht kennen** (`docs/testleitfaden-tutorial.md`). Erst dort zeigt sich, ob zwei Minuten Tutorial genügen.
4. Marken „neu“ je Partie oder je Browser (Auslegung 10).

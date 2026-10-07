# Klammerfront – Stand Tutorial „Erste Schritte“ (v0.8), Teil 1 und Teil 2

Grundlage: `docs/anforderungen-tutorial.md`. Branch: `tutorial` (von `main`, Commit `2211210`, v0.7).
Stand von Iteration 6: `docs/archiv/STAND-iteration-6.md`, Bericht `docs/bericht-iteration-6.md`.

**Starten:** `index.html` im Browser öffnen. Tutorial erzwingen: `?tutorial=1`, unterdrücken: `?tutorial=0`. Spieltest-Modus: `?debug=1`.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| T.0 | Anforderungen ablegen, Basislinie der Simulation sichern | T.06 | fertig |
| T.1 | Ereignisse und Schonfrist in `core.js` | T.03, T.06 | fertig |
| T.2 | `tutorial.js`, `data/tutorial-steps.js` | T.01, T.04, T.06 | fertig |
| T.3 | Quartiermeister, Hervorhebung, Start, Überspringen | T.02, T.04 | fertig |
| T.4 | Erstkontakt-Hinweise, Markierung „neu“ | T.05 | fertig |
| T.5 | Messung, Tests, Doku, Abnahme | T.07 | fertig |

**Teil 2** (`docs/anforderungen-tutorial-2.md`: Erzählung, Kartenabschluss, Startauswahl), Branch `tutorial` weiter:

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| T2.0 | Anforderungen ablegen, Ursache Startdialog | T2.01 | fertig |
| T2.1 | Startbildschirm mit Sprache, Grad, Tutorial-Schalter | T2.01 | fertig |
| T2.2 | Kern: Kriegsbeute, Ereignis Kartenwahl | T2.04 | fertig |
| T2.3 | Erzählung, Begrüßung, Kartenschritt, Abschied, Blasen, Figur | T2.02 – T2.07 | fertig |
| T2.4 | Tests, Protokoll, Doku, Testbuild | alle | fertig |

**Ursache REQ-T2.01 (Startdialog fehlte):** Commit `d2359a0` (T.3) ließ den Start in `boot()` bei fälligem Tutorial direkt `startGame(C.TUTORIAL.diff, { tutorial: true })`
aufrufen und überging damit `openStart()`; Sprache und Schwierigkeit waren in der ersten Partie nicht wählbar, die Partie lief immer auf Leicht. Das war eine Folge der
Vorgabe in REQ-T.02/T.03 („ohne Startseite“, „immer auf Leicht“), die Teil 2 korrigiert. Die Tests blieben grün, weil sie diesen Pfad gerade erwarteten
(`tests/browser-check.mjs`: „erste Partie startet ohne Dialog“).

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz        # beide Strategien, je 20 Partien Normal durchschnitt
node tools/bench-tick.mjs                   # Tick-Zeit mit 2 × 60 Einheiten
```

## Prüfergebnisse
- T.0: `npm test` 139/139. Neu `tests/unveraendert.test.mjs`: vier Partien (beide Strategien, Leicht bis Schwer, feste Seeds) mit den Werten
  aus v0.7; sie müssen nach jeder Tutorial-Änderung unverändert herauskommen (REQ-T.06).

- T.1: `npm test` 147/147 (neu `tests/hold.test.mjs`), Tick-Zeit Median 0,15 ms mit 120 Einheiten; die vier Partien aus T.0 liefern unverändert
  dieselben Werte. `core.js` bietet `on(fn)` für Ereignisse (`materialProduced`, `buildingBuilt`, `unitBought`, `waveDeparted`,
  `enemyWaveDefeated`) und eine Schonfrist: `newGame(…, { hold: { maxS, size } })`, `releaseHold(normalFirstWave)`, `holdActive()`;
  Zustand `S.hold` (im Spielstand, ohne Versionsänderung: fehlt er, gilt `null`). Ohne Zuhörer und ohne `hold` ändert sich nichts.
- T.2: `npm test` 158/158 (neu `tests/tutorial.test.mjs`: Schritte in Reihenfolge, vertauschte Reihenfolge, Zähler unabhängig vom aktuellen Schritt,
  Vorführung zählt nicht, Überspringen in jedem Schritt, Fehlklicks, Start/`?tutorial`, Speicher fehlt oder ist kaputt, Speichern und Laden,
  Texte in beiden Sprachen höchstens 60 Zeichen). `tutorial.js` hat keinen Zugriff auf Seite oder Fenster; Schritte in `data/tutorial-steps.js`.
- T.3: `npm test` 158/158, Browser-Prüfung 195/195 (bisherige Abläufe laufen mit `?tutorial=0`; die Prüfung „Hinweis zum Start“ entfällt mit dem
  Hinweis). Probelauf im Browser: ein direkt bedienender Spieler schließt alle fünf Schritte nach rund 40 s Spielzeit ab (Ziel ≤ 2:30 min).
  Neu `tutorial-ui.js` (Figur, Rahmen, Sprechblase, Randpfeil, Überspringen, Kamera), Knopf „Tutorial überspringen“ in der Leiste, „Tutorial
  wiederholen“ im Dialog „Neue Partie“. Der Dialog scrollt jetzt bei niedrigen Fenstern, „Spiel starten“ bleibt unten sichtbar.
- T.4: Hinweise: einer gleichzeitig, nie im Tutorial (Auslöser prüfen erst danach), schließen nach 8 s oder per Klick, eine Zeile (≤ 90 Zeichen, geprüft in
  `tests/hints.test.mjs`); neu: Mauer, Türme, Schmiede, Kontor (mit Zinsen), Nachbarschaft; gestrichen: Start, erste Welle (Tutorial). Marke „neu“ (`NewMarks` in
  `panels.js`): Reiter, Bau-Optionen, Einheiten; Grundlinie beim Start, „angesehen“ nach 1,5 s, Zustand im Spielstand.
- T.5: `npm test` 162/162; Browser-Prüfung 276 (neu: Tutorial-Ablauf in beiden Sprachen, vertauschte Reihenfolge, Überspringen in vier Schritten, zweiter Start,
  `?tutorial`, Hinweise, „neu“, Protokoll, Schritt 4 mit Kaserne). Kurzsimulation unverändert (9:09 / 6:13, je 100 %), Tick-Zeit 0,13 ms. Zwei bereits vorhandene,
  zufallsabhängige Prüfungen robust gemacht (Dauerauftrag bei „Welle vorziehen“, dieselbe Karte zweimal bei „Kartenwahl“).
- Ursache der zufälligen Fehlschläge der Prüfung „Zweiter Start im selben Browser“ gefunden: Chromium verlor den `localStorage` einer als `file://` geladenen Seite beim
  Neuladen gelegentlich vollständig (Messung: 1 von 12 Läufen, über HTTP 0 von 40; der Speicher war schon beim Start des neuen Dokuments leer). Das war kein Fehler im Spiel.
  Die Browser-Prüfung lädt die Seite deshalb jetzt über einen lokalen HTTP-Server (`tests/browser-check.mjs`). Zwei Läufe danach ohne Auffälligkeit.
- T2.1 – T2.4: `npm test` 175/175 (neu: Kriegsbeute und Ereignis „Karte gewählt“ in `tests/hold.test.mjs`, Schrittlogik mit Begrüßung, Kartenschritt und Abschied in
  `tests/tutorial.test.mjs`, Regressionstest „keine Partie ohne Startbildschirm“ in `tests/start.test.mjs`), Browser-Prüfung 315 (Startbildschirm, Voreinstellungen,
  Englisch und Schwer, Sprachwechsel im Tutorial, URL-Parameter, Durchlauf in beiden Sprachen mit Begrüßung, vier erzählten Schritten, Kriegsbeute, Kartenwahl,
  Abschied, Abgang, Protokoll, Bildschirmfoto bei 1280×720). Kurzsimulation unverändert (9:09 / 6:13, je 100 %), Tick-Zeit 0,13 ms; die vier Golden-Partien unverändert.
  Probelauf mit direkter Bedienung: Kartenwahl nach rund 38 s Spielzeit, Tutorial nach rund 42 s zu Ende (Ziel unter 3:00 min).
- Zufallsabhängig: Die Browser-Prüfung „Kaserne bauen aus dem Reiter Armee“ schlug in einem von vier Läufen fehl (der Lauf brach danach ab). In der Einzelausführung
  8 von 8 Läufen ohne Fehler; die Prüfung meldet jetzt gezogene Karten und Plätze, um die Ursache beim nächsten Auftreten zu finden.

- Korrektur Pause im Tutorial (Rückmeldung PO): `ui.js` pausiert bei verdecktem Tab und beim Laden nicht mehr, solange das Tutorial läuft (Browser-Prüfung 319). Offen bleibt die
  Kartenwahl, die das Spiel regelgemäß anhält (REQ-6.04 / v0.5).

## Auslegungen und Abweichungen Teil 2 (zur Zustimmung durch den PO)
Siehe `docs/bericht-tutorial-2.md`, Abschnitt 2.

## Auslegungen und Abweichungen Teil 1 (zur Zustimmung durch den PO)
Siehe `docs/bericht-tutorial.md`, Abschnitt 2 (15 Punkte). Wichtigste: (1) die gestaffelte Freischaltung bleibt, nur die Hinweistexte der Einführung entfallen;
(2) `exp/kartenpfad` und `exp/zeitalter` gibt es im Repository nicht; (3) „Menü“ ist der Dialog „Neue Partie“; (4) Version 0.8, Spielstand-Version unverändert.

## Pacing-Unterbau (KP.0, Vorarbeit für den Branch „Kartenpfad“)

Gemeinsamer Unterbau auf `main`, Standardmodus unverändert (Golden-Test `tests/unveraendert.test.mjs` grün, `tests/pacing.test.mjs` neu).

- Schalter `PACING_MODUS` (`config.js`, vorher `PACING_MODE`), im Spielstand `S.pacing`; `newGame(…, { pacing })` überschreibt ihn. Ohne Eintrag in `C.PACING` (Standard) ist nichts gesperrt.
- Freischaltlogik: `C.PACING[modus].gesperrt` (Schlüssel `bau:<gebäude>`, `einheit:<typ>`, `forschung:<id>`), geöffnet mit `unlockKey` (`S.unlocks`); wirkt auf `isBuildable`, `unitUnlocked`, `researchBlock` (Grund `closed`).
- Upgrade-Stufen: `C.PACING[modus].stufen` bindet den Kauf ab Stufe n an eine Quelle (Karte oder Forschung); `stageSource(id)`, `canBuy` prüft sie.
- Einheitenersatz: `replaceUnit(von, nach)` wertet Warteschlange und Einheiten auf dem Feld auf (nichts wird gelöscht, Lebenspunkte im selben Verhältnis); `spawn` erzeugt danach den Ersatztyp.
- Kein Spielstandformat geändert (neue Felder fehlen in älteren Ständen und fallen auf den Standard zurück), daher keine neue `SAVE_VERSION`.
- Der Spezifikation fehlte `docs/branch-konzepte-pacing.md` (§4.1); der Unterbau folgt den Angaben in `docs/anforderungen-kartenpfad.md` (Branch `exp/kartenpfad`).

Basislinie der Kartenwahlen im Standardmodus (Normal, 20 Partien je Zeile, `tools/baseline-wahlen.mjs`): Wahlen je Partie (Median) und erste Wahl:

| Strategie | Profil | Wahlen | erste Wahl | Dauer bis Sieg | Siegquote |
|---|---|---|---|---|---|
| gierig | aktiv | 4 | 76 s | 6,5 min | 100 % |
| gierig | durchschnitt | 7 | 85 s | 10,2 min | 95 % |
| gierig | gelegentlich | 7 | 86 s | 13,5 min | 55 % |
| einheiten-zuerst | aktiv | 3 | 76 s | 5,4 min | 100 % |
| einheiten-zuerst | durchschnitt | 3 | 76 s | 6,1 min | 100 % |
| einheiten-zuerst | gelegentlich | 3 | 77 s | 7,3 min | 100 % |

Befund: Im Standardmodus fallen nur 3 bis 7 Kartenwahlen je Partie an. Ein Pfad aus Karte und anschließender Forschung (zwei Schritte) braucht mehr Wahlen, als die Partie bietet; das gehört in den Bericht (Risiko „Zweistufiger Weg zur Einheit“, `anforderungen-kartenpfad.md` Abschnitt 5).

## MVP-Veröffentlichung (`docs/anforderungen-mvp-release.md`)

### R.0 Voraussetzungen (REQ-R.01), Befund vom 07.10.2026
| Frage | Befund |
|---|---|
| Tutorial Teil 1 und 2 auf `main`? | ja (v0.8, Berichte `docs/bericht-tutorial.md`, `docs/bericht-tutorial-2.md`) |
| Unterbau auf `main` (`5c2f57b`), Modus `standard` voreingestellt? | ja: `PACING_MODUS: 'standard'`, `C.PACING` ist leer |
| Anderer Modus auf `main` erreichbar? | Nein im öffentlichen Build: Es gibt keinen URL-Parameter für den Modus (`?pacing=` existiert nur im Branch). `newGame(…, { pacing })` ruft nur der Testcode auf. Ein Modus ohne Eintrag in `C.PACING` sperrt nichts, auch wenn jemand in der Konsole `PACING_MODUS` ändert. Der Unterbau ist damit ohne Wirkung. `KF_OVERRIDE` gilt nur in Node-Werkzeugen. |
| Sichtbarkeit und Pages-Quelle | Das Repository ist **öffentlich** (Sichtbarkeit `public`, `has_pages: true`). Die Quelle von GitHub Pages ließ sich aus dieser Umgebung nicht lesen (die Schnittstelle ist gesperrt). `CLAUDE.md` beschreibt als öffentliche Fassung den Branch `MVP` (Fast-Forward von `main`); das Anforderungsdokument nennt `main`. Beides führt zum selben Stand, solange `MVP` auf `main` zeigt. Offen: PO bestätigt in den Repository-Einstellungen (Pages) die Quelle. **Hinweis:** Auch der Branch `exp/kartenpfad` ist als Code öffentlich sichtbar, solange das Repository öffentlich ist; nicht veröffentlicht ist nur eine spielbare Seite. |

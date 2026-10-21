# Klammerfront – Projektkontext für Claude

## Was das ist
- Browser-Spiel zwischen *Universal Paperclips* (Clicker/Idle) und *Age of War* (Lane-Kampf).
- Spielziel: die gegnerische Basis zerstören. Niederlage: das eigene Tor fällt.
- Kernschleife: klicken und Fabriken im 3×3-Raster bauen → Material → Einheiten in Wellen über drei Lanes schicken → Abschüsse bringen EP → Stufenaufstieg bietet Spezialkarten (Kartenpfad: Doktrinen, Weiterentwicklungen, Haupthaus).
- Stand: v0.9.2-kartenpfad-8, Branch `exp/kartenpfad`. Änderungen: `CHANGELOG.md`; Branch-Stand: `docs/STAND-kartenpfad.md`.

## Der Nutzer
- Nick ist Product Owner, kein Entwickler. Änderungen in Klartext erklären, Fachbegriffe kurz übersetzen.
- Deutsch, knapp, Ergebnis zuerst. Schwache Ideen offen benennen.
- Weicht die Umsetzung von der Anforderung ab: begründen und nachfragen, nichts stillschweigend anders lösen.

## Arbeitsregeln
- Dokumente unter `docs/` nur lesen, wenn die Aufgabe sie nennt. Von `docs/STAND.md` nur den letzten Eintrag.
- Nur die betroffenen Codeabschnitte lesen (Zeilenbereiche unten), ganze Dateien nur wenn nötig.
- Keine Zahlen zu Balancing oder Regeln in `core.js`/`ui.js`: benannte Konstante in `config.js`.
- Keine sichtbaren Texte außerhalb von `i18n/de.js` und `i18n/en.js` (identische Schlüssel). Platzhalter `{n}`, Zahlen über `Intl.NumberFormat`. Textregeln und Zeichenbudgets: `tools/textbudget.mjs`, `tests/sprache.test.mjs`.
- `core.js` kennt weder `document`, `window` noch `localStorage`. Zufall nur über `S.rng` (seedbar).
- Jedes interaktive Element: `data-tooltip` und Erklärzeile `<span class="expl">` („Wirkung · Kosten“). Prüfung: `index.html?dev=1`, `__kf.explAudit()`. Gesperrte Knöpfe über `aria-disabled`.
- Spielstand-Format: `v` in `freshState` und `SAVE_KEY` zusammen erhöhen (aktuell 13).
- Modus `standard` bleibt unverändert (`tests/unveraendert.test.mjs`, feste Seeds nicht ohne Grund neu erzeugen).

## Branches
- Drei dauerhafte Linien: `main` (Hauptentwicklung), `MVP` (öffentlich spielbar, GitHub Pages `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/`), `exp/kartenpfad` (Experiment, vom PO weiterentwickelt, noch nicht in `main`).
- Bugfixes und Polish immer nach `main`. `MVP` enthält genau die neueste Release-Version: nur der PO gibt frei, dann `git push origin origin/main:MVP` (Fast-Forward) und Tag `v<VERSION>` (Tags lassen sich aus der Cloud nicht pushen: PO bitten, ein Release auf `MVP` anzulegen). Nie direkt auf `MVP` committen.
- Experimente in eigenen Branches. Vor dem Merge nach `main` zuerst `main` in den Experimental-Branch holen und dort testen. Nie direkt zwischen Experimental-Branches mergen.
- Bereits in `main` enthalten, lokal löschbar: `3x3-und-3-Lanes-Spiel`, `docs/claude-md-0.8.1`, `docs/mvp-release-r0`, `feat/protokollfelder`, `feat/tutorial-sprache`, `fix/sim-bot-raster`, `iteration-5`, `iteration-6`, `release/0.9`, `release/mvp-0.8.1`, `tutorial`, `unterbau`.

## Aufbau (kein Build-Schritt; Zeilen gerundet)
| Datei | Zuständigkeit | Zeilen |
|---|---|---|
| `index.html` | Markup und CSS, außer dem Titel kein sichtbarer Text | – |
| `config.js` | alle Zahlenwerte (Balancing, Regeln, Zeiten, Schwierigkeitsgrade) | 440 |
| `i18n/de.js`, `en.js` | alle sichtbaren Texte; Suffix `.karten` überschreibt im Modus karten | je 1070 |
| `data/draft-options.js` | Spezialkarten mit Stufen (`tiers`), deklarativ | 130 |
| `data/kartenpfad.js` | Technologie-/Wagniskarten und Forschungen; Listen `entfallen*` | 130 |
| `data/karten6.js`, `doktrinen.js`, `varianten.js` | Synergie-/Regelkarten, 13 Doktrinen, Gebäude-Varianten | 60 / 70 / 50 |
| `data/research.js`, `neighbors.js`, `tutorial-steps.js` | Forschungsbaum, Nachbarschaftsregeln, Tutorialschritte | 60 / 20 / 20 |
| `hints.js`, `tutorial.js` | Erstkontakt-Hinweise, Schrittlogik des Tutorials (ohne Seitenzugriff) | 30 / 110 |
| `core.js` | Spiellogik ohne Seitenzugriff, läuft auch im Simulator (Abschnitte unten) | 1920 |
| `ui.js` | lädt zuerst: Namen (C, G, $, t, fmt), Tooltips, Eingabe, Speichern, Dialoge, Hauptschleife | 810 |
| `render.js` | Spielwelt: Canvas, Kamera, Zeichnen | 320 |
| `hud.js` | Ressourcenleiste (oberes Band), EP-Fortschritt | 130 |
| `panels.js` | Arbeitsbereich (unteres Band): Reiter, Kontextkopf, Kartenwahl, Forschung | 920 |
| `stage.js` | Kartenbühne und Kartenfläche (Austeilen, Aufdecken, Kartensymbol) | 280 |
| `discover.js` | Sichtbarkeit „erst wenn nutzbar“ (Tabelle „sichtbar ab“) | 90 |
| `tutorial-ui.js` | Anzeige des Tutorials (Quartiermeister, Rahmen, Blase, Kamera) | 280 |
| `session.js` | Sitzungsprotokoll für Spieltests (`?debug=1`) | 145 |
| `tools/`, `tests/` | Simulation, Bots, Messung; `*.test.mjs` (Node) und `browser-*.mjs` (Playwright) | – |

`core.js` nach Zeilen: 85 Spielstand (`freshState`) · 132 Draft-Modifikatoren · 182 Kategorien/Synergie · 213 Pacing, Freischaltung · 270 abgeleitete Werte · 562 Aktionen (Bauen, Kaufen) · 615 Aufwertung · 663 Haupthaus · 712 Handelshaus · 748 Formationen · 767 Armee · 875 Wellen · 1057 Einzelsimulation · 1180 Armee-Zustände · 1366 EP-Stufen und Draft · 1571 Forschung · 1741 `tick` · 1847 `newGame`, Laden.

## Befehle
- **Standard:** `npm run test:kurz` (alle Tests, nur Punkte und Fehler mit Name und Meldung), `npm run sim:kurz` (Kurzsimulation, nur Kennzahlen).
- Ausführlich: `npm test`; Browser: `npm run test:browser` (braucht Playwright, „übersprungen“ gilt nicht als bestanden).
- Simulation: `node tools/simulate.mjs --runs 20 --suite ziele|strategie`, `--runs 50 --suite phasen` (Abnahme: 200). Ohne Dateiänderung: `KF_OVERRIDE='{"POST_SIEGE_GROWTH":0.5}' node tools/simulate.mjs …`.
- Kartenpfad: Messung `node tools/messung-p6.mjs`, `tools/sim-p5.mjs --suite felder|budget|doktrin`, Auswertung `tools/basis-p8.mjs`, Protokoll `tools/ep-protokoll.mjs`, Bench `tools/bench-tick.mjs`.
- URL: `?debug=1` (Protokoll), `?dev=1` (Audits), `?lang=`, `?difficulty=easy|normal|hard`, `?tutorial=0|1`, `?pacing=standard|karten`, `?druck=hoch`, `?gegnerfern=aus`, `?zeit=pause|langsam|lauf`, `?buehne=`, `?entdecken=`.

## Teststufen
| Stufe | Umfang | Einsatz |
|---|---|---|
| 1 – schnell | betroffene Testdateien + Start ohne Konsolenfehler | Texte, Tooltips, kleine UI-Korrekturen |
| 2 – Standard | `npm test` komplett + Kurzsimulation (nur Kennzahlen) | normale Inkremente |
| 3 – voll | Stufe 2 + `npm run test:browser` + Vergleichssimulation + `bench-tick` | Merges, Releases, Balancing |

- Die Stufe nennt der PO in der Anforderung; ohne Angabe gilt Stufe 2. Merges und Pushes nach `main`: Stufe 3, außer der PO weist anderes an.
- Bei Stufe 3 muss Playwright laufen; „übersprungen“ = nicht bestanden.
- Einmal am Ende des Inkrements testen, nicht nach jeder Teiländerung. Bei Fehlschlag nur den betroffenen Test wiederholen, bis er grün ist, danach die Stufe einmal komplett.
- Hält Claude die Stufe für zu niedrig: begründen und nachfragen, nicht selbst anheben.
- Stufenunabhängig: neue Texte in `de` und `en`, neue Knöpfe mit Tooltip und Erklärzeile, Commit `<Teil>.<Inkrement>: <Inhalt>`, `docs/STAND.md` bzw. `docs/STAND-kartenpfad.md` aktualisiert.
- Balancing-Ziele (Patt-Quote ≤ 2 %, Siegquoten, Dauer) und Messwerte nur berichten, nicht automatisch wegbalancieren.

## Abschluss eines Entwicklungsgangs
Ein Entwicklungsgang ist ein Auftrag des PO an Claude Code (meist ein Anforderungsdokument, eine Session).
- **Spielbar:** Das Spiel startet über `index.html` ohne Konsolenfehler, eine Partie lässt sich beginnen und beenden. Alles ist committet und auf den Arbeitsbranch gepusht, kein halbfertiger Zustand. Wird das Kontingent knapp: Funktionsumfang kürzen, nicht die Spielbarkeit; Unfertiges per Schalter deaktivieren und im Testbericht nennen.
- **Testbericht** `docs/berichte/test-<version>.md`, höchstens ca. 40 Zeilen: Version, Branch, Commit · Umgesetzt (REQ, je ein Satz) · Teststufe und Ergebnis · Nicht getestet · Abweichungen mit Begründung · Bekannte Probleme · Manuell zu prüfen (3–8 Schritte mit URL-Schaltern, z. B. `?difficulty=hard&tutorial=0`).
- **Abgrenzung:** Der Testbericht ist das Übergabedokument an den PO. Der Eintrag in `docs/STAND.md` ist eine Zeile mit Verweis darauf. Der Iterationsbericht `docs/bericht-iteration-<n>.md` (Ergebnis in drei Sätzen, Entscheidungen des PO, Abweichungen, Abnahmetabelle, Kennzahlen, Auffälligkeiten, offene Punkte; Rohdaten unter `reports/`) entsteht nur am Ende einer Iteration und verweist auf die Testberichte.
- Spielstand-Version geändert: im Bericht und `CHANGELOG.md` vermerken (Spieler verlieren den Spielstand).

## Spielregeln, die man kennen muss
- **Patt-Schutz (nicht ohne Simulation entfernen):** Belagerung blockiert Gegnerwellen; Notaufgebot bei 2/3 und 1/3 Basis; Belagerungswelle Minute 16 (dreifach), danach `POST_SIEGE_GROWTH`; Reparatur höchstens alle `REPAIR_COOLDOWN_S`; Gegner im Feld begrenzt (`maxField`); Vorrang der Mitte im Armeemodell.
- **Armee** (`S.forms`): eine Gruppe je Welle über alle Lanes, älteste = Armee. Zustände Marsch → Kampf → Sammeln. Gegen Pendeln (`tests/pendel.test.mjs`): Mindestverweildauer, feste Plätze, Ziel-Lane gebunden. Gekämpft wird je Einheit (`resolveCombat`).
- **Tutorial:** `core.js` kennt es nur über Ereignisse (`G.on`) und die Schonfrist (`hold`); Schritte nur in `data/tutorial-steps.js`; `startGame` nur vom Startdialog und den URL-Parametern.
- **Kartenbühne:** Wirkungszeile `kp.eff.<id>` (Pflicht je Karte), bei Nachteil `kp.drawback.<id>`; Klick in der Pause erzeugt nichts.
- **Modus karten** (`PACING_MODUS`, `S.pacing`): Freischaltung über Karten und Forschungen (`schaltetFrei` in `data/kartenpfad.js`, nur dort ergänzen); Wahl fällig bei EP-Schwelle (`KARTEN.schwellen`), Mindestabstand 45 s; Partiedauer nur über `KARTEN.basisFaktor`; Haupthaus (Fabrikgrenze 3/4/5, Flügel); Weiterentwicklungen höchstens zwei je Gebäude; Doktrinen höchstens zwei je Partie mit bindender Einschränkung.
- **Aus (Hebel vorhanden):** `KARTEN.uebertrag` und `KARTEN.budget.abnahme` (schwächen die Bots). Gegner-Reichweite höchstens Turm-Grundreichweite + eine Stufe (`baseRange`).

# Klammerfront – Projektkontext für Claude

## Was das ist
Browser-Spiel zwischen *Universal Paperclips* (Clicker/Idle-Ökonomie) und *Age of War* (Lane-Kampf).
Der Spieler klickt, baut Fabriken im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Material bezahlt Einheiten,
Gebäude und Upgrades. Abschüsse bringen Erfahrungspunkte (EP), die nur als Erfahrung zählen. Jeder Stufenaufstieg bietet Spezialkarten
(2, mit Universität 3), die bis zu drei Stufen haben. Die Partie ist verloren, wenn das Tor fällt.

Branch `exp/kartenpfad` (Experiment, nicht auf `main`/`MVP`): v0.9-kartenpfad, Karten steuern das Pacing (Abschnitt „Kartenpfad“ unten, `docs/anforderungen-kartenpfad.md`, `docs/STAND.md`).
Stand von `main`: v0.8 (Tutorial „Erste Schritte“: `docs/anforderungen-tutorial.md`, Stand je Inkrement in `docs/STAND.md`, Bericht in `docs/bericht-tutorial.md`).
Vorher v0.7 (Iteration 6: `docs/anforderungen-iteration-6.md`, `docs/bericht-iteration-6.md`). Frühere Iterationen: `docs/archiv/`.

## Der Nutzer
Nick ist Product Owner, kein Entwickler. Erkläre Änderungen in Klartext und übersetze Fachbegriffe kurz.
Kommunikation auf Deutsch, knapp, Ergebnis zuerst. Schwache Ideen offen benennen.
Weicht eine Umsetzung von einer Anforderung ab: begründen und nachfragen, nichts stillschweigend anders lösen.

## Aufbau (kein Build-Schritt, keine Abhängigkeiten)
| Datei | Inhalt |
|---|---|
| `index.html` | Markup und CSS. Enthält außer dem Titel keinen sichtbaren Text. |
| `config.js` | **Alle** Zahlenwerte (Balancing, Regeln, Tooltip-Zeiten, Schwierigkeitsgrade). |
| `data/draft-options.js` | Spezialkarten mit Stufen (`tiers`), deklarativ. Neue Karten nur hier ergänzen. |
| `data/research.js` | Forschungsbaum der Universität, deklarativ; Wirkungen über dieselbe Pipeline wie Karten. |
| `data/kartenpfad.js` | Branch Kartenpfad: Pfadkarten (Bau, Technologie, Wagnis) und ihre Forschungen, deklarativ; daraus leitet `core.js` Sperren und Upgrade-Stufen ab. |
| `stage.js` | Branch Kartenpfad: Kartenbühne in der Bildmitte und Stapel (`Stage`). |
| `data/neighbors.js` | Nachbarschaftsregeln im 3×3-Raster, je Gebäudetyp eine, nur orthogonal. |
| `data/tutorial-steps.js` | Schritte des Tutorials, deklarativ (Ereignis, Schwellenwert, Ziel, Vorführung, Text-Schlüssel). |
| `hints.js` | Erstkontakt-Hinweise; Speicher wird von außen übergeben (testbar ohne Browser). |
| `tutorial.js` | Schrittlogik des Tutorials ohne Seitenzugriff; hört auf Ereignisse aus `core.js` (`G.on`), Speicher von außen. |
| `core.js` | Spiellogik ohne Zugriff auf Seite, Fenster oder Speicher. Läuft auch im Simulator. |
| `ui.js` | Lädt zuerst: gemeinsame Namen (C, G, $, t, fmt), Tooltips, Eingabe, Speichern, Dialoge, Hauptschleife, Start. |
| `render.js` | Spielwelt: Canvas, Kamera, Zeichnen, `screenToWorld`. |
| `hud.js` | Ressourcenleiste (oberes Band). |
| `panels.js` | Arbeitsbereich (unteres Band): Klickfeld, Reiter, Kontextkopf, Kartenwahl, Forschung. |
| `tutorial-ui.js` | Anzeige des Tutorials: Quartiermeister im Canvas, pulsierender Rahmen, Sprechblase, Randpfeil, Überspringen, Kamera. |
| `session.js` | Sitzungsprotokoll für Spieltests (`?debug=1`), mit Tutorial-Feldern. |
| `i18n/de.js`, `i18n/en.js` | Alle sichtbaren Texte. Schlüssel müssen identisch sein. |
| `tools/simulate.mjs` | Balancing-Simulation mit Bots (Worker-Threads). |
| `tools/sim-bot.mjs` | Bot-Strategien `zufall`, `gierig` (Vorausschau per Kopie des Spielstands) und `einheiten-zuerst` (aus `browser-bot.js`). |
| `tools/sim-metrics.mjs` | Kennzahlen je Takt (Richtungswechsel). |
| `tools/compare-human.mjs` | Ordnet Sitzungsprotokolle von Menschen dem nächstliegenden Bot-Profil zu. |
| `tools/browser-bot.js` | Bot „Einheiten zuerst“: Durchlauftest, Protokollprüfung und zweite Simulationsstrategie (REQ-6.09). |
| `tools/sim-karten.mjs` | Kurzsimulation des Branches Kartenpfad (Pfad-Varianten, Profile, Paarvergleich je Pfadkarte). |
| `tools/sprachliste.mjs` | Wortliste des Sprach-Audits (`tests/sprache.test.mjs`). |
| `tools/bench-tick.mjs` | Tick-Zeit mit 2 × 60 Einheiten. |
| `tests/` | `npm test` (Node-eigener Test-Runner), optional `npm run test:browser` (braucht Playwright). |
| `docs/STAND.md` | Stand je Inkrement, Prüfergebnisse, Abweichungen und Auslegungen. |

Regeln:
- Keine Zahlen in `core.js`/`ui.js`, die Balancing oder Regeln betreffen. Neue Werte als benannte Konstante in `config.js`.
- Keine sichtbaren Texte außerhalb der Sprachdateien. Platzhalter wie `{n}`, `{percent}`; Zahlen über `Intl.NumberFormat`.
- `core.js` darf nicht auf `document`, `window`, `localStorage` zugreifen.
- Zufall nur über den seedbaren Generator im Spielstand (`S.rng`), damit Simulationen reproduzierbar sind.
- Jedes interaktive Element braucht `data-tooltip`. Prüfung: `index.html?dev=1` meldet fehlende Tooltips in der Konsole.
- Jeder Knopf braucht eine Erklärzeile `<span class="expl">` mit „Wirkung · Kosten“ (REQ-20.1). Neue UI-Elemente bekommen sie sofort.
  Prüfung: `__kf.explAudit()` bzw. `index.html?dev=1`.
- Gesperrte Knöpfe über `aria-disabled`, nicht `disabled` (sonst erscheinen keine Tooltips).
- Spielstand-Format hat eine Versionsnummer (`v` in `freshState`, `SAVE_KEY`). Bei inkompatiblen Änderungen beide erhöhen.

## Balancing
Nach jeder Änderung an Zahlen oder Regeln:
```
npm test
node tools/simulate.mjs --suite kurz                  # Kurzsimulation (Anhang A): 20 Partien Normal
node tools/simulate.mjs --runs 20 --suite ziele       # Siegquoten, Dauer, Patt-Quote, Karten-Differenz, reine Verteidigung
node tools/simulate.mjs --runs 20 --suite strategie   # Gebäude, Draft-Wahlraten, Draft-Abstände
node tools/simulate.mjs --runs 50 --suite phasen      # Klickanteile je Phase (für die Abnahme: --runs 200)
```
Für Versuche ohne Dateiänderung: `KF_OVERRIDE='{"POST_SIEGE_GROWTH":0.5}' node tools/simulate.mjs …`.
Patt-Quote (offen nach 30 Minuten) höchstens 2 %. Der Bot „verteidigung“ (kauft keine Einheiten) gewinnt nie und
verliert spätestens in Minute 25. „aktiv“ gewinnt je Schwierigkeitsgrad mindestens so oft wie „durchschnitt“. Die Simulation misst Stärke, nicht Spielspaß:
Auffälligkeiten berichten, nicht automatisch wegbalancieren.

Zielkorridore (Median bis zum Sieg, Bot-Spielertypen siehe `tools/sim-bot.mjs`):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 5–7 min | 6–9 min | Sieg, 10–18 min | darf verlieren |
| Normal | 6–9 min | 9–13 min | darf verlieren | verliert |
| Schwer | 8–12 min | 13–20 min | verliert | verliert |

Weitere Zielwerte (Iteration 2): erster Draft nach 60–90 s; Median-Abstand zwischen Drafts je Phase 45–150 s;
Klickanteil bei 6 Klicks/s: Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %; Draft-Wahlrate je Option 5–60 %.
Iteration 3: Partien ohne Schmiede gewinnen auf Normal mindestens 30 % (`--suite ohneSchmiede`). Karten, deren Siegquote-Differenz
über +25 Prozentpunkten liegt, werden berichtet, nicht automatisch abgeschwächt.
Iteration 4: Vergleichswert einer Karte ist „angeboten und nicht gewählt“ (je Stufe); Bots spielen mit gestaffelter Einführung
(`KF_SKIP_INTRO=1` schaltet sie ab).
Iteration 5: Profilabstand Leicht aktiv ↔ gelegentlich (Median) ≥ 4 min; Schwer gelegentlich ≤ 5 % Siege; Anteil der EP-Automatik (Hörsaal III)
≤ 25 % des EP-Ertrags eines aktiven Spielers auf Normal; Forschungen wie Karten ≤ +25 pp; Zeitanteil der Armee im Kampf berichten.
Offene Partien gibt die Simulation mit Seed aus (Nachspielen: `playGame` aus `tools/sim-bot.mjs`).
Iteration 6: Die Suiten `ziele`, `kurz` und `ohneSchmiede` spielen beide Strategien (`gierig`, `einheiten-zuerst`) mit denselben Seeds und
berichten sie nebeneinander (`--strategy` schränkt ein). Neue Kennzahlen: Richtungswechsel (≤ 2 je Einheit und Sekunde), Partielänge
(90. Perzentil der Siege ≤ 20 min), ungenutztes Material, Forschungstempo. Deckel der passiven EP jetzt 35 % (PO).
Keine globale Neukalibrierung vor Iteration 7.

## Mechaniken gegen Patts (nicht ohne Simulation entfernen)
- Belagerung: Eigene Einheiten am gegnerischen Tor blockieren reguläre Gegnerwellen in dieser Lane.
- Notaufgebot: Fällt die gegnerische Basis unter 2/3 bzw. 1/3, schickt der Gegner sofort Reserven.
- Belagerungswelle in Minute 16 (dreifache Größe), danach +`POST_SIEGE_GROWTH` Gegnerstärke je Minute, linear.
- Reparatur je Abschnitt höchstens alle `REPAIR_COOLDOWN_S` Sekunden (sonst hält reine Verteidigung auf Leicht bis Minute 30).
- Gegnerische Einheiten auf dem Feld sind begrenzt (`maxField`); die Belagerungswelle rückt immer vollständig aus.
- Entfernt in I4.2 (Simulation ohne sie: 0–2 % Patts): Belagerung als Stärke je Einheit, Nachskalieren der Gegner im Feld.
- Vorrang der Mitte im Armeemodell (I5.7): Einheiten in der Mitte helfen einer äußeren Lane nur, wo eigene Einheiten schon kämpfen;
  die Lage einer Lane zählt auch Einheiten, die gerade in sie wechseln. Ohne das tauschen zwei Armeen endlos die Lanes (Patt).

## Tutorial (REQ-T.01 – T.07)
Vor jeder neuen Partie erscheint der Startbildschirm (Sprache, Schwierigkeitsgrad, Schalter Tutorial; erste Partie: Leicht „empfohlen“ und Tutorial an, Merker `TUTORIAL_KEY`,
`DIFFICULTY_KEY`). `startGame` wird nur vom Dialog und von den URL-Parametern `?lang=` / `?difficulty=easy|normal|hard` aufgerufen (`tests/start.test.mjs`); `?tutorial=1|0` schaltet
das Tutorial. Das Tutorial läuft auf jedem Grad. Ablauf: Begrüßung (2 Blasen), Klicken, Fabrik, Armee, Welle, Kampf (ohne Blase), Karte, Abschied (2 Blasen), Abgang.
`core.js` kennt das Tutorial nicht, nur zwei Dinge: Ereignisse für Zuhörer (`G.on`: `materialProduced`, `buildingBuilt`, `unitBought`, `waveDeparted`,
`enemyWaveDefeated`, `cardChosen`, `xpBounty`) und die Schonfrist (`newGame(…, { hold: { maxS, size, bounty } })`, `releaseHold`, Zustand `S.hold`: erste Gegnerwelle klein und
zurückgehalten; `S.firstBounty`: Kriegsbeute, nach der ersten besiegten Welle reichen die EP für die erste Kartenwahl). Ohne
Zuhörer und ohne `hold` ändert sich nichts; `tests/unveraendert.test.mjs` hält das mit festen Seeds fest (nicht ohne Grund neu erzeugen).
Regeln: je Schritt Erzählung (höchstens etwa 90 Zeichen) und Auftrag (höchstens etwa 30); Begrüßung und Abschied je zwei Blasen; Texte je Pacing-Modus überschreibbar (Schlüssel mit Suffix, `PACING_MODUS`); Hinweise (`hints.js`) höchstens 90 Zeichen, einer gleichzeitig, nie im Tutorial, schließen nach
`UI.hintAutoMs`; das Tutorial wechselt nie selbst den Reiter und sperrt nichts. Neue Schritte nur in `data/tutorial-steps.js` (höchstens fünf Dinge).

## Armee und Kampf (REQ-5.05, REQ-5.06)
Jede Welle bildet eine Gruppe über alle Lanes (`S.forms`); die älteste Gruppe einer Seite ist die Armee (`main`), spätere sind Nachschub.
Alle Lanes einer Gruppe teilen die Front `x`. Je Lane vorn Nahkämpfer in Reihen zu höchstens `FORMATION_ROW_MAX`, dahinter Fernkämpfer.
Zustände: Marsch (Tempo der langsamsten Einheit, Nachschub × `ARMY.catchUpFactor`) → Kampf (Gegner, Mauer oder Basis in `ARMY.contactRange`,
die Gruppe hält) → Sammeln (nichts mehr in `contactRange + contactHysteresis`; alle zurück in die Heimat-Lane, höchstens `regroupTimeoutS`) → Marsch.
Im Kampf gehen Einheiten ohne Gegner in ihrer Heimat-Lane in die kämpfende Lane (Mitte zuerst, dann die mit den meisten Gegnern, dann oben).
Fällt die letzte Einheit der Mitte, geben die äußeren Lanes ein Drittel der Armee ab (Nahkämpfer zuerst). Der Gegner nutzt denselben Code.
Gekämpft wird je Einheit (`resolveCombat`): eigenes Ziel (nächster Gegner der aktuellen Lane in Reichweite, Gleichstand → niedrigste Id),
eigene Abklingzeit mit zufälligem Versatz und Streuung (`COMBAT`), alle Angriffe eines Ticks gleichzeitig.
Gegen Pendeln (I6.1, nicht ohne Test `tests/pendel.test.mjs` ändern): Mindestverweildauer je Zustand (`ARMY.minStateS`), feste Plätze (`slot`),
Ziel-Lane bis zur Ankunft gebunden, danach `ARMY.minLaneStayS`, Querplatz gleitend (`lateralOf`). Transiente Daten (Ziele, vorderste Reihe) liegen in Closure-Maps, nicht im Spielstand.

## Arbeitsweise in Inkrementen
Ein Inkrement ist fertig, wenn: das Spiel über `index.html` ohne Konsolenfehler startet; `npm test` und `npm run test:browser`
grün sind; die Kurzsimulation keine offene Partie und eine Siegquote von 20–100 % zeigt; neue Texte in `de` und `en` liegen und
neue Knöpfe Tooltip und Erklärzeile haben; der Commit `I<Iteration>.<Inkrement>: <Inhalt>` heißt und `docs/STAND.md` aktualisiert ist.

## Abschluss einer Iteration
Bericht `docs/bericht-iteration-<n>.md` mit: Ergebnis in drei Sätzen, Entscheidungen des PO, Abweichungen und Auslegungen
(zur Bestätigung), Tabelle der Abnahmekriterien mit Ergebnis, Kennzahlen der Serie, Auffälligkeiten (berichtet, nicht
wegbalanciert), offene Punkte für den PO. Rohdaten der Simulation unter `reports/`.

## Veröffentlichung (Branch `MVP`)
Der Branch `MVP` ist die öffentlich spielbare Fassung (GitHub Pages, `https://ludwigfunbeathoven.github.io/Little-Strategy-Game/`).
Er enthält immer genau die neueste Release-Version, nichts dazwischen.
- Ein Release entsteht nur, wenn der PO eine Iteration nach `main` freigibt. Danach `MVP` per Fast-Forward auf denselben Commit wie `main`
  setzen (`git push origin origin/main:MVP`) und den Stand mit der Versionsnummer markieren (Tag `v<VERSION>`, z. B. `v0.7`).
  Tags lassen sich aus der Cloud-Umgebung nicht pushen: dann den PO bitten, auf GitHub ein Release mit diesem Tag auf `MVP` anzulegen.
- Nie direkt auf `MVP` committen, nie Zwischenstände oder Arbeitsbranches dorthin schieben. Ein dringender Fehler geht über `main`
  (Patch-Version, z. B. 0.7.1) und dann wie oben nach `MVP`.
- Vor dem Release: alle Prüfungen aus „Arbeitsweise in Inkrementen“ grün. Ändert sich `SAVE_VERSION`, verlieren Spieler ihren Spielstand:
  im Bericht und im CHANGELOG vermerken.
- Das Sitzungsprotokoll ist öffentlich aus; Spieltests hängen `?debug=1` an die Adresse.

## Bekannte offene Punkte
Siehe Abschnitt „Offen“ in `docs/bericht-tutorial.md` und `docs/bericht-iteration-6.md`.

## Kartenpfad (Branch `exp/kartenpfad`, REQ-KP.01 – KP.09)
- Schalter `PACING_MODUS` (`config.js`; auf dem Branch `karten`, auf `main` `standard`), im Spielstand `S.pacing`; `?pacing=standard|karten`. Im Modus `standard` ist nichts gesperrt und das Ergebnis der Simulation mit gleichem Seed identisch zu `main`
  (`tests/unveraendert.test.mjs`). `tools/load-core.mjs` lädt im Standardmodus, außer `KF_PACING=karten`.
- Freischaltlogik in `core.js`: Schlüssel `bau:<gebäude>`, `einheit:<typ>`, `forschung:<id>` (`isOpen`, `unlockKey`), Upgrade-Stufen mit Quelle (`stageSource`), Einheitenersatz (`replaceUnit`, `ownType`). Die Quelle steht nur an der Karte oder Forschung
  (`schaltetFrei` in `data/kartenpfad.js`); es gibt keine zweite Liste. Neue Pfadkarten und Forschungen nur dort ergänzen (Texte `kp.card.*`, `kp.res.*`).
- Angebot im Modus karten: `drawOptionsKarten` (Meilenstein-Platz, mindestens eine Bonuskarte, höchstens eine Wagnis-Karte, Rückstandsgewicht, harte Grenze `KARTEN.maxWarten`), Mindesttempo `KARTEN.maxAbstand`. Zahlen in `config.js` (`KARTEN`).
- Kartenbühne (`stage.js`): `UI.kartenbuehne` (`null` = nach Modus), URL `?buehne=1|0`; `KARTENBUEHNE.zeit` (`pause` Standard). Sprach-Audit: Schlüssel mit Präfix `tut.` und `kp.` dürfen die Wörter aus `tools/sprachliste.mjs` nicht enthalten.
- Bots wählen Pfadkarten und Pfadforschung (`KF_BROWSER_BOT.pfadPick`, `pfadResearch`); `node tools/sim-karten.mjs --runs 50 --suite varianten|profile|paar` (Rohdaten unter `reports/kartenpfad-*`). Im Modus karten gibt der Simulations-Bot bei vollem Raster kein Material
  mehr zurück (im Standardmodus bleibt das ursprüngliche Verhalten für die Vergleichswerte; siehe Bericht).

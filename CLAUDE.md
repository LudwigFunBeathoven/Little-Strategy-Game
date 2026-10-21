# Klammerfront – Projektkontext für Claude

## Was das ist
Browser-Spiel zwischen *Universal Paperclips* (Clicker/Idle-Ökonomie) und *Age of War* (Lane-Kampf).
Der Spieler klickt, baut Fabriken im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Material bezahlt Einheiten,
Gebäude und Upgrades. Abschüsse bringen Erfahrungspunkte (EP), die nur als Erfahrung zählen. Jeder Stufenaufstieg bietet Spezialkarten
(2, mit Universität 3), die bis zu drei Stufen haben. Die Partie ist verloren, wenn das Tor fällt.

Branch `exp/kartenpfad` (Experiment, nicht auf `main`/`MVP`): v0.9.2-kartenpfad-8, Haupthaus mit Obergrenze für Fabriken und Flügeln, Weiterentwicklungen (höchstens zwei Stufen je Gebäude), historische Namen, Grundausstattung ab Start, Doktrinen mit Zufallsfaktor, Kategorien und Synergiekarten, Pacing aus dem Spielfluss (Abschnitte „Kartenpfad“, „Teil 5“, „Teil 6“ und „Teil 7“ unten, `docs/anforderungen-kartenpfad.md`, `-2.md` bis `-7.md`, `docs/STAND-kartenpfad.md`, Berichte `docs/bericht-kartenpfad-3.md` bis `-7.md`, Testleitfäden `docs/testleitfaden-kartenpfad-5.md` bis `-7.md`). `main` 0.9.2 ist eingemischt.
Stand der Linie `main`: v0.9.2 (Kartenbühne und Entdecken: `docs/anforderungen-kartenpfad-2.md`, `docs/bericht-ui-0.9.md`, Testleitfaden `docs/testleitfaden-ui-0.9.md`). Vorher v0.8.1 (MVP-Veröffentlichung: `docs/anforderungen-mvp-release.md`, `docs/bericht-mvp-release.md`; Tutorial „Erste Schritte“: `docs/anforderungen-tutorial.md`, Stand je Inkrement in `docs/STAND.md`, Bericht in `docs/bericht-tutorial.md`).
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
| `data/varianten.js` | Branch Kartenpfad, Teil 4 bis 6: die Gebäude-Varianten (Grundvarianten und Sonderbauten von Fabrik, Kaserne, Schmiede), deklarativ, je mit Kategorie `kat`. Strategielinien und Zeichen gibt es seit Teil 6 nicht mehr. Werte der Aufwertung in `config.js` (`AUFWERTUNG`). |
| `data/karten6.js` | Branch Kartenpfad, Teil 6: Karten nur im Modus karten (Feld `nurKarten`): sechs übernommene Regeln der früheren Linienstufen, acht Synergiekarten (Zähler, Verstärker, Brücke), Turmschule und Stachelwall (Ausbauten als Karten). |
| `data/doktrinen.js` | Branch Kartenpfad, Teil 5: die dreizehn Doktrinen (sechs aus Teil 5, sieben aus Teil 6) mit Kategorie, Effekt, Sonderbau, Einschränkung und Angebotsbedingung, deklarativ (`KF_DOKTRINEN`, Parameter in `config.js`, `DOKTRIN`). |
| `data/kartenpfad.js` | Branch Kartenpfad: Pfadkarten (seit Teil 5 nur Technologie und Wagnis) und ihre Forschungen, deklarativ; `entfallenKarten` und `entfallen` nennen, was im Modus karten fehlt. `core.js` leitet daraus Sperren und Upgrade-Stufen ab. |
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
| `discover.js` | Sichtbarkeitsregel „nur, was jetzt nutzbar ist“ (`Disc`): Tabelle „sichtbar ab“, Einblenden, Hinweise je Entdeckungsmoment. Reine Anzeige. |
| `stage.js` | Kartenwahl als Bühne (`Stage`): Austeilen, Aufdecken, Flug zum Wirkort, Kartensymbol in der Leiste. Reine Anzeige. |
| `tutorial-ui.js` | Anzeige des Tutorials: Quartiermeister im Canvas, pulsierender Rahmen, Sprechblase, Randpfeil, Überspringen, Kamera. |
| `session.js` | Sitzungsprotokoll für Spieltests (`?debug=1`), mit Tutorial-Feldern. |
| `i18n/de.js`, `i18n/en.js` | Alle sichtbaren Texte. Schlüssel müssen identisch sein. |
| `tools/simulate.mjs` | Balancing-Simulation mit Bots (Worker-Threads). |
| `tools/sim-bot.mjs` | Bot-Strategien `zufall`, `gierig` (Vorausschau per Kopie des Spielstands) und `einheiten-zuerst` (aus `browser-bot.js`). |
| `tools/sim-metrics.mjs` | Kennzahlen je Takt (Richtungswechsel). |
| `tools/compare-human.mjs` | Ordnet Sitzungsprotokolle von Menschen dem nächstliegenden Bot-Profil zu. |
| `tools/browser-bot.js` | Bot „Einheiten zuerst“: Durchlauftest, Protokollprüfung und zweite Simulationsstrategie (REQ-6.09). |
| `tools/basis-p7.mjs` | Branch Kartenpfad, Teil 7: Auswertung einer Messreihe (`--prefix kartenpfad7-basis|kartenpfad7`): Fabrikplätze, Belegung, Nachbarschaft, Weiterentwicklungen, Dauer, Spannweite, Patt, Haupthaus. |
| `tools/messung-p6.mjs` | Branch Kartenpfad, Teil 6: Messreihen (`--set kategorien|ohne|doktrin|alle`): ruft `tools/sim-p5.mjs` auf und legt Text und Rohdaten unter `reports/kartenpfad6-*` ab. |
| `tools/testspiele.mjs` | Testspiele ohne Browser mit Invarianten-Prüfung in jedem Takt (Material, EP, Einheiten im Feld, Mauer, Angebote, Determinismus, Laden); auch gegen einen Checkout von `main`. |
| `tools/testspiel-browser.mjs` | Testspiel in der echten Oberfläche (Playwright): Konsolenfehler, Tooltip-Inhalte und sichtbare Texte (rohe Schlüssel, undefined, NaN, Platzhalter), Audits, Speichern/Laden, Sprachwechsel. |
| `tools/bedienelemente.mjs` | Branch Kartenpfad, Teil 6: Zahl der sichtbaren Bedienelemente bei Minute 1 und 10 (Playwright). |
| `tools/sim-p5.mjs` | Branch Kartenpfad, Teil 5 und 6: Messung je Feld (`--suite felder`: Siegquote, Dauer, Wahlen, längste Lücke, EP je Quelle), Forschungsbudget (`--suite budget`), Doktrinen im Paarvergleich (`--suite doktrin`). |
| `tools/kalibrieren-p5.mjs` | Branch Kartenpfad, Teil 5: mehrere Wertesätze (`KF_OVERRIDE`) nacheinander messen, Zielgrößen nebeneinander. |
| `tools/bildzeit.mjs` | Bildzeit im Browser bei 20/40/80 Einheiten (nur berichten). |
| `tools/sprachliste.mjs` | Wortliste des Sprach-Audits (`tests/sprache.test.mjs`, Schlüssel mit Präfix `tut.`). |
| `tools/vergleichsbasis.mjs` | Vergleichsbasis der Simulation: Siegquote, Dauer, Kartenwahlen je Feld (50 Partien, beide Strategien). |
| `tools/bench-tick.mjs` | Tick-Zeit mit 2 × 60 Einheiten. |
| `tests/` | `npm test` (Node-eigener Test-Runner), optional `npm run test:browser` (braucht Playwright). |
| `docs/STAND.md` | Stand je Inkrement von `main`; im Branch Kartenpfad beschreibt `docs/STAND-kartenpfad.md` den Branch. |

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

## Kartenbühne und Entdecken (Version 0.9, REQ-K2.01 – K2.08)
Zwei Schalter in `config.js` (`UI.kartenbuehne`, `UI.entdecken`, beide `true`), per Adresse `?buehne=1|0`, `?entdecken=1|0`; dazu `?vorschau=naechste` (ein „?“ je Bereich) und `?zeit=pause|langsam|lauf` (Spielzeit bei offener Wahl).
Mit beiden `0` läuft die Oberfläche von Version 0.8 (Wahl im Reiter Karten, alle Reiter sichtbar); die Browser-Prüfung nutzt das für die bisherigen Abläufe.
Regeln: Außerhalb einer Wahl liegt nichts von der Bühne in der Bildmitte (Kartensymbol mit Füllstand in der Leiste); jede Karte zeigt eine Wirkungszeile `kp.eff.<id>` (höchstens 44 Zeichen, Test `tests/k2.test.mjs`)
und nennt keine andere Karte; ein Element wird erst sichtbar, wenn es nutzbar ist (Tabelle in `discover.js`, bleibt danach); ein Klick im Pausenzustand erzeugt nichts; `core.js` kennt davon nur `KARTENBUEHNE.zeit`.
Neue Karten brauchen eine Zeile `kp.eff.<id>` in beiden Sprachdateien (der Test prüft es).

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

## Kartenpfad (Branch `exp/kartenpfad`, REQ-KP.01 – KP.09, REQ-P.01 – P.06)
- Schalter `PACING_MODUS` (`config.js`; auf dem Branch `karten`, auf `main` `standard`), im Spielstand `S.pacing`; `?pacing=standard|karten`. Im Modus `standard` ist nichts gesperrt und das Ergebnis der Simulation mit gleichem Seed identisch zu `main`
  (`tests/unveraendert.test.mjs`). `tools/load-core.mjs` lädt im Standardmodus, außer `KF_PACING=karten`.
- Freischaltlogik in `core.js`: Schlüssel `bau:<gebäude>`, `einheit:<typ>`, `forschung:<id>` (`isOpen`, `unlockKey`), Upgrade-Stufen mit Quelle (`stageSource`), Einheitenersatz (`replaceUnit`, `ownType`). Die Quelle steht nur an der Karte oder Forschung
  (`schaltetFrei` in `data/kartenpfad.js`); es gibt keine zweite Liste. Neue Pfadkarten und Forschungen nur dort ergänzen (Texte `kp.card.*`, `kp.res.*`).
- Angebot im Modus karten (REQ-P.04): `drawOptionsKarten` – 3 Karten, mit Universität 4 (`KARTEN.angebot`); Pfadplätze = min(`KARTEN.pfadPlaetze` = 2, ziehbare Pfadkarten), der Rest sind Bonusplätze (Bonus-, Wagnis- und Doktrin-Karten, höchstens eine Wagnis- und eine Doktrin-Karte);
  Pfadkarten sind seit Teil 5 nur noch Technologie-Karten (erst mit stehender Universität), Gewicht je Karte `KARTEN.gewichte` bzw. `gewicht`; Neu ziehen und Bann halten die Zahl der Pfadplätze. Bonuskarten tragen im Feld `wirkt` (`data/draft-options.js`) die Bedingung, unter der ihre Wirkung > 0 ist (REQ-P.05, nur Modus karten).
  Textschlüssel mit Modus-Suffix (`….name.karten`) überschreiben im Modus karten den Standardtext (`t()` in `ui.js`), so heißt die Bonuskarte „Kriegserfahrung“ dort „Lehrjahre“; Stufen-Texte `….desc.t2.karten` (`cardDesc` in `panels.js`).
- Pacing aus dem Spielfluss (Teil 5, REQ-K5.03): Eine Wahl wird fällig, wenn die EP die Schwelle erreichen (`xpSum`, `KARTEN.schwellen`: Schritt k = `start` × `wachstum`^(k−1) × `schwellenFaktor[Grad]`); `KARTEN.minAbstand` 45 s ist nur eine Bremse zwischen zwei Wahlen. Es gibt keine Zielzeit, keinen Höchstabstand und
  keine Zeitautomatik. EP-Quellen (`S.stats.xpSrc`): Abschüsse (`kill`, `tower`), Schaden an der gegnerischen Basis (`base`, `KARTEN.epBasis`), vollständig abgewehrte Gegnerwelle (`wave`, `KARTEN.epWelle`), Forschungsbudget (`budget`), Material über dem Lagerdeckel (`lager`, Karte Lagerzehnt), Beute (`bounty`).
  Neu kalibrieren: `node tools/kalibrieren-p5.mjs` (Wertesätze per `KF_OVERRIDE`), Messung `node tools/sim-p5.mjs --suite felder`.
- Partiedauer (REQ-P.03): einzige Stellschraube `KARTEN.basisFaktor` (Lebenspunkte der gegnerischen Basis, Zahl oder Tabelle je Grad).
- Kartenbühne (`stage.js`): `UI.kartenbuehne`, `UI.entdecken` (beide `true`, wie `main` 0.9.2), URL `?buehne=1|0`, `?entdecken=1|0`; `KARTENBUEHNE.zeit` (`pause` Standard). Sprach-Audit: Schlüssel mit Präfix `tut.` und `kp.` dürfen die Wörter aus `tools/sprachliste.mjs` nicht enthalten.
- Bots wählen Pfadkarten und Pfadforschung (`KF_BROWSER_BOT.pfadPick`, `pfadResearch`); `node tools/sim-karten.mjs --runs 50 --suite varianten|profile|paar` (Rohdaten unter `reports/kartenpfad-*`). Die Bot-Korrektur bei vollem Raster (kein Material zurückhalten, REQ-R.03) kommt aus `main`.


## Gebäude-Aufwertung (Teil 4, REQ-S.05; Strategielinien und Zeichen entfallen seit Teil 6)
- **Gebäude-Aufwertung**: Ein Gebäude wird einmal zu einer Variante aufgewertet (`G.upgradeBuilding`, `variantBlock`, `slot.variant`, `slot.upg`, `variantsFor(i)`). Ein Sonderbau (Feld `doktrin` an der Variante) löst eine Grundvariante ab, sonst bleibt sie endgültig. Kosten `AUFWERTUNG.kostenFaktor` × Baukosten
  (Sonderbau `DOKTRIN.sonderbau.kostenFaktor`), Dauer `dauerS` (das Gebäude wirkt nicht: `has`, `countType`, `matRate`, Nachbarschaft ignorieren `slot.upg`), sichtbar ab Minute `abMinute` mit stehendem Gebäude des Typs. Der Platz behält seinen Typ. Nach Änderungen an `S.slots`
  von außen `S.slotVer++`, sonst veraltet der Cache der Modifikatoren.
- **Pool im Modus karten**: `KF_PFAD.entfallenKarten` (17 Karten seit Teil 5 plus Serienbau und Bauleitung, seit Teil 6 sieben weitere und Verbrannte Erde), `KF_PFAD.entfallen` (Forschungen: Schildträger, Ingenieurskunst, Hörsaal); `KARTEN.kartenTiers` ersetzt die Stufen von 13 Karten (Spürbarkeitsgrenze, Stufen mit neuem Effekt).
- **`?druck=hoch`** (Testschalter, Standard aus): verstärkt die Zahl der Einheiten regulärer Gegnerwellen ab Minute 4 um `C.DRUCK.hoch.faktor`; `S.druck`, im Protokoll (`druck`).
- Messung: `node tools/messung-p6.mjs` (Kategorie-Bots), `node tools/sim-p5.mjs --suite felder --kat militaer|wirtschaft|verteidigung`; Browser: `tests/browser-q6.mjs`.

## Teil 5: Grundausstattung, Doktrinen, Pacing aus dem Spielfluss (Branch `exp/kartenpfad`, REQ-K5.01 – K5.10, Spielstand-Version 10)
- **Grundausstattung** (REQ-K5.02): Fabrik, Kaserne, Schmiede, Universität, Kontor, Läufer, Werfer und alle Ausbaustufen von Mauer, Türmen und Kaserne („Quartiere“, +2 Versorgung je Stufe) gibt es ohne Karte; Bau-Karten und Echtes Militär entfallen. Technologie-Karten (erst mit Universität) öffnen die Forschungen
  für Reiter, Schild, Armbrust, Katapult, Eisenwaffen, Wehrgang und Schießscharten.
- **Forschungsbudget** (REQ-K5.05): Reiter Universität, drei Knöpfe 0 / 25 / 50 % (`G.setBudget`, `S.budget`): der Anteil des laufenden Materialertrags (Fabriken und Presse) wird zu EP (`KARTEN.budget`: Kurs, bei 50 % × 0,7; `budgetKurs`). Der Hörsaal entfällt im Modus karten.
- **Doktrinen** (REQ-K5.07, `data/doktrinen.js`, `C.DOKTRIN`): Karten der Familie `doktrin` (Zunftordnung, Stiftung, Stehendes Heer, Vorstoß, Bollwerk, Ausfall; ab Teil 6 sieben weitere) mit Effekt, Sonderbau und bindender Einschränkung; höchstens `max` (2) je Partie, ab Wahl 3; seit Teil 6 über einen Zufallsfaktor
  (`doktrinChance`, Bonusplatz, nie zwei in einem Angebot), die Doktrin der führenden Kategorie mit mehrfachem Gewicht. Sonderbauten sind Gebäude-Varianten mit Feld `doktrin` (Zunfthaus, Stiftungshaus, Heerlager, Bastion). Einschränkungen: Wirkungen in `drawback`, Regel `grenze`
  (`buildBlock` meldet `limit`, die Oberfläche nennt den Grund), Unterhalt (`upkeep`), Bastion feuert wie ein Turm. Protokoll: `S.stats.doktrinen`, `doktrinOffers`. Messung: `node tools/sim-p5.mjs --suite doktrin`.
- **Bots**: Kategorie-Bots (seit Teil 6; vorher Linien-Bots) wählen die Karte mit den meisten Treffern ihrer Kategorie (eine Doktrin zählt doppelt), werten Sonderbauten zuerst auf und stellen das Budget nach fester Regel ein (`KF_BROWSER_BOT.KAT_BUDGET`: Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %); der Bot „ohne Kategorie“ wählt nach Pfadreihenfolge.
- Tests: `tests/pacing5.test.mjs`, `budget.test.mjs`, `doktrinen.test.mjs`, `pool5.test.mjs`, `kartenpfad.test.mjs`; Browser: `tests/browser-n5.mjs`. Die Zahlen der Kalibrierung und die Auslegungen stehen in `docs/bericht-kartenpfad-5.md` und `docs/STAND-kartenpfad.md`.

## Teil 6: Kategorien, Synergien, Doktrinen, Weiterentwicklungen (Branch `exp/kartenpfad`, REQ-K6.01 – K6.08, Spielstand-Version 11)
- **Strategielinien entfallen** (REQ-K6.02): keine Zeichen, keine Linienstufen, keine Anzeige „Linien“, keine Linienhinweise. Die sechs Regeln der Linienstufen sind Karten in `data/karten6.js` (Querverbindung, Lagerzehnt, Söldnertruppe, Rekrutenzug, Durchbruch, Plünderung); „Ausbruch“ ist Teil der Doktrin Ausfall.
- **Kategorien** (REQ-K6.03, `C.KATEGORIEN`): Feld `kat` an jeder Karte (Wirtschaft, Militär, Verteidigung; eine Liste mit zwei Einträgen ist eine Brücke; ohne Feld neutral). Gezählt wird in `katCounts` (jede Karte und jede weitere Stufe einmal, eine Doktrin zweimal, `katLead` ab Vorsprung 2).
  Synergiekarten (Feld `synergie`: Zähler, Verstärker, Brücke) erscheinen ab zwei Karten ihrer Kategorie, zählen höchstens `deckel` (8) Karten und zeigen ihren Wert auf der Karte. Die führende Kategorie hat doppeltes Gewicht im Angebot; jedes Angebot ab drei Karten enthält eine Karte außerhalb der führenden Kategorie (auch bei Bann und Neu ziehen).
  Pool ohne Doktrinen höchstens 38 (`KATEGORIEN.poolMax`, Test `tests/kategorien6.test.mjs`).
- **Doktrinen** (REQ-K6.01, K6.04, K6.05): Die Einschränkung gilt sofort, auch für den Bestand (`doctrineExcess`, `variantExcess`; der Sonderbau ist gesperrt, bis die Grenze erfüllt ist). Ab Wahl 3 würfelt jedes Angebot mit der Chance `S.pfad.pDoktrin` (Start 15 %, +15 Prozentpunkte je Angebot ohne Doktrin, `DOKTRIN.p`)
  eine Doktrin; höchstens zwei je Partie. 13 Doktrinen (Elite, Massenaufgebot, Freihandel mit Tausch im Kontor, Raubbau, Fabrikmiliz, Grenzfeste, Zermürbung neu); Mischdoktrinen zählen für zwei Kategorien.
- **Weiterentwicklungen** (REQ-K6.06): Technologiekarten Dampfkraft und Buchdruck öffnen die Forschungen `r_dampfkraft` und `r_buchdruck` (Feld `weiter` in `data/kartenpfad.js`). Der Abschluss ersetzt die Grundvarianten des Bereichs ohne Erstattung (`applyWeiter`); Sonderbauten und Ausbaustufen bleiben.
  Wirkung: `factoryYield` × 1,4 und `clickYield` × 2 (Dampfmühle); `researchTime` × 0,5 und `budgetKurs` × 1,5 (Druckerei). Protokoll `S.stats.weiter`.
- **Ausbauten als Karten** (REQ-K6.07): `KF_PFAD.entfallenAusbauten` (Reichweite, Feuerrate, Stachelwall, Mörtelkolonne, Kontor-Ausbau) entfallen im Modus karten; Turmschule, Stachelwall, Zinsmeister (Stufen der Karte Handelskontor) und Maurerkolonne übernehmen sie. Grundlagen (Turm bauen, Mauerausbau, Quartiere, Presse, Schmiede) bleiben ohne Karte.
- **Bots und Messung** (REQ-K6.08): Kategorie-Bots warten mit dem Aufwerten, wenn Dampfkraft geöffnet ist, erforschen Dampfkraft und Buchdruck zuerst und tauschen bei Freihandel Überschuss gegen EP; vierter Bot ohne Kategorie. `node tools/messung-p6.mjs`, `node tools/bedienelemente.mjs`.
  Sitzungsprotokoll Format 3 (`session.js`): Kategorie je Karte, `kategorien`, `synergie`, `weiterentwicklungen`, `doktrinP`, `doktrinEffekte`.
- Tests: `tests/einschraenkung6.test.mjs`, `linien6.test.mjs`, `aufwertung.test.mjs`, `kategorien6.test.mjs`, `doktrinen6.test.mjs`, `weiter6.test.mjs`, `ausbauten6.test.mjs`; Browser: `tests/browser-q6.mjs`. Zahlen, Auslegungen und offene Punkte: `docs/bericht-kartenpfad-6.md`, `docs/STAND-kartenpfad.md`.

## Teil 7: Haupthaus, Fabrikgrenze, Weiterentwicklungen, historisches Setting (Branch `exp/kartenpfad`, REQ-K7.01 – K7.12, Spielstand-Version 12)
- **Haupthaus** (`C.HAUPTHAUS`, `S.haus`): steht im Modus karten ab Start auf Platz 5 (`{ type: 'haupthaus', fixed: true }`), nicht abreißbar, nicht aufwertbar, ohne Nachbarschaft; Reiter „Haupthaus“. Stufen über die Karten Stadtrecht und Hofhaltung (Familie `weiterentwicklung`, Feld `haus`, Pfadplatz; Stadtrecht ab Wahl 2, `garantieWahl` 5) und einen bezahlten Ausbau (`G.hausAusbau`). Je Stufe ab II ein Flügel (`G.chooseFluegel`: Bibliothek, Zeughaus, Schatzkammer, Kanzlei). Voraussetzung `forschungsort` = Universität oder Bibliothek.
- **Obergrenze für Fabriken** 3/4/5 (`G.fabrikGrenze`, `G.fabrikPlaetze`, `buildBlock` meldet `fabrikGrenze`); die Zunftordnung senkt sie (Stat `fabrikGrenze`), die Grenzfeste verlängert stattdessen den Wellenabstand.
- **Weiterentwicklungen** (`weiter: { bereich, stufe }`, höchstens zwei je Gebäude; `G.weiterStufe`, `G.weiterNext`): Wasserrahmen → Dampfkraft (Fabrik), Buchdruck (Universität, `nurUni`), Fernhandel (Kontor → Handelshaus, Söldnerkompanie `G.hireKompanie`, `C.HANDELSHAUS`), Geschützguss (Schmiede → Gießerei, Einheit `geschuetz` mit `versorgung` 2 und `baseMult` 3).
- **Zweites Exemplar** von Kaserne und Universität (`C.ZWEITES`, Ausbau `ausbau2`); Schmiede und Kontor einmal.
- **Namen** im Modus karten über Schlüssel mit Suffix `.karten` (Manufaktur, Hofmanufaktur, Zeugmanufaktur, Fabrik, Dampffabrik, Akademie, Handelshaus, Gießerei, Bürgerwehr); Stufennamen von Mauer und Türmen `C.STUFENNAMEN` (nur Anzeige). Suchtest `tests/namen7.test.mjs`.
- Protokoll Format 4 (`haupthaus`, `fluegel`, `fabrikplaetze`, `kompanien`, `geschuetze`, `gebaeudeEnde`). Bots: Stadtrecht und Hofhaltung sofort, Flügel nach `KAT_FLUEGEL`, Rücklage für den Ausbau, sparen auf geöffnete Weiterentwicklungen (`weiterWunsch`).
- Kalibrierung: `KARTEN.basisFaktor` Normal 9,5. Tests: `haus7`, `weiter7`, `zweites7`, `namen7`; Browser `tests/browser-r7.mjs`. Messung: `node tools/messung-p6.mjs --set kategorien|ohne --prefix kartenpfad7`, Auswertung `node tools/basis-p7.mjs --prefix kartenpfad7`.


## Teil 8 und 9: Wahltakt, Reichweiten, Text (Branch `exp/kartenpfad`, REQ-K8.01 – K8.09, K9.01 – K9.09, Spielstand-Version 13)
- **Wahltakt:** Hebel `KARTEN.uebertrag` (Übertragsgrenze, Standard `null`) und `KARTEN.budget.abnahme` (Standard 0) sind **aus**; sie schwächen die Bots (`docs/bericht-kartenpfad-8.md`). `xpVerfaellt`, `xpProgress`, `xpRestAbstandS` liefern die Anzeige in `hud.js`. Messung: `tools/basis-p8.mjs`, `tools/kalibrierung-p8.mjs`, Protokoll: `tools/ep-protokoll.mjs`.
- **Reichweiten:** `C.KARTEN.reichweiten` gilt nur für eigene Einheiten (`baseRange(type, side)`); Gegner behalten die alten Werte, begrenzt auf Turm-Grundreichweite + eine Stufe (`baseRange`, PO-Entscheidung). Gegner-Fernkämpfer: `KARTEN.gegnerFern`, `S.gegnerfern`, URL `?gegnerfern=aus`.
- **Entfallen:** Belagerungsgerät; Grenzfeste ×1,10.
- **Textregeln R1–R7** (`docs/anforderungen-kartenpfad-8-9.md`): Kartenfläche = Name, Wirkungszeile `kp.eff.*`, Nachteilszeile `kp.drawback.*`, Bedingung. Budgets de: Name 22, Wirkung 40, Nachteil 40, Bedingung 30, Gebäude 110, Tooltip 180, Hinweis 100 (en +15 %); Prüfung `tools/textbudget.mjs`, `tests/sprache.test.mjs`. Keine festen Zahlen im Text (Platzhalter), Ausnahmen in `tests/sprache.test.mjs`. Weitere Textkürzung (−25 %-Ziel) erst nach dem Spieltest. Begriffe: Lebenspunkte/LP, Abschuss, Schmiede, Kontor. Kein Element trägt zwei Namen (`tests/namen9.test.mjs`). Keine Phasenanzeige im Modus karten.
- **Neue Karten/Texte:** Wirkungszeile und, bei Nachteil, Nachteilszeile in beiden Sprachdateien. Textübersicht neu erzeugen: `node tools/texte-md.mjs docs/texte-kartenpfad.md`.
- Tests: `ep8`, `t8`, `text9`, `namen9`; Browser: `tests/browser-t8.mjs`, `tests/browser-u9.mjs`.

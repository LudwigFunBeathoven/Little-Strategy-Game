# Klammerfront – Stand Iteration 6

Grundlage: `docs/anforderungen-iteration-6.md`. Branch: `iteration-6` (von `main`, Commit `a1e5bf2`, v0.6).
Stand von Iteration 5: `docs/archiv/STAND-iteration-5.md`.

**Starten:** `index.html` im Browser öffnen. Spieltest-Modus: `index.html?debug=1`.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| I6.0 | Basislinie v0.6 mit beiden Strategien, neue Kennzahlen | 6.09 | fertig |
| I6.1 | Formationen ohne Pendeln | 6.01 | fertig (Soll knapp verfehlt, siehe Befund) |
| I6.2 | Versetzte Einzelangriffe, eigene Geschosse | 6.02 | fertig |
| I6.3 | Offline-Reste, Pause bei verdecktem Tab, Kartenersatz | 6.03 | fertig |
| I6.4 | Kartenwahl automatisch, Kaserne im Reiter „Armee“ | 6.04, 6.05 | fertig |
| I6.5 | „Schwung“ entfernen, Leistungsziel, Schwer-Start | 6.10, 6.08 | fertig (REQ-6.08: Zielkonflikt, PO-Entscheidung offen) |
| I6.6 | Universität | 6.06 | fertig (Paarvergleich teils unter +3 pp, siehe Befund) |
| I6.7 | Nachbarschaftsboni | 6.07 a | fertig |
| I6.8 | Handelskontor mit Zinsen, „Welle vorziehen“ | 6.07 b, c | offen |
| I6.9 | Abnahmeserie, Bericht, Testbuild | 6.11 | offen |

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz        # beide Strategien, je 20 Partien Normal durchschnitt
node tools/bench-tick.mjs                   # Tick-Zeit mit 2 × 60 Einheiten
```

## Basislinie (I6.0, v0.6 unverändert)
Serie `node tools/simulate.mjs --runs 50 --suite ziele` (1.500 Partien, beide Strategien mit denselben Seeds), Rohdaten `reports/i6-basis-ziele.*`.
Dauer 315 s auf 4 Kernen.

Median Sieg · Siegquote:

| Schwierigkeit | Profil | gierig | einheiten-zuerst |
|---|---|---|---|
| Leicht | aktiv | 6:24 · 100 % | 5:40 · 100 % |
| Leicht | durchschnitt | 8:58 · 100 % | 6:19 · 100 % |
| Leicht | gelegentlich | 11:49 · 96 % | 7:30 · 100 % |
| Leicht | passiv | 0 % | 8:09 · 2 % |
| Normal | aktiv | 6:45 · 88 % | 5:41 · 100 % |
| Normal | durchschnitt | 9:39 · 64 % | 6:28 · 100 % |
| Normal | gelegentlich | 7:53 · 18 % | 7:37 · 100 % |
| Schwer | aktiv | 10:23 · 52 % | 6:12 · 100 % |
| Schwer | durchschnitt | 7:54 · 28 % | 7:15 · 100 % |
| Schwer | gelegentlich | 0 % | 7:53 · 10 % |
| alle | passiv (Normal, Schwer), verteidigung | 0 % | 0 % |

| Kennzahl | gierig | einheiten-zuerst | Soll |
|---|---|---|---|
| Patt-Quote | 0 von 750 | 0 von 750 | ≤ 2 % |
| **Richtungswechsel**, größter Wert einer Einheit in 1 s | 42 | 42 | ≤ 2 |
| Richtungswechsel, Median je Einheit und Sekunde | 0,111 | 0,052 | nahe 0 |
| Partien mit mehr als 2 Wechseln je Sekunde | 574 von 750 | 548 von 750 | 0 |
| Partielänge, 90. Perzentil der Siege, größter Wert je Feld | 15:12 (Schwer aktiv) | 9:33 (Schwer gelegentlich) | ≤ 20:00 |
| **Ungenutztes Material** (Normal, durchschnitt, Median) | 5 % (44 Partien mit Spätphase) | 13 % (1 Partie mit Spätphase) | ≤ 20 % |
| Forschungstempo: erste Forschung fertig (Normal, durchschnitt) | 6:35 | nie | < 3:00 |
| Forschungstempo: fertig bis Minute 10 | 1 | 0 | ≥ 5 |
| Einheitenkäufe an allen Handlungen der ersten 300 s | 63 % | 74 % | – |
| Karten über +25 pp bei beiden Strategien | keine | | keine |
| Zeitanteil der Armee im Kampf | 63 % | | berichten |

**Befund zur Wirtschaft:** Die Kennzahl „ungenutztes Material“ liegt mit 5 % schon in v0.6 weit unter dem Ziel von 20 %. Die Bots kaufen
Einheiten bis zum Limit und verbrauchen so fast alles. Die Beobachtung des PO (nach dem Vollausbau fehlen Entscheidungen) ist damit nicht
widerlegt, aber über diese Kennzahl nicht messbar: Sie misst Verschwendung, nicht Entscheidungsvielfalt. Siehe Auslegung 3.

## Prüfergebnisse
- I6.7: `npm test` 134/134 (neu `tests/neighbors.test.mjs`; Fabrik-Ertragstest baut auf nicht benachbarten Plätzen), Browser-Prüfung 194/194
  (Nachbarschaftsvorschau in Bau-Option und Raster). Der Kartenwahl-Test wartet jetzt auf den Reiterwechsel statt fester 120 ms.
- I6.6: `npm test` 128/128 (neu: Beschleunigen in `tests/research.test.mjs`; Wirkungstest liest die Werte aus `data/research.js`),
  Browser-Prüfung 191/191. Neue Suite `forschung` (Tempo in drei Spielweisen, Paarvergleich je Forschung).
- I6.5: `npm test` 127/127 (Schwung-Test entfällt, neu `tests/anlauf.test.mjs`), Tick-Zeit Median 0,10–0,14 ms (Soll ≤ 1 ms). Die Simulation
  meldet die früheste Niederlage je Feld.
- I6.4: `npm test` 127/127 (neu `tests/hometab.test.mjs`), Browser-Prüfung 191/191. Kartenwahl: Reiter Karten öffnet sich selbst, Knöpfe
  400 ms gesperrt und blenden ein (`UI.draftLockMs`), Klick in der Sperrzeit wählt nichts, zweite Wahl folgt mit neuer Sperre, danach Rückkehr
  zum vorigen Reiter mit voriger Auswahl; bei gehaltener Maustaste öffnet der Reiter erst nach dem Loslassen, der Klick zählt. Kaserne:
  Abschnitt im Reiter Armee (Status, Stufe, Versorgungslimit, Ausbau), ohne Kaserne Knopf „Kaserne bauen“ → Reiter Bauen, erster freier
  Platz, Kaserne hervorgehoben und fokussiert; Klick auf die Kaserne in der Welt öffnet Armee. Die Layout-Prüfung läuft jetzt ohne EP, weil
  eine Kartenwahl dort den Reiter wechseln würde.
  **Fehler aus I6.3 gefunden und im I6.3-Commit behoben:** Der verborgene Knopf „Weiter“ blieb wegen `display:flex` sichtbar-durchsichtig über
  der Mitte der Spielwelt und fing dort Klicks und Mausrad ab.
- I6.3: `npm test` 126/126 (neu `tests/online.test.mjs`: Suchtest ohne Offline-Bezug in `core.js`, `config.js`, `hints.js`, `data/`, `i18n/`;
  keine Abwesenheitsrechnung in der Logik; Laden ändert nichts; Nachtschicht nur in der Spätphase). Browser-Prüfung: Tab verdecken → Spielzeit
  steht, „Weiter“ in der Spielwelt; Laden mit um eine Stunde vorgestellter Systemzeit → Material und Zeit unverändert, Partie pausiert.
  `SAVE_VERSION` 7, `SAVE_KEY` `klammerfront.save.v7`; alte Stände werden mit dem bestehenden Hinweis verworfen.
  **Karten mit Offline-Bezug (zur Freigabe durch den PO):** nur **Nachtschicht** (Wirtschaft, gewöhnlich; bisher „Fabriken arbeiten bei
  Abwesenheit 4/8 Stunden länger“, im Spiel wirkungslos). Ersatz gleicher Kategorie und Seltenheit: „In der Spätphase produzieren die
  Fabriken 25 %/50 % mehr“ (Stufe I/II). Übrige Offline-Reste: Nachrechnen beim Laden und beim Zurückkehren in den Tab, Konstanten
  `OFFLINE_MIN_S`, `OFFLINE_HOURS`, Meldung „… abwesend: +… Material“, Zeitstempel im Spielstand – entfernt.
- I6.1: `npm test` 116/116 (neu `tests/pendel.test.mjs`: je Ursache ein Szenario, Richtungswechsel in drei echten Partien, Totzone; zwei
  Tests in `army.test.mjs` an die Mindestverweildauer angepasst). Debug-Protokoll je Einheit mit `?debug=1` (`__kf.unitLog(id)`, im Export
  als `unitLog`, letzte 15 s). Browser-Prüfung: Kampfbild ohne Hin-und-her, Debug-Protokoll, `compare-human` erkennt Profil und Strategie.
- I6.0: `npm test` 109/109. Die Strategie „einheiten-zuerst“ nutzt dieselbe Datei wie der Durchlauftest (`tools/browser-bot.js`), die
  Simulation lädt sie in ihren vm-Kontext; `tools/einfach-bot.mjs` entfällt. `tools/compare-human.mjs` ordnet Protokolle zusätzlich einer
  Strategie zu.

## Befunde der Fehler (REQ-6.01, REQ-6.02)
### REQ-6.01 Pendeln: welche Ursachen zutrafen
Belegt mit `tests/pendel.test.mjs` (zuerst rot gegen v0.6) und Takt-für-Takt-Protokollen einzelner Einheiten.

| Ursache (Anforderung) | Befund | Behebung |
|---|---|---|
| 1 Zustandspendeln | **trifft zu.** Kürzeste Verweildauer in einem Zustand 0,05 s (ein Takt). | Mindestverweildauer `ARMY.minStateS` 0,5 s; Ausnahme Marsch → Kampf (sofort, sonst liefe die Armee in den Gegner). Hysterese 16 bleibt. |
| 2 Instabile Platzvergabe | **trifft zu.** Reihen wurden bei jeder Neuordnung nach Id sortiert; eine helfende Einheit mit kleiner Id drängte die Einheiten der Lane eine Reihe zurück. Nachschub brachte alte Platznummern mit. Zusätzlich zentrierte jede Reihe ihre Plätze neu, sobald jemand hinzukam oder fiel. | Feste Plätze (`slot`): Reihenfolge nach Ankunft, Neue und Nachschub hinten, Neuvergabe nur beim Sammeln. Querplätze fest über die volle Reihenbreite (`ROW_SPREAD`), nicht mehr je Reihe zentriert. |
| 3 Lane-Wahl ohne Bindung | **trifft zu, Hauptursache der „Millisekunden-Sprünge“.** Eine Einheit der Mitte half oben, der Gegner der Mitte ebenso; beide entschieden im selben Takt gegeneinander und tauschten in jedem Takt die Ziel-Lane (21 Wechsel je Sekunde). | Unterwegs bleibt das Ziel bis zur Ankunft; eine helfende Einheit bleibt, bis ihre Lane frei ist; nach der Ankunft mindestens `ARMY.minLaneStayS` 1,5 s. Der Platz in der Ziel-Lane wird beim Losgehen vergeben, die Querbewegung läuft gleitend vom alten zum neuen Platz (`lateralOf`). |
| 4 Konkurrierende Ziele | trifft nicht zu (Test grün gegen v0.6): beim Sammeln bewegt sich jede Einheit quer nur in eine Richtung. | – |
| 5 Nur Darstellung | trifft teilweise zu: Es gab keine Zwischenbilder; Aufrücken um eine Reihe (16 px) war ein Sprung. | Gezeichnete Position folgt weich (`UI.unitEaseS` 0,08 s, Totzone `UI.unitEaseSnapPx`); Totzone quer in der Logik `ARMY.deadZone`. |

Kennzahl „Richtungswechsel“ (Kurzsimulation 200 Partien je Strategie, `reports/i6-1-kurz.*`):

| | v0.6 (I6.0) | I6.1 |
|---|---|---|
| größter Wert je Einheit und Sekunde, gierig | 42 | 4 |
| größter Wert, einheiten-zuerst | 42 | 3 |
| Median je Einheit und Sekunde, gierig / einheiten-zuerst | 0,111 / 0,052 | 0,010 / 0,003 |
| Partien mit mehr als 2 Wechseln in einer Sekunde, gierig / einheiten-zuerst | 574 von 750 / 548 von 750 (Serie) | 70 von 200 / 2 von 200 |
| Zeitanteil der Armee im Kampf, gierig / einheiten-zuerst | 63 % / – | 62 % / 68 % |
| Normal durchschnitt: Median Sieg · Siegquote, gierig / einheiten-zuerst | 9:48 · 79 % / 6:25 · 100 % | 9:33 · 79 % / 6:23 · 100 % |

### REQ-6.02 Würfe im Gleichtakt
**Befund: Gleichtakt, keine Gruppierung.** Die Simulation arbeitet seit REQ-5.05 je Einheit (eigenes Ziel, eigene Angriffspause, ein Geschoss
je Wurf). Alle Einheiten einer Welle entstanden aber im selben Takt mit Angriffspause 0 und derselben Pause danach; zehn Werfer warfen
dauerhaft im selben Takt (Test rot: 2 Takte mit je 10 Angriffen). Zusätzlich starteten alle Geschosse einer Lane in der Lane-Mitte und
landeten dort, deshalb sahen die Würfe wie ein einziger aus.
Behebung: erste Angriffspause zufällig 0–100 % (`COMBAT.spawnStagger`), jede weitere ± 10 % (`COMBAT.cdJitter`), beides über `S.rng`;
jedes Geschoss fliegt vom Platz des Werfers zum Platz seines Ziels. Gilt für Nah- und Fernkämpfer beider Seiten. Overkill-Vermeidung hinter
`COMBAT.avoidOverkill` (aus). Tests `tests/versatz.test.mjs`: fünf und mehr Takte je 2 s, ein Geschoss je Angriff, mittlere Rate ± 3 %,
gleicher Seed gleiche Partie, Schalter wirkt.

Siegquoten vor und nach I6.2 (je 50 Partien je Feld, gleiche Seeds; `reports/i6-2-ziele-vor.*`, `reports/i6-2-ziele-nach.*`): größte
Verschiebung gierig 12 pp (Schwer durchschnitt 38 → 50 %), einheiten-zuerst 6 pp (Schwer gelegentlich 12 → 6 %); alle übrigen Felder ≤ 8 pp.
**Das Soll „höchstens 3 pp“ ist mit 50 Partien nicht prüfbar:** Die Differenz zweier Quoten aus je 50 Partien streut bei 40–60 % Siegquote
um ± 20 pp (95 %). Die beobachteten Verschiebungen liegen im Rauschen; einen gerichteten Effekt zeigen sie nicht (Vorzeichen gemischt). Den
Nachweis auf 3 pp genau brächte erst eine Serie mit rund 2.000 Partien je Feld. Vorschlag: in der Abnahme (200 je Feld) erneut berichten.
**Overkill-Vermeidung** (Schalter an, `reports/i6-2-overkill.*`, gegen I6.2 mit Schalter aus): gierig Normal durchschnitt +10 pp, Schwer
durchschnitt +6 pp, sonst ≤ 4 pp; einheiten-zuerst ≤ 4 pp. Tendenz: etwas stärkere Armeen. Bleibt aus (Standard der Anforderung).

### REQ-6.01, Fortsetzung
**Soll „höchstens 2 je Sekunde“ knapp verfehlt.** Die restlichen Fälle sind sichtbare, aber einzelne Umordnungen in langen Kämpfen: Eine
Einheit kommt in einer Nachbar-Lane an, bleibt die Mindestzeit und zieht weiter, während vor ihr jemand fällt oder ein Nahkämpfer sich vor die
Fernkämpfer setzt (Regel „Nahkämpfer vorn“). Kein Muster in aufeinanderfolgenden Takten mehr. Vorschlag: so lassen und im Spieltest
beobachten; eine weitere Absenkung verlangte, die Regel „Nahkämpfer vorn“ für Nachzügler aufzuweichen.
Playwright: 10 Sekunden Kampfbild, Positionsprüfung je Bild, höchstens 1 Wechsel je Einheit und Sekunde.

## Befund REQ-6.06: Universität
Änderungen: Forschungszeiten halbiert, Kosten −40 %; Einstieg (Neu ziehen, Bann, Maurerkunst Stufe I) 100 Material, 15 s; Ingenieurwesen,
Metallurgie und Maurerkunst in allen Stufen stärker; Hörsaal 0,15/0,35/0,55 EP/s (III = 34 % des Abschuss-Ertrags eines aktiven Spielers auf
Normal, Soll ≤ 35 %). Neu: Beschleunigen gegen Material (`RESEARCH_RUSH`: 6 Material je gesparter Sekunde, +50 % je Stufe über der ersten),
Vorher/Nachher im Tooltip, Hinweis „Forschung abgeschlossen“ über dem Arbeitsbereich plus Markierung am Reiter, in der Leiste EP je Sekunde und
Zeit bis zur nächsten Karte. Serie `node tools/simulate.mjs --suite forschung --runs 50` (`reports/i6-6-forschung.*`, vor der Verstärkung der
drei globalen Forschungen gemessen).

**Tempo** (Normal, durchschnitt, 50 Partien je Spielweise):

| Spielweise | erste Forschung fertig (Median) | vor 3:00 | fertig bis Minute 10 (Median) |
|---|---|---|---|
| gierig (Standard-Bot) | 6:32 | 0 % | 1 |
| einheiten-zuerst | 4:16 | 0 % | 2 |
| „Universität zuerst“ (Messvariante: baut die Universität, sobald die Einführung sie zeigt, spart dafür und für die günstigste Forschung) | 2:50 | 92 % | 14 |

Soll erfüllt für die Frage „kann ein durchschnittlicher Spieler …“ (Auslegung 16). Die Standard-Bots bauen die Universität erst nach 4–5,5 min
und forschen selten; das ist ihre Spielweise, nicht das Tempo der Forschung.

**Paarvergleich** (Normal, durchschnitt, gierig; 50 Paare je Forschung, Stufe I bei 3:00 geschenkt gegen gesperrt):
Logistik +16 pp, Drill +10, Schmiede-Ausbau +6, Hörsaal +4 im Soll; unter +3: Weitblick +2, Neu ziehen, Bann, Glücksgriff, Metallurgie,
Maurerkunst, Schildträger je 0, Ingenieurwesen −2, Zweiter Forschungsplatz −6. Keine über +25. **Einordnung:** Neu ziehen, Bann, Glücksgriff und
Schildträger kann die Simulation nicht messen, weil die Bots weder neu ziehen noch bannen noch Schildträger kaufen. Bei 50 Paaren streut die
Differenz um etwa ± 10 pp; Werte zwischen −6 und +6 sind nicht von null zu unterscheiden. Ingenieurwesen, Metallurgie und Maurerkunst wurden
danach verstärkt (siehe oben); die Abnahmeserie misst erneut.

## Befund REQ-6.07 a: Nachbarschaftsboni
Regeln (`data/neighbors.js`, je Gebäudetyp genau eine, nur orthogonal): Fabrik neben Fabrik +6 % Ertrag je Nachbar (höchstens 4);
Schmiede neben Kaserne Einheitenkosten −8 %; Kaserne neben Schmiede Versorgungslimit +1; Universität neben Fabrik Forschungszeit −8 % je
Nachbar (höchstens 3); Handelskontor neben Fabrik Zinsdeckel +25 % je Nachbar (höchstens 4). Vorschau: Jede Bau-Option eines Platzes nennt,
was das Gebäude dort erhielte und welchen Nachbarn es etwas gäbe (auch im Tooltip); das Raster zeigt den aktuellen Bonus je Gebäude. Bots wählen
den Platz nach Nachbarschaftsnutzen, die gierige Heuristik vergleicht diesen Platz per Vorausschau mit dem ersten freien.
Paarvergleich (`--suite nachbarn --runs 50`, `reports/i6-7-nachbarn.*`, Normal durchschnitt gierig): alle Regeln an 94 %; Wirkung je Regel
(an gegen einzeln aus) Fabrik −2 pp, Schmiede 0, Kaserne +6, Universität −4, Kontor +2; keine über +25 pp. Die Werte liegen im Rauschen
(± 10 pp bei 50 Partien). Die Siegquote dieses Felds liegt damit deutlich über v0.6 (64 %); Ursachen und Abnahme in I6.9.

## Befund REQ-6.08: Schwer, kein Verlust vor Minute 4
Stellschraube: Anlauf der Grundwelle (`startBase` → `waveBase` bis Minute `rampMin`), dazu Versuche mit späteren Werfern. Screening mit 30–50
Partien je Feld, beide Strategien (`KF_OVERRIDE`), Werte: früheste Niederlage „passiv“ · Siegquote „gelegentlich“ (gierig / einheiten-zuerst).

| Variante | passiv, früheste Niederlage | gelegentlich, Siegquote |
|---|---|---|
| v0.6 (kein Anlauf) | 1:27 / 1:27 | 0 % / 6–12 % |
| Anlauf 1 → 3,5 bis Minute 4 | 3:05 / 3:03 | 20 % / 82 % |
| Anlauf bis Minute 6 | 3:35 / 3:51 | 24 % / 84 % |
| Anlauf bis Minute 6, Werfer ab Minute 3 | 3:30 / 3:38 | 10 % / 83 % |
| Anlauf 2 → 3,5 bis Minute 5, Werfer ab Minute 3 | 1:58 / 2:16 | 23 % / 97 % |
| nur Werfer ab Minute 3,5 | 1:23 / 1:26 | 0 % / 0 % |
| Anlauf bis Minute 8 | 3:35 / 3:54 | 20 % / 93 % |
| Anlauf bis Minute 10 | 3:56 / 4:21 | 23 % / 90 % |

**Zielkonflikt, beide Kriterien zugleich nicht erreichbar.** „gelegentlich verliert“ beruhte auf Schwer fast vollständig auf dem frühen
Zusammenbruch nach etwa 90 s. Übersteht dieses Profil die Eröffnung, gewinnt es häufig, mit „Einheiten zuerst“ fast immer. „passiv“ fällt
auch mit kleinen Anfangswellen vor Minute 4, weil der Zuwachs je Minute (`waveGrowth` 1,0) die Wellen schnell wieder groß macht; den ändert
die Anforderung ausdrücklich nicht („Druck ab der Spielmitte unverändert“). **Umgesetzt:** Mechanismus `startBase`/`rampMin` je
Schwierigkeitsgrad, **Standard aus** (Werte wie v0.6). Entscheidung beim PO, siehe Bericht.

## Entscheidungen des PO (Iteration 6, Abschnitt 2 der Anforderungen) – entschieden
- Experiment „Schwung“: verworfen, Code, Konfiguration und Test entfernt (I6.5).
- Leistungsziel: ≤ 1 ms je Takt mit 120 Einheiten in Node (`PERF_TICK_MAX_MS`, Test in `tests/single.test.mjs`, `tools/bench-tick.mjs` meldet Soll).
- Karte Weitschuss: +20 % Fernkampfschaden (Auslegung I5 Nr. 5) – **entschieden**.
- Forschung nach Abriss der Universität wirkt weiter (Auslegung I5 Nr. 30) – **entschieden**.
- Durchlauftest mit echten Werten im Schnelldurchlauf (Auslegung I5 Nr. 46) – **entschieden**.
- Handelskontor bleibt und wird umgebaut (REQ-6.07).
- Reines Online-Spiel, Partien bis etwa 20 Minuten (REQ-6.03).

## Auslegungen
1. **Einheiten zuerst** ist der Bot aus `tools/browser-bot.js` ohne Änderung der Spielweise: Bauordnung drei Fabriken, dann Kaserne,
   Schmiede, Universität, danach Fabriken; Ausbauten Presse, Kaserne, Schmiede, Türme, Mauer; Forschung nur, wenn das Material die doppelten
   Kosten deckt; Einheiten im Verhältnis zwei Läufer zu einem Werfer bis zum Limit des Profils; immer die erste Karte. Neu ziehen, Bann und
   Abriss nutzt er nicht. Beide Strategien spielen dieselben Seeds.
2. **Richtungswechsel** werden längs (x) und quer (Lane plus Platz in der Reihe, so wie gezeichnet) gezählt. Nicht gezählt werden Wechsel im
   Takt eines Zustandswechsels der eigenen Armee und im Takt danach; gefallene Einheiten verschwinden und zählen nicht. „Größter Wert“ ist die
   höchste Zahl von Wechseln einer Einheit innerhalb einer Sekunde über alle Partien; der Ausfallschritt im Nahkampf (nur Darstellung) zählt nicht.
3. **Ungenutztes Material** = Materialbestand am Partieende geteilt durch das in der Spätphase erzeugte Material (höchstens 100 %), nur Partien,
   die die Spätphase erreichen.
4. **Partielänge** = 90. Perzentil der Siegzeiten je Feld (Schwierigkeit × Profil), je Strategie.
5. **Strategie-Merkmal für `compare-human`:** Anteil der Einheitenkäufe an allen Handlungen (Kauf, Bau, Ausbau, Forschung, Reparatur) der
   ersten 300 s. Referenz aus der Basislinie: gierig 63 %, einheiten-zuerst 74 %. Der Abstand ist klein; die Zuordnung ist ein Hinweis, kein Beleg.
6. **Kurzsimulation** spielt jetzt beide Strategien (je 20 Partien).
7. **Richtungswechsel, Ausnahmen:** Neben Tod und Zustandswechsel gilt auch das Verschmelzen von Nachschub mit der Gruppe als Umordnung, die
   nicht zählt; eine solche Bewegung setzt keine Bezugsrichtung (sonst zählte das Zurückrücken nach einem Aufschließen als Wechsel).
8. **Marsch → Kampf ohne Mindestverweildauer:** Die Armee hält sofort, wenn ein Gegner in Kontaktreichweite kommt; alle anderen Wechsel
   warten `ARMY.minStateS`.
9. **Querplätze:** über die volle Reihenbreite von einer Seite gefüllt; eine einzelne Einheit steht deshalb nicht mehr in der Lane-Mitte,
   sondern am Rand der Reihe. Das ist der Preis für stabile Plätze.
10. **Einheiten auf dem Weg in eine andere Lane** erhalten ihren Platz in der Ziel-Lane beim Losgehen (hinten angereiht); sie kämpfen während
    des Wechsels weiterhin nicht.
11. **Pause bei verdecktem Tab** gilt auch für einen geladenen Spielstand: Die Partie beginnt pausiert, ein großer Knopf „Weiter“ liegt mittig
    über der Spielwelt (zusätzlich zum Pause-Knopf der Leiste). Einheiten auf dem Feld werden wie bisher nicht gespeichert.
12. **Nachtschicht:** Die Spätphase ist die Phase ab Stufe `PHASE_LATE_LEVEL`; die Wirkung multipliziert den Fabrikertrag (nicht Klicks und
    Presse). Die Karte war in v0.6 mit 26 % Wahlrate im Pool, obwohl sie im Spiel nichts bewirkte.
13. **Heimat-Reiter** (`UI.homeTab`): Fabrik → Bauen, Kaserne → Armee, Schmiede → Schmiede, Universität → Universität, Handelskontor → Bauen.
14. **Kartenwahl:** Der Hinweis in der Leiste und die Markierung am Reiter bleiben (für den Fall, dass der Spieler den Reiter während der Wahl
    verlässt). Verlässt der Spieler den Reiter Karten selbst, holt ihn dieselbe Wahl nicht erneut dorthin; erst eine neue Wahl. Die Rückkehr
    gilt dem Reiter und der Auswahl vor der ersten automatisch geöffneten Wahl.
15. **„Kaserne bauen“** wählt den ersten freien Platz, auf dem die Kaserne baubar wäre; ist keiner frei, öffnet es nur den Reiter Bauen.
    Gebaut wird erst mit dem zweiten Klick (oder Enter), wie beim Bauen aus dem Raster (REQ-5.04).
16. **Forschungstempo „kann“:** gemessen als Machbarkeit mit einer Messvariante des gierigen Bots („Universität zuerst“: Profilwerte
    „durchschnitt“, baut die Universität, sobald die Einführung sie zeigt, spart dafür und für die günstigste Forschung). Die Standard-Bots
    werden daneben berichtet; sie bestimmen die Siegquoten.
17. **Beschleunigen** schließt die laufende Forschung sofort ab (kein teilweises Beschleunigen); Preis = Restsekunden × 6 Material ×
    (1 + 0,5 × (Stufe − 1)), aufgerundet. Die Bots beschleunigen nicht.
18. **Paarvergleich:** „erzwungen“ = Stufe I wird zum Zeitpunkt 3:00 geschenkt (ohne Universität, ohne Kosten), danach ist die Forschung für
    den Bot gesperrt; „gesperrt“ = die Forschung ist die ganze Partie nicht verfügbar. Gleicher Seed, gierige Heuristik, Normal durchschnitt.
19. **EP-Anteil der Lehre:** rechnerisch über Hörsaal III gegen den Abschuss-Ertrag eines aktiven Spielers (wie in Iteration 5); gemessen
    bleibt der Anteil nahe null, weil die Bots den Hörsaal selten erforschen.
20. **Nachbarschaft:** Regeln für Einzelgebäude (Schmiede, Kaserne, Universität, Kontor) wirken global, weil es jedes nur einmal gibt; die
    Fabrikregel wirkt je Fabrik. Diagonale Plätze zählen nicht (Standard der Anforderung). Der Abriss erstattet wie bisher teilweise.

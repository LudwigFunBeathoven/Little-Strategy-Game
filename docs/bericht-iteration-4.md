# Klammerfront – Umsetzungsbericht Iteration 4

Stand: 29.09.2026 · Version 0.5 · Grundlage: `docs/anforderungen-iteration-4.md` · Stand je Inkrement: `docs/STAND.md`

## Ergebnis
Alle acht Inkremente (I4.1–I4.8) sind auf dem Branch `3x3-und-3-Lanes-Spiel` umgesetzt, je Inkrement ein Commit `I4.x`.
83 automatische Tests und die Browser-Prüfung (62 Prüfpunkte, beide Sprachen, 1280×720 und 1920×1080) sind grün; die Serie mit
3.000 Partien zeigt 0 % Patts, die reine Verteidigung verliert immer, spätestens in Minute 25.
Verfehlt werden drei der fünfzehn Zielkorridore, die +25-pp-Grenze bei zwei legendären Karten, „nie klicken“ auf Leicht und knapp
die Quote ohne Schmiede; das ist unten berichtet und nicht wegbalanciert.

**Starten:** `index.html` im Browser öffnen.

## Klartext-Zusammenfassung
- „Halten“ ist entfernt. Einheiten marschieren als Formation: Nahkämpfer vorn in Reihen zu höchstens fünf, Fernkämpfer dahinter, alle gleich schnell.
- Formationen helfen der Nachbarbahn, wenn dort gekämpft wird, und kehren zurück, sobald die eigene Bahn angegriffen wird.
- Ab dem Mittelspiel presst eine Automatik mit; die erste Fabrik ist kostenlos, Armeen werden bis 15 Einheiten groß.
- 41 Spezialkarten in fünf Kategorien, teils selten oder legendär (einmalig, mit Nachteil); Synergiekarten belohnen eine Kategorie.
- Neues Layout: links die scrollbare Spielwelt mit dem Reich in Draufsicht, rechts eine Seitenleiste. Bauplätze klickt man direkt in der Welt an.
- Neue Spieler sehen die Systeme nacheinander, jedes mit einem kurzen Hinweis; erfahrene schalten das auf dem Startbildschirm ab.

## Entscheidungen, die der PO bestätigen sollte
Die vollständige Liste mit Begründung steht in `docs/STAND.md`, „Abweichungen und Auslegungen“ (26 Punkte). Die wichtigsten:

| Nr. | Punkt | Warum |
|---|---|---|
| 15 | **Kartenliste (41 Karten) wie im Plan vorgelegt; Freigabe steht aus** | Änderungen sind reine Datenänderungen in `data/draft-options.js` plus Texte |
| 2 | Anti-Patt-Regel „Reparatur-Abklingzeit“ bleibt, die beiden anderen sind entfernt | Ohne sie hält reine Verteidigung auf Leicht bis Minute 30 (REQ-21.4) |
| 6 | Vorrang der Mitte: die Mitte hilft den Seiten nur, wo schon gekämpft wird | Sonst tauschten zwei zielfreie Formationen endlos die Bahnen |
| 12 | Automatik und Klicken: es zählt das Maximum, nicht die Summe | Wortlaut REQ-44; Klicken lohnt ab der Mitte nur über der Automatik-Rate |
| 13 | Kaserne bis Stufe 6, damit 15 Versorgung ohne Karte erreichbar ist | „weiter um 2 je Stufe“ als „auch über Stufe 3 hinaus“ gelesen |
| 17 | Große Armee und Blitzkrieg ändern nur den Takt der eigenen Wellen | Sonst wäre der Nachteil keiner |
| 21 | Bauplätze nur per Mausklick in der Welt, nicht per Tastatur | Kleiner Nachtrag möglich (Zifferntasten), falls gewünscht |
| 24 | Bots spielen mit gestaffelter Einführung | Entspricht dem Standardweg eines neuen Spielers; ohne Einführung sind die Zahlen fast gleich (siehe unten) |
| 25 | „Einführung überspringen“ bleibt im Browser gespeichert | Wer sie einmal abschaltet, will sie meist nicht wieder |

## Kalibrierung (REQ-48, nur Konstanten in `config.js`)
| Konstante | vorher | jetzt | Grund |
|---|---|---|---|
| `XP_BASE` | 40 | 47 | Median-Abstand der Karten im Frühspiel 41 s → 50 s (Soll ≥ 45 s); erster Draft bleibt bei 86 s |
| `POST_SIEGE_GROWTH` | 0,6 | 1,1 | Mit Formationen hielt reine Verteidigung auf Leicht bis Minute 29 |
| `UNIT_STRENGTH_PER_LEVEL` | 0,08 | 0,16 | Partien ohne Schmiede gewannen auf Normal nur noch 7 % |
| `FX_QUALITAET` (Schmiede je Stufe) | 0,12 | 0,05 | Ausgleich zur höheren Grundstärke; die Schmiede bleibt lohnend, aber nicht Pflicht |
| `enemyBaseHp` Leicht / Normal / Schwer | 4.800 / 5.000 / 5.500 | 11.000 / 13.000 / 15.000 | Siege kamen 1–4 Minuten zu früh; mit Formationen fällt die Basis schnell, sobald die Front bricht |
| `waveGrowth` Leicht / Normal / Schwer | 0,3 / 0,6 / 0,9 | 0,45 / 0,7 / 1,0 | Ausgleich zur höheren Grundstärke |
| `hpGrowth` Leicht | 0,03 | 0,05 | dito |

Die Lebenspunkte der gegnerischen Basis wirken schwächer als erwartet: +25 % verlängern Partien um etwa 15 s. Die Dauer hängt vor allem daran,
wann die eigene Armee die Front bricht.

## Abnahmekriterien
| Kriterium | Soll | Ergebnis | |
|---|---|---|---|
| P0 und P1 (I4.1–I4.6) umgesetzt | erledigt | erledigt | ✔ |
| P2 (I4.7, I4.8) umgesetzt | erledigt | erledigt | ✔ |
| Tests | grün | `npm test` 83/83, Browser-Prüfung 62/62 | ✔ |
| Patt-Quote | ≤ 2 % | 0 von 3.000 | ✔ |
| Reine Verteidigung verliert spätestens in Minute 25 | alle Stufen | spätestens 24:46 (Leicht), 21:50 (Normal), 22:06 (Schwer) | ✔ |
| „aktiv“ gewinnt mindestens so oft wie „durchschnitt“ | je Stufe | 100/100 %, 96/81 %, 81/48 % | ✔ |
| Zielkorridore (REQ-21.4) | 15 Felder | 12 erfüllt, 3 verfehlt (siehe Kennzahlen) | ✘ |
| Keine Karte über +25 pp gegenüber „angeboten, nicht gewählt“ | alle | Große Armee +38 pp, Söldnerheer +32 pp (8 Partien) | ✘ |
| Klickanteil (REQ-03) | Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 % | 61–64 %, 23–25 %, 0,4–0,8 % | ✔ |
| Stopp ab Spät / Dauerklick | ≥ 95 % | 101 %, 102 %, 100 % | ✔ |
| Nie klicken / Dauerklick | ≤ 50 % | Leicht 101 %, Normal 49 %, Schwer 21 % | ✘ Leicht |
| Kartenabstand Frühspiel | ≥ 45 s | 50 s | ✔ |
| Erster Draft | 60–90 s | 86 s | ✔ |
| Ohne Schmiede auf Normal | ≥ 30 % | 28 % (100 Partien) | ✘ knapp |
| Bildzeit mit 60 Einheiten | ≤ 20 ms | 0,3 ms (1280×720), 0,7 ms (1920×1080) | ✔ |
| Kein offenes `##LÜCKE` | keins | keins | ✔ |
| Toter Code, entfallene Konstanten entfernt | ja | 17 Sprachschlüssel, 3 CSS-Klassen entfernt; keine ungenutzte Konstante | ✔ |
| README (Start, Steuerung, Scrollen), CHANGELOG | aktualisiert | aktualisiert | ✔ |
| Bericht | liegt vor | dieses Dokument | ✔ |

## Kennzahlen der Serie (200 Partien je Schwierigkeitsgrad und Spielertyp, gierige Heuristik)
| Schwierigkeit | Spielertyp | Siege | Median Sieg | Soll | |
|---|---|---|---|---|---|
| Leicht | aktiv | 100 % | 5:27 | 5–7 min | ✔ |
| Leicht | durchschnitt | 100 % | 6:08 | 6–9 min | ✔ |
| Leicht | gelegentlich | 100 % | 7:32 | Sieg, 10–18 min | ✘ zu schnell |
| Leicht | passiv | 0,5 % | – | darf verlieren | ✔ |
| Normal | aktiv | 96 % | 6:40 | 6–9 min | ✔ |
| Normal | durchschnitt | 81 % | 9:20 | 9–13 min | ✔ |
| Normal | gelegentlich | 41 % | 10:52 | darf verlieren | ✔ |
| Normal | passiv | 0 % | – | verliert | ✔ |
| Schwer | aktiv | 81 % | 8:45 | 8–12 min | ✔ |
| Schwer | durchschnitt | 48 % | 10:31 | 13–20 min | ✘ zu schnell |
| Schwer | gelegentlich | 30 % | 9:59 | verliert | ✘ |
| Schwer | passiv | 0 % | – | verliert | ✔ |

Weitere Kennzahlen:
- Größte eigene Armee je Partie (Median; aktiv, durchschnitt, gelegentlich): 21 Einheiten.
- Erster Mauerabschnitt fällt in 34 % der Partien, im Median bei 9:50.
- Partien mit mindestens einer legendären Karte: 11 %. Wahlrate nach Seltenheit: gewöhnlich 40 %, selten 41 %, legendär 57 %.
- Wahlrate nach Kategorie: Wirtschaft 50 %, Armee 40 %, Basis 28 %, Automatisierung 39 %, Sonderregel 45 %.
- Kartenabstand je Phase (Median): Früh 50 s, Mitte 49 s, Spät 93 s.
- Ohne gestaffelte Einführung (`KF_SKIP_INTRO=1`, 50 Partien je Feld) liegen Siegquoten und -zeiten meist innerhalb der Streuung;
  größte Abweichung: Schwer „durchschnitt“ gewinnt 58 % nach 9:11 (mit Einführung 48 % nach 10:31).
- Strategie (durchschnitt): gierige Heuristik gewinnt auf Schwer 56 %, zufällige Wahl 28 %; Abrisse fast nur beim Zufalls-Bot.

### Karten: Siegquote „angeboten und gewählt“ gegen „angeboten und nicht gewählt“ (aktiv und durchschnitt, 1.200 Partien)
| Karte | gewählt (Partien) | nicht gewählt | Differenz | Stufe I / II / III |
|---|---|---|---|---|
| grosseArmee | 43 | 25 | +38 | +38 / – / – |
| soeldnerheer | 8 | 41 | +32 | +32 / – / – |
| blitzkrieg | 23 | 40 | +23 | +23 / – / – |
| dauerauftrag | 146 | 123 | +19 | +19 / – / – |
| festungsbau | 49 | 230 | +14 | +14 / – / – |
| veteranen | 206 | 70 | +14 | +14 / – / – |
| taktiker | 137 | 118 | +12 | +12 / – / – |
| schrottsammler | 296 | 297 | +7 | +7 / +6 / – |
| weitschuss | 101 | 159 | +6 | +6 / – / – |
| gluecksritter | 75 | 224 | +5 | +5 / – / – |
| drill | 434 | 192 | +5 | +5 / -9 / – |
| belagerungsgeraet | 350 | 233 | +5 | +5 / +20 / – |
| verbrannteErde | 15 | 33 | +4 | +4 / – / – |
| kriegstrommeln | 270 | 322 | +3 | +3 / -18 / +17 |
| langeWurfarme | 247 | 356 | +2 | +2 / -10 / – |
| vorposten | 264 | 315 | +2 | +2 / – / – |
| schwerePressen | 492 | 119 | +1 | +1 / -19 / -14 |
| nachtschicht | 268 | 337 | +1 | +1 / +17 / – |
| zeugmeister | 96 | 174 | +0 | +0 / – / – |
| aushebung | 357 | 213 | +0 | +0 / +15 / – |
| sappeure | 144 | 94 | -0 | -0 / +28 / – |
| grossauftrag | 167 | 100 | -0 | -0 / – / – |
| handelskontor | 86 | 150 | -1 | -1 / – / – |
| schildwall | 259 | 333 | -1 | -1 / -2 / – |
| bauleitung | 97 | 180 | -5 | -5 / – / – |
| rationalisierung | 177 | 119 | -5 | -5 / – / – |
| bessereFabriken | 432 | 193 | -5 | -5 / -18 / +11 |
| notreserve | 74 | 208 | -5 | -5 / – / – |
| zinnen | 44 | 544 | -5 | -5 / -57 / – |
| selbstlaeufer | 171 | 125 | -6 | -6 / – / – |
| bastion | 289 | 369 | -7 | -7 / -19 / – |
| allesAufDieMitte | 52 | 10 | -8 | -8 / – / – |
| instandhaltung | 276 | 355 | -8 | -8 / -16 / +13 |
| maurerkolonne | 230 | 376 | -9 | -9 / -16 / -10 |
| kriegsanleihe | 130 | 142 | -9 | -9 / -7 / – |
| fliessband | 363 | 290 | -10 | -10 / -17 / – |
| doppelschicht | 399 | 189 | -10 | -10 / -11 / – |
| turmkanoniere | 241 | 376 | -11 | -11 / -10 / +0 |
| scharfschuetzen | 75 | 183 | -14 | -14 / – / – |
| serienbau | 249 | 319 | -18 | -18 / -2 / – |
| werkmeister | 46 | 157 | -19 | -19 / – / – |

Lesart: Die Differenz misst nicht allein die Stärke der Karte. Der Bot wählt eine Karte, wenn seine Vorausschau sie für besser hält;
Partien, in denen er eine starke Karte ablehnt, sind oft solche, in denen etwas anderes dringender war.

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Große Armee (+38 pp) und Söldnerheer (+32 pp)** liegen über der Grenze von +25 pp. Beide sind legendär und kommen selten (68 bzw. 49 Partien
   mit Angebot); Söldnerheer wurde nur 8-mal gewählt. Vorschlag zur Entscheidung: Große Armee Versorgung ×1,5 statt ×2; Söldnerheer erst nach
   einer Serie mit mehr Angeboten bewerten.
2. **Das Spielerprofil wirkt schwächer als vorgesehen.** „gelegentlich“ gewinnt auf Leicht nach 7:32 statt nach 10–18 Minuten und auf Schwer noch
   30 % der Partien. Automatik (REQ-44), Formationen und Kartenautomatik gleichen die seltenere Bedienung weitgehend aus. Über Gegnerstärke lässt sich
   der Abstand zwischen den Profilen kaum vergrößern: Stärkere Gegner treffen „aktiv“ ebenso. Ob das Spiel so gedacht ist, entscheidet der PO;
   technisch wären z. B. eine schwächere Automatik oder Karten mit Bedienaufwand denkbar.
3. **„Nie klicken“ gewinnt auf Leicht so oft wie Dauerklicken.** Die kostenlose erste Fabrik und die Automatik tragen Leicht allein.
4. **Ohne Schmiede 28 %** auf Normal (Soll 30 %, Serie mit 100 Partien; Vorversuch mit 20 Partien: 55 %). Die Streuung ist größer als der Abstand zum Soll.
5. **Lebenspunkte der gegnerischen Basis** mussten mehr als verdoppelt werden. Die Zahl im Kopf der Seite („Gegnerische Basis 13.000“) ist dadurch groß.
6. **Wahlraten außerhalb 5–60 %:** Schwere Pressen 73 %, Kriegsanleihe 66 %, Großauftrag 61 % (Wirtschaft wird bevorzugt), Alles auf die Mitte 92 % und
   Söldnerheer 0 % (beide mit weniger als 15 Angeboten).
7. **Bot-Vorausschau über die Belagerungswelle** (neu, REQ-48): Steht die Belagerung in höchstens 120 s bevor, rechnet der Bot bis 40 s nach ihrem Ausrücken
   voraus. Die Wirkung ist nicht getrennt gemessen; die Serie oben enthält sie bereits.

## Offen für den Product Owner
1. Freigabe der Kartenliste (41 Karten).
2. Umgang mit Große Armee und Söldnerheer (Auffälligkeit 1).
3. Soll „gelegentlich“ spürbar schlechter abschneiden? Falls ja: Automatik abschwächen oder später einsetzen (Auffälligkeit 2 und 3).
4. Handelskontor: laut Anforderung Kandidat für die Streichung nach dem nächsten Test mit Menschen; gebaut in 6–9 % der Partien.
5. Tastaturzugang zu Bauplätzen (Zifferntasten), falls gewünscht.
6. **Merge nach `main`:** wartet auf Freigabe (siehe unten).

## Merge nach `main`
`main` (Commit `306878c`, v0.3) ist Vorfahr des Branches; es gibt keine Konflikte, der Merge ist ein Vorspulen (Fast-Forward).
Nach Freigabe, entweder als Pull Request auf GitHub (Basis `main`, Vergleich `3x3-und-3-Lanes-Spiel`) oder direkt:
```
git fetch origin
git checkout main
git merge --ff-only origin/3x3-und-3-Lanes-Spiel
git push origin main
```
Danach zeigt GitHub Pages (falls für `main` eingerichtet) die neue Version.

## Rohdaten
`reports/i4-ziele.*` (3.000 Partien), `reports/i4-phasen.*` (1.800), `reports/i4-strategie.*` (300), `reports/i4-ohneSchmiede.*` (100),
`reports/i4-ziele-ohneEinfuehrung.*` (450). Erzeugt mit den Befehlen aus `CLAUDE.md`; `.json` enthält die Kennzahlen maschinenlesbar.

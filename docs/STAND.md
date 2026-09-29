# Klammerfront – Stand Iteration 6

Grundlage: `docs/anforderungen-iteration-6.md`. Branch: `iteration-6` (von `main`, Commit `a1e5bf2`, v0.6).
Stand von Iteration 5: `docs/archiv/STAND-iteration-5.md`.

**Starten:** `index.html` im Browser öffnen. Spieltest-Modus: `index.html?debug=1`.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| I6.0 | Basislinie v0.6 mit beiden Strategien, neue Kennzahlen | 6.09 | fertig |
| I6.1 | Formationen ohne Pendeln | 6.01 | offen |
| I6.2 | Versetzte Einzelangriffe, eigene Geschosse | 6.02 | offen |
| I6.3 | Offline-Reste, Pause bei verdecktem Tab, Kartenersatz | 6.03 | offen |
| I6.4 | Kartenwahl automatisch, Kaserne im Reiter „Armee“ | 6.04, 6.05 | offen |
| I6.5 | „Schwung“ entfernen, Leistungsziel, Schwer-Start | 6.10, 6.08 | offen |
| I6.6 | Universität | 6.06 | offen |
| I6.7 | Nachbarschaftsboni | 6.07 a | offen |
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
- I6.0: `npm test` 109/109. Die Strategie „einheiten-zuerst“ nutzt dieselbe Datei wie der Durchlauftest (`tools/browser-bot.js`), die
  Simulation lädt sie in ihren vm-Kontext; `tools/einfach-bot.mjs` entfällt. `tools/compare-human.mjs` ordnet Protokolle zusätzlich einer
  Strategie zu.

## Befunde der Fehler (REQ-6.01, REQ-6.02)
(folgt mit I6.1 und I6.2)

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

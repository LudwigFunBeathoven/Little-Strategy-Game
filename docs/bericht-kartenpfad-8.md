# Bericht Kartenpfad Teil 8: EP-Pacing, Reichweiten, Kartenbereinigung

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-8, Spielstand-Version 13. Anforderungen: `docs/anforderungen-kartenpfad-8-9.md`. Rohdaten: `reports/kartenpfad8-*`.

## Ergebnis

1. Die Hypothese des PO stimmt. Ab einem gewissen Ausbau gibt es alle 45 s eine Karte, weil der Balken bei wartender Wahl voll steht. Der Anzeigefehler („Karte in 0:00“) ist behoben.
2. Das Ziel „gebremste Wahlen höchstens 15 %“ ist **nicht erreicht**. Kostenkurve, abnehmender Ertrag des Forschungsbudgets und begrenzter Übertrag senken den Anteil nur, indem sie die Bots deutlich schwächen. Die ausgelieferte Konfiguration lässt alle drei Hebel ausgeschaltet; sie sind in `config.js` vorhanden und per `KARTEN.uebertrag` und `budget.abnahme` zuschaltbar. Die Entscheidung liegt beim PO (Abschnitt „Entscheidungen“).
3. Bezeichnung der Manufaktur (K8.04), Reichweitenleiter der eigenen Einheiten (K8.05), gegnerische Fern­kämpfer (K8.06), Entfernung des Belagerungsgeräts (K8.07) und Grenzfeste ×1,10 (K8.08) sind umgesetzt. Die Turmbedingung aus K8.06 ist mit der Leiter nicht vereinbar; die Abbruchregel greift (siehe unten).

## Befund der Basismessung (K8.01)

Normal, Profil durchschnitt, 50 Partien je Bot.

| Bot | gebremste Wahlen | Wartezeit Mittel | Abstand nach Min. 10 | wartende Stufen (Median des Höchstwerts) |
|---|---|---|---|---|
| Militär | 53 % | 14,8 s | 51,6 s | 1 |
| Wirtschaft | 80 % | 31,7 s | 45,1 s | 18 |
| Verteidigung | 55 % | 19,0 s | 50,4 s | 21 |
| ohne Kategorie | 57 % | 18,9 s | 51,1 s | 2 |

- Der Überschuss verfällt nicht, er staut sich als wartende Stufen. Bei Wirtschaft und Verteidigung zieht der Spieler am Ende Karten aus einem Rückstau.
- Treiber nach Minute 10: Schaden an der gegnerischen Basis (Militär und ohne Kategorie 92–95 % der EP dieses Zeitraums) und das Forschungsbudget (Wirtschaft 50 %). Abschüsse liefern 5–13 %.
- Auswertung eines Protokolls: `node tools/ep-protokoll.mjs <protokoll.json>`.

## Messung nach Abschluss

Gleiche Seeds, Normal, durchschnitt (Rohdaten `reports/kartenpfad8-*-auswertung.*`, Vergleich `reports/kartenpfad8-basis-auswertung.txt`).

| Bot | gebremst vorher → nachher | Abstand nach Min. 10 vorher → nachher | Wahlen (Median) |
|---|---|---|---|
| Militär | 53 % → 60 % | 51,6 → 50,4 s | 13 |
| Wirtschaft | 80 % → 85 % | 45,1 → 45,3 s | 20 |
| Verteidigung | 55 % → 64 % | 50,4 → 50,4 s | 22 |
| ohne Kategorie | 57 % → 57 % | 51,1 → 50,9 s | 15 |

Die Werte „nachher“ sind höher als „vorher“, ohne dass ein Hebel aktiv ist. Ursache sind die Entfernung des Belagerungsgeräts und die Änderung der Durchbruch-Karte; der Unterschied liegt zum Teil im Rauschen von 50 Partien.

## Abnahmetabelle

| REQ | Kriterium | Ergebnis |
|---|---|---|
| K8.01 | Kennzahlen, Rohdaten, Befund, Werkzeug | erfüllt (`tools/basis-p8.mjs`, `tools/ep-protokoll.mjs`) |
| K8.01 | Protokoll einer eigenen Partie auswerten | offen, [Mensch] |
| K8.02 | gebremste Wahlen ≤ 15 % je Bot | **nicht erreicht** (57–85 %) |
| K8.02 | ohne Kategorie, Normal, durchschnitt: 12–16 Wahlen, 13–17 min | erfüllt (15 Wahlen, 14:50) |
| K8.02 | Abstand nach Minute 10 ≥ 55 s | **nicht erreicht** (45–51 s) |
| K8.02 | Patt ohne Schalter steigt um höchstens 0,5 pp | grenzwertig: Normal 2 → 3 von 150 Partien (+0,7 pp, Rauschen) |
| K8.02 | Unit-Tests Übertrag und Verfall | erfüllt (`tests/ep8.test.mjs`) |
| K8.03 | Anzeige in drei Zuständen, Bildschirmfoto | erfüllt (`tests/browser-t8.mjs`, `docs/bilder/kartenpfad8-ep-mindestabstand.png`) |
| K8.04 | Manufaktur ohne Ordnungszahl, Bildschirmfoto | erfüllt (`docs/bilder/kartenpfad8-baumenue.png`) |
| K8.05 | Leiter strikt, ≥ 10 % je Stufe | erfüllt für eigene Einheiten (105 / 137 / 158 / 189 / 231) |
| K8.06 | Gegner mit Bogen- und Armbrustschützen, Schalter `?gegnerfern=aus` | erfüllt; Turmbedingung nicht erfüllbar |
| K8.06 | Patt mit `?druck=hoch` höchstens +1 pp | erfüllt (in keinem der 16 Felder ein Patt; Siegquoten siehe unten) |
| K8.07 | Belagerungsgerät entfernt | erfüllt; Partien werden länger (siehe Auffälligkeiten) |
| K8.08 | Grenzfeste ×1,10, Differenz ≥ −10 pp | erfüllt (−4 pp, Teil 7: −24 pp) |
| K8.09 | Spielstand-Version 13 | erfüllt (Spielstände der Version 12 werden verworfen) |

## Gegnerische Fernkämpfer (K8.06)

Sieg / Patt / Dauer, durchschnitt, 50 Partien. Links Fernkämpfer aus, rechts an.

| Grad | Druck | Bot | aus | an |
|---|---|---|---|---|
| Normal | aus | Militär | 100 % / 0 % / 14:24 | 98 % / 0 % / 12:39 |
| Normal | aus | Wirtschaft | 92 % / 0 % / 16:29 | 88 % / 0 % / 15:55 |
| Normal | aus | Verteidigung | 92 % / 0 % / 20:43 | 88 % / 0 % / 19:35 |
| Normal | hoch | Militär | 100 % / 0 % / 13:08 | 96 % / 0 % / 13:38 |
| Normal | hoch | Wirtschaft | 86 % / 0 % / 17:01 | 88 % / 0 % / 15:34 |
| Normal | hoch | Verteidigung | 74 % / 0 % / 22:12 | 70 % / 0 % / 19:50 |
| Normal | hoch | ohne | 92 % / 0 % / 15:26 | 98 % / 0 % / 14:47 |
| Schwer | hoch | Militär | 88 % / 0 % / 13:32 | 86 % / 0 % / 12:35 |
| Schwer | hoch | Wirtschaft | 78 % / 0 % / 16:17 | 70 % / 0 % / 15:48 |
| Schwer | hoch | Verteidigung | 90 % / 0 % / 20:20 | 80 % / 0 % / 19:55 |
| Schwer | hoch | ohne | 78 % / 0 % / 15:33 | 78 % / 0 % / 14:34 |

Die Fernkämpfer senken die Siegquote um 0 bis 10 Prozentpunkte und verkürzen die Dauer. Bots gewinnen weiter fast immer; der Effekt bei Menschen kann deutlich größer sein (Annahme 3 der Anforderungen). Vollständige Tabelle: `reports/kartenpfad8-gf-*`.

## Abweichungen und Auslegungen

1. **Turmbedingung (K8.05/K8.06):** Die Leiter hebt jede eigene Fernkampfreichweite über die Grundreichweite des eigenen Turms (120) und des gegnerischen (95). Die Bedingung „gegnerische Fernkämpfer nicht über die Turmreichweite“ ist damit nicht erfüllbar. Nach der Abbruchregel behalten die **Gegner** ihre bisherigen Reichweiten (Bogen 120, Armbrust 140); die Leiter gilt nur für eigene Einheiten (`baseRange(type, side)`). Folge: Die gegnerische Armbrust (140) überragt den eigenen Turm (120). **Entscheidung des PO nötig.**
2. **Hebel des EP-Pacings:** Übertragsgrenze und abnehmender Budgetertrag sind implementiert, aber ausgeschaltet. Gründe: Mit Übertragsgrenze 25 % sank die Siegquote der Wirtschafts- und Verteidigungs-Bots deutlich; das Pausieren von Budget und Tausch bei Verfall (`xpVerfaellt`) milderte das, behob es aber nicht. Abbruchregel T.1 (nach drei Kalibrierschritten außerhalb des Korridors): berichten, nicht weiter einstellen.
3. **Belagerungsgerät (K8.07):** Entfernt wie vorgeschlagen. Die Partien des Bots ohne Kategorie wurden dadurch im Test ohne Gegner-Fernkämpfer von 15:34 auf 19:30 länger, mit Fernkämpfern auf 14:55 (Rest-Effekt der Kombination). Die Alternative „Karte ohne Nachteil nur mit Gießerei“ ist nicht umgesetzt. **Bestätigung des PO fehlt.**
4. **Durchbruch Stufe II** erhält `siegeDps +2` als Ersatz für den Wegfall des Belagerungsgeräts.

## Auffälligkeiten (berichtet, nicht wegbalanciert)

- Wirtschaft und Verteidigung stauen 13–24 Stufen. Das Forschungsbudget und der Schaden an der Basis liefern in der zweiten Partiehälfte mehr EP, als die Mindestabstand-Bremse abgibt.
- Verteidigung, Normal, Druck hoch: Siegquote 70–74 % und Partien von fast 20 min.
- Patt Leicht (gelegentlich) ohne Kategorie: 12 % (unverändert gegenüber vorher).

## Entscheidungen des PO

1. EP-Pacing: (a) Rückstau akzeptieren und nur die Anzeige verbessern (aktueller Stand), (b) Hebel zuschalten und die Bots dafür nachkalibrieren, (c) Durchsatz begrenzen (neuer Mechanismus, z. B. EP-Quelle Basisschaden mit abnehmendem Ertrag), (d) das Ziel neu fassen. Empfehlung: (c) prüfen, weil die Bots schwächer werden, wenn nur der Verfall greift.
2. Gegnerische Reichweiten: Leiter auch für Gegner (dann überragen sie die eigenen Türme) oder wie jetzt.
3. Belagerungsgerät: endgültig entfernen oder als Karte ohne Nachteil mit Gießerei erhalten.

# Klammerfront – Testleitfaden Kartenpfad Teil 4 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob Menschen die Strategielinien (Militär, Wirtschaft, Verteidigung) bemerken und bewusst nutzen, ob die Aufwertung von Gebäuden zu Varianten Entscheidungen auslöst
und ob die besonders starken Karten (Schlüsselkarten) erscheinen und wirken. Anforderungen: `docs/anforderungen-kartenpfad-4.md`, Bericht: `docs/bericht-kartenpfad-4.md`.
Die Werte sind für Bots eingestellt; der Spieltest ist die Probe, ob Menschen im Takt liegen. Der Spieltest folgt nach Teil 4 (nicht vorher).

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen (privat, Protokoll immer an). Neu in Teil 4 (alle nur im Modus `karten`, der im Testbuild Standard ist):
   - Kaserne ab Spielstart baubar; Kriegserfahrung, Serienbau, Bauleitung und die Forschung „Ingenieurskunst“ gibt es nicht mehr.
   - **Aufwertung** von Fabrik, Kaserne und Schmiede zu einer Variante: ab Minute 3 als Aktion am angeklickten Gebäude (Kosten das Zweifache der Baukosten, zehn Sekunden Bauzeit, in der das Gebäude ruht).
   - **Linien**: erscheinen erst, wenn eine Linie zwei Zeichen hat (Anzeige „Linien“ in der Leiste, ein Hinweis). Zeichen tragen Karten und Varianten.
   - **Schlüsselkarten**: ab Wahl 3, spätestens in jeder dritten Wahl eine (wenn ihre Wirkung im Spiel etwas bewirkt).
2. **Schalter `?druck=hoch`** (Adresse des Testbuilds, ergänzen): Reguläre Gegnerwellen sind ab Minute 4 um ein Drittel größer. **Nur für Personen, die die Verteidigung ausprobieren sollen**, sonst kommt kaum ein Gegner an Mauer und Türme.
   Weitere Schalter wie in Teil 2 und 3: `?pacing=standard` (Vergleich mit `main`), `?zeit=lauf`, `?buehne=0`, `?entdecken=0`.
3. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen: Dann erscheint der Startbildschirm. Schwierigkeit Normal (Leicht für Neulinge).
4. **Nicht helfen, nicht erklären, die Linien nicht nennen.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 35 Minuten, eine Partie)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 12–15 min | Partie im Modus `karten`; eine Hälfte der Personen mit `?druck=hoch`. Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 10 min | Fragen unten. |
| 4 | 8 min | Auswertung mit der Person: Protokoll ansehen, an welchen Stellen die Aufwertung oder die Linienanzeige auffiel. |

## Fragen
Die ersten sechs aus Teil 3 (Takt, Wahl, Kartensymbol, Dauer, Ermüdung, Namen) bleiben. **Fünf neue Fragen:**
1. **Linie bemerkt?** Hast du bemerkt, dass dein Spiel in eine Richtung ging (Militär, Wirtschaft, Verteidigung), bevor es dir angezeigt wurde? Woran? Hat dich die Anzeige „Linien“ überrascht, bestätigt oder gestört?
2. **Bewusst gespielt?** Hast du bewusst eine Richtung verfolgt oder die Karten einzeln bewertet? Hat sich der Weg ab Wahl 3 mit der Karte oder mit der Aufwertung entschieden?
3. **Aufwertung:** Hast du lange überlegt, welche Variante du wählst? War klar, was jede Variante bewirkt? Hast du bereut, dass die Wahl endgültig ist? Hast du ein Gebäude abgerissen, um neu zu wählen?
4. **Starke Karte:** Ist dir eine Karte aufgefallen, die deutlich stärker war als die übrigen (eine Schlüsselkarte)? Hat sie dein Spiel verändert? Hast du eine solche Karte vermisst?
5. **Verteidigung (nur mit `?druck=hoch`):** Hat sich die Verteidigung gelohnt (Mauer, Türme, Gegenstoß)? Kam genug Druck? Wusstest du, wie du die Partie am Ende gewinnst?

## Beobachten
- Stellen, an denen die Person die Aufwertung lange offen lässt, oder die Aktion nicht findet (Gebäude anklicken).
- Die erste Aufwertung: Uhrzeit, Variante, ob die Person liest, was sie bewirkt.
- Ob die Person nach dem Hinweis „Linie Stufe 1“ anders wählt.
- Ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 2, erweitert; Felder neu in Teil 4)
- `druck`: `null` oder `hoch`; `switches.pressure`: `aus` oder `hoch`.
- `lines`: je Linie `signs`, `stage` und die Zeitpunkte `t1`, `t2`, `t3` (Sekunden Spielzeit), zu denen die Stufe erreicht wurde (`null`: nie).
- `variants[]`: fertige Gebäude-Varianten mit Zeitpunkt (`id`, `t`). In `actions[]` steht `upgradeBuilding` mit dem Platz (`arg`) und der Kennung der Variante (`variant`).
- `wallHpLost`: Summe der verlorenen Lebenspunkte der Mauer (ohne Reparatur und Heilung).
- Je Wahl in `drafts[]` wie in Teil 3 (`sollS`, `erschienenS`, `chosen`, `offered`).

## Auswertung (Vorschläge)
- Zeitpunkt von `lines.*.t1` und `t2` je Person: Ab Minute 8 hat der Takt der Linien keine Wirkung auf das Frühspiel; Stufe 2 vor Minute 4 (wie bei Bots) wäre ein Hinweis, dass die Zeichen zu schnell kommen.
- Anteil der Personen mit mindestens einer Aufwertung bis Minute 5; Verteilung der Varianten (`variants[]`): Wird nur Manufaktur gewählt, ist sie zu stark.
- Wahl einer Schlüsselkarte (`chosen` mit `drillmeister`, `vorhut`, `handelsnetz`, `ruecklage`, `bollwerk`, `gegenstoss`) und Partieausgang.
- Mit `?druck=hoch`: `wallHpLost` und Ergebnis. Die Beobachtung zählt mehr als die Zahl.

# Klammerfront – Testleitfaden Kartenpfad Teil 7 bis 9 (Branch `exp/kartenpfad`)

Zweck: Teil 7 (Haupthaus, Weiterentwicklungen) wie in `docs/testleitfaden-kartenpfad-7.md`, dazu die Neuerungen aus Teil 8 (Wahltakt, Reichweiten, Gegner) und Teil 9 (lesbare Karten, knappe Texte).

## Vorbereitung (Testleitung, 5 Minuten)
1. Testbuild öffnen (privat, Protokoll immer an). Neu seit dem letzten Leitfaden:
   - **Wahltakt (Teil 8):** Die Leiste zeigt den Fortschritt zur nächsten Wahl. Steht der Balken voll, heißt es „Nächste Wahl in 0:23 · Mindestabstand“. Es gibt nie mehr „Karte in 0:00“.
   - **Manufaktur ohne Nummer.** Die Zahl steht nur in der Grenzanzeige.
   - **Reichweiten:** Bogenschütze, Armbrustschütze, Katapult und Geschütz reichen in dieser Reihenfolge weiter (Werfer kürzester).
   - **Gegner mit Fernkämpfern** ab der größeren Wellen; Schalter `?gegnerfern=aus` schaltet sie ab.
   - **Kein Belagerungsgerät** mehr im Pool; Grenzfeste verlängert den Wellenabstand um 10 %.
   - **Karten (Teil 9):** Name, eine Wirkungszeile, bei Nachteil eine eigene Zeile mit `▼`. Kategorie als Farbe und Symbol im Band, Familie als Rahmen, Seltenheit als Ring; die Wörter stehen im Tooltip.
   - **Keine Phasenanzeige** in der Leiste („Stufe 4“ statt „Stufe 4 · Mitte“).
2. Schalter wie bisher: `?druck=hoch`, `?pacing=standard`, `?gegnerfern=aus`. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen.
3. Privates Fenster, mindestens 1280×720; eine Person zusätzlich auf einem Telefon (375 px Breite).
4. Nicht helfen, nicht erklären. Laut denken erlauben.

## Ablauf (je Person etwa 45 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 13–17 min | Partie 1 (Normal). Danach Protokoll speichern. |
| 3 | 13–17 min | Partie 2 (Normal) mit `?druck=hoch`. Protokoll speichern. |
| 4 | 10 min | Fragen. |
| 5 | 5 min | Auswertung: `node tools/ep-protokoll.mjs <protokoll.json>` zeigt Wartezeit am Mindestabstand und Abstand der Wahlen. |

## Fragen
**Teil 8**
1. Hat die Wahl nach Minute 10 auf sich warten lassen, während der Balken voll stand? Hast du verstanden, warum? (Kriterium K8.02/K8.03: der Balken steht nicht regelmäßig voll; die Anzeige erklärt das Warten ohne Hilfe.)
2. Haben die gegnerischen Bogen- und Armbrustschützen die Partie verändert? Wie hast du reagiert?
3. Hast du Geschütze oder Katapulte gebaut? Fiel dir ein Reichweitenunterschied zu den Türmen auf?

**Teil 9**
4. Kannst du auf einer Karte ohne Tooltip erkennen, was sie bringt und was sie kostet? Wo sahst du den Nachteil?
5. Hast du Kategorie (Wirtschaft, Militär, Verteidigung) an der Farbe erkannt? Wozu dienten Rahmen und Ring?
6. Gab es einen Text, der zu lang, unklar oder veraltet war? Welcher?
7. [Telefon] Ist die Karte bei 375 px lesbar? Wird etwas abgeschnitten? (Bildschirmfoto machen.)

**Aus Teil 7** (Fragen 1–6 in `docs/testleitfaden-kartenpfad-7.md` unverändert.)

## Auswertung
Protokolle ablegen unter `reports/spieltest-*`. Je Person notieren: Anteil gebremster Wahlen (`ep-protokoll`), Zahl der Wahlen, Partiedauer, Ergebnis, Antworten.

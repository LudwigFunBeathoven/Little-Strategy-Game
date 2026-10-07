# Klammerfront – Testleitfaden Kartenpfad (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob die Kartenwahl als zentrale Entscheidung trägt. Der Branch bindet Gebäude, Einheiten, Ausbaustufen und Forschungen an Karten
(Vorbild *Stellaris*) und zeigt die Wahl auf einer Kartenbühne in der Bildmitte (`docs/anforderungen-kartenpfad.md`). Dieser Test klärt vor allem drei Fragen:
Spüren Spieler, dass sie mit jeder Pfadkarte einen Bonus liegen lassen? Wartet jemand zu lange auf die eine Karte? Und: Trägt die Zweistufigkeit
(erst die Technologiekarte, dann die Forschung in der Universität)? Für das Tutorial gilt zusätzlich `docs/testleitfaden-tutorial.md`.

## Vorbereitung (Testleitung, 5 Minuten)
1. Den **Testbuild** des Branches öffnen (Protokoll ist dort immer an, Modus `karten`) oder lokal `index.html?debug=1`. `?pacing=standard` zeigt zum Vergleich das Verhalten von `main`
   (Karten im Reiter, nichts gesperrt). Keine Parameter `?lang=`, `?difficulty=` oder `?tutorial=` anhängen: Dann erscheint der Startbildschirm.
2. Privates Fenster oder frisches Profil (sonst fehlt das Tutorial). Fenster mindestens 1280×720, Tab nicht wechseln.
3. Zwei Gruppen mischen: Personen, die das Spiel aus dem Tutorial-Test kennen, und Personen, die es nicht kennen. Erfahrung mit Strategie- oder Idle-Spielen notieren.
4. **Nicht helfen, nicht erklären.** Laut denken ausdrücklich erlauben. Bei jeder Kartenwahl die Uhrzeit notieren.

## Ablauf (je Person etwa 30 Minuten)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung: „Ein Strategiespiel im Browser. Bitte spiel wie zu Hause, sag laut, was du denkst.“ |
| 2 | 3–5 min | Startbildschirm und Tutorial (Statthalter, Quartiermeister). Beobachten: Wirkt die Sprache ruhig und klar? Beachtet die Person die erste Kartenwahl auf der Bühne? |
| 3 | bis 20 min | Weiterspielen ohne Hilfe bis Sieg, Niederlage oder 20 min. Beobachten: Welche Karte wird gewählt, wie lange wird überlegt, wird „Später“, „Neu ziehen“ oder „Bannen“ benutzt, wird die Sammlung (Reiter „Karten“) angesehen? Danach Knopf **„Protokoll“** oben rechts, Datei speichern. |
| 4 | 8 min | Fragen 1–9 (unten). |

## Beobachtungsfragen
1. **Welche Karte hast du gewählt und warum?** (je Wahl, auch wenn es Bonuskarten waren)
2. **Wann hast du auf eine Karte gewartet?** (Welche, und wie lange? Hast du das Warten als Spannung oder als Ärger erlebt?)
3. Hast du gemerkt, dass eine Bau- oder Technologiekarte „einen Bonus kostet“? Hat das deine Wahl verändert?
4. Wusstest du, was gesperrt ist und woher die Freischaltung kommt („Freischaltung: Karte …“, „Öffnet mit: Karte …“)? Wo hast du nachgesehen?
5. Technologiekarte, dann Forschung: War klar, dass die Einheit erst nach der Forschung kommt? War das zu spät, zu langsam, oder spannend?
6. Fortgeschrittene Taktiken oder Ballistik: Hast du die Entscheidung als Weichenstellung erlebt? Hast du den Ausschluss der anderen Karte bemerkt?
7. Wagnis-Karten (Glaskanonen, Volle Auslastung): gesehen, gewählt, bereut?
8. Die Kartenbühne: Pause bei offener Wahl, „Später“, Tastatur (1 bis 4), Stapel am unteren Rand. Was hat geholfen, was gestört? Hat dich die Pause aus dem Spiel gerissen?
9. Die Sprache (Statthalter, Quartiermeister, „Wellen“): angemessen, zu sachlich, zu hart?

## Protokollvorlage (je Person)
| Feld | Eintrag |
|---|---|
| Person (Kürzel), Datum, Erfahrung | |
| Sprache, Stufe, Tutorial an oder aus | |
| Gewählte Karten in Reihenfolge, je mit Zeit (aus dem Protokoll: `drafts`) | |
| Bedenkzeit je Wahl in Sekunden (`thinkMs`), Neu ziehen und Bannen (`rerolled`, `banned`) | |
| Freischaltungen mit Zeit (`unlocks`), abgeschlossene Forschungen mit Zeit (`researchDone`) | |
| Ratlose Momente (Uhrzeit, was war los) | |
| Ergebnis, Dauer, Protokolldatei | |
| Antworten auf Fragen 1–9, Zitate | |

## Auswertung
Das Protokoll (Format 2) enthält zusätzlich zu den bisherigen Feldern: `pacing`, `stage`, `drafts` (gewählte Karte, Alternativen `offered`, Familie, Bedenkzeit `thinkMs`,
`rerolled`, `banned`), `unlocks` (Schlüssel mit Spielzeit) und `researchDone`. Zahl und Zeitpunkte der Kartenwahlen stehen in `drafts`; Wartezeiten ergeben sich aus dem Abstand der
Wahlen und aus der Zeit zwischen Freischaltung und erster Nutzung.

**Lesehilfe (Vorschläge, keine Vorgaben):**
- Mehr als 3 min zwischen zwei Wahlen oder Äußerungen wie „ich warte auf …“ zeigen, dass Meilenstein-Platz und Mindesttempo nicht reichen.
- Wählen fast alle Personen immer die Pfadkarte, ist die Entscheidung „Bau gegen Bonus“ keine; wählt kaum jemand sie, bleibt der Pfad liegen. Die Kennzahl steht im Bericht (Wahlbreite).
- Bedenkzeiten unter 3 s bei Technologiekarten sprechen dafür, dass die Karten nicht gelesen werden; über 30 s für Überforderung durch Text.
- Die Beobachtung zählt mehr als die Zahl.

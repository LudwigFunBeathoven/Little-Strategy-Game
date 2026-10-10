# Klammerfront – Testleitfaden Kartenpfad Teil 3 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob der Takt der Kartenwahlen (etwa eine Wahl je Minute, zehn Wahlen in gut elf Minuten) im Spiel mit Menschen trägt, ob die Wahl zwei Wege
gegeneinander stellt und ob eine Partie 10 bis 14 Minuten dauert. Anforderungen: `docs/anforderungen-kartenpfad-3.md`, Bericht: `docs/bericht-kartenpfad-3.md`.
Der Fahrplan ist für einen Bot eingestellt; der Spieltest ist die Probe, ob Menschen im Takt liegen.

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen (privat, Protokoll immer an). Zusätzlich zu den Schaltern aus Teil 2 gilt `?pacing=standard` für den Vergleich mit `main`.
2. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen: Dann erscheint der Startbildschirm.
   Erste Partie mit Tutorial, **Schwierigkeit Normal** (Leicht für Neulinge, Schwer nur für Geübte).
3. **Nicht helfen, nicht erklären.** Laut denken ausdrücklich erlauben. Den Fahrplan nicht nennen.

## Ablauf (je Person etwa 30 Minuten, eine Partie)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 12–15 min | Partie im Modus `karten`. Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 8 min | Fragen unten. |
| 4 | 5 min | Auswertung mit der Person: Protokoll ansehen, an welchen Stellen die Wahl störte oder fehlte. |

## Fragen
1. **Takt:** Kam die nächste Karte zu früh, zu spät, genau richtig? Gab es Phasen, in denen du auf eine Karte gewartet hast? Phasen, in denen du keine Zeit zum Lesen hattest?
2. **Wahl:** War bei jeder Wahl ein echter Unterschied zwischen den Karten? Gab es Wahlen, bei denen du nicht abwägen musstest? Welche Karten fehlten dir, welche waren sinnlos?
3. **Kartensymbol:** Hast du den Füllstand und die Zeitanzeige („Karte in 0:42“) bemerkt? Wusstest du, wann die nächste Wahl kommt?
4. **Dauer:** Wie lang hat sich die Partie angefühlt? Gab es eine Phase, die sich zog?
5. **Ermüdung der Bühne:** Die Bühne erscheint zehnmal. Wurde sie bei den späteren Wahlen lästig? Ab welcher Wahl?
6. **Namen:** Kam dir ein Kartenname doppelt oder verwirrend vor (zum Beispiel Festungsbau und Mauerwerk)?

## Beobachten
- Stellen, an denen die Person die Wahl auffällig schnell oder auffällig langsam trifft (Protokoll: `thinkMs`).
- Ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 2, erweitert)
Je Wahl in `drafts[]` zusätzlich zu Teil 1 und 2:
- `sollS`: Zielzeit des Fahrplans für diese Wahl (Sekunden Spielzeit). `erschienenS`: Spielzeit, zu der die Wahl erschien. `t`: Spielzeit der Entscheidung (die Spielzeit steht bei offener Wahl).
- **Abweichung vom Fahrplan = `erschienenS` − `sollS`.** Negativ heißt: früher als geplant (zum Beispiel durch viele EP), positiv: später (kommt nur vor, wenn die Wahl durch den Mindestabstand von 45 s aufgeschoben wurde).
- `level`: Nummer der Wahl. `chosen`, `offered`, `family`: gewählte Karte, Angebot, Familie (`bau`, `technologie`, `wagnis`, sonst `bonus`).
- Im Spielstand (`G.S.stats.wahlen`) steht dieselbe Reihe mit `n`, `soll`, `t`, `tp`.

## Auswertung (Vorschläge)
- Median der Abweichung je Wahl über alle Personen: Liegt er für Wahl 1 bis 10 innerhalb von ±20 s, trägt der Fahrplan auch bei Menschen. Auffällig frühe Wahlen (mehr als −30 s) zeigen, dass die EP-Schwellen zu niedrig sind.
- Anteil der Wahlen, bei denen eine Pfadkarte gewählt wurde, je Person; wenn Bonuskarten kaum noch gewählt werden, sind die zwei Pfadplätze zu stark.
- Bedenkzeit (`thinkMs`) über die Wahlen: Sinkt sie ab Wahl 6 stark, ermüdet die Bühne.
- Die Beobachtung zählt mehr als die Zahl.

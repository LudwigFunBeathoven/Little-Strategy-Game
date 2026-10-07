# Klammerfront – Stand Branch „Kartenpfad“ (`exp/kartenpfad`)

Grundlage: `docs/anforderungen-kartenpfad.md`. Branch von `main` (Commit `9b3ccbe`, v0.8). Stand Tutorial: `docs/archiv/STAND-tutorial.md`.

**Starten:** `index.html` im Browser öffnen. Spieltest-Modus: `?debug=1`.

## Voraussetzungen (KP.0)

| Frage | Befund |
|---|---|
| Iteration 6 auf `main`? | ja (v0.7, später v0.8 mit Tutorial) |
| Tutorial Teil 1 und 2 umgesetzt? | ja; die Texte aus KP.08 ersetzen die Entwürfe (KP.1, fertig) |
| `docs/branch-konzepte-pacing.md` vorhanden? | **nein**; das Dokument liegt nicht im Repository. Der Unterbau (§4.1) wird nach den Angaben in `anforderungen-kartenpfad.md` ausgelegt |
| Gemeinsamer Unterbau (Freischaltlogik, Einheitenersatz, `PACING_MODUS`)? | **nein**; Schalter und Freischaltlogik entstehen mit KP.3 – KP.5 |

## Inkremente

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| KP.1 | Tutorial-Sprache, Glossar, Sprach-Audit | KP.08 | fertig |
| KP.2 | Kartenbühne | KP.03 | fertig (Familien-Band und „Pfadkarte“-Hinweise folgen mit KP.3) |
| KP.0, KP.3 | Unterbau, Kartenfamilien, Startzustand | KP.01, 02, 06 | offen |
| KP.4 | Universität als Forschungsstätte | KP.04 | offen |
| KP.5 | Upgrades, Einheitenersatz | KP.05 | offen |
| KP.6 | Wagnis, Exklusivpfade, Mindesttempo | KP.06, 07 | offen |
| KP.7 | Bots, Simulation, Bericht, Testbuild | KP.09 | offen |

## KP.1

- Ersatztexte und Glossar nach KP.08 in `i18n/de.js`, `i18n/en.js`; `tut.bye1.karten` gilt im Modus `karten` (Konfigurationswert `PACING_MODUS`, vorher `PACING_MODE`).
- Schwebende Zahl der ersten Erfahrung: „+{n} Erfahrung“ (`tut.xpBounty`).
- Sprach-Audit: `tests/sprache.test.mjs`, Wortliste `tools/sprachliste.mjs`. Geprüft werden alle Schlüssel mit Präfix `tut.` und `kp.`.
- Der Spielstand und die Simulation ändern sich nicht (Texte ohne Logik).

## KP.2

- `stage.js`: Kartenbühne (Schleier, Kartenreihe genau in der Bildmitte, Detailzeile, „Neu ziehen“, „Bannen“, „Später“) und Stapel (Füllstand = Fortschritt zur nächsten Wahl, Zahl der gewählten Karten).
  Schalter: `UI.kartenbuehne` (`null` = an im Modus `karten`, aus im Modus `standard`), URL `?buehne=1|0`. Im Standardmodus bleibt alles wie in v0.8.
- Zahlen in `config.js` (`KARTENBUEHNE`): Breite 16 % (160–260 px), Aufdecken 110 ms je Karte im Abstand von 110 ms, Fächer ±6°, Heben 8 %, Schleier 45 %, Zeit `pause`.
- **Spielzeit:** v0.6/v0.8 hielten die Zeit an, solange eine Wahl offen war (`core.js`, `tick`). Das bleibt der Standard (`KARTENBUEHNE.zeit = 'pause'`); `langsam` (Faktor 0,2) und `lauf` sind Schalterwerte im Kern und per Test belegt, aber nicht in der Oberfläche einstellbar.
- Eingabesperre: mindestens `UI.draftLockMs` (400 ms), bei vielen Karten bis zum Ende des Aufdeckens. Neu ziehen und Bannen sperren erneut. Ist eine Maustaste gedrückt, öffnet die Bühne erst nach dem Loslassen.
- Tasten `1`–`9` wählen, Pfeile bewegen den Fokus, `Enter` wählt die fokussierte Karte. Ziffern und Pfeile gehören bei offener Bühne nicht mehr den Einheiten und der Kamera.
- Reiter „Karten“: Sammlung (gewählte, gebannte Karten); gewählt wird nur auf der Bühne. Die Bühne wechselt keinen Reiter.
- Hinweise (Erstkontakt) erscheinen nicht bei offener Bühne. Die Sprechblase der ersten Kartenwahl sitzt über der Bühnenüberschrift.
- Tests: `tests/stage.test.mjs` (Spielzeit), `tests/browser-check.mjs` (Abschnitt „Kartenbühne“, 1280×720 und 1920×1080).

## Auslegungen und Abweichungen (zur Zustimmung durch den PO)

1. Das Dokument `branch-konzepte-pacing.md` fehlt; der Unterbau folgt allein den Angaben im Anforderungsdokument.
2. Das Audit prüft das Präfix `tut.` statt `tutorial.` (so heißen die Schlüssel im Spiel) und `kp.` für die Texte des Branches.
3. Die Wortliste trifft am Wortanfang: „Kriegsbeute“ trifft „Krieg“, die Forschung „Eisenwaffen“ trifft „Waffe“ nicht. Sonst wäre der in KP.04 vorgegebene Name unzulässig.
4. Der Auftrag „Stelle drei Läufer auf.“ nutzt „aufstellen“ wie im Glossar; die Schaltfläche trägt nur den Einheitennamen.
5. Der Stapel steht am unteren Rand der Spielwelt (bei geschlossener Bühne) und rückt bei offener Bühne an den unteren Fensterrand, damit er keine Karte verdeckt.
6. Das Familienband trägt vorerst die bisherige Kategorie (Wirtschaft, Armee …), das Symbol ist ein Schriftzeichen je Kategorie; die Familien (Bonus, Bau, Technologie, Wagnis) kommen mit KP.3.
7. „Vorher/Nachher“-Werte bei Bonuskarten: Die Karte zeigt den Beschreibungstext mit dem Wert; eine Vorher/Nachher-Zeile gibt es erst, wenn die Kartendaten sie ausweisen (offen).

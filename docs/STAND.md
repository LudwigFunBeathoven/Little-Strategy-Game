# Klammerfront – Stand Branch „Kartenpfad“ (`exp/kartenpfad`)

Grundlage: `docs/anforderungen-kartenpfad.md`. Branch von `main` (Commit `9b3ccbe`, v0.8). Stand Tutorial: `docs/archiv/STAND-tutorial.md`.

**Starten:** `index.html` im Browser öffnen. Spieltest-Modus: `?debug=1`.

## Voraussetzungen (KP.0)

| Frage | Befund |
|---|---|
| Iteration 6 auf `main`? | ja (v0.7, später v0.8 mit Tutorial) |
| Tutorial Teil 1 und 2 umgesetzt? | ja; die Texte aus KP.08 ersetzen die Entwürfe (KP.1, fertig) |
| `docs/branch-konzepte-pacing.md` vorhanden? | **nein**; das Dokument liegt nicht im Repository. Der Unterbau (§4.1) wird nach den Angaben in `anforderungen-kartenpfad.md` ausgelegt |
| Gemeinsamer Unterbau (Freischaltlogik, Einheitenersatz, `PACING_MODUS`)? | **nein, daher nachgezogen**: zuerst auf `main` (Commit `5c2f57b`, Standardmodus unverändert, Golden-Test grün), danach `exp/kartenpfad` darauf neu aufgesetzt. Beschreibung und Basislinie unten |

## Inkremente

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| KP.0 | Voraussetzungen, Unterbau auf `main`, Basislinie | KP.01 | fertig |
| KP.1 | Tutorial-Sprache, Glossar, Sprach-Audit | KP.08 | fertig |
| KP.2 | Kartenbühne | KP.03 | fertig (Familien-Band und „Pfadkarte“-Hinweise folgen mit KP.3) |
| KP.3 | Kartenfamilien, Startzustand, Meilenstein-Platz | KP.01, 02, 06 | fertig (nur Bau-Karten; Technologie mit KP.4, Wagnis mit KP.6) |
| KP.4 | Universität als Forschungsstätte | KP.04 | offen |
| KP.5 | Upgrades, Einheitenersatz | KP.05 | offen |
| KP.6 | Wagnis, Exklusivpfade, Mindesttempo | KP.06, 07 | offen |
| KP.7 | Bots, Simulation, Bericht, Testbuild | KP.09 | offen |

## Pacing-Unterbau (KP.0, Vorarbeit für den Branch „Kartenpfad“)

Gemeinsamer Unterbau auf `main`, Standardmodus unverändert (Golden-Test `tests/unveraendert.test.mjs` grün, `tests/pacing.test.mjs` neu).

- Schalter `PACING_MODUS` (`config.js`, vorher `PACING_MODE`), im Spielstand `S.pacing`; `newGame(…, { pacing })` überschreibt ihn. Ohne Eintrag in `C.PACING` (Standard) ist nichts gesperrt.
- Freischaltlogik: `C.PACING[modus].gesperrt` (Schlüssel `bau:<gebäude>`, `einheit:<typ>`, `forschung:<id>`), geöffnet mit `unlockKey` (`S.unlocks`); wirkt auf `isBuildable`, `unitUnlocked`, `researchBlock` (Grund `closed`).
- Upgrade-Stufen: `C.PACING[modus].stufen` bindet den Kauf ab Stufe n an eine Quelle (Karte oder Forschung); `stageSource(id)`, `canBuy` prüft sie.
- Einheitenersatz: `replaceUnit(von, nach)` wertet Warteschlange und Einheiten auf dem Feld auf (nichts wird gelöscht, Lebenspunkte im selben Verhältnis); `spawn` erzeugt danach den Ersatztyp.
- Kein Spielstandformat geändert (neue Felder fehlen in älteren Ständen und fallen auf den Standard zurück), daher keine neue `SAVE_VERSION`.
- Der Spezifikation fehlte `docs/branch-konzepte-pacing.md` (§4.1); der Unterbau folgt den Angaben in `docs/anforderungen-kartenpfad.md` (Branch `exp/kartenpfad`).

Basislinie der Kartenwahlen im Standardmodus (Normal, 20 Partien je Zeile, `tools/baseline-wahlen.mjs`): Wahlen je Partie (Median) und erste Wahl:

| Strategie | Profil | Wahlen | erste Wahl | Dauer bis Sieg | Siegquote |
|---|---|---|---|---|---|
| gierig | aktiv | 4 | 76 s | 6,5 min | 100 % |
| gierig | durchschnitt | 7 | 85 s | 10,2 min | 95 % |
| gierig | gelegentlich | 7 | 86 s | 13,5 min | 55 % |
| einheiten-zuerst | aktiv | 3 | 76 s | 5,4 min | 100 % |
| einheiten-zuerst | durchschnitt | 3 | 76 s | 6,1 min | 100 % |
| einheiten-zuerst | gelegentlich | 3 | 77 s | 7,3 min | 100 % |

Befund: Im Standardmodus fallen nur 3 bis 7 Kartenwahlen je Partie an. Ein Pfad aus Karte und anschließender Forschung (zwei Schritte) braucht mehr Wahlen, als die Partie bietet; das gehört in den Bericht (Risiko „Zweistufiger Weg zur Einheit“, `anforderungen-kartenpfad.md` Abschnitt 5).

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

## KP.3

- `data/kartenpfad.js` (`KF_PFAD`): Pfadkarten deklarativ (Felder nach REQ-KP.01). Fünf Bau-Karten: Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel. Aus den Datensätzen leitet `core.js` die Sperren (`gesperrt`) und Upgrade-Stufen mit Quelle (`stufen`) ab; es gibt keine zweite Liste.
- Modus: `PACING_MODUS` steht auf diesem Branch auf `karten`; `?pacing=standard` schaltet auf das Verhalten von `main` zurück. Simulation und Tests laufen im Standardmodus (`tools/load-core.mjs`), im Modus karten mit `KF_PACING=karten`.
- Startzustand karten: Fabrik und Läufer frei; gesperrt sind Kaserne, Schmiede, Universität, Kontor, Werfer sowie die Stufen Türme, Mauer (Verstärkung, Stachelwall, Mörtelkolonne). Die Presse bleibt frei. Gesperrtes bleibt sichtbar, ausgegraut, mit „Freischaltung: Karte …“ (Bauen, Armee, Mauer & Türme).
- Angebot (`drawOptionsKarten`): ein Platz für eine Pfadkarte (Meilenstein-Platz), mindestens eine Bonuskarte, höchstens eine Wagnis-Karte, Reihenfolge gemischt. Technologiekarten brauchen die gebaute Universität. Neu ziehen und Bannen nutzen dieselbe Ziehung; Pfadkarten (Bau, Technologie) lassen sich nicht bannen.
- Rückstandsgewicht: `KARTEN.rueckstandPlus` je Wahl ohne Erscheinen; harte Grenze `KARTEN.maxWarten` (3): Eine Bau-Karte, die seit ihrer Freigabe noch nie angeboten wurde, rückt spätestens in der dritten Wahl ein. Bei mehreren wartenden Karten gilt eine Warteschlange (Wartezeit plus Rang), sonst ließe sich die Grenze bei einem Pfadplatz nicht halten.
- `SAVE_VERSION` 8, `SAVE_KEY` `klammerfront.save.v8`: ältere Spielstände werden mit dem vorhandenen Hinweis des Startbildschirms verworfen.
- Tests: `tests/kartenpfad.test.mjs` (Startzustand, Freischaltung, Graphtest, 1.000 Angebote, Rückkehr in den Stapel, harte Grenze), `tests/browser-check.mjs` (gesperrte Inhalte, Pfadkarten auf der Bühne, Tutorial im Modus karten).
- Bots: die Strategien wählen Pfadkarten nach einer Reihenfolge (`KF_BROWSER_BOT.pfadPick`); ohne Pfadkarte im Angebot gilt die bisherige Regel.

## Auslegungen und Abweichungen (zur Zustimmung durch den PO)

1. Das Dokument `branch-konzepte-pacing.md` fehlt; der Unterbau folgt allein den Angaben im Anforderungsdokument.
2. Das Audit prüft das Präfix `tut.` statt `tutorial.` (so heißen die Schlüssel im Spiel) und `kp.` für die Texte des Branches.
3. Die Wortliste trifft am Wortanfang: „Kriegsbeute“ trifft „Krieg“, die Forschung „Eisenwaffen“ trifft „Waffe“ nicht. Sonst wäre der in KP.04 vorgegebene Name unzulässig.
4. Der Auftrag „Stelle drei Läufer auf.“ nutzt „aufstellen“ wie im Glossar; die Schaltfläche trägt nur den Einheitennamen.
5. Der Stapel steht am unteren Rand der Spielwelt (bei geschlossener Bühne) und rückt bei offener Bühne an den unteren Fensterrand, damit er keine Karte verdeckt.
6. Das Familienband trägt vorerst die bisherige Kategorie (Wirtschaft, Armee …), das Symbol ist ein Schriftzeichen je Kategorie; die Familien (Bonus, Bau, Technologie, Wagnis) kommen mit KP.3.
7. „Vorher/Nachher“-Werte bei Bonuskarten: Die Karte zeigt den Beschreibungstext mit dem Wert; eine Vorher/Nachher-Zeile gibt es erst, wenn die Kartendaten sie ausweisen (offen).
8. Die Pfadkarte „Festungsbau“ hat die Kennung `pfadFestungsbau`, weil `festungsbau` schon eine Bonuskarte ist (Abschnitte +Lebenspunkte je Basiskarte). Beide tragen im Spiel den Namen „Festungsbau“; Vorschlag: die Bonuskarte im Modus karten umbenennen (offen).
9. Pfadkarten der Familien Bau und Technologie lassen sich nicht bannen, denn jede ist die einzige Quelle ihrer Inhalte (REQ-KP.06: „gesperrt oder warnt“). Damit führt Bannen nie zu einer unlösbaren Kette.
10. Harte Grenze „spätestens in der dritten Wahl“: Bei zwei Plätzen je Angebot (ohne Universität) gehört ein Platz der Bonuskarte und einer der Pfadkarte. Vier Bau-Karten sind ab Wahl 2 zugleich ziehbar; die Grenze hält daher nur, wenn höchstens drei Bau-Karten zugleich warten. Wer Bau-Karten wählt (der Normalfall), unterschreitet das. Die Warteschlange wählt die älteste unerfüllte Karte zuerst.
11. Im Modus karten entfällt die gestaffelte Einführung der Gebäude (Stufe 2), weil Karten die Gebäude öffnen; der Erstkontakt-Hinweis „Neu: Schmiede, Kaserne …“ erscheint dort nicht.
12. Test des Tutorials im Modus karten: Ein bekanntes Zeitverhalten im Tutorial-Test „Abschied 2 nach Klick“ (Blasen laufen nach `greetMs` selbst weiter) ließ einen Lauf unter Last scheitern; der Wiederholungslauf war grün.

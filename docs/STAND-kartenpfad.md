# Klammerfront – Stand Branch „Kartenpfad“ (`exp/kartenpfad`)

(Seit dem Abgleich mit `main` heißt diese Datei `docs/STAND-kartenpfad.md`; `docs/STAND.md` beschreibt nur `main`.)

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
| KP.4 | Universität als Forschungsstätte | KP.04 | fertig (Forschungen Mauerausbau III und Turmausbau; Reiter, Schildträger, Eisenwaffen mit KP.5) |
| KP.5 | Upgrades, Einheitenersatz | KP.05 | offen |
| KP.6 | Wagnis, Exklusivpfade, Mindesttempo | KP.06, 07 | fertig |
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

## KP.4

- Technologiekarte `befestigungskunde` (ab Wahl 4; braucht Festungsbau und die gebaute Universität) öffnet die Forschungen `r_mauerausbau3` und `r_turmausbau` (je 60 s, 300 Material; Startwerte). Die Forschungen stehen in `KF_PFAD.forschungen` (Schema wie `data/research.js`, dazu `schaltetFrei`, `ersetzt`) und laufen über dieselbe Pipeline (`startResearch`, `progressResearch`).
- Ergebnis einer Pfadforschung: Schlüssel öffnen, Einheiten ersetzen; Upgrade-Stufen öffnen sich über `sourceMet` (Karte gewählt oder Forschung abgeschlossen), ohne zweite Buchführung.
- Pfadforschung gilt nur im Modus karten (`researchBlock` meldet sonst `notInMode`, die Oberfläche blendet sie aus).
- Forschungsplätze: ein Platz, der zweite über die vorhandene Forschung „Zweiter Platz“ (Auslegung von „ein Ausbau öffnet einen zweiten“); eine laufende Forschung lässt sich nicht abbrechen; Beschleunigen gegen Material wie in v0.8. Abriss der Universität: Abgeschlossenes bleibt wirksam, Laufendes pausiert (Test).
- Reiter „Universität“: Pfadforschung gruppiert nach Quellkarte, gesperrt mit „Öffnet mit: Karte …“, Fortschrittsbalken und Restzeit je laufender Forschung, Hinweis bei Abschluss (Toast und Marke am Reiter) wie bisher.
- Tests: `tests/kartenpfad.test.mjs` (Karte öffnet Forschung, Zeit, Plätze, Abriss), `tests/browser-check.mjs` (Universität im Modus karten).

## KP.5

- Neue Technologiekarten: Fortgeschrittene Taktiken (ab Wahl 3, braucht Echtes Militär und Universität; öffnet Reiter und Schildträger), Eiserne Klingen (ab Wahl 4, braucht Metallverarbeitung und Universität; öffnet Eisenwaffen).
- Neue Einheiten als Datensätze in `C.UNITS` (Werte, Kosten, Farbton): Reiter (schnell), Schwertkämpfer (Ersatz für Läufer), Bogenschütze (Ersatz für Werfer). Schildträger bleibt, gesperrt bis zur Pfadforschung `r_schild` (die alte Forschung `r_schildtraeger` entfällt im Modus karten). Neue Einheiten haben kein neues Verhalten, nur Werte und einen Farbpunkt (`farbton`); Versorgung: jede Einheit zählt 1.
- Einheitenersatz (Forschung Eisenwaffen): Läufer → Schwertkämpfer, Werfer → Bogenschütze. Warteschlange und Einheiten auf dem Feld werden beim Abschluss aufgewertet (Lebenspunkte im selben Verhältnis), nichts wird gelöscht; Ersatzeinheiten erben die Werfer-Karten.
- Reiter „Armee“: Reiter und Schildträger sind sichtbar und gesperrt („Forschung: …“), nach der Forschung mit Kosten und Erklärzeile verfügbar; ein Ersatz benennt den Knopf um.
- Upgrade-Stufen mit genau einer Quelle (Tabelle unten, Übersicht auch im Bericht): Stufe 1 jedes Gebäudes ab dem Bau frei, Stufen ab 2 nach Quelle.

| Upgrade | Stufe 1 (frei) | ab Stufe 2 | Quelle |
|---|---|---|---|
| Schmiede: Qualitätsstufe | Kauf 1–3 | Kauf 4 und folgende | Forschung Eisenwaffen |
| Kaserne: Ausbau | Kaserne selbst (Stufe 1) | Kauf 1 (Stufe 2) und folgende | Forschung Reiter |
| Mauer: Verstärkung | – | Kauf 1 (Stufe 2) / ab Kauf 2 (Stufe 3) | Karte Festungsbau / Forschung Mauerausbau III |
| Mauer: Stachelwall, Mörtelkolonne | – | alle Käufe | Karte Festungsbau |
| Turm: errichten / Kaliber | – | Kauf 1 (errichten) / ab Kauf 2 | Karte Festungsbau / Forschung Turmausbau |
| Turm: Reichweite, Feuerrate | – | alle Käufe | Forschung Turmausbau |
| Kontor: Zinseszins | alle Käufe frei | – | – (Kontor selbst über Karte Handel) |
| Presse (Klickfeld) | alle Käufe frei | – | – |

(Die Quellen stehen nur in `data/kartenpfad.js` bei den Karten und Forschungen als `schaltetFrei`.)

## KP.6

- Wagnis-Karten (eigene Seltenheit „Wagnis“, gestrichelter Rand, ab Wahl 5, brauchen Echtes Militär; höchstens eine je Angebot): Glaskanonen (Fernkampfschaden ×2, Fernkämpfer haben 1 Lebenspunkt, Stat `rangedHpOne`) und Volle Auslastung (Versorgung ×2, Materialertrag −50 %). Wirkung dauerhaft; das Gegenspiel (Gegner mit Fernkämpfern und Türmen) ist die vorhandene Spiellogik.
- Exklusivpaar: Fortgeschrittene Taktiken (Nahkampf: Reiter, Schildträger) und Ballistik (Fernkampf: Armbrustschütze, Katapult als Datensätze) schließen sich aus (`exklusivMit`); die andere Karte erscheint nie wieder, ihre Forschungsgruppe in der Universität und ihre gesperrten Einheiten verschwinden. Die Detailzeile der Karte nennt den Ausschluss.
- Mindesttempo: nach `KARTEN.maxAbstand` (180 s Spielzeit) ohne Wahl wird die nächste fällig (`S.pfad.free`, `log.freeChoice`). Die EP-Schwelle der folgenden Wahl bleibt unverändert (`xpNeed` rechnet die freien Stufen heraus). Im Standardmodus gibt es kein Mindesttempo.
- Kaserne-Ausbau 2 hat zwei Quellen, die sich gegenseitig ausschließen (Forschung Reiter oder Forschung Armbrustschütze); je Partie bleibt es genau eine (Auslegung 17).

## Balancing nach Simulation (KP.7, auf Vorschlag und mit Zustimmung des PO)

Befund der ersten Serie: Bots gewannen im Modus karten nach etwa 6 min mit 3 Wahlen; der Pfad blieb unerreicht. Zielwerte jetzt: Partie 10–14 min (durchschnitt), mindestens 8 Wahlen. Umgesetzt (alle Werte in `config.js` bzw. `data/kartenpfad.js`):
- Mehr Wahlen: `KARTEN.xpWachstum` 1,12 (vorher Standard 1,55), `xpFaktor` 0,85, `maxAbstand` 120 s (vorher 180).
- Forschungsdauer 40–50 s statt 60–90 s (Reiter, Schildträger, Armbrust 45 s, Katapult und Eisenwaffen 50 s, Mauerausbau III und Turmausbau 40 s).
- Echtes Militär: Versorgung +3 (vorher +2); Gewicht im Angebot 30, Metallverarbeitung 20 (Kaserne und Schmiede früh).
- Längere Partien über die gegnerische Basis (`basisFaktor` 3,5) und späteres Wachstum der Gegnerwellen (`wellenFaktor` 1,5, linear über 8 min); ein Faktor auf alle Wellen scheiterte (die ersten Wellen entscheiden, 1,4 ließ gierig 9 von 10 Partien verlieren).
- Kennzahlen: Kaserne und Schmiede zählen bis Minute 6 bzw. 8 oder bis zum Partieende; der Paarvergleich gilt für Technologie und Wagnis (Bau-Karten sind einzige Quelle).
- Ergebnis (10 bzw. 8 Partien je Strategie, Normal, durchschnitt, Variante militaer): alle Partien gewonnen, Median 9–10 min, 8–9 Wahlen. Abschlussserie mit 50 Partien: siehe Bericht.

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
13. Bestehende Forschungen (REQ-KP.04, Zuordnung zur Freigabe): alle 13 Forschungen aus v0.8 bleiben Grundforschung (verfügbar, sobald die Universität steht); eine Zuordnung zu Technologiekarten gibt es nicht, weil sie die Karten- und Forschungsfolge zusätzlich verlängerte (ohnehin nur 3 bis 7 Wahlen je Partie). Ausnahme: „Schildträger“ (alt) entfällt im Modus karten und wird durch die neue Pfadforschung ersetzt (KP.5).
14. Forschungsplatz: „ein Ausbau öffnet einen zweiten“ ist die bestehende Forschung „Zweiter Platz“; einen eigenen Ausbau der Universität gibt es nicht.
15. Die Gebäude-Ausbaustufen sind den vorhandenen Upgrades zugeordnet (Tabelle bei KP.5). „Stufe 2“ der Kaserne (Ausbau) und die Schmiede-Stufen ab 4 liegen hinter Forschungen; das hält die Versorgung und die Schmiede lange klein (Risiko, in der Simulation prüfen, Bericht).
16. Kontor-Zinseszins und Presse bleiben frei: Das Kontor selbst ist über „Handel“ gesperrt, und die Tabelle in KP.05 nennt für beide keine Quelle.
17. Beide Linien des Exklusivpaars öffnen den Ausbau der Kaserne (Stufe 2): Forschung Reiter oder Forschung Armbrustschütze. Mit einer einzigen Quelle (Reiter, wie in der Tabelle KP.05) fehlte der Fernkampflinie dauerhaft Versorgung; ein Paarvergleich innerhalb von 15 pp wäre nicht erreichbar. Je Partie bleibt die Quelle eindeutig, weil die Linien sich ausschließen.
18. Wagnis-Karten sind gewöhnliche Karten mit eigener Familie; ihr Ziehgewicht kommt aus `gewicht` (Startwert 4 gegenüber 10 bei Pfadkarten), nicht aus den Seltenheitsgewichten der Bonuskarten.


# Teil 2: Kartendarstellung und Entdecken (`docs/anforderungen-kartenpfad-2.md`)

## K2.0 Voraussetzungen und Ursache
- Stand nach Teil 1 (Commit `79ccab4` plus Anforderungsdokument): `main` (v0.8.1) ist eingemischt, `npm test` grün, Browser-Prüfung grün. Die Messung „sichtbare Bedienelemente“ für diesen Stand steht im Bericht (`reports/sichtbar-*.json`).
- **Ursache der Mitte-Störung (K2.01):** Der Dauerstapel `#deckBtn` war ein Element mit `position: fixed`, `left: 50%`, `bottom: calc(var(--band-work) + 40px)` – also über dem unteren Band in der Bildmitte –, das bei laufender Partie immer sichtbar war (Kartenbühne an). Er lag über Spielwelt und Armee und bildete das Artefakt; bei offener Bühne rückte er an den Fensterrand. Behebung: Das Element ist entfernt; der Fortschritt zur nächsten Wahl liegt als kleines Kartensymbol mit Füllstand in der Ressourcenleiste (`#cardSym`, neben dem EP-Wert), pulsiert bei aufgeschobener Wahl und öffnet beim Klick die Bühne. Außerhalb einer Wahl gibt es kein Bühnenelement (`#stage` ist `hidden`, `display: none`).
- Ausgangslage Sichtbarkeit: Der Branch zeigte gesperrte Inhalte ausgegraut mit Quelle („Freischaltung: Karte …“, „Öffnet mit …“, Pfadübersicht). K2.04/K2.05 ersetzen das durch „nur, was jetzt nutzbar ist“.

## Umsetzung
| Inkrement | Inhalt |
|---|---|
| K2.1 | Dauerstapel entfernt, `#cardSym` in der Leiste (Füllstand, Zähler, Pulsieren, Klick öffnet die Bühne). |
| K2.4 | `discover.js` (`Disc`): Tabelle „sichtbar ab“ je Element, Merker je Partie (einmal sichtbar, bleibt sichtbar); Reiter, Abschnitte (Kaserne, Mauer-Spalten, Forschungsspalten), Leistenelemente (EP, Kartensymbol, Versorgung, Armee), Bauoptionen, Einheiten, Ausbaustufen, Forschungen. Reine Anzeige, `core.js` unverändert. |
| K2.5 | Pfadübersicht, „Öffnet mit“, „Freischaltung: Karte …“ entfallen (`sourceLabel` liefert bei Entdecken nichts); Sammlung nach Familie mit Stufe, dazu die gebannten Karten. |
| K2.3 | Kartenvorderseite: Band (Familie, bzw. Kategorie ohne Pfad), Name, Symbol, eine Wirkungszeile (`kp.eff.<id>`, höchstens 44 Zeichen; Pfadkarten: „Schaltet frei: …“ bzw. „Öffnet Forschung: …“), Stufenpunkte, Seltenheit als Rahmen, „mit Nachteil“ bei Karten mit Nachteil; einheitliche Rückseite; Detailzeile ohne Folgekarten. |
| K2.2 | Ablauf: Karten fliegen aus dem Kartensymbol, decken von links nach rechts auf (`KARTENBUEHNE.austeilMs/aufdeckMs/aufdeckAbstandMs`), Eingabesperre bis zur letzten aufgedeckten Karte, frühestens `sperreMinMs`; Wahl: die Karte fliegt zu ihrem Wirkort, die übrigen zurück ins Symbol (`wirkflugMs`, `abraeumenMs`); `prefers-reduced-motion`: keine Bewegung. |
| K2.6 | Einblenden (≤ 300 ms), Marke „neu“ an Reiter, Bauoption, Einheit, Ausbau und Forschung, genau ein Hinweis je Entdeckungsmoment (`Hints` mit `disc:`-Kennungen, einmal je Browser), Hinweis und Marke nach fertiger Forschung. |
| K2.7 | Schalter `UI.entdecken`, `UI.kartenbuehne`, `ENTDECKEN.vorschau`, `KARTENBUEHNE.zeit` mit URL-Parametern; Protokoll mit Sichtbarkeitszeit, Entdeckungszeit, Hover je Karte, Schaltern; Messung `tools/sichtbar-mass.mjs`; Testleitfaden; Bericht. |

## Auslegungen und Abweichungen Teil 2 (zur Zustimmung durch den PO)
19. „Nicht im DOM“ (K2.04) ist als „nicht dargestellt“ umgesetzt (`hidden`, `display: none`, nicht fokussierbar, für Hilfstechniken unsichtbar). Das Element bleibt im Dokument, weil Knöpfe einmal erzeugt werden (REQ-5.01, kein Neuaufbau je Bild); die Tests prüfen `checkVisibility()`.
20. Der Reiter eines abgerissenen Gebäudes bleibt (Merker je Partie); nach dem Neuladen eines Spielstands gilt die Bedingung wieder neu, ein abgerissener Reiter erscheint dann nicht.
21. Die Karten nennen bei Mehrfachwirkung nur die erste Wirkung (Echtes Militär: „Schaltet frei: Kaserne, Werfer“; die Versorgung +3 steht in der Detailzeile). Nachteile erscheinen auf der Karte als „mit Nachteil“, der Wortlaut in der Detailzeile.
22. Die Detailzeile nennt den Ausschluss eines Paares („Schließt eine andere Technologie aus.“) ohne die andere Karte zu benennen, weil K2.03 verbietet, Karten zu nennen, die nicht zur unmittelbaren Wirkung gehören.
23. Fund beim Messen: Knöpfe mit Klassenregeln (`.btn-ghost`) blieben trotz `hidden` sichtbar (z. B. „Welle vorziehen“ ohne Kaserne). Bei Entdecken behoben (`body.disc button[hidden]`); im Standardmodus ohne Entdecken unverändert, um `main` nicht zu verändern. Vorschlag: eine allgemeine Regel auch für `main` (Patch).
24. Leistenelement Wellen: nach K2.04 von Anfang an sichtbar (bisher erst mit der ersten Welle, wenn die gestaffelte Einführung lief); im Modus `karten` ohne Einführung war das schon so.
25. Kennzahl „sichtbare Bedienelemente“ (K2.08): Knöpfe und Reiter sowie Leistenelemente, alle Reiter aufgeklappt gezählt, ohne den Rahmen (Menü, Kamera, Raster-Plätze, Hinweisknopf); der Rahmen wird getrennt ausgewiesen. Ziel „Minute 1 ≤ ein Drittel von Minute 10“: siehe Bericht.


# Teil 3: Pacing und Qualität der Kartenwahl (`docs/anforderungen-kartenpfad-3.md`, Bericht `docs/bericht-kartenpfad-3.md`)

## Umsetzung
| Inkrement | Inhalt |
|---|---|
| P.0 | `main` 0.9.2 eingemischt (Konfliktliste im Bericht). Die Wirkungsprüfung läuft auch im Modus `karten` (`tests/noeffect.test.mjs` in beiden Modi); Fund: Die Wagnis-Karte „Volle Auslastung“ (Versorgung × 2) erschien auch am Versorgungsdeckel und brachte dort nur ihren Nachteil, behoben in `pfadAvailable`. Die Browser-Prüfungen gelten für beide Modi (`browser-k2.mjs` Modus `karten`, `browser-k2-standard.mjs` aus `main`). |
| P.1/P.2 | Wahl-Fahrplan: `KARTEN.fahrplan` (Zielzeiten, EP-Schwellen, Mindestabstand 45 s), `KARTEN.maxAbstand` 100 s. Fällig wird die nächste Wahl bei erreichter EP-Schwelle, spätestens zur Zielzeit, spätestens 100 s nach der letzten Wahl, frühestens 45 s nach ihr (`dueTime`, `draftReady`). Der Wachstumsfaktor 1,12 und `xpFaktor` entfallen. Im Tutorial gilt die Kriegsbeute (`S.hold`, `S.firstBounty`), die erste Wahl kommt dort nie nach Zeit. Kartensymbol und Leiste zeigen Zeit oder EP, je nachdem, was weiter ist (`xpProgress`: `frac`, `etaS`). Protokoll je Wahl: `S.stats.wahlen` und `drafts[].sollS/erschienenS`. |
| P.3 | Partiedauer über `KARTEN.basisFaktor` (Lebenspunkte der gegnerischen Basis): 4,5 auf Leicht und Normal, 3,0 auf Schwer (vorher 3,5 für alle). |
| P.4 | Angebot mit zwei Pfadplätzen: 3 Karten, mit Universität 4 (`KARTEN.angebot`; vorher 2 und 3 wie in `main`), Pfadplätze = min(2, ziehbare Pfadkarten), höchstens eine Wagnis-Karte; alle Bau-Karten gleiches Gewicht. Bann tauscht nur Bonusplätze. |
| P.5 | Angebotsbedingungen aus der Wirkung: Feld `wirkt` an zwölf Bonuskarten (`data/draft-options.js`, nur Modus `karten`). Bonuskarte „Festungsbau“ heißt im Modus `karten` „Mauerwerk“ (Schlüssel `draft.festungsbau.name.karten`; `t()` wertet Modus-Suffixe allgemein aus). |
| P.6 | `tools/sim-p3.mjs`, `tools/bericht-p3.mjs`, `tools/fahrplan-kalibrieren.mjs`, `tools/referenzlauf.mjs`; Bericht, Testleitfaden `docs/testleitfaden-kartenpfad-3.md`, privater Testbuild. |

## Auslegungen und Abweichungen Teil 3 (zur Zustimmung durch den PO)
Siehe Bericht, Abschnitt „Auslegungen und Abweichungen“.


# Teil 4: Strategielinien, Gebäude-Aufwertung und Kartenpool (`docs/anforderungen-kartenpfad-4.md`, Bericht `docs/bericht-kartenpfad-4.md`)

## Umsetzung
| Inkrement | Inhalt |
|---|---|
| L.0 | S.01: Fehler „undefined“ in der Wellenvorschau (Reiter Armee) behoben, siehe unten. Basismessung vor allen Änderungen (S.09): `tools/sim-p4.mjs --suite basis` (450 Partien schneller Bot, 3 Grade × 3 Profile, dazu 20 Partien „gierig“; `reports/kartenpfad4-basis.json`, `.txt`) und `tools/bildzeit.mjs` (Bildzeit bei 20/40/80 Einheiten, `reports/kartenpfad4-bildzeit-basis.json`). Der Simulator hält jetzt Raster-Belegung (Minute 2/5/10) und verlorene Mauer-Lebenspunkte je Partie fest. |
| L.1 | S.02 C1–C4, S.03: Kaserne ab Start baubar (`bau:kaserne` nicht mehr in „Echtes Militär“, dort +2 statt +3 Versorgung); Gelehrte und Metallverarbeitung `abWahl: 1`; Kriegserfahrung, Serienbau, Bauleitung aus dem Pool des Modus karten (`KF_PFAD.entfallenKarten`), Forschung Ingenieurskunst entfällt (`KF_PFAD.entfallen`); Glücksritter mit Nachteil „Wellenabstand +25 %“ und Söldnerheer mit Produktion × 0,8 über `KARTEN.kartenTiers` (ersetzt die Stufen im Modus karten; `G.tiersOf`); Handelskontor erst nach erreichtem Zinsdeckel (`wirkt.zinsdeckel`, Zähler `S.stats.zinsDeckel`); eigene Schwellen für Schwer (`KARTEN.schwellenGrad`). Tests: `tests/pool4.test.mjs`. |
| L.3 | S.05 Gebäude-Aufwertung: `data/linien.js` (`varianten`), `G.upgradeBuilding`, `variantBlock`, Zustand `slot.variant` / `slot.upg` (Aufwertung läuft: das Gebäude wirkt nicht, `has`/`countType`/`matRate`/Nachbarschaft ignorieren es), Kosten 2 × Baukosten, Dauer 10 s, sichtbar ab Minute 3 mit stehendem Gebäude des Typs (`C.LINIEN.aufwertung`); Aktion im Kontextkopf (`#ctxVariants`), Marke und Fortschrittsbalken im Raster, Erstkontakt-Hinweis `variante`. |
| L.2 | S.04 Strategielinien: Zeichen je Karte (`KF_LINIEN.zeichen`) und je Variantentyp, `G.lineState()` (Zeichen und Stufe je Linie), Boni der Stufen über `C.LINIEN.stufen` in derselben Pipeline wie die Karten (`mods()`), Leistenanzeige `#hudLines` erst mit Stufe 1 einer Linie (`Disc 'hud:lines'`), Hinweis je Linie, Zeichen an Karten und Varianten erst danach. Neue Größen: `unitDmg`, `extraUnit`, `kontorYield`, `upgradeCost`, `variantCost`, `towerKillMaterial`, `counterWave`, `smithEffect`, `wallRegenFlat`, `gateUnitHp`. |
| L.5 | S.08 `?druck=hoch`: `C.DRUCK.hoch` (ab Minute 4, Faktor 1,3 auf die Zahl der Einheiten regulärer Gegnerwellen), `S.druck` im Spielstand und im Sitzungsprotokoll (`druck`, `switches.pressure`), `G.enemyWaveSize`. Spielstand-Version 9 (`SAVE_VERSION`, `SAVE_KEY`). |
| L.4 | S.06 Schlüsselkarten: sechs Karten mit zwei Zeichen (`schluessel` in `data/draft-options.js`; Drillmeister, Vorhut, Handelsnetz, Rücklage, Bollwerk, Gegenstoß), ab Wahl 3 (`abWahl`), nur mit Wirkung (`wirkt`: `variant`, `variants`, `tower`, `building`). S.07 Angebotsausgleich: `keyDue`, `S.pfad.sinceKey`, Gewicht der Linie vorn (`LINIEN.schluessel`), Bann behält eine fällige Schlüsselkarte. Tests: `tests/schluessel.test.mjs`. |
| L.6 | S.09: Linien-Bots (`KF_BROWSER_BOT` mit `linie`; Karten und Varianten der eigenen Linie), Messwerkzeuge `tools/sim-p4.mjs` (`--suite linien|schluessel|basis`), `tools/bericht-p4.mjs`, `tools/bildzeit.mjs`; dritte Stufe der Linien (6 Zeichen); Zeichen neu verteilt; Gegenstoß zusätzlich zum Wellentakt; Browserprüfung `tests/browser-l4.mjs`; Bericht `docs/bericht-kartenpfad-4.md`, Testleitfaden `docs/testleitfaden-kartenpfad-4.md`. |

## S.01: Ursache des Fehlers „undefined“
Die Wellenvorschau im Reiter Armee (`renderPreview` in `panels.js`) setzte je Einheit ein Zeichen aus einer lokalen Tabelle `GLYPH`. Mit dem Einmischen von `main` 0.9.1 (Textsymbole statt Bilder) kamen die Zeichen für Läufer, Werfer und Schildträger aus `main`; im Branch ergänzt wurden Reiter, Schwertkämpfer und Bogenschütze, **nicht** aber Armbrustschütze und Katapult. `GLYPH['armbrust']` und `GLYPH['katapult']` waren `undefined`, die Zeile lautete „undefined×1“.
Behebung: Das Symbol steht jetzt je Einheit in `config.js` (`UNITS[...].symbol`), eine zweite Tabelle gibt es nicht mehr; fehlt es einer künftigen Einheit, zeigt die Vorschau den ersten Buchstaben des Kurznamens statt „undefined“. Neu: Kurznamen `unit.<id>.short` (de, en); sie stehen als Hinweistext (`title`) an jeder Zelle der Vorschau. Test: `tests/einheitentexte.test.mjs` (jede Einheit beider Modi hat Name, Kurzname und Symbol in beiden Sprachen; die Vorschau enthält für jede Einheit keinen Text mit „undefined“). Bildschirmfoto: `docs/bilder/kartenpfad4-warteschlange.png`.
`main` ist **nicht** betroffen: Dort gibt es nur Läufer, Werfer und Schildträger, alle haben ein Zeichen in `GLYPH`. Eine Behebung auf `main` entfällt; der Test dort wäre erst nötig, wenn `main` weitere Einheiten bekommt.
Auslegung zur Bestätigung: „Kurzname“ gab es im Code bisher nicht. Ich lege ihn als kurze Bezeichnung (z. B. „Armbrust“ für Armbrustschütze) an und verwende ihn im Hinweistext der Vorschau.

## Auslegungen und Abweichungen Teil 4 (zur Zustimmung durch den PO; vollständig im Bericht)
1. Eine Variante wird als Merkmal des Platzes geführt (`slot.variant`), nicht als neuer Gebäudetyp (`ersetzt` für Gebäudetypen, wie vorgeschlagen). Grund: Der Platz bleibt Fabrik, Kaserne oder Schmiede; Ausbaustufen, Nachbarschaftsregeln, Versorgung, Voraussetzungen und der Abriss laufen unverändert, ohne jede Stelle des Codes um neue Typen zu erweitern. Fachlich gleich: „ersetzt“ das Gebäude und behält Stufen und Regeln.
2. Zeichen von Varianten zählen je Variantentyp einmal. Zwei Manufakturen sind ein Zeichen. Ihre Wirkung (Mehrertrag) gilt je Gebäude. Grund: sonst bräuchte „alles Manufaktur“ keine Karte, um Stufe 2 der Wirtschaft zu erreichen.
3. Wirkung einer Variante: einmal je Variantentyp (Werkstatt, Wachstube, Exerzierplatz …), außer dem Ertrag der Manufaktur (je Gebäude).
4. „Aufwertungen −20 % Kosten“ (Wirtschaft, Stufe 2) gilt für die Ausbauten der Gebäude und die Gebäude-Aufwertung (beide Werte getrennt in `config.js`: `upgradeCost`, `variantCost`).
5. „Einheiten am Tor“ (Garnison) sind die Einheiten der Mitte-Lane (Heimat-Lane Tor). „Mauer und Türme +x % Lebenspunkte“ (Rüstkammer): Türme haben keine eigenen Lebenspunkte; die Rüstkammer erhöht die Mauer.
6. „Kaserne bildet eine zusätzliche Einheit aus“ (Militär, Stufe 2): je ausrückender Welle ein zusätzlicher Läufer ohne Kosten, außerhalb des Versorgungslimits, nur mit Kaserne und nur, wenn die Welle nicht leer ist.
7. „Vollständig abgewehrte Gegnerwelle“: alle Einheiten einer Gegnerwelle und ihre wartenden Nachzügler sind gefallen (je Welle, nicht „Feld leer“); Alarmeinheiten zählen nicht.
8. `?druck=hoch` vergrößert die Zahl der Einheiten regulärer Wellen ab Minute 4 um den Faktor (gerundet, Deckel `ENEMY_WAVE_MAX` × Faktor); die Belagerungswelle bleibt unberührt.
9. Schwer: Schwellen ab Wahl 2 = Fahrplan × 2 statt „leicht höher“. Die Messung zeigt, dass kleinere Faktoren (1,6; 1,8) die Wahl 3 um 50 bis 62 s vorziehen; ein Faktor 2 hält alle Wahlen im Median höchstens 40 s vor der Zielzeit. Grund: Auf Schwer zählt jeder Abschuss 1,8-fach (`xpMult`).


# Teil 5: Grundausstattung, Doktrinen und Pacing aus dem Spielfluss (`docs/anforderungen-kartenpfad-5.md`, Bericht `docs/bericht-kartenpfad-5.md`)

## Umsetzung
| Inkrement | Inhalt |
|---|---|
| N.0 | K5.01 Basismessung vor allen Änderungen (Stand nach Teil 4): `tools/sim-p5.mjs --suite felder` (450 Partien schneller Bot, 3 Grade × 3 Profile, 50 je Feld): Siegquote, Dauer, Wahlen, längste Lücke zwischen zwei Wahlen, EP je Minute (0–4, 4–8, 8–12, 12+ min), Anteile der EP-Quellen, Hörsaal (Stufen, Kosten, EP je Minute), Fabriken im Raster. Dreimal gemessen: Stand nach Teil 4 (`reports/kartenpfad5-basis-felder.*`), Fahrplan aus (`…-fahrplan-aus.*`, `zielzeitIstFrist: false` ohne Höchstabstand), Linien-Bots mit `?druck=hoch` (`…-basis-linien.*`, `tools/sim-p4.mjs`). Neue Kennzahl `S.stats.xpTower` (EP aus Turm-Abschüssen). |
| N.1 | K5.02 Grundausstattung ab Start: Bau-Karten (Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel) entfallen; im Modus karten sind Fabrik, Kaserne, Schmiede, Universität, Kontor, Läufer, Werfer sowie alle Ausbaustufen von Mauer, Türmen und Kaserne ohne Karte nutzbar. Gesperrt bleiben nur Technologie-Inhalte (Reiter, Schildträger, Armbrustschütze, Katapult, Schmiede-Stufe ab 4). Technologie-Karten erscheinen ab Wahl 1, sobald eine Universität steht (`benoetigt: ['gebaut:universitaet']`); Wagnis-Karten setzen eine Kaserne voraus. **Quartiere** = der bisherige Kaserne-Ausbau (+2 Versorgung je Stufe, Kosten 250 · 2ⁿ), im Modus karten unter diesem Namen; Versorgung steigt nur durch Kauf (Kaserne 3 → 5, je Stufe +2). Ersatz für „Mauerausbau III“ und „Turmausbau“ (beide Stufen sind Grundausstattung): die Forschungen **Wehrgänge** (Mauern +30 %, Reparaturpause −30 %) und **Schießscharten** (Türme +30 % Schaden, gegen Fernkämpfer ×2) unter der Karte Befestigungskunde. Rückstandsgewicht und harte Grenze für Bau-Karten (`maxWarten`) entfielen mit den Karten. Texte: Tutorial-Abschied `tut.bye1.karten`, Namen und Beschreibungen angepasst; „Mauerwerk“ als Sondername der Bonuskarte Festungsbau entfällt. Spielstand-Version 10 (`SAVE_VERSION`, `SAVE_KEY`). Messung nach N.1 (altes Pacing noch aktiv): `reports/kartenpfad5-n1-felder.*`. |
| N.2 | K5.03/K5.04 Pacing aus dem Spielfluss: Wahl-Fahrplan (`KARTEN.fahrplan`, Zielzeiten, `zielzeitIstFrist`), Höchstabstand (`maxAbstand`), Mindesttempo (freie Wahlen), Schwellen je Grad (`schwellenGrad`) und die Füllung des Kartensymbols nach Zeit („Karte in 0:42“) entfallen. Neu: Schwellenkurve `KARTEN.schwellen` (Schritt k = `start` × `wachstum`^(k−1), je Grad mit `schwellenFaktor`, Standard 1,0), Mindestabstand `KARTEN.minAbstand` (45 s) als Bremse, EP-Quellen aus dem Spielfluss (`epBasis`: EP je 1 % der Lebenspunkte der gegnerischen Basis; `epWelle`: EP je vollständig abgewehrter Gegnerwelle, wächst mit der Größe der Welle; Zähler `S.stats.xpSrc` je Quelle, im Protokoll `xpBySource`). EP je Abschuss je Grad aus `KARTEN.xpMult` (alle 1,0: mehr Gegner bringen mehr EP, kein Ausgleich über den Grad). Kriegserfahrung kehrt als **Lehrjahre** zurück und wirkt auf alle EP-Quellen; der Glücksritter hat wieder den EP-Nachteil (Stufen +15 %), die Fassung mit Wellenabstand entfiel. Zwischenstand der Kalibrierung (Schwellen 50 × 1,03^(k−1), 4 EP je % Basis, Basis-Faktor 8,0 / 10,5 / 7,5): Normal/durchschnitt 14 Wahlen, Dauer 14:08, längste Lücke 123 s (Median); endgültig nach N.3 und N.5. Veraltete Werkzeuge der Teile 3 (`sim-p3`, `bericht-p3`, `sim-karten`, `fahrplan-kalibrieren`, `referenzlauf`) entfernt, neu `tools/kalibrieren-p5.mjs`. |
| N.3 | K5.05 Forschungsbudget der Universität: Der Hörsaal entfällt im Modus karten (`KF_PFAD.entfallen`), die Universität bekommt ein Budget (Reiter Universität, drei Knöpfe 0 / 25 / 50 %, Zustand `S.budget`, `G.setBudget`): Der eingestellte Anteil des laufenden Materialertrags (Fabriken und Presse; Klicks, Zinsen und Beute bleiben unberührt) wird in EP umgewandelt, Kurs `KARTEN.budget.kurs` (0,08 EP je Material) × `kursFaktor` (25 % zu k, 50 % zu 0,7 k), Wirkung nur bei stehender Universität, jederzeit änderbar. Anzeige „Forschung 50 %“ in der Leiste ab über 0 %, Ertrag je Sekunde nach Abzug (`G.incomeRate`), Tooltips und Erklärzeilen, Hinweistext `hint.research.karten`, Zähler `xpSrc.budget`, Protokoll `setBudget`. Bots: `KF_BROWSER_BOT` stellt das Budget nach fester Regel ein (Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %, sonst 0 %; Option `budget`). Messung `tools/sim-p5.mjs --suite budget` (`reports/kartenpfad5-n3-budget.*`): Normal/durchschnitt 0 % → 50 %: Wahlen 13 → 16 (+3), Siegquote ±0 pp. Browser-Prüfung `tests/browser-n5.mjs`. |
| N.5 | K5.07 Doktrinen und Sonderbauten (ersetzen die sechs Schlüsselkarten aus Teil 4; Handelsnetz, Rücklage, Drillmeister entfallen samt ihrer Wirkung): `data/doktrinen.js` (Zunftordnung, Stiftung, Stehendes Heer, Vorstoß, Bollwerk, Ausfall), Familie `doktrin` (eigene Kartenfarbe, Band „Doktrin“), `C.DOKTRIN` (`max` 2, drei Zeichen, ab Wahl 3, spätestens jede dritte Wahl, Linienführer × 3 Gewicht); Angebot über `doktrinDue` (Bonusplatz, höchstens eine Doktrin je Angebot, Bann behält sie), `S.pfad.sinceDoktrin`, Protokoll `S.stats.doktrinen`/`doktrinOffers`. Sonderbauten als Gebäude-Aufwertung (`variant.doktrin`): Zunfthaus (Nachbarbonus der Fabrik × 3; Grenze vier Fabriken inklusive Zunfthäuser, `buildBlock` meldet `limit` mit Erklärzeile), Stiftungshaus (Universität; Budgetkurs × 2), Heerlager (Kaserne; Versorgung +6; Unterhalt je Einheit und Minute, `upkeep`), Bastion (Fabrik; feuert wie ein Turm in die Lane der Zeile, 1,5 × Schaden, `towerKillXp` × 2); Vorstoß (Wellenabstand × 0,5, `towerCd` × 1,3), Ausfall (`counterWave`, `counterBoost` + 1, `repairCost` × 2). Ein Sonderbau löst eine Grundvariante ab (Auslegung 1). Bots wählen den Sonderbau ihrer Doktrin zuerst. Messung: `tools/sim-p5.mjs --suite doktrin`. Tests: `tests/doktrinen.test.mjs` (17). |
| N.6 | K5.08/K5.09 Linien neu, Grundvarianten angleichen: Zeichen tragen nur Doktrinen (drei) und Gebäude-Varianten (eines je Typ, Grundvariante oder Sonderbau); Bonus-, Technologie- und Wagnis-Karten tragen keines (`data/linien.js`, `zeichen` mit sechs Einträgen). Stufen weiter bei 2, 4, 6 Zeichen, Stufe 3 setzt eine Doktrin der Linie voraus (`LINIEN.doktrinAbStufe`, `lineState().doctrine`); die Leiste nennt „plus eine Doktrin“. Stufen als Regeländerungen in `C.LINIEN.stufen`: Militär (Läufer je Welle `extraUnit`, Schmiede-Stufe +1 `startSmith`, Durchbruch `dmgVsBase` × 2), Wirtschaft (diagonale Nachbarschaft `nbDiagonal`, Lagerdeckel → EP `lagerEp` mit `LINIEN.lager`, Söldner `soeldner` mit `LINIEN.soeldner`: Einheiten über dem Versorgungslimit gegen Aufschlag, `queue[].merc`, `G.unitPrice`), Verteidigung (Material je Turm-Abschuss, Gegenstoß, Ausbruch `counterBoost` + 0,5 und `counterBaseDmg` × 2, `u.baseMult`). Grundvarianten: Manufaktur +20 %, Werkstatt −25 %, Wachstube +30 % und Material je Turm-Abschuss, neu Zahlmeisterei (Kaserne, Quartiere −30 %, `quartiereCost`) und Münzschmiede (Schmiede, Ausbau −25 %, `qualitaetCost`). Tests: `tests/linien5.test.mjs`; die Prozent-Tests aus Teil 4 in `tests/linien.test.mjs` entfallen. |
| N.4 | K5.06/K5.04 Kartenpool bereinigen: Im Modus karten bleiben 28 Karten (22 Bonus, 4 Technologie, 2 Wagnis; ohne Doktrinen) statt 45; 17 Karten entfallen (`KF_PFAD.entfallenKarten`): Doppelschicht, Schwere Pressen (in Bessere Fabriken zusammengelegt), Nachtschicht, Kriegsanleihe, Großauftrag, Rationalisierung, Selbstläufer, Fließband, Veteranen, Taktiker, Vorposten, Blitzkrieg (der Vorstoß ersetzt ihn), Söldnerheer (der Name gehört der Linie Wirtschaft), Festungsbau, Bastion (Name und Wirkung gehören der Doktrin Bollwerk), Scharfschützen (in Turmkanoniere Stufe 3 aufgegangen), Zeugmeister. Spürbarkeitsgrenze (Regeländerung oder 20 %): 13 Karten bekommen im Modus karten neue Stufen (`KARTEN.kartenTiers`); jede mehrstufige Karte bringt ab Stufe 2 oder 3 einen zusätzlichen Effekt, sieben davon sind Regeländerungen (`nbFabrik`, `drumsMin`, `shieldMin`, `siegeAlways`, `regenGate`, `repairTh`, Türme gegen Fernkämpfer); Texte je Stufe (`draft.<id>.desc.t2.karten`, `cardDesc` in `panels.js`). Bonuskarten tragen keine Zeichen. Zeitbezug (K5.04): Inventar im Bericht, Suchtest in `tests/pool5.test.mjs`. Tests: `tests/pool5.test.mjs` (12). |
| N.7 | K5.10 Bots, Messung, Bericht, Testbuild, Testleitfaden, Endkalibrierung: EP-Schwelle 70 × 1,05^(k−1), 10 EP je Prozent Basisschaden (vorher 50 × 1,03^(k−1) und 4), Schwer im Modus karten Grundwelle 4,0 (`KARTEN.gegner`), Stiftungshaus zum zweifachen Preis (`kostenFaktor` an der Variante); Messwerkzeuge `tools/sim-p5.mjs` (Suiten `felder`, `budget`, `doktrin` mit Mauerverlust, Turm-Abschüssen und Wahlraten), `tools/sim-p4.mjs --suite linien` (Fabriken ohne Variante auch mit Zunfthaus und Bastion, Verteilung der Aufwertungen), `tools/bericht-p5.mjs` (Tabellen), `playGame({ trace })`; `docs/bericht-kartenpfad-5.md`, `docs/testleitfaden-kartenpfad-5.md`, `CLAUDE.md`, `CHANGELOG.md`. |

## Auslegungen Teil 5 (zur Bestätigung durch den PO)
1. **Sonderbau löst Grundvariante ab (K5.07).** Eine Grundvariante ist endgültig, außer für einen Sonderbau: Wer die Doktrin erst nach der Aufwertung wählt (Wahl 3 liegt meist nach Minute 3), kann eine Werkstatt, Manufaktur oder Wachstube zum Sonderbau aufwerten; die Kosten fallen voll an. Ohne diese Regel wäre die Doktrin für Wirtschaft und Verteidigung wirkungslos: In der Messung waren alle Fabriken schon Manufakturen, bevor die Zunftordnung erschien.
2. **Bastion ist eine Fabrik-Variante (K5.07).** Das Raster hat keinen Platz für ein eigenes Turmgebäude; die Bastion ersetzt die Variante einer Fabrik, die Fabrik darunter arbeitet weiter. Sie feuert in die Lane ihrer Zeile (oben Lane 0, Mitte Tor-Lane, unten Lane 2) mit 1,5 × dem Turmschaden der Stufe max(2, Turm der Lane); Kadenz und Reichweite wie die Türme der Lane. Sie schweigt, solange der Mauerabschnitt ihrer Lane gefallen ist.
3. **Grenze der Zunftordnung** zählt Plätze mit Typ Fabrik (Zunfthäuser sind Fabrikplätze). Schon Stehendes bleibt stehen; gesperrt ist nur der Neubau.
4. **Drei Zeichen je Doktrin** zählen sofort: Eine Doktrin allein bringt die Linie auf Stufe 1 (nach Teil 4: zwei Zeichen), zwei Doktrinen derselben Linie auf Stufe 2 (vier Zeichen).
5. **Angebotsausgleich:** erste mögliche Doktrin in Wahl 3, danach spätestens in jedem dritten Angebot ohne Doktrin (wie die Schlüsselkarten in Teil 4); nach der zweiten gewählten Doktrin keine mehr.
6. **Lagerdeckel (K5.08, Wirtschaft Stufe 2).** Im Spiel gab es keinen Lagerdeckel (der Zinsdeckel des Kontors begrenzt nur die Zinsen). Auslegung: Lagerdeckel = Materialertrag von drei Minuten (mindestens 1500); Material darüber wird jede Sekunde zu EP zum Kurs 0,08 EP je Material (`C.LINIEN.lager`). Alternative: Deckel am Zinsdeckel des Kontors (dann etwa 500 Material, das würde größere Aufwertungen blockieren).
7. **Söldner (K5.08, Wirtschaft Stufe 3).** Ist die Warteschlange am Versorgungslimit, wirbt derselbe Einheitenknopf Söldner an: Kosten × 1,5 (`C.LINIEN.soeldner.kostenFaktor`), sie belegen keine Versorgung und rücken mit der nächsten Welle aus. Es gibt keinen eigenen Knopf; die Erklärzeile nennt „Söldner, keine Versorgung“.
8. **„Neue Einheiten starten mit der ersten Schmiede-Stufe“ (Militär Stufe 2)** gilt als „eine Schmiede-Stufe mehr“ (`startSmith` + 1, wie der Drillmeister aus Teil 4), auch ohne Schmiede. Alternative: Mindeststufe 1, dann wäre die Regel für jeden Spieler mit Schmiede wirkungslos.
9. **Durchbruch** (Militär Stufe 3) verdoppelt den Schaden aller eigenen Einheiten an der gegnerischen Basis, **Ausbruch** (Verteidigung Stufe 3) den der Gegenstoß-Einheiten. Mit der Doktrin Ausfall zählt der Stärkezuschlag der Gegenstöße doppelt: +100 % (Doktrin) + 50 % (Stufe) = +150 %.
10. **Münzschmiede (K5.09, „optional“)** ist umgesetzt, damit jedes Grundgebäude eine Variante je Linie hat und alle Linien gleich viele Zeichen aus Varianten erreichen können (drei).
11. **Pool von 45 auf 28 Karten (K5.06).** Streichungen und Zusammenlegungen siehe Zeile N.4. Wer eine gestrichene Karte vermisst, kann sie im Modus karten über `KF_PFAD.entfallenKarten` zurückholen; im Modus standard bleibt der Pool wie in main.
12. **Regeländerungen der Stufen 2 und 3** sind Vorschläge (Namen der Stufen: Bessere Fabriken II „Nachbarschaftsbonus ×2“, Kriegstrommeln III „ab drei Einheiten“, Schildwall II „Reihe mit vier Nahkämpfern zählt als voll“, Sappeure II „von Anfang an“, Maurerkolonne III „auch das Tor“, Turmkanoniere III „doppelt gegen Fernkämpfer“, Instandhaltung III „schon bei 80 %“).
13. **Der Paarvergleich der Doktrinen misst keine Siegquote (K5.07).** Normal: alle Linien-Bots gewinnen 100 % mit und ohne Doktrin; Schwer: dieselben Seeds verlieren in der Eröffnung. Messung ersatzweise über Dauer, Wahlen, Mauerverlust und Turm-Abschüsse (Tabelle im Bericht). Gewonnene Einsicht: die Zahl ist ein Machbarkeitsmaß; die Stärke beurteilt der Spieltest.
14. **Stiftungshaus kostet das Zweifache der Baukosten der Universität (600 Material), nicht das Dreifache.** Mit dem Dreifachen (900) baute der Wirtschaft-Bot es in 4 % der Partien, mit dem Zweifachen in 93 %. Weitere Sonderbauten bleiben beim Dreifachen (`DOKTRIN.sonderbau.kostenFaktor`).
15. **Kalibrierung (K5.03).** Schwellenkurve 70 × 1,05^(k−1), 10 EP je Prozent Basisschaden und 4 + 2 EP je Einheit einer abgewehrten Welle. Gemessen wurden sieben Wertesätze (Start 50 bis 80, Wachstum 1,03 bis 1,07, 4 bis 12 EP je Prozent); Start 70, Wachstum 1,05, 10 EP liefert die kürzeste Lücke (89 s) bei 14 Wahlen. Schwer: Grundwelle 4,0 (Normal bleibt 2,0).
16. **Forschungsbudget (K5.05) bleibt bei Kurs 0,08.** Kurs 0,12 und 0,16 bringen nicht mehr Wahlen (+2 und +1), nur einen höheren Anteil der Budget-EP; der Mindestabstand begrenzt die Wahlen.
17. **Fabrik-Kriterium (K5.09)** gilt für die Linien-Bots; der Bot ohne Linie wertet nie auf und hält 5 reine Fabriken.
18. **„Angebote mit Doktrin“ (K5.07)** zählt Wahlen, in deren Angebot mindestens eine Doktrin liegt (höchstens eine je Angebot), bis zur zweiten gewählten Doktrin.

## Teil 6: Synergien, Doktrinen und Weiterentwicklungen (Branch `exp/kartenpfad`, REQ-K6.01 – K6.08, Spielstand-Version 11)
Anforderungen: `docs/anforderungen-kartenpfad-6.md`; Bericht folgt in `docs/bericht-kartenpfad-6.md`. Commits `Q.<n>: <Inhalt>`.

| Inkrement | Inhalt |
|---|---|
| Q.0 | K6.01/K6.08 Anforderungen abgelegt; Fehler „Zunfthaus trotz mehr als vier Fabriken“ behoben: Die Einschränkung einer Doktrin gilt ab der Wahl auch für den Bestand (`doctrineExcess`, `variantExcess`, `variantBlock` meldet `excess`, Erklärzeile „Reiße zuerst N Fabriken ab.“; Test `tests/einschraenkung6.test.mjs`, 6 Tests). Der Bot reißt überzählige Fabriken für den Sonderbau ab. Messwerkzeuge: `tools/bedienelemente.mjs` (sichtbare Bedienelemente bei Minute 1 und 10, Playwright), Kennzahl „erstes Angebot mit Doktrin“ (`S.stats.doktrinOfferWahlen`, `tools/sim-p5.mjs`). Basismessung nach Teil 5 (gleiche Seeds): `reports/kartenpfad6-basis-felder.json`, `-basis-doktrin.json`, `-bedienelemente-basis.json`. |
| Q.1 | K6.02 Strategielinien entfallen im Modus karten: Zeichen, Linienstufen, die Anzeige „Linien“ in der Leiste, die Linienhinweise, die Gewichtung nach führender Linie (`lineState`, `cardSigns`, `C.LINIEN`, `data/linien.js` entfernt; `data/varianten.js` hält nur noch die Gebäude-Varianten, Feld `kat` statt `linie`; `C.AUFWERTUNG`, `C.LAGER`, `C.SOELDNER`). Sechs Regeln der Linienstufen sind Karten in `data/karten6.js` (Querverbindung, Lagerzehnt, Söldnertruppe [Wirtschaft + Militär, selten], Rekrutenzug [Stufe II: Schmiede-Stufe], Durchbruch [selten], Plünderung); „Ausbruch“ ist Teil der Doktrin Ausfall (`counterBaseDmg` × 2). Spielstand-Version 11. Tests: `tests/linien6.test.mjs`, `tests/aufwertung.test.mjs` (Gebäude-Aufwertung aus Teil 4, ohne Zeichen); Browser `tests/browser-q6.mjs` (vorher `browser-l4.mjs`). `tools/sim-p4.mjs` und `tools/bericht-p4.mjs` (Linien-Bots) entfernt; Linien-Bots heißen Kategorie-Bots (`kat`). |
| Q.2 | K6.03 Kategorien und Synergiekarten: `C.KATEGORIEN` (Zählregel: jede gewählte Karte einmal, jede weitere Stufe einmal, Doktrin zweimal, Brücke für beide Kategorien; Deckel 8; Vorsprung 2, Gewicht der führenden Kategorie ×2); jede Karte trägt `kat` (`data/draft-options.js`, `data/kartenpfad.js`, `data/doktrinen.js`, `data/karten6.js`), `G.katCounts`, `G.katLead`, `G.synergieNow`. Acht Synergiekarten in `data/karten6.js`: Zähler Gilde, Waffenbrüder, Wehrverband; Verstärker Bauordnung (Nachbarschaftsboni ×2, `nbAll`), Sammelruf (+1 Läufer je zwei Militärkarten); Brücken Kriegswirtschaft, Wehrhandel, Grenzwacht. Angebot: führende Kategorie doppeltes Gewicht, jedes Angebot mit mindestens drei Karten enthält eine Karte außerhalb der führenden Kategorie (auch bei Bann und Neu ziehen). Anzeige: Kategorie am Fuß der Karte und im Tooltip, „derzeit +21 %“ auf der Karte, Zahl je Kategorie im Reiter Karten (erst nach der ersten Synergiekarte). Pool: 7 Karten gestrichen (Weitschuss, Sappeure, Zinnen, Notreserve, Werkmeister, Instandhaltung, Lange Wurfarme), 35 Karten ohne Doktrinen (Grenze 38). Tests `tests/kategorien6.test.mjs` (15), `tests/browser-q6.mjs`. |
| Q.3 | K6.04/K6.05 Doktrinen: Zufallsfaktor statt „spätestens jede dritte Wahl“ (`doktrinDue`, `sinceDoktrin` entfallen): ab Wahl 3 würfelt jedes Angebot mit der Chance `S.pfad.pDoktrin` eine Doktrin auf einen Bonusplatz (`C.DOKTRIN.p`: Start 15 %, +15 Prozentpunkte je Angebot ohne Doktrin, zurück auf 15 % nach einem Angebot mit Doktrin; `doktrinChance`, `S.pendingDraft.doktrinRoll`, Neu ziehen und Bann behalten die gewürfelte Doktrin; nie zwei Doktrinen in einem Angebot, höchstens `max` = 2 je Partie); Protokoll `S.stats.doktrinP` (p je Wahl), `doktrinOffers`, `doktrinOfferWahlen`. Sieben neue Doktrinen (13 insgesamt, `data/doktrinen.js`, Kategorie `kat` auch als Liste für Mischformen): Elite (Leben und Schaden ×2, Versorgung × 0,5), Massenaufgebot (Läufer kosten × 0,5, +1 Läufer je Welle; andere Einheiten gesperrt), Freihandel (Kontor tauscht Material und EP in Stapeln, Türme bleiben auf Stufe 1, Turmausbauten gesperrt, auch im Bestand), Raubbau (Fabrikertrag ×2, verfällt in vier Stufen alle drei Minuten, Neubau erneuert), Fabrikmiliz [Wirtschaft + Militär] (jede Fabrik stellt je Minute einen Läufer ohne Versorgung, Ertrag × 0,7), Grenzfeste [Wirtschaft + Verteidigung] (Turm-Abschüsse bringen Material, höchstens fünf Fabriken), Zermürbung (Gegner verlieren vor der Mauer einmalig 25 % Leben, Quartiere × 1,5). Oberfläche: Tauschknöpfe im Kontor, gesperrte Einheiten und Turmausbauten mit Grund, Raubbau-Faktor am Platz. Der Doktrin-Ersatz beim Bann achtet die Regel der Fremdkategorie. Tests `tests/doktrinen6.test.mjs` (14), `tests/doktrinen.test.mjs` (angepasst), `tests/browser-q6.mjs` (Block K6.05). |
| Q.4 | K6.06 Weiterentwicklungen: Technologiekarten Dampfkraft und Buchdruck (Kategorie Wirtschaft, selten, ab Wahl 3; Dampfkraft setzt eine Fabrik voraus) öffnen die Forschungen `r_dampfkraft` (800 Material, 60 s) und `r_buchdruck` (600 Material, 50 s) in `data/kartenpfad.js` (Feld `weiter: { bereich }`). Abschluss: Alle Fabriken sind Dampfmühlen (`factoryYield` × 1,4, `clickYield` × 2); alle Universitäten sind Druckereien (`researchTime` × 0,5, auch für laufende Forschungen; `budgetKurs` × 1,5). Die Grundvarianten des Bereichs entfallen ohne Erstattung (`applyWeiter`; auch eine laufende Aufwertung zu einer Grundvariante), Sonderbauten der Doktrinen und Ausbaustufen bleiben; danach lassen sich Dampfmühlen wieder zu Grundvarianten aufwerten (Kosten wie bisher). Tooltip der Forschung nennt „Ersetzt N Varianten“ (`G.weiterErsetzt`), das Gebäude heißt nach dem Abschluss Dampfmühle bzw. Druckerei (`bld.<typ>.name.weiter`). Protokoll `S.stats.weiter` (Forschung, Zeitpunkt, Zahl der ersetzten Varianten). Pool: 37 Karten ohne Doktrinen (Grenze 38). Behoben nebenbei: Pfadforschungen zeigten im Tooltip den rohen Schlüssel `research.branchOf.pfad`. Tests `tests/weiter6.test.mjs` (7), `tests/browser-q6.mjs` (Block K6.06). |

## Auslegungen Teil 6 (zur Bestätigung durch den PO)
1. **Ausbruch (Linie Verteidigung, Stufe 3) wird Teil der Doktrin Ausfall (K6.02).** Die Anforderung nennt „Ausbruch“ als „entfällt oder wird Kartenstufe“. Ausfall trägt den Gegenstoß schon; Gegenstoß-Einheiten richten jetzt zusätzlich den doppelten Schaden an der gegnerischen Basis an. Ausfall wird damit stärker (Ziel: Doktrinen ausbauen).
2. **„Neue Einheiten starten mit einer Schmiede-Stufe mehr“ (Linie Militär, Stufe 2) wird Stufe II der Karte Rekrutenzug (K6.02).** Wer die Karte ein zweites Mal wählt, bekommt die Regel zusätzlich zum Läufer je Welle.
3. **Auslegung 3 aus Teil 5 entfällt (K6.01):** Die Grenze der Zunftordnung gilt für den Bestand; der Bestand bleibt stehen (kein Zwangsabriss), aber der Sonderbau ist gesperrt, bis die Grenze erfüllt ist.
4. **Waffenbrüder: 7 statt 5 % je Militärkarte (K6.03).** Mit 5 % bewirkt der Zähler bei drei Karten 15 %; die Spürbarkeitsgrenze der Anforderung verlangt 20 %.
5. **Synergiekarten erscheinen erst, wenn zwei Karten ihrer Kategorie gewählt sind (`KATEGORIEN.synergieAb` = 2).** Sonst läge der Zähler beim Erscheinen unter der Spürbarkeitsgrenze; die Anforderung nennt keine Bedingung für das Angebot.
6. **Der Deckel von acht Karten gilt für alle drei Arten** (Zähler, Verstärker, Brücke); die Anforderung nennt Zähler und Brücken.
7. **Bauordnung wirkt fest ×2** (Nachbarschaftsboni aller Gebäude), nicht nach der Kartenzahl: „Nachbarschaftsboni ×2“ steht so in der Anforderung. Der Wert wird auf der Karte als „×2“ angezeigt.
8. **Kategorien der Karten (Vorschlag der Anforderung, K6.03):** Armee → Militär, Basis → Verteidigung, Wirtschaft → Wirtschaft; Automatisierung: Instandhaltung Verteidigung, Dauerauftrag und Werkmeister Militär; Sonderregeln: Große Armee, Alles auf die Mitte Militär, Verbrannte Erde Verteidigung, Glücksritter neutral; Wagnis: Glaskanonen Militär, Volle Auslastung neutral; Technologie wie in der Anforderung. Die Zuordnung steht in der Spalte `kat` der Datendateien.
9. **Pool 35 statt 42 Karten (K6.03: Grenze 38).** Gestrichen: Weitschuss (+20 % Fernkampf, nur eine Größe), Sappeure (Wirkung wie Belagerungsgerät und Durchbruch), Zinnen, Notreserve, Werkmeister, Instandhaltung, Lange Wurfarme (Werfer-Sonderfall); die Liste lässt sich über `KF_PFAD.entfallenKarten` ändern. Die Karten aus Q.4 und Q.5 kommen noch hinzu; dort wird die Grenze erneut geprüft.
10. **Kategorie in der Anzeige:** Bonuskarten zeigen im Kopf der Karte ihre Kategorie statt „Bonus“; am Fuß steht die Kategorie mit Symbol (Brücken beide). Technologie-, Wagnis- und Doktrinkarten behalten die Familie im Kopf.
11. **Zwei Doktrinen über der Anforderung (K6.05).** Die Anforderung nennt „ungefähr zwölf“; umgesetzt sind 13 (die sechs bisherigen und sieben neue, darunter Zermürbung aus der Soll-Liste). Wehrpflicht und Igelstellung (Soll) fehlen: Sie hätten weitere Sonderregeln im Kern verlangt, ohne dass die Messung je Kategorie vorläge.
12. **Kriegswirtschaft heißt als Doktrin Fabrikmiliz.** Der Name gehört der Brückenkarte aus K6.03; zwei Karten gleichen Namens verwirrten Anzeige und Protokoll.
13. **Raubbau: „verliert eine Ausbaustufe“ als Ertragsstufen.** Fabriken haben keine Ausbaustufen; ersatzweise starten sie mit vier Ertragsstufen (zusammen +100 %), eine verfällt alle drei Minuten (nach zwölf Minuten Grundertrag); ein Neubau (Abriss und Wiederaufbau) erneuert sie. Der Wert ist ein Startwert für die Kalibrierung.
14. **Freihandel: Tausch in Stapeln, EP → Material kostet Fortschritt.** Material → EP: 200 Material gegen 16 EP; EP → Material: 20 EP gegen 120 Material; nur die EP über dem Stand der erreichten Stufe sind tauschbar (die Stufe geht nie verloren). Der Tausch im Kreis verliert (0,08 × 6 = 0,48). Türme: Stufe 1 bleibt, Ausbauten sind gesperrt; Türme, die schon höher stehen, wirken nur als Stufe 1 (die gespeicherte Stufe bleibt, die Doktrin lässt sich nicht abwählen, die Sperre ist also dauerhaft).
15. **Gewürfelt wird nur mit Doktrin in Reichweite des Angebots.** Doktrinen sind auch ohne Würfelwurf gewöhnliche Bonuskarten mit Gewicht 8; der Würfelwurf garantiert nur, dass eine auftaucht. Dadurch liegt die Kennzahl „Angebote mit Doktrin“ etwas über p; die Messung folgt in Q.6.
16. **Weiterentwicklung als Forschung am Bereich, nicht am einzelnen Gebäude (K6.06).** Die Fabriken bleiben Fabriken (Nachbarschaft, Grenzen, Kosten und Doktrinen gelten unverändert); „Dampfmühle“ ist Anzeigename und Wirkung. Gleiches für die Universität (Anzeigename „Druckerei“; Platzhalter, der PO kann die Namen ändern). Auch Neubauten nach dem Abschluss sind Dampfmühlen.
17. **Die Universität hat keine Grundvarianten.** Für sie ersetzt Buchdruck nichts („Ersetzt keine Variante.“); der Sonderbau Stiftungshaus bleibt. Der Wortlaut der Anforderung („Ersetzt 3 Varianten“) trifft nur bei der Fabrik zu.
18. **Erstattung.** Die bezahlten Kosten einer ersetzten Variante werden nicht erstattet und fallen auch aus dem Erstattungswert eines späteren Abrisses heraus (berechnet mit den aktuellen Variantenkosten).
19. **Werte als Startwerte:** Kosten und Dauer der Forschungen (800/60 s, 600/50 s) und das Erscheinen ab Wahl 3; Dampfkraft setzt zusätzlich eine Fabrik voraus. Buchdruck wirkt auf alle Forschungen, auch auf die laufenden, über das Tempo des Fortschritts (halbe Dauer).

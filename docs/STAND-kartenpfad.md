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
| L.0 | S.01: Fehler „undefined“ in der Wellenvorschau (Reiter Armee) behoben, siehe unten. Basismessung vor allen Änderungen (S.09): `reports/kartenpfad4-basis-*.json`. |

## S.01: Ursache des Fehlers „undefined“
Die Wellenvorschau im Reiter Armee (`renderPreview` in `panels.js`) setzte je Einheit ein Zeichen aus einer lokalen Tabelle `GLYPH`. Mit dem Einmischen von `main` 0.9.1 (Textsymbole statt Bilder) kamen die Zeichen für Läufer, Werfer und Schildträger aus `main`; im Branch ergänzt wurden Reiter, Schwertkämpfer und Bogenschütze, **nicht** aber Armbrustschütze und Katapult. `GLYPH['armbrust']` und `GLYPH['katapult']` waren `undefined`, die Zeile lautete „undefined×1“.
Behebung: Das Symbol steht jetzt je Einheit in `config.js` (`UNITS[...].symbol`), eine zweite Tabelle gibt es nicht mehr; fehlt es einer künftigen Einheit, zeigt die Vorschau den ersten Buchstaben des Kurznamens statt „undefined“. Neu: Kurznamen `unit.<id>.short` (de, en); sie stehen als Hinweistext (`title`) an jeder Zelle der Vorschau. Test: `tests/einheitentexte.test.mjs` (jede Einheit beider Modi hat Name, Kurzname und Symbol in beiden Sprachen; die Vorschau enthält für jede Einheit keinen Text mit „undefined“). Bildschirmfoto: `docs/bilder/kartenpfad4-warteschlange.png`.
`main` ist **nicht** betroffen: Dort gibt es nur Läufer, Werfer und Schildträger, alle haben ein Zeichen in `GLYPH`. Eine Behebung auf `main` entfällt; der Test dort wäre erst nötig, wenn `main` weitere Einheiten bekommt.
Auslegung zur Bestätigung: „Kurzname“ gab es im Code bisher nicht. Ich lege ihn als kurze Bezeichnung (z. B. „Armbrust“ für Armbrustschütze) an und verwende ihn im Hinweistext der Vorschau.

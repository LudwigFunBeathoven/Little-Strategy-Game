# Klammerfront – Bericht Branch „Kartenpfad“ (Teil 1)

Branch `exp/kartenpfad`, Version 0.9-kartenpfad, Stand 07.10.2026. Anforderungen: `docs/anforderungen-kartenpfad.md`. Stand je Inkrement und alle Auslegungen: `docs/STAND.md`.

## Ergebnis in drei Sätzen
Alle Inkremente KP.0 bis KP.7 sind umgesetzt und spielbar; `npm test` (208 Tests) und die Browser-Prüfung sind grün, der Standardmodus ist unverändert. Karten schalten Gebäude, Einheiten, Ausbaustufen und Forschungen frei, die Wahl liegt auf einer Kartenbühne in der Bildmitte. Die erste Simulation zeigte, dass der Pfad in 6-Minuten-Partien mit drei Wahlen kaum erreicht wird; nach dem Balancing (Entscheidung des PO) dauern Partien 9–10 Minuten mit 8–9 Wahlen, die Bots gewinnen aber weiter fast immer.

## Entscheidungen des PO
- Auftrag und Standards laut Anforderungsdokument (3 Karten je Angebot, 4 mit Universität; Pause bei offener Bühne; gemeinsame Auswahl über alle Familien).
- Unterbau zuerst auf `main` (Standardmodus unverändert), danach der Branch darauf aufgesetzt.
- Balancing-Vorschläge (Wahlen, Forschungsdauer, Versorgung, Partielänge, Kennzahlen) vollständig freigegeben.

## Umgesetzt je Inkrement
| Inkrement | Inhalt | Ergebnis |
|---|---|---|
| KP.0 | Voraussetzungen, Unterbau (`PACING_MODUS`, Freischaltlogik, Stufen mit Quelle, Einheitenersatz), Basislinie | fertig; auf `main` (`5c2f57b`) |
| KP.1 | Tutorial-Sprache nach Glossar, Sprach-Audit | fertig |
| KP.2 | Kartenbühne, Stapel, Tastatur, Sammlung im Reiter „Karten“ mit Pfadübersicht | fertig |
| KP.3 | Kartenfamilien, Bau-Karten, Startzustand `karten`, Meilenstein-Platz, Rückstandsgewicht | fertig |
| KP.4 | Universität als Forschungsstätte | fertig |
| KP.5 | Upgrade-Stufen, neue Einheiten, Einheitenersatz | fertig |
| KP.6 | Wagnis-Karten, Exklusivpaar, Mindesttempo | fertig |
| KP.7 | Bots, Kurzsimulation, Protokollfelder, Balancing, Testbuild | fertig; Abschlussserie läuft (siehe Offen) |

## Inventar zur Freigabe
**Karten nach Familie**
- Bonus: 41 vorhandene Karten (Wirtschaft 9, Armee 11, Basis 7, Automatisierung 8, Sonderregel 6). Keine hat eine freischaltende Wirkung, daher ist nichts umzuordnen. Vier brauchen einen Turm, eine den Werfer, zwei ein Gebäude (Bedingung bestand schon).
- Bau (5): Echtes Militär, Festungsbau, Metallverarbeitung, Gelehrte, Handel.
- Technologie (4): Fortgeschrittene Taktiken, Ballistik (exklusiv zueinander), Eiserne Klingen, Befestigungskunde.
- Wagnis (2): Glaskanonen, Volle Auslastung.

**Bestehende Forschungen (13).** Alle bleiben Grundforschung (verfügbar, sobald die Universität steht). Ausnahme: „Schildträger“ (alt) entfällt im Modus karten und wird durch die Pfadforschung ersetzt. Neu: Reiter, Schildträger, Eisenwaffen, Mauerausbau III, Turmausbau, Armbrustschütze, Katapult (7).

**Upgrade-Stufen mit genau einer Quelle**
| Upgrade | frei (Stufe 1) | gesperrt | Quelle |
|---|---|---|---|
| Schmiede: Qualitätsstufe | Kauf 1–3 | ab Kauf 4 | Forschung Eisenwaffen |
| Kaserne: Ausbau | Kaserne selbst | ab Kauf 1 | Forschung Reiter oder Armbrustschütze (Linien schließen sich aus) |
| Mauer: Verstärkung | – | Kauf 1 / ab Kauf 2 | Karte Festungsbau / Forschung Mauerausbau III |
| Stachelwall, Mörtelkolonne | – | alle | Karte Festungsbau |
| Turm: errichten, Kaliber | – | Kauf 1 / ab Kauf 2 | Karte Festungsbau / Forschung Turmausbau |
| Reichweite, Feuerrate (Turm) | – | alle | Forschung Turmausbau |
| Zinseszins (Kontor), Presse | alle frei | – | – |

## Abnahmekriterien
| Kriterium | Ergebnis |
|---|---|
| Startzustand `karten` entspricht der Liste; `standard` unverändert | erfüllt (Tests, Golden-Test) |
| Bau-Karte öffnet genau ihre Inhalte; gesperrte Inhalte nennen die Quelle | erfüllt (Test, Browser-Prüfung, `explAudit`) |
| Graphtest: jede Quelle erreichbar, keine Zyklen | erfüllt |
| 1.000 Angebote: ≥ 1 Bonuskarte, Pfadkarte wenn ziehbar, ≤ 1 Wagnis, keine Technologie ohne Universität | erfüllt |
| Nicht gewählte Pfadkarte kehrt zurück; gewählte nicht | erfüllt |
| Bühne: Mitte ±5 %, alle Karten lesbar bei 1280×720 und 1920×1080 | erfüllt (Bilder unten) |
| Eingabesperre, Maustaste gedrückt, zwei Wahlen nacheinander, Reiter bleibt | erfüllt (Browser-Prüfung) |
| Spielstand steht bei offener Bühne still (`pause`) | erfüllt (Test) |
| Technologiekarte öffnet Forschungen; Forschung nur bei laufender Zeit; Plätze; Abriss | erfüllt (Tests) |
| Einheitenersatz wertet auf, Zahl bleibt gleich | erfüllt (Test) |
| Wagnis, Exklusivpaar, Mindesttempo | erfüllt (Tests) |
| Sprach-Audit grün; Texte in beiden Sprachen; Längenregel | erfüllt |
| Simulation `standard` mit gleichem Seed identisch | erfüllt (Golden-Test) |
| Kaserne bis Minute 6 ≥ 90 %, Schmiede bis Minute 8 ≥ 80 % | teilweise (siehe Kennzahlen) |
| Strategievielfalt der Pfad-Varianten ≤ 15 pp | erfüllt in den Zwischenserien (3–15 pp) |
| Wahlbreite je Karte 5–60 % | teilweise: Echtes Militär und Gelehrte über 60 %, Bonuskarten teils unter 5 % |
| Paarvergleich +3 … +25 pp | steht aus; für Bau-Karten nicht erreichbar (einzige Quelle) |
| Partielänge P90 ≤ 20 min, Patt ≤ 2 % | erfüllt (Partien enden nach 6–11 min, keine offenen) |

## Kennzahlen
**Basislinie Standardmodus** (Normal, 20 Partien): 3–7 Wahlen je Partie, erste Wahl nach 76–86 s.

**Erste Serie, Modus karten, Startwerte des Dokuments** (Normal, durchschnitt, 40 Partien je Feld): Siegquote 63–100 %, Median bis zum Sieg 5:40–6:20 min, 3 Wahlen, Kaserne bis 6:00 in 53–100 %, Schmiede bis 8:00 in 0–68 %.

**Kalibrierung** (Normal, durchschnitt, „Militär zuerst“, 8–10 Partien je Strategie):
| Einstellung | Siege | Median | Wahlen |
|---|---|---|---|
| Startwerte | 10/10 | 5,5–5,6 min | 4 |
| Wellen ×1,4 (alle) | 1/10 (gierig) | – | 1 |
| Basis ×2,2 | 10/10 | 8,7 min | 6–7 |
| Basis ×3,5, Wellen bis ×1,5 | 10/10 | 10,4–11,2 min | 7–8 |
| zusätzlich EP-Wachstum 1,12 (übernommen) | 8/8 | 9,2–10,4 min | 8–9 |

Die Zeit von der Technologiekarte bis zur fertigen Einheit lag in den Serien bei 1:00–1:30 min (Forschungsdauer 45–50 s plus Wartezeit auf Material).

## Auffälligkeiten (berichtet, nicht wegbalanciert)
1. **Bots gewinnen fast immer.** Auch nach dem Balancing liegt die Siegquote bei 100 %. Der Bot ist kein Mensch; ein Spieltest muss Wartezeit und Wahlzeit klären.
2. **Fehler im Simulations-Bot.** Bei vollem Raster hielt er Material zurück und kaufte keine Einheiten. Im Modus karten (frühe Niederlagen) ist das korrigiert. Im Standardmodus bleibt es, damit die Vergleichswerte gelten; mit Korrektur gewänne der Standard-Bot schneller (Median 6:42 statt 9:17 min, 10 Partien). Vergleiche zwischen den Modi gelten daher nur mit Vorbehalt.
3. **Ein Faktor auf alle Gegnerwellen scheitert.** Die ersten Wellen entscheiden; bei ×1,4 verlor die gierige Strategie 9 von 10 Partien.
4. **Frühes Spiel im Modus karten.** Ohne Mauer-Stufen, Türme und Kaserne-Ausbau fehlen Material-Senken; vor der Korrektur lagen bis zu 2.500 Material ungenutzt.
5. **Die Bau-Karten sind einzige Quellen.** Ihr Paarvergleich zeigt zwangsläufig mehr als +25 pp; das Kriterium gilt nur für Technologie und Wagnis.

## Abweichungen und Auslegungen (zur Bestätigung)
Vollständig in `docs/STAND.md` (Nr. 1–18). Die wichtigsten:
1. `branch-konzepte-pacing.md` fehlt im Repository; der Unterbau folgt dem Anforderungsdokument.
2. Pfadkarte „Festungsbau“ heißt wie die Bonuskarte „Festungsbau“ (Kennung `pfadFestungsbau`); Vorschlag: Bonuskarte im Modus karten umbenennen.
3. Pfadkarten der Familien Bau und Technologie sind nicht bannbar (einzige Quelle ihrer Inhalte).
4. Harte Grenze „dritte Wahl“ nur, solange höchstens drei Bau-Karten zugleich warten; sie arbeitet als Warteschlange.
5. Kaserne-Ausbau 2 hat zwei Quellen, die sich ausschließen (Reiter oder Armbrustschütze), damit beide Linien Versorgung bekommen.
6. Gebäude-Ausbaustufen den vorhandenen Upgrades zugeordnet (Tabelle oben); Presse und Zinseszins bleiben frei.
7. Das Audit prüft die Präfixe `tut.` und `kp.`; die Wortliste trifft am Wortanfang (damit „Eisenwaffen“ zulässig ist).
8. Zweiter Forschungsplatz = die bestehende Forschung „Zweiter Platz“.
9. Wagnis-Karten mit eigener Seltenheit und Gewicht 4 (gegenüber 10 bei Pfadkarten).
10. Balancing über Basis- und Wellenfaktor, EP-Wachstum und Forschungsdauer (Werte siehe `docs/STAND.md`, Abschnitt Balancing).

## Bildschirmfotos
- Kartenbühne 1280×720: `docs/bilder/kartenbuehne-1280x720.png`
- Kartenbühne 1920×1080: `docs/bilder/kartenbuehne-1920x1080.png`
- Erste Sprechblase deutsch: `docs/bilder/tutorial-sprechblase-de.png`, englisch: `docs/bilder/tutorial-sprechblase-en.png`

## Testbuild
Spielbar: https://claude.ai/artifact/UqAfaz9fzuAtNFMHxyUfqt (privat, Protokollexport an). Leitfaden: `docs/testleitfaden-kartenpfad.md`; Protokollformat 2 enthält gewählte Karte mit Alternativen, Bedenkzeit, Neu ziehen, Bannen, Freischaltungen und Forschungen mit Zeit. GitHub Pages bietet keinen Link je Branch; der Link ist ein Artifact.

## Offen für den PO
1. **Abschlussserie:** `sim-karten` mit 30 Partien je Feld läuft (Rohdaten `reports/kartenpfad-*`); der Paarvergleich je Karte (rund 2.200 Partien, 2–3 Stunden) ist noch nicht gelaufen. Beide Ergebnisse folgen als Nachtrag.
2. **Zielpartielänge:** 9–10 min liegt knapp unter dem vorgeschlagenen Ziel von 10–14 min. Weiter erhöhen oder erst den Spieltest abwarten?
3. **Namensdopplung** „Festungsbau“ (Bonus und Pfad), Namen „Statthalter“/„Quartiermeister“ bestätigen.
4. **Freigabe:** Kein Merge nach `main` oder `MVP`, bevor du zustimmst; der Branch ist Experiment.

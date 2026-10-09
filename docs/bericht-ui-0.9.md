# Klammerfront – Bericht Version 0.9: Kartenbühne und Entdecken

Stand 09.10.2026. Anforderungen: `docs/anforderungen-kartenpfad-2.md` (Teil 2 des Branches `exp/kartenpfad`), Bericht des Branches: `docs/bericht-kartenpfad-2.md` auf `exp/kartenpfad`. Stand je Inkrement: `docs/STAND.md`.

## Ergebnis in drei Sätzen
Aus dem Branch `exp/kartenpfad` ist nur die Oberfläche in `main` und den MVP übernommen: Kartenwahl als Ablauf auf einer Bühne, freie Bildmitte, Kartensymbol in der Leiste und die Regel „nur, was jetzt nutzbar ist“, beides voreingestellt an. Spielregeln, Spielwerte, Spielstand-Version (7) und Simulation sind unverändert (Golden-Test, Kurzsimulation); der Modus `karten` mit Pfadkarten bleibt im Branch. Zwei Fehler, die schon in 0.8.1 steckten, sind behoben: das falsche „Kontor-Ausbau“ im Kontext der Universität und Klickertrag in der Pause.

## Entscheidungen des PO (09.10.2026)
- Bühne und Entdecken in `main` und im MVP voreingestellt **an**; zum Vergleich bleibt die alte Oberfläche per `?buehne=0&entdecken=0` erreichbar.
- Der Modus `karten` bleibt im Branch.

## Was in 0.9 steckt
| Bereich | Inhalt |
|---|---|
| Bildmitte | Kein Dauerstapel mehr; Fortschritt zur nächsten Wahl als Kartensymbol mit Füllstand in der Leiste, pulsiert bei aufgeschobener Wahl. Außerhalb einer Wahl liegt nichts von der Bühne im Bild. |
| Ablauf der Wahl | Karten fliegen aus der Leiste, decken von links nach rechts auf (Erscheinen plus Aufdecken ≈ 400 ms, Sperre ≈ 460 ms), die gewählte Karte fliegt zu ihrem Wirkort, der Rest zurück (≈ 700 ms). Spielzeit steht in dieser Zeit (`?zeit=lauf` lässt sie laufen). Bei reduzierter Bewegung keine Animation. |
| Karte | Band mit Kategorie, Name, Symbol, eine Wirkungszeile (höchstens 44 Zeichen, alle 41 Karten geprüft), Stufenpunkte, Seltenheit als Rahmen, Hinweis „mit Nachteil“, einheitliche Rückseite, Details unter den Karten. |
| Entdecken | Reiter, Abschnitte, Anzeigen und Ausbauten erscheinen erst, wenn sie nutzbar sind; neues Element blendet ein, trägt „neu“, löst genau einen Hinweis je Moment aus; nach fertiger Forschung Hinweis und Marke. |
| Schalter | `?buehne=1\|0`, `?entdecken=1\|0`, `?vorschau=naechste`, `?zeit=pause\|langsam\|lauf` (siehe `docs/testleitfaden-ui-0.9.md`). |
| Protokoll (`?debug=1`) | Sichtbarkeitszeit und erste Ansicht je Element, Zeit unter dem Zeiger je Karte, aktive Schalter. |

## Fehlerbehebungen
| Nr. | Befund | Ursache | Behebung |
|---|---|---|---|
| 1 | Bei gewählter Universität erscheint „Kontor-Ausbau“ | Container mit `display: flex` überschrieb `hidden` (bestand in 0.8.1) | `.opts[hidden]` |
| 2 | In der Pause erzeugen etwa 6 Klicks Material (bestand in 0.8.1) | Die Logik kennt die Pause nicht, die Klickzeit steht still, das Limit von 6 je Sekunde blieb je Pause frei | Klickertrag in Pause und Dialogen gesperrt, Knopf gesperrt |

## Messung „sichtbare Bedienelemente“
Fester Lauf (Seed 424242, Bot „einheiten-zuerst“, „durchschnitt“, Normal), `tools/sichtbar-mass.mjs`, Rohdaten `reports/sichtbar-*.json`; ohne den gleichbleibenden Rahmen von 16 Elementen.

| Oberfläche | Minute 1 | Minute 5 | Minute 10 |
|---|---|---|---|
| 0.8.1 (vorher) | 42 | 46 | 46 |
| 0.9, Vorgabe (Entdecken an) | 24 | 29 | 29 |
| 0.9 mit `?buehne=0&entdecken=0` | 39 | 43 | 43 |

Minute 1 sinkt um 43 %. Die Zeile „0.9 mit Schaltern aus“ liegt drei unter 0.8.1, weil der Fehler 1 behoben ist (ein sonst sichtbarer Container entfällt). Im Standardspiel ist von Anfang an vieles nutzbar; das Verhältnis Minute 1 zu Minute 10 liegt bei 0,83. Das Drittel-Ziel galt für den Modus `karten` und ist dort knapp verfehlt (Bericht des Branches).

## Prüfungen
| Prüfung | Ergebnis |
|---|---|
| `npm test` (194 Tests, Golden-Test unverändert) | grün |
| `tests/browser-check.mjs` (bisherige Abläufe mit `?buehne=0&entdecken=0`, Tutorial in beiden Oberflächen, öffentliche Fassung) | grün |
| `tests/browser-k2.mjs` (55 Prüfungen: Bildmitte, Ablauf, Karte, Sichtbarkeit, Sammlung, Hinweise, Fehler 1 und 2, Schalter) | grün |
| Kurzsimulation `standard` | 100 % Siege, keine offene Partie, unverändert |
| Öffentliche Fassung: keine externen Abrufe, keine Konsolenfehler, keine Testschnittstelle | grün |

## Auslegungen und Auffälligkeiten
1. Das Band zeigt die Kategorie (es gibt im Standard keine Familien); die Sammlung ist nach Kategorie gruppiert.
2. „Nicht im DOM“ ist als „nicht dargestellt“ umgesetzt (`hidden`, nicht fokussierbar).
3. Die gestaffelte Einführung (Gebäude ab Stufe 2) bleibt; der Hinweis „Neu: Schmiede, Kaserne …“ erscheint zusätzlich zu den Entdeckungshinweisen.
4. Wiederholte Animationen können bei vielen Wahlen ermüden; Dauern stehen in `config.js` (`KARTENBUEHNE`).
5. Nicht geprüft: Die öffentliche Seite (GitHub Pages) ist aus der Cloud-Umgebung nicht erreichbar; die Quelle von Pages (`main` oder `MVP`) ist weiter offen (siehe `docs/bericht-mvp-release.md`).

## Offen für den PO
1. Release `v0.9.0` auf `MVP` auf GitHub anlegen (Tags lassen sich von hier nicht setzen).
2. Öffentlichen Link in einem privaten Fenster öffnen und eine Partie mit Tutorial spielen.
3. Spieltest nach `docs/testleitfaden-ui-0.9.md`; der Branch `exp/kartenpfad` (Modus `karten`) bleibt für die Kartenpfad-Entscheidung bestehen.

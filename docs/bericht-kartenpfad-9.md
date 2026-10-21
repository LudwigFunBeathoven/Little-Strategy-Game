# Bericht Kartenpfad Teil 9: Kartenfläche, Klassifikation, Text

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-8. Anforderungen: `docs/anforderungen-kartenpfad-8-9.md`. Rohdaten: `reports/kartenpfad9-textinventar.*`, Textübersicht `docs/texte-kartenpfad.md`.

## Ergebnis

1. Kartenfläche, Nachteilszeilen, Klassifikationen ohne Wörter, Begriffe, Namenskollisionen, Designertext und Phasenanzeige sind umgesetzt und durch Tests gesichert. Kein sichtbarer Text verletzt mehr die Zeichenbudgets aus R3.
2. Das Ziel „−25 % deutsche Gesamtzeichen“ ist **nicht erreicht**: 31.094 → 29.748 Zeichen (−4,3 %). Die verbleibenden Texte sind knapp; mehr Kürzung hieße Inhalt streichen. Die Anforderungen nennen den Wert selbst „gesetzt, nicht hergeleitet“ und R1 bis R3 als maßgeblich.
3. Neu: Test „keine zwei Elemente gleichen Namens“ (`tests/namen9.test.mjs`) und Sprach-Audit R3 bis R6 (`tests/sprache.test.mjs`).

## Abnahmetabelle

| REQ | Kriterium | Ergebnis |
|---|---|---|
| K9.01 | Textinventar | erfüllt (`tools/textbudget.mjs`, 886 sichtbare Schlüssel, `reports/kartenpfad9-textinventar.*`) |
| K9.02 | Nachteilszeile auf der Karte, eigene Zeile und Zeichen (`▼`) | erfüllt (`kp.drawback.*`, 18 Zeilen, `tests/text9.test.mjs`, `tests/browser-u9.mjs`) |
| K9.03 | Kategorie als Farbe und Symbol, Familie als Rahmen, Seltenheit als Ring, Wörter nur im Tooltip und Aria-Label | erfüllt |
| K9.04 | −25 % Zeichen | **nicht erreicht** (−4,3 %) |
| K9.04 | keine Verstöße gegen R3, höchstens 10 Ausnahmen | erfüllt (0 Verstöße, 0 Ausnahmen) |
| K9.05 | Designertext, veraltete Aussagen | erfüllt (Suchtests) |
| K9.06 | Begriffe und Kollisionen | erfüllt (zehn Umbenennungen) |
| K9.07 | keine Phasenanzeige | erfüllt (`hdr.level` ohne Phase, `phase.*` gelöscht, `tip.click.body` nennt die Stufe) |
| K9.08 | Sprach-Audit R3–R6, Textübersicht mit Zeichenzahl | erfüllt (`docs/texte-kartenpfad.md`, 1024 Schlüssel) |
| K9.09 | Bericht, Testleitfaden | erfüllt (`docs/testleitfaden-kartenpfad-9.md`) |
| Mensch | Karte bei 375 px lesbar | offen, [Mensch] (Prüfpunkt im Testleitfaden) |

## Zeichen je Element (Deutsch, mit Beispielwerten)

| Element | Schlüssel | Zeichen | Budget | über Budget |
|---|---|---|---|---|
| Kartenname | 54 | 592 | 22 | 0 |
| Wirkungszeile | 54 | 1595 | 40 | 0 |
| Nachteilszeile | 18 | 489 | 40 | 0 |
| Gebäudebeschreibung | 6 | 525 | 110 | 0 |
| Tooltip | 226 | 13724 | 180 | 0 |
| Hinweis | 14 | 805 | 100 | 0 |
| ohne Budget (Beschriftungen, Tutorial, Protokoll) | 514 | 12018 | – | – |

Vor der Kürzung hatten sieben Texte das Budget überschritten (u. a. `tip.kat.counts` 287 Zeichen, `doctrine.bollwerk.desc` 234). Gekürzt wurden rund 50 Beschreibungen; Wertangaben blieben als Platzhalter erhalten.

## Abweichungen und Auslegungen

1. **−25 %:** nicht erreicht, siehe Ergebnis. Rund 40 % der Zeichen stehen in Beschriftungen, Tutorial und Protokollzeilen ohne Budget, die bereits knapp sind.
2. **Vorschau-Platzhalter „?“:** statt ihn auszublenden, wurde das Element samt Schalter `ENTDECKEN.vorschau` und URL-Parameter `?vorschau` entfernt; es hatte nie Inhalt.
3. **Phasenmechanik:** unverändert (Golden-Test grün). Der Text nennt „ab Stufe 2“ bzw. „ab Stufe 5“ aus `PHASE_MID_LEVEL` und `PHASE_LATE_LEVEL`.
4. **Handelskontor:** heißt im Deutschen jetzt überall „Kontor“. Der Schlüssel `draft.handelskontor.name` (nur im Standardmodus sichtbar) heißt „Kontorausbau“.
5. **R6-Ausnahmen:** Feste Zahlen stehen noch in elf Texten (z. B. „doppelt“, „×2“, „1 Lebenspunkt“, „3 Klicks/s“), weil sie Wörter oder feste Spielregeln beschreiben; die Liste steht in `tests/sprache.test.mjs`.

## Auffälligkeiten

- Der Browser-Test `tests/browser-check.mjs` schwankt in den Prüfpunkten „Abschied 1“ und „Abschied 2“ (Timing). Ich habe eine Wartebedingung eingebaut; im letzten Lauf grün, zuvor in drei von vier Läufen rot (abwechselnd de und en). Ursache vermutlich die Kartenanimation vor dem Abschied. Nicht abschließend geklärt.

## Entscheidungen des PO (entschieden am 21.10.2026)

1. Weitere Kürzung erst nach einem Spieltest.
2. Die elf R6-Ausnahmen bleiben bis dahin bestehen.

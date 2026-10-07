# Klammerfront – Anforderungen MVP-Veröffentlichung

Stand: 07.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-mvp-release.md` · Branch: `main`
Bezug: `docs/bericht-kartenpfad.md`, `docs/anforderungen-kartenpfad.md`, `docs/anforderungen-tutorial-2.md`

## 0. Auftrag in Kürze

Der MVP auf `main` wird öffentlich geteilt. Vorher kommen drei Änderungen aus der Arbeit am Branch `exp/kartenpfad` nach `main`:

1. die neue Tutorial-Sprache mit Sprach-Audit,
2. die Korrektur des Simulations-Bots,
3. die erweiterten Protokollfelder für Spieltests (Kann).

Der Branch `exp/kartenpfad` bleibt unveröffentlicht. Er wird inhaltlich weiterentwickelt; dafür folgt ein eigenes Anforderungsdokument. Die Kartenbühne bleibt im Branch und kommt erst nach einem weiteren Test nach `main`.

**Ersetzt:** In `docs/anforderungen-kartenpfad.md` entfallen REQ-M.03 und der Absatz zur Veröffentlichung beider Fassungen in Abschnitt 1. Es gibt keine öffentliche Unterseite für den Prototyp.

## 1. Entscheidungen des PO

| Thema | Entscheidung |
|---|---|
| Tutorial-Sprache | Glossar und Ersatztexte angenommen, einschließlich „Statthalter“ und „Quartiermeister“ |
| Öffentlich | Nur der MVP aus `main` |
| Prototyp Kartenpfad | Bleibt privat; keine Veröffentlichung, bis der PO sie freigibt |
| Kartenbühne | Bleibt im Branch; Übernahme nach `main` erst nach erneutem Test |

## 2. Arbeitsgrundlagen

- **Vor Beginn lesen:** `CLAUDE.md`, `docs/STAND.md`, `docs/bericht-kartenpfad.md`, dieses Dokument.
- **Kein Merge von `exp/kartenpfad` nach `main`.** Jede Änderung entsteht auf einem eigenen Branch von `main` (`fix/…` bzw. `feat/…`) und wird einzeln übernommen.
- **Commits aus dem Branch** dürfen nur übernommen werden, wenn sie ausschließlich die betreffende Änderung enthalten. Sonst wird die Änderung auf `main` neu umgesetzt.
- **Invarianten** gelten unverändert: `core.js` ohne DOM; Zufall nur über `S.rng`; Zahlen nur in `config.js` bzw. `data/`, Texte nur in `i18n/`; Spielstand als azyklisches JSON; Tooltip und Erklärzeile an jedem Bedienelement.
- **Spielwerte von `main` bleiben unverändert.** Dieser Auftrag enthält kein Balancing.

## 3. Anforderungen

| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| R.01 | Voraussetzungen prüfen | Muss | R.0 |
| R.02 | Tutorial-Sprache | Muss | R.1 |
| R.03 | Simulations-Bot korrigieren, neue Vergleichsbasis | Muss | R.2 |
| R.04 | Protokollfelder für Spieltests | Kann | R.3 |
| R.05 | Veröffentlichung des MVP | Muss | R.4 |
| R.06 | Abgleich mit dem Branch | Muss | R.5 |

---

### REQ-R.01 Voraussetzungen prüfen

Festhalten in `docs/STAND.md`:

- Ist das Tutorial (Teil 1 und 2) auf `main` umgesetzt? Falls nein: R.02 nicht beginnen, Befund berichten.
- Liegt der gemeinsame Unterbau auf `main` (`5c2f57b`) und ist der Modus `standard` voreingestellt?
- Lässt sich auf `main` ein anderer Modus als `standard` aktivieren, etwa per URL-Parameter oder `KF_OVERRIDE`? Falls ja: Für den öffentlichen Build abschalten. Unfertige Modi dürfen im MVP nicht erreichbar sein.
- Sichtbarkeit des Repositorys und Quelle von GitHub Pages: Pages veröffentlicht ausschließlich `main`.

---

### REQ-R.02 Tutorial-Sprache

**Ziel:** Das Tutorial des MVP spricht ruhig und abstrakt, in Deutsch und Englisch.

**Anforderungen**

- Glossar und Ersatztexte aus `docs/anforderungen-kartenpfad.md` (REQ-M.02) unverändert übernehmen, wie in KP.1 im Branch umgesetzt.
- Abschiedstext A1 in der Standardfassung: „Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden.“ / “Walls, towers, forge, university – much is waiting to be discovered.” Die Variante für den Modus `karten` (Schlüssel `kp.`) bleibt im Branch.
- Anrede „Statthalter“ / “governor”, Figur „Quartiermeister“ / “quartermaster”.
- Die schwebende Zahl der EP-Garantie heißt „Erfahrung“ / “experience”.
- **Sprach-Audit** wie im Branch: Wortliste in `tools/`, Abgleich am Wortanfang, geprüft werden alle Schlüssel mit dem Präfix `tut.` in beiden Sprachen.

**Akzeptanzkriterien**

- Sprach-Audit grün.
- Längenregel aus T2.03 eingehalten (Erzählung ≤ etwa 90, Auftrag ≤ etwa 30 Zeichen).
- Playwright-Durchlauf des Tutorials in beiden Sprachen ohne Fehler; Bildschirmfoto der ersten Sprechblase je Sprache im Bericht.
- Bot-Simulation mit gleichem Seed unverändert (Texte ändern keine Spiellogik).

---

### REQ-R.03 Simulations-Bot korrigieren, neue Vergleichsbasis

**Befund (Bericht Kartenpfad, Auffälligkeit 2):** Bei vollem Raster hält der Simulations-Bot Material zurück und kauft keine Einheiten. Der Fehler besteht auch auf `main`.

**Anforderungen**

- Test schreiben, der den Fehler auf `main` rot zeigt; dann beheben. Der Bot kauft Einheiten, sobald kein Bauplatz mehr frei ist und keine sinnvolle Ausbauoption besteht.
- Neue Vergleichsbasis aufnehmen: 50 Partien je Feld, beide Strategien („Simulations-Bot“, „einheiten-zuerst“).
- Golden-Test auf die neue Basis umstellen, im selben Commit wie die Korrektur.
- Spielwerte bleiben unverändert.

**Zu berichten**

- Siegquote, Median der Partiedauer und Zahl der Kartenwahlen je Feld, vorher und nachher.
- Bewertung: Welche Zielkorridore aus den bisherigen Iterationen verfehlt der MVP mit dem korrigierten Bot? Das ist eine Information für Iteration 7. Eine Neukalibrierung findet in diesem Auftrag nicht statt.

**Akzeptanzkriterien**

- Test für den Fehler grün.
- Neue Vergleichsbasis und Gegenüberstellung im Bericht.

---

### REQ-R.04 Protokollfelder für Spieltests (Kann)

- Der Protokollexport mit `?debug=1` erfasst je Kartenwahl die gewählte Karte, die angebotenen Alternativen, die Bedenkzeit sowie die Nutzung von Neu ziehen und Bannen.
- Format wie Protokollformat 2 im Branch, soweit die Felder im Standardmodus sinnvoll sind. Felder zu Freischaltungen und Pfadforschung entfallen.
- `tools/compare-human.mjs` liest das Format; ältere Protokolle bleiben lesbar.

**Akzeptanzkriterium:** Test exportiert ein Protokoll mit mindestens zwei Kartenwahlen und allen Feldern.

---

### REQ-R.05 Veröffentlichung des MVP

**Anforderungen**

- GitHub Pages veröffentlicht `main`. Andere Branches werden nicht veröffentlicht.
- Version erhöhen (Patch-Stufe gegenüber dem bisherigen Stand von `main`); `CHANGELOG.md` mit den Änderungen aus R.02–R.04 in einer für Tester lesbaren Form.
- Prüfliste vor dem Teilen:
  - kein Modus außer `standard` erreichbar (R.01),
  - keine Konsolenfehler oder Warnungen beim Durchlauftest je Schwierigkeitsgrad,
  - keine externen Abrufe außer den Spieldateien,
  - Debug-Funktionen nur mit `?debug=1` sichtbar,
  - Startbildschirm mit Sprache, Schwierigkeitsgrad und Tutorial-Schalter funktioniert bei leerem Speicher.
- Der Testleitfaden für Spieltests mit Menschen ist auf den MVP-Stand aktualisiert.

**Akzeptanzkriterium:** Öffentlicher Link funktioniert in einem frischen Browserprofil; Durchlauf Startbildschirm → Tutorial → freies Spiel ohne Fehler. Link im Bericht.

---

### REQ-R.06 Abgleich mit dem Branch

Nach der Veröffentlichung:

- `main` in `exp/kartenpfad` mischen. Konflikte bei der Tutorial-Sprache zugunsten von `main` lösen; die Branch-Schlüssel `kp.` bleiben.
- Im Branch `docs/STAND.md` in `docs/STAND-kartenpfad.md` umbenennen. `docs/STAND.md` beschreibt künftig nur `main`.
- Der Branch übernimmt die Bot-Korrektur aus `main`. Seine bisherige Sonderkorrektur für den Modus `karten` entfällt, falls sie dadurch doppelt ist.
- Im Branch keine weiteren langen Simulationsserien (Abschlussserie, Paarvergleich), bis das nächste Anforderungsdokument für den Kartenpfad vorliegt. Bereits vorliegende Rohdaten bleiben in `reports/`.
- Testbuild des Branches bleibt privat.

**Akzeptanzkriterium:** Branch nach dem Mischen mit `npm test` und Browser-Prüfung grün; Modus `standard` im Branch identisch zu `main`.

## 4. Inkrementplan

| Inkrement | Inhalt | REQ |
|---|---|---|
| R.0 | Voraussetzungen prüfen | R.01 |
| R.1 | Tutorial-Sprache, Sprach-Audit | R.02 |
| R.2 | Bot-Korrektur, neue Vergleichsbasis | R.03 |
| R.3 | Protokollfelder | R.04 |
| R.4 | Veröffentlichung, Prüfliste, Bericht | R.05 |
| R.5 | Abgleich mit dem Branch | R.06 |

**Abbruchregel:** Jedes Inkrement ist für sich übernehmbar. Priorität bei knappem Budget: R.0 → R.1 → R.4 → R.2 → R.5 → R.3. Der MVP kann mit R.1 veröffentlicht werden, auch wenn R.2 noch aussteht; die Bot-Korrektur betrifft nur die Simulation.

## 5. Offene Punkte mit gesetztem Standard

| Punkt | Standard |
|---|---|
| Balancing des MVP gegen den korrigierten Bot | Nur messen und berichten; Neukalibrierung in Iteration 7 mit Daten aus Spieltests |
| Doppelter Name „Festungsbau“ | Betrifft nur den Branch; nicht Teil dieses Auftrags |
| Kartenbühne | Bleibt im Branch |

(Hinweis zur Ablage: In der Vorlage stand an dieser Stelle der Satz „Zur Vorbereitung des merge im Main, sollen zunächst allgemeine Verbesserungen angegangen werden:“ mitten in der Tabelle. Ich lese ihn als Überschrift des Auftrags, nicht als Tabelleninhalt.)

## 6. Definition of Done

- `npm test` und `browser-check.mjs` auf `main` grün; Sprach-Audit grün.
- MVP öffentlich unter dem Pages-Link erreichbar; Prüfliste erfüllt.
- `docs/bericht-mvp-release.md` mit Ergebnissen je REQ, Vergleichsbasis vorher/nachher, Bildschirmfotos und Link.
- `docs/STAND.md`, `CHANGELOG.md` und Testleitfaden aktualisiert.
- Branch `exp/kartenpfad` auf dem Stand von `main`, `STAND-kartenpfad.md` angelegt, Testbuild privat.

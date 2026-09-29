# Klammerfront – Projektkontext für Claude

## Was das ist
Browser-Spiel zwischen *Universal Paperclips* (Clicker/Idle-Ökonomie) und *Age of War* (Lane-Kampf).
Der Spieler klickt, baut Fabriken im 3×3-Raster und schickt Einheiten in Wellen über drei Lanes. Material bezahlt Einheiten,
Gebäude und Upgrades. Abschüsse bringen Erfahrungspunkte (EP), die nur als Erfahrung zählen. Jeder Stufenaufstieg bietet Spezialkarten
(2, mit Universität 3), die bis zu drei Stufen haben. Die Partie ist verloren, wenn das Tor fällt.

Stand: v0.5 (Iteration 4: `docs/anforderungen-iteration-4.md`, Stand je Inkrement in `docs/STAND.md`,
Bericht in `docs/bericht-iteration-4.md`). Frühere Iterationen: `docs/archiv/`, `docs/bericht-iteration-3.md`.

## Der Nutzer
Nick ist Product Owner, kein Entwickler. Erkläre Änderungen in Klartext und übersetze Fachbegriffe kurz.
Kommunikation auf Deutsch, knapp, Ergebnis zuerst. Schwache Ideen offen benennen.
Weicht eine Umsetzung von einer Anforderung ab: begründen und nachfragen, nichts stillschweigend anders lösen.

## Aufbau (kein Build-Schritt, keine Abhängigkeiten)
| Datei | Inhalt |
|---|---|
| `index.html` | Markup und CSS. Enthält außer dem Titel keinen sichtbaren Text. |
| `config.js` | **Alle** Zahlenwerte (Balancing, Regeln, Tooltip-Zeiten, Schwierigkeitsgrade). |
| `data/draft-options.js` | Spezialkarten mit Stufen (`tiers`), deklarativ. Neue Karten nur hier ergänzen. |
| `hints.js` | Erstkontakt-Hinweise; Speicher wird von außen übergeben (testbar ohne Browser). |
| `core.js` | Spiellogik ohne Zugriff auf Seite, Fenster oder Speicher. Läuft auch im Simulator. |
| `ui.js` | Oberfläche, Tooltips, Dialoge, Zeichnen, Speichern. |
| `i18n/de.js`, `i18n/en.js` | Alle sichtbaren Texte. Schlüssel müssen identisch sein. |
| `tools/simulate.mjs` | Balancing-Simulation mit Bots (Worker-Threads). |
| `tools/sim-bot.mjs` | Bot-Strategien `zufall` und `gierig` (Vorausschau per Kopie des Spielstands). |
| `tests/` | `npm test` (Node-eigener Test-Runner), optional `npm run test:browser` (braucht Playwright). |
| `docs/STAND.md` | Stand je Inkrement, Prüfergebnisse, Abweichungen und Auslegungen. |

Regeln:
- Keine Zahlen in `core.js`/`ui.js`, die Balancing oder Regeln betreffen. Neue Werte als benannte Konstante in `config.js`.
- Keine sichtbaren Texte außerhalb der Sprachdateien. Platzhalter wie `{n}`, `{percent}`; Zahlen über `Intl.NumberFormat`.
- `core.js` darf nicht auf `document`, `window`, `localStorage` zugreifen.
- Zufall nur über den seedbaren Generator im Spielstand (`S.rng`), damit Simulationen reproduzierbar sind.
- Jedes interaktive Element braucht `data-tooltip`. Prüfung: `index.html?dev=1` meldet fehlende Tooltips in der Konsole.
- Jeder Knopf braucht eine Erklärzeile `<span class="expl">` mit „Wirkung · Kosten“ (REQ-20.1). Neue UI-Elemente bekommen sie sofort.
  Prüfung: `__kf.explAudit()` bzw. `index.html?dev=1`.
- Gesperrte Knöpfe über `aria-disabled`, nicht `disabled` (sonst erscheinen keine Tooltips).
- Spielstand-Format hat eine Versionsnummer (`v` in `freshState`, `SAVE_KEY`). Bei inkompatiblen Änderungen beide erhöhen.

## Balancing
Nach jeder Änderung an Zahlen oder Regeln:
```
npm test
node tools/simulate.mjs --suite kurz                  # Kurzsimulation (Anhang A): 20 Partien Normal
node tools/simulate.mjs --runs 20 --suite ziele       # Siegquoten, Dauer, Patt-Quote, Karten-Differenz, reine Verteidigung
node tools/simulate.mjs --runs 20 --suite strategie   # Gebäude, Draft-Wahlraten, Draft-Abstände
node tools/simulate.mjs --runs 50 --suite phasen      # Klickanteile je Phase (für die Abnahme: --runs 200)
```
Für Versuche ohne Dateiänderung: `KF_OVERRIDE='{"POST_SIEGE_GROWTH":0.5}' node tools/simulate.mjs …`.
Patt-Quote (offen nach 30 Minuten) höchstens 2 %. Der Bot „verteidigung“ (kauft keine Einheiten) gewinnt nie und
verliert spätestens in Minute 25. „aktiv“ gewinnt je Schwierigkeitsgrad mindestens so oft wie „durchschnitt“. Die Simulation misst Stärke, nicht Spielspaß:
Auffälligkeiten berichten, nicht automatisch wegbalancieren.

Zielkorridore (Median bis zum Sieg, Bot-Spielertypen siehe `tools/sim-bot.mjs`):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 5–7 min | 6–9 min | Sieg, 10–18 min | darf verlieren |
| Normal | 6–9 min | 9–13 min | darf verlieren | verliert |
| Schwer | 8–12 min | 13–20 min | verliert | verliert |

Weitere Zielwerte (Iteration 2): erster Draft nach 60–90 s; Median-Abstand zwischen Drafts je Phase 45–150 s;
Klickanteil bei 6 Klicks/s: Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %; Draft-Wahlrate je Option 5–60 %.
Iteration 3: Partien ohne Schmiede gewinnen auf Normal mindestens 30 % (`--suite ohneSchmiede`). Karten, deren Siegquote-Differenz
über +25 Prozentpunkten liegt, werden berichtet, nicht automatisch abgeschwächt.
Iteration 4: Vergleichswert einer Karte ist „angeboten und nicht gewählt“ (je Stufe); Bots spielen mit gestaffelter Einführung
(`KF_SKIP_INTRO=1` schaltet sie ab).

## Mechaniken gegen Patts (nicht ohne Simulation entfernen)
- Belagerung: Eigene Einheiten am gegnerischen Tor blockieren reguläre Gegnerwellen in dieser Lane.
- Notaufgebot: Fällt die gegnerische Basis unter 2/3 bzw. 1/3, schickt der Gegner sofort Reserven.
- Belagerungswelle in Minute 16 (dreifache Größe), danach +`POST_SIEGE_GROWTH` Gegnerstärke je Minute, linear.
- Reparatur je Abschnitt höchstens alle `REPAIR_COOLDOWN_S` Sekunden (sonst hält reine Verteidigung auf Leicht bis Minute 30).
- Gegnerische Einheiten auf dem Feld sind begrenzt (`maxField`); die Belagerungswelle rückt immer vollständig aus.
- Entfernt in I4.2 (Simulation ohne sie: 0–2 % Patts): Belagerung als Stärke je Einheit, Nachskalieren der Gegner im Feld.

## Kampf in Formationen (REQ-42)
Alle Einheiten einer Welle in derselben Lane bilden eine Formation, die sich als Block mit `FORMATION_SPEED` bewegt.
Vorn Nahkämpfer in Reihen zu höchstens `FORMATION_ROW_MAX`, dahinter Fernkämpfer; die Reihen werden laufend neu gebildet.
Die ganze vorderste Reihe greift an, Fernkämpfer mit höchstens `RANGED_RANGE_ROWS` Reihen vor sich. Formationen, die eine
stehende eigene Formation einholen, verschmelzen. Transiente Daten (vorderste Reihe, Ziel) liegen nicht im Spielstand.

## Arbeitsweise in Inkrementen
Ein Inkrement ist fertig, wenn: das Spiel über `index.html` ohne Konsolenfehler startet; `npm test` und `npm run test:browser`
grün sind; die Kurzsimulation keine offene Partie und eine Siegquote von 20–100 % zeigt; neue Texte in `de` und `en` liegen und
neue Knöpfe Tooltip und Erklärzeile haben; der Commit `I<Iteration>.<Inkrement>: <Inhalt>` heißt und `docs/STAND.md` aktualisiert ist.

## Abschluss einer Iteration
Bericht `docs/bericht-iteration-<n>.md` mit: Ergebnis in drei Sätzen, Entscheidungen des PO, Abweichungen und Auslegungen
(zur Bestätigung), Tabelle der Abnahmekriterien mit Ergebnis, Kennzahlen der Serie, Auffälligkeiten (berichtet, nicht
wegbalanciert), offene Punkte für den PO. Rohdaten der Simulation unter `reports/`.

## Bekannte offene Punkte
Siehe Abschnitt „Offen“ in `docs/bericht-iteration-4.md`.

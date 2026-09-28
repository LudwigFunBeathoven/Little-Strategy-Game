# Klammerfront – Projektkontext für Claude

## Was das ist
Browser-Spiel zwischen *Universal Paperclips* (Clicker/Idle-Ökonomie) und *Age of War* (Side-Scrolling-Lane-Kampf).
Der Spieler klickt und automatisiert die Materialproduktion. Material bezahlt Einheiten, Gebäude und Upgrades.
Abschüsse bringen Altmetall, das nur als Erfahrung zählt. Jeder Stufenaufstieg öffnet einen Draft mit 2 Optionen,
mit Universität 3.

Stand: v0.3 (Iteration 2, Anforderungen in `docs/anforderungen-iteration-2.md`, Umsetzungsbericht in `docs/bericht-iteration-2.md`).

## Der Nutzer
Nick ist Product Owner, kein Entwickler. Erkläre Änderungen in Klartext und übersetze Fachbegriffe kurz.
Kommunikation auf Deutsch, knapp, Ergebnis zuerst. Schwache Ideen offen benennen.
Weicht eine Umsetzung von einer Anforderung ab: begründen und nachfragen, nichts stillschweigend anders lösen.

## Aufbau (kein Build-Schritt, keine Abhängigkeiten)
| Datei | Inhalt |
|---|---|
| `index.html` | Markup und CSS. Enthält außer dem Titel keinen sichtbaren Text. |
| `config.js` | **Alle** Zahlenwerte (Balancing, Regeln, Tooltip-Zeiten, Schwierigkeitsgrade). |
| `data/draft-options.js` | Draft-Optionen, deklarativ. Neue Optionen nur hier ergänzen. |
| `core.js` | Spiellogik ohne Zugriff auf Seite, Fenster oder Speicher. Läuft auch im Simulator. |
| `ui.js` | Oberfläche, Tooltips, Dialoge, Zeichnen, Speichern. |
| `i18n/de.js`, `i18n/en.js` | Alle sichtbaren Texte. Schlüssel müssen identisch sein. |
| `tools/simulate.mjs` | Balancing-Simulation mit Bots (Worker-Threads). |
| `tools/sim-bot.mjs` | Bot-Strategien `zufall` und `gierig` (Vorausschau per Kopie des Spielstands). |
| `tests/` | `npm test` (Node-eigener Test-Runner), optional `npm run test:browser` (braucht Playwright). |

Regeln:
- Keine Zahlen in `core.js`/`ui.js`, die Balancing oder Regeln betreffen. Neue Werte als benannte Konstante in `config.js`.
- Keine sichtbaren Texte außerhalb der Sprachdateien. Platzhalter wie `{n}`, `{percent}`; Zahlen über `Intl.NumberFormat`.
- `core.js` darf nicht auf `document`, `window`, `localStorage` zugreifen.
- Zufall nur über den seedbaren Generator im Spielstand (`S.rng`), damit Simulationen reproduzierbar sind.
- Jedes interaktive Element braucht `data-tooltip`. Prüfung: `index.html?dev=1` meldet fehlende Tooltips in der Konsole.
- Gesperrte Knöpfe über `aria-disabled`, nicht `disabled` (sonst erscheinen keine Tooltips).
- Spielstand-Format hat eine Versionsnummer (`v` in `freshState`, `SAVE_KEY`). Bei inkompatiblen Änderungen beide erhöhen.

## Balancing
Nach jeder Änderung an Zahlen oder Regeln:
```
npm test
node tools/simulate.mjs --runs 20 --suite ziele       # Siegquoten und Dauer
node tools/simulate.mjs --runs 20 --suite strategie   # Gebäude, Draft-Wahlraten, Draft-Abstände
node tools/simulate.mjs --runs 50 --suite phasen      # Klickanteile je Phase (für die Abnahme: --runs 200)
```
Kein Ergebnis darf „offen“ (Patt nach 30 Minuten) sein. Die Simulation misst Stärke, nicht Spielspaß:
Auffälligkeiten berichten, nicht automatisch wegbalancieren.

Zielkorridore (Median bis zum Sieg, Bot-Spielertypen siehe `tools/sim-bot.mjs`):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 5–7 min | 6–9 min | Sieg, 10–18 min | darf verlieren |
| Normal | 6–9 min | 9–13 min | darf verlieren | verliert |
| Schwer | 8–12 min | 13–20 min | verliert | verliert |

Weitere Zielwerte (Iteration 2): erster Draft nach 60–90 s; Median-Abstand zwischen Drafts je Phase 45–150 s;
Klickanteil bei 6 Klicks/s: Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %; Draft-Wahlrate je Option 5–60 %.

## Mechaniken gegen Patts (nicht ohne Simulation entfernen)
- Belagerung: Eigene Einheiten am gegnerischen Tor blockieren reguläre Gegnerwellen.
- Tor belagert: Stehen mindestens 3 Gegner am eigenen Aufstellpunkt, lassen sich keine Einheiten aufstellen.
- Notaufgebot: Fällt die gegnerische Basis unter 2/3 bzw. 1/3, schickt der Gegner sofort Reserven.
- Eskalation: Ab Minute 16 wird der Gegner jede Minute um 40 % stärker (Zinseszins).
- Gegnerische Einheiten auf dem Feld sind begrenzt (`maxField`).

## Bekannte offene Punkte
Siehe Abschnitt „Offen“ in `docs/bericht-iteration-2.md`.

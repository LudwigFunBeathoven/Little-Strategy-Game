# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Gebäude wählen, Einheiten an die Front schicken, bei jedem Stufenaufstieg eine Verstärkung wählen und die gegnerische Basis zerstören.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig. Sprache (Deutsch/English) und Schwierigkeit werden auf dem Startbildschirm gewählt.

## Spielprinzip
- **Fertigen** erzeugt Material. Zu Beginn die wichtigste Einnahme, danach tragen Fertiger und Fabrik die Produktion. Höchstens 10 Klicks pro Sekunde zählen.
- **Einheiten** (Tasten 1 und 2) werden bezahlt und in eine Warteschlange gestellt.
- **Drei Bauplätze**, fünf Gebäudetypen: Fabrik, Schmiede, Kaserne, Universität, Handelskontor (nur per Draft). Abriss erstattet die Hälfte des Baupreises; gekaufte Upgrades ruhen und wirken nach einem Neubau wieder.
- **Altmetall** aus Abschüssen zählt als Erfahrung. Jede Stufe öffnet einen **Draft** mit 2 Optionen, mit Universität 3.
- **Phasen:** Früh (Stufe 0–1), Mitte (2–4), Spät (ab 5). Im Spätspiel zählen Entscheidungen, nicht Klicks.
- Jedes Bedienelement hat einen **Tooltip** (1 s Hover, auf Touch-Geräten langes Drücken).

## Entwicklung
```
npm test                                   # Logik- und Sprachtests (ohne Abhängigkeiten)
npm run test:browser                       # optional, braucht Playwright
node tools/simulate.mjs --runs 20          # Balancing-Simulation, alle Berichte
```
Projektregeln und Zielwerte stehen in `CLAUDE.md`. Anforderungen und Umsetzungsbericht der Iteration 2 liegen in `docs/`.

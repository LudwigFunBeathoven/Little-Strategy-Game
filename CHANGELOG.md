# Änderungen

## v0.3 – Iteration 2 (28.09.2026)
- REQ-04 Sprachwahl Deutsch/Englisch auf dem Startbildschirm; alle Texte in `i18n/`.
- REQ-05 Tooltips für alle Bedienelemente, einheitlicher Stil für klickbare Flächen.
- REQ-01 Bauplätze als Wahl: 5 Gebäudetypen (neu: Kaserne, Handelskontor), Abriss mit 50 % Erstattung, ruhende Upgrades.
- REQ-02 Altmetall-Stufen mit Draft (ersetzt das Zeitalter-Konzept); 12 Draft-Optionen.
- REQ-03 Spielphasen: Klickwert gedeckelt, Automatik skaliert; höchstens 10 Klicks/s.
- Altmetall wird nicht mehr ausgegeben; Mauer, Turm und Reparatur kosten Material.
- Neue Mechaniken gegen Patts: Tor-Belagerung des eigenen Aufstellpunkts, Eskalation ab Minute 16.
- Code aufgeteilt in `config.js`, `core.js`, `ui.js`, `data/`, `i18n/`; Tests mit dem Node-Test-Runner.

## v0.2 (27.09.2026)
- Drei Bauplätze (Fabrik, Schmiede, Universität), Mauer- und Turm-Upgrades, drei Schwierigkeitsgrade, Einheiten-Warteschlange.

## v0.1 (27.09.2026)
- Erster spielbarer Prototyp: Klick-Ökonomie, Lane mit Läufer und Werfer, Gegnerwellen, Speichern, Offline-Fortschritt.

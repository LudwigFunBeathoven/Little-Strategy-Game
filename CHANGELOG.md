# Änderungen

## v0.5 – Iteration 4 (29.09.2026)
- REQ-41 Wellenbefehl „Halten“ entfernt, samt Rabatt, Texten und Simulationsreihe.
- REQ-42 Formationen: gemeinsames Tempo, Reihen zu höchstens fünf Nahkämpfern, Fernkämpfer dahinter, Verschmelzen; gilt auch für Gegner.
  Anti-Patt-Regeln „Belagerung je Einheit“ und „Nachskalieren im Feld“ entfernt, Reparatur-Abklingzeit behalten.
- REQ-43 Lane-übergreifender Kampf: Unterstützung der Nachbar-Lane, Vorrang der Mitte, Rückkehr bei Gegnern in der eigenen Lane.
- REQ-44 Automatische Presse (Phase Mitte/Spät), erste Fabrik kostenlos, Versorgungslimit bis 15, Automatisierungskarten.
- REQ-45 41 Spezialkarten in fünf Kategorien mit Seltenheit (legendär: einmalig, mit Nachteil) und Synergien; eigener Takt für eigene Wellen.
- REQ-46 Neues Layout: Spielwelt links mit Reich in Draufsicht, Seitenleiste rechts mit Kontextfeld; Scrollen per Mausrad, Ziehen, Tasten und Leiste,
  Sprungknöpfe und „Front folgen“.
- REQ-47 Gestaffelte Einführung mit Hinweis je System, Option „Einführung überspringen“.
- REQ-48 Bot-Vorausschau über die Belagerungswelle, neue Kennzahlen (Karten gewählt/nicht gewählt je Stufe, Wahlraten je Kategorie und Seltenheit,
  legendäre Karten, größte Armee, erster Mauerfall, Bildzeit), Kalibrierung, Bericht in `docs/bericht-iteration-4.md`.
- Behoben: Gespeicherte Partien wurden seit v0.4 nicht geladen (Versionsprüfung).
- Spielstand-Version 5; ältere Spielstände starten neu.

## v0.4 – Iteration 3 (28.09.2026)
- REQ-11–13 Drei Lanes mit fester Formation; Basis aus Mauer oben, Tor und Mauer unten mit zwei Türmen.
- REQ-14/15 Wellen alle 20 s mit Versorgungslimit, Gegnervorschau je Lane, Wellenbefehl „Halten“.
- REQ-16/17 3×3-Raster mit Fabriken statt Fertigern; Kaserne hebt das Versorgungslimit, Schmiede mit Qualitätsstufen, Einheiten +5 % je Stufe.
- REQ-18 Spezialkarten mit Stufen I–III; neu: Maurerkolonne, Aushebung, Weitschuss, Turmkanoniere.
- REQ-19 Belagerungswelle in Minute 16 statt Eskalation.
- REQ-20 Erklärzeile an jedem Knopf, Erstkontakt-Hinweise.
- REQ-21 Neue Bots und Kennzahlen, Balancing über die Konfiguration, Bericht in `docs/bericht-iteration-3.md`.
- Entfallen: Fertiger, Eskalation, „Tor belagert“, Rekrutierung, Exerzierplatz, Große Stube, Akkordlohn.
- Neu gegen Patts: Reparatur je Abschnitt höchstens alle 5 s; Gegner im Feld wachsen mit jeder Welle mit.

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

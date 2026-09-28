# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Fabrik, Schmiede und Universität bauen, Einheiten an die Front schicken, die gegnerische Basis zerstören.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig.

## Steuerung
- **Fertigen** klicken für Material. Fertiger produzieren automatisch.
- **Tasten 1 und 2** stellen Läufer und Werfer in die Warteschlange (max. 5).
- Drei **Bauplätze** in der eigenen Basis: Fabrik, Schmiede, Universität. Die Reihenfolge ist die Strategie.
- **Mauer & Turm** werden mit Altmetall ausgebaut. Altmetall gibt es für Abschüsse.

## Balancing prüfen
```
node tools/simulate.mjs 10
```
Lässt vier Bot-Spielertypen je 10 Partien pro Schwierigkeitsgrad spielen.

Letzte Messung (v0.2, 10 Partien je Feld, Median):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | Sieg 5:09 | Sieg 6:27 | Sieg 14:18 | Niederlage 2:21 |
| Normal | Sieg 6:55 | Sieg 9:10 | Niederlage 9:11 | Niederlage 2:17 |
| Schwer | Sieg 8:47 | Sieg 16:24 | Niederlage 2:14 | Niederlage 2:15 |

Spielertypen: aktiv = 3 Klicks/s, reagiert sofort · durchschnitt = 1,5 Klicks/s, reagiert jede Sekunde · gelegentlich = 0,7 Klicks/s, alle 3 Sekunden · passiv = 0,3 Klicks/s, baut nichts.

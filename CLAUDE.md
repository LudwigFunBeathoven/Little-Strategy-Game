# Klammerfront – Projektkontext für Claude

## Was das ist
Browser-Spiel, Mischung aus *Universal Paperclips* (Clicker/Idle-Ökonomie) und *Age of War* (Side-Scrolling-Lane-Kampf).
Der Spieler klickt und automatisiert Material-Produktion. Mit Material stellt er Einheiten auf, die automatisch
gegen die gegnerische Basis laufen. Abschüsse bringen Altmetall für Mauer, Turm und Forschung.

Aktueller Stand: Prototyp v0.2, nur Zeitalter 1. Zeitalter 2 („Fließband“) wird angezeigt, hat aber noch keine Inhalte.

## Der Nutzer
Nick ist kein Entwickler. Erkläre Änderungen in Klartext, fachliche Begriffe kurz übersetzen.
Kommunikation auf Deutsch, knapp, Ergebnis zuerst. Schwache Ideen offen benennen.

## Aufbau
- `index.html` – das komplette Spiel in einer Datei (HTML, CSS, JavaScript). Keine Abhängigkeiten, kein Build-Schritt.
- Die Spiellogik steht zwischen `// ==CORE-START==` und `// ==CORE-END==`. Dieser Teil darf **nicht** auf
  `document`, `window` oder `localStorage` zugreifen, weil der Simulator ihn außerhalb des Browsers lädt.
- Alle Balancing-Zahlen stehen im Objekt `CFG` (Spielwerte) und `DIFFICULTY` (Gegner je Schwierigkeitsgrad).
  Zahlen dort ändern, nicht in der Logik verstreuen.
- `tools/simulate.mjs` – lässt Bots viele Partien spielen und gibt eine Tabelle mit Siegquoten und Spieldauer aus.

## Balancing
Nach jeder Änderung an Zahlen oder Spielregeln: `node tools/simulate.mjs 10` ausführen und das Ergebnis mit den
Zielwerten vergleichen. Kein Ergebnis darf „offen“ (Patt nach 30 Minuten) sein.

Zielkorridore (Median bis zum Sieg):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 5–7 min | 6–9 min | Sieg, 12–18 min | darf verlieren |
| Normal | 6–9 min | 9–12 min | darf verlieren | verliert |
| Schwer | 8–12 min | 14–20 min | verliert | verliert |

Stand der letzten Messung (10 Partien je Feld) steht in `README.md`.

## Mechaniken, die Patts verhindern (nicht ohne Simulation entfernen)
- Gegner wird linear stärker, ohne Obergrenze. Ein Spieler, dessen Wirtschaft stagniert, verliert irgendwann.
- Belagerung: Stehen eigene Einheiten am gegnerischen Tor, kann der Gegner keine regulären Wellen nachschieben.
- Notaufgebot: Fällt die gegnerische Basis unter 2/3 bzw. 1/3, schickt der Gegner sofort Reserven.
- Gegnerische Einheiten auf dem Feld sind begrenzt (`maxField`).

## Konventionen
- Texte im Spiel auf Deutsch, aus Spielersicht formuliert.
- Farben nur über die CSS-Variablen in `:root` (heller und dunkler Modus).
- Spielstand-Format hat eine Versionsnummer (`v` in `freshState`). Bei inkompatiblen Änderungen erhöhen und `SAVE_KEY` anpassen.
- Kleine Commits mit deutscher Beschreibung, was sich für den Spieler ändert.

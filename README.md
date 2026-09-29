# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Fabriken und Gebäude im 3×3-Raster bauen, Einheiten in Wellen über drei Lanes schicken, bei jedem Stufenaufstieg eine Spezialkarte wählen und die gegnerische Basis zerstören, bevor sie dein Tor bricht.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig. Sprache (Deutsch/English) und Schwierigkeit werden auf dem Startbildschirm gewählt.

## Start
`index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig). Auf dem Startbildschirm Sprache und Schwierigkeit wählen.
„Einführung überspringen“ schaltet alle Systeme von Beginn an frei; ohne diese Option erscheinen sie nacheinander.
Die Partie wird im Browser gespeichert und beim nächsten Öffnen fortgesetzt.

## Spielprinzip (v0.5, Iteration 4)
- **Links dein Reich, rechts der Gegner.** Das Reich ist ein 3×3-Raster aus Bauplätzen, umschlossen von der Mauer: Mauer oben mit Turm,
  Tor in der Mitte, Mauer unten mit Turm. **Fällt das Tor, ist die Partie verloren.** Zerstöre die gegnerische Basis am rechten Rand.
- **Wirtschaft:** „Fertigen“ bringt Material pro Klick; ab Phase Mitte presst eine Automatik mit. Fabriken produzieren laufend (die erste ist kostenlos).
  Ab Stufe 2 kommen Schmiede, Kaserne und Universität hinzu, das Handelskontor über eine Spezialkarte.
- **Armee:** Gekaufte Einheiten rücken alle 20 s als Welle aus, höchstens so viele wie das Versorgungslimit (Kaserne, bis 15).
  Jede Lane-Gruppe marschiert als **Formation**: Nahkämpfer vorn in Reihen zu höchstens fünf, Fernkämpfer dahinter, alle im gleichen Tempo.
  Formationen helfen der Nachbar-Lane, wenn dort gekämpft wird, und kehren zurück, sobald in der eigenen Lane ein Gegner auftaucht.
- **Spezialkarten:** Jede Altmetall-Stufe bietet 2 Karten (mit Universität 3) aus fünf Kategorien, teils selten oder legendär
  (einmalig, mit Nachteil). Synergiekarten wirken stärker, je mehr Karten ihrer Kategorie du hast.
- **Belagerungswelle** in Minute 16, eine Minute vorher angekündigt; danach wird der Gegner jede Minute stärker.
- Jeder Knopf trägt eine Erklärzeile „Wirkung · Kosten“, Details im Tooltip (1 s Hover). Jedes System erklärt sich beim ersten Auftreten mit einem kurzen Hinweis.

## Steuerung
| Aktion | Maus | Tastatur |
|---|---|---|
| Material fertigen | „Fertigen“ | – |
| Läufer / Werfer in die Warteschlange | Knöpfe unter „Einheiten“ | `1` / `2` |
| Bauplatz wählen, bauen, ausbauen, abreißen | Bauplatz in der Spielwelt anklicken, dann im Kontextfeld rechts | – |
| Mauer reparieren, Türme, Mauer-Upgrades | Mauer in der Spielwelt anklicken oder „Zur Basis“ | – |
| Spezialkarte wählen | Karte im Dialog | Tab, Enter |

## Scrollen
Die Spielwelt ist doppelt so breit wie das Bild. Scrollen geht mit dem **Mausrad**, durch **Ziehen** mit gedrückter Maustaste
(ab 5 Pixeln; ein kürzerer Klick wählt aus), mit den **Pfeiltasten** oder **A/D** und mit der **Scrollleiste** unter der Welt.
Die Knöpfe über der Welt springen zum **Reich** oder zur **Front**; **Front folgen** führt die Kamera mit der vordersten eigenen Formation mit.
Ereignisse außerhalb des Bildes zeigt ein Randmarker.

## Entwicklung
```
npm test                                   # Logik-, Sprach- und Hinweistests (ohne Abhängigkeiten)
npm run test:browser                       # optional, braucht Playwright
node tools/simulate.mjs --suite kurz       # Kurzsimulation: 20 Partien Normal
node tools/simulate.mjs --runs 200 --suite ziele   # Serie für das Balancing
KF_SKIP_INTRO=1 node tools/simulate.mjs --suite kurz # Bots ohne gestaffelte Einführung
```
Projektregeln und Zielwerte stehen in `CLAUDE.md`. Anforderungen, Stand und Bericht der Iteration 4 liegen in `docs/`, Rohdaten der Simulation unter `reports/`.

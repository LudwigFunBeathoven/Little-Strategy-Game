# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Fabriken und Gebäude im 3×3-Raster bauen, Einheiten in Wellen über drei Lanes schicken, bei jedem Stufenaufstieg eine Spezialkarte wählen und die gegnerische Basis zerstören, bevor sie dein Tor bricht.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig. Sprache (Deutsch/English) und Schwierigkeit werden auf dem Startbildschirm gewählt.

## Start
`index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig). Auf dem Startbildschirm Sprache und Schwierigkeit wählen.
„Einführung überspringen“ schaltet alle Systeme von Beginn an frei; ohne diese Option erscheinen sie nacheinander.
Die Partie wird im Browser gespeichert und beim nächsten Öffnen fortgesetzt.

## Spielprinzip (v0.6, Iteration 5)
- **Oben die Leiste, in der Mitte die Welt, unten der Arbeitsbereich.** Die Leiste zeigt Soldaten, Material, Erfahrungspunkte (EP) mit
  Fortschritt bis zur nächsten Kartenwahl, die nächsten Wellen, die Mauer, den Zustand der Armee, Zeit und Menü (Pause, Sprache, Neue Partie).
- **Links in der Welt dein Reich, rechts der Gegner.** Das Reich ist ein 3×3-Raster aus Bauplätzen, umschlossen von der Mauer: Mauer oben mit Turm,
  Tor in der Mitte, Mauer unten mit Turm. **Fällt das Tor, ist die Partie verloren.** Zerstöre die gegnerische Basis am rechten Rand.
- **Wirtschaft:** „Fertigen“ (unten links) bringt Material je Klick; ab Phase Mitte presst eine Automatik mit. Fabriken produzieren laufend
  (die erste ist kostenlos). Ab Stufe 2 kommen Schmiede, Kaserne und Universität hinzu, das Handelskontor über eine Spezialkarte.
- **Armee:** Gekaufte Einheiten rücken alle 20 s als Welle aus und stoßen zur Armee. Die Armee rückt auf allen drei Lanes gemeinsam vor
  (**Marsch**), hält an, sobald irgendwo Gegner, Mauer oder Basis erreicht sind (**Kampf**), und ordnet sich danach neu (**Sammeln**).
  Einheiten ohne Gegner in ihrer Lane helfen dort, wo gekämpft wird. Jede Einheit kämpft einzeln: Nahkämpfer bei Kontakt, Fernkämpfer über die eigenen Reihen.
- **Spezialkarten:** Jede Stufe bietet 2 Karten (mit Universität 3) aus fünf Kategorien, teils selten oder legendär (einmalig, mit Nachteil).
  Eine offene Wahl hält das Spiel an und erscheint als Hinweis in der Leiste; gewählt wird im Reiter „Karten“.
- **Universität:** Forschungsbaum mit vier Zweigen (Lehre, Archiv, Forschung, Freischaltungen): Material und Zeit gegen dauerhafte Vorteile,
  darunter passive EP, Neu ziehen und Bann für Karten, Versorgung, Wellentakt und die Einheit Schildträger.
- **Belagerungswelle** in Minute 16, eine Minute vorher angekündigt; danach wird der Gegner jede Minute stärker.
- Jeder Knopf trägt eine Erklärzeile „Wirkung · Kosten“, Details im Tooltip (1 s Hover). Jedes System erklärt sich beim ersten Auftreten mit einem kurzen Hinweis.

## Steuerung
| Aktion | Maus | Tastatur |
|---|---|---|
| Material fertigen | „Fertigen“ (löst beim Drücken aus) | Tab bis „Fertigen“, Enter oder Leertaste |
| Läufer / Werfer / Schildträger in die Warteschlange | Reiter „Armee“ | `1` / `2` / `3` |
| Bauplatz wählen und bauen (zwei Klicks) | Bauplatz in der Welt oder im Raster des Reiters „Bauen“, dann eine Option | Raster: Pfeiltasten, Enter wählt, Enter baut |
| Gebäude ausbauen, abreißen | Gebäude anklicken, Kontextkopf oben im Reiter | – |
| Mauer reparieren, Türme, Mauer-Upgrades | Mauer in der Welt anklicken oder Reiter „Mauer & Türme“ | – |
| Reiter wechseln | Reiterleiste | Tab in die Leiste, dann Pfeiltasten |
| Auswahl aufheben | Klick auf eine leere Stelle der Welt | `Esc` |
| Spezialkarte wählen | Hinweis in der Leiste, dann Reiter „Karten“ | Tab, Enter |
| Pause | „Pause“ in der Leiste | – |

## Scrollen
Die Spielwelt ist doppelt so breit wie das Bild. Scrollen geht mit dem **Mausrad**, durch **Ziehen** mit gedrückter Maustaste
(ab 6 Pixeln; ein kürzerer Klick wählt aus), mit den **Pfeiltasten** oder **A/D** und mit der **Scrollleiste** unter der Welt.
Die Knöpfe unter der Welt springen zum **Reich** oder zur **Front**; **Front folgen** führt die Kamera mit der Armee mit.
Ereignisse außerhalb des Bildes zeigt ein Randmarker.

## Spieltest
`index.html?debug=1` zeichnet ein Sitzungsprotokoll auf; der Knopf „Protokoll“ in der Leiste lädt es als JSON herunter.
`node tools/compare-human.mjs protokoll.json` ordnet die Partie dem nächstliegenden Bot-Profil zu. Ablauf und Fragen: `docs/testleitfaden-iteration-5.md`.

## Entwicklung
```
npm test                                   # Logik-, Sprach- und Hinweistests (ohne Abhängigkeiten)
npm run test:browser                       # optional, braucht Playwright
node tools/simulate.mjs --suite kurz       # Kurzsimulation: 20 Partien Normal
node tools/simulate.mjs --runs 200 --suite ziele   # Serie für das Balancing
node tools/bench-tick.mjs                  # Tick-Zeit mit 2 × 60 Einheiten
KF_SKIP_INTRO=1 node tools/simulate.mjs --suite kurz # Bots ohne gestaffelte Einführung
```
Projektregeln und Zielwerte stehen in `CLAUDE.md`. Anforderungen, Stand und Bericht der Iteration 5 liegen in `docs/`, Rohdaten der Simulation unter `reports/`.

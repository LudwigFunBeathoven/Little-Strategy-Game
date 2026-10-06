# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Fabriken und Gebäude im 3×3-Raster bauen, Einheiten in Wellen über drei Lanes schicken, bei jedem Stufenaufstieg eine Spezialkarte wählen und die gegnerische Basis zerstören, bevor sie dein Tor bricht.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig. Sprache (Deutsch/English) und Schwierigkeit werden auf dem Startbildschirm gewählt.

## Start
`index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig). Vor jeder Partie erscheint der **Startbildschirm** mit Sprache, Schwierigkeitsgrad und dem Schalter „Tutorial“ (in der ersten Partie eines Browsers an, Leicht ist als
Einstieg empfohlen). Im Tutorial begrüßt der Quartiermeister den Feldherrn und führt durch Fertigen, Fabrik, Armee, Welle und die erste Kartenwahl (unter drei Minuten,
jederzeit mit „Überspringen“ beendbar; auf jedem Schwierigkeitsgrad). Für Tests überspringen `?lang=de|en` und `?difficulty=easy|normal|hard` den Startbildschirm;
`?tutorial=1` bzw. `?tutorial=0` schaltet das Tutorial an oder aus.
„Einführung überspringen“ schaltet alle Systeme von Beginn an frei; ohne diese Option erscheinen sie nacheinander.
Die Partie wird im Browser gespeichert und beim nächsten Öffnen pausiert fortgesetzt („Weiter“ in der Spielwelt). Klammerfront ist ein reines
Online-Spiel: Solange das Spiel nicht offen ist oder der Tab verdeckt ist, steht die Zeit; eine Partie dauert höchstens etwa 20 Minuten.

## Spielprinzip (v0.8)
- **Oben die Leiste, in der Mitte die Welt, unten der Arbeitsbereich.** Die Leiste zeigt Soldaten, Material, Erfahrungspunkte (EP) mit
  Fortschritt bis zur nächsten Kartenwahl, die nächsten Wellen, die Mauer, den Zustand der Armee, Zeit und Menü (Pause, Sprache, Neue Partie).
- **Links in der Welt dein Reich, rechts der Gegner.** Das Reich ist ein 3×3-Raster aus Bauplätzen, umschlossen von der Mauer: Mauer oben mit Turm,
  Tor in der Mitte, Mauer unten mit Turm. **Fällt das Tor, ist die Partie verloren.** Zerstöre die gegnerische Basis am rechten Rand.
- **Wirtschaft:** „Fertigen“ (unten links) bringt Material je Klick; ab Phase Mitte presst eine Automatik mit. Fabriken produzieren laufend
  (die erste ist kostenlos). Ab Stufe 2 kommen Schmiede, Kaserne, Universität und Handelskontor hinzu. Das Kontor zahlt gedeckelte Zinsen
  auf den Materialbestand. **Nachbarschaft:** Jedes Gebäude hat eine Regel für angrenzende Plätze (z. B. Fabrik neben Fabrik mehr Ertrag);
  die Bau-Optionen zeigen, was ein Gebäude an einem Platz erhielte und gäbe.
- **Armee:** Gekaufte Einheiten rücken alle 20 s als Welle aus und stoßen zur Armee. Die Armee rückt auf allen drei Lanes gemeinsam vor
  (**Marsch**), hält an, sobald irgendwo Gegner, Mauer oder Basis erreicht sind (**Kampf**), und ordnet sich danach neu (**Sammeln**).
  Einheiten ohne Gegner in ihrer Lane helfen dort, wo gekämpft wird, und bleiben, bis die Lane frei ist. Jede Einheit kämpft einzeln und in
  eigenem Takt: Nahkämpfer bei Kontakt, Fernkämpfer über die eigenen Reihen, jedes Geschoss einzeln. Mit Kaserne lässt sich die nächste Welle
  gegen Material sofort losschicken („Welle vorziehen“).
- **Spezialkarten:** Jede Stufe bietet 2 Karten (mit Universität 3) aus fünf Kategorien, teils selten oder legendär (einmalig, mit Nachteil).
  Eine offene Wahl hält das Spiel an und öffnet den Reiter „Karten“; danach geht es im vorigen Reiter weiter.
- **Universität:** Forschungsbaum mit vier Zweigen (Lehre, Archiv, Forschung, Freischaltungen): Material und Zeit gegen dauerhafte Vorteile,
  darunter passive EP, Neu ziehen und Bann für Karten, Versorgung, Wellentakt und die Einheit Schildträger. Laufende Forschung lässt sich
  gegen Material sofort abschließen.
- **Belagerungswelle** in Minute 16, eine Minute vorher angekündigt; danach wird der Gegner jede Minute stärker.
- Jeder Knopf trägt eine Erklärzeile „Wirkung · Kosten“, Details im Tooltip (1 s Hover). Jedes System erklärt sich beim ersten Auftreten mit einem kurzen Hinweis (eine Zeile, schließt sich nach 8 s); Neues trägt die Marke „neu“.

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
| Spezialkarte wählen | Reiter „Karten“ öffnet sich selbst | Tab, Enter |
| Welle vorziehen | Reiter „Armee“, Abschnitt Kaserne | – |
| Pause | „Pause“ in der Leiste (auch automatisch bei verdecktem Tab) | – |

## Scrollen
Die Spielwelt ist doppelt so breit wie das Bild. Scrollen geht mit dem **Mausrad**, durch **Ziehen** mit gedrückter Maustaste
(ab 6 Pixeln; ein kürzerer Klick wählt aus), mit den **Pfeiltasten** oder **A/D** und mit der **Scrollleiste** unter der Welt.
Die Knöpfe unter der Welt springen zum **Reich** oder zur **Front**; **Front folgen** führt die Kamera mit der Armee mit.
Ereignisse außerhalb des Bildes zeigt ein Randmarker.

## Spieltest
`index.html?debug=1` zeichnet ein Sitzungsprotokoll auf; der Knopf „Protokoll“ in der Leiste lädt es als JSON herunter.
`node tools/compare-human.mjs protokoll.json` ordnet die Partie dem nächstliegenden Bot-Profil und einer Strategie zu. Ablauf und Fragen:
`docs/testleitfaden-iteration-6.md`; für das Tutorial mit Spielern, die das Spiel nicht kennen, `docs/testleitfaden-tutorial.md`. Im Debug-Modus liefert `__kf.unitLog(id)` in der Konsole das Protokoll einer Einheit.

## Entwicklung
```
npm test                                   # Logik-, Sprach- und Hinweistests (ohne Abhängigkeiten)
npm run test:browser                       # optional, braucht Playwright
node tools/simulate.mjs --suite kurz       # Kurzsimulation: je 20 Partien Normal mit beiden Strategien
node tools/simulate.mjs --runs 200 --suite ziele   # Serie für das Balancing
node tools/bench-tick.mjs                  # Tick-Zeit mit 2 × 60 Einheiten
node tools/simulate.mjs --runs 50 --suite forschung   # Forschungstempo und Paarvergleich
node tools/simulate.mjs --runs 50 --suite nachbarn    # Nachbarschaftsregeln einzeln
node tools/simulate.mjs --runs 50 --suite wirtschaft  # Handelskontor und „Welle vorziehen“
KF_SKIP_INTRO=1 node tools/simulate.mjs --suite kurz # Bots ohne gestaffelte Einführung
```
Projektregeln und Zielwerte stehen in `CLAUDE.md`. Anforderungen, Stand und Bericht des Tutorials (v0.8) und der Iteration 6 liegen in `docs/`, Rohdaten der Simulation unter `reports/`.

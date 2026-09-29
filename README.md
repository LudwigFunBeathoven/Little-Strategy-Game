# Klammerfront

Ein Browser-Spiel zwischen *Universal Paperclips* und *Age of War*: Material fertigen, Fabriken und Gebäude im 3×3-Raster bauen, Einheiten in Wellen über drei Lanes schicken, bei jedem Stufenaufstieg eine Spezialkarte wählen und die gegnerische Basis zerstören, bevor sie dein Tor bricht.

**Spielen:** `index.html` im Browser öffnen. Keine Installation nötig. Sprache (Deutsch/English) und Schwierigkeit werden auf dem Startbildschirm gewählt.

## Spielprinzip (v0.4, Iteration 3)
- **Drei Lanes:** oben, Mitte, unten. Einheiten bleiben in ihrer Lane. Nahkämpfer stehen vorn, Fernkämpfer greifen mit höchstens einer Einheit vor sich an.
- **Deine Basis** hat drei Abschnitte: Mauer oben, Tor, Mauer unten. Auf den Mauern stehen die Türme. Fällt eine Mauer, schweigt ihr Turm und die Gegner ziehen zum Tor. **Fällt das Tor, ist die Partie verloren.**
- **Wellen:** Gekaufte Einheiten warten in der Warteschlange und rücken alle 20 s gemeinsam aus, höchstens so viele wie das Versorgungslimit (Start 3). Die Welle verteilt sich selbst auf die Lanes. Rechts am Schlachtfeld siehst du die nächste Gegnerwelle je Lane.
- **Wirtschaft:** Klicken („Fertigen“) trägt den Anfang, danach Fabriken. Neun Bauplätze; Fabriken mehrfach baubar, Schmiede, Kaserne, Universität und Handelskontor je einmal. Die Kaserne hebt das Versorgungslimit, die Schmiede verstärkt in Qualitätsstufen.
- **Spezialkarten:** Jede Altmetall-Stufe bietet 2 Karten zur Wahl (mit Universität 3). Karten haben bis zu drei Stufen I–III.
- **Belagerungswelle:** In Minute 16 greift eine angekündigte Welle mit dreifacher Stärke an; danach wird der Gegner jede Minute stärker.
- Jeder Knopf trägt eine Erklärzeile „Wirkung · Kosten“, Details im Tooltip (1 s Hover). Beim ersten Kontakt mit Wellen, Karten, Abriss und Belagerung erscheint ein kurzer Hinweis.

## Entwicklung
```
npm test                                   # Logik-, Sprach- und Hinweistests (ohne Abhängigkeiten)
npm run test:browser                       # optional, braucht Playwright
node tools/simulate.mjs --suite kurz       # Kurzsimulation: 20 Partien Normal
node tools/simulate.mjs --runs 200 --suite ziele   # Serie für das Balancing
```
Projektregeln und Zielwerte stehen in `CLAUDE.md`. Anforderungen, Stand und Bericht der Iteration 3 liegen in `docs/`.

# Klammerfront – Testleitfaden MVP (v0.8.1)

Zweck: Prüfen, ob Menschen, die das Spiel nicht kennen, ohne Hilfe in die Partie finden und dabei Spaß haben. Dieser Leitfaden ersetzt keinen der früheren, sondern fasst den Stand
für den öffentlichen MVP zusammen; Einzelheiten zum Tutorial stehen in `docs/testleitfaden-tutorial.md`, zu späteren Spielphasen in `docs/testleitfaden-iteration-6.md`.

## Vorbereitung (Testleitung, 5 Minuten)
1. Den öffentlichen Link öffnen und `?debug=1` anhängen (Protokollknopf „Protokoll“ oben rechts). **Keine** Parameter `?lang=`, `?difficulty=` oder `?tutorial=`: Dann erscheint der Startbildschirm,
   und das Tutorial ist in der ersten Partie voreingestellt.
2. Privates Fenster oder frisches Profil (sonst gilt es als zweite Partie). Fenster mindestens 1280×720. Den Tab nicht wechseln.
3. Nur Personen einladen, die das Spiel nicht kennen; Erfahrung mit Strategie- und Idle-Spielen notieren.
4. **Nicht helfen, nicht erklären.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 30 Minuten)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | „Ein Strategiespiel im Browser. Spiel bitte wie zu Hause und sag laut, was du denkst.“ |
| 2 | 3–5 min | Startbildschirm selbst bedienen, dann das Tutorial (Statthalter, Quartiermeister). Beobachten: Liest die Person die Sprechblasen? Wo zögert sie? |
| 3 | bis 20 min | Weiterspielen ohne Hilfe bis Sieg, Niederlage oder 20 min. Beobachten: Karten, Mauer, Türme, Schmiede, Universität, Kontor – was entdeckt die Person von allein? Danach „Protokoll“ speichern. |
| 4 | 8 min | Fragen unten. |

## Fragen
1. Was war dein erster Eindruck von Figur und Sprache („Statthalter“, „Wellen“)? Passend, zu sachlich, zu hart?
2. Wo hast du gezögert oder daneben geklickt?
3. **Welche Karte hast du gewählt und warum?** (je Wahl)
4. **Wann hast du auf eine Karte gewartet oder gedacht, es passiert nichts?**
5. Was hast du gesucht und nicht gefunden? Welche Hinweise und Marken „neu“ hast du bemerkt?
6. Hast du das Spiel als zu leicht, zu schwer oder zu lang erlebt? Wann wurde es spannend, wann zäh?
7. Würdest du es weiterempfehlen oder noch einmal spielen? Was müsste sich dafür ändern?

## Protokoll (Format 2) und Auswertung
`node tools/compare-human.mjs protokolle/*.json --json reports/spieltest.json` zeigt je Partie das nächstliegende Bot-Profil, die Tutorial-Schritte und die Kartenwahlen
(Zahl, Bedenkzeit, Neu ziehen, Bannen, gewählte Karten). Lesehilfe: Bedenkzeiten unter 3 s deuten darauf, dass Karten nicht gelesen werden; über 30 s auf Überforderung.
Die Beobachtung zählt mehr als die Zahl.

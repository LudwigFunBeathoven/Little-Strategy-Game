# Klammerfront – Testleitfaden Tutorial (v0.8, mit Teil 2: Erzählung, Kartenabschluss, Startauswahl)

Zweck: Prüfen, ob das Tutorial „Erste Schritte“ Menschen, die das Spiel nicht kennen, ohne Hilfe von außen in die Partie bringt (REQ-T.01 – T.07).
Die Anforderung nennt die schwache Annahme selbst: Ein Tutorial von zwei Minuten funktioniert nur, wenn sich der Rest über Tooltips, Erklärzeilen,
Hinweise und die Marke „neu“ selbst erklärt. Dieser Test prüft genau das. Für spätere Spielphasen und Bot-Vergleich gilt zusätzlich
`docs/testleitfaden-iteration-6.md`.

## Vorbereitung (Testleitung, 5 Minuten)
1. Den **Testbuild** öffnen (Protokoll ist dort immer an) oder lokal `index.html?debug=1`. **Keine** Parameter `?lang=`, `?difficulty=` oder `?tutorial=` anhängen: Dann
   erscheint der Startbildschirm, und das Tutorial ist in der ersten Partie voreingestellt.
2. **Privates Fenster** oder frisches Browser-Profil, sonst gilt es als zweite Partie und das Tutorial fehlt. Nach jeder Person ein neues Fenster.
3. Fenster mindestens 1280×720. Den Tab nicht wechseln (ein verdeckter Tab pausiert das Spiel).
4. Nur Personen einladen, die das Spiel **nicht kennen**. Mit Strategie-/Idle-Erfahrung und ohne beides mischen, Erfahrung notieren.
5. Protokollvorlage (unten) bereitlegen. **Nicht helfen, nicht erklären, nichts vorsagen.** Nur beobachten und notieren. Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 25 Minuten)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung: „Ein Strategiespiel im Browser. Bitte spiel so, wie du es zu Hause tun würdest. Sag laut, was du denkst.“ Keine Spielerklärung, kein Wort zum Tutorial. |
| 2 | 3–5 min | **Startbildschirm** selbst bedienen lassen (Sprache, Stufe, Tutorial; nicht erklären). Dann das **Tutorial**: Begrüßung, vier erzählte Schritte, Kampf, erste Kartenwahl, Abschied. Beobachten: Liest die Person die Begrüßung oder klickt sie weg? Wo zögert sie? Klickt sie neben das Ziel? Beachtet sie Figur, Rahmen und Zeile? Uhrzeit notieren, wenn sie ratlos wirkt. |
| 3 | bis 15 min | **Weiterspielen ohne jede Hilfe von außen**, bis Sieg, Niederlage oder 15 min. Beobachten, was die Person von allein entdeckt: Mauer, Türme, Schmiede, Universität, Handelskontor, Karten. Nach Ende Knopf **„Protokoll“** oben rechts, Datei speichern. |
| 4 | 5 min | Fragen 1–8 (unten). |
| 5 | 3 min | Optional: **zweite Partie** über „Neue Partie“, dann sollte **kein** Tutorial erscheinen (Prüfung des Merkers). Dort „Tutorial wiederholen“ zeigen und fragen, ob die Person es nutzen würde. |

## Beobachtungsfragen
1. Was war der erste Gedanke, als die Figur erschien? Wer oder was ist das? Hat dir die Geschichte (Horden, letztes Tor) etwas gesagt?
   Hast du den Startbildschirm verstanden, und warum hast du diese Stufe gewählt?
2. Hast du den pulsierenden Rahmen bemerkt? Hat er geholfen, oder hat er gestört?
3. Wo hast du gezögert oder neben das Ziel geklickt? Warum?
4. Hat dich die Pause vor der Zeile (die Figur zeigt es zuerst) verwirrt oder geholfen?
5. Hast du überlegt, das Tutorial zu überspringen? Wann, warum?
6. Die erste Kartenwahl beendete das Tutorial: War klar, was eine Karte ist? Was hast du direkt nach dem Abschied gemacht? Wusstest du, was als Nächstes zu tun ist?
7. Welche Hinweise (Zeile oben) und welche Marken „neu“ hast du bemerkt, welche nicht? Was hast du daraus gelernt?
8. Was hast du gesucht und nicht gefunden? Was fehlt im Tutorial, was ist zu viel?

## Protokollvorlage (je Person)
| Feld | Eintrag |
|---|---|
| Person (Kürzel), Datum, Erfahrung (keine / etwas / viel) | |
| Gewählte Sprache und Stufe; Tutorial-Schalter an gelassen oder ausgeschaltet | |
| Tutorial: abgeschlossen oder übersprungen (in welchem Schritt) | |
| Begrüßung: gelesen, weggeklickt oder übersprungen (Dauer und Klicks auf Sprechblasen stehen im Protokoll) | |
| Dauer je Schritt (aus dem Protokoll) und Gesamtdauer | |
| Ratlose Momente (Uhrzeit, Schritt, was war los) | |
| Fehlklicks (Zahl aus dem Protokoll; Beobachtung: wohin?) | |
| Erste Handlung nach dem Tutorial | |
| Von allein entdeckt (Mauer, Türme, Schmiede, Universität, Kontor, Karten, Welle vorziehen) | |
| Hinweise und Marken „neu“ bemerkt (ja / nein, welche) | |
| Partie: Ergebnis, Dauer, Protokolldatei | |
| Antworten auf Fragen 1–8 | |
| Auffälligkeiten, Zitate | |

## Auswertung
```
node tools/compare-human.mjs protokolle/*.json --json reports/spieltest-tutorial.json
```
Je Partie nennt das Werkzeug die Zeit je Schritt, die Dauer der Begrüßung, Klicks auf Sprechblasen, Fehlklicks (Klicks außerhalb des hervorgehobenen Ziels), Überspringen mit Schritt und den
längsten Schritt; bei mehreren Protokollen folgt eine Zusammenfassung je Schritt (Median der Dauer, Summe der Fehlklicks, dort übersprungen).

**Lesehilfe (Vorschläge, keine Vorgaben):**
- Abschluss mit der ersten Kartenwahl in unter 3:00 min Spielzeit (Zieldauer von Teil 2). Der Probelauf mit direkter Bedienung braucht rund 40 s;
  Menschen brauchen deutlich länger, 1,5–2,5 min wären gut.
- Ein Schritt mit auffällig langer Dauer oder mit vielen Fehlklicks ist die Stelle, an der der Faden reißt (zum Vergleich: Median der anderen Schritte).
- Wird oft im selben Schritt übersprungen, dort die Zeile, das Ziel oder die Vorführung prüfen.
- Findet die Person nach dem Tutorial nicht weiter oder entdeckt Schmiede, Universität oder Kontor nicht, reichen die Hinweise nicht; dann zählt die
  Beobachtung mehr als die Zahl.

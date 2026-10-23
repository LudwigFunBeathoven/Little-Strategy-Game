# Klammerfront – Testleitfaden Kartenpfad Teil 7 bis 12 (Branch `exp/kartenpfad`)

Zweck: Spieltest mit Menschen nach Teil 10 bis 12. Teil 7 bis 9 wie in `docs/testleitfaden-kartenpfad-7.md` und `-9.md`; neu in Teil 12 sind die Kosten der Kartenwahlen, das Forschungsbudget als Investition und der Preis der nächsten Karte; aus Teil 10 und 11: Einheitentexte und Reichweiten, haltende Fernkämpfer und die Nachbarschaftsboni der Flügel.

## Vorbereitung (Testleitung, 5 Minuten)
1. Testbuild öffnen (privat, Protokoll immer an). Neu seit dem letzten Leitfaden:
   - **Forschungsbudget als Investition (Teil 12):** Die erste Karte kostet 125 EP, jede weitere 30 % mehr; der Mindestabstand bleibt 40 s. Der Regler der Universität hat sechs Stufen (0 bis 50 % in 10-%-Schritten). Der Kurs ist 0,7 EP je Material, bei hohen Anteilen etwas schlechter. Ohne Budget sind 10 Wahlen in 14 Minuten zu erwarten, mit 30 bis 40 % 11 bis 12 in 13 Minuten.
   - **Preis der nächsten Karte (Teil 12):** Der Reiter Universität und der Tooltip des Stapels nennen „Nächste Karte ≈ N Material“ und „+10 %: nächste Karte ≈ N s früher“.
   - **Einheitentexte:** Jeder Einheitentooltip beschreibt die Einheit (was sie ist, Stärke und Schwäche). Die Ausrückregel steht im Tooltip des Reiters Armee.
   - **Reichweiten:** Werfer 105, Bogenschütze 137, Armbrustschütze 168, Katapult 189, Geschütz 210. Gegner reichen höchstens 140.
   - **Fernkämpfer halten:** Sobald ein Ziel in Reichweite ist, bleiben Fernkämpfer (eigene und gegnerische) stehen und feuern von dort; die Nahkämpfer laufen weiter.
   - **Tutorial erklärt das Haupthaus** (nur im Modus karten, bei aktivem Tutorial, `?tutorial=1`): nach der ersten Manufaktur zwei Sprechblasen, der Rahmen liegt auf dem Haupthaus.
   - **Flügel mit Nachbarschaftsbonus:** Schatzkammer (+10 % Ertrag je angrenzender Manufaktur), Bibliothek (−5 % Forschungszeit je angrenzender Manufaktur), Zeughaus (+10 % Lebenspunkte neuer Einheiten je angrenzender Kaserne), Kanzlei (−15 % Kosten und Dauer der Aufwertung angrenzender Gebäude); je Flügel höchstens zwei Gebäude. Das Haupthaus hervorheben (überfahren oder auswählen) zeigt die begünstigten Plätze.
2. Schalter: `?druck=hoch`, `?pacing=standard`, `?gegnerfern=aus`, **neu** `?fluegel=<schatzkammer|bibliothek|zeughaus|kanzlei>` (legt den ersten Flügel fest). Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen.
3. Privates Fenster, mindestens 1280×720; eine Person zusätzlich auf einem Telefon (375 px Breite).
4. Nicht helfen, nicht erklären. Laut denken erlauben.

## Ablauf (je Person etwa 45 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 13–17 min | Partie 1 (Normal). Danach Protokoll speichern. |
| 3 | 13–17 min | Partie 2 (Normal) mit `?druck=hoch` oder mit festem Flügel (`?fluegel=` wechseln je Person). Protokoll speichern. |
| 4 | 10 min | Fragen. |
| 5 | 5 min | Auswertung: `node tools/ep-protokoll.mjs <protokoll.json>`. |

## Fragen
**Kartenwahl-Rhythmus**
1. Kam die nächste Wahl zu schnell, zu langsam oder passend? Standen jemals mehrere Wahlen gleichzeitig an? (Ziel: nie mehr als eine offene Wahl.)
2. Hatte der Takt etwas mit deinem Spiel zu tun (mehr Abschüsse, schnellere Wahl) oder lief er wie ein Uhrwerk?

**Investition in EP (Teil 12)**
13. Hast du das Forschungsbudget benutzt? Wann (Minute, Stufe) hast du es erhöht oder gesenkt, und warum?
14. Verstehst du „Nächste Karte ≈ N Material“? Konntest du den Preis mit dem der nächsten Manufaktur oder des nächsten Quartiers vergleichen? Hat dich der Vergleich zu einer Entscheidung gebracht?
15. Stimmte „+10 %: nächste Karte ≈ N s früher“ ungefähr mit dem, was du erlebt hast?
16. Fühlte sich die Partie nach Stufe 10 zäh an? Hast du auf die nächste Karte gewartet, obwohl du Budget hattest, oder auf den Mindestabstand?
17. Kam die erste Karte zu spät (sie kommt nach etwa zwei Minuten statt nach einer)?

**Einheitentexte und Reichweiten**
3. Kannst du nach dem Lesen sagen, wofür Läufer, Werfer, Schildträger, Reiter, Armbrustschütze, Katapult und Geschütz gut sind? Welcher Text war unklar?
4. Empfindest du die Reichweiten als passend? Wo stehen die Türme im Verhältnis zu den Fernkämpfern des Gegners?

**Verhalten der Fernkämpfer**
5. Siehst du die Fernkämpfer aus der Entfernung kämpfen? Wirkt es richtig, dass sie hinter den Nahkämpfern zurückbleiben? Was fiel dir an den gegnerischen Fernkämpfern auf (Mauerschaden)?
6. Wurde die Armee-Anzeige „Marsch“ je missverständlich, während Fernkämpfer schon feuerten?

**Flügel und Platzierung**
7. Hast du gesehen, welche Plätze ein Flügel stärkt, ohne dass es erklärt wurde? Wo?
8. Hast du eine Manufaktur oder Kaserne gezielt neben das Haupthaus gebaut? Wolltest du es, hast du es gemerkt, war es sinnvoll?
9. Welchen Flügel hast du gewählt und warum? Welcher war nie interessant?

**Tutorial**
12. Hast du verstanden, wozu das Haupthaus in der Mitte da ist? War die Erklärung zu früh, zu lang oder passend? (Nur Personen mit Tutorial.)

**Lesbarkeit**
10. [Telefon, 375 px] Ist die Karte lesbar? Wird etwas abgeschnitten? (Bildschirmfoto.)
11. Gab es einen offenen Platzhalter (`{…}`) oder eine leere Zeile auf einer Karte oder in einem Tooltip?

**Aus Teil 7 bis 9** (Fragen in `docs/testleitfaden-kartenpfad-7.md` und `-9.md` unverändert.)

## Auswertung
Protokolle ablegen unter `reports/spieltest-*`. Je Person: Zahl der Wahlen, größter Rückstau (`rueckMax` im Protokoll, falls vorhanden), Partiedauer, Ergebnis, Flügel, Antworten, **Budget im Verlauf** (Stufe des Reglers je Minute; im Protokoll `budgetJeMinute`) und Abstand zwischen den Wahlen ab Stufe 10.

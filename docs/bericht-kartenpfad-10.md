# Bericht Kartenpfad Teil 10: Nacharbeiten zu Teil 8 und 9

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-10 (Spielstand-Version 14). Anforderungen: `docs/anforderungen-kartenpfad-10-11.md`. Rohdaten: `reports/kartenpfad10-*`. Messung: `tools/messung-v10.mjs`, Vergleich `tools/vergleich-v10.mjs`, Arme `tools/arme-v10.mjs`.

## Ergebnis

1. Die offenen Platzhalter sind behoben, die Einheitentexte stehen, die Reichweiten sind umgestellt, Fernkämpfer halten aus maximaler Reichweite. Alles ist durch Tests gesichert.
2. Das Fernkampfverhalten senkt die Patt-Quote (Bot ohne Kategorie, alle Felder: 2,9 % → 0,0 %), hebt die Siegquote des Verteidigungs-Bots (88 % → 98 %) und erhöht den Mauerverlust (Militär-Bot 48 → 293). Die Abbruchregel greift nicht.
3. **Der Rückstau ist nicht vollständig gelöst.** Kein Arm erfüllt alle Kriterien (auch die Kurve von Teil 9 nicht). Gewählt ist **vorläufig Arm C2** (geringster Rückstau, Siegquoten erhalten): 87 % der Partien mit höchstens einer offenen Wahl, größter Rückstau 3. Verfehlt: 11 statt 12–16 Wahlen (Bot ohne Kategorie) und die Reihenfolge der Profile. Der PO entscheidet.
4. Zwei Befunde zur Sache, die der Auftrag nicht erwartet hat (unten): Stärke und Phase hingen an der Stufe; die gegnerische Reichweite liegt über der unausgebauten Turmreichweite.

## V.0 Diagnose

**Platzhalter (K10.01).** Ursache bestätigt, aber anders als vermutet: Teil 9 hatte den Wert der Pfadforschung in `optParams` eingesetzt, las aber `o.oeffnetForschung`; das Feld liegt in `o.pfad`. Betroffene Schlüssel: `kp.eff.wasserrahmen`, `kp.eff.dampfkraft` (je `{e1}`). Alle anderen sichtbaren Texte waren frei von Platzhaltern (Test über 90 Karten/Stufen und 122 Tooltips je Sprache). Behoben, Darstellungstest `tests/browser-v10.mjs`.

**Reichweiten (K10.03).** `reports/kartenpfad10-reichweiten.txt`. R_W = 105 (Werfer). Eigener Turm 120 (+20 je Reichweitenstufe), gegnerischer Basisturm 95, Lane 1000 (896 zwischen den Basisrändern), Nahkampf 14. Die 231 des Geschützes waren der reine Grundwert 2,2 · 105; keine Ausbauten oder Karten waren enthalten. Reichweitenwirksam auf Einheiten ist nur die Karte Lange Wurfarme (+25/+50, Werfer und Bogenschütze).

**Formationen (K10.04).** Formationsboni zählen nach Anzahl (`formSize`, `rowSize`, Reihe 0), nicht nach Ort: Kriegstrommeln und Schildwall sind funktional unberührt. Das Nachrücken in die Mitte (`refillMid`) wählt Nahkämpfer zuerst und bleibt unverändert. Der Armeezustand in der Leiste bleibt „Marsch“, solange die Nahkampfreihe läuft, auch wenn die Fernkämpfer schon feuern (Folge, kein Umbau). Eigene Geschütze (Reichweite 210) stehen vor der gegnerischen Basis außerhalb des Basisturms (95): sie beschießen die Basis unangreifbar (zu berichten, nicht korrigiert).

**Rückstau (K10.05).** Ursache: Dauerzufluss, nicht der einzelne Schub. Nach Minute 10 liefern Basisschaden (59–95 % der EP) und das Forschungsbudget (Wirtschafts-Bot: 50 %) 80–460 EP/min; eine Stufe kostet etwa 140 EP, der Mindestabstand erlaubt 1,3 Aufstiege je Minute. Einzelne Schübe (abgewehrte Welle, Abschussserie) sprengen die Stufenkosten nur in 2,7 % der Sekunden (größter Schub: 3,5 Stufen). Die Übertragsgrenze ist aus (Entscheidung Teil 8), der Mindestabstand griff wie beschrieben. Kein Programmfehler im Sinn der Anforderung; die Mehrfachaufstiege je Aufruf sind trotzdem entfernt (siehe unten).

## Umsetzung

- **K10.01:** Wasserrahmen +30 %, Dampfkraft +40 % aus der Forschung; einstufige Karten ohne Stufenpunkt; die Leiste unter der Bühne zeigt Wirkung und Nachteil getrennt (Zeichen `▼`) statt als Fließtext. Darstellungstest je Sprache, Bildschirmfotos `docs/bilder/kartenpfad10-technologiekarten-*.png`.
- **K10.02:** `unit.<id>.desc` für alle neun Einheiten (höchstens 140 Zeichen, en 161), Zeilen „Taste“ und „Söldner / keine Versorgung“ in der Tabelle, Ausrückregel einmal im Reiter Armee (`tip.tab.army.karten`, mit Limit). Tabelle mit belegenden Werten: `reports/kartenpfad10-einheitentabelle.md`. Abweichung vom Entwurf (Anhang A): Reiter „schnell“ und Katapult „stark gegen Formationen“ widersprechen den Werten (die Armee marschiert im Tempo der langsamsten Einheit; das Katapult hat keinen Flächenschaden), die Texte nennen stattdessen Schaden je Sekunde bzw. Schaden je Wurf.
- **K10.03:** Leiter 1,0 / 1,3 / 1,6 / 1,8 / 2,0: 105 / 137 / 168 / 189 / 210. Die Reihenfolge gilt auch mit Lange Wurfarme (Stufe 2 deckelt den Bogenschützen unter der Armbrust: 167). Gegnerische Schützen folgen derselben Leiter (Bogen 137, Armbrust 140, Katapult und Geschütz auf 140 begrenzt).
- **K10.04:** Fernkämpfer (eigene und gegnerische) bleiben stehen, sobald ein Gegner, eine Mauer, das Tor oder die Basis in Reichweite ist, rücken nach dem Fall des Ziels vor und weichen nie zurück (`core.js`, `holds`, Flag `u.back`). Unit-Tests für alle fünf Typen. Schalter `KARTEN.fernHalt` (für Vergleichsmessungen).
- **K10.05:** Schwelle und Aufstieg sind getrennt (`S.reached`, `S.level`): Ein EP-Schub erreicht beliebig viele Schwellen, schaltet aber höchstens einen Aufstieg frei; die EP bleiben erhalten. Rückstau = erreichte, nicht getroffene Wahlen (`rueckstau()`, Kennzahl `rueckMax`). Stärke der Einheiten und Phase folgen einer festen Referenzkurve (`KARTEN.schwellenRef`).
- **K10.06:** Wartebedingungen statt Wartezeiten im Browser-Test (Ursache der Schwankung: Klick auf die Karte in der Sperrzeit der Kartenknöpfe, Kamerafahrt zum Reich, Textwechsel der Sprechblase).

## Befunde, die der Auftrag nicht erwartete

1. **Die Stärke der Einheiten hing an der Stufe** (`UNIT_STRENGTH_PER_LEVEL`, `phase()`). Mit getrennten Aufstiegen sank die Siegquote des Wirtschafts-Bots von 88 % auf 32–66 %; ebenso brach sie bei jeder steileren Kostenkurve ein. Behoben: Stärke und Phase folgen einer Referenzkurve über die EP, unabhängig von Kostenkurve, Mindestabstand und Wahlen. Der Rückstau war damit bisher ein verdeckter Stärkegewinn.
2. **Gegnerische Fernkämpfer außerhalb eines unausgebauten Turms.** K10.03 verlangt die Grundreichweite der eigenen Türme (120) als Obergrenze; umgesetzt ist die PO-Entscheidung aus Teil 8 (Turm mit einer Reichweitenstufe, 140). Gegnerische Bogen- und Armbrustschützen (137/140) halten damit außerhalb der Reichweite eines unausgebauten Turms. Der Schalter `KARTEN.gegnerReichweiteMax` erlaubt 120. **Entscheidung des PO nötig** (siehe offene Punkte).

## K10.04: Siegquote, Patt, Mauerverlust, Dauer

Teil 9 → V.4 (nur Fernkampfverhalten und Leiter, alte Kostenkurve): `reports/kartenpfad10-vergleich-fernkampf.md`. Patt steigt in keinem Feld um mehr als einen Prozentpunkt (Bot ohne Kategorie über alle Felder: 2,9 % → 0,7 %; mit `?druck=hoch` 2,0 % → 0,3 %).

Teil 9 → Teil 10 (Endstand, Arm C2), Normal, durchschnitt, 50 Partien je Feld:

| Feld (normal, durchschnitt) | Partien | Siege Teil 9 → Teil 10 | Patt Teil 9 → Teil 10 | Dauer Median | Mauerverlust Mittel | Wahlen Median |
|---|---|---|---|---|---|---|
| Militär-Bot | 50 / 50 | 98,0 % → 96,0 % | 2,0 % → 0,0 % | 12:51 → 13:11 | 48 → 293 | 13 → 9 |
| Wirtschafts-Bot | 50 / 50 | 88,0 % → 80,0 % | 2,0 % → 4,0 % | 16:18 → 15:31 | 357 → 990 | 20 → 13 |
| Verteidigungs-Bot | 50 / 50 | 88,0 % → 98,0 % | 12,0 % → 0,0 % | 19:50 → 15:08 | 730 → 705 | 22 → 12 |
| Verteidigungs-Bot, ?druck=hoch | 50 / 50 | 70,0 % → 84,0 % | 30,0 % → 6,0 % | 21:23 → 14:13 | 884 → 1349 | 23 → 12 |
| Bot ohne Kategorie | 50 / 50 | 96,0 % → 96,0 % | 2,0 % → 0,0 % | 14:52 → 13:28 | 161 → 561 | 15 → 11 |
| Bot ohne Kategorie, ?druck=hoch | 50 / 50 | 98,0 % → 96,0 % | 0,0 % → 0,0 % | 14:48 → 13:06 | 329 → 670 | 15 → 11 |

Patt-Quote des Bots ohne Kategorie über alle Felder (alle Grade und Profile)

| Reihe | ohne Schalter | mit ?druck=hoch (Normal, Schwer) |
|---|---|---|
| Teil 9 | 2,9 % (450 Partien) | 2,0 % (300 Partien) |
| Teil 10 | 0,0 % (450 Partien) | 0,3 % (300 Partien) |


Der Mauerverlust steigt bei Militär-, Wirtschafts- und Bot ohne Kategorie (die Fernkämpfer des Gegners treffen die Mauer aus der Entfernung), die Siegquote des Verteidigungs-Bots steigt von 88 % auf 98 %, die Patt-Quote fällt in allen Feldern. Die Zahl der Wahlen sinkt mit der steileren Kurve (Bot ohne Kategorie: 15 → 11).

## K10.05: Arme (50 Partien je Feld, gleiche Seeds)

Vollständige Tabellen aller Arme, auch der verworfenen, in `reports/kartenpfad10-arme.md`. Kriterien: Rückstau höchstens eine offene Wahl in ≥ 90 % der Partien und nie über zwei (alle Bots, Normal, durchschnitt); 12–16 Wahlen und 13–17 min (Bot ohne Kategorie); Wahlen je Minute aktiv > durchschnitt > gelegentlich; Variationskoeffizient der Abstände im Median ≥ 0,25.

| Arm | Inhalt | Rückstau ≤ 1 | größter Rückstau | Wahlen | Dauer | Profile | CV | Siegquote Wirtschafts-Bot |
|---|---|---|---|---|---|---|---|---|
| 0 | Kurve Teil 9 (1,05; 45 s) | 0 % | 40 | 15 ✓ | 12:27 ✗ | ✗ | 0,00 ✗ | 98 % |
| A3 | wachstum 1,25 | 28 % | 5 | 13 ✓ | 12:53 ✗ | ✗ | 0,37 ✓ | 86 % |
| A4 | wachstum 1,35 | 75 % | 3 | 11 ✗ | 13:28 ✓ | ✗ | 0,48 ✓ | 80 % |
| A5 | wachstum 1,30 | 54 % | 4 | 12 ✓ | 12:50 ✗ | ✗ | 0,43 ✓ | 86 % |
| B4 | dynamisch (ref 70 s, höchstens ×12) | 20 % | 15 | 13 ✓ | 13:04 ✓ | ✗ | 0,36 ✓ | 96 % |
| C1 | A5 mit 40 s | 64 % | 3 | 12 ✓ | 13:13 ✓ | ✗ | 0,49 ✓ | 84 % |
| **C2** | **A4 mit 40 s (gewählt, vorläufig)** | **87 %** | **3** | **11 ✗** | **13:28 ✓** | **✗** | **0,52 ✓** | **80 %** |
| D1 | B4 mit 40 s | 32 % | 10 | 13 ✓ | 12:46 ✗ | ✗ | 0,43 ✓ | 86 % |

Weitere Arme der ersten Runde (A1 1,10; A2 1,15; B1 ref 90 s ×2; B2 ref 60 s ×3; B3 ref 70 s ×6) stehen in der Datei; sie liegen bei 2–14 % Rückstau-Erfüllung. In der ersten Runde war die Stärke noch an die Kostenkurve gekoppelt (Befund 1), die Siegquoten sind dort nicht vergleichbar.

**Bewertung.** Kein Arm erfüllt alle Kriterien; die Abbruchregel gilt: gewählt wird der Arm mit dem geringsten Rückstau, vorläufig (C2). Der dynamische Anstieg (B, D) bleibt wirkungslos, solange der EP-Zufluss je Partie um mehr als das Zehnfache schwankt (Abschussserien bei haltenden Fernkämpfern); die Kosten der einen nächsten Stufe zu steigern genügt nicht. Das Kriterium „aktiv > durchschnitt > gelegentlich“ scheitert in allen Armen einschließlich der Ausgangskurve: die Profile des Bots unterscheiden sich im Wahltakt kaum (0,76–0,80 je Minute in C2). Das ist eine Eigenschaft der Bots und des Kriteriums (Wahlen je Minute der Partie, nicht je Minute Spielzeit mit Zufluss), nicht der Kurve. Rückstau in Nicks Partie: [Mensch] offen.

Mögliche nächste Schritte, nach Entscheidung des PO: (a) Kurve zwischen A5 und A4 (wachstum 1,32) mit 40 s, um 12 Wahlen zu treffen; (b) den EP-Zufluss aus Abschüssen deckeln; (c) das Profil-Kriterium am Spielverhalten statt am Bot messen (Spieltest).

## Abnahmetabelle

| REQ | Kriterium | Ergebnis |
|---|---|---|
| K10.01 | Darstellungstest, Bildschirmfotos | erfüllt (`tests/browser-v10.mjs`, `docs/bilder/kartenpfad10-*.png`); [Mensch] offen |
| K10.02 | Test je Einheit, Budget, Suchtest, Tabelle | erfüllt (`tests/v10.test.mjs`, `reports/kartenpfad10-einheitentabelle.md`); [Mensch] offen |
| K10.03 | Tabelle, Reihenfolge, Gegnerobergrenze | erfüllt mit der Abweichung 140 statt 120 (Befund 2); [Mensch] offen |
| K10.04 | Unit-Test (5 %), Simulation, Patt höchstens +1 Prozentpunkt | erfüllt (Patt sinkt); Bildfolge: nicht erstellt (siehe Nicht getestet); [Mensch] offen |
| K10.05 | Rückstau, Wahlen, Profile, CV, Tabelle, Unit-Test | **nicht vollständig erfüllt**; Tabelle und Unit-Test erfüllt; Arm C2 vorläufig |
| K10.06 | zehn Läufe grün je Sprache | siehe Browser-Läufe unten |
| K10.07 | Golden-Test, Unit-Tests, Browser-Prüfpunkte | Golden-Test und Unit-Tests grün (`npm run test:kurz`) |

## Nicht getestet, Abweichungen, offene Punkte

- **Bildfolge einer Lane mit haltenden Fernkämpfern** (K10.04): nicht erstellt; die Haltung ist in den Unit-Tests über Abstand und Position belegt.
- **Zehn Läufe des Browser-Tests:** Ergebnis im nächsten Abschnitt.
- **Entscheidung 1 (PO): Obergrenze der gegnerischen Reichweite** 120 (Grundreichweite, wie K10.03 formuliert) oder 140 (Turm mit einer Stufe, Entscheidung Teil 8). Schalter `KARTEN.gegnerReichweiteMax`.
- **Entscheidung 2 (PO): Rückstau.** C2 bestätigen, nachstellen (a) oder (b), oder das Kriterium am Spieltest messen.
- **Katapult 1,8 und Fernkampfverhalten auch für den Gegner:** wie vorgeschlagen umgesetzt.
- **Spielstand-Version 14** (neue Felder `reached`, `lvlRef`, `pfad.mult`): ältere Spielstände gehen verloren.

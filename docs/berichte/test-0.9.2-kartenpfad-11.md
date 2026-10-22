# Testbericht v0.9.2-kartenpfad-11

Branch `exp/kartenpfad` · Commit siehe unten · Anforderungen `docs/anforderungen-kartenpfad-10-11.md`, dazu das Tutorial-Inkrement X.2 · Ausführlich: `docs/bericht-kartenpfad-10.md`, `-11.md`.

## Umgesetzt
- **K10.01** Technologiekarten zeigen den Wert der Forschung (Wasserrahmen +30 %, Dampfkraft +40 %); keine offenen `{…}` auf Karten und in Tooltips.
- **K10.02** Alle neun Einheiten haben einen Zwei-Satz-Text; „Taste“ und „Söldner“ in der Tabelle; Ausrückregel im Reiter Armee.
- **K10.03** Reichweiten 105 / 137 / 168 / 189 / 210; Gegner höchstens 140 (PO bestätigt).
- **K10.04** Fernkämpfer halten aus maximaler Reichweite und rücken nach dem Fall des Ziels vor.
- **K10.05** Schwelle und Aufstieg getrennt; Arm C2 (Wachstum 1,35, Abstand 40 s, vom PO bestätigt); Stärke folgt einer Referenzkurve.
- **K10.06** Browser-Test mit Wartebedingungen; zehn Läufe grün.
- **K11.01–03** Flügel mit Nachbarschaftsbonus (Daten im Flügel), Bot-Platzierung, `?fluegel=<id>`, Hervorhebung am Haupthaus.
- **X.2** Das Tutorial erklärt im Modus karten das Haupthaus (zwei Sprechblasen nach der ersten Manufaktur, Rahmen auf dem Platz).

## Teststufe und Ergebnis
Stufe 3 (Merge-Vorbereitung, ohne PO-Vorgabe): `npm run test:kurz` grün; alle Browser-Prüfungen grün (`browser-check` zehnmal nacheinander, `-k2`, `-k2-standard`, `-q6`, `-n5`, `-t8`, `-u9`, `-r7`, `-v10`, `-w11`, `-x12`); Vergleichssimulationen (50 Partien je Feld) vorher/nachher in `reports/kartenpfad10-*` und `reports/kartenpfad11-*`; Golden-Test (Modus standard) grün. Patt-Quote des Bots ohne Kategorie, alle Felder: 0,0 % (mit `?druck=hoch` 0,3 %).

## Nicht getestet
- Verhalten mit Menschen (Takt der Wahlen, Lesbarkeit, Flügelwahl, Tutorial-Erklärung): Spieltest.
- Bildfolge einer Lane mit haltenden Fernkämpfern (nur Unit-Tests).
- Telefon bei 375 px (nur Layout des Tutorials bei 1280 px geprüft).

## Abweichungen mit Begründung
- Gegner-Reichweite 140 statt „Grundreichweite 120“ (K10.03): Entscheidung des PO.
- Ziel Nachbarschaftswert (K11.04) von 2,5 auf 1,0 gesenkt (PO); die Flügelwerte bleiben, 2,5 wäre nur mit dem Mehrfachen erreichbar.
- Siegquote Wirtschafts-Bot 80 % statt 96 %, 11 statt 12–16 Wahlen (Bot ohne Kategorie): Folge von Arm C2, akzeptiert.
- Tutorial: Der Erklärschritt ist ein sechster Inhalt neben den „fünf Dingen“ (Grundsatz 5), ohne Auftrag; abschaltbar über `modus` in `data/tutorial-steps.js`.

## Bekannte Probleme
- Spielstand-Version 14: ältere Spielstände gehen verloren.
- Die Armee-Anzeige „Marsch“ bleibt, während Fernkämpfer schon feuern.
- Eigene Geschütze (210) beschießen die Basis außerhalb des Basisturms (95).
- Der Wahltakt im Profil-Vergleich der Bots („aktiv > durchschnitt > gelegentlich“) ist in keinem Arm erfüllt.

## Manuell zu prüfen
1. `index.html?tutorial=1&pacing=karten&lang=de`: nach der ersten Manufaktur erscheinen zwei Sprechblasen zum Haupthaus; Rahmen auf dem mittleren Platz; ein Klick blättert weiter.
2. `?pacing=standard&tutorial=1`: keine Haupthaus-Erklärung.
3. `?tutorial=0`: 13 bis 15 Minuten spielen; kommen die Karten zu selten (11 bis 13 Wahlen) oder stehen mehrere gleichzeitig an?
4. Haupthaus überfahren (Raster und Karte): begünstigte Plätze leuchten; Tooltip nennt Bonus und Plätze.
5. `?fluegel=schatzkammer` (Rathaus per Karte Stadtrecht): Manufakturen auf den Plätzen 2 und 4 zeigen den Bonus „Flügel Schatzkammer“.
6. Einheitentooltips (Reiter Armee): ein Satz zur Einheit, ein Satz zu Stärken und Schwächen; Kopf des Reiters nennt das Versorgungslimit.
7. `?druck=hoch`: gegnerische Fernkämpfer bleiben vor der Mauer stehen; fällt der Mauerschaden zu hoch aus?

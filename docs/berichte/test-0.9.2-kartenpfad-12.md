# Testbericht v0.9.2-kartenpfad-12

Branch `exp/kartenpfad` · Code-Stand `fa92c67` · Anforderung `docs/anforderungen-kartenpfad-12.md` · Ausführlich: `docs/bericht-kartenpfad-12.md`.

Spielbarer Testbuild (Protokoll an, Modus karten): https://claude.ai/artifact/BNHYA6Trav5sajVWyqeG92 (Version 1, privat)

## Umgesetzt
- **K12.01** Basismessung (EP je Quelle und Stufe, Kurs, Materialpreis, Preisanstieg, Elastizität), Schalter `--budget`; Befund: Das Budget lieferte nach Stufe 10 nur 3 % der EP, der Abstand lag am Mindestabstand.
- **K12.02** Kosten E(n) = 125 · 1,3^(n−1) mit Unit-Test und Tabelle n = 1–20.
- **K12.03** Kurs 0,08 → 0,7 EP je Material, Regler 0–50 % in 10-%-Schritten, flachere Degression (80 % bei 50 %).
- **K12.04** Preis der nächsten Karte und Wirkung der nächsten Reglerstufe im Reiter Universität und im Tooltip des Stapels.
- **K12.05** Kalibrierung in sieben Runden (18 Kandidaten), Messung mit 100 Partien je Arm.
- **K12.06** Budgetregel der Bots: fester Anteil (ohne Kategorie 40 %, Militär 20 %, Wirtschaft 30 %, Verteidigung 30 %).
- **K12.07** Bericht, Testleitfaden, Textübersicht; Spielstand-Version 15.

## Teststufe und Ergebnis
Stufe 2 (ohne Angabe in der Anforderung) plus Browser-Prüfungen: `npm test` grün (Golden-Test des Standardmodus unverändert); `npm run sim:kurz` Patt 0 %; Browser: `browser-check`, `-k2`, `-k2-standard`, `-q6`, `-n5` (angepasst auf sechs Reglerstufen), `-r7`, `-t8`, `-u9`, `-v10`, `-w11`, `-x12`, `-y12` (neu) grün. Messung (Normal, durchschnitt): Rückstau 96 % mit höchstens einer offenen Wahl, größter Wert 2; Wirtschafts-Bot 100 % Siege; Patt 0,0 % (mit `?druck=hoch` 0,0 %).

## Nicht getestet
- Verhalten mit Menschen: Nutzt der Spieler das Budget, versteht er den Preis der nächsten Karte, fühlt sich die Partie nach Stufe 10 zäh an (Spieltest).
- Telefon bei 375 px; Profile aktiv und gelegentlich bei festen Budgets; Leicht und Schwer nur in der Regelmessung.

## Abweichungen mit Begründung
- **g = 1,3 statt höchstens 1,20:** Im Bereich bis 1,20 bleibt der Rückstau des Wirtschafts-Bots bei 65–69 % der Partien (mit g = 1,3: 91–95 %). **Entscheidung des PO nötig.**
- **Kurs-Grundwert 0,7 als vierter Hebel** und **Regler bis 50 %:** ohne höheren Kurs bleibt das Budget bei 3 % der EP nach Stufe 10; mit der Obergrenze 40 % liegt das Optimum am Rand.
- **`basisFaktor` Normal 9,5 → 10,5** (Partiedauer 13–17 min bleibt mit Budget erreicht).
- **Verfehlt:** Elastizität ab Stufe 10 (EP-Schub und Mindestabstand), Mindestabstand beim Optimum ≤ 15 % (Militär 17 %, Verteidigung 24 %, Wirtschaft 34 %), Optimum der Verteidigung und Strategieabhängigkeit (Rauschen), Kombinationstest aller Kursmultiplikatoren (Rückstau 0–47 % der Partien mit höchstens einer offenen Wahl).

## Bekannte Probleme
- Die erste Karte kommt nach etwa 97 s statt 76 s (Tutorial: unverändert durch die Kriegsbeute).
- Bei hohem Budget bremst der Mindestabstand 14–26 % der Wahlen bis Stufe 6.
- Schwer: Rückstau hoch (aktiv 16 %, durchschnitt 42 % der Partien mit höchstens einer offenen Wahl). Ältere Spielstände (Version 14) gehen verloren.

## Manuell zu prüfen
1. `index.html?tutorial=0&pacing=karten`: Reiter Universität bauen; steht unter „Forschungsbudget“ „Nächste Karte ≈ N Material · +10 %: nächste Karte ≈ N s früher“ mit plausiblen Zahlen?
2. Mauszeiger auf das Kartensymbol neben den EP: nennt der Tooltip dieselben zwei Zeilen?
3. Budget 30 %, danach 0 % (zwei Partien, je 13–15 min): Kommen die Karten mit Budget spürbar früher, besonders bis Minute 8?
4. Nach Stufe 8: Wartet die Partie auf die Karte oder auf den Mindestabstand (40 s)? Zähe Phase nach Stufe 10?
5. Preis der nächsten Karte mit dem der nächsten Manufaktur oder des nächsten Quartiers vergleichen: Hilft der Vergleich bei der Entscheidung?
6. `?druck=hoch&difficulty=schwer`: Stehen mehrere Wahlen gleichzeitig an?
7. `?pacing=standard`: kein Forschungsbudget, Spiel wie bisher.

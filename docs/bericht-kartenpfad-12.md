# Bericht Kartenpfad Teil 12: EP als Investition

Branch `exp/kartenpfad` · Ausgangsstand v0.9.2-kartenpfad-11 (Code `47152d5`) · Stand v0.9.2-kartenpfad-12 · Anforderung `docs/anforderungen-kartenpfad-12.md` · Rohdaten `reports/kartenpfad12-*` · Testleitfaden `docs/testleitfaden-kartenpfad-12.md` · Testbuild (privat, Protokoll an): https://claude.ai/artifact/BNHYA6Trav5sajVWyqeG92.

## Ergebnis

Das Forschungsbudget lohnt sich jetzt in der ganzen Partie, aber nicht so, wie die Anforderung es misst. Bei 30 % Budget stammen in den Stufen 5–9 61–73 % der EP aus dem Budget (vorher 12 %); die Abstände der ersten Wahlen sinken von 122 s auf 40 s (Stufe 3). Der Abstand ab Stufe 10 sinkt nicht: Dort bestimmt der EP-Schub aus Abschüssen und Basisangriff, und der Mindestabstand von 40 s greift mit oder ohne Budget (Kriterium Elastizität verfehlt, Abschnitt 7). Von zehn Bot-Kriterien aus K12.05 sind sechs erfüllt und vier verfehlt: Elastizität und Mindestabstand beim Optimum wegen dieses Schubs, Optimum der Verteidigung und Strategieabhängigkeit im Rauschen der Siegquoten. Der Kombinationstest aus K12.03 (alle Kursmultiplikatoren zugleich) erzeugt Rückstau und ist verfehlt (Abschnitt 4).

**Drei Abweichungen von der Anforderung brauchen die Entscheidung des PO:**
1. **g = 1,3 statt höchstens 1,20.** Im zulässigen Bereich bleibt der Rückstau des Wirtschafts-Bots bei 65–69 % der Partien (höchstens eine offene Wahl) und die Zahl gebremster Wahlen bei 19–31 % (Budget 30 %); mit g = 1,3 und Kurs 0,7 sind es 91–95 % und 17–25 %. Sieben Messrunden, 18 Kandidaten (Abschnitt 2). Der Leitwert „Gleichlauf mit den übrigen Investitionen“ liegt bei 1,7–2,0, also noch weiter oben; 1,3 ist näher an ihm als 1,2.
2. **Grundwert des Kurses 0,08 → 0,7 EP je Material** (vierter Hebel neben E0, g und Degression). Ohne ihn bleibt das Budget bei 3 % der EP nach Stufe 10; E0, g und Degression ändern das Verhältnis von Budget- zu übrigen EP nicht (Abschnitt 1).
3. **Regler in 10-%-Schritten von 0 bis 50 %** statt 0 / 25 / 50 %. Die Anforderung misst bei 10, 20, 30, 40 %; 50 % bleibt als Obergrenze, damit das Optimum im Inneren liegen kann. Dazu `basisFaktor` Normal 9,5 → 10,5 (Partiedauer; Leicht und Schwer im selben Verhältnis).

**Spielstand-Version 15** (Version 14 wird verworfen). Standardmodus und Golden-Test unverändert.

### Abnahme K12.01 bis K12.07

| REQ | Kriterium | Ergebnis |
|---|---|---|
| K12.01 | Basismessung, Befund, `--budget` | erfüllt (Abschnitt 1); Befund: beide Faktoren, Kurs in der Mitte, Mindestabstand ab Stufe 10 |
| K12.02 | Unit-Test, Tabelle E(n) | erfüllt (`tests/kosten12.test.mjs`, Abschnitt 3); **g außerhalb des Bereichs** |
| K12.03 | Kurs vorher/nachher, Kombinationstest | Tabelle erfüllt; Kombinationstest **verfehlt** (Abschnitt 4) |
| K12.04 | Preis der nächsten Karte, Test, Bildschirmfotos | erfüllt (Abschnitt 5); [Mensch] offen |
| K12.05 | Wirkung und Kalibrierung | 6 von 10 Bot-Kriterien erfüllt, 4 verfehlt (Abschnitt 7); [Mensch] offen |
| K12.06 | Budgetregel der Bots, Test, Bericht je Phase | erfüllt (Abschnitt 6) |
| K12.07 | Bericht, Leitfaden, Textübersicht, Tests, Testbuild | erfüllt (Testbericht `docs/berichte/test-0.9.2-kartenpfad-12.md`) |

## 1 Basismessung und Diagnose (X.0, K12.01)

### Befund der Basismessung

Das Forschungsbudget wirkt nach Stufe 10 nicht, weil beide Faktoren gegen es arbeiten, jeder in einer anderen Phase:

1. **Kurs (mittlere Phase und Spätphase):** Bei Budget 30 % liefert das Budget in den Stufen 5–9 nur 12 % der EP (271 von 2.320), in den Stufen 10–13 nur 3 % (233 von 6.934). Für 30 % kürzere Abstände müsste es 43 % der übrigen EP liefern. Der Kurs von 0,075 EP je Material müsste dafür in der Mitte etwa 3-mal, in der Spätphase etwa 12-mal so hoch sein.
2. **Kurve und Mindestabstand (Spätphase):** Die EP-Rate springt ab Minute 10 von 4–8 auf 20–30 EP je Sekunde (Basisangriff, große Wellen). Eine Stufe für 1.043 EP (Stufe 10) ist dann in 40 s bezahlt. Der Abstand liegt auf Stufe 10 bei 40,1 s (Mindestabstand) in allen Armen mit Budget; bei Budget 0 % sind es 43,5 s. Mehr Budget kann diesen Abstand nicht verkürzen.
3. **Wo der Eindruck des PO stimmt:** Läuft die Partie über Wahl 11 hinaus (Wahl 12 erscheint in 14 von 50 Partien), steigt der Abstand nach Wahl 12 auf 133 s (6 Partien) und nach Wahl 13 auf über 240 s (2 Partien mit Budget 30 und 40 %). Dort ist die Kurve der Engpass, nicht der Mindestabstand. Die Bots beenden die meisten Partien davor; Wahl 13 erscheint in 6 von 50.

**Der Befund des PO ist also nur für lange Partien bestätigt.** In den Bot-Partien kommen die Karten ab Stufe 9 am Mindestabstand, nicht zu spät. Ob Menschen häufiger über Stufe 11 hinauskommen, zeigt erst der Spieltest.

### Folgerung für die Kalibrierung

- **Der Kurs braucht einen höheren Grundwert, nicht nur eine flachere Degression.** E0, g und die Degression ändern das Verhältnis von Budget-EP zu übrigen EP nicht. Ohne höheren Grundwert ist die Elastizität von 30 % (K12.05) nicht erreichbar. Der Grundwert (`KARTEN.budget.kurs`, jetzt 0,08) ist in der Anforderung kein genannter Hebel; er wird als vierter Hebel geführt und im Bericht als Abweichung ausgewiesen (Rückfrage an den PO).
- **Elastizität ab Stufe 10 und Mindestabstand schließen sich bei der heutigen EP-Rate aus.** Bei Budget 0 % liegt der Abstand schon bei 43 s. Eine Verkürzung um 30 % ergäbe 30 s, unter dem Mindestabstand von 40 s. Das Kriterium wird nur erreichbar, wenn der Abstand ohne Budget auf Stufe 10 bei mindestens 57 s liegt, also die Kosten dort etwa 1,4-mal so hoch sind wie heute. Das ist mit g zwischen 1,08 und 1,20 nur zu erreichen, wenn E0 deutlich steigt; dann kommen die ersten Karten später.
- **Das Kriterium „Optimum im Inneren“ hat mit 50 Partien kein Auflösungsvermögen.** Die Siegquote schwankt zwischen benachbarten Budgets um 5–10 Prozentpunkte (Wirtschafts-Bot: 98 / 96 / 86 / 84 / 92 % bei 0–40 %). Für X.4 sind mindestens 150 Partien je Arm nötig.

### Kosten der Wahlen heute (Kurve 70 · 1,35^(n−1))

| n | Kosten E(n) (EP) | kumuliert |
|---|---|---|
| 1 | 70 | 70 |
| 2 | 95 | 165 |
| 3 | 128 | 292 |
| 4 | 172 | 464 |
| 5 | 233 | 697 |
| 6 | 314 | 1011 |
| 7 | 424 | 1434 |
| 8 | 572 | 2006 |
| 9 | 772 | 2779 |
| 10 | 1043 | 3821 |
| 11 | 1407 | 5229 |
| 12 | 1900 | 7129 |
| 13 | 2565 | 9694 |
| 14 | 3463 | 13157 |
| 15 | 4675 | 17832 |
| 16 | 6311 | 24143 |
| 17 | 8520 | 32663 |
| 18 | 11502 | 44165 |
| 19 | 15528 | 59692 |
| 20 | 20962 | 80655 |

### Kurs des Forschungsbudgets heute (EP je Material)

Der Regler hat die Stufen 0 / 25 / 50 %; Zwischenwerte (10, 20, 30, 40 %) sind für die Messung linear zwischen den Stützstellen berechnet. Faktor je Stufe: 1 / 1 / 0,7.

| Anteil | ohne | Akademie | Stiftungshaus | Lehrjahre II | alle drei | Kurs relativ zum kleinsten Anteil |
|---|---|---|---|---|---|---|
| 10 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 20 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 25 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 30 % | 0,075 | 0,113 | 0,150 | 0,094 | 0,282 | 94 % |
| 40 % | 0,066 | 0,098 | 0,131 | 0,082 | 0,246 | 82 % |
| 50 % | 0,056 | 0,084 | 0,112 | 0,070 | 0,210 | 70 % |

Stützstellen des Reglers: 0 % → Faktor 1, 25 % → Faktor 1, 50 % → Faktor 0.7; Zwischenwerte linear (nur Messung).

Multiplikatoren: Akademie ×1,5, Stiftungshaus ×2, Lehrjahre Stufe 2 ×1,25 auf den Kurs (dazu ×1,6 auf alle EP).

### Materialpreis der nächsten Karte heute

Kosten der Stufe geteilt durch den Kurs; alle EP aus dem Budget gedacht (Obergrenze des Preises, ein Teil kommt aus Abschüssen).

| n | Budget 10 % | Budget 20 % | Budget 30 % | Budget 40 % |
|---|---|---|---|---|
| 1 | 875 | 875 | 931 | 1067 |
| 2 | 1181 | 1181 | 1257 | 1441 |
| 3 | 1595 | 1595 | 1696 | 1945 |
| 5 | 2906 | 2906 | 3092 | 3544 |
| 7 | 5297 | 5297 | 5635 | 6459 |
| 9 | 9653 | 9653 | 10270 | 11772 |
| 10 | 13032 | 13032 | 13864 | 15893 |
| 11 | 17593 | 17593 | 18716 | 21455 |
| 12 | 23751 | 23751 | 25267 | 28964 |
| 13 | 32064 | 32064 | 34110 | 39102 |
| 14 | 43286 | 43286 | 46049 | 52788 |
| 15 | 58436 | 58436 | 62166 | 71263 |

### Preisanstieg der übrigen Investitionen

| Investition | Preise der ersten Käufe | Faktor je Kauf |
|---|---|---|
| Manufaktur (1.–5.) | 30 · 48 · 77 · 123 · 197 | 1,60 |
| Qualitätsstufe der Schmiede (1.–4.) | 80 · 200 · 500 · 1250 | 2,50 |
| Quartier (1.–5.) | 250 · 500 · 1000 · 2000 · 4000 | 2,00 |
| Einheit (Bogenschütze, je Kauf) | 36 · 36 · 36 | 1,00 |
| Karte bei Budget 20 % (n = 1–12) | 875 · 1181 · 1595 · 2153 … | 1,35 |

Mittlerer Faktor je Kauf: 2,00 (Manufaktur, Schmiede, Quartier), 1,68 mit der Einheit (Preis gleich).

Der mittlere Faktor je Kauf liegt bei 2,0 (1,68 mit der Einheit) und damit weit über dem zulässigen Bereich für g (1,08–1,20). **Der Leitwert „Gleichlauf“ ist nicht anwendbar:** Die übrigen Investitionen sind gedeckelt (Manufakturen höchstens 5, Quartiere 5, Qualitätsstufen 4) und steigen deshalb je Kauf steiler, als es eine Kartenkurve über 12–16 Wahlen könnte. Es gilt der zulässige Bereich; K12.05 entscheidet.

### Elastizität und Kennzahlen je Budget (Normal, durchschnitt, 50 Partien je Arm)

Fester Anteil über `--budget`; „Regel des Bots“ ist die bisherige Regel (ohne Kategorie und Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %). „Gebremst“: Wahl wartet mehr als 5 s auf den Mindestabstand. Der Abstand gilt von der Wahl der Stufe bis zur nächsten (in Klammern: Partien, die so weit kamen).

**Bot ohne Kategorie**

| Budget | Partien | Siege | Dauer (Median) | Wahlen (Median) | gebremst (>5 s) | gebremst bis Stufe 6 | Abstand Stufe 5 | Abstand Stufe 10 | Abstand Stufe 13 | Patt |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 % | 50 | 96 % | 13:31 | 11 | 25 % | 16 % | 92,8 s (50) | 43,5 s (32) | – s (0) | 0 % |
| 10 % | 50 | 98 % | 13:33 | 11 | 27 % | 16 % | 101,1 s (50) | 40,1 s (31) | – s (0) | 0 % |
| 20 % | 50 | 100 % | 13:50 | 11 | 26 % | 15 % | 91,3 s (50) | 40,1 s (38) | – s (0) | 0 % |
| 30 % | 50 | 98 % | 13:42 | 12 | 22 % | 16 % | 84,2 s (50) | 40,3 s (40) | 243,1 s (2) | 0 % |
| 40 % | 50 | 90 % | 14:18 | 12 | 22 % | 17 % | 91,6 s (50) | 40,1 s (38) | 259,2 s (2) | 2 % |
| Regel des Bots | 50 | 96 % | 13:31 | 11 | 25 % | 16 % | 92,8 s (50) | 43,5 s (32) | – s (0) | 0 % |

Abstand gegenüber Budget 0 %:

| Budget | Stufe 5 | Stufe 10 | Stufe 13 |
|---|---|---|---|
| 10 % | +9 % | -8 % | – |
| 20 % | -2 % | -8 % | – |
| 30 % | -9 % | -7 % | – |
| 40 % | -1 % | -8 % | – |

**Militär-Bot**

| Budget | Partien | Siege | Dauer (Median) | Wahlen (Median) | gebremst (>5 s) | gebremst bis Stufe 6 | Abstand Stufe 5 | Abstand Stufe 10 | Abstand Stufe 13 | Patt |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 % | 50 | 96 % | 13:12 | 9 | 22 % | 15 % | 94,6 s (50) | 40,1 s (15) | – s (0) | 0 % |
| 10 % | 50 | 92 % | 13:35 | 9 | 19 % | 15 % | 117,9 s (50) | 40,1 s (19) | 71,3 s (1) | 0 % |
| 20 % | 50 | 84 % | 13:07 | 9 | 19 % | 15 % | 97,7 s (50) | 71,3 s (15) | 215,9 s (3) | 6 % |
| 30 % | 50 | 94 % | 12:44 | 9 | 20 % | 15 % | 98,2 s (50) | 40,1 s (17) | 147,1 s (2) | 2 % |
| 40 % | 50 | 94 % | 13:42 | 10 | 21 % | 16 % | 96,3 s (50) | 40,1 s (19) | 173,7 s (3) | 0 % |
| Regel des Bots | 50 | 96 % | 13:12 | 9 | 22 % | 15 % | 94,6 s (50) | 40,1 s (15) | – s (0) | 0 % |

**Wirtschafts-Bot**

| Budget | Partien | Siege | Dauer (Median) | Wahlen (Median) | gebremst (>5 s) | gebremst bis Stufe 6 | Abstand Stufe 5 | Abstand Stufe 10 | Abstand Stufe 13 | Patt |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 % | 50 | 98 % | 14:36 | 12 | 29 % | 21 % | 86,1 s (50) | 40,1 s (35) | 83,8 s (5) | 0 % |
| 10 % | 50 | 96 % | 14:51 | 12 | 27 % | 24 % | 96,0 s (50) | 40,1 s (39) | 69,5 s (8) | 2 % |
| 20 % | 50 | 86 % | 14:48 | 12 | 25 % | 23 % | 86,9 s (50) | 40,1 s (37) | 95,4 s (12) | 2 % |
| 30 % | 50 | 84 % | 15:08 | 12 | 23 % | 23 % | 87,2 s (50) | 42,9 s (38) | 93,1 s (8) | 2 % |
| 40 % | 50 | 92 % | 14:52 | 12 | 26 % | 25 % | 79,7 s (50) | 44,1 s (37) | 40,1 s (11) | 0 % |
| Regel des Bots | 50 | 80 % | 15:33 | 13 | 22 % | 26 % | 81,0 s (50) | 45,7 s (43) | 81,8 s (14) | 4 % |

**Verteidigungs-Bot**

| Budget | Partien | Siege | Dauer (Median) | Wahlen (Median) | gebremst (>5 s) | gebremst bis Stufe 6 | Abstand Stufe 5 | Abstand Stufe 10 | Abstand Stufe 13 | Patt |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 % | 50 | 94 % | 15:26 | 11 | 24 % | 13 % | 103,6 s (50) | 40,1 s (40) | 155,2 s (5) | 4 % |
| 10 % | 50 | 90 % | 15:21 | 12 | 26 % | 14 % | 94,2 s (50) | 40,1 s (39) | 152,5 s (6) | 2 % |
| 20 % | 50 | 96 % | 15:52 | 12 | 23 % | 14 % | 98,9 s (50) | 40,1 s (41) | 95,6 s (3) | 0 % |
| 30 % | 50 | 94 % | 15:25 | 12 | 21 % | 15 % | 87,9 s (50) | 40,1 s (41) | 146,1 s (4) | 6 % |
| 40 % | 50 | 92 % | 15:17 | 12 | 20 % | 15 % | 93,9 s (50) | 40,1 s (43) | 156,0 s (2) | 2 % |
| Regel des Bots | 50 | 98 % | 15:18 | 12 | 22 % | 14 % | 96,4 s (50) | 40,1 s (43) | 162,5 s (1) | 0 % |

Anteil gebremster Wahlen bis Stufe 6 (gesondert, Abschnitt 5.4 der Anforderung): 13–26 % je nach Bot; beim Wirtschafts-Bot am höchsten (21–26 %).

### EP je Quelle und Stufenbereich

Median der EP zwischen den erreichten Schwellen. Lagerzehnt (`lager`) und Freihandel (`trade`) liefern 0–2 %; die Grenze von 40 % (Abbruchregel) ist weit entfernt.

**Bot ohne Kategorie, Budget 0 %**

| Stufen | EP gesamt | kill | tower | base | wave | budget | lager | trade | bounty | passive | andere | Partien |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1–4 | 469 | 366 (78 %) | 0 (0 %) | 3 (1 %) | 90 (19 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 10 (2 %) | 50 |
| 5–9 | 2319 | 1694 (73 %) | 0 (0 %) | 355 (15 %) | 212 (9 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 58 (3 %) | 44 |
| 10–13 | 6910 | 5705 (83 %) | 0 (0 %) | 220 (3 %) | 1066 (15 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 6 |

**Bot ohne Kategorie, Budget 30 %**

| Stufen | EP gesamt | kill | tower | base | wave | budget | lager | trade | bounty | passive | andere | Partien |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1–4 | 468 | 355 (76 %) | 0 (0 %) | 3 (1 %) | 90 (19 %) | 17 (4 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 3 (1 %) | 50 |
| 5–9 | 2320 | 1467 (63 %) | 0 (0 %) | 354 (15 %) | 86 (4 %) | 271 (12 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 142 (6 %) | 47 |
| 10–13 | 6934 | 5406 (78 %) | 0 (0 %) | 447 (6 %) | 947 (14 %) | 233 (3 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 6 |

**Wirtschafts-Bot, Regel (50 %)**

| Stufen | EP gesamt | kill | tower | base | wave | budget | lager | trade | bounty | passive | andere | Partien |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1–4 | 469 | 352 (75 %) | 0 (0 %) | 3 (1 %) | 90 (19 %) | 19 (4 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 5 (1 %) | 50 |
| 5–9 | 2315 | 1291 (56 %) | 0 (0 %) | 433 (19 %) | 46 (2 %) | 533 (23 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 12 (1 %) | 48 |
| 10–13 | 6918 | 4808 (69 %) | 0 (0 %) | 397 (6 %) | 864 (12 %) | 724 (10 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 125 (2 %) | 27 |

**Militär-Bot (0 %)**

| Stufen | EP gesamt | kill | tower | base | wave | budget | lager | trade | bounty | passive | andere | Partien |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1–4 | 472 | 365 (77 %) | 0 (0 %) | 3 (1 %) | 100 (21 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 4 (1 %) | 50 |
| 5–9 | 2315 | 1668 (72 %) | 0 (0 %) | 635 (27 %) | 64 (3 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 30 |
| 10–13 | 6928 | 5819 (84 %) | 0 (0 %) | 102 (1 %) | 1060 (15 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 4 |

**Verteidigungs-Bot (25 %)**

| Stufen | EP gesamt | kill | tower | base | wave | budget | lager | trade | bounty | passive | andere | Partien |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1–4 | 471 | 358 (76 %) | 0 (0 %) | 2 (0 %) | 100 (21 %) | 13 (3 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 50 |
| 5–9 | 2316 | 1427 (62 %) | 17 (1 %) | 390 (17 %) | 108 (5 %) | 269 (12 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 105 (5 %) | 48 |
| 10–13 | 6918 | 5410 (78 %) | 74 (1 %) | 252 (4 %) | 998 (14 %) | 160 (2 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 24 (0 %) | 11 |

### Schalter und Werkzeuge

- `node tools/sim-p5.mjs --suite felder --budget <n>`: fester Budgetanteil in Prozent für jeden Bot (Regler mit den Stufen 0 und n %; der Kurs folgt zwischen den Stützstellen des Reglers linear).
- `node tools/messung-k12.mjs`: Reihen je Bot und Budget; `node tools/basis-k12.mjs`: Tabellen dieses Berichts.
- Die Simulation hält je erreichter Schwelle die EP je Quelle fest (`stufenSrc`).

### Annahmen und Grenzen

- Messbasis ist der Bot im Profil durchschnitt, Normal. Aktiv und gelegentlich sind nicht gemessen.
- Die Siegquote schwankt bei 50 Partien um etwa ±7 Prozentpunkte.
- Die Abstände auf Stufe 10 und 13 beruhen auf den Partien, die so weit kamen (Auswahl: schnelle Partien).


## 2 Kalibrierung (X.4)

Sieben Runden mit je 50 bis 100 Partien je Arm (Bot ohne Kategorie und Wirtschafts-Bot, Normal, durchschnitt, feste Budgets). Die Abbruchregel lässt drei Schritte zu; ab dem vierten wurde auf Korridor und Rückstau kalibriert, die Elastizität blieb offen. Runde 1–2: E0 und Kurs im Bereich g ≤ 1,2; Runde 3: alle vier Bots mit der Konfiguration von Runde 2; Runde 4–5: niedrigerer Kurs, mehr Partiedauer, dann g = 1,3; Runde 6: Kurs 1,0 (schlechter); Runde 7: E0 und g feinjustiert.

Kennzahlen bei Budget 30 % (Wirtschafts-Bot: gleiches Budget; „gebremst“: Wahl wartet über 5 s auf den Mindestabstand; „Rückstau ≤ 1“: Anteil der Partien mit höchstens einer offenen Wahl):

| Runde | Kandidat | E0 | g | Kurs | basisFaktor | ohne 0 %: Wahlen | ohne 30 %: Wahlen · Dauer · gebremst · Rückstau ≤ 1 | Wirtschaft 30 %: Wahlen · gebremst · Rückstau ≤ 1 · Siege |
|---|---|---|---|---|---|---|---|---|
| 1 | e150g112k20 | 150 | 1,12 | 0,2 | 9,5 | 13 | 15 · 13:33 · 48 % · 18 % | – |
| 1 | e150g112k80 | 150 | 1,12 | 0,8 | 9,5 | 13 | 16 · 12:37 · 82 % · 2 % | – |
| 1 | e150g120k40 | 150 | 1,2 | 0,4 | 9,5 | 11 | 13 · 13:17 · 27 % · 64 % | – |
| 1 | e250g120k40 | 250 | 1,2 | 0,4 | 9,5 | 9 | 11 · 13:42 · 16 % · 84 % | – |
| 1 | e250g120k80 | 250 | 1,2 | 0,8 | 9,5 | 9 | 11 · 12:53 · 12 % · 94 % | – |
| 2 | e200g120k100 | 200 | 1,2 | 1 | 9,5 | 11 | 13 · 12:15 · 30 % · 94 % | – |
| 2 | e280g120k100 | 280 | 1,2 | 1 | 9,5 | 9 | 11 · 12:55 · 15 % · 96 % | – |
| 2 | e350g120k100 | 350 | 1,2 | 1 | 9,5 | 8 | 10 · 12:45 · 13 % · 96 % | – |
| 3 | c3a | 280 | 1,2 | 1 | 10,5 | 9 | 11 · 12:54 · 13 % · 96 % | 13 · 31 % · 69 % · 100 % |
| 4 | c4a | 250 | 1,2 | 0,45 | 11,5 | 10 | 11 · 14:15 · 18 % · 82 % | 13 · 19 % · 69 % · 97 % |
| 4 | c4c | 250 | 1,2 | 0,7 | 11 | 10 | 11 · 13:32 · 14 % · 94 % | 13 · 26 % · 65 % · 100 % |
| 5 | c5a | 250 | 1,2 | 0,7 | 10,5 | 10 | 11 · 13:31 · 15 % · 91 % | 14 · 28 % · 67 % · 100 % |
| 5 | d1 | 150 | 1,3 | 0,7 | 10,5 | 10 | 11 · 13:13 · 10 % · 100 % | 12 · 17 % · 95 % · 100 % |
| 5 | d2 | 100 | 1,33 | 0,7 | 10 | 10 | 12 · 12:43 · 20 % · 99 % | 13 · 32 % · 84 % · 99 % |
| 6 | d3 | 120 | 1,3 | 1 | 10,5 | 10 | 12 · 12:35 · 29 % · 93 % | 14 · 49 % · 63 % · 100 % |
| 6 | d4 | 150 | 1,3 | 1 | 11 | 10 | 11 · 13:02 · 19 % · 98 % | 13 · 34 % · 84 % · 99 % |
| 7 | d5 | 125 | 1,3 | 0,7 | 10,5 | 10 | 11 · 12:58 · 15 % · 99 % | 13 · 25 % · 91 % · 100 % |
| 7 | d6 | 140 | 1,27 | 0,7 | 10,5 | 11 | 11 · 13:08 · 19 % · 98 % | 14 · 27 % · 82 % · 99 % |

Befunde:
- **g ≤ 1,2 verfehlt den Rückstau des Wirtschafts-Bots in jeder Variante** (65–73 %, größter Wert 4–6; Teil 11: 94 %, größter Wert 2). Die Multiplikatoren (Akademie ×1,5, Stiftungshaus ×2, Lehrjahre ×1,25) heben seine EP so, dass bei flacher Kurve mehr als eine Schwelle je 40 s fällt.
- **Ein Kurs über 0,7 verschlechtert alles** (d3, d4): mehr gebremste Wahlen, Wirtschafts-Bot bis 49 % gebremst, Rückstau 63 %.
- **E0 = 125 statt 150** (d5 gegen d1) bringt eine zusätzliche Wahl für den Bot ohne Kategorie bei Budget 40 % (12 statt 11) und die erste Karte nach 97 s statt 117 s (Teil 11: 76 s).
- **Die erste Karte kommt später:** Median 97 s (Teil 11: 76 s), die zweite nach 158 s (119 s), die dritte nach 205–213 s (163 s). Mit E0 = 70 wäre sie früher, der Rückstau aber wieder bei 80 %.

## 3 Kostenkurve (X.1, K12.02)

`KARTEN.schwellen = { start: 125, wachstum: 1.3 }`: E(n) = 125 · 1,3^(n−1). Unit-Test `tests/kosten12.test.mjs` (Kosten, Summen, Faktor je Wahl, Obergrenze von g, Standardmodus unverändert). Die Regeln zu Übertrag, Verfall und „ein EP-Schub löst höchstens einen Aufstieg aus“ gelten unverändert.

| n | Kosten Teil 11 (70 · 1,35^(n−1)) | Kosten Teil 12 (125 · 1,3^(n−1)) | kumuliert Teil 11 | kumuliert Teil 12 |
|---|---|---|---|---|
| 1 | 70 | 125 | 70 | 125 |
| 2 | 95 | 163 | 165 | 288 |
| 3 | 128 | 211 | 292 | 499 |
| 4 | 172 | 275 | 464 | 773 |
| 5 | 233 | 357 | 697 | 1130 |
| 6 | 314 | 464 | 1011 | 1595 |
| 7 | 424 | 603 | 1434 | 2198 |
| 8 | 572 | 784 | 2006 | 2982 |
| 9 | 772 | 1020 | 2779 | 4002 |
| 10 | 1043 | 1326 | 3821 | 5327 |
| 11 | 1407 | 1723 | 5229 | 7051 |
| 12 | 1900 | 2240 | 7129 | 9291 |
| 13 | 2565 | 2912 | 9694 | 12203 |
| 14 | 3463 | 3786 | 13157 | 15989 |
| 15 | 4675 | 4922 | 17832 | 20911 |
| 16 | 6311 | 6398 | 24143 | 27309 |
| 17 | 8520 | 8318 | 32663 | 35627 |
| 18 | 11502 | 10813 | 44165 | 46440 |
| 19 | 15528 | 14057 | 59692 | 60497 |
| 20 | 20962 | 18274 | 80655 | 78771 |

## 4 Kurs des Forschungsbudgets (X.2, K12.03)

Grundwert 0,7 EP je Material (vorher 0,08), Regler 0 / 10 / 20 / 30 / 40 / 50 % mit den Faktoren 1 / 1 / 0,95 / 0,9 / 0,85 / 0,8. Der Kurs bleibt degressiv; bei 50 % beträgt er 80 % des Kurses bei 10 % (verlangt: mindestens 50 %). Die Multiplikatoren wirken unverändert.

**Vorher** (Regler 0 / 25 / 50 %, Zwischenwerte linear):

| Anteil | ohne | Akademie | Stiftungshaus | Lehrjahre II | alle drei | Kurs relativ zum kleinsten Anteil |
|---|---|---|---|---|---|---|
| 10 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 20 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 25 % | 0,080 | 0,120 | 0,160 | 0,100 | 0,300 | 100 % |
| 30 % | 0,075 | 0,113 | 0,150 | 0,094 | 0,282 | 94 % |
| 40 % | 0,066 | 0,098 | 0,131 | 0,082 | 0,246 | 82 % |
| 50 % | 0,056 | 0,084 | 0,112 | 0,070 | 0,210 | 70 % |

Stützstellen des Reglers: 0 % → Faktor 1, 25 % → Faktor 1, 50 % → Faktor 0.7; Zwischenwerte linear (nur Messung).

**Nachher:**

| Anteil | ohne | Akademie | Stiftungshaus | Lehrjahre II | alle drei | Kurs relativ zum kleinsten Anteil |
|---|---|---|---|---|---|---|
| 10 % | 0,700 | 1,050 | 1,400 | 0,875 | 2,625 | 100 % |
| 20 % | 0,665 | 0,997 | 1,330 | 0,831 | 2,494 | 95 % |
| 25 % | 0,648 | 0,971 | 1,295 | 0,809 | 2,428 | 93 % |
| 30 % | 0,630 | 0,945 | 1,260 | 0,788 | 2,363 | 90 % |
| 40 % | 0,595 | 0,893 | 1,190 | 0,744 | 2,231 | 85 % |
| 50 % | 0,560 | 0,840 | 1,120 | 0,700 | 2,100 | 80 % |

**Kombinationstest (alle Multiplikatoren zugleich).** Lehrjahre Stufe 2 von Beginn an, Akademie und Stiftungshaus, sobald die Universität steht (`--kombi alle`), 100 Partien je Arm, Normal, durchschnitt:

Je Zelle: Siege · Dauer · Wahlen · gebremste Wahlen · Partien mit höchstens einer offenen Wahl · größter Rückstau.

| Bot | Budget | ohne Kombination (Regelmessung, Teil 12) | alle Multiplikatoren | alle Multiplikatoren, Kurs sinkt mit der Summe (abnahme 3000) | abnahme 8000 |
|---|---|---|---|---|---|
| ohne | 30 % | 99 % · 12:58 · 11 · 15 % · 99 % · 2 | 99 % · 11:34 · 13 · 55 % · 47 % · 3 | 99 % · 11:45 · 12 · 46 % · 73 % · 3 | 98 % · 11:42 · 13 · 50 % · 61 % · 3 |
| ohne | 50 % | 97 % · 13:12 · 12 · 27 % · 93 % · 2 | 99 % · 11:39 · 14 · 66 % · 0 % · 4 | – | – |
| wirtschaft | 30 % | 100 % · 13:32 · 13 · 25 % · 91 % · 2 | 99 % · 11:54 · 15 · 69 % · 16 % · 4 | 100 % · 12:19 · 13 · 51 % · 58 % · 3 | 100 % · 12:12 · 13 · 56 % · 30 % · 3 |
| wirtschaft | 50 % | 99 % · 13:15 · 14 · 46 % · 75 % · 5 | 100 % · 12:08 · 15 · 75 % · 0 % · 6 | – | – |

**Ergebnis: Das Kriterium ist verfehlt.** Mit allen drei Multiplikatoren (Kurs ×3,75, bei 10 % Budget 2,6 EP je Material; dazu ×1,6 auf alle EP) fällt der Anteil der Partien mit höchstens einer offenen Wahl bei 30 % Budget auf 47 % (ohne Kategorie) und 16 % (Wirtschaft), bei 50 % auf 0 %; der größte Rückstau steigt auf 4 bis 6 (Grenze: 2). Der Mindestabstand bremst dann 55–75 % der Wahlen. Der Hebel `abnahme` (Kurs sinkt mit der Summe der Budget-EP, Teil 8) löst das nicht: Er hebt den Anteil auf 30–73 %, nicht über die Grenze von 90 %.

Die Kombination ist ein Extremfall (alle drei Karten von Beginn an); der Wirtschafts-Bot erreicht sie in der Praxis nur teilweise (Regelmessung: 91 % mit höchstens einer offenen Wahl). Ein Deckel auf den Gesamtfaktor des Kurses würde ihn beseitigen, ändert aber die relative Wirkung der Multiplikatoren (Anforderung: bleibt unverändert); das ist eine Entscheidung des PO.

## 5 Preis der nächsten Karte (X.5, K12.04)

Reiter Universität und Tooltip des Stapels nennen zwei Zeilen: „Nächste Karte ≈ N Material“ (fehlende EP geteilt durch den Kurs einschließlich Lehrjahre) und „+10 %: nächste Karte ≈ N s früher“ (Zeit mit der nächsten Reglerstufe gegen jetzt, begrenzt durch den Mindestabstand; hält er die Karte zurück, steht „Mindestabstand hält die Karte zurück“). Grundlage ist die gleitende EP-Rate der Leiste (30 s), ohne den heutigen Budgetanteil. Rechnung in `core.js` (`budgetVorschau`), Texte in `i18n`.
- Test `tests/preis12.test.mjs`: Preis, Zeit und Wirkung gegen die Simulation bei gleichbleibendem Einkommen (Abweichung unter 10 %; Messung: 1–2 %).
- Browser-Prüfung `tests/browser-y12.mjs`; Bildschirmfotos `docs/bilder/kartenpfad12-universitaet.png` und `docs/bilder/kartenpfad12-stapel-tooltip.png`.
- Grenze: Die Anzeige geht von gleichbleibender EP-Rate aus; der EP-Schub nach Minute 10 ist nicht vorhersehbar.

## 6 Budgetregel der Bots (X.3, K12.06)

Fester Anteil je Strategie (`KF_BROWSER_BOT.BUDGET_ANTEIL` in `tools/browser-bot.js`); der Bot stellt den Regler, sobald die Universität steht. Gewählt nach Abschnitt 7: Bot ohne Kategorie 40 % (der Korridor 12–16 Wahlen verlangt 12), Militär 20 %, Wirtschaft 30 %, Verteidigung 30 %. Die Preisregel („investieren, wenn die Karte billiger ist als die nächste Investition“) wurde nicht gebaut: Der feste Anteil erfüllt die Kriterien, die einfachere Regel gilt. Test `tests/botbudget12.test.mjs`.

Mittleres Budget je Bot und Zeitabschnitt (zeitgewichtet, Partien in Klammern). Die Phasen des Spiels (früh, mitte, spät) hängen an der Referenzkurve und liegen in den ersten fünf Minuten; deshalb nach Spielminute. Die Universität steht bei den Bots ab Minute 3; vorher gibt es kein Budget. Der Militär-Bot liegt knapp unter seinem Anteil, weil der Flügel Bibliothek das Budget auf 20 % deckelt oder die Universität zeitweise fehlt:

| Bot | Anteil der Regel | Minute 0–3 | Minute 3–6 | Minute 6–9 | Minute 9–12 | ab Minute 12 |
|---|---|---|---|---|---|---|
| ohne | 40 % | 0 % (100) | 36.7 % (100) | 40 % (100) | 40 % (100) | 40 % (84) |
| militaer | 20 % | 0 % (100) | 17.8 % (100) | 19.3 % (100) | 17.1 % (99) | 16.5 % (63) |
| wirtschaft | 30 % | 0 % (100) | 25.6 % (100) | 30 % (100) | 30 % (100) | 30 % (90) |
| verteidigung | 30 % | 0 % (100) | 26.8 % (100) | 30 % (100) | 30 % (100) | 30 % (84) |

## 7 Wirkung und Kalibrierung (K12.05)

Messung: Normal, durchschnitt, 100 Partien je Arm, feste Budgets 0 bis 50 %, vier Bots. „Regel“ = Arm mit dem Anteil der Budgetregel. Rohdaten `reports/kartenpfad12-nachher-d5-*`, Auswertung `reports/kartenpfad12-nachher-auswertung.md`.

| Kriterium | Ziel | Messwert | |
|---|---|---|---|
| Elastizität ab Stufe 10 (30 % gegen 0 %) | ≤ −30 % | gepaart 0 % (39 Paare), gepoolt 49 % | ✗ |
| Grundlinie Budget 0 %: Wahlen (ohne Kategorie) | 9–11 | 10 | ✓ |
| Korridor mit Regel: Wahlen · Dauer (ohne Kategorie) | 12–16 · 13–17 min | 12 · 13:10 | ✓ |
| Optimum im Inneren, ohne | > 0 % und < 50 % | 20 % (Siege 100 %, Dauer 12:55) | ✓ |
| Optimum im Inneren, militaer | > 0 % und < 50 % | 40 % (Siege 98 %, Dauer 12:26) | ✓ |
| Optimum im Inneren, wirtschaft | > 0 % und < 50 % | 40 % (Siege 100 %, Dauer 13:28) | ✓ |
| Optimum im Inneren, verteidigung | > 0 % und < 50 % | 50 % (Siege 99 %, Dauer 14:25) | ✗ |
| Strategieabhängigkeit: Optimum Wirtschaft > Militär | Wirtschaft höher | 40 % gegen 40 % | ✗ |
| Alternative, keine Pflicht, ohne | Abstand ≤ 10 pp | 3,0 pp | ✓ |
| Alternative, keine Pflicht, militaer | Abstand ≤ 10 pp | 4,0 pp | ✓ |
| Alternative, keine Pflicht, wirtschaft | Abstand ≤ 10 pp | 7,0 pp | ✓ |
| Alternative, keine Pflicht, verteidigung | Abstand ≤ 10 pp | 3,0 pp | ✓ |
| Mindestabstand bindet beim Optimum, ohne | ≤ 15 % | 12 % | ✓ |
| Mindestabstand bindet beim Optimum, militaer | ≤ 15 % | 17 % | ✗ |
| Mindestabstand bindet beim Optimum, wirtschaft | ≤ 15 % | 34 % | ✗ |
| Mindestabstand bindet beim Optimum, verteidigung | ≤ 15 % | 24 % | ✗ |
| Rückstau: Partien mit höchstens einer offenen Wahl | ≥ 90 % | 96 % | ✓ |
| Rückstau: größter Wert | ≤ 2 | 2 | ✓ |
| Takt: Variationskoeffizient (Median) | ≥ 0,25 | 0,33 | ✓ |
| Siegquote Wirtschafts-Bot (Regel) | ≥ 92 % | 100 % | ✓ |

| Bot | 0 % | 10 % | 20 % | 30 % | 40 % | 50 % | Regel |
|---|---|---|---|---|---|---|---|
| ohne (Siege · Dauer · Wahlen · gebremst) | 97 % · 14:10 · 10 · 22 % | 100 % · 13:15 · 10 · 13 % | 100 % · 12:55 · 10 · 12 % | 99 % · 12:58 · 11 · 15 % | 100 % · 13:10 · 12 · 18 % | 97 % · 13:13 · 12 · 27 % | 100 % · 13:10 · 12 · 18 % |
| militaer (Siege · Dauer · Wahlen · gebremst) | 94 % · 13:38 · 8 · 12 % | 96 % · 12:27 · 9 · 9 % | 97 % · 12:21 · 9 · 11 % | 97 % · 12:34 · 10 · 13 % | 98 % · 12:26 · 10 · 17 % | 95 % · 13:03 · 10 · 25 % | 97 % · 12:21 · 9 · 11 % |
| wirtschaft (Siege · Dauer · Wahlen · gebremst) | 93 % · 15:57 · 11 · 22 % | 98 % · 14:25 · 11 · 15 % | 100 % · 14:06 · 12 · 18 % | 100 % · 13:32 · 13 · 25 % | 100 % · 13:28 · 13 · 34 % | 99 % · 13:15 · 14 · 46 % | 100 % · 13:32 · 13 · 25 % |
| verteidigung (Siege · Dauer · Wahlen · gebremst) | 96 % · 15:49 · 11 · 23 % | 97 % · 14:25 · 11 · 14 % | 96 % · 13:55 · 11 · 14 % | 98 % · 14:08 · 11 · 14 % | 97 % · 13:43 · 12 · 17 % | 99 % · 14:25 · 12 · 24 % | 98 % · 14:08 · 11 · 14 % |

Abstand bis zur nächsten Wahl je Stufe (Bot ohne Kategorie, Median in s, Partien in Klammern)

| Stufe | 0 % | 10 % | 20 % | 30 % | 40 % | 50 % |
|---|---|---|---|---|---|---|
| 2 | 50,8 (100) | 45,6 (100) | 42,6 (100) | 41,6 (100) | 40,8 (100) | 40,5 (100) |
| 3 | 122,4 (100) | 63,2 (100) | 40,8 (100) | 40,0 (100) | 40,0 (100) | 40,0 (100) |
| 4 | 97,4 (100) | 85,8 (100) | 61,6 (100) | 43,3 (100) | 40,0 (100) | 40,0 (100) |
| 5 | 98,6 (100) | 78,4 (100) | 70,0 (100) | 60,2 (100) | 43,9 (100) | 40,0 (100) |
| 6 | 76,8 (94) | 81,9 (100) | 69,6 (100) | 65,2 (100) | 58,6 (100) | 47,7 (100) |
| 7 | 40,1 (91) | 78,4 (97) | 80,7 (100) | 66,0 (100) | 65,5 (100) | 58,2 (100) |
| 8 | 40,1 (77) | 57,1 (87) | 83,4 (97) | 76,9 (100) | 74,7 (100) | 63,4 (100) |
| 9 | 40,1 (68) | 40,1 (70) | 56,3 (75) | 74,7 (90) | 80,2 (98) | 70,8 (100) |
| 10 | 40,1 (38) | 40,1 (46) | 46,8 (48) | 53,7 (63) | 73,2 (83) | 72,2 (93) |
| 11 | 73,7 (14) | 47,3 (15) | 62,4 (22) | 55,3 (42) | 60,7 (58) | 67,2 (69) |
| 12 | 107,8 (2) | 90,9 (2) | 51,1 (4) | 70,6 (13) | 56,6 (30) | 62,0 (35) |

### Bewertung der Kriterien

- **Erfüllt:** Grundlinie (10 Wahlen bei 0 %), Korridor (12 Wahlen, 13:10 min, Regel 40 %), Optimum im Inneren für Bot ohne Kategorie (20 %), Militär (40 %) und Wirtschaft (40 %), Alternative-keine-Pflicht (größter Abstand 7 Punkte, Wirtschaft), Rückstau (96 % mit höchstens einer offenen Wahl, größter Wert 2, Teil 11: 87 % und 3), Takt (Variationskoeffizient 0,33), Wirtschafts-Bot 100 % Siege (Teil 11: 80 %).
- **Verfehlt, Elastizität ab Stufe 10 (30 %):** gemessen 0 % (gepaart nach Seed, 39 Paare). Bei Budget 0 % liegt der Abstand ab Stufe 7 schon am Mindestabstand (40,1 s), weil der Spieler dem EP-Schub hinterherläuft und Schwellen nachholt; mit Budget ist er der Kurve voraus und wartet auf die EP (54–73 s). Der Abstand auf derselben Stufe wird mit Budget deshalb länger, nicht kürzer. Die Wirkung liegt davor: Abstand Stufe 3: 122 s → 40 s (−67 %), Stufe 5: 99 s → 60 s (−39 %), Stufe 6: 77 s → 65 s (−15 %). Als Zeit bis zur Wahl n gemessen (Tabelle oben): Wahl 6 nach 543 s statt 352 s (−35 %), Wahl 8 nach 670 s statt 490 s (−27 %), Wahl 10 nach 759 s statt 639 s (−16 %; die Wahl erreichen 68 % der Partien ohne und 90 % mit Budget). Das Kriterium misst den Abstand auf einer Stufe; das Maß „Zeit bis zur Stufe n“ zeigt die Wirkung des Budgets besser.
- **Verfehlt, Optimum Verteidigung** (50 % statt im Inneren): Die Siegquoten liegen bei 96–99 % in allen Armen; die Reihung entscheidet die Dauer und damit der Zufall (Rauschen ± 3–5 Punkte).
- **Verfehlt, Strategieabhängigkeit:** Optimum Wirtschaft und Militär je 40 %. Die Siegquoten der Arme 20–50 % liegen beim Militär-Bot bei 95–98 % (Rauschen), beim Wirtschafts-Bot bei 99–100 %. Die Regeln (Wirtschaft 30 %, Militär 20 %) unterscheiden sich; das gemessene Optimum nicht.
- **Verfehlt, Mindestabstand beim Optimum ≤ 15 %:** Militär 17 %, Verteidigung 24 %, Wirtschaft 34 % (beim jeweils gemessenen Optimum 40–50 %); bei den Regelbudgets 11 % (Militär), 14 % (Verteidigung), 18 % (ohne Kategorie), 25 % (Wirtschaft). Die gebremsten Wahlen liegen in der Spätphase, wenn der EP-Schub eine Stufe in unter 40 s bezahlt.
- **Gebremste Wahlen bis Stufe 6** (Abschnitt 5.4 der Anforderung): bei den Regelbudgets 28 % (ohne Kategorie), 9 % (Militär), 26 % (Wirtschaft), 18 % (Verteidigung); bei Budget 0 % 3–5 %. Hohes Budget macht die ersten Karten so billig, dass der Mindestabstand sie bremst; bei 30 % und mehr greift er in jeder fünften früheren Wahl.
- **EP-Kanäle:** Lagerzehnt und Freihandel liefern 0 bis 3 %; die Grenze von 40 % ist nicht berührt. Das Forschungsbudget selbst liefert bei 30 % Budget 61 % (ohne Kategorie) bis 73 % (Wirtschaft) der EP in den Stufen 5–9 und 31 % bis 66 % in den Stufen 10–13 (Teil 11: 12 % und 3 %).

### Vorher-nachher (Regel des Bots, Normal, durchschnitt)

Teil 11: Regeln Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %, ohne Kategorie 0 % (50 Partien); Teil 12: Regeln wie oben (100 Partien).

| Bot | Teil 11 (Regel): Siege · Dauer · Wahlen · gebremst · Rückstau ≤ 1 · größter | Teil 12 (Regel): Siege · Dauer · Wahlen · gebremst · Rückstau ≤ 1 · größter |
|---|---|---|
| ohne | 96 % · 13:31 · 11 · 25 % · 80 % · 3 | 100 % · 13:10 · 12 · 18 % · 97 % · 2 |
| militaer | 96 % · 13:12 · 9 · 22 % · 80 % · 3 | 97 % · 12:21 · 9 · 11 % · 96 % · 2 |
| wirtschaft | 80 % · 15:33 · 13 · 22 % · 94 % · 2 | 100 % · 13:32 · 13 · 25 % · 91 % · 2 |
| verteidigung | 98 % · 15:18 · 12 · 22 % · 92 % · 2 | 98 % · 14:08 · 11 · 14 % · 99 % · 2 |

### Stabilität (Bot ohne Kategorie, alle Felder, Regel 40 %)

Patt-Quote **0,0 %** (0 von 450 Partien) und mit `?druck=hoch` (Normal, Schwer) **0,0 %** (0 von 300). Grenzen: 1,5 % und 3 %; Teil 11: 0,0 % und 0,3 %. Rohdaten `reports/kartenpfad12-nachher-patt-*`. Siegquote, Dauer, Wahlen und Rückstau in allen Feldern (Teil 11 in Klammern bei Siegquote und Rückstau):

| Grad | Profil | Siege (Teil 11) | Dauer | Wahlen | Rückstau ≤ 1 (Teil 11) |
|---|---|---|---|---|---|
| Leicht | aktiv | 100 % (100 %) | 12:20 | 10 | 100 % (82 %) |
| Leicht | durchschnitt | 98 % (100 %) | 13:13 | 10 | 98 % (58 %) |
| Leicht | gelegentlich | 96 % (92 %) | 13:24 | 11 | 60 % (86 %) |
| Normal | aktiv | 100 % (98 %) | 12:07 | 11 | 96 % (84 %) |
| Normal | durchschnitt | 100 % (96 %) | 13:13 | 11 | 94 % (80 %) |
| Normal | gelegentlich | 96 % (70 %) | 13:16 | 12 | 94 % (76 %) |
| Schwer | aktiv | 100 % (98 %) | 12:28 | 11 | 16 % (46 %) |
| Schwer | durchschnitt | 84 % (80 %) | 13:27 | 12 | 42 % (34 %) |
| Schwer | gelegentlich | 0 % (0 %) | 1:32 | 0 | 100 % (100 %) |

Auffällig: In Schwer fällt der Rückstau bei den Profilen aktiv (16 %) und durchschnitt (42 %) deutlich schlechter aus als in Normal; der EP-Schub der größeren Wellen bezahlt dort mehrere Stufen auf einmal. Die Anforderung misst Normal. „Schwer, gelegentlich“ verliert wie in Teil 11 nach 1:32 min (kein Wert dieses Teils).

## 8 Zielkonflikte

| Ziel | Konflikt | Folge |
|---|---|---|
| Elastizität ab Stufe 10 ≥ 30 % | Mindestabstand 40 s und EP-Schub ab Minute 10 (20–30 EP/s) | Mit Budget liegt der Spieler vor der Kurve; der Abstand auf einer Stufe wird länger. Erreichbar nur mit höheren Kosten ab Stufe 9 (g über 1,3) oder niedrigerem Schub. |
| g ≤ 1,20 | Rückstau und gebremste Wahlen des Wirtschafts-Bots | g = 1,3 gewählt |
| Erste Karte früh (Teil 11: 76 s) | Korridor und Rückstau verlangen E0 ≥ 125 | erste Karte nach etwa 100 s |
| Optimum Wirtschaft > Militär | Siegquoten im Rauschen (95–100 %) | nicht messbar; Regeln unterscheiden sich |
| Mindestabstand beim Optimum ≤ 15 % | Korridor 12–16 Wahlen verlangt hohes Budget | 18–25 % bei den Regeln von Ohne-Kategorie und Wirtschaft |

## 9 Offene Punkte und Grenzen

- **Entscheidung des PO:** (1) g = 1,3 oder g ≤ 1,20 (dann Rückstau 65–69 % beim Wirtschafts-Bot); (2) Kurs-Grundwert 0,7 und Regler bis 50 %; (3) Elastizitätskriterium streichen oder auf „Zeit bis zur Wahl n“ umstellen; (4) Deckel auf den Gesamtfaktor des Kurses, um den Kombinationstest zu bestehen (ändert die relative Wirkung der Multiplikatoren); (5) Mindestabstand in den ersten sechs Stufen (bei hohem Budget bremst er 14–26 % dieser Wahlen).
- **Erste Karte nach 100 s** statt nach 76 s; im Tutorial entfällt die Verzögerung (Kriegsbeute hebt die EP nach der ersten Welle auf die erste Schwelle).
- Mindestabstand in der frühen Phase: Bei Budget ab 30 % greift er in jeder fünften Wahl bis Stufe 6. Eine Absenkung liegt außerhalb des Umfangs; der Bericht gibt die Zahl.
- Bots wählen ihr Budget nach festen Anteilen; der Mensch zeigt erst der Spieltest. Das Maß der Siegquote hat bei 100 Partien ein Rauschen von ± 3–5 Punkten.
- Nicht gemessen: Budget-Arme für die Profile aktiv und gelegentlich sowie Leicht und Schwer (nur die Regelmessung im Patt-Test), Telefon (375 px). In Schwer ist der Rückstau hoch (aktiv 16 % der Partien mit höchstens einer offenen Wahl, durchschnitt 42 %; Teil 11: 46 % und 34 %).
- Die Rohdaten der Kalibrierrunden (rund 55 MB, Runde 1–7) liegen nicht im Repository; `tools/kalib-k12.mjs` erzeugt sie neu, die Kennzahlen stehen in der Tabelle von Abschnitt 2 (`reports/kartenpfad12-kandidaten.md`).

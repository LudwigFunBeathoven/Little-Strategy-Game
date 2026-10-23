# Bericht Kartenpfad Teil 12: EP als Investition

Branch `exp/kartenpfad` · Ausgangsstand v0.9.2-kartenpfad-11 (Code `47152d5`) · Anforderung `docs/anforderungen-kartenpfad-12.md` · Rohdaten `reports/kartenpfad12-basis-*`.

Dieser Bericht wächst mit den Inkrementen. Stand: **X.0 (Basismessung, K12.01)**.

## 1 Basismessung und Diagnose (X.0, K12.01)

### Ergebnis

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

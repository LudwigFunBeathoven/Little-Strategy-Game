# Anforderungen Branch Kartenpfad, Teil 12: EP als Investition

Stand: 23.10.2026 · Product Owner: Nick · Planung: Cowork · Umsetzung: Claude Code

- Branch `exp/kartenpfad`, Ausgangsstand v0.9.2-kartenpfad-11, Spielstand-Version 14.
- Ablage: `docs/anforderungen-kartenpfad-12.md`.
- Kürzel: REQ-K12, Commits `X.<n>`.

## 1. Ziel und Umfang

**Ziel:** Investition in EP ist eine echte Alternative zu Gebäuden, Technologien und Einheiten. Der Spieler hat in jeder Phase der Partie einen Grund, über das Forschungsbudget in EP zu investieren. Die Kosten einer Karte steigen exponentiell.

**Befund des PO aus eigenen Partien:**
- Vor Teil 10 (Kurve aus Teil 9): Der Spieler wartete fast immer auf den Mindestabstand. Mehr Budget brachte deshalb keine Karte früher.
- Nach Teil 10 (Kurve C2): Ab Stufe 10 dauern die Karten deutlich zu lange. Ein gesetztes Forschungsbudget macht keinen spürbaren Unterschied mehr.

In beiden Lagen war der Grenznutzen einer zusätzlichen Investition in EP nahe null. Einmal deckelte der Mindestabstand, einmal waren Kurs und Kurve im Verhältnis zueinander zu schlecht. Teil 12 sucht den Bereich dazwischen: Mehr Investition bringt spürbar früher eine Karte, und der Mindestabstand greift nur selten.

Die Spielregeln im Modus `standard` bleiben unverändert (Golden-Test).

**Nicht im Umfang**
- Mindestabstand: Er bleibt bei 40 s. Eine Absenkung in der frühen Phase ist offen (Abschnitt 5).
- Werte der Karten, Synergien und Doktrinen.
- Obergrenze der Manufakturen, Flügel, Druckkurve, Phasenmechanik, Epochen.
- Lagerzehnt und Freihandel bleiben in ihren Regeln unverändert; ihre Wirkung wird mitgemessen.

## 2. Anforderungen

### REQ-K12.01 Basismessung und Diagnose

Messung auf dem Stand nach Teil 11 (Kurve C2):

- **EP je Quelle und Stufe:** Abschüsse, Basisschaden, abgewehrte Wellen, Forschungsbudget, Lagerzehnt, Freihandel, Sonstige.
- **Kurs des Forschungsbudgets:** EP je Material in Abhängigkeit vom Anteil, in allen Stufen des Reglers, ohne und mit Akademie, Stiftungshaus und Lehrjahre Stufe 2.
- **Materialpreis der nächsten Karte je Stufe:** fehlende EP geteilt durch den Kurs. Berechnet für Budget 10, 20, 30 und 40 %.
- **Preisanstieg der übrigen Investitionen** zum Vergleich:
  - nächste Manufaktur je Anzahl,
  - Qualitätsstufen der Schmiede,
  - Quartiere,
  - typische Einheit.

  Daraus folgt je Investition ein mittlerer Wachstumsfaktor je Kauf.
- **Elastizität:** Abstand bis zur nächsten Wahl auf Stufe 5, 10 und 13 bei fest eingestelltem Budget 0, 10, 20, 30 und 40 %.

Akzeptanzkriterien:
- [Bot] Tabellen im Bericht; Rohdaten unter `reports/kartenpfad12-basis-*`.
- [Bot] Befund: Welcher Faktor begrenzt die Wirkung des Budgets nach Stufe 10 – die Kurve, der Kurs oder beide?
- [Bot] Simulationsschalter `--budget <n>` (fester Budgetanteil) für alle Bots.

### REQ-K12.02 Exponentielle Kostenkurve

Kosten der Stufe n:

    E(n) = E0 · g^(n−1)

Anforderungen:
- E0 und g werden so kalibriert, dass die Kriterien aus K12.05 erfüllt sind.
- **Leitwert für g:** Der Materialpreis einer Karte bei mittlerem Budget (20 %) wächst etwa so schnell wie der mittlere Preisanstieg der übrigen Investitionen aus K12.01. Abweichungen sind zulässig, wenn K12.05 es verlangt, und werden im Bericht begründet.
- Zulässiger Bereich: g zwischen 1,08 und 1,20.
- Die Regeln zu Übertrag, Verfall und „ein EP-Schub löst höchstens einen Aufstieg aus“ aus Teil 10 bleiben.

Akzeptanzkriterium:
- [Bot] Unit-Test der Kostenkurve; Tabelle E(n) für n = 1 bis 20 im Bericht.

### REQ-K12.03 Kurs des Forschungsbudgets

- Der Kurs bleibt degressiv: Mehr Anteil bringt weiterhin weniger EP je Material.
- Die Degression wird so flach eingestellt, dass auch der höchste Anteil noch spürbar mehr Karten bringt.
- Mindestwert: Der Kurs bei maximalem Anteil beträgt mindestens 50 % des Kurses bei kleinstem Anteil.
- Multiplikatoren von Akademie, Stiftungshaus und Lehrjahre Stufe 2 bleiben in ihrer relativen Wirkung. Der Bericht zeigt, dass sie in Kombination keinen Rückstau erzeugen.

Akzeptanzkriterien:
- [Bot] Tabelle des Kurses vorher und nachher.
- [Bot] Test der Kombinationen mit allen Multiplikatoren gegen die Rückstau-Kriterien aus K10.05.

### REQ-K12.04 Preis der nächsten Karte sichtbar

Die Investitionsentscheidung braucht Preise, die sich vergleichen lassen.

- Der Reiter Universität (Forschungsbudget) zeigt den Materialpreis der nächsten Karte beim aktuellen Kurs, z. B. „Nächste Karte ≈ 420 Material“.
- Er zeigt außerdem die Wirkung der nächsten Stufe des Reglers, z. B. „+10 %: nächste Karte ≈ 25 s früher“.
- Der Tooltip des Stapels (Fortschritt zur nächsten Wahl) nennt dieselben beiden Werte.
- Texte nach R3, Platzhalter mit echten Werten (Darstellungstest aus K10.01).

Akzeptanzkriterien:
- [Bot] Test der Berechnung gegen die Simulation: Abweichung der angezeigten Zeit höchstens 10 % bei konstantem Einkommen.
- [Bot] Bildschirmfotos Reiter Universität und Stapel-Tooltip.
- [Mensch] Nick kann in der Partie den Preis der nächsten Karte mit dem der nächsten Manufaktur vergleichen.

### REQ-K12.05 Wirkung und Kalibrierung

Messung wie in Teil 10 und 11, ergänzt um Budget-Arme mit `--budget`.

Akzeptanzkriterien:
- [Bot] **Elastizität:** Ab Stufe 10 sinkt der Abstand bis zur nächsten Wahl bei Budget 30 % gegenüber 0 % um mindestens 30 % (Bot ohne Kategorie, Normal, durchschnitt).
- [Bot] **Grundlinie ohne Investition:** Bei Budget 0 % erzielt der Bot ohne Kategorie 9–11 Wahlen in der Partie (Normal, durchschnitt).
- [Bot] **Korridor mit Investition:** Mit dem Budget seiner Standardregel erzielt er 12–16 Wahlen bei 13–17 min.
- [Bot] **Optimum im Inneren:** Für jeden Bot liegt das Budget mit der höchsten Siegquote, bei Gleichstand mit der kürzesten Dauer, über 0 % und unter dem Maximum.
- [Bot] **Strategieabhängigkeit:** Das optimale Budget des Wirtschafts-Bots liegt höher als das des Militär-Bots.
- [Bot] **Alternative, keine Pflicht:** Die Siegquote jedes Bots bei Budget 0 % liegt höchstens 10 Prozentpunkte unter der bei seinem optimalen Budget.
- [Bot] **Mindestabstand selten bindend:** Er greift beim jeweils optimalen Budget in höchstens 15 % der Wahlen.
- [Bot] **Rückstau und Takt:** Kriterien aus K10.05 bleiben erfüllt (höchstens eine offene Wahl in 90 % der Partien, nie mehr als zwei; Variationskoeffizient der Abstände im Median mindestens 0,25).
- [Bot] **Wirtschafts-Bot:** Siegquote, Normal, durchschnitt, mindestens 92 % (Teil 11: 80 %).
- [Bot] **Stabilität:** Patt-Quote (Bot ohne Kategorie, alle Felder) höchstens 1,5 %, mit `?druck=hoch` höchstens 3 %.
- [Mensch] Nick spürt in der eigenen Partie, dass ein höheres Budget nach Stufe 10 Karten deutlich früher bringt, ohne regelmäßig auf den Mindestabstand zu warten.

### REQ-K12.06 Budgetregel der Bots

- Jeder Bot erhält eine einfache Budgetregel, die nach K12.05 das optimale Budget je Strategie annähert.
- Möglich ist ein fester Anteil je Strategie oder eine Regel nach Preisvergleich: in EP investieren, wenn die nächste Karte in Material billiger ist als die nächste geplante Investition.
- Die einfachere Regel wird gewählt, wenn beide die Kriterien erfüllen.

Akzeptanzkriterium:
- [Bot] Test der Regel; Bericht mit dem durchschnittlichen Budget je Bot und Phase.

### REQ-K12.07 Abschluss

- Bericht `docs/bericht-kartenpfad-12.md` mit Vorher-nachher-Tabellen.
- Testleitfaden `docs/testleitfaden-kartenpfad-12.md`: Leitfaden Teil 11, ergänzt um Fragen zur Investitionsentscheidung. Nutzt der Tester das Budget? Versteht er den Preis der nächsten Karte? Fühlt sich die Partie nach Stufe 10 zäh an?
- Textübersicht `docs/texte-kartenpfad.md` neu erzeugen; Stand in `docs/STAND-kartenpfad.md`.
- Spielstand-Version 15, falls sich das Format ändert.

Akzeptanzkriterien:
- [Bot] Golden-Test, Unit-Tests und Browser-Prüfpunkte grün.
- [Bot] Privater Testbuild.

## 3. Entscheidungen des PO

1. Die EP-Kosten je Karte folgen einer Exponentialfunktion.
2. Investition in EP soll eine Alternative zu Gebäuden, Technologien und Einheiten sein. Der Spieler soll durchgehend motiviert sein, in EP zu investieren.
3. Befund: Mit Kurve C2 macht das Forschungsbudget nach Stufe 10 keinen spürbaren Unterschied. Vorher wartete der Spieler meist auf den Mindestabstand.
4. Teil 12 kommt vor den Spieltest. Die Druckkurve wird zu Teil 13.

**Vorschläge von Cowork, die der PO noch bestätigen kann**
- Bereich für g (1,08 bis 1,20) und Leitwert „Gleichlauf mit den übrigen Investitionen“.
- Mindestwert des Kurses bei maximalem Anteil (50 %).
- Zielwerte K12.05, insbesondere Grundlinie 9–11 Wahlen ohne Budget, Elastizität 30 %, Wirtschafts-Bot 92 %.
- Preisanzeige der nächsten Karte (K12.04).

## 4. Inkrementplan mit Abbruchregel

| Commit | Inhalt | REQ |
|---|---|---|
| X.0 | Basismessung, Diagnose, Schalter `--budget` | K12.01 |
| X.1 | Exponentielle Kostenkurve | K12.02 |
| X.2 | Kurs des Forschungsbudgets | K12.03 |
| X.3 | Budgetregel der Bots | K12.06 |
| X.4 | Kalibrierung und Messung | K12.05 |
| X.5 | Preisanzeige | K12.04 |
| X.6 | Bericht, Testleitfaden, Testbuild | K12.07 |

**Abbruchregeln**

*Kalibrierung (X.4)*
- Lassen sich Elastizität und Korridor nach höchstens drei Kalibrierschritten (E0, g, Degression des Kurses) nicht gleichzeitig erfüllen, wird kalibriert, bis Korridor und Rückstau eingehalten sind. Die verbleibende Lücke bei der Elastizität wird mit einer Tabelle der Zielkonflikte berichtet. Der Stand gilt als vorläufig; der PO entscheidet.
- Der Mindestabstand wird nicht verändert.
- Karten werden nicht umgewertet.

*Andere EP-Kanäle*
- Werden Lagerzehnt oder Freihandel durch die neue Kurve zum dominanten EP-Kanal, also zu mehr als 40 % der EP eines Bots, wird das berichtet und nicht über deren Regeln korrigiert.

*Immer*
- Ein roter Golden-Test schließt jedes Inkrement aus.

## 5. Schwache Annahmen und offene Punkte

1. **Befund:** Er beruht auf wenigen Partien des PO. Bots wählen ihr Budget nach Regeln; das Verhalten von Menschen zeigt erst der Spieltest.
2. **Gleichlauf als Leitwert:** Der Wert einer Karte ist nicht konstant. Synergien steigen mit der Zahl der Karten einer Kategorie, spätere Karten können also mehr wert sein. Das spräche für ein höheres g. Die Kriterien in K12.05 entscheiden, nicht der Leitwert.
3. **Gedeckeltes Einkommen:** Die Obergrenze der Manufakturen begrenzt das Materialeinkommen. Jede exponentielle Kurve überholt ein gedeckeltes Einkommen irgendwann. Bei 15 Minuten und rund 15 Karten reicht ein flaches g; längere Partien (Epochen) brauchen eine Neubewertung.
4. **Mindestabstand in der frühen Phase:** Ob die ersten Karten schneller als alle 40 s kommen sollen, ist offen. Mit der exponentiellen Kurve sind frühe Karten billig; der Mindestabstand könnte dort zur einzigen Bremse werden. Der Bericht nennt den Anteil gebremster Wahlen bis Stufe 6 gesondert.
5. **Zielwerte:** Elastizität 30 % und Grundlinie 9–11 Wahlen sind gesetzt, nicht hergeleitet.

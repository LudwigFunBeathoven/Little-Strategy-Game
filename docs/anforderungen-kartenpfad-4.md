# Klammerfront – Anforderungen Branch „Kartenpfad“, Teil 4: Strategielinien, Gebäude-Aufwertung und Kartenpool

Stand: 10.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad-4.md` · Branch: `exp/kartenpfad`
Bezug: `docs/entwicklungsstand-planung.md` (Stand 10.10.2026, nach Teil 3), `docs/bericht-kartenpfad-3.md`, `docs/anforderungen-kartenpfad-3.md`

## 1. Ziel und Umfang

**Ziel:** Der Modus `karten` bekommt echte strategische Wege. Heute ist es fast immer richtig, alle Bauplätze mit Fabriken zu füllen und die Armee zu schicken. Verteidigung lohnt nicht, und Karten, die das Bauen verbilligen, laufen nach zwei Minuten ins Leere. Teil 4 setzt drei Hebel:

1. **Gebäude-Aufwertung als Verzweigung:** Jedes Grundgebäude lässt sich in eine von zwei oder drei Varianten aufwerten. Bauen bleibt damit über die ganze Partie eine Entscheidung.
2. **Strategielinien Militär, Wirtschaft, Verteidigung:** Karten und Gebäude-Varianten tragen ein Zeichen ihrer Linie. Wer genug Zeichen einer Linie sammelt, schaltet deren Boni frei. Die Linie ist eine implizite Entscheidung; es gibt kein eigenes Menü dafür.
3. **Kartenpool und Pacing nachschärfen:** Entscheidungen C1 bis C5 aus der Planung, Streichung der Baukosten-Karten, Schlüsselkarten, die tatsächlich erscheinen.

Danach folgt der Spieltest mit Menschen.

**Im Umfang:** REQ-S.01 bis S.09.

**Nicht im Umfang:**

- Druckkurve der Gegner und Rolle der Belagerung (Entscheidung B4: erst testen). Nur ein Testschalter (S.08).
- Wachsendes Bauraster; das Raster bleibt 3×3.
- Leistungsoptimierung (nur Messung, S.09).
- Neue Grafik, neue Einheitenverhalten, Änderungen an `main`.
- Spieltest mit Menschen (folgt nach Teil 4).

## 2. Anforderungen

| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| S.01 | Fehler „undefined“ in der Warteschlange | Muss | L.0 |
| S.02 | Pacing und Start nachschärfen (C1–C4) | Muss | L.1 |
| S.03 | Kartenpool bereinigen (C5, Streichung Baukosten) | Muss | L.1 |
| S.04 | Strategielinien: Zeichen, Stufen, Boni | Muss | L.2 |
| S.05 | Gebäude-Aufwertung als Verzweigung | Muss | L.3 |
| S.06 | Schlüsselkarten je Linie | Muss | L.4 |
| S.07 | Angebotsausgleich für Schlüsselkarten | Muss | L.4 |
| S.08 | Testschalter „hoher Druck“ | Muss | L.5 |
| S.09 | Messung, Bots, Bericht, Testbuild | Muss | L.0, L.6 |

---

### REQ-S.01 Fehler „undefined“ in der Warteschlange

**Befund (PO):** Im Reiter „Armee“ zeigt die Warteschlange bei Armbrustschütze und Katapult „undefined“. Vermutlich fehlt den Branch-Einheiten Symbol oder Text, seit die Textsymbole aus `main` 0.9.1 eingemischt wurden.

**Anforderungen**

- Ursache in `docs/STAND-kartenpfad.md` festhalten, Fehler beheben.
- Test: Jede Einheit beider Modi hat Name, Kurzname und Symbol in beiden Sprachen; die Warteschlange zeigt für jede Einheit einen Text ohne `undefined`.
- Prüfen, ob `main` betroffen ist; falls ja, Behebung nach der bekannten Regel auf `main`.

**Akzeptanzkriterium:** Test grün; Bildschirmfoto der Warteschlange mit allen Einheiten im Bericht.

---

### REQ-S.02 Pacing und Start nachschärfen (C1–C4)

**C1 – Fälligkeit bleibt:** Eine Wahl wird fällig bei erreichter EP-Schwelle, spätestens zur Zielzeit, frühestens 45 s und spätestens 100 s nach der letzten. EP aus Abschüssen und aus der Universität (Hörsaal) bringen Wahlen früher; das bleibt die Belohnung für aktives Spiel.

**C2 – EP-Karten:**

- „Kriegserfahrung“ entfällt im Modus `karten`.
- „Glücksritter“ erhält im Modus `karten` einen neuen Nachteil: Abstand der eigenen Wellen +25 % (Wert in `config.js`). Der bisherige Nachteil „Stufen kosten 15 % mehr EP“ entfällt dort.

**C3 – Schwellen je Schwierigkeitsgrad:**

- Schwer erhält eigene, leicht höhere Schwellen. Ziel ist eine Abschwächung der Abweichung, keine volle Angleichung an den Fahrplan.
- Zielwert: Auf Schwer, Profil „durchschnitt“, liegt keine Wahl im Median mehr als 45 s vor ihrer Zielzeit (bisher bis 84 s, bei „gelegentlich“ bis 106 s).
- Leicht und Normal bleiben unverändert.

**C4 – Kaserne als Grundgebäude, offene erste Wahl:**

- Die Kaserne ist im Modus `karten` ab Spielstart baubar. Sie liefert in Grundform nur Läufer und den bisherigen Grundausbau.
- „Echtes Militär“ schaltet die Kaserne nicht mehr frei. Die Karte behält +2 Versorgung und den Werfer und trägt das Zeichen der Linie Militär (S.04).
- Gelehrte und Metallverarbeitung sind ab Wahl 1 ziehbar (`abWahl: 1`). Damit wird „Wissen zuerst“ ein eigener Weg.
- Grundsatz (PO): Die Kaserne ist von Anfang an da, wird aber erst mit den Karten und Aufwertungen der Linie Militär wirklich stark.

**Akzeptanzkriterien**

- Test: Kriegserfahrung im Modus `karten` nie im Angebot; im Modus `standard` unverändert.
- Test: Glücksritter verlängert im Modus `karten` den Wellenabstand und ändert keine EP-Schwelle.
- Simulation Schwer, „durchschnitt“: keine Wahl im Median mehr als 45 s vor der Zielzeit.
- Test: Kaserne ab Start baubar; Gelehrte und Metallverarbeitung in Wahl 1 ziehbar.
- Bericht: Siegquote Schwer vorher und nachher (Befund 4.2 sollte entfallen).

---

### REQ-S.03 Kartenpool bereinigen (C5, Streichung Baukosten)

**Streichung (Entscheidung B2 e):** Im Modus `karten` entfallen alle Karten, Forschungen und Ausbauten, deren einzige Wirkung das Bauen von Gebäuden verbilligt oder beschleunigt. Mindestens: Serienbau, Bauleitung. Claude Code erstellt die vollständige Liste, entfernt die Inhalte im Modus `karten` und führt sie im Bericht auf. Modus `standard` bleibt unverändert.

**Inventar der seltenen Karten (Entscheidung C5):**

| Karte | Maßnahme im Modus `karten` |
|---|---|
| Handelskontor | Erst anbieten, wenn der Zinsdeckel erreicht ist |
| Söldnerheer | Nachteil abschwächen: Produktion × 0,8 (statt − 40 %) |
| Große Armee, Zeugmeister, Notreserve, Zinnen | Behalten, im Spieltest beobachten |
| Kriegserfahrung, Glücksritter | Siehe S.02 |
| Serienbau, Bauleitung | Entfallen (siehe oben) |

**Akzeptanzkriterien**

- Test: Keine gestrichene Karte, Forschung oder Ausbaustufe im Modus `karten` erreichbar; im Modus `standard` alle vorhanden (Golden-Test).
- Liste der gestrichenen Inhalte im Bericht.

---

### REQ-S.04 Strategielinien: Zeichen, Stufen, Boni

**Grundidee:** Der Spieler wählt keine Linie. Er wählt Karten und wertet Gebäude auf. Beides trägt Zeichen einer Linie. Die Linie mit den meisten Zeichen prägt seine Partie.

**Linien:** Militär, Wirtschaft, Verteidigung.

**Zeichen**

- Jede Pfad-, Bonus- und Schlüsselkarte sowie jede Gebäude-Variante (S.05) trägt null oder ein Zeichen. Zuordnung deklarativ in `data/`.
- Vorschlag für die vorhandenen Bonuskarten: Kategorie Armee → Militär, Wirtschaft → Wirtschaft, Basis → Verteidigung; Automatisierung und Sonderregel einzeln zuordnen oder ohne Zeichen. Claude Code legt die Zuordnung im Bericht vor.
- Pfadkarten: Echtes Militär → Militär; Festungsbau → Verteidigung; Handel → Wirtschaft; Gelehrte, Metallverarbeitung ohne Zeichen (Vorschlag).
- Es zählen nur aktive Zeichen: gewählte Karten und stehende Gebäude-Varianten. Wird eine Variante abgerissen, entfällt ihr Zeichen.

**Stufen und Boni** (Startwerte, per Simulation zu kalibrieren; alle Werte in `config.js`)

| Linie | Stufe 1 (2 Zeichen) | Stufe 2 (4 Zeichen) |
|---|---|---|
| Militär | Einheiten +10 % Schaden | Kaserne bildet je Welle eine zusätzliche Einheit aus; Einheiten +10 % Lebenspunkte |
| Wirtschaft | Materialertrag +10 % | Zinsen bzw. Ertrag des Kontors +50 %; Aufwertungen −20 % Kosten |
| Verteidigung | Türme +20 % Schaden, Mauer +15 % Lebenspunkte | Abschüsse durch Türme bringen Material; nach jeder vollständig abgewehrten Gegnerwelle rückt sofort eine eigene Welle aus |

- Die Verteidigung braucht einen Weg zum Sieg. Gewonnen wird nur, wenn die gegnerische Basis fällt. Stufe 2 wandelt gute Abwehr deshalb in Fortschritt um (Material, Gegenstoß).
- Mehrere Linien können gleichzeitig Stufen erreichen.
- Soll: eine dritte Stufe (6 Zeichen) je Linie, falls die Simulation zeigt, dass Stufe 2 in der Mehrzahl der Partien vor Minute 8 erreicht wird.

**Sichtbarkeit (Entdecken)**

- Eine Linie erscheint erst in der Oberfläche, wenn ihre Stufe 1 aktiv wird: Hinweis „Verteidigung Stufe 1“ mit einer Zeile Wirkung, danach eine kleine Anzeige je aktiver Linie (Name, Stufe, Zeichen bis zur nächsten Stufe).
- Karten und Gebäude-Varianten zeigen ihr Zeichen erst, nachdem der Spieler die erste Linienstufe erreicht hat. Vorher bleibt das System verborgen.

**Akzeptanzkriterien**

- Test: Zeichen werden korrekt gezählt, auch beim Abriss einer Variante.
- Test: Boni greifen genau ab 2 bzw. 4 Zeichen und entfallen, wenn die Zahl sinkt.
- Test: Vor Stufe 1 ist kein Linienelement sichtbar.
- Zuordnungstabelle der Zeichen im Bericht.

---

### REQ-S.05 Gebäude-Aufwertung als Verzweigung

**Grundidee (Entscheidung B2 d):** Ein Grundgebäude lässt sich einmal in eine von zwei oder drei Varianten aufwerten, je eine pro Linie. Die Wahl ist endgültig; Abriss und Neubau bleiben möglich (Teilrückerstattung wie bisher). Das Raster bleibt 3×3.

**Varianten** (Namen sind Platzhalter nach der Sprachregel; Werte per Simulation)

| Grundgebäude | Militär | Wirtschaft | Verteidigung |
|---|---|---|---|
| Fabrik | Werkstatt: Einheitenkosten −x % | Manufaktur: Materialertrag +x % gegenüber Fabrik | Wachstube: Türme +x % Schaden; Turmabschüsse bringen Material |
| Kaserne | Exerzierplatz: Einheiten +x % Schaden und Lebenspunkte | – | Garnison: Mauer regeneriert x LP/s; Einheiten am Tor +x % Lebenspunkte |
| Schmiede (Soll) | Waffenschmiede: Schmiede-Ausbauten wirken ×1,5 | – | Rüstkammer: Mauer und Türme +x % Lebenspunkte |

**Regeln**

- Jede Variante trägt ein Zeichen ihrer Linie (S.04).
- Aufwerten kostet Material (Startwert: das Zweifache der Baukosten des Grundgebäudes) und dauert eine kurze Zeit, in der das Gebäude nicht wirkt (Startwert 10 s).
- Eine Variante behält die Ausbaustufen ihres Grundgebäudes. Nachbarschaftsregeln des Grundgebäudes gelten weiter.
- Technisch über den vorhandenen Einheitenersatz, erweitert auf Gebäude (`ersetzt` für Gebäudetypen).
- **Sichtbarkeit:** Die Aufwertung erscheint als Aktion am Gebäude, sobald mindestens ein Gebäude des Typs steht und die Partie Minute 3 erreicht hat (Wert in `config.js`). Erstkontakt-Hinweis beim ersten Erscheinen.
- **Manufaktur:** Der Ertrag muss über der Fabrik liegen, darf aber nicht dazu führen, dass „alles Manufaktur“ die anderen Varianten klar schlägt. Prüfung über die Linien-Bots (S.09).

**Akzeptanzkriterien**

- Test: Aufwertung ersetzt das Gebäude, behält Ausbaustufen, ist nicht umkehrbar außer durch Abriss.
- Test: Während der Aufwertungszeit wirkt das Gebäude nicht.
- Messung: Anteil der Fabriken (ohne Varianten) am Raster bei Minute 5 und 10, vorher und nachher.
- Bericht: Verteilung der Varianten je Linien-Bot.

---

### REQ-S.06 Schlüsselkarten je Linie

**Ziel:** Eine Schlüsselkarte macht eine Investition wertvoll, die vorher keine war. Sie trägt zwei Zeichen ihrer Linie und hat die Seltenheit selten oder legendär.

**Vorschläge** (zwei je Linie; Namen Platzhalter, Werte per Simulation)

| Linie | Karte | Wirkung |
|---|---|---|
| Militär | Drill | Einheiten aus einem Exerzierplatz starten mit der nächsten Schmiede-Stufe |
| Militär | Vorhut | Jede eigene Welle rückt mit zwei zusätzlichen Läufern aus |
| Wirtschaft | Handelsnetz | Jede Manufaktur erhöht den Ertrag aller anderen Manufakturen um x % (Deckel in `config.js`) |
| Wirtschaft | Rücklage | Der Zinsdeckel des Kontors wächst mit jeder Kartenwahl |
| Verteidigung | Bastion | Türme +50 % Schaden; Abschüsse durch Türme bringen doppelte EP |
| Verteidigung | Gegenstoß | Nach jeder abgewehrten Gegnerwelle rückt eine eigene Welle mit +30 % Stärke aus |

- Schlüsselkarten erscheinen erst ab Wahl 3 und nur, wenn ihre Wirkung im Spielstand größer als null ist (Regel aus Teil 3).
- Bestehende legendäre Karten bleiben im Pool; sie zählen nicht als Schlüsselkarten, außer Claude Code schlägt eine Umwidmung vor.

**Akzeptanzkriterien**

- Test je Karte: Wirkung greift wie beschrieben.
- Simulation: Keine Schlüsselkarte hebt die Siegquote eines Linien-Bots um mehr als 25 pp (gemessen mit `?druck=hoch`, siehe S.08).

---

### REQ-S.07 Angebotsausgleich für Schlüsselkarten

**Befund (PO):** In den bisherigen Partien ist keine der besonders starken Karten erschienen. Vermutete Ursache: zwei Pfadplätze und höchstens eine Wagnis-Karte lassen oft nur einen Bonusplatz übrig; seltene Karten haben ein niedriges Gewicht.

**Anforderungen**

- Zuerst messen (L.0): angebotene und gewählte seltene und legendäre Karten je Partie, je Feld.
- Ausgleich: Ab Wahl 3 erscheint spätestens in jeder dritten Wahl mindestens eine Schlüsselkarte. Sie belegt einen Bonusplatz.
- Liegt der Spieler in einer Linie vorn (mindestens zwei Zeichen), wird eine Schlüsselkarte dieser Linie bevorzugt (Gewicht in `config.js`). Damit verstärkt die implizite Linie sich selbst, ohne andere Linien auszuschließen.

**Akzeptanzkriterien**

- Simulation: Im Median mindestens drei Angebote mit Schlüsselkarte je Partie (Normal, „durchschnitt“).
- Test: Regel „spätestens jede dritte Wahl ab Wahl 3“ greift.

---

### REQ-S.08 Testschalter „hoher Druck“

**Zweck (Entscheidung B4):** Die Druckkurve bleibt unverändert, bis der Spieltest Daten liefert. Ohne Bedrohung lässt sich die Linie Verteidigung aber nicht beurteilen. Der Schalter macht sie testbar, ohne die Grundwerte zu ändern.

**Anforderungen**

- `?druck=hoch` verstärkt die regulären Gegnerwellen ab Minute 4 mit einem zusätzlichen Faktor (Startwert × 1,3, in `config.js`).
- Standard ist aus. Ohne Parameter bleibt alles wie bisher.
- Der Schalter steht im Testleitfaden und im Protokoll.

**Akzeptanzkriterium:** Test: Mit Schalter sind Wellen ab Minute 4 um den Faktor stärker; ohne Schalter identisch zum Stand vorher (gleicher Seed).

---

### REQ-S.09 Messung, Bots, Bericht, Testbuild

**Basismessung (L.0, vor allen Änderungen)**

- Anteil der Fabriken am Raster bei Minute 2, 5 und 10.
- Angebotene und gewählte seltene und legendäre Karten je Partie.
- Verlorene Lebenspunkte der Mauer je Partie.
- Bildzeit im Browser bei 20, 40 und 80 Einheiten (Playwright, nur berichten; das Leistungsproblem wird beobachtet, nicht behoben).

**Bots:** Drei Linien-Varianten des schnellen Bots („Militär“, „Wirtschaft“, „Verteidigung“). Jede bevorzugt Karten und Varianten ihrer Linie, sonst bisherige Regeln.

**Simulation:** 50 Partien je Feld wie bisher, zusätzlich die drei Linien-Bots auf Normal, jeweils ohne und mit `?druck=hoch`.

**Zu berichten**

| Kennzahl | Zielwert |
|---|---|
| Siegquote der drei Linien-Bots, Normal, ohne Schalter | berichten |
| Siegquote der drei Linien-Bots, Normal, `druck=hoch` | innerhalb 20 pp (Hypothese; verfehlt = Befund, kein Abbruch) |
| Anteil Fabriken am Raster, Minute 10 | berichten, vorher und nachher |
| Angebote mit Schlüsselkarte je Partie | Median ≥ 3 |
| Linie mit Stufe 1 / Stufe 2 erreicht, Zeitpunkt | berichten je Linien-Bot |
| Wahlzeiten, Partiedauer, Wahlen je Partie | Werte aus Teil 3 halten (Median 10–14 min, 9–11 Wahlen) |
| Schwer: Abweichung der Wahlen | ≤ 45 s vor Zielzeit |
| Patt-Quote | ≤ 2 % |
| Mauer-LP-Verlust je Partie | berichten, ohne und mit Schalter |

**Bericht:** `docs/bericht-kartenpfad-4.md` mit Ergebnis je REQ, Zuordnung der Zeichen, Liste gestrichener Inhalte, Kennzahlen vorher und nachher, Auslegungen zur Bestätigung.

**Testbuild und Testleitfaden:** privater Testbuild; `docs/testleitfaden-kartenpfad-4.md` mit zusätzlichen Fragen:

1. Hast du eine Linie bemerkt, bevor das Spiel sie angezeigt hat?
2. Hast du dich bewusst für eine Art zu spielen entschieden? Woran hast du das festgemacht?
3. Gab es eine Aufwertung, bei der du lange überlegt hast?
4. Ist dir eine besonders starke Karte begegnet?
5. Hat sich Verteidigung gelohnt (Partie mit `?druck=hoch`)?

**Spielstand-Version:** 9; ältere Stände werden verworfen.

## 3. Entscheidungen des PO

| Nr. | Thema | Entscheidung |
|---|---|---|
| B1 | Reihenfolge | Erst Kernumbau (Teil 4), dann Spieltest |
| B2 | Bauen über die Partie | Gebäude-Aufwertung als Verzweigung je Linie; Baukosten-Karten und -Upgrades streichen; Raster bleibt 3×3 |
| B3 | Strategielinien | Militär, Wirtschaft, Verteidigung; implizit über Zeichen, sichtbar erst ab Stufe 1 |
| B4 | Druck der Gegner | Erst testen; nur Testschalter `?druck=hoch` |
| C1 | Fälligkeit der Wahl | Bleibt (EP oder Zielzeit; Universität liefert EP) |
| C2 | EP-Karten | Kriegserfahrung entfällt; Glücksritter mit neuem Nachteil |
| C3 | Schwellen je Grad | Schwer leicht höher; nur abschwächen |
| C4 | Start | Kaserne ab Start als Grundgebäude; stark erst über Linie Militär; Gelehrte und Metallverarbeitung ab Wahl 1 |
| C5 | Seltene Karten | Vorschläge aus dem Inventar übernommen |
| A1 | Leistung | Beobachten; nur messen |

## 4. Inkrementplan

| Inkrement | Inhalt | REQ |
|---|---|---|
| L.0 | Fehler „undefined“; Basismessung | S.01, S.09 |
| L.1 | Pacing und Start (C1–C4), Pool bereinigen, Baukosten streichen | S.02, S.03 |
| L.2 | Linien: Zeichen, Stufen, Boni, Sichtbarkeit | S.04 |
| L.3 | Gebäude-Aufwertung (Fabrik, Kaserne; Schmiede Soll) | S.05 |
| L.4 | Schlüsselkarten und Angebotsausgleich | S.06, S.07 |
| L.5 | Testschalter „hoher Druck“ | S.08 |
| L.6 | Linien-Bots, Simulation, Bericht, Testbuild, Testleitfaden | S.09 |

Commits `L.<n>: <Inhalt>`. Jedes Inkrement ist spielbar.

**Abbruchregel:** Priorität bei knappem Budget: L.0 → L.1 → L.3 → L.2 → L.5 → L.6 (mindestens Bericht und Testbuild) → L.4. Ohne L.4 fehlen die Schlüsselkarten; Linien und Aufwertung sind trotzdem testbar. Die Schmiede-Varianten entfallen zuerst.

## 5. Schwache Annahmen und offene Punkte

| Annahme | Risiko | Standard |
|---|---|---|
| Spieler bemerken eine implizite Linie | Ohne Rückmeldung entsteht keine Strategie; mit zu viel Rückmeldung wird sie explizit | Anzeige erst ab Stufe 1; Fragen 1 und 2 im Testleitfaden |
| Varianten brechen die Dominanz der Fabrik | Bei 3×3 bleiben Fabriken in den ersten Minuten richtig; „alles Manufaktur“ kann die neue Dominanz werden | Anteil Fabriken und Verteilung der Varianten messen; Werte der Manufaktur zuerst anpassen |
| Verteidigung lohnt sich | Ohne Druck der Gegner wirkt die Linie wirkungslos, unabhängig von ihrer Stärke | Bewertung nur mit `?druck=hoch`; Druckkurve nach dem Spieltest |
| Kaserne ab Start | Schwer wird leichter; Befund 4.2 entfällt, die Partie verliert ihren frühen Engpass | Siegquote Schwer berichten |
| Streichen der Baukosten-Karten | Weniger Karten im Pool, aber auch weniger Abwechslung | Wahlbreite berichten; Ersatz über Schlüsselkarten |
| Bots als Maß für Linien | Bots folgen ihrer Linie stur; Menschen mischen | Linien-Bots nur für Machbarkeit; Urteil im Spieltest |
| Namen der Varianten und Schlüsselkarten | Platzhalter | Übernehmen, PO kann ändern; Sprachregel gilt |
| Werte aller Boni | Startwerte ohne Messung | Kalibrierung per Simulation, Grenze +25 pp je Karte |

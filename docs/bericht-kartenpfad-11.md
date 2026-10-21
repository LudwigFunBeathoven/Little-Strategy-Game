# Bericht Kartenpfad Teil 11: Haupthaus als Nachbar

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-10 (Spielstand-Version 14). Anforderungen: `docs/anforderungen-kartenpfad-10-11.md`. Rohdaten: `reports/kartenpfad11-*`. Werkzeuge: `tools/fluegelvergleich-v11.mjs`, `tools/messung-v10.mjs`, `tools/vergleich-v10.mjs`. Teil 10: `docs/bericht-kartenpfad-10.md`.

## Ergebnis

1. Die Flügel des Haupthauses geben Nachbarschaftsboni, die Daten liegen im Flügel (`C.HAUPTHAUS.fluegel.<id>.nachbar`). Bots stellen das gestärkte Gebäude neben das Haupthaus, `?fluegel=<id>` legt den ersten Flügel fest, die Anzeige hebt die begünstigten Plätze hervor. Tests und Bildschirmfotos liegen vor.
2. **Erreicht:** Patt-Quote (Bot ohne Kategorie, alle Felder: 0,0 %; mit `?druck=hoch` 0,3 %), kein dominanter Flügel (Spannweite der Siegquoten höchstens 10 Prozentpunkte; der schnellste Flügel ist je Bot ein anderer).
3. **Verfehlt:** Nachbarschaftswert der Manufakturen beim Wirtschafts-Bot (Median 1,02 statt mindestens 2,5), Siegquote des Wirtschafts-Bots (80 % statt mindestens 96 %), 12–16 Wahlen beim Bot ohne Kategorie (11).
4. Die Ziele zum Nachbarschaftswert und zur Siegquote sind mit den Flügelwerten nicht erreichbar (Begründung unten); die Wahlen hängen am vorläufigen Rückstau-Arm C2 aus Teil 10.

## Umsetzung

- **K11.01:** Jeder Flügel trägt `nachbar: { ziel, stat, wert, max }` und `ersetzt`. Begünstigt werden die orthogonal an das Haupthaus angrenzenden Plätze (mit Querverbindung auch die diagonalen) in der Reihenfolge der Plätze, höchstens `max` (2) Gebäude je Flügel, nie das Haupthaus und nie das ersetzte Gebäude. Bauordnung (`nbAll`) multipliziert den Bonus. Gutshof (kein Flügel) gibt nichts; die zwei Flügel der Residenz wirken unabhängig. Ein neuer Flügel braucht nur einen Dateneintrag mit einem der vier bekannten Wirkungsarten (`nbFactoryYield`, `nbResearchTime`, `nbUnitHp`, `nbVariantCost`); eine neue Wirkungsart braucht eine Zeile im Spielkern. Tests: `tests/fluegel11.test.mjs` (Bonus, Grenze, Querverbindung, Bauordnung, Haupthaus, Gutshof, Residenz, Datenflügel, Standardmodus).
- **K11.02:** Bots stellen Manufakturen (Schatzkammer, Bibliothek), Kasernen (Zeughaus) bzw. beliebige Gebäude (Kanzlei) bevorzugt auf freie Plätze neben dem Haupthaus, solange die Grenze des Flügels nicht erreicht ist (`fluegelPlaetze`, `Bot.chooseSlot`). Die Flügelwahl der Bots ist unverändert. Schalter `?fluegel=<id>` (Browser) bzw. `--fluegel <id>` (Simulation).
- **K11.03:** Tooltip des Haupthauses und Reiter Haupthaus nennen je Flügel Bonus und begünstigte Plätze; Überfahren oder Auswählen des Haupthauses (Raster und Karte) hebt die Plätze hervor; die Nachbarschaftszeile der Gebäude nennt den Flügel als Geber („Flügel Schatzkammer: +10 % Ertrag“). `tests/browser-w11.mjs`, Bildschirmfotos `docs/bilder/kartenpfad11-rathaus.png` und `-residenz.png`.

## Messung

Basis ist der Stand ohne Flügelboni (alle `wert` auf 0, sonst identischer Code und Kurve C2) gegen den Stand mit Vorgabewerten, 50 Partien je Feld, Normal, durchschnitt (`reports/kartenpfad11-vergleich-fluegelbonus.md`):

| Feld (normal, durchschnitt) | Partien | Siege ohne Flügelbonus → mit Flügelbonus | Patt ohne Flügelbonus → mit Flügelbonus | Dauer Median | Mauerverlust Mittel | Wahlen Median |
|---|---|---|---|---|---|---|
| Militär-Bot | 50 / 50 | 90,0 % → 96,0 % | 6,0 % → 0,0 % | 12:39 → 13:11 | 357 → 293 | 9 → 9 |
| Wirtschafts-Bot | 50 / 50 | 84,0 % → 80,0 % | 0,0 % → 4,0 % | 15:05 → 15:31 | 780 → 990 | 13 → 13 |
| Verteidigungs-Bot | 50 / 50 | 92,0 % → 98,0 % | 4,0 % → 0,0 % | 14:58 → 15:08 | 865 → 705 | 12 → 12 |
| Verteidigungs-Bot, ?druck=hoch | 50 / 50 | 82,0 % → 84,0 % | 8,0 % → 6,0 % | 14:29 → 14:13 | 2558 → 1349 | 12 → 12 |
| Bot ohne Kategorie | 50 / 50 | 96,0 % → 96,0 % | 0,0 % → 0,0 % | 13:32 → 13:28 | 818 → 561 | 11 → 11 |
| Bot ohne Kategorie, ?druck=hoch | 50 / 50 | 96,0 % → 96,0 % | 0,0 % → 0,0 % | 13:12 → 13:06 | 680 → 670 | 11 → 11 |

Patt-Quote des Bots ohne Kategorie über alle Felder (alle Grade und Profile)

| Reihe | ohne Schalter | mit ?druck=hoch (Normal, Schwer) |
|---|---|---|
| ohne Flügelbonus | 0,0 % (450 Partien) | 0,3 % (300 Partien) |
| mit Flügelbonus | 0,0 % (450 Partien) | 0,3 % (300 Partien) |


Nachbarschaftswert der Manufakturen am Partieende (Median): Wirtschafts-Bot 0,72 → 1,02; Bot ohne Kategorie 0,36 → 0,36 (Teil 6: 3,60; Teil 7: 1,44). Der Mauerverlust sinkt bei Militär-, Verteidigungs- und Bot ohne Kategorie, steigt beim Wirtschafts-Bot (780 → 990); die Unterschiede liegen bei 50 Partien im Rahmen der Streuung (± 5 Prozentpunkte bei den Siegquoten).

## K11.04: Abnahme

| Kriterium | Ziel | Ergebnis |
|---|---|---|
| Nachbarschaftswert Manufakturen, Wirtschafts-Bot, Median | ≥ 2,5 | **verfehlt**: 1,02 |
| Patt-Quote ohne Schalter (Bot ohne Kategorie, alle Felder) | ≤ 1,5 % | erfüllt: 0,0 % (450 Partien) |
| Patt-Quote mit `?druck=hoch` | ≤ 3 % | erfüllt: 0,3 % (300 Partien) |
| Siegquote Wirtschafts-Bot, Normal, durchschnitt | ≥ 96 % | **verfehlt**: 80 % (ohne Flügelboni 84 %) |
| Bot ohne Kategorie, Normal, durchschnitt: Wahlen, Dauer | 12–16 Wahlen, 13–17 min | **teils verfehlt**: 11 Wahlen, 13:28 min (Ursache: Arm C2 aus Teil 10) |
| Spannweite der Siegquoten zwischen den Flügeln je Bot | ≤ 10 Prozentpunkte | erfüllt: 4 / 2 / 10 / 6 Pp (Bot ohne Kat. / Militär / Wirtschaft / Verteidigung) |
| Kein Flügel ist für alle Bots die schnellste Wahl | – | erfüllt: schnellster Flügel nach Dauer: Schatzkammer (ohne Kat.), Bibliothek (Militär, Wirtschaft), Zeughaus (Verteidigung) |

## Flügelvergleich (erster Flügel erzwungen, 50 Partien je Bot und Flügel)

Vorgabewerte (+10 % Ertrag · −5 % Forschungszeit · +10 % Lebenspunkte · −15 % Kosten und Dauer):

| Bot | schatzkammer | bibliothek | zeughaus | kanzlei | Spannweite Siege |
|---|---|---|---|---|---|
| ohne | 98 % · Patt 0 % · 13:22 · nb 0.68 | 94 % · Patt 0 % · 13:33 · nb 0.36 | 96 % · Patt 0 % · 13:48 · nb 0.24 | 96 % · Patt 0 % · 13:31 · nb 0.36 | 4 Pp |
| militaer | 96 % · Patt 2 % · 12:59 · nb 0.68 | 94 % · Patt 0 % · 12:40 · nb 0.24 | 96 % · Patt 0 % · 13:12 · nb 0.24 | 96 % · Patt 0 % · 13:12 · nb 0.24 | 2 Pp |
| wirtschaft | 80 % · Patt 4 % · 15:33 · nb 1.02 | 82 % · Patt 0 % · 15:17 · nb 0.88 | 72 % · Patt 0 % · 15:19 · nb 1.02 | 80 % · Patt 0 % · 15:26 · nb 0.96 | 10 Pp |
| verteidigung | 92 % · Patt 4 % · 14:49 · nb 0.68 | 98 % · Patt 0 % · 15:18 · nb 0.24 | 96 % · Patt 0 % · 14:29 · nb 0.24 | 94 % · Patt 4 % · 14:41 · nb 0.36 | 6 Pp |

Kalibrierschritt 1 (Werte ×2,5: +25 % · −12 % · +25 % · −30 %):

| Bot | schatzkammer | bibliothek | zeughaus | kanzlei | Spannweite Siege |
|---|---|---|---|---|---|
| ohne | 98 % · Patt 0 % · 13:23 · nb 0.98 | 98 % · Patt 0 % · 13:22 · nb 0.36 | 98 % · Patt 0 % · 13:42 · nb 0.24 | 96 % · Patt 0 % · 13:31 · nb 0.36 | 2 Pp |
| militaer | 94 % · Patt 2 % · 12:40 · nb 0.98 | 96 % · Patt 4 % · 12:46 · nb 0.24 | 98 % · Patt 0 % · 12:38 · nb 0.24 | 92 % · Patt 4 % · 13:00 · nb 0.24 | 6 Pp |
| wirtschaft | 76 % · Patt 2 % · 15:21 · nb 1.48 | 74 % · Patt 0 % · 15:35 · nb 1.10 | 86 % · Patt 0 % · 14:59 · nb 1.48 | 80 % · Patt 2 % · 15:16 · nb 1.10 | 12 Pp |
| verteidigung | 98 % · Patt 0 % · 14:53 · nb 0.98 | 96 % · Patt 0 % · 15:25 · nb 0.24 | 98 % · Patt 0 % · 15:05 · nb 0.24 | 92 % · Patt 2 % · 15:16 · nb 0.36 | 6 Pp |

Beobachtungen:
- Die Flügel unterscheiden sich in den Siegquoten innerhalb der Streuung. Die Kanzlei ist nicht die schwächste Wahl (Annahme 5 aus der Anforderung); schwächer wirkt beim Wirtschafts-Bot das Zeughaus (72 % gegen 80–82 %), das ihm nichts nutzt (keine Kaserne neben dem Haupthaus).
- Mit ×2,5 steigt der Nachbarschaftswert des Wirtschafts-Bots von 1,02 auf 1,48, die Siegquote nicht. Das Ziel 2,5 ist über diese Flügel nicht zu erreichen: Die Schatzkammer wirkt höchstens auf zwei Manufakturen (je +0,10), die Manufaktur-Nachbarschaft selbst (+0,06 je Nachbar, höchstens vier) trägt die Hälfte. Ein Median von 2,5 setzt den Bonus je Manufaktur bei mehr als dem Fünffachen des Vorgabewerts an. **Die Kalibrierung ist nach einem Schritt gestoppt** (Abbruchregel: kein Schritt führt zum Ziel; die Patt-Quote ist bereits unter dem Ziel).
- Die Siegquote des Wirtschafts-Bots hängt nicht an den Flügeln: Mit der Kurve von Teil 9 und Fernkampfverhalten lag sie bei 98 %; mit der steileren Kostenkurve C2 (Teil 10, vorläufig) bei 80 %. Die Wirtschafts-Strategie braucht Karten, und die steile Kurve liefert weniger Wahlen (13 statt 18).

## Belegung der begünstigten Plätze am Partieende (Median, höchstens 2 Plätze je Flügel)

| Bot | Schatzkammer | Bibliothek | Zeughaus | Kanzlei |
|---|---|---|---|---|
| ohne Kategorie | 2 | 2 | 1 | 2 |
| Militär | 2 | 1 | 1 | 2 |
| Wirtschaft | 1 | 1 | 1 | 2 |
| Verteidigung | 2 | 1 | 1 | 2 |

Das Zeughaus kann höchstens eine Kaserne begünstigen (eine Kaserne je Partie, ein zweites Exemplar ist teurer). Beim Wirtschafts-Bot stehen die Manufakturen oft schon, wenn der Flügel kommt; die Platzierungsregel wirkt nur auf neue Bauten.

## Abnahmetabelle

| REQ | Kriterium | Ergebnis |
|---|---|---|
| K11.01 | Tests je Flügel, Datenflügel | erfüllt (`tests/fluegel11.test.mjs`) |
| K11.02 | Test der Platzierungsregel, Bericht Belegung | erfüllt |
| K11.03 | Bildschirmfotos Rathaus und Residenz mit Hervorhebung | erfüllt; [Mensch] offen |
| K11.04 | Zielwerte | siehe Tabelle oben: Patt und Spannweite erfüllt, drei Ziele verfehlt |
| K11.05 | Bericht, Testleitfaden, Textübersicht, Testbuild | erfüllt (`docs/testleitfaden-kartenpfad-11.md`, `docs/texte-kartenpfad.md`; Testbuild siehe unten) |

## Offene Punkte und Entscheidungen des PO

1. **Nachbarschaftswert 2,5:** Mit den Vorgaben nicht erreichbar. Optionen: Ziel senken (z. B. 1,5), die Manufaktur-Nachbarschaft selbst anheben, oder der Flügel gibt einen Bonus je Platz statt je Gebäude.
2. **Siegquote Wirtschafts-Bot und Wahlen:** hängen am Rückstau-Arm (Teil 10, C2). Alternative Arme in `reports/kartenpfad10-arme.md`.
3. **Zeughaus** nutzt dem Wirtschafts-Bot nichts; ein Flügel, der nur mit einem bestimmten Gebäude wirkt, ist für Spieler ohne dieses Gebäude eine tote Wahl. Der Spieltest zeigt, ob das stört.
4. **Spieltest:** Fragen zu Flügelwahl und Platzierung im Testleitfaden.

## Testbuild

Privates Artifact (Protokoll an, `?debug=1`-Funktionen): https://claude.ai/artifact/HjGbypR1DtE4z6yyZiFv2i. Nur der Eigentümer kann es öffnen. Schalter wie im Testleitfaden (`?druck=hoch`, `?fluegel=<id>`, `?gegnerfern=aus`).

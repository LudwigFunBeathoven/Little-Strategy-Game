# Klammerfront – Testleitfaden Kartenpfad Teil 6 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob Menschen Karten bewusst kombinieren (Kategorien, Synergiekarten), ob eine Doktrin die Partie wendet, ob die Weiterentwicklungen (Dampfkraft, Buchdruck) als Fortschritt verstanden werden
und ob der Verlust der Varianten verständlich bleibt. Anforderungen: `docs/anforderungen-kartenpfad-6.md`, Bericht: `docs/bericht-kartenpfad-6.md`. Die Werte sind für Bots eingestellt;
der Spieltest ist die Probe, ob Menschen im Takt liegen. Der Spieltest folgt nach Teil 6.

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen (privat, Protokoll immer an). Neu in Teil 6 (alle nur im Modus `karten`, der im Testbuild Standard ist):
   - **Keine Strategielinien mehr.** Die Anzeige „Linien“ in der Leiste und die Linienhinweise entfallen. Stattdessen hat jede Karte eine **Kategorie** (Wirtschaft, Militär, Verteidigung; Brücken zählen für zwei).
     Im Reiter „Karten“ steht die Zahl der Karten je Kategorie, sobald die erste Synergiekarte gewählt ist.
   - **Synergiekarten** (Gilde, Waffenbrüder, Wehrverband, Bauordnung, Sammelruf, Kriegswirtschaft, Wehrhandel, Grenzwacht): Ihre Wirkung wächst mit der Zahl der Karten einer Kategorie (höchstens acht zählen). Der aktuelle Wert steht auf der Karte („derzeit +21 %“).
     Sie erscheinen erst, wenn zwei Karten ihrer Kategorie gewählt sind. Jedes Angebot mit mindestens drei Karten enthält eine Karte außerhalb der führenden Kategorie.
   - **Doktrinen mit Zufallsfaktor:** Ab Wahl 3 würfelt jedes Angebot mit 15 % eine Doktrin (rotes Fähnchen auf der Rückseite); jedes Angebot ohne Doktrin erhöht die Chance um 15 Prozentpunkte. Höchstens zwei Doktrinen je Partie.
     Dreizehn Doktrinen, darunter Elite, Massenaufgebot, Freihandel (Tausch im Kontor), Raubbau, Fabrikmiliz, Grenzfeste und Zermürbung. **Die Einschränkung gilt sofort**, auch für Gebäude, die schon stehen.
   - **Weiterentwicklungen:** Technologiekarte **Dampfkraft** (Fabriken werden zu Dampfmühlen: Ertrag +40 %, Klickertrag ×2) und **Buchdruck** (Forschungen halb so lang, Budgetkurs ×1,5), jeweils mit einer Forschung in der Universität.
     Die Weiterentwicklung **ersetzt die Varianten** des Gebäudes (Manufaktur, Werkstatt, Wachstube) ohne Erstattung; Sonderbauten der Doktrinen bleiben. Der Tooltip der Forschung nennt vorab, wie viele Varianten sie ersetzt.
   - **Ausbauten als Karten:** Turmschule (Reichweite und Abklingzeit der Türme), Stachelwall, Zinsmeister (Kontor) und Maurerkolonne ersetzen die Ausbauten Reichweite, Feuerrate, Stachelwall, Mörtelkolonne und Kontor-Ausbau im Reiter.
     Turm bauen, Mauerausbau, Quartiere, Presse und Schmiede bleiben ohne Karte.
2. **Schalter `?druck=hoch`** (Adresse des Testbuilds, ergänzen): Reguläre Gegnerwellen sind ab Minute 4 um ein Drittel größer. Je Person eine der beiden Partien damit.
   Weitere Schalter: `?pacing=standard` (Vergleich mit `main`), `?zeit=lauf`, `?buehne=0`, `?entdecken=0`.
3. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen: Dann erscheint der Startbildschirm. Schwierigkeit Normal (Leicht für Neulinge).
4. **Nicht helfen, nicht erklären, keine Kategorie, keine Doktrin und keine Weiterentwicklung nennen.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 45 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 13–17 min | Partie 1 (Normal) im Modus `karten`. Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 13–17 min | Partie 2 (Normal) mit `?druck=hoch`. Protokoll speichern. |
| 4 | 10 min | Fragen unten. |
| 5 | 5 min | Auswertung mit der Person: Protokoll ansehen, an welchen Stellen eine Doktrin, eine Synergie oder eine Weiterentwicklung auffiel. |

## Fragen
Die sechs aus Teil 3 (Takt, Wahl, Kartensymbol, Dauer, Ermüdung, Namen) bleiben. **Vier Fragen sind Kriterien aus den Anforderungen (Mensch):**
1. **Karten bewusst kombiniert?** Hast du Karten gewählt, weil sie zu einer früheren Karte passten? Nenne ein Beispiel und woran du es erkannt hast. (Kriterium: mindestens die Hälfte der Tester.)
2. **Doktrin als Wendepunkt?** Hat eine Doktrin deine Partie verändert? Wann, und wie? (Kriterium: mindestens zwei Drittel der Tester, die eine Doktrin hatten; Doktrin-Angebote kommen zufällig, wer keine bekam, antwortet nicht.)
3. **Weiterentwicklung als Fortschritt?** Hast du Dampfkraft oder Buchdruck gewählt und erforscht? War es ein Fortschritt oder ein Verlust? (Kriterium: mindestens die Hälfte nennt einen Fortschritt; **kein Tester empfindet den Verlust der Varianten als unverständlich**.)
4. **Gewartet?** Hast du mit dem Aufwerten der Fabriken gewartet, weil eine Weiterentwicklung kommen konnte? Woher wusstest du davon?

**Weitere Fragen:**
5. **Kategorien:** Hast du bemerkt, dass Karten einer Kategorie zusammen stärker werden? Woran (Anzeige im Reiter, Wert auf der Karte, Hinweis im Angebot)? Hast du bewusst eine andere Kategorie gewählt, um die Mischung zu halten?
6. **Synergiekarten:** War der Wert auf der Karte („derzeit +21 %“) verständlich? Hast du eine Synergiekarte ausgelassen, weil sie noch zu wenig brachte?
7. **Doktrin-Einschränkung:** Hast du bemerkt, dass die Einschränkung sofort gilt? Fühlte sich die Sperre von Gebäuden, Einheiten oder Turmausbauten fair an? War der Grund an der gesperrten Stelle zu lesen?
8. **Freihandel, Massenaufgebot, Raubbau (falls gewählt):** Hast du den Tausch im Kontor genutzt? Hast du bemerkt, dass nur Läufer zu kaufen waren? Wie ging es mit dem sinkenden Ertrag der Fabriken?
9. **Ausbauten als Karten:** Hast du die Ausbauten Reichweite, Feuerrate und Stachelwall im Reiter vermisst? Wirkten Turmschule und Stachelwall als Karte stärker?
10. **Verteidigung (nur Partie mit `?druck=hoch`):** Hat sich die Verteidigung gelohnt? Wusstest du, wie du die Partie am Ende gewinnst?

## Beobachten
- Wahl der ersten Doktrin: Wahl Nummer, Uhrzeit; liest die Person die Einschränkung vor der Wahl?
- Reaktion auf eine gesperrte Aktion nach der Doktrinwahl (z. B. die sechste Fabrik bei der Grenzfeste, Werfer bei Massenaufgebot): Versteht die Person den Grund?
- Zeitpunkt von Dampfkraft und Buchdruck: Karte gewählt, Forschung gestartet, abgeschlossen; Reaktion beim Verlust der Varianten.
- Ob die Person vor einer Fabrik-Aufwertung zögert oder wartet.
- Blick auf die Zahl je Kategorie im Reiter „Karten“.
- Leerlauf und ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 3; Felder neu in Teil 6)
- `drafts[].kat`: Kategorie(n) der gewählten Karte; `kategorien`: Karten je Kategorie am Ende; `fuehrendeKategorie`.
- `synergie`: je gewählter Synergiekarte `n` (gezählte Karten) und `wert` bei Partieende.
- `weiterentwicklungen[]`: `id`, `bereich`, `t` (Zeitpunkt des Abschlusses), `ersetzteVarianten`.
- `doktrinP[]`: je Wahl ab Wahl 3 die Chance `p`, ob gewürfelt wurde (`roll`) und ob das Angebot eine Doktrin enthielt (`mit`); `doktrinen[]`, `doktrinAngebote` wie in Teil 5.
- `doktrinEffekte`: Tausch im Kontor (Material und EP), Läufer der Fabrikmiliz, Zahl der Zermürbungen.
- Weiter wie in Teil 5: `xpBySource`, `actions[]` (mit `upgradeBuilding`, `setBudget`), `variants[]`, `drafts[].erschienenS`.

## Auswertung (Vorschläge)
- Anteil der Personen mit Doktrin im Angebot und Wahl-Nummer des ersten Angebots (`doktrinP`, `doktrinen`); verglichen mit den Bots (Median 5 Angebote je Partie, erstes Angebot in Wahl 4).
- Zeitpunkt der Weiterentwicklungen und Zahl der ersetzten Varianten (`weiterentwicklungen`); stehen Aufwertungen zeitlich kurz davor (`variants[]`), spricht das für die Investitionsfrage.
- Verteilung der Karten auf die Kategorien (`kategorien`): Wie oft liegt eine Kategorie vorn (`fuehrendeKategorie`)?
- Mit `?druck=hoch`: `wallHpLost` und Ergebnis. Die Beobachtung zählt mehr als die Zahl.

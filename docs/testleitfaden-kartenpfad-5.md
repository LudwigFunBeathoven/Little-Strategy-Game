# Klammerfront – Testleitfaden Kartenpfad Teil 5 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob Menschen eine Strategie bewusst wählen (Doktrinen, Sonderbauten, Linien), ob die Kartenwahl sich aus dem Spielfluss ergibt (kein Zeitautomatismus, keine „toten“ Phasen),
ob der kleinere, stärkere Kartenpool Partien verändert und ob das Forschungsbudget der Universität verstanden wird. Anforderungen: `docs/anforderungen-kartenpfad-5.md`,
Bericht: `docs/bericht-kartenpfad-5.md`. Die Werte sind für Bots eingestellt; der Spieltest ist die Probe, ob Menschen im Takt liegen. Der Spieltest folgt nach Teil 5 (nicht vorher).

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen (privat, Protokoll immer an). Neu in Teil 5 (alle nur im Modus `karten`, der im Testbuild Standard ist):
   - **Grundausstattung ab Start:** Fabrik, Kaserne, Schmiede, Universität, Kontor, Läufer, Werfer, Türme und alle Ausbauten sind ohne Karte da. Bau-Karten gibt es nicht mehr. Die Versorgung wächst nur durch Kauf (Kaserne-Ausbau „Quartiere“) oder Doktrin.
   - **Kartenwahl aus dem Spielfluss:** Eine Wahl wird fällig, wenn genug EP da sind (Abschüsse, Schaden an der gegnerischen Basis, abgewehrte Wellen, Forschungsbudget). Es gibt keine Zeitautomatik; das Kartensymbol zeigt den Fortschritt zur nächsten Wahl.
   - **Forschungsbudget** (Reiter Universität): 0 / 25 / 50 % des laufenden Materialertrags werden zu EP; je höher der Anteil, desto schlechter der Kurs.
   - **Doktrinen:** sechs starke Karten mit Sonderbau und Einschränkung; ab Wahl 3, spätestens in jedem dritten Angebot eine; höchstens zwei je Partie.
   - **Linien:** erscheinen mit Stufe 1; Zeichen tragen nur Doktrinen und Gebäude-Varianten; Stufe 3 braucht eine Doktrin der Linie. Die Stufen sind Regeln (Läufer, Diagonale, Söldner, Gegenstoß, Durchbruch, Ausbruch).
   - **Kartenpool:** 28 statt 45 Karten, höhere Stufen bringen neue Effekte.
2. **Schalter `?druck=hoch`** (Adresse des Testbuilds, ergänzen): Reguläre Gegnerwellen sind ab Minute 4 um ein Drittel größer. Je Person eine der beiden Partien damit, sonst kommt kaum ein Gegner an Mauer und Türme.
   Weitere Schalter: `?pacing=standard` (Vergleich mit `main`), `?zeit=lauf`, `?buehne=0`, `?entdecken=0`.
3. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen: Dann erscheint der Startbildschirm. Schwierigkeit Normal (Leicht für Neulinge).
4. **Nicht helfen, nicht erklären, keine Doktrin und keine Linie nennen.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 45 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 13–17 min | Partie 1 (Normal) im Modus `karten`. Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 13–17 min | Partie 2 (Normal) mit `?druck=hoch`. Protokoll speichern. |
| 4 | 10 min | Fragen unten. |
| 5 | 5 min | Auswertung mit der Person: Protokoll ansehen, an welchen Stellen eine Doktrin oder das Budget auffiel. |

## Fragen
Die sechs aus Teil 3 (Takt, Wahl, Kartensymbol, Dauer, Ermüdung, Namen) bleiben. **Vier Fragen sind Kriterien aus den Anforderungen (Mensch):**
1. **Strategie bewusst gewählt?** Hast du deine Spielweise an eine Doktrin, einen Sonderbau oder eine Linie angepasst? Woran? Wann hast du dich entschieden? (Kriterium: mindestens die Hälfte nennt eine bewusste Wahl.)
2. **Karte, die die Partie verändert hat?** Nenne eine Karte, die deine Partie verändert hat. Welche, und wie? (Kriterium: mindestens zwei Drittel nennen eine.)
3. **Leerlauf?** Gab es eine Phase, in der lange nichts passiert ist (keine Wahl, nichts zu tun)? Wann ungefähr? (Kriterium: keine Person nennt eine.)
4. **Linie bemerkt?** Hast du bemerkt, dass dein Spiel in eine Richtung ging (Militär, Wirtschaft, Verteidigung)? Hat dich die Anzeige „Linien“ überrascht, bestätigt oder gestört? (Kriterium: mindestens die Hälfte bemerkt eine Linie.)

**Weitere Fragen:**
5. **Doktrin:** War klar, was die Doktrin bewirkt und was sie einschränkt? Fühlte sich die Einschränkung wie eine Strafe an oder wie eine Entscheidung? Hast du eine Doktrin ausgeschlagen, und warum?
6. **Sonderbau:** Hast du den Sonderbau gebaut? War die Aufwertung klar? Hast du ein Gebäude abgerissen, um ihn zu bauen?
7. **Forschungsbudget:** Hast du den Regler benutzt? Warum (nicht)? Hast du verstanden, dass ein höherer Anteil schlechter verzinst wird?
8. **Kartenpool:** Hast du eine Karte vermisst? Waren die höheren Stufen einer Karte eine Überraschung?
9. **Grundausstattung:** Hat dir das Freischalten von Gebäuden gefehlt (früher Bau-Karten)? Was hat sich stattdessen wie ein „Freischalten“ angefühlt?
10. **Verteidigung (nur Partie mit `?druck=hoch`):** Hat sich die Verteidigung gelohnt (Mauer, Türme, Bastion, Gegenstoß)? Kam genug Druck? Wusstest du, wie du die Partie am Ende gewinnst?

## Beobachten
- Wahl der ersten Doktrin: Wahl Nummer, Uhrzeit, ob die Person den Text zur Einschränkung liest.
- Der erste Versuch, eine gesperrte Aktion (z. B. die fünfte Fabrik bei der Zunftordnung) auszuführen: Versteht die Person die Erklärzeile?
- Aufwertung zum Sonderbau: Uhrzeit, Platz, ob die Person ein vorhandenes Gebäude ablöst.
- Stellung des Forschungsbudgets: Uhrzeit und Wert; ob die Person es zurücknimmt.
- Leerlauf und ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 2, erweitert; Felder neu in Teil 5)
- `xpBySource`: EP je Quelle (`kill`, `tower`, `base`, `wave`, `budget`, `lager`, `passive`, `bounty`).
- `actions[]`: `setBudget` mit der Stufe (`arg`: 0, 1, 2 für 0, 25, 50 %), `upgradeBuilding` mit Platz und Variante.
- `doktrinen[]`: gewählte Doktrinen (`id`, `wahl`, `t`); `doktrinAngebote`: Zahl der Angebote mit Doktrin; `unterhalt`: gezahlter Unterhalt (Stehendes Heer).
- `lines`: je Linie `signs`, `stage`, Zeitpunkte `t1` bis `t3`; `variants[]`: fertige Varianten mit Zeitpunkt.
- Je Wahl in `drafts[]`: `erschienenS`, `chosen`, `offered` (Wahlzeiten ergeben sich aus dem Spielfluss; `sollS` entfällt).

## Auswertung (Vorschläge)
- Längste Lücke zwischen zwei Wahlen je Person (`drafts[].erschienenS`): Median ≤ 120 s, P90 ≤ 180 s wären wie bei den Bots; deutlich längere Lücken stützen die Antwort auf Frage 3.
- Zeitpunkt und Wahl-Nummer der ersten Doktrin; Anteil der Personen mit zwei Doktrinen; Verteilung der gewählten Doktrinen (`doktrinen[]`) und der Sonderbauten (`variants[]`).
- Anteil der Personen, die das Budget gestellt haben (`setBudget` in `actions[]`), und welche Stufe.
- Mit `?druck=hoch`: `wallHpLost` und Ergebnis. Die Beobachtung zählt mehr als die Zahl.

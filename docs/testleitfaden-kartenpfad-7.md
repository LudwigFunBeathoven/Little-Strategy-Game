# Klammerfront – Testleitfaden Kartenpfad Teil 7 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob Bauen mit Haupthaus und Obergrenze für Fabriken als Entscheidung erlebt wird, ob Spieler ein Spezialgebäude zugunsten eines Flügels weglassen, ob Weiterentwicklungen als Fortschritt verstanden werden und ob die historischen Namen verständlich sind. Anforderungen: `docs/anforderungen-kartenpfad-7.md`, Bericht: `docs/bericht-kartenpfad-7.md`. Die Werte sind für Bots eingestellt; der Spieltest zeigt, ob Menschen im Takt liegen.

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen (privat, Protokoll immer an). Neu in Teil 7 (nur Modus `karten`, im Testbuild Standard):
   - **Haupthaus im Mittelfeld** (Platz 5). Es steht ab Start als Gutshof, lässt sich nicht abreißen und hat keine Nachbarn. Ein Klick öffnet den Reiter „Haupthaus“.
   - **Obergrenze für Manufakturen:** 3 auf dem Gutshof, 4 im Rathaus, 5 in der Residenz. Die Erklärzeile am gesperrten Bauplatz nennt die nächste Karte.
   - **Stadtrecht und Hofhaltung** (Karten mit dem Band „Weiterentwicklung“): Nach der Wahl läuft der Ausbau im Reiter Haupthaus (400 bzw. 900 Material, 15 s). Jede neue Stufe bringt einen **Flügel** nach Wahl: Bibliothek (Forschung ohne Universität), Zeughaus (Qualitätsstufen 1–2 ohne Schmiede), Schatzkammer (Zinsen ohne Kontor), Kanzlei (eine Karte mehr je Angebot). Die Wahl ist endgültig.
   - **Neue Weiterentwicklungen:** Fernhandel (Kontor → Handelshaus, Söldnerkompanien im Reiter Armee), Geschützguss (Schmiede → Gießerei, Geschütze in der Einheitenliste), Wasserrahmen (Manufaktur → Fabrik). Dampfkraft ist die zweite Stufe (Fabrik → Dampffabrik, ab Wahl 8), Buchdruck macht die Universität zur Akademie.
   - **Zweites Exemplar:** Kaserne und Universität lassen sich zweimal bauen.
   - **Namen:** Manufaktur, Hofmanufaktur, Zeugmanufaktur; Mauer Palisade → Ringmauer → Bastionsmauer; Türme Wachturm → Wehrturm → Geschützturm.
2. **Schalter `?druck=hoch`** (Adresse des Testbuilds ergänzen): Gegnerwellen ab Minute 4 um ein Drittel größer. Je Person eine der beiden Partien damit. Weitere Schalter: `?pacing=standard` (Vergleich mit `main`).
3. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen. Schwierigkeit Normal (Leicht für Neulinge).
4. **Nicht helfen, nicht erklären, keinen Flügel und keine Weiterentwicklung empfehlen.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 45 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | 13–17 min | Partie 1 (Normal). Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 13–17 min | Partie 2 (Normal) mit `?druck=hoch`. Protokoll speichern. |
| 4 | 10 min | Fragen unten. |
| 5 | 5 min | Auswertung mit der Person: Protokoll ansehen, Belegung der Plätze am Ende, Zeitpunkt von Rathaus und Residenz. |

## Fragen
**Kriterien aus den Anforderungen (Mensch):**
1. **Partie ohne Spezialgebäude?** Hast du in einer Partie auf die Universität, die Schmiede oder das Kontor verzichtet? Warum? (Kriterium: mindestens die Hälfte der Tester spielt eine Partie ohne mindestens eines dieser Gebäude; das Protokoll `gebaeudeEnde` bestätigt es.)
2. **Welchen Flügel hast du gewählt, und welches Gebäude hast du dafür nicht gebaut?**
3. **Weiterentwicklung als Fortschritt?** Hast du eine Weiterentwicklung (Wasserrahmen, Buchdruck, Fernhandel, Geschützguss, Dampfkraft) erforscht? War sie ein Fortschritt oder ein Verlust? (Kriterium: mindestens die Hälfte nennt einen Fortschritt.)
4. **Bauen als Entscheidung?** Musstest du beim Bauen zwischen Gebäuden wählen, oder war klar, was als Nächstes kommt? Woran hast du dich entschieden? (Kriterium: mindestens die Hälfte erlebt Bauen als Entscheidung.)

**Weitere Fragen:**
5. **Obergrenze:** Hast du die Grenze für Manufakturen bemerkt, bevor ein Bauplatz gesperrt war? Wusstest du, wie du sie hebst? Hat sie dich gebremst?
6. **Stadtrecht:** Wann kam die Karte? Hast du den Ausbau gleich bezahlt oder gespart? War klar, dass er im Reiter Haupthaus läuft?
7. **Freier Platz:** Was hast du auf dem Gutshof mit dem achten Platz gemacht (zweite Kaserne, zweite Universität, leer)?
8. **Söldnerkompanie und Geschütze (falls erreicht):** Hast du sie genutzt? Haben sie die Partie beendet?
9. **Namen:** Waren Manufaktur, Fabrik und Dampffabrik als Stufen derselben Produktion verständlich? Hat „Akademie“, „Handelshaus“ oder „Gießerei“ verwirrt?
10. **Verteidigung (Partie mit `?druck=hoch`):** Wusstest du, wie du die Partie am Ende gewinnst?

## Beobachten
- Erste Sperre an der Obergrenze: Uhrzeit, Reaktion, liest die Person die Erklärzeile?
- Wahl von Stadtrecht: Wahl Nummer, Uhrzeit; Zeit bis zum bezahlten Ausbau.
- Flügelwahl: wie lange überlegt, liest die Person alle vier?
- Abriss eines Spezialgebäudes für eine weitere Manufaktur.
- Zögern vor einer Aufwertung, weil eine Weiterentwicklung kommen könnte.
- Leerlauf und ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 4; Felder neu in Teil 7)
- `haupthaus[]`: Stufe, Zeitpunkt, Wahl beim Abschluss; `fluegel[]`: Flügel, Zeitpunkt, Stufe.
- `fabrikplaetze[]`: je Minute die Zahl der Fabrikplätze und die Obergrenze.
- `kompanien[]` (Zeitpunkt, Kosten), `geschuetze` (gekaufte Geschütze), `gebaeudeEnde` (Belegung der Plätze am Ende).
- Aktionen zusätzlich: `hausAusbau`, `chooseFluegel`, `hireKompanie`.
- Weiter wie in Teil 6: `weiterentwicklungen[]`, `kategorien`, `synergie`, `doktrinP`, `xpBySource`, `variants[]`.

## Auswertung (Vorschläge)
- Anteil der Partien ohne Universität, Schmiede oder Kontor am Ende (`gebaeudeEnde`); verglichen mit den Bots (Bericht, Abschnitt Belegung).
- Zeitpunkt von Rathaus und Residenz (`haupthaus`), verglichen mit dem Median der Bots (Rathaus in Wahl 4–5).
- Fabrikplätze je Minute gegen die Grenze: Wie lange steht die Person an der Grenze?
- Mit `?druck=hoch`: `wallHpLost`, Ergebnis, Geschütze und Kompanien. Die Beobachtung zählt mehr als die Zahl.

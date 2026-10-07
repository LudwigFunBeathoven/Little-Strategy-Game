# Klammerfront – Bericht Tutorial Teil 2: Erzählung, Kartenabschluss, Startauswahl (v0.8)

Stand: 06.10.2026 · Branch `tutorial` · Status: **vom PO freigegeben, nach `main` und `MVP` übernommen (06.10.2026)**
Grundlage: `docs/anforderungen-tutorial-2.md` · Stand je Inkrement: `docs/STAND.md` · Testleitfaden: `docs/testleitfaden-tutorial.md`

## Ergebnis in drei Sätzen
Der Startbildschirm erscheint wieder vor jeder Partie (Sprache, Schwierigkeitsgrad, Schalter Tutorial), und das Tutorial läuft auf jedem Grad. Das Tutorial erzählt jetzt: Der
Quartiermeister begrüßt den Feldherrn, jeder Schritt nennt erst den Grund, dann den Auftrag, und die erste Kartenwahl beendet es, danach verabschiedet sich die Figur durch das Tor.
Alle Akzeptanzkriterien sind durch Tests belegt; Partien ohne Tutorial liefern mit denselben Seeds dieselben Ergebnisse wie vorher.

## 1. Ursache des fehlenden Startdialogs (REQ-T2.01)
Ihre Vermutung stimmt. Commit `d2359a0` (T.3) ließ `boot()` bei fälligem Tutorial direkt `startGame` mit fester Stufe Leicht aufrufen und umging so den Dialog. Auslöser war die
Vorgabe in Teil 1 („ohne Startseite“, „immer auf Leicht“). Die Tests blieben grün, weil sie genau diesen Pfad prüften. Jetzt sichert `tests/start.test.mjs` (und eine Browser-Prüfung),
dass `startGame` nur vom Dialog und von den URL-Parametern aufgerufen wird. Ausführlich in `docs/STAND.md`.

## 2. Abweichungen und Auslegungen (zur Bestätigung)
1. **„Mindestens 4 s“ bei Begrüßung und Abschied:** Jede Blase steht 4 s (`TUTORIAL.greetMs`) und geht dann von selbst weiter; ein Klick zeigt sie sofort. Länger als 4 s bleibt keine
   Blase stehen. Wollen Sie, dass sie bis zum Klick stehen bleibt?
2. **Schritt 4 und der Kampf:** Die Blase von Schritt 4 verschwindet, sobald die Welle ausrückt. Das Tutorial bleibt aktiv (Knopf „Überspringen“, Schonfrist beendet, keine Hinweise),
   bis eine gegnerische Welle besiegt ist; erst dann beginnt die Kartenwahl. Intern ist der Kampf ein stiller sechster Eintrag, sichtbar sind fünf Dinge: Klicken, Fabrik, Armee, Welle, Karte.
3. **Kriegsbeute:** Schwelle ist die der *ersten* Kartenwahl. Liegt der EP-Stand schon darüber (etwa weil die Karte vorher kam), ändert sich nichts. Sie fällt nach der ersten besiegten
   Welle der Tutorial-Partie, auch wenn das nicht die allererste Welle ist (Soldaten verloren). Überspringen streicht sie. Die schwebende Zahl ist die der EP-Anzeige; kein eigener Text.
4. **URL-Parameter:** `?lang=` oder `?difficulty=` allein überspringen den Dialog. `?tutorial=1|0` schaltet nur den Schalter im Dialog; in Teil 1 startete `?tutorial=1` sofort eine Partie.
   Wer das will, schreibt `?difficulty=easy&tutorial=1`.
5. **Merker „erste Partie“:** Auch wer die erste Partie ohne Tutorial beginnt, hat damit „gespielt“ (Merker `declined`); danach ist das Tutorial nicht mehr voreingestellt.
6. **Der Dialog ist kürzer:** Die Beschreibungszeile je Stufe und der Satz „Der Schwierigkeitsgrad verändert nur den Gegner“ entfallen (stehen im Tooltip). **Frage:** „Hinweise zurücksetzen“ und
   „Einführung überspringen“ blieben im Dialog, weil es bestehende Funktionen sind. Sollen sie raus, um ihn noch kürzer zu machen? „Tutorial wiederholen“ ist durch den Schalter ersetzt.
7. **Kamera im Abschied:** Die Kamera springt zum Reich zurück, auch wenn der Spieler sie bewegt hatte, damit der Quartiermeister vor dem Tor zu sehen ist.
8. **Auftrag zu Schritt 3 ohne Material:** Es zeigt zuerst das Klickfeld, mit dem Auftrag „Klicke auf Fertigen.“ allein (Erzählung wird nie nachgeholt).
9. **Auftragslänge:** „Wähle eine Karte. Sie verändert dein Reich.“ hat 43 Zeichen (Ihr Text); die Grenze „etwa 30“ gilt hier großzügig. Der Test lässt bis 45 zu.
10. **Pacing-Modi:** Der Mechanismus steht (Konfigurationswert `PACING_MODUS`, Schlüssel mit Suffix, z. B. `tut.bye1.<modus>`, sonst Standard). Modi gibt es im Repository nicht (wie in Teil 1: keine
    Branches `exp/kartenpfad`, `exp/zeitalter`); es gibt daher keine Überschreibungen.
11. **Hinweis „Karte“ entfällt:** Die Erzählung der Kartenwahl ersetzt ihn (Teil 1 sah dafür eine Zusatzzeile vor).
12. **Vorführung entfällt, wenn der Spieler schneller war:** Klickt er schon während der Begrüßung auf Fertigen, führt die Figur den Klick nicht noch einmal vor.
13. **Sitzungsprotokoll:** Sprache und Stufe stehen im Protokoll (Sprache zum Ende der Partie); neu im Feld `tutorial`: `greetingMs`, `bubbleClicks`. `compare-human` gibt beides aus.

## 3. Abnahmekriterien
| Kriterium | Ergebnis | Beleg |
|---|---|---|
| Startbildschirm bei leerem Speicher; Leicht („empfohlen“) und Tutorial vorausgewählt; Browsersprache | ✔ | Browser-Prüfung (Locale `de-DE`) |
| Englisch und Schwer: Partie und Tutorial auf Englisch und Schwer; danach Schwer-Werte im Spielstand | ✔ | Browser-Prüfung (Basis-HP 46.000, Wellenbasis 3,5) |
| Zweite Partie: letzte Wahl vorausgewählt, Tutorial aus | ✔ | Browser-Prüfung |
| Sprachwechsel im Tutorial: Blase wechselt ohne Neuladen | ✔ | Browser-Prüfung |
| Keine Partie ohne Startbildschirm außer mit URL-Parametern | ✔ | `tests/start.test.mjs`, Browser-Prüfung |
| Erste Welle besiegt → EP ≥ Schwelle → Kartenwahl → Blase sichtbar, verdeckt keine Karte | ✔ | Browser-Prüfung beider Sprachen |
| EP schon über der Schwelle: unverändert | ✔ | `tests/hold.test.mjs` |
| Ohne Tutorial keine Kriegsbeute, gleiche Ergebnisse wie vorher | ✔ | `tests/hold.test.mjs`, `tests/unveraendert.test.mjs`, Kurzsimulation 9:09 / 6:13 |
| Fällt die erste Welle nicht: Tutorial bleibt im Kampf | ✔ | `tests/tutorial.test.mjs`, `tests/hold.test.mjs` |
| Durchlauf mit leerem Speicher in beiden Sprachen unter 3:00 min Spielzeit | ✔ | Browser-Prüfung: Kartenwahl nach rund 38 s bei direkter Bedienung |
| Überspringen in jedem Schritt beendet Tutorial, Schonfrist, Kriegsbeute | ✔ | Browser-Prüfung (Begrüßung bis Schritt 4) |
| `tooltipAudit`, `explAudit`, beide Sprachen, keine Konsolenfehler | ✔ | Browser-Prüfung |
| Protokoll: Sprache, Stufe, Dauer der Begrüßung, Klicks auf Blasen | ✔ | Browser-Prüfung, `tests/tutorial-messung.test.mjs` |
| Figur ×1,2 und bei 1280×720 erkennbar | ✔ | Bildschirmfoto `reports/screens/t2-quartiermeister-1280x720.png` |
| Sprechblasen: Erzählung normal, Auftrag fett, Einblenden ≤ 200 ms (180), Klick-Symbol nur ohne Auftrag | ✔ | Browser-Prüfung, `index.html` |

## 4. Kennzahlen
- `npm test`: 175/175. Browser-Prüfung: 315 Prüfungen. Tick-Zeit mit 120 Einheiten 0,13 ms.
- Probelauf bei direkter Bedienung: Begrüßung rund 8 s (4 s je Blase), Fertigen nach 10 s, Fabrik 13 s, Armee 17 s, Welle 20 s, erste Welle besiegt und Kartenwahl 38 s, Abgang der Figur 42 s.

## 5. Auffälligkeiten (berichtet, nicht geändert)
1. **Die Zeiten sind Bot-Zeiten.** Menschen brauchen länger; die Begrüßung allein dauert bis zu 8 s. Der Spieltest zeigt, ob sie sie lesen.
2. **Zufallsabhängige Altprüfung „Kaserne bauen aus dem Reiter Armee“** schlug in einem von vier Läufen fehl und riss den Rest des Laufs mit (Folgefehler: „Welle vorziehen“ nicht anklickbar).
   Einzeln 8 von 8 Läufen in Ordnung; die Prüfung meldet jetzt Karten und Plätze. Ein Fehler im Spiel ist bisher nicht erkennbar.
3. **Blase der Kartenwahl liegt über dem Reiter, nicht über der Karte** und überdeckt dabei die Kamera-Knöpfe der Welt; das ist gewollt (verdeckt keine Karte).
4. **Nicht geprüft:** Touch-Geräte, sehr kleine Fenster, Screenreader (Blase als `role="status"`, Figur nur im Canvas).
5. **Mehrere offene Kartenwahlen:** Kommt direkt eine zweite Wahl, läuft der Abschied bereits; die Blasen laufen weiter, bis der Spieler sie beendet.

## 6. Offen für den PO
1. Auslegungen 1 (4 s oder bis zum Klick) und 6 (Dialog noch kürzer?).
2. Alle offenen Punkte aus Teil 1 (`docs/bericht-tutorial.md`, Abschnitt 7), vor allem die Staffelung der Einführung.
3. Freigabe nach `main`, danach `MVP`; Spieltest mit Menschen nach `docs/testleitfaden-tutorial.md`.

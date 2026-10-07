# Klammerfront – Testleitfaden Kartenpfad Teil 2 (Branch `exp/kartenpfad`)

Zweck: Prüfen, ob die neue Darstellung (Kartenwahl als Ablauf, Bildmitte frei) und das Entdecken (Elemente erscheinen, wenn sie nutzbar sind) das Spiel
lesbarer machen, ohne Neugier oder Orientierung zu kosten. Anforderungen: `docs/anforderungen-kartenpfad-2.md`. Spielwerte sind unverändert.

## Vorbereitung (Testleitung, 5 Minuten)
1. **Testbuild** öffnen. Er hat das Protokoll immer an. Alle Schalter lassen sich per Adresse setzen (hinter `?` anhängen, mit `&` verbinden):
   | Parameter | Wirkung | Voreinstellung |
   |---|---|---|
   | `?pacing=standard` | Modus `standard` (Verhalten von `main`) | Modus `karten` |
   | `?buehne=1` / `0` | Kartenbühne und Kartenablauf an / aus | an im Modus `karten`, aus im Modus `standard` |
   | `?entdecken=1` / `0` | „Nur, was jetzt nutzbar ist“ an / aus | an im Modus `karten`, aus im Modus `standard` |
   | `?vorschau=naechste` | je Bereich höchstens ein Platzhalter „?“ für das Nächste | keine Vorschau |
   | `?zeit=lauf` | Spiel läuft bei offener Kartenwahl weiter (statt Pause) | Pause |
2. Privates Fenster, mindestens 1280×720, Tab nicht wechseln. Keine Parameter `?lang=`, `?difficulty=`, `?tutorial=` anhängen: Dann erscheint der Startbildschirm.
3. **Nicht helfen, nicht erklären.** Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 40 Minuten, zwei Partien)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Einleitung ohne Spielerklärung. |
| 2 | bis 15 min | **Partie A: Modus `karten`** (Testbuild ohne Parameter außer `?debug=1`, falls lokal). Tutorial an. Danach Protokoll speichern (Knopf „Protokoll“). |
| 3 | 3 min | Fragen 1–6 zu Partie A. |
| 4 | bis 15 min | **Partie B: Modus `standard` mit Entdecken**: `?pacing=standard&entdecken=1`. Tutorial aus. Protokoll speichern. |
| 5 | 5 min | Fragen 1–6 zu Partie B, dann Vergleich. |
| 6 | optional, 10 min | Partie C mit `?vorschau=naechste` oder `?zeit=lauf`, je Person eine der beiden. |

## Fragen (je Partie)
1. **Was war zuerst da, was kam später?** Wann ist dir zum ersten Mal etwas Neues aufgefallen, und woran?
2. **Hast du etwas vermisst oder gesucht?** (Ein Reiter, ein Knopf, eine Zahl.) Wann, und wo hast du nachgesehen?
3. **Die Kartenwahl:** War klar, was jede Karte bewirkt? Hast du die Wirkungszeile gelesen oder die Zeile unter den Karten? Wohin ist die gewählte Karte geflogen, und hast du dort das neue Element gefunden?
4. **Ablauf der Wahl:** Zu langsam, zu schnell, genau richtig? Hat die Pause bei offener Wahl gestört (nur bei `?zeit=lauf`: der Lauf)?
5. **Die Bildmitte:** Hat dich außerhalb der Kartenwahl etwas gestört oder verdeckt?
6. **Hinweise und Marke „neu“:** Hast du sie bemerkt? Haben sie geholfen oder genervt?

## Beobachten
- Tastatur (1 bis 4) oder Maus, Hover über Karten (Detailzeile gelesen?), „Später“, „Neu ziehen“, „Bannen“.
- Ratlose Momente: Uhrzeit notieren.

## Protokoll (Format 2, erweitert)
Zusätzlich zu Teil 1 (`drafts`, `unlocks`, `researchDone`, `thinkMs`, `rerolled`, `banned`):
- `visible`: je Element Schlüssel und Spielzeit, ab der es sichtbar wurde; `discovered`: Spielzeit der ersten Ansicht (Reiter geöffnet, Element berührt oder benutzt). **Entdeckungszeit = `discovered` − `visible`.**
- `drafts[].hover`: je Karte Millisekunden unter dem Zeiger.
- `switches`: aktive Schalter (`stage`, `discover`, `preview`, `time`) der Partie.

## Auswertung (Vorschläge)
- Lange Entdeckungszeiten (über 2 min) bei Reitern und Bauoptionen: Das Element ist zu unauffällig; kurze Zeiten bei „neu“ markierten Elementen sprechen für die Marke.
- Hover unter 1 s je Karte: Die Wirkungszeile genügt oder wird nicht gelesen; über 5 s auf der Detailzeile: Die Karte erklärt zu wenig.
- Die Beobachtung zählt mehr als die Zahl.

# Klammerfront – Briefing für Claude im Chat (Stand v0.6, 29.09.2026)

> Dieses Dokument ist für eine Unterhaltung mit Claude ohne Zugriff auf das Repository gedacht. Es enthält alles Nötige, um den Stand
> zu verstehen, Entscheidungen vorzubereiten und die Anforderungen für Iteration 6 zu schreiben. Code-Details fehlen bewusst.
> Repository: `LudwigFunBeathoven/Little-Strategy-Game`, Branch `main` (v0.6).

## 1. Das Spiel
Klammerfront ist ein Browser-Spiel zwischen *Universal Paperclips* (Klick- und Aufbau-Ökonomie) und *Age of War* (Kampf auf Bahnen).
- **Wirtschaft:** Der Spieler klickt „Fertigen“ für Material und baut Gebäude auf einem 3×3-Raster: Fabrik (Material je Sekunde), Kaserne,
  Schmiede (Einheitenqualität), Universität (Forschung, dritte Kartenoption), Handelskontor. Die erste Fabrik ist kostenlos. Ab der Spielmitte
  klickt eine automatische Presse mit.
- **Kampf:** Drei Bahnen (Lanes): oben, Mitte, unten. Der Spieler kauft Einheiten (Läufer, Werfer, per Forschung Schildträger), die in Wellen
  ausrücken. Der Gegner schickt ebenfalls Wellen. Ab Minute 16 kommt eine dreifache Belagerungswelle, danach wird der Gegner stetig stärker.
- **Fortschritt:** Abschüsse bringen Erfahrungspunkte (EP). Jede Stufe bietet 2 Spezialkarten zur Wahl (mit Universität 3). 41 Karten in fünf
  Kategorien und drei Seltenheiten, teils bis Stufe III. Seit v0.6 zusätzlich ein Forschungsbaum (13 Forschungen, bezahlt mit Material und Zeit).
- **Sieg/Niederlage:** Sieg, wenn die gegnerische Basis fällt; Niederlage, wenn das eigene Tor (Mitte) fällt. Die äußeren Mauern können fallen.
- **Schwierigkeitsgrade:** Leicht, Normal, Schwer.

Technik: reines HTML/JavaScript ohne Build-Schritt; Spiellogik strikt getrennt von Oberfläche, Zahlen (alle in einer Konfigurationsdatei) und
Texten (Deutsch und Englisch). Eine Bot-Simulation spielt tausende Partien, um das Balancing zu prüfen.

## 2. Arbeitsweise
- Nick ist Product Owner (PO), kein Entwickler. Er schreibt je Iteration ein Anforderungsdokument (`docs/anforderungen-iteration-<n>.md`)
  mit nummerierten Anforderungen (REQ-5.01 …), Akzeptanzkriterien, Inkrementplan, offenen Punkten mit gesetztem Standard und Definition of Done.
- Claude Code setzt es in Inkrementen um (ein Commit je Inkrement, jedes spielbar), dokumentiert Auslegungen und berichtet Abweichungen,
  statt stillschweigend anders zu lösen. Balancing-Auffälligkeiten werden berichtet, nicht automatisch wegbalanciert.
- Bisher: v0.2 Ausgangsstand, v0.3 (Iteration 2), v0.4 (It. 3, drei Lanes), v0.5 (It. 4, Formationen, 41 Karten), v0.6 (It. 5, dieses Briefing).

## 3. Was Iteration 5 (v0.6) geändert hat
| REQ | Inhalt | Ergebnis |
|---|---|---|
| 5.01 | Klicks gingen verloren | Ursache belegt: Knöpfe wurden bis zu neunmal je Sekunde neu gebaut, ein Klick traf beim Loslassen einen neuen Knopf. Behoben: vorher 0 von 4 Bauten und 0 von 10 Einheitenkäufen, jetzt alle. |
| 5.02 | „Altmetall“ heißt jetzt „Erfahrungspunkte (EP)“ | Auch im Code; alte Spielstände werden mit Hinweis verworfen. |
| 5.03 | Oberfläche in drei Bändern | Oben Ressourcenleiste, Mitte Spielwelt, unten Arbeitsbereich mit Reitern (Bauen, Mauer & Türme, Armee, Schmiede, Universität, Karten). |
| 5.04 | Bauen in zwei Klicks | Aus der Welt oder aus einem Knopfraster, vollständig per Tastatur. |
| 5.05 | Jede Einheit kämpft einzeln | Eigenes Ziel, eigene Angriffspause, alle Treffer eines Moments gleichzeitig (keine Seite im Vorteil). |
| 5.06 | Armee als gemeinsame Welle | Marsch → Kampf (die ganze Armee hält bei Kontakt) → Sammeln → Marsch. Nachschub schließt auf. Fällt die Mitte leer, geben die äußeren Bahnen ein Drittel ab. Der Gegner nutzt dieselbe Logik. |
| 5.07 | Universität mit Forschungsbaum | Vier Zweige: Lehre (passive EP), Archiv (Karten neu ziehen, bannen, Glücksgriff), Forschung (Material, Baukosten, Mauern, Nachschub), Freischaltung (Schildträger, zweiter Forschungsplatz, Schmiede-Ausbau). |
| 5.08 | Balancing | Gegnerische Basis Leicht/Normal/Schwer 26.000/26.000/46.000 (v0.5: 11.000/13.000/15.000), Schwer mit größerer Grundwelle und mehr EP. Experiment „Schwung“ simuliert, standardmäßig aus. |
| 5.09 | Fehler und Schulden | Durchlauftest je Schwierigkeitsgrad, Leistungsmessung. |
| 5.10 | Polish | Schwebende Zahlen bei Gewinn, verblassende gefallene Einheiten, feste Zählerbreiten, schnelle Reiterwechsel. |
| 5.11 | Testpaket für Spieltests mit Menschen | Sitzungsprotokoll mit `?debug=1` (Knopf „Protokoll“ exportiert JSON), Auswertungswerkzeug ordnet Menschen einem Bot-Profil zu, Testleitfaden mit Ablauf, acht Fragen und Protokollvorlage. |

## 4. Kennzahlen (Abnahmeserie: 200 simulierte Partien je Feld, 6.000 insgesamt, 0 unentschieden)
Median der Zeit bis zum Sieg · Siegquote. Die Bot-Profile: **aktiv** (3 Klicks/s, entscheidet alle 0,25 s, bis 30 Einheiten), **durchschnitt**
(1,5 Klicks/s, jede Sekunde, 22), **gelegentlich** (0,7 Klicks/s, alle 3 s, 15, keine Mauerpflege), **passiv** (0,3 Klicks/s, baut nicht).

| Schwierigkeit | Profil | Ziel | v0.5 | v0.6 | |
|---|---|---|---|---|---|
| Leicht | aktiv | 5–7 min | 5:28 · 100 % | 6:16 · 100 % | ✔ |
| Leicht | durchschnitt | 6–9 min | 6:09 · 100 % | 8:58 · 100 % | ✔ |
| Leicht | gelegentlich | Sieg, 10–18 min | 7:32 · 100 % | 11:39 · 99 % | ✔ |
| Normal | aktiv | 6–9 min | 6:51 · 92 % | 6:44 · 89 % | ✔ |
| Normal | durchschnitt | 9–13 min | 10:04 · 86 % | 9:53 · 66 % | ✔ |
| Normal | gelegentlich | darf verlieren | 42 % | 21 % | ✔ |
| Schwer | aktiv | 8–12 min | 8:59 · 84 % | 11:00 · 50 % | ✔ |
| Schwer | durchschnitt | 13–20 min | 10:23 · 52 % | 9:25 · 28 % | ✘ |
| Schwer | gelegentlich | verliert (≤ 5 %) | 26 % | 0,5 % | ✔ |
| alle | passiv | verliert | 0 % | 0–1 % | ✔ |

Weitere Werte: Abstand Leicht aktiv ↔ gelegentlich 5:23 min (Ziel ≥ 4, v0.5 2:04) ✔. Klickanteil an der Produktion Früh/Mitte/Spät
61–65 / 23–26 / 1–2 % ✔. Erste Kartenwahl nach 85 s ✔. Armee steht 63 % der Zeit im Kampf. Ohne Schmiede gewinnt Normal 34 % ✔.
Verfehlt: drei Karten mit mehr als +25 Prozentpunkten Siegquote (Dauerauftrag +34, Alles auf die Mitte +38, Söldnerheer +32; die letzten beiden
mit kleinen Stichproben); „nie klicken“ gewinnt auf Leicht so oft wie Dauerklicken; sieben Karten werden zu oft (> 60 %) oder zu selten (< 5 %)
gewählt, vor allem Wirtschaftskarten zu oft; die Rechenzeit je Spielschritt liegt 50 % über v0.5 (Ziel +20 %, absolut unbedeutend: 2 ms je Spielsekunde).

## 5. Wichtigste Befunde
1. **Der Simulations-Bot ist schwach.** Ein einfacher Bot ohne Vorausschau (feste Bauordnung, schickt ständig Einheiten bis zum Limit, nimmt
   die erste Karte) gewinnt mit denselben Profilwerten fast alles schneller: Schwer „aktiv“ 50/50 nach 6:09 (Simulations-Bot 50 % nach 11:00),
   Schwer „durchschnitt“ 50/50 nach 7:10, Normal „gelegentlich“ 48/50 nach 7:29. Das Balancing ist gegen den schwächeren Bot eingestellt.
   Ein Mensch, der einfach laufend Einheiten schickt, dürfte das Spiel deutlich leichter finden als die Tabelle zeigt.
2. Derselbe Effekt erklärt zwei Merkwürdigkeiten: Beim Simulations-Bot machen **mehr Klicks die Siege langsamer** (Leicht „nie klicken“ 7:19,
   „Dauerklick“ 9:55), und das **Experiment „Schwung“** verlängert Partien. Mehr Material fließt bei ihm in Wirtschaft statt in die Armee.
3. **Schwer ist für langsame Starter abrupt:** „gelegentlich“ und „passiv“ verlieren nach etwa 1:30, weil die Grundwelle das Tor vor jeder
   Verteidigung erreicht.
4. **Experiment „Schwung“** (Klicks laden einen Speicher, der die Automatik bis +50 % verstärkt und in 20 s abklingt): Auf Normal gewinnt „aktiv“
   100 % statt 89 %, „gelegentlich“ 8 % statt 21 %; aber alle Siege kommen 1–3 Minuten später, der Zeitabstand auf Leicht halbiert sich, und
   Schwer „gelegentlich“ reißt die 5-%-Grenze. Empfehlung: nicht einführen.
5. Die Forschung wird von den Bots genutzt (Universität in 100 % der Partien gebaut); der Vergleich „erforscht gegen nicht erforscht“ ist aber
   verzerrt (lange Partien enthalten mehr Forschung und gehen öfter verloren) und noch nicht aussagekräftig.

## 6. Offene Entscheidungen des PO
1. **Balancing-Grundlage:** erst Spieltest mit Menschen (Testleitfaden liegt vor), dann Simulations-Bot um „Einheiten zuerst“ ergänzen und neu
   kalibrieren? Oder jetzt gegen den einfachen Bot nachschärfen (würde Schwer deutlich schwerer machen, ohne Daten von Menschen)?
2. Experiment „Schwung“ verwerfen?
3. Dauerauftrag, Söldnerheer, Alles auf die Mitte abschwächen oder beobachten? (Dauerauftrag kauft automatisch Einheiten nach und gleicht damit
   genau die Schwäche des Simulations-Bots aus.)
4. Schwer: erste Welle später oder kleiner, damit langsame Starter nicht nach 90 s verlieren?
5. Leicht: Soll Klicken spürbar mehr bringen (z. B. erste Fabrik nicht mehr kostenlos, Automatik später)?
6. Leistungsziel auf einen festen Wert umstellen (≤ 1 ms je Spielschritt mit 120 Einheiten)?
7. Aus Iteration 4 offen: Freigabe der Kartenliste (41 Karten); Handelskontor streichen? (gebaut in 5–11 % der Partien).

Vom PO noch zu bestätigende Auslegungen: Karte „Weitschuss“ gibt jetzt +20 % Fernkampfschaden (ihre alte Regel gibt es nicht mehr);
Forschung wirkt nach Abriss der Universität weiter; der Durchlauftest spielt mit echten Werten im Schnelldurchlauf statt mit geänderten Werten.

## 7. Zielwerte, die weiter gelten
| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv |
|---|---|---|---|---|
| Leicht | 5–7 min | 6–9 min | Sieg, 10–18 min | darf verlieren |
| Normal | 6–9 min | 9–13 min | darf verlieren | verliert |
| Schwer | 8–12 min | 13–20 min | verliert (≤ 5 %) | verliert |

Außerdem: höchstens 2 % unentschiedene Partien nach 30 min; ein Bot, der nur verteidigt, gewinnt nie und verliert bis Minute 25; erste
Kartenwahl nach 60–90 s, danach alle 45–150 s; Klickanteil Früh ≥ 50 %, Mitte 10–30 %, Spät ≤ 3 %; jede Karte wird in 5–60 % der Angebote
gewählt; keine Karte oder Forschung mit mehr als +25 Prozentpunkten Siegquote; Abstand Leicht aktiv ↔ gelegentlich ≥ 4 min; aktive Spieler
werden belohnt (PO-Grundsatz aus Iteration 5).

## 8. Bitte an Claude im Chat
Hilf dem PO, die offenen Entscheidungen abzuwägen und daraus ein Anforderungsdokument für Iteration 6 im bisherigen Aufbau zu schreiben:
Ziel und Begründung, nummerierte Anforderungen (REQ-6.xx) mit Akzeptanzkriterien, Inkrementplan mit Abbruchregel, offene Punkte mit gesetztem
Standard, Definition of Done. Schwache Annahmen offen benennen. Balancing-Zahlen nicht raten: Das Dokument sollte Ziele und Prüfverfahren
festlegen, die konkreten Werte ermittelt Claude Code per Simulation.

# Klammerfront – Anforderungen Branch „Kartenpfad“ (Teil 1)
 
Stand: 07.10.2026 · Product Owner: Nick · Umsetzung: Claude Code
Ablage im Repository: `docs/anforderungen-kartenpfad.md` · Basis: `main` · Branch: `exp/kartenpfad`
Grundlage: `branch-konzepte-pacing.md` (§3.1, §4.1, §4.2), `anforderungen-iteration-6.md`, `anforderungen-tutorial.md`, `anforderungen-tutorial-2.md`
 
## 0. Auftrag in Kürze
 
Dieser Auftrag setzt die ersten Schritte des Branches „Kartenpfad“ um. Er enthält drei Änderungen:
 
1. **Karten steuern das Pacing, nach dem Vorbild von *Stellaris*.** Zu Beginn stehen nur Fabrik und Läufer zur Verfügung. Karten schalten Gebäude frei, öffnen Forschungsoptionen in der Universität und eröffnen Upgrade-Stufen.
2. **Die Kartenwahl zieht in die Bildmitte.** Die Karten erscheinen als Auswahl auf einer Kartenbühne und lösen das Ziehen im Arbeitsbereich ab. Die Wahl ist die zentrale strategische Entscheidung des Spiels.
3. **Die Sprache des Tutorials wird ruhiger und abstrakter.** Bedrohungsbilder („Horden“) und militärische Anreden entfallen.
**Kern der Entscheidung (PO):** Eine Freischaltkarte ist eine Alternative zu den konkreten Boni. Wer „Metallverarbeitung“ wählt, schaltet die Schmiede frei und lässt dafür einen Bonus liegen. Wer „Fortgeschrittene Taktiken“ wählt, öffnet in der Universität die Forschung an Reiter und Schildträger, erhält die Einheiten aber erst nach der Forschung.
 
**Umfang:** Dieser Teil liefert einen spielbaren Prototyp mit kleinem Kartenpool (Abschnitt 3, KP.02). Balancing im Detail, neue Grafik und die zweite Stufe des Konzepts (Zeitalter als Kartenpool) folgen nach dem Spieltest.
 
## 1. Arbeitsgrundlagen
 
- **Vor Beginn lesen:** `CLAUDE.md`, `docs/STAND.md`, `docs/branch-konzepte-pacing.md`, `docs/anforderungen-iteration-6.md`, `docs/anforderungen-tutorial.md`, `docs/anforderungen-tutorial-2.md`, dieses Dokument.
- **Voraussetzungen prüfen** und in `docs/STAND.md` festhalten (KP.0):
  - Ist Iteration 6 auf `main`?
  - Existiert der gemeinsame Unterbau aus `branch-konzepte-pacing.md` §4.1 (Freischaltlogik, Einheitenersatz, Schalter `PACING_MODUS`)? Falls nein, entsteht er zuerst auf `main`, mit unverändertem Standardmodus und grünen Tests.
  - Sind Tutorial Teil 1 und 2 umgesetzt? Falls nein, gilt KP.08 für die Textentwürfe im Dokument und für die Umsetzung, sobald sie erfolgt.
- **Branch:** `exp/kartenpfad` von `main`. Commits `KP.0`–`KP.7`, linear, jedes Inkrement spielbar.
- **Invarianten gelten unverändert:**
  - `core.js` ohne DOM,
  - Zufall nur über `S.rng`,
  - Zahlen nur in `config.js` bzw. `data/`, Texte nur in `i18n/`,
  - Spielstand als azyklisches JSON,
  - Tooltip und Erklärzeile an jedem Bedienelement.
- **Schalter:** `PACING_MODUS = 'karten'` aktiviert den Branch-Inhalt. Im Modus `standard` bleibt alles wie in `main`; Bot-Simulation mit gleichem Seed liefert identische Ergebnisse. Die Kartenbühne hängt an `UI.kartenbuehne` (Standard: an im Modus `karten`, aus im Modus `standard`). Die Texte aus KP.08 gelten in allen Modi.
- **Spielstand:** `SAVE_VERSION` wird erhöht; alte Stände werden mit Hinweis verworfen.
- **Balancing-Zahlen nicht raten:** Die Werte in diesem Dokument sind Startwerte. Claude Code ermittelt die endgültigen Werte per Kurzsimulation mit mindestens 50 Partien je Feld und beiden Strategien.
- **Modellempfehlung** (siehe `branch-konzepte-pacing.md` §5): `opusplan` mit Standard-Aufwand; KP.1 (Texte) und Kartendaten mit `sonnet`.
## 2. Entscheidungen und gesetzte Standards
 
| Thema | Festlegung | Quelle |
|---|---|---|
| Wahl als Alternative zu Boni | Jedes Angebot enthält Boni und Freischaltungen nebeneinander | PO |
| Freischaltung von Gebäuden | Bau-Karte schaltet Gebäude sofort zum Bauen frei (Beispiel: „Metallverarbeitung“ → Schmiede) | PO |
| Freischaltung von Einheiten | Technologie-Karte öffnet Forschung in der Universität; die Einheit entsteht erst durch die Forschung (Beispiel: „Fortgeschrittene Taktiken“ → Reiter, Schildträger) | PO |
| Vorbild | *Stellaris*: Forschungsoptionen, Upgrade-Optionen, Gebäude werden durch Wahlen erschlossen | PO |
| Kartenbühne | Karten erscheinen prominent in der Bildmitte, die Wahl ist die zentrale Entscheidung | PO |
| Tutorial-Sprache | Weniger stark, abstrakter; „Horden aus dem Osten“ entfällt | PO |
| Anzahl der Karten je Angebot | 3 (Universität: +1) | Standard, PO kann ändern |
| Bühne und Spielzeit | Spiel pausiert, solange die Bühne offen ist | Standard, per Schalter änderbar |
| Auswahlstruktur | Eine gemeinsame Auswahl über alle Familien, keine festen Kategorien | Standard |
| Nicht gewählte Pfadkarten | Kehren in den Stapel zurück und erscheinen wieder | Standard |
 
## 3. Anforderungen
 
| REQ | Titel | Priorität | Inkrement |
|---|---|---|---|
| KP.01 | Karten steuern das Pacing: Startzustand und Freischaltlogik | Muss | KP.0, KP.3 |
| KP.02 | Kartenfamilien und Zusammensetzung des Angebots | Muss | KP.3 |
| KP.03 | Kartenbühne in der Bildmitte | Muss | KP.2 |
| KP.04 | Universität als Forschungsstätte | Muss | KP.4 |
| KP.05 | Upgrade-Optionen und Einheitenersatz | Muss | KP.5 |
| KP.06 | Zufall begrenzen: Meilenstein-Platz, Rückstandsgewicht, Mindesttempo | Muss | KP.3, KP.6 |
| KP.07 | Wagnis-Karten und exklusive Pfade | Soll | KP.6 |
| KP.08 | Tutorial-Sprache | Muss | KP.1 |
| KP.09 | Bots, Messung, Bericht, Testbuild | Muss | KP.7 |
 
---
 
### REQ-KP.01 Karten steuern das Pacing: Startzustand und Freischaltlogik
 
**Startzustand im Modus `karten`:** Reich, Mauer (Stufe 1), Tor, Klickfeld, Fabrik und Läufer. Alles Weitere ist gesperrt:
 
- Kaserne, Schmiede, Universität, Handelskontor,
- Türme und weitere Mauerstufen,
- Werfer und alle späteren Einheiten,
- Ausbaustufen ab Stufe 2 an jedem Gebäude.
**Sichtbarkeit:** Gesperrte Inhalte bleiben in den Reitern sichtbar, ausgegraut, mit der Zeile „Freischaltung: Karte *Name*“ bzw. „Forschung: *Name*“. Der Spieler sieht damit, was er erschließen kann.
 
**Datenfelder** (deklarativ in `data/`, Karten und Forschungen im selben Schema):
 
| Feld | Bedeutung |
|---|---|
| `id`, `familie` | Kennung; `bonus`, `bau`, `technologie`, `wagnis` |
| `stufe` | Kartenstufe (1, 2, 3) wie bisher bei Boni |
| `abWahl` | Frühestens ab der n-ten Kartenwahl im Angebot |
| `benoetigt` | Liste: Karten, Forschungen oder Gebäude, die vorhanden sein müssen |
| `schaltetFrei` | Gebäude, Einheiten, Upgrade-Stufen |
| `oeffnetForschung` | Forschungen, die in der Universität verfügbar werden (nur Technologie) |
| `ersetzt` | Einheitenersatz, z. B. `{ laeufer: 'schwertkaempfer' }` |
| `exklusivMit` | Karten, die sich gegenseitig ausschließen (KP.07) |
| `gewicht` | Grundgewicht im Angebot |
 
**Akzeptanzkriterien**
 
- Test: Startzustand im Modus `karten` entspricht der Liste oben; im Modus `standard` unverändert.
- Test: Eine Bau-Karte schaltet genau die in `schaltetFrei` genannten Inhalte frei; vorher sind sie nicht baubar, nachher schon.
- Test: Jeder gesperrte Inhalt nennt seine Freischaltquelle (`explAudit`).
- Test: Kein Inhalt ist unerreichbar: Für jeden gesperrten Inhalt existiert eine Karte oder Forschung, die ihn freischaltet, und deren `benoetigt`-Kette ist auflösbar (Graphtest ohne Zyklen).
---
 
### REQ-KP.02 Kartenfamilien und Zusammensetzung des Angebots
 
**Vier Familien**, jede mit eigener Farbe und eigenem Symbol (Farbe allein trägt keine Information):
 
| Familie | Wirkung | Beispiel |
|---|---|---|
| Bonus | Sofortige konkrete Verbesserung, wie die 41 vorhandenen Karten | Weitschuss |
| Bau | Schaltet Gebäude oder Ausbaustufen sofort frei | Metallverarbeitung |
| Technologie | Öffnet Forschungsoptionen in der Universität | Fortgeschrittene Taktiken |
| Wagnis | Spielverändernd mit Nachteil (KP.07) | Glaskanonen |
 
Die vorhandenen Karten bleiben im Pool. Karten mit freischaltender Wirkung im Bestand werden im Inventar der passenden Familie zugeordnet; die Liste steht im Bericht (zur Freigabe durch den PO).
 
**Zusammensetzung eines Angebots** (Standard 3 Karten):
 
1. **Mindestens eine Pfadkarte** (Familie Bau oder Technologie), sofern eine ziehbar ist (Meilenstein-Platz, KP.06).
2. **Mindestens eine Bonuskarte.** Damit bleibt der Verzicht auf einen Bonus bei jeder Freischaltung spürbar.
3. Die übrigen Plätze füllt die gewichtete Ziehung.
4. **Höchstens eine Wagnis-Karte** je Angebot.
5. **Technologiekarten** erscheinen erst, wenn die Universität gebaut ist und ihre `benoetigt`-Liste erfüllt ist. Sie würden sonst ohne Wirkung bleiben.
6. Eine gewählte Pfadkarte erscheint nicht erneut. Nicht gewählte Pfadkarten gehen zurück in den Stapel.
7. Bannen und Neu ziehen bleiben wie in v0.6; Neu ziehen behält den Meilenstein-Platz.
**Kartenpool des Prototyps** (Startwerte; alle Karten sind Datensätze ohne neue Grafik; Texte in beiden Sprachen, als Platzhalter markiert):
 
| Karte | Familie | Ab Wahl | Benötigt | Wirkung |
|---|---|---|---|---|
| Echtes Militär | Bau | 1 | – | Kaserne baubar, +2 Versorgung, Werfer verfügbar |
| Festungsbau | Bau | 1 | – | Türme und zweite Mauerstufe baubar |
| Metallverarbeitung | Bau | 2 | – | Schmiede baubar |
| Gelehrte | Bau | 2 | – | Universität baubar |
| Handel | Bau | 4 | Gelehrte | Handelskontor baubar |
| Fortgeschrittene Taktiken | Technologie | 3 | Echtes Militär, Universität gebaut | Öffnet Forschung: Reiter, Schildträger |
| Eiserne Klingen | Technologie | 4 | Metallverarbeitung, Universität gebaut | Öffnet Forschung: Eisenwaffen (Einheitenersatz) |
| Befestigungskunde | Technologie | 4 | Festungsbau, Universität gebaut | Öffnet Forschung: Mauer Stufe 3, Turmausbau |
| Glaskanonen | Wagnis | 5 | Echtes Militär | Fernkampfschaden ×2, Lebenspunkte der Fernkämpfer = 1 |
| Volle Auslastung | Wagnis | 5 | Echtes Militär | Versorgung ×2, Materialertrag −50 % |
 
**Abweichung gegenüber `branch-konzepte-pacing.md` §4.2:** Echtes Militär und Festungsbau stehen ab Wahl 1 statt ab Wahl 2. Begründung: Die erste Wahl beendet das Tutorial („Wähle eine Karte. Sie verändert dein Reich.“). Ohne Freischaltkarte in der ersten Wahl bliebe dieser Satz leer. „Totale Mobilmachung“ heißt „Volle Auslastung“ (Sprachregel KP.08). „Schmiedekunst“ heißt „Metallverarbeitung“ (PO-Vorgabe).
 
**Akzeptanzkriterien**
 
- Test (Seed-Reihe über 1.000 Angebote): Jedes Angebot enthält mindestens eine Bonuskarte; mindestens eine Pfadkarte, sofern eine ziehbar ist; höchstens eine Wagnis-Karte.
- Test: Keine Technologiekarte im Angebot, solange keine Universität steht.
- Test: Eine nicht gewählte Pfadkarte ist im späteren Angebot wieder ziehbar.
---
 
### REQ-KP.03 Kartenbühne in der Bildmitte
 
**Befund (PO):** Karten werden im Arbeitsfenster unten gezogen. Sie sollen wie ein echtes Kartendeck bzw. eine Auswahl von Karten prominent in der Mitte des Spiel-UIs erscheinen. Die Entscheidung für die Karten soll die zentrale strategische Entscheidung im Spiel werden.
 
**Aufbau**
 
```
┌──────────────────────── Ressourcenleiste ─────────────────────────┐
│                                                                   │
│            Spielwelt (abgedunkelt, weiter sichtbar)               │
│        ┌────────┐   ┌────────┐   ┌────────┐                       │
│        │  BAU   │   │  TECH  │   │ BONUS  │     [Neu ziehen]      │
│        │ Metall-│   │ Fortg. │   │ Weit-  │     [Bannen]          │
│        │verarb. │   │Taktiken│   │ schuss │     [Später]          │
│        │ ...    │   │  ...   │   │  ...   │                       │
│        └────────┘   └────────┘   └────────┘                       │
│            Detailzeile zur gewählten/überfahrenen Karte           │
│  ▒ Stapel (Füllstand = Fortschritt zur nächsten Wahl)             │
├───────────────────────── Arbeitsbereich ──────────────────────────┤
```
 
**Anforderungen**
 
- **Lage:** Die Bühne liegt zentriert über Spielwelt und Arbeitsbereich. Der Mittelpunkt der Kartenreihe liegt horizontal und vertikal innerhalb von ±5 % der Bildmitte. Die Spielwelt bleibt abgedunkelt sichtbar (Wert in `config.js`, Vorschlag 45 %).
- **Kartenformat:** Hochformat 5:7. Breite je Karte 14–18 % der Fensterbreite, mindestens 160 px, höchstens 260 px. Bei 1280×720 sind vier Karten nebeneinander lesbar. Unter 900 px Fensterbreite wechselt die Reihe in zwei Zeilen.
- **Stapel:** Ein Stapelsymbol am unteren Rand der Bildmitte ist dauerhaft sichtbar. Sein Füllstand zeigt den Fortschritt zur nächsten Wahl; daneben steht die Zahl der bisher gewählten Karten. Der Balken in der Ressourcenleiste bleibt.
- **Aufdecken:** Bei einer Wahl fährt der Stapel in die Mitte, die Karten decken nacheinander auf (je ≤ 120 ms, insgesamt ≤ 600 ms) und liegen als leichter Fächer (Winkel höchstens ±6°). Bei `prefers-reduced-motion` erscheinen sie ohne Animation.
- **Karteninhalt:**
  - Kopf: Name und Familienband (Farbe und Symbol).
  - Mitte: Symbol aus den vorhandenen Mitteln (keine neue Grafik).
  - Wirkung: bei Bonus Vorher/Nachher-Wert, bei Bau und Technologie die Zeile „Schaltet frei:“ bzw. „Öffnet Forschung:“ mit den Symbolen der betroffenen Inhalte.
  - Fuß: Stufe (Punkte), Voraussetzung oder Folgekarten, Seltenheit.
- **Vergleichen:** Beim Überfahren oder Fokussieren hebt sich die Karte um etwa 8 %. Eine Detailzeile unter der Reihe nennt Wirkung, Voraussetzungen und, bei Pfadkarten, den Hinweis „Kehrt in den Stapel zurück, wenn nicht gewählt“.
- **Bedienung:** Klick wählt. Tasten `1`–`4` und Pfeiltasten mit `Enter` sind belegt. Jede Karte ist per Tastatur fokussierbar.
- **Aktionen am Rand:** „Neu ziehen“ und „Bannen“ wie in v0.6. „Später“ klappt die Bühne ein (Soll); der Stapel pulsiert, die Wahl bleibt offen, ein Klick auf den Stapel öffnet die Bühne erneut.
- **Öffnen:** Die Bühne öffnet sich automatisch, sobald eine Wahl ansteht. Die Regeln aus REQ-6.04 gelten sinngemäß:
  - Eingabesperre: Klicks werden erst angenommen, wenn die letzte Karte aufgedeckt ist, frühestens 400 ms nach dem Öffnen (Wert in `config.js`).
  - Ist beim Auslösen eine Maustaste gedrückt, öffnet sich die Bühne erst nach dem Loslassen.
  - Mehrere offene Wahlen werden nacheinander angeboten.
- **Arbeitsbereich:** Die Bühne wechselt keinen Reiter. Der Reiter „Karten“ im Arbeitsbereich bleibt als Sammlung (nur Ansicht): gewählte Karten mit Stufen, gebannte Karten, Stand der Pfade. Eine Wahl findet dort nicht mehr statt.
- **Soll – Pfadübersicht:** Die Sammlung zeigt Pfadkarten und Forschungen als Baum mit Status (gesperrt, verfügbar, gewählt, erforscht). Die Community von *Stellaris* wünscht sich diese Sicht ausdrücklich (`branch-konzepte-pacing.md` §3.1).
- **Spielzeit:** Solange die Bühne offen ist, pausiert das Spiel. Der Schalter `KARTENBUEHNE.zeit` kennt `pause` (Standard), `langsam` (Faktor in `config.js`, Vorschlag 0,2) und `lauf`. Claude Code dokumentiert in `docs/STAND.md`, wie sich v0.6 verhielt, und berichtet Abweichungen.
- **Tutorial:** Die Sprechblase der ersten Kartenwahl (REQ-T2.04) sitzt oberhalb der Bühne und verdeckt keine Karte.
**Akzeptanzkriterien**
 
- Playwright: Eine Wahl entsteht → die Bühne ist sichtbar, der Mittelpunkt der Karten liegt innerhalb von ±5 % der Bildmitte, alle Karten des Angebots sind sichtbar und lesbar bei 1280×720 und 1920×1080 (Bildschirmfotos im Bericht).
- Playwright: Ein Klick innerhalb der Eingabesperre wählt keine Karte; ein Klick danach wählt; die Bühne schließt; der Arbeitsbereich zeigt denselben Reiter wie vorher.
- Test: Bei `zeit = pause` ändert sich der Spielstand während der offenen Bühne nicht (Spielzeit, Ressourcen, Einheitenpositionen).
- Test: Eine Wahl entsteht bei gedrückter Maustaste auf dem Klickfeld → kein verlorener Klick; die Bühne öffnet nach dem Loslassen.
- Test: Zwei Wahlen in Folge werden nacheinander angeboten.
- `tooltipAudit` und `explAudit` grün; keine Konsolenfehler.
---
 
### REQ-KP.04 Universität als Forschungsstätte
 
**Ziel:** Die Universität erforscht, was Technologiekarten öffnen. Das ist der Teil der *Stellaris*-Logik, der Forschungsoptionen vom Zufall der Karten trennt: Die Karte öffnet die Option, die Universität bestimmt Zeitpunkt und Reihenfolge.
 
**Anforderungen**
 
- **Forschungsoptionen:** Jede Technologiekarte öffnet eine oder mehrere Forschungen. Geöffnete Forschungen bleiben dauerhaft verfügbar.
- **Forschungsplätze:** Die Universität hat einen Platz; ein Ausbau öffnet einen zweiten. Eine laufende Forschung lässt sich nicht abbrechen. Die Entscheidung gilt damit.
- **Kosten und Dauer:** Jede Forschung kostet Material und Zeit (Startwerte unten). Die Zeit läuft nur bei laufendem Spiel.
- **Beschleunigen:** Wie in REQ-6.06: gegen Material, der Preis je gesparter Sekunde steigt mit der Stufe.
- **Ergebnis:** Eine Forschung liefert eine Einheit, einen Einheitenersatz oder eine Upgrade-Stufe (KP.05).
- **Bestehende Forschungen aus v0.6:** Claude Code inventarisiert sie und ordnet jede entweder der Grundforschung zu (verfügbar, sobald die Universität steht) oder einer Technologiekarte. Die Zuordnung steht im Bericht und wird vom PO freigegeben.
- **Kartenmanipulation:** Die vorhandenen Universitätsfunktionen für die Kartenwahl bleiben und wirken auf die Bühne (Zahl der Karten, Neu ziehen, Bannen).
- **Anzeige im Reiter „Universität“:** Forschungen gruppiert nach Quellkarte; Fortschrittsbalken und Restzeit je laufender Forschung; gesperrte Forschungen mit „Öffnet mit: Karte *Name*“.
- **Rückmeldung:** Abschluss einer Forschung zeigt einen Hinweis und markiert den Reiter (wie REQ-6.06). Der Tooltip nennt Vorher/Nachher.
**Forschungen des Prototyps** (Startwerte, per Simulation zu kalibrieren):
 
| Forschung | Geöffnet von | Dauer | Ergebnis |
|---|---|---|---|
| Reiter | Fortgeschrittene Taktiken | 75 s | Einheit Reiter (schnell, Nahkampf, höhere Kosten) |
| Schildträger | Fortgeschrittene Taktiken | 75 s | Einheit Schildträger (viele Lebenspunkte, geringer Schaden) |
| Eisenwaffen | Eiserne Klingen | 90 s | Läufer → Schwertkämpfer, Werfer → Bogenschützen |
| Mauerausbau III | Befestigungskunde | 60 s | Mauer Stufe 3 baubar |
| Turmausbau | Befestigungskunde | 60 s | Turm Stufe 2 baubar |
 
**Akzeptanzkriterien**
 
- Test: Technologiekarte gewählt → die genannten Forschungen sind in der Universität verfügbar; vorher gesperrt.
- Test: Forschung läuft nur bei laufender Spielzeit; Abschluss liefert das genannte Ergebnis.
- Test: Ein einzelner Forschungsplatz nimmt keine zweite Forschung an; mit zweitem Platz laufen beide.
- Test: Nach Abriss der Universität bleiben abgeschlossene Forschungen wirksam (Entscheidung aus Iteration 6); laufende Forschungen pausieren, bis wieder eine Universität steht.
- Kennzahl: Zeit von der Wahl der Technologiekarte bis zur fertigen Einheit (Median je Profil) wird berichtet.
---
 
### REQ-KP.05 Upgrade-Optionen und Einheitenersatz
 
**Anforderungen**
 
- **Upgrade-Stufen** (Gebäude und Einheitenwerte) haben genau eine Freischaltquelle, eine Karte oder eine Forschung. Die Zuordnung steht als Tabelle im Bericht. Stufe 1 jedes Gebäudes ist ab dem Bau verfügbar; Stufen ab 2 sind gesperrt, bis ihre Quelle erfüllt ist.
- **Einheitenersatz:** `ersetzt` tauscht einen Typ gegen einen anderen. Vorhandene Einheiten auf dem Feld werden beim Abschluss aufgewertet; nichts wird gelöscht und nichts zurückgesetzt (Lehre aus der Kritik an *Civilization VII*).
- **Neue Einheiten sind Datensätze:** Name, Rolle, Werte, Farbton, Kosten, Versorgung. Neues Verhalten und neue Grafik entfallen. Der Schildträger unterscheidet sich zunächst nur durch seine Werte.
- **Armee-Reiter:** Neue Einheiten erscheinen im Reiter „Armee“ erst nach der Forschung, mit Kosten und Erklärzeile.
**Beispiele** (Startwerte; die Zuordnung der vorhandenen Upgrades erfolgt per Inventar):
 
| Upgrade | Gebäude | Quelle |
|---|---|---|
| Schmiede-Ausbau 2 | Schmiede | Forschung Eisenwaffen |
| Kaserne-Ausbau 2 | Kaserne | Forschung Reiter |
| Mauer Stufe 2 | Mauer | Karte Festungsbau |
| Mauer Stufe 3 | Mauer | Forschung Mauerausbau III |
| Turm Stufe 2 | Turm | Forschung Turmausbau |
 
**Akzeptanzkriterien**
 
- Test: Jede Upgrade-Stufe ab 2 hat genau eine Quelle; ohne die Quelle ist sie nicht kaufbar.
- Test: Einheitenersatz wertet vorhandene Einheiten auf; Anzahl der Einheiten bleibt gleich.
- Test: Die Bot-Simulation im Modus `standard` bleibt unverändert.
---
 
### REQ-KP.06 Zufall begrenzen: Meilenstein-Platz, Rückstandsgewicht, Mindesttempo
 
**Befund:** Der größte Einwand gegen Kartenforschung ist das Warten auf die richtige Karte (*Stellaris*-Community) und der Schneeballeffekt über EP (`branch-konzepte-pacing.md` §3.1). Beides gefährdet eine Partie von 20 Minuten.
 
**Anforderungen**
 
- **Meilenstein-Platz:** Ist eine Pfadkarte ziehbar, belegt sie einen der Plätze (siehe KP.02). Die übrigen Plätze bleiben offen.
- **Rückstandsgewicht:** Jede Bau-Karte, die ziehbar war und nicht im Angebot erschien, erhält je Wahl einen Gewichtszuschlag (Wert in `config.js`). Der Zuschlag endet mit dem Erscheinen. Eine ziehbare Bau-Karte erscheint spätestens in der dritten Wahl nach ihrer Freigabe (harte Grenze, Wert in `config.js`).
- **Mindesttempo:** Steht nach `KARTEN.maxAbstand` (Vorschlag 180 s Spielzeit) keine Wahl an, wird die nächste Wahl fällig, und die EP-Schwelle der folgenden Wahl bleibt unverändert. Aktive Spieler erreichen ihre Wahlen weiter früher. Der Abstand zwischen den Profilen „aktiv“ und „gelegentlich“ bleibt ≥ 4 min (Wert aus Iteration 5, per Simulation prüfen).
- **Bannen:** Gebannte Pfadkarten kehren nicht zurück. Der Bericht weist aus, wie oft das zu einer unlösbaren Kette führt (Graphtest aus KP.01 gilt auch nach Bannen: Bannen einer Karte, auf der eine einzige Kette beruht, ist gesperrt oder warnt).
**Akzeptanzkriterien**
 
- Simulation (50 Partien je Feld, beide Strategien): Kaserne gebaut bis Minute 6 in ≥ 90 % der Partien (Profil „durchschnitt“, Normal).
- Simulation: Schmiede gebaut bis Minute 8 in ≥ 80 % der Partien.
- Test: Eine ziehbare Bau-Karte erscheint spätestens in der dritten Wahl nach der Freigabe.
- Verfehlte Zielwerte werden mit Ursache und Vorschlag berichtet.
---
 
### REQ-KP.07 Wagnis-Karten und exklusive Pfade (Soll)
 
**Wagnis-Karten:** „Glaskanonen“ und „Volle Auslastung“ (Tabelle KP.02) haben eine eigene Seltenheit und eine eigene Farbe. Die Wirkung gilt dauerhaft. Das Gegenspiel wählt Claude Code per Simulation (Hinweis aus der Analyse: Glaskanonen hängt fast vollständig davon ab, ob die eigenen Nahkämpfer halten; gegnerische Fernkämpfer und Türme müssen mitentscheiden).
 
**Exklusive Pfade:** Zwei Technologiekarten schließen sich gegenseitig aus (`exklusivMit`). Der Prototyp enthält ein Paar:
 
| Karte | Öffnet Forschung | Linie |
|---|---|---|
| Fortgeschrittene Taktiken | Reiter, Schildträger | Nahkampf |
| Ballistik (Platzhalter) | Armbrustschütze, Katapult (Datensätze) | Fernkampf |
 
Wird eine der beiden gewählt, verschwindet die andere aus dem Pool. Die Detailzeile der Karte nennt den Ausschluss. Zweck: Eine Wahl, die später nicht mehr zurückgenommen werden kann, macht die Entscheidung zur Weichenstellung.
 
**Akzeptanzkriterien**
 
- Siegquote mit und ohne Glaskanonen: Wirkung ≤ +25 pp; Wahlrate 5–60 %.
- Test: Nach Wahl einer Karte aus einem Exklusivpaar erscheint die andere nie wieder.
- Beide Linien liegen im Paarvergleich innerhalb von 15 pp.
---
 
### REQ-KP.08 Tutorial-Sprache
 
**Befund (PO):** Die Sprache im Tutorial ist zu stark und zu gewaltorientiert. Gewünscht sind weniger starke Wörter und ein abstrakterer Ton, etwa statt „Horden aus dem Osten“.
 
**Sprachregel:** Sachlich, ruhig, aus dem Wortfeld von Aufbau, Versorgung und Ordnung. Keine Bedrohungsbilder, keine Wörter für Verletzung oder Vernichtung, keine militärischen Titel.
 
**Glossar**
 
| Bisher (DE) | Neu (DE) | Bisher (EN) | Neu (EN) |
|---|---|---|---|
| Horde(n) | Wellen | horde(s) | waves |
| Soldaten | Einheiten | soldiers | units |
| Feldherr | Statthalter | commander | governor |
| Kriegsbeute | Erfahrung | war spoils | experience |
| gebrochen (Welle) | bestanden | broken | behind us |
| Kampf (Erzählung) | Lage | battle | situation |
| Halte das Tor | Bewahre das Tor | Hold the gate | Look after the gate |
| rekrutieren | aufstellen | recruit | raise |
| Klinge | (entfällt) | blades | (entfällt) |
 
**Ersatztexte** (ersetzen die Entwürfe in `anforderungen-tutorial-2.md` T2.02–T2.05; Länge: Erzählung höchstens etwa 90 Zeichen, Auftrag höchstens etwa 30 Zeichen):
 
| Stelle | Deutsch | Englisch |
|---|---|---|
| B1 Begrüßung | „Willkommen, Statthalter. Ich bin dein Quartiermeister.“ | “Welcome, governor. I am your quartermaster.” |
| B2 Rahmen | „Aus dem Osten nähern sich Wellen. Unser Tor liegt in ihrem Weg.“ | “Waves are approaching from the east. Our gate lies in their path.” |
| Schritt 1 Erzählung | „Ohne Material entsteht nichts. Fang mit eigener Hand an.“ | “Without material, nothing gets built. Start with your own hands.” |
| Schritt 1 Auftrag | „Klicke auf Fertigen.“ | “Click Produce.” |
| Schritt 2 Erzählung | „Deine Hände werden müde. Eine Fabrik fertigt weiter, während du anderes tust.“ | “Your hands will tire. A factory keeps producing while you do other things.” |
| Schritt 2 Auftrag | „Baue eine Fabrik.“ | “Build a factory.” |
| Schritt 3 Erzählung | „Material allein trägt nicht weit. Wir brauchen Einheiten.“ | “Material alone won't carry us far. We need units.” |
| Schritt 3 Auftrag | „Stelle drei Läufer auf.“ | “Raise three runners.” |
| Schritt 4 Erzählung | „Deine Einheiten rücken mit der nächsten Welle aus und treffen auf die Gegenseite.“ | “Your units move out with the next wave and meet the other side.” |
| Schritt 4 Auftrag | „Sieh zu, wie sie ausrücken.“ | “Watch them move out.” |
| Schritt 5 Erzählung (Kartenwahl) | „Die erste Welle ist bestanden. Aus jeder Lage lernen wir etwas.“ | “The first wave is behind us. We learn something from every situation.” |
| Schritt 5 Auftrag | „Wähle eine Karte. Sie verändert dein Reich.“ | “Choose a card. It will change your realm.” |
| Schwebende Zahl (T2.04) | „+EP Erfahrung“ | “+XP experience” |
| A1 Abschied, Modus `karten` | „Vieles ist noch verschlossen. Deine Karten öffnen den Weg.“ | “Much is still closed. Your cards open the way.” |
| A1 Abschied, Standardmodus | „Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden.“ | “Walls, towers, forge, university – much is waiting to be discovered.” |
| A2 Abschied | „Was neu ist, ist markiert. Bewahre das Tor, Statthalter.“ | “Whatever is new is marked. Look after the gate, governor.” |
 
**Weitere Regeln**
 
- Der „Quartiermeister“ behält seinen Namen (Anhang, offene Punkte).
- Die Einheitenbezeichnung in Schritt 3 und das Schaltflächenwort („aufstellen“ bzw. das vorhandene Wort im Spiel) gleicht Claude Code mit den vorhandenen Text-Schlüsseln ab; im Zweifel gilt das Wort der Schaltfläche.
- Die neuen Karten-, Forschungs- und Hinweistexte dieses Branches folgen derselben Sprachregel.
- **Sprach-Audit:** Ein Test prüft alle Schlüssel mit dem Präfix `tutorial.` sowie die neuen Karten- und Hinweistexte in beiden Sprachen gegen eine Wortliste in `tools/`. Die Liste enthält mindestens: Horde, Soldat, Feldherr, Krieg, Beute, Schlacht, gebrochen, vernichten, töten, Waffe, Blut; horde, soldier, commander, war, loot, battle, kill, destroy, weapon, blood. Die Wörter des Spiels selbst (etwa „Kampf“ als Armeezustand in der Ressourcenleiste) sind ausgenommen.
**Akzeptanzkriterien**
 
- Sprach-Audit grün für `tutorial.`-Schlüssel und neue Texte.
- Alle neuen Texte liegen in beiden Sprachen vor; die Längenregel gilt.
- Bot-Simulation mit gleichem Seed liefert dieselben Ergebnisse wie vorher (Texte ändern keine Spiellogik).
- Bildschirmfoto der ersten Sprechblase in beiden Sprachen im Bericht.
---
 
### REQ-KP.09 Bots, Messung, Bericht, Testbuild
 
**Bots:** Beide Strategien („Simulations-Bot“, „einheiten-zuerst“) bekommen eine Kartenlogik für Pfadkarten: Verlangt ihre Bauordnung ein Gebäude oder eine Einheit, die eine Karte im Angebot freischaltet, wählen sie diese; sonst gilt die bisherige Regel. Drei Pfad-Varianten messen die Strategievielfalt:
 
| Variante | Pfadreihenfolge |
|---|---|
| Militär zuerst | Echtes Militär → Fortgeschrittene Taktiken |
| Wissen zuerst | Gelehrte → Eiserne Klingen |
| Festung zuerst | Festungsbau → Befestigungskunde |
 
**Kennzahlen (Kurzsimulation, 50 Partien je Feld; keine volle Abnahmeserie)**
 
| Kennzahl | Zielwert |
|---|---|
| Strategievielfalt: Siegquote der drei Pfad-Varianten | innerhalb 15 pp |
| Wahlbreite je Karte | 5–60 % der Angebote |
| Paarvergleich je Pfadkarte (gleicher Seed, Karte erzwungen oder gesperrt) | +3 bis +25 pp |
| Kaserne bis Minute 6, Schmiede bis Minute 8 | ≥ 90 % bzw. ≥ 80 % der Partien |
| Zeit von Wahl der Technologiekarte bis fertige Einheit | berichten |
| Zahl der Kartenwahlen je Partie, Zeitpunkte | berichten |
| Partielänge, 90. Perzentil | ≤ 20 min |
| Patt-Quote | ≤ 2 % |
| Modus `standard` | identisch zu `main` bei gleichem Seed |
 
**Bericht:** `docs/bericht-kartenpfad.md` im bisherigen Aufbau. Er enthält die Zuordnungen aus KP.02 (Inventar der Karten nach Familie), KP.04 (bestehende Forschungen) und KP.05 (Upgrades), die Bildschirmfotos der Bühne und die Liste der Auslegungen zur Freigabe durch den PO.
 
**Testbuild:** `?debug=1` mit Protokollexport. Neue Felder: gewählte Karte je Wahl samt Alternativen, Zeit bis zur Wahl (Bedenkzeit), Nutzung von Neu ziehen und Bannen, Zeitpunkt jeder Freischaltung und Forschung. Der Testleitfaden fragt zusätzlich: „Welche Karte hast du gewählt und warum?“ und „Wann hast du auf eine Karte gewartet?“
 
---
 
## 4. Inkrementplan
 
| Inkrement | Inhalt | REQ |
|---|---|---|
| KP.0 | Voraussetzungen prüfen; Unterbau auf `main` nachziehen, falls er fehlt; Basislinie (Zahl und Zeitpunkte der Kartenwahlen je Partie) | KP.01 |
| KP.1 | Tutorial-Sprache, Glossar, Sprach-Audit | KP.08 |
| KP.2 | Kartenbühne mit Stapel, Aufdecken, Bedienung; Reiter „Karten“ wird Sammlung | KP.03 |
| KP.3 | Kartenfamilien, Datenmodell, Bau-Karten, Startzustand `karten`, Meilenstein-Platz, Rückstandsgewicht | KP.01, 02, 06 |
| KP.4 | Universität: Forschungsoptionen, Technologiekarten, Forschungsplätze | KP.04 |
| KP.5 | Upgrade-Stufen, Einheitenersatz, neue Einheiten als Datensätze | KP.05 |
| KP.6 | Wagnis-Karten, exklusive Pfade, Mindesttempo | KP.06, 07 |
| KP.7 | Bots, Kurzsimulation, Bericht, Testbuild | KP.09 |
 
**Reihenfolge:** KP.1 und KP.2 sind unabhängig vom Pacing und nützen in jedem Modus. Sie stehen vorn, weil sie sofort spielbar sind und der PO sie früh prüfen kann.
 
**Abbruchregel:** Jedes abgeschlossene Inkrement ist spielbar. Bei knappem Budget gilt diese Priorität:
 
1. KP.1, KP.2,
2. KP.0, KP.3,
3. KP.4,
4. KP.5,
5. KP.7 (mindestens Bericht und Testbuild),
6. KP.6.
Ein halb fertiges Inkrement wird nicht committet; der Stand wird in `docs/STAND.md` beschrieben.
 
## 5. Schwache Annahmen und offene Punkte
 
| Punkt | Risiko | Standard |
|---|---|---|
| **Zweistufiger Weg zur Einheit** (Technologiekarte, dann Forschung) | Neue Einheiten kommen frühestens nach Wahl plus Forschungsdauer, bei 75–90 s je Forschung zusätzlich zur Wartezeit auf die Wahl. In einer Partie von 20 Minuten kann das zu spät sein. Die Zahl der Wahlen je Partie ist in KP.0 zu messen, bevor die Dauer feststeht. | Dauer per Simulation einstellen; zweiter Forschungsplatz und Beschleunigen mit Material als Entlastung |
| **Scheinentscheidung Freischaltung** | Ohne Kaserne und Schmiede kommt keine Partie aus. Die Wahl „Bau-Karte oder Bonus“ betrifft dann nur den Zeitpunkt der Freischaltung. Die Entscheidung von Gewicht liegt in der Reihenfolge der Pfade. | Strategievielfalt über drei Pfad-Varianten messen (KP.09); Exklusivpfade als Soll (KP.07) |
| **Schneeball über EP** | Wer früh Abschüsse macht, bekommt früh Technologie. Die Universität als Kartenquelle verstärkt den Effekt. | Mindesttempo (KP.06); Abstand der Profile messen |
| **Pause bei offener Bühne** | Häufige Wahlen unterbrechen den Fluss; das Zuschauen beim Aufmarsch war nach Tests der größte Spaßfaktor. | Pause als Standard, Schalter für Zeitlupe; „Später“ als Entlastung (Soll) |
| **Unlösbare Ketten durch Bannen** | Wer eine Schlüsselkarte bannt, sperrt Inhalte. | Graphtest und Warnung (KP.06) |
| **Gemeinsame Auswahl statt Kategorien** | Weniger Steuerung über den Spielstil als bei drei festen Kategorien. | Gemeinsame Auswahl; Kategorien nur nach Spieltest erneut prüfen |
| **Name „Quartiermeister“, Anrede „Statthalter“** | Beide Begriffe sind noch verwaltungsnah, aber nicht neutral. | Übernehmen, PO kann ändern |
| **Anzahl Karten je Angebot** | Drei Karten sind eine Annahme. | 3, Universität +1; per Spieltest prüfen |
| **Neue Grafik** | Reiter, Schildträger und Kartenmotive tragen zunächst nur Farbton und Symbol. | Entfällt in diesem Teil; Asset-Liste nach Spieltest |
 
## 6. Definition of Done
 
- `npm test` und `browser-check.mjs` grün, mit neuen Tests je REQ.
- Invarianten eingehalten; Modus `standard` unverändert.
- Kurzsimulation mit beiden Strategien und allen Kennzahlen aus KP.09; verfehlte Zielwerte mit Ursache und Vorschlag berichtet.
- Sprach-Audit grün.
- `docs/bericht-kartenpfad.md`, `docs/STAND.md`, `CHANGELOG.md` und Testleitfaden aktualisiert.
- Branch `exp/kartenpfad` mit eigenem Link für Spieltests (GitHub Pages je Branch, siehe `branch-konzepte-pacing.md` §4.4).
## Anhang: Zuordnung der PO-Wünsche
 
| Wunsch | Inhalt | REQ |
|---|---|---|
| Fortschritt über Karten steuern, Stellaris-Vorbild | Forschungsoptionen, Upgrades, Gebäude über Karten | KP.01, 02, 04, 05 |
| Metallverarbeitung / Fortgeschrittene Taktiken als Beispiele | Bau-Karte vs. Technologie-Karte | KP.02, 04 |
| Wahl als Alternative zu Boni | Zusammensetzung des Angebots | KP.02 |
| Tutorial-Sprache weniger stark, abstrakter | Glossar und Ersatztexte | KP.08 |
| Karten als Auswahl in der Bildmitte, zentrale Entscheidung | Kartenbühne | KP.03 |

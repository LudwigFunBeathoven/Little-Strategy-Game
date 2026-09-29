# Klammerfront – Anforderungen Iteration 4 (Version 2, kompakt)

Stand: 28.09.2026 · Ersetzt Version 1 · Branch: weiter auf `iteration-3` · Commit-Präfix `I4.x:` · Die Defaults gelten, bis der PO widerspricht.

## 0. Vor dem Start
1. Die alte `docs/STAND.md` nach `docs/archiv/STAND-iteration-3.md` verschieben. Eine neue `docs/STAND.md` mit der Inkrementliste aus Abschnitt 2 anlegen.
2. In `CLAUDE.md` den Verweis auf den aktuellen Auftrag auf diese Datei ändern.
3. Wurden nach Version 1 bereits Inkremente umgesetzt, diese abgleichen und nicht wiederholen. Abweichungen in `STAND.md` notieren.
4. Im Plan `git diff main...iteration-3 --stat` prüfen und die Konfliktrisiken für den Merge nennen.
5. Im Plan die vollständige Kartenliste für REQ-45 zur Freigabe vorlegen.

## 1. Ziel
- `iteration-3` wird merge-fähig für `main`.
- Leitlinie aus dem Test mit dem PO: Am meisten Spaß machten die Automatisierung und das Zuschauen, wenn große Armeen aufmarschieren. Beides wird gestärkt.
- Die Spezialkarten werden deutlich ausgebaut.
- „Halten" entfällt.
- Nicht Teil dieser Iteration: Touch-Optimierung, Umbau des Handelskontors, neue Systeme außerhalb dieser Liste.

## 2. Inkremente (jedes endet spielbar nach Anhang A aus Iteration 3)

| Inkr. | Inhalt | REQ | Prio |
|---|---|---|---|
| I4.1 | „Halten" entfernen | 41 | P0 |
| I4.2 | Formation | 42 | P0 |
| I4.3 | Lane-übergreifender Kampf | 43 | P0 |
| I4.4 | Automatisierung und große Armeen | 44 | P1 |
| I4.5 | Kartenausbau | 45 | P1 |
| I4.6 | Vertikales Layout, Reich in der Spielwelt, Scrollen | 46 | P1 |
| I4.7 | Gestaffelte Einführung | 47 | P2 |
| I4.8 | Simulation, Balancing, Bericht, Merge-Bereitschaft | 48 | P2 |

---

## REQ-41 „Halten" entfernen
- Entfernt werden: der Schalter, `HOLD_DISCOUNT`, die zugehörigen Texte in `de` und `en`, der Tooltip, der Erstkontakt-Hinweis, die Tests und die Bot-Strategie „Halten".
- Der Bot „nur Verteidigung" kauft ab jetzt einfach keine Einheiten.
- **Akzeptanzkriterium:** Eine Suche nach `hold` und „Halten" im Code ergibt keine Treffer außer im Archiv; alle Tests sind grün.

## REQ-42 Formation
- **Formation:** Alle Einheiten einer Welle in derselben Lane bilden eine Formation. Das gilt für beide Teams.
- **Tempo:** Alle Einheitentypen bewegen sich mit derselben Geschwindigkeit, `FORMATION_SPEED`.
- **Aufbau:** Vorn eine Reihe Nahkämpfer, quer zur Lane, höchstens `FORMATION_ROW_MAX = 5`. Überzählige Nahkämpfer bilden eine zweite Reihe, die Fernkämpfer stehen dahinter.
- **Bewegung:** Die Formation bewegt sich als Block und hält an, sobald die vorderste Reihe Kontakt hat.
- **Kampf:**
  - Die ganze vorderste Reihe greift gleichzeitig an.
  - Fernkämpfer greifen an, solange höchstens `RANGED_RANGE_ROWS` Reihen vor ihnen stehen.
  - Fällt eine Reihe, rückt die nächste auf.
- **Verschmelzen:** Holt eine Formation eine kämpfende eigene Formation derselben Lane ein, verschmelzen beide.
- **Anti-Patt-Regeln:** Die Regeln 21–23 aus dem Archiv per Kurzsimulation ohne sie testen. Bei höchstens 2 % Patts werden sie entfernt.
- **Akzeptanzkriterien (Tests):**
  - Alle Einheiten einer Formation haben dieselbe Geschwindigkeit.
  - Drei Nahkämpfer vorn verursachen den dreifachen Schaden eines einzelnen.
  - Eine Formation verschmilzt mit einer kämpfenden eigenen Formation.

## REQ-43 Lane-übergreifender Kampf
- **Vorrang:** Ziele in der eigenen Lane gehen immer vor.
- **Wechsel:**
  - Ohne Ziel in der eigenen Lane innerhalb von `SUPPORT_RANGE` wechselt die Formation in eine Nachbar-Lane mit Gegner in diesem Abstand. Die Mitte hat dabei Vorrang.
  - Ein direkter Wechsel zwischen oben und unten ist nicht möglich.
  - Der Wechsel ist eine sichtbare Querbewegung.
- **Rückkehr:** Nach dem Kampf kehrt die Formation in ihre Lane zurück und rückt weiter vor.
- **Türme:** Sie greifen zuerst Gegner ihrer eigenen Lane an. Ohne Ziel dort greifen sie Gegner in der Mitte innerhalb von `TOWER_RANGE` an.
- Für Gegner gelten dieselben Regeln.
- **Akzeptanzkriterien (Tests):**
  - Kein Wechsel, solange die eigene Lane ein Ziel hat.
  - Kein direkter Wechsel zwischen oben und unten.
  - Rückkehr in die eigene Lane nach dem Kampf.

## REQ-44 Automatisierung und große Armeen
- **Automatische Presse:**
  - Ab Phase Mitte läuft die Presse mit 50 % der Referenzrate (6 Klicks/s), ab Phase Spät mit 100 %.
  - Der Ertrag ist das Maximum aus automatischem und manuellem Klicken.
  - Die Sollwerte aus REQ-03 bleiben.
- **Erste Fabrik:** gratis (`FIRST_FACTORY_FREE = true`).
- **Größere Armeen:**
  - Die Kaserne hebt das Versorgungslimit weiter um 2 je Stufe, Karten können es zusätzlich erhöhen.
  - Harte Obergrenze: `SUPPLY_CAP_MAX = 15`.
  - Gegnerwellen wachsen mit der Spielzeit ebenfalls bis 15 Einheiten, damit große Armeen auf große Armeen treffen. Die Stärke je Einheit wird entsprechend neu kalibriert.
- **Aufmarsch zeigen:** Der Knopf „Front folgen" hält die Kamera an der vordersten eigenen Formation, bis der Spieler selbst scrollt.
- **Performance:** Mit 60 Einheiten gleichzeitig liegt die Bildzeit im Median bei höchstens 20 ms, gemessen in der Browser-Prüfung.

## REQ-45 Kartenausbau
- **Pool:** mindestens 36 Karten (heute 18), verteilt auf fünf Kategorien mit mindestens je 6 Karten: Wirtschaft, Armee, Basis, Automatisierung, Sonderregel.
- **Seltenheit:**
  - Ziehgewichte: gewöhnlich 70, selten 25, legendär 5.
  - Legendäre Karten ändern eine Spielregel, haben einen spürbaren Nachteil und sind einmalig.
  - Höchstens eine legendäre Karte pro Angebot.
- **Angebot:** Karten aus mindestens zwei Kategorien.
- **Synergien:** Mindestens 6 Karten werden mit der Zahl bereits gewählter Karten einer Kategorie stärker.
- **Stufen:** Stufen I–III bleiben für geeignete Karten.
- **Datenmodell:** Die Felder `category`, `rarity` und `synergy` kommen hinzu.
- **Darstellung:** Farbe je Kategorie, Rahmen je Seltenheit. Die gewählten Karten stehen mit Stufe in der Seitenleiste.
- **Neue Karten (Beispiele, Defaults; den Rest schlägt der Agent im Plan vor):**

| Karte | Kategorie · Seltenheit | Effekt | Nachteil |
|---|---|---|---|
| Dauerauftrag | Automatisierung · selten | Füllt die Warteschlange bei jedem Takt mit der zuletzt gekauften Zusammensetzung, soweit das Material reicht | – |
| Instandhaltung I–III | Automatisierung · gewöhnlich | Abschnitte unter 50 % werden automatisch repariert, zu 80 / 65 / 50 % der Kosten | – |
| Werkmeister | Automatisierung · selten | Die Schmiede kauft ihre nächste Stufe selbst, sobald das Material das Doppelte des Preises erreicht | – |
| Rationalisierung | Automatisierung · selten | Fabriken +5 % je gewählter Automatisierungskarte | – |
| Kriegstrommeln | Armee · gewöhnlich | Formationen ab 5 Einheiten +15 % Schaden | – |
| Schildwall | Armee · gewöhnlich | Eine voll besetzte Nahkampfreihe hat +20 % Lebenspunkte | – |
| Veteranen | Armee · selten | +4 % Einheitenstärke je gewählter Armeekarte | – |
| Bastion | Basis · gewöhnlich | Türme +25 % Reichweite | – |
| Große Armee | Sonderregel · legendär | Versorgungslimit ×2 | Wellentakt 40 s statt 20 s |
| Alles auf die Mitte | Sonderregel · legendär | Alle Einheiten gehen in die Mitte, +40 % Stärke | Mauerabschnitte −30 % Lebenspunkte |

- **Akzeptanzkriterien (Tests):**
  - Kein Angebot enthält zwei legendäre Karten.
  - Jedes Angebot enthält mindestens zwei Kategorien.
  - Synergiewerte stimmen bei 0, 1 und 3 gewählten Karten.

## REQ-46 Vertikales Layout, Reich in der Spielwelt, Scrollen
- **Layout:** Die Spielwelt ist der Hauptbereich. Die Bedienung liegt in einer Seitenleiste rechts, von oben nach unten:
  1. Ressourcen und Presse
  2. Welle: Countdown, Warteschlange, Versorgung, Gegnervorschau, Belagerung
  3. Einheiten
  4. Kontext: Bauplatz oder Gebäude
  5. Gewählte Karten
- **Seitenleiste:** Ist sie höher als das Fenster, scrollt sie vertikal. Zielgröße ist Desktop ab 1280 px Breite.
- **Reich:**
  - Das 3×3-Raster liegt am linken Ende der Spielwelt als kleines Reich, vollständig von der Mauer umschlossen.
  - Zur Lane-Seite liegen Mauer mit Turm oben, Tor, Mauer mit Turm unten.
  - Gebäude erscheinen als Icons auf ihren Parzellen. Die Icons aus `main` werden übernommen. Leere Parzellen zeigen ein „+".
  - Ein Klick auf eine Parzelle öffnet das Kontext-Panel.
  - Schäden an der Mauer sind sichtbar.
- **Stil:** Draufsicht mit klar abgegrenzten Parzellen, angelehnt an 9 Kings. Keine Grafiken oder Assets anderer Spiele.
- **Scrollen:**
  - Die Spielwelt ist doppelt so breit wie der Anzeigebereich.
  - Scrollen per Mausrad, per Ziehen (ab 5 px Bewegung), per Pfeiltasten oder A/D und per Scrollleiste.
  - Zwei Sprungknöpfe: „Reich" und „Front".
  - Nimmt ein Abschnitt außerhalb des Bildes Schaden, erscheint ein Markierungspfeil am Rand.
- **Akzeptanzkriterien (Browser-Prüfung):**
  - Bei 1280×720 und 1920×1080 scrollt die Seite nicht horizontal.
  - Alle Scrollwege funktionieren.
  - Ein Klick auf eine Parzelle löst keinen Scroll aus.

## REQ-47 Gestaffelte Einführung
- **Reihenfolge:** Die Systeme erscheinen nacheinander:
  - Zu Beginn: Presse, Fabrik, Einheiten.
  - Mit der ersten Welle: Wellenleiste.
  - Mit der ersten Stufe: Karten.
  - Ab der zweiten Stufe: Verstärkungsgebäude.
  - 60 s vor der Belagerung: deren Anzeige.
- **Hinweise:** Jedes System bekommt beim ersten Auftreten einen einmaligen Hinweis.
- **Überspringen:** Auf dem Startbildschirm gibt es die Option „Einführung überspringen". Dann sind alle Systeme sofort sichtbar.

## REQ-48 Simulation, Balancing, Bericht, Merge-Bereitschaft
- **Kalibrierung:**
  - `XP_BASE` anheben, bis der Median-Abstand zwischen Karten im Frühspiel mindestens 45 s beträgt.
  - `POST_SIEGE_GROWTH` und `UNIT_STRENGTH_PER_LEVEL` neu kalibrieren.
- **Bot:** Die Vorausschau der Heuristik bewertet die Belagerungswelle.
- **Kartenmessung:**
  - Vergleich „angeboten und gewählt" gegen „angeboten und nicht gewählt", je Stufe.
  - Wahlraten je Kategorie und Seltenheit.
  - Anteil der Partien mit mindestens einer legendären Karte.
- **Weitere Kennzahlen:**
  - Patt-Quote.
  - Größte eigene Armee je Partie.
  - Median-Zeit bis zum Fall des ersten Mauerabschnitts.
  - Bildzeit mit 60 Einheiten.
- **Sollwerte:** wie REQ-21.4 und REQ-03. Zusätzlich:
  - Keine Karte liegt mehr als 25 Prozentpunkte über ihrem Vergleichswert.
  - Das Profil „aktiv" gewinnt mindestens so oft wie „durchschnitt".
- **Merge-Bereitschaft:** Erreicht, wenn alle Punkte erfüllt sind:
  - P0 und P1 erledigt, alle Tests grün.
  - Patt-Quote höchstens 2 %.
  - Kein offenes `##LÜCKE`.
  - Toter Code und entfallene Konstanten entfernt.
  - README (Start, Steuerung, Scrollen) und CHANGELOG aktualisiert.
  - `docs/bericht-iteration-4.md` liegt vor.
- **Merge:** Der Merge nach `main` erfolgt erst nach ausdrücklicher Freigabe durch den PO. Der Agent bereitet Pull Request oder Merge-Befehle vor und nennt die erwarteten Konflikte.

## Konfiguration (neu)
`FORMATION_SPEED` (Mittelwert der bisherigen Geschwindigkeiten) · `FORMATION_ROW_MAX` 5 · `SUPPORT_RANGE` (eine Formationslänge) · `TOWER_RANGE` (bisheriger Wert) · `AUTO_PRESS_MID` / `AUTO_PRESS_LATE` 0.5 / 1.0 · `FIRST_FACTORY_FREE` true · `SUPPLY_CAP_MAX` 15 · `CARD_RARITY_WEIGHTS` 70 / 25 / 5 · `WORLD_WIDTH_FACTOR` 2. Entfällt: `HOLD_DISCOUNT`.

## Offene Punkte (Defaults gesetzt)
- **Handelskontor:** bleibt unverändert; Kandidat für die Streichung nach dem nächsten Test mit Menschen.
- **Universität:** bleibt bei einer zusätzlichen Kartenoption.
- **„In der Mitte gruppieren":** gelesen als Vorrang der Mitte beim Lane-Wechsel.

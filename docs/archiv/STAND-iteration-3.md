# Klammerfront – Stand Iteration 3

Grundlage: `docs/anforderungen-iteration-3.md`. Branch: `3x3-und-3-Lanes-Spiel` (das Dokument nennt `iteration-3`; gearbeitet wurde auf Wunsch des PO im aktuellen Branch). Jedes Inkrement erfüllt die Definition „spielbar“ (Anhang A), bevor das nächste beginnt.

**Starten:** `index.html` im Browser öffnen. Keine Installation nötig.

| Inkrement | Inhalt | Status |
|---|---|---|
| I1 | Drei Lanes, Formation, Basis mit Abschnitten (REQ-11–13) | fertig |
| I2 | Wellen mit Versorgungslimit, Wellenbefehl „Halten“ (REQ-14–15) | fertig |
| I3 | 3×3-Raster, Fabriken, Umbau von Kaserne und Schmiede (REQ-16–17) | fertig |
| I4 | Spezialkarten mit Stufen (REQ-18) | fertig |
| I5 | Belagerungswelle statt Eskalation (REQ-19) | fertig |
| I6 | Erklärzeilen, Erstkontakt-Hinweise (REQ-20) | fertig |
| I7 | Simulation, Balancing, Bericht (REQ-21) | fertig |

## Prüfung je Inkrement
```
npm test                                   # Logiktests
npm run test:browser                       # Browser-Prüfung (braucht Playwright)
node tools/simulate.mjs --suite kurz       # 20 Partien Normal, gierige Heuristik: 0 offen, Siegquote 20–100 %
node tools/simulate.mjs --suite ohneSchmiede --runs 40   # REQ-17: Siegquote ohne Schmiede
KF_OVERRIDE='{"FX_QUALITAET":0.2}' node tools/simulate.mjs --suite kurz   # Balancing-Versuch ohne Dateiänderung
```

## Letzte Prüfung
- I1: `npm test` 28/28 grün. Kurzsimulation: 20 Siege, 0 offen, Median 7:31.
- I2: `npm test` 33/33 grün (der Test zur Übergangsregel 12.2 entfällt mit REQ-14.6). Kurzsimulation: 9 Siege, 11 Niederlagen, 0 offen.
  Serie mit 10 Partien je Schwierigkeitsgrad und Spielertyp: 0 offen.
- I3: `npm test` 38/38 grün. Kurzsimulation: 20 Siege, 0 offen, Median 5:57.
  Ohne Schmiede (`--suite ohneSchmiede`, 40 Partien Normal): 19 Siege = 48 % (Soll ≥ 30 %). Dafür wächst die Gegnerwelle auf Normal
  mit 0,6 statt 0,8 Einheiten pro Minute. Feinabstimmung auf die Zielkorridore folgt in I7.
- I4: `npm test` 45/45 grün. Kurzsimulation: 20 Siege, 0 offen, Median 5:59.
- I5 und I6 (ein gemeinsamer Commit, weil I6 entstand, während die Simulationen zu I5 liefen): `npm test` 53/53 grün,
  `npm run test:browser` grün in beiden Sprachen. Kurzsimulation: 20 Siege, 0 offen.
  Auf Schwer bleiben nach I5 noch einzelne Partien nach 30 Minuten offen; das ist Gegenstand von I7.
- I7: `npm test` 53/53 grün, `npm run test:browser` grün. Serie 3.000 Partien (200 je Schwierigkeitsgrad und Profil): 0 offen,
  „nur Verteidigung“ verliert immer, spätestens 23:58. Kurzsimulation: 18 Siege, 2 Niederlagen, 0 offen. Ohne Schmiede 32 %.
  Ergebnisse und Abweichungen: `docs/bericht-iteration-3.md`, Rohdaten `reports/req21-*`.

## Abweichungen und Auslegungen
1. **„Tor belagert“ entfällt bereits in I1** statt in I2 (REQ-14.5). Je Lane angewandt, blockierte die Regel die Warteschlange dauerhaft: Die Übergangsregel 12.2 füllt sie zyklisch, belagerte Lanes stauen sich. Die Kurzsimulation endete dadurch im Patt.
2. **Verteilung bei zwei Einheiten (12.1):** Verglichen werden die angekündigten Gegnerwellen oben und unten; die Mitte ist mit der ersten Einheit schon besetzt.
3. **Erklärzeile ab I1:** Alle Kaufknöpfe (Upgrades, Einheiten, Reparatur) tragen die Zeile „Wirkung · Kosten“ schon jetzt, weil die neuen Knöpfe aus I1 sie nach Anhang A brauchen und der Mechanismus für alle Kaufknöpfe derselbe ist.
4. **Gegnerischer Turm:** Er trifft die nächste eigene Einheit in Reichweite, gleich in welcher Lane. Das Dokument regelt nur die eigenen Türme.
5. **Lebenspunkte der Abschnitte:** Mauer oben und unten je 400, Tor 600 (bisher 600 für die ganze Basis). „Verstärkung“ gilt für alle drei Abschnitte.
6. **Rang in der Kolonne (12.4)** zählt die eigenen Einheiten *zwischen* Einheit und Ziel. Eine Einheit, die schon hinter der gegnerischen Kolonne steht, blockiert ihre Kolonne sonst dauerhaft (Patt auf Schwer in der Simulation).
7. **Vorposten** stellt Einheiten weiter vorn auf, aber nie hinter der vordersten gegnerischen Einheit der Lane. Sonst greifen die neuen Einheiten Gegner in ihrem Rücken nie an.
8. **Gegnerwellen:** Größe = `waveBase + waveGrowth × Minute` je Schwierigkeitsgrad, Lane je Einheit zufällig über den seedbaren Spielzufall (14.3). Die Formation (Nahkämpfer vorn) gilt auch für Gegner (12.5).
9. **Kaserne bis I3:** „Exerzierplatz“ entfällt (es gibt keinen Aufstellabstand mehr), „Große Stube“ hebt das Versorgungslimit um 1.
10. **Vorschau:** Links am Tor zeigt das Schlachtfeld zusätzlich, wie sich die eigene Warteschlange verteilen wird.
11. **Schmiede (17.3):** Ein einziges Upgrade „Qualitätsstufe“ ersetzt Klingen, Rüstung und Drill: +25 % Schaden und Lebenspunkte je Stufe (multiplikativ), Kosten ×2,5 je Stufe.
12. **Kaserne (17.1):** Das Gebäude selbst ist Ausbaustufe 1 (Versorgung 5), das Upgrade „Ausbau“ hebt auf Stufe 2 (7) und 3 (9). Rekrutierung und Große Stube entfallen.
13. **Preise der Verstärkungsgebäude:** fest je Typ (Schmiede 200, Kaserne 150, Universität 300, Handelskontor 250). Das Dokument nennt nur die Fabrikpreise.
14. **Ehemalige Fabrik-Upgrades als Karten (16.4):** Druckluft und Fließbandtakt gehen in „Bessere Fabriken“ auf (+25 % je Wahl, bis zu 3×), Serienbau wird „Fabriken −15 % Kosten“, Nachtschicht „+4 h Abwesenheit“. Die Fertiger entfallen ersatzlos.
15. **Schlachtfeld ohne Gebäude:** Die Gebäude stehen nur noch im 3×3-Raster unter dem Schlachtfeld, nicht mehr im Bild. Neun Gebäude passen nicht sinnvoll neben die Mauer.
16. **Stufen der übrigen Karten (18.6, Vorschlag):**

    | Karte | Stufen | Wirkung I / II / III | Nachteil I / II / III |
    |---|---|---|---|
    | Scharfschützen | 1 | Turmschaden gegen Fernkämpfer +100 % | – |
    | Schrottsammler | 2 | Altmetall +30 / +60 % | – |
    | Belagerungsgerät | 2 | Schaden gegen Basen +60 / +120 % | gegen Einheiten −20 / −35 % |
    | Sappeure | 2 | gegnerische Basis −2 / −5 LP/s | – |
    | Vorposten | 1 | Start 150 weiter vorn | alle Abschnitte −15 % LP |
    | Lange Wurfarme | 2 | Werfer-Reichweite +25 / +50 | Werfer −15 / −30 % LP |
    | Doppelschicht | 2 | Fabrikproduktion +25 / +50 % | Klickertrag −50 / −75 % |
    | Kriegsanleihe | 3 | Material für 60 / 90 / 120 s Produktion | Gegner +8 / +16 / +25 % LP |
    | Serienbau | 2 | Fabriken −15 / −30 % Kosten | – |
    | Nachtschicht | 2 | Abwesenheit +4 / +8 h | – |

    Akkordlohn entfällt (ersetzt durch Aushebung).
17. **Werte je Stufe sind absolut:** Stufe II „+60 %“ ersetzt Stufe I „+25 %“, statt sich zu multiplizieren.
18. **Turmkanoniere** werden wie Scharfschützen nur angeboten, wenn ein Turm steht. Ohne Turm wäre die Karte wirkungslos.
19. **Schwere Pressen und Vorposten** senken die Lebenspunkte aller drei Abschnitte. „Mauerabschnitte“ umfasst im Dokument das Tor (bei der Maurerkolonne ist es ausdrücklich ausgenommen).
20. **Maurerkolonne** heilt nur stehende Mauern. Eine gefallene Mauer braucht weiter eine Reparatur, sonst würde der Turm ohne Reparatur wieder aktiv (13.2).
21. **Belagerungswelle (19.2): „dreifache Stärke“ = dreifache Lebenspunkte und dreifacher Schaden je Einheit**, bei normaler Wellengröße.
    Mit dreifacher *Anzahl* bleibt die Welle fast wirkungslos: In der Kolonne greifen nur die vordersten Einheiten an (12.4).
    Gemessen: Torschaden 21 LP/s gegen Reparatur und Regeneration 23 LP/s, die Partie blieb offen.
22. **Stärkewachstum erreicht die Gegner im Feld:** Mit jeder Welle werden gegnerische Einheiten, die schon kämpfen, auf die aktuelle
    Stärke angehoben (nie abgesenkt). Sonst belegt ein Stau alter, schwacher Einheiten die Feldgrenze, und das Wachstum kommt nie an.
23. **Reparatur mit Abklingzeit:** je Abschnitt höchstens alle 5 s (`REPAIR_COOLDOWN_S`). Ohne Grenze repariert ein Spieler mit
    hohem Materialfluss schneller, als der Gegner Schaden macht. Das ist eine neue Regel gegen Patts und braucht die Zustimmung des PO.
24. **Hinweise (20.2):** erscheinen als Leiste am unteren Rand über allen Fenstern und bleiben, bis „Verstanden“ geklickt wird.
    Auslöser: Abmarsch der ersten Welle, erste Kartenwahl, erster „Halten“-Befehl, Öffnen der ersten Abriss-Bestätigung, Ankündigung der
    Belagerungswelle. Ein Hinweis gilt als gesehen, sobald er erscheint.
25. **Erklärzeilen (20.1)** tragen alle Knöpfe, auch Sprache, Schwierigkeit und Dialogknöpfe. Wo nichts kostet, steht die Wirkung allein
    oder „kostenlos“. Die Browser-Prüfung zählt Knöpfe ohne Zeile (`__kf.explAudit()`, im Entwicklungsmodus `?dev=1` auch in der Konsole).
26. **Kalibrierung in I7** (nur Konstanten): siehe Tabelle im Bericht. Abweichend von Vorgaben des Dokuments: `POST_SIEGE_GROWTH` 0,6 statt 0,10 und
    `UNIT_STRENGTH_PER_LEVEL` 0,08 statt 0,05.
27. **Bots (21.1):** aktiv und durchschnitt halten, sobald ein Abschnitt unter 50 % fällt; gelegentlich und passiv halten nie. Die Reihe `--suite halten`
    vergleicht beide Strategien direkt. Alle Bots bauen zuerst eine Fabrik, bevor sie Einheiten kaufen (vorher verhungerte „gelegentlich“ ohne Einkommen).

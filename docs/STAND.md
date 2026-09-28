# Klammerfront – Stand Iteration 3

Grundlage: `docs/anforderungen-iteration-3.md`. Jedes Inkrement erfüllt die Definition „spielbar“ (Anhang A), bevor das nächste beginnt.

**Starten:** `index.html` im Browser öffnen. Keine Installation nötig.

| Inkrement | Inhalt | Status |
|---|---|---|
| I1 | Drei Lanes, Formation, Basis mit Abschnitten (REQ-11–13) | fertig |
| I2 | Wellen mit Versorgungslimit, Wellenbefehl „Halten“ (REQ-14–15) | fertig |
| I3 | 3×3-Raster, Fabriken, Umbau von Kaserne und Schmiede (REQ-16–17) | offen |
| I4 | Spezialkarten mit Stufen (REQ-18) | offen |
| I5 | Belagerungswelle statt Eskalation (REQ-19) | offen |
| I6 | Erklärzeilen, Erstkontakt-Hinweise (REQ-20) | offen |
| I7 | Simulation, Balancing, Bericht (REQ-21) | offen |

## Prüfung je Inkrement
```
npm test                                   # Logiktests
npm run test:browser                       # Browser-Prüfung (braucht Playwright)
node tools/simulate.mjs --suite kurz       # 20 Partien Normal, gierige Heuristik: 0 offen, Siegquote 20–100 %
```

## Letzte Prüfung
- I1: `npm test` 28/28 grün. Kurzsimulation: 20 Siege, 0 offen, Median 7:31.
- I2: `npm test` 33/33 grün (der Test zur Übergangsregel 12.2 entfällt mit REQ-14.6). Kurzsimulation: 9 Siege, 11 Niederlagen, 0 offen.
  Serie mit 10 Partien je Schwierigkeitsgrad und Spielertyp: 0 offen.

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

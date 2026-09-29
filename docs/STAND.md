# Klammerfront – Stand Iteration 5

Grundlage: `docs/anforderungen-iteration-5.md`. Branch: `iteration-5` (von `main` nach Fast-Forward von v0.5, Commit `42aad39`).
Stand von Iteration 4: `docs/archiv/STAND-iteration-4.md`.

**Starten:** `index.html` im Browser öffnen.

| Inkrement | Inhalt | REQ | Status |
|---|---|---|---|
| I5.0 | Merge v0.5 → `main`, Branch, Basislinie | – | fertig |
| I5.1 | Eingabe: Ursache belegen, beheben | 5.01 | offen |
| I5.2 | Umbenennung zu EP | 5.02 | offen |
| I5.3 | Drei Bänder, Aufteilung von `ui.js` | 5.03 | offen |
| I5.4 | Bauen über den Arbeitsbereich, Tastatur | 5.04 | offen |
| I5.5 | Einzelsimulation | 5.05 | offen |
| I5.6 | Armee als gemeinsame Welle | 5.06 | offen |
| I5.7 | Universität | 5.07 | offen |
| I5.8 | Balancing-Serie | 5.08 | offen |
| I5.9 | Polish, Fehlerbehebung, Testpaket, Bericht | 5.09–5.11 | offen |

## Prüfung je Inkrement
```
npm test
npm run test:browser
node tools/simulate.mjs --suite kurz
node tools/bench-tick.mjs          # Tick-Zeit mit 2 × 60 Einheiten
```

## Basislinie (I5.0, v0.5 unverändert)
| Messung | Wert | Wie gemessen |
|---|---|---|
| Kurzserie Ziele, 50 Partien je Feld (750) | Dauer 4:19 min auf 4 Kernen; Patt-Quote 0 % | `node tools/simulate.mjs --runs 50 --suite ziele`, Rohdaten `reports/i5-basis-ziele.*` |
| Bildzeit mit 60 Einheiten im Bild | Median 0,30 ms (1280×720), 0,70 ms (1920×1080) | `__kf.benchDraw(60)` in der Browser-Prüfung, kopflos |
| Tick-Zeit, 2 × 60 Einheiten in Kontakt | Median 0,09–0,11 ms, p95 0,24–0,34 ms | `node tools/bench-tick.mjs` (neu) |
| Eingabelatenz Klickfeld (Druck → DOM-Änderung) | Median 2,0 ms, p95 3,9 ms (40 Klicks) | Playwright, `pointerdown` bis erste DOM-Mutation |
| Eingabelatenz Klick in die Welt (Druck → nächstes Bild) | Median 15,7 ms, p95 17,4 ms (30 Klicks) | Playwright, Ereignis bis nächstes `requestAnimationFrame` |
| **Klick mit 120 ms Haltedauer** auf Bau-Option im Kontextfeld | **0 von 4** ausgeführt | Playwright, laufende Produktion (4 Fabriken) |
| **Klick mit 120 ms Haltedauer** auf „Läufer“ | **0 von 10** ausgeführt | Playwright |

Kennzahlen der Basisserie (Median Sieg; Siegquote):

| Schwierigkeit | aktiv | durchschnitt | gelegentlich | passiv | verteidigung |
|---|---|---|---|---|---|
| Leicht | 5:28 · 100 % | 6:09 · 100 % | 7:32 · 100 % | 0 % | 0 %, spätestens 23:06 |
| Normal | 6:51 · 92 % | 10:04 · 86 % | 11:28 · 42 % | 0 % | 0 %, spätestens 20:46 |
| Schwer | 8:59 · 84 % | 10:23 · 52 % | 11:39 · 26 % | 0 % | 0 %, spätestens 21:07 |

## Prüfergebnisse
- I5.0: Basislinie oben. `main` per Fast-Forward auf `42aad39` (v0.5 plus Entwicklungsreport), Branch `iteration-5` von dort.

## Auslegungen
1. **Basis des Branches:** `main` wurde auf `42aad39` vorgespult, nicht auf das im Dokument genannte `36a71ee`; der einzige Unterschied ist der
   Entwicklungsreport (`docs/report-entwicklung.md`).

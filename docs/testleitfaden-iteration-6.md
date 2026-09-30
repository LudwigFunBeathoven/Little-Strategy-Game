# Klammerfront – Testleitfaden Spieltest (Iteration 6, v0.7)

Zweck: Daten von Menschen, die mit den Bot-Profilen und den zwei Bot-Strategien der Simulation vergleichbar sind (REQ-5.11, REQ-6.09).
Nach Iteration 6 ist das Kampfbild bereinigt (kein Pendeln, versetzte Angriffe); die Ergebnisse gehen in Iteration 7 ein, die das Balancing
mit diesen Daten neu einstellt. Seit Iteration 2 stützt sich jede
Balancing-Entscheidung ausschließlich auf Bots; dieser Test prüft, ob die Profile „aktiv“, „durchschnitt“, „gelegentlich“ und „passiv“
echte Spielweisen treffen, und wo die Bedienung hakt.

## Vorbereitung (Testleitung, 5 Minuten)
1. Den **Testbuild** öffnen (Protokoll ist dort immer an) oder lokal `index.html?debug=1`. Der Knopf **„Protokoll“** oben rechts muss sichtbar sein.
2. Browser-Speicher leeren oder ein privates Fenster verwenden, damit alle Einführungshinweise erscheinen.
3. Fenster mindestens 1280×720, Ton ist nicht nötig (das Spiel hat keinen). Den Tab während der Partie nicht wechseln: Ein verdeckter Tab
   pausiert das Spiel (gewollt), das verfälscht aber die Zeiten im Protokoll nicht.
4. Protokollvorlage (unten) bereitlegen. Nicht helfen, nicht erklären; nur beobachten und notieren. Laut denken ausdrücklich erlauben.

## Ablauf (je Person etwa 35 Minuten)
| Schritt | Dauer | Inhalt |
|---|---|---|
| 1 | 1 min | Kurze Einleitung: „Ein Strategiespiel im Browser. Bitte spiel so, wie du es zu Hause tun würdest. Sag laut, was du denkst.“ Keine Spielerklärung. |
| 2 | bis 15 min | **Partie 1: Leicht, ohne Anleitung.** Startbildschirm selbst bedienen lassen („Einführung überspringen“ aus). Nach Sieg oder Niederlage: Knopf **„Protokoll“** oben rechts, Datei speichern. |
| 3 | 3 min | Fragen 1–4 (unten). |
| 4 | bis 15 min | **Partie 2: Normal.** Wieder ohne Hilfe. Danach Protokoll speichern. |
| 5 | 3 min | Fragen 5–8 (unten). |

Bricht eine Partie nach 15 Minuten nicht von selbst ab, trotzdem „Protokoll“ speichern und notieren, dass die Partie offen war.

## Beobachtungsfragen
1. Wo hast du zweimal geklickt, weil der erste Klick nicht ankam oder du unsicher warst?
2. Wann wusstest du nicht, was zu tun ist? Was hast du dann gemacht?
3. Was hat die Armee getan, als sie stehen blieb? War dir klar, warum? Hast du Einheiten hin und her springen sehen?
4. Welche Zahl in der oberen Leiste hast du am häufigsten angesehen, welche nie?
5. Die Kartenwahl öffnet sich von selbst. Hat dich das gestört oder geholfen? Was hat dich bei der Wahl geleitet?
6. Wofür hast du die Universität benutzt? Hast du Forschung beschleunigt? Hast du beim Bauen auf die Nachbarschaft geachtet?
7. Hattest du das Gefühl, dass häufiges Klicken („Fertigen“) etwas bringt? Hast du „Welle vorziehen“ oder das Handelskontor genutzt?
8. Was würdest du als Erstes ändern?

## Protokollvorlage (je Person)
| Feld | Eintrag |
|---|---|
| Person (Kürzel), Datum | |
| Erfahrung mit Strategie-/Idle-Spielen (keine / etwas / viel) | |
| Partie 1 Leicht: Ergebnis, Dauer, Protokolldatei | |
| Partie 2 Normal: Ergebnis, Dauer, Protokolldatei | |
| Doppelklicks, Fehlklicks (Uhrzeit, Stelle) | |
| Ratlose Momente (Uhrzeit, was war los) | |
| Verständnis Armee: Marsch, Kampf, Sammeln (verstanden / teilweise / nicht) | |
| Genutzte Reiter (Bauen, Mauer & Türme, Armee, Schmiede, Universität, Karten) | |
| Genutzt: Welle vorziehen, Forschung beschleunigen, Handelskontor, Nachbarschaft beim Bauen (ja / nein) | |
| Antworten auf Fragen 1–8 | |
| Auffälligkeiten, Zitate | |

## Auswertung
```
node tools/compare-human.mjs protokolle/*.json --json reports/spieltest-auswertung.json
```
Das Werkzeug ordnet jede Partie dem nächstliegenden Bot-Profil und einer der beiden Strategien („gierig“, „einheiten-zuerst“) zu. Merkmale: Klicks je Sekunde, Reaktionsintervall (Median der Abstände
zwischen Handlungen), größte Zahl eigener Einheiten (Feld und Warteschlange), Mauernutzung (Reparatur oder Mauer-/Turmausbau); für die
Strategie der Anteil der Einheitenkäufe an allen Handlungen der ersten fünf Minuten (ein schwaches Merkmal, nur als Hinweis lesen).
Das Protokoll enthält außerdem dieselben Kennzahlen wie die Simulation: Klicks je Minute und Phase, Zeitpunkte der Kartenwahl mit gewählter
Karte, Forschungen, größte Armee, Zeit bis zum ersten Mauerfall, Ergebnis und Dauer.

Was die Auswertung zeigen soll:
- **Passen die Profile?** Wie viele Menschen landen bei welchem Profil, und liegen ihre Siegzeiten im Korridor dieses Profils
  (`CLAUDE.md`, Zielkorridore)? Liegen Menschen systematisch zwischen zwei Profilen, sind die Profile anzupassen, nicht die Spielwerte.
- **Wo hakt die Bedienung?** Doppelklicks und ratlose Momente aus dem Protokoll neben die Zeitpunkte im Sitzungsprotokoll legen.
- **Versteht man die Armee?** Frage 3 gegen den Zeitanteil im Kampf; die Simulation misst im Median 60–68 %. Meldet jemand springende
  Einheiten, enthält das Protokoll die letzten 15 Sekunden je Einheit (`unitLog`: Zustand, Lane, Platz, Bewegungsrichtung).
- **Welche Strategie spielen Menschen?** Liegen sie näher an „einheiten-zuerst“, ist das Spiel für sie deutlich leichter, als die Tabelle
  der gierigen Heuristik zeigt (Bericht Iteration 6).

Protokolle und Auswertung unter `reports/spieltest-iteration-6/` ablegen (ohne Namen, nur Kürzel).

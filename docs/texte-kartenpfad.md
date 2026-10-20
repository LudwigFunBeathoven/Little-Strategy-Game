# Klammerfront – alle Texte des Spiels

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-8. Quelle: `i18n/de.js` und `i18n/en.js` (1024 Schlüssel, in beiden Sprachen identisch).

Lesehilfe:
- **Schlüssel** ist der Name im Code. Platzhalter in geschweiften Klammern (`{n}`, `{name}`) füllt das Spiel zur Laufzeit.
- Spalte **Modus**: „karten“ = Text ersetzt im Modus karten (Kartenpfad) den gleichnamigen Schlüssel ohne Suffix; „nur standard“ = Karte, Forschung oder Ausbau entfällt im Modus karten; leer = beide Modi.
- Spalte **Zeichen** zählt den deutschen Text mit eingesetzten Beispielwerten (Budgets: Textregel R3, `tools/textbudget.mjs`).
- Zeilenumbrüche im Text erscheinen als `<br>`.

## Inhalt
1. [Allgemein und Zahlen](#allgemein-und-zahlen) (35)
2. [Start, Schwierigkeit, Ergebnis](#start-schwierigkeit-ergebnis) (29)
3. [Ressourcenleiste und Kopfzeilen](#ressourcenleiste-und-kopfzeilen) (42)
4. [Reiter und Arbeitsbereich](#reiter-und-arbeitsbereich) (54)
5. [Gebäude](#gebäude) (37)
6. [Haupthaus und Flügel (Teil 7)](#haupthaus-und-flügel-teil-7) (32)
7. [Einheiten und Armee](#einheiten-und-armee) (30)
8. [Ausbauten (Upgrades)](#ausbauten-upgrades) (25)
9. [Forschung und Budget](#forschung-und-budget) (55)
10. [Spezialkarten (Kartenwahl)](#spezialkarten-kartenwahl) (159)
11. [Kartenpfad: Pfadkarten, Wirkungszeilen, Pfadforschung](#kartenpfad-pfadkarten-wirkungszeilen-pfadforschung) (190)
12. [Gebäude-Varianten](#gebäude-varianten) (48)
13. [Doktrinen, Kategorien, Handel](#doktrinen-kategorien-handel) (42)
14. [Erklärzeilen der Knöpfe](#erklärzeilen-der-knöpfe) (60)
15. [Tooltips](#tooltips) (121)
16. [Hinweise](#hinweise) (17)
17. [Tutorial](#tutorial) (21)
18. [Ereignisprotokoll](#ereignisprotokoll) (27)

## Allgemein und Zahlen

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `btn.click` |  | 8 | Fertigen | Produce |
| `cam.follow` |  | 12 | Front folgen | Follow front |
| `cam.front` |  | 5 | Front | Front |
| `cam.realm` |  | 5 | Reich | Realm |
| `cost.free` |  | 6 | gratis | free |
| `cost.material` |  | 11 | {n} Material | {n} material |
| `cost.xp` |  | 5 | {n} EP | {n} XP |
| `ctx.building` |  | 24 | {name} · Bauplatz {n} | {name} · plot {n} |
| `foot.save` |  | 51 | Spielstand wird automatisch im Browser gespeichert. | Progress is saved automatically in your browser. |
| `foot.version` |  | 12 | Prototyp v{v} | Prototype v{v} |
| `fx.fabrik` |  | 15 | +{rate} Material/s | +{rate} material/s |
| `fx.haupthaus` |  | 25 | Höchstens {n} Manufakturen | At most {n} manufactories |
| `fx.kaserne` |  | 23 | Stufe {n}, Versorgung +{m} | Level {n}, supply +{m} |
| `fx.kontor` |  | 44 | +{amount} je {n} Material alle {s} s, höchstens {cap} | +{amount} per {n} material every {s} s, at most {cap} |
| `fx.schmiede` |  | 17 | Qualitätsstufe {n} | Quality grade {n} |
| `fx.universitaet` |  | 27 | {n} Karten je Stufenaufstieg | {n} cards per level-up |
| `lang.de` |  | 7 | Deutsch | Deutsch |
| `lang.en` |  | 7 | English | English |
| `mark.new` |  | 3 | neu | new |
| `menu.lang` |  | 7 | Sprache | Language |
| `menu.pause` |  | 5 | Pause | Pause |
| `menu.resume` |  | 6 | Weiter | Resume |
| `menu.session` |  | 9 | Protokoll | Log |
| `menu.tutorial` |  | 21 | Tutorial überspringen | Skip tutorial |
| `meta.locale` |  | 5 | de-DE | en-US |
| `num.billion` |  | 7 | {n} Mrd. | {n}B |
| `num.million` |  | 7 | {n} Mio. | {n}M |
| `num.thousand` |  | 7 | {n} Tsd. | {n}k |
| `opt.max` |  | 7 | Maximum | Maximum |
| `opt.noSupply` |  | 27 | Versorgungslimit am Maximum | Supply limit at maximum |
| `opt.towerCap` |  | 37 | Gesperrt durch die Doktrin Freihandel | Locked by the doctrine Free trade |
| `preview.enemy` |  | 6 | Gegner | Enemy |
| `preview.own` |  | 2 | Du | You |
| `time.hm` |  | 10 | {h} h {m} min | {h} h {m} min |
| `time.m` |  | 5 | {m} min | {m} min |

## Start, Schwierigkeit, Ergebnis

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `diff.leicht.desc` |  | 55 | Langsamere Wellen, schwächere Gegner. Zum Kennenlernen. | Slower waves, weaker enemies. To learn the ropes. |
| `diff.leicht.name` |  | 6 | Leicht | Easy |
| `diff.normal.desc` |  | 35 | Der vorgesehene Schwierigkeitsgrad. | The intended difficulty. |
| `diff.normal.name` |  | 6 | Normal | Normal |
| `diff.schwer.desc` |  | 64 | Dichte Wellen und zähe Gegner. Verlangt eine saubere Bauordnung. | Dense waves and tough enemies. Demands a clean build order. |
| `diff.schwer.name` |  | 6 | Schwer | Hard |
| `result.again` |  | 11 | Neue Partie | New game |
| `result.lost.eyebrow` |  | 22 | Niederlage · {diff} · {time} | Defeat · {diff} · {time} |
| `result.lost.text` |  | 96 | {kills} Abschüsse vor dem Fall. Früher Fabriken bauen, einen Turm errichten oder mit Leicht beginnen. | {kills} takedowns before the fall. Build factories earlier, put up a tower or start on Easy. |
| `result.lost.text.karten` | karten | 100 | {kills} Abschüsse vor dem Fall. Früher Manufakturen bauen, einen Turm errichten oder mit Leicht beginnen. | {kills} takedowns before the fall. Build manufactories earlier, put up a tower or start on Easy. |
| `result.lost.title` |  | 12 | Tor gefallen | Gate fallen |
| `result.record` |  | 14 | Neue Bestzeit. | New best time. |
| `result.won.eyebrow` |  | 16 | Sieg · {diff} · {time} | Victory · {diff} · {time} |
| `result.won.text` |  | 36 | {kills} Abschüsse, {material} Material gefertigt. | {kills} takedowns, {material} material produced. |
| `result.won.title` |  | 18 | Front durchbrochen | Front broken |
| `start.back` |  | 17 | Zurück zur Partie | Back to game |
| `start.difficulty` |  | 13 | Schwierigkeit | Difficulty |
| `start.discard` |  | 41 | Die laufende Partie wird dabei verworfen. | The current game will be discarded. |
| `start.eyebrow` |  | 11 | Neue Partie | New game |
| `start.go` |  | 15 | Partie beginnen | Begin game |
| `start.hints` |  | 8 | Hinweise | Hints |
| `start.language` |  | 7 | Sprache | Language |
| `start.oldSave` |  | 83 | Dein Spielstand stammt aus einer älteren Version und kann nicht fortgesetzt werden. | Your saved game is from an older version and cannot be continued. |
| `start.recommended` |  | 26 | empfohlen für den Einstieg | recommended for beginners |
| `start.record` |  | 13 | Bestzeit {time} | Best {time} |
| `start.resetHints` |  | 21 | Hinweise zurücksetzen | Reset hints |
| `start.skipIntro` |  | 23 | Einführung überspringen | Skip introduction |
| `start.title` |  | 13 | Einstellungen | Settings |
| `start.tutorial` |  | 8 | Tutorial | Tutorial |

## Ressourcenleiste und Kopfzeilen

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `front.field` |  | 7 | Im Feld | In field |
| `front.losses` |  | 8 | Verluste | Losses |
| `front.supply` |  | 10 | Versorgung | Supply |
| `hdr.clock` |  | 9 | Spielzeit | Time |
| `hdr.kills` |  | 9 | Abschüsse | Takedowns |
| `hdr.level` |  | 8 | Stufe {n} | Level {n} |
| `hdr.newGame` |  | 11 | Neue Partie | New game |
| `hud.army` |  | 5 | Armee | Army |
| `hud.budget` |  | 14 | Forschung {n} % | Research {n}% |
| `hud.draft` |  | 16 | Kartenwahl offen | Card choice open |
| `hud.fallen` |  | 8 | gefallen | fallen |
| `hud.gates` |  | 3 | Tor | gate |
| `hud.held` |  | 1 | – | – |
| `hud.kp.lost` |  | 15 |  · EP verfallen |  · XP lost |
| `hud.kp.next` |  | 20 | Nächste Wahl in {s} | Next choice in {s} |
| `hud.kp.nextMin` |  | 37 | Nächste Wahl in {s} · Mindestabstand | Next choice in {s} · minimum gap |
| `hud.kp.noRate` |  | 12 | Bis Stufe {n} | To level {n} |
| `hud.kp.open` |  | 10 | Wahl offen | Choice open |
| `hud.material` |  | 8 | Material | Material |
| `hud.perClick` |  | 8 | {n}/Klick | {n}/click |
| `hud.perSecond` |  | 4 | {n}/s | {n}/s |
| `hud.rateInterest` |  | 29 | {rate} · Zinsen +{n}/{cap} in {s} s | {rate} · interest +{n}/{cap} in {s} s |
| `hud.soldiers` |  | 8 | Soldaten | Soldiers |
| `hud.toLevel` |  | 17 | Stufe {n}: {cur} / {need} | Level {n}: {cur} / {need} |
| `hud.wall0s` |  | 4 | oben | top |
| `hud.wall2s` |  | 5 | unten | bottom |
| `hud.walls` |  | 5 | Mauer | Wall |
| `hud.waves` |  | 6 | Wellen | Waves |
| `hud.xp` |  | 2 | EP | XP |
| `hud.xpEta` |  | 20 | {n}/s · Karte in {s} | {n}/s · card in {s} |
| `lane.0` |  | 4 | oben | top |
| `lane.1` |  | 5 | Mitte | middle |
| `lane.2` |  | 5 | unten | bottom |
| `lane.aria` |  | 112 | Schlachtfeld mit drei Lanes: links deine Basis mit Mauer oben, Tor und Mauer unten, rechts die gegnerische Basis | Battlefield with three lanes: your base with top wall, gate and bottom wall on the left, the enemy base on the right |
| `lane.enemy` |  | 6 | GEGNER | ENEMY |
| `lane.player` |  | 11 | DEINE BASIS | YOUR BASE |
| `level.none` |  | 16 | Noch keine Wahl. | Nothing chosen yet. |
| `level.progress` |  | 12 | Bis Stufe {n} | To level {n} |
| `level.uniOff` |  | 39 | Ohne Universität: {n} Karten je Angebot. | Without university: {n} cards per offer. |
| `level.uniOn` |  | 38 | Mit Universität: {n} Karten je Angebot. | With university: {n} cards per offer. |
| `wave.rush` |  | 15 | Welle vorziehen | Send wave now |
| `wave.siege` |  | 42 | Belagerungswelle in {time} · {x}-fache Stärke | Siege wave in {time} · {x}× strength |

## Reiter und Arbeitsbereich

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `build.reason.fabrikGrenze.1` |  | 47 | Höchstens {n} Manufakturen, mehr mit Stadtrecht. | At most {n} manufactories, more with Town Charter. |
| `build.reason.fabrikGrenze.2` |  | 47 | Höchstens {n} Manufakturen, mehr mit Hofhaltung. | At most {n} manufactories, more with Court Household. |
| `build.reason.fabrikGrenze.3` |  | 26 | Höchstens {n} Manufakturen. | At most {n} manufactories. |
| `build.reason.fabrikGrenze.doktrin` |  | 46 | Die Doktrin {name} senkt die Grenze um {n}. | The doctrine {name} lowers the cap by {n}. |
| `build.reason.limit` |  | 66 | Gesperrt durch die Doktrin {name}: höchstens {n} Plätze für {types}. | Blocked by the doctrine {name}: at most {n} plots for {types}. |
| `build.reason.locked` |  | 34 | Nur per Spezialkarte freischaltbar | Unlocked through a special card only |
| `build.reason.standing` |  | 13 | Steht bereits | Already built |
| `build.reason.standing.karten` | karten | 40 | Steht bereits so oft, wie es erlaubt ist | Already standing as often as allowed |
| `demolish.confirm` |  | 8 | Abreißen | Demolish |
| `fab.stat` |  | 45 | Fabriken {n} · je {rate} Material/s · nächste {next} | Factories {n} · {rate} material/s each · next {next} |
| `fab.stat.grenze` |  | 51 | Manufakturen {n}/{max} · je {rate} Material/s · nächste {next} | Manufactories {n}/{max} · {rate} material/s each · next {next} |
| `fab.stat.karten` | karten | 49 | Manufakturen {n} · je {rate} Material/s · nächste {next} | Manufactories {n} · {rate} material/s each · next {next} |
| `grid.aria` |  | 18 | Bauplätze im Reich | Plots in your realm |
| `grid.cell` |  | 8 | Platz {n} | Plot {n} |
| `grid.free` |  | 4 | frei | free |
| `nb.cell` |  | 20 | Nachbarschaft: {total} | Neighbours: {total} |
| `nb.fabrik` |  | 67 | Fabrik neben Fabrik: {v} Ertrag je angrenzender Fabrik (höchstens {max}) | Factory next to factory: {v} output per adjacent factory (at most {max}) |
| `nb.fabrik.karten` | karten | 79 | Manufaktur neben Manufaktur: {v} Ertrag je angrenzender Manufaktur (höchstens {max}) | Manufactory next to manufactory: {v} output per adjacent manufactory (at most {max}) |
| `nb.gets` |  | 40 | Hier: {rule} – {n} Nachbar(n), zusammen {total} | Here: {rule} – {n} neighbour(s), {total} in total |
| `nb.getsNone` |  | 35 | Hier: kein Nachbarschaftsbonus ({rule}) | Here: no neighbour bonus ({rule}) |
| `nb.gives` |  | 32 | Gibt {name} auf Platz {slot}: {delta} | Gives {name} on plot {slot}: {delta} |
| `nb.kaserne` |  | 43 | Kaserne neben Schmiede: Versorgungslimit {v} | Barracks next to smithy: supply limit {v} |
| `nb.kontor` |  | 71 | Kontor neben Fabrik: Zinsdeckel {v} je angrenzender Fabrik (höchstens {max}) | Trading post next to factory: interest cap {v} per adjacent factory (at most {max}) |
| `nb.kontor.karten` | karten | 79 | Kontor neben Manufaktur: Zinsdeckel {v} je angrenzender Manufaktur (höchstens {max}) | Trading post next to manufactory: interest cap {v} per adjacent manufactory (at most {max}) |
| `nb.pct` |  | 4 | {v} % | {v}% |
| `nb.schmiede` |  | 42 | Schmiede neben Kaserne: Einheitenkosten {v} | Smithy next to barracks: unit cost {v} |
| `nb.title` |  | 13 | Nachbarschaft | Neighbours |
| `nb.universitaet` |  | 80 | Universität neben Fabrik: Forschungszeit {v} je angrenzender Fabrik (höchstens {max}) | University next to factory: research time {v} per adjacent factory (at most {max}) |
| `nb.universitaet.karten` | karten | 88 | Universität neben Manufaktur: Forschungszeit {v} je angrenzender Manufaktur (höchstens {max}) | University next to manufactory: research time {v} per adjacent manufactory (at most {max}) |
| `panel.build.hint` |  | 52 | Klicke einen Bauplatz im Reich an, um dort zu bauen. | Click a plot in your realm to build there. |
| `panel.levels` |  | 22 | Stufen & Spezialkarten | Levels & special cards |
| `panel.smithy.none` |  | 12 | nicht gebaut | not built |
| `panel.smithy.text` |  | 52 | Qualitätsstufe {n}. Jede Stufe stärkt alle Einheiten. | Quality level {n}. Every level strengthens all units. |
| `panel.smithy.zeughaus` |  | 75 | Ohne Schmiede: Das Zeughaus des Haupthauses erlaubt Qualitätsstufen bis {n}. | Without a smithy: the main hall's armoury allows quality levels up to {n}. |
| `repair.0` |  | 21 | Mauer oben reparieren | Repair top wall |
| `repair.1` |  | 14 | Tor reparieren | Repair gate |
| `repair.2` |  | 22 | Mauer unten reparieren | Repair bottom wall |
| `slot.cancel` |  | 9 | Abbrechen | Cancel |
| `slot.demolish` |  | 8 | Abreißen | Demolish |
| `slot.dialogText` |  | 62 | Fabriken sind mehrfach baubar, alle anderen Gebäude je einmal. | Factories can be built several times, every other building once. |
| `slot.dialogText.karten` | karten | 109 | Manufakturen bis zur Obergrenze des Haupthauses, Kaserne und Universität zweimal, Schmiede und Kontor einmal. | Manufactories up to the main hall cap, barracks and university twice, smithy and trading post once. |
| `slot.label` |  | 11 | Bauplatz {n} | Plot {n} |
| `sub.kaserne` |  | 7 | Kaserne | Barracks |
| `sub.mauer` |  | 5 | Mauer | Wall |
| `sub.repair` |  | 9 | Reparatur | Repair |
| `sub.turm_0` |  | 9 | Turm oben | Top tower |
| `sub.turm_2` |  | 10 | Turm unten | Bottom tower |
| `tab.army` |  | 5 | Armee | Army |
| `tab.build` |  | 5 | Bauen | Build |
| `tab.cards` |  | 6 | Karten | Cards |
| `tab.haus` |  | 9 | Haupthaus | Main hall |
| `tab.smithy` |  | 8 | Schmiede | Smithy |
| `tab.uni` |  | 11 | Universität | University |
| `tab.wall` |  | 13 | Mauer & Türme | Wall & towers |

## Gebäude

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `bld.fabrik.desc` |  | 67 | Erzeugt Material. Mehrfach baubar; jede weitere Fabrik kostet mehr. | Produces material. Can be built several times; each further factory costs more. |
| `bld.fabrik.desc.karten` | karten | 106 | Erzeugt Material. Mehrfach baubar bis zur Obergrenze des Haupthauses; jede weitere Manufaktur kostet mehr. | Produces material. Can be built several times up to the main hall's cap; each further manufactory costs more. |
| `bld.fabrik.name` |  | 6 | Fabrik | Factory |
| `bld.fabrik.name.karten` | karten | 10 | Manufaktur | Manufactory |
| `bld.fabrik.name.weiter` |  | 6 | Fabrik | Factory |
| `bld.fabrik.name.weiter2` |  | 11 | Dampffabrik | Steam Factory |
| `bld.fabrik.nth` |  | 13 | Fabrik Nr. {n} | Factory no. {n} |
| `bld.haupthaus.desc` |  | 98 | Sitz deiner Verwaltung. Steht fest in der Mitte, lässt sich nicht abreißen und hat keine Nachbarn. | Seat of your administration. Fixed in the centre, cannot be demolished and has no neighbours. |
| `bld.haupthaus.name` |  | 9 | Haupthaus | Main hall |
| `bld.kaserne.desc` |  | 49 | Hebt das Versorgungslimit. Ausbaubar bis Stufe 3. | Raises the supply cap. Expandable to level 3. |
| `bld.kaserne.desc.karten` | karten | 108 | Hebt das Versorgungslimit, ausbaubar mit Quartieren. Eine zweite Kaserne schickt je Welle einen Läufer mehr. | Raises the supply cap, expandable with quarters. A second barracks sends one more runner per wave. |
| `bld.kaserne.name` |  | 7 | Kaserne | Barracks |
| `bld.kontor.desc` |  | 51 | Zahlt Zinsen auf deinen Materialbestand, gedeckelt. | Pays capped interest on your material stock. |
| `bld.kontor.name` |  | 6 | Kontor | Trading house |
| `bld.kontor.name.karten` | karten | 6 | Kontor | Trading post |
| `bld.kontor.name.weiter` |  | 11 | Handelshaus | Trading House |
| `bld.schmiede.desc` |  | 64 | Qualitätsstufen für alle Einheiten, mit stark steigenden Kosten. | Quality grades for all units, at steeply rising cost. |
| `bld.schmiede.name` |  | 8 | Schmiede | Smithy |
| `bld.schmiede.name.weiter` |  | 8 | Gießerei | Foundry |
| `bld.universitaet.desc` |  | 47 | Eine zusätzliche Wahl bei jedem Stufenaufstieg. | One extra choice at every level-up. |
| `bld.universitaet.desc.karten` | karten | 98 | Eine Karte mehr je Angebot und ein Forschungsplatz; eine zweite Universität bringt einen weiteren. | One more card per offer and a research slot; a second university adds another. |
| `bld.universitaet.name` |  | 11 | Universität | University |
| `bld.universitaet.name.weiter` |  | 8 | Akademie | Academy |
| `kaserne.build` |  | 13 | Kaserne bauen | Build barracks |
| `kaserne.status.built` |  | 37 | Kaserne Stufe {n} · Versorgungslimit {m} | Barracks level {n} · supply limit {m} |
| `kaserne.status.none` |  | 65 | Keine Kaserne gebaut: Das Versorgungslimit bleibt beim Grundwert. | No barracks built: the supply limit stays at its base value. |
| `kaserne.status.upgrading` |  | 58 | Die Kaserne wird aufgewertet und ruht, bis sie fertig ist. | The barracks is being converted and rests until it is ready. |
| `mauer.stufe.bastionsmauer` |  | 13 | Bastionsmauer | Bastion Wall |
| `mauer.stufe.palisade` |  | 8 | Palisade | Palisade |
| `mauer.stufe.ringmauer` |  | 9 | Ringmauer | Curtain Wall |
| `tower.where` |  | 8 | Turm {lane}: | Tower {lane}: |
| `turm.stufe.geschuetzturm` |  | 12 | Geschützturm | Gun Tower |
| `turm.stufe.wachturm` |  | 8 | Wachturm | Watchtower |
| `turm.stufe.wehrturm` |  | 8 | Wehrturm | Defence Tower |
| `turm.sub.0.name` |  | 21 | Turm oben: {name} | Top tower: {name} |
| `turm.sub.2.name` |  | 22 | Turm unten: {name} | Bottom tower: {name} |
| `wall.sub.name` |  | 17 | Mauer: {name} | Wall: {name} |

## Haupthaus und Flügel (Teil 7)

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `haus.ausbau` |  | 18 | Ausbau: {name} | Expand: {name} |
| `haus.ausbau.noCard` |  | 29 | Braucht die Karte {name}. | Needs the card {name}. |
| `haus.ausbau.running` |  | 34 | Ausbau läuft: {name} in {s} s | Expanding: {name} in {s} s |
| `haus.fluegel.allTaken` |  | 26 | Beide Flügel sind gewählt. | Both wings are chosen. |
| `haus.fluegel.bibliothek.desc` |  | 146 | Eigener Forschungsplatz auch ohne Universität, Forschung dort {z} % langsamer. Technologiekarten erscheinen auch ohne Universität. Budget bis {b} %. | A research slot of its own, even without a university, {z}% slower. Technology cards appear without a university. Budget up to {b}%. |
| `haus.fluegel.bibliothek.eff` |  | 32 | Forschungsplatz ohne Universität | Research slot without university |
| `haus.fluegel.bibliothek.name` |  | 10 | Bibliothek | Library |
| `haus.fluegel.choose` |  | 43 | Wähle einen Flügel. Die Wahl ist endgültig. | Choose a wing. The choice is final. |
| `haus.fluegel.chosen` |  | 11 | Gewählt: {list} | Chosen: {list} |
| `haus.fluegel.kanzlei.desc` |  | 89 | Eine Karte mehr je Angebot, wie mit einer Universität; beide zusammen bringen nicht mehr. | One more card per offer, as with a university; both together bring no more. |
| `haus.fluegel.kanzlei.eff` |  | 26 | Eine Karte mehr je Angebot | One more card per offer |
| `haus.fluegel.kanzlei.name` |  | 7 | Kanzlei | Chancery |
| `haus.fluegel.noSlot` |  | 48 | Der nächste Flügel kommt mit der nächsten Stufe. | The next wing comes with the next level. |
| `haus.fluegel.schatzkammer.desc` |  | 105 | Zinsen auf den Materialbestand mit {p} % des Kontor-Deckels. Steht ein Kontor, zahlt es den vollen Deckel. | Interest on your stock at {p}% of the trading post cap. If a trading post stands, it pays the full cap. |
| `haus.fluegel.schatzkammer.eff` |  | 31 | Zinsen ohne Kontor, Deckel {p} % | Interest without trading post, cap {p}% |
| `haus.fluegel.schatzkammer.name` |  | 12 | Schatzkammer | Treasury |
| `haus.fluegel.taken` |  | 14 | Schon gewählt. | Already chosen. |
| `haus.fluegel.title` |  | 6 | Flügel | Wings |
| `haus.fluegel.zeughaus.desc` |  | 82 | Qualitätsstufen bis Stufe {n} auch ohne Schmiede. Mit Schmiede gibt es alle Stufen. | Quality levels up to level {n} without a smithy. With a smithy all levels are available. |
| `haus.fluegel.zeughaus.eff` |  | 35 | Qualität bis Stufe {n} ohne Schmiede | Quality up to level {n} without smithy |
| `haus.fluegel.zeughaus.name` |  | 8 | Zeughaus | Arsenal |
| `haus.grenze` |  | 38 | Obergrenze: {n} Manufakturen · stehen {m} | Cap: {n} manufactories · standing {m} |
| `haus.grenze.label` |  | 12 | Manufakturen | Manufactories |
| `haus.grenze.value` |  | 18 | {m} von höchstens {n} | {m} of at most {n} |
| `haus.stufe.1.desc` |  | 94 | Ein Gutshof verwaltet höchstens drei Manufakturen. Die Karte Stadtrecht macht ihn zum Rathaus. | A manor runs at most three manufactories. The card Town Charter turns it into a town hall. |
| `haus.stufe.1.name` |  | 7 | Gutshof | Manor |
| `haus.stufe.2.desc` |  | 105 | Das Rathaus verwaltet vier Manufakturen und hat einen Flügel. Die Karte Hofhaltung macht es zur Residenz. | The town hall runs four manufactories and has one wing. The card Court Household turns it into a residence. |
| `haus.stufe.2.eff` |  | 37 | höchstens {n} Manufakturen, ein Flügel | at most {n} manufactories, one wing |
| `haus.stufe.2.name` |  | 7 | Rathaus | Town Hall |
| `haus.stufe.3.desc` |  | 61 | Die Residenz verwaltet fünf Manufakturen und hat zwei Flügel. | The residence runs five manufactories and has two wings. |
| `haus.stufe.3.eff` |  | 41 | höchstens {n} Manufakturen, zweiter Flügel | at most {n} manufactories, second wing |
| `haus.stufe.3.name` |  | 8 | Residenz | Residence |

## Einheiten und Armee

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `army.fight` |  | 5 | Kampf | Fighting |
| `army.march` |  | 6 | Marsch | Marching |
| `army.none` |  | 1 | – | – |
| `army.paused` |  | 5 | Pause | Paused |
| `army.regroup` |  | 7 | Sammeln | Regrouping |
| `kompanie.count` |  | 10 | Angeworben | Hired |
| `kompanie.name` |  | 15 | Söldnerkompanie | Mercenary company |
| `unit.armbrust.name` |  | 15 | Armbrustschütze | Crossbowman |
| `unit.armbrust.short` |  | 8 | Armbrust | Crossbow |
| `unit.bogenschuetze.name` |  | 12 | Bogenschütze | Archer |
| `unit.bogenschuetze.short` |  | 5 | Bogen | Archer |
| `unit.geschuetz.name` |  | 8 | Geschütz | Gun |
| `unit.geschuetz.short` |  | 8 | Geschütz | Gun |
| `unit.katapult.name` |  | 8 | Katapult | Catapult |
| `unit.katapult.short` |  | 8 | Katapult | Catapult |
| `unit.laeufer.name` |  | 6 | Läufer | Runner |
| `unit.laeufer.short` |  | 6 | Läufer | Runner |
| `unit.reason.doctrine` |  | 38 | Gesperrt durch die Doktrin {name}. | Locked by the doctrine {name}. |
| `unit.reiter.name` |  | 6 | Reiter | Rider |
| `unit.reiter.short` |  | 6 | Reiter | Rider |
| `unit.role.melee` |  | 8 | Nahkampf | Melee |
| `unit.role.ranged` |  | 9 | Fernkampf | Ranged |
| `unit.role.tank` |  | 13 | Nahkampf, zäh | melee, tough |
| `unit.schild.name` |  | 12 | Schildträger | Shield bearer |
| `unit.schild.short` |  | 6 | Schild | Shield |
| `unit.schwertkaempfer.name` |  | 14 | Schwertkämpfer | Swordsman |
| `unit.schwertkaempfer.short` |  | 7 | Schwert | Sword |
| `unit.versorgung` |  | 13 | {n} Versorgung | {n} supply |
| `unit.werfer.name` |  | 6 | Werfer | Thrower |
| `unit.werfer.short` |  | 6 | Werfer | Thrower |

## Ausbauten (Upgrades)

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `upg.ausbau.desc` |  | 90 | Hebt die Kaserne eine Stufe höher: Versorgungslimit +{n}. Obergrenze {cap} Einheiten je Welle. | Raises the barracks by one level: supply cap +{n}. Cap: {cap} units per wave. |
| `upg.ausbau.desc.karten` | karten | 87 | Baut Quartiere für die Kaserne: Versorgungslimit +{n}. Obergrenze {cap} Einheiten je Welle. | Builds quarters for the barracks: supply cap +{n}. Cap: {cap} units per wave. |
| `upg.ausbau.name` |  | 6 | Ausbau | Expansion |
| `upg.ausbau.name.karten` | karten | 9 | Quartiere | Quarters |
| `upg.ausbau2.desc` |  | 94 | Baut Quartiere für die zweite Kaserne: Versorgungslimit +{n}. Obergrenze {cap} Einheiten je Welle. | Builds quarters for the second barracks: supply cap +{n}. At most {cap} units per wave. |
| `upg.ausbau2.name` |  | 26 | Quartiere (zweite Kaserne) | Quarters (second barracks) |
| `upg.kadenz.desc` |  | 20 | +{percent} % Schussfrequenz | +{percent}% firing rate |
| `upg.kadenz.name` |  | 9 | Feuerrate | Rate of fire |
| `upg.mauer.desc` |  | 65 | +{n} max. Lebenspunkte je Abschnitt (Mauer oben, Tor, Mauer unten) | +{n} max. health per section (top wall, gate, bottom wall) |
| `upg.mauer.name` |  | 11 | Verstärkung | Reinforcement |
| `upg.moertel.desc` | nur standard | 66 | Alle stehenden Abschnitte regenerieren +{n} Lebenspunkt pro Sekunde | All standing sections regenerate +{n} hit point per second |
| `upg.moertel.name` | nur standard | 13 | Mörtelkolonne | Mortar crew |
| `upg.presse.desc` |  | 23 | +{n} Material pro Klick. | +{n} material per click. |
| `upg.presse.name` |  | 15 | Stärkere Presse | Stronger press |
| `upg.qualitaet.desc` |  | 94 | Alle Einheiten +{percent} % Schaden und Lebenspunkte. Jede Stufe kostet deutlich mehr als die vorige. | All units +{percent}% damage and health. Each grade costs much more than the last. |
| `upg.qualitaet.name` |  | 14 | Qualitätsstufe | Quality grade |
| `upg.reichweite.desc` |  | 14 | +{n} Reichweite | +{n} range |
| `upg.reichweite.name` |  | 10 | Reichweite | Range |
| `upg.stacheln.desc` | nur standard | 54 | Nahkämpfer an der Mauer erleiden {n} Schaden pro Schlag | Melee attackers at the wall take {n} damage per hit |
| `upg.stacheln.name` | nur standard | 11 | Stachelwall | Spiked wall |
| `upg.turm.build` |  | 14 | Turm errichten | Build tower |
| `upg.turm.desc` |  | 110 | +{n} Schaden pro Schuss. Der Turm trifft nur Gegner seiner Lane und schweigt, solange seine Mauer gefallen ist. | +{n} damage per shot. The tower only hits enemies in its own lane and stays silent while its wall is down. |
| `upg.turm.name` |  | 7 | Kaliber | Calibre |
| `upg.zinseszins.desc` | nur standard | 14 | Zinsdeckel +{n} | Interest cap +{n} |
| `upg.zinseszins.name` | nur standard | 13 | Kontor-Ausbau | Trading house expansion |

## Forschung und Budget

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `budget.bib` |  | 45 | Ohne Universität höchstens {n} % (Bibliothek). | Without a university at most {n}% (library). |
| `budget.needUni` |  | 46 | Das Forschungsbudget braucht eine Universität. | The research budget needs a university. |
| `budget.step` |  | 4 | {n} % | {n}% |
| `budget.step.title` |  | 21 | Forschungsbudget {n} % | Research budget {n}% |
| `budget.text` |  | 151 | {n} % des Materialertrags fließen in die Forschung und kommen als EP zurück ({k} EP je Material). Größerer Anteil, schlechterer Kurs. Jederzeit änderbar. | {n}% of material income goes into research and returns as XP ({k} XP per material). Larger share, worse rate. Change it any time. |
| `budget.title` |  | 16 | Forschungsbudget | Research budget |
| `research.bann.desc` |  | 50 | {e1} Karten für diese Partie aus dem Pool entfernen. | Remove {e1} cards from the pool for this game. |
| `research.bann.name` |  | 4 | Bann | Ban |
| `research.bib` |  | 85 | Bibliothek des Haupthauses: ein Forschungsplatz, Forschungen dauern dort {z} % länger. | Library of the main hall: one research slot, research there takes {z}% longer. |
| `research.branch.archiv` |  | 8 | B Archiv | B Archive |
| `research.branch.forschung` |  | 11 | C Forschung | C Research |
| `research.branch.freischaltung` |  | 17 | D Freischaltungen | D Unlocks |
| `research.branch.lehre` |  | 7 | A Lehre | A Teaching |
| `research.branchOf.archiv` |  | 28 | Zweig B: Kartenmanipulation. | Branch B: card manipulation. |
| `research.branchOf.forschung` |  | 32 | Zweig C: globale Verbesserungen. | Branch C: global improvements. |
| `research.branchOf.freischaltung` |  | 25 | Zweig D: Freischaltungen. | Branch D: unlocks. |
| `research.branchOf.lehre` |  | 22 | Zweig A: EP-Automatik. | Branch A: XP automation. |
| `research.branchOf.pfad` |  | 54 | Pfadforschung: öffnet sich über eine Technologiekarte. | Path research: opens with a technology card. |
| `research.busy` |  | 32 | Alle {n} Forschungsplätze belegt. | All {n} research slots busy. |
| `research.doneToast` |  | 35 | Forschung abgeschlossen: {name} | Research complete: {name} |
| `research.drill.desc` |  | 30 | Takt der eigenen Wellen −{e1} %. | Own wave interval −{e1}%. |
| `research.drill.name` |  | 13 | Gefechtsübung | Combat Practice |
| `research.expl` |  | 28 | {effect} · {cost} · {s} s | {effect} · {cost} · {s} s |
| `research.gluecksgriff.desc` |  | 45 | Seltene Karten +{e1} Prozentpunkte Ziehgewicht. | Rare cards +{e1} percentage points draw weight. |
| `research.gluecksgriff.name` |  | 11 | Glücksgriff | Lucky draw |
| `research.hoersaal.desc` | nur standard | 41 | Die Universität erzeugt {e1} EP je Sekunde. | The university produces {e1} XP per second. |
| `research.hoersaal.name` | nur standard | 7 | Hörsaal | Lecture hall |
| `research.ingenieur.desc` | nur standard | 20 | Gebäudekosten −{e1} %. | Building costs −{e1}%. |
| `research.ingenieur.name` | nur standard | 14 | Ingenieurwesen | Engineering |
| `research.intro` |  | 52 | Forschung kostet Material und Zeit; {n} gleichzeitig. | Research costs material and time; {n} at a time. |
| `research.logistik.desc` |  | 21 | Versorgungslimit +{e1}. | Supply cap +{e1}. |
| `research.logistik.name` |  | 8 | Logistik | Logistics |
| `research.maurerkunst.desc` |  | 38 | Reparatur-Abklingzeit der Mauer −{e1} %. | Wall repair cooldown −{e1}%. |
| `research.maurerkunst.name` |  | 11 | Maurerkunst | Masonry |
| `research.metallurgie.desc` |  | 34 | Materialertrag der Fabriken +{e1} %. | Factory material yield +{e1}%. |
| `research.metallurgie.desc.karten` | karten | 38 | Materialertrag der Manufakturen +{e1} %. | Manufactory material yield +{e1}%. |
| `research.metallurgie.name` |  | 11 | Metallurgie | Metallurgy |
| `research.needUni` |  | 38 | Baue eine Universität, um zu forschen. | Build a university to research. |
| `research.neuziehen.desc` |  | 43 | {e1}× je Kartenwahl alle Optionen neu ziehen. | Redraw all options {e1}× per card choice. |
| `research.neuziehen.name` |  | 10 | Neu ziehen | Redraw |
| `research.requires` |  | 26 | Braucht zuerst {name}. | Requires {name} first. |
| `research.running` |  | 22 | Wird gerade erforscht. | Currently being researched. |
| `research.runningBib` |  | 22 | Bibliothek: {name} | Library: {name} |
| `research.runningName` |  | 21 | Forschung: {name} | Research: {name} |
| `research.rush` |  | 13 | Beschleunigen | Speed up |
| `research.schildtraeger.desc` | nur standard | 76 | Neue Einheit: Nahkampf, viele Lebenspunkte, langsam. Bremst die ganze Armee. | New unit: melee, many health, slow. Slows the whole army. |
| `research.schildtraeger.name` | nur standard | 12 | Schildträger | Shield bearers |
| `research.schmiedeausbau.desc` |  | 64 | Jede Qualitätsstufe der Schmiede wirkt {e1} Prozentpunkte stärker. | Every smithy quality level is {e1} percentage points stronger. |
| `research.schmiedeausbau.name` |  | 15 | Schmiede-Ausbau | Smithy extension |
| `research.seconds` |  | 6 | {s} s | {s} s |
| `research.time` |  | 5 | Dauer | Duration |
| `research.weitblick.desc` |  | 25 | +{e1} Kartenoption je Wahl. | +{e1} card option per choice. |
| `research.weitblick.name` |  | 9 | Weitblick | Foresight |
| `research.zweiterplatz.desc` |  | 30 | Zwei Forschungen gleichzeitig. | Two researches at once. |
| `research.zweiterplatz.name` |  | 23 | Zweiter Forschungsplatz | Second research slot |

## Spezialkarten (Kartenwahl)

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `draft.allesAufDieMitte.desc` |  | 98 | Alle Einheiten gehen in die Mitte und sind +{e2} % stärker. Nachteil: Abschnitte −{d1} % Lebenspunkte. | All units go to the middle and are +{e2}% stronger. Drawback: sections −{d1}% health. |
| `draft.allesAufDieMitte.name` |  | 19 | Alles auf die Mitte | All in the middle |
| `draft.aushebung.desc` |  | 61 | Versorgungslimit +{e1}. Nachteil: Einheiten −{d1} % Lebenspunkte. | Supply cap +{e1}. Drawback: units −{d1}% health. |
| `draft.aushebung.desc.t2.karten` | karten | 92 | Versorgungslimit +{e1}; Einheiten kosten {e2p} % weniger. Nachteil: Einheiten −{d1} % Lebenspunkte. | Supply limit +{e1}; units cost {e2p}% less. Drawback: units −{d1}% health. |
| `draft.aushebung.name` |  | 9 | Aushebung | Levy |
| `draft.ban` |  | 17 | {name} bannen | Ban {name} |
| `draft.bastion.desc` | nur standard | 60 | Türme +{e1} % Reichweite. Nur im Angebot, wenn ein Turm steht. | Towers +{e1}% range. Only offered once a tower stands. |
| `draft.bastion.name` | nur standard | 7 | Bastion | Bastion |
| `draft.bauleitung.desc` | nur standard | 88 | Baut auf einem freien Platz selbst eine Fabrik, sobald du das {e1}-Fache des Preises hast. | Builds a factory on a free plot by itself once you hold {e1}× the price. |
| `draft.bauleitung.name` | nur standard | 10 | Bauleitung | Site manager |
| `draft.bauordnung.desc` |  | 39 | Alle Nachbarschaftsboni wirken {e1}-fach. | All neighbour bonuses work {e1}-fold. |
| `draft.bauordnung.name` |  | 10 | Bauordnung | Building code |
| `draft.belagerungsgeraet.desc` | nur standard | 69 | Einheiten +{e1} % Schaden gegen Basen. Nachteil: −{d1} % gegen Einheiten. | Units +{e1}% damage against bases. Drawback: −{d1}% against units. |
| `draft.belagerungsgeraet.desc.t2.karten` | karten | 128 | Einheiten +{e1} % Schaden gegen Basen; die Basis verliert zusätzlich {e2} Lebenspunkte pro Sekunde. Nachteil: −{d1} % gegen Einheiten. | Units +{e1}% damage against bases; the base also loses {e2} health per second. Drawback: −{d1}% against units. |
| `draft.belagerungsgeraet.name` | nur standard | 16 | Belagerungsgerät | Siege engines |
| `draft.bessereFabriken.desc` |  | 19 | Fabrikertrag +{e1} %. | Factory output +{e1}%. |
| `draft.bessereFabriken.desc.karten` | karten | 30 | Ertrag der Manufakturen +{e1} %. | Manufactory output +{e1}%. |
| `draft.bessereFabriken.desc.t2.karten` | karten | 69 | Ertrag der Manufakturen +{e1} %; ihr Nachbarschaftsbonus wirkt {e2}-fach. | Manufactory yield +{e1}%; their neighbour bonus counts {e2} times. |
| `draft.bessereFabriken.desc.t3.karten` | karten | 69 | Ertrag der Manufakturen +{e1} %; ihr Nachbarschaftsbonus wirkt {e2}-fach. | Manufactory yield +{e1}%; their neighbour bonus counts {e2} times. |
| `draft.bessereFabriken.name` |  | 16 | Bessere Fabriken | Better factories |
| `draft.bessereFabriken.name.karten` | karten | 20 | Bessere Manufakturen | Better manufactories |
| `draft.blitzkrieg.desc` | nur standard | 90 | Deine Wellen rücken alle 12 s aus statt alle 20 s. Nachteil: Einheiten −{d1} % Lebenspunkte. | Your waves deploy every 12 s instead of 20 s. Drawback: units −{d1}% health. |
| `draft.blitzkrieg.name` | nur standard | 10 | Blitzkrieg | Blitz |
| `draft.cat.armee` |  | 5 | Armee | Army |
| `draft.cat.automatisierung` |  | 15 | Automatisierung | Automation |
| `draft.cat.basis` |  | 5 | Basis | Base |
| `draft.cat.bau` |  | 3 | Bau | Build |
| `draft.cat.doktrin` |  | 7 | Doktrin | Doctrine |
| `draft.cat.sonderregel` |  | 11 | Sonderregel | Special rule |
| `draft.cat.technologie` |  | 11 | Technologie | Technology |
| `draft.cat.wagnis` |  | 6 | Wagnis | Gamble |
| `draft.cat.weiterentwicklung` |  | 17 | Weiterentwicklung | Development |
| `draft.cat.wirtschaft` |  | 10 | Wirtschaft | Economy |
| `draft.dauerauftrag.desc` |  | 112 | Füllt die Warteschlange bei jedem Takt mit der zuletzt ausgerückten Zusammensetzung, soweit das Material reicht. | Refills the queue every wave with the last deployed composition, as far as material allows. |
| `draft.dauerauftrag.name` |  | 12 | Dauerauftrag | Standing order |
| `draft.doppelschicht.desc` | nur standard | 59 | Produktion der Fabriken +{e1} %. Nachteil: Klickertrag −{d1} %. | Factory output +{e1}%. Drawback: click yield −{d1}%. |
| `draft.doppelschicht.name` | nur standard | 13 | Doppelschicht | Double shift |
| `draft.drill.desc` |  | 36 | Einheiten greifen {e1} % schneller an. | Units attack {e1}% faster. |
| `draft.drill.desc.t2.karten` | karten | 61 | Einheiten greifen {e1} % schneller an und halten {e2p} % mehr aus. | Units attack {e1}% faster and take {e2p}% more. |
| `draft.drill.name` |  | 5 | Drill | Drill |
| `draft.durchbruch.desc` |  | 65 | Einheiten richten an der gegnerischen Basis {e1}-fachen Schaden an. | Units deal {e1}× damage to the enemy base. |
| `draft.durchbruch.desc.t2` |  | 103 | Einheiten richten an der gegnerischen Basis {e1}-fachen Schaden an; die Basis verliert {e2} LP pro Sekunde. | Units deal {e1}× damage to the enemy base; the base loses {e2} HP per second. |
| `draft.durchbruch.name` |  | 10 | Durchbruch | Breakthrough |
| `draft.eyebrow` |  | 17 | Stufe {n} erreicht | Level {n} reached |
| `draft.festungsbau.desc` | nur standard | 82 | Alle Abschnitte +{syn} % Lebenspunkte je gewählter Basiskarte (diese eingeschlossen). | All sections +{syn}% health per chosen base card (this one included). |
| `draft.festungsbau.name` | nur standard | 11 | Festungsbau | Fortification |
| `draft.fliessband.desc` | nur standard | 66 | Automatische Presse +{e1} %; sie läuft schon in Phase Früh mit {e2} %. | Auto press +{e1}%; it already runs in phase early at {e2}%. |
| `draft.fliessband.name` | nur standard | 9 | Fließband | Assembly line |
| `draft.gilde.desc` |  | 97 | Materialertrag +{syn} % je Wirtschaftskarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Material yield +{syn}% per economy card (at most {max} cards count). The card counts itself. |
| `draft.gilde.name` |  | 5 | Gilde | Guild |
| `draft.gluecksritter.desc` |  | 67 | Eine Karte mehr je Angebot. Nachteil: Stufen brauchen {d1} % mehr EP. | One more card per offer. Drawback: levels need {d1}% more XP. |
| `draft.gluecksritter.name` |  | 12 | Glücksritter | Fortune hunter |
| `draft.grenzwacht.desc` |  | 106 | Mauer und Tor +{syn} % Lebenspunkte je Militärkarte (höchstens {max} Karten). Zählt für Militär und Verteidigung. | Walls and gate +{syn}% health per military card (at most {max}). Counts for military and defence. |
| `draft.grenzwacht.name` |  | 10 | Grenzwacht | Border watch |
| `draft.grossauftrag.desc` | nur standard | 72 | Fabrikertrag +{syn} % je gewählter Wirtschaftskarte (diese eingeschlossen). | Factory output +{syn}% per chosen economy card (this one included). |
| `draft.grossauftrag.name` | nur standard | 11 | Großauftrag | Bulk order |
| `draft.grosseArmee.desc` |  | 65 | Versorgungslimit ×{e1} (höchstens {cap}). Nachteil: Wellenabstand ×{d1}. | Supply cap ×{e1} (max. {cap}). Drawback: wave interval ×{d1}. |
| `draft.grosseArmee.name` |  | 11 | Große Armee | Grand army |
| `draft.handelskontor.desc` |  | 79 | Der Zinsdeckel des Kontors steigt um {e1}. Nur im Angebot, wenn ein Kontor steht. | The trading house interest cap rises by {e1}. Only offered once a trading house stands. |
| `draft.handelskontor.desc.karten` | karten | 81 | Der Zinsdeckel des Kontors steigt um {e1} %. Nur im Angebot, wenn ein Kontor steht. | The interest cap of the trading post rises by {e1}%. Only offered when a trading post stands. |
| `draft.handelskontor.name` |  | 12 | Kontorausbau | Trading house |
| `draft.handelskontor.name.karten` | karten | 11 | Zinsmeister | Interest master |
| `draft.instandhaltung.desc` | nur standard | 71 | Abschnitte unter {c1} % werden automatisch repariert, zu {e1} % der Kosten. | Sections below {c1}% are repaired automatically at {e1}% of the cost. |
| `draft.instandhaltung.desc.t3.karten` | karten | 71 | Abschnitte unter {c2} % werden automatisch repariert, zu {e1} % der Kosten. | Sections below {c2}% are repaired automatically, at {e1}% of the cost. |
| `draft.instandhaltung.name` | nur standard | 14 | Instandhaltung | Maintenance |
| `draft.kriegsanleihe.desc` | nur standard | 80 | Sofort Material für {e1} Sekunden Produktion. Nachteil: Gegner +{d1} % Lebenspunkte. | Instant material worth {e1} seconds of production. Drawback: enemies +{d1}% health. |
| `draft.kriegsanleihe.name` | nur standard | 13 | Kriegsanleihe | War bonds |
| `draft.kriegserfahrung.desc` |  | 47 | +{e1} % EP pro Abschuss. Stufen kommen schneller. | +{e1}% XP per takedown. Levels come faster. |
| `draft.kriegserfahrung.desc.karten` | karten | 52 | +{e1} % EP aus allen Quellen. Stufen kommen schneller. | +{e1}% XP from all sources. Levels come faster. |
| `draft.kriegserfahrung.desc.t2.karten` | karten | 108 | +{e1} % EP aus allen Quellen. Das Forschungsbudget der Universität zahlt {e2p} % besser. Stufen kommen schneller. | +{e1}% XP from all sources. The university research budget pays {e2p}% better. Levels come faster. |
| `draft.kriegserfahrung.name` |  | 15 | Kriegserfahrung | Battle experience |
| `draft.kriegserfahrung.name.karten` | karten | 9 | Lehrjahre | Apprenticeship |
| `draft.kriegstrommeln.desc` |  | 42 | Formationen ab {c1} Einheiten +{e1} % Schaden. | Formations of {c1} or more units +{e1}% damage. |
| `draft.kriegstrommeln.desc.t3.karten` | karten | 48 | Formationen schon ab {c2} Einheiten +{e1} % Schaden. | Formations from {c2} units +{e1}% damage. |
| `draft.kriegstrommeln.name` |  | 14 | Kriegstrommeln | War drums |
| `draft.kriegswirtschaft.desc` |  | 108 | Einheiten kosten {syn} % weniger je Militärkarte (höchstens {max} Karten zählen). Zählt für Wirtschaft und Militär. | Units cost {syn}% less per military card (at most {max} cards count). Counts for economy and military. |
| `draft.kriegswirtschaft.name` |  | 16 | Kriegswirtschaft | Wartime economy |
| `draft.lagerzehnt.desc` |  | 60 | Material über dem Lagerdeckel ({m} Minuten Ertrag) wird zu EP. | Material above the storage cap ({m} minutes of income) turns into XP. |
| `draft.lagerzehnt.name` |  | 10 | Lagerzehnt | Storage tithe |
| `draft.langeWurfarme.desc` | nur standard | 59 | Werfer +{e1} Reichweite. Nachteil: Werfer −{d1} % Lebenspunkte. | Throwers +{e1} range. Drawback: throwers −{d1}% health. |
| `draft.langeWurfarme.desc.t2.karten` | karten | 86 | Werfer +{e1} Reichweite, Fernkämpfer +{e2p} % Schaden. Nachteil: Werfer −{d1} % Lebenspunkte. | Throwers +{e1} range, ranged units +{e2p}% damage. Drawback: throwers −{d1}% health. |
| `draft.langeWurfarme.name` | nur standard | 14 | Lange Wurfarme | Long throwing arms |
| `draft.maurerkolonne.desc` |  | 115 | Stehende Mauern regenerieren {e1} % ihrer Lebenspunkte pro Sekunde, wenn sie {s} s nicht getroffen wurden. Ohne Tor. | Standing walls regenerate {e1}% of their health per second if not hit for {s} s. Not the gate. |
| `draft.maurerkolonne.desc.t3.karten` | karten | 117 | Stehende Mauern und das Tor regenerieren {e1} % ihrer Lebenspunkte pro Sekunde, wenn sie {s} s nicht getroffen wurden. | Standing walls and the gate regenerate {e1}% of their health per second if not hit for {s} s. |
| `draft.maurerkolonne.name` |  | 13 | Maurerkolonne | Mason crew |
| `draft.maxed` |  | 21 | Höchste Stufe gewählt | Highest tier chosen |
| `draft.nachtschicht.desc` | nur standard | 50 | In der Spätphase produzieren die Fabriken {e1} mehr. | In the late phase, factories produce {e1} more. |
| `draft.nachtschicht.name` | nur standard | 12 | Nachtschicht | Night shift |
| `draft.notreserve.desc` | nur standard | 63 | Fällt das Tor unter {c1} %, wird es einmal vollständig repariert. | If the gate drops below {c1}%, it is fully repaired once. |
| `draft.notreserve.name` | nur standard | 10 | Notreserve | Emergency reserve |
| `draft.pluenderung.desc` |  | 39 | Abschüsse durch Türme bringen Material. | Tower takedowns bring material. |
| `draft.pluenderung.name` |  | 10 | Plünderung | Plunder |
| `draft.querverbindung.desc` |  | 40 | Nachbarschaftsboni wirken auch diagonal. | Neighbour bonuses also work diagonally. |
| `draft.querverbindung.name` |  | 14 | Querverbindung | Cross-link |
| `draft.queue` |  | 41 | Danach folgen {n} weitere Stufenaufstiege. | {n} more level-ups follow. |
| `draft.rarity.common` |  | 10 | gewöhnlich | common |
| `draft.rarity.doktrin` |  | 7 | Doktrin | Doctrine |
| `draft.rarity.legendary` |  | 8 | legendär | legendary |
| `draft.rarity.rare` |  | 6 | selten | rare |
| `draft.rarity.wagnis` |  | 6 | Wagnis | Gamble |
| `draft.rationalisierung.desc` | nur standard | 73 | Fabriken +{syn} % je gewählter Automatisierungskarte (diese eingeschlossen). | Factories +{syn}% per chosen automation card (this one included). |
| `draft.rationalisierung.name` | nur standard | 16 | Rationalisierung | Rationalisation |
| `draft.rekrutenzug.desc` |  | 44 | Die Kaserne schickt je Welle {e1} Läufer mehr. | The barracks sends {e1} more runner per wave. |
| `draft.rekrutenzug.desc.t2.karten` | karten | 95 | Die Kaserne schickt je Welle {e1} Läufer mehr; neue Einheiten starten mit {e2} Schmiede-Stufe mehr. | The barracks sends {e1} more runner per wave; new units start with {e2} more smithy level. |
| `draft.rekrutenzug.name` |  | 11 | Rekrutenzug | Recruit levy |
| `draft.reroll` |  | 10 | Neu ziehen | Redraw |
| `draft.sammelruf.desc` |  | 114 | Je zwei Militärkarten schickt jede Welle einen Läufer mehr, ohne Versorgung (höchstens {max} Karten, diese zählt mit). | Per two military cards each wave gains a runner, no supply (at most {max} cards, this one counts). |
| `draft.sammelruf.name` |  | 9 | Sammelruf | Muster call |
| `draft.sappeure.desc` | nur standard | 119 | Die gegnerische Basis verliert {e1} Lebenspunkte pro Sekunde, solange eigene Einheiten in der gegnerischen Hälfte stehen. | The enemy base loses {e1} health per second while your units stand in the enemy half. |
| `draft.sappeure.desc.t2.karten` | karten | 132 | Die gegnerische Basis verliert {e1} Lebenspunkte pro Sekunde, von Anfang an und auch ohne eigene Einheiten in der gegnerischen Hälfte. | The enemy base loses {e1} health per second from the start, even without your units in the enemy half. |
| `draft.sappeure.name` | nur standard | 8 | Sappeure | Sappers |
| `draft.scharfschuetzen.desc` | nur standard | 73 | Turmschaden +{e1} % gegen Fernkämpfer. Nur im Angebot, wenn ein Turm steht. | Tower damage +{e1}% against ranged units. Only offered once a tower stands. |
| `draft.scharfschuetzen.name` | nur standard | 14 | Scharfschützen | Marksmen |
| `draft.schildwall.desc` |  | 53 | Eine voll besetzte Nahkampfreihe hält +{e1} % mehr aus. | A full melee row withstands +{e1}% more. |
| `draft.schildwall.desc.t2.karten` | karten | 81 | Schon eine Nahkampfreihe mit {c2} Einheiten zählt als voll und hält +{e1} % mehr aus. | A melee row of just {c2} units already counts as full and takes +{e1}% more. |
| `draft.schildwall.name` |  | 10 | Schildwall | Shield wall |
| `draft.schwerePressen.desc` | nur standard | 76 | Produktion der Fabriken +{e1} %. Nachteil: alle Abschnitte −{d1} % Lebenspunkte. | Factory output +{e1}%. Drawback: all sections −{d1}% health. |
| `draft.schwerePressen.name` | nur standard | 15 | Schwere Pressen | Heavy presses |
| `draft.selbstlaeufer.desc` | nur standard | 84 | Automatische Presse +{syn} % je gewählter Automatisierungskarte (diese eingeschlossen). | Auto press +{syn}% per chosen automation card (this one included). |
| `draft.selbstlaeufer.name` | nur standard | 12 | Selbstläufer | Self-runner |
| `draft.serienbau.desc` | nur standard | 34 | Neue Fabriken kosten {e1} % weniger. | New factories cost {e1}% less. |
| `draft.serienbau.name` | nur standard | 9 | Serienbau | Mass production |
| `draft.soeldnerheer.desc` | nur standard | 65 | Einheiten kosten kein Material. Nachteil: Fabrikproduktion −{d1} %. | Units cost no material. Drawback: factory output −{d1}%. |
| `draft.soeldnerheer.name` | nur standard | 11 | Söldnerheer | Mercenary army |
| `draft.soeldnertruppe.desc` |  | 106 | Über dem Versorgungslimit lassen sich Einheiten für {so} % Aufschlag anwerben; sie belegen keine Versorgung. | Above the supply limit units can be hired for {so}% extra; they use no supply. |
| `draft.soeldnertruppe.name` |  | 14 | Söldnerwerbung | Hired Swords |
| `draft.stachelwall.desc` |  | 77 | Nahkämpfer an der Mauer erleiden den Schaden von {e1} Stachelstufen pro Schlag. | Melee attackers at the wall take the damage of {e1} spike levels per strike. |
| `draft.stachelwall.name` |  | 11 | Stachelwall | Spiked wall |
| `draft.taktiker.desc` | nur standard | 73 | Schaden gegen Basen +{syn} % je gewählter Armeekarte (diese eingeschlossen). | Damage against bases +{syn}% per chosen army card (this one included). |
| `draft.taktiker.name` | nur standard | 8 | Taktiker | Tacticians |
| `draft.text` |  | 92 | Das Spiel ist pausiert. Wähle genau eine Karte; sie kann in der nächsten Stufe wiederkommen. | The game is paused. Choose exactly one card; it may return at its next tier. |
| `draft.tierOf` |  | 14 | Stufe {n} von {max} | Tier {n} of {max} |
| `draft.turmkanoniere.desc` |  | 55 | Turmschaden +{e1} %. Nur im Angebot, wenn ein Turm steht. | Tower damage +{e1}%. Only offered once a tower stands. |
| `draft.turmkanoniere.desc.t2.karten` | karten | 40 | Turmschaden +{e1} %, Turmreichweite +{e2p} %. | Tower damage +{e1}%, tower range +{e2p}%. |
| `draft.turmkanoniere.desc.t3.karten` | karten | 77 | Turmschaden +{e1} %, Turmreichweite +{e2p} %, doppelter Schaden gegen Fernkämpfer. | Tower damage +{e1}%, tower range +{e2p}%, double damage against ranged units. |
| `draft.turmkanoniere.name` |  | 13 | Turmkanoniere | Tower gunners |
| `draft.turmschule.desc` |  | 80 | Türme: Reichweite +{e1} %, Abklingzeit −{e2p} %. Nur im Angebot, wenn ein Turm steht. | Towers: range +{e1}%, cooldown −{e2p}%. Only offered when a tower stands. |
| `draft.turmschule.name` |  | 10 | Turmschule | Tower school |
| `draft.verbrannteErde.desc` | nur standard | 104 | Fällt eine Mauer, erleiden alle Gegner ihrer Lane {e1} Schaden. Nachteil: Reparaturen kosten das Doppelte. | When a wall falls, all enemies in its lane take {e1} damage. Drawback: repairs cost double. |
| `draft.verbrannteErde.name` | nur standard | 15 | Verbrannte Erde | Scorched earth |
| `draft.veteranen.desc` | nur standard | 69 | Einheitenstärke +{syn} % je gewählter Armeekarte (diese eingeschlossen). | Unit strength +{syn}% per chosen army card (this one included). |
| `draft.veteranen.name` | nur standard | 9 | Veteranen | Veterans |
| `draft.vorposten.desc` | nur standard | 119 | Einheiten starten {e1} weiter vorn, aber nie hinter der gegnerischen Front. Nachteil: alle Abschnitte −{d1} % Lebenspunkte. | Units start {e1} further forward, but never behind the enemy front. Drawback: all sections −{d1}% health. |
| `draft.vorposten.name` | nur standard | 9 | Vorposten | Outpost |
| `draft.waffenbrueder.desc` |  | 96 | Einheiten +{syn} % Schaden je Militärkarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Units +{syn}% damage per military card (at most {max} cards count). The card counts itself. |
| `draft.waffenbrueder.name` |  | 12 | Waffenbrüder | Brothers in arms |
| `draft.wehrhandel.desc` |  | 110 | Materialertrag +{syn} % je Verteidigungskarte (höchstens {max} Karten zählen). Zählt für Wirtschaft und Verteidigung. | Material yield +{syn}% per defence card (at most {max} cards count). Counts for economy and defence. |
| `draft.wehrhandel.name` |  | 10 | Wehrhandel | Defence trade |
| `draft.wehrverband.desc` |  | 98 | Türme +{syn} % Schaden je Verteidigungskarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Towers +{syn}% damage per defence card (at most {max} cards count). The card counts itself. |
| `draft.wehrverband.name` |  | 11 | Wehrverband | Militia league |
| `draft.weitschuss.desc` | nur standard | 42 | Fernkämpfer verursachen {e1} % mehr Schaden. | Ranged units deal {e1}% more damage. |
| `draft.weitschuss.name` | nur standard | 10 | Weitschuss | Long shot |
| `draft.werkmeister.desc` | nur standard | 95 | Die Schmiede kauft ihre nächste Qualitätsstufe selbst, sobald du das {e1}-Fache des Preises hast. | The smithy buys its next quality grade by itself once you hold {e1}× the price. |
| `draft.werkmeister.name` | nur standard | 11 | Werkmeister | Foreman |
| `draft.zeugmeister.desc` | nur standard | 82 | Errichtete Türme kaufen „Kaliber“ selbst, sobald du das {e1}-Fache des Preises hast. | Built towers buy calibre by themselves once you hold {e1}× the price. |
| `draft.zeugmeister.name` | nur standard | 11 | Zeugmeister | Armourer |
| `draft.zinnen.desc` | nur standard | 35 | Alle Abschnitte +{e1} % Lebenspunkte. | All sections +{e1}% health. |
| `draft.zinnen.desc.t2.karten` | karten | 68 | Alle Abschnitte +{e1} % Lebenspunkte; Reparaturen kosten {e2p} % weniger. | All sections +{e1}% health; repairs cost {e2p}% less. |
| `draft.zinnen.name` | nur standard | 6 | Zinnen | Battlements |

## Kartenpfad: Pfadkarten, Wirkungszeilen, Pfadforschung

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `kp.card.ballistik.desc` |  | 24 | Der Weg der Fernkämpfer. | The way of the ranged units. |
| `kp.card.ballistik.name` |  | 9 | Ballistik | Ballistics |
| `kp.card.befestigungskunde.desc` |  | 29 | Wissen über Mauern und Türme. | Knowledge of walls and towers. |
| `kp.card.befestigungskunde.name` |  | 17 | Befestigungskunde | Fortification Lore |
| `kp.card.buchdruck.desc` |  | 45 | Öffnet die Weiterentwicklung der Universität. | Opens the advancement of the university. |
| `kp.card.buchdruck.name` |  | 9 | Buchdruck | Printing press |
| `kp.card.built` |  | 18 | gebaut: {name} | built: {name} |
| `kp.card.dampfkraft.desc` |  | 85 | Öffnet die zweite Weiterentwicklung der Produktion: Fabriken werden zu Dampffabriken. | Opens the second development of production: factories become steam factories. |
| `kp.card.dampfkraft.name` |  | 10 | Dampfkraft | Steam power |
| `kp.card.eiserneKlingen.desc` |  | 25 | Besseres Gerät aus Eisen. | Better equipment made of iron. |
| `kp.card.eiserneKlingen.name` |  | 15 | Eiserne Klingen | Iron Blades |
| `kp.card.excludes` |  | 16 | Schließt aus: {list} | Excludes: {list} |
| `kp.card.excludesGeneric` |  | 37 | Schließt eine andere Technologie aus. | Rules out another technology. |
| `kp.card.fernhandel.desc` |  | 99 | Das Kontor wird zum Handelshaus: Es wirbt gegen Material Söldnerkompanien an, die sofort ausrücken. | The trading post becomes a trading house: it hires mercenary companies for material that march out at once. |
| `kp.card.fernhandel.name` |  | 10 | Fernhandel | Long-distance Trade |
| `kp.card.forschungsort` |  | 27 | Universität oder Bibliothek | university or library |
| `kp.card.fortgeschritteneTaktiken.desc` |  | 26 | Neue Wege der Aufstellung. | New ways to arrange the units. |
| `kp.card.fortgeschritteneTaktiken.name` |  | 14 | Taktikschulung | Tactics Training |
| `kp.card.geschuetzguss.desc` |  | 108 | Schmiede wird zur Gießerei: Die Kaserne bildet Geschütze aus, die Mauern und Basis aus der Ferne beschießen. | The smithy becomes a foundry: the barracks train guns that shell walls and base from afar. |
| `kp.card.geschuetzguss.name` |  | 12 | Geschützguss | Gun Casting |
| `kp.card.glaskanonen.desc` |  | 87 | Fernkämpfer richten doppelt so viel aus. Nachteil: Fernkämpfer haben nur 1 Lebenspunkt. | Ranged units deal twice the damage. Drawback: ranged units have only 1 hit point. |
| `kp.card.glaskanonen.name` |  | 11 | Glaskanonen | Glass Cannons |
| `kp.card.hofhaltung.desc` |  | 121 | Das Rathaus wird zur Residenz: fünf Manufakturen und ein zweiter Flügel. Der Ausbau kostet Material, im Reiter Haupthaus. | The town hall becomes a residence: five manufactories and a second wing. The upgrade costs material, in the main hall tab. |
| `kp.card.hofhaltung.name` |  | 10 | Hofhaltung | Court Household |
| `kp.card.needs` |  | 12 | Benötigt: {list} | Needs: {list} |
| `kp.card.noBan` |  | 36 | Pfadkarten lassen sich nicht bannen. | Path cards cannot be banned. |
| `kp.card.opens` |  | 20 | Öffnet Forschung: {list} | Opens research: {list} |
| `kp.card.returns` |  | 47 | Kehrt in den Stapel zurück, wenn nicht gewählt. | Returns to the deck if not chosen. |
| `kp.card.stadtrecht.desc` |  | 112 | Der Gutshof wird zum Rathaus: vier Manufakturen und ein Flügel. Der Ausbau kostet Material, im Reiter Haupthaus. | The manor becomes a town hall: four manufactories and one wing. The upgrade costs material, in the main hall tab. |
| `kp.card.stadtrecht.name` |  | 10 | Stadtrecht | Town Charter |
| `kp.card.unlocks` |  | 17 | Schaltet frei: {list} | Unlocks: {list} |
| `kp.card.volleAuslastung.desc` | nur standard | 47 | Versorgung ×{e1}. Nachteil: Materialertrag −50 %. | Supply ×{e1}. Drawback: material yield −50 %. |
| `kp.card.volleAuslastung.name` | nur standard | 16 | Volle Auslastung | Full Capacity |
| `kp.card.wasserrahmen.desc` |  | 99 | Öffnet die erste Weiterentwicklung der Produktion: Manufakturen werden zu Fabriken mit mehr Ertrag. | Opens the first development of production: manufactories become factories with more yield. |
| `kp.card.wasserrahmen.name` |  | 12 | Wasserrahmen | Water Frame |
| `kp.collection.banned` |  | 7 | Gebannt | Banned |
| `kp.collection.hint` |  | 82 | Sammlung: gewählte und gebannte Karten. Die Wahl findet auf der Kartenbühne statt. | Collection: chosen and banned cards. The choice itself is made on the card stage. |
| `kp.collection.noneBanned` |  | 20 | Keine Karte gebannt. | No card banned. |
| `kp.deck.count` |  | 17 | {n} Karten gewählt | {n} cards chosen |
| `kp.deck.label` |  | 6 | Stapel | Deck |
| `kp.drawback.allesAufDieMitte` |  | 29 | Abschnitte −{d1} % Lebenspunkte | Sections −{d1} % health |
| `kp.drawback.ausfall` |  | 23 | Reparatur der Mauer ×{d1} | Wall repairs cost ×{d1} |
| `kp.drawback.aushebung` |  | 28 | Einheiten −{d1} % Lebenspunkte | Units −{d1} % health |
| `kp.drawback.bollwerk` |  | 25 | Manufakturen −{d1p} % Ertrag | Manufactories −{d1p} % yield |
| `kp.drawback.elite` |  | 25 | Versorgungslimit halbiert | Supply limit halved |
| `kp.drawback.fabrikmiliz` |  | 20 | Materialertrag −{d1} % | Material yield −{d1} % |
| `kp.drawback.freihandel` |  | 26 | Türme bleiben auf Stufe {tw} | Towers stay at level {tw} |
| `kp.drawback.glaskanonen` |  | 31 | Fernkämpfer haben 1 Lebenspunkt | Ranged units have 1 health |
| `kp.drawback.gluecksritter` |  | 28 | Stufen brauchen {d1} % mehr EP | Levels need {d1} % more XP |
| `kp.drawback.grenzfeste` |  | 28 | Eigene Wellen: Abstand +{d1p} % | Own waves: gap +{d1p} % |
| `kp.drawback.grosseArmee` |  | 26 | Eigene Wellen: Abstand ×{d1} | Own waves: gap ×{d1} |
| `kp.drawback.massenaufgebot` |  | 34 | Nur Läufer, keine Spezialeinheiten | Runners only, no special units |
| `kp.drawback.raubbau` |  | 31 | Ertrag verfällt alle {rv} Minuten | Yield decays every {rv} minutes |
| `kp.drawback.stehendesHeer` |  | 36 | Unterhalt {d1} Material/min je Einheit | Upkeep {d1} material/min per unit |
| `kp.drawback.stiftung` |  | 26 | Einheiten kosten {d1p} % mehr | Units cost {d1p} % more |
| `kp.drawback.vorstoss` |  | 27 | Türme feuern {d1p} % langsamer | Towers fire {d1p} % slower |
| `kp.drawback.zermuerbung` |  | 26 | Quartiere kosten {d1} % mehr | Quarters cost {d1} % more |
| `kp.drawback.zunftordnung` |  | 20 | Manufakturgrenze −{gd} | Manufactory limit −{gd} |
| `kp.eff.allesAufDieMitte` |  | 31 | Alle in die Mitte, +{e2} % Stärke | All to the centre, +{e2} % strength |
| `kp.eff.ausfall` |  | 27 | Gegenstoß, Basisschaden ×{e3} | Counterattack, base damage ×{e3} |
| `kp.eff.aushebung` |  | 20 | Versorgungslimit +{e1} | Supply limit +{e1} |
| `kp.eff.ballistik` |  | 36 | Forschung: Armbrustschütze, Katapult | Research: Crossbowmen, Catapult |
| `kp.eff.bastion` | nur standard | 22 | Türme +{e1} % Reichweite | Towers +{e1} % range |
| `kp.eff.bauleitung` | nur standard | 20 | Baut Fabriken selbst | Builds factories by itself |
| `kp.eff.bauordnung` |  | 22 | Nachbarschaftsboni ×{e1} | Neighbour bonuses ×{e1} |
| `kp.eff.befestigungskunde` |  | 36 | Forschung: Wehrgänge, Schießscharten | Research: Wall Walks, Arrow Slits |
| `kp.eff.belagerungsgeraet` | nur standard | 25 | Schaden gegen Basen +{e1} % | Damage to bases +{e1} % |
| `kp.eff.bessereFabriken` |  | 18 | Fabrikertrag +{e1} % | Factory yield +{e1} % |
| `kp.eff.bessereFabriken.karten` | karten | 29 | Ertrag der Manufakturen +{e1} % | Manufactory yield +{e1} % |
| `kp.eff.blitzkrieg` | nur standard | 32 | Wellen alle 12 s statt alle 20 s | Waves every 12 s instead of 20 s |
| `kp.eff.bollwerk` |  | 29 | Bastion; Turm-Abschüsse 2× EP | Bastion; tower takedowns 2× XP |
| `kp.eff.buchdruck` |  | 38 | Akademie: Forschung doppelt so schnell | Academy: research twice as fast |
| `kp.eff.dampfkraft` |  | 34 | Fabrik → Dampffabrik: Ertrag +{e1} % | Factory → steam factory: yield +{e1}% |
| `kp.eff.dauerauftrag` |  | 31 | Warteschlange füllt sich selbst | Queue refills itself |
| `kp.eff.doppelschicht` | nur standard | 25 | Fabriken +{e1} % Produktion | Factories +{e1} % output |
| `kp.eff.drill` |  | 35 | Einheiten greifen {e1} % schneller an | Units attack {e1} % faster |
| `kp.eff.durchbruch` |  | 16 | Basisschaden ×{e1} | Base takes {e1}× damage |
| `kp.eff.eiserneKlingen` |  | 22 | Forschung: Eisenwaffen | Research: Iron Gear |
| `kp.eff.elite` |  | 17 | LP und Schaden ×2 | Health and damage ×2 |
| `kp.eff.fabrikmiliz` |  | 27 | Manufakturen stellen Läufer | Manufactories train runners |
| `kp.eff.fernhandel` |  | 38 | Kontor → Handelshaus: Söldnerkompanien | Trading post → trading house: mercenaries |
| `kp.eff.festungsbau` | nur standard | 30 | Abschnitte +{syn} % je Basiskarte | Sections +{syn} % per base card |
| `kp.eff.fliessband` | nur standard | 25 | Automatische Presse +{e1} % | Automatic press +{e1} % |
| `kp.eff.fortgeschritteneTaktiken` |  | 31 | Forschung: Reiter, Schildträger | Research: Riders, Shield bearers |
| `kp.eff.freihandel` |  | 25 | Material und EP tauschbar | Material and XP tradable |
| `kp.eff.geschuetzguss` |  | 30 | Schmiede → Gießerei: Geschütze | Smithy → foundry: guns |
| `kp.eff.gilde` |  | 32 | Ertrag +{syn} % je Wirtschaftskarte | Yield +{syn}% per economy card |
| `kp.eff.glaskanonen` |  | 36 | Fernkämpfer: doppelter Schaden, 1 LP | Ranged: double damage, 1 HP |
| `kp.eff.gluecksritter` |  | 26 | Eine Karte mehr je Angebot | One more card per offer |
| `kp.eff.grenzfeste` |  | 27 | Turm-Abschüsse ×{e1} Material | Tower takedowns ×{e1} material |
| `kp.eff.grenzwacht` |  | 30 | Mauer +{syn} % LP je Militärkarte | Wall +{syn}% health per military card |
| `kp.eff.grossauftrag` | nur standard | 38 | Fabrikertrag +{syn} % je Wirtschaftskarte | Factory yield +{syn} % per economy card |
| `kp.eff.grosseArmee` |  | 20 | Versorgungslimit ×{e1} | Supply limit ×{e1} |
| `kp.eff.handelskontor` |  | 26 | Zinsdeckel des Kontors +{e1} | Trading post interest cap +{e1} |
| `kp.eff.handelskontor.karten` | karten | 28 | Zinsdeckel des Kontors +{e1} % | Trading post cap +{e1}% |
| `kp.eff.hofhaltung` |  | 39 | Residenz: {gr} Manufakturen, neuer Flügel | Residence: {gr} manufactories, new wing |
| `kp.eff.instandhaltung` | nur standard | 33 | Abschnitte reparieren sich selbst | Sections repair themselves |
| `kp.eff.kriegsanleihe` | nur standard | 35 | Sofort Material für {e1} s Produktion | Instantly {e1} s of production |
| `kp.eff.kriegserfahrung` |  | 21 | +{e1} % EP pro Abschuss | +{e1} % XP per takedown |
| `kp.eff.kriegserfahrung.karten` | karten | 21 | Alle EP-Quellen +{e1} % | All XP sources +{e1} % |
| `kp.eff.kriegstrommeln` |  | 26 | Formationen: +{e1} % Schaden | Formations: +{e1} % damage |
| `kp.eff.kriegswirtschaft` |  | 37 | Einheitenkosten −{syn} % je Militärkarte | Unit cost −{syn}% per military card |
| `kp.eff.lagerzehnt` |  | 34 | Überschüssiges Material wird zu EP | Surplus material turns into XP |
| `kp.eff.langeWurfarme` | nur standard | 21 | Werfer +{e1} Reichweite | Throwers +{e1} range |
| `kp.eff.massenaufgebot` |  | 26 | Läufer −{e1} %, +{e2} je Welle | Runners −{e1} %, +{e2} per wave |
| `kp.eff.maurerkolonne` |  | 35 | Mauern regenerieren {e1} % je Sekunde | Walls regenerate {e1} % per second |
| `kp.eff.nachtschicht` | nur standard | 27 | Spätphase: Fabriken {e1} mehr | Late phase: factories {e1} more |
| `kp.eff.notreserve` | nur standard | 30 | Tor wird einmal voll repariert | Gate repaired fully once |
| `kp.eff.pluenderung` |  | 31 | Turm-Abschüsse bringen Material | Tower takedowns bring material |
| `kp.eff.querverbindung` |  | 32 | Nachbarschaftsboni auch diagonal | Neighbour bonuses also diagonal |
| `kp.eff.rationalisierung` | nur standard | 33 | Fabriken +{syn} % je Automatisierung | Factories +{syn} % per automation |
| `kp.eff.raubbau` |  | 26 | Ertrag der Manufakturen ×2 | Manufactory yield ×2 |
| `kp.eff.rekrutenzug` |  | 30 | Kaserne schickt {e1} Läufer mehr | Barracks sends {e1} more runner |
| `kp.eff.sammelruf` |  | 31 | +1 Läufer je zwei Militärkarten | +1 runner per two military cards |
| `kp.eff.sappeure` | nur standard | 37 | Gegnerbasis verliert {e1} LP je Sekunde | Enemy base loses {e1} HP per second |
| `kp.eff.scharfschuetzen` | nur standard | 35 | Turmschaden +{e1} % gegen Fernkämpfer | Tower damage +{e1} % vs ranged |
| `kp.eff.schildwall` |  | 34 | Volle Nahkampfreihe hält +{e1} % aus | Full melee row holds +{e1} % more |
| `kp.eff.schwerePressen` | nur standard | 25 | Fabriken +{e1} % Produktion | Factories +{e1} % output |
| `kp.eff.selbstlaeufer` | nur standard | 37 | Presse +{syn} % je Automatisierungskarte | Press +{syn} % per automation card |
| `kp.eff.serienbau` | nur standard | 27 | Neue Fabriken {e1} % billiger | New factories {e1} % cheaper |
| `kp.eff.soeldnerheer` | nur standard | 30 | Einheiten kosten kein Material | Units cost no material |
| `kp.eff.soeldnertruppe` |  | 33 | Söldner über dem Versorgungslimit | Mercenaries beyond the supply limit |
| `kp.eff.stachelwall` |  | 24 | Mauern: Stachelstufen {e1} | Walls: spike levels {e1} |
| `kp.eff.stadtrecht` |  | 38 | Rathaus: {gr} Manufakturen, neuer Flügel | Town hall: {gr} manufactories, new wing |
| `kp.eff.stehendesHeer` |  | 25 | Heerlager: Versorgung +{s1} | Army camp: supply +{s1} |
| `kp.eff.stiftung` |  | 29 | Stiftungshaus: Budgetkurs ×{s1} | Endowment hall: rate ×{s1} |
| `kp.eff.taktiker` | nur standard | 34 | Schaden gegen Basen +{syn} % je Karte | Damage to bases +{syn} % per card |
| `kp.eff.turmkanoniere` |  | 17 | Turmschaden +{e1} % | Tower damage +{e1} % |
| `kp.eff.turmschule` |  | 35 | Reichweite +{e1} %, Abklingzeit −{e2p} % | Range +{e1}%, cooldown −{e2p}% |
| `kp.eff.verbrannteErde` | nur standard | 38 | Gefallene Mauer: {e1} Schaden an Gegnern | Fallen wall: {e1} damage to enemies |
| `kp.eff.veteranen` | nur standard | 35 | Einheitenstärke +{syn} % je Armeekarte | Unit strength +{syn} % per army card |
| `kp.eff.volleAuslastung` | nur standard | 28 | Versorgung ×{e1}, Ertrag −50 % | Supply ×{e1}, yield −50 % |
| `kp.eff.vorposten` | nur standard | 32 | Einheiten starten {e1} weiter vorn | Units start {e1} further forward |
| `kp.eff.vorstoss` |  | 28 | Eigene Wellen doppelt so oft | Own waves twice as often |
| `kp.eff.waffenbrueder` |  | 29 | Schaden +{syn} % je Militärkarte | Damage +{syn}% per military card |
| `kp.eff.wasserrahmen` |  | 33 | Manufaktur → Fabrik: Ertrag +{e1} % | Manufactory → factory: yield +{e1}% |
| `kp.eff.wehrhandel` |  | 34 | Ertrag +{syn} % je Verteidigungskarte | Yield +{syn}% per defence card |
| `kp.eff.wehrverband` |  | 39 | Turmschaden +{syn} % je Verteidigungskarte | Tower damage +{syn}% per defence card |
| `kp.eff.weitschuss` | nur standard | 25 | Fernkämpfer +{e1} % Schaden | Ranged units +{e1} % damage |
| `kp.eff.werkmeister` | nur standard | 28 | Schmiede kauft Stufen selbst | Smithy buys tiers by itself |
| `kp.eff.zermuerbung` |  | 29 | Gegner −{zr} % LP vor der Mauer | Enemies −{zr} % health at the wall |
| `kp.eff.zeugmeister` | nur standard | 27 | Türme kaufen Kaliber selbst | Towers buy calibre by themselves |
| `kp.eff.zinnen` | nur standard | 34 | Alle Abschnitte +{e1} % Lebenspunkte | All sections +{e1} % health |
| `kp.eff.zunftordnung` |  | 27 | Zunfthaus: Nachbarbonus ×{nb} | Guildhall: neighbour bonus ×{nb} |
| `kp.fam.bonus` |  | 5 | Bonus | Bonus |
| `kp.fam.doktrin` |  | 7 | Doktrin | Doctrine |
| `kp.fam.technologie` |  | 11 | Technologie | Technology |
| `kp.fam.wagnis` |  | 6 | Wagnis | Gamble |
| `kp.fam.weiterentwicklung` |  | 17 | Weiterentwicklung | Development |
| `kp.lock.card` |  | 31 | Freischaltung: Karte {name} | Unlocked by: card {name} |
| `kp.lock.opens` |  | 28 | Öffnet mit: Karte {name} | Opens with: card {name} |
| `kp.lock.research` |  | 21 | Forschung: {name} | Research: {name} |
| `kp.path.head` |  | 5 | Pfade | Paths |
| `kp.path.status.available` |  | 9 | verfügbar | available |
| `kp.path.status.chosen` |  | 7 | gewählt | chosen |
| `kp.path.status.done` |  | 9 | erforscht | researched |
| `kp.path.status.excluded` |  | 14 | ausgeschlossen | excluded |
| `kp.path.status.locked` |  | 8 | gesperrt | locked |
| `kp.path.status.running` |  | 5 | läuft | running |
| `kp.res.armbrust.desc` |  | 34 | Armbrustschützen werden verfügbar. | Crossbowmen become available. |
| `kp.res.armbrust.name` |  | 11 | Armbrustbau | Crossbow Making |
| `kp.res.buchdruck.desc` |  | 91 | Die Universität wird zur Akademie: Forschung {e1} % kürzer, Kurs des Forschungsbudgets +{e2} %. | The university becomes an academy: research {e1}% shorter, research budget rate +{e2}%. |
| `kp.res.buchdruck.name` |  | 16 | Akademiegründung | Academy Foundation |
| `kp.res.dampfkraft.desc` |  | 110 | Alle Fabriken werden zu Dampffabriken: Ertrag +{e1} %, Klickertrag +{e2} %. Grundvarianten der Fabriken entfallen. | All factories become steam factories: yield +{e1} %, click yield +{e2} %. Basic variants of the factories are replaced. |
| `kp.res.dampfkraft.name` |  | 13 | Dampffabriken | Steam factories |
| `kp.res.eisenwaffen.desc` |  | 95 | Läufer werden zu Schwertkämpfern, Werfer zu Bogenschützen; Schmiede-Stufen ab 4 werden kaufbar. | Runners become swordsmen, throwers become archers; smithy levels from 4 up can be bought. |
| `kp.res.eisenwaffen.name` |  | 11 | Eisenwaffen | Iron Gear |
| `kp.res.fernhandel.desc` |  | 100 | Das Kontor wird zum Handelshaus und wirbt Söldnerkompanien an. Grundvarianten des Kontors entfallen. | The trading post becomes a trading house and hires mercenary companies. Basic variants are dropped. |
| `kp.res.fernhandel.name` |  | 14 | Handelshausbau | Trading House Works |
| `kp.res.geschuetzguss.desc` |  | 104 | Die Schmiede wird zur Gießerei, die Kaserne bildet Geschütze aus. Grundvarianten der Schmiede entfallen. | The smithy becomes a foundry, the barracks train guns. Basic smithy variants are dropped. |
| `kp.res.geschuetzguss.name` |  | 11 | Gießereibau | Foundry Works |
| `kp.res.group.grund` |  | 14 | Grundforschung | Basic research |
| `kp.res.group.pfad` |  | 13 | Pfadforschung | Path research |
| `kp.res.katapult.desc` |  | 27 | Katapulte werden verfügbar. | Catapults become available. |
| `kp.res.katapult.name` |  | 11 | Katapultbau | Catapult Making |
| `kp.res.opensWith` |  | 28 | Öffnet mit: Karte {name} | Opens with: card {name} |
| `kp.res.reiter.desc` |  | 24 | Reiter werden verfügbar. | Riders become available. |
| `kp.res.reiter.name` |  | 8 | Reiterei | Cavalry |
| `kp.res.schiessscharten.desc` |  | 64 | Türme richten {e1} % mehr Schaden an, gegen Fernkämpfer {e2} % mehr. | Towers deal {e1} % more damage, {e2} % more against ranged units. |
| `kp.res.schiessscharten.name` |  | 14 | Schießscharten | Arrow Slits |
| `kp.res.schild.desc` |  | 30 | Schildträger werden verfügbar. | Shield bearers become available. |
| `kp.res.schild.name` |  | 16 | Schildausbildung | Shield Training |
| `kp.res.wasserrahmen.desc` |  | 77 | Alle Manufakturen werden zu Fabriken: Ertrag +{e1} %. Grundvarianten entfallen. | All manufactories become factories: yield +{e1}%. Basic variants are dropped. |
| `kp.res.wasserrahmen.name` |  | 8 | Fabriken | Factories |
| `kp.res.wehrgang.desc` |  | 62 | Mauern halten {e1} % mehr aus, die Reparaturpause sinkt um {e2} %. | Walls hold {e1} % more, the repair pause drops by {e2} %. |
| `kp.res.wehrgang.name` |  | 9 | Wehrgänge | Wall Walks |
| `kp.stage.hint` |  | 57 | Fahre über eine Karte oder wähle mit den Tasten 1 bis {n}. | Hover over a card or choose with keys 1 to {n}. |
| `kp.stage.later` |  | 6 | Später | Later |
| `kp.stage.next` |  | 34 | Nächste Stufe noch nicht verfügbar | Next level not available yet |
| `kp.stage.title` |  | 36 | Stufe {n} erreicht – wähle eine Karte | Level {n} reached – choose a card |

## Gebäude-Varianten

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `var.bastion.desc` |  | 90 | Feuert wie ein Turm über die Mauer, {bd} % stärker. Die Manufaktur darunter arbeitet weiter. | Fires like a tower over the wall, {bd}% stronger. The manufactory below keeps working. |
| `var.bastion.eff` |  | 21 | Feuert über die Mauer | Fires over the wall |
| `var.bastion.name` |  | 7 | Bastion | Bastion |
| `var.exerzierplatz.desc` |  | 72 | Einheiten richten {e1} % mehr Schaden an und haben {e2} % mehr Lebenspunkte. | Units deal {e1}% more damage and have {e2}% more health. |
| `var.exerzierplatz.eff` |  | 30 | Einheiten +{e1} % Schaden und LP | Units +{e1}% damage and health |
| `var.exerzierplatz.name` |  | 13 | Exerzierplatz | Parade ground |
| `var.garnison.desc` |  | 96 | Die Mauer heilt {e1} Lebenspunkte je Sekunde; Einheiten in der Mitte haben {e2} % mehr Lebenspunkte. | The wall heals {e1} health per second; units in the middle have {e2}% more health. |
| `var.garnison.eff` |  | 19 | Mauer heilt {e1} LP/s | Wall heals {e1} HP/s |
| `var.garnison.name` |  | 8 | Garnison | Garrison |
| `var.heerlager.desc` |  | 34 | Das Versorgungslimit steigt um {e1}. | The supply limit rises by {e1}. |
| `var.heerlager.eff` |  | 14 | Versorgung +{e1} | Supply +{e1} |
| `var.heerlager.name` |  | 9 | Heerlager | Army camp |
| `var.manufaktur.desc` |  | 59 | Liefert {e1} % mehr Material als eine gewöhnliche Manufaktur. | Yields {e1}% more material than a plain manufactory. |
| `var.manufaktur.eff` |  | 12 | Ertrag +{e1} % | Yield +{e1}% |
| `var.manufaktur.name` |  | 13 | Hofmanufaktur | Court Manufactory |
| `var.muenzschmiede.desc` |  | 49 | Der Schmiede-Ausbau kostet {e1} % weniger Material. | The smithy upgrade costs {e1}% less material. |
| `var.muenzschmiede.eff` |  | 28 | Schmiede-Ausbau −{e1} % Kosten | Smithy upgrade −{e1}% cost |
| `var.muenzschmiede.name` |  | 12 | Münzschmiede | Mint Smithy |
| `var.ruestkammer.desc` |  | 37 | Die Mauer hat {e1} % mehr Lebenspunkte. | The wall has {e1}% more health. |
| `var.ruestkammer.eff` |  | 14 | Mauer +{e1} % LP | Wall +{e1}% health |
| `var.ruestkammer.name` |  | 10 | Rüstkammer | Armoury |
| `var.stiftungshaus.desc` |  | 57 | Der Kurs des Forschungsbudgets wird mit {e1} multipliziert. | The rate of the research budget is multiplied by {e1}. |
| `var.stiftungshaus.eff` |  | 14 | Budgetkurs ×{e1} | Budget rate ×{e1} |
| `var.stiftungshaus.name` |  | 13 | Stiftungshaus | Endowment hall |
| `var.wachstube.desc` |  | 75 | Türme richten {e1} % mehr Schaden an; Abschüsse durch Türme bringen Material. | Towers deal {e1}% more damage; tower takedowns bring material. |
| `var.wachstube.eff` |  | 19 | Türme +{e1} % Schaden | Towers +{e1}% damage |
| `var.wachstube.name` |  | 9 | Wachstube | Guardhouse |
| `var.waffenschmiede.desc` |  | 38 | Die Ausbauten der Schmiede wirken ×{e1}. | The smithy upgrades work ×{e1}. |
| `var.waffenschmiede.eff` |  | 19 | Schmiede-Ausbau ×{e1} | Smithy upgrades ×{e1} |
| `var.waffenschmiede.name` |  | 14 | Waffenschmiede | Weapon smithy |
| `var.werkstatt.desc` |  | 39 | Einheiten kosten {e1} % weniger Material. | Units cost {e1}% less material. |
| `var.werkstatt.eff` |  | 22 | Einheiten −{e1} % Kosten | Units −{e1}% cost |
| `var.werkstatt.name` |  | 14 | Zeugmanufaktur | Arms Manufactory |
| `var.zahlmeisterei.desc` |  | 60 | Der Kaserne-Ausbau „Quartiere“ kostet {e1} % weniger Material. | The barracks upgrade “Quarters” costs {e1}% less material. |
| `var.zahlmeisterei.eff` |  | 22 | Quartiere −{e1} % Kosten | Quarters −{e1}% cost |
| `var.zahlmeisterei.name` |  | 13 | Zahlmeisterei | Paymaster |
| `var.zunfthaus.desc` |  | 82 | Manufaktur, deren Nachbarschaftsbonus (Manufaktur neben Manufaktur) {nb}-fach wirkt. | A manufactory whose neighbour bonus (manufactory next to manufactory) counts {nb} times. |
| `var.zunfthaus.eff` |  | 16 | Nachbarbonus ×{nb} | Neighbour bonus ×{nb} |
| `var.zunfthaus.name` |  | 9 | Zunfthaus | Guildhall |
| `variant.cell` |  | 22 | Aufwertung noch {s} s | conversion {s} s left |
| `variant.once` |  | 58 | Einmalig und endgültig; Abriss und Neubau bleiben möglich. | Once and for all; demolishing and rebuilding stay possible. |
| `variant.pick` |  | 23 | Aufwerten zu {name} | Convert to {name} |
| `variant.progress` |  | 56 | Aufwertung zu {name}: noch {s} s. Das Gebäude ruht. | Converting to {name}: {s} s left. The building rests. |
| `variant.reason.done` |  | 54 | Bereits aufgewertet; nur Abriss und Neubau ändern das. | Already converted; only demolishing and rebuilding changes that. |
| `variant.reason.excess` |  | 32 | Reiße zuerst {n} Manufakturen ab. | Demolish {n} manufactories first. |
| `variant.reason.excess.one` |  | 32 | Reiße zuerst eine Manufaktur ab. | Demolish one manufactory first. |
| `variant.reason.upgrading` |  | 37 | Das Gebäude wird bereits aufgewertet. | The building is already being converted. |
| `variant.title` |  | 9 | Aufwerten | Convert |

## Doktrinen, Kategorien, Handel

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `doctrine.ausfall.desc` |  | 150 | Nach jeder abgewehrten Welle rückt ein Gegenstoß aus: {e2} % stärker, {e3}-facher Schaden an der Basis. Einschränkung: Mauerreparatur kostet das Doppelte. | After each repelled wave a counter-attack marches out: {e2}% stronger, {e3}× damage to the base. Limit: wall repair costs double. |
| `doctrine.ausfall.name` |  | 7 | Ausfall | Sortie |
| `doctrine.bollwerk.desc` |  | 169 | Manufakturen werden zur Bastion: ein Turm im Raster, der über die Mauer feuert, {bd} % stärker. Türme und Bastionen bringen doppelte EP. Einschränkung: Manufakturen −{d1p} %. | Manufactories become a bastion: a grid tower firing over the wall, {bd}% stronger. Towers and bastions give double XP. Limit: manufactories −{d1p}%. |
| `doctrine.bollwerk.name` |  | 8 | Bollwerk | Bulwark |
| `doctrine.elite.desc` |  | 117 | Deine Einheiten haben doppelte Lebenspunkte und doppelten Schaden. Einschränkung: Das Versorgungslimit halbiert sich. | Your units have double health and damage. Limit: the supply cap is halved. |
| `doctrine.elite.name` |  | 5 | Elite | Elite |
| `doctrine.fabrikmiliz.desc` |  | 99 | Jede Manufaktur stellt alle {mv} s einen Läufer ohne Versorgung. Einschränkung: Materialertrag −{d1} %. | Each manufactory trains a runner every {mv} s, no supply. Limit: material yield −{d1}%. |
| `doctrine.fabrikmiliz.name` |  | 10 | Bürgerwehr | Citizen Militia |
| `doctrine.freihandel.desc` |  | 155 | Im Kontor tauschst du Material und EP: {fsm} Material ergeben {fe} EP, {fse} EP ergeben {fmt} Material. Einschränkung: Türme bleiben auf Stufe {tw}, Ausbauten gesperrt. | At the trading post you swap material and XP: {fsm} material give {fe} XP, {fse} XP give {fmt} material. Limit: towers stay at level {tw}, upgrades locked. |
| `doctrine.freihandel.name` |  | 10 | Freihandel | Free trade |
| `doctrine.grenzfeste.desc` |  | 109 | Abschüsse durch Türme bringen {e1}-faches Material. Einschränkung: Zwischen deinen Wellen liegt {d1p} % mehr Zeit. | Tower takedowns bring {e1}× material. Limit: {d1p} % more time between your waves. |
| `doctrine.grenzfeste.name` |  | 10 | Grenzfeste | Border fortress |
| `doctrine.massenaufgebot.desc` |  | 125 | Läufer kosten {e1} % weniger, die Kaserne schickt je Welle {e2} Läufer mehr. Einschränkung: Werfer und Spezialeinheiten gesperrt. | Runners cost {e1}% less, the barracks sends {e2} more runner per wave. Limit: throwers and special units locked. |
| `doctrine.massenaufgebot.name` |  | 14 | Massenaufgebot | Mass levy |
| `doctrine.raubbau.desc` |  | 137 | Der Ertrag jeder Manufaktur verdoppelt sich. Einschränkung: Alle {rv} Minuten verliert jede eine von {rs} Ertragsstufen; Neubau erneuert sie. | Every manufactory yields double. Limit: every {rv} minutes each loses one of {rs} yield levels; rebuilding renews them. |
| `doctrine.raubbau.name` |  | 7 | Raubbau | Overexploitation |
| `doctrine.stehendesHeer.desc` |  | 129 | Die Kaserne wird zum Heerlager: Versorgungslimit +{s1}. Einschränkung: Jede Einheit im Feld kostet {d1} Material Unterhalt je Minute. | The barracks becomes an army camp: supply cap +{s1}. Limit: each unit in the field costs {d1} material upkeep per minute. |
| `doctrine.stehendesHeer.name` |  | 14 | Stehendes Heer | Standing Army |
| `doctrine.stiftung.desc` |  | 127 | Die Universität wird zum Stiftungshaus, der Kurs des Forschungsbudgets ×{s1}. Einschränkung: Einheiten kosten {d1p} % mehr Material. | The university becomes an endowment hall, research budget rate ×{s1}. Limit: units cost {d1p}% more material. |
| `doctrine.stiftung.name` |  | 8 | Stiftung | Endowment |
| `doctrine.vorstoss.desc` |  | 98 | Eigene Wellen rücken doppelt so oft aus (Abstand ×{e1}). Einschränkung: Türme feuern {d1p} % langsamer. | Your waves march out twice as often (interval ×{e1}). Limit: towers fire {d1p}% slower. |
| `doctrine.vorstoss.name` |  | 7 | Vorstoß | Push |
| `doctrine.zermuerbung.desc` |  | 107 | Gegner verlieren vor der Mauer einmalig {zr} % ihrer Lebenspunkte. Einschränkung: Quartiere kosten {d1} % mehr. | Foes lose {zr}% of their health once before the wall. Limit: quarters cost {d1}% more. |
| `doctrine.zermuerbung.name` |  | 10 | Zermürbung | Attrition |
| `doctrine.zunftordnung.desc` |  | 142 | Manufakturen werden zu Zunfthäusern, ihr Nachbarschaftsbonus wirkt {nb}-fach. Einschränkung: Die Obergrenze sinkt um {gd}; Zunfthäuser zählen mit. | Manufactories become guildhalls, their neighbour bonus counts {nb} times. Limit: the cap drops by {gd}; guildhalls count towards it. |
| `doctrine.zunftordnung.name` |  | 12 | Zunftordnung | Guild Order |
| `kat.art.bruecke` |  | 6 | Brücke | Bridge |
| `kat.art.verstaerker` |  | 10 | Verstärker | Amplifier |
| `kat.art.zaehler` |  | 6 | Zähler | Counter |
| `kat.counts.item` |  | 13 | {name} {n} | {name} {n} |
| `kat.counts.title` |  | 19 | Karten je Kategorie | Cards per category |
| `kat.militaer.name` |  | 7 | Militär | Military |
| `kat.neutral.name` |  | 7 | Neutral | Neutral |
| `kat.now` |  | 10 | derzeit {v} | now {v} |
| `kat.verteidigung.name` |  | 12 | Verteidigung | Defence |
| `kat.wirtschaft.name` |  | 10 | Wirtschaft | Economy |
| `raubbau.cell` |  | 11 | Raubbau ×{f} | Overexploitation ×{f} |
| `trade.progress` |  | 32 | EP-Fortschritt zur nächsten Wahl | XP progress to the next choice |
| `trade.reason.verfall` |  | 50 | Die wartende Stufe ist voll; weitere EP verfallen. | The waiting level is full; further XP would be lost. |
| `trade.reason.xp` |  | 37 | Zu wenig EP-Fortschritt: {n} EP nötig. | Not enough XP progress: {n} XP needed. |
| `trade.toMat` |  | 13 | EP → Material | XP → Material |
| `trade.toXp` |  | 13 | Material → EP | Material → XP |

## Erklärzeilen der Knöpfe

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `ex.again` |  | 19 | Zum Startbildschirm | To the start screen |
| `ex.back` |  | 31 | Partie läuft weiter · kostenlos | Game continues · free |
| `ex.budget` |  | 62 | {n} % des Ertrags werden zu EP, Kurs {k} · {n} % weniger Material | {n}% of the income becomes XP, rate {k} · {n}% less material |
| `ex.budget.off` |  | 47 | Kein Ertrag fließt in die Forschung · kostenlos | No income goes into research · free |
| `ex.cam.followOff` |  | 22 | Aus · Kamera fährt mit | Off · camera follows |
| `ex.cam.followOn` |  | 21 | An · Scrollen beendet | On · scrolling stops it |
| `ex.cam.front` |  | 24 | Zur vordersten Formation | To the foremost formation |
| `ex.cam.realm` |  | 18 | Zum Reich springen | Jump to your realm |
| `ex.cancel` |  | 22 | Schließt ohne Änderung | Closes without changes |
| `ex.card` |  | 29 | Spezialkarte · {tier} · kostenlos | Special card · {tier} · free |
| `ex.click` |  | 24 | +{n} Material · kostenlos | +{n} material · free |
| `ex.clickAuto` |  | 54 | Automatik: {n} Klicks/s · schneller klicken bringt mehr | Auto press: {n} clicks/s · click faster for more |
| `ex.demolish` |  | 26 | Platz frei · Erstattung {refund} | Frees the plot · refund {refund} |
| `ex.diff` |  | 38 | Gegnerbasis {hp} LP · Wellen {size} + {growth}/min | Enemy base {hp} HP · waves {size} + {growth}/min |
| `ex.draft.ban` |  | 36 | Für diese Partie entfernen · noch {n} | Remove for this game · {n} left |
| `ex.draft.reroll` |  | 27 | Alle Optionen neu · noch {n} | All options new · {n} left |
| `ex.fluegel` |  | 14 | {effect} · endgültig | {effect} · final |
| `ex.haus.ausbau` |  | 28 | {effect} · {cost} · {s} s | {effect} · {cost} · {s} s |
| `ex.hintOk` |  | 17 | Hinweis schließen | Close hint |
| `ex.hud.draft` |  | 24 | {n} offen · Reiter Karten | {n} open · Cards tab |
| `ex.kaserne.build` |  | 56 | Zum Reiter Bauen, Kaserne vorausgewählt · {cost} | Opens Build with barracks preselected · {cost} |
| `ex.kompanie` |  | 62 | {l} Läufer, {w} Werfer, sofort, ohne Versorgung · {cost} | {l} runners, {w} throwers, at once, no supply · {cost} |
| `ex.kompanie.cd` |  | 26 | Nächste Kompanie in {s} s | Next company in {s} s |
| `ex.kp.card` |  | 14 | {tier} · kostenlos | {tier} · free |
| `ex.kp.deck` |  | 34 | {cur} von {need} EP bis zur nächsten Wahl | {cur} of {need} XP to the next choice |
| `ex.kp.hud.draft` |  | 23 | {n} offen · Bühne öffnen | {n} open · open stage |
| `ex.kp.later` |  | 36 | Bühne einklappen · Wahl bleibt offen | Fold the stage · choice stays open |
| `ex.kp.vorschau` |  | 20 | noch nicht verfügbar | not available yet |
| `ex.lang.de` |  | 36 | Oberfläche und Meldungen auf Deutsch | Interface and messages in German |
| `ex.lang.en` |  | 37 | Oberfläche und Meldungen auf Englisch | Interface and messages in English |
| `ex.line` |  | 19 | {effect} · {cost} | {effect} · {cost} |
| `ex.menu.lang` |  | 16 | Sprache wechseln | Switch language |
| `ex.menu.pause` |  | 14 | Spiel anhalten | Pause the game |
| `ex.menu.resume` |  | 16 | Spiel fortsetzen | Continue the game |
| `ex.menu.session` |  | 16 | Sitzung als JSON | Session as JSON |
| `ex.menu.tutorial` |  | 16 | Tutorial beenden | End tutorial |
| `ex.newGame` |  | 25 | Sprache und Schwierigkeit | Language and difficulty |
| `ex.repair` |  | 33 | +{n} Lebenspunkte · {cost} | +{n} health · {cost} |
| `ex.research.rush` |  | 30 | Sofort fertig · {cost} | Finish now · {cost} |
| `ex.resetHints` |  | 43 | Alle Erstkontakt-Hinweise erscheinen wieder | All first-time hints appear again |
| `ex.resetHints.done` |  | 13 | Zurückgesetzt | Reset done |
| `ex.skipIntro.off` |  | 37 | Aus · Systeme erscheinen nacheinander | Off · systems appear one by one |
| `ex.skipIntro.on` |  | 26 | An · alles sofort sichtbar | On · everything visible at once |
| `ex.start` |  | 18 | Neue Partie auf {diff} | New game on {diff} |
| `ex.tab.army` |  | 17 | Einheiten, Wellen | Units, waves |
| `ex.tab.build` |  | 18 | Bauplätze, Gebäude | Plots, buildings |
| `ex.tab.cards` |  | 18 | Kartenwahl, Stufen | Card choice, tiers |
| `ex.tab.haus` |  | 13 | Stufe, Flügel | Level, wings |
| `ex.tab.smithy` |  | 15 | Qualitätsstufen | Quality levels |
| `ex.tab.uni` |  | 9 | Forschung | Research |
| `ex.tab.wall` |  | 17 | Reparatur, Ausbau | Repair, upgrades |
| `ex.trade.toMat` |  | 19 | {a} EP → {b} Material | {a} XP → {b} material |
| `ex.trade.toXp` |  | 19 | {a} Material → {b} EP | {a} material → {b} XP |
| `ex.tutorial.off` |  | 22 | Aus · direkt ins Spiel | Off · straight into the game |
| `ex.tutorial.on` |  | 56 | An · der Quartiermeister führt durch die ersten Schritte | On · the quartermaster guides you through the first steps |
| `ex.unit` |  | 27 | {role} · {hp} LP · {cost} | {role} · {hp} HP · {cost} |
| `ex.unit.merc` |  | 55 | {role} · {hp} LP · {cost} (Söldner, keine Versorgung) | {role} · {hp} HP · {cost} (mercenary, no supply) |
| `ex.variant` |  | 27 | {effect} · {cost}, {s} s | {effect} · {cost}, {s} s |
| `ex.wave.rush` |  | 47 | {n} Einheiten rücken sofort aus · {cost} | {n} units march at once · {cost} |
| `ex.wave.rushCd` |  | 16 | Wieder in {s} s | Again in {s} s |

## Tooltips

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `tip.again.body` |  | 27 | Zurück zum Startbildschirm. | Back to the start screen. |
| `tip.back.body` |  | 54 | Schließt den Startbildschirm. Die Partie läuft weiter. | Closes the start screen. The game continues. |
| `tip.baseFull` |  | 26 | Abschnitt ist unbeschädigt | Section is undamaged |
| `tip.budget.body` |  | 180 | Wandelt {n} % des laufenden Materialertrags (Fabriken und Presse) in EP um, Kurs {k} EP je Material. Die Einstellung lässt sich jederzeit ändern; Klicks und Zinsen bleiben unberührt. | Turns {n}% of the running material income (factories and press) into XP at a rate of {k} XP per material. You can change it any time; clicks and interest are not affected. |
| `tip.budget.body.karten` | karten | 141 | Wandelt {n} % des Materialertrags (Manufakturen, Presse) in EP um, {k} EP je Material. Jederzeit änderbar; Klicks und Zinsen bleiben unberührt. | Turns {n}% of material income (manufactories, press) into XP, {k} XP per material. Change it any time; clicks and interest are unaffected. |
| `tip.budget.mat` |  | 19 | Material je Sekunde | Material per second |
| `tip.budget.off` |  | 85 | Der gesamte Materialertrag bleibt beim Material, es entstehen keine EP aus Forschung. | All material income stays material; research yields no XP. |
| `tip.budget.rate` |  | 21 | Kurs (EP je Material) | Rate (XP per material) |
| `tip.budget.xp` |  | 13 | EP je Sekunde | XP per second |
| `tip.cam.follow` |  | 79 | Die Kamera hält die vorderste eigene Formation im Bild, bis du selbst scrollst. | The camera keeps your foremost formation in view until you scroll yourself. |
| `tip.cam.front` |  | 48 | Springt einmal zur vordersten eigenen Formation. | Jumps once to your foremost formation. |
| `tip.cam.realm` |  | 58 | Springt an den linken Rand der Spielwelt, zu deinem Reich. | Jumps to the left end of the world, to your realm. |
| `tip.cancel.body` |  | 35 | Schließt das Fenster ohne Änderung. | Closes this window without changes. |
| `tip.click.body` |  | 151 | Erzeugt Material. Ab Stufe {mid} presst die Automatik mit (3 Klicks/s, ab Stufe {late} 6). Es zählt das Höhere aus Automatik und Klicks, höchstens {max} Klicks/s. | Produces material. From level {mid} the press runs itself (3 clicks/s, 6 from level {late}). The higher of automation and clicks counts, at most {max} clicks/s. |
| `tip.confirmDemolish.body` |  | 38 | Reißt das Gebäude ab und erstattet {refund}. | Demolishes the building and refunds {refund}. |
| `tip.cost` |  | 6 | Kosten | Cost |
| `tip.demolish.body` |  | 57 | Öffnet die Bestätigung. Ohne Bestätigung passiert nichts. | Opens a confirmation. Nothing happens without it. |
| `tip.draft.art` |  | 11 | Synergieart | Synergy kind |
| `tip.draft.ban` |  | 96 | Entfernt die Karte für diese Partie aus dem Pool; an ihre Stelle tritt eine neue. Noch {n} Banne. | Removes the card from the pool for this game; a new one takes its place. {n} bans left. |
| `tip.draft.category` |  | 7 | Bereich | Area |
| `tip.draft.choose` |  | 57 | Klicken wählt diese Karte. Danach läuft das Spiel weiter. | Click to choose this card. The game then continues. |
| `tip.draft.kat` |  | 9 | Kategorie | Category |
| `tip.draft.limit` |  | 5 | Stufe | Tier |
| `tip.draft.next` |  | 13 | Nächste Stufe | Next tier |
| `tip.draft.rarity` |  | 10 | Seltenheit | Rarity |
| `tip.draft.reroll` |  | 65 | Zieht alle Optionen dieser Wahl neu. Noch {n} Mal bei dieser Wahl. | Redraws all options of this choice. {n} more times for this choice. |
| `tip.draft.synergy` |  | 14 | Synergie jetzt | Synergy now |
| `tip.fluegel.body` |  | 91 | Jede Stufe ab Rathaus bringt einen Flügel. Jeder Flügel nur einmal, die Wahl ist endgültig. | Each level from town hall brings a wing. Each wing once only; the choice is final. |
| `tip.grid.empty` |  | 16 | Freier Bauplatz. | Free plot. |
| `tip.haus.ausbau` |  | 87 | Baut das Haupthaus zum {name} aus: {effect}. Dauer {s} s; danach wählst du einen Flügel. | Expands the main hall into a {name}: {effect}. Takes {s} s; afterwards you choose a wing. |
| `tip.haus.ausbau.body` |  | 54 | Baut das Haupthaus aus. Danach wählst du einen Flügel. | Expands the main hall. Afterwards you choose a wing. |
| `tip.hintOk.body` |  | 105 | Schließt den Hinweis. Er erscheint nicht wieder, bis du die Hinweise auf dem Startbildschirm zurücksetzt. | Closes the hint. It will not return unless you reset hints on the start screen. |
| `tip.hud.army` |  | 54 | Zustand der eigenen Armee: Marsch, Kampf oder Sammeln. | State of your army: marching, fighting or regrouping. |
| `tip.hud.draft` |  | 88 | Eine Kartenwahl wartet; das Spiel ist bis zur Wahl angehalten. Öffnet den Reiter Karten. | A card choice is waiting; the game is paused until you choose. Opens the Cards tab. |
| `tip.hud.draft.karten` | karten | 59 | Eine Kartenwahl wartet. Die Karten liegen in der Bildmitte. | A card choice is waiting. The cards lie in the middle of the screen. |
| `tip.hud.material` |  | 62 | Bestand und Ertrag je Sekunde aus Fabriken, Presse und Klicks. | Stock and income per second from factories, press and clicks. |
| `tip.hud.material.karten` | karten | 66 | Bestand und Ertrag je Sekunde aus Manufakturen, Presse und Klicks. | Stock and income per second from manufactories, press and clicks. |
| `tip.hud.soldiers` |  | 70 | Eigene Einheiten auf dem Feld / Versorgungslimit (Einheiten je Welle). | Own units on the field / supply cap (units per wave). |
| `tip.hud.time` |  | 31 | Spielzeit und Stufe der Partie. | Game time and level. |
| `tip.hud.walls` |  | 73 | Lebenspunkte der drei Abschnitte. Fällt das Tor, ist die Partie verloren. | Health of the three sections. If the gate falls, the game is lost. |
| `tip.hud.waves` |  | 72 | Blau: nächste eigene Welle. Rot: nächste gegnerische Welle, alle {s} s. | Blue: next own wave. Red: next enemy wave, every {s} s. |
| `tip.hud.xp` |  | 88 | Erfahrungspunkte aus Abschüssen und weiteren Quellen. Jede Stufe bringt eine Kartenwahl. | Experience points from takedowns and other sources. Every level brings a card choice. |
| `tip.hud.xp.karten` | karten | 91 | EP aus Abschüssen, Basisschaden, Wellen und Budget. Zwischen zwei Wahlen mindestens {s} s. | XP from takedowns, base damage, waves and budget. At least {s} s between two choices. |
| `tip.hud.xpCap` |  | 46 | Wartet eine Stufe, verfallen überschüssige EP. | While a level waits, surplus XP is lost. |
| `tip.hud.xpLost` |  | 13 | Verfallene EP | Lost XP |
| `tip.hud.xpRate` |  | 13 | EP je Sekunde | XP per second |
| `tip.hud.xpTotal` |  | 9 | EP gesamt | Total XP |
| `tip.kaserne.build` |  | 106 | Wählt den ersten freien Bauplatz und hebt dort die Kaserne hervor. Gebaut wird erst mit dem zweiten Klick. | Selects the first free plot and highlights the barracks there. The second click builds it. |
| `tip.kat.counts` |  | 173 | Jede Karte und jede weitere Stufe zählt einmal für ihre Kategorie, eine Doktrin {d}-mal, eine Brücke für beide. Ab {lead} Karten Vorsprung erscheint die Kategorie doppelt so oft. | Each card and each further tier counts once for its category, a doctrine {d} times, a bridge for both. With a lead of {lead} cards the category appears twice as often. |
| `tip.kat.lead` |  | 5 | führt | leads |
| `tip.kompanie` |  | 142 | Wirbt eine Söldnerkompanie an: {l} Läufer und {w} Werfer rücken sofort aus, ohne Versorgung. Danach {s} s Pause; jede weitere kostet {p} % mehr. | Hires a mercenary company: {l} runners and {w} throwers march out at once, no supply. Then a {s} s pause; each further company costs {p}% more. |
| `tip.kp.deck` |  | 110 | Der Stapel füllt sich mit Erfahrung; ist er voll, steht eine Wahl an. Ein Klick öffnet die eingeklappte Bühne. | The deck fills with experience; when full, a choice is due. A click opens the folded stage. |
| `tip.kp.later` |  | 103 | Klappt die Bühne ein. Die Wahl bleibt offen, das Spiel angehalten; ein Klick auf den Stapel öffnet sie. | Folds the stage. The choice stays open and the game paused; click the deck to reopen it. |
| `tip.lang.body` |  | 63 | Sprache für Oberfläche und Meldungen. Wechsel nur hier möglich. | Language for interface and messages. Can only be changed here. |
| `tip.level` |  | 5 | Stufe | Level |
| `tip.m.baseHp` |  | 12 | Lebenspunkte | Health |
| `tip.m.baseMax` |  | 21 | Max. Lebenspunkte Tor | Max. gate health |
| `tip.m.budget` |  | 16 | Forschungsbudget | Research budget |
| `tip.m.interest` |  | 24 | Zinsdeckel je Auszahlung | Interest cap per payout |
| `tip.m.matRate` |  | 10 | Material/s | Material/s |
| `tip.m.perClick` |  | 18 | Material pro Klick | Material per click |
| `tip.m.queueMax` |  | 16 | Versorgungslimit | Supply cap |
| `tip.m.range` |  | 10 | Reichweite | Range |
| `tip.m.regen` |  | 17 | Regeneration LP/s | Regeneration HP/s |
| `tip.m.role` |  | 5 | Rolle | Role |
| `tip.m.strength` |  | 21 | Stärke durch Schmiede | Strength from smithy |
| `tip.m.thorns` |  | 14 | Stachelschaden | Spike damage |
| `tip.m.turretDmg` |  | 11 | Turmschaden | Tower damage |
| `tip.m.turretRange` |  | 14 | Turmreichweite | Tower range |
| `tip.m.turretRate` |  | 18 | Schüsse pro Minute | Shots per minute |
| `tip.m.unitDmg` |  | 7 | Schaden | Damage |
| `tip.m.unitHp` |  | 12 | Lebenspunkte | Health |
| `tip.maxed` |  | 20 | Höchststufe erreicht | Maximum level reached |
| `tip.menu.lang` |  | 39 | Wechselt zwischen Deutsch und Englisch. | Switches between German and English. |
| `tip.menu.pause` |  | 39 | Hält die Partie an oder setzt sie fort. | Pauses or resumes the game. |
| `tip.menu.resume` |  | 89 | Die Partie ist pausiert (verdeckter Tab oder geladener Spielstand). Klick setzt sie fort. | The game is paused (hidden tab or loaded save). Click to continue. |
| `tip.menu.session` |  | 63 | Debug-Modus: lädt das Sitzungsprotokoll dieser Partie herunter. | Debug mode: downloads the session log of this game. |
| `tip.menu.tutorial` |  | 79 | Beendet die Anleitung sofort. Die Partie läuft weiter, die Schonfrist entfällt. | Ends the guide at once. The game carries on, the grace period ends. |
| `tip.missing` |  | 9 | Fehlt: {n} | Missing: {n} |
| `tip.needsBuilding` |  | 20 | Benötigt: {name} | Requires: {name} |
| `tip.needsTower` |  | 23 | Erst den Turm errichten | Build the tower first |
| `tip.new.body` |  | 57 | Öffnet den Startbildschirm mit Sprache und Schwierigkeit. | Opens the start screen with language and difficulty. |
| `tip.noSupply` |  | 75 | Das Versorgungslimit steht am Deckel von {n}. Mehr Versorgung bringt nichts. | The supply limit is at its cap of {n}. More supply adds nothing. |
| `tip.notRunning` |  | 21 | Keine laufende Partie | No game in progress |
| `tip.pick.body` |  | 34 | {desc} Wird auf Bauplatz {n} errichtet. | {desc} Built on plot {n}. |
| `tip.refund` |  | 10 | Erstattung | Refund |
| `tip.repair.gate` |  | 65 | Repariert das Tor sofort. Fällt das Tor, ist die Partie verloren. | Repairs the gate instantly. If the gate falls, the game is lost. |
| `tip.repair.wall` |  | 105 | Repariert diesen Mauerabschnitt sofort. Eine gefallene Mauer steht danach wieder, ihr Turm feuert wieder. | Repairs this wall section instantly. A fallen wall stands again and its tower resumes fire. |
| `tip.repairCd` |  | 24 | Wieder möglich in {s} s | Available again in {s} s |
| `tip.research.after` |  | 6 | Danach | Then |
| `tip.research.before` |  | 5 | Jetzt | Now |
| `tip.research.rush` |  | 106 | Schließt „{name}“ sofort ab. Der Preis richtet sich nach der restlichen Zeit und steigt mit der Stufe. | Completes “{name}” at once. The price depends on the remaining time and rises with the tier. |
| `tip.resetHints.body` |  | 71 | Die Hinweise beim ersten Kontakt mit neuen Elementen erscheinen erneut. | The hints shown on first contact with new elements appear again. |
| `tip.scroll.body` |  | 84 | Verschiebt den Ausschnitt der Spielwelt; die Welt ist doppelt so breit wie das Bild. | Moves the view across the world; the world is twice as wide as the view. |
| `tip.scroll.title` |  | 12 | Scrollleiste | Scrollbar |
| `tip.skipIntro.body` |  | 87 | Ohne Einführung sind alle Elemente von Beginn an sichtbar. Gilt ab der nächsten Partie. | Without the introduction, all elements are visible from the start. Applies from the next game. |
| `tip.start.body` |  | 57 | Startet eine neue Partie mit den gewählten Einstellungen. | Starts a new game with the chosen settings. |
| `tip.stufenname` |  | 7 | Bauwerk | Structure |
| `tip.stufenname.next` |  | 19 | {a} → {b} ab Stufe {n} | {a} → {b} from level {n} |
| `tip.supplyFull` |  | 21 | Versorgung voll: {n}/{max} | Supply full: {n}/{max} |
| `tip.tab.army` |  | 67 | Einheiten in die Warteschlange stellen, Wellenvorschau, Ereignisse. | Queue units, wave preview, events. |
| `tip.tab.build` |  | 46 | Bauplätze im Reich: bauen, ausbauen, abreißen. | Plots in your realm: build, upgrade, demolish. |
| `tip.tab.cards` |  | 49 | Offene Kartenwahl und gewählte Karten mit Stufen. | Open card choice and chosen cards with tiers. |
| `tip.tab.haus` |  | 103 | Das Haupthaus in der Mitte deines Reichs: seine Stufe bestimmt, wie viele Manufakturen du bauen darfst. | The main hall at the centre of your realm: its level sets how many manufactories you may build. |
| `tip.tab.smithy` |  | 48 | Qualitätsstufen der Schmiede für alle Einheiten. | Smithy quality levels for all units. |
| `tip.tab.uni` |  | 57 | Universität: Forschung und eine zusätzliche Kartenoption. | University: research and one extra card option. |
| `tip.tab.wall` |  | 46 | Mauer, Tor und Türme: reparieren und ausbauen. | Wall, gate and towers: repair and upgrade. |
| `tip.towerCap` |  | 66 | Gesperrt durch die Doktrin {name}: Türme bleiben auf Stufe {n}. | Locked by the doctrine {name}: towers stay at level {n}. |
| `tip.trade.body` |  | 140 | {a} Material ergeben {b} EP, {c} EP ergeben {d} Material. Getauschte EP fehlen bis zur nächsten Wahl, sinken aber nie unter die erreichte Stufe. | {a} material give {b} XP, {c} XP give {d} material. Swapped XP delay the next choice but never drop below the level reached. |
| `tip.tutorial.switch.body` |  | 69 | Schaltet die geführten ersten Schritte für diese Partie ein oder aus. | Turns the guided first steps on or off for this game. |
| `tip.unit.body` |  | 147 | Wird sofort bezahlt und rückt mit der nächsten Welle aus, verteilt auf die drei Lanes. Höchstens {max} Einheiten je Welle (Versorgungslimit). Taste {k}. | Paid at once; marches out with the next wave, spread over the three lanes. At most {max} units per wave (supply cap). Key {k}. |
| `tip.variant.dur` |  | 23 | Dauer, das Gebäude ruht | Duration, the building rests |
| `tip.variant.kat` |  | 9 | Kategorie | Category |
| `tip.wave.rush` |  | 100 | Die Warteschlange rückt sofort als Welle aus, der Wellentakt beginnt neu. Danach {s} s Abklingzeit. | The queue marches out at once as a wave and the wave timer restarts. Then {s} s cooldown. |
| `tip.wave.rushEmpty` |  | 37 | Keine Einheiten in der Warteschlange. | No units in the queue. |
| `tip.weiter.many` |  | 39 | Ersetzt {n} Varianten (ohne Erstattung). | Replaces {n} variants (no refund). |
| `tip.weiter.none` |  | 23 | Ersetzt keine Variante. | Replaces no variant. |
| `tip.weiter.one` |  | 37 | Ersetzt 1 Variante (ohne Erstattung). | Replaces 1 variant (no refund). |
| `tip.world.body` |  | 123 | Klicke eine Parzelle, um zu bauen, oder die Mauer für Reparatur und Türme. Scrollen: Mausrad, Ziehen, Pfeiltasten oder A/D. | Click a plot to build, or the wall for repairs and towers. Scroll: mouse wheel, drag, arrow keys or A/D. |
| `tip.world.title` |  | 9 | Spielwelt | World |
| `tip.zeughausMax` |  | 44 | Ohne Schmiede höchstens Stufe {n} (Zeughaus). | Without a smithy at most level {n} (armoury). |

## Hinweise

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `hint.buildings` |  | 80 | Neu: Schmiede, Kaserne, Universität und Kontor. Klicke einen freien Bauplatz an. | New: smithy, barracks, university and trading house. Click a free plot. |
| `hint.buildings.karten` | karten | 80 | Neu: Schmiede, Kaserne, Universität und Kontor. Klicke einen freien Bauplatz an. | New: smithy, barracks, university and trading post. Click a free plot. |
| `hint.demolish` |  | 70 | Abriss erstattet die Hälfte des Preises. Upgrades bleiben gespeichert. | Demolishing refunds half the price. Upgrades are kept. |
| `hint.disc.done` |  | 29 | Forschung fertig: {name}. | Research done: {name}. |
| `hint.disc.new` |  | 16 | Neu: {name}. | New: {name}. |
| `hint.kontor` |  | 63 | Das Kontor zahlt Zinsen auf dein Material, bis zu einem Deckel. | The trading house pays interest on your material, up to a cap. |
| `hint.kontor.karten` | karten | 63 | Das Kontor zahlt Zinsen auf dein Material, bis zu einem Deckel. | The trading post pays interest on your material, up to a cap. |
| `hint.neighbors` |  | 72 | Nachbarn zählen: Manche Gebäude wirken stärker neben bestimmten anderen. | Neighbours count: some buildings work better next to certain others. |
| `hint.ok` |  | 10 | Verstanden | Got it |
| `hint.research` |  | 69 | Die Universität forscht: Material und Zeit gegen dauerhafte Vorteile. | The university researches: material and time for permanent advantages. |
| `hint.research.karten` | karten | 90 | Die Universität forscht und wandelt auf Wunsch Materialertrag in EP um (Forschungsbudget). | The university researches and can turn material income into XP (research budget). |
| `hint.siege` |  | 63 | In einer Minute greift eine {x}-fach starke Belagerungswelle an. | In one minute a siege wave of {x}× strength attacks. |
| `hint.smithy` |  | 74 | Die Schmiede stärkt alle Einheiten. Jede Stufe kostet mehr als die vorige. | The smithy strengthens all units. Each level costs more than the last. |
| `hint.title` |  | 7 | Hinweis | Hint |
| `hint.tower` |  | 74 | Türme schießen auf Gegner an der Mauer. Jeder Turm wird einzeln ausgebaut. | Towers shoot at enemies at the wall. Each tower is upgraded on its own. |
| `hint.variante` |  | 77 | Neu: Ein Gebäude lässt sich einmal zu einer Variante aufwerten. Klicke es an. | New: a building can be converted once into a variant. Click it. |
| `hint.wall` |  | 80 | Mauer und Tor halten den Gegner auf. Reparatur und Ausbau: Reiter Mauer & Türme. | Wall and gate hold the enemy off. Repair and upgrades: Wall & towers tab. |

## Tutorial

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `tut.ausruecken.narr` |  | 81 | Deine Einheiten rücken mit der nächsten Welle aus und treffen auf die Gegenseite. | Your units move out with the next wave and meet the other side. |
| `tut.ausruecken.task` |  | 27 | Sieh zu, wie sie ausrücken. | Watch them move out. |
| `tut.bauen.narr` |  | 77 | Deine Hände werden müde. Eine Fabrik fertigt weiter, während du anderes tust. | Your hands will tire. A factory keeps producing while you do other things. |
| `tut.bauen.narr.karten` | karten | 81 | Deine Hände werden müde. Eine Manufaktur fertigt weiter, während du anderes tust. | Your hands will tire. A manufactory keeps producing while you do other things. |
| `tut.bauen.task` |  | 17 | Baue eine Fabrik. | Build a factory. |
| `tut.bauen.task.karten` | karten | 21 | Baue eine Manufaktur. | Build a manufactory. |
| `tut.bye1` |  | 79 | Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden. | Walls, towers, smithy, university – much is waiting to be discovered. |
| `tut.bye1.karten` | karten | 86 | Mauer, Türme, Schmiede, Universität – alles steht bereit. Deine Karten weisen den Weg. | Walls, towers, smithy, university – everything is ready. Your cards show the way. |
| `tut.bye2` |  | 56 | Was neu ist, ist markiert. Bewahre das Tor, Statthalter. | Whatever is new is marked. Look after the gate, governor. |
| `tut.fertigen.narr` |  | 56 | Ohne Material entsteht nichts. Fang mit eigener Hand an. | Without material, nothing gets built. Start with your own hands. |
| `tut.fertigen.task` |  | 20 | Klicke auf Fertigen. | Click Produce. |
| `tut.greet1` |  | 54 | Willkommen, Statthalter. Ich bin dein Quartiermeister. | Welcome, governor. I am your quartermaster. |
| `tut.greet2` |  | 63 | Aus dem Osten nähern sich Wellen. Unser Tor liegt in ihrem Weg. | Waves are approaching from the east. Our gate lies in their path. |
| `tut.karte.narr` |  | 63 | Die erste Welle ist bestanden. Aus jeder Lage lernen wir etwas. | The first wave is behind us. We learn something from every situation. |
| `tut.karte.task` |  | 43 | Wähle eine Karte. Sie verändert dein Reich. | Choose a card. It will change your realm. |
| `tut.more` |  | 25 | Klicken, um weiterzulesen | Click to read on |
| `tut.name` |  | 15 | Quartiermeister | Quartermaster |
| `tut.rekrutieren.narr` |  | 57 | Material allein trägt nicht weit. Wir brauchen Einheiten. | Material alone won't carry us far. We need units. |
| `tut.rekrutieren.task` |  | 23 | Stelle drei Läufer auf. | Raise three runners. |
| `tut.skip` |  | 12 | Überspringen | Skip |
| `tut.xpBounty` |  | 13 | +{n} Erfahrung | +{n} experience |

## Ereignisprotokoll

| Schlüssel | Modus | Zeichen | Deutsch | Englisch |
|---|---|---|---|---|
| `log.alarm` |  | 52 | Notaufgebot: Der Gegner wirft Reserven an die Front. | Last stand: the enemy throws its reserves into the fight. |
| `log.built` |  | 37 | {building} auf Bauplatz {slot} errichtet. | {building} built on plot {slot}. |
| `log.demolished` |  | 52 | {building} auf Bauplatz {slot} abgerissen, +{amount} Material. | {building} on plot {slot} demolished, +{amount} material. |
| `log.draft` |  | 31 | Gewählt: {name} (Stufe {tier}). | Chosen: {name} (tier {tier}). |
| `log.emergency` |  | 38 | Notreserve: Tor vollständig repariert. | Emergency reserve: gate fully repaired. |
| `log.firstWave` |  | 82 | Erste gegnerische Welle rückt aus. Die Vorschau am rechten Rand zeigt die nächste. | The first enemy wave advances. The preview on the right shows the next one. |
| `log.fluegel` |  | 26 | Flügel gewählt: {name} | Wing chosen: {name} |
| `log.hausDone` |  | 31 | Haupthaus ausgebaut: {name} | Main hall expanded: {name} |
| `log.hausStart` |  | 27 | Ausbau begonnen: {name} | Expansion started: {name} |
| `log.kompanie` |  | 40 | Söldnerkompanie rückt aus ({n} Einheiten) | Mercenary company marches out ({n} units) |
| `log.levelUp` |  | 18 | Stufe {n} erreicht. | Level {n} reached. |
| `log.lost` |  | 22 | Dein Tor ist gefallen. | Your gate has fallen. |
| `log.midRefill` |  | 69 | Die Mitte ist gefallen: Einheiten der äußeren Lanes besetzen sie neu. | The centre has fallen: units from the outer lanes take it over. |
| `log.newOption` |  | 24 | Neue Option: {name}. | New option: {name}. |
| `log.newTowerOption` |  | 34 | Neue Option: {name} (Turm {lane}). | New option: {name} ({lane} tower). |
| `log.research` |  | 33 | Erforscht: {name} (Stufe {tier}). | Researched: {name} (tier {tier}). |
| `log.siege` |  | 77 | Die Belagerungswelle greift an. Ab jetzt wird der Gegner jede Minute stärker. | The siege wave attacks. From now on the enemy grows stronger every minute. |
| `log.siegeWarning` |  | 76 | Belagerungswelle angekündigt: in {s} s greift eine {n}-fach starke Welle an. | Siege wave announced: in {s} s a wave of {n}× strength attacks. |
| `log.start` |  | 47 | Partie gestartet: {diff}. Die Front ist noch ruhig. | Game started: {diff}. The front is still quiet. |
| `log.turret` |  | 18 | Turm {lane} errichtet. | Tower ({lane}) built. |
| `log.unlocked` |  | 26 | {building} freigeschaltet. | {building} unlocked. |
| `log.unlockedKey` |  | 26 | {what} freigeschaltet. | {what} unlocked. |
| `log.variantDone` |  | 35 | {name} auf Platz {slot} ist fertig. | {name} on plot {slot} is ready. |
| `log.variantStart` |  | 55 | {building} auf Platz {slot} wird zu {name} aufgewertet. | {building} on plot {slot} is being converted to {name}. |
| `log.wallDown` |  | 57 | Mauer {lane} gefallen. Die Gegner dieser Lane ziehen zum Tor. | The {lane} wall has fallen. Enemies in that lane move on to the gate. |
| `log.weiter` |  | 78 | {building}: Weiterentwicklung {name} abgeschlossen ({n} Varianten ersetzt). | {building}: advancement {name} complete ({n} variants replaced). |
| `log.won` |  | 27 | Gegnerische Basis zerstört. | Enemy base destroyed. |

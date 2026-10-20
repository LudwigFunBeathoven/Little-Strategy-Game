# Klammerfront – alle Texte des Spiels

Stand: Branch `exp/kartenpfad`, v0.9.2-kartenpfad-7. Quelle: `i18n/de.js` und `i18n/en.js` (996 Schlüssel, in beiden Sprachen identisch).

Lesehilfe:
- **Schlüssel** ist der Name im Code. Platzhalter in geschweiften Klammern (`{n}`, `{name}`) füllt das Spiel zur Laufzeit.
- Spalte **Modus**: „karten“ = Text ersetzt im Modus karten (Kartenpfad) den gleichnamigen Schlüssel ohne Suffix; „nur standard“ = Karte, Forschung oder Ausbau entfällt im Modus karten; leer = beide Modi.
- Zeilenumbrüche im Text erscheinen als `<br>`.

## Inhalt
1. [Allgemein und Zahlen](#allgemein-und-zahlen) (35)
2. [Start, Schwierigkeit, Ergebnis](#start-schwierigkeit-ergebnis) (29)
3. [Ressourcenleiste und Kopfzeilen](#ressourcenleiste-und-kopfzeilen) (40)
4. [Reiter und Arbeitsbereich](#reiter-und-arbeitsbereich) (54)
5. [Gebäude](#gebäude) (38)
6. [Haupthaus und Flügel (Teil 7)](#haupthaus-und-flügel-teil-7) (32)
7. [Einheiten und Armee](#einheiten-und-armee) (30)
8. [Ausbauten (Upgrades)](#ausbauten-upgrades) (25)
9. [Forschung und Budget](#forschung-und-budget) (55)
10. [Spezialkarten (Kartenwahl)](#spezialkarten-kartenwahl) (158)
11. [Kartenpfad: Pfadkarten, Wirkungszeilen, Pfadforschung](#kartenpfad-pfadkarten-wirkungszeilen-pfadforschung) (169)
12. [Gebäude-Varianten](#gebäude-varianten) (48)
13. [Doktrinen, Kategorien, Handel](#doktrinen-kategorien-handel) (41)
14. [Erklärzeilen der Knöpfe](#erklärzeilen-der-knöpfe) (60)
15. [Tooltips](#tooltips) (117)
16. [Hinweise](#hinweise) (17)
17. [Tutorial](#tutorial) (21)
18. [Ereignisprotokoll](#ereignisprotokoll) (27)

## Allgemein und Zahlen

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `btn.click` |  | Fertigen | Produce |
| `cam.follow` |  | Front folgen | Follow front |
| `cam.front` |  | Front | Front |
| `cam.realm` |  | Reich | Realm |
| `cost.free` |  | gratis | free |
| `cost.material` |  | {n} Material | {n} material |
| `cost.xp` |  | {n} EP | {n} XP |
| `ctx.building` |  | {name} · Bauplatz {n} | {name} · plot {n} |
| `foot.save` |  | Spielstand wird automatisch im Browser gespeichert. | Progress is saved automatically in your browser. |
| `foot.version` |  | Prototyp v{v} | Prototype v{v} |
| `fx.fabrik` |  | +{rate} Material/s | +{rate} material/s |
| `fx.haupthaus` |  | Höchstens {n} Manufakturen | At most {n} manufactories |
| `fx.kaserne` |  | Stufe {n}, Versorgung +{m} | Level {n}, supply +{m} |
| `fx.kontor` |  | +{amount} je {n} Material alle {s} s, höchstens {cap} | +{amount} per {n} material every {s} s, at most {cap} |
| `fx.schmiede` |  | Qualitätsstufe {n} | Quality grade {n} |
| `fx.universitaet` |  | {n} Karten je Stufenaufstieg | {n} cards per level-up |
| `lang.de` |  | Deutsch | Deutsch |
| `lang.en` |  | English | English |
| `mark.new` |  | neu | new |
| `menu.lang` |  | Sprache | Language |
| `menu.pause` |  | Pause | Pause |
| `menu.resume` |  | Weiter | Resume |
| `menu.session` |  | Protokoll | Log |
| `menu.tutorial` |  | Tutorial überspringen | Skip tutorial |
| `meta.locale` |  | de-DE | en-US |
| `num.billion` |  | {n} Mrd. | {n}B |
| `num.million` |  | {n} Mio. | {n}M |
| `num.thousand` |  | {n} Tsd. | {n}k |
| `opt.max` |  | Maximum | Maximum |
| `opt.noSupply` |  | Versorgungslimit am Maximum | Supply limit at maximum |
| `opt.towerCap` |  | Gesperrt durch die Doktrin Freihandel | Locked by the doctrine Free trade |
| `preview.enemy` |  | Gegner | Enemy |
| `preview.own` |  | Du | You |
| `time.hm` |  | {h} h {m} min | {h} h {m} min |
| `time.m` |  | {m} min | {m} min |

## Start, Schwierigkeit, Ergebnis

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `diff.leicht.desc` |  | Langsamere Wellen, schwächere Gegner. Zum Kennenlernen. | Slower waves, weaker enemies. To learn the ropes. |
| `diff.leicht.name` |  | Leicht | Easy |
| `diff.normal.desc` |  | Der vorgesehene Schwierigkeitsgrad. | The intended difficulty. |
| `diff.normal.name` |  | Normal | Normal |
| `diff.schwer.desc` |  | Dichte Wellen und zähe Gegner. Verlangt eine saubere Bauordnung. | Dense waves and tough enemies. Demands a clean build order. |
| `diff.schwer.name` |  | Schwer | Hard |
| `result.again` |  | Neue Partie | New game |
| `result.lost.eyebrow` |  | Niederlage · {diff} · {time} | Defeat · {diff} · {time} |
| `result.lost.text` |  | {kills} Abschüsse vor dem Fall. Früher Fabriken bauen, einen Turm errichten oder mit Leicht beginnen. | {kills} kills before the fall. Build factories earlier, put up a tower or start on Easy. |
| `result.lost.text.karten` | karten | {kills} Abschüsse vor dem Fall. Früher Manufakturen bauen, einen Turm errichten oder mit Leicht beginnen. | {kills} kills before the fall. Build manufactories earlier, put up a tower or start on Easy. |
| `result.lost.title` |  | Tor gefallen | Gate fallen |
| `result.record` |  | Neue Bestzeit. | New best time. |
| `result.won.eyebrow` |  | Sieg · {diff} · {time} | Victory · {diff} · {time} |
| `result.won.text` |  | {kills} Abschüsse, {material} Material gefertigt. | {kills} kills, {material} material produced. |
| `result.won.title` |  | Front durchbrochen | Front broken |
| `start.back` |  | Zurück zur Partie | Back to game |
| `start.difficulty` |  | Schwierigkeit | Difficulty |
| `start.discard` |  | Die laufende Partie wird dabei verworfen. | The current game will be discarded. |
| `start.eyebrow` |  | Neue Partie | New game |
| `start.go` |  | Partie beginnen | Begin game |
| `start.hints` |  | Hinweise | Hints |
| `start.language` |  | Sprache | Language |
| `start.oldSave` |  | Dein Spielstand stammt aus einer älteren Version und kann nicht fortgesetzt werden. | Your saved game is from an older version and cannot be continued. |
| `start.recommended` |  | empfohlen für den Einstieg | recommended for beginners |
| `start.record` |  | Bestzeit {time} | Best {time} |
| `start.resetHints` |  | Hinweise zurücksetzen | Reset hints |
| `start.skipIntro` |  | Einführung überspringen | Skip introduction |
| `start.title` |  | Einstellungen | Settings |
| `start.tutorial` |  | Tutorial | Tutorial |

## Ressourcenleiste und Kopfzeilen

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `front.field` |  | Im Feld | In field |
| `front.losses` |  | Verluste | Losses |
| `front.supply` |  | Versorgung | Supply |
| `hdr.clock` |  | Spielzeit | Time |
| `hdr.kills` |  | Abschüsse | Kills |
| `hdr.level` |  | Stufe {n} · {phase} | Level {n} · {phase} |
| `hdr.newGame` |  | Neue Partie | New game |
| `hud.army` |  | Armee | Army |
| `hud.budget` |  | Forschung {n} % | Research {n}% |
| `hud.draft` |  | Kartenwahl offen | Card choice open |
| `hud.fallen` |  | gefallen | fallen |
| `hud.gates` |  | Tor | gate |
| `hud.held` |  | – | – |
| `hud.material` |  | Material | Material |
| `hud.perClick` |  | {n}/Klick | {n}/click |
| `hud.perSecond` |  | {n}/s | {n}/s |
| `hud.rateInterest` |  | {rate} · Zinsen +{n}/{cap} in {s} s | {rate} · interest +{n}/{cap} in {s} s |
| `hud.soldiers` |  | Soldaten | Soldiers |
| `hud.toLevel` |  | Stufe {n}: {cur} / {need} | Level {n}: {cur} / {need} |
| `hud.wall0s` |  | oben | top |
| `hud.wall2s` |  | unten | bottom |
| `hud.walls` |  | Mauer | Wall |
| `hud.waves` |  | Wellen | Waves |
| `hud.xp` |  | EP | XP |
| `hud.xpEta` |  | {n}/s · Karte in {s} | {n}/s · card in {s} |
| `lane.0` |  | oben | top |
| `lane.1` |  | Mitte | middle |
| `lane.2` |  | unten | bottom |
| `lane.aria` |  | Schlachtfeld mit drei Lanes: links deine Basis mit Mauer oben, Tor und Mauer unten, rechts die gegnerische Basis | Battlefield with three lanes: your base with top wall, gate and bottom wall on the left, the enemy base on the right |
| `lane.enemy` |  | GEGNER | ENEMY |
| `lane.player` |  | DEINE BASIS | YOUR BASE |
| `level.none` |  | Noch keine Wahl. | Nothing chosen yet. |
| `level.progress` |  | Bis Stufe {n} | To level {n} |
| `level.uniOff` |  | Ohne Universität: {n} Karten je Stufenaufstieg. | Without university: {n} cards per level-up. |
| `level.uniOn` |  | Mit Universität: {n} Karten je Stufenaufstieg. | With university: {n} cards per level-up. |
| `phase.early` |  | Früh | Early |
| `phase.late` |  | Spät | Late |
| `phase.mid` |  | Mitte | Mid |
| `wave.rush` |  | Welle vorziehen | Send wave now |
| `wave.siege` |  | Belagerungswelle in {time} · {x}-fache Stärke | Siege wave in {time} · {x}× strength |

## Reiter und Arbeitsbereich

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `build.reason.fabrikGrenze.1` |  | Höchstens {n} Manufakturen, mehr mit Stadtrecht. | At most {n} manufactories, more with Town Charter. |
| `build.reason.fabrikGrenze.2` |  | Höchstens {n} Manufakturen, mehr mit Hofhaltung. | At most {n} manufactories, more with Court Household. |
| `build.reason.fabrikGrenze.3` |  | Höchstens {n} Manufakturen. | At most {n} manufactories. |
| `build.reason.fabrikGrenze.doktrin` |  | Die Doktrin {name} senkt die Grenze um {n}. | The doctrine {name} lowers the cap by {n}. |
| `build.reason.limit` |  | Gesperrt durch die Doktrin {name}: höchstens {n} Plätze für {types}. | Blocked by the doctrine {name}: at most {n} plots for {types}. |
| `build.reason.locked` |  | Nur per Spezialkarte freischaltbar | Unlocked through a special card only |
| `build.reason.standing` |  | Steht bereits | Already built |
| `build.reason.standing.karten` | karten | Steht bereits so oft, wie es erlaubt ist | Already standing as often as allowed |
| `demolish.confirm` |  | Abreißen | Demolish |
| `fab.stat` |  | Fabriken {n} · je {rate} Material/s · nächste {next} | Factories {n} · {rate} material/s each · next {next} |
| `fab.stat.grenze` |  | Manufakturen {n}/{max} · je {rate} Material/s · nächste {next} | Manufactories {n}/{max} · {rate} material/s each · next {next} |
| `fab.stat.karten` | karten | Manufakturen {n} · je {rate} Material/s · nächste {next} | Manufactories {n} · {rate} material/s each · next {next} |
| `grid.aria` |  | Bauplätze im Reich | Plots in your realm |
| `grid.cell` |  | Platz {n} | Plot {n} |
| `grid.free` |  | frei | free |
| `nb.cell` |  | Nachbarschaft: {total} | Neighbours: {total} |
| `nb.fabrik` |  | Fabrik neben Fabrik: {v} Ertrag je angrenzender Fabrik (höchstens {max}) | Factory next to factory: {v} output per adjacent factory (at most {max}) |
| `nb.fabrik.karten` | karten | Manufaktur neben Manufaktur: {v} Ertrag je angrenzender Manufaktur (höchstens {max}) | Manufactory next to manufactory: {v} output per adjacent manufactory (at most {max}) |
| `nb.gets` |  | Hier: {rule} – {n} Nachbar(n), zusammen {total} | Here: {rule} – {n} neighbour(s), {total} in total |
| `nb.getsNone` |  | Hier: kein Nachbarschaftsbonus ({rule}) | Here: no neighbour bonus ({rule}) |
| `nb.gives` |  | Gibt {name} auf Platz {slot}: {delta} | Gives {name} on plot {slot}: {delta} |
| `nb.kaserne` |  | Kaserne neben Schmiede: Versorgungslimit {v} | Barracks next to forge: supply limit {v} |
| `nb.kontor` |  | Handelskontor neben Fabrik: Zinsdeckel {v} je angrenzender Fabrik (höchstens {max}) | Trading post next to factory: interest cap {v} per adjacent factory (at most {max}) |
| `nb.kontor.karten` | karten | Handelskontor neben Manufaktur: Zinsdeckel {v} je angrenzender Manufaktur (höchstens {max}) | Trading post next to manufactory: interest cap {v} per adjacent manufactory (at most {max}) |
| `nb.pct` |  | {v} % | {v}% |
| `nb.schmiede` |  | Schmiede neben Kaserne: Einheitenkosten {v} | Forge next to barracks: unit cost {v} |
| `nb.title` |  | Nachbarschaft | Neighbours |
| `nb.universitaet` |  | Universität neben Fabrik: Forschungszeit {v} je angrenzender Fabrik (höchstens {max}) | University next to factory: research time {v} per adjacent factory (at most {max}) |
| `nb.universitaet.karten` | karten | Universität neben Manufaktur: Forschungszeit {v} je angrenzender Manufaktur (höchstens {max}) | University next to manufactory: research time {v} per adjacent manufactory (at most {max}) |
| `panel.build.hint` |  | Klicke einen Bauplatz im Reich an, um dort zu bauen. | Click a plot in your realm to build there. |
| `panel.levels` |  | Stufen & Spezialkarten | Levels & special cards |
| `panel.smithy.none` |  | nicht gebaut | not built |
| `panel.smithy.text` |  | Qualitätsstufe {n}. Jede Stufe stärkt alle Einheiten. | Quality level {n}. Every level strengthens all units. |
| `panel.smithy.zeughaus` |  | Ohne Schmiede: Das Zeughaus des Haupthauses erlaubt Qualitätsstufen bis {n}. | Without a smithy: the main hall's armoury allows quality levels up to {n}. |
| `repair.0` |  | Mauer oben reparieren | Repair top wall |
| `repair.1` |  | Tor reparieren | Repair gate |
| `repair.2` |  | Mauer unten reparieren | Repair bottom wall |
| `slot.cancel` |  | Abbrechen | Cancel |
| `slot.demolish` |  | Abreißen | Demolish |
| `slot.dialogText` |  | Fabriken sind mehrfach baubar, alle anderen Gebäude je einmal. | Factories can be built several times, every other building once. |
| `slot.dialogText.karten` | karten | Manufakturen sind bis zur Obergrenze des Haupthauses mehrfach baubar, Kaserne und Universität zweimal, Schmiede und Kontor je einmal. | Manufactories can be built several times up to the main hall's cap, barracks and university twice, smithy and trading post once each. |
| `slot.label` |  | Bauplatz {n} | Plot {n} |
| `sub.kaserne` |  | Kaserne | Barracks |
| `sub.mauer` |  | Mauer | Wall |
| `sub.repair` |  | Reparatur | Repair |
| `sub.turm_0` |  | Turm oben | Top tower |
| `sub.turm_2` |  | Turm unten | Bottom tower |
| `tab.army` |  | Armee | Army |
| `tab.build` |  | Bauen | Build |
| `tab.cards` |  | Karten | Cards |
| `tab.haus` |  | Haupthaus | Main hall |
| `tab.smithy` |  | Schmiede | Forge |
| `tab.uni` |  | Universität | University |
| `tab.wall` |  | Mauer & Türme | Wall & towers |

## Gebäude

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `bld.fabrik.desc` |  | Erzeugt Material. Mehrfach baubar; jede weitere Fabrik kostet mehr. | Produces material. Can be built several times; each further factory costs more. |
| `bld.fabrik.desc.karten` | karten | Erzeugt Material. Mehrfach baubar bis zur Obergrenze des Haupthauses; jede weitere Manufaktur kostet mehr. | Produces material. Can be built several times up to the main hall's cap; each further manufactory costs more. |
| `bld.fabrik.name` |  | Fabrik | Factory |
| `bld.fabrik.name.karten` | karten | Manufaktur | Manufactory |
| `bld.fabrik.name.weiter` |  | Fabrik | Factory |
| `bld.fabrik.name.weiter2` |  | Dampffabrik | Steam Factory |
| `bld.fabrik.nth` |  | Fabrik Nr. {n} | Factory no. {n} |
| `bld.fabrik.nth.karten` | karten | {name} Nr. {n} | {name} no. {n} |
| `bld.haupthaus.desc` |  | Sitz deiner Verwaltung. Steht fest in der Mitte, lässt sich nicht abreißen und hat keine Nachbarn. | Seat of your administration. Fixed in the centre, cannot be demolished and has no neighbours. |
| `bld.haupthaus.name` |  | Haupthaus | Main hall |
| `bld.kaserne.desc` |  | Hebt das Versorgungslimit. Ausbaubar bis Stufe 3. | Raises the supply cap. Expandable to level 3. |
| `bld.kaserne.desc.karten` | karten | Hebt das Versorgungslimit, ausbaubar mit Quartieren. Eine zweite Kaserne schickt je Welle einen Läufer mehr und hat eigene Quartiere. | Raises the supply cap, expandable with quarters. A second barracks sends one more runner per wave and has its own quarters. |
| `bld.kaserne.name` |  | Kaserne | Barracks |
| `bld.kontor.desc` |  | Zahlt Zinsen auf deinen Materialbestand, gedeckelt. | Pays capped interest on your material stock. |
| `bld.kontor.name` |  | Handelskontor | Trading house |
| `bld.kontor.name.karten` | karten | Handelskontor | Trading post |
| `bld.kontor.name.weiter` |  | Handelshaus | Trading House |
| `bld.schmiede.desc` |  | Qualitätsstufen für alle Einheiten, mit stark steigenden Kosten. | Quality grades for all units, at steeply rising cost. |
| `bld.schmiede.name` |  | Schmiede | Forge |
| `bld.schmiede.name.weiter` |  | Gießerei | Foundry |
| `bld.universitaet.desc` |  | Eine zusätzliche Wahl bei jedem Stufenaufstieg. | One extra choice at every level-up. |
| `bld.universitaet.desc.karten` | karten | Eine Karte mehr je Angebot und ein Forschungsplatz. Eine zweite Universität bringt einen weiteren Forschungsplatz. | One more card per offer and a research slot. A second university brings another research slot. |
| `bld.universitaet.name` |  | Universität | University |
| `bld.universitaet.name.weiter` |  | Akademie | Academy |
| `kaserne.build` |  | Kaserne bauen | Build barracks |
| `kaserne.status.built` |  | Kaserne Stufe {n} · Versorgungslimit {m} | Barracks level {n} · supply limit {m} |
| `kaserne.status.none` |  | Keine Kaserne gebaut: Das Versorgungslimit bleibt beim Grundwert. | No barracks built: the supply limit stays at its base value. |
| `kaserne.status.upgrading` |  | Die Kaserne wird aufgewertet und ruht, bis sie fertig ist. | The barracks is being converted and rests until it is ready. |
| `mauer.stufe.bastionsmauer` |  | Bastionsmauer | Bastion Wall |
| `mauer.stufe.palisade` |  | Palisade | Palisade |
| `mauer.stufe.ringmauer` |  | Ringmauer | Curtain Wall |
| `tower.where` |  | Turm {lane}: | Tower {lane}: |
| `turm.stufe.geschuetzturm` |  | Geschützturm | Gun Tower |
| `turm.stufe.wachturm` |  | Wachturm | Watchtower |
| `turm.stufe.wehrturm` |  | Wehrturm | Defence Tower |
| `turm.sub.0.name` |  | Turm oben: {name} | Top tower: {name} |
| `turm.sub.2.name` |  | Turm unten: {name} | Bottom tower: {name} |
| `wall.sub.name` |  | Mauer: {name} | Wall: {name} |

## Haupthaus und Flügel (Teil 7)

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `haus.ausbau` |  | Ausbau: {name} | Expand: {name} |
| `haus.ausbau.noCard` |  | Braucht die Karte {name}. | Needs the card {name}. |
| `haus.ausbau.running` |  | Ausbau läuft: {name} in {s} s | Expanding: {name} in {s} s |
| `haus.fluegel.allTaken` |  | Beide Flügel sind gewählt. | Both wings are chosen. |
| `haus.fluegel.bibliothek.desc` |  | Ein eigener Forschungsplatz, auch ohne Universität; Forschungen dauern dort {z} % länger. Technologiekarten erscheinen auch ohne Universität. Forschungsbudget bis {b} %. | A research slot of its own, even without a university; research there takes {z}% longer. Technology cards appear without a university. Research budget up to {b}%. |
| `haus.fluegel.bibliothek.eff` |  | Forschungsplatz ohne Universität | Research slot without university |
| `haus.fluegel.bibliothek.name` |  | Bibliothek | Library |
| `haus.fluegel.choose` |  | Wähle einen Flügel. Die Wahl ist endgültig. | Choose a wing. The choice is final. |
| `haus.fluegel.chosen` |  | Gewählt: {list} | Chosen: {list} |
| `haus.fluegel.kanzlei.desc` |  | Eine Karte mehr je Angebot, wie mit einer Universität; beide zusammen bringen nicht mehr. | One more card per offer, as with a university; both together bring no more. |
| `haus.fluegel.kanzlei.eff` |  | Eine Karte mehr je Angebot | One more card per offer |
| `haus.fluegel.kanzlei.name` |  | Kanzlei | Chancery |
| `haus.fluegel.noSlot` |  | Der nächste Flügel kommt mit der nächsten Stufe. | The next wing comes with the next level. |
| `haus.fluegel.schatzkammer.desc` |  | Zinsen auf deinen Materialbestand wie ein Kontor, mit {p} % von dessen Deckel. Steht ein Kontor, zahlt das Kontor den vollen Deckel. | Interest on your material stock like a trading post, with {p}% of its cap. If a trading post stands, it pays the full cap. |
| `haus.fluegel.schatzkammer.eff` |  | Zinsen ohne Kontor, Deckel {p} % | Interest without trading post, cap {p}% |
| `haus.fluegel.schatzkammer.name` |  | Schatzkammer | Treasury |
| `haus.fluegel.taken` |  | Schon gewählt. | Already chosen. |
| `haus.fluegel.title` |  | Flügel | Wings |
| `haus.fluegel.zeughaus.desc` |  | Qualitätsstufen bis Stufe {n} auch ohne Schmiede. Mit Schmiede gibt es alle Stufen. | Quality levels up to level {n} without a smithy. With a smithy all levels are available. |
| `haus.fluegel.zeughaus.eff` |  | Qualität bis Stufe {n} ohne Schmiede | Quality up to level {n} without smithy |
| `haus.fluegel.zeughaus.name` |  | Zeughaus | Armoury |
| `haus.grenze` |  | Obergrenze: {n} Manufakturen · stehen {m} | Cap: {n} manufactories · standing {m} |
| `haus.grenze.label` |  | Manufakturen | Manufactories |
| `haus.grenze.value` |  | {m} von höchstens {n} | {m} of at most {n} |
| `haus.stufe.1.desc` |  | Ein Gutshof verwaltet höchstens drei Manufakturen. Die Karte Stadtrecht macht ihn zum Rathaus. | A manor runs at most three manufactories. The card Town Charter turns it into a town hall. |
| `haus.stufe.1.name` |  | Gutshof | Manor |
| `haus.stufe.2.desc` |  | Das Rathaus verwaltet vier Manufakturen und hat einen Flügel. Die Karte Hofhaltung macht es zur Residenz. | The town hall runs four manufactories and has one wing. The card Court Household turns it into a residence. |
| `haus.stufe.2.eff` |  | höchstens 4 Manufakturen, ein Flügel | at most 4 manufactories, one wing |
| `haus.stufe.2.name` |  | Rathaus | Town Hall |
| `haus.stufe.3.desc` |  | Die Residenz verwaltet fünf Manufakturen und hat zwei Flügel. | The residence runs five manufactories and has two wings. |
| `haus.stufe.3.eff` |  | höchstens 5 Manufakturen, zweiter Flügel | at most 5 manufactories, second wing |
| `haus.stufe.3.name` |  | Residenz | Residence |

## Einheiten und Armee

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `army.fight` |  | Kampf | Fighting |
| `army.march` |  | Marsch | Marching |
| `army.none` |  | – | – |
| `army.paused` |  | Pause | Paused |
| `army.regroup` |  | Sammeln | Regrouping |
| `kompanie.count` |  | Angeworben | Hired |
| `kompanie.name` |  | Söldnerkompanie | Mercenary company |
| `unit.armbrust.name` |  | Armbrustschütze | Crossbowman |
| `unit.armbrust.short` |  | Armbrust | Crossbow |
| `unit.bogenschuetze.name` |  | Bogenschütze | Archer |
| `unit.bogenschuetze.short` |  | Bogen | Archer |
| `unit.geschuetz.name` |  | Geschütz | Gun |
| `unit.geschuetz.short` |  | Geschütz | Gun |
| `unit.katapult.name` |  | Katapult | Catapult |
| `unit.katapult.short` |  | Katapult | Catapult |
| `unit.laeufer.name` |  | Läufer | Runner |
| `unit.laeufer.short` |  | Läufer | Runner |
| `unit.reason.doctrine` |  | Gesperrt durch die Doktrin {name}. | Locked by the doctrine {name}. |
| `unit.reiter.name` |  | Reiter | Rider |
| `unit.reiter.short` |  | Reiter | Rider |
| `unit.role.melee` |  | Nahkampf | Melee |
| `unit.role.ranged` |  | Fernkampf | Ranged |
| `unit.role.tank` |  | Nahkampf, zäh | melee, tough |
| `unit.schild.name` |  | Schildträger | Shield bearer |
| `unit.schild.short` |  | Schild | Shield |
| `unit.schwertkaempfer.name` |  | Schwertkämpfer | Swordsman |
| `unit.schwertkaempfer.short` |  | Schwert | Sword |
| `unit.versorgung` |  | {n} Versorgung | {n} supply |
| `unit.werfer.name` |  | Werfer | Thrower |
| `unit.werfer.short` |  | Werfer | Thrower |

## Ausbauten (Upgrades)

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `upg.ausbau.desc` |  | Hebt die Kaserne eine Stufe höher: Versorgungslimit +{n}. Obergrenze 15 Einheiten je Welle. | Raises the barracks by one level: supply cap +{n}. Cap: 15 units per wave. |
| `upg.ausbau.desc.karten` | karten | Baut Quartiere für die Kaserne: Versorgungslimit +{n}. Obergrenze 15 Einheiten je Welle. | Builds quarters for the barracks: supply cap +{n}. Cap: 15 units per wave. |
| `upg.ausbau.name` |  | Ausbau | Expansion |
| `upg.ausbau.name.karten` | karten | Quartiere | Quarters |
| `upg.ausbau2.desc` |  | Baut Quartiere für die zweite Kaserne: Versorgungslimit +{n}. Obergrenze 15 Einheiten je Welle. | Builds quarters for the second barracks: supply cap +{n}. At most 15 units per wave. |
| `upg.ausbau2.name` |  | Quartiere (zweite Kaserne) | Quarters (second barracks) |
| `upg.kadenz.desc` |  | +{percent} % Schussfrequenz | +{percent}% firing rate |
| `upg.kadenz.name` |  | Feuerrate | Rate of fire |
| `upg.mauer.desc` |  | +{n} max. Lebenspunkte je Abschnitt (Mauer oben, Tor, Mauer unten) | +{n} max. hit points per section (top wall, gate, bottom wall) |
| `upg.mauer.name` |  | Verstärkung | Reinforcement |
| `upg.moertel.desc` | nur standard | Alle stehenden Abschnitte regenerieren +{n} Lebenspunkt pro Sekunde | All standing sections regenerate +{n} hit point per second |
| `upg.moertel.name` | nur standard | Mörtelkolonne | Mortar crew |
| `upg.presse.desc` |  | +{n} Material pro Klick. Der Klickwert bleibt bewusst klein, später trägt die Automatik. | +{n} material per click. Click value stays small on purpose; automation carries the late game. |
| `upg.presse.name` |  | Stärkere Presse | Stronger press |
| `upg.qualitaet.desc` |  | Alle Einheiten +{percent} % Schaden und Lebenspunkte. Jede Stufe kostet deutlich mehr als die vorige: der Abfluss für überschüssiges Material. | All units +{percent}% damage and hit points. Each grade costs much more than the last: the sink for surplus material. |
| `upg.qualitaet.name` |  | Qualitätsstufe | Quality grade |
| `upg.reichweite.desc` |  | +{n} Reichweite | +{n} range |
| `upg.reichweite.name` |  | Reichweite | Range |
| `upg.stacheln.desc` | nur standard | Nahkämpfer an der Mauer erleiden {n} Schaden pro Schlag | Melee attackers at the wall take {n} damage per hit |
| `upg.stacheln.name` | nur standard | Stachelwall | Spiked wall |
| `upg.turm.build` |  | Turm errichten | Build tower |
| `upg.turm.desc` |  | +{n} Schaden pro Schuss. Der Turm trifft nur Gegner seiner Lane und schweigt, solange seine Mauer gefallen ist. | +{n} damage per shot. The tower only hits enemies in its own lane and stays silent while its wall is down. |
| `upg.turm.name` |  | Kaliber | Calibre |
| `upg.zinseszins.desc` | nur standard | Zinsdeckel +{n} | Interest cap +{n} |
| `upg.zinseszins.name` | nur standard | Kontor-Ausbau | Trading house expansion |

## Forschung und Budget

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `budget.bib` |  | Ohne Universität höchstens {n} % (Bibliothek). | Without a university at most {n}% (library). |
| `budget.needUni` |  | Das Forschungsbudget braucht eine Universität. | The research budget needs a university. |
| `budget.step` |  | {n} % | {n}% |
| `budget.step.title` |  | Forschungsbudget {n} % | Research budget {n}% |
| `budget.text` |  | Jetzt fließen {n} % des Materialertrags in die Forschung und kommen als EP zurück (Kurs {k} EP je Material). Je größer der Anteil, desto schlechter der Kurs. Jederzeit änderbar. | Currently {n}% of the material income goes into research and returns as XP (rate {k} XP per material). The larger the share, the worse the rate. Change it any time. |
| `budget.title` |  | Forschungsbudget | Research budget |
| `research.bann.desc` |  | {e1} Karten für diese Partie aus dem Pool entfernen. | Remove {e1} cards from the pool for this game. |
| `research.bann.name` |  | Bann | Ban |
| `research.bib` |  | Bibliothek des Haupthauses: ein Forschungsplatz, Forschungen dauern dort {z} % länger. | Library of the main hall: one research slot, research there takes {z}% longer. |
| `research.branch.archiv` |  | B Archiv | B Archive |
| `research.branch.forschung` |  | C Forschung | C Research |
| `research.branch.freischaltung` |  | D Freischaltungen | D Unlocks |
| `research.branch.lehre` |  | A Lehre | A Teaching |
| `research.branchOf.archiv` |  | Zweig B: Kartenmanipulation. | Branch B: card manipulation. |
| `research.branchOf.forschung` |  | Zweig C: globale Verbesserungen. | Branch C: global improvements. |
| `research.branchOf.freischaltung` |  | Zweig D: Freischaltungen. | Branch D: unlocks. |
| `research.branchOf.lehre` |  | Zweig A: EP-Automatik. | Branch A: XP automation. |
| `research.branchOf.pfad` |  | Pfadforschung: öffnet sich über eine Technologiekarte. | Path research: opens with a technology card. |
| `research.busy` |  | Alle {n} Forschungsplätze belegt. | All {n} research slots busy. |
| `research.doneToast` |  | Forschung abgeschlossen: {name} | Research complete: {name} |
| `research.drill.desc` |  | Takt der eigenen Wellen −{e1} %. | Own wave interval −{e1}%. |
| `research.drill.name` |  | Drill | Drill |
| `research.expl` |  | {effect} · {cost} · {s} s | {effect} · {cost} · {s} s |
| `research.gluecksgriff.desc` |  | Seltene Karten +{e1} Prozentpunkte Ziehgewicht. | Rare cards +{e1} percentage points draw weight. |
| `research.gluecksgriff.name` |  | Glücksgriff | Lucky draw |
| `research.hoersaal.desc` | nur standard | Die Universität erzeugt {e1} EP je Sekunde. | The university produces {e1} XP per second. |
| `research.hoersaal.name` | nur standard | Hörsaal | Lecture hall |
| `research.ingenieur.desc` | nur standard | Gebäudekosten −{e1} %. | Building costs −{e1}%. |
| `research.ingenieur.name` | nur standard | Ingenieurwesen | Engineering |
| `research.intro` |  | Forschung kostet Material und Zeit; {n} gleichzeitig. | Research costs material and time; {n} at a time. |
| `research.logistik.desc` |  | Versorgungslimit +{e1}. | Supply cap +{e1}. |
| `research.logistik.name` |  | Logistik | Logistics |
| `research.maurerkunst.desc` |  | Reparatur-Abklingzeit der Mauer −{e1} %. | Wall repair cooldown −{e1}%. |
| `research.maurerkunst.name` |  | Maurerkunst | Masonry |
| `research.metallurgie.desc` |  | Materialertrag der Fabriken +{e1} %. | Factory material yield +{e1}%. |
| `research.metallurgie.desc.karten` | karten | Materialertrag der Manufakturen +{e1} %. | Manufactory material yield +{e1}%. |
| `research.metallurgie.name` |  | Metallurgie | Metallurgy |
| `research.needUni` |  | Baue eine Universität, um zu forschen. | Build a university to research. |
| `research.neuziehen.desc` |  | {e1}× je Kartenwahl alle Optionen neu ziehen. | Redraw all options {e1}× per card choice. |
| `research.neuziehen.name` |  | Neu ziehen | Redraw |
| `research.requires` |  | Braucht zuerst {name}. | Requires {name} first. |
| `research.running` |  | Wird gerade erforscht. | Currently being researched. |
| `research.runningBib` |  | Bibliothek: {name} | Library: {name} |
| `research.runningName` |  | Forschung: {name} | Research: {name} |
| `research.rush` |  | Beschleunigen | Speed up |
| `research.schildtraeger.desc` | nur standard | Neue Einheit: Nahkampf, viele Lebenspunkte, langsam. Bremst die ganze Armee. | New unit: melee, many hit points, slow. Slows the whole army. |
| `research.schildtraeger.name` | nur standard | Schildträger | Shield bearers |
| `research.schmiedeausbau.desc` |  | Jede Qualitätsstufe der Schmiede wirkt {e1} Prozentpunkte stärker. | Every forge quality level is {e1} percentage points stronger. |
| `research.schmiedeausbau.name` |  | Schmiede-Ausbau | Forge extension |
| `research.seconds` |  | {s} s | {s} s |
| `research.time` |  | Dauer | Duration |
| `research.weitblick.desc` |  | +{e1} Kartenoption je Wahl. | +{e1} card option per choice. |
| `research.weitblick.name` |  | Weitblick | Foresight |
| `research.zweiterplatz.desc` |  | Zwei Forschungen gleichzeitig. | Two researches at once. |
| `research.zweiterplatz.name` |  | Zweiter Forschungsplatz | Second research slot |

## Spezialkarten (Kartenwahl)

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `draft.allesAufDieMitte.desc` |  | Alle Einheiten gehen in die Mitte und sind +{e2} % stärker. Nachteil: Abschnitte −{d1} % Lebenspunkte. | All units go to the middle and are +{e2}% stronger. Drawback: sections −{d1}% hit points. |
| `draft.allesAufDieMitte.name` |  | Alles auf die Mitte | All in the middle |
| `draft.aushebung.desc` |  | Versorgungslimit +{e1}. Nachteil: Einheiten −{d1} % Lebenspunkte. | Supply cap +{e1}. Drawback: units −{d1}% hit points. |
| `draft.aushebung.desc.t2.karten` | karten | Versorgungslimit +{e1}; Einheiten kosten {e2p} % weniger. Nachteil: Einheiten −{d1} % Lebenspunkte. | Supply limit +{e1}; units cost {e2p}% less. Drawback: units −{d1}% health. |
| `draft.aushebung.name` |  | Aushebung | Levy |
| `draft.ban` |  | {name} bannen | Ban {name} |
| `draft.bastion.desc` | nur standard | Türme +{e1} % Reichweite. Nur im Angebot, wenn ein Turm steht. | Towers +{e1}% range. Only offered once a tower stands. |
| `draft.bastion.name` | nur standard | Bastion | Bastion |
| `draft.bauleitung.desc` | nur standard | Baut auf einem freien Platz selbst eine Fabrik, sobald du das {e1}-Fache des Preises hast. | Builds a factory on a free plot by itself once you hold {e1}× the price. |
| `draft.bauleitung.name` | nur standard | Bauleitung | Site manager |
| `draft.bauordnung.desc` |  | Alle Nachbarschaftsboni wirken {e1}-fach. | All neighbour bonuses work {e1}-fold. |
| `draft.bauordnung.name` |  | Bauordnung | Building code |
| `draft.belagerungsgeraet.desc` |  | Einheiten +{e1} % Schaden gegen Basen. Nachteil: −{d1} % gegen Einheiten. | Units +{e1}% damage against bases. Drawback: −{d1}% against units. |
| `draft.belagerungsgeraet.desc.t2.karten` | karten | Einheiten +{e1} % Schaden gegen Basen; die Basis verliert zusätzlich {e2} Lebenspunkte pro Sekunde. Nachteil: −{d1} % gegen Einheiten. | Units +{e1}% damage against bases; the base also loses {e2} health per second. Drawback: −{d1}% against units. |
| `draft.belagerungsgeraet.name` |  | Belagerungsgerät | Siege engines |
| `draft.bessereFabriken.desc` |  | Fabrikertrag +{e1} %. | Factory output +{e1}%. |
| `draft.bessereFabriken.desc.karten` | karten | Ertrag der Manufakturen +{e1} %. | Manufactory output +{e1}%. |
| `draft.bessereFabriken.desc.t2.karten` | karten | Ertrag der Manufakturen +{e1} %; ihr Nachbarschaftsbonus wirkt {e2}-fach. | Manufactory yield +{e1}%; their neighbour bonus counts {e2} times. |
| `draft.bessereFabriken.desc.t3.karten` | karten | Ertrag der Manufakturen +{e1} %; ihr Nachbarschaftsbonus wirkt {e2}-fach. | Manufactory yield +{e1}%; their neighbour bonus counts {e2} times. |
| `draft.bessereFabriken.name` |  | Bessere Fabriken | Better factories |
| `draft.bessereFabriken.name.karten` | karten | Bessere Manufakturen | Better manufactories |
| `draft.blitzkrieg.desc` | nur standard | Deine Wellen rücken alle 12 s aus statt alle 20 s. Nachteil: Einheiten −{d1} % Lebenspunkte. | Your waves deploy every 12 s instead of 20 s. Drawback: units −{d1}% hit points. |
| `draft.blitzkrieg.name` | nur standard | Blitzkrieg | Blitz |
| `draft.cat.armee` |  | Armee | Army |
| `draft.cat.automatisierung` |  | Automatisierung | Automation |
| `draft.cat.basis` |  | Basis | Base |
| `draft.cat.bau` |  | Bau | Build |
| `draft.cat.doktrin` |  | Doktrin | Doctrine |
| `draft.cat.sonderregel` |  | Sonderregel | Special rule |
| `draft.cat.technologie` |  | Technologie | Technology |
| `draft.cat.wagnis` |  | Wagnis | Gamble |
| `draft.cat.weiterentwicklung` |  | Weiterentwicklung | Development |
| `draft.cat.wirtschaft` |  | Wirtschaft | Economy |
| `draft.dauerauftrag.desc` |  | Füllt die Warteschlange bei jedem Takt mit der zuletzt ausgerückten Zusammensetzung, soweit das Material reicht. | Refills the queue every wave with the last deployed composition, as far as material allows. |
| `draft.dauerauftrag.name` |  | Dauerauftrag | Standing order |
| `draft.doppelschicht.desc` | nur standard | Produktion der Fabriken +{e1} %. Nachteil: Klickertrag −{d1} %. | Factory output +{e1}%. Drawback: click yield −{d1}%. |
| `draft.doppelschicht.name` | nur standard | Doppelschicht | Double shift |
| `draft.drill.desc` |  | Einheiten greifen {e1} % schneller an. | Units attack {e1}% faster. |
| `draft.drill.desc.t2.karten` | karten | Einheiten greifen {e1} % schneller an und halten {e2p} % mehr aus. | Units attack {e1}% faster and take {e2p}% more. |
| `draft.drill.name` |  | Drill | Drill |
| `draft.durchbruch.desc` |  | Einheiten richten an der gegnerischen Basis {e1}-fachen Schaden an. | Units deal {e1}× damage to the enemy base. |
| `draft.durchbruch.name` |  | Durchbruch | Breakthrough |
| `draft.eyebrow` |  | Stufe {n} erreicht | Level {n} reached |
| `draft.festungsbau.desc` | nur standard | Alle Abschnitte +{syn} % Lebenspunkte je gewählter Basiskarte (diese eingeschlossen). | All sections +{syn}% hit points per chosen base card (this one included). |
| `draft.festungsbau.name` | nur standard | Festungsbau | Fortification |
| `draft.fliessband.desc` | nur standard | Automatische Presse +{e1} %; sie läuft schon in Phase Früh mit {e2} %. | Auto press +{e1}%; it already runs in phase early at {e2}%. |
| `draft.fliessband.name` | nur standard | Fließband | Assembly line |
| `draft.gilde.desc` |  | Materialertrag +{syn} % je Wirtschaftskarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Material yield +{syn}% per economy card (at most {max} cards count). The card counts itself. |
| `draft.gilde.name` |  | Gilde | Guild |
| `draft.gluecksritter.desc` |  | Eine Karte mehr je Angebot. Nachteil: Stufen brauchen {d1} % mehr EP. | One more card per offer. Drawback: levels need {d1}% more XP. |
| `draft.gluecksritter.name` |  | Glücksritter | Fortune hunter |
| `draft.grenzwacht.desc` |  | Mauer und Tor +{syn} % Lebenspunkte je Militärkarte (höchstens {max} Karten zählen). Zählt für Militär und Verteidigung. | Walls and gate +{syn}% hit points per military card (at most {max} cards count). Counts for military and defence. |
| `draft.grenzwacht.name` |  | Grenzwacht | Border watch |
| `draft.grossauftrag.desc` | nur standard | Fabrikertrag +{syn} % je gewählter Wirtschaftskarte (diese eingeschlossen). | Factory output +{syn}% per chosen economy card (this one included). |
| `draft.grossauftrag.name` | nur standard | Großauftrag | Bulk order |
| `draft.grosseArmee.desc` |  | Versorgungslimit ×{e1} (höchstens 15). Nachteil: Deine Wellen rücken nur alle 40 s aus. | Supply cap ×{e1} (max. 15). Drawback: your waves deploy only every 40 s. |
| `draft.grosseArmee.name` |  | Große Armee | Grand army |
| `draft.handelskontor.desc` |  | Der Zinsdeckel des Handelskontors steigt um {e1}. Nur im Angebot, wenn ein Kontor steht. | The trading house interest cap rises by {e1}. Only offered once a trading house stands. |
| `draft.handelskontor.desc.karten` | karten | Der Zinsdeckel des Kontors steigt um {e1} %. Nur im Angebot, wenn ein Kontor steht. | The interest cap of the trading post rises by {e1}%. Only offered when a trading post stands. |
| `draft.handelskontor.name` |  | Handelskontor | Trading house |
| `draft.handelskontor.name.karten` | karten | Zinsmeister | Interest master |
| `draft.instandhaltung.desc` | nur standard | Abschnitte unter {c1} % werden automatisch repariert, zu {e1} % der Kosten. | Sections below {c1}% are repaired automatically at {e1}% of the cost. |
| `draft.instandhaltung.desc.t3.karten` | karten | Abschnitte unter {c2} % werden automatisch repariert, zu {e1} % der Kosten. | Sections below {c2}% are repaired automatically, at {e1}% of the cost. |
| `draft.instandhaltung.name` | nur standard | Instandhaltung | Maintenance |
| `draft.kriegsanleihe.desc` | nur standard | Sofort Material für {e1} Sekunden Produktion. Nachteil: Gegner +{d1} % Lebenspunkte. | Instant material worth {e1} seconds of production. Drawback: enemies +{d1}% hit points. |
| `draft.kriegsanleihe.name` | nur standard | Kriegsanleihe | War bonds |
| `draft.kriegserfahrung.desc` |  | +{e1} % EP pro Abschuss. Stufen kommen schneller. | +{e1}% XP per kill. Levels come faster. |
| `draft.kriegserfahrung.desc.karten` | karten | +{e1} % EP aus allen Quellen: Abschüsse, Basisschaden, abgewehrte Wellen und Forschungsbudget. Stufen kommen schneller. | +{e1}% XP from every source: takedowns, base damage, repelled waves and research budget. Levels come faster. |
| `draft.kriegserfahrung.desc.t2.karten` | karten | +{e1} % EP aus allen Quellen. Das Forschungsbudget der Universität zahlt {e2p} % besser. Stufen kommen schneller. | +{e1}% XP from all sources. The university research budget pays {e2p}% better. Levels come faster. |
| `draft.kriegserfahrung.name` |  | Kriegserfahrung | Battle experience |
| `draft.kriegserfahrung.name.karten` | karten | Lehrjahre | Apprenticeship |
| `draft.kriegstrommeln.desc` |  | Formationen ab {c1} Einheiten +{e1} % Schaden. | Formations of {c1} or more units +{e1}% damage. |
| `draft.kriegstrommeln.desc.t3.karten` | karten | Formationen schon ab {c2} Einheiten +{e1} % Schaden. | Formations from {c2} units +{e1}% damage. |
| `draft.kriegstrommeln.name` |  | Kriegstrommeln | War drums |
| `draft.kriegswirtschaft.desc` |  | Einheiten kosten {syn} % weniger je Militärkarte (höchstens {max} Karten zählen). Zählt für Wirtschaft und Militär. | Units cost {syn}% less per military card (at most {max} cards count). Counts for economy and military. |
| `draft.kriegswirtschaft.name` |  | Kriegswirtschaft | Wartime economy |
| `draft.lagerzehnt.desc` |  | Material über dem Lagerdeckel ({m} Minuten Ertrag) wird zu EP. | Material above the storage cap ({m} minutes of income) turns into XP. |
| `draft.lagerzehnt.name` |  | Lagerzehnt | Storage tithe |
| `draft.langeWurfarme.desc` | nur standard | Werfer +{e1} Reichweite. Nachteil: Werfer −{d1} % Lebenspunkte. | Throwers +{e1} range. Drawback: throwers −{d1}% hit points. |
| `draft.langeWurfarme.desc.t2.karten` | karten | Werfer +{e1} Reichweite, Fernkämpfer +{e2p} % Schaden. Nachteil: Werfer −{d1} % Lebenspunkte. | Throwers +{e1} range, ranged units +{e2p}% damage. Drawback: throwers −{d1}% health. |
| `draft.langeWurfarme.name` | nur standard | Lange Wurfarme | Long throwing arms |
| `draft.maurerkolonne.desc` |  | Stehende Mauern regenerieren {e1} % ihrer Lebenspunkte pro Sekunde, wenn sie {s} s lang nicht getroffen wurden. Das Tor ist ausgenommen. | Standing walls regenerate {e1}% of their hit points per second if not hit for {s} s. The gate is excluded. |
| `draft.maurerkolonne.desc.t3.karten` | karten | Stehende Mauern regenerieren {e1} % ihrer Lebenspunkte pro Sekunde, wenn sie {s} s lang nicht getroffen wurden. Auch das Tor regeneriert. | Standing walls regenerate {e1}% of their health per second if they were not hit for {s} s. The gate regenerates too. |
| `draft.maurerkolonne.name` |  | Maurerkolonne | Mason crew |
| `draft.maxed` |  | Höchste Stufe gewählt | Highest tier chosen |
| `draft.nachtschicht.desc` | nur standard | In der Spätphase produzieren die Fabriken {e1} mehr. | In the late phase, factories produce {e1} more. |
| `draft.nachtschicht.name` | nur standard | Nachtschicht | Night shift |
| `draft.notreserve.desc` | nur standard | Fällt das Tor unter {c1} %, wird es einmal vollständig repariert. | If the gate drops below {c1}%, it is fully repaired once. |
| `draft.notreserve.name` | nur standard | Notreserve | Emergency reserve |
| `draft.pluenderung.desc` |  | Abschüsse durch Türme bringen Material. | Tower kills bring material. |
| `draft.pluenderung.name` |  | Plünderung | Plunder |
| `draft.querverbindung.desc` |  | Nachbarschaftsboni wirken auch diagonal. | Neighbour bonuses also work diagonally. |
| `draft.querverbindung.name` |  | Querverbindung | Cross-link |
| `draft.queue` |  | Danach folgen {n} weitere Stufenaufstiege. | {n} more level-ups follow. |
| `draft.rarity.common` |  | gewöhnlich | common |
| `draft.rarity.doktrin` |  | Doktrin | Doctrine |
| `draft.rarity.legendary` |  | legendär | legendary |
| `draft.rarity.rare` |  | selten | rare |
| `draft.rarity.wagnis` |  | Wagnis | Gamble |
| `draft.rationalisierung.desc` | nur standard | Fabriken +{syn} % je gewählter Automatisierungskarte (diese eingeschlossen). | Factories +{syn}% per chosen automation card (this one included). |
| `draft.rationalisierung.name` | nur standard | Rationalisierung | Rationalisation |
| `draft.rekrutenzug.desc` |  | Die Kaserne schickt je Welle {e1} Läufer mehr. | The barracks sends {e1} more runner per wave. |
| `draft.rekrutenzug.desc.t2.karten` | karten | Die Kaserne schickt je Welle {e1} Läufer mehr; neue Einheiten starten mit {e2} Schmiede-Stufe mehr. | The barracks sends {e1} more runner per wave; new units start with {e2} more smithy level. |
| `draft.rekrutenzug.name` |  | Rekrutenzug | Recruit levy |
| `draft.reroll` |  | Neu ziehen | Redraw |
| `draft.sammelruf.desc` |  | Jede Welle erhält einen Läufer mehr je zwei Militärkarten (höchstens {max} Karten zählen; die Kaserne bildet sie aus, ohne Versorgung). Die Karte zählt selbst mit. | Every wave gains one more runner per two military cards (at most {max} cards count; the barracks trains them, without supply). The card counts itself. |
| `draft.sammelruf.name` |  | Sammelruf | Muster call |
| `draft.sappeure.desc` | nur standard | Die gegnerische Basis verliert {e1} Lebenspunkte pro Sekunde, solange eigene Einheiten in der gegnerischen Hälfte stehen. | The enemy base loses {e1} hit points per second while your units stand in the enemy half. |
| `draft.sappeure.desc.t2.karten` | karten | Die gegnerische Basis verliert {e1} Lebenspunkte pro Sekunde, von Anfang an und auch ohne eigene Einheiten in der gegnerischen Hälfte. | The enemy base loses {e1} health per second from the start, even without your units in the enemy half. |
| `draft.sappeure.name` | nur standard | Sappeure | Sappers |
| `draft.scharfschuetzen.desc` | nur standard | Turmschaden +{e1} % gegen Fernkämpfer. Nur im Angebot, wenn ein Turm steht. | Tower damage +{e1}% against ranged units. Only offered once a tower stands. |
| `draft.scharfschuetzen.name` | nur standard | Scharfschützen | Marksmen |
| `draft.schildwall.desc` |  | Eine voll besetzte Nahkampfreihe hält +{e1} % mehr aus. | A full melee row withstands +{e1}% more. |
| `draft.schildwall.desc.t2.karten` | karten | Schon eine Nahkampfreihe mit {c2} Einheiten zählt als voll und hält +{e1} % mehr aus. | A melee row of just {c2} units already counts as full and takes +{e1}% more. |
| `draft.schildwall.name` |  | Schildwall | Shield wall |
| `draft.schwerePressen.desc` | nur standard | Produktion der Fabriken +{e1} %. Nachteil: alle Abschnitte −{d1} % Lebenspunkte. | Factory output +{e1}%. Drawback: all sections −{d1}% hit points. |
| `draft.schwerePressen.name` | nur standard | Schwere Pressen | Heavy presses |
| `draft.selbstlaeufer.desc` | nur standard | Automatische Presse +{syn} % je gewählter Automatisierungskarte (diese eingeschlossen). | Auto press +{syn}% per chosen automation card (this one included). |
| `draft.selbstlaeufer.name` | nur standard | Selbstläufer | Self-runner |
| `draft.serienbau.desc` | nur standard | Neue Fabriken kosten {e1} % weniger. | New factories cost {e1}% less. |
| `draft.serienbau.name` | nur standard | Serienbau | Mass production |
| `draft.soeldnerheer.desc` | nur standard | Einheiten kosten kein Material. Nachteil: Fabrikproduktion −{d1} %. | Units cost no material. Drawback: factory output −{d1}%. |
| `draft.soeldnerheer.name` | nur standard | Söldnerheer | Mercenary army |
| `draft.soeldnertruppe.desc` |  | Über dem Versorgungslimit lassen sich Einheiten für {so} % Aufschlag anwerben; sie belegen keine Versorgung. | Above the supply limit units can be hired for {so}% extra; they use no supply. |
| `draft.soeldnertruppe.name` |  | Söldnertruppe | Mercenary company |
| `draft.stachelwall.desc` |  | Nahkämpfer an der Mauer erleiden den Schaden von {e1} Stachelstufen pro Schlag. | Melee attackers at the wall take the damage of {e1} spike levels per strike. |
| `draft.stachelwall.name` |  | Stachelwall | Spiked wall |
| `draft.taktiker.desc` | nur standard | Schaden gegen Basen +{syn} % je gewählter Armeekarte (diese eingeschlossen). | Damage against bases +{syn}% per chosen army card (this one included). |
| `draft.taktiker.name` | nur standard | Taktiker | Tacticians |
| `draft.text` |  | Das Spiel ist pausiert. Wähle genau eine Karte. Eine gewählte Karte kann später in der nächsten Stufe wiederkommen. | The game is paused. Choose exactly one card. A chosen card may return later at its next tier. |
| `draft.tierOf` |  | Stufe {n} von {max} | Tier {n} of {max} |
| `draft.turmkanoniere.desc` |  | Turmschaden +{e1} %. Nur im Angebot, wenn ein Turm steht. | Tower damage +{e1}%. Only offered once a tower stands. |
| `draft.turmkanoniere.desc.t2.karten` | karten | Turmschaden +{e1} %, Turmreichweite +{e2p} %. | Tower damage +{e1}%, tower range +{e2p}%. |
| `draft.turmkanoniere.desc.t3.karten` | karten | Turmschaden +{e1} %, Turmreichweite +{e2p} %, doppelter Schaden gegen Fernkämpfer. | Tower damage +{e1}%, tower range +{e2p}%, double damage against ranged units. |
| `draft.turmkanoniere.name` |  | Turmkanoniere | Tower gunners |
| `draft.turmschule.desc` |  | Türme: Reichweite +{e1} %, Abklingzeit −{e2p} %. Nur im Angebot, wenn ein Turm steht. | Towers: range +{e1}%, cooldown −{e2p}%. Only offered when a tower stands. |
| `draft.turmschule.name` |  | Turmschule | Tower school |
| `draft.verbrannteErde.desc` | nur standard | Fällt eine Mauer, erleiden alle Gegner ihrer Lane {e1} Schaden. Nachteil: Reparaturen kosten das Doppelte. | When a wall falls, all enemies in its lane take {e1} damage. Drawback: repairs cost double. |
| `draft.verbrannteErde.name` | nur standard | Verbrannte Erde | Scorched earth |
| `draft.veteranen.desc` | nur standard | Einheitenstärke +{syn} % je gewählter Armeekarte (diese eingeschlossen). | Unit strength +{syn}% per chosen army card (this one included). |
| `draft.veteranen.name` | nur standard | Veteranen | Veterans |
| `draft.vorposten.desc` | nur standard | Einheiten starten {e1} weiter vorn, aber nie hinter der gegnerischen Front. Nachteil: alle Abschnitte −{d1} % Lebenspunkte. | Units start {e1} further forward, but never behind the enemy front. Drawback: all sections −{d1}% hit points. |
| `draft.vorposten.name` | nur standard | Vorposten | Outpost |
| `draft.waffenbrueder.desc` |  | Einheiten +{syn} % Schaden je Militärkarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Units +{syn}% damage per military card (at most {max} cards count). The card counts itself. |
| `draft.waffenbrueder.name` |  | Waffenbrüder | Brothers in arms |
| `draft.wehrhandel.desc` |  | Materialertrag +{syn} % je Verteidigungskarte (höchstens {max} Karten zählen). Zählt für Wirtschaft und Verteidigung. | Material yield +{syn}% per defence card (at most {max} cards count). Counts for economy and defence. |
| `draft.wehrhandel.name` |  | Wehrhandel | Defence trade |
| `draft.wehrverband.desc` |  | Türme +{syn} % Schaden je Verteidigungskarte (höchstens {max} Karten zählen). Die Karte zählt selbst mit. | Towers +{syn}% damage per defence card (at most {max} cards count). The card counts itself. |
| `draft.wehrverband.name` |  | Wehrverband | Militia league |
| `draft.weitschuss.desc` | nur standard | Fernkämpfer verursachen {e1} % mehr Schaden. | Ranged units deal {e1}% more damage. |
| `draft.weitschuss.name` | nur standard | Weitschuss | Long shot |
| `draft.werkmeister.desc` | nur standard | Die Schmiede kauft ihre nächste Qualitätsstufe selbst, sobald du das {e1}-Fache des Preises hast. | The forge buys its next quality grade by itself once you hold {e1}× the price. |
| `draft.werkmeister.name` | nur standard | Werkmeister | Foreman |
| `draft.zeugmeister.desc` | nur standard | Errichtete Türme kaufen „Kaliber“ selbst, sobald du das {e1}-Fache des Preises hast. | Built towers buy calibre by themselves once you hold {e1}× the price. |
| `draft.zeugmeister.name` | nur standard | Zeugmeister | Armourer |
| `draft.zinnen.desc` | nur standard | Alle Abschnitte +{e1} % Lebenspunkte. | All sections +{e1}% hit points. |
| `draft.zinnen.desc.t2.karten` | karten | Alle Abschnitte +{e1} % Lebenspunkte; Reparaturen kosten {e2p} % weniger. | All sections +{e1}% health; repairs cost {e2p}% less. |
| `draft.zinnen.name` | nur standard | Zinnen | Battlements |

## Kartenpfad: Pfadkarten, Wirkungszeilen, Pfadforschung

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `kp.card.ballistik.desc` |  | Der Weg der Fernkämpfer. | The way of the ranged units. |
| `kp.card.ballistik.name` |  | Ballistik | Ballistics |
| `kp.card.befestigungskunde.desc` |  | Wissen über Mauern und Türme. | Knowledge of walls and towers. |
| `kp.card.befestigungskunde.name` |  | Befestigungskunde | Fortification Lore |
| `kp.card.buchdruck.desc` |  | Öffnet die Weiterentwicklung der Universität. | Opens the advancement of the university. |
| `kp.card.buchdruck.name` |  | Buchdruck | Printing press |
| `kp.card.built` |  | gebaut: {name} | built: {name} |
| `kp.card.dampfkraft.desc` |  | Öffnet die zweite Weiterentwicklung der Produktion: Fabriken werden zu Dampffabriken. | Opens the second development of production: factories become steam factories. |
| `kp.card.dampfkraft.name` |  | Dampfkraft | Steam power |
| `kp.card.drawback` |  | mit Nachteil | with drawback |
| `kp.card.eiserneKlingen.desc` |  | Besseres Gerät aus Eisen. | Better equipment made of iron. |
| `kp.card.eiserneKlingen.name` |  | Eiserne Klingen | Iron Blades |
| `kp.card.excludes` |  | Schließt aus: {list} | Excludes: {list} |
| `kp.card.excludesGeneric` |  | Schließt eine andere Technologie aus. | Rules out another technology. |
| `kp.card.fernhandel.desc` |  | Öffnet die Weiterentwicklung des Kontors zum Handelshaus: Es wirbt gegen Material Söldnerkompanien an, die sofort ausrücken. | Opens the development of the trading post into a trading house: it hires mercenary companies for material, which march out at once. |
| `kp.card.fernhandel.name` |  | Fernhandel | Long-distance Trade |
| `kp.card.forschungsort` |  | Universität oder Bibliothek | university or library |
| `kp.card.fortgeschritteneTaktiken.desc` |  | Neue Wege der Aufstellung. | New ways to arrange the units. |
| `kp.card.fortgeschritteneTaktiken.name` |  | Fortgeschrittene Taktiken | Advanced Tactics |
| `kp.card.geschuetzguss.desc` |  | Öffnet die Weiterentwicklung der Schmiede zur Gießerei: Die Kaserne bildet Geschütze aus, die Mauern und Basis aus großer Entfernung beschießen. | Opens the development of the smithy into a foundry: the barracks train guns that shell walls and base from long range. |
| `kp.card.geschuetzguss.name` |  | Geschützguss | Gun Casting |
| `kp.card.glaskanonen.desc` |  | Fernkämpfer richten doppelt so viel aus. Nachteil: Fernkämpfer haben nur 1 Lebenspunkt. | Ranged units deal twice the damage. Drawback: ranged units have only 1 hit point. |
| `kp.card.glaskanonen.name` |  | Glaskanonen | Glass Cannons |
| `kp.card.hofhaltung.desc` |  | Das Rathaus lässt sich zur Residenz ausbauen: höchstens fünf Manufakturen und ein zweiter Flügel. Der Ausbau kostet Material und läuft im Reiter Haupthaus. | The town hall can be expanded into a residence: at most five manufactories and a second wing. The expansion costs material and runs in the main hall tab. |
| `kp.card.hofhaltung.name` |  | Hofhaltung | Court Household |
| `kp.card.needs` |  | Benötigt: {list} | Needs: {list} |
| `kp.card.noBan` |  | Pfadkarten lassen sich nicht bannen. | Path cards cannot be banned. |
| `kp.card.opens` |  | Öffnet Forschung: {list} | Opens research: {list} |
| `kp.card.returns` |  | Kehrt in den Stapel zurück, wenn nicht gewählt. | Returns to the deck if not chosen. |
| `kp.card.stadtrecht.desc` |  | Der Gutshof lässt sich zum Rathaus ausbauen: höchstens vier Manufakturen und ein Flügel nach Wahl. Der Ausbau kostet Material und läuft im Reiter Haupthaus. | The manor can be expanded into a town hall: at most four manufactories and one wing of your choice. The expansion costs material and runs in the main hall tab. |
| `kp.card.stadtrecht.name` |  | Stadtrecht | Town Charter |
| `kp.card.unlocks` |  | Schaltet frei: {list} | Unlocks: {list} |
| `kp.card.volleAuslastung.desc` | nur standard | Versorgung ×{e1}. Nachteil: Materialertrag −50 %. | Supply ×{e1}. Drawback: material yield −50 %. |
| `kp.card.volleAuslastung.name` | nur standard | Volle Auslastung | Full Capacity |
| `kp.card.wasserrahmen.desc` |  | Öffnet die erste Weiterentwicklung der Produktion: Manufakturen werden zu Fabriken mit mehr Ertrag. | Opens the first development of production: manufactories become factories with more yield. |
| `kp.card.wasserrahmen.name` |  | Wasserrahmen | Water Frame |
| `kp.collection.banned` |  | Gebannt | Banned |
| `kp.collection.hint` |  | Sammlung: gewählte und gebannte Karten. Die Wahl findet auf der Kartenbühne statt. | Collection: chosen and banned cards. The choice itself is made on the card stage. |
| `kp.collection.noneBanned` |  | Keine Karte gebannt. | No card banned. |
| `kp.deck.count` |  | {n} Karten gewählt | {n} cards chosen |
| `kp.deck.label` |  | Stapel | Deck |
| `kp.eff.allesAufDieMitte` |  | Alle in die Mitte, +{e2} % Stärke | All to the centre, +{e2} % strength |
| `kp.eff.ausfall` |  | Gegenstoß, Basisschaden ×{e3}; Reparatur ×2 | Counter-attack, base damage ×{e3}; repair ×2 |
| `kp.eff.aushebung` |  | Versorgungslimit +{e1} | Supply limit +{e1} |
| `kp.eff.bastion` | nur standard | Türme +{e1} % Reichweite | Towers +{e1} % range |
| `kp.eff.bauleitung` | nur standard | Baut Fabriken selbst | Builds factories by itself |
| `kp.eff.bauordnung` |  | Nachbarschaftsboni ×{e1} | Neighbour bonuses ×{e1} |
| `kp.eff.belagerungsgeraet` |  | Schaden gegen Basen +{e1} % | Damage to bases +{e1} % |
| `kp.eff.bessereFabriken` |  | Fabrikertrag +{e1} % | Factory yield +{e1} % |
| `kp.eff.bessereFabriken.karten` | karten | Ertrag der Manufakturen +{e1} % | Manufactory yield +{e1} % |
| `kp.eff.blitzkrieg` | nur standard | Wellen alle 12 s statt alle 20 s | Waves every 12 s instead of 20 s |
| `kp.eff.bollwerk` |  | Bastion, Abschüsse 2× EP, Ertrag −{d1p} % | Bastion, tower XP ×2, yield −{d1p}% |
| `kp.eff.dampfkraft` |  | Fabrik → Dampffabrik: Ertrag +40 % | Factory → steam factory: yield +40% |
| `kp.eff.dauerauftrag` |  | Warteschlange füllt sich selbst | Queue refills itself |
| `kp.eff.doppelschicht` | nur standard | Fabriken +{e1} % Produktion | Factories +{e1} % output |
| `kp.eff.drill` |  | Einheiten greifen {e1} % schneller an | Units attack {e1} % faster |
| `kp.eff.durchbruch` |  | Basisschaden ×{e1} | Base takes {e1}× damage |
| `kp.eff.elite` |  | Leben und Schaden ×2, Versorgung halbiert | Health and damage ×2, supply halved |
| `kp.eff.fabrikmiliz` |  | Manufakturen stellen Läufer, Ertrag −{d1} % | Manufactories train runners, yield −{d1}% |
| `kp.eff.fernhandel` |  | Kontor → Handelshaus: Söldnerkompanien | Trading post → trading house: mercenaries |
| `kp.eff.festungsbau` | nur standard | Abschnitte +{syn} % je Basiskarte | Sections +{syn} % per base card |
| `kp.eff.fliessband` | nur standard | Automatische Presse +{e1} % | Automatic press +{e1} % |
| `kp.eff.freihandel` |  | Material und EP tauschbar; Türme Stufe {tw} | Swap material and XP; towers level {tw} |
| `kp.eff.geschuetzguss` |  | Schmiede → Gießerei: Geschütze | Smithy → foundry: guns |
| `kp.eff.gilde` |  | Ertrag +{syn} % je Wirtschaftskarte | Yield +{syn}% per economy card |
| `kp.eff.glaskanonen` |  | Fernkämpfer: doppelter Schaden, 1 LP | Ranged: double damage, 1 HP |
| `kp.eff.gluecksritter` |  | Eine Karte mehr je Angebot | One more card per offer |
| `kp.eff.grenzfeste` |  | Turm-Abschüsse ×{e1} Material, Wellen +{d1p} % | Tower takedowns ×{e1}, waves +{d1p} % |
| `kp.eff.grenzwacht` |  | Mauer +{syn} % Leben je Militärkarte | Wall +{syn}% health per military card |
| `kp.eff.grossauftrag` | nur standard | Fabrikertrag +{syn} % je Wirtschaftskarte | Factory yield +{syn} % per economy card |
| `kp.eff.grosseArmee` |  | Versorgungslimit ×{e1} | Supply limit ×{e1} |
| `kp.eff.handelskontor` |  | Zinsdeckel des Kontors +{e1} | Trading post interest cap +{e1} |
| `kp.eff.handelskontor.karten` | karten | Zinsdeckel des Kontors +{e1} % | Trading post cap +{e1}% |
| `kp.eff.hofhaltung` |  | Rathaus → Residenz: 5 Manufakturen, 1 Flügel | Town hall → residence: 5 manufact., 1 wing |
| `kp.eff.instandhaltung` | nur standard | Abschnitte reparieren sich selbst | Sections repair themselves |
| `kp.eff.kriegsanleihe` | nur standard | Sofort Material für {e1} s Produktion | Instantly {e1} s of production |
| `kp.eff.kriegserfahrung` |  | +{e1} % EP pro Abschuss | +{e1} % XP per takedown |
| `kp.eff.kriegserfahrung.karten` | karten | Alle EP-Quellen +{e1} % | All XP sources +{e1} % |
| `kp.eff.kriegstrommeln` |  | Formationen: +{e1} % Schaden | Formations: +{e1} % damage |
| `kp.eff.kriegswirtschaft` |  | Einheitenkosten −{syn} % je Militärkarte | Unit cost −{syn}% per military card |
| `kp.eff.lagerzehnt` |  | Überschüssiges Material wird zu EP | Surplus material turns into XP |
| `kp.eff.langeWurfarme` | nur standard | Werfer +{e1} Reichweite | Throwers +{e1} range |
| `kp.eff.massenaufgebot` |  | Läufer −{e1} %, +{e2} je Welle; nur Läufer | Runners −{e1}%, +{e2} per wave; runners only |
| `kp.eff.maurerkolonne` |  | Mauern regenerieren {e1} % je Sekunde | Walls regenerate {e1} % per second |
| `kp.eff.nachtschicht` | nur standard | Spätphase: Fabriken {e1} mehr | Late phase: factories {e1} more |
| `kp.eff.notreserve` | nur standard | Tor wird einmal voll repariert | Gate repaired fully once |
| `kp.eff.pluenderung` |  | Turm-Abschüsse bringen Material | Tower takedowns bring material |
| `kp.eff.querverbindung` |  | Nachbarschaftsboni auch diagonal | Neighbour bonuses also diagonal |
| `kp.eff.rationalisierung` | nur standard | Fabriken +{syn} % je Automatisierung | Factories +{syn} % per automation |
| `kp.eff.raubbau` |  | Ertrag der Manufakturen ×2, verfällt | Manufactory yield ×2, decays |
| `kp.eff.rekrutenzug` |  | Kaserne schickt {e1} Läufer mehr | Barracks sends {e1} more runner |
| `kp.eff.sammelruf` |  | +1 Läufer je zwei Militärkarten | +1 runner per two military cards |
| `kp.eff.sappeure` | nur standard | Gegnerbasis verliert {e1} LP je Sekunde | Enemy base loses {e1} HP per second |
| `kp.eff.scharfschuetzen` | nur standard | Turmschaden +{e1} % gegen Fernkämpfer | Tower damage +{e1} % vs ranged |
| `kp.eff.schildwall` |  | Volle Nahkampfreihe hält +{e1} % aus | Full melee row holds +{e1} % more |
| `kp.eff.schwerePressen` | nur standard | Fabriken +{e1} % Produktion | Factories +{e1} % output |
| `kp.eff.selbstlaeufer` | nur standard | Presse +{syn} % je Automatisierungskarte | Press +{syn} % per automation card |
| `kp.eff.serienbau` | nur standard | Neue Fabriken {e1} % billiger | New factories {e1} % cheaper |
| `kp.eff.soeldnerheer` | nur standard | Einheiten kosten kein Material | Units cost no material |
| `kp.eff.soeldnertruppe` |  | Söldner über dem Versorgungslimit | Mercenaries beyond the supply limit |
| `kp.eff.stachelwall` |  | Mauern: Stachelstufen {e1} | Walls: spike levels {e1} |
| `kp.eff.stadtrecht` |  | Gutshof → Rathaus: 4 Manufakturen, 1 Flügel | Manor → town hall: 4 manufactories, 1 wing |
| `kp.eff.stehendesHeer` |  | Heerlager: Versorgung +{s1}, Unterhalt | Army camp: supply +{s1}, upkeep |
| `kp.eff.stiftung` |  | Stiftungshaus: Kurs ×{s1}, Einheiten +{d1p} % | Endowment hall: rate ×{s1}, units +{d1p}% |
| `kp.eff.taktiker` | nur standard | Schaden gegen Basen +{syn} % je Karte | Damage to bases +{syn} % per card |
| `kp.eff.turmkanoniere` |  | Turmschaden +{e1} % | Tower damage +{e1} % |
| `kp.eff.turmschule` |  | Reichweite +{e1} %, Abklingzeit −{e2p} % | Range +{e1}%, cooldown −{e2p}% |
| `kp.eff.verbrannteErde` | nur standard | Gefallene Mauer: {e1} Schaden an Gegnern | Fallen wall: {e1} damage to enemies |
| `kp.eff.veteranen` | nur standard | Einheitenstärke +{syn} % je Armeekarte | Unit strength +{syn} % per army card |
| `kp.eff.volleAuslastung` | nur standard | Versorgung ×{e1}, Ertrag −50 % | Supply ×{e1}, yield −50 % |
| `kp.eff.vorposten` | nur standard | Einheiten starten {e1} weiter vorn | Units start {e1} further forward |
| `kp.eff.vorstoss` |  | Wellen 2× so oft, Türme {d1p} % langsamer | Waves 2× as often, towers {d1p}% slower |
| `kp.eff.waffenbrueder` |  | Schaden +{syn} % je Militärkarte | Damage +{syn}% per military card |
| `kp.eff.wasserrahmen` |  | Manufaktur → Fabrik: Ertrag +30 % | Manufactory → factory: yield +30% |
| `kp.eff.wehrhandel` |  | Ertrag +{syn} % je Verteidigungskarte | Yield +{syn}% per defence card |
| `kp.eff.wehrverband` |  | Turmschaden +{syn} % je Verteidigungskarte | Tower damage +{syn}% per defence card |
| `kp.eff.weitschuss` | nur standard | Fernkämpfer +{e1} % Schaden | Ranged units +{e1} % damage |
| `kp.eff.werkmeister` | nur standard | Schmiede kauft Stufen selbst | Smithy buys tiers by itself |
| `kp.eff.zermuerbung` |  | Gegner −{zr} % Leben, Quartiere +{d1} % | Foes −{zr}% health, quarters +{d1}% |
| `kp.eff.zeugmeister` | nur standard | Türme kaufen Kaliber selbst | Towers buy calibre by themselves |
| `kp.eff.zinnen` | nur standard | Alle Abschnitte +{e1} % Lebenspunkte | All sections +{e1} % health |
| `kp.eff.zunftordnung` |  | Zunfthaus: Nachbarbonus ×{nb}, Grenze −{gd} | Guildhall: bonus ×{nb}, cap −{gd} |
| `kp.fam.bonus` |  | Bonus | Bonus |
| `kp.fam.doktrin` |  | Doktrin | Doctrine |
| `kp.fam.technologie` |  | Technologie | Technology |
| `kp.fam.wagnis` |  | Wagnis | Gamble |
| `kp.fam.weiterentwicklung` |  | Weiterentwicklung | Development |
| `kp.lock.card` |  | Freischaltung: Karte {name} | Unlocked by: card {name} |
| `kp.lock.opens` |  | Öffnet mit: Karte {name} | Opens with: card {name} |
| `kp.lock.research` |  | Forschung: {name} | Research: {name} |
| `kp.path.head` |  | Pfade | Paths |
| `kp.path.status.available` |  | verfügbar | available |
| `kp.path.status.chosen` |  | gewählt | chosen |
| `kp.path.status.done` |  | erforscht | researched |
| `kp.path.status.excluded` |  | ausgeschlossen | excluded |
| `kp.path.status.locked` |  | gesperrt | locked |
| `kp.path.status.running` |  | läuft | running |
| `kp.res.armbrust.desc` |  | Armbrustschützen werden verfügbar. | Crossbowmen become available. |
| `kp.res.armbrust.name` |  | Armbrustschütze | Crossbowmen |
| `kp.res.buchdruck.desc` |  | Die Universität wird zur Akademie: Forschungen dauern {e1} % kürzer, der Kurs des Forschungsbudgets steigt um {e2} %. | The university becomes an academy: research takes {e1} % less time, the research budget rate rises by {e2} %. |
| `kp.res.buchdruck.name` |  | Akademie | Academy |
| `kp.res.dampfkraft.desc` |  | Alle Fabriken werden zu Dampffabriken: Ertrag +{e1} %, Klickertrag +{e2} %. Grundvarianten der Fabriken entfallen. | All factories become steam factories: yield +{e1} %, click yield +{e2} %. Basic variants of the factories are replaced. |
| `kp.res.dampfkraft.name` |  | Dampffabriken | Steam factories |
| `kp.res.eisenwaffen.desc` |  | Läufer werden zu Schwertkämpfern, Werfer zu Bogenschützen; Schmiede-Stufen ab 4 werden kaufbar. | Runners become swordsmen, throwers become archers; forge levels from 4 up can be bought. |
| `kp.res.eisenwaffen.name` |  | Eisenwaffen | Iron Gear |
| `kp.res.fernhandel.desc` |  | Das Kontor wird zum Handelshaus und wirbt Söldnerkompanien an; die Zinsen bleiben. Grundvarianten des Kontors entfallen. | The trading post becomes a trading house and hires mercenary companies; interest stays. Basic variants of the trading post are dropped. |
| `kp.res.fernhandel.name` |  | Handelshaus | Trading House |
| `kp.res.geschuetzguss.desc` |  | Die Schmiede wird zur Gießerei: Die Kaserne bildet Geschütze aus. Qualitätsstufen bleiben, Grundvarianten der Schmiede entfallen. | The smithy becomes a foundry: the barracks train guns. Quality levels stay, basic variants of the smithy are dropped. |
| `kp.res.geschuetzguss.name` |  | Gießerei | Foundry |
| `kp.res.group.grund` |  | Grundforschung | Basic research |
| `kp.res.group.pfad` |  | Pfadforschung | Path research |
| `kp.res.katapult.desc` |  | Katapulte werden verfügbar. | Catapults become available. |
| `kp.res.katapult.name` |  | Katapult | Catapult |
| `kp.res.opensWith` |  | Öffnet mit: Karte {name} | Opens with: card {name} |
| `kp.res.reiter.desc` |  | Reiter werden verfügbar. | Riders become available. |
| `kp.res.reiter.name` |  | Reiter | Riders |
| `kp.res.schiessscharten.desc` |  | Türme richten {e1} % mehr Schaden an, gegen Fernkämpfer {e2} % mehr. | Towers deal {e1} % more damage, {e2} % more against ranged units. |
| `kp.res.schiessscharten.name` |  | Schießscharten | Arrow Slits |
| `kp.res.schild.desc` |  | Schildträger werden verfügbar. | Shield bearers become available. |
| `kp.res.schild.name` |  | Schildträger | Shield bearers |
| `kp.res.wasserrahmen.desc` |  | Alle Manufakturen werden zu Fabriken: Ertrag +{e1} %. Grundvarianten entfallen. | All manufactories become factories: yield +{e1}%. Basic variants are dropped. |
| `kp.res.wasserrahmen.name` |  | Fabriken | Factories |
| `kp.res.wehrgang.desc` |  | Mauern halten {e1} % mehr aus, die Reparaturpause sinkt um {e2} %. | Walls hold {e1} % more, the repair pause drops by {e2} %. |
| `kp.res.wehrgang.name` |  | Wehrgänge | Battlements |
| `kp.stage.hint` |  | Fahre über eine Karte oder wähle mit den Tasten 1 bis {n}. | Hover over a card or choose with keys 1 to {n}. |
| `kp.stage.later` |  | Später | Later |
| `kp.stage.next` |  | Nächste Stufe noch nicht verfügbar | Next level not available yet |
| `kp.stage.title` |  | Stufe {n} erreicht – wähle eine Karte | Level {n} reached – choose a card |
| `kp.vorschau` |  | ? | ? |

## Gebäude-Varianten

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `var.bastion.desc` |  | Feuert wie ein Turm über die Mauer in die Lane der Zeile, mit {bd} % mehr Schaden als ein Turm. Die Manufaktur darunter arbeitet weiter. | Fires like a tower over the wall into the lane of its row, with {bd}% more damage than a tower. The manufactory below keeps working. |
| `var.bastion.eff` |  | Feuert über die Mauer | Fires over the wall |
| `var.bastion.name` |  | Bastion | Bastion |
| `var.exerzierplatz.desc` |  | Einheiten richten {e1} % mehr Schaden an und haben {e2} % mehr Lebenspunkte. | Units deal {e1}% more damage and have {e2}% more health. |
| `var.exerzierplatz.eff` |  | Einheiten +{e1} % Schaden und Leben | Units +{e1}% damage and health |
| `var.exerzierplatz.name` |  | Exerzierplatz | Parade ground |
| `var.garnison.desc` |  | Die Mauer heilt {e1} Lebenspunkte je Sekunde; Einheiten in der Mitte haben {e2} % mehr Lebenspunkte. | The wall heals {e1} health per second; units in the middle have {e2}% more health. |
| `var.garnison.eff` |  | Mauer heilt {e1} LP/s | Wall heals {e1} HP/s |
| `var.garnison.name` |  | Garnison | Garrison |
| `var.heerlager.desc` |  | Das Versorgungslimit steigt um {e1}. | The supply limit rises by {e1}. |
| `var.heerlager.eff` |  | Versorgung +{e1} | Supply +{e1} |
| `var.heerlager.name` |  | Heerlager | Army camp |
| `var.manufaktur.desc` |  | Liefert {e1} % mehr Material als eine gewöhnliche Manufaktur. | Yields {e1}% more material than a plain manufactory. |
| `var.manufaktur.eff` |  | Ertrag +{e1} % | Yield +{e1}% |
| `var.manufaktur.name` |  | Hofmanufaktur | Court Manufactory |
| `var.muenzschmiede.desc` |  | Der Schmiede-Ausbau kostet {e1} % weniger Material. | The smithy upgrade costs {e1}% less material. |
| `var.muenzschmiede.eff` |  | Schmiede-Ausbau −{e1} % Kosten | Smithy upgrade −{e1}% cost |
| `var.muenzschmiede.name` |  | Münzschmiede | Mint Smithy |
| `var.ruestkammer.desc` |  | Die Mauer hat {e1} % mehr Lebenspunkte. | The wall has {e1}% more health. |
| `var.ruestkammer.eff` |  | Mauer +{e1} % Leben | Wall +{e1}% health |
| `var.ruestkammer.name` |  | Rüstkammer | Armoury |
| `var.stiftungshaus.desc` |  | Der Kurs des Forschungsbudgets wird mit {e1} multipliziert. | The rate of the research budget is multiplied by {e1}. |
| `var.stiftungshaus.eff` |  | Budgetkurs ×{e1} | Budget rate ×{e1} |
| `var.stiftungshaus.name` |  | Stiftungshaus | Endowment hall |
| `var.wachstube.desc` |  | Türme richten {e1} % mehr Schaden an; Abschüsse durch Türme bringen Material. | Towers deal {e1}% more damage; tower kills bring material. |
| `var.wachstube.eff` |  | Türme +{e1} % Schaden | Towers +{e1}% damage |
| `var.wachstube.name` |  | Wachstube | Guardhouse |
| `var.waffenschmiede.desc` |  | Die Ausbauten der Schmiede wirken ×{e1}. | The smithy upgrades work ×{e1}. |
| `var.waffenschmiede.eff` |  | Schmiede-Ausbau ×{e1} | Smithy upgrades ×{e1} |
| `var.waffenschmiede.name` |  | Waffenschmiede | Weapon smithy |
| `var.werkstatt.desc` |  | Einheiten kosten {e1} % weniger Material. | Units cost {e1}% less material. |
| `var.werkstatt.eff` |  | Einheiten −{e1} % Kosten | Units −{e1}% cost |
| `var.werkstatt.name` |  | Zeugmanufaktur | Arms Manufactory |
| `var.zahlmeisterei.desc` |  | Der Kaserne-Ausbau „Quartiere“ kostet {e1} % weniger Material. | The barracks upgrade “Quarters” costs {e1}% less material. |
| `var.zahlmeisterei.eff` |  | Quartiere −{e1} % Kosten | Quarters −{e1}% cost |
| `var.zahlmeisterei.name` |  | Zahlmeisterei | Paymaster |
| `var.zunfthaus.desc` |  | Manufaktur, deren Nachbarschaftsbonus (Manufaktur neben Manufaktur) {nb}-fach wirkt. | A manufactory whose neighbour bonus (manufactory next to manufactory) counts {nb} times. |
| `var.zunfthaus.eff` |  | Nachbarbonus ×{nb} | Neighbour bonus ×{nb} |
| `var.zunfthaus.name` |  | Zunfthaus | Guildhall |
| `variant.cell` |  | Aufwertung noch {s} s | conversion {s} s left |
| `variant.once` |  | Einmalig und endgültig; Abriss und Neubau bleiben möglich. | Once and for all; demolishing and rebuilding stay possible. |
| `variant.pick` |  | Aufwerten zu {name} | Convert to {name} |
| `variant.progress` |  | Aufwertung zu {name}: noch {s} s. Das Gebäude ruht. | Converting to {name}: {s} s left. The building rests. |
| `variant.reason.done` |  | Bereits aufgewertet; nur Abriss und Neubau ändern das. | Already converted; only demolishing and rebuilding changes that. |
| `variant.reason.excess` |  | Reiße zuerst {n} Manufakturen ab. | Demolish {n} manufactories first. |
| `variant.reason.excess.one` |  | Reiße zuerst eine Manufaktur ab. | Demolish one manufactory first. |
| `variant.reason.upgrading` |  | Das Gebäude wird bereits aufgewertet. | The building is already being converted. |
| `variant.title` |  | Aufwerten | Convert |

## Doktrinen, Kategorien, Handel

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `doctrine.ausfall.desc` |  | Nach jeder abgewehrten Gegnerwelle rückt sofort ein Gegenstoß aus, {e2} % stärker und mit {e3}-fachem Schaden an der gegnerischen Basis. Einschränkung: Die Reparatur der Mauer kostet das Doppelte. | After every repelled enemy wave a counter-attack marches out at once, {e2}% stronger and dealing {e3}× damage to the enemy base. Limit: repairing the wall costs double. |
| `doctrine.ausfall.name` |  | Ausfall | Sortie |
| `doctrine.bollwerk.desc` |  | Manufakturen lassen sich zur Bastion aufwerten, einem Turm im Raster, der über die Mauer feuert (Schaden {bd} % über einem Turm). Abschüsse durch Türme und Bastionen bringen doppelte EP. Einschränkung: Manufakturen liefern {d1p} % weniger. | Manufactories can be upgraded to a bastion, a tower on the grid that fires over the wall ({bd}% more damage than a tower). Enemies downed by towers and bastions give double XP. Limit: manufactories yield {d1p}% less. |
| `doctrine.bollwerk.name` |  | Bollwerk | Bulwark |
| `doctrine.elite.desc` |  | Deine Einheiten haben doppelt so viele Lebenspunkte und richten doppelten Schaden an. Einschränkung: Das Versorgungslimit wird halbiert. | Your units have twice the hit points and deal twice the damage. Limit: the supply limit is halved. |
| `doctrine.elite.name` |  | Elite | Elite |
| `doctrine.fabrikmiliz.desc` |  | Jede Manufaktur stellt alle {mv} Sekunden einen Läufer, der keine Versorgung belegt. Einschränkung: Der Materialertrag sinkt um {d1} %. | Every manufactory trains a runner every {mv} seconds that uses no supply. Limit: material yield drops by {d1}%. |
| `doctrine.fabrikmiliz.name` |  | Bürgerwehr | Citizen Militia |
| `doctrine.freihandel.desc` |  | Im Kontor lassen sich Material und EP tauschen: {fsm} Material ergeben {fe} EP, {fse} EP ergeben {fmt} Material. Einschränkung: Türme bleiben auf Stufe {tw}, ihre Ausbauten sind gesperrt. | At the trading post material and XP can be swapped: {fsm} material give {fe} XP, {fse} XP give {fmt} material. Limit: towers stay at level {tw}, their upgrades are locked. |
| `doctrine.freihandel.name` |  | Freihandel | Free trade |
| `doctrine.grenzfeste.desc` |  | Abschüsse durch Türme bringen {e1}-faches Material. Einschränkung: Zwischen deinen Wellen liegt {d1p} % mehr Zeit. | Tower kills bring {e1}× material. Limit: {d1p} % more time between your waves. |
| `doctrine.grenzfeste.name` |  | Grenzfeste | Border fortress |
| `doctrine.massenaufgebot.desc` |  | Läufer kosten {e1} % weniger, und die Kaserne schickt je Welle {e2} Läufer mehr. Einschränkung: Werfer und alle Spezialeinheiten sind gesperrt. | Runners cost {e1}% less and the barracks sends {e2} more runner per wave. Limit: throwers and all special units are locked. |
| `doctrine.massenaufgebot.name` |  | Massenaufgebot | Mass levy |
| `doctrine.raubbau.desc` |  | Der Ertrag jeder Manufaktur verdoppelt sich. Einschränkung: Alle {rv} Minuten verliert jede Manufaktur eine von {rs} Ertragsstufen; ein Neubau erneuert sie. | The yield of every manufactory doubles. Limit: every {rv} minutes each manufactory loses one of {rs} yield levels; rebuilding it renews them. |
| `doctrine.raubbau.name` |  | Raubbau | Overexploitation |
| `doctrine.stehendesHeer.desc` |  | Die Kaserne lässt sich zum Heerlager aufwerten: Versorgungslimit +{s1}. Einschränkung: Jede eigene Einheit auf dem Feld kostet {d1} Material Unterhalt je Minute. | The barracks can be upgraded to an army camp: supply limit +{s1}. Limit: every unit on the field costs {d1} material upkeep per minute. |
| `doctrine.stehendesHeer.name` |  | Stehendes Heer | Standing Army |
| `doctrine.stiftung.desc` |  | Die Universität lässt sich zum Stiftungshaus aufwerten; der Kurs des Forschungsbudgets wird mit {s1} multipliziert. Einschränkung: Einheiten kosten {d1p} % mehr Material. | The university can be upgraded to an endowment hall; the rate of the research budget is multiplied by {s1}. Limit: units cost {d1p}% more material. |
| `doctrine.stiftung.name` |  | Stiftung | Endowment |
| `doctrine.vorstoss.desc` |  | Eigene Wellen rücken doppelt so oft aus (Abstand ×{e1}). Einschränkung: Türme feuern {d1p} % langsamer. | Your waves march out twice as often (interval ×{e1}). Limit: towers fire {d1p}% slower. |
| `doctrine.vorstoss.name` |  | Vorstoß | Push |
| `doctrine.zermuerbung.desc` |  | Gegner verlieren vor der Mauer einmalig {zr} % ihrer Lebenspunkte. Einschränkung: Quartiere (Kaserne-Ausbau) kosten {d1} % mehr. | Foes lose {zr}% of their hit points once in front of the wall. Limit: quarters (barracks upgrade) cost {d1}% more. |
| `doctrine.zermuerbung.name` |  | Zermürbung | Attrition |
| `doctrine.zunftordnung.desc` |  | Manufakturen lassen sich zu Zunfthäusern aufwerten; deren Nachbarschaftsbonus wirkt {nb}-fach. Einschränkung: Die Obergrenze für Manufakturen sinkt um {gd}; Zunfthäuser zählen mit. | Manufactories can be upgraded to guildhalls; their neighbour bonus counts {nb} times. Limit: the manufactory cap drops by {gd}; guildhalls count towards it. |
| `doctrine.zunftordnung.name` |  | Zunftordnung | Guild Order |
| `kat.art.bruecke` |  | Brücke | Bridge |
| `kat.art.verstaerker` |  | Verstärker | Amplifier |
| `kat.art.zaehler` |  | Zähler | Counter |
| `kat.counts.item` |  | {name} {n} | {name} {n} |
| `kat.counts.title` |  | Karten je Kategorie | Cards per category |
| `kat.militaer.name` |  | Militär | Military |
| `kat.neutral.name` |  | Neutral | Neutral |
| `kat.now` |  | derzeit {v} | now {v} |
| `kat.verteidigung.name` |  | Verteidigung | Defence |
| `kat.wirtschaft.name` |  | Wirtschaft | Economy |
| `raubbau.cell` |  | Raubbau ×{f} | Overexploitation ×{f} |
| `trade.progress` |  | EP-Fortschritt zur nächsten Wahl | XP progress to the next choice |
| `trade.reason.xp` |  | Zu wenig EP-Fortschritt: {n} EP nötig. | Not enough XP progress: {n} XP needed. |
| `trade.toMat` |  | EP → Material | XP → Material |
| `trade.toXp` |  | Material → EP | Material → XP |

## Erklärzeilen der Knöpfe

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `ex.again` |  | Zum Startbildschirm | To the start screen |
| `ex.back` |  | Partie läuft weiter · kostenlos | Game continues · free |
| `ex.budget` |  | {n} % des Ertrags werden zu EP, Kurs {k} · {n} % weniger Material | {n}% of the income becomes XP, rate {k} · {n}% less material |
| `ex.budget.off` |  | Kein Ertrag fließt in die Forschung · kostenlos | No income goes into research · free |
| `ex.cam.followOff` |  | Aus · Kamera fährt mit | Off · camera follows |
| `ex.cam.followOn` |  | An · Scrollen beendet | On · scrolling stops it |
| `ex.cam.front` |  | Zur vordersten Formation | To the foremost formation |
| `ex.cam.realm` |  | Zum Reich springen | Jump to your realm |
| `ex.cancel` |  | Schließt ohne Änderung | Closes without changes |
| `ex.card` |  | Spezialkarte · {tier} · kostenlos | Special card · {tier} · free |
| `ex.click` |  | +{n} Material · kostenlos | +{n} material · free |
| `ex.clickAuto` |  | Automatik: {n} Klicks/s · schneller klicken bringt mehr | Auto press: {n} clicks/s · click faster for more |
| `ex.demolish` |  | Platz frei · Erstattung {refund} | Frees the plot · refund {refund} |
| `ex.diff` |  | Gegnerbasis {hp} LP · Wellen {size} + {growth}/min | Enemy base {hp} HP · waves {size} + {growth}/min |
| `ex.draft.ban` |  | Für diese Partie entfernen · noch {n} | Remove for this game · {n} left |
| `ex.draft.reroll` |  | Alle Optionen neu · noch {n} | All options new · {n} left |
| `ex.fluegel` |  | {effect} · endgültig | {effect} · final |
| `ex.haus.ausbau` |  | {effect} · {cost} · {s} s | {effect} · {cost} · {s} s |
| `ex.hintOk` |  | Hinweis schließen | Close hint |
| `ex.hud.draft` |  | {n} offen · Reiter Karten | {n} open · Cards tab |
| `ex.kaserne.build` |  | Zum Reiter Bauen, Kaserne vorausgewählt · {cost} | Opens Build with barracks preselected · {cost} |
| `ex.kompanie` |  | {l} Läufer, {w} Werfer, sofort, ohne Versorgung · {cost} | {l} runners, {w} throwers, at once, no supply · {cost} |
| `ex.kompanie.cd` |  | Nächste Kompanie in {s} s | Next company in {s} s |
| `ex.kp.card` |  | {tier} · kostenlos | {tier} · free |
| `ex.kp.deck` |  | {cur} von {need} EP bis zur nächsten Wahl | {cur} of {need} XP to the next choice |
| `ex.kp.hud.draft` |  | {n} offen · Bühne öffnen | {n} open · open stage |
| `ex.kp.later` |  | Bühne einklappen · Wahl bleibt offen | Fold the stage · choice stays open |
| `ex.kp.vorschau` |  | noch nicht verfügbar | not available yet |
| `ex.lang.de` |  | Oberfläche und Meldungen auf Deutsch | Interface and messages in German |
| `ex.lang.en` |  | Oberfläche und Meldungen auf Englisch | Interface and messages in English |
| `ex.line` |  | {effect} · {cost} | {effect} · {cost} |
| `ex.menu.lang` |  | Sprache wechseln | Switch language |
| `ex.menu.pause` |  | Spiel anhalten | Pause the game |
| `ex.menu.resume` |  | Spiel fortsetzen | Continue the game |
| `ex.menu.session` |  | Sitzung als JSON | Session as JSON |
| `ex.menu.tutorial` |  | Tutorial beenden | End tutorial |
| `ex.newGame` |  | Sprache und Schwierigkeit | Language and difficulty |
| `ex.repair` |  | +{n} Lebenspunkte · {cost} | +{n} hit points · {cost} |
| `ex.research.rush` |  | Sofort fertig · {cost} | Finish now · {cost} |
| `ex.resetHints` |  | Alle Erstkontakt-Hinweise erscheinen wieder | All first-time hints appear again |
| `ex.resetHints.done` |  | Zurückgesetzt | Reset done |
| `ex.skipIntro.off` |  | Aus · Systeme erscheinen nacheinander | Off · systems appear one by one |
| `ex.skipIntro.on` |  | An · alles sofort sichtbar | On · everything visible at once |
| `ex.start` |  | Neue Partie auf {diff} | New game on {diff} |
| `ex.tab.army` |  | Einheiten, Wellen | Units, waves |
| `ex.tab.build` |  | Bauplätze, Gebäude | Plots, buildings |
| `ex.tab.cards` |  | Kartenwahl, Stufen | Card choice, tiers |
| `ex.tab.haus` |  | Stufe, Flügel | Level, wings |
| `ex.tab.smithy` |  | Qualitätsstufen | Quality levels |
| `ex.tab.uni` |  | Forschung | Research |
| `ex.tab.wall` |  | Reparatur, Ausbau | Repair, upgrades |
| `ex.trade.toMat` |  | {a} EP → {b} Material | {a} XP → {b} material |
| `ex.trade.toXp` |  | {a} Material → {b} EP | {a} material → {b} XP |
| `ex.tutorial.off` |  | Aus · direkt ins Spiel | Off · straight into the game |
| `ex.tutorial.on` |  | An · der Quartiermeister führt durch die ersten Schritte | On · the quartermaster guides you through the first steps |
| `ex.unit` |  | {role} · {hp} LP · {cost} | {role} · {hp} HP · {cost} |
| `ex.unit.merc` |  | {role} · {hp} LP · {cost} (Söldner, keine Versorgung) | {role} · {hp} HP · {cost} (mercenary, no supply) |
| `ex.variant` |  | {effect} · {cost}, {s} s | {effect} · {cost}, {s} s |
| `ex.wave.rush` |  | {n} Einheiten rücken sofort aus · {cost} | {n} units march at once · {cost} |
| `ex.wave.rushCd` |  | Wieder in {s} s | Again in {s} s |

## Tooltips

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `tip.again.body` |  | Zurück zum Startbildschirm. | Back to the start screen. |
| `tip.back.body` |  | Schließt den Startbildschirm. Die Partie läuft weiter. | Closes the start screen. The game continues. |
| `tip.baseFull` |  | Abschnitt ist unbeschädigt | Section is undamaged |
| `tip.budget.body` |  | Wandelt {n} % des laufenden Materialertrags (Fabriken und Presse) in EP um, Kurs {k} EP je Material. Die Einstellung lässt sich jederzeit ändern; Klicks und Zinsen bleiben unberührt. | Turns {n}% of the running material income (factories and press) into XP at a rate of {k} XP per material. You can change it any time; clicks and interest are not affected. |
| `tip.budget.body.karten` | karten | Wandelt {n} % des laufenden Materialertrags (Manufakturen und Presse) in EP um, Kurs {k} EP je Material. Die Einstellung lässt sich jederzeit ändern; Klicks und Zinsen bleiben unberührt. | Turns {n}% of the running material income (manufactories and press) into XP at a rate of {k} XP per material. You can change it any time; clicks and interest are not affected. |
| `tip.budget.mat` |  | Material je Sekunde | Material per second |
| `tip.budget.off` |  | Der gesamte Materialertrag bleibt beim Material, es entstehen keine EP aus Forschung. | All material income stays material; research yields no XP. |
| `tip.budget.rate` |  | Kurs (EP je Material) | Rate (XP per material) |
| `tip.budget.xp` |  | EP je Sekunde | XP per second |
| `tip.cam.follow` |  | Die Kamera hält die vorderste eigene Formation im Bild, bis du selbst scrollst. | The camera keeps your foremost formation in view until you scroll yourself. |
| `tip.cam.front` |  | Springt einmal zur vordersten eigenen Formation. | Jumps once to your foremost formation. |
| `tip.cam.realm` |  | Springt an den linken Rand der Spielwelt, zu deinem Reich. | Jumps to the left end of the world, to your realm. |
| `tip.cancel.body` |  | Schließt das Fenster ohne Änderung. | Closes this window without changes. |
| `tip.click.body` |  | Erzeugt Material. Ab Phase Mitte presst die Automatik selbst (3 Klicks/s, ab Spät 6); zählt wird das Höhere aus Automatik und deinen Klicks. Höchstens {max} Klicks pro Sekunde zählen. | Produces material. From phase mid the press runs by itself (3 clicks/s, 6 from late); you get the higher of automation and your clicks. At most {max} clicks per second count. |
| `tip.confirmDemolish.body` |  | Reißt das Gebäude ab und erstattet {refund}. | Demolishes the building and refunds {refund}. |
| `tip.cost` |  | Kosten | Cost |
| `tip.demolish.body` |  | Öffnet die Bestätigung. Ohne Bestätigung passiert nichts. | Opens a confirmation. Nothing happens without it. |
| `tip.draft.art` |  | Typ | Type |
| `tip.draft.ban` |  | Entfernt die Karte für diese Partie aus dem Pool; an ihre Stelle tritt eine neue. Noch {n} Banne. | Removes the card from the pool for this game; a new one takes its place. {n} bans left. |
| `tip.draft.category` |  | Art | Type |
| `tip.draft.choose` |  | Klicken wählt diese Karte. Danach läuft das Spiel weiter. | Click to choose this card. The game then continues. |
| `tip.draft.kat` |  | Kategorie | Category |
| `tip.draft.limit` |  | Stufe | Tier |
| `tip.draft.next` |  | Nächste Stufe | Next tier |
| `tip.draft.rarity` |  | Seltenheit | Rarity |
| `tip.draft.reroll` |  | Zieht alle Optionen dieser Wahl neu. Noch {n} Mal bei dieser Wahl. | Redraws all options of this choice. {n} more times for this choice. |
| `tip.draft.synergy` |  | Synergie jetzt | Synergy now |
| `tip.fluegel.body` |  | Jede Stufe ab Rathaus bringt einen Flügel; jeder Flügel nur einmal, die Wahl ist endgültig. Das Spezialgebäude bleibt in seinem Bereich stärker. | Every level from town hall on brings one wing; each wing only once, the choice is final. The special building stays stronger in its field. |
| `tip.grid.empty` |  | Freier Bauplatz. | Free plot. |
| `tip.haus.ausbau` |  | Baut das Haupthaus zum {name} aus: {effect}. Dauer {s} s; danach wählst du einen Flügel. | Expands the main hall into a {name}: {effect}. Takes {s} s; afterwards you choose a wing. |
| `tip.haus.ausbau.body` |  | Baut das Haupthaus aus. Danach wählst du einen Flügel. | Expands the main hall. Afterwards you choose a wing. |
| `tip.hintOk.body` |  | Schließt den Hinweis. Er erscheint nicht wieder, bis du die Hinweise auf dem Startbildschirm zurücksetzt. | Closes the hint. It will not return unless you reset hints on the start screen. |
| `tip.hud.army` |  | Zustand der eigenen Armee: Marsch, Kampf oder Sammeln. | State of your army: marching, fighting or regrouping. |
| `tip.hud.draft` |  | Eine Kartenwahl wartet; das Spiel ist bis zur Wahl angehalten. Öffnet den Reiter Karten. | A card choice is waiting; the game is paused until you choose. Opens the Cards tab. |
| `tip.hud.material` |  | Bestand und Ertrag je Sekunde aus Fabriken, Presse und Klicks. | Stock and income per second from factories, press and clicks. |
| `tip.hud.material.karten` | karten | Bestand und Ertrag je Sekunde aus Manufakturen, Presse und Klicks. | Stock and income per second from manufactories, press and clicks. |
| `tip.hud.soldiers` |  | Eigene Einheiten auf dem Feld / Versorgungslimit (Einheiten je Welle). | Own units on the field / supply cap (units per wave). |
| `tip.hud.time` |  | Spielzeit, Stufe und Phase der Partie. | Game time, level and phase. |
| `tip.hud.walls` |  | Lebenspunkte der drei Abschnitte. Fällt das Tor, ist die Partie verloren. | Hit points of the three sections. If the gate falls, the game is lost. |
| `tip.hud.waves` |  | Blau: nächste eigene Welle. Rot: nächste gegnerische Welle, alle {s} s. | Blue: next own wave. Red: next enemy wave, every {s} s. |
| `tip.hud.xp` |  | Erfahrungspunkte aus Abschüssen. Jede Stufe bringt eine Kartenwahl. | Experience points from kills. Every level brings a card choice. |
| `tip.hud.xpRate` |  | EP je Sekunde | XP per second |
| `tip.kaserne.build` |  | Wählt den ersten freien Bauplatz und hebt dort die Kaserne hervor. Gebaut wird erst mit dem zweiten Klick. | Selects the first free plot and highlights the barracks there. The second click builds it. |
| `tip.kat.counts` |  | Jede gewählte Karte zählt einmal für ihre Kategorie, jede weitere Stufe derselben Karte ebenfalls; eine Doktrin zählt {d}-mal, eine Brücke für beide Kategorien. Synergiekarten zählen höchstens {max} Karten. Die Kategorie mit mindestens {lead} Karten Vorsprung erscheint im Angebot doppelt so oft. | Every chosen card counts once for its category, every further tier of the same card too; a doctrine counts {d} times, a bridge for both categories. Synergy cards count at most {max} cards. The category with a lead of at least {lead} cards appears twice as often in offers. |
| `tip.kat.lead` |  | führt | leads |
| `tip.kompanie` |  | Das Handelshaus wirbt eine Söldnerkompanie an: {l} Läufer und {w} Werfer rücken sofort aus und belegen keine Versorgung. Danach {s} s Pause; jede weitere Kompanie kostet {p} % mehr. | The trading house hires a mercenary company: {l} runners and {w} throwers march out at once and use no supply. Then a {s} s pause; each further company costs {p}% more. |
| `tip.kp.deck` |  | Der Stapel füllt sich mit Erfahrung. Ist er voll, steht eine Kartenwahl an. Bei einer offenen, eingeklappten Wahl öffnet ein Klick die Bühne. | The deck fills with experience. When it is full, a card choice is due. With an open, folded choice a click opens the stage. |
| `tip.kp.later` |  | Klappt die Kartenbühne ein. Die Wahl bleibt offen, das Spiel bleibt angehalten. Ein Klick auf den Stapel öffnet sie wieder. | Folds the card stage. The choice stays open and the game stays paused. Clicking the deck opens it again. |
| `tip.kp.vorschau` |  | Hier kommt später noch etwas dazu. | Something more will appear here later. |
| `tip.lang.body` |  | Sprache für Oberfläche und Meldungen. Wechsel nur hier möglich. | Language for interface and messages. Can only be changed here. |
| `tip.level` |  | Stufe | Level |
| `tip.m.baseHp` |  | Lebenspunkte | Hit points |
| `tip.m.baseMax` |  | Max. Lebenspunkte Tor | Max. gate hit points |
| `tip.m.budget` |  | Forschungsbudget | Research budget |
| `tip.m.interest` |  | Zinsdeckel je Auszahlung | Interest cap per payout |
| `tip.m.matRate` |  | Material/s | Material/s |
| `tip.m.perClick` |  | Material pro Klick | Material per click |
| `tip.m.queueMax` |  | Versorgungslimit | Supply cap |
| `tip.m.range` |  | Reichweite | Range |
| `tip.m.regen` |  | Regeneration LP/s | Regeneration HP/s |
| `tip.m.role` |  | Art | Type |
| `tip.m.strength` |  | Stärke durch Schmiede | Strength from forge |
| `tip.m.thorns` |  | Stachelschaden | Spike damage |
| `tip.m.turretDmg` |  | Turmschaden | Tower damage |
| `tip.m.turretRange` |  | Turmreichweite | Tower range |
| `tip.m.turretRate` |  | Schüsse pro Minute | Shots per minute |
| `tip.m.unitDmg` |  | Schaden | Damage |
| `tip.m.unitHp` |  | Lebenspunkte | Hit points |
| `tip.maxed` |  | Höchststufe erreicht | Maximum level reached |
| `tip.menu.lang` |  | Wechselt zwischen Deutsch und Englisch. | Switches between German and English. |
| `tip.menu.pause` |  | Hält die Partie an oder setzt sie fort. | Pauses or resumes the game. |
| `tip.menu.resume` |  | Die Partie ist pausiert (verdeckter Tab oder geladener Spielstand). Klick setzt sie fort. | The game is paused (hidden tab or loaded save). Click to continue. |
| `tip.menu.session` |  | Debug-Modus: lädt das Sitzungsprotokoll dieser Partie herunter (Klicks, Handlungen, Kartenwahl, Forschung, Ergebnis) zum Vergleich mit den Bot-Profilen. | Debug mode: downloads the session log of this game (clicks, actions, card choices, research, result) for comparison with the bot profiles. |
| `tip.menu.tutorial` |  | Beendet die Anleitung sofort. Die Partie läuft normal weiter; die Schonfrist vor der ersten Gegnerwelle entfällt. | Ends the guide at once. The game carries on normally; the grace period before the first enemy wave ends. |
| `tip.missing` |  | Fehlt: {n} | Missing: {n} |
| `tip.needsBuilding` |  | Benötigt: {name} | Requires: {name} |
| `tip.needsTower` |  | Erst den Turm errichten | Build the tower first |
| `tip.new.body` |  | Öffnet den Startbildschirm mit Sprache und Schwierigkeit. | Opens the start screen with language and difficulty. |
| `tip.noSupply` |  | Das Versorgungslimit steht am Deckel von {n}. Mehr Versorgung bringt nichts. | The supply limit is at its cap of {n}. More supply adds nothing. |
| `tip.notRunning` |  | Keine laufende Partie | No game in progress |
| `tip.pick.body` |  | {desc} Wird auf Bauplatz {n} errichtet. | {desc} Built on plot {n}. |
| `tip.refund` |  | Erstattung | Refund |
| `tip.repair.gate` |  | Repariert das Tor sofort. Fällt das Tor, ist die Partie verloren. | Repairs the gate instantly. If the gate falls, the game is lost. |
| `tip.repair.wall` |  | Repariert diesen Mauerabschnitt sofort. Eine gefallene Mauer steht danach wieder, ihr Turm feuert wieder. | Repairs this wall section instantly. A fallen wall stands again and its tower resumes fire. |
| `tip.repairCd` |  | Wieder möglich in {s} s | Available again in {s} s |
| `tip.research.after` |  | Danach | Then |
| `tip.research.before` |  | Jetzt | Now |
| `tip.research.rush` |  | Schließt „{name}“ sofort ab. Der Preis richtet sich nach der restlichen Zeit und steigt mit der Stufe. | Completes “{name}” at once. The price depends on the remaining time and rises with the tier. |
| `tip.resetHints.body` |  | Die kurzen Hinweise beim ersten Kontakt mit Presse, Wellen, Spezialkarten, Verstärkungsgebäuden, Abriss und Belagerungswelle erscheinen erneut. | The short hints shown the first time you meet the press, waves, special cards, reinforcement buildings, demolition and the siege wave appear again. |
| `tip.scroll.body` |  | Verschiebt den Ausschnitt der Spielwelt; die Welt ist doppelt so breit wie das Bild. | Moves the view across the world; the world is twice as wide as the view. |
| `tip.scroll.title` |  | Scrollleiste | Scrollbar |
| `tip.skipIntro.body` |  | Ohne Einführung sind Wellenleiste, Spezialkarten und alle Verstärkungsgebäude von Beginn an sichtbar. Gilt ab der nächsten Partie. | Without the introduction, the wave bar, special cards and all reinforcement buildings are visible from the start. Applies from the next game. |
| `tip.start.body` |  | Startet eine neue Partie mit den gewählten Einstellungen. | Starts a new game with the chosen settings. |
| `tip.stufenname` |  | Bauwerk | Structure |
| `tip.stufenname.next` |  | {a} → {b} ab Stufe {n} | {a} → {b} from level {n} |
| `tip.supplyFull` |  | Versorgung voll: {n}/{max} | Supply full: {n}/{max} |
| `tip.tab.army` |  | Einheiten in die Warteschlange stellen, Wellenvorschau, Ereignisse. | Queue units, wave preview, events. |
| `tip.tab.build` |  | Bauplätze im Reich: bauen, ausbauen, abreißen. | Plots in your realm: build, upgrade, demolish. |
| `tip.tab.cards` |  | Offene Kartenwahl und gewählte Karten mit Stufen. | Open card choice and chosen cards with tiers. |
| `tip.tab.haus` |  | Das Haupthaus in der Mitte deines Reichs: seine Stufe bestimmt, wie viele Manufakturen du bauen darfst. | The main hall at the centre of your realm: its level sets how many manufactories you may build. |
| `tip.tab.smithy` |  | Qualitätsstufen der Schmiede für alle Einheiten. | Forge quality levels for all units. |
| `tip.tab.uni` |  | Universität: zusätzliche Kartenoption. | University: one extra card option. |
| `tip.tab.wall` |  | Mauer, Tor und Türme: reparieren und ausbauen. | Wall, gate and towers: repair and upgrade. |
| `tip.towerCap` |  | Gesperrt durch die Doktrin {name}: Türme bleiben auf Stufe {n}. | Locked by the doctrine {name}: towers stay at level {n}. |
| `tip.trade.body` |  | Freihandel: {a} Material ergeben {b} EP, {c} EP ergeben {d} Material. Getauschte EP fehlen auf dem Weg zur nächsten Kartenwahl; unter den Stand der erreichten Stufe sinken sie nie. | Free trade: {a} material give {b} XP, {c} XP give {d} material. Swapped XP are missing on the way to the next card choice; they never drop below the level already reached. |
| `tip.tutorial.switch.body` |  | Schaltet die geführten ersten Schritte für diese Partie ein oder aus. Das Tutorial läuft auf jedem Schwierigkeitsgrad. | Turns the guided first steps on or off for this game. The tutorial works on every difficulty. |
| `tip.unit.body` |  | Wird sofort bezahlt und rückt mit der nächsten Welle aus. Höchstens {max} Einheiten pro Welle (Versorgungslimit). Die Welle verteilt sich automatisch auf die drei Lanes. Taste {k}. | Paid immediately; deploys with the next wave. At most {max} units per wave (supply cap). The wave spreads across the three lanes automatically. Key {k}. |
| `tip.variant.dur` |  | Dauer, das Gebäude ruht | Duration, the building rests |
| `tip.variant.kat` |  | Kategorie | Category |
| `tip.wave.rush` |  | Die Warteschlange rückt sofort als Welle aus, der Wellentakt beginnt neu. Danach {s} s Abklingzeit. | The queue marches out at once as a wave and the wave timer restarts. Then {s} s cooldown. |
| `tip.wave.rushEmpty` |  | Keine Einheiten in der Warteschlange. | No units in the queue. |
| `tip.weiter.many` |  | Ersetzt {n} Varianten (ohne Erstattung). | Replaces {n} variants (no refund). |
| `tip.weiter.none` |  | Ersetzt keine Variante. | Replaces no variant. |
| `tip.weiter.one` |  | Ersetzt 1 Variante (ohne Erstattung). | Replaces 1 variant (no refund). |
| `tip.world.body` |  | Klicke eine Parzelle im Reich, um dort zu bauen, oder die Mauer für Reparatur und Türme. Scrollen: Mausrad, Ziehen, Pfeiltasten oder A/D. | Click a plot in your realm to build there, or the wall for repairs and towers. Scroll: mouse wheel, drag, arrow keys or A/D. |
| `tip.world.title` |  | Spielwelt | World |
| `tip.zeughausMax` |  | Ohne Schmiede höchstens Stufe {n} (Zeughaus). | Without a smithy at most level {n} (armoury). |

## Hinweise

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `hint.buildings` |  | Neu: Schmiede, Kaserne, Universität und Kontor. Klicke einen freien Bauplatz an. | New: forge, barracks, university and trading house. Click a free plot. |
| `hint.buildings.karten` | karten | Neu: Schmiede, Kaserne, Universität und Kontor. Klicke einen freien Bauplatz an. | New: forge, barracks, university and trading post. Click a free plot. |
| `hint.demolish` |  | Abriss erstattet die Hälfte des Preises. Upgrades bleiben gespeichert. | Demolishing refunds half the price. Upgrades are kept. |
| `hint.disc.done` |  | Forschung fertig: {name}. | Research done: {name}. |
| `hint.disc.new` |  | Neu: {name}. | New: {name}. |
| `hint.kontor` |  | Das Handelskontor zahlt Zinsen auf dein Material, bis zu einem Deckel. | The trading house pays interest on your material, up to a cap. |
| `hint.kontor.karten` | karten | Das Handelskontor zahlt Zinsen auf dein Material, bis zu einem Deckel. | The trading post pays interest on your material, up to a cap. |
| `hint.neighbors` |  | Nachbarn zählen: Manche Gebäude wirken stärker neben bestimmten anderen. | Neighbours count: some buildings work better next to certain others. |
| `hint.ok` |  | Verstanden | Got it |
| `hint.research` |  | Die Universität forscht: Material und Zeit gegen dauerhafte Vorteile. | The university researches: material and time for permanent advantages. |
| `hint.research.karten` | karten | Die Universität forscht und wandelt auf Wunsch Materialertrag in EP um (Forschungsbudget). | The university researches and can turn material income into XP (research budget). |
| `hint.siege` |  | In einer Minute greift eine {x}-fach starke Belagerungswelle an. | In one minute a siege wave of {x}× strength attacks. |
| `hint.smithy` |  | Die Schmiede stärkt alle Einheiten. Jede Stufe kostet mehr als die vorige. | The forge strengthens all units. Each level costs more than the last. |
| `hint.title` |  | Hinweis | Hint |
| `hint.tower` |  | Türme schießen auf Gegner an der Mauer. Jeder Turm wird einzeln ausgebaut. | Towers shoot at enemies at the wall. Each tower is upgraded on its own. |
| `hint.variante` |  | Neu: Ein Gebäude lässt sich einmal zu einer Variante aufwerten. Klicke es an. | New: a building can be converted once into a variant. Click it. |
| `hint.wall` |  | Mauer und Tor halten den Gegner auf. Reparatur und Ausbau: Reiter Mauer & Türme. | Wall and gate hold the enemy off. Repair and upgrades: Wall & towers tab. |

## Tutorial

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `tut.ausruecken.narr` |  | Deine Einheiten rücken mit der nächsten Welle aus und treffen auf die Gegenseite. | Your units move out with the next wave and meet the other side. |
| `tut.ausruecken.task` |  | Sieh zu, wie sie ausrücken. | Watch them move out. |
| `tut.bauen.narr` |  | Deine Hände werden müde. Eine Fabrik fertigt weiter, während du anderes tust. | Your hands will tire. A factory keeps producing while you do other things. |
| `tut.bauen.narr.karten` | karten | Deine Hände werden müde. Eine Manufaktur fertigt weiter, während du anderes tust. | Your hands will tire. A manufactory keeps producing while you do other things. |
| `tut.bauen.task` |  | Baue eine Fabrik. | Build a factory. |
| `tut.bauen.task.karten` | karten | Baue eine Manufaktur. | Build a manufactory. |
| `tut.bye1` |  | Mauer, Türme, Schmiede, Universität – vieles wartet darauf, entdeckt zu werden. | Walls, towers, forge, university – much is waiting to be discovered. |
| `tut.bye1.karten` | karten | Mauer, Türme, Schmiede, Universität – alles steht bereit. Deine Karten weisen den Weg. | Walls, towers, forge, university – everything is ready. Your cards show the way. |
| `tut.bye2` |  | Was neu ist, ist markiert. Bewahre das Tor, Statthalter. | Whatever is new is marked. Look after the gate, governor. |
| `tut.fertigen.narr` |  | Ohne Material entsteht nichts. Fang mit eigener Hand an. | Without material, nothing gets built. Start with your own hands. |
| `tut.fertigen.task` |  | Klicke auf Fertigen. | Click Produce. |
| `tut.greet1` |  | Willkommen, Statthalter. Ich bin dein Quartiermeister. | Welcome, governor. I am your quartermaster. |
| `tut.greet2` |  | Aus dem Osten nähern sich Wellen. Unser Tor liegt in ihrem Weg. | Waves are approaching from the east. Our gate lies in their path. |
| `tut.karte.narr` |  | Die erste Welle ist bestanden. Aus jeder Lage lernen wir etwas. | The first wave is behind us. We learn something from every situation. |
| `tut.karte.task` |  | Wähle eine Karte. Sie verändert dein Reich. | Choose a card. It will change your realm. |
| `tut.more` |  | Klicken, um weiterzulesen | Click to read on |
| `tut.name` |  | Quartiermeister | Quartermaster |
| `tut.rekrutieren.narr` |  | Material allein trägt nicht weit. Wir brauchen Einheiten. | Material alone won't carry us far. We need units. |
| `tut.rekrutieren.task` |  | Stelle drei Läufer auf. | Raise three runners. |
| `tut.skip` |  | Überspringen | Skip |
| `tut.xpBounty` |  | +{n} Erfahrung | +{n} experience |

## Ereignisprotokoll

| Schlüssel | Modus | Deutsch | Englisch |
|---|---|---|---|
| `log.alarm` |  | Notaufgebot: Der Gegner wirft Reserven an die Front. | Last stand: the enemy throws its reserves into the fight. |
| `log.built` |  | {building} auf Bauplatz {slot} errichtet. | {building} built on plot {slot}. |
| `log.demolished` |  | {building} auf Bauplatz {slot} abgerissen, +{amount} Material. | {building} on plot {slot} demolished, +{amount} material. |
| `log.draft` |  | Gewählt: {name} (Stufe {tier}). | Chosen: {name} (tier {tier}). |
| `log.emergency` |  | Notreserve: Tor vollständig repariert. | Emergency reserve: gate fully repaired. |
| `log.firstWave` |  | Erste gegnerische Welle rückt aus. Die Vorschau am rechten Rand zeigt die nächste. | The first enemy wave advances. The preview on the right shows the next one. |
| `log.fluegel` |  | Flügel gewählt: {name} | Wing chosen: {name} |
| `log.hausDone` |  | Haupthaus ausgebaut: {name} | Main hall expanded: {name} |
| `log.hausStart` |  | Ausbau begonnen: {name} | Expansion started: {name} |
| `log.kompanie` |  | Söldnerkompanie rückt aus ({n} Einheiten) | Mercenary company marches out ({n} units) |
| `log.levelUp` |  | Stufe {n} erreicht. | Level {n} reached. |
| `log.lost` |  | Dein Tor ist gefallen. | Your gate has fallen. |
| `log.midRefill` |  | Die Mitte ist gefallen: Einheiten der äußeren Lanes besetzen sie neu. | The centre has fallen: units from the outer lanes take it over. |
| `log.newOption` |  | Neue Option: {name}. | New option: {name}. |
| `log.newTowerOption` |  | Neue Option: {name} (Turm {lane}). | New option: {name} ({lane} tower). |
| `log.research` |  | Erforscht: {name} (Stufe {tier}). | Researched: {name} (tier {tier}). |
| `log.siege` |  | Die Belagerungswelle greift an. Ab jetzt wird der Gegner jede Minute stärker. | The siege wave attacks. From now on the enemy grows stronger every minute. |
| `log.siegeWarning` |  | Belagerungswelle angekündigt: in einer Minute greift eine dreifach starke Welle an. | Siege wave announced: in one minute a triple-strength wave attacks. |
| `log.start` |  | Partie gestartet: {diff}. Die Front ist noch ruhig. | Game started: {diff}. The front is still quiet. |
| `log.turret` |  | Turm {lane} errichtet. | Tower ({lane}) built. |
| `log.unlocked` |  | {building} freigeschaltet. | {building} unlocked. |
| `log.unlockedKey` |  | {what} freigeschaltet. | {what} unlocked. |
| `log.variantDone` |  | {name} auf Platz {slot} ist fertig. | {name} on plot {slot} is ready. |
| `log.variantStart` |  | {building} auf Platz {slot} wird zu {name} aufgewertet. | {building} on plot {slot} is being converted to {name}. |
| `log.wallDown` |  | Mauer {lane} gefallen. Die Gegner dieser Lane ziehen zum Tor. | The {lane} wall has fallen. Enemies in that lane move on to the gate. |
| `log.weiter` |  | {building}: Weiterentwicklung {name} abgeschlossen ({n} Varianten ersetzt). | {building}: advancement {name} complete ({n} variants replaced). |
| `log.won` |  | Gegnerische Basis zerstört. | Enemy base destroyed. |

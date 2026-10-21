// Klammerfront – Reichweitentabelle Kartenpfad Teil 10 (REQ-K10.03): vorher (Teil 8) und nachher absolut und relativ zum Werfer R_W, mit Türmen und Lane-Länge.
// Aufruf: node tools/reichweiten-v10.mjs [--out reports/kartenpfad10-reichweiten.txt]
import { writeFileSync } from 'node:fs';
import { loadCore } from './load-core.mjs';
const core = loadCore(), C = core.KF_CONFIG;
const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, { pacing: 'karten' });
const RW = C.UNITS.werfer.range, VORHER = { werfer: RW, bogenschuetze: 137, armbrust: 158, katapult: 189, geschuetz: 231 };
const lane = C.LANE - C.PLAYER_BASE_WIDTH - C.ENEMY_BASE_WIDTH;
const f = x => String(Math.round(x)), r = x => x.toFixed(2).replace('.', ',');
let out = `Reichweiten Modus karten (R_W = Werfer = ${RW})\n\n| Einheit | Teil 8 absolut | Teil 8 relativ | Teil 10 absolut | Teil 10 relativ | Anteil der Lane (${lane}) | Gegner (Obergrenze ${C.TOWER_RANGE + C.PLAYER_TURRET.rangePerLevel}) |\n|---|---|---|---|---|---|---|\n`;
for (const id of ['werfer', 'bogenschuetze', 'armbrust', 'katapult', 'geschuetz']){
  const n = G.unitRange('p', id);
  out += `| ${id} | ${f(VORHER[id])} | ${r(VORHER[id] / RW)} | ${f(n)} | ${r(n / RW)} | ${Math.round(100 * n / lane)} % | ${f(G.unitRange('e', id))} |\n`;
}
out += `\nBauwerke und Maße\n\n| Größe | Wert |\n|---|---|\n| Grundreichweite eigener Türme | ${C.TOWER_RANGE} (+${C.PLAYER_TURRET.rangePerLevel} je Reichweitenstufe) |\n| Grundreichweite gegnerischer Turm (Basis) | ${C.ENEMY_TURRET.range} |\n| Länge einer Lane | ${C.LANE} (zwischen den Basisrändern ${lane}) |\n| Breite eigene / gegnerische Basis | ${C.PLAYER_BASE_WIDTH} / ${C.ENEMY_BASE_WIDTH} |\n| Nahkampf-Reichweite | ${C.MELEE_REACH} |\n`;
out += `\nHerkunft der Geschützreichweite 231 (Teil 8): reiner Grundwert 2,2 · ${RW} = ${Math.round(2.2 * RW)}; kein Ausbau und keine Karte war enthalten. Reichweitenwirksame Boni auf Einheiten: nur die Karte Lange Wurfarme (Stat werferRange, +25/+50, nur Werfer und Bogenschütze, additiv); Schmiede-Stufen, Ausbauten und Bastion ändern keine Einheitenreichweite.\n`;
if (process.argv.includes('--out')) writeFileSync(process.argv[process.argv.indexOf('--out') + 1], out); else console.log(out);

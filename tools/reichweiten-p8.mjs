// Klammerfront – Reichweiten aller Einheiten und Türme (Teil 8, REQ-K8.01, K8.05): heutige Grundreichweiten, Vorgabe der Leiter, Vergleich mit den Türmen.
// Aufruf: node tools/reichweiten-p8.mjs
import { loadCore } from './load-core.mjs';
const C = loadCore().KF_CONFIG;
const RW = C.UNITS.werfer.range;
const LEITER = [['werfer', 1], ['bogenschuetze', 1.3], ['armbrust', 1.5], ['katapult', 1.8], ['geschuetz', 2.2]];
const f0 = x => Math.round(x * 10) / 10;
console.log(`Grundreichweiten (R_W = Werfer = ${RW}); Türme: eigener Turm ${C.TOWER_RANGE} (+${C.PLAYER_TURRET.rangePerLevel} je Ausbaustufe), gegnerischer Turm ${C.ENEMY_TURRET.range}, Nahkampf ${C.MELEE_REACH}\n`);
console.log('| Einheit | heute | Vorgabe K8.05 | Faktor | gegenüber eigenem Turm (Grundreichweite) | gegenüber gegnerischem Turm |\n|---|---|---|---|---|---|');
for (const [id, fak] of LEITER){
  const heute = C.UNITS[id].range, neu = Math.max(heute, f0(RW * fak));
  console.log(`| ${id} | ${heute} | ${f0(RW * fak)}${neu !== f0(RW * fak) ? ' (heute höher: ' + neu + ')' : ''} | ${fak} | ${neu > C.TOWER_RANGE ? '+' : ''}${f0(neu - C.TOWER_RANGE)} | ${neu > C.ENEMY_TURRET.range ? '+' : ''}${f0(neu - C.ENEMY_TURRET.range)} |`);
}
console.log('\nAndere Einheiten (Nahkampf, Reichweite bis ' + C.RANGED_MIN_RANGE + ' zählt nicht als Fernkampf):');
for (const [id, u] of Object.entries(C.UNITS)) if (!LEITER.some(([k]) => k === id)) console.log(`  ${id}: ${u.range}`);
console.log(`\nWirkungen auf die Reichweite: Karte Lange Wurfarme +25/+50 (nur Werfer und Bogenschütze), Karte Turmschule ×1,2/×1,45/×1,7 (nur eigene Türme), Kartenbonus towerRange ×1,25/×1,5 (nur eigene Türme); Ausbau „Reichweite“ der Türme +${C.PLAYER_TURRET.rangePerLevel} je Stufe.`);
console.log(`Gegner heute: Läufer (Nahkampf) und Werfer (${RW}); der gegnerische Turm (${C.ENEMY_TURRET.range}) liegt unter dem Werfer.`);

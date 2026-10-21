// Klammerfront – Tabelle der Einheitentexte mit belegenden Werten (Kartenpfad Teil 10, REQ-K10.02).
// Aufruf: node tools/einheitentabelle-v10.mjs [--lang de]
import { loadCore, loadI18n } from './load-core.mjs';
const lang = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'de';
const core = loadCore(), I = loadI18n()[lang], U = core.KF_CONFIG.UNITS;
const G = core.KlammerCore.create(); G.FX.on = false; G.newGame('normal', 7, { pacing: 'karten' });
const ids = Object.keys(U), rank = (key, id, desc = false) => { const s = [...ids].sort((a, b) => desc ? U[b][key] - U[a][key] : U[a][key] - U[b][key]); return s.indexOf(id) + 1; };
const dps = id => U[id].dmg / U[id].cd, rankDps = id => [...ids].sort((a, b) => dps(b) - dps(a)).indexOf(id) + 1;
console.log('| Einheit | Text | Werte (Rang von 9) |\n|---|---|---|');
for (const id of ids){
  const u = U[id], r = G.baseRange(id);
  console.log(`| ${I[`unit.${id}.name`]} | ${I[`unit.${id}.desc`]} | Kosten ${u.cost} (Rang ${rank('cost', id)} von unten) · Lebenspunkte ${u.hp} (Rang ${rank('hp', id, true)} von oben) · Schaden je s ${dps(id).toFixed(1)} (Rang ${rankDps(id)}) · Schaden je Schuss ${u.dmg} · Reichweite ${r} · Tempo ${u.speed} (Rang ${rank('speed', id)} von unten)${u.versorgung ? ' · Versorgung ' + u.versorgung : ''}${u.baseMult ? ' · Basisschaden ×' + u.baseMult : ''} |`);
}

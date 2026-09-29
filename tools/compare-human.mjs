// Klammerfront – Spieltest-Auswertung (REQ-5.11).
// Liest Sitzungsprotokolle (index.html?debug=1 → „Protokoll“) und ordnet jede Partie dem nächstliegenden Bot-Profil aus tools/sim-bot.mjs zu.
// Aufruf:  node tools/compare-human.mjs protokoll1.json [protokoll2.json …] [--json ergebnis.json]
// Merkmale je Partie: Klicks je Sekunde, Reaktionsintervall (Median der Abstände zwischen Handlungen), größte Zahl eigener Einheiten
// (Feld und Warteschlange), Mauernutzung (Reparatur oder Mauer-/Turmausbau). Abstand je Profil: Klick- und Reaktionswerte logarithmisch,
// Einheitenlimit linear (je 10 Einheiten 1), Mauernutzung 0,5 bei Abweichung. Die Partie gehört zum Profil mit dem kleinsten Abstand.
import { readFileSync, writeFileSync } from 'node:fs';
import { PROFILES } from './sim-bot.mjs';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const out = jsonAt >= 0 ? args.splice(jsonAt, 2)[1] : null;
if (!args.length){ console.log('Aufruf: node tools/compare-human.mjs protokoll.json [...] [--json ergebnis.json]'); process.exit(1); }

const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
/* Merkmale einer Partie aus dem Protokoll */
export function features(p){
  const dur = Math.max(1, p.durationS);
  const times = [...new Set(p.actions.filter(a => a.kind !== 'chooseDraft').map(a => a.t))].sort((a, b) => a - b);
  const gaps = times.slice(1).map((t, i) => t - times[i]).filter(g => g > 0);
  return { cps: p.clicks / dur, reaction: median(gaps) ?? dur, cap: p.maxUnits, wall: (p.wallUse.repairs + p.wallUse.upgrades) > 0 };
}
export function distance(f, prof){
  const lg = x => Math.log(Math.max(0.05, x));
  return Math.abs(lg(f.cps) - lg(prof.cps)) + Math.abs(lg(f.reaction) - lg(prof.every)) + Math.abs(f.cap - prof.cap) / 10 + (f.wall !== !!prof.useWall ? 0.5 : 0);
}
export function nearest(f){
  const ranked = Object.entries(PROFILES).map(([name, prof]) => ({ name, d: distance(f, prof) })).sort((a, b) => a.d - b.d);
  return { profile: ranked[0].name, ranked };
}

const rows = [];
for (const file of args){
  const p = JSON.parse(readFileSync(file, 'utf8'));
  if (p.format !== 'klammerfront-session'){ console.log(`${file}: kein Sitzungsprotokoll`); continue; }
  const f = features(p), n = nearest(f);
  rows.push({ file, diff: p.diff, result: p.result, durationS: p.durationS, ...f, profile: n.profile, distances: Object.fromEntries(n.ranked.map(r => [r.name, +r.d.toFixed(3)])) });
  console.log(`${file}\n  ${p.diff}, ${p.result} nach ${Math.floor(p.durationS / 60)}:${String(Math.round(p.durationS % 60)).padStart(2, '0')} · ` +
    `${f.cps.toFixed(2)} Klicks/s · Reaktion ${f.reaction.toFixed(2)} s · bis ${f.cap} Einheiten · Mauer ${f.wall ? 'ja' : 'nein'}\n` +
    `  → nächstes Bot-Profil: ${n.profile} (Abstände: ${n.ranked.map(r => `${r.name} ${r.d.toFixed(2)}`).join(', ')})`);
}
if (out) writeFileSync(out, JSON.stringify(rows, null, 2));

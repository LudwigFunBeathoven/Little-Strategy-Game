// Klammerfront – Spieltest-Auswertung (REQ-5.11).
// Liest Sitzungsprotokolle (index.html?debug=1 → „Protokoll“) und ordnet jede Partie dem nächstliegenden Bot-Profil aus tools/sim-bot.mjs zu.
// Aufruf:  node tools/compare-human.mjs protokoll1.json [protokoll2.json …] [--json ergebnis.json]
// Merkmale je Partie: Klicks je Sekunde, Reaktionsintervall (Median der Abstände zwischen Handlungen), größte Zahl eigener Einheiten
// (Feld und Warteschlange), Mauernutzung (Reparatur oder Mauer-/Turmausbau). Abstand je Profil: Klick- und Reaktionswerte logarithmisch,
// Einheitenlimit linear (je 10 Einheiten 1), Mauernutzung 0,5 bei Abweichung. Die Partie gehört zum Profil mit dem kleinsten Abstand.
// Strategie (REQ-6.09): Anteil der Einheitenkäufe an allen Handlungen der ersten SIM_STYLE_WINDOW_S Sekunden (Kauf, Bau, Ausbau, Forschung,
// Reparatur). Die Partie gehört zur Strategie mit dem nächstliegenden Median aus der Simulation (STYLE_REF, Serie I6.0, alle Profile außer passiv).
// Tutorial (REQ-T.07): Das Protokoll enthält tutorial { stepTimes, skipped, skippedAt, misclicks }. Je Partie werden Schrittzeiten, Überspringen und
// Fehlklicks (Klicks außerhalb des hervorgehobenen Ziels) ausgegeben, am Ende je Schritt der Median der Dauer und die Summe der Fehlklicks.
// Lange Schrittzeiten und viele Fehlklicks zeigen, wo Spieler hängen bleiben.
import { readFileSync, writeFileSync } from 'node:fs';
import { PROFILES, CONFIG as C } from './sim-bot.mjs';

/* Median-Anteil der Einheitenkäufe je Strategie aus der Basisserie I6.0 (reports/i6-basis-ziele.json, strategies.*.unitShare) */
export const STYLE_REF = { gierig: 0.63, 'einheiten-zuerst': 0.74 };

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
  const early = p.actions.filter(a => a.t <= C.SIM_STYLE_WINDOW_S && ['spawn', 'buildAt', 'buy', 'startResearch', 'repair'].includes(a.kind));
  const unitShare = early.length ? early.filter(a => a.kind === 'spawn').length / early.length : null;
  return { cps: p.clicks / dur, reaction: median(gaps) ?? dur, cap: p.maxUnits, wall: (p.wallUse.repairs + p.wallUse.upgrades) > 0, unitShare };
}
export function distance(f, prof){
  const lg = x => Math.log(Math.max(0.05, x));
  return Math.abs(lg(f.cps) - lg(prof.cps)) + Math.abs(lg(f.reaction) - lg(prof.every)) + Math.abs(f.cap - prof.cap) / 10 + (f.wall !== !!prof.useWall ? 0.5 : 0);
}
export function nearest(f){
  const ranked = Object.entries(PROFILES).map(([name, prof]) => ({ name, d: distance(f, prof) })).sort((a, b) => a.d - b.d);
  return { profile: ranked[0].name, ranked };
}
export function nearestStrategy(f){
  if (f.unitShare == null) return { strategy: null, ranked: [] };
  const ranked = Object.entries(STYLE_REF).map(([name, v]) => ({ name, d: Math.abs(f.unitShare - v) })).sort((a, b) => a.d - b.d);
  return { strategy: ranked[0].name, ranked };
}

/* Tutorial: Dauer je Schritt = Abstand zum zuletzt erledigten Schritt (Schritte können in anderer Reihenfolge erledigt werden), Fehlklicks je Schritt */
export const TUTORIAL_STEPS = ['fertigen', 'bauen', 'rekrutieren', 'ausruecken', 'sieg'];
export function tutorialFeatures(p){
  const t = p.tutorial;
  if (!t || (!Object.keys(t.stepTimes || {}).length && !t.skipped && !t.completed)) return null;
  let prev = 0; const dur = {};
  for (const id of TUTORIAL_STEPS){ const x = t.stepTimes[id]; if (x != null){ dur[id] = +Math.max(0, x - prev).toFixed(1); prev = Math.max(prev, x); } }
  const slowest = Object.entries(dur).sort((a, b) => b[1] - a[1])[0];
  return { dur, misclicks: t.misclicks || {}, skipped: !!t.skipped, skippedAt: t.skippedAt || null, completed: !!t.completed,
           slowest: slowest ? slowest[0] : null, totalS: Math.max(0, ...Object.values(t.stepTimes || {})) };
}

const rows = [];
for (const file of args){
  const p = JSON.parse(readFileSync(file, 'utf8'));
  if (p.format !== 'klammerfront-session'){ console.log(`${file}: kein Sitzungsprotokoll`); continue; }
  const f = features(p), n = nearest(f), st = nearestStrategy(f);
  const tut = tutorialFeatures(p);
  rows.push({ file, diff: p.diff, result: p.result, durationS: p.durationS, ...f, profile: n.profile, strategy: st.strategy, tutorial: tut,
              distances: Object.fromEntries(n.ranked.map(r => [r.name, +r.d.toFixed(3)])) });
  console.log(`${file}\n  ${p.diff}, ${p.result} nach ${Math.floor(p.durationS / 60)}:${String(Math.round(p.durationS % 60)).padStart(2, '0')} · ` +
    `${f.cps.toFixed(2)} Klicks/s · Reaktion ${f.reaction.toFixed(2)} s · bis ${f.cap} Einheiten · Mauer ${f.wall ? 'ja' : 'nein'}\n` +
    `  → nächstes Bot-Profil: ${n.profile} (Abstände: ${n.ranked.map(r => `${r.name} ${r.d.toFixed(2)}`).join(', ')})\n` +
    `  → nächste Strategie: ${st.strategy ?? '–'} (Einheitenkäufe ${f.unitShare == null ? '–' : Math.round(100 * f.unitShare) + ' %'} der Handlungen in den ersten ${C.SIM_STYLE_WINDOW_S} s; ` +
    `Referenz ${Object.entries(STYLE_REF).map(([k, v]) => `${k} ${Math.round(100 * v)} %`).join(', ')})`);
  if (tut){
    const mm = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    console.log('  → Tutorial: ' + (tut.skipped ? `übersprungen in Schritt „${tut.skippedAt}“; ` : tut.completed ? `abgeschlossen nach ${mm(tut.totalS)}; ` : 'nicht beendet; ') +
      TUTORIAL_STEPS.filter(id => tut.dur[id] != null).map(id => `${id} ${tut.dur[id]} s${tut.misclicks[id] ? ` (${tut.misclicks[id]} Fehlklicks)` : ''}`).join(' · ') + (tut.slowest ? `; längster Schritt: ${tut.slowest}` : ''));
  }
}
// Zusammenfassung über alle Partien mit Tutorial (REQ-T.07)
const tuts = rows.filter(r => r.tutorial);
if (tuts.length > 1 || (tuts.length === 1 && rows.length > 1)){
  const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  console.log(`\nTUTORIAL über ${tuts.length} Partien: übersprungen ${tuts.filter(r => r.tutorial.skipped).length}, abgeschlossen ${tuts.filter(r => r.tutorial.completed).length}`);
  for (const id of TUTORIAL_STEPS){
    const d = tuts.map(r => r.tutorial.dur[id]).filter(x => x != null), m = tuts.reduce((s, r) => s + (r.tutorial.misclicks[id] || 0), 0), sk = tuts.filter(r => r.tutorial.skippedAt === id).length;
    console.log(`  ${id.padEnd(12)} Median ${d.length ? med(d) + ' s' : '–'} · Fehlklicks ${m} · dort übersprungen ${sk}`);
  }
}
if (out) writeFileSync(out, JSON.stringify(rows, null, 2));

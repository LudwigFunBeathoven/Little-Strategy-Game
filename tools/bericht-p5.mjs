// Klammerfront – Tabellen für docs/bericht-kartenpfad-5.md aus den Rohdaten der Messungen (Markdown auf stdout).
// Aufruf: node tools/bericht-p5.mjs --vorher reports/kartenpfad5-basis-felder.json --nachher reports/kartenpfad5-nachher-felder.json [--budget reports/kartenpfad5-budget.json]
//           [--linien-vorher reports/kartenpfad5-basis-linien.json] [--linien reports/kartenpfad5-linien.json] [--doktrin reports/kartenpfad5-doktrin-normal.json]
import { readFileSync, existsSync } from 'node:fs';
const arg = (n, d = null) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const load = f => f && existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
const V = load(arg('vorher')), N = load(arg('nachher')), B = load(arg('budget')), LV = load(arg('linien-vorher')), L = load(arg('linien')), D = load(arg('doktrin'));
const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const f0 = x => x == null ? '–' : String(Math.round(x));
const pc1 = v => v == null ? '–' : (100 * v).toFixed(1).replace('.', ',') + ' %';
const field = (d, diff, prof, arm) => d.felder.find(f => f.diff === diff && f.profile === prof && (arm === undefined || f.arm === arm));
const out = [], p = s => out.push(s);

if (V && N){
  p('### Felder: Siegquote, Dauer, Wahlen, längste Lücke (schneller Bot, 50 Partien je Feld) – vorher → nachher\n');
  p('| Grad | Profil | Siege | Dauer Median | Wahlen Median | längste Lücke Median / P90 (s) |');
  p('|---|---|---|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, diff, prof), b = field(N, diff, prof);
    p(`| ${diff} | ${prof} | ${f0(a.siegquote)} → ${f0(b.siegquote)} % | ${mm(a.dauerMedian)} → ${mm(b.dauerMedian)} | ${a.wahlenMedian} → ${b.wahlenMedian} | ${f0(a.lueckeMedian)} / ${f0(a.lueckeP90)} → ${f0(b.lueckeMedian)} / ${f0(b.lueckeP90)} |`);
  }
  p('\n### EP je Minute (Median) und Anteil der EP-Quellen – nachher\n');
  p('| Grad | Profil | 0–4 min | 4–8 min | 8–12 min | 12+ min | Abschüsse | Türme | Basisschaden | abgewehrte Wellen |');
  p('|---|---|---|---|---|---|---|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const b = field(N, diff, prof), q = b.quellen;
    p(`| ${diff} | ${prof} | ${b.epMin.map(e => f1(e.median)).join(' | ')} | ${pc1(q.kill)} | ${pc1(q.tower)} | ${pc1(q.base)} | ${pc1(q.wave)} |`);
  }
  p('\n### EP je Minute (Median) – vorher (Stand nach Teil 4)\n');
  p('| Grad | Profil | 0–4 min | 4–8 min | 8–12 min | 12+ min |');
  p('|---|---|---|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, diff, prof);
    p(`| ${diff} | ${prof} | ${a.epMin.map(e => f1(e.median)).join(' | ')} |`);
  }
}
if (B){
  p('\n### Forschungsbudget: 0 %, 25 %, 50 % (Normal, 50 Partien je Arm, gleiche Seeds)\n');
  p('| Profil | Budget | Siege | Dauer Median | Wahlen Median (Mittel) | Differenz Wahlen | EP aus Budget |');
  p('|---|---|---|---|---|---|---|');
  for (const prof of ['aktiv', 'durchschnitt']) for (const arm of [0, 1, 2]){
    const x = field(B, 'normal', prof, arm), base = field(B, 'normal', prof, 0);
    if (!x) continue;
    p(`| ${prof} | ${[0, 25, 50][arm]} % | ${f0(x.siegquote)} % | ${mm(x.dauerMedian)} | ${x.wahlenMedian} (${f1(x.wahlenMittel)}) | ${arm ? '+' + (x.wahlenMedian - base.wahlenMedian) : '–'} | ${pc1(x.quellen.budget)} |`);
  }
}
if (L){
  p('\n### Linien-Bots (Normal, durchschnitt, 50 Partien je Zeile)' + (LV ? ' – vorher (Teil 4, nur `druck=hoch`) und nachher\n' : '\n'));
  p('| Bot | Druck | Siege | Dauer Median | Stufe 1 / 2 / 3 (Median) | Fabriken ohne Variante, Minute 10 (Median) |');
  p('|---|---|---|---|---|---|');
  for (const r of L.linien){
    const st = r.stufeAllLines && r.linie !== 'ohne' ? r.stufeAllLines[r.linie].map(s => s.anteil ? `${mm(s.median)} (${Math.round(100 * s.anteil)} %)` : '–').join(' / ') : '–';
    const v = LV && LV.linien.find(x => x.linie === r.linie && x.druck === r.druck);
    p(`| ${r.linie} | ${r.druck} | ${v ? f0(v.siegquote) + ' → ' : ''}${f0(r.siegquote)} % | ${v ? mm(v.dauerMedian) + ' → ' : ''}${mm(r.dauerMedian)} | ${st} | ${r.fabrikenOhneVarianteMedian ? r.fabrikenOhneVarianteMedian[600] : '–'} |`);
  }
  p('\n### Varianten je Linien-Bot (Anteil der Partien mit mindestens einer fertigen Variante dieses Typs)\n');
  for (const r of L.linien) if (r.linie !== 'ohne' && r.druck === 'aus') p(`- **${r.linie}**: ${Object.entries(r.varianten).map(([k, v]) => `${k} ${Math.round(100 * v)} %`).join(', ')}`);
  if (L.varianteVerteilung) p(`\nVerteilung aller Aufwertungen (${L.varianteVerteilung.gesamt} fertige Varianten, alle Bots): ${Object.entries(L.varianteVerteilung.anteilProzent).map(([k, v]) => `${k} ${f1(v)} %`).join(', ')}. Größter Anteil einer Grundvariante: ${f1(L.varianteVerteilung.groessteGrundvariante)} %.`);
}
if (D && D.doktrin){
  p('\n### Doktrinen im Paarvergleich (' + (D.label || '') + ')\n');
  p('| Doktrin | Linie | Siege mit / ohne | Dauer Median mit / ohne | Wahlen Median mit / ohne | Mauer-Verlust mit / ohne | Turm-Abschüsse mit / ohne | Sonderbau gebaut |');
  p('|---|---|---|---|---|---|---|---|');
  for (const r of D.doktrin) p(`| ${r.doktrin} | ${r.linie} | ${f0(r.mit)} % / ${f0(r.ohne)} % | ${mm(r.dauerMit)} / ${mm(r.dauerOhne)} | ${r.wahlenMit ?? '–'} / ${r.wahlenOhne ?? '–'} | ${r.mauerMit ?? '–'} / ${r.mauerOhne ?? '–'} | ${r.turmMit ?? '–'} / ${r.turmOhne ?? '–'} | ${r.sonderbauGebaut == null ? '–' : f0(r.sonderbauGebaut) + ' %'} |`);
  if (D.alle){
    p('\nAngebote mit Doktrin je Partie (alle sechs im Pool, Linien-Bot):\n');
    p('| Linie | Angebote Median (Mittel) | Doktrinen gewählt (Mittel) | erste Doktrin in Wahl (Median) |');
    p('|---|---|---|---|');
    for (const r of D.alle) p(`| ${r.linie} | ${r.angeboteMedian} (${f1(r.angeboteMittel)}) | ${f1(r.gewaehltMittel)} | ${r.ersteWahlMedian ?? '–'} |`);
  }
}
console.log(out.join('\n'));

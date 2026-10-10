// Klammerfront – Tabellen für docs/bericht-kartenpfad-4.md aus den Rohdaten der Messungen (Markdown auf stdout).
// Aufruf: node tools/bericht-p4.mjs --vorher reports/kartenpfad4-basis.json --nachher reports/kartenpfad4-nachher.json [--linien reports/kartenpfad4-linien.json] [--schluessel reports/kartenpfad4-schluessel.json]
//                                  [--bildzeit-vorher …] [--bildzeit-nachher …]
import { readFileSync, existsSync } from 'node:fs';
const arg = (n, d = null) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const load = f => f && existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
const V = load(arg('vorher')), N = load(arg('nachher')), L = load(arg('linien')), K = load(arg('schluessel')), BV = load(arg('bildzeit-vorher')), BN = load(arg('bildzeit-nachher'));
const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const Z = [90, 160, 225, 290, 355, 420, 485, 550, 615, 680, 745, 810];
const field = (d, diff, prof) => d.felder.find(f => f.diff === diff && f.profile === prof);
const out = [];
const p = s => out.push(s);

if (V && N){
  p('### Felder: Siegquote, Dauer, Wahlen (schneller Bot, 50 Partien je Feld) – vorher → nachher\n');
  p('| Grad | Profil | Siege | Niederlagen | offen (Patt) | Dauer Median | Wahlen Median |');
  p('|---|---|---|---|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, diff, prof), b = field(N, diff, prof);
    p(`| ${diff} | ${prof} | ${f1(a.siegquote)} → ${f1(b.siegquote)} % | ${f1(a.niederlagen)} → ${f1(b.niederlagen)} % | ${f1(a.patt)} → ${f1(b.patt)} % | ${mm(a.dauerMedian)} → ${mm(b.dauerMedian)} | ${a.wahlenMedian} → ${b.wahlenMedian} |`);
  }
  p('\n### Fabriken im Raster (Mittel von neun Plätzen; Median in Klammern) – vorher → nachher, Normal\n');
  p('| Profil | Minute 2 | Minute 5 | Minute 10 | Anteil an den Gebäuden, Minute 10 |');
  p('|---|---|---|---|---|');
  for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, 'normal', prof), b = field(N, 'normal', prof);
    const c = t => `${f1(a.fabrikenMittel[t])} (${a.fabrikenMedian[t]}) → ${f1(b.fabrikenMittel[t])} (${b.fabrikenMedian[t]})`;
    p(`| ${prof} | ${c(120)} | ${c(300)} | ${c(600)} | ${Math.round(100 * a.fabrikAnteilGebaeude[600])} → ${Math.round(100 * b.fabrikAnteilGebaeude[600])} % |`);
  }
  p('\n### Seltene und legendäre Karten je Partie (Median; Mittel in Klammern) – vorher → nachher, angeboten / gewählt\n');
  p('| Grad | Profil | selten angeboten | selten gewählt | legendär angeboten | legendär gewählt |');
  p('|---|---|---|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, diff, prof), b = field(N, diff, prof);
    p(`| ${diff} | ${prof} | ${f1(a.seltenAngeboten)} (${f1(a.seltenAngebotenMittel)}) → ${f1(b.seltenAngeboten)} (${f1(b.seltenAngebotenMittel)}) | ${f1(a.seltenGewaehlt)} (${f1(a.seltenGewaehltMittel)}) → ${f1(b.seltenGewaehlt)} (${f1(b.seltenGewaehltMittel)}) | ${f1(a.legendaerAngeboten)} (${f1(a.legendaerAngebotenMittel)}) → ${f1(b.legendaerAngeboten)} (${f1(b.legendaerAngebotenMittel)}) | ${f1(a.legendaerGewaehlt)} (${f1(a.legendaerGewaehltMittel)}) → ${f1(b.legendaerGewaehlt)} (${f1(b.legendaerGewaehltMittel)}) |`);
  }
  p('\n### Verlorene Lebenspunkte der Mauer je Partie (Mittel; Median) – vorher → nachher\n');
  p('| Grad | Profil | Mauer-Verlust |');
  p('|---|---|---|');
  for (const diff of ['leicht', 'normal', 'schwer']) for (const prof of ['aktiv', 'durchschnitt', 'gelegentlich']){
    const a = field(V, diff, prof), b = field(N, diff, prof);
    p(`| ${diff} | ${prof} | ${Math.round(a.mauerVerlustMittel)} (${a.mauerVerlustMedian}) → ${Math.round(b.mauerVerlustMittel)} (${b.mauerVerlustMedian}) |`);
  }
  // Wahlzeiten Schwer
  const dev = (d, diff, prof) => { const rows = d.roh.filter(g => g.suite === 'felder' && g.diff === diff && g.profile === prof), o = []; for (let n = 1; n <= 10; n++){ const ts = rows.map(g => (g.wahlen.find(w => w.n === n) || {}).t).filter(x => x != null); if (ts.length < rows.length / 2) break; o.push(Math.round(med(ts) - Z[n - 1])); } return o; };
  p('\n### Abweichung der Wahlzeit vom Fahrplan (Median − Zielzeit in Sekunden, Wahl 1, 2, 3 …)\n');
  p('| Feld | vorher | nachher |');
  p('|---|---|---|');
  for (const [diff, prof] of [['schwer', 'durchschnitt'], ['schwer', 'gelegentlich'], ['schwer', 'aktiv'], ['normal', 'durchschnitt'], ['leicht', 'durchschnitt']]) p(`| ${diff} / ${prof} | ${dev(V, diff, prof).join(', ')} | ${dev(N, diff, prof).join(', ')} |`);
  if (V.gierig && N.gierig) p(`\n„gierig“ (Normal, durchschnitt, ${N.gierig.n} Partien): Siege ${f1(V.gierig.siegquote)} → ${f1(N.gierig.siegquote)} %, Dauer Median ${mm(V.gierig.dauerMedian)} → ${mm(N.gierig.dauerMedian)}, Fabriken Minute 10 ${f1(V.gierig.fabrikenMittel[600])} → ${f1(N.gierig.fabrikenMittel[600])}.`);
}
if (L){
  p('\n### Linien-Bots (Normal, durchschnitt, 50 Partien je Zeile)\n');
  p('| Bot | Druck | Siege | Niederlagen | Patt | Dauer Median | Stufe 1 | Stufe 2 | Stufe 3 | Schlüsselkarten-Angebote (Median) | gewählt (Mittel) | Mauer-Verlust (Mittel) | Turm-Abschüsse | Gegenstöße |');
  p('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of L.linien){
    const st = k => r.stufeMedian ? `${Math.round(100 * r.stufeAnteil[k])} % ${mm(r.stufeMedian[k])}` : '–';
    p(`| ${r.linie} | ${r.druck} | ${f1(r.siegquote)} % | ${f1(r.niederlagen)} % | ${f1(r.patt)} % | ${mm(r.dauerMedian)} | ${st(0)} | ${st(1)} | ${st(2)} | ${r.keyOffersMedian} | ${f1(r.keyPickedMittel)} | ${Math.round(r.mauerVerlustMittel)} | ${f1(r.towerKills)} | ${f1(r.counterWaves)} |`);
  }
  p('\nFabriken ohne Variante am Raster (Mittel von neun Plätzen):\n');
  p('| Bot | Druck | Minute 5 | Minute 10 | Varianten je Partie | Anteil der Partien mit … |');
  p('|---|---|---|---|---|---|');
  for (const r of L.linien) p(`| ${r.linie} | ${r.druck} | ${f1(r.fabrikenOhneVariante['300'])} | ${f1(r.fabrikenOhneVariante['600'])} | ${f1(r.variantenAnzahlMittel)} | ${Object.entries(r.varianten).map(([k, v]) => `${k} ${Math.round(100 * v)} %`).join(', ') || '–'} |`);
  const aus = L.linien.filter(r => r.druck === 'aus' && r.linie !== 'ohne').map(r => r.siegquote), hoch = L.linien.filter(r => r.druck === 'hoch' && r.linie !== 'ohne').map(r => r.siegquote);
  p(`\nSpannweite der Siegquoten der drei Linien-Bots: ohne Schalter ${f1(Math.max(...aus) - Math.min(...aus))} pp, mit \`druck=hoch\` ${f1(Math.max(...hoch) - Math.min(...hoch))} pp (Hypothese ≤ 20).`);
}
if (K){
  p('\n### Schlüsselkarten: Paarvergleich (Linien-Bot mit und ohne die Karte, Normal, durchschnitt, `druck=hoch`)\n');
  p('| Karte | Linie | Siege mit | Siege ohne | Differenz | in Partien gewählt | Siege, wenn gewählt (Differenz) | Dauer Median mit / ohne |');
  p('|---|---|---|---|---|---|---|---|');
  for (const r of K.schluessel) p(`| ${r.card} | ${r.linie} | ${f1(r.mit)} % | ${f1(r.ohne)} % | ${r.differenz > 0 ? '+' : ''}${f1(r.differenz)} pp | ${f1(r.gewaehltAnteil)} % | ${r.siegeWennGewaehlt == null ? '–' : f1(r.siegeWennGewaehlt) + ' % (' + (r.differenzWennGewaehlt > 0 ? '+' : '') + f1(r.differenzWennGewaehlt) + ' pp)'} | ${mm(r.dauerMit)} / ${mm(r.dauerOhne)} |`);
}
if (BV && BN){
  p('\n### Bildzeit im Browser (headless Chromium ohne Grafikkarte; nur berichten)\n');
  p('| Einheiten | Zeichnen vorher / nachher | Tick vorher / nachher |');
  p('|---|---|---|');
  BV.rows.forEach((a, i) => { const b = BN.rows[i]; p(`| ${a.einheiten} / ${b.einheiten} | ${a.zeichnenMs} / ${b.zeichnenMs} ms | ${a.tickMs} / ${b.tickMs} ms |`); });
}
console.log(out.join('\n'));

// Klammerfront – Tabellen und Grafik für den Bericht Kartenpfad Teil 3 aus reports/kartenpfad3-nach.json (Ausgabe von tools/sim-p3.mjs).
// Aufruf:  node tools/bericht-p3.mjs [reports/kartenpfad3-nach.json] [docs/bilder/kartenpfad3-wahlzeiten.svg]
// Schreibt die Grafik (Fahrplan gegen gemessenen Median je Profil, Normal) und gibt die Tabellen als Markdown aus.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const IN = process.argv[2] || 'reports/kartenpfad3-nach.json', OUT = process.argv[3] || 'docs/bilder/kartenpfad3-wahlzeiten.svg';
const R = JSON.parse(readFileSync(IN, 'utf8'));
if (!R.pfadIds){ const { loadCore } = await import('./load-core.mjs'); R.pfadIds = loadCore().KF_PFAD.karten.map(k => k.id); }
const mm = t => t == null || !Number.isFinite(t) ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const sgn = (a, b) => a == null ? '–' : `${a - b >= 0 ? '+' : '−'}${Math.abs(Math.round(a - b))} s`;
const pct = v => v == null ? '–' : `${v.toFixed(0)} %`;

/* ---------- Tabellen ---------- */
const out = [];
out.push('### Felder (Strategie einheiten-zuerst, ' + R.runs + ' Partien je Feld)\n');
out.push('| Grad | Profil | Siege | Niederlagen | offen | Dauer Median | Dauer P90 | Wahlen (Median) | Abstände 45–100 s |');
out.push('|---|---|---|---|---|---|---|---|---|');
for (const f of R.felder) out.push(`| ${f.diff} | ${f.profile} | ${pct(f.siegquote)} | ${pct(f.niederlagen)} | ${pct(f.patt)} | ${mm(f.dauerMedian)} | ${mm(f.dauerP90)} | ${f.wahlenMedian} | ${f.abstandAnteil == null ? '–' : (100 * f.abstandAnteil).toFixed(1) + ' %'} |`);
out.push('\n### Wahlzeiten je Feld (Median, Abweichung zur Zielzeit)\n');
out.push('| Feld | ' + R.ziele.slice(0, 11).map((z, k) => `W${k + 1} (${mm(z)})`).join(' | ') + ' |');
out.push('|---|' + '---|'.repeat(11));
for (const f of R.felder) out.push(`| ${f.diff}/${f.profile} | ` + f.wahl.slice(0, 11).map(w => w.median == null ? '–' : `${mm(w.median)} (${sgn(w.median, w.ziel)})`).join(' | ') + ' |');

out.push('\n### Wahlen vor der Zielzeit (Anteil der Wahlen 2–10, die mehr als 5 s vor dem Fahrplan erschienen)\n');
out.push('| Feld | Anteil früher | davon Median der Verfrühung |');
out.push('|---|---|---|');
for (const f of R.felder){
  const rs = (R.roh || []).filter(r => r.suite === 'felder' && r.diff === f.diff && r.profile === f.profile);
  let n = 0, frueh = 0; const d = [];
  for (const r of rs) for (const w of r.wahlen) if (w.n >= 2 && w.n <= 10){ n++; if (w.t < w.soll - 5){ frueh++; d.push(w.soll - w.t); } }
  d.sort((a, b) => a - b);
  out.push(`| ${f.diff}/${f.profile} | ${n ? (100 * frueh / n).toFixed(1) + ' %' : '–'} | ${d.length ? Math.round(d[Math.floor(d.length / 2)]) + ' s' : '–'} |`);
}
out.push('\n### Zeitpunkte der Gebäude (Median, Anteil der Partien mit dem Gebäude)\n');
out.push('| Feld | Kaserne | Schmiede | Universität |');
out.push('|---|---|---|---|');
for (const f of R.felder) out.push(`| ${f.diff}/${f.profile} | ${mm(f.kaserneS)} (${pct(f.kaserneAnteil)}) | ${mm(f.schmiedeS)} (${pct(f.schmiedeAnteil)}) | ${mm(f.universitaetS)} (${pct(f.universitaetAnteil)}) |`);
out.push('\n### Pfad-Varianten (Normal, durchschnitt)\n');
out.push('| Variante | Siege | Dauer Median | Wahlen | Kaserne | Schmiede | Universität | erste Pfadkarte | zweite Pfadkarte |');
out.push('|---|---|---|---|---|---|---|---|---|');
const dist = (d, n) => Object.entries(d).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(100 * v / n)} %`).join(', ');
for (const v of R.varianten) out.push(`| ${v.variant} | ${pct(v.siegquote)} | ${mm(v.dauerMedian)} | ${v.wahlenMedian} | ${mm(v.kaserneS)} | ${mm(v.schmiedeS)} | ${mm(v.universitaetS)} | ${dist(v.erste, v.n)} | ${dist(v.zweite, v.n)} |`);
if (R.variantenSpannweite != null) out.push(`\nSpannweite der Siegquoten: ${R.variantenSpannweite.toFixed(1)} Prozentpunkte (Soll ≤ 15).`);
if (R.gierig && R.gierig.length){
  out.push('\n### Bot mit Vorausschau („gierig“, Normal, drei Pfad-Varianten gemischt)\n');
  out.push('| Profil | Siege | Dauer Median | Dauer P90 | Wahlen | Wahl 5 | Wahl 10 | Abstände 45–100 s |');
  out.push('|---|---|---|---|---|---|---|---|');
  for (const g of R.gierig) out.push(`| ${g.profile} | ${pct(g.siegquote)} | ${mm(g.dauerMedian)} | ${mm(g.dauerP90)} | ${g.wahlenMedian} | ${mm(g.wahl[4].median)} | ${mm(g.wahl[9].median)} (${g.wahl[9].partien}) | ${g.abstandAnteil == null ? '–' : (100 * g.abstandAnteil).toFixed(1) + ' %'} |`);
}
/* Wahlraten der Bonuskarten */
const bonusIds = Object.keys(R.karten.ez).filter(id => !R.pfadIds.includes(id));
function rateTable(title, m){
  out.push(`\n### ${title}\n`);
  out.push('| Karte | angeboten | gewählt | Wahlrate |');
  out.push('|---|---|---|---|');
  const rows = Object.entries(m).map(([id, e]) => ({ id, ...e, rate: e.angeboten ? e.gewaehlt / e.angeboten : 0 })).sort((a, b) => a.rate - b.rate);
  for (const r of rows) out.push(`| ${r.id}${R.pfadIds.includes(r.id) ? ' (Pfad)' : ''} | ${r.angeboten} | ${r.gewaehlt} | ${(100 * r.rate).toFixed(1)} % |`);
}
rateTable('Wahlrate je Karte (einheiten-zuerst, Normal, alle Profile)', R.karten.ez);
if (R.karten.gierig && Object.keys(R.karten.gierig).length) rateTable('Wahlrate je Karte („gierig“ mit Vorausschau, Normal)', R.karten.gierig);

/* Bewertung der Bonuskarten durch Vorausschau (reports/kartenpfad3-bonuskarten.json, tools/sim-p3.mjs --suite bonus) */
try {
  const B = JSON.parse(readFileSync('reports/kartenpfad3-bonuskarten.json', 'utf8')).bonus;
  out.push('\n### Bonuskarten: Anteil der Angebote mit mindestens zwei Bonuskarten, in denen die Karte nach 45 s Vorausschau am besten abschnitt\n');
  out.push('| Karte | angeboten | Vergleiche | Anteil „beste Bonuskarte“ |');
  out.push('|---|---|---|---|');
  for (const [id, x] of Object.entries(B).sort((a, b) => (a[1].bester / Math.max(1, a[1].vergleiche)) - (b[1].bester / Math.max(1, b[1].vergleiche))))
    out.push(`| ${id} | ${x.angeboten} | ${x.vergleiche} | ${x.vergleiche ? (100 * x.bester / x.vergleiche).toFixed(0) + ' %' : '–'} |`);
} catch (e) { /* ohne Datei keine Tabelle */ }
console.log(out.join('\n'));

/* ---------- Grafik: Zeit je Wahl und Abweichung zum Fahrplan, Normal ---------- */
const PROF = [['normal/aktiv', 'Normal · aktiv', 0], ['normal/durchschnitt', 'Normal · durchschnitt', 1], ['normal/gelegentlich', 'Normal · gelegentlich', 2], ['schwer/durchschnitt', 'Schwer · durchschnitt', 3]];
const feld = p => { const [d, pr] = p.split('/'); return R.felder.find(f => f.diff === d && f.profile === pr); };
const N = 10, W = 990, H = 640, L = 64, Rr = 170, T1 = 40, B1 = 300, T2 = 372, B2 = 560;
const x = k => L + (k - 1) * (W - L - Rr) / (N - 1);
const maxT = 13 * 60, y1 = t => B1 - (B1 - T1) * t / maxT;
const dev = 100, y2 = d => (T2 + B2) / 2 - (B2 - T2) / 2 * d / dev;       // ±100 s
const ticks1 = [0, 2, 4, 6, 8, 10, 12];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d" font-family="system-ui, sans-serif" font-size="12">
<title id="t">Kartenwahlen: Fahrplan gegen gemessenen Median (Normal)</title>
<desc id="d">Oben die Zeit der Wahlen 1 bis 10 in Minuten, unten die Abweichung des Medians vom Fahrplan in Sekunden, für die Profile aktiv, durchschnitt und gelegentlich.</desc>
<style>
  :root{ --surface:#fcfcfb; --ink:#0b0b0b; --ink2:#52514e; --grid:#e3e2de; --band:#e9eef7; --s1:#2a78d6; --s2:#eb6834; --s3:#1baf7a; --s4:#eda100; }
  @media (prefers-color-scheme: dark){ :root{ --surface:#1a1a19; --ink:#f0efec; --ink2:#c3c2b7; --grid:#33322f; --band:#222a38; --s1:#3987e5; --s2:#d95926; --s3:#199e70; --s4:#c98500; } }
  .bg{fill:var(--surface)} .tx{fill:var(--ink)} .tx2{fill:var(--ink2)} .gr{stroke:var(--grid);stroke-width:1} .bd{fill:var(--band)}
  .fp{stroke:var(--ink2);stroke-width:2;stroke-dasharray:6 4;fill:none}
  .l1{stroke:var(--s1)} .l2{stroke:var(--s2)} .l3{stroke:var(--s3)} .l4{stroke:var(--s4)} .f1{fill:var(--s1)} .f2{fill:var(--s2)} .f3{fill:var(--s3)} .f4{fill:var(--s4)}
  .ln{stroke-width:2;fill:none} .mk{stroke:var(--surface);stroke-width:2}
</style>
<rect class="bg" width="${W}" height="${H}"/>
<text class="tx" x="${L}" y="22" font-weight="600">Zeit der Wahl in Minuten (Median)</text>
`;
for (const tk of ticks1) svg += `<line class="gr" x1="${L}" x2="${W - Rr}" y1="${y1(tk * 60)}" y2="${y1(tk * 60)}"/><text class="tx2" x="${L - 8}" y="${y1(tk * 60) + 4}" text-anchor="end">${tk}</text>\n`;
for (let k = 1; k <= N; k++) svg += `<text class="tx2" x="${x(k)}" y="${B1 + 18}" text-anchor="middle">${k}</text>\n`;
svg += `<text class="tx2" x="${(L + W - Rr) / 2}" y="${B1 + 36}" text-anchor="middle">Wahl</text>\n`;
svg += `<polyline class="fp" points="${R.ziele.slice(0, N).map((z, i) => `${x(i + 1)},${y1(z)}`).join(' ')}"/>\n<text class="tx2" x="${W - Rr + 8}" y="${y1(R.ziele[N - 1]) + 4}">Fahrplan (gestrichelt)</text>\n`;
for (const [p, label, i] of PROF){
  const f = feld(p); if (!f) continue;
  const pts = f.wahl.slice(0, N).map((w, k) => w.median == null ? null : [x(k + 1), y1(w.median)]).filter(Boolean);
  svg += `<polyline class="ln l${i + 1}" points="${pts.map(q => q.join(',')).join(' ')}"/>\n`;
  for (const q of pts) svg += `<circle class="mk f${i + 1}" cx="${q[0]}" cy="${q[1]}" r="4"/>\n`;
}
svg += `<text class="tx" x="${L}" y="${T2 - 16}" font-weight="600">Abweichung vom Fahrplan in Sekunden (Toleranz ±20 s)</text>\n`;
svg += `<rect class="bd" x="${L}" y="${y2(20)}" width="${W - Rr - L}" height="${y2(-20) - y2(20)}"/>\n`;
for (const d of [-100, -50, 0, 50, 100]) svg += `<line class="gr" x1="${L}" x2="${W - Rr}" y1="${y2(d)}" y2="${y2(d)}"/><text class="tx2" x="${L - 8}" y="${y2(d) + 4}" text-anchor="end">${d > 0 ? '+' : ''}${d}</text>\n`;
for (let k = 1; k <= N; k++) svg += `<text class="tx2" x="${x(k)}" y="${B2 + 18}" text-anchor="middle">${k}</text>\n`;
svg += `<text class="tx2" x="${(L + W - Rr) / 2}" y="${B2 + 36}" text-anchor="middle">Wahl</text>\n`;
let labelY = [];
for (const [p, label, i] of PROF){
  const f = feld(p); if (!f) continue;
  const pts = f.wahl.slice(0, N).map((w, k) => w.median == null ? null : [x(k + 1), y2(Math.max(-dev, Math.min(dev, w.median - w.ziel)))]).filter(Boolean);
  svg += `<polyline class="ln l${i + 1}" points="${pts.map(q => q.join(',')).join(' ')}"/>\n`;
  for (const q of pts) svg += `<circle class="mk f${i + 1}" cx="${q[0]}" cy="${q[1]}" r="4"/>\n`;
}
// Legende (Linienstück plus Text in Textfarbe), unabhängig von der Farbe lesbar
PROF.forEach(([p, label, i], j) => {
  const yy = 200 + j * 22;
  svg += `<line class="ln l${i + 1}" x1="${W - Rr + 8}" x2="${W - Rr + 34}" y1="${yy}" y2="${yy}"/><circle class="mk f${i + 1}" cx="${W - Rr + 21}" cy="${yy}" r="4"/><text class="tx" x="${W - Rr + 42}" y="${yy + 4}">${label}</text>\n`;
});
svg += `</svg>\n`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
process.stderr.write(`Grafik: ${OUT}\n`);

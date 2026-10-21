// Klammerfront – Vorher-nachher-Vergleich zweier Messreihen von tools/messung-v10.mjs (Kartenpfad Teil 10 und 11: K10.04, K10.07, K11.04).
// Aufruf: node tools/vergleich-v10.mjs --a <Ordner>/<Präfix> --b <Ordner>/<Präfix> [--titel-a vorher] [--titel-b nachher] [--grad normal] [--profil durchschnitt]
import { readFileSync, existsSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const A = arg('a'), B = arg('b'), TA = arg('titel-a', 'vorher'), TB = arg('titel-b', 'nachher'), GRAD = arg('grad', 'normal'), PROF = arg('profil', 'durchschnitt');
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const load = (pre, name) => { const f = `${pre}-${name}.json`; return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).roh : null; };
const pc = (n, d) => d ? `${(Math.round(1000 * n / d) / 10).toFixed(1).replace('.', ',')} %` : '–';
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const k = rs => ({ n: rs.length, siege: pc(rs.filter(r => r.status === 'won').length, rs.length), nied: pc(rs.filter(r => r.status === 'lost').length, rs.length), patt: pc(rs.filter(r => r.status !== 'won' && r.status !== 'lost').length, rs.length),
  pattZahl: rs.filter(r => r.status !== 'won' && r.status !== 'lost').length, dauer: mm(median(rs.map(r => r.t))), mauer: Math.round(mean(rs.map(r => r.wallLost || 0)) || 0), wahlen: median(rs.map(r => (r.wahlen || []).length)) });
const FELDER = [['Militär-Bot', 'kat-militaer-druck-aus', true], ['Wirtschafts-Bot', 'kat-wirtschaft-druck-aus', true], ['Verteidigungs-Bot', 'kat-verteidigung-druck-aus', true], ['Verteidigungs-Bot, ?druck=hoch', 'kat-verteidigung-druck-hoch', true], ['Bot ohne Kategorie', 'felder-ohne-kat', true], ['Bot ohne Kategorie, ?druck=hoch', 'felder-ohne-kat-druck-hoch', true]];
let out = `| Feld (${GRAD}, ${PROF}) | Partien | Siege ${TA} → ${TB} | Patt ${TA} → ${TB} | Dauer Median | Mauerverlust Mittel | Wahlen Median |\n|---|---|---|---|---|---|---|\n`;
for (const [name, file] of FELDER){
  const ra = load(A, file), rb = load(B, file); if (!ra || !rb) continue;
  const fa = k(ra.filter(r => r.diff === GRAD && r.profile === PROF)), fb = k(rb.filter(r => r.diff === GRAD && r.profile === PROF));
  out += `| ${name} | ${fa.n} / ${fb.n} | ${fa.siege} → ${fb.siege} | ${fa.patt} → ${fb.patt} | ${fa.dauer} → ${fb.dauer} | ${fa.mauer} → ${fb.mauer} | ${fa.wahlen} → ${fb.wahlen} |\n`;
}
const pattAlle = (pre, file) => { const rs = load(pre, file); if (!rs) return null; const p = rs.filter(r => r.status !== 'won' && r.status !== 'lost').length; return { p, n: rs.length }; };
out += '\nPatt-Quote des Bots ohne Kategorie über alle Felder (alle Grade und Profile)\n\n| Reihe | ohne Schalter | mit ?druck=hoch (Normal, Schwer) |\n|---|---|---|\n';
for (const [t, pre] of [[TA, A], [TB, B]]){ const a = pattAlle(pre, 'felder-ohne-kat'), b = pattAlle(pre, 'felder-ohne-kat-druck-hoch'); out += `| ${t} | ${a ? pc(a.p, a.n) + ` (${a.n} Partien)` : '–'} | ${b ? pc(b.p, b.n) + ` (${b.n} Partien)` : '–'} |\n`; }
console.log(out);

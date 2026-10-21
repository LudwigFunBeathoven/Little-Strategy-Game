// Klammerfront – Textinventar und Zeichenbudgets des Modus karten (Teil 9, REQ-K9.01, K9.04, K9.08): zählt je sichtbarem Schlüssel die Zeichen mit eingesetzten Beispielwerten und meldet Verstöße gegen R3.
// Aufruf: node tools/textbudget.mjs [--out reports/kartenpfad9-textinventar.txt] [--json reports/kartenpfad9-textinventar.json]
// Sichtbar sind alle Schlüssel außer: Texte entfallener Karten, Forschungen und Ausbauten (KF_PFAD), Grundschlüssel, die ein Schlüssel mit Suffix .karten überschreibt, und der Schlüssel selbst bei einem Suffix, den der Modus nie zeigt.
import { writeFileSync } from 'node:fs';
import { loadCore, loadI18n } from './load-core.mjs';

/* Budgets (Deutsch, höchstens Zeichen); Englisch + 15 % (R3). Element → Schlüsselmuster. */
export const BUDGET = { karte: 22, einheit: 140, wirkung: 40, nachteil: 40, bedingung: 30, gebaeude: 110, tooltip: 180, hinweis: 100 };
export const ELEMENT = [
  ['einheit',   /^unit\.[a-z]+\.desc$/],
  ['karte',     /^(?:draft|kp\.card|doctrine)\.[A-Za-z0-9_]+\.name(?:\.karten)?$/],
  ['wirkung',   /^kp\.eff\.[A-Za-z0-9_]+(?:\.t\d)?(?:\.karten)?$/],
  ['nachteil',  /^kp\.drawback\.[A-Za-z0-9_]+(?:\.t\d)?(?:\.karten)?$/],
  ['bedingung', /^kp\.cond\.[A-Za-z0-9_]+(?:\.karten)?$/],
  ['gebaeude',  /^bld\.[a-z]+\.desc(?:\.karten)?$/],
  ['hinweis',   /^hint\.[A-Za-z0-9_.]+$/],
  ['tooltip',   /^(?:tip\.[A-Za-z0-9_.]+|(?:draft|kp\.card|kp\.res|research|doctrine|var|variant|upg)\.[A-Za-z0-9_]+\.desc(?:\.t\d)?(?:\.karten)?)$/],
];
/* Beispielwerte für Platzhalter (R3: „mit eingesetzten Beispielwerten“) */
const SAMPLE = { s: '1:30', time: '1:30', name: 'Manufaktur', building: 'Manufaktur', unit: 'Läufer', what: 'Manufaktur', max: '5', m: '3', n: '25', cost: '1.200 Material', rate: '2,4', next: '3,1', total: '1.250', pct: '25', percent: '25' };
export const sample = (lang, text) => text.replace(/\{(\w+)\}/g, (m, k) => SAMPLE[k] ?? (/p$/.test(k) ? '25' : '25'));

export function sichtbar(){
  const I = loadI18n(), core = loadCore(), P = core.KF_PFAD;
  const gone = new Set([...P.entfallenKarten, ...P.entfallen.map(r => r.replace(/^r_/, '')), ...P.entfallenAusbauten]);
  const hidden = k => { const m = k.match(/^(?:draft|kp\.eff|kp\.drawback|kp\.cond|kp\.card|research|upg)\.([a-zA-Z_0-9]+)(\.|$)/); return !!m && gone.has(m[1]); };
  const NIE = ['tip.unit.body'];       // Teil 10: im Modus karten ersetzt unit.<id>.desc die Ausrückregel im Einheitentooltip
  const keys = [];
  for (const k of Object.keys(I.de)){
    if (hidden(k) || NIE.includes(k)) continue;
    if (!k.endsWith('.karten') && I.de[k + '.karten'] !== undefined) continue;          // der Modus karten zeigt den überschreibenden Schlüssel
    keys.push(k);
  }
  return { I, keys };
}
export const elementOf = key => { for (const [e, re] of ELEMENT) if (re.test(key)) return e; return null; };
export const limit = (lang, element) => Math.floor(BUDGET[element] * (lang === 'en' ? 1.15 : 1));

export function inventar(){
  const { I, keys } = sichtbar();
  const rows = keys.map(k => {
    const el = elementOf(k), r = { key: k, element: el };
    for (const lang of ['de', 'en']){ const s = sample(lang, I[lang][k] ?? ''); r[lang] = s.length; r[lang + 'Text'] = s; r[lang + 'Limit'] = el ? limit(lang, el) : null; r[lang + 'Over'] = el ? s.length > limit(lang, el) : false; }
    return r;
  });
  return { rows, totalDe: rows.reduce((a, r) => a + r.de, 0), totalEn: rows.reduce((a, r) => a + r.en, 0) };
}

if (process.argv[1] && process.argv[1].endsWith('textbudget.mjs')){
  const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
  const inv = inventar(), over = inv.rows.filter(r => r.deOver || r.enOver);
  const byEl = {}; for (const r of inv.rows) { const e = r.element || 'ohne Budget'; (byEl[e] = byEl[e] || { n: 0, de: 0, en: 0, over: 0 }); byEl[e].n++; byEl[e].de += r.de; byEl[e].en += r.en; if (r.deOver || r.enOver) byEl[e].over++; }
  let out = `Textinventar Modus karten (Zeichen mit eingesetzten Beispielwerten)\n\nSichtbare Schlüssel: ${inv.rows.length}\nZeichen gesamt: Deutsch ${inv.totalDe}, Englisch ${inv.totalEn}\n\n`;
  out += '| Element | Schlüssel | Zeichen de | Zeichen en | Budget de / en | über dem Budget |\n|---|---|---|---|---|---|\n';
  for (const [e, v] of Object.entries(byEl)) out += `| ${e} | ${v.n} | ${v.de} | ${v.en} | ${BUDGET[e] ? BUDGET[e] + ' / ' + Math.floor(BUDGET[e] * 1.15) : '–'} | ${v.over} |\n`;
  out += `\nVerstöße gegen R3 (${over.length}):\n\n| Schlüssel | Element | de | Budget | en | Budget | Text (de) |\n|---|---|---|---|---|---|---|\n`;
  for (const r of over.sort((a, b) => a.element.localeCompare(b.element) || b.de - a.de)) out += `| \`${r.key}\` | ${r.element} | ${r.de}${r.deOver ? ' !' : ''} | ${r.deLimit} | ${r.en}${r.enOver ? ' !' : ''} | ${r.enLimit} | ${r.deText.replace(/\|/g, '\\|').slice(0, 120)} |\n`;
  if (arg('out')) writeFileSync(arg('out'), out); else console.log(out);
  if (arg('json')) writeFileSync(arg('json'), JSON.stringify({ rows: inv.rows.map(({ deText, enText, ...r }) => r), totalDe: inv.totalDe, totalEn: inv.totalEn }, null, 1));
}

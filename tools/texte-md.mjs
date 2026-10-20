// Klammerfront – alle sichtbaren Texte aus i18n/de.js und i18n/en.js als Markdown, gruppiert nach Bereich.
// Aufruf: node tools/texte-md.mjs docs/texte-klammerfront.md
import { loadCore, loadI18n } from './load-core.mjs';
import { writeFileSync } from 'node:fs';
const I = loadI18n(), P = loadCore().KF_PFAD;
const gone = new Set([...P.entfallenKarten, ...P.entfallen.map(r => r.replace(/^r_/, '')), ...P.entfallenAusbauten]);
const hidden = k => { const m = k.match(/^(?:draft|kp\.eff|kp\.card|research|upg)\.([a-zA-Z_0-9]+)(\.|$)/); return !!m && gone.has(m[1]); };
const GROUPS = [
  ['Allgemein und Zahlen', ['meta', 'num', 'time', 'lang', 'btn', 'opt', 'cost', 'foot', 'mark', 'cam', 'menu', 'ctx', 'preview', 'fx']],
  ['Start, Schwierigkeit, Ergebnis', ['start', 'diff', 'result']],
  ['Ressourcenleiste und Kopfzeilen', ['hud', 'hdr', 'front', 'phase', 'level', 'wave', 'lane']],
  ['Reiter und Arbeitsbereich', ['tab', 'panel', 'sub', 'slot', 'grid', 'build', 'demolish', 'repair', 'fab', 'nb']],
  ['Gebäude', ['bld', 'kaserne', 'tower', 'mauer', 'turm', 'wall']],
  ['Haupthaus und Flügel (Teil 7)', ['haus']],
  ['Einheiten und Armee', ['unit', 'army', 'kompanie']],
  ['Ausbauten (Upgrades)', ['upg']],
  ['Forschung und Budget', ['research', 'budget']],
  ['Spezialkarten (Kartenwahl)', ['draft']],
  ['Kartenpfad: Pfadkarten, Wirkungszeilen, Pfadforschung', ['kp']],
  ['Gebäude-Varianten', ['var', 'variant']],
  ['Doktrinen, Kategorien, Handel', ['doctrine', 'kat', 'trade', 'raubbau']],
  ['Erklärzeilen der Knöpfe', ['ex']],
  ['Tooltips', ['tip']],
  ['Hinweise', ['hint']],
  ['Tutorial', ['tut']],
  ['Ereignisprotokoll', ['log']],
];
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
const keys = Object.keys(I.de);
const used = new Set();
let md = `# Klammerfront – alle Texte des Spiels\n\nStand: Branch \`exp/kartenpfad\`, v0.9.2-kartenpfad-7. Quelle: \`i18n/de.js\` und \`i18n/en.js\` (${keys.length} Schlüssel, in beiden Sprachen identisch).\n\n`;
md += `Lesehilfe:\n- **Schlüssel** ist der Name im Code. Platzhalter in geschweiften Klammern (\`{n}\`, \`{name}\`) füllt das Spiel zur Laufzeit.\n`;
md += `- Spalte **Modus**: „karten“ = Text ersetzt im Modus karten (Kartenpfad) den gleichnamigen Schlüssel ohne Suffix; „nur standard“ = Karte, Forschung oder Ausbau entfällt im Modus karten; leer = beide Modi.\n`;
md += `- Zeilenumbrüche im Text erscheinen als \`<br>\`.\n\n## Inhalt\n`;
const sections = [];
for (const [title, prefixes] of GROUPS){
  const ks = keys.filter(k => prefixes.includes(k.split('.')[0]));
  ks.forEach(k => used.add(k));
  if (ks.length) sections.push([title, ks]);
}
const rest = keys.filter(k => !used.has(k)); if (rest.length) sections.push(['Sonstiges', rest]);
sections.forEach(([t, ks], i) => { md += `${i + 1}. [${t}](#${t.toLowerCase().replace(/[^a-z0-9äöüß ,-]/g, '').replace(/[ ]/g, '-').replace(/,/g, '')}) (${ks.length})\n`; });
for (const [t, ks] of sections){
  md += `\n## ${t}\n\n| Schlüssel | Modus | Deutsch | Englisch |\n|---|---|---|---|\n`;
  for (const k of ks.sort()) md += `| \`${k}\` | ${k.endsWith('.karten') ? 'karten' : hidden(k) ? 'nur standard' : ''} | ${esc(I.de[k])} | ${esc(I.en[k])} |\n`;
}
writeFileSync(process.argv[2], md);
console.log(sections.map(([t, ks]) => `${t}: ${ks.length}`).join('\n'), '\nSumme', sections.reduce((a, [, k]) => a + k.length, 0));

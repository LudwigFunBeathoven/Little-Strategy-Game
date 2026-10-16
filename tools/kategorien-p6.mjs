// Klammerfront – Karten je Kategorie bei Partieende und Werte der Synergiekarten je Kategorie-Bot (REQ-K6.03, K6.08).
// Aufruf: node tools/kategorien-p6.mjs [--runs 50] [--diff normal] [--profile durchschnitt] [--druck aus|hoch] [--json reports/kartenpfad6-kategorien-ende.json]
import { writeFileSync } from 'node:fs';
process.env.KF_PACING = 'karten';
const { playGame } = await import('./sim-bot.mjs');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = Number(arg('runs', 50)), DIFF = arg('diff', 'normal'), PROFILE = arg('profile', 'durchschnitt'), DRUCK = arg('druck', 'aus'), OUT = arg('json', null);
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const KATS = ['militaer', 'wirtschaft', 'verteidigung'], NAME = { militaer: 'Militär', wirtschaft: 'Wirtschaft', verteidigung: 'Verteidigung' };
const SYN = { militaer: ['waffenbrueder', 'sammelruf'], wirtschaft: ['gilde', 'bauordnung'], verteidigung: ['wehrverband'] };
const result = {};
for (const bot of [...KATS, 'ohne']){
  const rs = [];
  for (let r = 0; r < RUNS; r++) rs.push(playGame({ diff: DIFF, profile: PROFILE, strategy: 'einheiten-zuerst', seed: (5000 + r * 7919 + 2 * 104729) >>> 0, kat: bot === 'ohne' ? undefined : bot, pfad: bot === 'ohne' ? 'militaer' : undefined, druck: DRUCK === 'hoch' ? 'hoch' : undefined, pacing: 'karten' }));
  const own = bot === 'ohne' ? null : rs.map(r => r.katCounts[bot]);
  const lead = Object.fromEntries(KATS.map(k => [k, rs.filter(r => { const c = r.katCounts, s = KATS.slice().sort((a, b) => c[b] - c[a]); return s[0] === k && c[s[0]] - c[s[1]] >= 2; }).length / rs.length]));
  const syn = {}; for (const id of Object.values(SYN).flat()){ const v = rs.map(r => r.synergie[id]).filter(Boolean); syn[id] = { anteil: v.length / rs.length, wertMedian: med(v.map(x => x.value)), nMedian: med(v.map(x => x.n)) }; }
  result[bot] = { n: rs.length, karten: Object.fromEntries(KATS.map(k => [k, { median: med(rs.map(r => r.katCounts[k])), mittel: mean(rs.map(r => r.katCounts[k])) }])), eigeneMedian: own && med(own), fuehrend: lead, synergie: syn };
}
const f = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
console.log(`Karten je Kategorie bei Partieende (${DIFF}, ${PROFILE}, druck ${DRUCK}, ${RUNS} Partien je Bot; Median, Mittel in Klammern)\n`);
console.log('| Bot | Militär | Wirtschaft | Verteidigung | führende Kategorie (Anteil der Partien: Militär / Wirtschaft / Verteidigung) |');
console.log('|---|---|---|---|---|');
for (const [bot, x] of Object.entries(result)) console.log(`| ${bot === 'ohne' ? 'ohne Kategorie' : NAME[bot]} | ${KATS.map(k => `${x.karten[k].median} (${f(x.karten[k].mittel)})`).join(' | ')} | ${KATS.map(k => Math.round(100 * x.fuehrend[k]) + ' %').join(' / ')} |`);
console.log('\nSynergiekarten (Anteil der Partien, in denen gewählt; Wert bei Partieende im Median; gezählte Karten im Median)\n');
console.log('| Bot | ' + Object.values(SYN).flat().join(' | ') + ' |');
console.log('|---|' + Object.values(SYN).flat().map(() => '---').join('|') + '|');
for (const [bot, x] of Object.entries(result)) console.log(`| ${bot === 'ohne' ? 'ohne Kategorie' : NAME[bot]} | ${Object.values(SYN).flat().map(id => { const s = x.synergie[id]; return s.anteil ? `${Math.round(100 * s.anteil)} % · ${s.wertMedian >= 1 ? '×' + f(s.wertMedian) : '+' + Math.round(100 * Math.abs(s.wertMedian)) + ' %'} · ${s.nMedian}` : '0 %'; }).join(' | ')} |`);
if (OUT) writeFileSync(OUT, JSON.stringify({ diff: DIFF, profile: PROFILE, druck: DRUCK, runs: RUNS, result }, null, 1));

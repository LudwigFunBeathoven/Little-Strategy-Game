// Klammerfront – Tabellen für docs/bericht-kartenpfad-6.md aus den Messdateien unter reports/ (REQ-K6.08).
// Aufruf: node tools/bericht-p6.mjs [--prefix kartenpfad6]
import { readFileSync, existsSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const P = arg('prefix', 'kartenpfad6');
const load = n => existsSync(`reports/${P}-${n}.json`) ? JSON.parse(readFileSync(`reports/${P}-${n}.json`, 'utf8')) : null;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const row = (...c) => '| ' + c.join(' | ') + ' |';
const field = (j, diff, profile) => j && j.felder.find(x => x.diff === diff && x.profile === profile);
const GRAD = { leicht: 'Leicht', normal: 'Normal', schwer: 'Schwer' };

const basis = load('basis-felder'), neu = load('felder-ohne-kat'), neuDruck = load('felder-ohne-kat-druck-hoch');
console.log('### Bot ohne Kategorie: vorher (nach Teil 5) und nachher (50 Partien je Feld, gleiche Seeds)\n');
console.log(row('Grad', 'Profil', 'Siege vorher → nachher', 'Patt nachher', 'Dauer Median vorher → nachher', 'Wahlen Median vorher → nachher', 'Doktrin-Angebote Median (erstes in Wahl)', 'Partien ohne Doktrin-Angebot'));
console.log('|---|---|---|---|---|---|---|---|');
for (const diff of ['leicht', 'normal', 'schwer']) for (const profile of ['aktiv', 'durchschnitt', 'gelegentlich']){
  const a = field(basis, diff, profile), b = field(neu, diff, profile); if (!a || !b) continue;
  console.log(row(GRAD[diff], profile, `${a.siegquote} → ${b.siegquote} %`, `${b.patt} %`, `${mm(a.dauerMedian)} → ${mm(b.dauerMedian)}`, `${a.wahlenMedian} → ${b.wahlenMedian}`, `${b.doktrinAngebote.median} (${b.doktrinAngebote.erstesMedian ?? '–'})`, `${b.doktrinAngebote.ohneAnteil} %`));
}
if (neuDruck){
  console.log('\n### Bot ohne Kategorie mit `?druck=hoch` (Normal, Schwer)\n');
  console.log(row('Grad', 'Profil', 'Siege', 'Patt', 'Dauer Median', 'Wahlen Median'));
  console.log('|---|---|---|---|---|---|');
  for (const diff of ['normal', 'schwer']) for (const profile of ['aktiv', 'durchschnitt', 'gelegentlich']){ const b = field(neuDruck, diff, profile); if (b) console.log(row(GRAD[diff], profile, `${b.siegquote} %`, `${b.patt} %`, mm(b.dauerMedian), b.wahlenMedian)); }
}

const KATS = [['militaer', 'Militär'], ['wirtschaft', 'Wirtschaft'], ['verteidigung', 'Verteidigung']];
console.log('\n### Kategorie-Bots (Profil durchschnitt, 50 Partien je Zeile)\n');
console.log(row('Grad', 'Druck', 'Bot', 'Siege', 'Niederl.', 'Patt', 'Dauer Median', 'Dauer P90', 'Wahlen Median', 'Dampfkraft / Buchdruck (Anteil, Abschluss Median)', 'ersetzte Varianten je Partie mit Weiterentwicklung'));
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
const spread = {};
for (const diff of ['normal', 'schwer']) for (const druck of ['aus', 'hoch']){
  const ms = [];
  for (const [k, name] of KATS){
    const j = load(`kat-${k}-druck-${druck}`), x = field(j, diff, 'durchschnitt'); if (!x) continue;
    ms.push(x.dauerMedian);
    console.log(row(GRAD[diff], druck === 'hoch' ? 'hoch' : 'aus', name, `${x.siegquote} %`, `${x.niederlagen} %`, `${x.patt} %`, mm(x.dauerMedian), mm(x.dauerP90), x.wahlenMedian, `${x.weiter.fabrik} % ${mm(x.weiter.tFabrikMedian)} / ${x.weiter.universitaet} % ${mm(x.weiter.tUniMedian)}`, f1(x.weiter.ersetztMittelMit)));
  }
  spread[`${diff}/${druck}`] = ms.length ? Math.max(...ms) - Math.min(...ms) : null;
}
console.log('\nSpannweite der Dauer-Mediane (größter minus kleinster Bot): ' + Object.entries(spread).map(([k, v]) => `${k} ${mm(v)}`).join(', '));

console.log('\n### Kategorie-Bots, alle Profile (ohne Druck)\n');
console.log(row('Grad', 'Profil', 'Militär Siege / Dauer / Wahlen', 'Wirtschaft Siege / Dauer / Wahlen', 'Verteidigung Siege / Dauer / Wahlen'));
console.log('|---|---|---|---|---|');
for (const diff of ['normal', 'schwer']) for (const profile of ['aktiv', 'durchschnitt', 'gelegentlich']){
  const cells = KATS.map(([k]) => { const x = field(load(`kat-${k}-druck-aus`), diff, profile); return x ? `${x.siegquote} % / ${mm(x.dauerMedian)} / ${x.wahlenMedian}` : '–'; });
  console.log(row(GRAD[diff], profile, ...cells));
}

for (const [name, titel] of [['doktrin-normal', 'Normal'], ['doktrin-schwer', 'Schwer']]){
  const d = load(name); if (!d || !d.doktrin) continue;
  console.log(`\n### Doktrinen im Paarvergleich (${titel}, durchschnitt, ${d.runs === undefined ? '' : ''}100 Partien je Arm, gleiche Seeds)\n`);
  console.log(row('Doktrin', 'Kategorie des Bots', 'Siege mit', 'Siege ohne', 'Differenz (pp)', 'Dauer Median mit / ohne', 'Wahlen Median mit / ohne', 'Mauerverlust mit / ohne', 'Turm-Abschüsse mit / ohne', 'gewählt (Arm mit)', 'Sonderbau gebaut'));
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const x of d.doktrin) console.log(row(x.doktrin, x.kat, `${x.mit} %`, `${x.ohne} %`, `${x.differenz > 0 ? '+' : ''}${x.differenz}`, `${mm(x.dauerMit)} / ${mm(x.dauerOhne)}`, `${x.wahlenMit} / ${x.wahlenOhne}`, `${x.mauerMit} / ${x.mauerOhne}`, `${x.turmMit} / ${x.turmOhne}`, x.gewaehlt == null ? '–' : `${x.gewaehlt} %`, x.sonderbauGebaut == null ? '–' : `${x.sonderbauGebaut} %`));
  if (d.alle){
    console.log(`\n### Angebote mit Doktrin (${titel}; Arm „alle“: alle 13 Doktrinen im Pool, Kategorie-Bot)\n`);
    console.log(row('Kategorie', 'Siege', 'Angebote mit Doktrin Median (Mittel)', 'Doktrinen gewählt (Mittel)', 'erstes Angebot in Wahl (Median)', 'erste Doktrin gewählt in Wahl (Median)', 'Partien ohne Angebot'));
    console.log('|---|---|---|---|---|---|---|');
    for (const x of d.alle) console.log(row(x.kat ?? x.linie, `${x.siege} %`, `${x.angeboteMedian} (${f1(x.angeboteMittel)})`, f1(x.gewaehltMittel), x.ersteAngebotMedian ?? '–', x.ersteWahlMedian ?? '–', `${x.ohneAngebotAnteil} %`));
    const merged = {}; for (const x of d.alle) for (const [k, v] of Object.entries(x.gewaehltJeDoktrin || {})) merged[k] = (merged[k] || []).concat(v);
    console.log('\nGewählt je Doktrin (Anteil der Partien je Kategorie-Bot: Militär / Wirtschaft / Verteidigung):\n');
    console.log(Object.entries(merged).map(([k, v]) => `${k} ${v.join(' / ')} %`).join(', '));
  }
}

const ende = load('kategorien-ende');
if (ende){
  const KN = { militaer: 'Militär', wirtschaft: 'Wirtschaft', verteidigung: 'Verteidigung', ohne: 'ohne Kategorie' };
  const SYN = ['waffenbrueder', 'sammelruf', 'gilde', 'bauordnung', 'wehrverband'];
  console.log(`\n### Karten je Kategorie bei Partieende (${ende.diff}, ${ende.profile}, druck ${ende.druck}, ${ende.runs} Partien je Bot; Median, Mittel in Klammern)\n`);
  console.log(row('Bot', 'Militär', 'Wirtschaft', 'Verteidigung', 'führende Kategorie (Anteil der Partien: Militär / Wirtschaft / Verteidigung)'));
  console.log('|---|---|---|---|---|');
  for (const [bot, x] of Object.entries(ende.result)) console.log(row(KN[bot], ...['militaer', 'wirtschaft', 'verteidigung'].map(k => `${x.karten[k].median} (${f1(x.karten[k].mittel)})`), ['militaer', 'wirtschaft', 'verteidigung'].map(k => Math.round(100 * x.fuehrend[k]) + ' %').join(' / ')));
  console.log('\n### Synergiekarten am Partieende (Anteil der Partien mit der Karte · Wert im Median · gezählte Karten im Median)\n');
  console.log(row('Bot', ...SYN));
  console.log('|---|' + SYN.map(() => '---').join('|') + '|');
  for (const [bot, x] of Object.entries(ende.result)) console.log(row(KN[bot], ...SYN.map(id => { const q = x.synergie[id]; return q.anteil ? `${Math.round(100 * q.anteil)} % · ${id === 'sammelruf' ? '+' + q.wertMedian + ' Läufer' : q.wertMedian >= 1 ? '×' + f1(q.wertMedian) : '+' + Math.round(100 * Math.abs(q.wertMedian)) + ' %'} · ${q.nMedian}` : '0 %'; })));
}

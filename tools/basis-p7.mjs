// Klammerfront – Auswertung Kartenpfad Teil 7 (REQ-K7.01, K7.12): liest die Rohdaten einer Messreihe (tools/messung-p6.mjs --set kategorien|ohne, Präfix)
// und gibt die Tabellen der Basismessung bzw. der Messung nach Teil 7 aus: Fabrikplätze bei Minute 2, 5, 10, Belegung der Plätze am Ende, Nachbarschaft und
// Synergiekarten am Ende, Weiterentwicklungen, Dauer-Mediane der Kategorie-Bots und ihre Spannweite, Patt-Quote mit druck=hoch; dazu Haupthaus, Flügel,
// Söldnerkompanien und Geschütze, sobald es sie gibt.
// Aufruf: node tools/basis-p7.mjs [--prefix kartenpfad7-basis] [--diff normal] [--profile durchschnitt] [--json reports/<prefix>-auswertung.json]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const PREFIX = arg('prefix', 'kartenpfad7-basis'), DIFF = arg('diff', 'normal'), PROF = arg('profile', 'durchschnitt'), JSON_OUT = arg('json', null);
const BOTS = [['militaer', 'kat-militaer'], ['wirtschaft', 'kat-wirtschaft'], ['verteidigung', 'kat-verteidigung'], ['ohne', 'felder-ohne-kat']];
const load = f => { const p = `reports/${PREFIX}-${f}.json`; return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).roh : null; };
const raw = {};
for (const [bot, f] of BOTS){
  raw[bot] = { aus: load(bot === 'ohne' ? f : f + '-druck-aus'), hoch: load(bot === 'ohne' ? f + '-druck-hoch' : f + '-druck-hoch') };
}
const sortN = a => [...a].sort((x, y) => x - y);
const median = a => { if (!a.length) return null; const s = sortN(a); return s[Math.floor(s.length / 2)]; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const pc = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const f2 = x => x == null ? '–' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
const field = rs => (rs || []).filter(r => r.diff === DIFF && r.profile === PROF);
const out = { prefix: PREFIX, diff: DIFF, profile: PROF, bots: {} };
const TYPES = ['fabrik', 'kaserne', 'schmiede', 'universitaet', 'kontor'];

console.log(`AUSWERTUNG ${PREFIX} (${DIFF}, ${PROF}; Rohdaten reports/${PREFIX}-*.json)\n`);
console.log('Fabrikplätze im Raster (Grundform, Varianten, Sonderbauten; Median / Mittel) und Verteilung bei Minute 10\n');
console.log('| Bot | Partien | Minute 2 | Minute 5 | Minute 10 | Verteilung Minute 10 (Zahl: Partien) | über der Grenze (Minute 10) |');
console.log('|---|---|---|---|---|---|---|');
for (const [bot] of BOTS){
  const rs = field(raw[bot].aus); if (!rs.length) continue;
  const fab = t => rs.map(r => r.grid && r.grid[t]).filter(Boolean).map(g => (g.types && g.types.fabrik) || 0);
  const at10 = rs.map(r => r.grid && r.grid[600]).filter(Boolean);
  const dist = {}; for (const g of at10){ const n = (g.types && g.types.fabrik) || 0; dist[n] = (dist[n] || 0) + 1; }
  const over = at10.filter(g => g.grenze != null && ((g.types && g.types.fabrik) || 0) > g.grenze).length;
  const row = { n: rs.length, min2: [median(fab(120)), mean(fab(120))], min5: [median(fab(300)), mean(fab(300))], min10: [median(fab(600)), mean(fab(600))], dist, ueberGrenze: over, mitGrenze: at10.filter(g => g.grenze != null).length };
  (out.bots[bot] = out.bots[bot] || {}).fabriken = row;
  console.log(`| ${bot} | ${rs.length} | ${row.min2[0] ?? '–'} / ${f1(row.min2[1])} | ${row.min5[0] ?? '–'} / ${f1(row.min5[1])} | ${row.min10[0] ?? '–'} / ${f1(row.min10[1])} | ${Object.entries(dist).map(([k, v]) => `${k}: ${v}`).join(', ')} | ${row.mitGrenze ? `${over} von ${row.mitGrenze}` : '– (keine Grenze)'} |`);
}

console.log('\nBelegung der Plätze am Partieende (Anteil der Partien mit dem Gebäude; Mittel der Zahl; „doppelt“: Anteil mit zwei oder mehr)\n');
console.log(`| Bot | ${TYPES.map(t => t).join(' | ')} | Haupthaus | freie Plätze (Mittel) | doppelt (außer Fabrik) |`);
console.log(`|---|${TYPES.map(() => '---|').join('')}---|---|---|`);
for (const [bot] of BOTS){
  const rs = field(raw[bot].aus).filter(r => Array.isArray(r.slotsEnd)); if (!rs.length) continue;
  const cnt = (r, ty) => r.slotsEnd.filter(x => x === ty).length;
  const cells = TYPES.map(ty => { const c = rs.map(r => cnt(r, ty)); return `${pc(c.filter(x => x > 0).length, rs.length)} % (${f1(mean(c))})`; });
  const dbl = TYPES.filter(ty => ty !== 'fabrik').map(ty => [ty, pc(rs.filter(r => cnt(r, ty) >= 2).length, rs.length)]).filter(x => x[1] > 0);
  const row = { anteil: Object.fromEntries(TYPES.map(ty => [ty, pc(rs.filter(r => cnt(r, ty) > 0).length, rs.length)])), mittel: Object.fromEntries(TYPES.map(ty => [ty, mean(rs.map(r => cnt(r, ty)))])),
    frei: mean(rs.map(r => r.slotsEnd.filter(x => !x).length)), haupthaus: pc(rs.filter(r => cnt(r, 'haupthaus') > 0).length, rs.length), doppelt: Object.fromEntries(dbl) };
  out.bots[bot].belegung = row;
  console.log(`| ${bot} | ${cells.join(' | ')} | ${row.haupthaus} % | ${f1(row.frei)} | ${dbl.length ? dbl.map(([ty, v]) => `${ty} ${v} %`).join(', ') : 'nie'} |`);
}

console.log('\nNachbarschaft und Synergiekarten am Partieende (Summe der Nachbarschaftswerte aller Fabriken; Bauordnung und Gilde: Anteil der Partien mit der Karte, Wert bei Wahl)\n');
console.log('| Bot | Nachbarschaft Fabriken (Median / Mittel) | Bauordnung gewählt | Wert (×) | Gilde gewählt | Wert (Median) |');
console.log('|---|---|---|---|---|---|');
for (const [bot] of BOTS){
  const rs = field(raw[bot].aus); if (!rs.length) continue;
  const syn = id => rs.filter(r => r.synergie && r.synergie[id]).map(r => r.synergie[id]);
  const bo = syn('bauordnung'), gi = syn('gilde'), nb = rs.map(r => r.nbEnd).filter(x => x != null);
  const row = { nbMedian: median(nb), nbMittel: mean(nb), bauordnung: pc(bo.length, rs.length), bauordnungWert: median(bo.map(x => x.value)), gilde: pc(gi.length, rs.length), gildeWert: median(gi.map(x => x.value)), gildeN: median(gi.map(x => x.n)) };
  out.bots[bot].nachbarschaft = row;
  console.log(`| ${bot} | ${f2(row.nbMedian)} / ${f2(row.nbMittel)} | ${row.bauordnung} % | ${row.bauordnungWert ?? '–'} | ${row.gilde} % | ${row.gildeWert == null ? '–' : '+' + Math.round(100 * row.gildeWert) + ' %'} (${row.gildeN ?? '–'} Karten) |`);
}

const WEITER = [['r_wasserrahmen', 'Wasserrahmen'], ['r_dampfkraft', 'Dampfkraft'], ['r_buchdruck', 'Buchdruck'], ['r_fernhandel', 'Fernhandel'], ['r_geschuetzguss', 'Geschützguss']];
console.log('\nWeiterentwicklungen (Anteil der Partien mit Abschluss; Abschluss Median; ersetzte Varianten Mittel)\n');
console.log(`| Bot | ${WEITER.map(w => w[1]).join(' | ')} |`);
console.log(`|---|${WEITER.map(() => '---|').join('')}`);
for (const [bot] of BOTS){
  const rs = field(raw[bot].aus); if (!rs.length) continue;
  const cells = WEITER.map(([id]) => { const ev = rs.map(r => (r.weiter || []).find(w => w.id === id)).filter(Boolean); return ev.length ? `${pc(ev.length, rs.length)} % · ${mm(median(ev.map(e => e.t)))} · ${f1(mean(ev.map(e => e.ersetzt)))}` : '–'; });
  out.bots[bot].weiter = Object.fromEntries(WEITER.map(([id]) => { const ev = rs.map(r => (r.weiter || []).find(w => w.id === id)).filter(Boolean); return [id, { anteil: pc(ev.length, rs.length), tMedian: median(ev.map(e => e.t)), ersetzt: mean(ev.map(e => e.ersetzt)) }]; }));
  console.log(`| ${bot} | ${cells.join(' | ')} |`);
}

console.log(`\nDauer und Patt (${DIFF}, ${PROF}; Patt mit druck=hoch über alle Felder der Messreihe und im Feld ${DIFF}/${PROF})\n`);
console.log('| Bot | Siege | Dauer Median | Wahlen Median | Mauerverlust Median | Patt druck=hoch (alle Felder) | Patt druck=hoch (Feld) | Siege druck=hoch (Feld) |');
console.log('|---|---|---|---|---|---|---|---|');
const dur = {};
for (const [bot] of BOTS){
  const rs = field(raw[bot].aus), hall = raw[bot].hoch || [], hf = field(hall); if (!rs.length) continue;
  const row = { siege: pc(rs.filter(r => r.status === 'won').length, rs.length), dauer: median(rs.map(r => r.t)), wahlen: median(rs.map(r => (r.wahlen || []).length)), mauer: median(rs.map(r => r.wallLost || 0)),
    pattAlle: pc(hall.filter(r => r.status === 'running').length, hall.length), pattFeld: pc(hf.filter(r => r.status === 'running').length, hf.length), siegeHoch: pc(hf.filter(r => r.status === 'won').length, hf.length), nHoch: hall.length };
  out.bots[bot].dauer = row; dur[bot] = row.dauer;
  console.log(`| ${bot} | ${row.siege} % | ${mm(row.dauer)} | ${row.wahlen} | ${Math.round(row.mauer)} | ${row.pattAlle} % (${row.nHoch} Partien) | ${row.pattFeld} % | ${row.siegeHoch} % |`);
}
const kats = ['militaer', 'wirtschaft', 'verteidigung'].map(k => dur[k]).filter(x => x != null);
out.spannweite = kats.length === 3 ? Math.max(...kats) - Math.min(...kats) : null;
console.log(`\nSpannweite der Dauer-Mediane der Kategorie-Bots: ${mm(out.spannweite)} min`);

// Teil 7: Haupthaus, Flügel, Kompanien, Geschütze (nur, wenn die Messreihe sie enthält)
if (BOTS.some(([bot]) => field(raw[bot].aus).some(r => (r.haus || []).length))){
  console.log('\nHaupthaus, Flügel, Söldnerkompanien, Geschütze\n');
  console.log('| Bot | Rathaus (Anteil) | Rathaus in Wahl (Median) | Rathaus fertig (Median) | Residenz (Anteil) | Residenz fertig (Median) | Flügel (Anteil der Partien) | Kompanien je Partie (Mittel) | Geschütze je Partie (Mittel) |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const [bot] of BOTS){
    const rs = field(raw[bot].aus); if (!rs.length) continue;
    const st = n => rs.map(r => (r.haus || []).find(h => h.stufe === n)).filter(Boolean);
    const s2 = st(2), s3 = st(3), fl = {};
    for (const r of rs) for (const f of r.fluegel || []) fl[f.id] = (fl[f.id] || 0) + 1;
    const row = { rathaus: pc(s2.length, rs.length), rathausWahl: median(s2.map(h => h.wahl)), rathausT: median(s2.map(h => h.t)), residenz: pc(s3.length, rs.length), residenzT: median(s3.map(h => h.t)),
      fluegel: Object.fromEntries(Object.entries(fl).map(([k, v]) => [k, pc(v, rs.length)])), kompanien: mean(rs.map(r => r.kompanien || 0)), geschuetze: mean(rs.map(r => (r.gekauft && r.gekauft.geschuetz) || 0)) };
    out.bots[bot].haus = row;
    console.log(`| ${bot} | ${row.rathaus} % | ${row.rathausWahl ?? '–'} | ${mm(row.rathausT)} | ${row.residenz} % | ${mm(row.residenzT)} | ${Object.entries(row.fluegel).map(([k, v]) => `${k} ${v} %`).join(', ') || '–'} | ${f1(row.kompanien)} | ${f1(row.geschuetze)} |`);
  }
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));

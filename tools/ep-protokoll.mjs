// Klammerfront – Auswertung des Sitzungsprotokolls einer Partie (Teil 8, REQ-K8.01): Wartezeit am Mindestabstand, Übertrag, Abstand zwischen Wahlen, EP je Quelle bei Minute 5, 10, 15.
// Aufruf: node tools/ep-protokoll.mjs <protokoll.json> [weitere.json …]   (Export über den Knopf „Protokoll“ im Spiel mit ?debug=1, Format 4 oder neuer)
import { readFileSync } from 'node:fs';
import { kennzahlen } from './ep-kennzahlen.mjs';
const files = process.argv.slice(2);
if (!files.length){ console.error('Aufruf: node tools/ep-protokoll.mjs <protokoll.json> …'); process.exit(1); }
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
for (const f of files){
  const P = JSON.parse(readFileSync(f, 'utf8'));
  console.log(`\n# ${f}\nPartie: ${P.diff}, Modus ${P.pacing}${P.druck ? ', Druck ' + P.druck : ''}, Version ${P.version}, Ergebnis ${P.result || P.status || '–'}, Dauer ${mm(P.durationS ?? P.endS ?? P.t)}`);
  if (!P.stufen || !P.stufen.length){ console.log('Das Protokoll enthält keine Daten zu Stufenaufstiegen (Format vor Teil 8 oder Modus standard).'); continue; }
  const wahlen = P.stufen.map(s => ({ n: s.n, t: s.erschienenS, lt: s.stufeT, w: s.wartezeitS, ue: s.uebertrag, rest: s.wartend }));
  const k = kennzahlen(wahlen);
  console.log(`Wahlen: ${k.wahlen} · gebremst (Wartezeit über 5 s): ${k.gebremst} (${k.gebremstAnteil == null ? '–' : Math.round(100 * k.gebremstAnteil)} %) · mittlere Wartezeit ${f1(k.wartezeitMittel)} s · Übertrag im Median ${k.uebertragMedian == null ? '–' : Math.round(100 * k.uebertragMedian)} % der Stufenkosten`);
  console.log(`Mittlerer Abstand zwischen zwei Wahlen: bis Minute 10 ${f1(k.abstandVor10)} s (${k.nVor10}), nach Minute 10 ${f1(k.abstandNach10)} s (${k.nNach10}) · höchstens ${k.wartendMax} weitere wartende Stufen`);
  console.log('\n| Nr. | Stufe erreicht | Wahl erschienen | Wartezeit | Übertrag | wartende Stufen |\n|---|---|---|---|---|---|');
  for (const w of wahlen) console.log(`| ${w.n} | ${mm(w.lt)} | ${mm(w.t)} | ${w.w == null ? '–' : f1(w.w) + ' s'} | ${w.ue == null ? '–' : Math.round(100 * w.ue) + ' %'} | ${w.rest ?? '–'} |`);
  const at = P.xpBySourceAt || {};
  if (Object.keys(at).length){
    const quellen = [...new Set(Object.values(at).flatMap(o => Object.keys(o)))].filter(q => q !== 'total');
    console.log(`\nEP je Quelle (kumuliert)\n\n| Quelle | ${Object.keys(at).map(m => 'Minute ' + m).join(' | ')} |\n|---|${Object.keys(at).map(() => '---|').join('')}`);
    console.log(`| gesamt | ${Object.keys(at).map(m => at[m].total ?? '–').join(' | ')} |`);
    for (const q of quellen) console.log(`| ${q} | ${Object.keys(at).map(m => at[m][q] ?? 0).join(' | ')} |`);
  }
}

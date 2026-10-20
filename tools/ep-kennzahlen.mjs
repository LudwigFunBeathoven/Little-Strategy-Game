// Klammerfront – Kennzahlen der Kartenwahl-Taktung (Teil 8, REQ-K8.01), gemeinsam für die Simulation (tools/basis-p8.mjs) und Sitzungsprotokolle (tools/ep-protokoll.mjs).
// Eingabe: Liste der Wahlen einer Partie { n, t (Erscheinen, s), lt (Zeitpunkt der Stufe), w (Wartezeit am Mindestabstand, s), ue (Übertrag, Anteil der Stufenkosten), rest (weitere wartende Stufen) }.
export const GEBREMST_S = 5;         // Wahlen mit Wartezeit über 5 s gelten als gebremst
const sortN = a => [...a].sort((x, y) => x - y);
export const median = a => { const v = a.filter(x => x != null); if (!v.length) return null; const s = sortN(v); return s[Math.floor(s.length / 2)]; };
export const mean = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; };

/** Kennzahlen einer Partie. */
export function kennzahlen(wahlen){
  const ws = (wahlen || []).filter(w => w && w.t != null);
  const mitW = ws.filter(w => w.w != null);
  const abstand = (von, bis) => { const a = []; for (let i = 1; i < ws.length; i++) if (ws[i].t > von && ws[i].t <= bis) a.push(ws[i].t - ws[i - 1].t); return a; };
  const vor = abstand(0, 600), nach = abstand(600, Infinity);
  return {
    wahlen: ws.length,
    gebremst: mitW.filter(w => w.w > GEBREMST_S).length,
    gebremstAnteil: mitW.length ? mitW.filter(w => w.w > GEBREMST_S).length / mitW.length : null,
    wartezeitMittel: mean(mitW.map(w => w.w)),
    uebertragMedian: median(ws.map(w => w.ue)),
    abstandVor10: mean(vor), abstandNach10: mean(nach), nVor10: vor.length, nNach10: nach.length,
    wartendMax: Math.max(0, ...ws.map(w => w.rest || 0)),
  };
}

/** Zusammenfassung über mehrere Partien (Median der Partie-Kennzahlen, Anteil gebremster Wahlen über alle Wahlen). */
export function fasseZusammen(partien){
  const k = partien.map(p => kennzahlen(p));
  const alle = partien.flatMap(p => (p || []).filter(w => w && w.w != null));
  return {
    partien: k.length,
    wahlenMedian: median(k.map(x => x.wahlen)),
    gebremstAnteil: alle.length ? alle.filter(w => w.w > GEBREMST_S).length / alle.length : null,
    wartezeitMittel: mean(alle.map(w => w.w)),
    uebertragMedian: median(alle.map(w => w.ue)),
    abstandVor10: mean(k.map(x => x.abstandVor10)), abstandNach10: mean(k.map(x => x.abstandNach10)),
    abstandNach10Median: median(k.map(x => x.abstandNach10)),
    wartendMaxMedian: median(k.map(x => x.wartendMax)),
  };
}

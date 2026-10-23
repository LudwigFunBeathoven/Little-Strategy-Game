// Klammerfront – Kennzahlen eines Messfeldes für Kartenpfad Teil 12 (REQ-K12.05), gemeinsam für tools/basis-k12.mjs und tools/kalib-k12.mjs.
import { median, mean, GEBREMST_S } from './ep-kennzahlen.mjs';
const cv = ts => { const d = []; for (let i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1]); if (d.length < 3) return null; const m = mean(d); return m > 0 ? Math.sqrt(mean(d.map(x => (x - m) ** 2))) / m : null; };
/** Abstand zwischen Wahl n und n+1 (Erscheinen) einer Partie, Sekunden. */
export const abstandBei = (r, n) => { const a = (r.wahlen || []).find(w => w.n === n), b = (r.wahlen || []).find(w => w.n === n + 1); return a && b ? b.t - a.t : null; };
/** Kennzahlen einer Menge von Partien (ein Bot, ein Budget, ein Feld). abstandAb10: Median aller Abstände nach Wahl 10 und später. */
export function feldKennzahlen(rs){
  const alle = rs.flatMap(r => r.wahlen || []), mitW = alle.filter(w => w.w != null), bis6 = mitW.filter(w => w.n <= 6);
  const ab10 = rs.flatMap(r => (r.wahlen || []).filter(w => w.n >= 10).map(w => abstandBei(r, w.n))).filter(x => x != null);
  const bei = n => median(rs.map(r => abstandBei(r, n)));
  return { n: rs.length, siege: rs.filter(r => r.status === 'won').length / rs.length, patt: rs.filter(r => r.status !== 'won' && r.status !== 'lost').length / rs.length,
    dauer: median(rs.map(r => r.t)), wahlen: median(rs.map(r => (r.wahlen || []).length)),
    gebremst: mitW.length ? mitW.filter(w => w.w > GEBREMST_S).length / mitW.length : null, gebremst6: bis6.length ? bis6.filter(w => w.w > GEBREMST_S).length / bis6.length : null,
    abstandAb10: median(ab10), abstandAb10N: ab10.length, abstand5: bei(5), abstand10: bei(10),
    cv: median(rs.map(r => cv((r.wahlen || []).map(w => w.t))).filter(x => x != null)), rueck1: rs.filter(r => (r.rueckMax || 0) <= 1).length / rs.length, rueckMax: Math.max(0, ...rs.map(r => r.rueckMax || 0)) };
}

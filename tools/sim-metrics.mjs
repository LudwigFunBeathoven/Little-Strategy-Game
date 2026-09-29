// Klammerfront – Kennzahlen, die die Simulation je Takt erhebt (Iteration 6). Nur Werkzeug, nicht Teil der Spiellogik.

/* Richtungswechsel (REQ-6.01): Vorzeichenwechsel der Bewegung je Einheit, längs (x) und quer (Lane und Platz in der Reihe,
   so wie gezeichnet). Nicht gezählt: Wechsel im Takt eines Zustandswechsels der eigenen Gruppe und im Takt danach.
   Tote Einheiten verschwinden aus der Liste und zählen deshalb nicht.
   Ergebnis: größte Zahl von Wechseln einer Einheit innerhalb einer Sekunde (maxPerSecond) und Wechsel je Einheit und Sekunde (rate). */
export function directionTracker(opts = {}){
  const EPS = opts.eps ?? 1e-6, SPREAD = opts.spread ?? 0.15;
  const units = new Map(), formState = new Map();
  let changes = 0, unitTime = 0, maxPerSecond = 0, worst = null;
  const lateral = u => (u.laneF ?? u.lane) + ((u.col || 0) - ((u.rowSize || 1) - 1) / 2) * SPREAD;
  return {
    sample(S, dt){
      const changed = new Set();
      for (const f of S.forms){ const prev = formState.get(f.id); if (prev !== undefined && prev !== f.state) changed.add(f.id); formState.set(f.id, f.state); }
      const seen = new Set();
      for (const u of S.units){
        if (u.hp <= 0) continue;
        seen.add(u.id);
        const x = u.x, y = lateral(u);
        let r = units.get(u.id);
        if (!r){ units.set(u.id, { x, y, sx: 0, sy: 0, times: [], quiet: 0 }); continue; }
        unitTime += dt;
        const quiet = changed.has(u.form) || r.quiet > 0;
        r.quiet = changed.has(u.form) ? 1 : Math.max(0, r.quiet - 1);
        for (const [axis, d] of [['sx', x - r.x], ['sy', y - r.y]]){
          if (Math.abs(d) <= EPS) continue;
          const s = Math.sign(d);
          if (r[axis] !== 0 && s !== r[axis] && !quiet){
            changes++;
            r.times.push(S.t);
            while (r.times.length && S.t - r.times[0] > 1 + 1e-9) r.times.shift();
            if (r.times.length > maxPerSecond){ maxPerSecond = r.times.length; worst = { id: u.id, t: +S.t.toFixed(2), side: u.side, axis: axis === 'sx' ? 'x' : 'quer' }; }
          }
          r[axis] = s;
        }
        r.x = x; r.y = y;
      }
      for (const id of units.keys()) if (!seen.has(id)) units.delete(id);
    },
    result(){ return { changes, unitTime, rate: unitTime ? changes / unitTime : 0, maxPerSecond, worst }; },
  };
}

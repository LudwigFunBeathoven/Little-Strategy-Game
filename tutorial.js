/* Klammerfront – Tutorial „Erste Schritte“ (REQ-T.01, T.04, T.06): Schrittlogik ohne Spielregeln und ohne Zugriff auf Seite oder Fenster.
   Sie hört auf Ereignisse der Spiellogik (core.js, G.on) und führt Buch: welche Schritte erledigt sind, wann, ob übersprungen wurde, wie oft
   daneben geklickt wurde. Gezeichnet wird in render.js, panels.js und ui.js. Der Speicher wird von außen übergeben ({ get, set }), damit die
   Logik ohne Browser testbar ist. Die Schritte stehen in data/tutorial-steps.js, die Texte in den Sprachdateien unter 'tut.*'. */
const KF_TUTORIAL = (() => {
'use strict';

function create(steps, storage, key){
  const fresh = () => ({ active: false, done: {}, doneAt: {}, progress: {}, demoShown: {}, misses: {}, skippedAt: null, ended: null });
  let st = fresh(), muted = 0;
  const subs = [];
  const notify = (type, id) => { for (const f of subs) f(type, id); };
  const store = (k, v) => { try { storage.set(k, v); } catch (e) { /* Speicher nicht verfügbar */ } };
  const load = k => { try { return storage.get(k); } catch (e) { return null; } };

  const currentStep = () => st.active ? steps.find(s => !st.done[s.id]) || null : null;
  const matches = (step, name, data) => step.on === name && Object.entries(step.where || {}).every(([k, v]) => data && data[k] === v);

  return {
    steps,
    /* Ein neues Tutorial beginnt (neue Partie). */
    start(){ st = fresh(); st.active = true; store(key, 'started'); notify('start'); },
    /* Ereignis aus der Spiellogik; t = Spielzeit in Sekunden. Liefert die Kennungen der dabei erledigten Schritte. */
    event(name, data, t = 0){
      if (!st.active || muted) return [];
      const finished = [];
      for (const s of steps){
        if (st.done[s.id] || !matches(s, name, data)) continue;
        st.progress[s.id] = (st.progress[s.id] || 0) + (s.sum ? Number(data[s.sum]) || 0 : 1);
        if (st.progress[s.id] >= s.need){ st.done[s.id] = true; st.doneAt[s.id] = +Number(t).toFixed(2); finished.push(s.id); }
      }
      for (const id of finished) notify('done', id);
      return finished;
    },
    /* Vorführung der Figur: ihre Handlungen zählen nicht als Fortschritt des Spielers. */
    silently(fn){ muted++; try { return fn(); } finally { muted--; } },
    /* Ansicht für die Oberfläche: aus (off), Schritt (step) oder Abschied (farewell, alle Schritte erledigt). */
    view(){
      if (!st.active) return { phase: 'off' };
      const s = currentStep();
      if (s && !s.farewell) return { phase: 'step', step: s, index: steps.indexOf(s) };
      if (s) return { phase: 'wait', step: s, index: steps.indexOf(s) };       // Abschiedsschritt: Ziel noch offen, keine Zeile
      return { phase: 'farewell', step: steps.find(x => x.farewell) || steps[steps.length - 1] };
    },
    active: () => st.active,
    isDone: id => !!st.done[id],
    progress: id => st.progress[id] || 0,
    demoShown: id => !!st.demoShown[id],
    markDemoShown(id){ st.demoShown[id] = true; },
    /* Klick außerhalb des hervorgehobenen Ziels; zählt für den aktuellen Schritt (REQ-T.07). */
    misclick(){
      const s = st.active ? (currentStep() || steps[steps.length - 1]) : null;
      if (s) st.misses[s.id] = (st.misses[s.id] || 0) + 1;
    },
    /* Überspringen (Knopf) beendet das Tutorial sofort. */
    skip(){
      if (!st.active) return false;
      const s = currentStep();
      st.skippedAt = s ? s.id : 'farewell';
      return this.end('skipped');
    },
    /* Ende nach der Abschiedszeile bzw. Überspringen. */
    end(kind = 'completed'){
      if (!st.active) return false;
      st.active = false; st.ended = kind;
      store(key, kind === 'skipped' ? 'skipped' : 'done');
      notify('end', kind);
      return true;
    },
    /* Soll das Tutorial in einer neuen Partie automatisch starten? param = Wert von ?tutorial=… (REQ-T.04) */
    due(param){
      if (param === '0') return false;
      if (param === '1') return true;
      return !load(key);                                // erste Partie in diesem Browser; ohne Speicher jedes Mal
    },
    snapshot: () => JSON.parse(JSON.stringify(st)),
    restore(o){
      st = fresh();
      if (o && typeof o === 'object'){
        for (const k of Object.keys(st)) if (k in o) st[k] = o[k];
        for (const k of ['done', 'doneAt', 'progress', 'demoShown', 'misses']) if (!st[k] || typeof st[k] !== 'object') st[k] = {};
      }
      notify('restore');
    },
    /* Kennzahlen für das Sitzungsprotokoll (REQ-T.07) */
    data: () => ({ stepTimes: Object.assign({}, st.doneAt), skipped: st.ended === 'skipped', skippedAt: st.skippedAt, completed: st.ended === 'completed',
                   misclicks: Object.assign({}, st.misses), progress: Object.assign({}, st.progress) }),
    on(fn){ subs.push(fn); },
  };
}

return { create };
})();

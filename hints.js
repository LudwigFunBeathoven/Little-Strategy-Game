/* Klammerfront – Erstkontakt-Hinweise (REQ-20.2/20.3).
   Beim ersten Auftreten eines Systems erscheint einmalig ein kurzer Hinweis. Gesehene Hinweise werden im Browser-Speicher
   vermerkt. Der Speicher wird von außen übergeben ({ get(key), set(key, value) }), damit die Logik ohne Browser testbar ist.
   Texte stehen in den Sprachdateien unter 'hint.<id>'. */
const KF_HINTS = (() => {
'use strict';
const DYN = /^disc:[a-z0-9_:.-]+$/i;                                                                            // REQ-K2.06: Hinweise auf neu auftauchende Elemente, je Element einmal
const IDS = ['buildings', 'research', 'demolish', 'siege', 'wall', 'tower', 'smithy', 'kontor', 'neighbors'];   // Start und erste Welle erklärt das Tutorial (REQ-T.05)

function create(storage, key){
  let seen = load();
  function load(){
    try {
      const v = JSON.parse(storage.get(key) || '[]');
      return new Set(Array.isArray(v) ? v.filter(id => IDS.includes(id) || DYN.test(id)) : []);
    } catch (e) { return new Set(); }
  }
  function save(){ try { storage.set(key, JSON.stringify([...seen])); } catch (e) { /* Speicher nicht verfügbar */ } }
  return {
    /* true, wenn der Hinweis jetzt gezeigt werden soll; danach gilt er als gesehen */
    trigger(id){
      if (!(IDS.includes(id) || DYN.test(id)) || seen.has(id)) return false;
      seen.add(id); save();
      return true;
    },
    seen: id => seen.has(id),
    reset(){ seen = new Set(); save(); },
  };
}

return { IDS, create };
})();

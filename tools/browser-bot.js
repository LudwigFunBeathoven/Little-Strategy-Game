/* Klammerfront – Bot „Einheiten zuerst“ (REQ-6.09; zuvor REQ-5.09 Durchlauftest, REQ-5.11 Protokollprüfung).
   Feste Bauordnung, schickt ständig Einheiten bis zum Limit, nimmt die erste Karte; keine Vorausschau.
   Nutzt nur die öffentlichen Aktionen der Spiellogik (G.doClick, G.spawn, G.buildAt, G.repair, G.buy, G.startResearch, G.chooseDraft)
   und verhält sich nach einem Profil aus tools/sim-bot.mjs: Klicks je Sekunde, Reaktionsintervall, Einheitenlimit, Mauernutzung.
   Eine Quelle für zwei Zwecke: Playwright lädt die Datei in die Seite, die Simulation (tools/sim-bot.mjs, Strategie
   „einheiten-zuerst“) in ihren vm-Kontext. hooks (optional): draft(G) vor jeder Kartenwahl, built(type) nach jedem Bau. */
'use strict';
function KF_BROWSER_BOT(G, profile, hooks){
  const C = KF_CONFIG, o = Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true }, profile), h = hooks || {};
  const pickFirst = () => { if (h.draft) h.draft(G); const i = KF_BROWSER_BOT.pfadPick(G, G.S.pendingDraft.options, o.pfad); G.chooseDraft(i === null ? 0 : i); };
  const build = (slot, type) => { if (G.buildAt(slot, type) && h.built) h.built(type); };
  let clickAcc = 0, actAcc = 0, mix = 0;
  const PRIO = ['presse', 'ausbau', 'qualitaet', 'turm_0', 'turm_2', 'mauer'];
  function act(){
    const S = G.S;
    if (S.pendingDraft){ pickFirst(); return; }
    if (o.useWall) S.sections.forEach((s, i) => { if (s.hp < G.sectionMax(i) * 0.5) G.repair(i); });
    const free = S.slots.findIndex(x => !x);
    // Bauplatz mit dem größten Nachbarschaftsnutzen (REQ-6.07 a); bei Gleichstand der erste freie
    const bestSlot = type => { let best = free, bg = -Infinity;
      S.slots.forEach((x, i) => { if (x) return; const g = G.neighborGain ? G.neighborGain(i, type) : 0; if (g > bg + 1e-9){ bg = g; best = i; } }); return best; };
    if (free >= 0 && !o.noBuild){
      const type = G.factoryCount() < 3 ? 'fabrik' : ['kaserne', 'schmiede', 'universitaet', 'kontor', 'fabrik'].find(b => !(o.forbid || []).includes(b) && G.buildBlock(free, b) === null);
      if (type) build(bestSlot(type), type);
    } else if (free >= 0 && G.buildBlock(free, 'fabrik') === null) build(bestSlot('fabrik'), 'fabrik');
    if (!o.noUpgrades){
      for (const id of PRIO) if (C.UPGRADES[id] && (o.useWall || !/^(turm|mauer)/.test(id))) G.buy(id);
      const r = G.RESEARCH.find(x => G.researchBlock(x.id) === null);
      if (r && S.material > G.researchCost(r.id) * 2 && G.startResearch(r.id) && h.researched) h.researched(r.id);
    }
    if (o.noUnits) return;
    // Welle vorziehen (REQ-6.07 c): halbe Versorgung in der Warteschlange und doppelte Kosten im Bestand
    if (G.waveRushBlock && !G.waveRushBlock() && S.queue.length * 2 >= G.supplyCap() && S.material >= 2 * G.waveRushCost()) G.rushWave();
    for (let k = 0; k < 4; k++){
      if (G.ownOnField() + S.queue.length >= o.cap || G.supplyFull()) break;
      if (!(mix % 3 === 2 && G.unitUnlocked('werfer') ? G.spawn('werfer') : G.spawn('laeufer'))) break;
      mix++;
    }
  }
  return {
    /* ein Schritt: Spiellogik, Klicks im Profiltempo, Entscheidungen im Reaktionsintervall */
    step(dt){
      G.tick(dt);
      clickAcc += o.cps * dt;
      while (clickAcc >= 1){ G.doClick(); clickAcc--; }
      actAcc += dt;
      if (actAcc >= o.every){ actAcc = 0; act(); }
      if (G.S.pendingDraft) pickFirst();
    },
  };
}

/* Pfadkarten (REQ-KP.09): Im Modus 'karten' wählt der Bot aus dem Angebot die Karte, die in seiner Pfadreihenfolge am weitesten vorn steht;
   steht keine darin, gilt die bisherige Regel der Strategie (null). Drei Pfad-Varianten messen die Strategievielfalt. */
KF_BROWSER_BOT.PFAD_ORDER = {
  militaer: ['echtesMilitaer', 'fortgeschritteneTaktiken', 'gelehrte', 'metallverarbeitung', 'eiserneKlingen', 'pfadFestungsbau', 'befestigungskunde', 'handel'],
  wissen:   ['gelehrte', 'metallverarbeitung', 'eiserneKlingen', 'echtesMilitaer', 'fortgeschritteneTaktiken', 'pfadFestungsbau', 'befestigungskunde', 'handel'],
  festung:  ['pfadFestungsbau', 'gelehrte', 'befestigungskunde', 'echtesMilitaer', 'metallverarbeitung', 'fortgeschritteneTaktiken', 'eiserneKlingen', 'handel'],
};
KF_BROWSER_BOT.pfadPick = function(G, offer, variant){
  if (G.pacing() !== 'karten') return null;
  const order = KF_BROWSER_BOT.PFAD_ORDER[variant || 'militaer'] || KF_BROWSER_BOT.PFAD_ORDER.militaer;
  let best = null, rank = Infinity;
  offer.forEach((id, i) => { const r = order.indexOf(id); if (r >= 0 && r < rank){ rank = r; best = i; } });
  return best;
};

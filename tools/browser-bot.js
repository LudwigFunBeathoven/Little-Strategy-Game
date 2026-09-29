/* Klammerfront – vereinfachter Bot für Partien im Browser (REQ-5.09 Durchlauftest, REQ-5.11 Protokollprüfung).
   Nutzt nur die öffentlichen Aktionen der Spiellogik (G.doClick, G.spawn, G.buildAt, G.repair, G.buy, G.startResearch, G.chooseDraft)
   und verhält sich nach einem Profil aus tools/sim-bot.mjs: Klicks je Sekunde, Reaktionsintervall, Einheitenlimit, Mauernutzung.
   Keine Vorausschau; für Balancing gilt weiter tools/simulate.mjs. Wird von Playwright in die Seite geladen. */
'use strict';
function KF_BROWSER_BOT(G, profile){
  const C = KF_CONFIG, o = Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true }, profile);
  let clickAcc = 0, actAcc = 0, mix = 0;
  const PRIO = ['presse', 'ausbau', 'qualitaet', 'turm_0', 'turm_2', 'mauer'];
  function act(){
    const S = G.S;
    if (S.pendingDraft){ G.chooseDraft(0); return; }
    if (o.useWall) S.sections.forEach((s, i) => { if (s.hp < G.sectionMax(i) * 0.5) G.repair(i); });
    const free = S.slots.findIndex(x => !x);
    if (free >= 0 && !o.noBuild){
      const type = G.factoryCount() < 3 ? 'fabrik' : ['kaserne', 'schmiede', 'universitaet', 'fabrik'].find(b => G.buildBlock(free, b) === null);
      if (type) G.buildAt(free, type);
    } else if (free >= 0 && G.buildBlock(free, 'fabrik') === null) G.buildAt(free, 'fabrik');
    if (!o.noUpgrades){
      for (const id of PRIO) if (C.UPGRADES[id] && (o.useWall || !/^(turm|mauer)/.test(id))) G.buy(id);
      const r = G.RESEARCH.find(x => G.researchBlock(x.id) === null);
      if (r && S.material > G.researchCost(r.id) * 2) G.startResearch(r.id);
    }
    if (o.noUnits) return;
    for (let k = 0; k < 4; k++){
      if (G.ownOnField() + S.queue.length >= o.cap || G.supplyFull()) break;
      if (!(mix % 3 === 2 ? G.spawn('werfer') : G.spawn('laeufer'))) break;
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
      if (G.S.pendingDraft) G.chooseDraft(0);
    },
  };
}

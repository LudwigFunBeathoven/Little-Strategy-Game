/* Klammerfront – Bot „Einheiten zuerst“ (REQ-6.09; zuvor REQ-5.09 Durchlauftest, REQ-5.11 Protokollprüfung).
   Feste Bauordnung, schickt ständig Einheiten bis zum Limit, nimmt die erste Karte; keine Vorausschau.
   Nutzt nur die öffentlichen Aktionen der Spiellogik (G.doClick, G.spawn, G.buildAt, G.repair, G.buy, G.startResearch, G.chooseDraft)
   und verhält sich nach einem Profil aus tools/sim-bot.mjs: Klicks je Sekunde, Reaktionsintervall, Einheitenlimit, Mauernutzung.
   Eine Quelle für zwei Zwecke: Playwright lädt die Datei in die Seite, die Simulation (tools/sim-bot.mjs, Strategie
   „einheiten-zuerst“) in ihren vm-Kontext. hooks (optional): draft(G) vor jeder Kartenwahl, built(type) nach jedem Bau. */
'use strict';
function KF_BROWSER_BOT(G, profile, hooks){
  const C = KF_CONFIG, o = Object.assign({ cps: 1.5, every: 1, cap: 22, useWall: true }, profile), h = hooks || {};
  const pickFirst = () => { if (h.draft) h.draft(G); const i = KF_BROWSER_BOT.pfadPick(G, G.S.pendingDraft.options, o.pfad, o.kat); G.chooseDraft(i === null ? 0 : i); };
  const build = (slot, type) => { if (G.buildAt(slot, type) && h.built) h.built(type); };
  let clickAcc = 0, actAcc = 0, mix = 0;
  const PRIO = ['presse', 'ausbau', 'qualitaet', 'turm_0', 'turm_2', 'mauer'];
  function act(){
    const S = G.S;
    if (S.pendingDraft){ pickFirst(); return; }
    if (o.useWall) S.sections.forEach((s, i) => { if (s.hp < G.sectionMax(i) * 0.5) G.repair(i); });
    let free = S.slots.findIndex(x => !x);
    // Bauplatz mit dem größten Nachbarschaftsnutzen (REQ-6.07 a); bei Gleichstand der erste freie
    const bestSlot = type => { let best = free, bg = -Infinity;
      S.slots.forEach((x, i) => { if (x) return; const g = G.neighborGain ? G.neighborGain(i, type) : 0; if (g > bg + 1e-9){ bg = g; best = i; } }); return best; };
    // Haupthaus (Teil 7, REQ-K7.12): Ausbau bezahlen, sobald die Karte gewählt ist und das Material reicht; Flügel nach fester Regel je Kategorie
    const haus = G.pacing() === 'karten' && !!S.haus;
    if (haus){
      if (G.hausBlock() === null) G.hausAusbau();
      if (G.fluegelFrei() > 0){ const f = KF_BROWSER_BOT.KAT_FLUEGEL[o.kat || 'ohne'].concat(Object.keys(C.HAUPTHAUS.fluegel)).find(id => G.fluegelBlock(id) === null); if (f) G.chooseFluegel(f); }
    }
    const reserve = haus && G.hausBlock() === 'material' ? G.hausKosten() : 0;       // Rücklage für den Ausbau: Tausch, Ausbauten und Forschung warten
    const covered = haus ? KF_BROWSER_BOT.covered(G).filter(b => !G.weiterDone(b)) : [];       // ein weiterentwickeltes Gebäude (Handelshaus, Gießerei) bleibt stehen                   // Gebäude, deren Grundfunktion ein gewählter Flügel übernimmt
    const fabWanted = haus && G.fabrikPlaetze() < G.fabrikGrenze();
    // Modus karten: ist das Raster voll und ein inzwischen freigeschaltetes Gebäude fehlt, reißt der Bot eine Fabrik ab (wie der Bot „gierig“); sonst blockiert ein früh gefülltes Raster die Kaserne
    if (free < 0 && !o.noBuild && G.pacing() === 'karten' && G.factoryCount() > 3){
      const want = ['kaserne', 'schmiede', 'universitaet', 'kontor'].find(b => !(o.forbid || []).includes(b) && !covered.includes(b) && !G.has(b) && G.isBuildable(b));
      const i = want ? S.slots.findIndex(x => x && x.type === 'fabrik') : -1;
      if (i >= 0) G.demolish(i);
    }
    // Teil 7: Raster voll, die Obergrenze erlaubt eine weitere Fabrik: das Gebäude, das ein Flügel ersetzt, weicht ihr
    if (S.slots.findIndex(x => !x) < 0 && !o.noBuild && fabWanted){ const i = S.slots.findIndex(x => x && covered.includes(x.type)); if (i >= 0) G.demolish(i); }
    free = S.slots.findIndex(x => !x);
    if (free >= 0 && !o.noBuild){
      const type = G.factoryCount() < 3 ? 'fabrik' : ['kaserne', 'schmiede', 'universitaet', 'kontor', 'fabrik'].find(b => !(o.forbid || []).includes(b) && !(fabWanted && covered.includes(b)) && G.buildBlock(free, b) === null);
      if (type) build(bestSlot(type), type);
    } else if (free >= 0 && G.buildBlock(free, 'fabrik') === null) build(bestSlot('fabrik'), 'fabrik');
    // Forschungsbudget (Teil 5, REQ-K5.10): feste Regel je Kategorie-Bot – Militär 0 %, Wirtschaft 50 %, Verteidigung 25 %; ohne Kategorie und Angabe 0 %; o.budget überschreibt (Stufe 0, 1, 2)
    if (G.pacing() === 'karten' && G.has('universitaet')){
      const want = o.budget !== undefined ? o.budget : o.kat ? KF_BROWSER_BOT.KAT_BUDGET[o.kat] : 0;
      if (G.budgetStufe() !== want) G.setBudget(want);
    }
    // Freihandel (Teil 6, REQ-K6.05): Material über dem Dreifachen eines Stapels wird gegen EP getauscht (höchstens zwei Stapel je Entscheidung)
    if (G.pacing() === 'karten' && G.freihandel()){
      const F = C.DOKTRIN.freihandel;
      for (let k = 0; k < 2 && S.material - reserve >= 3 * F.stapelMaterial && !G.tradeBlock('ep'); k++) G.tradeMaterialToXp();
    }
    if (o.kat && G.pacing() === 'karten') KF_BROWSER_BOT.aufwerten(G, o.kat, h);       // Kategorie-Bot (Teil 4, ab Teil 6 nach Kategorie): Gebäude zu Varianten seiner Kategorie aufwerten
    if (!o.noUpgrades && !reserve){
      for (const id of PRIO) if (C.UPGRADES[id] && (o.useWall || !/^(turm|mauer)/.test(id))) G.buy(id);
      const pr = KF_BROWSER_BOT.pfadResearch(G), r = pr ? G.RES[pr] : G.RESEARCH.find(x => G.researchBlock(x.id) === null);
      if (r && S.material > G.researchCost(r.id) * 2 && G.startResearch(r.id) && h.researched) h.researched(r.id);
    }
    // Söldnerkompanien (Teil 7, REQ-K7.12): der Wirtschafts-Bot kauft, sobald das Material über dem Doppelten des Preises liegt
    if (o.kat === 'wirtschaft' && G.pacing() === 'karten' && !G.kompanieBlock() && S.material - reserve > 2 * G.kompanieKosten()) G.hireKompanie();
    if (o.noUnits) return;
    // Welle vorziehen (REQ-6.07 c): halbe Versorgung in der Warteschlange und doppelte Kosten im Bestand
    if (G.waveRushBlock && !G.waveRushBlock() && S.queue.length * 2 >= G.supplyCap() && S.material >= 2 * G.waveRushCost()) G.rushWave();
    for (let k = 0; k < 4; k++){
      if (G.ownOnField() + S.queue.length >= o.cap || G.supplyFull()) break;
      const gun = mix % 4 === 3 && G.unitUnlocked('geschuetz');                // Teil 7: mit der Gießerei jede vierte Einheit ein Geschütz
      if (!(gun ? G.spawn('geschuetz') : mix % 3 === 2 && G.unitUnlocked('werfer') ? G.spawn('werfer') : G.spawn('laeufer'))) break;
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
KF_BROWSER_BOT.NEUTRAL_WEITER = ['geschuetzguss'];
KF_BROWSER_BOT.PFAD_ORDER = {
  militaer: ['fortgeschritteneTaktiken', 'eiserneKlingen', 'ballistik', 'befestigungskunde', 'geschuetzguss'],       // Teil 5: nur noch Technologie-Karten (Bau-Karten entfallen); Teil 7: Geschützguss zuletzt
  wissen:   ['eiserneKlingen', 'befestigungskunde', 'fortgeschritteneTaktiken', 'ballistik', 'geschuetzguss'],
  festung:  ['befestigungskunde', 'eiserneKlingen', 'fortgeschritteneTaktiken', 'ballistik', 'geschuetzguss'],
};
/* Pfadforschung: die Bots erforschen, was ihre Karten geöffnet haben, vor der Grundforschung (REQ-KP.09) */
KF_BROWSER_BOT.PFAD_RESEARCH = ['r_dampfkraft', 'r_buchdruck', 'r_fernhandel', 'r_geschuetzguss', 'r_eisenwaffen', 'r_reiter', 'r_schild', 'r_wehrgang', 'r_schiessscharten'];
KF_BROWSER_BOT.pfadResearch = function(G){
  if (G.pacing() !== 'karten') return null;
  return KF_BROWSER_BOT.PFAD_RESEARCH.find(id => G.RES[id] && G.researchBlock(id) === null) || null;
};
KF_BROWSER_BOT.pfadPick = function(G, offer, variant, kat){
  if (G.pacing() !== 'karten') return null;
  const hi = offer.findIndex(id => G.OPT[id] && G.OPT[id].pfad && G.OPT[id].pfad.haus);           // Teil 7 (REQ-K7.12): Stadtrecht und Hofhaltung, sobald sie erscheinen
  if (hi >= 0) return hi;
  if (kat){                                                                // Kategorie-Bot (Teil 6, REQ-K6.08): zuerst die Karte mit den meisten Treffern in der eigenen Kategorie (eine Doktrin zählt doppelt)
    let bestI = null, score = 0;
    offer.forEach((id, i) => { const o = G.OPT[id], s = [].concat((o && o.kat) || []).filter(k => k === kat).length * (o && o.doktrin ? 2 : 1); if (s > score){ score = s; bestI = i; } });
    if (bestI !== null) return bestI;
    const ni = offer.findIndex(id => KF_BROWSER_BOT.NEUTRAL_WEITER.includes(id));   // Teil 7: neutrale Weiterentwicklung (Geschützguss), wenn keine Karte der eigenen Kategorie im Angebot ist
    if (ni >= 0) return ni;
  }
  const order = KF_BROWSER_BOT.PFAD_ORDER[variant || 'militaer'] || KF_BROWSER_BOT.PFAD_ORDER.militaer;
  let best = null, rank = Infinity;
  offer.forEach((id, i) => { const r = order.indexOf(id); if (r >= 0 && r < rank){ rank = r; best = i; } });
  return best;
};

/* Gebäude-Aufwertung (Teil 4, REQ-S.05): Der Kategorie-Bot wertet jedes Gebäude, für das seine Kategorie eine Variante hat, auf, sobald das Material mit Rücklage reicht.
   Fabriken werden nur zur Manufaktur mehrfach aufgewertet (Ertrag je Gebäude); jede andere Variante wirkt einmal, ein zweites Gebäude brächte nichts. */
KF_BROWSER_BOT.KAT_BUDGET = { militaer: 0, wirtschaft: 2, verteidigung: 1 };       // Stufe des Forschungsbudgets je Kategorie-Bot (0, 25, 50 %)
/* Flügel des Haupthauses (Teil 7, REQ-K7.12): feste Reihenfolge je Kategorie-Bot; der Bot ohne Kategorie nimmt Kanzlei und Zeughaus */
KF_BROWSER_BOT.KAT_FLUEGEL = { militaer: ['zeughaus', 'kanzlei'], wirtschaft: ['schatzkammer', 'bibliothek'], verteidigung: ['bibliothek', 'zeughaus'], ohne: ['kanzlei', 'zeughaus'] };
/* Gebäude, deren Grundfunktion ein Flügel übernimmt: Es weicht einer weiteren Fabrik, wenn das Raster voll ist */
KF_BROWSER_BOT.FLUEGEL_ERSETZT = { bibliothek: 'universitaet', zeughaus: 'schmiede', schatzkammer: 'kontor', kanzlei: 'universitaet' };
KF_BROWSER_BOT.covered = G => (G.S.haus ? G.S.haus.fluegel : []).map(f => KF_BROWSER_BOT.FLUEGEL_ERSETZT[f]);
KF_BROWSER_BOT.KAT_PFAD = { militaer: 'militaer', wirtschaft: 'wissen', verteidigung: 'festung' };       // Pfad-Reihenfolge der Kategorie-Bots
KF_BROWSER_BOT.MEHRFACH = ['manufaktur', 'zunfthaus', 'bastion'];       // Varianten, deren Wirkung je Gebäude gilt
/* Weiterentwicklung eines Bereichs „geöffnet“: die Technologiekarte, die ihre Forschung öffnet, ist gewählt (Teil 6) */
KF_BROWSER_BOT.weiterOffen = function(G, bereich){
  const r = G.weiterResearch(bereich);
  return !!r && G.ALL_OPTIONS.some(o => o.pfad && (o.pfad.oeffnetForschung || []).includes(r.id) && G.cardTaken(o.id) > 0);
};
KF_BROWSER_BOT.aufwerten = function(G, kat, hooks){
  const S = G.S;
  for (let i = 0; i < S.slots.length; i++){
    const sl = S.slots[i];
    if (!sl || sl.upg) continue;
    const cands = G.variantsFor(i).filter(x => x.kat === kat), v = cands.find(x => x.doktrin) || cands[0];       // Sonderbau der gewählten Doktrin zuerst; er löst eine Grundvariante ab (Teil 5)
    if (!v) continue;
    // Teil 6 (REQ-K6.08): Ist die Weiterentwicklung geöffnet (Karte gewählt), aber nicht abgeschlossen, wartet der Bot mit dem Aufwerten dieses Bereichs; die Grundvarianten gingen sonst ohne Erstattung verloren
    if (!v.doktrin && G.weiterResearch(v.basis) && !G.weiterDone(v.basis) && G.researchTier(G.weiterResearch(v.basis).id) === 0 && G.pacing() === 'karten' && KF_BROWSER_BOT.weiterOffen(G, v.basis)) continue;
    // Einschränkung der Doktrin gilt auch für den Bestand (Teil 6, REQ-K6.01): der Bot reißt überzählige Fabriken ab (zuerst ohne Variante, von hinten), damit der Sonderbau frei wird
    if (v.doktrin && G.variantBlock(i, v.id) === 'excess'){
      const cand = S.slots.map((x, k) => ({ x, k })).filter(e => e.x && e.x.type === 'fabrik' && !e.x.upg && e.k !== i).sort((p, q) => (!!p.x.variant - !!q.x.variant) || (q.k - p.k));
      for (let n = G.variantExcess(v.id); n > 0 && cand.length; n--) G.demolish(cand.shift().k);
    }
    if (!KF_BROWSER_BOT.MEHRFACH.includes(v.id) && S.slots.some(x => x && (x.variant === v.id || (x.upg && x.upg.to === v.id)))) continue;
    if (G.variantBlock(i, v.id) !== null || S.material < G.variantCost(v.id) * 1.5) continue;
    if (G.upgradeBuilding(i, v.id) && hooks && hooks.variant) hooks.variant(v.id);
  }
};

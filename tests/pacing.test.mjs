// Tests Pacing-Unterbau (REQ-KP.01): Schalter PACING_MODUS, Freischaltlogik, Upgrade-Stufen, Einheitenersatz.
// Der Modus 'standard' sperrt nichts; die Sperren eines Modus stehen in C.PACING und werden hier für den Test eingesetzt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../tools/load-core.mjs';

const PACING = { karten: { gesperrt: ['bau:kaserne', 'einheit:werfer', 'forschung:r_drill'], stufen: { ausbau: [{ ab: 1, quelle: 'zinnen' }], qualitaet: [{ ab: 3, quelle: 'r_metallurgie' }] } } };
function game(pacing, seed = 11){
  const { KlammerCore, KF_CONFIG } = loadCore();
  KF_CONFIG.PACING = PACING;
  const G = KlammerCore.create(); G.FX.on = false; G.newGame('leicht', seed, pacing ? { pacing } : {});
  return { G, C: KF_CONFIG };
}

test('Standard: nichts ist gesperrt, auch wenn der Modus Sperren kennt', () => {
  const { G } = game(undefined);
  assert.equal(G.pacing(), 'standard');
  for (const k of ['bau:kaserne', 'einheit:werfer', 'forschung:r_drill']) assert.ok(G.isOpen(k), k);
  G.S.material = 1e4;
  assert.ok(G.build('kaserne'));
  assert.equal(G.stageSource('ausbau'), null);
});

test('Modus karten: gesperrte Schlüssel öffnen erst mit unlockKey', () => {
  const { G } = game('karten');
  assert.equal(G.pacing(), 'karten');
  G.S.material = 1e4;
  assert.equal(G.isBuildable('kaserne'), false);
  assert.equal(G.build('kaserne'), false);
  assert.equal(G.unitUnlocked('werfer'), false);
  assert.equal(G.spawn('werfer'), false);
  assert.ok(G.build('fabrik'), 'Fabrik bleibt frei');
  assert.ok(G.spawn('laeufer'), 'Läufer bleibt frei');
  assert.equal(G.unlockKey('bau:kaserne'), true);
  assert.equal(G.unlockKey('bau:kaserne'), false, 'zweites Öffnen ändert nichts');
  assert.ok(G.build('kaserne'));
  assert.equal(G.researchBlock('r_drill'), 'noUni');
  G.unlockKey('einheit:werfer');
  assert.ok(G.spawn('werfer'));
});

test('Upgrade-Stufen: der Kauf verlangt die Quelle der Stufe', () => {
  const { G } = game('karten');
  G.S.material = 1e6; G.unlockKey('bau:kaserne'); G.build('kaserne'); G.build('schmiede');
  assert.equal(G.stageSource('ausbau'), 'zinnen');
  assert.equal(G.buy('ausbau'), false);
  G.S.draft.stacks.zinnen = 1;
  assert.equal(G.stageSource('ausbau'), null);
  assert.ok(G.buy('ausbau'));
  assert.ok(G.buy('qualitaet') && G.buy('qualitaet'));
  assert.equal(G.stageSource('qualitaet'), 'r_metallurgie', 'Stufe 3 braucht die Forschung');
  assert.equal(G.buy('qualitaet'), false);
  G.S.research.done.r_metallurgie = 1;
  assert.ok(G.buy('qualitaet'));
});

test('Einheitenersatz: Warteschlange und Feld werden aufgewertet, die Zahl bleibt gleich', () => {
  const { G, C } = game('karten');
  C.UNITS.testklinge = { key: '9', cost: 20, hp: 60, dmg: 8, cd: 0.8, range: 14, bounty: 10, speed: 34 };
  G.S.material = 1e4;
  G.spawn('laeufer'); G.spawn('laeufer');
  G.addFormation('p', 1, ['laeufer', 'laeufer', 'werfer'], 100);
  const hp0 = G.S.units.filter(u => u.type === 'laeufer')[0];
  hp0.hp = hp0.maxHp / 2;
  const before = G.S.units.length + G.S.queue.length;
  assert.equal(G.replaceUnit('laeufer', 'testklinge'), 4);
  assert.equal(G.S.units.length + G.S.queue.length, before, 'nichts gelöscht');
  assert.ok(G.S.units.filter(u => u.type === 'laeufer').length === 0 && G.S.units.filter(u => u.type === 'testklinge').length === 2);
  assert.ok(G.S.queue.every(q => q.type === 'testklinge'));
  const u = G.S.units.find(x => x.type === 'testklinge' && x.hp < x.maxHp);
  assert.ok(u, 'Lebenspunkte im selben Verhältnis'); assert.ok(Math.abs(u.hp / u.maxHp - 0.5) < 1e-9);
  assert.equal(u.dmg, 8 * G.unitStats('p', 'testklinge').dmg / 8);
  G.spawn('laeufer');
  assert.equal(G.S.queue[G.S.queue.length - 1].type, 'testklinge', 'neue Läufer entstehen als Ersatz');
  assert.equal(G.replaceUnit('laeufer', 'testklinge'), 0, 'zweimal ersetzen ändert nichts');
});

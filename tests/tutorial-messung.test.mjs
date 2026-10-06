// Tests Tutorial, REQ-T.07: Sitzungsprotokoll und Auswertung (tools/compare-human.mjs) kennen die Tutorial-Felder.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = { format: 'klammerfront-session', formatVersion: 1, version: '0.8', diff: 'leicht', result: 'running', durationS: 120, clicks: 60, clicksPerMinute: [60],
  clicksByPhase: { early: 60, mid: 0, late: 0 }, timeByPhase: { early: 120, mid: 0, late: 0 }, actions: [{ t: 5, kind: 'spawn' }, { t: 9, kind: 'buildAt' }],
  drafts: [], research: [], maxUnits: 4, maxArmy: 3, firstWallFallS: null, wallUse: { repairs: 0, upgrades: 0 }, kills: 2, losses: 0 };
function run(files){
  const dir = mkdtempSync(join(tmpdir(), 'kf-'));
  const paths = files.map((f, i) => { const p = join(dir, `p${i}.json`); writeFileSync(p, JSON.stringify(f)); return p; });
  const out = join(dir, 'out.json');
  const text = execFileSync('node', [new URL('../tools/compare-human.mjs', import.meta.url).pathname, ...paths, '--json', out], { encoding: 'utf8' });
  return { text, rows: JSON.parse(readFileSync(out, 'utf8')) };
}

test('Auswertung nennt Schrittzeiten, Fehlklicks und den längsten Schritt', () => {
  const p = Object.assign({}, base, { tutorial: { stepTimes: { fertigen: 6, bauen: 14, rekrutieren: 40, ausruecken: 60, schlacht: 85, karte: 85 }, skipped: false, skippedAt: null, completed: true,
    misclicks: { rekrutieren: 7, bauen: 1 }, progress: {}, greetingMs: 7800, bubbleClicks: 3 } });
  const { text, rows } = run([p]);
  assert.match(text, /Tutorial: abgeschlossen nach 1:25/);
  assert.match(text, /rekrutieren 26 s \(7 Fehlklicks\)/);
  assert.match(text, /längster Schritt: rekrutieren/);
  assert.equal(rows[0].tutorial.slowest, 'rekrutieren');
  assert.equal(rows[0].tutorial.dur.schlacht, 25);
  assert.match(text, /Begrüßung 7\.8 s, 3 Klicks auf Sprechblasen/);
});

test('Auswertung: Überspringen mit Schritt, Zusammenfassung über mehrere Partien', () => {
  const a = Object.assign({}, base, { tutorial: { stepTimes: { fertigen: 5 }, skipped: true, skippedAt: 'bauen', completed: false, misclicks: { bauen: 3 }, progress: {} } });
  const b = Object.assign({}, base, { tutorial: { stepTimes: { fertigen: 8, bauen: 20, rekrutieren: 30, ausruecken: 50, schlacht: 70, karte: 70 }, skipped: false, skippedAt: null, completed: true, misclicks: {}, progress: {} } });
  const { text, rows } = run([a, b]);
  assert.match(text, /übersprungen in Schritt „bauen“/);
  assert.match(text, /TUTORIAL über 2 Partien: übersprungen 1, abgeschlossen 1/);
  assert.match(text, /bauen\s+Median 12 s · Fehlklicks 3 · dort übersprungen 1/);
  assert.equal(rows.length, 2);
});

test('Protokolle ohne Tutorial-Felder werden wie bisher ausgewertet', () => {
  const { text, rows } = run([base]);
  assert.ok(!/Tutorial/.test(text));
  assert.equal(rows[0].tutorial, null);
});

test('session.js und tutorial.js liefern die Felder für das Protokoll', () => {
  const session = readFileSync(new URL('../session.js', import.meta.url), 'utf8');
  assert.match(session, /tutorial: Tutorial\.data\(\)/);
  const tut = readFileSync(new URL('../tutorial.js', import.meta.url), 'utf8');
  for (const field of ['stepTimes', 'skipped', 'skippedAt', 'misclicks']) assert.ok(tut.includes(field), field);
});

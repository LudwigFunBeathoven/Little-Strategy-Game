// Tests Tutorial Teil 2, REQ-T2.01: Eine Partie beginnt nur nach dem Startbildschirm oder mit den URL-Parametern ?lang= / ?difficulty=.
// Regressionstest zur Ursache aus T.3 (boot() startete das Tutorial direkt und umging den Dialog).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
const ui = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

test('startGame wird nur an zwei Stellen aufgerufen: Knopf „Partie beginnen“ und Start über URL-Parameter', () => {
  const calls = [...ui.matchAll(/startGame\(/g)].length - 1;                       // abzüglich der Definition
  assert.equal(calls, 2);
  assert.match(ui, /startGame\(pickDiff, \{ tutorial: pickTutorial \}\)/, 'Dialog');
  assert.match(ui, /const skipStart = !!\(LANG_PARAM \|\| DIFF_PARAM\);/);
  assert.match(ui, /else if \(skipStart\)\{ startGame\(/, 'Start ohne Dialog nur bei skipStart');
  assert.match(ui, /else \{ render\(\); openStart\(false\); \}/, 'sonst der Startbildschirm');
});

test('Der Startbildschirm kennt Sprache, Schwierigkeitsgrad, Tutorial-Schalter und „Partie beginnen“', () => {
  for (const frag of ["'lang:' + l", "'diff:' + key", "'tutorialSwitch'", "t('start.go')", "t('start.recommended')"]) assert.ok(ui.includes(frag), frag);
  assert.match(ui, /return isFirstGame\(\) \? 'leicht'/, 'erste Partie: Leicht');
  assert.match(ui, /pickTutorial = Tutorial\.due\(TUTORIAL_PARAM\)/, 'Tutorial: erste Partie an, danach aus');
});

test('URL-Parameter: ?difficulty=easy|normal|hard und ?lang=de|en', () => {
  assert.match(raw, /const DIFF_ALIAS = \{ easy: 'leicht', normal: 'normal', hard: 'schwer'/);
  assert.match(raw, /KF_CONFIG\.LANGUAGES\.includes\(URL_PARAMS\.get\('lang'\)\)/);
});

test('Das Tutorial hat keine feste Schwierigkeitsstufe mehr', () => {
  const cfg = readFileSync(new URL('../config.js', import.meta.url), 'utf8');
  assert.ok(!/TUTORIAL:[\s\S]*?\bdiff:/.test(cfg.slice(cfg.indexOf('TUTORIAL:'), cfg.indexOf('TUTORIAL:') + 900)), 'config.js: TUTORIAL.diff entfernt');
  assert.ok(!ui.includes('C.TUTORIAL.diff'));
});

// Tests Iteration 5, REQ-5.02: „Altmetall“ heißt überall Erfahrungspunkte (EP); keine alten Bezeichner in Quelltext, Daten und Texten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { loadI18n } from '../tools/load-core.mjs';

const root = new URL('../', import.meta.url);
const SELF = 'tests/naming.test.mjs';
// Ausnahmen laut REQ-5.02: CHANGELOG und archivierte Berichte (docs/, reports/)
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs', 'reports']);
function files(dir = ''){
  const out = [];
  for (const name of readdirSync(new URL(dir || '.', root))){
    const rel = dir ? `${dir}/${name}` : name;
    if (SKIP_DIRS.has(name)) continue;
    if (statSync(new URL(rel, root)).isDirectory()) out.push(...files(rel));
    else if (/\.(js|mjs|html|md|json)$/.test(name) && rel !== 'CHANGELOG.md' && rel !== SELF) out.push(rel);
  }
  return out;
}

test('Keine Fundstelle von „Altmetall“ oder dem alten Bezeichner „scrap“', () => {
  const hits = [];
  for (const f of files()){
    readFileSync(new URL(f, root), 'utf8').split('\n').forEach((line, i) => {
      if (/altmetall|scrap|schrott/i.test(line)) hits.push(`${f}:${i + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(hits, []);
});

test('EP heißt auf Deutsch „EP“, auf Englisch „XP“', () => {
  const L = loadI18n();
  assert.match(L.de['cost.xp'], /\bEP\b/);
  assert.match(L.en['cost.xp'], /\bXP\b/);
});

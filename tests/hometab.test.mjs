// Tests Iteration 6, REQ-6.05: jeder Gebäudetyp hat genau einen Heimat-Reiter (UI.homeTab in config.js); Kaserne → Armee.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCore } from '../tools/load-core.mjs';

test('Heimat-Reiter: jeder Gebäudetyp genau einem vorhandenen Reiter zugeordnet', () => {
  const C = loadCore().KF_CONFIG;
  const tabs = JSON.parse(readFileSync(new URL('../panels.js', import.meta.url), 'utf8').match(/const TABS = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  assert.deepEqual(Object.keys(C.UI.homeTab).sort(), [...C.BUILDINGS].sort(), 'alle Gebäude, keine weiteren');
  for (const [b, tab] of Object.entries(C.UI.homeTab)) assert.ok(typeof tab === 'string' && tabs.includes(tab), `${b} → ${tab}`);
  assert.equal(C.UI.homeTab.kaserne, 'army');
});

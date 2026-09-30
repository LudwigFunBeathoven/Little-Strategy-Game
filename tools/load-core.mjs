// Lädt Konfiguration, Draft-Optionen und Spiellogik ohne Browser (für Simulator und Tests).
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
export function loadCore(files = ['config.js', 'data/draft-options.js', 'data/research.js', 'data/neighbors.js', 'core.js', 'tools/browser-bot.js']){
  const ctx = { Math, Date, JSON, console, Intl };
  vm.createContext(ctx);
  for (const f of files){
    const p = new URL(f, root);
    if (!existsSync(p)) continue;
    vm.runInContext(readFileSync(p, 'utf8'), ctx, { filename: f });
  }
  vm.runInContext('globalThis.__out = { KF_CONFIG, KlammerCore, KF_DRAFT_OPTIONS: typeof KF_DRAFT_OPTIONS !== "undefined" ? KF_DRAFT_OPTIONS : null, KF_RESEARCH: typeof KF_RESEARCH !== "undefined" ? KF_RESEARCH : null, KF_BROWSER_BOT: typeof KF_BROWSER_BOT !== "undefined" ? KF_BROWSER_BOT : null, KF_NEIGHBORS: typeof KF_NEIGHBORS !== "undefined" ? KF_NEIGHBORS : null };', ctx);
  // Balancing-Versuche ohne Dateiänderung: KF_OVERRIDE='{"DIFFICULTY":{"normal":{"waveGrowth":0.6}}}'
  if (process.env.KF_OVERRIDE) merge(ctx.__out.KF_CONFIG, JSON.parse(process.env.KF_OVERRIDE));
  return ctx.__out;
}
function merge(target, src){
  for (const [k, v] of Object.entries(src)){
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') merge(target[k], v);
    else target[k] = v;
  }
}
export function loadI18n(){
  const ctx = {}; vm.createContext(ctx);
  for (const f of ['i18n/de.js', 'i18n/en.js']) vm.runInContext(readFileSync(new URL(f, root), 'utf8'), ctx, { filename: f });
  vm.runInContext('globalThis.__out = KF_I18N;', ctx);
  return ctx.__out;
}

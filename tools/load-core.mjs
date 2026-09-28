// Lädt Konfiguration, Draft-Optionen und Spiellogik ohne Browser (für Simulator und Tests).
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
export function loadCore(files = ['config.js', 'data/draft-options.js', 'core.js']){
  const ctx = { Math, Date, JSON, console, Intl };
  vm.createContext(ctx);
  for (const f of files){
    const p = new URL(f, root);
    if (!existsSync(p)) continue;
    vm.runInContext(readFileSync(p, 'utf8'), ctx, { filename: f });
  }
  vm.runInContext('globalThis.__out = { KF_CONFIG, KlammerCore, KF_DRAFT_OPTIONS: typeof KF_DRAFT_OPTIONS !== "undefined" ? KF_DRAFT_OPTIONS : null };', ctx);
  return ctx.__out;
}
export function loadI18n(){
  const ctx = {}; vm.createContext(ctx);
  for (const f of ['i18n/de.js', 'i18n/en.js']) vm.runInContext(readFileSync(new URL(f, root), 'utf8'), ctx, { filename: f });
  vm.runInContext('globalThis.__out = KF_I18N;', ctx);
  return ctx.__out;
}

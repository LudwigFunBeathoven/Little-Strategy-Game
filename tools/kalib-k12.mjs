// Klammerfront – Kalibrierung Kartenpfad Teil 12 (REQ-K12.05): misst Kandidaten (KF_OVERRIDE) mit festen Budgetanteilen und prüft die Kriterien.
// Aufruf: node tools/kalib-k12.mjs --cands '{"A":{"KARTEN":{"schwellen":{"start":250,"wachstum":1.15},"budget":{"kurs":0.5}}}}' [--bots ohne] [--budgets 0,20,30,40] [--runs 50] [--prefix kartenpfad12-kal] [--md datei] [--druck aus|hoch] [--kombi alle]
//   Je Kandidat und Bot ein Lauf je Budget (reports/<prefix>-<kandidat>-<bot>-b<n>.json); Ausgabe: Tabelle je Kandidat und Bot.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { feldKennzahlen } from './k12-kennzahlen.mjs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const CANDS = JSON.parse(arg('cands', '{}')), BOTS = arg('bots', 'ohne').split(','), BUDGETS = arg('budgets', '0,20,30,40').split(','), RUNS = arg('runs', '50'), PREFIX = arg('prefix', 'kartenpfad12-kal'), ROOT = resolve(arg('root', '.')), OUT = resolve(arg('out', 'reports')), DRUCK = arg('druck', 'aus'), PROFILE = arg('profile', 'durchschnitt'), NEU = arg('neu', 'nein') === 'ja', KOMBI = arg('kombi', '');
mkdirSync(OUT, { recursive: true });
const f1 = x => x == null || !Number.isFinite(x) ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ','), pc = x => x == null ? '–' : `${Math.round(100 * x)} %`;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
let md = '';
for (const [name, ov] of Object.entries(CANDS)){
  for (const bot of BOTS){
    const kat = bot === 'ohne' ? [] : ['--kat', bot], rows = [];
    for (const b of BUDGETS){
      const file = `${OUT}/${PREFIX}-${name}-${bot}-b${b}.json`;
      if (NEU || !existsSync(file)){
        const t0 = Date.now();
        const r = spawnSync(process.execPath, [`${ROOT}/tools/sim-p5.mjs`, '--suite', 'felder', '--runs', RUNS, '--diffs', 'normal', '--profiles', PROFILE, '--druck', DRUCK, ...kat, ...(b === 'regel' ? [] : ['--budget', b]), ...(KOMBI ? ['--kombi', KOMBI] : []), '--json', file], { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT, env: { ...process.env, KF_OVERRIDE: JSON.stringify(ov) } });
        if (r.status !== 0){ console.error(name, bot, b, 'Status', r.status, (r.stderr || '').slice(0, 300)); continue; }
        process.stderr.write(`${name} ${bot} b${b}: ${Math.round((Date.now() - t0) / 1000)} s\n`);
      }
      rows.push([b, feldKennzahlen(JSON.parse(readFileSync(file, 'utf8')).roh.filter(r => r.profile === PROFILE))]);
    }
    const b0 = rows.find(r => r[0] === '0');
    md += `\n**${name}** · ${bot} · ${JSON.stringify(ov)}\n\n| Budget | Siege | Dauer | Wahlen | gebremst | bis St. 6 | Abstand ab St. 10 (n) | Elastizität ab 10 | CV | Rückstau ≤1 | max | Patt |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const [b, k] of rows) md += `| ${b === 'regel' ? 'Regel' : b + ' %'} | ${pc(k.siege)} | ${mm(k.dauer)} | ${k.wahlen} | ${pc(k.gebremst)} | ${pc(k.gebremst6)} | ${f1(k.abstandAb10)} s (${k.abstandAb10N}) | ${b0 && b !== '0' && b0[1].abstandAb10 && k.abstandAb10 ? Math.round(100 * (k.abstandAb10 - b0[1].abstandAb10) / b0[1].abstandAb10) + ' %' : '–'} | ${f1(k.cv)} | ${pc(k.rueck1)} | ${k.rueckMax} | ${pc(k.patt)} |\n`;
  }
}
console.log(md);
if (arg('md')) writeFileSync(arg('md'), md);

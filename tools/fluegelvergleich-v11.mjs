// Klammerfront – Flügelvergleich Kartenpfad Teil 11 (REQ-K11.04): je Bot alle vier Flügel als erster Flügel erzwungen (Schalter fluegel), Normal, durchschnitt, gleiche Seeds.
// Aufruf: node tools/fluegelvergleich-v11.mjs [--runs 50] [--out reports] [--prefix kartenpfad11-fluegel] [--root .] [--override '{"HAUPTHAUS":{…}}']
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = arg('runs', '50'), OUT = resolve(arg('out', 'reports')), PREFIX = arg('prefix', 'kartenpfad11-fluegel'), ROOT = resolve(arg('root', '.')), OV = arg('override', '{}');
mkdirSync(OUT, { recursive: true });
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const BOTS = [['ohne', []], ['militaer', ['--kat', 'militaer']], ['wirtschaft', ['--kat', 'wirtschaft']], ['verteidigung', ['--kat', 'verteidigung']]];
const FL = ['schatzkammer', 'bibliothek', 'zeughaus', 'kanzlei'];
const res = {};
for (const [bot, extra] of BOTS) for (const fl of FL){
  const file = `${OUT}/${PREFIX}-${bot}-${fl}.json`;
  const r = spawnSync(process.execPath, [`${ROOT}/tools/sim-p5.mjs`, '--suite', 'felder', '--runs', RUNS, '--diffs', 'normal', '--profiles', 'durchschnitt', ...extra, '--druck', 'aus', '--fluegel', fl, '--json', file], { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT, env: { ...process.env, KF_OVERRIDE: OV } });
  if (r.status !== 0){ console.error(bot, fl, 'Status', r.status, (r.stderr || '').slice(0, 200)); continue; }
  const rs = JSON.parse(readFileSync(file, 'utf8')).roh;
  res[`${bot}/${fl}`] = { siege: rs.filter(x => x.status === 'won').length / rs.length, patt: rs.filter(x => x.status !== 'won' && x.status !== 'lost').length / rs.length, dauer: median(rs.map(x => x.t)), nb: median(rs.map(x => x.nbEnd)), wahlen: median(rs.map(x => (x.wahlen || []).length)),
    belegt: median(rs.map(x => { const p = [1, 3, 5, 7].filter(i => x.slotsEnd && x.slotsEnd[i]).length; return p; })) };
  console.error(bot, fl, JSON.stringify(res[`${bot}/${fl}`]));
}
const pc = x => `${Math.round(100 * x)} %`, mm = t => `${Math.floor(t / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
let md = '| Bot | ' + FL.map(f => f).join(' | ') + ' | Spannweite Siege |\n|---|' + FL.map(() => '---|').join('') + '---|\n';
for (const [bot] of BOTS){ const v = FL.map(f => res[`${bot}/${f}`]).filter(Boolean); md += `| ${bot} | ${FL.map(f => { const x = res[`${bot}/${f}`]; return x ? `${pc(x.siege)} · Patt ${pc(x.patt)} · ${mm(x.dauer)} · nb ${x.nb.toFixed(2)}` : '–'; }).join(' | ')} | ${v.length ? Math.round(100 * (Math.max(...v.map(x => x.siege)) - Math.min(...v.map(x => x.siege)))) + ' Pp' : '–'} |\n`; }
console.log(md); writeFileSync(`${OUT}/${PREFIX}-ergebnis.json`, JSON.stringify(res, null, 1));

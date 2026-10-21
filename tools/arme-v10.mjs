// Klammerfront – Experiment zum Rückstau der Stufenaufstiege (Kartenpfad Teil 10, REQ-K10.05): misst Arme (KF_OVERRIDE je Arm) auf denselben Seeds und prüft die Kriterien.
// Aufruf: node tools/arme-v10.mjs --arms '{"A1":{"KARTEN":{"schwellen":{"wachstum":1.2}}}, …}' [--runs 50] [--prefix kartenpfad10-arm] [--root <Code>] [--out reports] [--md datei]
//   Felder je Arm (Normal): Bot ohne Kategorie in allen drei Profilen, Militär-, Wirtschafts- und Verteidigungs-Bot im Profil durchschnitt.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const ARMS = JSON.parse(arg('arms', '{}')), RUNS = arg('runs', '50'), PREFIX = arg('prefix', 'kartenpfad10-arm'), ROOT = resolve(arg('root', '.')), OUT = resolve(arg('out', 'reports'));
mkdirSync(OUT, { recursive: true });
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const cv = ts => { const d = []; for (let i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1]); if (d.length < 3) return null; const m = mean(d); return m > 0 ? Math.sqrt(mean(d.map(x => (x - m) ** 2))) / m : null; };
const f1 = x => x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ','), f2 = x => x == null ? '–' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ','), pc = x => x == null ? '–' : `${Math.round(100 * x)} %`;
const mm = t => t == null ? '–' : `${Math.floor(Math.round(t) / 60)}:${String(Math.round(t) % 60).padStart(2, '0')}`;
export function auswerten(raw){
  const feld = (bot, profile) => (raw[bot] || []).filter(r => r.profile === profile);
  const alleBots = ['ohne', 'militaer', 'wirtschaft', 'verteidigung'].flatMap(b => feld(b, 'durchschnitt'));
  const ohneD = feld('ohne', 'durchschnitt');
  const rate = rs => median(rs.map(r => (r.wahlen || []).length / Math.max(1, r.t / 60)));
  const cvs = alleBots.map(r => cv((r.wahlen || []).map(w => w.t))).filter(x => x != null);
  const bots = {};
  for (const b of ['ohne', 'militaer', 'wirtschaft', 'verteidigung']){ const rs = feld(b, 'durchschnitt'); bots[b] = { n: rs.length, siege: rs.filter(r => r.status === 'won').length / rs.length, patt: rs.filter(r => r.status !== 'won' && r.status !== 'lost').length / rs.length, wahlen: median(rs.map(r => (r.wahlen || []).length)), dauer: median(rs.map(r => r.t)), rueck1: rs.filter(r => r.rueckMax <= 1).length / rs.length, rueckMax: Math.max(...rs.map(r => r.rueckMax)), cv: median(rs.map(r => cv((r.wahlen || []).map(w => w.t))).filter(x => x != null)) }; }
  const k = {
    rueck1: alleBots.filter(r => r.rueckMax <= 1).length / alleBots.length, rueckMax: Math.max(...alleBots.map(r => r.rueckMax)),
    wahlenOhne: median(ohneD.map(r => (r.wahlen || []).length)), dauerOhne: median(ohneD.map(r => r.t)),
    rateAktiv: rate(feld('ohne', 'aktiv')), rateDurch: rate(ohneD), rateGeleg: rate(feld('ohne', 'gelegentlich')), cvMedian: median(cvs), bots,
  };
  k.ok = { rueck: k.rueck1 >= 0.9 && k.rueckMax <= 2, wahlen: k.wahlenOhne >= 12 && k.wahlenOhne <= 16, dauer: k.dauerOhne / 60 >= 13 && k.dauerOhne / 60 <= 17, profile: k.rateAktiv > k.rateDurch && k.rateDurch > k.rateGeleg, cv: k.cvMedian >= 0.25 };
  k.alle = Object.values(k.ok).every(Boolean);
  return k;
}
if (process.argv[1] && process.argv[1].endsWith('arme-v10.mjs')){
  const rows = {};
  for (const [name, ov] of Object.entries(ARMS)){
    const raw = {}; const t0 = Date.now();
    const felder = [['ohne', [], 'aktiv,durchschnitt,gelegentlich'], ['militaer', ['--kat', 'militaer'], 'durchschnitt'], ['wirtschaft', ['--kat', 'wirtschaft'], 'durchschnitt'], ['verteidigung', ['--kat', 'verteidigung'], 'durchschnitt']];
    for (const [bot, extra, profs] of felder){
      const file = `${OUT}/${PREFIX}-${name}-${bot}.json`;
      const r = spawnSync(process.execPath, [`${ROOT}/tools/sim-p5.mjs`, '--suite', 'felder', '--runs', RUNS, '--diffs', 'normal', '--profiles', profs, ...extra, '--druck', 'aus', '--json', file], { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT, env: { ...process.env, KF_OVERRIDE: JSON.stringify(ov) } });
      if (r.status !== 0) { console.error(name, bot, 'Status', r.status, (r.stderr || '').slice(0, 300)); continue; }
      raw[bot] = JSON.parse(readFileSync(file, 'utf8')).roh;
    }
    rows[name] = auswerten(raw); rows[name].override = ov;
    console.error(`${name}: ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  let md = '| Arm | Rückstau ≤ 1 (alle Bots) | größter Rückstau | Wahlen ohne Kat. | Dauer ohne Kat. | Wahlen/min aktiv · durchschn. · gelegentl. | CV Median | Siege ohne / mil. / wirt. / vert. | Patt ohne / mil. / wirt. / vert. | alle Kriterien |\n|---|---|---|---|---|---|---|---|---|---|\n';
  for (const [name, k] of Object.entries(rows)){
    const b = k.bots, mk = (x, o) => (o ? '✓' : '✗');
    md += `| ${name} | ${pc(k.rueck1)} ${mk(0, k.ok.rueck)} | ${k.rueckMax} | ${k.wahlenOhne} ${mk(0, k.ok.wahlen)} | ${mm(k.dauerOhne)} ${mk(0, k.ok.dauer)} | ${f2(k.rateAktiv)} · ${f2(k.rateDurch)} · ${f2(k.rateGeleg)} ${mk(0, k.ok.profile)} | ${f2(k.cvMedian)} ${mk(0, k.ok.cv)} | ${['ohne', 'militaer', 'wirtschaft', 'verteidigung'].map(x => pc(b[x].siege)).join(' / ')} | ${['ohne', 'militaer', 'wirtschaft', 'verteidigung'].map(x => pc(b[x].patt)).join(' / ')} | ${k.alle ? 'ja' : 'nein'} |\n`;
  }
  console.log(md);
  if (arg('md')) writeFileSync(arg('md'), md);
  writeFileSync(`${OUT}/${PREFIX}-ergebnis.json`, JSON.stringify(rows, null, 1));
}

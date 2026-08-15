/**
 * Regenerates src/_data/teams.json and src/_data/alumni.json from
 * src/_data/seasonStandings.json, which is the source of truth for career totals.
 *
 *   npm run derive          # rewrite both files
 *   npm run derive -- --check   # exit 1 if either is stale (no writes)
 *
 * Run after adding a season to seasonStandings.json. Do not hand-edit the
 * two generated files — see the annual checklist in CLAUDE.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', '_data');
const read = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const check = process.argv.includes('--check');

const { seasons } = read('seasonStandings.json');

// --- roll every team-season up by manager ------------------------------------
const agg = new Map();
for (const yr of seasons) for (const r of yr.standings) {
  if (!r.manager) throw new Error(`${yr.year}: "${r.team}" has no manager`);
  const a = agg.get(r.manager) ?? { manager: r.manager, alumni: !!r.alumni, titleYears: [],
                                    seasons: [], teamNames: [],
                                    years: 0, wins: 0, losses: 0, pf: 0, pa: 0, moves: 0 };
  if (!!r.alumni !== a.alumni) throw new Error(`${r.manager}: alumni flag differs between seasons`);
  a.years++; a.wins += r.wins; a.losses += r.losses;
  a.pf += r.pf; a.pa += r.pa; a.moves += r.moves;
  a.seasons.push(yr.year); a.teamNames.push(r.team);
  if (r.finalRank === 1) a.titleYears.push(yr.year);
  agg.set(r.manager, a);
}

const r2 = n => +n.toFixed(2), r3 = n => +n.toFixed(3);
const rows = [...agg.values()]
  .sort((a, b) => a.manager.localeCompare(b.manager))
  .map(a => ({ ...a,
    titleYears: [...a.titleYears].sort((x, y) => x - y),
    winPct: r3(a.wins / (a.wins + a.losses)),
    pf: r2(a.pf), pa: r2(a.pa),
    pfAvg: r2(a.pf / a.years), paAvg: r2(a.pa / a.years), movesAvg: r2(a.moves / a.years) }));

// --- emit one aligned line per manager, matching the hand-written style -------
const f2 = n => n.toFixed(2), f3 = n => n.toFixed(3);
const pad = arr => { const w = Math.max(...arr.map(s => s.length)); return arr.map(s => s.padEnd(w)); };
const col = (set, key, fmt = String) => pad(set.map(r => fmt(r[key]) + ','));
const json = v => JSON.stringify(v).replace(/,/g, ', ');

const active = rows.filter(r => !r.alumni);
const alum   = rows.filter(r =>  r.alumni);

const teamsJson = (() => {
  const m = pad(active.map(r => `"${r.manager}",`));
  const t = pad(active.map(r => `{ "count": ${r.titleYears.length}, "years": ${json(r.titleYears)} },`));
  const [y, w, l, wp, pf, pa, pfa, paa, mv] = ['years', 'wins', 'losses', 'winPct', 'pf', 'pa', 'pfAvg', 'paAvg', 'moves']
    .map(k => col(active, k, k === 'winPct' ? f3 : /pf|pa/i.test(k) ? f2 : String));
  return '[\n' + active.map((r, i) =>
    `  { "manager": ${m[i]} "titles": ${t[i]} "years": ${y[i]} "wins": ${w[i]} "losses": ${l[i]} ` +
    `"winPct": ${wp[i]} "pf": ${pf[i]} "pa": ${pa[i]} "pfAvg": ${pfa[i]} "paAvg": ${paa[i]} ` +
    `"moves": ${mv[i]} "movesAvg": ${f2(r.movesAvg)} }`).join(',\n') + '\n]\n';
})();

const alumniJson = (() => {
  const m  = pad(alum.map(r => `"${r.manager}",`));
  const s  = pad(alum.map(r => `${json(r.seasons)},`));
  const tn = pad(alum.map(r => `${json(r.teamNames)},`));
  const [y, w, l, wp, pf, pa, pfa, paa, mv] = ['years', 'wins', 'losses', 'winPct', 'pf', 'pa', 'pfAvg', 'paAvg', 'moves']
    .map(k => col(alum, k, k === 'winPct' ? f3 : /pf|pa/i.test(k) ? f2 : String));
  return '[\n' + alum.map((r, i) =>
    `  { "manager": ${m[i]} "seasons": ${s[i]} "teamNames": ${tn[i]} "years": ${y[i]} "wins": ${w[i]} ` +
    `"losses": ${l[i]} "winPct": ${wp[i]} "pf": ${pf[i]} "pa": ${pa[i]} "pfAvg": ${pfa[i]} ` +
    `"paAvg": ${paa[i]} "moves": ${mv[i]} "movesAvg": ${f2(r.movesAvg)} }`).join(',\n') + '\n]\n';
})();

let stale = false;
for (const [file, next] of [['teams.json', teamsJson], ['alumni.json', alumniJson]]) {
  const p = path.join(DATA, file);
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (prev === next) { console.log(`  ${file} up to date`); continue; }
  stale = true;
  if (check) { console.error(`  ${file} is STALE — run: npm run derive`); continue; }
  fs.writeFileSync(p, next, 'utf8');
  console.log(`  ${file} written`);
}

console.log(`\n${active.length} active managers, ${alum.length} alumni (${alum.map(a => a.manager).join(', ')})`);
if (check && stale) process.exit(1);

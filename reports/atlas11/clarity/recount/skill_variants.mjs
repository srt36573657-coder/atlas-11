import fs from 'node:fs';
import path from 'node:path';
const D = '/home/claude/atlas/ATLAS/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push(JSON.parse(line));
const supersededIds = new Set(recs.filter(r => r.supersedes).map(r => r.supersedes));
const current = recs.filter(r => !supersededIds.has(r.id));
const skill = L => { const A = L.reduce((s, b) => s + b.ape, 0) / L.length; const N = L.reduce((s, b) => s + Math.abs(b.anchor - b.actual) / b.actual * 100, 0) / L.length; return { n: L.length, A, N, skill: (1 - A / N) * 100 }; };
const sel = (pool, td, issued) => pool.filter(r => r.body.kind === 'live' && r.body.horizon === 1 && r.body.targetDate === td && (!issued || r.body.issuedAt === issued)).map(r => r.body);
const L30 = sel(current, '2026-09-30');
for (const iss of ['2026-09-28T09:39:48.714Z', '2026-09-28T13:13:16.576Z', '2026-09-28T13:29:56.398Z']) {
  const L29 = sel(current, '2026-09-29', iss);
  const s29 = skill(L29), sp = skill([...L29, ...L30]);
  console.log(`09-29 issue ${iss}: meanApe09-29=${s29.A.toFixed(6)} pooled A=${sp.A.toFixed(6)} N=${sp.N.toFixed(6)} skill=${sp.skill.toFixed(4)} -> ${sp.skill.toFixed(2)}`);
}
// p50 differences between issues for 09-29
const byIss = {}; for (const b of sel(current, '2026-09-29')) (byIss[b.issuedAt] ||= {})[b.code] = b.predicted.p50;
const iss = Object.keys(byIss).sort();
let maxd = 0; for (const c of Object.keys(byIss[iss[0]])) for (const i of iss.slice(1)) maxd = Math.max(maxd, Math.abs(byIss[i][c] / byIss[iss[0]][c] - 1));
console.log('max relative p50 difference between 09-29 issues:', maxd);
// originals (uncorrected) pooled, earliest issue
const orig = recs.filter(r => !r.supersedes);
const cells = new Map();
for (const r of orig) { const b = r.body; if (b.kind !== 'live' || b.horizon !== 1) continue; const k = b.targetDate + '|' + b.code; const p = cells.get(k); if (!p || Date.parse(b.issuedAt) < Date.parse(p.issuedAt)) cells.set(k, b); }
const so = skill([...cells.values()]);
console.log(`uncorrected originals pooled (earliest issue): A=${so.A.toFixed(6)} N=${so.N.toFixed(6)} skill=${so.skill.toFixed(4)}`);

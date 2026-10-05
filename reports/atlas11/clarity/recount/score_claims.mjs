import fs from 'node:fs';
import path from 'node:path';
const D = '/home/claude/atlas/ATLAS/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push({ ...JSON.parse(line), _file: fn });
const supersededIds = new Set(recs.filter(r => r.supersedes).map(r => r.supersedes));
const current = recs.filter(r => !supersededIds.has(r.id));
console.log('all', recs.length, 'superseded', supersededIds.size, 'current', current.length);

// Inventory of live h1 by targetDate / forecast issue
const inv = {};
for (const r of current) if (r.body.kind === 'live') {
  const k = `td=${r.body.targetDate} h=${r.body.horizon} origin=${r.body.originDate} issued=${r.body.issuedAt} fid=${r.body.forecastId} mv=${r.body.modelVersion}`;
  inv[k] = (inv[k] || 0) + 1;
}
console.log('\nCURRENT live records inventory:'); for (const k of Object.keys(inv).sort()) console.log('  ', inv[k], k);
const invAll = {};
for (const r of recs) if (r.body.kind === 'live' && r.body.horizon === 1) { const k = `td=${r.body.targetDate} issued=${r.body.issuedAt}`; invAll[k] = (invAll[k] || 0) + 1; }
console.log('\nALL (incl. superseded) live h1 by targetDate/issue:', invAll);

// earliest-issued live h1 per (targetDate, code)
const cells = new Map();
let ties = 0;
for (const r of current) {
  const b = r.body; if (b.kind !== 'live' || b.horizon !== 1) continue;
  const key = b.targetDate + '|' + b.code;
  const prev = cells.get(key);
  const t = Date.parse(b.issuedAt);
  if (!prev) cells.set(key, r);
  else { const pt = Date.parse(prev.body.issuedAt); if (t < pt) cells.set(key, r); else if (t === pt) ties++; }
}
console.log('\ncells', cells.size, 'issuedAt ties within a cell:', ties);
const byTD = {};
for (const r of cells.values()) (byTD[r.body.targetDate] ||= []).push(r.body);
const dates = Object.keys(byTD).sort();
console.log('scored targetDates (live h1):', dates);
for (const td of dates) {
  const L = byTD[td];
  const predUp = L.filter(b => b.predictedDirection === 'up').length;
  const actUp = L.filter(b => (b.actualDirection ?? b.observedDirection) === 'up').length;
  const corr = L.filter(b => b.directionCorrect === true).length;
  const meanApe = L.reduce((s, b) => s + b.ape, 0) / L.length;
  const issues = [...new Set(L.map(b => b.issuedAt + ' ' + b.forecastId))];
  const predDist = {}, actDist = {}; for (const b of L) { predDist[b.predictedDirection] = (predDist[b.predictedDirection] || 0) + 1; const a = b.actualDirection ?? b.observedDirection; actDist[a] = (actDist[a] || 0) + 1; }
  console.log(`\n[${td}] n=${L.length} codes=${new Set(L.map(b => b.code)).size} predictedUp=${predUp} actualUp=${actUp} directionCorrect=${corr} meanApe=${meanApe} (2dp ${meanApe.toFixed(2)})`);
  console.log('   predicted dist', predDist, 'actual dist', actDist, 'issues used', issues);
  // recompute directionCorrect & ape independently from raw fields
  let dcMismatch = 0, apeMismatch = 0, dirRecalcMismatch = 0;
  for (const b of L) {
    if ((b.predictedDirection === (b.actualDirection ?? b.observedDirection)) !== b.directionCorrect) dcMismatch++;
    const ape2 = Math.abs(b.predicted.p50 - b.actual) / b.actual * 100;
    if (Math.abs(ape2 - b.ape) > 1e-9) apeMismatch++;
    const r = b.actual / b.anchor - 1; const d = r > 0.001 ? 'up' : r < -0.001 ? 'down' : 'flat';
    if (d !== (b.actualDirection ?? b.observedDirection)) dirRecalcMismatch++;
  }
  console.log(`   self-consistency: directionCorrect!=(pred==act): ${dcMismatch}; ape!=|p50-actual|/actual: ${apeMismatch}; actualDirection!=sign(actual/anchor-1, ±0.1%): ${dirRecalcMismatch}`);
}

// C7 pooled skill
const pooled = [...cells.values()].map(r => r.body).filter(b => b.targetDate <= '2026-09-30');
const A = pooled.reduce((s, b) => s + b.ape, 0) / pooled.length;
const N = pooled.reduce((s, b) => s + Math.abs(b.anchor - b.actual) / b.actual * 100, 0) / pooled.length;
console.log(`\nC7 pooled cells=${pooled.length} dates=${new Set(pooled.map(b => b.targetDate)).size} A=${A} N=${N} skill=(1-A/N)*100=${(1 - A / N) * 100} -> ${((1 - A / N) * 100).toFixed(2)}`);
// Variants
const perDate = dates.map(td => { const L = byTD[td]; const a = L.reduce((s, b) => s + b.ape, 0) / L.length; const n = L.reduce((s, b) => s + Math.abs(b.anchor - b.actual) / b.actual * 100, 0) / L.length; return { td, a, n, skill: (1 - a / n) * 100 }; });
console.log('C7 per-date:', perDate);
console.log('C7 variant mean-of-daily-skills:', (perDate.reduce((s, x) => s + x.skill, 0) / perDate.length).toFixed(4));
console.log('C7 variant ratio of mean-of-daily-A / mean-of-daily-N:', ((1 - (perDate.reduce((s, x) => s + x.a, 0) / perDate.length) / (perDate.reduce((s, x) => s + x.n, 0) / perDate.length)) * 100).toFixed(4));
const Nanchor = pooled.reduce((s, b) => s + Math.abs(b.anchor - b.actual) / b.anchor * 100, 0) / pooled.length;
console.log('C7 variant N with anchor denominator:', Nanchor, 'skill', ((1 - A / Nanchor) * 100).toFixed(4));

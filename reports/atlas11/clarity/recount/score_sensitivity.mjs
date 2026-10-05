import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const D = ROOT + '/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push(JSON.parse(line));
const supersededIds = new Set(recs.filter(r => r.supersedes).map(r => r.supersedes));
const isOriginal = r => !r.supersedes;
const current = recs.filter(r => !supersededIds.has(r.id));
const stats = L => ({ n: L.length, predUp: L.filter(b => b.predictedDirection === 'up').length, actUp: L.filter(b => b.actualDirection === 'up').length, correct: L.filter(b => b.directionCorrect).length, meanApe: +(L.reduce((s, b) => s + b.ape, 0) / L.length).toFixed(4), naive: +(L.reduce((s, b) => s + Math.abs(b.anchor - b.actual) / b.actual * 100, 0) / L.length).toFixed(4) });
// (a) per issue for td 09-29, current records
for (const issued of ['2026-09-28T09:39:48.714Z', '2026-09-28T13:13:16.576Z', '2026-09-28T13:29:56.398Z']) {
  const L = current.filter(r => r.body.kind === 'live' && r.body.horizon === 1 && r.body.targetDate === '2026-09-29' && r.body.issuedAt === issued).map(r => r.body);
  console.log('(a) td 09-29 issue', issued, L[0]?.modelVersion, stats(L));
}
// (b) original (uncorrected) records, earliest issue
for (const td of ['2026-09-29', '2026-09-30']) {
  const cells = new Map();
  for (const r of recs.filter(isOriginal)) { const b = r.body; if (b.kind !== 'live' || b.horizon !== 1 || b.targetDate !== td) continue; const k = b.code; const p = cells.get(k); if (!p || Date.parse(b.issuedAt) < Date.parse(p.issuedAt)) cells.set(k, b); }
  console.log('(b) ORIGINAL uncorrected, earliest issue, td', td, stats([...cells.values()]));
}
// NOTE: pooled-skill variants were removed from this file because stats() rounds A and N to 4 dp,
// which distorted the ratio. Full-precision variants live in skill_variants.mjs.
// (c) cross-check against forecast.json closes
const f = JSON.parse(fs.readFileSync(ROOT + '/public/data/atlas11/forecast.json', 'utf8'));
const close = {}; // code -> date -> close
for (const a of f.assets) { close[a.code] = {}; for (const x of a.actual60) close[a.code][x.date] = x.close; close[a.code][a.anchor.date + '#anchor'] = a.anchor.close; }
console.log('\nactual60 last dates sample:', f.assets[0].actual60.slice(-3));
let m = { td29act: 0, td29actMis: [], td30act: 0, td30actMis: [], td30anc: 0, td30ancMis: [], td29anc: 0, td29ancMis: [] };
for (const r of current) {
  const b = r.body; if (b.kind !== 'live' || b.horizon !== 1) continue;
  const c = close[b.code]; if (!c) continue;
  if (b.targetDate === '2026-09-29') {
    if (c['2026-09-29'] === b.actual) m.td29act++; else m.td29actMis.push(`${b.code}@${b.issuedAt.slice(11,19)} score=${b.actual} f60=${c['2026-09-29']}`);
    if (c['2026-09-28'] === b.anchor) m.td29anc++; else m.td29ancMis.push(`${b.code}@${b.issuedAt.slice(11,19)} anchor=${b.anchor} f60(09-28)=${c['2026-09-28']}`);
  }
  if (b.targetDate === '2026-09-30') {
    if (c['2026-09-30#anchor'] === b.actual) m.td30act++; else m.td30actMis.push(`${b.code} score=${b.actual} forecastAnchor=${c['2026-09-30#anchor']}`);
    if (c['2026-09-29'] === b.anchor) m.td30anc++; else m.td30ancMis.push(`${b.code} anchor=${b.anchor} f60(09-29)=${c['2026-09-29']}`);
  }
}
console.log('(c) td09-29 actual == forecast.json actual60[09-29]:', m.td29act, 'mismatches', m.td29actMis.length, m.td29actMis.slice(0, 8));
console.log('(c) td09-29 anchor == actual60[09-28]:', m.td29anc, 'mismatches', m.td29ancMis.length, m.td29ancMis.slice(0, 8));
console.log('(c) td09-30 actual == forecast anchor.close(09-30):', m.td30act, 'mismatches', m.td30actMis.length, m.td30actMis.slice(0, 8));
console.log('(c) td09-30 anchor == actual60[09-29]:', m.td30anc, 'mismatches', m.td30ancMis.length, m.td30ancMis.slice(0, 8));

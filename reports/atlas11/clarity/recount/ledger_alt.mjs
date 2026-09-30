import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const R = ROOT + '/reports/atlas11/ledger';
const P = ROOT + '/public/data/atlas11/ledger';
const kst = iso => new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(0, 10);
const byAt = {}, mism = [];
const idsR = new Set();
for (const t of fs.readdirSync(R)) for (const fn of fs.readdirSync(path.join(R, t))) {
  for (const line of fs.readFileSync(path.join(R, t, fn), 'utf8').split('\n')) {
    if (!line.trim()) continue; const r = JSON.parse(line); idsR.add(r.id);
    const d = kst(r.at); byAt[d] = (byAt[d] || 0) + 1;
    if (d !== r.dateKST) mism.push(`${t}/${fn} ${r.id} at=${r.at} -> KST ${d} vs dateKST ${r.dateKST}`);
  }
}
console.log('counts by KST date of `at`:', byAt);
console.log('records whose KST(at) != dateKST:', mism.length); for (const m of mism.slice(0, 15)) console.log('  ', m);
// public copy comparison
const pubFirst = fs.readFileSync(path.join(P, 'operation', '2026-09-28.json'), 'utf8');
console.log('\npublic copy format sample (first 300 chars):', JSON.stringify(pubFirst.slice(0, 300)));
let pubCount = {}, idsP = new Set();
for (const t of fs.readdirSync(P)) { const dir = path.join(P, t); if (!fs.statSync(dir).isDirectory()) continue; for (const fn of fs.readdirSync(dir)) {
  const raw = fs.readFileSync(path.join(dir, fn), 'utf8'); let arr;
  try { const j = JSON.parse(raw); arr = Array.isArray(j) ? j : (j.records || j.lines || null); } catch { arr = null; }
  if (!arr) { arr = raw.split('\n').filter(l => l.trim()).map(l => JSON.parse(l)); }
  const d = fn.replace(/\.json$/, ''); pubCount[d] = (pubCount[d] || 0) + arr.length; for (const r of arr) idsP.add(r.id);
} }
console.log('public copy counts per date:', pubCount, 'total', Object.values(pubCount).reduce((a, b) => a + b, 0));
console.log('ids only in reports:', [...idsR].filter(x => !idsP.has(x)).length, ' ids only in public:', [...idsP].filter(x => !idsR.has(x)).length);

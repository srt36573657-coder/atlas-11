import fs from 'node:fs';
import path from 'node:path';
const D = '/home/claude/atlas/ATLAS/reports/atlas11/ledger/score';
const recs = [];
for (const fn of fs.readdirSync(D).sort()) for (const line of fs.readFileSync(path.join(D, fn), 'utf8').split('\n')) if (line.trim()) recs.push({ ...JSON.parse(line), _file: fn });
console.log('score records', recs.length);
const live = recs.find(r => r.body.kind === 'live');
const ref = recs.find(r => r.body.kind === 'reference');
console.log('LIVE sample:', JSON.stringify(live, null, 0).slice(0, 3000));
console.log('\nREF sample:', JSON.stringify(ref, null, 0).slice(0, 2000));
// key sets
const keyset = {};
for (const r of recs) { const k = r.body.kind + ':' + Object.keys(r.body).sort().join(','); keyset[k] = (keyset[k] || 0) + 1; }
console.log('\nbody key sets:'); for (const [k, v] of Object.entries(keyset)) console.log(v, k);
const topkeys = {};
for (const r of recs) { const k = Object.keys(r).sort().join(','); topkeys[k] = (topkeys[k] || 0) + 1; }
console.log('\ntop-level key sets:', topkeys);

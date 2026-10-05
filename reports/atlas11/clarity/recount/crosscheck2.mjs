import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const f = JSON.parse(fs.readFileSync(ROOT + '/public/data/atlas11/forecast.json', 'utf8'));
const CD = ROOT + '/reports/atlas11/ledger/collection';
const daily = [];
for (const fn of fs.readdirSync(CD).sort()) for (const line of fs.readFileSync(path.join(CD, fn), 'utf8').split('\n')) if (line.trim()) { const r = JSON.parse(line); if (r.body.kind === 'daily_collection') daily.push({ ...r, _file: fn }); }
console.log('daily_collection records:', daily.length);
for (const r of daily) console.log('  ', r._file, r.id, r.at, 'supersedes', r.supersedes, 'bodykeys', Object.keys(r.body).join(','));
const last = daily.filter(r => r.dateKST === '2026-09-30');
console.log('\n09-30 daily_collection sample body:', JSON.stringify(last[last.length - 1]?.body).slice(0, 1500));

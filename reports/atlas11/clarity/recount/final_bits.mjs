import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const L = ROOT + '/reports/atlas11/ledger';
const recs = [];
for (const t of fs.readdirSync(L)) for (const fn of fs.readdirSync(path.join(L, t))) for (const line of fs.readFileSync(path.join(L, t, fn), 'utf8').split('\n')) if (line.trim()) recs.push(JSON.parse(line));
const dc = recs.filter(r => r.type === 'collection' && r.body.kind === 'daily_collection' && r.body.day === '2026-09-30');
for (const r of dc) {
  const obs = r.body.observations;
  console.log('09-30 daily_collection', r.id, 'observations', obs.length, 'finalClose true', obs.filter(o => o.finalClose === true).length, 'lastDate=09-30', obs.filter(o => o.lastDate === '2026-09-30').length, 'status', JSON.stringify(r.body.status), 'stats', JSON.stringify(r.body.stats).slice(0, 300));
}
const d30 = recs.filter(r => r.dateKST === '2026-09-30').map(r => r.at).sort();
console.log('dateKST 09-30 records: first at', d30[0], 'last at', d30[d30.length - 1]);
const allAt = recs.map(r => r.at).sort(); console.log('latest `at` in whole ledger:', allAt[allAt.length - 1]);

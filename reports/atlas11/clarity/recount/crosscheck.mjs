import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/home/claude/atlas/ATLAS';
const f = JSON.parse(fs.readFileSync(ROOT + '/public/data/atlas11/forecast.json', 'utf8'));
const c = JSON.parse(fs.readFileSync(ROOT + '/reports/atlas11/context/2026-09-30/2026-09-30T08-21-48Z.json', 'utf8'));
console.log('context day', c.day, 'fetchedAt', c.fetchedAt, 'afterClose', JSON.stringify(c.afterClose), 'usedInForecast', JSON.stringify(c.usedInForecast).slice(0, 200));
const ca = c.assets; console.log('context assets type', Array.isArray(ca) ? 'array ' + ca.length : typeof ca);
const sample = Array.isArray(ca) ? ca[0] : ca[Object.keys(ca)[0]];
console.log('context asset sample keys', Object.keys(sample), JSON.stringify(sample).slice(0, 600));
// compare anchors
let ok = 0, mis = [];
for (const a of f.assets) {
  const x = Array.isArray(ca) ? ca.find(y => y.code === a.code) : ca[a.code];
  if (!x) { mis.push(a.code + ' missing'); continue; }
  const rows = x.rows || x.prices || x.history || [];
  const r = Array.isArray(rows) ? rows.find(y => y.date === '2026-09-30') : null;
  const val = r ? r.close : (x.close ?? x.last ?? null);
  if (val === a.anchor.close) ok++; else mis.push(`${a.code} forecast=${a.anchor.close} context=${val}`);
}
console.log('anchor.close == context snapshot 09-30 close:', ok, 'mismatches', mis.length, mis.slice(0, 6));
// previous (09-29 issue) direction for 09-30
const p0 = f.assets[0].previous;
console.log('\nprevious keys', Object.keys(p0), 'row1 keys', Object.keys(p0.rows[1]));
// forecast ledger records
const FD = ROOT + '/reports/atlas11/ledger/forecast';
for (const fn of fs.readdirSync(FD).sort()) for (const line of fs.readFileSync(path.join(FD, fn), 'utf8').split('\n')) if (line.trim()) { const r = JSON.parse(line); console.log('forecast-ledger', fn, r.id, r.at, 'supersedes', r.supersedes, JSON.stringify(r.body).slice(0, 400)); }

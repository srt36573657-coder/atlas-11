import fs from 'node:fs';
const ROOT = '/home/claude/atlas/ATLAS';
const c = JSON.parse(fs.readFileSync(ROOT + '/reports/atlas11/context/2026-09-30/2026-09-30T08-21-48Z.json', 'utf8'));
console.log('top keys:', Object.keys(c));
console.log('index entries:', c.index.length, c.index.map(x => x.symbol));
for (const ix of c.index) {
  const keys = Object.keys(ix).filter(k => k !== 'rows');
  const meta = {}; for (const k of keys) meta[k] = ix[k];
  console.log('\n', JSON.stringify(meta).slice(0, 800));
  console.log(' rows:', ix.rows.length, 'last 4:', JSON.stringify(ix.rows.slice(-4)));
  const i = ix.rows.findIndex(r => r.date === '2026-09-30');
  if (i >= 0) {
    const r = ix.rows[i], p = ix.rows[i - 1];
    const recomputed = (r.close / p.close - 1) * 100;
    console.log(` 2026-09-30 close=${r.close} changePct(field)=${r.changePct} prev(${p.date})=${p.close} recomputed=${recomputed.toFixed(4)}% -> ${recomputed.toFixed(2)}%`);
  } else console.log(' NO 2026-09-30 row');
}
// earlier snapshot for comparison (to see whether 09-30 close was final)
const e = JSON.parse(fs.readFileSync(ROOT + '/reports/atlas11/context/2026-09-30/2026-09-29T22-27-33Z.json', 'utf8'));
for (const ix of (e.index || [])) console.log('earlier snapshot', ix.symbol, JSON.stringify(ix.rows.slice(-2)));

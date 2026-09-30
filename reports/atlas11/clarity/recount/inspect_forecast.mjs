import fs from 'node:fs';
const R = '/home/claude/atlas/ATLAS';
const f = JSON.parse(fs.readFileSync(R + '/public/data/atlas11/forecast.json', 'utf8'));
console.log('top keys:', Object.keys(f));
for (const k of Object.keys(f)) {
  if (k === 'assets') continue;
  const v = f[k];
  const s = JSON.stringify(v);
  console.log(k, '=>', s.length > 600 ? s.slice(0, 600) + '...(' + s.length + ')' : s);
}
console.log('assets:', f.assets.length);
const a0 = f.assets[0];
console.log('asset keys:', Object.keys(a0));
for (const k of Object.keys(a0)) {
  if (k === 'rows') continue;
  const s = JSON.stringify(a0[k]);
  console.log('  ', k, '=>', s.length > 400 ? s.slice(0, 400) + '...(' + s.length + ')' : s);
}
console.log('rows length:', a0.rows.length);
console.log('row0:', JSON.stringify(a0.rows[0]).slice(0, 1500));
console.log('row1:', JSON.stringify(a0.rows[1]).slice(0, 2500));

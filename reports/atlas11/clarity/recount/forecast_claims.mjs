import fs from 'node:fs';
const R = '/home/claude/atlas/ATLAS';
const f = JSON.parse(fs.readFileSync(R + '/public/data/atlas11/forecast.json', 'utf8'));
const A = f.assets;
console.log('forecastId', f.forecastId, 'actualAsOf', f.actualAsOf, 'issuedAt', f.issuedAt, 'assets', A.length);
console.log('futureDates[0]', f.futureDates[0], 'futureDates[19]', f.futureDates[19], 'len', f.futureDates.length);
// sanity: codes unique, rows length, row dates
const codes = new Set(A.map(a => a.code));
console.log('unique codes', codes.size);
let bad = [];
for (const a of A) {
  if (a.rows.length !== 21) bad.push(a.code + ' rows ' + a.rows.length);
  if (a.rows[0].date !== a.anchor.date) bad.push(a.code + ' row0 date ' + a.rows[0].date + ' vs anchor ' + a.anchor.date);
  if (a.rows[0].p50 !== a.anchor.close) bad.push(a.code + ' row0 p50 ' + a.rows[0].p50 + ' vs anchor ' + a.anchor.close);
  for (let h = 1; h <= 20; h++) if (a.rows[h].date !== f.futureDates[h - 1]) bad.push(a.code + ' row' + h + ' date ' + a.rows[h].date);
}
console.log('structural anomalies:', bad.length, bad.slice(0, 10));

// ---- C1
const dailyCounts = {}, cumCounts = {};
let sumRet1 = 0;
for (const a of A) {
  const d = a.rows[1].direction.daily.selected; dailyCounts[d] = (dailyCounts[d] || 0) + 1;
  const c = a.rows[1].direction.cumulative.selected; cumCounts[c] = (cumCounts[c] || 0) + 1;
  sumRet1 += a.rows[1].p50 / a.anchor.close - 1;
}
const mean1 = sumRet1 / A.length * 100;
console.log('\nC1 rows[1].date set:', [...new Set(A.map(a => a.rows[1].date))]);
console.log('C1 daily.selected counts:', dailyCounts, ' cumulative.selected counts:', cumCounts);
console.log('C1 mean(p50_1/anchor-1) %:', mean1, '-> 2dp', mean1.toFixed(2));
// alternative: mean of dailyP50Change field and 'return' field
const alt1 = A.reduce((s, a) => s + a.rows[1].dailyP50Change, 0) / A.length * 100;
const alt1b = A.reduce((s, a) => s + a.rows[1].return, 0) / A.length * 100;
console.log('C1 alt mean(dailyP50Change) %:', alt1, ' alt mean(return) %:', alt1b);
// median-of-returns alt
const r1 = A.map(a => a.rows[1].p50 / a.anchor.close - 1).sort((x, y) => x - y);
console.log('C1 alt median %:', ((r1[25] + r1[26]) / 2 * 100).toFixed(4));

// ---- C3
const s = A.find(a => a.code === '005930');
console.log('\nC3 name', s.name, 'anchor', s.anchor.date, s.anchor.close, 'finalClose', s.anchor.finalClose);
console.log('C3 rows[20]', s.rows[20].date, 'p50', s.rows[20].p50, 'round', Math.round(s.rows[20].p50));
const pct3 = (s.rows[20].p50 / s.anchor.close - 1) * 100;
console.log('C3 pct', pct3, '-> 2dp', pct3.toFixed(2), ' pct via rounded p50', ((Math.round(s.rows[20].p50) / s.anchor.close - 1) * 100).toFixed(4));

// ---- C4
const vals = A.map(a => ({ code: a.code, v: 10000 * a.rows[20].p50 / a.anchor.close }));
const mean4 = vals.reduce((s, x) => s + x.v, 0) / vals.length;
const gt = vals.filter(x => x.v > 10000).length;
const gtRounded = vals.filter(x => Math.round(x.v) > 10000).length;
const eq = vals.filter(x => x.v === 10000).length;
console.log('\nC4 rows[20].date set:', [...new Set(A.map(a => a.rows[20].date))]);
console.log('C4 mean 10000*p50_20/anchor =', mean4, '-> round', Math.round(mean4));
console.log('C4 count >10000 (raw):', gt, ' (after rounding to won):', gtRounded, ' exactly 10000:', eq);
const near = vals.filter(x => Math.abs(x.v - 10000) < 1).map(x => x.code + ':' + x.v.toFixed(4));
console.log('C4 values within 1 won of 10000:', near);
// alternative: sum of rounded values
const mean4r = vals.reduce((s, x) => s + Math.round(x.v), 0) / vals.length;
console.log('C4 alt mean of per-stock rounded values:', mean4r, '-> round', Math.round(mean4r));
// cumulative direction at rows[20]
const cum20 = {}; for (const a of A) { const c = a.rows[20].direction.cumulative.selected; cum20[c] = (cum20[c] || 0) + 1; }
console.log('C4 side-info rows[20] cumulative.selected counts:', cum20);

// ---- C9
const c9 = A.filter(a => a.anchor.date === f.actualAsOf && a.anchor.finalClose === true).length;
const c9b = A.filter(a => a.dataQuality && a.dataQuality.anchorFinalClose === true).length;
console.log('\nC9 anchor.date==actualAsOf && finalClose:', c9, ' dataQuality.anchorFinalClose:', c9b, ' summary.finalCloseStocks:', f.summary.finalCloseStocks, ' summary.anchorMatches:', f.summary.anchorMatches, ' dataStatus:', f.dataStatus, ' staleAnchor:', f.staleAnchor);
console.log('C9 anchor.date set:', [...new Set(A.map(a => a.anchor.date))], ' priceBasis set:', [...new Set(A.map(a => a.anchor.priceBasis))]);

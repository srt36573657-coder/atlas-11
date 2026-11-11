// 진단(버릴 가지) — 주문 1111-2202 올린 뒤 진짜 사이트 자료에서 28곳 20거래일 값이 찼는지 · 회차 셈
import fs from 'node:fs';
const B = 'https://aaa7377.com/atlas/data/', C = '009140 011810 018000 023150 027830 033050 033340 037330 043340 043610 050090 052400 057540 058820 072770 093240 095910 099520 115180 117670 205100 215790 254120 288980 290560 290650 368600 418620'.split(' ');
const j = async f => { const r = await fetch(B + f, {signal: AbortSignal.timeout(20000)}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const core = await j('core.json'), days = await j('days.json'), out = {at: new Date().toISOString(), asOf: core.asOf, base: core.base, roll: core.roll, made: core.made, n: C.length, full: 0, rows: []};
for (const c of C) { const co = await j('co/' + c + '.json'); const last = co.close.slice(-21); const ok = last.length === 21 && last.every(v => v != null && v > 0); if (ok) out.full++; out.rows.push([c, ok, last.at(-1), last[0]]); }
fs.mkdirSync('reports/atlas11/probe', {recursive: true}); fs.writeFileSync('reports/atlas11/probe/past28-live.json', JSON.stringify(out, null, 1) + '\n'); console.log(JSON.stringify({asOf: out.asOf, roll: out.roll, full: out.full, n: out.n}));

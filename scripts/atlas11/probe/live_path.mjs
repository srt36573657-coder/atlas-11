// 탐침 — 첫 화면 「지금 봄이 온 곳」 1 · 2 · 3번 행성이 지난 한 해 동안 지나온 길(사장님 2026-10-21 10:44
//   「1.2.3 번에 행성이 어떻게 움직었는지 지난 1년에 주식 변화를 그래프로도 이 우주안에서 동영상으로 보여줘야해 1번 보여주고 그다음 2번 보여주고 그다음 3번」)
//   진짜 사이트 자료(dist-manifest.json 의 atlas/data · next/data/theme-home.json)를 받아 테마 시계 셈(site/next/theme-engine.js 그대로)으로
//   날마다 x(한 달 동안 시장보다 더 오른 %p) · y(지난 닷새 더 오른 %p) · 업종 지수 · 시장 지수를 셈 — 마지막 날 x · y 가 theme-home.json 과 같은지 맞댐
//   씀: <OUT>/path.json(모든 업종 · 지난 한 해) · <OUT>/summary.json
//   쓰는 법: 실행기 node scripts/atlas11/probe/live_path.mjs · 로컬 LIVE_DIR=<site 폴더> 면 받지 않고 그 폴더 자료로
import fs from 'node:fs/promises';
import path from 'node:path';
import {indexOf, exOf, zoneOf, RULE} from '../../../site/next/theme-engine.js';
const B = 'https://aaa7377.com/', OUT = process.env.LIVE_OUT || 'reports/atlas11/probe/live-path', T0 = Date.now();
await fs.mkdir(OUT, {recursive: true});
const sum = {made: new Date().toISOString(), base: B, req: 0, err: {}, secs: 0};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function get(f, tries = 6) {
  let last = '';
  for (let i = 0; i < tries; i++) {
    sum.req++;
    try {
      const r = await fetch(B + f + (f.endsWith('.json') ? '?v=' + T0 : ''), {signal: AbortSignal.timeout(20000)});
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      last = 'HTTP ' + r.status; if (r.status === 404) break;
      if (r.status === 429 || r.status === 503) await wait(3000);
    } catch (e) { last = String(e?.cause?.code || e?.name || e).slice(0, 40); sum.err[last] = (sum.err[last] || 0) + 1; }
    await wait(400 * (i + 1));
  }
  throw Error(f + ' ' + last);
}
const J = b => JSON.parse(b.toString('utf8'));
const LOCAL = process.env.LIVE_DIR;
const read = async f => (LOCAL ? J(await fs.readFile(path.join(LOCAL, f))) : J(await get(f)));
let files;
if (LOCAL) files = (await fs.readdir(path.join(LOCAL, 'atlas/data/co'))).map(f => 'atlas/data/co/' + f);
else { const man = J(await get('dist-manifest.json')); files = Object.keys(man.hashes ?? {}).filter(f => /^atlas\/data\/co\/[0-9][0-9A-Z]{5}\.json$/.test(f)).sort(); }
const [days, mkt, home] = await Promise.all(['atlas/data/days.json', 'atlas/data/mkt.json', 'next/data/theme-home.json'].map(read));
const dates = days.dates, N = dates.length, T = N - 1, companies = mkt.companies;
const closes = new Map();
let k = 0;
async function worker() {
  while (k < files.length) {
    const f = files[k++], code = f.slice(-11, -5); if (!companies[code]) continue;
    let c; try { c = await read(f); } catch (e) { sum.err.co = (sum.err.co || 0) + 1; continue; }
    const cl = c?.close, k0 = c?.k0; if (!Array.isArray(cl) || !Number.isInteger(k0)) continue;
    const a = new Float64Array(N);
    for (let j = 0; j < cl.length; j++) { const t = j + k0, v = cl[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
    closes.set(code, a);
  }
}
await Promise.all(Array.from({length: LOCAL ? 1 : 8}, worker));
sum.files = files.length; sum.closes = closes.size; sum.asOf = dates[T]; sum.homeAsOf = home.asOf;
const codes = [...closes.keys()].filter(c => companies[c]).sort();
const M = indexOf(codes.map(c => closes.get(c)), N);
const mem = new Map();
for (const c of codes) { const i = companies[c].i; if (typeof i !== 'string') continue; if (!mem.has(i)) mem.set(i, []); mem.get(i).push(c); }
// 지난 한 해 = asOf 의 한 해 전 같은 날 뒤 첫 거래일부터(달력 한 해)
const y1 = String(Number(dates[T].slice(0, 4)) - 1) + dates[T].slice(4);
let t0 = dates.findIndex(d => d > y1); if (t0 < RULE.win) t0 = RULE.win;
const r2 = v => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null), r1 = v => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
const homeOf = new Map((home.inds ?? []).map(i => [i.n, i]));
const inds = {};
const check = [];
for (const [n, cs] of [...mem.entries()].filter(([, cs]) => cs.length >= RULE.minN).sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const I = indexOf(cs.map(c => closes.get(c)), N);
  const x = [], y = [], z = [], v = [];
  for (let t = t0; t <= T; t++) { const xx = exOf(I, M, t, RULE.win) * 100, yy = exOf(I, M, t, 5) * 100; x.push(r2(xx)); y.push(r2(yy)); z.push(zoneOf(xx, yy)); v.push(r1(I[t] / I[t0] * 100)); }
  const h = homeOf.get(n);
  inds[n] = {g: h?.g ?? null, k: cs.length, x, y, z, I: v};
  if (h) check.push({n, homeX: h.x, homeY: h.y, x: x[x.length - 1], y: y[y.length - 1], same: h.x === x[x.length - 1] && h.y === y[y.length - 1]});
}
const Mv = []; for (let t = t0; t <= T; t++) Mv.push(r1(M[t] / M[t0] * 100));
const top = home.order?.S ?? [];
const out = {schema: 'dori-path-1', made: sum.made, asOf: dates[T], from: dates[t0], days: T - t0 + 1, rule: {win: RULE.win, short: 5, bloomX: RULE.bloomX}, top, dates: dates.slice(t0), M: Mv, inds};
await fs.writeFile(path.join(OUT, 'path.json'), JSON.stringify(out) + '\n');
sum.secs = Math.round((Date.now() - T0) / 1000); sum.top = top; sum.from = dates[t0]; sum.days = T - t0 + 1; sum.inds = Object.keys(inds).length;
sum.check = {n: check.length, same: check.filter(c => c.same).length, diff: check.filter(c => !c.same).slice(0, 8)};
sum.topCheck = check.filter(c => top.includes(c.n));
await fs.writeFile(path.join(OUT, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
console.log(JSON.stringify({asOf: sum.asOf, homeAsOf: sum.homeAsOf, closes: sum.closes, days: sum.days, top, same: sum.check.same + '/' + sum.check.n, secs: sum.secs}));

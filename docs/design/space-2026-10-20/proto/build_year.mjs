// 1년 하늘 — 테마 시계 셈(site/next/theme-engine.js indexOf · exOf)과 같은 방법으로 업종마다 지난 1년 자리를 닷새마다 뽑음 · 읽기만
// 쓰는 법: node build_year.mjs <저장소> <나갈 파일>
import fs from 'node:fs/promises';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const {indexOf, exOf, RULE, zoneOf} = await import(path.join(repo, 'site/next/theme-engine.js'));
const dd = path.join(repo, 'site/atlas/data');
const J = async f => JSON.parse(await fs.readFile(f, 'utf8'));
const [days, mkt] = await Promise.all([J(path.join(dd, 'days.json')), J(path.join(dd, 'mkt.json'))]);
const dates = days.dates, N = dates.length, T = N - 1, companies = mkt.companies;
const closes = new Map();
for (const f of (await fs.readdir(path.join(dd, 'co'))).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort()) {
  const code = f.slice(0, 6); if (!companies[code]) continue;
  let c; try { c = await J(path.join(dd, 'co', f)); } catch { continue; }
  const cl = c?.close, k0 = c?.k0; if (!Array.isArray(cl) || !Number.isInteger(k0)) continue;
  const a = new Float64Array(N); for (let j = 0; j < cl.length; j++) { const t = j + k0, v = cl[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
  closes.set(code, a);
}
const codes = [...closes.keys()].filter(c => companies[c]).sort();
const M = indexOf(codes.map(c => closes.get(c)), N);
const mem = new Map(); for (const c of codes) { const i = companies[c].i; if (typeof i !== 'string') continue; if (!mem.has(i)) mem.set(i, []); mem.get(i).push(c); }
const names = [...mem.keys()].filter(n => mem.get(n).length >= RULE.minN).sort();
const STEP = 5, FROM = T - 50 * STEP; // 51 장(약 1년)
const ts = []; for (let t = FROM; t <= T; t += STEP) ts.push(t); if (ts[ts.length - 1] !== T) ts.push(T);
const r1 = v => Math.round(v * 10) / 10;
const inds = {}, zs = {};
for (const n of names) { const I = indexOf(mem.get(n).map(c => closes.get(c)), N); inds[n] = ts.map(t => [r1(exOf(I, M, t, RULE.win) * 100), r1(exOf(I, M, t, 5) * 100)]); zs[n] = ts.map(t => zoneOf(exOf(I, M, t, RULE.win) * 100, exOf(I, M, t, 5) * 100)).join(''); } // 자리는 반올림 전 값으로(0 언저리 부호 지킴)
// 맞대 보기 — 마지막 날 자리가 theme.json 과 같은가(같은 셈인지)
const th = JSON.parse(await fs.readFile(path.join(repo, 'site/next/data/theme.json'), 'utf8'));
let same = 0, diff = [];
for (const i of th.inds) { const v = inds[i.n]?.[ts.length - 1]; if (!v) { diff.push(i.n + ' 없음'); continue; } if (Math.abs(v[0] - i.x) <= 0.051 && Math.abs(v[1] - i.y) <= 0.051 && zs[i.n][ts.length - 1] === i.z) same++; else diff.push(`${i.n} ${v} ≠ ${i.x},${i.y}`); }
await fs.writeFile(out, JSON.stringify({step: STEP, dates: ts.map(t => dates[t]), inds, zs}));
console.log(JSON.stringify({frames: ts.length, from: dates[ts[0]], to: dates[T], inds: Object.keys(inds).length, sameAsTheme: same, of: th.inds.length, diff: diff.slice(0, 5), bytes: JSON.stringify({inds}).length}));

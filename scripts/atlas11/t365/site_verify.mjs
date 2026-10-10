#!/usr/bin/env node
// 새 ATLAS 사이트 자료 따로 세기 — site_build.py(파이썬)와 다른 길(노드 · 모음 원본 종가에서 처음부터)로 다시 세어 화면 자료와 맞댐
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/site_verify.mjs [자료 폴더 = site/atlas/data] [결과 = reports/atlas11/verify/atlas-new-data-latest.json]
//   맞대는 것: ① 회사 365곳 3개월 선(7월 6일 = 100) ② 업종 · 갈래 · 전체 「한 회사 한 표」 지수(날마다 같은 무게 평균 · 하루 ±50% 넘는 값 뺌 · 이어 곱함)
//             ③ 「큰 회사는 크게」 지수(7월 6일에 몸값만큼 사 두고 그대로) ④ 오름 · 내림 수 ⑤ 1년 반값 아래 떨어진 적 있는 곳 수 · 30% 넘게
//             ⑥ 회사 1주 값 · 1년 변화 ⑦ 이름표 1,375곳 가운데 「안」 = proposal.json 365곳 · 문마다 빠진 수 = proposal.json 셈
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const dataDir = path.resolve(ROOT, process.argv[2] ?? 'site/atlas/data');
const outFile = path.resolve(ROOT, process.argv[3] ?? 'reports/atlas11/verify/atlas-new-data-latest.json');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const core = J(path.join(dataDir, 'core.json')), comp = J(path.join(dataDir, 'comp.json')).companies, lines = J(path.join(dataDir, 'lines.json')).lines, names = J(path.join(dataDir, 'names.json'));
const T = path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365');
const byInd = J(path.join(T, 'by-industry.json')), pro = J(path.join(T, 'proposal.json'));
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'))).toString('utf8'));
const cal = J(path.join(ROOT, 'public/data/input.json')).calendar.sessions;
const bad = []; let checks = 0;
const near = (a, b, tol, what) => { checks++; if (a == null || b == null ? a !== b : Math.abs(a - b) > tol) bad.push({what, got: a, want: b}); };
const same = (a, b, what) => { checks++; if (a !== b) bad.push({what, got: a, want: b}); };

// 종가 표 — 회사마다 날짜 → 종가(0 은 없는 값)
const close = new Map();
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
for (const g of byInd.groups) for (const i of g.industries) for (const c of i.companies) {
  const m = new Map(); for (const r of bundle.stocks[c.code]?.fchart?.rows ?? []) if (r[4] > 0) m.set(iso(r[0]), r[4]); close.set(c.code, m);
}
// 3개월 창 — 화면 자료의 날짜와 달력이 같은지부터
const W = cal.filter(d => d <= core.asOf).slice(-64);
same(JSON.stringify(W), JSON.stringify(core.dates), '3개월 날짜 64개 = 거래소 달력');
const px = (c, d) => close.get(c)?.get(d) ?? null;

// ① 회사 선
const codes = Object.keys(comp);
same(codes.length, 365, '회사 수');
for (const c of codes) {
  const b = px(c, W[0]); const L = lines[c];
  W.forEach((d, k) => { const x = px(c, d); const want = x && b ? Math.round(x / b * 10000) / 100 : null; near(L[k] == null ? null : L[k] / 100, want, 0.0101, `선 ${c} ${d}`); });
}
// ② 한 회사 한 표 지수(따로 짬)
function eqIndex(cs) {
  const out = [100]; let lvl = 100;
  for (let k = 1; k < W.length; k++) { let s = 0, n = 0; for (const c of cs) { const a = px(c, W[k - 1]), b = px(c, W[k]); if (a && b) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s += r; n++; } } } if (n) lvl *= 1 + s / n; out.push(lvl); }
  return out;
}
// ③ 큰 회사는 크게 — 7월 6일 몸값 = 고를 때(10월 2일) 몸값 × 7월 6일 종가 ÷ 10월 2일 종가
const capSel = new Map(pro.picked.map(p => [p.code, p.capEok]));
function cwIndex(cs) {
  const w = cs.map(c => capSel.get(c) * px(c, W[0]) / px(c, core.pickAsOf));
  const last = cs.map(() => null);
  return W.map((d, k) => { let num = 0, den = 0; cs.forEach((c, j) => { const x = px(c, d); if (x) last[j] = x / px(c, W[0]) * 100; if (last[j] != null) { num += w[j] * last[j]; den += w[j]; } }); return num / den; });
}
const chk = (node, cs, label) => {
  const e = eqIndex(cs), cw = cwIndex(cs);
  e.forEach((x, k) => near(node.v[k], Math.round(x * 100) / 100, 0.0101, `${label} 한 회사 한 표 ${W[k]}`));
  cw.forEach((x, k) => near(node.cw[k], Math.round(x * 100) / 100, 0.0101, `${label} 큰 회사는 크게 ${W[k]}`));
  near(node.chg, Math.round((e.at(-1) - 100) * 100) / 100, 0.0101, `${label} 3개월`);
  let up = 0, dn = 0; for (const c of cs) { const r = px(c, W.at(-1)) / px(c, W[0]) - 1; const p = Math.round(r * 10000) / 100; if (p > 0) up++; else if (p < 0) dn++; }
  same(node.up, up, `${label} 오른 곳`); same(node.down, dn, `${label} 내린 곳`);
};
const all = byInd.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => c.code)));
chk(core.all, all, '365곳');
for (const g of byInd.groups) {
  const node = core.groups.find(x => x.id === g.id); if (!node) { bad.push({what: '갈래 없음 ' + g.id}); continue; }
  chk(node, g.industries.flatMap(i => i.companies.map(c => c.code)), '갈래 ' + g.name);
  for (const i of g.industries) { const ni = core.industries.find(x => x.name === i.name); if (!ni) { bad.push({what: '업종 없음 ' + i.name}); continue; } chk(ni, i.companies.map(c => c.code), '업종 ' + i.name); same(ni.n, i.companies.length, '업종 회사 수 ' + i.name); }
}
// 차례 = 3개월 많이 오른 순
const desc = a => a.every((x, k) => k === 0 || a[k - 1] >= x);
same(desc(core.groups.map(g => g.v.at(-1))), true, '갈래 차례 = 많이 오른 순');
for (const g of core.groups) same(desc(g.inds.map(n => core.industries.find(i => i.name === n).v.at(-1))), true, `${g.name} 업종 차례`);
// ④⑤⑥ 회사 값 · 1년
const Y = cal.filter(d => d <= core.asOf);
let dd50 = 0, dd30 = 0, n1y = 0;
for (const c of codes) {
  const x = comp[c];
  near(x.price, px(c, core.asOf), 0, `1주 값 ${c}`);
  const k1 = Y.length - 1 - 252, a = px(c, Y[k1]), z = px(c, core.asOf);
  if (a && z) near(x.r1y, Math.round((z / a - 1) * 10000) / 100, 0.0101, `1년 ${c}`);
  const yr = Y.slice(-253).map(d => px(c, d)).filter(Boolean);
  if (yr.length >= 200) { n1y++; let peak = 0, m = 0; for (const v of yr) { peak = Math.max(peak, v); m = Math.min(m, v / peak - 1); } if (m <= -0.5) dd50++; if (m <= -0.3) dd30++; }
  near(x.chg3, Math.round((z / px(c, W[0]) - 1) * 10000) / 100, 0.0101, `3개월 ${c}`);
}
same(core.facts.dd50, dd50, '1년 반값 아래 떨어진 적 있는 곳'); same(core.facts.dd30, dd30, '1년 30% 넘게 빠진 적 있는 곳'); same(core.facts.n1y, n1y, '1년 값 있는 곳');
// ⑦ 이름표
const inSet = names.rows.filter(r => r.s === 'in').map(r => r.c).sort(), proSet = pro.picked.map(p => p.code).sort();
same(JSON.stringify(inSet), JSON.stringify(proSet), '이름표 「안」 = proposal.json 365곳');
same(names.rows.length, pro.counts.universe, '이름표 수 = 모음 회사 수');
const gf = Object.fromEntries(pro.counts.gateFails); const nf = {}; for (const r of names.rows) if (r.s === 'gate') nf[r.w] = (nf[r.w] ?? 0) + 1;
same(JSON.stringify(Object.keys(nf).sort().map(k => [k, nf[k]])), JSON.stringify(Object.keys(gf).sort().map(k => [k, gf[k]])), '기본 문마다 빠진 수 = proposal.json');
same(names.rows.filter(r => r.s !== 'gate').length, pro.counts.gate, '기본 문 지난 수');
same(names.rows.filter(r => r.s === 'in' || r.s === 'cut').length, pro.counts.union, '흐름 문 지난 수');

// ⑧ 4단 자료(2026-10-11 08:10 「5단 클릭」) — 거래일 · 365곳 3년 지수 · 회사마다 종가 · 하루 ±30.5% 넘은 날
const days = J(path.join(dataDir, 'days.json'));
const dcnt = new Map(); for (const c of codes) for (const d of close.get(c).keys()) dcnt.set(d, (dcnt.get(d) ?? 0) + 1);
const DAYS = [...dcnt].filter(([d, n]) => n > codes.length / 2 && d <= core.asOf).map(([d]) => d).sort();
same(JSON.stringify(DAYS), JSON.stringify(days.dates), '긴 거래일 = 모음에서 절반 넘게 종가 있는 날');
{ let lvl = 100; const want = [100]; for (let k = 1; k < DAYS.length; k++) { let s2 = 0, n2 = 0; for (const c of codes) { const a = px(c, DAYS[k - 1]), b = px(c, DAYS[k]); if (a && b) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s2 += r; n2++; } } } if (n2) lvl *= 1 + s2 / n2; want.push(Math.round(lvl * 100) / 100); }
  want.forEach((x, k) => near(days.all[k], x, 0.0101, `365곳 긴 지수 ${DAYS[k]}`)); }
for (const c of codes) {
  const co = J(path.join(dataDir, 'co', c + '.json')), k0 = DAYS.findIndex(d => px(c, d));
  same(co.k0, k0, `긴 종가 시작 ${c}`);
  DAYS.slice(k0).forEach((d, k) => { checks++; if ((co.close[k] ?? null) !== (px(c, d) ?? null)) bad.push({what: `긴 종가 ${c} ${d}`, got: co.close[k], want: px(c, d)}); });
  const jw = []; let prev = null; for (const d of DAYS.slice(k0)) { const v = px(c, d); if (v && prev && Math.abs(v / prev - 1) > 0.305) jw.push(d); if (v) prev = v; }
  same(JSON.stringify(co.jumps.map(j => j[0])), JSON.stringify(jw), `하루 30% 넘게 바뀐 날 ${c}`);
  checks++; if (co.fin.years.some(y => y.endsWith('E'))) bad.push({what: `결산 해에 짐작 E 섞임 ${c}`});
}
const res = {schema: 'atlas-new-data-verify-1', made: new Date().toISOString(), data: path.relative(ROOT, dataDir), asOf: core.asOf, checks, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, bad: bad.length, first: bad.slice(0, 5)}));
process.exit(bad.length ? 1 : 0);

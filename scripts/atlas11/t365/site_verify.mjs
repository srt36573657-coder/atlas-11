#!/usr/bin/env node
// 새 ATLAS 사이트 자료 따로 세기 — site_build.py(파이썬)와 다른 길(노드 · 모음 원본 종가에서 처음부터)로 다시 세어 화면 자료와 맞댐
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/site_verify.mjs [자료 폴더 = site/atlas/data] [결과 = reports/atlas11/verify/atlas-new-data-latest.json]
//   맞대는 것: ① 회사 365곳 20거래일 선(기준일 = 마지막 종가 날의 20거래일 전 = 100 · 사장님 2026-10-11 09:37 「현재에서 지난 20일 거래 · 항상」)
//             ② 업종 · 갈래 · 전체 「한 회사 한 표」 지수(날마다 같은 무게 평균 · 하루 ±50% 넘는 값 뺌 · 이어 곱함)
//             ③ 「큰 회사는 크게」 지수(기준일에 몸값만큼 사 두고 그대로) ④ 오름 · 내림 수 ⑤ 1년 반값 아래 떨어진 적 있는 곳 수 · 30% 넘게
//             ⑨ 갈래 · 업종 · 전체의 방향 · 세기 · 힘(11:04 · 11:10 「이 화면에서 나와야 해」 — 곧은 선 · 앞 반 · 뒤 반)
//             ⑥ 회사 1주 값 · 1년 변화 ⑦ 이름표(후보 표 모두) 가운데 「안」 = proposal.json 365곳 · 문마다 빠진 수 · 밖 까닭 = proposal.json
//             ⑩ 회사마다 고른 까닭(층 · 네이버 업종 · 두 팀 잣대 숫자 · 30거래일) · 깔때기 · 업종 대세 순서 표 · 층마다 가운데값 = proposal.json(사장님 11:43 대세 365곳)
//   365곳 = scripts/atlas11/t365/universe.json 이 가리키는 판(지금 d365-v1) — 그 판의 고르기는 daese_verify.mjs 가 따로 다시 셈
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const dataDir = path.resolve(ROOT, process.argv[2] ?? 'site/atlas/data');
const outFile = path.resolve(ROOT, process.argv[3] ?? 'reports/atlas11/verify/atlas-new-data-latest.json');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const core = J(path.join(dataDir, 'core.json')), comp = J(path.join(dataDir, 'comp.json')).companies, lines = J(path.join(dataDir, 'lines.json')).lines, names = J(path.join(dataDir, 'names.json'));
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json')), T = process.env.ATLAS_D365_DIR || path.join(ROOT, ACT.dir); // 회차마다 새로 고른 폴더(사장님 12:41 「하루에 4번」)
const byInd = J(path.join(T, 'by-industry.json')), pro = J(path.join(T, 'proposal.json'));
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, ACT.bundle))).toString('utf8'));
const calBase = [...new Set([...J(path.join(ROOT, 'public/data/input.json')).calendar.sessions, ...(fs.existsSync(path.join(ROOT, 'public/data/rolling-calendar.json')) ? J(path.join(ROOT, 'public/data/rolling-calendar.json')).sessions ?? [] : [])])].sort(); // input.json + 11월까지 늘린 달력
const bad = []; let checks = 0;
const near = (a, b, tol, what) => { checks++; if (a == null || b == null ? a !== b : Math.abs(a - b) > tol) bad.push({what, got: a, want: b}); };
const same = (a, b, what) => { checks++; if (a !== b) bad.push({what, got: a, want: b}); };
const sameJ = (a, b, what) => same(JSON.stringify(a), JSON.stringify(b), what); // 배열 · 묶음은 글로 바꿔 맞댐

// 종가 표 — 회사마다 날짜 → 종가(0 은 없는 값)
const close = new Map();
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
for (const g of byInd.groups) for (const i of g.industries) for (const c of i.companies) {
  const m = new Map(); for (const r of bundle.stocks[c.code]?.fchart?.rows ?? []) if (r[4] > 0) m.set(iso(r[0]), r[4]); close.set(c.code, m);
}
// 이어 받은 종가(사장님 09:37 「항상」 · 환경 변수 ATLAS_T365_CLOSES = closes_fetch.mjs 폴더) — site_build.py 와 같은 규칙을 따로 짬:
//   파일 이름 차례 · 모음 마지막 날 뒤만 이어 붙임 · 같은 날은 나중 파일 · 그 파일의 모음 안 날 값이 0.5% 넘게 다른 회사는 그 파일에서 받지 않음
const BLAST = [...close.values()].flatMap(m => [...m.keys()]).sort().at(-1);
const baseRow = new Map([...close].map(([c, m]) => [c, new Map(m)]));
const CLOSES = process.env.ATLAS_T365_CLOSES;
if (CLOSES && fs.existsSync(CLOSES)) for (const fn of fs.readdirSync(CLOSES).filter(f => f.endsWith('.json.gz')).sort()) {
  const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CLOSES, fn))).toString('utf8'));
  if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue; // 1 = [날, 종가] · 2 = [날, 종가, 거래량]
  for (const [c, rs] of Object.entries(snap.rows ?? {})) {
    const m = close.get(c), b = baseRow.get(c); if (!m) continue;
    if (rs.some(([d, v]) => iso(d) <= BLAST && b.has(iso(d)) && Math.abs(v / b.get(iso(d)) - 1) > 0.005)) continue;
    for (const [d, v] of rs) if (iso(d) > BLAST && v > 0 && iso(d) <= pro.asOf) m.set(iso(d), v); // 고르는 날까지만(창의 끝 = 고르는 날)
  }
}
// 20거래일 창 — 마지막 종가 날(365곳 절반 넘게 종가가 있는 마지막 날)부터 거꾸로 거래소 달력 21일
const lastDay = (() => { const n = new Map(); for (const m of close.values()) for (const d of m.keys()) n.set(d, (n.get(d) ?? 0) + 1); return [...n].filter(([, k]) => k > 365 / 2).map(([d]) => d).sort().at(-1); })();
same(core.asOf, lastDay, '마지막 종가 날 = 모음(+ 이어 받은 종가)의 마지막 거래일');
same(core.asOf, pro.asOf, '마지막 종가 날 = 고르는 날(proposal.json)'); same(core.pickAsOf, pro.asOf, '고른 날 = 고르는 날');
const dataDays = (() => { const n = new Map(); for (const m of close.values()) for (const d of m.keys()) n.set(d, (n.get(d) ?? 0) + 1); return [...n].filter(([, k]) => k > 365 / 2).map(([d]) => d); })();
const cal = [...new Set([...calBase, ...dataDays.filter(d => d > calBase.at(-1))])].sort(); // 달력이 끝난 뒤는 절반 넘게 종가가 있는 날
const W = cal.filter(d => d <= core.asOf).slice(-21);
same(JSON.stringify(W), JSON.stringify(core.dates), '20거래일 창 날짜 21개(기준일 + 20) = 거래소 달력');
same(core.base, W[0], '기준일 = 20거래일 전'); same(core.days, 20, '창 길이 20거래일');
same(core.kPick, W.includes(core.pickAsOf) ? W.indexOf(core.pickAsOf) : null, '고른 날 자리(창 밖이면 없음)');
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
// ③ 큰 회사는 크게 — 기준일 몸값 = 고를 때(core.pickAsOf) 몸값 × 기준일 종가 ÷ 고른 날 종가(기준일 종가가 없는 곳은 뺌)
const capSel = new Map(pro.picked.map(p => [p.code, p.capEok]));
function cwIndex(cs0) {
  const cs = cs0.filter(c => px(c, W[0]));
  const w = cs.map(c => capSel.get(c) * px(c, W[0]) / px(c, core.pickAsOf));
  const last = cs.map(() => null);
  return W.map((d, k) => { let num = 0, den = 0; cs.forEach((c, j) => { const x = px(c, d); if (x) last[j] = x / px(c, W[0]) * 100; if (last[j] != null) { num += w[j] * last[j]; den += w[j]; } }); return num / den; });
}
// ⑨ 방향 · 세기 · 힘(사장님 11:04 · 11:10) — 화면 자료의 지수(v · cw)로 site_build.py trend() 와 같은 규칙을 따로 짜서 맞댐
const trendOf = v => {
  const n = v.length, xs = v.map((_, i) => i), ys = v.map(x => Math.log(x)), mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, ss = 0; for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); ss += (ys[i] - my) ** 2; }
  const b = sxy / sxx; let res = 0; for (let i = 0; i < n; i++) res += (ys[i] - (my + b * (xs[i] - mx))) ** 2;
  const r2 = ss > 0 ? 1 - res / ss : 0, fit = Math.exp(b * (n - 1)) - 1, chg = v[n - 1] / v[0] - 1, mid = Math.floor((n - 1) / 2), h1 = v[mid] / v[0] - 1, h2 = v[n - 1] / v[mid] - 1;
  const d = fit > 0.03 && chg > 0 ? 'up' : fit < -0.03 && chg < 0 ? 'down' : 'flat';
  return {d, s: d !== 'flat' && Math.abs(fit) >= 0.10 && r2 >= 0.6 ? 'strong' : null, t: h2 - h1 > 0.03 ? 'gain' : h1 - h2 > 0.03 ? 'fade' : null, fit: fit * 100, r2, h1: h1 * 100, h2: h2 * 100};
};
const chkTrend = (node, label) => {
  for (const [key, ser] of [['tr', node.v], ['trc', node.cw]]) {
    const want = trendOf(ser), got = node[key] ?? {};
    same(got.d, want.d, `${label} ${key} 방향`); same(got.s ?? null, want.s, `${label} ${key} 세기`); same(got.t ?? null, want.t, `${label} ${key} 힘`);
    near(got.fit, Math.round(want.fit * 100) / 100, 0.0101, `${label} ${key} 곧은 선`); near(got.h1, Math.round(want.h1 * 100) / 100, 0.0101, `${label} ${key} 앞 반`); near(got.h2, Math.round(want.h2 * 100) / 100, 0.0101, `${label} ${key} 뒤 반`); near(got.r2, Math.round(want.r2 * 100) / 100, 0.0101, `${label} ${key} 곧음`);
  }
};
const chk = (node, cs, label) => {
  chkTrend(node, label);
  const e = eqIndex(cs), cw = cwIndex(cs);
  e.forEach((x, k) => near(node.v[k], Math.round(x * 100) / 100, 0.0101, `${label} 한 회사 한 표 ${W[k]}`));
  cw.forEach((x, k) => near(node.cw[k], Math.round(x * 100) / 100, 0.0101, `${label} 큰 회사는 크게 ${W[k]}`));
  near(node.chg, Math.round((e.at(-1) - 100) * 100) / 100, 0.0101, `${label} 20거래일`);
  let up = 0, dn = 0; for (const c of cs) { if (!px(c, W.at(-1)) || !px(c, W[0])) continue; const r = px(c, W.at(-1)) / px(c, W[0]) - 1; const p = Math.round(r * 10000) / 100; if (p > 0) up++; else if (p < 0) dn++; }
  same(node.up, up, `${label} 오른 곳`); same(node.down, dn, `${label} 내린 곳`);
};
const all = byInd.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => c.code)));
chk(core.all, all, '365곳');
for (const g of byInd.groups) {
  const node = core.groups.find(x => x.id === g.id); if (!node) { bad.push({what: '갈래 없음 ' + g.id}); continue; }
  chk(node, g.industries.flatMap(i => i.companies.map(c => c.code)), '갈래 ' + g.name);
  for (const i of g.industries) { const ni = core.industries.find(x => x.name === i.name); if (!ni) { bad.push({what: '업종 없음 ' + i.name}); continue; } chk(ni, i.companies.map(c => c.code), '업종 ' + i.name); same(ni.n, i.companies.length, '업종 회사 수 ' + i.name); }
}
// 차례 = 20거래일 많이 오른 순
const desc = a => a.every((x, k) => k === 0 || a[k - 1] >= x);
same(desc(core.groups.map(g => g.v.at(-1))), true, '갈래 차례 = 많이 오른 순');
for (const g of core.groups) same(desc(g.inds.map(n => core.industries.find(i => i.name === n).v.at(-1))), true, `${g.name} 업종 차례`);
// ④⑤⑥ 회사 값 · 1년 — 그 회사 종가 줄(asOf 까지)로: 1주 값 = 마지막 줄 · 1년 = 252줄 전 대비 · 1년 가장 깊이 빠짐 = 마지막 252줄(줄 60개 이상)
let dd50 = 0, dd30 = 0, n1y = 0, jumpN = 0;
for (const c of codes) {
  const x = comp[c], cr = [...close.get(c).keys()].filter(d => d <= core.asOf).sort(), last = cr.at(-1);
  near(x.price, px(c, last), 0, `1주 값 ${c}`); same(x.priceDate, last, `1주 값 날짜 ${c}`);
  const z = px(c, core.asOf);
  near(x.r1y, cr.length > 252 ? Math.round((px(c, last) / px(c, cr.at(-253)) - 1) * 10000) / 100 : null, 0.0101, `1년 ${c}`);
  if (cr.length >= 60) { n1y++; let peak = 0, m = 0; for (const d of cr.slice(-252)) { const v = px(c, d); peak = Math.max(peak, v); m = Math.min(m, v / peak - 1); } near(x.mdd1y, Math.round(m * 10000) / 100, 0.0101, `1년 가장 깊이 빠짐 ${c}`); if (Math.round(m * 10000) / 100 <= -50) dd50++; if (Math.round(m * 10000) / 100 <= -30) dd30++; } else same(x.mdd1y, null, `1년 가장 깊이 빠짐 없음 ${c}`);
  near(x.chg, z && px(c, W[0]) ? Math.round((z / px(c, W[0]) - 1) * 10000) / 100 : null, 0.0101, `20거래일 ${c}`);
  // 20거래일 안 하루 ±30.5% 넘게 바뀐 날(앞 값 이어 씀) 있는 곳
  { let prev = null, j = false; for (const d of W) { const v = px(c, d); if (v && prev && (v / prev > 1.305 || v / prev < 0.695)) j = true; if (v) prev = v; } same(x.jump, j, `20거래일 튄 날 ${c}`); if (j) jumpN++; }
}
same(core.facts.dd50, dd50, '1년 반값 아래 떨어진 적 있는 곳'); same(core.facts.dd30, dd30, '1년 30% 넘게 빠진 적 있는 곳'); same(core.facts.n1y, n1y, '1년 값 있는 곳');
same(core.facts.jumpN, jumpN, '20거래일 안 하루 30% 넘게 튄 곳 수');
// ⑦ 이름표
const inSet = names.rows.filter(r => r.s === 'in').map(r => r.c).sort(), proSet = pro.picked.map(p => p.code).sort();
same(JSON.stringify(inSet), JSON.stringify(proSet), '이름표 「안」 = proposal.json 365곳');
same(names.rows.length, pro.counts.universe, '이름표 수 = 모음 회사 수');
const gf = Object.fromEntries(pro.counts.gateFails); const nf = {}; for (const r of names.rows) if (r.s === 'gate') nf[r.w] = (nf[r.w] ?? 0) + 1;
same(JSON.stringify(Object.keys(nf).sort().map(k => [k, nf[k]])), JSON.stringify(Object.keys(gf).sort().map(k => [k, gf[k]])), '기본 문마다 빠진 수 = proposal.json');
same(names.rows.filter(r => r.s !== 'gate').length, pro.counts.gate, '기본 문 지난 수');
same(names.rows.filter(r => r.s === 'in' || r.s === 'cut').length, pro.counts.rankedCompanies, '대세 순서를 매긴 업종 회사 수');
{ const ow = new Map(pro.outside.map(o => [o.code, [o.s, o.why]])); for (const r of names.rows) if (r.s !== 'in') sameJ([r.s, r.w], ow.get(r.c) ?? null, `밖 까닭 ${r.c}`); }
same(pro.rules.version, ACT.version, 'proposal 판 = universe.json 판');
// ⑩ 고른 까닭 · 깔때기 · 업종 대세 순서 표 · 층마다 가운데값(사장님 11:43)
const r2 = x => (x == null ? null : Math.round(x * 100) / 100), SX = new Map(pro.sectors.map(x => [x.name, x]));
for (const p of pro.picked) {
  const got = comp[p.code]?.pick, x = SX.get(p.sector); if (!got || !x) { bad.push({what: `까닭 없음 ${p.code}`}); continue; }
  for (const [k, v] of [['tier', p.tier], ['sector', p.sector], ['srank', x.rank], ['google', x.google], ['cia', x.cia], ['strong', x.strong], ['hits', x.hits], ['sn', x.n], ['inN', x.inN], ['part', p.part], ['prank', p.prank], ['pn', p.pn]]) sameJ(got[k], v, `까닭 ${p.code} ${k}`);
  for (const [k, v] of [['schg', x.chg * 100], ['sfit', x.fit * 100], ['sr2', x.r2], ['z', x.z], ['sbr', x.br * 100], ['smon', x.mon * 100], ['searn', x.earn * 100], ['r30', p.r30 == null ? null : p.r30 * 100]]) near(got[k], r2(v), 0.0101, `까닭 ${p.code} ${k}`);
}
const PC = pro.counts, FU = core.funnel;
sameJ([FU.universe, FU.gate, FU.ranked, FU.picked, FU.sectors, FU.top, FU.tiers], [PC.universe, PC.gate, PC.rankedCompanies, PC.picked, PC.ranked, PC.top, [PC.tier1, PC.tier2, PC.tier3]], '깔때기 숫자');
sameJ(FU.steps.map(x => x.n), [PC.universe, PC.gate, PC.rankedCompanies, PC.picked], '깔때기 줄 숫자');
sameJ(core.rules.sectors.map(x => [x.name, x.rank, x.tier, x.google, x.cia, x.n, x.in]), pro.sectors.map(x => [x.name, x.rank, x.tier, x.google, x.cia, x.n, x.inN]), '업종 대세 순서 표');
core.rules.sectors.forEach(x => near(x.chg, r2(SX.get(x.name)?.chg * 100), 0.0101, `업종 대세 순서 표 30거래일 ${x.name}`));
sameJ(core.rules.pickWin, {from: pro.window.from, to: pro.window.to, days: pro.window.days}, '고른 창');
for (const t of [1, 2, 3]) {
  const xs = codes.filter(c => pro.picked.find(p => p.code === c).tier === t).map(c => comp[c].chg).filter(x => x != null).sort((a, b) => a - b);
  const med = xs.length ? (xs.length % 2 ? xs[(xs.length - 1) / 2] : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2) : null;
  const ft = core.facts.tiers.find(y => y.t === t);
  same(ft?.n, codes.filter(c => pro.picked.find(p => p.code === c).tier === t).length, `${t}층 회사 수`); near(ft?.med, med == null ? null : Math.round(med * 100) / 100, 0.0101, `${t}층 ${core.days}거래일 가운데값`);
}

// ⑧ 4단 자료(2026-10-11 08:10 「5단 클릭」) — 거래일 · 365곳 3년 지수 · 회사마다 종가 · 하루 ±30.5% 넘은 날
const days = J(path.join(dataDir, 'days.json'));
const dcnt = new Map(); for (const c of codes) for (const d of close.get(c).keys()) dcnt.set(d, (dcnt.get(d) ?? 0) + 1);
const DAYS = [...dcnt].filter(([d, n]) => n > codes.length / 2 && d <= core.asOf).map(([d]) => d).sort();
same(JSON.stringify(DAYS), JSON.stringify(days.dates), '긴 거래일 = 모음에서 절반 넘게 종가 있는 날');
same(core.sincePick, DAYS.indexOf(core.asOf) - DAYS.indexOf(core.pickAsOf), '고른 날 뒤 거래일 수');
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

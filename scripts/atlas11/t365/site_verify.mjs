#!/usr/bin/env node
// 새 ATLAS 사이트 자료 따로 세기 — site_build.py(파이썬)와 다른 길(노드 · 모음 원본 종가에서 처음부터)로 다시 세어 화면 자료와 맞댐
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/site_verify.mjs [자료 폴더 = site/atlas/data] [결과 = reports/atlas11/verify/atlas-new-data-latest.json]
//   맞대는 것: ① 회사 365곳 20거래일 선(기준일 = 마지막 종가 날의 20거래일 전 = 100 · 사장님 2026-10-11 09:37 「현재에서 지난 20일 거래 · 항상」)
//             ② 업종 · 갈래 · 전체 「한 회사 한 표」 지수(날마다 같은 무게 평균 · 하루 ±50% 넘는 값 뺌 · 이어 곱함)
//             ③ 「큰 회사는 크게」 지수(기준일에 몸값만큼 사 두고 그대로) ④ 오름 · 내림 수 ⑤ 1년 반값 아래 떨어진 적 있는 곳 수 · 30% 넘게
//             ⑨ 갈래 · 업종 · 전체의 방향 · 세기 · 힘(11:04 · 11:10 「이 화면에서 나와야 해」 — 곧은 선 · 앞 반 · 뒤 반)
//             ⑥ 회사 1주 값 · 1년 변화 ⑦ 이름표(후보 표 모두) 가운데 「안」 = proposal.json 365곳 · 문마다 빠진 수 · 밖 까닭 = proposal.json
//             ⑩ 회사마다 든 까닭(멍거 · 린치 조건 ml-v1 · 꼬리표마다 값이 proposal.json 과 같고 그 갈래 조건을 넘는지 · 린치 성장 · 점수 다시 셈) · 깔때기 두 갈래 · 규칙 글 · 회차 시각 = universe.json slots
//                (사장님 2026-10-14 06:05 「가」 · 고르기 자체는 ml_verify.mjs 가 따로)
//             ⑫ 시간(사장님 14:37 · 14:39 「3년후 5년후 10년후 이야기」) — 봉인 번호(sha256) · 3년 전 → 봉인 날 · 봉인 뒤 지금까지 · 다시 여는 날 · 첫 화면 요약
//             ⑬ 회사 성장 이야기(16:51 · 봉인 안 함) — 매출을 모음 결산 글에서 따로 읽어 맞댐 · 이야기 기록과 맞댐 · 말 등급 다시 셈 · 금지 말 · 요약 수
//   바탕 회사 = scripts/atlas11/t365/universe.json 이 가리키는 판(지금 ml-v1 멍거 · 린치 조건) — 그 판의 고르기는 ml_verify.mjs 가 따로 다시 셈
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
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
// 20거래일 창 — 마지막 종가 날(고른 곳 절반 넘게 종가가 있는 마지막 날)부터 거꾸로 거래소 달력 21일
const NPICK = pro.picked.length; // 고른 곳 수(멍거 · 린치 조건 ml-v1 은 셈한 그대로 · 옛 판은 365)
const lastDay = (() => { const n = new Map(); for (const m of close.values()) for (const d of m.keys()) n.set(d, (n.get(d) ?? 0) + 1); return [...n].filter(([, k]) => k > NPICK / 2).map(([d]) => d).sort().at(-1); })();
same(core.asOf, lastDay, '마지막 종가 날 = 모음(+ 이어 받은 종가)의 마지막 거래일');
same(core.asOf, pro.asOf, '마지막 종가 날 = 고르는 날(proposal.json)'); same(core.pickAsOf, pro.asOf, '고른 날 = 고르는 날');
const dataDays = (() => { const n = new Map(); for (const m of close.values()) for (const d of m.keys()) n.set(d, (n.get(d) ?? 0) + 1); return [...n].filter(([, k]) => k > NPICK / 2).map(([d]) => d); })();
const cal = [...new Set([...calBase, ...dataDays.filter(d => d > calBase.at(-1))])].sort(); // 달력이 끝난 뒤는 절반 넘게 종가가 있는 날
const W = cal.filter(d => d <= core.asOf).slice(-21);
same(JSON.stringify(W), JSON.stringify(core.dates), '20거래일 창 날짜 21개(기준일 + 20) = 거래소 달력');
same(core.base, W[0], '기준일 = 20거래일 전'); same(core.days, 20, '창 길이 20거래일');
same(core.kPick, W.includes(core.pickAsOf) ? W.indexOf(core.pickAsOf) : null, '고른 날 자리(창 밖이면 없음)');
const px = (c, d) => close.get(c)?.get(d) ?? null;

// ① 회사 선
const codes = Object.keys(comp);
same(codes.length, NPICK, '회사 수 = 고른 곳 수');
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
// 고른 날 종가가 없는 회사(거래가 멈춤 — 멍거 조건은 결산만으로 고르므로 남음) = 모음 날 종가가 바탕(몸값을 그날로 안 맞췄으므로) · 둘 다 없으면 뺌
const capBase = c => px(c, core.pickAsOf) ?? (core.pickAsOf !== ACT.asOf ? px(c, ACT.asOf) : null);
function cwIndex(cs0) {
  const cs = cs0.filter(c => px(c, W[0]) && capBase(c) && capSel.get(c));
  const w = cs.map(c => capSel.get(c) * px(c, W[0]) / capBase(c));
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
chk(core.all, all, '고른 곳 전체');
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
// ⑦ 이름표(ml-v1 · 2026-10-14 06:05 「가」) — 안 = 고른 곳 · 밖은 「out」 또는 두 갈래 모두 모름 「q」 · 밖마다 갈래별 멈춘 자리(sm · sl)와 까닭 = proposal.json
const inSet = names.rows.filter(r => r.s === 'in').map(r => r.c).sort(), proSet = pro.picked.map(p => p.code).sort();
same(JSON.stringify(inSet), JSON.stringify(proSet), '이름표 「안」 = proposal.json 고른 곳');
same(names.rows.length, pro.counts.universe, '이름표 수 = 모음 회사 수');
same(names.rows.filter(r => !['in', 'out', 'q'].includes(r.s)).length, 0, '이름표 표시는 안 · 밖 · 모름 뿐');
same(names.rows.filter(r => r.s === 'q').length, pro.counts.q, '두 갈래 모두 모름 수 = proposal.json');
{ const ow = new Map(pro.outside.map(o => [o.code, [o.s, `멍거 — ${o.mg.why} / 린치 — ${o.ly.why}`, o.mg.s, o.ly.s]]));
  for (const r of names.rows) if (r.s !== 'in') sameJ([r.s, r.w, r.sm, r.sl], ow.get(r.c) ?? null, `밖 까닭 · 갈래마다 멈춘 자리 ${r.c}`); }
same(pro.rules.version, ACT.version, 'proposal 판 = universe.json 판');
// ⑩ 든 까닭 · 깔때기 · 규칙 글(ml-v1 — 고르기 자체는 ml_verify.mjs 가 후보 표 · 모음에서 따로 다시 셈)
//    꼬리표마다 값이 proposal.json 과 같고 그 갈래 조건을 모두 넘는지 · 린치 성장 · 점수는 여기서 다시 셈 · 순위 · 옛 칸 없음 · 깔때기 두 갈래 = proposal.json · 규칙 글 = proposal.json
const PC = pro.counts, FU = core.funnel, MC = PC.mg, LC = PC.ly, DEBT = 100, ROE = 18;
for (const p of pro.picked) {
  const got = comp[p.code]?.pick; if (!got) { bad.push({what: `까닭 없음 ${p.code}`}); continue; }
  sameJ([got.sector, got.tags], [p.sector, p.tags], `까닭 ${p.code} 업종 · 꼬리표`);
  same(p.tags.length > 0 && p.tags.every(t => t === 'mg' || t === 'ly'), true, `까닭 ${p.code} 꼬리표는 mg · ly`);
  if (p.tags.includes('mg')) {
    const m = p.mg, g = got.mg ?? {};
    sameJ([g.years, g.net, g.op], [m.years, m.net, m.op], `까닭 ${p.code} 멍거 3해 · 순이익 · 본업 이익`);
    (g.roe ?? []).forEach((v, i) => near(v, Math.round(m.roe[i] * 100) / 100, 0.0051, `까닭 ${p.code} ROE ${m.years[i]}`));
    (g.debt ?? []).forEach((v, i) => near(v, Math.round(m.debt[i] * 100) / 100, 0.0051, `까닭 ${p.code} 부채비율 ${m.years[i]}`));
    same(m.years.length === 3 && m.years.every(y => !String(y).endsWith('E')), true, `까닭 ${p.code} 확정 결산 3해`);
    same(m.net.every(x => x > 0) && (m.fin || m.op.every(x => x > 0)), true, `까닭 ${p.code} 멍거 ① 3해 모두 돈 벎`);
    same(m.debt.every(x => x <= DEBT), true, `까닭 ${p.code} 멍거 ② 빚 ≤ 자기 돈`);
    same(m.roe.every(x => x >= ROE), true, `까닭 ${p.code} 멍거 ③ 3해 모두 18% 이상`);
  } else { same(got.mg, null, `까닭 ${p.code} 멍거 값 없음`); same(p.mg, null, `proposal ${p.code} 멍거 값 없음`); }
  if (p.tags.includes('ly')) {
    const l = p.ly, g = got.ly ?? {};
    sameJ([g.years, g.eps, g.dps, g.px, g.pxDay, g.per], [l.years, l.eps, l.dps, l.px, l.pxDay, l.per], `까닭 ${p.code} 린치 해 · EPS · 배당 · 값 · 날 · PER`);
    const gr = (Math.sqrt(l.eps[1] / l.eps[0]) - 1) * 100, yl = (l.dps ?? 0) / l.px * 100, sc = (gr + yl) / l.per;
    near(l.g, gr, 1e-9, `까닭 ${p.code} 린치 성장 다시 셈`); near(l.score, sc, 1e-9, `까닭 ${p.code} 린치 점수 다시 셈`);
    near(g.g, Math.round(gr * 100) / 100, 0.0051, `까닭 ${p.code} 린치 성장(화면)`); near(g.yld, Math.round(yl * 100) / 100, 0.0051, `까닭 ${p.code} 배당 %(화면)`); near(g.score, Math.round(sc * 100) / 100, 0.0051, `까닭 ${p.code} 린치 점수(화면)`);
    same(l.eps[0] > 0 && l.eps[1] > 0 && gr >= 20 && gr <= 25, true, `까닭 ${p.code} 린치 ① 한 주 이익 해마다 20 ~ 25%`);
    same(sc >= 2, true, `까닭 ${p.code} 린치 ② (성장 + 배당) ÷ PER ≥ 2`);
    same(l.pxDay, ACT.asOf, `까닭 ${p.code} 린치 값의 날 = 모음 날`);
  } else { same(got.ly, null, `까닭 ${p.code} 린치 값 없음`); same(p.ly, null, `proposal ${p.code} 린치 값 없음`); }
  for (const k of ['kind', 'h1', 'h2', 'd', 'tier', 'srank', 'rank', 'prank', 'google', 'cia', 'years', 'net', 'op', 'roe', 'debt']) same(k in got, false, `까닭 ${p.code} 옛 칸 · 차례 없음(${k})`);
}
sameJ([FU.universe, FU.picked, FU.both, FU.q], [PC.universe, PC.picked, PC.both, PC.q], '깔때기 숫자(모두 · 고른 곳 · 둘 다 · 모름)');
sameJ((FU.groups ?? []).map(g => [g.k, g.n]), [['mg', MC.picked], ['ly', LC.picked]], '깔때기 두 갈래 · 고른 수');
sameJ(FU.groups?.[0]?.steps.map(x => x.n), [PC.universe, MC.known, MC.s1, MC.s2, MC.picked], '멍거 깔때기 줄 숫자');
sameJ(FU.groups?.[1]?.steps.map(x => x.n), [PC.universe, LC.known, LC.l0, LC.l1, LC.picked], '린치 깔때기 줄 숫자');
same(MC.known - MC.loss, MC.s1, '멍거 ① = 자료 있는 곳 − ① 빠짐'); same(MC.s1 - MC.debt, MC.s2, '멍거 ② = ① − ② 빠짐'); same(MC.s2 - MC.roe, MC.picked, '멍거 ③ = ② − ③ 빠짐');
same(LC.known - LC.loss, LC.l0, '린치 성장 셈 = 자료 있는 곳 − 못 셈'); same(LC.l0 - LC.g, LC.l1, '린치 ① = 성장 셈 − ① 빠짐'); same(LC.l1 - LC.peg, LC.picked, '린치 ② = ① − ② 빠짐');
same(MC.picked + LC.picked - PC.both, PC.picked, '고른 곳 = 멍거 + 린치 − 둘 다');
same(pro.picked.filter(p => p.tags.length === 2).length, PC.both, '둘 다 꼬리표 수 = proposal 셈');
same(codes.length, PC.picked, '사이트 회사 수 = 고른 곳 수');
for (const k of ['ranked', 'sectors', 'top', 'tiers', 'gate', 'measured', 'gainAll', 'kinds', 'steps', 'stop', 'stopName', 'known', 's1', 's2', 'loss', 'debt', 'roe']) same(k in FU, false, `깔때기 옛 칸 없음(${k})`);
for (const k of ['version', 'label', 'line', 'groups', 'conds', 'price', 'wait', 'notCounted', 'limits', 'notMunger', 'q']) sameJ(core.rules[k], pro.rules[k], `규칙 글 ${k} = proposal.json`);
same(core.rules.lyDay, ACT.asOf, '린치 값의 날 = universe.json 모음 날');
same(core.rules.next, `하루 ${ACT.slots.length}번(${ACT.slots.join(' · ')} 서울) 값과 그림만 새로 · 고른 곳은 새 1년 성적표가 들어와야 바뀜`, '도움말 회차 시각 = universe.json slots(틀림 장부 21번)');
for (const k of ['google', 'cia', 'tiers', 'sectors', 'unranked', 'pickWin', 'turn', 'buf', 'fill', 'bias', 'past']) same(k in core.rules, false, `규칙 옛 칸 없음(${k})`);
for (const k of ['pickCmp', 'kinds', 'gainDown']) same(k in core.facts, false, `사실 옛 칸 없음(${k})`);
same(core.facts.mg?.per30, pro.picked.filter(p => p.tags.includes('mg') && p.per != null && p.per > 30).length, '멍거 갈래 값이 1년 이익의 30배 넘는 곳 수 = proposal.json');

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
// ⑫ 시간 — 봉인(사장님 2026-10-11 14:37 · 14:39 「현재에 집중하며 과거도 존중하며 3년후 5년후 10년후에 이야기를 담에내는 … 과감하게 하라」)
//   봉인 파일(reports/atlas11/t365/capsule/capsule-<번호>.json)마다: 봉인 번호를 노드로 다시 셈(열쇠 차례 JSON · sha256) · 3년 전 → 봉인 날(같은 돈 나눠 사서 그대로 · 그날 값 없으면 앞 값)
//   · 봉인 뒤 지금까지(잠근 종가에서) · 다시 여는 날 · 첫 화면 요약(core.time)을 site_build.py 와 다른 길(노드 · 모음 원본 + 같은 이어 받기 규칙)로 따로 셈
const CAPD = path.join(ROOT, 'reports/atlas11/t365/capsule');
const caps = fs.existsSync(CAPD) ? fs.readdirSync(CAPD).filter(f => /^capsule-\d+\.json$/.test(f)).sort((a, b) => +a.slice(8, -5) - +b.slice(8, -5)) : [];
const canon = x => (Array.isArray(x) ? '[' + x.map(canon).join(',') + ']' : x && typeof x === 'object' ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}' : JSON.stringify(x));
const allClose = new Map(); // 후보 누구든 — 모음 + 이어 받은 종가(위 ① 과 같은 규칙)
const snaps = CLOSES && fs.existsSync(CLOSES) ? fs.readdirSync(CLOSES).filter(f => f.endsWith('.json.gz')).sort().map(fn => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CLOSES, fn))).toString('utf8'))).filter(s => ['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(s.schema)) : [];
const cl = c => {
  if (allClose.has(c)) return allClose.get(c);
  const m = new Map(); for (const r of bundle.stocks[c]?.fchart?.rows ?? []) if (r[4] > 0 && iso(r[0]) <= core.asOf) m.set(iso(r[0]), r[4]);
  const b = new Map(m);
  for (const s of snaps) { const rs = s.rows?.[c]; if (!rs) continue; if (rs.some(([d, v]) => iso(d) <= BLAST && b.has(iso(d)) && Math.abs(v / b.get(iso(d)) - 1) > 0.005)) continue; for (const [d, v] of rs) if (iso(d) > BLAST && v > 0 && iso(d) <= core.asOf) m.set(iso(d), v); }
  allClose.set(c, m); return m;
};
const hold = (cs, ds, base) => { const have = cs.filter(c => base[c]), last = new Map(); return {have, v: ds.map(d => { if (!have.length) return null; let s = 0; for (const c of have) { const x = cl(c).get(d); if (x) last.set(c, x); s += (last.get(c) ?? base[c]) / base[c]; } return Math.round(s / have.length * 100 * 100) / 100; })}; };
const nearA = (a, b, tol, what) => { checks++; if (!Array.isArray(a) || a.length !== b.length || a.some((x, k) => (x == null || b[k] == null ? x !== b[k] : Math.abs(x - b[k]) > tol))) bad.push({what, got: JSON.stringify(a)?.slice(0, 80), want: JSON.stringify(b).slice(0, 80)}); };
const plusY = (d, n) => { const [y, m, dd] = d.split('-').map(Number); const t = new Date(Date.UTC(y + n, m - 1, dd)); return t.getUTCMonth() === m - 1 ? t.toISOString().slice(0, 10) : `${y + n}-${String(m).padStart(2, '0')}-28`; };
const TJ = fs.existsSync(path.join(dataDir, 'time.json')) ? J(path.join(dataDir, 'time.json')) : null;
const wantCaps = [];
for (const fn of caps) {
  const cap = J(path.join(CAPD, fn)), body = {}; for (const k of ['id', 'seal', 'version', 'opens', 'rules', 'members', 'picks36', 'pool']) if (k in cap) body[k] = cap[k]; // 봉인 1호는 그때 잠근 그대로(옛 36곳 칸 포함) — 새 봉인에는 그 칸 없음
  same(crypto.createHash('sha256').update(canon(body), 'utf8').digest('hex'), cap.digest, `봉인 번호 ${fn}`);
  if (cap.seal > core.asOf || !DAYS.includes(cap.seal)) continue;
  wantCaps.push(cap);
  const got = TJ?.capsules?.find(x => x.id === cap.id); if (!got) { bad.push({what: `시간 자료에 봉인 ${cap.id}호 없음`}); continue; }
  same(got.digest, cap.digest, `봉인 ${cap.id}호 번호`); sameJ(got.opens, [3, 5, 10].map(y => ({y, date: plusY(cap.seal, y)})), `봉인 ${cap.id}호 다시 여는 날 = 3 · 5 · 10년 뒤`); sameJ(got.opens, cap.opens, `다시 여는 날 = 봉인 파일`);
  sameJ(got.rules, cap.rules.filter(r => !r.includes('36곳')), `잠근 규칙 = 봉인 파일(골라 낸 목록 줄만 뺌 — 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」)`); same(!!got.rulesNote, cap.rules.some(r => r.includes('36곳')), '뺀 규칙 줄이 있으면 화면에 알림');
  for (const k of ['pick36', 'n36']) { checks++; if (k in got) bad.push({what: `시간 자료에 「${k}」(36곳 흔적)`}); }
  for (const k of ['v36', 'chg36', 'have36']) { checks++; if (k in (got.since ?? {})) bad.push({what: `봉인 뒤 자료에 「${k}」(36곳 흔적)`}); } sameJ(got.members, cap.members.map(m => [m[0], m[2]]), `봉인 365곳 · 잠근 종가`);
  const mem = cap.members.map(m => m[0]), pool = cap.pool.filter(p => p[1]).map(p => p[0]);
  // 3년 전 → 봉인 날
  const from = DAYS.find(d => d >= plusY(cap.seal, -3)), PW = DAYS.filter(d => d >= from && d <= cap.seal);
  same(got.past.from, from, '3년 전 = 봉인 날 3년 전 그날 또는 그 뒤 첫 거래일'); sameJ(got.past.dates, PW, '지나온 길 날짜');
  const pb = Object.fromEntries([...new Set([...mem, ...pool])].map(c => [c, cl(c).get(from) ?? null]));
  const a = hold(mem, PW, pb), p = hold(pool, PW, pb);
  nearA(got.past.v365, a.v, 0.011, '지나온 길 365곳'); nearA(got.past.vpool, p.v, 0.011, '지나온 길 후보 모두');
  same(got.past.n365, a.have.length, '3년 전 값 있던 365곳 수'); same(got.past.skip365, mem.length - a.have.length, '3년 전 값 없던 곳 수'); same(got.past.nPool, p.have.length, '3년 전 값 있던 후보 수');
  near(got.past.mult365, a.v.at(-1) / 100, 0.0002, '365곳 배'); near(got.past.multPool, p.v.at(-1) / 100, 0.0002, '후보 모두 배');
  const rat = a.have.map(c => cl(c).get(cap.seal) / pb[c]).filter(x => isFinite(x)).sort((x, y) => x - y), mid = rat.length >> 1;
  near(got.past.med365, rat.length ? Math.round((rat.length % 2 ? rat[mid] : (rat[mid - 1] + rat[mid]) / 2) * 1e4) / 1e4 : null, 0.0002, '365곳 가운데 회사 배');
  let half = 0; for (const c of a.have) { let pk = 0, mm = 0; for (const d of PW) { const x = cl(c).get(d); if (x) { pk = Math.max(pk, x); mm = Math.min(mm, x / pk - 1); } } if (mm <= -0.5) half++; }
  same(got.past.half, half, '3년 사이 반값 아래로 떨어진 적 있는 곳');
  // 봉인 뒤 지금까지 — 잠근 종가에서
  const TD = DAYS.filter(d => d >= cap.seal && d <= core.asOf), sp = {...Object.fromEntries(cap.pool.filter(x => x[1])), ...Object.fromEntries(cap.members.map(m => [m[0], m[2]]))};
  sameJ(got.since.dates, TD, '봉인 뒤 날짜'); same(got.since.days, TD.length - 1, '봉인 뒤 거래일 수');
  const s1 = hold(mem, TD, sp), s3 = hold(pool, TD, sp);
  nearA(got.since.v365, s1.v, 0.011, '봉인 뒤 365곳'); nearA(got.since.vpool, s3.v, 0.011, '봉인 뒤 후보 모두');
  const chgOf = v => (TD.length > 1 ? Math.round((v.at(-1) - 100) * 100) / 100 : null);
  near(got.since.chg365, chgOf(s1.v), 0.0101, '봉인 뒤 365곳 %'); near(got.since.chgPool, chgOf(s3.v), 0.0101, '봉인 뒤 후보 %');
  same(got.since.have365, s1.have.length, '봉인 뒤 값 있는 365곳'); same(got.since.havePool, s3.have.length, '봉인 뒤 값 있는 후보');
  same(got.since.stale365, s1.have.filter(c => !cl(c).get(TD.at(-1))).length, '마지막 날 값 없는 365곳(앞 값으로 셈)');
  if (cap === wantCaps[0]) { // 첫 화면 요약
    const k = core.time; if (!k) { bad.push({what: '첫 화면 시간 요약(core.time) 없음'}); continue; }
    same(k.id, cap.id, '요약 봉인 번호'); same(k.digest, cap.digest.slice(0, 12), '요약 봉인 번호 앞 12자'); sameJ(k.opens, cap.opens, '요약 다시 여는 날');
    sameJ(k.past, {from, mult365: got.past.mult365, multPool: got.past.multPool, n365: a.have.length, nPool: p.have.length, half}, '요약 지나온 길');
    sameJ(k.since, {days: TD.length - 1, chg365: got.since.chg365, chgPool: got.since.chgPool}, '요약 봉인 뒤');
  }
}
same(TJ ? TJ.capsules.length : 0, wantCaps.length, '시간 자료 봉인 수 = 이 자료 안 봉인 수'); same(!!core.time, wantCaps.length > 0, '첫 화면 시간 요약 있음 = 봉인 있음');

// ⑬ 회사 성장 이야기(사장님 2026-10-11 16:51 · 16:56 「3번」 365곳 모두 · 16:57 「이건 봉인하지마」) — 노드로 따로:
//   매출(차트 숫자)은 모음의 네이버 연간 결산 글을 여기서 따로 읽어 맞댐(grow.py · dump.mjs 길과 다른 길) · 이야기는 기록 파일(reports/atlas11/t365/grow/stories-*.json · 회사마다 가장 새 파일)과 맞댐
//   말 등급은 범위에서 다시 셈 · 범위 차례(0 < lo ≤ mid ≤ hi) · 근거 주소 http(s) · 금지 말 · 요약(grow.json · core.grow) 수
{
  const GDIR = path.join(ROOT, 'reports/atlas11/t365/grow');
  const files = fs.existsSync(GDIR) ? fs.readdirSync(GDIR).filter(f => /^stories-.*\.json$/.test(f)).sort() : [];
  const ST = {}; for (const f of files) { const rec = J(path.join(GDIR, f)); for (const [code, x] of Object.entries(rec.companies)) ST[code] = {...x, file: 'reports/atlas11/t365/grow/' + f}; }
  const gr = (lo, hi) => { if (lo == null || hi == null) return null; const f = lo >= 1 ? 1 : hi <= 1 ? 0 : Math.log(hi) / (Math.log(hi) - Math.log(lo)); return f >= 0.9 ? '아주 높다' : f >= 0.65 ? '높다' : f >= 0.35 ? '반반' : f >= 0.1 ? '낮다' : '아주 낮다'; };
  const BAN = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률', '주가', '목표 주가', '유망', '대박'];
  const num = t => (t == null || t === '' || t === '-' ? null : Number(String(t).replace(/,/g, '')));
  const GJ = fs.existsSync(path.join(dataDir, 'grow.json')) ? J(path.join(dataDir, 'grow.json')) : null;
  if (!GJ) bad.push({what: '성장 요약 grow.json 없음'});
  let written = 0;
  for (const c of Object.keys(comp)) {
    const G = J(path.join(dataDir, 'co', c + '.json')).grow;
    if (!G) { bad.push({what: `성장 자료 없음 ${c}`}); continue; }
    // 매출 — 모음 결산 글을 따로 읽음(해 · 값 · 증권사 평균치 E)
    let fi = null; try { fi = JSON.parse(bundle.stocks[c].finance.text).financeInfo; } catch { /* 없음 */ }
    if (fi) {
      const row = (fi.rowList || []).find(r => r.title === '매출액'), heads = fi.trTitleList || [];
      sameJ(G.years, heads.map(t => t.title.replace(/\.$/, '').slice(0, 4) + (t.isConsensus === 'Y' ? 'E' : '')), `성장 해 ${c}`);
      sameJ(G.rev, heads.map(t => num(row?.columns?.[t.key]?.value)), `성장 매출(모음 결산 글) ${c}`);
    } else same(G.years.length, 0, `결산 글이 없는데 해가 있음 ${c}`);
    const act = G.years.map((y, k) => [y, G.rev[k]]).filter(([y]) => !y.endsWith('E'));
    same(G.baseYear, act.at(-1)?.[0] ?? null, `성장 바탕 해 ${c}`); same(G.baseRev, act.at(-1)?.[1] ?? null, `성장 바탕 매출 ${c}`);
    checks++; if (G.top.some((t, k) => k && (G.top[k - 1][1] ?? 0) < (t[1] ?? 0))) bad.push({what: `같은 업종 큰 순 차례 ${c}`});
    checks++; if (G.ind.rank != null && G.ind.rank <= G.top.length && G.top[G.ind.rank - 1]?.[2] !== c) bad.push({what: `같은 업종 차례에 이 회사 자리 ${c}`, got: G.top[G.ind.rank - 1]?.[2], want: c});
    const st = ST[c];
    same(!!G.story, !!st, `성장 이야기 있음 = 기록 있음 ${c}`);
    if (!st || !G.story) continue;
    written++;
    same(G.story.shape, st.judge.shape, `판의 모양 ${c}`); same(G.story.file, st.file, `이야기 기록 파일 ${c}`);
    for (const k of ['1', '3', '5', '10']) {
      const x = G.story.h[k], y = st.judge.h[k] || {};
      same(x.lo, y.lo ?? null, `범위 lo ${c} ${k}년`); same(x.mid, y.mid ?? null, `범위 mid ${c} ${k}년`); same(x.hi, y.hi ?? null, `범위 hi ${c} ${k}년`); same(x.g, gr(y.lo, y.hi), `말 등급 ${c} ${k}년`);
      if (x.mid != null) { checks++; if (!(0 < x.lo && x.lo <= x.mid && x.mid <= x.hi)) bad.push({what: `범위 차례 ${c} ${k}년`, got: [x.lo, x.mid, x.hi]}); }
    }
    sameJ(G.story.facts.map(({chk, ...f}) => f), st.research.facts || [], `근거 기사 ${c}`); // chk = 따로 다시 확인 판정(7단 · 아래에서 기록과 맞댐)
    if (G.ind.size === 'rev') same(G.ind.me, G.baseRev, `5단 이 회사 크기 = 바탕 매출 ${c}`); // 5단 막대 「이 회사」 줄
    checks++; if (G.ind.rank != null && G.top.length && G.ind.me != null && G.ind.rank > G.top.length && G.ind.me > (G.top.at(-1)[1] ?? 0)) bad.push({what: `5단 이 회사 크기가 위 다섯보다 큼 ${c}`, got: G.ind.me});
    for (const f of G.story.facts) { checks++; if (!/^https?:\/\//.test(f.url || '')) bad.push({what: `근거 주소 ${c}`, got: f.url}); }
    const txt = JSON.stringify([Object.values(G.story.h).map(x => x.t), G.story.brk, G.story.teams, G.story.sells, G.story.why, G.story.market, G.story.events, G.story.unknown, G.story.rivals.map(r => [r.name, r.note, r.where]), G.story.facts.map(f => f.text)]);
    for (const w of BAN) { checks++; if (txt.includes(w)) bad.push({what: `성장 이야기 금지 말 「${w}」 ${c}`}); }
    if (GJ) { const sm = GJ.companies[c]; same(sm?.s, G.story.shape, `요약 판의 모양 ${c}`); sameJ(sm?.g, Object.fromEntries(['1', '3', '5', '10'].map(k => [k, G.story.h[k].g])), `요약 말 등급 ${c}`); sameJ(sm?.m, Object.fromEntries(['1', '3', '5', '10'].map(k => [k, G.story.h[k].mid])), `요약 가운데 ${c}`); }
  }
  if (GJ) { same(GJ.written, written, '성장 요약 쓴 곳 수'); same(GJ.of, Object.keys(comp).length, '성장 요약 365곳'); same(Object.keys(GJ.companies).length, written, '성장 요약 회사 수'); }
  same(core.grow?.written, written, '첫 화면 성장 요약 쓴 곳 수'); same(core.grow?.of, Object.keys(comp).length, '첫 화면 성장 요약 365곳');
  { const ck = fs.existsSync(GDIR) ? fs.readdirSync(GDIR).filter(f => /^check-.*\.json$/.test(f)).sort() : []; // 따로 다시 확인 — 가장 새 기록의 수를 파일에서 다시 셈
    if (ck.length) { const rec = J(path.join(GDIR, ck.at(-1))), cnt = (arr, ks) => Object.fromEntries([['n', arr.length], ...ks.map(k => [k, arr.filter(x => x.verdict === k).length])]);
      sameJ(core.grow?.check?.facts, cnt(rec.facts.items, ['맞음', '일부만 맞음', '틀림', '못 엶']), '따로 다시 확인 사실 수'); sameJ(core.grow?.check?.rivals, cnt(rec.rivals.items, ['기사로 확인', '다른 일을 함', '확인 못 함']), '따로 다시 확인 경쟁 회사 수');
      same(core.grow?.check?.file, 'reports/atlas11/t365/grow/' + ck.at(-1), '따로 다시 확인 기록 파일');
      // 7단(2026-10-12 CIA팀) — 회사마다 화면에 붙인 판정 = 기록(경쟁 회사는 기사 주소가 없던 것만 · 사실은 주소와 글이 같은 것만)
      const RV = new Map(rec.rivals.items.map(x => [x.code + '|' + x.rival, x])), FV = new Map(rec.facts.items.map(x => [x.code + '|' + x.url + '|' + x.text, x.verdict]));
      for (const c of Object.keys(comp)) { const S = J(path.join(dataDir, 'co', c + '.json')).grow?.story; if (!S) continue;
        for (const r of S.rivals) { const x = !r.url ? RV.get(c + '|' + r.name) : null; sameJ(r.chk ?? null, x ? {v: x.verdict, url: x.url || null} : null, `경쟁 회사 따로 확인 판정 ${c} ${r.name}`); }
        for (const f of S.facts) same(f.chk ?? null, FV.get(c + '|' + f.url + '|' + f.text) ?? null, `근거 기사 따로 확인 판정 ${c}`); }
    } else same(core.grow?.check ?? null, null, '따로 다시 확인 기록이 없는데 요약이 있음'); }
  { let fn = 0; for (const c of Object.keys(comp)) { const S = J(path.join(dataDir, 'co', c + '.json')).grow?.story; if (S) fn += S.facts.length; } same(core.grow?.factN, fn, '따로 다시 확인 표본의 모집단(근거 기사 수)'); } // CIA팀 2026-10-12
  { const fut = calBase.filter(d => d > core.asOf); same(core.mcEnd ?? null, fut.length >= 20 ? fut[19] : null, '7단 한 달 범위 맞대 볼 날 = 고른 날에서 20거래일 뒤'); }
  { // 치우침(6단 「다르게 보면」 · grow_bias.py screen()) — 노드로 지금 365곳에서 다시 셈: 10년 가운데의 가운데값 · 1년 가운데 × 2025년 매출 ÷ 올해 증권사 평균치의 가운데값
    const med = a => { const x = [...a].sort((p, q) => p - q), n = x.length; return n ? (n % 2 ? x[(n - 1) / 2] : (x[n / 2 - 1] + x[n / 2]) / 2) : null; };
    const m10 = [], rat = [];
    for (const c of Object.keys(comp)) { const G = J(path.join(dataDir, 'co', c + '.json')).grow, S = G?.story; if (!S) continue;
      if (S.h['10'].mid != null) m10.push(S.h['10'].mid);
      const ek = G.years.findIndex(y => y.endsWith('E')), est = ek >= 0 ? G.rev[ek] : null;
      if (S.h['1'].mid != null && est && G.baseRev) rat.push(S.h['1'].mid * G.baseRev / est); }
    near(core.grow?.bias?.m10, med(m10) == null ? null : Math.round(med(m10) * 100) / 100, 0.0051, '6단 다르게 보면 — 10년 가운데의 가운데값'); same(core.grow?.bias?.n10, m10.length, '6단 다르게 보면 — 10년 가운데 있는 곳');
    near(core.grow?.bias?.cons, med(rat) == null ? null : Math.round(med(rat) * 1000) / 1000, 0.00051, '6단 다르게 보면 — 증권사 견줌 가운데값'); same(core.grow?.bias?.consN, rat.length, '6단 다르게 보면 — 증권사 견줌 곳 수');
  }
  if (GJ && core.grow) sameJ(core.grow.g10, Object.fromEntries(['아주 높다', '높다', '반반', '낮다', '아주 낮다'].map(g => [g, Object.values(GJ.companies).filter(x => x.g['10'] === g).length])), '첫 화면 10년 말 등급 수');
}

const res = {schema: 'atlas-new-data-verify-1', made: new Date().toISOString(), data: path.relative(ROOT, dataDir), asOf: core.asOf, checks, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, bad: bad.length, first: bad.slice(0, 5)}));
process.exit(bad.length ? 1 : 0);

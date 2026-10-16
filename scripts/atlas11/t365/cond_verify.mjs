#!/usr/bin/env node
// 조건 찾기 따로 세기(cd-v1 · 사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」 · 규칙 72)
//   결정표 v1 · v2(docs/design/cond-2026-10-16/decision-v1.md · decision-v2.md)만 보고 노드로 처음부터 다시 세어 cond.json 과 칸마다 맞댐 — 허용 오차 없음
//   — 2026-10-16 은 일꾼이 사용 한도(10월 18일 11:00 서울에 풀림)라 cond.py 를 쓴 Claude 가 이 파일도 씀(다른 일꾼이 아님 · 결정표 v2 「따로 세기」 줄에 밝힘)
//   재료 = 같은 자료 폴더의 사이트 자료만: core.json(업종 차례 · rise.list · tr.d · cw 선) · mkt.json(회사 · 업종 · 고른 곳) · comp.json(고른 곳 몸값) · co/<번호>.json(몸값 c.cap · k0 · close · jumps · fin · key) · days.json
//   맞대는 것: ① 판 이름 · 날(asOf = core = mkt = days 끝) · d5 · d20 · provisional · n
//             ② 업종마다 n · w1 · wc1 · rise · rc · up · dn · k(회사 수)
//             ③ 회사마다 c · i · cap · rk · r5 · x5 · q5 · d15 · m30 · q20 · f3 · ls · p · l5
//             ④ 짝 모두(① 5 × ② 5 × ③ 4 = 100) — 단계마다 남은 수 · 남은 곳(몸값 큰 차례 · 같으면 번호) · ? 곳(어느 칸에서) — 이 셈으로 센 것과 cond.json 값으로 화면 규칙대로 센 것이 같아야 함
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/cond_verify.mjs <자료 폴더> [결과 json]   — 틀린 것이 하나라도 있으면 끝 코드 1
//   결정표가 두 뜻으로 읽히는 곳은 「// 결정표 해석:」 줄에 고른 뜻을 적음
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const [dataArg, outArg] = process.argv.slice(2);
const D = path.resolve(ROOT, dataArg ?? 'site/atlas/data');
const OUT = path.resolve(ROOT, outArg ?? 'reports/atlas11/verify/atlas-new-cond-latest.json');
const J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const bad = []; let checks = 0;
const canon = x => JSON.stringify(x);
const same = (got, want, what) => { checks++; if (canon(got) !== canon(want)) bad.push({what, got: got === undefined ? '(없음)' : got, want: want === undefined ? '(없음)' : want}); };
const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
// 결정표 해석: 「%」 값은 소수 둘째 자리 반은 위로(화면 · 다른 셈과 같은 반올림 — 0.005 → 0.01 · −0.005 → −0.01)
const r2 = x => { const s = x >= 0 ? 1 : -1; return s * Math.floor(Math.abs(x) * 100 + 0.5 + 1e-9) / 100; };

const X = J('cond.json'), core = J('core.json'), mkt = J('mkt.json'), comp = J('comp.json').companies ?? {}, days = J('days.json');
const DATES = days.dates, N = DATES.length;
// ① 판 · 날
same(X.version, 'cd-v1', '판 이름');
same(X.schema, 'atlas-new-cond-1', '틀 이름');
same(core.asOf, mkt.asOf, 'core 날 = mkt 날');
same(DATES.at(-1), mkt.asOf, 'days 끝 = mkt 날');
same(X.asOf, mkt.asOf, 'cond 날');
same(X.d5, DATES[N - 6], '5거래일 전 날');
same(X.d20, DATES[N - 21], '20거래일 전 날');
same(X.provisional, !!core.provisional, '장 중 값인지');
const codes = Object.keys(mkt.companies).sort();
same(X.n, codes.length, '회사 수');
same(X.co?.c, codes, '회사 번호 차례');

// ② 업종 — core.industries 차례 그대로
const IND = core.industries.map(i => i.name), IX = new Map(IND.map((n, k) => [n, k]));
const RISE = new Set((core.rise?.list ?? []).map(x => x.name));
const c5 = v => (Array.isArray(v) && v.length >= 6 && v.at(-1) != null && v.at(-6) ? r2((v.at(-1) / v.at(-6) - 1) * 100) : null);
const ind = core.industries.map(i => { const d = i.tr?.d; return {n: i.name, w1: c5(i.v), wc1: c5(i.cw), rise: RISE.has(i.name) ? 1 : 0, up: d === 'up' ? 1 : 0, dn: d === 'down' ? 1 : 0, k: i.n}; });
// 결정표 v2 #4: 큰 회사가 오른 업종 = 「요즘 오르는 업종」과 같은 자(5거래일 · +0.05% 이상 · 많이 오른 순 · 같으면 이름 차례 · 11개까지)를 cw 선에 · cw 를 모르면 모름(null)
const rcTop = new Set(ind.filter(x => x.wc1 != null && x.wc1 >= 0.05).sort((a, b) => b.wc1 - a.wc1 || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)).slice(0, 11).map(x => x.n));
for (const x of ind) x.rc = x.wc1 == null ? null : rcTop.has(x.n) ? 1 : 0;
same(X.ind?.length, ind.length, '업종 수');
ind.forEach((w, k) => { const g = X.ind?.[k] ?? {}; for (const f of ['n', 'w1', 'wc1', 'rise', 'rc', 'up', 'dn', 'k']) same(g[f], w[f], `업종 ${w.n} ${f}`); });
// 결정표 해석: 「요즘 오르는 업종」 목록은 첫 화면 core.rise 를 그대로 믿지 않고 한 번 더 셈(같은 자를 v 선에) — 첫 화면 목록과 cond 가 같은 것을 봄
const riseRe = ind.filter(x => x.w1 != null && x.w1 >= 0.05).sort((a, b) => b.w1 - a.w1 || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)).slice(0, 11).map(x => x.n);
same(riseRe, (core.rise?.list ?? []).map(x => x.name), '요즘 오르는 업종 목록(다시 셈)');

// ③ 회사마다
const W = {c: [], i: [], cap: [], rk: [], r5: [], x5: [], q5: [], d15: [], m30: [], q20: [], f3: [], ls: [], p: [], l5: []};
for (const c of codes) {
  const m = mkt.companies[c], co = JSON.parse(fs.readFileSync(path.join(D, 'co', c + '.json'), 'utf8'));
  const cc = comp[c] ?? co.c ?? {}, cap = num(cc.cap);
  const k0 = co.k0 ?? 0, full = [...Array(k0).fill(null), ...(co.close ?? [])].concat(Array(N).fill(null)).slice(0, N);
  const jumps = new Set((co.jumps ?? []).map(x => x[0]));
  const a = full[N - 1], b = full[N - 6];
  let r5 = null, x5 = null, q5 = 0, l5 = null;
  if (a == null || b == null) q5 = 2; // 결정표 #7: 종가가 비면 ?
  else if (DATES.slice(-5).some(d => jumps.has(d))) { r5 = r2((a / b - 1) * 100); q5 = 1; } // 그 5거래일 안 하루 ±30.5% 넘게 바뀐 날(주식 수 바뀜일 수 있음) — % 는 보이되 넘음 · 빠짐은 모름
  else { r5 = r2((a / b - 1) * 100); x5 = a * 100 >= b * 110 ? 1 : 0; l5 = full.slice(-6).map(x => (x == null ? null : Math.floor(x * 1000 / b + 0.5))); } // 결정표 #6: 마지막 종가 × 100 ≥ 5거래일 전 × 110
  const w20 = full.slice(-21);
  let d15 = null, m30 = null, q20 = 0;
  if (w20.some(x => x == null)) q20 = 2;
  else if (DATES.slice(-20).some(d => jumps.has(d))) q20 = 1;
  else { d15 = w20.some((x, t) => t > 0 && x * 100 >= w20[t - 1] * 115) ? 1 : 0; m30 = w20[20] * 10 >= w20[0] * 13 ? 1 : 0; } // 결정표 #6 나: 하루 +15% · 20거래일 +30%
  const fin = co.fin ?? {}, net = fin.net ?? [], op = fin.op ?? [], isfin = co.key === 'net';
  const ok3 = xs => xs.length === 3 && xs.every(x => num(x) != null);
  const f3 = ok3(net) && (isfin || ok3(op)) ? (net.every(x => x > 0) && (isfin || op.every(x => x > 0)) ? 1 : 0) : null; // 결정표 #5 다: 확정 결산 3해 · 금융 밖은 영업이익도
  const ls = !net.length || num(net.at(-1)) == null ? null : net.at(-1) < 0 ? 1 : 0;
  W.c.push(c); W.i.push(IX.get(m.i) ?? null); W.cap.push(cap == null ? null : Math.round(cap)); W.rk.push(null); W.r5.push(r5); W.x5.push(x5); W.q5.push(q5);
  W.d15.push(d15); W.m30.push(m30); W.q20.push(q20); W.f3.push(f3); W.ls.push(ls); W.p.push(m.p ? 1 : 0); W.l5.push(l5);
}
// 결정표 #5 가: 업종 안 몸값 차례 — 큰 순 · 같으면 번호 작은 곳 · 그 업종에 몸값 모르는 곳이 하나라도 있으면 그 업종 모두 모름
const byInd = new Map(); W.c.forEach((c, j) => { const i = W.i[j]; if (!byInd.has(i)) byInd.set(i, []); byInd.get(i).push(j); });
for (const js of byInd.values()) { if (js.some(j => W.cap[j] == null)) continue; js.sort((x, y) => W.cap[y] - W.cap[x] || (W.c[x] < W.c[y] ? -1 : 1)).forEach((j, r) => { W.rk[j] = r + 1; }); }
for (const f of Object.keys(W)) {
  const g = X.co?.[f];
  if (!Array.isArray(g) || g.length !== W[f].length) { same(g?.length, W[f].length, `회사 칸 ${f} 길이`); continue; }
  for (let j = 0; j < W[f].length; j++) same(g[j], W[f][j], `${W.c[j]} ${f}`);
}

// ④ 짝 모두 — 화면 규칙(결정표 #2 · #3 · #7 · #9): 칸 차례대로 · 넘음만 다음 칸으로 · 모름은 그 칸 이름으로 ? 에 · 빠짐은 끝
const OPS = {a: ['big', 'rise', 'up', 'dn', 'all'], b: ['lead', 'top3', 'f3', 'pick', 'all'], c: ['nos', 'spike', 'loss', 'all']};
function test(S, k, op, j) {
  if (op === 'all') return true;
  const I = S.ind[S.co.i[j]], C = S.co;
  if (k === 'a') return op === 'big' ? (I.rc == null ? null : I.rc === 1) : op === 'rise' ? I.rise === 1 : op === 'up' ? I.up === 1 : I.dn === 1;
  if (k === 'b') { if (op === 'pick') return C.p[j] === 1; if (op === 'f3') return C.f3[j] == null ? null : C.f3[j] === 1; return C.rk[j] == null ? null : op === 'lead' ? C.rk[j] === 1 : C.rk[j] <= 3; }
  if (op === 'nos') return C.x5[j] == null ? null : C.x5[j] === 0;
  if (op === 'spike') { const f = [C.x5[j], C.d15[j], C.m30[j]]; if (f.includes(1)) return false; return f.includes(null) ? null : true; } // 결정표 해석: 셋 가운데 하나라도 넘었으면 모름이 있어도 빠짐
  return C.ls[j] == null ? null : C.ls[j] === 0;
}
function run(S, st) {
  let cur = S.co.c.map((_, j) => j); const steps = [cur.length], q = [];
  for (const k of ['a', 'b', 'c']) { const nx = []; for (const j of cur) { const v = test(S, k, st[k], j); if (v === true) nx.push(j); else if (v == null) q.push([S.co.c[j], k]); } cur = nx; steps.push(cur.length); }
  cur.sort((x, y) => (S.co.cap[y] ?? -1) - (S.co.cap[x] ?? -1) || (S.co.c[x] < S.co.c[y] ? -1 : 1));
  return {steps, res: cur.map(j => S.co.c[j]), q: q.sort((x, y) => (x[0] < y[0] ? -1 : 1))};
}
const mine = {ind, co: W}, combos = [];
for (const a of OPS.a) for (const b of OPS.b) for (const c of OPS.c) {
  const st = {a, b, c}, R1 = run(mine, st), R2 = run(X, st);
  same(R2, R1, `짝 ${a}-${b}-${c}`);
  combos.push({k: `${a}-${b}-${c}`, steps: R1.steps, n: R1.res.length, q: R1.q.length});
}
const def = combos.find(x => x.k === 'big-lead-nos');
const res = {schema: 'atlas-new-cond-verify-1', made: new Date().toISOString(), version: X.version, asOf: X.asOf, n: codes.length, checks, fails: bad.length, bad: bad.slice(0, 40),
  default: def, empty: combos.filter(x => x.n === 0).map(x => x.k), combos: combos.length,
  who: '2026-10-16 일꾼 사용 한도 — cond.py 를 쓴 Claude 가 결정표만 보고 노드로 씀(다른 일꾼 아님)'};
fs.mkdirSync(path.dirname(OUT), {recursive: true}); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
console.log(`조건 찾기 따로 세기: 회사 ${codes.length} · 짝 ${combos.length} · 맞댐 ${checks} · 틀림 ${bad.length} · 기본 ${def ? def.steps.join(' → ') : '-'}`);
if (bad.length) { for (const x of bad.slice(0, 12)) console.log('  틀림', JSON.stringify(x).slice(0, 300)); process.exit(1); }

// 고도리 칸 셈 gdr-v2 시험(작은 가짜 자료 · 결정표 docs/design/godori-2026-10-18/gdr-v2.md)
//   node --test tests/atlas11/gdr-pick2.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadData, selectOn, sellOf, mcOf, fall3Of, buildPublic, buildGates, selfCheck, RULES2, TH, VERSION} from '../../scripts/atlas11/next/gdr/pick2.mjs';
import {tickOf, floorTick, mulberry32} from '../../scripts/atlas11/next/gdr/v2/num.mjs';
import {screenHits} from '../../site/next/words.js';

/* ---------- 가짜 자료 ---------- */
const DAYS = (() => { const out = []; const d = new Date(Date.UTC(2024, 0, 2)); while (out.length < 330) { const w = d.getUTCDay(); if (w && w < 6) out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); } return out; })();
const K = DAYS.length - 1; // 마지막 날 자리(2025-04 쯤)
const ymd = s => s.replace(/-/g, '');
/** 해마다 결산 글(네이버 꼴) — fy = [[key, 매출, 영업이익, 순이익, EPS, BPS]] + 예상 한 열 */
function finText(fy, est = ['202512', 999999, 999999, 999999, 99999, 99999]) {
  const all = [...fy, est], cols = f => Object.fromEntries(all.map(r => [r[0], {value: r[f] === null ? '-' : Number(r[f]).toLocaleString('en-US')}]));
  return JSON.stringify({financeInfo: {trTitleList: all.map((r, i) => ({isConsensus: i === all.length - 1 ? 'Y' : 'N', title: r[0].slice(0, 4) + '.' + r[0].slice(4) + '.', key: r[0]})),
    rowList: [['매출액', 1], ['영업이익', 2], ['당기순이익', 3], ['EPS', 4], ['BPS', 5]].map(([title, f]) => ({title, columns: cols(f)}))}});
}
/** 회사 하나 — px(d) 종가 · vol(d) 거래량 */
function stock(px, vol, fy, extra = {}) {
  return {list: {listValue: 5000}, integration: {text: JSON.stringify({totalInfos: [{code: 'eps', value: '1,000원', valueDesc: '2024.09.'}, {code: 'bps', value: '8,000원', valueDesc: '2024.09.'}]})},
    finance: {text: finText(fy)}, fchart: {rows: DAYS.map((d, i) => [ymd(d), px(i), px(i), px(i), px(i), vol(i)]).filter(r => r[4] !== null)}, ...extra};
}
/** 오르는 길(하루 g · 잡음 ±amp · 씨앗) — 정수 종가 */
function path0(seed, g = 0.002, amp = 0.004, base = 10000, hook = null) {
  const rnd = mulberry32(seed), out = []; let p = base;
  for (let i = 0; i < DAYS.length; i++) { if (i) p *= 1 + g + (rnd() * 2 - 1) * amp; if (hook) p = hook(i, p); out.push(Math.round(p)); }
  return i => out[i];
}
const volUp = i => (i > K - 20 ? 260000 : 200000); // 마지막 한 달 거래 +30%(업종 거래 1.1배 넘게 · 2배는 안 넘게)
const FY_GOOD = g => [['202112', 1000, 100, 80, 500, 7000], ['202212', 1100, 110, 90, 520, 7200], ['202312', 1200, 110 + g, 95, 540, 7400]];
const noiseShared = path0(77); // 같이 움직이는 짝(A1 · A3)

function makeSite(dir, companies, groups) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'mkt.json'), JSON.stringify({asOf: DAYS[K], companies}));
  fs.writeFileSync(path.join(dir, 'core.json'), JSON.stringify({groups}));
}
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdr2-'));
  const C = {}, S = {};
  const add = (code, ind, st) => { C[code] = {n: '회사' + code, i: ind}; S[code] = st; };
  // 업종 A(큰 업종 「가」): A1 · A3 같이 움직임 · A2 따로 · A4 셋째
  add('000010', 'A', stock(noiseShared, volUp, FY_GOOD(90)));
  add('000020', 'A', stock(path0(11), volUp, FY_GOOD(30)));
  add('000030', 'A', stock(i => noiseShared(i) + 1, volUp, FY_GOOD(60))); // A1 과 거의 같은 길
  add('000040', 'A', stock(path0(12), volUp, FY_GOOD(20)));
  // 큰 업종 「나」: 업종 B · C · D · E 마다 한 곳(비중 3씩 → 넷째는 위 끝 9 에 걸림)
  ['B', 'C', 'D', 'E'].forEach((ind, j) => add('00010' + j, ind, stock(path0(21 + j), volUp, FY_GOOD(80 - j * 10))));
  // 거래 적음(하루 5억)
  add('000200', 'F', stock(path0(31), () => 50000, FY_GOOD(50)));
  // 적자 해(2022 순이익 < 0)
  add('000210', 'F', stock(path0(32), volUp, [['202112', 1000, 100, 80, 500, 7000], ['202212', 1100, 110, -5, 520, 7200], ['202312', 1200, 150, 95, 540, 7400]]));
  // 한 달 오름이 너무 큼(마지막 20날 +40%)
  add('000220', 'F', stock(path0(33, 0.0005, 0.002, 10000, (i, p) => (i > K - 20 ? p * 1.017 : p)), volUp, FY_GOOD(50)));
  // 석 달 안 깊은 빠짐(−30% 뒤 회복)
  add('000230', 'F', stock(path0(34, 0.004, 0.002, 10000, (i, p) => (i === K - 40 ? p * 0.7 : p)), volUp, FY_GOOD(50)));
  makeSite(dir, C, [{name: '가', inds: ['A']}, {name: '나', inds: ['B', 'C', 'D', 'E']}, {name: '다', inds: ['F']}]);
  return {dir, bundle: {collectedAt: 'test', stocks: S}};
}
const FX = fixture();
const load = (extra = {}) => loadData({bundle: FX.bundle, site: FX.dir, ...extra});

/* ---------- 시험 ---------- */
test('① 달력 · 자료 · 판 이름', () => {
  const d = load();
  assert.equal(d.D, DAYS.length); assert.equal(d.days[K], DAYS[K]); assert.equal(VERSION, 'gdr-v2');
  // 예상 열(isConsensus Y)은 읽지 않음
  assert.ok(d.fy.every(f => f.every(r => r.key !== '202512')));
});

test('② 지난 성적 꼴 — 문 · 업종 1곳(둘째는 상관 < 0.5) · 큰 업종 위 끝 9 · 비중 · 현금', () => {
  const S = selectOn(load(), K, {backtest: true});
  assert.equal(S.status.lists, 'skipped'); assert.equal(S.status.quarters, 'annual');
  const codes = S.picks.map(p => p.code);
  // 차례 = 영업이익 늘어난 비율: A1(90) > B(80) > A3(60 · A1 과 같이 움직여 뺌) > C(70)… — 비율 큰 차례로
  assert.ok(codes.includes('000010'), 'A1 고름');
  assert.ok(!codes.includes('000030'), 'A3 = A1 과 같이 움직여 뺌');
  assert.ok(codes.includes('000020'), 'A2 = 따로 움직여 둘째로 고름');
  assert.ok(!codes.includes('000040'), 'A4 = 셋째라 뺌');
  const big = S.picks.filter(p => p.big === '나');
  assert.equal(big.length, 3, '큰 업종 「나」는 3곳(비중 3 × 3 = 9)까지');
  assert.ok(S.counts.cutBig >= 1 && S.counts.cutInd >= 2);
  for (const c of ['000200', '000210', '000220', '000230']) assert.ok(!codes.includes(c), c + ' 은 문에서 빠짐');
  const w = S.picks.reduce((s, p) => s + p.w, 0);
  assert.equal(Math.round((w + S.cash) * 10), 1000); assert.ok(S.picks.every(p => p.w === 3));
  assert.equal(S.counts.why, null);
});

test('③ 문마다 빠진 까닭(gates 세 값)', () => {
  const d = load(), S = selectOn(d, K, {backtest: true, detail: true}), row = c => S.rows[d.codes.indexOf(c)];
  assert.equal(row('000200').x, 1, '거래 적음');
  assert.equal(row('000210').g[0], 0, '적자 해 → 이익 문 0');
  assert.equal(row('000220').g[1], 0, '한 달 오름 위 끝 → 조용함 문 0');
  assert.equal(row('000230').g[2], 0, '석 달 깊은 빠짐 → 천천히 문 0');
});

test('④ 사이트 꼴 — 목록 · 분기가 없으면 「?」 · 고른 곳 0', () => {
  const S = selectOn(load(), K, {});
  assert.equal(S.picks.length, 0); assert.equal(S.cash, 100);
  assert.equal(S.counts.why, 'lists,quarters');
  assert.ok(S.rows.filter(r => r.x === 0).every(r => r.l === null && r.g[0] !== 1 && !r.v.ttm), '목록 「?」 · 4분기 합 못 셈');
});

test('⑤ 목록 · 분기를 받으면 — 목록에 든 곳은 x 3 · 분기 4분기 합(5분기 이어짐)', () => {
  const qs = {}, mk = (op, sales) => ['202309', '202312', '202403', '202406', '202409'].map((key, i) => ({key, sales: sales + i * 10, op: op + i * 5, net: 10}));
  for (const c of ['000010', '000020', '000030', '000040', '000100', '000101', '000102', '000103']) qs[c] = mk(50, 500);
  qs['000020'] = [...mk(50, 500)].filter(r => r.key !== '202403'); // 이어지지 않음 → 「?」
  const lists = {lists: {managed: [], warning: ['000101'], danger: [], halted: []}, dart: {ok: true, cb: [], rights: []}};
  const d = load({quarters: {co: qs}, lists}), S = selectOn(d, K, {}), row = c => S.rows[d.codes.indexOf(c)];
  assert.equal(S.status.lists, 'ok'); assert.equal(S.status.quarters, 'ok');
  assert.equal(row('000101').x, 3); assert.equal(row('000101').l, 0);
  assert.equal(row('000020').g[0], null, '분기가 이어지지 않으면 이익 문 「?」');
  assert.equal(row('000010').v.ttm.src, 'q');
  assert.deepEqual(row('000010').v.ttm.now, {op: 55 + 60 + 65 + 70, sales: 510 + 520 + 530 + 540});
  assert.ok(S.picks.length > 0 && !S.picks.some(p => p.code === '000101'));
  // 2024-09 분기는 12월 1일부터 — 그 앞 날은 안 씀
  const kNov = d.days.findIndex(x => x >= '2024-11-01'), r2 = selectOn(d, kNov, {}).rows[d.codes.indexOf('000010')];
  assert.equal(r2.g[0], null, '11월에는 2024-09 분기를 못 써 다섯 분기가 안 됨');
});

test('⑥ 흔들기 · 가까스로 · 왜(사이트 파일) · 공개 파일에 팔 선 없음 · 금지 말 0', () => {
  const lists = {lists: {managed: [], warning: [], danger: [], halted: []}, dart: {ok: true, cb: [], rights: []}};
  const qs = {}; for (const c of Object.keys(FX.bundle.stocks)) qs[c] = ['202309', '202312', '202403', '202406', '202409'].map((key, i) => ({key, sales: 500 + i * 10, op: 50 + i * 5 + (c === '000010' ? i : 0), net: 10}));
  const d = load({quarters: {co: qs}, lists}), S = selectOn(d, K, {});
  assert.ok(S.picks.length > 0);
  assert.equal(S.sens.length, TH.length);
  for (const s of S.sens) { assert.equal(s.sens.length, 3); const base = s.sens[1].n; assert.ok(s.sens[0].n <= base && base <= s.sens[2].n, s.key + ' 빡빡하면 줄고 느슨하면 늚'); }
  const txt = buildPublic(d, S, {}), O = JSON.parse(txt), G = buildGates(d, S);
  assert.deepEqual(selfCheck(d, S, {out: txt, gates: G}), []);
  for (const r of O.rules) assert.ok(typeof r.why === 'string' && r.why.length > 5, r.key + ' 왜');
  for (const k of ['sell', 'half', 'base', 'amount']) assert.ok(!txt.includes(`"${k}"`), k);
  for (const w of ['담겠어', '팔겠어']) assert.ok(!txt.includes(w));
  const screen = [...O.rules.flatMap(r => [r.name, r.why]), ...O.picks.flatMap(p => [p.reason, p.wrong, p.mc?.in]), O.sensNote, ...O.note].filter(Boolean);
  for (const s of screen) assert.deepEqual(screenHits(s), [], s);
  for (const p of O.picks) { assert.ok(Array.isArray(p.near)); assert.match(p.reason, /업종 거래 [\d.]+배$/); assert.ok(p.card && 'per' in p.card && 'trade' in p.card); }
  const gj = JSON.parse(G); assert.deepEqual(gj.keys, ['x', 'g1', 'g2', 'g3', 'g4', 'g5', 'l']);
  for (const p of O.picks) assert.equal(gj.co[p.code][0], 0);
});

test('⑦ 호가 단위 · 팔 선 · 닿은 수(손셈과 같음)', () => {
  assert.deepEqual([1999, 2000, 4999, 5000, 19999, 20000, 49999, 50000, 199999, 200000, 499999, 500000].map(tickOf), [1, 5, 5, 10, 10, 50, 50, 100, 100, 500, 500, 1000]);
  assert.equal(floorTick(4998.7), 4995); assert.equal(floorTick(5000.3), 5000); assert.equal(floorTick(199999), 199900); assert.equal(floorTick(1234.9), 1234);
  const d = load(), n = d.codes.indexOf('000010'), s = sellOf(d, n, K);
  // 손셈: 지난 250날 로그 오름 표준편차 → 비 → 닿은 수
  const c = i => d.close[n * d.D + i], r = []; for (let i = K - 249; i <= K; i++) r.push(Math.log(c(i) / c(i - 1)));
  const m = r.reduce((a, b) => a + b, 0) / r.length, sd = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (r.length - 1)), ratio = Math.exp(-1.5 * sd * Math.sqrt(20));
  let T = 0, N = 0; for (let st = K - 250; st <= K - 20; st++) { N++; let hit = false; for (let j = st + 1; j <= st + 20; j++) if (c(j) <= c(st) * ratio) hit = true; if (hit) T++; }
  assert.equal(s.line, floorTick(c(K) * ratio)); assert.equal(s.touch.N, N); assert.equal(s.touch.T, T); assert.equal(s.touch.n, Math.floor((20 * T + N) / (2 * N)));
  assert.equal(s.basis, '종가');
});

test('⑧ 몬테카를로 — 같은 입력 같은 값 · 0 ≤ lo ≤ hi ≤ 10 · 자료가 모자라면 null', () => {
  const d = load(), n = d.codes.indexOf('000010'), a = mcOf(d, n, K), b = mcOf(d, n, K);
  assert.deepEqual(a, b); assert.ok(Number.isInteger(a.lo) && Number.isInteger(a.hi) && a.lo >= 0 && a.lo <= a.hi && a.hi <= 10);
  assert.equal(a.counts.length, 4);
  assert.equal(mcOf(d, n, 100), null, '250날이 안 되면 null');
});

test('⑨ 세 곳이 함께 내린 날', () => {
  const d = load(), ns = ['000010', '000020', '000100'].map(c => d.codes.indexOf(c));
  const f = fall3Of(d, ns, K), c = (n, i) => d.close[n * d.D + i];
  let want = 0; for (let i = K - 249; i <= K; i++) if (ns.filter(n => 100 * c(n, i) <= 97 * c(n, i - 1)).length >= 3) want++;
  assert.equal(f.n, want); assert.equal(fall3Of(d, ns.slice(0, 2), K).n, null);
});

test('⑩ 그날 알 수 있던 것만 — 뒤 줄 · 못 쓰는 결산을 망가뜨려도 같은 답', () => {
  const full = load();
  for (const k of [260, 290, K - 5]) {
    const day = DAYS[k], cut = JSON.parse(JSON.stringify(FX.bundle));
    for (const s of Object.values(cut.stocks)) {
      s.fchart.rows = s.fchart.rows.filter(r => r[0] <= ymd(day));
      const j = JSON.parse(s.finance.text);
      for (const t of j.financeInfo.trTitleList) { const y = +t.key.slice(0, 4), m = +t.key.slice(4) + 4, from = `${m > 12 ? y + 1 : y}-${String(m > 12 ? m - 12 : m).padStart(2, '0')}-01`; if (t.isConsensus === 'Y' || from > day) for (const r of j.financeInfo.rowList) r.columns[t.key] = {value: '-999,999'}; }
      s.finance.text = JSON.stringify(j);
    }
    // 잘린 자료의 달력은 k 까지 — 같은 날 자리로 부름
    const part = loadData({bundle: cut, site: FX.dir}), a = selectOn(full, k, {backtest: true}), b = selectOn(part, k, {backtest: true});
    assert.equal(part.days[k], day);
    assert.deepEqual(b.picks, a.picks, day); assert.equal(b.cash, a.cash); assert.deepEqual(b.counts, a.counts);
  }
});

test('⑪ 3해가 안 되는 날은 years · 지난 성적 한 번 부름 빠르기', () => {
  const d = load(), k = d.days.findIndex(x => x >= '2024-03-01');
  const S = selectOn(d, k, {backtest: true});
  assert.equal(S.picks.length, 0); assert.equal(S.counts.why, 'years');
  const t0 = performance.now(); for (let i = 0; i < 20; i++) selectOn(d, K - i, {backtest: true}); assert.ok((performance.now() - t0) / 20 < 50);
});

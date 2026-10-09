// 소거 1판 elim-rules-1 — lib/atlas11/elim.mjs(회사마다 통과 · 보류 · 제외와 다시 보는 때 · 순수 함수)
// 사장님 2026-10-10 05:14(마카오) 승인 「… 6은 너가 가장 현명하게 해라 …」 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 2
//   판정 갈래마다 하나씩 · 모으기(out > hold > pass · na 는 넣지 않음) · first(차례상 처음 hold · out) · 금지 말 없음 · 입력을 고치지 않음
import test from 'node:test';
import assert from 'node:assert/strict';
import {elimOf, ELIM_RULES, ELIM_ORDER, ELIM_SCHEMA} from '../../lib/atlas11/elim.mjs';
import {RISK_UNKNOWN} from '../../lib/atlas11/cand.mjs';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';
import {BANNED} from '../../lib/atlas11/changelog.mjs';

const ASOF = '2026-10-08', AT = '2026-10-10T06:30:00+09:00', CUT = '2026-10-08T15:30:00+09:00';
const fundOk = {fy: '2025.12', roe: 10, op: 100, net: 80, cap: 1000};
const stock = (code, o = {}) => ({code, name: '회사' + code, status: 'ok', date: ASOF, close: 1000, lag: 0, jumps: [], cas: [], fund: fundOk, ...o});
// grow.m = [오늘 1년 추세, 20거래일 전 1년 추세](후보 셈 그대로) — 따로 안 주면 flags 넷째 글자가 1인 회사는 둘 다 셀 수 있다고 둠
const candWith = (flags, o = {}) => ({ready: true, window: {days: 30, from: '2026-09-08', to: ASOF, cutoff: CUT}, flags, items: [],
  grow: {m: Object.fromEntries(Object.entries(flags).map(([c, f]) => [c, typeof f === 'string' && f[3] === '1' ? [0.5, 0.4] : [null, null]]))}, ...o});
const disc = (title, publishedAt) => ({id: title + publishedAt, title, publishedAt, level: 2});
const agendaOf = map => Object.fromEntries(Object.entries(map).map(([code, ds]) => [code, {name: '회사' + code, sector: null, upcoming: [], disclosures: ds, disclosureDays: 30, missing: []}]));
const mcRow = (code, o = {}) => ({code, n: 20000, nBase: 20000, nExtra: 0, nonfinite: 0, extreme: 0, mean: 0.01, median: 0, ploss: 0.5, q05: -0.25, q10: -0.2, q90: 0.3, cvar5: -0.3,
  se: {mean: 0.002, ploss: 0.003, q05: 0.0025, cvar5: 0.0029}, ...o});
const mcWith = rows => ({asOf: ASOF, runId: '20261010-hand-00000000', rows});
/** 한 회사만 판정 — 안 준 칸은 깨끗한 값(그날 종가 · 흑자 · 공시 없음 · 1년 추세 셈 · 경로 2만 개) */
function one({s = stock('A'), place = 'kr', flags = '111111', cand, agenda, mc, calibrated = false} = {}) {
  return elimOf({place, asOf: ASOF, at: AT, stocks: [s], cand: cand === undefined ? candWith({[s.code]: flags}) : cand,
    agendaByCode: agenda === undefined ? agendaOf({[s.code]: []}) : agenda, mc: mc === undefined ? mcWith([mcRow(s.code)]) : mc, calibrated});
}
const ck = (e, id, i = 0) => e.rows[i].checks.find(c => c.id === id);
const verdicts = (e, i = 0) => Object.fromEntries(e.rows[i].checks.map(c => [c.id, c.verdict]));

test('규칙 · 모양 — elim-rules-1 · 문턱 · 검사 차례 고정(1단 일곱 · 2단 셋) · 칸 이름이 계획 그대로', () => {
  assert.equal(ELIM_RULES.id, 'elim-rules-1'); assert.equal(typeof ELIM_RULES.label, 'string'); assert.ok(ELIM_RULES.label.length > 0);
  assert.deepEqual({...ELIM_RULES.thresholds}, {minPaths: 20000, maxSe: 0.005, tail: -0.5, historyDays: 272, windowDays: 30});
  assert.ok(Object.isFrozen(ELIM_RULES) && Object.isFrozen(ELIM_RULES.thresholds) && Object.isFrozen(ELIM_ORDER));
  assert.deepEqual([...ELIM_ORDER], ['close', 'stale', 'ca', 'history', 'liquidity', 'profit', 'risk', 'paths', 'converge', 'tail']);
  const e = one();
  assert.deepEqual(Object.keys(e), ['schema', 'rules', 'at', 'place', 'asOf', 'calibrated', 'counts', 'rows']);
  assert.equal(e.schema, 'atlas11-elim-1'); assert.equal(ELIM_SCHEMA, 'atlas11-elim-1'); assert.equal(e.rules, 'elim-rules-1');
  assert.equal(e.at, AT); assert.equal(e.place, 'kr'); assert.equal(e.asOf, ASOF); assert.equal(e.calibrated, false);
  assert.deepEqual(Object.keys(e.counts), ['pass', 'hold', 'out']);
  const r = e.rows[0];
  assert.deepEqual(Object.keys(r), ['code', 'name', 'state', 'first', 'flags', 'checks']); assert.equal(r.code, 'A'); assert.equal(r.name, '회사A');
  assert.deepEqual(r.checks.map(c => c.id), [...ELIM_ORDER]);
  assert.deepEqual(r.checks.map(c => c.stage), [1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
  assert.deepEqual(r.checks.map(c => c.label), ['마감 가격', '오래된 가격', '기업행사', '분석 입력', '거래 가능성', '흑자', '위험 공시', '경로 수', '수렴', '하락 위험']);
  for (const c of r.checks) {
    assert.deepEqual(Object.keys(c), ['id', 'stage', 'label', 'data', 'value', 'verdict', 'recheck'], c.id);
    for (const k of ['data', 'value', 'recheck']) assert.ok(typeof c[k] === 'string' && c[k].length > 0, `${c.id}.${k}`);
    assert.ok(['pass', 'hold', 'out', 'na'].includes(c.verdict), c.id);
  }
});

test('깨끗한 회사 — 모두 통과(거래 가능성 · 하락 위험은 na) → pass · first null · flags 빔 · counts', () => {
  const e = one();
  assert.deepEqual(verdicts(e), {close: 'pass', stale: 'pass', ca: 'pass', history: 'pass', liquidity: 'na', profit: 'pass', risk: 'pass', paths: 'pass', converge: 'pass', tail: 'na'});
  assert.equal(e.rows[0].state, 'pass'); assert.equal(e.rows[0].first, null); assert.deepEqual(e.rows[0].flags, []);
  assert.deepEqual(e.counts, {pass: 1, hold: 0, out: 0});
  assert.match(ck(e, 'close').value, /10월 8일/); assert.match(ck(e, 'close').value, /1,000/);
  assert.match(ck(e, 'profit').value, /영업이익 흑자 · 순이익 흑자\(2025년 12월 결산\)/);
  assert.match(ck(e, 'paths').value, /20,000개/);
});

test('마감 가격 · 오래된 가격 — 그날 종가 통과 · late 는 마감 가격 보류 · stale 은 오래된 가격 보류(마감 가격은 na) · 값 없음 보류', () => {
  const late = one({s: stock('A', {status: 'late', date: '2026-10-07', close: 990, lag: 1}), flags: '011000'});
  assert.equal(ck(late, 'close').verdict, 'hold'); assert.equal(ck(late, 'close').recheck, '다음 회차에 확정 가격이 오면'); assert.match(ck(late, 'close').value, /10월 7일/);
  assert.equal(ck(late, 'stale').verdict, 'pass'); assert.equal(late.rows[0].first, 'close'); assert.equal(late.rows[0].state, 'hold');
  const stale = one({s: stock('A', {status: 'stale', date: '2026-09-30', close: 900, lag: 5}), flags: '011000'});
  assert.equal(ck(stale, 'close').verdict, 'na', '오래된 가격 칸이 맡음 — first 가 「오래된 가격」이 되게');
  assert.equal(ck(stale, 'stale').verdict, 'hold'); assert.equal(ck(stale, 'stale').recheck, '거래 재개 뒤 5거래일');
  assert.match(ck(stale, 'stale').value, /9월 30일/); assert.match(ck(stale, 'stale').value, /5거래일/);
  assert.equal(stale.rows[0].first, 'stale'); assert.equal(stale.rows[0].state, 'hold');
  const old = one({s: stock('A', {status: 'stale', date: '2025-12-01', close: 900, lag: 200}), flags: '011000'});
  assert.match(ck(old, 'stale').value, /2025년 12월 1일/, '해가 다르면 해를 적음');
  const miss = one({s: stock('A', {status: 'missing', date: null, close: null, lag: null}), flags: '010000'});
  assert.equal(ck(miss, 'close').verdict, 'hold'); assert.equal(ck(miss, 'stale').verdict, 'na'); assert.equal(miss.rows[0].first, 'close');
  const odd = one({s: stock('A', {status: 'ok', date: '2026-10-07'})});
  assert.equal(ck(odd, 'close').verdict, 'hold', '상태가 ok 라도 기준일 종가가 아니면 통과시키지 않음');
  const noClose = one({s: stock('A', {close: null})});
  assert.equal(ck(noClose, 'close').verdict, 'hold', '종가 값이 없으면 보류');
});

test('기업행사 — 한국: 20거래일 안 하루 ±30% 넘은 날(jumps 또는 status ca) → 보류 · 공시 낱말만 있으면 통과 · 미국은 셈 안 함(na)', () => {
  const ca = one({s: stock('A', {status: 'ca', jumps: ['2026-09-14']})});
  assert.equal(ck(ca, 'close').verdict, 'pass'); assert.equal(ck(ca, 'ca').verdict, 'hold'); assert.match(ck(ca, 'ca').value, /9월 14일/);
  assert.equal(ca.rows[0].first, 'ca'); assert.equal(ca.rows[0].state, 'hold');
  const lateJump = one({s: stock('A', {status: 'late', date: '2026-10-07', lag: 1, jumps: ['2026-10-02']}), flags: '011000'});
  assert.equal(ck(lateJump, 'ca').verdict, 'hold', '늦은 회사도 jumps 가 있으면 보류'); assert.equal(lateJump.rows[0].first, 'close');
  assert.equal(ck(one({s: stock('A', {status: 'ca', jumps: []})}), 'ca').verdict, 'hold', 'status ca 만 있어도 보류');
  const word = one({s: stock('A', {cas: ['무상증자']})});
  assert.equal(ck(word, 'ca').verdict, 'pass'); assert.match(ck(word, 'ca').value, /무상증자/);
  const us = one({s: stock('A', {jumps: ['2026-09-14']}), place: 'us'});
  assert.equal(ck(us, 'ca').verdict, 'na', '미국은 하루 가격 제한이 없어 ±30% 셈을 하지 않음'); assert.match(ck(us, 'ca').value, /미국 판은 하루 가격 제한이 없어/);
  assert.equal(ck(one({place: 'cn'}), 'ca').value, '이 판은 ±30% 셈을 하지 않음', '다른 판에는 제한이 없다고 쓰지 않음');
});

test('분석 입력 — flags[3] 이 1 이면 통과 · 0 이면 보류 · 후보 셈이 없거나 그 회사 flags 가 없으면 보류', () => {
  assert.equal(ck(one({flags: '111111'}), 'history').verdict, 'pass');
  const h = one({flags: '111011'});
  assert.equal(ck(h, 'history').verdict, 'hold'); assert.match(ck(h, 'history').recheck, /272거래일/); assert.equal(h.rows[0].first, 'history');
  assert.equal(ck(one({cand: {ready: false, window: {days: 30, from: '2026-09-08', to: ASOF, cutoff: CUT}, items: []}}), 'history').verdict, 'hold');
  assert.equal(ck(one({cand: null}), 'history').verdict, 'hold');
  assert.equal(ck(one({cand: candWith({B: '111111'})}), 'history').verdict, 'hold', '그 회사 flags 가 없음');
  assert.equal(ck(one({flags: '111'}), 'history').verdict, 'hold', '모양이 틀린 flags');
  // 까닭 글 — 그날 종가가 없으면 기록 길이 탓이 아님(늦음 · 오래된 가격 · 자료 없음은 그 조건으로 다시 봄)
  const late = ck(one({s: stock('A', {status: 'late', date: '2026-10-07', lag: 1}), flags: '011000'}), 'history');
  assert.equal(late.verdict, 'hold'); assert.match(late.value, /그날 종가/); assert.equal(late.recheck, '다음 회차에 확정 가격이 오면');
  assert.equal(ck(one({s: stock('A', {status: 'stale', date: '2026-09-30', lag: 5}), flags: '011000'}), 'history').recheck, '거래 재개 뒤 5거래일');
  assert.equal(ck(one({s: stock('A', {status: 'missing', date: null, close: null, lag: null}), flags: '010000'}), 'history').recheck, '가격 자료가 들어오면 다시 봄');
  assert.match(ck(one({flags: '111011'}), 'history').value, /1년 종가 기록이 모자라거나/);
  // 오늘 1년 추세는 셀 수 있어도 20거래일 전 것을 못 세면 보류(새로 든 초입을 잘못 세지 않게)
  const noPrev = one({cand: candWith({A: '111111'}, {grow: {m: {A: [0.5, null]}}})});
  assert.equal(ck(noPrev, 'history').verdict, 'hold'); assert.match(ck(noPrev, 'history').value, /20거래일 전 1년 추세/); assert.equal(noPrev.rows[0].first, 'history');
});

test('거래 가능성 — 늘 na(20거래일 거래대금 자료 없음 — 수집 먼저) · 판정에 넣지 않음', () => {
  for (const place of ['kr', 'us']) {
    const e = one({place});
    assert.equal(ck(e, 'liquidity').verdict, 'na'); assert.equal(ck(e, 'liquidity').value, '20거래일 거래대금 자료 없음 — 수집 먼저');
  }
  assert.equal(one().rows[0].state, 'pass', 'na 는 모으기에 넣지 않음');
});

test('흑자 — 둘 다 흑자면 통과 · 둘 다 숫자인데 아니면 제외 · 하나라도 없으면 보류(미국 은행 8곳 — 옛 탈락을 보류로)', () => {
  const op = one({s: stock('A', {fund: {...fundOk, op: -5}})});
  assert.equal(ck(op, 'profit').verdict, 'out'); assert.match(ck(op, 'profit').value, /영업이익 적자 · 순이익 흑자\(2025년 12월 결산\)/);
  assert.equal(op.rows[0].state, 'out'); assert.equal(op.rows[0].first, 'profit');
  assert.equal(ck(one({s: stock('A', {fund: {...fundOk, net: -1}})}), 'profit').verdict, 'out');
  assert.equal(ck(one({s: stock('A', {fund: {...fundOk, net: 0}})}), 'profit').verdict, 'out', '0 은 흑자가 아님');
  const noOp = one({s: stock('A', {fund: {...fundOk, op: null}})});
  assert.equal(ck(noOp, 'profit').verdict, 'hold'); assert.match(ck(noOp, 'profit').value, /영업이익/); assert.equal(noOp.rows[0].first, 'profit');
  assert.equal(ck(one({s: stock('A', {fund: {...fundOk, net: Number.NaN}})}), 'profit').verdict, 'hold');
  assert.equal(ck(one({s: stock('A', {fund: null})}), 'profit').verdict, 'hold');
  const bank = one({s: stock('BAC', {name: '뱅크오브아메리카', fund: {fy: '2025.12', op: null, net: 27132000, cap: null}}), place: 'us'});
  assert.equal(ck(bank, 'profit').verdict, 'hold'); assert.equal(bank.rows[0].state, 'hold');
});

test('위험 공시(한국) — 30일 안 · 장 마감 전 · 이 회사 공시가 EXCLUDE_RE → 제외(제목 · 날짜) · 마감 뒤 · 30일 밖 · 우선주 · 다른 공시는 통과 · 공시 목록 없으면 보류', () => {
  const risky = d => one({agenda: agendaOf({A: [d]})});
  const out = risky(disc('투자경고종목지정', '2026-10-01T06:52:23+09:00'));
  assert.equal(ck(out, 'risk').verdict, 'out'); assert.match(ck(out, 'risk').value, /10월 1일/); assert.match(ck(out, 'risk').value, /투자경고종목지정/);
  assert.equal(ck(out, 'risk').recheck, '해제 공시 확인'); assert.equal(out.rows[0].state, 'out'); assert.equal(out.rows[0].first, 'risk');
  assert.equal(ck(risky(disc('관리종목 지정', CUT)), 'risk').verdict, 'out', '마감 시각 그대로(15:30)는 마감 전');
  const after = risky(disc('관리종목 지정', '2026-10-08T15:31:00+09:00'));
  assert.equal(ck(after, 'risk').verdict, 'pass', '마감 뒤 공시는 다음 판에서 셈'); assert.match(ck(after, 'risk').value, /장 마감 뒤/);
  assert.equal(ck(risky(disc('상장폐지 결정', '2026-09-08T09:00:00+09:00')), 'risk').verdict, 'out', '30일 첫날(9월 8일)은 안');
  assert.equal(ck(risky(disc('상장폐지 결정', '2026-09-07T09:00:00+09:00')), 'risk').verdict, 'pass', '30일 밖(9월 7일)');
  const pref = risky(disc('투자경고종목 지정(회사A우)', '2026-10-01T06:52:23+09:00'));
  assert.equal(ck(pref, 'risk').verdict, 'pass', '우선주 공시는 이 회사(보통주) 것이 아님'); assert.match(ck(pref, 'risk').value, /우선주/);
  assert.equal(ck(risky(disc('투자경고종목 지정예고', '2026-10-01T06:52:23+09:00')), 'risk').verdict, 'pass', '지정 예고는 EXCLUDE_RE 아님');
  assert.equal(ck(risky(disc('단일판매ㆍ공급계약체결', '2026-10-01T06:52:23+09:00')), 'risk').verdict, 'pass');
  const noAgenda = one({agenda: null});
  assert.equal(ck(noAgenda, 'risk').verdict, 'hold'); assert.equal(ck(noAgenda, 'risk').recheck, '공시 목록이 들어오면 다시 봄');
  assert.equal(ck(one({agenda: agendaOf({B: []})}), 'risk').verdict, 'hold', '그 회사 공시 목록이 없음');
  const missing = agendaOf({A: []}); missing.A.missing = ['공시'];
  assert.equal(ck(one({agenda: missing}), 'risk').verdict, 'hold', '공시를 못 모은 회사(missing 공시)');
  // 여러 회사 — 회사마다 따로
  const e = elimOf({place: 'kr', asOf: ASOF, at: AT, stocks: [stock('A'), stock('B')], cand: candWith({A: '111111', B: '111111'}),
    agendaByCode: agendaOf({A: [disc('횡령ㆍ배임혐의발생', '2026-10-02T17:00:00+09:00')], B: []}), mc: mcWith([mcRow('A'), mcRow('B')])});
  assert.deepEqual(e.rows.map(r => [r.code, r.state, r.first]), [['A', 'out', 'risk'], ['B', 'pass', null]]);
});

test('위험 공시(미국) — 회사 공시 원문 자료가 없어 보류(SEC 공시(8-K) 자료를 모으면 다시 봄) · 공시 줄이 있어도 제외로 셈하지 않음', () => {
  const us = one({place: 'us'});
  assert.equal(ck(us, 'risk').verdict, 'hold'); assert.equal(ck(us, 'risk').value, RISK_UNKNOWN); assert.equal(ck(us, 'risk').recheck, 'SEC 공시(8-K) 자료를 모으면 다시 봄');
  assert.equal(us.rows[0].state, 'hold'); assert.equal(us.rows[0].first, 'risk');
  assert.equal(ck(one({place: 'us', agenda: agendaOf({A: [disc('관리종목 지정', '2026-10-01T06:52:23+09:00')]})}), 'risk').verdict, 'hold');
  assert.equal(ck(one({place: 'us', agenda: null}), 'risk').verdict, 'hold');
});

test('경로 수 · 수렴 — 몬테카를로가 없으면 보류(다음 회차 몬테카를로) · 2만 개 이상 · 숫자 아닌 경로 0 → 통과 · 오차 0.5%p 이하 → 통과 · 넘으면 보류(추가 배분 뒤)', () => {
  const none = one({mc: null});
  assert.equal(ck(none, 'paths').verdict, 'hold'); assert.equal(ck(none, 'paths').recheck, '다음 회차 몬테카를로');
  assert.equal(ck(none, 'converge').verdict, 'hold'); assert.equal(ck(none, 'tail').verdict, 'na');
  assert.equal(none.rows[0].first, 'paths'); assert.equal(none.rows[0].state, 'hold'); assert.deepEqual(none.rows[0].flags, []);
  const why = one({mc: {none: true, why: '기준일이 다름'}});
  assert.equal(ck(why, 'paths').verdict, 'hold'); assert.match(ck(why, 'paths').value, /기준일이 다름/);
  const other = one({mc: {asOf: '2026-10-07', rows: [mcRow('A')]}});
  assert.equal(ck(other, 'paths').verdict, 'hold', '기준일이 다른 몬테카를로는 쓰지 않음'); assert.match(ck(other, 'paths').value, /기준일/);
  const absent = one({mc: mcWith([mcRow('B')])});
  assert.equal(ck(absent, 'paths').verdict, 'hold'); assert.equal(ck(absent, 'paths').recheck, '다음 회차 몬테카를로'); assert.equal(ck(absent, 'converge').verdict, 'hold');
  const pathsOf = o => ck(one({mc: mcWith([mcRow('A', o)])}), 'paths').verdict;
  assert.equal(pathsOf({n: 20000}), 'pass'); assert.equal(pathsOf({n: 27397, nExtra: 7397}), 'pass');
  assert.equal(pathsOf({n: 19999}), 'hold'); assert.equal(pathsOf({nonfinite: 1}), 'hold'); assert.equal(pathsOf({nonfinite: undefined}), 'hold'); assert.equal(pathsOf({n: null}), 'hold');
  const convOf = se => ck(one({mc: mcWith([mcRow('A', {se})])}), 'converge');
  assert.equal(convOf({ploss: 0.005, cvar5: 0.005}).verdict, 'pass', '문턱 그대로는 통과');
  assert.equal(convOf({ploss: 0.0051, cvar5: 0.003}).verdict, 'hold'); assert.equal(convOf({ploss: 0.0051, cvar5: 0.003}).recheck, '추가 배분 뒤');
  assert.equal(convOf({ploss: 0.003, cvar5: 0.006}).verdict, 'hold');
  assert.equal(convOf(undefined).verdict, 'hold'); assert.equal(convOf({ploss: 0.003}).verdict, 'hold');
  assert.equal(convOf(undefined).recheck, '다음 회차에 다시 셈', '오차 값이 없으면 추가 배분으로 풀리지 않음');
  const slow = one({mc: mcWith([mcRow('A', {se: {ploss: 0.01, cvar5: 0.01}})])});
  assert.equal(slow.rows[0].state, 'hold'); assert.equal(slow.rows[0].first, 'converge');
});

test('하락 위험 — cvar5 < −0.5 → flags tail · calibrated=false 면 na(표시만 · 판정 그대로) · calibrated=true 면 보류', () => {
  const low = mcWith([mcRow('A', {cvar5: -0.6})]);
  const shown = one({mc: low});
  assert.equal(ck(shown, 'tail').verdict, 'na'); assert.deepEqual(shown.rows[0].flags, ['tail']);
  assert.equal(shown.rows[0].state, 'pass', '표시만 — 판정을 보류로 바꾸지 않음'); assert.equal(shown.rows[0].first, null);
  assert.equal(ck(shown, 'tail').recheck, '모형이 별도 구간 시험을 통과하면 이 기준으로 보류'); assert.match(ck(shown, 'tail').value, /−60\.0%/);
  const held = one({mc: low, calibrated: true});
  assert.equal(held.calibrated, true); assert.equal(ck(held, 'tail').verdict, 'hold'); assert.deepEqual(held.rows[0].flags, ['tail']);
  assert.equal(held.rows[0].state, 'hold'); assert.equal(held.rows[0].first, 'tail');
  const edge = one({mc: mcWith([mcRow('A', {cvar5: -0.5})]), calibrated: true});
  assert.deepEqual(edge.rows[0].flags, [], '문턱 그대로(−50%)는 표시 안 함'); assert.equal(ck(edge, 'tail').verdict, 'pass');
  assert.equal(ck(one({mc: mcWith([mcRow('A', {cvar5: -0.4})])}), 'tail').verdict, 'na');
  assert.equal(ck(one({mc: mcWith([mcRow('A', {cvar5: null})]), calibrated: true}), 'tail').verdict, 'hold', '값이 없으면 보류(calibrated)');
  assert.equal(one({mc: low, calibrated: 'true'}).calibrated, false, 'true 값 하나만 calibrated');
});

test('모으기 — out 하나라도 → out · 아니면 hold → hold · 아니면 pass · first 는 차례상 처음 hold · out · counts 는 줄에서 셈', () => {
  const stocks = [stock('A'), stock('B', {status: 'late', date: '2026-10-07', lag: 1, fund: {...fundOk, op: -1}}), stock('C', {status: 'stale', date: '2026-09-30', lag: 5}),
    stock('D'), stock('E', {fund: {...fundOk, net: -3}}), stock('F')];
  const flags = {A: '111111', B: '001000', C: '001000', D: '111011', E: '101111', F: '111111'};
  const e = elimOf({place: 'kr', asOf: ASOF, at: AT, stocks, cand: candWith(flags), mc: mcWith(['A', 'B', 'C', 'D', 'E'].map(c => mcRow(c))),
    agendaByCode: agendaOf({A: [], B: [], C: [disc('관리종목 지정', '2026-10-05T09:00:00+09:00')], D: [], E: [], F: []})});
  assert.deepEqual(e.rows.map(r => [r.code, r.state, r.first]), [
    ['A', 'pass', null],
    ['B', 'out', 'close'], // 마감 가격 보류가 차례상 먼저 · 판정은 흑자 제외로 out
    ['C', 'out', 'stale'], // 오래된 가격 보류 · 위험 공시 제외
    ['D', 'hold', 'history'],
    ['E', 'out', 'profit'],
    ['F', 'hold', 'paths'], // 몬테카를로 줄 없음
  ]);
  assert.deepEqual(e.counts, {pass: 1, hold: 2, out: 3});
  for (const r of e.rows) {
    const vs = r.checks.map(c => c.verdict);
    assert.equal(r.state, vs.includes('out') ? 'out' : vs.includes('hold') ? 'hold' : 'pass', r.code);
    assert.equal(r.first, r.checks.find(c => c.verdict === 'hold' || c.verdict === 'out')?.id ?? null, r.code);
  }
  const empty = elimOf({place: 'kr', asOf: ASOF, at: AT, stocks: [], cand: candWith({}), agendaByCode: {}, mc: null});
  assert.deepEqual(empty.counts, {pass: 0, hold: 0, out: 0}); assert.deepEqual(empty.rows, []);
});

test('순수 함수 — 입력을 고치지 않고 같은 입력이면 같은 결과', () => {
  const input = {place: 'kr', asOf: ASOF, at: AT, stocks: [stock('A'), stock('B', {status: 'ca', jumps: ['2026-09-14']})], cand: candWith({A: '111111', B: '011111'}),
    agendaByCode: agendaOf({A: [disc('투자경고종목지정', '2026-10-01T06:52:23+09:00')], B: []}), mc: mcWith([mcRow('A', {cvar5: -0.7}), mcRow('B')]), calibrated: false};
  const before = structuredClone(input);
  const a = elimOf(input), b = elimOf(input);
  assert.deepEqual(input, before); assert.deepEqual(a, b);
  assert.notEqual(a.rows[0].flags, b.rows[0].flags, '줄마다 새 배열');
});

test('사용자 글에 금지 말 없음 — 추천 · 목표가 · 사라 · 팔라 · 확실 · 보장 · 무조건 · 확률 · 앞날 말(PREDICTION_WORDS) · 바뀐 것 기록 금지 말(BANNED)', () => {
  const outs = [
    one(), one({place: 'us'}), one({mc: null}), one({mc: {none: true, why: '기준일이 다름'}}), one({mc: {asOf: '2026-10-07', rows: [mcRow('A')]}}), one({mc: mcWith([mcRow('B')])}),
    one({s: stock('A', {status: 'late', date: '2026-10-07', lag: 1, jumps: ['2026-10-02']}), flags: '011000'}), one({s: stock('A', {status: 'stale', date: '2025-12-01', lag: 200})}),
    one({s: stock('A', {status: 'missing', date: null, close: null, lag: null})}), one({s: stock('A', {status: 'ca', jumps: ['2026-09-14'], cas: ['무상증자']})}),
    one({flags: '111011'}), one({cand: null}), one({cand: {ready: false, items: []}}), one({s: stock('A', {fund: {...fundOk, op: -5, net: 0}})}), one({s: stock('A', {fund: null})}),
    one({s: stock('A', {fund: {fy: null, op: 1, net: null}}), place: 'us'}), one({agenda: null}), one({agenda: agendaOf({B: []})}),
    one({agenda: agendaOf({A: [disc('투자경고종목지정', '2026-10-01T06:52:23+09:00'), disc('투자경고종목 지정(회사A우)', '2026-10-02T06:52:23+09:00'), disc('관리종목 지정', '2026-10-08T16:00:00+09:00')]})}),
    one({agenda: agendaOf({A: [disc('투자경고종목 지정(회사A우)', '2026-10-02T06:52:23+09:00'), disc('관리종목 지정', '2026-10-08T16:00:00+09:00')]})}),
    one({mc: mcWith([mcRow('A', {n: 100, nonfinite: 2, se: {ploss: 0.02, cvar5: 0.03}, cvar5: -0.8})])}), one({mc: mcWith([mcRow('A', {n: 100, nonfinite: 2, se: null, cvar5: -0.8})]), calibrated: true}),
    one({mc: mcWith([mcRow('A', {cvar5: -0.2})]), calibrated: true}), one({mc: mcWith([mcRow('A', {cvar5: Number.NaN})])}),
  ];
  const texts = [ELIM_RULES.label];
  for (const e of outs) for (const r of e.rows) for (const c of r.checks) texts.push(c.label, c.data, c.value, c.recheck);
  const words = ['추천', '목표가', '사라', '팔라', '확실', '보장', '무조건', '확률', ...BANNED];
  for (const t of texts) {
    assert.equal(typeof t, 'string');
    for (const w of words) assert.ok(!t.includes(w), `금지 말 「${w}」: ${t}`);
    assert.ok(!PREDICTION_WORDS.test(t), `앞날 말: ${t}`);
    assert.ok(!/undefined|null|NaN|\[object/.test(t), `빈 값이 글에 샘: ${t}`);
  }
  // 갈래가 실제로 다 나왔나(글 검사가 모든 판정 갈래를 봤나)
  const seen = new Set(outs.flatMap(e => e.rows.flatMap(r => r.checks.map(c => `${c.id}:${c.verdict}`))));
  for (const k of ['close:pass', 'close:hold', 'close:na', 'stale:pass', 'stale:hold', 'stale:na', 'ca:pass', 'ca:hold', 'ca:na', 'history:pass', 'history:hold', 'liquidity:na',
    'profit:pass', 'profit:out', 'profit:hold', 'risk:pass', 'risk:out', 'risk:hold', 'paths:pass', 'paths:hold', 'converge:pass', 'converge:hold', 'tail:na', 'tail:hold', 'tail:pass']) assert.ok(seen.has(k), k);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {RELEASE_RULES, TRIAL_CANDIDATES, featureAt, featureByIssueDate, trialDesign, bootstrapHitDiff, judge, checkReleaseRule, summarizeDays} from '../../lib/atlas11/factor_trial.mjs';

const cand = id => TRIAL_CANDIDATES.find(c => c.id === id);

test('공개 규칙: 미국 마감 다음 날 · FRED 이틀 · H.10 다음 주 수요일 · H.4.1 사흘 · 수급 다음 날', () => {
  assert.equal(RELEASE_RULES.us_close_next_day.usableFrom('2026-09-30'), '2026-10-01');
  assert.equal(RELEASE_RULES.fred_daily_2d.usableFrom('2026-09-29'), '2026-10-01');
  assert.equal(RELEASE_RULES.h10_weekly.usableFrom('2026-09-25'), '2026-09-30'); // 금요일 값 → 월 9/28 발표 → 수 9/30
  assert.equal(RELEASE_RULES.h10_weekly.usableFrom('2026-09-21'), '2026-09-30'); // 같은 주 월요일 값도 같은 날
  assert.equal(RELEASE_RULES.h41_weekly.usableFrom('2026-09-23'), '2026-09-26');
  assert.equal(RELEASE_RULES.krx_flows_next_day.usableFrom('2026-10-01'), '2026-10-02');
});

test('2026-10-01 18:53 KST 실제 수집 최신일로 본 규칙은 너무 이르지 않다(다음 관측일을 그날 쓰지 않음)', () => {
  const seen = {'F09-SP500': '2026-09-30', 'F10-VIXCLS': '2026-09-29', 'F04-DFII10': '2026-09-29', 'F05-BAA10Y': '2026-09-29', 'F02-DGS2': '2026-09-29', 'F06-DEXKOUS': '2026-09-25', 'F07-WALCL': '2026-09-23', 'F03-KR3YT': '2026-09-30', 'F33-WTI': '2026-09-29'};
  for (const [id, latest] of Object.entries(seen)) { const r = checkReleaseRule(cand(id), latest, '2026-10-01'); assert.equal(r.ruleIsConservative, true, id); assert.ok(r.usableFromObserved <= '2026-10-01', id + ' 받은 값을 그날 쓸 수 있어야 함'); }
});

test('변환: 수준·로그수준·5일 차이·로그 차이·수급 몫 · 받을 수 없던 값은 안 씀 · 오래되면 null', () => {
  const rows = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-28', '2026-09-29'].map((date, i) => ({date, value: 10 + i}));
  // FRED 이틀 규칙 → 10/1 발행에는 9/29 까지
  assert.equal(featureAt(rows, {...cand('F05-BAA10Y')}, '2026-10-01'), 16);
  assert.equal(featureAt(rows, {...cand('F05-BAA10Y')}, '2026-09-30'), 15); // 9/29 는 아직 못 받음 → 9/28
  assert.equal(featureAt(rows, cand('F04-DFII10'), '2026-10-01'), 16 - 11); // 5관측 전(9/22) 과의 차이
  assert.ok(Math.abs(featureAt(rows, cand('F10-VIXCLS'), '2026-10-01') - Math.log(16)) < 1e-12);
  assert.equal(featureAt(rows, cand('F05-BAA10Y'), '2026-10-20'), null); // 10일 넘게 묵으면 없음
  const flows = ['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-28', '2026-09-29', '2026-09-30'].map((date, i) => ({date, foreignNet: i % 2 ? 100 : -50, volume: 1000}));
  // 10/1 발행 → 9/30 까지(다음 날 규칙) · 마지막 5일(9/24..9/30): 100,-50,100,-50,100 = 200 / 5000
  assert.equal(featureAt(flows, cand('F14-FOREIGN'), '2026-10-01'), 200 / 5000);
  assert.equal(featureAt(flows.map(r => r.date === '2026-09-28' ? {...r, volume: null} : r), cand('F14-FOREIGN'), '2026-10-01'), null); // 거래량 빠지면 0 으로 채우지 않음
});

test('설계: 목표일 j 의 재료 = 발행일 j−1 값 · 빠진 값이 있으면 그 앞 행을 버림', () => {
  const panel = {dates: ['d0', 'd1', 'd2', 'd3', 'd4']};
  const base = ['d1', 'd2', 'd3', 'd4'].map(date => ({date, x: [1], y: 0}));
  const valueOn = new Map([['d0', 5], ['d1', null], ['d2', 7], ['d3', 8], ['d4', 9]]);
  const d = trialDesign(base, panel, valueOn);
  assert.equal(d.removedPrefixRows, 2); // d2 행의 재료(d1 값)가 없어서 d1·d2 행을 버림
  assert.deepEqual(d.rows.map(r => [r.date, r.x[1]]), [['d3', 7], ['d4', 8]]);
  assert.equal(d.byTargetDate.d4, 8);
});

test('부트스트랩·판정: 같은 입력이면 같은 결과 · 미리 정한 규칙만 적용', () => {
  const mk = (rates, block) => rates.map((r, k) => ({date: 'x' + k, block: Math.floor(k / 20) + 1, right: r, wrong: 52 - r, flatActual: 0, ape: 2, brier: 0.6, coverage: 0.8}));
  const A = mk(Array.from({length: 120}, () => 26)), B = mk(Array.from({length: 120}, (_, k) => 26 + (k % 3 === 0 ? 2 : 0)));
  const b1 = bootstrapHitDiff(A, B), b2 = bootstrapHitDiff(A, B);
  assert.deepEqual(b1, b2);
  assert.equal(b1.probabilityBBetter, 1);
  const protocol = {adoption: {primary: 'B > A', uncertainty: {blockLength: 20, resamples: 500, seed: 20260929, minProbability: 0.8, minBetterBlocks: 4}, guards: {priceError: '', brier: '', brierTolerance: 0.01, coverage: ''}}};
  const side = days => ({days, summary: summarizeDays(days), byBlock: Array.from({length: 6}, (_, k) => ({block: k + 1, ...summarizeDays(days.filter(d => d.block === k + 1))}))});
  const j = judge(side(A), side(B), protocol);
  assert.equal(j.passed, true);
  const worseAPE = B.map(d => ({...d, ape: 2.1}));
  assert.deepEqual(judge(side(A), side(worseAPE), protocol).failed, ['priceError']);
  assert.equal(judge(side(A), side(A), protocol).passed, false); // 같으면 통과 아님(더 나아야 함)
});

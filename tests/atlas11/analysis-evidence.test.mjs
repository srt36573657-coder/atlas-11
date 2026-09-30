import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {scoreAllPublications, analyzeCells, sixSentences} from '../../lib/atlas11/analysis.mjs';
import {covers, observationEvidence, loadObservations} from '../../lib/atlas11/context.mjs';
import {collectContext} from '../../scripts/atlas11/collect_context.mjs';
import {realInputs, readJSON, root, tempRoot, INPUT_928} from './helpers.mjs';

const policy = await readJSON('config/atlas11/scoring-policy.v1.json');
const KST = (d, t) => `${d}T${t}:00+09:00`;

/** 합성 관측(검사용 · 실제 기록 아님): 삼성전자만 — 발행 전 기사 1 · 기간 안 기사 2(그중 재게시 1) · 마감 뒤 기사 1 · 배당락 공시 1 · 큰 외국인+기관 순매도 */
function syntheticObs() {
  const news = new Map([['005930', new Map([
    ['a', {id: 'a', publishedAt: KST('2026-09-28', '21:00'), title: '발행 전 기사', office: 'A'}],
    ['b', {id: 'b', publishedAt: KST('2026-09-29', '10:00'), title: '기간 안 기사', office: 'B', url: 'https://n.news.naver.com/b'}],
    ['c', {id: 'c', publishedAt: KST('2026-09-29', '11:00'), title: '기간 안 기사(재게시)', office: 'C', duplicateOf: 'b'}],
    ['d', {id: 'd', publishedAt: KST('2026-09-29', '16:00'), title: '마감 뒤 기사', office: 'D'}]])]]);
  const newsIntervals = new Map([['005930', [[KST('2026-09-28', '09:00'), '2026-09-29T22:27:33Z']]]]);
  const base = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-28'].map(date => [date, {date, foreignNet: 600000, institutionNet: 400000, individualNet: -1000000, status: 'reported'}]);
  const flows = new Map([['005930', new Map([...base, ['2026-09-29', {date: '2026-09-29', foreignNet: -5000000, institutionNet: -1000000, individualNet: 6000000, status: 'reported'}]])]]);
  const disclosures = new Map([['005930', new Map([['x', {id: 'x', publishedAt: KST('2026-09-29', '09:05'), title: '삼성전자(주) 중간(분기)배당락 기준가격 안내', corporateAction: true, actionWord: '배당락'}]])]]);
  return {snapshots: 1, news, newsIntervals, flows, disclosures};
}

test('수집 범위: 구간 합집합이 기간을 덮는지 · 빈틈이면 거짓', () => {
  const t = s => Date.parse(s);
  assert.equal(covers([['2026-09-28T00:00:00Z', '2026-09-29T00:00:00Z'], ['2026-09-28T20:00:00Z', '2026-09-30T00:00:00Z']], t('2026-09-28T01:00:00Z'), t('2026-09-29T12:00:00Z')), true);
  assert.equal(covers([['2026-09-28T00:00:00Z', '2026-09-28T10:00:00Z'], ['2026-09-28T11:00:00Z', '2026-09-30T00:00:00Z']], t('2026-09-28T01:00:00Z'), t('2026-09-29T12:00:00Z')), false, '10~11시 빈틈');
  assert.equal(covers([], 1, 2), false);
});

test('기간 증거: 발행 뒤 ~ 목표일 15:30 사이만 · 재게시 제외 · 수급 합계와 평소 중앙값 · 기업행위 공시 · 원인 판정 아님', () => {
  const ev = observationEvidence(syntheticObs(), {code: '005930', issuedAt: '2026-09-28T13:29:56Z', originDate: '2026-09-28', targetDate: '2026-09-29'});
  assert.equal(ev.news.count, 1); assert.equal(ev.news.republished, 1); assert.equal(ev.news.items[0].title, '기간 안 기사'); assert.equal(ev.news.coverageComplete, true);
  assert.deepEqual([ev.flows.days, ev.flows.foreignNet, ev.flows.institutionNet, ev.flows.individualNet, ev.flows.baselineDays, ev.flows.baselineMedianAbsForeignInst], [1, -5000000, -1000000, 6000000, 4, 1000000]);
  assert.equal(ev.disclosures.count, 1); assert.equal(ev.disclosures.corporateActions[0].word, '배당락');
  assert.match(ev.label, /원인 판정 아님/);
  assert.equal(observationEvidence(null, {code: '005930', issuedAt: '2026-09-28T13:29:56Z', originDate: '2026-09-28', targetDate: '2026-09-29'}), null);
  const other = observationEvidence(syntheticObs(), {code: '000660', issuedAt: '2026-09-28T13:29:56Z', originDate: '2026-09-28', targetDate: '2026-09-29'});
  assert.equal(other.news.count, 0); assert.equal(other.news.coverageComplete, false, '받은 적 없는 종목은 「덮었다」고 하지 않는다'); assert.equal(other.flows.days, 0);
});

test('원인 분석 a3: 기간 증거를 확인된 사실로 붙이고 · 방향이 맞는 큰 순매도는 「수급」 약한 가설 · 배당락 공시는 「기업 사건」 약한 가설 · 관측이 없으면 이전과 같다', async () => {
  const {input, calendar} = await realInputs(); const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json');
  const fake = structuredClone(input), day = '2026-09-29';
  for (const a of fake.assets) { const last = a.prices.at(-1), k = a.code === '005930' ? 0.95 : 1.01; a.prices.push({date: day, close: Math.round(last.close * k), quality: 'single_source', sourceUrl: 'https://example.test', rawHash: 'a'.repeat(64), observedAt: '2026-09-29T06:35:00.000Z', finalClose: true, finalizedAt: '2026-09-29T06:35:00.000Z', finalitySourceUrl: 'https://example.test', finalityBasis: 'test'}); }
  fake.actualAsOf = day;
  const scored = scoreAllPublications([p], fake, {calendar, now: '2026-09-29T07:00:00.000Z', policy});
  const network = await readJSON('public/data/atlas11/view/network.json');
  const withObs = analyzeCells(scored.cells, {publications: [p], input: fake, calendar, network, delta: policy.flatDelta, observations: syntheticObs()});
  const ss = withObs.find(a => a.code === '005930');
  assert.equal(ss.observationsUsed, true); assert.equal(ss.evidence.news.count, 1);
  assert.ok(ss.facts.some(f => /^기간 안 기사 1건/.test(f)) && ss.facts.some(f => /^기간 안 투자자 순매매\(주, 2026-09-29\): 외국인 −5,000,000/.test(f)) && ss.facts.some(f => /기업행위 낱말 배당락/.test(f)));
  assert.equal(ss.directionCorrect, false, '−5% 인데 전망은 하락이 아니었다(검사 조건)');
  const sup = ss.hypotheses.find(h => h.category === '수급'); assert.ok(sup && sup.strength === '약' && /원인 증명이 아님/.test(sup.counterEvidence), '수급 가설은 약 · 반대 근거 동반');
  assert.ok(ss.hypotheses.some(h => h.category === '기업 사건' && /배당락/.test(h.evidence)));
  assert.ok(ss.unverified.some(u => /인과는 검증하지 않음/.test(u)));
  // 기사·수급 기록이 없는 종목은 수급 가설을 만들지 않는다
  const hy = withObs.find(a => a.code === '009150'); assert.ok(!hy.hypotheses.some(h => h.category === '수급')); assert.equal(hy.evidence.flows.days, 0);
  // 관측이 없으면(파일 없음) 증거 칸은 null 이고 이전 문구를 쓴다
  const noObs = analyzeCells(scored.cells, {publications: [p], input: fake, calendar, network, delta: policy.flatDelta});
  const s0 = noObs.find(a => a.code === '005930'); assert.equal(s0.evidence, null); assert.equal(s0.observationsUsed, false); assert.ok(!s0.hypotheses.some(h => h.category === '수급'));
  // 여섯 문장: 같은 날짜의 코스피·코스닥 종가만 앞에 붙인다
  const agg = {date: day, market: {basketReturn: 0.005, up: 51, down: 1, flat: 0}, topMovers: [{name: '삼성전자', change: -0.05}], evaluated: 0, byClass: {}, causeCounts: {}, wrong: []};
  const six = sixSentences({date: day, aggregate: agg, counts: {}, context: {summary: {index: {KOSPI: {date: day, close: 6870.81, changePct: -0.27}, KOSDAQ: {date: '2026-09-28', close: 846.6, changePct: 0.1}}}}});
  assert.match(six.marketChange, /코스피 6,870\.81포인트\(−0\.27%\)/, '지수는 포인트 단위 · 내림은 − 부호(v9)'); assert.match(six.marketChange, /상승 51종목·하락 1종목·보합 0종목/); assert.match(six.marketChange, /^9월 29일\(화\)/); assert.ok(!/코스닥/.test(six.marketChange), '날짜가 다른 지수는 붙이지 않는다');
});

test('관측 묶음 합치기(실제 응답 재생 두 번): 같은 기사 한 번 · 수급은 나중 수집값 · 기사 수집 구간 기록', async () => {
  const dir = await tempRoot(); const FX = path.join(root, 'tests/atlas11/fixtures/context');
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json')); await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  await collectContext({now: '2026-09-30T07:05:00.000Z', rootDir: dir, fixtures: FX, codes: ['005930', '196170']});
  await collectContext({now: '2026-09-30T08:05:00.000Z', rootDir: dir, fixtures: FX, codes: ['005930', '196170']});
  const obs = await loadObservations(dir);
  assert.equal(obs.snapshots, 2); assert.equal(obs.newsIntervals.get('005930').length, 2);
  const once = await loadObservations(dir, {upTo: '2026-09-29'}); assert.equal(once, null, '기준일 뒤 묶음은 읽지 않는다');
  const n = [...obs.news.get('005930').values()]; assert.equal(new Set(n.map(i => i.id)).size, n.length);
  assert.ok(obs.flows.get('005930').get('2026-09-29').foreignNet === -2508369);
});

// 미국 판 365곳 고르기(us-n365-v1) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
// 한국 판(n365-v1)과 같은 생각: 시가총액 상위 안 · 우량 네 조건 · 업종마다 5곳(우량·트렌드 → 흑자 → 큰 회사) · 5곳 합이 큰 73개 업종
// 여기 후보는 시험용으로 만든 가짜 회사다(화면 · 자료 묶음에는 쓰지 않음) — 고르는 규칙이 적힌 대로 도는지만 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {US365, selectUs365, usFailsOf, usTrendOf, usNotCommon, usIsFinancial, usHowLines} from '../../lib/atlas11/us/universe.mjs';

const good = {fiscalYear: '2025', op: 10, opPrev: 9, net: 8, netPrev: 7, roe: 15, debt: 60};
let seq = 0;
const co = (industry, cap, extra = {}) => ({code: 'T' + (++seq), name: '회사' + seq, nameEn: 'Company ' + seq, exchange: 'NYSE', industry, capUsd: cap, capRank: 0,
  history: {rows: 300, ok: true}, metrics: {...good}, ...extra});
/** 업종 n 개 · 업종마다 k 곳 · 업종 차례가 뒤일수록 작은 회사들 */
function market(n = 80, k = 7) {
  seq = 0; const list = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) list.push(co(`업종${String(i).padStart(2, '0')}`, (n - i) * 1000 + (k - j) * 10));
  return rank(list);
}
const rank = list => [...list].sort((a, b) => b.capUsd - a.capUsd).map((c, i) => ({...c, capRank: i + 1}));

test('우량 네 조건 — 2년 흑자 · ROE 5% · 부채비율 150% · 보통주 (금융회사는 빚 기준 빼고 순이익만)', () => {
  assert.deepEqual(usFailsOf(co('소프트웨어', 1, {capRank: 1})), []);
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: {...good, opPrev: -1}})).includes('2년 연속 흑자 아님'), '앞 해 영업손실');
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: {...good, roe: 4.9}})).includes('ROE 5% 미만'));
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: {...good, debt: 151}})).includes('부채비율 150% 초과'));
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: {...good, debt: null}})).includes('부채비율 모름'));
  const bank = co('은행', 1, {capRank: 1, metrics: {...good, op: null, opPrev: null, debt: 900}});
  assert.equal(usIsFinancial(bank), true); assert.deepEqual(usFailsOf(bank), [], '은행: 영업이익 없음 · 부채비율 900% 여도 우량(순이익 · ROE 로만)');
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: US365.poolTop + 1})).includes(`시가총액 ${US365.poolTop}위 밖`));
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: null})).includes('시가총액 모름'), '빈 순위가 0 처럼 통과하지 않음');
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: {...good, roe: null}})).includes('ROE 모름'));
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, history: {rows: 100, ok: false}})).includes('가격 이력 부족(100일)'));
  assert.ok(usFailsOf(co('소프트웨어', 1, {capRank: 1, metrics: null})).includes('결산 자료 없음'));
});

test('보통주가 아닌 것(ETF · 우선주 · 워런트 · 스팩 · 리츠)은 뺀다 · 시대 트렌드 업종은 업종 이름(한국말)으로 가른다', () => {
  for (const nameEn of ['SPDR S&P 500 ETF Trust', 'Bank of America Corp Preferred Series L', 'Foo Acquisition Corp', 'Bar Warrants', 'Taiwan Semiconductor Manufacturing Co Ltd ADR', 'Baz American Depositary Shares']) assert.equal(usNotCommon({nameEn}), true, nameEn);
  assert.equal(usNotCommon({nameEn: 'Prologis Inc', industry: '부동산 투자 신탁(리츠)'}), false, '미국 리츠는 보통주라 남김');
  assert.equal(usNotCommon({nameEn: 'Apple Inc', industry: '컴퓨터·휴대폰'}), false);
  assert.equal(usNotCommon({common: false, nameEn: 'X'}), true);
  assert.equal(usTrendOf('반도체')?.id, 'ai-chip');
  assert.equal(usTrendOf('전력 유틸리티')?.id, 'power');
  assert.equal(usTrendOf('항공우주·국방')?.id, 'ship-defense');
  assert.equal(usTrendOf('생명공학')?.id, 'bio');
  assert.equal(usTrendOf('소프트웨어')?.id, 'platform');
  assert.equal(usTrendOf('식품'), null);
});

test('업종마다 5곳 · 5곳 시가총액 합이 큰 73개 업종 · 모두 365곳 · 같은 후보면 늘 같은 답', () => {
  const cands = market(80, 7), r = selectUs365(cands);
  assert.equal(r.ok, true); assert.equal(r.picked.length, 365); assert.equal(r.counts.industries, 73);
  const by = new Map(); for (const p of r.picked) by.set(p.industry, [...(by.get(p.industry) ?? []), p]);
  assert.equal(by.size, 73); assert.ok([...by.values()].every(ps => ps.length === 5));
  assert.ok(!by.has('업종79') && by.has('업종00'), '합이 작은 업종(맨 뒤)은 빠짐');
  assert.deepEqual(r.picked.map(p => p.rank), Array.from({length: 365}, (_, i) => i + 1));
  assert.deepEqual(selectUs365([...cands].reverse()).picked.map(p => p.code), r.picked.map(p => p.code), '후보 차례가 달라도 같은 답');
});

test('한 업종 안의 차례 — 우량·트렌드(큰 순) → 흑자(큰 순) → 큰 회사 · 모자란 업종은 고르지 않음', () => {
  seq = 0;
  const base = [];
  for (let i = 0; i < 73; i++) for (let j = 0; j < 5; j++) base.push(co(`바탕${String(i).padStart(2, '0')}`, 10 + j));
  const loss = {...good, net: -1, op: -1};
  const ind = '식품', mix = [
    co(ind, 900, {metrics: loss}),                          // 가장 크지만 적자 → 채움(size)
    co(ind, 800, {metrics: {...good, debt: 400}}),          // 흑자지만 빚 많음 → 흑자(profit)
    co(ind, 700),                                           // 우량
    co(ind, 600, {metrics: {...good, roe: 2}}),             // 흑자(profit)
    co(ind, 500),                                           // 우량
    co(ind, 400, {metrics: loss}),                          // 채움(size) · 5곳을 넘어 빠짐
  ];
  const short = [co('모자란업종', 5000), co('모자란업종', 4000), co('모자란업종', 3000)];
  const r = selectUs365(rank([...base, ...mix, ...short]));
  const food = r.picked.filter(p => p.industry === ind);
  assert.deepEqual(food.map(p => p.capUsd), [700, 500, 800, 600, 900], '우량 700 · 500 → 흑자 800 · 600 → 큰 회사 900');
  assert.deepEqual(food.map(p => p.kind), ['quality', 'quality', 'profit', 'profit', 'size']);
  assert.ok(!r.picked.some(p => p.industry === '모자란업종'), '5곳이 안 되는 업종은 빠짐');
  assert.deepEqual(r.counts.short, [{industry: '모자란업종', have: 3}]);
  const chip = selectUs365(rank([...base, co('반도체', 900, {metrics: loss}), co('반도체', 800), co('반도체', 700), co('반도체', 600), co('반도체', 500)])).picked.filter(p => p.industry === '반도체');
  assert.deepEqual(chip.map(p => p.kind), ['trend', 'quality', 'quality', 'quality', 'quality'], '시대 트렌드 업종의 적자 회사도 우량과 같은 칸(큰 순)');
});

test('고를 수 없는 후보 — ETF · 가격 이력 부족 · 시가총액 밖 · 업종 모름은 아예 셈에서 빠짐 · 365곳이 안 되면 ok=false', () => {
  seq = 0;
  const cands = rank([
    ...Array.from({length: 5}, (_, j) => co('바탕', 100 - j)),
    co('바탕', 999, {nameEn: 'Big Index ETF'}), co('바탕', 998, {history: {rows: 20, ok: false}}), co('바탕', 997, {industry: null}),
  ]);
  const r = selectUs365(cands);
  assert.equal(r.ok, false); assert.equal(r.picked.length, 5);
  assert.ok(r.picked.every(p => p.capUsd <= 100), 'ETF · 이력 부족 회사는 크더라도 빠짐');
  assert.equal(r.counts.failReasons['보통주 아님'], 1); assert.equal(r.counts.failReasons['가격 이력 부족'], 1); assert.equal(r.counts.failReasons['업종 모름'], 1);
});

test('화면 「어떻게 골랐나」 세 줄 — 실제 규칙 숫자 그대로', () => {
  const lines = usHowLines(US365, '네이버 증권 해외주식');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /1,500곳/); assert.match(lines[1], /2년 연속 흑자 · ROE 5% 이상 · 부채비율 150% 이하/); assert.match(lines[2], /73개 업종 · 모두 365곳 · .* 자료: 네이버 증권 해외주식/);
});

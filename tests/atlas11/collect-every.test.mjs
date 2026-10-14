// 목록에 오른 것 모두(--every) — 사장님 2026-10-14 11:02(싱가포르) 「이거 다 올려」(펀드와 우선주까지 4,307개)
//   ① 번호에 글자가 섞인 새 상장 보통주(0126Z0 등 — 틀림 장부 26번)도 보통주 ② 펀드 · 증권 · 우선주 · 스팩 · 리츠 · X클래스 펀드도 이름표 · 요약까지 받음
//   ③ 결산 · 일봉은 보통주만 ④ 쪽을 넘기는 사이 빠진 것은 목록 전체 수(totalCount)를 채울 때까지 다시 넘겨 합침 ⑤ 종류 이름표 kindOf
import test from 'node:test';
import assert from 'node:assert/strict';
import {collectBundle} from '../../scripts/atlas11/collect_universe.mjs';
import {kindOf, KIND_NAME, notCommon, parseMarketValueJson} from '../../lib/atlas11/universe.mjs';

const ITEMS = {
  KOSPI: [['100000', '합성전자', 'stock', 9000], ['0126Z0', '합성에피스홀딩스', 'stock', 8000], ['100010', '합성화학', 'stock', 7000], ['100005', '합성전자우', 'stock', 600],
    ['069500', 'KODEX 200', 'etf', 5000], ['0106J0', '대신 KOSPI200인덱스 X클래스', 'stock', 400], ['330590', '롯데리츠', 'stock', 300], ['500001', '신한 원유선물 ETN', 'etn', 200]],
  KOSDAQ: [['0009K0', '합성바이오', 'stock', 3000], ['475460', '하나스팩32호', 'stock', 100]],
};
function fake() {
  const calls = {KOSPI: 0, KOSDAQ: 0}, hits = [];
  const res = (body, type = 'application/json') => new Response(body, {status: 200, headers: {'content-type': type + '; charset=utf-8'}});
  const no = () => new Response('no', {status: 404});
  const all = Object.entries(ITEMS).flatMap(([m, xs]) => xs.map(([c, n, t, cap]) => ({c, n, t, cap, m})));
  return {hits, fetch: async url => {
    const u = new URL(url); let m; hits.push(u.pathname + u.search);
    if ((m = /\/api\/stocks\/marketValue\/(KOSPI|KOSDAQ)/.exec(u.pathname))) {
      const pg = Number(u.searchParams.get('page')); if (pg === 1) calls[m[1]]++;
      let xs = ITEMS[m[1]].map(([c, n, t, cap]) => ({itemCode: c, stockName: n, stockEndType: t, marketValue: String(cap * 1e8)}));
      if (m[1] === 'KOSPI' && calls.KOSPI === 1) xs = xs.filter(x => x.itemCode !== '100010'); // 첫 넘김에서 몸값 차례가 바뀌어 한 곳을 못 봄
      const page = xs.slice((pg - 1) * 5, pg * 5);
      return res(JSON.stringify({totalCount: ITEMS[m[1]].length, stocks: page}));
    }
    if ((m = /\/api\/stock\/([0-9A-Z]{6})\/integration/.exec(u.pathname))) {
      const x = all.find(y => y.c === m[1]); if (!x) return no();
      return res(JSON.stringify({itemCode: x.c, stockName: x.n, stockEndType: x.t, industryCode: '278', totalInfos: [{code: 'marketValue', value: `${x.cap.toLocaleString('en-US')}억`}, {code: 'per', value: '10.00배'}]}));
    }
    if ((m = /\/api\/stock\/([0-9A-Z]{6})\/finance\/annual/.exec(u.pathname))) {
      const col = v => ({202312: {value: String(v)}, 202412: {value: String(v)}, 202512: {value: String(v)}});
      return res(JSON.stringify({financeInfo: {trTitleList: [{isConsensus: 'N', title: '2023.12.', key: '202312'}, {isConsensus: 'N', title: '2024.12.', key: '202412'}, {isConsensus: 'N', title: '2025.12.', key: '202512'}],
        rowList: [{title: '영업이익', columns: col(10)}, {title: '당기순이익', columns: col(8)}, {title: 'ROE', columns: col(20)}, {title: '부채비율', columns: col(50)}]}}));
    }
    if (u.hostname === 'fchart.stock.naver.com') {
      const c = u.searchParams.get('symbol');
      return res(`<?xml version="1.0" encoding="EUC-KR" ?><protocol><chartdata symbol="${c}" name="x" count="3" timeframe="day" precision="0"><item data="20261012|100|110|90|100|5" /><item data="20261013|100|110|90|105|5" /></chartdata></protocol>`, 'text/xml');
    }
    return no();
  }};
}

test('종류 이름표 · 보통주 — 글자 섞인 번호도 보통주 · X클래스는 펀드', () => {
  assert.deepEqual(['005930', '0126Z0', '0009K0'].map(c => notCommon(c, '회사')), [false, false, false]);
  assert.deepEqual([['005935', '삼성전자우', 'stock'], ['00680K', '미래에셋증권2우B', 'stock'], ['069500', 'KODEX 200', 'etf'], ['500001', 'x ETN', 'etn'], ['475460', '하나스팩32호', 'stock'], ['330590', '롯데리츠', 'stock'], ['0106J0', '대신 KOSPI200인덱스 X클래스', 'stock'], ['138040', '메리츠금융지주', 'stock'], ['0126Z0', '삼성에피스홀딩스', 'stock']].map(a => kindOf(...a)),
    ['pref', 'pref', 'etf', 'etn', 'spac', 'reit', 'fund', null, null]);
  assert.equal(KIND_NAME.etf, '상장 펀드'); assert.equal(KIND_NAME.pref, '우선주');
  assert.deepEqual(parseMarketValueJson(JSON.stringify({stocks: [{itemCode: '0126Z0', stockName: 'a'}, {itemCode: '12345', stockName: 'b'}, {itemCode: '00680K', stockName: 'c'}]}), 'KOSPI').map(r => r.code), ['0126Z0', '00680K']);
});

test('--every — 목록 모두 이름표 · 요약 · 결산과 일봉은 보통주만 · 빠진 것은 다시 넘겨 채움', async () => {
  const F = fake();
  const b = await collectBundle({now: '2026-10-14T11:30:00Z', fetch: F.fetch, concurrency: 4, politeDelayMs: 0, every: true});
  assert.equal(b.every, true); assert.equal(b.all, true);
  const want = Object.values(ITEMS).flat().map(x => x[0]).sort();
  assert.deepEqual(Object.keys(b.stocks).sort(), want, '목록에 오른 것 모두');
  assert.equal(b.lists.passes.KOSPI, 2, '첫 넘김에서 못 본 것이 있어 다시 넘김'); assert.equal(b.lists.unseen.KOSPI, 0); assert.equal(b.lists.total.KOSPI, 8);
  assert.equal(b.lists.passes.KOSDAQ, 1); assert.equal(b.lists.unseen.KOSDAQ, 0);
  const commons = ['100000', '0126Z0', '100010', '0009K0'];
  for (const c of want) {
    assert.ok(b.stocks[c].integration?.text, '요약 ' + c);
    const isC = commons.includes(c);
    assert.equal(!!b.stocks[c].finance, isC, '결산은 보통주만 ' + c); assert.equal(!!b.stocks[c].fchart?.rows?.length, isC, '일봉은 보통주만 ' + c);
  }
  // --all(--every 아님)은 그대로 — 펀드 · 증권은 목록에서 빼고 보통주가 아닌 것은 요약도 안 받음
  const G = fake();
  const a = await collectBundle({now: '2026-10-14T11:30:00Z', fetch: G.fetch, concurrency: 4, politeDelayMs: 0, all: true});
  assert.equal(a.every, undefined); assert.deepEqual(Object.keys(a.stocks).sort(), [...commons].sort());
});

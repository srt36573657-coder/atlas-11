// 수르 두 길(/su/) 자료 고르기 시험 — 주문 2049(사장님 2026-11-03 15:49(+04) · docs/design/su-two-2026-11-03/order-2049.txt)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, whyOf, reasonsFor, idxLine, coLine, indRows, forwardTo} from '../../site/su/su-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SAY = ['그날 몸값이 큰 쪽 위 20% 회사예요', '업종이 한 달 동안 시장보다 15% 넘게 더 올랐어요', '회사는 아직 싹이에요'];

test('숫자 말 — 퍼센트 · 더 덜 · 날짜', () => {
  assert.equal(pct(31.93), '+31.9%');
  assert.equal(pct(-5.67), '−5.7%');
  assert.equal(pct(0.02), '0.0%');
  assert.equal(pct(NaN), '?');
  assert.equal(moreLess(8.87), '8.9% 더');
  assert.equal(moreLess(-32.15), '32% 덜');
  assert.equal(moreLess(17.49), '17% 더');
  assert.equal(dateKo('2026-11-03'), '11월 3일');
  assert.equal(dateKo('x'), '?');
});

test('꽃이 될 회사 — 고른 날 · 빈 날(가까운 곳 · 섞지 않음) · 아무것도 없음', () => {
  const pick = bloomList({today: {rule: {say: SAY}, inds: [{n: '반도체', co: [['000660', 'SK하이닉스', 0, 1], ['bad', '나쁜 줄']]}]}, honest: {rate: 33.1, base: 24.38, n: 1580, hits: 523}, near: {today: [['127120', '제이에스링크', '바이오', 8.87, -32]]}});
  assert.equal(pick.mode, 'pick');
  assert.deepEqual(pick.rows, [{code: '000660', name: 'SK하이닉스', ind: '반도체'}]); // 번호가 아닌 줄은 뺌 · 고른 날에는 가까운 곳을 섞지 않음
  assert.deepEqual(pick.rec, {rate: 33, base: 24, n: 1580, hits: 523});
  const near = bloomList({today: {rule: {say: SAY}, inds: []}, honest: {rate: 33.1, base: 24.38}, near: {rule: {atom: 'ix4', min: 15, say: SAY[1]}, today: [['127120', '제이에스링크', '바이오 도구·서비스', 8.87, -32.15], ['032830', '삼성생명', '보험', 8.01, 3.56]], rec: {n: 132, hits: 21, rate: 15.91, base: 26.21}}});
  assert.equal(near.mode, 'near');
  assert.equal(near.rows.length, 2);
  assert.equal(near.rows[0].ix, 8.87);
  assert.equal(near.miss, SAY[1]);
  assert.deepEqual(near.rec, {rate: 16, base: 26, n: 132, hits: 21}); // 빈 날에는 가까운 회사 기록(아무 회사 26번)
  const none = bloomList({today: {inds: []}});
  assert.equal(none.mode, 'none');
  assert.deepEqual(none.rows, []);
  assert.equal(bloomList(null).mode, 'none');
});

test('돈이 몰린 회사 — 한 달 앞선 업종 셋의 대장 회사 · 까닭 한 줄과 켜진 까닭만', () => {
  const TH = {inds: [
    {n: '음료', x: 15.1, lead: ['000080', '하이트진로', 1]}, {n: '항공', x: 17.5, lead: ['180640', '한진칼', 1]}, {n: '물류·운송', x: 11.2, lead: ['002320', '한진', 1]},
    {n: '보험', x: 8.0, lead: ['032830', '삼성생명', 1]}, {n: '반도체', x: -16, lead: ['005930', '삼성전자', 1]}, {n: '빈 대장', x: 30, lead: null}]};
  const W = {inds: [{n: '항공', why: {ko: ['외국인과 기관이 샀고,', '한진칼이 끌었어요.']}, items: [{k: 1, s: 'on', ko: {t: '외국인이 샀어요.', sub: '대한항공'}}, {k: 3, s: 'off', ko: {t: '개인은 팔았어요.'}}]}]};
  const mo = moneyList(TH, W);
  assert.deepEqual(mo.map(r => r.name), ['한진칼', '하이트진로', '한진']); // x 큰 차례 셋 · 대장이 없는 업종은 뺌
  assert.equal(mo[0].why.line, '외국인과 기관이 샀고, 한진칼이 끌었어요.');
  assert.deepEqual(mo[0].why.items, [{k: 1, t: '외국인이 샀어요.', sub: '대한항공'}]); // 꺼진 까닭(개인 팖)은 뺌
  assert.equal(mo[1].why, null);
  assert.equal(whyOf(W, '없는 업종'), null);
  assert.deepEqual(moneyList({inds: [{n: '반도체', x: -3, lead: ['005930', '삼성전자']}]}, null), []); // 시장보다 더 오른 업종이 없으면 비움
});

test('왜 여기 있나 — 가까운 회사는 맞은 조건 · 안 맞은 조건을 가름 · 돈이 몰린 회사 · 둘 다', () => {
  const bl = {mode: 'near', rows: [{code: '127120', name: '제이에스링크', ind: '바이오', ix: 8.87}], say: SAY, miss: SAY[1], min: 15, rec: {rate: 16, base: 26}};
  const mo = [{code: '127120', name: '제이에스링크', ind: '바이오', x: 20, why: null}, {code: '180640', name: '한진칼', ind: '항공', x: 17.5, why: null}];
  const r = reasonsFor('127120', bl, mo);
  assert.deepEqual(r.map(x => x.kind), ['near', 'money']);
  assert.deepEqual(r[0].ok, [SAY[0], SAY[2]]);
  assert.deepEqual(r[0].no, [SAY[1]]);
  assert.deepEqual(reasonsFor('180640', bl, mo).map(x => x.kind), ['money']);
  assert.deepEqual(reasonsFor('999999', bl, mo), []);
  assert.deepEqual(reasonsFor('000660', {mode: 'pick', rows: [{code: '000660', name: 'SK하이닉스', ind: '반도체'}], say: SAY, rec: null}, []).map(x => [x.kind, x.ok.length, x.no.length]), [['pick', 3, 0]]);
});

test('한 달 그림 — 지수는 회사와 같은 날들 · 코스닥 회사는 코스닥 · 기준일 100', () => {
  const H = {idx: {KOSPI: {rows: [['2026-10-01', 90], ['2026-10-02', 200], ['2026-10-05', 210], ['2026-11-03', 180]]}, KOSDAQ: {rows: [['2026-10-02', 50], ['2026-11-03', 40]]}}};
  const k = idxLine(H, 'KOSPI', '2026-10-02', '2026-11-03');
  assert.equal(k.name, '코스피');
  assert.deepEqual(k.line, [100, 105, 90]);
  assert.equal(k.from, '2026-10-02');
  assert.equal(idxLine(H, 'KOSDAQ', '2026-10-02', '2026-11-03').name, '코스닥');
  assert.equal(idxLine(H, 'KOSPI', null, '2026-11-03'), null);
  assert.deepEqual(coLine({line: [10000, 13193]}), [100, 131.93]);
  assert.equal(coLine({line: [10000]}), null);
});

test('업종 회사 — 그 업종만 · 한 달 많이 오른 차례 · 값 모르면 뒤', () => {
  const M = {companies: {'003490': {n: '대한항공', i: '항공', c: -5.67}, '180640': {n: '한진칼', i: '항공', c: 31.93}, '091810': {n: '트리니티항공', i: '항공', c: null}, '005930': {n: '삼성전자', i: '반도체', c: 1}, bad: {n: '나쁜', i: '항공', c: 3}}};
  assert.deepEqual(indRows(M, '항공').map(r => r.name), ['한진칼', '대한항공', '트리니티항공']);
  assert.deepEqual(indRows(null, '항공'), []);
});

test('저장소 자료 그대로 — 꽃이 될 회사 · 돈이 몰린 회사 줄이 모두 회사 번호를 가짐', () => {
  const rd = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const B = rd('site/next/data/theme-bloom.json'), TH = rd('site/next/data/theme.json'), W = rd('site/next/data/flow-why.json');
  const bl = bloomList(B);
  assert.ok(['pick', 'near', 'none'].includes(bl.mode));
  for (const r of bl.rows) assert.match(r.code, CODE);
  const mo = moneyList(TH, W);
  assert.ok(mo.length <= 3);
  for (const r of mo) { assert.match(r.code, CODE); assert.ok(r.x > 0); }
});

test('첫 화면이 된 뒤 — 지금 수르 고리 · 말 · 카톡 표는 /next/ 로 그대로 · 수르 두 길 길과 다른 표는 그대로', () => {
  for (const h of ['', '#', '#/', '#/c/005930', '#/i/%ED%95%AD%EA%B3%B5']) assert.equal(forwardTo('', h), null, h);
  assert.equal(forwardTo('?v=123', '#/'), null);
  assert.equal(forwardTo('?fbclid=abc', ''), null);
  assert.equal(forwardTo('', '#/w/005930'), '/next/#/w/005930');
  assert.equal(forwardTo('', '#/s/abc%20def'), '/next/#/s/abc%20def'); // 카톡으로 받은 보내기
  assert.equal(forwardTo('', '#/why'), '/next/#/why');
  assert.equal(forwardTo('', '#/c/'), '/next/#/c/'); // 번호 없는 옛 회사 길은 지금 수르가 풂
  assert.equal(forwardTo('?lang=en', '#/'), '/next/?lang=en#/');
  assert.equal(forwardTo('?kakao=ok', ''), '/next/?kakao=ok');
  assert.equal(forwardTo('?v=1&sw=1', '#/c/005930'), '/next/?v=1&sw=1#/c/005930');
});

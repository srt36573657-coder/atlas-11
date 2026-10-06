// ATLAS 11 · 아래 탭 「처음」 셈(lib/atlas11/start.mjs) — 사장님 2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」
//   기준 하나: 우량 · 시가총액 100위 안 가운데 지난 3년(756거래일) 꼭대기에서 가장 덜 떨어진 다섯 · 3년이 모자란 판은 「언제부터」만
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {START, drawdownOf, startOf, checkStart} from '../../lib/atlas11/start.mjs';
import {root} from './helpers.mjs';

/** 거래일(주말 건너뜀) n개 — from 부터 */
const days = (n, from = '2023-01-02') => { const out = [], d = new Date(from + 'T00:00:00Z'); while (out.length < n) { const w = d.getUTCDay(); if (w > 0 && w < 6) out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); } return out; };
const rowsOf = (closes, from) => { const ds = days(closes.length, from); return closes.map((close, i) => ({date: ds[i], close})); };
const small = {days: 5, yearDays: 2, jump: 0.5};

test('기준 — 3년 756거래일 · 1년 252거래일 · 시가총액 100위 안 · 우량 · 다섯 · 하루 한도는 lead6 와 같음(한국 31% · 미국 50%)', () => {
  assert.deepEqual({days: START.days, yearDays: START.yearDays, capTop: START.capTop, kind: START.kind, want: START.want}, {days: 756, yearDays: 252, capTop: 100, kind: 'quality', want: 5});
  assert.deepEqual({...START.jump}, {kr: 0.31, us: 0.5});
});

test('한 회사 — 가장 깊은 하락(꼭대기 → 가장 낮은 때) · 3년 · 1년 변화 · 가장 크게 떨어진 하루', () => {
  const r = rowsOf([100, 120, 90, 130, 117, 125]), d = drawdownOf(r, small);
  assert.equal(d.from, r[0].date); assert.equal(d.to, r[5].date);
  assert.equal(d.mdd, -0.25, '120 → 90');
  assert.deepEqual(d.peak, {date: r[1].date, close: 120}); assert.deepEqual(d.trough, {date: r[2].date, close: 90});
  assert.equal(d.change, 0.25, '100 → 125'); assert.equal(d.change1y, -0.038462, '1년(2거래일) 앞 130 → 125');
  assert.deepEqual(d.worstDay, {date: r[2].date, change: -0.25}); assert.equal(d.atLow, false);
  // 마지막 날이 가장 낮은 자리
  const low = drawdownOf(rowsOf([100, 110, 105, 100, 95, 90]), small);
  assert.equal(low.atLow, true); assert.equal(low.mdd, -0.181818);
  // 창보다 오래된 날은 보지 않음(앞 꼭대기 200 은 창 밖)
  assert.equal(drawdownOf(rowsOf([200, 100, 100, 100, 100, 100, 100]), small).mdd, 0);
});

test('한 회사 — 재지 않음: 창이 모자람 · 한도 넘는 하루(분할 · 합병 같은 바뀜) · 0 이하 종가', () => {
  assert.equal(drawdownOf(rowsOf([100, 101, 102]), small), null);
  assert.equal(drawdownOf(rowsOf([100, 100, 200, 200, 200, 200]), small), null, '하루 +100% > 한도 50%');
  assert.equal(drawdownOf(rowsOf([100, 100, 0, 100, 100, 100]), small), null);
  assert.equal(drawdownOf(null, small), null);
});

test('판 전체 — 우량 · 시가총액 순위 안만 · 덜 떨어진 순(같으면 시가총액 큰 쪽) · 견줄 값 = 잰 회사 전부의 가운데 값 · 지수 1년 · 같은 업종 몰림', () => {
  const tel = {id: 'tel', label: '통신'};
  const companies = [
    {code: 'A', name: '가', kind: 'quality', capRank: 1, group: {id: 'bank', label: '은행'}, rows: rowsOf([100, 120, 90, 110, 117, 125])}, // −25%(한국 판 하루 한도 31% 안)
    {code: 'C', name: '다', kind: 'quality', capRank: 3, group: tel, rows: rowsOf([100, 100, 90, 95, 99, 100])}, // −10%
    {code: 'B', name: '나', kind: 'quality', capRank: 2, group: tel, rows: rowsOf([100, 100, 90, 95, 99, 100])}, // −10% · 순위가 앞
    {code: 'D', name: '라', kind: 'quality', capRank: 4, group: tel, rows: rowsOf([100, 101, 102, 103, 104, 105])}, // 0% 이지만 순위 밖
    {code: 'E', name: '마', kind: 'momentum', capRank: 5, group: tel, rows: rowsOf([100, 101, 102, 103, 104, 105])}, // 우량 아님
    {code: 'F', name: '바', kind: 'quality', capRank: 6, group: tel, rows: rowsOf([100, 101])}, // 창이 모자람
  ];
  const s = startOf(companies, {place: 'kr', indexRows: rowsOf([100, 100, 100, 100, 110, 120]), indexName: '코스피', ...small, capTop: 3, want: 2});
  assert.equal(s.ready, true); assert.equal(s.schema, 'atlas11-start-1');
  assert.equal(s.measured, 5, 'F 는 재지 않음'); assert.equal(s.candidates, 3, 'A · B · C');
  assert.deepEqual(s.picks.map(p => [p.rank, p.code, p.mdd]), [[1, 'B', -0.1], [2, 'C', -0.1]]);
  assert.deepEqual(s.typical, {mdd: -0.1}, '[-0.25, -0.1, -0.1, 0, 0] 의 가운데');
  assert.deepEqual(s.index1y, {name: '코스피', date: s.to, from: rowsOf([0, 0, 0, 0, 0, 0])[3].date, change: 0.2});
  assert.deepEqual(s.sameGroup, [{label: '통신', n: 2}]);
  assert.deepEqual(checkStart(s, companies), []);
  // 판 검사가 잡는 것: 차례 · 우량 아님 · 순위 · 다섯보다 많음
  assert.match(checkStart({...s, picks: [s.picks[0], {...s.picks[1], mdd: -0.05}]}, companies).join(), /가장 깊은 하락 차례/);
  assert.match(checkStart({...s, picks: [{...s.picks[0], code: 'E'}]}, companies).join(), /우량 아님 E/);
  assert.match(checkStart({...s, picks: [{...s.picks[0], rank: 2}]}, companies).join(), /순위 B/);
  assert.match(checkStart({...s, picks: [...s.picks, s.picks[1]]}, companies).join(), /다섯보다 많음/);
});

test('3년이 모자란 판(미국 판) — 찍지 않고 언제부터만(첫 종가 달 + 3년)', () => {
  const s = startOf([{code: 'X', name: 'X', kind: 'quality', capRank: 1, rows: rowsOf(Array(295).fill(100), '2025-08-04')}], {place: 'us'});
  assert.deepEqual({ready: s.ready, have: s.have, readyMonth: s.readyMonth, jump: s.rule.jump}, {ready: false, have: {from: '2025-08-04', days: 294}, readyMonth: '2028-08', jump: 0.5});
  assert.equal(s.picks, undefined);
  assert.deepEqual(checkStart(s, []), []);
  assert.deepEqual(checkStart({...s, readyMonth: null, have: null}, []), ['언제부터 없음']);
});

test('저장소의 판 — 한국 판은 다섯이 기준대로 · 미국 판은 언제부터', async () => {
  const kr = JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11/view/board.json'), 'utf8'));
  const us = JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11/us/view/board.json'), 'utf8'));
  for (const b of [kr, us]) if (b.start) assert.deepEqual(checkStart(b.start, b.companies), [], b.start.place);
  if (kr.start?.ready) {
    assert.ok(kr.start.picks.length <= 5 && kr.start.picks.length > 0);
    assert.ok(kr.start.picks.every(p => p.capRank <= 100 && p.mdd <= 0 && p.mdd >= kr.start.typical.mdd), '다섯 모두 견줄 값보다 덜 떨어짐');
  }
  if (us.start && !us.start.ready) assert.match(us.start.readyMonth ?? '', /^\d{4}-\d{2}$/);
});

test('하루 한도는 판마다 — 하루 +44% 인 회사: 한국 판(31%)은 재지 않고 미국 판(50%)은 잼', () => {
  const one = [{code: 'A', name: '가', kind: 'quality', capRank: 1, rows: rowsOf([100, 120, 90, 130, 117, 125])}];
  assert.equal(startOf(one, {place: 'kr', days: 5, yearDays: 2}).measured, 0);
  assert.equal(startOf(one, {place: 'us', days: 5, yearDays: 2}).measured, 1);
});

// 큐피트 1 · 2 · 3등 달력 · 10주씩 산 셈 장부(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
//   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐   잡스라면」)
//   장부 한 걸음(scripts/atlas11/next/su21_book.mjs) · 저장된 장부 · 화면 자료 — 옛 화면 셈(su-book.js · su-book.css)은 화면에서 안 써 지움(주문 1116-1846 「어 지워」)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCHEMA, QTY, emptyBook, okBook, stepBook, siteBook} from '../../scripts/atlas11/next/su21_book.mjs';
import {forwardTo} from '../../site/su/su-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/** 시험 판 — 날 하루 · 회사 넷(셋은 1 · 2 · 3등) */
const rank = (a, b, c) => [{place: 1, k: 'hot', code: a, name: 'ㄱ'}, {place: 2, k: 'moneyNext', code: b, name: 'ㄴ'}, {place: 3, k: 'bloom', code: c, name: 'ㄷ'}];
const T = (day, r, cdays = null) => ({asOf: {board: day}, listRule: 'mc365-v1', top3: {rank: r}, cdays});
const co = (code, name, day, close, c = null, cFrom = null) => ({code, name, date: day, close, c, cFrom});
const board = (day, cs) => ({asOf: day, companies: cs});

test('장부 한 걸음 — 판 날 1 · 2 · 3등을 그 판 날 마지막 값으로 적음 · 산 날 값 줄', () => {
  const b1 = board('2026-11-10', [co('000001', '가나', '2026-11-10', 1000), co('000002', '다라', '2026-11-10', 2000), co('000003', '마바', '2026-11-10', 3000), co('000004', '사아', '2026-11-10', 4000)]);
  const {book, added, marked} = stepBook(null, T('2026-11-10', rank('000001', '000002', '000003')), b1, '2026-11-10T16:00:00+09:00');
  assert.equal(book.schema, SCHEMA); assert.equal(book.qty, QTY); assert.equal(QTY, 10);
  assert.ok(added && added.board === '2026-11-10' && added.seen === '2026-11-10T16:00:00+09:00' && added.rule === 'mc365-v1');
  assert.deepEqual(added.picks.map(p => [p.place, p.code, p.name, p.px, p.k]), [[1, '000001', '가나', 1000, 'hot'], [2, '000002', '다라', 2000, 'moneyNext'], [3, '000003', '마바', 3000, 'bloom']], '이름 · 값은 판에서(1 · 2 · 3등 차례)');
  assert.deepEqual(book.px, {'000001': {'2026-11-10': 1000}, '000002': {'2026-11-10': 2000}, '000003': {'2026-11-10': 3000}}, '뽑힌 회사만 · 산 날 값');
  assert.ok(okBook(book)); assert.equal(typeof marked, 'number');
  // 같은 판으로 다시 — 새 날 없음 · 그대로
  const again = stepBook(book, T('2026-11-10', rank('000001', '000002', '000003')), b1);
  assert.equal(again.added, null); assert.deepEqual(again.book, book);
  // 같은 판 날 다른 1 · 2 · 3등(나중에 다시 셈) — 처음 적은 것을 고치지 않음
  const re = stepBook(book, T('2026-11-10', rank('000004', '000002', '000003')), b1);
  assert.equal(re.added, null); assert.deepEqual(re.book.days[0].picks.map(p => p.code), ['000001', '000002', '000003']);
  // 같은 판 날을 다시 묶었는데 마지막 값이 다름 — 산 값 · 값 줄의 그 날 값은 처음 적은 그대로
  const rx = stepBook(book, T('2026-11-10', rank('000001', '000002', '000003')), board('2026-11-10', [co('000001', '가나', '2026-11-10', 1010), co('000002', '다라', '2026-11-10', 2000), co('000003', '마바', '2026-11-10', 3000)]));
  assert.equal(rx.book.px['000001']['2026-11-10'], 1000); assert.equal(rx.book.days[0].picks[0].px, 1000);
  // 들어온 장부는 바뀌지 않음
  const frozen = JSON.stringify(book); stepBook(book, T('2026-11-11', rank('000004', '000001', '000002')), board('2026-11-11', [co('000001', '가나', '2026-11-11', 1100), co('000002', '다라', '2026-11-11', 1900), co('000004', '사아', '2026-11-11', 4100)]));
  assert.equal(JSON.stringify(book), frozen);
});

test('장부 한 걸음 — 다음 판 날: 새 셋을 적고 · 먼저 산 회사 값 줄에 새 날 값 · 21 값으로 빈 날 채움(산 날부터만)', () => {
  const d0 = '2026-11-10', d1 = '2026-11-11';
  const b0 = board(d0, [co('000001', '가나', d0, 1000), co('000002', '다라', d0, 2000), co('000003', '마바', d0, 3000)]);
  const s0 = stepBook(null, T(d0, rank('000001', '000002', '000003')), b0).book;
  const cd = Array.from({length: 21}, (_, i) => { const d = new Date(Date.UTC(2026, 9, 14 + i)); return d.toISOString().slice(0, 10); }); // 10-14 ~ 11-03 (21날)
  cd[19] = d0; cd[20] = d1; // 끝 둘 = 판 날 둘
  const c21 = (end, base) => Array.from({length: 21}, (_, i) => (i === 20 ? end : base + i));
  const b1 = board(d1, [co('000001', '가나', d1, 1200, c21(1200, 900), cd[0]), co('000002', '다라', d1, 1800, c21(1800, 1700), cd[0]), co('000003', '마바', d1, 3300, c21(3300, 2900), cd[0]), co('000005', '자차', d1, 5000, c21(5000, 4800), cd[0])]);
  const {book, added} = stepBook(s0, T(d1, rank('000005', '000001', '000003'), cd), b1, '2026-11-11T16:10:00+09:00');
  assert.ok(added && added.board === d1);
  assert.deepEqual(book.days.map(d => d.board), [d0, d1], '판 날 차례');
  assert.deepEqual(book.px['000001'], {[d0]: 1000, [d1]: 1200}, '산 날 값은 산 값 그대로 · 산 날 앞 21 값은 넣지 않음');
  assert.deepEqual(book.px['000002'], {[d0]: 2000, [d1]: 1800}, '새 셋에 없어도 들고 있는 회사는 값 줄이 이어짐');
  assert.deepEqual(book.px['000005'], {[d1]: 5000}, '새 회사는 산 날부터');
  assert.ok(okBook(book));
  // 화면 자료 — [날, 값] 줄
  const S = siteBook(book, d1);
  assert.equal(S.schema, SCHEMA); assert.equal(S.asOf, d1); assert.equal(S.qty, 10);
  assert.deepEqual(S.px['000001'], [[d0, 1000], [d1, 1200]]);
});

test('장부 한 걸음 — 못 적는 때: 판 날이 다름 · 셋 가운데 값 없는 회사 · 판 날이 아닌 값', () => {
  const d = '2026-11-12';
  const ok3 = [co('000001', '가나', d, 1000), co('000002', '다라', d, 2000), co('000003', '마바', d, 3000)];
  assert.equal(stepBook(null, T(d, rank('000001', '000002', '000003')), board('2026-11-11', ok3)).added, null, '판과 1 · 2 · 3등 날이 다름');
  assert.equal(stepBook(null, T(d, rank('000001', '000002', '000009')), board(d, ok3)).added, null, '셋 가운데 판에 없는 회사');
  assert.equal(stepBook(null, T(d, rank('000001', '000002', '000003')), board(d, [...ok3.slice(0, 2), co('000003', '마바', '2026-11-11', 3000)])).added, null, '그 날 값이 아님');
  assert.equal(stepBook(null, T(d, rank('000001', '000002', '000003').slice(0, 2)), board(d, ok3)).added, null, '둘뿐');
  assert.equal(stepBook(null, {asOf: {board: d}}, board(d, ok3)).added, null, '1 · 2 · 3등 없음');
});

test('장부 꼴 맞대기 — 셋 · 등수 차례 · 번호 · 값', () => {
  assert.ok(okBook(emptyBook()));
  assert.equal(okBook(null), false);
  assert.equal(okBook({...emptyBook(), schema: 'x'}), false);
  assert.equal(okBook({...emptyBook(), qty: 5}), false, '10주만');
  const day = picks => ({...emptyBook(), days: [{board: '2026-11-10', picks}]});
  const p = (place, code = '000001', px = 100) => ({place, k: 'hot', code, name: 'ㄱ', px});
  assert.ok(okBook(day([p(1), p(2, '000002'), p(3, '000003')])));
  assert.equal(okBook(day([p(1), p(3, '000002'), p(2, '000003')])), false, '등수 차례');
  assert.equal(okBook(day([p(1), p(2, 'ABC'), p(3, '000003')])), false, '번호 꼴');
  assert.equal(okBook(day([p(1), p(2, '000002', 0), p(3, '000003')])), false, '값 0');
  assert.equal(okBook(day([p(1), p(2, '000002')])), false, '둘');
});

test('저장된 장부 · 화면 자료 — 꼴 · 판 날 차례 · 산 값 = 값 줄의 그 판 날 값 · 같은 판(시작 장부)', () => {
  const B = JSON.parse(rd('reports/atlas11/su21/book.json')), S = JSON.parse(rd('site/su/data/su21-book.json'));
  assert.ok(okBook(B), '저장된 장부 꼴');
  const days = B.days.map(d => d.board);
  assert.deepEqual(days, [...days].sort(), '판 날 차례');
  for (const d of B.days) for (const q of d.picks) assert.equal(B.px[q.code]?.[d.board], q.px, d.board + ' ' + q.code + ' 산 값 = 값 줄');
  // 저장된 장부(reports)는 올리기 작업마다 판 날이 늘고, 저장소 화면 자료(site/su/data)는 장부 만들기가 멈출 때 쓰는 시작 판 — 화면 자료의 날 · 값은 모두 장부와 같아야 함(11-10 판이 들어오며 「같음」에서 「앞부분」으로 · 주문 0040)
  assert.equal(S.schema, SCHEMA); assert.equal(S.qty, 10);
  for (const d of S.days) assert.deepEqual(B.days.find(x => x.board === d.board), d, '화면 자료 ' + d.board + ' = 장부의 그 날');
  for (const [code, rows] of Object.entries(S.px)) for (const [dd, v] of rows) assert.equal(B.px[code]?.[dd], v, '화면 자료 값 ' + code + ' ' + dd + ' = 장부');
});

// (지움 — 주문 1115-2328 「어고쳐」: 이 시험이 보던 쪽(1 · 2 · 3등 달력 #/r/c)을 지움 · 옛 고리는 첫 쪽으로 감을 check_su.mjs ⑨ 가 잼)
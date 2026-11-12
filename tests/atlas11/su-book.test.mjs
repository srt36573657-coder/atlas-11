// 큐피트 1 · 2 · 3등 달력 · 10주씩 산 셈 장부(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
//   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐   잡스라면」)
//   장부 한 걸음(scripts/atlas11/next/su21_book.mjs) · 화면 셈(site/su/su-book.js — 그리기 도구는 빈 것으로 바꿔 셈만 봄) · 길 · 서랍 · 꾸밈 · 묶기 · 검사가 함께 바뀌었는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCHEMA, QTY, emptyBook, okBook, stepBook, siteBook} from '../../scripts/atlas11/next/su21_book.mjs';
import {forwardTo} from '../../site/su/su-data.js';
import {screenHits, ruinHits} from '../../site/next/words.js';

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

test('화면 셈 — 산 값 · 지금 · 늘고 준 것(10주씩 · 산 날부터 맨 끝 값) · 모양 · 세 칸 · 합을 흔든 줄 · 달력 한 줄 · 돈 글 · 「%」 0', async () => {
  const src = rd('site/su/su-book.js').replace("import {h, s} from '/su/su-fig.js';", 'const h = () => null, s = () => null;').replace("import {KIND} from '/su/su-21.js';", 'const KIND = {};');
  assert.ok(!/^import /m.test(src), '그리기 도구를 빈 것으로 바꿈');
  const M = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  assert.equal(M.won(4930000), '493만원'); assert.equal(M.won(104500), '10만 4,500원'); assert.equal(M.won(-4500), '4,500원'); assert.equal(M.won(123456789), '1억 2,345만 6,789원'); assert.equal(M.won(0), '0원');
  assert.equal(M.moved(104500), '10만 4,500원 늘었어요'); assert.equal(M.moved(-5000), '5,000원 줄었어요'); assert.equal(M.moved(0.2), '그대로예요');
  const C = M.bookCalc({qty: 10, asOf: '2026-11-11', days: [
    {board: '2026-11-10', seen: '2026-11-10T16:00:00+09:00', picks: [{place: 1, k: 'hot', code: '000001', name: '가나', px: 1000}, {place: 2, k: 'hot', code: '000002', name: '다라', px: 2000}, {place: 3, k: 'hot', code: '000003', name: '마바', px: 3000}]},
    {board: '2026-11-11', seen: '2026-11-11T16:00:00+09:00', picks: [{place: 1, k: 'hot', code: '000001', name: '가나', px: 1200}, {place: 2, k: 'hot', code: '000004', name: '사아', px: 4000}, {place: 3, k: 'hot', code: '000003', name: '마바', px: 3300}]}],
  px: {'000001': [['2026-11-10', 1000], ['2026-11-11', 1200]], '000002': [['2026-11-10', 2000], ['2026-11-11', 1800]], '000003': [['2026-11-10', 3000], ['2026-11-11', 3300]], '000004': [['2026-11-11', 4000]]}});
  assert.equal(C.rows.length, 6, '산 셈 여섯 번(같은 회사를 두 번 사도 두 번)');
  assert.equal(C.cost, (1000 + 2000 + 3000 + 1200 + 4000 + 3300) * 10);
  assert.equal(C.val, (1200 + 1800 + 3300 + 1200 + 4000 + 3300) * 10);
  assert.equal(C.diff, C.val - C.cost); assert.equal(C.diff, 3000);
  assert.deepEqual(C.days, ['2026-11-10', '2026-11-11']); assert.equal(C.last, '2026-11-11');
  const r = C.rows.find(x => x.day === '2026-11-11' && x.code === '000001');
  assert.deepEqual(r.ser, [['2026-11-11', 1200]], '값 줄은 그 산 날부터');
  // 다시 짬(주문 1111-0938) — 모양 · 같은 회사 몇 번째 · 세 칸 · 합을 흔든 한 줄 · 100원이 ○원(반올림이 손실을 가리지 않음) · 달력 한 줄 · 처음 보인 때
  assert.deepEqual(C.rows.map(x => x.st), ['up', 'dn', 'up', 'one', 'one', 'one'], '산 뒤 값이 없으면 「아직 하루치」(그대로로 세지 않음)');
  assert.deepEqual(C.rows.map(x => x.nth), [1, 1, 1, 2, 1, 2], '같은 회사는 산 차례로 몇 번째');
  assert.deepEqual(C.n, {up: 2, dn: 1, eq: 0, one: 3});
  assert.deepEqual(M.tiles(C.n).map(x => [x.st, x.label, x.k]), [['up', '늘었어요', 2], ['dn', '줄었어요', 1], ['one', '아직 하루치', 3]], '같은 크기 세 칸');
  assert.deepEqual(M.tiles({up: 1, dn: 1, eq: 2, one: 3}).map(x => x.label), ['늘었어요', '줄었어요', '그대로 · 하루치']);
  assert.deepEqual(M.tiles({up: 1, dn: 1, eq: 2, one: 0}).map(x => x.label), ['늘었어요', '줄었어요', '그대로']);
  const w = M.swing(C);
  assert.ok(w && w.r.code === '000003' && w.r.day === '2026-11-10' && w.d === 3000 && w.rest === 0, '합(3,000원)의 절반 넘게 움직인 한 줄(11월 10일 마바 +3,000원) · 그 줄을 빼면 0원');
  assert.equal(M.swing({rows: [{val: 110, cost: 100}, {val: 108, cost: 100}, {val: 109, cost: 100}], diff: 27}), null, '고르게 늘면 없음');
  assert.equal(M.r100(1200, 1000), '100원이 120원'); assert.equal(M.r100(1219, 1000), '100원이 121.9원'); assert.equal(M.r100(57200, 57300), '100원이 99.8원');
  assert.equal(M.r100(99990, 100000), '100원이 99.99원', '반올림으로 100원이 되면 둘째 자리'); assert.equal(M.r100(500, 500), '100원이 100원');
  assert.deepEqual(M.strip('2026-11-10'), ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-09', '2026-11-10'], '달력 한 줄 — 장이 서는 날 다섯(주말 뺌)');
  assert.deepEqual(M.seenKo('2026-11-09T16:20+09:00'), {day: '2026-11-09', text: '11월 9일 오후 4시 20분'});
  assert.deepEqual(M.seenKo('2026-11-10T08:13:33.584Z'), {day: '2026-11-10', text: '11월 10일 오후 5시 13분'}, '받은 때가 세계 표준 시각이어도 한국 시각으로');
  assert.equal(M.seenKo('2026-11-11T00:05:00+09:00').text, '11월 11일 오전 12시 5분'); assert.equal(M.seenKo('?'), null);
  assert.equal(M.yRange(C), 20, '가장 멀리 간 값(100원이 120원)으로 눈금 — 아직 하루치는 셈에서 뺌');
  assert.equal(M.yRange({rows: [{one: false, buy: 100, ser: [['d', 100], ['e', 121.9]]}]}), 25, '5 단위로 올림'); assert.equal(M.yRange({rows: [{one: false, buy: 100, ser: [['d', 100], ['e', 102]]}]}), 10, '눈금은 10 밑으로 안 줄임');
  // 돈 셈 한눈에(주문 1112-1304 「지금까지 총 매수한 금액이 얼마고 그담에 날짜별로 매수한 금액이 얼마여 가지고 순실이나 수익이 어떻게 됐는지 … 바보도 알 수 있게끔」)
  //   지금까지(모두 더함) · 날짜마다(그날 셋을 더함 · 날 차례) · 날짜마다를 다 더하면 지금까지 · 늘었나 줄었나 칸 글 · 판 돈 줄 · 줄마다 ○원어치 · 세 회사 이름(붙는 띄어쓰기)
  const S = M.sumOf(C.rows);
  assert.deepEqual([S.cost, S.val, S.diff, S.one, S.st], [145000, 148000, 3000, false, 'up'], '지금까지 — 산 돈 · 지금 · 늘고 준 돈 = 화면 셈 모두(C.cost · C.val · C.diff)');
  assert.equal(S.cost, C.cost); assert.equal(S.val, C.val);
  const D = M.dayCalc(C);
  assert.deepEqual(D.map(x => [x.day, x.cost, x.val, x.diff, x.st, x.one, x.rows.map(r => r.place).join('')]), [['2026-11-10', 60000, 63000, 3000, 'up', false, '123'], ['2026-11-11', 85000, 85000, 0, 'one', true, '123']], '날짜마다 — 그날 셋을 더함(늦게 산 같은 회사는 그날 줄로 · 아직 하루치 날은 one)');
  assert.equal(D.reduce((a, x) => a + x.cost, 0), S.cost, '날짜마다 산 돈을 다 더하면 지금까지 산 돈'); assert.equal(D.reduce((a, x) => a + x.diff, 0), S.diff, '날짜마다 늘고 준 돈을 다 더하면 지금까지');
  assert.deepEqual(M.sumOf([]), {cost: 0, val: 0, diff: 0, one: false, st: 'eq'}, '빈 줄');
  assert.equal(M.sumOf([{cost: 100, val: 100.4, one: false}]).st, 'eq', '반올림한 원으로 그대로(moved 와 같은 잣대)');
  assert.equal(M.resText({st: 'one'}), '아직 하루치'); assert.equal(M.resText({st: 'eq', diff: 0.2}), '그대로'); assert.equal(M.resText({st: 'dn', diff: -375100}), '37만 5,100원'); assert.equal(M.resText({st: 'up', diff: 2000}), '2,000원');
  assert.deepEqual(M.monText({cost: 2390000, val: 2040000, one: false}, 10), ['10주 239만원어치', '35만원 줄었어요'], '줄마다 산 돈(10주 ○원어치) · 늘고 준 돈 두 줄');
  assert.deepEqual(M.monText({cost: 79900, val: 79900, one: true}, 10), ['10주 7만 9,900원어치', '아직 하루치예요']);
  assert.deepEqual(M.boardMoney(D[0]), ['산 돈 6만원 → 지금 6만 3,000원', '3,000원 늘었어요'], '판 돈 줄 — 산 돈 → 지금 · 늘고 준 돈');
  assert.deepEqual(M.boardMoney(D[1]), ['산 돈 8만 5,000원', '아직 하루치예요'], '아직 하루치 판은 산 돈만');
  assert.deepEqual(M.nameBits([{name: 'CJ ENM'}, {name: '한진칼'}, {name: '루닛'}]), ['CJ ENM ·', '한진칼 ·', '루닛'], '세 회사 이름 조각 — 점은 앞 이름에 붙음(줄은 조각 사이에서만 · 글은 보통 띄어쓰기라 이름 맞대기 · 영어 글자 셈이 그대로)');
  assert.equal(M.nameBits([{name: 'CJ ENM'}, {name: '한진칼'}, {name: '루닛'}]).join(' '), 'CJ ENM · 한진칼 · 루닛');
  // 화면 글에 「%」 · 쓰지 않을 말 0(셈 글 · 꾸밈 글)
  const said = [...src.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).join(' ');
  assert.ok(!said.includes('%'), '「%」 없음');
  assert.deepEqual([...screenHits(said), ...ruinHits(said)].map(x => x.word ?? x), [], '쓰지 않을 말 0');
});

test('돈 셈 한눈에(주문 1112-1304) — 맨 위 지금까지 → 날짜마다 → 세 칸 → 달력 → 판 · 판마다 돈 줄 · 모양 + 글 · 돈 글은 글 색', () => {
  const bk = rd('site/su/su-book.js'), css = rd('site/su/su-book.css');
  const at = k => bk.indexOf(k, bk.indexOf('const hero = h('));
  assert.ok(at('moneyCard(C)') > 0 && at('moneyCard(C)') < at('ledger(C, go)') && at('ledger(C, go)') < at("'bk-sum'") && at("'bk-sum'") < at('    cal,') && at('    cal,') < at("'bk-list'"), '차례 — 지금까지 → 날짜마다 → 산 셈 하나씩(세 칸) → 달력 → 판');
  assert.ok(bk.includes("h('b', {text: '지금까지'})") && bk.includes("h('span', {text: '산 돈'})") && bk.includes("h('span', {text: '지금'})") && bk.includes("' 값까지'"), '지금까지 — 산 돈 · 지금 · ○월 ○일 값까지');
  assert.ok(bk.includes("'고른 날 · 고른 셋'") && bk.includes("'늘었나 줄었나'") && bk.includes("cells('모두', T)") && /recent\.map\(dayRow\), mons/.test(bk), '날짜마다 — 표 머리 · 새 날 다섯 · 달마다 접음 · 맨 아래 모두');
  assert.ok(/h\('p', \{class: 'bk-bmon'[^\n]*shapeOf\(S\.st\)/.test(bk), '판마다 돈 줄 — 모양 + 글');
  assert.ok(/\.bk-mres \{[^}]*font-size: 24px/.test(css) && !/\.bk-mres[^{]*\.bk-r(up|dn)/.test(css) && !/\.bk-(dcost|ddiff|ml b|mres) \{[^}]*color: #D97706/.test(css), '늘어도 줄어도 같은 크기 · 같은 굵기 · 돈 글은 글 색(호박색은 모양에만)');
  assert.ok(!/sort\([^)]*diff/.test(bk) && !/sort\([^)]*\.val/.test(bk), '늘고 준 크기 차례 0(수익 순위 0 — 본질 망치는 길)');
});

test('길 · 서랍 · 꾸밈 · 모든 사람(주문 1513) · 묶기 · 검사(주문 0938)', () => {
  const su = rd('site/su/su.js'), bk = rd('site/su/su-book.js'), css = rd('site/su/su-book.css'), pk = rd('scripts/atlas11/package.mjs'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.equal(forwardTo('', '#/r/c'), null, '#/r/c — 큐피트 안');
  assert.ok(/return \{title: T, tab: 4, step: null, kick: [^\n]*, h1: T, proper: false, hero, body: \[how\],\n/.test(bk), '달력 쪽은 탭 4(달력)가 켜짐 · 큰 숫자 · 달력(hero) · 「이렇게 셌어요」(body)가 한 줄에 그대로 — 주문 0040(줄 끝 풀이 글이 hero 를 가린 틀림 장부 201)');
  assert.ok(su.includes("a === 'c' ? await (await import('/su/su-book.js')).vBook(X21)"), '길 #/r/c');
  assert.ok(su.includes("drawer('#/r/c', '1 · 2 · 3등 달력', '10주씩', '뽑힌 날부터 산 셈 · 가짜 돈')") && /su-drawers[\s\S]{0,400}drawer\('#\/r\/c'[\s\S]{0,300}drawer\('#\/r\/m'/.test(su), '기록 쪽 서랍 맨 앞 — 모든 사람(주문 1513)');
  assert.ok(!/ownerBook|su-oslot/.test(su), '사장님 기기 서랍 자리(빈 자리) 0 — 모든 사람에게 같은 서랍');
  assert.ok(!/ownerOk|api\/jinhwa\/me|atlas11:invite:owner|data-owner|bk-lock/.test(bk), '사장님 열쇠 문 0 — 모든 사람에게 같은 화면(주문 1513 「모든사람 휴대폰에 열리게 해」)');
  assert.ok(![...bk.matchAll(/'([^'\n]*)'/g)].some(m => m[1].includes('사장님 휴대폰')), '화면 글에 「사장님 휴대폰에서만」 0');
  assert.ok(!/\bstyle:/.test(bk) && !/\.style\b/.test(bk) && !/innerHTML/.test(bk), '글 속 꾸밈(보안 규칙 style-src) · innerHTML 0');
  assert.ok(/export const CSS = '\/su\/su-book\.css'/.test(bk) && fs.existsSync(path.join(ROOT, 'site/su/su-book.css')), '꾸밈 파일');
  for (const [k, px] of [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map(m => [m[0], +m[1]])) assert.ok(px >= 17, '글 17px 넘게 — ' + k);
  assert.ok(/\.bk-d \{[^}]*min-height: 62px/.test(css) && /\.bk-row \{[^}]*min-height: 48px/.test(css) && /\.bk-hs \{[^}]*min-height: 48px/.test(css) && /\.bk-sps \{[^}]*min-height: 48px/.test(css) && /\.bk-olds \{[^}]*min-height: 56px/.test(css) && /\.bk-drow \{[^}]*min-height: 56px/.test(css), '누르는 곳 48 넘게(달력 칸 · 줄 · 접힌 칸 · 날짜마다 줄 — 주문 1112-1304)');
  assert.ok(!/<text|'text'/.test(bk.slice(bk.indexOf('function spark'), bk.indexOf('const axisOf'))) && /viewBox: '0 0 20 20'/.test(bk), '그림 속 글자 0 · 모양은 도형(글꼴마다 넓이가 다른 글자 대신)');
  assert.ok(/const RECENT = 5;/.test(bk) && bk.includes('function monthFold') && bk.includes("'처음 보인 때 '") && bk.includes("'같은 회사 '") && !bk.includes("import {KIND}"), '다섯 판만 펴고 달마다 접음 · 처음 보인 때 · 같은 회사 몇 번째(주문 1111-0938)');
  assert.ok(pk.includes("'scripts/atlas11/next/su21_book.mjs'") && /su21_book\.mjs[\s\S]{0,400}\.\.\.\(keepJob \? \['--keep'\] : \[\]\)/.test(pk), '묶기 — 판마다 장부 · 올리기 작업만 저장');
  assert.ok(ck.includes("'#/r/c'") && ck.includes('㉑ 1 · 2 · 3등 장부 자료') && ck.includes('「사장님 휴대폰에서만」 글 0') && !/ATLAS_DEV_OWNER_KEY[\s\S]{0,200}1 · 2 · 3등 달력/.test(ck.slice(ck.indexOf('㉑ 1 · 2 · 3등 달력(주문 0938'))) && ck.includes('같은 크기 세 칸(산 셈 하나씩)') && ck.includes('첫 화면에 종목 이름') && ck.includes('맨 위 「지금까지」') && ck.includes('날짜마다 — 새 날이 위') && ck.includes('날짜마다 줄을 누르면 그날 고른 셋으로') && ck.includes('function bookMoney(BK)') && ck.includes('달력 날을 누르면 그 판으로') && ck.includes('판 차례 — 새 판이 위') && /#\\\/r\\\/\[mwdynkics\]/.test(ck), '검사 ㉑ · 고리 꼴');
});

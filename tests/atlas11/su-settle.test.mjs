// 큐피트 정산(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야
//   거기에 일 이 삼 등 매일 사 그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」)
//   장부(scripts/atlas11/next/su21_settle.mjs) · 화면 셈(site/su/su-settle.js — 그리기 도구는 빈 것으로 바꿔 셈만 봄) · 탭 · 길 · 묶기 · 검사가 함께 바뀌었는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCHEMA, BOOK_SCHEMA, QTY, KINDS, S36, START, emptySettle, okSettle, listsOf, stepSettle, siteSettle, runsOf, markRuns} from '../../scripts/atlas11/next/su21_settle.mjs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {forwardTo} from '../../site/su/su-data.js';
import {screenHits, ruinHits} from '../../site/next/words.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const C = (...cs) => cs.map(code => ({code}));
const d21 = end => Array.from({length: 21}, (_, i) => { const d = new Date(Date.parse(end + 'T00:00:00Z') - (20 - i) * 864e5); return d.toISOString().slice(0, 10); });

test('여덟 묶음 차례 · 장부 꼴', () => {
  assert.deepEqual([...KINDS].slice(0, 8), ['top3', 'hot', 'bloom', 'money', 'quiet', 'hotNext', 'bloomNext', 'moneyNext'], '1 · 2 · 3등 · 불장 · 꽃 · 돈 · 조용한 힘 · 될 듯 셋(산 셈 줄 묶음 번호 그대로)');
  assert.equal(S36.length, 36); assert.deepEqual([S36[0], S36[35]], ['g01', 'g36'], '서른여섯 꾀(주문 1113-2224 · 삼십육계 차례)');
  assert.deepEqual([...KINDS].slice(8), [...S36, 'ovl'], '여덟 뒤에 서른여섯 꾀 · 맨 뒤 겹친 곳(주문 1114-0802) · 특징 열하나(t_) 0');
  assert.ok(okSettle({...emptySettle(), ovl: {'2026-11-13': ['000001', '000002']}}) && !okSettle({...emptySettle(), ovl: {'2026-11-13': ['x']}}) && okSettle({...emptySettle(), ovl: undefined}), '겹친 곳 장부 꼴(없어도 읽음)');
  assert.ok(!okSettle({...emptySettle(), s36: {'2026-11-13': {nope: ['000001']}}}), '꾀 이름 꼴');
  assert.ok(okSettle({...emptySettle(), s36: {'2026-11-13': {g05: ['000001']}}}));
  assert.ok(okSettle({...emptySettle(), t11: {'2026-11-13': {herd: ['000001']}}}), '옛 특징 열하나 기록이 든 장부도 읽음(읽으면 지움)');
  assert.equal(QTY, 10); assert.equal(SCHEMA, 'su21-settle-1');
  const e = emptySettle();
  assert.equal(e.schema, BOOK_SCHEMA); assert.ok(okSettle(e));
  assert.ok(!okSettle({...e, qty: 5}), '10주가 아니면 장부가 아님');
  assert.ok(!okSettle({...e, px: {'000001': {'2026-11-12': -1}}}), '값은 0보다 큼');
  assert.ok(!okSettle({...e, quiet: {'2026-11-12': ['abc']}}), '번호 꼴');
});

test('날마다 목록 — 여섯은 days.json · 그날 기록이 없으면 su21 목록 · 1 · 2 · 3등 = 달력 장부(등수 차례) · 조용한 힘 = 장부', () => {
  const days = {days: {
    '2026-11-05': {how: 'replay', lists: {hot: ['000001', 'BAD', '000002'], bloom: ['000003'], money: [], hotNext: ['000004'], bloomNext: ['000005'], moneyNext: ['000006']}},
    '2026-11-06': {how: 'kept', lists: {hot: ['000002'], bloom: ['000003'], money: ['000001'], hotNext: [], bloomNext: [], moneyNext: []}}}};
  const sbook = {days: [{board: '2026-11-06', picks: [{place: 2, code: '000002'}, {place: 1, code: '000001'}, {place: 3, code: '000003'}]}]};
  const su = {asOf: {board: '2026-11-07'}, lists: {hot: C('000007'), bloom: C('000001'), money: C('000002'), quiet: C('000008'), hotNext: C('000099')}};
  const suNext = {lists: {hotNext: C('000009'), bloomNext: C('000010'), moneyNext: C('000011')}};
  const L = listsOf({days, sbook, su, suNext, quiet: {'2026-11-07': ['000008']}, start: '2026-11-01'});
  assert.deepEqual(Object.keys(L), ['2026-11-05', '2026-11-06', '2026-11-07'], '날 차례');
  assert.deepEqual(L['2026-11-05'], {hot: ['000001', '000002'], bloom: ['000003'], hotNext: ['000004'], bloomNext: ['000005'], moneyNext: ['000006']}, '빈 목록 · 번호 꼴이 아닌 것은 뺌');
  assert.deepEqual(L['2026-11-06'], {hot: ['000002'], bloom: ['000003'], money: ['000001'], top3: ['000001', '000002', '000003']}, '1 · 2 · 3등은 등수 차례');
  assert.deepEqual(L['2026-11-07'], {hot: ['000007'], bloom: ['000001'], money: ['000002'], hotNext: ['000009'], bloomNext: ['000010'], moneyNext: ['000011'], quiet: ['000008']}, '그날 기록이 없으면 su21(될 듯은 su21-next)');
  // 그날 기록이 있으면 su21 목록을 쓰지 않음
  const L2 = listsOf({days: {days: {...days.days, '2026-11-07': {how: 'kept', lists: {hot: ['000012']}}}}, sbook, su, suNext, quiet: {}, start: '2026-11-01'});
  assert.deepEqual(L2['2026-11-07'], {hot: ['000012']});
});

test('장부 한 걸음 — 조용한 힘 그날 한 번 · 이름 · 업종 · 값(달력 장부 → 저장된 판 → 오늘 판 · 21 값은 날이 맞을 때만) · 한 번 적은 값은 그대로', () => {
  const D0 = '2026-11-06', D1 = '2026-11-07', cd = d21(D1);
  const days = {days: {[D0]: {how: 'replay', lists: {hot: ['000001', '000002'], bloom: ['000003']}}}};
  const sbook = {days: [{board: D0, picks: [{place: 1, code: '000001'}, {place: 2, code: '000004'}, {place: 3, code: '000003'}]}], px: {'000001': [[D0, 1000]], '000004': [[D0, 4000]], '000003': [[D0, 3000]]}};
  const su = {asOf: {board: D1}, lists: {hot: [{code: '000002', cd}], bloom: C('000005'), money: [], quiet: C('000006', '000007')}};
  const stored = {[D0]: {asOf: D0, companies: [{code: '000001', name: '가나', date: D0, close: 1005, group: {industry: '반도체'}}, {code: '000002', name: '다라', date: D0, close: 2000, group: {industry: '화학'}}, {code: '000003', name: '마바', date: D0, close: 3010, group: {label: '은행'}}]}};
  const c21 = base => cd.map((_, i) => base + i);
  const board = {asOf: D1, companies: [
    {code: '000002', name: '다라', date: D1, close: 2020, c: c21(1900), cFrom: cd[0], group: {industry: '화학'}},
    {code: '000005', name: '사아', date: D1, close: 5000, group: {industry: '조선'}},
    {code: '000006', name: '자차', date: D1, close: 6000, c: c21(5800), cFrom: cd[1], group: {industry: '철강'}},
    {code: '000007', name: '카타', date: D1, close: 7000},
    {code: '000099', name: '파하', date: D1, close: 9900, group: {industry: '없음'}}]};
  const frozen = JSON.stringify({sbook, stored, board});
  const {book, added, lists} = stepSettle(null, {su, board, stored, sbook, days, start: '2026-10-01'});
  assert.ok(okSettle(book)); assert.equal(added, D1);
  assert.deepEqual(book.quiet, {[D1]: ['000006', '000007']}, '조용한 힘 일곱은 그날 판 날로');
  assert.deepEqual(Object.keys(lists), [D0, D1]);
  assert.deepEqual(book.co['000001'], ['가나', '반도체'], '이름 · 업종 = 저장된 판(오늘 판에 없으면)');
  assert.deepEqual(book.co['000003'], ['마바', '은행'], '업종이 없으면 묶음 이름');
  assert.deepEqual(book.co['000007'], ['카타', null], '업종을 모르면 비움');
  assert.equal(book.co['000099'], undefined, '어느 묶음에도 없는 회사는 적지 않음');
  assert.equal(book.px['000001'][D0], 1000, '달력 장부 값이 먼저(저장된 판 1005 가 아님)');
  assert.equal(book.px['000002'][D0], 2000, '저장된 판 마지막 값');
  assert.equal(book.px['000003'][D0], 3000, '1 · 2 · 3등은 달력과 같은 값');
  assert.equal(book.px['000002'][D1], 2020, '오늘 판 마지막 값');
  assert.equal(book.px['000002'][cd[5]], 1905, '21 값 — su21 cd 끝 날 = 오늘 판 날 · 회사 cFrom = cd 첫날이면 채움');
  assert.equal(book.px['000002'][D0], 2000, '21 값이 먼저 적은 값을 덮지 않음');
  assert.deepEqual(Object.keys(book.px['000006']), [D1], 'cFrom 이 다르면 21 값을 쓰지 않음');
  assert.equal(book.px['000099'], undefined, '어느 묶음에도 없는 회사 값은 적지 않음');
  assert.equal(JSON.stringify({sbook, stored, board}), frozen, '들어온 자료는 바뀌지 않음');
  // 다음 걸음 — 같은 날 조용한 힘이 달라져도 처음 것 그대로 · 같은 날 값이 달라져도 처음 값 그대로 · 들어온 장부는 바뀌지 않음
  const b0 = JSON.stringify(book);
  const s2 = stepSettle(book, {su: {...su, lists: {...su.lists, quiet: C('000008')}}, board: {...board, companies: board.companies.map(c => ({...c, close: c.close + 1}))}, stored, sbook, days, start: '2026-10-01'});
  assert.equal(s2.added, null); assert.deepEqual(s2.book.quiet, book.quiet); assert.equal(s2.book.px['000002'][D1], 2020);
  assert.equal(JSON.stringify(book), b0);
  // 21 값 — su21 cd 끝 날이 오늘 판 날과 다르면 채우지 않음
  const s3 = stepSettle(null, {su: {...su, lists: {...su.lists, hot: [{code: '000002', cd: d21('2026-11-05')}]}}, board, stored, sbook, days, start: '2026-10-01'});
  assert.deepEqual(Object.keys(s3.book.px['000002']), [D0, D1]);
});

test('화면 자료 — 산 셈 줄(날 · 묶음 · 번호 · 산 값) · 값 없는 산 셈은 세지 않고 수만 · 지금 = 판 날까지 가장 늦은 값 · 다시 센 날 끝', () => {
  const B = {...emptySettle(), co: {'000001': ['가나', '반도체'], '000002': ['다라', null], '000003': ['마바', '은행']},
    px: {'000001': {'2026-11-05': 1000, '2026-11-06': 1100, '2026-11-09': 1300}, '000002': {'2026-11-06': 2000}, '000003': {'2026-11-05': 3000}}};
  const L = {'2026-11-05': {hot: ['000001', '000003'], bloom: ['000002']}, '2026-11-06': {top3: ['000002', '000001'], moneyNext: ['000001']}, '2026-11-09': {hot: ['000003']}};
  const days = {days: {'2026-11-05': {how: 'replay'}, '2026-11-06': {how: 'kept'}}};
  const S = siteSettle(B, L, '2026-11-06', days, '2026-11-01');
  assert.equal(S.start, '2026-11-01');
  assert.equal(S.schema, SCHEMA); assert.equal(S.qty, 10); assert.equal(S.asOf, '2026-11-06'); assert.deepEqual(S.kinds, [...KINDS]);
  assert.deepEqual(S.buys, [['2026-11-05', 1, '000001', 1000], ['2026-11-05', 1, '000003', 3000], ['2026-11-06', 0, '000002', 2000], ['2026-11-06', 0, '000001', 1100], ['2026-11-06', 7, '000001', 1100]],
    '날 차례 · 묶음 차례 · 목록 차례 · 판 날 뒤 날은 뺌');
  assert.deepEqual(S.miss, {top3: 0, hot: 0, bloom: 1, money: 0, quiet: 0, hotNext: 0, bloomNext: 0, moneyNext: 0, ...Object.fromEntries(S36.map(k => [k, 0])), ovl: 0}, '11월 5일 꽃 000002 는 그날 값이 없음');
  assert.deepEqual(S.now, {'000001': [1100, '2026-11-06'], '000002': [2000, '2026-11-06'], '000003': [3000, '2026-11-05']}, '지금 = 판 날까지 가장 늦은 값(판 날 뒤 값은 안 씀)');
  assert.deepEqual(S.from, {hot: '2026-11-05', top3: '2026-11-06', moneyNext: '2026-11-06'});
  assert.equal(S.replayTo, '2026-11-05');
  assert.deepEqual(S.co, {'000001': ['가나', '반도체'], '000002': ['다라', null], '000003': ['마바', '은행']});
  assert.ok(!JSON.stringify(S).includes('%'));
});

test('새로 시작(주문 1112-2042 「정산을 오늘 부터 한다 그동안에 기록은 다 지운다」) — 첫날 11월 12일 · 그 전 조용한 힘 · 값 · 이름 지움 · 묵은 su21 로 조용한 힘을 적지 않음', () => {
  assert.equal(START, '2026-11-12', '받은 날 판');
  const book0 = {...emptySettle(), quiet: {'2026-11-06': ['000001'], '2026-11-12': ['000007']},
    px: {'000001': {'2026-11-06': 100, '2026-11-12': 110}, '000002': {'2026-11-11': 200}, '000007': {'2026-11-12': 700}, '000009': {'2026-11-05': 900}},
    co: {'000001': ['가나', '반도체'], '000002': ['다라', null], '000007': ['카타', '은행'], '000009': ['파하', null]}};
  const days = {days: {'2026-11-05': {how: 'replay', lists: {hot: ['000009']}}, '2026-11-11': {how: 'kept', lists: {hot: ['000002']}}, '2026-11-12': {how: 'kept', lists: {hot: ['000001'], bloom: ['000003']}}}};
  const sbook = {days: [{board: '2026-11-11', picks: [{place: 1, code: '000002'}]}, {board: '2026-11-12', picks: [{place: 1, code: '000001'}]}], px: {'000002': [['2026-11-11', 200]], '000001': [['2026-11-12', 110]]}};
  const board = {asOf: '2026-11-12', companies: [{code: '000001', name: '가나', date: '2026-11-12', close: 110, group: {industry: '반도체'}}, {code: '000003', name: '마바', date: '2026-11-12', close: 300}]};
  const stale = {asOf: {board: '2026-11-06'}, lists: {quiet: C('000008')}};
  const frozen = JSON.stringify(book0);
  const {book, added, lists, cut} = stepSettle(book0, {su: stale, board, stored: {}, sbook, days});
  assert.equal(added, null, 'su21 판 날(11월 6일)이 오늘 판 날과 달라 조용한 힘을 적지 않음');
  assert.deepEqual(book.quiet, {'2026-11-12': ['000007']}, '첫날 전 조용한 힘은 지움');
  assert.deepEqual(Object.keys(lists), ['2026-11-12'], '첫날 전 목록(다시 센 날 · 그날 적은 날 · 달력)은 정산에 안 들어감');
  assert.deepEqual(lists['2026-11-12'], {hot: ['000001'], bloom: ['000003'], top3: ['000001'], quiet: ['000007']});
  assert.deepEqual(book.px, {'000001': {'2026-11-12': 110}, '000003': {'2026-11-12': 300}, '000007': {'2026-11-12': 700}}, '첫날 전 값은 지움 · 첫날 값만');
  assert.deepEqual(Object.keys(book.co).sort(), ['000001', '000003', '000007'], '쓰지 않는 회사 이름은 지움');
  assert.deepEqual(cut, {quiet: 1, px: 3, co: 2});
  assert.equal(JSON.stringify(book0), frozen, '들어온 장부는 바뀌지 않음');
  const S = siteSettle(book, lists, board.asOf, days);
  assert.equal(S.start, START); assert.equal(S.replayTo, null, '다시 센 지난 날 없음');
  assert.ok(S.buys.length === 4 && S.buys.every(b => b[0] === '2026-11-12'), '첫날 산 셈만');
  assert.deepEqual(S.from, {top3: '2026-11-12', hot: '2026-11-12', bloom: '2026-11-12', quiet: '2026-11-12'});
  // 다음 날 — su21 판 날 = 오늘 판 날이면 조용한 힘을 적음
  const s2 = stepSettle(book, {su: {asOf: {board: '2026-11-13'}, lists: {quiet: C('000005')}}, board: {asOf: '2026-11-13', companies: []}, stored: {}, sbook, days});
  assert.equal(s2.added, '2026-11-13'); assert.deepEqual(s2.book.quiet, {'2026-11-12': ['000007'], '2026-11-13': ['000005']});
});

test('서른여섯 꾀(주문 1113-2224 「36가지 유형 … 정산하고 연결 … 7가지」) — 판 날 = 자료 날일 때만 적음 · 꾀마다 처음 빈 목록이 아닐 때 한 번 · 10주씩 산 셈 · 첫날 전은 지움 · 특징 열하나 기록은 지움', () => {
  const D1 = '2026-11-13', C7 = n => Array.from({length: 7}, (_, i) => ({code: String(n * 10 + i + 100000).padStart(6, '0').slice(-6)}));
  const board = {asOf: D1, companies: C7(1).concat(C7(2)).map((c, i) => ({...c, name: '회사' + i, date: D1, close: 1000 + i}))};
  const s36 = {rule: 's36-v1', asOf: {board: D1, data: D1}, lists: {g04: C7(1), g31: C7(2), g13: []}};
  const su = {asOf: {board: '2026-11-06'}, lists: {}};
  const {book, added36, lists} = stepSettle(null, {su, board, stored: {}, sbook: {days: []}, days: {days: {}}, s36, start: '2026-11-12'});
  assert.deepEqual(added36, ['g04', 'g31'], '빈 목록(거래량 다섯 — 받지 못한 날)은 적지 않음');
  assert.deepEqual(Object.keys(book.s36), [D1]); assert.deepEqual(book.s36[D1].g04, C7(1).map(c => c.code));
  assert.deepEqual(Object.keys(lists[D1]).sort(), ['g04', 'g31']);
  const S = siteSettle(book, lists, D1, {days: {}}, '2026-11-12');
  assert.equal(S.buys.length, 14); assert.ok(S.buys.every(b => b[0] === D1 && /^g\d\d$/.test(KINDS[b[1]]) && b[3] >= 1000), '판 마지막 값으로 산 셈');
  assert.deepEqual(S.from, {g04: D1, g31: D1});
  // 같은 날 다시 — 거래량을 받아 풀 쳐서 뱀 놀래기가 차면 그 꾀만 더함 · 먼저 적은 꾀는 그대로
  const s2 = stepSettle(book, {su, board, stored: {}, sbook: {days: []}, days: {days: {}}, s36: {...s36, lists: {g04: C7(2), g13: C7(1)}}, start: '2026-11-12'});
  assert.deepEqual(s2.added36, ['g13']); assert.deepEqual(s2.book.s36[D1].g04, C7(1).map(c => c.code), '먼저 적은 꾀는 그대로');
  // 자료 날이 판 날과 다르면(묵은 자료로 센 날) 적지 않음 · 판 날이 오늘 판과 달라도 적지 않음
  assert.deepEqual(stepSettle(null, {su, board, stored: {}, sbook: {days: []}, days: {days: {}}, s36: {...s36, asOf: {board: D1, data: '2026-10-13'}}, start: '2026-11-12'}).added36, []);
  assert.deepEqual(stepSettle(null, {su, board, stored: {}, sbook: {days: []}, days: {days: {}}, s36: {...s36, asOf: {board: '2026-11-12', data: '2026-11-12'}}, start: '2026-11-12'}).added36, []);
  // 첫날 전 꾀 기록은 지움 · 옛 특징 열하나 기록은 모두 지움(「11 가지로 하지 말고」)
  const old = {...emptySettle(), s36: {'2026-11-10': {g01: ['000001']}, [D1]: {g01: ['000002']}}, t11: {[D1]: {herd: ['000003']}}};
  const so = stepSettle(old, {su, board, stored: {}, sbook: {days: []}, days: {days: {}}, start: '2026-11-12'});
  assert.deepEqual(Object.keys(so.book.s36), [D1]); assert.equal(so.book.t11, undefined); assert.equal(so.cut.t11, 1);
  assert.ok(Object.values(so.lists).every(x => Object.keys(x).every(k => !k.startsWith('t_'))), '산 셈에 특징 열하나 0');
});

test('며칠째(주문 1114-0151 「301 게 이게 며칠째 이렇게 됐는지도 좀 기록」) — 장부 서른여섯 꾀 · 조용한 힘 기록으로 회사마다 이어진 날 · 첫 발견 · 기록 첫날까지면 since · 판 날이 같을 때만 붙임', () => {
  const B = {...emptySettle(),
    s36: {'2026-11-12': {g01: ['000001', '000002'], g13: ['000009']}, '2026-11-13': {g01: ['000001', '000003']}, '2026-11-16': {g01: ['000001', '000003', '000004'], g13: ['000009']}},
    quiet: {'2026-11-12': ['000005'], '2026-11-13': ['000005', '000006'], '2026-11-16': ['000005', '000006']}};
  const trade = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-16'];
  const R = runsOf(B, trade, '2026-11-16');
  assert.deepEqual(R.s36.g01, {'000001': {days: 3, found: '2026-11-12', since: true}, '000003': {days: 2, found: '2026-11-13', since: false}, '000004': {days: 1, found: '2026-11-16', since: false}}, '11월 12 · 13 · 16일 이어짐(주말은 장이 열린 날이 아님)');
  assert.deepEqual(R.s36.g13, {'000009': {days: 1, found: '2026-11-16', since: false}}, '13일에 그 꾀 기록이 없으면 끊김(거래량 다섯 — 받지 못한 날)');
  assert.deepEqual(R.quiet, {'000005': {days: 3, found: '2026-11-12', since: true}, '000006': {days: 2, found: '2026-11-13', since: false}});
  assert.deepEqual([R.from36, R.fromQ], ['2026-11-12', '2026-11-12'], '기록 첫날');
  const g = {asOf: {board: '2026-11-16'}, lists: {g01: [{code: '000001'}, {code: '000003'}, {code: '000007'}]}}, su = {asOf: {board: '2026-11-16'}, lists: {quiet: [{code: '000005'}, {code: '000006'}]}};
  assert.deepEqual(markRuns(R, g, su, '2026-11-16'), {n36: 3, nq: 2, no: 0});
  assert.deepEqual(g.lists.g01.map(c => c.days ?? null), [3, 2, 1], '오늘 든 것은 화면 목록 · 지난 날은 장부(장부 오늘 목록에 없어도 오늘부터 셈)'); assert.equal(g.daysFrom, '2026-11-12');
  assert.deepEqual(su.lists.quiet.map(c => c.days), [3, 2]); assert.deepEqual(su.quietDays, {from: '2026-11-12'});
  const g2 = {asOf: {board: '2026-11-13'}, lists: {g01: [{code: '000001'}]}};
  assert.deepEqual(markRuns(R, g2, null, '2026-11-16'), {n36: 0, nq: 0, no: 0}, '판 날이 다르면 붙이지 않음'); assert.equal(g2.lists.g01[0].days, undefined);
  assert.ok(/'--cal', path\.join\(dd, 'days\.json'\)/.test(rd('scripts/atlas11/package.mjs')), '묶을 때 장이 열린 날을 넘김');
  const ap = rd('site/su/su-apple.js');
  assert.ok(ap.includes("h('span', {class: 's36-cd', text: dz + '일째'})") && ap.includes("it.qd ? T(x + 6, y + 154 + o, it.qd + '일째', 'sa-days sa-qd', {'font-size': 17}) : null") && ap.includes("' 며칠째는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.'"), '처음 쪽 — 꾀 단추 · 조용한 힘 칸마다 며칠째 · 기록 첫날');
});

test('서른여섯 꾀 셈(su21_s36.py 스스로 시험 · 이름 = 화면 · 검사) · 거래량 받기(su21_vol.mjs — 꾸민 일봉) · 묶기는 올리기 작업만 받음', async () => {
  const py = execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--selftest'], {cwd: path.join(ROOT, 'scripts/atlas11/next'), encoding: 'utf8'});
  assert.match(py, /^ok 252/, py);
  const defs = JSON.parse(execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--defs'], {cwd: path.join(ROOT, 'scripts/atlas11/next'), encoding: 'utf8'}));
  assert.deepEqual(defs.kinds, [...S36]); assert.equal(defs.han.g01, '만천과해'); assert.equal(defs.han.g36, '주위상'); assert.deepEqual(Object.keys(defs.by).sort(), ['g08', 'g13', 'g19', 'g29', 'g32']);
  const {M} = await pageMods();
  for (const k of S36) { assert.equal(M.KIND_NAME[k], defs.name[k], k + ' 쉬운 이름 = 셈'); assert.equal(M.S36_HAN[k], defs.han[k]); assert.equal(M.S36_MEAN[k], defs.mean[k]); assert.equal(M.S36_SAY[k], defs.say[k]); }
  assert.deepEqual([...M.BYVOL].sort(), Object.keys(defs.by).sort(), '거래량 다섯 = 셈');
  const ck = rd('scripts/atlas11/next/check_su.mjs');
  for (const k of S36) assert.ok(ck.includes(`${k}: '${defs.name[k]}'`), k + ' 검사 이름 = 셈');
  for (const t of [...Object.values(defs.name), ...Object.values(defs.mean), ...Object.values(defs.say), ...Object.values(defs.han)]) assert.ok(!t.includes('%') && !/[A-Za-z]/.test(t), t);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'su21vol-')), fx = path.join(dir, 'fx'); fs.mkdirSync(fx);
  fs.writeFileSync(path.join(fx, '005930.xml'), '<?xml version="1.0" encoding="EUC-KR" ?>\n<protocol>\n<chartdata symbol="005930" name="x" count="2" timeframe="day" precision="0" origintime="19900103">\n<item data="20261112|105|115|100|110|2000" />\n<item data="20261113|110|120|100|115|3000" />\n</chartdata>\n</protocol>\n');
  fs.writeFileSync(path.join(dir, 'board.json'), JSON.stringify({asOf: '2026-11-13', companies: [{code: '005930'}]}));
  execFileSync('node', [path.join(ROOT, 'scripts/atlas11/next/su21_vol.mjs'), '--board', path.join(dir, 'board.json'), '--out', path.join(dir, 'vol.json'), '--fixture', fx], {encoding: 'utf8'});
  const V = JSON.parse(fs.readFileSync(path.join(dir, 'vol.json'), 'utf8'));
  assert.equal(V.schema, 'su21-vol-1'); assert.deepEqual(V.rows['005930'], [['20261112', 110, 2000], ['20261113', 115, 3000]], '[날, 종가, 거래량]'); assert.equal(V.last, '20261113');
  const pk = rd('scripts/atlas11/package.mjs'), su = rd('scripts/atlas11/next/su21.py');
  assert.ok(/if \(\/\\\/atlas11-\(site\|daily\|evening\)\\\.yml@\/\.test\(process\.env\.GITHUB_WORKFLOW_REF \?\? ''\)\) \{\s*try \{\s*const f = path\.join\(os\.tmpdir\(\), 'su21-vol-'/.test(pk), '거래량은 올리기 작업만 받음');
  assert.ok(pk.includes("...(volF ? ['--vol', volF] : [])"), '받은 거래량을 셈에 넘김');
  assert.ok(su.includes("ap.add_argument('--vol', default=None)") && su.includes("open(A.out.replace('su21.json', 'su21-s36.json'), 'w', encoding='utf-8')") && !su.includes('su21_t11') && !su.includes('su21-t11'), 'su21.py 가 su21-s36.json 을 씀 · 특징 열하나 셈 0');
  assert.ok(!fs.existsSync(path.join(ROOT, 'scripts/atlas11/next/su21_t11.py')), '특징 열하나 셈 파일 뺌');
  assert.ok(!/t365\/(roll|site_build|closes_fetch)/.test(rd('scripts/atlas11/next/su21_vol.mjs').split('\n').filter(l => /^import/.test(l)).join('\n')), '예전 화면 t365 파일은 부르지 않음');
});

/** 화면 셈 모듈 — 그리기 도구를 빈 것으로 바꿔 셈만 봄(달력 셈 모듈도 같은 방법) */
async function pageMods() {
  const bk = rd('site/su/su-book.js').replace("import {h, s} from '/su/su-fig.js';", 'const h = () => null, s = () => null;').replace("import {KIND} from '/su/su-21.js';", 'const KIND = {};');
  assert.ok(!/^import /m.test(bk));
  const bkUrl = 'data:text/javascript;base64,' + Buffer.from(bk).toString('base64');
  const st = rd('site/su/su-settle.js').replace("import {h} from '/su/su-fig.js';", 'const h = () => null;').replace("from '/su/su-book.js';", "from '" + bkUrl + "';");
  assert.ok(!/^import .* from '\/su\//m.test(st), '정산 모듈의 그리기 도구 · 달력 셈을 바꿈');
  return {B: await import(bkUrl), M: await import('data:text/javascript;base64,' + Buffer.from(st).toString('base64'))};
}

test('화면 셈 — 산 셈 줄 · 묶음마다 여덟 줄(사장님 말씀 차례 · 빈 묶음도 한 줄) · 큰 값만(주문 1113-1623) · 맨 위 작은 줄 · 「%」 0', async () => {
  const {M} = await pageMods();
  assert.deepEqual(Object.keys(M.KIND_NAME).sort(), [...KINDS].sort(), '묶음 이름 여덟 = 장부 묶음');
  assert.deepEqual(M.SHOW.map(k => M.KIND_NAME[k]), ['1 · 2 · 3등', '불장', '불장이 될 듯', '돈이 몰리는 곳', '돈이 몰릴 듯', '꽃이 될 곳', '꽃이 될 듯', '조용한데 힘이 모이는 곳'],
    '보이는 차례 = 사장님 말씀 차례(불장 · 불장이 될 듯 · 돈이 몰린 곳 · 돈이 몰릴 듯 · 꽃 · 꽃이 될 듯 · 조용한 힘 · 1 · 2 · 3등은 맨 위)');
  for (const gone of ['TOP', 'byCost', 'kindSub', 'indSub', 'coSub']) assert.equal(M[gone], undefined, '업종 · 회사 표 셈은 뺌 — ' + gone);
  const D = {schema: SCHEMA, qty: 10, asOf: '2026-11-09', kinds: [...KINDS],
    co: {'000001': ['가나', '반도체'], '000002': ['다라', null], '000003': ['마바', '반도체'], '000004': ['사아', '은행']},
    buys: [['2026-11-05', 1, '000001', 1000], ['2026-11-05', 1, '000002', 2000], ['2026-11-06', 0, '000003', 3000], ['2026-11-06', 7, '000001', 1100], ['2026-11-09', 2, '000004', 4000]],
    now: {'000001': [1200, '2026-11-09'], '000002': [1900, '2026-11-09'], '000003': [3000, '2026-11-09'], '000004': [4000, '2026-11-09']}, miss: {}};
  const rows = M.settleRows(D);
  assert.deepEqual(rows.map(r => [r.day, r.k, r.code, r.cost, r.val, r.one]), [
    ['2026-11-05', 'hot', '000001', 10000, 12000, false], ['2026-11-05', 'hot', '000002', 20000, 19000, false],
    ['2026-11-06', 'top3', '000003', 30000, 30000, false], ['2026-11-06', 'moneyNext', '000001', 11000, 12000, false],
    ['2026-11-09', 'bloom', '000004', 40000, 40000, true]], '10주씩 · 지금 = 가장 늦은 값 · 산 날 뒤 값이 없으면 아직 하루치');
  const K = M.byKind(D, rows);
  assert.deepEqual(K.map(g => [g.key, g.n, g.cost, g.val, g.st]), [['top3', 1, 30000, 30000, 'eq'], ['hot', 2, 30000, 31000, 'up'], ['hotNext', 0, 0, 0, 'eq'], ['money', 0, 0, 0, 'eq'],
    ['moneyNext', 1, 11000, 12000, 'up'], ['bloom', 1, 40000, 40000, 'one'], ['bloomNext', 0, 0, 0, 'eq'], ['quiet', 0, 0, 0, 'eq']], '여덟 줄 · 보이는 차례 그대로(늘고 준 크기 차례 아님)');
  const T = rows.reduce((a, r) => ({cost: a.cost + r.cost, val: a.val + r.val}), {cost: 0, val: 0});
  assert.deepEqual([K.reduce((a, g) => a + g.cost, 0), K.reduce((a, g) => a + g.val, 0)], [T.cost, T.val], '묶음 줄을 더하면 맨 위와 같음');
  assert.deepEqual(M.byKind({...D, kinds: ['hot', 'top3']}, rows).map(g => g.key), ['top3', 'hot'], '자료에 없는 묶음은 줄을 만들지 않음 · 차례는 SHOW');
  const late = rows.map(r => ({...r, nowDay: r.code === '000002' ? '2026-11-06' : r.nowDay}));
  assert.deepEqual(late.map(r => M.lateOf(r, D.asOf)), [null, '2026-11-06', null, null, null], '앞 날 값으로 센 회사');
  assert.equal(M.capText(rows, 0, 0), '11월 5일부터 · 산 셈 5번 · 고른 날 3일');
  assert.equal(M.capText(rows, 3, 1), '11월 5일부터 · 산 셈 5번 · 고른 날 3일 · 값이 없어 못 센 3번 · 앞 날 값으로 센 회사 1곳', '못 센 수 · 앞 날 값 회사 수를 숨기지 않음');
  for (const t of [...Object.values(M.KIND_NAME), M.capText(rows, 3, 1)]) assert.ok(!t.includes('%') && !/[A-Za-z]/.test(t), t);
  // 서른여섯 꾀(주문 1113-2224) — 여덟과 따로 셈 · 수익률 높은 차례(같으면 꾀 차례 · 산 셈이 없는 꾀는 맨 아래)
  assert.deepEqual([...M.SHOW36], [...S36]); assert.deepEqual([...M.BYVOL], ['g08', 'g13', 'g19', 'g29', 'g32']);
  assert.ok(!Object.keys(M.KIND_NAME).some(k => k.startsWith('t_')), '특징 열하나 이름 0');
  const gi = k => KINDS.indexOf(k);
  const D2 = {...D, kinds: [...KINDS], buys: [...D.buys,
    ['2026-11-05', gi('g05'), '000001', 1000],                                   // 1,200 → +20
    ['2026-11-05', gi('g03'), '000002', 2000],                                   // 1,900 → −5
    ['2026-11-06', gi('g30'), '000001', 1100], ['2026-11-06', gi('g30'), '000003', 2500], // (12,000 + 30,000) ÷ (11,000 + 25,000) → +16.7
    ['2026-11-09', gi('g01'), '000004', 4000]],                                  // 아직 하루치 → 0
    miss: {g13: 2, hot: 1}};
  const all = M.settleRows(D2), P8 = M.part(D2, all, M.SHOW), P36 = M.part(D2, all, M.SHOW36);
  assert.deepEqual([P8.rows.length, P8.T.cost, P8.miss], [5, rows.reduce((a, r) => a + r.cost, 0), 1], '맨 위 · 묶음마다 = 여덟만(서른여섯 꾀를 섞지 않음)');
  assert.deepEqual([P36.rows.length, P36.T.cost, P36.miss, P36.K.length], [5, 10000 + 20000 + 11000 + 25000 + 40000, 2, 36], '서른여섯 꾀 = 서른여섯 줄 · 그 줄들만 더함 · 못 센 수도 따로');
  const R = M.byRate(P36.K);
  assert.deepEqual(R.slice(0, 4).map(g => g.key), ['g05', 'g30', 'g01', 'g03'], '수익률 높은 차례 — 늘어난 꾀 → 그대로(아직 하루치) → 줄어든 꾀');
  assert.deepEqual(R.slice(4).map(g => g.key), S36.filter(k => !['g05', 'g30', 'g01', 'g03'].includes(k)), '산 셈이 없는 꾀는 맨 아래 꾀 차례');
  assert.deepEqual(M.byRate([{key: 'g09', n: 1, cost: 100, val: 110}, {key: 'g02', n: 1, cost: 200, val: 220}]).map(g => g.key), ['g02', 'g09'], '수익률이 같으면 꾀 차례');
  assert.equal(M.rateOf({n: 0, cost: 0, val: 0}), null);
});

test('탭 · 길 · 묶기 · 검사 — 아래 탭 여섯째 「정산」 #/r/t · 새 판 안 · 올리기 작업만 장부를 씀 · 검사 ㉓ · 화면 글', () => {
  const su = rd('site/su/su.js'), st = rd('site/su/su-settle.js'), css = rd('site/su/su-settle.css'), pk = rd('scripts/atlas11/package.mjs'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(su.includes("['정산', '#/r/t', ") && su.includes('export const TAB_ORDER = Object.freeze([0, 1, 3, 2, 4, 5]);'), '정산 탭은 맨 끝(여섯째)');
  assert.ok(su.includes("a === 't' ? await (await import('/su/su-settle.js')).vSettle(X21)"), '길 #/r/t');
  assert.equal(forwardTo('', '#/r/t'), null, '#/r/t 는 새 판 안(옛 판으로 넘기지 않음)');
  assert.ok(st.includes("return {title: '정산', tab: 5,"), '정산 쪽을 열면 정산 탭이 켜짐');
  assert.ok(pk.includes("'scripts/atlas11/next/su21_settle.mjs'") && pk.includes("'--book', path.join(root, 'reports/atlas11/su21/settle.json')") && /su21_settle\.mjs[^\n]*\.\.\.\(keepJob \? \['--keep'\] : \[\]\)/.test(pk), '묶을 때 화면 자료 · 장부는 올리기 작업만 씀');
  assert.ok(pk.indexOf('su21_days.mjs') < pk.indexOf('su21_settle.mjs'), '그날 목록을 적은 뒤에 정산');
  assert.ok(ck.includes("'301곳 지도 멈춤 기록 달력 정산'") && ck.includes('㉓ 정산 자료') && ck.includes("open(p, '#/r/t')"), '검사 — 탭 여섯 · 정산 쪽');
  assert.ok(ck.includes("import {START as SETTLE_START} from './su21_settle.mjs';") && ck.includes('㉓ 정산 첫날') && ck.includes("부터 센 정산이에요."), '검사 — 정산 첫날(주문 1112-2042)');
  assert.ok(st.includes("text: md(D.start) + '부터 센 정산이에요.'"), '쪽 — 맨 위 첫날 한 줄');
  assert.ok(/#\\\/r\\\/\[mwdynkicst\]/.test(ck), '검사 고리 꼴에 #/r/t');
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|['"]style['"]|\.style\./.test(st), '보안 규칙 — innerHTML · 글 속 style 없음');
  assert.ok(css.includes('.st-replay') && !css.includes('.st-rest'), '꾸밈 — 접은 줄 꾸밈은 뺌(주문 1113-1623)');
  assert.ok(st.includes("table('st-kinds', '묶음마다', '묶음', K.map(g => row(g, KIND_NAME[g.key] ?? g.key)), T)") && !/st-inds|st-cos|restFold|'#\/c\/'/.test(st), '쪽 — 표는 묶음마다 하나(업종 · 회사 표 · 회사 고리 0)');
  assert.ok(st.includes("table('st-s36', '서른여섯 꾀', '꾀', byRate(P36.K).map(g => row(g, KIND_NAME[g.key] ?? g.key)), P36.T)") && !st.includes('st-t11') && ck.includes("check(g.tabs === 3 &&") && ck.includes('서른여섯 꾀(주문 1113-2224)'), '쪽 · 검사 — 서른여섯 꾀 표(주문 1113-2224 · 수익률 높은 차례) · 겹친 곳 표(주문 1114-0802) · 특징 열하나 표 0');
  assert.ok(ck.includes("const SHOWs = ['top3', 'hot', 'hotNext', 'money', 'moneyNext', 'bloom', 'bloomNext', 'quiet'];") && ck.includes('큰 값만(주문 1113-1623)'), '검사 — 보이는 차례 · 큰 값만');
  const texts = [...st.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  assert.ok(texts.length > 20);
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
  assert.deepEqual(texts.filter(s => s.includes('%') || /[A-Za-z]{2,}/.test(s.replace(/data-[a-z-]+|bk-[a-z0-9-]+|st-[a-z0-9-]+|su-[a-z0-9-]+/g, ''))), [], '화면 글에 「%」 · 영어 0');
});

test('꾀 칸 회사 단추마다 한 달 꺾은선(주문 1114-0325 「모든곳에 꺽기 그래프도 종목마다 넣어라」) — 값 셈 · su21.py 한 달 값 · 단추 그림 · 검사 ㉔ · 선 모양 = 42칸', async () => {
  const ap = rd('site/su/su-apple.js'), stub = ap.replace("import {s, h} from '/su/su-fig.js';", 'const s = () => null, h = () => null;');
  assert.ok(!/^import /m.test(stub), '그리기 도구를 바꿈');
  const A = await import('data:text/javascript;base64,' + Buffer.from(stub).toString('base64'));
  const c21 = Array.from({length: 21}, (_, i) => 1000 + i * 10), D = '2026-11-13';
  const g = {asOf: {board: D}, line: {'000001': {c: c21, close: 1200, date: D}, '000002': {c: c21, close: 1199, date: D}, '000003': {c: c21, close: 1200, date: '2026-11-12'},
    '000004': {c: c21.slice(1), close: 1200, date: D}, '000005': {c: [...c21.slice(0, 20), 0], close: 0, date: D}, '000006': {c: [...c21.slice(0, 20), NaN], close: 1200, date: D}}};
  assert.deepEqual(A.sp36(g, '000001'), c21, '21 값 · 끝 = 그날 마지막 값 · 판 날 = 꾀 칸 판 날');
  for (const k of ['000002', '000003', '000004', '000005', '000006', '000009']) assert.equal(A.sp36(g, k), null, k + ' — 맞지 않으면 그림 없음');
  assert.equal(A.sp36({...g, asOf: {board: '2026-11-14'}}, '000001'), null, '꾀 칸 판 날과 다르면 그림 없음');
  assert.equal(A.sp36(null, '000001'), null);
  assert.ok(ap.includes('sp ? chipSpark(sp) : null') && ap.includes("spark(sp, CSP, CSP, CSW, CSH, 'now')"), '단추 맨 끝 꺾은선 = 42칸과 같은 그리기(spark)');
  assert.ok(ap.includes("' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20])"), '소리 이름표에 한 달 전 값 · 마지막 값');
  assert.ok(ap.includes("(anySp ? '이름 옆 꺾은선은 한 달, 옅은 줄은 한 달 전 값이에요. ' : '')"), '읽는 법 한 마디(42칸 풀이와 같은 말)');
  const py = rd('scripts/atlas11/next/su21.py');
  assert.ok(py.includes("'line': {c: {'c': B[c].get('c'), 'close': B[c].get('close'), 'date': B[c].get('date')} for c in sorted({c for L in S36R['lists'].values() for c in L} | {c for c, _, _ in OV}) if c in B}"), 'su21.py 가 꾀 칸 · 겹친 곳 회사마다 한 달 값을 한 번씩 씀(42칸과 같은 판 값)');
  const ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(ck.includes('꾀 칸 회사 단추마다 한 달 꺾은선(주문 1114-0325)') && ck.includes('꾀 칸 한 달 꺾은선 자료(주문 1114-0325)') && ck.includes("? 31 : 7.8)"), '검사 ㉔ · 처음 쪽 길이(주문 1114-0802 겹친 곳까지)');
  const css = rd('site/su/su-apple.css');
  for (const [k, v] of [['.sa-sp', '{ fill: none; stroke: #86868B; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }'], ['.sa-sp0', '{ fill: none; stroke: #E5E5EA; stroke-width: 1; }'], ['.sa-spA', '{ fill: #D97706; stroke: #FFFFFF; stroke-width: 2; }']])
    assert.ok(css.includes('.su-news > .su-hero[data-g="su-apple"] .s36-sp ' + k + ' ' + v) && css.includes('.su-apple ' + k + ' ' + v), k + ' 선 모양 = 42칸');
});


test('겹친 곳(주문 1114-0802 「… 36개 정도 겹치는 그 종목을 별도로 또 … 또 폴더 또 만들어 그래도 똑같이 만들어」) — 셈 규칙 · 장부 · 며칠째 · 정산 표 · 첫 화면 칸 · 검사', async () => {
  // 셈 규칙(su21_s36.py overlap — 스스로 시험)
  const out = execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--selftest'], {encoding: 'utf8'});
  assert.match(out, /^ok 252 ovl 4/, '세 묶음 이상 · 많이 든 차례 · 같으면 첫 화면 먼저 · 앞 일곱만');
  const py = rd('scripts/atlas11/next/su21.py'), s36py = rd('scripts/atlas11/next/su21_s36.py');
  assert.ok(py.includes("OV = S36.overlap({**lists, **S36R['lists']})") && py.includes("'ovl': {'rule': S36.OV_RULE, 'need': S36.OV_NEED, 'groups': len(S36.OV_ORDER), 'order': S36.OV_ORDER,"), 'su21.py — 첫 화면 마흔셋(지금 · 될 듯 · 조용한 힘 + 꾀)으로 셈 · 꾀 칸 자료에 씀');
  assert.ok(s36py.includes("OV_ORDER = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext', 'quiet'] + KINDS") && s36py.includes('OV_NEED = 3'));
  // 장부 — 꾀와 같은 날 조건 · 하루 한 번 · 10주씩 산 셈 · 며칠째
  const D = '2026-11-13', D2 = '2026-11-16', T = ['2026-11-12', D, D2];
  const co = (code, close, date = D) => ({code, name: '회사' + code, date, close, group: {industry: '업' + code.at(-1)}});
  const board = {asOf: D, companies: [co('000001', 1000), co('000002', 2000), co('000003', 3000)]};
  const g = {schema: 'su21-s36-1', rule: 's36-v1', asOf: {board: D, data: D}, kinds: [...S36], lists: Object.fromEntries(S36.map(k => [k, []])),
    ovl: {rule: 'ovl-v1', need: 3, groups: 43, list: [{code: '000002', name: '회사000002', n: 5, in: []}, {code: '000001', name: '회사000001', n: 3, in: []}]}};
  const r1 = stepSettle(null, {board, s36: g, days: {days: {}}, start: '2026-11-12'});
  assert.deepEqual(r1.book.ovl, {[D]: ['000002', '000001']}, '그날 판 날 = 셈한 자료 날일 때 그날 목록을 한 번 적음');
  assert.equal(r1.addedO, D); assert.deepEqual(r1.lists[D].ovl, ['000002', '000001']);
  const r2 = stepSettle(r1.book, {board, s36: {...g, ovl: {...g.ovl, list: [{code: '000003', n: 4}]}}, days: {days: {}}, start: '2026-11-12'});
  assert.deepEqual(r2.book.ovl[D], ['000002', '000001'], '먼저 적은 날은 그대로'); assert.equal(r2.addedO, null);
  const r3 = stepSettle(null, {board, s36: {...g, asOf: {board: '2026-11-12', data: '2026-11-12'}}, days: {days: {}}, start: '2026-11-12'});
  assert.deepEqual(r3.book.ovl, {}, '묵은 꾀 칸 자료로는 적지 않음');
  const S = siteSettle(r1.book, r1.lists, D, {days: {}});
  assert.deepEqual(S.buys.filter(b => S.kinds[b[1]] === 'ovl').map(b => [b[0], b[2], b[3]]), [[D, '000002', 2000], [D, '000001', 1000]], '겹친 곳 회사마다 그날 마지막 값으로 산 셈');
  assert.equal(S.kinds.at(-1), 'ovl', '묶음 차례 맨 뒤(앞 묶음 번호는 그대로)');
  // 며칠째 — 이어진 날(장이 열린 날) · 첫 발견 · 기록 첫날까지면 since · 판 날이 같을 때만
  const book2 = {...r1.book, ovl: {[D]: ['000002', '000001'], [D2]: ['000002', '000003']}};
  const R = runsOf(book2, T, D2);
  assert.deepEqual(R.ovl['000002'], {days: 2, found: D, since: true}); assert.deepEqual(R.ovl['000003'], {days: 1, found: D2, since: false}); assert.equal(R.fromO, D);
  const g2 = {asOf: {board: D2}, lists: {}, ovl: {list: [{code: '000002'}, {code: '000003'}]}};
  assert.deepEqual(markRuns(R, g2, null, D2), {n36: 0, nq: 0, no: 2}); assert.equal(g2.ovl.list[0].days, 2); assert.equal(g2.ovl.daysFrom, D);
  const g3 = {asOf: {board: D}, lists: {}, ovl: {list: [{code: '000002'}]}};
  assert.deepEqual(markRuns(R, g3, null, D2), {n36: 0, nq: 0, no: 0}, '판 날이 다르면 붙이지 않음');
  // 정산 쪽 — 표 하나(묶음마다 바로 아래) · 줄 하나 · 따로 셈
  const {M} = await pageMods();
  assert.equal(M.KIND_NAME.ovl, '겹친 곳'); assert.deepEqual([...M.SHOWO], ['ovl']);
  const rows = M.settleRows(S), PO = M.part(S, rows, M.SHOWO), P8 = M.part(S, rows, M.SHOW);
  assert.deepEqual([PO.rows.length, PO.T.cost, PO.K.length, PO.K[0].key, P8.rows.length], [2, 30000, 1, 'ovl', 0], '겹친 곳 = 그 줄만 · 여덟과 섞지 않음');
  const st = rd('site/su/su-settle.js');
  assert.ok(st.indexOf("table('st-kinds'") < st.indexOf("table('st-ovl', '겹친 곳', '묶음'") && st.indexOf("table('st-ovl'") < st.indexOf("table('st-s36'"), '묶음마다 → 겹친 곳 → 서른여섯 꾀 차례');
  // 첫 화면 — 꾀 칸 머리 바로 아래 한 묶음 · 칸 = 꾀 칸과 같은 꼴 + 든 묶음 수
  const ap = rd('site/su/su-apple.js'), stub = ap.replace("import {s, h} from '/su/su-fig.js';", 'const s = () => null, h = () => null;');
  const A = await import('data:text/javascript;base64,' + Buffer.from(stub).toString('base64'));
  assert.ok(A.okOv({ovl: {rule: 'ovl-v1', need: 3, list: [{code: '000001', n: 3}]}}) && !A.okOv({ovl: {rule: 'ovl-v1', need: 3, list: [{code: '000001', n: 2}]}}) && !A.okOv({}) && A.okOv({ovl: {rule: 'x', need: 3, list: []}}));
  assert.ok(ap.includes("h('h3', {class: 's36-oh', text: '겹친 곳'})") && ap.includes("h('b', {text: '세 묶음 이상에 든 곳'})") && ap.includes("...OV.map(c => chip36(g, c, bd, true))") && ap.includes("...L.map(c => chip36(g, c, bd, false))"), '겹친 곳 머리 · 칸 = 꾀 칸과 같은 단추');
  assert.ok(ap.includes("n ? h('span', {class: 's36-cn', text: n + '묶음'}) : null") && ap.includes("(n ? ' · ' + n + '묶음' : '')"), '칸마다 든 묶음 수(글 · 소리 이름표)');
  for (const x of ['처음 쪽', '겹친 곳', '세 묶음 이상에 든 곳', '첫 화면 마흔세 묶음 가운데 세 묶음 이상에 같이 든 회사예요. 많이 겹친 곳이 먼저예요. 칸마다 든 묶음 수를 적었어요.']) assert.ok(!x.includes('%') && !/[A-Za-z]/.test(x), x);
  const ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(ck.includes('㉔ 겹친 곳 자료(주문 1114-0802)') && ck.includes("W + '겹친 곳(주문 1114-0802) — 꾀 칸 머리 바로 아래 한 묶음") && ck.includes("W + '겹친 곳(주문 1114-0802) — 묶음마다 표 바로 아래"), '검사 ㉓ · ㉔');
  const css = rd('site/su/su-apple.css');
  assert.ok(css.includes('.su-news > .su-hero[data-g="su-apple"] .s36-c.s36-oc.s36-csp { grid-template-areas: "n n" "c s" "d s"; }'), '칸 = 위 이름 · 아래 왼쪽 ○묶음 · ○일째 · 오른쪽 꺾은선');
});

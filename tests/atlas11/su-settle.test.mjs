// 큐피트 정산(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야
//   거기에 일 이 삼 등 매일 사 그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」)
//   장부(scripts/atlas11/next/su21_settle.mjs) · 탭 · 길 · 묶기 — 옛 화면 셈(su-settle.js)은 화면에서 안 써 지움(주문 1116-1846) · 검사가 함께 바뀌었는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCHEMA, BOOK_SCHEMA, QTY, KINDS, S36, START, emptySettle, okSettle, listsOf, stepSettle, siteSettle, runsOf, markRuns, rank36, trackDays, sealTrack, checkTrack, trackDiff, trackSite, trackAll, readTrack, ZERO, TRACK, SUN_TRACK, sealSun, checkSun, sunPick, MK_MIN, mkLevels, trackTotal, horizons, HZ_KS} from '../../scripts/atlas11/next/su21_settle.mjs';
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
  const s36 = {rule: 's36-v2', asOf: {board: D1, data: D1}, lists: {g04: C7(1), g31: C7(2), g13: []}};
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
  const sj = rd('site/su/su-sonja.js'); // 옛 첫 쪽(su-apple.js)은 화면에서 안 써 지움(주문 1116-1846) — 지금 첫 쪽(손자병법)
  assert.ok(sj.includes("h('span', {class: 'sj-chipd', text: dz ? dz + '일째' : ''})") && sj.includes("' 「며칠째」는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.'"), '첫 쪽 — 꾀 단추마다 며칠째 · 기록 첫날');
});

test('서른여섯 꾀 셈(su21_s36.py 스스로 시험 · 이름 = 화면 · 검사) · 거래량 받기(su21_vol.mjs — 꾸민 일봉) · 묶기는 올리기 작업만 받음', async () => {
  const py = execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--selftest'], {cwd: path.join(ROOT, 'scripts/atlas11/next'), encoding: 'utf8'});
  assert.match(py, /^ok 96 of 217 · vol 4 · full [\d.]+s · ovl 4/, py); // 주문 1116-1539 — 세 거름을 모두 지난 곳만(채우지 않음 · 꾸민 값 서른하나 × 일곱 가운데 아흔여섯)
  const defs = JSON.parse(execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--defs'], {cwd: path.join(ROOT, 'scripts/atlas11/next'), encoding: 'utf8'}));
  assert.deepEqual(defs.kinds, [...S36]); assert.equal(defs.han.g01, '만천과해'); assert.equal(defs.han.g36, '주위상'); assert.deepEqual(Object.keys(defs.by).sort(), ['g08', 'g13', 'g19', 'g29', 'g32']);
  // 쉬운 이름 · 꾀 이름 · 뜻 · 고르는 법 = 셈 — 아래 「서른여섯 꾀 바탕 글(su-sonja-36.js)」 시험이 맞댐(옛 정산 모듈 su-settle.js 는 지움 · 주문 1116-1846)
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



test('탭 · 길 · 묶기 · 검사 — 아래 탭 다섯째 「정산」 #/r/t · 손자병법 판 서른여섯 꾀 표만(주문 1115-2328) · 올리기 작업만 장부를 씀 · 검사 ㉓ · 화면 글', () => {
  const su = rd('site/su/su.js'), kk = rd('site/su/su-sonja-kkoe.js'), top = rd('site/su/su-sonja-top.js'), pk = rd('scripts/atlas11/package.mjs'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(!su.includes('TAB_ORDER') && top.includes("['멈춤', '#/q'], ['기록', '#/l']]);") && top.includes("export const REC4 = Object.freeze([['한눈에', '#/l/a'], ['장부', '#/l'], ['정산', '#/r/t'], ['분석', '#/l/d'], ['일지', '#/j'], ['산 회사', '#/l/b'], ['판 회사', '#/l/s']]);"), '탭 다섯 끝 「기록」 · 기록 갈래 장부 · 정산 · 분석 · 일지(주문 1124-1942 치지 짜임 — 옛 정산 · 장부 · 분석 탭을 한 탭에)');
  assert.ok(su.includes("if (hh === '#/r/t') { const M = await kkoeM(); return await paintSj(hh, root, () => M.vSettle36(XS)); }"), '길 #/r/t → 손자병법 판 정산(su-sonja-kkoe.js vSettle36)');
  assert.equal(forwardTo('', '#/r/t'), null, '#/r/t 는 새 판 안(옛 판으로 넘기지 않음)');
  assert.ok(kk.includes("return frame({title: '정산', page: 'settle', kids, tab: 4, rec: 2,"), '정산 쪽을 열면 기록 탭(다섯째)과 기록 갈래 「정산」이 켜짐(주문 1124-1942 · 1125-2101 한눈에가 맨 앞이라 둘째)');
  assert.ok(pk.includes("'scripts/atlas11/next/su21_settle.mjs'") && pk.includes("'--book', path.join(root, 'reports/atlas11/su21/settle.json')") && /su21_settle\.mjs[^\n]*\.\.\.\(keepJob \? \['--keep'\] : \[\]\)/.test(pk), '묶을 때 화면 자료 · 장부(올리기 작업만 장부를 씀)');
  assert.ok(pk.indexOf('su21_days.mjs') < pk.indexOf('su21_settle.mjs'), '그날 목록을 적은 뒤에 정산');
  assert.ok(ck.includes("'오늘 꾀 회사 멈춤 기록'") && ck.includes("REC = '한눈에 장부 정산 분석 일지 산 회사 판 회사'") && ck.includes('㉓ 정산 자료') && ck.includes("open(p, '#/r/t')"), '검사 — 탭 다섯 · 정산 쪽');
  assert.ok(ck.includes("import {START as SETTLE_START} from './su21_settle.mjs';") && ck.includes('㉓ 정산 첫날'), '검사 — 정산 첫날(주문 1112-2042)');
  assert.ok(/#\\\/r\\\/t\|/.test(ck) && !/#\\\/r\\\/\[mwdykicst\]/.test(ck), '검사 고리 꼴 — #/r/t 만(옛 기록 서랍 · 달력 고리는 지움 — 주문 1115-2328)');
  assert.ok(!/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|['"]style['"]|\.style\./.test(kk), '보안 규칙 — innerHTML · 글 속 style 없음');
  assert.ok(kk.includes("export function settle36(D)") && /K\.sort\(\(a, b\) => \(rateOf\(a\) === null\) - \(rateOf\(b\) === null\) \|\| \(rateOf\(b\) \?\? 0\) - \(rateOf\(a\) \?\? 0\) \|\| K36\.indexOf/.test(kk), '쪽 — 서른여섯 꾀 수익이 높은 차례(본질 8번 · 같으면 꾀 차례 · 하루치 · 산 셈 없음은 맨 아래)');
  assert.ok(!/st-kinds|st-ovl|st-inds|st-cos|KIND_NAME\.(hot|bloom|money|quiet|top3)/.test(kk) && ck.includes("'㉓ 정산 [' + width + '] '") && ck.includes('옛 정산 판(여덟 묶음 · 겹친 곳 · 업종 · 회사 표) 0'), '쪽 — 옛 여덟 묶음 · 겹친 곳 · 업종 · 회사 표 0(주문 1115-2328)');
  const texts = [...kk.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).filter(s => !s.startsWith('/'));
  assert.ok(texts.length > 20);
  const bad = texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)].map(w => w + ' ← ' + s));
  assert.deepEqual(bad, [], '화면 글에 쓰지 않을 말 0');
});
test('꾀 칸 회사 단추마다 한 달 꺾은선(주문 1114-0325 「모든곳에 꺽기 그래프도 종목마다 넣어라」) — 값 셈 · su21.py 한 달 값 · 단추 그림 · 검사 ㉔ · 선 모양 = 42칸', async () => {
  const sj = rd('site/su/su-sonja.js'); // 옛 첫 쪽(su-apple.js · su-apple.css)은 화면에서 안 써 지움(주문 1116-1846) — 지금 첫 쪽(손자병법) 셈 · 그리기
  assert.ok(sj.includes("export const sp36 = (g, code) => { const v = g?.line?.[code]; return v && Array.isArray(v.c) && v.c.length === 21 && v.c.every(x => fin(x) && x > 0) && fin(v.close) && v.close === v.c[20] && typeof v.date === 'string' && v.date === g?.asOf?.board ? v.c : null; };"), '21 값 · 끝 = 그날 마지막 값 · 판 날 = 꾀 칸 판 날일 때만 그림');
  assert.ok(sj.includes("sp ? spark(sp, 64, 26, 'sj-sps') : null") && sj.includes("' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20])"), '단추마다 꺾은선 · 소리 이름표에 한 달 전 값 · 마지막 값');
  const py = rd('scripts/atlas11/next/su21.py');
  assert.ok(py.includes("'line': {c: line36(c) for c in sorted({c for L in S36R['lists'].values() for c in L} | {c for c, _, _ in OV}) if c in B}")
    && py.includes("v = PM[j, CTX.T - 20:CTX.T + 1]") && py.includes("return {'c': B[c].get('c'), 'close': B[c].get('close'), 'date': B[c].get('date')}"), 'su21.py 가 꾀 칸 · 겹친 곳 회사마다 한 달 값을 한 번씩 씀(꾀를 고른 값 21개 · 날이 어긋나면 판 값 — 주문 1116-1539)');
  const ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(ck.includes('꾀 칸 회사 단추마다 한 달 꺾은선(주문 1114-0325)') && ck.includes('꾀 칸 한 달 꺾은선 자료(주문 1114-0325)') && ck.includes("? 31 : 16)"), '검사 ㉔ · 처음 쪽 길이(주문 1114-0802 겹친 곳까지)');
});


test('겹친 곳(주문 1114-0802 「… 36개 정도 겹치는 그 종목을 별도로 또 … 또 폴더 또 만들어 그래도 똑같이 만들어」) — 셈 규칙 · 장부 · 며칠째 · 검사', async () => {
  // 셈 규칙(su21_s36.py overlap — 스스로 시험)
  const out = execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--selftest'], {encoding: 'utf8'});
  assert.match(out, /^ok 96 of 217 · vol 4 · full [\d.]+s · ovl 4/, '세 묶음 이상 · 많이 든 차례 · 같으면 첫 화면 먼저 · 앞 일곱만');
  const py = rd('scripts/atlas11/next/su21.py'), s36py = rd('scripts/atlas11/next/su21_s36.py');
  assert.ok(py.includes("OV = S36.overlap({**lists, **S36R['lists']})") && py.includes("'ovl': {'rule': S36.OV_RULE, 'need': S36.OV_NEED, 'groups': len(S36.OV_ORDER), 'order': S36.OV_ORDER,"), 'su21.py — 첫 화면 마흔셋(지금 · 될 듯 · 조용한 힘 + 꾀)으로 셈 · 꾀 칸 자료에 씀');
  assert.ok(s36py.includes("OV_ORDER = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext', 'quiet'] + KINDS") && s36py.includes('OV_NEED = 3'));
  // 장부 — 꾀와 같은 날 조건 · 하루 한 번 · 10주씩 산 셈 · 며칠째
  const D = '2026-11-13', D2 = '2026-11-16', T = ['2026-11-12', D, D2];
  const co = (code, close, date = D) => ({code, name: '회사' + code, date, close, group: {industry: '업' + code.at(-1)}});
  const board = {asOf: D, companies: [co('000001', 1000), co('000002', 2000), co('000003', 3000)]};
  const g = {schema: 'su21-s36-1', rule: 's36-v2', asOf: {board: D, data: D}, kinds: [...S36], lists: Object.fromEntries(S36.map(k => [k, []])),
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
  // 옛 정산 쪽(su-settle.js) · 옛 첫 쪽 칸(su-apple.js · su-apple.css)은 화면에서 안 써 지움(주문 1116-1846 — 처음 쪽 겹친 곳은 주문 1115-1843 에서 이미 뺌)
  const ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(ck.includes('㉔ 겹친 곳 자료(주문 1114-0802)') && ck.includes("W + '겹친 곳 0(네 창 · 될 듯 세 창과 함께 센 묶음 — 병법 서른여섯만 · 주문 1115-1843)'"), '검사 ㉔(처음 쪽 겹친 곳은 지움 — 주문 1115-1843 · 정산 쪽도 서른여섯 꾀 표만 — 주문 1115-2328)');
});

/** 주문 1115-2328 — 꾀 칸 자료를 못 받은 날의 바탕 글(site/su/su-sonja-36.js) = su21_s36.py --defs 그대로(꾀 모음 · 꾀 쪽 · 정산이 같은 이름과 뜻) */
test('서른여섯 꾀 바탕 글(su-sonja-36.js) = su21_s36.py --defs — 쉬운 이름 · 꾀 이름 · 뜻 · 고르는 법 · 여섯 묶음 · 사고판 양 다섯', async () => {
  const defs = JSON.parse(execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21_s36.py'), '--defs'], {cwd: path.join(ROOT, 'scripts/atlas11/next'), encoding: 'utf8'}));
  const M = await import('../../site/su/su-sonja-36.js');
  assert.deepEqual([...M.K36], defs.kinds, '꾀 차례 g01 ~ g36');
  for (const k of M.K36) { assert.equal(M.NAME[k], defs.name[k], k); assert.equal(M.HAN[k], defs.han[k], k); assert.equal(M.MEAN[k], defs.mean[k], k); assert.equal(M.SAY[k], defs.say[k], k); assert.equal(M.SETOF[k], defs.set[k], k); }
  assert.deepEqual({...M.BY}, defs.by, '사고판 양으로 고르는 다섯');
  // 여섯 식 · 꾀마다 섞은 식(주문 1116-2134) — 화면 바탕 글 = 셈 그대로(꾀 쪽 「이렇게 점수를 매겨요」 · 검사 ㉘ 가 자료와 맞댐)
  assert.equal(M.MIXRULE, defs.mixRule); assert.deepEqual(JSON.parse(JSON.stringify(M.EQ36)), defs.eq, '여섯 식 글'); assert.deepEqual(JSON.parse(JSON.stringify(M.MIX36)), defs.mix, '꾀마다 섞은 식');
  for (const k of M.K36) { const f = M.MIX36[k].map(([e]) => M.EQ36[e][0]); assert.ok(f.includes('수학') && f.includes('정서'), k + ' 수학 하나 이상 + 정서 하나 이상'); assert.equal(M.MIX36[k].some(([e]) => M.EQ36[e][1] === '쏠림'), k in M.BY, k + ' 쏠림 = 사고판 양 꾀만'); }
  assert.equal(M.RULE, defs.rule, '거른 법 이름');
  const B = M.base36();
  assert.ok(B.fallback === true && B.schema === 'su21-s36-1' && B.kinds.length === 36 && Object.keys(B.lists).length === 0, '바탕 = 오늘 고른 곳 0');
  for (const t of [...Object.values(M.NAME), ...Object.values(M.MEAN), ...Object.values(M.SAY), ...M.SET6]) { assert.ok(!t.includes('%') && !/[A-Za-z]/.test(t), t); assert.deepEqual([...screenHits(t), ...ruinHits(t)], [], t); }
});

test('날마다 바뀐 차례(주문 1119-0243 「그 순위가 매일 매일 어떻게 변화하는지 잡스라면 어떻개 표현할까」) — 장부 값이 있는 날마다 화면과 같은 차례 · 하루치뿐인 날은 뺌 · 묶을 때 rk · 쪽은 앞 장날과 견줌', () => {
  const D1 = '2026-11-13', D2 = '2026-11-16', D3 = '2026-11-17', ki = k => KINDS.indexOf(k);
  const B = {px: {'000001': {[D1]: 1000, [D2]: 1100, [D3]: 1000}, '000002': {[D1]: 2000, [D2]: 2000, [D3]: 2600}, '000003': {[D2]: 500, [D3]: 450}}};
  const S = {kinds: [...KINDS], qty: 10, asOf: D3, buys: [[D1, ki('g01'), '000001', 1000], [D1, ki('g02'), '000002', 2000], [D2, ki('g03'), '000003', 500]]};
  const R = rank36(B, S), rest = Array.from({length: 33}, (_, i) => i + 3);
  assert.deepEqual(R.days, [D2, D3], '모두 하루치인 첫날은 뺌 · 판 날까지');
  assert.deepEqual(R.order[0], [0, 1, 2, ...rest], 'D2 — 늘어난 몫 높은 차례(g01 > g02 = 0) · 하루치(g03) · 산 셈 없음은 맨 아래 꾀 차례');
  assert.deepEqual(R.order[1], [1, 0, 2, ...rest], 'D3 — g02 > g01(0) > g03(줄어듦)');
  assert.deepEqual(rank36(B, {...S, asOf: D2}).days, [D2], '판 날 뒤 값은 쓰지 않음');
  assert.deepEqual(rank36(B, {...S, buys: []}), {days: [], order: []});
  const sm = rd('scripts/atlas11/next/su21_settle.mjs'), kk = rd('site/su/su-sonja-kkoe.js');
  assert.ok(sm.includes('site.rk = rankOf(A);') && sm.includes('A = trackAll(T, TD)'), '묶을 때 화면 자료에 날마다 바뀐 차례(적은 줄 + 아직 안 적은 날)');
  assert.ok(kk.includes('export function rankMoves(D, K)') && kk.includes('M = rankMoves(D, K)') && kk.includes('M ? rankRace(M, nameOf) : null') && kk.includes('M ? mvMark(M.move.get(x.key)) : null'), '쪽 — 맨 위 한 줄 · 줄마다 오르내린 칸 · 날마다 바뀐 차례(위 열)');
  assert.ok(kk.includes("cur = K.map(x => K36.indexOf(x.key))") && kk.includes("d < today"), '오늘 차례는 쪽이 스스로 센 것 · 장부 기록은 그 앞날만');
});

test('쌓인 값 · 날마다 기록(주문 1119-0829 「누적값을 알수가 없다 … 추적 시스템은 정말 소중한 데이타」) — 첫 산 날부터 · 한 번 적은 줄은 고치지 않음 · 지문 이음 · 고치면 드러남 · 화면 100원이 ○원', () => {
  const D1 = '2026-11-13', D2 = '2026-11-16', D3 = '2026-11-17', D4 = '2026-11-18', ki = k => KINDS.indexOf(k);
  const B = {px: {'000001': {[D1]: 1000, [D2]: 1100, [D3]: 1000, [D4]: 1200}, '000002': {[D1]: 2000, [D2]: 2000, [D3]: 2600, [D4]: 2400}}};
  const S = {kinds: [...KINDS], qty: 10, asOf: D3, buys: [[D1, ki('g01'), '000001', 1000], [D1, ki('g02'), '000002', 2000]]};
  const TD = trackDays(B, S);
  assert.deepEqual(TD.map(d => d.day), [D1, D2, D3], '첫 산 날(모두 하루치)부터 판 날까지');
  assert.deepEqual([TD[0].c[0], TD[0].v[0], TD[0].r[0]], [10000, 10000, null], '첫날 — 산 돈 = 센 돈 · 하루치는 늘어난 몫 없음');
  assert.deepEqual([TD[1].v[0], TD[1].r[0], TD[1].c[2]], [11000, 100000, null], '둘째 날 — 1100 × 10 · 늘어난 몫 백만에 십만 · 산 셈 없는 꾀는 null');
  assert.deepEqual(rank36(B, S).days, [D2, D3], '차례는 셀 꾀가 있는 날만(전과 같음)');
  const s1 = sealTrack([], TD, '2026-11-17T17:10+09:00');
  assert.deepEqual(s1.added, [D1, D2, D3]); assert.equal(s1.lines[0].p, ZERO); assert.equal(s1.lines[1].p, s1.lines[0].h); assert.equal(s1.lines[0].rule, TRACK);
  assert.deepEqual(checkTrack(s1.lines), [], '지문이 이어짐');
  // 다음 날 — 앞 줄은 그대로 두고 새 날만 덧붙임 · 앞날 값이 달라져도 고치지 않음
  const TD2 = trackDays({px: {...B.px, '000001': {...B.px['000001'], [D2]: 1150}}}, {...S, asOf: D4});
  const s2 = sealTrack(s1.lines, TD2, '2026-11-18T17:10+09:00');
  assert.deepEqual(s2.added, [D4], '마지막 적은 날 뒤만');
  assert.deepEqual(s2.lines.slice(0, 3), s1.lines, '한 번 적은 줄은 그대로');
  assert.deepEqual(trackDiff(s2.lines, TD2), [D2], '다시 센 값이 다르면 알리기만');
  const bad = JSON.parse(JSON.stringify(s2.lines)); bad[1].v[0] += 10;
  assert.deepEqual(checkTrack(bad), [1], '한 줄을 고치면 그 줄 지문이 맞지 않음');
  const cut = s2.lines.filter((_, i) => i !== 1);
  assert.deepEqual(checkTrack(cut), [1], '한 줄을 빼면 다음 줄 앞 지문이 끊김');
  const st = trackSite(s1.lines, TD2);
  assert.deepEqual(st.days, [D1, D2, D3, D4], '적은 줄 + 아직 안 적은 날');
  assert.equal(st.sealed, D3);
  assert.deepEqual([st.w[0][0], st.w[1][0], st.w[3][1]], [1000000, 1100000, 1200000], '100원이 ○원 × 10000(적은 줄 값 그대로 · 둘째 날 110원)');
  assert.deepEqual(trackAll(s1.lines, TD2).map(d => d.day), [D1, D2, D3, D4]);
  assert.deepEqual(readTrack('/없는/파일.jsonl'), []);
  // 저장소 기록이 있으면 지문이 이어져 있어야 함(누가 고치면 이 시험이 막음)
  const f = 'reports/atlas11/su21/settle-track.jsonl';
  if (fs.existsSync(f)) { const L = readTrack(f); assert.ok(Array.isArray(L) && L.length > 0); assert.deepEqual(checkTrack(L), [], '저장소 날마다 기록 지문 — 끊긴 줄 없음'); }
  const sm = rd('scripts/atlas11/next/su21_settle.mjs'), kk = rd('site/su/su-sonja-kkoe.js');
  assert.ok(sm.includes("if (keep && T0 !== null && broken === 0)") && sm.includes('fs.appendFileSync(trackF'), '올리기 작업만 · 지문이 끊기면 덧붙이지 않음 · 덧붙이기만');
  assert.ok(kk.includes('TK ? trackChart(TK, K, nameOf) : null') && kk.includes('trackSpark(TK, x.key)') && kk.includes("'처음 넣은 100원이 날마다 얼마가 됐는지 이었어요.'"), '쪽 — 쌓인 값 꺾은선(기본 그림) · 줄마다 작은 꺾은선');
});

test('이 꾀의 쌓인 값 꺾은선(주문 1119-1005 「꾀 쪽에도 그 꾀의 쌓인 값 꺾은선」) — 꾀 쪽 제4장 · 정산 쪽과 같은 그림(trackSvg) · 먹 선 = 이 꾀 · 산 셈이 없으면 그리지 않음', () => {
  const kk = rd('site/su/su-sonja-kkoe.js');
  assert.ok(kk.includes('function trackSvg(TK, hi)') && kk.includes("trackSvg(TK, [[k, 'sj-trkt']])") && kk.includes("trackSvg(TK, [...(low ? [[low, 'sj-trkl']] : []), ...top.map(k => [k, 'sj-trkt'])])"), '두 쪽이 같은 그림 함수');
  assert.ok(kk.includes('const TK = ST ? trackOf(D, ST.K) : null;') && kk.includes('TK ? kkoeTrack(TK, k) : null'), '꾀 쪽 — 정산과 같은 셈(settle36 · trackOf)');
  assert.ok(kk.includes("'이 꾀의 100원이 날마다 얼마가 됐는지 이었어요.'") && kk.includes("'처음 넣은 100원이 지금 ' + w100(v / 100 - 1) + '이에요.'"), '꾀 쪽 글');
  assert.ok(/if \(n < 2 \|\| v == null \|\| TK\.w\.filter/.test(kk), '산 셈이 없거나 하루치뿐이면 그리지 않음');
});

test('어제와 오늘 · 첫 쪽 기록(주문 1119-1151 「어제의 주식상황은 이랬고 오늘의 주식상황은 … 어제는 이런 병법 … 오늘은 이런 병법」) — 장이 끝난 날만 적음 · 첫 쪽과 같은 꾀 법 · 지문 이음 · 첫 쪽 어제 칸', () => {
  const rank = S36.map(k => ({k})), x = d => ({day: d, prov: false, land: 'shake', win3: {ks: ['g18', 'g02']}, rank});
  assert.deepEqual(sunPick(x('2026-11-18')), {k: 'g18', win: true}, '꾀 셋 첫째');
  assert.deepEqual(sunPick({rank: [{k: 'g05'}, {k: 'g01'}]}), {k: 'g05', win: false}, '꾀 셋이 없으면 덜 잃은 차례 첫째');
  const a = sealSun([], x('2026-11-18'), '2026-11-18T17:06+09:00');
  assert.equal(a.added, '2026-11-18'); assert.equal(a.lines[0].p, ZERO); assert.equal(a.lines[0].rule, SUN_TRACK); assert.deepEqual([a.lines[0].land, a.lines[0].k, a.lines[0].win], ['shake', 'g18', true]);
  assert.equal(sealSun(a.lines, {...x('2026-11-19'), prov: true}, 'x').added, null, '장중 값(굳지 않은 날)은 적지 않음');
  assert.equal(sealSun(a.lines, x('2026-11-18'), 'x').added, null, '같은 날은 다시 적지 않음');
  const b = sealSun(a.lines, {...x('2026-11-19'), land: 'fall', win3: {ks: []}, rank: [{k: 'g07'}, ...rank]}, '2026-11-19T17:06+09:00');
  assert.equal(b.added, '2026-11-19'); assert.equal(b.lines[1].p, b.lines[0].h); assert.deepEqual([b.lines[1].land, b.lines[1].k, b.lines[1].win], ['fall', 'g07', false]);
  assert.deepEqual(checkSun(b.lines), []);
  const bad = JSON.parse(JSON.stringify(b.lines)); bad[0].k = 'g01'; assert.deepEqual(checkSun(bad), [0], '고치면 드러남');
  const sm = rd('scripts/atlas11/next/su21_settle.mjs'), sj = rd('site/su/su-sonja.js'), sp = rd('scripts/atlas11/next/su21_sun.py');
  assert.ok(sm.includes("if (keep && U0 !== null && sunBroken === 0)") && sm.includes("S.sunLog = sunLog"), '올리기 작업만 덧붙임 · 첫 쪽에 마지막 일곱 줄');
  assert.ok(sj.includes('ydBox(T, x), // 어제와 오늘') && sj.includes('export function ydOf(T, x)') && sj.includes("'어제와 ' + now"), '첫 쪽 — 시장을 살피다 칸 안 · 지금 시장 바로 아래');
  assert.ok(sj.includes("q.day < x.day") && sj.includes("pv.pick"), '어제 꾀 = 기록(오늘보다 앞선 마지막 날) · 없으면 같은 법으로 다시 센 것');
  assert.ok(sp.includes("'prev': prev") && sp.includes('rng2 = np.random.default_rng(1119)'), '형세 자료 prev — 따로 굴린 수(오늘 값을 바꾸지 않음)');
});

test('꾀 칸 쌓인 값 작은 꺾은선(주문 1119-1317 「꾀 칸을 보면 눌러야 꺽기 그래프가 나와 바로 보이게 해」) — 꾀 칸 자료 tr · 첫 쪽 꾀 셋 · 꾀 칸 · 꾀 모음 · 누르지 않아도', () => {
  const sm = rd('scripts/atlas11/next/su21_settle.mjs'), sj = rd('site/su/su-sonja.js'), kk = rd('site/su/su-sonja-kkoe.js'), cs = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(sm.includes("const trK = {days: site.tr.days, w: site.tr.w};") && sm.includes('s36.tr = trK; M.n36 = M.n36 || 1;'), '꾀 칸 자료에 정산 쪽과 같은 값');
  assert.ok(sj.includes('export const trSpark = (g, k)') && (sj.match(/trSpark\(g, k\), \/\/ 쌓인 값 작은 꺾은선/g) ?? []).length === 2, '첫 쪽 — 꾀 셋 · 꾀 칸 카드 둘 다');
  assert.ok(kk.includes('trSpark(g, k), // 쌓인 값 작은 꺾은선') && kk.includes('funnel36, eqBox, trSpark}'), '꾀 모음 · 회사 쪽 꾀 한 줄');
  assert.ok(/!\(j >= 0 && j < 36\)/.test(sj) && sj.includes('return sp.length > 1 ? sp : null;'), '이틀 넘게 있어야 그림 · 꾀 번호 밖은 그리지 않음');
  assert.ok(cs.includes("p.on('response', r => { const st = r.status(); if (st >= 400) bad4.push(") && cs.includes("' · 막힌 응답 ' + bad4.slice(0, 3).join(' / ')"), '㉕ 막힌 응답 주소를 글에(걸림 판정은 그대로)');
});

test('판 전체 하루 몫 · 걸어온 길 · 쌓인 장부 전체(주문 1123-2358 · 장부 잣대 1번 「시장과 나란히」 · 3번 「가장 깊이 빠진 때」)', () => {
  assert.equal(MK_MIN, 100);
  const D1 = '2026-11-07', cd = d21(D1), start = cd[10];
  const su = {asOf: {board: D1}, lists: {hot: [{code: '000002', cd}], bloom: [], money: [], quiet: []}};
  // 우량주 120곳 — 날마다 1% 오름(j 짝수) · 1% 내림(j 홀수) · 한 곳은 쪼개기(하루에 반값 — 뺌) · 한 곳은 cFrom 이 다름(뺌)
  const comps = Array.from({length: 120}, (_, i) => ({code: String(100000 + i), name: '회사' + i, date: D1, close: 1000, cFrom: cd[0],
    c: cd.map((_, j) => Math.round(1000 * Math.pow(1.01, Math.ceil(j / 2)) * Math.pow(0.99, Math.floor(j / 2))))}));
  comps.push({code: '200000', name: '쪼갬', date: D1, close: 500, cFrom: cd[0], c: cd.map((_, j) => (j >= 15 ? 500 : 1000))});
  comps.push({code: '200001', name: '다른날', date: D1, close: 900, cFrom: cd[1], c: cd.map(() => 900)});
  const board = {asOf: D1, companies: [{code: '000002', name: '다라', date: D1, close: 2020, c: cd.map((_, i) => 1900 + i), cFrom: cd[0]}, ...comps]};
  const {book} = stepSettle(null, {su, board, stored: {}, sbook: null, days: {days: {}}, start});
  assert.ok(okSettle(book), '장부 꼴(판 전체 하루 몫 포함)');
  assert.deepEqual(Object.keys(book.mk), cd.slice(11), '첫날 뒤 날만 · 날 차례');
  const want = j => { const xs = board.companies.filter(c => c.cFrom === cd[0] && Array.isArray(c.c)).map(c => c.c[j] / c.c[j - 1]).filter(x => x > 0.7 && x < 1.3); return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length * 1e6) / 1e6; };
  for (let j = 11; j < 21; j++) assert.equal(book.mk[cd[j]], want(j), '하루 몫 = 회사마다 전날 → 그날 값의 평균(cFrom 이 다른 곳 · 하루 30% 넘게 움직인 값은 뺌) ' + cd[j]);
  assert.ok(Math.abs(book.mk[cd[15]] - want(14 + 1)) < 1e-9 && Object.values(book.mk).every(f => f > 0.98 && f < 1.02), '쪼개기(반값)는 뺌 — 평균이 끌려가지 않음');
  // 먼저 적은 날은 그대로 — 다음 걸음에서 값이 달라도 고치지 않음
  const b2 = stepSettle(book, {su, board: {...board, companies: board.companies.map(c => ({...c, c: c.c.map(v => v * 2)}))}, stored: {}, sbook: null, days: {days: {}}, start}).book;
  assert.deepEqual(b2.mk, book.mk, '한 번 적은 하루 몫은 고치지 않음');
  // 회사가 100곳 아래면 적지 않음
  const small = stepSettle(null, {su, board: {...board, companies: board.companies.slice(0, 50)}, stored: {}, sbook: null, days: {days: {}}, start}).book;
  assert.deepEqual(small.mk, {}, '회사 100곳 아래 — 적지 않음');
  // su21 목록에 cd 가 없어도 장이 열린 날(cal)로 21 장날을 셈(2026-11-24 올림에서 장부 mk 가 빈 것 — 지금 su21.json 목록에는 cd 가 없음)
  const noCd = {asOf: {board: D1}, lists: {hot: [{code: '000002'}], quiet: []}};
  const viaCal = stepSettle(null, {su: noCd, board, stored: {}, sbook: null, days: {days: {}}, start, cal: ['2026-01-02', ...cd]}).book;
  assert.deepEqual(viaCal.mk, book.mk, '장이 열린 날로 센 하루 몫 = su21 cd 로 센 것');
  // su21 목록 첫 cd 가 한 회사의 날(쉰 날이 있어 첫날이 다름)이어도 장이 열린 날을 먼저 씀(2026-11-24 올림 — 180640 cd 10-23 ~ 11-23 · 판 cFrom 10-26)
  const oddCd = ['2026-10-01', ...cd.slice(0, 20).filter((_, j) => j !== 7)].concat([cd[20]]);
  assert.equal(oddCd.length, 21);
  const suOdd = {asOf: {board: D1}, lists: {hot: [{code: '000002', cd: oddCd}], quiet: []}};
  assert.deepEqual(stepSettle(null, {su: suOdd, board, stored: {}, sbook: null, days: {days: {}}, start, cal: cd}).book.mk, book.mk, '장이 열린 날이 먼저 — 한 회사의 cd 로 세지 않음');
  assert.deepEqual(stepSettle(null, {su: noCd, board, stored: {}, sbook: null, days: {days: {}}, start}).book.mk, {}, 'cd 도 장이 열린 날도 없으면 적지 않음');
  assert.deepEqual(stepSettle(null, {su: noCd, board, stored: {}, sbook: null, days: {days: {}}, start, cal: cd.slice(5)}).book.mk, {}, '판 날까지 21 장날이 안 되면 적지 않음');
  // 걸어온 길 — 첫날 1 · 하루 몫을 곱함 · 빠진 장날에서 멈춤
  const B = {px: {'000001': {[cd[10]]: 1, [cd[11]]: 1, [cd[12]]: 1, [cd[13]]: 1}}, mk: {[cd[11]]: 1.01, [cd[12]]: 0.98}};
  assert.deepEqual(mkLevels(B, cd[13], cd[10]), {[cd[10]]: 1, [cd[11]]: 1.01, [cd[12]]: 0.9898}, '13번째 장날은 하루 몫이 없어 거기서 멈춤');
  assert.deepEqual(mkLevels(B, cd[11], cd[10]), {[cd[10]]: 1, [cd[11]]: 1.01}, '판 날 뒤는 안 셈');
  assert.deepEqual(mkLevels({}, null, cd[10]), {});
  const S = siteSettle({...emptySettle(), px: B.px, mk: B.mk, co: {}}, {}, cd[12], {days: {}}, cd[10]);
  assert.deepEqual(S.mk, {[cd[10]]: 1, [cd[11]]: 1.01, [cd[12]]: 0.9898}, '화면 자료 mk');
  // 쌓인 장부 전체 — 날마다 서른여섯 꾀를 모두 더한 100원이 ○원 × 10000
  const T = trackTotal([], [{day: cd[10], c: [1000, null, 2000], v: [1000, null, 2000]}, {day: cd[11], c: [1000, null, 2000], v: [950, null, 1940]}]);
  assert.deepEqual(T, {days: [cd[10], cd[11]], w: [1000000, 963333]});
});

test('같은 날수로(주문 1124-0226 · 장부 잣대 2번) — 산 날 뒤 1 · 5 · 20 장날 값 · 그 회사의 그날까지 가장 늦은 값 · 판 날 뒤는 안 셈', () => {
  assert.deepEqual([...HZ_KS], [1, 5, 20]);
  const ds = ['2026-11-12', '2026-11-13', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23'];
  const B = {px: {'000001': Object.fromEntries(ds.map((d, i) => [d, 1000 + i * 10])), '000002': {[ds[1]]: 500, [ds[2]]: 510, [ds[5]]: 530}}, mk: {}};
  const buys = [[ds[1], 8, '000001', 1010], [ds[1], 9, '000002', 500], [ds[6], 8, '000001', 1060]];
  const H = horizons(B, buys, ds[7], ds[0]);
  assert.deepEqual(H.ks, [1, 5, 20]);
  assert.deepEqual(H.days, {[ds[1]]: [ds[2], ds[6], null], [ds[6]]: [ds[7], null, null]}, '판 날(11-23) 뒤 장날은 없음');
  assert.deepEqual(H.p, [[1020, 1060, null], [510, 530, null], [1070, null, null]], '000002 는 11-20 값이 없어 그 전 가장 늦은 값(11-19 · 530)');
  const S = siteSettle({...emptySettle(), px: B.px, co: {}}, {[ds[1]]: {g08: ['000001'], g09: ['000002']}, [ds[6]]: {g08: ['000001']}}, ds[7], {days: {}}, ds[0]);
  assert.deepEqual(S.hz.p, S.buys.map(([d, , c]) => H.p[buys.findIndex(b => b[0] === d && b[2] === c)]), '화면 자료 hz.p = 산 셈 차례 그대로');
});

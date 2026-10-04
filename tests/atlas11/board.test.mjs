// 52곳 판 화면 묶음(lib/atlas11/board.mjs) — 2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
// 바뀌지 않는 실제 파일로 본다: 9/28 입력 사본 · 10/2 관측 묶음 · 확인된 일정표 · 10/4 새 52종목 입력
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildBoard, validateBoard, universeNextOf, universeSetOf, companyOf, hidesPrediction, FORBIDDEN_KEYS} from '../../lib/atlas11/board.mjs';
import {buildViewFiles} from '../../scripts/atlas11/build_view.mjs';
import {readJSON, INPUT_928} from './helpers.mjs';

const SNAP = 'reports/atlas11/context/2026-10-02/2026-10-02T13-38-11Z.json', EVENTS = 'public/data/atlas11/schedule-events.json', NEXT = 'reports/atlas11/universe/2026-10-04-v2/next-input.json';
const NOW = '2026-09-28T13:00:00.000Z'; // 9/28(월) 22:00 KST
const sha = x => createHash('sha256').update(x).digest('hex');
/** 심은 결함이 해시 검사보다 뒤 검사에서 잡히는지 보려고 판 목록의 해시를 다시 적는다 */
const rehash = files => { const m = structuredClone(files.get('manifest.json')); for (const [n, v] of files) if (n !== 'manifest.json') m.files[n] = {sha256: sha(JSON.stringify(v)), bytes: 0}; files.set('manifest.json', m); return files; };

async function build(extra = {}) {
  const input = await readJSON(INPUT_928), snap = await readJSON(SNAP), ev = await readJSON(EVENTS);
  return {input, files: buildBoard({input, snap, contextFile: SNAP, events: ev.events, now: NOW, ...extra})};
}

test('판 묶음: 52곳(고른 차례 그대로) · 같은 판 이름 · 종가는 확정 종가 · 출목표 종가 21개 · 그래프 종가 60개 · 일정표 52곳 · 예측 꺼짐 표시', async () => {
  const {input, files} = await build();
  const m = files.get('manifest.json'), b = files.get('board.json');
  assert.equal(m.prediction, 'off'); assert.equal(m.companies, 52); assert.equal(m.asOf, '2026-09-28'); assert.match(m.boardId, /^board-2026-09-28-[0-9a-f]{8}$/);
  assert.deepEqual(b.companies.map(c => c.code), input.assets.map(a => a.code), '정렬하지 않는다(고른 차례)');
  assert.deepEqual([...files.keys()].sort(), ['agenda.json', 'board.json', 'manifest.json', ...input.assets.map(a => 'stocks/' + a.code + '.json')].sort());
  for (const a of input.assets) {
    const c = b.companies.find(x => x.code === a.code), s = files.get('stocks/' + a.code + '.json'), last = a.prices.at(-1), prev = a.prices.at(-2);
    assert.equal(c.close, last.close); assert.equal(c.date, last.date); assert.equal(c.change1, Number((last.close / prev.close - 1).toFixed(6)));
    assert.equal(c.c.length, 21); assert.equal(c.c.at(-1), c.close); assert.equal(s.closes60.length, 60); assert.equal(s.closes60.at(-1).close, c.close);
    assert.ok(c.info.low52 <= c.close && c.close <= c.info.high52 && c.info.pos52 >= 0 && c.info.pos52 <= 1, a.code);
    assert.equal(s.boardId, m.boardId);
  }
  assert.equal(Object.keys(files.get('agenda.json').byCode).length, 52);
  assert.ok(m.market?.items?.length === 2 && m.market.items.every(i => Number.isFinite(i.close)), '시장 띠(코스피·코스닥)');
  assert.equal(validateBoard(files, {input, now: NOW}), true);
  assert.equal(universeSetOf(input).id, 'u1-sector52');
});

test('기사·공시 제목: 앞날을 짐작하는 말이 든 것은 싣지 않고 수만 적는다 · 실린 제목에는 그런 말이 하나도 없다', async () => {
  const {input, files} = await build();
  let hidden = 0, shown = 0;
  for (const a of input.assets) { const c = files.get('stocks/' + a.code + '.json').context; hidden += c.newsHidden + c.disclosuresHidden; shown += c.news.length; assert.ok(c.news.every(n => !hidesPrediction(n.title)) && c.disclosures.every(d => !hidesPrediction(d.title)), a.code); assert.ok(c.news.length <= 6 && c.disclosures.length <= 4); }
  assert.ok(hidden > 0 && shown > 0, `뺀 ${hidden} · 실은 ${shown}`);
});

test('묶음 검사가 잡는다: 예측 열쇠(p50 · probabilities …) · 앞날 말 · 앞날 종가 · 화면 사이 다른 종가 · 판 이름 다름 · 해시 다름', async () => {
  const {input, files} = await build();
  const plant = fn => { const f = new Map([...files].map(([k, v]) => [k, structuredClone(v)])); fn(f); return f; };
  for (const key of ['p50', 'probabilities', 'forecastId', 'futureDates', 'day1', 'selected']) assert.ok(FORBIDDEN_KEYS.includes(key));
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('board.json').companies[0].p50 = 1; })), {input, now: NOW}), /BOARD_PREDICTION_KEYS/);
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('stocks/005930.json').probabilities = {up: .5}; })), {input, now: NOW}), /BOARD_PREDICTION_KEYS/);
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('agenda.json').note = '10월 6일 전망'; })), {input, now: NOW}), /BOARD_PREDICTION_WORDS/);
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('board.json').companies[1].sector = '오를 쪽'; })), {input, now: NOW}), /BOARD_PREDICTION_WORDS/);
  assert.throws(() => validateBoard(rehash(plant(f => { const s = f.get('stocks/005930.json'); s.closes60.push({date: '2026-09-29', close: 1}); })), {input, now: NOW}), /BOARD_STOCK_MISMATCH|BOARD_FUTURE_CLOSE/);
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('stocks/005930.json').close += 100; })), {input, now: NOW}), /BOARD_STOCK_MISMATCH/);
  assert.throws(() => validateBoard(rehash(plant(f => { f.get('agenda.json').boardId = 'board-x'; })), {input, now: NOW}), /BOARD_ID_MISMATCH/);
  assert.throws(() => validateBoard(plant(f => { f.get('board.json').order = '바뀜'; }), {input, now: NOW}), /BOARD_HASH/);
  assert.throws(() => validateBoard(plant(f => { f.get('manifest.json').prediction = 'on'; }), {input, now: NOW}), /BOARD_PREDICTION_FLAG/);
  assert.equal(hidesPrediction('반도체대전 SEDEX'), false); assert.equal(hidesPrediction('투자의견 상향'), true);
});

test('바뀔 52곳 미리 보기: 바꾸는 날(10/6) 16:00 실행 전이면 그날 · 그날 18:00 지나도 안 바뀌었으면 다음 거래일 · 이미 바꿨으면 없음 · 앞날 값 없이 이름만', async () => {
  const input = await readJSON(INPUT_928), next = await readJSON(NEXT), cal = await readJSON('public/data/rolling-calendar.json');
  const config = {next: {id: next.universe.id, switchOn: '2026-10-06', proposal: 'p.json', inputSHA256: 'x'}};
  const n = universeNextOf({config, nextInput: next, input, sessions: cal.sessions, now: '2026-10-04T06:00:00.000Z'});
  assert.equal(n.from, '2026-10-06'); assert.equal(n.companies.length, 52); assert.equal(n.kept + n.added, 52); assert.equal(n.dropped.length, 52 - n.kept);
  assert.ok(!('firstTarget' in n), '첫 예측 목표일 같은 앞날 값은 없다');
  assert.equal(universeNextOf({config, nextInput: next, input, sessions: cal.sessions, now: '2026-10-06T06:30:00.000Z'}).from, '2026-10-06', '10/6 15:30 · 아직 그날');
  assert.equal(universeNextOf({config, nextInput: next, input, sessions: cal.sessions, now: '2026-10-06T09:30:00.000Z'}).from, '2026-10-07', '10/6 18:30 에도 안 바뀌었으면 10/7');
  assert.equal(universeNextOf({config, nextInput: next, input: next, sessions: cal.sessions, now: '2026-10-04T06:00:00.000Z'}), null, '이미 바꿈');
  const {files} = await build({universeNext: n, now: '2026-10-04T06:00:00.000Z'});
  assert.equal(files.get('manifest.json').universeNext.id, next.universe.id);
  assert.equal(validateBoard(files, {input, now: '2026-10-04T06:00:00.000Z'}), true);
});

test('지금 저장소 자료로 만든 판(배포 때와 같은 길 · scripts/atlas11/build_view.mjs)이 검사를 통과한다', async () => {
  const now = new Date().toISOString(), files = await buildViewFiles({now}), m = files.get('manifest.json');
  const input = await readJSON('public/data/input.json'), b = files.get('board.json');
  assert.equal(m.prediction, 'off'); assert.ok(m.companies === input.assets.length && b.companies.length === input.assets.length, '판 곳 수 = 지금 묶음 곳 수(2026-10-04 21:39 부터 180곳)');
  assert.ok(b.groups.reduce((t, g) => t + g.count, 0) === b.companies.length && b.hot && b.next, '업종 칸 · 요즘 불장 업종 · 다음 불장 후보');
  assert.equal(validateBoard(files, {input: await readJSON('public/data/input.json'), now}), true);
});

test('회사 한 곳: 확정 종가만 · 기준일 뒤 날짜는 빼고 · 종가가 하나뿐이면 등락 없음', () => {
  const a = {code: '000001', name: '가짜', sector: '은행', prices: [{date: '2026-09-25', close: 100, finalClose: true}, {date: '2026-09-28', close: 110, finalClose: true}, {date: '2026-09-29', close: 120, finalClose: false}, {date: '2026-09-30', close: 130, finalClose: true}]};
  const c = companyOf(a, {limitDay: '2026-09-29'});
  assert.deepEqual([c.date, c.close, c.prevClose, c.change1], ['2026-09-28', 110, 100, 0.1]);
  const one = companyOf({...a, prices: a.prices.slice(0, 1)}, {limitDay: '2026-09-29'});
  assert.equal(one.change1, null); assert.equal(one.info.pos52, null); assert.equal(one.info.ret21, null);
});

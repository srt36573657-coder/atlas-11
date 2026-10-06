// 「지난 6개월 앞서 달린 곳」(lib/atlas11/lead6.mjs) — 사장님 2026-10-06 14:55 「해」(지도 탭 맨 아래 접힌 상자 하나 · 지난 종가로만 · 앞날 값 없음)
// 잣대는 공부(scripts/atlas11/study/third_way_20y.py)와 같게 — 회사 120거래일 · 업종 같은 무게 하루 오르내림 지수 120거래일 · 위 20% · 두 겹 · 지수 250거래일 자리
import test from 'node:test';
import assert from 'node:assert/strict';
import {LEAD6, pctRank, changeOf, groupChangeOf, lead6Of, indexPosition, mergeIndexRows} from '../../lib/atlas11/lead6.mjs';
import {buildBoard, validateBoard, boardAsOf} from '../../lib/atlas11/board.mjs';
import {readJSON, INPUT_928} from './helpers.mjs';

const day = i => new Date(Date.UTC(2025, 0, 1) + i * 86400000).toISOString().slice(0, 10);
/** 날마다 r 만큼 오르는 종가 줄(n 개) */
const rowsOf = (n, r, start = 100, skip = new Set()) => { const out = []; let c = start; for (let i = 0; i < n; i++) { if (i) c *= 1 + (typeof r === 'function' ? r(i) : r); if (!skip.has(i)) out.push({date: day(i), close: Number(c.toFixed(6))}); } return out; };

test('같은 값은 평균 순위 백분위(pandas rank(pct=True) 와 같음)', () => {
  assert.deepEqual(pctRank([0.1, 0.5, 0.5]), [1 / 3, 2.5 / 3, 2.5 / 3]);
  assert.deepEqual(pctRank([3, 1, 2, 4, 5]), [0.6, 0.2, 0.4, 0.8, 1]);
});

test('회사 120거래일 변화 — 121개 종가가 있어야 · 그 안에 하루 한도(한국 31%) 넘는 날이 있으면 셈하지 않음', () => {
  const rows = rowsOf(130, 0.01);
  assert.equal(changeOf(rows), Number((rows.at(-1).close / rows.at(-121).close - 1).toFixed(6)));
  assert.equal(changeOf(rows.slice(0, 120)), null, '120개면 모자람');
  const jump = rowsOf(130, i => (i === 100 ? -0.5 : 0.01)); // 액면 분할 같은 끊김
  assert.equal(changeOf(jump), null);
  assert.ok(Number.isFinite(changeOf(rowsOf(130, i => (i === 100 ? -0.4 : 0.01)), {jump: LEAD6.jump.us})), '미국 한도는 50%');
  assert.equal(changeOf(rowsOf(130, i => (i === 5 ? -0.5 : 0.01))), Number((rowsOf(130, i => (i === 5 ? -0.5 : 0.01)).at(-1).close / rowsOf(130, i => (i === 5 ? -0.5 : 0.01)).at(-121).close - 1).toFixed(6)), '창 밖 끊김은 상관없음');
});

test('업종 지수 — 같은 무게 하루 오르내림을 이어 붙임 · 그 날 3곳 넘게일 때만 · 처음 · 마지막 날이 모두 있어야 · 한도 넘는 날은 그 회사만 뺌', () => {
  const dates = rowsOf(130, 0).map(r => r.date);
  /** 따로 셈: 날짜마다 회사들 그 날 오르내림(바로 앞 줄 → 그 날 줄)을 찾아 평균 */
  const expect = (members, minM = 3, jump = LEAD6.jump.kr) => {
    const last = dates.length - 1, first = last - 120;
    const retOn = (rows, d) => { const i = rows.findIndex(r => r.date === d); if (i < 1) return null; const r = rows[i].close / rows[i - 1].close - 1; return Math.abs(r) > jump ? null : r; };
    const on = d => members.map(m => retOn(m, d)).filter(x => x !== null);
    if (on(dates[last]).length < minM || on(dates[first]).length < minM) return null;
    let v = 1; for (let p = first + 1; p <= last; p++) { const xs = on(dates[p]); if (xs.length >= minM) v *= 1 + xs.reduce((t, x) => t + x, 0) / xs.length; }
    return Number((v - 1).toFixed(6));
  };
  const a = rowsOf(130, 0.01), b = rowsOf(130, 0.02), c = rowsOf(130, 0);
  assert.equal(groupChangeOf([a, b, c], dates), expect([a, b, c]));
  assert.ok(Math.abs(groupChangeOf([a, b, c], dates) - (1.01 ** 120 - 1)) < 1e-4, '날마다 1%씩 120일');
  assert.equal(groupChangeOf([a, b], dates), null, '두 곳뿐이면 지수 없음');
  const cMiss = rowsOf(130, 0, 100, new Set([60])); // 한 곳이 하루 빠지면 그 날은 두 곳 → 그 날은 더하지 않음 · 다음 날 그 회사는 이틀 치
  assert.equal(groupChangeOf([a, b, cMiss], dates), expect([a, b, cMiss]));
  assert.notEqual(groupChangeOf([a, b, cMiss], dates), groupChangeOf([a, b, c], dates));
  const d = rowsOf(130, i => (i === 70 ? -0.6 : 0));
  assert.equal(groupChangeOf([a, b, c, d], dates), expect([a, b, c, d]));
});

test('판 전체 — 업종 · 회사 위 20%(백분위 0.8 이상 — 공부와 같음) · 두 겹 · 업종은 10개 넘게 셀 수 있을 때만', () => {
  const companies = [];
  for (let g = 0; g < 10; g++) for (let k = 0; k < 3; k++) companies.push({code: `G${g}C${k}`, groupId: 'g' + g, rows: rowsOf(130, 0.001 * (g + 1) + 0.0001 * k)});
  const L = lead6Of(companies);
  assert.equal(L.measured.groups, 10); assert.equal(L.measured.companies, 30);
  assert.deepEqual([...L.groups].filter(([, v]) => v.lead).map(([id]) => id).sort(), ['g7', 'g8', 'g9'], '10개 가운데 8 · 9 · 10위(8/10 = 0.8)');
  assert.deepEqual([...L.companies].filter(([, v]) => v.lead).map(([c]) => c).sort(), ['G7C2', 'G8C0', 'G8C1', 'G8C2', 'G9C0', 'G9C1', 'G9C2'], '30곳 가운데 24위부터(24/30 = 0.8)');
  assert.equal(L.lead.both, 7); assert.equal(L.to, day(129)); assert.equal(L.from, day(9));
  const few = lead6Of(companies.filter(c => c.groupId !== 'g0'));
  assert.equal(few.measured.groups, 9); assert.equal(few.lead.groups, 0, '업종 9개면 업종 위 20% 표시를 하지 않음'); assert.equal(few.lead.both, 0);
});

test('지수 자리 — 지난 250거래일 가운데 가장 높은 종가와 견줌 · 250개가 모자라면 없음 · upTo 날 뒤는 보지 않음', () => {
  const rows = rowsOf(300, i => (i < 200 ? 0.002 : -0.003));
  const p = indexPosition(rows);
  assert.equal(p.date, day(299)); assert.equal(p.highDate, day(199)); assert.equal(p.days, 250);
  assert.equal(p.gap, Number((rows[299].close / rows[199].close - 1).toFixed(6)));
  assert.equal(indexPosition(rows.slice(0, 249)), null);
  assert.equal(indexPosition(rows, {upTo: day(250)}).date, day(250));
});

test('지수 종가 이어 붙이기 — 쌓아 둔 날은 고치지 않음 · upTo 날까지 없는 날만 · 값이 다르면 알림만', () => {
  const stored = [{date: '2026-09-30', close: 100}, {date: '2026-10-01', close: 101}];
  const live = [{date: '2026-10-01', close: 999}, {date: '2026-10-02', close: 102}, {date: '2026-10-06', close: 103}];
  const m = mergeIndexRows(stored, live, {upTo: '2026-10-02'});
  assert.deepEqual(m.rows, [{date: '2026-09-30', close: 100}, {date: '2026-10-01', close: 101}, {date: '2026-10-02', close: 102}]);
  assert.deepEqual(m.added, ['2026-10-02']); assert.deepEqual(m.mismatch, [{date: '2026-10-01', stored: 101, live: 999}]);
  assert.deepEqual(stored, [{date: '2026-09-30', close: 100}, {date: '2026-10-01', close: 101}], '받은 줄은 바꾸지 않음');
});

test('판(buildBoard): 회사 · 업종에 120거래일 변화와 위 20% 표시 · lead6 요약이 그 표시와 맞음 · 지수 자리 · 앞날 열쇠 없음 · 검사 통과', async () => {
  const input = await readJSON(INPUT_928), NOW = '2026-09-28T13:00:00.000Z', asOf = boardAsOf(input, NOW);
  const ix = rowsOf(260, 0.001).map((r, i) => ({date: r.date, close: r.close})); // 지수는 가짜 줄로(날짜만 판보다 앞)
  const files = buildBoard({input, now: NOW, indexHistory: {symbol: 'KOSPI', name: '코스피', rows: ix}});
  const b = files.get('board.json');
  assert.equal(b.asOf, asOf);
  assert.ok(b.lead6 && b.lead6.days === 120 && b.lead6.top === 0.2);
  assert.equal(b.groups.filter(g => g.lead6).length, b.lead6.lead.groups); assert.equal(b.companies.filter(c => c.lead6).length, b.lead6.lead.companies);
  const gl = new Set(b.groups.filter(g => g.lead6).map(g => g.id));
  assert.equal(b.companies.filter(c => c.lead6 && gl.has(c.group.id)).length, b.lead6.lead.both);
  assert.equal(b.lead6.index.date, ix.at(-1).date); assert.equal(b.lead6.index.name, '코스피');
  for (const c of b.companies) assert.equal(files.get('stocks/' + c.code + '.json').change120, c.change120);
  assert.ok(validateBoard(files, {input, now: NOW}));
  const none = buildBoard({input, now: NOW}).get('board.json');
  assert.equal(none.lead6.index, null); assert.equal(none.lead6.indexMissing, '지수 종가 기록 없음');
  // 심은 결함: 위 20% 표시를 하나 지우면 검사가 잡는다(판 목록 해시가 먼저 잡더라도 실패)
  const bad = structuredClone(b), victim = bad.companies.find(c => c.lead6); assert.ok(victim, '9/28 입력에도 위 20% 회사가 있음'); victim.lead6 = false; files.set('board.json', bad);
  assert.throws(() => validateBoard(files, {input, now: NOW}), /BOARD_LEAD6|BOARD_HASH/);
});

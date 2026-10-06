// 아래 탭 「기록」(lib/atlas11/changelog.mjs) — 사장님 2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 별도의 탭에 … 기록 하는 탭을 만들어 줘」
// 업데이트(화면을 바꾼 날) · 자료 변경(자료가 바뀐 날) — 한 줄 한 파일 · 고치지 않음 · 사이트에는 /changelog.json 한 파일(새것이 위)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {CHANGELOG, kd, toKst, stampOf, boardSnap, dataEntry, validateEntry, liveOf, siteLog, readEntries, writeEntry, recordBoardChange} from '../../lib/atlas11/changelog.mjs';
import {root} from './helpers.mjs';

/** 가짜 판 — 회사 n곳(코드 · 이름) · 불장 업종 · 늦은 종가 · 모은 자료 · 들고 남 */
const boardOf = ({asOf = '2026-10-02', n = 6, hot = ['a', 'b'], late = [], missing = [], day = '2026-10-02', moves = null, codes = null} = {}) => ({
  boardId: 'board-' + asOf, asOf, groups: [{id: 'a'}, {id: 'b'}, {id: 'c'}],
  hot: {items: hot.map(id => ({id, label: '업종' + id.toUpperCase()}))}, late, moves,
  companies: (codes ?? Array.from({length: n}, (_, i) => String(100000 + i))).map(code => ({code, name: '회사' + code.slice(-2), brief: {day, missing}})),
});

test('날짜 · 시각 모양 — 「10월 2일(금)」 · 한국 시각 ISO · 파일 이름 시각', () => {
  assert.equal(kd('2026-10-02'), '10월 2일(금)'); assert.equal(kd('2026-10-05'), '10월 5일(월)'); assert.equal(kd('2026-10-06T00:38:26+09:00'), '10월 6일(화)');
  assert.equal(toKst('2026-10-05T15:38:26.255Z'), '2026-10-06T00:38:26+09:00');
  assert.equal(stampOf('2026-10-05T15:38:26Z'), '20261006T003826');
});

test('자료 변경 — 첫 판 · 같은 판(줄 없음) · 새 종가(불장 들고 남) · 회사 목록 · 모은 자료 · 들고 남', () => {
  const b1 = boardOf({missing: ['수급', '기사', '공시']});
  const e1 = dataEntry(null, b1, {place: 'kr', made: '2026-10-05T00:32:49Z'});
  assert.equal(e1.id, 'kr-20261005T093249'); assert.equal(e1.made, '2026-10-05T09:32:49+09:00'); assert.equal(e1.kind, 'data'); assert.equal(e1.asOf, '2026-10-02');
  assert.equal(e1.title, '10월 2일(금) 종가로 판을 만듦');
  assert.deepEqual(e1.what.slice(0, 3), ['10월 2일(금) 종가 · 회사 6곳 · 업종 3개', '불장 업종 2개: 업종A · 업종B', '수급 · 기사 · 공시를 모은 회사 0곳 · 나머지 6곳은 아직']);
  assert.deepEqual(validateEntry(e1), []);
  assert.equal(dataEntry(e1.snap, b1, {place: 'kr', made: '2026-10-05T01:00:00Z'}), null, '같은 판이면 줄이 생기지 않음');
  // 모은 자료만 바뀜 + 기사 모은 날
  const b2 = boardOf({day: '2026-10-06'});
  const e2 = dataEntry(e1.snap, b2, {place: 'kr', made: '2026-10-05T15:38:26Z'});
  assert.equal(e2.title, '수급 · 기사 · 공시를 새로 모음'); assert.deepEqual(e2.what, ['종가는 10월 2일(금) 그대로', '수급 · 기사 · 공시를 모은 회사 0곳 → 6곳']);
  // 들고 남 첫 기록
  const b3 = boardOf({day: '2026-10-06', moves: {records: 1, to: '2026-10-02', first: true}});
  const e3 = dataEntry(e2.snap, b3, {place: 'kr', made: '2026-10-05T15:41:08Z'});
  assert.equal(e3.title, '저녁 7시 들고 남 기록'); assert.match(e3.what.at(-1), /^저녁 7시 들고 남 첫 기록\(10월 2일\(금\) 종가\)/);
  // 새 종가 · 불장 들고 남 · 늦은 종가 · 회사 하나 바뀜
  const codes = [...b3.companies.map(c => c.code).slice(1), '200000'];
  const b4 = boardOf({asOf: '2026-10-06', hot: ['b', 'c'], day: '2026-10-06', late: [{code: '100001', name: '회사01', date: '2026-10-02'}], moves: {records: 1, to: '2026-10-02'}, codes});
  const e4 = dataEntry(e3.snap, b4, {place: 'kr', made: '2026-10-06T07:30:00Z'});
  assert.equal(e4.title, '10월 6일(화) 종가로 판을 새로 만듦');
  assert.deepEqual(e4.what, ['종가 날짜: 10월 2일(금) → 10월 6일(화)', '회사 6곳 → 6곳 · 들어옴 1곳(회사00) · 나감 1곳(회사00)', '불장 업종 2개 → 2개 · 들어옴: 업종C · 나감: 업종A', '늦은 종가 1곳: 회사01(10월 2일(금) 종가까지)']);
  assert.deepEqual(validateEntry(e4), []);
});

test('미국 판 — 뉴욕 종가 · 기사만(수급 · 공시는 미국 판에 없음)', () => {
  const e = dataEntry(null, boardOf({missing: ['수급', '공시']}), {place: 'us', made: '2026-10-05T11:08:22Z'});
  assert.equal(e.id, 'us-20261005T200822'); assert.equal(e.title, '미국 판 — 10월 2일(금) 뉴욕 종가로 판을 만듦');
  assert.equal(e.what[0], '10월 2일(금) 뉴욕 종가 · 회사 6곳 · 업종 3개'); assert.equal(e.what[2], '기사를 모은 회사 6곳 · 수급 · 공시는 미국 판에 없음');
  const e2 = dataEntry(e.snap, boardOf({asOf: '2026-10-05', missing: ['수급', '공시'], day: '2026-10-06'}), {place: 'us', made: '2026-10-06T00:00:00Z'});
  assert.equal(e2.title, '미국 판 — 10월 5일(월) 뉴욕 종가로 판을 새로 만듦'); assert.equal(e2.what[0], '뉴욕 종가 날짜: 10월 2일(금) → 10월 5일(월)');
});

test('검사 — 앞날 말 · 모양 · 업데이트는 place all · 줄 수', () => {
  const ok = {schema: CHANGELOG.entrySchema, id: 'u-20261006T180000-log', kind: 'update', place: 'all', made: '2026-10-06T18:00:00+09:00', title: '아래 탭 「기록」', what: ['업데이트 · 자료 변경 날짜']};
  assert.deepEqual(validateEntry(ok), []);
  assert.ok(validateEntry({...ok, what: ['내일 예측 한 줄']}).some(x => x.includes('예측')));
  assert.ok(validateEntry({...ok, title: '곧 오른다'}).length);
  assert.ok(validateEntry({...ok, place: 'kr'}).includes('update 는 place all'));
  assert.ok(validateEntry({...ok, made: '2026-10-06 18:00'}).includes('made'));
  assert.ok(validateEntry({...ok, what: Array(9).fill('x')}).includes('what'));
  assert.ok(validateEntry({...ok, kind: 'data', place: 'kr'}).includes('asOf'), '자료 변경은 종가 날짜가 있어야');
  assert.ok(validateEntry({...ok, commits: ['zz']}).includes('commits'));
});

test('사이트 기록 — 올라간 때 = 만든 때 뒤 첫 성공 올림 · 없으면 이 묶음 때 · 새것이 위 · 요약(snap) 빼고 · 걸린 줄은 problems', () => {
  const deploys = [{at: '2026-10-05T02:07:23.348Z'}, {at: '2026-10-05T05:37:01.864Z'}];
  assert.equal(liveOf('2026-10-05T11:02:41+09:00', deploys, 'x'), '2026-10-05T11:07:23+09:00');
  assert.equal(liveOf('2026-10-05T14:37:17+09:00', deploys, 'x'), 'x', '뒤 올림이 없으면 이 묶음 때');
  const a = dataEntry(null, boardOf(), {place: 'kr', made: '2026-10-05T00:32:49Z'});
  const u = {schema: CHANGELOG.entrySchema, id: 'u-20261005T110241-tabs4', kind: 'update', place: 'all', made: '2026-10-05T11:02:41+09:00', title: '아래 탭을 넷으로', what: ['…']};
  const bad = {...u, id: 'u-bad', what: ['예측 하나']};
  const log = siteLog([a, u, bad, {...u}], {deploys: [{at: '2026-10-05T00:47:33Z'}, ...deploys], now: '2026-10-06T09:00:00Z'});
  assert.deepEqual(log.entries.map(e => e.id), ['u-20261005T110241-tabs4', 'kr-20261005T093249']);
  assert.deepEqual(log.entries.map(e => e.live), ['2026-10-05T11:07:23+09:00', '2026-10-05T09:47:33+09:00']);
  assert.ok(log.entries.every(e => !('snap' in e) && !('auto' in e)));
  assert.deepEqual(log.problems.map(p => p.id), ['u-bad', 'u-20261005T110241-tabs4'], '앞날 말 · id 겹침은 빼고 적음');
  assert.deepEqual(log.count, {all: 2, update: 1, data: 1}); assert.equal(log.generatedAt, '2026-10-06T18:00:00+09:00');
});

test('파일 — 새로 만들기만(이미 있으면 그대로) · 판을 만들 때 앞 기록과 같으면 쓰지 않음', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-log-'));
  const r1 = await recordBoardChange(dir, boardOf(), {place: 'kr', made: '2026-10-05T00:32:49Z'});
  assert.equal(r1.wrote, true); assert.equal(r1.file, path.join(CHANGELOG.dirs.kr, 'kr-20261005T093249.json'));
  const r2 = await recordBoardChange(dir, boardOf(), {place: 'kr', made: '2026-10-05T01:00:00Z'});
  assert.equal(r2.wrote, false, '같은 자료면 줄 없음');
  const r3 = await recordBoardChange(dir, boardOf({asOf: '2026-10-06'}), {place: 'kr', made: '2026-10-06T07:30:00Z'});
  assert.equal(r3.wrote, true); assert.equal(r3.title, '10월 6일(화) 종가로 판을 새로 만듦');
  const first = (await readEntries(dir, CHANGELOG.dirs.kr))[0];
  const again = await writeEntry(dir, CHANGELOG.dirs.kr, {...first, title: '고쳐 쓰기'});
  assert.equal(again.wrote, false); assert.equal((await readEntries(dir, CHANGELOG.dirs.kr))[0].title, first.title, '쓴 기록은 고치지 않음');
  await assert.rejects(writeEntry(dir, CHANGELOG.dirs.kr, {...first, id: 'kr-x1', what: ['예측']}), /CHANGE_INVALID/);
  await fs.rm(dir, {recursive: true, force: true});
});

test('저장소의 기록 — 모두 검사 통과 · id 겹침 없음 · 업데이트는 까닭과 커밋 · 자료 변경은 앞 기록과 견준 차례가 맞음', async () => {
  const kr = await readEntries(root, CHANGELOG.dirs.kr), us = await readEntries(root, CHANGELOG.dirs.us), up = await readEntries(root, CHANGELOG.dirs.updates);
  const all = [...kr, ...us, ...up];
  assert.ok(up.length >= 15 && kr.length >= 3 && us.length >= 1, `업데이트 ${up.length} · 한국 ${kr.length} · 미국 ${us.length}`);
  for (const e of all) assert.deepEqual(validateEntry(e), [], e.id);
  assert.equal(new Set(all.map(e => e.id)).size, all.length);
  for (const e of up) { assert.equal(e.kind, 'update'); assert.ok(e.why && e.commits?.length, e.id + ' 까닭 · 커밋'); }
  // 자동 줄(snap 있음)은 앞 줄 snap 과 견줘 다시 만들면 같은 제목 · 같은 첫 줄(손으로 덧붙인 사실은 뒤에만)
  for (const [place, es] of [['kr', kr], ['us', us]]) {
    let prev = null;
    for (const e of es.filter(x => x.snap)) {
      assert.equal(e.place, place); assert.equal(e.snap.asOf, e.asOf);
      if (prev) assert.ok(e.made > prev.made, e.id + ' 차례');
      prev = e;
    }
  }
  const log = siteLog(all, {deploys: [], now: new Date().toISOString()});
  assert.equal(log.problems.length, 0); assert.equal(log.count.all, all.length);
});

test('snap — 판에서 셈(모은 자료 · 기사 모은 날은 가장 많은 날)', () => {
  const s = boardSnap(boardOf({missing: ['공시'], day: '2026-10-06'}), {place: 'kr'});
  assert.deepEqual(s.collected, {news: 6, flows: 6, disclosures: 0}); assert.equal(s.briefDay, '2026-10-06'); assert.equal(s.n, 6); assert.equal(s.codes.length, 6);
});

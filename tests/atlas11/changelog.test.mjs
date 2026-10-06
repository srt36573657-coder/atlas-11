// 아래 탭 「기록」(lib/atlas11/changelog.mjs) — 사장님 2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 별도의 탭에 … 기록 하는 탭을 만들어 줘」
// 업데이트(화면을 바꾼 날) · 자료 변경(자료가 바뀐 날) — 한 줄 한 파일 · 고치지 않음 · 사이트에는 /changelog.json 한 파일(새것이 위)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {CHANGELOG, ISSUE, kd, toKst, stampOf, boardSnap, dataEntry, issueEntry, mentions, validateEntry, liveOf, siteLog, readEntries, writeEntry, recordBoardChange, recordIssue} from '../../lib/atlas11/changelog.mjs';
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
  assert.deepEqual(log.count, {all: 2, update: 1, data: 1, issue: 0}); assert.equal(log.generatedAt, '2026-10-06T18:00:00+09:00');
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

/* ---- 이슈(2026-10-06 18:37 「이날 어떤 이슈들이 있었는지도 이슈칸을 만들어서 기록해 좋은방법으로」) ---- */
/** 가짜 판 — 회사 10곳(그 날 종가 · 하루 변화) · 업종 셋 · 지수 · 관측 묶음(환율 · 기사 · 공시) */
const D = '2026-10-06';
const issueBoard = ({late = 0} = {}) => {
  const ch = [0.12, 0.08, 0.05, 0.01, 0, 0, -0.01, -0.02, -0.04, -0.09];
  const names = ['알파', 'LS', '필립스 66', '감마전자', '델타', '엡실론', '제타', '에타', '세타', '이오타'];
  return {asOf: D, groups: [{label: '전기 부품', codes: ['c0', 'c1', 'c2']}, {label: '신약 개발', codes: ['c7', 'c8', 'c9']}, {label: '둘뿐', codes: ['c3', 'c4']}],
    companies: ch.map((x, i) => ({code: 'c' + i, name: names[i], date: i < late ? '2026-10-02' : D, change1: x}))};
};
const issueManifest = {market: {items: [{name: '코스피', date: D, close: 7050.5, changePct: 0.67}, {name: '코스닥', date: '2026-10-02', close: 890, changePct: -0.3}]}};
const at = (d, hm) => `${d}T${hm}:00+09:00`;
const issueSnap = {fetchedAt: '2026-10-06T09:39:40Z',
  macro: [{id: 'FX_USDKRW', rows: [{date: '2026-10-02', value: 1343.4, changePct: -1.18}, {date: D, value: 1350.1, changePct: 0.5}]}],
  news: [
    {code: 'c3', items: [{title: '감마전자, 새 공장 준공', office: '가신문', publishedAt: at(D, '09:10'), clusterSize: 3}, {title: '감마전자 실적 발표', office: '나신문', publishedAt: at(D, '15:40'), clusterSize: 1},
      {title: '감마전자 주가 오를 것', office: '다신문', publishedAt: at(D, '16:00'), clusterSize: 9}, {title: '감마전자, 새 공장 준공', office: '라신문', publishedAt: at(D, '09:20'), duplicateOf: 'x'}]},
    {code: 'c1', items: [{title: 'LS전선, 해저 케이블 수주', office: '가신문', publishedAt: at(D, '10:00')}, {title: 'LS, 자사주 소각', office: '나신문', publishedAt: at(D, '11:00')}]},
    {code: 'c0', items: [{title: '알파 어제 기사', office: '가신문', publishedAt: at('2026-10-05', '20:00')}, {title: '시장 전체 기사', office: '가신문', publishedAt: at(D, '12:00')}]},
  ],
  disclosures: [{code: 'c5', items: [{title: '(주)엡실론 주식 소각 결정', publishedAt: at(D, '16:30'), corporateAction: true, actionWord: '소각'}, {title: '엡실론 정기 공시', publishedAt: at(D, '16:31'), corporateAction: false},
    {title: '(주)엡실론 자기주식 취득 결정', publishedAt: at(D, '16:40'), corporateAction: true, actionWord: '자기주식'}, {title: '(주)엡실론 주식 소각 결정(정정)', publishedAt: at(D, '16:50'), corporateAction: true, actionWord: '소각'}]},
    {code: 'c9', items: [{title: '이오타 유상증자 결정', publishedAt: at(D, '17:00'), corporateAction: true, actionWord: '유상증자'}]},
    {code: 'c6', items: [{title: '제타 유상증자 결정', publishedAt: at('2026-10-02', '16:30'), corporateAction: true}]}]};

test('이슈 — 그 날 지수 · 환율 · 오른/내린 곳 · 업종 평균 · 기사가 몰린 곳 · 대표 기사 · 회사 일 공시(지난 일만 · 앞날 말 뺌)', () => {
  const e = issueEntry(issueBoard(), issueManifest, issueSnap, {place: 'kr', made: '2026-10-06T10:05:00Z'});
  assert.equal(e.id, 'issue-kr-20261006T190500'); assert.equal(e.kind, 'issue'); assert.equal(e.asOf, D); assert.equal(e.made, '2026-10-06T19:05:00+09:00');
  assert.equal(e.title, '10월 6일(화) 한국 장 이슈');
  assert.deepEqual(e.what, [
    '코스피 7,050.50포인트 +0.67% · 원/달러 1,350.1원 +0.50%',
    '오른 회사 4곳 · 내린 회사 4곳 · 그대로 2곳(그 날 종가가 있는 10곳)',
    '하루 가장 오른 회사: 알파 +12.0% · LS +8.0% · 필립스 66 +5.0%',
    '하루 가장 내린 회사: 이오타 −9.0% · 세타 −4.0% · 에타 −2.0%',
    '업종 하루 평균: 가장 오름 전기 부품 +8.3% · 가장 내림 신약 개발 −5.0%',
    '기사가 가장 몰린 곳: 감마전자 3건 · LS 2건 · 알파 1건',
    '감마전자 대표 기사: 「감마전자, 새 공장 준공」(가신문 · 09:10)',
    '회사 일 공시 4건: 이오타 1건(유상증자) · 엡실론 3건(소각, 자기주식)',
  ], '코스닥은 다른 날 값이라 뺌 · 둘뿐인 업종은 뺌 · 겹친 기사 · 다른 날 기사는 셈에서 뺌 · 대표 기사는 이름이 나온 것만(「LS전선」은 아님) · 앞날 말 제목은 대표에서 뺌 · 공시는 회사마다 늦은 차례');
  assert.deepEqual(e.idents, ['필립스 66']);
  assert.equal(e.source, '네이버 증권(종가 · 지수 · 환율 · 기사 · 공시) · 기사 · 공시는 10월 6일(화) 18:39까지 모은 것 · 기사는 회사마다 20건까지 봄 · 앞날 말이 든 기사 제목은 싣지 않음');
  assert.deepEqual(validateEntry(e), []);
  // 관측 묶음이 없으면 그 줄만 뺌
  assert.deepEqual(issueEntry(issueBoard(), null, null, {place: 'kr', made: '2026-10-06T10:05:00Z'}).what.map(x => x.split(/[:(]/)[0]), ['오른 회사 4곳 · 내린 회사 4곳 · 그대로 2곳', '하루 가장 오른 회사', '하루 가장 내린 회사', '업종 하루 평균']);
  // 한 쪽(20건)이 모두 그 날이면 「20건 넘음」 — 그런 곳끼리는 20건이 짧은 사이에 나온 곳이 앞
  const feed = (code, from) => ({code, items: Array.from({length: 20}, (_, i) => ({title: `기사 ${i}`, office: '가신문', publishedAt: `${D}T${String(from + Math.floor(i / 6)).padStart(2, '0')}:${String((i % 6) * 10).padStart(2, '0')}:00+09:00`}))});
  const busy = issueEntry(issueBoard(), issueManifest, {...issueSnap, news: [feed('c4', 9), feed('c5', 15), ...issueSnap.news]}, {place: 'kr', made: '2026-10-06T10:05:00Z'});
  assert.ok(busy.what.includes('기사가 가장 몰린 곳: 엡실론 20건 넘음 · 델타 20건 넘음 · 감마전자 3건'), busy.what.join('\n'));
  const busy3 = issueEntry(issueBoard(), issueManifest, {...issueSnap, news: [feed('c4', 9), feed('c5', 15), feed('c6', 12)]}, {place: 'kr', made: '2026-10-06T10:05:00Z'});
  assert.ok(busy3.what.includes('기사가 가장 몰린 곳: 엡실론 · 제타 · 델타(세 곳 모두 그 날 20건 넘음)'), busy3.what.join('\n'));
  // 그 날 종가가 90% 안 되면 쓰지 않음(한 번 쓰면 고치지 않으므로)
  assert.equal(issueEntry(issueBoard({late: 2}), issueManifest, issueSnap, {place: 'kr', made: '2026-10-06T10:05:00Z'}), null);
  assert.equal(ISSUE.minShare, 0.9);
});

test('이슈 · 미국 판 — 기사는 뉴욕 날짜로 셈 · 대표 기사 시각은 한국 시각과 날짜 · 공시 · 환율 줄 없음', () => {
  const b = issueBoard(), N = '2026-10-05';
  b.asOf = N; for (const c of b.companies) c.date = N;
  const snap = {fetchedAt: '2026-10-06T09:39:20Z', news: [{code: 'c3', items: [
    {title: '감마전자, 신제품 공개', office: '로이터', publishedAt: '2026-10-06T03:15:00+09:00'}, // 뉴욕 10월 5일 14:15
    {title: '감마전자 지난 밤 기사', office: '로이터', publishedAt: '2026-10-05T12:00:00+09:00'}]}], // 뉴욕 10월 4일 23:00
    macro: issueSnap.macro, disclosures: issueSnap.disclosures};
  const e = issueEntry(b, {market: {items: [{name: 'S&P 500', date: N, close: 7773.95, changePct: 0.66}]}}, snap, {place: 'us', made: '2026-10-06T09:39:59Z'});
  assert.equal(e.title, '10월 5일(월) 뉴욕 장 이슈'); assert.equal(e.place, 'us'); assert.equal(e.asOf, N);
  assert.equal(e.what[0], 'S&P 500 7,773.95포인트 +0.66%');
  assert.ok(e.what.includes('기사가 가장 몰린 곳: 감마전자 1건'), '뉴욕 10월 4일 기사는 셈에서 뺌');
  assert.ok(e.what.includes('감마전자 대표 기사: 「감마전자, 신제품 공개」(로이터 · 한국 시각 10월 6일(화) 03:15)'));
  assert.ok(!e.what.some(x => x.startsWith('회사 일 공시') || x.includes('원/달러')));
  assert.deepEqual(e.idents.sort(), ['S&P 500', '필립스 66']);
  assert.match(e.source, /기사는 10월 6일\(화\) 18:39까지 모은 것/);
});

test('이슈 · 이름 찾기 — 짧은 이름은 낱말 경계(LS전선 · SK하이닉스는 아님) · 조사는 맞음', () => {
  for (const [t, n, want] of [['LS전선, 해저 케이블', 'LS', false], ['LS, 자사주 소각', 'LS', true], ['LS는 오늘', 'LS', true], ['SK하이닉스 신고가', 'SK', false], ['XLS 펀드', 'LS', false],
    ['인텔리전스 강화', '인텔', false], ['인텔, 새 칩', '인텔', true], ['효성중공업 수주', '효성', false], ['효성이 발표', '효성', true], ['삼성전자가 발표', '삼성전자', true], ['베이커 휴즈, 계약', '베이커 휴즈', true]])
    assert.equal(mentions(t, n), want, `${n} · ${t}`);
});

test('이슈 · 파일 — 종가 날짜마다 한 번(같은 날 두 번째는 쓰지 않음) · 사이트에는 같은 날 먼저 것만', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-issue-'));
  const r1 = await recordIssue(dir, issueBoard(), issueManifest, issueSnap, {place: 'kr', made: '2026-10-06T10:05:00Z'});
  assert.equal(r1.wrote, true); assert.equal(r1.file, path.join(CHANGELOG.dirs.kr, 'issue-kr-20261006T190500.json')); assert.equal(r1.title, '10월 6일(화) 한국 장 이슈');
  const r2 = await recordIssue(dir, issueBoard(), issueManifest, null, {place: 'kr', made: '2026-10-06T11:00:00Z'});
  assert.equal(r2.wrote, false); assert.match(r2.reason, /이미 있음/);
  const r3 = await recordIssue(dir, issueBoard({late: 3}), issueManifest, issueSnap, {place: 'us', made: '2026-10-06T11:00:00Z'});
  assert.equal(r3.wrote, false); assert.match(r3.reason, /90%/);
  // 두 실행이 함께 돌아 같은 날 이슈가 둘 생기면(파일 이름이 달라 git 이 부딪히지 않음) 사이트에는 먼저 것만
  const a = issueEntry(issueBoard(), issueManifest, issueSnap, {place: 'kr', made: '2026-10-06T10:05:00Z'}), b = issueEntry(issueBoard(), issueManifest, null, {place: 'kr', made: '2026-10-06T10:06:00Z'});
  const log = siteLog([b, a], {now: '2026-10-06T12:00:00Z'});
  assert.deepEqual(log.entries.map(e => e.id), [a.id]); assert.deepEqual(log.problems, [{id: b.id, bad: ['같은 날 이슈가 먼저 있음(먼저 것만 실음)']}]);
  assert.deepEqual(log.count, {all: 1, update: 0, data: 0, issue: 1}); assert.ok(!('auto' in log.entries[0]) && log.entries[0].source && log.entries[0].idents);
  // 이슈는 판 자리(kr · us)와 종가 날짜가 있어야
  assert.ok(validateEntry({...a, place: 'all'}).includes('issue 는 place kr · us')); assert.ok(validateEntry({...a, asOf: undefined}).includes('asOf'));
  assert.ok(validateEntry({...a, idents: [1]}).includes('idents')); assert.ok(validateEntry({...a, source: '내일 오를 것'}).some(x => x.includes('오를 것')));
  await fs.rm(dir, {recursive: true, force: true});
});

test('자료 변경 · 「처음」 다섯 — 바뀌면 한 줄(들어옴 · 나감 · 차례만) · 앞 기록에 다섯이 없으면 줄을 만들지 않음', () => {
  const five = names => ({ready: true, picks: names.map((n, i) => ({rank: i + 1, code: 'C' + n, name: '회사' + n}))});
  const b1 = {...boardOf(), start: five(['1', '2', '3', '4', '5'])};
  const old = dataEntry(null, boardOf(), {place: 'kr', made: '2026-10-05T00:00:00Z'});
  assert.equal(old.snap.start, null);
  assert.equal(dataEntry(old.snap, b1, {place: 'kr', made: '2026-10-05T01:00:00Z'}), null, '앞 기록(다섯이 없던 때)과 견주면 줄 없음');
  const e1 = dataEntry(null, b1, {place: 'kr', made: '2026-10-05T02:00:00Z'});
  assert.deepEqual(e1.snap.start, ['1', '2', '3', '4', '5'].map(n => ({code: 'C' + n, name: '회사' + n})));
  const e2 = dataEntry(e1.snap, {...boardOf(), start: five(['1', '2', '3', '4', '6'])}, {place: 'kr', made: '2026-10-05T03:00:00Z'});
  assert.deepEqual(e2.reasons, ['start']); assert.equal(e2.title, '「처음」 다섯이 바뀜');
  assert.equal(e2.what.at(-1), '「처음」 다섯 · 들어옴: 회사6 · 나감: 회사5'); assert.deepEqual(validateEntry(e2), []);
  const e3 = dataEntry(e2.snap, {...boardOf(), start: five(['2', '1', '3', '4', '6'])}, {place: 'kr', made: '2026-10-05T04:00:00Z'});
  assert.equal(e3.what.at(-1), '「처음」 다섯의 차례가 바뀜: 회사2 · 회사1 · 회사3 · 회사4 · 회사6');
  assert.equal(dataEntry(e3.snap, {...boardOf(), start: five(['2', '1', '3', '4', '6'])}, {place: 'kr', made: '2026-10-05T05:00:00Z'}), null, '같은 다섯이면 줄 없음');
  assert.equal(dataEntry(e3.snap, {...boardOf(), start: {ready: false, readyMonth: '2028-08'}}, {place: 'kr', made: '2026-10-05T06:00:00Z'}), null, '찍지 않는 판(미국 판)은 견주지 않음');
});

test('고침 — 지난 기록 파일은 그대로 · 뒤에 만든 업데이트 줄의 fixes 가 화면 글만 고침 · 옛 글이 맞지 않으면 problems', () => {
  const old = {schema: CHANGELOG.entrySchema, id: 'u-20261006T223217-x', kind: 'update', place: 'all', made: '2026-10-06T22:32:17+09:00', title: '옛 줄', what: ['하나', '둘 · 넘침 0']};
  const fix = {schema: CHANGELOG.entrySchema, id: 'u-20261007T014000-fix', kind: 'update', place: 'all', made: '2026-10-07T01:40:00+09:00', title: '고침', what: ['옛 줄 둘째 글에 단위'],
    fixes: [{id: old.id, field: 'what', index: 1, from: '둘 · 넘침 0', to: '둘 · 넘침 0건'}]};
  assert.deepEqual(validateEntry(fix), []);
  const log = siteLog([old, fix], {now: '2026-10-07T01:50:00+09:00'});
  assert.deepEqual(log.problems, []);
  const o = log.entries.find(e => e.id === old.id);
  assert.deepEqual(o.what, ['하나', '둘 · 넘침 0건']); assert.deepEqual(o.fixed, [{by: fix.id, made: fix.made, field: 'what', index: 1}]);
  assert.deepEqual(old.what, ['하나', '둘 · 넘침 0'], '들어온 기록(파일)은 그대로');
  // 옛 글이 다르면 고치지 않음 · 앞에 만든 줄은 뒤 줄을 고치지 못함 · 모양 검사
  const bad = siteLog([old, {...fix, fixes: [{...fix.fixes[0], from: '다른 글'}]}], {now: '2026-10-07T01:50:00+09:00'});
  assert.match(bad.problems[0].bad[0], /^고칠 줄을 찾지 못함 u-20261006T223217-x what 1$/); assert.deepEqual(bad.entries.find(e => e.id === old.id).what, old.what);
  assert.equal(siteLog([{...old, made: '2026-10-07T02:00:00+09:00'}, fix], {now: '2026-10-07T02:10:00+09:00'}).problems.length, 1);
  for (const f of [[], [{id: old.id, field: 'why', index: 0, from: 'a', to: 'b'}], [{id: old.id, field: 'what', from: 'a', to: 'b'}], [{id: old.id, field: 'what', index: 0, from: 'a', to: 'a'}]]) assert.deepEqual(validateEntry({...fix, fixes: f}), ['fixes'], JSON.stringify(f));
  assert.deepEqual(validateEntry({...fix, kind: 'data', asOf: '2026-10-06', place: 'kr'}).includes('fixes'), true, '고침은 업데이트 줄만');
  assert.match(validateEntry({...fix, fixes: [{...fix.fixes[0], to: '둘 · 절대 넘침 없음'}]}).join(), /금지 말 「절대」/);
});

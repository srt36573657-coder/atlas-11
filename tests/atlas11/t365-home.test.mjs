// 새 ATLAS 첫 화면 종합 정보(사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 … 365개 종목 … 업종 강 7 · 약 7 … 수급 … 미국장 분위기 … 종합정보」)
//   원문 = 깃허브 실행기 탐침(2026-10-12 14:59 장 중 · scripts/atlas11/probe/home.mjs) 을 시험 자리로 복사(tests/atlas11/fixtures/home-20261012)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildHome, sectorPiece, flowPiece, indexPiece, idxAlert, HOME_RULE} from '../../scripts/atlas11/t365/home_build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const RAW = path.join(ROOT, 'tests/atlas11/fixtures/home-20261012'), DATA = path.join(ROOT, 'site/atlas/data');
const J = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

test('첫 화면 자료 — 지수 3개월 · 수급 · 업종 강 7 · 약 7 · 미국 · 365곳 · 문턱 「!」', () => {
  const home = buildHome({dataDir: DATA, rawDir: RAW, now: new Date('2026-10-12T06:00:00Z'), fetchedAt: '2026-10-12T05:59:00Z'});
  assert.equal(home.kst, '2026-10-12 14:59'); assert.equal(home.live, true); assert.deepEqual(home.errors, []);
  const K = home.idx.KOSPI, Q = home.idx.KOSDAQ;
  assert.equal(K.date, '2026-10-12'); assert.equal(K.close, 6408.58); assert.equal(K.day, -3.28); assert.equal(K.live, true);
  assert.ok(K.rows.length >= 55 && K.rows.length <= 70, '3개월 = 거래일 약 60'); assert.ok(K.rows[0][0] >= '2026-07-12');
  assert.equal(K.hi.d, '2026-07-15'); assert.equal(K.lo.d, '2026-07-30'); assert.equal(Q.day, -4.36);
  assert.deepEqual(home.flows.KOSPI, {date: '2026-10-12', personal: 12616, foreign: -17507, institutional: -1711});
  const S = home.sectors; assert.equal(S.label, '강한 7'); assert.equal(S.date, K.date, '업종 값의 날 = 같이 받은 지수의 마지막 날(화면 「오늘 업종」을 보는 날짜로 셈 · 2026-10-12 18:31)'); assert.equal(S.strong.length, 7); assert.equal(S.weak.length, 7);
  assert.equal(S.strong[0].name, '해운사'); assert.equal(S.weak[0].name, '기계'); assert.ok([...S.strong, ...S.weak].every(g => g.n >= HOME_RULE.minSector && g.name !== '기타'));
  assert.deepEqual(S.breadth, {up: 405, down: 2233, flat: 231, n: 2869}); // 「기타」 1,541곳 뺌
  const comp = J('comp.json').companies; assert.equal(S.weak[0].in365, Object.values(comp).filter(c => c.sector === '기계').length);
  assert.equal(home.us.date, '2026-10-09'); assert.equal(home.us.n, 4); assert.equal(home.us.up, 3); assert.equal(home.us.rows.find(r => r.key === 'VIX').chg, -3.7);
  const lines = J('lines.json').lines; let up = 0; for (const L of Object.values(lines)) if (L.at(-1) > L.at(-2)) up++;
  assert.equal(home.s365.up, up); assert.equal(home.s365.list.length + home.s365.none, Object.keys(lines).length);
  assert.equal(home.s365.top.c, home.s365.list[0][0]); assert.equal(home.cmp20.eq, J('core.json').all.chg);
  assert.deepEqual(home.alerts.map(a => a.kind + a.key), ['idxKOSPI', 'idxKOSDAQ', 'flowKOSPI']);
  assert.ok(JSON.stringify(home).length < 60000, '첫 화면 자료는 가볍게');
});

test('첫 화면 자료 — 못 받은 조각은 앞 회차 값(꼬리표) · 그것도 없으면 비움', () => {
  const prev = buildHome({dataDir: DATA, rawDir: RAW, now: new Date('2026-10-12T06:00:00Z'), fetchedAt: '2026-10-12T05:59:00Z'});
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'home-raw-'));
  for (const f of ['kospi-day.json', 'kosdaq-day.json', 'industry.json']) fs.copyFileSync(path.join(RAW, f), path.join(tmp, f)); // 수급 · 미국은 못 받음
  const h2 = buildHome({dataDir: DATA, rawDir: tmp, prev, now: new Date('2026-10-12T09:00:00Z')});
  assert.deepEqual(h2.errors, ['flows 못 받음', 'us 못 받음']); assert.equal(h2.stale.flows, '2026-10-12 14:59'); assert.deepEqual(h2.flows, prev.flows); assert.equal(h2.stale.idx, undefined);
  assert.ok(!h2.alerts.some(a => a.kind === 'flow'), '앞 회차 값으로는 「!」를 띄우지 않음');
  const h3 = buildHome({dataDir: DATA, rawDir: null, prev: null});
  assert.equal(h3.idx, null); assert.equal(h3.flows, null); assert.equal(h3.sectors, null); assert.equal(h3.us, null); assert.equal(h3.errors.length, 4);
  assert.ok(h3.s365.list.length >= 1 && h3.s365.list.length === h3.s365.n, '고른 곳은 자료로 늘 셈(멍거 조건 수 그대로)');
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('「장 중」은 서울 정규장(9:00 ~ 15:30)에 받은 값만 — 15:30 뒤 네이버 「OPEN」(시간외 · 저녁 장)은 장 끝(home-v2 부터)', () => {
  const at = iso => buildHome({dataDir: DATA, rawDir: RAW, now: new Date(iso), fetchedAt: iso});
  const h1604 = at('2026-10-12T07:04:00Z'); // 16:04 — 원문 장 상태는 OPEN(14:59 받은 것)이어도
  assert.equal(HOME_RULE.id, 'home-v3'); assert.equal(h1604.live, false); assert.equal(h1604.idx.KOSPI.live, false); assert.equal(h1604.flows.live, false);
  assert.equal(at('2026-10-12T06:29:00Z').live, true, '15:29 는 장 중'); assert.equal(at('2026-10-12T06:30:00Z').live, false, '15:30 부터 장 끝');
  assert.equal(at('2026-10-11T23:59:00Z').live, false, '8:59 는 장 열기 전');
  assert.equal(at('2026-10-17T01:00:00Z').live, false, '토요일 10:00 — 지수 마지막 날이 오늘이 아님');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'home-raw-'));
  for (const f of ['kospi-day.json', 'kosdaq-day.json']) fs.copyFileSync(path.join(RAW, f), path.join(tmp, f)); // 업종을 못 받아도 시각 · 지수 날짜로
  assert.equal(buildHome({dataDir: DATA, rawDir: tmp, fetchedAt: '2026-10-12T01:00:00Z'}).live, true);
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('업종 · 수급 · 지수 조각 — 회사 5곳 미만 뺌 · 「덜 내린 7」 · 글 숫자', () => {
  const groups = Array.from({length: 20}, (_, k) => ({no: k, name: 'U' + k, totalCount: k % 4 === 0 ? 3 : 10, changeRate: String(-1 - k / 10), riseCount: 2, fallCount: 7, steadyCount: 1}));
  const S = sectorPiece({groups, marketStatus: 'CLOSE'}, {});
  assert.equal(S.label, '덜 내린 7'); assert.ok(S.strong.every(g => g.n >= 5)); assert.equal(S.skipped, 5); assert.equal(S.status, 'CLOSE');
  assert.deepEqual(flowPiece({bizdate: '20261012', personalValue: '+1,234', foreignValue: '-56', institutionalValue: '0'}), {date: '2026-10-12', personal: 1234, foreign: -56, institutional: 0});
  assert.equal(flowPiece({}), null);
  const two = [{localDate: '20260710', closePrice: 100}, {localDate: '20260711', closePrice: 110}], o = {months: 3, base: '2026-07-10', asOf: '2026-07-11', live: false, today: '2026-07-11'};
  const x = indexPiece(two, '코스피', {...o, minRows: 2});
  assert.equal(x.day, 10); assert.equal(x.chg20, 10); assert.equal(x.live, false);
  assert.equal(indexPiece(two, '코스피', o), null, '3개월에 거래일 40개 미만 = 덜 받음 → 앞 회차 값(회차를 막지 않게)');
});

test('지수 「!」 문턱 home-v3 — 평소(앞 20거래일 하루 움직임 크기 평균)의 2.5배 넘고 1.5% 넘음 · 또는 하루 5% 넘음(2026-10-13 01:28 「1억번 계산고 360도 사고」)', () => {
  const mk = (moves, today) => { let v = 1000; const rows = [['2026-01-01', v]]; [...moves, today].forEach((m, k) => { v *= 1 + m / 100; rows.push([`2026-02-${String(k + 1).padStart(2, '0')}`, v]); }); return {rows, day: today}; };
  const calm = Array.from({length: 22}, (_, k) => (k % 2 ? 0.4 : -0.4)); // 평소 0.4%
  assert.equal(idxAlert(mk(calm, 1.2)), null, '1.2% = 평소의 3배지만 1.5% 바닥 밑 — 작은 날에 「!」 없음');
  assert.deepEqual(idxAlert(mk(calm, -1.6)), {why: 'usual', ratio: 4}, '1.6% = 평소의 4배 · 1.5% 넘음');
  const wild = Array.from({length: 22}, (_, k) => (k % 2 ? 3 : -3)); // 평소 3%
  assert.equal(idxAlert(mk(wild, -4.5)), null, '거친 장 4.5% = 평소의 1.5배 · 5% 밑 — 「!」 없음(옛 3% 문턱이면 켜짐)');
  assert.equal(idxAlert(mk(wild, -6)).why, 'big', '하루 5% 넘으면 평소와 상관없이 늘');
  assert.equal(idxAlert({rows: [['2026-01-01', 100], ['2026-01-02', 106]], day: 6}).why, 'big', '평소를 셀 수 없어도(20거래일 모자람) 5% 넘으면 켜짐');
  assert.equal(idxAlert({rows: [['2026-01-01', 100], ['2026-01-02', 104]], day: 4}), null, '평소를 셀 수 없으면 5% 밑은 켜지 않음');
});

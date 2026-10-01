/**
 * 채점기 기준 셋 시험 — 단순 전이식(밤사이 반도체지수) · ATLAS 11 후향 · 판 시각별 「없음」 · 08시 재현 줄 꼴
 *   node --test 'atlas4h/score/test/*.test.mjs'
 * 반도체지수·코스피 지난 자료는 가짜 [예시] (atlas4h/engine/test/history-fixture.mjs · atlas4h-history-1 꼴)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  transferCenterPct, transferBaseline, noChangeBaseline, soxOvernight, transferFor, loadAtlas11Retro, atlas11RetroBand,
  scoreBoard, crisisOf, stockChangesUpTo, NOTE_US_CLOSED, NOTE_TRANSFER_EARLY, NOTE_TRANSFER_SLOT12, NOTE_A11_EARLY, NONE,
} from '../score.mjs';
import {loadHistories} from '../../engine/history.mjs';
import {buildInputs, buildBoard} from '../../engine/board.mjs';
import {QKEYS} from '../../engine/dist.mjs';
import {run} from '../../retro/run.mjs';
import {CHECKS} from '../../spec/checks.mjs';
import {writeHistoryFixture, makeSox, usSessions} from '../../engine/test/history-fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INPUT = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8'));
const SESSIONS = INPUT.calendar.sessions;
const A11_FILE = path.join(ROOT, 'atlas4h/baselines/atlas11-v1-retro.json');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-score-'));
writeHistoryFixture(TMP, {sessions: SESSIONS});
const HIST = loadHistories(TMP, ['kospi', 'sox']);
const GIT = {commit: 'abc1234abcd', dirty: false};
const soxOf = series => ({id: 'sox', file: 'x', sha256: 'y', doc: {}, series});

test('단순 전이식 셈: s = 1 → c = (0.20 + 0.31) × 1.27 = 0.6477% · 분위수 = 출발값 × (1 + c/100) × (1 + r_τ)', () => {
  const t = transferCenterPct(1);
  assert.ok(Math.abs(t.gap - 0.51) < 1e-12);
  assert.ok(Math.abs(t.intraday - 0.1377) < 1e-12);
  assert.ok(Math.abs(t.c - 0.6477) < 1e-12);
  assert.ok(Math.abs(transferCenterPct(0).c - 0.254) < 1e-12, 's = 0 이어도 갭 0.20 → c = 0.254%');
  const hist = stockChangesUpTo(INPUT, '005930', '2026-09-30');
  const anchor = 1000;
  const nc = noChangeBaseline(anchor, hist);
  const tb = transferBaseline(anchor, 1, hist);
  for (let i = 0; i < 19; i++) assert.ok(Math.abs(tb.q19[i] - nc.q19[i] * (1 + 0.6477 / 100)) < 1e-9, QKEYS[i]);
  assert.ok(Math.abs(tb.direction.up + tb.direction.flat + tb.direction.down - 1) < 1e-12);
  assert.ok(tb.direction.up >= nc.direction.up, '위로 옮기면 오름 몫이 줄지 않는다');
  assert.equal(transferBaseline(anchor, 1, hist.slice(-100)), null, '250개 미만이면 「없음」');
});

test('밤사이 반도체지수: 보통 밤 · 미국 휴장 밤(s = 0 쪽지) · 한국 휴일(가장 늦은 하나) · 자료 끝 · 자료 없음', () => {
  const series = makeSox(usSessions('2026-08-01', '2026-10-30')).series;
  const sox = soxOf(series);
  const val = d => series.find(r => r.date === d).value;
  // 보통 밤: 9/15(화) 08시 판 ← 미국 9/14(월) 장 (마감 9/15 05:00 KST)
  const a = soxOvernight(sox, '2026-09-14', '2026-09-15T08:00:00+09:00');
  assert.equal(a.session, '2026-09-14');
  assert.ok(Math.abs(a.s - (val('2026-09-14') / val('2026-09-11') - 1) * 100) < 1e-12);
  assert.equal(a.closeAt, '2026-09-15T05:00:00+09:00');
  // 미국 휴장(9/7 노동절): 9/8(화) 08시 판 ← 9/7 15:30 KST ~ 9/8 08:00 KST 사이 미국 마감 없음
  const b = soxOvernight(sox, '2026-09-07', '2026-09-08T08:00:00+09:00');
  assert.deepEqual(b, {s: 0, note: NOTE_US_CLOSED, session: null});
  // 한국 휴일(10/5 개천절 대체): 10/6(화) 08시 판 ← 미국 10/2·10/5 두 장 중 늦은 10/5 하나
  const c = soxOvernight(sox, '2026-10-02', '2026-10-06T08:00:00+09:00');
  assert.equal(c.session, '2026-10-05');
  assert.ok(Math.abs(c.s - (val('2026-10-05') / val('2026-10-02') - 1) * 100) < 1e-12);
  // 겨울 시각(11/2 뒤)은 06:00 KST 마감 — 05:30 봉인이면 아직 마감 전
  const w = soxOf(makeSox(usSessions('2026-10-01', '2026-11-30')).series);
  assert.equal(soxOvernight(w, '2026-11-03', '2026-11-04T06:30:00+09:00').session, '2026-11-03');
  assert.equal(soxOvernight(w, '2026-11-03', '2026-11-04T05:30:00+09:00').s, 0, '마감 전이면 그 밤 장은 없음 (뒤에 자료가 있어 휴장으로 셈)');
  // 자료가 봉인 앞에서 끝남 → 없음 (휴장인지 모름)
  const short = soxOf(series.filter(r => r.date <= '2026-09-10'));
  assert.equal(soxOvernight(short, '2026-09-14', '2026-09-15T08:00:00+09:00').none, true);
  assert.equal(soxOvernight({id: 'sox', none: true, why: '없음'}, '2026-09-14', '2026-09-15T08:00:00+09:00').none, true);
});

test('판 시각별 단순 전이식: 08시만 · 12시는 judgment-2 「없음」 · 16·20·00·04시는 「봉인 때 다음 장 앞 미국 장이 아직 없음」', () => {
  assert.equal(transferFor('12', HIST.sox, '2026-09-14', '2026-09-15T12:00:00+09:00').why, NOTE_TRANSFER_SLOT12);
  for (const slot of ['16', '20', '00', '04']) assert.equal(transferFor(slot, HIST.sox, '2026-09-14', '2026-09-15T00:00:00+09:00').why, NOTE_TRANSFER_EARLY, slot);
  assert.ok(Number.isFinite(transferFor('08', HIST.sox, '2026-09-14', '2026-09-15T08:00:00+09:00').s));
});

test('ATLAS 11 후향 읽기: 목표일·종목·출발일이 맞는 줄 · 없는 줄·파일 없음·출발일 다름 → 없음', () => {
  const a11 = loadAtlas11Retro(A11_FILE);
  assert.equal(a11.label, '후향');
  assert.equal(a11.rows, 6240);
  const r = atlas11RetroBand(a11, '2026-04-07', '005930', '2026-04-06');
  assert.ok(r.p10 < r.p50 && r.p50 < r.p90);
  assert.ok(Math.abs(r.direction.up + r.direction.flat + r.direction.down - 1) < 1e-9);
  assert.equal(r.label, '후향');
  assert.equal(atlas11RetroBand(a11, '2026-10-02', '005930', '2026-10-01').none, true);
  assert.equal(atlas11RetroBand(a11, '2026-04-07', '999999', '2026-04-06').none, true);
  assert.equal(atlas11RetroBand(a11, '2026-04-07', '005930', '2026-04-03').none, true);
  assert.equal(loadAtlas11Retro(path.join(TMP, 'none.json')).none, true);
  assert.equal(atlas11RetroBand(loadAtlas11Retro(path.join(TMP, 'none.json')), '2026-04-07', '005930', '2026-04-06').none, true);
});

test('16시 판 채점: 단순 전이식·ATLAS 11 은 「없음」과 까닭 · 무판은 그대로', () => {
  const at = '2026-09-29T16:00:00+09:00';
  const inputs = buildInputs(INPUT, {asof: '2026-09-29', at, histories: HIST});
  const board = buildBoard({inputs, seed: 1, slot: '16', kind: '무거운', createdAt: at, sealedAt: at, target: '2026-09-30', commit: 'abc1234', dirty: false, files: ['public/data/input.json'], retro: true});
  const {lines, kospiLine} = scoreBoard(board, INPUT, {scoredAt: '2026-10-01T20:00:00+09:00', histories: HIST, atlas11Retro: loadAtlas11Retro(A11_FILE)});
  assert.equal(lines.length, 52);
  for (const l of lines) {
    assert.deepEqual(l.baselines.map(b => b.id), ['무판', '단순 전이식', 'ATLAS 11']);
    assert.ok(Number.isFinite(l.baselines[0].interval));
    assert.equal(l.baselines[1].note, NONE);
    assert.equal(l.baselines[1].why, NOTE_TRANSFER_EARLY);
    assert.equal(l.baselines[2].note, NONE);
    assert.equal(l.baselines[2].why, NOTE_A11_EARLY);
  }
  assert.deepEqual(kospiLine.baselines.map(b => b.id), ['무판', '단순 전이식'], '코스피는 기준 둘');
});

test('위기 날: 목표일 코스피 |하루 변화| ≥ 봉인 때 지난 250일의 90% 분위수 · 코스피 없으면 null', () => {
  const c = crisisOf(HIST.kospi, '2026-09-29', '2026-09-30');
  assert.equal(typeof c.crisis, 'boolean');
  assert.ok(c.thresholdPct > 0);
  assert.equal(crisisOf({none: true}, '2026-09-29', '2026-09-30').crisis, null);
});

test('08시 재현: rows 는 52종목 줄만 · 줄마다 기준 셋(무판·단순 전이식·ATLAS 11) · kospiRows 는 기준 둘 · 목표일 4/7~10/1 120일', () => {
  const r = run({slot: '08', historyDir: TMP, write: false, now: '2026-10-01T21:00:00+09:00', git: GIT});
  assert.equal(r.rows.length, 6240);
  assert.equal(r.summary.targets.first, '2026-04-07');
  assert.equal(r.summary.targets.last, '2026-10-01');
  assert.equal(r.summary.targets.count, 120);
  assert.ok(r.rows.every(x => x.code !== 'kospi'));
  for (const x of r.rows) {
    assert.deepEqual(x.baselines.map(b => b.id), ['무판', '단순 전이식', 'ATLAS 11']);
    assert.equal(x.interval.alpha, 0.2);
    assert.match(x.boardId, /^r4h-\d{8}-08-[0-9a-f]{8}$/);
    for (const b of x.baselines) assert.ok(Number.isFinite(b.interval) || b.note === NONE);
    assert.equal(x.baselines[2].crps, null, 'ATLAS 11 CRPS 는 없음');
  }
  const holiday = r.rows.filter(x => x.target === '2026-09-08');
  assert.ok(holiday.length && holiday.every(x => x.baselines[1].note === NOTE_US_CLOSED && x.baselines[1].s === 0));
  assert.equal(r.kospiRows.length, 120);
  assert.ok(r.kospiRows.every(x => x.baselines.map(b => b.id).join() === '무판,단순 전이식'));
  assert.ok(r.summary.boardBytes.max <= 150 * 1024);
  const t12 = CHECKS.T12({retro: r});
  assert.equal(t12.counts.lag, 51);
  assert.ok(Object.keys(t12.counts.baselines).length === 3, t12.reason);
  for (const id of ['무판', '단순 전이식', 'ATLAS 11']) {
    const v = r.summary.stocks.vs[id].raw;
    assert.equal(v.boards, 120);
    assert.ok(Number.isFinite(v.dm.lag0.p) && Number.isFinite(v.dm.lag5.p) && Number.isFinite(v.rowLevelDm.p));
  }
});

test('08시 재현: 반도체지수·코스피 자료가 없으면 단순 전이식 「없음」 · 코스피 「없음」 (멈추지 않음)', () => {
  const r = run({slot: '08', historyDir: path.join(TMP, 'nothing'), write: false, now: '2026-10-01T21:00:00+09:00', git: GIT, days: 3});
  assert.equal(r.rows.length, 156);
  assert.ok(r.rows.every(x => x.baselines[1].note === NONE));
  assert.ok(r.rows.every(x => Number.isFinite(x.baselines[2].interval)));
  assert.equal(r.kospiRows.length, 0);
  assert.equal(r.summary.kospi.none, true);
  assert.equal(r.summary.stocks.vs['단순 전이식'].raw.none, true);
});

test.after(() => fs.rmSync(TMP, {recursive: true, force: true}));

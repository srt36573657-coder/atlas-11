/**
 * 작은 판(상수 + 지금 변수) · 코스피 판 · 08시 판 · 시각 셈 시험 — 가짜 지난 자료는 history-fixture.mjs [예시]
 *   node --test atlas4h/engine/test/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildInputs, engine} from '../board.mjs';
import {makeBoard} from '../run.mjs';
import {slotPlan, usCloseUtcMs, usEasternDst, isoKst} from '../clock.mjs';
import {loadHistories, changesUpTo} from '../history.mjs';
import {measureSeries, validState} from '../constants.mjs';
import {harModel} from '../har.mjs';
import {forecastBlock, QKEYS} from '../dist.mjs';
import {canonicalJson, FORBIDDEN, CHECKS} from '../../spec/checks.mjs';
import {writeHistoryFixture} from './history-fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INPUT = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8'));
const SESSIONS = INPUT.calendar.sessions;
const AT = '2026-10-01T20:00:00+09:00';
const GIT = {commit: 'abc1234', dirty: false};
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-compact-'));
writeHistoryFixture(TMP, {sessions: SESSIONS});
const HIST = loadHistories(TMP, ['kospi', 'sox']);
const EMPTY = loadHistories(path.join(TMP, 'nothing-here'), ['kospi', 'sox']);

function walk(v, fn, key = '') {
  fn(v, key);
  if (Array.isArray(v)) v.forEach(x => walk(x, fn, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, fn, k);
}

test('코스피 판: 출발값·19분위수·방향·세 시나리오(위·가운데·아래, 확률 합 1)·금지 말 0', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT, histories: HIST});
  const k = board.kospi;
  assert.ok(k, '코스피 판이 있어야 함');
  const row = HIST.kospi.series.find(r => r.date === '2026-09-30');
  assert.equal(k.anchor.value, row.value);
  assert.equal(k.anchor.asOf, '2026-09-30T15:30:00+09:00');
  assert.equal(k.center, k.anchor.value);
  assert.deepEqual(Object.keys(k.quantiles), QKEYS);
  const q = QKEYS.map(x => k.quantiles[x]);
  for (let i = 1; i < 19; i++) assert.ok(q[i] >= q[i - 1]);
  assert.equal(k.quantiles.p50, k.center);
  assert.ok(Math.abs(k.direction.up + k.direction.flat + k.direction.down - 1) <= 1e-12);
  assert.deepEqual(k.scenarios.map(s => s.name), ['위', '가운데', '아래']);
  assert.ok(Math.abs(k.scenarios.reduce((a, s) => a + s.prob, 0) - 1) <= 1e-9);
  for (const s of k.scenarios) {
    assert.ok(s.premise && s.invalidator);
    assert.ok(s.kospi.low <= s.kospi.high, `${s.name} ${s.kospi.low} > ${s.kospi.high}`);
  }
  const [up, mid, down] = k.scenarios;
  assert.equal(up.kospi.low, mid.kospi.high);
  assert.equal(down.kospi.high, mid.kospi.low);
  assert.ok(up.kospi.high >= k.quantiles.p95 && down.kospi.low <= k.quantiles.p05);
  assert.ok(CHECKS.T5({boards: [board]}).pass);
  assert.ok(CHECKS.T10({boards: [board], view: null}).pass);
  const words = [];
  walk(board, v => typeof v === 'string' && words.push(v));
  for (const f of FORBIDDEN) assert.ok(!words.some(w => f.re.test(w)), f.word);
  assert.ok(board.dataVersion.files.includes(HIST.kospi.file));
  assert.ok(board.twoPath.some(t => t.what === '코스피 가운데 값' && t.agree));
});

test('코스피 판: 상수 = 코스피 등락으로 맞춘 HAR (0판 forecastBlock 과 같은 값)', () => {
  const ch = changesUpTo(HIST.kospi.series, '2026-09-30').map(c => c.changePct).slice(-524);
  const m = harModel(ch.map(c => Math.log1p(c / 100)));
  const anchor = HIST.kospi.series.find(r => r.date === '2026-09-30').value;
  const old = forecastBlock(anchor, m.sigmaNext, m.z, {label: 'kospi'});
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT, histories: HIST});
  const {anchor: a, har, ...rest} = board.kospi;
  assert.deepEqual(JSON.parse(JSON.stringify(rest)), JSON.parse(JSON.stringify(old)));
  assert.equal(a.value, anchor);
  assert.equal(har.rows, m.rows);
});

test('코스피 지난 자료가 없으면 코스피 null · 변수 「없음」 · 멈추지 않음', () => {
  const {board} = makeBoard({input: INPUT, slot: '08', asof: '2026-10-01', at: AT, git: GIT, histories: EMPTY});
  assert.equal(board.kospi, null);
  const kv = board.inputs.variables.find(v => v.id === 'kospi');
  assert.equal(kv.status, '없음');
  assert.equal(kv.value, null);
  assert.equal(board.inputs.constants.values.kospi, null);
  assert.deepEqual(board.dataVersion.files, ['public/data/input.json']);
});

test('08시 판: 출발일 = 앞 거래일 · 목표일 = 그날 (한국 휴장 10/5·10/9 건너뜀) · 16시 판은 그날 → 다음 거래일', () => {
  assert.deepEqual(slotPlan(SESSIONS, '08', '2026-10-06'), {anchorDate: '2026-10-02', target: '2026-10-06', sealAt: '2026-10-06T08:00:00+09:00'});
  assert.deepEqual(slotPlan(SESSIONS, '08', '2026-10-05'), {anchorDate: '2026-10-02', target: '2026-10-06', sealAt: '2026-10-05T08:00:00+09:00'});
  assert.equal(slotPlan(SESSIONS, '08', '2026-10-12').anchorDate, '2026-10-08');
  assert.equal(slotPlan(SESSIONS, '08', '2026-10-08').anchorDate, '2026-10-07');
  assert.equal(slotPlan(SESSIONS, '08', '2026-10-01').anchorDate, '2026-09-30');
  assert.deepEqual(slotPlan(SESSIONS, '16', '2026-10-02'), {anchorDate: '2026-10-02', target: '2026-10-06', sealAt: '2026-10-02T16:00:00+09:00'});
  assert.equal(slotPlan(SESSIONS, '16', '2026-10-08').target, '2026-10-12');
  assert.equal(slotPlan(SESSIONS, '16', '2026-10-05').anchorDate, null, '쉬는 날 16시 판은 출발일 없음');
  const b = makeBoard({input: INPUT, slot: '08', asof: '2026-10-01', at: AT, git: GIT}).board;
  assert.equal(b.target.date, '2026-10-01');
  assert.match(b.id, /^4h-20261001-08-[0-9a-f]{8}$/);
  const v = b.inputs.variables.find(x => x.id === 'stock-price:005930');
  assert.equal(v.value, INPUT.assets.find(a => a.code === '005930').prices.find(p => p.date === '2026-09-30').close);
});

test('08시 t 판의 종목 값 = 16시 t−1 판 (같은 출발값 · 0판은 미국 자료를 안 씀)', () => {
  const a = makeBoard({input: INPUT, slot: '08', asof: '2026-10-06', at: AT, git: GIT, histories: HIST}).board;
  const b = makeBoard({input: INPUT, slot: '16', asof: '2026-10-02', at: AT, git: GIT, histories: HIST}).board;
  assert.equal(canonicalJson(a.stocks), canonicalJson(b.stocks));
  assert.equal(canonicalJson(a.kospi), canonicalJson(b.kospi));
});

test('작은 판: 150 KB 이하 · 지난 등락 목록 없음 · 상수 꼴(version·sha256·measuredAt ≤ 봉인)', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT, histories: HIST});
  const bytes = Buffer.byteLength(JSON.stringify(board));
  assert.ok(bytes <= 150 * 1024, `판 ${bytes} 바이트`);
  let longest = 0;
  walk(board, (v, key) => {
    assert.notEqual(key, 'history', '판에 history 칸이 있으면 안 됨');
    if (Array.isArray(v) && v.every(x => typeof x === 'number')) longest = Math.max(longest, v.length);
  });
  assert.ok(longest <= 19, `숫자 목록 길이 ${longest}`);
  const c = board.inputs.constants;
  assert.match(c.sha256, /^[0-9a-f]{64}$/);
  assert.match(c.version, /^c-\d{8}-har0$/);
  assert.ok(Date.parse(c.measuredAt) <= Date.parse(board.sealedAt));
  assert.ok(validState(c.values.kospi));
  assert.equal(Object.keys(c.values.stocks).length, 52);
  assert.ok(Object.values(c.values.stocks).every(validState));
  assert.match(board.dataVersion.sha256, /^[0-9a-f]{64}$/);
  assert.ok(CHECKS.T2({boards: [board]}).pass, CHECKS.T2({boards: [board]}).reason);
});

test('같은 입력이면 같은 판 · 엔진은 상수만으로 판을 다시 낸다 (T4)', () => {
  const {board} = makeBoard({input: INPUT, slot: '08', asof: '2026-10-01', at: AT, git: GIT, histories: HIST});
  const again = makeBoard({input: INPUT, slot: '08', asof: '2026-10-01', at: AT, git: GIT, histories: HIST}).board;
  assert.equal(canonicalJson(board), canonicalJson(again));
  const parsed = JSON.parse(JSON.stringify(board));
  const r = CHECKS.T4({boards: [parsed]}, {engine});
  assert.ok(r.pass, r.reason);
  const o1 = engine(structuredClone(parsed.inputs), parsed.seed);
  const o2 = engine(structuredClone(parsed.inputs), parsed.seed);
  assert.equal(canonicalJson(o1), canonicalJson(o2));
});

test('상수 단계: 출발일 뒤 자료는 상수에 안 들어감 · 엠바고로 마지막 날은 맞춤 줄 밖', () => {
  const a = buildInputs(INPUT, {asof: '2026-09-15', at: AT});
  const changed = structuredClone(INPUT);
  for (const s of changed.assets) for (const p of s.prices) if (p.date > '2026-09-15') p.close = Math.round(p.close * 1.37);
  const b = buildInputs(changed, {asof: '2026-09-15', at: AT});
  assert.equal(canonicalJson(a), canonicalJson(b));
  const rows = INPUT.assets[0].prices.filter(p => p.date <= '2026-09-15');
  const ch = rows.slice(1).map((p, i) => (p.close / rows[i].close - 1) * 100);
  const c1 = measureSeries(ch);
  const ch2 = [...ch];
  ch2[ch2.length - 1] = 9;
  const c2 = measureSeries(ch2);
  assert.deepEqual(c1.beta, c2.beta, '출발일 등락은 맞춤 줄에서 빠진다(엠바고 1)');
  assert.notDeepEqual(c1.rv, c2.rv, '출발일 등락은 밑값(어제 r²)에는 들어간다');
});

test('극한 시험 자료 K1~K7 에서 엔진이 멈추지 않는다 (K 자체는 5단계)', () => {
  for (const id of ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7']) {
    const fx = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas4h/spec/fixtures/extremes', `${id}.json`), 'utf8'));
    for (const step of fx.steps) {
      const out = engine(structuredClone(step.inputs), step.seed ?? fx.seed);
      assert.ok(out && typeof out === 'object' && typeof out.then !== 'function', `${id} ${step.name}`);
      assert.ok(Array.isArray(out.stocks));
    }
  }
  assert.doesNotThrow(() => engine(undefined, 1));
  assert.doesNotThrow(() => engine({variables: [{id: 'kospi', value: 2600}], constants: {values: {kospi: {beta: [1]}}}}, 1));
});

test('미국 장 마감: 서머타임이면 05:00 KST, 아니면 06:00 KST (규칙으로 셈 · Intl 시간대와 같음)', () => {
  const kst = d => isoKst(usCloseUtcMs(d));
  assert.equal(kst('2026-07-15'), '2026-07-16T05:00:00+09:00');
  assert.equal(kst('2026-12-15'), '2026-12-16T06:00:00+09:00');
  assert.equal(kst('2026-03-06'), '2026-03-07T06:00:00+09:00'); // 3/8 시작 앞 금요일
  assert.equal(kst('2026-03-09'), '2026-03-10T05:00:00+09:00');
  assert.equal(kst('2026-10-30'), '2026-10-31T05:00:00+09:00'); // 11/1 끝 앞 금요일
  assert.equal(kst('2026-11-02'), '2026-11-03T06:00:00+09:00');
  assert.equal(usEasternDst('2026-03-08'), true);
  assert.equal(usEasternDst('2026-11-01'), false);
  const fmt = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit'});
  for (let t = Date.parse('2023-01-01T00:00:00Z'); t <= Date.parse('2027-12-31T00:00:00Z'); t += 864e5) {
    const d = new Date(t).toISOString().slice(0, 10);
    const p = Object.fromEntries(fmt.formatToParts(new Date(usCloseUtcMs(d))).map(x => [x.type, x.value]));
    assert.equal(`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`, `${d} 16:00`, d);
  }
});

test.after(() => fs.rmSync(TMP, {recursive: true, force: true}));

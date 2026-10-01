/**
 * ATLAS 4시간 엔진 0판 시험 — HAR 맞춤 · 누수 없음 · 같은 입력이면 같은 판 · 분위수 · 시나리오 · 봉인 지문 · 금지 말
 *   node --test atlas4h/engine/test/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fitHar, harModel, harPredict, VAR_FLOOR} from '../har.mjs';
import {forecastBlock, QKEYS, TAUS, sidedZ} from '../dist.mjs';
import {buildInputs, buildBoard, engine, sealRecord} from '../board.mjs';
import {makeBoard} from '../run.mjs';
import {canonicalJson, boardSha256, FORBIDDEN, CHECKS} from '../../spec/checks.mjs';
import {crpsFromQuantiles, brier3, outcomeOf, scoreBoard, noChangeBaseline} from '../../score/score.mjs';
import {crpsFromSamples, intervalScore} from '../../spec/stats.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INPUT = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8'));
const AT = '2026-10-01T20:00:00+09:00';
const GIT = {commit: 'abc1234', dirty: false};

/** 씨앗 있는 난수 (mulberry32) — 시험 자료를 같은 꼴로 다시 만든다 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('HAR: 계수를 아는 가짜 계열에서 계수를 되찾는다', () => {
  // r²(t+1) = 2e-4 + 0.3·어제 + 0.25·주 + 0.2·달 + 잡음(±1e-4, 서로 독립) — 계수 합 0.75 라 제자리(8e-4) 근처를 돈다
  const beta = [2e-4, 0.3, 0.25, 0.2];
  const rand = rng(7);
  const v = [];
  for (let i = 0; i < 22; i++) v.push(8e-4);
  for (let t = 21; v.length < 20000; t++) {
    const d = v[t];
    let w = 0;
    for (let i = t - 4; i <= t; i++) w += v[i];
    let m = 0;
    for (let i = t - 21; i <= t; i++) m += v[i];
    v.push(beta[0] + beta[1] * d + beta[2] * (w / 5) + beta[3] * (m / 22) + 2e-4 * (rand() - 0.5));
  }
  const fit = fitHar(v, {window: 19000, embargo: 0});
  assert.ok(fit, '맞춤 실패');
  assert.equal(fit.rows, 19000);
  const tol = [5e-5, 0.03, 0.06, 0.06];
  fit.beta.forEach((b, i) => assert.ok(Math.abs(b - beta[i]) <= tol[i], `beta[${i}] ${b} ≠ ${beta[i]}`));
  assert.ok(harPredict([-1, 0, 0, 0], v, v.length - 1) === VAR_FLOOR, '바닥 아래로 내려가지 않는다');
});

test('HAR: 엠바고 1이면 마지막 날을 맞춤 대상에서 뺀다', () => {
  const rand = rng(3);
  const r = Array.from({length: 400}, () => 0.02 * (rand() - 0.5));
  const a = harModel(r);
  const r2 = [...r];
  r2[r2.length - 1] = 0.3; // 마지막 날(출발일) 수익률만 크게 바꿈
  const b = harModel(r2);
  assert.deepEqual(a.beta, b.beta, '맞춤 계수는 출발일 수익률을 안 본다(엠바고)');
  assert.ok(b.sigmaNext > a.sigmaNext, '내일 흔들림 예측은 출발일 값을 쓴다');
});

test('분위수: 19개 · 오름차순 · 가운데 = 출발값(무판)', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  let n = 0;
  for (const s of board.stocks) {
    if (s.center === null) continue;
    n++;
    const q = QKEYS.map(k => s.quantiles[k]);
    assert.equal(q.length, 19);
    assert.equal(Object.keys(s.quantiles).length, 19);
    for (let i = 1; i < 19; i++) assert.ok(q[i] >= q[i - 1], `${s.code} ${QKEYS[i - 1]} > ${QKEYS[i]}`);
    assert.equal(s.quantiles.p50, s.center);
    const v = board.inputs.variables.find(x => x.id === `stock-price:${s.code}`);
    assert.equal(s.center, v.value);
    assert.ok(s.quantiles.p10 < s.center && s.center < s.quantiles.p90);
  }
  assert.equal(n, 52);
  assert.deepEqual(TAUS, [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]);
});

test('좌우 따로: 아래 꼬리가 무거운 잔차면 아래 분위수가 더 멀다', () => {
  const z = [];
  for (let i = 0; i < 200; i++) z.push(i < 100 ? -(i / 100) * 3 : ((i - 100) / 100) * 1); // 아래 3배
  const s = sidedZ(z);
  assert.ok(Math.abs(s.q(0.05)) > 2 * Math.abs(s.q(0.95)));
  assert.equal(s.q(0.5), 0);
});

test('시나리오: 위·가운데·아래 셋 · 확률 합 1 · 방향 확률 합 1', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  for (const s of board.stocks) {
    if (s.center === null) continue;
    assert.deepEqual(s.scenarios.map(x => x.name), ['위', '가운데', '아래']);
    const sum = s.scenarios.reduce((a, x) => a + x.prob, 0);
    assert.ok(Math.abs(sum - 1) <= 1e-12, `${s.code} 합 ${sum}`);
    const d = s.direction.up + s.direction.flat + s.direction.down;
    assert.ok(Math.abs(d - 1) <= 1e-12);
    for (const x of s.scenarios) assert.ok(x.premise && x.invalidator);
  }
});

test('같은 입력·씨앗이면 같은 결과 (정렬 직렬화 그대로)', () => {
  const inputs = buildInputs(INPUT, {asof: '2026-09-30', at: AT});
  const a = engine(structuredClone(inputs), 2026093016);
  const b = engine(structuredClone(inputs), 2026093016);
  assert.equal(canonicalJson(a), canonicalJson(b));
  const b1 = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  const b2 = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  assert.equal(canonicalJson(b1.board), canonicalJson(b2.board));
  assert.equal(b1.seal.sha256, b2.seal.sha256);
});

test('누수 없음: 출발일 뒤 자료를 바꿔도 판은 그대로', () => {
  const asof = '2026-09-15';
  const a = makeBoard({input: INPUT, slot: '16', asof, at: AT, git: GIT});
  const changed = structuredClone(INPUT);
  for (const s of changed.assets) for (const p of s.prices) if (p.date > asof) p.close = Math.round(p.close * 1.37);
  const b = makeBoard({input: changed, slot: '16', asof, at: AT, git: GIT});
  assert.equal(canonicalJson(a.board), canonicalJson(b.board));
  assert.ok(a.board.inputs.variables.every(v => !Array.isArray(v.history) || v.history.every(h => h.date <= asof)));
});

test('봉인 지문: 정렬 직렬화 sha256 은 키 순서·복사와 상관없이 같다', () => {
  const {board, seal} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  assert.equal(seal.sha256, boardSha256(structuredClone(board)));
  const reordered = Object.fromEntries(Object.entries(board).reverse());
  assert.equal(boardSha256(reordered), seal.sha256);
  assert.match(seal.sha256, /^[0-9a-f]{64}$/);
  assert.equal(sealRecord(board, 'abc1234').boardId, board.id);
  assert.match(board.dataVersion.sha256, /^[0-9a-f]{64}$/);
});

test('판 꼴: 코스피 없음은 null·「없음」 · 엔진은 앞 판을 안 봄 · 구조 A~F', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  assert.equal(board.kospi, null);
  const kv = board.inputs.variables.find(v => v.id === 'kospi');
  assert.equal(kv.status, '없음');
  assert.equal(kv.value, null);
  assert.equal(board.reconciliation.method, '없음');
  assert.ok(board.engines.every(e => e.sawPreviousBoard === false));
  assert.deepEqual([...new Set(board.structures.map(s => s[0]))].sort(), ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.ok(board.twoPath.length === 52 && board.twoPath.every(t => t.agree));
  assert.equal(board.target.date, '2026-10-01');
});

test('금지 말 0 (판 안의 모든 글)', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  const r = CHECKS.T10({boards: [board], view: null});
  assert.ok(r.pass, r.reason);
  const words = [];
  const walk = v => {
    if (typeof v === 'string') words.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(board);
  for (const f of FORBIDDEN) assert.ok(!words.some(w => f.re.test(w)), f.word);
});

test('채점: CRPS(19 분위수) · 브라이어 세 갈래 · 구간', () => {
  // 분위수가 모두 같은 값이면 CRPS = 2/19 · Σ|τ 가중| … 값 하나 분포의 근사 → |q − y| 의 2·평균 τ 가중
  const q = Array(19).fill(100);
  const viaQ = crpsFromQuantiles(q, 110);
  const sumTau = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95].reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(viaQ - (2 / 19) * sumTau * 10) < 1e-9);
  assert.ok(Math.abs(viaQ - crpsFromSamples([100], 110)) < 1e-9, '값 하나면 |x − y| 와 같다');
  assert.equal(outcomeOf(100, 100.05), 'flat');
  assert.equal(outcomeOf(100, 100.2), 'up');
  assert.equal(outcomeOf(100, 99.8), 'down');
  assert.ok(Math.abs(brier3({up: 0.5, flat: 0.2, down: 0.3}, 'up') - (0.25 + 0.04 + 0.09)) < 1e-12);
  assert.equal(intervalScore(90, 110, 120, 0.2), 20 + 10 * 10);
});

test('채점: 봉인이 목표 종가 뒤인 판은 채점하지 않는다', () => {
  const {board} = makeBoard({input: INPUT, slot: '16', asof: '2026-09-30', at: AT, git: GIT});
  const r = scoreBoard(board, INPUT, {scoredAt: AT});
  assert.equal(r.lines.length, 0);
  assert.match(r.why, /봉인이 목표 종가/);
});

test('채점: 16시 봉인 판은 다음 종가로 채점 · 무판은 지난 250일 분포 · 단순 전이식은 「없음」', () => {
  const at = '2026-09-30T16:00:00+09:00';
  const inputs = buildInputs(INPUT, {asof: '2026-09-30', at});
  const board = buildBoard({inputs, seed: 2026093016, slot: '16', kind: '무거운', createdAt: at, sealedAt: at, target: '2026-10-01', commit: 'abc1234', dirty: false, files: ['public/data/input.json'], retro: true});
  const {lines} = scoreBoard(board, INPUT, {scoredAt: AT});
  assert.equal(lines.length, 52);
  const l = lines[0];
  assert.equal(l.interval.alpha, 0.2);
  assert.ok(Number.isFinite(l.interval.score) && Number.isFinite(l.crps));
  assert.equal(l.baselines.find(b => b.id === '단순 전이식').note, '없음');
  const v = board.inputs.variables.find(x => x.id === `stock-price:${l.code}`);
  const nc = noChangeBaseline(v.value, v.history);
  assert.equal(nc.q19.length, 19);
  assert.ok(Math.abs(l.baselines[0].interval - intervalScore(nc.p10, nc.p90, l.actual.value, 0.2)) < 1e-5);
});

test('블록: 시나리오 경계는 k = 0.5σ 로 이어 붙는다', () => {
  const rand = rng(11);
  const z = Array.from({length: 300}, () => rand() * 4 - 2);
  const b = forecastBlock(1000, 0.02, z, {label: 'price'});
  const [up, mid, down] = b.scenarios;
  assert.equal(up.price.low, mid.price.high);
  assert.equal(down.price.high, mid.price.low);
  assert.ok(Math.abs(Math.log(up.price.low / 1000) - 0.01) < 1e-6);
});

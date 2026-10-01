#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 채점기 (board.md 「채점 한 줄」 꼴 · 판정 기준 atlas4h/seal/judgment.json·judgment-2.json)
 *
 *   node atlas4h/score/score.mjs --ledger DIR [--input FILE] [--atlas11 FILE]
 *
 * 목표 종가가 나온 판만 채점한다. 판의 봉인 시각이 목표일 15:30 KST(종가) 이후면 채점하지 않는다.
 * 점수(모두 낮을수록 좋음):
 *   CRPS     ≈ (2/19)·Σ 분위수 점수 (τ = 0.05 … 0.95)       — judgment.json scores.crps
 *   구간     α = 0.2, l = p10, u = p90 (stats.mjs intervalScore)  — judgment.json scores.interval
 *   브라이어 오름·보합·내림 세 갈래 Σ(p − o)², 보합 = ±0.10% 안 — judgment.json scores.brier
 * 기준 셋: 무판(출발값 + 지난 250거래일 하루 변화율 경험 분포) · 단순 전이식(반도체지수 자료 필요) · ATLAS 11(봉인 전 발행본의 같은 목표일 p10·p90)
 * 같은 판·종목은 두 번 채점하지 않는다(덧붙이기만).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {intervalScore, brierScore} from '../spec/stats.mjs';
import {TAUS, QKEYS, FLAT_BAND, quantileSorted} from '../engine/dist.mjs';
import {isoKst, nextSession} from '../engine/board.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ALPHA = 0.2;
export const NOCHANGE_DAYS = 250;
export const NONE = '없음';
export const WHY_TRANSFER = '단순 전이식은 직전 미국 반도체지수 등락이 필요한데 이 저장소에 반도체지수 지난 자료가 없음 (1단계 atlas4h-collect 전)';

/** CRPS — 19개 분위수의 분위수 점수 평균 × 2 (judgment.json scores.crps) */
export function crpsFromQuantiles(q19, y) {
  if (!Array.isArray(q19) || q19.length !== 19 || !q19.every(Number.isFinite) || !Number.isFinite(y)) return NaN;
  let s = 0;
  for (let i = 0; i < 19; i++) {
    const tau = TAUS[i];
    const q = q19[i];
    s += ((y < q ? 1 : 0) - tau) * (q - y);
  }
  return (2 / 19) * s;
}

/** 결과 갈래 — 출발값 대비 변화가 +0.10% 넘으면 up, −0.10% 밑이면 down, 그 안은 flat */
export function outcomeOf(anchor, y) {
  const ch = y / anchor - 1;
  if (ch > FLAT_BAND) return 'up';
  if (ch < -FLAT_BAND) return 'down';
  return 'flat';
}

/** 세 갈래 브라이어 Σ(p_k − o_k)² (stats.mjs brierScore 를 갈래마다 더함) */
export function brier3(p, outcome) {
  return ['up', 'flat', 'down'].reduce((a, k) => a + brierScore(p[k], outcome === k ? 1 : 0), 0);
}

export function q19Of(quantiles) {
  return QKEYS.map(k => quantiles?.[k]);
}

/** 무판 기준: 출발값 + 지난 250거래일 하루 변화율의 경험 분포 (판의 inputs 안 자료만 = 봉인 전 자료) */
export function noChangeBaseline(anchor, history) {
  const ch = history.slice(-NOCHANGE_DAYS).map(h => h.changePct / 100).sort((a, b) => a - b);
  if (ch.length < NOCHANGE_DAYS) return null;
  const q19 = TAUS.map(t => anchor * (1 + quantileSorted(ch, t)));
  let up = 0;
  let down = 0;
  for (const c of ch) {
    if (c > FLAT_BAND) up++;
    else if (c < -FLAT_BAND) down++;
  }
  const n = ch.length;
  return {q19, p10: q19[1], p90: q19[17], direction: {up: up / n, flat: (n - up - down) / n, down: down / n}};
}

const r6 = x => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);

/**
 * ATLAS 11 발행본 목록 — public/data/atlas11/forecast.json 의 지금 발행본과 그 안의 「직전 발행본(previous)」.
 * 돌려줌: [{forecastId, issuedAt, actualAsOf, rows: Map(code → [{date, p10, p50, p90}])}]
 * 장부 reports/atlas11/ledger/forecast/*.jsonl 에는 분위수가 없다(발행 여부만) → 여기서 쓰지 않는다.
 */
export function loadAtlas11(file) {
  let f;
  try {
    f = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  const pubs = [];
  const cur = {forecastId: f.forecastId, issuedAt: f.issuedAt, actualAsOf: f.actualAsOf, rows: new Map()};
  const prevs = new Map();
  for (const a of f.assets ?? []) {
    cur.rows.set(a.code, (a.rows ?? []).map(r => ({date: r.date, p10: r.p10, p50: r.p50, p90: r.p90})));
    const p = a.previous;
    if (p && p.forecastId) {
      if (!prevs.has(p.forecastId)) prevs.set(p.forecastId, {forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, rows: new Map()});
      prevs.get(p.forecastId).rows.set(a.code, (p.rows ?? []).map(r => ({date: r.date, p10: r.p10, p50: r.p50, p90: r.p90})));
    }
  }
  pubs.push(cur, ...prevs.values());
  return pubs;
}

/**
 * ATLAS 11 기준 — 봉인 시각 전에 나온 마지막 발행본의 같은 목표일 1거래일 전망 p10·p90.
 * 1거래일 전망 = 발행본의 actualAsOf 다음 거래일이 목표일인 것 (judgment.json units.stocks.atlas11).
 */
export function atlas11Band(pubs, sessions, code, target, sealedAt) {
  const seal = Date.parse(sealedAt);
  const ok = pubs
    .filter(p => Date.parse(p.issuedAt) < seal && nextSession(sessions, p.actualAsOf) === target)
    .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  for (const p of ok) {
    const row = (p.rows.get(code) ?? []).find(r => r.date === target);
    if (row && Number.isFinite(row.p10) && Number.isFinite(row.p90)) return {forecastId: p.forecastId, issuedAt: p.issuedAt, p10: row.p10, p90: row.p90};
  }
  const later = pubs.filter(p => nextSession(sessions, p.actualAsOf) === target && !(Date.parse(p.issuedAt) < seal));
  const why = later.length
    ? `같은 목표일 발행본이 봉인 뒤에 나옴 (${later.map(p => isoKst(Date.parse(p.issuedAt))).join(' · ')}) — 봉인 전 발행본 없음`
    : '봉인 전에 나온 같은 목표일 1거래일 발행본(p10·p90)을 읽을 수 있는 파일에서 못 찾음';
  return {none: true, why};
}

/** 종목 하나 채점 — 판의 종목 덩어리 + 실제 종가 → 채점 한 줄 */
export function scoreStock({board, stock, variable, actual, pubs, sessions, scoredAt, atlas11Why = null}) {
  const y = actual.value;
  const anchor = variable.value;
  const q19 = q19Of(stock.quantiles);
  const lo = stock.quantiles.p10;
  const hi = stock.quantiles.p90;
  const outcome = outcomeOf(anchor, y);
  const engineInterval = intervalScore(lo, hi, y, ALPHA);
  const nc = noChangeBaseline(anchor, variable.history ?? []);
  const baselines = [];
  baselines.push(nc
    ? {id: '무판', crps: r6(crpsFromQuantiles(nc.q19, y)), interval: r6(intervalScore(nc.p10, nc.p90, y, ALPHA)), covered: nc.p10 <= y && y <= nc.p90, brier: r6(brier3(nc.direction, outcome))}
    : {id: '무판', crps: null, interval: null, note: NONE, why: `지난 하루 변화율이 ${NOCHANGE_DAYS}개보다 적음`});
  baselines.push({id: '단순 전이식', crps: null, interval: null, brier: null, note: NONE, why: WHY_TRANSFER});
  const a11 = atlas11Why ? {none: true, why: atlas11Why} : atlas11Band(pubs, sessions, stock.code, board.target.date, board.sealedAt);
  baselines.push(a11.none
    ? {id: 'ATLAS 11', crps: null, interval: null, note: NONE, why: a11.why}
    : {id: 'ATLAS 11', crps: null, interval: r6(intervalScore(a11.p10, a11.p90, y, ALPHA)), covered: a11.p10 <= y && y <= a11.p90, forecastId: a11.forecastId,
      crpsNote: 'CRPS 는 ATLAS 11 발행본에 분위수 19개가 없어 「없음」'});
  return {
    boardId: board.id,
    code: stock.code,
    target: board.target.date,
    scoredAt,
    anchor,
    actual,
    crps: r6(crpsFromQuantiles(q19, y)),
    interval: {alpha: ALPHA, score: r6(engineInterval), covered: lo <= y && y <= hi},
    brier: {event: '오름·보합·내림', p: stock.direction, o: outcome, score: r6(brier3(stock.direction, outcome))},
    baselines,
    crisis: null,
    crisisWhy: '위기 구간은 코스피 하루 변화 상위 10% 날로 정하는데 코스피 자료가 없음',
  };
}

/** 실제 종가 찾기 — input.json 의 그날 종가 행 */
export function actualOf(input, code, date) {
  const a = input.assets.find(x => x.code === code);
  const row = a?.prices.find(p => p.date === date);
  if (!row) return null;
  return {value: row.close, asOf: `${date}T15:30:00+09:00`, source: row.sourceUrl ?? a.priceSource.url};
}

/** 판 하나의 채점 줄들 (채점할 수 없으면 까닭과 함께 빈 목록) */
export function scoreBoard(board, input, {pubs = [], scoredAt = isoKst(Date.now()), atlas11Why = null} = {}) {
  const closeAt = Date.parse(`${board.target.date}T15:30:00+09:00`);
  if (!(Date.parse(board.sealedAt) < closeAt)) return {lines: [], why: '봉인이 목표 종가(15:30) 뒤 — 채점하지 않음'};
  if (!(Date.parse(scoredAt) >= closeAt)) return {lines: [], why: '목표 종가가 아직 없음'};
  const sessions = input.calendar.sessions;
  const lines = [];
  let missing = 0;
  for (const stock of board.stocks) {
    if (stock.center === null) continue;
    const variable = board.inputs.variables.find(v => v.id === `stock-price:${stock.code}`);
    const actual = actualOf(input, stock.code, board.target.date);
    if (!actual) {
      missing++;
      continue;
    }
    lines.push(scoreStock({board, stock, variable, actual, pubs, sessions, scoredAt, atlas11Why}));
  }
  return {lines, why: lines.length ? null : `목표 종가 없음 (${missing})`};
}

function readJsonl(dir) {
  const out = [];
  let names = [];
  try {
    names = fs.readdirSync(dir).filter(n => n.endsWith('.jsonl')).sort();
  } catch {
    return out;
  }
  for (const n of names) for (const l of fs.readFileSync(path.join(dir, n), 'utf8').split('\n')) if (l.trim()) out.push(JSON.parse(l));
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const o = {ledger: null, input: path.join(ROOT, 'public/data/input.json'), atlas11: path.join(ROOT, 'public/data/atlas11/forecast.json')};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ledger') o.ledger = argv[++i];
    else if (argv[i] === '--input') o.input = argv[++i];
    else if (argv[i] === '--atlas11') o.atlas11 = argv[++i];
    else throw new Error(`모르는 칸: ${argv[i]}`);
  }
  if (!o.ledger) throw new Error('--ledger DIR 가 필요하다');
  const input = JSON.parse(fs.readFileSync(o.input, 'utf8'));
  const pubs = loadAtlas11(o.atlas11);
  const done = new Set(readJsonl(path.join(o.ledger, 'scores')).map(s => `${s.boardId}|${s.code}`));
  const boards = readJsonl(path.join(o.ledger, 'boards'));
  let wrote = 0;
  for (const b of boards) {
    const {lines, why} = scoreBoard(b, input, {pubs});
    const fresh = lines.filter(l => !done.has(`${l.boardId}|${l.code}`));
    if (!fresh.length) {
      console.log(`${b.id}: 채점 안 함 — ${why ?? '이미 채점됨'}`);
      continue;
    }
    const file = path.join(o.ledger, 'scores', `${b.target.date}.jsonl`);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.appendFileSync(file, fresh.map(l => JSON.stringify(l)).join('\n') + '\n');
    wrote += fresh.length;
    console.log(`${b.id}: ${fresh.length}줄 채점`);
  }
  console.log(`채점 줄 ${wrote}개 덧붙임`);
  return wrote;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (e) {
    console.error(`멈춤: ${e.message}`);
    process.exit(1);
  }
}

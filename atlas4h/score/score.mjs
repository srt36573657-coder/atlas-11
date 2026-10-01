#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 채점기 (board.md 「채점 한 줄」 꼴 · 판정 기준 atlas4h/seal/judgment.json·judgment-2.json)
 *
 *   node atlas4h/score/score.mjs --ledger DIR [--input FILE] [--atlas11 FILE] [--history DIR]
 *
 * 목표 종가가 나온 판만 채점한다. 판의 봉인 시각이 목표일 15:30 KST(종가) 이후면 채점하지 않는다.
 * 점수(모두 낮을수록 좋음):
 *   CRPS     ≈ (2/19)·Σ 분위수 점수 (τ = 0.05 … 0.95)       — judgment.json scores.crps
 *   구간     α = 0.2, l = p10, u = p90 (stats.mjs intervalScore)  — judgment.json scores.interval
 *   브라이어 오름·보합·내림 세 갈래 Σ(p − o)², 보합 = ±0.10% 안 — judgment.json scores.brier
 *
 * 기준 셋 (판정 기준 그대로 · 아래 [판단] 은 2026-10-01 에 정해 고정한 해석):
 *   무판        출발값 + 출발일까지 지난 250거래일 하루 변화율(종가 → 다음 종가)의 경험 분포 19개 분위수.
 *               판에는 지난 기록이 없으므로 채점기가 자료 파일(input.json · kospi.json)에서 출발일 이하만 읽어 센다.
 *   단순 전이식 다음 장 등락 c(%) = 갭 + 장중, 갭 = 0.20 + 0.31·s, 장중 = 0.27·갭 (명령문 <상수와_변수> 9월 2일 시작값)
 *               분위수 = 출발값 × (1 + c/100) × (1 + r_τ), r_τ = 무판과 같은 19개 경험 변화율 분위수 (「폭 = 무판과 같은 경험 분포」)
 *               방향 확률도 같은 옮긴 분포에서 무판과 같은 셈(±0.10%)으로 낸다.
 *     [판단] s = 반도체지수(SOX) 종가 → 종가 등락(%) 중, 미국 장 마감(뉴욕 16:00 · 서머타임 셈)이 앞 한국 장 마감(출발일 15:30 KST)
 *            뒤이고 봉인 시각 앞인 미국 장의 것. 그런 장이 여럿이면(한국 휴일) 가장 늦은 하나만(글 그대로 「전날」).
 *            하나도 없으면(미국 휴장) s = 0, 쪽지 「미국 휴장 — 밤사이 등락 0」. 반도체지수 자료가 없으면 「없음」.
 *     [판단] 08시 판에만 낸다. 12시 판은 「없음」(judgment-2). 16·20·00·04시 판은 「없음」 — 쪽지 「봉인 때 다음 장 앞 미국 장이 아직 없음」.
 *   ATLAS 11    (종목만 · 코스피는 judgment units.kospi 대로 기준 둘) 봉인 전에 나온 ATLAS 11 1거래일 전망의 p10·p90(구간),
 *               p50(가운데), 오름·보합·내림 확률(브라이어). CRPS 는 분위수가 7개뿐이라 「없음」(판정은 19개를 요구).
 *     [판단] 재현은 atlas4h/baselines/atlas11-v1-retro.json(후향 · 같은 방법·같은 난수로 다시 만든 값)의 목표일·종목 줄,
 *            출발일 = 판의 출발일인 줄만. ATLAS 11 은 17시 뒤에 발행하므로 16시 판에는 「없음」(봉인 때 아직 없음).
 * 위기 날 [판단]: 목표일 코스피 하루 변화 크기가, 봉인 때 아는 지난 250거래일 코스피 하루 변화 크기의 90% 분위수 이상인 날.
 * 같은 판·종목은 두 번 채점하지 않는다(덧붙이기만).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {intervalScore, brierScore} from '../spec/stats.mjs';
import {TAUS, QKEYS, FLAT_BAND, quantileSorted} from '../engine/dist.mjs';
import {isoKst, nextSession, prevSession, usCloseUtcMs, krxCloseUtcMs} from '../engine/clock.mjs';
import {loadHistories, changesUpTo, rowOf, HISTORY_DIR} from '../engine/history.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ALPHA = 0.2;
export const NOCHANGE_DAYS = 250;
export const CRISIS_DAYS = 250;
export const CRISIS_SHARE = 0.1;
export const NONE = '없음';
export const TRANSFER = Object.freeze({gap0: 0.2, gapSox: 0.31, intraday: 0.27});
export const NOTE_US_CLOSED = '미국 휴장 — 밤사이 등락 0';
export const NOTE_TRANSFER_EARLY = '봉인 때 다음 장 앞 미국 장이 아직 없음';
export const NOTE_TRANSFER_SLOT12 = '12시 판 단순 전이식은 내지 않음 (judgment-2)';
export const NOTE_A11_EARLY = 'ATLAS 11 은 17시 뒤에 발행 — 16시 봉인 때 다음 장 전망이 아직 없음';
export const A11_CRPS_NOTE = '없음 — ATLAS 11 은 분위수 7개 (판정 기준은 19개)';
export const ATLAS11_RETRO_FILE = 'atlas4h/baselines/atlas11-v1-retro.json';
export const ATLAS11_RETRO_SCHEMA = 'atlas4h-atlas11-retro-1';

const r6 = x => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);
const ok = v => typeof v === 'number' && Number.isFinite(v) && v > 0;

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

/** 종가 줄들 → 하루 등락 [{date, changePct}] — 엔진 0판과 같은 셈 (오늘 ÷ 어제 − 1) × 100 */
export function stockChangesUpTo(input, code, date) {
  const a = input.assets.find(x => x.code === code);
  if (!a) return [];
  const rows = a.prices.filter(p => p.date <= date);
  const out = [];
  for (let i = 1; i < rows.length; i++) out.push({date: rows[i].date, changePct: (rows[i].close / rows[i - 1].close - 1) * 100});
  return out;
}

/** 무판 기준: 출발값 + 지난 250거래일 하루 변화율의 경험 분포 (출발일 이하 자료만 = 봉인 전 자료) */
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
  return {q19, p10: q19[1], p50: q19[9], p90: q19[17], direction: {up: up / n, flat: (n - up - down) / n, down: down / n}};
}

/** 단순 전이식 가운데 등락(%) — 갭 = 0.20 + 0.31·s · 장중 = 0.27·갭 · c = 갭 + 장중 */
export function transferCenterPct(s) {
  const gap = TRANSFER.gap0 + TRANSFER.gapSox * s;
  const intraday = TRANSFER.intraday * gap;
  return {gap, intraday, c: gap + intraday};
}

/** 단순 전이식 기준: 출발값 × (1 + c/100) × (1 + r_τ) · 방향은 같은 옮긴 분포에서 (무판과 같은 셈) */
export function transferBaseline(anchor, s, history) {
  const ch = history.slice(-NOCHANGE_DAYS).map(h => h.changePct / 100).sort((a, b) => a - b);
  if (ch.length < NOCHANGE_DAYS || !Number.isFinite(s)) return null;
  const {gap, intraday, c} = transferCenterPct(s);
  const shift = 1 + c / 100;
  const q19 = TAUS.map(t => anchor * shift * (1 + quantileSorted(ch, t)));
  let up = 0;
  let down = 0;
  for (const x of ch) {
    const m = shift * (1 + x) - 1;
    if (m > FLAT_BAND) up++;
    else if (m < -FLAT_BAND) down++;
  }
  const n = ch.length;
  return {q19, p10: q19[1], p50: q19[9], p90: q19[17], direction: {up: up / n, flat: (n - up - down) / n, down: down / n}, s, gap, intraday, c};
}

/**
 * 밤사이 반도체지수 등락 s — 앞 한국 장 마감(anchorDate 15:30 KST) 뒤 · 봉인(sealAt) 앞에 마감한 미국 장 중 가장 늦은 것.
 *   sox = loadHistory 결과(반도체지수). 돌려줌 {s, session, prevSession, closeAt} · {s: 0, note: 미국 휴장} · {none, why}
 * 「확인 중」(두 출처가 어긋나 값 null) 줄도 장이 열린 날로 센다 — 그 장이 고른 장이면 「없음」.
 */
export function soxOvernight(sox, anchorDate, sealAt) {
  if (!sox || sox.none) return {none: true, why: sox?.why ?? '반도체지수 지난 자료 없음'};
  const from = krxCloseUtcMs(anchorDate);
  const to = Date.parse(sealAt);
  const rows = sox.series.filter(r => ok(r.value) || r.status === '확인 중');
  let pick = -1;
  let after = false;
  for (let i = 0; i < rows.length; i++) {
    const t = usCloseUtcMs(rows[i].date);
    if (t > from && t < to) pick = i;
    if (t >= to) after = true;
  }
  if (pick < 0) {
    if (!after) return {none: true, why: `반도체지수 자료가 봉인 시각 앞에서 끝남 (마지막 ${rows.at(-1)?.date ?? '없음'}) — 미국 휴장인지 모름`};
    return {s: 0, note: NOTE_US_CLOSED, session: null};
  }
  const r = rows[pick];
  const p = rows[pick - 1];
  if (!p) return {none: true, why: `반도체지수 ${r.date} 앞 미국 장 값 없음`};
  if (!ok(r.value) || !ok(p.value)) return {none: true, why: `반도체지수 ${!ok(r.value) ? r.date : p.date} 값 없음(${!ok(r.value) ? r.status : p.status})`};
  return {s: (r.value / p.value - 1) * 100, session: r.date, prevSession: p.date, closeAt: isoKst(usCloseUtcMs(r.date))};
}

/** 판 시각별 단순 전이식 입력 (judgment + judgment-2) */
export function transferFor(slot, sox, anchorDate, sealAt) {
  if (slot === '12') return {none: true, why: NOTE_TRANSFER_SLOT12};
  if (slot !== '08') return {none: true, why: NOTE_TRANSFER_EARLY};
  return soxOvernight(sox, anchorDate, sealAt);
}

/** ATLAS 11 후향 파일 (atlas4h-atlas11-retro-1) → {label, map(목표일|종목 → 줄)} 또는 {none, why} */
export function loadAtlas11Retro(file) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {none: true, why: `ATLAS 11 후향 파일을 못 읽음 (${path.relative(ROOT, file)})`};
  }
  if (doc?.schema !== ATLAS11_RETRO_SCHEMA || !Array.isArray(doc.rows)) return {none: true, why: `ATLAS 11 후향 파일 꼴이 ${ATLAS11_RETRO_SCHEMA} 아님`};
  if (doc.status !== '있음') return {none: true, why: `ATLAS 11 후향 파일 상태 「${doc.status}」 (${doc.reason ?? ''})`};
  return {label: doc.label ?? null, map: new Map(doc.rows.map(r => [`${r.target}|${r.code}`, r])), rows: doc.rows.length};
}

/** ATLAS 11 후향 한 줄 — 목표일·종목이 같고 출발일 = 판의 출발일인 줄 */
export function atlas11RetroBand(a11, target, code, anchorDate) {
  if (!a11 || a11.none) return {none: true, why: a11?.why ?? 'ATLAS 11 후향 파일 없음'};
  const r = a11.map.get(`${target}|${code}`);
  if (!r) return {none: true, why: `ATLAS 11 후향 줄 없음 (${target} · ${code})`};
  if (anchorDate && r.origin !== anchorDate) return {none: true, why: `ATLAS 11 후향 줄의 출발일 ${r.origin} ≠ 판의 출발일 ${anchorDate}`};
  if (![r.p10, r.p50, r.p90, r.up, r.flat, r.down].every(Number.isFinite)) return {none: true, why: `ATLAS 11 후향 줄 값 빠짐 (${target} · ${code})`};
  return {p10: r.p10, p50: r.p50, p90: r.p90, direction: {up: r.up, flat: r.flat, down: r.down}, label: a11.label, origin: r.origin, anchor: r.anchor};
}

/**
 * ATLAS 11 발행본 목록 — public/data/atlas11/forecast.json 의 지금 발행본과 그 안의 「직전 발행본(previous)」 (실시간 채점용).
 * 돌려줌: [{forecastId, issuedAt, actualAsOf, rows: Map(code → [{date, p10, p50, p90}])}]
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

/** 실시간 ATLAS 11 — 봉인 시각 전에 나온 마지막 발행본의 같은 목표일 1거래일 전망 p10·p90 */
export function atlas11Band(pubs, sessions, code, target, sealedAt) {
  const seal = Date.parse(sealedAt);
  const fit = pubs
    .filter(p => Date.parse(p.issuedAt) < seal && nextSession(sessions, p.actualAsOf) === target)
    .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  for (const p of fit) {
    const row = (p.rows.get(code) ?? []).find(r => r.date === target);
    if (row && Number.isFinite(row.p10) && Number.isFinite(row.p90)) return {forecastId: p.forecastId, issuedAt: p.issuedAt, p10: row.p10, p50: row.p50, p90: row.p90, direction: null};
  }
  const later = pubs.filter(p => nextSession(sessions, p.actualAsOf) === target && !(Date.parse(p.issuedAt) < seal));
  const why = later.length
    ? `같은 목표일 발행본이 봉인 뒤에 나옴 (${later.map(p => isoKst(Date.parse(p.issuedAt))).join(' · ')}) — 봉인 전 발행본 없음`
    : '봉인 전에 나온 같은 목표일 1거래일 발행본(p10·p90)을 읽을 수 있는 파일에서 못 찾음';
  return {none: true, why};
}

/** 위기 날인가 — 목표일 코스피 |하루 변화| ≥ 봉인 때 지난 250거래일 |하루 변화|의 90% 분위수. 못 세면 {crisis: null, why} */
export function crisisOf(kospi, anchorDate, target) {
  if (!kospi || kospi.none) return {crisis: null, why: '위기 날은 코스피 하루 변화 상위 10% 날로 정하는데 코스피 자료가 없음'};
  const past = changesUpTo(kospi.series, anchorDate).slice(-CRISIS_DAYS).map(c => Math.abs(c.changePct)).sort((a, b) => a - b);
  if (past.length < CRISIS_DAYS) return {crisis: null, why: `코스피 지난 하루 변화가 ${CRISIS_DAYS}개보다 적음`};
  const last = changesUpTo(kospi.series, target).at(-1);
  if (!last || last.date !== target) return {crisis: null, why: `코스피 ${target} 하루 변화 없음`};
  const threshold = quantileSorted(past, 1 - CRISIS_SHARE);
  return {crisis: Math.abs(last.changePct) >= threshold, thresholdPct: r6(threshold), changePct: r6(last.changePct)};
}

/** 기준 한 칸 — 분위수 19개(q19) 가 있으면 CRPS 도 · 방향 확률이 있으면 브라이어도 */
function baselineEntry(id, b, y, outcome, extra = {}) {
  return {
    id,
    crps: b.q19 ? r6(crpsFromQuantiles(b.q19, y)) : null,
    interval: r6(intervalScore(b.p10, b.p90, y, ALPHA)),
    covered: b.p10 <= y && y <= b.p90,
    brier: b.direction ? r6(brier3(b.direction, outcome)) : null,
    ...extra,
  };
}
const noneEntry = (id, why) => ({id, crps: null, interval: null, brier: null, note: NONE, why});

/**
 * 한 대상(종목 또는 코스피) 채점 한 줄.
 *   block    판의 덩어리(quantiles · direction) · anchor 출발값 · actual {value, asOf, source}
 *   history  출발일 이하 하루 등락 [{changePct}] (무판·단순 전이식의 폭)
 *   transfer transferFor() 결과 · atlas11 = 없으면 undefined(코스피), 있으면 atlas11RetroBand/atlas11Band 결과
 */
export function scoreUnit({board, code, block, anchor, actual, history, transfer, atlas11, scoredAt, crisis}) {
  const y = actual.value;
  const outcome = outcomeOf(anchor, y);
  const lo = block.quantiles.p10;
  const hi = block.quantiles.p90;
  const baselines = [];
  const nc = noChangeBaseline(anchor, history);
  baselines.push(nc ? baselineEntry('무판', nc, y, outcome) : noneEntry('무판', `지난 하루 변화율이 ${NOCHANGE_DAYS}개보다 적음`));
  if (transfer.none) baselines.push(noneEntry('단순 전이식', transfer.why));
  else {
    const t = transferBaseline(anchor, transfer.s, history);
    baselines.push(t
      ? baselineEntry('단순 전이식', t, y, outcome, {s: r6(transfer.s), c: r6(t.c), session: transfer.session ?? null, ...(transfer.note ? {note: transfer.note} : {})})
      : noneEntry('단순 전이식', `지난 하루 변화율이 ${NOCHANGE_DAYS}개보다 적음`));
  }
  if (atlas11 !== undefined) {
    baselines.push(atlas11.none
      ? noneEntry('ATLAS 11', atlas11.why)
      : baselineEntry('ATLAS 11', atlas11, y, outcome, {crpsNote: A11_CRPS_NOTE, ...(atlas11.label ? {label: atlas11.label} : {}), ...(atlas11.forecastId ? {forecastId: atlas11.forecastId} : {})}));
  }
  return {
    boardId: board.id,
    code,
    target: board.target.date,
    scoredAt,
    anchor,
    actual,
    crps: r6(crpsFromQuantiles(q19Of(block.quantiles), y)),
    interval: {alpha: ALPHA, score: r6(intervalScore(lo, hi, y, ALPHA)), covered: lo <= y && y <= hi},
    brier: {event: '오름·보합·내림', p: block.direction, o: outcome, score: r6(brier3(block.direction, outcome))},
    baselines,
    crisis: crisis.crisis,
    ...(crisis.crisis === null ? {crisisWhy: crisis.why} : {}),
  };
}

/** 실제 종가 찾기 — input.json 의 그날 종가 행 */
export function actualOf(input, code, date) {
  const a = input.assets.find(x => x.code === code);
  const row = a?.prices.find(p => p.date === date);
  if (!row) return null;
  return {value: row.close, asOf: `${date}T15:30:00+09:00`, source: row.sourceUrl ?? a.priceSource.url};
}

/** 코스피 실제 종가 — kospi.json 의 그날 줄 */
export function kospiActualOf(kospi, date) {
  if (!kospi || kospi.none) return null;
  const row = rowOf(kospi.series, date);
  if (!row || !ok(row.value)) return null;
  return {value: row.value, asOf: `${date}T15:30:00+09:00`, source: kospi.file};
}

/**
 * 판 하나의 채점 줄들 (채점할 수 없으면 까닭과 함께 빈 목록)
 *   opts.histories  {kospi, sox} (loadHistories) · opts.atlas11Retro (loadAtlas11Retro) — 있으면 재현 기준 · 없으면 opts.pubs(실시간 발행본)
 * 돌려줌 {lines(52종목), kospiLine(코스피 · 없으면 null), why}
 */
export function scoreBoard(board, input, {pubs = [], scoredAt = isoKst(Date.now()), histories = {}, atlas11Retro = null} = {}) {
  const closeAt = Date.parse(`${board.target.date}T15:30:00+09:00`);
  if (!(Date.parse(board.sealedAt) < closeAt)) return {lines: [], kospiLine: null, why: '봉인이 목표 종가(15:30) 뒤 — 채점하지 않음'};
  if (!(Date.parse(scoredAt) >= closeAt)) return {lines: [], kospiLine: null, why: '목표 종가가 아직 없음'};
  const sessions = input.calendar.sessions;
  const target = board.target.date;
  const anchorDate = prevSession(sessions, target); // 판의 출발일 = 목표일 앞 거래일 (16·20시: 그날 · 00·04·08시: 앞 거래일)
  const transfer = transferFor(board.slot, histories.sox, anchorDate, board.sealedAt);
  const crisis = crisisOf(histories.kospi, anchorDate, target);
  const lines = [];
  let missing = 0;
  for (const stock of board.stocks) {
    if (stock.center === null) continue;
    const variable = board.inputs.variables.find(v => v.id === `stock-price:${stock.code}`);
    const actual = actualOf(input, stock.code, target);
    if (!actual) {
      missing++;
      continue;
    }
    let atlas11;
    if (board.slot === '16') atlas11 = {none: true, why: NOTE_A11_EARLY};
    else if (atlas11Retro) atlas11 = atlas11RetroBand(atlas11Retro, target, stock.code, anchorDate);
    else atlas11 = atlas11Band(pubs, sessions, stock.code, target, board.sealedAt);
    lines.push(scoreUnit({board, code: stock.code, block: stock, anchor: variable.value, actual, history: stockChangesUpTo(input, stock.code, anchorDate),
      transfer, atlas11, scoredAt, crisis}));
  }
  let kospiLine = null;
  if (board.kospi && board.kospi.center !== null) {
    const actual = kospiActualOf(histories.kospi, target);
    if (actual) {
      kospiLine = scoreUnit({board, code: 'kospi', block: board.kospi, anchor: board.kospi.anchor.value, actual,
        history: changesUpTo(histories.kospi.series, anchorDate), transfer, atlas11: undefined, scoredAt, crisis});
    }
  }
  return {lines, kospiLine, why: lines.length ? null : `목표 종가 없음 (${missing})`};
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
  const o = {ledger: null, input: path.join(ROOT, 'public/data/input.json'), atlas11: path.join(ROOT, 'public/data/atlas11/forecast.json'), history: path.join(ROOT, HISTORY_DIR)};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ledger') o.ledger = argv[++i];
    else if (argv[i] === '--input') o.input = argv[++i];
    else if (argv[i] === '--atlas11') o.atlas11 = argv[++i];
    else if (argv[i] === '--history') o.history = argv[++i];
    else throw new Error(`모르는 칸: ${argv[i]}`);
  }
  if (!o.ledger) throw new Error('--ledger DIR 가 필요하다');
  const input = JSON.parse(fs.readFileSync(o.input, 'utf8'));
  const pubs = loadAtlas11(o.atlas11);
  const histories = loadHistories(o.history, ['kospi', 'sox'], ROOT);
  const done = new Set(readJsonl(path.join(o.ledger, 'scores')).map(s => `${s.boardId}|${s.code}`));
  const boards = readJsonl(path.join(o.ledger, 'boards'));
  let wrote = 0;
  for (const b of boards) {
    const {lines, kospiLine, why} = scoreBoard(b, input, {pubs, histories});
    const fresh = [...lines, ...(kospiLine ? [kospiLine] : [])].filter(l => !done.has(`${l.boardId}|${l.code}`));
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

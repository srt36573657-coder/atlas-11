#!/usr/bin/env node
/**
 * 독립 흠 심기 · 묶음 2 (atlas4h-independent-defects-2)
 *
 * 시험 코드(checks.mjs) 본문·시험 파일·묶음 1 흠 목록을 보지 않은 일꾼이
 * 사양 글(command/*.txt · spec/board.md · data/contract.md · seal/judgment*.json · harness/conflicts.md)만 보고 만든 흠과 헛잡음 탐침.
 *
 *   node atlas4h/verify/independent-defects-2.mjs             흠·탐침을 돌려 independent-defects-2.json 을 새로 쓴다
 *   node atlas4h/verify/independent-defects-2.mjs --register  결과 없이 흠·탐침 목록만 쓴다(미리 등록)
 *
 * 바탕 A = spec/fixtures/good + 제가 만든 좋은 재료(뒤 판 37개·채점·고리·감시 · 재현 40줄 · 커밋 목록 · 판정 기준 커밋 시각)
 * 바탕 B = 0판 엔진(engine/board.mjs)으로 지은 판 3개 — T4 전용(엔진을 넘겨 다시 돌림)
 * 흠 하나 = 바탕의 깊은 복사본에 고친 곳 하나(뜻으로 하나). 임시 폴더에만 쓴다(진짜 atlas4h/ledger 는 건드리지 않음).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadState, runAll, boardSha256} from '../spec/checks.mjs';
import {engine as realEngine, buildBoard} from '../engine/board.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'atlas4h/verify/independent-defects-2.json');
const FIX = path.join(ROOT, 'atlas4h/spec/fixtures/good');
const REGISTER = process.argv.includes('--register');

const clone = o => JSON.parse(JSON.stringify(o));
const hex = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const r2 = x => Math.round(x * 100) / 100;
const ymd = d => d.replaceAll('-', '');
const readJsonl = f => fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

function weekdays(from, n, skip = []) {
  const out = [];
  let t = Date.parse(from + 'T00:00:00Z');
  while (out.length < n) {
    const d = new Date(t);
    const s = d.toISOString().slice(0, 10);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6 && !skip.includes(s)) out.push(s);
    t += 86400e3;
  }
  return out;
}
function weekdaysBack(to, n) {
  const out = [];
  let t = Date.parse(to + 'T00:00:00Z');
  while (out.length < n) {
    const d = new Date(t);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) out.unshift(d.toISOString().slice(0, 10));
    t -= 86400e3;
  }
  return out;
}

// ───────────────────────── 바탕 A ─────────────────────────
const B08 = '4h-20261002-08-a1b2c3d4';
const B12 = '4h-20261002-12-b2c3d4e5';
const B16 = '4h-20261002-16-c3d4e5f6';
const R01 = 'r4h-20260901-08-d4e5f6a7';
const GEN = []; // 뒤 판 37개 {date, id, crisis, miss, loopId}
const NORMAL_MISS = [3, 8, 13, 19, 24, 29];
const CRISIS_MISS = [34];

function loadFixture() {
  const files = {};
  const walk = d => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const rel = path.relative(FIX, p).split(path.sep).join('/');
        files[rel] = rel.endsWith('.jsonl') ? readJsonl(p) : JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  };
  walk(FIX);
  return files;
}

function makeLive(tpl, date, prevDate, level) {
  const b = clone(tpl);
  b.id = `4h-${ymd(date)}-08-${hex(`live-${date}`).slice(0, 8)}`;
  b.createdAt = `${date}T08:00:05+09:00`;
  b.sealedAt = `${date}T08:31:40+09:00`;
  b.dataCutoff = b.sealedAt;
  b.target = {date, what: '봉인 뒤 첫 종가'};
  b.seed = Number(`${ymd(date)}08`);
  b.dataVersion = {sha256: hex(`data-${date}`), files: [`atlas4h/ledger/inputs/${date}T08.json`]};
  for (const v of b.inputs.variables) {
    if (v.id === 'kospi') {
      v.value = level;
      v.observedAt = `${prevDate}T15:30:00+09:00`;
      v.fetchedAt = `${date}T08:00:21+09:00`;
      Object.assign(v.sources[0], {value: level, observedAt: v.observedAt, fetchedAt: v.fetchedAt});
      Object.assign(v.sources[1], {value: level, observedAt: v.observedAt, fetchedAt: `${date}T08:00:40+09:00`,
        url: `https://data-dbg.krx.co.kr/svc/apis/idx/kospi_dd_trd?basDd=${ymd(prevDate)}`});
    } else if (v.id === 'sox' || v.id === 'sp500') {
      v.observedAt = `${date}T05:00:00+09:00`;
      v.fetchedAt = `${date}T08:00:2${v.id === 'sox' ? 2 : 3}+09:00`;
      Object.assign(v.sources[0], {observedAt: v.observedAt, fetchedAt: v.fetchedAt});
    } else if (v.id.startsWith('stock-price:')) {
      v.observedAt = `${prevDate}T15:30:00+09:00`;
      v.fetchedAt = `${date}T08:01:05+09:00`;
      for (const s of v.sources) Object.assign(s, {observedAt: v.observedAt, fetchedAt: v.fetchedAt});
    }
  }
  Object.assign(b.inputs.constants, {version: `c-${ymd(prevDate)}-16`, sha256: hex(`const-${prevDate}`), measuredAt: `${prevDate}T16:40:00+09:00`});
  const q = {p10: -0.016, p25: -0.0084, p50: 0, p75: 0.0087, p90: 0.0162};
  b.kospi.anchor = {value: level, asOf: `${prevDate}T15:30:00+09:00`};
  b.kospi.center = level;
  b.kospi.quantiles = Object.fromEntries(Object.entries(q).map(([k, f]) => [k, r2(level * (1 + f))]));
  const Q = b.kospi.quantiles;
  b.kospi.scenarios[0].kospi = {low: Q.p75, high: Q.p90};
  b.kospi.scenarios[1].kospi = {low: Q.p25, high: Q.p75};
  b.kospi.scenarios[2].kospi = {low: Q.p10, high: Q.p25};
  b.twoPath = [{what: '코스피 가운데 값', pathA: level, pathB: level, tolerance: 0.5, agree: true}];
  b.events[0].at = `${date}T21:30:00+09:00`;
  b.screen.value = level;
  return b;
}

function scoreFor(b, date, covered, crisis) {
  const Q = b.kospi.quantiles;
  const actual = covered ? r2(Q.p50 + (Q.p75 - Q.p50) * 0.3) : r2(Q.p90 + 12.3);
  const width = r2(Q.p90 - Q.p10);
  const is = covered ? width : r2(width + (2 / 0.2) * (actual - Q.p90));
  const up = actual / b.kospi.anchor.value - 1 > 0.001 ? 1 : 0;
  return {boardId: b.id, target: date, scoredAt: `${date}T15:41:00+09:00`,
    actual: {value: actual, asOf: `${date}T15:30:00+09:00`, source: '네이버 증권 지수 일별'},
    crps: r2(width * 0.15), interval: {alpha: 0.2, score: is, covered},
    brier: {event: 'up', p: 0.41, o: up, score: Math.round((0.41 - up) ** 2 * 1e4) / 1e4},
    baselines: [{id: '무판', crps: r2(width * 0.16), interval: r2(width * 1.05), brier: 0.36}, {id: '단순 전이식', crps: r2(width * 0.155), interval: r2(width * 1.02)}, {id: 'ATLAS 11', crps: null, interval: null, note: '없음'}],
    crisis};
}

function retroRows() {
  return weekdays('2026-07-01', 40).map((d, i) => {
    const mine = r2(60 + 8 * Math.sin(i * 0.7));
    return {boardId: `r4h-${ymd(d)}-08-${hex('retro-' + d).slice(0, 8)}`, target: d, interval: {alpha: 0.2, score: mine},
      baselines: [{id: '무판', interval: r2(mine + 9 + 2 * Math.cos(i))}, {id: '단순 전이식', interval: r2(mine + 7 + 2 * Math.sin(2 * i))}, {id: 'ATLAS 11', interval: r2(mine + 6 + 1.5 * Math.cos(3 * i))}]};
  });
}

const BASE_CHANGES = [
  {commit: 'ef8aaaf', subject: 'atlas4h 1단계: data collector and atlas4h-collect workflow', status: 'A', path: 'atlas4h/collect/collect.mjs', deletedLines: 0, appendOnly: null},
  {commit: 'ef8aaaf', subject: 'atlas4h 1단계: data collector and atlas4h-collect workflow', status: 'A', path: '.github/workflows/atlas4h-collect.yml', deletedLines: 0, appendOnly: null},
  {commit: 'b8074cc', subject: 'atlas4h 2단계: engine 0판', status: 'A', path: 'atlas4h/engine/board.mjs', deletedLines: 0, appendOnly: null},
  {commit: 'b8074cc', subject: 'atlas4h 2단계: engine 0판', status: 'A', path: 'atlas4h/score/score.mjs', deletedLines: 0, appendOnly: null},
];
const JUDGMENT_COMMIT_AT = '2026-10-01T18:22:00+09:00';

function buildBaseA() {
  const F = loadFixture();
  const tpl = F['atlas4h/ledger/boards/2026-10-02.jsonl'][0];
  const days = weekdays('2026-10-05', 37, ['2026-10-09']);
  let prev = '2026-10-02';
  let level = 2671;
  GEN.length = 0;
  days.forEach((d, i) => {
    level = r2(level * (1 + 0.004 * Math.sin(i * 1.3)));
    const b = makeLive(tpl, d, prev, level);
    const crisis = i >= 32;
    const miss = crisis ? CRISIS_MISS.includes(i) : NORMAL_MISS.includes(i);
    const loopId = `loop-${ymd(d)}-08`;
    F[`atlas4h/ledger/boards/${d}.jsonl`] = [b];
    F[`atlas4h/ledger/seals/${d}.jsonl`] = [{boardId: b.id, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '70ff430'}];
    F[`atlas4h/ledger/scores/${d}.jsonl`] = [scoreFor(b, d, !miss, crisis)];
    F[`atlas4h/ledger/loops/${d}.jsonl`] = [{loopId, slot: '08', startedAt: `${d}T08:00:00+09:00`, endedAt: `${d}T08:31:36+09:00`, minutes: 31.6, status: 'ok', boardId: b.id}];
    F[`atlas4h/ledger/watch/${d}.jsonl`] = [{loopId, at: `${d}T08:45:00+09:00`, by: '감시자', S: {S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0, S8: 0}, S9: {caught: 0, improved: null}, S10: {kept: 13, of: 13}}];
    GEN.push({date: d, id: b.id, crisis, miss, loopId});
    prev = d;
  });
  F['atlas4h/retro/result.json'] = {schema: 'atlas4h-retro-1', rows: retroRows()};
  return {F, O: {changes: clone(BASE_CHANGES), judgmentCommitAt: JUDGMENT_COMMIT_AT}};
}

// ───────────────────────── 바탕 B (T4) ─────────────────────────
function seriesRows(start, n, to, phase) {
  const dates = weekdaysBack(to, n + 1);
  const closes = [start];
  for (let i = 1; i <= n; i++) closes.push(Math.round(closes[i - 1] * (1 + 0.012 * Math.sin(i * 0.9 + phase) + 0.004 * Math.cos(i * 2.3 + phase))));
  return dates.map((d, i) => ({date: d, close: closes[i]}));
}
function engVariable(id, rows, date, fetchedAt) {
  const last = rows.at(-1);
  const prev = rows.at(-2);
  const history = [];
  for (let i = 1; i < rows.length; i++) history.push({date: rows[i].date, changePct: (rows[i].close / rows[i - 1].close - 1) * 100});
  const obs = `${last.date}T15:30:00+09:00`;
  return {id, market: 'KR', value: last.close, prevClose: prev.close, observedAt: obs, fetchedAt, status: 'ok', marks: ['옛값', '장 닫힘'],
    sources: [
      {name: '네이버 증권', url: `https://m.stock.naver.com/api/${id}`, value: last.close, observedAt: obs, fetchedAt, rawSha256: hex('n' + id + date)},
      {name: 'KRX Open API', url: `https://data-dbg.krx.co.kr/svc/apis/${id}`, value: last.close, observedAt: obs, fetchedAt, rawSha256: hex('k' + id + date)}],
    history};
}
function buildBaseB() {
  const F = {};
  [['2026-09-29', '2026-09-28', 0.3], ['2026-09-30', '2026-09-29', 0.8], ['2026-10-01', '2026-09-30', 1.4]].forEach(([date, prevDate, ph]) => {
    const fetchedAt = `${date}T08:00:30+09:00`;
    const inputs = {
      variables: [
        engVariable('kospi', seriesRows(2400 + 37 * ph, 130, prevDate, ph), date, fetchedAt),
        engVariable('stock-price:005930', seriesRows(60000, 130, prevDate, ph + 1.1), date, fetchedAt),
        engVariable('stock-price:000660', seriesRows(180000, 130, prevDate, ph + 2.0), date, fetchedAt),
      ],
      constants: {version: `c-${ymd(prevDate)}-har0`, sha256: hex('c' + prevDate), measuredAt: `${prevDate}T16:40:00+09:00`},
    };
    const b = buildBoard({inputs, seed: Number(`${ymd(date)}08`), slot: '08', kind: '무거운', createdAt: `${date}T08:00:05+09:00`, sealedAt: `${date}T08:20:00+09:00`, target: date, commit: '62d695a', dirty: false, files: [`atlas4h/ledger/inputs/${date}T08.json`]});
    F[`atlas4h/ledger/boards/${date}.jsonl`] = [b];
    F[`atlas4h/ledger/seals/${date}.jsonl`] = [{boardId: b.id, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '62d695a'}];
  });
  return {F, O: {engine: realEngine}};
}

// ───────────────────────── 고치는 손 ─────────────────────────
const isBoardFile = k => k.startsWith('atlas4h/ledger/boards/');
const isSealFile = k => k.startsWith('atlas4h/ledger/seals/');
function findBoard(F, id) {
  for (const k of Object.keys(F).filter(isBoardFile)) {
    const b = F[k].find(x => x.id === id);
    if (b) return b;
  }
  throw new Error(`판 없음 ${id}`);
}
function boardsOf(F) { return Object.keys(F).filter(isBoardFile).flatMap(k => F[k]); }
function reseal(F, id) {
  const b = findBoard(F, id);
  let n = 0;
  for (const k of Object.keys(F).filter(isSealFile)) for (const s of F[k]) if (s.boardId === id) { s.sha256 = boardSha256(b); s.sealedAt = b.sealedAt; n++; }
  if (n !== 1) throw new Error(`봉인 줄 ${n}개 ${id}`);
}
/** 판을 고치고 봉인도 새로 맞춘다(봉인된 채 흠이 있는 판) */
function edit(F, id, fn) { fn(findBoard(F, id)); reseal(F, id); }
const V = (b, id) => b.inputs.variables.find(v => v.id === id);
const E = (b, id) => b.engines.find(e => e.id === id);
const SC = (b, name) => b.kospi.scenarios.find(s => s.name === name);
function scoreRow(F, boardId) {
  for (const k of Object.keys(F).filter(k => k.startsWith('atlas4h/ledger/scores/'))) {
    const s = F[k].find(x => x.boardId === boardId);
    if (s) return s;
  }
  throw new Error(`채점 없음 ${boardId}`);
}
function rowBy(F, dir, loopId) {
  for (const k of Object.keys(F).filter(k => k.startsWith(`atlas4h/ledger/${dir}/`))) {
    const r = F[k].find(x => x.loopId === loopId);
    if (r) return r;
  }
  throw new Error(`${dir} 없음 ${loopId}`);
}
function removeRow(F, dir, pred) {
  let n = 0;
  for (const k of Object.keys(F).filter(k => k.startsWith(`atlas4h/ledger/${dir}/`))) {
    const before = F[k].length;
    F[k] = F[k].filter(x => !pred(x));
    n += before - F[k].length;
  }
  if (!n) throw new Error(`지울 줄 없음 ${dir}`);
}
function setCover(F, i, covered) {
  const g = GEN[i];
  const b = findBoard(F, g.id);
  const fresh = scoreFor(b, g.date, covered, g.crisis);
  Object.assign(scoreRow(F, g.id), fresh);
}
function cloneRetro(F, date, prev, {retro = true, cutoff} = {}) {
  const src = findBoard(F, R01);
  let s = JSON.stringify(src);
  s = s.replaceAll('2026-09-01', date).replaceAll('2026-08-31', prev).replaceAll('20260901', ymd(date)).replaceAll('20260831', ymd(prev));
  const b = JSON.parse(s);
  b.id = `r4h-${ymd(date)}-08-${hex('rr' + date + retro).slice(0, 8)}`;
  if (!retro) delete b.retro;
  if (cutoff) b.llm.trainingCutoff = cutoff;
  F['atlas4h/ledger/boards/2026-10-01.jsonl'].push(b);
  F['atlas4h/ledger/seals/2026-10-01.jsonl'].push({boardId: b.id, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '70ff430'});
  return b;
}
const CH = (status, p, extra = {}) => ({commit: 'c0ffee1', subject: 'atlas4h 3단계: 고리 일꾼 첫 바퀴', status, path: p, deletedLines: 0, appendOnly: null, ...extra});
const rows = F => F['atlas4h/retro/result.json'].rows;
const bl = (row, id) => row.baselines.find(x => x.id === id);

// T4 엔진 흠 — 0판 엔진을 감싼 것
function shift(out, d) {
  for (const blk of [out.kospi, ...(out.stocks || [])]) {
    if (!blk) continue;
    if (typeof blk.center === 'number') blk.center += d * (blk === out.kospi ? 1 : 10);
    if (blk.quantiles) for (const k of Object.keys(blk.quantiles)) if (typeof blk.quantiles[k] === 'number') blk.quantiles[k] += d * (blk === out.kospi ? 1 : 10);
  }
  return out;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 바탕 B 판을 흠 있는 엔진으로 다시 짓는다(봉인도 다시) — buildSeed 로 지은 값을 판에 싣는다 */
function rebuildWith(F, eng, {seedShift = 0, copyInputs = false} = {}) {
  for (const b of boardsOf(F)) {
    const out = eng(copyInputs ? clone(b.inputs) : b.inputs, b.seed + seedShift);
    b.kospi = out.kospi;
    b.stocks = out.stocks;
    reseal(F, b.id);
  }
}

// ───────────────────────── 사양 글 (파일, 그대로 옮긴 한 줄) ─────────────────────────
const S10 = 'atlas4h/command/10-spec.txt';
const BM = 'atlas4h/spec/board.md';
const CT = 'atlas4h/data/contract.md';
const CMD = 'atlas4h/command/13-command.txt';
const ENG = 'atlas4h/command/08-engine.txt';
const SCO = 'atlas4h/command/09-scoring-evolution.txt';
const JG = 'atlas4h/seal/judgment.json';
const Q = {
  T1: [S10, 'T1 봉인 뒤 수정 0 (기록 대조)'],
  T2: [S10, 'T2 봉인 시각 뒤 자료 사용 0 (시각 대조)'],
  T3: [S10, 'T3 봉인에 코드 판·자료 판·씨앗이 다 있음 (목록)'],
  T4: [S10, 'T4 같은 입력이면 같은 출력 (재실행)'],
  T5: [S10, 'T5 세 시나리오 확률 합 100% (계산)'],
  T6: [S10, 'T6 종목·코스피가 MinT로 맞춰짐 (계산)'],
  T7: [S10, 'T7 변수마다 시각·출처 둘 (목록)'],
  T8: [S10, "T8 두 길 계산 일치, 아니면 '확인 중' (대조)"],
  T9: [S10, 'T9 고리 40분 안 (시각)'],
  T10: [S10, 'T10 금지 말 0 (검색)'],
  T11: [S10, 'T11 옛 엔진·채점·기록 변경 0 (목록)'],
  T12: [S10, 'T12 재현에서 폭이 기준 셋 모두를 이김 (점수)'],
  T13: [S10, 'T13 80% 덮음 70~90%(30판↑)·위기 따로'],
  T14: [S10, 'T14 화면 숫자 = 봉인 값 (대조)'],
  T16: [S10, 'T16 무판을 못 이긴 가운데 후보의 무게 0 (점수)'],
  T17: [S10, 'T17 검색 결과에 봉인 뒤 정보 0 (누수 검사)'],
  T18: [S10, 'T18 LLM 판 재현은 학습 마감 뒤만 (시각)'],
  T19: [S10, 'T19 판정 기준이 첫 채점 전에 봉인됨 (시각)'],
  T20: [S10, 'T20 시도가 장부에 다 있고 SPA를 거침 (목록)'],
  T21: [S10, 'T21 엔진들이 앞 판 값을 안 봄 (기록)'],
  T22: [S10, 'T22 답마다 쓴 구조 번호가 있음 (목록)'],
  T23: [S10, 'T23 감시 S1~S8이 모두 0 (감시 장부)'],
  bStatus: [BM, '`status`: 「봉인」 · 「시간 초과 → 앞 판 유지」 · 「변수 그대로 → 앞 판 다시 봉인」 중 하나.'],
  bVars: [BM, '`inputs.variables[]`: 값마다 `observedAt`·`fetchedAt`·출처 둘(`sources` 2개). 출처가 하나면 `status` 「한 출처」, 4시간이 넘었으면 「옛값」, 두 출처가 어긋나면 「확인 중」(계산에 안 씀), 값이 없으면 「없음」(`value: null`). 0으로 채우지 않는다.'],
  bTime: [BM, '`observedAt`·`fetchedAt`(출처 것 포함)은 모두 `sealedAt` 이하. 봉인 뒤 자료는 없다(T2).'],
  bScen: [BM, '`kospi.scenarios`: 「위」「가운데」「아래」 정확히 셋, `prob` 합 = 1(T5). 각자 `invalidator`(틀렸다는 표시) 하나.'],
  bRec: [BM, '`reconciliation`: 코스피는 52종목의 합이 아니므로 「나머지」 마디를 둔다. `maxGap` = 맞춘 뒤 위·아래 마디의 어긋남 최댓값(T6).'],
  bTwo: [BM, '`twoPath`: 같은 숫자를 두 길로 센 것. 어긋나면 `agree: false` 이고 그 숫자는 화면에 「확인 중」(T8).'],
  bEng: [BM, '`engines[]`: `sawPreviousBoard`는 모두 `false`(T21). 「가운데」 후보 중 무판을 못 이긴 것은 `weight: 0`(T16 · 근거는 `atlas4h/seal/weights.json`).'],
  bLeak: [BM, '`events[].leakCheck.postSealHits` = 0(T17).'],
  bLlm: [BM, '`llm.trainingCutoff`: 재현(지난 기록으로 돌린 판)에서는 `target.date` 가 이 날보다 뒤여야 한다(T18).'],
  bStr: [BM, '`structures`: A~F 여섯 칸에서 하나 이상씩(감시 S1·S2 · T22).'],
  bWords: [BM, '`text`·`screen.chance` 등 사람이 읽는 글에는 금지 말(사라·팔라·추천·목표가·확실·보장·무조건)이 없다(T10).'],
  bAppend: [BM, '모든 기록은 덧붙이기만 합니다(JSON 한 줄 = 기록 하나). 고치지도 지우지도 않습니다.'],
  bSeals: [BM, '봉인 기록 `{boardId, sealedAt, sha256, commit}` — `sha256` = 판을 「정렬 직렬화」한 글자의 sha256'],
  cNoEdit: [CMD, '봉인한 판은 고치지 않는다. 봉인 뒤 자료는 안 쓴다.'],
  cOld: [CMD, '옛 엔진·채점·기록은 지우지도 덮지도 않는다.'],
  cWords: [CMD, '금지 말: 사라·팔라·추천·목표가·확실·보장·무조건'],
  cLlm: [CMD, 'LLM이 낀 판은 모델이 모르는 기간으로만 채점한다.'],
  cNone: [CMD, "숫자가 없으면 짐작하지 말고 '없음'."],
  cSealFirst: [CMD, '6. 판정 기준과 시도 장부를 첫 채점 전에 봉인해라.'],
  wSep: ['atlas4h/command/02-watch.txt', '<감시 — 보는 눈은 짓는 이와 다른 에이전트>'],
  hWatch: ['atlas4h/command/03-harness.txt', '감시자: <감시>를 돈다. 짓는 일꾼과 다른 에이전트.'],
  lTimeout: ['atlas4h/command/07-loop.txt', "40분 안에 못 끝내면 앞 값 유지, '시간 초과'."],
  lReseal: ['atlas4h/command/07-loop.txt', '변수가 그대로면 계산 없이 앞 판을 다시 봉인한다.'],
  sStr: ['atlas4h/command/01-structures36.txt', "여섯 칸 중 하나라도 비면 그 답은 '미완'이다."],
  eDm: [ENG, '후보는 DM 검정으로 무판을 이길 때만 무게를 얻는다.'],
  eCrisis: [ENG, '위기 때 덮음이 모자라면 그때는 폭을 넓게 둔다.'],
  eCrisis2: [ENG, '위기 구간(흔들림 상위 10%)의 덮음은 따로 잰다.'],
  eSealedOnly: [ENG, "'맞힌 기록'은 봉인된 판만으로 센다."],
  eLeak: [ENG, '검색 결과에 봉인 뒤 정보가 섞였는지 먼저 거른다.'],
  eKeep: [ENG, '안 바꿔도 그 고리의 판은 봉인해 채점에 넣는다.'],
  eDist: [ENG, '확률은 그 분포에서 나온다(합 100%).'],
  eMinT: [ENG, '종목과 코스피는 MinT 조정으로 서로 맞춘다.'],
  eScreen: [ENG, '화면엔 지금 값·몇 시 판·가능성·바뀐 까닭 한 줄'],
  sDm: [SCO, '이겼는지는 DM 검정으로(겹친 창·자기상관 보정).'],
  sSlot: [SCO, '견줄 땐 같은 시각 판끼리만 견준다.'],
  sBase: [SCO, '기준 셋: 무판·단순 전이식·ATLAS 11'],
  sSpa: [SCO, '시도는 다 적고, SPA 검정으로 우연을 거른다.'],
  jMin: [JG, '같은 시각 판 30개 미만이면 「아직 모름」(표본 정직 F4)'],
  jWin: [JG, '실력 > 0 그리고 DM 유의'],
  jAlpha: [JG, '"alpha": 0.2'],
  jSpa: [JG, 'SPA(Hansen 2005) p < 0.05 일 때만 「기준을 이겼다」'],
  jTrials: [JG, '모든 시도를 결과 보기 전에 atlas4h/seal/trials.jsonl 에 적는다(T20)'],
  jLlm: [JG, 'LLM이 낀 판의 재현은 모델 학습 마감(이 모델 2026-06-30) 뒤 목표일만 채점(T18)'],
  jFirst: [JG, '첫 채점 전에 봉인한다. 고치지 않는다.'],
  jCrisis: [JG, '덮음을 따로 잰다 · 모자라면 그 구간 폭을 넓게 둔다'],
  j2: ['atlas4h/seal/judgment-2.json', '12시 판 행은 단순 전이식이 「없음」이므로 T12 재현 표에 넣지 않는다(그 사실을 재현 결과에 적는다)'],
  k1: [CT, '1. 변수마다 출처를 둘 적는다 — 첫째는 값, 둘째는 맞는지 보는 데 쓴다. (T7)'],
  k2: [CT, '2. 같은 회사의 다른 주소는 출처 하나로 센다 — 둘째는 다른 회사·기관이어야 한다. (T7)'],
  k3: [CT, '3. 값은 늘 첫째 출처 것을 쓴다 — 둘 중 마음에 드는 쪽을 고르지 않는다. (T8)'],
  k7: [CT, '7. 열쇠(API 키)는 GitHub 저장소 비밀에만 두고 파일·기록·화면에 쓰지 않는다. (T3)'],
  k8: [CT, '8. 값마다 시각 둘을 붙인다 — `observedAt`(값이 생긴 때) · `fetchedAt`(받은 때). (T7 · T2)'],
  k10: [CT, '10. 날짜만 있는 값은 그날 가장 늦은 때로 본다 — 시장 값은 그 시장 마감, 공시는 23:59:59. (T2 · T17)'],
  k11: [CT, '11. 봉인 시각보다 늦은 `observedAt` 이나 `fetchedAt` 을 가진 값은 쓰지 않는다. (T2 · 절대)'],
  k12: [CT, '12. 뉴스·공시·검색 결과는 게시 시각이 봉인 시각 전인 것만 쓰고, 게시 시각이 없으면 안 쓴다. (T17)'],
  k13: [CT, '13. `observedAt` 이 봉인 시각보다 4시간 넘게 앞서면 「옛값」을 붙인다. (T7)'],
  k15: [CT, '15. 두 출처는 같은 기준끼리만 비교한다 — 같은 날짜 종가끼리, 또는 `observedAt` 이 5분 안인 값끼리. (T8)'],
  k16: [CT, '16. 차이가 허용 폭(`variables.json` 의 `compare`)을 넘으면 「확인 중」으로 두고 그 고리에서 쓰지 않는다. (T8)'],
  k19: [CT, '19. 늦은 비교에서 다르면 봉인된 판은 고치지 않고 「늦은 확인: 다름」 기록만 덧붙인다. (T1 · 절대)'],
  k21: [CT, '21. 결측을 0 으로 채우지 않는다 — 앞 값으로 채우지도 않고, 앞 값은 「옛값」을 달 때만 쓴다. (절대)'],
  k23: [CT, '23. 받은 바이트 그대로 보관하고, 그 sha256 을 값 옆에 적는다. (T3)'],
  k24: [CT, '24. 같은 원문을 다시 해석하면 같은 값이 나와야 한다. (T4)'],
  cf14: ['atlas4h/harness/conflicts.md', '금지 말은 사람에게 보이는 엔진 출력(판의 글·화면)에 적용한다(T10이 잼).'],
};
const quote = (...keys) => keys.map(k => { const [file, text] = Q[k]; return {file, text}; });

// ───────────────────────── 흠 목록 ─────────────────────────
const DEFECTS = [];
const PROBES = [];
function D(id, target, what, qkeys, contested, contestedWhy, apply, base = 'A') {
  DEFECTS.push({id, target, base, what, specQuote: quote(...qkeys), contested, contestedWhy: contested ? contestedWhy : null, apply});
}
function P(id, what, qkeys, contested, contestedWhy, apply, base = 'A', near = null) {
  PROBES.push({id, near, base, what, specQuote: quote(...qkeys), contested, contestedWhy: contested ? contestedWhy : null, apply});
}

// T1 봉인 뒤 수정
D('D-T1-01', 'T1', '08시 판 가운데 값을 봉인 뒤 2649.86 → 2651 로 고침(봉인 지문은 그대로)', ['T1', 'cNoEdit'], false, '', F => { findBoard(F, B08).kospi.center = 2651; });
D('D-T1-02', 'T1', '12시 판을 글만 바꿔 같은 id 로 한 줄 더 덧붙이고 새 봉인 줄도 덧붙임(다시 봉인)', ['T1', 'cNoEdit'], false, '', F => {
  const b = clone(findBoard(F, B12));
  b.text = ['가운데 값을 다시 셌습니다.'];
  F['atlas4h/ledger/boards/2026-10-02.jsonl'].push(b);
  F['atlas4h/ledger/seals/2026-10-02.jsonl'].push({boardId: b.id, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '70ff430'});
});
D('D-T1-03', 'T1', '08시 판의 봉인 줄을 지움(판은 남음)', ['T1', 'bSeals'], false, '', F => { removeRow(F, 'seals', s => s.boardId === B08); });
D('D-T1-04', 'T1', '08시 판 봉인 줄의 sha256 을 12시 판 지문으로 바꿔 씀', ['T1', 'bSeals'], false, '', F => {
  const sha12 = boardSha256(findBoard(F, B12));
  F['atlas4h/ledger/seals/2026-10-02.jsonl'].find(s => s.boardId === B08).sha256 = sha12;
});
D('D-T1-05', 'T1', '봉인된 16시 판 줄을 판 장부에서 지움(봉인 줄은 남음)', ['T1', 'bAppend'], false, '', F => {
  F['atlas4h/ledger/boards/2026-10-02.jsonl'] = F['atlas4h/ledger/boards/2026-10-02.jsonl'].filter(b => b.id !== B16);
});
D('D-T1-06', 'T1', '늦은 비교 뒤 08시 판 코스피 변수에 「늦은 확인: 다름」을 판 안에 써넣고 새 봉인 줄을 덧붙임(옛 봉인 줄 남음)', ['k19', 'T1'], false, '', F => {
  const b = findBoard(F, B08);
  V(b, 'kospi').marks.push('늦은 확인: 다름');
  F['atlas4h/ledger/seals/2026-10-02.jsonl'].push({boardId: B08, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '70ff430'});
});
D('D-T1-07', 'T1', '08시 판 sealedAt 을 08:35 로 고치고 지문만 새로 맞춤(봉인 줄의 sealedAt 은 08:31:40 그대로)', ['T1', 'bSeals'], true, '판 지문은 맞고 시각 칸만 봉인 기록과 어긋남 — 「봉인 뒤 수정」을 지문 대조로만 읽으면 안 잡혀도 된다고 볼 수 있음', F => {
  const b = findBoard(F, B08);
  b.sealedAt = '2026-10-02T08:35:00+09:00';
  b.dataCutoff = b.sealedAt;
  F['atlas4h/ledger/seals/2026-10-02.jsonl'].find(s => s.boardId === B08).sha256 = boardSha256(b);
});

// T2 봉인 뒤 자료
const lateVar = (b, id, field, t) => { const v = V(b, id); v[field] = t; for (const s of v.sources) s[field] = t; };
D('D-T2-01', 'T2', '08시 판 반도체지수 observedAt 을 봉인(08:31:40) 뒤 08:40 으로', ['bTime', 'k11'], false, '', F => edit(F, B08, b => lateVar(b, 'sox', 'observedAt', '2026-10-02T08:40:00+09:00')));
D('D-T2-02', 'T2', '08시 판 코스피 변수 fetchedAt 을 08:35 로(출처 것은 그대로)', ['bTime', 'k11'], false, '', F => edit(F, B08, b => { V(b, 'kospi').fetchedAt = '2026-10-02T08:35:00+09:00'; }));
D('D-T2-03', 'T2', '08시 판 코스피 둘째 출처(KRX) fetchedAt 만 08:45 로', ['bTime'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources[1].fetchedAt = '2026-10-02T08:45:00+09:00'; }));
D('D-T2-04', 'T2', '08시 판 반도체지수 observedAt 을 UTC 표기 2026-10-02T00:10:00Z(= 09:10 KST, 봉인 뒤)로', ['bTime', 'k11'], false, '', F => edit(F, B08, b => lateVar(b, 'sox', 'observedAt', '2026-10-02T00:10:00Z')));
D('D-T2-05', 'T2', '08시 판 코스피 첫째 출처 observedAt 을 날짜만 「2026-10-02」로(그날 15:30 마감으로 봄 → 봉인 뒤)', ['k10', 'bTime'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources[0].observedAt = '2026-10-02'; }));
D('D-T2-06', 'T2', '08시 판 상수 measuredAt 을 그날 16:40(봉인 뒤)으로', ['T2', 'cNoEdit'], false, '', F => edit(F, B08, b => { b.inputs.constants.measuredAt = '2026-10-02T16:40:00+09:00'; }));
D('D-T2-07', 'T2', '08시 판 코스피 출발값 asOf 를 그날 15:30(봉인 뒤 종가)으로', ['T2', 'cNoEdit'], false, '', F => edit(F, B08, b => { b.kospi.anchor.asOf = '2026-10-02T15:30:00+09:00'; }));
D('D-T2-08', 'T2', '재현 판(자료 마감 9/1 08:30) 반도체지수 observedAt 을 9/1 09:10 으로 — 봉인(10/1)보다는 앞이지만 자료 마감 뒤', ['T2', 'bTime'], true, '사양 글은 「봉인 시각」만 말함. 재현 판에서 자료 마감(dataCutoff)을 봉인 시각으로 읽어야 하는지는 읽는 사람마다 갈림', F => edit(F, R01, b => lateVar(b, 'sox', 'observedAt', '2026-09-01T09:10:00+09:00')));
D('D-T2-09', 'T2', '12시 판 dataCutoff 를 봉인(12:12:30) 뒤 12:30 으로', ['T2'], true, '봉인 뒤 시각을 가진 값 자체는 없음 — 마감 칸만 늦음', F => edit(F, B12, b => { b.dataCutoff = '2026-10-02T12:30:00+09:00'; }));

// T3 코드 판·자료 판·씨앗
D('D-T3-01', 'T3', '08시 판 seed 칸을 지움', ['T3'], false, '', F => edit(F, B08, b => { delete b.seed; }));
D('D-T3-02', 'T3', '12시 판 seed 를 null 로', ['T3'], false, '', F => edit(F, B12, b => { b.seed = null; }));
D('D-T3-03', 'T3', '08시 판 code.commit 을 지움', ['T3'], false, '', F => edit(F, B08, b => { delete b.code.commit; }));
D('D-T3-04', 'T3', '08시 판 code.dirty = true(커밋 안 된 코드로 봉인)', ['T3'], true, '커밋 해시는 있음 — 「코드 판이 있음」을 해시만 있으면 된다고 읽을 수 있음', F => edit(F, B08, b => { b.code.dirty = true; }));
D('D-T3-05', 'T3', '12시 판 dataVersion.files 를 빈 목록으로', ['T3'], false, '', F => edit(F, B12, b => { b.dataVersion.files = []; }));
D('D-T3-06', 'T3', '08시 판 dataVersion.sha256 을 지움', ['T3'], false, '', F => edit(F, B08, b => { delete b.dataVersion.sha256; }));
D('D-T3-07', 'T3', '08시 판 KRX 출처 주소에 열쇠(AUTH_KEY=…)를 그대로 적음', ['k7'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources[1].url += '&AUTH_KEY=4f1c9e2b7d6a4c0e9b8f1a2d3c4e5f60'; }));
D('D-T3-08', 'T3', '08시 판 반도체지수 출처의 rawSha256(원문 지문)을 지움', ['k23'], false, '', F => edit(F, B08, b => { delete V(b, 'sox').sources[0].rawSha256; }));
D('D-T3-09', 'T3', '16시 판 code 칸 통째로 지움', ['T3'], false, '', F => edit(F, B16, b => { delete b.code; }));

// T4 같은 입력 → 같은 출력 (바탕 B · 엔진)
D('D-T4-01', 'T4', '엔진이 Math.random 으로 가운데·분위수를 ±0.5 흔듦(판도 그 엔진으로 지음)', ['T4', 'k24'], false, '', (F, O) => {
  const eng = (inp, seed) => shift(realEngine(inp, seed), Math.random() - 0.5);
  rebuildWith(F, eng); O.engine = eng;
}, 'B');
D('D-T4-02', 'T4', '엔진이 1e-9 비율의 아주 작은 난수 흔들림을 넣음', ['T4'], true, '부동소수 허용 폭 안의 차이 — 비교에 작은 허용 폭을 두는 것도 옳은 읽기', (F, O) => {
  const eng = (inp, seed) => { const o = realEngine(inp, seed); return shift(o, (o.kospi?.center ?? 1) * 1e-9 * (Math.random() - 0.5)); };
  rebuildWith(F, eng); O.engine = eng;
}, 'B');
D('D-T4-03', 'T4', '엔진이 부른 횟수의 홀짝에 따라 가운데 값을 0.01 바꿈(상태가 남는 엔진)', ['T4'], false, '', (F, O) => {
  let n = 0;
  const eng = (inp, seed) => { n++; return shift(realEngine(inp, seed), (n % 2) * 0.01); };
  rebuildWith(F, eng); O.engine = eng;
}, 'B');
D('D-T4-04', 'T4', '씨앗으로 흔드는 엔진 — 판은 씨앗+1 로 지었는데 판에는 원래 씨앗을 적음', ['T4', 'T3'], false, '', (F, O) => {
  const eng = (inp, seed) => shift(realEngine(inp, seed), (mulberry32(seed)() - 0.5) * 2);
  rebuildWith(F, eng, {seedShift: 1}); O.engine = eng;
}, 'B');
D('D-T4-05', 'T4', '엔진이 같은 입력을 두 번째 받으면 멈춤(던짐)', ['T4'], false, '', (F, O) => {
  const seen = new Set();
  const eng = (inp, seed) => { const key = JSON.stringify((inp?.variables || []).map(v => [v.id, v.value, v.observedAt])); if (seen.has(key)) throw new Error('다시 돌리면 멈춤'); seen.add(key); return realEngine(inp, seed); };
  rebuildWith(F, eng); O.engine = eng;
}, 'B');
D('D-T4-06', 'T4', '봉인된 판의 종목 가운데 값을 +1 고쳐 다시 봉인(같은 입력의 엔진 출력과 다름)', ['T4'], false, '', F => {
  const b = boardsOf(F)[1];
  b.stocks[0].center += 1;
  reseal(F, b.id);
}, 'B');
D('D-T4-07', 'T4', '판을 지은 뒤 입력(코스피 마지막 등락)을 +0.5%p 고쳐 다시 봉인(출력은 옛 입력의 것)', ['T4'], false, '', F => {
  const b = boardsOf(F)[2];
  V(b, 'kospi').history.at(-1).changePct += 0.5;
  reseal(F, b.id);
}, 'B');
D('D-T4-08', 'T4', '엔진이 받은 입력에 지난 등락 한 줄을 덧붙이고 계산함(입력을 고치는 엔진 — 같은 객체로 두 번 돌리면 달라짐)', ['T4'], true, '시험이 입력을 복사해 넘기면 한 번 다시 돌린 값은 같음 — 입력을 고치는 것 자체를 T4 흠으로 볼지 갈림', (F, O) => {
  const eng = (inp, seed) => { const kv = inp?.variables?.find(v => v.id === 'kospi'); if (kv?.history) kv.history.push({date: '2099-01-01', changePct: 3}); return realEngine(inp, seed); };
  rebuildWith(F, eng, {copyInputs: true}); O.engine = eng;
}, 'B');

// T5 세 시나리오
const probs = (b, a) => { b.kospi.scenarios.forEach((s, i) => { s.prob = a[i]; }); };
D('D-T5-01', 'T5', '08시 판 확률 0.25·0.5·0.2(합 95%)', ['T5', 'bScen'], false, '', F => edit(F, B08, b => probs(b, [0.25, 0.5, 0.2])));
D('D-T5-02', 'T5', '12시 판 확률 0.3·0.5·0.25(합 105%)', ['T5', 'bScen'], false, '', F => edit(F, B12, b => probs(b, [0.3, 0.5, 0.25])));
D('D-T5-03', 'T5', '08시 판 시나리오 둘(가운데 지움, 위·아래 0.5·0.5 — 합은 100%)', ['bScen'], false, '', F => edit(F, B08, b => { b.kospi.scenarios = b.kospi.scenarios.filter(s => s.name !== '가운데'); probs(b, [0.5, 0.5]); }));
D('D-T5-04', 'T5', '08시 판에 넷째 시나리오 「꼬리」(확률 0) 더함', ['bScen'], false, '', F => edit(F, B08, b => { b.kospi.scenarios.push({name: '꼬리', premise: '셋 밖', kospi: {low: 2500, high: 2606.69}, prob: 0, invalidator: '없음'}); }));
D('D-T5-05', 'T5', '08시 판 시나리오 이름 「위」를 「상승」으로', ['bScen'], false, '', F => edit(F, B08, b => { SC(b, '위').name = '상승'; }));
D('D-T5-06', 'T5', '12시 판 「가운데」의 invalidator 를 지움', ['bScen'], false, '', F => edit(F, B12, b => { delete SC(b, '가운데').invalidator; }));
D('D-T5-07', 'T5', '08시 판 확률을 백분율 25·50·25 로 적음', ['bScen'], true, 'T5 줄 글자는 「합 100%」 — 백분율 표기를 같은 뜻으로 읽을 수도 있음', F => edit(F, B08, b => probs(b, [25, 50, 25])));
D('D-T5-08', 'T5', '08시 판 확률 0.6·0.6·−0.2(합은 1, 음수 확률)', ['bScen', 'eDist'], true, '사양은 합만 말함 — 음수 확률까지 T5 가 볼지 갈림', F => edit(F, B08, b => probs(b, [0.6, 0.6, -0.2])));
D('D-T5-09', 'T5', '뒤 판(10/9 다음 날 등) 하나의 확률 0.25·0.45·0.25(합 95%)', ['T5'], false, '', F => edit(F, GEN[4].id, b => probs(b, [0.25, 0.45, 0.25])));

// T6 MinT
D('D-T6-01', 'T6', '08시 판 맞추는 법 「OLS」', ['T6', 'eMinT'], false, '', F => edit(F, B08, b => { b.reconciliation.method = 'OLS'; }));
D('D-T6-02', 'T6', '08시 판 마디에서 「나머지」를 뺌', ['bRec'], false, '', F => edit(F, B08, b => { b.reconciliation.nodes = b.reconciliation.nodes.filter(n => n !== '나머지'); }));
D('D-T6-03', 'T6', '12시 판 마디에서 종목 000660 을 뺌(판에는 그 종목 예측 있음)', ['T6'], false, '', F => edit(F, B12, b => { b.reconciliation.nodes = b.reconciliation.nodes.filter(n => n !== '000660'); }));
D('D-T6-04', 'T6', '08시 판 maxGap 3.5(맞춘 뒤에도 위·아래가 어긋남)', ['bRec'], false, '', F => edit(F, B08, b => { b.reconciliation.maxGap = 3.5; }));
D('D-T6-05', 'T6', '16시 판 reconciliation 칸 통째로 지움', ['T6'], false, '', F => edit(F, B16, b => { delete b.reconciliation; }));
D('D-T6-06', 'T6', '08시 판 마디에서 「kospi」를 뺌', ['T6', 'bRec'], false, '', F => edit(F, B08, b => { b.reconciliation.nodes = b.reconciliation.nodes.filter(n => n !== 'kospi'); }));
D('D-T6-07', 'T6', '08시 판 maxGap = null(맞춘 결과를 안 적음)', ['bRec'], true, 'null 을 「셀 수 없음」으로 둘지 흠으로 볼지 갈림', F => edit(F, B08, b => { b.reconciliation.maxGap = null; }));

// T7 시각·출처 둘
D('D-T7-01', 'T7', '08시 판 코스피(「ok」) 둘째 출처를 지움 — 표시는 ok 그대로', ['T7', 'bVars', 'k1'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources.pop(); }));
D('D-T7-02', 'T7', '08시 판 코스피 둘째 출처를 KRX 대신 네이버의 다른 주소로(같은 회사)', ['k2'], false, '', F => edit(F, B08, b => { Object.assign(V(b, 'kospi').sources[1], {name: '네이버 증권 지수 (PC)', url: 'https://finance.naver.com/sise/sise_index_day.naver?code=KOSPI'}); }));
D('D-T7-03', 'T7', '08시 판 005930(「ok」) 변수 observedAt 을 지움', ['T7', 'k8'], false, '', F => edit(F, B08, b => { delete V(b, 'stock-price:005930').observedAt; }));
D('D-T7-04', 'T7', '08시 판 000660(「ok」) 변수 fetchedAt 을 지움', ['T7', 'k8'], false, '', F => edit(F, B08, b => { delete V(b, 'stock-price:000660').fetchedAt; }));
D('D-T7-05', 'T7', '08시 판 코스피(17시간 전 값)의 「옛값」 표시를 지움', ['k13', 'bVars'], false, '', F => edit(F, B08, b => { V(b, 'kospi').marks = ['장 닫힘']; }));
D('D-T7-06', 'T7', '12시 판 반도체지수 「한 출처」인데 출처 목록이 비었음(값은 있음)', ['T7', 'bVars'], false, '', F => edit(F, B12, b => { V(b, 'sox').sources = []; }));
D('D-T7-07', 'T7', '08시 판 VKOSPI(「없음」) 값을 null 대신 0 으로', ['bVars', 'k21'], true, '0 채움 금지는 다른 칸(절대 규칙) — T7 이 볼 일인지 갈림', F => edit(F, B08, b => { V(b, 'vkospi').value = 0; }));
D('D-T7-08', 'T7', '08시 판 코스피 「ok」인데 출처 둘 다 지움', ['T7', 'bVars'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources = []; }));
D('D-T7-09', 'T7', '뒤 판 하나(gen 2) 코스피 「ok」 둘째 출처 지움', ['T7'], false, '', F => edit(F, GEN[2].id, b => { V(b, 'kospi').sources.pop(); }));

// T8 두 길
D('D-T8-01', 'T8', '12시 판(두 길 어긋남) 화면 값을 「확인 중」 대신 숫자 2663.15 로', ['bTwo', 'T8'], false, '', F => edit(F, B12, b => { b.screen.value = 2663.15; }));
D('D-T8-02', 'T8', '08시 판 두 길 pathB 2653.36(차이 3.5 > 허용 0.5)인데 agree: true', ['bTwo', 'T8'], false, '', F => edit(F, B08, b => { b.twoPath[0].pathB = 2653.36; }));
D('D-T8-03', 'T8', '08시 판 코스피 두 출처 2650.1 · 2662.0(허용 폭 넘음)인데 「ok」로 씀', ['k16'], false, '', F => edit(F, B08, b => { V(b, 'kospi').sources[1].value = 2662.0; }));
D('D-T8-04', 'T8', '08시 판 코스피 값을 둘째 출처 값(2650.4)으로 씀 — 첫째는 2650.1', ['k3'], false, '', F => edit(F, B08, b => { const v = V(b, 'kospi'); v.sources[1].value = 2650.4; v.value = 2650.4; }));
D('D-T8-05', 'T8', '08시 판 코스피를 「확인 중」으로 두고도 가운데·폭 엔진 입력에 그대로 씀', ['bVars', 'k16'], true, '「계산에 안 씀」을 엔진 입력 목록으로 재야 하는지 갈림', F => edit(F, B08, b => { const v = V(b, 'kospi'); v.status = '확인 중'; v.sources[1].value = 2662.0; }));
D('D-T8-06', 'T8', '08시 판(보통 봉인) twoPath 를 빈 목록으로 — 두 길 계산이 없음', ['T8', 'bTwo'], true, '두 길이 없는 판을 흠으로 볼지(「일치」를 못 보임) 볼 것 없음으로 둘지 갈림', F => edit(F, B08, b => { b.twoPath = []; }));
D('D-T8-07', 'T8', '08시 판 코스피 둘째 출처 observedAt 을 하루 앞(9/30 종가)으로 — 다른 날 값끼리 견줌', ['k15'], true, '견줄 수 없는 짝일 때 무엇이 되어야 하는지(한 출처? 확인 중?) 사양이 정하지 않음', F => edit(F, B08, b => { V(b, 'kospi').sources[1].observedAt = '2026-09-30T15:30:00+09:00'; }));
D('D-T8-08', 'T8', '08시 판 두 길 pathB 2655.0 · agree 칸 없음 · 화면은 숫자', ['bTwo'], false, '', F => edit(F, B08, b => { b.twoPath[0].pathB = 2655.0; delete b.twoPath[0].agree; }));
D('D-T8-09', 'T8', '뒤 판 하나(gen 6) 두 길 어긋남(agree: false)인데 화면은 숫자', ['bTwo'], false, '', F => edit(F, GEN[6].id, b => { b.twoPath[0].pathB = b.twoPath[0].pathA + 3; b.twoPath[0].agree = false; }));

// T9 고리 40분
D('D-T9-01', 'T9', '08시 고리 44.5분(상태 ok, 판은 새로 봉인)', ['T9', 'lTimeout'], false, '', F => { Object.assign(rowBy(F, 'loops', 'loop-20261002-08'), {endedAt: '2026-10-02T08:44:30+09:00', minutes: 44.5}); });
D('D-T9-02', 'T9', '16시 고리는 41.2분인데 그 판 상태를 「봉인」(새 값)으로', ['lTimeout', 'bStatus'], false, '', F => edit(F, B16, b => { b.status = '봉인'; }));
D('D-T9-03', 'T9', '08시 고리 끝 시각 08:45(45분)인데 minutes 칸은 31.6 그대로', ['T9'], false, '', F => { rowBy(F, 'loops', 'loop-20261002-08').endedAt = '2026-10-02T08:45:00+09:00'; });
D('D-T9-04', 'T9', '뒤 판 하나(gen 9)의 고리 줄이 없음', ['T9'], true, '고리 기록이 없는 판을 T9 가 볼지(재현 판처럼 고리 없는 판도 있음) 갈림', F => { removeRow(F, 'loops', r => r.loopId === GEN[9].loopId); });
D('D-T9-05', 'T9', '12시 고리 endedAt·minutes 를 null 로', ['T9'], true, '끝 시각이 없으면 잴 수 없음 — 흠인지 「모름」인지 갈림', F => { Object.assign(rowBy(F, 'loops', 'loop-20261002-12'), {endedAt: null, minutes: null}); });
D('D-T9-06', 'T9', '12시 판을 시작 52분 뒤(12:52:30)에 봉인 — 고리 기록은 12.4분', ['T9'], true, '고리 줄과 판 봉인 시각이 어긋날 때 어느 쪽으로 잴지 갈림', F => edit(F, B12, b => { b.sealedAt = '2026-10-02T12:52:30+09:00'; b.dataCutoff = b.sealedAt; }));
D('D-T9-07', 'T9', '뒤 판 하나(gen 11) 고리 47분(상태 ok)', ['T9', 'lTimeout'], false, '', F => { Object.assign(rowBy(F, 'loops', GEN[11].loopId), {endedAt: `${GEN[11].date}T08:47:00+09:00`, minutes: 47}); });

// T10 금지 말
const addText = (b, t) => { b.text = [...b.text, t]; };
D('D-T10-01', 'T10', '08시 판 글에 「지금 사라.」', ['bWords', 'cWords'], false, '', F => edit(F, B08, b => addText(b, '지금 사라.')));
D('D-T10-02', 'T10', '08시 판 글에 「반도체주는 팔라는 신호입니다.」', ['bWords'], false, '', F => edit(F, B08, b => addText(b, '반도체주는 팔라는 신호입니다.')));
D('D-T10-03', 'T10', '12시 판 글에 「가운데 시나리오를 추천합니다.」', ['bWords'], false, '', F => edit(F, B12, b => addText(b, '가운데 시나리오를 추천합니다.')));
D('D-T10-04', 'T10', '08시 판 「위」 전제에 「목표가 2700 돌파」', ['bWords'], false, '', F => edit(F, B08, b => { SC(b, '위').premise = '목표가 2700 돌파'; }));
D('D-T10-05', 'T10', '08시 판 「아래」 invalidator 를 「확실히 가운데 값 위로 올라감」', ['bWords'], false, '', F => edit(F, B08, b => { SC(b, '아래').invalidator = '확실히 가운데 값 위로 올라감'; }));
D('D-T10-06', 'T10', '16시 판 글에 「덮음을 보장합니다.」', ['bWords'], false, '', F => edit(F, B16, b => addText(b, '덮음을 보장합니다.')));
D('D-T10-07', 'T10', '08시 판 screen.chance 에 「무조건 위」', ['bWords'], false, '', F => edit(F, B08, b => { b.screen.chance = '보통 · 무조건 위 · 위 25% · 가운데 50% · 아래 25%'; }));
D('D-T10-08', 'T10', '화면 파일(view.json) 지금 판 chance 에 「확실」', ['cf14', 'bWords'], false, '', F => { F['public/data/atlas4h/view.json'].now.screen.chance = '확실 · 위 25% · 가운데 50% · 아래 25%'; });
D('D-T10-09', 'T10', '08시 판 사건 이름 「목표가 발표」', ['bWords'], false, '', F => edit(F, B08, b => { b.events[0].name = '증권사 목표가 발표'; }));
D('D-T10-10', 'T10', '08시 판 큰 사고 칸(tail)에 「무조건 손절 구간」', ['bWords'], false, '', F => edit(F, B08, b => { b.kospi.tail = [{what: '무조건 손절 구간', kospiPct: -7.1, watch: 'WTI'}]; }));
D('D-T10-11', 'T10', '08시 판 글에 「지금 사세요.」(목록 말의 높임 꼴)', ['cWords'], true, '금지 말 목록은 「사라」 글자 — 같은 뜻 다른 꼴까지 덮는지 갈림', F => edit(F, B08, b => addText(b, '지금 사세요.')));
D('D-T10-12', 'T10', '뒤 판 하나(gen 12) 글에 「이 판은 추천 판입니다.」', ['bWords'], false, '', F => edit(F, GEN[12].id, b => addText(b, '이 판은 추천 판입니다.')));

// T11 옛 엔진·채점·기록
const chg = c => (F, O) => { O.changes = [...O.changes, c]; };
D('D-T11-01', 'T11', '옛 채점 lib/atlas11/score.mjs 를 고침(3줄 지움)', ['T11', 'cOld'], false, '', chg(CH('M', 'lib/atlas11/score.mjs', {deletedLines: 3, appendOnly: false})));
D('D-T11-02', 'T11', '옛 엔진 scripts/atlas11/run_daily.mjs 를 지움', ['T11', 'cOld'], false, '', chg(CH('D', 'scripts/atlas11/run_daily.mjs', {deletedLines: 120, appendOnly: false})));
D('D-T11-03', 'T11', '옛 엔진 lib/atlas11/forecast.mjs 이름 바꿈 → forecast_v1.mjs', ['T11', 'cOld'], false, '', chg(CH('R100', 'lib/atlas11/forecast_v1.mjs', {oldPath: 'lib/atlas11/forecast.mjs', newPath: 'lib/atlas11/forecast_v1.mjs', appendOnly: false})));
D('D-T11-04', 'T11', '새 기록 atlas4h/ledger/boards/2026-10-02.jsonl 을 덮어씀(1줄 지움)', ['bAppend', 'T11'], false, '', chg(CH('M', 'atlas4h/ledger/boards/2026-10-02.jsonl', {deletedLines: 1, appendOnly: false})));
D('D-T11-05', 'T11', '봉인 기록 atlas4h/ledger/seals/2026-10-01.jsonl 을 지움', ['bAppend', 'T11'], false, '', chg(CH('D', 'atlas4h/ledger/seals/2026-10-01.jsonl', {deletedLines: 1, appendOnly: false})));
D('D-T11-06', 'T11', '옛 채점 기록 reports/atlas11/ledger/score/2026-09-30.jsonl 을 고침(2줄 지움)', ['T11', 'cOld'], false, '', chg(CH('M', 'reports/atlas11/ledger/score/2026-09-30.jsonl', {deletedLines: 2, appendOnly: false})));
D('D-T11-07', 'T11', '옛 화면 기록 public/data/atlas11/ledger/score/2026-09-30.json 을 고침', ['T11', 'cOld'], false, '', chg(CH('M', 'public/data/atlas11/ledger/score/2026-09-30.json', {deletedLines: 4, appendOnly: false})));
D('D-T11-08', 'T11', '옛 채점 코드 lib/atlas11/score_cells.mjs 에 줄만 덧붙임(지운 줄 0)', ['T11'], true, '「지우지도 덮지도」만 읽으면 덧붙임은 허용 — T11 「변경 0」으로 읽으면 흠', chg(CH('M', 'lib/atlas11/score_cells.mjs', {deletedLines: 0, appendOnly: true})));
D('D-T11-09', 'T11', '옛 엔진 폴더에 새 파일 scripts/atlas11/atlas4h_bridge.mjs 를 더함', ['T11'], true, '새 파일 더하기가 옛 엔진 「변경」인지 갈림', chg(CH('A', 'scripts/atlas11/atlas4h_bridge.mjs')));
D('D-T11-10', 'T11', '새 기록 atlas4h/ledger/boards/2026-10-01.jsonl 을 archive 로 옮김(이름 바꿈)', ['bAppend', 'cOld'], false, '', chg(CH('R100', 'atlas4h/ledger/archive/boards-2026-10-01.jsonl', {oldPath: 'atlas4h/ledger/boards/2026-10-01.jsonl', newPath: 'atlas4h/ledger/archive/boards-2026-10-01.jsonl', appendOnly: false})));
D('D-T11-11', 'T11', '옛 엔진 예약 .github/workflows/atlas11-daily.yml 을 고침', ['T11'], true, '예약 파일이 「옛 엔진」에 드는지 갈림', chg(CH('M', '.github/workflows/atlas11-daily.yml', {deletedLines: 1, appendOnly: false})));
D('D-T11-12', 'T11', '시도 장부 atlas4h/seal/trials.jsonl 을 덮어씀(1줄 지움)', ['bAppend', 'T11'], false, '', chg(CH('M', 'atlas4h/seal/trials.jsonl', {deletedLines: 1, appendOnly: false})));
D('D-T11-13', 'T11', '채점 기록 atlas4h/ledger/scores/2026-10-02.jsonl 을 덮어씀(1줄 지움)', ['bAppend', 'T11'], false, '', chg(CH('M', 'atlas4h/ledger/scores/2026-10-02.jsonl', {deletedLines: 1, appendOnly: false})));
D('D-T11-14', 'T11', '감시 기록 atlas4h/ledger/watch/2026-10-02.jsonl 고침 — 덧붙이기만인지 모름(appendOnly null)', ['bAppend'], true, '모르는 것을 흠으로 셀지 갈림', chg(CH('M', 'atlas4h/ledger/watch/2026-10-02.jsonl', {deletedLines: 0, appendOnly: null})));

// T12 재현에서 폭이 기준 셋을 이김
D('D-T12-01', 'T12', '재현 40줄 모두 ATLAS 11 구간 점수가 내 것보다 5 낮음(ATLAS 11 을 못 이김)', ['T12', 'sBase'], false, '', F => { rows(F).forEach((r, i) => { bl(r, 'ATLAS 11').interval = r2(r.interval.score - 5 + 0.5 * Math.sin(i)); }); });
D('D-T12-02', 'T12', '재현 40줄 모두 단순 전이식 = 내 점수(비김)', ['T12'], false, '', F => { rows(F).forEach(r => { bl(r, '단순 전이식').interval = r.interval.score; }); });
D('D-T12-03', 'T12', '재현 40줄 모두 ATLAS 11 「없음」(interval null)', ['T12', 'sBase'], false, '', F => { rows(F).forEach(r => { Object.assign(bl(r, 'ATLAS 11'), {interval: null, note: '없음'}); }); });
D('D-T12-04', 'T12', '재현 40줄에서 ATLAS 11 항목을 빼버림', ['T12', 'sBase'], false, '', F => { rows(F).forEach(r => { r.baselines = r.baselines.filter(x => x.id !== 'ATLAS 11'); }); });
D('D-T12-05', 'T12', '재현 10줄뿐(모두 크게 이김)', ['jMin'], false, '', F => { F['atlas4h/retro/result.json'].rows = rows(F).slice(0, 10); });
D('D-T12-06', 'T12', '무판보다 평균은 0.3 낮지만 들쭉날쭉(DM 유의 아님)', ['sDm', 'jWin'], false, '', F => { rows(F).forEach((r, i) => { bl(r, '무판').interval = r2(r.interval.score + 0.3 + 6 * (i % 2 ? 1 : -1)); }); });
D('D-T12-07', 'T12', '재현 줄의 구간 점수가 α = 0.1 (80% 범위가 아님)', ['jAlpha'], false, '', F => { rows(F).forEach(r => { r.interval.alpha = 0.1; }); });
D('D-T12-08', 'T12', '앞 20줄을 두 번 적어 40줄로 부풀림(같은 판 겹침)', ['jMin'], true, '「겹치면 하나」(F4)를 T12 가 세는지 갈림', F => { const rs = rows(F).slice(0, 20); F['atlas4h/retro/result.json'].rows = [...rs, ...clone(rs)]; });
D('D-T12-09', 'T12', '08시 20줄 + 16시 20줄(같은 시각 판은 20개씩)', ['sSlot', 'jMin'], true, '같은 시각 판마다 30개를 따로 채워야 하는지 갈림', F => { rows(F).forEach((r, i) => { if (i >= 20) r.boardId = r.boardId.replace('-08-', '-16-'); }); });
D('D-T12-10', 'T12', '40줄 모두 12시 판인데 단순 전이식 숫자가 있음(12시 단순 전이식은 「없음」이어야 함)', ['j2', 'cNone'], true, '12시 줄을 표에서 빼야 하는지·숫자를 지어낸 것인지 T12 가 볼 일인지 갈림', F => { rows(F).forEach(r => { r.boardId = r.boardId.replace('-08-', '-12-'); }); });
D('D-T12-11', 'T12', '내 구간 점수가 15줄에서 null(남은 25줄만 셀 수 있음)', ['jMin'], true, 'null 줄을 빼고 30 미만이면 「아직 모름」으로 볼지 갈림', F => { rows(F).forEach((r, i) => { if (i % 8 < 3) r.interval.score = null; }); });

// T13 덮음
D('D-T13-01', 'T13', '평소 판 34개 모두 덮음(100% — 범위가 너무 넓음)', ['T13'], false, '', F => { for (const i of NORMAL_MISS) setCover(F, i, true); });
D('D-T13-02', 'T13', '평소 판 덮음 22/34(64.7%)', ['T13'], false, '', F => { for (const i of [0, 5, 10, 15, 20, 25]) setCover(F, i, false); });
D('D-T13-03', 'T13', '평소 판 채점 29개뿐(30 미만, 덮음 79%)', ['T13'], false, '', F => { removeRow(F, 'scores', s => [0, 1, 2, 4, 5].some(i => GEN[i].id === s.boardId)); });
D('D-T13-04', 'T13', '평소 판 덮음 23/34(67.6%) · 위기 5/5 — 합치면 71.8% 로 감춰짐', ['T13', 'eCrisis2'], false, '', F => { for (const i of [0, 5, 10, 15, 20]) setCover(F, i, false); setCover(F, 34, true); });
D('D-T13-05', 'T13', '위기 판 덮음 1/5(20%) — 평소 판은 그대로', ['eCrisis', 'jCrisis'], true, '위기 덮음이 모자랄 때 T13 이 안 통과여야 하는지(「따로 잰다」만 요구하는지) 갈림', F => { for (const i of [32, 33, 35]) setCover(F, i, false); });
D('D-T13-06', 'T13', '실제 종가는 범위 밖인데 covered: true 로 적음(7줄 — 참 덮음 61.8%)', ['T13'], false, '', F => {
  for (const i of [0, 5, 10, 15, 20, 25, 30]) { const b = findBoard(F, GEN[i].id); scoreRow(F, GEN[i].id).actual.value = r2(b.kospi.quantiles.p90 + 20); }
});
D('D-T13-07', 'T13', '평소 판 29개 + 한 판 채점 줄을 두 번(30줄, 판은 29개)', ['T13'], false, '', F => {
  removeRow(F, 'scores', s => [0, 1, 2, 4, 5].some(i => GEN[i].id === s.boardId));
  F[`atlas4h/ledger/scores/${GEN[6].date}.jsonl`].push(clone(scoreRow(F, GEN[6].id)));
});
D('D-T13-08', 'T13', '채점 5줄이 장부에 없는 판(봉인 안 된 판)을 가리킴 — 봉인된 평소 판은 29개', ['eSealedOnly', 'T13'], false, '', F => {
  for (const i of [0, 1, 2, 4, 5]) scoreRow(F, GEN[i].id).boardId = `4h-${ymd(GEN[i].date)}-08-00000000`;
});
D('D-T13-09', 'T13', '모든 채점 줄의 interval.alpha = 0.1', ['T13', 'jAlpha'], true, '판의 p10·p90 은 그대로라 덮음은 80% 범위로도 셀 수 있음 — α 칸만 틀림', F => {
  for (const k of Object.keys(F).filter(k => k.startsWith('atlas4h/ledger/scores/'))) for (const s of F[k]) s.interval.alpha = 0.1;
});

// T14 화면 숫자 = 봉인 값
const VIEW = F => F['public/data/atlas4h/view.json'];
D('D-T14-01', 'T14', '화면 지난 판(08시) 가운데 값 2650(봉인 2649.86)', ['T14'], false, '', F => { VIEW(F).history[0].kospi.center = 2650; });
D('D-T14-02', 'T14', '화면 지난 판 p10 2600(봉인 2606.69)', ['T14'], false, '', F => { VIEW(F).history[0].kospi.quantiles.p10 = 2600; });
D('D-T14-03', 'T14', '화면 지난 판 screen.value 2649(봉인 2649.86)', ['T14'], false, '', F => { VIEW(F).history[0].screen.value = 2649; });
D('D-T14-04', 'T14', '화면 지금 판(12시, 봉인은 「확인 중」)에 숫자 2663.15', ['T14', 'bTwo'], false, '', F => { VIEW(F).now.screen.value = 2663.15; });
D('D-T14-05', 'T14', '화면 chance 의 퍼센트가 봉인과 다름(위 30% · 가운데 45%)', ['T14'], true, 'chance 는 글 칸 — 글 속 숫자까지 「화면 숫자」로 볼지 갈림', F => { VIEW(F).now.screen.chance = '보통 · 위 30% · 가운데 45% · 아래 25%'; });
D('D-T14-06', 'T14', '화면에 장부에 없는 판 id(04시) 덩어리와 숫자', ['T14', 'eSealedOnly'], false, '', F => { VIEW(F).history.push({boardId: '4h-20261002-04-deadbeef', kospi: {center: 2655.5, quantiles: {p10: 2610, p90: 2700}}, screen: {value: 2655.5, boardTime: '04시 판'}}); });
D('D-T14-07', 'T14', '화면 지난 판 가운데 값을 반올림 2649.9 로', ['T14'], true, '보이는 자리 수로 반올림한 것을 같다고 볼지 갈림', F => { VIEW(F).history[0].kospi.center = 2649.9; });
D('D-T14-08', 'T14', '화면에 boardId 없는 숫자 덩어리(가운데 2700)', ['T14'], true, 'boardId 없는 덩어리를 어느 판과 대조할지 사양이 정하지 않음', F => { VIEW(F).extra = {kospi: {center: 2700}, screen: {value: 2700}}; });
D('D-T14-09', 'T14', '화면 지난 판 p90 2700(봉인 2692.8)', ['T14'], false, '', F => { VIEW(F).history[0].kospi.quantiles.p90 = 2700; });

// T16 무판을 못 이긴 후보 무게 0
D('D-T16-01', 'T16', '08시 판 단순 전이식(무판 못 이김) 무게 0.3 · 무판 0.7', ['bEng', 'eDm'], false, '', F => edit(F, B08, b => { E(b, 'center-transfer').weight = 0.3; E(b, 'center-nochange').weight = 0.7; }));
D('D-T16-02', 'T16', '12시 판에 닮은 날(center-analog, 못 이김) 무게 0.2 더함', ['bEng'], false, '', F => edit(F, B12, b => { b.engines.push({id: 'center-analog', role: '가운데', weight: 0.2, inputs: ['kospi'], sawPreviousBoard: false}); E(b, 'center-nochange').weight = 0.8; }));
D('D-T16-03', 'T16', '08시 판에 무게 근거(weights.json)에 없는 가운데 후보 center-learn52 무게 0.1', ['eDm'], true, '근거 파일에 없는 후보를 「못 이긴 것」으로 볼지 갈림', F => edit(F, B08, b => { b.engines.push({id: 'center-learn52', role: '가운데', weight: 0.1, inputs: ['kospi'], sawPreviousBoard: false}); E(b, 'center-nochange').weight = 0.9; }));
D('D-T16-04', 'T16', 'weights.json 에서 단순 전이식 beatsNoChange: true(그러나 DM p 0.41) · 08시 판 무게 0.3', ['eDm', 'jWin'], false, '', F => { F['atlas4h/seal/weights.json'].candidates[0].beatsNoChange = true; edit(F, B08, b => { E(b, 'center-transfer').weight = 0.3; E(b, 'center-nochange').weight = 0.7; }); });
D('D-T16-05', 'T16', 'weights.json 이 없는데 08시 판 단순 전이식 무게 0.3', ['bEng'], false, '', F => { delete F['atlas4h/seal/weights.json']; edit(F, B08, b => { E(b, 'center-transfer').weight = 0.3; E(b, 'center-nochange').weight = 0.7; }); });
D('D-T16-06', 'T16', '08시 판 단순 전이식 역할 이름을 「중심」으로 바꾸고 무게 0.3', ['bEng'], true, '역할 이름이 「가운데」가 아니면 T16 이 볼지 갈림', F => edit(F, B08, b => { const e = E(b, 'center-transfer'); e.role = '중심'; e.weight = 0.3; E(b, 'center-nochange').weight = 0.7; }));
D('D-T16-07', 'T16', '08시 판 단순 전이식 무게 0.0001', ['bEng'], false, '', F => edit(F, B08, b => { E(b, 'center-transfer').weight = 0.0001; E(b, 'center-nochange').weight = 0.9999; }));
D('D-T16-08', 'T16', '뒤 판 하나(gen 10) 단순 전이식 무게 0.5', ['bEng'], false, '', F => edit(F, GEN[10].id, b => { E(b, 'center-transfer').weight = 0.5; E(b, 'center-nochange').weight = 0.5; }));

// T17 누수 검사
D('D-T17-01', 'T17', '08시 판 사건 postSealHits 2', ['bLeak'], false, '', F => edit(F, B08, b => { b.events[0].leakCheck.postSealHits = 2; }));
D('D-T17-02', 'T17', '12시 판 사건 leakCheck 칸을 지움', ['bLeak', 'eLeak'], false, '', F => edit(F, B12, b => { delete b.events[0].leakCheck; }));
D('D-T17-03', 'T17', '16시 판 사건 postSealHits = null', ['bLeak'], false, '', F => edit(F, B16, b => { b.events[0].leakCheck.postSealHits = null; }));
D('D-T17-04', 'T17', '08시 판 사건 leakCheck.checked 0(에이전트 6이 찾았는데 하나도 안 거름)', ['eLeak'], true, '검사 수 0 을 흠으로 볼지 갈림', F => edit(F, B08, b => { b.events[0].leakCheck.checked = 0; }));
D('D-T17-05', 'T17', '12시 판에 누수 검사 없는 둘째 사건(FOMC 의사록) 더함', ['bLeak', 'eLeak'], false, '', F => edit(F, B12, b => { b.events.push({name: 'FOMC 의사록', at: '2026-10-03T03:00:00+09:00', pGood: 0.3, pBad: 0.3, impact: {good: 0.4, bad: -1.2}, agents: 5}); }));
D('D-T17-06', 'T17', '08시 판 사건 근거에 봉인 뒤(09:15) 게시된 기사 — postSealHits 는 0 으로 적음', ['k12', 'T17'], true, '사건 근거 목록(evidence)은 판 형식에 없는 칸 — 시험이 읽어야 하는지 갈림', F => edit(F, B08, b => { b.events[0].evidence = [{title: '고용지표 미리보기', url: 'https://news.example/a', publishedAt: '2026-10-02T09:15:00+09:00'}]; }));
D('D-T17-07', 'T17', '08시 판 사건 근거에 게시 시각 없는 기사', ['k12'], true, '판 형식에 없는 칸이라 갈림', F => edit(F, B08, b => { b.events[0].evidence = [{title: '고용지표 전망', url: 'https://news.example/b'}]; }));
D('D-T17-08', 'T17', '뒤 판 하나(gen 5) 사건 postSealHits 1', ['bLeak'], false, '', F => edit(F, GEN[5].id, b => { b.events[0].leakCheck.postSealHits = 1; }));

// T18 LLM 재현은 학습 마감 뒤
D('D-T18-01', 'T18', 'LLM 쓴 재현 판(목표 2026-06-15 — 학습 마감 6/30 앞)을 더함', ['bLlm', 'jLlm'], false, '', F => { cloneRetro(F, '2026-06-15', '2026-06-12'); });
D('D-T18-02', 'T18', 'LLM 쓴 재현 판(목표 2026-06-30 = 학습 마감 날)을 더함', ['bLlm'], false, '', F => { cloneRetro(F, '2026-06-30', '2026-06-29'); });
D('D-T18-03', 'T18', '재현 판 llm.trainingCutoff 를 지움(LLM 씀)', ['bLlm', 'cLlm'], true, '마감을 모르면 잴 수 없음 — 흠인지 「모름」인지 갈림', F => edit(F, R01, b => { delete b.llm.trainingCutoff; }));
D('D-T18-04', 'T18', '재현 판 학습 마감 2026-09-15(목표 9/1 보다 뒤)', ['bLlm'], false, '', F => edit(F, R01, b => { b.llm.trainingCutoff = '2026-09-15'; }));
D('D-T18-05', 'T18', 'retro 표시 없는 재현 판(자료 마감 6/15, 봉인 10/1, LLM 씀, 목표 6/15)', ['cLlm'], true, '재현 판을 표시로 가를지 시각(자료 마감 ≪ 봉인)으로 가를지 갈림', F => { cloneRetro(F, '2026-06-15', '2026-06-12', {retro: false}); });

// T19 판정 기준이 첫 채점 전에 봉인
const JUD = F => F['atlas4h/seal/judgment.json'];
D('D-T19-01', 'T19', '판정 기준 sealedAt 을 첫 채점(10/2 15:41) 뒤 16:00 으로', ['T19', 'jFirst'], false, '', F => { JUD(F).sealedAt = '2026-10-02T16:00:00+09:00'; });
D('D-T19-02', 'T19', '판정 기준 커밋 시각이 첫 채점 뒤(10/2 16:05)', ['T19', 'cSealFirst'], false, '', (F, O) => { O.judgmentCommitAt = '2026-10-02T16:05:00+09:00'; });
D('D-T19-03', 'T19', '판정 기준 sealedAt 칸을 지움', ['T19'], false, '', F => { delete JUD(F).sealedAt; });
D('D-T19-04', 'T19', '판정 기준 파일이 없음(채점은 있음)', ['T19', 'cSealFirst'], false, '', F => { delete F['atlas4h/seal/judgment.json']; });
D('D-T19-05', 'T19', '재현 판을 판정 기준 봉인(18:20) 전 18:10 에 채점한 줄을 더함', ['T19', 'jFirst'], false, '', F => {
  F['atlas4h/ledger/scores/2026-10-01.jsonl'] = [{boardId: R01, target: '2026-09-01', scoredAt: '2026-10-01T18:10:00+09:00', actual: {value: 2520.5, asOf: '2026-09-01T15:30:00+09:00', source: '네이버 증권 지수 일별'}, crps: 11.2, interval: {alpha: 0.2, score: 74.48, covered: true}, brier: {event: 'up', p: 0.41, o: 1, score: 0.3481}, baselines: [{id: '무판', crps: 10.2, interval: 64, brier: 0.36}, {id: '단순 전이식', crps: 9.8, interval: 61.5}, {id: 'ATLAS 11', crps: null, interval: null, note: '없음'}], crisis: false}];
});
D('D-T19-06', 'T19', '판정 기준 sealedAt = 첫 채점 시각(10/2 15:41:00, 같은 때)', ['T19'], false, '', F => { JUD(F).sealedAt = '2026-10-02T15:41:00+09:00'; });
D('D-T19-07', 'T19', '판정 기준 sealedAt 을 UTC 표기 2026-10-02T07:00:00Z(= 16:00 KST, 첫 채점 뒤)로', ['T19'], false, '', F => { JUD(F).sealedAt = '2026-10-02T07:00:00Z'; });

// T20 시도 장부·SPA
const W = F => F['atlas4h/seal/weights.json'];
const TR = F => F['atlas4h/seal/trials.jsonl'];
D('D-T20-01', 'T20', '고른 기록의 시도 목록에 장부에 없는 trial-0009', ['T20', 'jTrials'], false, '', F => { W(F).selections[0].trialIds.push('trial-0009'); });
D('D-T20-02', 'T20', '고른 기록 SPA p = 0.2', ['T20', 'jSpa'], false, '', F => { W(F).selections[0].spa.p = 0.2; });
D('D-T20-03', 'T20', '고른 기록에서 spa 칸을 지움', ['T20', 'sSpa'], false, '', F => { delete W(F).selections[0].spa; });
D('D-T20-04', 'T20', '시도 trial-0002 의 sealedAt 을 지움', ['T20', 'jTrials'], false, '', F => { delete TR(F).find(t => t.id === 'trial-0002').sealedAt; });
D('D-T20-05', 'T20', '고른 것(chose)이 trial-0003 — 견준 시도 목록(0001·0002)에 없음', ['T20', 'sSpa'], false, '', F => { W(F).selections[0].chose = 'trial-0003'; });
D('D-T20-06', 'T20', '고른 기록 SPA p = 0.05(문턱 p < 0.05 와 같음)', ['jSpa'], false, '', F => { W(F).selections[0].spa.p = 0.05; });
D('D-T20-07', 'T20', '시도 trial-0002 를 고른 기록(18:25) 뒤 18:40 에 봉인', ['jTrials'], true, '「결과 보기 전」을 무게 파일 봉인 시각으로 잴지 갈림', F => { TR(F).find(t => t.id === 'trial-0002').sealedAt = '2026-10-01T18:40:00+09:00'; });
D('D-T20-08', 'T20', '08시 판에 시도 장부에 없는 폭 엔진 width-tree(무게 0.2)', ['T20', 'sSpa'], true, '판에 쓴 엔진마다 시도 줄이 있어야 하는지 갈림', F => edit(F, B08, b => { b.engines.push({id: 'width-tree', role: '폭', weight: 0.2, inputs: ['kospi', 'sox'], sawPreviousBoard: false}); E(b, 'width-har').weight = 0.5; E(b, 'width-harx').weight = 0.3; }));
D('D-T20-09', 'T20', '시도 장부에 같은 id(trial-0002)의 다른 시도가 한 줄 더 있음', ['T20'], true, 'id 겹침을 T20 이 볼지 갈림', F => { TR(F).push({id: 'trial-0002', at: '2026-10-01T18:13:00+09:00', what: '폭: HAR-X 다른 창', engine: 'width-harx', sealedAt: '2026-10-01T18:13:30+09:00'}); });
D('D-T20-10', 'T20', '시도 장부가 비었음(고른 기록은 그대로)', ['T20', 'jTrials'], false, '', F => { F['atlas4h/seal/trials.jsonl'] = []; });

// T21 앞 판 값을 안 봄
D('D-T21-01', 'T21', '08시 판 무판 엔진 sawPreviousBoard: true', ['bEng'], false, '', F => edit(F, B08, b => { E(b, 'center-nochange').sawPreviousBoard = true; }));
D('D-T21-02', 'T21', '12시 판 HAR 엔진 sawPreviousBoard 칸을 지움', ['bEng'], false, '', F => edit(F, B12, b => { delete E(b, 'width-har').sawPreviousBoard; }));
D('D-T21-03', 'T21', '12시 판 무판 엔진 입력에 앞 판 id(08시 판)', ['T21'], false, '', F => edit(F, B12, b => { E(b, 'center-nochange').inputs.push(B08); }));
D('D-T21-04', 'T21', '12시 판 입력 변수에 앞 판 가운데 값(2649.86)을 넣고 HAR-X 가 씀', ['T21'], false, '', F => edit(F, B12, b => {
  b.inputs.variables.push({id: 'prev-board-center', market: 'KR', value: 2649.86, observedAt: '2026-10-02T08:31:40+09:00', fetchedAt: '2026-10-02T12:00:31+09:00', status: '한 출처',
    sources: [{name: '앞 판(ATLAS 4h)', url: 'atlas4h/ledger/boards/2026-10-02.jsonl', value: 2649.86, observedAt: '2026-10-02T08:31:40+09:00', fetchedAt: '2026-10-02T12:00:31+09:00', rawSha256: hex('prev')}]});
  E(b, 'width-harx').inputs.push('prev-board-center');
}));
D('D-T21-05', 'T21', '08시 판 HAR 엔진 sawPreviousBoard: "false"(글자)', ['bEng'], true, '글자 "false" 를 거짓으로 읽을지 갈림', F => edit(F, B08, b => { E(b, 'width-har').sawPreviousBoard = 'false'; }));
D('D-T21-06', 'T21', '뒤 판 하나(gen 7) HAR-X 엔진 sawPreviousBoard: true', ['bEng'], false, '', F => edit(F, GEN[7].id, b => { E(b, 'width-harx').sawPreviousBoard = true; }));

// T22 구조 번호
D('D-T22-01', 'T22', '08시 판 구조 번호에 F 칸이 없음', ['bStr', 'sStr'], false, '', F => edit(F, B08, b => { b.structures = b.structures.filter(s => s[0] !== 'F'); }));
D('D-T22-02', 'T22', '12시 판 구조 번호 빈 목록', ['T22', 'bStr'], false, '', F => edit(F, B12, b => { b.structures = []; }));
D('D-T22-03', 'T22', '16시 판 structures 칸을 지움', ['T22'], false, '', F => edit(F, B16, b => { delete b.structures; }));
D('D-T22-04', 'T22', '08시 판 A 칸 번호를 없는 번호 「A7」 하나로', ['bStr', 'sStr'], false, '', F => edit(F, B08, b => { b.structures = ['A7', ...b.structures.filter(s => s[0] !== 'A')]; }));
D('D-T22-05', 'T22', '08시 판 구조 번호를 소문자(a1·b1…)로', ['bStr'], true, '대소문자를 같은 번호로 볼지 갈림', F => edit(F, B08, b => { b.structures = b.structures.map(s => s.toLowerCase()); }));
D('D-T22-06', 'T22', '08시 판 구조 번호를 목록 대신 한 줄 글 「A1·B1·C3·D4·E1·F1」로', ['T22'], true, '꼴이 다른 것을 흠으로 볼지 갈림', F => edit(F, B08, b => { b.structures = 'A1·B1·C3·D4·E1·F1'; }));
D('D-T22-07', 'T22', '뒤 판 하나(gen 3) 구조 번호에 C 칸이 없음', ['bStr'], false, '', F => edit(F, GEN[3].id, b => { b.structures = b.structures.filter(s => s[0] !== 'C'); }));

// T23 감시 S1~S8
const WR = (F, id) => rowBy(F, 'watch', id);
D('D-T23-01', 'T23', '08시 고리 감시 S3 = 1', ['T23'], false, '', F => { WR(F, 'loop-20261002-08').S.S3 = 1; });
D('D-T23-02', 'T23', '12시 고리 감시 S8 = 2', ['T23'], false, '', F => { WR(F, 'loop-20261002-12').S.S8 = 2; });
D('D-T23-03', 'T23', '16시 고리의 감시 줄이 없음', ['T23'], false, '', F => { removeRow(F, 'watch', r => r.loopId === 'loop-20261002-16'); });
D('D-T23-04', 'T23', '08시 고리 감시를 짓는 일꾼(「고리 일꾼」)이 함', ['wSep', 'hWatch'], false, '', F => { WR(F, 'loop-20261002-08').by = '고리 일꾼'; });
D('D-T23-05', 'T23', '12시 고리 감시에서 S5 칸이 빠짐', ['T23'], false, '', F => { delete WR(F, 'loop-20261002-12').S.S5; });
D('D-T23-06', 'T23', '16시 고리 감시 S1 = null', ['T23'], false, '', F => { WR(F, 'loop-20261002-16').S.S1 = null; });
D('D-T23-07', 'T23', '08시 고리 감시 두 줄 — 먼저 S4 = 1, 뒤에 모두 0(다시 돌려 덮음)', ['T23', 'bAppend'], true, '마지막 줄만 볼지 모든 줄을 볼지 갈림', F => {
  const f = F['atlas4h/ledger/watch/2026-10-02.jsonl'];
  const first = clone(f[0]);
  first.S.S4 = 1;
  first.at = '2026-10-02T08:40:00+09:00';
  f.unshift(first);
});
D('D-T23-08', 'T23', '08시 고리 감시 시각이 고리 끝(08:31:36) 전 08:20', ['wSep'], true, '감시 시각 순서를 T23 이 볼지 갈림', F => { WR(F, 'loop-20261002-08').at = '2026-10-02T08:20:00+09:00'; });
D('D-T23-09', 'T23', '뒤 판 하나(gen 12) 고리 감시 S6 = 1', ['T23'], false, '', F => { WR(F, GEN[12].loopId).S.S6 = 1; });

// ───────────────────────── 헛잡음 탐침 (잡히면 안 됨) ─────────────────────────
P('P-01', '08시 판 글 「반도체 걱정이 사라졌습니다.」(「사라지다」 속 글자)', ['bWords'], true, '금지 말을 글자 겹침으로 셀지 낱말로 셀지 갈림(conflicts 14 는 글자 겹침을 금지 말로 안 봄)', F => edit(F, B08, b => addText(b, '반도체 걱정이 사라졌습니다.')), 'A', 'T10');
P('P-02', '08시 판 글 「목표일 종가로 채점합니다.」(「목표가」 아님)', ['bWords'], false, '', F => edit(F, B08, b => addText(b, '목표일 종가로 채점합니다.')), 'A', 'T10');
P('P-03', '08시 판 시나리오를 p10·p90 으로 나눔 — 위 0.1 · 가운데 0.8 · 아래 0.1(범위·chance 도 맞춤)', ['bScen', 'eDist'], false, '', F => edit(F, B08, b => {
  const Qn = b.kospi.quantiles;
  SC(b, '위').kospi = {low: Qn.p90, high: 2720}; SC(b, '가운데').kospi = {low: Qn.p10, high: Qn.p90}; SC(b, '아래').kospi = {low: 2580, high: Qn.p10};
  probs(b, [0.1, 0.8, 0.1]);
  b.screen.chance = '보통 · 위 10% · 가운데 80% · 아래 10%';
}), 'A', 'T5');
P('P-04', '새 기록 atlas4h/ledger/boards/2026-10-02.jsonl 에 덧붙이기만(지운 줄 0)', ['bAppend'], false, '', chg(CH('M', 'atlas4h/ledger/boards/2026-10-02.jsonl', {deletedLines: 0, appendOnly: true})), 'A', 'T11');
P('P-05', '새 날짜 기록 파일 atlas4h/ledger/seals/2026-10-03.jsonl 더함', ['bAppend'], false, '', chg(CH('A', 'atlas4h/ledger/seals/2026-10-03.jsonl')), 'A', 'T11');
P('P-06', '문서 atlas4h/README.md 고침', ['T11'], false, '', chg(CH('M', 'atlas4h/README.md', {deletedLines: 2, appendOnly: false})), 'A', 'T11');
P('P-07', '새 엔진 atlas4h/engine/board.mjs 고침(5줄 지움)', ['cOld'], true, '봉인된 앞 판 엔진 코드도 「옛 엔진」으로 볼지 갈림', chg(CH('M', 'atlas4h/engine/board.mjs', {deletedLines: 5, appendOnly: false})), 'A', 'T11');
P('P-08', 'ATLAS 11 자기 매일 커밋(atlas11 daily)이 public/data/atlas11/forecast.json 을 고침', ['cOld'], true, '옛 엔진이 스스로 도는 커밋까지 T11 이 볼지 갈림', chg({commit: 'f2c0fdb', subject: 'atlas11 daily 2026-10-01 [skip ci]', status: 'M', path: 'public/data/atlas11/forecast.json', deletedLines: 40, appendOnly: false}), 'A', 'T11');
P('P-09', '16시 판(시간 초과 → 앞 판 유지)도 채점 줄을 더함(목표 10/5)', ['eKeep'], false, '', F => {
  const b = findBoard(F, B16);
  F['atlas4h/ledger/scores/2026-10-05.jsonl'].push({...scoreFor(b, '2026-10-05', true, false), boardId: B16});
}, 'A', 'T13');
P('P-10', '「변수 그대로 → 앞 판 다시 봉인」 판을 새 id 로 더함(08시 판 값 그대로, 12:05 봉인)', ['lReseal', 'bStatus'], true, '앞 판 값을 그대로 다시 봉인한 것을 「엔진이 앞 판을 봄」으로 읽을 수도 있음', F => {
  const b = clone(findBoard(F, B08));
  b.id = `4h-20261002-12-${hex('reseal').slice(0, 8)}`;
  b.slot = '12'; b.kind = '가벼운'; b.status = '변수 그대로 → 앞 판 다시 봉인';
  b.createdAt = '2026-10-02T12:00:04+09:00'; b.sealedAt = '2026-10-02T12:05:00+09:00'; b.dataCutoff = b.sealedAt;
  b.screen.boardTime = '08시 판 다시 봉인';
  F['atlas4h/ledger/boards/2026-10-02.jsonl'].push(b);
  F['atlas4h/ledger/seals/2026-10-02.jsonl'].push({boardId: b.id, sealedAt: b.sealedAt, sha256: boardSha256(b), commit: '70ff430'});
}, 'A', 'T21');
P('P-11', '08시 판 출처들에서 fetchedAt 을 뺌(board.md 보기처럼 변수 칸에만 둠)', ['k8'], true, 'board.md 보기의 출처에는 fetchedAt 이 없음 — 출처마다 있어야 하는지 갈림', F => edit(F, B08, b => { for (const v of b.inputs.variables) for (const s of v.sources) delete s.fetchedAt; }), 'A', 'T7');
P('P-12', '08시 판에 다음 날 예정 사건(10/5 21:30) 하나 더 — 예정 시각은 자료가 아님', ['bTime'], false, '', F => edit(F, B08, b => { b.events.push({name: '미국 소매판매', at: '2026-10-05T21:30:00+09:00', pGood: 0.35, pBad: 0.35, impact: {good: 0.5, bad: -1.5}, agents: 6, leakCheck: {checked: 30, postSealHits: 0}}); }), 'A', 'T2');
P('P-13', '08시 고리 39.9분(판도 08:39:50 봉인)', ['T9'], false, '', F => {
  Object.assign(rowBy(F, 'loops', 'loop-20261002-08'), {endedAt: '2026-10-02T08:39:54+09:00', minutes: 39.9});
  edit(F, B08, b => { b.sealedAt = '2026-10-02T08:39:50+09:00'; b.dataCutoff = b.sealedAt; });
}, 'A', 'T9');
P('P-14', '08시 판 폭 엔진 무게를 0.5·0.5 로(폭은 T16 대상 아님)', ['bEng'], false, '', F => edit(F, B08, b => { E(b, 'width-har').weight = 0.5; E(b, 'width-harx').weight = 0.5; }), 'A', 'T16');
P('P-15', '화면 파일에 숫자 아닌 칸 더함(updatedAt · note)', ['T14'], false, '', F => { VIEW(F).updatedAt = '2026-10-02T12:13:30+09:00'; VIEW(F).note = '그림자 운전 화면'; }, 'A', 'T14');
P('P-16', '08시 판 두 길 pathB 2650.2(차이 0.34 ≤ 허용 0.5) · agree: true', ['bTwo'], false, '', F => edit(F, B08, b => { b.twoPath[0].pathB = 2650.2; }), 'A', 'T8');
P('P-17', '08시 판 구조 번호 순서를 바꾸고 맞는 번호(A3·B4·F6)를 더함', ['bStr'], false, '', F => edit(F, B08, b => { b.structures = ['F6', 'F2', 'F1', 'E5', 'E1', 'D5', 'D4', 'C5', 'C3', 'B4', 'B2', 'B1', 'A3', 'A2', 'A1']; }), 'A', 'T22');
P('P-18', '08시 고리 감시 S9 caught 2 · improved true · S10 kept 12/13(T23 은 S1~S8 만)', ['T23'], false, '', F => { const w = WR(F, 'loop-20261002-08'); w.S9 = {caught: 2, improved: true}; w.S10 = {kept: 12, of: 13}; }, 'A', 'T23');
P('P-19', 'LLM 안 쓴 재현 판(목표 2026-06-15)을 더함', ['bLlm'], false, '', F => { const b = cloneRetro(F, '2026-06-15', '2026-06-12'); b.llm = {used: false}; const s = F['atlas4h/ledger/seals/2026-10-01.jsonl'].find(x => x.boardId === b.id); s.sha256 = boardSha256(b); }, 'A', 'T18');
P('P-20', '08시 판 씨앗 0(맞는 정수 씨앗)', ['T3'], false, '', F => edit(F, B08, b => { b.seed = 0; }), 'A', 'T3');
P('P-21', '08시 판 maxGap 1e-9(맞춘 뒤 부동소수 찌꺼기)', ['bRec'], true, '아주 작은 어긋남을 0 으로 볼 허용 폭은 사양에 없음', F => edit(F, B08, b => { b.reconciliation.maxGap = 1e-9; }), 'A', 'T6');
P('P-22', '판정 기준 sealedAt 을 같은 때의 UTC 표기 2026-10-01T09:20:00Z 로', ['T19'], false, '', F => { JUD(F).sealedAt = '2026-10-01T09:20:00Z'; }, 'A', 'T19');
P('P-23', '08시 판 코스피 observedAt 을 같은 때의 UTC 표기 2026-10-01T06:30:00Z 로(변수·출처 모두)', ['bTime'], false, '', F => edit(F, B08, b => lateVar(b, 'kospi', 'observedAt', '2026-10-01T06:30:00Z')), 'A', 'T2');
P('P-24', '시도 장부에 고르지 않은 시도 trial-0004 하나 더(봉인 시각 있음)', ['T20'], false, '', F => { TR(F).push({id: 'trial-0004', at: '2026-10-01T18:16:00+09:00', what: '가운데: 닮은 날', engine: 'center-analog', sealedAt: '2026-10-01T18:16:30+09:00'}); }, 'A', 'T20');
P('P-25', '08시 판 S&P500 에 둘째 출처(FRED)가 어긋나 「확인 중」 — 어느 엔진도 S&P500 을 안 씀', ['k16', 'bVars'], false, '', F => edit(F, B08, b => {
  const v = V(b, 'sp500');
  v.status = '확인 중';
  v.sources.push({name: 'FRED SP500', url: 'https://fred.stlouisfed.org/series/SP500', value: 6650.0, observedAt: '2026-10-02T05:00:00+09:00', fetchedAt: '2026-10-02T08:00:24+09:00', rawSha256: hex('fred-sp500')});
}), 'A', 'T8');
P('P-26', '엔진 출력을 새 객체로 다시 만들어 돌려줌(값은 같고 키 순서만 다름)', ['T4'], false, '', (F, O) => {
  const eng = (inp, seed) => { const o = realEngine(inp, seed); return Object.fromEntries(Object.keys(o).reverse().map(k => [k, clone(o[k])])); };
  O.engine = eng;
}, 'B', 'T4');

// ───────────────────────── 돌리기 ─────────────────────────
function writeRoot(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-defects2-'));
  for (const [rel, v] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), {recursive: true});
    fs.writeFileSync(p, rel.endsWith('.jsonl') ? (v.length ? v.map(x => JSON.stringify(x)).join('\n') + '\n' : '') : JSON.stringify(v, null, 1) + '\n');
  }
  return root;
}
async function run(F, O) {
  const root = writeRoot(F);
  try {
    const st = await loadState(root);
    return runAll(st, O).map(r => ({id: r.id, pass: r.pass, reason: r.reason}));
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
}
function quoteCheck() {
  const bad = [];
  for (const it of [...DEFECTS, ...PROBES]) for (const q of it.specQuote) {
    const txt = fs.readFileSync(path.join(ROOT, q.file), 'utf8');
    if (!txt.includes(q.text)) bad.push(`${it.id}: ${q.file} — ${q.text}`);
  }
  if (bad.length) throw new Error('사양 글 인용이 원문에 없음:\n' + bad.join('\n'));
}
/** 흠이 바탕을 실제로 바꿨는지(시험을 돌리지 않고) — 생성기 실수 막기 */
function changedCheck(baseFn) {
  const bad = [];
  for (const it of [...DEFECTS, ...PROBES]) {
    const {F, O} = baseFn[it.base]();
    const before = JSON.stringify({F, O: {...O, engine: O.engine ? String(O.engine) : null}});
    it.apply(F, O);
    const after = JSON.stringify({F, O: {...O, engine: O.engine ? String(O.engine) : null}});
    if (before === after) bad.push(it.id);
  }
  if (bad.length) throw new Error('바탕을 안 바꾼 흠·탐침: ' + bad.join(', '));
}
const strip = it => { const {apply, ...rest} = it; return rest; };
function preRegisteredCommit() {
  try {
    const out = execFileSync('git', ['log', '--diff-filter=A', '--format=%H', '--', 'atlas4h/verify/independent-defects-2.json'], {cwd: ROOT, encoding: 'utf8'}).trim().split('\n').filter(Boolean);
    return out.at(-1) ?? null;
  } catch {
    return null;
  }
}
const nowKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 19) + '+09:00';

/** 미리 등록 뒤 생성기 실수를 찾았을 때 흠은 그대로 두고 여기에 적는다 */
const NOTES = {};

async function main() {
  const BASES = {A: buildBaseA, B: buildBaseB};
  quoteCheck();
  changedCheck(BASES);
  const counts = {};
  for (const d of DEFECTS) counts[d.target] = (counts[d.target] ?? 0) + 1;
  const doc = {
    schema: 'atlas4h-independent-defects-2',
    createdAt: nowKst(),
    preRegisteredCommit: REGISTER ? null : preRegisteredCommit(),
    readingRules: {
      read: ['atlas4h/command/*.txt', 'atlas4h/spec/board.md', 'atlas4h/data/contract.md', 'atlas4h/data/variables.json', 'atlas4h/seal/judgment.json', 'atlas4h/seal/judgment-2.json', 'atlas4h/harness/passlist.json', 'atlas4h/harness/conflicts.md', 'atlas4h/spec/fixtures/good/**', 'atlas4h/engine/board.mjs · har.mjs·dist.mjs 일부(T4 엔진을 부르는 법만)', 'atlas4h/verify/README.md'],
      notRead: ['atlas4h/spec/checks.mjs 본문', 'atlas4h/tests/**', 'atlas4h/verify/independent-defects.mjs·.json(묶음 1)', 'atlas4h/harness/eco-01-tests.md', 'atlas4h/harness/watch-*', 'first-run-report.md', 'progress.json', 'handoff.md', '6f8936a·f044b3a 의 차이'],
      seen: '바탕을 맞출 때 runAll 이 바탕에 낸 결과 글(reason)은 봤음 — 흠은 그 뒤에도 사양 글에서만 골랐고, 미리 등록 전에는 흠·탐침에 시험을 한 번도 돌리지 않았음',
    },
    base: {
      fixture: 'atlas4h/spec/fixtures/good',
      addedMaterials: [
        '뒤 판 37개(2026-10-05 ~ 11-25 평일, 10/9 뺌) — 08시 판을 본떠 날짜·값을 옮기고 봉인 지문을 새로 셈 · 판마다 봉인·채점·고리·감시 한 줄(T13: 평소 34판 중 28 덮음 82.4% · 위기 5판 중 4 덮음)',
        '재현 결과 atlas4h/retro/result.json — 2026-07-01부터 평일 40줄(08시), 내 구간 점수가 무판·단순 전이식·ATLAS 11 보다 늘 6~11 낮음(T12)',
        '커밋 목록 changes — ef8aaaf·b8074cc 에서 새로 더한 파일 4개(T11)',
        `판정 기준 커밋 시각 judgmentCommitAt = ${JUDGMENT_COMMIT_AT}(T19)`,
        '바탕 B(T4 전용) — 0판 엔진 buildBoard 로 지은 판 3개(9/29·9/30·10/1 08시, 코스피·종목 지난 등락 130줄) + 봉인, engine = engine/board.mjs 의 engine',
      ],
      baseResults: null,
    },
    defects: DEFECTS.map(strip),
    probes: PROBES.map(strip),
    plantedByCheck: counts,
  };
  if (REGISTER) {
    doc.note = '미리 등록 — 결과 없음. 이 커밋 뒤에는 흠·탐침을 지우거나 고치지 않는다.';
    fs.writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
    console.log(`등록: 흠 ${DEFECTS.length} · 탐침 ${PROBES.length}`);
    return;
  }
  const baseRes = {};
  for (const [k, fn] of Object.entries(BASES)) {
    const {F, O} = fn();
    baseRes[k] = await run(F, O);
  }
  doc.base.baseResults = Object.fromEntries(Object.entries(baseRes).map(([k, rs]) => [k, Object.fromEntries(rs.map(r => [r.id, r.pass ? '통과' : `안 통과 — ${r.reason}`]))]));
  const passOn = k => new Set(baseRes[k].filter(r => r.pass).map(r => r.id));
  const results = [];
  for (const d of DEFECTS) {
    const {F, O} = BASES[d.base]();
    d.apply(F, O);
    const rs = await run(F, O);
    const okBase = passOn(d.base);
    const newly = rs.filter(r => okBase.has(r.id) && !r.pass);
    const t = rs.find(r => r.id === d.target);
    const res = {id: d.id, target: d.target, contested: d.contested, caught: okBase.has(d.target) && !t.pass, failedChecks: newly.map(r => r.id), targetReason: t.reason};
    if (!okBase.has(d.target)) res.note = '바탕에서 대상 시험이 통과하지 않아 셀 수 없음';
    if (NOTES[d.id]) res.note = NOTES[d.id];
    results.push(res);
  }
  const probeResults = [];
  for (const p of PROBES) {
    const {F, O} = BASES[p.base]();
    p.apply(F, O);
    const rs = await run(F, O);
    const okBase = passOn(p.base);
    const newly = rs.filter(r => okBase.has(r.id) && !r.pass);
    const pr = {id: p.id, near: p.near, contested: p.contested, falseAlarm: newly.length > 0, newlyFailed: newly.map(r => ({id: r.id, reason: r.reason}))};
    if (NOTES[p.id]) pr.note = NOTES[p.id];
    probeResults.push(pr);
  }
  const byCheck = {};
  for (const r of results) {
    const b = (byCheck[r.target] ??= {planted: 0, caught: 0, strictPlanted: 0, strictCaught: 0});
    b.planted++;
    if (r.caught) b.caught++;
    if (!r.contested) { b.strictPlanted++; if (r.caught) b.strictCaught++; }
  }
  const strictR = results.filter(r => !r.contested);
  doc.results = results;
  doc.probeResults = probeResults;
  doc.summary = {
    total: results.length,
    caught: results.filter(r => r.caught).length,
    missed: results.filter(r => !r.caught).length,
    strict: {total: strictR.length, caught: strictR.filter(r => r.caught).length, missed: strictR.filter(r => !r.caught).length},
    falseAlarms: probeResults.filter(p => p.falseAlarm).length,
    falseAlarmsStrict: probeResults.filter(p => p.falseAlarm && !p.contested).length,
    probes: probeResults.length,
    byCheck: Object.fromEntries(Object.entries(byCheck).sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))),
    missedStrict: strictR.filter(r => !r.caught).map(r => r.id),
  };
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
  const s = doc.summary;
  console.log(`흠 ${s.total} · 잡음 ${s.caught} · 놓침 ${s.missed} | 엄격 ${s.strict.total} · 잡음 ${s.strict.caught} · 놓침 ${s.strict.missed} | 헛잡음 ${s.falseAlarms}/${s.probes}`);
}

await main();

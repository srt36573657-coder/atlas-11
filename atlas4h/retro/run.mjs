#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 0판 · 재현(지난 기록으로 다시 돌리기)
 *
 *   node atlas4h/retro/run.mjs [--slot 16|08] [--end 2026-09-30] [--days 120] [--input FILE] [--history DIR] [--atlas11 FILE]
 *                               [--out FILE] [--summary FILE] [--dry]
 *
 *   16시 판: 출발일 t 16:00 KST 봉인(그날 15:30 종가 뒤) → 목표 = 다음 거래일 종가. 기본 쓰는 곳 atlas4h/retro/result.json · summary.md
 *   08시 판: 목표일 t 08:00 KST 봉인 · 출발값 = 앞 거래일(t−1) 종가 · 목표 = t 종가. 기본 쓰는 곳 atlas4h/retro/result-08.json · summary-08.md
 *   --end 는 마지막 출발일(기본 2026-09-30) · 출발일 120개 → 목표일 2026-04-07 … 2026-10-01 (두 판 시각 모두 같은 목표일)
 *   --history 지난 자료 폴더(기본 atlas4h/data/history · kospi.json·sox.json) · --atlas11 ATLAS 11 후향 파일(기본 atlas4h/baselines/atlas11-v1-retro.json)
 *
 * 출발일마다 그날 종가까지의 자료만으로 판을 짓고(누수 없음 · HAR 맞춤은 1거래일 엠바고), 목표일 종가로 채점한다.
 * 판정 규칙은 봉인된 judgment.json·judgment-2.json 그대로:
 *   같은 시각 판끼리만 · 실력 = 1 − (내 평균 ÷ 기준 평균) · DM 한쪽 p < 0.05 를 lag 0 과 5 둘 다(판 하나 = 52종목 평균 벌점 한 점)
 *   · 같은 시각 판 30개 미만이면 「아직 모름」 · 실력 ≤ 0 이면 「앞 판으로」
 * 결과: rows = 52종목 줄만(잠긴 T12 가 줄마다 기준 셋을 요구) · kospiRows = 코스피 줄(기준 둘 · judgment units.kospi)
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dmTest, kupiecLR, mean} from '../spec/stats.mjs';
import {CHECKS} from '../spec/checks.mjs';
import {buildInputs, buildBoard} from '../engine/board.mjs';
import {isoKst, nextSession} from '../engine/clock.mjs';
import {loadHistories, fileSha256, HISTORY_DIR} from '../engine/history.mjs';
import {gitState} from '../engine/run.mjs';
import {scoreBoard, loadAtlas11Retro, ATLAS11_RETRO_FILE, NOTE_A11_EARLY, NOTE_TRANSFER_EARLY, NONE} from '../score/score.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
export const BASELINE_IDS = ['무판', '단순 전이식', 'ATLAS 11'];
export const SCENARIO_RULE = 'k = 0.5·σ̂(다음 날 흔들림) · 위 = [출발값·e^k, max(p95, 출발값·e^k)] · 가운데 = [출발값·e^−k, 출발값·e^k] · 아래 = [min(p05, 출발값·e^−k), 출발값·e^−k] · 확률 = 같은 잔차 분포에서 +k 위·사이·−k 아래 몫(합 1 · 범위 끝은 같은 분포의 5%·95% 분위수)';
export const KOSPI_BASELINE_IDS = ['무판', '단순 전이식'];

const r4 = x => (Number.isFinite(x) ? Math.round(x * 1e4) / 1e4 : null);
const r6 = x => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);
const sig = x => (Number.isFinite(x) ? Number(x.toPrecision(4)) : null); // p 값은 유효숫자 넷 (아주 작은 p 를 0 으로 뭉개지 않게)

/** 이 결과를 낸 코드 파일의 sha256 (커밋 전 실행이어도 내용으로 맞대어 볼 수 있게) */
function codeFiles() {
  const files = ['atlas4h/engine/har.mjs', 'atlas4h/engine/dist.mjs', 'atlas4h/engine/constants.mjs', 'atlas4h/engine/clock.mjs', 'atlas4h/engine/history.mjs',
    'atlas4h/engine/board.mjs', 'atlas4h/engine/run.mjs', 'atlas4h/score/score.mjs', 'atlas4h/retro/run.mjs'];
  return Object.fromEntries(files.map(f => [f, fileSha256(fs.readFileSync(path.join(ROOT, f)))]));
}

export function verdictOf(skill, pLag0, pLag5, boards) {
  if (!(boards >= 30)) return '아직 모름';
  if (!(skill > 0)) return '앞 판으로';
  if (pLag0 !== null && pLag5 !== null && pLag0 < 0.05 && pLag5 < 0.05) return '실력';
  return '아직 모름';
}

const baseOf = (r, id) => r.baselines.find(b => b.id === id);

/** 판 하나 = 한 점(그 판에서 두 점수가 다 있는 줄의 평균) · 목표일 순 */
function boardPoints(rows, pickE, pickB) {
  const by = new Map();
  for (const r of rows) {
    if (!by.has(r.boardId)) by.set(r.boardId, {target: r.target, e: [], b: []});
    const g = by.get(r.boardId);
    g.e.push(pickE(r));
    g.b.push(pickB(r));
  }
  const pts = [...by.values()].sort((a, b) => a.target.localeCompare(b.target));
  return {e: pts.map(p => mean(p.e)), b: pts.map(p => mean(p.b))};
}

/**
 * 한 기준과 견주기 (구간 점수) — 같은 줄 묶음의 평균 비율 · DM lag 0·5 (판 단위) · 잠긴 T12 꼴의 줄 단위 DM(참고)
 *   scale 'raw'(원·지수 포인트) 또는 'pct'(출발값의 %)
 */
export function compare(rows, baseId, scale = 'raw') {
  const val = (r, s) => (scale === 'pct' ? (s / r.anchor) * 100 : s);
  const usable = rows.filter(r => Number.isFinite(baseOf(r, baseId)?.interval) && baseOf(r, baseId)?.note !== NONE);
  if (!usable.length) return {id: baseId, scale, none: true};
  const pickE = r => val(r, r.interval.score);
  const pickB = r => val(r, baseOf(r, baseId).interval);
  const meanE = mean(usable.map(pickE));
  const meanB = mean(usable.map(pickB));
  const skill = 1 - meanE / meanB;
  const pts = boardPoints(usable, pickE, pickB);
  const dm0 = dmTest(pts.b, pts.e, {lag: 0});
  const dm5 = dmTest(pts.b, pts.e, {lag: 5});
  // 잠긴 T12 꼴(참고): 줄 단위 · 목표일·판 순 · lag = 목표일마다 줄 수 − 1
  const sorted = [...usable].sort((a, b) => String(a.target).localeCompare(String(b.target)) || String(a.boardId).localeCompare(String(b.boardId)));
  const perTarget = new Map();
  for (const r of sorted) perTarget.set(r.target, (perTarget.get(r.target) ?? 0) + 1);
  const rowLag = Math.max(0, Math.max(...perTarget.values()) - 1);
  const dmRow = dmTest(sorted.map(pickB), sorted.map(pickE), {lag: rowLag});
  return {
    id: baseId, scale, rows: usable.length, boards: pts.e.length,
    meanEngine: r6(meanE), meanBaseline: r6(meanB), skill: r6(skill),
    dm: {lag0: {stat: r4(dm0.stat), p: sig(dm0.p)}, lag5: {stat: r4(dm5.stat), p: sig(dm5.p)}},
    verdict: verdictOf(skill, dm0.p, dm5.p, pts.e.length),
    rowLevelDm: {what: '잠긴 T12 꼴 참고 — 줄 단위, lag = 목표일마다 줄 수 − 1 (판정에 안 씀)', lag: rowLag, stat: r4(dmRow.stat), p: sig(dmRow.p)},
  };
}

/** 덮음(80% 범위) + Kupiec — 엔진 또는 기준 */
function coverage(rows, who) {
  const xs = rows.map(r => (who === 'engine' ? r.interval.covered : baseOf(r, who)?.covered)).filter(x => typeof x === 'boolean');
  if (!xs.length) return {none: true};
  const hit = xs.filter(Boolean).length;
  const k = kupiecLR(xs.length - hit, xs.length, 0.2);
  return {covered: hit, of: xs.length, share: r6(hit / xs.length), kupiecP: sig(k.p)};
}

/** 평균 점수 (엔진 vs 기준) — 둘 다 있는 줄만 */
function meanPair(rows, who, field) {
  const pick = r => (field === 'crps' ? r.crps : r.brier.score);
  const usable = rows.filter(r => Number.isFinite(pick(r)) && Number.isFinite(baseOf(r, who)?.[field]));
  if (!usable.length) return {none: true};
  return {rows: usable.length, engine: r6(mean(usable.map(pick))), baseline: r6(mean(usable.map(r => baseOf(r, who)[field])))};
}

/** 「없음」 까닭 모음 (같은 까닭은 한 번 · 줄 수) */
function noneReasons(rawLines, id) {
  const m = new Map();
  for (const l of rawLines) {
    const b = baseOf(l, id);
    if (b?.note === NONE) m.set(b.why, (m.get(b.why) ?? 0) + 1);
  }
  return [...m.entries()].map(([why, n]) => ({why, rows: n}));
}

function unitSummary(rows, rawLines, ids) {
  const out = {rows: rows.length, coverage80: {engine: coverage(rows, 'engine')}, vs: {}, crps: {}, brier: {}};
  for (const id of ids) {
    out.vs[id] = {raw: compare(rows, id, 'raw'), pct: compare(rows, id, 'pct'), none: noneReasons(rawLines, id)};
    out.coverage80[id] = coverage(rows, id);
    out.crps[id] = meanPair(rows, id, 'crps');
    out.brier[id] = meanPair(rows, id, 'brier');
  }
  const crisisRows = rows.filter(r => r.crisis === true);
  const known = rows.filter(r => r.crisis === true || r.crisis === false).length;
  out.crisis = known
    ? {days: [...new Set(crisisRows.map(r => r.target))].length, rows: crisisRows.length, engine: coverage(crisisRows, 'engine'),
      ...Object.fromEntries(ids.map(id => [id, coverage(crisisRows, id)]))}
    : {none: true, why: rawLines.find(l => l.crisisWhy)?.crisisWhy ?? '위기 날을 못 셈'};
  return out;
}

function slimBaseline(b) {
  if (b.note === NONE) return {id: b.id, crps: null, interval: null, brier: null, note: NONE};
  const keep = {id: b.id, crps: b.crps ?? null, interval: b.interval, covered: b.covered, brier: b.brier ?? null};
  for (const k of ['s', 'c', 'session', 'note', 'label', 'crpsNote']) if (b[k] !== undefined && b[k] !== null) keep[k] = b[k];
  return keep;
}

function slimRow(l, origin) {
  return {
    boardId: l.boardId, code: l.code, origin, target: l.target, scoredAt: l.scoredAt, anchor: l.anchor,
    actual: {value: l.actual.value, asOf: l.actual.asOf},
    crps: l.crps, interval: l.interval, brier: {o: l.brier.o, score: l.brier.score},
    baselines: l.baselines.map(slimBaseline),
    crisis: l.crisis,
  };
}

export function run({slot = '16', end = '2026-09-30', days = 120, inputFile = path.join(ROOT, 'public/data/input.json'), historyDir = path.join(ROOT, HISTORY_DIR),
  atlas11File = path.join(ROOT, ATLAS11_RETRO_FILE), out = null, summary = null, now = isoKst(Date.now()), write = true, git = gitState()} = {}) {
  if (!['08', '16'].includes(slot)) throw new Error(`재현 판 시각은 08 또는 16: ${slot}`);
  const outFile = out ?? path.join(HERE, slot === '16' ? 'result.json' : `result-${slot}.json`);
  const summaryFile = summary ?? path.join(HERE, slot === '16' ? 'summary.md' : `summary-${slot}.md`);
  const buf = fs.readFileSync(inputFile);
  const input = JSON.parse(buf.toString('utf8'));
  const inputRel = path.relative(ROOT, path.resolve(inputFile)).split(path.sep).join('/');
  const histories = loadHistories(historyDir, ['kospi', 'sox'], ROOT);
  const a11 = slot === '08' ? loadAtlas11Retro(atlas11File) : {none: true, why: NOTE_A11_EARLY};
  const fileHashes = {[inputRel]: fileSha256(buf)};
  if (!histories.kospi.none) fileHashes[histories.kospi.file] = histories.kospi.sha256;
  const sessions = input.calendar.sessions;
  const origins = sessions.filter(s => s <= end).slice(-days);
  const rawLines = [];
  const rawKospi = [];
  const rows = [];
  const kospiRows = [];
  const boards = [];
  for (const origin of origins) {
    const target = nextSession(sessions, origin);
    const slotDate = slot === '16' ? origin : target; // 08시 판의 판 날짜 = 목표일(그날 아침)
    const at = `${slotDate}T${slot}:00:00+09:00`; // 재현 판의 봉인 시각(흉내)
    const inputs = buildInputs(input, {asof: origin, at, histories});
    const files = [inputRel, ...(inputs.variables[0].value !== null ? [histories.kospi.file] : [])];
    const seed = Number(slotDate.replaceAll('-', '')) * 100 + Number(slot);
    const board = buildBoard({inputs, seed, slot, kind: '무거운', createdAt: at, sealedAt: at, target,
      commit: git.commit, dirty: git.dirty, files, fileHashes, retro: true, slotDate});
    const {lines, kospiLine} = scoreBoard(board, input, {scoredAt: now, histories, atlas11Retro: slot === '08' ? a11 : null});
    boards.push({id: board.id, origin, target, sealedAt: at, stocks: board.stocks.filter(s => s.center !== null).length, scored: lines.length,
      kospi: board.kospi ? '있음' : '없음', bytes: Buffer.byteLength(JSON.stringify(board))});
    for (const l of lines) {
      rawLines.push(l);
      rows.push(slimRow(l, origin));
    }
    if (kospiLine) {
      rawKospi.push(kospiLine);
      kospiRows.push(slimRow(kospiLine, origin));
    }
  }
  const stocks = unitSummary(rows, rawLines, BASELINE_IDS);
  const kospi = kospiRows.length ? unitSummary(kospiRows, rawKospi, KOSPI_BASELINE_IDS)
    : {none: true, why: histories.kospi.none ? histories.kospi.why : '코스피 채점 줄 없음 (목표일 코스피 종가 없음)'};
  const result = {
    schema: 'atlas4h-retro-1',
    slot,
    createdAt: now,
    engine: 'atlas4h-engine-0 (가운데 = 무판 · 폭 = HAR 밑값 3층 · 걸러낸 지난 기록 · 좌우 따로 · 작은 판: 상수 + 지금 변수)',
    code: {...git, filesNote: '코드 판은 실행 때의 HEAD — 아래 파일 지문이 이 결과를 낸 코드 그대로', files: codeFiles()},
    data: {
      files: fileHashes,
      sox: histories.sox.none ? {none: true, why: histories.sox.why} : {file: histories.sox.file, sha256: histories.sox.sha256},
      kospi: histories.kospi.none ? {none: true, why: histories.kospi.why} : {file: histories.kospi.file, sha256: histories.kospi.sha256},
      atlas11: a11.none ? {none: true, why: a11.why} : {file: path.relative(ROOT, atlas11File), label: a11.label, rows: a11.rows},
      note: '종목 종가 NAVER 한 출처 · 기업행위 조정 미확인 (input.json priceSource·priceBasisReview)',
    },
    judgment: ['atlas4h/seal/judgment.json', 'atlas4h/seal/judgment-2.json'],
    seal: slot === '16' ? '출발일 16:00 KST (그날 15:30 종가 뒤)' : '목표일 08:00 KST (앞 거래일 15:30 종가 뒤 · 밤사이 미국 장 마감 뒤)',
    leakage: '출발일 종가까지의 자료만 · HAR 맞춤 줄은 1거래일 엠바고 · 1일 앞 목표라 겹치는 관측(정화 대상) 없음 · 반도체지수는 봉인 시각 전에 마감한 미국 장만 · ATLAS 11 은 봉인 전 발행분만',
    slot12: '12시 판은 재현하지 않음 (judgment-2: 12시 판 단순 전이식 「없음」)',
    scenarioRule: SCENARIO_RULE,
    summary: {
      slot,
      origins: {first: origins[0], last: origins.at(-1), count: origins.length},
      targets: {first: nextSession(sessions, origins[0]), last: nextSession(sessions, origins.at(-1)), count: origins.length},
      boards: boards.length,
      boardBytes: {max: Math.max(...boards.map(b => b.bytes)), mean: Math.round(mean(boards.map(b => b.bytes)))},
      stocks,
      kospi,
    },
    boards,
    rows,
    kospiRows,
  };
  // 잠긴 사양 T12 가 이 결과를 어떻게 읽는가 (읽기만)
  const t12 = CHECKS.T12({retro: result});
  result.summary.t12 = {pass: t12.pass, reason: t12.reason, counts: t12.counts};
  if (write) {
    fs.writeFileSync(outFile, `${JSON.stringify(result)}\n`);
    fs.writeFileSync(summaryFile, summaryMd(result, {outFile, summaryFile}));
  }
  return result;
}

const pct = x => (Number.isFinite(x) ? `${(x * 100).toFixed(1)}%` : '없음');
const num = (x, d = 1) => (Number.isFinite(x) ? x.toLocaleString('en-US', {maximumFractionDigits: d, minimumFractionDigits: d}) : '없음');
const pv = x => (Number.isFinite(x) ? (x < 0.001 ? x.toExponential(1) : x.toFixed(3)) : '없음');

function vsLine(name, v, d = 1) {
  if (!v || v.none) return `| ${name} | 없음 | 없음 | 없음 | 없음 | 없음 | 잴 수 없음 |`;
  return `| ${name} | ${num(v.meanEngine, d)} | ${num(v.meanBaseline, d)} | ${num(v.skill * 100, 2)}% | ${pv(v.dm.lag0.p)} | ${pv(v.dm.lag5.p)} | ${v.verdict} |`;
}

function covText(c) {
  return c && !c.none ? `${pct(c.share)} (${c.covered}/${c.of}) · Kupiec p ${pv(c.kupiecP)}` : '없음';
}

function unitMd(lines, u, ids, unitName, scaleName) {
  lines.push('| 기준 | 엔진 평균 구간 점수 | 기준 평균 | 실력(1 − 비율) | DM p (lag 0) | DM p (lag 5) | 판정 |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const id of ids) lines.push(vsLine(`${id} (${scaleName})`, u.vs[id].raw));
  for (const id of ids) lines.push(vsLine(`${id} (출발값의 %, 곁 확인)`, u.vs[id].pct, 3));
  lines.push('');
  lines.push(`- DM 은 같은 시각 판 하나를 한 점으로 셌습니다(${unitName}). 판정은 lag 0 과 lag 5 가 모두 p < 0.05 이고 실력 > 0 일 때만 「실력」입니다.`);
  for (const id of ids) {
    const v = u.vs[id].raw;
    if (!v.none) lines.push(`- 참고(판정에 안 씀) · 잠긴 T12 꼴 줄 단위 DM — ${id}: lag ${v.rowLevelDm.lag} · p ${pv(v.rowLevelDm.p)} (줄 ${v.rows}개).`);
  }
  lines.push(`- 80% 범위 덮음: 엔진 ${covText(u.coverage80.engine)}${ids.map(id => ` · ${id} ${covText(u.coverage80[id])}`).join('')}.`);
  for (const id of ids) {
    const c = u.crps[id];
    const b = u.brier[id];
    lines.push(`- ${id}과 견준 CRPS 평균: ${c.none ? '없음' : `엔진 ${num(c.engine)} · ${id} ${num(c.baseline)}`} · 브라이어 평균: ${b.none ? '없음' : `엔진 ${pv(b.engine)} · ${id} ${pv(b.baseline)}`}.`);
  }
  if (u.crisis.none) lines.push(`- 위기 날 덮음: 없음 — ${u.crisis.why}.`);
  else lines.push(`- 위기 날(코스피 하루 변화 상위 10%) ${u.crisis.days}일 · 줄 ${u.crisis.rows}개 덮음: 엔진 ${covText(u.crisis.engine)}${ids.map(id => ` · ${id} ${covText(u.crisis[id])}`).join('')}.`);
}

export function summaryMd(result, {outFile = null} = {}) {
  const s = result.summary;
  const st = s.stocks;
  const ids = BASELINE_IDS;
  const lines = [];
  const slotName = `${result.slot}시 판`;
  lines.push(`# ATLAS 4시간 엔진 0판 · 재현 결과 (${slotName})`);
  lines.push('');
  lines.push(`- 만든 때: ${result.createdAt} · 코드 ${result.code.commit ?? '없음'}${result.code.dirty ? ' (커밋 안 된 바뀜 있음)' : ''} · 결과 파일 \`${outFile ? path.relative(ROOT, outFile) : '없음'}\``);
  lines.push(`- 봉인(흉내): ${result.seal} · 출발일 ${s.origins.first} ~ ${s.origins.last} · 목표일 ${s.targets.first} ~ ${s.targets.last} · 판 ${s.boards}개 · 종목 줄 ${st.rows}개 · 코스피 줄 ${result.kospiRows.length}개`);
  lines.push('- 엔진: 가운데 = 마지막 종가 그대로(무판) · 폭 = HAR(어제·5일·22일 흔들림) · 지난 잔차로 분포(좌우 따로) — 방법은 0판 그대로');
  lines.push(`- 판 크기: 가장 큰 판 ${num(s.boardBytes.max / 1024, 1)} KB · 평균 ${num(s.boardBytes.mean / 1024, 1)} KB (지난 등락 목록 대신 상수만 실음)`);
  lines.push('- 판정 규칙: 봉인된 `atlas4h/seal/judgment.json`·`judgment-2.json` 그대로 (실력 = 1 − 평균의 비율 · DM 한쪽 p < 0.05 를 lag 0·5 둘 다 · 같은 시각 판 30개 미만이면 「아직 모름」)');
  lines.push('');
  lines.push('## 1. 결론');
  lines.push('');
  const verdicts = ids.map(id => `${id} 「${st.vs[id].raw.none ? '잴 수 없음' : st.vs[id].raw.verdict}」`).join(' · ');
  lines.push(`1. 잠긴 시험 T12: **${s.t12.pass ? '통과' : '안 통과'}** — 「${s.t12.reason}」`);
  lines.push(`2. 52종목 80% 범위 점수 판정(판 단위 DM): ${verdicts}.`);
  for (const id of ids) {
    const v = st.vs[id].raw;
    if (v.none) lines.push(`${lines.filter(l => /^\d+\. /.test(l)).length + 1}. ${id}: 점수 없음 — ${st.vs[id].none.map(x => `${x.why} (${x.rows}줄)`).join(' · ') || '까닭 모름'}.`);
    else lines.push(`${lines.filter(l => /^\d+\. /.test(l)).length + 1}. ${id}과 견줌: 엔진 평균 ${num(v.meanEngine)} · ${id} 평균 ${num(v.meanBaseline)} (원) → 실력 ${num(v.skill * 100, 2)}% · DM p ${pv(v.dm.lag0.p)}(lag 0) · ${pv(v.dm.lag5.p)}(lag 5) · 판 ${v.boards}개 · 줄 ${v.rows}개.`);
  }
  lines.push(`${lines.filter(l => /^\d+\. /.test(l)).length + 1}. 80% 범위가 실제로 덮은 몫: 엔진 ${covText(st.coverage80.engine)} (통과 폭 70~90%). Kupiec 는 줄을 서로 따로 본 값이라, 같은 날 종목끼리 함께 움직이는 만큼 p 가 지나치게 작게 나옵니다.`);
  lines.push(`${lines.filter(l => /^\d+\. /.test(l)).length + 1}. 코스피: ${s.kospi.none ? `없음 — ${s.kospi.why}` : KOSPI_BASELINE_IDS.map(id => `${id} 「${s.kospi.vs[id].raw.none ? '잴 수 없음' : s.kospi.vs[id].raw.verdict}」`).join(' · ')}.`);
  if (st.vs['ATLAS 11'].raw && !st.vs['ATLAS 11'].raw.none && result.data.atlas11.label) lines.push(`${lines.filter(l => /^\d+\. /.test(l)).length + 1}. ATLAS 11 기준값은 「${result.data.atlas11.label}」입니다 — 그때 실제로 나온 발행본이 아니라 같은 방법·같은 난수로 나중에 다시 만든 값입니다.`);
  lines.push('');
  lines.push('## 2. 52종목 · 기준마다');
  lines.push('');
  unitMd(lines, st, ids, '52종목 평균 벌점', '원 단위');
  lines.push('');
  lines.push('## 3. 코스피 (기준 둘 · judgment units.kospi)');
  lines.push('');
  if (s.kospi.none) lines.push(`- 없음 — ${s.kospi.why}.`);
  else unitMd(lines, s.kospi, KOSPI_BASELINE_IDS, '코스피 한 줄', '지수 포인트');
  lines.push('');
  lines.push('## 4. 「없음」과 쪽지');
  lines.push('');
  for (const id of ids) {
    const n = st.vs[id].none;
    if (n.length) lines.push(`- ${id} 「없음」: ${n.map(x => `${x.why} (${x.rows}줄)`).join(' · ')}.`);
  }
  if (!ids.some(id => st.vs[id].none.length)) lines.push('- 52종목 줄에서 「없음」인 기준 점수는 0줄입니다.');
  const usClosed = result.rows.filter(r => baseOf(r, '단순 전이식')?.note && baseOf(r, '단순 전이식').note !== NONE);
  if (usClosed.length) lines.push(`- 단순 전이식 쪽지: ${[...new Set(usClosed.map(r => `${r.target} ${baseOf(r, '단순 전이식').note}`))].join(' · ')}.`);
  if (result.slot === '16') lines.push(`- 16시 판에서 단순 전이식은 「${NOTE_TRANSFER_EARLY}」, ATLAS 11 은 「${NOTE_A11_EARLY}」라 견줄 수 없습니다. 기준 셋을 모두 견주는 재현은 08시 판입니다.`);
  lines.push('');
  lines.push('## 5. 정해 둔 해석 [판단] · 누수 막기');
  lines.push('');
  lines.push('- [판단] 단순 전이식: s = 반도체지수 종가 → 종가 등락(%) 중 미국 장 마감(뉴욕 16:00, 서머타임이면 05:00 KST · 아니면 06:00 KST)이 앞 한국 장 마감(15:30) 뒤·봉인 앞인 장의 것. 여럿이면 가장 늦은 하나 · 없으면(미국 휴장) s = 0 · 갭 = 0.20 + 0.31·s · 장중 = 0.27·갭 · 분위수 = 출발값 × (1 + (갭 + 장중)/100) × (1 + 무판의 경험 변화율 분위수).');
  lines.push('- [판단] ATLAS 11: 후향 파일에서 목표일·종목이 같고 출발일이 판의 출발일인 줄 · 구간은 p10·p90 · 브라이어는 오름·보합·내림 확률 · CRPS 는 분위수 7개라 「없음」.');
  lines.push('- [판단] 위기 날: 목표일 코스피 하루 변화 크기 ≥ 봉인 때 지난 250거래일 하루 변화 크기의 90% 분위수.');
  lines.push(`- [판단] 코스피·종목 세 시나리오 경계: ${SCENARIO_RULE}.`);
  lines.push(`- 누수: ${result.leakage}.`);
  lines.push('');
  lines.push('## 6. 일반인 눈높이 설명');
  lines.push('');
  lines.push(`지난 ${s.origins.count}거래일 동안 매일 ${result.slot === '08' ? '아침 8시에' : '오후 4시에'} 「다음 종가는 마지막 종가 근처, 이만큼 흔들린다」는 판을 다시 만들어 채점했습니다. 같은 날의 세 가지 비교 상대(값이 그대로라고 보는 판, 밤사이 미국 반도체지수로 미는 판, ATLAS 11)와 범위 점수를 견줘, 낮을수록 좋은 점수에서 엔진이 이겼는지 봉인된 규칙대로 가렸습니다. 숫자가 없는 것은 「없음」으로 두었습니다.`);
  lines.push('');
  return lines.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slot') o.slot = String(argv[++i]).padStart(2, '0');
    else if (argv[i] === '--end') o.end = argv[++i];
    else if (argv[i] === '--days') o.days = Number(argv[++i]);
    else if (argv[i] === '--input') o.inputFile = argv[++i];
    else if (argv[i] === '--history') o.historyDir = argv[++i];
    else if (argv[i] === '--atlas11') o.atlas11File = argv[++i];
    else if (argv[i] === '--out') o.out = argv[++i];
    else if (argv[i] === '--summary') o.summary = argv[++i];
    else if (argv[i] === '--dry') o.write = false;
    else {
      console.error(`모르는 칸: ${argv[i]}`);
      process.exit(1);
    }
  }
  const r = run(o);
  const s = r.summary;
  const brief = u => (u.none ? u : {rows: u.rows, coverage80: u.coverage80, vs: Object.fromEntries(Object.entries(u.vs).map(([k, v]) => [k, v.raw.none ? '없음' : {meanEngine: v.raw.meanEngine, meanBaseline: v.raw.meanBaseline, skill: v.raw.skill, p0: v.raw.dm.lag0.p, p5: v.raw.dm.lag5.p, verdict: v.raw.verdict}]))});
  console.log(JSON.stringify({slot: s.slot, boards: s.boards, boardBytes: s.boardBytes, stocks: brief(s.stocks), kospi: brief(s.kospi), t12: s.t12}, null, 1));
}

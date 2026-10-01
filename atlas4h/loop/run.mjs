#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 3단계 「4시간 고리」 한 바퀴 (명령문 <고리> 그대로의 순서)
 *
 *   node atlas4h/loop/run.mjs [--slot auto|00|04|08|12|16|20] [--root DIR] [--now ISO] [--fixtures DIR] [--stop true|false]
 *
 *   모으기(이 스크립트 앞에서 collect.mjs --mode now 가 지금 값 한 장을 씀) → 검사 → 가운데·폭 엔진
 *   → 사건 확률(「없음」 · 5단계) → 섞기·범위 → 시나리오 → 합치기·반론(「없음」 · 5단계) → 봉인·적용 → 기록
 *
 *   --slot     auto = 지금(한국 시각)보다 늦지 않은 가장 늦은 판 시각 · 숫자를 주면 그 시각의 가장 늦은 때
 *   --root     저장소 뿌리(기본 이 파일의 두 칸 위). 장부는 <root>/atlas4h/ledger/ 에만 덧붙인다(고치지 않음)
 *   --now      지금 시각(시험·흉내용). 주면 모든 시각을 이것으로 센다
 *   --fixtures 지금 값 한 장(atlas4h-inputs-1)을 <root>/atlas4h/ledger/inputs 대신 이 폴더에서 읽는다(시험·흉내용)
 *   --stop     true 면 멈춤 단추(사장님 「멈춰」) — 그림자 운전. atlas4h/harness/stop.json {"stop": true} 도 같다
 *
 * 쓰는 곳(덧붙이기만): ledger/boards · seals · baselines · scores · loops (모두 <한국 날짜>.jsonl)
 * 읽기만: public/data/input.json · public/data/rolling-calendar.json · public/data/atlas11/forecast.json (ATLAS 11 — 고치지 않음)
 * 화면 파일은 건드리지 않는다: 6단계(화면 올리기)가 아직 없어서 모든 바퀴가 「그림자」다.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalJson, sha256, STATUS_SEALED, STATUS_KEEP, STATUS_RESEAL, FORBIDDEN} from '../spec/checks.mjs';
import {buildInputs, buildBoard, sealRecord} from '../engine/board.mjs';
import {isoKst, prevSession, KST} from '../engine/clock.mjs';
import {loadHistory, changesUpTo, fileSha256, HISTORY_DIR} from '../engine/history.mjs';
import {gitState} from '../engine/run.mjs';
import {
  noChangeBaseline, transferFor, transferBaseline, loadAtlas11, atlas11Band, crisisOf, stockChangesUpTo,
  crpsFromQuantiles, brier3, outcomeOf, q19Of, ALPHA, NONE, NOTE_A11_EARLY,
} from '../score/score.mjs';
import {intervalScore} from '../spec/stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '..', '..');
export const SLOTS = ['00', '04', '08', '12', '16', '20'];
export const HEAVY = ['08', '16'];
export const LIMIT_MINUTES = 40;
export const MODE_SHADOW = '그림자';
export const LOOP_BY = '고리 스크립트';
export const NOT_YET = '없음 — 5단계에서 붙임';
const HOUR = 3600e3;
const MIN = 60e3;

// ───────────── 시각 ─────────────
const kstDay = ms => isoKst(ms).slice(0, 10);
const kstHour = ms => Number(isoKst(ms).slice(11, 13));
const closeMs = d => Date.parse(`${d}T15:30:00${KST}`);

/** 판 시각 고르기 — auto: 지금보다 늦지 않은 가장 늦은 판 시각 · 숫자: 그 시각 중 지금보다 늦지 않은 가장 늦은 때 */
export function slotOf(nowMs, want = 'auto') {
  const day = kstDay(nowMs);
  if (want === 'auto' || want === undefined || want === null || want === '') {
    const slot = String(Math.floor(kstHour(nowMs) / 4) * 4).padStart(2, '0');
    return {slot, slotDate: day, slotAt: `${day}T${slot}:00:00${KST}`};
  }
  const slot = String(want).padStart(2, '0');
  if (!SLOTS.includes(slot)) throw new Error(`slot 은 auto 또는 00·04·08·12·16·20: ${want}`);
  let at = Date.parse(`${day}T${slot}:00:00${KST}`);
  if (at > nowMs) at -= 24 * HOUR;
  return {slot, slotDate: kstDay(at), slotAt: isoKst(at)};
}

/**
 * 출발일·목표일 — board.md 「봉인 뒤 첫 종가」 그대로:
 *   출발일 = 15:30 종가가 판 시각 이전에 난 마지막 거래일 · 목표일 = 15:30 종가가 판 시각 뒤에 나는 첫 거래일
 * 00·04·08·16·20시는 clock.mjs slotPlan 과 같다. [판단] 12시 판은 slotPlan 의 [미결](출발 = 그날 · 목표 = 다음 날) 대신
 * 「봉인 뒤 첫 종가」 = 그날 종가를 목표로 둔다 — 장중 값은 수집기가 「확인 중」으로 두어 못 쓰므로 출발값은 앞 거래일 종가다.
 * 쉬는 날(주말·휴장)도 같은 규칙: 출발 = 앞 거래일 · 목표 = 다음 거래일.
 */
export function planAt(sessions, slotAt) {
  const t = Date.parse(slotAt);
  let anchorDate = null;
  let target = null;
  for (const s of sessions) {
    if (closeMs(s) <= t) anchorDate = s;
    else if (!target) target = s;
  }
  return {anchorDate, target};
}

// ───────────── 지금 값 한 장 (atlas4h-inputs-1) ─────────────
/** 장 한 장 = {file(뿌리 기준), sha256, doc} · 이름 = YYYY-MM-DDTHH-mm(.json) 한국 시각 */
export function listSnapshots(dir) {
  try {
    return fs.readdirSync(dir).filter(n => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}(-\d+)?\.json$/.test(n)).sort();
  } catch {
    return [];
  }
}
function readSnapshot(dir, name, root) {
  const abs = path.join(dir, name);
  const buf = fs.readFileSync(abs);
  const doc = JSON.parse(buf.toString('utf8'));
  if (doc?.schema !== 'atlas4h-inputs-1' || !Array.isArray(doc.variables)) return null;
  return {file: path.relative(root, abs).split(path.sep).join('/'), sha256: fileSha256(buf), doc, at: Date.parse(doc.at)};
}
/** 이 바퀴의 장 — 판 시각 30분 앞부터 지금까지 받은 것 중 가장 늦은 것 (없으면 null: 모으기 실패) */
export function turnSnapshot(dir, slotAtMs, nowMs, root) {
  const names = listSnapshots(dir).reverse();
  for (const n of names) {
    const s = readSnapshot(dir, n, root);
    if (!s || !Number.isFinite(s.at)) continue;
    if (s.at > nowMs) continue;
    if (s.at < slotAtMs - 30 * MIN) return null;
    return s;
  }
  return null;
}
/** from 날짜(그날 포함) 뒤에 받은 장 모두 (지금 이하) — 지난 종가를 장에서 다시 모을 때 */
export function snapshotsSince(dir, fromDate, nowMs, root) {
  const out = [];
  for (const n of listSnapshots(dir)) {
    if (n.slice(0, 10) < fromDate) continue;
    const s = readSnapshot(dir, n, root);
    if (s && Number.isFinite(s.at) && s.at <= nowMs) out.push(s);
  }
  return out;
}

/**
 * 종가로 쓸 수 있는 값인가 (자료 약속 · 수집기 표시 그대로):
 *   「ok」·「한 출처」 → 쓴다 · 「확인 중」·「없음」 → 안 쓴다(짐작하지 않음)
 *   「옛값」 → [판단] 표시에 「장 닫힘」이 있고 「끊김」·「확인 중」이 없으면 쓴다 — 4시간이 지난 15:30 종가일 뿐 값은 그대로다
 *   그리고 값의 관측 시각이 정확히 그날 15:30 KST(종가 단일가 봉)여야 한다 — 장중 값은 종가가 아니다
 */
export function closeUsable(v, date) {
  if (!v || !(typeof v.value === 'number' && Number.isFinite(v.value) && v.value > 0)) return false;
  if (Date.parse(v.observedAt) !== closeMs(date)) return false;
  const marks = Array.isArray(v.marks) ? v.marks : [];
  if (v.status === 'ok' || v.status === '한 출처') return !marks.includes('확인 중');
  if (v.status === '옛값') return marks.includes('장 닫힘') && !marks.includes('끊김') && !marks.includes('확인 중');
  return false;
}

/** 장들에서 날짜별 종가 모으기 — id(예 stock-price:005930 · kospi) → Map(날짜 → {value, observedAt, url, rawSha256, file, status}) · 같은 날 값이 장마다 다르면 그 날은 「확인 중」 */
export function closesFromSnapshots(snaps, ids, sessions) {
  const out = new Map(ids.map(id => [id, new Map()]));
  for (const s of snaps) {
    for (const v of s.doc.variables) {
      if (!out.has(v.id) || !Number.isFinite(Date.parse(v.observedAt))) continue;
      const day = kstDay(Date.parse(v.observedAt));
      if (!sessions.includes(day) || !closeUsable(v, day)) continue;
      const m = out.get(v.id);
      const had = m.get(day);
      if (had && had.value !== v.value) m.set(day, {...had, conflict: true});
      else if (!had) m.set(day, {value: v.value, observedAt: isoKst(Date.parse(v.observedAt)), url: v.sources?.[0]?.url ?? null, rawSha256: v.sources?.[0]?.rawSha256 ?? null, file: s.file, status: v.status});
    }
  }
  return out;
}

/**
 * 판에 쓸 52종목 자료 — input.json(ATLAS 11 파일, 읽기만) + 고리 장의 종가.
 *   ① input.json 줄 중 관측(받은) 시각이 봉인 뒤인 줄과 그 뒤 줄은 버린다(누수 없음 · 흉내·되돌려 돌리기 때만 생김)
 *   ② 그 뒤 거래일 종가는 장에서 이어 붙인다 — 바로 앞 거래일 줄이 있을 때만(빈 날을 건너 이틀 치를 하루로 잇지 않음)
 *   ③ input.json 줄과 장의 같은 날 종가가 다르면 그 종목은 그 날부터 「확인 중」 — 판에서 「없음」이 된다
 * 재현(retro/run.mjs)은 같은 buildInputs·buildBoard 를 같은 종가 줄로 부르므로, 같은 자료면 같은 판이 나온다(시험 loop.test).
 */
export function augmentInput(input, closes, sessions, asof, atMs) {
  const notes = [];
  const assets = input.assets.map(a => {
    const cut = a.prices.findIndex(p => typeof p.observedAt === 'string' && Date.parse(p.observedAt) > atMs);
    let rows = (cut < 0 ? a.prices : a.prices.slice(0, cut)).filter(p => p.date <= asof);
    const m = closes.get(`stock-price:${a.code}`) ?? new Map();
    const last = rows.at(-1);
    if (last && m.has(last.date) && (m.get(last.date).conflict || m.get(last.date).value !== last.close)) {
      notes.push(`${a.code} ${last.date} 종가가 input.json(${last.close})과 장(${m.get(last.date).conflict ? '장마다 다름' : m.get(last.date).value})에서 다름 — 확인 중`);
      return {...a, prices: rows.slice(0, -1), checking: last.date};
    }
    for (const d of sessions.filter(s => s > (rows.at(-1)?.date ?? '9999') && s <= asof)) {
      const c = m.get(d);
      if (!c || c.conflict || prevSession(sessions, d) !== rows.at(-1)?.date) break;
      rows = [...rows, {date: d, close: c.value, observedAt: c.observedAt, sourceUrl: c.url, ...(c.rawSha256 ? {rawHash: c.rawSha256} : {}), from: c.file}];
    }
    return {...a, prices: rows};
  });
  return {input: {...input, assets}, notes};
}

/** 지난 자료(kospi·sox) + 장의 값 — 파일이 없으면 그대로 「없음」(장 몇 장으로 3년치를 만들지 않음) */
export function augmentHistory(h, extra, sessions = null) {
  if (!h || h.none || !extra || !extra.size) return h;
  const series = [...h.series];
  const have = new Set(series.map(r => r.date));
  for (const [d, c] of [...extra.entries()].sort()) {
    if (have.has(d) || c.conflict) continue;
    if (sessions && prevSession(sessions, d) !== series.at(-1)?.date) break;
    series.push({date: d, value: c.value, sources: {[c.url ?? '고리 장']: c.value}, status: c.status === 'ok' ? 'ok' : '한 출처', from: c.file});
  }
  return {...h, series};
}

/** 반도체지수 장 값 → Map(뉴욕 날짜 → 값) (미국 장 마감 값만 · 장중 값은 안 씀) */
function soxFromSnapshots(snaps) {
  const m = new Map();
  for (const s of snaps) {
    const v = s.doc.variables.find(x => x.id === 'sox');
    if (!v || !(v.status === 'ok' || v.status === '한 출처' || (v.status === '옛값' && (v.marks ?? []).includes('장 닫힘'))) || !(v.value > 0)) continue;
    const t = Date.parse(v.observedAt);
    const ny = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(t));
    const hm = new Intl.DateTimeFormat('en-GB', {timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(new Date(t));
    if (hm < '16:00') continue;
    if (!m.has(ny)) m.set(ny, {value: v.value, observedAt: v.observedAt, url: v.sources?.[0]?.url ?? null, file: s.file, status: v.status});
  }
  return m;
}

// ───────────── 장부 ─────────────
export function readJsonl(file) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  return text.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}
export function readLedger(ledger, kind, sinceDate = null) {
  const dir = path.join(ledger, kind);
  let names = [];
  try {
    names = fs.readdirSync(dir).filter(n => n.endsWith('.jsonl')).sort();
  } catch {
    return [];
  }
  return names.filter(n => !sinceDate || n.slice(0, 10) >= sinceDate).flatMap(n => readJsonl(path.join(dir, n)));
}
/** 덧붙이기만 — 있는 줄은 고치지 않는다 */
export function appendLine(file, obj) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.appendFileSync(file, `${JSON.stringify(obj)}\n`);
}

/** 판 이름 = buildBoard 와 같은 규칙 (4h-<판 날짜>-<시각>-<내용 지문 앞 8자>) */
function nameBoard(body, slotDate, slot) {
  return {id: `4h-${slotDate.replaceAll('-', '')}-${slot}-${sha256(canonicalJson(body)).slice(0, 8)}`, ...body};
}

/** 옮겨 쓰는 변수의 「옛값」 표시를 새 봉인 시각으로 다시 붙인다(값·상태는 그대로 · 자료 약속 13번) */
function refreshStale(vars, atMs) {
  return vars.map(v => {
    if (typeof v.observedAt !== 'string' || v.value === null) return v;
    const marks = Array.isArray(v.marks) ? v.marks : [];
    if (atMs - Date.parse(v.observedAt) > 4 * HOUR && !marks.includes('옛값')) return {...v, marks: [...marks, '옛값', '장 닫힘']};
    return v;
  });
}

/**
 * 「변수 그대로」 규칙 (명령문 <고리> 「변수가 그대로면 계산 없이 앞 판을 다시 봉인한다」 · 무거운·가벼운 바퀴 모두):
 *   마지막으로 새로 셈하거나 다시 봉인한 판(prev · 「시간 초과」 판은 빼고)이 있고
 *   ① 목표일이 같고 ② 이번에 지은 변수 목록과 prev.inputs.variables 의 id 가 같으며
 *   ③ 변수마다 값(value)·상태(status)·관측 시각(observedAt)이 모두 같으면 → 그대로.
 *   (관측 시각이 같아야 출발일이 같다. 받은 시각·「옛값」 표시는 견주지 않는다 — 같은 값을 다시 받은 것일 뿐이다.)
 *   하나라도 다르면, 또는 prev 가 없으면 → 새로 셈한다.
 */
export function unchanged(prev, vars, target) {
  if (!prev || prev.target?.date !== target) return {same: false, why: prev ? `목표일이 다름 (${prev.target?.date} → ${target})` : '앞서 봉인한 판 없음'};
  const a = new Map((prev.inputs?.variables ?? []).map(v => [v.id, v]));
  if (a.size !== vars.length) return {same: false, why: `변수 수가 다름 (${a.size} → ${vars.length})`};
  for (const v of vars) {
    const p = a.get(v.id);
    if (!p) return {same: false, why: `새 변수 ${v.id}`};
    if (JSON.stringify(p.value ?? null) !== JSON.stringify(v.value ?? null) || p.status !== v.status || (p.observedAt ?? null) !== (v.observedAt ?? null)) {
      return {same: false, why: `${v.id} 바뀜 (${p.value ?? '없음'}·${p.status} → ${v.value ?? '없음'}·${v.status})`};
    }
  }
  return {same: true, why: `변수 ${vars.length}개 값·상태·관측 시각이 앞서 봉인한 판과 같음`};
}

// ───────────── 기준값 봉인 (봉인 때 아는 자료만) ─────────────
const r6 = x => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);
function baseBlock(b) {
  return {q19: b.q19.map(r6), p10: r6(b.p10), p50: r6(b.p50), p90: r6(b.p90), direction: b.direction ? Object.fromEntries(Object.entries(b.direction).map(([k, x]) => [k, r6(x)])) : null};
}
/**
 * 판 하나의 기준 셋을 봉인 시각에 적는다 (judgment.json · judgment-2.json 그대로):
 *   무판 = 출발값 + 지난 250거래일 하루 변화율 19개 분위수 · 단순 전이식 = 08시 판만(그 밖 「없음」 + 까닭)
 *   ATLAS 11 = 봉인 시각 전에 나온 마지막 발행본의 같은 목표일 1거래일 전망(p10·p50·p90) · 코스피는 ATLAS 11 없음(units.kospi)
 */
export function baselinesFor(board, {input, sessions, histories, pubs, sealedAt}) {
  const anchorDate = prevSession(sessions, board.target.date);
  const transfer = transferFor(board.slot, histories.sox, anchorDate, sealedAt);
  const units = {};
  for (const s of board.stocks) {
    if (s.center === null) continue;
    const v = board.inputs.variables.find(x => x.id === `stock-price:${s.code}`);
    const anchor = v.value;
    const hist = stockChangesUpTo(input, s.code, anchorDate);
    const nc = noChangeBaseline(anchor, hist);
    const tb = transfer.none ? null : transferBaseline(anchor, transfer.s, hist);
    const a11 = board.slot === '16' ? {none: true, why: NOTE_A11_EARLY} : atlas11Band(pubs, sessions, s.code, board.target.date, sealedAt);
    units[s.code] = {
      anchor,
      무판: nc ? baseBlock(nc) : {none: true, why: '지난 하루 변화율이 250개보다 적음'},
      '단순 전이식': transfer.none ? {none: true, why: transfer.why} : tb ? {...baseBlock(tb), s: r6(transfer.s), session: transfer.session ?? null, ...(transfer.note ? {note: transfer.note} : {})} : {none: true, why: '지난 하루 변화율이 250개보다 적음'},
      'ATLAS 11': a11.none ? {none: true, why: a11.why} : {p10: a11.p10, p50: a11.p50, p90: a11.p90, direction: null, forecastId: a11.forecastId, issuedAt: a11.issuedAt},
    };
  }
  if (board.kospi && histories.kospi && !histories.kospi.none) {
    const anchor = board.kospi.anchor.value;
    const hist = changesUpTo(histories.kospi.series, anchorDate);
    const nc = noChangeBaseline(anchor, hist);
    const tb = transfer.none ? null : transferBaseline(anchor, transfer.s, hist);
    units.kospi = {
      anchor,
      무판: nc ? baseBlock(nc) : {none: true, why: '지난 하루 변화율이 250개보다 적음'},
      '단순 전이식': transfer.none ? {none: true, why: transfer.why} : tb ? {...baseBlock(tb), s: r6(transfer.s)} : {none: true, why: '지난 하루 변화율이 250개보다 적음'},
      'ATLAS 11': {none: true, why: '코스피는 ATLAS 11 기준 없음 (judgment units.kospi)'},
    };
  }
  return {schema: 'atlas4h-baselines-1', boardId: board.id, slot: board.slot, sealedAt, target: board.target.date, anchorDate, units,
    judgment: ['atlas4h/seal/judgment.json', 'atlas4h/seal/judgment-2.json']};
}

// ───────────── 채점 (봉인 때 적은 기준값으로) ─────────────
function scoreBase(id, b, y, outcome) {
  if (!b || b.none) return {id, crps: null, interval: null, brier: null, note: NONE, why: b?.why ?? '기준값 봉인 기록 없음'};
  return {
    id,
    crps: Array.isArray(b.q19) ? r6(crpsFromQuantiles(b.q19, y)) : null,
    interval: r6(intervalScore(b.p10, b.p90, y, ALPHA)),
    covered: b.p10 <= y && y <= b.p90,
    brier: b.direction ? r6(brier3(b.direction, outcome)) : null,
    ...(id === 'ATLAS 11' && !Array.isArray(b.q19) ? {crpsNote: '없음 — ATLAS 11 은 분위수 7개 (판정 기준은 19개)'} : {}),
    ...(b.forecastId ? {forecastId: b.forecastId} : {}),
  };
}

/** 한 대상 채점 한 줄 (board.md 「채점 한 줄」 + 종목 code) */
export function scoreLine({board, code, block, anchor, actual, base, scoredAt, crisis}) {
  const y = actual.value;
  const outcome = outcomeOf(anchor, y);
  const lo = block.quantiles.p10;
  const hi = block.quantiles.p90;
  const ids = code === 'kospi' ? ['무판', '단순 전이식'] : ['무판', '단순 전이식', 'ATLAS 11'];
  return {
    boardId: board.id, code, target: board.target.date, scoredAt, anchor, actual,
    crps: r6(crpsFromQuantiles(q19Of(block.quantiles), y)),
    interval: {alpha: ALPHA, score: r6(intervalScore(lo, hi, y, ALPHA)), covered: lo <= y && y <= hi},
    brier: {event: '오름·보합·내림', p: block.direction, o: outcome, score: r6(brier3(block.direction, outcome))},
    baselines: ids.map(id => scoreBase(id, base ? base[id] : {none: true, why: '기준값 봉인 기록 없음 (시간 초과 판은 기준을 새로 세지 않음)'}, y, outcome)),
    crisis: crisis.crisis,
    ...(crisis.crisis === null ? {crisisWhy: crisis.why} : {}),
  };
}

/**
 * 채점: 장부의 봉인 판 중 목표 종가가 「목표일 15:30 뒤에 받은 고리 장」에 나온 것만 (상태는 closeUsable).
 * 같은 판·같은 대상은 두 번 채점하지 않는다(채점 장부 boardId|code 를 먼저 본다). 쓰는 곳 = 채점한 날(한국) 파일.
 */
export function scoreDue({ledger, snapDir, root, nowMs, scoredAt, sessions, kospiHist}) {
  const since = kstDay(nowMs - 20 * 24 * HOUR);
  const boards = readLedger(ledger, 'boards', since);
  const done = new Set(readLedger(ledger, 'scores').map(s => `${s.boardId}|${s.code}`));
  const bases = new Map(readLedger(ledger, 'baselines', since).map(b => [b.boardId, b]));
  const lines = [];
  const pending = boards.filter(b => b.target?.date && closeMs(b.target.date) <= nowMs && Date.parse(b.sealedAt) < closeMs(b.target.date));
  if (!pending.length) return lines;
  const first = pending.map(b => b.target.date).sort()[0];
  const snaps = snapshotsSince(snapDir, first, nowMs, root).filter(s => s.at >= closeMs(first));
  for (const b of pending) {
    const t = b.target.date;
    const after = snaps.filter(s => s.at >= closeMs(t));
    const find = id => {
      for (const s of after) {
        const v = s.doc.variables.find(x => x.id === id);
        if (closeUsable(v, t)) return {value: v.value, asOf: isoKst(Date.parse(v.observedAt)), source: v.sources?.[0]?.url ?? s.file, status: v.status, snapshot: s.file};
      }
      return null;
    };
    const base = bases.get(b.id)?.units ?? null;
    const anchorDate = prevSession(sessions, t);
    // 위기 날: 코스피 지난 자료 + 장의 목표일 종가
    const kAct = find('kospi');
    const kh = kospiHist && !kospiHist.none && kAct ? augmentHistory(kospiHist, new Map([[t, {value: kAct.value, url: kAct.source, status: kAct.status, file: kAct.snapshot}]]), sessions) : kospiHist;
    const crisis = crisisOf(kh, anchorDate, t);
    for (const s of b.stocks) {
      if (s.center === null || done.has(`${b.id}|${s.code}`)) continue;
      const actual = find(`stock-price:${s.code}`);
      if (!actual) continue;
      const v = b.inputs.variables.find(x => x.id === `stock-price:${s.code}`);
      lines.push(scoreLine({board: b, code: s.code, block: s, anchor: v.value, actual, base: base?.[s.code], scoredAt, crisis}));
    }
    if (b.kospi && b.kospi.center !== null && kAct && !done.has(`${b.id}|kospi`)) {
      lines.push(scoreLine({board: b, code: 'kospi', block: b.kospi, anchor: b.kospi.anchor.value, actual: kAct, base: base?.kospi, scoredAt, crisis}));
    }
  }
  return lines;
}

// ───────────── 멈춤 단추 ─────────────
export function stopState(root, flag) {
  if (flag === true || flag === 'true') return {stop: true, by: '사장님', source: 'workflow 입력 stop'};
  try {
    const s = JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/harness/stop.json'), 'utf8'));
    if (s?.stop === true) return {stop: true, by: s.by ?? null, since: s.since ?? null, source: 'atlas4h/harness/stop.json'};
  } catch {
    // 파일 없음 = 멈춤 아님
  }
  return {stop: false};
}

export function forbiddenIn(obj) {
  const hits = [];
  const walk = v => {
    if (typeof v === 'string') {
      for (const f of FORBIDDEN) if (f.re.test(v)) hits.push(f.word);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(obj);
  return hits;
}

// ───────────── 한 바퀴 ─────────────
/**
 * opts: {slot, root, now(ISO), fixtures(장 폴더), stop, clock(시험용: () => ms), git}
 * 돌려줌 {loop, board, seal, baselines, scores}
 */
export function runTurn(opts = {}) {
  const root = path.resolve(opts.root ?? REPO);
  const fixedNow = opts.now ? Date.parse(opts.now) : null;
  if (opts.now && !Number.isFinite(fixedNow)) throw new Error(`--now 를 못 읽음: ${opts.now}`);
  const clock = opts.clock ?? (() => fixedNow ?? Date.now());
  const startMs = clock();
  const ledger = path.join(root, 'atlas4h/ledger');
  const snapDir = opts.fixtures ? path.resolve(opts.fixtures) : path.join(ledger, 'inputs');
  const {slot, slotDate, slotAt} = slotOf(startMs, opts.slot ?? 'auto');
  const slotAtMs = Date.parse(slotAt);
  const kind = HEAVY.includes(slot) ? '무거운' : '가벼운';
  const stop = stopState(root, opts.stop);
  const git = opts.git ?? gitState(root);
  const notes = [];
  const loopsToday = readJsonl(path.join(ledger, 'loops', `${slotDate}.jsonl`));
  const baseId = `loop-${slotDate.replaceAll('-', '')}-${slot}`;
  const taken = new Set(loopsToday.map(l => l.loopId));
  let loopId = baseId;
  for (let k = 2; taken.has(loopId); k++) loopId = `${baseId}-${k}`;
  const loop = {
    schema: 'atlas4h-loop-1', loopId, slot, slotAt, kind, mode: MODE_SHADOW, stop: stop.stop, ...(stop.stop ? {stopBy: stop.by ?? null, stopSource: stop.source} : {}),
    // [판단] startedAt = 판 시각(이 바퀴가 시작해야 했던 때 · 40분의 잣대) · ranAt = 실제로 돌기 시작한 때 — T9 가 끝 − 시작으로 40분을 잰다
    startedAt: slotAt, ranAt: isoKst(startMs), endedAt: null, lateMinutes: Math.round(((startMs - slotAtMs) / MIN) * 10) / 10, minutes: null,
    status: null, boardId: null, boardStatus: null, snapshot: null, scored: 0, baselines: 0, by: LOOP_BY,
    steps: {모으기: null, 검사: null, '가운데·폭 엔진': null, '사건 확률': NOT_YET, '섞기·범위': null, 시나리오: null, '합치기·반론': NOT_YET, '봉인·적용': null, 기록: null},
    structures: ['A1', 'A3', 'B2', 'C5', 'D6', 'E2', 'F1', 'F4'],
    notes,
  };
  notes.push(stop.stop ? '멈춤 단추 — 그림자 운전(봉인·채점만, 화면 안 건드림)' : '6단계(화면 올리기)가 아직 없어 그림자 운전 — 봉인·채점만, 화면 안 건드림');
  const finish = (status) => {
    const endMs = clock();
    loop.endedAt = isoKst(Math.max(endMs, startMs));
    loop.minutes = Math.round(((Math.max(endMs, startMs) - slotAtMs) / MIN) * 10) / 10;
    loop.status = status;
    appendLine(path.join(ledger, 'loops', `${slotDate}.jsonl`), loop);
    return loop;
  };
  const prevAll = readLedger(ledger, 'boards', kstDay(startMs - 20 * 24 * HOUR)).sort((a, b) => Date.parse(a.sealedAt) - Date.parse(b.sealedAt));
  const prevSealed = prevAll.filter(b => b.status !== STATUS_KEEP).at(-1) ?? null;
  const prevAny = prevAll.at(-1) ?? null;
  const overdue = () => (clock() - slotAtMs) / MIN > LIMIT_MINUTES;

  /** 시간 초과 → 앞 판 유지 (새 계산 없음 · 앞 판 값을 그대로 이 시각 판으로 봉인 · 기준값은 새로 세지 않음) */
  const keep = why => {
    notes.push(why);
    let board = null;
    let seal = null;
    if (prevAny) {
      const at = clock();
      const {id: _old, resealOf: _r, keepOf: _k, ...rest} = prevAny;
      const body = {...rest, slot, kind, createdAt: isoKst(startMs), sealedAt: isoKst(at), dataCutoff: isoKst(at), status: STATUS_KEEP,
        keepOf: prevAny.id, inputs: {...prevAny.inputs, variables: refreshStale(prevAny.inputs.variables, at)}, code: {commit: git.commit, dirty: git.dirty},
        text: ['시간 안에 끝내지 못해 새로 셈하지 않고 앞 값을 그대로 두었습니다.']};
      board = nameBoard(body, slotDate, slot);
      seal = sealRecord(board, git.commit);
      appendLine(path.join(ledger, 'boards', `${kstDay(at)}.jsonl`), board);
      appendLine(path.join(ledger, 'seals', `${kstDay(at)}.jsonl`), seal);
      loop.boardId = board.id;
      loop.boardStatus = STATUS_KEEP;
    } else notes.push('앞 판 없음 — 남길 판 없음');
    return {loop: finish('시간 초과'), board, seal, baselines: null, scores: []};
  };
  if (overdue()) return keep(`판 시각보다 ${loop.lateMinutes}분 늦게 시작 — 40분 안에 끝낼 수 없음`);

  // 1 모으기 — collect.mjs 가 쓴 이 바퀴의 장
  const snap = turnSnapshot(snapDir, slotAtMs, startMs, root);
  loop.snapshot = snap ? snap.file : null;
  loop.steps.모으기 = snap ? `장 ${snap.file} (받은 때 ${isoKst(snap.at)})` : '이 바퀴의 장 없음 — 모으기 실패로 보고 지난 자료만 씀';
  // 2 검사 — 판 시각·자료
  const inputFile = path.join(root, 'public/data/input.json');
  const inputBuf = fs.readFileSync(inputFile);
  const input = JSON.parse(inputBuf.toString('utf8'));
  let sessions = input.calendar.sessions;
  try {
    const cal = JSON.parse(fs.readFileSync(path.join(root, 'public/data/rolling-calendar.json'), 'utf8'));
    if (Array.isArray(cal?.sessions)) sessions = [...new Set([...sessions, ...cal.sessions])].sort();
  } catch {
    // 달력 파일이 없으면 input.json 달력만
  }
  const plan = planAt(sessions, slotAt);
  if (!plan.anchorDate || !plan.target) {
    notes.push(`거래일 달력에서 출발일·목표일을 못 찾음 (출발 ${plan.anchorDate ?? '없음'} · 목표 ${plan.target ?? '없음'}) — 판 없음`);
    loop.steps.검사 = '판 없음';
    return {loop: finish('판 없음'), board: null, seal: null, baselines: null, scores: []};
  }
  const lastInputDate = input.assets.map(a => a.prices.at(-1)?.date).filter(Boolean).sort()[0] ?? plan.anchorDate;
  const recent = snapshotsSince(snapDir, lastInputDate, startMs, root);
  const ids = ['kospi', ...input.assets.map(a => `stock-price:${a.code}`)];
  const closes = closesFromSnapshots(recent, ids, sessions);
  const aug = augmentInput(input, closes, sessions, plan.anchorDate, startMs);
  notes.push(...aug.notes);
  const histDir = path.join(root, HISTORY_DIR);
  const kospiFile = loadHistory(histDir, 'kospi', root);
  const soxFile = loadHistory(histDir, 'sox', root);
  const histories = {kospi: augmentHistory(kospiFile, closes.get('kospi'), sessions), sox: augmentHistory(soxFile, soxFromSnapshots(recent))};
  const at0 = clock();
  const vars = buildInputs(aug.input, {asof: plan.anchorDate, at: isoKst(at0), histories, withConstants: false}).variables;
  const same = unchanged(prevSealed, vars, plan.target);
  loop.steps.검사 = `출발일 ${plan.anchorDate} · 목표일 ${plan.target} · ${same.why}`;
  const forecastFile = path.join(root, 'public/data/atlas11/forecast.json');
  const pubs = loadAtlas11(forecastFile);
  const rel = f => path.relative(root, f).split(path.sep).join('/');
  const files = [rel(inputFile)];
  const fileHashes = {[rel(inputFile)]: fileSha256(inputBuf)};
  if (!kospiFile.none && vars[0].value !== null) {
    files.push(kospiFile.file);
    fileHashes[kospiFile.file] = kospiFile.sha256;
  }
  for (const s of recent) {
    if (!files.includes(s.file)) {
      files.push(s.file);
      fileHashes[s.file] = s.sha256;
    }
  }

  let board;
  if (same.same) {
    // 변수 그대로 → 계산 없이 앞 판을 다시 봉인 (값·상수·두 길은 앞 판 그대로 · 변수는 이번에 다시 받은 것 — 값·상태·관측 시각이 같다)
    if (overdue()) return keep('검사까지 40분을 넘김');
    const at = clock();
    const {id: _old, resealOf: _r, keepOf: _k, ...rest} = prevSealed;
    const body = {...rest, slot, kind, createdAt: isoKst(startMs), sealedAt: isoKst(at), dataCutoff: isoKst(at), status: STATUS_RESEAL, resealOf: prevSealed.id,
      code: {commit: git.commit, dirty: git.dirty}, seed: Number(slotDate.replaceAll('-', '')) * 100 + Number(slot),
      dataVersion: {sha256: sha256(canonicalJson(Object.fromEntries(files.map(f => [f, fileHashes[f] ?? null])))), files, fileSha256: Object.fromEntries(files.map(f => [f, fileHashes[f] ?? null]))},
      inputs: {variables: vars, constants: prevSealed.inputs.constants},
      text: ['변수가 그대로여서 새로 셈하지 않고 같은 값을 이 시각 판으로 다시 봉인했습니다.']};
    board = nameBoard(body, slotDate, slot);
    loop.steps['가운데·폭 엔진'] = '계산 없음 (변수 그대로)';
    loop.steps['섞기·범위'] = '계산 없음 (변수 그대로)';
    loop.steps.시나리오 = '계산 없음 (변수 그대로)';
  } else {
    // 3~6 가운데·폭 엔진 → 섞기·범위 → 시나리오 (엔진 0판 · 재현과 같은 함수)
    const at = clock();
    const inputs = buildInputs(aug.input, {asof: plan.anchorDate, at: isoKst(at), histories});
    if (overdue()) return keep('엔진 계산이 40분을 넘김');
    const seed = Number(slotDate.replaceAll('-', '')) * 100 + Number(slot);
    board = buildBoard({inputs, seed, slot, kind, createdAt: isoKst(startMs), sealedAt: isoKst(at), target: plan.target,
      commit: git.commit, dirty: git.dirty, files, fileHashes, slotDate});
    loop.steps['가운데·폭 엔진'] = '가운데 = 무판(출발값 그대로) · 폭 = HAR 밑값 3층';
    loop.steps['섞기·범위'] = '섞기 없음(엔진 하나) · 80% 범위 = 걸러낸 지난 기록 분포';
    loop.steps.시나리오 = '위·가운데·아래 셋 (같은 분포에서 나눔)';
  }
  const hits = forbiddenIn({text: board.text, screen: board.screen});
  if (hits.length) throw new Error(`판 글에 금지 말: ${hits.join('·')}`);
  if (overdue()) return keep('봉인 전에 40분을 넘김');
  // 7 봉인·적용 — 판 · 봉인 기록 · 기준값(봉인 때 아는 자료만) · 적용: 그림자라 화면은 안 건드림
  const day = board.sealedAt.slice(0, 10);
  const seal = sealRecord(board, git.commit);
  appendLine(path.join(ledger, 'boards', `${day}.jsonl`), board);
  appendLine(path.join(ledger, 'seals', `${day}.jsonl`), seal);
  const baselines = baselinesFor(board, {input: aug.input, sessions, histories, pubs, sealedAt: board.sealedAt});
  appendLine(path.join(ledger, 'baselines', `${day}.jsonl`), baselines);
  loop.boardId = board.id;
  loop.boardStatus = board.status;
  loop.baselines = Object.keys(baselines.units).length;
  loop.steps['봉인·적용'] = `봉인 ${board.id} (${board.status}) · 적용 안 함 — ${MODE_SHADOW} 운전`;
  // 8 기록 — 채점(목표 종가가 장에 나온 판) · 고리 한 줄
  const scoredAtMs = clock();
  const scores = scoreDue({ledger, snapDir, root, nowMs: scoredAtMs, scoredAt: isoKst(scoredAtMs), sessions, kospiHist: kospiFile});
  for (const l of scores) appendLine(path.join(ledger, 'scores', `${kstDay(scoredAtMs)}.jsonl`), l);
  loop.scored = scores.length;
  loop.steps.기록 = `채점 ${scores.length}줄 · 고리 한 줄`;
  return {loop: finish('ok'), board, seal, baselines, scores};
}

export function parseArgs(argv) {
  const o = {slot: 'auto', root: REPO, now: null, fixtures: null, stop: false};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--slot') o.slot = argv[++i];
    else if (a === '--root') o.root = argv[++i];
    else if (a === '--now') o.now = argv[++i];
    else if (a === '--fixtures') o.fixtures = argv[++i];
    else if (a === '--stop') o.stop = argv[++i] === 'true';
    else throw new Error(`모르는 칸: ${a}`);
  }
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = runTurn(parseArgs(process.argv.slice(2)));
    const l = r.loop;
    console.log(`${l.loopId} · ${l.kind} · ${l.mode} · ${l.status} · 판 ${l.boardId ?? '없음'} (${l.boardStatus ?? '-'}) · 기준값 ${l.baselines} · 채점 ${l.scored}줄 · ${l.minutes}분`);
  } catch (e) {
    console.error(`멈춤: ${e.message}`);
    process.exit(1);
  }
}

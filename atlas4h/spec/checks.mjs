/**
 * ATLAS 4시간 엔진 · 사양 T1~T23 · 극한 K1~K7 을 시험 코드로 (첫 실행 5번)
 *
 *   loadState(root)            기록 파일을 읽어 한 덩어리로 돌려준다. 파일이 없으면 빈 목록·null, 멈추지 않는다.
 *   CHECKS.T1 … CHECKS.K7      (state, opts) → {id, pass, reason, counts}
 *                              잴 것이 없으면 통과가 아니라 「판 없음」 같은 까닭으로 「안 통과」.
 *   checkOldEngineUntouched    T11 의 속 — 바뀐 파일 목록만 받는 순수 함수
 *   collectAtlas4hChanges      T11 에 줄 바뀐 파일 목록을 깃에서 센다 (깃이 없으면 null)
 *   judgmentCommitTime         T19 에 줄 판정 기준 파일의 마지막 커밋 시각 (깃이 없으면 null)
 *
 * opts (모두 고를 수 있음)
 *   engine(inputs, seed)       엔진 함수 — 동기 함수. 없으면 T4·T15·K1~K7 은 「엔진 없음」
 *   changes                    T11 바뀐 파일 목록 [{commit, subject, status, path, deletedLines, appendOnly?, oldPath?, newPath?}]
 *                              appendOnly: 앞 판 글자가 새 판 글자의 앞부분 그대로인가(끝에 덧붙이기만) — true·false·null(모름)
 *   judgmentCommitAt           T19 판정 기준 파일의 커밋 시각 (ISO)
 *   contract                   T7 자료 약속 (기본: atlas4h/data/variables.json — 출처 둘의 허용 폭 compare)
 *   extremesDir                K1~K7 시험 자료 폴더 (기본: 이 파일 옆 fixtures/extremes)
 *
 * 변경 요청 atlas4h-01 (2026-10-01 사장님 승인)로 더 엄하게 고친 곳: T2·T3·T6·T7·T8·T11·T13·T20·T21·T23,
 * 헛잡음 고침 T10(「사라졌다」) · 멈춤 고침 T12(차이 분산 0). 고친 곳마다 「ECO-01」 쪽지를 달았다.
 *
 * 판 꼴: atlas4h/spec/board.md (atlas4h-board-1). 이 파일이 새로 정한 꼴 셋은 아래 「이 파일이 정한 꼴」.
 *
 * ── 이 파일이 정한 꼴 (board.md 에 없던 것) ──────────────────────────────────────────────
 * 1) 엔진 함수 engine(inputs, seed) → 결과   (동기 함수 · 같은 입력·씨앗이면 같은 결과)
 *    inputs = 판의 inputs 와 같은 꼴 {variables, constants} 에 더해 고를 수 있는 칸
 *             now(판을 만드는 때) · calendar{kr:{lastSession}, us:{closed[], session}} · market{circuitBreaker, sidecar}
 *             · events[{name, at, result}] · variables[].market · variables[].compare{rule, tolerance}
 *             · variables[].marks(자료 쪽이 붙인 표시: 거래정지·가격 제한) · variables[].previous{value, observedAt}
 *             · variables[].history[{date, changePct}] · variables[].threshold · variables[].prevClose(종목)
 *             · variables[].sources[].error / sessionDate. 종목 값은 id 「stock-price:종목코드」 변수로 들어온다.
 *    결과   = {createdAt, status, trigger, flags[], variables[{id, value, status, marks[]}] (입력 변수마다 하나),
 *              derived{usCumulativePct{변수: %}}, regime{probs{잔잔, 보통, 사나움}},
 *              kospi{center, quantiles{p10, p25?, p50, p75?, p90}, scenarios[]}, stocks[{code, center, quantiles, status[]}]}
 *    status 가 「변수 그대로 → 앞 판 다시 봉인」·「시간 초과 → 앞 판 유지」 이면 kospi 는 null 이어도 된다(새로 셈하지 않음).
 *    T4 는 판의 kospi·stocks 와 결과의 kospi·stocks 를 JSON 그대로 견준다.
 * 2) 재현 결과 atlas4h/retro/result.json (atlas4h-retro-1, T12)
 *    {schema, rows: [채점 한 줄과 같은 꼴 — {boardId, target, interval{alpha: 0.2, score}, baselines[{id, interval, note?}]}]}
 * 3) 무게 근거 atlas4h/seal/weights.json (T16·T20)
 *    {baseline: 무판 엔진 id, candidates[{id, beatsNoChange, dm{p}}], selections[{id, trialIds[], spa{p}}]}
 *    화면 파일 public/data/atlas4h/view.json (T14) — boardId 를 가진 덩어리 안의 숫자는 그 판의 같은 자리 값이어야 한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import {dmTest, kupiecLR, mean} from './stats.mjs';

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
export const EXTREMES_DIR = path.join(SPEC_DIR, 'fixtures', 'extremes');

export const IDS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
  'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20', 'T21', 'T22', 'T23',
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7',
];

export const STATUS_SEALED = '봉인';
export const STATUS_KEEP = '시간 초과 → 앞 판 유지';
export const STATUS_RESEAL = '변수 그대로 → 앞 판 다시 봉인';
export const BASELINES = ['무판', '단순 전이식', 'ATLAS 11'];
export const T11_BASE = 'a9187c6';
/** T11 지키는 곳 — 이 아래는 atlas4h 커밋이 무엇이든(더하기·고치기·지우기·이름 바꾸기) 건드리면 안 된다.
 *  ECO-01: 옛 기록 전체 reports/atlas11/ 를 더함(앞에는 reports/atlas11/ledger/ 에 줄 덧붙이기를 받아 줬다). */
export const PROTECTED = ['lib/atlas11/', 'scripts/atlas11/', 'config/atlas11/', 'site/', 'public/data/atlas11/', 'reports/atlas11/'];
/** T11 덧붙이기만 받는 곳 (ECO-01) — 새 파일이나 끝에 줄 덧붙이기만. 줄을 고치거나 지우거나 중간에 끼우면 안 통과 */
export const APPEND_ONLY = ['atlas4h/ledger/', 'atlas4h/seal/'];
const HOUR = 3600e3;
const MINUTE = 60e3;
/** T7 「ok」 변수는 봉인 이만큼 안의 관측 (자료 약속 13번 · staleAfterHours 가 더 짧으면 그 값) */
export const STALE_HOURS = 4;
const CONTRACT_FILE = path.join(SPEC_DIR, '..', 'data', 'variables.json');

/** 금지 말 (넘지 않는 선) — 보통 낱말(사라지다·사라졌다·사라질·팔라듐·불확실)은 걸리지 않게
 *  ECO-01: 「사라졌다」를 잘못 잡던 것을 고침 — 「사라」 뒤에 지·져·졌·질·진·짐이 오면 보통 낱말 */
export const FORBIDDEN = [
  {word: '사라', re: /사라(?![지져졌질진짐])/},
  {word: '팔라', re: /팔라(?!듐)/},
  {word: '추천', re: /추천/},
  {word: '목표가', re: /목표\s?가/},
  {word: '확실', re: /(?<!불)확실/},
  {word: '보장', re: /보장/},
  {word: '무조건', re: /무조건/},
];

// ───────────────────────────── 읽기 ─────────────────────────────

function readJsonFile(file, kind, errors) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    errors.push({kind, file, line: null, message: e.message});
    return null;
  }
}

function readJsonlFile(file, kind, errors, out) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    try {
      out.push(JSON.parse(line));
    } catch (e) {
      errors.push({kind, file, line: i + 1, message: e.message});
    }
  });
}

function readJsonlDir(dir, kind, errors, files) {
  const out = [];
  let names = [];
  try {
    names = fs.readdirSync(dir).filter(n => n.endsWith('.jsonl')).sort();
  } catch {
    return out;
  }
  for (const n of names) {
    const file = path.join(dir, n);
    files.push(file);
    readJsonlFile(file, kind, errors, out);
  }
  return out;
}

/** 기록 파일을 모두 읽는다. 없으면 빈 목록·null. 깨진 줄은 errors 에 적고 넘어간다. */
export async function loadState(root) {
  const at = rel => path.join(root, rel);
  const errors = [];
  const files = {boards: [], seals: [], scores: [], loops: [], watch: []};
  const state = {root, errors, files};
  for (const kind of ['boards', 'seals', 'scores', 'loops', 'watch']) {
    state[kind] = readJsonlDir(at(`atlas4h/ledger/${kind}`), kind, errors, files[kind]);
  }
  state.trials = [];
  readJsonlFile(at('atlas4h/seal/trials.jsonl'), 'trials', errors, state.trials);
  state.judgment = readJsonFile(at('atlas4h/seal/judgment.json'), 'judgment', errors);
  state.weights = readJsonFile(at('atlas4h/seal/weights.json'), 'weights', errors);
  state.view = readJsonFile(at('public/data/atlas4h/view.json'), 'view', errors);
  state.retro = readJsonFile(at('atlas4h/retro/result.json'), 'retro', errors);
  return state;
}

// ───────────────────────────── 도구 ─────────────────────────────

/** 정렬 직렬화 — 키를 정렬해 빈칸 없이 JSON 으로 (board.md) */
export function canonicalJson(v) {
  if (Array.isArray(v)) return `[${v.map(x => (x === undefined ? 'null' : canonicalJson(x))).join(',')}]`;
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).filter(k => v[k] !== undefined).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v) ?? 'null';
}

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/** 판의 봉인 지문 = 정렬 직렬화 글자의 sha256 */
export function boardSha256(board) {
  return sha256(canonicalJson(board));
}

const ms = s => (typeof s === 'string' ? Date.parse(s) : NaN);
const isNum = x => typeof x === 'number' && Number.isFinite(x);
const list = x => (Array.isArray(x) ? x : []);
const jsonRound = x => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const few = (xs, n = 2) => [...new Set(xs)].slice(0, n).join(' · ') + (new Set(xs).size > n ? ` 외 ${new Set(xs).size - n}` : '');
const kv = obj => Object.entries(obj).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(' · ');

function result(id, pass, reason, counts = {}) {
  return {id, pass: Boolean(pass), reason, counts};
}

/** 잴 것이 없으면 통과가 아니다 */
function nothing(id, reason = '판 없음', counts = {}) {
  return result(id, false, reason, counts);
}

/** 문자열 잎마다 fn(글, 자리) */
function walkStrings(v, where, fn) {
  if (typeof v === 'string') fn(v, where);
  else if (Array.isArray(v)) v.forEach((x, i) => walkStrings(x, `${where}[${i}]`, fn));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walkStrings(x, where ? `${where}.${k}` : k, fn);
}

/** 숫자 잎마다 fn(숫자, 자리 배열) — boardId 를 만나면 기준 판을 바꾼다 */
function walkViewNumbers(v, pathArr, ref, fn) {
  if (typeof v === 'number') return fn(v, pathArr, ref);
  if (Array.isArray(v)) return v.forEach((x, i) => walkViewNumbers(x, [...pathArr, i], ref, fn));
  if (v && typeof v === 'object') {
    let here = ref;
    let rel = pathArr;
    if (typeof v.boardId === 'string') {
      here = v.boardId;
      rel = [];
    }
    for (const [k, x] of Object.entries(v)) {
      if (k === 'boardId') continue;
      walkViewNumbers(x, [...rel, k], here, fn);
    }
  }
}

function getPath(obj, pathArr) {
  let cur = obj;
  for (const k of pathArr) {
    if (cur === null || typeof cur !== 'object' || !(k in cur)) return {found: false};
    cur = cur[k];
  }
  return {found: true, value: cur};
}

function getDotted(obj, dotted) {
  return getPath(obj, String(dotted).split('.').filter(Boolean));
}

/** 변수의 상태 모음 = status + marks */
function statusesOf(v) {
  return new Set([v?.status, ...list(v?.marks)].filter(x => typeof x === 'string'));
}

const NUM_IN_TEXT = /-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?/g;
function numbersInText(s) {
  return (s.match(NUM_IN_TEXT) ?? []).map(t => Number(t.replace(/,/g, ''))).filter(Number.isFinite);
}

/** 판의 정보 시각 = 봉인 시각·자료 마감 중 이른 쪽 (재현 판은 자료 마감이 훨씬 앞이다) */
function cutOf(b) {
  return Math.min(ms(b?.sealedAt), ms(b?.dataCutoff));
}

/** 시각 칸 이름 — 판 입력 안에서 이 이름의 칸은 모두 자료 시각으로 본다 (T2) */
const TIME_KEYS = new Set(['observedAt', 'fetchedAt', 'asOf', 'measuredAt']);

/** 시각 칸마다 fn(값, 자리) — 깊이와 상관없이 (출처·앞 값 previous 안까지) */
function walkTimes(v, where, fn) {
  if (Array.isArray(v)) v.forEach((x, i) => walkTimes(x, `${where}[${i}]`, fn));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      const w = where ? `${where}.${k}` : k;
      if (TIME_KEYS.has(k)) fn(x, w);
      else walkTimes(x, w, fn);
    }
  }
}

/** 자료 약속(atlas4h/data/variables.json)을 읽는다. 못 읽으면 null */
export function loadContract(file = CONTRACT_FILE) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}
let contractCache;
function defaultContract() {
  if (contractCache === undefined) contractCache = loadContract();
  return contractCache;
}

/** 자료 약속에서 변수 하나 — 「stock-price:005930」 은 「stock-price」 줄을 쓴다 */
function contractOf(contract, id) {
  const vars = list(contract?.variables);
  const key = String(id ?? '');
  return vars.find(x => x?.id === key) ?? vars.find(x => x?.id === key.split(':')[0]) ?? null;
}

const SECOND_LEVEL = new Set(['co', 'or', 'go', 'ac', 'ne', 're', 'pe', 'ed', 'mil', 'com', 'net', 'org', 'gov', 'edu']);
/**
 * 주소의 회사(등록 도메인) — 자료 약속 2번 「같은 회사의 다른 주소는 출처 하나로 센다」
 *   m.stock.naver.com·api.stock.naver.com → naver.com · data-dbg.krx.co.kr → krx.co.kr · ecos.bok.or.kr → bok.or.kr
 * 공용 접미사 목록 없이 셈: 끝이 두 글자 나라 이름이고 그 앞이 co·or·go 같은 칸이면 셋, 아니면 끝 둘. 못 읽으면 null.
 */
export function sourceOrg(url) {
  let host;
  try {
    host = new URL(String(url)).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host) return null;
  if (/^[\d.]+$/.test(host) || host.startsWith('[')) return host;
  const parts = host.split('.').filter(Boolean);
  const take = parts.length > 2 && parts.at(-1).length === 2 && SECOND_LEVEL.has(parts.at(-2)) ? 3 : 2;
  return parts.slice(-take).join('.');
}

const show = x => (x !== null && typeof x === 'object' ? JSON.stringify(x) : String(x));

// ───────────────────────────── 봉인·계산 T1~T8 ─────────────────────────────

function T1(state) {
  const boards = list(state.boards);
  const broken = list(state.errors).filter(e => e.kind === 'boards' || e.kind === 'seals').length;
  if (!boards.length && !broken) return nothing('T1');
  const sealsBy = new Map();
  for (const s of list(state.seals)) {
    if (!sealsBy.has(s?.boardId)) sealsBy.set(s?.boardId, []);
    sealsBy.get(s?.boardId).push(s);
  }
  const ids = new Map();
  const c = {'지문 다름': 0, '봉인 없음': 0, '봉인 겹침': 0, '판 겹침': 0, '판 없는 봉인': 0, '못 읽은 줄': broken};
  const bad = [];
  for (const b of boards) {
    ids.set(b?.id, (ids.get(b?.id) ?? 0) + 1);
    const ss = sealsBy.get(b?.id) ?? [];
    if (!ss.length) {
      c['봉인 없음']++;
      bad.push(b?.id);
      continue;
    }
    if (ss.length > 1) {
      c['봉인 겹침']++;
      bad.push(b?.id);
    }
    const sha = boardSha256(b);
    if (ss.some(s => s.sha256 !== sha)) {
      c['지문 다름']++;
      bad.push(b?.id);
    }
  }
  for (const [id, n] of ids) if (n > 1) {
    c['판 겹침'] += n - 1;
    bad.push(id);
  }
  for (const id of sealsBy.keys()) if (!ids.has(id)) {
    c['판 없는 봉인']++;
    bad.push(id);
  }
  const mismatches = Object.values(c).reduce((a, b) => a + b, 0);
  const counts = {boards: boards.length, seals: list(state.seals).length, mismatches};
  if (!mismatches) return result('T1', true, `판 ${boards.length}개 모두 봉인 지문과 같음`, counts);
  return result('T1', false, `봉인과 어긋남 ${mismatches} (${kv(c)}) — ${few(bad)}`, counts);
}

function T2(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T2');
  let times = 0;
  let late = 0;
  let unreadable = 0;
  const bad = [];
  for (const b of boards) {
    const cut = cutOf(b);
    if (!Number.isFinite(cut)) {
      unreadable++;
      bad.push(`${b.id}: 봉인 시각·자료 마감 없음`);
      continue;
    }
    const check = (t, where) => {
      if (t === null || t === undefined) return;
      times++;
      const x = ms(t);
      if (!Number.isFinite(x)) {
        unreadable++;
        bad.push(`${b.id} ${where} 시각을 못 읽음`);
      } else if (x > cut) {
        late++;
        bad.push(`${b.id} ${where}`);
      }
    };
    /** 꼭 있어야 하는 시각 — 없으면 「못 읽음」 */
    const need = (t, where) => {
      if (t === null || t === undefined) {
        times++;
        unreadable++;
        bad.push(`${b.id} ${where} 시각 없음`);
      } else check(t, where);
    };
    // 변수마다 시각 칸 전부 (값·출처·앞 값 previous 까지) — 자리 이름은 「변수.칸」
    for (const v of list(b.inputs?.variables)) walkTimes(v, String(v?.id), check);
    // 변수 밖 입력(상수·달력 등)의 시각 칸
    for (const [k, x] of Object.entries(b.inputs ?? {})) if (k !== 'variables' && k !== 'events') walkTimes(x, k, check);
    // 결과가 들어 있는 발표는 그 발표 시각도 자료 시각이다
    list(b.inputs?.events).forEach((e, i) => {
      walkTimes(e, `events[${i}]`, check);
      if (e?.result !== null && e?.result !== undefined) need(e?.at, `events[${i}].at`);
    });
    // ECO-01: 코스피 출발값의 시각도 봉인 시각 이하 (출발값은 판이 쓴 자료다)
    if (b.kospi && typeof b.kospi === 'object') need(b.kospi.anchor?.asOf, 'kospi.anchor.asOf');
  }
  const counts = {boards: boards.length, times, late, unreadable};
  if (!times) return nothing('T2', '잴 시각 없음', counts);
  if (!late && !unreadable) return result('T2', true, `시각 ${times}개 모두 봉인·자료 마감 전`, counts);
  return result('T2', false, `봉인 뒤 자료 ${late} · 못 읽은 시각 ${unreadable} — ${few(bad)}`, counts);
}

function T3(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T3');
  const c = {'코드 판': 0, '커밋 안 된 코드': 0, '자료 판': 0, '자료 파일': 0, '씨앗': 0};
  const bad = [];
  for (const b of boards) {
    if (!/^[0-9a-f]{7,40}$/.test(String(b.code?.commit ?? ''))) { c['코드 판']++; bad.push(b.id); }
    // ECO-01: 커밋 안 된 코드로 셈(dirty)이면 코드 판으로 다시 못 돌린다 — 「false」라고 적힌 것만 받는다(없음·글자도 안 통과)
    if (b.code?.dirty !== false) { c['커밋 안 된 코드']++; bad.push(b.id); }
    if (!/^[0-9a-f]{64}$/.test(String(b.dataVersion?.sha256 ?? ''))) { c['자료 판']++; bad.push(b.id); }
    // ECO-01: 자료 판의 파일 목록이 비면 어떤 자료로 셌는지 모른다
    const files = b.dataVersion?.files;
    if (!Array.isArray(files) || !files.length || !files.every(f => typeof f === 'string' && f.trim() !== '')) { c['자료 파일']++; bad.push(b.id); }
    if (!Number.isInteger(b.seed)) { c['씨앗']++; bad.push(b.id); }
  }
  const missing = Object.values(c).reduce((a, n) => a + n, 0);
  const counts = {boards: boards.length, missing};
  if (!missing) return result('T3', true, `판 ${boards.length}개 모두 코드 판(커밋됨)·자료 판(파일 목록)·씨앗 있음`, counts);
  return result('T3', false, `빠짐: ${kv(c)} — ${few(bad)}`, counts);
}

function T4(state, opts = {}) {
  if (typeof opts.engine !== 'function') return nothing('T4', '엔진 없음');
  const boards = list(state.boards);
  if (!boards.length) return nothing('T4');
  let rerun = 0;
  let skipped = 0;
  let differ = 0;
  let thrown = 0;
  const bad = [];
  for (const b of boards) {
    if (b.status === STATUS_KEEP) {
      skipped++;
      continue;
    }
    rerun++;
    let out;
    try {
      out = opts.engine(structuredClone(b.inputs), b.seed);
      if (out && typeof out.then === 'function') throw new Error('Promise 를 돌려줌');
    } catch (e) {
      thrown++;
      bad.push(`${b.id}: 엔진이 멈춤(${e.message})`);
      continue;
    }
    const same = isDeepStrictEqual(jsonRound(out?.kospi), b.kospi) && isDeepStrictEqual(jsonRound(out?.stocks), b.stocks);
    if (!same) {
      differ++;
      bad.push(b.id);
    }
  }
  const counts = {boards: boards.length, rerun, skipped, differ, thrown};
  if (!rerun) return nothing('T4', '다시 돌릴 판 없음 (모두 앞 판 유지)', counts);
  if (!differ && !thrown) return result('T4', true, `판 ${rerun}개 다시 돌려 모두 같은 값`, counts);
  return result('T4', false, `다시 돌린 값이 봉인과 다름 ${differ} · 멈춤 ${thrown} — ${few(bad)}`, counts);
}

function T5(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T5');
  const bad = [];
  for (const b of boards) {
    const sc = list(b.kospi?.scenarios);
    const names = sc.map(s => s?.name).sort().join('|');
    const sum = sc.reduce((a, s) => a + (isNum(s?.prob) ? s.prob : NaN), 0);
    const okProbs = sc.every(s => isNum(s?.prob) && s.prob >= 0 && s.prob <= 1);
    if (sc.length !== 3 || names !== ['가운데', '아래', '위'].sort().join('|')) bad.push(`${b.id}: 이름이 위·가운데·아래 셋이 아님`);
    else if (!okProbs || !(Math.abs(sum - 1) <= 1e-9)) bad.push(`${b.id}: 확률 합 ${Number.isFinite(sum) ? sum.toFixed(6) : '숫자 아님'}`);
  }
  const counts = {boards: boards.length, bad: bad.length};
  if (!bad.length) return result('T5', true, `판 ${boards.length}개 모두 위·가운데·아래 확률 합 100%`, counts);
  return result('T5', false, few(bad), counts);
}

function T6(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T6');
  const bad = [];
  for (const b of boards) {
    const r = b.reconciliation ?? {};
    const nodes = list(r.nodes).map(x => String(x));
    const level = isNum(b.kospi?.center) ? b.kospi.center : b.kospi?.anchor?.value;
    if (r.method !== 'MinT') bad.push(`${b.id}: 맞추는 법이 MinT 가 아님`);
    else if (!nodes.includes('나머지')) bad.push(`${b.id}: 「나머지」 마디 없음`);
    else if (!isNum(r.maxGap) || !isNum(level) || level === 0) bad.push(`${b.id}: 어긋남·코스피 값을 못 읽음`);
    else if (Math.abs(r.maxGap) / Math.abs(level) > 1e-6) bad.push(`${b.id}: 어긋남 ${r.maxGap} (코스피의 ${(Math.abs(r.maxGap) / Math.abs(level)).toExponential(1)})`);
    // ECO-01: 판에 있는 예측(코스피와 종목 모두)이 맞추기 마디에 있어야 맞춰진 것이다
    const missing = [];
    if (!nodes.includes('kospi')) missing.push('kospi');
    for (const s of list(b.stocks)) {
      const code = s?.code;
      if (code === null || code === undefined || String(code).trim() === '') missing.push('(번호 없는 종목)');
      else if (!nodes.includes(String(code))) missing.push(String(code));
    }
    if (missing.length) bad.push(`${b.id}: 맞추기 마디에 없는 예측 ${few(missing, 3)}`);
  }
  const counts = {boards: boards.length, bad: bad.length};
  if (!bad.length) return result('T6', true, `판 ${boards.length}개 모두 MinT 로 맞춰짐 (코스피·종목 모두 마디 · 나머지 마디 · 어긋남 0)`, counts);
  return result('T6', false, few(bad), counts);
}

const FEW_SOURCE_OK = ['한 출처', '없음', '확인 중', '옛값'];

/** 두 출처 값의 차이가 자료 약속의 허용 폭 안인가 — 안이면 null, 아니면 까닭 글. 첫째 출처가 기준(자료 약속 1번) */
function compareProblem(entry, a, b) {
  const cmp = entry?.compare;
  if (!entry) return '자료 약속에 없는 변수 — 허용 폭을 모름';
  if (!cmp || typeof cmp !== 'object') return '자료 약속에 허용 폭 없음';
  if (a === null || a === undefined || b === null || b === undefined) return '출처 값이 없음 — 견줄 수 없음';
  if (cmp.rule === 'exact') return isDeepStrictEqual(a, b) ? null : `두 출처 값이 다름 (${show(a)} · ${show(b)} — 약속은 「같아야 함」)`;
  if (cmp.rule === 'relative') {
    if (!isNum(a) || !isNum(b) || !isNum(cmp.tolerance) || cmp.tolerance < 0) return '두 출처 값을 견줄 수 없음 (숫자 아님)';
    const rel = a === 0 ? (b === 0 ? 0 : Infinity) : Math.abs(b - a) / Math.abs(a);
    if (rel <= cmp.tolerance + 1e-12) return null;
    return `두 출처 차이 ${(rel * 100).toFixed(3)}% — 허용 ${(cmp.tolerance * 100).toFixed(3)}% 넘음`;
  }
  return `자료 약속의 모르는 비교 규칙 「${show(cmp.rule)}」`;
}

/**
 * ECO-01: status 「ok」 변수가 모두 지킬 다섯 (+ 앞에 있던 시각·출처 둘·출처 시각)
 *   ① 출처 둘의 이름·주소가 서로 다르다 — 주소는 회사(등록 도메인)까지 달라야 한다(자료 약속 2번)
 *   ② fetchedAt 이 있다  ③ 값이 null 이 아니다
 *   ④ 두 출처 차이가 자료 약속 허용 폭 안 — 넘는데 「확인 중」 표시가 붙어 있으면 이미 밝힌 것으로 본다
 *   ⑤ 봉인(정보 시각) 4시간 안의 관측 — 넘는데 「옛값」 표시가 붙어 있으면 이미 밝힌 것으로 본다(자료 약속 13번)
 */
function okProblems(v, cut, contract, staleMs) {
  const out = [];
  const srcs = list(v.sources);
  const st = statusesOf(v);
  if (!Number.isFinite(ms(v.observedAt))) out.push('시각 없음');
  if (srcs.length !== 2) out.push(`「ok」인데 출처 ${srcs.length}개`);
  else if (!srcs.every(s => Number.isFinite(ms(s?.observedAt)))) out.push('출처 시각 없음');
  if (srcs.length === 2) {
    const name = s => (typeof s?.name === 'string' ? s.name.trim().replace(/\s+/g, ' ').toLowerCase() : '');
    const url = s => (typeof s?.url === 'string' ? s.url.trim() : '');
    const [a, b] = srcs;
    if (!name(a) || !name(b)) out.push('출처 이름 없음');
    else if (name(a) === name(b)) out.push('두 출처 이름이 같음');
    if (!url(a) || !url(b)) out.push('출처 주소 없음');
    else if (url(a) === url(b)) out.push('두 출처 주소가 같음');
    else {
      const oa = sourceOrg(url(a));
      const ob = sourceOrg(url(b));
      if (!oa || !ob) out.push('출처 주소를 못 읽음');
      else if (oa === ob) out.push(`두 출처가 같은 회사 (${oa}) — 출처 하나로 셈`);
    }
  }
  if (!Number.isFinite(ms(v.fetchedAt))) out.push('받은 시각(fetchedAt) 없음');
  if (v.value === null || v.value === undefined) out.push('「ok」인데 값이 없음(null)');
  if (srcs.length === 2 && !st.has('확인 중')) {
    const p = compareProblem(contractOf(contract, v.id), srcs[0]?.value, srcs[1]?.value);
    if (p) out.push(p);
  }
  if (!st.has('옛값')) {
    const times = [v.observedAt, ...srcs.map(s => s?.observedAt)].map(ms).filter(Number.isFinite);
    if (!Number.isFinite(cut)) out.push('봉인 시각이 없어 4시간을 잴 수 없음');
    else if (times.length) {
      const age = cut - Math.min(...times);
      if (age > staleMs) out.push(`봉인 ${(age / HOUR).toFixed(1)}시간 전 관측인데 「옛값」 없음`);
    }
  }
  return out;
}

function T7(state, opts = {}) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T7');
  const contract = opts.contract ?? state.contract ?? defaultContract();
  const staleH = Math.min(STALE_HOURS, isNum(contract?.staleAfterHours) && contract.staleAfterHours > 0 ? contract.staleAfterHours : STALE_HOURS);
  let variables = 0;
  let okVariables = 0;
  const bad = [];
  for (const b of boards) {
    const cut = cutOf(b);
    for (const v of list(b.inputs?.variables)) {
      variables++;
      const st = statusesOf(v);
      const srcs = list(v.sources);
      const where = `${b.id} ${v.id}`;
      if (v.status === 'ok') {
        okVariables++;
        for (const p of okProblems(v, cut, contract, staleH * HOUR)) bad.push(`${where}: ${p}`);
      } else if (srcs.length < 2 && !FEW_SOURCE_OK.some(x => st.has(x))) {
        bad.push(`${where}: 출처 ${srcs.length}개인데 표시가 「${v.status}」`);
      }
      if (st.has('없음') && v.value !== null) bad.push(`${where}: 「없음」인데 값이 ${v.value}`);
    }
  }
  const counts = {boards: boards.length, variables, okVariables, bad: bad.length};
  if (!variables) return nothing('T7', '변수 없음', counts);
  if (!bad.length) return result('T7', true, `변수 ${variables}개 모두 시각·출처 둘 (모자라면 표시) · 「ok」 ${okVariables}개는 다섯 조건 지킴`, counts);
  return result('T7', false, `${bad.length}곳 — ${few(bad)}`, counts);
}

function T8(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T8');
  const viewByBoard = new Map();
  const collect = (v, ref) => {
    if (Array.isArray(v)) return v.forEach(x => collect(x, ref));
    if (v && typeof v === 'object') {
      const here = typeof v.boardId === 'string' ? v.boardId : ref;
      if (here !== ref) {
        if (!viewByBoard.has(here)) viewByBoard.set(here, []);
        viewByBoard.get(here).push(v);
      }
      for (const [k, x] of Object.entries(v)) if (k !== 'boardId') collect(x, here);
    }
  };
  collect(state.view, null);
  let entries = 0;
  let disagree = 0;
  const bad = [];
  for (const b of boards) {
    const paths = list(b.twoPath);
    // ECO-01: 새로 셈한 「봉인」 판은 두 길 계산(두 숫자가 다 있는 것)이 하나 이상 있어야 한다.
    // 앞 판을 그대로 두는 판(시간 초과·다시 봉인)은 새로 세지 않으므로 뺀다.
    if (b.status === STATUS_SEALED && !paths.some(e => isNum(e?.pathA) && isNum(e?.pathB))) bad.push(`${b.id}: 봉인 판인데 두 길 계산 없음`);
    for (const e of paths) {
      entries++;
      if (!isNum(e?.pathA) || !isNum(e?.pathB)) {
        bad.push(`${b.id} ${e?.what}: 두 길 숫자 없음 (pathA·pathB)`);
        continue;
      }
      const tol = isNum(e.tolerance) ? Math.abs(e.tolerance) : 0;
      const gap = Math.abs(e.pathA - e.pathB);
      const differs = !(gap <= tol);
      if (differs && e.agree !== false) bad.push(`${b.id} ${e.what}: 두 길이 ${Number.isFinite(gap) ? gap : '?'} 다른데 「같음」`);
      if (e.agree !== false && !differs) continue;
      disagree++;
      const near = x => [e.pathA, e.pathB].some(p => isNum(p) && Math.abs(x - p) <= Math.max(tol, 1e-9));
      // 어긋난 숫자는 판의 screen 에도, 화면 파일의 그 판 덩어리에도 나오면 안 된다. 「확인 중」은 판의 screen 이 말해야 한다.
      let shown = false;
      let saysChecking = false;
      const walk = (v, own) => {
        if (typeof v === 'number') shown ||= near(v);
        else if (typeof v === 'string') {
          if (own && v.includes('확인 중')) saysChecking = true;
          if (numbersInText(v).some(near)) shown = true;
        } else if (Array.isArray(v)) v.forEach(x => walk(x, own));
        else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'boardId') walk(x, own);
      };
      walk(b.screen, true);
      for (const s of viewByBoard.get(b.id) ?? []) walk(s, false);
      if (shown) bad.push(`${b.id} ${e.what}: 어긋난 숫자가 화면에 나옴`);
      else if (!saysChecking) bad.push(`${b.id} ${e.what}: 화면에 「확인 중」 없음`);
    }
  }
  const counts = {boards: boards.length, entries, disagree, bad: bad.length};
  if (!entries) return nothing('T8', '두 길 계산 기록 없음', counts);
  if (!bad.length) return result('T8', true, `두 길 ${entries}개 — 어긋난 ${disagree}개는 모두 화면에 「확인 중」`, counts);
  return result('T8', false, few(bad), counts);
}

// ───────────────────────────── 운영·채점 T9~T16 ─────────────────────────────

function T9(state) {
  const loops = list(state.loops);
  if (!loops.length) return nothing('T9', '고리 기록 없음');
  const boards = new Map(list(state.boards).map(b => [b.id, b]));
  const bad = [];
  let over = 0;
  for (const l of loops) {
    const span = (ms(l.endedAt) - ms(l.startedAt)) / MINUTE;
    const minutes = Number.isFinite(span) ? span : l.minutes;
    if (!isNum(minutes)) {
      bad.push(`${l.loopId}: 걸린 시간을 못 읽음`);
      continue;
    }
    if (minutes <= 40) continue;
    over++;
    const b = boards.get(l.boardId);
    if (l.status !== '시간 초과') bad.push(`${l.loopId}: ${minutes.toFixed(1)}분인데 「시간 초과」 표시 없음`);
    else if (!b || b.status !== STATUS_KEEP) bad.push(`${l.loopId}: 시간 초과인데 판이 「${STATUS_KEEP}」 아님`);
  }
  const counts = {loops: loops.length, over, bad: bad.length};
  if (!bad.length) return result('T9', true, `고리 ${loops.length}개 — 40분 넘은 ${over}개는 앞 판 유지`, counts);
  return result('T9', false, few(bad), counts);
}

function T10(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T10');
  let strings = 0;
  const hits = [];
  const scan = (obj, label) => walkStrings(obj, '', (s, where) => {
    strings++;
    for (const f of FORBIDDEN) if (f.re.test(s)) hits.push(`「${f.word}」 ${label} ${where}`);
  });
  for (const b of boards) scan(b, b.id);
  if (state.view) scan(state.view, '화면');
  const counts = {strings, hits: hits.length};
  if (!hits.length) return result('T10', true, `금지 말 0 (글 ${strings}개 검사)`, counts);
  return result('T10', false, `금지 말 ${hits.length}곳 — ${few(hits)}`, counts);
}

/**
 * T11 의 속: 바뀐 파일 목록에서 옛 엔진·옛 기록·덧붙이기만 받는 장부를 어긴 것을 센다 (순수 함수)
 *   지키는 곳(PROTECTED): 무엇이든 바뀌면 안 통과 — 더하기(A)·고치기(M)·지우기(D)·이름 바꾸기(R)·그 밖
 *   덧붙이기만 받는 곳(APPEND_ONLY): 새 파일(A) · 지운 줄 0 인 고치기(M) 만 받는다.
 *     appendOnly 칸이 있으면 true 일 때만 받는다(false = 중간에 끼움 · null = 모름).
 *   이름 바꾸기는 옛 주소(oldPath)·새 주소(newPath)도 함께 본다. 주소가 없는 줄은 잴 수 없어 안 통과.
 */
export function checkOldEngineUntouched(changes) {
  if (!Array.isArray(changes)) return nothing('T11', '깃 기록 없음');
  const commits = new Set(changes.map(c => c?.commit)).size;
  if (!changes.length) return nothing('T11', '바뀐 파일 기록 없음', {commits: 0, changes: 0, touched: 0});
  const bad = [];
  const under = (dirs, ps) => ps.find(p => dirs.some(dir => p.startsWith(dir)));
  for (const c of changes) {
    const st = String(c?.status ?? '?')[0];
    const ps = [c?.path, c?.oldPath, c?.newPath].filter(p => typeof p === 'string' && p !== '');
    if (!ps.length) {
      bad.push(`(주소 없는 변경) (${st})`);
      continue;
    }
    const prot = under(PROTECTED, ps);
    if (prot) {
      bad.push(`${prot} (${st})`);
      continue;
    }
    const app = under(APPEND_ONLY, ps);
    if (!app) continue;
    if (st === 'A' && ps.length === 1) continue;
    if (st === 'M' && c.deletedLines === 0 && (!('appendOnly' in c) || c.appendOnly === true)) continue;
    let why = st;
    if (st === 'M') {
      if (c.deletedLines !== 0) why = `줄 ${c.deletedLines ?? '?'}개 지우거나 고침`;
      else why = c.appendOnly === false ? '줄을 끝이 아닌 곳에 끼움 — 덧붙이기가 아님' : '덧붙이기인지 모름';
    }
    bad.push(`${app} (${why})`);
  }
  const counts = {commits, changes: changes.length, touched: bad.length};
  if (!bad.length) return result('T11', true, `atlas4h 커밋 ${commits}개 · 파일 ${changes.length}개 — 옛 엔진·기록 변경 0 · 장부는 덧붙이기만`, counts);
  return result('T11', false, `옛 엔진·기록을 건드림 ${bad.length} — ${few(bad)}`, counts);
}

/**
 * T11 에 줄 목록: base 뒤 「atlas4h」 로 시작하는 커밋의 바뀐 파일 (깃을 못 쓰면 null)
 * 덧붙이기만 받는 곳(APPEND_ONLY)의 고친 파일(M)에는 appendOnly 를 붙인다 — 앞 판 글자가 새 판의 앞부분 그대로인가.
 */
export function collectAtlas4hChanges(repoRoot, base = T11_BASE) {
  const git = args => execFileSync('git', ['-C', repoRoot, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20});
  const blob = spec => {
    try {
      return execFileSync('git', ['-C', repoRoot, 'show', spec], {stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 << 20});
    } catch {
      return null;
    }
  };
  const appendOnly = (commit, p) => {
    const before = blob(`${commit}^:${p}`);
    const after = blob(`${commit}:${p}`);
    if (!before || !after) return null;
    return after.length >= before.length && after.subarray(0, before.length).equals(before);
  };
  try {
    const log = git(['log', '--format=%H%x09%s', `${base}..HEAD`]);
    const out = [];
    for (const line of log.split('\n').filter(Boolean)) {
      const tab = line.indexOf('\t');
      const commit = line.slice(0, tab);
      const subject = line.slice(tab + 1);
      if (!subject.startsWith('atlas4h')) continue;
      const names = git(['show', '--no-renames', '--diff-merges=first-parent', '--name-status', '-z', '--format=', commit]).split('\0').filter(Boolean);
      const nums = git(['show', '--no-renames', '--diff-merges=first-parent', '--numstat', '-z', '--format=', commit]).split('\0').filter(Boolean);
      const deleted = new Map();
      for (const n of nums) {
        const [, del, p] = n.split('\t');
        deleted.set(p, del === '-' ? null : Number(del));
      }
      for (let i = 0; i + 1 < names.length; i += 2) {
        const status = names[i].trim();
        const p = names[i + 1];
        const row = {commit, subject, status, path: p, deletedLines: deleted.has(p) ? deleted.get(p) : null};
        if (status[0] === 'M' && APPEND_ONLY.some(dir => p.startsWith(dir))) row.appendOnly = appendOnly(commit, p);
        out.push(row);
      }
    }
    return out;
  } catch {
    return null;
  }
}

/** T19 에 줄 시각: 판정 기준 파일을 마지막으로 바꾼 커밋 시각 (없으면 null) */
export function judgmentCommitTime(repoRoot, rel = 'atlas4h/seal/judgment.json') {
  try {
    const t = execFileSync('git', ['-C', repoRoot, 'log', '-1', '--format=%cI', '--', rel], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
    return t || null;
  } catch {
    return null;
  }
}

function T11(state, opts = {}) {
  return checkOldEngineUntouched(opts.changes ?? state.changes);
}

function T12(state) {
  const retro = state.retro;
  const rows = list(retro?.rows ?? retro?.scores);
  if (!retro) return nothing('T12', '재현 결과 없음');
  if (!rows.length) return nothing('T12', '재현 채점 줄 없음');
  const sorted = [...rows].sort((a, b) => String(a.target).localeCompare(String(b.target)) || String(a.boardId).localeCompare(String(b.boardId)));
  const notAlpha = sorted.filter(r => r.interval?.alpha !== 0.2).length;
  const engine = sorted.map(r => r.interval?.score);
  const perTarget = new Map();
  for (const r of sorted) perTarget.set(r.target, (perTarget.get(r.target) ?? 0) + 1);
  const lag = Math.max(0, Math.max(...perTarget.values()) - 1);
  const counts = {rows: sorted.length, lag, baselines: {}};
  if (notAlpha) return result('T12', false, `구간 α 가 0.2 가 아닌 줄 ${notAlpha}개`, counts);
  if (!engine.every(isNum)) return result('T12', false, `엔진 구간 점수 없는 줄 ${engine.filter(x => !isNum(x)).length}개`, counts);
  if (sorted.length < lag + 2) return result('T12', false, `표본 부족 (${sorted.length}줄 · 겹침 ${lag})`, counts);
  const lost = [];
  for (const id of BASELINES) {
    const base = sorted.map(r => list(r.baselines).find(x => x?.id === id));
    const missing = sorted.filter((r, i) => !base[i] || !isNum(base[i].interval) || base[i].note === '없음').map(r => r.target);
    if (missing.length) {
      counts.baselines[id] = {missing: missing.length};
      return result('T12', false, `기준 「${id}」 점수 없음 — ${few(missing)} (${missing.length}줄)`, counts);
    }
    const b = base.map(x => x.interval);
    const dm = dmTest(b, engine, {lag});
    const info = {meanEngine: mean(engine), meanBaseline: mean(b), dm: dm.stat, p: dm.p, T: dm.T};
    counts.baselines[id] = info;
    if (!(info.meanEngine < info.meanBaseline)) lost.push(`「${id}」보다 폭 점수가 낮지 않음`);
    // ECO-01: 줄마다 차이가 똑같으면 DM 을 셀 수 없다 — 멈추지 않고 「안 통과」 (p 가 null 이면 null < 0.05 가 참이 되는 것도 막음)
    else if (!isNum(dm.p)) lost.push(`「${id}」 DM 셈 불가(${dm.note === '분산 0' ? '차이 분산 0' : dm.note ?? '까닭 모름'})`);
    else if (!(dm.p < 0.05)) lost.push(`「${id}」 DM p ${dm.p.toFixed(3)}`);
  }
  if (!lost.length) {
    const ps = BASELINES.map(id => counts.baselines[id].p.toFixed(3)).join(' · ');
    return result('T12', true, `재현 ${sorted.length}줄에서 기준 셋 모두 이김 (DM p ${ps})`, counts);
  }
  return result('T12', false, `못 이김: ${lost.join(' · ')}`, counts);
}

function T13(state) {
  const scores = list(state.scores);
  if (!scores.length) return nothing('T13', '채점 없음');
  const boards = new Map(list(state.boards).map(b => [b.id, b]));
  const seen = new Set();
  const rows = [];
  let unknown = 0;
  let disagree = 0;
  for (const s of scores) {
    if (seen.has(s?.boardId)) continue;
    seen.add(s?.boardId);
    const recorded = typeof s?.interval?.covered === 'boolean' ? s.interval.covered : null;
    const q = boards.get(s?.boardId)?.kospi?.quantiles;
    const y = s?.actual?.value;
    const recomputed = q && isNum(q.p10) && isNum(q.p90) && isNum(y) ? q.p10 <= y && y <= q.p90 : null;
    if (recomputed !== null && recorded !== null && recomputed !== recorded) disagree++;
    const covered = recomputed ?? recorded;
    if (covered === null) {
      unknown++;
      continue;
    }
    rows.push({covered, crisis: s.crisis === true});
  }
  // ECO-01: 평소 판과 위기 판을 따로 센다. 70~90% 판정과 30판 문턱은 평소 판만으로 — 위기 판이 평소 판의 빗나감을 가리지 못하게
  const normal = rows.filter(r => !r.crisis);
  const crisisRows = rows.filter(r => r.crisis);
  const n = normal.length;
  const hit = normal.filter(r => r.covered).length;
  const share = n ? hit / n : NaN;
  const crisisShare = crisisRows.length ? crisisRows.filter(r => r.covered).length / crisisRows.length : null;
  const kup = n ? kupiecLR(n - hit, n, 0.2) : {lr: NaN, p: NaN};
  const counts = {scored: rows.length, normal: n, covered: hit, share, kupiecP: kup.p, crisis: {scored: crisisRows.length, share: crisisShare}, unknown, disagree};
  const pct = x => `${(x * 100).toFixed(1)}%`;
  if (unknown) return result('T13', false, `덮음을 잴 수 없는 채점 ${unknown}개`, counts);
  if (disagree) return result('T13', false, `채점 기록의 덮음이 봉인 범위와 다름 ${disagree}개`, counts);
  if (n < 30) return result('T13', false, `평소 판 ${n}판 — 30판이 안 됨 (위기 ${crisisRows.length}판은 따로 셈)`, counts);
  if (!(share >= 0.7 && share <= 0.9)) return result('T13', false, `평소 판 80% 범위 덮음 ${pct(share)} — 70~90% 밖 (${n}판)`, counts);
  if (crisisShare === null) return result('T13', false, `평소 덮음 ${pct(share)} (${n}판) · 위기 판 없음 — 따로 잴 수 없음`, counts);
  return result('T13', true, `평소 판 80% 범위 덮음 ${pct(share)} (${n}판) · 위기 따로 ${pct(crisisShare)} (${crisisRows.length}판)`, counts);
}

function T14(state) {
  if (!list(state.boards).length) return nothing('T14');
  if (!state.view) return nothing('T14', '화면 파일 없음');
  const boards = new Map(list(state.boards).map(b => [b.id, b]));
  let numbers = 0;
  const bad = [];
  walkViewNumbers(state.view, [], null, (x, pathArr, ref) => {
    if (ref === null) return;
    numbers++;
    const b = boards.get(ref);
    if (!b) return bad.push(`${ref}: 그런 판 없음`);
    const got = getPath(b, pathArr);
    if (!got.found || got.value !== x) bad.push(`${ref} ${pathArr.join('.')}: 화면 ${x} · 봉인 ${got.found ? JSON.stringify(got.value) : '없음'}`);
  });
  const counts = {numbers, mismatches: bad.length};
  if (!numbers) return nothing('T14', '판을 가리키는 화면 숫자 없음', counts);
  if (!bad.length) return result('T14', true, `화면 숫자 ${numbers}개 모두 봉인 값과 같음`, counts);
  return result('T14', false, `봉인 값과 다른 화면 숫자 ${bad.length} — ${few(bad)}`, counts);
}

function T15(state, opts = {}) {
  if (typeof opts.engine !== 'function') return nothing('T15', '엔진 없음');
  const rs = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7'].map(id => CHECKS[id](state, opts));
  const failed = rs.filter(r => !r.pass);
  const counts = {passed: rs.length - failed.length, failed: failed.length};
  if (!failed.length) return result('T15', true, '극한 K1~K7 모두 통과', counts);
  return result('T15', false, `극한 안 통과: ${failed.map(r => `${r.id}(${r.reason})`).slice(0, 2).join(' · ')}${failed.length > 2 ? ` 외 ${failed.length - 2}` : ''}`, counts);
}

function T16(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T16');
  const w = state.weights;
  if (!w) return nothing('T16', '무게 근거 없음');
  const cand = new Map(list(w.candidates).map(c => [c.id, c]));
  let centers = 0;
  const bad = [];
  for (const b of boards) {
    for (const e of list(b.engines)) {
      if (e?.role !== '가운데' || e.id === w.baseline) continue;
      centers++;
      const c = cand.get(e.id);
      const beats = c?.beatsNoChange === true && isNum(c?.dm?.p) && c.dm.p < 0.05;
      if (!beats && e.weight !== 0) bad.push(`${b.id} ${e.id}: 무판을 못 이겼는데 무게 ${e.weight}${c ? '' : ' (근거에 없는 후보)'}`);
    }
  }
  const counts = {boards: boards.length, centerCandidates: centers, bad: bad.length};
  if (!centers) return nothing('T16', '가운데 후보 없음', counts);
  if (!bad.length) return result('T16', true, `가운데 후보 ${centers}개 — 무판을 못 이긴 것은 모두 무게 0`, counts);
  return result('T16', false, few(bad), counts);
}

// ───────────────────────────── 누수·감시 T17~T23 ─────────────────────────────

function T17(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T17');
  let events = 0;
  const bad = [];
  for (const b of boards) {
    for (const e of list(b.events)) {
      events++;
      const lc = e?.leakCheck;
      if (!lc || !isNum(lc.checked) || !(lc.checked > 0)) bad.push(`${b.id} ${e?.name}: 누수 검사 안 함`);
      else if (lc.postSealHits !== 0) bad.push(`${b.id} ${e?.name}: 봉인 뒤 정보 ${lc.postSealHits}건`);
    }
  }
  const counts = {boards: boards.length, events, bad: bad.length};
  if (!events) return nothing('T17', '사건 확률 기록 없음', counts);
  if (!bad.length) return result('T17', true, `사건 ${events}개 모두 누수 검사 · 봉인 뒤 정보 0`, counts);
  return result('T17', false, few(bad), counts);
}

function T18(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T18');
  const judged = boards.filter(b => b.retro === true && b.llm?.used === true);
  const bad = [];
  for (const b of judged) {
    const target = ms(b.target?.date);
    const cutoff = ms(b.llm?.trainingCutoff);
    if (!Number.isFinite(target) || !Number.isFinite(cutoff)) bad.push(`${b.id}: 날짜를 못 읽음`);
    else if (!(target > cutoff)) bad.push(`${b.id}: 겨눈 날 ${b.target.date} ≤ 학습 마감 ${b.llm.trainingCutoff}`);
  }
  const counts = {boards: boards.length, retroLlm: judged.length, bad: bad.length};
  if (!judged.length) return nothing('T18', 'LLM 을 쓴 재현 판 없음', counts);
  if (!bad.length) return result('T18', true, `LLM 재현 판 ${judged.length}개 모두 학습 마감 뒤 날짜`, counts);
  return result('T18', false, few(bad), counts);
}

function T19(state, opts = {}) {
  const j = state.judgment;
  if (!j) return nothing('T19', '판정 기준 없음');
  const times = [...list(state.scores), ...list(state.retro?.rows)].map(s => ms(s?.scoredAt)).filter(Number.isFinite);
  if (!times.length) return nothing('T19', '채점 없음');
  const first = Math.min(...times);
  const sealed = ms(j.sealedAt);
  const commitAt = opts.judgmentCommitAt ?? state.judgmentCommitAt ?? null;
  const committed = ms(commitAt);
  const counts = {scores: times.length, firstScoredAt: new Date(first).toISOString(), sealedAt: j.sealedAt ?? null, commitAt};
  if (!Number.isFinite(sealed)) return result('T19', false, '판정 기준에 봉인 시각 없음', counts);
  if (!(sealed < first)) return result('T19', false, '판정 기준 봉인이 첫 채점보다 늦음', counts);
  if (!Number.isFinite(committed)) return result('T19', false, '판정 기준 커밋 시각을 모름', counts);
  if (!(committed < first)) return result('T19', false, '판정 기준 커밋이 첫 채점보다 늦음', counts);
  return result('T19', true, '판정 기준 봉인·커밋 모두 첫 채점 전', counts);
}

function T20(state) {
  const w = state.weights;
  if (!w) return nothing('T20', '무게 근거 없음');
  const sel = list(w.selections);
  if (!sel.length) return nothing('T20', '고른 기록 없음');
  const trials = list(state.trials);
  const trialIds = new Set(trials.map(t => t?.id));
  const bad = [];
  // ECO-01: 시도 장부 줄마다 결과 봉인 시각(sealedAt)이 있어야 한다
  trials.forEach((t, i) => {
    if (!Number.isFinite(ms(t?.sealedAt))) bad.push(`${t?.id ?? `시도 장부 ${i + 1}째 줄`}: 시도 결과 봉인 시각(sealedAt) 없음`);
  });
  for (const s of sel) {
    const cited = list(s?.trialIds);
    if (!cited.length) bad.push(`${s?.id}: 시도 번호를 안 적음`);
    const lost = cited.filter(id => !trialIds.has(id));
    if (lost.length) bad.push(`${s?.id}: 장부에 없는 시도 ${few(lost)}`);
    // ECO-01: 고른 시도(chose)가 SPA 를 거친 목록(trialIds) 안에 있어야 한다
    const chosen = (Array.isArray(s?.chose) ? s.chose : [s?.chose]).filter(x => x !== null && x !== undefined && x !== '');
    if (!chosen.length) bad.push(`${s?.id}: 고른 시도(chose)를 안 적음`);
    const outside = chosen.filter(id => !cited.includes(id));
    if (outside.length) bad.push(`${s?.id}: 고른 시도 ${few(outside.map(show))} 가 SPA 를 거친 목록 밖`);
    if (!(isNum(s?.spa?.p) && s.spa.p >= 0 && s.spa.p <= 1)) bad.push(`${s?.id}: SPA p 없음`);
    // ECO-01: SPA 를 못 넘은(p ≥ 0.05) 것을 고르면 안 통과
    else if (!(s.spa.p < 0.05)) bad.push(`${s?.id}: SPA p ${s.spa.p} ≥ 0.05 인데 고름`);
  }
  const counts = {selections: sel.length, trials: trialIds.size, bad: bad.length};
  if (!bad.length) return result('T20', true, `고른 기록 ${sel.length}개 — 시도 모두 장부에 있고(봉인 시각 있음) 고른 시도는 SPA(p < 0.05)를 거침`, counts);
  return result('T20', false, few(bad), counts);
}

/** 판 번호 꼴 (board.md: 4h-YYYYMMDD-HH-8자 · 재현 판은 r4h-) */
const BOARD_ID_RE = /r?4h-\d{8}-\d{2}-[0-9a-f]{8}/g;
const BOARD_ID_FULL_RE = /^r?4h-\d{8}-\d{2}-[0-9a-f]{8}$/;
/** 앞 판을 가리키는 말 — 「앞 판」·prevBoard·previous-board · 판 장부 파일(ledger/boards) */
const PREV_BOARD_RE = /앞\s*판|prev(?:ious)?[\s_-]*board|ledger\/boards\//i;
const PLAIN_NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

/** 판이 낸 숫자(엔진이 셈한 것): 코스피 가운데·범위·시나리오 폭 · 종목 가운데·범위 · 화면 값 */
function boardOutputs(b) {
  const xs = [];
  const add = x => { if (isNum(x)) xs.push(x); };
  add(b?.kospi?.center);
  Object.values(b?.kospi?.quantiles ?? {}).forEach(add);
  for (const s of list(b?.kospi?.scenarios)) { add(s?.kospi?.low); add(s?.kospi?.high); }
  for (const s of list(b?.stocks)) { add(s?.center); Object.values(s?.quantiles ?? {}).forEach(add); }
  add(b?.screen?.value);
  return xs;
}

/**
 * ECO-01: 엔진 입력에서 앞 판 id·앞 판 값을 직접 찾는다 — 처음 찾은 것의 설명, 없으면 null
 *   글(값과 칸 이름 모두): 자기 판이 아닌 판 번호 · 장부에 있는 꼴 다른 판 id · 「앞 판」을 가리키는 말
 *   숫자(isEarlier 가 있을 때만): 앞 판이 낸 숫자와 같은 숫자 (엔진 입력 목록은 변수 이름이라 숫자가 올 까닭이 없다)
 */
function findPreviousBoard(v, ownId, oddIds, isEarlier) {
  let hit = null;
  const text = s => {
    for (const m of s.match(BOARD_ID_RE) ?? []) if (m !== ownId) return `앞 판 id ${m}`;
    for (const id of oddIds) if (id !== ownId && s.includes(id)) return `앞 판 id ${id}`;
    if (PREV_BOARD_RE.test(s)) return `앞 판을 가리킴 「${s.length > 40 ? `${s.slice(0, 40)}…` : s}」`;
    if (isEarlier && PLAIN_NUMBER_RE.test(s.trim()) && isEarlier(Number(s.trim()))) return `앞 판 값 ${s.trim()}`;
    return null;
  };
  const walk = x => {
    if (hit) return;
    if (typeof x === 'string') hit = text(x);
    else if (typeof x === 'number') { if (isEarlier && isEarlier(x)) hit = `앞 판 값 ${x}`; }
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') for (const [k, y] of Object.entries(x)) { if (!hit) hit = text(k); walk(y); }
  };
  walk(v);
  return hit;
}

function T21(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T21');
  // 판 번호 꼴이 아닌 id 만 글 속에 들어 있는지 하나씩 본다 (꼴이 맞는 id 는 BOARD_ID_RE 가 잡는다)
  const oddIds = boards.map(b => b?.id).filter(x => typeof x === 'string' && x !== '' && !BOARD_ID_FULL_RE.test(x));
  // 숫자마다 그 숫자를 낸 판 중 가장 이른 정보 시각 — 「앞 판 값」 = 이 판보다 이른 판이 낸 숫자
  const firstSeen = new Map();
  for (const o of boards) {
    const t = cutOf(o);
    if (!Number.isFinite(t)) continue;
    for (const x of boardOutputs(o)) if (!(firstSeen.get(x) <= t)) firstSeen.set(x, t);
  }
  let engines = 0;
  const bad = [];
  const c = {'앞 판을 봤거나 기록 없음': 0, '입력에 앞 판': 0};
  for (const b of boards) {
    const cut = cutOf(b);
    const isEarlier = x => firstSeen.has(x) && firstSeen.get(x) < cut;
    for (const e of list(b.engines)) {
      engines++;
      if (e?.sawPreviousBoard !== false) {
        c['앞 판을 봤거나 기록 없음']++;
        bad.push(`${b.id} ${e?.id}`);
      }
      const hit = findPreviousBoard(e?.inputs, b.id, oddIds, isEarlier);
      if (hit) {
        c['입력에 앞 판']++;
        bad.push(`${b.id} ${e?.id}: 입력에 ${hit}`);
      }
    }
    // 엔진 함수에 들어간 판 입력(inputs) 전체 — 변수 이름·출처 이름·주소에 앞 판이 섞였나 (자료 값끼리 우연히 같은 숫자는 보지 않음)
    const hit = findPreviousBoard(b.inputs, b.id, oddIds, null);
    if (hit) {
      c['입력에 앞 판']++;
      bad.push(`${b.id} inputs: ${hit}`);
    }
  }
  const counts = {boards: boards.length, engines, bad: bad.length};
  if (!engines) return nothing('T21', '엔진 기록 없음', counts);
  if (!bad.length) return result('T21', true, `엔진 ${engines}개 모두 앞 판 안 봄 (기록 · 입력에서 앞 판 id·값 0)`, counts);
  return result('T21', false, `${kv(c)} — ${few(bad)}`, counts);
}

function T22(state) {
  const boards = list(state.boards);
  if (!boards.length) return nothing('T22');
  const bad = [];
  for (const b of boards) {
    const st = b.structures;
    if (!Array.isArray(st) || !st.length) {
      bad.push(`${b.id}: 구조 번호 없음`);
      continue;
    }
    const wrong = st.filter(x => !/^[A-F][1-6]$/.test(String(x)));
    const letters = new Set(st.filter(x => /^[A-F][1-6]$/.test(String(x))).map(x => x[0]));
    const emptyCells = ['A', 'B', 'C', 'D', 'E', 'F'].filter(x => !letters.has(x));
    if (wrong.length) bad.push(`${b.id}: 없는 번호 ${few(wrong)}`);
    if (emptyCells.length) bad.push(`${b.id}: 빈 칸 ${emptyCells.join('·')}`);
  }
  const counts = {boards: boards.length, bad: bad.length};
  if (!bad.length) return result('T22', true, `판 ${boards.length}개 모두 A~F 여섯 칸 구조 번호`, counts);
  return result('T22', false, few(bad), counts);
}

/** 짓는 일꾼 이름 (workers/README.md): 바탕·고리·평가 일꾼 · 에이전트 이름 atlas4h-base·loop·eval */
const BUILDER_RE = /(?:바탕|고리|평가)\s*일꾼|atlas4h-(?:base|loop|eval)\b|\b(?:base|loop|eval(?:uator)?)[\s_-]*(?:worker|agent)\b/i;
export function isBuilder(by) {
  const s = String(by ?? '').trim();
  return BUILDER_RE.test(s) || /^(?:바탕|고리|평가)$/.test(s);
}

function T23(state) {
  const loops = list(state.loops);
  if (!loops.length) return nothing('T23', '고리 기록 없음');
  const watch = new Map();
  for (const w of list(state.watch)) {
    if (!watch.has(w?.loopId)) watch.set(w?.loopId, []);
    watch.get(w?.loopId).push(w);
  }
  const bad = [];
  for (const l of loops) {
    const ws = watch.get(l.loopId) ?? [];
    if (!ws.length) {
      bad.push(`${l.loopId}: 감시 기록 없음`);
      continue;
    }
    for (const w of ws) {
      // ECO-01: 보는 눈은 짓는 이와 다른 에이전트 — 감시한 이(by)가 없거나 짓는 일꾼(바탕·고리·평가)이면 안 통과
      const by = typeof w?.by === 'string' ? w.by.trim() : '';
      if (!by) bad.push(`${l.loopId}: 감시한 이(by) 없음`);
      else if (isBuilder(by)) bad.push(`${l.loopId}: 감시한 이가 짓는 일꾼 「${by}」`);
      else if (typeof l.by === 'string' && l.by.trim() === by) bad.push(`${l.loopId}: 감시한 이가 고리를 지은 이와 같음 「${by}」`);
      const nonzero = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].filter(k => w?.S?.[k] !== 0);
      if (nonzero.length) bad.push(`${l.loopId}: ${nonzero.map(k => `${k}=${w?.S?.[k] ?? '없음'}`).join(' ')}`);
    }
  }
  const counts = {loops: loops.length, watch: list(state.watch).length, bad: bad.length};
  if (!bad.length) return result('T23', true, `고리 ${loops.length}개 모두 감시 S1~S8 = 0 · 감시는 짓는 일꾼이 아닌 이`, counts);
  return result('T23', false, few(bad), counts);
}

// ───────────────────────────── 극한 K1~K7 ─────────────────────────────

const extremeCache = new Map();
function loadExtreme(id, dir) {
  const file = path.join(dir, `${id}.json`);
  if (!extremeCache.has(file)) {
    let fx = null;
    try {
      fx = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      fx = null;
    }
    extremeCache.set(file, fx);
  }
  return structuredClone(extremeCache.get(file));
}

/** 숫자가 아닌 숫자(NaN·무한)를 찾는다 */
function findNonFinite(v, where = '') {
  if (typeof v === 'number') return Number.isFinite(v) ? null : where || '(값)';
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      const f = findNonFinite(v[i], `${where}[${i}]`);
      if (f) return f;
    }
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      const f = findNonFinite(x, where ? `${where}.${k}` : k);
      if (f) return f;
    }
  }
  return null;
}

function quantileProblem(q, where) {
  if (!q || typeof q !== 'object') return `${where} 범위 없음`;
  const order = ['p10', 'p25', 'p50', 'p75', 'p90'].filter(k => k in q);
  if (!['p10', 'p50', 'p90'].every(k => isNum(q[k]))) return `${where} p10·p50·p90 숫자 없음`;
  for (let i = 1; i < order.length; i++) {
    if (!isNum(q[order[i]]) || q[order[i]] < q[order[i - 1]]) return `${where} 범위 순서가 뒤집힘 (${order[i - 1]} > ${order[i]})`;
  }
  return null;
}

/** 모든 결과가 지킬 바닥 약속: 깨짐 0 · 숫자 맞음 */
function basicProblems(out) {
  if (!out || typeof out !== 'object') return '엔진 결과가 비었음';
  const nf = findNonFinite(out);
  if (nf) return `숫자가 아님(NaN·무한) — ${nf}`;
  const keep = out.status === STATUS_KEEP || out.status === STATUS_RESEAL;
  if (!(keep && (out.kospi === null || out.kospi === undefined))) {
    if (!isNum(out.kospi?.center)) return '코스피 가운데 값 없음';
    const qp = quantileProblem(out.kospi?.quantiles, '코스피');
    if (qp) return qp;
    if (out.kospi.scenarios !== undefined) {
      const sc = list(out.kospi.scenarios);
      const names = sc.map(s => s?.name).sort().join('|');
      const sum = sc.reduce((a, s) => a + s?.prob, 0);
      if (names !== ['가운데', '아래', '위'].sort().join('|') || !(Math.abs(sum - 1) <= 1e-9)) return '세 시나리오가 아니거나 확률 합이 100%가 아님';
    }
  }
  if (out.stocks !== undefined && !Array.isArray(out.stocks)) return '종목 결과가 목록이 아님';
  for (const s of list(out.stocks)) {
    if (s?.center === 0) return `종목 ${s.code} 가운데 값이 0`;
    if (s?.center !== null && s?.center !== undefined) {
      if (!isNum(s.center)) return `종목 ${s.code} 가운데 값이 숫자 아님`;
      if (s.quantiles) {
        const qp = quantileProblem(s.quantiles, `종목 ${s.code}`);
        if (qp) return qp;
      }
    }
  }
  for (const v of list(out.variables)) {
    if (statusesOf(v).has('없음') && v.value !== null) return `변수 ${v.id} 「없음」인데 값이 ${v.value}`;
  }
  return null;
}

function stockOf(out, code) {
  return list(out?.stocks).find(s => s?.code === code);
}
function variableOf(out, id) {
  return list(out?.variables).find(v => v?.id === id);
}
function widthOf(out) {
  const q = out?.kospi?.quantiles;
  return q && isNum(q.p90) && isNum(q.p10) ? q.p90 - q.p10 : NaN;
}

/** 약속 하나를 잰다 — 어기면 까닭 글, 지키면 null */
function checkExpect(ex, outs) {
  const out = outs[ex.step ?? 0];
  const fail = detail => `약속 어김: ${ex.say ?? ex.type}${detail ? ` (${detail})` : ''}`;
  switch (ex.type) {
    case 'variableStatus': {
      const v = variableOf(out, ex.id);
      if (!v) return fail(`변수 ${ex.id} 결과 없음`);
      const st = statusesOf(v);
      const lack = list(ex.includes).filter(x => !st.has(x));
      return lack.length ? fail(`없는 표시 ${lack.join('·')}`) : null;
    }
    case 'variableValue': {
      const v = variableOf(out, ex.id);
      if (!v) return fail(`변수 ${ex.id} 결과 없음`);
      if ('equals' in ex && !(isNum(v.value) && Math.abs(v.value - ex.equals) <= (ex.tol ?? 1e-9))) return fail(`값 ${v.value}`);
      if (ex.isNull === true && v.value !== null) return fail(`값 ${v.value}`);
      if ('notEquals' in ex && v.value === ex.notEquals) return fail(`값 ${v.value}`);
      return null;
    }
    case 'number': {
      const got = getDotted(out, ex.path);
      if (!got.found || !isNum(got.value)) return fail(`${ex.path} 없음`);
      return Math.abs(got.value - ex.equals) <= (ex.tol ?? 1e-9) ? null : fail(`${ex.path} = ${got.value}`);
    }
    case 'boardStatus':
      return out?.status === ex.equals ? null : fail(`상태 ${out?.status}`);
    case 'flags': {
      const lack = list(ex.includes).filter(x => !list(out?.flags).includes(x));
      return lack.length ? fail(`없는 표시 ${lack.join('·')}`) : null;
    }
    case 'stockStatus': {
      const s = stockOf(out, ex.code);
      if (!s) return fail(`종목 ${ex.code} 결과 없음`);
      const lack = list(ex.includes).filter(x => !list(s.status).includes(x));
      return lack.length ? fail(`없는 표시 ${lack.join('·')}`) : null;
    }
    case 'stockWithin': {
      const s = stockOf(out, ex.code);
      if (!s) return fail(`종목 ${ex.code} 결과 없음`);
      const tol = ex.tol ?? 1e-6;
      const xs = [s.center, ...Object.values(s.quantiles ?? {})].filter(x => x !== null && x !== undefined);
      if (!xs.length) return fail('숫자 없음');
      const off = xs.find(x => !isNum(x) || x < ex.low - tol || x > ex.high + tol);
      return off === undefined ? null : fail(`${off} 이(가) ${ex.low}~${ex.high} 밖`);
    }
    case 'stockNotZero': {
      const s = stockOf(out, ex.code);
      if (!s) return fail(`종목 ${ex.code} 결과 없음`);
      const xs = [s.center, ...Object.values(s.quantiles ?? {})];
      return xs.some(x => x === 0) ? fail('0 이 들어감') : null;
    }
    case 'trigger': {
      if (!out?.trigger) return fail('방아쇠 판 없음');
      const lag = (ms(out.createdAt) - ms(ex.eventAt)) / MINUTE;
      return Number.isFinite(lag) && lag >= 0 && lag <= (ex.withinMinutes ?? 30) ? null : fail(`발표 뒤 ${Number.isFinite(lag) ? lag.toFixed(1) : '?'}분`);
    }
    case 'centerMoves': {
      const a = outs[ex.fromStep]?.kospi?.center;
      const b = outs[ex.toStep]?.kospi?.center;
      if (!isNum(a) || !isNum(b)) return fail('가운데 값 없음');
      const ok = ex.direction === 'down' ? b < a : b > a;
      return ok ? null : fail(`${a} → ${b}`);
    }
    case 'widerThan': {
      const a = widthOf(outs[ex.thanStep]);
      const b = widthOf(out);
      return isNum(a) && isNum(b) && b > a ? null : fail(`폭 ${a} → ${b}`);
    }
    case 'regime': {
      const p = out?.regime?.probs;
      const keys = ['잔잔', '보통', '사나움'];
      if (!p || !keys.every(k => isNum(p[k]) && p[k] >= 0 && p[k] <= 1)) return fail('국면 확률 없음');
      const sum = keys.reduce((a, k) => a + p[k], 0);
      return Math.abs(sum - 1) <= 1e-9 ? null : fail(`합 ${sum}`);
    }
    case 'regimeRises': {
      const a = outs[ex.fromStep]?.regime?.probs?.[ex.state];
      const b = outs[ex.toStep]?.regime?.probs?.[ex.state];
      return isNum(a) && isNum(b) && b > a ? null : fail(`${a} → ${b}`);
    }
    default:
      return `시험 자료에 모르는 약속: ${ex.type}`;
  }
}

/** 극한 하나: 자료의 걸음마다 엔진을 돌리고 바닥 약속과 자료의 약속을 잰다 */
export function runExtreme(id, state, opts = {}) {
  if (typeof opts.engine !== 'function') return nothing(id, '엔진 없음');
  const fx = loadExtreme(id, opts.extremesDir ?? EXTREMES_DIR);
  if (!fx || !list(fx.steps).length) return nothing(id, '극한 시험 자료 없음');
  const outs = [];
  for (const [i, step] of fx.steps.entries()) {
    let out;
    try {
      out = opts.engine(structuredClone(step.inputs), step.seed ?? fx.seed);
      if (out && typeof out.then === 'function') throw new Error('Promise 를 돌려줌');
    } catch (e) {
      return result(id, false, `엔진이 멈춤 — ${step.name}: ${e.message}`, {steps: fx.steps.length, ran: i, expects: list(fx.expect).length, broken: 1});
    }
    const p = basicProblems(out);
    if (p) return result(id, false, `${step.name}: ${p}`, {steps: fx.steps.length, ran: i + 1, expects: list(fx.expect).length, broken: 1});
    outs.push(jsonRound(out));
  }
  const problems = list(fx.expect).map(ex => checkExpect(ex, outs)).filter(Boolean);
  const counts = {steps: fx.steps.length, ran: outs.length, expects: list(fx.expect).length, broken: problems.length};
  if (!counts.expects) return nothing(id, '시험 자료에 약속 없음', counts);
  if (!problems.length) return result(id, true, `${fx.text} — 깨짐 0 · 약속 ${counts.expects}개 지킴`, counts);
  return result(id, false, `${problems[0]}${problems.length > 1 ? ` 외 ${problems.length - 1}` : ''}`, counts);
}

// ───────────────────────────── 묶음 ─────────────────────────────

export const CHECKS = {
  T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12,
  T13, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23,
  K1: (state, opts = {}) => runExtreme('K1', state, opts),
  K2: (state, opts = {}) => runExtreme('K2', state, opts),
  K3: (state, opts = {}) => runExtreme('K3', state, opts),
  K4: (state, opts = {}) => runExtreme('K4', state, opts),
  K5: (state, opts = {}) => runExtreme('K5', state, opts),
  K6: (state, opts = {}) => runExtreme('K6', state, opts),
  K7: (state, opts = {}) => runExtreme('K7', state, opts),
};

/** 서른 개를 모두 돌린다. 시험 하나가 멈춰도 나머지는 돈다 */
export function runAll(state, opts = {}) {
  return IDS.map(id => {
    try {
      return CHECKS[id](state, opts);
    } catch (e) {
      return result(id, false, `시험이 멈춤: ${e.message}`);
    }
  });
}

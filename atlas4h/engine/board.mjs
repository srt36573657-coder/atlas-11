/**
 * ATLAS 4시간 엔진 0판 · 판 짓기·봉인 (atlas4h-board-1 · atlas4h/spec/board.md 그대로)
 *
 *   buildInputs(input, {asof, at, history})  input.json 에서 출발일 이하 자료만 골라 판의 inputs 를 만든다
 *   engine(inputs, seed)                     사양 checks.mjs 의 엔진 꼴 — 같은 입력·씨앗이면 같은 결과(동기)
 *   buildBoard({...})                        판 하나 (봉인 지문을 넣기 전)
 *   sealRecord(board, commit)                봉인 기록 {boardId, sealedAt, sha256, commit}
 *
 * 가운데 = 무판(출발값 그대로) · 폭 = HAR(밑값 3층) · 분포 = 걸러낸 지난 기록(좌우 따로).
 * 코스피 지난 자료가 입력에 없으면 코스피 판은 null, 변수 kospi 는 「없음」(값 null). 짐작해 만들지 않는다.
 */
import {canonicalJson, boardSha256, sha256} from '../spec/checks.mjs';
import {harModel, HAR_WINDOW, VAR_FLOOR, EMBARGO} from './har.mjs';
import {forecastBlock, FLAT_BAND, SCENARIO_K} from './dist.mjs';

export const ENGINE_VERSION = 'atlas4h-engine-0';
export const HISTORY_DAYS = HAR_WINDOW + 22 + EMBARGO + 1; // 판에 싣는 지난 등락 수 (맞춤 창 + 달 평균 + 엠바고)
export const STRUCTURES = ['A1', 'A2', 'B2', 'C3', 'D6', 'E5', 'F1'];
const KST = '+09:00';

export function isoKst(ms) {
  const d = new Date(ms + 9 * 3600e3);
  return `${d.toISOString().slice(0, 19)}${KST}`;
}

/** 거래일 목록에서 date 다음 거래일 */
export function nextSession(sessions, date) {
  return sessions.find(s => s > date) ?? null;
}

/** 종가 행의 관측 시각 — 원문에 있으면 그것, 없으면 그날 15:30 KST(정규장 종가가 정해지는 때) */
function observedAtOf(row) {
  if (typeof row.observedAt === 'string') return isoKst(Date.parse(row.observedAt));
  return `${row.date}T15:30:00${KST}`;
}

/**
 * 판의 inputs — 출발일(asof) 이하 자료만.
 *   input   public/data/input.json 덩어리
 *   at      판을 만드는 때(ISO) — fetchedAt 이 이보다 늦으면 안 되므로 확인용
 */
export function buildInputs(input, {asof, at, historyDays = HISTORY_DAYS}) {
  const variables = [];
  // 코스피 — 이 저장소에는 아직 지난 자료가 없다(1단계 collect 전). 「없음」, 값 null, 0 으로 채우지 않는다.
  variables.push({id: 'kospi', value: null, status: '없음', observedAt: null, fetchedAt: null, sources: [],
    note: '코스피 지난 자료 없음 — public/data/input.json 에 코스피 없음 (1단계 atlas4h-collect 전)'});
  for (const a of input.assets) {
    const rows = a.prices.filter(p => p.date <= asof);
    if (rows.length < 2 || rows.at(-1).date !== asof) {
      variables.push({id: `stock-price:${a.code}`, value: null, status: '없음', observedAt: null, fetchedAt: null, sources: [],
        note: `${asof} 종가 없음`});
      continue;
    }
    const last = rows.at(-1);
    const prev = rows.at(-2);
    const hist = [];
    for (let i = Math.max(1, rows.length - historyDays); i < rows.length; i++) {
      hist.push({date: rows[i].date, changePct: (rows[i].close / rows[i - 1].close - 1) * 100});
    }
    const observedAt = observedAtOf(last);
    const retrieved = typeof last.observedAt === 'string' ? observedAt : isoKst(Date.parse(a.priceSource.retrievedAt));
    const fetchedAt = Date.parse(retrieved) > Date.parse(at) ? null : retrieved;
    const src = {
      name: a.priceSource.provider,
      url: last.sourceUrl ?? a.priceSource.url,
      value: last.close,
      observedAt,
      ...(fetchedAt ? {fetchedAt} : {}),
      ...(typeof last.rawHash === 'string' ? {rawSha256: last.rawHash} : {}),
    };
    variables.push({
      id: `stock-price:${a.code}`,
      value: last.close,
      observedAt,
      fetchedAt,
      status: '한 출처', // input.json quality = single_source
      sources: [src],
      prevClose: prev.close,
      history: hist,
    });
  }
  const method = {
    engine: ENGINE_VERSION,
    center: '무판 (출발값 그대로)',
    width: {model: 'HAR 하루 자료 · r² · 어제·5일·22일', window: HAR_WINDOW, floor: VAR_FLOOR, embargo: EMBARGO},
    dist: {model: '걸러낸 지난 기록 · 좌우 따로', quantiles: 19, flatBand: FLAT_BAND, scenarioK: SCENARIO_K},
  };
  return {
    variables,
    constants: {version: `c-${asof.replaceAll('-', '')}-har0`, sha256: sha256(canonicalJson(method)), measuredAt: at, method},
  };
}

/** 한 변수(지난 등락이 있는 것)의 판 덩어리 — 줄이 모자라면 null */
function blockFor(v, label) {
  const hist = Array.isArray(v.history) ? v.history : [];
  if (!(typeof v.value === 'number' && v.value > 0) || hist.length < 30) return null;
  const r = hist.map(h => Math.log1p(h.changePct / 100));
  const m = harModel(r);
  if (!m) return null;
  const b = forecastBlock(v.value, m.sigmaNext, m.z, {label});
  b.har = {beta: m.beta.map(x => Number(x.toPrecision(10))), rows: m.rows};
  return {block: b, model: m};
}

/**
 * 엔진 함수 (사양 checks.mjs 꼴) — 동기 · 같은 입력·씨앗이면 같은 결과.
 * 씨앗은 받아 두지만 0판은 난수를 쓰지 않는다(분포를 표본에서 바로 센다).
 */
export function engine(inputs, seed) {
  const vars = Array.isArray(inputs?.variables) ? inputs.variables : [];
  const outVars = vars.map(v => ({id: v.id, value: v.value ?? null, status: v.status ?? '없음', marks: Array.isArray(v.marks) ? v.marks : []}));
  let kospi = null;
  const kv = vars.find(v => v.id === 'kospi');
  if (kv) {
    const k = blockFor(kv, 'kospi');
    if (k) kospi = {anchor: {value: kv.value, asOf: kv.observedAt ?? null}, ...k.block};
  }
  const stocks = [];
  for (const v of vars) {
    if (typeof v.id !== 'string' || !v.id.startsWith('stock-price:')) continue;
    const code = v.id.slice('stock-price:'.length);
    const k = blockFor(v, 'price');
    if (!k) {
      stocks.push({code, center: null, quantiles: null, status: ['없음']});
      continue;
    }
    stocks.push({code, ...k.block, status: [v.status ?? '없음']});
  }
  return {
    createdAt: inputs?.now ?? null,
    status: '봉인',
    trigger: null,
    flags: [],
    seed: Number.isInteger(seed) ? seed : null,
    variables: outVars,
    derived: {usCumulativePct: {}},
    regime: null,
    kospi,
    stocks,
  };
}

/** 두 길: 가운데(출발값) = ① 변수 값 그대로 ② 전날 종가 × (1 + 마지막 등락) — 다르면 「확인 중」 */
export function twoPathOf(inputs, out) {
  const rows = [];
  for (const s of out.stocks) {
    if (s.center === null) continue;
    const v = inputs.variables.find(x => x.id === `stock-price:${s.code}`);
    const last = v.history.at(-1);
    const pathB = v.prevClose * (1 + last.changePct / 100);
    const tolerance = 0.5;
    rows.push({what: `${s.code} 가운데 값`, pathA: s.center, pathB: Math.round(pathB * 1e6) / 1e6, tolerance, agree: Math.abs(s.center - pathB) <= tolerance});
  }
  return rows;
}

/**
 * 판 하나. 봉인 지문은 sealRecord 가 이 판 그대로를 정렬 직렬화해 센다.
 *   slot "16" · kind "무거운"/"가벼운" · createdAt·sealedAt ISO(KST) · target 목표 거래일
 */
export function buildBoard({inputs, seed, slot, kind, createdAt, sealedAt, target, commit, dirty, files, retro = false, slotDate = String(sealedAt).slice(0, 10)}) {
  const out = engine(inputs, seed);
  const twoPath = twoPathOf(inputs, out);
  const disagree = twoPath.filter(t => !t.agree).length;
  const ok = out.stocks.filter(s => s.center !== null).length;
  const body = {
    schema: 'atlas4h-board-1',
    slot,
    kind,
    trigger: null,
    createdAt,
    sealedAt,
    dataCutoff: sealedAt,
    target: {date: target, what: '봉인 뒤 첫 종가'},
    status: '봉인',
    code: {commit, dirty},
    dataVersion: {sha256: sha256(canonicalJson(inputs)), files},
    seed,
    inputs,
    engines: [
      {id: 'center-nochange', role: '가운데', weight: 1, inputs: ['stock-price'], sawPreviousBoard: false},
      {id: 'width-har', role: '폭', weight: 1, inputs: ['stock-price'], sawPreviousBoard: false},
    ],
    kospi: out.kospi,
    stocks: out.stocks,
    reconciliation: {method: '없음', nodes: [], maxGap: null, why: '코스피 판이 없어 위·아래 마디를 맞출 수 없음 (MinT 는 코스피 자료가 생긴 뒤)'},
    twoPath,
    events: [],
    llm: {used: false},
    structures: STRUCTURES,
    screen: {},
    text: [
      `종목 ${ok}개 판: 가운데 값은 마지막 종가 그대로, 80% 범위는 HAR 흔들림 크기로 정했습니다.`,
      out.kospi ? '코스피 판도 함께 냈습니다.' : '코스피는 지난 자료가 없어 「없음」으로 두었습니다.',
      disagree ? `두 길 계산이 어긋난 종목 ${disagree}개는 「확인 중」입니다.` : '두 길 계산은 모두 같았습니다.',
    ],
  };
  if (retro) body.retro = true;
  // 판 이름 = 4h-<판 날짜>-<시각>-<내용 지문 앞 8자> · 판 날짜 = 그 시각 판의 날짜(출발일)
  const id = `4h-${retro ? 'retro-' : ''}${slotDate.replaceAll('-', '')}-${slot}-${sha256(canonicalJson(body)).slice(0, 8)}`;
  return {id, ...body};
}

/** 봉인 기록 (seals) */
export function sealRecord(board, commit) {
  return {boardId: board.id, sealedAt: board.sealedAt, sha256: boardSha256(board), commit};
}

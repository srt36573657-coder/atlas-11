/**
 * ATLAS 4시간 엔진 0판 · 판 짓기·봉인 (atlas4h-board-1 · atlas4h/spec/board.md 그대로)
 *
 *   buildInputs(input, {asof, at, histories})  출발일(asof) 이하 자료만 골라 판의 inputs 를 만든다 — 변수(지금 값) + 상수(맞춘 상태)
 *   engine(inputs, seed)                       사양 checks.mjs 의 엔진 꼴 — 상수 + 지금 변수만으로 판을 낸다(동기 · 순수 · 같은 입력이면 같은 결과)
 *   buildBoard({...})                          판 하나 (봉인 지문을 넣기 전)
 *   sealRecord(board, commit)                  봉인 기록 {boardId, sealedAt, sha256, commit}
 *
 * 가운데 = 무판(출발값 그대로) · 폭 = HAR(밑값 3층) · 분포 = 걸러낸 지난 기록(좌우 따로).
 * 판은 지난 등락 목록을 싣지 않는다(작은 판): 봉인 때 constants.mjs 가 잰 상수만 싣는다(판 하나 150 KB 아래 목표).
 * 코스피 지난 자료(atlas4h/data/history/kospi.json)가 없으면 코스피 판은 null, 변수 kospi 는 「없음」(값 null). 짐작해 만들지 않는다.
 */
import {canonicalJson, boardSha256, sha256} from '../spec/checks.mjs';
import {measureSeries, validState, blockFromConstants, methodOf, HISTORY_DAYS} from './constants.mjs';
import {isoKst, nextSession, KST} from './clock.mjs';
import {changesUpTo, rowOf, closeObservedAt} from './history.mjs';

export {isoKst, nextSession, HISTORY_DAYS};
export const ENGINE_VERSION = 'atlas4h-engine-0';
export const STRUCTURES = ['A1', 'A2', 'B2', 'C3', 'D6', 'E5', 'F1'];
export const STALE_HOURS = 4;

/** 종가 행의 관측 시각 — 원문에 있으면 그것, 없으면 그날 15:30 KST(정규장 종가가 정해지는 때) */
function observedAtOf(row) {
  if (typeof row.observedAt === 'string') return isoKst(Date.parse(row.observedAt));
  return `${row.date}T15:30:00${KST}`;
}

/** 종목 하루 등락(%) 목록 — 출발일 이하 종가만 · 0판과 같은 셈 (오늘 ÷ 어제 − 1) × 100 */
export function stockChanges(rows) {
  const out = [];
  for (let i = 1; i < rows.length; i++) out.push((rows[i].close / rows[i - 1].close - 1) * 100);
  return out;
}

/**
 * 코스피 변수 — 지난 자료 파일의 출발일 줄. 줄이 없거나 값이 없으면 「없음」/「확인 중」(값 null).
 * 봉인보다 4시간 넘게 앞선 값(장 앞 판: 전날 15:30 종가)은 표시 「옛값」·「장 닫힘」을 붙인다(자료 약속 13번).
 * 받은 때(fetchedAt)가 봉인 뒤면 null (재현 판 — 자료는 나중에 받았다).
 */
function kospiVariable(h, asof, at) {
  const none = note => ({id: 'kospi', value: null, status: '없음', observedAt: null, fetchedAt: null, sources: [], note});
  if (!h || h.none) return none(h?.why ?? '코스피 지난 자료 없음 — atlas4h/data/history/kospi.json 없음 (atlas4h-collect 전)');
  const row = rowOf(h.series, asof);
  if (!row) return none(`코스피 ${asof} 줄 없음`);
  const observedAt = closeObservedAt('kospi', asof);
  const docFetched = typeof h.doc.fetchedAt === 'string' ? h.doc.fetchedAt : null;
  const fetchedAt = docFetched && Date.parse(docFetched) <= Date.parse(at) ? isoKst(Date.parse(docFetched)) : null;
  const srcMeta = new Map((h.doc.sources ?? []).map(s => [s.name, s]));
  const sources = Object.entries(row.sources ?? {}).map(([name, value]) => ({
    name, url: srcMeta.get(name)?.url ?? null, value, observedAt,
    ...(fetchedAt ? {fetchedAt} : {}),
    ...(srcMeta.get(name)?.rawSha256 ? {rawSha256: srcMeta.get(name).rawSha256} : {}),
  }));
  const marks = [];
  if (Date.parse(at) - Date.parse(observedAt) > STALE_HOURS * 3600e3) marks.push('옛값', '장 닫힘');
  const usable = typeof row.value === 'number' && Number.isFinite(row.value) && row.value > 0;
  if (!usable) {
    return {id: 'kospi', value: null, status: row.status === '확인 중' ? '확인 중' : '없음', marks: row.status === '확인 중' ? ['확인 중', ...marks] : marks,
      observedAt, fetchedAt, sources, note: `코스피 ${asof} 값 없음 (${row.status ?? '?'})`};
  }
  const ch = changesUpTo(h.series, asof);
  const last = ch.at(-1);
  return {
    id: 'kospi', value: row.value, observedAt, fetchedAt,
    status: row.status === 'ok' ? 'ok' : '한 출처', marks, sources,
    ...(last && last.date === asof ? {prevClose: last.prev, lastChangePct: last.changePct} : {}),
  };
}

/**
 * 판의 inputs — 출발일(asof) 이하 자료만.
 *   input      public/data/input.json 덩어리 (52종목 종가)
 *   at         봉인 시각(ISO) — fetchedAt 이 이보다 늦으면 null · 상수의 measuredAt = 이 시각
 *   histories  loadHistories() 결과 {kospi, …} (없으면 코스피 「없음」)
 */
export function buildInputs(input, {asof, at, histories = {}, withConstants = true}) {
  const variables = [];
  const values = {kospi: null, stocks: {}};
  const kv = kospiVariable(histories.kospi, asof, at);
  variables.push(kv);
  // withConstants = false: 변수만 짓고 상수(HAR 맞춤)는 세지 않는다 — 고리의 「변수 그대로?」 검사용(계산 없이 견주기)
  if (withConstants && kv.value !== null && histories.kospi && !histories.kospi.none) {
    values.kospi = measureSeries(changesUpTo(histories.kospi.series, asof).map(c => c.changePct));
  }
  for (const a of input.assets) {
    const rows = a.prices.filter(p => p.date <= asof);
    if (rows.length < 2 || rows.at(-1).date !== asof) {
      variables.push({id: `stock-price:${a.code}`, value: null, status: '없음', observedAt: null, fetchedAt: null, sources: [],
        note: `${asof} 종가 없음`});
      values.stocks[a.code] = null;
      continue;
    }
    const last = rows.at(-1);
    const prev = rows.at(-2);
    const changes = stockChanges(rows);
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
      lastChangePct: changes.at(-1),
    });
    values.stocks[a.code] = withConstants ? measureSeries(changes) : null;
  }
  if (!withConstants) return {variables};
  const method = methodOf(ENGINE_VERSION);
  return {
    variables,
    constants: {
      version: `c-${asof.replaceAll('-', '')}-har0`,
      sha256: sha256(canonicalJson({method, values})),
      measuredAt: at,
      method,
      values,
    },
  };
}

/**
 * 엔진 함수 (사양 checks.mjs 꼴) — 동기 · 순수 · 같은 입력·씨앗이면 같은 결과.
 * 상수(inputs.constants.values) + 지금 변수(출발값)만 쓴다. 지난 등락 목록은 보지 않는다.
 * 씨앗은 받아 두지만 0판은 난수를 쓰지 않는다. 상수가 없거나 꼴이 다르면 그 대상은 「없음」(멈추지 않음).
 */
export function engine(inputs, seed) {
  const vars = Array.isArray(inputs?.variables) ? inputs.variables : [];
  const values = inputs?.constants?.values && typeof inputs.constants.values === 'object' ? inputs.constants.values : {};
  const outVars = vars.map(v => ({id: v.id, value: v.value ?? null, status: v.status ?? '없음', marks: Array.isArray(v.marks) ? v.marks : []}));
  const anchorOk = v => typeof v?.value === 'number' && Number.isFinite(v.value) && v.value > 0;
  let kospi = null;
  const kv = vars.find(v => v?.id === 'kospi');
  if (kv && anchorOk(kv) && validState(values.kospi)) {
    kospi = {anchor: {value: kv.value, asOf: kv.observedAt ?? null}, ...blockFromConstants(kv.value, values.kospi, 'kospi')};
  }
  const stocks = [];
  for (const v of vars) {
    if (typeof v?.id !== 'string' || !v.id.startsWith('stock-price:')) continue;
    const code = v.id.slice('stock-price:'.length);
    const c = values.stocks?.[code];
    if (!anchorOk(v) || !validState(c)) {
      stocks.push({code, center: null, quantiles: null, status: ['없음']});
      continue;
    }
    stocks.push({code, ...blockFromConstants(v.value, c, 'price'), status: [v.status ?? '없음']});
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
  const kv = inputs.variables.find(x => x.id === 'kospi');
  if (out.kospi && Number.isFinite(kv?.prevClose) && Number.isFinite(kv?.lastChangePct)) {
    const pathB = kv.prevClose * (1 + kv.lastChangePct / 100);
    const tolerance = 0.05;
    rows.push({what: '코스피 가운데 값', pathA: out.kospi.center, pathB: Math.round(pathB * 1e6) / 1e6, tolerance, agree: Math.abs(out.kospi.center - pathB) <= tolerance});
  }
  for (const s of out.stocks) {
    if (s.center === null) continue;
    const v = inputs.variables.find(x => x.id === `stock-price:${s.code}`);
    const pathB = v.prevClose * (1 + v.lastChangePct / 100);
    const tolerance = 0.5;
    rows.push({what: `${s.code} 가운데 값`, pathA: s.center, pathB: Math.round(pathB * 1e6) / 1e6, tolerance, agree: Math.abs(s.center - pathB) <= tolerance});
  }
  return rows;
}

/**
 * 판 하나. 봉인 지문은 sealRecord 가 이 판 그대로를 정렬 직렬화해 센다.
 *   slot "16" · kind "무거운"/"가벼운" · createdAt·sealedAt ISO(KST) · target 목표 거래일
 *   files       쓴 자료 파일(저장소 기준 경로) · fileHashes {파일: 내용 sha256} — dataVersion.sha256 = 그 지문들의 정렬 직렬화 sha256
 *   retro       재현 판이면 이름이 r4h- 로 시작 (board.md · 사양 BOARD_ID_RE)
 */
export function buildBoard({inputs, seed, slot, kind, createdAt, sealedAt, target, commit, dirty, files, fileHashes = null, retro = false, slotDate = String(sealedAt).slice(0, 10)}) {
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
    dataVersion: fileHashes
      ? {sha256: sha256(canonicalJson(Object.fromEntries(files.map(f => [f, fileHashes[f] ?? null])))), files, fileSha256: Object.fromEntries(files.map(f => [f, fileHashes[f] ?? null]))}
      : {sha256: sha256(canonicalJson(inputs)), files, note: '파일 지문을 못 받아 inputs 의 정렬 직렬화 sha256 을 적음'},
    seed,
    inputs,
    engines: [
      {id: 'center-nochange', role: '가운데', weight: 1, inputs: out.kospi ? ['kospi', 'stock-price'] : ['stock-price'], sawPreviousBoard: false},
      {id: 'width-har', role: '폭', weight: 1, inputs: out.kospi ? ['kospi', 'stock-price'] : ['stock-price'], sawPreviousBoard: false},
    ],
    kospi: out.kospi,
    stocks: out.stocks,
    reconciliation: out.kospi
      ? {method: '없음', nodes: [], maxGap: null, why: 'MinT 맞추기는 5단계 — 0판은 코스피·종목을 따로 낸다'}
      : {method: '없음', nodes: [], maxGap: null, why: '코스피 판이 없어 위·아래 마디를 맞출 수 없음 (MinT 는 코스피 자료가 생긴 뒤)'},
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
  // 판 이름 = 4h-<판 날짜>-<시각>-<내용 지문 앞 8자> (재현 판은 r4h-) · 판 날짜 = 그 시각 판의 한국 날짜
  const id = `${retro ? 'r4h' : '4h'}-${slotDate.replaceAll('-', '')}-${slot}-${sha256(canonicalJson(body)).slice(0, 8)}`;
  return {id, ...body};
}

/** 봉인 기록 (seals) */
export function sealRecord(board, commit) {
  return {boardId: board.id, sealedAt: board.sealedAt, sha256: boardSha256(board), commit};
}

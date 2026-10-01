/**
 * ATLAS 11 · 채점 칸 표(score-cells.json) — 1거래일 전망을 종목마다 맞고 틀린 숫자로(명령서 6판 R1 · W3)
 *  - 칸 고르기(3절): 기록 장부의 채점 기록(type score) 가운데 정정되지 않은 것(supersedes) · 1거래일 · 실시간 발행본.
 *    목표일마다 대표 발행본(그 세션 첫 발행본)은 채점판(scores.json · lib/atlas11/score.mjs → rollingScoreRecord 의
 *    first_published_vintage_per_session)이 고른 것을 그대로 쓴다 — 10/1 이후 날짜도 같은 규칙으로 저절로 들어온다.
 *  - 식(6절): 실전 방향 = 가장 높은 확률(같으면 보합→상승→하락) · 실제 방향 = 출발 종가 대비 ±0.1% 밖이면 상승·하락
 *    오차율 = |예측 가격(p50) − 실제 종가| ÷ 실제 종가(비율) · 폭 맞음 = 오차율 ≤ 1.5% · 네 묶음 = 방향(맞음·틀림) × 폭(맞음·틀림)
 *    (보합 경계·허용 오차는 채점 규칙 config/atlas11/scoring-policy.v1.json 의 flatDelta 0.001 · priceHitTolerancePct["1"] 1.5 와 같다)
 *  - 시각(타임스탬프)을 넣지 않는다: 같은 입력이면 바이트까지 같다(T4).
 *  - 검사(VIEW_SCORE_CELLS): 날짜마다 줄 수 = 채점판 채점 수 · 줄마다 파생 값이 자기 출발 종가·예측·실제와 맞음 ·
 *    네 묶음이 두 판정과 맞음 · 채점판(scores.json)의 같은 칸과 예측·실제·출발 종가·두 방향·네 묶음이 같음.
 */
import {currentRecords} from './records.mjs';

export const SCORE_CELLS_SCHEMA = 'atlas11-score-cells-1';
export const SCORE_CELL_KEYS = Object.freeze(['date', 'code', 'name', 'anchor', 'p50', 'predRet', 'actual', 'actRet', 'errWon', 'ape', 'predDir', 'actDir', 'dirOk', 'sizeOk', 'group', 'scoreId']);
export const FLAT_DELTA = 0.001;
export const SIZE_TOLERANCE = 0.015;
/** 네 묶음 이름(화면·보고에서 같은 말을 쓴다) */
export const GROUP_LABELS = Object.freeze(['방향·폭 모두 맞음', '방향 맞음·폭 틀림', '방향 틀림·폭 맞음', '둘 다 틀림']);
export const GROUP_MARKS = Object.freeze(['①', '②', '③', '④']);

const finite = x => typeof x === 'number' && Number.isFinite(x);
const fail = why => { throw Error('VIEW_SCORE_CELLS ' + why); };
/** 실제 방향(±0.1% 밖이면 상승·하락) */
export const directionOfReturn = r => (r > FLAT_DELTA ? 'up' : r < -FLAT_DELTA ? 'down' : 'flat');
/** 실전 방향: 가장 높은 확률 · 같으면 보합 → 상승 → 하락 */
export const directionOfProbabilities = p => ['up', 'down'].reduce((best, k) => (p[k] > p[best] ? k : best), 'flat');
export const groupOf = (dirOk, sizeOk) => (dirOk ? (sizeOk ? 1 : 2) : (sizeOk ? 3 : 4));
/** 출발 종가·예측·실제 세 값에서 나오는 칸(검사도 같은 식으로 다시 셈) */
export function derive(anchor, p50, actual) {
  const predRet = p50 / anchor - 1, actRet = actual / anchor - 1, errWon = p50 - actual, ape = Math.abs(p50 - actual) / actual;
  return {predRet, actRet, errWon, ape, actDir: directionOfReturn(actRet), sizeOk: ape <= SIZE_TOLERANCE};
}

/** 채점판의 1거래일 채점 칸(평가된 것만) — 날짜 오름차순 · 종목 코드 오름차순 */
export function scoreboardCells(scoreboard) {
  const out = [];
  for (const d of scoreboard?.byDate ?? []) for (const r of d.rows ?? []) { const c = r.horizons?.['1']; if (c?.status === 'evaluated') out.push({date: d.date, code: r.code, name: r.name, cell: c}); }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

/**
 * score-cells.json 만들기
 * @param scoreboard  buildScoreboard 결과(scores.json) — 대표 발행본·채점할 칸을 정한다
 * @param scoreRecords 기록 장부 채점 기록(type score, {id, at, supersedes, body}) — 숫자는 여기서 가져온다
 */
export function buildScoreCells({scoreboard, scoreRecords = []}) {
  const ledger = new Map();
  const live = currentRecords(scoreRecords).filter(r => r?.body?.horizon === 1 && r.body.kind === 'live');
  // 같은 칸에 정정되지 않은 기록이 둘 이상이면 가장 나중(at) 것 · 같은 시각이면 id 순으로 정해 늘 같은 것을 고른다
  for (const r of [...live].sort((a, b) => (String(a.at) < String(b.at) ? -1 : String(a.at) > String(b.at) ? 1 : a.id < b.id ? -1 : 1))) ledger.set(`${r.body.forecastId}|${r.body.code}|${r.body.targetDate}`, r);
  const cells = [], byDate = new Map();
  for (const {date, code, cell} of scoreboardCells(scoreboard)) {
    const rec = ledger.get(`${cell.forecastId}|${code}|${date}`);
    if (!rec) fail(`ledger record missing ${date} ${code} ${cell.forecastId}`);
    const b = rec.body, anchor = b.anchor, p50 = b.predicted?.p50, actual = b.actual;
    if (![anchor, p50, actual].every(v => finite(v) && v > 0)) fail(`ledger values ${date} ${code}`);
    const dv = derive(anchor, p50, actual);
    const predDir = b.probabilities ? directionOfProbabilities(b.probabilities) : b.predictedDirection;
    const dirOk = predDir === dv.actDir, group = groupOf(dirOk, dv.sizeOk);
    // 기록 장부 자체의 판정(같은 규칙으로 발행 때 적은 방향·묶음)과도 어긋나면 만들지 않는다
    if (b.predictedDirection !== predDir || b.actualDirection !== dv.actDir || b.class !== group) fail(`ledger verdict ${date} ${code}`);
    cells.push({date, code, name: b.name ?? code, anchor, p50, predRet: dv.predRet, actual, actRet: dv.actRet, errWon: dv.errWon, ape: dv.ape, predDir, actDir: dv.actDir, dirOk, sizeOk: dv.sizeOk, group, scoreId: rec.id});
    if (!byDate.has(date)) byDate.set(date, {ids: new Set(), groups: [0, 0, 0, 0], count: 0});
    const e = byDate.get(date); e.ids.add(cell.forecastId); e.groups[group - 1]++; e.count++;
  }
  const dates = [...byDate.entries()].map(([date, e]) => ({date, forecastId: e.ids.size === 1 ? [...e.ids][0] : [...e.ids].sort(), count: e.count, groups: e.groups}));
  return {schema: SCORE_CELLS_SCHEMA, horizon: 1, dates, cells};
}

const close = (a, b, tol = 1e-9) => finite(a) && finite(b) && Math.abs(a - b) <= tol;

/** VIEW_SCORE_CELLS 검사 — 어긋나면 'VIEW_SCORE_CELLS …' 오류를 던진다 */
export function validateScoreCells(file, scoreboard) {
  if (!file || file.schema !== SCORE_CELLS_SCHEMA || file.horizon !== 1 || !Array.isArray(file.dates) || !Array.isArray(file.cells)) fail('shape');
  if (Object.keys(file).join(',') !== 'schema,horizon,dates,cells') fail('top-level keys');
  const sb = new Map(scoreboardCells(scoreboard).map(x => [`${x.date}|${x.code}`, x]));
  const sbDates = [...new Set([...sb.values()].map(x => x.date))];
  // 날짜 목록 = 채점판에서 1거래일 채점이 있는 날짜(순서까지)
  if (file.dates.map(d => d.date).join(',') !== sbDates.join(',')) fail('dates');
  let prev = '';
  const counted = new Map(sbDates.map(d => [d, {count: 0, groups: [0, 0, 0, 0]}]));
  for (const c of file.cells) {
    if (Object.keys(c).join(',') !== SCORE_CELL_KEYS.join(',')) fail(`keys ${c.date} ${c.code}`);
    const key = `${c.date}|${c.code}`;
    if (key <= prev) fail(`order ${key}`); prev = key;
    if (![c.anchor, c.p50, c.actual].every(v => finite(v) && v > 0)) fail(`values ${key}`);
    if (!/^score-[0-9a-f]{16}$/.test(c.scoreId ?? '')) fail(`scoreId ${key}`);
    // 자기 값끼리: 파생 값은 출발 종가·예측·실제에서 같은 식으로 다시 센 값과 같아야 한다
    const dv = derive(c.anchor, c.p50, c.actual);
    if (!close(c.predRet, dv.predRet) || !close(c.actRet, dv.actRet) || !close(c.errWon, dv.errWon, 1e-6) || !close(c.ape, dv.ape)) fail(`derived ${key}`);
    if (!['up', 'flat', 'down'].includes(c.predDir) || c.actDir !== dv.actDir || c.sizeOk !== dv.sizeOk || c.dirOk !== (c.predDir === c.actDir) || c.group !== groupOf(c.dirOk, c.sizeOk)) fail(`verdict ${key}`);
    // 채점판의 같은 칸과: 예측·실제(정확히) · 출발 종가(두 등락률로) · 두 방향 · 네 묶음
    const s = sb.get(key); if (!s) fail(`not in scores.json ${key}`);
    const x = s.cell;
    if (x.forecast !== c.p50 || x.actual !== c.actual) fail(`price vs scores.json ${key}`);
    if (!close(x.predictedReturn, c.predRet) || !close(x.actualReturn, c.actRet)) fail(`anchor vs scores.json ${key}`);
    if (x.predictedDirection !== c.predDir || x.observedDirection !== c.actDir || x.directionCorrect !== c.dirOk) fail(`direction vs scores.json ${key}`);
    if (groupOf(x.directionCorrect, Math.abs(x.forecast - x.actual) / x.actual <= SIZE_TOLERANCE) !== c.group) fail(`class vs scores.json ${key}`);
    if (typeof c.name !== 'string' || !c.name) fail(`name ${key}`);
    const e = counted.get(c.date); e.count++; e.groups[c.group - 1]++;
  }
  // 날짜마다: 줄 수 = 채점판 채점 수(52) · 네 묶음 수와 대표 발행본이 줄에서 센 값·채점판과 같음
  for (const d of file.dates) {
    const want = [...sb.values()].filter(x => x.date === d.date), e = counted.get(d.date);
    const ids = [...new Set(want.map(x => x.cell.forecastId))].sort();
    if (e.count !== want.length || d.count !== want.length) fail(`count ${d.date} ${e.count}/${d.count}/${want.length}`);
    if (d.groups.join(',') !== e.groups.join(',') || d.groups.reduce((s, v) => s + v, 0) !== d.count) fail(`groups ${d.date}`);
    if ((Array.isArray(d.forecastId) ? d.forecastId.join(',') : d.forecastId) !== ids.join(',')) fail(`forecastId ${d.date}`);
  }
  return true;
}

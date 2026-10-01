/**
 * ATLAS 11 · 채점 칸 표(score-cells.json) — 1거래일 전망을 종목마다 맞고 틀린 숫자로(명령서 6판 R1 · W3)
 *  - 칸 고르기(3절): 기록 장부의 채점 기록(type score) 가운데 정정되지 않은 것(supersedes) · 1거래일 · 실시간 발행본.
 *    목표일마다 대표 발행본(그 세션 첫 발행본)은 채점판(scores.json · lib/atlas11/score.mjs → rollingScoreRecord 의
 *    first_published_vintage_per_session)이 고른 것을 그대로 쓴다 — 10/1 이후 날짜도 같은 규칙으로 저절로 들어온다.
 *  - 식(6절): 실전 방향 = 가장 높은 확률(같으면 보합→상승→하락) · 실제 방향 = 출발 종가 대비 ±0.1% 밖이면 상승·하락
 *    오차율 apeRatio = |예측 가격(p50) − 실제 종가| ÷ 실제 종가(비율 · 장부·scores.json 의 ape 는 % 라 이름을 달리함)
 *    폭 맞음 = apeRatio ≤ 1.5% · 네 묶음 = 방향(맞음·틀림) × 폭(맞음·틀림)
 *    (보합 경계·허용 오차는 채점 규칙 config/atlas11/scoring-policy.v1.json 의 flatDelta 0.001 · priceHitTolerancePct["1"] 1.5 와 같다)
 *  - 보류(held · 따지는 이 G1, 10/01 오후): 장부 값이 채점판과 다른 칸(예: 발행 뒤 출발 종가가 정정되어 채점판은 새 값을 읽고 장부는 발행 때
 *    값을 지닌 칸)은 표에 넣지 않고 held 에 까닭(칸 이름 · 장부 값 · 채점판 값)과 함께 둔다. 이 파일 때문에 화면 묶음 만들기가 멈추지 않는다
 *    (매일 실행이 멈추면 그날 장부·발행본이 커밋되지 못한다).
 *  - 시각(타임스탬프)을 넣지 않는다: 같은 입력이면 바이트까지 같다(T4).
 *  - 검사(VIEW_SCORE_CELLS): 보인 줄은 자기 값끼리 맞고 채점판의 같은 칸과 예측·실제·출발 종가·두 방향·네 묶음이 같아야 한다(1원만 달라도 실패) ·
 *    날짜마다 보인 줄 + 보류 = 채점판 채점 수 · 보류 칸의 까닭은 채점판 값과 맞아야 한다.
 */
import {currentRecords} from './records.mjs';

export const SCORE_CELLS_SCHEMA = 'atlas11-score-cells-1';
export const SCORE_CELL_KEYS = Object.freeze(['date', 'code', 'name', 'anchor', 'p50', 'predRet', 'actual', 'actRet', 'errWon', 'apeRatio', 'predDir', 'actDir', 'dirOk', 'sizeOk', 'group', 'scoreId']);
export const HELD_KEYS = Object.freeze(['date', 'code', 'name', 'scoreId', 'reasons']);
export const FLAT_DELTA = 0.001;
export const SIZE_TOLERANCE = 0.015;
/** 네 묶음 이름(화면·보고에서 같은 말을 쓴다) */
export const GROUP_LABELS = Object.freeze(['방향·폭 모두 맞음', '방향 맞음·폭 틀림', '방향 틀림·폭 맞음', '둘 다 틀림']);
export const GROUP_MARKS = Object.freeze(['①', '②', '③', '④']);
/** 보류 까닭으로 쓰는 칸 이름 */
export const HOLD_FIELDS = Object.freeze(['record', 'values', 'p50', 'actual', 'anchor', 'predDir', 'actDir', 'dirOk', 'group', 'ledgerVerdict', 'check']);

const finite = x => typeof x === 'number' && Number.isFinite(x);
const fail = why => { throw Error('VIEW_SCORE_CELLS ' + why); };
const RET_TOL = 1e-9;
const close = (a, b, tol = RET_TOL) => finite(a) && finite(b) && Math.abs(a - b) <= tol;
/** 실제 방향(±0.1% 밖이면 상승·하락) */
export const directionOfReturn = r => (r > FLAT_DELTA ? 'up' : r < -FLAT_DELTA ? 'down' : 'flat');
/** 실전 방향: 가장 높은 확률 · 같으면 보합 → 상승 → 하락 */
export const directionOfProbabilities = p => ['up', 'down'].reduce((best, k) => (p[k] > p[best] ? k : best), 'flat');
export const groupOf = (dirOk, sizeOk) => (dirOk ? (sizeOk ? 1 : 2) : (sizeOk ? 3 : 4));
/** 출발 종가·예측·실제 세 값에서 나오는 칸(검사도 같은 식으로 다시 셈) */
export function derive(anchor, p50, actual) {
  const predRet = p50 / anchor - 1, actRet = actual / anchor - 1, errWon = p50 - actual, apeRatio = Math.abs(p50 - actual) / actual;
  return {predRet, actRet, errWon, apeRatio, actDir: directionOfReturn(actRet), sizeOk: apeRatio <= SIZE_TOLERANCE};
}
/** 채점판 칸의 출발 종가(채점판은 출발 종가를 따로 싣지 않는다 → 실제 종가 ÷ (1 + 실제 등락)) */
const scoreboardAnchor = x => (finite(x.actual) && finite(x.actualReturn) ? x.actual / (1 + x.actualReturn) : null);
const scoreboardGroup = x => groupOf(x.directionCorrect, Math.abs(x.forecast - x.actual) / x.actual <= SIZE_TOLERANCE);
const round2 = v => (finite(v) ? Math.round(v * 100) / 100 : v);

/** 채점판의 1거래일 채점 칸(평가된 것만) — 날짜 오름차순 · 종목 코드 오름차순 */
export function scoreboardCells(scoreboard) {
  const out = [];
  for (const d of scoreboard?.byDate ?? []) for (const r of d.rows ?? []) { const c = r.horizons?.['1']; if (c?.status === 'evaluated') out.push({date: d.date, code: r.code, name: r.name, cell: c}); }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

/** 보인 줄 하나가 채점판의 같은 칸과 다른 곳 — [] 이면 같음(검사와 만들기가 같은 비교를 쓴다) */
export function differences(row, x) {
  const out = [];
  if (x.forecast !== row.p50) out.push({field: 'p50', ledger: row.p50, scoreboard: x.forecast});
  if (x.actual !== row.actual) out.push({field: 'actual', ledger: row.actual, scoreboard: x.actual});
  if (!close(x.predictedReturn, row.predRet) || !close(x.actualReturn, row.actRet)) out.push({field: 'anchor', ledger: row.anchor, scoreboard: round2(scoreboardAnchor(x))});
  if (x.predictedDirection !== row.predDir) out.push({field: 'predDir', ledger: row.predDir, scoreboard: x.predictedDirection});
  if (x.observedDirection !== row.actDir) out.push({field: 'actDir', ledger: row.actDir, scoreboard: x.observedDirection});
  if (x.directionCorrect !== row.dirOk) out.push({field: 'dirOk', ledger: row.dirOk, scoreboard: x.directionCorrect});
  if (scoreboardGroup(x) !== row.group) out.push({field: 'group', ledger: row.group, scoreboard: scoreboardGroup(x)});
  return out;
}

/**
 * score-cells.json 만들기 — 장부와 채점판이 어긋나도 던지지 않는다(어긋난 칸은 held)
 * @param scoreboard  buildScoreboard 결과(scores.json) — 대표 발행본·채점할 칸을 정한다
 * @param scoreRecords 기록 장부 채점 기록(type score, {id, at, supersedes, body}) — 숫자는 여기서 가져온다
 */
export function buildScoreCells({scoreboard, scoreRecords = []}) {
  const ledger = new Map();
  const live = currentRecords(scoreRecords).filter(r => r?.body?.horizon === 1 && r.body.kind === 'live');
  // 같은 칸에 정정되지 않은 기록이 둘 이상이면 가장 나중(at) 것 · 같은 시각이면 id 순으로 정해 늘 같은 것을 고른다
  for (const r of [...live].sort((a, b) => (String(a.at) < String(b.at) ? -1 : String(a.at) > String(b.at) ? 1 : a.id < b.id ? -1 : 1))) ledger.set(`${r.body.forecastId}|${r.body.code}|${r.body.targetDate}`, r);
  const cells = [], held = [], board = scoreboardCells(scoreboard);
  for (const {date, code, name, cell} of board) {
    const rec = ledger.get(`${cell.forecastId}|${code}|${date}`), b = rec?.body;
    const hold = reasons => held.push({date, code, name: b?.name ?? name ?? code, scoreId: rec?.id ?? null, reasons});
    if (!rec) { hold([{field: 'record', ledger: null, scoreboard: cell.forecastId}]); continue; }
    const anchor = b.anchor, p50 = b.predicted?.p50, actual = b.actual;
    if (![anchor, p50, actual].every(v => finite(v) && v > 0)) { hold([{field: 'values', ledger: [anchor ?? null, p50 ?? null, actual ?? null], scoreboard: [round2(scoreboardAnchor(cell)), cell.forecast, cell.actual]}]); continue; }
    const dv = derive(anchor, p50, actual);
    const predDir = b.probabilities ? directionOfProbabilities(b.probabilities) : b.predictedDirection;
    const dirOk = predDir === dv.actDir, group = groupOf(dirOk, dv.sizeOk);
    const row = {date, code, name: b.name ?? code, anchor, p50, predRet: dv.predRet, actual, actRet: dv.actRet, errWon: dv.errWon, apeRatio: dv.apeRatio, predDir, actDir: dv.actDir, dirOk, sizeOk: dv.sizeOk, group, scoreId: rec.id};
    const diff = differences(row, cell);
    // 장부 자체의 판정(발행 때 적은 방향·묶음)이 같은 규칙으로 다시 센 값과 어긋나도 보류
    if (b.predictedDirection !== predDir || b.actualDirection !== dv.actDir || b.class !== group) diff.push({field: 'ledgerVerdict', ledger: [b.predictedDirection, b.actualDirection, b.class], scoreboard: [predDir, dv.actDir, group]});
    if (diff.length) { hold(diff); continue; }
    cells.push(row);
  }
  const dates = [...new Set(board.map(x => x.date))].map(date => {
    const shown = cells.filter(c => c.date === date), ids = [...new Set(board.filter(x => x.date === date).map(x => x.cell.forecastId))].sort();
    return {date, forecastId: ids.length === 1 ? ids[0] : ids, count: shown.length, held: held.filter(h => h.date === date).length, groups: [1, 2, 3, 4].map(g => shown.filter(c => c.group === g).length)};
  });
  const file = {schema: SCORE_CELLS_SCHEMA, horizon: 1, dates, cells, held};
  // 마지막 안전판: 만든 파일이 검사를 못 넘으면(코드 결함) 보인 줄을 모두 보류로 돌려 화면 묶음 만들기를 멈추지 않는다
  try { validateScoreCells(file, scoreboard); return file; }
  catch (e) {
    const all = [...held, ...cells].map(c => ({date: c.date, code: c.code, name: c.name, scoreId: c.scoreId ?? null, reasons: [{field: 'check', ledger: String(e.message), scoreboard: null}]})).sort((a, b) => (a.date + a.code < b.date + b.code ? -1 : 1));
    return {schema: SCORE_CELLS_SCHEMA, horizon: 1, dates: dates.map(d => ({...d, count: 0, held: all.filter(h => h.date === d.date).length, groups: [0, 0, 0, 0]})), cells: [], held: all};
  }
}

/** VIEW_SCORE_CELLS 검사 — 어긋나면 'VIEW_SCORE_CELLS …' 오류를 던진다 */
export function validateScoreCells(file, scoreboard) {
  if (!file || file.schema !== SCORE_CELLS_SCHEMA || file.horizon !== 1 || !Array.isArray(file.dates) || !Array.isArray(file.cells) || !Array.isArray(file.held)) fail('shape');
  if (Object.keys(file).join(',') !== 'schema,horizon,dates,cells,held') fail('top-level keys');
  const sb = new Map(scoreboardCells(scoreboard).map(x => [`${x.date}|${x.code}`, x]));
  const sbDates = [...new Set([...sb.values()].map(x => x.date))];
  // 날짜 목록 = 채점판에서 1거래일 채점이 있는 날짜(순서까지)
  if (file.dates.map(d => d.date).join(',') !== sbDates.join(',')) fail('dates');
  const seen = new Set(), counted = new Map(sbDates.map(d => [d, {count: 0, held: 0, groups: [0, 0, 0, 0]}]));
  let prev = '';
  for (const c of file.cells) {
    if (Object.keys(c).join(',') !== SCORE_CELL_KEYS.join(',')) fail(`keys ${c.date} ${c.code}`);
    const key = `${c.date}|${c.code}`;
    if (key <= prev) fail(`order ${key}`); prev = key; seen.add(key);
    if (![c.anchor, c.p50, c.actual].every(v => finite(v) && v > 0)) fail(`values ${key}`);
    if (!/^score-[0-9a-f]{16}$/.test(c.scoreId ?? '')) fail(`scoreId ${key}`);
    if (typeof c.name !== 'string' || !c.name) fail(`name ${key}`);
    // 자기 값끼리: 파생 값은 출발 종가·예측·실제에서 같은 식으로 다시 센 값과 같아야 한다
    const dv = derive(c.anchor, c.p50, c.actual);
    if (!close(c.predRet, dv.predRet) || !close(c.actRet, dv.actRet) || !close(c.errWon, dv.errWon, 1e-6) || !close(c.apeRatio, dv.apeRatio)) fail(`derived ${key}`);
    if (!['up', 'flat', 'down'].includes(c.predDir) || c.actDir !== dv.actDir || c.sizeOk !== dv.sizeOk || c.dirOk !== (c.predDir === c.actDir) || c.group !== groupOf(c.dirOk, c.sizeOk)) fail(`verdict ${key}`);
    // 채점판의 같은 칸과: 예측·실제(정확히) · 출발 종가(두 등락률로) · 두 방향 · 네 묶음
    const s = sb.get(key); if (!s) fail(`not in scores.json ${key}`);
    const diff = differences(c, s.cell);
    if (diff.length) fail(`${diff[0].field === 'p50' || diff[0].field === 'actual' ? 'price' : diff[0].field} vs scores.json ${key}`);
    const e = counted.get(c.date); e.count++; e.groups[c.group - 1]++;
  }
  // 보류 칸: 채점판에 있고 · 보인 줄과 겹치지 않고 · 까닭이 있고 · 채점판 쪽 값이 실제 채점판과 같아야 한다
  prev = '';
  for (const h of file.held) {
    if (Object.keys(h).join(',') !== HELD_KEYS.join(',')) fail(`held keys ${h.date} ${h.code}`);
    const key = `${h.date}|${h.code}`;
    if (key <= prev) fail(`held order ${key}`); prev = key;
    if (seen.has(key)) fail(`held and shown ${key}`);
    const s = sb.get(key); if (!s) fail(`held not in scores.json ${key}`);
    if (!Array.isArray(h.reasons) || !h.reasons.length || h.reasons.some(r => !HOLD_FIELDS.includes(r?.field))) fail(`held reasons ${key}`);
    const x = s.cell, want = {p50: x.forecast, actual: x.actual, predDir: x.predictedDirection, actDir: x.observedDirection, dirOk: x.directionCorrect, group: scoreboardGroup(x), record: x.forecastId};
    for (const r of h.reasons) {
      if (r.field in want && (r.scoreboard !== want[r.field] || r.ledger === r.scoreboard)) fail(`held reason ${r.field} ${key}`);
      if (r.field === 'anchor' && (!finite(r.ledger) || !finite(r.scoreboard) || Math.abs(r.scoreboard - scoreboardAnchor(x)) > 0.01)) fail(`held reason anchor ${key}`);
    }
    counted.get(h.date).held++;
  }
  // 날짜마다: 보인 줄 + 보류 = 채점판 채점 수(52) · 네 묶음 수와 대표 발행본이 줄에서 센 값·채점판과 같음
  for (const d of file.dates) {
    const want = [...sb.values()].filter(x => x.date === d.date), e = counted.get(d.date);
    const ids = [...new Set(want.map(x => x.cell.forecastId))].sort();
    if (Object.keys(d).join(',') !== 'date,forecastId,count,held,groups') fail(`date keys ${d.date}`);
    if (e.count + e.held !== want.length || d.count !== e.count || d.held !== e.held) fail(`count ${d.date} ${e.count}+${e.held}/${d.count}+${d.held}/${want.length}`);
    if (d.groups.join(',') !== e.groups.join(',') || d.groups.reduce((s, v) => s + v, 0) !== d.count) fail(`groups ${d.date}`);
    if ((Array.isArray(d.forecastId) ? d.forecastId.join(',') : d.forecastId) !== ids.join(',')) fail(`forecastId ${d.date}`);
  }
  return true;
}

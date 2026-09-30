/**
 * 「진화」 칸 숫자 검산 — timeline.mjs 를 쓰지 않고 기록 장부 원본에서 따로 다시 센다(같은 실수를 두 번 하지 않게).
 *   다시 세는 것: 날짜마다 1일 뒤 대표 셀 수 · ATLAS 평균 가격 오차 · 「오늘 값 그대로」 평균 오차 · 덜 틀린 정도 · 방향 맞힘 · 네 갈래 수 ·
 *                시험 수 · 떨어진 수 · 채택/되돌림 수 · 공사 수 · 채점일 수 · 전체 덜 틀린 정도 · 판정일
 *   결과: {ok, checked, mismatches:[{field, shown, recounted}]} — 화면(timeline.json)에 붙여 「검산 어긋남 N」으로 보인다.
 */
const same = (a, b, tol) => (a == null && b == null) || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol) || a === b;

export function recountTimeline({scoreBodies, experimentRecords, operationRecords, modelRecords, sessions, actualAsOf, minScoredDates}) {
  // 대표 셀: 실시간 · 평가 가능 · (목표일·종목·기간)마다 가장 먼저 발행된 것
  const live = scoreBodies.filter(c => c.kind === 'live' && c.evaluable !== false && Number.isFinite(c.ape) && Number.isFinite(c.anchor) && Number.isFinite(c.actual) && c.actual > 0 && (!actualAsOf || c.targetDate <= actualAsOf));
  const first = new Map();
  for (const c of [...live].sort((x, y) => (Date.parse(x.issuedAt) - Date.parse(y.issuedAt)) || (x.forecastId < y.forecastId ? -1 : x.forecastId > y.forecastId ? 1 : 0))) { const k = `${c.targetDate}|${c.code}|${c.horizon}`; if (!first.has(k)) first.set(k, c); }
  const byDate = {};
  for (const c of first.values()) (byDate[c.targetDate] ??= []).push(c);
  const days = {};
  let sumAtlas = 0, sumNaive = 0, n1 = 0;
  for (const [date, cells] of Object.entries(byDate)) {
    const h1 = cells.filter(c => c.horizon === 1);
    let a = 0, nv = 0, hits = 0; for (const c of h1) { a += c.ape; nv += Math.abs(c.anchor - c.actual) / c.actual * 100; if (c.directionCorrect === true) hits++; }
    const classes = {1: 0, 2: 0, 3: 0, 4: 0}; for (const c of cells) if (c.class in classes) classes[c.class]++;
    const exps = experimentRecords.filter(r => r.dateKST === date && r.body?.kind === 'backtest');
    days[date] = {evaluated: cells.length, h1n: h1.length, atlasAPE: h1.length ? a / h1.length : null, naiveAPE: h1.length ? nv / h1.length : null, lessWrongPct: h1.length && nv > 0 ? (1 - a / nv) * 100 : null, directionHits: hits, classes, tested: exps.length, rejected: exps.filter(r => r.body.decision === 'rejected').length};
    sumAtlas += a; sumNaive += nv; n1 += h1.length;
  }
  const scoredDays = Object.values(days).filter(d => d.h1n > 0).length;
  // 지금까지 합친 값(날짜 순으로 쌓아 가며)
  const cumulative = {}; { let sa = 0, sn = 0; for (const date of Object.keys(byDate).sort()) { for (const c of byDate[date].filter(c => c.horizon === 1)) { sa += c.ape; sn += Math.abs(c.anchor - c.actual) / c.actual * 100; } if (days[date].h1n) cumulative[date] = sn > 0 ? (1 - sa / sn) * 100 : null; } }
  const firstDate = Object.keys(days).sort()[0] ?? null;
  const judgementDate = firstDate ? sessions.filter(s => s >= firstDate)[minScoredDates - 1] ?? null : null;
  return {days, cumulative, scoredDays, pooledLessWrongPct: sumNaive > 0 ? (1 - (sumAtlas / n1) / (sumNaive / n1)) * 100 : null, cellsDistance1: n1, judgementDate,
    adopted: modelRecords.filter(r => r.body?.kind === 'adoption').length, rolledBack: modelRecords.filter(r => r.body?.kind === 'rollback').length,
    constructions: operationRecords.filter(r => r.body?.kind === 'construction').length};
}

/** 화면 자료(timeline)와 다시 센 값을 맞대어 본다 — 화면은 반올림해 싣기 때문에 반올림 폭만큼은 같은 값으로 친다 */
export function compareTimeline(timeline, recount) {
  const mismatches = []; let checked = 0;
  const cmp = (field, shown, value, tol) => { checked++; if (!same(shown, value, tol)) mismatches.push({field, shown, recounted: value}); };
  const shownDays = new Map((timeline.days ?? []).filter(d => d.scored).map(d => [d.date, d]));
  cmp('채점일 수', timeline.sample?.scoredDays, recount.scoredDays, 0);
  cmp('1일 뒤 칸 수', timeline.sample?.cellsDistance1, recount.cellsDistance1, 0);
  cmp('전체 덜 틀린 정도', timeline.metric?.pooled?.lessWrongPct, recount.pooledLessWrongPct, 0.006);
  cmp('판정일', timeline.chart?.judgementDate, recount.judgementDate, 0);
  cmp('채택 수', timeline.changes?.adopted, recount.adopted, 0);
  cmp('되돌림 수', timeline.changes?.rolledBack, recount.rolledBack, 0);
  cmp('공사 수', (timeline.constructions ?? []).length, recount.constructions, 0);
  cmp('화면의 채점 날짜 수', shownDays.size, Object.keys(recount.days).length, 0);
  for (const [date, r] of Object.entries(recount.days)) {
    const d = shownDays.get(date), s = d?.byDistance?.[1];
    cmp(`${date} 채점 칸`, d?.evaluated, r.evaluated, 0);
    cmp(`${date} 1일 뒤 종목 수`, s?.n ?? 0, r.h1n, 0);
    if (r.h1n) {
      cmp(`${date} ATLAS 평균 오차`, s?.atlasAPE, r.atlasAPE, 0.00006);
      cmp(`${date} 「오늘 값 그대로」 평균 오차`, s?.naiveAPE, r.naiveAPE, 0.00006);
      cmp(`${date} 덜 틀린 정도`, s?.lessWrongPct, r.lessWrongPct, 0.006);
      cmp(`${date} 방향 맞힘`, s?.directionHits, r.directionHits, 0);
    }
    for (const k of [1, 2, 3, 4]) cmp(`${date} 네 갈래 ${k}`, d?.classes?.[k], r.classes[k], 0);
    cmp(`${date} 시험 수`, d?.changed?.tested, r.tested, 0);
    cmp(`${date} 떨어진 수`, d?.changed?.rejected, r.rejected, 0);
  }
  const points = new Map((timeline.chart?.points ?? []).map(p => [p.date, p.lessWrongPct]));
  for (const [date, r] of Object.entries(recount.days)) if (r.h1n) cmp(`${date} 그림의 점`, points.get(date), r.lessWrongPct, 0.006);
  const cum = new Map((timeline.chart?.cumulative ?? []).map(p => [p.date, p.lessWrongPct]));
  for (const [date, v] of Object.entries(recount.cumulative ?? {})) cmp(`${date} 지금까지 합친 값`, cum.get(date), v, 0.006);
  return {ok: mismatches.length === 0, checked, mismatches};
}

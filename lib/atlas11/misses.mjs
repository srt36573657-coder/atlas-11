/**
 * ATLAS 11 · 「왜 틀렸나」 — 틀린 1거래일 전망을 네 통으로 나누고, 여러 종목을 한꺼번에 틀리게 한 까닭을 묶는다
 *  - 2026-10-01 사장님 요청(「틀린 종목에 이유를 나열해봐」 → 「aaa7377에 올려야」). 규칙은 결과를 보기 전에 정했다
 *    (2026-10-01 05:5x KST · reports/atlas11/misses/misses-1d.md · 같은 규칙의 파이썬 판 scripts/atlas11/miss_bins.py).
 *  - 숫자는 장부에서만: 채점(점수판) + 원인 분석 칸(같은 발행본·종목·목표일의 가장 늦은 판). 평가 규칙·모델·장부는 건드리지 않는다.
 *  - 까닭은 「같은 때 있었던 일」이지 원인 증명이 아니다. 전망 뒤에 나온 기사·공시·수급은 증거로 세지 않는다.
 */
const finite = x => typeof x === 'number' && Number.isFinite(x);
const SIGN = v => (v > 0) - (v < 0);
const toNum = s => (s == null ? null : Number(String(s).replace('−', '-')));
const r1 = v => (finite(v) ? Math.round(v * 10) / 10 : null);
const r2 = v => (finite(v) ? Math.round(v * 100) / 100 : null);

export const MISS_RULES = Object.freeze([
  '대상: 1거래일 전망 · 날마다 대표 발행본(그날 첫 발행본) · 방향 틀림(실제 보합 포함). 방향·보합 경계(±0.10%)는 채점 규칙 그대로.',
  '① 반반이던 예측: 가장 높은 방향 확률과 두 번째 확률의 차이가 5%p 미만(발행 규칙의 「비슷함」 기준 · 발행 전에 정해진 값).',
  '② 시장·업종 흐름(①이 아닐 때): 시장 몫이 실제 움직임의 50% 이상이고 같은 쪽, 또는 같은 업종 묶음이 실제 움직임과 같은 쪽으로 함께 움직임(장부 원인 분석의 「업종 변화」 가설, 강도 중 이상).',
  '③ 놓친 것(①·②가 아닐 때): 전망을 내기 전에 알 수 있던 기업 일정이 있고, 맞힌 종목과 견줘 그런 일정이 틀린 쪽에 더 많음.',
  '④ 까닭 모름: 나머지. 전망 뒤에 나온 기사·공시·수급은 「같은 때 있었던 일」로만 적는다(원인 증명 아님).',
  '한 건은 한 통에만 넣는다(① → ② → ③ → ④ 순서). 여러 종목을 한꺼번에 민 까닭(「하락」 쏠림 등)은 따로 묶어 센다.',
]);
export const MISS_BINS = Object.freeze([
  {id: 'close', label: '반반이던 예측'}, {id: 'flow', label: '시장·업종 흐름'}, {id: 'missed', label: '놓친 것'}, {id: 'unknown', label: '까닭 모름'},
]);

/** 원인 분석 칸: 1거래일 · (발행본, 종목, 목표일)마다 가장 늦게 적은 판 */
export function latestCells(analysisRecords = []) {
  const out = new Map();
  for (const r of analysisRecords) {
    const b = r?.body;
    if (!b || b.kind !== 'cell' || b.horizon !== 1) continue;
    const key = `${b.forecastId}|${b.code}|${b.targetDate}`;
    const prev = out.get(key);
    if (!prev || String(r.at) > String(prev.at)) out.set(key, r);
  }
  return out;
}

const expectedOf = b => { const m = /기대 누적 ([+\-−]?\d+(?:\.\d+)?)%/.exec((b?.modelContribution ?? [])[0] ?? ''); return m ? toNum(m[1]) : null; };
/** 무게 0 칸(명령서 6판 6절 7줄 · 변경 요청서 02): 기대 누적을 이루는 세 항 — 절편(기본값) · 자기 추세(F35) · 52종목 폭·평균(F11) — 이
 *  모두 0.00%로 적힌 칸. 합(기대 누적)만 0.00%로 적힌 칸은 넣지 않는다(9/29 KT&G 절편 +0.07% · 자기 추세 −0.08% · 폭·평균 +0.01% 처럼).
 *  적힌 값은 소수 둘째 자리라 부호만 붙은 「+0.00%」「−0.00%」도 0.00%로 본다. 세 항을 다 읽지 못하면 null(못 가림). */
const PARTS = [/절편 ([+\-−]?\d+(?:\.\d+)?)%/, /자기 추세 ([+\-−]?\d+(?:\.\d+)?)%/, /52종목 폭·평균 ([+\-−]?\d+(?:\.\d+)?)%/];
export const partsOf = b => { const s = (b?.modelContribution ?? [])[0] ?? ''; const v = PARTS.map(re => { const m = re.exec(s); return m ? toNum(m[1]) : null; }); return v.every(finite) ? v : null; };
export const zeroWeight = b => { const v = partsOf(b); return v ? v.every(x => Math.abs(x) < 0.005) : null; };
const bandOf = b => { for (const f of b?.facts ?? []) { const m = /띠 (?:담김|밖)\(폭 (\d+(?:\.\d+)?)%/.exec(f); if (m) return toNum(m[1]); } return null; };
const sectorOf = h => { const m = /같은 묶음 (\d+)종목의 고유 몫 평균 ([+\-−]?\d+(?:\.\d+)?)%(?:\(같은 부호 (\d+)\/(\d+)\))?/.exec(h?.evidence ?? ''); return m ? {size: Number(m[1]), mean: toNum(m[2]), same: m[3] ? Number(m[3]) : null, of: m[4] ? Number(m[4]) : null} : null; };

export function buildMisses({scoreboard, analysisRecords = [], closeCallGap = 0.05, forecastId = null}) {
  const latest = latestCells(analysisRecords);
  const cells = [];
  for (const day of scoreboard?.byDate ?? []) {
    for (const r of day.rows ?? []) {
      const h = r.horizons?.['1'];
      if (!h || h.status !== 'evaluated') continue;
      const rec = latest.get(`${h.forecastId}|${r.code}|${day.date}`), b = rec?.body ?? null;
      const p = h.probabilities ?? {}, ranked = Object.entries(p).filter(([, v]) => finite(v)).sort((x, y) => y[1] - x[1]);
      const gap = ranked.length > 1 ? ranked[0][1] - ranked[1][1] : null;
      const dec = b?.decomposition ?? {}, real = dec.realizedLog, mkt = dec.marketPartLog, res = dec.residualPartLog;
      const hyps = b?.hypotheses ?? [];
      const sched = hyps.filter(x => x.category === '기업 사건' && String(x.evidence ?? '').includes('기업 일정'));
      const sectors = hyps.filter(x => x.category === '업종 변화' && ['중', '강'].includes(x.strength)).map(x => ({...sectorOf(x), text: x.evidence})).filter(x => finite(x.mean));
      const sectorHit = sectors.find(x => finite(real) && SIGN(real) !== 0 && SIGN(x.mean) === SIGN(real)) ?? null;
      const expected = expectedOf(b);
      cells.push({
        date: day.date, code: r.code, name: r.name, forecastId: h.forecastId, analysed: !!b,
        wrong: h.directionCorrect === false, predicted: h.predictedDirection, observed: h.observedDirection,
        prob: finite(p[h.predictedDirection]) ? p[h.predictedDirection] : null, gap, close: finite(gap) && gap < closeCallGap,
        actualReturn: h.actualReturn, marketPart: finite(mkt) ? mkt * 100 : null, residualPart: finite(res) ? res * 100 : null,
        marketShare: finite(dec.marketShare) ? dec.marketShare : null,
        marketAligned: finite(mkt) && finite(real) && SIGN(real) !== 0 && SIGN(mkt) === SIGN(real),
        sector: sectorHit, hasSchedule: sched.length > 0, schedule: sched.map(x => String(x.evidence).replace(/^기간 안 기업 일정 /, '')),
        expected, noSignal: zeroWeight(b), band: bandOf(b),
        tilt: finite(p.down) && finite(p.up) ? (p.down - p.up) * 100 : null,
        categories: [...new Set(hyps.map(x => x.category))],
        after: {news: b?.evidence?.news?.count ?? null, disclosures: (b?.evidence?.disclosures?.items ?? []).map(d => d.title).filter(Boolean)},
      });
    }
  }
  const wrong = cells.filter(c => c.wrong), right = cells.filter(c => !c.wrong);
  // 맞힌 종목과 대조: 근거 종류마다 틀린 쪽 비율 vs 맞힌 쪽 비율
  const kinds = [{key: 'schedule', label: '전망 전에 알 수 있던 기업 일정', has: c => c.hasSchedule}];
  for (const cat of [...new Set(cells.flatMap(c => c.categories))].sort()) kinds.push({key: 'cat:' + cat, label: `장부 가설 「${cat}」`, has: c => c.categories.includes(cat)});
  const contrast = kinds.map(k => { const w = wrong.filter(k.has).length, rr = right.filter(k.has).length; return {key: k.key, label: k.label, wrongWith: w, wrong: wrong.length, rightWith: rr, right: right.length, passes: wrong.length > 0 && right.length > 0 && w / wrong.length > rr / right.length}; });
  const schedulePasses = contrast.find(x => x.key === 'schedule')?.passes === true;
  for (const c of wrong) {
    if (c.close) { c.bin = 'close'; c.why = `가장 높은 확률과 두 번째 확률의 차이 ${r1(c.gap * 100)}%p`; continue; }
    const byMarket = finite(c.marketShare) && c.marketShare >= 0.5 && c.marketAligned;
    if (byMarket || c.sector) {
      c.bin = 'flow';
      const way = c.sector && c.sector.mean > 0 ? '오름' : '내림';
      c.why = byMarket ? `실제 움직임의 ${Math.round(c.marketShare * 100)}%가 시장 전체 움직임` : (c.sector.same != null && c.sector.same === c.sector.of ? `같은 업종 묶음 ${c.sector.of}종목이 모두 같은 쪽(${way})` : c.sector.same != null ? `같은 업종 묶음 ${c.sector.of}종목 중 ${c.sector.same}종목이 같은 쪽(${way})` : `같은 업종 묶음 ${c.sector.size}종목이 같은 쪽(${way})`);
      continue;
    }
    if (c.hasSchedule && schedulePasses) { c.bin = 'missed'; c.why = `전망 전에 알 수 있던 일정: ${c.schedule[0]}`; continue; }
    c.bin = 'unknown';
    c.why = finite(c.residualPart) ? `이 종목만의 움직임 ${c.residualPart > 0 ? '+' : c.residualPart < 0 ? '−' : ''}${Math.abs(r2(c.residualPart)).toFixed(2)}%p · 장부 기록으로 까닭을 가를 수 없음` : '장부 기록으로 까닭을 가를 수 없음';
    if (c.after.disclosures.length) c.note = `전망 뒤 공시 「${c.after.disclosures[0]}」 — 같은 때 있었던 일(원인 증명 아님)`;
  }
  const dates = [...new Set(cells.map(c => c.date))].sort();
  const count = (xs, f) => xs.filter(f).length;
  const binCount = xs => Object.fromEntries(MISS_BINS.map(b => [b.id, count(xs, c => c.bin === b.id)]));
  const basket = Object.fromEntries(dates.map(d => {
    const rec = [...latest.values()].find(r => r.body.targetDate === d && finite(r.body.decomposition?.basketCumLog));
    return [d, rec ? r2(rec.body.decomposition.basketCumLog * 100) : null];
  }));
  // 「하락」 쏠림: 신호 없는 종목(무게 0 칸 = 절편·자기 추세·52종목 폭·평균 세 항이 모두 0.00%)에서 하락을 고른 수와, 흔들림(80% 범위 폭) 셋으로 나눈 기울기
  const ns = cells.filter(c => c.noSignal === true), sig = cells.filter(c => c.noSignal === false);
  const ranged = ns.filter(c => finite(c.band) && finite(c.tilt)).sort((a, b) => a.band - b.band || a.tilt - b.tilt || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) || (a.date < b.date ? -1 : 1));
  const q = Math.floor(ranged.length / 3);
  const ranges = ranged.length >= 6 ? [ranged.slice(0, q), ranged.slice(q, 2 * q), ranged.slice(2 * q)].map(g => ({n: g.length, from: r1(g[0].band), to: r1(g.at(-1).band), tilt: r1(g.reduce((s, c) => s + c.tilt, 0) / g.length), down: count(g, c => c.predicted === 'down')})) : [];
  const order = Object.fromEntries(MISS_BINS.map((b, i) => [b.id, i]));
  return {
    schema: 'atlas11-view-misses-1', forecastId, rules: MISS_RULES, bins: MISS_BINS,
    basis: '장부의 채점(대표 발행본 = 그날 첫 발행본)과 원인 분석 칸(같은 발행본·종목·목표일의 가장 늦은 판) · 까닭은 같은 때 있었던 일이지 원인 증명이 아님 · 평가 규칙·모델은 바꾸지 않음',
    dates, firstDate: dates[0] ?? null, lastDate: dates.at(-1) ?? null,
    counts: {cells: cells.length, wrong: wrong.length, right: right.length, missingAnalysis: count(cells, c => !c.analysed)},
    byDate: Object.fromEntries(dates.map(d => { const dc = cells.filter(c => c.date === d), dw = dc.filter(c => c.wrong); return [d, {cells: dc.length, wrong: dw.length, right: dc.length - dw.length, bins: binCount(dw), basketPct: basket[d]}]; })),
    binTotals: binCount(wrong),
    lean: {predictedDown: count(cells, c => c.predicted === 'down'), predictedUp: count(cells, c => c.predicted === 'up'), predictedFlat: count(cells, c => c.predicted === 'flat'),
      observedDown: count(cells, c => c.observed === 'down'), observedUp: count(cells, c => c.observed === 'up'), observedFlat: count(cells, c => c.observed === 'flat'),
      wrongFromDown: count(wrong, c => c.predicted === 'down'), wrongFromUp: count(wrong, c => c.predicted === 'up'), wrongFromFlat: count(wrong, c => c.predicted === 'flat'),
      closeWrongFromDown: count(wrong, c => c.close && c.predicted === 'down'), downDays: dates.filter(d => finite(basket[d]) && basket[d] < 0).length},
    closeStats: {close: {cells: count(cells, c => c.close), right: count(right, c => c.close)}, notClose: {cells: count(cells, c => !c.close), right: count(right, c => !c.close)}},
    noSignal: {cells: ns.length, down: count(ns, c => c.predicted === 'down'), up: count(ns, c => c.predicted === 'up'), right: count(ns, c => !c.wrong), rightDown: count(ns, c => !c.wrong && c.predicted === 'down'),
      wrong: count(ns, c => c.wrong), wrongDown: count(ns, c => c.wrong && c.predicted === 'down'), tilt: ns.length ? r1(ns.reduce((s, c) => s + (c.tilt ?? 0), 0) / ns.length) : null, rangedCells: ranged.length, ranges},
    signal: {cells: sig.length, right: count(sig, c => !c.wrong)}, unparsed: count(cells, c => c.noSignal === null),
    contrast,
    list: wrong.sort((a, b) => order[a.bin] - order[b.bin] || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (b.gap ?? 0) - (a.gap ?? 0))
      .map(c => ({date: c.date, code: c.code, name: c.name, bin: c.bin, predicted: c.predicted, prob: c.prob, gap: c.gap, observed: c.observed, actualReturn: c.actualReturn, marketPart: r2(c.marketPart), residualPart: r2(c.residualPart), marketShare: c.marketShare, noSignal: c.noSignal, why: c.why, note: c.note ?? null})),
  };
}

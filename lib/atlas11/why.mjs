/**
 * ATLAS 11 · 「내일」 원 화면의 「왜 그렇게 봤나」 자료(화면 묶음 why.json)
 *   2026-10-02 14:08 사장님 「36가지를 점수화해서 예측하는 걸로 알고 있어 — 그 종류와 점수를 표현해 주고 가장 높은 순으로 ·
 *   왜 그 종목이 상승한다고 예측했냐 · 종목별로」
 *   factors  36가지 — 설계 점수(요인 목록 research_priority · 0~100점 · 7A+5B+4H+4O)가 높은 순 + 이 발행본에서 실제로 쓰는지(평균 몫 · 흔들림 폭 · 안 씀)
 *   stocks   종목마다 내일(futureDates[0]) 하루 기대 등락의 몫 — 평균 성분(intercept) + 요인 몫(contributions) = 하루 기대(meanLogReturn)
 * 숫자는 발행본과 요인 목록에서만 가져온다(지어낸 값 없음 · 예측 숫자는 고치지 않음).
 */
const r6 = x => x == null ? null : Math.round(x * 1e6) / 1e6, r2 = x => x == null ? null : Math.round(x * 100) / 100;
export function buildWhy({publication, registry, statusFactors}) {
  const roleOf = new Map((statusFactors?.rows ?? []).map(r => [r.id, r]));
  const factors = (registry?.factors ?? []).map(f => { const s = roleOf.get(f.id); return {id: f.id, name: f.name, group: f.group, score: f.research_priority, rank: f.rank, role: s?.role ?? 'not_used', used: s?.used ?? 0, nonZero: s?.nonZeroCoefficient ?? 0, reason: s?.reason ?? null}; })
    .sort((a, b) => b.score - a.score || a.rank - b.rank);
  const stocks = {};
  for (const a of publication.assets) {
    const r1 = a.rows[1], f = r1.factor36 ?? {}, d = r1.direction.daily;
    stocks[a.code] = {name: a.name, sel: d.selected, up: r6(d.probabilities.up), down: r6(d.probabilities.down), flat: r6(d.probabilities.flat), intercept: r6(f.intercept), mean: r6(f.meanLogReturn),
      parts: Object.entries(f.contributions ?? {}).map(([id, v]) => ({id, value: r6(v), share: r2(f.shares?.[id])}))};
  }
  return {schema: 'atlas11-why-1', forecastId: publication.forecastId, target: publication.futureDates[0], paths: publication.paths ?? null, scoreFormula: registry?.score_formula ?? null, factors, stocks};
}

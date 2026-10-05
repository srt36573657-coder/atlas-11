/**
 * ATLAS 미국 판 · 365곳 고르기(us-n365-v1) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   한국 판(lib/atlas11/universe.mjs n365-v1 · 2026-10-05 09:22)과 같은 생각을 미국 회사에 그대로 쓴다:
 *     · 시가총액 상위 poolTop 곳(미국 상장 보통주 · 가격 이력이 고른 회사) 안에서
 *     · 우량 네 조건 — 2년 연속 흑자(영업이익·순이익 · 금융회사는 순이익만) · ROE 5% 이상 · 부채비율 150% 이하(금융회사는 빚 기준 빼고) · 보통주
 *     · 업종마다 5곳: 우량이거나 시대 트렌드 업종 → 흑자(「흑자」) → 그 업종 큰 회사(「채움」) · 같은 칸 안은 시가총액 큰 순
 *     · 5곳 시가총액 합이 큰 73개 업종 → 모두 365곳
 *   업종 이름(industry)은 자료 출처가 준 업종을 쉬운 한국말로 옮긴 것 — 옮긴 이름과 시대 트렌드 갈래는 ATLAS 가 정한 것 [판단]
 *   앞날 값은 셈하지 않는다(2026-10-04 15:37 「이제 예측을 하지 않는다」) — 지난 결산 · 지난 종가 · 업종 이름으로만 고른다
 *   이 파일은 셈만 한다(받기 · 쓰기 없음) — 시험: tests/atlas11/us-universe.test.mjs
 */

/** 시대 트렌드(미국) — 한국 판 여덟 갈래와 같은 뜻을 미국 업종 이름(한국말)에 맞춘 것 · 낱말로 가른다 [판단] */
export const US_TREND_GROUPS = Object.freeze([
  Object.freeze({id: 'ai-chip', label: 'AI·반도체', words: /반도체|전자\s?부품|컴퓨터\s?하드웨어|저장\s?장치|네트워크\s?장비|통신\s?장비/}),
  Object.freeze({id: 'power', label: '전력·원전·에너지', words: /전력|유틸리티|원자력|원전|에너지\s?장비|전기\s?장비|전력\s?기기|태양광|재생\s?에너지/}),
  Object.freeze({id: 'battery', label: '전기차·배터리', words: /전기차|배터리|2차\s?전지/}),
  Object.freeze({id: 'ship-defense', label: '방산·우주', words: /방산|국방|항공\s?우주|우주|조선/}),
  Object.freeze({id: 'machine-robot', label: '기계·로봇·자동화', words: /기계|로봇|자동화|산업\s?장비/}),
  Object.freeze({id: 'bio', label: '바이오·헬스', words: /제약|바이오|생명\s?공학|생명\s?과학|의료\s?기기|의료\s?장비|헬스/}),
  Object.freeze({id: 'platform', label: 'AI 플랫폼·소프트웨어', words: /소프트웨어|인터넷|클라우드|IT\s?서비스|플랫폼|데이터/}),
]);
export const usTrendOf = industry => US_TREND_GROUPS.find(g => g.words.test(String(industry ?? ''))) ?? null;

/** 금융회사(빚 기준을 빼고 보는 업종 — 예금·보험금이 빚으로 잡히는 구조) · 업종 이름(한국말) 낱말로 가른다 */
export const US_FINANCIAL = /은행|보험|증권|자산\s?운용|카드|신용|대출|금융|투자\s?회사|저축/;

export const US365 = Object.freeze({
  version: 'us-n365-v1', label: '미국 업종 73개 · 365곳', place: 'us',
  poolTop: 1500,           // 시가총액 순위(뉴욕증권거래소 · 나스닥 · NYSE American 합쳐서) 이 안에서만
  minHistoryRows: 253,     // 일봉 253개 이상(지난 1년 숫자 · 252거래일 변화를 셀 수 있게)
  profitYears: 2, roeMinPct: 5, debtMaxPct: 150,
  perIndustry: 5, industries: 73, count: 365,
  fill: Object.freeze(['quality-or-trend', 'profit', 'size']),
  trendGroups: US_TREND_GROUPS,
  says: '미국 상장 보통주 시가총액 상위 1,500곳 가운데 업종마다 5곳(우량주 · 시대 트렌드 업종 → 흑자 → 큰 회사) · 5곳 시가총액 합이 큰 73개 업종 · 모두 365곳',
});

/** 보통주가 아닌 것(ETF · 펀드 · 우선주 · 워런트 · 스팩 · 리츠) — 한국 판 notCommon 과 같은 뜻 */
export const usNotCommon = c => c.common === false || /\b(ETF|ETN|FUND|TRUST UNITS?|WARRANTS?|RIGHTS?|UNITS?|PREFERRED|DEPOSITARY SHARES? REPRESENTING|ACQUISITION CORP)\b/i.test(String(c.nameEn ?? '')) || /리츠$|스팩/.test(String(c.name ?? '')) || /\bREIT\b/i.test(String(c.nameEn ?? '')) || /리츠/.test(String(c.industry ?? ''));
export const usIsFinancial = c => c.financial === true || US_FINANCIAL.test(String(c.industry ?? ''));
/** 숫자일 때만(빈 값 null 이 0 처럼 셈에 끼지 않게 — null <= 150 은 참이 된다) */
const num = x => typeof x === 'number' && Number.isFinite(x);
const inPool = (c, r) => num(c.capRank) && c.capRank >= 1 && c.capRank <= r.poolTop;

/** 후보 하나가 못 넘은 우량 조건들(빈 배열이면 우량) */
export function usFailsOf(c, r = US365) {
  const f = [], fin = usIsFinancial(c), m = c.metrics;
  if (usNotCommon(c)) f.push('보통주 아님');
  if (!inPool(c, r)) f.push(num(c.capRank) ? `시가총액 ${r.poolTop}위 밖` : '시가총액 모름');
  if (!c.industry) f.push('업종 모름');
  if (!c.history?.ok) f.push(c.history ? `가격 이력 부족(${c.history.rows}일)` : '가격 이력 없음');
  if (!m) { f.push('결산 자료 없음'); return f; }
  const years = [[m.op, m.net], [m.opPrev, m.netPrev]].slice(0, r.profitYears);
  if (years.some(([op, net]) => !(num(net) && net > 0) || (!fin && !(num(op) && op > 0)))) f.push(`${r.profitYears}년 연속 흑자 아님`);
  if (!(num(m.roe) && m.roe >= r.roeMinPct)) f.push(num(m.roe) ? `ROE ${r.roeMinPct}% 미만` : 'ROE 모름');
  if (!fin && !(num(m.debt) && m.debt <= r.debtMaxPct)) f.push(num(m.debt) ? `부채비율 ${r.debtMaxPct}% 초과` : '부채비율 모름');
  return f;
}

/**
 * selectUs365(candidates, rules) → {ok, rules, picked, checked, counts}
 *   candidates: [{code, name(한국 이름), nameEn, exchange, industry(한국말 업종), industryEn, capUsd, capRank, financial?, common?, history:{rows, ok}, metrics:{fiscalYear, op, opPrev, net, netPrev, roe, debt}}]
 */
export function selectUs365(candidates, rules = US365) {
  const r = {...rules};
  const checked = candidates.map(c => ({...c, fails: usFailsOf(c, r), trend: usTrendOf(c.industry)}));
  const bySize = (a, b) => (b.capUsd ?? 0) - (a.capUsd ?? 0) || String(a.code).localeCompare(String(b.code));
  const base = c => !usNotCommon(c) && inPool(c, r) && c.history?.ok === true && !!c.industry;
  const profit = c => { const m = c.metrics; return !!m && num(m.net) && m.net > 0 && (usIsFinancial(c) || (num(m.op) && m.op > 0)); };
  const kindOf = c => !c.fails.length ? 'quality' : c.trend ? 'trend' : profit(c) ? 'profit' : 'size';
  const steps = r.fill.map(f => f === 'quality-or-trend' ? ['quality', 'trend'] : [f]);
  const pool = checked.filter(base).map(c => ({...c, kind: kindOf(c)}));
  const by = new Map(); for (const c of pool) { if (!by.has(c.industry)) by.set(c.industry, []); by.get(c.industry).push(c); }
  const full = [...by].map(([industry, list]) => {
    const picks = steps.flatMap(ks => list.filter(c => ks.includes(c.kind)).sort(bySize)).slice(0, r.perIndustry);
    return {industry, size: list.length, strict: list.filter(c => c.kind === 'quality' || c.kind === 'trend').length, picks, capUsd: picks.reduce((t, c) => t + (c.capUsd ?? 0), 0)};
  });
  const filled = full.filter(x => x.picks.length === r.perIndustry).sort((a, b) => b.capUsd - a.capUsd || a.industry.localeCompare(b.industry, 'ko'));
  const chosen = filled.slice(0, r.industries);
  const picked = chosen.flatMap((ind, k) => ind.picks.map(c => ({...c, industryRank: k + 1}))).map((c, i) => ({...c, rank: i + 1, debtExempt: usIsFinancial(c)}));
  const kinds = picked.reduce((m, c) => (m[c.kind] = (m[c.kind] ?? 0) + 1, m), {});
  const tally = xs => Object.fromEntries([...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]));
  const counts = {candidates: candidates.length, pool: pool.length, industriesInPool: full.length, industriesFilled: filled.length, industries: chosen.length, picked: picked.length, kinds,
    chosen: chosen.map((x, k) => ({rank: k + 1, industry: x.industry, size: x.size, strict: x.strict, capUsd: Math.round(x.capUsd), names: x.picks.map(c => c.name)})),
    notChosenFilled: filled.slice(r.industries).map(x => ({industry: x.industry, size: x.size, capUsd: Math.round(x.capUsd)})),
    short: full.filter(x => x.picks.length < r.perIndustry).sort((a, b) => b.picks.length - a.picks.length).map(x => ({industry: x.industry, have: x.picks.length})),
    failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
  return {ok: picked.length === r.count && chosen.length === r.industries, rules: r, picked, checked, counts};
}

/** 화면 「어떻게 골랐나」(쉬운 말 · 실제로 쓴 규칙 그대로) */
export const usHowLines = (r = US365, source = '') => [
  `미국 상장 보통주(뉴욕증권거래소 · 나스닥) 시가총액 상위 ${r.poolTop.toLocaleString('ko-KR')}곳 안에서 고름 · 지난 1년 종가가 고른 회사`,
  `업종마다 ${r.perIndustry}곳: 우량주(${r.profitYears}년 연속 흑자 · ROE ${r.roeMinPct}% 이상 · 부채비율 ${r.debtMaxPct}% 이하 · 은행·보험 같은 금융회사는 빚 기준 빼고) 또는 시대 트렌드 업종(${r.trendGroups.map(g => g.label).join(' · ')}) → 모자라면 흑자 회사 → 그래도 모자라면 그 업종 큰 회사`,
  `${r.perIndustry}곳 시가총액 합이 큰 ${r.industries}개 업종 · 모두 ${r.count}곳 · 업종의 한국말 이름과 시대 트렌드 업종은 ATLAS 가 정한 것${source ? ` · 자료: ${source}` : ''}`,
];

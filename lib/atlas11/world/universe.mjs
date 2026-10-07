/**
 * ATLAS 중국 · 일본 · 베트남 판 · 고르기 — 미국 판과 같은 규칙(lib/atlas11/us/universe.mjs selectUs365)을 그대로 쓴다
 *   사장님 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
 *   · 시가총액 상위 poolTop 곳 안에서 · 우량 네 조건(2년 연속 흑자 · ROE 5% 이상 · 부채비율 150% 이하 · 금융회사는 빚 기준 빼고) · 업종마다 5곳 · 5곳 합이 큰 73개 업종
 *   · 업종 이름은 네이버 증권 해외주식이 붙인 한국말(미국 판과 같은 분류) — 시대 트렌드 갈래도 미국 판 낱말 그대로
 *   · 베트남은 상장 회사가 약 700곳이라 5곳을 채운 업종 수만큼(flexible) [판단]
 *   · 미국 판에만 있는 거르기(외국 회사 · 예탁증서 ADR)는 나라 값이 없어 걸리지 않는다(빈 나라는 빼지 않음)
 *   앞날 값은 셈하지 않는다 — 지난 결산 · 지난 종가 · 업종 이름으로만
 */
import {selectUs365, US_TREND_GROUPS} from '../us/universe.mjs';

export function worldRules(m, industries = m.industries) {
  const count = industries * m.perIndustry;
  return {version: `${m.id}-n${m.flexible ? 'flex' : count}-v1`, label: `${m.label} 업종 ${industries}개 · ${count}곳`, place: m.id,
    poolTop: m.poolTop, minHistoryRows: 240, profitYears: 2, roeMinPct: 5, debtMaxPct: 150,
    perIndustry: m.perIndustry, industries, count, fill: ['quality-or-trend', 'profit', 'size'], trendGroups: US_TREND_GROUPS,
    says: `${m.label} 회사 보통주 시가총액 상위 ${m.poolTop.toLocaleString('en-US')}곳 가운데 업종마다 ${m.perIndustry}곳(우량주 · 시대 트렌드 업종 → 흑자 → 큰 회사) · ${m.perIndustry}곳 시가총액 합이 큰 ${industries}개 업종 · 모두 ${count}곳`};
}

/** 고르기 — 베트남(flexible)은 5곳을 채운 업종이 73개보다 적으면 그 수로 다시 고른다(10개 미만이면 고르지 않음) */
export function selectWorld(candidates, m) {
  let rules = worldRules(m), sel = selectUs365(candidates, rules);
  if (m.flexible && !sel.ok) {
    const n = Math.min(m.industries, sel.counts.industriesFilled);
    if (n >= 10) { rules = worldRules(m, n); sel = selectUs365(candidates, rules); }
  }
  return {...sel, rules};
}

/** 화면 「어떻게 골랐나」(쉬운 말 · 실제로 쓴 규칙 그대로) */
export const worldHowLines = (m, r, source = '') => [
  `${m.label} 회사 보통주(${m.exchanges.length > 1 ? `${m.exchangeText.replace(/ 정규장$/, '')} 두 곳` : m.exchangeText.replace(/ 정규장$/, '')} · ETF · 우선주 빼고 · 같은 회사의 다른 주식은 큰 쪽 하나) 시가총액 상위 ${r.poolTop.toLocaleString('en-US')}곳 안에서 고름`,
  `업종마다 ${r.perIndustry}곳: 우량주(${r.profitYears}년 연속 흑자 · ROE ${r.roeMinPct}% 이상 · 부채비율 ${r.debtMaxPct}% 이하 · 은행·보험 같은 금융회사는 빚 기준 빼고) 또는 시대 트렌드 업종 → 흑자 회사 → 큰 회사 차례`,
  `${r.perIndustry}곳 시가총액 합이 큰 ${r.industries}개 업종 · 모두 ${r.count}곳 · 업종 이름은 네이버 증권 해외주식이 붙인 한국말 그대로 · 시대 트렌드 업종은 ATLAS 가 정한 것${source ? ` · 자료: ${source}` : ''}`,
];

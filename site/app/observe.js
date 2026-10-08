/* ATLAS 11 · 관측 한 문장 · 핵심 수치 · 반대 근거 고르기(규칙 obs-rules-1 · 실험 규칙 · 검증 전)
   2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 0-A · 0-D · 5 — 한 문장 요약은 정해진 계산 결과에서 만든다
   · 화면(site/app) · 시험(tests/atlas11/observe.test.mjs)이 이 파일 하나를 함께 씀 — 숫자는 calc.js 로만 셈
   · 원인을 붙이지 않음(가격이 왜 움직였는지 말하지 않음) · 20거래일 값을 「오늘」이라 부르지 않음 · 뚜렷한 변화가 없으면 그렇다고 씀
   · 문장 · 수치 · 차트 · 반대 근거가 같은 값을 쓰도록 이 함수가 한 번에 돌려줌(data-check 로 검사기가 맞댐) */
import {fin, fmtPct, fmtPp, poolMean, topIndex, median} from './calc.js';

export const OBS_RULES = {
  id: 'obs-rules-2', // 2026-10-09 셋째 개정본 0-E — 업종 화면 「쏠림」(평균은 올랐는데 상승 1위를 빼면 0 이하) 규칙 더함 · 옛 obs-rules-1
  flat: 1, // 지수 · 중앙값이 모두 ±1% 안이면 「뚜렷한 변화 없음」
  minN: 30, // 시장 표본이 30곳보다 적으면 판단 보류
  skew: 1, // 평균 − 중앙값(또는 1위 업종 제외로 줄어든 폭)이 1%p 이상이면 쏠림
};
const P = v => fmtPct(v), PP = v => fmtPp(v);
const pctOf = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null);

/** 업종마다 값이 있는 종목의 수익률 합 · 수(동일가중 펼치기 재료) — lens.stocks 의 r20(지연 · 오래된 종가 · 기업행사 확인은 null) */
export function sectorParts(lens) {
  const by = new Map((lens?.sectors ?? []).map(s => [s.id, {id: s.id, label: s.label, sum: 0, count: 0, total: 0, up: 0, codes: s.codes ?? []}]));
  for (const s of lens?.stocks ?? []) { const g = by.get(s.g); if (!g) continue; g.total++; if (fin(s.r20)) { g.sum += s.r20; g.count++; if (s.r20 > 0) g.up++; } }
  return [...by.values()].map(g => ({...g, sum: g.count ? g.sum : null, mean: g.count ? g.sum / g.count : null}));
}

/** 시장 첫 화면 — 관측 한 문장 · 핵심 수치 셋 · 반대 근거 하나(규칙 차례대로 · 처음 맞는 것) */
export function marketObservation(lens) {
  const R = lens?.market?.ref ?? {}, S = lens?.market?.sample?.d20 ?? {}, I = R.r20, n = S.n ?? 0;
  const M = S.mean, Md = S.median, U = S.upRatio, u = S.up ?? 0, d = S.down ?? 0;
  const parts = sectorParts(lens), cs = parts.map(g => (g.count && n ? g.sum / n : null)), k = topIndex(cs);
  const ex = k >= 0 ? poolMean(parts, new Set([k])) : {mean: null, n: 0}, top = k >= 0 ? parts[k] : null;
  const base = {rules: OBS_RULES.id, I, M, Md, U, u, d, n, top: top ? {id: top.id, label: top.label, count: top.count, contrib: cs[k]} : null, exTop: ex.mean, exN: ex.n};
  if (!fin(I) || n < OBS_RULES.minN || !fin(Md)) return {...base, kind: 'na', text: '판단 보류 — 지수나 선정 종목 값이 모자람', counter: null};
  let kind;
  if (Math.abs(I) < OBS_RULES.flat && Math.abs(Md) < OBS_RULES.flat) kind = 'flat';
  else if (I >= OBS_RULES.flat && U < 50) kind = 'divUp';
  else if (I <= -OBS_RULES.flat && U > 50) kind = 'divDown';
  else kind = (Math.abs(I) >= OBS_RULES.flat ? I > 0 : Md > 0) ? 'agreeUp' : 'agreeDown';
  const text = {
    flat: `최근 20거래일 뚜렷한 변화 없음 — 지수 ${P(I)} · 선정 ${n}곳 중앙값 ${P(Md)}`,
    divUp: `최근 20거래일 지수는 ${P(I)} 올랐지만, 선정 ${n}곳 가운데 오른 곳은 ${u}곳(${pctOf(u, n)}%)입니다`,
    divDown: `최근 20거래일 지수는 ${P(I)} 내렸지만, 선정 ${n}곳 가운데 오른 곳이 ${u}곳(${pctOf(u, n)}%)입니다`,
    agreeUp: `최근 20거래일 지수 ${P(I)}, 선정 ${n}곳 가운데 ${u}곳(${pctOf(u, n)}%)이 올랐습니다`,
    agreeDown: `최근 20거래일 지수 ${P(I)}, 선정 ${n}곳 가운데 ${d}곳(${pctOf(d, n)}%)이 내렸습니다`,
  }[kind];
  // 반대 근거 — 문장이 보이는 쪽(오름 · 내림)과 반대되는 가장 큰 사실 하나
  const upRead = kind === 'agreeUp' || kind === 'divDown' || (kind === 'flat' && Md >= 0);
  const skew = fin(M) ? M - Md : null, drop = fin(M) && fin(ex.mean) ? M - ex.mean : null;
  let counter;
  if (upRead) {
    if (Math.max(skew ?? -Infinity, drop ?? -Infinity) >= OBS_RULES.skew) counter = (skew ?? -Infinity) >= (drop ?? -Infinity)
      ? {kind: 'skew', text: `평균 ${P(M)}은 크게 오른 몇 곳이 끌어올린 값 — 중앙값은 ${P(Md)}`}
      : {kind: 'top', text: `${top.label} ${top.count}곳을 빼면 선정 평균 ${P(M)} → ${P(ex.mean)}`};
    else counter = {kind: 'even', text: `쏠림 작음 — 평균 ${P(M)} · 중앙값 ${P(Md)} · 기여 1위 업종을 빼도 ${P(ex.mean)}`};
  } else if (fin(M) && M >= 0 && (skew ?? 0) >= OBS_RULES.skew) counter = {kind: 'skew', text: `그래도 평균은 ${P(M)} — 크게 오른 몇 곳이 끌어올림(중앙값 ${P(Md)})`};
  else {
    const best = parts.filter(g => g.count >= 3 && fin(g.mean)).sort((a, b) => b.mean - a.mean)[0];
    counter = best ? {kind: 'strong', text: `가장 많이 오른 업종 ${best.label} 평균 ${P(best.mean)}(${best.count}곳 중 ${best.up}곳 상승)`, id: best.id} : null;
  }
  return {...base, kind, text, counter};
}

/** 업종 탭 — 업종 73개(값이 있는 업종)의 폭 · 기여 1위 */
export function sectorsObservation(lens) {
  const parts = sectorParts(lens), live = parts.filter(g => g.count >= 1), G = parts.length, n = parts.reduce((t, g) => t + g.count, 0);
  const up = live.filter(g => g.mean > 0).length, broad = (lens?.sectors ?? []).filter(s => s.level === 'broad').length;
  const cs = parts.map(g => (g.count && n ? g.sum / n : null)), k = topIndex(cs), M = poolMean(parts).mean, ex = k >= 0 ? poolMean(parts, new Set([k])) : {mean: null};
  const top = k >= 0 ? parts[k] : null;
  return {rules: OBS_RULES.id, G, live: live.length, up, broad, n, M, exTop: ex.mean, top: top ? {id: top.id, label: top.label, count: top.count, contrib: cs[k], mean: top.mean} : null,
    text: `최근 20거래일 ATLAS 업종 ${G}개 가운데 평균이 오른 업종은 ${up}개, 다섯 곳이 함께 오른 업종(동반 강세)은 ${broad}개입니다`,
    counter: top && fin(M) && fin(ex.mean) ? {kind: 'top', text: `기여 1위 ${top.label} ${top.count}곳을 빼면 선정 평균 ${P(M)} → ${P(ex.mean)}`} : null};
}

/** 업종 화면 — 평균 · 중앙값 · 오른 곳 · 1위 제외(구성 종목 펼치기의 첫 문장) */
export function sectorObservation(lens, id) {
  const sc = (lens?.sectors ?? []).find(s => s.id === id), R = lens?.market?.ref ?? {};
  const rows = (lens?.stocks ?? []).filter(s => s.g === id), valid = rows.filter(s => fin(s.r20));
  const n = valid.length, m = n ? valid.reduce((t, s) => t + s.r20, 0) / n : null, u = valid.filter(s => s.r20 > 0).length, dn = valid.filter(s => s.r20 < 0).length;
  const sorted = [...valid].sort((a, b) => b.r20 - a.r20), top = sorted[0] ?? null;
  const exTop = n > 1 ? (valid.reduce((t, s) => t + s.r20, 0) - top.r20) / (n - 1) : null, md = sc?.d20?.median ?? null, gap = fin(m) && fin(R.r20) ? m - R.r20 : null;
  const label = sc?.label ?? '';
  const base = {rules: OBS_RULES.id, id, n, total: rows.length, m, md, u, d: dn, exTop, gap, top: top ? {code: top.code, name: top.name, r: top.r20} : null};
  if (n < 3) return {...base, kind: 'na', text: `${label} — 값이 있는 종목이 ${n}곳뿐이라 판단 보류`, counter: null};
  let kind, text;
  if (Math.abs(m) < OBS_RULES.flat) { kind = 'flat'; text = `최근 20거래일 ${label} 평균 ${P(m)} — 뚜렷한 변화 없음(${n}곳 중 ${u}곳 오름)`; } // ±1% 안(「0.0% 올랐지만」 같은 문장을 만들지 않음)
  else if (m > 0 && fin(exTop) && exTop <= 0) { kind = 'concentrated'; text = `최근 20거래일 ${label} 평균은 ${P(m)} 올랐지만, 상승 1위를 빼면 ${P(exTop)}입니다(${n}곳 중 ${u}곳 오름)`; } // 같은 평균 · 다른 구조(셋째 개정본 0-E B · C 사례) — 평균 상승이 한 곳에 몰림
  else if (m > 0 && u / n < 0.5) { kind = 'divUp'; text = `최근 20거래일 ${label} 평균은 ${P(m)} 올랐지만, 오른 곳은 ${n}곳 중 ${u}곳입니다`; }
  else if (m > 0) { kind = 'up'; text = `최근 20거래일 ${label} 평균 ${P(m)} · ${n}곳 중 ${u}곳이 올랐습니다`; }
  else { kind = 'down'; text = `최근 20거래일 ${label} 평균 ${P(m)} · ${n}곳 중 ${dn}곳이 내렸습니다`; }
  const counter = kind === 'concentrated' ? {kind: 'median', text: `중앙값 ${P(md ?? median(valid.map(s => s.r20)))} · 오른 곳 ${u}/${n}곳`} // 문장이 이미 1위 제외 값을 말함 — 반대 근거는 중앙값 · 오른 곳
    : m > 0 ? {kind: 'exTop', text: `상승 1위 ${top.name} 제외 평균 ${P(exTop)}`} : u ? {kind: 'strong', text: `가장 많이 오른 ${top.name} ${P(top.r20)}`} : {kind: 'none', text: '오른 곳 없음'};
  return {...base, kind, text, counter};
}
export {P as fmtObsPct, PP as fmtObsPp};

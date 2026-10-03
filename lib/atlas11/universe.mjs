/**
 * ATLAS 11 · 종목 고르기(우량 52) — 2026-10-04 00:51 사장님 「52개 업종에서 찾는 게 아니라 오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경하자」,
 *   01:00 「알아서 해」 → 다섯 가지를 제 안대로 정함(채팅 기록):
 *   ① 고르는 법: 시가총액 상위 300곳 중 2년 연속 흑자 · 빚이 적음(부채비율 150% 이하 · 금융회사 제외) · ROE 5% 이상 → 점수 순 52곳 · 한 업종 4곳까지
 *   ② 오를지 내릴지는 지금처럼 ATLAS가 매일 따로 적는다(고르는 데 「오를 것 같다」를 쓰지 않는다 — 지난 120거래일 후향 방향 맞힘 51.7%라 쓸 근거가 없음)
 *   ③ 다시 고르기: 한 달에 한 번  ④ 바꾸는 날: 2026-10-06 실행 · 옛 52종목 기록은 그대로 보관  ⑤ 화면 말: 「튼튼한 회사 52곳」(사라·추천 같은 말 없음)
 *
 * 이 파일은 네트워크를 쓰지 않는다(받은 원문을 풀고 · 규칙대로 고르고 · 새 입력을 만든다). 받기는 scripts/atlas11/collect_universe.mjs.
 * 같은 원문이면 언제나 같은 52곳이 나온다(정렬 기준: 점수 → 시가총액 → 종목코드).
 */
import {createHash} from 'node:crypto';

export const UNIVERSE_SCHEMA = 'atlas11-universe-proposal-1';
export const BUNDLE_SCHEMA = 'atlas11-universe-bundle-1';

/** 규칙 판 하나 — 바꾸면 version 을 올린다(옛 판은 기록에 남는다) */
export const QUALITY52 = Object.freeze({
  version: 'q52-v1',
  label: '튼튼한 회사 52곳',
  poolTop: 300,            // 시가총액 순위(코스피·코스닥 합쳐서) 이 안에서만
  minHistoryRows: 600,     // 일봉 600개 이상(모형 학습 · 연쇄 지도 504거래일)
  completeSessions: 505,   // 마지막 505거래일은 빠진 날·멈춘 날이 없어야 함
  profitYears: 2,          // 최근 결산 2년 연속 흑자(영업이익·당기순이익 · 금융회사는 당기순이익만)
  roeMinPct: 5,            // 최근 결산 ROE 5% 이상
  debtMaxPct: 150,         // 최근 결산 부채비율 150% 이하(금융회사는 빼고 봄 — 예금·보험금이 빚으로 잡히는 구조)
  perSectorMax: 4,         // 한 업종(네이버 업종) 4곳까지
  count: 52,
  weights: Object.freeze({roe: 0.4, debt: 0.3, size: 0.3}),
  financialSectors: Object.freeze(['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자']),
  // 52곳이 안 차면 이 순서로 한 단계씩만 늦춘다(어느 단계를 썼는지 기록)
  relax: Object.freeze([Object.freeze({debtMaxPct: 200}), Object.freeze({roeMinPct: 3}), Object.freeze({profitYears: 1})]),
  says: '시가총액 상위 300곳 중 2년 연속 흑자 · 부채비율 150% 이하(금융회사 제외) · ROE 5% 이상인 회사를 점수(ROE 40% · 빚 적음 30% · 회사 크기 30%) 순으로 52곳 · 한 업종 4곳까지',
});

// ---------- 숫자 ----------
export const num = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/,/g, '').trim();
  const m = /^[+-]?\d+(\.\d+)?/.exec(s.replace(/^[^\d+-]+/, ''));
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};
/** 「1,607조 7,266억」 → 억원(16,077,266) · 「7,266억」 → 7,266 */
export function koreanAmountEok(text) {
  if (typeof text !== 'string') return null;
  const jo = /([\d,]+)\s*조/.exec(text), eok = /([\d,]+)\s*억/.exec(text);
  if (!jo && !eok) return num(text);
  return (jo ? num(jo[1]) * 10000 : 0) + (eok ? num(eok[1]) : 0);
}
const strip = html => String(html ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const sha = s => createHash('sha256').update(s).digest('hex');

// ---------- 원문 풀기 ----------
/** m.stock.naver.com /api/stocks/marketValue/{KOSPI|KOSDAQ} → [{code, name, market, endType, listValue}] (listValue 는 그 목록 안 순위용) */
export function parseMarketValueJson(text, market) {
  const j = JSON.parse(text);
  const list = Array.isArray(j) ? j : Array.isArray(j?.stocks) ? j.stocks : Array.isArray(j?.result?.stocks) ? j.result.stocks : null;
  if (!list) throw Error('MARKET_VALUE_JSON_SHAPE');
  return list.map(s => ({code: String(s.itemCode ?? s.code ?? ''), name: s.stockName ?? s.name ?? null, market, endType: s.stockEndType ?? null, listValue: num(s.marketValue)})).filter(x => /^\d{6}$/.test(x.code));
}
/** finance.naver.com /sise/sise_market_sum.naver (EUC-KR 표) → 같은 모양 · 시가총액 칸은 머리글 이름으로 찾는다 */
export function parseMarketSumHtml(html, market) {
  const table = /<table[^>]*class="type_2"[^>]*>([\s\S]*?)<\/table>/i.exec(html)?.[1] ?? html;
  const heads = [...table.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m => strip(m[1]));
  const capAt = heads.findIndex(h => h.replace(/\s/g, '') === '시가총액');
  if (capAt < 0) throw Error('MARKET_SUM_HEADER');
  const out = [];
  for (const tr of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const link = /href="\/item\/main\.naver\?code=(\d{6})"[^>]*>([^<]+)<\/a>/i.exec(tr[1]); if (!link) continue;
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => strip(m[1]));
    out.push({code: link[1], name: strip(link[2]), market, endType: null, listValue: num(tds[capAt])});
  }
  if (!out.length) throw Error('MARKET_SUM_ROWS');
  return out;
}
/** finance.naver.com /sise/sise_group.naver?type=upjong → [{no, name}] */
export function parseUpjongList(html) {
  const out = [], seen = new Set();
  for (const m of html.matchAll(/sise_group_detail\.naver\?type=upjong&(?:amp;)?no=(\d+)"[^>]*>([^<]+)<\/a>/gi)) { const no = m[1]; if (seen.has(no)) continue; seen.add(no); out.push({no, name: strip(m[2])}); }
  if (!out.length) throw Error('UPJONG_LIST_EMPTY');
  return out;
}
/** 업종 상세 → 그 업종 종목코드들 */
export function parseUpjongDetail(html) {
  return [...new Set([...html.matchAll(/\/item\/main\.naver\?code=(\d{6})/g)].map(m => m[1]))];
}
/** m.stock.naver.com /api/stock/{code}/integration (2026-09-29 실제 응답 확인: reports/atlas11/probe/deep/naver-integration-005930.json) */
export function parseIntegration(text) {
  const j = JSON.parse(text);
  if (!j || typeof j !== 'object' || !Array.isArray(j.totalInfos)) throw Error('INTEGRATION_SHAPE');
  const info = Object.fromEntries(j.totalInfos.map(t => [t.code, t.value]));
  return {code: String(j.itemCode ?? ''), name: j.stockName ?? null, endType: j.stockEndType ?? null, industryCode: j.industryCode != null ? String(j.industryCode) : null,
    marketCapEok: koreanAmountEok(info.marketValue), per: num(info.per), eps: num(info.eps), pbr: num(info.pbr), bps: num(info.bps), dividendYield: num(info.dividendYieldRatio),
    high52: num(info.highPriceOf52Weeks), low52: num(info.lowPriceOf52Weeks), tradingValueText: info.accumulatedTradingValue ?? null,
    industryPeers: (j.industryCompareInfo ?? []).map(p => ({code: String(p.itemCode ?? ''), name: p.stockName ?? null}))};
}
const rowKey = t => String(t ?? '').replace(/\s+/g, '').replace(/\(.*?\)/g, '');
/** m.stock.naver.com /api/stock/{code}/finance/annual → {periods:[{key,title,consensus}], rows:{이름:{key:값}}} */
export function parseFinanceJson(text) {
  const j = JSON.parse(text), fi = j?.financeInfo ?? j;
  const periods = (fi?.trTitleList ?? []).map(t => ({key: String(t.key ?? t.title), title: String(t.title ?? t.key).replace(/\.$/, ''), consensus: t.isConsensus === 'Y'}));
  const rows = {};
  for (const r of fi?.rowList ?? []) rows[rowKey(r.title)] = Object.fromEntries(Object.entries(r.columns ?? {}).map(([k, v]) => [String(k), num(typeof v === 'object' && v ? v.value : v)]));
  if (!periods.length || !Object.keys(rows).length) throw Error('FINANCE_JSON_SHAPE');
  return {periods, rows, source: 'finance_json'};
}
/** finance.naver.com /item/main.naver 의 「기업실적분석」 표(cop_analysis) → 같은 모양(연간 칸만) */
export function parseCopAnalysisHtml(html) {
  const at = html.indexOf('cop_analysis'); if (at < 0) throw Error('COP_ANALYSIS_ABSENT');
  const section = html.slice(at, html.indexOf('</table>', at) + 8);
  const thead = /<thead[^>]*>([\s\S]*?)<\/thead>/i.exec(section)?.[1] ?? '';
  const annualCols = Number(/colspan="(\d+)"[^>]*>[\s\S]*?최근\s*연간\s*실적/i.exec(thead)?.[1] ?? /최근\s*연간\s*실적[\s\S]*?colspan="(\d+)"/i.exec(thead)?.[1] ?? 4) || 4;
  const trs = [...thead.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(x => strip(x[1])));
  const periodRow = trs.find(r => r.some(x => /^\d{4}\.\d{2}/.test(x))) ?? [];
  const periods = periodRow.filter(x => /^\d{4}\.\d{2}/.test(x)).slice(0, annualCols).map(x => ({key: x.slice(0, 7), title: x.slice(0, 7), consensus: /\(E\)/.test(x)}));
  const tbody = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(section)?.[1] ?? '';
  const rows = {};
  for (const tr of tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const name = strip(/<th[^>]*>([\s\S]*?)<\/th>/i.exec(tr[1])?.[1]); if (!name) continue;
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => num(strip(m[1])));
    rows[rowKey(name)] = Object.fromEntries(periods.map((p, i) => [p.key, tds[i] ?? null]));
  }
  if (!periods.length || !Object.keys(rows).length) throw Error('COP_ANALYSIS_SHAPE');
  return {periods, rows, source: 'cop_analysis_html'};
}
/** 결산 숫자 고르기: 확정(추정 아님) 연간 칸의 마지막 둘 */
export function financeMetrics(fin) {
  if (!fin) return null;
  const actual = fin.periods.filter(p => !p.consensus), last = actual.at(-1), prev = actual.at(-2);
  const row = names => { for (const n of names) { const k = Object.keys(fin.rows).find(x => x === rowKey(n)) ?? Object.keys(fin.rows).find(x => x.startsWith(rowKey(n))); if (k) return fin.rows[k]; } return null; };
  const at = (names, p) => { const r = row(names); return r && p ? r[p.key] ?? null : null; };
  const OP = ['영업이익'], NET = ['당기순이익', '지배주주순이익', '순이익'];
  return {source: fin.source, fiscalYear: last?.title ?? null, prevYear: prev?.title ?? null,
    revenue: at(['매출액', '영업수익'], last), op: at(OP, last), opPrev: at(OP, prev), net: at(NET, last), netPrev: at(NET, prev),
    roe: at(['ROE'], last), debt: at(['부채비율'], last), opm: at(['영업이익률'], last)};
}

// ---------- 가격 이력 점검 ----------
/** rows: [{date, close, volume}] · sessions: 거래일 달력 · asOf: 이 날까지만 본다 */
export function historyCheck(rows, sessions, {asOf, minRows = QUALITY52.minHistoryRows, completeSessions = QUALITY52.completeSessions} = {}) {
  const usable = rows.filter(r => r.date <= asOf && r.close > 0), by = new Map(usable.map(r => [r.date, r]));
  const recent = sessions.filter(d => d <= asOf).slice(-completeSessions);
  const missing = recent.filter(d => !by.has(d)), halted = recent.filter(d => by.has(d) && !(by.get(d).volume > 0));
  return {rows: usable.length, first: usable[0]?.date ?? null, last: usable.at(-1)?.date ?? null, missing: missing.length, halted: halted.length, firstMissing: missing[0] ?? null,
    ok: usable.length >= minRows && recent.length === completeSessions && !missing.length && !halted.length};
}

// ---------- 고르기 ----------
/** 보통주만: 코드 끝자리 0(우선주는 5·7·9 …) · 스팩 · 리츠(이름 끝) · ETF/ETN 제외 — 「메리츠」처럼 이름 가운데 「리츠」는 걸리지 않게 */
export const notCommon = (code, name) => !/^\d{5}0$/.test(String(code)) || /스팩|리츠$|REIT|ETF$|ETN$/i.test(String(name ?? ''));
const isFinancial = (sector, rules) => rules.financialSectors.includes(String(sector ?? '').replace(/\s+/g, ''));
/** 후보 하나가 못 넘은 문들(빈 배열이면 통과) */
export function failsOf(c, rules = QUALITY52) {
  const f = [], fin = isFinancial(c.sector, rules), m = c.metrics;
  if (notCommon(c.code, c.name) || (c.endType && c.endType !== 'stock')) f.push('보통주 아님');
  if (!(c.capRank <= rules.poolTop)) f.push(`시가총액 ${rules.poolTop}위 밖`);
  if (!c.sector) f.push('업종 모름');
  if (!c.history?.ok) f.push(c.history ? `가격 이력 부족(${c.history.rows}일 · 빠진 날 ${c.history.missing} · 멈춘 날 ${c.history.halted})` : '가격 이력 없음');
  if (!m) { f.push('결산 자료 없음'); return f; }
  const years = [[m.op, m.net], [m.opPrev, m.netPrev]].slice(0, rules.profitYears);
  if (years.some(([op, net]) => !(net > 0) || (!fin && !(op > 0)))) f.push(`${rules.profitYears}년 연속 흑자 아님`);
  if (!(m.roe >= rules.roeMinPct)) f.push(`ROE ${rules.roeMinPct}% 미만`);
  if (!fin && !(m.debt <= rules.debtMaxPct)) f.push(m.debt == null ? '부채비율 모름' : `부채비율 ${rules.debtMaxPct}% 초과`);
  return f;
}
/** 0~1 순위(같은 값은 평균 순위) · 큰 값이 1 */
function pct(values) {
  const idx = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), out = Array(values.length);
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const r = values.length > 1 ? ((i + j) / 2) / (values.length - 1) : 1; for (let k = i; k <= j; k++) out[idx[k][1]] = r; i = j + 1; }
  return out;
}
/**
 * selectQuality52(candidates, rules) → {ok, step, rules, picked:[…52], checked:[…모든 후보와 못 넘은 문], counts}
 *   candidates: [{code, name, market, endType, sector, capRank, marketCapEok, history:{ok,…}, metrics}]
 */
export function selectQuality52(candidates, rules = QUALITY52) {
  let last = null;
  for (let step = 0; step <= rules.relax.length; step++) {
    const r = {...rules, ...Object.assign({}, ...rules.relax.slice(0, step)), step};
    const checked = candidates.map(c => ({...c, fails: failsOf(c, r)}));
    const pass = checked.filter(c => !c.fails.length);
    const roeP = pct(pass.map(c => c.metrics.roe)), sizeP = pct(pass.map(c => Math.log(c.marketCapEok || 1)));
    const nonFin = pass.map(c => !isFinancial(c.sector, r)), debtVals = pass.map((c, i) => nonFin[i] ? -c.metrics.debt : null);
    const debtP0 = pct(debtVals.filter(v => v != null)); let k = 0; const debtP = debtVals.map(v => v == null ? 0.5 : debtP0[k++]);
    const scored = pass.map((c, i) => ({...c, debtExempt: !nonFin[i], parts: {roe: roeP[i], debt: debtP[i], size: sizeP[i]}, score: r.weights.roe * roeP[i] + r.weights.debt * debtP[i] + r.weights.size * sizeP[i]}))
      .sort((a, b) => b.score - a.score || b.marketCapEok - a.marketCapEok || a.code.localeCompare(b.code));
    const perSector = new Map(), picked = [], capped = [];
    for (const c of scored) { const n = perSector.get(c.sector) ?? 0; if (n >= r.perSectorMax) { capped.push(c.code); continue; } perSector.set(c.sector, n + 1); picked.push(c); if (picked.length === r.count) break; }
    const counts = {candidates: candidates.length, passed: pass.length, picked: picked.length, cappedBySector: capped.length, failReasons: tally(checked.flatMap(c => c.fails.map(x => x.replace(/\(.*\)/, ''))))};
    last = {ok: picked.length === r.count, step, rules: r, picked: picked.map((c, i) => ({...c, rank: i + 1})), checked, counts};
    if (last.ok) return last;
  }
  return last;
}
const tally = xs => Object.fromEntries([...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]));
const fmt = (v, d = 1) => v == null ? '없음' : Number(v).toFixed(d);
/** 화면·기록용 한 줄(쉬운 말) */
export const whyLine = c => `${c.metrics.fiscalYear ?? '최근'} 결산 ROE ${fmt(c.metrics.roe)}% · ${c.debtExempt ? '금융회사(빚 기준 제외)' : `부채비율 ${fmt(c.metrics.debt, 0)}%`} · 시가총액 ${c.capRank}위`;

/** 화면에 적을 「이 52곳은 어떻게 골랐나」(실제로 쓴 규칙 단계 그대로 · 쉬운 말) */
export function howLines(r = QUALITY52) {
  return [`시가총액 ${r.poolTop}위 안(코스피·코스닥 보통주)`, `${r.profitYears === 1 ? '최근 결산' : `${r.profitYears}년 연속`} 흑자`, `부채비율 ${r.debtMaxPct}% 이하(은행·보험 같은 금융회사는 빼고 봄)`, `ROE ${r.roeMinPct}% 이상`,
    `점수 순(ROE ${Math.round(r.weights.roe * 100)}% · 빚 적음 ${Math.round(r.weights.debt * 100)}% · 회사 크기 ${Math.round(r.weights.size * 100)}%) · 한 업종 ${r.perSectorMax}곳까지`];
}

// ---------- 새 입력 만들기 ----------
/**
 * buildNextInput(base, picked, {histories, now, proposalId, rules}) → 새 input(52종목)
 *   · 지금 52종목에 이미 있는 종목은 그 가격 기록(검토된 종가 포함)을 그대로 이어 쓴다 — 옛 채점과 숫자가 어긋나지 않게
 *   · 새 종목은 받은 일봉(네이버 fchart · 수정주가)을 달력 첫날부터 넣는다
 */
export function buildNextInput(base, picked, {histories, now, proposalId, rules = QUALITY52}) {
  const sessions = base.calendar.sessions, first = sessions[0];
  const assets = picked.map((c, i) => {
    const old = base.assets.find(a => a.code === c.code);
    const prices = old ? old.prices : histories[c.code].rows.filter(r => r.date >= first).map(r => ({date: r.date, close: r.close, open: r.open, high: r.high, low: r.low, volume: r.volume}));
    return {id: i + 1, code: c.code, name: c.name, sector: c.sector, leaderStatus: `${rules.label} · ${rules.version} · ${proposalId} 선정 ${i + 1}위 · ${whyLine(c)}`,
      priceSource: old ? {...old.priceSource, carriedFrom: 'u1-sector52'} : {provider: 'NAVER', url: histories[c.code].url, retrievedAt: histories[c.code].fetchedAt, quality: 'single_source', note: '종목 고를 때 받은 일봉 이력(네이버 · 수정주가) · 이후는 매일 수집기가 15:30 종가로 이어 붙임'},
      quality: {rules: rules.version, rank: i + 1, score: Number(c.score.toFixed(4)), capRank: c.capRank, marketCapEok: c.marketCapEok, fiscalYear: c.metrics.fiscalYear, roe: c.metrics.roe, debt: c.debtExempt ? null : c.metrics.debt, debtExempt: c.debtExempt, op: c.metrics.op, net: c.metrics.net, market: c.market},
      prices};
  });
  const lastDates = assets.map(a => a.prices.filter(p => p.close > 0).at(-1)?.date).sort();
  const asOf = lastDates[0];
  return {...base, actualAsOf: asOf, retrievedAt: now.slice(0, 10), informationAsOf: now, assets,
    universe: {id: proposalId, rules: rules.version, step: rules.step ?? 0, label: rules.label, says: rules.says, how: howLines(rules), selectedAt: now, previous: base.universe?.id ?? 'u1-sector52'},
    priceRevisions: [], priceBasisReview: {asOf, note: '종목 바꾸기로 새로 시작 · 이어 쓴 종목의 옛 검토 기록은 옛 입력 보관본에 그대로 있음', carriedCodes: assets.filter(a => a.priceSource.carriedFrom).map(a => a.code)}};
}
export const inputSHA = input => sha(JSON.stringify(input));

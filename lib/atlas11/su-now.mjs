/**
 * 지금 시장(주문 1118-1239 · 사장님 2026-11-18(마카오) 12:39 「코스닥 지수 · 코스피 지수 · 외국인 수급 … 첫 화면에 보이게 … 하루에 세 번 … 아침 10시 · 오후 두시 · 장이 끝나고 6시 …
 *   그때 상황에 맞게끔 우리 손자병법이 어떤 지략으로 이 시장을 상대해야 되는 것인가 … 시장과 우리가 반응하는 반응형」 · 12:48 「응」 — docs/design/su-now-2026-11-18/order-1239.txt)
 *
 * 받은 글(네이버 증권 모바일 자료)을 읽는 법만 둔다 — 받기 · 적기는 scripts/atlas11/next/su_now.mjs
 *   지수     https://m.stock.naver.com/api/index/{KOSPI|KOSDAQ}/price?pageSize=2&page=1   (collect_context 와 같은 곳 · 첫 줄이 그날 · 장중이면 그때 값)
 *   사고판 돈 https://m.stock.naver.com/api/index/{KOSPI|KOSDAQ}/integration           (dealTrendInfos — 개인 · 외국인 · 기관 · 억 원 · 그날 값은 잠정)
 *   회사 값   https://m.stock.naver.com/api/stock/{번호}/price?pageSize=1&page=1          (첫 줄이 그날이면 그때 값)
 * 지키는 것: 결측을 0 으로 채우지 않는다 · 모양이 다르면 null 과 까닭(쓰지 않음) · 장이 열려 있을 때 값은 굳지 않은 값 · 앞날을 맞히지 않는다 · 사고팔기를 권하지 않는다
 */
export const SU_NOW_SCHEMA = 'atlas11-su-now-1';
export const NOW_IDX = Object.freeze(['KOSPI', 'KOSDAQ']);
export const NOW_URLS = Object.freeze({
  index: s => `https://m.stock.naver.com/api/index/${s}/price?pageSize=2&page=1`,
  flows: s => `https://m.stock.naver.com/api/index/${s}/integration`,
  stock: c => `https://m.stock.naver.com/api/stock/${c}/price?pageSize=1&page=1`,
});
export const OPEN_HM = Object.freeze(['09:00', '15:30']); // 정규장(한국 시각) — 이 사이면 「장이 열려 있음」

/** 쉼표 · 더하기 · 단위 글자를 빼고 숫자로 — 숫자가 아니면 null(0 으로 채우지 않음) */
export const num = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/[,\s+]/g, '').replace(/(억|원|%)$/u, '');
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};
/** UTC 때 → 한국 날 · 시각 */
export const kstOf = at => { const d = new Date(Date.parse(at) + 9 * 3600000); if (Number.isNaN(d.getTime())) return null; const iso = d.toISOString(); return {day: iso.slice(0, 10), hm: iso.slice(11, 16), wd: d.getUTCDay()}; };
const ymd = s => (typeof s === 'string' && /^\d{8}$/.test(s) ? s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8) : typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null);
const rowsOf = text => { const j = JSON.parse(text); return Array.isArray(j) ? j : Array.isArray(j?.result) ? j.result : Array.isArray(j?.priceInfos) ? j.priceInfos : null; };

/** 지수 — 첫 줄(가장 새 날) · 그날이면 today */
export function parseIndexNow(text, day) {
  const rows = rowsOf(text); if (!rows?.length) return null;
  const r = rows[0], date = ymd(r.localTradedAt), price = num(r.closePrice), change = num(r.compareToPreviousClosePrice), ratio = num(r.fluctuationsRatio);
  if (!date || price == null || price <= 0) return null;
  return {date, price, change, ratio, today: date === day};
}

/** 사고판 돈(시장 전체) — dealTrendInfos 첫 줄(가장 새 날) · 외국인 · 기관 · 개인 · 억 원 · 이름이 바뀌어도 앞글자로 찾음 */
export function parseIndexFlows(text, day) {
  const j = JSON.parse(text), rows = Array.isArray(j?.dealTrendInfos) ? j.dealTrendInfos : null;
  if (!rows?.length) return {error: 'NO_DEAL_TREND', keys: Object.keys(j ?? {}).slice(0, 20)};
  const r = rows[0], keys = Object.keys(r);
  const pick = re => { const k = keys.find(x => re.test(x) && num(r[x]) != null); return k ? {k, v: num(r[k])} : null; };
  const f = pick(/^foreign(er)?(Pure(Buy)?)?(Value|Amount)$/i) ?? pick(/^foreign/i), o = pick(/^(institution|organ)/i), p = pick(/^(personal|individual)/i), date = ymd(r.bizdate ?? r.localTradedAt ?? r.date);
  if (!f || !date) return {error: 'FLOWS_SHAPE', keys};
  const big = [f, o, p].some(x => x && Math.abs(x.v) > 200000); // 억 원이면 하루 몇만 억을 넘기 어렵다 — 넘으면 단위가 다른 것으로 보고 쓰지 않음
  if (big) return {error: 'FLOWS_UNIT', keys, raw: {foreign: r[f.k]}};
  return {date, today: date === day, foreign: f.v, inst: o?.v ?? null, indiv: p?.v ?? null, unit: '억원', keys: [f.k, o?.k ?? null, p?.k ?? null]};
}

/** 회사 값 — 첫 줄이 그날이면 그때 값(장중이면 굳지 않은 값) */
export function parseStockNow(text, day) {
  const rows = rowsOf(text); if (!rows?.length) return null;
  const date = ymd(rows[0].localTradedAt), price = num(rows[0].closePrice);
  return date === day && price != null && price > 0 ? price : null;
}

/** 그때 장이 열려 있었나(평일 · 정규장 시각 · 지수 첫 줄이 그날) */
export const openAt = (k, idxToday) => !!k && k.wd >= 1 && k.wd <= 5 && idxToday && k.hm >= OPEN_HM[0] && k.hm < OPEN_HM[1];

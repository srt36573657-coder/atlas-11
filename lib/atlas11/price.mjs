// 수르 현재가(주문 2011 · 사장님 2026-11-08 18:37 「첫패이지에 나온 종목들에 현재가와 꺽기 그래프 한달 올려」 · 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 현재가가 바뀌게)
//   GET /api/price?codes=005930,000660,… (6자리 · 60개까지) → {schema, at, day, hhmm, status, items: {코드: {p, t}}}
//   원천 = 네이버 증권 분봉(https://api.stock.naver.com/chart/domestic/item/<코드>/minute — scripts/atlas11/collect_krx_close.mjs 와 같은 길 · 받은 원문 꼴 tests/atlas11/fixtures/naver-minute)
//   서울 시각으로: 평일 9:00 ~ 15:30 = 'open'(지난 20분 분봉의 마지막 값) · 15:30 ~ 24:00 = 'close'(15:25 ~ 15:45 분봉 = 그날 마지막 값) · 그 밖(밤 · 아침 · 주말) = 'shut'(받지 않음)
//   쉬는 날(공휴일)은 분봉이 비어 값 없음 → 화면은 판 값 그대로 · 값은 받은 그대로(지어낸 숫자 0) · 못 받은 회사는 빠짐
export const PRICE_SCHEMA = 'su-price-1';
export const MAX_CODES = 60;
const ORIGIN = 'https://api.stock.naver.com';
const pad = n => String(n).padStart(2, '0');

/** 서울 시각(UTC+9) 나누기 — {day: 'YYYYMMDD', iso: 'YYYY-MM-DD', hhmm: 'HHMM', min: 하루 분, dow: 0 일 ~ 6 토} */
export function seoul(now = Date.now()) {
  const d = new Date(now + 9 * 3600e3), y = d.getUTCFullYear(), m = pad(d.getUTCMonth() + 1), dd = pad(d.getUTCDate()), H = d.getUTCHours(), M = d.getUTCMinutes();
  return {day: `${y}${m}${dd}`, iso: `${y}-${m}-${dd}`, hhmm: pad(H) + pad(M), min: H * 60 + M, dow: d.getUTCDay()};
}
/** 장 때 — 'open' · 'close' · 'shut' 과 분봉 창(시작 · 끝 HHMM) */
export function marketWindow(now = Date.now()) {
  const k = seoul(now), wk = k.dow >= 1 && k.dow <= 5, at = h => pad(Math.floor(h / 60)) + pad(h % 60);
  if (!wk || k.min < 9 * 60) return {...k, status: 'shut', from: null, to: null};
  if (k.min < 15 * 60 + 30) return {...k, status: 'open', from: at(Math.max(9 * 60, k.min - 20)), to: k.hhmm};
  return {...k, status: 'close', from: '1525', to: '1545'};
}
export const minuteUrl = (code, day, from, to) => `${ORIGIN}/chart/domestic/item/${encodeURIComponent(code)}/minute?startDateTime=${day}${from}&endDateTime=${day}${to}`;
/** 받은 코드 줄 → 6자리 코드(겹침 · 이상한 것 뺌 · 60개까지 · 차례 그대로) */
export function codesOf(q) {
  const out = [];
  for (const c of String(q ?? '').split(',')) { const x = c.trim().toUpperCase(); if (/^[0-9A-Z]{6}$/.test(x) && !out.includes(x)) out.push(x); if (out.length >= MAX_CODES) break; }
  return out;
}
/** 분봉 원문 → 그날 마지막 값 {p, t: 'YYYY-MM-DDTHH:MM'} 또는 null(비었거나 그날이 아니거나 값이 이상함) */
export function lastOf(rows, day) {
  if (!Array.isArray(rows)) return null;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i], t = String(r?.localDateTime ?? ''), p = Number(r?.currentPrice);
    if (!/^\d{14}$/.test(t) || t.slice(0, 8) !== day || !Number.isFinite(p) || p <= 0) continue;
    return {p: Math.round(p), t: `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}T${t.slice(8, 10)}:${t.slice(10, 12)}`};
  }
  return null;
}
/** 값 받기 — fetchImpl 로 회사마다 분봉(8개씩 함께 · 4초) */
export async function prices(codes, {now = Date.now(), fetchImpl = fetch, timeoutMs = 4000, conc = 8} = {}) {
  const w = marketWindow(now), items = {};
  if (w.status !== 'shut' && codes.length) {
    let i = 0;
    const one = async code => {
      const ac = new AbortController(), tm = setTimeout(() => ac.abort(), timeoutMs);
      try { const r = await fetchImpl(minuteUrl(code, w.day, w.from, w.to), {signal: ac.signal, headers: {accept: 'application/json'}}); if (!r.ok) return; const v = lastOf(await r.json(), w.day); if (v) items[code] = v; }
      catch { /* 못 받은 회사는 빠짐 */ } finally { clearTimeout(tm); }
    };
    await Promise.all(Array.from({length: Math.min(conc, codes.length)}, async () => { while (i < codes.length) await one(codes[i++]); }));
  }
  return {schema: PRICE_SCHEMA, at: new Date(now).toISOString(), day: w.iso, hhmm: w.hhmm, status: w.status, src: '네이버 증권 분봉', items};
}
/** 넷리파이 함수 몸통 — GET 만 · 장 중은 30초 · 그 밖은 5분 저장(같은 코드 줄이면 넷리파이가 함께 씀) */
export async function handlePrice(req, {fetchImpl = fetch, now = Date.now()} = {}) {
  if (req.method !== 'GET') return new Response(JSON.stringify({error: 'GET 만 돼요'}), {status: 405, headers: {'content-type': 'application/json; charset=utf-8', allow: 'GET'}});
  const codes = codesOf(new URL(req.url).searchParams.get('codes'));
  const body = await prices(codes, {now, fetchImpl});
  const live = body.status === 'open';
  return new Response(JSON.stringify(body), {status: 200, headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': live ? 'public, max-age=20' : 'public, max-age=120',
    'netlify-cdn-cache-control': live ? 'public, s-maxage=30, stale-while-revalidate=30' : 'public, s-maxage=300, stale-while-revalidate=300'}});
}

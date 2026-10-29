#!/usr/bin/env node
// 환율 · 금리 자료 길 시험(깃허브 실행기에서만 — 이 기기 셸은 네이버에 못 닿음)
//   사장님 2026-10-30(서울) 08:28 「어 그렇게 해」(물음 「남은 두 불빛도 켜 볼까요? 환율과 금리, 다른 나라예요.」의 답)
//   까닭 열한 가지 8번 「환율과 금리」 — 1달러 원 값(FX_USDKRW) · 3년 국채 금리(KR3YT=RR)를 날마다 얼마나 길게 받을 수 있는지 잼
//   씀: reports/atlas11/probe/fxrate/summary.json(길마다 상태 · 줄 수 · 처음 · 끝 날) · fx.json · kr3y.json(날짜 차례 [{d, v}])
//   쓰는 법: node scripts/atlas11/probe/fxrate.mjs   (atlas11-probe.yml which=fxrate)
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'reports/atlas11/probe/fxrate';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const STOP = '2025-06-30'; // 이 날 앞까지 닿으면 그만(한 해 + 한 달 넘게)
fs.mkdirSync(OUT, {recursive: true});

async function get(url, timeout = 20000) {
  const t = Date.now();
  try {
    const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, */*'}, signal: AbortSignal.timeout(timeout)});
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return {url, status: r.status, ms: Date.now() - t, bytes: text.length, json, head: text.slice(0, 300)};
  } catch (e) { return {url, status: 0, ms: Date.now() - t, bytes: 0, json: null, err: String(e?.message ?? e).slice(0, 200)}; }
}
/** 응답 → 줄 [{d, v}] — api.stock.naver.com 은 배열 · m.stock.naver.com front-api 는 {result: [...]} */
function rowsOf(json) {
  const arr = Array.isArray(json) ? json : Array.isArray(json?.result) ? json.result : null;
  if (!arr) return null;
  return arr.map(r => ({d: String(r?.localTradedAt ?? '').slice(0, 10), v: Number(String(r?.closePrice ?? '').replace(/,/g, ''))})).filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.d) && Number.isFinite(r.v) && r.v > 0);
}
const ROADS = {
  fxApi: (p, s) => `https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?page=${p}&pageSize=${s}`,
  fxM: (p, s) => `https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_USDKRW&page=${p}&pageSize=${s}`,
  kr3yM: (p, s) => `https://m.stock.naver.com/front-api/marketIndex/prices?category=bond&reutersCode=KR3YT%3DRR&page=${p}&pageSize=${s}`,
  kr3yApi: (p, s) => `https://api.stock.naver.com/marketindex/bond/KR3YT=RR/prices?page=${p}&pageSize=${s}`,
};
const summary = {schema: 'atlas11-probe-fxrate-1', at: new Date().toISOString(), sizes: [], charts: [], full: {}};

// 1) 한 쪽에 몇 줄까지 주는가
for (const [name, f] of Object.entries(ROADS)) for (const s of [100, 60, 50, 20, 10]) {
  const r = await get(f(1, s)), rows = rowsOf(r.json);
  summary.sizes.push({name, pageSize: s, status: r.status, ms: r.ms, rows: rows?.length ?? null, first: rows?.[rows.length - 1]?.d ?? null, last: rows?.[0]?.d ?? null, err: r.err ?? null, head: rows ? undefined : r.head});
}
// 2) 긴 그림 길(있으면 한 번에) — 추측 길이라 404 여도 됨
for (const u of [
  'https://api.stock.naver.com/chart/marketindex/exchange/FX_USDKRW/day?startDateTime=202501010000&endDateTime=202610312359',
  'https://api.stock.naver.com/chart/marketindex/FX_USDKRW/day?startDateTime=202501010000&endDateTime=202610312359',
  'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_USDKRW&category=exchange&chartInfoType=marketindex&scriptChartType=day',
  'https://api.stock.naver.com/chart/marketindex/bond/KR3YT=RR/day?startDateTime=202501010000&endDateTime=202610312359',
]) { const r = await get(u); summary.charts.push({url: u, status: r.status, ms: r.ms, bytes: r.bytes, head: r.head ?? r.err}); }

// 3) 길게 받기 — 줄을 가장 많이 준 크기로 쪽을 넘김(같은 날은 처음 것) · STOP 앞까지 닿거나 빈 쪽이면 그만 · 80쪽까지
async function full(name) {
  const best = summary.sizes.filter(x => x.name === name && x.rows).sort((a, b) => b.rows - a.rows || b.pageSize - a.pageSize)[0];
  if (!best) return {name, ok: false, why: '줄을 준 크기 없음'};
  const s = best.rows >= best.pageSize ? best.pageSize : best.rows, seen = new Map(); let pages = 0, ms = 0, lastStatus = 0;
  for (let p = 1; p <= 80; p++) {
    const r = await get(ROADS[name](p, s)); pages++; ms += r.ms; lastStatus = r.status;
    const rows = rowsOf(r.json); if (!rows || !rows.length) break;
    for (const x of rows) if (!seen.has(x.d)) seen.set(x.d, x.v);
    if (rows[rows.length - 1].d <= STOP) break;
  }
  const ser = [...seen].map(([d, v]) => ({d, v})).sort((a, b) => (a.d < b.d ? -1 : 1));
  return {name, ok: ser.length > 0, pageSize: s, pages, ms, lastStatus, rows: ser.length, first: ser[0]?.d ?? null, last: ser[ser.length - 1]?.d ?? null, ser};
}
for (const [name, file] of [['fxApi', 'fx.json'], ['fxM', 'fx-m.json'], ['kr3yM', 'kr3y.json'], ['kr3yApi', 'kr3y-api.json']]) {
  const r = await full(name);
  if (r.ser) fs.writeFileSync(path.join(OUT, file), JSON.stringify({name, url: ROADS[name](1, r.pageSize), rows: r.ser}) + '\n');
  delete r.ser; summary.full[name] = r;
}
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify(summary.full));

#!/usr/bin/env node
// 까닭 열한 가지 8번 「환율과 금리」 자료 받기 — 올릴 때 한 번(사장님 2026-10-30(서울) 08:28 「어 그렇게 해」 · 결정표 docs/design/why11-2026-10-30/decision.md 2-2)
//   받는 것: 날마다 1달러 원 값(네이버 증권 FX_USDKRW · 하나은행이 알린 값) · 3년 국채 금리 %(네이버 증권 KR3YT=RR)
//   씀: <site>/next/data/fx-rate.json = {schema, fetchedAt, src, fx: [[날짜, 값], …], rate: [[날짜, 값], …]}(날짜 차례 · 같은 날은 한 줄)
//   한 쪽에 60줄까지(그 넘으면 400) · 쪽을 넘겨 need 날짜 앞까지(보통 여섯 쪽) · 시험 reports/atlas11/probe/fxrate/(2026-10-30 깃허브 실행기 1.2초)
//   이 기기 셸은 네이버에 못 닿음 — 못 받으면 던짐(build_data.mjs 가 받아 파일을 지움 → 8 은 「?」)
//   쓰는 법: node scripts/atlas11/next/build/fx_rate.mjs --site <폴더> --need 2025-09-01   ·   import {fetchFxRate, writeFxRate} from './fx_rate.mjs'
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const FX_SCHEMA = 'dori-fx-rate-1';
export const SRC = Object.freeze({
  fx: p => `https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?page=${p}&pageSize=60`,
  rate: p => `https://m.stock.naver.com/front-api/marketIndex/prices?category=bond&reutersCode=KR3YT%3DRR&page=${p}&pageSize=60`,
});
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** 응답 → [[날짜, 값]] — api.stock.naver.com 은 배열 · m.stock.naver.com front-api 는 {result: [...]} · 값 「1,353.00」 → 1353 */
export function rowsOf(json) {
  const arr = Array.isArray(json) ? json : Array.isArray(json?.result) ? json.result : null;
  if (!arr) return null;
  const out = [];
  for (const r of arr) {
    const d = String(r?.localTradedAt ?? '').slice(0, 10), v = Number(String(r?.closePrice ?? '').replace(/,/g, ''));
    if (ISO.test(d) && Number.isFinite(v) && v > 0) out.push([d, v]);
  }
  return out;
}
/** 줄 모음 → 날짜 차례 · 같은 날은 처음 받은 값(쪽 1 이 가장 새것) */
export function seriesOf(rows) {
  const seen = new Map();
  for (const [d, v] of rows) if (!seen.has(d)) seen.set(d, v);
  return [...seen].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

async function page(url, timeout, until) {
  let last = null;
  for (let k = 0; k < 2; k++) { // 한 번 더 해 봄
    const left = until - Date.now(); if (left < 1000) { last = Error('시간 끝'); break; }
    try {
      const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json'}, signal: AbortSignal.timeout(Math.min(timeout, left))});
      if (!r.ok) throw Error(`${r.status}`);
      const rows = rowsOf(await r.json());
      if (!rows) throw Error('꼴이 다름');
      return rows;
    } catch (e) { last = e; }
  }
  throw Error(`${url.replace(/\?.*/, '')} — ${last?.message ?? last}`);
}

/** need(YYYY-MM-DD) 앞날까지 받음 · 쪽 max 까지 · 모두 budget(밀리초) 안 — 올리기가 네이버 때문에 오래 멈추지 않게 · 두 줄 모두 need 앞까지 닿지 못하면 던짐 */
export async function fetchFxRate({need, max = 9, timeout = 15000, budget = 60000} = {}) {
  if (!ISO.test(String(need ?? ''))) throw Error('fx-rate: need 날짜 없음');
  const out = {}, until = Date.now() + budget;
  for (const k of ['fx', 'rate']) {
    const all = [];
    for (let p = 1; p <= max; p++) {
      const rows = await page(SRC[k](p), timeout, until);
      if (!rows.length) break;
      all.push(...rows);
      if (rows[rows.length - 1][0] <= need) break;
    }
    const s = seriesOf(all);
    if (!s.length || s[0][0] > need) throw Error(`fx-rate: ${k} 가 ${need} 앞까지 닿지 않음(${s[0]?.[0] ?? '없음'} ~)`);
    out[k] = s;
  }
  return {schema: FX_SCHEMA, fetchedAt: new Date().toISOString(), src: {fx: SRC.fx('<쪽>'), rate: SRC.rate('<쪽>')}, fx: out.fx, rate: out.rate};
}

export async function writeFxRate(file, body) {
  const tmp = file + '.tmp' + process.pid;
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(tmp, JSON.stringify(body) + '\n');
  await fs.rename(tmp, file);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), at = k => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : null);
  const body = await fetchFxRate({need: at('--need') ?? '2025-06-30'});
  const file = path.join(at('--site') ?? 'site', 'next', 'data', 'fx-rate.json');
  await writeFxRate(file, body);
  console.log(`fx-rate: 달러 ${body.fx.length}날(${body.fx[0][0]} ~ ${body.fx.at(-1)[0]}) · 금리 ${body.rate.length}날(${body.rate[0][0]} ~ ${body.rate.at(-1)[0]}) → ${file}`);
}

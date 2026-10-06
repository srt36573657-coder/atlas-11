#!/usr/bin/env node
/**
 * 한국 판 회사들의 영어 이름 → public/data/atlas11/names-kr.json
 *   사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 — 영어판(/en) · 중국어판(/zh)에서
 *   한국 회사 이름을 영어로 보이려고(미국 판은 판 자료에 nameEn 이 이미 있음)
 *   한꺼번에 주는 목록부터 본다: ① 한국거래소 전 종목 기본 정보(영문 종목명 ISU_ENG_NM) ② 네이버 증권 시가총액 목록(코스피 · 코스닥 · 영어 칸이 있으면)
 *   (2026-10-06 21:16 · 21:30 — 종목 하나씩 묻는 네이버 기본 정보에는 맨 위 칸에 영어 이름이 없고 안쪽 칸 nameEng 은 「KOSPI」 같은 시장 이름이었음)
 *   쓰는 것: public/data/atlas11/names-kr.json 한 파일(이름 사전 · 덮어씀) · 못 받은 회사는 nameEn null → 화면은 로마자
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd(), OUT = 'public/data/atlas11/names-kr.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const MARKETS = /^(KOSPI|KOSDAQ|KONEX|KRX)$/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shape = o => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).slice(0, 40).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 50) : Array.isArray(v) ? `[${v.length}]` : v && typeof v === 'object' ? '{…}' : v])) : o);
async function req(url, opt = {}) {
  try { const r = await fetch(url, {...opt, headers: {'User-Agent': UA, Accept: 'application/json, text/plain, */*', ...(opt.headers ?? {})}, signal: AbortSignal.timeout(12000)}); const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {} return {status: r.status, json, head: text.slice(0, 300)}; }
  catch (e) { return {status: 0, json: null, head: String(e.message)}; }
}
const input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'));
const want = new Map(input.assets.map(a => [a.code, a.name])), found = new Map(), tried = [];

// ① 한국거래소 — 전 종목 기본 정보(한 번에)
{
  const body = new URLSearchParams({bld: 'dbms/MDC/STAT/standard/MDCSTAT01901', locale: 'ko_KR', mktId: 'ALL', share: '1', csvxls_isNo: 'false'});
  const r = await req('https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd', {method: 'POST', body, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Referer: 'https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020201', Origin: 'https://data.krx.co.kr', 'X-Requested-With': 'XMLHttpRequest'}});
  const rows = r.json?.OutBlock_1 ?? r.json?.output ?? [];
  for (const x of rows) { const code = x.ISU_SRT_CD, en = String(x.ISU_ENG_NM ?? '').trim(); if (want.has(code) && en && !found.has(code)) found.set(code, {nameEn: en, from: 'krx'}); }
  tried.push({source: 'KRX MDCSTAT01901', status: r.status, rows: rows.length, sample: shape(rows[0]) ?? r.head});
}
// ② 네이버 증권 — 시가총액 목록(코스피 · 코스닥) 칸 가운데 이름이 eng 인 것
for (const mkt of ['KOSPI', 'KOSDAQ']) {
  let pageSample = null;
  for (let page = 1; page <= 30; page++) {
    const r = await req(`https://m.stock.naver.com/api/stocks/marketValue/${mkt}?page=${page}&pageSize=100`, {headers: {Referer: 'https://m.stock.naver.com/'}});
    const items = r.json?.stocks ?? r.json?.items ?? (Array.isArray(r.json) ? r.json : []);
    if (!pageSample) pageSample = {status: r.status, n: items.length, sample: shape(items[0]) ?? r.head};
    if (!items.length) break;
    for (const x of items) { const code = x.itemCode ?? x.code; const k = Object.keys(x).find(k => /eng/i.test(k) && typeof x[k] === 'string' && x[k].trim() && !MARKETS.test(x[k].trim())); if (k && want.has(code) && !found.has(code)) found.set(code, {nameEn: x[k].trim(), from: 'naver ' + k}); }
    await sleep(120);
  }
  tried.push({source: 'naver marketValue ' + mkt, ...pageSample});
}
const names = Object.fromEntries([...want].map(([code, name]) => [code, {name, nameEn: found.get(code)?.nameEn ?? null, from: found.get(code)?.from ?? null}]));
const out = {schema: 'atlas11-names-kr-1', fetchedAt: new Date().toISOString(), source: '한국거래소 전 종목 기본 정보(영문 종목명) · 네이버 증권 시가총액 목록 — 못 받은 회사는 화면에서 로마자', count: want.size, withEnglish: found.size, tried, names};
await fs.writeFile(path.join(root, OUT), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({count: want.size, withEnglish: found.size, tried}));

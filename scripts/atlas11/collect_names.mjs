#!/usr/bin/env node
/**
 * 한국 판 회사들의 영어 이름 → public/data/atlas11/names-kr.json
 *   사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 — 영어판(/en) · 중국어판(/zh)에서
 *   한국 회사 이름을 영어로 보이려고(미국 판은 판 자료에 nameEn 이 이미 있음)
 *   지난 시도(2026-10-06 20:37 · 20:42 · 20:51 실행): 한국거래소 전 종목 기본 정보는 로그인 요구(400 LOGOUT) · 네이버 증권 시가총액 목록 · 종목 기본 정보에는
 *   회사 영어 이름 칸이 없음(안쪽 nameEng 은 「KOSPI」 같은 시장 이름) → 로마자로 보이던 이름이 영어 읽는 사람에게 뜻이 없었음(「Samseongbaiorojikseu」)
 *   지금 받는 곳: 야후 파이낸스 종목 정보(코드.KS 코스피 · 코드.KQ 코스닥)의 영문 정식 이름 longName — 종목마다 한 번
 *   쓰는 것: public/data/atlas11/names-kr.json 한 파일(이름 사전 · 덮어씀) · 못 받은 회사는 nameEn null → 화면은 손으로 고른 이름, 그것도 없으면 로마자
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd(), OUT = 'public/data/atlas11/names-kr.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function req(url) {
  try { const r = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json, text/plain, */*'}, signal: AbortSignal.timeout(12000)}); const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {} return {status: r.status, json, head: text.slice(0, 200)}; }
  catch (e) { return {status: 0, json: null, head: String(e.message)}; }
}
const input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'));
const want = new Map(input.assets.map(a => [a.code, a.name])), found = new Map(), log = [];
const count = {};
const note = (k) => { count[k] = (count[k] ?? 0) + 1; };

// ① 야후 파이낸스 종목 차트 정보(meta.longName) — 코스피 .KS 먼저, 없으면 코스닥 .KQ · 막히면(401 · 429) 다른 주소(query2)
async function yahooChart(code) {
  for (const sfx of ['KS', 'KQ']) {
    for (const host of ['query1', 'query2']) {
      const r = await req(`https://${host}.finance.yahoo.com/v8/finance/chart/${code}.${sfx}?range=5d&interval=1d`);
      note(`chart ${host} ${r.status}`);
      const m = r.json?.chart?.result?.[0]?.meta;
      if (m) { const en = String(m.longName ?? '').trim() || String(m.shortName ?? '').trim(); return en ? {nameEn: en, from: `yahoo chart ${code}.${sfx}`, shortName: m.shortName ?? null} : null; }
      if (r.status === 404 || r.json?.chart?.error) break; // 이 시장에는 없음 → 다음 시장
      if (log.length < 8) log.push({code, sfx, host, status: r.status, head: r.head});
      await sleep(400);
    }
  }
  return null;
}
// ② 야후 파이낸스 찾기(quotes[0].longname) — ①이 막혔을 때
async function yahooSearch(code) {
  for (const sfx of ['KS', 'KQ']) {
    const r = await req(`https://query2.finance.yahoo.com/v1/finance/search?q=${code}.${sfx}&quotesCount=1&newsCount=0&listsCount=0`);
    note(`search ${r.status}`);
    const q = (r.json?.quotes ?? []).find(x => String(x.symbol ?? '').toUpperCase() === `${code}.${sfx}`);
    const en = String(q?.longname ?? q?.shortname ?? '').trim();
    if (en) return {nameEn: en, from: `yahoo search ${code}.${sfx}`, shortName: q?.shortname ?? null};
  }
  return null;
}

let blocked = 0;
for (const [code] of want) {
  let got = blocked < 25 ? await yahooChart(code) : null;
  if (!got) { blocked++; got = await yahooSearch(code); } else blocked = 0;
  if (got) found.set(code, got);
  await sleep(150);
}
const names = Object.fromEntries([...want].map(([code, name]) => [code, {name, nameEn: found.get(code)?.nameEn ?? null, from: found.get(code)?.from ?? null}]));
const out = {schema: 'atlas11-names-kr-1', fetchedAt: new Date().toISOString(),
  source: '야후 파이낸스 종목 정보의 영문 정식 이름(코드.KS · 코드.KQ) — 못 받은 회사는 화면에서 손으로 고른 영어 이름, 그것도 없으면 로마자',
  count: want.size, withEnglish: found.size, tried: {count, firstFails: log}, names};
await fs.writeFile(path.join(root, OUT), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({count: want.size, withEnglish: found.size, tried: {count, firstFails: log}}));

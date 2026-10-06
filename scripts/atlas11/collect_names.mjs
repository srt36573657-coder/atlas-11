#!/usr/bin/env node
/**
 * 한국 판 회사들의 영어 이름(네이버 증권 종목 기본 정보) → public/data/atlas11/names-kr.json
 *   사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 — 영어판(/en) · 중국어판(/zh)에서
 *   한국 회사 이름을 영어로 보이려고(미국 판은 판 자료에 nameEn 이 이미 있음)
 *   읽는 것: public/data/input.json(회사 목록) · 쓰는 것: public/data/atlas11/names-kr.json 한 파일(덮어씀 — 이름 사전이라 기록이 아님)
 *   못 받은 회사는 nameEn null · 화면은 그 회사만 한국 이름 그대로
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const OUT = 'public/data/atlas11/names-kr.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const KEYS = ['stockNameEng', 'stockNameEn', 'engStockName', 'stockEngName', 'englishName', 'nameEng', 'itemNameEng'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
// 맨 위 칸만 본다(안쪽 칸의 nameEng 은 「KOSPI」 같은 시장 이름이었음 — 2026-10-06 21:16 첫 실행에서 365곳 모두 시장 이름이 들어옴)
const MARKETS = /^(KOSPI|KOSDAQ|KONEX|KRX)$/i;
const pick = o => { if (!o || typeof o !== 'object' || Array.isArray(o)) return null; for (const k of KEYS) if (typeof o[k] === 'string' && o[k].trim() && !MARKETS.test(o[k].trim())) return o[k].trim(); for (const [k, v] of Object.entries(o)) if (/eng/i.test(k) && typeof v === 'string' && v.trim() && !MARKETS.test(v.trim()) && /[A-Za-z]/.test(v)) return v.trim(); return null; };
const ENDPOINTS = code => [`https://m.stock.naver.com/api/stock/${code}/basic`, `https://api.stock.naver.com/stock/${code}/basic`, `https://m.stock.naver.com/api/stock/${code}/integration`, `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`];
const shape = j => j && typeof j === 'object' ? Object.fromEntries(Object.entries(Array.isArray(j?.datas) ? j.datas[0] ?? {} : j).slice(0, 40).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 40) : Array.isArray(v) ? `[${v.length}]` : v && typeof v === 'object' ? '{…}' : v])) : null;

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'}, signal: AbortSignal.timeout(15000)});
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch {}
    await sleep(800 * (i + 1));
  }
  return null;
}

const input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'));
const names = {}, samples = {}; let got = 0;
for (const a of input.assets) {
  let en = null, from = null;
  for (const u of ENDPOINTS(a.code)) {
    const j = await getJson(u), top = Array.isArray(j?.datas) ? j.datas[0] : j;
    if (Object.keys(samples).length < 8 && j) samples[u] = shape(j);
    en = pick(top); if (en) { from = new URL(u).host + new URL(u).pathname.replace(a.code, '<code>'); break; }
  }
  names[a.code] = {name: a.name, nameEn: en, from};
  if (en) got++;
  await sleep(150);
}
const out = {schema: 'atlas11-names-kr-1', fetchedAt: new Date().toISOString(), source: '네이버 증권 종목 정보(맨 위 칸의 영어 종목명 · 시장 이름은 뺌)', count: input.assets.length, withEnglish: got, samples, names};
await fs.writeFile(path.join(root, OUT), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({file: OUT, count: out.count, withEnglish: got, sample: Object.entries(names).slice(0, 5)}));
// 하나도 못 받아도 파일은 남김(samples 로 어느 칸이 있는지 보려고) — 화면은 이름이 없으면 한국 이름 그대로

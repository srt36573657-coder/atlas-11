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
const pick = o => { if (!o || typeof o !== 'object') return null; for (const k of KEYS) if (typeof o[k] === 'string' && o[k].trim()) return o[k].trim(); for (const v of Object.values(o)) if (v && typeof v === 'object' && !Array.isArray(v)) { const x = pick(v); if (x) return x; } return null; };

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
const names = {}, keysSeen = new Set(); let got = 0;
for (const a of input.assets) {
  let en = null;
  for (const u of [`https://m.stock.naver.com/api/stock/${a.code}/basic`, `https://m.stock.naver.com/api/stock/${a.code}/integration`]) {
    const j = await getJson(u);
    if (j && typeof j === 'object') for (const k of Object.keys(j)) keysSeen.add(k);
    en = pick(j); if (en) break;
  }
  names[a.code] = {name: a.name, nameEn: en};
  if (en) got++;
  await sleep(150);
}
const out = {schema: 'atlas11-names-kr-1', fetchedAt: new Date().toISOString(), source: '네이버 증권 종목 기본 정보(m.stock.naver.com/api/stock/<code>/basic · integration) — 영어 종목명', count: input.assets.length, withEnglish: got, names};
await fs.writeFile(path.join(root, OUT), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({file: OUT, count: out.count, withEnglish: got, keysSeen: [...keysSeen].slice(0, 60), sample: Object.entries(names).slice(0, 5)}));
if (!got) process.exitCode = 1;

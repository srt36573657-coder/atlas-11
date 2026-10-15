#!/usr/bin/env node
/**
 * 새 ATLAS 영어 팩 — 찾기 목록의 모든 이름(회사 주식 · 그 밖)의 영어 이름 → public/data/atlas11/names-en-all.json
 *   사장님 2026-10-15(싱가포르) 23:30 「영어 팩도 올려」 · 23:35 「예 … 언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」
 *   옛 받기(scripts/atlas11/collect_names.mjs · 2026-10-06)와 같은 곳: 야후 파이낸스 종목 정보의 영문 정식 이름(longName — 코드.KS 코스피 · 코드.KQ 코스닥)
 *   네이버 증권 · 한국거래소 목록에는 회사 영어 이름 칸이 없거나 로그인이 필요했음(옛 받기 2026-10-06 20:37 · 20:51 실행)
 *   차례: 옛 받기 결과(public/data/atlas11/names-kr.json)에 있으면 그대로 → 시장 꼬리(KOSPI = .KS · 그 밖 = .KQ)부터 → 다른 꼬리 → 찾기
 *   못 받은 이름은 nameEn null — 화면은 로마자(site/atlas/i18n.js romanize)
 *   쓰는 법: node scripts/atlas11/t365/names_en.mjs [--limit N] [--jobs 3]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const root = process.cwd(), OUT = 'public/data/atlas11/names-en-all.json';
const LIMIT = arg('--limit') ? Number(arg('--limit')) : Infinity, JOBS = Math.max(1, Math.min(6, Number(arg('--jobs', 3))));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const count = {}; const note = k => { count[k] = (count[k] ?? 0) + 1; }; const log = [];
async function req(url) {
  for (let k = 0; k < 4; k++) {
    try {
      const r = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json, text/plain, */*'}, signal: AbortSignal.timeout(12000)});
      const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
      if (r.status === 429 || r.status >= 500) { note(`wait ${r.status}`); await sleep(1500 * (k + 1)); continue; } // 막힘 · 서버 탈 — 조금 쉬고 다시
      return {status: r.status, json, head: text.slice(0, 160)};
    } catch (e) { note('net'); await sleep(800 * (k + 1)); if (k === 3) return {status: 0, json: null, head: String(e.message)}; }
  }
  return {status: 429, json: null, head: 'too many'};
}
async function chart(code, sfx) {
  for (const host of ['query1', 'query2']) {
    const r = await req(`https://${host}.finance.yahoo.com/v8/finance/chart/${code}.${sfx}?range=5d&interval=1d`);
    note(`chart ${host} ${r.status}`);
    const m = r.json?.chart?.result?.[0]?.meta;
    if (m) { const en = String(m.longName ?? '').trim() || String(m.shortName ?? '').trim(); return en ? {nameEn: en, from: `yahoo chart ${code}.${sfx}`} : null; }
    if (r.status === 404 || r.json?.chart?.error) return null;
    if (log.length < 8) log.push({code, sfx, host, status: r.status, head: r.head});
  }
  return null;
}
async function search(code, sfx) {
  const r = await req(`https://query2.finance.yahoo.com/v1/finance/search?q=${code}.${sfx}&quotesCount=1&newsCount=0&listsCount=0`);
  note(`search ${r.status}`);
  const q = (r.json?.quotes ?? []).find(x => String(x.symbol ?? '').toUpperCase() === `${code}.${sfx}`);
  const en = String(q?.longname ?? q?.shortname ?? '').trim();
  return en ? {nameEn: en, from: `yahoo search ${code}.${sfx}`} : null;
}
const list = JSON.parse(await fs.readFile(path.join(root, 'site/atlas/data/names.json'), 'utf8')).rows.slice(0, LIMIT);
let old = {}; try { old = JSON.parse(await fs.readFile(path.join(root, 'public/data/atlas11/names-kr.json'), 'utf8')).names ?? {}; } catch { /* 옛 받기 없음 */ }
let prev = {}; try { prev = JSON.parse(await fs.readFile(path.join(root, OUT), 'utf8')).names ?? {}; } catch { /* 처음 */ }
const found = new Map();
let i = 0;
async function worker() {
  while (i < list.length) {
    const row = list[i++], code = row.c;
    const keep = prev[code]?.nameEn ? prev[code] : old[code]?.nameEn ? {nameEn: old[code].nameEn, from: old[code].from} : null;
    if (keep) { found.set(code, {nameEn: keep.nameEn, from: keep.from}); note('kept'); continue; }
    const first = row.m === 'KOSPI' ? 'KS' : 'KQ', second = first === 'KS' ? 'KQ' : 'KS';
    const got = await chart(code, first) ?? await chart(code, second) ?? await search(code, first) ?? await search(code, second);
    if (got) found.set(code, got);
    await sleep(120);
  }
}
await Promise.all(Array.from({length: JOBS}, worker));
const names = Object.fromEntries(list.map(r => [r.c, {name: r.n, m: r.m ?? null, nameEn: found.get(r.c)?.nameEn ?? null, from: found.get(r.c)?.from ?? null}]));
const out = {schema: 'atlas-new-names-en-1', fetchedAt: new Date().toISOString(), listAsOf: (JSON.parse(await fs.readFile(path.join(root, 'site/atlas/data/names.json'), 'utf8'))).asOf,
  source: '야후 파이낸스 종목 정보의 영문 정식 이름(코드.KS · 코드.KQ) — 옛 받기(names-kr.json)에 있던 이름은 그대로 · 못 받은 이름은 화면에서 로마자',
  count: list.length, withEnglish: found.size, tried: {count, firstFails: log}, names};
await fs.mkdir(path.dirname(path.join(root, OUT)), {recursive: true});
await fs.writeFile(path.join(root, OUT), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({count: list.length, withEnglish: found.size, tried: count, firstFails: log.slice(0, 3)}));

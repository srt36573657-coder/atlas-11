#!/usr/bin/env node
// 새 화면(/next/) 작은 자료 만들기 — 올릴 때 한 번(사장님 2026-10-18 [9] 7 「첫 화면용 작은 요약 파일(몇 KB)을 만들고 …」 · [5] 9 한 달 뒤 가운데 값)
//   부르는 것: build/home_summary.mjs(첫 화면 요약 · 8KB 아래) · build/median20.mjs(매매일지 · 모든 회사 한 달 가운데 값)
//   읽음: <site>/atlas/data/*.json · co/*.json — 쓰는 곳: <site>/next/data/{home-summary,median20}.json(사이트 자료는 바꾸지 않음)
//   쓰는 법: node scripts/atlas11/next/build_data.mjs [--site site|dist] [--verify]
//            import {buildData} from './next/build_data.mjs'; await buildData({siteDir: dist})   ← package.mjs 가 rollAtlas 뒤에 부름(dist 의 굴린 자료로 셈)
//   하나가 못 만들면 그 파일은 그대로 두고 나머지는 만듦 · 첫 화면은 요약이 없거나 옛것(src.home ≠ home.json kst)이면 home.json 으로 그림(빈 첫 화면 없음)
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build as homeSummary} from './build/home_summary.mjs';
import {build as median20} from './build/median20.mjs';

export async function buildData({siteDir = 'site', verify = false, log = console.log} = {}) {
  const out = {};
  try {
    const r = homeSummary({siteDir, verify}); out.homeSummary = r;
    log(`첫 화면 요약 ${r.bytes}바이트 · 급등 칸 ${r.n}곳 중 반값 아래 ${r.half}곳(값 있는 ${r.known}곳)` + (verify ? ` · 따로 셈 다름 ${r.diff}` : ''));
    if (r.bytes > 8192) throw Error('첫 화면 요약이 8KB 넘음 ' + r.bytes);
    if (verify && r.diff) throw Error('반값 셈 다름 ' + r.diff);
  } catch (e) { out.homeSummaryError = e.message; log('첫 화면 요약 못 만듦 — ' + e.message); }
  try { const r = await median20({siteDir}); out.median20 = r; log('한 달 가운데 값 ' + (typeof r === 'string' ? r : JSON.stringify(r))); }
  catch (e) { out.median20Error = e.message; log('한 달 가운데 값 못 만듦 — ' + e.message); }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), si = a.indexOf('--site');
  const r = await buildData({siteDir: si >= 0 ? a[si + 1] : 'site', verify: a.includes('--verify')});
  if (r.homeSummaryError || r.median20Error) process.exit(1);
}

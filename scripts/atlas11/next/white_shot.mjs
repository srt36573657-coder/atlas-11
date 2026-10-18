#!/usr/bin/env node
// 시안 찍기 — node scripts/atlas11/next/white_shot.mjs <시안.html> [<시안.html> …] → 같은 이름 .png (390 × 844 · 첫 화면 그대로 · 사장님 2026-10-19 02:03 「열 장」)
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium} = createRequire('/opt/node-tools/')('playwright');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
for (const f of process.argv.slice(2)) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, locale: 'ko-KR'});
  const p = await ctx.newPage(); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(500);
  await p.screenshot({path: f.replace(/\.html$/, '.png')}); await ctx.close(); console.log('찍음', f.replace(/\.html$/, '.png'));
}
await b.close();

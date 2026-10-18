#!/usr/bin/env node
// 진짜 사이트 흰 첫 화면 사진 · 검사(사장님 2026-10-19 02:03 「구글과 잡스 판」 [하는 법 ②] 5 「올린 뒤 진짜 사이트를 찍어라」)
//   https://aaa7377.com/ 를 390 × 844 처음 온 기기 · 다시 온 기기로 찍고(reports/atlas11/probe/live-white/*.png) check_white 를 진짜 사이트에 돌림(check.json)
//   깃허브 실행기(probe which=livewhite)에서 돎 — 이 방은 사이트에 못 닿음
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = process.env.LIVE_BASE || 'https://aaa7377.com', dir = 'reports/atlas11/probe/live-white';
fs.mkdirSync(dir, {recursive: true});
const out = {at: new Date().toISOString(), base: B, shots: []};
const b = await chromium.launch();
for (const [tag, first, w, h] of [['first', true, 390, 844], ['back', false, 390, 844], ['back-320', false, 320, 568]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await ctx.addInitScript(f => { try { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); if (!f) localStorage.setItem('atlas:essence-seen', 'true'); } catch { /* 없음 */ } }, first);
  const p = await ctx.newPage();
  await p.goto(B + '/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await p.waitForTimeout(2000);
  const f = path.join(dir, `home-${tag}.png`); await p.screenshot({path: f}); out.shots.push(f);
  out[tag] = await p.evaluate(() => ({white: document.documentElement.classList.contains('white'), bg: getComputedStyle(document.body).backgroundColor, blocks: ['ess', 'find', 'today', 'gdr', 'all', 'news'].filter(k => document.querySelector(`[data-w="${k}"]`))}));
  await ctx.close();
}
await b.close();
try { execFileSync('node', ['scripts/atlas11/next/check_white.mjs', '--base', B, '--path', '/', '--out', path.join(dir, 'check.json'), '--enforce'], {stdio: 'inherit', env: process.env}); out.check = 'ok'; } catch { out.check = 'fail'; }
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out));

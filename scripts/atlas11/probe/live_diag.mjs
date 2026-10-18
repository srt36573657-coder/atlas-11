#!/usr/bin/env node
/**
 * 실제 사이트 걸림 까닭 찾기(2026-10-18 · 사장님 00:15 명령문 두 번 올린 뒤 실제 사이트 모든 쪽 검사에서만 걸린 셋 — next #/today 가로 넘침 · why 열기 멈춤 · share 누르기 멈춤)
 *   읽기만 — 사이트를 바꾸지 않음 · 결과 reports/atlas11/probe/live-diag/summary.json(깃허브 atlas11-probe.yml which=livediag 가 넣음)
 *   ① #/today 를 320 · 360 에서 처음 열기 · 앱 안에서 # 바꿔 열기 둘로 — 0 · 80 · 300 · 1000 · 3000ms 마다 문서 넓이 · 넘친 칸(이름 · 오른쪽 끝) · 모양 파일 · 글꼴 상태
 *   ② #/why · #/ · 친구 주소 · 소개 쪽(영어)을 page.goto(load) 로 열어 걸린 ms · 30초 안에 안 끝난 요청 · 콘솔 오류 · 실패한 요청
 *   시험: LIVE_BASE=http://127.0.0.1:<포트> LIVE_OUT=<폴더> PW_DIR=<playwright 폴더> PW_EXE=<브라우저>
 */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';

const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const BASE = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/$/, '');
const DIR = process.env.LIVE_OUT || 'reports/atlas11/probe/live-diag';
await fs.mkdir(DIR, {recursive: true});
const out = {made: new Date().toISOString(), base: BASE, today: [], open: [], errors: []};
const b = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});

const snap = p => p.evaluate(() => {
  const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
  const wide = [];
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect(); if (r.right <= vw + 0.5 || r.width === 0) continue;
    if (e.closest('[data-wide-ok]')) continue;
    let par = e.parentElement, clip = false; for (; par && par !== document.body; par = par.parentElement) { const s = getComputedStyle(par); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) { clip = true; break; } }
    if (clip) continue;
    const cls = typeof e.className === 'string' ? e.className : (e.className?.baseVal ?? '');
    wide.push({tag: e.tagName.toLowerCase(), cls: cls.slice(0, 60), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), txt: (e.textContent || '').trim().slice(0, 40)});
    if (wide.length >= 8) break;
  }
  const css = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => [l.getAttribute('href'), !!l.sheet]);
  return {vw, sw, wide, css, fonts: document.fonts ? document.fonts.status : '?', boot: !!document.querySelector('#view .boot'), hash: location.hash};
});

// ① #/today 넓이
for (const w of [320, 360]) {
  for (const how of ['direct', 'hash']) {
    const ctx = await b.newContext({viewport: {width: w, height: 640}, locale: 'ko-KR', timezoneId: 'Asia/Seoul', hasTouch: true});
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    const row = {w, how, at: []};
    try {
      if (how === 'direct') await p.goto(BASE + '/next/#/today', {waitUntil: 'commit', timeout: 30000});
      else { await p.goto(BASE + '/next/#/', {waitUntil: 'domcontentloaded', timeout: 30000}); await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => {}); await p.evaluate(() => { location.hash = '#/today'; }); }
      let t0 = Date.now();
      for (const ms of [0, 80, 300, 1000, 3000, 6000]) { const wait = ms - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait); row.at.push({ms, ...(await snap(p))}); }
    } catch (e) { row.error = String(e.message || e).slice(0, 200); }
    row.errs = errs.slice(0, 6); out.today.push(row); await ctx.close();
  }
}

// ② 여는 데 걸린 때 · 안 끝난 요청
const OPEN = [['why', '/next/?dev=1#/why'], ['why-plain', '/next/#/why'], ['home', '/next/#/'], ['friend', '/next/#/s/005930/2026-10-16/70000/s'], ['hello-en', '/hello.html?lang=en'], ['me', '/next/#/me']];
for (const [k, path] of OPEN) {
  const ctx = await b.newContext({viewport: {width: 360, height: 640}, locale: 'ko-KR', timezoneId: 'Asia/Seoul', hasTouch: true});
  const p = await ctx.newPage(); const pending = new Map(), failed = [], errs = [];
  p.on('request', r => pending.set(r, Date.now()));
  p.on('requestfinished', r => pending.delete(r));
  p.on('requestfailed', r => { pending.delete(r); failed.push((r.failure()?.errorText || '?') + ' ' + r.url().replace(BASE, '')); });
  p.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().replace(BASE, '')); });
  p.on('pageerror', e => errs.push('pageerror ' + e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  const t0 = Date.now(); let loadMs = null, err = null;
  try { await p.goto(BASE + path, {waitUntil: 'load', timeout: 30000}); loadMs = Date.now() - t0; } catch (e) { err = String(e.message || e).slice(0, 160); }
  const dcl = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)} : null; }).catch(() => null);
  const stuck = [...pending.entries()].map(([r, t]) => ({url: r.url().replace(BASE, '').slice(0, 120), type: r.resourceType(), ms: Date.now() - t}));
  const res = await p.evaluate(() => performance.getEntriesByType('resource').map(e => ({u: e.name.replace(location.origin, '').slice(0, 100), d: Math.round(e.duration), t: e.initiatorType})).sort((a, c) => c.d - a.d).slice(0, 6)).catch(() => []);
  out.open.push({k, path, loadMs, err, dcl, stuck: stuck.slice(0, 10), failed: failed.slice(0, 10), errs: errs.slice(0, 6), slowest: res});
  await ctx.close();
}
await b.close();
await fs.writeFile(DIR + '/summary.json', JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({today: out.today.map(r => [r.w, r.how, r.at.map(a => a.sw).join('/'), r.error || '']), open: out.open.map(o => [o.k, o.loadMs, o.err, o.stuck.length, o.failed.length])}));

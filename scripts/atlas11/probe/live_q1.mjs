// 탐침 — 진짜 사이트 흰 판 검사 「③ 첫 질문까지 누름 2번 안」이 엄지 칸 한 줄을 올린 뒤(2026-10-21 04:31) 두 번 「1번 눌러도 1 / 11 이 안 보임」
//   check_white 의 그 길(처음 온 기기 · 찾기 칸에 삼성전자 · 1.5초 · 보이는 첫 [data-path~="q1"] 누름 · settle)을 그대로 따라 하며
//   누른 자리 · 눌린 것 · 찾은 줄이 다시 그려진 때 · 글꼴 · 밀림 · 누른 뒤 주소와 #view 글을 적고 앞뒤를 찍음(세 번)
//   씀: <OUT>/q1.json · q1-<n>-before.png · q1-<n>-after.png
//   쓰는 법: 실행기 PW_DIR=/tmp/pw/node_modules node scripts/atlas11/probe/live_q1.mjs
//            로컬 LIVE_BASE=http://127.0.0.1:8826 LIVE_APP=/next/ PW_DIR=<node_modules> PW_EXE=/opt/pw-browsers/chromium LIVE_OUT=<폴더> node …
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, ''), APP = process.env.LIVE_APP || '/';
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-q1'; await fs.mkdir(dir, {recursive: true});
const out = {made: new Date().toISOString(), base: B, app: APP, runs: []};
const b = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
for (let k = 1; k <= 3; k++) {
  const R = {k, steps: []}; out.runs.push(R);
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(() => { try { if (sessionStorage.getItem('cw-seed')) return; sessionStorage.setItem('cw-seed', '1'); localStorage.clear(); } catch { /* 없음 */ } });
  await ctx.addInitScript(() => {
    window.__q = [];
    const nm = e => e ? (e.tagName || '') + '.' + String(e.className || '').split(' ')[0] + (e.getAttribute?.('href') ? '[' + e.getAttribute('href') + ']' : '') : '-';
    const t = () => Math.round(performance.now());
    for (const ev of ['pointerdown', 'mousedown', 'mouseup', 'click', 'focusout', 'hashchange']) addEventListener(ev, e => window.__q.push(t() + ' ' + ev + ' ' + nm(e.target) + (e.clientY != null ? ' y' + Math.round(e.clientY) : '') + ' at ' + nm(document.elementFromPoint?.(e.clientX ?? -1, e.clientY ?? -1)) + ' sy' + Math.round(scrollY) + ' ' + location.hash), true);
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__q.push(t() + ' shift ' + e.value.toFixed(4) + (e.hadRecentInput ? ' input' : '') + ' ' + (e.sources || []).slice(0, 3).map(s => nm(s.node?.nodeType === 3 ? s.node.parentElement : s.node) + ' ' + Math.round(s.previousRect.y) + '>' + Math.round(s.currentRect.y)).join(' | ')); }).observe({type: 'layout-shift', buffered: true}); } catch { /* 없음 */ }
    document.fonts?.addEventListener?.('loadingdone', () => window.__q.push(t() + ' fonts done'));
    document.addEventListener('DOMContentLoaded', () => { const mo = new MutationObserver(() => { const hs = document.querySelector('.w-hits'); if (hs && !hs.__w) { hs.__w = 1; new MutationObserver(() => window.__q.push(t() + ' hits n' + hs.children.length + (hs.hidden ? ' hidden' : ''))).observe(hs, {childList: true, attributes: true}); } }); mo.observe(document.body, {childList: true, subtree: true}); });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  const settle = async () => { await p.waitForFunction(() => !document.querySelector('#view .boot') && document.fonts?.status === 'loaded', null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(400); };
  const seen = () => p.evaluate(() => /(^|\s)1\s*\/\s*11(\s|$)/.test(document.querySelector('#view')?.innerText || ''));
  const snap = tag => p.evaluate(tag => { const th = document.querySelector('.s-thumb'), hs = document.querySelector('.w-hits'); const q1 = [...document.querySelectorAll('#view [data-path~="q1"]')].map(e => { const r = e.getBoundingClientRect(); return [e.getAttribute('href'), Math.round(r.top), Math.round(r.height), r.width > 0 && r.height > 0]; }); return {tag, sy: Math.round(scrollY), H: document.documentElement.scrollHeight, hash: location.hash, fonts: document.fonts?.status, sheet: !!document.querySelector('link[href="/atlas/fonts.css"]')?.sheet, thumb: th ? th.className + ' ' + getComputedStyle(th).position + ' top' + Math.round(th.getBoundingClientRect().top) : '-', hits: hs ? (hs.hidden ? 'hidden' : 'n' + hs.children.length + ' top' + Math.round(hs.getBoundingClientRect().top)) : '-', q1, view: (document.querySelector('#view')?.innerText || '').replace(/\s+/g, ' ').slice(0, 160)}; }, tag);
  try {
    await p.goto(B + APP + '?v=' + Date.now() + '#/', {waitUntil: 'load', timeout: 60000}); await settle();
    R.steps.push(await snap('열림'));
    const fi = p.locator('#view [data-w="find"] input').first();
    if (await fi.count()) { await fi.fill('삼성전자'); await p.waitForTimeout(1500); }
    R.steps.push(await snap('찾기 뒤 1.5초'));
    await p.screenshot({path: `${dir}/q1-${k}-before.png`});
    let n = 0;
    while (n < 2 && !(await seen())) {
      const t = p.locator('#view [data-path~="q1"]:visible').first(); if (!(await t.count())) { R.steps.push({tag: '보이는 q1 없음'}); break; }
      await p.evaluate(() => window.__q.push(Math.round(performance.now()) + ' click-start'));
      try { await t.click({timeout: 5000}); } catch (e) { R.steps.push({tag: '누름 오류', e: String(e.message).split('\n').slice(0, 3).join(' | ').slice(0, 300)}); }
      n++; await settle(); R.steps.push(await snap('누름 ' + n + ' 뒤'));
    }
    R.n = n; R.seen = await seen();
    await p.screenshot({path: `${dir}/q1-${k}-after.png`});
  } catch (e) { R.err = String(e.message).slice(0, 300); }
  R.log = await p.evaluate(() => window.__q || []).catch(() => []); R.errs = errs;
  await ctx.close();
}
await b.close();
await fs.writeFile(`${dir}/q1.json`, JSON.stringify(out, null, 1) + '\n');
console.log(out.runs.map(r => `run ${r.k}: n ${r.n} seen ${r.seen} ${r.err || ''}`).join('\n'));

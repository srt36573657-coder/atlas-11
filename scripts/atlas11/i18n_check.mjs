#!/usr/bin/env node
/**
 * 언어판 검사 · 사전 거두기 — 영어판(/en/) · 중국어판(/zh/) (사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」)
 *   node scripts/atlas11/i18n_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--lang en,zh] [--out file.json]
 *   화면을 두루 돌며(불장 · 예비 · 오름 상위 · 지도 · 갈래 · 업종 · 출목표 모든 탭 · 일정 · 찾기 · 기록 · 회사) 한국 판 · 미국 판 모두
 *   ① 사전에 없는 틀(i18n.js missing) ② 바뀌지 않고 남은 한국어 글(원문 lang="ko" 은 뺌) ③ 옆으로 넘침(390px · 360px 글씨 2배)을 센다
 *   남은 한국어 0 · 넘침 0 이면 통과(나가는 값 0) — 사전을 채울 때는 --out 으로 빠진 틀을 받아 번역한다
 */
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const base = arg('--base', 'http://127.0.0.1:8823'), pw = arg('--pw', '/opt/node-tools'), langs = arg('--lang', 'en,zh').split(','), outFile = arg('--out');
const require = createRequire(pw.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
const report = {base, at: new Date().toISOString(), langs: {}};

async function crawl(page, lg, at) {
  const left = new Map(), over = [];
  const settle = async (ms = 260) => { await page.waitForTimeout(ms); };
  const collect = async step => {
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
    await settle(120);
    const r = await page.evaluate(() => {
      const out = [], HAN = /[가-힣]/;
      const skip = el => !el || el.closest('[lang="ko"], script, style, noscript');
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (n.nodeType === 3) { if (HAN.test(n.nodeValue) && !skip(n.parentElement)) out.push(n.nodeValue.replace(/\s+/g, ' ').trim()); }
        else if (!skip(n)) { const keep = (n.getAttribute('data-orig-attr') ?? '').split(' '); for (const a of ['aria-label', 'title', 'placeholder', 'alt', 'data-speak']) { if (keep.includes(a)) continue; const v = n.getAttribute(a); if (v && HAN.test(v)) out.push(`@${a}: ${v}`); } }
      }
      if (HAN.test(document.title)) out.push('@title: ' + document.title);
      return {out, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth};
    });
    for (const s of r.out) left.set(s, (left.get(s) ?? 0) + 1);
    if (r.sw > r.cw + 1) over.push({step, sw: r.sw, cw: r.cw});
  };
  const go = async (hash, step = hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(450); await collect(step); };
  await page.goto(`${base}/${lg}/${at === '/us/' ? 'us/' : ''}#/`, {waitUntil: 'networkidle'}); await page.waitForTimeout(900); await collect('#/');
  for (const hsh of ['#/similar', '#/rise', '#/map']) await go(hsh);
  const fams = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/map/f/"]')].map(a => a.getAttribute('href')))]);
  for (const f of fams) await go(f);
  const inds = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/i/"]')].map(a => a.getAttribute('href')))]);
  for (const i of inds.slice(0, 8)) await go(i);
  await go('#/road');
  const modes = await page.evaluate(() => [...document.querySelectorAll('.f-seg button, .f-seg a')].map((b, i) => i));
  for (const mi of modes) {
    await page.evaluate(i => [...document.querySelectorAll('.f-seg button, .f-seg a')][i]?.click(), mi); await settle(400); await collect('#/road mode ' + mi);
    const tabs = await page.evaluate(() => document.querySelectorAll('.f-tabs .f-tab').length);
    for (let t = 0; t < tabs; t++) { await page.evaluate(i => document.querySelectorAll('.f-tabs .f-tab')[i]?.click(), t); await settle(300); await collect(`#/road mode ${mi} tab ${t}`); }
    await page.evaluate(() => document.querySelector('.f-body > .f-more button, .f-more')?.click()); await settle(300); await collect('#/road more');
  }
  await go('#/agenda');
  await go('#/find');
  for (const q of ['전자', 'a', '반도체']) { await page.fill('input[type="search"], .fd-form input', q).catch(() => {}); await settle(500); await collect('#/find ' + q); }
  await go('#/log');
  for (const k of ['issue', 'update', 'data', 'all']) { await page.evaluate(k => document.querySelector(`.lg-seg [data-show="${k}"]`)?.click(), k); await settle(250); await collect('#/log ' + k); }
  const codes = await page.evaluate(async at => { const r = await fetch(at + 'data/atlas11/view/board.json'); const b = await r.json(); const late = new Set((b.late ?? []).map(x => x.code)); const cs = b.companies; return [...cs.slice(0, 3), ...cs.filter(c => late.has(c.code)).slice(0, 1), ...cs.slice(-2)].map(c => c.code); }, at);
  for (const c of codes) await go('#/stock/' + c);
  const missing = await page.evaluate(async at => (await import(at + 'app/i18n.js')).missing(), at);
  return {left, over, missing};
}

for (const lg of langs) {
  const R = report.langs[lg] = {places: {}};
  for (const at of ['/', '/us/']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, colorScheme: 'dark'});
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    const r = await crawl(page, lg, at);
    // 360px · 글씨 2배(휴대폰 큰 글씨)에서 넘침 — 첫 화면 · 출목표 · 기록
    await page.setViewportSize({width: 360, height: 780}); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    for (const h of ['#/', '#/road', '#/log', '#/map']) { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(500); const m = await page.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})); if (m.sw > m.cw + 1) r.over.push({step: '360px 200% ' + h, ...m}); }
    R.places[at] = {leftCount: r.left.size, left: [...r.left.entries()].sort((a, b) => b[1] - a[1]).slice(0, 400).map(([s, n]) => `${n}× ${s}`), over: r.over, missing: r.missing, errors: errs.slice(0, 5)};
    await ctx.close();
  }
  R.missing = [...new Set(Object.values(R.places).flatMap(p => p.missing))].sort();
  R.leftTotal = Object.values(R.places).reduce((t, p) => t + p.leftCount, 0); R.overTotal = Object.values(R.places).reduce((t, p) => t + p.over.length, 0);
}
await browser.close();
if (outFile) await fs.writeFile(outFile, JSON.stringify(report, null, 1));
const sum = Object.fromEntries(Object.entries(report.langs).map(([k, v]) => [k, {missing: v.missing.length, left: v.leftTotal, over: v.overTotal, errors: Object.values(v.places).flatMap(p => p.errors).length}]));
console.log(JSON.stringify(sum));
process.exitCode = Object.values(sum).every(s => !s.left && !s.over && !s.errors) ? 0 : 1;

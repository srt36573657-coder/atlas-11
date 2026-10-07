#!/usr/bin/env node
/**
 * 말 검사 · 사전 거두기 — 영어 · 중국어(간체)로 본 화면(같은 주소 ?lang=en · ?lang=zh — 위 막대 말 단추) (사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 · 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게」)
 *   node scripts/atlas11/i18n_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--lang en,zh] [--out file.json]
 *   화면을 두루 돌며(불장 · 예비 · 오름 상위 · 지도 · 갈래 · 업종 · 출목표 모든 탭 · 일정 · 찾기 · 기록 · 회사) 한국 판 · 미국 판 모두
 *   ① 사전에 없는 틀(i18n.js missing) ② 바뀌지 않고 남은 한국어 글(원문 lang="ko" 은 뺌) ③ 옆으로 넘침(390px · 360px 글씨 2배)을 센다
 *   ④ 위 막대 말 단추: 한국어로 열어 영어 → 미국 판 → 다시 열어도 기억 → 중국어 → 한국어(말 · 아래 탭 이름 · 눌린 말 · 넘침)
 *   남은 한국어 0 · 넘침 0 이면 통과(나가는 값 0) — 사전을 채울 때는 --out 으로 빠진 틀을 받아 번역한다
 */
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const base = arg('--base', 'http://127.0.0.1:8823'), pw = arg('--pw', '/opt/node-tools'), langs = arg('--lang', 'en,zh').split(','), outFile = arg('--out');
const QUICK = process.argv.includes('--quick'), NOPICK = process.argv.includes('--no-picker'); // --quick: 새 말(2026-10-07 말 73개) — 틀은 영어 · 중국어와 같은 열쇠라 화면 수를 줄여 넘침 · 남은 한국어 · 탭 이름 칸만 잼
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
  await page.goto(`${base}${at}?lang=${lg}#/`, {waitUntil: 'networkidle'}); await page.waitForTimeout(900); await collect('#/'); // 한 주소에서 말 단추로 고른 것과 같음(2026-10-06 22:00 「한도메인에서 탭을 누르면」) · 2026-10-07: 이 줄 끝 설명 글이 앞 두 걸음을 덮어 첫 화면을 세지 않던 것을 고침
  for (const hsh of ['#/similar', '#/rise', '#/map']) await go(hsh);
  const fams = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/map/f/"]')].map(a => a.getAttribute('href')))]);
  for (const f of QUICK ? fams.slice(0, 2) : fams) await go(f);
  const inds = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#/i/"]')].map(a => a.getAttribute('href')))]);
  for (const i of inds.slice(0, QUICK ? 2 : 8)) await go(i);
  await go('#/road');
  const modes = await page.evaluate(() => [...document.querySelectorAll('.f-seg button, .f-seg a')].map((b, i) => i));
  for (const mi of QUICK ? modes.slice(0, 1) : modes) {
    await page.evaluate(i => [...document.querySelectorAll('.f-seg button, .f-seg a')][i]?.click(), mi); await settle(400); await collect('#/road mode ' + mi);
    const tabs = await page.evaluate(() => document.querySelectorAll('.f-tabs .f-tab').length);
    for (let t = 0; t < (QUICK ? Math.min(tabs, 2) : tabs); t++) { await page.evaluate(i => document.querySelectorAll('.f-tabs .f-tab')[i]?.click(), t); await settle(300); await collect(`#/road mode ${mi} tab ${t}`); }
    await page.evaluate(() => document.querySelector('.f-body > .f-more button, .f-more')?.click()); await settle(300); await collect('#/road more');
  }
  await go('#/agenda');
  await go('#/start'); // 아래 탭 「처음」(2026-10-07 00:49)
  await go('#/guide'); // 한국 주식시장 안내(2026-10-07 05:31 「외국인들 … 한국 주식시장을 제대로 알수 있게」)
  await go('#/find');
  for (const q of ['전자', 'a', '반도체']) { await page.fill('input[type="search"], .fd-form input', q).catch(() => {}); await settle(500); await collect('#/find ' + q); }
  await go('#/log');
  for (const k of ['issue', 'update', 'data', 'all']) { await page.evaluate(k => document.querySelector(`.lg-seg [data-show="${k}"]`)?.click(), k); await settle(250); await collect('#/log ' + k); }
  const codes = await page.evaluate(async at => { const r = await fetch(at + 'data/atlas11/view/board.json'); const b = await r.json(); const late = new Set((b.late ?? []).map(x => x.code)); const cs = b.companies; return [...cs.slice(0, 3), ...cs.filter(c => late.has(c.code)).slice(0, 1), ...cs.slice(-2)].map(c => c.code); }, at);
  for (const c of QUICK ? codes.slice(0, 2) : codes) await go('#/stock/' + c);
  const missing = await page.evaluate(async at => (await import(at + 'app/i18n.js')).missing(), at);
  return {left, over, missing};
}

// 말 단추(위 막대 · 2026-10-06 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」) — 한국어로 열어 단추로 고르고 · 기억하고 · 시장을 바꿔도 그 말 · 되돌림
if (NOPICK) report.picker = {steps: [], bad: 0, skipped: true}; else {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, colorScheme: 'dark'}); const page = await ctx.newPage();
  const st = async () => page.evaluate(() => ({lang: document.documentElement.lang, tab: document.querySelector('.bottom-link.active .label')?.textContent ?? '', items: [...document.querySelectorAll('.lang-i')].map(a => a.getAttribute('hreflang') + (a.getAttribute('aria-current') ? '*' : '')).join(','), sw: document.documentElement.scrollWidth}));
  const steps = [];
  await page.goto(`${base}/#/road`, {waitUntil: 'networkidle'}); await page.waitForTimeout(700); steps.push(['open', await st()]);
  for (const [tag, hl] of [['en', 'en'], ['zh', 'zh-CN'], ['ko', 'ko']]) {
    await page.click('.lang-b'); await page.waitForTimeout(200);
    await Promise.all([page.waitForNavigation({waitUntil: 'networkidle'}), page.click(`.lang-i[hreflang="${hl}"]`)]); await page.waitForTimeout(700); steps.push([tag, await st()]);
    if (tag === 'en') { await Promise.all([page.waitForNavigation({waitUntil: 'networkidle'}), page.click('.mkt-b[data-place="us"]')]).catch(() => {}); await page.waitForTimeout(700); steps.push(['en us', await st()]); await page.goto(`${base}/#/`, {waitUntil: 'networkidle'}); await page.waitForTimeout(700); steps.push(['en remembered', await st()]); }
  }
  const want = {open: ['ko', '출목표'], en: ['en', 'Dots'], 'en us': ['en', 'Dots'], 'en remembered': ['en', 'Hot'], zh: ['zh-CN', '火热'], ko: ['ko', '불장']};
  // 2026-10-07 말 74개 — 맨 위 세 말(한국어 · English · 简体中文)은 그대로 · 모두 74개 · 지금 말 하나만 눌림(✓)
  const itemsOk = v => { const xs = v.items.split(','); return xs.length === 74 && xs.slice(0, 3).map(x => x.replace('*', '')).join() === 'ko,en,zh-CN' && xs.filter(x => x.endsWith('*')).length === 1 && xs.find(x => x.endsWith('*')) === v.lang + '*'; };
  const bad = steps.filter(([k, v]) => want[k] && (v.lang !== want[k][0] || v.tab !== want[k][1] || v.sw > 390 || !itemsOk(v)));
  report.picker = {steps, bad: bad.length};
  await ctx.close();
}
for (const lg of langs) {
  const R = report.langs[lg] = {places: {}};
  for (const at of ['/', '/us/']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, colorScheme: 'dark'});
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
    const r = await crawl(page, lg, at);
    // 360px · 글씨 2배(휴대폰 큰 글씨 · 위 막대 말 단추까지)에서 넘침 — 첫 화면 · 출목표 · 기록 · 지도
    await page.setViewportSize({width: 360, height: 780}); await page.evaluate(() => localStorage.setItem('atlas11:font', '4')); await page.reload({waitUntil: 'networkidle'}); await page.waitForTimeout(700); // 글씨 단추 가장 큰 글씨(200%) — 화면이 쓰는 그대로
    for (const h of ['#/', '#/road', '#/log', '#/map']) { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(500); const m = await page.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})); if (m.sw > m.cw + 1) r.over.push({step: '360px 200% ' + h, ...m}); }
    // 아래 탭 이름이 제 칸 안에 드는가(탭 일곱 · 2026-10-07 「처음」 — 영어 「Calendar」가 칸을 넘던 것) — 아래 막대는 화면에 붙어 있어 화면 폭 넘침으로는 잡히지 않는다
    if (at === '/') for (const wd of [320, 360, 390]) for (const fs of ['0', '4']) {
      await page.setViewportSize({width: wd, height: 780}); await page.evaluate(s => localStorage.setItem('atlas11:font', s), fs); await page.reload({waitUntil: 'networkidle'}); await page.waitForTimeout(450);
      const bad = await page.evaluate(() => [...document.querySelectorAll('.bottom-link')].filter(a => { const l = a.querySelector('.label').getBoundingClientRect(), b = a.getBoundingClientRect(); return l.left < b.left - 0.5 || l.right > b.right + 0.5; }).map(a => a.querySelector('.label').textContent));
      if (bad.length) r.over.push({step: `아래 탭 이름 ${wd}px 글씨 단계 ${fs}`, bad});
    }
    R.places[at] = {leftCount: r.left.size, left: [...r.left.entries()].sort((a, b) => b[1] - a[1]).slice(0, 400).map(([s, n]) => `${n}× ${s}`), over: r.over, missing: r.missing, errors: errs.slice(0, 5)};
    await ctx.close();
  }
  R.missing = [...new Set(Object.values(R.places).flatMap(p => p.missing))].sort();
  R.leftTotal = Object.values(R.places).reduce((t, p) => t + p.leftCount, 0); R.overTotal = Object.values(R.places).reduce((t, p) => t + p.over.length, 0);
  // 말마다 바로 적어 둠(2026-10-07 09:27 — 검사 도중 작업 컴퓨터가 다시 켜져 36개 말 결과가 통째로 사라진 일)
  if (outFile) await fs.writeFile(outFile, JSON.stringify(report, null, 1));
  console.log(`${lg} missing ${R.missing.length} left ${R.leftTotal} over ${R.overTotal} errors ${Object.values(R.places).flatMap(p => p.errors).length}`);
}
await browser.close();
if (outFile) await fs.writeFile(outFile, JSON.stringify(report, null, 1));
const sum = Object.fromEntries(Object.entries(report.langs).map(([k, v]) => [k, {missing: v.missing.length, left: v.leftTotal, over: v.overTotal, errors: Object.values(v.places).flatMap(p => p.errors).length}]));
console.log(JSON.stringify({...sum, picker: report.picker.bad ? report.picker.steps : 'ok'}));
process.exitCode = Object.values(sum).every(s => !s.left && !s.over && !s.errors) && !report.picker.bad ? 0 : 1;

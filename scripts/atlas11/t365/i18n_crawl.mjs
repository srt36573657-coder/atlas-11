#!/usr/bin/env node
/**
 * 새 ATLAS 영어 팩 — 영어로 모든 길을 돌아 사전에 없는 틀(남은 한국어)을 모음 → 번역할 목록
 *   사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」
 *   엔진(site/atlas/i18n.js)이 못 바꾼 조각을 window.__atlasI18n.missing() 으로 알려 줌(틀 · 처음 본 원문)
 *   쓰는 법: node scripts/atlas11/t365/i18n_crawl.mjs --base http://127.0.0.1:8831 [--others 120] [--jobs 4] [--out 파일] [--pw /opt/node-tools/]
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const base = arg('--base', 'http://127.0.0.1:8831'), OUT = arg('--out', path.join(ROOT, 'reports/atlas11/verify/atlas-new-i18n-miss.json'));
const require = createRequire(arg('--pw', '/opt/node-tools/')); const {chromium} = require('playwright');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data', f), 'utf8'));
const core = J('core.json'), comp = J('comp.json'), names = J('names.json');
let tr = null; try { tr = J('surgetr.json'); } catch { /* 달력 없음 */ }
const picked = Object.keys(comp.companies ?? comp).filter(c => /^[0-9A-Z]{6}$/.test(c));
const mkt = Object.keys(J('mkt.json').companies);
const NOTH = Number(arg('--others', 120)), step = Math.max(1, Math.floor(mkt.length / Math.max(1, NOTH)));
const others = mkt.filter(c => !picked.includes(c)).filter((_, i) => i % step === 0).slice(0, NOTH);
const sub = c => ['#/c/' + c, `#/c/${c}/past`, `#/c/${c}/rivals`, `#/c/${c}/grow`, `#/c/${c}/range`];
const nonCo = names.rows.filter(r => r.k).slice(0, 4).map(r => '#/x/' + r.c); // 회사 주식이 아닌 것(펀드 · 우선주 …)
const routes = ['#/', '#/list', '#/up', '#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40', '#/cal', '#/time', '#/info', '#/zz', '#/c/999999', '#/g/zz', '#/i/zz',
  ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)),
  ...picked.flatMap(sub), ...others.flatMap(sub), ...nonCo, ...(tr ? tr.cases.map(r => '#/cal/' + r[0]) : [])];
const JOBS = Math.max(1, Number(arg('--jobs', 4)));
const exe = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(f => fs.existsSync(f));
const b = await chromium.launch(exe ? {executablePath: exe} : {});
const miss = new Map(), errs = []; let done = 0;
async function worker(list) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto(base + '/atlas/index.html?lang=en#/'); await p.waitForFunction(() => window.__atlasI18n && !document.querySelector('#view p.boot'), null, {timeout: 30000}).catch(() => {});
  let seen = 0;
  const take = async (r = '?') => { try { const xs = await p.evaluate(k => (window.__atlasI18n?.missing() ?? []).slice(k), seen); seen += xs.length; for (const m of xs) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, r}); } catch { seen = 0; /* 다시 엶 */ } };
  for (const r of list) {
    try {
      await p.evaluate(h => { location.hash = h; }, r);
      await p.waitForFunction(() => !document.querySelector('#view p.boot'), null, {timeout: 15000}).catch(() => {});
      await p.waitForTimeout(120);
      if (r === '#/cal') for (const f of ['1', '2', '3', '4', 'all']) await p.click(`.cal-chips button[data-f="${f}"]`).catch(() => {});
    } catch (e) { errs.push(r + ' ' + String(e).slice(0, 120)); }
    await take(r);
    if (++done % 200 === 0) console.error(`${done}/${routes.length} · 틀 ${miss.size}`);
  }
  // 찾기 · 언어 판
  try {
    await p.evaluate(() => { location.hash = '#/find'; }); await p.waitForTimeout(400);
    for (const q of ['삼성', 'ㅅㅅ', '0059', '반도체', 'samsung', 'zzzz']) { await p.fill('#q', q).catch(() => {}); await p.waitForTimeout(250); }
    await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(300); await p.click('#langBtn').catch(() => {}); await p.waitForTimeout(200);
  } catch { /* 넘어감 */ }
  await take('#/find'); await ctx.close();
}
const parts = Array.from({length: JOBS}, (_, k) => routes.filter((_, i) => i % JOBS === k));
await Promise.all(parts.map(worker));
await b.close();
const list = [...miss].map(([key, x]) => ({key, ex: x.ex, r: x.r})).sort((a, b) => a.r.localeCompare(b.r) || a.key.localeCompare(b.key, 'ko'));
fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, JSON.stringify({schema: 'atlas-new-i18n-miss-1', made: new Date().toISOString(), routes: routes.length, others: others.length, miss: list.length, errs: errs.slice(0, 30), list}, null, 1) + '\n');
console.log(JSON.stringify({routes: routes.length, miss: list.length, errs: errs.length}));

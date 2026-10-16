#!/usr/bin/env node
/**
 * 새 ATLAS 영어 팩 — 영어로 모든 화면 돌기(사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」)
 *   길: 첫 화면 · 탭 넷(업종 · 조건 찾기 · 급등 · 달력) · 급등 다섯 칸 · 봉인 · 도움말 · 업데이트 기록 · 갈래 10 · 업종 77 · 모든 회사 3 ~ 7단(--others 로 줄이면 문 못 지남) · 달력 종목 파일 모두 · 밖 칸 · 없는 주소
 *   화면마다 본다(360 × 640 · 영어): ① 보이는 한글 0(lang="ko" 원문 — 사장님 글 · 기사 제목 — 빼고) ② 옆 넘침 0 ③ 보이는 글씨 21px 이상 ④ 누르는 자리 44px 이상 ⑤ 오류 0 ⑥ 사전에 없는 틀 0(엔진이 셈)
 *   쓰는 법: node scripts/atlas11/t365/en_check.mjs --base http://127.0.0.1:8823 [--jobs 6] [--others N] [--out reports/atlas11/verify/atlas-new-en-latest.json] [--pw /opt/node-tools/]
 *   틀린 것이 하나라도 있으면 끝 코드 1
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const base = arg('--base', 'http://127.0.0.1:8823'), OUT = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/atlas-new-en-latest.json'));
const PREFIX = arg('--prefix', ''); // dist 를 띄우면 '' (첫 화면 = /atlas/index.html 이 아니라 dist/atlas/index.html — 아래 page 주소 참고)
const require = createRequire(arg('--pw', '/opt/node-tools/')); const {chromium} = require('playwright');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data', f), 'utf8'));
const tryJ = f => { try { return J(f); } catch { return null; } };
const core = J('core.json'), names = J('names.json'), mkt = J('mkt.json').companies, tr = tryJ('surgetr.json'), surge = tryJ('surge.json');
const all = Object.keys(mkt), LIM = arg('--others') != null ? Number(arg('--others')) : null;
const cos = LIM == null ? all : all.filter((_, i) => i % Math.max(1, Math.floor(all.length / Math.max(1, LIM))) === 0).slice(0, LIM);
const sub = c => ['#/c/' + c, `#/c/${c}/past`, `#/c/${c}/rivals`, `#/c/${c}/grow`, `#/c/${c}/range`];
const routes = ['#/', '#/talk', '#/list', '#/cond', '#/cond/rise-top3-spike', '#/cond/up-f3-loss', '#/cond/dn-pick-all', '#/cond/all-all-all', '#/up', // 조건 찾기 탭(2026-10-15 23:54 「가」 · 규칙 72 — 옛 이름 #/scan 은 없앰)
  '#/cal', '#/time', '#/info', '#/find', '#/zz', '#/c/999999',
  ...(surge ? ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'] : []),
  ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)),
  ...cos.flatMap(sub), ...names.rows.filter(r => r.k).slice(0, 6).map(r => '#/x/' + r.c), ...(tr ? tr.cases.map(r => '#/cal/' + r[0]) : [])];
const JOBS = Math.max(1, Number(arg('--jobs', 6)));
const exe = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(f => fs.existsSync(f));
const b = await chromium.launch(exe ? {executablePath: exe} : {});
const fails = [], miss = new Map(); let screens = 0;
const fail = (where, what) => { if (fails.length < 4000) fails.push({where, what}); };
const PAGE = base + PREFIX + '/atlas/index.html?lang=en';
async function judge(p, r) {
  return p.evaluate(() => {
    const out = {han: [], small: [], taps: [], over: document.documentElement.scrollWidth - innerWidth};
    const vis = el => { if (!el) return false; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; const rc = el.getClientRects(); if (!rc.length) return false; if (el.closest('details:not([open]) > :not(summary)')) return false; return true; };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement; if (!el || el.closest('[lang="ko"], script, style, noscript, [hidden], .sr')) continue;
      const t = n.nodeValue.trim(); if (!t) continue;
      if (/[가-힣ㄱ-ㅎ]/.test(t) && vis(el)) out.han.push(t.slice(0, 60));
      if (vis(el)) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 20.5 && !el.closest('svg')) out.small.push(el.tagName + ':' + fs + ':' + t.slice(0, 20)); }
    }
    // 스타일로 넣은 글(::before · ::after content) — 글자 마디가 아니라 사전 · 위 검사가 못 봄(2026-10-16 접는 줄의 「열기」가 영어 화면에 남던 것)
    { const sels = []; const walk = rules => { for (const ru of rules) { if (ru.cssRules) walk(ru.cssRules); if (ru.selectorText && /::?(before|after)/.test(ru.selectorText) && /[가-힣]/.test(ru.style?.content ?? '')) sels.push(ru.selectorText); } };
      for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* 다른 곳 글꼴표 */ } }
      for (const sel of sels) for (const part of sel.split(',')) { const m = /^(.*?)::?(before|after)\s*$/.exec(part.trim()); if (!m) continue; let els = []; try { els = document.querySelectorAll(m[1] || '*'); } catch { continue; }
        for (const el of els) { if (el.closest('[lang="ko"]') || !vis(el)) continue; const c = getComputedStyle(el, '::' + m[2]).content; if (c && /[가-힣]/.test(c)) out.han.push('::' + m[2] + ':' + c.slice(0, 30)); } } }
    for (const a of ['aria-label', 'title', 'placeholder', 'alt']) for (const el of document.querySelectorAll(`[${a}]`)) { if (el.closest('[lang="ko"]')) continue; const v = el.getAttribute(a); if (/[가-힣]/.test(v)) out.han.push('@' + a + ':' + v.slice(0, 50)); }
    for (const el of document.querySelectorAll('#view a, #view button, #view summary, .band a, .band button, .tabbar a')) { if (!vis(el)) continue; const rc = el.getBoundingClientRect(); if (rc.width && (rc.height < 43.5 || rc.width < 43.5) && !el.closest('p, li > span, .why, .note')) out.taps.push((el.textContent || '').trim().slice(0, 20) + ' ' + Math.round(rc.width) + 'x' + Math.round(rc.height)); }
    out.miss = (window.__atlasI18n?.missing() ?? []).length; out.title = document.title;
    return out;
  });
}
async function worker(list) {
  const ctx = await b.newContext({viewport: {width: 360, height: 640}});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 160)); }); // 없는 자료 받기(404)는 화면 돌기(site_check)와 같이 셈에서 뺌 — 「없는 회사」 길(#/c/999999)이 일부러 404 를 받음
  await p.goto(PAGE + '#/'); await p.waitForFunction(() => window.__atlasI18n && !document.querySelector('#view p.boot'), null, {timeout: 30000}).catch(() => {});
  for (const r of list) {
    errs.length = 0;
    try {
      await p.evaluate(h => { location.hash = h; }, r);
      await p.waitForFunction(() => !document.querySelector('#view p.boot'), null, {timeout: 15000}).catch(() => {});
      await p.waitForTimeout(r === '#/' ? 900 : 150);
      const m = await judge(p, r); screens++;
      if (m.han.length) fail(r, '한글 남음 ' + m.han.length + ': ' + m.han.slice(0, 3).join(' | '));
      if (m.over > 1) fail(r, '옆 넘침 ' + m.over + 'px');
      if (m.small.length) fail(r, '작은 글씨 ' + m.small.slice(0, 2).join(' | '));
      if (m.taps.length) fail(r, '좁은 누름 ' + m.taps.slice(0, 2).join(' | '));
      if (!/ATLAS/.test(m.title) || /[가-힣]/.test(m.title)) fail(r, '창 제목 ' + m.title);
      if (errs.length) fail(r, '오류 ' + errs[0]);
    } catch (e) { fail(r, '멈춤 ' + String(e).slice(0, 120)); }
  }
  try { for (const x of await p.evaluate(() => window.__atlasI18n?.missing() ?? [])) if (!miss.has(x.key)) miss.set(x.key, x.ex); } catch { /* 넘어감 */ }
  await ctx.close();
}
const t0 = Date.now();
await Promise.all(Array.from({length: JOBS}, (_, k) => worker(routes.filter((_, i) => i % JOBS === k))));
await b.close();
const res = {schema: 'atlas-new-en-check-1', made: new Date().toISOString(), base, lang: 'en', plan: '360×640', routes: routes.length, screens, companies: cos.length, full: LIM == null && cos.length === all.length,
  seconds: Math.round((Date.now() - t0) / 1000), missing: miss.size, missingFirst: [...miss].slice(0, 30).map(([key, ex]) => ({key, ex})), fails: fails.length,
  kinds: Object.entries(fails.reduce((m, f) => { const k = f.what.split(' ')[0]; m[k] = (m[k] ?? 0) + 1; return m; }, {})), all: fails.slice(0, 600)};
res.ok = res.fails === 0 && res.missing === 0 && res.full;
fs.mkdirSync(path.dirname(OUT), {recursive: true}); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({routes: res.routes, screens, fails: res.fails, missing: res.missing, kinds: res.kinds, full: res.full, seconds: res.seconds}));
process.exit(res.ok ? 0 : 1);

#!/usr/bin/env node
/**
 * 새 아틀란스(/next/ · 규칙 74) 영어 돌기 — 사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」(규칙 71)
 *   · 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 — 새 화면도 영어 사전(scripts/atlas11/t365/i18n/en-src.json)으로 영어가 되는지 봄
 *   여는 곳: /next/?dev=1&lang=en (app.js EN_NEXT 가 false 인 동안 새 화면 영어는 ?dev=1 로만 열림 · --dev 0 이면 ?lang=en 만)
 *   길: 홈 · 칩 일곱(#/f/rise|surge|lead|pick|group|ind|us) · 쇼츠(+ #/shorts/<n> 한 장씩) · 구독 · 나 · 찾기(+ #/find/<말>) · 지수 둘(#/w/KOSPI · KOSDAQ)
 *       · 보는 화면(회사 표본 — 지수 둘과 합쳐 --limit 60 · --all 이면 모든 회사) · 업종 채널 모두 · 갈래 채널 모두 · 없는 회사 · 없는 채널
 *       · --modules 면 옮긴 쪽(#/w/<번호>/past|rivals|grow|range · #/surge(+ /10 ~ /40) · #/cal(+ 종목 파일) · #/cond(+ 고르기) · #/talk · #/up · #/time · #/info · #/x/<번호>)
 *   화면마다 본다(영어 · 360 × 640): ① 사전에 없는 틀 0(엔진 __atlasI18n.missing) ② 보이는 한글 0(lang="ko" 원문 빼고 · 글 · aria-label · title · placeholder · alt · ::before/::after)
 *       ③ 창 제목 한글 0(사전에는 있는데 app.js 가 L() 로 안 감싼 것은 따로 셈) · html lang = en ④ 가로 넘침 0 — 세 폭(320 · 360 · 390)에서 쪽 넘침 · 화면 밖으로 나간 칸 · 칸 안에서 넘친 글
 *       ⑤ 화면 오류 0(쪽 모듈 파일 못 받음은 따로 셈) ⑥ 동그라미 글자(.av)는 로마자 한 글자 — 한글 한 글자를 사전이 낱말로 바꾸면(「금」 → Fri) 실패
 *   누르기(새 글이 생기는 곳): 구독 · 구독 풀기 · 나중에 볼 것 담기 · 빼기 · 보내기(알림) · 선 끌기 이름표(회사 · 지수) · 짧게 누름 · 다음 볼 것 더 보기 · 채널 업종 탭 · 더 보기
 *       · 찾기 쓰기(회사 이름 · 번호 · 업종 · 갈래 · 영어 · 없는 말) · 구독한 채널 칸 · 나 칸(본 기록 · 담은 것) · 지우기(확인 창 글 · 알림) · 쇼츠 보내기
 *       · 글씨 크기 단추 세 번(알림 · 단추 이름) + 아주 큰 글씨로 주요 화면 열하나를 세 폭에서
 *   결과: own(새 화면 자기 쪽) · mod(쪽 모듈 칸 · 길)로 나눠 셈 · --dump 면 사전에 없는 틀 목록(틀 · 보기 글 · 처음 본 곳)
 *   바꿔치기(--no-edge 면 뺌): 받은 자료를 화면 안에서 바꿔 다시 그림(NX.D) — 오늘 한 줄(오름 · 내림 · 거의 그대로 · 평소 견줌 셋 · 3달 동안 가장 크게 · 날짜 이후 가장 크게 · 잇달아 ·
 *       장 중 · 오전 · 오후 · 오늘 · 짧은 선 · 못 받음) · 큰 날 「!」 · 봉인 줄(오늘 엶 · 엶 날 지남) · 1주 오른 업종 없음 · 미국 · 고른 곳 · 지수 없음 + 새 창 둘(자료 파일 못 받음)
 *       + 오늘 한 줄 문장 모두(때 일곱 꼴 × 코스피 · 코스닥 × 오름 · 내림 × 평소 견줌 × 잇달아)를 엔진에 넣어 봄
 *   쓰는 법: node scripts/atlas11/next/next_en_check.mjs --base http://127.0.0.1:8826 [--all | --limit 60] [--modules] [--no-edge] [--only home,chips,shorts,sub,me,find,watch,chan,act,edge,grammar,mod]
 *            [--dev 1] [--pw /opt/node-tools/] [--out reports/atlas11/verify/next-en-latest.json] [--dump 사전에-없는-틀.json] [--app-file 고친-app.js(시험 · 서버의 /next/app.js 대신)]
 *   틀린 것이 하나라도 있으면 끝 코드 1(--only · --limit 은 「full: false」 — 마지막엔 --all --modules 로 전부)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ARGV = process.argv.slice(2);
const arg = (k, d) => { const i = ARGV.indexOf(k); return i >= 0 && ARGV[i + 1] != null && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d; };
const flag = k => ARGV.includes(k);
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const OUT = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/next-en-latest.json')), DUMP = arg('--dump', null);
const ALL = flag('--all'), LIMIT = Math.max(2, Number(arg('--limit', 60)) || 60), MODULES = flag('--modules'), EDGE = !flag('--no-edge');
const APP_FILE = arg('--app-file', null) ? path.resolve(arg('--app-file')) : null; // 시험 전용 — 결과 파일에 적히고 full 이 아님
const DEV = arg('--dev', '1') !== '0', ONLY = arg('--only', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
const on = k => !ONLY || ONLY.includes(k);
const WIDTHS = [320, 360, 390], MAIN_W = 360, H = 640;
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const PAGE = base + '/next/?' + (DEV ? 'dev=1&' : '') + 'lang=en';
const t0 = Date.now();

/* ── 자료(시험 서버에서 · 앱과 같은 파일) ── */
const getJ = async f => { try { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); return r.ok ? await r.json() : null; } catch { return null; } };
const [core, mkt, home, surge, cond, surgetr, names] = await Promise.all(['core.json', 'mkt.json', 'home.json', 'surge.json', 'cond.json', 'surgetr.json', 'names.json'].map(getJ));
if (!core || !mkt || !home) { console.error('자료(core · mkt · home)를 못 받음 — 시험 서버 ' + base); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO).sort();
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/* ── 실패 · 셈 ── 같은 실패 글은 한 번(처음 화면 + 몇 번) */
const fails = new Map(), counts = {};
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
function fail(kind, where, what, ex = null) { const key = kind + '|' + what; const f = fails.get(key); if (f) { f.n++; if (f.at.length < 5) f.at.push(where); } else fails.set(key, {kind, what, ex, at: [where], n: 1}); }
const miss = new Map(); // 틀 → {ex, at}
const avChars = new Set(); // 동그라미 글자(이름 첫 한글 한 글자) — 엔진은 이것도 「사전에 없는 틀」로 셈 → 사전 일이 아니라 app.js 일이라 따로 셈

/* ── 길 ── */
const CHIPS = ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us'];
const FIND_WORDS = ['삼성', '전자', '반도체', '005930', 'SK', '0', 'Samsung', 'zzqq']; // 없는 말은 한글 아닌 것(찾는 말을 「…」로 되돌려 보여 주는 글은 쓴 사람 글 그대로)
function sample() {
  if (ALL) return codes;
  const want = LIMIT - 2, pick = new Set(['005930']);
  for (const c of codes) { if (pick.size >= 6) break; if (!HAN.test(CO[c].n)) pick.add(c); } // 로마자 이름 회사(엔진이 사전에 없는 줄에서만 이름으로 봄)
  for (const c of codes) { if (pick.size >= 8) break; if (!CO[c].i) pick.add(c); } // 업종 모름
  const step = Math.max(1, Math.floor(codes.length / Math.max(1, want)));
  for (let i = 0; pick.size < want && i < codes.length; i += step) pick.add(codes[i]);
  for (let i = 0; pick.size < want && i < codes.length; i++) pick.add(codes[i]);
  return [...pick].slice(0, want);
}
const WATCH = sample();
const enc = encodeURIComponent;
const routes = [];
const add = (kind, r) => { if (on(kind)) routes.push({kind, r}); };
add('home', '#/');
for (const c of CHIPS) add('chips', '#/f/' + c);
add('shorts', '#/shorts'); // 한 장씩(#/shorts/<n>)은 장 수를 센 뒤에 덧붙임
add('sub', '#/sub'); add('me', '#/me'); add('find', '#/find');
for (const w of FIND_WORDS) add('find', '#/find/' + enc(w));
add('watch', '#/w/KOSPI'); add('watch', '#/w/KOSDAQ');
for (const c of WATCH) add('watch', '#/w/' + c);
add('watch', '#/w/999999');
for (const i of core.industries) add('chan', '#/ch/i/' + enc(i.name));
for (const g of core.groups) add('chan', '#/ch/g/' + enc(g.id));
add('chan', '#/ch/i/' + enc('없는업종')); add('chan', '#/ch/g/zz');
/* 옮긴 쪽(--modules) — 모듈 파일(/next/p-<이름>.js)이 없으면 「모듈 없음」 실패 */
const MODS = ['past', 'rivals', 'grow', 'range', 'surge', 'cal', 'cond', 'talk', 'up', 'time', 'info', 'x', 'co', 'chx', 'today'];
const modHave = {};
if (MODULES || DEV) for (const m of MODS) { try { const r = await fetch(base + '/next/p-' + m + '.js', {method: 'HEAD'}); modHave[m] = r.ok; } catch { modHave[m] = false; } }
if (MODULES && on('mod')) {
  const mc = ALL ? codes : [...new Set(['005930', ...WATCH])].slice(0, 12);
  const R = {past: mc.map(c => `#/w/${c}/past`), rivals: mc.map(c => `#/w/${c}/rivals`), grow: mc.map(c => `#/w/${c}/grow`), range: mc.map(c => `#/w/${c}/range`),
    surge: ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'],
    cal: ['#/cal', ...((surgetr?.cases ?? []).map(r => r[0]).slice(0, ALL ? Infinity : 20).map(c => '#/cal/' + c))],
    cond: ['#/cond', '#/cond/rise-top3-spike', '#/cond/up-f3-loss', '#/cond/dn-pick-all', '#/cond/all-all-all'],
    talk: ['#/talk'], up: ['#/up'], time: ['#/time'], info: ['#/info'],
    x: (names?.rows ?? []).filter(r => r.k).slice(0, ALL ? 40 : 6).map(r => '#/x/' + r.c)};
  for (const [m, rs] of Object.entries(R)) { if (!modHave[m]) { fail('모듈 없음', 'p-' + m + '.js', '옮긴 쪽 파일이 아직 없음 — 길 ' + rs.length + '개를 못 봄'); continue; } for (const r of rs) routes.push({kind: 'mod', r, mod: m}); }
}

/* ── 브라우저 ── 하나만 · 다 쓰면 닫음(기계가 작음) */
const exe = '/opt/pw-browsers/chromium';
const b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function newPage(block = []) {
  const ctx = await b.newContext({viewport: {width: MAIN_W, height: H}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text() + (m.location()?.url ? ' @' + m.location().url : '')); });
  for (const f of block) await p.route('**/atlas/data/' + f, r => r.fulfill({status: 404, body: 'blocked'}));
  if (APP_FILE) await p.route('**/next/app.js', r => r.fulfill({path: APP_FILE, contentType: 'text/javascript; charset=utf-8'})); // 시험: 고칠 안(app.js 사본)을 미리 돌려 봄
  await p.goto(PAGE + '#/');
  await p.waitForFunction(() => window.__atlasI18n && window.NX && !document.querySelector('#view .boot'), null, {timeout: 40000});
  return p;
}
/** 길 바꾸기 — 앞 화면이 새 칸으로 바뀌고(「여는 중」도 사라지고) 두 장 그린 뒤까지 기다림 · 같은 길이면 다른 길을 거쳐 다시 그림 */
async function go(q, hash) {
  if (await q.evaluate(() => location.hash || '#/') === hash) await go(q, hash === '#/me' ? '#/sub' : '#/me');
  await q.evaluate(h => { window.__nxenTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = h; }, hash);
  await q.waitForFunction(() => { const v = document.querySelector('#view'); return !!v && v.firstElementChild !== window.__nxenTok && !v.querySelector('.boot'); }, null, {timeout: 25000})
    .catch(() => fail('여는 중 남음', hash, '25초 안에 안 그려짐'));
  await q.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/* 화면 안에서 재기 — 글(한글) · 꼴 */
function judgeText() {
  const HN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
  const vis = el => { if (!el) return false; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; if (!el.getClientRects().length) return false; if (el.closest('details:not([open]) > :not(summary)')) return false; return true; };
  const MODH = /^#\/(w\/[^/]+\/|surge|cal|cond|talk|up|time|info|x\/)/; // 쪽 모듈 길(p-*.js)
  const han = [], attrs = [], pseudo = [], key = s => { try { return window.__atlasI18n.templateOf(s).key; } catch { return s; } };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement; if (!el || el.closest('[lang="ko"], script, style, noscript, template, [hidden]')) continue;
    const t = n.nodeValue.trim(); if (!t || !HN.test(t) || !vis(el)) continue;
    han.push({mod: !!el.closest('.co-d, .chx-d, .today-d') || MODH.test(location.hash), k: key(t), ex: t.slice(0, 90), av: el.matches('.av')});
  }
  for (const a of ['aria-label', 'title', 'placeholder', 'alt']) for (const el of document.querySelectorAll('[' + a + ']')) { if (el.closest('[lang="ko"], [hidden], template')) continue; const v = el.getAttribute(a); if (HN.test(v)) attrs.push({k: '@' + a + ' ' + key(v), ex: v.slice(0, 70), mod: !!el.closest('.co-d, .chx-d, .today-d') || MODH.test(location.hash)}); }
  // 동그라미 글자(.av — 이름의 첫 글자) — 영어면 로마자 한 글자여야 함(한글 한 글자를 사전이 낱말로 바꾸면 「금」 → Fri · 「소」 → cattle 처럼 엉뚱한 말)
  const avBad = [...document.querySelectorAll('.av')].filter(e => vis(e) && !e.closest('[lang="ko"]')).map(e => e.textContent.trim()).filter(t => t && !/^[A-Za-z0-9?]$/.test(t) && !HN.test(t));
  // 꾸밈 글(::before · ::after content) — 글자 마디가 아니라 위 검사가 못 봄
  const sels = [], walk = rules => { for (const ru of rules) { if (ru.cssRules) walk(ru.cssRules); if (ru.selectorText && /::?(before|after)/.test(ru.selectorText) && HN.test(ru.style?.content ?? '')) sels.push(ru.selectorText); } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* 다른 곳 글꼴표 */ } }
  for (const sel of sels) for (const part of sel.split(',')) { const m = /^(.*?)::?(before|after)\s*$/.exec(part.trim()); if (!m) continue; let els = []; try { els = document.querySelectorAll(m[1] || '*'); } catch { continue; }
    for (const el of els) { if (el.closest('[lang="ko"]') || !vis(el)) continue; const c = getComputedStyle(el, '::' + m[2]).content; if (c && HN.test(c)) pseudo.push('::' + m[2] + ' ' + c.slice(0, 40)); } }
  let titleEn = document.title; try { titleEn = window.__atlasI18n.t(document.title); } catch { /* 엔진 없음 */ }
  return {han, attrs, pseudo, avBad, title: document.title, titleKey: key(document.title), titleEn, lang: document.documentElement.lang, toast: [...document.querySelectorAll('.toast')].map(e => e.textContent)};
}
function judgeBox() {
  const de = document.documentElement, W = de.clientWidth, out = [], box = [];
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return true; } return false; };
  const label = el => (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : el.tagName.toLowerCase()) + ' 「' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28) + '」';
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg, script, style, noscript, template, [hidden], .hpi')) continue;
    const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if ((r.right > W + 1 || r.left < -1) && !clipped(el)) out.push(label(el) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    // 칸 안에서 넘친 글(제 글을 가진 칸 · 넘침을 보이게 둔 칸 · 말줄임 빼고)
    if (s.overflowX === 'visible' && s.display !== 'inline' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1
      && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) && !clipped(el)) box.push(label(el) + ' ' + el.scrollWidth + '>' + el.clientWidth);
  }
  return {over: de.scrollWidth - W, out: out.slice(0, 6), box: box.slice(0, 6)};
}
async function judge(p, where, {widths = true} = {}) {
  const tx = await p.evaluate(judgeText);
  for (const t of tx.han) { if (t.av) avChars.add(t.ex); fail(t.mod ? '한글 남음(모듈 칸)' : t.av ? '한글 남음(동그라미 글자 — app.js first() 가 영어 이름 첫 글자를 써야 함)' : '한글 남음', where, t.k, t.ex); }
  for (const t of tx.attrs) fail(t.mod ? '한글 남음(모듈 칸 · 속성)' : '한글 남음(속성)', where, t.k, t.ex);
  for (const t of tx.pseudo) fail('한글 남음(꾸밈 글)', where, t);
  for (const t of tx.avBad) fail('동그라미 글자가 낱말로 바뀜', where, t);
  // 창 제목 — app.js 가 그린 뒤에 document.title 을 바꿈(엔진은 body 만 봄) → 사전에 틀이 있어도 app.js 가 L() 로 감싸야 영어
  if (HAN.test(tx.title)) fail(HAN.test(tx.titleEn) ? '창 제목 한글(사전에도 없음)' : '창 제목 한글(app.js 가 L() 로 안 감쌈 — 사전에는 있음)', where, tx.titleKey, tx.title);
  if (tx.lang !== 'en') fail('html lang', where, String(tx.lang));
  // 사전에 없는 틀 — 엔진이 처음 본 차례대로 쌓음 · 쪽 모듈 칸(.co-d · .chx-d · .today-d) 안의 글이면 「[모듈]」
  const ms = await p.evaluate(seen => (window.__atlasI18n?.missing() ?? []).filter(m => !seen.includes(m.key)).map(m => ({...m,
    mod: [...document.querySelectorAll('.co-d, .chx-d, .today-d')].some(s => s.textContent.includes(m.ex) || [...s.querySelectorAll('[aria-label]')].some(e => e.getAttribute('aria-label').includes(m.ex)))})), [...miss.keys()]);
  for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: (m.mod || /^#\/(w\/[^/]+\/|surge|cal|cond|talk|up|time|info|x\/)/.test(where) ? '[모듈] ' : '') + where});
  if (widths) {
    for (const w of WIDTHS) {
      if (w !== MAIN_W) { await p.setViewportSize({width: w, height: H}); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }
      const g = await p.evaluate(judgeBox);
      if (g.over > 0) fail('가로 넘침', where + ' @' + w, g.over + 'px');
      for (const x of g.out) fail('화면 밖으로 나간 칸', where + ' @' + w, x.replace(/ -?\d+~\d+$/, '') + ' @' + w);
      for (const x of g.box) fail('칸 안에서 넘친 글', where + ' @' + w, x.replace(/ \d+>\d+$/, '') + ' @' + w);
    }
    await p.setViewportSize({width: MAIN_W, height: H});
  }
  errs(p, where);
  bump('화면');
  return tx;
}
function errs(p, where) {
  for (const e of p._errs) { const mod = /\/next\/p-[a-z]+\.(js|css)|dynamically imported module/.test(e); fail(mod ? '모듈 파일 못 받음' : '화면 오류', where, e.slice(0, 180)); }
  p._errs.length = 0;
}

/* ── ① 길 돌기 ── */
const p = await newPage();
errs(p, '처음 열기');
// 쇼츠 장 수 → 한 장씩
if (on('shorts')) { await go(p, '#/shorts'); const n = await p.evaluate(() => document.querySelectorAll('#view .sh').length); bump('쇼츠 장', n); for (let i = 0; i < n; i++) routes.splice(routes.findIndex(x => x.r === '#/shorts') + 1 + i, 0, {kind: 'shorts', r: '#/shorts/' + i}); await go(p, '#/me'); }
let last = null;
for (const {kind, r} of routes) {
  if (r === last) continue; last = r;
  try { await go(p, r); await p.waitForTimeout(r === '#/' ? 300 : 60); await judge(p, r); bump('길 · ' + kind); }
  catch (e) { fail('멈춤', r, String(e.message || e).slice(0, 160)); }
}

/* ── ② 누르기 ── */
async function toastOf(q) { return q.evaluate(() => [...document.querySelectorAll('.toast')].map(e => e.textContent).join(' | ')); }
if (on('act')) {
  const W0 = '005930', o = CO[W0];
  try {
    await p.evaluate(() => { for (const k of ['atlas:new:sub', 'atlas:new:hist', 'atlas:new:later']) localStorage.removeItem(k); });
    await go(p, '#/w/' + W0); await p.waitForSelector('#view .chan .sub-btn');
    await p.click('#view .chan .sub-btn'); await judge(p, '누르기 · 구독', {widths: false});
    await p.click('#view .chan .sub-btn'); await judge(p, '누르기 · 구독 풀기', {widths: false});
    await p.click('#view .acts .act'); await judge(p, '누르기 · 나중에 볼 것 담기', {widths: true});
    await p.click('#view .acts .act'); await judge(p, '누르기 · 빼기', {widths: false});
    const share = p.locator('#view .acts button.act').nth(1);
    await share.click(); await p.waitForTimeout(60); await judge(p, '누르기 · 보내기(못 엶)', {widths: false});
    await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], {origin: base}).catch(() => {});
    await share.click(); await p.waitForTimeout(60); await judge(p, '누르기 · 보내기(주소 담음)', {widths: false});
    const more = p.locator('#view button.more').first();
    if (await more.isVisible().catch(() => false)) { await more.click(); await judge(p, '누르기 · 다음 볼 것 더 보기'); }
    // 선 끌기 — 회사 · 지수
    for (const hh of ['#/w/' + W0, '#/w/KOSPI']) {
      await go(p, hh); const bx = await p.locator('#view .player').boundingBox();
      for (const fx of [0.04, 0.35, 0.6, 0.97]) {
        await p.mouse.move(bx.x + bx.width * fx, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width * (fx + 0.01), bx.y + bx.height / 2, {steps: 2});
        await judge(p, '누르기 · 선 끌기 ' + hh + ' ' + fx, {widths: fx === 0.97}); await p.mouse.up();
      }
      await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(60); await judge(p, '누르기 · 짧게 누름 ' + hh, {widths: false});
    }
    // 채널 — 업종 탭 · 더 보기
    await go(p, '#/ch/g/' + enc(core.groups[0].id));
    const tabs = p.locator('#view .ctabs button'); if (await tabs.count() > 1) { await tabs.nth(1).click(); await judge(p, '누르기 · 갈래 채널 업종 탭'); await tabs.nth(0).click(); }
    const cm = p.locator('#view button.more'); if (await cm.isVisible().catch(() => false)) { await cm.click(); await judge(p, '누르기 · 채널 더 보기'); }
    // 찾기 쓰기
    await go(p, '#/find');
    const words = [...FIND_WORDS, o.n, CO[WATCH[WATCH.length - 1]].n, core.industries[3].name, core.groups[2].name, '갈래', 'zz'];
    for (const wd of words) { await p.fill('#view .find input', wd); await judge(p, '누르기 · 찾기 「' + wd + '」', {widths: wd === words[0]}); }
    await p.fill('#view .find input', ''); await judge(p, '누르기 · 찾기 지움', {widths: false});
    // 구독한 채널 칸 · 나 칸
    const subKeys = ['g:' + core.groups[0].id, 'g:' + core.groups[1].id, 'i:' + core.industries[0].name, 'i:' + core.industries[30].name];
    const hist = WATCH.slice(0, 14), later = WATCH.slice(2, 7);
    await p.evaluate(([s, hi, la]) => { localStorage.setItem('atlas:new:sub', JSON.stringify(s)); localStorage.setItem('atlas:new:hist', JSON.stringify(hi)); localStorage.setItem('atlas:new:later', JSON.stringify(la)); }, [subKeys, hist, later]);
    await go(p, '#/sub'); await judge(p, '누르기 · 구독 칸(채널 넷)');
    await go(p, '#/me'); await judge(p, '누르기 · 나 칸(기록 · 담은 것)');
    let dlg = null; p.once('dialog', d => { dlg = d.message(); d.accept(); });
    await p.click('#view .lst button'); await p.waitForTimeout(150);
    if (dlg == null) fail('누르기', '나 칸 지우기', '확인 창이 안 뜸');
    else if (HAN.test(dlg)) { const en = await p.evaluate(s => window.__atlasI18n.t(s), dlg); fail(HAN.test(en) ? '한글 남음(확인 창 · 사전에도 없음)' : '한글 남음(확인 창 · app.js 가 L() 로 안 감쌈 — 사전에는 있음)', '나 칸 지우기', dlg); }
    await judge(p, '누르기 · 지우기', {widths: false});
    // 쇼츠 보내기
    await go(p, '#/shorts'); const sb = p.locator('#view .sh .side button').first();
    if (await sb.count()) { await sb.click(); await p.waitForTimeout(60); await judge(p, '누르기 · 쇼츠 보내기', {widths: false}); }
    // 글씨 크기 단추(보통 → 크게 → 아주 크게 → 보통 · 알림 글 · 단추 이름) + 아주 크게로 주요 화면 넘침(영어 글이 가장 길어지는 때)
    if (await p.locator('#fontBtn').count()) {
      for (let k = 0; k < 3; k++) { await p.click('#fontBtn'); await p.waitForTimeout(60); await judge(p, '누르기 · 글씨 크기 ' + (k + 1), {widths: false}); }
      await p.click('#fontBtn'); await p.click('#fontBtn'); // 아주 크게
      for (const hh of ['#/', '#/w/005930', '#/w/KOSPI', '#/f/lead', '#/f/us', '#/shorts', '#/sub', '#/me', '#/find/' + enc('반도체'), '#/ch/g/semi', '#/ch/i/' + enc(core.industries[0].name)]) { await go(p, hh); await judge(p, '아주 큰 글씨 · ' + hh); }
      await p.click('#fontBtn'); // 보통으로
    }
    bump('누르기');
  } catch (e) { fail('멈춤', '누르기', String(e.message || e).slice(0, 200)); }
}

/* ── ③ 바꿔치기 — 받은 자료를 화면 안에서 바꿔 다시 그림(NX.D · 같은 창) ── */
const C = x => JSON.parse(JSON.stringify(x));
const kstDay = (ms = Date.now()) => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
const TODAY = kstDay(), addD = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10);
const bizBack = (d, k) => { let x = d, n = 0; while (n < k) { x = addD(x, -1); const w = new Date(x + 'T00:00:00Z').getUTCDay(); if (w && w !== 6) n++; } return x; };
const PAST = bizBack(TODAY, 3);
/** 지수 선 — n 줄 · 끝 날 end · 마지막 하루 t(%) · 앞 날들 평소 크기 avg(번갈아 오르내림 — 잇달아 없음) · 같은 쪽 더 큰 날 gap 거래일 앞 · 잇달아 k */
function idxRows(end, {t, avg = 1, gap = null, k = 1, n = 62}) {
  const ds = []; let d = end; for (let i = 0; i < n; i++) { ds.unshift(d); d = bizBack(d, 1); }
  const mv = []; for (let i = 1; i < n; i++) mv.push((i % 2 ? 1 : -1) * avg * (0.8 + 0.4 * ((i * 7) % 5) / 4));
  const m = mv.length; mv[m - 1] = t; for (let j = 2; j <= k; j++) mv[m - j] = Math.sign(t || 1) * avg * 0.5;
  if (gap != null) mv[m - 1 - gap] = t * 1.3;
  const rows = [[ds[0], 2500]]; for (let i = 1; i < n; i++) rows.push([ds[i], Math.round(rows[i - 1][1] * (1 + mv[i - 1] / 100) * 100) / 100]);
  return rows;
}
function idxOf(name, end, shape, live) {
  const rows = idxRows(end, shape), lastV = rows.at(-1)[1], prev = rows.at(-2)[1];
  const hiI = rows.reduce((a, r, i) => (r[1] > rows[a][1] ? i : a), 0), loI = rows.reduce((a, r, i) => (r[1] < rows[a][1] ? i : a), 0);
  return {name, rows, date: end, close: lastV, day: Math.round((lastV / prev - 1) * 1e4) / 100, live, hi: {d: rows[hiI][0], v: rows[hiI][1]}, lo: {d: rows[loI][0], v: rows[loI][1]}, chg20: 1.2};
}
const SHAPES = [{t: 2.8}, {t: -2.8}, {t: 2.2, gap: 8}, {t: -2.2, gap: 8}, {t: 2.2, gap: 3}, {t: 1.0}, {t: -1.0}, {t: 0.3}, {t: -0.3}, {t: 0.02}, {t: 1.4, k: 4}, {t: -1.4, k: 5}, {t: 3.3, k: 3}, {t: -3.3, k: 3}];
/** 받은 때 — [이름, 끝 날, 장 중?, stale.idx(받은 때 · 없으면 null), kst] */
const WHENS = [['날짜 · 마감', PAST, false, null, PAST + ' 18:00'], ['오늘 · 마감', TODAY, false, null, TODAY + ' 18:00'], ['날짜 오전까지', PAST, true, PAST + ' 10:20', TODAY + ' 08:00'],
  ['날짜 오후까지', PAST, true, PAST + ' 14:59', TODAY + ' 08:00'], ['오늘 오전까지', TODAY, true, TODAY + ' 10:20', TODAY + ' 10:21'], ['오늘 오후까지', TODAY, true, TODAY + ' 13:05', TODAY + ' 13:06']];
const ALERTS = [[{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.1, why: 'usual'}], [{kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 5.6, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 6.1, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 7.2, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -5.2, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 2.6, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 5.2, why: 'big'}], [{kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -2.6, why: 'usual'}]];
async function swap(q, patch) { await q.evaluate(pt => { const D = window.NX.D; for (const [k, v] of Object.entries(pt)) D[k] = v; }, patch); }
async function redraw(q, hh, where, opt) { await go(q, hh === '#/me' ? '#/sub' : '#/me'); await go(q, hh); await judge(q, where, opt); }
if (EDGE && on('edge')) {
  try {
    const H0 = C(home), core0 = C(core);
    let si = 0;
    for (const [wn, end, live, stale, kst] of WHENS) {
      for (let j = 0; j < 4; j++) {
        const s1 = SHAPES[si % SHAPES.length], s2 = SHAPES[(si + 7) % SHAPES.length]; si++;
        const Hx = C(H0); Hx.kst = kst; Hx.live = live; Hx.stale = stale ? {...(Hx.stale || {}), idx: stale} : null;
        Hx.idx = {KOSPI: idxOf('코스피', end, s1, live), KOSDAQ: idxOf('코스닥', end, s2, live)}; Hx.alerts = ALERTS[si % ALERTS.length];
        await swap(p, {home: Hx}); await redraw(p, '#/', `바꿔치기 · 오늘 한 줄 ${wn} ${j}`, {widths: j === 0});
        if (j === 0) { await redraw(p, '#/shorts', `바꿔치기 · 쇼츠 ${wn}`, {widths: false}); await redraw(p, '#/w/KOSDAQ', `바꿔치기 · 지수 ${wn}`, {widths: false}); }
      }
    }
    // 큰 날 「!」 모두 · 짧은 선 · 하루 모름 · 코스닥 없음 · 미국 · 고른 곳 · 지수 없음
    for (const [k, al] of ALERTS.entries()) { const Hx = C(H0); Hx.alerts = al; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 큰 날 ' + k, {widths: k === 4}); }
    { const Hx = C(H0); Hx.idx.KOSPI = idxOf('코스피', PAST, {t: 1.2, n: 15}, false); Hx.idx.KOSDAQ = {...idxOf('코스닥', PAST, {t: -0.8, n: 12}, false), day: null}; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 짧은 선 · 하루 모름'); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 하루 모름', {widths: false}); }
    { const Hx = C(H0); delete Hx.idx.KOSDAQ; Hx.idx.KOSPI.live = true; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 코스닥 없음', {widths: false}); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 코스닥 없음', {widths: false}); await redraw(p, '#/w/KOSPI', '바꿔치기 · 지수 장 중', {widths: false}); }
    { const Hx = C(H0); Hx.idx.KOSPI.date = 'x'; Hx.stale = null; Hx.live = false; Hx.idx.KOSPI.live = false; Hx.idx.KOSDAQ.live = false; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 날짜 모름', {widths: false}); }
    { const Hx = C(H0); Hx.idx = {}; Hx.us = null; Hx.s365 = null; await swap(p, {home: Hx}); for (const hh of ['#/', '#/f/us', '#/f/pick', '#/w/KOSPI', '#/w/KOSDAQ', '#/shorts']) await redraw(p, hh, '바꿔치기 · 지수 · 미국 · 고른 곳 없음 ' + hh, {widths: false}); }
    await swap(p, {home: C(H0)});
    // 봉인 줄 — 오늘 엶 · 엶 날 지남 · 1주 오른 업종 없음(core 는 같은 것을 고쳐 씀 — 찾아보기 칸(IXC)이 같은 것을 봄)
    for (const [nm, d] of [['오늘 엶', TODAY], ['엶 날 지남', bizBack(TODAY, 30)]]) { await p.evaluate(dd => { window.NX.D.core.time.opens[0].date = dd; }, d); await redraw(p, '#/', '바꿔치기 · 봉인 ' + nm, {widths: false}); }
    await p.evaluate(dd => { window.NX.D.core.time.opens[0].date = dd; }, core0.time.opens[0].date);
    await p.evaluate(() => { const c = window.NX.D.core; c.__rise = c.rise.list; c.rise.list = []; });
    await redraw(p, '#/f/rise', '바꿔치기 · 1주 오른 업종 없음'); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 오른 업종 없음', {widths: false}); await redraw(p, '#/', '바꿔치기 · 첫 화면 오른 업종 없음', {widths: false});
    await p.evaluate(() => { const c = window.NX.D.core; c.rise.list = c.__rise; delete c.__rise; });
    bump('바꿔치기');
  } catch (e) { fail('멈춤', '바꿔치기', String(e.message || e).slice(0, 200)); }
}

/* ── ④ 오늘 한 줄 문장 모두 — 때 일곱 꼴 × 코스피(는) · 코스닥(은) × 오름 · 내림 × 평소 견줌 × 이후 가장 크게 × 잇달아 — 엔진에 바로 넣어 봄
   (app.js todayWords · idxAlerts 와 같은 말 차례 · 숫자는 아무 값 — 틀은 숫자를 {n} 으로 바꿈) */
if (on('grammar')) {
  const out = await p.evaluate(() => {
    const NB = ' ', T = window.__atlasI18n.t, bad = [];
    const whens = ['10월 9일', '오늘', '10월 9일 오전 10:20까지', '10월 9일 오후 2:59까지', '오늘 오전 9:40까지', '오늘 오후 1:05까지'];
    const ss = [];
    for (const [nm, jo] of [['코스피', '코스피는'], ['코스닥', '코스닥은']]) {
      ss.push(`? ${nm} 값을 못 받았어요.`);
      for (const w of [...whens, '?']) {
        const lead = w + ' ' + jo;
        ss.push(`${lead} 거의 그대로였어요.`, `${lead} +0.4%예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`, `${lead} −1.2%예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`, `${lead} ?예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`);
        for (const dn of [false, true]) {
          const did = dn ? '내렸어요' : '올랐어요', s1 = `${lead} 2.3%${NB}${did}.`;
          const s2s = [[], ['평소만큼 움직였어요.'], ['평소보다 작게 움직였어요.'], [`평소의${NB}2.6배예요.`], [`평소의${NB}2.6배예요.`, `3달 동안 가장 크게 ${did}.`], [`평소의${NB}12배예요.`, `9월 2일 이후 가장 크게 ${did}.`]];
          for (const s2 of s2s) for (const s4 of [[], [`4거래일 잇달아 ${dn ? '내렸고' : '올랐고'}, 그동안 5.1%${NB}${dn ? '빠졌어요' : '뛰었어요'}.`]]) ss.push([s1, ...s2, ...s4].join(' '));
        }
      }
    }
    for (const who of ['코스피가', '코스닥이', '코스피와 코스닥 모두']) for (const why of ['하루 5% 넘게', `평소의 2.5배 넘게`]) for (const way of ['내렸어요', '올랐어요', '움직였어요']) ss.push(`! ${who} ${why} ${way}.`);
    for (const s of ss) { const o = T(s); if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(o)) bad.push(s); }
    return {n: ss.length, bad};
  });
  bump('오늘 한 줄 문장', out.n);
  for (const s of out.bad) fail('오늘 한 줄 문장(사전에 없음)', 'grammar', s);
  const ms = await p.evaluate(() => window.__atlasI18n?.missing() ?? []); for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: 'grammar'});
}
await p.context().close();

/* ── ⑤ 새 창 — 자료 파일을 못 받을 때(받은 것을 화면 안에서 바꿀 수 없는 칸: 몸값 · 급등 · 모든 자료) ── */
if (EDGE && on('edge')) {
  for (const [nm, block, hs] of [['몸값 · 급등 · 첫 화면 자료 못 받음', ['cond.json', 'surge.json', 'home.json'], ['#/', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/us', '#/shorts', '#/w/KOSPI', '#/w/005930']],
    ['모든 자료 못 받음', ['core.json', 'mkt.json'], ['#/', '#/f/rise', '#/f/ind', '#/shorts', '#/w/005930', '#/w/KOSPI', '#/ch/g/semi', '#/ch/i/' + enc('반도체'), '#/sub', '#/me', '#/find']]]) {
    let q = null;
    try {
      q = await newPage(block); q._errs = q._errs.filter(e => !/404|Failed to load resource/.test(e)); // 일부러 못 받게 한 파일(404)은 오류로 안 셈
      for (const hh of hs) { await go(q, hh); q._errs = q._errs.filter(e => !/404|Failed to load resource/.test(e)); await judge(q, `새 창 · ${nm} ${hh}`, {widths: hh === '#/'}); }
      // 안 막은 쪽(--dev 의 co · chx 모듈) 못 받음은 위 「모듈 파일 못 받음」으로 셈
      const ms = await q.evaluate(() => window.__atlasI18n?.missing() ?? []); for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: '새 창 · ' + nm});
      bump('새 창');
    } catch (e) { fail('멈춤', '새 창 · ' + nm, String(e.message || e).slice(0, 200)); }
    await q?.context().close();
  }
}
await b.close();

/* ── 결과 ── */
let avMiss = 0;
for (const [key, m] of miss) { if (avChars.has(key)) { avMiss++; continue; } fail('사전에 없는 틀', m.at, key + '  ← 「' + String(m.ex).slice(0, 80) + '」'); }
const list = [...fails.values()];
const kinds = list.reduce((a, f) => { a[f.kind] = (a[f.kind] || 0) + 1; return a; }, {});
const full = !ONLY && ALL && MODULES && EDGE && DEV && !APP_FILE;
const isMod = f => /^\[모듈\]/.test(f.at[0]) || /모듈/.test(f.kind);
const own = list.filter(f => !isMod(f)), modF = list.filter(isMod);
const res = {schema: 'atlas11-next-en-check-1', at: new Date().toISOString(), base, page: PAGE, lang: 'en', widths: WIDTHS, routes: routes.length, companies: WATCH.length, allCompanies: ALL, modules: MODULES,
  modFiles: modHave, edge: EDGE, only: ONLY, appFile: APP_FILE, full, seconds: Math.round((Date.now() - t0) / 1000), counts, missing: miss.size - avMiss, avatarLetters: avMiss, kinds, fails: list.length,
  own: {fails: own.length, missing: own.filter(f => f.kind === '사전에 없는 틀').length, leftover: own.filter(f => f.kind.startsWith('한글 남음')).length},
  mod: {fails: modF.length, missing: modF.filter(f => f.kind === '사전에 없는 틀').length, leftover: modF.filter(f => f.kind.startsWith('한글 남음')).length},
  missingList: [...miss].filter(([key]) => !avChars.has(key)).map(([key, m]) => ({key, ex: m.ex, at: m.at})), all: list.slice(0, 800), ok: list.length === 0};
await fs.mkdir(path.dirname(OUT), {recursive: true});
await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
if (DUMP) await fs.writeFile(path.resolve(DUMP), JSON.stringify(res.missingList, null, 1) + '\n');
console.log(JSON.stringify({ok: res.ok, routes: res.routes, screens: counts['화면'] || 0, missing: res.missing, fails: res.fails, own: res.own, mod: res.mod, kinds, full, seconds: res.seconds}));
process.exit(res.ok ? 0 : 1);

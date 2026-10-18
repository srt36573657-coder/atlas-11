#!/usr/bin/env node
/**
 * VH — 첫 화면(#/)과 칩 쪽(#/f/*)을 사장님 말씀(order-0015 [6] · [7] 5 · [9] 7)대로 따로 재는 검사 — 만든 일꾼이 아닌 일꾼이 잼(2026-10-18)
 *
 * 쓰는 법  node scripts/atlas11/next/verify/vh.mjs [--base http://127.0.0.1:8826] [--only 1,2,5] [--json 파일] [--shots 폴더] [--from 저장한 결과.json]
 *   브라우저는 한 번에 하나 · 칸(context)은 잴 때마다 새로 엶 · 한국어 360×640 · 390×800 · 영어(?lang=en) 390×640 · 약 2분
 *   사이트 자료는 서버(/atlas/data/*.json · /next/data/*.json)에서 받아 노드에서 다시 셈(화면의 숫자와 맞댐) — 화면 코드를 읽어 셈을 베끼지 않음
 *   판정 = PASS(말씀 그대로) · PARTIAL(말씀의 한 부분이 어긋남 — 어디인지 글로 적음) · FAIL(못 지킴)
 *   끝 코드 0 = 실패 없음(PARTIAL 은 0) · 1 = FAIL 있음 · 2 = 검사를 못 함 · --from = 브라우저 없이 저장한 결과로 판정만 다시
 *   흉내(자료 바꿔치기 — 사이트 파일은 안 고침): 보통 날 · 큰 날 「!」 둘(home.json) · 오늘 일지 끝낸 날 · 쉬는 날(localStorage) · 끝낸 날 + 고른 곳 3 · 8(gdr.json picks) · 요약 404 · 막음 · 옛것
 *
 * 재는 것(사장님 말씀 → 번호)
 *   1 [6] 첫 화면은 한 화면(옛 9,572px · 12화면) · 2 [6] 1 · 2 띠는 이야기 입구 밑 · 날짜는 한 번 · 날 다른 칸은 꼬리표
 *   3 [6] 3 이야기 입구 밑 세 덩이 + 닫힌 「더 보기」 · 같은 숫자 두 번 없음 · 4 [6] 4 오늘 시장은 세 줄 요약 → #/today
 *   5 [6] 5 급등 카드는 급등 칩 안에만 · 「1등」 · 보내기 없음 · 6 [6] 6 「36곳 중 n곳이 1년 안에 반값 아래로」 n 다시 셈
 *   7 [6] 7 칩 줄 · 선반 오른쪽 끝 흐림 · 「달력」 「조건 찾기」 · 8 [6] 8 · 9 큰 숫자 = 마지막 날 하루 값 + 까닭 한 줄(자료로 다시 셈)
 *   9 [7] 5 칩 목록 10줄 + 「나머지 n곳 보기」 · 10 [9] 7 첫 화면 망 요청(요약 8KB 아래 · mkt · cond 는 칩이 필요할 때만 · 요약 없어도 그려짐)
 *   11 [6] 10 잠긴 고도리 칸 한 줄 · 오늘 매매일지를 끝냈으면 「오늘 점수 · 다시 하기」 · 12 [10] 5 ~ 8 17px 아래 글 · 글씨 여섯 가지 · 간격 8 · 16 · 24 · 옛 말 · 영어에 한국어
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const {chromium} = createRequire('/opt/node-tools/')('playwright');
const SELF = fileURLToPath(import.meta.url), ROOT = path.resolve(path.dirname(SELF), '../../../..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASE = String(opt('--base', process.env.VH_BASE || 'http://127.0.0.1:8826')).replace(/\/$/, '');
const ONLY = opt('--only', '') ? new Set(String(opt('--only')).split(',').map(Number)) : null;
const JSON_OUT = opt('--json', null), SHOTS = opt('--shots', null);
const want = (...ns) => !ONLY || ns.some(n => ONLY.has(n));
const log = (...a) => console.error('[vh]', ...a);
if (SHOTS) fs.mkdirSync(SHOTS, {recursive: true});

/* ───────── 자료(서버에서 받아 노드에서 다시 셈) ───────── */
const cache = new Map();
const J = p => { if (!cache.has(p)) cache.set(p, fetch(BASE + p).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(p); };
const A = f => J('/atlas/data/' + f);
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; // 화면이 보이는 반올림(0.1 · 크기로)
const p2 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%';
const nk = n => Number(n).toLocaleString('ko-KR');
const eokH = v => { const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? nk(j) + '조' + (r ? ' ' : '') : '') + (r || !j ? nk(r) + '억' : '') + ' 원'; };
const dd = d => String(d ?? '').slice(0, 10);
const calDiff = (a, b) => Math.round((Date.parse(dd(b)) - Date.parse(dd(a))) / 864e5);

/** 큰 숫자가 그려지는 동안 바뀌나 — 화면이 열리자마자 글이 바뀔 때마다 큰 숫자 칸의 글을 모두 적음(사장님 [6] 8 「선이 그려지는 동안 큰 숫자를 바꾸지 마라」) */
const WATCH = () => {
  const seen = new Map(), sel = '.card .th .big, .card .th.num b, .hm-big';
  const key = e => (e.closest('li.hm-it')?.dataset.k) || (e.closest('.card') ? 'card' + [...document.querySelectorAll('.card')].indexOf(e.closest('.card')) : 'x');
  const rec = () => { try { for (const e of document.querySelectorAll(sel)) { const t = (e.textContent || '').trim(); if (!t) continue; const k = key(e), a = seen.get(k) || []; if (a[a.length - 1]?.t !== t) { a.push({t, at: Math.round(performance.now())}); seen.set(k, a); } } } catch { /* 못 읽음 */ } };
  window.__vhBig = () => Object.fromEntries(seen);
  try { new MutationObserver(rec).observe(document, {subtree: true, childList: true, characterData: true}); } catch { /* 못 지켜봄 */ }
  const t = setInterval(rec, 50); setTimeout(() => clearInterval(t), 12000);
};

/* ───────── 브라우저 도우미 ───────── */
const CFG = {k360: {w: 360, h: 640, lang: 'ko'}, k390: {w: 390, h: 800, lang: 'ko'}, e390: {w: 390, h: 640, lang: 'en'}};
const url = (cfg, hash = '#/') => `${BASE}/next/?dev=1${cfg.lang === 'en' ? '&lang=en' : ''}${hash}`;
async function settle(page, ms = 600) {
  await page.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 25000}).catch(() => {});
  await page.waitForLoadState('networkidle', {timeout: 10000}).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(ms);
}
/** 새 칸 하나(쿠키 · 기억 · 캐시가 남과 안 섞임) — 요청 · 오류를 모음 */
async function open(browser, cfg, {hash = '#/', seed = null, route = null, watch = false} = {}) {
  const ctx = await browser.newContext({viewport: {width: cfg.w, height: cfg.h}, locale: cfg.lang === 'en' ? 'en-US' : 'ko-KR', serviceWorkers: 'block'});
  if (seed) await ctx.addInitScript(seed.fn, seed.arg);
  if (watch) await ctx.addInitScript(WATCH);
  const page = await ctx.newPage(), S = {ctx, page, reqs: [], errs: [], fails: [], cfg};
  page.on('response', resp => {
    const rec = {url: resp.url().replace(BASE, ''), status: resp.status(), type: resp.request().resourceType(), bytes: null};
    S.reqs.push(rec); resp.body().then(b => { rec.bytes = b.length; }).catch(() => {});
  });
  page.on('requestfailed', r => S.fails.push(r.url().replace(BASE, '') + ' ' + (r.failure()?.errorText || '')));
  page.on('pageerror', e => S.errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') S.errs.push('console.error: ' + m.text().slice(0, 200)); });
  if (route) await route(page, ctx);
  await page.goto(url(cfg, hash), {waitUntil: 'load', timeout: 45000});
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  return S;
}
const shot = async (S, name) => { if (SHOTS) await S.page.screenshot({path: path.join(SHOTS, name + '.png'), fullPage: true}).catch(() => {}); };
const kb = n => (n == null ? '?' : (n / 1024).toFixed(1) + 'KB');
const isData = u => /^\/(atlas|next)\/data\//.test(u.split('?')[0]);

/* ───────── 화면 안에서 재는 것(자기 완결 함수 — evaluate 로 보냄) ───────── */
const GEOM = () => {
  const de = document.documentElement, tabs = document.querySelector('nav.tabs'), tr = tabs ? tabs.getBoundingClientRect() : null, view = document.querySelector('#view');
  const abs = e => { const r = e.getBoundingClientRect(); return {top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left)}; };
  const kids = [...view.children].map(k => ({tag: k.tagName.toLowerCase(), cls: String(k.className).slice(0, 60), ...abs(k), open: k.tagName === 'DETAILS' ? k.open : undefined, txt: (k.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50)}));
  const foot = document.querySelector('footer.foot'), top = document.querySelector('header.top');
  return {scrollH: de.scrollHeight, innerH: innerHeight, innerW: innerWidth, sw: de.scrollWidth, tabTop: tr ? Math.round(tr.top) : null, tabH: tr ? Math.round(tr.height) : null, tabPos: tabs ? getComputedStyle(tabs).position : null,
    topH: top ? Math.round(top.getBoundingClientRect().height) : null, topPos: top ? getComputedStyle(top).position : null, footBottom: foot ? abs(foot).bottom : null, kids};
};
/** 보이는 글 · 이름표 글(씀 자리와 남의 글 표시 함께) */
const TEXTS = () => {
  const out = [], SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const where = e => (e.closest('#view') ? 'view' : e.closest('nav.tabs') ? 'tabs' : e.closest('header') ? 'top' : e.closest('footer') ? 'foot' : 'other');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const p = n.parentElement; if (!p || SKIP.has(p.tagName) || !p.getClientRects().length) continue;
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
    out.push({t, proper: !!p.closest('[data-proper]'), ko: !!p.closest('[lang="ko"]'), where: where(p)});
  }
  for (const e of document.body.querySelectorAll('[aria-label],[title],[placeholder],[alt]')) {
    if (!e.getClientRects().length) continue;
    for (const a of ['aria-label', 'title', 'placeholder', 'alt']) { const v = e.getAttribute(a); if (v) out.push({t: v, attr: a, proper: !!e.closest('[data-proper]'), ko: !!e.closest('[lang="ko"]'), where: where(e)}); }
  }
  out.push({t: document.title, attr: 'document.title', proper: false, ko: false, where: 'doc'});
  out.push({t: document.documentElement.lang, attr: 'html.lang', proper: false, ko: false, where: 'doc'});
  return out;
};
/** 글씨 크기 · 간격(computedStyleMap — auto 는 빼고 적은 값만) · 블록 사이 실제 간격 */
const SCAN = () => {
  const vis = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'LINK', 'META', 'TITLE', 'BR', 'WBR']);
  const desc = e => { const c = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.') : ''; return e.tagName.toLowerCase() + (c ? '.' + c : ''); };
  const els = [...document.body.querySelectorAll('*')].filter(e => !SKIP.has(e.tagName) && !e.closest('svg') && vis(e));
  const fonts = new Map(), small = [];
  const addFont = (e, txt, ps) => {
    const fs = Math.round(parseFloat(getComputedStyle(e, ps || null).fontSize) * 100) / 100, k = String(fs), inView = !!e.closest('#view');
    const f = fonts.get(k) || {fs, n: 0, nView: 0, ex: []}; f.n++; if (inView) f.nView++; if (f.ex.length < 3) f.ex.push(desc(e) + (ps || '') + '「' + txt.slice(0, 14) + '」'); fonts.set(k, f);
    if (fs < 16.95) small.push({fs, sel: desc(e) + (ps || ''), txt: txt.slice(0, 40), inView});
  };
  for (const e of els) {
    let own = ''; for (const n of e.childNodes) if (n.nodeType === 3) own += n.nodeValue;
    own = own.replace(/\s+/g, ' ').trim();
    if (own) addFont(e, own, null);
    else if ((e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') && (e.placeholder || e.value) && !['hidden', 'checkbox', 'radio'].includes(e.type)) addFont(e, e.placeholder || e.value, null);
    for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps).content; if (c && c !== 'none' && c !== 'normal' && c !== '""' && c !== "''") addFont(e, c.replace(/^["']|["']$/g, ''), ps); }
  }
  const SP = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'];
  const vals = new Map(), bad = new Map(), neg = new Map();
  for (const e of els) {
    let m = null; try { m = e.computedStyleMap(); } catch { m = null; }
    if (!m) continue;
    const inView = !!e.closest('#view');
    for (const p of SP) {
      const v = m.get(p); if (!v || typeof CSSUnitValue === 'undefined' || !(v instanceof CSSUnitValue)) continue;
      let px; if (v.unit === 'px') px = v.value; else if (v.value === 0) px = 0; else continue;
      const r = Math.round(px * 100) / 100, o = vals.get(String(r)) || {px: r, n: 0, nView: 0}; o.n++; if (inView) o.nView++; vals.set(String(r), o);
      if (r < 0) { const k = desc(e) + ' ' + p + ' ' + r; const x = neg.get(k) || {sel: desc(e), p, v: r, n: 0, inView}; x.n++; neg.set(k, x); }
      else if (r !== 0 && r !== 8 && r !== 16 && r !== 24) { const k = desc(e) + ' ' + p + ' ' + r; const x = bad.get(k) || {sel: desc(e), p, v: r, n: 0, inView}; x.n++; bad.set(k, x); }
    }
  }
  const gaps = [];
  const sib = (par, name) => { if (!par || !vis(par)) return; const ks = [...par.children].filter(vis); for (let i = 1; i < ks.length; i++) { const a = ks[i - 1].getBoundingClientRect(), b = ks[i].getBoundingClientRect(); gaps.push({in: name, g: Math.round((b.top - a.bottom) * 10) / 10, a: desc(ks[i - 1]), b: desc(ks[i])}); } };
  sib(document.querySelector('#view'), '#view'); sib(document.querySelector('.hm-in'), '.hm-in'); sib(document.querySelector('ul.hm-sum'), 'ul.hm-sum');
  const svgText = [...document.querySelectorAll('svg text')].filter(vis).map(t => ({fs: Math.round(parseFloat(getComputedStyle(t).fontSize) * 100) / 100, scaleW: Math.round((t.ownerSVGElement?.getBoundingClientRect().width || 0)), txt: (t.textContent || '').slice(0, 20)}));
  return {fonts: [...fonts.values()].sort((a, b) => a.fs - b.fs), small, svgText, spacing: [...vals.values()].sort((a, b) => a.px - b.px), bad: [...bad.values()].slice(0, 40), badTotal: [...bad.values()].reduce((s, x) => s + x.n, 0), neg: [...neg.values()], gaps};
};
/** 첫 화면 짜임 — 띠 · 덩이 · 날짜 글 · 고도리 칸 줄 수 */
const HOME = () => {
  const v = document.querySelector('#view'), kids = [...v.children], q = s => v.querySelector(s);
  const lines = el => { if (!el) return 0; const rg = document.createRange(); rg.selectNodeContents(el); const tops = new Set([...rg.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top / 4))); return tops.size; };
  const entry = q('a.tk-entry'), band = q('a.hm-band'), wy = q('section.wy'), gdr = q('section.gdr'), more = q('details.hm-more'), safe = q('p.hm-safe');
  const i0 = kids.indexOf(entry), after = kids.slice(i0 + 1).map(k => ({tag: k.tagName.toLowerCase(), cls: String(k.className)}));
  const text = kids.filter(k => !k.matches('section.ess')).map(k => k.innerText).join('\n'), dates = [...text.matchAll(/\d{1,2}월\s*\d{1,2}일/g)].map(m => m[0]), iso = [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m => m[0]), times = [...text.matchAll(/\d{1,2}:\d{2}/g)].map(m => m[0]); // 본질 세 줄 칸(받은 때 · 회사 수)은 따로 셈(2026-10-18 16:39 [5] 8 · 일꾼 KC — next_check 와 같음)
  const bandInfo = band ? {text: band.innerText.replace(/\s+/g, ' ').trim(), href: band.getAttribute('href'), ix: [...band.querySelectorAll('.hm-ix')].map(e => ({nm: e.querySelector('span')?.textContent, v: e.querySelector('b')?.textContent})), alerts: band.querySelectorAll('.m4-al').length, alertsOutside: v.querySelectorAll('.m4-al').length - band.querySelectorAll('.m4-al').length, topAlert: v.querySelectorAll('.m4-top').length, rowLines: [...band.querySelectorAll('.hm-row, .hm-ixs')].map(e => lines(e)), alertLines: [...band.querySelectorAll('.m4-al')].map(e => lines(e)), h: Math.round(band.getBoundingClientRect().height)} : null;
  const g = gdr ? {cls: String(gdr.className), h: Math.round(gdr.getBoundingClientRect().height), text: gdr.innerText.replace(/\s+/g, ' ').trim(), lines: lines(gdr.querySelector('a.gdr-l1, p.gdr-rest, a.gdr-today') || gdr), today: gdr.querySelector('a.gdr-today')?.textContent?.trim() ?? null, todayHref: gdr.querySelector('a.gdr-today')?.getAttribute('href') ?? null, todayLines: lines(gdr.querySelector('a.gdr-today')), l1Href: gdr.querySelector('a.gdr-l1')?.getAttribute('href') ?? null, l1Min: gdr.querySelector('a.gdr-l1') ? Math.round(gdr.querySelector('a.gdr-l1').getBoundingClientRect().height) : null} : null;
  const items = [...v.querySelectorAll('li.hm-it')].map(li => ({k: li.dataset.k, label: [...li.querySelectorAll('.hm-lb > span')].map(s => s.textContent), tag: li.querySelector('.hm-tag')?.textContent ?? null, nBig: li.querySelectorAll('.hm-big').length, big: li.querySelector('.hm-big')?.textContent ?? null, nWhy: li.querySelectorAll('.hm-why').length, why: li.querySelector('.hm-why')?.textContent ?? null, whyLines: lines(li.querySelector('.hm-why')), h: Math.round(li.getBoundingClientRect().height)}));
  const mkt = q('.hm-mkt'), tl = mkt ? mkt.querySelector('a[href="#/today"]') : null;
  const cards = [...v.querySelectorAll('.card')].map(c => c.innerText.replace(/\s+/g, ' ').slice(0, 60));
  return {entryAdj: !!entry && entry.nextElementSibling === band, entryBeforeBand: !!entry && !!band && !!(entry.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING), after, moreOpen: more ? more.open : null, hasSafe: !!safe,
    dates, iso, times, bandInfo, gdr: g, items, mktH: mkt ? Math.round(mkt.getBoundingClientRect().height) : null, mktLink: tl ? {href: tl.getAttribute('href'), text: tl.textContent.trim()} : null, nSumLi: mkt ? mkt.querySelectorAll('ul.hm-sum > li').length : 0,
    cards, nCard: v.querySelectorAll('.card').length, surgeWord: [...v.querySelectorAll('*')].filter(e => !e.closest('.chips') && [...e.childNodes].some(n => n.nodeType === 3 && /급등/.test(n.nodeValue))).length,
    oneDeng: /1등/.test(text), shareCtl: [...v.querySelectorAll('button,a,[role=button]')].filter(e => /보내기|공유|share|카톡|카카오/i.test((e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)),
    todayLoaded: !!document.querySelector('link[href*="p-today"]') || [...document.scripts].some(s => /p-today/.test(s.src)), hasChips: !!q('.chips'), text: text.slice(0, 4000)};
};
const CHIPROW = () => {
  const el = document.querySelector('.chips'); if (!el) return null;
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  return {mask: cs.maskImage || cs.webkitMaskImage || null, end: el.classList.contains('end'), scrollW: el.scrollWidth, clientW: el.clientWidth, scrollLeft: el.scrollLeft, top: Math.round(r.top), h: Math.round(r.height), role: el.getAttribute('role'),
    chips: [...el.querySelectorAll('a.chip')].map(a => ({t: a.textContent.trim(), href: a.getAttribute('href'), cur: a.getAttribute('aria-current'), h: Math.round(a.getBoundingClientRect().height)})), shelves: document.querySelectorAll('.shelf').length};
};
const HSCROLL = () => [...document.querySelectorAll('#view *')].filter(e => { const cs = getComputedStyle(e); return (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 2 && e.getClientRects().length; })
  .map(e => ({sel: e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/).join('.'), mask: getComputedStyle(e).maskImage, end: e.classList.contains('end')}));
/** 칩 쪽 짜임 */
const CHIPPAGE = () => {
  const v = document.querySelector('#view'), de = document.documentElement;
  const lines = el => { if (!el) return 0; const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top / 4))).size; };
  const ul = v.querySelector('ul.clist'), lis = ul ? [...ul.querySelectorAll(':scope > li')] : [], vis = lis.filter(li => li.getClientRects().length > 0);
  const cards = [...v.querySelectorAll('.card')], c0 = cards[0];
  const rows = vis.map(li => ({name: li.querySelector('.cn')?.textContent ?? null, pt: li.querySelector('.cp')?.textContent ?? null, link: li.querySelector('a.crow') ? li.querySelector('a.crow').getAttribute('href') : null, spark: !!li.querySelector('svg'), h: Math.round(li.getBoundingClientRect().height)}));
  const btns = [...v.querySelectorAll('button.more')].map(b => b.textContent.trim());
  const text = v.innerText;
  return {scrollH: de.scrollHeight, innerH: innerHeight, nCard: cards.length, nLi: lis.length, nVisRow: vis.length, nHidRow: lis.length - vis.length, nSpark: rows.filter(r => r.spark).length, nTap44: rows.filter(r => r.h >= 44).length, rows: rows.slice(0, 12), btns, notes: [...v.querySelectorAll('p.note')].map(p => p.textContent.trim()),
    big: c0 ? {big: c0.querySelector('.th .big, .th.num b')?.textContent ?? null, dur: c0.querySelector('.th .dur')?.textContent ?? null, title: c0.querySelector('.meta b')?.textContent ?? null, small: c0.querySelector('.meta small')?.textContent ?? null, half: c0.querySelector('.meta .half')?.textContent ?? null, h: Math.round(c0.getBoundingClientRect().height)} : null,
    cardTexts: cards.map(c => c.innerText.replace(/\s+/g, ' ').slice(0, 80)),
    shareCtl: [...v.querySelectorAll('button,a,[role=button]')].filter(e => /보내기|공유|share|카톡|카카오/i.test((e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || ''))).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)),
    oneDeng: /1등/.test(text), halfSentences: [...text.matchAll(/(\d+)곳 중 (\d+)곳이[^\n]*반값[^\n]*/g)].map(m => ({n: +m[1], half: +m[2], s: m[0]})), unknownNote: (text.match(/\?[^\n]*못 셌어요/) || [null])[0], text: text.slice(0, 3000)};
};
/** 갈아 끼운 한국어 가운데 영어 화면에 남은 한글 */
const hasHan = t => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(t);

/* ───────── 재기 ───────── */
const R = {meta: {base: BASE, at: new Date().toISOString(), node: process.version}, runs: {}, items: {}};
const put = (n, o) => { if (ONLY && !ONLY.has(n)) return; R.items[n] = o; log('item', n, o.verdict, '—', o.measured); };

/** 첫 화면 한 번(닫힘 → 더 보기 열기) — 칸 하나로 잼 */
async function homeRun(browser, key, {seed = null, route = null, tag = key, shotName = null} = {}) {
  const cfg = CFG[key], S = await open(browser, cfg, {seed, route, watch: true}), r = {key, tag};
  r.geomClosed = await S.page.evaluate(GEOM);
  r.homeClosed = await S.page.evaluate(HOME);
  r.textsClosed = await S.page.evaluate(TEXTS);
  r.scanClosed = await S.page.evaluate(SCAN);
  r.chipRow = await S.page.evaluate(CHIPROW);
  r.hscrollClosed = await S.page.evaluate(HSCROLL);
  await S.page.waitForTimeout(250);
  r.reqsClosed = S.reqs.map(x => ({...x}));
  if (shotName) await shot(S, shotName + '-closed');
  const n0 = S.reqs.length;
  try { await S.page.click('details.hm-more > summary', {timeout: 8000}); await S.page.waitForSelector('ul.hm-sum li', {timeout: 10000}).catch(() => {}); await settle(S.page, 900); } catch (e) { r.openErr = String(e.message).slice(0, 120); }
  r.geomOpen = await S.page.evaluate(GEOM);
  r.homeOpen = await S.page.evaluate(HOME);
  r.textsOpen = await S.page.evaluate(TEXTS);
  r.scanOpen = await S.page.evaluate(SCAN);
  r.hscrollOpen = await S.page.evaluate(HSCROLL);
  await S.page.waitForTimeout(250);
  r.reqsOpen = S.reqs.slice(n0).map(x => ({...x}));
  r.bigSeen = await S.page.evaluate(() => (window.__vhBig ? window.__vhBig() : null)).catch(() => null);
  r.errs = [...S.errs]; r.fails = [...S.fails];
  if (shotName) await shot(S, shotName + '-open');
  r.S = S; return r;
}

let H, M, C, K, SU, SUM, DAYS;
async function loadData() {
  [H, M, C, K, SU, SUM, DAYS] = await Promise.all([A('home.json'), A('mkt.json'), A('core.json'), A('cond.json'), A('surge.json'), J('/next/data/home-summary.json'), A('days.json')]);
  if (!H || !M || !C) { console.error('사이트 자료를 못 받음(서버 확인)'); process.exit(2); }
  // 잰 화면 코드가 어느 것인지(다른 일꾼이 고치는 중일 수 있어) — 서버가 내준 파일의 짧은 지문
  R.meta.served = await Promise.all(['/next/app.js', '/next/app.css', '/next/p-gdr.js', '/next/p-why.js', '/next/words.js', '/next/i18n.js', '/next/index.html'].map(async f => { try { const r = await fetch(BASE + f), b = Buffer.from(await r.arrayBuffer()); return f.split('/').pop() + ' ' + crypto.createHash('sha1').update(b).digest('hex').slice(0, 8) + ' ' + b.length + 'B'; } catch { return f + ' ?'; } }));
  R.meta.data = {home: H.kst, mktAsOf: M.asOf, coreMade: C.made, surgeKst: SU?.kst, summaryMade: SUM?.made, summarySrcHome: SUM?.src?.home, summaryFresh: !!(SUM && SUM.src?.home === H.kst)};
}
async function main() {
  await loadData();
  const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--disable-dev-shm-usage']});
  try {

    /* ── 첫 화면 세 번(한국어 360 · 390 · 영어 390) ── */
    for (const key of ['k390', 'k360', 'e390']) {
      if (!want(1, 2, 3, 4, 5, 7, 8, 10, 11, 12)) break;
      log('home', key);
      const r = await homeRun(browser, key, {shotName: key === 'k390' ? 'home-k390' : null});
      if (key === 'k390') {
        // 칩 줄 끝 흐림 — 화면 그림에서 오른쪽 끝 줄 밝기를 흐림 켠 것과 끈 것으로 맞댐
        const row = r.chipRow, clip = {x: CFG[key].w - 40, y: row.top, width: 40, height: row.h};
        const lum = async buf => r.S.page.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const bm = await createImageBitmap(new Blob([u], {type: 'image/png'})); const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d'); x.drawImage(bm, 0, 0); const d = x.getImageData(0, 0, bm.width, bm.height).data; const cols = []; for (let xx = 0; xx < bm.width; xx++) { let s = 0; for (let y = 0; y < bm.height; y++) { const i = (y * bm.width + xx) * 4; s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; } cols.push(Math.round(s / bm.height * 10) / 10); } return cols; }, buf.toString('base64'));
        try {
          await r.S.page.evaluate(() => window.scrollTo(0, 0));
          const a = await lum(await r.S.page.screenshot({clip}));
          await r.S.page.evaluate(() => document.querySelector('.chips').classList.add('end'));
          const b = await lum(await r.S.page.screenshot({clip}));
          await r.S.page.evaluate(() => document.querySelector('.chips').classList.remove('end'));
          const mean = (xs, n) => xs.slice(-n).reduce((s, x) => s + x, 0) / n;
          r.fadePixels = {fadedLast8: Math.round(mean(a, 8) * 10) / 10, plainLast8: Math.round(mean(b, 8) * 10) / 10, fadedFirst8: Math.round(a.slice(0, 8).reduce((s, x) => s + x, 0) / 8 * 10) / 10, plainFirst8: Math.round(b.slice(0, 8).reduce((s, x) => s + x, 0) / 8 * 10) / 10};
        } catch (e) { r.fadePixels = {err: String(e.message).slice(0, 100)}; }
        // 끝까지 밀면 흐림이 걷히나
        await r.S.page.evaluate(() => { const e = document.querySelector('.chips'); e.scrollLeft = e.scrollWidth; });
        await r.S.page.waitForTimeout(500);
        r.chipRowEnd = await r.S.page.evaluate(CHIPROW);
        await r.S.page.evaluate(() => { const e = document.querySelector('.chips'); e.scrollLeft = 0; });
        // 「오늘 시장 자세히」 → #/today
        try {
          await r.S.page.evaluate(() => { const d = document.querySelector('details.hm-more'); if (d && !d.open) d.open = true; });
          await r.S.page.click('.hm-mkt a[href="#/today"]', {timeout: 6000});
          await settle(r.S.page, 900);
          r.todayPage = await r.S.page.evaluate(() => ({hash: location.hash, scrollH: document.documentElement.scrollHeight, innerH: innerHeight, title: document.title, h1: (document.querySelector('#view h1, #view h2') || {}).textContent ?? null, len: document.querySelector('#view').innerText.length, bad: /그리지 못했어요/.test(document.querySelector('#view').innerText)}));
        } catch (e) { r.todayPage = {err: String(e.message).slice(0, 120)}; }
        r.errsAfter = [...r.S.errs];
      }
      if (key === 'e390') { r.reqsE = r.S.reqs.map(x => ({...x})); }
      R.runs['home-' + key] = r;
      await r.S.ctx.close(); delete r.S;
    }

    /* ── 칩 쪽 일곱(칸마다 새로 · 한국어 390×800) ── */
    const CHIPS = ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us'];
    if (want(5, 6, 8, 9, 10, 12)) for (const chip of CHIPS) {
      log('chip', chip);
      const S = await open(browser, CFG.k390, {hash: '#/f/' + chip, watch: true});
      const r = {chip};
      r.page0 = await S.page.evaluate(CHIPPAGE);
      r.texts = await S.page.evaluate(TEXTS);
      r.scan = await S.page.evaluate(SCAN);
      r.hscroll = await S.page.evaluate(HSCROLL);
      r.big0 = await S.page.evaluate(() => document.querySelector('#view .card .th .big, #view .card .th.num b')?.textContent ?? null);
      await S.page.waitForTimeout(1500);
      r.big1 = await S.page.evaluate(() => document.querySelector('#view .card .th .big, #view .card .th.num b')?.textContent ?? null);
      r.bigSeen = await S.page.evaluate(() => (window.__vhBig ? window.__vhBig() : null));
      await S.page.waitForTimeout(250);
      r.reqs = S.reqs.map(x => ({...x}));
      r.errs = [...S.errs];
      if (chip === 'surge') await shot(S, 'chip-surge');
      const btn = await S.page.$('#view button.more');
      if (btn) { await btn.click(); await S.page.waitForTimeout(300); r.page1 = await S.page.evaluate(CHIPPAGE); }
      R.runs['chip-' + chip] = r;
      await S.ctx.close();
    }

    /* ── 칩 일곱 · 영어(한 칸에서 칩을 차례로 — 남은 한글만 봄) ── */
    if (want(12)) {
      log('chips en');
      const S = await open(browser, CFG.e390, {hash: '#/f/rise'}), out = {};
      for (const chip of CHIPS) {
        await S.page.evaluate(h => { location.hash = h; }, '#/f/' + chip);
        await S.page.waitForFunction(h => document.querySelector('#view .chips a[aria-current="page"]')?.getAttribute('href') === h, '#/f/' + chip, {timeout: 20000}).catch(() => {});
        await settle(S.page, 700);
        out[chip] = {texts: await S.page.evaluate(TEXTS), scan: await S.page.evaluate(SCAN)};
      }
      R.runs['chips-en'] = out; R.runs['chips-en'].errs = [...S.errs];
      await S.ctx.close();
    }

    /* ── 요약 파일이 없을 때 · 옛것일 때 · 막힐 때(첫 화면이 그려지나) ── */
    if (want(10)) {
      const variants = {
        '404': route => route('**/next/data/home-summary.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})),
        abort: route => route('**/next/data/home-summary.json', r => r.abort()),
        stale: route => route('**/next/data/home-summary.json', async r => { const j = await (await r.fetch()).json(); j.src = {...j.src, home: 'x-stale'}; r.fulfill({json: j}); }),
      };
      for (const [name, set] of Object.entries(variants)) {
        log('summary variant', name);
        const r = await homeRun(browser, 'k390', {tag: 'sum-' + name, route: async page => { await set((pat, fn) => page.route(pat, fn)); }});
        r.drawnClosed = !!(r.homeClosed.bandInfo && r.homeClosed.after.some(a => /wy/.test(a.cls)) && r.homeClosed.gdr && !/그리지 못했어요/.test(r.homeClosed.text));
        r.drawnOpen = r.homeOpen.nSumLi === 3 && !/그리지 못했어요|나머지 칸/.test(r.homeOpen.text);
        R.runs['sum-' + name] = r; await r.S.ctx.close(); delete r.S;
      }
    }

    /* ── 보통 날(장 마감 · 값 제때 받음) · 큰 날 「!」 둘 — home.json 만 바꿔 끼움(요약 날은 그대로 새것) ── */
    if (want(1, 2)) {
      const close = j => { delete j.stale; j.live = false; for (const k of ['KOSPI', 'KOSDAQ']) if (j.idx?.[k]) j.idx[k].live = false; }; // 받은 때(kst)는 그대로 — 요약이 「새것」으로 남게
      const mut = {
        normal: j => { close(j); },
        alert: j => { close(j); j.alerts = [{kind: 'idx', name: '코스피', v: -5.4, why: 'big'}, {kind: 'idx', name: '코스닥', v: -4.36, why: 'usual'}]; },
      };
      for (const [name, f] of Object.entries(mut)) {
        log('home variant', name);
        const r = await homeRun(browser, 'k390', {tag: 'home-' + name, shotName: 'home-' + name, route: async page => { await page.route('**/atlas/data/home.json', async rt => { const j = await (await rt.fetch()).json(); f(j); rt.fulfill({json: j}); }); }});
        R.runs['home-' + name] = r; await r.S.ctx.close(); delete r.S;
      }
    }

    /* ── 넓은 화면(칩이 다 보이면 흐림이 없어야) ── */
    if (want(7)) {
      log('wide');
      const S = await open(browser, {w: 1280, h: 800, lang: 'ko'}, {hash: '#/'});
      R.runs['wide'] = {chipRow: await S.page.evaluate(CHIPROW), geom: await S.page.evaluate(GEOM)}; await S.ctx.close();
    }

    /* ── 오늘 매매일지를 끝낸 날(고도리 칸) · 쉬는 날 · 끝낸 날 + 고른 곳 3 · 8(흉내 — gdr.json 만 바꿔 끼움 · 지금 자료는 고른 곳 0) ── */
    if (want(1, 10, 11)) {
      const jseed = kind => ({arg: kind, fn: k => { try { const rec = {at: new Date().toISOString(), asOf: '2026-10-13', code: '005930', name: '삼성전자', price: 100000, day: null, answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: k === 'rest' ? 14 : 4, reds: 0, verdict: k === 'rest' ? '오늘은 쉬어 가자' : '좋아, 정해 둔 대로만', groups: {}, bigDay: null, why: '', promise: {sell: 90000, half: 120000, text: ''}, picks: []}; localStorage.setItem('atlas:godori-why', JSON.stringify([rec])); } catch { /* 기억 못 함 */ } }});
      for (const kind of ['go', 'rest']) {
        log('journal', kind);
        const r = await homeRun(browser, 'k390', {seed: jseed(kind), tag: 'journal-' + kind, shotName: 'journal-' + kind});
        R.runs['journal-' + kind] = r; await r.S.ctx.close(); delete r.S;
      }
      for (const n of [3, 8]) {
        log('journal + picks', n);
        const codes = (H.s365?.list || []).slice(0, n).map(x => x[0]);
        const picks = codes.map((c, i) => ({no: i + 1, code: c, name: '시험' + (i + 1), ind: '반도체', w: 3, price: 10000 + i, reason: null, wrong: '시험', saying: null, near: [], mc: null}));
        const r = await homeRun(browser, 'k390', {seed: jseed('go'), tag: 'journal-picks' + n, shotName: n === 3 ? 'journal-picks3' : null, route: async page => { await page.route('**/next/data/gdr.json', async rt => { const j = await (await rt.fetch()).json(); j.picks = picks; j.counts = {...j.counts, picked: n, cash: 100 - 3 * n}; rt.fulfill({json: j}); }); }});
        r.nCoFiles = [...r.reqsClosed, ...r.reqsOpen].filter(x => /\/co\//.test(x.url)).length;
        R.runs['journal-picks' + n] = r; await r.S.ctx.close(); delete r.S;
      }
    }

    /* ── 띠를 누르면 오늘 시장으로 가나 ── */
    if (want(2, 4)) {
      log('band click');
      const S = await open(browser, CFG.k390, {hash: '#/'});
      try { await S.page.click('a.hm-band', {timeout: 6000}); await settle(S.page, 900); R.runs['band-click'] = await S.page.evaluate(() => ({hash: location.hash, len: document.querySelector('#view').innerText.length, bad: /그리지 못했어요/.test(document.querySelector('#view').innerText)})); } catch (e) { R.runs['band-click'] = {err: String(e.message).slice(0, 100)}; }
      await S.ctx.close();
    }

    /* ── 다른 쪽에 옆으로 미는 칸 · 선반이 있나(있으면 오른쪽 끝 흐림이 있어야) ── */
    if (want(7)) {
      const out = {};
      for (const hash of ['#/today', '#/shorts', '#/cal', '#/cond', '#/surge', '#/why']) {
        log('scroll scan', hash);
        const S = await open(browser, CFG.k390, {hash});
        out[hash] = {shelf: await S.page.evaluate(() => document.querySelectorAll('.shelf').length), scrollers: await S.page.evaluate(HSCROLL)};
        await S.ctx.close();
      }
      R.runs['scroll-scan'] = out;
    }

    /* ── 칩 「달력」 · 「조건 찾기」를 눌러 열기 ── */
    if (want(7)) {
      for (const [name, rx, hashRx] of [['달력', /^달력$/, /^#\/cal/], ['조건 찾기', /^조건 찾기$/, /^#\/cond/]]) {
        log('chip click', name);
        const S = await open(browser, CFG.k390, {hash: '#/'}), r = {name};
        try {
          await S.page.locator('.chips a.chip', {hasText: rx}).first().click({timeout: 6000});
          await settle(S.page, 1200);
          r.after = await S.page.evaluate(() => ({hash: location.hash, title: document.title, h: (document.querySelector('#view h1, #view h2, #view .h') || {}).textContent ?? null, len: document.querySelector('#view').innerText.length, bad: /그리지 못했어요|여는 중이에요/.test(document.querySelector('#view').innerText), scrollH: document.documentElement.scrollHeight}));
          r.ok = hashRx.test(r.after.hash) && !r.after.bad && r.after.len > 80;
        } catch (e) { r.err = String(e.message).slice(0, 120); r.ok = false; }
        r.errs = [...S.errs]; R.runs['click-' + name] = r; await S.ctx.close();
      }
    }

    /* ── 급등 다섯 칸 쪽에 보내기 · 1등이 남았나(범위 밖 — 참고) · 시황 쪽 선반 ── */
    if (want(5, 7)) {
      for (const [name, hash] of [['surge-page', '#/surge'], ['shorts', '#/shorts']]) {
        log('extra', name);
        const S = await open(browser, CFG.k390, {hash}), r = {name};
        r.page = await S.page.evaluate(CHIPPAGE); r.hscroll = await S.page.evaluate(HSCROLL); r.shelves = await S.page.evaluate(() => document.querySelectorAll('.shelf').length);
        r.shareAll = await S.page.evaluate(() => [...document.querySelectorAll('#view button,#view a,#view [role=button]')].filter(e => /보내기|공유|share|카톡|카카오/i.test((e.textContent || '') + ' ' + (e.getAttribute('aria-label') || ''))).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)));
        r.oneDeng = await S.page.evaluate(() => /1등/.test(document.querySelector('#view').innerText));
        r.errs = [...S.errs]; R.runs['extra-' + name] = r; await S.ctx.close();
      }
    }
  } finally { await browser.close(); }
  await judge();
}

/* ───────── 판정(자료에서 다시 셈) ───────── */
async function judge() {
  const hk = R.runs['home-k390'], h360 = R.runs['home-k360'], he = R.runs['home-e390'];
  const OLD_WORDS = ['갈래', '몸값', '한 회사 한 표', '큰 회사는 크게', '20거래일', '다섯 문', '쉬는 돈', '챕터', '1등', '보드리', '아틀란스', 'ATLAS', 'Bodri'];
  let screenHits = () => [];
  try { const w = await import(pathToFileURL(path.join(ROOT, 'site/next/words.js')).href); screenHits = w.screenHits; } catch { /* 목록 없이 */ }

  /* 1 ─ 한 화면 */
  if (hk) {
    const rows = ['k390', 'k360', 'e390'].map(k => R.runs['home-' + k]).filter(Boolean).map(r => {
      const g = r.geomClosed, vis = g.tabTop, by = n => g.kids.find(k => k.cls.includes(n));
      const blocks = {band: by('hm-band'), wy: by('wy'), gdr: by('gdr'), more: by('hm-more'), safe: by('hm-safe')};
      const fits = Object.fromEntries(Object.entries(blocks).map(([n, b]) => [n, b ? b.bottom <= vis : null]));
      return {key: r.key, vw: g.innerW, vh: g.innerH, scrollH: g.scrollH, screens: Math.round(g.scrollH / g.innerH * 100) / 100, extra: g.scrollH - g.innerH, tabTop: vis, tabPos: g.tabPos, contentBottom: blocks.safe?.bottom ?? null, moreBottom: blocks.more?.bottom ?? null, fits, openH: r.geomOpen.scrollH, openScreens: Math.round(r.geomOpen.scrollH / g.innerH * 100) / 100, hOverflow: g.sw > g.innerW + 1};
    });
    const k = rows.find(x => x.key === 'k390');
    const jg = R.runs['journal-go'], jr = R.runs['journal-rest'];
    const done = jg ? {scrollH: jg.geomClosed.scrollH, screens: Math.round(jg.geomClosed.scrollH / jg.geomClosed.innerH * 100) / 100} : null;
    const strict = k.scrollH <= k.vh, blocksFit = k.fits.band && k.fits.wy && k.fits.gdr && k.fits.more;
    const states = ['home-normal', 'home-alert', 'journal-go', 'journal-rest', 'journal-picks3', 'journal-picks8'].map(n => R.runs[n]).filter(Boolean).map(r => ({name: r.tag, scrollH: r.geomClosed.scrollH, screens: Math.round(r.geomClosed.scrollH / r.geomClosed.innerH * 100) / 100, moreBottom: r.geomClosed.kids.find(x => /hm-more/.test(x.cls))?.bottom ?? null, tabTop: r.geomClosed.tabTop}));
    const stTxt = states.map(x => `${({'home-normal': '보통 날', 'home-alert': '큰 날 「!」 둘', 'journal-go': '오늘 일지 끝낸 날(고른 곳 0)', 'journal-rest': '쉬는 날', 'journal-picks3': '끝낸 날 + 고른 곳 3(흉내)', 'journal-picks8': '끝낸 날 + 고른 곳 8(흉내)'})[x.name]} ${x.scrollH}px(${x.screens}화면 · 더 보기 줄 끝 ${x.moreBottom}px ${x.moreBottom <= x.tabTop ? '≤' : '>'} 탭 막대 위 ${x.tabTop}px)`).join(' · ');
    put(1, {ask: '첫 화면은 한 화면(옛 9,572px · 12화면 · 390×800)', rows, states, doneToday: done, restToday: jr ? {scrollH: jr.geomClosed.scrollH} : null, strict, blocksFit,
      measured: `390×800 ${k.scrollH}px = ${k.screens}화면(넘는 ${k.extra}px) · 덩이 넷 접힌 줄까지 첫 화면 안 ${blocksFit ? '예' : '아니오'}(맨 끝 ${k.moreBottom}px ÷ 탭 막대 위 ${k.tabTop}px) · 360×640 ${rows.find(x => x.key === 'k360')?.scrollH}px = ${rows.find(x => x.key === 'k360')?.screens}화면 · 영어 390×640 ${rows.find(x => x.key === 'e390')?.scrollH}px = ${rows.find(x => x.key === 'e390')?.screens}화면 · 다른 상태 390×800: ${stTxt} · 더 보기 열면 ${k.openH}px = ${k.openScreens}화면`,
      verdict: strict ? 'PASS' : blocksFit ? 'PARTIAL' : 'FAIL'});
  }

  /* 2 ─ 띠 자리 · 날짜 한 번 · 꼬리표 */
  if (hk) {
    const c = hk.homeClosed, o = hk.homeOpen, bandDate = dd(H.idx?.KOSPI?.date ?? H.idx?.KOSDAQ?.date);
    const F = H.flows, fm = F?.KOSPI ? 'KOSPI' : F?.KOSDAQ ? 'KOSDAQ' : null;
    const blockDate = {br: M.asOf, fl: fm ? F[fm].date : null, us: H.us?.date ?? null};
    const items = (o.items || []).map(it => {
      const bd = dd(blockDate[it.k]), differs = !!bd && bd !== bandDate, hasTag = !!it.tag, n = calDiff(bd, bandDate);
      return {k: it.k, blockDate: bd, bandDate, differs, calDays: n, tag: it.tag, ok: differs === hasTag};
    });
    const tagWord = /^(하루|이틀|사흘|나흘|닷새|\d+일) 지난 값$|^더 새 값$/;
    const monthDay = c.dates.length, monthDayOpen = o.dates.length;
    const bl = b => (b?.rowLines || []).reduce((s, x) => s + x, 0), bandLines = bl(c.bandInfo);
    const nm = R.runs['home-normal'], al = R.runs['home-alert'];
    const alertTxt = al ? `큰 날 「!」 ${al.homeClosed.bandInfo?.alerts}개 중 띠 안 ${al.homeClosed.bandInfo?.alerts - (al.homeClosed.bandInfo?.alertsOutside ?? 0)} · 띠 밖 ${al.homeClosed.bandInfo?.alertsOutside} · .m4-top ${al.homeClosed.bandInfo?.topAlert}(띠 높이 ${al.homeClosed.bandInfo?.h}px)` : '큰 날 흉내 못 함';
    const alertOk = !al || (al.homeClosed.bandInfo?.alerts === 2 && al.homeClosed.bandInfo?.alertsOutside === 0 && al.homeClosed.bandInfo?.topAlert === 0);
    const bc = R.runs['band-click'], bcOk = !bc || (bc.hash === '#/today' && !bc.bad && bc.len > 200);
    const ok = c.entryAdj && monthDay === 1 && c.iso.length === 0 && items.length === 3 && items.every(x => x.ok) && (o.items || []).every(it => !it.tag || tagWord.test(it.tag)) && alertOk && bcOk;
    put(2, {ask: '띠는 「오늘의 이야기」 바로 밑 · 날짜는 띠에 한 번 · 날 다른 칸에만 꼬리표', entryAdjacent: c.entryAdj, bandText: c.bandInfo?.text, bandClick: bc ?? null, bandLines, bandH: c.bandInfo?.h, normalDayBand: nm?.homeClosed?.bandInfo ? {text: nm.homeClosed.bandInfo.text, lines: bl(nm.homeClosed.bandInfo), h: nm.homeClosed.bandInfo.h} : null, alertDay: al?.homeClosed?.bandInfo ?? null, datesClosed: c.dates, isoClosed: c.iso, datesOpen: o.dates, items,
      measured: `띠가 입구 바로 밑: ${c.entryAdj ? '예' : '아니오'} · 닫힌 첫 화면의 「월 일」 글 ${monthDay}번(${c.dates.join(' · ')}) · ISO 날짜 ${c.iso.length}번 · 더 보기 열면 ${monthDayOpen}번(${o.dates.join(' · ')}) · 꼬리표 ${items.map(x => `${x.k}: 자료 날 ${x.blockDate} ↔ 띠 날 ${x.bandDate} → ${x.tag ?? '없음'}${x.ok ? '' : ' (틀림)'}`).join(' · ')} · 띠를 누르면 ${bc ? (bc.err ? '못 눌렀음 ' + bc.err : bc.hash + '(글자 ' + bc.len + '자)') : '못 잼'} · 띠 글 ${bandLines}줄·${c.bandInfo?.h}px(사장님 예시는 한 줄) · 보통 날(마감) 띠 「${nm?.homeClosed?.bandInfo?.text ?? '?'}」 ${bl(nm?.homeClosed?.bandInfo)}줄 · ${alertTxt}`,
      verdict: ok ? (bandLines > 1 ? 'PARTIAL' : 'PASS') : 'FAIL'});
  }

  /* 3 ─ 세 덩이 + 닫힌 더 보기 · 같은 숫자 두 번 없음 */
  if (hk) {
    const c = hk.homeClosed, o = hk.homeOpen, a = c.after.map(x => x.tag + '.' + x.cls.split(' ')[0]);
    const blocks = c.after.filter(x => !/hm-more|hm-safe/.test(x.cls)), threeOk = blocks.length === 3 && /hm-band/.test(blocks[0].cls) && /wy/.test(blocks[1].cls) && /gdr/.test(blocks[2].cls);
    const nums = t => [...t.matchAll(/[+−-]?\d[\d,]*\.\d+%?|[+−-]?\d[\d,]*%|\d{1,3}(?:,\d{3})+/g)].map(m => m[0]);
    const cnt = {}; for (const n of nums(o.text)) cnt[n] = (cnt[n] || 0) + 1;
    const dup = Object.entries(cnt).filter(([, n]) => n > 1);
    put(3, {ask: '입구 밑은 세 덩이(한 줄 띠 · 친구야 왜 사? · 고도리 칸) + 닫힌 「더 보기」 · 같은 숫자 두 번 없음', afterEntry: a, moreOpenAtLoad: c.moreOpen, dupNumbers: dup,
      measured: `입구 밑 ${a.join(' → ')} · 덩이 ${blocks.length}개(${threeOk ? '띠 · 왜 사 · 고도리 칸' : '모양 다름'}) · 더 보기 처음 ${c.moreOpen ? '열림' : '닫힘'} · 열었을 때 같은 숫자가 두 번 보이는 것 ${dup.length ? dup.map(([n, k]) => n + '×' + k).join(', ') : '없음'}`,
      verdict: threeOk && c.moreOpen === false && !dup.length ? 'PASS' : 'FAIL'});
  }

  /* 4 ─ 시장은 세 줄 → #/today */
  if (hk) {
    const o = hk.homeOpen, t = hk.todayPage, tallest = Math.max(0, ...hk.geomOpen.kids.filter(k => !/hm-more/.test(k.cls)).map(k => k.h)), mktH = o.mktH;
    const lineN = (o.items || []).map(i => i.h);
    const todayReq = [...hk.reqsClosed, ...hk.reqsOpen].filter(x => /p-today/.test(x.url)).map(x => x.url);
    const ok = o.nSumLi === 3 && o.mktLink?.href === '#/today' && mktH != null && mktH < 600 && !todayReq.length && t && t.hash === '#/today' && !t.bad && t.len > 200;
    put(4, {ask: '오늘 시장(옛 3,768px)은 세 줄 요약 · 자세히는 #/today · 첫 화면에 큰 오늘 시장 덩이 없음', mktH, itemH: lineN, link: o.mktLink, todayPage: t, todayModuleRequests: todayReq,
      measured: `요약 ${o.nSumLi}줄(칸 높이 ${lineN.join('/')}px) · 오늘 시장 칸 전체 ${mktH}px(옛 3,768px) · 「${o.mktLink?.text}」 → ${o.mktLink?.href} · 누르면 ${t?.hash} 그려짐(글자 ${t?.len}자 · 쪽 높이 ${t?.scrollH}px · 오류글 ${t?.bad ? '있음' : '없음'}) · 첫 화면이 p-today 를 받음: ${todayReq.length ? '예' : '아니오'}`,
      verdict: ok ? 'PASS' : 'FAIL'});
  }

  /* 5 ─ 급등 카드 · 1등 · 보내기 */
  {
    const sg = R.runs['chip-surge'], ex = R.runs['extra-surge-page'], sh = R.runs['extra-shorts'];
    const otherSurgeCards = ['rise', 'lead', 'pick', 'group', 'ind', 'us'].map(c => R.runs['chip-' + c]).filter(Boolean).flatMap(r => r.page0.cardTexts.filter(t => /급등 칸/.test(t)).map(t => r.chip + ':' + t));
    const oneDengWhere = [['첫 화면 닫힘', hk?.homeClosed?.oneDeng], ['첫 화면 열림', hk?.homeOpen?.oneDeng], ...CHIPS_.map(c => ['칩 ' + c, R.runs['chip-' + c]?.page0?.oneDeng])].filter(([, v]) => v).map(([n]) => n);
    const shareWhere = [['첫 화면', hk?.homeOpen?.shareCtl], ['급등 칩', sg?.page0?.shareCtl]].filter(([, v]) => v?.length).map(([n, v]) => n + ':' + v.join('|'));
    const surgeCards = sg ? sg.page0.nCard : 0;
    const ok = !!sg && surgeCards >= 1 && hk.homeOpen.nCard === 0 && hk.homeOpen.surgeWord === 0 && hk.homeClosed.surgeWord === 0 && !otherSurgeCards.length && !oneDengWhere.length && !shareWhere.length;
    put(5, {ask: '급등 카드는 급등 칩 안에만 · 「1등」 말 · 급등 카드 보내기 없음', homeCards: [hk?.homeClosed?.nCard, hk?.homeOpen?.nCard], homeSurgeWords: [hk?.homeClosed?.surgeWord, hk?.homeOpen?.surgeWord], surgeChipCards: surgeCards, otherChipSurgeCards: otherSurgeCards, oneDengWhere, shareWhere,
      extraSurgePage: ex ? {share: ex.shareAll, oneDeng: ex.oneDeng} : null, extraShorts: sh ? {share: sh.shareAll, oneDeng: sh.oneDeng, cards: (sh.page?.text.match(/가운데 1등이에요/g) || []).length} : null,
      measured: `첫 화면(닫힘 · 열림) 카드 ${hk?.homeClosed?.nCard} · ${hk?.homeOpen?.nCard}장 · 칩 줄 밖 「급등」 글 ${hk?.homeClosed?.surgeWord} · ${hk?.homeOpen?.surgeWord}곳 · 급등 칩 큰 카드 ${surgeCards}장 · 다른 칩의 급등 카드 ${otherSurgeCards.length}장 · 「1등」이 보이는 곳 ${oneDengWhere.length ? oneDengWhere.join(', ') : '없음'} · 보내기 단추 ${shareWhere.length ? shareWhere.join(', ') : '없음'}${ex ? ` · (범위 밖 참고) #/surge 쪽 보내기 ${ex.shareAll.length ? ex.shareAll.join('|') : '없음'} · 1등 ${ex.oneDeng ? '있음' : '없음'}` : ''}${sh ? ` · (범위 밖 참고) #/shorts 쪽 보내기 ${sh.shareAll.length}개 · 「…가운데 1등이에요」 ${(sh.page?.text.match(/가운데 1등이에요/g) || []).length}번(업종 · 시장 사실 카드 · 급등 카드 아님)` : ''}`,
      verdict: ok ? 'PASS' : 'FAIL'});
  }

  /* 6 ─ 반값 n 다시 셈 */
  {
    const sg = R.runs['chip-surge'], mem = (SU?.members || []).filter(m => m && typeof m.c === 'string');
    const dates = DAYS?.dates || [], last = dates[dates.length - 1], y0 = last ? (+last.slice(0, 4) - 1) + last.slice(4) : null;
    const mdd = v => { let pk = 0, mm = 0; for (const x of v) { if (x > pk) pk = x; mm = Math.min(mm, x / pk - 1); } return mm; };
    const per = [];
    for (const m of mem) {
      const co = await A('co/' + m.c + '.json'), cl = Array.isArray(co?.close) ? co.close : [], k0 = Number.isInteger(co?.k0) ? co.k0 : null;
      const ser = cl.map((x, i) => [dates[(k0 ?? 0) + i], x]).filter(([d, x]) => d && x > 0);
      const cal = ser.filter(([d]) => d > y0 && d <= last).map(x => x[1]);
      const w = n => ser.slice(-n).map(x => x[1]);
      per.push({c: m.c, n: m.n, closes: ser.length, calN: cal.length, cal: cal.length >= 2 ? mdd(cal) : null, vsStart: cal.length >= 2 ? Math.min(...cal) / cal[0] - 1 : null, w250: ser.length >= 60 ? mdd(w(250)) : null, all: ser.length >= 2 ? mdd(ser.map(x => x[1])) : null, site: co?.c?.mdd1y ?? null});
    }
    const cnt = f => per.filter(f).length;
    const nStart = cnt(p => p.vsStart != null && p.vsStart <= -0.5), nCal = cnt(p => p.cal != null && p.cal <= -0.5), n250 = cnt(p => p.w250 != null && p.w250 <= -0.5), nSite = cnt(p => p.site != null && p.site <= -50);
    const unknown = per.filter(p => p.w250 == null).map(p => ({c: p.c, n: p.n, closes: p.closes, dropOnAllItsDays: p.all != null ? Math.round(p.all * 1000) / 10 : null}));
    const shown = sg?.page0.halfSentences || [], s0 = shown[0];
    const total = mem.filter(m => Number.isFinite(m.r5)).length;
    const okN = !!s0 && s0.half === nCal && s0.n === total && shown.every(x => x.half === s0.half && x.n === s0.n);
    put(6, {ask: '급등 칩 카드마다 「36곳 중 n곳이 1년 안에 반값 아래로 떨어진 적 있어요」 · n 은 자료에서 셈', shown, mine: {total, calendar1y: nCal, last250closes: n250, siteMdd1y: nSite, otherReadingVsPriceOneYearAgo: nStart}, unknown, where: {bigCardHalf: sg?.page0.big?.half ?? null, notes: sg?.page0.notes}, unknownNote: sg?.page0.unknownNote,
      measured: `화면 「${s0?.s ?? '?'}」 ${shown.length}번(큰 카드 + 위 알림 · 한 줄 목록 ${sg ? sg.page0.nVisRow : '?'}줄에는 없음) · 내가 종가 줄로 다시 셈: 달력 1년 ${nCal}곳 · 마지막 250거래일 ${n250}곳 · 사이트 mdd1y ≤ −50 ${nSite}곳(모두 36곳 중) · 다른 읽기(1년 전 값의 반값 아래로) ${nStart}곳 · 값이 모자란 곳 ${unknown.map(u => `${u.n}(${u.closes}일치 · 그 모든 날 가장 깊은 하락 ${u.dropOnAllItsDays}% → 반값 아래 아님)`).join(', ') || '없음'} · 화면의 「? n곳은 못 셌어요」 ${sg?.page0.unknownNote ?? '없음'}`,
      verdict: okN ? 'PASS' : 'FAIL'});
  }

  /* 7 ─ 흐림 · 선반 · 달력 · 조건 찾기 */
  if (hk) {
    const cr = hk.chipRow, ce = hk.chipRowEnd, px = hk.fadePixels, ok1 = R.runs['click-달력'], ok2 = R.runs['click-조건 찾기'];
    const fadeAt = c => (c ? {on: /gradient/.test(c.mask || '') && !c.end && c.scrollW > c.clientW, scrollW: c.scrollW, clientW: c.clientW} : null);
    const f360 = fadeAt(h360?.chipRow), fen = fadeAt(he?.chipRow), wide = R.runs['wide']?.chipRow ?? null;
    const wideOver = wide ? wide.scrollW > wide.clientW + 1 : null, wideOk = wide ? (wideOver ? /gradient/.test(wide.mask || '') && !wide.end : wide.end || !/gradient/.test(wide.mask || '')) : null;
    const names = cr.chips.map(c => c.t), hasCal = cr.chips.find(c => c.t === '달력'), hasCond = cr.chips.find(c => c.t === '조건 찾기');
    const fadeOn = /gradient/.test(cr.mask || '') && !cr.end && cr.scrollW > cr.clientW, fadeOff = ce && (ce.end || ce.mask === 'none') && /none/.test(ce.mask || 'none');
    const pixOk = px && !px.err ? (px.plainLast8 - px.fadedLast8) > 3 : null;
    const shelfPages = {home: cr.shelves, hscrollHome: hk.hscrollClosed, extraShorts: R.runs['extra-shorts']?.shelves ?? null};
    const ss = R.runs['scroll-scan'] || {}, ssBad = Object.entries(ss).flatMap(([h, v]) => (v.scrollers || []).filter(x => !/gradient/.test(x.mask || '') && !x.end).map(x => h + ' ' + x.sel)), ssShelf = Object.entries(ss).reduce((n, [, v]) => n + (v.shelf || 0), 0);
    const noMaskScrollers = [...(hk.hscrollClosed || []), ...(hk.hscrollOpen || [])].filter(s => !/gradient/.test(s.mask || '') && !s.end).concat(ssBad);
    const ok = fadeOn && fadeOff && pixOk !== false && (!f360 || f360.on) && (!fen || fen.on) && wideOk !== false && !!hasCal && !!hasCond && hasCal.href === '#/cal' && hasCond.href === '#/cond' && ok1?.ok && ok2?.ok && cr.chips.every(c => c.h >= 44) && !noMaskScrollers.length;
    put(7, {ask: '칩 줄 · 선반 오른쪽 끝 흐림 · 칩 「달력」 · 「조건 찾기」', fade360: f360, fadeEn: fen, wide: wide ? {scrollW: wide.scrollW, clientW: wide.clientW, end: wide.end, mask: wide.mask} : null, chips: names, mask: cr.mask, maskAtEnd: ce?.mask, endClass: ce?.end, pixels: px, shelfPages, scrollersWithoutFade: noMaskScrollers, scrollScan: ss, click: {달력: ok1, 조건: ok2},
      measured: `칩 ${names.length}개(${names.join(' · ')}) · 흐림 켜짐 ${fadeOn ? '예' : '아니오'}(${(cr.mask || '').slice(0, 60)}) · 끝까지 밀면 걷힘 ${fadeOff ? '예' : '아니오'} · 오른쪽 끝 40px 밝기 흐림 켠 것 ${px?.fadedLast8} ↔ 끈 것 ${px?.plainLast8}(${pixOk === null ? '못 잼' : pixOk ? '흐림이 실제로 보임' : '차이 없음'}) · 「달력」 ${hasCal ? hasCal.href : '없음'} → ${ok1?.after?.hash ?? ok1?.err} ${ok1?.ok ? '열림' : '안 열림'} · 「조건 찾기」 ${hasCond ? hasCond.href : '없음'} → ${ok2?.after?.hash ?? ok2?.err} ${ok2?.ok ? '열림' : '안 열림'} · 첫 화면과 칩 쪽에 「선반」 칸 ${cr.shelves}개(시황 선반은 첫 화면에서 뺌) · 흐림 없는 옆으로 미는 칸 ${noMaskScrollers.length}개(첫 화면 · 더 보기 · #/today · #/shorts · #/cal · #/cond · #/surge · #/why 에서 「선반」 ${ssShelf}개 · 옆으로 미는 칸 ${Object.values(ss).reduce((n, v) => n + (v.scrollers || []).length, 0)}개 훑음) · 360×640 흐림 ${f360 ? (f360.on ? '켜짐' : '꺼짐') + `(칩 줄 ${f360.scrollW}px ÷ 보이는 ${f360.clientW}px)` : '못 잼'} · 영어 390 흐림 ${fen ? (fen.on ? '켜짐' : '꺼짐') + `(${fen.scrollW}px ÷ ${fen.clientW}px)` : '못 잼'} · 1280px 넓은 화면 ${wide ? `칩 줄 ${wide.scrollW}px ÷ 보이는 ${wide.clientW}px(쪽 폭은 폰 폭 그대로) → 더 있으면 흐림 · 다 보이면 없음: ${wideOk ? '맞음' : '틀림'}` : '못 잼'}`,
      verdict: ok ? 'PASS' : 'FAIL'});
  }

  /* 8 ─ 큰 숫자 = 마지막 날 하루 값 + 까닭 한 줄 */
  if (hk) {
    const o = hk.homeOpen, items = Object.fromEntries((o.items || []).map(i => [i.k, i]));
    const co = M.companies, day = [];
    for (const [c, x] of Object.entries(co)) { const l = x?.l; if (Array.isArray(l) && l.length > 1) { const a = l[l.length - 2], b = l[l.length - 1]; if (a > 0 && b > 0) day.push([c, (b / a - 1) * 100]); } }
    const up = day.filter(([, x]) => r1(x) > 0).length, dn = day.filter(([, x]) => r1(x) < 0).length;
    const cap = new Map(); if (K?.co?.c && K.asOf === M.asOf) K.co.c.forEach((c, k) => { const v = K.co.cap?.[k]; if (Number.isFinite(v) && v > 0) cap.set(c, v); });
    const wr = day.filter(([c]) => cap.has(c)).sort((a, b) => cap.get(b[0]) - cap.get(a[0]) || a[0].localeCompare(b[0])), big = wr.slice(0, 100), small = wr.slice(100);
    const cntSide = xs => ({up: xs.filter(([, x]) => r1(x) > 0).length, dn: xs.filter(([, x]) => r1(x) < 0).length, eq: xs.reduce((s, [, x]) => s + x, 0) / (xs.length || 1)});
    const bs = cntSide(big), ss = cntSide(small), sDn = ss.dn > ss.up, nSmall = sDn ? ss.dn : ss.up, bk = Math.abs(bs.eq) < 0.05 ? 0 : Math.sign(bs.eq);
    const e1 = {big: nk(dn > up ? dn : up) + '곳', label: dn > up ? '내린 회사' : '오른 회사'};
    const wBr = items.br?.why || '', mS = /작은 회사 ([\d,]+)곳(?:이|은) (올랐|내렸)/.exec(wBr), mB = /큰 회사(?:도|는) (올랐|내렸|거의 그대로)/.exec(wBr);
    const brOk = items.br?.big === e1.big && items.br.label[0] === e1.label && !!mS && mS[1] === nk(nSmall) && mS[2] === (sDn ? '내렸' : '올랐') && !!mB && mB[1] === (bk === 0 ? '거의 그대로' : bk < 0 ? '내렸' : '올랐');
    const F = H.flows, fm = F?.KOSPI ? 'KOSPI' : F?.KOSDAQ ? 'KOSDAQ' : null, x0 = fm ? F[fm] : null, who = x0 ? [['개인', x0.personal], ['외국인', x0.foreign], ['기관', x0.institutional]].filter(w => Number.isFinite(w[1])) : [];
    const bigW = [...who].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0], sell = [...who].sort((a, b) => a[1] - b[1])[0], buy = [...who].sort((a, b) => b[1] - a[1])[0];
    const flBig = bigW ? eokH(bigW[1]) : '?', wFl = items.fl?.why || '';
    const flOk = !!bigW && items.fl?.big === flBig && items.fl.label.join(' ').includes(bigW[1] < 0 ? '판 돈' : '산 돈') && items.fl.label.join(' ').includes(bigW[0]) && (sell[1] < 0 && buy[1] > 0 ? wFl.startsWith(sell[0]) && wFl.includes('판 것을') && new RegExp(buy[0] + '.? 샀어요').test(wFl) : /셋 모두/.test(wFl));
    const by = Object.fromEntries((H.us?.rows || []).map(r => [r.key, r])), three = ['INX', 'IXIC', 'DJI'].map(k => by[k]).filter(Boolean), upN = three.filter(r => r.chg > 0).length;
    const usBig = three[0] ? p2(three[0].chg) : '?', usWhy = three.length === 3 ? (upN === 3 ? '세 지수 모두 올랐어요' : upN === 0 ? '세 지수 모두 내렸어요' : `세 지수 가운데 ${upN}개가 올랐어요`) : '';
    const usOk = items.us?.big === usBig && items.us.why === usWhy && items.us.label.join(' ').includes(three[0]?.name);
    const kp = H.idx?.KOSPI?.rows, kq = H.idx?.KOSDAQ?.rows, dpct = rows => rows && rows.length > 1 ? (rows[rows.length - 1][1] / rows[rows.length - 2][1] - 1) * 100 : null;
    const bandTxt = hk.homeClosed.bandInfo, bk1 = bandTxt?.ix?.find(i => i.nm === '코스피')?.v, bk2 = bandTxt?.ix?.find(i => i.nm === '코스닥')?.v;
    const bandOk = bk1 === p2(+dpct(kp).toFixed(2)) && bk2 === p2(+dpct(kq).toFixed(2));
    const oneEach = (o.items || []).length === 3 && (o.items || []).every(i => i.nBig === 1 && i.nWhy === 1);
    // 칩 큰 카드 — 큰 숫자가 기간 값인가 하루 값인가
    const cards = ['rise', 'group', 'ind', 'surge', 'lead', 'pick', 'us'].map(c => { const r = R.runs['chip-' + c]; return r ? {chip: c, big: r.page0.big?.big, dur: r.page0.big?.dur ?? null, stable: r.big0 === r.big1} : null; }).filter(Boolean);
    const periodBig = cards.filter(c => c.dur && c.dur !== '하루');
    const flicker = [];
    for (const c of ['rise', 'group', 'ind', 'surge', 'lead', 'pick', 'us']) { const r = R.runs['chip-' + c], bs = r?.bigSeen?.card0 ?? null; if (bs && bs.length > 1) flicker.push(c + ': ' + bs.map(x => x.t + '@' + x.at + 'ms').join(' → ')); }
    for (const key of ['home-k390', 'home-k360']) { const bs = R.runs[key]?.bigSeen; if (bs) for (const [k, a] of Object.entries(bs)) if (a.length > 1) flicker.push(key + ' ' + k + ': ' + a.map(x => x.t + '@' + x.at + 'ms').join(' → ')); }
    const watchedChips = ['rise', 'group', 'ind', 'surge', 'lead', 'pick', 'us'].filter(c => R.runs['chip-' + c]?.bigSeen?.card0?.length >= 1).length;
    const s0 = SU?.members?.[0];
    put(8, {ask: '묶음마다 큰 숫자 하나 = 마지막 날 하루 값 + 까닭 한 줄 · 기간 숫자는 작게', blocks: {br: {shown: items.br, mine: {up, dn, big: e1.big, label: e1.label, nSmall, smallDir: sDn ? '내렸' : '올랐', bigDir: bk === 0 ? '거의 그대로' : bk < 0 ? '내렸' : '올랐', ok: brOk}}, fl: {shown: items.fl, mine: {big: flBig, who: bigW, sell, buy, ok: flOk}}, us: {shown: items.us, mine: {big: usBig, why: usWhy, ok: usOk}}}, band: {shown: [bk1, bk2], mine: [p2(+dpct(kp).toFixed(2)), p2(+dpct(kq).toFixed(2))], ok: bandOk}, oneBigOneWhy: oneEach, whyLines: (o.items || []).map(i => i.whyLines), chipBigCards: cards, flicker, watchedChips, firstBigAt: Object.fromEntries(['rise', 'group', 'ind', 'surge', 'lead', 'pick', 'us'].map(c => [c, R.runs['chip-' + c]?.bigSeen?.card0?.[0] ?? null])),
      measured: `띠 ${bandOk ? '맞음' : '틀림'}(코스피 ${bk1} · 코스닥 ${bk2}) · ① 회사 수 화면 「${items.br?.big}」 ↔ 내가 셈 ${e1.big}(오른 ${nk(up)} · 내린 ${nk(dn)}) ${brOk ? '맞음' : '틀림'} · 까닭 숫자 ${mS?.[1]} ↔ ${nk(nSmall)} · ② 사고팔기 화면 「${items.fl?.big}」 ↔ ${flBig} ${flOk ? '맞음' : '틀림'} · ③ 미국 화면 「${items.us?.big}」 ↔ ${usBig} ${usOk ? '맞음' : '틀림'} · 묶음마다 큰 숫자 1 · 까닭 1 = ${oneEach ? '예' : '아니오'}(까닭 줄 수 ${(o.items || []).map(i => i.whyLines).join('/')}) · 칩 큰 카드 큰 숫자 중 기간 값 ${periodBig.length}/${cards.length}(${periodBig.map(c => c.chip + ' ' + c.big + '/' + c.dur).join(', ')}) — 예: 급등 첫 카드 큰 숫자 ${cards.find(c => c.chip === 'surge')?.big}(5일) · 그 회사 마지막 하루는 ${s0 ? '+' + s0.d1 + '%' : '?'} · 그려지는 동안 큰 숫자가 바뀐 곳 ${flicker.length ? flicker.join(' / ') : `없음(칩 ${watchedChips}곳 · 한국어 첫 화면 둘을 열리자마자 지켜봄 · 영어는 한국어 → 영어 바꿔치기 때문에 뺌)`}`,
      verdict: brOk && flOk && usOk && bandOk && oneEach && !flicker.length ? (periodBig.length ? 'PARTIAL' : 'PASS') : 'FAIL'});
  }

  /* 9 ─ 칩 목록 10줄 + 나머지 n곳 */
  {
    const surgeMiss = new Set(SUM?.chips?.surge?.miss || []), co = M.companies || {};
    const exp = {
      rise: (C.rise?.list || []).length, group: (C.groups || []).length, ind: (C.industries || []).length,
      surge: (SU?.members || []).filter(m => m && !surgeMiss.has(m.c) && Number.isFinite(m.r5)).length,
      lead: K && K.asOf === M.asOf ? K.co.c.filter((c, k) => K.co.rk?.[k] === 1 && co[c] && Array.isArray(K.co.l5?.[k]) && Number.isFinite(K.co.r5?.[k])).length : null,
      pick: (H.s365?.list || []).filter(([c]) => co[c]).length, us: (H.us?.rows || []).length,
    };
    const rows = [];
    for (const c of ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us']) {
      const r = R.runs['chip-' + c]; if (!r) continue;
      const p = r.page0, total = exp[c], visible = p.nCard + p.nVisRow, wantRest = Math.max(0, total - 11), btn = p.btns.find(b => /나머지/.test(b)), shownRest = btn ? +(btn.match(/[\d,]+/)?.[0] || '').replace(/,/g, '') : 0;
      const p1 = r.page1, after = p1 ? p1.nCard + p1.nVisRow : null;
      const named = p.rows.filter(x => x.name && x.pt).length, sparkOf = p.rows.filter(x => x.spark).length;
      rows.push({chip: c, total, bigCards: p.nCard, oneLineRows: p.nVisRow, visible, rest: shownRest, wantRest, afterClick: after, scrollH: p.scrollH, screens: Math.round(p.scrollH / p.innerH * 100) / 100, withNameAndPct: named + '/' + p.rows.length, withSpark: p.nSpark + '/' + p.nVisRow, sparkMissing: p.nVisRow - p.nSpark, tap44: p.nTap44 + '/' + p.nVisRow,
        ok: p.nVisRow <= 10 && p.nCard === 1 && shownRest === wantRest && (after == null ? true : after === total) && (total <= 11 ? !btn : true), rowH: [...new Set(p.rows.map(x => x.h))]});
    }
    const bad = rows.filter(x => !x.ok);
    put(9, {ask: '칩 목록은 한 줄 목록 10개까지 + 「나머지 n곳 보기」(큰 카드는 하나만)', rows,
      measured: rows.map(x => `${x.chip}: 자료 ${x.total}곳 → 큰 카드 ${x.bigCards} + 한 줄 ${x.oneLineRows}(보이는 ${x.visible} · 줄마다 작은 선 ${x.withSpark} · 높이 44px 이상 ${x.tap44}) · 단추 「나머지 ${x.rest}곳」 ↔ 셈 ${x.wantRest}${x.afterClick != null ? ` · 누르면 ${x.afterClick}곳` : ''} · ${x.screens}화면(${x.scrollH}px)${x.ok ? '' : ' 틀림'}`).join(' / '),
      verdict: bad.length ? 'FAIL' : rows.some(x => x.sparkMissing > 0) ? 'PARTIAL' : 'PASS'});
  }

  /* 10 ─ 망 요청 */
  if (hk) {
    const sumBytes = (hk.reqsClosed.find(x => /home-summary\.json/.test(x.url)) || {}).bytes;
    const tot = rs => rs.reduce((s, x) => s + (x.bytes || 0), 0), fonts = hk.reqsClosed.filter(x => /\/fonts\//.test(x.url));
    const bigData = hk.reqsClosed.filter(x => isData(x.url) && /(mkt|cond|core|surge)\.json/.test(x.url)), openData = hk.reqsOpen.filter(x => isData(x.url));
    const needs = {rise: ['core.json'], group: ['core.json'], ind: ['core.json'], surge: ['surge.json', 'home-summary.json'], lead: ['cond.json', 'mkt.json'], pick: ['home.json', 'mkt.json'], us: ['home.json']};
    const chipData = {}; let chipOk = true;
    for (const [c, ok] of Object.entries(needs)) { const r = R.runs['chip-' + c]; if (!r) continue; const got = r.reqs.filter(x => isData(x.url)).map(x => x.url.split('/').pop().split('?')[0]); const extra = got.filter(g => !ok.includes(g)); chipData[c] = {got, extra}; if (extra.length) chipOk = false; }
    const brOf = r => (r?.homeOpen?.items || []).find(i => i.k === 'br')?.big ?? null;
    const variants = ['404', 'abort', 'stale'].map(n => R.runs['sum-' + n]).filter(Boolean).map(r => ({name: r.tag, closedDrawn: r.drawnClosed, openDrawn: r.drawnOpen, h: r.geomClosed.scrollH, openH: r.geomOpen.scrollH, openReqData: r.reqsOpen.filter(x => isData(x.url)).map(x => x.url.split('/').pop() + ' ' + kb(x.bytes)), br: brOf(r), items: (r.homeOpen.items || []).length, errs: r.errs.filter(e => !/Failed to load resource/.test(e)).slice(0, 3)}));
    const jg = R.runs['journal-go'];
    const byType = rs => { const o = {}; for (const x of rs) { const t = x.type || '?'; (o[t] = o[t] || {n: 0, bytes: 0}); o[t].n++; o[t].bytes += x.bytes || 0; } return o; };
    const topFiles = rs => [...rs].sort((a, b) => (b.bytes || 0) - (a.bytes || 0)).slice(0, 5).map(x => `${x.url.split('?')[0].split('/').slice(-2).join('/')} ${kb(x.bytes)}`);
    const brHome = brOf(hk);
    const homeJ = hk.reqsClosed.filter(x => /home\.json|gdr\.json|home-summary/.test(x.url)).map(x => `${x.url.split('/').pop()} ${kb(x.bytes)}`);
    const ok = sumBytes != null && sumBytes <= 8192 && !bigData.length && !openData.some(x => /(mkt|cond|core|surge)\.json/.test(x.url)) && chipOk && variants.every(v => v.closedDrawn && v.openDrawn);
    put(10, {ask: '첫 화면은 작은 요약 · home 파일만 받고 mkt · cond 는 칩이 필요할 때만 · 요약이 없어도 그려짐', requestsClosed: hk.reqsClosed, requestsAfterOpen: hk.reqsOpen, requestsDoneToday: jg ? jg.reqsClosed : null, byTypeClosed: byType(hk.reqsClosed), topFilesClosed: topFiles(hk.reqsClosed), byTypeOpen: byType(hk.reqsOpen), chipData, variants, totalBytesClosed: tot(hk.reqsClosed), fontBytes: tot(fonts), summaryBytes: sumBytes,
      measured: `닫힌 첫 화면 요청 ${hk.reqsClosed.length}개 · 받은 글자 ${kb(tot(hk.reqsClosed))}(글꼴 ${fonts.length}개 ${kb(tot(fonts))}) · 자료 ${homeJ.join(' · ')} · 요약 ${sumBytes}B(≤ 8KB ${sumBytes <= 8192 ? '예' : '아니오'}) · 첫 화면의 mkt · cond · core · surge 요청 ${bigData.length}개 · 더 보기 열 때 자료 요청 ${openData.length}개 · 칩마다 받은 자료 ${Object.entries(chipData).map(([c, v]) => c + '=' + v.got.join('+')).join(' ')}${chipOk ? '(필요한 것만)' : '(남는 것: ' + Object.entries(chipData).map(([c, v]) => v.extra.length ? c + ':' + v.extra.join('+') : '').filter(Boolean).join(',') + ')'} · 오늘 일지를 끝낸 날 첫 화면 자료 ${jg ? jg.reqsClosed.filter(x => isData(x.url)).map(x => x.url.split('/').pop() + ' ' + kb(x.bytes)).join(' + ') : '못 잼'}${R.runs['journal-picks3'] ? `(고른 곳이 있다고 흉내 내면 회사 파일 3곳 → ${R.runs['journal-picks3'].nCoFiles}개 · 8곳 → ${R.runs['journal-picks8']?.nCoFiles}개 더 받음)` : ''} · 종류별 ${Object.entries(byType(hk.reqsClosed)).map(([t, v]) => `${t} ${v.n}개 ${kb(v.bytes)}`).join(' · ')} · 가장 큰 것 ${topFiles(hk.reqsClosed).slice(0, 3).join(', ')} · 요약 없을 때 ${variants.map(v => `${v.name} 닫힘 ${v.closedDrawn ? '그려짐' : '못 그림'}·열림 ${v.openDrawn ? '그려짐' : '못 그림'}(열 때 받은 자료 ${v.openReqData.join('+') || '없음'} · 「회사 수」 큰 숫자 ${v.br} ↔ 요약이 있을 때 ${brHome})`).join(' · ')}`,
      verdict: ok ? 'PASS' : 'FAIL'});
  }

  /* 11 ─ 잠긴 고도리 칸 한 줄 · 오늘 점수 · 다시 하기 */
  if (hk) {
    const lock = hk.homeClosed.gdr, jg = R.runs['journal-go'], jr = R.runs['journal-rest'];
    const g = jg?.homeClosed?.gdr, rr = jr?.homeClosed?.gdr;
    const l360 = h360?.homeClosed?.gdr, len = he?.homeClosed?.gdr;
    const lockOk = /lock1/.test(lock?.cls || '') && lock.lines === 1 && lock.h <= 64 && (!l360 || l360.lines === 1), todayOk = !!g?.today && /오늘 점수/.test(g.today) && /다시 하기/.test(g.today) && g.todayHref === '#/why' && g.todayLines === 1;
    const boxOpen = g && g.h > 80;
    put(11, {ask: '잠긴 고도리 칸(옛 215px)은 한 줄 · 오늘 매매일지를 끝냈으면 「오늘 점수 · 다시 하기」 한 줄', locked: lock, locked360: l360, lockedEn: len, doneToday: g, restToday: rr, doneWithPicks: ['journal-picks3', 'journal-picks8'].map(n => R.runs[n]).filter(Boolean).map(r => ({name: r.tag, scrollH: r.geomClosed.scrollH, gdrH: r.homeClosed.gdr?.h, coFiles: r.nCoFiles, dataReqs: r.reqsClosed.filter(x => isData(x.url)).map(x => x.url.split('/').pop())})),
      measured: `잠긴 칸 높이 ${lock?.h}px(옛 215px) · 글 ${lock?.lines}줄 「${lock?.text}」 → ${lock?.l1Href} · 오늘 일지를 끝낸 날: 칸 「${g?.today ?? '없음'}」(${g?.todayLines ?? '?'}줄 → ${g?.todayHref}) · 칸 전체 높이 ${g?.h}px(맨 위 한 줄 아래로 고도리 칸이 열려 있음 — 이 자료는 고른 곳 0) · 쉬는 날 「${rr?.text ?? '없음'}」(${rr?.h}px) · 360×640 잠긴 칸 ${l360?.lines}줄 ${l360?.h}px · 영어 390×640 잠긴 칸 「${len?.text}」 ${len?.lines}줄 ${len?.h}px${boxOpen ? ` · 끝낸 날은 「오늘 점수」 줄이 있고 그 밑 고도리 칸이 그대로 열려 첫 화면 ${R.runs['journal-go']?.geomClosed?.scrollH}px(고른 곳 0인데도) · 고른 곳이 있다고 흉내 내면 3곳 ${R.runs['journal-picks3']?.geomClosed?.scrollH}px · 8곳 ${R.runs['journal-picks8']?.geomClosed?.scrollH}px(칸 ${R.runs['journal-picks3']?.homeClosed?.gdr?.h}px · ${R.runs['journal-picks8']?.homeClosed?.gdr?.h}px) · 그때 첫 화면이 받는 회사 파일 ${R.runs['journal-picks3']?.nCoFiles}개 · ${R.runs['journal-picks8']?.nCoFiles}개` : ''}`,
      verdict: lockOk && todayOk ? (boxOpen ? 'PARTIAL' : 'PASS') : lockOk ? 'PARTIAL' : 'FAIL'});
  }

  /* 12 ─ 글씨 · 간격 · 옛 말 · 영어에 한국어 */
  {
    const pages = [];
    const add = (name, texts, scan, en) => pages.push({name, texts, scan, en});
    if (hk) { add('첫 화면 닫힘 390×800', hk.textsClosed, hk.scanClosed, false); add('첫 화면 열림 390×800', hk.textsOpen, hk.scanOpen, false); }
    if (h360) { add('첫 화면 닫힘 360×640', h360.textsClosed, h360.scanClosed, false); add('첫 화면 열림 360×640', h360.textsOpen, h360.scanOpen, false); }
    if (he) { add('첫 화면 닫힘 영어 390×640', he.textsClosed, he.scanClosed, true); add('첫 화면 열림 영어 390×640', he.textsOpen, he.scanOpen, true); }
    for (const c of ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us']) { const r = R.runs['chip-' + c]; if (r) add('칩 ' + c + ' 390×800', r.texts, r.scan, false); }
    const ce = R.runs['chips-en']; if (ce) for (const c of ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us']) if (ce[c]) add('칩 ' + c + ' 영어 390×640', ce[c].texts, ce[c].scan, true);
    const small = [], sizes = [], spacingBad = [], negs = [], oldHits = [], han = [], gapsAll = {};
    for (const p of pages) {
      const sm = p.scan.small; if (sm.length) small.push({page: p.name, n: sm.length, ex: sm.slice(0, 4).map(x => `${x.fs}px ${x.sel}「${x.txt}」`)});
      sizes.push({page: p.name, all: p.scan.fonts.map(f => f.fs), nAll: p.scan.fonts.length, nView: p.scan.fonts.filter(f => f.nView > 0).length});
      if (p.scan.bad.length) spacingBad.push({page: p.name, total: p.scan.badTotal, ex: p.scan.bad.slice(0, 6).map(b => `${b.sel} ${b.p} ${b.v}px×${b.n}`)});
      if (p.scan.neg.length) negs.push({page: p.name, ex: p.scan.neg.slice(0, 5).map(b => `${b.sel} ${b.p} ${b.v}px×${b.n}`)});
      for (const g of p.scan.gaps) { const k = p.name.split(' ')[0] + ' ' + g.in; gapsAll[k] = gapsAll[k] || new Set(); gapsAll[k].add(g.g); }
      const own = p.texts.filter(t => !t.proper);
      if (!p.en) { const hits = []; for (const t of own) { for (const w of OLD_WORDS) if (t.t.includes(w)) hits.push(`${w}「${t.t.slice(0, 24)}」`); const sh = screenHits(t.t); if (sh?.length) hits.push('쓰지 않을 말:' + sh.join(',') + `「${t.t.slice(0, 20)}」`); } if (hits.length) oldHits.push({page: p.name, hits: [...new Set(hits)].slice(0, 8)}); }
      else { const hits = []; for (const t of own) { if (t.ko) continue; if (t.attr === 'html.lang') { if (t.t !== 'en') hits.push('html lang=' + t.t); continue; } if (hasHan(t.t)) hits.push(`${t.attr ? '[' + t.attr + '] ' : ''}${t.t.slice(0, 40)}`); } if (hits.length) han.push({page: p.name, hits: [...new Set(hits)].slice(0, 10)}); }
    }
    const svgTextN = pages.reduce((n, p) => n + (p.scan.svgText?.length || 0), 0);
    const homeSizes = sizes.filter(s => /^첫 화면/.test(s.page)), max = Math.max(...sizes.map(s => s.nAll)), maxHome = Math.max(0, ...homeSizes.map(s => s.nAll));
    const gapSets = Object.fromEntries(Object.entries(gapsAll).map(([k, v]) => [k, [...v].sort((a, b) => a - b)]));
    const badGaps = Object.entries(gapSets).filter(([, v]) => v.some(x => ![0, 8, 16, 24].includes(x)));
    // 쪽 맨 아래 「footer.foot」 아래 틈 92px 는 아래 탭 막대(고정)가 가리는 만큼 비우는 틈 — 글 사이 간격이 아니라 따로 적음
    const tabClear = [], spacingBad2 = [];
    for (const sp of spacingBad) { const ex = sp.ex.filter(e => !/^footer\.foot padding-bottom 92px/.test(e)), cl = sp.ex.length - ex.length; if (cl) tabClear.push(sp.page); const rest = sp.total - cl; if (rest > 0 || ex.length) spacingBad2.push({...sp, total: rest, ex}); }
    const ok = !small.length && maxHome <= 6 && !spacingBad2.length && !negs.length && !oldHits.length && !han.length;
    const parts = {under17: !small.length, sizesLe6Home: maxHome <= 6, spacing81624: !spacingBad2.length && !tabClear.length, spacingExceptTabClearance: !spacingBad2.length, noNegative: !negs.length, noOldWords: !oldHits.length, noKoreanInEnglish: !han.length};
    put(12, {ask: '17px 아래 글 0 · 글씨 여섯 가지까지 · 간격 8 · 16 · 24 · 음수 간격 없음 · 옛 말 없음 · 영어 화면에 한국어 없음', parts, small, sizes, spacingBad, spacingBadWithoutTabClearance: spacingBad2, tabClearancePages: tabClear.length, svgTextN, negs, oldHits, han, gapSets, badGaps, skippedHangulCount: pages.reduce((n, p) => n + (p.en ? p.texts.filter(t => !t.proper && t.ko).length : 0), 0),
      measured: `17px 아래 글 ${small.length ? small.map(s => `${s.page} ${s.n}곳`).join(' / ') : '0곳'} · 글씨 크기 가짓수 첫 화면 ${homeSizes.map(s => s.page.replace('첫 화면 ', '') + '=' + s.nAll).join(' · ')}(가장 많은 쪽 ${max}) · 그림 안 글(svg text) ${svgTextN}개 · 8 · 16 · 24 밖 간격 ${spacingBad2.length ? spacingBad2.map(s => `${s.page} ${s.total}곳 예 ${s.ex.slice(0, 3).join(', ')}`).join(' / ') : '0곳'}${tabClear.length ? ` (그 밖에 모든 쪽 ${tabClear.length}군데에서 쪽 맨 아래 「footer.foot」 아래 틈 92px 1곳 — 아래 탭 막대 가림 틈이라 글 사이 간격은 아님 · 8 · 16 · 24 가 아니라는 것은 사실)` : ''} · 음수 간격 ${negs.length ? negs.map(s => s.page + ' ' + s.ex.join(',')).join(' / ') : '0곳'} · 덩이 사이 눈에 보이는 간격 ${Object.entries(gapSets).map(([k, v]) => k + '=[' + v.join(',') + ']').join(' ')} · 옛 말 ${oldHits.length ? oldHits.map(s => s.page + ' ' + s.hits.join(',')).join(' / ') : '0곳'} · 영어에 남은 한국어 ${han.length ? han.map(s => s.page + ' ' + s.hits.join(' | ')).join(' / ') : '0곳'}`,
      verdict: ok ? (tabClear.length ? 'PARTIAL' : 'PASS') : 'FAIL'});
  }
}
const CHIPS_ = ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us'];

/* ───────── 끝 ───────── */
let code = 0;
const FROM = opt('--from', null);
try {
  if (FROM) { const saved = JSON.parse(fs.readFileSync(FROM, 'utf8')); R.runs = saved.runs; R.meta = {...saved.meta, rejudged: new Date().toISOString()}; await loadData(); await judge(); }
  else await main();
} catch (e) { console.error('검사를 못 함:', e); code = 2; }
if (code === 0) {
  const order = Object.keys(R.items).map(Number).sort((a, b) => a - b);
  console.log('\n번호 | 사장님 말씀 | 잰 것 | 판정');
  for (const n of order) { const it = R.items[n]; console.log(`${n} | ${it.ask} | ${it.measured} | ${it.verdict}`); }
  if (order.some(n => R.items[n].verdict === 'FAIL')) code = 1;
}
if (JSON_OUT) { fs.mkdirSync(path.dirname(path.resolve(JSON_OUT)), {recursive: true}); fs.writeFileSync(JSON_OUT, JSON.stringify(R, null, 1)); log('wrote', JSON_OUT); }
process.exit(code);

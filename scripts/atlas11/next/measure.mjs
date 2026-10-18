#!/usr/bin/env node
/**
 * measure.mjs — 고치기 전 · 뒤를 같은 자로 재는 자(사장님 2026-10-18 00:15 명령 [1] 4 「고치기 전에 [11] 1의 숫자부터 재라.
 * 고친 뒤 같은 자로 다시 재라.」 · [11] 1 · 일꾼 M)
 *
 *   node scripts/atlas11/next/measure.mjs --base <앱 뿌리 주소> --root <사이트 뿌리 주소> --out <파일.json> --label before|after
 *        [--only '#/,#/me,/letter.html'] (고치는 동안만 · 표에는 안 씀) [--no-en] [--no-why]
 *   예) 고치기 전(얼린 사본): --base http://127.0.0.1:8840/next/?dev=1 --root http://127.0.0.1:8840
 *       고친 뒤(작업 사본):   --base http://127.0.0.1:8826/next/?dev=1 --root http://127.0.0.1:8826
 *   결과: <파일.json> + 같은 이름 .md(화면마다 한 줄 + 덧붙인 잼 + 사장님 숫자와 맞대기)
 *
 * 자(규칙) — 바꾸면 전 · 뒤가 안 맞으니 바꾸지 않는다:
 *  · 브라우저 하나 · 화면마다 새 칸(context) · 한국어 360×640 · deviceScaleFactor 1 · 터치 · 저장소 빈 새 기기 · ko-KR · 서울 시각.
 *  · 다 그렸다 = 문서 complete · 「#view .boot」「.loading」 없음 · 망 조용(5초 한도) · 글꼴 다 옴 · 「나」 칸 편지는 열면 그림이 내려앉음(intro 빠짐)
 *    · 끝이 있는 움직임(애니메이션 · 바뀜)이 모두 끝남(8초 한도 · 끝없는 움직임은 뺌) · 그 뒤 150ms · 맨 위로 올림.
 *  · 보이는 글 = 빈칸 아닌 글 마디 중 글자 상자가 1×1px 넘고 · checkVisibility(불투명 · visibility) 통과 · 1px 이하로 잘린 칸(화면 읽기 전용 글) 안이 아님.
 *    「제 글을 가진 칸」 = 그런 글 마디를 바로 품은 요소. svg 안 글도 셈.
 *  · 길이 = max(html.scrollHeight, body.scrollHeight) px · 화면 수 = 길이 ÷ 640(소수 한 자리).
 *  · 글씨 가짓수 = 제 글을 가진 칸의 계산된 font-size 를 0.5px 로 반올림한 서로 다른 값의 수 · 「view」= #view 안(뿌리 쪽은 body) · 「page」= 문서 모두(위 띠 · 아래 단추 포함).
 *  · 왼쪽 줄 = 보이는 글 마디마다 가장 가까운 「블록 조상」(display 가 inline · contents 가 아닌 것 · flex/grid 자식은 블록이 됨)을 찾고,
 *    블록마다 그 안 첫 보이는 글 마디의 첫 줄 상자 왼쪽 x 를 정수 px 로 반올림 · 블록의 text-align 이 center · right · end 이면 뺌 ·
 *    x 가 0 ≤ x < 화면 폭 인 것만 · 서로 다른 x 의 수 = 「왼쪽 줄」 · 블록 둘 이상이 쓰는 x 만 센 것 = 「함께 쓰는 줄」. #view 안(뿌리 쪽은 body).
 *  · 17px 아래 = 제 글을 가진 칸 중 font-size < 17px 인 칸의 수(문서 모두) · 크기마다 수와 보기 하나.
 *  · 첫 화면(#/) 덧붙임: 0 ≤ y < 640 · 0 ≤ x < 360 에 보이고(elementFromPoint 로 위 띠 · 아래 단추에 가리지 않음) 맨 위에 있는 숫자 낱말
 *    (%, 원, 쉼표나 소수점이 든 수 · 날짜 「10월 13일」 · 시각 「15:30」 · 쉼표 없는 정수는 안 셈 · 목록을 남김) · #view 바로 아래 칸마다 높이 ·
 *    급등 카드(a.card 글에 「급등」)가 있나 · 카드 종류마다 높이 최소 · 최대(a.card · a.prem).
 *  · #/why 누름: 새 기기에서 「삼성전자」를 쳐 넣고(치기는 누름 아님) 엔터 → 질문마다 첫 답 → 「다음」 … → 결과가 나올 때까지 스크립트가 누른 수(누름 + 엔터).
 *  · #/me: 편지 칸(.m4-letter)과 그것을 품은 #view 바로 아래 칸의 높이. /letter.html: 아래 단추 줄(nav.tabs 또는 화면 아래 붙박이 고리 셋 이상)이 있나 · 돌아가는 고리 높이.
 *  · #/shorts: 빈 곳 = 보이는 글 · 그림(img · svg · video · canvas · input) 상자를 y 로 합친 뒤 이웃한 덩이 사이 48px 넘는 빈 높이(잉크 빈 곳) · 그리고 #view 바로 아래 칸 사이 48px 넘는 틈.
 *  · 영어 390×640(?lang=en): 길이 · 화면 수 · 17px 아래만.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium} = createRequire('/opt/node-tools/')('playwright');

const A = process.argv.slice(2), arg = (k, d = null) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; }, has = k => A.includes('--' + k);
const BASE = arg('base'), ROOT = (arg('root') || '').replace(/\/$/, ''), OUT = arg('out'), LABEL = arg('label', 'before');
if (!BASE || !ROOT || !OUT) { console.error('쓰는 법: node scripts/atlas11/next/measure.mjs --base <앱 뿌리 주소> --root <사이트 뿌리 주소> --out <파일.json> --label before|after'); process.exit(2); }
const ONLY = arg('only') ? new Set(arg('only').split(',')) : null;
const VW = 360, VH = 640, VW_EN = 390, T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);

const urlOf = (scr, en) => {
  if (scr.startsWith('/')) { const u = new URL(ROOT + scr); if (en) u.searchParams.set('lang', 'en'); return u.href; }
  const u = new URL(BASE); if (en) u.searchParams.set('lang', 'en'); u.hash = scr.replace(/^#/, ''); return u.href;
};

const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function fresh(width) {
  const ctx = await browser.newContext({viewport: {width, height: VH}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(String(e.message).slice(0, 160)));
  return p;
}
/** 다 그릴 때까지(위 규칙) */
async function settle(p) {
  await p.waitForFunction(() => document.readyState === 'complete', null, {timeout: 15000}).catch(() => {});
  await p.waitForFunction(() => !document.querySelector('#view .boot, #lt .loading, main .loading'), null, {timeout: 20000, polling: 100}).catch(() => {});
  await p.waitForLoadState('networkidle', {timeout: 5000}).catch(() => {});
  await p.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {});
  await p.waitForFunction(() => { const a = document.querySelector('#view .m4-letter'); return !a || !a.classList.contains('intro'); }, null, {timeout: 12000, polling: 100}).catch(() => {});
  await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || !Number.isFinite(a.effect?.getComputedTiming?.().endTime)), null, {timeout: 8000, polling: 100}).catch(() => {});
  await p.waitForTimeout(150);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(30);
}

/** 한 화면 재기(쪽 안에서 돎) */
const MEASURE = ({home, shorts, me, letter}) => {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const view = document.querySelector('#view') || document.body;
  const docH = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
  let innerH = 0, innerSel = null; // 안쪽 스크롤 칸(문서 대신 칸이 밀리는 쪽 — 시황) · 화면 높이 절반 넘는 칸만
  for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (!/auto|scroll/.test(cs.overflowY) || e.clientHeight < innerHeight / 2 || e.scrollHeight <= e.clientHeight + 1) continue; const top = e.getBoundingClientRect().top + scrollY; if (top + e.scrollHeight > innerH) { innerH = Math.round(top + e.scrollHeight); innerSel = e.tagName.toLowerCase() + '.' + (e.getAttribute('class') || '').trim().split(/\s+/)[0]; } }
  const scrollH = Math.max(docH, innerH);
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const clipCache = new Map();
  const clipped = el => { // 1px 이하로 잘린 칸 안(화면 읽기 전용 글)
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      if (clipCache.has(a)) { if (clipCache.get(a)) return true; continue; }
      const cs = getComputedStyle(a); let c = false;
      if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const r = a.getBoundingClientRect(); c = r.width <= 1 || r.height <= 1; }
      clipCache.set(a, c); if (c) return true;
    }
    return false;
  };
  const sel = el => { const c = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); return el.tagName.toLowerCase() + (c ? '.' + c : ''); };
  const R = document.createRange(), texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
    R.selectNodeContents(n);
    const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1);
    if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    if (clipped(el)) continue;
    texts.push({n, el, rs, inView: view.contains(el)});
  }
  // 글씨 크기 · 17px 아래
  const owners = new Map(); for (const t of texts) if (!owners.has(t.el)) owners.set(t.el, t);
  const fsAll = new Map(), fsView = new Map(), small = new Map(); let smallN = 0, smallViewN = 0;
  for (const [el, t] of owners) {
    const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2;
    fsAll.set(k, (fsAll.get(k) || 0) + 1); if (t.inView) fsView.set(k, (fsView.get(k) || 0) + 1);
    if (f < 16.99) { smallN++; if (t.inView) smallViewN++; const s = small.get(k) || {n: 0, ex: sel(el) + ' 「' + t.n.nodeValue.trim().slice(0, 24) + '」'}; s.n++; small.set(k, s); }
  }
  // 왼쪽 줄
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map();
  for (const t of texts) { if (!t.inView) continue; const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = new Map();
  for (const [b, t] of blocks) {
    const ta = getComputedStyle(b).textAlign; if (/center|right|end/.test(ta)) continue;
    const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue;
    xs.set(x, (xs.get(x) || 0) + 1);
  }
  const lefts = [...xs.keys()].sort((a, b) => a - b), shared = lefts.filter(x => xs.get(x) >= 2);
  const out = {
    url: location.href, title: document.title, px: scrollH, docPx: docH, innerPx: innerH || null, inner: innerH > docH ? innerSel : null, screens: Math.round(scrollH / 640 * 10) / 10, overflowX: document.documentElement.scrollWidth > vw,
    fontKinds: fsView.size, fontKindsPage: fsAll.size, fonts: Object.fromEntries([...fsView].sort((a, b) => a[0] - b[0])), fontsPage: Object.fromEntries([...fsAll].sort((a, b) => a[0] - b[0])),
    leftLines: lefts.length, leftShared: shared.length, lefts: Object.fromEntries(lefts.map(x => [x, xs.get(x)])),
    under17: smallN, under17View: smallViewN, under17Sizes: Object.fromEntries([...small].sort((a, b) => a[0] - b[0])),
    textEls: owners.size, links: [...document.querySelectorAll('#view a[href]')].map(a => a.getAttribute('href'))
  };
  const kidsOf = () => [...view.children].filter(c => { const r = c.getBoundingClientRect(); return r.height > 0 && r.width > 0; })
    .map(c => { const r = c.getBoundingClientRect(); return {k: sel(c), label: c.getAttribute('aria-label') || '', h: Math.round(r.height), y: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY)}; });
  if (home) {
    const RE = /[+\-−]?\d[\d,]*(?:\.\d+)?\s?%|[+\-−]?\d[\d,]*(?:\.\d+)?\s?원|[+\-−]?\d{1,3}(?:,\d{3})+(?:\.\d+)?|[+\-−]?\d+\.\d+/g;
    const toks = []; let all = 0;
    for (const t of texts) {
      if (!t.inView) continue;
      const s = t.n.nodeValue; RE.lastIndex = 0;
      for (let m; (m = RE.exec(s));) {
        const before = s.slice(Math.max(0, m.index - 1), m.index), after = s.slice(m.index + m[0].length, m.index + m[0].length + 2);
        if (/^\.\d/.test(after) || /\d\.$/.test(s.slice(Math.max(0, m.index - 2), m.index)) || /^[:]/.test(after) || before === ':') continue; // 2026.10.13 · 10:06 꼴
        R.setStart(t.n, m.index); R.setEnd(t.n, m.index + m[0].length); all++;
        const q = R.getBoundingClientRect(); if (!(q.width > 0 && q.top < vh && q.bottom > 0 && q.left < vw && q.right > 0)) continue;
        const cx = Math.min(vw - 1, Math.max(0, q.left + q.width / 2)), cy = Math.min(vh - 1, Math.max(0, q.top + q.height / 2)), hit = document.elementFromPoint(cx, cy);
        if (!hit || !(hit === t.el || t.el.contains(hit) || hit.contains(t.el))) continue;
        toks.push({t: m[0].trim(), y: Math.round(q.top)});
      }
    }
    out.home = {numsFirstScreen: toks.length, nums: toks, numsWholePage: all, blocks: kidsOf()};
    const cards = [...view.querySelectorAll('a.card, a.prem')].map(a => {
      const href = a.getAttribute('href') || '', tx = a.textContent || '', r = a.getBoundingClientRect();
      const kind = a.matches('.prem') ? 'prem' : /^#\/ch\/i\//.test(href) ? 'industry' : /^#\/ch\/g\//.test(href) ? 'group' : /^#\/w\//.test(href) ? (/급등/.test(tx) ? 'surge' : /대장주/.test(tx) ? 'lead' : /고른 곳/.test(tx) ? 'pick' : 'company') : href.replace(/^(#\/[a-z]+).*$/, '$1') || 'other';
      return {kind, h: Math.round(r.height), title: (a.querySelector('b')?.textContent || tx).trim().slice(0, 40)};
    }).filter(c => c.h > 0);
    const kinds = {}; for (const c of cards) { const k = kinds[c.kind] || (kinds[c.kind] = {n: 0, min: Infinity, max: -Infinity}); k.n++; k.min = Math.min(k.min, c.h); k.max = Math.max(k.max, c.h); }
    const cc = cards.filter(c => c.kind !== 'prem');
    out.home.cards = {all: cc.length ? {min: Math.min(...cc.map(c => c.h)), max: Math.max(...cc.map(c => c.h))} : null, kinds, list: cards};
    const sc = cards.filter(c => c.kind === 'surge'); out.home.surgeCards = sc.length; out.home.surgeTitles = sc.map(c => c.title);
    const td = view.querySelector('section.today-d'); out.home.todayBlockPx = td ? Math.round(td.getBoundingClientRect().height) : null;
  }
  if (shorts) {
    const iv = [];
    for (const t of texts) if (t.inView) for (const q of t.rs) iv.push([q.top + scrollY, q.bottom + scrollY, t.n.nodeValue.trim().slice(0, 20)]);
    for (const e of view.querySelectorAll('img, svg, video, canvas, input, picture')) { if (e.closest('svg') !== e && e.tagName.toLowerCase() !== 'svg' && e.closest('svg')) continue; const q = e.getBoundingClientRect(); if (q.width > 1 && q.height > 1 && (!e.checkVisibility || e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true}))) iv.push([q.top + scrollY, q.bottom + scrollY, '<' + e.tagName.toLowerCase() + '>']); }
    iv.sort((a, b) => a[0] - b[0]);
    const gaps = []; let cur = null;
    for (const v of iv) { if (!cur) { cur = [...v]; continue; } if (v[0] > cur[1] + 48) { gaps.push({gap: Math.round(v[0] - cur[1]), y: Math.round(cur[1]), after: cur[2], next: v[2]}); cur = [...v]; } else if (v[1] > cur[1]) { cur[1] = v[1]; cur[2] = v[2]; } }
    const kids = kidsOf(), kgaps = [];
    for (let i = 1; i < kids.length; i++) { const g = kids[i].y - kids[i - 1].bottom; if (g > 48) kgaps.push({gap: g, between: kids[i - 1].k + ' → ' + kids[i].k}); }
    out.shorts = {inkGaps: gaps, blockGaps: kgaps, blocks: kids};
  }
  if (me) {
    const a = view.querySelector('.m4-letter'); const top = a ? [...view.children].find(c => c.contains(a)) : null;
    out.me = {letterPx: a ? Math.round(a.getBoundingClientRect().height) : null, letterBlockPx: top ? Math.round(top.getBoundingClientRect().height) : null, letterBlock: top ? sel(top) : null, introLeft: !!a?.classList.contains('intro')};
  }
  if (letter) {
    const tabs = [...document.querySelectorAll('nav.tabs, .tabs')].filter(e => e.getBoundingClientRect().height > 0);
    const fixedBottom = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'sticky') return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom >= vh - 2 && e.querySelectorAll('a, button').length >= 3; });
    const backs = [...document.querySelectorAll('a, button')].filter(e => { const tx = (e.textContent || '').trim(); const href = e.getAttribute('href'); return /돌아|‹|뒤로|고도리로/.test(tx) || href === '/' || /^\/next\/?/.test(href || ''); })
      .map(e => { const r = e.getBoundingClientRect(); return {text: (e.textContent || '').trim().slice(0, 30), href: e.getAttribute('href'), h: Math.round(r.height), w: Math.round(r.width)}; }).filter(b => b.h > 0);
    out.letter = {tabBar: tabs.length > 0 || fixedBottom.length > 0, tabBarSel: [...tabs, ...fixedBottom].map(sel).slice(0, 3), back: backs[0] || null, backs};
  }
  return out;
};

async function measureScreen(scr, {en = false} = {}) {
  const p = await fresh(en ? VW_EN : VW), t = Date.now();
  let r;
  try {
    await p.goto(urlOf(scr, en), {waitUntil: 'domcontentloaded', timeout: 30000});
    await settle(p);
    r = await p.evaluate(MEASURE, {home: !en && scr === '#/', shorts: !en && scr === '#/shorts', me: !en && scr === '#/me', letter: !en && scr === '/letter.html'});
  } catch (e) { r = {error: String(e.message).slice(0, 200)}; }
  r.ms = Date.now() - t; r.errs = p._errs.slice(0, 3);
  await p.context().close();
  return r;
}

/** #/why — 새 기기 · 「삼성전자」 · 첫 답만 · 결과까지 누른 수 */
async function whyTaps() {
  const p = await fresh(VW), steps = []; let taps = 0, typed = 0, result = false, err = null;
  const press = (what) => { taps++; steps.push(what); };
  try {
    await p.goto(urlOf('#/why', false), {waitUntil: 'domcontentloaded', timeout: 30000}); await settle(p);
    for (let guard = 0; guard < 80 && !result; guard++) {
      const st = await p.evaluate(() => {
        const v = document.querySelector('#view section.wy') || document.querySelector('#view');
        const vis = s => { const e = v.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const date = v.querySelector('.wy-date');
        return {res: vis('.wy-res'), find: vis('.wy-find'), findVal: v.querySelector('.wy-find')?.value || '', hits: v.querySelectorAll('.wy-hit').length, opts: v.querySelectorAll('.wy-opt').length,
          optOn: v.querySelectorAll('.wy-opt.on').length, next: vis('.wy-next'), nextText: v.querySelector('.wy-next')?.textContent || '', dateNeed: !!date && !date.value,
          why: vis('.wy-why'), whyVal: v.querySelector('.wy-why')?.value || '', err: v.querySelector('.wy-err')?.textContent || '', q: v.querySelector('.wy-q')?.textContent || '', step: v.querySelector('.wy-step')?.textContent || ''};
      });
      if (st.res) { result = true; break; }
      if (st.find) {
        if (st.findVal !== '삼성전자') { await p.fill('#view .wy-find', '삼성전자'); typed++; await p.waitForTimeout(250); continue; }
        if (!steps.includes('엔터(찾기)')) { await p.press('#view .wy-find', 'Enter'); press('엔터(찾기)'); await p.waitForTimeout(400); continue; }
        if (st.hits) { await p.click('#view .wy-hit'); press('누름(찾은 줄)'); await p.waitForTimeout(400); continue; }
        err = '찾기에서 못 넘어감: ' + st.err; break;
      }
      if (st.opts && !st.optOn) { await p.click('#view .wy-opt >> nth=0'); press(`누름(첫 답 · ${st.step})`); await p.waitForTimeout(120); continue; }
      if (st.dateNeed) { const d = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10); await p.fill('#view .wy-date', d); typed++; await p.waitForTimeout(100); continue; }
      if (st.why && !st.whyVal) { const chip = await p.$('#view .wy-chip'); if (chip) { await chip.click(); press('누름(보기 말)'); } else { await p.fill('#view .wy-why', '실적이 꺾여서'); typed++; } await p.waitForTimeout(120); continue; }
      if (st.next) { const before = st.q + st.step + st.err; await p.click('#view .wy-next'); press(`누름(${st.nextText.trim()} · ${st.step})`); await p.waitForTimeout(250);
        const after = await p.evaluate(() => { const v = document.querySelector('#view'); return (v.querySelector('.wy-q')?.textContent || '') + (v.querySelector('.wy-step')?.textContent || '') + (v.querySelector('.wy-err')?.textContent || '') + (v.querySelector('.wy-res') ? 'RES' : ''); });
        if (after === before && !/RES/.test(after)) { if (st.why && !st.whyVal) { await p.fill('#view .wy-why', '실적이 꺾여서'); typed++; continue; } err = '다음이 안 넘어감: ' + st.err; break; }
        continue; }
      err = '누를 것이 없음: ' + JSON.stringify(st).slice(0, 200); break;
    }
  } catch (e) { err = String(e.message).slice(0, 200); }
  await p.context().close();
  return {taps, typed, result, err, steps};
}

/* ── 화면 목록 · 차례 ── */
const out = {schema: 'atlas11-next-measure-1', label: LABEL, at: new Date().toISOString(), base: BASE, root: ROOT, viewport: {ko: [VW, VH], en: [VW_EN, VH]}, screens: {}, en: {}, extras: {}};
const want = s => !ONLY || ONLY.has(s);
log('첫 화면');
const home = await measureScreen('#/'); out.screens['#/'] = home;
const links = new Set(home.links || []);
const chips = [...new Set((home.links || []).filter(h => /^#\/f\/[a-z]+$/.test(h)))];
const firstOf = re => (home.links || []).find(h => re.test(h)) || null;
let chI = firstOf(/^#\/ch\/i\//), chG = firstOf(/^#\/ch\/g\//);
const LIST = [...chips, '#/today', '#/shorts', '#/why', '#/why/005930', '#/sub', '#/me', '#/gdr', '#/w/005930', '#/w/005930/past', '#/w/005930/rivals', '#/w/005930/grow', '#/w/005930/range',
  '@chI', '@chG', '#/surge', '#/cal', '#/cond', '#/talk', '#/s/005930/2026-10-13/234000/s/7J206rGwIOyWtOuVjD8', '/letter.html', '/hello.html'];
for (let s of LIST) {
  if (s === '@chI' || s === '@chG') {
    if (s === '@chI' && !chI) chI = Object.values(out.screens).flatMap(r => r.links || []).find(h => /^#\/ch\/i\//.test(h)) || null;
    if (s === '@chG' && !chG) chG = Object.values(out.screens).flatMap(r => r.links || []).find(h => /^#\/ch\/g\//.test(h)) || null;
    s = s === '@chI' ? chI : chG; if (!s) { out.extras['채널 못 찾음 ' + s] = true; continue; }
  }
  if (!want(s)) continue;
  log(s); out.screens[s] = await measureScreen(s);
}
if (!has('no-why') && want('#/why')) { log('매매일지 누름'); out.extras.whyTaps = await whyTaps(); }
if (!has('no-en')) for (const s of Object.keys(out.screens)) { if (!want(s)) continue; log('영어 ' + s); const r = await measureScreen(s, {en: true}); out.en[s] = {px: r.px, screens: r.screens, under17: r.under17, under17Sizes: r.under17Sizes, overflowX: r.overflowX, error: r.error, ms: r.ms}; }
await browser.close();
for (const r of Object.values(out.screens)) delete r.links;
out.seconds = Math.round((Date.now() - T0) / 100) / 10;

/* ── 사장님 숫자(2026-10-18 0시 분석)와 맞대기 ── */
const S = out.screens, H = S['#/']?.home || {};
const sizeScreens = k => Object.entries(S).filter(([, r]) => r.under17Sizes && r.under17Sizes[k]).map(([s]) => s);
const shortGaps = (S['#/shorts']?.shorts?.inkGaps || []).map(g => g.gap);
const chKey = Object.keys(S).find(s => s.startsWith('#/ch/i/')), cardAll = H.cards?.all;
out.owner = [
  ['첫 화면 길이 px', 9572, S['#/']?.px], ['첫 화면 화면 수', 12, S['#/']?.screens], ['오늘 시장 칸(첫 화면 section.today-d) px', 3768, H.todayBlockPx], ['급등 카드(+110%) 첫 화면에 있음', '있음', H.surgeCards ? '있음 ' + H.surgeCards + '장' : '없음'],
  ['매매일지 누름 수', 22, out.extras.whyTaps?.taps], ['편지 칸(.m4-letter) px', 1108, S['#/me']?.me?.letterPx], ['편지 쪽 아래 단추', '없음', S['/letter.html']?.letter ? (S['/letter.html'].letter.tabBar ? '있음' : '없음') : '?'],
  ['편지 쪽 돌아가기 단추 높이 px', 25, S['/letter.html']?.letter?.back?.h], ['15px 글이 있는 화면 수', 8, sizeScreens('15').length], ['14px 글(시황)', '있음', S['#/shorts']?.under17Sizes?.['14'] ? '있음 ' + S['#/shorts'].under17Sizes['14'].n : '없음'],
  ['13px 글(소개 쪽)', '있음', S['/hello.html']?.under17Sizes?.['13'] ? '있음 ' + S['/hello.html'].under17Sizes['13'].n : '없음'], ['첫 화면 글씨 가짓수(#view · 문서 모두)', 11, `${S['#/']?.fontKinds} · ${S['#/']?.fontKindsPage}`],
  ['왼쪽 줄 첫 화면(모두 · 함께 쓰는)', 12, `${S['#/']?.leftLines} · ${S['#/']?.leftShared}`], ['왼쪽 줄 회사 #/w/005930', 10, `${S['#/w/005930']?.leftLines} · ${S['#/w/005930']?.leftShared}`],
  ['왼쪽 줄 채널 ' + (chKey || '?'), 10, chKey ? `${S[chKey].leftLines} · ${S[chKey].leftShared}` : '?'], ['왼쪽 줄 달력 #/cal', 12, `${S['#/cal']?.leftLines} · ${S['#/cal']?.leftShared}`],
  ['첫 화면 카드 높이 px', '286–313', cardAll ? `${cardAll.min}–${cardAll.max}` : '?'], ['시황 빈 곳 px(48 넘는 잉크 빈 곳)', '115 · 277 · 231', shortGaps.join(' · ') || '없음']
].map(([what, owner, now]) => ({what, owner, now}));

await fs.mkdir(path.dirname(OUT), {recursive: true});
await fs.writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
/* ── .md ── */
const L = [];
L.push(`# 재기 ${LABEL} — ${out.at} · ${out.seconds}초`, '', `앱 ${BASE} · 뿌리 ${ROOT} · 한국어 ${VW}×${VH} · 영어 ${VW_EN}×${VH} · 자(규칙)는 \`scripts/atlas11/next/measure.mjs\` 머리말`, '');
L.push('| 화면 | 길이 px | 화면 수 | 글씨 가짓수(#view · 모두) | 왼쪽 줄(모두 · 함께) | 17px 아래 | 17px 아래 크기 | 영어 px | 영어 화면 수 | 영어 17px 아래 |', '|---|---|---|---|---|---|---|---|---|---|');
for (const [s, r] of Object.entries(S)) {
  const e = out.en[s] || {};
  L.push(`| \`${s.length > 44 ? s.slice(0, 44) + '…' : s}\` | ${r.px ?? r.error}${r.inner ? ' (안쪽 칸 ' + r.inner + ')' : ''} | ${r.screens ?? ''} | ${r.fontKinds} · ${r.fontKindsPage} | ${r.leftLines} · ${r.leftShared} | ${r.under17} | ${Object.entries(r.under17Sizes || {}).map(([k, v]) => k + 'px×' + v.n).join(' ')} | ${e.px ?? ''} | ${e.screens ?? ''} | ${e.under17 ?? ''} |`);
}
L.push('', '## 첫 화면 덧붙임', `- 첫 화면(y<640) 안 숫자 ${H.numsFirstScreen}개${H.nums?.length ? ': ' + H.nums.map(n => n.t).join(' · ') : ''} · 같은 낱말 꼴이 쪽 모두에 ${H.numsWholePage}개`, `- 급등 카드 ${H.surgeCards}장 ${(H.surgeTitles || []).join(' / ')}`,
  `- 카드(a.card) 높이 ${cardAll ? cardAll.min + '–' + cardAll.max : '?'} · 종류마다 ${Object.entries(H.cards?.kinds || {}).map(([k, v]) => `${k} ${v.n}장 ${v.min}–${v.max}`).join(' · ')}`,
  `- #view 바로 아래 칸: ${(H.blocks || []).map(b => `${b.k}${b.label ? '(' + b.label + ')' : ''} ${b.h}`).join(' · ')}`);
const W = out.extras.whyTaps; if (W) L.push('', '## 매매일지(#/why) 누름', `- 결과까지 ${W.result ? '감' : '못 감'} · 누름 ${W.taps}번(치기 ${W.typed}번은 안 셈)${W.err ? ' · 걸림: ' + W.err : ''}`, `- 차례: ${W.steps.join(' → ')}`);
const M = S['#/me']?.me, LT = S['/letter.html']?.letter, SH = S['#/shorts']?.shorts;
L.push('', '## 보유종목 · 편지 쪽 · 시황', `- #/me 편지 칸 .m4-letter ${M?.letterPx}px · 품은 칸 ${M?.letterBlock} ${M?.letterBlockPx}px`,
  `- /letter.html 아래 단추 ${LT ? (LT.tabBar ? '있음 ' + LT.tabBarSel.join(',') : '없음') : '?'} · 돌아가기 ${LT?.back ? `「${LT.back.text}」 ${LT.back.w}×${LT.back.h}px` : '?'}`,
  `- #/shorts 잉크 빈 곳(>48px): ${(SH?.inkGaps || []).map(g => `${g.gap}px(y ${g.y} · 「${g.after}」 뒤)`).join(' · ') || '없음'}`, `- #/shorts 칸 사이 틈(>48px): ${(SH?.blockGaps || []).map(g => `${g.gap}px ${g.between}`).join(' · ') || '없음'}`);
L.push('', '## 사장님 숫자(10월 18일 0시)와 맞대기', '| 무엇 | 사장님 | 이 자 |', '|---|---|---|', ...out.owner.map(o => `| ${o.what} | ${o.owner} | ${o.now ?? '?'} |`));
await fs.writeFile(OUT.replace(/\.json$/, '') + '.md', L.join('\n') + '\n');
log('끝 ' + out.seconds + '초 → ' + OUT);

#!/usr/bin/env node
// S12a 재기 — 내 네 쪽(달력 · 조건 · 급등 · 지난 길)을 360x640 에서 재는 자(M 의 measure.mjs 와 같은 규칙 + 간격 · 금빛 글 · 줄 높이)
//   node docs/design/godori-2026-10-18/accept/S12a-measure.mjs [--label before|after] [--only cal,cond,surge,past] [--open] [--mode f2|f3|n] [--w 360] [--out file.json] [--detail]
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium} = createRequire('/opt/node-tools/')('playwright');
const A = process.argv.slice(2), arg = (k, d = null) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; }, has = k => A.includes('--' + k);
const BASE = arg('base', 'http://127.0.0.1:8826/next/?dev=1');
const W = +arg('w', '360'), H = 640, MODE = arg('mode', 'n'), OUT = arg('out'), LABEL = arg('label', 'run'), OPEN = has('open'), DETAIL = has('detail'), CLICK = arg('click'), INJECT = arg('inject') ? fs.readFileSync(arg('inject'), 'utf-8') : null, INJECT_INTO = arg('inject-into', '#view > *:first-child');
const ONLY = arg('only') ? new Set(arg('only').split(',')) : null;
const ROUTES = [
  ['cal', '#/cal'], ['cal', '#/cal/290550'], ['cal', '#/cal/011080'], ['cal', '#/cal/215790'],
  ['cond', '#/cond'], ['cond', '#/cond/rise-top3-spike', 'cond2'], ['cond', '#/cond', 'cond-picker', 'picker'],
  ['surge', '#/surge'], ['surge', '#/surge/10'], ['surge', '#/surge/20'], ['surge', '#/surge/30'], ['surge', '#/surge/40'],
  ['past', '#/w/005930/past'], ['past', '#/w/005110/past'],
].filter(r => !ONLY || ONLY.has(r[0]));

const T0 = Date.now();
const log = (...a) => console.error(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);
const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch({executablePath: exe});

const MEASURE = ({open}) => {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const view = document.querySelector('#view') || document.body;
  if (open) { for (const d of view.querySelectorAll('details')) d.open = true; }
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const clipCache = new Map();
  const clipped = el => {
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
  const owners = new Map(); for (const t of texts) if (!owners.has(t.el)) owners.set(t.el, t);
  const fsAll = new Map(), fsView = new Map(), fsEx = new Map(), small = [];
  for (const [el, t] of owners) {
    const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2;
    fsAll.set(k, (fsAll.get(k) || 0) + 1);
    if (t.inView) { fsView.set(k, (fsView.get(k) || 0) + 1); if (!fsEx.has(k)) fsEx.set(k, []); if (fsEx.get(k).length < 3) fsEx.get(k).push(sel(el) + ' 「' + t.n.nodeValue.trim().slice(0, 14) + '」'); }
    if (f < 16.99 && t.inView) small.push({k, s: sel(el) + ' 「' + t.n.nodeValue.trim().slice(0, 24) + '」'});
  }
  // 왼쪽 줄(M 과 같은 규칙)
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map();
  for (const t of texts) { if (!t.inView) continue; const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = new Map(), xex = new Map();
  for (const [b, t] of blocks) {
    const ta = getComputedStyle(b).textAlign; if (/center|right|end/.test(ta)) continue;
    const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue;
    xs.set(x, (xs.get(x) || 0) + 1);
    if (!xex.has(x)) xex.set(x, []); if (xex.get(x).length < 4) xex.get(x).push(sel(b) + ' 「' + t.n.nodeValue.trim().slice(0, 12) + '」');
  }
  const lefts = [...xs.keys()].sort((a, b) => a - b);
  // 간격 — 계산된 값(computedStyleMap · auto 는 따로) 중 0 · 8 · 16 · 24 가 아닌 것 · 음수
  const spBad = new Map(), negs = [], spAll = new Map();
  const PROPS = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'];
  const OK = new Set([0, 8, 16, 24]);
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    const r = el.getBoundingClientRect(); if (!(r.width > 0 || r.height > 0)) continue;
    const m = el.computedStyleMap?.(); if (!m) continue;
    for (const p of PROPS) {
      const v = m.get(p); if (!v) continue;
      const s = v.toString();
      if (s === 'auto' || s === 'normal') continue;
      const num = parseFloat(v.value ?? s);
      const unit = v.unit ?? (s.endsWith('px') ? 'px' : '?');
      const key = s;
      spAll.set(key, (spAll.get(key) || 0) + 1);
      if (!(unit === 'px' && OK.has(num))) {
        const e = spBad.get(key) || {n: 0, ex: []}; e.n++; if (e.ex.length < 3) e.ex.push(sel(el) + ' ' + p); spBad.set(key, e);
      }
      if (p.startsWith('margin') && num < 0) negs.push(sel(el) + ' ' + p + ' ' + s);
    }
  }
  // 금빛 경고 글 — 금빛 글자 · 금빛 테두리 · 금빛 바탕인 칸의 줄 수(가장 바깥 칸)
  const isGold = c => /rgba?\(\s*233,\s*185,\s*73/.test(c);
  const golds = [];
  const seen = new Set();
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('svg')) continue;
    const cs = getComputedStyle(el);
    const gbox = (isGold(cs.borderTopColor) && parseFloat(cs.borderTopWidth) > 0) || isGold(cs.backgroundColor);
    const gtxt = isGold(cs.color) && [...el.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim());
    if (!gbox && !gtxt) continue;
    if (!el.checkVisibility?.({checkOpacity: true, checkVisibilityCSS: true})) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    if (el.closest('.chaps, .tabs')) continue; // 위 챕터 줄 · 아래 탭(app.css)의 금빛 테 · 숫자 동그라미는 경고 칸이 아님
    // 줄 수 = 보이는 글 마디들의 줄 윗선 가짓수(접힌 칸 속 숨은 글은 안 셈)
    const tops = new Set(); const tw2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n2; (n2 = tw2.nextNode());) { if (!n2.nodeValue.trim()) continue; const pe = n2.parentElement; if (!pe || !pe.checkVisibility?.({checkOpacity: true, checkVisibilityCSS: true})) continue; const rr = document.createRange(); rr.selectNodeContents(n2); for (const q of rr.getClientRects()) if (q.width > 1 && q.height > 1) tops.add(Math.round(q.top / 4)); }
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const lines = Math.max(tops.size, Math.round(r.height / lh * 10) / 10);
    golds.push({s: sel(el), kind: gbox ? 'box' : 'text', lines: tops.size, h: Math.round(r.height), text: el.textContent.trim().slice(0, 26)});
  }
  // 같은 줄(목록) 안 카드 높이 — 부모마다 같은 클래스 자식이 3 이상일 때
  const lists = [];
  for (const par of view.querySelectorAll('*')) {
    const kids = [...par.children].filter(c => { const r = c.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(c).position !== 'absolute'; });
    if (kids.length < 3) continue;
    const by = new Map(); for (const c of kids) { const k = c.tagName + '.' + ((c.getAttribute('class') || '').trim().split(/\s+/)[0] || ''); if (!by.has(k)) by.set(k, []); by.get(k).push(Math.round(c.getBoundingClientRect().height * 10) / 10); }
    for (const [k, hs] of by) { if (hs.length < 3) continue; const u = [...new Set(hs)]; lists.push({par: sel(par), k, n: hs.length, min: Math.min(...hs), max: Math.max(...hs), distinct: u.length}); }
  }
  const docH = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
  const out = {
    px: docH, screens: Math.round(docH / 640 * 10) / 10, overflowX: document.documentElement.scrollWidth > vw + 0.5,
    fontKinds: fsView.size, fontKindsPage: fsAll.size, fonts: Object.fromEntries([...fsView].sort((a, b) => a[0] - b[0])), fontsPage: Object.fromEntries([...fsAll].sort((a, b) => a[0] - b[0])),
    fontEx: Object.fromEntries([...fsEx]),
    leftLines: lefts.length, lefts: Object.fromEntries(lefts.map(x => [x, xs.get(x)])), leftEx: Object.fromEntries(lefts.map(x => [x, xex.get(x)])),
    under17: small.length, under17ex: small.slice(0, 6),
    spacingKinds: spAll.size, spacingBad: [...spBad].map(([v, e]) => ({v, n: e.n, ex: e.ex})), spacingBadN: [...spBad.values()].reduce((a, e) => a + e.n, 0),
    negMargins: negs,
    golds: golds, goldsOver2: golds.filter(g => g.lines > 2).length,
    lists: lists.filter(l => l.distinct > 1)
  };
  return out;
};

async function settle(p) {
  await p.waitForFunction(() => document.readyState === 'complete', null, {timeout: 15000}).catch(() => {});
  await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000, polling: 100}).catch(() => {});
  await p.waitForLoadState('networkidle', {timeout: 5000}).catch(() => {});
  await p.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {});
  await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || !Number.isFinite(a.effect?.getComputedTiming?.().endTime)), null, {timeout: 8000, polling: 100}).catch(() => {});
  await p.waitForTimeout(250);
  await p.evaluate(() => window.scrollTo(0, 0));
}

const results = [];
for (const [grp, hash, label, action] of ROUTES) {
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  try {
    if (MODE !== 'n') await p.addInitScript(m => { try { localStorage.setItem('atlas:font', m === 'f2' ? '1' : '2'); } catch {} }, MODE);
    const u = new URL(BASE); u.hash = hash.replace(/^#/, '');
    await p.goto(u.href, {waitUntil: 'domcontentloaded'});
    await settle(p);
    if (INJECT) { await p.evaluate(({html, sel}) => { const t = document.querySelector(sel); const d = document.createElement('div'); d.innerHTML = html; t.append(...d.childNodes); }, {html: INJECT, sel: INJECT_INTO}); await p.waitForTimeout(200); }
    if (CLICK) { await p.locator(CLICK).first().click({timeout: 4000}).catch(() => {}); await p.waitForTimeout(500); }
    if (action === 'picker') { await p.locator('button.pcond-slot').first().click(); await p.waitForTimeout(500); }
    const m = await p.evaluate(MEASURE, {open: OPEN});
    results.push({grp, hash, label: label || hash, w: W, mode: MODE, open: OPEN, errs, ...m});
    log(hash, label || '', 'done');
  } catch (e) { results.push({grp, hash, label: label || hash, err: String(e.message).slice(0, 200)}); log(hash, 'ERR', e.message.slice(0, 100)); }
  await ctx.close();
}
await browser.close();

if (OUT) fs.writeFileSync(OUT, JSON.stringify({label: LABEL, results}, null, 1));
// 표
const pad = (s, n) => String(s).padEnd(n);
console.log(`label=${LABEL} w=${W} mode=${MODE} open=${OPEN}`);
console.log(pad('route', 28), pad('px', 6), pad('fontK(view/page)', 17), pad('left', 5), pad('<17', 4), pad('spBad(kinds/n)', 15), pad('neg', 4), pad('gold>2', 7), pad('listsDiffH', 10), 'ovX');
for (const r of results) {
  if (r.err) { console.log(pad(r.label, 28), 'ERR', r.err); continue; }
  console.log(pad(r.label, 28), pad(r.px, 6), pad(`${r.fontKinds}/${r.fontKindsPage}`, 17), pad(r.leftLines, 5), pad(r.under17, 4), pad(`${r.spacingBad.length}/${r.spacingBadN}`, 15), pad(r.negMargins.length, 4), pad(r.goldsOver2, 7), pad(r.lists.length, 10), r.overflowX ? 'YES' : '-');
}
if (DETAIL) {
  for (const r of results) {
    if (r.err) continue;
    console.log('\n=== ' + r.label + ' (' + r.hash + ')  errs=' + JSON.stringify(r.errs));
    console.log(' fonts(view):', JSON.stringify(r.fonts), ' page:', JSON.stringify(r.fontsPage));
    console.log(' fontEx:', JSON.stringify(r.fontEx));
    console.log(' lefts:', JSON.stringify(r.lefts));
    for (const [x, ex] of Object.entries(r.leftEx)) console.log('   x=' + x + ' (' + r.lefts[x] + ') ' + ex.join(' | '));
    console.log(' under17:', JSON.stringify(r.under17ex));
    console.log(' spacingBad:', JSON.stringify(r.spacingBad));
    console.log(' neg:', JSON.stringify(r.negMargins));
    console.log(' golds:', JSON.stringify(r.golds));
    console.log(' lists(h differ):', JSON.stringify(r.lists));
  }
}

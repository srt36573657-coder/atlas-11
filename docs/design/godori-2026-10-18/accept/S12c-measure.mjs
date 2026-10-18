#!/usr/bin/env node
/* S12c 재기 — 봉인(#/time) · 도움말(#/info) · 밖 칸(#/x/<번호>) · 영어(en.css) 글씨 · 간격 · 왼쪽 줄
 *   node docs/design/godori-2026-10-18/accept/S12c-measure.mjs --label before|after --out out.json [--only time,info,x,xnf,en-find,en-home] [--modes ko,en,f2,enf2,f3,enf3]  (f2 = 크게 · f3 = 아주 크게) [--open]
 *   자(measure.mjs 와 같은 정의): 보이는 글 마디(1px 넘는 상자 · checkVisibility · 1px 이하로 잘린 칸 밖) · 글씨 가짓수 = 제 글을 가진 칸의 계산된 font-size 를 0.5px 로 반올림 ·
 *   왼쪽 줄 = 블록마다 첫 글 마디 첫 줄 왼쪽 x(정수) · text-align center/right/end 블록 빼기.
 *   덧붙임: 17px 아래 글 마디 수 · 간격(margin · padding · gap · 가짜 칸 ::before/::after 포함)이 0 · 8 · 16 · 24 가 아닌 값 · 음수 · 금빛 글 줄 수 · 같은 목록 카드 높이.
 */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const {chromium} = createRequire('/opt/node-tools/')('playwright');

// 영어 사전 = 지금 en-src.json 그대로(quick.mjs 와 같은 꼴 — add.mjs 로 막 넣은 줄도 바로 봄)
import fsSync from 'node:fs';
const EN_BODY = (() => { try { const S = JSON.parse(fsSync.readFileSync('/home/claude/atlas-video/scripts/atlas11/next/i18n/en-src.json', 'utf8')); return JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 's12c', entities: S.entities, templates: S.templates}); } catch { return null; } })();
const routeEn = async ctx => { if (EN_BODY) await ctx.route(/\/next\/i18n\/en\.json(\?|$)/, r => r.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body: EN_BODY})); };
const A = process.argv.slice(2), arg = (k, d = null) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; }, has = k => A.includes('--' + k);
const LABEL = arg('label', 'before'), OUT = arg('out'), BASE = arg('base', 'http://127.0.0.1:8826');
const ONLY = new Set((arg('only', 'time,info,x,xnf,en-find,en-home')).split(','));
const MODES = (arg('modes', 'ko,en,f3,enf3')).split(',');
const OPEN = has('open');

const PAGES = {
  time: {hash: '#/time'},
  info: {hash: '#/info'},
  x: {hash: '#/x/005935'},
  xnf: {hash: '#/x/999999'},
  'en-home': {hash: '#/', en: true, only: ['en']},
  'en-find': {hash: '#/find', en: true, only: ['en'], type: '삼성'},
};

const MEASURE = ({openAll}) => {
  const vw = document.documentElement.clientWidth;
  const view = document.querySelector('#view') || document.body;
  if (openAll) for (const d of view.querySelectorAll('details')) d.open = true;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const clipCache = new Map();
  const clipped = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { if (clipCache.has(a)) { if (clipCache.get(a)) return true; continue; } const cs = getComputedStyle(a); let c = false; if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const r = a.getBoundingClientRect(); c = r.width <= 1 || r.height <= 1; } clipCache.set(a, c); if (c) return true; } return false; };
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
  const fsView = new Map(), small = {}, smallNodes = []; let smallN = 0, smallNodeN = 0;
  for (const t of texts) { const f = parseFloat(getComputedStyle(t.el).fontSize); if (f < 16.99 && t.inView) { smallNodeN++; if (smallNodes.length < 12) smallNodes.push(f + 'px ' + sel(t.el) + ' 「' + t.n.nodeValue.trim().slice(0, 20) + '」'); } }
  for (const [el, t] of owners) { if (!t.inView) continue; const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2; fsView.set(k, (fsView.get(k) || 0) + 1); if (f < 16.99) { smallN++; small[k] = (small[k] || 0) + 1; } }
  // 왼쪽 줄
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map();
  for (const t of texts) { if (!t.inView) continue; const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = new Map(), xex = {};
  for (const [b, t] of blocks) { const ta = getComputedStyle(b).textAlign; if (/center|right|end/.test(ta)) continue; const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); (xex[x] ||= []).length < 3 && xex[x].push(sel(b) + ' 「' + t.n.nodeValue.trim().slice(0, 12) + '」'); }
  const lefts = [...xs.keys()].sort((a, b) => a - b);
  // 간격 — #view 안 모든 칸(가짜 칸 포함) · 0 8 16 24 밖 · 음수
  const OKS = new Set([0, 8, 16, 24]);
  const PROPS = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'];
  const bad = {}, negs = []; let checked = 0;
  // margin 을 auto 로 적은 자리(flex · grid 에서는 계산된 값이 px 로 나옴) — 글 규칙에서 찾아 뺌
  const autoOf = new Map();
  const walk = rs => { for (const r of rs) {
    if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; } if (!r.style || !r.selectorText) continue;
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(x => r.style['margin' + x] === 'auto'); if (!sides.length) continue;
    for (const part of r.selectorText.split(',')) { const m = /::(before|after)\s*$/.exec(part.trim()); const base = part.trim().replace(/::(before|after)\s*$/, ''); let list = []; try { list = view.querySelectorAll(base); } catch { /* */ }
      for (const el of list) { const key = el; const mp = autoOf.get(key) || {}; const slot = m ? '::' + m[1] : '';
        mp[slot] = new Set([...(mp[slot] || []), ...sides.map(x => 'margin' + x)]); autoOf.set(key, mp); } } } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* */ } }
  const seeStyle = (cs, label, autoSet) => { checked++;
    for (const p of PROPS) { if (autoSet && autoSet.has(p)) continue; const raw = cs[p]; if (raw === 'normal' || raw === 'auto' || raw === '') continue; const v = parseFloat(raw); if (Number.isNaN(v)) continue; if (/^margin/.test(p) && v < 0) negs.push(label + ' ' + p + ' ' + raw); if (!OKS.has(Math.round(v * 10) / 10)) { const k = p + ':' + (Math.round(v * 10) / 10); (bad[k] ||= []).length < 3 && bad[k].push(label); } } };
  const all = [view, ...view.querySelectorAll('*')];
  for (const el of all) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    const cs = getComputedStyle(el); if (cs.display === 'none') continue;
    if (el !== view && el.parentElement && !el.checkVisibility?.()) { /* 접힌 칸 안 · 숨김 */ continue; }
    seeStyle(cs, sel(el), autoOf.get(el)?.['']);
    for (const ps of ['::before', '::after']) { const pc = getComputedStyle(el, ps); if (pc.content && pc.content !== 'none' && pc.content !== 'normal' && pc.display !== 'none') seeStyle(pc, sel(el) + ps, autoOf.get(el)?.[ps]); }
  }
  // 금빛 글 줄 수
  const gold = 'rgb(233, 185, 73)', gb = new Map();
  for (const t of texts) { if (!t.inView) continue; if (getComputedStyle(t.el).color !== gold) continue; const b = blockOf(t.el); const arr = gb.get(b) || []; arr.push(...t.rs.map(q => Math.round(q.top))); gb.set(b, arr); }
  const goldBlocks = [...gb].map(([b, tops]) => { const u = []; for (const y of tops.sort((a, b) => a - b)) if (!u.length || y - u.at(-1) > 6) u.push(y); const rect = b.getBoundingClientRect(); return {el: sel(b), text: (b.textContent || '').trim().slice(0, 18), lines: u.length, h: Math.round(rect.height)}; });
  // 같은 목록 카드 높이
  const LISTS = ['.ptime-trio > div', 'ol.ptime-opens > li', 'ul.ptime-gbars > li', 'ol.pinfo-funnel > li', 'ol.px-funnel > li'];
  const lists = {};
  for (const q of LISTS) { const els = [...view.querySelectorAll(q)].filter(e => e.getBoundingClientRect().height > 0); if (els.length) { const hs = els.map(e => Math.round(e.getBoundingClientRect().height * 10) / 10); lists[q] = {n: hs.length, min: Math.min(...hs), max: Math.max(...hs)}; } }
  const docW = document.documentElement.scrollWidth;
  const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  return {
    px: docH, screens: Math.round(docH / 640 * 10) / 10, overflowX: docW > vw, docW, vw,
    fontKinds: fsView.size, fonts: Object.fromEntries([...fsView].sort((a, b) => a[0] - b[0])),
    under17Els: smallN, under17Nodes: smallNodeN, under17Sizes: small, under17Ex: smallNodes,
    leftLines: lefts.length, lefts: Object.fromEntries(lefts.map(x => [x, xs.get(x)])), leftEx: xex,
    spacingChecked: checked, badSpacingKinds: Object.keys(bad).length, badSpacing: bad, negMargins: negs.length, negEx: negs.slice(0, 6),
    gold: goldBlocks, goldMaxLines: Math.max(0, ...goldBlocks.map(g => g.lines)), lists,
  };
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

const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch({executablePath: exe});
const result = {label: LABEL, when: new Date().toISOString(), rows: {}};
try {
  for (const [name, pg] of Object.entries(PAGES)) {
    if (!ONLY.has(name)) continue;
    for (const mode of MODES) {
      const isEn = mode.startsWith('en'), isF3 = mode.endsWith('f3'), isF2 = mode.endsWith('f2');
      if (pg.only && !pg.only.includes(isEn ? 'en' : 'ko')) continue;
      if (pg.en && !isEn) continue;
      const w = isEn ? 390 : 360;
      const ctx = await browser.newContext({viewport: {width: w, height: 640}, deviceScaleFactor: 1, hasTouch: true, locale: isEn ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul'});
      if (isEn) await routeEn(ctx);
      if (isF3) await ctx.addInitScript(() => { try { localStorage.setItem('atlas:font', '2'); } catch { /* */ } });
      if (isF2) await ctx.addInitScript(() => { try { localStorage.setItem('atlas:font', '1'); } catch { /* */ } });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
      const u = new URL(BASE + '/next/'); u.searchParams.set('dev', '1'); if (isEn) u.searchParams.set('lang', 'en'); u.hash = pg.hash.replace(/^#/, '');
      let r;
      try {
        await p.goto(u.href, {waitUntil: 'domcontentloaded', timeout: 30000});
        await settle(p);
        if (pg.type) { await p.fill('input', pg.type); await p.waitForTimeout(500); }
        r = await p.evaluate(MEASURE, {openAll: false});
        if (OPEN || true) { const r2 = await p.evaluate(MEASURE, {openAll: true}); r.open = {px: r2.px, fontKinds: r2.fontKinds, fonts: r2.fonts, under17Els: r2.under17Els, under17Nodes: r2.under17Nodes, leftLines: r2.leftLines, lefts: r2.lefts, badSpacingKinds: r2.badSpacingKinds, badSpacing: r2.badSpacing, negMargins: r2.negMargins, goldMaxLines: r2.goldMaxLines, gold: r2.gold, overflowX: r2.overflowX}; }
      } catch (e) { r = {error: String(e.message).slice(0, 200)}; }
      r.errs = errs.slice(0, 3);
      result.rows[name + ' ' + mode + ' ' + w] = r;
      await ctx.close();
    }
  }
} finally { await browser.close(); }
if (OUT) await fs.writeFile(OUT, JSON.stringify(result, null, 1));
// 표
const fmt = o => JSON.stringify(o);
for (const [k, r] of Object.entries(result.rows)) {
  if (r.error) { console.log(k, 'ERROR', r.error); continue; }
  console.log(`${k.padEnd(16)} px=${r.px} 17아래=${r.under17Els}칸/${r.under17Nodes}마디 글씨=${r.fontKinds}${fmt(r.fonts)} 왼쪽줄=${r.leftLines}${fmt(Object.keys(r.lefts))} 간격밖=${r.badSpacingKinds}종 음수=${r.negMargins} 금빛최대=${r.goldMaxLines}줄 넘침X=${r.overflowX}  | 펼침: 글씨=${r.open.fontKinds} 왼쪽=${r.open.leftLines} 간격밖=${r.open.badSpacingKinds} 17아래=${r.open.under17Els}`);
}

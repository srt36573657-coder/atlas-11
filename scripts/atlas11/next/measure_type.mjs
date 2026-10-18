#!/usr/bin/env node
/**
 * measure_type.mjs — 낱말 · 글씨 · 간격 자(사장님 2026-10-18 00:15 명령문 [10] 1 · 2 · 5 ~ 10 · 줄 16 · 일꾼 S12x)
 *
 *   node scripts/atlas11/next/measure_type.mjs --out <파일.json> [--label before|after] [--only '#/,#/shorts'] [--no-en] [--no-ko]
 *        [--base http://127.0.0.1:8826] [--w 360] [--h 640] [--own]   (--own = 켜 둔 빠른 검사 브라우저에 안 붙고 제 브라우저를 띄움)
 *   결과: <파일.json> + 같은 이름 .md(화면마다 한 줄 · 한국어 · 영어)
 *
 * 자(규칙) — 글 마디 · 글씨 가짓수 · 왼쪽 줄은 M 의 measure.mjs 와 같은 잣대(바꾸지 않음):
 *  · 모든 길(아래 ROUTES) · 360×640 · deviceScaleFactor 1 · 터치 · 빈 저장소 · ko-KR · 서울 시각 · 한국어와 영어(?lang=en) 둘 다 같은 폭
 *  · 영어 사전 = 지금 scripts/atlas11/next/i18n/en-src.json 그대로(quick.mjs 와 같음 — add.mjs 로 막 넣은 줄도 봄)
 *  · 보이는 글 = 빈칸 아닌 글 마디 중 글자 상자 1×1px 넘음 · checkVisibility 통과 · 1px 이하로 잘린 칸 안이 아님. 「제 글을 가진 칸」 = 그 글을 바로 품은 요소
 *  · u17 = 제 글을 가진 칸 중 font-size < 16.99px 인 칸의 수(문서 모두 — 위 띠 · 아래 단추 포함)
 *  · fs = 글씨 크기 가짓수(문서 모두 · 0.5px 반올림) · nt = 그중 토큰(17 · 19 · 21 · 24 · 30 · 48) 밖 크기
 *  · left = 왼쪽 줄(#view 안 · 블록마다 첫 글줄 왼쪽 x · 가운데 · 오른쪽 맞춤 블록은 뺌)
 *  · sp = 간격 토큰 밖 값(#view 안 그려진 칸의 margin · padding · gap 이 0 · 8 · 16 · 24 아닌 것 — auto · % 는 뺌 · 음수는 따로 neg) — 칸 수
 *  · card = 같은 부모 아래 같은 꼴(태그 + 앞 두 이름) 카드(바탕 · 그림자 · 네 변 테가 있고 높이 48px · 폭 100px 넘음) 둘 이상인 묶음 중 높이 차가 2px 넘는 묶음 수
 *  · gold = 금빛 글 블록(블록 글 색이 금빛) 중 글줄이 둘을 넘는 것의 수(접힌 노란 경고는 글이 안 보여 안 셈)
 *  · word = 옛 낱말(갈래 · 몸값 · 한 회사 한 표 · 큰 회사는 크게 · 20거래일 · 다섯 문 · 쉬는 돈) 수 · chap = 「챕터」 수 — 보이는 글 + aria-label · title · placeholder · alt + 창 제목 · [lang=ko] · [data-proper] 안은 뺌
 *  · 영어: han = 보이는 한글 글 마디 + 이름표의 한글 수([lang=ko] · [data-proper] 빼고 · 창 제목 포함) · miss = 사전에 없는 틀 수 · oldEn = 옛 뜻 영어(20 trading days · group · market cap · equal weight …) 수
 *  · #/shorts 덧붙임: 시황 칸마다 위 · 아래 빈 높이와 안쪽 48px 넘는 빈 곳(글 · 그림 상자를 y 로 합침) — 가장 큰 것 · 시황 칸 높이 차
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const {chromium} = createRequire('/opt/node-tools/')('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const A = process.argv.slice(2), arg = (k, d = null) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; }, has = k => A.includes('--' + k);
const BASE = String(arg('base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('out'), LABEL = arg('label', 'now');
const VW = Number(arg('w', 360)), VH = Number(arg('h', 640));
if (!OUT) { console.error('쓰는 법: node scripts/atlas11/next/measure_type.mjs --out <파일.json> [--label before|after] [--only …] [--no-en] [--no-ko]'); process.exit(2); }
const ROUTES = ['#/', '#/f/rise', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/group', '#/f/ind', '#/f/us', '#/today', '#/shorts', '#/why', '#/why/005930', '#/sub', '#/me', '#/find', '#/find/삼성', '#/gdr',
  '#/w/KOSPI', '#/w/005930', '#/w/005930/past', '#/w/005930/rivals', '#/w/005930/grow', '#/w/005930/range', '#/ch/g/semi', '#/ch/i/' + encodeURIComponent('해운'),
  '#/surge', '#/surge/10', '#/cal', '#/cond', '#/talk', '#/up', '#/time', '#/info', '#/x/005935', '/letter.html', '/hello.html'];
const ONLY = arg('only') ? arg('only').split(',') : null;
const routes = ONLY ?? ROUTES;
const T0 = Date.now(), log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);
const urlOf = (r, en) => { const u = r.startsWith('/') ? new URL(BASE + r) : new URL(BASE + '/next/?dev=1'); if (en) u.searchParams.set('lang', 'en'); if (!r.startsWith('/')) u.hash = r.replace(/^#/, ''); return u.href; };

/* 브라우저 — 켜 둔 빠른 검사 브라우저(quick.mjs)에 붙음 · 없으면 제 것을 띄움(이 기계 CPU 2 — 하나만) */
async function browserGet() {
  if (!has('own')) {
    const dir = process.env.QUICK_STATE || '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/quick';
    try { const st = JSON.parse(fs.readFileSync(path.join(dir, 'server.json'), 'utf8')); if (st?.ws) { const b = await chromium.connect(st.ws, {timeout: 8000}); try { const t = new Date(); fs.utimesSync(path.join(dir, 'last-used'), t, t); } catch { /* 못 적음 */ } return {b, shared: true}; } } catch { /* 없음 — 제 것 */ }
  }
  const exe = '/opt/pw-browsers/chromium';
  return {b: await chromium.launch(fs.existsSync(exe) ? {executablePath: exe} : {}), shared: false};
}
const enBody = (() => { try { const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8')); return JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 'measure_type — en-src.json 그대로', entities: S.entities, templates: S.templates}); } catch { return null; } })();

async function settle(p) {
  await p.waitForFunction(() => document.readyState === 'complete', null, {timeout: 15000}).catch(() => {});
  await p.waitForFunction(() => !document.querySelector('#view .boot, #lt .loading, main .loading'), null, {timeout: 20000, polling: 100}).catch(() => {});
  await p.waitForLoadState('networkidle', {timeout: 4000}).catch(() => {});
  await p.evaluate(() => document.fonts?.ready.then(() => true)).catch(() => {});
  await p.waitForFunction(() => { const a = document.querySelector('#view .m4-letter'); return !a || !a.classList.contains('intro'); }, null, {timeout: 12000, polling: 100}).catch(() => {});
  await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || !Number.isFinite(a.effect?.getComputedTiming?.().endTime)), null, {timeout: 6000, polling: 100}).catch(() => {});
  await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 0));
}

/** 한 화면 재기(쪽 안) */
const MT = ({en, shorts}) => {
  const vw = document.documentElement.clientWidth;
  const view = document.querySelector('#view') || document.body;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const TOK = [17, 19, 21, 24, 30, 48], SP = [0, 8, 16, 24];
  const clipCache = new Map();
  const clipped = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { if (clipCache.has(a)) { if (clipCache.get(a)) return true; continue; } const cs = getComputedStyle(a); let c = false; if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const r = a.getBoundingClientRect(); c = r.width <= 1 || r.height <= 1; } clipCache.set(a, c); if (c) return true; } return false; };
  const sel = el => { const c = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); return el.tagName.toLowerCase() + (c ? '.' + c : ''); };
  const R = document.createRange(), texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
    R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    if (clipped(el)) continue;
    texts.push({n, el, rs, inView: view.contains(el)});
  }
  const out = {url: location.href, title: document.title, px: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0), overflowX: document.documentElement.scrollWidth > vw};
  // 글씨
  const owners = new Map(); for (const t of texts) if (!owners.has(t.el)) owners.set(t.el, t);
  const fsAll = new Map(), small = new Map(); let u17 = 0;
  for (const [el, t] of owners) { const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2; fsAll.set(k, (fsAll.get(k) || 0) + 1); if (f < 16.99) { u17++; const s = small.get(k) || {n: 0, ex: sel(el) + ' 「' + t.n.nodeValue.trim().slice(0, 20) + '」'}; s.n++; small.set(k, s); } }
  out.u17 = u17; out.u17Sizes = Object.fromEntries([...small].sort((a, b) => a[0] - b[0]));
  out.fs = fsAll.size; out.sizes = [...fsAll.keys()].sort((a, b) => a - b); out.nt = out.sizes.filter(k => !TOK.includes(k));
  const ntEx = {}; for (const [el, t] of owners) { const k = Math.round(parseFloat(getComputedStyle(el).fontSize) * 2) / 2; if (!TOK.includes(k) && !ntEx[k]) ntEx[k] = sel(el) + ' 「' + t.n.nodeValue.trim().slice(0, 16) + '」'; } out.ntEx = ntEx;
  // 왼쪽 줄(M 과 같음)
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map(); for (const t of texts) { if (!t.inView) continue; const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = new Map(), xEx = {};
  for (const [b, t] of blocks) { const ta = getComputedStyle(b).textAlign; if (/center|right|end/.test(ta)) continue; const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); if (!xEx[x]) xEx[x] = sel(b) + ' 「' + t.n.nodeValue.trim().slice(0, 14) + '」'; }
  out.left = xs.size; out.lefts = Object.fromEntries([...xs].sort((a, b) => a[0] - b[0])); out.leftEx = xEx;
  // 간격(#view 안)
  const PROPS = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'];
  const spBad = new Map(); let spEls = 0, neg = 0; const negEx = [];
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    if (!el.getClientRects().length) continue;
    const m = el.computedStyleMap ? el.computedStyleMap() : null, cs = getComputedStyle(el); let bad = false;
    for (const pr of PROPS) {
      if (pr.endsWith('gap') && !/flex|grid/.test(cs.display)) continue;
      let v = null; const sv = m?.get(pr);
      if (sv && sv.constructor?.name === 'CSSKeywordValue') continue; // auto · normal
      if (sv && sv.constructor?.name === 'CSSUnitValue') { if (sv.unit === 'percent') continue; v = sv.unit === 'px' ? sv.value : parseFloat(cs.getPropertyValue(pr)); }
      else v = parseFloat(cs.getPropertyValue(pr));
      if (!Number.isFinite(v)) continue;
      if (v < -0.5) { neg++; if (negEx.length < 6) negEx.push(sel(el) + ' ' + pr + ' ' + Math.round(v)); bad = true; continue; }
      if (SP.some(s => Math.abs(s - v) < 0.6)) continue;
      const k = sel(el) + ' ' + pr.replace(/-(top|right|bottom|left)$/, '').replace('row-gap', 'gap').replace('column-gap', 'gap') + ' ' + (Math.round(v * 10) / 10);
      spBad.set(k, (spBad.get(k) || 0) + 1); bad = true;
    }
    if (bad) spEls++;
  }
  out.sp = spEls; out.neg = neg; out.negEx = negEx; out.spEx = [...spBad].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, n]) => k + ' ×' + n);
  // 카드 높이
  const cardLike = el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.height < 48 || r.width < 100) return false; const bg = cs.backgroundColor, a = /rgba?\(([^)]+)\)/.exec(bg); const alpha = a ? (a[1].split(',')[3] ?? '1') : '0'; const hasBg = Number(alpha) > 0.01 || cs.backgroundImage !== 'none'; const b4 = ['Top', 'Right', 'Bottom', 'Left'].every(s => parseFloat(cs['border' + s + 'Width']) > 0); return hasBg || cs.boxShadow !== 'none' || b4; };
  const groups = [];
  for (const P of [view, ...view.querySelectorAll('*')]) {
    if (P.closest('svg')) continue; if (P.children.length < 2) continue;
    const by = new Map(); for (const c of P.children) { if (!c.getClientRects().length) continue; const k = sel(c); if (!by.has(k)) by.set(k, []); by.get(k).push(c); }
    for (const [k, cs] of by) { if (cs.length < 2) continue; const cc = cs.filter(cardLike); if (cc.length < 2) continue; const hs = cc.map(c => Math.round(c.getBoundingClientRect().height)); const lo = Math.min(...hs), hi = Math.max(...hs); if (hi - lo > 2) groups.push({k: sel(P) + ' > ' + k, n: cc.length, lo, hi}); }
  }
  out.card = groups.length; out.cardEx = groups.slice(0, 8).map(g => g.k + ' ×' + g.n + ' ' + g.lo + '–' + g.hi);
  // 금빛 글 두 줄 넘음
  const isGold = c => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c); return !!m && Math.abs(m[1] - 233) + Math.abs(m[2] - 185) + Math.abs(m[3] - 73) < 40; };
  const gb = new Map(); for (const t of texts) { if (!isGold(getComputedStyle(t.el).color)) continue; const b = blockOf(t.el); if (!isGold(getComputedStyle(b).color)) continue; if (!gb.has(b)) gb.set(b, []); gb.get(b).push(t); }
  const goldBad = [];
  for (const [b, ts] of gb) { const tops = []; for (const t of texts) { if (!b.contains(t.el)) continue; for (const q of t.rs) if (!tops.some(y => Math.abs(y - q.top) <= 2)) tops.push(q.top); } if (tops.length > 2) goldBad.push(sel(b) + ' ' + tops.length + '줄 「' + (b.textContent || '').trim().slice(0, 22) + '」'); }
  out.gold = goldBad.length; out.goldEx = goldBad.slice(0, 8);
  // 낱말 · 영어
  const skipW = el => { const k = el?.closest?.('[lang="ko"], [data-proper]'); return !!k && k !== document.documentElement && k !== document.body; }; // 문서 말(html lang)은 빼지 않음 — 칸에 붙은 원문 · 이름 표시만
  const strs = []; for (const t of texts) if (!skipW(t.el)) strs.push(t.n.nodeValue);
  const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
  for (const el of document.body.querySelectorAll('[aria-label], [title], [placeholder], [alt]')) { if (skipW(el)) continue; for (const a of ATTRS) { const s = el.getAttribute(a); if (s) strs.push(s); } }
  strs.push(document.title);
  const WORDS = [['갈래', /갈래/g], ['몸값', /몸값/g], ['한 회사 한 표', /한 회사 한 표/g], ['큰 회사는 크게', /큰 회사는 크게/g], ['20거래일', /(?<![\d.])20\s?거래일/g], ['다섯 문', /다섯 문/g], ['쉬는 돈', /쉬는 돈/g]];
  const wc = {}; let words = 0; const wEx = [];
  for (const s of strs) for (const [w, re] of WORDS) { const n = (s.match(re) || []).length; if (n) { wc[w] = (wc[w] || 0) + n; words += n; if (wEx.length < 6) wEx.push(s.trim().slice(0, 30)); } }
  out.word = words; out.words = wc; out.wordEx = wEx;
  out.chap = strs.reduce((n, s) => n + (s.match(/챕터/g) || []).length, 0);
  if (en) {
    const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/; const hx = []; let han = 0;
    for (const s of strs) if (HAN.test(s)) { han++; if (hx.length < 8) hx.push(s.trim().slice(0, 40)); }
    out.han = han; out.hanEx = hx;
    try { out.miss = window.__atlasI18n?.missing?.().length ?? null; out.missEx = (window.__atlasI18n?.missing?.() || []).slice(0, 6).map(m => m.key.slice(0, 60)); } catch { out.miss = null; }
    const OLD = [/\b20[ -]trading[ -]days?\b/gi, /\bmarket caps?\b/gi, /\bequal weight/gi, /one company, one vote/gi, /big companies count more/gi, /\bfive (gates|checks)\b/gi, /\bvaluation\b/gi, /(?<!sector )\bgroups?\b/gi, /\bchapters?\b/gi]; // 「sector group」(큰 업종)은 새 뜻
    const oe = {}; let oldEn = 0; for (const s of strs) for (const re of OLD) { const mm = s.match(re); if (mm) { oldEn += mm.length; for (const x of mm) oe[x.toLowerCase()] = (oe[x.toLowerCase()] || 0) + 1; } }
    out.oldEn = oldEn; out.oldEnWords = oe;
  }
  if (shorts) {
    const secs = [...view.querySelectorAll('.sh')]; const per = [];
    for (const s of secs) {
      const sr = s.getBoundingClientRect(); const iv = [];
      for (const t of texts) if (s.contains(t.el)) for (const q of t.rs) iv.push([q.top, q.bottom]);
      for (const e of s.querySelectorAll('img, svg, video, canvas, input')) { if (e.tagName.toLowerCase() !== 'svg' && e.closest('svg')) continue; const q = e.getBoundingClientRect(); if (q.width > 1 && q.height > 1) iv.push([q.top, q.bottom]); }
      for (const e of s.querySelectorAll('a, button')) { const q = e.getBoundingClientRect(); if (q.width > 1 && q.height > 1) iv.push([q.top, q.bottom]); }
      iv.sort((a, b) => a[0] - b[0]); if (!iv.length) continue;
      let cur = [...iv[0]], inner = 0; for (const v of iv.slice(1)) { if (v[0] > cur[1]) { inner = Math.max(inner, v[0] - cur[1]); cur = [...v]; } else cur[1] = Math.max(cur[1], v[1]); }
      const top = iv[0][0] - sr.top, bottom = sr.bottom - Math.max(...iv.map(v => v[1]));
      per.push({h: Math.round(sr.height), top: Math.round(top), bottom: Math.round(bottom), inner: Math.round(inner)});
    }
    const hs = per.map(p => p.h);
    out.shorts = {n: per.length, maxGap: per.length ? Math.max(...per.map(p => Math.max(p.top, p.bottom, p.inner))) : null, hSpread: hs.length ? Math.max(...hs) - Math.min(...hs) : null, per};
  }
  return out;
};

const {b, shared} = await browserGet();
log(shared ? '켜 둔 브라우저에 붙음' : '제 브라우저를 띄움', '· 길', routes.length, '· 말', [has('no-ko') ? null : 'ko', has('no-en') ? null : 'en'].filter(Boolean).join(' '));
const res = {label: LABEL, at: new Date().toISOString(), base: BASE, vw: VW, vh: VH, routes: {}};
for (const lang of ['ko', 'en']) {
  if ((lang === 'ko' && has('no-ko')) || (lang === 'en' && has('no-en'))) continue;
  for (const r of routes) {
    const ctx = await b.newContext({viewport: {width: VW, height: VH}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (lang === 'en' && enBody) await ctx.route(/\/next\/i18n\/en\.json(\?|$)/, q => q.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body: enBody}));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    let m; const t = Date.now();
    try { await p.goto(urlOf(r, lang === 'en'), {waitUntil: 'domcontentloaded', timeout: 30000}); await settle(p); m = await p.evaluate(MT, {en: lang === 'en', shorts: r === '#/shorts'}); }
    catch (e) { m = {error: String(e.message).slice(0, 200)}; }
    m.ms = Date.now() - t; if (errs.length) m.errs = errs.slice(0, 3);
    await ctx.close();
    (res.routes[r] ??= {})[lang] = m;
    log(lang, r, m.error ? '오류 ' + m.error : `u17 ${m.u17} · fs ${m.fs}${m.nt?.length ? '(밖 ' + m.nt.join('/') + ')' : ''} · left ${m.left} · sp ${m.sp}/neg ${m.neg} · card ${m.card} · gold ${m.gold} · word ${m.word} · chap ${m.chap}` + (lang === 'en' ? ` · han ${m.han} · miss ${m.miss} · oldEn ${m.oldEn}` : '') + (m.shorts ? ` · 시황 빈곳 ${m.shorts.maxGap} · 칸높이차 ${m.shorts.hSpread}` : ''));
  }
}
if (!shared) await b.close(); else await b.close().catch(() => {});
fs.mkdirSync(path.dirname(path.resolve(OUT)), {recursive: true});
fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
const cell = (m, en) => !m ? '–' : m.error ? '오류' : [m.u17, m.fs + (m.nt?.length ? '(' + m.nt.join('/') + ')' : ''), m.left, m.sp + (m.neg ? '/−' + m.neg : ''), m.card, m.gold, m.word, m.chap, ...(en ? [m.han, m.miss, m.oldEn] : [])].join(' · ');
const md = [`# 낱말 · 글씨 · 간격 재기(${LABEL}) — ${res.at} · ${((Date.now() - T0) / 1000).toFixed(0)}초`, '', `앱 ${BASE}/next/?dev=1 · ${VW}×${VH} · 자(규칙)는 \`scripts/atlas11/next/measure_type.mjs\` 머리말`, '',
  '칸 차례: 17px 아래 · 글씨 가짓수(토큰 밖) · 왼쪽 줄 · 간격 토큰 밖 칸(/음수) · 높이 다른 카드 묶음 · 두 줄 넘는 금빛 글 · 옛 낱말 · 챕터 (영어는 + 한글 남음 · 사전에 없는 틀 · 옛 뜻 영어)', '',
  '| 길 | 한국어 | 영어 |', '|---|---|---|', ...Object.entries(res.routes).map(([r, x]) => `| \`${r}\` | ${cell(x.ko)} | ${cell(x.en, true)} |`)];
const sh = res.routes['#/shorts']?.ko?.shorts; if (sh) md.push('', `시황: 칸 ${sh.n} · 가장 큰 빈 곳 ${sh.maxGap}px · 칸 높이 차 ${sh.hSpread}px · 칸마다(위/아래/안) ${sh.per.map(p => p.top + '/' + p.bottom + '/' + p.inner).join(' · ')}`);
fs.writeFileSync(OUT.replace(/\.json$/, '') + '.md', md.join('\n') + '\n');
log('끝 →', OUT);

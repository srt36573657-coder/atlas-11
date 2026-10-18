#!/usr/bin/env node
/**
 * V7 — 회사 화면과 길(사장님 말씀 order-0015 [7] 1 ~ 10)을 만든 일꾼이 아닌 일꾼이 따로 재는 검사 + 「보유종목 바로 가기를 줄인 뒤에도 모든 화면에 첫 화면에서 3번 안에 닿나」 (2026-10-18)
 *
 * 쓰는 법  node scripts/atlas11/next/verify/v7.mjs [--base http://127.0.0.1:8826] [--only 1,2,5,reach] [--json 파일] [--shots 폴더]
 *   브라우저는 한 번에 하나(칸 context 는 잴 때마다 새로) · 한국어 360×640 · 영어(&lang=en) 390×640 · 사이트 자료는 서버에서 받아 노드에서 다시 셈(화면 코드를 읽어 셈을 베끼지 않음)
 *   판정 = PASS(말씀 그대로) · PARTIAL(한 부분이 어긋남) · FAIL(못 지킴) · 끝 코드 0 = FAIL 없음 · 1 = FAIL 있음
 *   흉내(사이트 파일은 안 고침): 고도리 칸 고른 곳(gdr.json 응답 바꿔치기) · 가입한 사람(/api/kakao/me 응답 바꿔치기 + ?kakaodev=1) · 담은 업종(localStorage)
 * 재는 것(말씀 번호)  1 [7] 1 · 2 [7] 2 · 3 [7] 3 · 4 [7] 4 · 5 [7] 5 · 6 [7] 6 · 7 [7] 7 · 8 [7] 8 · 9 [7] 9 · 10 [7] 10 · reach 모든 화면 3번 안에 닿기
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const {chromium} = createRequire('/opt/node-tools/')('playwright');
const SELF = fileURLToPath(import.meta.url), ROOT = path.resolve(path.dirname(SELF), '../../../..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASE = String(opt('--base', process.env.V7_BASE || 'http://127.0.0.1:8826')).replace(/\/$/, '');
const ONLY = opt('--only', '') ? new Set(String(opt('--only')).split(',')) : null;
const JSON_OUT = opt('--json', null), SHOTS = opt('--shots', null);
const want = k => !ONLY || ONLY.has(String(k));
const log = (...a) => console.error('[v7]', ...a);
if (SHOTS) fs.mkdirSync(SHOTS, {recursive: true});

/* ───────── 자료(서버에서 받아 노드에서 다시 셈) ───────── */
const cache = new Map();
const J = p => { if (!cache.has(p)) cache.set(p, fetch(BASE + p).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(p); };
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
const dayOfL = l => (Array.isArray(l) && l.length > 1 && l[l.length - 2] > 0 && l[l.length - 1] > 0 ? (l[l.length - 1] / l[l.length - 2] - 1) * 100 : null);
const oddL = l => { if (!Array.isArray(l) || l.length < 3 || l.some(v => !(v > 0))) return true; for (let i = 1; i < l.length; i++) if (Math.abs(l[i] / l[i - 1] - 1) >= 0.3) return true; const n = l.length; return l[n - 1] === l[n - 2] && l[n - 2] === l[n - 3]; };
const enc = encodeURIComponent;
const num = n => Number(n).toLocaleString('en-US');

const R = []; // {id, item, ask, measured: [..], verdict, extra}
const put = (id, item, ask, verdict, measured, extra = {}) => { R.push({id: String(id), item, ask, verdict, measured, ...extra}); log(id, verdict, item); };
const worst = (...v) => (v.includes('FAIL') ? 'FAIL' : v.includes('PARTIAL') ? 'PARTIAL' : 'PASS');

/* ───────── 브라우저 도우미 ───────── */
const CFG = {ko: {w: 360, h: 640, lang: 'ko'}, en: {w: 390, h: 640, lang: 'en'}};
const urlOf = (cfg, hash = '#/', extra = '') => `${BASE}/next/?dev=1${cfg.lang === 'en' ? '&lang=en' : ''}${extra}${hash}`;
async function settle(page, ms = 700) {
  await page.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view')?.children.length > 0, null, {timeout: 40000}).catch(() => {});
  await page.waitForLoadState('networkidle', {timeout: 12000}).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(ms);
}
async function open(browser, cfg, {hash = '#/', seed = null, route = null, extra = ''} = {}) {
  const ctx = await browser.newContext({viewport: {width: cfg.w, height: cfg.h}, locale: cfg.lang === 'en' ? 'en-US' : 'ko-KR', serviceWorkers: 'block', acceptDownloads: true});
  if (seed) await ctx.addInitScript(seed.fn, seed.arg);
  const page = await ctx.newPage(), S = {ctx, page, errs: [], cfg};
  page.on('pageerror', e => S.errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) S.errs.push('console.error: ' + m.text().slice(0, 160)); });
  if (route) await route(page, ctx);
  await page.goto(urlOf(cfg, hash, extra), {waitUntil: 'domcontentloaded', timeout: 60000});
  await settle(page);
  return S;
}
const close = async S => { try { await S.ctx.close(); } catch { /* 닫음 */ } };
async function go(S, hash, ms = 700) {
  await S.page.evaluate(h => { location.hash = h; }, hash);
  await S.page.waitForTimeout(150);
  await settle(S.page, ms);
}
const shot = async (S, name) => { if (SHOTS) await S.page.screenshot({path: path.join(SHOTS, name + '.png')}).catch(() => {}); };

/* ───────── 화면 안에서 재는 조각(문자열 함수로 한 번만 정의) ───────── */
/** 회사 화면 머리 — 이름 · 길 표시 · 이름 밑 첫 줄 · 꼬리표 · 탭 넷 (class 이름이 아니라 주소 꼴 · 글로 찾음) */
const HEADER = code => {
  const view = document.querySelector('#view'), vh = innerHeight, vw = innerWidth;
  const rc = e => { const r = e.getBoundingClientRect(); return {x: Math.round(r.left * 10) / 10, y: Math.round((r.top + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, b: Math.round((r.bottom + scrollY) * 10) / 10, r: Math.round(r.right * 10) / 10}; };
  const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
  scrollTo(0, 0);
  const bar = document.querySelector('nav.tabs'), barTop = bar ? bar.getBoundingClientRect().top : vh;
  const h1 = [...view.querySelectorAll('h1')].find(vis), out = {vh, vw, barTop, docW: document.documentElement.scrollWidth, name: h1 ? {text: h1.textContent.trim(), ...rc(h1), fs: parseFloat(getComputedStyle(h1).fontSize)} : null};
  if (!h1) return out;
  const nameTop = rc(h1).y, nameBot = rc(h1).b;
  // 길 표시 = 이름 위에 있는 큰 업종 · 업종 주소 두 개
  const gA = [...view.querySelectorAll('a[href^="#/ch/g/"]')].filter(vis), iA = [...view.querySelectorAll('a[href^="#/ch/i/"]')].filter(vis);
  const above = a => rc(a).b <= nameTop + 1;
  out.path = {g: gA.filter(above).map(a => ({text: a.textContent.trim(), href: a.getAttribute('href'), ...rc(a)})), i: iA.filter(above).map(a => ({text: a.textContent.trim(), href: a.getAttribute('href'), ...rc(a)}))};
  const pa = out.path.g[0] && out.path.i[0] ? [gA.filter(above)[0], iA.filter(above)[0]] : null;
  if (pa) { let c = pa[0].parentElement; while (c && !c.contains(pa[1])) c = c.parentElement; out.path.box = {text: c.innerText.replace(/\s+/g, ' ').trim(), ...rc(c), tag: c.tagName.toLowerCase() + '.' + c.className}; }
  // 이름 밑 첫 줄
  let nx = h1.nextElementSibling; while (nx && !vis(nx)) nx = nx.nextElementSibling;
  if (nx) {
    const txt = nx.innerText.replace(/\s+/g, ' ').trim();
    const nodes = []; const wk = document.createTreeWalker(nx, NodeFilter.SHOW_TEXT); let t; while ((t = wk.nextNode())) { const s = t.nodeValue.trim(); if (s) nodes.push({s, fs: parseFloat(getComputedStyle(t.parentElement).fontSize), fw: getComputedStyle(t.parentElement).fontWeight}); }
    out.now = {text: txt, tag: nx.tagName.toLowerCase() + '.' + nx.className, ...rc(nx), nodes};
  }
  // 모든 안내 ▶ 표시
  const tri = /[▶►⏵▷‣⯈⏩]/;
  out.play = {text: tri.test(view.innerText), els: view.querySelectorAll('.play').length, visEls: [...view.querySelectorAll('.play')].filter(vis).length, pseudo: []};
  for (const e of [...view.querySelectorAll('*')].slice(0, 400)) for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps).content; if (c && c !== 'none' && c !== 'normal' && tri.test(c)) out.play.pseudo.push((e.className || e.tagName) + ps + '=' + c); }
  // 꼬리표(든 목록) = 이름 밑의 목록 주소
  const tagA = [...view.querySelectorAll('a[href^="#/gdr"], a[href^="#/surge"], a[href^="#/f/pick"], a[href^="#/f/lead"], a[href^="#/cal"]')].filter(vis).filter(a => rc(a).y >= nameBot - 1 && rc(a).y < nameBot + 400);
  out.tags = tagA.map(a => ({text: a.textContent.trim(), href: a.getAttribute('href'), ...rc(a)}));
  // 탭 넷 = 4 ~ 7단 주소 넷
  const tabRe = new RegExp('^#/w/' + code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/(past|rivals|grow|range)$');
  let tabsA = [...view.querySelectorAll('a')].filter(a => tabRe.test(a.getAttribute('href') || '')).filter(vis).filter(a => rc(a).y >= nameBot - 1);
  if (tabsA.length) { let c = tabsA[0].parentElement; while (c && c !== view && [...c.querySelectorAll('a')].filter(a => tabRe.test(a.getAttribute('href') || '')).length < 4) c = c.parentElement; if (c && c !== view) tabsA = tabsA.filter(a => c.contains(a)); }
  out.tabsAll = [...view.querySelectorAll('a')].filter(a => tabRe.test(a.getAttribute('href') || '')).length;
  out.tabs = tabsA.map(a => ({text: a.textContent.trim().replace(/\s+/g, ' '), href: a.getAttribute('href'), ...rc(a)}));
  if (tabsA.length) { let c = tabsA[0].parentElement; while (c && !tabsA.every(a => c.contains(a))) c = c.parentElement; out.tabsBox = {...rc(c), sw: c.scrollWidth, cw: c.clientWidth, ox: getComputedStyle(c).overflowX, tag: c.tagName.toLowerCase() + '.' + c.className}; }
  // 옛 7단 한 줄(큰 업종 · 업종 · 회사 · 4 ~ 7단 모두 한 묶음) 있나
  const stepRe = new RegExp('^#/(ch/g/|ch/i/|w/' + code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(/(past|rivals|grow|range))?$)');
  out.chaps7 = [...view.querySelectorAll('.chaps, nav, div, section')].filter(vis).filter(e => e.matches('.chaps') || [...e.querySelectorAll('a')].filter(a => stepRe.test(a.getAttribute('href') || '')).length >= 5).filter(e => e.querySelectorAll('a').length <= 12).map(e => ({tag: e.tagName.toLowerCase() + '.' + e.className, links: e.querySelectorAll('a').length, ...rc(e)}));
  // 한글(영어 화면에 남은 것) — 머리 칸에서 고유 이름 밖
  out.hangulEn = [];
  if (document.documentElement.lang === 'en' || /lang=en/.test(location.search)) for (const e of [out.now && nx, ...(pa || []), ...tabsA].filter(Boolean)) { if (/[가-힣]/.test(e.innerText) && !e.closest('[data-proper],[lang="ko"]')) out.hangulEn.push(e.innerText.trim().slice(0, 40)); }
  return out;
};

/** 겹침 · 음수 간격 — #view 안의 보이는 칸(배경 · 테두리 · 그림자 · 누르는 것 · 그림) 끼리 겹침 + 글 끼리 겹침 + 음수 margin
 *  보이는 부분만: 접힌 칸(details 닫힘) · 잘린 칸(overflow · 1px 숨김 글) · 안 보이는 칸은 뺌 */
const OVERLAP = () => {
  const view = document.querySelector('#view'); scrollTo(0, 0);
  const csC = new Map(), getCs = e => { let c = csC.get(e); if (!c) { c = getComputedStyle(e); csC.set(e, c); } return c; };
  const clipC = new Map();
  /** 이 칸의 눈에 보이는 사각형(조상이 자르는 만큼 잘라냄) — 안 보이면 null */
  const visRect = e => {
    let r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return null;
    let box = {l: r.left, t: r.top, r: r.right, b: r.bottom};
    for (let a = e.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      let k = clipC.get(a);
      if (k === undefined) { const c = getCs(a); if (c.display === 'none') k = 'none'; else if (a.tagName === 'DETAILS' && !a.open) k = {details: true}; else if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const q = a.getBoundingClientRect(); k = {l: q.left, t: q.top, r: q.right, b: q.bottom}; } else k = null; clipC.set(a, k); }
      if (k === 'none') return null;
      if (k && k.details) { const sm = e.closest('summary'); if (!(sm && sm.parentElement === a)) return null; continue; }
      if (k) { box = {l: Math.max(box.l, k.l), t: Math.max(box.t, k.t), r: Math.min(box.r, k.r), b: Math.min(box.b, k.b)}; if (box.r - box.l <= 0 || box.b - box.t <= 0) return null; }
    }
    return box;
  };
  const vis = e => { const c = getCs(e); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0 && c.contentVisibility !== 'hidden' && !(c.clip && c.clip.startsWith('rect(') && /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(c.clip)); };
  const nm = e => (e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (e.textContent ? '「' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 14) + '」' : ''));
  const all = [...view.querySelectorAll('*')].filter(e => !e.closest('svg') || e.tagName.toLowerCase() === 'svg').filter(vis);
  const neg = [];
  for (const e of all) { const cs = getCs(e); for (const k of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) { const v = parseFloat(cs[k]); if (v < 0 && visRect(e)) neg.push({el: nm(e), prop: k.replace('margin', 'margin-').toLowerCase(), v}); } }
  const boxy = e => { const cs = getCs(e); const pos = cs.position; if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') return false; const t = e.tagName.toLowerCase(); if (['a', 'button', 'input', 'select', 'textarea', 'img', 'svg', 'canvas', 'summary', 'details', 'h1', 'h2', 'h3', 'li'].includes(t)) return true; const bg = cs.backgroundColor, bi = cs.backgroundImage, bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth); return (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || (bi && bi !== 'none') || bw > 0 || (cs.boxShadow && cs.boxShadow !== 'none'); };
  const boxes = []; for (const e of all) if (boxy(e)) { const v = visRect(e); if (v) boxes.push({e, v}); }
  const pairs = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const w = Math.min(a.v.r, b.v.r) - Math.max(a.v.l, b.v.l), h = Math.min(a.v.b, b.v.b) - Math.max(a.v.t, b.v.t);
    if (w >= 2 && h >= 2) pairs.push({a: nm(a.e), b: nm(b.e), w: Math.round(w), h: Math.round(h), y: Math.round(Math.max(a.v.t, b.v.t) + scrollY)});
  }
  const tx = []; const wk = document.createTreeWalker(view, NodeFilter.SHOW_TEXT); let t;
  while ((t = wk.nextNode())) {
    const s = t.nodeValue.trim(); if (!s) continue; const p = t.parentElement; if (!p || p.closest('svg') || !vis(p)) continue;
    const v = visRect(p); if (!v) continue; const pr = p.getBoundingClientRect(); if (pr.width <= 2 || pr.height <= 2) continue; // 1px 숨김 글(스크린리더용)
    const rg = document.createRange(); rg.selectNodeContents(t);
    for (const r of rg.getClientRects()) if (r.width > 1 && r.height > 1) { const l = Math.max(r.left, v.l), tt = Math.max(r.top, v.t), rr = Math.min(r.right, v.r), bb = Math.min(r.bottom, v.b); if (rr - l > 1 && bb - tt > 1) tx.push({p, s: s.slice(0, 14), r: {left: l, top: tt, right: rr, bottom: bb, width: rr - l, height: bb - tt}}); }
  }
  const tpairs = [];
  for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) {
    const a = tx[i], b = tx[j]; if (a.p === b.p || a.p.contains(b.p) || b.p.contains(a.p)) continue;
    const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (w > 2 && h > 2 && (w * h) / Math.min(a.r.width * a.r.height, b.r.width * b.r.height) > 0.2) tpairs.push({a: a.s, b: b.s, w: Math.round(w), h: Math.round(h), y: Math.round(Math.max(a.r.top, b.r.top) + scrollY)});
  }
  return {neg, pairs: pairs.slice(0, 12), nPairs: pairs.length, tpairs: tpairs.slice(0, 8), nT: tpairs.length, nBoxes: boxes.length, docW: document.documentElement.scrollWidth, vw: innerWidth, H: document.documentElement.scrollHeight};
};

/* ───────── 자료 준비 ───────── */
const [mkt, core, surge, cond, home, gdr, tr, sum] = await Promise.all([J('/atlas/data/mkt.json'), J('/atlas/data/core.json'), J('/atlas/data/surge.json'), J('/atlas/data/cond.json'), J('/atlas/data/home.json'), J('/next/data/gdr.json'), J('/atlas/data/surgetr.json'), J('/next/data/home-summary.json')]);
if (!mkt || !core) { console.error('[v7] 자료를 못 받음 — 서버가 켜져 있나 확인'); process.exit(2); }
const CO = mkt.companies;
const grpOfInd = new Map(); for (const g of core.groups) for (const n of g.inds || []) grpOfInd.set(n, g);
const indBy = new Map(core.industries.map(i => [i.name, i]));
const membersOfInd = new Map(); for (const [c, o] of Object.entries(CO)) { if (!membersOfInd.has(o.i)) membersOfInd.set(o.i, []); membersOfInd.get(o.i).push(c); }
const sMem = new Set((surge?.members || []).map(m => m.c));
const bandSet = {}; for (const k of ['b10', 'b20', 'b30', 'b40']) bandSet[k] = new Set((surge?.bands?.[k]?.members || []).map(m => m.c));
const leadSet = new Set(); if (cond?.co?.c) cond.co.c.forEach((c, k) => { if (cond.co.rk[k] === 1 && CO[c] && Array.isArray(cond.co.l5[k]) && Number.isFinite(cond.co.r5[k])) leadSet.add(c); });
const pickSet = new Set(Object.entries(CO).filter(([, o]) => o.p).map(([c]) => c));
const gdrPicks = Array.isArray(gdr?.picks) ? gdr.picks : [];
const asOf = mkt.asOf;
const A = '005930';
const B = [...sMem].find(c => bandSet.b40.has(c) && CO[c]) || [...sMem].find(c => CO[c]);
const C = [...pickSet].find(c => !sMem.has(c) && leadSet.has(c)) || [...pickSet].find(c => !sMem.has(c));
const D = Object.keys(CO).filter(c => !sMem.has(c) && !pickSet.has(c) && !leadSet.has(c) && !gdrPicks.some(p => p.code === c) && !Object.values(bandSet).some(s => s.has(c))).sort((p, q) => (CO[q].n.length - CO[p].n.length) || (p < q ? -1 : 1))[0];
const CODES = [A, B, C, D];

const expTags = (c, gd = gdrPicks) => { const t = []; for (const p of gd) if (p.code === c) t.push({k: 'gdr', href: '#/gdr/' + p.no, text: '고도리 칸 ' + p.no + '번'}); if (sMem.has(c)) t.push({k: 'surge', href: '#/surge', text: '급등 칸'}); for (const [k, nm] of [['b10', '10%대'], ['b20', '20%대'], ['b30', '30%대'], ['b40', '40% 이상']]) if (bandSet[k].has(c)) t.push({k, href: '#/surge/' + k.slice(1), text: '급등 ' + nm + ' 칸'}); if (pickSet.has(c)) t.push({k: 'pick', href: '#/f/pick', text: '고른 곳'}); return t; };
const tagMax = Object.keys(CO).map(c => [c, expTags(c, []).length]).sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1));
const E = tagMax[0][0], nTag3 = tagMax.filter(x => x[1] >= 3).length;
log('codes', CODES.join(' '), '꼬리표 최다', E, tagMax[0][1], '개 · 3개 이상인 회사', nTag3, 'asOf', asOf, 'gdr picks', gdrPicks.length, '대장주', leadSet.size, '고른 곳', pickSet.size, '급등', sMem.size);

const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
try {
  /* ═════════ 1 · 2 · 3 · 4 회사 화면(코드 넷 · 한국어 360×640 · 영어 390×640) ═════════ */
  if (want(1) || want(2) || want(3) || want(4)) {
    const per = {ko: {}, en: {}};
    for (const lang of ['ko', 'en']) for (const code of CODES) {
      const S = await open(browser, CFG[lang], {hash: '#/w/' + code});
      per[lang][code] = await S.page.evaluate(HEADER, code); per[lang][code].errs = S.errs;
      if (code === A) await shot(S, 'w-' + code + '-' + lang);
      await close(S);
    }
    // 고도리 칸 고른 곳이 0곳이라 가짜 응답(gdr.json picks 둘)으로 꼬리표 셋짜리 회사도 잼
    const mockS = await open(browser, CFG.ko, {hash: '#/w/' + A, route: async page => page.route('**/next/data/gdr.json', async r => { const resp = await r.fetch(); const j = await resp.json(); j.picks = [{no: 1, code: A, name: CO[A].n, w: 10, why: []}, {no: 2, code: B, name: CO[B].n, w: 10, why: []}]; j.counts = {...(j.counts || {}), picked: 2}; await r.fulfill({response: resp, json: j}); })});
    const mock = {g1: await mockS.page.evaluate(HEADER, A)}; await go(mockS, '#/w/' + B); mock.g2 = await mockS.page.evaluate(HEADER, B); await go(mockS, '#/w/' + D); mock.g3 = await mockS.page.evaluate(HEADER, D);
    await go(mockS, '#/w/' + A); mock.click = null; { const a1 = mockS.page.locator('#view a[href="#/gdr/1"]').first(); if (await a1.count()) { await a1.click(); await settle(mockS.page, 600); mock.click = await mockS.page.evaluate(() => ({h: location.hash, err: !!document.querySelector('#view .empty')})); } }
    await close(mockS);
    // ── [7] 1 오늘 값 · 오늘 등락 크게 · ▶ 없음
    {
      const m = [], bad = [];
      const PX = {}; for (const code of CODES) { const cf = await J('/atlas/data/co/' + code + '.json'); PX[code] = cf?.c?.price ?? (Array.isArray(cf?.close) ? cf.close[cf.close.length - 1] : null); } // 오늘 값 = 회사 파일 값(고른 곳은 종가 끝)
      for (const lang of ['ko', 'en']) for (const code of CODES) {
        const o = per[lang][code], n = o.name, nw = o.now; const tag = lang + ' ' + code + ' ' + (CO[code]?.n ?? '');
        if (!n || !nw) { bad.push(tag + ': 이름 또는 이름 밑 줄이 없음'); continue; }
        const priceTxt = nw.text, day = dayOfL(CO[code].l), cj = null;
        const pr = (CO[code].price ?? null);
        const nums = [...priceTxt.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map(x => x[0]);
        const pm = priceTxt.match(/([+\-−–]?\d+(?:\.\d+)?)\s*%/), shown = pm ? Number(pm[1].replace(/[−–]/, '-')) : null;
        const shownPx = nums.length ? Number(nums[0].replace(/,/g, '')) : null, pxOk = PX[code] != null && shownPx === Number(PX[code]);
        const dayOk = shown != null && day != null && Math.abs(Math.abs(shown) - Math.abs(r1(day))) < 0.11 && (Math.sign(shown) === Math.sign(r1(day)) || shown === 0);
        const fsP = nw.nodes.filter(x => /\d{1,3}(,\d{3})+|\d{3,}|^\?$/.test(x.s) && !/%/.test(x.s)).map(x => x.fs), fsD = nw.nodes.filter(x => /%/.test(x.s)).map(x => x.fs);
        const big = Math.min(...fsP, ...fsD), under = nw.y >= n.b - 1 && o.now && !o.chaps7.length;
        const firstScreen = nw.b <= o.barTop + 0.5;
        m.push(`${tag}: 이름 ${n.fs}px · 첫 줄 「${priceTxt.slice(0, 36)}」 ${nw.y}→${nw.b}px(탭 막대 ${o.barTop}) · 값 ${Math.max(...fsP)}px · 등락 ${Math.max(...fsD)}px · 자료 값 ${PX[code] == null ? '?' : Number(PX[code]).toLocaleString('en-US')}원 ${pxOk ? '맞음' : '다름'} · 자료 하루 ${r1(day)}% ${dayOk ? '맞음' : '다름'} · ▶ ${o.play.text || o.play.visEls || o.play.pseudo.length ? '있음' : '없음'}`);
        if (!(big >= 25)) bad.push(tag + ': 값 · 등락 글씨 ' + big + 'px < 25');
        if (!dayOk) bad.push(tag + ': 하루 등락 ' + shown + ' ≠ 자료 ' + r1(day));
        if (!pxOk) bad.push(tag + ': 오늘 값 ' + shownPx + ' ≠ 자료 ' + PX[code]);
        if (!firstScreen) bad.push(tag + ': 값 줄 끝 ' + nw.b + ' > 탭 막대 ' + o.barTop + '(첫 화면 밖)');
        if (nw.y < n.b - 1) bad.push(tag + ': 값 줄이 이름 위');
        if (o.play.text || o.play.visEls || o.play.pseudo.length) bad.push(tag + ': ▶ 표시 남음 ' + JSON.stringify(o.play));
        if (o.docW > o.vw + 1) bad.push(tag + ': 옆으로 넘침 ' + o.docW + ' > ' + o.vw);
      }
      put(1, '회사 이름 밑 첫 줄에 오늘 값 · 오늘 등락 크게 · ▶ 뺌', '이름 밑 첫 줄 = 오늘 값 · 오늘 등락(크게) · ▶ 없음 · 숫자가 첫 화면 안', bad.length ? 'FAIL' : 'PASS', m, {bad});
    }
    // ── [7] 2 길 표시 이름 위 (큰 업종 › 업종)
    {
      const m = [], bad = [];
      for (const lang of ['ko', 'en']) for (const code of CODES) {
        const o = per[lang][code], tag = lang + ' ' + code; const I = indBy.get(CO[code].i), g = grpOfInd.get(CO[code].i);
        const g0 = o.path?.g?.[0], i0 = o.path?.i?.[0];
        if (!g0 || !i0) { bad.push(tag + ': 길 표시 없음(큰 업종 ' + !!g0 + ' · 업종 ' + !!i0 + ')'); continue; }
        const okHref = g0.href === '#/ch/g/' + enc(g?.id) && i0.href === '#/ch/i/' + enc(CO[code].i);
        const sameRow = Math.abs(g0.y - i0.y) < 6 && g0.x < i0.x;
        const koText = lang === 'ko' ? (o.path.box?.text) : null;
        const expText = lang === 'ko' ? `${g?.short || g?.name} › ${CO[code].i} 업종` : null;
        m.push(`${tag}: 「${o.path.box?.text}」 이름 위 ${g0.y}~${g0.b}px < 이름 ${o.name.y}px · 누르는 칸 높이 ${g0.h}px · 주소 ${okHref ? '맞음' : '다름'}${expText ? ' · 말씀 꼴 ' + (koText?.replace(/\s+/g, '') === expText.replace(/\s+/g, '') ? '같음' : '다름(' + expText + ')') : ''}`);
        if (!okHref) bad.push(tag + ': 길 주소 ' + g0.href + ' · ' + i0.href);
        if (!sameRow) bad.push(tag + ': 큰 업종 · 업종이 한 줄이 아님');
        if (lang === 'ko' && koText?.replace(/\s+/g, '') !== expText.replace(/\s+/g, '')) bad.push(tag + ': 글 ' + koText + ' ≠ ' + expText);
        if (o.chaps7.length) bad.push(tag + ': 옛 7단 줄 남음 ' + JSON.stringify(o.chaps7));
      }
      const hs = [...new Set(['ko', 'en'].flatMap(l => CODES.map(c => per[l][c].path?.g?.[0]?.h)))];
      put(2, '1 · 2단은 이름 위 길 표시(반도체 › 반도체 업종) · 7단 줄 없음', '이름 위에 큰 업종 › 업종 한 줄 · 옛 7단 줄 없음', bad.length ? 'FAIL' : (Math.min(...hs) < 44 ? 'PARTIAL' : 'PASS'), m.concat(['길 표시 누르는 칸 높이(px): ' + hs.join(' / ') + (Math.min(...hs) < 44 ? ' — 44px 아래(말씀은 탭 · 돌아가기에만 44px 못 박음 · 일꾼 규칙은 누르는 곳 44px 이상)' : '')]), {bad});
    }
    // ── [7] 3 탭 넷
    {
      const m = [], bad = [], badFirst = [], want4 = ['past', 'rivals', 'grow', 'range'];
      const koNames = ['지나온 길', '누구와 다투나', '앞으로 클까?', '범위'];
      for (const lang of ['ko', 'en']) for (const code of CODES) {
        const o = per[lang][code], tag = lang + ' ' + code, t = o.tabs || [];
        const hrefs = t.map(x => x.href.split('/').pop());
        const inside = t.every(x => x.x >= -0.5 && x.r <= o.vw + 0.5);
        const minH = Math.min(...t.map(x => x.h)), minW = Math.min(...t.map(x => x.w));
        const noScroll = o.tabsBox ? o.tabsBox.sw <= o.tabsBox.cw + 1 : false;
        const underName = t.every(x => x.y >= o.name.b - 1), oneRow = t.length && Math.max(...t.map(x => x.y)) - Math.min(...t.map(x => x.y)) < 6;
        const inFirst = t.length && Math.max(...t.map(x => x.b)) <= o.barTop + 0.5;
        m.push(`${tag}: 탭 ${t.length}개 ${hrefs.join(' · ')} · 줄 ${t.length ? Math.round(Math.min(...t.map(x => x.y))) + '~' + Math.round(Math.max(...t.map(x => x.b))) : '-'}px(탭 막대 ${Math.round(o.barTop)}) · 높이 ${minH}px · 너비 ${minW}px~ · 화면 안 ${inside ? '예' : '아니오'} · 옆으로 밀기 ${noScroll ? '없음' : '있음'} · 한 줄 ${oneRow ? '예' : '아니오'} · 첫 화면(탭 막대 위) ${inFirst ? '예' : '아니오'}`);
        if (t.length !== 4 || hrefs.join() !== want4.join()) bad.push(tag + ': 탭이 넷이 아님/차례 다름 ' + hrefs.join());
        if (!inside) bad.push(tag + ': 화면 밖으로 나간 탭 있음');
        if (!noScroll) bad.push(tag + ': 탭 칸이 옆으로 밀림');
        if (minH < 44 || minW < 44) bad.push(tag + ': 탭 ' + minW + '×' + minH + ' < 44');
        if (!underName) bad.push(tag + ': 이름 밑이 아님');
        if (lang === 'ko' && t.map(x => x.text).join('|') !== koNames.join('|')) bad.push(tag + ': 탭 글 ' + t.map(x => x.text).join('|'));
        if (!inFirst) badFirst.push(tag + ': 탭 줄 끝 ' + Math.round(Math.max(...t.map(x => x.b))) + 'px > 탭 막대 ' + Math.round(o.barTop) + 'px(첫 화면 밖 · 아래 단추에 가림 · 이름 밑 꼬리표 ' + (o.tags || []).length + '개)');
      }
      m.push(`고도리 칸 흉내(꼬리표 ${mock.g2.tags.length}개짜리 회사 ${B} 한국어 360×640): 탭 줄 ${mock.g2.tabs.length ? Math.round(Math.min(...mock.g2.tabs.map(x => x.y))) + '~' + Math.round(Math.max(...mock.g2.tabs.map(x => x.b))) : '-'}px(탭 막대 ${Math.round(mock.g2.barTop)}) → 첫 화면 ${mock.g2.tabs.length && Math.max(...mock.g2.tabs.map(x => x.b)) <= mock.g2.barTop + 0.5 ? '안' : '밖'}`);
      if (mock.g2.tabs.length && Math.max(...mock.g2.tabs.map(x => x.b)) > mock.g2.barTop + 0.5) badFirst.push('꼬리표 3개짜리 회사(고도리 칸 + 급등 + 급등 40%) 한국어: 탭 줄 끝 ' + Math.round(Math.max(...mock.g2.tabs.map(x => x.b))) + 'px > 탭 막대 ' + Math.round(mock.g2.barTop) + 'px');
      for (const lang of ['ko', 'en']) { const SE = await open(browser, CFG[lang], {hash: '#/w/' + E}); const oe = await SE.page.evaluate(HEADER, E); await close(SE); const bE = oe.tabs.length ? Math.round(Math.max(...oe.tabs.map(x => x.b))) : null; m.push(`${lang} 지금 자료에서 꼬리표 가장 많은 회사 ${E} ${CO[E].n}(자료상 ${tagMax[0][1]}개 · 화면 ${oe.tags.length}개 · 한 줄 3개 이상인 회사 ${nTag3}곳): 탭 줄 끝 ${bE}px(탭 막대 ${Math.round(oe.barTop)}) → 첫 화면 ${bE != null && bE <= oe.barTop + 0.5 ? '안' : '밖'}`); if (bE != null && bE > oe.barTop + 0.5) badFirst.push(`${lang} 꼬리표 ${oe.tags.length}개 회사 ${E}: 탭 줄 끝 ${bE}px > 탭 막대 ${Math.round(oe.barTop)}px`); }
      // 누르면 그 단으로 가나(한국어 · 005930)
      const S = await open(browser, CFG.ko, {hash: '#/w/' + A}); const go4 = [];
      for (const k of want4) { await S.page.evaluate(() => { location.hash = '#/w/005930'; }); await settle(S.page, 300); const a = S.page.locator('#view a[href="#/w/' + A + '/' + k + '"]').first(); await a.click(); await settle(S.page, 600); const r = await S.page.evaluate(() => ({h: location.hash, t: document.querySelector('#view h1,#view h2')?.textContent?.trim().slice(0, 20), err: !!document.querySelector('#view .empty')})); go4.push(k + '→' + r.h + (r.err ? '(오류 글)' : '(열림)')); if (r.h !== '#/w/' + A + '/' + k || r.err) bad.push('탭 누름 ' + k + ': ' + JSON.stringify(r)); }
      await close(S); m.push('누르면: ' + go4.join(' · '));
      put(3, '4 ~ 7단 탭 넷을 이름 밑에 · 360px 에서 모두 보임 · 44px 이상', '지나온 길 · 누구와 다투나 · 앞으로 클까? · 범위 넷이 이름 밑 탭으로 모두 보임 · 44px 이상', bad.length ? 'FAIL' : badFirst.length ? 'PARTIAL' : 'PASS', m.concat(badFirst.map(x => '※ ' + x)), {bad, badFirst});
    }
    // ── [7] 4 꼬리표
    {
      const m = [], bad = [], note = [];
      for (const lang of ['ko', 'en']) for (const code of CODES) {
        const o = per[lang][code], tag = lang + ' ' + code + ' ' + CO[code].n; const exp = expTags(code, []); const got = (o.tags || []).map(x => x.href);
        const expH = exp.map(x => x.href), miss = expH.filter(h => !got.includes(h)), extra = got.filter(h => !expH.includes(h));
        const lead = leadSet.has(code), noTag = (o.tags || []).length === 0;
        m.push(`${tag}: 자료상 든 목록 ${exp.length ? exp.map(x => x.text).join(' · ') : '없음'}${lead ? ' · 대장주(자료)' : ''} · 화면 꼬리표 ${o.tags.length ? o.tags.map(x => x.text + '→' + x.href).join(' · ') : '없음'} · 누르는 칸 높이 ${o.tags.length ? Math.min(...o.tags.map(x => x.h)) : '-'}px`);
        if (lang === 'ko' && miss.length) bad.push(tag + ': 든 목록인데 꼬리표 없음 ' + miss.join(','));
        if (lang === 'ko' && extra.length) bad.push(tag + ': 안 든 목록 꼬리표 ' + extra.join(','));
        if (lang === 'ko' && exp.length && exp.map(x => x.text).join('|') !== (o.tags || []).map(x => x.text).join('|')) bad.push(tag + ': 꼬리표 글 ' + (o.tags || []).map(x => x.text).join('|') + ' ≠ ' + exp.map(x => x.text).join('|'));
        if (!exp.length && !noTag) bad.push(tag + ': 어느 목록에도 안 든 회사에 꼬리표');
        if (o.tags.some(x => x.y < o.name.b - 1)) bad.push(tag + ': 꼬리표가 이름 위');
        if (lead && lang === 'ko') note.push(tag + ': 대장주 칩 목록(' + leadSet.size + '곳)에 들었는데 꼬리표 없음');
      }
      // 고도리 칸 n번 — 고른 곳이 0곳이라 가짜 응답(위 mock)으로
      const g1 = mock.g1, g2 = mock.g2, g3 = mock.g3;
      const gok1 = g1.tags.some(x => x.text === '고도리 칸 1번' && x.href === '#/gdr/1'), gok2 = g2.tags.some(x => x.text === '고도리 칸 2번' && x.href === '#/gdr/2'), gno = g3.tags.length === 0;
      m.push(`고도리 칸 흉내(gdr.json 고른 곳 둘): ${A} 꼬리표 ${g1.tags.map(x => x.text).join(' · ')} ${gok1 ? '맞음' : '다름'} · ${B} ${g2.tags.map(x => x.text).join(' · ')} ${gok2 ? '맞음' : '다름'} · ${D} ${g3.tags.length ? g3.tags.map(x => x.text).join(',') : '없음'} ${gno ? '맞음' : '다름'}`);
      if (!gok1) bad.push('고도리 칸 1번 꼬리표 없음'); if (!gok2) bad.push('고도리 칸 2번 꼬리표 없음'); if (!gno) bad.push('안 든 회사에 꼬리표');
      if (mock.click) { m.push('고도리 칸 1번 꼬리표를 누르면 → ' + mock.click.h + (mock.click.err ? ' (오류 글)' : ' (열림)')); if (mock.click.h !== '#/gdr/1' || mock.click.err) bad.push('꼬리표 누름 → ' + mock.click.h); } else bad.push('고도리 칸 꼬리표를 눌러 보지 못함');
      put(4, '든 목록 꼬리표(고도리 칸 n번 · 급등 칸 …)', '목록에 든 회사에만 이름 밑 꼬리표 · 누르면 그 목록', bad.length ? 'FAIL' : note.length ? 'PARTIAL' : 'PASS', m.concat(note.map(x => '※ ' + x)), {bad, note});
    }
  }

  /* ═════════ 5 칩 목록 ═════════ */
  if (want(5)) {
    const CH = [['rise', () => core.rise?.list?.length], ['surge', () => (surge?.members || []).filter(m => m && Number.isFinite(m.r5)).length], ['lead', () => leadSet.size], ['pick', () => (home?.s365?.list || []).filter(([c]) => CO[c]).length], ['group', () => core.groups.length], ['ind', () => core.industries.length], ['us', () => home?.us?.rows?.length]];
    const m = [], bad = [];
    for (const lang of ['ko', 'en']) for (const [id, tot] of CH) {
      if (lang === 'en' && !['lead', 'surge'].includes(id)) continue;
      const S = await open(browser, CFG[lang], {hash: '#/f/' + id});
      const o = await S.page.evaluate(() => {
        const view = document.querySelector('#view'), vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
        const lis = [...view.querySelectorAll('ul.clist > li')], shown = lis.filter(l => !l.hidden && vis(l)), more = [...view.querySelectorAll('button')].find(b => /나머지|more|other/i.test(b.textContent));
        const cards = [...view.querySelectorAll('.card')].filter(vis);
        const row = shown.map(l => { const c = l.querySelector('.crow'), r = (c || l).getBoundingClientRect(); return {h: Math.round(r.height), name: !!l.querySelector('.cn, b')?.textContent.trim(), pct: /%/.test(l.textContent), svg: !!l.querySelector('svg'), link: c?.tagName === 'A'}; });
        return {nLi: lis.length, nShown: shown.length, more: more ? more.textContent.trim() : null, cards: cards.length, big: cards[0] ? Math.round(cards[0].getBoundingClientRect().height) : null, row, H: document.documentElement.scrollHeight, vh: innerHeight};
      });
      const nMore = o.more ? Number((o.more.match(/[\d,]+/) || ['0'])[0].replace(/,/g, '')) : 0, total = tot(), expMore = total - 1 - 10;
      let afterClick = null; if (o.more) { await S.page.locator('#view button', {hasText: /나머지|more|other/i}).first().click(); await S.page.waitForTimeout(250); afterClick = await S.page.evaluate(() => ({shown: [...document.querySelectorAll('#view ul.clist > li')].filter(l => !l.hidden).length, btn: !![...document.querySelectorAll('#view button')].find(b => /나머지|more|other/i.test(b.textContent))})); }
      await close(S);
      const tag = lang + ' #/f/' + id;
      m.push(`${tag}: 큰 카드 ${o.cards}장 · 한 줄 ${o.nShown}줄(전체 ${o.nLi}) · 「${o.more ?? '없음'}」 · 자료 전체 ${total}곳 → 말씀 꼴 남는 수 ${Math.max(0, expMore)} · 줄 높이 ${[...new Set(o.row.map(r => r.h))].join('/')}px · 이름 ${o.row.every(r => r.name) ? '모두' : '빠짐'} · % ${o.row.every(r => r.pct) ? '모두' : '빠짐'} · 작은 선 ${o.row.filter(r => r.svg).length}/${o.row.length} · 쪽 높이 ${(o.H / o.vh).toFixed(2)}화면 · 누르면 ${afterClick ? afterClick.shown + '줄 · 단추 ' + (afterClick.btn ? '남음' : '사라짐') : '-'}`);
      if (o.cards !== 1) bad.push(tag + ': 큰 카드 ' + o.cards + '장(말씀 1장)');
      if (o.nShown > 10) bad.push(tag + ': 보이는 줄 ' + o.nShown + ' > 10');
      if (total > 11 && (!o.more || nMore !== expMore)) bad.push(tag + ': 나머지 ' + nMore + ' ≠ 자료 ' + expMore + '(' + total + '곳 − 큰 카드 1 − 줄 10)');
      if (total <= 11 && o.more) bad.push(tag + ': 11곳 이하인데 나머지 단추');
      if (!o.row.every(r => r.name && r.pct)) bad.push(tag + ': 줄에 이름 · % 빠짐');
      if (o.row.some(r => r.h < 44)) bad.push(tag + ': 줄 높이 44px 아래');
      if (afterClick && (afterClick.btn || afterClick.shown !== o.nLi)) bad.push(tag + ': 나머지 보기를 눌러도 모두 안 열림 ' + JSON.stringify(afterClick));
    }
    const noLine = m.filter(x => /작은 선 (\d+)\/\1/.test(x) === false && /작은 선 0\//.test(x)).length;
    put(5, '칩 목록 = 한 줄 목록 10개까지 + 나머지 n곳 보기 · 큰 카드 1등 하나', '한 줄 목록(이름 · % · 작은 선) 10개까지 · 그 뒤 「나머지 n곳 보기」 · 큰 카드는 하나', bad.length ? 'FAIL' : (noLine ? 'PARTIAL' : 'PASS'), m, {bad});
  }

  /* ═════════ 6 채널 · 범위 겹침 ═════════ */
  if (want(6)) {
    const grp = core.groups.map(g => g.id), inds = [...core.industries].sort((a, b) => b.n - a.n);
    const chans = [...grp.slice(0, 3).map(id => '#/ch/g/' + enc(id)), '#/ch/i/' + enc(inds[0].name), '#/ch/i/' + enc(inds[Math.floor(inds.length / 2)].name), '#/ch/i/' + enc(inds[inds.length - 1].name), '#/ch/i/' + enc([...inds].sort((a, b) => b.name.length - a.name.length)[0].name)];
    const ranges = CODES.map(c => '#/w/' + c + '/range');
    const m = [], bad = [], seen = [];
    { // 재는 자가 겹침을 정말 잡나 — 일부러 −28px 겹친 칸 둘을 넣어 봄(시험용 칸은 저장되지 않음)
      const S0 = await open(browser, CFG.ko, {hash: '#/ch/g/' + enc(grp[0])});
      await S0.page.evaluate(() => { const v = document.querySelector('#view'), a = document.createElement('div'), b = document.createElement('div'); for (const e of [a, b]) { e.style.border = '1px solid #f00'; e.style.height = '40px'; e.style.width = '200px'; e.textContent = '시험 카드'; } b.style.marginTop = '-28px'; v.prepend(a, b); });
      const c0 = await S0.page.evaluate(OVERLAP); await close(S0);
      m.push(`재는 자 시험(일부러 −28px 겹친 칸 둘): 겹친 칸 쌍 ${c0.nPairs} · 겹친 글 쌍 ${c0.nT} · 음수 간격 ${c0.neg.length}(${c0.neg.slice(0, 1).map(n => n.prop + ' ' + n.v + 'px').join('')}) → ${c0.nPairs >= 1 && c0.neg.length >= 1 ? '잡음(자가 믿을 만함)' : '못 잡음 — 이 항목 결과를 믿을 수 없음'}`);
      if (!(c0.nPairs >= 1 && c0.neg.length >= 1)) bad.push('재는 자 시험 실패 — 겹침을 못 잡음');
    }
    for (const lang of ['ko', 'en']) {
      const S = await open(browser, CFG[lang], {hash: '#/'});
      for (const h of lang === 'ko' ? [...chans, ...ranges] : [chans[0], chans[3], ranges[0], ranges[1]]) {
        await go(S, h, 900); const o = await S.page.evaluate(OVERLAP);
        const kind = h.includes('/range') ? '범위' : '채널', tag = lang + ' ' + decodeURIComponent(h);
        m.push(`${tag}: 칸 ${o.nBoxes}개 · 겹친 칸 쌍 ${o.nPairs} · 겹친 글 쌍 ${o.nT} · 음수 간격 ${o.neg.length} · 옆으로 넘침 ${o.docW > o.vw + 1 ? o.docW + '>' + o.vw : '없음'} · 쪽 높이 ${o.H}px`);
        if (o.nPairs) bad.push(tag + ': 겹친 칸 ' + o.pairs.slice(0, 4).map(p => `${p.a} ↔ ${p.b} (${p.w}×${p.h})`).join(' | '));
        if (o.nT) bad.push(tag + ': 겹친 글 ' + o.tpairs.slice(0, 4).map(p => `「${p.a}」↔「${p.b}」 (${p.w}×${p.h})`).join(' | '));
        if (o.neg.length) bad.push(tag + ': 음수 간격 ' + o.neg.slice(0, 5).map(n => `${n.el} ${n.prop} ${n.v}px`).join(' | '));
        if (o.docW > o.vw + 1) bad.push(tag + ': 옆으로 넘침');
        seen.push({h, kind, lang, o});
        if (lang === 'ko' && h === chans[0]) await shot(S, 'ch-g');
      }
      await close(S);
    }
    put(6, '채널 화면 카드 겹침(−28px) · 범위 화면 겹침 풀기', '채널 · 범위 화면에 겹친 칸 0 · 음수 간격 0', bad.length ? 'FAIL' : 'PASS', m, {bad});
  }

  /* ═════════ 7 관심 소식 줄 ═════════ */
  if (want(7)) {
    const m = [], bad = [];
    // 사건 다시 셈(자료만)
    const ev = []; const T = tr;
    for (const day of T?.days || []) { const d = String(day.d).slice(0, 10); for (const c of day.sel || []) ev.push({d, c, k: 'sel'}); for (const e of day.re || []) ev.push({d, c: e?.[0], k: 're'}); for (const e of day.mv || []) ev.push({d, c: e?.[0], k: 'mv'}); for (const c of day.out || []) ev.push({d, c, k: 'out'}); }
    const memG = id => new Set((grpOfInd && core.groups.find(g => g.id === id)?.inds || []).flatMap(n => membersOfInd.get(n) || []));
    const perInd = new Map(); for (const e of ev) { const i = CO[e.c]?.i; if (i) perInd.set(i, (perInd.get(i) || 0) + 1); }
    const topInd = [...perInd.entries()].sort((a, b) => b[1] - a[1]); const indBusy = topInd[0]?.[0], indQuiet = [...core.industries].map(i => i.name).find(n => !perInd.has(n) && (membersOfInd.get(n) || []).length > 3);
    const gBusy = grpOfInd.get(topInd.find(([n]) => n !== indBusy)?.[0])?.id ?? core.groups[0].id;
    const cases = [{tag: '업종 하나(소식 많은 곳)', subs: ['i:' + indBusy]}, {tag: '큰 업종 하나 + 업종 하나', subs: ['g:' + gBusy, 'i:' + indBusy]}, {tag: '소식 없는 업종 하나', subs: indQuiet ? ['i:' + indQuiet] : null}];
    for (const cs of cases) {
      if (!cs.subs) continue;
      const S = await open(browser, CFG.ko, {hash: '#/sub', seed: {fn: s => { try { localStorage.setItem('atlas:new:sub', JSON.stringify(s)); } catch { /* 못 씀 */ } }, arg: cs.subs}});
      await S.page.waitForTimeout(500);
      const det = S.page.locator('#view details.sb-rest summary'); if (await det.count()) { await det.first().click(); await S.page.waitForTimeout(500); }
      const o = await S.page.evaluate(() => { const sb = document.querySelector('#view section.sb'); if (!sb) return null; const rows = [...sb.querySelectorAll('a.sb-n')].map(a => ({k: a.dataset.kind, d: a.dataset.d, code: decodeURIComponent((a.getAttribute('href') || '').split('/').pop()), nm: a.querySelector('.sb-nm')?.textContent.trim(), p: a.querySelector('.sb-p')?.textContent.trim(), kt: a.querySelector('.sb-k')?.textContent.trim(), sub: a.querySelector('.sb-s')?.textContent.trim(), h: Math.round(a.getBoundingClientRect().height)})); return {head: sb.querySelector('h2')?.textContent.trim(), note: sb.querySelector('p.note')?.textContent.trim(), rows, restSummary: sb.querySelector('summary')?.textContent.trim(), top: Math.round(sb.getBoundingClientRect().top + scrollY)}; });
      const all = cs.subs.map(s => (s.startsWith('g:') ? [...memG(s.slice(2))] : membersOfInd.get(s.slice(2)) || [])); const union = new Set(all.flat());
      const expEv = ev.filter(e => union.has(e.c)), expKeys = new Set(expEv.map(e => e.d + '|' + e.c + '|' + e.k));
      const expMov = cs.subs.map((s, i) => { let top = null; for (const c of all[i]) { const l = CO[c]?.l; if (!l || oddL(l)) continue; const v = dayOfL(l); if (v != null && (!top || Math.abs(v) > Math.abs(top.v))) top = {c, v}; } return top; }).filter(Boolean);
      const rows = o?.rows || [], got = new Set(rows.filter(r => r.k !== 'mov').map(r => r.d + '|' + r.code + '|' + r.k)), gotMov = rows.filter(r => r.k === 'mov');
      const miss = [...expKeys].filter(k => !got.has(k)), extra = [...got].filter(k => !expKeys.has(k));
      const movMiss = expMov.filter(t => !gotMov.some(r => r.code === t.c && Math.abs(Math.abs(parseFloat((r.p || '').replace(/[−–]/, '-'))) - Math.abs(r1(t.v))) < 0.11));
      const ds = rows.map(r => r.d), nonInc = ds.some((d, i) => i && ds[i - 1] < d), nonDec = ds.some((d, i) => i && ds[i - 1] > d);
      const dirTxt = !nonInc ? '새 날 먼저' : !nonDec ? '옛 날 먼저' : '날짜 차례가 섞임';
      const kinds = rows.reduce((a, r) => { a[r.k] = (a[r.k] || 0) + 1; return a; }, {});
      m.push(`${cs.tag}(${cs.subs.join(', ')}): 소식 칸 ${o ? '있음' : '없음'} · 줄 ${rows.length}(자료 뽑힘 · 옮김 · 빠짐 ${expKeys.size} + 오늘 가장 움직인 곳 ${expMov.length}) · 종류 ${JSON.stringify(kinds)} · 날짜 ${dirTxt} · 빠진 줄 ${miss.length} · 더 낀 줄 ${extra.length} · 오늘 가장 움직인 곳 틀림 ${movMiss.length} · 첫 줄 높이 ${rows[0]?.h ?? '-'}px · 머리 「${o?.head}」 「${o?.note?.slice(0, 40)}」`);
      if (!o) bad.push(cs.tag + ': 소식 칸이 없음'); else {
        if (miss.length) bad.push(cs.tag + ': 자료에 있는 소식 ' + miss.length + '줄이 화면에 없음 예 ' + miss.slice(0, 2).join(','));
        if (extra.length) bad.push(cs.tag + ': 자료에 없는 소식 ' + extra.length + '줄 예 ' + extra.slice(0, 2).join(','));
        if (movMiss.length) bad.push(cs.tag + ': 오늘 가장 움직인 곳 틀림/없음 ' + movMiss.map(t => t.c + ' ' + r1(t.v)).join(','));
        if (nonInc && nonDec) bad.push(cs.tag + ': 날짜 차례가 섞임');
        if (rows.some(r => r.h < 44)) bad.push(cs.tag + ': 줄 높이 44px 아래');
        if (!rows.length) bad.push(cs.tag + ': 줄 0');
      }
      if (cs.tag.startsWith('업종 하나')) await shot(S, 'sub-news');
      await close(S);
    }
    // 담은 곳이 없을 때: 소식 칸 없음(말씀: 담은 업종 · 큰 업종의)
    { const S = await open(browser, CFG.ko, {hash: '#/sub'}); const has = await S.page.evaluate(() => !!document.querySelector('#view section.sb')); m.push('담은 곳 없음: 소식 칸 ' + (has ? '있음' : '없음')); if (has) bad.push('담은 곳이 없는데 소식 칸'); await close(S); }
    // 영어 한 번
    { const S = await open(browser, CFG.en, {hash: '#/sub', seed: {fn: s => { try { localStorage.setItem('atlas:new:sub', JSON.stringify(s)); } catch { /* */ } }, arg: ['i:' + indBusy]}}); const o = await S.page.evaluate(() => ({n: document.querySelectorAll('#view a.sb-n').length, ko: [...document.querySelectorAll('#view section.sb *')].filter(e => !e.children.length && /[가-힣]/.test(e.textContent) && !e.closest('[data-proper],[lang="ko"]')).map(e => e.textContent.trim().slice(0, 20)).slice(0, 4)})); m.push('영어 390×640: 소식 줄 ' + o.n + ' · 안 번역된 한글 ' + (o.ko.length ? o.ko.join('/') : '없음')); if (!o.n) bad.push('영어 소식 줄 0'); if (o.ko.length) bad.push('영어 소식 줄에 한글 ' + o.ko.join('/')); await close(S); }
    put(7, '관심에 소식 줄(담은 업종 · 큰 업종의 뽑힘 · 빠짐 · 옮김 · 오늘 가장 움직인 곳 · 날짜 차례)', '담은 업종 · 갈래의 뽑힘 · 빠짐 · 옮김 + 오늘 가장 움직인 곳을 날짜 차례로', bad.length ? 'FAIL' : 'PASS', m, {bad});
  }

  /* ═════════ 8 · 9 보유종목(편지 접기 · 바로 가기) ═════════ */
  if (want(8) || want(9)) {
    const headLetter = (() => { try { const t = execFileSync('git', ['-C', ROOT, 'show', 'HEAD:site/next/app.js'], {encoding: 'utf8', maxBuffer: 5e7}); const mm = t.match(/const HELLO_MSG = (\[[\s\S]*?\]);\n/); return mm ? new Function('return ' + mm[1])() : null; } catch { return null; } })();
    const m8 = [], bad8 = [], m9 = [], bad9 = [];
    for (const lang of ['ko', 'en']) {
      const S = await open(browser, CFG[lang], {hash: '#/me'});
      const o = await S.page.evaluate(() => {
        const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
        const fold = document.querySelector('#view .hd-fold, #view [class*="fold"]'); if (!fold) return null;
        const r = fold.getBoundingClientRect(), btn = [...fold.querySelectorAll('button')].find(vis);
        const lw = fold.querySelector('.lw, .hd-lw');
        return {h: Math.round(r.height * 10) / 10, top: Math.round(r.top + scrollY), w: Math.round(r.width), btn: btn ? {t: btn.textContent.trim(), h: Math.round(btn.getBoundingClientRect().height), w: Math.round(btn.getBoundingClientRect().width), exp: btn.getAttribute('aria-expanded')} : null, lwH: lw ? Math.round(lw.getBoundingClientRect().height) : null, lwScroll: lw ? lw.scrollHeight : null, vh: innerHeight, txt: fold.innerText.replace(/\s+/g, ' ').trim().slice(0, 80)};
      });
      if (!o) { bad8.push(lang + ': 접는 칸이 없음'); await close(S); continue; }
      const third = Math.ceil(o.vh / 3); // 640 → 214
      m8.push(`${lang} 접힌 칸 ${o.h}px(여는 보드리 5초 동안 · 말씀 ≤ ${third}px · 첫 화면 ⅓) · 단추 「${o.btn?.t}」 ${o.btn?.w}×${o.btn?.h}px`);
      if (lang === 'ko') { await S.page.waitForTimeout(6500); const late = await S.page.evaluate(() => Math.round(document.querySelector('#view .hd-fold').getBoundingClientRect().height * 10) / 10); m8.push(`ko 접힌 칸 ${late}px(여는 5초가 지난 뒤)`); if (late > third) bad8.push('여는 5초 뒤 접힌 칸 ' + late + ' > ' + third); }
      if (o.h > third) bad8.push(lang + ': 접힌 칸 ' + o.h + ' > ' + third);
      if (lang === 'ko' && o.btn?.t !== '펼치기') bad8.push('단추 글 「' + o.btn?.t + '」 ≠ 펼치기');
      if (!o.btn || o.btn.h < 44) bad8.push(lang + ': 펼치기 단추 높이 ' + o.btn?.h);
      if (lang === 'ko') {
        await S.page.locator('#view .hd-fold button, #view [class*="fold"] button').first().click(); await S.page.waitForTimeout(500);
        const o2 = await S.page.evaluate(() => { const f = document.querySelector('#view .hd-fold, #view [class*="fold"]'), btn = [...f.querySelectorAll('button')][0]; return {h: Math.round(f.getBoundingClientRect().height), t: btn?.textContent.trim(), exp: btn?.getAttribute('aria-expanded'), msgs: [...f.querySelectorAll('.hml')].map(e => e.textContent), gift: f.querySelector('.m4-gift')?.textContent ?? ''}; });
        const lines = headLetter || [], same = lines.length ? lines.filter((t, i) => o2.msgs[i] === t).length : 0;
        m8.push(`ko 펼친 칸 ${o2.h}px(옛 1,108px) · 단추 「${o2.t}」 · 편지 글 ${o2.msgs.length}줄 · 옛 판(git HEAD 의 HELLO_MSG ${lines.length}줄)과 글자 그대로 같은 줄 ${same}/${lines.length}`);
        if (o2.exp !== 'true' || o2.h <= o.h + 200) bad8.push('펼치기를 눌러도 안 펼쳐짐 ' + o2.h);
        if (lines.length && (same !== lines.length || o2.msgs.length !== lines.length)) bad8.push('편지 글이 옛 판과 다름 ' + same + '/' + lines.length + ' · 줄 수 ' + o2.msgs.length);
        if (!lines.length) bad8.push('옛 편지 글을 git 에서 못 읽음');
        await S.page.locator('#view .hd-fold button, #view [class*="fold"] button').first().click(); await S.page.waitForTimeout(300);
        const o3 = await S.page.evaluate(() => Math.round(document.querySelector('#view .hd-fold, #view [class*="fold"]').getBoundingClientRect().height)); m8.push('ko 다시 접으면 ' + o3 + 'px'); if (o3 > third) bad8.push('다시 접은 칸 ' + o3);
        // 접힌 채 편지를 누르면 소개 쪽으로 튀지 않고 펼침
        await shot(S, 'me-fold');
      }
      await close(S);
    }
    // 바로 가기 — 가입 안 함 · 가입함(흉내)
    for (const member of [false, true]) {
      const S = await open(browser, CFG.ko, {hash: '#/me', extra: member ? '&kakaodev=1' : '', seed: member ? {fn: () => { try { localStorage.setItem('atlas:kakao:member', '1'); } catch { /* 못 씀 */ } }, arg: null} : null, route: member ? async page => page.route('**/api/kakao/me', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({on: true, member: true, ref: 'abcd1234', friends: 0, next: 3, code: null})})) : null});
      await S.page.waitForTimeout(800);
      const o = await S.page.evaluate(() => {
        const h2 = [...document.querySelectorAll('#view h2.sec')].find(e => /바로 가기/.test(e.textContent)); const box = h2?.nextElementSibling;
        const items = box ? [...box.children].map(c => ({tag: c.tagName.toLowerCase(), text: c.textContent.trim().replace(/\s+/g, ' '), href: c.getAttribute('href'), h: Math.round(c.getBoundingClientRect().height)})) : null;
        const links = [...document.querySelectorAll('#view a[href^="#/"]')].filter(a => /^#\/(today|surge|cal|cond|talk|time|up|info|f\/|gdr)/.test(a.getAttribute('href'))).map(a => a.getAttribute('href') + ' 「' + a.textContent.trim().slice(0, 12) + '」');
        const body = document.querySelector('#view').innerText;
        return {items, links, hasSec: !!h2, withdraw: /탈퇴/.test(body), kakaoKeep: /카카오로 지켜요/.test(body)};
      });
      let dl = null;
      if (!member) { const [d] = await Promise.all([S.page.waitForEvent('download', {timeout: 8000}).catch(() => null), S.page.locator('#view button', {hasText: '기록 파일로 받기'}).first().click().catch(() => null)]); dl = d ? d.suggestedFilename() : null; }
      let twoTap = null;
      if (member) { const w = S.page.locator('#view button', {hasText: /^탈퇴/}).first(); if (await w.count()) { await w.click(); await S.page.waitForTimeout(300); twoTap = await S.page.evaluate(() => ({q: !!document.querySelector('#view .hd-wd-q'), go: !!document.querySelector('#view .hd-go'), no: !!document.querySelector('#view .hd-no')})); } }
      const texts = (o.items || []).map(i => i.text);
      m9.push(`${member ? '가입한 사람(흉내)' : '가입 안 한 사람'}: 바로 가기 ${o.hasSec ? '있음' : '없음'} · 줄 ${texts.map(t => '「' + t.slice(0, 22) + '」').join(' ')} · 다른 칸 고리(오늘 시장 · 급등 · 달력 · 조건 · 이야기 · 봉인 · 기록 · 도움말) ${o.links.length ? o.links.join(', ') : '없음'} · 탈퇴 ${o.withdraw ? '보임' : '안 보임'} · 「카카오로 지켜요」 ${o.kakaoKeep ? '보임' : '안 보임'}${dl ? ' · 기록 파일 ' + dl : ''}${twoTap ? ' · 탈퇴 누르면 ' + JSON.stringify(twoTap) : ''}`);
      if (!o.hasSec) bad9.push('바로 가기 칸 없음');
      if (!texts.some(t => t.includes('편지 여는 밤'))) bad9.push('편지 여는 밤 없음');
      if (!texts.some(t => t.includes('기록 파일로 받기'))) bad9.push('기록 파일로 받기 없음');
      if (o.links.length) bad9.push('내 것 아닌 고리 ' + o.links.join(', '));
      if (!member && o.withdraw) bad9.push('가입 안 한 사람에게 탈퇴가 보임');
      if (member && !o.withdraw) bad9.push('가입한 사람에게 탈퇴가 안 보임');
      if (!member && !dl) bad9.push('기록 파일 받기가 파일을 안 줌');
      if (member && !(twoTap?.go && twoTap?.no)) bad9.push('탈퇴를 누르면 묻는 칸(탈퇴하기 · 그만두기)이 안 뜸');
      const extraRows = (o.items || []).filter(i => !/편지 여는 밤|기록 파일로 받기|탈퇴|아이폰/.test(i.text)); if (extraRows.length) bad9.push('내 것 밖 줄 ' + extraRows.map(i => i.text).join(' / '));
      await close(S);
    }
    if (want(8)) put(8, '보유종목 편지 칸(1,108px)을 첫 화면 ⅓ 높이로 접고 펼치기 · 글은 그대로', '접힌 칸 ≤ 214px(360×640) · 「펼치기」 · 누르면 펼침 · 편지 글자 그대로', bad8.length ? 'FAIL' : 'PASS', m8, {bad: bad8});
    if (want(9)) put(9, '보유종목 바로 가기에는 내 것만(편지 여는 밤 · 기록 파일 · 탈퇴)', '바로 가기 = 편지 여는 밤 · 기록 파일로 받기 · 가입한 사람만 탈퇴 · 오늘 시장 · 급등은 칩으로', bad9.length ? 'FAIL' : 'PASS', m9, {bad: bad9});
  }

  /* ═════════ 10 편지 쪽 · 소개 쪽 ═════════ */
  if (want(10)) {
    const m = [], bad = [];
    for (const lang of ['ko', 'en']) for (const pg of ['/letter.html', '/hello.html']) {
      const ctx = await browser.newContext({viewport: {width: CFG[lang].w, height: CFG[lang].h}, locale: lang === 'en' ? 'en-US' : 'ko-KR', serviceWorkers: 'block'}); const page = await ctx.newPage();
      await page.goto(BASE + pg + (lang === 'en' ? '?lang=en' : ''), {waitUntil: 'domcontentloaded'}); await page.waitForTimeout(2500); await page.waitForLoadState('networkidle', {timeout: 8000}).catch(() => {});
      const o = await page.evaluate(() => {
        const rc = e => { const r = e.getBoundingClientRect(); return {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom)}; };
        const tabs = [...document.querySelectorAll('nav.tabs a')].map(a => ({t: a.textContent.trim(), href: a.getAttribute('href'), ...rc(a)}));
        const nav = document.querySelector('nav.tabs'), cs = nav ? getComputedStyle(nav) : null;
        const back = [...document.querySelectorAll('main a, main button, a')].filter(a => /돌아가|보러 가기|back|return|home|go to/i.test(a.textContent) && !a.closest('nav.tabs')).map(a => ({t: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 30), href: a.getAttribute('href'), ...rc(a)}));
        const clock = document.querySelector('.clock'); const body = document.body.innerText;
        const lastEl = [...document.querySelectorAll('main > *, body > footer')].pop(); scrollTo(0, document.documentElement.scrollHeight);
        const foot = document.querySelector('footer'), fr = foot ? foot.getBoundingClientRect() : null;
        return {tabs, fixed: cs?.position, bottom: cs?.bottom, navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null, vh: innerHeight, back, guest: /지금은 초대받은 분만|Invited guests only/i.test(body), clockText: clock ? clock.innerText.replace(/\s+/g, ' ') : null, countdown: /\d+\s*일\s*\d+\s*시간\s*\d+\s*분|\d+\s*d(ays?)?\s*\d+\s*h/i.test(body), footBottom: fr ? Math.round(fr.bottom) : null, docH: document.documentElement.scrollHeight, scrollY: Math.round(scrollY)};
      });
      await ctx.close();
      const tag = lang + ' ' + pg, hrefs = o.tabs.map(t => t.href).join(' '), minH = Math.min(...o.tabs.map(t => t.h)), minW = Math.min(...o.tabs.map(t => t.w));
      m.push(`${tag}: 아래 단추 ${o.tabs.length}개 ${o.tabs.map(t => t.t).join('·')} · 주소 ${hrefs} · 최소 ${minW}×${minH}px · 자리 ${o.fixed} 맨 아래 ${o.navTop + minH >= o.vh - 1 ? '예' : '아니오'} · 돌아가기류 ${o.back.map(b => '「' + b.t + '」' + b.w + '×' + b.h).join(', ') || '없음'}${pg === '/letter.html' ? ` · 초대 못 받은 기기 ${o.guest ? '「지금은 초대받은 분만」 보임' : '안 보임'} · 시계 「${o.clockText}」` : ''}`);
      if (o.tabs.length !== 5) bad.push(tag + ': 아래 단추 ' + o.tabs.length + '개');
      if (minH < 44 || minW < 44) bad.push(tag + ': 아래 단추 ' + minW + '×' + minH + ' < 44');
      if (o.fixed !== 'fixed') bad.push(tag + ': 아래 단추가 고정이 아님(' + o.fixed + ')');
      if (!o.back.length || Math.min(...o.back.map(b => b.h)) < 44) bad.push(tag + ': 돌아가기 단추 없음/44px 아래 ' + JSON.stringify(o.back.map(b => b.t + b.h)));
      if (pg === '/letter.html') { if (!o.guest) bad.push(tag + ': 「지금은 초대받은 분만」이 안 보임'); if (!o.countdown) bad.push(tag + ': 여는 밤까지 남은 때가 안 보임 「' + o.clockText + '」'); }
    }
    put(10, '편지 쪽 · 소개 쪽에도 아래 단추 다섯 · 돌아가기 44px 이상 · 초대 못 받은 사람에게 「지금은 초대받은 분만」 + 남은 때', '아래 단추 다섯 · 돌아가기 ≥ 44px · 못 받은 기기에 문구 + 남은 때', bad.length ? 'FAIL' : 'PASS', m, {bad});
  }

  /* ═════════ reach 모든 화면 3번 안에 닿기 ═════════ */
  if (want('reach')) {
    const KIND = h => {
      const m = /^#\/([a-z0-9]*)\/?(.*)$/.exec(h); if (!m) return null; const [, k, rest] = m; const seg = rest.split('/');
      if (k === '') return '#/'; if (k === 'f') return '#/f/' + (seg[0] || '?'); if (k === 'w') return /^(KOSPI|KOSDAQ)$/.test(seg[0]) ? '#/w/지수' : seg[1] ? '#/w/<번호>/' + seg[1] : '#/w/<번호>';
      if (k === 'ch') return '#/ch/' + seg[0] + '/<이름>'; if (k === 'surge') return seg[0] ? '#/surge/' + seg[0] : '#/surge'; if (k === 'cal') return seg[0] ? '#/cal/<번호>' : '#/cal'; if (k === 'cond') return '#/cond';
      if (k === 'why') return seg[0] ? '#/why/<번호>' : '#/why'; if (k === 'gdr') return seg[0] ? '#/gdr/<번호>' : '#/gdr'; if (k === 'x') return '#/x/<번호>'; if (k === 's') return '#/s/<보냄>'; return '#/' + k;
    };
    const EXPECT = ['#/', '#/f/rise', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/group', '#/f/ind', '#/f/us', '#/shorts', '#/why', '#/sub', '#/me', '#/find', '#/w/<번호>', '#/w/지수', '#/w/<번호>/past', '#/w/<번호>/rivals', '#/w/<번호>/grow', '#/w/<번호>/range', '#/ch/g/<이름>', '#/ch/i/<이름>', '#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40', '#/cal', '#/cal/<번호>', '#/cond', '#/talk', '#/up', '#/time', '#/info', '#/today', '#/why/<번호>', '#/gdr', '#/x/<번호>'];
    const best = new Map(); // kind → {taps, via, from}
    const seenPage = new Map(); // hash → taps
    const visitedKinds = new Map();
    const S = await open(browser, CFG.ko, {hash: '#/'});
    const LIMIT = {default: 2, '#/w/<번호>': 3, '#/f': 1};
    const norm = h => { try { const u = new URL(h, BASE + '/next/'); if (u.origin !== BASE) return null; const p = u.pathname; if (!(p === '/' || p === '/next/' || p === '/next/index.html')) return {old: u.pathname + u.hash}; return u.hash && u.hash.startsWith('#/') ? {h: decodeURIComponent(u.hash).replace(/%/g, '%') && u.hash} : {h: '#/'}; } catch { return null; } };
    const collect = () => {
      const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
      const out = [];
      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href'); if (!href || /^(sms|tel|mailto|javascript):/.test(href)) continue;
        let extra = 0, via = [];
        // 접힌 곳 안에 있으면 한 번 더 눌러야 함
        for (let e = a; e && e !== document.body; e = e.parentElement) { if (e.tagName === 'DETAILS' && !e.open) { extra++; via.push('details'); } else if (e.hidden || getComputedStyle(e).display === 'none') { extra++; via.push('hidden'); break; } }
        out.push({href, extra, via: via.join('+'), text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22), chrome: !!a.closest('nav.tabs, header, .top, .bar')});
      }
      return out;
    };
    const queue = [{h: '#/', taps: 0, chain: ['#/']}];
    const TAB = ['#/', '#/shorts', '#/why', '#/sub', '#/me'];
    const old = new Map(); let visits = 0; const t0 = Date.now(); const MAXV = Number(opt('--max-visits', 70));
    // 처음 화면의 고정 고리(아래 단추 · 위 찾기)도 한 번 누름으로 침
    while (queue.length && visits < MAXV && Date.now() - t0 < 12 * 60e3) {
      const {h, taps, chain} = queue.shift(); const kind = KIND(h); const kc = visitedKinds.get(kind) || 0; const lim = LIMIT[kind] ?? (kind.startsWith('#/f/') ? 1 : LIMIT.default);
      if (seenPage.has(h) || kc >= lim || taps > 3) continue;
      seenPage.set(h, taps); visitedKinds.set(kind, kc + 1); visits++;
      if (h !== '#/' || visits > 1) await go(S, h, 500);
      let links = []; try { links = await S.page.evaluate(collect); } catch { /* 화면 닫힘 */ }
      for (const L of links) {
        const n = norm(L.href); if (!n) continue;
        if (n.old) { if (!old.has(n.old)) old.set(n.old, {taps: taps + 1 + L.extra, from: h}); continue; }
        const nh = n.h, nk = KIND(nh); if (!nk) continue;
        const t = taps + 1 + L.extra;
        const cur = best.get(nk);
        if (!cur || t < cur.taps) best.set(nk, {taps: t, via: L.via, from: h, text: L.text, sample: nh});
        if (t <= 3 && !seenPage.has(nh)) queue.push({h: nh, taps: t, chain: [...chain, nh]});
      }
      queue.sort((a, b) => a.taps - b.taps);
    }
    best.set('#/', {taps: 0, from: '-', sample: '#/'});
    // 찾기 쪽에서 찾은 결과 줄(밖 칸 · 회사)
    await go(S, '#/find', 600); const inp = S.page.locator('#view input').first(); let findX = null;
    if (await inp.count()) { await inp.fill('KODEX'); await S.page.waitForTimeout(900); findX = await S.page.evaluate(() => [...document.querySelectorAll('#view a[href^="#/x/"], #view a[href^="#/w/"]')].slice(0, 6).map(a => a.getAttribute('href'))); }
    // 상태 B — 오늘 열한 질문을 끝낸 기기(고도리 칸이 열림) · 고도리 칸 쪽(#/gdr)은 이때만 고리가 생김
    let gdrB = null;
    for (const k of [0, 1, 2, 3]) {
      const S2 = await open(browser, CFG.ko, {hash: '#/', seed: {fn: kk => { try { localStorage.setItem('atlas:godori-why', JSON.stringify([{answers: Array(11).fill(kk), at: Date.now(), d: new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10)}])); } catch { /* 못 씀 */ } }, arg: k}});
      const ls = await S2.page.evaluate(collect).catch(() => []); await close(S2);
      const hit = ls.find(l => l.href === '#/gdr'); if (hit) { gdrB = {k, extra: hit.extra, text: hit.text}; break; }
    }
    if (gdrB) best.set('#/gdr', {taps: 1 + gdrB.extra, from: '#/ (오늘 열한 질문을 끝낸 기기만)', text: gdrB.text});
    if (findX?.some(h => h.startsWith('#/x/'))) best.set('#/x/<번호>', {taps: 2, from: '#/find (글자를 쳐서 찾은 뒤 결과를 누름)', text: findX.find(h => h.startsWith('#/x/'))});
    const unreach = [], slow = [], rows = [];
    for (const k of EXPECT) { const b = best.get(k); if (!b) { unreach.push(k); rows.push([k, '닿지 않음']); } else { rows.push([k, b.taps + '번 · ' + (b.from ?? '') + (b.text ? ' 「' + b.text + '」' : '') + (b.via ? ' (접힘 ' + b.via + ')' : '')]); if (b.taps > 3) slow.push(k + ' ' + b.taps + '번'); } }
        await close(S);
    const m = rows.map(r => r[0] + ' ← ' + r[1]).concat([`찾기 쪽(「KODEX」 입력) 결과 고리: ${findX?.join(' ') || '없음'}`, '옛 화면(/atlas/…)으로 나가는 고리: ' + ([...old.keys()].slice(0, 8).join(' ') || '없음'), `돈 화면 ${visits}곳 · ${Math.round((Date.now() - t0) / 1000)}초`]);
    const bad = unreach.map(k => k + ': 첫 화면에서 눌러 닿는 길이 없음(깊이 3까지 · 돈 화면 ' + visits + '곳)').concat(slow.map(s => s + ': 3번 넘음'));
    put('reach', '모든 화면에 첫 화면에서 3번 안에 닿나(보유종목 바로 가기를 줄인 뒤)', '한 화면도 길이 끊기지 않고 3번 안', bad.length ? 'FAIL' : 'PASS', m, {bad, unreach, slow, best: Object.fromEntries([...best.entries()].map(([k, v]) => [k, v])), visits, old: Object.fromEntries(old)});
  }
} finally {
  await browser.close().catch(() => {});
}

/* ───────── 결과 ───────── */
const order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'reach'];
R.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({at: new Date().toISOString(), base: BASE, codes: CODES, asOf, results: R}, null, 1));
for (const r of R) { console.log(`\n[${r.id}] ${r.verdict} — ${r.item}`); for (const x of r.measured) console.log('   · ' + x); for (const x of r.bad || []) console.log('   ✗ ' + x); }
console.log('\n' + R.map(r => r.id + ':' + r.verdict).join('  '));
process.exit(R.some(r => r.verdict === 'FAIL') ? 1 : 0);

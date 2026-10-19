#!/usr/bin/env node
// 테마 시계 쪽 맞대기 — 첫 화면 맨 위 칸(section.th-home) · #/t/… 열아홉 쪽 · 있는 쪽 맨 아래 「다음」 한 줄
//   사장님 2026-10-19(싱가포르) 16:06 「테마가 될 듯한 걸 찾아 주는 거야」 · 16:46 「물 흐르듯 … 다음다음다음 … 36장」 · 16:54 「이제 aaa7377.com에 올려 … 더 스마트한 내부 시스템」
//   셈 원본 = 결정표 docs/design/theme-2026-10-19/theme-engine.md(셈은 tests/atlas11/theme.test.mjs · 따로 세기 scratchpad recount) — 이 검사는 화면이 자료(/next/data/theme.json · theme-more.json)를 그대로 보이는지
//   쓰는 법: node scripts/atlas11/next/check_theme.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//   ① 자료 꼴(차례 수 = 자리 수 · 합 = 업종 수) ② 첫 화면 칸(돌이 물음 뒤 · 줄 셋 = 싹 차례 앞 셋 · 답 줄 · 세 칸 · 성적표 숫자 · 기준 날)
//   ③ 「다음」 차례 — 인사에서 「다음」만 눌러 열여덟 번(→ #/why/<번호>) · 있는 쪽 다섯(관심 → 매매일지 → 보유종목 → 가짜 돈 → 진화 → 오늘 정리 → 첫 화면) · 앞 쪽(‹) 고리
//   ④ 숫자 = 자료(업종 쪽 점 넷 ✓ · 번짐 수 · 회사 열흘 %) ⑤ 두 폭(360 · 390) 가로 넘침 0 · 글 17px 넘게 · 누르는 자리 44px · 화면 오류 0 · 쓰지 않을 말 0
//   ⑥ 자료를 못 받으면 「?」 한 줄(첫 화면 · 쪽) — 화면이 죽지 않음
//   ⑦ 자료를 바꾼 다섯 판(A ~ E · 받은 자료를 이 검사 안에서 바꿔 끼움)으로 열아홉 쪽을 한국어 · 영어 320 폭에서 — 자료에 따라 갈리는 글이 모두 한 번씩 그려짐
//      (진짜 싹 0 · 새로 들어옴 · 점 하나 · 큰 회사 값 없음 · 무리 없음 · 장중 · 시듦 빔 · 꽃 · 시듦 · 잠잠 업종 · 회사 줄 밖 · 먼저 · 뒤따름 · 성적표 못 셈)
//      한국어 = ⑤ 잣대 · 영어 = 사전에 없는 틀 0 · 보이는 한글 0(lang="ko" 빼고) · 화면 밖 칸 0 · 줄 안 넘침 0 — 2026-10-19 틀림 장부 60(이 방 자료 한 판으로는 영어가 통과해도 실제 자료에서 걸림)
//      · 영어 업종 수 = 「industries」(「companies」 아님 · i18n.js 자리 표 data-tr)
//   ⑧ 글줄 · 글씨 · 간격([10] 5 · 6 · 7 · 8 — check_hold ⑭ 와 같은 셈 · 그림 <svg> 속 글은 셈 밖): 열아홉 쪽 390(③ 차례) · 320(⑦ A 판) — 글 시작 왼쪽 줄 3 이하 · 17px 아래 0 · 글씨 6가지 · 토큰 · 간격 0 · 8 · 16 · 24 · 음수 0
//      사장님 2026-10-19 20:40 「다해」(못 한 것 4 — 테마 쪽은 견본 모양 그대로라 왼쪽 줄이 6 ~ 18) → 16 · 33 · 56 세 줄
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import fss from 'node:fs';
import {createRequire} from 'node:module';
import {screenHits} from '../../../site/next/words.js';
import {pp} from '../../../site/next/theme-engine.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // check_white 와 같은 길(깃허브 실행기는 PW_DIR)
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), OUT = arg('--out', null), PAGE = base + '/next/';
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 300) fails.push([k, String(x).slice(0, 300)]); console.log('걸림 ' + k + ' — ' + String(x).slice(0, 200)); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const getJ = async f => { for (let i = 0; i < 4; i++) { try { const r = await fetch(base + f, {cache: 'no-store'}); if (r.ok) return await r.json(); if (r.status === 404) return null; } catch { /* 다시 */ } await new Promise(r => setTimeout(r, 800 * (i + 1))); } return null; };
const enc = encodeURIComponent, num = n => Number(n).toLocaleString('ko-KR');
const MD = d => (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일';

const [TH, TM, HM] = await Promise.all([getJ('/next/data/theme.json'), getJ('/next/data/theme-more.json'), getJ('/next/data/theme-home.json')]);
if (!TH || !TM) { console.error('테마 자료를 못 받음'); if (OUT) await fs.writeFile(OUT, JSON.stringify({ok: false, fails: [['자료', 'theme.json · theme-more.json']]})); process.exit(1); }
/* ① 자료 꼴 */
const Z = ['S', 'B', 'W', 'Q'], ind = new Map(TH.inds.map(i => [i.n, i]));
for (const z of Z) { if (TH.order[z].length !== TH.count[z]) fail('자료 차례 수', z + ' ' + TH.order[z].length + ' ≠ ' + TH.count[z]); if (TH.order[z].some(n => ind.get(n)?.z !== z)) fail('자료 차례 자리', z); }
if (Z.reduce((s, z) => s + TH.count[z], 0) !== TH.inds.length) fail('자료 합', '자리 합 ≠ 업종 수');
if (TH.count.real !== TH.inds.filter(i => i.z === 'S' && i.sc === 4).length) fail('자료 진짜 싹 수', TH.count.real);
for (const i of TH.inds) { if (!TM.inds[i.n]) fail('더 자료 없음', i.n); if (i.sc !== i.dots.filter(Boolean).length) fail('점 수', i.n); }
bump('자료');
const TOP = TH.order.S[0] ?? TH.order.B[0] ?? TH.inds[0].n, LEAD = TM.inds[TOP]?.top?.[0];
const I1 = ind.get(TOP);

const EXE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'; // 이 방은 미리 깔린 크로미움 · 깃허브 실행기는 playwright 가 깐 것(check_white 와 같음)
const browser = await chromium.launch({...(fss.existsSync(EXE) ? {executablePath: EXE} : {}), args: ['--disable-dev-shm-usage']});
async function open(hash, {w = 390, h = 844, routes = null} = {}) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (routes) for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(String(e.message).slice(0, 160)));
  await p.goto(PAGE + hash, {waitUntil: 'domcontentloaded'});
  await settle(p);
  return {p, ctx};
}
const settle = async p => { await p.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view')?.childElementCount > 0, null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(250); };
/** 화면 모양 잣대(⑤) — 가로 넘침 · 글 17px · 누르는 자리 44px · 쓰지 않을 말 */
const shape = p => p.evaluate(() => {
  const v = document.querySelector('#view'), out = {over: document.documentElement.scrollWidth - innerWidth, small: [], tap: [], text: v?.innerText ?? ''};
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!n.textContent.trim() || !el || !vis(el)) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 16.95) out.small.push(n.textContent.trim().slice(0, 20) + ' ' + fs); }
  for (const a of v.querySelectorAll('a[href], button, summary')) { if (!vis(a)) continue; const r = a.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.tap.push((a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  return out;
});
async function look(where, p) {
  const s = await shape(p);
  if (s.over > 0) fail('가로 넘침', where + ' ' + s.over + 'px');
  if (s.small.length) fail('17px 아래 글', where + ' ' + s.small.slice(0, 3).join(' | '));
  if (s.tap.length) fail('누르는 자리 44px 아래', where + ' ' + s.tap.slice(0, 3).join(' | '));
  const bad = screenHits(s.text); if (bad.length) fail('쓰지 않을 말', where + ' ' + bad.join(' · '));
  if (p._errs.length) fail('화면 오류', where + ' ' + p._errs.slice(0, 2).join(' | '));
  return s;
}
/** 영어 화면 — 보이는 한글(lang="ko" 빼고) · 화면 밖 칸 · 테마 줄 안에서 넘친 글(번호 · 점과 겹침 — 2026-10-19 꽃 줄) */
const enScan = p => p.evaluate(() => {
  const v = document.querySelector('#view'), HAN = /[가-힣]/, vw = innerWidth, out = {han: [], over: document.documentElement.scrollWidth - vw, off: [], spill: []};
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!el || el.closest('[lang="ko"]') || !HAN.test(n.textContent)) continue; const r = el.getBoundingClientRect(); if (r.width && r.height) out.han.push(n.textContent.trim().slice(0, 40)); }
  for (const el of v.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (!r.width || (r.right <= vw + 0.5 && r.left >= -0.5)) continue; let a = el.parentElement, clip = false; while (a && a !== document.body) { if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) { clip = true; break; } a = a.parentElement; } if (!clip) out.off.push(String(el.className?.baseVal ?? el.className) + ' ' + Math.round(r.right)); }
  for (const el of v.querySelectorAll('.th-meta, .th-mid2, .th-srow, .th-li, .th-cor')) if (el.clientWidth && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'visible') out.spill.push(String(el.className) + ' ' + el.scrollWidth + '>' + el.clientWidth);
  return out;
});
/** 자료를 바꾼 판(⑦) — 싹 맨 앞 업종 · 그 업종 앞선 회사를 바꿔 글 갈래를 고르게 그림(셈이 아니라 그리기만 봄) */
function variant(V) {
  const th = structuredClone(TH), mo = structuredClone(TM), hm = structuredClone(HM);
  const X = th.order.S[0] ?? th.inds[0].n, ix = th.inds.find(i => i.n === X), M = mo.inds[X], lead = M?.top?.[0] ?? null;
  if (V === 'A') { // 진짜 싹 없음 · 새로 들어옴 · 점 하나 · 큰 회사 값 없음 · 업종 내림 · 성적표 차이 없음 · 장중 · 시듦 빔 · 무리 없음 · 회사 2번째 · 최근에 몰림 · 먼저
    Object.assign(ix, {dots: [1, 0, 0, 0], sc: 1, d: 1, bigAvg: null, m10: -1.23, gn: null, g: null, A5: -2, B5: 1}); th.count.real = 0; th.record.more = false; th.provisional = true; th.count.W = 0; th.order.W = [];
    for (const b of M?.big ?? []) Object.assign(b, {d10: null, a5: null, b5: null, rank: null, gap: null, l: null});
    if (lead) Object.assign(lead, {rank: 2, a5: 1, b5: 3});
  } else if (V === 'B') { Object.assign(ix, {dots: [1, 1, 1, 1], sc: 4, d: 7, bigAvg: 1.5, m10: 2.5, A5: 1, B5: 1.5}); th.record.more = true; th.provisional = false; if (lead) Object.assign(lead, {rank: 1, a5: 5, b5: 1, gap: 0.4}); } // 진짜 싹 · 앞에 몰림
  else if (V === 'C') { Object.assign(ix, {z: 'B', d: 3, dots: [1, 1, 0, 1], sc: 3, A5: 0, B5: 0, m10: 0}); th.record.real.n = 0; if (lead) Object.assign(lead, {rank: null, a5: 0.5, b5: 4}); } // 꽃 업종 · 회사 줄 밖 · 뒤따름 · 업종 그대로 · 성적표 못 셈
  else if (V === 'D') Object.assign(ix, {z: 'W', d: 2});
  else Object.assign(ix, {z: 'Q', d: 4, dots: [0, 0, 1, 1], sc: 2});
  Object.assign(hm, {count: th.count, record: th.record, provisional: th.provisional});
  const hi = hm.inds.find(i => i.n === X); if (hi) for (const k of ['z', 'x', 'y', 'd', 'dots', 'sc']) if (k in ix && k in hi) hi[k] = ix[k];
  if (V === 'B') hm.order.S.slice(0, 3).forEach((n, k) => { const i = hm.inds.find(x => x.n === n); if (i) Object.assign(i, {y: [9.6, 8.2, 7.1][k], x: [3.9, -2.5, 4.8][k]}); }); // 싹 앞 셋이 높을 때(큰 하락 뒤 · 실제 사이트 2026-10-19) 번호가 그림 안에
  return {th, mo, hm, X, lead: lead?.c ?? null};
}
/** ⑧ 재기 — check_hold.mjs ⑭ EDGES 그대로(그림 <svg> 속 글만 셈 밖) */
const EDGES = () => {
  const view = document.querySelector('#view'), vw = document.documentElement.clientWidth, R = document.createRange(), SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const vis = (el, q) => { let l = q.left, t = q.top, r = q.right, b = q.bottom; for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const x = a.getBoundingClientRect(); l = Math.max(l, x.left); t = Math.max(t, x.top); r = Math.min(r, x.right); b = Math.min(b, x.bottom); } } return r - l >= 1 && b - t >= 1; };
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map(), sizes = new Map(), own = new Map(), letterSizes = new Map(); const tw = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue; if (el.closest('svg')) continue;
    R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    if (!vis(el, rs[0])) continue;
    const f = Math.round(parseFloat(getComputedStyle(el).fontSize) * 2) / 2, inL = !!el.closest('a.m4-letter');
    (inL ? letterSizes : sizes).set(f, (sizes.get(f) || 0) + 1); if (!own.has(el)) own.set(el, f);
    const b = blockOf(el); if (!blocks.has(b)) blocks.set(b, {n, q: rs[0]});
  }
  const xs = new Map(), ex = {};
  for (const [b, t] of blocks) { if (/center|right|end/.test(getComputedStyle(b).textAlign)) continue; const x = Math.round(t.q.left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); if (!ex[x]) ex[x] = b.tagName.toLowerCase() + '.' + String(b.className).split(' ')[0] + ' 「' + t.n.nodeValue.trim().slice(0, 12) + '」'; }
  // 간격([10] 8) — #view 안 그려진 칸(가려지거나 잘린 것도)의 margin · padding · gap 이 0 · 8 · 16 · 24 인지, 음수는 없는지(measure_type.mjs 와 같은 잣대 — auto · % 는 뺌)
  const PROPS = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'], SPV = [0, 8, 16, 24];
  const nm = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const spBad = new Map(); let spN = 0, neg = 0; const negEx = [];
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    if (!el.getClientRects().length) continue;
    const map = el.computedStyleMap ? el.computedStyleMap() : null, cs = getComputedStyle(el);
    for (const pr of PROPS) {
      if (pr.endsWith('gap') && !/flex|grid/.test(cs.display)) continue;
      let v = null; const sv = map?.get(pr);
      if (sv && sv.constructor?.name === 'CSSKeywordValue') continue;
      if (sv && sv.constructor?.name === 'CSSUnitValue') { if (sv.unit === 'percent') continue; v = sv.unit === 'px' ? sv.value : parseFloat(cs.getPropertyValue(pr)); } else v = parseFloat(cs.getPropertyValue(pr));
      if (!Number.isFinite(v)) continue;
      if (v < -0.5) { neg++; if (negEx.length < 6) negEx.push(nm(el) + ' ' + pr + ' ' + Math.round(v)); continue; }
      if (SPV.some(s => Math.abs(s - v) < 0.6)) continue;
      spN++; const k = nm(el) + ' ' + pr.replace(/-(top|right|bottom|left)$/, '') + ' ' + Math.round(v * 10) / 10; spBad.set(k, (spBad.get(k) || 0) + 1);
    }
  }
  return {lefts: Object.fromEntries([...xs].sort((a, b) => a[0] - b[0])), ex, sizes: [...new Set([...sizes.keys()])].sort((a, b) => a - b), letter: [...letterSizes.keys()].sort((a, b) => a - b), px: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), spN, neg, negEx, spEx: [...spBad].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => k + ' ×' + n)};
};

async function rules(where, p) {
  const m = await p.evaluate(EDGES), n = Object.keys(m.lefts).length;
  if (n > 3) fail('글 시작 왼쪽 줄 3 넘음([10] 7)', where + ' ' + JSON.stringify(m.lefts) + ' ' + JSON.stringify(m.ex).slice(0, 200));
  const bad = m.sizes.filter(f => f < 16.95); if (bad.length) fail('17px 아래 글([10] 5)', where + ' ' + bad);
  if (m.sizes.length > 6) fail('글씨 크기 6가지 넘음([10] 6)', where + ' ' + m.sizes);
  const nt = m.sizes.filter(f => ![17, 19, 21, 24, 30, 48].includes(f)); if (nt.length) fail('글씨 크기가 토큰 밖([10] 6)', where + ' ' + nt);
  if (m.neg) fail('음수 간격([10] 8)', where + ' ' + m.negEx.join(' | '));
  if (m.spN) fail('간격이 0 · 8 · 16 · 24 아님([10] 8)', where + ' ' + (m.spEx ?? []).join(' | '));
  bump('글줄 · 글씨 · 간격 쪽');
}
const nextOf = p => p.evaluate(() => { const a = [...document.querySelectorAll('#view a.th-next')]; return {n: a.length, href: a.at(-1)?.getAttribute('href') ?? null, title: a.at(-1)?.querySelector('b')?.textContent ?? a.at(-1)?.textContent ?? null}; });
const prevOf = p => p.evaluate(() => document.querySelector('#view a.th-back')?.getAttribute('href') ?? null);
const noOf = p => p.evaluate(() => document.querySelector('#view .th-no b')?.textContent ?? null);

try {
  /* ② 첫 화면 칸 */
  {
    const {p, ctx} = await open('#/');
    await p.waitForFunction(() => document.querySelector('#view section.th-home .th-row, #view section.th-home .empty'), null, {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => {
      const v = document.querySelector('#view'), box = v.querySelector('section.th-home'), say = v.querySelector('div.w-say'), ess = v.querySelector('section.ess');
      return {box: !!box, afterSay: !!(box && say && (say.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING)), beforeEss: !!(box && ess && (box.compareDocumentPosition(ess) & Node.DOCUMENT_POSITION_FOLLOWING)),
        rows: [...(box?.querySelectorAll('a.th-row') ?? [])].map(a => ({href: a.getAttribute('href'), name: a.querySelector('.th-rn')?.textContent})), ans: box?.querySelector('.th-ans')?.textContent ?? '',
        three: [...(box?.querySelectorAll('.th-three p') ?? [])].map(x => x.textContent), rec: box?.querySelector('.th-rec')?.textContent ?? '', asof: box?.querySelector('.th-asof')?.textContent ?? '',
        next: box?.querySelector('a.th-next')?.getAttribute('href') ?? null, hi: box?.querySelector('a.th-hi')?.getAttribute('href') ?? null, more: box?.querySelector('a.th-more')?.getAttribute('href') ?? null, clock: !!box?.querySelector('svg.th-clock'), h1: v.querySelector('h1')?.textContent ?? ''};
    });
    if (!g.box) fail('첫 화면', '테마 시계 칸(section.th-home)이 없음');
    else {
      if (!g.afterSay || !g.beforeEss) fail('첫 화면 차례', '돌이 물음 → 테마 시계 → 본질 카드 차례가 아님');
      if (!/테마 시계/.test(g.h1)) fail('첫 화면 제목', g.h1);
      if (!g.clock) fail('첫 화면 시계 그림', '없음');
      const want = TH.order.S.slice(0, 3);
      if (JSON.stringify(g.rows.map(r => r.name)) !== JSON.stringify(want)) fail('첫 화면 줄 셋', g.rows.map(r => r.name).join(' · ') + ' ≠ ' + want.join(' · '));
      if (g.rows.some(r => r.href !== '#/t/i/' + enc(r.name))) fail('첫 화면 줄 고리', g.rows.map(r => r.href).join(' '));
      const ansWant = TH.count.real ? '진짜 싹 ' + num(TH.count.real) + '곳' : '지금은 진짜 싹이 없어요';
      if (g.ans.trim() !== ansWant) fail('첫 화면 답 줄', g.ans + ' ≠ ' + ansWant);
      const tw = [num(TH.count.real) + '곳진짜 싹', num(TH.count.fresh) + '곳새로 들어옴', num(TH.count.S) + '곳싹 자리'];
      if (JSON.stringify(g.three) !== JSON.stringify(tw)) fail('첫 화면 세 칸', g.three.join(' | '));
      const R = TH.record;
      if (R.more && !(g.rec.includes(`100번 가운데 ${Math.round(R.real.p)}번`) && g.rec.includes(`100번 가운데 ${Math.round(R.all.p)}번이었어요`))) fail('성적표 숫자', g.rec);
      if (!R.more && !g.rec.includes('차이가 없었어요')) fail('성적표 차이 없음 글', g.rec);
      if (g.asof) fail('첫 화면 기준 날', '첫 화면에는 날짜를 띠에 한 번만([6] 2) — 테마 칸에 ' + g.asof);
      if (g.next !== '#/t/how') fail('첫 화면 다음', g.next);
      if (g.more !== '#/t/sprout') fail('싹 자리 모두 보기 고리', g.more);
      if (g.hi !== '#/t/hello') fail('돌이 인사 고리', '첫 화면 테마 칸에 1장(#/t/hello)으로 가는 고리가 없음 — ' + g.hi);
    }
    await look('#/', p); bump('첫 화면'); await ctx.close();
  }
  /* ③ 「다음」 차례 — 인사부터 열여덟 번 */
  const ib = '#/t/i/' + enc(TOP), cb = LEAD ? '#/t/c/' + LEAD.c : null;
  const CHAIN = ['#/t/hello', '#/', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', ib, ib + '/path', ib + '/spread', ib + '/big', ib + '/co', ib + '/near',
    ...(cb ? [cb, cb + '/lead', cb + '/why', cb + '/rank', cb + '/unknown', cb + '/keep', '#/why/' + LEAD.c] : ['#/'])];
  const NO = {'#/t/hello': 1, '#/t/how': 3, '#/t/sprout': 4, '#/t/bloom': 5, '#/t/wilt': 6};
  {
    const {p, ctx} = await open(CHAIN[0]);
    for (let k = 0; k < CHAIN.length - 1; k++) {
      const here = CHAIN[k];
      if (here !== '#/') {
        const nx = await nextOf(p), no = await noOf(p), pv = await prevOf(p);
        if (nx.n !== 1) fail('다음 단추 수', here + ' ' + nx.n);
        if (nx.href !== CHAIN[k + 1]) fail('다음 차례', here + ' → ' + nx.href + ' (바람 ' + CHAIN[k + 1] + ')');
        const wantNo = NO[here] ?? (k <= 11 ? k + 1 : k + 1); if (no !== String(wantNo)) fail('쪽 번호', here + ' ' + no + ' ≠ ' + wantNo);
        // 앞 쪽 = 흐름의 앞 장 · 다만 업종 첫 쪽은 그 업종이 든 목록 · 회사 첫 쪽은 들어온 줄(함께 움직인 회사)로(2026-10-19 새 눈 검사 8 — 어디서 왔든 「‹ 시듦 자리」 이던 것)
        const zoneList = {S: '#/t/sprout', B: '#/t/bloom', W: '#/t/wilt'}[TH.inds.find(i => i.n === TOP)?.z] ?? '#/';
        const wantPv = k === 6 ? zoneList : k === 12 ? ib + '/co' : CHAIN[k - 1];
        if (k > 0 && pv !== wantPv) fail('앞 쪽 고리', here + ' ‹ ' + pv + ' (바람 ' + wantPv + ')');
        await look(here, p); await rules(here + ' @390', p);
      }
      const want = CHAIN[k + 1];
      await p.evaluate(h => { const a = location.hash === '#/' || location.hash === '' ? document.querySelector('#view section.th-home a.th-next') : [...document.querySelectorAll('#view a.th-next')].at(-1); if (a) a.click(); else location.hash = h; }, want);
      await p.waitForFunction(w => location.hash === w || decodeURIComponent(location.hash) === decodeURIComponent(w), want, {timeout: 8000}).catch(() => {});
      await settle(p);
      const at = await p.evaluate(() => location.hash);
      if (decodeURIComponent(at) !== decodeURIComponent(want)) { fail('다음 눌러 감', CHAIN[k] + ' → ' + at + ' (바람 ' + want + ')'); break; }
      bump('다음 차례');
    }
    await ctx.close();
  }
  /* 있는 쪽 맨 아래 「다음」 한 줄 · 오늘 정리 */
  for (const [from, to] of [['#/sub', '#/t/alert'], ['#/t/alert', '#/why'], ['#/why', '#/me'], ['#/me', '#/game'], ['#/game', '#/jinhwa'], ['#/jinhwa', '#/t/today'], ['#/t/today', '#/']]) {
    const {p, ctx} = await open(from);
    await p.waitForFunction(() => document.querySelector('#view a.th-next'), null, {timeout: 8000}).catch(() => {});
    const nx = await nextOf(p);
    if (nx.n !== 1 || nx.href !== to) fail('있는 쪽 다음', from + ' → ' + nx.href + ' ×' + nx.n + ' (바람 ' + to + ')');
    if (from === '#/t/today') await look(from, p); else if (p._errs.length) fail('화면 오류', from + ' ' + p._errs[0]);
    bump('있는 쪽 다음'); await ctx.close();
  }
  /* ④ 숫자 = 자료 */
  {
    const {p, ctx} = await open(ib);
    const s = await p.evaluate(() => ({ck: [...document.querySelectorAll('#view .th-ck > b')].map(b => b.textContent), ans: document.querySelector('#view .th-ans')?.textContent ?? ''}));
    if (JSON.stringify(s.ck) !== JSON.stringify(I1.dots.map(d => (d ? '✓' : '✗')))) fail('업종 점 넷', TOP + ' ' + s.ck.join('') + ' ≠ ' + I1.dots.join(''));
    if (s.ans !== '점 넷 가운데 ' + I1.sc + '개') fail('업종 점 수 줄', s.ans);
    await ctx.close();
    { const z = await open('#/t/sprout'); const a = await z.p.evaluate(() => document.querySelector('#view .th-asof')?.textContent ?? ''); if (!a.startsWith(MD(TH.asOf))) fail('기준 날', '#/t/sprout ' + a + ' ≠ ' + MD(TH.asOf)); await z.ctx.close(); }
    const q = await open(ib + '/spread');
    const sp = await q.p.evaluate(() => ({ans: document.querySelector('#view .th-ans')?.textContent ?? '', bars: document.querySelectorAll('#view svg.th-bars rect').length}));
    if (sp.ans !== `${num(I1.tot)}곳 가운데 ${num(I1.up)}곳`) fail('번짐 수', sp.ans);
    if (sp.bars !== I1.sp.length) fail('번짐 막대 수', sp.bars + ' ≠ ' + I1.sp.length);
    await q.ctx.close();
    if (LEAD) {
      const r = await open(cb);
      const t = await r.p.evaluate(() => document.querySelector('#view .th-ans')?.textContent ?? '');
      if (t !== '열흘 동안 ' + pp(LEAD.d10) + '%') fail('회사 열흘', t + ' ≠ ' + pp(LEAD.d10));
      await r.ctx.close();
    }
    bump('숫자');
  }
  /* ⑤ 두 폭 — 남은 쪽들 */
  for (const w of [360, 320]) for (const hsh of ['#/', '#/t/alert', '#/t/how', '#/t/sprout', ib, ib + '/co', ib + '/near', ...(cb ? [cb + '/lead', cb + '/why', cb + '/rank'] : []), '#/t/today']) {
    const {p, ctx} = await open(hsh, {w, h: 640}); await look(hsh + ' @' + w, p); bump('폭'); await ctx.close();
  }
  /* ⑦ 자료를 바꾼 다섯 판 — 한국어 · 영어(320) */
  if (HM) for (const V of ['A', 'B', 'C', 'D', 'E']) {
    const v = variant(V), ib2 = '#/t/i/' + enc(v.X), cb2 = v.lead ? '#/t/c/' + v.lead : null;
    const hs = ['#/', '#/t/hello', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', '#/t/today', '#/t/alert', ib2, ...['path', 'spread', 'big', 'co', 'near'].map(s => ib2 + '/' + s), ...(cb2 ? [cb2, ...['lead', 'why', 'rank', 'unknown', 'keep'].map(s => cb2 + '/' + s)] : [])];
    const routes = [['**/next/data/theme.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.th)})], ['**/next/data/theme-more.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.mo)})], ['**/next/data/theme-home.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.hm)})]];
    for (const en of [false, true]) {
      const {p, ctx} = await open((en ? '?lang=en' : '') + hs[0], {w: 320, h: 640, routes});
      for (const hsh of hs) {
        if (hsh !== hs[0]) { await p.evaluate(x => { location.hash = x; }, hsh); await settle(p); }
        if (!en) {
          await look(V + ' ' + hsh + ' @320', p); bump('바꾼 자료 쪽'); if (V === 'A' && hsh !== '#/') await rules(V + ' ' + hsh + ' @320', p);
          if (hsh === '#/') { const nb = await p.evaluate(() => { const s = document.querySelector('#view section.th-home svg.th-clock'); if (!s) return null; const vb = s.viewBox.baseVal; return [...s.querySelectorAll('circle.th-nb')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy'), +c.getAttribute('r')]).filter(([x, y, r]) => x - r < 0 || y - r < 0 || x + r > vb.width || y + r > vb.height); }); if (nb?.length) fail('첫 화면 시계 번호가 그림 밖', V + ' ' + JSON.stringify(nb)); } // 2026-10-19 실제 사이트 첫 화면 ① 이 잘림
          continue;
        }
        await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 8000}).catch(() => {}); await p.waitForTimeout(150);
        const s = await enScan(p);
        if (s.han.length) fail('영어 — 보이는 한글', V + ' ' + hsh + ' 「' + s.han.slice(0, 3).join('」 「') + '」');
        if (s.over > 0 || s.off.length) fail('영어 — 화면 밖', V + ' ' + hsh + ' ' + s.over + 'px ' + s.off.slice(0, 3).join(' | '));
        if (s.spill.length) fail('줄 안 넘침', V + ' ' + hsh + ' ' + s.spill.slice(0, 3).join(' | '));
        const ic = await p.evaluate(() => [...document.querySelectorAll('#view .th-ans em[data-tr], #view .th-ans[data-tr], #view .th-three b')].map(e => e.textContent).filter(x => /compan/i.test(x))); if (ic.length) fail('영어 업종 수가 회사로', V + ' ' + hsh + ' ' + ic.join(' | ')); // 2026-10-19 「다해」 못 한 것 3
        bump('바꾼 자료 영어 쪽');
      }
      if (en) { const miss = await p.evaluate(() => (window.__atlasI18n?.missing?.() ?? []).map(m => m.key)); if (miss.length) fail('영어 — 사전에 없는 틀', V + ' ' + miss.slice(0, 4).join(' | ')); }
      if (p._errs.length) fail('화면 오류', V + (en ? ' 영어 ' : ' ') + p._errs.slice(0, 2).join(' | '));
      await ctx.close();
    }
  }
  /* ⑨ 관심 업종 · 사이트 안 알림(2026-10-19 「다해」 못 한 것 1 · 견본 18 · 26 쪽) — 담기 → 알림 쪽 줄 · 켜짐 단추 · 첫 화면 소식(바뀐 자리만 · 꺼 두면 없음) */
  {
    const z0 = I1.z, other = z0 === 'S' ? 'Q' : 'S', want = {S: '싹 자리에 들어왔어요', B: '꽃 선을 넘었어요', W: '시듦 자리로 갔어요', Q: '잠잠 자리로 갔어요'}[z0];
    const a = await open(ib);
    const w0 = await a.p.evaluate(() => document.querySelector('#view .th-watch')?.getAttribute('aria-pressed'));
    await a.p.locator('#view .th-watch').click(); await a.p.waitForTimeout(200);
    const w1 = await a.p.evaluate(() => ({pressed: document.querySelector('#view .th-watch')?.getAttribute('aria-pressed'), list: JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]')}));
    if (w0 !== 'false' || w1.pressed !== 'true' || !w1.list.includes(TOP)) fail('관심 업종 담기', JSON.stringify({w0, w1}));
    await a.p.evaluate(() => { location.hash = '#/t/alert'; }); await settle(a.p);
    const al = await a.p.evaluate(() => ({sw: [...document.querySelectorAll('#view .th-sw[role="switch"]')].map(b => b.getAttribute('aria-checked')), rows: [...document.querySelectorAll('#view .th-al a.th-alt')].map(x => x.textContent), no: document.querySelector('#view .th-no b')?.textContent}));
    if (JSON.stringify(al.sw) !== JSON.stringify(['true', 'true', 'true', 'true']) || !al.rows.includes(TOP) || al.no !== '26') fail('알림 쪽', JSON.stringify(al));
    await a.p.locator('#view .th-sw[role="switch"]').first().click(); await a.p.waitForTimeout(150);
    const s1 = await a.p.evaluate(() => ({c: document.querySelector('#view .th-sw[role="switch"]')?.getAttribute('aria-checked'), set: JSON.parse(localStorage.getItem('dori:alert-set') ?? 'null')}));
    if (s1.c !== 'false' || s1.set?.S !== false) fail('알림 켜짐 단추', JSON.stringify(s1));
    await look('#/t/alert (담음 1)', a.p); await rules('#/t/alert (담음 1) @390', a.p);
    await a.ctx.close();
    for (const [tag, set, expect] of [['켜짐', {S: true, B: true, W: true, M: false}, true], ['꺼짐', {S: false, B: false, W: false, M: false}, false]]) {
      const c = await browser.newContext({viewport: {width: 390, height: 844}, locale: 'ko-KR'});
      await c.addInitScript(([n, oz, s]) => { try { localStorage.setItem('dori:watch-ind', JSON.stringify([n])); localStorage.setItem('dori:watch-seen', JSON.stringify({asOf: '2000-01-01', zones: {[n]: oz}, news: []})); localStorage.setItem('dori:alert-set', JSON.stringify(s)); } catch { /* 없음 */ } }, [TOP, other, set]);
      const p = await c.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(String(e.message)));
      await p.goto(PAGE + '#/', {waitUntil: 'domcontentloaded'}); await settle(p);
      await p.waitForFunction(() => document.querySelector('#view section.th-home .th-row, #view section.th-home .empty'), null, {timeout: 20000}).catch(() => {});
      const n = await p.evaluate(() => { const b = document.querySelector('#view section.th-home .th-news'); return b ? {links: [...b.querySelectorAll('a.th-nl')].map(a => [a.getAttribute('href'), a.textContent]), set: b.querySelector('a.th-hi')?.getAttribute('href')} : null; });
      if (expect && !(n && n.links.some(([href, tx]) => href === '#/t/i/' + enc(TOP) && tx.includes(want)) && n.set === '#/t/alert')) fail('첫 화면 관심 업종 소식(' + tag + ')', JSON.stringify(n) + ' 바람 「' + TOP + ' ' + want + '」');
      if (!expect && n) fail('첫 화면 관심 업종 소식(' + tag + ')', '알림을 모두 꺼도 소식 칸이 보임 ' + JSON.stringify(n));
      if (p._errs.length) fail('화면 오류', '관심 소식 ' + p._errs[0]);
      bump('관심 업종 알림'); await c.close();
    }
  }
  /* ⑩ 새 눈 검사(2026-10-19 22시) 열 가지 — 싹 줄 높이 · 저장 막힘 · 20곳 · 빼기 · 없는 업종 · 같은 기준 날 다시 셈 · 깨진 기록 · 시듦→꽃 글 · 소식 줄 수 · 단추 여백 · 줄 높이 맞춤 · 낱말 끊김 */
  {
    async function openSeed(hash, seed, {w = 390, h = 844, en = false, font = 0, block = false} = {}) {
      const ctx = await browser.newContext({viewport: {width: w, height: h}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
      await ctx.addInitScript(([sd, f, bl]) => { try { for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, JSON.stringify(v)); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 없음 */ } if (bl) { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (String(k).startsWith('dori:')) throw new DOMException('막힘', 'QuotaExceededError'); return o.call(this, k, v); }; } }, [seed, font, block]);
      const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(String(e.message).slice(0, 160)));
      await p.goto(PAGE + (en ? '?lang=en' : '') + hash, {waitUntil: 'domcontentloaded'}); await settle(p);
      if (en) { await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 8000}).catch(() => {}); await p.waitForTimeout(150); }
      return {p, ctx};
    }
    const lastToast = p => p.evaluate(() => [...document.querySelectorAll('p.toast')].pop()?.textContent ?? '');
    const homeNews = async p => { await p.waitForFunction(() => document.querySelector('#view section.th-home .th-row, #view section.th-home .empty'), null, {timeout: 20000}).catch(() => {}); return p.evaluate(() => ({nl: [...document.querySelectorAll('#view section.th-home .th-news a.th-nl')].map(a => a.textContent), nm: document.querySelector('#view section.th-home .th-news .th-nm')?.textContent ?? null})); };
    // (가) 싹 줄 — 폭 · 글꼴 · 말이 바뀌어도 줄 높이 같음 · 며칠째 알약 테 왼쪽 = 꽃까지 = 이름 글 시작 · 막대 길이 하나
    for (const [w, en, font] of [[390, false, 0], [360, false, 0], [320, false, 1], [320, true, 0], [320, true, 2]]) {
      const {p, ctx} = await openSeed('#/t/sprout', {}, {w, h: 800, en, font});
      const r = await p.evaluate(() => [...document.querySelectorAll('#view a.th-row')].map(a => { const q = s => a.querySelector(s)?.getBoundingClientRect(); const n = q('.th-rn'), t = q('.th-tg'), b = q('.th-to'), bar = q('.th-to .th-bar'); return {h: Math.round(a.getBoundingClientRect().height), nl: n?.left, tl: t?.left, tb: t?.bottom, bt: b?.top, bl: b?.left, bw: bar ? Math.round(bar.width) : null}; }));
      const tag = `싹 줄 @${w}${en ? ' 영어' : ''}${font ? ' 글씨' + font : ''}`, hs = r.map(x => x.h), bws = new Set(r.map(x => x.bw));
      if (!r.length) fail('싹 줄 없음', tag);
      else if (Math.max(...hs) - Math.min(...hs) > 2) fail('싹 줄 높이 다름', tag + ' ' + [...new Set(hs)].join('/'));
      if (bws.size > 1) fail('꽃까지 막대 길이 다름', tag + ' ' + [...bws].join('/'));
      const bad = r.filter(x => x.tl == null || Math.abs(x.tl - x.nl) > 1.5 || Math.abs(x.bl - x.nl) > 1.5 || x.bt < x.tb - 1);
      if (bad.length) fail('싹 줄 알약 · 꽃까지 자리', tag + ' ' + JSON.stringify(bad[0]));
      if (p._errs.length) fail('화면 오류', tag + ' ' + p._errs[0]);
      bump('싹 줄 모양'); await ctx.close();
    }
    // (나) 저장이 막히면 「담았어요」라 하지 않음 · 켜기 단추도 그대로
    {
      const {p, ctx} = await openSeed(ib, {}, {block: true});
      await p.locator('#view .th-watch').click(); await p.waitForTimeout(200);
      const a1 = await p.evaluate(() => ({pressed: document.querySelector('#view .th-watch')?.getAttribute('aria-pressed'), text: document.querySelector('#view .th-watch')?.textContent}));
      const t1 = await lastToast(p);
      if (a1.pressed !== 'false' || /담았어요/.test(a1.text) || !/담지 못했어요/.test(t1)) fail('저장 막힘 — 관심 담기', JSON.stringify(a1) + ' 「' + t1 + '」');
      await p.evaluate(() => { location.hash = '#/t/alert'; }); await settle(p);
      await p.locator('#view .th-sw[role="switch"]').first().click(); await p.waitForTimeout(150);
      const a2 = await p.evaluate(() => document.querySelector('#view .th-sw[role="switch"]')?.getAttribute('aria-checked')), t2 = await lastToast(p);
      if (a2 !== 'true' || !/담지 못했어요/.test(t2)) fail('저장 막힘 — 알림 켜짐 단추', a2 + ' 「' + t2 + '」');
      if (cb) { // 같은 쪽 회사 관심 담기(app.js laterBtn)도 같은 잣대
        await p.evaluate(x => { location.hash = x; }, cb + '/keep'); await settle(p);
        await p.locator('#view .th-keep:not(.th-watch)').first().click(); await p.waitForTimeout(150);
        const a3 = await p.evaluate(() => document.querySelector('#view .th-keep:not(.th-watch)')?.getAttribute('aria-pressed')), t3 = await lastToast(p);
        if (a3 !== 'false' || !/담지 못했어요/.test(t3)) fail('저장 막힘 — 회사 관심 담기', a3 + ' 「' + t3 + '」');
      }
      if (p._errs.length) fail('화면 오류', '저장 막힘 ' + p._errs[0]);
      bump('관심 업종 알림'); await ctx.close();
    }
    // (다) 20곳이 차면 21번째는 막고 까닭을 알림(맨 앞을 말없이 빼지 않음)
    {
      const twenty = TH.inds.map(i => i.n).filter(n => n !== TOP).slice(0, 20);
      const {p, ctx} = await openSeed(ib, {'dori:watch-ind': twenty});
      await p.locator('#view .th-watch').click(); await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({pressed: document.querySelector('#view .th-watch')?.getAttribute('aria-pressed'), list: JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]')})), t = await lastToast(p);
      if (r.pressed !== 'false' || r.list.length !== 20 || r.list.includes(TOP) || r.list[0] !== twenty[0] || !/20곳까지/.test(t)) fail('관심 업종 20곳', JSON.stringify({pressed: r.pressed, n: r.list.length, t}));
      bump('관심 업종 알림'); await ctx.close();
    }
    // (라) 알림 쪽 — 없는 업종은 고리 없이 까닭 · 빼면 머리 수 · 빈 줄 · 누름 자리 · 없는 업종 쪽 글
    {
      const GONE = '없어진 업종';
      const {p, ctx} = await openSeed('#/t/alert', {'dori:watch-ind': [TOP, GONE]});
      const st = () => p.evaluate(() => ({h: document.querySelector('#view .th-wl h2')?.textContent, links: [...document.querySelectorAll('#view .th-wl a.th-alt')].map(a => a.textContent), gone: [...document.querySelectorAll('#view .th-wl span.th-alt')].map(s => s.textContent + ' ' + s.nextElementSibling?.textContent), n: document.querySelectorAll('#view .th-wl .th-al').length, empty: document.querySelector('#view .th-wl p.th-sub')?.textContent ?? '', focus: (document.activeElement?.tagName ?? '') + '.' + (document.activeElement?.className ?? ''), list: JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]')}));
      const r0 = await st();
      if (r0.h !== '관심 업종 2곳' || r0.links.join() !== TOP || r0.gone.join() !== GONE + ' 지금 자료에 없어요') fail('알림 쪽 없는 업종 줄', JSON.stringify(r0));
      await p.locator('#view .th-wl .th-al .th-sw').first().click(); await p.waitForTimeout(150);
      const r1 = await st();
      if (r1.h !== '관심 업종 1곳' || r1.n !== 1 || !/th-sw/.test(r1.focus) || r1.list.join() !== GONE) fail('알림 쪽 빼기 — 하나 남음', JSON.stringify(r1));
      await p.locator('#view .th-wl .th-al .th-sw').first().click(); await p.waitForTimeout(150);
      const r2 = await st();
      if (r2.h !== '관심 업종 0곳' || !/아직 담은 업종이 없어요/.test(r2.empty) || !r2.focus.startsWith('H2') || r2.list.length) fail('알림 쪽 빼기 — 다 뺌', JSON.stringify(r2));
      await p.evaluate(g => { location.hash = '#/t/i/' + encodeURIComponent(g); }, GONE); await settle(p);
      const g = await p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '');
      if (!/지금 테마 시계 자료에 없어요/.test(g) || /잠시 뒤/.test(g)) fail('없는 업종 쪽 글', g);
      if (p._errs.length) fail('화면 오류', '알림 쪽 빼기 ' + p._errs[0]);
      bump('관심 업종 알림'); await ctx.close();
    }
    // (마) 같은 기준 날에 자료를 다시 만들면(16시 · 19시) 소식도 지금 자리로 다시 셈 · 깨진 기록은 버림 · 빼기는 오류 없음
    {
      const z0 = I1.z, other = z0 === 'S' ? 'Q' : 'S', day = HM?.asOf ?? TH.asOf, set = {S: true, B: true, W: true, M: false};
      for (const [tag, seen, expect] of [['같은 날 · 바탕과 다름', {asOf: day, base: {[TOP]: other}, zones: {[TOP]: other}}, true], ['같은 날 · 다시 만든 자료가 바탕과 같음', {asOf: day, base: {[TOP]: z0}, zones: {[TOP]: other}}, false], ['깨진 기록', {asOf: '2000-01-01', zones: {[TOP]: other}, news: [null]}, true]]) {
        const {p, ctx} = await openSeed('#/', {'dori:watch-ind': [TOP], 'dori:watch-seen': seen, 'dori:alert-set': set});
        const n = await homeNews(p), has = n.nl.some(t => t.startsWith(TOP));
        if (has !== expect) fail('관심 소식 — ' + tag, JSON.stringify(n.nl) + ' 바람 ' + (expect ? '있음' : '없음'));
        if (tag === '깨진 기록') {
          await p.evaluate(x => { location.hash = x; }, ib); await settle(p);
          await p.locator('#view .th-watch').click(); await p.waitForTimeout(200);
          const pr = await p.evaluate(() => document.querySelector('#view .th-watch')?.getAttribute('aria-pressed'));
          if (pr !== 'false') fail('관심 소식 — 깨진 기록 뒤 빼기', pr);
        }
        if (p._errs.length) fail('화면 오류', '관심 소식 ' + tag + ' ' + p._errs[0]);
        bump('관심 업종 알림'); await ctx.close();
      }
    }
    // (바) 시듦→꽃 글 · 첫 화면 소식 세 줄 + 「그 밖에」 · 아침 한 줄 다섯 곳 + 「외」
    {
      const six = TH.inds.filter(i => i.z !== 'Q').slice(0, 6), seen = {asOf: '2000-01-01', zones: Object.fromEntries(six.map(i => [i.n, i.z === 'S' ? 'Q' : 'S']))};
      const {p, ctx} = await openSeed('#/', {'dori:watch-ind': six.map(i => i.n), 'dori:watch-seen': seen, 'dori:alert-set': {S: true, B: true, W: true, M: true}});
      const n = await homeNews(p);
      const tx = await p.evaluate(async () => { const m = await import('./theme-watch.js'); return [m.newsText({n: 'x', from: 'W', to: 'B'}), m.newsText({n: 'x', from: 'S', to: 'B'})]; });
      if (tx[0] !== '다시 꽃 자리로 왔어요' || tx[1] !== '꽃 선을 넘었어요') fail('시듦→꽃 소식 글', tx.join(' | '));
      if (six.length === 6 && (n.nl.length !== 4 || !/^그 밖에 3곳도/.test(n.nl[3] ?? '') || !/ 외 1곳$/.test(n.nm ?? ''))) fail('첫 화면 소식 줄 수', JSON.stringify(n));
      if (p._errs.length) fail('화면 오류', '소식 줄 수 ' + p._errs[0]);
      bump('관심 업종 알림'); await ctx.close();
    }
    // (사) 관심 담기 쪽 단추 여백 · 알림 쪽 이름 · 자리 · 단추 한 높이 · 영어 큰 글씨에서 낱말 가운데 끊김 없음
    {
      if (cb) {
        const {p, ctx} = await openSeed(cb + '/keep', {});
        const pd = await p.evaluate(() => { const b = document.querySelector('#view .th-watch'); if (!b) return null; const cs = getComputedStyle(b), R = document.createRange(); R.selectNodeContents(b); const t = R.getBoundingClientRect(), r = b.getBoundingClientRect(); return {pl: parseFloat(cs.paddingLeft), pt: parseFloat(cs.paddingTop), in: Math.round(Math.min(t.left - r.left, r.right - t.right))}; });
        if (!pd || pd.pl < 16 || pd.pt < 8 || pd.in < 16) fail('관심 담기 단추 여백', JSON.stringify(pd));
        await ctx.close();
      }
      const names = TH.inds.map(i => i.n).sort((a, b) => b.length - a.length).slice(0, 6);
      for (const [w, en, font] of [[390, false, 0], [320, true, 2]]) {
        const {p, ctx} = await openSeed('#/t/alert', {'dori:watch-ind': names}, {w, h: 800, en, font});
        const r = await p.evaluate(() => {
          const out = {mis: [], split: []}, R = document.createRange();
          for (const row of document.querySelectorAll('#view .th-wl .th-al')) {
            const a = row.querySelector('.th-alt'), z = row.querySelector('.th-z'), b = row.querySelector('.th-sw'); if (!a || !z || !b) continue;
            R.selectNodeContents(a); const ar = [...R.getClientRects()], zr = z.getBoundingClientRect(), br = b.getBoundingClientRect();
            if (ar.length === 1 && Math.abs(zr.top - br.top) < 4) { const cy = q => q.top + q.height / 2; if (Math.abs(cy(ar[0]) - cy(zr)) > 3) out.mis.push(a.textContent + ' ' + Math.round(cy(ar[0]) - cy(zr))); }
            const tn = [...a.childNodes].find(n => n.nodeType === 3); if (!tn) continue;
            for (const m of tn.nodeValue.matchAll(/[^\s·&]+/g)) { R.setStart(tn, m.index); R.setEnd(tn, m.index + m[0].length); const rs = [...R.getClientRects()].filter(q => q.width >= 1); if (rs.length > 1 && new Set(rs.map(q => Math.round(q.top))).size > 1) out.split.push(m[0]); }
          }
          return out;
        });
        const tag = `알림 쪽 @${w}${en ? ' 영어 글씨' + font : ''}`;
        if (r.mis.length) fail('알림 쪽 줄 높이 어긋남', tag + ' ' + r.mis.slice(0, 3).join(' | '));
        if (r.split.length) fail('알림 쪽 낱말 가운데 끊김', tag + ' ' + r.split.slice(0, 4).join(' | '));
        if (!en) await rules(tag, p);
        if (p._errs.length) fail('화면 오류', tag + ' ' + p._errs[0]);
        bump('관심 업종 알림'); await ctx.close();
      }
    }
  }
  /* ⑥ 자료를 못 받으면 「?」 */
  {
    const no = [['**/next/data/theme*.json*', r => r.fulfill({status: 404, body: 'x'})]];
    const a = await open('#/', {routes: no});
    const t = await a.p.evaluate(() => document.querySelector('#view section.th-home')?.textContent ?? '');
    if (!/^\? 테마 시계 자료를 받지 못했어요/.test(t.trim())) fail('자료 없을 때 첫 화면', t.slice(0, 60));
    if (a.p._errs.length) fail('자료 없을 때 화면 오류', a.p._errs[0]);
    await a.ctx.close();
    const b = await open('#/t/how', {routes: no});
    const u = await b.p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '');
    if (!/^\? 테마 시계 자료를 받지 못했어요/.test(u)) fail('자료 없을 때 쪽', u.slice(0, 60));
    await b.ctx.close();
    bump('자료 없음');
  }
} finally { await browser.close(); }

const ok = !fails.length;
console.log((ok ? '통과' : '걸림 ' + fails.length) + ' · ' + Object.entries(counts).map(([k, v]) => k + ' ' + v).join(' · ') + ' · ' + Math.round((Date.now() - t0) / 1000) + '초');
if (OUT) await fs.writeFile(OUT, JSON.stringify({ok, at: new Date().toISOString(), base, counts, fails}, null, 1));
process.exit(ok ? 0 : 1);

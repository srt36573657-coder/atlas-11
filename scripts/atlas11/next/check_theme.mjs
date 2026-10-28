#!/usr/bin/env node
// 테마 시계 쪽 맞대기 — 첫 화면 맨 위 칸(section.th-home) · #/t/… 열아홉 쪽 · 있는 쪽 맨 아래 「다음」 한 줄
//   사장님 2026-10-19(싱가포르) 16:06 「테마가 될 듯한 걸 찾아 주는 거야」 · 16:46 「물 흐르듯 … 다음다음다음 … 36장」 · 16:54 「이제 aaa7377.com에 올려 … 더 스마트한 내부 시스템」
//   셈 원본 = 결정표 docs/design/theme-2026-10-19/theme-engine.md(셈은 tests/atlas11/theme.test.mjs · 따로 세기 scratchpad recount) — 이 검사는 화면이 자료(/next/data/theme.json · theme-more.json)를 그대로 보이는지
//   쓰는 법: node scripts/atlas11/next/check_theme.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//   ① 자료 꼴(차례 수 = 자리 수 · 합 = 업종 수) ② 첫 화면 칸(돌이 물음 뒤 · 줄 셋 = 싹 차례 앞 셋 · 접는 칸 맨 위 성적표 · 세 줄(이름 · 수 · 고리) · 성적표 숫자 · 기준 날)
//   ③ 「다음」 차례 — 인사에서 「다음」만 눌러 열여덟 번(→ #/why/<번호>) · 있는 쪽 다섯(관심 → 매매일지 → 보유종목 → 가짜 돈 → 진화 → 오늘 정리 → 첫 화면) · 앞 쪽(‹) 고리
//   ④ 숫자 = 자료(업종 쪽 점 넷 ✓ · 번짐 수 · 회사 열흘 %) ⑤ 두 폭(360 · 390) 가로 넘침 0 · 글 17px 넘게 · 누르는 자리 44px · 화면 오류 0 · 쓰지 않을 말 0
//   ⑥ 자료를 못 받으면 「?」 한 줄(첫 화면 · 쪽) — 화면이 죽지 않음
//   ⑦ 자료를 바꾼 다섯 판(A ~ E · 받은 자료를 이 검사 안에서 바꿔 끼움)으로 열아홉 쪽을 한국어 · 영어 320 폭에서 — 자료에 따라 갈리는 글이 모두 한 번씩 그려짐
//      (진짜 싹 0 · 새로 들어옴 · 점 하나 · 큰 회사 값 없음 · 무리 없음 · 장중 · 시듦 빔 · 꽃 · 시듦 · 잠잠 업종 · 회사 줄 밖 · 먼저 · 뒤따름 · 성적표 못 셈)
//      한국어 = ⑤ 잣대 · 영어 = 사전에 없는 틀 0 · 보이는 한글 0(lang="ko" 빼고) · 화면 밖 칸 0 · 줄 안 넘침 0 — 2026-10-19 틀림 장부 60(이 방 자료 한 판으로는 영어가 통과해도 실제 자료에서 걸림)
//      · 영어 업종 수 = 「industries」(「companies」 아님 · i18n.js 자리 표 data-tr)
//   ⑧ 글줄 · 글씨 · 간격([10] 5 · 6 · 7 · 8 — check_hold ⑭ 와 같은 셈 · 그림 <svg> 속 글은 셈 밖): 열아홉 쪽 390(③ 차례) · 320(⑦ A 판) — 글 시작 왼쪽 줄 3 이하 · 17px 아래 0 · 글씨 6가지 · 토큰 · 간격 0 · 8 · 16 · 24 · 음수 0
//      사장님 2026-10-19 20:40 「다해」(못 한 것 4 — 테마 쪽은 견본 모양 그대로라 왼쪽 줄이 6 ~ 18) → 16 · 33 · 56 세 줄
//   ★ 2026-10-28 새 첫 화면(사장님 11:12 「어」 — 첫 화면부터 처음 보는 사람 눈높이로 · docs/design/why-mock-2026-10-28/order-1112.txt · site/next/home-new.js)
//     첫 화면 테마 칸(section.th-home · 시계 · 줄 셋 · 주황 숫자 · 접는 칸 · 「다음」)은 빠짐 → ② 는 업종 점 그림 칸(section.nh-map)을 자료와 맞댐 · ⑪ 는 새 첫 화면 고리(모두 보기 · 지난 기록 · 「왜 사?」 시작)
//     ⑫ 거른 목록(진짜 싹 · 새로 들어옴 · 싹 자리)은 첫 화면 칸이 없어 주소로 바로 엶 · ③ 「다음」 사슬의 첫 화면 칸은 주소로 넘어감(새 첫 화면에 「다음」 단추가 없음)
//     ⑨ ⑩ 관심 업종 소식(section.th-news)은 첫 화면 어디에 있든 셈(옛: 테마 칸 안)
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import fss from 'node:fs';
import {createRequire} from 'node:module';
import {screenHits} from '../../../site/next/words.js';
import {pp} from '../../../site/next/theme-engine.js';
import {isRemote} from './net.mjs';
import * as HN from '../../../site/next/home-new.js'; // 새 첫 화면 칸(2026-10-28) — 네 자리 쉬운 이름(ZNAME) 한 곳
import {TITLES} from '../../../site/next/home-title.js'; // 큰 제목 넷(사장님 2026-10-21 23:55 「어 섹시하게」 — 23:21 물음 「이 넷을 차례로 돌려 보일까요?」의 답)

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // check_white 와 같은 길(깃허브 실행기는 PW_DIR)
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), OUT = arg('--out', null), PAGE = base + '/next/';
const fails = [], counts = {}, t0 = Date.now();
let sink = null; // 실제 사이트 ⑫ — 자료가 바뀐 사이에 걸린 것을 모아 두고 새 자료로 한 번 더 셈(아래 ⑫)
const fail = (k, x) => { if (sink) { sink.push([k, x]); return; } counts.fail = (counts.fail || 0) + 1; if (fails.length < 300) fails.push([k, String(x).slice(0, 300)]); console.log('걸림 ' + k + ' — ' + String(x).slice(0, 200)); };
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
  /* ② 첫 화면 업종 칸 — 2026-10-28 새 첫 화면(사장님 11:12 「어」 · order-1112): 옛 테마 칸(section.th-home · 시계 · 줄 셋 · 주황 숫자 · 접는 칸 · 「다음」 · 둘이 인사)은 빠지고
     업종 점 그림 칸(section.nh-map)이 소개 칸(section.nh-hero) 뒤 · 본질 세 줄(section.ess) 앞 — 둘이 물음(data-say · 「?」로 끝남) · 그림 날짜 = 자료 기준 날 · 점 수 = 업종 수
     · 네 자리 이름과 수 = 자료 count 그대로(theme-home.json — 첫 화면이 받는 자료) · 조건 넷을 모두 채운 업종(점 넷 sc 4) = 굵은 점 · 그 이름 글 · 「업종 n개 모두 보기」 → #/f/ind · 옛 시계 그림 0 */
  {
    const {p, ctx} = await open('#/');
    await p.waitForFunction(() => document.querySelector('#view section.nh-map svg.nh-plot circle, #view section.nh-map .nh-p'), null, {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => {
      const v = document.querySelector('#view'), box = v.querySelector('section.nh-map'), hero = v.querySelector('section.nh-hero'), ess = v.querySelector('section.ess'), a = box?.querySelector('a.nh-link');
      return {box: !!box, afterHero: !!(box && hero && (hero.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING)), beforeEss: !!(box && ess && (box.compareDocumentPosition(ess) & Node.DOCUMENT_POSITION_FOLLOWING)),
        ask: box?.querySelector('h2[data-say]')?.textContent ?? null, d: box?.querySelector('.nh-d')?.textContent ?? '', dots: box?.querySelectorAll('svg.nh-plot circle.nh-dot').length ?? 0, dots4: box?.querySelectorAll('svg.nh-plot circle.nh-dot4').length ?? 0,
        leg: [...(box?.querySelectorAll('.nh-leg li') ?? [])].map(li => [li.querySelector('span')?.textContent ?? '', li.querySelector('b')?.textContent ?? '']), rt: box?.querySelector('.nh-real')?.textContent ?? '',
        all: a ? {href: a.getAttribute('href'), t: a.textContent.replace(/\s+/g, ' ').trim(), h: Math.round(a.getBoundingClientRect().height)} : null, old: !!v.querySelector('section.th-home, svg.th-clock, .th-zones, .s-clk, .s-apps')};
    });
    const HMx = HM ?? {inds: TH.inds, count: TH.count, asOf: TH.asOf}, n = HMx.inds.length, ZN = HN.ZNAME ?? {S: '막 오르기 시작', B: '한 달 내내 강함', W: '강하다 꺾임', Q: '조용함'};
    if (!g.box) fail('첫 화면', '업종 점 그림 칸(section.nh-map)이 없음(2026-10-28 새 첫 화면)');
    else {
      if (!g.afterHero || !g.beforeEss) fail('첫 화면 차례', '소개 칸 → 업종 점 그림 → 본질 세 줄 차례가 아님');
      if (g.ask !== `지금 업종 ${num(n)}개는 어디쯤 있나요?`) fail('첫 화면 업종 칸 물음', `${g.ask} ≠ 지금 업종 ${num(n)}개는 어디쯤 있나요?`);
      if (!g.d.includes(MD(HMx.asOf) + ' 종가 기준')) fail('첫 화면 업종 칸 기준 날', `「${g.d}」 에 ${MD(HMx.asOf)} 종가 기준 없음`);
      if (g.dots !== n) fail('첫 화면 점 수 = 업종 수', `${g.dots} ≠ ${n}`);
      const real = HMx.inds.filter(i => i.sc === 4).map(i => i.n);
      if (g.dots4 !== real.length) fail('조건 넷 업종 = 굵은 점', `${g.dots4} ≠ ${real.length}`);
      if (real.length ? !real.every(x => g.rt.includes(x)) : !/없습니다/.test(g.rt)) fail('조건 넷을 채운 업종 글', `「${g.rt}」 · 자료 ${real.join(', ') || '없음'}`);
      const wantLeg = ['S', 'B', 'Q', 'W'].map(z => [ZN[z], Number.isFinite(HMx.count?.[z]) ? HMx.count[z] + '개' : '?']);
      if (JSON.stringify(g.leg) !== JSON.stringify(wantLeg)) fail('네 자리 이름과 수 = 자료 count', JSON.stringify(g.leg) + ' ≠ ' + JSON.stringify(wantLeg));
      if (!g.all || g.all.href !== '#/f/ind' || !g.all.t.startsWith(`업종 ${num(n)}개 모두 보기`) || g.all.h < 48) fail('업종 모두 보기 고리', JSON.stringify(g.all));
      if (g.old) fail('첫 화면 옛 테마 칸', '테마 시계 · 네 칸 · 그림 단추가 남음 — 2026-10-28 새 첫 화면(order-1112)에서 뺌');
    }
    await look('#/', p); bump('첫 화면'); await ctx.close();
  }
  /* ③ 「다음」 차례 — 인사부터 열여덟 번 */
  const ib = '#/t/i/' + enc(TOP), cb = LEAD ? '#/t/c/' + LEAD.c : null;
  const CHAIN = ['#/t/hello', '#/', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', ib, ib + '/path', ib + '/spread', ib + '/big', ib + '/co', ib + '/near',
    ...(cb ? [cb, cb + '/lead', cb + '/why', cb + '/rank', cb + '/unknown', cb + '/keep', '#/w/' + LEAD.c + '/past'] : ['#/'])]; // 회사 다음 = 4단 지나온 길(일곱 단 · 2026-10-20 12:59) — 7단 다음이 #/why/<번호>(아래 ⑬)
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
      await p.evaluate(h => { const a = [...document.querySelectorAll('#view a.th-next')].at(-1); if (a) a.click(); else location.hash = h; }, want); // 새 첫 화면(2026-10-28 order-1112)에는 「다음」 단추가 없어 첫 화면 칸은 주소로 넘어감
      await p.waitForFunction(w => location.hash === w || decodeURIComponent(location.hash) === decodeURIComponent(w), want, {timeout: 8000}).catch(() => {});
      await settle(p);
      const at = await p.evaluate(() => location.hash);
      if (decodeURIComponent(at) !== decodeURIComponent(want)) { fail('다음 눌러 감', CHAIN[k] + ' → ' + at + ' (바람 ' + want + ')'); break; }
      bump('다음 차례');
    }
    await ctx.close();
  }
  /* 있는 쪽 맨 아래 「다음」 한 줄 · 오늘 정리 */
  for (const [from, to] of [['#/sub', '#/t/alert'], ['#/t/alert', '#/why'], ['#/why', '#/why/later'], ['#/why/later', '#/me'], ['#/me', '#/game'], ['#/game', '#/jinhwa'], ['#/jinhwa', '#/t/today'], ['#/t/today', '#/']]) {
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
      // 2026-10-22 총정리(감사 A20): 회사 13쪽 머리 = 말풍선 물음(먼저였나 뒤따랐나)의 답(14쪽과 같은 셈) · 열흘 값과 업종 안 자리는 그 아래 작은 글
      const r = await open(cb);
      const t = await r.p.evaluate(() => ({ans: document.querySelector('#view .th-ans')?.textContent ?? '', subs: [...document.querySelectorAll('#view .th-sub')].map(x => x.textContent)}));
      const indL = Object.entries(TM.inds).find(([, o]) => (o.top ?? []).some(x => x.c === LEAD.c))?.[0], IL = ind.get(indL), ML = TM.inds[indL];
      const ld = LEAD.a5 != null && IL ? (LEAD.a5 - IL.A5) > (LEAD.b5 - IL.B5) : null;
      const ansW = ld == null ? '? 아직 못 견줬어요' : ld ? '업종보다 먼저 움직였어요' : '업종을 뒤따라 움직였어요';
      const subW = '열흘 동안 ' + pp(LEAD.d10) + '% · ' + (LEAD.rank ? `${num(ML.ranked)}곳 가운데 ${num(LEAD.rank)}번째` : '업종에서 몸값이 큰 회사예요');
      if (t.ans !== ansW) fail('회사 머리 = 먼저 · 뒤따름 답', t.ans + ' ≠ ' + ansW);
      if (!t.subs.includes(subW)) fail('회사 열흘', JSON.stringify(t.subs) + ' 에 「' + subW + '」 없음');
      await r.ctx.close();
      // 15쪽 「왜 그럴까?」 = 열한 걸음 이어 말하기(사장님 2026-10-22 08:53 「… 원숭이 엉덩이는 빨개 … 11단계는 논리적으로 사방팔방으로 … 움직이는 도식화로」 · why-chain.js · why-co.js)
      //   section.wc 하나 · 걸음(li.wc-n) 열하나 · 별자리 번호 열하나 · 첫 걸음 = 이 회사 열흘 값 · 둘째부터 물음(「?」로 끝) · 끝 걸음 = 이 회사 「왜 사?」 고리 · 걸음 고리는 사이트 안 · 누를 수 있음(테마 쪽에서 .play 가 누름을 막지 않음)
      const w = await open(cb + '/why');
      await w.p.waitForFunction(() => document.querySelectorAll('#view section.wc li.wc-n').length > 0, null, {timeout: 8000}).catch(() => {});
      const wc = await w.p.evaluate(() => { const s = document.querySelector('#view section.wc'); return {n: document.querySelectorAll('#view section.wc').length, steps: [...(s?.querySelectorAll('li.wc-n') ?? [])].map(li => ({q: li.querySelector('.wc-q')?.textContent ?? null, a: li.querySelector('.wc-a')?.textContent ?? '', href: li.querySelector('a.wc-card')?.getAttribute('href') ?? null})), dots: s?.querySelectorAll('svg.wc-sky .wc-dot').length ?? 0, pe: s ? getComputedStyle(s).pointerEvents : null, pos: s ? getComputedStyle(s).position : null}; });
      if (wc.n !== 1 || wc.steps.length !== 11 || wc.dots !== 11) fail('15쪽 열한 걸음', `칸 ${wc.n} · 걸음 ${wc.steps.length} · 별자리 ${wc.dots}`);
      else {
        if (!wc.steps[0].a.includes(pp(LEAD.d10) + '%') || wc.steps[0].q) fail('15쪽 첫 걸음 = 회사 열흘', JSON.stringify(wc.steps[0]));
        const badQ = wc.steps.slice(1).filter(s => !/\?$/.test(s.q ?? '')); if (badQ.length) fail('15쪽 이어 묻는 말', JSON.stringify(badQ.slice(0, 2)));
        if (wc.steps.some(s => !s.a.trim())) fail('15쪽 빈 걸음', JSON.stringify(wc.steps.map(s => s.a)));
        if (wc.steps.at(-1).href !== '#/why/' + LEAD.c) fail('15쪽 끝 걸음 = 왜 사?', String(wc.steps.at(-1).href));
        const out = wc.steps.filter(s => s.href && !/^#\//.test(s.href)); if (out.length) fail('15쪽 걸음 고리', JSON.stringify(out));
        if (/1등|오를 거|내릴 거|될 거예요|사세요|파세요/.test(wc.steps.map(s => (s.q ?? '') + s.a).join(' '))) fail('15쪽 앞날 · 권함 말', JSON.stringify(wc.steps.map(s => s.a)));
      }
      if (wc.pe === 'none' || wc.pos === 'absolute') fail('15쪽 걸음 칸 누름 막힘', `pointer-events ${wc.pe} · position ${wc.pos} — app.css .play 와 이름 부딪힘`);
      await look(cb + '/why (열한 걸음)', w.p); await w.ctx.close();
    }
    bump('숫자');
  }
  /* ⑤ 두 폭 — 남은 쪽들 */
  for (const w of [360, 320]) for (const hsh of ['#/', '#/t/alert', '#/t/how', '#/t/sprout', '#/t/pick', ib, ib + '/co', ib + '/near', ...(cb ? [cb + '/lead', cb + '/why', cb + '/rank'] : []), '#/t/today']) { // #/t/pick = 꽃 핀 업종 안의 싹 회사(2026-10-22 16:56 · 17:59 근거 칸) — 처음 판은 이 목록 밖이라 업종 고리 25px 를 못 잡았음
    const {p, ctx} = await open(hsh, {w, h: 640}); await look(hsh + ' @' + w, p); bump('폭'); await ctx.close();
  }
  /* ⑦ 자료를 바꾼 다섯 판 — 한국어 · 영어(320) */
  if (HM) for (const V of ['A', 'B', 'C', 'D', 'E']) {
    const v = variant(V), ib2 = '#/t/i/' + enc(v.X), cb2 = v.lead ? '#/t/c/' + v.lead : null;
    const hs = ['#/', '#/t/hello', '#/t/how', '#/t/sprout', '#/t/sprout/real', '#/t/sprout/new', '#/t/bloom', '#/t/wilt', '#/t/today', '#/t/alert', ib2, ...['path', 'spread', 'big', 'co', 'near'].map(s => ib2 + '/' + s), ...(cb2 ? [cb2, ...['lead', 'why', 'rank', 'unknown', 'keep'].map(s => cb2 + '/' + s)] : [])];
    const routes = [['**/next/data/theme.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.th)})], ['**/next/data/theme-more.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.mo)})], ['**/next/data/theme-home.json*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(v.hm)})]];
    for (const en of [false, true]) {
      const {p, ctx} = await open((en ? '?lang=en' : '') + hs[0], {w: 320, h: 640, routes});
      for (const hsh of hs) {
        if (hsh !== hs[0]) { await p.evaluate(x => { location.hash = x; }, hsh); await settle(p); }
        if (!en) {
          await look(V + ' ' + hsh + ' @320', p); bump('바꾼 자료 쪽'); if (V === 'A' && hsh !== '#/') await rules(V + ' ' + hsh + ' @320', p);
          if (hsh === '#/') { const nb = await p.evaluate(() => { const s = document.querySelector('#view section.nh-map svg.nh-plot'); if (!s) return null; const vb = s.viewBox.baseVal; return [...s.querySelectorAll('circle.nh-dot')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy'), +c.getAttribute('r')]).filter(([x, y, r]) => x - r < 0 || y - r < 0 || x + r > vb.width || y + r > vb.height); }); if (nb == null) fail('첫 화면 업종 점 그림', V + ' svg.nh-plot 없음'); else if (nb.length) fail('첫 화면 업종 점이 그림 밖', V + ' ' + JSON.stringify(nb)); } // 2026-10-28 새 첫 화면 — 자료가 바뀌어도 점이 그림 안(옛: 시계 번호 · 2026-10-19 실제 사이트 첫 화면 ① 이 잘림)
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
      await p.waitForFunction(() => document.querySelector('#view section.nh-map, #view section.th-home'), null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(400); // 2026-10-28 새 첫 화면 — 소식 칸은 늦게 붙을 수 있음(모듈을 받은 뒤)
      const n = await p.evaluate(() => { const b = document.querySelector('#view section.th-news'); return b ? {links: [...b.querySelectorAll('a.th-nl')].map(a => [a.getAttribute('href'), a.textContent]), set: b.querySelector('a.th-hi')?.getAttribute('href')} : null; });
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
      await ctx.addInitScript(([sd, f, bl]) => { try { for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, JSON.stringify(v)); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 없음 */ } if (bl) { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (/^(dori:|atlas:new:)/.test(String(k))) throw new DOMException('막힘', 'QuotaExceededError'); return o.call(this, k, v); }; } }, [seed, font, block]);
      const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(String(e.message).slice(0, 160)));
      await p.goto(PAGE + (en ? '?lang=en' : '') + hash, {waitUntil: 'domcontentloaded'}); await settle(p);
      if (en) { await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 8000}).catch(() => {}); await p.waitForTimeout(150); }
      return {p, ctx};
    }
    const lastToast = p => p.evaluate(() => [...document.querySelectorAll('p.toast')].pop()?.textContent ?? '');
    const homeNews = async p => { await p.waitForFunction(() => document.querySelector('#view section.nh-map, #view section.th-home'), null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(400); return p.evaluate(() => ({nl: [...document.querySelectorAll('#view section.th-news a.th-nl')].map(a => a.textContent), nm: document.querySelector('#view section.th-news .th-nm')?.textContent ?? null})); }; // 2026-10-28 새 첫 화면 — 소식 칸(section.th-news)은 첫 화면 어디에 있든 셈
    // (가0) 싹 자리 전부(돌 시계 판 ② · 2026-10-26 「다 해」) — 맨 앞 셋 큰 판 + 업종 알약 · 차례 = order.S · 큰 판 높이 같음 · 이름 안 넘침 · 「그 밖」을 누르면 모두 · 알약 44 위
    for (const [w, en, font] of [[390, false, 0], [360, false, 0], [320, false, 1], [320, true, 0], [320, true, 2]]) {
      const {p, ctx} = await openSeed('#/t/sprout', {}, {w, h: 800, en, font});
      await p.evaluate(() => document.querySelector('#view .th-chipmore')?.click());
      const t = await p.evaluate(() => ({tiles: [...document.querySelectorAll('#view .th-tiles a.th-tile')].map(a => { const b = a.getBoundingClientRect(), n = a.querySelector('.th-tn'); return {h: Math.round(b.height), href: a.getAttribute('href'), over: !n || n.scrollWidth > n.clientWidth + 1 || b.right > innerWidth + 1}; }),
        chips: [...document.querySelectorAll('#view .th-chips a.th-chip')].map(a => ({h: Math.round(a.getBoundingClientRect().height), href: a.getAttribute('href'), hidden: a.hidden || !a.getClientRects().length}))}));
      const tag = `싹 큰 판 @${w}${en ? ' 영어' : ''}${font ? ' 글씨' + font : ''}`, names = [...t.tiles, ...t.chips].map(x => decodeURIComponent(String(x.href ?? '').replace('#/t/i/', '')));
      if (JSON.stringify(names) !== JSON.stringify(TH.order.S)) fail('큰 판 · 알약 차례 = 싹 자리 차례', `${tag} ${names.length} ≠ ${TH.order.S.length} 「${names.slice(0, 4).join(' · ')}」`);
      if (t.tiles.length !== Math.min(3, TH.order.S.length)) fail('맨 앞 셋 큰 판 수', `${tag} ${t.tiles.length}`);
      const ths = t.tiles.map(x => x.h);
      if (ths.length && Math.max(...ths) - Math.min(...ths) > 2) fail('큰 판 높이 다름', tag + ' ' + [...new Set(ths)].join('/'));
      if (t.tiles.some(x => x.over)) fail('큰 판 이름이 넘침', tag);
      if (t.chips.some(x => x.hidden)) fail('「그 밖」을 눌러도 숨은 알약', tag);
      if (t.chips.some(x => x.h < 44)) fail('알약 높이 44 아래', tag + ' ' + Math.min(...t.chips.map(x => x.h)));
      if (p._errs.length) fail('화면 오류', tag + ' ' + p._errs[0]);
      bump('싹 큰 판 · 알약'); await ctx.close();
    }
    // (가) 싹 줄 — 폭 · 글꼴 · 말이 바뀌어도 줄 높이 같음 · 며칠째 알약 테 왼쪽 = 꽃까지 = 이름 글 시작 · 막대 길이 하나 — 줄은 거른 목록(새로 들어온 싹 · 진짜 싹)에 그대로(싹 자리 전부는 위 큰 판 · 알약)
    const rowRoute = TH.count.fresh > 0 ? '#/t/sprout/new' : TH.count.real > 0 ? '#/t/sprout/real' : null;
    if (!rowRoute) bump('싹 줄 모양 — 거른 목록이 비어 잴 줄 없음');
    else for (const [w, en, font] of [[390, false, 0], [360, false, 0], [320, false, 1], [320, true, 0], [320, true, 2]]) {
      const {p, ctx} = await openSeed(rowRoute, {}, {w, h: 800, en, font});
      await p.evaluate(() => document.querySelectorAll('#view details').forEach(d => { d.open = true; })); // 2026-10-22 총정리(감사 A13): 「점 없음」 묶음은 접혀 있음 — 펼쳐서 모든 줄을 그대로 잼(잣대 그대로)
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
  /* ⑪ 첫 화면 누르는 곳 — 2026-10-28 새 첫 화면(사장님 11:12 「어」 · order-1112): 옛 테마 칸 업종 줄 셋 · 싹 자리 모두 보기 · 한 해 줄 그림 단추는 빠짐(옛 잣대 2026-10-20 07:05 · 2026-10-21 18:22)
     → 새 첫 화면 고리 넷: 업종 모두 보기(#/f/ind) · 날짜별 기록과 고르는 법(#/t/pick) · 오늘 조건에 맞은 회사(#/t/picks) · 「왜 사?」 시작하기(#/why) — 누르는 자리 48 넘게 · 390 한국어는 눌러서 그 쪽으로 감 */
  for (const [w, en] of [[390, false], [320, false], [320, true]]) {
    const {p, ctx} = await open((en ? '?lang=en' : '') + '#/', {w, h: 844});
    if (en) { await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 8000}).catch(() => {}); await p.waitForTimeout(200); }
    await p.waitForFunction(() => !!document.querySelector('#view section.nh-why a.nh-go') && !!document.querySelector('#view section.nh-map a.nh-link'), null, {timeout: 20000}).catch(() => {});
    const tag = `첫 화면 누르는 곳 @${w}${en ? ' 영어' : ''}`;
    const SEL = ['#view section.nh-map a.nh-link', '#view section.nh-rec a.nh-link', '#view section.nh-why a.nh-go'], WANT = ['#/f/ind', '#/t/pick', '#/t/picks', '#/why'];
    const r = await p.evaluate(sel => sel.flatMap(q => [...document.querySelectorAll(q)].map(a => { const b = a.getBoundingClientRect(); return {href: a.getAttribute('href'), w: Math.round(b.width), h: Math.round(b.height)}; })), SEL);
    if (JSON.stringify(r.map(x => x.href)) !== JSON.stringify(WANT)) fail('새 첫 화면 고리 넷', tag + ' ' + JSON.stringify(r.map(x => x.href)) + ' ≠ ' + JSON.stringify(WANT));
    const small = r.filter(x => x.w < 48 || x.h < 48); if (small.length) fail('새 첫 화면 고리 누르는 자리 48px 아래', tag + ' ' + JSON.stringify(small));
    if (!en && w === 390) for (const [k, want] of WANT.entries()) {
      const loc = k === 0 ? p.locator(SEL[0]).first() : k === 3 ? p.locator(SEL[2]).first() : p.locator(SEL[1]).nth(k - 1);
      if (!(await loc.count())) { fail('새 첫 화면 고리 없음', `${tag} ${want}`); continue; }
      await loc.click(); await settle(p);
      const hh = await p.evaluate(() => location.hash);
      if (decodeURIComponent(hh) !== want) fail('새 첫 화면 고리 누르면 그 쪽', `${tag} ${hh} ≠ ${want}`);
      await p.evaluate(() => { location.hash = '#/'; }); await settle(p);
      await p.waitForFunction(() => !!document.querySelector('#view section.nh-why a.nh-go'), null, {timeout: 20000}).catch(() => {});
    }
    if (w === 390 && !en) await look(tag + ' 첫 화면', p);
    if (p._errs.length) fail('화면 오류', tag + ' ' + p._errs[0]);
    bump('첫 화면 누르는 곳'); await ctx.close();
  }
  /* ⑫ 거른 목록(사장님 2026-10-20 09:46 「주황색 클릭 해봤는데 않돼」 · 옛 첫 화면 주황 숫자 칸 셋 — 진짜 싹 · 새로 들어옴 · 싹 자리)
     2026-10-28 새 첫 화면(order-1112)에는 주황 숫자 칸이 없어 목록 쪽을 주소로 바로 엶 — 목록 업종 = 자료 거르기(진짜 = 점 넷 · 새로 = d 1) · 빈 목록 글 · 머리 · 없는 거르기는 「?」
     (네 자리 수는 ② 가 첫 화면 업종 칸 네 줄과 자료 count 를 맞댐) */
  /* 실제 사이트는 매시 새 자료로 올라감 — 검사가 처음 받은 자료와 화면이 받은 자료가 다른 때일 수 있음
     (2026-10-20 seven 9/11 theme 「새로 들어옴 화면 5곳 · 검사 자료 4곳 · 싹 자리 38 · 37」 — 화면 숫자와 목록은 서로 같았음)
     → 셀 때마다 자료를 새로 받고, 걸리면 자료를 다시 받아 화면을 새로 열어 한 번 더 셈 · 그 결과만 남김 · 진짜 다름은 두 번째에도 걸림 */
  if (HM) {
    const REMOTE = isRemote(base);
    for (const w of [390, 320]) for (let again = 0; ; again++) {
      const [TH, HM] = await Promise.all([getJ('/next/data/theme.json'), getJ('/next/data/theme-home.json')]);
      if (!TH || !HM) { fail('거른 목록 자료', `@${w} 다시 못 받음`); break; }
      const ind = new Map(TH.inds.map(i => [i.n, i]));
      const wantReal = TH.order.S.filter(n => ind.get(n)?.sc === 4), wantNew = TH.order.S.filter(n => ind.get(n)?.d === 1);
      sink = REMOTE && again === 0 ? [] : null;
      try {
        const tag = `거른 목록 @${w}`;
        for (const want of ['#/t/sprout/real', '#/t/sprout/new', '#/t/sprout']) {
          const {p, ctx} = await open(want, {w, h: 844});
          await p.waitForFunction(() => !!document.querySelector('#view .th-ans, #view .empty'), null, {timeout: 20000}).catch(() => {});
          const L = await p.evaluate(() => ({h2: document.querySelector('#view .th-ans')?.textContent ?? '', rows: [...document.querySelectorAll('#view .th-rows a.th-row, #view .th-tiles a.th-tile, #view .th-chips a.th-chip')].map(a => decodeURIComponent(a.getAttribute('href').replace('#/t/i/', ''))), empty: document.querySelector('#view .empty')?.textContent ?? ''}));
          const wantRows = want === '#/t/sprout/real' ? wantReal : want === '#/t/sprout/new' ? wantNew : TH.order.S;
          if (JSON.stringify(L.rows) !== JSON.stringify(wantRows)) fail('거른 목록 업종', `${tag} ${want} ${L.rows.length} ≠ ${wantRows.length} 「${L.rows.slice(0, 3).join(' · ')}」`);
          if (!wantRows.length && !L.empty) fail('거른 목록 빈 글', `${tag} ${want}`);
          if (want !== '#/t/sprout' && !L.h2.startsWith(want.endsWith('real') ? '진짜 싹 ' : '새로 들어온 싹 ')) fail('거른 목록 머리', `${tag} ${want} 「${L.h2}」`);
          await look(tag + ' ' + want, p); if (want !== '#/t/sprout') await rules(tag + ' ' + want, p);
          if (p._errs.length) fail('화면 오류', tag + ' ' + want + ' ' + p._errs[0]);
          await ctx.close();
        }
        bump('거른 목록');
      } catch (e) { const g = sink; sink = null; for (const [k, x] of g ?? []) fail(k, x); throw e; }
      const got = sink; sink = null;
      if (!got || !got.length) break;
      bump('자료가 바뀌어 다시 셈'); console.log(`자료가 바뀌어 다시 셈 — 거른 목록 @${w} ${got.length}건 · 첫 줄 ${got[0][0]} ${String(got[0][1]).slice(0, 160)}`); // 숨기지 않고 남김
    }
    const b = await open('#/t/sprout/zzz');
    const t = await b.p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '');
    if (!/^\?/.test(t)) fail('없는 거르기 주소', t.slice(0, 40));
    await b.ctx.close();
  }
  /* ⑥ 자료를 못 받으면 「?」 */
  {
    const no = [['**/next/data/theme*.json*', r => r.fulfill({status: 404, body: 'x'})]];
    const a = await open('#/', {routes: no});
    await a.p.waitForFunction(() => !!document.querySelector('#view section.nh-map'), null, {timeout: 20000}).catch(() => {});
    const t = await a.p.evaluate(() => document.querySelector('#view section.nh-map .nh-p')?.textContent ?? '');
    if (!/^\? 업종 자료를/.test(t.trim())) fail('자료 없을 때 첫 화면', '업종 칸 「? 업종 자료를 …」 줄이 아님 — ' + t.slice(0, 60)); // 2026-10-28 새 첫 화면(옛 테마 칸 「? 테마 시계 자료를 받지 못했어요」)
    if (a.p._errs.length) fail('자료 없을 때 화면 오류', a.p._errs[0]);
    await a.ctx.close();
    const b = await open('#/t/how', {routes: no});
    const u = await b.p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '');
    if (!/^\? 테마 시계 자료를 받지 못했어요/.test(u)) fail('자료 없을 때 쪽', u.slice(0, 60));
    await b.ctx.close();
    bump('자료 없음');
  }
  /* ⑬ 일곱 단(사장님 2026-10-20 12:59 「지금 3단 클릭 구조로 되어있는걸 7단 클릭구조로 만들어 더 깊이 클릭만으로 알수 있게 토스증권처럼」 · 13:04 「어」)
     테마 업종 쪽 = 일곱 칸 줄(2단 금빛 · 3단부터 앞선 회사) · 테마 회사 쪽 = 「더 깊이 보기」 일곱 칸(3단 금빛) · 4단을 누르면 지나온 길 · 그 줄의 1 · 2 · 3 은 테마 쪽
     「다음 단」으로 5 → 6 → 7 · 7단 다음 = 「사기 전에」(#/why/<번호>) · 테마를 거치지 않고 연 7단은 처음 줄 그대로(1 큰 업종 · 「회사로 돌아가기」) · 손가락 자리 44px(⑤) */
  if (LEAD) {
    const enc2 = s2 => encodeURIComponent(s2), c = LEAD.c;
    const WANT = [['1', '테마 시계', '#/'], ['2', '업종', '#/t/i/' + enc2(TOP)], ['3', LEAD.n, '#/t/c/' + c], ['4', '지나온 길', '#/w/' + c + '/past'], ['5', '누구와 다투나', '#/w/' + c + '/rivals'], ['6', '앞으로 클까?', '#/w/' + c + '/grow'], ['7', '범위', '#/w/' + c + '/range']];
    const cellsOf = q => q.evaluate(() => [...document.querySelectorAll('#view .chaps .cp')].map(a => ({k: a.querySelector('i')?.textContent ?? '', t: a.querySelector('span')?.textContent ?? '', href: a.getAttribute('href'), now: a.classList.contains('now'), cur: a.getAttribute('aria-current'), row: !!a.closest('.chaps.row'), h: Math.round(a.getBoundingClientRect().height)})));
    const same = (where, got, now, {row}) => {
      if (got.length !== 7) { fail('일곱 단 칸 수', `${where} ${got.length}`); return; }
      got.forEach((g, j) => {
        const [k, t, href] = WANT[j];
        if (g.k !== k || g.t !== t) fail('일곱 단 이름', `${where} ${j + 1}번째 「${g.k} ${g.t}」 ≠ 「${k} ${t}」`);
        if (decodeURIComponent(g.href ?? '') !== decodeURIComponent(href)) fail('일곱 단 고리', `${where} ${k}단 ${g.href} ≠ ${href}`);
        if ((g.now || g.cur === 'page') !== (k === now)) fail('일곱 단 지금 단', `${where} ${k}단 now=${g.now} cur=${g.cur}`);
        if (g.h < 48) fail('일곱 단 칸 높이 48', `${where} ${k}단 ${g.h}px`);
        if (g.row !== row) fail('일곱 단 꼴', `${where} ${row ? '한 줄' : '일곱 칸'}이어야 함`);
      });
    };
    const {p, ctx} = await open('#/t/i/' + enc2(TOP));
    same('업종 쪽', await cellsOf(p), '2', {row: true}); await look('⑬ 업종 쪽', p);
    await p.click('#view .chaps a.cp >> nth=2'); await p.waitForFunction(w => decodeURIComponent(location.hash) === w, '#/t/c/' + c, {timeout: 8000}).catch(() => fail('일곱 단 3단 누름', p.url())); await settle(p);
    same('회사 쪽', await cellsOf(p), '3', {row: false});
    const deepHead = await p.evaluate(() => [...document.querySelectorAll('#view h2.th-h2')].map(x => x.textContent));
    if (!deepHead.includes('더 깊이 보기')) fail('회사 쪽 「더 깊이 보기」', JSON.stringify(deepHead)); await look('⑬ 회사 쪽', p);
    await p.click('#view .chaps a.cp >> nth=3'); await p.waitForFunction(w => location.hash === w, '#/w/' + c + '/past', {timeout: 8000}).catch(() => fail('일곱 단 4단 누름', p.url())); await settle(p);
    await p.waitForFunction(() => !!document.querySelector('#view .chaps .cp.now'), null, {timeout: 15000}).catch(() => {});
    const g4 = await cellsOf(p);
    for (let j = 0; j < 3; j++) if (decodeURIComponent(g4[j]?.href ?? '') !== decodeURIComponent(WANT[j][2]) || g4[j]?.t !== WANT[j][1]) fail('4단 줄 앞 셋 = 테마 쪽', `${j + 1} 「${g4[j]?.t}」 ${g4[j]?.href}`);
    if (!g4.find(g => g.k === '4')?.now) fail('4단 지금 단', JSON.stringify(g4.map(g => g.k + (g.now ? '*' : ''))));
    for (const [k, sub] of [['5', 'rivals'], ['6', 'grow'], ['7', 'range']]) {
      const nx = await p.evaluate(() => [...document.querySelectorAll('#view a.chap-next')].at(-1)?.getAttribute('href') ?? null);
      if (nx !== '#/w/' + c + '/' + sub) { fail('다음 단', `${k}단 앞 「다음 단」 ${nx} ≠ #/w/${c}/${sub}`); break; }
      await p.evaluate(() => [...document.querySelectorAll('#view a.chap-next')].at(-1).click());
      await p.waitForFunction(w => location.hash === w, '#/w/' + c + '/' + sub, {timeout: 8000}).catch(() => fail('다음 단 눌러 감', k + '단'));
      await settle(p); await p.waitForFunction(() => !!document.querySelector('#view a.chap-next'), null, {timeout: 15000}).catch(() => {});
      bump('일곱 단 걸음');
    }
    const end7 = await p.evaluate(() => { const a = [...document.querySelectorAll('#view a.chap-next')].at(-1); return a ? [a.textContent, a.getAttribute('href')] : null; });
    if (!end7 || end7[1] !== '#/why/' + c || !end7[0].includes('사기 전에')) fail('7단 다음 = 사기 전에', JSON.stringify(end7));
    await ctx.close();
    const d = await open('#/w/' + c + '/range'); await d.p.waitForFunction(() => !!document.querySelector('#view .chaps .cp'), null, {timeout: 15000}).catch(() => {});
    const gd = await cellsOf(d.p), nd = await d.p.evaluate(() => [...document.querySelectorAll('#view a.chap-next')].at(-1)?.textContent ?? null);
    if (gd[0]?.href === '#/' || gd[2]?.href === '#/t/c/' + c) fail('테마를 거치지 않은 7단 줄', `처음 줄이어야 함 — ${gd[0]?.href} · ${gd[2]?.href}`);
    if (nd !== '회사로 돌아가기 ›') fail('테마를 거치지 않은 7단 다음', String(nd));
    await d.ctx.close();
    bump('일곱 단');
  }
} finally { await browser.close(); }

const ok = !fails.length;
console.log((ok ? '통과' : '걸림 ' + fails.length) + ' · ' + Object.entries(counts).map(([k, v]) => k + ' ' + v).join(' · ') + ' · ' + Math.round((Date.now() - t0) / 1000) + '초');
if (OUT) await fs.writeFile(OUT, JSON.stringify({ok, at: new Date().toISOString(), base, counts, fails}, null, 1));
process.exit(ok ? 0 : 1);

// ① 돈 흐름 · 몰린 곳 까닭 열한 가지 검사(site/next/home-new.js upItem · boot-home.js · /next/data/flow-why.json)
//   사장님 2026-10-30(서울) 04:27 「왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼 … 잡스라면 어떻게 표현 할 것인지 … 돈 · 상황 · 정치 여러 가지 각도」 · 05:03 「응」
//   (docs/design/why11-2026-10-30/order-0427.txt · 결정표 decision.md · 셈 scripts/atlas11/next/build/flow_why.mjs · 따로 다시 세기 scripts/atlas11/verify/flow_why_verify.py)
//   쓰는 법: node scripts/atlas11/next/check_why11.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json] [--all]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 늘 모두 돎) · 자료는 시험 서버가 내보내는 파일(올릴 자료 그대로)
//   ① 자료 — 꼴 · 기준 날 = 첫 화면 막대(theme-home.json) · 몰린 곳 셋 = 화면 flowRows · 열한 가지 · 불빛 = 글 · 시장 날씨 늘 켜짐 · 결론 마디 한두 개(마디 18자 안)
//      · 머리(시장이 내린 달) 잣대 · 영어 글 한글 0 · 쓰지 않을 말 0 · 망치는 길 낱말 0 · 앞날 · 사고팔기 말 0
//   ② 첫 화면 390(한국어) — 머리 · 칸 이름 = 자료 · 몰린 곳 줄마다 누르는 칸(48 넘게) · 「왜?」 마디 = 자료 · 불빛 열하나 = 자료 · 무리 넷 · 「열한 가지 보기」
//      · 「권하지 않습니다」와 첫 몰린 곳 「왜?」가 첫 한 화면 안 · 펼치면 열한 가지(번호 · 이름 · 글 · 출처 = 자료) · 무리 머리 · 대표 회사 말 · 다시 누르면 접힘
//      · 펼친 칸 모두: 글 17px 넘게 · 글 대비 4.5(큰 글 3) · 가로 넘침 0 · 화면 오류 0
//   ③ 320 · 320 「아주 크게」 — 세 칸 모두 펼쳐 가로 넘침 0 · 글 17px 넘게 · 누르는 것 48 넘게
//   ④ 영어(?lang=en) — 결론 · 불빛 무리 · 펼친 글이 자료 영어 그대로 · 남은 한글 0(원문 lang="ko" 빼고)
//   ⑤ 시장이 내린 달(자료를 바꿔 넣음) — 머리 「시장이 n% 내릴 때 · 여기는 버텼어요」 · 칸 이름 「덜 내린 곳 · 더 내린 곳」(한국어 · 영어) · 높이 그대로
//   ⑥ 자료를 못 받음 · 날이 다름 — 줄마다 「왜? 아직 못 셌어요.」 · 불빛 모두 「?」 · 누르는 칸 없음 · 「열한 가지 보기」 숨김 · 높이 그대로(밀림 0) · 화면 오류 0
//   ⑦ 여는 동안 칸(boot-home.js · app.js 를 막아 그대로 둠) — 머리 · 「권하지 않습니다」 · 몰린 곳 줄 자리가 다 그린 칸과 같은 높이(1px 안)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {screenHits, RUIN, RUIN_OK} from '../../../site/next/words.js';
import {flowRows, FLOW_N, WHY_SCHEMA} from '../../../site/next/home-new.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'duri-check-why11-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const GROUP_KO = ['돈', '회사', '상황', '정치'], GROUP_EN = ['Money', 'Firms', 'Market', 'Politics'];
const DEF = {h1: ['요즘 돈은', '여기로 몰렸어요'], keys: ['돈이 몰린 곳', '돈이 빠진 곳']};
const FORE = /오를 것|내릴 것|오를 거|내릴 거|사세요|파세요|추천|매수하|매도하|예측|will rise|will fall|\bbuy now\b|\bsell now\b/i;
const getJ = async u => { const r = await fetch(base + u + '?v=' + Date.now()); if (!r.ok) throw Error(`${u} ${r.status}`); return r.json(); };

/* ── ① 자료 ── */
let W = null, TH = null;
try { [W, TH] = await Promise.all([getJ('/next/data/flow-why.json'), getJ('/next/data/theme-home.json')]); } catch (e) { check(false, '① 자료 받기(flow-why.json · theme-home.json)', e.message); }
const UP = TH ? flowRows(TH).up : [];
if (W && TH) {
  check(W.schema === WHY_SCHEMA, '① 꼴', W.schema);
  check(W.asOf === TH.asOf, '① 기준 날 = 첫 화면 막대 날', `${W.asOf} · ${TH.asOf}`);
  check(JSON.stringify((W.inds ?? []).map(u => u.n)) === JSON.stringify(UP.map(u => u.n)), '① 몰린 곳 = 첫 화면 flowRows 셋', `${(W.inds ?? []).map(u => u.n)} · ${UP.map(u => u.n)}`);
  const bad = [], ko = [], en = [];
  for (const u of W.inds ?? []) {
    if (!Array.isArray(u.items) || u.items.length !== 11 || u.items.some((x, j) => x?.k !== j + 1)) { bad.push(`${u.n} 열한 가지 꼴`); continue; }
    if (JSON.stringify(u.lights) !== JSON.stringify(u.items.map(x => x.s)) || u.items.some(x => !['on', 'off', 'q'].includes(x.s))) bad.push(`${u.n} 불빛 ≠ 글`);
    if (u.items[6].s !== 'on') bad.push(`${u.n} 시장 날씨가 꺼짐(몰린 곳은 늘 켜짐)`);
    if (u.items[7].s !== 'q' || u.items[8].s !== 'q') bad.push(`${u.n} 8 · 9 는 아직 「?」`);
    if (!Array.isArray(u.why?.ko) || !u.why.ko.length || u.why.ko.length > 2 || u.why.en?.length !== u.why.ko.length || u.why.ko.some(c => [...c].length > 18)) bad.push(`${u.n} 결론 마디 ${JSON.stringify(u.why)}`);
    for (const x of u.items) { if (!x.ko?.t || !x.en?.t) bad.push(`${u.n} ${x.k} 빈 글`); ko.push(x.ko?.t ?? '', x.ko?.sub ?? ''); en.push(x.en?.t ?? '', x.en?.sub ?? ''); }
    ko.push(...(u.why?.ko ?? [])); en.push(...(u.why?.en ?? []));
  }
  check(!bad.length, '① 열한 가지 · 불빛 · 결론', bad.slice(0, 5).join(' | '));
  const iv = (W.inds ?? []).map(u => u.i), m = W.market?.m, falling = m < 0 && iv.some(i => i < 0);
  if (falling) check(Array.isArray(W.head?.ko) && /^시장이 \d+(\.\d)?% 내릴 때$/.test(W.head.ko[0]) && W.head.ko[1] === '여기는 버텼어요' && W.head.keys?.ko?.join() === '덜 내린 곳,더 내린 곳', '① 머리(시장이 내린 달)', JSON.stringify(W.head));
  else check(W.head == null, '① 머리 없음(셋 다 오름 · 또는 시장이 오름)', JSON.stringify(W.head));
  if (W.head) { ko.push(...W.head.ko); en.push(...W.head.en); }
  ko.push(W.note?.ko ?? ''); en.push(W.note?.en ?? '');
  check(!en.some(s => HAN.test(s)), '① 영어 글 한글 0', en.find(s => HAN.test(s)));
  const K = ko.join('\n').replace(/「[^」]*」/g, '「」'), E = en.join('\n'); // 기사 제목(「…」)은 원문 그대로 옮긴 것 — 우리 글만 잼(제목은 판 자료가 이미 거른 것)
  check(!screenHits(K).length, '① 쓰지 않을 말 0', screenHits(K).join(' '));
  let k2 = K; for (const ok of RUIN_OK) k2 = k2.split(ok).join('');
  const ruin = []; for (const r of RUIN) { for (const w of r.ko) if (k2.includes(w)) ruin.push(r.key + ' 「' + w + '」'); for (const w of r.en) if (new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(E)) ruin.push(r.key + ' 「' + w + '」'); }
  check(!ruin.length, '① 망치는 길 낱말 0', ruin.join(' | '));
  check(!FORE.test(K + '\n' + E), '① 앞날 · 사고팔기 말 0', (K + E).match(FORE)?.[0]);
  R.m.data = {asOf: W.asOf, m, head: W.head?.ko ?? null, inds: (W.inds ?? []).map(u => ({n: u.n, x: u.x, i: u.i, why: u.why?.ko ?? null, lights: (u.lights ?? []).join(' ')}))}; // 깃허브 결과 파일에 남김(올리기 전 진짜 자료 결론을 봄)
}

/* ── 브라우저 ── */
const {chromium} = require('playwright');
const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctxOf = async (w, {h = 844, font = 0, en = false} = {}) => {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(([f]) => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [font]);
  return ctx;
};
const errsOf = p => { const e = []; p.on('pageerror', x => e.push(String(x.message).slice(0, 160))); return e; };
const URL_OF = (q = '') => `${base}/next/?v=${Date.now()}${q}#/`;
const ready = p => p.waitForFunction(() => !document.querySelector('#view .boot') && !!document.querySelector('#view section.nh-hero li.y11-i'), null, {timeout: 25000}).then(() => true, () => false);
const fileOf = body => r => r.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(body)});

/** 첫 화면 ① 칸 재기(화면 안에서 돎) — qtext = 불빛 속 글자 수(「?」는 선 그림이라 0 이어야) */
function heroInPage() {
  const v = document.querySelector('#view'), hero = v?.querySelector('section.nh-hero'); if (!hero) return null;
  const rc = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height)}; };
  const th = document.querySelector('#view .s-thumb'), tabs = document.querySelector('.tabs'), thR = th && th.getBoundingClientRect().height > 0 ? th.getBoundingClientRect().top : Infinity;
  const fold = Math.min(thR, tabs ? tabs.getBoundingClientRect().top : innerHeight);
  return {fold: Math.round(fold), h1: [...hero.querySelectorAll('.nh-h1 > span')].map(s => s.textContent.trim()), h1R: rc(hero.querySelector('.nh-h1')),
    keys: [...hero.querySelectorAll('.nh-fk > span')].map(s => s.textContent.trim()), no: hero.querySelector('.nh-no')?.textContent.trim(), noR: rc(hero.querySelector('.nh-no')),
    order: [...hero.children].map(e => e.className.split(' ')[0]), heroR: rc(hero), dnR: rc(hero.querySelector('.nh-fk-dn')),
    items: [...hero.querySelectorAll('ol.nh-fl-up > li')].map(li => {
      const sum = li.querySelector('details.y11-box > summary'), m = li.querySelector('.y11-m');
      return {cls: li.className, details: !!li.querySelector('details.y11-box'), name: li.querySelector('.nh-fn')?.textContent.trim() ?? null, r: rc(li), sum: rc(sum), lR: rc(li.querySelector('.y11-l')),
        q: li.querySelector('.y11-q')?.textContent.trim() ?? null, why: [...li.querySelectorAll('.y11-t > span')].map(s => s.textContent.trim()), whyH: [...li.querySelectorAll('.y11-t > span')].map(s => Math.round(s.getBoundingClientRect().height)),
        dots: [...li.querySelectorAll('.y11-lt circle:is(.y11-on, .y11-off, .y11-qd)')].map(c => c.getAttribute('class')), qtext: li.querySelectorAll('.y11-lt svg text').length, groups: [...li.querySelectorAll('.y11-g > i')].map(i => i.textContent.trim()),
        more: m ? m.textContent.replace(/\s+/g, ' ').trim() : null, moreVis: m ? getComputedStyle(m).visibility === 'visible' && m.getBoundingClientRect().height > 0 : false, label: li.querySelector('.y11-lt')?.getAttribute('aria-label') ?? null};
    })};
}
/** 펼친 칸 재기 — k 번째 몰린 곳 */
function openInPage(k) {
  const d = document.querySelectorAll('#view section.nh-hero ol.nh-fl-up > li')[k]?.querySelector('details.y11-box'); if (!d) return null;
  const tx = e => e?.textContent.replace(/\s+/g, ' ').trim() ?? null;
  // 불빛 뜻 = 그림 속 「?」를 뺀 뜻 글만
  return {open: d.open, key: [...d.querySelectorAll('.y11-key .y11-k > span')].map(tx).join(' '), gh: [...d.querySelectorAll('.y11-gh')].map(tx), note: tx(d.querySelector('.y11-note')),
    li: [...d.querySelectorAll('.y11-li')].map(li => ({s: li.dataset.s, dot: li.querySelector('circle')?.getAttribute('class'), nm: tx(li.querySelector('.y11-nm')), t: tx(li.querySelector('.y11-tt')), sub: tx(li.querySelector('.y11-sub'))}))};
}
/** 읽기 재기 — ① 칸(펼친 칸 포함) 글 크기 · 대비 · 넘침 · 누르는 크기 · 남은 한글(영어) */
function readInPage() {
  const v = document.querySelector('#view'), hero = v.querySelector('section.nh-hero'), z = parseFloat(getComputedStyle(v).zoom) || 1;
  const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let c = {r: 255, g: 255, b: 255, a: 1}; for (const x of st.reverse()) c = mix(x, c); return c; };
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; if (x.tagName === 'DETAILS' && !x.open && !(e.closest('summary') && e.closest('details') === x)) return false; } return true; };
  const out = {sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, tiny: [], low: [], small: [], han: [], over: []};
  for (const e of hero.querySelectorAll('summary, a[href], button')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${e.className} ${Math.round(r.width)}×${Math.round(r.height)}`); }
  const w = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement, t = n.nodeValue.trim(); if (!t || !el || el.closest('svg') || !el.closest('.y11-box, .nh-h1, .nh-fk, .nh-no') || !vis(el)) continue;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) * z, bold = +cs.fontWeight >= 600, big = fs >= 24 || (bold && fs >= 18.66);
    if (fs < 16.95) out.tiny.push(`${t.slice(0, 14)} ${fs}px`);
    const fg = rgb(cs.color), bg = bgOf(el); if (fg) { const c = ratio(mix(fg, bg), bg); if (c < (big ? 3 : 4.5)) out.low.push(`${el.className || el.tagName} ${c.toFixed(2)} 「${t.slice(0, 14)}」`); }
    if (HAN_RE.test(t) && !el.closest('[lang="ko"]')) out.han.push(t.slice(0, 30));
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && cs.display !== 'inline' && cs.textOverflow !== 'ellipsis') out.over.push(`${el.className || el.tagName} 「${t.slice(0, 14)}」 ${el.scrollWidth}>${el.clientWidth}`);
  }
  return out;
}
const HAN_SRC = HAN.source;
const READ = p => p.evaluate(`(() => { const HAN_RE = new RegExp(${JSON.stringify(HAN_SRC)}); return (${readInPage.toString()})(); })()`).catch(e => ({err: String(e.message)}));
const judgeRead = (tag, m, {en = false} = {}) => {
  if (m.err) return check(false, `${tag} 재기`, m.err);
  check(m.sw <= m.cw, `${tag} 가로 넘침 0`, `${m.sw}>${m.cw}`);
  check(!m.tiny.length, `${tag} 글 17px 넘게`, m.tiny.slice(0, 3).join(' | '));
  check(!m.low.length, `${tag} 글 대비 4.5(큰 글 3)`, m.low.slice(0, 3).join(' | '));
  check(!m.small.length, `${tag} 누르는 것 48 넘게`, m.small.slice(0, 3).join(' | '));
  check(!m.over.length, `${tag} 칸 안 넘친 글 0`, m.over.slice(0, 3).join(' | '));
  if (en) check(!m.han.length, `${tag} 남은 한글 0(원문 lang="ko" 빼고)`, m.han.slice(0, 3).join(' | '));
};
const openAll = async p => { for (const s of await p.locator('#view section.nh-hero details.y11-box > summary').all()) { await s.scrollIntoViewIfNeeded(); await s.click(); } await p.waitForTimeout(150); };
const near = (a, b) => a != null && b != null && Math.abs(a - b) <= 1;

try {
  const want = (W?.inds ?? []).map(u => u);
  // ② 첫 화면 390 · ④ 영어 390
  let heightsKo = null;
  for (const en of [false, true]) {
    const tag = en ? '④ 영어 390' : '② 390', ctx = await ctxOf(390, {en}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF(en ? '&lang=en' : '&lang=ko'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) { check(false, `${tag} 첫 화면`, '안 그려짐'); await ctx.close(); continue; }
    await p.waitForTimeout(300);
    const H = await p.evaluate(heroInPage);
    if (!en) { heightsKo = H.items.map(x => x.r?.h); R.m.hero390 = {fold: H.fold, no: H.noR, items: H.items.map(x => [x.name, x.r?.t, x.r?.h, x.lR?.b])}; }
    if (!en && OUT) await p.locator('#view section.nh-hero').screenshot({path: path.join(path.dirname(OUT), 'why11-hero.jpg'), type: 'jpeg', quality: 60}).catch(() => {}); // 결과 폴더에 한 장(깃허브 결과와 함께 main 에 남음 — 올리기 전 진짜 자료 화면을 봄)
    check(H.items.length === FLOW_N, `${tag} 몰린 곳 줄 ${FLOW_N}`, H.items.length);
    if (!en) {
      const head = W?.head ?? null;
      check(JSON.stringify(H.h1) === JSON.stringify(head ? head.ko : DEF.h1), `${tag} 머리 = 자료`, H.h1.join(' / '));
      check(JSON.stringify(H.keys) === JSON.stringify(head ? head.keys.ko : DEF.keys), `${tag} 칸 이름 = 자료`, H.keys.join(' / '));
      check(H.order.slice(0, 4).join() === 'nh-pm,nh-h1,nh-no,nh-fm', `${tag} 차례 = 번호 · 머리 · 권하지 않습니다 · 돈 흐름 판`, H.order.join());
      check(/사고팔기를 권하지 않습니다/.test(H.no ?? '') && H.noR && H.noR.b <= H.fold, `${tag} 「권하지 않습니다」 첫 한 화면 안`, `${H.noR?.b} > ${H.fold}`);
      check(H.items[0]?.lR && H.items[0].lR.b <= H.fold, `${tag} 첫 몰린 곳 「왜?」 첫 한 화면 안`, `${H.items[0]?.lR?.b} > ${H.fold}`);
    } else if (W?.head) check(JSON.stringify(H.h1) === JSON.stringify(W.head.en) && JSON.stringify(H.keys) === JSON.stringify(W.head.keys.en), `${tag} 머리 · 칸 이름 = 자료 영어`, H.h1.concat(H.keys).join(' / '));
    H.items.forEach((x, k) => {
      const u = want[k], t = `${tag} ${k + 1}번 ${x.name ?? '?'}`;
      if (!u) return check(false, `${t} 자료`, '자료에 없는 줄');
      check(x.details && x.sum && x.sum.h >= 47.5 && x.sum.w >= 47.5, `${t} 누르는 칸 하나(48 넘게)`, JSON.stringify(x.sum));
      check(x.q === (en ? 'Why?' : '왜?'), `${t} 「왜?」`, x.q);
      check(JSON.stringify(x.why) === JSON.stringify(en ? u.why.en : u.why.ko), `${t} 결론 마디 = 자료`, x.why.join(' / '));
      check(x.dots.length === 11 && x.dots.every((c, j) => c === 'y11-' + ({on: 'on', off: 'off', q: 'qd'})[u.lights[j]]), `${t} 불빛 열하나 = 자료`, x.dots.join(','));
      check(x.qtext === 0, `${t} 불빛 속 글자 0(「?」는 선 그림 — 17px 잣대 밖)`, x.qtext);
      if (!en) check(x.whyH.every(hh => hh <= 26), `${t} 결론 마디마다 한 줄(두 줄 자리 안 · 밀림 0)`, x.whyH.join(','));
      check(JSON.stringify(x.groups) === JSON.stringify(en ? GROUP_EN : GROUP_KO), `${t} 무리 넷`, x.groups.join(','));
      check(x.moreVis && String(x.more).replace(/\s+/g, '') === (en ? 'Seeall11›' : '열한가지보기›'), `${t} 「열한 가지 보기 ›」`, x.more);
      const n = s => u.lights.filter(v => v === s).length;
      check(x.label === (en ? `Of 11 reasons: ${n('on')} yes, ${n('off')} no, ${n('q')} unknown` : `까닭 열한 가지 가운데 맞음 ${n('on')} · 아님 ${n('off')} · 모름 ${n('q')}`), `${t} 불빛 읽는 글(aria-label)`, x.label);
    });
    // 펼치기 — 열한 가지 = 자료
    for (let k = 0; k < H.items.length && k < want.length; k++) {
      const u = want[k], t = `${tag} ${k + 1}번 펼침`, sum = p.locator('#view section.nh-hero ol.nh-fl-up > li').nth(k).locator('details.y11-box > summary');
      if (!await sum.count()) continue;
      await sum.scrollIntoViewIfNeeded(); await sum.click(); await p.waitForTimeout(120);
      const o = await p.evaluate(openInPage, k);
      check(o?.open, `${t} 열림`, JSON.stringify(o)?.slice(0, 80));
      if (!o?.open) continue;
      const L = en ? 'en' : 'ko', ks = (W.groups ?? []).flatMap(g => g.ks);
      check(o.li.length === 11 && JSON.stringify(ks) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), `${t} 열한 줄`, o.li.length);
      const bad = [];
      o.li.forEach((li, j) => { const it = u.items[j]; if (!it) return bad.push(`${j + 1} 자료 없음`);
        if (li.s !== it.s || li.dot !== 'y11-' + ({on: 'on', off: 'off', q: 'qd'})[it.s]) bad.push(`${j + 1} 불빛 ${li.s}/${li.dot} ≠ ${it.s}`);
        if (String(li.nm).replace(/\s+/g, '') !== `${it.k}${W.names?.[it.k]?.[L]}`.replace(/\s+/g, '')) bad.push(`${j + 1} 이름 「${li.nm}」`);
        if (li.t !== it[L].t) bad.push(`${j + 1} 글 「${li.t}」 ≠ 「${it[L].t}」`);
        if ((li.sub ?? null) !== (it[L].sub ?? null)) bad.push(`${j + 1} 출처 「${li.sub}」 ≠ 「${it[L].sub}」`); });
      check(!bad.length, `${t} 번호 · 이름 · 글 · 출처 = 자료`, bad.slice(0, 4).join(' | '));
      const ns = x => String(x ?? '').replace(/\s+/g, ''); // 칸 사이 띄움은 글이 아니라 모양(gap) — 띄어쓰기는 빼고 맞댐
      check(JSON.stringify(o.gh.map(ns)) === JSON.stringify((W.groups ?? []).map(g => ns(g[L] + (g.q?.[L] ?? '')))), `${t} 무리 머리 넷`, o.gh.join(' | '));
      check(o.note === W.note?.[L], `${t} 대표 회사 기록 말`, o.note);
      check(ns(o.key) === ns(en ? 'Yes by the record No Not known yet' : '기록으로 맞음 아님 아직 모름'), `${t} 불빛 뜻`, o.key);
    }
    judgeRead(`${tag} 세 칸 펼침`, await READ(p), {en});
    // 다시 누르면 접힘
    const s0 = p.locator('#view section.nh-hero details.y11-box > summary').first();
    if (await s0.count()) { await s0.scrollIntoViewIfNeeded(); await s0.click(); await p.waitForTimeout(100); check(await p.evaluate(() => !document.querySelector('#view section.nh-hero details.y11-box')?.open), `${tag} 다시 누르면 접힘`); }
    check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
  }
  // ③ 320 · 320 아주 크게 — 세 칸 펼침
  for (const font of [0, 2]) {
    const tag = `③ 320${font ? ' 아주 크게' : ''}`, ctx = await ctxOf(320, {h: 568, font}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('&lang=ko'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) { check(false, `${tag} 첫 화면`, '안 그려짐'); await ctx.close(); continue; }
    await openAll(p); judgeRead(tag, await READ(p));
    check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
  }
  // ⑤ 시장이 내린 달 · ⑥ 못 받음 · 날이 다름
  if (W && TH) {
    const fall = {...W, market: {m: -9.9}, head: {ko: ['시장이 10% 내릴 때', '여기는 버텼어요'], en: ['Market fell 10%,', 'these held up'], keys: {ko: ['덜 내린 곳', '더 내린 곳'], en: ['Fell less', 'Fell more']}}};
    for (const en of [false, true]) {
      const tag = `⑤ 시장이 내린 달${en ? ' 영어' : ''}`, ctx = await ctxOf(390, {en}), p = await ctx.newPage(), errs = errsOf(p);
      await p.route('**/next/data/flow-why.json*', fileOf(fall));
      await p.goto(URL_OF(en ? '&lang=en' : '&lang=ko'), {waitUntil: 'load', timeout: 60000});
      if (!await ready(p)) { check(false, `${tag} 첫 화면`, '안 그려짐'); await ctx.close(); continue; }
      const H = await p.evaluate(heroInPage), L = en ? 'en' : 'ko';
      check(JSON.stringify(H.h1) === JSON.stringify(fall.head[L]), `${tag} 머리`, H.h1.join(' / '));
      check(JSON.stringify(H.keys) === JSON.stringify(fall.head.keys[L]), `${tag} 칸 이름`, H.keys.join(' / '));
      if (!en) check(H.items.every((x, k) => near(x.r?.h, heightsKo?.[k])), `${tag} 줄 높이 그대로`, `${H.items.map(x => x.r?.h)} · ${heightsKo}`);
      if (!en) check(H.h1R?.h != null && H.noR && H.noR.b <= H.fold, `${tag} 「권하지 않습니다」 첫 한 화면 안`, `${H.noR?.b} > ${H.fold}`);
      check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
    }
    for (const [name, how] of [['못 받음', r => r.abort()], ['날이 다름', fileOf({...W, asOf: '2000-01-03'})], ['꼴이 다름', fileOf({...W, schema: 'dori-flow-why-0'})]]) {
      const tag = `⑥ 자료 ${name}`, ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
      await p.route('**/next/data/flow-why.json*', how);
      await p.goto(URL_OF('&lang=ko'), {waitUntil: 'load', timeout: 60000});
      if (!await ready(p)) { check(false, `${tag} 첫 화면`, '안 그려짐'); await ctx.close(); continue; }
      const H = await p.evaluate(heroInPage);
      check(H.items.length === FLOW_N && H.items.every(x => !x.details && x.q === '왜?' && JSON.stringify(x.why) === JSON.stringify(['아직 못 셌어요.']) && x.dots.length === 11 && x.dots.every(c => c === 'y11-qd') && !x.moreVis),
        `${tag} → 「왜? 아직 못 셌어요.」 · 불빛 모두 「?」 · 누르는 칸 없음`, JSON.stringify(H.items.map(x => [x.details, x.why, x.dots.filter(c => c !== 'y11-qd').length, x.moreVis])));
      check(JSON.stringify(H.h1) === JSON.stringify(DEF.h1) && JSON.stringify(H.keys) === JSON.stringify(DEF.keys), `${tag} → 머리 · 칸 이름은 그대로`, H.h1.concat(H.keys).join(' / '));
      check(H.items.every((x, k) => near(x.r?.h, heightsKo?.[k])), `${tag} → 줄 높이 그대로(밀림 0)`, `${H.items.map(x => x.r?.h)} · ${heightsKo}`);
      check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
    }
  }
  // ⑦ 여는 동안 칸 — app.js 를 막아 boot-home.js 칸이 남게 해서 잼
  {
    const tag = '⑦ 여는 동안 칸', ctx = await ctxOf(390), p = await ctx.newPage();
    await p.route('**/next/app.js*', r => r.abort());
    await p.goto(URL_OF('&lang=ko'), {waitUntil: 'load', timeout: 60000}); await p.waitForTimeout(600);
    const B = await p.evaluate(heroInPage);
    if (!B) check(false, tag, '여는 동안 칸이 없음');
    else {
      const fin = R.m.hero390;
      check(JSON.stringify(B.h1) === JSON.stringify(DEF.h1) && B.order.slice(0, 4).join() === 'nh-pm,nh-h1,nh-no,nh-fm', `${tag} 머리 · 차례`, B.h1.join(' / ') + ' · ' + B.order.join());
      check(B.items.length === FLOW_N && B.items.every(x => x.cls.includes('y11-i')), `${tag} 몰린 곳 자리 ${FLOW_N}`, B.items.map(x => x.cls).join(','));
      check(fin && near(B.noR?.t, fin.no?.t) && B.items.every((x, k) => near(x.r?.t, fin.items[k]?.[1]) && near(x.r?.h, fin.items[k]?.[2])), `${tag} 자리 = 다 그린 칸(1px 안 · 밀림 0)`, `${B.noR?.t}/${fin?.no?.t} · ${B.items.map(x => `${x.r?.t}+${x.r?.h}`)} · ${fin?.items.map(x => `${x[1]}+${x[2]}`)}`);
    }
    await ctx.close();
  }
} catch (e) { check(false, '검사 멈춤', e.stack || e.message); }
await browser.close();
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
console.log(`까닭 열한 가지 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
process.exit(R.counts.fail ? 1 : 0);

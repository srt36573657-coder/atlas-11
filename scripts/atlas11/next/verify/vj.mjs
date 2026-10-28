// 일꾼 VJ — 매매일지(#/why) 따로 재기 · 만든 사람이 아닌 사람이 사장님 말씀만 보고 잼(2026-10-18 · 일 나누기 brief5.md 길 20 · 물결 B)
//   잣대 = docs/design/godori-2026-10-18/order-0015.txt [5] 1 ~ 10 · [2] 7 · [9] 8 · [10] 1 · 5 · 질문 · 답 · 색 · 격언 = docs/design/godori-2026-10-17/brief.md(사장님 원문)
//   만든 쪽의 검사(check_why.mjs) · 모듈(p-why.js)의 셈은 쓰지 않음 — 화면에서 보이는 것 · 눌러서 되는 것 · 저장된 기록 · 자료 파일(days · co/<번호> · home · median20)만 봄
//   쓰는 법: node scripts/atlas11/next/verify/vj.mjs [--base http://127.0.0.1:8826] [--pw /opt/node-tools/] [--out 결과.json] [--only 1,3,7] [--no-en]
//   브라우저는 한 번에 하나 · 끝나면 닫음(2 CPU 공용 기계) · 실패가 하나라도 있으면 끝 코드 1
//   2026-10-28 사장님 10:11 「어 그렇게 해」(docs/design/why-mock-2026-10-28/order-1011.txt · brief.md) — 그림 그대로 판: 시작 화면 → 답 고르기 + 「다음으로 ›」 → 결과(종목 찾기 · 앞 답 한마디 칸 · 마지막 두 줄 없음)
//     이 따로 재기는 아무 일터도 부르지 않음 — 길(openWhy · pickStock · answer · finish)만 새 꼴로 걷게 고침 · [5] 3(답 한 번 = 다음) 같은 옛 잣대 줄은 그대로라 새 꼴에서는 걸릴 수 있음(잣대는 brief.md)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const BASE = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const NEXT = '/next/?dev=1';
const OUT = arg('--out', null);
const ONLY = arg('--only', null)?.split(',').map(Number) ?? null;
const NO_EN = argv.includes('--no-en');
const want = n => !ONLY || ONLY.includes(n);
const t0 = Date.now();
const log = (...a) => console.error(`[${Math.round((Date.now() - t0) / 1000)}s]`, ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ───────── 사장님 원문: 질문 열한 개 · 답 · 색 · 격언 ───────── */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8');
const TONE_OF = {'🟢': 'g', '🟡': 'y', '🔴': 'r'}, PTS = {g: 0, y: 1, r: 2};
const OWN = [];
for (const line of (BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0].split('\n')) {
  const m = /^(\d{1,2}) (.+?\?) (.+) -(.+)$/u.exec(line.trim()); if (!m) continue;
  OWN.push({n: +m[1], q: m[2], a: [...m[3].matchAll(/([🟢🟡🔴])([^🟢🟡🔴]+)/gu)].map(x => [TONE_OF[x[1]], x[2].trim()]), say: m[4].trim()});
}
if (OWN.length !== 11 || OWN.some((Q, i) => Q.n !== i + 1 || Q.a.length !== 3)) { console.error('사장님 원문(brief.md 질문 열한 개)을 못 읽음', OWN.length); process.exit(2); }
const VERDICT = {go: '좋아, 정해 둔 대로만', wait: '반만 준비됐어', rest: '오늘은 쉬어 가자'};
const REST_Q4 = OWN[3].a.findIndex(a => a[1] === '거의 다·빌린 돈'), REST_Q9 = OWN[8].a.findIndex(a => a[1] === '곧'), BIG_A = OWN[2].a.findIndex(a => a[1] === '클 일이 있다');
if (REST_Q4 < 0 || REST_Q9 < 0 || BIG_A < 0) { console.error('4번 · 9번 · 3번 답을 원문에서 못 찾음'); process.exit(2); }
/** 톤 글자열(11자 · g y r) → 답 자리 열한 개 · 그 톤이 없으면 다른 톤 가운데 가장 가까운 것 */
const pickIdx = tones => OWN.map((Q, i) => { const t = tones[i]; const k = Q.a.findIndex(a => a[0] === t); if (k >= 0) return k; const alt = ['g', 'y', 'r'].filter(x => x !== t).map(x => Q.a.findIndex(a => a[0] === x)).find(k2 => k2 >= 0); return alt ?? 0; });
/** 사장님 점수표(🟢0 🟡1 🔴2 · 묶음 · 판정 — brief.md 명령 5 · 6) + 쉬어 가는 답 */
const oracle = ans => {
  const pts = ans.map((k, i) => PTS[OWN[i].a[k][0]]), score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length;
  const stop = ans[3] === REST_Q4 || ans[8] === REST_Q9;
  const verdict = stop || score >= 12 || reds >= 4 ? 'rest' : score >= 6 ? 'wait' : 'go';
  const G = {이유: [1, 2, 3], 돈: [4, 9, 11], 때: [5, 6], 마음: [7, 8, 10]};
  const groups = Object.fromEntries(Object.entries(G).map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  return {score, ready: 22 - score, reds, verdict, stop, groups};
};

/* ───────── 결과 기록 ───────── */
const results = [];
const R = (n, name, ask) => { const r = {n, name, ask, measured: '', pass: true, fails: [], notes: []}; results.push(r); return r; };
const F = (r, msg) => { r.pass = false; if (r.fails.length < 40) r.fails.push(String(msg).slice(0, 400)); };
const N = (r, msg) => { if (r.notes.length < 40) r.notes.push(String(msg).slice(0, 400)); };

/* ───────── 화면 안에서 도는 함수들 ───────── */
/** 시작 때 한 번 — 누름(진짜 클릭) · 글쇠 · 누른 뒤 다음 질문이 뜨기까지 걸린 ms · 눌리는 것에 붙은 귀(비 단추) 목록 */
const INIT = () => {
  const V = (window.__vj = {clicks: 0, log: [], keys: 0, lat: [], step: null, t0: 0, pend: false});
  document.addEventListener('click', e => { if (!e.isTrusted) return; V.clicks++; V.log.push(String(e.target?.tagName || '') + '.' + String(e.target?.className?.baseVal ?? e.target?.className ?? '').slice(0, 24)); V.t0 = performance.now(); V.step = document.querySelector('.wy-q')?.textContent ?? null; V.pend = true; }, true);
  document.addEventListener('keydown', e => { if (e.isTrusted) V.keys++; }, true);
  try { new MutationObserver(() => { if (V.pend) { const s = document.querySelector('.wy-q')?.textContent ?? null; if (s !== V.step) { V.lat.push(Math.round(performance.now() - V.t0)); V.pend = false; } } }).observe(document, {subtree: true, childList: true, characterData: true}); } catch { /* 없음 */ }
  const L = (window.__vjL = new Set()), T = /^(click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress)$/, orig = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (t, f, o) { try { if (T.test(t) && this instanceof Element) L.add(this); } catch { /* 없음 */ } return orig.call(this, t, f, o); };
};

/** 지금 화면을 한 번 훑음 — 17px 아래 글 · 가장 큰 글 · 한글(영어 판) · 쓰지 않을 말 · 색 점 · 눌리는 것 · 뒤로 단추 */
const SCAN = o => {
  const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/, TONE_RE = /좋음|주의|위험|\bgood\b|\bcaution\b|\brisk\b/i, TONE_KO = {good: '좋음', caution: '주의', risk: '위험'};
  const cv = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
  const rgb = s => { const m = /^rgba?\(([^)]+)\)/.exec(s || ''); if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; } if (!s || s === 'transparent') return null; try { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return {r: d[0], g: d[1], b: d[2], a: d[3] / 255}; } catch { return null; } };
  const sat = c => { if (!c) return 0; const M = Math.max(c.r, c.g, c.b), m = Math.min(c.r, c.g, c.b); return M ? (M - m) / M : 0; };
  const val = c => (c ? Math.max(c.r, c.g, c.b) / 255 : 0);
  const hue = c => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m; if (!d) return 0; const h = (M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; return h < 0 ? h + 360 : h; };
  const colored = c => !!c && c.a >= 0.4 && sat(c) >= 0.3 && val(c) >= 0.25;
  const toneOf = c => { if (!colored(c)) return null; const h = hue(c); return h <= 25 || h >= 335 ? '위험' : h < 70 ? '주의' : h < 170 ? '좋음' : '기타'; };
  const sel = el => { const parts = []; for (let e = el, i = 0; e && e !== document.body && i < 3; e = e.parentElement, i++) { let s = e.tagName.toLowerCase(); const c = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.') : ''; if (e.id) s += '#' + e.id; else if (c) s += '.' + c; parts.unshift(s); } return parts.join('>'); };
  const hidden = el => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return true;
      const r = e.getBoundingClientRect(); if (s.overflow !== 'visible' && (r.width <= 2 || r.height <= 2)) return true;
      if (r.right < -50) return true; if (/inset\(\s*50%/.test(s.clipPath || '')) return true; if (/rect\(\s*0(px)?[ ,]+0(px)?[ ,]+0(px)?[ ,]+0(px)?\s*\)/.test(s.clip || '')) return true;
    }
    return false;
  };
  const expText = el => { let t = el.getAttribute?.('aria-label') || ''; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (!n.parentElement.closest('[aria-hidden="true"]')) t += ' ' + n.nodeValue; return t.replace(/\s+/g, ' ').trim(); };
  const OLD = o.old || [];
  const out = {label: o.label, hash: location.hash, vw: innerWidth, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, small: [], fonts: [], hangul: [], attrs: [], words: [], dots: [], taps: [], backs: []};
  const view = document.querySelector('#view');
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) {
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
    const p = n.parentElement; if (!p || p.closest('script,style,noscript,template')) continue;
    if (hidden(p)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rects = [...rg.getClientRects()].filter(r => r.width > 1 && r.height > 1); if (!rects.length) continue;
    const cs = getComputedStyle(p), px = parseFloat(cs.fontSize), inView = !!p.closest('#view'), proper = !!p.closest('[data-proper],[lang="ko"],q');
    const top = Math.round(rects[0].top + scrollY), bottom = Math.round(rects[rects.length - 1].bottom + scrollY);
    out.fonts.push({px, t: t.slice(0, 40), sel: sel(p), top, bottom, inView});
    if (px < 16.995) out.small.push({px, t: t.slice(0, 40), sel: sel(p), inView});
    if (o.en && HAN.test(t) && !proper) out.hangul.push({t: t.slice(0, 60), sel: sel(p), inView});
    if (o.en && HAN.test(t) && proper) out.hangul.push({t: t.slice(0, 60), sel: sel(p), inView, proper: true});
    for (const [name, re, strict] of OLD) if (re.test(t)) out.words.push({name, t: t.slice(0, 70), proper, strict, sel: sel(p)});
  }
  for (const el of document.querySelectorAll('input,textarea,select')) { if (hidden(el)) continue; const px = parseFloat(getComputedStyle(el).fontSize); if (px < 16.995) out.small.push({px, t: '<' + el.tagName.toLowerCase() + '> ' + (el.placeholder || el.getAttribute('aria-label') || '').slice(0, 30), sel: sel(el), inView: !!el.closest('#view')}); }
  if (o.en) for (const el of document.querySelectorAll('[aria-label],[placeholder],[title],[alt]')) {
    if (hidden(el)) continue;
    for (const k of ['aria-label', 'placeholder', 'title', 'alt']) { const v = el.getAttribute(k); if (v && HAN.test(v) && !el.closest('[data-proper],[lang="ko"]')) out.attrs.push({k, v: v.slice(0, 50), sel: sel(el)}); }
  }
  if (o.en && HAN.test(document.title)) out.attrs.push({k: 'document.title', v: document.title, sel: 'head'});
  /* 색 점 · 막대 */
  for (const el of document.querySelectorAll('body *')) {
    const cls = typeof el.className === 'string' ? el.className : '';
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || hidden(el)) continue;
    const cs = getComputedStyle(el), bg = rgb(cs.backgroundColor), isDot = /(^|\s)wy-dot(\s|$)/.test(cls);
    const own = [...el.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim());
    const small = r.width <= 40 && r.height <= 40, bar = r.height <= 16 && r.width > 40;
    if (!(isDot || (colored(bg) && (small || bar) && !own && el.tagName !== 'IMG' && el.tagName !== 'BUTTON'))) continue;
    let lab = expText(el), lvl = 0, row = false;
    if (!TONE_RE.test(lab) && bar) { const rw = el.closest('.wy-bar'); if (rw) { lab = expText(rw); row = true; } }
    const toneC = toneOf(bg), m0 = TONE_RE.exec(lab), labTone = m0 ? (TONE_KO[m0[0].toLowerCase()] ?? m0[0]) : null;
    out.dots.push({sel: sel(el), cls: cls.slice(0, 30), color: bg ? `rgb(${bg.r},${bg.g},${bg.b})` : null, colored: colored(bg), toneC, lab: labTone, lvl, row, mine: /(^|\s)(wy-dot|wy-fill)(\s|$)/.test(cls), totalBar: bar && !el.closest('.wy-bar'), ariaHidden: !!el.closest('[aria-hidden="true"]'), kind: bar ? 'bar' : 'dot'});
  }
  /* 눌리는 것 — 단추 · 링크가 아닌데 눌리는 것 */
  const NATIVE = 'button,a[href],input,select,textarea,summary,label';
  for (const el of document.querySelectorAll('body *')) {
    if (hidden(el)) continue; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el), why = [];
    if (!el.closest(NATIVE)) {
      if (cs.cursor === 'pointer') why.push('cursor:pointer');
      const role = el.getAttribute('role'); if (/^(button|link|tab|menuitem|checkbox|radio|switch|option)$/.test(role || '')) why.push('role=' + role);
      if (el.hasAttribute('onclick')) why.push('onclick');
      if (el.hasAttribute('tabindex') && +el.getAttribute('tabindex') >= 0) why.push('tabindex');
      if (window.__vjL?.has(el) && el !== document.body && el !== document.documentElement) why.push(el.querySelector(NATIVE) ? 'listener(container)' : 'listener');
    }
    if (el.tagName === 'A' && !el.hasAttribute('href') && (cs.cursor === 'pointer' || window.__vjL?.has(el))) why.push('a-without-href');
    if (el.tagName !== 'BUTTON' && el.getAttribute('role') === 'button') why.push('role=button on <' + el.tagName.toLowerCase() + '>');
    if (why.length) out.taps.push({sel: sel(el), tag: el.tagName.toLowerCase(), t: (el.textContent || '').trim().slice(0, 30), why});
  }
  for (const el of document.querySelectorAll('#view button,#view a,#view [role=button]')) { if (hidden(el)) continue; const t = (el.textContent || '').trim(); if (/앞|뒤로|이전|back|prev|‹|←/i.test(t)) out.backs.push({t, tag: el.tagName.toLowerCase()}); }
  out.lists = {ul: document.querySelectorAll('#view ul,#view ol').length, li: document.querySelectorAll('#view li').length, roleList: document.querySelectorAll('#view [role=list]').length, roleItem: document.querySelectorAll('#view [role=listitem]').length, rows: document.querySelectorAll('#view .wy-rec').length};
  out.minPx = out.fonts.length ? Math.min(...out.fonts.map(f => f.px)) : null; out.listenerN = window.__vjL?.size ?? -1; out.nativeN = document.querySelectorAll('#view button, #view a[href], #view input').length;
  if (!o.all) { out.fonts.sort((a, b) => b.px - a.px); out.fonts = out.fonts.slice(0, 6); }
  void view;
  return out;
};

/* ───────── 쓰지 않을 말 · 옛 낱말(사장님 말씀) ───────── */
const OLDW = [ // [이름, 식, strict = 사장님 직접 금지(이름 [10] 1 · [12] 6) · false = 거르는 말 목록(참고)]
  ['갈래', /갈래/, true], ['몸값', /몸값/, true], ['20거래일', /20\s*거래일/, true], ['한 회사 한 표', /한 회사 한 표/, true], ['큰 회사는 크게', /큰 회사는 크게/, true], ['다섯 문', /다섯 문/, true], ['쉬는 돈', /쉬는 돈/, true], ['챕터', /챕터/, true], ['고른 곳', /고른 곳/, true],
  ['사라', /(?:^|[^가-힣])사라(?![가-힣])/, true], ['팔아라', /팔아라/, true],
  ['사야', /사야/, false], ['담아', /담아/, false], ['추천', /추천/, false], ['무조건', /무조건/, false], ['확실', /확실/, false], ['보장', /보장/, false], ['수익', /수익/, false], ['t.me', /t\.me/i, false], ['텔레', /텔레/, false],
  ['20 trading days', /20 trading days/i, true],
].map(([a, re, s]) => [a, re.source, s, re.flags]);
/* page.evaluate 는 정규식을 못 넘기므로 화면 안에서 다시 만듦 */
const scan = (page, label, extra = {}) => page.evaluate(`(${SCAN.toString()})(Object.assign({label: ${JSON.stringify(label)}, old: ${JSON.stringify(OLDW)}.map(x => [x[0], new RegExp(x[1], x[3]), x[2]])}, ${JSON.stringify(extra)}))`);

/* ───────── 한 판 모으기 ───────── */
const agg = {small: new Map(), words: new Map(), taps: new Map(), dots: [], hangul: new Map(), attrs: [], backs: [], screens: [], overflow: []};
const addScan = (s, tag) => {
  agg.screens.push(`${tag}:${s.label}`);
  for (const x of s.small) { const k = `${x.inView ? 'view' : 'chrome'}|${x.sel}|${x.px}|${x.t}`; const e = agg.small.get(k) ?? {...x, n: 0, at: []}; e.n++; if (e.at.length < 3) e.at.push(`${tag}:${s.label}`); agg.small.set(k, e); }
  for (const x of s.words) { const k = `${x.name}|${x.t}|${x.proper}`; const e = agg.words.get(k) ?? {...x, n: 0, at: []}; e.n++; if (e.at.length < 3) e.at.push(`${tag}:${s.label}`); agg.words.set(k, e); }
  for (const x of s.taps) { const k = `${x.sel}|${x.why.join(',')}`; const e = agg.taps.get(k) ?? {...x, n: 0, at: []}; e.n++; if (e.at.length < 3) e.at.push(`${tag}:${s.label}`); agg.taps.set(k, e); }
  for (const x of s.dots) agg.dots.push({...x, at: `${tag}:${s.label}`});
  for (const x of s.hangul) { const k = `${x.proper ? 'proper' : 'raw'}|${x.t}`; const e = agg.hangul.get(k) ?? {...x, n: 0, at: []}; e.n++; if (e.at.length < 3) e.at.push(`${tag}:${s.label}`); agg.hangul.set(k, e); }
  for (const x of s.attrs) agg.attrs.push({...x, at: `${tag}:${s.label}`});
  for (const x of s.backs) agg.backs.push({...x, at: `${tag}:${s.label}`});
  if (s.lists?.rows) agg.lists = s.lists;
  agg.minPx = Math.min(agg.minPx ?? 99, s.minPx ?? 99); agg.listenerN = Math.max(agg.listenerN ?? 0, s.listenerN ?? 0); agg.nativeN = Math.max(agg.nativeN ?? 0, s.nativeN ?? 0);
  if (s.docW > s.vw + 1) agg.overflow.push(`${tag}:${s.label} 폭 ${s.docW} > ${s.vw}`);
};

/* ───────── 브라우저 도우미 ───────── */
let browser = null, blank = null;
const newCtx = async (en, extra = {}) => {
  const ctx = await browser.newContext({viewport: {width: en ? 390 : 360, height: 640}, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', deviceScaleFactor: 1, ...extra});
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage(); page.setDefaultTimeout(25000);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  page.__errs = errs;
  return {ctx, page};
};
const url = (en, hash) => `${BASE}${NEXT}${en ? '&lang=en' : ''}${hash}`;
const clicks = page => page.evaluate(() => window.__vj?.clicks ?? 0);
const settle = async (page, en) => { if (en) await sleep(350); else await sleep(120); };
const openWhy = async (page, en, first = true) => {
  if (first) await page.goto(url(en, '#/why'), {waitUntil: 'load'});
  else { await page.evaluate(() => { location.hash = '#/find'; }); await sleep(250); await page.evaluate(() => { location.hash = '#/why'; }); }
  await page.waitForSelector('.wy-go, .wy-find', {timeout: 25000}); // order-1011 — 시작 화면(「시작하기 ›」)
  await settle(page, en);
};
const pickStock = async (page, en, mode = 'click') => { // order-1011 — 종목 찾기 칸 없음 · 「시작하기 ›」를 눌러 1번 질문(옛 찾기 칸이 있으면 옛 길)
  if (await page.$('#view .wy-go')) { await page.click('#view .wy-go'); await page.waitForSelector('.wy-opt', {timeout: 25000}); await settle(page, en); return; }
  await page.fill('.wy-find', en ? '005930' : '삼성전자');
  await page.waitForSelector('.wy-hit', {timeout: 25000});
  if (mode === 'enter') await page.press('.wy-find', 'Enter'); else await page.click('.wy-hit >> nth=0');
  await page.waitForSelector('.wy-opt', {timeout: 25000});
  await settle(page, en);
};
const qHead = page => page.evaluate(() => document.querySelector('#view .wy-q')?.textContent ?? '');
/** 답 하나를 누르고 다음 질문이 뜰 때까지 — 눌린 횟수(더 눌러야 하면 「다음」을 눌러 셈) */
const answer = async (page, k, en) => { // order-1011(docs/design/why-mock-2026-10-28) — 답은 고르기만 · 「클 일이 있다」면 날짜 칸 → 「다음으로 ›」 · 11번 「결과 보기 ›」
  const before = await qHead(page), c0 = await clicks(page);
  await page.click(`.wy-opt >> nth=${k}`);
  const d = await page.$('#view .wy-date');
  if (d && !(await d.inputValue())) await d.fill(new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10));
  let moved = false, extra = 0;
  const nx = await page.$('#view .wy-nav .wy-next');
  if (nx) { await nx.click(); extra++; moved = await page.waitForFunction(b => !!document.querySelector('#view .wy-res') || (document.querySelector('#view .wy-q')?.textContent ?? '') !== b, before, {timeout: 3500}).then(() => true, () => false); }
  await settle(page, en);
  return {taps: (await clicks(page)) - c0, moved, extra};
};
const finish = async (page, en, why = 'chip') => {
  if (await page.$('#view .wy-verdict')) { await settle(page, en); return 0; } // order-1011 — 마지막 두 줄 없음 · 11번 「결과 보기 ›」 뒤 바로 결과
  await page.waitForSelector('.wy-chip, .wy-why', {timeout: 15000});
  const c0 = await clicks(page);
  if (why === 'chip') await page.click('.wy-chip >> nth=0'); else await page.fill('.wy-why', 'my reason');
  await page.click('.wy-next');
  await page.waitForSelector('.wy-verdict', {timeout: 15000});
  await settle(page, en);
  return (await clicks(page)) - c0;
};
/** 한 판 — 답 열한 개(자리 배열)를 눌러 결과까지 · 눌린 수 모음 */
const runVector = async (page, en, ans, opt = {}) => {
  await openWhy(page, en, opt.first ?? false);
  const c0 = await clicks(page);
  await pickStock(page, en, opt.enter ? 'enter' : 'click');
  const per = [];
  for (let q = 0; q < 11; q++) { if (opt.each) await opt.each(q); per.push(await answer(page, ans[q], en)); }
  const last = await finish(page, en);
  return {per, last, total: (await clicks(page)) - c0};
};
const readResult = page => page.evaluate(() => {
  const v = document.querySelector('#view .wy-res'); if (!v) return null;
  const txt = v.innerText.replace(/\s+/g, ' ');
  const m = /(?:준비|Ready)\s*(\d+)\s*\/\s*(\d+)/i.exec(txt);
  const rec = (() => { try { return JSON.parse(localStorage.getItem('atlas:godori-why') || '[]')[0] ?? null; } catch { return null; } })();
  const fill = v.querySelector('.wy-tt .wy-fill'), track = v.querySelector('.wy-tt');
  const bars = [...v.querySelectorAll('.wy-bars .wy-bar')].map(b => { const f = b.querySelector('.wy-fill'), t = b.querySelector('.wy-track'), nums = /(\d+)\s*\/\s*(\d+)/.exec(b.querySelector('.num')?.textContent ?? ''); return {name: b.querySelector('.wy-bn')?.textContent, n: nums ? +nums[1] : null, of: nums ? +nums[2] : null, wpx: f?.getBoundingClientRect().width ?? 0, tpx: t?.getBoundingClientRect().width ?? 0}; });
  const verdictEl = [...v.querySelectorAll('*')].find(e => e.children.length === 0 && /「.+」/.test(e.textContent) && /쉬어|준비|정해|rest|ready|plan|stick/i.test(e.textContent));
  return {txt: txt.slice(0, 500), n: m ? +m[1] : null, of: m ? +m[2] : null, rec, verdict: verdictEl?.textContent ?? null, fillPx: fill?.getBoundingClientRect().width ?? 0, trackPx: track?.getBoundingClientRect().width ?? 0, fillCss: fill?.style.width ?? null,
    list: [...document.querySelectorAll('#view .wy-rec .wy-rh')].map(e => e.textContent.replace(/\s+/g, ' ')), recsLen: (() => { try { return JSON.parse(localStorage.getItem('atlas:godori-why') || '[]').length; } catch { return -1; } })(), bars};
});

/* ───────── 자료 파일 (사장님 화면이 읽는 것과 같은 주소) ───────── */
const J = async p => { try { const r = await fetch(BASE + p, {cache: 'no-store'}); return r.ok ? await r.json() : null; } catch { return null; } };
const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);

/* ═════════════ 시작 ═════════════ */
const FILE_VER = {};
for (const f of ['site/next/p-why.js', 'site/next/p-why.css', 'site/next/app.js', 'site/next/p-share.js', 'site/next/p-gdr.js']) { try { const st = await fs.stat(path.join(ROOT, f)); FILE_VER[f] = new Date(st.mtimeMs).toISOString().slice(11, 19) + 'Z ' + st.size + 'B'; } catch { /* 없음 */ } }
log('시작 — 잰 파일', JSON.stringify(FILE_VER));
const probe = await fetch(BASE + NEXT).then(r => r.status, () => 0);
if (probe !== 200) { console.error('시험 서버가 안 열림', BASE, probe); process.exit(2); }
browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
const exitCode = await (async () => {
  try {
    blank = await (await browser.newContext()).newPage();
    await blank.goto('about:blank');
    const chroma = async buf => blank.evaluate(async b64 => {
      const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const bmp = await createImageBitmap(new Blob([u8], {type: 'image/png'})), c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
      const g = c.getContext('2d', {willReadFrequently: true}); g.drawImage(bmp, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0, mx = 0, ex = null;
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; const M = Math.max(d[i], d[i + 1], d[i + 2]), m = Math.min(d[i], d[i + 1], d[i + 2]), s = M ? (M - m) / M : 0; if (s > 0.30 && M / 255 > 0.25) { n++; if (s > mx) { mx = s; ex = [d[i], d[i + 1], d[i + 2]]; } } }
      return {n, mx: Math.round(mx * 100) / 100, ex, w: bmp.width, h: bmp.height};
    }, buf.toString('base64'));

    /* ───── 판 하나 — 초록 길(질문마다 훑음) : 항목 1 · 3 · 4 · 9 · 10 ───── */
    const flowMain = async en => {
      const tag = en ? 'EN' : 'KO'; const {ctx, page} = await newCtx(en);
      const out = {tag, per: [], lat: [], pre: [], prev: [], backs: [], order: [], two: null, totalTaps: 0, stockTaps: 0, result: null, errs: page.__errs};
      try {
        await page.goto(url(en, '#/why'), {waitUntil: 'load'}); await page.waitForSelector('.wy-go, .wy-find'); await settle(page, en); // order-1011 — 시작 화면(종목 찾기 칸 없음)
        addScan(await scan(page, 'finder', {en}), tag);
        const c0 = await clicks(page);
        const cs = await clicks(page); await pickStock(page, en); // 「시작하기 ›」(옛 찾기 칸이 있으면 옛 길)
        out.stockTaps = (await clicks(page)) - cs;
        const green = OWN.map(Q => Math.max(0, Q.a.findIndex(a => a[0] === 'g')));
        for (let q = 0; q < 11; q++) {
          if (want(1) && !en) {
            /* 고르기 전 — 답 셋의 색 · 읽어 주는 글 · 눈에 보이는 화소 */
            const info = await page.evaluate(() => {
              const rgb = s => { const m = /^rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
              const sat = c => { if (!c) return 0; const M = Math.max(c.r, c.g, c.b), m = Math.min(c.r, c.g, c.b); return M ? (M - m) / M : 0; };
              const opts = [...document.querySelectorAll('#view .wy-opt')];
              return opts.map(b => {
                const els = [b, ...b.querySelectorAll('*')];
                const sigs = els.map(e => { const cs = getComputedStyle(e); return [cs.backgroundColor, cs.borderTopColor, cs.color, cs.boxShadow, cs.backgroundImage, cs.outlineColor].join('|'); });
                const chromatic = els.map(e => { const cs = getComputedStyle(e); return [cs.backgroundColor, cs.borderTopColor, cs.color].map(rgb).some(c => c && c.a > 0.3 && sat(c) >= 0.3); }).some(Boolean);
                return {text: b.querySelector('.wy-ot')?.textContent ?? b.textContent.trim(), full: b.textContent.trim(), aria: b.getAttribute('aria-label') ?? '', title: b.getAttribute('title') ?? '', sig: sigs.join('||'), chromatic, dotCls: b.querySelector('.wy-dot')?.className ?? null, dotHidden: b.querySelector('.wy-dot')?.getAttribute('aria-hidden') ?? null, pressed: b.getAttribute('aria-pressed')};
              });
            });
            const head = await qHead(page);
            await page.mouse.move(2, 2);
            await page.evaluate(() => document.querySelector('#view .wy-opts')?.scrollIntoView({block: 'center'})); await sleep(150);
            let px = null; try { px = await chroma(await page.locator('#view .wy-opts').screenshot()); } catch (e) { px = {err: String(e).slice(0, 80)}; }
            out.pre.push({q: q + 1, head, info, px});
            if (q === 0 && !en) { try { await page.hover('#view .wy-opt >> nth=2'); await sleep(120); out.hoverPx = await chroma(await page.locator('#view .wy-opts').screenshot()); await page.mouse.move(2, 2); } catch { /* 없음 */ } }
          }
          const sc = await scan(page, 'Q' + (q + 1), {en}); addScan(sc, tag); out.backs.push({q: q + 1, backs: sc.backs});
          /* 앞 답의 한마디 — 이 장 맨 위(머리 바로 밑) · 색 · 읽어 주는 글 · 격언 */
          if (q > 0) out.prev.push({q: q + 1, ...(await page.evaluate(() => {
            const sec = document.querySelector('#view .wy.page, #view .wy'), head = sec?.querySelector('.wy-head'), prev = sec?.querySelector('.wy-prev'), stk = sec?.querySelector('.wy-stk');
            const dot = prev?.querySelector('.wy-dot'); const cs = dot ? getComputedStyle(dot) : null;
            return {has: !!prev, afterHead: !!prev && head?.nextElementSibling === prev, top: prev ? Math.round(prev.getBoundingClientRect().top + scrollY) : null, stkTop: stk ? Math.round(stk.getBoundingClientRect().top + scrollY) : null, headBottom: head ? Math.round(head.getBoundingClientRect().bottom + scrollY) : null,
              one: prev?.querySelector('.wy-onet')?.textContent ?? null, say: prev?.querySelector('q')?.textContent ?? null, dotBg: cs?.backgroundColor ?? null, dotSr: dot?.textContent?.trim() ?? null, dotCls: dot?.className ?? null};
          }))});
          if (q === 1 && !en && want(1)) { try { out.ctrlPx = await chroma(await page.locator('#view .wy-prev').screenshot()); } catch (e) { out.ctrlPx = {err: String(e).slice(0, 80)}; } }
          const a = await answer(page, green[q], en); out.per.push(a.taps); out.lat.push(a.moved ? 1 : 0);
        }
        /* 마지막 두 줄 — order-1011 로 없음(11번 「결과 보기 ›」 뒤 바로 결과) · 옛 판 칸이 있을 때만 */
        const c1 = await clicks(page);
        if (!(await page.$('#view .wy-verdict'))) {
          addScan(await scan(page, '마지막 두 줄', {en}), tag);
          out.two = await page.evaluate(() => ({hasBack: [...document.querySelectorAll('#view .wy-back')].map(b => b.textContent.trim()), chips: document.querySelectorAll('#view .wy-chip').length, step: document.querySelector('#view .wy-step')?.textContent ?? null}));
          await page.click('.wy-chip >> nth=0'); await page.click('.wy-next'); await page.waitForSelector('.wy-verdict'); await settle(page, en);
        } else out.two = {none: 'order-1011'};
        out.lastTaps = (await clicks(page)) - c1;
        out.totalTaps = (await clicks(page)) - c0;
        const sc = await scan(page, '결과(초록 길)', {en, all: true}); addScan(sc, tag); out.result = {...(await readResult(page)), fonts: sc.fonts};
        out.latMs = await page.evaluate(() => window.__vj.lat);
        /* 기록 목록(결과 아래) 도 훑음 */
        out.listFonts = null;
      } catch (e) { out.err = String(e).slice(0, 300); out.errStack = (e.stack || '').split('\n').slice(0, 3).join(' | '); }
      await ctx.close();
      return out;
    };

    /* 3번 「클 일이 있다」 길 — 답 + 날짜 + 다음 */
    const flowBig = async () => {
      const {ctx, page} = await newCtx(false); const o = {};
      try {
        await openWhy(page, false, true); await pickStock(page, false);
        for (let q = 0; q < 2; q++) await answer(page, Math.max(0, OWN[q].a.findIndex(a => a[0] === 'g')), false);
        const c0 = await clicks(page), k0 = await page.evaluate(() => window.__vj.keys);
        await page.click(`.wy-opt >> nth=${BIG_A}`); await sleep(350);
        o.state = await page.evaluate(() => ({date: !!document.querySelector('#view input[type=date]'), next: [...document.querySelectorAll('#view .wy-next')].map(b => b.textContent.trim()), q: document.querySelector('#view .wy-q')?.textContent ?? '', backs: [...document.querySelectorAll('#view .wy-back')].map(b => b.textContent.trim()), chosenTone: [...document.querySelectorAll('#view .wy-opt')].map(b => b.textContent.replace(/\s+/g, ' ').trim())}));
        const sc = await scan(page, 'Q3 날짜 칸', {en: false}); addScan(sc, 'KO');
        const d = new Date(Date.now() + 90 * 864e5), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        await page.fill('#view input[type=date]', iso); await sleep(250);
        const before = await qHead(page); await page.click('#view .wy-next');
        o.moved = await page.waitForFunction(b => (document.querySelector('#view .wy-q')?.textContent ?? '') !== b, before, {timeout: 4000}).then(() => true, () => false);
        o.taps = (await clicks(page)) - c0; o.typed = 1; o.keys = (await page.evaluate(() => window.__vj.keys)) - k0;
        o.nextQ = await qHead(page);
      } catch (e) { o.err = String(e).slice(0, 300); }
      await ctx.close();
      return o;
    };
    let KO = null, ENF = null, BIG = null;
    if (want(1) || want(3) || want(4) || want(9) || want(10) || want(2)) { log('KO 초록 길'); KO = await flowMain(false); }
    if (want(3) || want(4)) { log('KO 3번 날짜 길'); BIG = await flowBig(); }

    /* ───── 항목 1 ───── */
    if (want(1) && KO) {
      const r = R(1, '답 색 숨김', '[5] 1 고르기 전에는 답 색을 숨겨라. 고른 뒤에만 색과 한마디');
      const bad = [];
      for (const P of KO.pre) {
        const o = OWN[P.q - 1];
        if (P.info.length !== 3) { bad.push(`Q${P.q} 답 단추 ${P.info.length}개`); continue; }
        const texts = P.info.map(x => x.text.trim());
        if (JSON.stringify(texts) !== JSON.stringify(o.a.map(a => a[1]))) bad.push(`Q${P.q} 답 차례/글 ≠ 사장님 글: ${texts.join(' / ')}`);
        if (P.head.replace(/^\d+\.\s*/, '') !== o.q) bad.push(`Q${P.q} 질문 글 「${P.head}」 ≠ 「${o.q}」`);
        if (new Set(P.info.map(x => x.sig)).size !== 1) bad.push(`Q${P.q} 답 셋의 모양(색)이 서로 다름`);
        if (P.info.some(x => x.chromatic)) bad.push(`Q${P.q} 계산된 색이 있음(채도 0.3 이상)`);
        if (P.info.some(x => /좋음|주의|위험|🟢|🟡|🔴/.test(x.full + x.aria + x.title))) bad.push(`Q${P.q} 답 단추에 색 말(좋음 · 주의 · 위험) 있음`);
        if (P.info.some(x => !/wy-n\b/.test(x.dotCls ?? ''))) bad.push(`Q${P.q} 빈 테두리(wy-n) 아닌 점: ${P.info.map(x => x.dotCls).join(' / ')}`);
        if (!P.px || P.px.err || P.px.n > 0) bad.push(`Q${P.q} 눈에 보이는 색 화소 ${P.px?.n ?? '?'}개 ${JSON.stringify(P.px?.ex ?? P.px?.err)}`);
      }
      for (const x of KO.prev) {
        const o = OWN[x.q - 2], tone = o.a[0][0]; void tone;
        if (!x.has) { bad.push(`Q${x.q} 앞 답 한마디 칸 없음`); continue; }
        if (!x.afterHead) bad.push(`Q${x.q} 앞 답 한마디가 머리 바로 밑이 아님`);
        if (!x.one) bad.push(`Q${x.q} 앞 답 한마디 글 없음`);
        if (x.say !== o.say) bad.push(`Q${x.q} 격언 「${x.say}」 ≠ 사장님 글 「${o.say}」`);
        const want1 = OWN[x.q - 2].a[Math.max(0, OWN[x.q - 2].a.findIndex(a => a[0] === 'g'))][0]; void want1;
        if (x.dotSr !== '좋음') bad.push(`Q${x.q} 앞 답(초록)의 읽어 주는 글 「${x.dotSr}」 ≠ 좋음`);
      }
      const px = KO.pre.map(P => P.px?.n ?? '?');
      r.measured = `질문 11장 고르기 전: 답 셋 모양 같음 · 색 화소 ${px.join('/')}(0이면 숨김) · 답 단추 색 말 0 · 호버 시 색 화소 ${KO.hoverPx?.n ?? '?'} · 재는 기구 점검(색 점 칸 화소) ${KO.ctrlPx?.n ?? '?'} · 고른 뒤 다음 장 맨 위에 색 점 + 읽어 주는 글 + 한마디 + 격언 ${KO.prev.filter(x => x.has && x.afterHead && x.dotSr === '좋음').length}/10장`;
      if (!(KO.ctrlPx?.n > 20)) F(r, `재는 기구 점검 실패: 색 점이 있는 칸(Q2 맨 위)에서 색 화소 ${KO.ctrlPx?.n ?? KO.ctrlPx?.err}개`);
      for (const b of bad) F(r, b);
      if ((KO.hoverPx?.n ?? 0) > 0) N(r, `Q1 답 위에 손을 올리면 색 화소 ${KO.hoverPx.n}개 ${JSON.stringify(KO.hoverPx.ex)}`);
    }
    /* ───── 항목 3 ───── */
    if (want(3) && KO) {
      const r = R(3, '누름 수', '[5] 3 답을 누르면 바로 다음 질문 · 누름 22번 → 11번');
      const per = KO.per; const sum = per.reduce((a, b) => a + b, 0);
      for (let i = 0; i < per.length; i++) if (per[i] !== 1) F(r, `Q${i + 1} 답 누름 ${per[i]}번(1번이어야 함)`);
      if (!KO.lat.every(x => x === 1)) F(r, '답을 누른 뒤 다음 질문이 안 뜬 곳 있음 ' + JSON.stringify(KO.lat));
      const lat = (KO.latMs ?? []).slice(1, 12).sort((a, b) => a - b), med = lat[Math.floor(lat.length / 2)] ?? null;
      r.measured = `질문 11개 = 누름 ${per.join('+')} = ${sum}번(옛 22) · 종목 고르기 ${KO.stockTaps}번 + 질문 ${sum}번 + 마지막(한 줄 말 1 + 결과 보기 1) ${KO.lastTaps}번 = 결과까지 ${KO.totalTaps}번 · 누른 뒤 다음 질문까지 가운데 ${med}ms 최대 ${lat[lat.length - 1] ?? '?'}ms(기계 부하 큼)`;
      if (sum !== 11) F(r, `질문 누름 합 ${sum} ≠ 11`);
      const top = KO.prev.filter(x => x.has && x.afterHead && x.top != null && x.stkTop != null && x.top < x.stkTop).length;
      if (top !== KO.prev.length) F(r, `앞 답 한마디가 다음 장 맨 위(머리 바로 밑 · 종목 줄 위)인 장 ${top}/${KO.prev.length}`);
      r.measured += ` · 앞 답 한마디 = 다음 장 머리 바로 밑 ${top}/${KO.prev.length}장`;
      if (BIG && !BIG.err) { r.measured += ` · 3번 「클 일이 있다」 길: 답 + 다음 = ${BIG.taps}번 + 날짜 글쓰기 1칸(그 답에서만)`; if (!BIG.state?.date) F(r, '3번 「클 일이 있다」에 날짜 칸이 안 뜸'); if (!BIG.moved) F(r, '3번 날짜를 넣고 다음을 눌러도 안 넘어감'); if (BIG.taps !== 2) F(r, `3번 「클 일이 있다」 길 누름 ${BIG.taps}번(답 + 다음 = 2번이어야 함)`); }
      else F(r, '3번 날짜 길을 못 잼 ' + BIG?.err);
    }
    /* ───── 항목 4 ───── */
    if (want(4) && KO) {
      const r = R(4, '뒤로 단추 글', '[5] 4 뒤로 가는 단추 글은 「‹ 앞 질문」');
      const seen = [];
      for (const B of KO.backs) { const t = B.backs.map(x => x.t); seen.push(`Q${B.q}:${t.join('|') || '없음'}`); if (!(t.length === 1 && t[0] === '‹ 앞 질문')) F(r, `Q${B.q} 뒤로 단추 ${JSON.stringify(t)}`); }
      if (!(KO.two?.hasBack?.length === 1 && KO.two.hasBack[0] === '‹ 앞 질문')) F(r, `마지막 두 줄 화면 뒤로 단추 ${JSON.stringify(KO.two?.hasBack)}`);
      if (!(BIG?.state?.backs?.length === 1 && BIG.state.backs[0] === '‹ 앞 질문')) F(r, `3번 날짜 칸 화면 뒤로 단추 ${JSON.stringify(BIG?.state?.backs)}`);
      const allBack = agg.backs.filter(b => !b.at.startsWith('EN')).map(b => b.t);
      if (allBack.some(t => /앞으로/.test(t))) F(r, '「앞으로」 단추 글이 있음');
      const stat = await fs.readFile(path.join(ROOT, 'site/next/p-why.js'), 'utf8').catch(() => '');
      const old = (stat.match(/['"`]‹ 앞으로['"`]/g) || []).length; if (old) F(r, `p-why.js 에 「‹ 앞으로」 ${old}곳`);
      r.measured = `질문 1~11장 + 마지막 두 줄 장 모두 뒤로 단추 = 「‹ 앞 질문」 하나씩(${seen.slice(0, 2).join(' · ')} …) · 「앞으로」 단추 0 · 3번 날짜 칸 장도 같음`;
    }
    /* ───── 항목 2 · 5 · 6 : 여러 판 ───── */
    const vec = {
      G: pickIdx('ggggggggggg'), Y6: pickIdx('yygyyyyg' + 'ggg'), RALL: pickIdx('rrrrrrrrrrr'), MIX: pickIdx('yrgyrgyrgyr'), YALL: pickIdx('yygyyyyyygy'),
      Q4a: pickIdx('gggrggggggg'), Q4b: pickIdx('rrgrrrrrggy'), Q4c: pickIdx('yygryyyyggg'), Q4d: pickIdx('ryg' + 'r' + 'gyrgggy'),
      Q9a: pickIdx('gggggggg' + 'rgg'), Q9b: pickIdx('rrgyyyyy' + 'rgg'), Q9c: pickIdx('yygyyyyy' + 'ryg'), Q9d: pickIdx('gyg' + 'gryrg' + 'r' + 'gr'),
      CTRL: pickIdx('gggyggggyggg'.slice(0, 11)),
    };
    vec.CTRL = pickIdx('gggygggg' + 'ygg'); // 4번 · 9번이 노랑(반쯤 · 몇 달 안) → 쉬는 답 아님
    const V2 = {};
    const needVec = want(2) || want(5) || want(6);
    if (needVec) {
      const {ctx, page} = await newCtx(false);
      try {
        let first = true;
        const flows = ['G', 'Y6', 'RALL', 'MIX', 'YALL', 'CTRL', 'Q4a', 'Q4b', 'Q4c', 'Q4d', 'Q9a', 'Q9b', 'Q9c', 'Q9d'];
        for (const name of flows) {
          if (!want(5) && !want(6) && !['G', 'Y6', 'RALL', 'Q4a'].includes(name)) continue;
          if (!want(6) && name.startsWith('Q') && name !== 'Q4a') continue;
          log('KO 판', name);
          const ans = vec[name];
          const run = await runVector(page, false, ans, {first}); first = false;
          const sc = await scan(page, '결과 ' + name, {en: false, all: true}); addScan(sc, 'KO');
          const res = await readResult(page);
          const o = oracle(ans);
          V2[name] = {ans, o, run, res, fonts: sc.fonts};
          if (want(6) && (name.startsWith('Q') || name === 'CTRL' || name === 'G' || name === 'RALL')) {
            const g = {};
            for (const where of ['#/', '#/gdr']) {
              await page.evaluate(h => { location.hash = h; }, where);
              await page.waitForSelector('section[aria-label="고도리 칸"]', {timeout: 30000}).catch(() => null);
              await sleep(900);
              g[where] = await page.evaluate(() => {
                const s = document.querySelector('section[aria-label="고도리 칸"]'), v = document.querySelector('#view');
                return {has: !!s, txt: s ? s.innerText.replace(/\s+/g, ' ').trim() : null, ctl: s ? s.querySelectorAll('a,button,input,details,summary').length : null, view: (v?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 300),
                  tokens: (v?.innerText ?? '').match(/팔 선|절반 팔|담겠어|팔겠어|비중|현금으로 둠|곳마다|금액|고도리 칸 \d+곳/g) ?? [], cls: s?.className ?? null, stored: (() => { try { return JSON.parse(localStorage.getItem('atlas:godori-why') || '[]').length; } catch { return -1; } })()};
              });
              if (where === '#/gdr') addScan(await scan(page, '고도리 칸 ' + name, {en: false}), 'KO');
            }
            V2[name].gdr = g;
          }
        }
      } catch (e) { V2.__err = String(e).slice(0, 300) + ' | ' + (e.stack || '').split('\n').slice(0, 3).join(' | '); }
      await ctx.close();
    }
    /* 항목 2 */
    if (want(2)) {
      const r = R(2, '판정 글이 가장 큼', '[5] 2 결과 화면은 판정 글을 가장 크게 · 점수는 그 밑에 작게');
      const parts = [];
      for (const [name, tag] of [['G', 'go'], ['Y6', 'wait'], ['RALL', 'rest'], ['Q4a', 'rest(4번)']]) {
        const f = V2[name]; if (!f) { F(r, `${name} 판을 못 냄 ${V2.__err ?? ''}`); continue; }
        const fonts = f.fonts.filter(x => x.inView || true), vt = VERDICT[f.o.verdict];
        const vEl = fonts.find(x => x.t.includes(vt)), sEl = fonts.filter(x => x.inView && x !== vEl && !/「/.test(x.t) && /^준비(\s|$)/.test(x.t)).sort((a, b) => a.top - b.top)[0];
        const maxOther = fonts.filter(x => x !== vEl).sort((a, b) => b.px - a.px)[0];
        const scoreGroup = fonts.filter(x => x.inView && x !== vEl && !/「/.test(x.t) && x.top >= (sEl?.top ?? 1e9) - 4 && x.top <= (sEl?.top ?? -1e9) + 6);
        const scoreMax = scoreGroup.length ? Math.max(...scoreGroup.map(x => x.px)) : null;
        if (!vEl) { F(r, `${name}(${tag}) 판정 글 「${vt}」를 화면에서 못 찾음`); continue; }
        parts.push(`${tag} 판정 ${vEl.px}px(위끝 ${vEl.top}) · 그 다음 큰 글 ${maxOther?.px}px(${maxOther?.t}) · 「준비 n / 22」 줄 ${scoreMax}px(위끝 ${sEl?.top})`);
        if (!(vEl.px > (maxOther?.px ?? 0))) F(r, `${tag}: 판정 글 ${vEl.px}px 가 가장 크지 않음 — ${maxOther?.px}px 「${maxOther?.t}」 ${maxOther?.sel}`);
        if (sEl) { if (!(scoreMax < vEl.px)) F(r, `${tag}: 「준비 n / 22」 ${scoreMax}px 가 판정 ${vEl.px}px 보다 작지 않음`); if (!(sEl.top >= vEl.bottom - 2)) F(r, `${tag}: 「준비 n / 22」 가 판정 글 밑이 아님(판정 아래끝 ${vEl.bottom} · 준비 위끝 ${sEl.top})`); }
        else F(r, `${tag}: 「준비 n / 22」 글을 못 찾음`);
      }
      r.measured = parts.join(' | ');
    }
    /* 항목 5 */
    if (want(5)) {
      const r = R(5, '준비 n / 22', '[5] 5 「준비 n / 22」 · 22 − 옛 점수 · 막대도 준비된 만큼');
      const rows = [];
      for (const [name, f] of Object.entries(V2)) {
        if (name === '__err') continue;
        const {o, res} = f; if (!res) { F(r, `${name}: 결과를 못 읽음`); continue; }
        const stored = res.rec?.score;
        const ok1 = res.n === o.ready && res.of === 22, ok2 = Number.isFinite(stored) && res.n === 22 - stored, ok3 = stored === o.score;
        const ratio = res.trackPx ? res.fillPx / res.trackPx : null, want1 = o.ready / 22;
        const cssPct = res.fillCss ? parseFloat(res.fillCss) : null;
        const ok4 = ratio != null && Math.abs(ratio - want1) <= 0.015 && cssPct != null && Math.abs(cssPct / 100 - want1) <= 0.01;
        const barsOk = (res.bars ?? []).every(b => { const gmax = {이유: 6, 돈: 6, 때: 4, 마음: 6}[b.name]; return b.of === gmax && b.n === gmax - o.groups[b.name] && b.tpx > 0 && Math.abs(b.wpx / b.tpx - b.n / gmax) <= 0.02; }) && (res.bars ?? []).length === 4;
        const listOk = (res.list ?? []).length ? new RegExp(`준비 ${o.ready} / 22`).test(res.list[0]) : false;
        rows.push(`${name} 보임 ${res.n}/${res.of} · 22−저장 ${stored} = ${22 - stored} · 사장님 표 ${o.ready}`);
        if (!ok1) F(r, `${name}: 보이는 「준비 ${res.n} / ${res.of}」 ≠ 사장님 점수표 ${o.ready} / 22`);
        if (!ok2) F(r, `${name}: 보이는 준비 ${res.n} ≠ 22 − 저장 점수 ${stored}`);
        if (!ok3) F(r, `${name}: 저장 점수 ${stored} ≠ 사장님 표 점수 ${o.score}`);
        if (!ok4) F(r, `${name}: 큰 막대 채움 ${ratio?.toFixed(3)}(그린 길이) · ${res.fillCss} ≠ 준비 ${o.ready}/22 = ${want1.toFixed(3)}`);
        if (!barsOk) F(r, `${name}: 묶음 막대 ${JSON.stringify(res.bars)} ≠ 준비된 만큼(${JSON.stringify(o.groups)})`);
        if (!listOk) F(r, `${name}: 기록 목록 맨 위 「${(res.list ?? [])[0]}」 에 「준비 ${o.ready} / 22」 없음`);
        const vtxt = res.verdict ?? ''; if (!vtxt.includes(VERDICT[o.verdict])) F(r, `${name}: 판정 「${vtxt}」 ≠ 사장님 표 「${VERDICT[o.verdict]}」(${o.verdict})`);
      }
      r.measured = `${rows.length}판 ${rows.slice(0, 3).join(' ; ')} … (모두 보이는 값 = 22 − 저장 = 사장님 표 · 큰 막대 · 묶음 막대 · 기록 줄 맞대기)`;
    }
    /* 항목 6 */
    if (want(6)) {
      const r = R(6, '쉬어 가자 규칙', '[5] 6 · 7 4번 「거의 다 · 빌린 돈」 · 9번 「곧」 = 오늘은 쉬어 가자 · 고도리 칸 = 「오늘은 담는 칸을 닫아 둘게」만');
      const lines = [];
      for (const name of ['Q4a', 'Q4b', 'Q4c', 'Q4d', 'Q9a', 'Q9b', 'Q9c', 'Q9d']) {
        const f = V2[name]; if (!f) { F(r, `${name} 판을 못 냄 ${V2.__err ?? ''}`); continue; }
        const vt = f.res?.verdict ?? '', st = f.res?.rec?.verdict ?? '';
        const viaPoints = f.o.score >= 12 || f.o.reds >= 4;
        lines.push(`${name}:${f.o.score}점${viaPoints ? '(점수로도 쉼)' : ''}`);
        if (!vt.includes(VERDICT.rest)) F(r, `${name}: 판정 「${vt}」 ≠ 「오늘은 쉬어 가자」(점수 ${f.o.score} · 쉬는 답 ${name})`);
        if (st !== VERDICT.rest) F(r, `${name}: 저장된 판정 「${st}」`);
        for (const where of ['#/', '#/gdr']) {
          const g = f.gdr?.[where];
          if (!g?.has) { F(r, `${name} ${where}: 고도리 칸을 못 찾음`); continue; }
          if (g.txt !== '오늘은 담는 칸을 닫아 둘게') F(r, `${name} ${where}: 칸 안 글 「${g.txt}」 ≠ 「오늘은 담는 칸을 닫아 둘게」만`);
          if (g.ctl) F(r, `${name} ${where}: 닫힌 칸 안에 단추·링크 ${g.ctl}개`);
          if (g.tokens.length) F(r, `${name} ${where}: 화면에 ${JSON.stringify(g.tokens)}`);
          if (!(g.stored >= 1)) F(r, `${name} ${where}: 기록이 지워짐(저장 ${g.stored}건)`);
        }
      }
      const ctl = V2.CTRL, g0 = V2.G;
      const ctrlOk = ctl?.res?.verdict?.includes(VERDICT.go) && ctl?.gdr?.['#/']?.txt && ctl.gdr['#/'].txt !== '오늘은 담는 칸을 닫아 둘게' && /고도리 칸/.test(ctl.gdr['#/'].txt);
      if (!ctrlOk) F(r, `대조(4번 · 9번이 노랑 + 나머지 초록): 판정 「${ctl?.res?.verdict}」 칸 「${(ctl?.gdr?.['#/']?.txt ?? '').slice(0, 40)}」 — 쉬는 답이 아닌데 닫힘/열림이 다름`);
      const gOpen = g0?.gdr?.['#/']; if (!(gOpen?.txt && /고도리 칸/.test(gOpen.txt))) F(r, `대조(전부 초록): 고도리 칸이 열려 있지 않음 「${(gOpen?.txt ?? '').slice(0, 40)}」`);
      const ra = V2.RALL?.gdr?.['#/']; if (ra && ra.txt !== '오늘은 담는 칸을 닫아 둘게') F(r, `전부 빨강: 칸 안 글 「${ra.txt}」`);
      const safeLine = V2.Q4a?.gdr?.['#/gdr']?.view ?? '';
      r.measured = `쉬는 답 8판(${lines.join(' ')}) 모두 판정 「오늘은 쉬어 가자」 · #/ 와 #/gdr 의 고도리 칸 글 = 「오늘은 담는 칸을 닫아 둘게」 한 문장 · 단추 0 · 금액 · 팔 선 · 담겠어 0 · 기록 안 지워짐 · 대조 2판(노랑 노랑 → ${ctl?.res?.verdict ?? '?'} · 칸 열림 ${!!ctrlOk})`;
      N(r, `#/gdr 칸 밖 한 줄: 「${safeLine.replace('오늘은 담는 칸을 닫아 둘게', '').trim().slice(0, 80)}」(사이트 안전 문장)`);
    }

    /* ───── 항목 7 : 한 달 지난 기록 ───── */
    if (want(7)) {
      const r = R(7, '한 달 지난 기록', '[5] 8 「그날 정한 대로 했어?」 먼저 · [5] 9 날짜 박은 값(그날 종가 → 20거래일 뒤 종가 · 코스피 · 모든 회사 가운데 값) · 못 찾으면 「?」');
      const days = await J('/atlas/data/days.json'), home = await J('/atlas/data/home.json'), med = await J('/next/data/median20.json');
      if (!days || !home || !med) { F(r, '자료 파일을 못 받음 ' + [!!days, !!home, !!med].join()); }
      else {
        const D = days.dates;
        const kosp = new Map((home.idx?.KOSPI?.rows ?? []).map(x => [x[0], x[1]]));
        const startOf = rec => { const t = /^\d{4}-\d{2}-\d{2}$/.test(rec.day ?? '') ? rec.day : /^\d{4}-\d{2}-\d{2}$/.test(rec.asOf ?? '') ? rec.asOf : seoulDay(Date.parse(rec.at)); let k = -1; for (let j = D.length - 1; j >= 0; j--) if (D[j] <= t) { k = j; break; } return k; };
        const mkRec = (code, name, day, price, o = {}) => ({at: new Date(`${o.atDay ?? day}T${o.atTime ?? '15:00:00'}+09:00`).toISOString(), asOf: day, code, name, price, day, answers: pickIdx(o.tones ?? 'ggggggggggg'), score: o.score ?? 0, reds: 0, verdict: o.verdict ?? VERDICT.go, groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, bigDay: null, why: '이익이 줄어서', promise: {sell: Math.floor(price * 0.9), half: Math.floor(price * 1.2), text: '만약 아래로 가면 다 판다. 만약 위로 가면 절반 판다.'}, picks: []});
        const lastD = D[D.length - 1];
        const seeds = [
          {id: 'S1 보통', rec: mkRec('005930', '삼성전자', '2026-09-01', 261000), ask: true},
          {id: 'S2 회사가 아직 상장 전(그날 종가 없음)', rec: mkRec('483350', '딜리셔스', '2026-08-05', 5000), ask: true},
          {id: 'S3 코스피 줄 밖(7월 13일 앞)', rec: mkRec('005930', '삼성전자', '2026-05-04', 232500), ask: true},
          {id: 'S4 38일 지남 · 스무 번째 장 날이 자료 밖', rec: mkRec('005930', '삼성전자', '2026-09-10', 250000), ask: true, late: true},
          {id: 'S5 회사 파일 없음', rec: mkRec('999999', '없는 회사', '2026-09-01', 10000), ask: true},
          {id: 'S6 토요일에 적음(그날 값 = 금요일)', rec: mkRec('005930', '삼성전자', '2026-09-04', 261000, {atDay: '2026-09-05', atTime: '10:00:00'}), ask: true},
          {id: 'S7 옛 꼴(날짜 칸 없음 · 기록한 때만)', rec: (() => { const x = mkRec('005930', '삼성전자', '2026-09-02', 261000); delete x.day; delete x.asOf; x.at = '2026-09-02T07:00:00.000Z'; return x; })(), ask: true},
          {id: 'S8 사흘 전(한 달 안 됨)', rec: mkRec('005930', '삼성전자', D[D.length - 3], 234000, {atDay: seoulDay(Date.now() - 3 * 864e5)}), ask: false},
          {id: 'S9 옛 점수 7(반만 준비됐어)', rec: mkRec('005930', '삼성전자', D[D.length - 2], 234000, {atDay: seoulDay(Date.now() - 2 * 864e5), score: 7, verdict: VERDICT.wait, tones: 'yygyyyyg' + 'ggg'}), ask: false, legacy: 15},
        ];
        const needK = [...new Set(seeds.map(s => startOf(s.rec)).filter(k => k >= 0 && D[k + 20]))];
        const store = {}; let nFiles = 0;
        const list = Object.keys((await J('/atlas/data/mkt.json'))?.companies ?? {});
        if (!list.length) N(r, '회사 번호 목록을 못 읽어 가운데 값 전수 셈은 생략(median20.json 만 맞댐)');
        else {
          const fetchOne = async code => { const j = await J(`/atlas/data/co/${code}.json`); if (!j || !Array.isArray(j.close)) return; nFiles++; for (const k of needK) { const a = j.close[k - (j.k0 ?? 0)], b = j.close[k + 20 - (j.k0 ?? 0)]; if (a > 0 && b > 0) (store[k] ??= []).push((b / a - 1) * 100); } };
          let i = 0; await Promise.all(Array.from({length: 8}, async () => { while (i < list.length) { const c = list[i++]; await fetchOne(c); } }));
        }
        const medOf = k => { const a = (store[k] ?? []).sort((x, y) => x - y); if (!a.length) return null; const m = a.length >> 1; return {v: a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2, n: a.length}; };
        const coCache = new Map(); const getCo = async code => { if (!coCache.has(code)) coCache.set(code, await J(`/atlas/data/co/${code}.json`)); return coCache.get(code); };
        const exp = [];
        for (const s of seeds) {
          const k = startOf(s.rec), sD = k >= 0 ? D[k] : null, eD = k >= 0 ? D[k + 20] ?? null : null;
          const co = await getCo(s.rec.code), k0 = co?.k0 ?? 0;
          const A = co?.close?.[k - k0], B = co?.close?.[k + 20 - k0], a = A > 0 ? A : null, b = B > 0 ? B : null;
          const ka = kosp.get(sD), kb = kosp.get(eD), mrow = med.rows.find(x => x[0] === sD && x[1] === eD), my = k >= 0 && eD ? medOf(k) : null;
          exp.push({id: s.id, sD, eD, a, b, co: a && b ? (b / a - 1) * 100 : null, kospi: ka > 0 && kb > 0 ? (kb / ka - 1) * 100 : null, med: mrow ? mrow[2] : null, medN: mrow ? mrow[3] : null, myMed: my ? my.v : null, myN: my ? my.n : null});
        }
        for (const e of exp) if (e.med != null && e.myMed != null) { const d = Math.abs(e.med - e.myMed); if (d > 0.011) F(r, `${e.id}: median20.json ${e.med} ≠ 회사 파일 ${nFiles}개로 다시 셈한 ${e.myMed.toFixed(3)}(차 ${d.toFixed(3)}) · 곳 수 ${e.medN} vs ${e.myN}`); else if (e.medN !== e.myN) N(r, `${e.id}: 곳 수 median20 ${e.medN} vs 다시 셈 ${e.myN}`); }
        const {ctx, page} = await newCtx(false);
        const shown = [];
        try {
          await page.goto(url(false, '#/'), {waitUntil: 'load'});
          await page.evaluate(v => localStorage.setItem('atlas:godori-why', JSON.stringify(v)), seeds.map(s => s.rec));
          await page.goto(url(false, '#/why')); await page.reload(); await page.waitForSelector('.wy-rec', {timeout: 30000}); await sleep(2500);
          addScan(await scan(page, '기록 목록(한 달 지난 기록 있음)', {en: false}), 'KO');
          const before = await page.evaluate(() => [...document.querySelectorAll('#view .wy-rec')].map(rc => ({hdr: rc.querySelector('.wy-rh')?.textContent.replace(/\s+/g, ' ') ?? '', asks: !!rc.querySelector('.wy-kq'), q: rc.querySelector('.wy-kq')?.textContent ?? null, btns: [...rc.querySelectorAll('.wy-kb')].map(b => b.textContent), vals: rc.querySelectorAll('.wy-lv').length, note: rc.querySelector('.wy-later .note')?.textContent ?? null})));
          for (let i = 0; i < seeds.length; i++) {
            const b = before[i], s = seeds[i]; if (!b) { F(r, `${s.id}: 기록 줄이 안 보임`); continue; }
            const readyWant = 22 - (s.rec.score ?? 0); if (!new RegExp(`준비 ${readyWant} / 22`).test(b.hdr)) { const f5 = results.find(x => x.n === 5); const msg = `옛 기록 줄 ${s.id} 「${b.hdr.slice(0, 50)}」 에 「준비 ${readyWant} / 22」 없음(저장 점수 ${s.rec.score ?? 0})`; if (f5) F(f5, msg); else F(r, msg); }
            if (s.ask) {
              if (!b.asks) { F(r, `${s.id}: 한 달 지난 기록인데 「그날 정한 대로 했어?」를 먼저 묻지 않음 → 「${b.note ?? ''}」${s.late ? ' [가장자리: 달력으로 38일 · 스무 번째 장 날이 자료 밖 — 자료 끝 ' + lastD + ' · 오늘 ' + seoulDay(Date.now()) + ']' : ''}`); if (s.late) r.late = true; }
              else { if (b.q !== '그날 정한 대로 했어?') F(r, `${s.id}: 묻는 글 「${b.q}」`); if (JSON.stringify(b.btns) !== JSON.stringify(['했어', '안 했어'])) F(r, `${s.id}: 단추 ${JSON.stringify(b.btns)}`); if (b.vals) F(r, `${s.id}: 묻기 전에 값 ${b.vals}줄이 보임`); }
            } else if (b.asks || b.vals) F(r, `${s.id}: 한 달이 안 된 기록인데 물음/값이 보임`);
          }
          let nAns = 0;
          for (let i = 0; i < seeds.length; i++) {
            if (!before[i]?.asks) continue;
            const no = seeds[i].id.startsWith('S7');
            await page.click(`#view .wy-rec >> nth=${i} >> .wy-kb >> nth=${no ? 1 : 0}`); nAns++;
            await sleep(1500);
          }
          const after = await page.evaluate(() => [...document.querySelectorAll('#view .wy-rec')].map(rc => ({title: rc.querySelector('.wy-kd')?.textContent ?? null, rows: [...rc.querySelectorAll('.wy-lv')].map(p => p.textContent.replace(/\s+/g, ' ').trim()), q: !!rc.querySelector('.wy-kq')})));
          const num = x => (x == null ? null : Number(String(x).replace('−', '-').replace(/,/g, '')));
          const pctOf = t => { const m = /([+−-]?\d+(?:\.\d+)?)%/.exec(t); return m ? num(m[1]) : null; };
          const mdOf = t => { const m = /(\d{1,2})월 (\d{1,2})일/.exec(t); return m ? `${+m[1]}-${+m[2]}` : null; };
          const md = d => (d ? `${+d.slice(5, 7)}-${+d.slice(8, 10)}` : null);
          const close = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= tol;
          for (let i = 0; i < seeds.length; i++) {
            const e = exp[i], a = after[i], s = seeds[i]; if (!before[i]?.asks) { shown.push(`${s.id}: (묻지 않음)`); continue; }
            if (!a?.rows?.length) { F(r, `${s.id}: 답한 뒤 값 줄이 없음`); continue; }
            const [rc = '', rk = '', rm = ''] = a.rows;
            shown.push(`${s.id}: ${e.sD}→${e.eD} 회사 ${e.a ?? '?'}→${e.b ?? '?'} ${e.co?.toFixed(2) ?? '?'}% · 코스피 ${e.kospi?.toFixed(2) ?? '?'}% · 가운데 ${e.med ?? '?'}% ${e.medN ?? ''}곳 ⇒ 화면: ${rc} / ${rk} / ${rm}`);
            const [Lp, Rp = ''] = rc.split('→'), pA = /([\d,]+)원/.exec(Lp), pB = /([\d,]+)원/.exec(Rp), qA = /종가 \?/.test(Lp), qB = /종가 \?/.test(Rp), tailQ = /·\s*\?\s*$/.test(rc.trim());
            if (e.sD && e.eD && !(mdOf(Lp) === md(e.sD) && mdOf(Rp) === md(e.eD))) F(r, `${s.id}: 화면 날짜 ${mdOf(Lp)} → ${mdOf(Rp)} ≠ 내 셈 ${md(e.sD)} → ${md(e.eD)}`);
            if (!e.eD) { if (!(qB && tailQ && /\?/.test(rk) && /\?/.test(rm))) F(r, `${s.id}: 스무 번째 장 날이 자료에 없는데 「?」가 모자람 — ${a.rows.join(' / ')}`); }
            else {
              if (e.a == null) { if (!(qA && !pA)) F(r, `${s.id}: 그날 종가가 없는데 「?」 아님 — ${rc}`); } else if (!pA || num(pA[1]) !== e.a) F(r, `${s.id}: 그날 종가 화면 ${pA?.[1] ?? (qA ? '?' : '없음')} ≠ ${e.a}`);
              if (e.b == null) { if (!(qB && !pB)) F(r, `${s.id}: 스무 번째 날 종가가 없는데 「?」 아님 — ${rc}`); } else if (!pB || num(pB[1]) !== e.b) F(r, `${s.id}: 스무 번째 날 종가 화면 ${pB?.[1] ?? (qB ? '?' : '없음')} ≠ ${e.b}`);
              const pc = pctOf(Rp.split('·').pop() ?? '');
              if (e.co == null) { if (!(tailQ && pc == null)) F(r, `${s.id}: 회사 오름 %가 없는데 「?」 아님 — ${rc}`); } else if (!close(pc, e.co, 0.06)) F(r, `${s.id}: 회사 오름 화면 ${pc}% ≠ 내 셈 ${e.co.toFixed(2)}%`);
              const pk = pctOf(rk); if (e.kospi == null) { if (!(/\?/.test(rk) && pk == null)) F(r, `${s.id}: 코스피 값이 없는데 「?」 아님 — ${rk}`); } else if (!close(pk, e.kospi, 0.06)) F(r, `${s.id}: 코스피 화면 ${pk}% ≠ 내 셈 ${e.kospi.toFixed(2)}%`);
              const pm = pctOf(rm), nm = /([\d,]+)곳/.exec(rm);
              if (e.med == null) { if (!(/\?/.test(rm) && pm == null)) F(r, `${s.id}: 가운데 값이 없는데 「?」 아님 — ${rm}`); }
              else { if (!close(pm, e.med, 0.06)) F(r, `${s.id}: 모든 회사 가운데 값 화면 ${pm}% ≠ median20.json ${e.med}%`); if (e.myMed != null && !close(pm, e.myMed, 0.06)) F(r, `${s.id}: 가운데 값 화면 ${pm}% ≠ 회사 파일로 다시 셈 ${e.myMed.toFixed(2)}%`); if (nm && num(nm[1]) !== e.medN) F(r, `${s.id}: 곳 수 화면 ${nm[1]} ≠ median20.json ${e.medN}`); }
            }
            if (a.q) F(r, `${s.id}: 답한 뒤에도 물음이 남음`);
          }
          const st1 = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas:godori-why') || '[]'));
          await page.reload(); await page.waitForSelector('.wy-rec', {timeout: 30000}); await sleep(2500);
          const re = await page.evaluate(() => [...document.querySelectorAll('#view .wy-rec')].map(rc => ({asks: !!rc.querySelector('.wy-kq'), vals: rc.querySelectorAll('.wy-lv').length})));
          const keptN = st1.filter(x => x.kept?.a).length;
          if (st1.length !== seeds.length) F(r, `기록 수 ${seeds.length} → ${st1.length}(지워지거나 늘어남)`);
          if (keptN !== nAns) F(r, `저장된 「했어/안 했어」 ${keptN}건 ≠ 누른 ${nAns}건`);
          if (st1.find(x => x.at === '2026-09-02T07:00:00.000Z')?.kept?.a !== 'no') F(r, 'S7 「안 했어」가 저장되지 않음');
          for (let i = 0; i < seeds.length; i++) if (before[i]?.asks && (re[i]?.asks || !re[i]?.vals)) F(r, `${seeds[i].id}: 다시 열었더니 물음 ${re[i]?.asks} · 값 ${re[i]?.vals}줄`);
          r.reload = {kept: keptN, recs: st1.length};
        } catch (e) { F(r, '화면 길 오류 ' + String(e).slice(0, 200)); }
        await ctx.close();
        r.measured = `기록 ${seeds.length}건(한 달 지난 7 + 한 달 안 된 2) · 자료 끝 ${lastD} · 모든 회사 ${nFiles}개 다시 셈(median20.json 과 맞대) · 답 ${r.reload?.kept ?? '?'}건 저장 · 다시 열면 물음 없이 값 · 예) ${shown.slice(0, 2).join(' ;; ')}`;
        r.shown = shown;
      }
    }

    /* ───── 항목 8 : 친구가 연 쪽 ───── */
    const friend = async en => {
      const tag = en ? 'EN' : 'KO'; const {ctx, page} = await newCtx(en); const o = {tag};
      try {
        const msg = Buffer.from('이거 어때?', 'utf8').toString('base64url');
        await page.goto(url(en, `#/s/005930/2026-10-13/234000/s/${msg}`), {waitUntil: 'load'}); await page.waitForSelector('.wy-opt', {timeout: 30000}); await sleep(en ? 600 : 300);
        o.geo = await page.evaluate(() => {
          const q = document.querySelector('#view .wy-q'), opts = document.querySelector('#view .wy-opts'), vals = document.querySelector('#view .ps-vals'), tabs = document.querySelector('.tabs'), name = document.querySelector('#view .ps-name'), nav = document.querySelector('#view .wy-nav');
          const T = el => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null), B = el => (el ? Math.round(el.getBoundingClientRect().bottom + scrollY) : null);
          return {vh: innerHeight, qTop: T(q), qBottom: B(q), optsTop: T(opts), optsBottom: B(opts), navBottom: B(nav), valsTop: T(vals), valsH: vals ? Math.round(vals.getBoundingClientRect().height) : null, tabsTop: tabs ? Math.round(tabs.getBoundingClientRect().top) : null, nameTop: T(name), order: vals && q ? !!(q.compareDocumentPosition(vals) & Node.DOCUMENT_POSITION_FOLLOWING) : null, scrollY: Math.round(scrollY),
            before: (document.querySelector('#view')?.innerText ?? '').includes('이거 어때?')};
        });
        addScan(await scan(page, '친구 쪽 첫 장', {en}), tag);
        const c0 = await clicks(page);
        if (await page.$('#view .wy-go')) { await page.click('#view .wy-go'); await page.waitForSelector('.wy-opt', {timeout: 25000}); await settle(page, en); } // order-1011 — 친구 쪽 칸도 시작 화면부터
        for (let q = 0; q < 11; q++) await answer(page, Math.max(0, OWN[q].a.findIndex(a => a[0] === 'g')), en);
        o.taps = (await clicks(page)) - c0;
        o.afterAnswers = await page.evaluate(() => { const v = document.querySelector('#view'); const vals = v.querySelector('.ps-vals'), step = v.querySelector('.wy-step'); return {hasTwo: !!step && /두 줄|two lines|Last two/i.test(step.textContent), valsTop: vals ? Math.round(vals.getBoundingClientRect().top + scrollY) : null, stepTop: step ? Math.round(step.getBoundingClientRect().top + scrollY) : null}; });
        const c1 = await clicks(page); if (!(await page.$('#view .wy-verdict'))) { await page.click('.wy-chip >> nth=0'); await page.click('.wy-next'); } await page.waitForSelector('.wy-verdict', {timeout: 20000}); await sleep(en ? 500 : 250); // order-1011 — 두 줄 없으면 바로 결과
        o.lastTaps = (await clicks(page)) - c1;
        o.end = await page.evaluate(() => { const v = document.querySelector('#view'); const t = v.innerText; const note = [...v.querySelectorAll('*')].find(e => e.children.length === 0 && /이거 어때\?/.test(e.textContent)); const vals = v.querySelector('.ps-vals'), res = v.querySelector('.wy-res'); return {sender: !!note, senderTop: note ? Math.round(note.getBoundingClientRect().top + scrollY) : null, valsTop: vals ? Math.round(vals.getBoundingClientRect().top + scrollY) : null, resTop: res ? Math.round(res.getBoundingClientRect().top + scrollY) : null, snippet: t.replace(/\s+/g, ' ').slice(0, 200)}; });
        addScan(await scan(page, '친구 쪽 결과', {en, all: false}), tag);
      } catch (e) { o.err = String(e).slice(0, 300); }
      await ctx.close();
      return o;
    };
    let FR = null, FRen = null;
    if (want(8) || want(10) || want(9)) { log('친구 쪽 KO'); FR = await friend(false); }
    if (want(8)) {
      const r = R(8, '친구가 연 쪽', '[5] 10 친구가 연 쪽에서는 질문을 맨 위로 · 값 칸(422px)은 질문 뒤로');
      if (FR?.err || !FR?.geo) F(r, '친구 쪽을 못 엶 ' + FR?.err);
      else {
        const g = FR.geo; const firstScreen = g.qBottom != null && g.qBottom <= g.vh, optsHidden = g.tabsTop != null && g.optsBottom > g.tabsTop;
        if (!g.order) F(r, '값 칸(.ps-vals)이 질문보다 앞에 있음');
        if (!(g.valsTop > g.optsBottom)) F(r, `값 칸 위끝 ${g.valsTop} ≤ 질문 답 아래끝 ${g.optsBottom}`);
        if (!firstScreen) F(r, `첫 질문 제목 아래끝 ${g.qBottom}px 가 첫 화면(${g.vh}px) 밖`);
        if (g.before) F(r, '질문 답하기 전에 보낸 사람 말(이거 어때?)이 보임');
        if (FR.taps !== 11) F(r, `친구 쪽 질문 11개 누름 ${FR.taps}번(11번이어야 함)`);
        if (FR.end && FR.end.sender === false) N(r, '다 답한 뒤에도 보낸 사람 말이 화면에 안 보임');
        if (FR.end?.sender && FR.end.valsTop != null && !(FR.end.senderTop < FR.end.valsTop)) F(r, `보낸 사람 말(${FR.end.senderTop})이 값 칸(${FR.end.valsTop}) 뒤`);
        r.measured = `질문 제목 위끝 ${g.qTop}px(첫 화면 ${g.vh}px 안: ${firstScreen}) · 답 셋 ${g.optsTop}~${g.optsBottom}px(아래 탭 위끝 ${g.tabsTop}px ${optsHidden ? '→ 셋째 답이 탭에 가림' : '안 가림'}) · 값 칸 위끝 ${g.valsTop}px 높이 ${g.valsH}px(사장님 422px) · 질문 → 값 칸 순서 ${g.order} · 답하기 전 보낸 사람 말 ${g.before ? '보임' : '숨김'} · 질문 11개 누름 ${FR.taps}번 + 마지막 ${FR.lastTaps}번`;
        if (optsHidden) N(r, `첫 화면에서 셋째 답 아래끝 ${g.optsBottom}px > 아래 탭 위끝 ${g.tabsTop}px(스크롤 필요)`);
      }
    }

    /* ───── 영어 판 ───── */
    if (!NO_EN && (want(1) || want(3) || want(4) || want(9) || want(10) || want(7) || want(8))) {
      log('EN 초록 길'); ENF = await flowMain(true);
      log('EN 판정 둘 + 고도리 칸');
      const {ctx, page} = await newCtx(true);
      try {
        let first = true;
        for (const name of ['Y6', 'Q4a']) {
          await runVector(page, true, vec[name], {first}); first = false;
          const sc = await scan(page, 'result ' + name, {en: true, all: true}); addScan(sc, 'EN');
          if (name === 'Q4a') for (const where of ['#/', '#/gdr']) { await page.evaluate(h => { location.hash = h; }, where); await page.waitForSelector('section[aria-label]', {timeout: 30000}).catch(() => null); await sleep(1500); addScan(await scan(page, 'gdr-closed ' + where, {en: true}), 'EN'); }
        }
        /* 영어 · 한 달 지난 기록 */
        const mk = (code, name, day, price) => ({at: new Date(`${day}T15:00:00+09:00`).toISOString(), asOf: day, code, name, price, day, answers: pickIdx('ggggggggggg'), score: 0, reds: 0, verdict: VERDICT.go, groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, bigDay: null, why: 'profit fell', promise: {sell: Math.floor(price * 0.9), half: Math.floor(price * 1.2), text: 'If it drops below 234,900 won I sell all.'}, picks: []});
        await page.evaluate(v => localStorage.setItem('atlas:godori-why', JSON.stringify(v)), [mk('005930', '삼성전자', '2026-09-01', 261000), mk('005930', '삼성전자', '2026-05-04', 232500)]);
        await page.evaluate(() => { location.hash = '#/shorts'; }); await sleep(300); await page.goto(url(true, '#/why')); await page.reload(); await page.waitForSelector('.wy-rec', {timeout: 30000}); await sleep(2500);
        addScan(await scan(page, 'records(old, asking)', {en: true}), 'EN');
        await page.click('#view .wy-rec >> nth=0 >> .wy-kb >> nth=0'); await sleep(1800); await page.click('#view .wy-rec >> nth=1 >> .wy-kb >> nth=1'); await sleep(1800);
        addScan(await scan(page, 'records(old, values)', {en: true}), 'EN');
        ENF.oldRec = await page.evaluate(() => [...document.querySelectorAll('#view .wy-rec .wy-later')].map(e => e.innerText.replace(/\s+/g, ' ')));
      } catch (e) { ENF.err2 = String(e).slice(0, 300); }
      await ctx.close();
      log('친구 쪽 EN'); FRen = await friend(true);
      const r4 = results.find(x => x.n === 4); if (r4 && ENF) { const eb = ENF.backs.map(b => b.backs.map(x => x.t).join('|')); if (new Set(eb).size !== 1 || eb[0] !== '‹ Previous question') F(r4, `영어 판 뒤로 단추 ${JSON.stringify([...new Set(eb)])} (사전 ‹ Previous question)`); r4.measured += ` · 영어 판 11장 모두 「${eb[0]}」`; }
    }

    /* ───── 항목 9 ───── */
    if (want(9)) {
      const r = R(9, '색 점 읽어 주기 · 눌리는 것', '[9] 8 점마다 「위험」 같은 글 · 단추는 단추로');
      const colored = agg.dots.filter(d => d.colored);
      const mine = colored.filter(d => d.mine), others = colored.filter(d => !d.mine);
      const dotsM = mine.filter(d => d.kind === 'dot'), barsM = mine.filter(d => d.kind === 'bar' && !d.totalBar), totalBars = mine.filter(d => d.totalBar);
      const uniq = (arr, f) => { const m = new Map(); for (const x of arr) if (!m.has(f(x))) m.set(f(x), x); return [...m.values()]; };
      const noLab = [...dotsM, ...barsM].filter(d => !d.lab), mism = [...dotsM, ...barsM].filter(d => d.lab && ['좋음', '주의', '위험'].includes(d.toneC) && d.lab !== d.toneC);
      for (const d of uniq(noLab, d => d.sel + d.at)) F(r, `읽어 주는 글 없는 ${d.kind === 'bar' ? '막대' : '색 점'} ${d.sel} ${d.color} (${d.at})`);
      for (const d of uniq(mism, d => d.sel + d.lab + d.toneC)) F(r, `색과 글이 다름 ${d.sel} 색 ${d.toneC} 글 ${d.lab} (${d.at})`);
      const aria = dotsM.filter(d => d.ariaHidden); for (const d of uniq(aria, d => d.sel)) F(r, `색 점이 화면 읽기에서 가려짐(aria-hidden) ${d.sel} (${d.at})`);
      const bad = [...agg.taps.values()].filter(t => !t.why.every(w => w === 'listener(container)'));
      for (const t of bad) F(r, `단추·링크 아닌데 눌리는 것 ${t.tag} ${t.sel} 「${t.t}」 ${t.why.join(',')} (${t.at.join(' ')})`);
      const cont = [...agg.taps.values()].filter(t => t.why.every(w => w === 'listener(container)'));
      if (cont.length) N(r, `바깥 칸에 눌림 귀(위임) ${cont.map(c => c.sel).join(' ; ')}`);
      if (totalBars.length) N(r, `큰 막대(전체 준비) ${uniq(totalBars, d => d.at).length}장: 막대에는 읽어 주는 글 없음 · 숫자 「준비 n / 22」 + 판정 글이 같은 뜻을 읽어 줌`);
      for (const d of uniq(others, d => d.sel)) N(r, `매매일지 점이 아닌 색 점 ${d.sel} ${d.color}: 그림 설명 줄의 표시(「끝 점 = 오늘 값」) · 읽는 글은 설명 줄에 있음 (${d.at})`);
      const neutral = agg.dots.filter(d => !d.colored && /wy-dot/.test(d.cls));
      const lst = []; // 기록 목록 줄의 목록 역할(메모)
      if (agg.minPx != null) N(r, `재는 기구 점검: 눌림 귀 등록 ${agg.listenerN}개 · 화면 안 단추·링크·입력 ${agg.nativeN}개 · 가장 작은 글 ${agg.minPx}px`);
      if (agg.lists) N(r, `기록 목록 줄 ${agg.lists.rows}개의 목록 역할: ul/ol ${agg.lists.ul} · li ${agg.lists.li} · role=list ${agg.lists.roleList} · role=listitem ${agg.lists.roleItem}`);
      void lst;
      r.measured = `훑은 화면 ${agg.screens.length}장 · 매매일지 색 점 ${dotsM.length}개 + 묶음 막대 ${barsM.length}개 → 읽어 주는 글 없음 ${noLab.length} · 색≠글 ${mism.length} · aria-hidden ${aria.length} · 빈 테두리(고르기 전) 점 ${neutral.length}개는 가림 · 단추·링크 아닌데 눌리는 것 ${bad.length}개`;
    }

    /* ───── 항목 10 ───── */
    if (want(10)) {
      const r = R(10, '글씨 17px · 말 · 영어', '[10] 5 17px 아래 글 0 · 「사라」「팔아라」 · 옛 낱말(갈래 · 몸값 · 20거래일 …) · 영어 판에 한국어 0');
      const sm = [...agg.small.values()];
      const smView = sm.filter(x => x.inView), smChrome = sm.filter(x => !x.inView);
      for (const x of smView) F(r, `17px 아래(화면 안) ${x.px}px 「${x.t}」 ${x.sel} ×${x.n} [${x.at.join(' ')}]`);
      for (const x of smChrome) F(r, `17px 아래(맨 위 · 아래 탭 · 맨 끝 줄) ${x.px}px 「${x.t}」 ${x.sel} ×${x.n} [${x.at.join(' ')}]`);
      const words = [...agg.words.values()];
      const strict = words.filter(w => w.strict), info = words.filter(w => !w.strict);
      const ownSay = new Set(OWN.map(o => o.say));
      for (const w of strict) { const own = w.proper && [...ownSay].some(s => w.t.includes(s) || s.includes(w.t)); if (own) N(r, `사장님 격언 안의 「${w.name}」(글자 그대로 · 격언 칸): 「${w.t}」`); else F(r, `쓰지 않을 말 「${w.name}」: 「${w.t}」 ${w.sel} [${w.at.join(' ')}]`); }
      for (const w of info) N(r, `거르는 말 목록 낱말 「${w.name}」 화면에 있음: 「${w.t}」(${w.proper ? '남의 글' : '사이트 글'}) [${w.at.join(' ')}]`);
      const hanRaw = [...agg.hangul.values()].filter(h => !h.proper), hanProper = [...agg.hangul.values()].filter(h => h.proper);
      for (const h of hanRaw) F(r, `영어 판 한국어 그대로 「${h.t}」 ${h.sel} ×${h.n} [${h.at.join(' ')}]`);
      for (const a of agg.attrs) F(r, `영어 판 속성에 한국어 ${a.k}=「${a.v}」 ${a.sel} (${a.at})`);
      if (hanProper.length) N(r, `영어 판에 남의 글(lang=ko · data-proper) 한국어 ${hanProper.length}종: ${hanProper.slice(0, 6).map(h => `「${h.t}」`).join(' ')}`);
      for (const o of agg.overflow) F(r, `옆으로 넘침 ${o}`);
      r.measured = `훑은 화면 ${agg.screens.length}장(한국어 360×640 · 영어 390×640 · 가장 작은 글 ${agg.minPx}px) · 17px 아래 글 화면 안 ${smView.length}종 · 맨 위/탭/맨 끝 ${smChrome.length}종 · 쓰지 않을 말 사이트 글 ${strict.filter(w => !w.proper).length}곳(사장님 격언 속 ${strict.filter(w => w.proper).length}곳) · 영어 판 번역 안 된 한국어 ${hanRaw.length}종 + 속성 ${agg.attrs.length}`;
    }

    /* ───── 보고 ───── */
    const bad = results.filter(r => !r.pass);
    const rep = {made: new Date().toISOString(), base: BASE, files: FILE_VER, secs: Math.round((Date.now() - t0) / 1000), results, ko: KO && {per: KO.per, stockTaps: KO.stockTaps, lastTaps: KO.lastTaps, totalTaps: KO.totalTaps, lat: KO.latMs}, en: ENF && {per: ENF.per, totalTaps: ENF.totalTaps, backs: ENF.backs.map(b => b.backs.map(x => x.t).join('|')), err: ENF.err ?? ENF.err2, oldRec: ENF.oldRec}, friend: {ko: FR, en: FRen}, errs: {ko: KO?.errs, en: ENF?.errs}, V2: Object.fromEntries(Object.entries(V2).filter(([k]) => k !== '__err').map(([k, v]) => [k, {o: v.o, n: v.res?.n, verdict: v.res?.verdict, run: v.run?.total, gdr: v.gdr && Object.fromEntries(Object.entries(v.gdr).map(([w, g]) => [w, g.txt]))}])), v2err: V2.__err};
    if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(rep, null, 1)); }
    console.log('\n항목 | 사장님 말씀 | 잰 것 | 결과');
    for (const r of results) { console.log(`${r.n} ${r.name} | ${r.ask} | ${r.measured} | ${r.pass ? 'PASS' : 'FAIL ' + r.fails.length}`); for (const f of r.fails) console.log('   - FAIL ' + f); for (const n of r.notes) console.log('   · ' + n); }
    console.log(`\n실패 항목 ${bad.length}/${results.length} · ${rep.secs}초 · 잰 파일 ${JSON.stringify(FILE_VER)}`);
    return bad.length ? 1 : 0;
  } catch (e) { console.error('VJ 오류', e); return 3; }
  finally { await browser.close().catch(() => null); }
})();
process.exit(exitCode);

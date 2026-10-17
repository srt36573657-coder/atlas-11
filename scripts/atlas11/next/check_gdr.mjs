// 고도리 칸 맞대기 — 다섯 문으로 거른 곳 · 나눠 담는 비중(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 7 ~ 12 · 14)
//   쓰는 법: node scripts/atlas11/next/check_gdr.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all]
//     --all = 네 판 모두에서 모든 칸을 눌러 카드를 맞대고 돈 바꾸기도(기본 = 앞 두 판만 · 뒤 두 판은 처음 · 가운데 · 끝 칸) — 다른 쪽 검사처럼 --limit N 도 받음(기본과 같음)
//   기준 = 시험 서버의 /next/data/gdr.json(고르는 셈 pick.mjs 는 쓰지 않음) + 결정표(docs/design/godori-2026-10-17/brief.md 「고르는 셈 결정표 gdr-v1」 ·
//          사장님 원문 명령 7 · 10 · 11 — 비중 3 · 2.5 · 2 · 쉬는 돈 · 한 업종 합 9 · 팔 선 × 0.9 · 절반 팔 선 × 1.2 · 격언은 원문 열한 개를 번호 차례로) · 이름은 rename.mjs(brand.js 한 곳)
//   ① 자료 — 번호 차례 · 비중 · 쉬는 돈 = 100 − 비중 합 · 한 업종 세 곳 · 합 9 이하 · inds · 팔 선 · 절반 팔 선(원 아래 버림) · 격언 · 이름 · 업종(mkt.json) ·
//      종가(co/<번호>.json · 같은 날일 때) · 이유 한 줄의 영업이익 · 기준 숫자(rules = 결정표) · 수끼리(회사 = 먼저 뺀 곳 + 남은 곳 · 고른 곳 = 칸 수 ≤ 다섯 문 통과)
//   ② 두 폭(360×640 · 390×844) × 두 곳(첫 화면 #/ · #/gdr) — 칸 수 = 고른 곳 + 쉬는 돈 · 칸마다 높이 48px 넘게 · 「n번」 · 이름 · 비중이 칸 안에 · 처음엔 닫힘 ·
//      누르면 그 카드(번호 · 이름 고리 · 업종 · 이유 한 줄 · 비중 · 금액 · 팔 선 · 절반 팔 선 · 「나라면」 줄 · 격언 data-proper) · 다시 누르면 닫힘 · 관리 종목 「?」 줄 · 모자란 대로 줄
//   ③ 금액 = floor(내 돈 × 비중 ÷ 100) — 처음 10,000,000원 · 다른 돈을 넣은 뒤(카드 셋) · 「비중 합 100%」 · 담는 돈 · 쉬는 돈 · 다시 열어도 그 돈(atlas:godori-money) ·
//      1만 원 밑은 처음 돈 · 아주 큰 돈에도 넘침 0
//   ④ #/gdr/<번호> = 그 카드가 열리고 화면 안에 보임 · 없는 번호 · 글자는 닫힌 채 · 첫 화면 「어떻게 골랐나 보기 ›」 → #/gdr
//   ⑤ 어떻게 골랐나 — 깔때기 수 = gdr.json counts(관리 종목 null → 「? 아직 못 거름」) · 다섯 문 이름 = 원문 명령 7 · 기준 숫자 = rules
//   ⑥ 자료를 바꾼 길 — gdr.json 못 받음(「?」 줄 · 칸 없음) · 서른여섯 곳(칸 서른일곱 · 바둑판 아님 · 관리 종목 수 있음) · 기억 못 하는 기계(localStorage 막힘)
//   ⑦ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · 캔버스 0 · 쓰지 않을 말 0(남의 글 data-proper 밖 · 이름표 글 포함) · 화면 오류 0
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // run_all.mjs 는 PW_DIR 로도 넘김
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all');
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = x => JSON.parse(JSON.stringify(x));

/* 기준 — 결정표(brief.md): 사장님 원문 격언 열한 개 · 다섯 문 이름 · gdr.json 꼴의 기준 숫자(rules) */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const SAYINGS = [];
for (const line of ((BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0] ?? '').split('\n')) { const m = /^(\d{1,2}) .+? -(.+)$/u.exec(line.trim()); if (m) SAYINGS.push(m[2].trim()); }
const GATES = ((/다섯 문으로 걸러라: ([^\n]+?)\n/.exec(BRIEF) || [])[1] ?? '').split(' · ').map(s => s.trim()).filter(Boolean);
const RULES = (() => { try { return JSON.parse((/"rules": (\{[^}]*\})/.exec(BRIEF) || [])[1]); } catch { return null; } })();
if (SAYINGS.length !== 11 || GATES.length !== 5 || !RULES) { console.error('결정표(brief.md)에서 격언 · 다섯 문 · 기준 숫자를 못 읽음', SAYINGS.length, GATES.length, RULES); process.exit(1); }
const BANNED = ['추천', '매수', '매도', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사세요', '사라', '파세요']; // brief.md 「쓰지 않을 말」(남의 글 data-proper 밖)
const KEY = 'atlas:godori-money', BASE = 10000000;

/* 자료(시험 서버에서) */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [G, MKT] = await Promise.all(['/next/data/gdr.json', '/atlas/data/mkt.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!G || !Array.isArray(G.picks) || !MKT) { console.log(JSON.stringify({counts, fails}, null, 1)); process.exit(1); }

/* 글 꼴(화면과 같은 꼴 — 셈은 정수로 따로) */
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const won = n => comma(n) + '원';
const wTxt = w => (Number.isInteger(w) ? String(w) : w.toFixed(1)) + '%';
const w10 = w => Math.round(w * 10); // 비중 × 10(정수 — 2.5 → 25)
const amt = (money, w) => Number(BigInt(money) * BigInt(w10(w)) / 1000n); // floor(내 돈 × 비중 ÷ 100) — 정수로 정확히
const nTxt = x => (x == null ? '?' : comma(x));
const mdTxt = d => { const p = String(d ?? '').split('-'); return p.length === 3 ? `${+p[1]}월 ${+p[2]}일` : '?'; };

const STALE = G.asOf < MKT.asOf; // 고른 날(거래량이 있는 모음 날)이 사이트 자료 날보다 앞섬 — 화면이 밝혀야 함(checkHead)
/* ① 자료 — 결정표대로인지(만든 일꾼과 따로) */
{
  const P = G.picks, C = G.counts ?? {};
  if (G.schema !== 'godori-gdr-1') fail('자료 꼴', G.schema);
  if (G.base !== BASE) fail('기본 돈', G.base);
  const keySorted = o => (o && typeof o === 'object' && !Array.isArray(o) ? Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))) : o);
  if (!eq(keySorted(G.rules), keySorted(RULES))) fail('기준 숫자(rules ≠ 결정표)', JSON.stringify(G.rules));
  if (!eq(G.sayings, SAYINGS)) fail('격언 열한 개(원문 차례 · 글자)', JSON.stringify(G.sayings).slice(0, 200));
  if (G.asOf > MKT.asOf) fail('자료 날짜', `gdr ${G.asOf} 가 사이트 ${MKT.asOf} 보다 새것`); // 고른 날이 사이트 자료보다 앞서면(거래량이 있는 모음 날로 고름) 화면이 「? 고른 날은 … 종가예요」로 밝혀야 함 — 아래 STALE
  if (P.length > 36) fail('고른 곳 36 넘음', P.length);
  if (C.picked !== P.length) fail('고른 곳 수', `${C.picked} ≠ ${P.length}`);
  if (!(C.picked <= C.passAll && C.passAll <= Math.min(C.g1, C.g2, C.g3, C.g4, C.g5))) fail('다섯 문 수', JSON.stringify(C));
  if ([C.g1, C.g2, C.g3, C.g4, C.g5].some(g => !(g <= C.afterOut))) fail('문마다 수 > 남은 곳', JSON.stringify(C));
  if (C.companies !== C.outThin + C.outHalt + (C.managed ?? 0) + C.afterOut) fail('먼저 뺀 수 + 남은 곳 ≠ 회사 주식', JSON.stringify(C));
  if (!(C.companies <= C.listed)) fail('회사 주식 > 상장 종목', JSON.stringify(C));
  const sum10 = P.reduce((s, p) => s + w10(p.w), 0);
  if (w10(C.cash) !== 1000 - sum10) fail('쉬는 돈 = 100 − 비중 합', `${C.cash} · 비중 합 ${sum10 / 10}`);
  if (P.length === 36 && C.cash !== 10) fail('36곳이면 쉬는 돈 10', C.cash);
  const byInd = {};
  const sellK = w10(RULES.sell), halfK = w10(RULES.half);
  const cos = await Promise.all(P.map(p => getJ('/atlas/data/co/' + p.code + '.json').catch(() => null)));
  P.forEach((p, i) => {
    const at = `${p.no}번 ${p.name}`;
    if (p.no !== i + 1) fail('번호 차례', `${i + 1}째 = ${p.no}`);
    const wantW = p.no <= 12 ? 3 : p.no <= 24 ? 2.5 : 2;
    if (p.w !== wantW) fail('비중(1 ~ 12번 3 · 13 ~ 24번 2.5 · 25 ~ 36번 2)', `${at} ${p.w} ≠ ${wantW}`);
    const o = MKT.companies[p.code];
    if (!o) fail('회사 주식 밖 번호', at); else { if (o.n !== p.name) fail('이름(mkt.json)', `${at} ≠ ${o.n}`); if (o.i !== p.ind) fail('업종(mkt.json)', `${at} ${p.ind} ≠ ${o.i}`); }
    if (!(Number.isInteger(p.price) && p.price > 0)) fail('종가', `${at} ${p.price}`);
    else {
      if (p.sell !== Math.floor(p.price * sellK / 10)) fail('팔 선 = 종가 × 0.9(원 아래 버림)', `${at} ${p.sell} ≠ ${Math.floor(p.price * sellK / 10)}`);
      if (p.half !== Math.floor(p.price * halfK / 10)) fail('절반 팔 선 = 종가 × 1.2(원 아래 버림)', `${at} ${p.half} ≠ ${Math.floor(p.price * halfK / 10)}`);
      const c = cos[i]?.c; if (c?.priceDate === G.asOf) { if (c.price !== p.price) fail('종가(co 파일 같은 날)', `${at} ${p.price} ≠ ${c.price}`); else bump('맞댄 종가'); } else bump('종가 날이 달라 안 맞댐');
    }
    if (p.saying !== (p.no - 1) % 11) fail('격언 차례((번호 − 1) % 11)', `${at} ${p.saying}`);
    if (!String(p.reason ?? '').startsWith(`영업이익 ${p.g?.opPrev}억 → ${p.g?.opLast}억 · 석 달 `) || !/ · 석 달 [+-]\d+\.\d% · 업종 돈 \d+\.\d배$/.test(p.reason ?? '')) fail('이유 한 줄 꼴', `${at} 「${p.reason}」`);
    (byInd[p.ind] ??= []).push(p);
  });
  for (const [ind, xs] of Object.entries(byInd)) {
    if (xs.length > 3) fail('한 업종 세 곳까지', `${ind} ${xs.length}곳`);
    const s = xs.reduce((a, p) => a + w10(p.w), 0); if (s > 90) fail('한 업종 비중 합 9 이하', `${ind} ${s / 10}`);
    if (G.inds && w10(G.inds[ind] ?? -1) !== s) fail('inds(업종마다 비중 합)', `${ind} ${G.inds[ind]} ≠ ${s / 10}`);
  }
  if (G.inds && Object.keys(G.inds).length !== Object.keys(byInd).length) fail('inds 업종 수', Object.keys(G.inds).join(','));
  bump('맞댄 자료 곳', P.length);
}

/* 브라우저 — 한 번에 하나 · 판마다 새 칸(기억이 따로) */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** gdr = 바꿔 줄 gdr.json(404 = 못 받게) · store: 'ok' · 'throw'(localStorage 막힘) · allow = 일부러 못 받게 한 파일(그 404 는 오류로 안 셈) */
async function newPage(width, height, {gdr = null, store = 'ok', allow = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  if (gdr === 404) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}));
  else if (gdr) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(gdr)}));
  const p = await ctx.newPage(); p._errs = [];
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
const SEL = '#view section.gdr';
async function open(p, hash) {
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), SEL, {timeout: 30000});
}
async function go(p, hash) {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForFunction(([h, s]) => location.hash === h && !!document.querySelector(s) && !document.querySelector('#view .boot'), [hash, SEL], {timeout: 30000});
}

/* 화면에서 읽기(화면 안에서 돎) */
const READG = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const inside = (box, el) => { const a = box.getBoundingClientRect(), b = el.getBoundingClientRect(); return !b.width || (b.left >= a.left - 1 && b.right <= a.right + 1 && b.top >= a.top - 1 && b.bottom <= a.bottom + 1); };
  const cells = [...s.querySelectorAll('.gdr-cells > .gdr-cell')].map(c => { const r = c.getBoundingClientRect(); return {tag: c.tagName.toLowerCase(), cash: c.classList.contains('cash'), no: c.querySelector('.gdr-no')?.textContent ?? '', name: c.querySelector('.gdr-cn')?.textContent ?? null,
    proper: !!c.querySelector('.gdr-cn[data-proper]'), w: c.querySelector('.gdr-cw')?.textContent ?? '', h: r.height, wd: r.width, exp: c.getAttribute('aria-expanded'), on: c.classList.contains('on'), ctl: c.getAttribute('aria-controls'), in: [...c.children].every(k => inside(c, k))}; });
  const card = s.querySelector('.gdr-card'), cr = card?.getBoundingClientRect();
  return {h2: s.querySelector('.gdr-h')?.textContent ?? '', sub: s.querySelector('.gdr-sub')?.textContent ?? '', input: s.querySelector('input.gdr-in')?.value ?? null, cells, sum: s.querySelector('.gdr-sum')?.textContent ?? null,
    cards: s.querySelectorAll('.gdr-card').length,
    card: card ? {id: card.id, ch: card.querySelector('.gdr-ch')?.textContent ?? '', name: card.querySelector('a.gdr-name')?.textContent ?? '', href: card.querySelector('a.gdr-name')?.getAttribute('href') ?? '', proper: !!card.querySelector('a.gdr-name[data-proper]'),
      why: card.querySelector('.gdr-why')?.textContent ?? '', dl: [...card.querySelectorAll('.gdr-dl > div')].map(d => [d.querySelector('dt')?.textContent ?? '', d.querySelector('dd')?.textContent ?? '', inside(d, d.querySelector('dd') ?? d)]),
      me: card.querySelector('.gdr-me')?.textContent ?? '', say: card.querySelector('.gdr-say q[data-proper]')?.textContent ?? null, top: cr.top, bottom: cr.bottom, vh: innerHeight} : null,
    q: s.querySelector('.gdr-q')?.textContent ?? null, stale: s.querySelector('.gdr-stale')?.textContent ?? null, notes: [...s.querySelectorAll('.gdr-note, p.note')].map(x => x.textContent), more: s.querySelector('a.more')?.getAttribute('href') ?? null};
};
const READF = () => {
  const f = document.querySelector('#view section.gdr-fun'); if (!f) return null;
  return {rows: [...f.querySelectorAll('ol.gdr-ol > li')].map(li => [li.querySelector('span')?.textContent ?? '', li.querySelector('b')?.textContent ?? '']), rules: f.querySelector('ul.gdr-ul')?.textContent ?? ''};
};
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(남의 글 data-proper 밖 · 이름표 글 포함) · 바둑판(규칙 51 — 칸 배치 안 44px 이하 네모 20개 이상) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], squares: 0, missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const g of root.querySelectorAll('.gdr-cells')) out.squares = Math.max(out.squares, [...g.children].filter(k => { const r = k.getBoundingClientRect(); return r.width && r.width <= 44 && r.height <= 44; }).length);
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
async function layout(p, sel, tag) {
  const s = await p.evaluate(LAYOUT, sel); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag + ' ' + sel); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  if (s.squares >= 20) fail('바둑판(규칙 51 — 44px 이하 칸 20개 넘음)', `${tag}: ${s.squares}`);
  const T = s.text + '\n' + s.attrs.join('\n');
  for (const b of BANNED) if (T.includes(b)) fail('쓰지 않을 말', `${tag} 「${b}」`);
}

/* 맞대기 */
/** 칸 — 고른 곳 + 쉬는 돈 · 차례 · 「n번」 · 이름 · 비중 · 높이 48px · 칸 안 · 열린 칸(openNo) */
function checkCells(g, D, tag, openNo = null) {
  const P = D.picks, cash = D.counts?.cash ?? 0;
  if (g.cells.length !== P.length + 1) fail('칸 수 = 고른 곳 + 쉬는 돈', `${tag} ${g.cells.length} ≠ ${P.length} + 1`);
  P.forEach((p, i) => {
    const c = g.cells[i], at = `${tag} ${p.no}번`; if (!c) return;
    if (c.tag !== 'button' || c.cash) fail('칸 꼴(누르는 단추)', `${at} ${c.tag}`);
    if (c.no !== `${p.no}번`) fail('칸 번호(「n번」)', `${at} 「${c.no}」`);
    if (c.name !== p.name || !c.proper) fail('칸 이름(data-proper)', `${at} 「${c.name}」 ${c.proper}`);
    if (c.w !== wTxt(p.w)) fail('칸 비중', `${at} 「${c.w}」 ≠ ${wTxt(p.w)}`);
    if (c.h < 47.5) fail('칸 높이 48px 밑(규칙 51)', `${at} ${c.h.toFixed(1)}`);
    if (!c.in) fail('칸 글이 칸 밖', at);
    const open = openNo === p.no;
    if (c.exp !== String(open) || c.on !== open) fail('칸 열림 표시', `${at} aria-expanded=${c.exp} on=${c.on} · 기대 ${open}`);
    if (c.ctl !== 'gdr-' + p.no) fail('칸 aria-controls', `${at} ${c.ctl}`);
  });
  const last = g.cells[P.length];
  if (!last?.cash || last.no !== '쉬는 돈' || last.w !== wTxt(cash)) fail('쉬는 돈 칸', `${tag} ${JSON.stringify(last)}`);
  else if (last.h < 47.5) fail('칸 높이 48px 밑(규칙 51)', `${tag} 쉬는 돈 ${last.h.toFixed(1)}`);
  if ((g.cards > 0) !== (openNo != null)) fail('카드 수', `${tag} ${g.cards} · 열 번호 ${openNo}`);
  bump('맞댄 칸', g.cells.length);
}
/** 합 줄 — 「비중 합 100%」 · 담는 돈 · 쉬는 돈 */
function checkSum(g, D, money, tag) {
  const s = D.picks.reduce((a, p) => a + amt(money, p.w), 0), tot = (D.picks.reduce((a, p) => a + w10(p.w), 0) + w10(D.counts?.cash ?? 0)) / 10;
  if (tot !== 100) fail('자료 비중 합 ≠ 100', `${tag} ${tot}`);
  if (!String(g.sum).startsWith('비중 합 100%')) fail('합 줄 「비중 합 100%」', `${tag} 「${g.sum}」`);
  if (!String(g.sum).includes(`담는 돈 ${won(s)}`) || !String(g.sum).includes(`쉬는 돈 ${won(money - s)}`)) fail('합 줄 금액', `${tag} 「${g.sum}」 · 담는 돈 ${won(s)} · 쉬는 돈 ${won(money - s)}`);
  bump('맞댄 합 줄');
}
/** 카드 하나 — 결정표 명령 11(번호 · 업종 · 이유 · 비중 · 금액 · 팔 선 · 절반 팔 선 · 격언) · 「나라면」(명령 14) */
function checkCard(g, D, p, money, tag) {
  const c = g.card, at = `${tag} ${p.no}번 카드`, a = amt(money, p.w);
  if (!c) { fail('카드가 안 열림', at); return; }
  if (c.id !== 'gdr-' + p.no) fail('카드 번호(id)', `${at} ${c.id}`);
  if (c.ch !== `${p.no}번 ${p.name} · ${p.ind}`) fail('카드 머리(번호 · 이름 · 업종)', `${at} 「${c.ch}」`);
  if (c.href !== '#/w/' + encodeURIComponent(p.code) || !c.proper) fail('카드 이름 고리', `${at} ${c.href} ${c.proper}`);
  if (c.why !== p.reason) fail('이유 한 줄', `${at} 「${c.why}」`);
  const want = [['비중', wTxt(p.w)], ['금액', won(a)], ['팔 선', won(p.sell)], ['절반 팔 선', won(p.half)]];
  if (!eq(c.dl.map(([k, v]) => [k, v]), want)) fail('카드 숫자(비중 · 금액 · 팔 선 · 절반 팔 선)', `${at} ${JSON.stringify(c.dl.map(([k, v]) => [k, v]))} ≠ ${JSON.stringify(want)}`);
  for (const [k, , ok] of c.dl) if (!ok) fail('카드 숫자가 칸 밖', `${at} ${k}`);
  if (!c.me.startsWith('나라면 ') || ![won(money), won(a), won(p.price), won(p.sell), won(p.half)].every(x => c.me.includes(x))) fail('「나라면」 줄(명령 14)', `${at} 「${c.me}」`);
  if (c.say !== SAYINGS[(p.no - 1) % 11] || c.say !== D.sayings?.[p.saying]) fail('격언(원문 · 번호 차례 · data-proper)', `${at} 「${c.say}」`);
  bump('맞댄 카드');
}
/** 칸 하나 누르기(번호) → 맞댐 */
async function press(p, D, no, money, tag) {
  const i = D.picks.findIndex(x => x.no === no), cell = p.locator(SEL + ' button.gdr-cell').nth(i);
  if ((await cell.getAttribute('aria-expanded')) !== 'true') await cell.click({timeout: 8000}); // 이미 열린 칸은 누르지 않음(누르면 닫힘)
  const g = await p.evaluate(READG, SEL);
  checkCells(g, D, tag + ' 누름', g.card ? no : null); checkCard(g, D, D.picks[i], money, tag); checkSum(g, D, money, tag + ' 누름');
  return g;
}
/** 깔때기 — gdr.json counts · 다섯 문 이름(원문) · 기준 숫자 */
function checkFunnel(f, D, tag) {
  if (!f) { fail('「어떻게 골랐나」 없음', tag); return; }
  const C = D.counts ?? {}, R = D.rules ?? {};
  const want = [['상장', nTxt(C.listed) + '개'], ['회사 주식', nTxt(C.companies) + '곳'], ['거래가 너무 적', nTxt(C.outThin) + '곳'], ['거래가 멈춰', nTxt(C.outHalt) + '곳'],
    ['관리 종목', C.managed == null ? '? 아직 못 거름' : nTxt(C.managed) + '곳'], ['남은', nTxt(C.afterOut) + '곳'],
    ...GATES.map((n, i) => [n, nTxt(C['g' + (i + 1)]) + '곳']), ['다섯 문', nTxt(C.passAll) + '곳'], ['고른', nTxt(C.picked) + '곳'], ['쉬는 돈', wTxt(C.cash ?? 0)]];
  if (f.rows.length !== want.length) fail('깔때기 줄 수', `${tag} ${f.rows.length} ≠ ${want.length}`);
  want.forEach(([k, v], i) => { const r = f.rows[i]; if (!r || !r[0].includes(k) || r[1] !== v) fail('깔때기 수(gdr.json counts)', `${tag} ${i + 1}째 ${JSON.stringify(r)} ≠ 「${k}」 ${v}`); });
  for (const t of [`${comma(R.thin / 1e8)}억 원`, `${R.quietX}배`, `${R.hot5}%`, `${R.r60?.[0]} ~ ${R.r60?.[1]}%`, `${R.jump}%`, `${Math.round(R.keep * 100)}%`, `${R.low2x}배`, `${R.indX}배`, `${Math.round((1 - R.sell) * 100)}% 내린`, `${Math.round((R.half - 1) * 100)}% 오른`, '3%', '2.5%', '2%'])
    if (!f.rules.includes(t)) fail('기준 숫자 글', `${tag} 「${t}」 없음`);
  bump('맞댄 깔때기');
}
/** 첫 칸 · 열기 전 — 머리 · 날짜 · 돈 칸 · 관리 종목 「?」 줄 · 모자란 대로 줄 · 첫 화면 「어떻게 골랐나」 고리 */
function checkHead(g, D, money, tag, onHome) {
  if (!g) { fail(NEW_NAME + ' 칸 없음', tag); return; }
  if (!g.sub.startsWith(mdTxt(D.asOf) + ' 종가')) fail('칸 머리 날짜', `${tag} 「${g.sub}」`);
  if (STALE !== !!g.stale || (STALE && !(g.stale.startsWith('?') && g.stale.includes(mdTxt(D.asOf) + ' 종가') && g.stale.includes(mdTxt(MKT.asOf) + '까지')))) fail('고른 날 · 사이트 날 밝힘(고른 날이 앞설 때만)', `${tag} 「${g.stale}」 · 고른 ${D.asOf} · 사이트 ${MKT.asOf}`);
  if (g.input !== comma(money)) fail('돈 칸 글', `${tag} 「${g.input}」 ≠ ${comma(money)}`);
  const managedQ = D.counts?.managed == null;
  if (managedQ !== !!g.q?.startsWith('?')) fail('관리 종목 「?」 줄(managed null 일 때만)', `${tag} 「${g.q}」`);
  if ((D.picks.length < 36) !== g.notes.some(t => t.includes(`${D.picks.length}곳뿐`))) fail('모자란 대로 줄(36곳 밑일 때만)', `${tag} ${JSON.stringify(g.notes)}`);
  if (!g.notes.some(t => t.includes(NEW_NAME))) fail(`「${NEW_NAME} 생각」 줄`, tag);
  if (onHome ? g.more !== '#/gdr' : g.more != null) fail('「어떻게 골랐나 보기」 고리', `${tag} ${g.more}`);
}

/* ② ~ ⑤ 네 판 — 두 폭 × 두 곳 */
const COMBOS = [[360, 640, '#/'], [390, 844, '#/gdr'], [360, 640, '#/gdr'], [390, 844, '#/']];
let ci = 0;
for (const [w, h, hash] of COMBOS) {
  const tag = `${w}×${h} ${hash}`, full = ALL || ci < 2, p = await newPage(w, h), D = G, n = D.picks.length, home = hash === '#/';
  try {
    await open(p, hash);
    let g = await p.evaluate(READG, SEL);
    checkHead(g, D, BASE, tag, home); checkCells(g, D, tag); checkSum(g, D, BASE, tag);
    await layout(p, home ? SEL : '#view', tag + ' 처음');
    // 칸 누르기 — 모두(기본은 앞 두 판) 또는 처음 · 가운데 · 끝 · 마지막 칸을 한 번 더 누르면 닫힘
    const nos = full ? D.picks.map(x => x.no) : [...new Set([D.picks[0]?.no, D.picks[n >> 1]?.no, D.picks[n - 1]?.no])].filter(x => x != null);
    for (const no of nos) await press(p, D, no, BASE, tag);
    if (nos.length) {
      await layout(p, home ? SEL : '#view', tag + ' 카드 열림');
      await p.locator(SEL + ' button.gdr-cell').nth(D.picks.findIndex(x => x.no === nos[nos.length - 1])).click();
      g = await p.evaluate(READG, SEL); checkCells(g, D, tag + ' 다시 누름(닫힘)');
    }
    if (full) { // 돈 바꾸기 — 다른 돈 · 다시 열기 · 1만 원 밑 · 아주 큰 돈
      const three = [...new Set([D.picks[0]?.no, D.picks[n >> 1]?.no, D.picks[n - 1]?.no])].filter(x => x != null);
      const inp = p.locator(SEL + ' input.gdr-in');
      for (const [typed, money] of [['7,777,777', 7777777], ['12345678901', 12345678901], ['5000', BASE], ['3,000,000', 3000000]]) {
        await inp.fill(typed);
        g = await p.evaluate(READG, SEL); checkSum(g, D, money, `${tag} 돈 「${typed}」`);
        for (const no of three) await press(p, D, no, money, `${tag} 돈 「${typed}」`);
        const kept = await p.evaluate(k => { try { return localStorage.getItem(k); } catch { return '?'; } }, KEY);
        if (kept !== String(money)) fail('내 돈 기억(atlas:godori-money)', `${tag} 「${typed}」 → ${kept} ≠ ${money}`);
        await inp.evaluate(e => e.blur()); g = await p.evaluate(READG, SEL);
        if (g.input !== comma(money)) fail('돈 칸 글(손 뗀 뒤)', `${tag} 「${typed}」 → 「${g.input}」 ≠ ${comma(money)}`);
        if (money === 12345678901) await layout(p, home ? SEL : '#view', `${tag} 아주 큰 돈 카드 열림`);
        bump('돈 바꾼 길');
      }
      await p.reload({waitUntil: 'domcontentloaded'}); await p.waitForFunction(s => !!document.querySelector(s + ' input.gdr-in') && !document.querySelector('#view .boot'), SEL, {timeout: 30000});
      g = await p.evaluate(READG, SEL); checkHead(g, D, 3000000, tag + ' 다시 엶', home); checkSum(g, D, 3000000, tag + ' 다시 엶');
      if (D.picks[0]) await press(p, D, D.picks[0].no, 3000000, tag + ' 다시 엶');
    }
    if (home) { // 첫 화면 「어떻게 골랐나 보기 ›」 → #/gdr · 깔때기
      await p.locator(SEL + ' a.more').click({timeout: 8000});
      await p.waitForFunction(() => location.hash === '#/gdr' && !!document.querySelector('#view section.gdr-fun'), null, {timeout: 30000}).catch(() => fail('「어떻게 골랐나 보기」 → #/gdr', tag));
    }
    checkFunnel(await p.evaluate(READF), D, tag);
    await layout(p, '#view', tag + ' #/gdr 깔때기');
    // #/gdr/<번호> — 그 카드가 열리고 화면 안 · 없는 번호 · 글자
    const mid = D.picks[n >> 1];
    if (mid) {
      await go(p, '#/gdr/' + mid.no); await p.waitForTimeout(350);
      g = await p.evaluate(READG, SEL);
      const money = full ? 3000000 : BASE;
      checkCells(g, D, `${tag} #/gdr/${mid.no}`, mid.no); checkCard(g, D, mid, money, `${tag} #/gdr/${mid.no}`);
      if (g.card && !(g.card.bottom > 0 && g.card.top < g.card.vh)) fail('#/gdr/<번호> 카드가 화면 밖', `${tag} ${Math.round(g.card.top)}~${Math.round(g.card.bottom)} / ${g.card.vh}`);
      await layout(p, '#view', `${tag} #/gdr/${mid.no}`);
    }
    for (const bad of ['999', 'x1']) { await go(p, '#/gdr/' + bad); g = await p.evaluate(READG, SEL); checkCells(g, D, `${tag} #/gdr/${bad}`, null); bump('없는 번호'); }
    errsOf(p, tag);
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close(); ci++;
}

/* ⑥ 자료를 바꾼 길 */
// 서른여섯 곳 — 업종마다 세 곳 · 이름이 긴 회사부터(칸 글 넘침 시험) · 관리 종목 수가 있음(「?」 줄 없음 · 깔때기 「0곳」)
const S36 = (() => {
  const D = clone(G), per = {}, picks = [];
  const cos = Object.entries(MKT.companies).filter(([, o]) => o?.n && o?.i).sort((a, b) => b[1].n.length - a[1].n.length || (a[0] < b[0] ? -1 : 1));
  for (const [code, o] of cos) {
    if (picks.length >= 36) break; if ((per[o.i] = (per[o.i] || 0) + 1) > 3) continue;
    const no = picks.length + 1, w = no <= 12 ? 3 : no <= 24 ? 2.5 : 2, price = 1000 + no * 12345;
    picks.push({no, code, name: o.n, ind: o.i, w, price, sell: Math.floor(price * 9 / 10), half: Math.floor(price * 12 / 10), reason: `영업이익 ${100 + no}억 → ${300 + no}억 · 석 달 +${5 + no % 30}.0% · 업종 돈 1.${1 + no % 9}배`, saying: (no - 1) % 11, g: {}});
  }
  D.picks = picks; D.inds = {}; for (const x of picks) D.inds[x.ind] = (w10(D.inds[x.ind] ?? 0) + w10(x.w)) / 10;
  Object.assign(D.counts, {managed: 0, passAll: 40, picked: 36, cash: 10, g1: Math.max(40, D.counts.g1), g2: Math.max(40, D.counts.g2), g3: Math.max(40, D.counts.g3), g4: Math.max(40, D.counts.g4), g5: Math.max(40, D.counts.g5)});
  return D;
})();
for (const [tag, w, h, hash, o, D] of [
  ['서른여섯 곳', 360, 640, '#/', {gdr: S36}, S36],
  ['서른여섯 곳', 390, 844, '#/gdr', {gdr: S36}, S36],
  ['기억 못 하는 기계', 360, 640, '#/gdr', {store: 'throw'}, G],
]) {
  const T = `${tag} ${w}×${h} ${hash}`, p = await newPage(w, h, o), home = hash === '#/';
  try {
    await open(p, hash);
    let g = await p.evaluate(READG, SEL);
    checkHead(g, D, BASE, T, home); checkCells(g, D, T); checkSum(g, D, BASE, T);
    await layout(p, home ? SEL : '#view', T);
    const last = D.picks[D.picks.length - 1];
    if (last) { await press(p, D, last.no, BASE, T); await layout(p, home ? SEL : '#view', T + ' 끝 칸 열림'); }
    await p.locator(SEL + ' input.gdr-in').fill('3,333,333');
    g = await p.evaluate(READG, SEL); checkSum(g, D, 3333333, T + ' 돈 바꿈');
    if (D.picks[0]) await press(p, D, D.picks[0].no, 3333333, T + ' 돈 바꿈');
    if (!home) { checkFunnel(await p.evaluate(READF), D, T); await layout(p, '#view', T + ' 깔때기'); }
    errsOf(p, T); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
// gdr.json 못 받음 — 칸은 「?」 줄 하나 · 칸 · 돈 칸 · 깔때기 없음 · 화면 오류 없음(그 파일 404 만)
for (const [w, h, hash] of [[390, 844, '#/'], [360, 640, '#/gdr']]) {
  const T = `gdr.json 못 받음 ${w}×${h} ${hash}`, p = await newPage(w, h, {gdr: 404, allow: ['/next/data/gdr.json']});
  try {
    await open(p, hash);
    const g = await p.evaluate(() => { const s = document.querySelector('#view section.gdr'); return {q: [...(s?.querySelectorAll('p') ?? [])].map(x => x.textContent), cells: s?.querySelectorAll('.gdr-cell').length ?? -1, input: !!s?.querySelector('input'), fun: !!document.querySelector('#view section.gdr-fun')}; });
    if (!g.q.some(t => t.startsWith('?')) || g.cells !== 0 || g.input || g.fun) fail('못 받음 「?」 줄', `${T} ${JSON.stringify(g)}`);
    await layout(p, hash === '#/' ? SEL : '#view', T);
    errsOf(p, T); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-gdr-1', when: new Date().toISOString(), base, path: NEXT, all: ALL, version: G.version ?? null, asOf: G.asOf ?? null, picks: G.picks.length, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, picks: res.picks, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');

// 보유종목 점검 맞대기 — 사장님 2026-10-17(싱가포르) 21:10 「고도리 · 하나로 묶은 명령문」 [5] 1 ~ 3 · 5 ~ 10(일 나누기 docs/design/godori-2026-10-17/brief2.md · 일꾼 D)
//   쓰는 법: node scripts/atlas11/next/check_hold.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all | --limit N]
//     다른 쪽 검사처럼 --all · --limit N 을 받음(이 검사는 짧아서 둘 다 모든 판을 돎 · --limit N = 꾸민 보유를 N곳까지)
//   기준 = 명령문 원문(order-2110.txt [5] — 첫 질문 글 · 다섯 가지 이름) · 결정표(brief.md — 다섯 문 이름 · 질문 3 답) · 시험 서버 자료(mkt.json · names.json · co/<번호>.json ·
//          /next/data/gates.json — 없으면 mkt.json 으로 만든 가짜를 바꿔 넣고 결과에 밝힘) · 화면 코드(p-hold.js)는 읽지 않고 기대 값을 따로 셈
//   ① 질문이 먼저 — 답하기 전 카드 = 이름 · 오늘 값 · 질문만(산 값 · 수익률 · 색 · 다섯 가지 없음) · 어제 답은 다시 물음 · 답한 뒤 차례 = 답 → 색 → (참은 날) → 수익률 → ① ~ ⑤
//   ② 색 — 꾸민 보유마다 기대 색(문 1 지남 · 못 지남 · 못 셈 · 클 일 앞 · 지남 · 그냥 · 매매일지 없음 · 팔 선 2% · 딱 3% · 지남 · 망할 이유 · 닫힌 문) · 줄 글 · 다섯 문 이름 · 「지남」 글
//   ③ 참은 날 — 🔴로 처음 본 날부터 · 🔴 아니면 풂 · 값 · 문을 못 받은 날은 그대로 · 첫 문 색 기억(g0) · 「나타났어」 누름(다시 누르면 풂 · 기억)
//   ④ 몫 — 몫 그림(종목 · 업종 · 셋에 하나 넘으면 금빛) · 80 : 20 · 셋이 똑같이(딱 셋에 하나는 넘지 않음)
//   ⑤ 적기 · 팔았어(나눠 팖 · 다 팖) · 잘못 적었어 — 기억 줄 수가 줄지 않음(지우지 않음) · 지난 보유 · 틀린 입력 글
//   ⑥ 펀드 · 우선주 — 점검 못 하는 까닭(이름표 글의 종류 · #/x 고리) · 수익률 없음
//   ⑦ 자료를 바꾼 길 — gates.json 못 받음 · co 파일 못 받음 · 기억 못 하는 기계(이 화면에서만 적힘)
//   ⑧ 모양 — 두 폭(360×640 · 390×844) 옆 넘침 0 · 칸 밖 0 · 누르는 자리 44px · 글 17px · 캔버스 0 · 쓰지 않을 말 0(내 글 · 남의 글 data-proper · lang="ko" 밖) · 화면 오류 0
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
import {screenHits} from '../../../site/next/words.js'; // 쓰지 않을 말 한 곳(명령문 [4] 4 · 일꾼 C) — 「사라져」 같은 보통 말은 빼고 셈
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all'), LIMIT = Math.max(0, +arg('--limit', 0) || 0);
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 기준 — 명령문 [5] · 결정표 */
const ORDER = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '');
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const SEC5 = (ORDER.split('[5 · 보유종목 점검]')[1] ?? '').split('[6 ·')[0];
const QTEXT = (/첫 질문: 「([^」]+)」/.exec(SEC5) || [])[1];
const ITEMS = [...SEC5.matchAll(/^\s*([①②③④⑤]) (.+?)\s*$/gm)].map(m => m[1] + ' ' + m[2].replace(/\(숫자\)$/, ''));
const GATES = ((/다섯 문으로 걸러라: ([^\n]+?)\n/.exec(BRIEF) || [])[1] ?? '').split(' · ').map(s => s.trim()).filter(Boolean);
const Q3 = (/^3 뭐가 좋아\? 🟢(.+?) 🟡(.+?) 🔴(.+?) -/m.exec(BRIEF) || []).slice(1);
if (!QTEXT || ITEMS.length !== 5 || GATES.length !== 5 || Q3.length !== 3) { console.error('명령문(order-2110.txt [5]) · 결정표(brief.md)에서 질문 · 다섯 가지 · 다섯 문 · 질문 3 답을 못 읽음', QTEXT, ITEMS, GATES, Q3); process.exit(1); }
const SHORT = ['산 이유', '문 색', '망할 이유', '팔 약속', '몫']; // 색 이름표에 쓰는 짧은 이름(① ~ ⑤ 차례)
const ASK_N = 3; // 「살 거야 · 잘 모르겠어 · 안 살 거야」
const KEY = 'atlas:godori-hold', WHY_KEY = 'atlas:godori-why';

/* 꼴(화면과 같은 꼴 — 셈은 따로) */
const TODAY = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const addD = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const won = n => comma(Math.round(n)) + '원';
const sWon = n => (Math.round(n) > 0 ? '+' : Math.round(n) < 0 ? '−' : '') + comma(Math.abs(Math.round(n))) + '원';
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1);
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
const pct = x => { const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? comma(Math.floor(a + 0.5 + 1e-7)) : a.toFixed(1)) + '%'; };
const qtyTxt = q => (Number.isInteger(q) ? comma(q) : String(q)) + '주';
const sellOf = b => Math.floor(b * 9 / 10), halfOf = b => Math.floor(b * 12 / 10); // 기본 약속(명령문 [3] 5 — 산 값 × 0.9 · × 1.2 · 원 아래 버림)

/* 자료(시험 서버) */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [MKT, NAMES] = await Promise.all(['/atlas/data/mkt.json', '/atlas/data/names.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!MKT?.companies || !Array.isArray(NAMES?.rows)) { console.log(JSON.stringify({counts, fails}, null, 1)); process.exit(1); }
let GATE = await getJ('/next/data/gates.json').catch(() => null), gatesSrc = 'real';
if (!GATE?.co) { // 아직 없으면 가짜(번호로 정한 값 · 결과에 밝힘)
  gatesSrc = 'fake';
  const co = {}; for (const c of Object.keys(MKT.companies)) { let x = 7; for (const ch of c) x = (x * 31 + ch.charCodeAt(0)) >>> 0; co[c] = x % 7 === 0 ? [1, null, null, null, null, null] : [0, ...[0, 1, 2, 3, 4].map(i => (x >> (i + 3)) & 1)]; }
  GATE = {schema: 'godori-gates-1', version: 'fake', asOf: MKT.asOf, keys: ['x', 'g1', 'g2', 'g3', 'g4', 'g5'], co};
}
const coCache = new Map();
const priceOf = async c => { if (!coCache.has(c)) coCache.set(c, await getJ('/atlas/data/co/' + c + '.json').then(j => (j?.c?.price > 0 ? {p: j.c.price, d: j.c.priceDate} : null)).catch(() => null)); return coCache.get(c); };
const used = new Set(), usedInd = new Set();
const CODES = Object.keys(MKT.companies).sort();
/** 회사 하나 고르기 — 문 조건 · 값 조건 · 업종은 서로 다르게(몫이 셋에 하나를 넘지 않게) */
async function pick(pred, extra = () => true) {
  for (const c of CODES) {
    const o = MKT.companies[c]; if (used.has(c) || usedInd.has(o.i)) continue;
    const gv = GATE.co[c]; if (!Array.isArray(gv) || !pred(gv)) continue;
    const px = await priceOf(c); if (!px || !extra(px.p)) continue;
    used.add(c); usedInd.add(o.i); return {code: c, name: o.n, ind: o.i, gv, p: px.p, pd: px.d};
  }
  return null;
}
const q3 = k => [2, 0, k, 0, 0, 0, 0, 0, 0, 0, 0]; // 답 열한 개 — 3번 「뭐가 좋아?」만 바꿈
const qtyFor = p => Math.max(1, Math.round(1e6 / p)); // 곳마다 몸값 100만 원 안팎(몫이 고르게)
const recOf = (X, k, o = {}) => ({at: new Date(Date.now() - 6e5).toISOString(), asOf: GATE.asOf, code: X.code, name: X.name, price: X.p, day: X.pd, answers: q3(k), score: 2, reds: 1, verdict: '좋아, 정해 둔 대로만', groups: {}, picks: [],
  why: '이익이 줄어서', promise: {sell: Math.floor(X.p * 0.8), half: Math.floor(X.p * 1.5), text: '만약 값이 떨어지면 판다.'}, ...o});

/* 꾸민 보유 — 판 A(값 = 시험 서버 그대로) */
const SC = []; // {key, X, rec, hold, c: [① … ⑤ 기대 색], ...}
async function scene(key, pred, extra, mk) {
  if (LIMIT && SC.length >= Math.max(6, LIMIT)) return;
  const X = await pick(pred, extra); if (!X) { bump('못 꾸민 판 · ' + key); return; }
  const s = mk(X); SC.push({key, X, ...s, hold: {id: 'hd-' + key, code: X.code, name: X.name, buy: Math.round(X.p * 0.95), qty: qtyFor(X.p), day: addD(TODAY, -20), at: new Date().toISOString(), ...(s.hold ?? {})}});
}
const full = gv => gv[0] === 0 && gv.slice(1, 6).every(v => v === 0 || v === 1); // 먼저 안 뺐고 다섯 문을 다 셈(값이 빈 문 없음)
const x0 = full, g1p = gv => full(gv) && gv[1] === 1;
await scene('문1지남', g1p, undefined, X => ({rec: recOf(X, 0), hold: {red: {from: addD(TODAY, -5)}, ask: {d: addD(TODAY, -1), a: 0}}, c: ['g', 'g', 'g', 'g', 'g'], redAfter: null}));
await scene('문1못지남', gv => full(gv) && gv[1] === 0, undefined, X => ({rec: recOf(X, 0), hold: {red: {from: addD(TODAY, -3)}}, c: ['r', 'g', 'g', 'g', 'g'], endure: 3}));
await scene('문못셈', gv => gv[0] === 1, undefined, X => ({rec: recOf(X, 0), c: ['u', 'u', 'g', 'g', 'g'], xline: '거래가 너무 적어'})); // 먼저 뺀 곳 — 문 1 도 셀 수 없음(🟡 셀 수 없음)
await scene('클일앞', x0, undefined, X => ({rec: recOf(X, 1, {bigDay: addD(TODAY, 5)}), c: ['g', 'g', 'g', 'g', 'g'], line1: `「${Q3[1]}」 — 네가 적은 날(${md(addD(TODAY, 5))})까지 5일 남았어.`}));
await scene('클일지남', x0, undefined, X => ({rec: recOf(X, 1, {bigDay: addD(TODAY, -1)}), c: ['r', 'g', 'g', 'g', 'g'], endure: 0, line1: `「${Q3[1]}」 — 네가 적은 날(${md(addD(TODAY, -1))})이 지났어.`}));
await scene('그냥', x0, undefined, X => ({rec: recOf(X, 2), c: ['y', 'g', 'g', 'g', 'g'], line1: `「${Q3[2]}」`}));
await scene('매매일지없음', x0, undefined, () => ({rec: null, c: ['u', 'g', 'q', 'g', 'g']}));
await scene('팔선2', g1p, p => p >= 1000, X => ({rec: recOf(X, 0, {promise: {sell: Math.floor(X.p * 0.98), half: Math.floor(X.p * 1.5), text: '만약 조금만 내려도 판다.'}}), c: ['g', 'g', 'g', 'r', 'g']}));
await scene('팔선딱3', g1p, p => p % 100 === 0, X => ({rec: recOf(X, 0, {promise: {sell: X.p * 97 / 100, half: Math.floor(X.p * 1.5), text: '만약 3% 내리면 판다.'}}), c: ['g', 'g', 'g', 'r', 'g'], d4: '3.0'}));
await scene('팔선지남', g1p, undefined, X => ({rec: recOf(X, 0, {promise: {sell: X.p + 100, half: Math.floor(X.p * 1.5), text: '만약 내리면 판다.'}}), c: ['g', 'g', 'g', 'r', 'g'], past4: true}));
await scene('망할이유', g1p, undefined, X => ({rec: recOf(X, 0), hold: {doom: {at: new Date().toISOString()}}, c: ['g', 'g', 'y', 'g', 'g']}));
await scene('닫힌문', gv => g1p(gv) && [2, 3, 4, 5].some(i => gv[i] === 0), undefined, X => ({rec: recOf(X, 0), hold: {g0: {d: '2026-10-01', ver: GATE.version ?? null, v: [0, 1, 1, 1, 1, 1]}}, c: ['g', 'y', 'g', 'g', 'g'],
  line2: `처음 적은 날(10월 1일)보다 닫힌 문: ${GATES.filter((_, i) => X.gv[i + 1] === 0).join(' · ')}.`}));
const PREF = NAMES.rows.find(r => r.c === '005935' && r.k) ?? NAMES.rows.find(r => r.k === 'pref') ?? NAMES.rows.find(r => r.k);
const XH = PREF ? {id: 'hd-밖', code: PREF.c, name: PREF.n, buy: 100000, qty: 10, day: addD(TODAY, -30), at: new Date().toISOString()} : null; // 회사 주식 밖(값을 모름 — 몫은 산 값으로)
const XLABEL = PREF ? String(PREF.w ?? '').split(' — ')[0] : null;
const PAST = [ // 지난 보유 — 판 것 · 잘못 적은 것(지우지 않음 · 카드로 안 나옴)
  {id: 'hd-판', code: SC[0]?.X.code ?? '005930', name: SC[0]?.X.name ?? '?', buy: 1000, qty: 5, day: addD(TODAY, -40), at: new Date().toISOString(), sold: {day: addD(TODAY, -2), price: 1100, at: new Date().toISOString()}},
  {id: 'hd-잘못', code: SC[1]?.X.code ?? '005930', name: SC[1]?.X.name ?? '?', buy: 2000, qty: 1, day: addD(TODAY, -10), at: new Date().toISOString(), wrong: {at: new Date().toISOString()}}];
if (SC.length < 6) fail('꾸민 판이 모자람', SC.map(s => s.key).join(','));
bump('꾸민 보유', SC.length);

/** 몫 — 따로 셈(지금 값 × 수량 · 값이 없으면 산 값) */
function sharesOf(holds) {
  const by = new Map(), ind = new Map(); let tot = 0;
  for (const o of holds) {
    if (o.sold || o.wrong) continue;
    const M = MKT.companies[o.code], p = M ? coCache.get(o.code)?.p ?? null : null, v = (p ?? o.buy) * o.qty, i = M ? M.i : String(NAMES.rows.find(r => r.c === o.code)?.w ?? '').split(' — ')[0];
    by.set(o.code, (by.get(o.code) ?? 0) + v); ind.set(i, (ind.get(i) ?? 0) + v); tot += v;
  }
  return {by, ind, tot};
}
const isBig = (v, tot) => v * 3 > tot * (1 + 1e-12);
/** 기대 색 이름표 */
function badgeOf(c, s) {
  if (c.includes('r')) return '🔴 ' + [...(c[3] === 'r' ? [s.past4 ? '팔 선 지남' : '팔 선 가까움'] : []), ...(c[0] === 'r' ? ['산 이유 없어짐'] : [])].join(' · ');
  const y = SHORT.filter((_, i) => c[i] === 'y'), u = SHORT.filter((_, i) => c[i] === 'u');
  return y.length || u.length ? '🟡 ' + [...(y.length ? [y.length > 1 ? `${y.length}가지 흔들림` : '하나 흔들림', ...y] : []), ...(u.length ? ['셀 수 없음', ...u] : [])].join(' · ') : '🟢 그대로';
}

/* 브라우저 — 한 번에 하나 · 판마다 새 칸 */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function newPage(width, height, {holds = null, recs = null, store = 'ok', routes = [], allow = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  else if (holds || recs) await ctx.addInitScript(([k1, v1, k2, v2]) => { if (sessionStorage.getItem('hd-seeded')) return; if (v1) localStorage.setItem(k1, v1); if (v2) localStorage.setItem(k2, v2); sessionStorage.setItem('hd-seeded', '1'); }, [KEY, holds ? JSON.stringify(holds) : null, WHY_KEY, recs ? JSON.stringify(recs) : null]);
  for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = [];
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
const SEL = '#view section.hd';
async function open(p, hash = '#/me') {
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), SEL, {timeout: 30000});
  await p.waitForTimeout(150);
}
const store = (p, k = KEY) => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return '막힘'; } }, k);

/* 화면에서 읽기 */
const READH = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const cls = (e, re) => ((e?.className || '').match(re) || [])[1] ?? null;
  const cards = [...s.querySelectorAll('article.hd-card')].map(c => ({
    id: c.getAttribute('data-id'), code: c.getAttribute('data-code'), text: c.textContent,
    kids: [...c.children].map(k => k.className.split(' ')[0]),
    head: c.querySelector('.hd-ch')?.textContent ?? '', nameProper: !!c.querySelector('.hd-ch [data-proper]'), nameHref: c.querySelector('a.hd-name')?.getAttribute('href') ?? null,
    px: c.querySelector('.hd-px')?.textContent ?? '', qh: c.querySelector('.hd-qh')?.textContent ?? null, opts: [...c.querySelectorAll('.hd-opt')].map(b => b.textContent),
    ans: c.querySelector('.hd-ans b')?.textContent ?? null, badge: c.querySelector('.hd-badge') ? {c: cls(c.querySelector('.hd-badge'), /\bhd-c([gyrqu])\b/), t: c.querySelector('.hd-badge').textContent} : null,
    endure: c.querySelector('.hd-endure')?.textContent ?? null, ret: c.querySelector('.hd-ret')?.textContent ?? null,
    lines: [...c.querySelectorAll(':scope > .hd-line')].map(x => x.textContent), link: c.querySelector(':scope > .hd-link')?.getAttribute('href') ?? null,
    items: [...c.querySelectorAll('.hd-it')].map(it => ({c: cls(it, /\bhd-i([gyrqu])\b/), n: it.querySelector('.hd-in')?.textContent ?? '', dot: cls(it.querySelector('.hd-in .hd-dot'), /\bhd-c([gyrqu])\b/),
      lines: [...it.querySelectorAll('.hd-line')].map(x => x.textContent), gates: [...it.querySelectorAll('.hd-gates > li')].map(li => [li.querySelector('span:not(.hd-dot)')?.textContent ?? '', li.querySelector('b')?.textContent ?? '']),
      mine: [...it.querySelectorAll('.hd-mine q[data-proper][lang="ko"]')].map(q => q.textContent), tog: it.querySelector('.hd-tog')?.getAttribute('aria-pressed') ?? null, link: it.querySelector('.hd-link')?.getAttribute('href') ?? null}))}));
  const bars = [...s.querySelectorAll('.hd-pic .hd-bars')].map(b => [...b.querySelectorAll('.hd-bar')].map(r => [r.querySelector('.hd-bn')?.textContent ?? '', r.querySelector('b')?.textContent ?? '', !!r.querySelector('.hd-fill.over'), !!r.querySelector('.hd-third')]));
  const past = s.querySelector('details.hd-past');
  return {cards, bars, empty: [...s.querySelectorAll(':scope > .hd-note')].map(x => x.textContent), mem: s.querySelector('.hd-q-note')?.textContent ?? null, leg: !!s.querySelector('details.hd-leg'),
    pastN: past?.querySelector('summary')?.textContent ?? null, pastOpen: !!past?.open, pastRows: [...(past?.querySelectorAll('.hd-prow') ?? [])].map(r => r.textContent), add: !!s.querySelector('button.hd-add-b'), form: !!s.querySelector('form.hd-add'), err: s.querySelector('.hd-err')?.textContent ?? ''};
};
/** 모양 — 옆 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(내 글 · 남의 글 · 이름표 글) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement || e.closest('details:not([open]) > :not(summary)')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper], [lang="ko"]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
async function layout(p, tag) {
  const s = await p.evaluate(LAYOUT, SEL); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  const T = s.text + '\n' + s.attrs.join('\n');
  for (const b of screenHits(T)) fail('쓰지 않을 말(words.js screenHits)', `${tag} 「${b}」`);
}
const cardOf = (g, id) => g?.cards.find(c => c.id === id) ?? null;

/** 답하기 전 — 이름 · 오늘 값 · 질문만(산 값 · 수익률 · 색 · 다섯 가지 없음) */
function checkAsk(c, o, tag) {
  if (!c) { fail('카드 없음', tag); return; }
  if (c.qh !== QTEXT) fail('첫 질문 글(명령문 [5] 3)', `${tag} 「${c.qh}」`);
  if (c.opts.length !== ASK_N) fail('답 셋', `${tag} ${JSON.stringify(c.opts)}`);
  if (c.ans != null || c.badge || c.ret != null || c.items.length || c.endure != null) fail('질문 앞에 수익률 · 색 · 점검이 보임([5] 3)', `${tag} ${JSON.stringify({ans: c.ans, badge: c.badge, ret: c.ret, items: c.items.length})}`);
  if (c.text.includes('산 값 ') || c.text.includes(won(o.buy))) fail('질문 앞에 산 값이 보임([5] 3)', `${tag} 「${c.text.slice(0, 120)}」`);
  if (/[+−]\d+(\.\d)?%/.test(c.text)) fail('질문 앞에 % 가 보임', `${tag} 「${c.text.slice(0, 120)}」`);
  if (!eq(c.kids, ['hd-ch', 'hd-px', 'hd-ask'])) fail('답하기 전 차례(이름 · 오늘 값 · 질문)', `${tag} ${c.kids.join(',')}`);
  bump('질문 먼저 맞댄 카드');
}
/** 답한 뒤 — 차례 · 색 · 수익률 · ① ~ ⑤ */
function checkDone(c, s, SH, tag, ansK) {
  const o = s.hold, X = s.X, p = X.p, at = `${tag} ${s.key}`;
  if (!c) { fail('카드 없음', at); return; }
  if (ansK != null && c.ans !== c.opts?.[ansK] && c.ans == null) fail('답 표시', at);
  const want = ['hd-ch', 'hd-px', 'hd-ans', 'hd-badge', ...(s.c.includes('r') ? ['hd-endure'] : []), 'hd-ret', 'hd-it', 'hd-it', 'hd-it', 'hd-it', 'hd-it', 'hd-act'];
  if (!eq(c.kids.slice(0, want.length), want)) fail('답한 뒤 차례(답 → 색 → 참은 날 → 수익률 → ① ~ ⑤)', `${at} ${c.kids.join(',')}`);
  if (!eq(c.items.map(x => x.n), ITEMS)) fail('다섯 가지 이름 · 차례(명령문 [5] 5)', `${at} ${JSON.stringify(c.items.map(x => x.n))}`);
  if (!eq(c.items.map(x => x.c), s.c) || !eq(c.items.map(x => x.dot), s.c)) fail('다섯 가지 색', `${at} ${c.items.map(x => x.c + '/' + x.dot).join(',')} ≠ ${s.c.join(',')}`);
  const color = s.c.includes('r') ? 'r' : s.c.includes('y') || s.c.includes('u') ? 'y' : 'g';
  if (c.badge?.c !== color || c.badge?.t !== badgeOf(s.c, s)) fail('색 이름표([5] 7)', `${at} ${JSON.stringify(c.badge)} ≠ ${color} 「${badgeOf(s.c, s)}」`);
  const ret = (p / o.buy - 1) * 100, amt = (p - o.buy) * o.qty;
  const wantRet = `산 값 ${won(o.buy)} → 오늘 ${won(p)} ${pct(ret)} ${sWon(amt)}`;
  if (c.ret !== wantRet) fail('수익률(따로 셈)', `${at} 「${c.ret}」 ≠ 「${wantRet}」`);
  if (!c.px.startsWith(`오늘 값 ${won(p)} · ${md(X.pd)} 종가`)) fail('오늘 값 줄', `${at} 「${c.px}」`);
  if (c.nameHref !== '#/w/' + encodeURIComponent(X.code) || !c.nameProper) fail('이름 고리', `${at} ${c.nameHref}`);
  const [i1, i2, i3, i4, i5] = c.items;
  // ①
  if (s.rec === null) { if (i1.link !== '#/why/' + encodeURIComponent(X.code)) fail('① 매매일지 없음 → 이 회사로 왜 사? 고리', `${at} ${i1.link}`); }
  else {
    const cq = s.rec.answers[2];
    if (cq === 0) { const want1 = X.gv[0] !== 0 || X.gv[1] == null ? `「${Q3[0]}」 — ? 오늘 문 1(이익 늘었나)을 셀 수 없어.` : X.gv[1] === 1 ? `「${Q3[0]}」 — 오늘도 문 1(이익 늘었나)을 지나.` : `「${Q3[0]}」 — 오늘 문 1(이익 늘었나)을 못 지나. 산 이유가 없어졌어.`; if (!i1.lines.includes(want1)) fail('① 돈을 잘 번다 → 오늘 문 1', `${at} ${JSON.stringify(i1.lines)} ∌ 「${want1}」`); }
    if (s.line1 && !i1.lines.some(t => t.startsWith(s.line1))) fail('① 줄 글', `${at} ${JSON.stringify(i1.lines)} ∌ 「${s.line1}」`);
    const wd = md(new Date(Date.parse(s.rec.at) + 9 * 36e5).toISOString().slice(0, 10)); // 매매일지를 쓴 날(서울)
    if (!i1.lines.includes(`${wd} 매매일지에서 읽었어.`)) fail('① 매매일지 날짜(쓴 날)', `${at} ${JSON.stringify(i1.lines)}`);
  }
  // ② 다섯 문 오늘 색 — 이름(결정표) · 지남 글 · 처음 색과 견줌
  const wantG = GATES.map((n, i) => [n, X.gv[i + 1] === 1 ? '지남' : X.gv[i + 1] === 0 ? '못 지남' : '?']);
  if (!eq(i2.gates, wantG)) fail('② 다섯 문 이름 · 지남(gates.json)', `${at} ${JSON.stringify(i2.gates)} ≠ ${JSON.stringify(wantG)}`);
  if (s.xline && !i2.lines.some(t => t.startsWith(s.xline))) fail('② 먼저 뺀 까닭', `${at} ${JSON.stringify(i2.lines)}`);
  const nul = X.gv[0] === 0 ? GATES.filter((_, i) => X.gv[i + 1] == null) : [];
  if (nul.length ? !i2.lines.includes(`? 오늘 셀 수 없는 문: ${nul.join(' · ')}.`) : i2.lines.some(t => t.includes('셀 수 없는 문'))) fail('② 셀 수 없는 문 줄(값이 빈 문 = 「?」)', `${at} ${JSON.stringify(i2.lines)}`);
  if (s.line2 ? !i2.lines.includes(s.line2) : !i2.lines.some(t => t.startsWith('처음 적은 날'))) fail('② 처음 색과 견줌', `${at} ${JSON.stringify(i2.lines)} · 기대 「${s.line2 ?? '처음 적은 날 …'}」`);
  // ③ 망할 이유 — 내 글(data-proper · lang=ko) · 누름
  if (s.rec?.why) { if (!eq(i3.mine, [s.rec.why]) || i3.tog !== String(!!o.doom)) fail('③ 망할 이유 글 · 누름', `${at} ${JSON.stringify(i3.mine)} ${i3.tog}`); }
  else if (i3.tog != null || !i3.lines.some(t => t.startsWith('?'))) fail('③ 망할 이유 없음 「?」', `${at} ${JSON.stringify(i3)}`);
  // ④ 팔 약속까지 — 내 약속과 견줌만
  const P = s.rec?.promise, own = !!P?.sell, sell = own ? P.sell : sellOf(o.buy), half = P?.half ?? halfOf(o.buy), who = own ? '네가 정한' : '기본';
  const want4 = p <= sell ? (p === sell ? `${who} 팔 선(${won(sell)})에 닿았어.` : `${who} 팔 선(${won(sell)})을 지났어. 오늘 값이 팔 선보다 ${one((sell - p) / sell * 100)}% 아래야.`) : `${who} 팔 선까지 ${one((p - sell) / p * 100)}% 남았어. 한 주에 ${won(p - sell)}이야.`;
  if (!i4.lines.includes(want4)) fail('④ 팔 선까지 거리(따로 셈 · [5] 8)', `${at} ${JSON.stringify(i4.lines)} ∌ 「${want4}」`);
  if (s.d4 && !i4.lines.some(t => t.includes(`팔 선까지 ${s.d4}% 남았어`))) fail('④ 딱 3%', `${at} ${JSON.stringify(i4.lines)}`);
  const want4h = p >= half ? `절반 팔 선(${won(half)})에 닿았어.` : `절반 팔 선(${won(half)})까지 ${one((half - p) / p * 100)}% 남았어.`;
  if (!i4.lines.some(t => t.endsWith(want4h))) fail('④ 절반 팔 선', `${at} ${JSON.stringify(i4.lines)} ∌ 「${want4h}」`);
  if (!own && !i4.lines.some(t => t.startsWith('아직 팔 약속을 안 적어서 기본 약속으로 셌어'))) fail('④ 기본 약속 밝힘', at);
  if (own && P.text && !i4.mine.includes(P.text)) fail('④ 내가 적은 약속 글(data-proper · lang=ko)', `${at} ${JSON.stringify(i4.mine)}`);
  if (i4.lines.some(t => /팔아|파세요|팔 때/.test(t))) fail('④ 권하는 말', `${at} ${JSON.stringify(i4.lines)}`);
  // ⑤ 몫
  const v = SH.by.get(X.code), vi = SH.ind.get(X.ind), big = isBig(v, SH.tot) || isBig(vi, SH.tot);
  const want5 = `이 종목 몫 ${one(v / SH.tot * 100)}% · ${X.ind} 업종 몫 ${one(vi / SH.tot * 100)}%.` + (big ? ' 셋에 하나보다 커.' : '');
  if (!eq(i5.lines, [want5])) fail('⑤ 몫(따로 셈)', `${at} ${JSON.stringify(i5.lines)} ≠ 「${want5}」`);
  bump('답한 뒤 맞댄 카드');
}

/* ① ~ ③ 판 A — 열 곳 넘게(값 = 시험 서버) · 360×640 */
const HOLDS = [...SC.map(s => s.hold), ...(XH ? [XH] : []), ...PAST], RECS = SC.filter(s => s.rec).map(s => s.rec);
const SH_A = sharesOf(HOLDS);
for (const s of SC) { const v = SH_A.by.get(s.X.code); if (isBig(v, SH_A.tot)) s.c[4] = 'y'; } // 몫이 셋에 하나를 넘는 판이면 ⑤ 기대도 따라감(곳이 적을 때 · --limit)
{
  const tag = '판A 360×640', p = await newPage(360, 640, {holds: HOLDS, recs: RECS});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    const act = HOLDS.filter(o => !o.sold && !o.wrong);
    if (g.cards.length !== act.length) fail('카드 수 = 들고 있는 것(판 것 · 잘못 적은 것 빼고)', `${tag} ${g.cards.length} ≠ ${act.length}`);
    for (const o of act) checkAsk(cardOf(g, o.id), o, `${tag} ${o.id}`);
    // 몫 그림 — 종목 · 업종(큰 차례 · 위 여섯 · 넷 · 나머지는 「그 밖」) · 금빛 = 셋에 하나 넘음 · 점선
    const top = (m, k) => { const a = [...m].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)); if (a.length <= k) return a; return [...a.slice(0, k - 1), [`그 밖 ${a.length - k + 1}곳`, a.slice(k - 1).reduce((s2, x) => s2 + x[1], 0)]]; };
    const nm = c => MKT.companies[c]?.n ?? HOLDS.find(o => o.code === c)?.name ?? c;
    const wantB = [top([...SH_A.by].map(([c, v]) => [nm(c), v]), 6), top([...SH_A.ind], 4)].map(rows => rows.map(([n, v]) => [n, one(v / SH_A.tot * 100) + '%', isBig(v, SH_A.tot), true]));
    if (!eq(g.bars, wantB)) fail('몫 그림(따로 셈)', `${tag} ${JSON.stringify(g.bars).slice(0, 300)} ≠ ${JSON.stringify(wantB).slice(0, 300)}`);
    if (!g.leg) fail('색 풀이 접힌 칸', tag);
    if (!g.empty.some(t => t.includes('정식 투자자문업자') && t.includes(NEW_NAME))) fail('「정식 투자자문업자만」 줄([5] 8)', `${tag} ${JSON.stringify(g.empty)}`);
    if (g.pastN !== `지난 보유 ${PAST.length}곳` || g.pastOpen) fail('지난 보유(접힘 · 수)', `${tag} 「${g.pastN}」 ${g.pastOpen}`);
    await layout(p, tag + ' 답하기 전');
    // 답하기 — 카드마다 셋 가운데 하나(차례로 돌려 고름)
    let k = 0;
    for (const s of SC) {
      const ak = k++ % ASK_N;
      await p.locator(`${SEL} article.hd-card[data-id="${s.hold.id}"] button.hd-opt`).nth(ak).click({timeout: 8000});
      await p.waitForFunction(([sel, id]) => !!document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-ans`), [SEL, s.hold.id], {timeout: 10000});
      g = await p.evaluate(READH, SEL);
      const c = cardOf(g, s.hold.id);
      if (c?.ans !== ['살 거야', '잘 모르겠어', '안 살 거야'][ak]) fail('답 표시', `${tag} ${s.key} 「${c?.ans}」`);
      checkDone(c, s, SH_A, tag, ak);
      for (const o of act) if (o.id !== s.hold.id && !SC.slice(0, k).some(x => x.hold.id === o.id)) { const c2 = cardOf(g, o.id); if (c2?.ret != null || c2?.badge) fail('답하지 않은 카드에 수익률 · 색', `${tag} ${o.id}`); }
    }
    if (XH) { // 회사 주식 밖 — 질문 → 까닭(#/x 와 같은 종류 글) · 수익률 없음 · 다섯 가지 없음
      await p.locator(`${SEL} article.hd-card[data-id="${XH.id}"] button.hd-opt`).nth(1).click({timeout: 8000});
      await p.waitForFunction(([sel, id]) => !!document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-ans`), [SEL, XH.id], {timeout: 10000});
      const c = cardOf(await p.evaluate(READH, SEL), XH.id);
      if (c?.badge?.c !== 'q' || c.badge.t !== '? 점검 못 함' || c.items.length || !c.lines.includes(`${XLABEL} — 회사 주식이 아니라 다섯 문을 셀 수 없어요.`) || c.link !== '#/x/' + encodeURIComponent(XH.code) || /[+−]\d+(\.\d)?%/.test(c.ret ?? c.text)) fail('회사 주식 밖 — 점검 못 하는 까닭([5] 9)', `${tag} ${JSON.stringify(c).slice(0, 300)}`);
      else bump('회사 주식 밖 맞댐');
    }
    await layout(p, tag + ' 모두 답함');
    // 기억 — 오늘 답 · 참은 날 · 첫 문 색(g0) · 지난 보유 그대로
    const st = await store(p);
    if (!Array.isArray(st) || st.length !== HOLDS.length) fail('기억 줄 수(지우지 않음)', `${tag} ${Array.isArray(st) ? st.length : st} ≠ ${HOLDS.length}`);
    else {
      for (const s of SC) {
        const o = st.find(x => x.id === s.hold.id), red = s.c.includes('r');
        if (o?.ask?.d !== TODAY) fail('오늘 답 기억', `${tag} ${s.key} ${JSON.stringify(o?.ask)}`);
        if (red && o?.red?.from !== (s.endure === 3 ? addD(TODAY, -3) : TODAY)) fail('참은 날 시작(🔴로 처음 본 날)', `${tag} ${s.key} ${JSON.stringify(o?.red)}`);
        if (!red && o?.red) fail('🔴 아니면 참은 날을 풂', `${tag} ${s.key} ${JSON.stringify(o?.red)}`);
        if (!s.hold.g0 && !(o?.g0?.d === GATE.asOf && eq(o.g0.v, s.X.gv.slice(0, 6)))) fail('첫 문 색 기억(g0)', `${tag} ${s.key} ${JSON.stringify(o?.g0)}`);
      }
      for (const x of PAST) { const o = st.find(y => y.id === x.id); if (!o || !eq(o.sold ?? null, x.sold ?? null) || !eq(o.wrong ?? null, x.wrong ?? null)) fail('지난 보유 그대로', `${tag} ${x.id}`); }
    }
    g = await p.evaluate(READH, SEL);
    for (const s of SC.filter(x => x.c.includes('r'))) {
      const c = cardOf(g, s.hold.id), n = s.endure === 3 ? 3 : 0;
      const want = n ? `참은 날 ${n}일 · 🔴로 처음 본 날 ${md(addD(TODAY, -3))}` : '참은 날 0일 · 오늘 처음 🔴로 봤어';
      if (c?.endure !== want) fail('참은 날 글([5] 10)', `${tag} ${s.key} 「${c?.endure}」 ≠ 「${want}」`);
    }
    // 「나타났어」 — 누르면 🟡 · 다시 누르면 그대로 · 기억
    const s1 = SC.find(x => x.key === '문1지남');
    if (s1) {
      const tog = p.locator(`${SEL} article.hd-card[data-id="${s1.hold.id}"] button.hd-tog`);
      await tog.click(); await p.waitForFunction(([sel, id]) => document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-tog`)?.getAttribute('aria-pressed') === 'true', [SEL, s1.hold.id], {timeout: 8000});
      let c = cardOf(await p.evaluate(READH, SEL), s1.hold.id), o = (await store(p)).find(x => x.id === s1.hold.id);
      if (c.items[2].c !== 'y' || c.badge?.t !== '🟡 하나 흔들림 · 망할 이유' || !o?.doom) fail('③ 「나타났어」 누름 → 🟡 · 기억', `${tag} ${JSON.stringify(c.badge)} ${JSON.stringify(o?.doom)}`);
      await p.locator(`${SEL} article.hd-card[data-id="${s1.hold.id}"] button.hd-tog`).click(); await p.waitForFunction(([sel, id]) => document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-tog`)?.getAttribute('aria-pressed') === 'false', [SEL, s1.hold.id], {timeout: 8000});
      c = cardOf(await p.evaluate(READH, SEL), s1.hold.id); o = (await store(p)).find(x => x.id === s1.hold.id);
      if (c.badge?.t !== '🟢 그대로' || o?.doom) fail('③ 다시 누르면 풂', `${tag} ${JSON.stringify(c.badge)}`);
      bump('누른 길');
    }
    // 다시 열기 — 오늘 답 그대로(질문 없이 점검) · 참은 날 그대로
    await p.reload({waitUntil: 'domcontentloaded'}); await p.waitForFunction(s => !!document.querySelector(s + ' article.hd-card'), SEL, {timeout: 30000});
    g = await p.evaluate(READH, SEL);
    for (const s of SC) checkDone(cardOf(g, s.hold.id), s, SH_A, tag + ' 다시 엶', null);
    // 지난 보유 펼치기 — 판 것(산 값 → 판 값 · 수익률) · 잘못 적은 것
    await p.locator(`${SEL} details.hd-past > summary`).click(); g = await p.evaluate(READH, SEL);
    const sold = PAST[0], wantSold = `산 값 ${won(sold.buy)} → 판 값 ${won(sold.sold.price)} ${pct((sold.sold.price / sold.buy - 1) * 100)}`;
    if (!g.pastRows.some(t => t.includes(wantSold) && t.includes(`${md(sold.sold.day)}에 팖`)) || !g.pastRows.some(t => t.includes('잘못 적어 뺐어'))) fail('지난 보유 줄', `${tag} ${JSON.stringify(g.pastRows)}`);
    await layout(p, tag + ' 지난 보유 펼침');
    errsOf(p, tag);
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 판 A 넓은 폭 — 오늘 답을 미리 심음(바로 점검) · 390×844 */
{
  const tag = '판A 390×844', holds = HOLDS.map(o => (o.sold || o.wrong ? o : {...o, ask: {d: TODAY, a: 2}})), p = await newPage(390, 844, {holds, recs: RECS});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL);
    for (const s of SC) checkDone(cardOf(g, s.hold.id), {...s, hold: {...s.hold}}, SH_A, tag, null);
    await layout(p, tag);
    errsOf(p, tag);
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ④ 몫 — 값을 정해 바꿔 넣음(co/<번호>.json 의 오늘 값 = 10,000원) */
const fixedPrice = codes => codes.map(c => [`**/atlas/data/co/${c}.json`, async r => { const res = await r.fetch(); const j = await res.json(); j.c = {...j.c, price: 10000, priceDate: MKT.asOf}; await r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(j)}); }]);
const freeCodes = (() => { const out = [], seen = new Set(); for (const c of CODES) { const i = MKT.companies[c].i; if (used.has(c) || seen.has(i)) continue; seen.add(i); out.push(c); if (out.length >= 3) break; } return out; })();
for (const [nm, qty, wantBig] of [['80 : 20', [80, 20], [true, false]], ['셋이 똑같이', [10, 10, 10], [false, false, false]]]) {
  const codes = freeCodes.slice(0, qty.length), tag = `몫 ${nm}`;
  const holds = codes.map((c, i) => ({id: 'hd-몫' + i, code: c, name: MKT.companies[c].n, buy: 9000, qty: qty[i], day: addD(TODAY, -10), at: new Date().toISOString(), ask: {d: TODAY, a: 0}}));
  const p = await newPage(qty.length === 2 ? 390 : 360, qty.length === 2 ? 844 : 640, {holds, routes: fixedPrice(codes)});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL), tot = qty.reduce((s, x) => s + x, 0);
    holds.forEach((o, i) => {
      const c = cardOf(g, o.id), sh = one(qty[i] / tot * 100) + '%', i5 = c?.items?.[4];
      const want = `이 종목 몫 ${sh} · ${MKT.companies[o.code].i} 업종 몫 ${sh}.` + (wantBig[i] ? ' 셋에 하나보다 커.' : '');
      if (!i5 || i5.c !== (wantBig[i] ? 'y' : 'g') || !eq(i5.lines, [want])) fail('⑤ 몫 · 셋에 하나', `${tag} ${o.code} ${JSON.stringify(i5)} ≠ 「${want}」`);
    });
    const rows = g.bars[0] ?? [];
    if (!eq(rows.map(r => r[2]), [...wantBig].sort((a, b) => b - a)) || rows.length !== qty.length) fail('몫 그림 금빛(셋에 하나 넘음)', `${tag} ${JSON.stringify(rows)}`);
    await layout(p, tag); errsOf(p, tag); bump('몫 판');
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 값이 빈 문 — 먼저 안 뺀 곳의 문 하나가 null(셀 수 없음) → 「?」 · 빨강 아님 · 흔들림 아님 · 🟡 셀 수 없음 · 그 문 이름을 밝힘(gates.json 을 바꿔 넣음) */
{
  const X = await pick(g1p), tag = '값이 빈 문 390×844';
  if (!X) fail('값이 빈 문 판을 꾸미지 못함', tag);
  else {
    const gv = [...X.gv]; gv[3] = null; const GX = {...GATE, co: {...GATE.co, [X.code]: gv}}, s = {key: '값이빈문', X: {...X, gv}, rec: recOf(X, 0), c: ['g', 'u', 'g', 'g', 'g']};
    s.hold = {id: 'hd-빈문', code: X.code, name: X.name, buy: Math.round(X.p * 0.95), qty: 1, day: addD(TODAY, -20), at: new Date().toISOString(), ask: {d: TODAY, a: 0}};
    const pad = XH ? [0, 1, 2].map(i => ({...XH, id: 'hd-채움' + i, buy: X.p, qty: 1})) : []; // 회사 주식 밖 셋으로 채움 — 이 회사 몫 25%(⑤ 그대로 · 🟡 는 빈 문 하나 때문)
    if (!pad.length) s.c[4] = 'y';
    const holds = [s.hold, ...pad];
    const p = await newPage(390, 844, {holds, recs: [s.rec], routes: [['**/next/data/gates.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(GX)})]]});
    try {
      await open(p);
      const g = await p.evaluate(READH, SEL), c = cardOf(g, s.hold.id);
      checkDone(c, s, sharesOf(holds), tag, null);
      if (pad.length && c?.badge?.t !== '🟡 셀 수 없음 · 문 색') fail('다섯 문 가운데 빈 문 하나 = 🟡 셀 수 없음(흔들림 아님)', `${tag} ${JSON.stringify(c?.badge)}`);
      if (c?.items?.[1]?.gates?.[2]?.[1] !== '?' || c?.badge?.t?.includes('흔들림 · 문 색')) fail('값이 빈 문 = 「?」(못 지남 · 흔들림 아님)', `${tag} ${JSON.stringify(c?.items?.[1])} ${JSON.stringify(c?.badge)}`);
      await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
    } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑦ 자료를 바꾼 길 — gates.json 못 받음 · co 파일 하나 못 받음(참은 날은 그대로 둠) */
if (SC.length >= 2) {
  const [sa, sb] = [SC[0], SC[1]], tag = '문 · 값 못 받음 360×640';
  const holds = [{...sa.hold, red: {from: addD(TODAY, -2)}, ask: {d: TODAY, a: 0}}, {...sb.hold, red: null, ask: {d: TODAY, a: 0}}];
  const p = await newPage(360, 640, {holds, recs: [sa.rec, sb.rec].filter(Boolean), allow: ['/next/data/gates.json', `/atlas/data/co/${sa.X.code}.json`],
    routes: [['**/next/data/gates.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})], [`**/atlas/data/co/${sa.X.code}.json`, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]]});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL), ca = cardOf(g, sa.hold.id), cb = cardOf(g, sb.hold.id);
    if (!ca?.px.startsWith('? 오늘 값을 못 받았어') || !String(ca?.ret).includes('? 오늘 값을 못 받아 수익률을 못 셌어') || ca?.items?.[3]?.c !== 'u' || !ca.items[3].lines.includes('? 오늘 값을 못 받아 거리를 못 셌어.')) fail('co 못 받음 → 「?」', `${tag} ${JSON.stringify(ca).slice(0, 300)}`);
    const pxA = coCache.get(sa.X.code); coCache.set(sa.X.code, null); const SHm = sharesOf(holds); coCache.set(sa.X.code, pxA); // 이 판에서 그 회사 값은 못 받음 → 몫은 산 값으로
    for (const [c, s, c4] of [[ca, sa, 'u'], [cb, sb, 'g']]) {
      if (c?.items?.[1]?.c !== 'u' || !c.items[1].lines.includes('? 오늘 문 색을 아직 못 받았어.') || c.items[1].gates.length) fail('gates 못 받음 → ② 「?」', `${tag} ${JSON.stringify(c?.items?.[1])}`);
      const want = ['u', 'u', 'g', c4, isBig(SHm.by.get(s.X.code), SHm.tot) || isBig(SHm.ind.get(s.X.ind), SHm.tot) ? 'y' : 'g'];
      if (c?.badge?.c === 'r' || c?.badge?.t !== badgeOf(want, s) || !eq(c?.items?.map(x => x.c), want)) fail('셀 수 없는 것 = 🟡 셀 수 없음(빨강 · 흔들림 아님)', `${tag} ${JSON.stringify(c?.badge)} ${JSON.stringify(c?.items?.map(x => x.c))} ≠ 「${badgeOf(want, s)}」 ${want}`);
      if (c?.items?.[0]?.c !== 'u' || !c.items[0].lines.includes(`「${Q3[0]}」 — ? 오늘 문 1(이익 늘었나)을 셀 수 없어.`)) fail('gates 못 받음 → ① 🟡', `${tag} ${JSON.stringify(c?.items?.[0])}`);
    }
    const st = await store(p);
    if (st.find(x => x.id === sa.hold.id)?.red?.from !== addD(TODAY, -2)) fail('값 · 문을 못 받은 날은 참은 날을 풀지 않음', `${tag} ${JSON.stringify(st.find(x => x.id === sa.hold.id)?.red)}`);
    await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 빈 칸 높이 — 보유종목이 없을 때 짧게(제목 · 한 줄 · 적기 단추) · 아래 사장님 편지가 첫 화면 가까이(360×640 · 결과에 남김) */
let EMPTY = null;
{
  const tag = '빈 칸 360×640', p = await newPage(360, 640, {holds: [], recs: []});
  try {
    await open(p); await p.waitForTimeout(300);
    EMPTY = await p.evaluate(sel => { const e = document.querySelector(sel), r = e.getBoundingClientRect(), L = document.querySelector('#view .lw'); return {h: Math.round(r.height), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), letterTop: L ? Math.round(L.getBoundingClientRect().top + scrollY) : null, vh: innerHeight}; }, SEL);
    const g = await p.evaluate(READH, SEL);
    if (g.cards.length || g.bars.length || g.leg || !eq(g.empty, ['아직 적은 보유종목이 없어요.']) || !g.add) fail('빈 칸은 짧게(제목 · 한 줄 · 적기)', `${tag} ${JSON.stringify(g.empty)}`);
    if (EMPTY.h > 260) fail('빈 칸이 김(260px 넘음)', `${tag} ${EMPTY.h}px`);
    await layout(p, tag); errsOf(p, tag); bump('빈 칸 판');
  } catch (e) { fail('빈 칸 판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑤ 적기 · 팔았어 · 잘못 적었어 — 빈 기기에서(390×844) · 기억 못 하는 기계(360×640) */
async function addOne(p, tag, q, wantName, price, qty, day = TODAY) {
  if (!(await p.locator(`${SEL} form.hd-add`).count())) await p.locator(`${SEL} button.hd-add-b`).click();
  await p.locator(`${SEL} input.hd-in-s`).fill(q);
  const hit = p.locator(`${SEL} .hd-hit`).filter({has: p.locator(`span[data-proper]:text-is("${wantName}")`)}).first();
  await hit.waitFor({timeout: 20000}); await hit.click();
  const chosen = await p.locator(`${SEL} .hd-chosen b`).textContent();
  if (chosen !== wantName) fail('고른 종목', `${tag} 「${chosen}」 ≠ ${wantName}`);
  const inputs = p.locator(`${SEL} form.hd-add input.hd-in-n`);
  await inputs.nth(0).fill(price); await inputs.nth(1).fill(qty); await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(day);
  await p.locator(`${SEL} form.hd-add button.hd-go`).click();
}
const errText = p => p.locator(`${SEL} .hd-err`).first().textContent().catch(() => '');
{
  const tag = '적기 · 팔기 390×844', p = await newPage(390, 844, {holds: [], recs: []});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    if (g.cards.length || !eq(g.empty, ['아직 적은 보유종목이 없어요.']) || g.leg) fail('빈 칸은 짧게(제목 · 한 줄 · 적기 — 색 풀이 · 긴 줄 없음)', `${tag} ${JSON.stringify(g.empty)} ${g.leg}`);
    await p.locator(`${SEL} button.hd-add-b`).click();
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '종목을 먼저 골라 줘.') fail('틀린 입력 글(종목)', `${tag} 「${await errText(p)}」`);
    await layout(p, tag + ' 적기 칸');
    await addOne(p, tag, '삼성전자', '삼성전자', 'abc', '3');
    if ((await errText(p)) !== '산 값을 숫자로 적어 줘.') fail('틀린 입력 글(산 값)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(0).fill('240,000'); await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(1).fill('');
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '수량을 숫자로 적어 줘.') fail('틀린 입력 글(수량)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(1).fill('3'); await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(addD(TODAY, 1));
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '산 날은 오늘이나 그 전이어야 해.') fail('틀린 입력 글(산 날)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(TODAY); await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
    let st = await store(p), n0 = st?.length ?? 0;
    const o = st?.[0];
    if (!(n0 === 1 && o.code === '005930' && o.buy === 240000 && o.qty === 3 && o.day === TODAY)) fail('적은 것 기억(종목 · 산 값 · 수량 · 산 날)', `${tag} ${JSON.stringify(st)}`);
    g = await p.evaluate(READH, SEL); checkAsk(g.cards[0], {buy: 240000}, tag + ' 새로 적은 것');
    await p.locator(`${SEL} article.hd-card button.hd-opt`).first().click(); await p.waitForSelector(`${SEL} article.hd-card .hd-ret`, {timeout: 10000});
    // 나눠 팖 — 3주 가운데 1주(판 몫은 지난 보유 · 남은 2주는 그대로)
    await p.locator(`${SEL} article.hd-card button.hd-sold`).click();
    const sf = p.locator(`${SEL} article.hd-card form.hd-form`), sIn = sf.locator('input.hd-in-n');
    await sf.locator('input.hd-in-d').fill(TODAY); await sIn.nth(0).fill('250,000'); await sIn.nth(1).fill('5'); await sf.locator('button.hd-go').click();
    if ((await sf.locator('.hd-err').textContent()) !== '판 수량은 0보다 크고 3주 이하여야 해.') fail('틀린 입력 글(판 수량)', `${tag} 「${await sf.locator('.hd-err').textContent()}」`);
    await sIn.nth(1).fill('1'); await sf.locator('button.hd-go').click();
    await p.waitForFunction(s => !!document.querySelector(s + ' details.hd-past'), SEL, {timeout: 10000});
    st = await store(p);
    const live = st.filter(x => !x.sold && !x.wrong), gone = st.filter(x => x.sold);
    if (st.length !== 2 || live.length !== 1 || live[0].qty !== 2 || gone.length !== 1 || gone[0].qty !== 1 || gone[0].sold.price !== 250000 || gone[0].sold.day !== TODAY || gone[0].buy !== 240000) fail('나눠 팖 기억(지우지 않음)', `${tag} ${JSON.stringify(st)}`);
    g = await p.evaluate(READH, SEL);
    if (g.pastN !== '지난 보유 1곳') fail('지난 보유 수', `${tag} 「${g.pastN}」`);
    // 다 팖 — 남은 2주
    await p.locator(`${SEL} article.hd-card button.hd-sold`).click();
    const sf2 = p.locator(`${SEL} article.hd-card form.hd-form`);
    await sf2.locator('input.hd-in-d').fill(TODAY); await sf2.locator('input.hd-in-n').nth(0).fill('230000'); await sf2.locator('input.hd-in-n').nth(1).fill('2'); await sf2.locator('button.hd-go').click();
    await p.waitForFunction(s => !document.querySelector(s + ' article.hd-card'), SEL, {timeout: 10000});
    st = await store(p);
    if (st.length !== 2 || st.some(x => !x.sold)) fail('다 팖 → 지난 보유(줄 수 그대로)', `${tag} ${JSON.stringify(st)}`);
    await p.locator(`${SEL} details.hd-past > summary`).click(); g = await p.evaluate(READH, SEL);
    if (g.pastN !== '지난 보유 2곳' || !g.pastRows.some(t => t.includes(`산 값 240,000원 → 판 값 250,000원 ${pct((250000 / 240000 - 1) * 100)}`)) || !g.pastRows.some(t => t.includes(`산 값 240,000원 → 판 값 230,000원 ${pct((230000 / 240000 - 1) * 100)}`))) fail('지난 보유 줄(판 값 · 수익률)', `${tag} ${JSON.stringify(g.pastRows)}`);
    await layout(p, tag + ' 지난 보유');
    // 잘못 적었어 — 번호로 찾아 적고 「맞아, 옮겨 줘」 → 지난 보유 「잘못 적음」(지우지 않음)
    if (XH) {
      await addOne(p, tag, XH.code, XH.name, '100000', '1');
      await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
      await p.locator(`${SEL} article.hd-card button.hd-opt`).first().click();
      await p.locator(`${SEL} article.hd-card button.hd-wrong`).click(); await layout(p, tag + ' 잘못 적었어 칸');
      await p.locator(`${SEL} article.hd-card .hd-form button.hd-go`).click();
      await p.waitForFunction(s => !document.querySelector(s + ' article.hd-card'), SEL, {timeout: 10000});
      st = await store(p);
      if (st.length !== 3 || !st.find(x => x.code === XH.code)?.wrong) fail('잘못 적었어 → 지난 보유(지우지 않음)', `${tag} ${JSON.stringify(st)}`);
      g = await p.evaluate(READH, SEL);
      if (g.pastN !== '지난 보유 3곳') fail('지난 보유 수(잘못 적음 포함)', `${tag} 「${g.pastN}」`);
    }
    errsOf(p, tag); bump('적기 길');
  } catch (e) { fail('적기 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
{
  const tag = '기억 못 하는 기계 360×640', p = await newPage(360, 640, {store: 'throw'});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    if (!g.mem?.includes('이 기기는 기억을 못 해요')) fail('기억 못 함 「?」 줄', `${tag} 「${g.mem}」`);
    await addOne(p, tag, '삼성전자', '삼성전자', '240000', '1');
    await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
    g = await p.evaluate(READH, SEL); checkAsk(g.cards[0], {buy: 240000}, tag + ' 이 화면에만 적힘');
    await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-hold-1', when: new Date().toISOString(), base, path: NEXT, all: ALL, gatesSrc, gatesAsOf: GATE.asOf ?? null, scenes: SC.map(s => s.key), empty360: EMPTY, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, gatesSrc, scenes: res.scenes.length, empty360: EMPTY, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');

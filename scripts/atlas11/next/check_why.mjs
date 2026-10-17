// 고도리 매매일지(「친구야, 왜 사?」) 맞대기 — 사장님 2026-10-17(싱가포르) 21:10 「하나로 묶은 명령문」 [3] 1 · 3 ~ 7 · 9 · [6] 1 · 앞 판 17:54 「한 장 명령문」 명령 2 ~ 6 · 13
//   쓰는 법: node scripts/atlas11/next/check_why.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all] [--limit N]
//     --all = 길 아홉을 모든 판에서 · 기본(--limit 도 같음 — 다른 쪽 검사와 같은 꼴) = 첫 판은 아홉 길 · 나머지 판은 세 길
//   기준 = 사장님 글 — 질문 · 답 · 색 · 격언 · 점수 · 묶음 · 판정은 brief.md 코드 칸 · 매매일지는 order-2110.txt [3](글자 그대로 있는지 먼저 봄)
//          화면 모듈(site/next/p-why.js)은 쓰지 않음 — 점수 · 판정 · 팔 선 기본값(그날 값 × 0.9 · × 1.2 원 아래 버림)은 이 검사가 따로 셈 · 그날 값 = co/<번호>.json · 이름 = rename.mjs(brand.js 한 곳)
//   ⓪ 종목 고르기 — 찾기(#/find)와 같은 잣대(같은 말로 찾은 종목 차례 = 찾기 화면 앞 여섯) · 엔터 = 맨 위 회사 주식 · 최근 본 회사 · 못 찾음 글 · #/why/<번호> 처음부터 고름 ·
//      회사 화면 「이 회사로 왜 사?」 → #/why/<번호> · 없는 번호 · 틀린 번호 · 펀드 · 우선주 …는 누르지 않고 까닭 한 줄(찾기와 같은 글 · 일꾼 A 2026-10-17 22:3x 「k==='x' 는 질문 대신 w 줄」)
//   ① 질문 화면 — 한 화면에 하나 · 사장님 차례 · 글자 그대로 · 답 셋 글과 색 · 다음은 고른 뒤에만 · 고른 뒤 한마디 한 줄 · 격언(data-proper) · 고른 종목 한 줄(이름 · 그날 값 · 날짜)
//   ② 3번 「클 일이 있다」 — 날짜 칸(바로 씀) · 날짜 없이 다음 → 막고 알림 · 지난 날 → 막고 알림 · 날짜를 넣어야 다음 · 다른 답으로 바꾸면 기록에 날짜 없음
//   ③ 두 줄 — ① 칸에 바로 씀 · 빠른 말 · 빈 칸 막음 · ② 팔 선 기본값 = 그날 값 × 0.9 · × 1.2(원 아래 버림 · gdr.json 과 같은 셈) · 고치면 고친 값 · 앞 숫자 ≥ 뒤 숫자 막음 · 그날 값 없는 종목은 빈 칸 · 엔터 = 결과
//   ④ 결과 — 점수 · 🔴 수 · 판정 · 네 묶음 막대(숫자 · 길이) · 두 줄 요약 · 기록 알림 · 다시 하기 = 처음(종목 고르기 · 처음부터 고른 종목이면 1번)
//   ⑤ 기록 — 끝낼 때 한 번 · 꼴 {at, asOf, code, name, price, day, answers, score, reds, verdict, groups, bigDay, why, promise: {sell, half, text}, picks} · 매매일지 화면 아래 목록이 그 자리에서 늘어남 ·
//      옛 기록(종목 없음)도 그대로 · 서른 줄까지 · 한 달 지난 기록 = 그날 고도리 칸 결과 + 같은 기간 코스피(따로 셈 · 두 날이 다 있을 때만 숫자) · 지우는 단추 없음
//   ⑥ whyCard(G, {code, onDone}) — 처음부터 고른 종목 · 결과를 그린 뒤 onDone 한 번(기록 · 남겼나) · 매매일지 고리 · meRecords() · doneOnce()
//   ⑦ 기억 못 하는 기계(localStorage 막힘 · 쓰기만 막힘) · 고도리 칸 자료 못 받음 · 망가진 줄 · 첫 화면 칸(있을 때만) — 끝까지 되고 화면 오류 0
//   ⑧ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · 캔버스 0 · 쓰지 않을 말 0 · 옛 이름 0(남의 글 data-proper 밖 · 이름표 글 포함)
//   ⑨ 걸린 때 — 종목 이름 → 엔터 → 열한 질문 → 빠른 말 → 결과(기계가 누른 때 · 누름 수)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME, SAFE_LINE, TITLE_TAIL, OLD_NAME_RE} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // run_all.mjs 는 PW_DIR 로도 넘김
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all');
const fails = [], counts = {}, t0 = Date.now(), timing = {};
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 기준 ① — 사장님 명령 원문(brief.md 코드 칸)의 질문 · 답 · 색 · 격언 */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const COLOR = {'🟢': 'g', '🟡': 'y', '🔴': 'r'};
const QS = [];
for (const line of ((BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0] ?? '').split('\n')) {
  const m = /^(\d{1,2}) (.+?\?) (.+?) -(.+)$/u.exec(line.trim()); if (!m) continue;
  QS.push({n: +m[1], q: m[2], a: [...m[3].matchAll(/([🟢🟡🔴])([^🟢🟡🔴]+)/gu)].map(x => [COLOR[x[1]], x[2].trim()]), say: m[4].trim()});
}
if (QS.length !== 11 || QS.some((Q, i) => Q.n !== i + 1 || Q.a.length !== 3)) { console.error('사장님 명령 원문(질문 열한 개)을 brief.md 에서 못 읽음', QS.length); process.exit(1); }
for (const t of ['색: 🟢0점 🟡1점 🔴2점', '묶음: 이유1~3 · 돈4,9,11 · 때5~6 · 마음7,8,10', '판정: 0~5 「좋아, 정해 둔 대로만」 6~11 「반만 준비됐어」 12 이상·🔴넷 이상 「오늘은 쉬어 가자」'])
  if (!BRIEF.includes(t)) fail('기준 글이 바뀜(brief.md — 이 검사의 셈을 고칠 것)', t);
/* 기준 ② — 매매일지 [3](order-2110.txt · 줄바꿈 · 빈칸을 하나로 보고 맞댐) — 바뀌면 이 검사의 셈도 고쳐야 함 */
const ORDER = (await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '')).replace(/\s+/g, ' ');
if (!ORDER.trim()) fail('기준 파일을 못 읽음', 'docs/design/godori-2026-10-17/order-2110.txt(사장님 원문) — 저장소에 함께 올릴 것');
else for (const t of ['왜 사? 맨 앞에 종목 고르기를 둬라. 찾기와 같은 잣대를 써라.', '3번 답이 「클 일이 있다」면 그 일이 언제인지 날짜를 받아라.', '① 1년 뒤 반토막 났다면 왜?', '② 만약 ~이면 ~한다 (팔 약속)',
  '팔 약속 기본값: 산 값 × 0.9, 절반 × 1.2 (gdr.json과 같게)', '기록마다 종목, 날짜, 그날 값, 두 줄을 쌓아라. 지우는 단추는 두지 마라', '왜 사? 기록은 매매일지 화면 아래로 옮겨라.', '전체가 1분 안에 끝나게 하라.'])
  if (!ORDER.includes(t)) fail('기준 글이 바뀜(order-2110.txt [3] — 이 검사의 셈을 고칠 것)', t);
const PTS = {g: 0, y: 1, r: 2}, MAX = QS.length * 2;
const GROUPS = [['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]];
const V_OK = '좋아, 정해 둔 대로만', V_HALF = '반만 준비됐어', V_REST = '오늘은 쉬어 가자';
const BIG_Q = 2, BIG_A = QS[BIG_Q].a.findIndex(a => a[1] === '클 일이 있다');
if (BIG_A < 0) { console.error('3번 답에 「클 일이 있다」가 없음(brief.md)'); process.exit(1); }
/** 답 자리(0 ~ 2) 열한 개 → 점수 · 빨강 수 · 묶음 · 판정(원문 명령 5 · 6) */
function judge(ks) {
  const p = ks.map((k, i) => PTS[QS[i].a[k][0]]), score = p.reduce((s, x) => s + x, 0), reds = p.filter(x => x === 2).length;
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + p[q - 1], 0)]));
  return {score, reds, groups, verdict: score >= 12 || reds >= 4 ? V_REST : score >= 6 ? V_HALF : V_OK};
}
/** 팔 약속 기본값([3] 5 · 원 아래 버림) · 약속 글(「만약 ~이면 ~한다」 꼴) */
const SELL = p => Math.floor(p * 9 / 10), HALF = p => Math.floor(p * 12 / 10);
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const promiseTxt = (s, h) => `만약 ${won(s)} 아래로 가면 다 판다. 만약 ${won(h)} 위로 가면 절반 판다.`;
const idxOf = (qi, c) => { const want = c === 'R' ? 'r' : c, hit = QS[qi].a.map((a, k) => (a[0] === want ? k : -1)).filter(k => k >= 0), k = c === 'R' ? hit[1] : hit[0]; if (k == null) throw Error(`길 틀림: ${qi + 1}번 질문에 ${c} 답이 없음`); return k; };
// 길 아홉 — [이름, 색 열한 글자, 기대 점수, 기대 판정, 할 일] · pick = 종목 고르는 법(enter · click · recent) · why = 두 줄 쓰는 법(enter · chip · edit · check) · date = 'bad'(날짜 없이 · 지난 날 먼저) · big3 = 'switch'(3번을 「클 일」 + 날짜로 골랐다가 바꿈) · back = 앞으로 단추 시험 · stock = 'cx'(그날 값 파일을 못 받는 회사)
const PATHS = [
  ['모두 초록', 'ggggggggggg', 0, V_OK, {pick: 'enter', why: 'chip'}],
  ['빨강 넷 · 합 12 밑', 'rrrrggggggg', 8, V_REST, {pick: 'recent', why: 'enter'}],
  ['노랑 여섯 · 합 6', 'yyyyyyggggg', 6, V_HALF, {pick: 'enter', why: 'check', date: 'bad', stock: 'cx'}],
  ['빨강 셋 · 합 6', 'ggggrgrggRg', 6, V_HALF, {pick: 'click', why: 'edit'}],
  ['합 5', 'gygygygyygg', 5, V_OK, {pick: 'click', why: 'enter'}],
  ['빨강 셋 노랑 다섯 · 합 11', 'yyryyyggrRg', 11, V_HALF, {pick: 'click', why: 'chip'}],
  ['빨강 셋 노랑 여섯 · 합 12', 'ryyyyryyggr', 12, V_REST, {pick: 'click', why: 'edit'}],
  ['섞음 · 앞으로 단추', 'rygyrgyrgRy', 12, V_REST, {pick: 'enter', back: 'g', big3: 'switch', why: 'chip'}],
  ['모두 빨강', 'rrrrrrrrrrr', 22, V_REST, {pick: 'enter', why: 'enter'}],
].map(([name, spec, score, verdict, o]) => ({name, spec, ks: [...spec].map((c, i) => idxOf(i, c)), score, verdict, ...(o || {})}));
for (const P of PATHS) { const J = judge(P.ks); if (J.score !== P.score || J.verdict !== P.verdict) { console.error('길 자체가 틀림', P.name, J); process.exit(1); } }
const SHORT = ['모두 초록', '섞음 · 앞으로 단추', '모두 빨강'];
if (!PATHS.some(P => P.ks[BIG_Q] === BIG_A)) { console.error('길에 3번 「클 일이 있다」가 없음'); process.exit(1); }

/* 쓰지 않을 말(brief2.md · next_check 와 같은 말 + 사장님 [7] 6 「팔아라」) — 남의 글 data-proper 밖에서 */
const BANNED = ['추천', '매수', '매도', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사세요', '사라', '파세요', '팔아라', '팔라'];
const KEY = 'atlas:godori-why', REC_KEYS = ['answers', 'asOf', 'at', 'bigDay', 'code', 'day', 'groups', 'name', 'picks', 'price', 'promise', 'reds', 'score', 'verdict', 'why'];

/* 자료(시험 서버에서) — 고도리 칸 · 종목 셋의 그날 값 · 지수 줄 */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const G = await getJ('/next/data/gdr.json').catch(e => { bump(NEW_NAME + ' 칸 자료 못 받음(기록 기대 = 빈 목록)'); console.error(e.message); return null; });
const pickRec = g => (Array.isArray(g?.picks) ? g.picks.map(p => ({code: p.code, name: p.name, price: p.price, w: p.w})) : []);
const recAsOf = g => (Array.isArray(g?.picks) ? g.asOf ?? null : null);
for (const p of G?.picks ?? []) if (p.sell !== SELL(p.price) || p.half !== HALF(p.price)) fail('gdr.json 팔 선이 매매일지 기본값 셈과 다름([3] 5 「gdr.json과 같게」)', `${p.code} ${p.price} → ${p.sell} · ${p.half}`);
const HOME = await getJ('/atlas/data/home.json').catch(() => null);
const NAMES = await getJ('/atlas/data/names.json').catch(() => null);
async function stockOf(code) {
  const j = await getJ('/atlas/data/co/' + code + '.json').catch(() => null), c = j?.c;
  if (c && c.price > 0) return {code, name: c.name, price: c.price, day: c.priceDate ?? null, co: true};
  const r = NAMES?.rows?.find(x => x.c === code);
  return r ? {code, name: r.n, price: null, day: null, co: false} : null;
}
const ST = {co1: await stockOf('005930'), co2: await stockOf(G?.picks?.[0]?.code ?? '000660'), x1: await stockOf('005935'), cx: await stockOf('035720')};
for (const [k, v] of Object.entries(ST)) if (!v) { console.error('시험 종목 자료를 못 받음', k); process.exit(1); }
{ const c = NAMES?.rows?.find(r => /[A-Z]/.test(r.c) && !r.k)?.c, s = c ? await stockOf(c) : null; if (s?.co) ST.coL = s; else bump('글자 섞인 번호 회사 없음(그 시험 건너뜀)'); } // 글자 섞인 번호 회사(작은 글자 주소 시험)
if (ST.x1.co || ST.x1.price != null) { console.error('005935 가 회사 주식 파일을 가짐 — 펀드 · 우선주 시험을 바꿀 것'); process.exit(1); }
if (!ST.cx.co || [ST.co1, ST.co2].some(s => s.code === ST.cx.code) || (G?.picks ?? []).some(p => p.code === ST.cx.code)) { console.error('그날 값 못 받는 회사 시험 종목을 바꿀 것', ST.cx.code); process.exit(1); }
ST.x1.w = NAMES?.rows?.find(r => r.c === ST.x1.code)?.w ?? null; // 찾기와 같은 까닭 글
ST.cx = {...ST.cx, price: null, day: null}; // 판 A 에서 이 회사 파일을 못 받게 함 → 「? 그날 값 없음」 · 팔 선은 직접
const CX_FILE = '/atlas/data/co/' + ST.cx.code + '.json';

/* 날짜 · 글(화면과 같은 꼴 · 보는 기계 시간대 = 서울로 엶) */
const TZ = 'Asia/Seoul';
const isoIn = ms => new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(ms));
const dayTxt = ms => { const [y, m, d] = isoIn(ms).split('-'); return `${+y}년 ${+m}월 ${+d}일`; };
const ymdTxt = s => `${+s.slice(0, 4)}년 ${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
const mdTxt = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? `${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일` : '?');
const FUTURE = isoIn(Date.now() + 40 * 864e5), PAST = isoIn(Date.now() - 864e5); // 3번 날짜 — 40일 뒤 · 어제
function pctTxt(x) { if (x == null || !Number.isFinite(x)) return '?'; const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; if (r === 0) return '0.0%'; return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%'; }
const clsOf = x => (pctTxt(x) === '0.0%' ? 'fl' : x > 0 ? 'up' : 'dn');

/* 브라우저 — 한 번에 하나 · 판마다 새 칸(기억이 따로) */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** store: 'ok' · 'throw'(localStorage 자체가 막힘) · 'nowrite'(쓰기만 막힘) · gdr404 = 고도리 칸 자료 못 받음 · home = 지수 줄을 바꿔 줌(같은 기간 코스피 셈 시험) · allow = 일부러 못 받게 한 파일 */
async function newPage(width, height, {store = 'ok', gdr404 = false, home = null, allow = [], block = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: TZ});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  if (store === 'nowrite') await ctx.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('가득', 'QuotaExceededError'); }; });
  if (gdr404) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}));
  for (const f of block) await ctx.route('**' + f, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})); // 일부러 못 받게 한 파일(allow 에도 넣음)
  if (home) await ctx.route('**/atlas/data/home.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(home)}));
  const p = await ctx.newPage(); p._errs = []; p._home = home ?? HOME;
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
async function open(p, hash, sel) { // 같은 주소면 다시 불러옴(같은 # 로 가면 화면이 안 바뀜 — 기억에 넣은 기록을 다시 읽게)
  if (p.url() === base + NEXT + hash) await p.reload({waitUntil: 'domcontentloaded'}); else await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), sel, {timeout: 30000});
}
async function go(p, hash, sel) {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForFunction(([h, s]) => location.hash === h && !!document.querySelector(s) && !document.querySelector('#view .boot'), [hash, sel], {timeout: 30000});
}
const getRecs = p => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return null; } }, KEY);
const setRecs = (p, a) => p.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [KEY, a]);
const waitStk = (p, sel) => p.waitForFunction(s => { const e = document.querySelector(s + ' .wy-stk:not([hidden])'); return !!e && !/받는 중/.test(e.textContent); }, sel, {timeout: 20000});
const modCall = (p, fn) => p.evaluate(async f => { const W = await import('/next/p-why.js'); return f === 'done' ? W.doneOnce() : f === 'me' ? (() => { const e = W.meRecords(); return {h: e.querySelector('h2')?.textContent ?? '', rows: e.querySelectorAll('.wy-rec').length, btn: e.querySelectorAll('button, input, select, textarea, [role="button"]').length}; })() : null; }, fn);

/* 화면에서 읽기(화면 안에서 돎 — 바깥 것을 쓰지 않음) */
const READQ = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const opts = [...s.querySelectorAll('.wy-opts .wy-opt')].map(b => ({t: b.querySelector('span:not(.wy-dot)')?.textContent ?? '', c: (/\bwy-([gyr])\b/.exec(b.querySelector('.wy-dot')?.className ?? '') || [])[1] ?? null, pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on')}));
  const d = s.querySelector('.wy-date'), a = document.activeElement;
  return {step: s.querySelector('.wy-step')?.textContent ?? null, q: s.querySelector('.wy-q')?.textContent ?? null, group: s.querySelector('.wy-opts')?.getAttribute('aria-label') ?? null, opts,
    one: s.querySelector('.wy-one span')?.textContent ?? null, say: s.querySelector('.wy-say q[data-proper]')?.textContent ?? null, sayAny: !!s.querySelector('.wy-say'),
    next: s.querySelector('.wy-nav .wy-next')?.textContent ?? null, back: s.querySelector('.wy-nav .wy-back')?.textContent ?? null, res: !!s.querySelector('.wy-res'), live: s.querySelector('.wy-live')?.textContent ?? '',
    stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null, stkName: s.querySelector('.wy-stk:not([hidden]) .wy-stn[data-proper]')?.textContent ?? null,
    date: d ? {v: d.value, min: d.min, type: d.type, label: d.closest('label')?.textContent ?? ''} : null, err: s.querySelector('.wy-err')?.textContent ?? null,
    find: s.querySelector('.wy-find')?.value ?? null, why: !!s.querySelector('.wy-why'), focus: a && s.contains(a) ? a.className : ''};
};
const READL = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const a = document.activeElement, v = c => s.querySelector(c)?.value ?? null;
  return {step: s.querySelector('.wy-step')?.textContent ?? null, qs: [...s.querySelectorAll('.wy-q')].map(x => x.textContent), why: v('.wy-why'), sell: v('.wy-sell'), half: v('.wy-half'),
    chips: [...s.querySelectorAll('.wy-quick button')].map(b => b.textContent), rows: [...s.querySelectorAll('.wy-pr')].map(r => r.textContent),
    notes: [...s.querySelectorAll('.wy-note')].map(x => x.textContent), err: s.querySelector('.wy-err')?.textContent ?? null, focus: a && s.contains(a) ? a.className : '', res: !!s.querySelector('.wy-res'),
    stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null};
};
const READR = sel => {
  const s = document.querySelector(sel), r = s?.querySelector('.wy-res'); if (!r) return null;
  const bars = [...r.querySelectorAll('.wy-bars .wy-bar')].map(b => { const f = b.querySelector('.wy-fill'), t = b.querySelector('.wy-track'); return {n: b.querySelector('.wy-bn')?.textContent ?? '', v: b.querySelector('b.num')?.textContent ?? '', w: f?.style.width ?? '', fw: f ? f.getBoundingClientRect().width : -1, tw: t ? t.getBoundingClientRect().width : -1}; });
  return {score: r.querySelector('.wy-score b.num')?.textContent ?? null, of: r.querySelector('.wy-score span.num')?.textContent ?? null, reds: r.querySelector('.wy-reds')?.textContent ?? null,
    verdict: r.querySelector('.wy-verdict b')?.textContent ?? null, bars, notes: [...r.querySelectorAll(':scope > .wy-note')].map(x => x.textContent), btns: [...r.querySelectorAll('.wy-nav button')].map(x => x.textContent),
    link: r.querySelector('a.wy-link')?.getAttribute('href') ?? null, linkT: r.querySelector('a.wy-link')?.textContent ?? null, q: s.querySelectorAll('.wy-q, .wy-opt, .wy-find, .wy-why').length, live: s.querySelector('.wy-live')?.textContent ?? '',
    lines: [...r.querySelectorAll('.wy-lines p')].map(x => x.textContent), mine: r.querySelector('.wy-lines q.wy-mine[data-proper]')?.textContent ?? null, stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null};
};
const READLIST = () => {
  const s = document.querySelector('#view section.wy-me'); if (!s) return null;
  return {h: s.querySelector('h2')?.textContent ?? '', rows: [...s.querySelectorAll('.wy-rec')].map(r => ({day: r.querySelector('.wy-rh b')?.textContent ?? '', rest: [...r.querySelectorAll('.wy-rh span')].map(x => x.textContent).join(''),
    stk: r.querySelector('.wy-rs')?.textContent ?? null, stkName: r.querySelector('.wy-rs .wy-stn[data-proper]')?.textContent ?? null,
    bars: [...r.querySelectorAll('.wy-bar b.num')].map(x => x.textContent), lines: [...r.querySelectorAll('.wy-lines p')].map(x => x.textContent), mine: r.querySelector('.wy-lines q.wy-mine[data-proper]')?.textContent ?? null,
    notes: [...r.querySelectorAll(':scope > p.note')].map(x => x.textContent), up: r.querySelector(':scope > p.note b.num')?.className ?? null, kb: r.querySelector(':scope > p.note b:last-of-type')?.className ?? null})),
    btn: [...s.querySelectorAll('button, [role="button"], input, select, textarea')].map(x => x.textContent.trim() || x.getAttribute('aria-label') || x.tagName)};
};
/** 지우는 단추 — 화면 어디에도(누르는 것 가운데 「지우 · 지움 · 삭제」) */
const DELS = root => [...document.querySelectorAll(root + ' a, ' + root + ' button, ' + root + ' [role="button"]')].filter(e => /지우|지움|삭제/.test(e.textContent + ' ' + (e.getAttribute('aria-label') ?? ''))).map(e => e.textContent.trim());
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말 · 옛 이름(남의 글 data-proper 밖 · 이름표 글 포함) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || e.value || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue; // 눈에 안 보이는 읽기 칸(.wy-live 1px)
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || (/^(INPUT|TEXTAREA)$/.test(e.tagName) && (e.value || e.placeholder));
    if (cs.visibility !== 'hidden' && hasText && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
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
  const T = s.text + '\n' + s.attrs.join('\n');
  for (const b of BANNED) if (T.includes(b)) fail('쓰지 않을 말', `${tag} 「${b}」`);
  if (OLD_NAME_RE.test(T)) fail('옛 이름 남음', `${tag} 「${(OLD_NAME_RE.exec(T) || [])[0]}」`);
}

/* ⓪ 종목 고르기 */
const stockLine = st => (st.price != null ? [st.name, won(st.price), `${mdTxt(st.day)} 종가`] : [st.name, '? 그날 값 없음']);
function checkStk(text, name, st, at) {
  if (text == null || name !== st.name || !stockLine(st).every(x => text.includes(x))) fail('고른 종목 한 줄(이름 · 그날 값 · 날짜)', `${at} 「${text}」 이름 「${name}」 · 기대 ${JSON.stringify(stockLine(st))}`);
}
async function pickStock(p, sel, st, how, T) {
  const hit = c => p.locator(`${sel} .wy-hit[data-code="${c}"]`);
  if (how === 'recent') {
    await p.fill(sel + ' .wy-find', '');
    const n = await p.locator(sel + ' .wy-hits .wy-hit').count(), lab = await p.locator(sel + ' .wy-hits .wy-note').first().textContent().catch(() => '');
    if (!n || lab !== '최근 본 회사') fail('최근 본 회사(빈 찾기 칸)', `${T} ${n}개 · 「${lab}」`);
    if (await hit(st.code).count()) { await hit(st.code).first().click({timeout: 8000}); bump('최근 본 회사로 고름'); return; }
    how = 'enter';
  }
  const typed = async q => { await p.fill(sel + ' .wy-find', q); await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [sel, q], {timeout: 15000}); };
  await typed(how === 'click' ? st.name.slice(0, 2) : st.name);
  if (how === 'click') {
    if (!(await hit(st.code).count())) await typed(st.name);
    await hit(st.code).first().click({timeout: 8000}); bump('찾아서 눌러 고름'); return;
  }
  const firstCode = await p.locator(sel + ' .wy-hits .wy-hit').first().getAttribute('data-code');
  if (firstCode !== st.code) fail('이름을 다 쓰면 그 종목이 맨 위', `${T} 「${st.name}」 → ${firstCode}`);
  await p.press(sel + ' .wy-find', 'Enter'); bump('엔터로 고름');
}

/* ① 질문 한 화면 맞대기 — picked = 고른 답 자리(아직이면 null) */
const ONE = QS.map(() => [new Map(), new Map(), new Map()]); // 질문마다 답마다 본 한마디(판마다 같은지)
function checkQ(s, qi, picked, T, st) {
  const Q = QS[qi], at = `${T} ${qi + 1}번`;
  if (!s) { fail('질문 칸 없음', at); return; }
  if (s.res) fail('결과가 일찍 나옴', at);
  if (s.step !== `${qi + 1} / ${QS.length}`) fail('질문 차례 글', `${at} 「${s.step}」`);
  if (s.q !== `${qi + 1}. ${Q.q}`) fail('질문 글자(원문)', `${at} 「${s.q}」 ≠ 「${qi + 1}. ${Q.q}」`);
  if (s.group !== Q.q) fail('답 묶음 이름표', `${at} 「${s.group}」`);
  if (st) checkStk(s.stk, s.stkName, st, at);
  if (s.opts.length !== 3) { fail('답 수', `${at} ${s.opts.length}`); return; }
  s.opts.forEach((o, k) => {
    if (o.t !== Q.a[k][1]) fail('답 글자(원문 차례)', `${at} ${k + 1}째 「${o.t}」 ≠ 「${Q.a[k][1]}」`);
    if (o.c !== Q.a[k][0]) fail('답 색(🟢 0 · 🟡 1 · 🔴 2)', `${at} 「${Q.a[k][1]}」 ${o.c} ≠ ${Q.a[k][0]}`);
    const want = picked === k;
    if (o.pressed !== String(want) || o.on !== want) fail('고른 답 표시', `${at} 「${o.t}」 aria-pressed=${o.pressed} on=${o.on} · 기대 ${want}`);
  });
  if (s.back == null) fail('앞으로 단추(1번은 종목 고르기로)', at);
  const big = qi === BIG_Q && picked === BIG_A;
  if (!!s.date !== big) fail('3번 「클 일이 있다」 날짜 칸', `${at} 날짜 칸 ${s.date ? '있음' : '없음'} · 답 ${picked}`);
  if (big && (s.date.type !== 'date' || !/언제/.test(s.date.label))) fail('날짜 칸 꼴', `${at} ${JSON.stringify(s.date)}`);
  if (picked == null) {
    if (s.next != null) fail('고르기 전에 다음 단추', at);
    if (s.one != null || s.sayAny) fail('고르기 전에 한마디 · 격언', at);
    return;
  }
  if (s.next == null) fail('고른 뒤 다음 단추 없음', at);
  if (!s.one || /[\n\r]/.test(s.one) || s.one.length > 60) fail(NEW_NAME + ' 한마디 한 줄', `${at} 「${s.one}」`);
  else { const seen = ONE[qi][picked]; seen.set(s.one, (seen.get(s.one) || 0) + 1); }
  if (big && !/날짜/.test(s.one ?? '')) fail('「클 일이 있다」 한마디가 날짜를 말함([3] 3)', `${at} 「${s.one}」`);
  if (!s.live.includes(s.one ?? '\u0000')) fail('읽어 주는 칸(aria-live)에 한마디 없음', at);
  if (s.say !== Q.say) fail('격언(원문 · data-proper)', `${at} 「${s.say}」 ≠ 「${Q.say}」`);
  bump('맞댄 질문 화면');
}

/** 길 하나 — 종목 고르기(pre = 처음부터 고름)부터 결과 · 기록 · 목록까지 · keep = 결과 화면을 남김 · page = 매매일지 화면(아래 목록이 있음) */
async function runPath(p, sel, P, tag, o = {}) {
  const {scan = false, scanSel = sel, store = 'ok', gdrX = G, keep = false, recCheck = true, pre = null, page = true, why0 = null} = o;
  const st = pre ?? ST[P.stock ?? 'co1'], T = `${tag} · ${P.name}`, before = store === 'ok' && recCheck ? await getRecs(p) : null, tStart = Date.now();
  const click = async (css, k = 0) => { await p.locator(sel + ' ' + css).nth(k).click({timeout: 8000}); };
  let s = await p.evaluate(READQ, sel);
  if (pre) { if (s?.step !== `1 / ${QS.length}` || s.find != null) fail('처음부터 고른 종목 — 1번 질문부터', `${T} 「${s?.step}」`); }
  else {
    if (s?.find == null || s.step !== '종목 고르기' || !/종목/.test(s.q ?? '')) { fail('맨 앞 = 종목 고르기([3] 1)', `${T} 「${s?.step}」 「${s?.q}」`); return null; }
    if (s.find !== '') fail('종목 고르기 칸이 비어 있지 않음', `${T} 「${s.find}」`);
    if (scan) await layout(p, scanSel, `${T} 종목 고르기`);
    await pickStock(p, sel, st, P.pick ?? 'enter', T);
  }
  await waitStk(p, sel).catch(() => fail('그날 값을 받지 못함(받는 중에 멈춤)', T));
  const ks = P.ks, k2first = P.back ? idxOf(1, P.back) : null; // 앞으로 단추 시험 — 2번은 처음에 다른 답(k2first)을 골랐다가 4번에서 돌아가 바꿈
  for (let qi = 0; qi < QS.length; qi++) {
    s = await p.evaluate(READQ, sel);
    checkQ(s, qi, null, T, st);
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고르기 전`);
    if (qi === BIG_Q && P.big3 === 'switch' && ks[qi] !== BIG_A) { // 「클 일이 있다」 + 날짜로 골랐다가 다른 답으로 바꿈 → 기록에 날짜 없음
      await click('.wy-opt', BIG_A); await p.fill(sel + ' .wy-date', FUTURE);
      checkQ(await p.evaluate(READQ, sel), qi, BIG_A, T + ' 클 일 먼저', st); bump('3번 날짜 넣고 답 바꿈');
    }
    const k0 = k2first != null && qi === 1 ? k2first : ks[qi];
    await click('.wy-opt', k0);
    s = await p.evaluate(READQ, sel); checkQ(s, qi, k0, T, st);
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고른 뒤`);
    if (k2first != null && qi === 1) { // 고른 답을 바로 바꿔 봄 — 한 답만 눌림
      const kAlt = (k0 + 1) % 3; await click('.wy-opt', kAlt); checkQ(await p.evaluate(READQ, sel), qi, kAlt, T + ' 바꿔 고름', st); await click('.wy-opt', k0);
    }
    if (qi === BIG_Q && k0 === BIG_A) { // [3] 3 — 날짜를 받아야 다음으로
      if (!/wy-date/.test(s.focus)) fail('날짜 칸에 바로 씀(누름 줄이기)', `${T} 3번 · 지금 「${s.focus}」`);
      if (s.date.min !== isoIn(Date.now())) fail('날짜 칸 가장 이른 날 = 오늘', `${T} ${s.date.min}`);
      if (P.date === 'bad') {
        await click('.wy-next'); let x = await p.evaluate(READQ, sel);
        if (x.step !== '3 / 11' || x.err !== '그 일이 언제인지 날짜를 적어 줘.') fail('날짜 없이 다음 → 막고 알림', `${T} 「${x.step}」 「${x.err}」`); else bump('날짜 없이 막음');
        await p.fill(sel + ' .wy-date', PAST); await click('.wy-next'); x = await p.evaluate(READQ, sel);
        if (x.step !== '3 / 11' || x.err !== '오늘이나 그 뒤 날짜를 적어 줘.') fail('지난 날 → 막고 알림', `${T} 「${x.step}」 「${x.err}」`); else bump('지난 날 막음');
      }
      await p.fill(sel + ' .wy-date', FUTURE);
      if (await p.locator(sel + ' .wy-err').count()) fail('날짜를 넣었는데 알림이 남음', T);
      if (scan) await layout(p, scanSel, `${T} 3번 날짜 칸`);
    }
    await click('.wy-next');
    if (k2first != null && qi === 2) { // 4번 화면(안 고름)에서 앞으로 두 번 → 2번을 바꿈 → 다음 두 번 → 4번은 그대로 안 고름
      checkQ(await p.evaluate(READQ, sel), 3, null, T + ' 앞으로 전', st);
      await click('.wy-back'); checkQ(await p.evaluate(READQ, sel), 2, ks[2], T + ' 앞으로 1', st);
      await click('.wy-back'); checkQ(await p.evaluate(READQ, sel), 1, k2first, T + ' 앞으로 2', st);
      await click('.wy-opt', ks[1]); checkQ(await p.evaluate(READQ, sel), 1, ks[1], T + ' 앞에서 바꿈', st);
      await click('.wy-next'); checkQ(await p.evaluate(READQ, sel), 2, ks[2], T + ' 다시 다음 1', st);
      await click('.wy-next'); bump('앞으로 단추 길');
    }
  }
  // ③ 두 줄
  await p.waitForFunction(s0 => !!document.querySelector(s0 + ' .wy-why'), sel, {timeout: 15000}).catch(() => {});
  let L = await p.evaluate(READL, sel);
  if (!L || L.why == null) { fail('두 줄 화면 없음', T); return null; }
  if (L.step !== '마지막 두 줄' || L.qs[0] !== '① 1년 뒤 반토막 났다면 왜?' || !/^② /.test(L.qs[1] ?? '')) fail('두 줄 글([3] 4)', `${T} ${JSON.stringify([L.step, ...L.qs])}`);
  if (!/wy-why/.test(L.focus)) fail('① 칸에 바로 씀(누름 줄이기)', `${T} 지금 「${L.focus}」`);
  if (L.why !== '' || L.err) fail('두 줄 처음 상태', `${T} 「${L.why}」 「${L.err}」`);
  checkStk(L.stk, st.name, st, T + ' 두 줄');
  const dS = st.price != null ? SELL(st.price) : null, dH = st.price != null ? HALF(st.price) : null;
  if (st.price != null ? (L.sell !== dS.toLocaleString('ko-KR') || L.half !== dH.toLocaleString('ko-KR')) : (L.sell !== '' || L.half !== '')) fail('팔 약속 기본값(그날 값 × 0.9 · × 1.2 · 원 아래 버림)', `${T} 「${L.sell}」 「${L.half}」 · 기대 ${dS} · ${dH}`); else bump('맞댄 팔 약속 기본값');
  if (!(L.rows.length === 2 && /^만약.*원.*아래로 가면 다 판다\.$/.test(L.rows[0]) && /^만약.*원.*위로 가면 절반 판다\.$/.test(L.rows[1]))) fail('② 「만약 ~이면 ~한다」 두 줄', `${T} ${JSON.stringify(L.rows)}`);
  if (st.price != null ? !L.notes.some(t => t.includes(`그날 값 ${won(st.price)}`)) : !L.notes.some(t => /^\? 그날 값이 없어요/.test(t))) fail('팔 약속 밑 알림', `${T} ${JSON.stringify(L.notes)}`);
  if (L.chips.length < 2 || L.chips.some(c => !c.trim())) fail('빠른 말', `${T} ${JSON.stringify(L.chips)}`);
  if (scan) await layout(p, scanSel, `${T} 두 줄`);
  let whyT = why0 ?? `이익이 반으로 줄어서 ${P.name.length}`, sell = dS, half = dH;
  const how = st.price == null && P.why !== 'check' ? 'check' : P.why;
  if (how === 'chip') {
    const k = Math.min(1, L.chips.length - 1); await click('.wy-quick button', k); whyT = L.chips[k];
    const v = await p.inputValue(sel + ' .wy-why'); if (v !== whyT) fail('빠른 말 → ① 칸', `${T} 「${v}」 ≠ 「${whyT}」`); else bump('빠른 말로 씀');
    await click('.wy-nav .wy-next');
  } else if (how === 'enter') {
    await p.fill(sel + ' .wy-why', whyT); await p.press(sel + ' .wy-why', 'Enter'); bump('엔터로 결과');
  } else if (how === 'edit') {
    sell = Math.floor(st.price * 8 / 10); half = Math.floor(st.price * 15 / 10);
    await p.fill(sel + ' .wy-why', '  ' + whyT + '  ');
    await p.fill(sel + ' .wy-sell', String(sell)); await p.fill(sel + ' .wy-half', String(half)); await p.locator(sel + ' .wy-why').focus(); // 칸을 떠나면 쉼표
    const v = [await p.inputValue(sel + ' .wy-sell'), await p.inputValue(sel + ' .wy-half')];
    if (!eq(v, [sell.toLocaleString('ko-KR'), half.toLocaleString('ko-KR')])) fail('고친 팔 선 쉼표', `${T} ${JSON.stringify(v)}`);
    await click('.wy-nav .wy-next'); bump('팔 선 고쳐 씀');
  } else { // check — 빈 칸 · 빈 숫자 · 앞 ≥ 뒤를 막고 알림 · 그다음 바르게
    const tryRes = async (want, what) => { await click('.wy-nav .wy-next'); const x = await p.evaluate(READL, sel); if (!x || x.res || x.err !== want) fail('두 줄 막기 · ' + what, `${T} 「${x?.err}」 ≠ 「${want}」`); else bump('두 줄 막음'); };
    await p.fill(sel + ' .wy-why', '   '); await tryRes('① 한 줄만 적어 줘. 아래 말을 눌러도 돼.', '빈 칸');
    if (!/wy-why/.test((await p.evaluate(READL, sel)).focus)) fail('막은 뒤 ① 칸으로', T);
    await p.fill(sel + ' .wy-why', whyT); await p.fill(sel + ' .wy-sell', ''); await tryRes('② 팔 선 두 숫자를 적어 줘.', '빈 숫자');
    await p.fill(sel + ' .wy-sell', '90000'); await p.fill(sel + ' .wy-half', '50000'); await tryRes('② 앞 숫자가 뒤 숫자보다 작아야 해.', '앞 ≥ 뒤');
    sell = 50000; half = 90000; await p.fill(sel + ' .wy-sell', '50,000원'); await p.fill(sel + ' .wy-half', '9만'); // 쉼표 · 「원」은 빼고 · 「만」은 만 원으로
    await click('.wy-nav .wy-next');
  }
  whyT = whyT.trim();
  // ④ 결과
  await p.waitForFunction(s0 => !!document.querySelector(s0 + ' .wy-res'), sel, {timeout: 15000}).catch(() => {});
  const J = judge(ks), r = await p.evaluate(READR, sel);
  if (!r) { fail('결과 칸 없음', T); return null; }
  if (r.q) fail('결과 화면에 질문 · 칸이 남음', T);
  if (r.score !== String(J.score) || r.of !== ' / ' + MAX) fail('점수(0 ~ 22)', `${T} 「${r.score}${r.of}」 ≠ ${J.score} / ${MAX}`);
  if (r.reds !== ` · 🔴 ${J.reds}개`) fail('빨강 수', `${T} 「${r.reds}」 ≠ ${J.reds}`);
  if (r.verdict !== `「${J.verdict}」`) fail('판정', `${T} 「${r.verdict}」 ≠ 「${J.verdict}」 (점수 ${J.score} · 빨강 ${J.reds})`);
  if (r.bars.length !== 4) fail('묶음 막대 수', `${T} ${r.bars.length}`);
  GROUPS.forEach(([n, qs], i) => {
    const b = r.bars[i], v = J.groups[n], mx = qs.length * 2; if (!b) return;
    if (b.n !== n) fail('묶음 이름 · 차례', `${T} ${i + 1}째 「${b.n}」 ≠ 「${n}」`);
    if (b.v !== `${v} / ${mx}`) fail('묶음 숫자', `${T} ${n} 「${b.v}」 ≠ ${v} / ${mx}`);
    if (b.w !== Math.round(v / mx * 100) + '%') fail('묶음 막대 길이(글)', `${T} ${n} ${b.w} ≠ ${Math.round(v / mx * 100)}%`);
    if (b.tw > 0 && Math.abs(b.fw - b.tw * v / mx) > 1.5) fail('묶음 막대 길이(그린 것)', `${T} ${n} ${b.fw.toFixed(1)} / ${b.tw.toFixed(1)} ≠ ${v} / ${mx}`);
  });
  const bigWant = ks[BIG_Q] === BIG_A ? FUTURE : null;
  checkStk(r.stk, st.name, st, T + ' 결과');
  if (r.mine !== whyT || !r.lines.some(t => t === '팔 약속 ' + promiseTxt(sell, half)) || (bigWant ? !r.lines.includes('클 일 ' + ymdTxt(bigWant)) : r.lines.some(t => /^클 일/.test(t)))) fail('결과의 두 줄 요약', `${T} ${JSON.stringify(r.lines)} · 「${r.mine}」`);
  if (page ? r.link != null : r.link !== '#/why') fail('매매일지 고리', `${T} ${r.link}`);
  if (!r.live.includes(String(J.score)) || !r.live.includes(J.verdict)) fail('읽어 주는 칸(aria-live)에 점수 · 판정 없음', `${T} 「${r.live}」`);
  const saved = store === 'ok';
  const savedNote = page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.';
  if (saved ? !r.notes.includes(savedNote) : !r.notes.some(t => /남길 수 없/.test(t)) || r.notes.some(t => /쌓았/.test(t))) fail('기록 알림 글', `${T} ${JSON.stringify(r.notes)}`);
  if (r.btns[0] !== '다시 하기') fail('다시 하기 단추', `${T} ${JSON.stringify(r.btns)}`);
  if (scan) await layout(p, scanSel, `${T} 결과`);
  bump('끝낸 길'); bump('판정 ' + J.verdict);
  // ⑤ 기록 — 끝낼 때 딱 한 번 · 맨 앞에 · 꼴 · 값
  if (saved && recCheck) {
    const recs = await getRecs(p), x = recs?.[0];
    if (!Array.isArray(recs) || recs.length !== Math.min(200, (before?.length ?? 0) + 1)) fail('기록 수(끝낼 때 한 번)', `${T} ${before?.length} → ${recs?.length}`);
    else {
      const at = Date.parse(x.at);
      if (!eq(Object.keys(x).sort(), REC_KEYS) || !eq(Object.keys(x.promise ?? {}).sort(), ['half', 'sell', 'text'])) fail('기록 꼴(열쇠)', `${T} ${JSON.stringify(Object.keys(x))} · ${JSON.stringify(Object.keys(x.promise ?? {}))}`);
      if (!(at >= tStart - 2000 && at <= Date.now() + 2000)) fail('기록 날짜', `${T} ${x.at}`);
      if (x.code !== st.code || x.name !== st.name || x.price !== (st.price ?? null) || x.day !== (st.day ?? null)) fail('기록 종목 · 그날 값([3] 6)', `${T} ${x.code} ${x.name} ${x.price} ${x.day} · 기대 ${st.code} ${st.name} ${st.price} ${st.day}`);
      if (!eq(x.answers, ks)) fail('기록 답', `${T} ${JSON.stringify(x.answers)} ≠ ${JSON.stringify(ks)}`);
      if (x.score !== J.score || x.reds !== J.reds || x.verdict !== J.verdict) fail('기록 점수 · 빨강 · 판정', `${T} ${x.score} ${x.reds} ${x.verdict}`);
      if (!eq(GROUPS.map(([n]) => x.groups?.[n]), GROUPS.map(([n]) => J.groups[n]))) fail('기록 묶음', `${T} ${JSON.stringify(x.groups)}`);
      if (x.bigDay !== bigWant) fail('기록 클 일 날짜([3] 3)', `${T} ${x.bigDay} ≠ ${bigWant}`);
      if (x.why !== whyT || x.promise?.sell !== sell || x.promise?.half !== half || x.promise?.text !== promiseTxt(sell, half)) fail('기록 두 줄([3] 4 · 5)', `${T} 「${x.why}」 ${JSON.stringify(x.promise)} · 기대 「${whyT}」 ${sell} ${half}`);
      if (x.asOf !== recAsOf(gdrX)) fail('기록 자료 날짜', `${T} ${x.asOf} ≠ ${recAsOf(gdrX)}`);
      if (!eq(x.picks, pickRec(gdrX))) fail('기록 그날 ' + NEW_NAME + ' 칸', `${T} ${JSON.stringify(x.picks).slice(0, 160)}`);
      bump('맞댄 기록');
    }
    if (page) { // 매매일지 화면 아래 목록이 그 자리에서 늘어남([3] 7)
      const m = await p.evaluate(READLIST);
      const n = (recs ?? []).filter(z => z && typeof z === 'object').length;
      if (!m || (/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR') || m.rows[0]?.stkName !== st.name || m.rows[0]?.mine !== whyT) fail('매매일지 아래 목록이 바로 늘어남', `${T} 「${m?.h}」 ${m?.rows?.[0]?.stkName} 「${m?.rows?.[0]?.mine}」 · 기대 ${n} · ${st.name}`);
      else bump('목록 바로 늘어남');
    }
  }
  if (store !== 'ok' || !recCheck) { const d = await modCall(p, 'done'); if (d !== true) fail('doneOnce() — 이 화면에서 끝낸 뒤', `${T} ${d}`); }
  if (keep) return {J, whyT, sell, half};
  // 다시 하기 — 처음(종목 고르기 · 처음부터 고른 종목이면 1번 · 아무것도 안 고름)
  await p.locator(sel + ' .wy-res .wy-nav button').first().click({timeout: 8000});
  s = await p.evaluate(READQ, sel);
  if (pre) { await waitStk(p, sel).catch(() => {}); checkQ(await p.evaluate(READQ, sel), 0, null, T + ' 다시 하기', st); }
  else if (s?.find !== '' || s.step !== '종목 고르기') fail('다시 하기 = 종목 고르기부터', `${T} 「${s?.step}」 「${s?.find}」`);
  return {J, whyT, sell, half};
}

/** 쌓인 기록 목록 맞대기(새 것부터 · 서른 줄까지 · 날짜 · 점수 · 판정 · 종목 · 그날 값 · 두 줄 · 막대 · 한 달 뒤) · 지우는 단추 없음 · later = 한 달 지난 기록 기대 */
async function checkList(p, tag, {expectN = null, later = []} = {}) {
  if (later.length) await p.waitForFunction(n => [...document.querySelectorAll('#view section.wy-me .wy-rec > p.note')].filter(x => /한 달 뒤 결과 ·|\? 지금 값/.test(x.textContent)).length >= n, later.length, {timeout: 20000}).catch(() => fail('한 달 뒤 결과가 안 붙음', tag));
  const m = await p.evaluate(READLIST), recs = ((await getRecs(p)) ?? []).filter(z => z && typeof z === 'object');
  if (!m) { fail('매매일지 기록 칸 없음', tag); return; }
  const n = expectN ?? recs.length;
  if ((/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR')) fail('기록 수', `${tag} 「${m.h}」 ≠ ${n}`);
  if (m.rows.length !== Math.min(n, 30)) fail('줄 수(서른까지)', `${tag} ${m.rows.length} ≠ ${Math.min(n, 30)}`);
  m.rows.forEach((row, i) => {
    const x = recs[i]; if (!x) return;
    const at = Date.parse(x.at), J = Array.isArray(x.answers) && x.answers.length === QS.length ? judge(x.answers) : null, T = `${tag} ${i + 1}줄`;
    if (row.day !== dayTxt(at)) fail('목록 날짜', `${T} 「${row.day}」 ≠ 「${dayTxt(at)}」`);
    if (!row.rest.includes(`점수 ${x.score} / ${MAX}`) || !row.rest.includes(x.verdict)) fail('목록 점수 · 판정', `${T} 「${row.rest}」`);
    if (J && (J.score !== x.score || J.verdict !== x.verdict)) fail('쌓인 기록의 점수 · 판정(답으로 다시 셈)', `${T} ${x.score} ${x.verdict}`);
    if (!eq(row.bars, GROUPS.map(([nm, qs]) => `${x.groups?.[nm] ?? 0} / ${qs.length * 2}`))) fail('목록 막대 숫자', `${T} ${JSON.stringify(row.bars)}`);
    if (x.code || x.name) { // 새 꼴 — 종목 · 그날 값 · 날짜 · 두 줄
      const want = x.price > 0 ? [`그날 값 ${won(x.price)}`, ...(x.day ? [`${mdTxt(x.day)} 종가`] : [])] : ['그날 값 ?'];
      if (row.stkName !== (x.name || x.code) || !want.every(w => row.stk?.includes(w))) fail('목록 종목 · 그날 값([3] 6)', `${T} 「${row.stk}」 · 기대 ${x.name} ${JSON.stringify(want)}`);
      if (x.why && row.mine !== x.why) fail('목록 ① 줄(내 글 data-proper)', `${T} 「${row.mine}」 ≠ 「${x.why}」`);
      if (x.promise?.text && !row.lines.includes('팔 약속 ' + x.promise.text)) fail('목록 ② 팔 약속', `${T} ${JSON.stringify(row.lines)}`);
      if (x.bigDay ? !row.lines.includes('클 일 ' + ymdTxt(x.bigDay)) : row.lines.some(t => /^클 일/.test(t))) fail('목록 클 일 날짜', `${T} ${JSON.stringify(row.lines)} · ${x.bigDay}`);
      bump('맞댄 새 꼴 줄');
    } else {
      if (row.stk != null || row.lines.length) fail('옛 기록(종목 없음)에 종목 · 두 줄', `${T} 「${row.stk}」 ${JSON.stringify(row.lines)}`);
      bump('맞댄 옛 꼴 줄');
    }
    const L = later.find(l => l.at === x.at);
    if (L) { // 한 달 지난 기록 — 값 있는 곳 수 · 비중으로 묶은 합(따로 셈) · 값 없는 곳 「?」 · 같은 기간 코스피(두 날이 다 있을 때만 숫자)
      const t = row.notes.find(z => z.startsWith('한 달 뒤 결과')) ?? '';
      const want = `한 달 뒤 결과 · ${L.ok}곳 비중으로 묶은 합 ${L.pct}${L.miss ? ` · ? ${L.miss}곳은 지금 값 없음` : ''} · 같은 기간 코스피 ${L.kospi}`;
      if (t !== want) fail('한 달 뒤 결과(따로 셈 · 같은 기간 코스피 [6] 3)', `${T} 「${t}」 ≠ 「${want}」`); else bump('맞댄 한 달 뒤 결과');
      if (!String(row.up).split(' ').includes(L.cls)) fail('한 달 뒤 결과 색', `${T} ${row.up} ≠ ${L.cls}`);
      if (L.kospi !== '?' && !String(row.kb).split(' ').includes(L.kcls)) fail('같은 기간 코스피 색', `${T} ${row.kb} ≠ ${L.kcls}`);
    } else if (x.picks?.length && Date.now() - at < 30 * 864e5) { const w = `그날 ${NEW_NAME} 칸 ${x.picks.length}곳`; if (!row.notes.some(t => t.startsWith(w) && t.includes(dayTxt(at + 30 * 864e5)))) fail('한 달 뒤에 붙일 날짜', `${T} ${JSON.stringify(row.notes)}`); }
    else if (!x.picks?.length && row.notes.length) fail(NEW_NAME + ' 칸 없는 기록에 결과 줄', `${T} ${JSON.stringify(row.notes)}`);
  });
  if (m.btn.length) fail('기록에 누르는 것(지우는 단추 없음 — 규칙 77)', `${tag} ${JSON.stringify(m.btn)}`);
  const dels = await p.evaluate(DELS, '#view');
  if (dels.length) fail('지우는 단추(규칙 77 · [3] 6)', `${tag} ${JSON.stringify(dels)}`);
  bump('맞댄 기록 목록');
}
/** 한 달 지난 기록 하나(고도리 칸 두 곳 + 없는 곳 하나 · 종목 꼴) → 기대(따로 셈) · home = 그 화면이 받는 지수 줄 */
async function laterRec(home, {daysAgo = 40} = {}) {
  const src = (G?.picks ?? []).slice(0, 2).map(x => x.code);
  for (const c of ['005930', '000660']) if (src.length < 2 && !src.includes(c)) src.push(c);
  const cos = await Promise.all(src.map(c => getJ('/atlas/data/co/' + c + '.json').catch(() => null)));
  const picks = src.map((c, i) => ({code: c, name: c, price: Math.round((cos[i]?.c?.price ?? 1000) / (1.1 + i * 0.07)), w: i ? 2.5 : 3})).concat([{code: 'ZZZZZZ', name: '없는 곳', price: 1000, w: 2}]);
  const ok = src.map((c, i) => [picks[i], cos[i]?.c?.price, cos[i]?.c?.priceDate]).filter(([x, now]) => now > 0 && x.price > 0), ws = ok.reduce((s, [x]) => s + x.w, 0);
  const tot = ok.reduce((s, [x, now]) => s + x.w * (now / x.price - 1) * 100, 0) / ws;
  const rows = home?.idx?.KOSPI?.rows ?? [], from = rows.length > 20 ? rows[rows.length - 21][0] : '2026-09-01', to = ok.map(z => z[2]).filter(d => typeof d === 'string').sort().pop() ?? null;
  const a = rows.find(z => z[0] === from)?.[1], b = rows.find(z => z[0] === to)?.[1], k = a > 0 && b > 0 ? (b / a - 1) * 100 : null;
  const rec = {at: new Date(Date.now() - daysAgo * 864e5).toISOString(), asOf: from, code: ST.co1.code, name: ST.co1.name, price: ST.co1.price, day: ST.co1.day, answers: PATHS[0].ks, score: 0, reds: 0, verdict: V_OK,
    groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, bigDay: null, why: '옛날에 쓴 까닭', promise: {sell: 1000, half: 2000, text: promiseTxt(1000, 2000)}, picks};
  return {rec, L: {at: rec.at, ok: ok.length, miss: picks.length - ok.length, pct: pctTxt(tot), cls: clsOf(tot), kospi: pctTxt(k), kcls: k == null ? null : clsOf(k), to}};
}
const oldRec = (daysAgo, picks = []) => ({at: new Date(Date.now() - daysAgo * 864e5).toISOString(), asOf: '2026-09-01', answers: PATHS[0].ks, score: 0, reds: 0, verdict: V_OK, groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, picks}); // 옛 꼴(종목 · 두 줄 없음)

/* ⓪ 찾기와 같은 잣대 · 처음 화면 · 없는 번호 · 틀린 번호 */
const SEL = '#view section.wy', PSEL = '#view';
{
  const T = '종목 고르기 360×640', p = await newPage(360, 640);
  try {
    await open(p, '#/why', SEL + ' .wy-find');
    const top = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? null, title: document.title, page: !!document.querySelector('#view section.wy.page'), list: !!document.querySelector('#view section.wy.page ~ section.wy-me'),
      safe: document.querySelector('#view section.wy-me ~ p.safe')?.textContent ?? null}));
    if (top.h1 !== '매매일지' || top.title !== '매매일지' + TITLE_TAIL || !top.page || !top.list || top.safe !== SAFE_LINE) fail('매매일지 화면 꼴(제목 = 탭 이름 · 질문 칸 · 아래 기록 · 안전 문장)', `${T} ${JSON.stringify(top)}`);
    await p.waitForFunction(() => document.activeElement?.classList?.contains('wy-find'), null, {timeout: 5000}).catch(() => fail('매매일지를 열면 찾기 칸에 바로 씀', T));
    for (const q of ['삼성전자', 'ㅅㅅㅈㅈ', '0059', '하이닉스', 'kodex', '0001a', '현대']) {
      await p.fill(SEL + ' .wy-find', q);
      await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [SEL, q], {timeout: 15000});
      const rows = await p.$$eval(SEL + ' .wy-hits [data-code]', bs => bs.map(b => ({c: b.dataset.code, btn: b.tagName === 'BUTTON', n: b.querySelector('.nm[data-proper]')?.textContent ?? '', s: b.querySelector('small')?.textContent ?? ''})));
      const note = await p.$$eval(SEL + ' .wy-hits > p.wy-note', ps => ps.map(x => x.textContent));
      const f = await p.context().newPage();
      await f.goto(base + NEXT + '#/find/' + encodeURIComponent(q), {waitUntil: 'domcontentloaded'});
      await f.waitForFunction(() => !!document.querySelector('#view .hits a, #view .hits .note') && !document.querySelector('#view .boot'), null, {timeout: 30000});
      const find = await f.$$eval('#view .hits a', as => as.map(a => { const m = /#\/(w|x)\/([0-9A-Z]{6})$/.exec(a.getAttribute('href') ?? ''); return m ? {c: m[2], co: m[1] === 'w', s: a.querySelector('small')?.textContent ?? ''} : null; }).filter(Boolean));
      await f.close();
      const want = find.slice(0, 6);
      if (!rows.length || !eq(rows.map(r => r.c), want.map(x => x.c))) fail('찾기와 같은 잣대([3] 1 — 같은 말 · 같은 차례)', `${T} 「${q}」 ${JSON.stringify(rows.map(r => r.c))} ≠ 찾기 ${JSON.stringify(want.map(x => x.c))}`); else bump('찾기와 같은 차례');
      rows.forEach((r, k) => { // 회사 주식 = 누르는 단추 · 펀드 · 우선주 … = 누르지 않는 줄 + 찾기와 같은 까닭 한 줄
        const x = want[k]; if (!x) return;
        if (r.btn !== x.co) fail('회사 주식만 고름(펀드 · 우선주 … 는 누르지 않음)', `${T} 「${q}」 ${r.c} 단추 ${r.btn}`);
        if (!x.co && r.s !== x.s) fail('펀드 · 우선주 … 까닭 줄(찾기와 같은 글)', `${T} ${r.c} 「${r.s}」 ≠ 「${x.s}」`);
      });
      if (rows.some(r => !r.btn) !== note.includes('회사 주식만 매매일지에 적어요.')) fail('펀드 · 우선주 섞일 때 알림 한 줄', `${T} 「${q}」 ${JSON.stringify(note)}`);
      if (rows.some(r => !r.btn)) bump('펀드 · 우선주 까닭 줄');
    }
    await layout(p, PSEL, T + ' 찾은 종목');
    for (const q of ['kodex', ST.x1.name]) { // 맨 위가 회사 주식이 아니면 엔터를 눌러도 질문으로 가지 않음
      await p.fill(SEL + ' .wy-find', q);
      await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [SEL, q], {timeout: 15000});
      const topBtn = await p.evaluate(s => document.querySelector(s + ' .wy-hits [data-code]')?.tagName ?? null, SEL);
      await p.press(SEL + ' .wy-find', 'Enter'); await p.waitForTimeout(400);
      const s = await p.evaluate(READQ, SEL);
      if (topBtn !== 'DIV' || s?.find == null) fail('맨 위가 펀드 · 우선주면 엔터로 고르지 않음', `${T} 「${q}」 맨 위 ${topBtn} · 「${s?.step}」`); else bump('펀드 엔터 막음');
    }
    await p.fill(SEL + ' .wy-find', 'ㅋㅋㅋㅋㅋㅋㅋ');
    await p.waitForFunction(s => /찾는 종목이 없어요/.test(document.querySelector(s + ' .wy-hits')?.textContent ?? ''), SEL, {timeout: 10000}).catch(() => fail('못 찾음 글', T));
    for (const [hash, why] of [['#/why/999999', '없는 번호'], ['#/why/abc', '틀린 번호']]) {
      await open(p, hash, SEL);
      await p.waitForFunction(s => !!document.querySelector(s + ' .wy-find') && !!document.querySelector(s + ' .wy-err'), SEL, {timeout: 15000}).catch(() => {});
      const s = await p.evaluate(READQ, SEL);
      if (s?.find == null || s.err !== '? 이 번호의 종목을 찾지 못했어요. 이름으로 찾아 줘.') fail(why + ' → 종목 고르기 + 알림', `${T} ${hash} 「${s?.step}」 「${s?.err}」`); else bump('없는 · 틀린 번호');
    }
    for (const [hash, st] of [['#/why/' + ST.co1.code, ST.co1], ...(ST.coL ? [['#/why/' + ST.coL.code.toLowerCase(), ST.coL]] : [])]) { // 글자 섞인 번호는 작은 글자로 써도 그 종목
      await open(p, hash, SEL + ' .wy-opt'); await waitStk(p, SEL).catch(() => {});
      checkQ(await p.evaluate(READQ, SEL), 0, null, `${T} ${hash}`, st);
      await p.locator(SEL + ' .wy-back').click(); // 1번의 앞으로 = 종목 고르기
      const s = await p.evaluate(READQ, SEL); if (s?.find == null) fail('1번 앞으로 → 종목 고르기', `${T} ${hash} 「${s?.step}」`); else bump('1번 앞으로 → 종목 고르기');
    }
    { // #/why/<펀드 · 우선주> — 질문 대신 종목 고르기 + 「? 이름 — 회사 주식만 매매일지에 적어요.」 + 찾기와 같은 까닭 한 줄
      await open(p, '#/why/' + ST.x1.code, SEL);
      await p.waitForFunction(s => !!document.querySelector(s + ' .wy-find') && !!document.querySelector(s + ' .wy-err'), SEL, {timeout: 15000}).catch(() => {});
      const s = await p.evaluate(sel => { const e = document.querySelector(sel + ' .wy-err'); return {find: !!document.querySelector(sel + ' .wy-find'), q: document.querySelectorAll(sel + ' .wy-opt').length, err: e?.textContent ?? null, nm: e?.querySelector('.nm[data-proper]')?.textContent ?? null, w: document.querySelector(sel + ' .wy-xw')?.textContent ?? null}; }, SEL);
      if (!s.find || s.q || s.err !== `? ${ST.x1.name} — 회사 주식만 매매일지에 적어요.` || s.nm !== ST.x1.name || s.w !== ST.x1.w) fail('펀드 · 우선주 번호 → 질문 대신 까닭', `${T} ${JSON.stringify(s)} · 기대 w 「${ST.x1.w}」`); else bump('펀드 번호 → 까닭');
      await layout(p, PSEL, T + ' 펀드 번호');
    }
    { // 회사 화면 「이 회사로 왜 사?」(일꾼 A · a.why-go) → #/why/<번호> · 그 종목으로 1번부터
      await open(p, '#/w/' + ST.co1.code, '#view a.why-go');
      await p.locator('#view a.why-go').first().click({timeout: 8000});
      await p.waitForFunction(([c, s]) => location.hash === '#/why/' + c && !!document.querySelector(s + ' .wy-opt') && !document.querySelector('#view .boot'), [ST.co1.code, SEL], {timeout: 30000});
      await waitStk(p, SEL).catch(() => {});
      checkQ(await p.evaluate(READQ, SEL), 0, null, `${T} 회사 화면 고리`, ST.co1); bump('회사 화면 → 그 종목으로');
    }
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ① ~ ⑤ 판 — A 360×640 #/why(길 아홉 · 옛 기록 스물다섯 · 최근 본 회사) · B 390×844 #/why/<번호>(처음부터 고름 · 지수 줄에 끝 날을 더해 같은 기간 코스피 숫자) */
{
  const T = '360×640 #/why', p = await newPage(360, 640, {allow: ['/atlas/data/co/ZZZZZZ.json', CX_FILE], block: [CX_FILE]});
  try {
    await open(p, '#/why', SEL);
    await setRecs(p, Array.from({length: 25}, (_, i) => oldRec(40 + i))); // 서른 줄 넘음 — 옛 꼴 기록 스물다섯(고도리 칸 없음)
    const {rec, L} = await laterRec(HOME, {daysAgo: 31});
    await p.evaluate(([k, x]) => { const a = JSON.parse(localStorage.getItem(k) || '[]'); a.unshift(x); localStorage.setItem(k, JSON.stringify(a)); }, [KEY, rec]); // 새 꼴 · 한 달 지난 기록(맨 앞)
    await p.evaluate(c => localStorage.setItem('atlas:new:hist', JSON.stringify([c, '000660'])), ST.co1.code); // 최근 본 회사
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 처음 목록', {later: [L]});
    let first = true;
    for (const P of PATHS) {
      try { await runPath(p, SEL, P, T, {scan: first, scanSel: PSEL}); } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why', SEL).catch(() => {}); }
      first = false; errsOf(p, T + ' · ' + P.name);
    }
    await open(p, '#/why', SEL); await checkList(p, T + ' 끝 목록', {later: [L]});
    await layout(p, '#view section.wy-me', T + ' 기록 목록');
    errsOf(p, T + ' 목록');
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
{
  const to = (await laterRec(HOME)).L.to ?? ST.co1.day, home = structuredClone(HOME ?? {idx: {KOSPI: {rows: [['2026-09-01', 3000]]}}}), rows = home.idx.KOSPI.rows;
  if (!rows.some(r => r[0] === to)) rows.push([to, Math.round(rows[rows.length - 1][1] * 1.0137 * 100) / 100]); // 끝 날 지수를 더함 → 같은 기간 코스피가 숫자로
  const T = `390×844 #/why/${ST.co2.code}`, p = await newPage(390, 844, {home, allow: ['/atlas/data/co/ZZZZZZ.json']});
  try {
    await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt');
    const {rec, L} = await laterRec(home); if (L.kospi === '?') fail('시험 준비 — 같은 기간 코스피 숫자 길', `${T} ${L.to}`);
    await setRecs(p, [rec]);
    await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt');
    await checkList(p, T + ' 처음 목록', {later: [L]});
    let first = true;
    for (const P of PATHS.filter(P => ALL || SHORT.includes(P.name))) {
      try { await runPath(p, SEL, P, T, {scan: first, scanSel: PSEL, pre: ST.co2}); } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt').catch(() => {}); }
      first = false; errsOf(p, T + ' · ' + P.name);
    }
    await checkList(p, T + ' 끝 목록', {later: [L]});
    await layout(p, '#view section.wy-me', T + ' 기록 목록');
    errsOf(p, T + ' 목록');
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑥ whyCard(G, {code, onDone}) — 친구가 연 보내기 쪽처럼(처음부터 고른 종목 · 결과 뒤 onDone) · meRecords() · doneOnce() */
{
  const T = '360×640 whyCard 옵션', p = await newPage(360, 640);
  try {
    await open(p, '#/find', '#view .find'); // 다른 화면 위에 칸을 붙임(보내기 쪽처럼) — 끝에 「매매일지 보기 ›」가 실제로 #/why 로 감
    if (await modCall(p, 'done') !== false) fail('doneOnce() — 기록 없는 새 기기', T);
    await setRecs(p, [null, 7, 'x']); if (await modCall(p, 'done') !== false) fail('doneOnce() — 망가진 줄만', T);
    await setRecs(p, [oldRec(3)]); if (await modCall(p, 'done') !== true) fail('doneOnce() — 옛 꼴 기록 하나', T);
    await setRecs(p, []);
    await p.evaluate(async c => {
      const W = await globalThis.NX.mod('why'), G0 = globalThis.NX?.gdr ? await globalThis.NX.gdr() : null; // 보내기 쪽(일꾼 C)과 같은 길 — NX.mod 가 p-why.css 도 붙임
      window.__done = [];
      const host = document.createElement('div'); host.id = '__t';
      const card = W.whyCard(G0, {code: c, onDone: (rec, saved) => window.__done.push({rec, saved, res: !!document.querySelector('#__t .wy-res'), page: !!document.querySelector('#__t section.wy.page')})});
      host.append(card); document.querySelector('#view').replaceChildren(host);
    }, ST.co1.code);
    const S2 = '#__t section.wy';
    await p.waitForSelector(S2 + ' .wy-opt', {timeout: 15000});
    await p.waitForFunction(s => getComputedStyle(document.querySelector(s + ' .wy-opt')).minHeight === '56px', S2, {timeout: 15000}).catch(() => fail('NX.mod(\'why\') 로 붙인 칸에 p-why.css 가 안 붙음', T));
    const r0 = await runPath(p, S2, PATHS[4], T, {scan: true, pre: ST.co1, page: false, keep: true});
    const d = await p.evaluate(() => window.__done);
    if (d.length !== 1 || !d[0].res || d[0].saved !== true || d[0].page || d[0].rec?.code !== ST.co1.code || d[0].rec?.score !== r0?.J?.score || d[0].rec?.why !== r0?.whyT) fail('onDone — 결과를 그린 뒤 한 번 · 기록 · 남겼나', `${T} ${JSON.stringify(d).slice(0, 300)}`); else bump('onDone 한 번');
    if (await modCall(p, 'done') !== true) fail('doneOnce() — 끝낸 뒤', T);
    const me = await modCall(p, 'me'), n = ((await getRecs(p)) ?? []).length;
    if ((/기록 ([\d,]+)번/.exec(me.h) || [])[1] !== String(n) || me.rows !== n || me.btn) fail('meRecords() — 같은 기록 · 누르는 것 없음', `${T} ${JSON.stringify(me)} · 기록 ${n}`); else bump('meRecords 맞음');
    await p.locator(S2 + ' .wy-res a.wy-link').click({timeout: 8000}); // 매매일지 보기 › → #/why(목록에 방금 기록)
    await p.waitForFunction(() => location.hash === '#/why' && !!document.querySelector('#view section.wy-me') && !document.querySelector('#view .boot'), null, {timeout: 30000});
    await checkList(p, T + ' 매매일지로');
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑦ 첫 화면 칸(있을 때만 — 일꾼 A 가 정함) · 기억 못 하는 기계 · 고도리 칸 자료 못 받음 · 망가진 줄 */
{
  const T = '390×844 #/ 첫 화면', p = await newPage(390, 844);
  try {
    await open(p, '#/', '#view > *');
    await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000});
    if (await p.locator(SEL).count()) {
      if (await p.evaluate(() => document.activeElement?.classList?.contains('wy-find'))) fail('첫 화면에서 찾기 칸에 저절로 들어감(자판이 뜸)', T);
      await runPath(p, SEL, PATHS[8], T, {page: false}); bump('첫 화면 칸 길');
    } else bump('첫 화면에 매매일지 칸 없음(가운데 단추로만)');
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
for (const [tag, w, h, hash, o, P, pre] of [
  ['localStorage 막힘', 390, 844, '#/why', {store: 'throw'}, PATHS[0], null],
  ['localStorage 막힘', 360, 640, '#/why/' + ST.co1.code, {store: 'throw'}, PATHS[8], ST.co1],
  ['쓰기만 막힘', 390, 844, '#/why', {store: 'nowrite'}, PATHS[4], null],
  [NEW_NAME + ' 칸 자료 못 받음', 360, 640, '#/why', {gdr404: true, allow: ['/next/data/gdr.json']}, PATHS[8], null],
]) {
  const T = `${tag} ${w}×${h} ${hash}`, p = await newPage(w, h, o);
  try {
    await open(p, hash, SEL);
    if (o.store) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me')?.textContent ?? ''); if (!/기록 0번/.test(t)) fail('기억 못 하는 기계 기록 칸', `${T} 「${t.slice(0, 80)}」`); }
    await runPath(p, SEL, P, T, {scan: true, scanSel: PSEL, store: o.store ?? 'ok', gdrX: o.gdr404 ? null : G, pre});
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 목록', {expectN: o.store ? 0 : 1});
    if (o.gdr404) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me .wy-rec')?.textContent ?? ''); if (t.includes(NEW_NAME + ' 칸')) fail('자료 없이 ' + NEW_NAME + ' 칸 줄', T); }
    await layout(p, '#view section.wy-me', T + ' 목록');
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
{ // 기억에 망가진 줄(null · 글 · 숫자)이 섞임 — 목록은 성한 기록만(기록 수 = 성한 줄) · 새로 끝낸 답은 맨 앞에 · 화면 오류 0
  const T = '망가진 줄 섞임 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL);
    const good = {...oldRec(3), answers: PATHS[4].ks, score: 5, reds: 0, verdict: V_OK, groups: judge(PATHS[4].ks).groups, asOf: G?.asOf ?? null};
    await setRecs(p, [null, '망가짐', 42, good]);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 처음', {expectN: 1});
    await runPath(p, SEL, PATHS[8], T, {recCheck: false}); // 기록 수 · 맨 앞 맞대기는 아래에서(망가진 줄은 셈 밖)
    const recs = await getRecs(p);
    if (!(recs?.[0] && typeof recs[0] === 'object' && recs[0].score === judge(PATHS[8].ks).score && eq(recs[0].answers, PATHS[8].ks) && recs[0].code === ST.co1.code)) fail('망가진 줄 위에 새 기록', `${T} ${JSON.stringify(recs?.[0]).slice(0, 120)}`);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 새 기록 뒤', {expectN: 2});
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 고도리 한마디 — 판마다 같은 답은 같은 한마디 · 한 질문 안 답마다 다름 · 모든 답을 한 번은 봄 */
QS.forEach((Q, qi) => {
  const seen = ONE[qi].map(m => [...m.keys()]);
  seen.forEach((xs, k) => { if (!xs.length) fail('한마디를 못 본 답(길을 늘릴 것)', `${qi + 1}번 「${Q.a[k][1]}」`); if (xs.length > 1) fail('같은 답에 한마디가 여럿', `${qi + 1}번 「${Q.a[k][1]}」 ${JSON.stringify(xs)}`); });
  const one = seen.map(xs => xs[0]).filter(Boolean); if (new Set(one).size !== one.length) fail('한 질문 안에 같은 한마디(답마다 한마디)', `${qi + 1}번 ${JSON.stringify(one)}`);
});

/* ⑨ 걸린 때 — 처음 여는 기기 390×844 · 종목 이름 → 엔터 → 열한 질문(답 + 다음) → 빠른 말 → 결과 · 읽기 · 재기 없이 누르기만 */
{
  const T = '걸린 때 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL + ' .wy-find');
    let taps = 0; const t1 = Date.now();
    await p.fill(SEL + ' .wy-find', ST.co1.name); await p.locator(SEL + ' .wy-hit').first().waitFor({timeout: 15000}); await p.press(SEL + ' .wy-find', 'Enter'); taps += 1;
    for (let qi = 0; qi < QS.length; qi++) { await p.locator(SEL + ' .wy-opt').nth(PATHS[0].ks[qi]).click(); await p.locator(SEL + ' .wy-next').click(); taps += 2; }
    await p.locator(SEL + ' .wy-quick button').first().click(); await p.locator(SEL + ' .wy-nav .wy-next').click(); taps += 2;
    await p.waitForSelector(SEL + ' .wy-res', {timeout: 15000});
    Object.assign(timing, {flowMs: Date.now() - t1, taps, typed: ST.co1.name.length});
    if (timing.flowMs > 60000) fail('1분 안에 끝남([3] 9)', `${T} ${timing.flowMs}ms`);
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-why-2', when: new Date().toISOString(), base, path: NEXT, all: ALL, gdrAsOf: G?.asOf ?? null, picks: G?.picks?.length ?? null, stocks: Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, v.code])), timing, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, timing, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');

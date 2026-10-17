// 고도리 「친구야, 왜 사?」 질문 열한 개 · 「나」 칸 기록 맞대기 — 사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 2 ~ 6 · 13 · 14
//   쓰는 법: node scripts/atlas11/next/check_why.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all]
//     --all = 길 아홉을 네 판(두 폭 × 두 곳) 모두에서 · 기본 = 앞 두 판은 아홉 길 · 뒤 두 판은 세 길 — 다른 쪽 검사처럼 --limit N 도 받음(기본과 같음)
//   기준 = 사장님 명령 원문(docs/design/godori-2026-10-17/brief.md 의 코드 칸 — 질문 · 답 · 색 · 격언 글자 그대로 · 색 점수 · 네 묶음 · 판정)
//          화면 모듈(site/next/p-why.js)은 쓰지 않음 — 점수 · 묶음 · 판정은 이 검사가 원문 규칙으로 따로 셈 · 이름은 rename.mjs(brand.js 한 곳)
//   ① 두 폭(360×640 · 390×844) × 두 곳(첫 화면 #/ · #/why) — 한 화면에 질문 하나 · 사장님 차례 · 글자 그대로 · 답 셋의 글과 색 · 다음 단추는 고른 뒤에만 ·
//      고른 뒤 고도리 한마디 한 줄(답마다 다름) · 격언(남의 글 data-proper · 원문 그대로)
//   ② 길 아홉 — 모두 초록 0 · 빨강 넷(합 12 밑) · 노랑 여섯 6 · 빨강 셋 6 · 합 5 · 합 11 · 합 12 · 섞음 · 모두 빨강 22 → 점수 · 빨강 수 · 판정 · 네 묶음 막대(숫자 · 길이)
//   ③ 앞으로 단추 — 고른 답 · 한마디가 남음 · 앞에서 바꾼 답이 점수와 기록에 · 다시 하기는 처음부터
//   ④ 기록 — 끝낼 때 한 번(atlas:godori-why · 날짜 · 답 · 점수 · 빨강 수 · 판정 · 묶음 · 그날 고도리 칸) · 「나」 칸 = 날짜 · 점수 · 판정 · 막대 · 서른 줄까지 · 한 달 뒤 날짜 ·
//      한 달 지난 기록은 그 뒤 결과(co/<번호>.json 값으로 따로 셈 · 값 없는 곳 「?」) · 지우는 단추 없음 · 「본 기록 · 담은 것 지우기」를 눌러도 남음(명령 13 「틀린 것도 지우지 마라」)
//   ⑤ 기억 못 하는 기계(localStorage 자체가 막힘 · 쓰기만 막힘) · 고도리 칸 자료(gdr.json) 못 받음 — 끝까지 되고 「기록 0번」 · 기록의 고도리 칸은 빈 목록
//   ⑥ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · 캔버스 0 · 쓰지 않을 말 0(남의 글 data-proper 밖 · 이름표 글 포함) · 화면 오류 0
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

/* 기준 — 사장님 명령 원문(brief.md 코드 칸)을 읽어 질문 · 답 · 색 · 격언을 그대로 씀 */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const COLOR = {'🟢': 'g', '🟡': 'y', '🔴': 'r'};
const QS = [];
for (const line of ((BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0] ?? '').split('\n')) {
  const m = /^(\d{1,2}) (.+?\?) (.+?) -(.+)$/u.exec(line.trim()); if (!m) continue;
  QS.push({n: +m[1], q: m[2], a: [...m[3].matchAll(/([🟢🟡🔴])([^🟢🟡🔴]+)/gu)].map(x => [COLOR[x[1]], x[2].trim()]), say: m[4].trim()});
}
if (QS.length !== 11 || QS.some((Q, i) => Q.n !== i + 1 || Q.a.length !== 3)) { console.error('사장님 명령 원문(질문 열한 개)을 brief.md 에서 못 읽음', QS.length); process.exit(1); }
// 색 점수 · 묶음 · 판정도 원문 글 그대로 있는지 — 바뀌면 이 검사의 셈도 고쳐야 함(아래 PTS · GROUPS · verdict)
for (const t of ['색: 🟢0점 🟡1점 🔴2점', '묶음: 이유1~3 · 돈4,9,11 · 때5~6 · 마음7,8,10', '판정: 0~5 「좋아, 정해 둔 대로만」 6~11 「반만 준비됐어」 12 이상·🔴넷 이상 「오늘은 쉬어 가자」'])
  if (!BRIEF.includes(t)) fail('기준 글이 바뀜(brief.md — 이 검사의 셈을 고칠 것)', t);
const PTS = {g: 0, y: 1, r: 2}, MAX = QS.length * 2;
const GROUPS = [['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]];
const V_OK = '좋아, 정해 둔 대로만', V_HALF = '반만 준비됐어', V_REST = '오늘은 쉬어 가자';
/** 답 자리(0 ~ 2) 열한 개 → 점수 · 빨강 수 · 묶음 · 판정(원문 명령 5 · 6) */
function judge(ks) {
  const p = ks.map((k, i) => PTS[QS[i].a[k][0]]), score = p.reduce((s, x) => s + x, 0), reds = p.filter(x => x === 2).length;
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + p[q - 1], 0)]));
  return {score, reds, groups, verdict: score >= 12 || reds >= 4 ? V_REST : score >= 6 ? V_HALF : V_OK};
}
/** 색 글자(g · y · r · R = 둘째 빨강)로 쓴 길 → 답 자리 */
const idxOf = (qi, c) => { const want = c === 'R' ? 'r' : c, hit = QS[qi].a.map((a, k) => (a[0] === want ? k : -1)).filter(k => k >= 0), k = c === 'R' ? hit[1] : hit[0]; if (k == null) throw Error(`길 틀림: ${qi + 1}번 질문에 ${c} 답이 없음`); return k; };
// 길 아홉 — [이름, 색 열한 글자, 기대 점수, 기대 판정](기대는 이 검사의 셈과 맞대 길 자체를 확인) · back = 앞으로 단추 시험(2번을 처음엔 다른 색으로 골랐다가 4번에서 돌아가 바꿈)
const PATHS = [
  ['모두 초록', 'ggggggggggg', 0, V_OK],
  ['빨강 넷 · 합 12 밑', 'rrrrggggggg', 8, V_REST],
  ['노랑 여섯 · 합 6', 'yyyyyyggggg', 6, V_HALF],
  ['빨강 셋 · 합 6', 'ggggrgrggRg', 6, V_HALF],
  ['합 5', 'gygygygyygg', 5, V_OK],
  ['빨강 셋 노랑 다섯 · 합 11', 'yyryyyggrRg', 11, V_HALF],
  ['빨강 셋 노랑 여섯 · 합 12', 'ryyyyryyggr', 12, V_REST],
  ['섞음 · 앞으로 단추', 'rygyrgyrgRy', 12, V_REST, {back: 'g'}],
  ['모두 빨강', 'rrrrrrrrrrr', 22, V_REST],
].map(([name, spec, score, verdict, o]) => ({name, spec, ks: [...spec].map((c, i) => idxOf(i, c)), score, verdict, ...(o || {})}));
for (const P of PATHS) { const J = judge(P.ks); if (J.score !== P.score || J.verdict !== P.verdict) { console.error('길 자체가 틀림', P.name, J); process.exit(1); } }
const SHORT = ['모두 초록', '섞음 · 앞으로 단추', '모두 빨강'];

/* 쓰지 않을 말(brief.md 「쓰지 않을 말」 — 남의 글 data-proper 밖에서) */
const BANNED = ['추천', '매수', '매도', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사세요', '사라', '파세요'];
const KEY = 'atlas:godori-why';

/* 자료(시험 서버에서) — 고도리 칸(gdr.json)은 기록의 「그날 고도리 칸」 기대 값 · 못 받으면 화면도 못 받은 것으로 봄 */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const G = await getJ('/next/data/gdr.json').catch(e => { bump(NEW_NAME + ' 칸 자료 못 받음(기록 기대 = 빈 목록)'); console.error(e.message); return null; });
const pickRec = g => (Array.isArray(g?.picks) ? g.picks.map(p => ({code: p.code, name: p.name, price: p.price, w: p.w})) : []);
const recAsOf = g => (Array.isArray(g?.picks) ? g.asOf ?? null : null);

/* 날짜 글(화면과 같은 꼴 · 보는 기계 시간대 = 서울로 엶) · 퍼센트(지금 화면과 같은 반올림 — 크기로 · 100% 넘으면 소수 없음) */
const TZ = 'Asia/Seoul';
const dayTxt = ms => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric'}).formatToParts(new Date(ms)).map(x => [x.type, x.value])); return `${p.year}년 ${+p.month}월 ${+p.day}일`; };
function pctTxt(x) { if (x == null || !Number.isFinite(x)) return '?'; const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; if (r === 0) return '0.0%'; return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%'; }

/* 브라우저 — 한 번에 하나 · 판마다 새 칸(기억이 따로) */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** store: 'ok' · 'throw'(localStorage 자체가 막힘) · 'nowrite'(쓰기만 막힘) · gdr404 = 고도리 칸 자료 못 받음 · allow = 일부러 못 받게 한 파일(그 404 알림은 오류로 안 셈) */
async function newPage(width, height, {store = 'ok', gdr404 = false, allow = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: TZ});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  if (store === 'nowrite') await ctx.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('가득', 'QuotaExceededError'); }; });
  if (gdr404) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}));
  const p = await ctx.newPage(); p._errs = [];
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
async function open(p, hash, sel) {
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), sel, {timeout: 30000});
}
async function go(p, hash, sel) {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForFunction(([h, s]) => location.hash === h && !!document.querySelector(s) && !document.querySelector('#view .boot'), [hash, sel], {timeout: 30000});
}
const getRecs = p => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return null; } }, KEY);

/* 화면에서 읽기(화면 안에서 돎 — 바깥 것을 쓰지 않음) */
const READQ = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const opts = [...s.querySelectorAll('.wy-opts .wy-opt')].map(b => ({t: b.querySelector('span:not(.wy-dot)')?.textContent ?? '', c: (/\bwy-([gyr])\b/.exec(b.querySelector('.wy-dot')?.className ?? '') || [])[1] ?? null, pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on')}));
  return {step: s.querySelector('.wy-step')?.textContent ?? null, q: s.querySelector('.wy-q')?.textContent ?? null, group: s.querySelector('.wy-opts')?.getAttribute('aria-label') ?? null, opts,
    one: s.querySelector('.wy-one span')?.textContent ?? null, say: s.querySelector('.wy-say q[data-proper]')?.textContent ?? null, sayAny: !!s.querySelector('.wy-say'),
    next: s.querySelector('.wy-nav .wy-next')?.textContent ?? null, back: s.querySelector('.wy-nav .wy-back')?.textContent ?? null, res: !!s.querySelector('.wy-res'), live: s.querySelector('.wy-live')?.textContent ?? ''};
};
const READR = sel => {
  const s = document.querySelector(sel), r = s?.querySelector('.wy-res'); if (!r) return null;
  const bars = [...r.querySelectorAll('.wy-bars .wy-bar')].map(b => { const f = b.querySelector('.wy-fill'), t = b.querySelector('.wy-track'); return {n: b.querySelector('.wy-bn')?.textContent ?? '', v: b.querySelector('b.num')?.textContent ?? '', w: f?.style.width ?? '', fw: f ? f.getBoundingClientRect().width : -1, tw: t ? t.getBoundingClientRect().width : -1}; });
  return {score: r.querySelector('.wy-score b.num')?.textContent ?? null, of: r.querySelector('.wy-score span.num')?.textContent ?? null, reds: r.querySelector('.wy-reds')?.textContent ?? null,
    verdict: r.querySelector('.wy-verdict b')?.textContent ?? null, bars, notes: [...r.querySelectorAll('.wy-note')].map(x => x.textContent), again: [...r.querySelectorAll('.wy-nav button')].map(x => x.textContent),
    link: r.querySelector('a.wy-link')?.getAttribute('href') ?? null, q: s.querySelectorAll('.wy-q, .wy-opt').length, live: s.querySelector('.wy-live')?.textContent ?? ''};
};
const README = () => {
  const s = document.querySelector('#view section.wy-me'); if (!s) return null;
  return {h: s.querySelector('h2')?.textContent ?? '', rows: [...s.querySelectorAll('.wy-rec')].map(r => ({day: r.querySelector('.wy-rh b')?.textContent ?? '', rest: [...r.querySelectorAll('.wy-rh span')].map(x => x.textContent).join(''),
    bars: [...r.querySelectorAll('.wy-bar b.num')].map(x => x.textContent), notes: [...r.querySelectorAll('p.note')].map(x => x.textContent), up: r.querySelector('p.note b.num')?.className ?? null})),
    btn: [...s.querySelectorAll('button, [role="button"], input, select')].map(x => x.textContent.trim() || x.getAttribute('aria-label') || x.tagName), del: [...s.querySelectorAll('a')].filter(a => /지우|지움|삭제/.test(a.textContent)).length};
};
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(남의 글 data-proper 밖 · 이름표 글 포함) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue; // 눈에 안 보이는 읽기 칸(.wy-live 1px)
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
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
}

/* 질문 한 화면 맞대기 — fresh = 아직 안 고른 화면 · picked = 고른 답 자리 */
const ONE = QS.map(() => [new Map(), new Map(), new Map()]); // 질문마다 답마다 본 한마디(판마다 같은지)
function checkQ(s, qi, picked, tag) {
  const Q = QS[qi], at = `${tag} ${qi + 1}번`;
  if (!s) { fail('질문 칸 없음', at); return; }
  if (s.res) fail('결과가 일찍 나옴', at);
  if (s.step !== `${qi + 1} / ${QS.length}`) fail('질문 차례 글', `${at} 「${s.step}」`);
  if (s.q !== `${qi + 1}. ${Q.q}`) fail('질문 글자(원문)', `${at} 「${s.q}」 ≠ 「${qi + 1}. ${Q.q}」`);
  if (s.group !== Q.q) fail('답 묶음 이름표', `${at} 「${s.group}」`);
  if (s.opts.length !== 3) { fail('답 수', `${at} ${s.opts.length}`); return; }
  s.opts.forEach((o, k) => {
    if (o.t !== Q.a[k][1]) fail('답 글자(원문 차례)', `${at} ${k + 1}째 「${o.t}」 ≠ 「${Q.a[k][1]}」`);
    if (o.c !== Q.a[k][0]) fail('답 색(🟢 0 · 🟡 1 · 🔴 2)', `${at} 「${Q.a[k][1]}」 ${o.c} ≠ ${Q.a[k][0]}`);
    const want = picked === k;
    if (o.pressed !== String(want) || o.on !== want) fail('고른 답 표시', `${at} 「${o.t}」 aria-pressed=${o.pressed} on=${o.on} · 기대 ${want}`);
  });
  if ((s.back != null) !== (qi > 0)) fail('앞으로 단추', `${at} ${s.back == null ? '없음' : '있음'}`);
  if (picked == null) {
    if (s.next != null) fail('고르기 전에 다음 단추', at);
    if (s.one != null || s.sayAny) fail('고르기 전에 한마디 · 격언', at);
    return;
  }
  if (s.next == null) fail('고른 뒤 다음 단추 없음', at);
  if (!s.one || /[\n\r]/.test(s.one) || s.one.length > 60) fail(NEW_NAME + ' 한마디 한 줄', `${at} 「${s.one}」`);
  else { const seen = ONE[qi][picked]; seen.set(s.one, (seen.get(s.one) || 0) + 1); }
  if (!s.live.includes(s.one ?? '\u0000')) fail('읽어 주는 칸(aria-live)에 한마디 없음', at);
  if (s.say !== Q.say) fail('격언(원문 · data-proper)', `${at} 「${s.say}」 ≠ 「${Q.say}」`);
  bump('맞댄 질문 화면');
}

/** 길 하나 — 첫 질문(새 화면)부터 결과까지 · 기록 맞대기 · 다시 하기(keep = 결과 화면을 남김) · scanSel = 모양을 잴 칸 */
async function runPath(p, sel, P, tag, {scan = false, scanSel = sel, store = 'ok', gdrX = G, keep = false, recCheck = true} = {}) { // recCheck = false → 기록 수 · 맨 앞 맞대기는 부르는 쪽이 함
  const T = `${tag} · ${P.name}`, before = store === 'ok' && recCheck ? await getRecs(p) : null, tStart = Date.now();
  const click = async (css, k = 0) => { await p.locator(sel + ' ' + css).nth(k).click({timeout: 8000}); };
  const ks = P.ks, k2first = P.back ? idxOf(1, P.back) : null; // 앞으로 단추 시험 — 2번은 처음에 다른 답(k2first)을 골랐다가 4번에서 돌아가 바꿈
  for (let qi = 0; qi < QS.length; qi++) {
    let s = await p.evaluate(READQ, sel);
    checkQ(s, qi, null, T);
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고르기 전`);
    const k0 = k2first != null && qi === 1 ? k2first : ks[qi];
    await click('.wy-opt', k0);
    s = await p.evaluate(READQ, sel); checkQ(s, qi, k0, T);
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고른 뒤`);
    if (k2first != null && qi === 1) { // 고른 답을 바로 바꿔 봄 — 한 답만 눌림
      const kAlt = (k0 + 1) % 3; await click('.wy-opt', kAlt); checkQ(await p.evaluate(READQ, sel), qi, kAlt, T + ' 바꿔 고름'); await click('.wy-opt', k0);
    }
    await click('.wy-next');
    if (k2first != null && qi === 2) { // 4번 화면(안 고름)에서 앞으로 두 번 → 2번을 바꿈 → 다음 두 번 → 4번은 그대로 안 고름
      checkQ(await p.evaluate(READQ, sel), 3, null, T + ' 앞으로 전');
      await click('.wy-back'); checkQ(await p.evaluate(READQ, sel), 2, ks[2], T + ' 앞으로 1');
      await click('.wy-back'); checkQ(await p.evaluate(READQ, sel), 1, k2first, T + ' 앞으로 2');
      await click('.wy-opt', ks[1]); checkQ(await p.evaluate(READQ, sel), 1, ks[1], T + ' 앞에서 바꿈');
      await click('.wy-next'); checkQ(await p.evaluate(READQ, sel), 2, ks[2], T + ' 다시 다음 1');
      await click('.wy-next'); bump('앞으로 단추 길');
    }
  }
  const J = judge(ks), r = await p.evaluate(READR, sel);
  if (!r) { fail('결과 칸 없음', T); return null; }
  if (r.q) fail('결과 화면에 질문이 남음', T);
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
  if (r.link !== '#/me') fail('「나」 칸 고리', `${T} ${r.link}`);
  if (!r.live.includes(String(J.score)) || !r.live.includes(J.verdict)) fail('읽어 주는 칸(aria-live)에 점수 · 판정 없음', `${T} 「${r.live}」`);
  const saved = store === 'ok';
  if (saved ? !r.notes.some(t => t.includes('「나」 칸')) : !r.notes.some(t => /남길 수 없/.test(t)) || r.notes.some(t => /쌓았/.test(t))) fail('기록 알림 글', `${T} ${JSON.stringify(r.notes)}`);
  if (scan) await layout(p, scanSel, `${T} 결과`);
  bump('끝낸 길'); bump('판정 ' + J.verdict);
  if (saved && recCheck) { // 기록 — 끝낼 때 딱 한 번 · 맨 앞에
    const recs = await getRecs(p), x = recs?.[0];
    if (!Array.isArray(recs) || recs.length !== (before?.length ?? 0) + 1) fail('기록 수(끝낼 때 한 번)', `${T} ${before?.length} → ${recs?.length}`);
    else {
      const at = Date.parse(x.at);
      if (!(at >= tStart - 2000 && at <= Date.now() + 2000)) fail('기록 날짜', `${T} ${x.at}`);
      if (!eq(x.answers, ks)) fail('기록 답', `${T} ${JSON.stringify(x.answers)} ≠ ${JSON.stringify(ks)}`);
      if (x.score !== J.score || x.reds !== J.reds || x.verdict !== J.verdict) fail('기록 점수 · 빨강 · 판정', `${T} ${x.score} ${x.reds} ${x.verdict}`);
      if (!eq(GROUPS.map(([n]) => x.groups?.[n]), GROUPS.map(([n]) => J.groups[n]))) fail('기록 묶음', `${T} ${JSON.stringify(x.groups)}`);
      if (x.asOf !== recAsOf(gdrX)) fail('기록 자료 날짜', `${T} ${x.asOf} ≠ ${recAsOf(gdrX)}`);
      if (!eq(x.picks, pickRec(gdrX))) fail('기록 그날 ' + NEW_NAME + ' 칸', `${T} ${JSON.stringify(x.picks).slice(0, 160)}`);
      bump('맞댄 기록');
    }
  }
  if (keep) return J;
  // 다시 하기 — 처음 질문 · 아무것도 안 고름
  await p.locator(sel + ' .wy-res .wy-nav button').first().click({timeout: 8000});
  checkQ(await p.evaluate(READQ, sel), 0, null, T + ' 다시 하기');
  return J;
}

/** 「나」 칸 — 기록 맞대기(새 것부터 · 서른 줄까지 · 날짜 · 점수 · 판정 · 막대 · 한 달 뒤 날짜 · 지난 기록 결과) · 지우는 단추 없음 */
async function checkMe(p, tag, {expectN = null, later = null} = {}) {
  if (later) await p.waitForFunction(n => [...document.querySelectorAll('#view section.wy-me p.note')].filter(x => /한 달 뒤 결과 ·|\? 지금 값/.test(x.textContent)).length >= n, later.length, {timeout: 20000}).catch(() => fail('한 달 뒤 결과가 안 붙음', tag));
  const m = await p.evaluate(README), recs = (await getRecs(p)) ?? [];
  if (!m) { fail('「나」 칸 기록 칸 없음', tag); return; }
  const n = expectN ?? recs.length;
  if ((/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR')) fail('「나」 칸 기록 수', `${tag} 「${m.h}」 ≠ ${n}`);
  if (m.rows.length !== Math.min(n, 30)) fail('「나」 칸 줄 수(서른까지)', `${tag} ${m.rows.length} ≠ ${Math.min(n, 30)}`);
  m.rows.forEach((row, i) => {
    const x = recs[i]; if (!x) return;
    const at = Date.parse(x.at), J = Array.isArray(x.answers) && x.answers.length === QS.length ? judge(x.answers) : null;
    if (row.day !== dayTxt(at)) fail('「나」 칸 날짜', `${tag} ${i + 1}줄 「${row.day}」 ≠ 「${dayTxt(at)}」`);
    if (!row.rest.includes(`점수 ${x.score} / ${MAX}`) || !row.rest.includes(x.verdict)) fail('「나」 칸 점수 · 판정', `${tag} ${i + 1}줄 「${row.rest}」`);
    if (J && (J.score !== x.score || J.verdict !== x.verdict)) fail('쌓인 기록의 점수 · 판정(답으로 다시 셈)', `${tag} ${i + 1}줄 ${x.score} ${x.verdict}`);
    if (!eq(row.bars, GROUPS.map(([nm, qs]) => `${x.groups?.[nm] ?? 0} / ${qs.length * 2}`))) fail('「나」 칸 막대 숫자', `${tag} ${i + 1}줄 ${JSON.stringify(row.bars)}`);
    const L = later?.find(l => l.at === x.at);
    if (L) { // 한 달 지난 기록 — 값 있는 곳 수 · 비중으로 묶은 합(따로 셈) · 값 없는 곳 「?」 · 색
      const t = row.notes.find(z => z.includes(L.pct)) ?? '';
      if (!t || !t.includes(`${L.ok}곳`) || (L.miss ? !t.includes(`? ${L.miss}곳`) : t.includes('?'))) fail('한 달 뒤 결과(따로 셈)', `${tag} ${JSON.stringify(row.notes)} · 기대 ${L.ok}곳 ${L.pct}${L.miss ? ` · ? ${L.miss}곳` : ''}`); else bump('맞댄 한 달 뒤 결과');
      if (!String(row.up).split(' ').includes(L.cls)) fail('한 달 뒤 결과 색', `${tag} ${row.up} ≠ ${L.cls}`);
    }
    else if (x.picks?.length && Date.now() - at < 30 * 864e5) { const want = `그날 ${NEW_NAME} 칸 ${x.picks.length}곳`; if (!row.notes.some(t => t.startsWith(want) && t.includes(dayTxt(at + 30 * 864e5)))) fail('한 달 뒤에 붙일 날짜', `${tag} ${i + 1}줄 ${JSON.stringify(row.notes)}`); }
    else if (!x.picks?.length && row.notes.length) fail(NEW_NAME + ' 칸 없는 기록에 결과 줄', `${tag} ${i + 1}줄 ${JSON.stringify(row.notes)}`);
  });
  if (m.btn.length || m.del) fail('기록 지우는 단추(명령 13 「틀린 것도 지우지 마라」)', `${tag} ${JSON.stringify(m.btn)} · 지우기 고리 ${m.del}`);
  bump('맞댄 「나」 칸');
}

/* ① ~ ④ 네 판 — 두 폭 × 두 곳 */
const COMBOS = [[360, 640, '#/'], [390, 844, '#/why'], [360, 640, '#/why'], [390, 844, '#/']];
const SEL = '#view section.wy';
let ci = 0;
for (const [w, h, hash] of COMBOS) {
  const tag = `${w}×${h} ${hash}`, full = ALL || ci < 2, p = await newPage(w, h, {allow: ['/atlas/data/co/ZZZZZZ.json']});
  try {
    await open(p, hash, SEL);
    if (hash === '#/why' && !(await p.evaluate(() => document.querySelector('#view section.wy')?.classList.contains('page')))) fail('#/why 칸 꼴', tag);
    const oldRec = (daysAgo, picks = []) => ({at: new Date(Date.now() - daysAgo * 864e5).toISOString(), asOf: '2026-09-01', answers: PATHS[0].ks, score: 0, reds: 0, verdict: V_OK, groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, picks});
    if (ci === 1) await p.evaluate(([k, recs]) => localStorage.setItem(k, JSON.stringify(recs)), [KEY, Array.from({length: 25}, (_, i) => oldRec(40 + i))]); // 「나」 칸 서른 줄 넘음 — 지난 기록 스물다섯(고도리 칸 없음)을 미리 쌓아 둠
    let first = true;
    for (const P of PATHS.filter(P => full || SHORT.includes(P.name))) {
      try { await runPath(p, SEL, P, tag, {scan: first, scanSel: hash === '#/why' ? '#view' : SEL}); } catch (e) { fail('길 멈춤', `${tag} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, hash, SEL).catch(() => {}); }
      first = false; errsOf(p, tag + ' · ' + P.name);
    }
    // 「나」 칸 — 첫 판은 결과의 「나」 칸 고리를 눌러 감 · 한 달 지난 기록(값 있는 둘 + 값 없는 하나)을 맨 끝에 더해 그 뒤 결과를 따로 셈
    const later = [];
    if (ci === 0) {
      const src = (G?.picks ?? []).slice(0, 2).map(x => x.code);
      for (const c of ['005930', '000660']) if (src.length < 2 && !src.includes(c)) src.push(c);
      const cos = await Promise.all(src.map(c => getJ('/atlas/data/co/' + c + '.json').catch(() => null)));
      const picks = src.map((c, i) => ({code: c, name: c, price: Math.round((cos[i]?.c?.price ?? 1000) / (1.1 + i * 0.07)), w: i ? 2.5 : 3})).concat([{code: 'ZZZZZZ', name: '없는 곳', price: 1000, w: 2}]);
      const ok = src.map((c, i) => [picks[i], cos[i]?.c?.price]).filter(([x, now]) => now > 0 && x.price > 0), ws = ok.reduce((s, [x]) => s + x.w, 0);
      const tot = ok.reduce((s, [x, now]) => s + x.w * (now / x.price - 1) * 100, 0) / ws, old = oldRec(40, picks);
      await p.evaluate(([k, x]) => { const a = JSON.parse(localStorage.getItem(k) || '[]'); a.push(x); localStorage.setItem(k, JSON.stringify(a)); }, [KEY, old]);
      later.push({at: old.at, ok: ok.length, miss: picks.length - ok.length, pct: pctTxt(tot), cls: pctTxt(tot) === '0.0%' ? 'fl' : tot > 0 ? 'up' : 'dn'});
      await p.evaluate(() => localStorage.setItem('atlas:new:hist', JSON.stringify(['005930']))); // 「본 기록 · 담은 것 지우기」 단추가 보이게 본 기록 하나
      try {
        await runPath(p, SEL, PATHS[0], tag + ' 고리', {keep: true}); // 결과 화면을 남겨 「「나」 칸 기록 보기 ›」를 누름
        await p.locator(SEL + ' .wy-res a.wy-link').click({timeout: 8000});
        await p.waitForFunction(() => location.hash === '#/me' && !!document.querySelector('#view section.wy-me') && !document.querySelector('#view .boot'), null, {timeout: 30000});
        bump('결과 → 「나」 칸 고리');
      } catch (e) { fail('결과 → 「나」 칸 고리', `${tag}: ${e.message.split('\n')[0]}`); await go(p, '#/me', '#view section.wy-me'); }
    } else await go(p, '#/me', '#view section.wy-me');
    await checkMe(p, tag + ' 「나」', {later: later.length ? later : null});
    await layout(p, '#view section.wy-me', tag + ' 「나」 기록');
    if (ci === 0) { // 「본 기록 · 담은 것 지우기」를 눌러도 왜 사? 기록은 그대로
      const before = await getRecs(p), btn = p.locator('#view .lst button');
      if (await btn.count()) {
        p.once('dialog', d => d.accept()); await btn.first().click();
        await p.waitForFunction(() => !document.querySelector('#view .lst button') && !!document.querySelector('#view section.wy-me'), null, {timeout: 15000}).catch(() => fail('본 기록 지우기 뒤 화면', tag));
        if (!eq(await getRecs(p), before)) fail('본 기록 지우기가 왜 사? 기록까지 지움', tag); else bump('지우기 눌러도 기록 그대로');
        await checkMe(p, tag + ' 「나」 지우기 뒤', {later: later.length ? later : null});
      } else fail('본 기록 지우기 단추를 못 찾음(시험 준비)', tag);
    }
    errsOf(p, tag + ' 「나」');
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close(); ci++;
}

/* 고도리 한마디 — 판마다 같은 답은 같은 한마디 · 한 질문 안 답마다 다름 · 모든 답을 한 번은 봄 */
QS.forEach((Q, qi) => {
  const seen = ONE[qi].map(m => [...m.keys()]);
  seen.forEach((xs, k) => { if (!xs.length) fail('한마디를 못 본 답(길을 늘릴 것)', `${qi + 1}번 「${Q.a[k][1]}」`); if (xs.length > 1) fail('같은 답에 한마디가 여럿', `${qi + 1}번 「${Q.a[k][1]}」 ${JSON.stringify(xs)}`); });
  const one = seen.map(xs => xs[0]).filter(Boolean); if (new Set(one).size !== one.length) fail('한 질문 안에 같은 한마디(답마다 한마디)', `${qi + 1}번 ${JSON.stringify(one)}`);
});

/* ⑤ 기억 못 하는 기계 · 고도리 칸 자료 못 받음 */
for (const [tag, w, h, hash, o, P] of [
  ['localStorage 막힘', 390, 844, '#/', {store: 'throw'}, PATHS[0]],
  ['localStorage 막힘', 360, 640, '#/why', {store: 'throw'}, PATHS[8]],
  ['쓰기만 막힘', 390, 844, '#/why', {store: 'nowrite'}, PATHS[4]],
  [NEW_NAME + ' 칸 자료 못 받음', 360, 640, '#/why', {gdr404: true, allow: ['/next/data/gdr.json']}, PATHS[8]],
]) {
  const T = `${tag} ${w}×${h} ${hash}`, p = await newPage(w, h, o);
  try {
    await open(p, hash, SEL);
    await runPath(p, SEL, P, T, {scan: true, scanSel: hash === '#/why' ? '#view' : SEL, store: o.store ?? 'ok', gdrX: o.gdr404 ? null : G});
    await go(p, '#/me', '#view section.wy-me');
    await checkMe(p, T + ' 「나」', {expectN: o.store ? 0 : 1});
    if (o.store) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me')?.textContent ?? ''); if (!/기록 0번/.test(t)) fail('기억 못 하는 기계 「나」 칸', `${T} 「${t.slice(0, 80)}」`); }
    if (o.gdr404) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me .wy-rec')?.textContent ?? ''); if (t.includes(NEW_NAME + ' 칸')) fail('자료 없이 ' + NEW_NAME + ' 칸 줄', T); }
    await layout(p, '#view section.wy-me', T + ' 「나」');
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
// 기억에 망가진 줄(null · 글 · 숫자)이 섞임 — 「나」 칸은 성한 기록만 그리고(기록 수 = 성한 줄) 멈추지 않음 · 새로 끝낸 답은 맨 앞에 쌓임 · 화면 오류 0
{
  const T = '망가진 줄 섞임 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL);
    const good = {at: new Date(Date.now() - 3 * 864e5).toISOString(), asOf: G?.asOf ?? null, answers: PATHS[4].ks, score: 5, reds: 0, verdict: V_OK, groups: judge(PATHS[4].ks).groups, picks: []};
    await p.evaluate(([k, a]) => localStorage.setItem(k, JSON.stringify(a)), [KEY, [null, '망가짐', 42, good]]);
    const meOk = async (tag, n) => {
      await p.evaluate(h => { location.hash = h; }, '#/me');
      await p.waitForFunction(() => location.hash === '#/me' && !document.querySelector('#view .boot') && !!document.querySelector('#view section.wy-me, #view .empty'), null, {timeout: 30000});
      const m = await p.evaluate(README);
      if (!m) { fail('망가진 줄에 「나」 칸 기록이 멈춤', `${T} ${tag} 「${await p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '')}」`); return; }
      if ((/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== String(n) || m.rows.length !== n) fail('망가진 줄 빼고 성한 기록만', `${T} ${tag} 「${m.h}」 줄 ${m.rows.length} ≠ ${n}`);
      if (!m.rows.some(r => r.day === dayTxt(Date.parse(good.at)) && r.rest.includes(`점수 ${good.score} / ${MAX}`))) fail('망가진 줄 사이 성한 기록', `${T} ${tag}`);
    };
    await meOk('처음', 1);
    await go(p, '#/why', SEL);
    await runPath(p, SEL, PATHS[8], T, {recCheck: false}); // 기록 수 · 맨 앞 맞대기는 아래에서(망가진 줄은 셈 밖)
    const recs = await getRecs(p);
    if (!(recs?.[0] && typeof recs[0] === 'object' && recs[0].score === judge(PATHS[8].ks).score && eq(recs[0].answers, PATHS[8].ks))) fail('망가진 줄 위에 새 기록', `${T} ${JSON.stringify(recs?.[0]).slice(0, 120)}`);
    await meOk('새 기록 뒤', 2);
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-why-1', when: new Date().toISOString(), base, path: NEXT, all: ALL, gdrAsOf: G?.asOf ?? null, picks: G?.picks?.length ?? null, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');

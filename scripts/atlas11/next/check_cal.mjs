// 새 아틀란스 「달력」 쪽(#/cal · 종목 파일 #/cal/<번호>) 맞대기 검사 — 옛 쪽(/atlas/)과 새 쪽(/next/?dev=1)을 같은 자료로 열어 글 · 숫자를 맞댐
//   사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」 · 규칙 70(달력 탭)
//   쓰는 법: node scripts/atlas11/next/check_cal.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--wide N] [--pw /opt/node-tools/] [--out 결과.json]
//     (아무것도 안 주면 종목 파일 모두 · 세 폭은 10곳 · --all = 모두 · 세 폭도 모두 · --limit N = 종목 파일 N곳 · --wide N = 세 폭에서 볼 종목 파일 수)
//   ① 같은 자료 맞대기 — 달력 첫 화면 · 종목 파일 · 없는 주소 · 지켜보지 않는 번호: 접은 칸 · 「더 보기」를 모두 펼친 뒤
//      옛 쪽 #view 글 줄이 새 쪽 main#view 줄 안에 빠짐없이 · 숫자 낱말(% · 곳 · 개 · 일 · 월 · 「?」) 수가 새 쪽에 모자라지 않게 ·
//      종목 파일 고리(#/cal/<번호> · 이름 · % · 금빛 낱말) 짝이 같게 · 그림 이름(aria-label — 선 · 칸 길 · 점의 모든 날 값) 빠짐없이 · 제목 같게 ·
//      회사 고리 옛 #/c/<번호> → 새 #/w/<번호> · 옛 맨 아래 「상담사가 아닙니다 …」 줄(쓰지 않을 말 「매수 · 매도」가 든 줄) 자리 = 새 안전 문장 · 쓰지 않을 말 0
//   ② 바꿔치기 자료(장 중 · 새로 생긴 금빛 · ! 반 토막 · ? 반 토막 · ? 거래 멈춤 · ? 값 없음 · 새로 뽑힌 곳 없는 날 · 아직 없음 · 못 받음 · 종목 파일 못 받음 · 되짚음 없음)로 ① 그대로
//   ③ 세 폭(320 · 360 · 390) — 가로 넘침 0 · 화면 밖 조각 0 · 누르는 자리 44px · 글 17px 넘게 · 화면 오류 0
//   ④ 누르기 — 칸 고르기(옛 쪽과 같은 줄) · 관심(★ 맨 위) · 관심 없음(숨김 · 되돌리기) · 다시 열어도 남음 · 옛 쪽과 같은 기억(열쇠 atlas:cal-star · atlas:surge-hide) ·
//      기억 못 하는 기계 · 종목 파일에서 돌아오면 칸 고르기 · 펼친 칸 그대로 · 다른 곳에서 오면 처음 꼴 · 지나온 일 「더 보기」 · 창 넓이가 바뀌면 그림을 제 넓이로
//   자료 넷(surgetr · surgetr-case · core · mkt)은 검사 처음에 한 번 받아 옛 쪽 · 새 쪽에 같은 것을 줌 — 실제 사이트(aaa7377.com)에서 돌 때 하루 4번 업데이트가 사이에 끼어도 맞대기가 흔들리지 않게
//   CAL_LAP=1 이면 칸마다 걸린 때를 찍음(느린 기계에서 어디가 오래 걸리나)
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep, SAFE_LINE} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리) — 옛 쪽 글을 새 이름으로 고쳐 맞댐
import {fetchJSON, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9 — 자료 넷은 처음 한 번 받아 두 쪽에 같은 것을 줌(pin))
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const ALL = argv.includes('--all');
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const LIMIT = ALL ? 0 : Number(arg('--limit', '0')) || 0; // 0 = 모두
const WIDE = ALL ? 0 : Number(arg('--wide', '10')) || 10;
const OUT = arg('--out', null);
const t0 = Date.now(), fails = [], counts = {}, tm = timer(t0);
const T = (p, fn) => tm[p._side === 'old' ? 'old' : 'new'](fn); // 여는 데 쓴 때 — 그 쪽 몫으로
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 300) fails.push([k, String(x).slice(0, 300)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const lap = k => { if (process.env.CAL_LAP) console.error('…', k, Math.round((Date.now() - t0) / 1000) + 's'); };

/* 자료 — 검사가 따로 받음(바꿔치기 바탕 · 고를 종목) */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [TR, TRC, CORE, MKT] = await Promise.all(['surgetr.json', 'surgetr-case.json', 'core.json', 'mkt.json'].map(f => getJ(f).catch(e => { console.error('자료를 못 받음', e.message); process.exit(1); })));
const SNAP = {'surgetr.json': JSON.stringify(TR), 'surgetr-case.json': JSON.stringify(TRC), 'core.json': JSON.stringify(CORE), 'mkt.json': JSON.stringify(MKT)};
/** 옛 쪽 · 새 쪽이 같은 자료를 보게 — 검사 처음에 받은 그대로(실제 사이트에서 돌 때 업데이트가 사이에 끼어도 흔들리지 않게) · over = 바꿔치기({파일: 자료 | 404}) */
async function pin(ctx, over = {}) {
  for (const f of Object.keys(SNAP)) await ctx.route(`**/atlas/data/${f}`, r => { const o = over[f]; if (o === 404) return r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}); return r.fulfill({status: 200, contentType: 'application/json', body: o === undefined ? SNAP[f] : JSON.stringify(o)}); });
}
const CO = MKT.companies, K0 = TRC.cases, CODES = TR.cases.map(c => c[0]), CASE = new Map(TR.cases.map(c => [c[0], c]));
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
const BANNED = ['추천', '매수', '매도', '팔라', '사라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];
const SAFE = SAFE_LINE; // 새 쪽 안전 문장(보드리는 지난 기록만 보여 줘요 …)

/* 글 맞대기 도구 — 붙임표(U+2060) 빼고 · 붙임 띄어쓰기(U+00A0)는 띄어쓰기로 */
const norm = s => String(s ?? '').replace(/\u2060/g, '').replace(/\u00a0/g, ' ').replace(/[ \t\r\f\v]+/g, ' ').trim();
const lines = s => String(s ?? '').split('\n').map(norm).filter(Boolean);
const TOKRE = /[+−-]?\d[\d,]*(?:\.\d+)?(?:%|곳꼴|곳|개|거래일|일|월|배|원)?|\?/g;
const tokens = s => { const m = new Map(); for (const t of norm(s).match(TOKRE) || []) m.set(t, (m.get(t) || 0) + 1); return m; };
const multi = xs => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
const rowKey = r => { const [href, t] = r.split('\u0001'); return href + ' ' + lines(t).join(' | '); };

/* 브라우저 — 한 번에 하나 · 쪽마다 오류 모음 */
const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
const SIDE = {old: {url: h => `${base}/atlas/${h}`, root: '#view'}, new: {url: h => `${base}/next/?dev=1${h}`, root: 'main#view'}};
const errsOk = new Set(); // 일부러 못 받게 한 자료의 404 줄은 봐줌(바꿔치기 ②)
async function open(ctx, side, hash, {allow404 = false} = {}) {
  const p = await ctx.newPage(); p._side = side; p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !(allow404 && /Failed to load resource/.test(m.text()))) p._errs.push(m.text()); });
  await T(p, async () => { await p.goto(SIDE[side].url(hash)); await settle(p, hash); });
  return p;
}
async function settle(p, what) {
  await p.waitForFunction(sel => { const r = document.querySelector(sel), f = r?.firstElementChild; return !!f && !f.dataset.chkStale && !r.querySelector('.boot'); }, SIDE[p._side].root, {timeout: 20000})
    .catch(() => fail('여는 중 남음', p._side + ' ' + what));
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); // 그림은 붙은 뒤 넓이로 다시 그림(ResizeObserver)
}
const mark = p => p.evaluate(sel => { const f = document.querySelector(sel)?.firstElementChild; if (f) f.dataset.chkStale = '1'; }, SIDE[p._side].root);
async function nav(p, hash) {
  if (await p.evaluate(h => (location.hash || '#/') === h, hash)) return; // 같은 주소면 다시 그리지 않음
  await T(p, async () => { await mark(p); await p.evaluate(h => { location.hash = h; }, hash); await settle(p, hash); });
}
async function clickNav(p, sel, what) { await T(p, async () => { await mark(p); await p.click(sel); await settle(p, what || sel); }); }
async function back(p) { await T(p, async () => { await mark(p); await p.evaluate(() => history.back()); await settle(p, '뒤로'); }); }
const errsOf = (p, where) => { if (p._side === 'new' && p._errs.length) fail('화면 오류', where + ' ' + p._errs.join(' | ')); else if (p._errs.length) bump('옛 쪽 오류(참고)'); p._errs.length = 0; };

/** 쪽 글 뽑기 — 접은 칸 · 「더 보기」 펼침 · 옛 쪽 맨 아래 친구 그림 · 소개 고리 · 「상담사가 아닙니다」 줄은 뺌(새 쪽은 그 자리에 안전 문장) */
const EXTRACT = ({root, old, expand}) => {
  const R = document.querySelector(root);
  if (expand) { for (const b of [...R.querySelectorAll('button')]) if (/^더 보기 \d+개$/.test(b.textContent.trim())) b.click(); for (const d of R.querySelectorAll('details')) d.open = true; }
  if (old) { R.querySelectorAll('footer .links, footer .foot-mo').forEach(e => e.remove()); for (const p of [...R.querySelectorAll('footer p')]) if (p.textContent.startsWith('저는 투자 상담사가 아닙니다')) p.remove(); }
  const cl = R.cloneNode(true); cl.querySelectorAll('.nm, h1, [data-proper], a.inl[href^="#/cal/"]').forEach(e => e.remove()); // 이름(고유 이름)은 쓰지 않을 말 셈 밖
  return {text: R.innerText, bare: cl.textContent, h1: R.querySelector('h1')?.textContent ?? '', title: document.title,
    rows: [...R.querySelectorAll('a[href^="#/cal/"]')].map(a => a.getAttribute('href') + '\u0001' + a.innerText),
    aria: [...R.querySelectorAll('[aria-label]')].filter(e => !e.closest('footer')).map(e => e.getAttribute('aria-label')),
    links: [...R.querySelectorAll('a[href]')].map(a => [a.getAttribute('href'), a.innerText])};
};
const grab = (p, expand = true) => T(p, () => p.evaluate(EXTRACT, {root: SIDE[p._side].root, old: p._side === 'old', expand}));

/** 옛 쪽 O 와 새 쪽 N 맞대기 — 옛 쪽 글은 이름만 새 이름으로(아틀란스 → 보드리 · rename.mjs) 고친 뒤 맞댐 */
function compare(tag, O0, N) {
  const O = oldToNewDeep(O0);
  bump('맞댄 화면');
  if (!norm(O.text)) { fail(tag, '옛 쪽 글이 비었음'); return; }
  const NL = lines(N.text), NS = new Set(NL); // 같은 줄은 바로 · 아니면 새 줄 안에 든 것(새 쪽이 두 조각을 한 줄로 이은 곳)
  let nl = 0; for (const L of lines(O.text)) { if (L === 'null') continue; nl++; if (!NS.has(L) && !NL.some(x => x.includes(L))) fail(tag + ' · 옛 줄 빠짐', L); } // 옛 쪽 「null」 줄 = 옛 쪽 잘못(지켜보는 곳 · 처음 뽑힌 곳이 모두 없을 때 · DOM append) — 새 쪽은 고침
  for (const L of NL) if (/\b(null|undefined|NaN)\b|\[object /.test(L)) fail(tag + ' · 새 쪽에 깨진 글', L); // 빈 값이 글로 새 나옴
  bump('맞댄 줄', nl);
  const tO = tokens(O.text), tN = tokens(N.text); let nt = 0;
  for (const [k, c] of tO) { nt += c; if ((tN.get(k) || 0) < c) fail(tag + ' · 숫자 낱말 모자람', `「${k}」 옛 ${c} · 새 ${tN.get(k) || 0}`); }
  bump('맞댄 숫자 낱말', nt);
  const rO = multi(O.rows.map(rowKey)), rN = multi(N.rows.map(rowKey));
  for (const [k, c] of rO) if ((rN.get(k) || 0) !== c) fail(tag + ' · 종목 파일 고리 다름', `${k} 옛 ${c} · 새 ${rN.get(k) || 0}`);
  for (const [k, c] of rN) if (!rO.has(k)) fail(tag + ' · 새 쪽에만 있는 고리', `${k} ×${c}`);
  bump('맞댄 고리', O.rows.length);
  const aN = new Set(N.aria.map(norm));
  for (const a of O.aria) if (!aN.has(norm(a))) fail(tag + ' · 그림 이름 빠짐', norm(a).slice(0, 160));
  bump('맞댄 그림 이름', O.aria.length);
  for (const [href, t] of O.links) {
    if (href.startsWith('#/cal/')) continue; // 위 고리 짝에서 봄
    const m = /^#\/[cx]\/([0-9A-Z]{6})$/.exec(href), want = m ? '#/w/' + m[1] : href;
    if (!N.links.some(([h2, t2]) => h2 === want && norm(t2) === norm(t))) fail(tag + ' · 고리 빠짐', `${href} → ${want} 「${norm(t)}」`);
  }
  if (norm(O.h1) !== norm(N.h1)) fail(tag + ' · 제목 다름', `${norm(O.h1)} ≠ ${norm(N.h1)}`);
  if (!N.title.startsWith(N.h1)) fail(tag + ' · 탭 제목', N.title);
  if (!lines(N.text).includes(SAFE)) fail(tag + ' · 안전 문장 없음', SAFE);
  for (const w of BANNED) if (N.bare.includes(w)) fail(tag + ' · 쓰지 않을 말', w);
}

/** 고를 종목 파일 — 드문 꼴 먼저(새로 뽑힘 · 거래 멈춤 · 제자리 · 값 없음 · 빈 점 · 「?」 칸 · 조심 · 일이 가장 많은 곳 · 반 토막 · 내림 · 오름) 그다음 자료 차례 */
function casePick(n) {
  const out = [], add = c => { if (c && !out.includes(c)) out.push(c); };
  add(TR.cases.find(c => c[6] === 'n')?.[0]); add(TR.cases.find(c => c[7])?.[0]); add(TR.cases.find(c => c[6] === 'z')?.[0]); add(TR.cases.find(c => c[6] === 'q')?.[0]);
  add(CODES.find(c => K0[c]?.z?.length)); add(CODES.find(c => String(K0[c]?.q).includes('?'))); add(CODES.find(c => K0[c]?.ev?.some(e => e[1] === 'warn')));
  add([...CODES].sort((a, b) => (K0[b]?.ev?.length || 0) - (K0[a]?.ev?.length || 0))[0]); add(TR.cases.find(c => c[8])?.[0]); add(TR.cases.find(c => c[6] === 'd')?.[0]); add(TR.cases.find(c => c[6] === 'u')?.[0]);
  for (const c of CODES) add(c);
  return n ? out.slice(0, n) : out;
}
const notTracked = Object.keys(CO).find(c => !CASE.has(c)); // 회사이지만 달력이 지켜보지 않는 번호
const EXTRA = ['#/cal/abc', '#/cal/' + notTracked, '#/cal/999999', '#/cal/' + CODES[0] + '/x']; // 없는 주소 · 지켜보지 않는 회사 · 없는 번호 · 깨진 꼴

/* ① 같은 자료 맞대기 */
{
  const ctx = await browser.newContext({viewport: {width: 360, height: 800}, deviceScaleFactor: 1}); await pin(ctx);
  const op = await open(ctx, 'old', '#/cal'), np = await open(ctx, 'new', '#/cal');
  compare('#/cal', await grab(op), await grab(np));
  const list = casePick(LIMIT);
  for (const c of list) {
    const hsh = '#/cal/' + c;
    await nav(op, hsh); await nav(np, hsh);
    const [O, N] = [await grab(op), await grab(np)];
    compare(hsh, O, N); bump('종목 파일');
    if (!N.links.some(([hr, t]) => hr === '#/w/' + c && norm(t) === '회사 보기 ›')) fail(hsh + ' · 회사 고리', '#/w/' + c);
    if (!N.links.some(([hr, t]) => hr === '#/cal' && norm(t) === '‹ 달력')) fail(hsh + ' · 달력 고리', '#/cal');
  }
  for (const hsh of EXTRA) { await nav(op, hsh); await nav(np, hsh); compare(hsh, await grab(op), await grab(np)); bump('없는 주소 · 밖 번호'); }
  errsOf(np, '① 맞대기'); errsOf(op, '① 맞대기');
  await ctx.close();
}

lap('① 끝');
/* ② 바꿔치기 자료 — 같은 바꾼 자료를 옛 쪽 · 새 쪽에 함께 줌 */
const clone = x => JSON.parse(JSON.stringify(x));
const openDays = TR.days.slice(0, 5);
const shown = st => [...new Set([...openDays.slice(2), ...TR.days].flatMap(x => x.sel))].filter(c => CASE.get(c)?.[6] === st); // 그 상태의 종목(펼친 날 먼저 · 모든 날 줄은 처음부터 칸 안에 있음)
const pickN = (n, ...ls) => { const o = []; for (const c of [...ls.flat(), ...CODES]) if (c && !o.includes(c) && o.length < n) o.push(c); return o; }; // 자료가 바뀌어 그 꼴이 모자라도 멈추지 않게
async function variant(name, {tr, trc, core, cases = [], want = [], wantCase = {}}) {
  const ctx = await browser.newContext({viewport: {width: 360, height: 800}, deviceScaleFactor: 1}); // 바꿔치기 자료(나머지는 붙박이)
  await pin(ctx, {'surgetr.json': tr, 'surgetr-case.json': trc, 'core.json': core});
  const allow404 = tr === 404 || trc === 404;
  const op = await open(ctx, 'old', '#/cal', {allow404}), np = await open(ctx, 'new', '#/cal', {allow404});
  const O = await grab(op), N = await grab(np);
  compare(`② ${name} #/cal`, O, N);
  for (const w of want) { if (!norm(O.text).includes(norm(w))) fail(`② ${name} · 바꾼 자료가 옛 쪽에 안 보임`, w); if (!norm(N.text).includes(norm(w))) fail(`② ${name} · 새 쪽에 없음`, w); }
  for (const c of cases) {
    await nav(op, '#/cal/' + c); await nav(np, '#/cal/' + c);
    const O2 = await grab(op), N2 = await grab(np);
    compare(`② ${name} #/cal/${c}`, O2, N2);
    for (const w of wantCase[c] || []) { if (!norm(O2.text).includes(norm(w))) fail(`② ${name} #/cal/${c} · 옛 쪽에 안 보임`, w); if (!norm(N2.text).includes(norm(w))) fail(`② ${name} #/cal/${c} · 새 쪽에 없음`, w); }
  }
  errsOf(np, '② ' + name); errsOf(op, '② ' + name);
  await ctx.close(); bump('바꿔치기');
}
{
  const [cH, cF1, cF2, cQ] = pickN(4, shown('u'), shown('d')), noSel = openDays.at(-1).d;
  const T = clone(TR), C = clone(CORE);
  T.provisional = true; T.kst = `${T.asOf} 14:05`; T.m10 = null;
  const row = c => T.cases.find(x => x[0] === c);
  row(cH)[7] = 1; row(cF1)[8] = 1; row(cF2)[8] = 2; row(cQ)[6] = 'q'; row(cQ)[5] = null;
  T.alerts = [{kind: 'halt', n: 1, cs: [cH]}, {kind: 'half', f: 1, n: 1, cs: [cF1]}, {kind: 'half', f: 2, n: 1, top: {c: cF2}}, {kind: 'half', f: 1, n: 0, cs: []}];
  T.days.find(x => x.d === noSel).sel = [];
  C.provisional = true;
  const nm = c => CASE.get(c)[1];
  await variant('장 중 · 금빛 · 값 없음', {tr: T, core: C, cases: [cH, cF1, cF2, cQ],
    want: ['? 거래 멈춤 1곳 · ! 반 토막 1곳 · ? 반 토막 1곳', '오후 2:05 값이에요. 장 중이라 바뀌어요.', '이날 새로 뽑힌 곳은 없어요.', '? 값이 없는 곳 1곳', '마지막 장날 종가로 새로 생긴 일이에요.', '그날 저녁 8시 전에 받아'],
    wantCase: {[cH]: ['? 거래 멈춤 — 마지막 장날에 거래가 없었어요.', '값은 장 중 값이에요. 저녁 8시까지 바뀌어요.'], [cF1]: ['! 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요.'], [cF2]: ['? 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요. 하루 35% 넘게'], [cQ]: ['? 값 없음', nm(cQ)]}});
  const T2 = clone(TR); T2.N = 0; T2.k = 5;
  await variant('처음 뽑힘', {tr: T2, want: ['에 처음 5곳이 뽑혔어요.', '등락률은 다음 장날부터 쌓여요.']});
  const T3 = clone(TR); T3.N = 0; T3.k = 0;
  await variant('아직 없음', {tr: T3, want: ['아직 지켜보는 곳이 없어요.']});
  const T4 = clone(TR); T4.seed = null; for (const x of T4.days) x.seed = false; for (const c of T4.cases) c[10] = 0;
  await variant('되짚음 없음', {tr: T4, cases: [CODES[0], CODES.at(-1)]});
  const T5 = clone(TR); T5.version = 'tr-v0';
  await variant('판 이름 다름', {tr: T5, cases: [CODES[0]], want: ['? 달력 자료를 못 받았어요.'], wantCase: {[CODES[0]]: ['? 종목 파일을 못 받았어요.']}});
  await variant('달력 못 받음', {tr: 404, cases: [CODES[0]], want: ['? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'], wantCase: {[CODES[0]]: ['? 종목 파일을 못 받았어요. 잠시 뒤 다시 열어 주세요.']}});
  await variant('종목 파일 못 받음', {trc: 404, cases: [CODES[1]], wantCase: {[CODES[1]]: ['? 종목 파일을 못 받았어요. 잠시 뒤 다시 열어 주세요.']}});
  const K6 = clone(TRC); delete K6.cases[CODES[2]];
  await variant('종목 파일에 없는 번호', {trc: K6, cases: [CODES[2]], wantCase: {[CODES[2]]: ['이 종목은 지금 달력에서 지켜보는 곳이 아니에요.']}});
}

lap('② 끝');
/* ③ 세 폭 — 새 쪽만(넘침 · 화면 밖 조각 · 44px · 17px) */
const LAYOUT = () => {
  const vw = document.documentElement.clientWidth, R = document.querySelector('main#view'), out = {sw: document.documentElement.scrollWidth, vw, bad: [], small: [], tiny: []};
  for (const b of [...R.querySelectorAll('button')]) if (/^더 보기 \d+개$/.test(b.textContent.trim())) b.click();
  for (const d of R.querySelectorAll('details')) d.open = true;
  const desc = e => (e.className?.baseVal ?? e.className ?? e.tagName) + ' 「' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + '」';
  for (const e of R.querySelectorAll('*')) {
    if (e.closest('.pcal-sr')) continue;
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5 || r.left < -0.5) out.bad.push(desc(e) + ` ${Math.round(r.left)}~${Math.round(r.right)}`);
    if (e.matches('a, button, summary') && (r.height < 43.5 || r.width < 43.5)) out.small.push(desc(e) + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
    if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 16.95) out.tiny.push(desc(e) + ' ' + f + 'px'); }
  }
  for (const s of R.querySelectorAll('.pcal-lc > svg')) { const W = +s.getAttribute('width'), cw = s.parentElement.clientWidth; if (Math.abs(W - Math.max(260, cw)) > 1) out.bad.push(`그림 넓이 ${W} ≠ 칸 ${cw}`); } // 붙은 뒤 제 넓이로 다시 그렸나(ResizeObserver)
  for (const k of ['bad', 'small', 'tiny']) out[k] = out[k].slice(0, 6);
  return out;
};
{
  const wl = casePick(WIDE);
  for (const w of [320, 360, 390]) {
    const ctx = await browser.newContext({viewport: {width: w, height: 760}, deviceScaleFactor: 1, hasTouch: true}); await pin(ctx);
    const p = await open(ctx, 'new', '#/cal');
    for (const hsh of ['#/cal', ...wl.map(c => '#/cal/' + c), '#/cal/abc', '#/cal/' + notTracked]) {
      await nav(p, hsh);
      const L = await p.evaluate(LAYOUT);
      if (L.sw > L.vw) fail('가로 넘침', `${w} ${hsh} ${L.sw}>${L.vw}`);
      for (const x of L.bad) fail('화면 밖 조각', `${w} ${hsh} ${x}`);
      for (const x of L.small) fail('누르는 자리 44px 안 됨', `${w} ${hsh} ${x}`);
      for (const x of L.tiny) fail('글 17px 안 됨', `${w} ${hsh} ${x}`);
      bump('세 폭 화면');
    }
    errsOf(p, '③ ' + w);
    await ctx.close();
  }
}

lap('③ 끝');
/* ④ 누르기 */
const SR = 'main#view .pcal-sr';
const textOf = (p, sel) => p.$eval(sel, e => e.textContent).catch(() => null);
const store = (p, k) => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return null; } }, k);
{
  const ctx = await browser.newContext({viewport: {width: 360, height: 800}, deviceScaleFactor: 1}); await pin(ctx);
  const np = await open(ctx, 'new', '#/cal'), op = await open(ctx, 'old', '#/cal');
  // ④-1 칸 고르기 — 칸마다 옛 쪽과 같은 줄 · 줄은 모두 그 칸 · 알림 글
  for (const k of ['1', '2', '3', '4', 'all']) {
    await np.click(`main#view .pcal-chips button[data-f="${k}"]`); await op.click(`#view .cal-chips button[data-f="${k}"]`);
    const O = await grab(op), N = await grab(np);
    compare(`④ 칸 ${k}`, O, N);
    const pressed = await np.$$eval('main#view .pcal-chips button', bs => bs.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.f));
    if (pressed.join() !== k) fail('④ 칸 고르기 눌림', `${k} → ${pressed.join()}`);
    const live = norm(await textOf(np, SR)), wantLive = k === 'all' ? '모든 칸을 보여요.' : `${['', '10%대', '20%대', '30%대', '40% 이상'][+k]}로 뽑힌 곳만 보여요.`;
    if (live !== wantLive) fail('④ 칸 고르기 알림', `${live} ≠ ${wantLive}`);
    if (k !== 'all') { const cs = await np.$$eval('main#view .pcal-list .pcal-day:not(.pcal-stars) a.pcal-row, main#view .pcal-list a.pcal-erow', as => as.map(a => a.getAttribute('href').slice(6))); for (const c of cs) if (CASE.get(c)?.[3] !== k) fail('④ 다른 칸 줄', `${k} ${c}`); bump('칸 고르기 줄', cs.length); }
  }
  // ④-2 관심 — 종목 파일에서 ☆ → 달력 맨 위 「★ 관심 1곳」 · 다시 열어도 · 옛 쪽도(같은 열쇠) · 풀기
  const [cS, cHd] = pickN(2, shown('u'), shown('d'));
  await nav(np, '#/cal/' + cS);
  await np.click('main#view button.pcal-star');
  const sb = await np.$eval('main#view button.pcal-star', b => [b.textContent, b.getAttribute('aria-pressed')]);
  if (sb[0] !== '★ 관심 풀기' || sb[1] !== 'true') fail('④ 관심 단추', sb.join());
  if (norm(await textOf(np, SR)) !== `${CASE.get(cS)[1]} 관심에 넣었어요. 달력 맨 위에 보여요.`) fail('④ 관심 알림', await textOf(np, SR));
  if (!(await store(np, 'atlas:cal-star'))?.includes(cS)) fail('④ 관심 기억', 'atlas:cal-star');
  await clickNav(np, 'main#view a.pcal-back', '‹ 달력');
  const starSec = async (p, sel) => p.$$eval(sel, ss => ss.map(s => [s.querySelector('h2')?.textContent, [...s.querySelectorAll('a')].map(a => a.getAttribute('href') + ' ' + a.innerText.split('\n')[0])]));
  let ss = await starSec(np, 'main#view .pcal-stars');
  if (ss.length !== 1 || ss[0][0] !== '★ 관심 1곳' || ss[0][1].length !== 1 || !ss[0][1][0].startsWith(`#/cal/${cS} ★ ${CASE.get(cS)[1]}`)) fail('④ 관심 맨 위', JSON.stringify(ss));
  const starred = await np.$$eval(`main#view a.pcal-row[href="#/cal/${cS}"]`, as => as.map(a => a.innerText.startsWith('★ ')));
  if (!starred.length || starred.some(x => !x)) fail('④ 관심 별표', JSON.stringify(starred));
  await np.reload(); await settle(np, '다시 열기');
  ss = await starSec(np, 'main#view .pcal-stars');
  if (ss.length !== 1 || ss[0][0] !== '★ 관심 1곳') fail('④ 관심 다시 열어도', JSON.stringify(ss));
  await op.reload(); await settle(op, '옛 쪽 다시 열기');
  const os = await starSec(op, '#view .cal-stars');
  if (os.length !== 1 || os[0][0] !== '★ 관심 1곳' || !os[0][1][0]?.startsWith(`#/cal/${cS} ★ `)) fail('④ 옛 쪽도 같은 관심', JSON.stringify(os));
  compare('④ 관심 · #/cal', await grab(op), await grab(np));
  // ④-3 관심 없음 — 숨김 · 숨긴 곳 칸 · 옛 쪽도 · 되돌리기
  await nav(np, '#/cal/' + cHd);
  await np.click('main#view button.pcal-hide');
  const hb = await np.$eval('main#view button.pcal-hide', b => [b.textContent, b.getAttribute('aria-pressed')]);
  if (hb[0] !== '숨김 풀기' || hb[1] !== 'true') fail('④ 관심 없음 단추', hb.join());
  if (norm(await textOf(np, SR)) !== `${CASE.get(cHd)[1]} 달력에서 숨겼어요. 따라가기는 그대로예요.`) fail('④ 관심 없음 알림', await textOf(np, SR));
  if (!(await store(np, 'atlas:surge-hide'))?.includes(cHd)) fail('④ 관심 없음 기억', 'atlas:surge-hide');
  await clickNav(np, 'main#view a.pcal-back', '‹ 달력');
  const rowsOf = (p, c) => p.$$eval(`a.pcal-row[href="#/cal/${c}"], a.pcal-erow[href="#/cal/${c}"], a.cal-row[href="#/cal/${c}"], a.cal-erow[href="#/cal/${c}"]`, as => as.length);
  if (await rowsOf(np, cHd)) fail('④ 숨긴 곳이 목록에 남음', cHd);
  if (norm(await textOf(np, 'main#view details.pcal-gone > summary')) !== '숨긴 곳 1곳 보기') fail('④ 숨긴 곳 칸', await textOf(np, 'main#view details.pcal-gone > summary'));
  await op.reload(); await settle(op, '옛 쪽 다시 열기');
  if (norm(await textOf(op, '#view details.cal-gone > summary')) !== '숨긴 곳 1곳 보기') fail('④ 옛 쪽도 같은 숨김', await textOf(op, '#view details.cal-gone > summary'));
  compare('④ 숨김 · #/cal', await grab(op), await grab(np));
  await np.click(`main#view button.pcal-show[data-c="${cHd}"]`);
  if (norm(await textOf(np, SR)) !== `${CASE.get(cHd)[1]} 다시 보여요.`) fail('④ 되돌리기 알림', await textOf(np, SR));
  if (!(await rowsOf(np, cHd))) fail('④ 되돌린 곳이 안 돌아옴', cHd);
  if (await np.$('main#view details.pcal-gone')) fail('④ 숨긴 곳 칸이 남음', '');
  if ((await store(np, 'atlas:surge-hide'))?.includes(cHd)) fail('④ 되돌리기 기억', 'atlas:surge-hide');
  // ④-4 관심 풀기
  await nav(np, '#/cal/' + cS); await np.click('main#view button.pcal-star');
  if ((await textOf(np, 'main#view button.pcal-star')) !== '☆ 관심' || (await store(np, 'atlas:cal-star'))?.length) fail('④ 관심 풀기', await textOf(np, 'main#view button.pcal-star'));
  if (norm(await textOf(np, SR)) !== `${CASE.get(cS)[1]} 관심에서 뺐어요.`) fail('④ 관심 풀기 알림', await textOf(np, SR));
  // ④-5 종목 파일에서 돌아오면 칸 · 펼친 칸 그대로 · 다른 곳에서 오면 처음 꼴
  await nav(np, '#/me'); await nav(np, '#/cal');
  let fk = null, dk = null; // 접은 칸이 있는 칸 하나(30% 먼저)
  for (const k of ['3', '2', '1', '4']) { await np.click(`main#view .pcal-chips button[data-f="${k}"]`); dk = await np.$eval('main#view .pcal-list details[data-k]', d => { d.open = true; return d.dataset.k; }).catch(() => null); if (dk) { fk = k; break; } }
  if (!dk) fail('④ 펼칠 칸 없음', '네 칸 모두');
  await clickNav(np, 'main#view .pcal-list a.pcal-row', '줄 누름');
  if (!/^#\/cal\/[0-9A-Z]{6}$/.test(await np.evaluate(() => location.hash))) fail('④ 줄 누름', await np.evaluate(() => location.hash));
  await back(np);
  const st = async () => np.evaluate(() => ({f: [...document.querySelectorAll('main#view .pcal-chips button[aria-pressed="true"]')].map(b => b.dataset.f).join(), open: [...document.querySelectorAll('main#view details[data-k]')].filter(d => d.open).map(d => d.dataset.k)}));
  let s1 = await st();
  if (s1.f !== fk || s1.open.join() !== dk) fail('④ 돌아오면 그대로', JSON.stringify(s1) + ` 바람 ${fk} · ${dk}`);
  await nav(np, '#/me'); await nav(np, '#/cal');
  s1 = await st();
  if (s1.f !== 'all' || s1.open.length) fail('④ 다른 곳에서 오면 처음 꼴', JSON.stringify(s1));
  // ④-6 지나온 일 「더 보기」
  const many = [...CODES].sort((a, b) => (K0[b]?.ev?.length || 0) - (K0[a]?.ev?.length || 0))[0];
  await nav(np, '#/cal/' + many);
  const total = 1 + K0[many].ev.length + (CASE.get(many)[6] !== 'n' ? 1 : 0);
  if ((await np.$$('main#view ol.pcal-steps li')).length !== Math.min(4, total)) fail('④ 지나온 일 넷', many);
  await np.click('main#view button.pcal-more-steps');
  if ((await np.$$('main#view ol.pcal-steps li')).length !== total || await np.$('main#view button.pcal-more-steps')) fail('④ 지나온 일 더 보기', `${many} ${total}`);
  // ④-7 창 넓이가 바뀌면(폰 돌림) 그림을 제 넓이로 다시 그림 — 옛 쪽 resize → chartDraw 와 같음
  for (const w of [390, 320]) {
    await np.setViewportSize({width: w, height: 800});
    await np.waitForFunction(() => [...document.querySelectorAll('main#view .pcal-lc > svg')].every(s => Math.abs(+s.getAttribute('width') - Math.max(260, s.parentElement.clientWidth)) <= 1), null, {timeout: 5000})
      .catch(() => fail('④ 넓이 바뀜 다시 그림', w));
  }
  errsOf(np, '④ 누르기'); errsOf(op, '④ 누르기');
  await ctx.close();
}
lap('④ 끝');
// ④-8 기억 못 하는 기계(사생활 창 등) — 이 창 동안만 기억 · 알림에 그 말
{
  const ctx = await browser.newContext({viewport: {width: 360, height: 800}, deviceScaleFactor: 1}); await pin(ctx);
  await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  const c = pickN(1, shown('u'))[0], np = await open(ctx, 'new', '#/cal/' + c);
  await np.click('main#view button.pcal-star');
  if (!norm(await textOf(np, SR)).endsWith('이 기계는 기억을 못 해 다시 열면 돌아와요.')) fail('④ 기억 못 하는 기계 알림', await textOf(np, SR));
  await clickNav(np, 'main#view a.pcal-back', '‹ 달력');
  if (norm(await textOf(np, 'main#view .pcal-stars h2')) !== '★ 관심 1곳') fail('④ 기억 못 하는 기계 — 이 창 동안', await textOf(np, 'main#view .pcal-stars h2'));
  errsOf(np, '④ 기억 못 하는 기계');
  await ctx.close();
}
lap('④-8 끝');
await browser.close();

const ok = !counts.fail;
const res = {ok, base, limit: LIMIT || 'all', wide: WIDE || 'all', took_s: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true}); await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(res, null, 1)); }
console.log(JSON.stringify({ok, took_s: res.took_s, limit: res.limit, wide: res.wide, time: res.time, net: res.net, counts}, null, 0));
for (const [k, x] of fails.slice(0, 60)) console.log('✗', k, '—', x);
process.exit(ok ? 0 : 1);

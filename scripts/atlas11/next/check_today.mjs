// 오늘 시장(#/today) 검사 — 옛 첫 화면(/atlas/#/ 먹빛 칸 여섯: 시장 · 오른 곳과 내린 곳 · 사고팔기 · 미국 · 고른 곳 · 큰 갈래)과
//   새 쪽(/next/?dev=1#/today · p-today.js render(''))을 같은 자료로 열어 맞대고, 사장님 2026-10-18 명령문 [6] 4 · 8 · [10] 1 · 5 ~ 10 을 재는 검사(일꾼 S2t)
//   2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게」 → 2026-10-18 00:15 명령문 [6] 4 「오늘 시장 칸은 첫 화면에서 세 줄 요약으로 줄이고 자세히는 #/today로」
//   쓰는 법: node scripts/atlas11/next/check_today.mjs --base http://127.0.0.1:8826 [--all | --limit N | --variants 0,13,20] [--no-compare] [--no-wide] [--pw /opt/node-tools/] [--out 결과.json] [--path /next/?dev=1] [--dump 뽑은글.json(판마다 첫 짝)]
//     기본 = 모든 자료 판 + 세 폭 · --limit N = 앞 자료 판 N개만 · --variants = 고른 판 번호만(고치는 동안) · --no-compare = 옛 쪽을 안 열고 새 쪽만(맞대기 ① 건너뜀) · --no-wide = 세 폭 건너뜀(고치는 동안만)
//   ① 자료 판 여럿 — home.json(필요하면 core.json · lines.json)을 page.route 로 바꿔치기해 옛 쪽 · 새 쪽에 같은 값을 줌(지금 사본 · 제때 · 장 중 · 받은 때 다른 조각 · 없는 조각 · 큰 날 「!」 · 모두 내린 큰 업종 · home.json 못 받음 …)
//      판마다 지수 둘 × 기간 셋 = 여섯 짝을 두 쪽에서 눌러 칸마다 글을 뽑아 맞댐 — 글 조각이 옛 · 새 같은 모음인지(빠짐 0 · 더함 0) · 머리 때 · 금빛 「?」 · 단추 · 지수 값 · 하루 · 기간 % 와 색 ·
//      그림 이름 · 눈금 · 선을 누른 날 값 · 오른 곳 막대 · 강한 · 약한 업종 줄(고리) · 사고팔기 · 미국 · 고른 곳 줄(고리) · 큰 업종(고리) · 봉인 줄 · 칸 차례 · 쓰지 않을 말 0
//      [10] 1 말 바꿈은 옛 글에 같은 말 바꿈표(WORDS)만 대어 맞댐(갈래 → 큰 업종 · 20거래일 → 한 달 · 멍거 갈래 → 멍거 조건) — 표 밖 글이 다르면 실패 · 새 글에 옛 낱말(갈래 · 몸값 · 20거래일 · 한 회사 한 표 · 큰 회사는 크게 · 다섯 문 · 쉬는 돈)이 있으면 실패
//      [6] 8 큰 숫자 = 고른 지수의 마지막 날 하루 바뀜 %: 쪽이 읽은 파일(home.json)에서 따로 셈(종가 줄 마지막 ÷ 그 앞 − 1 · 소수 둘째 자리 · 자료의 day 칸과도 맞대) · 선을 눌러 끌어도(처음 · 1/3 · 2/3 · 끝 · 놓음) 그대로 · 작은 지수 값 · 날은 옛 쪽 큰 숫자 · 날과 같음
//      금빛 경고 — 두 줄 안이면 그대로 · 넘으면 「? 조심할 것」 한 줄로 접히고(누르면 펼침) 펼친 글은 옛 글과 같음([10] 10)
//   ② 기억 열쇠 atlas:m4idx · atlas:m4per — 옛 쪽에서 고른 것이 새 쪽에 이어짐 · 새 쪽에서 고른 것이 옛 글 꼴('1' · '21')로 남아 옛 쪽에 이어짐 · 틀린 값은 처음 값
//   ③ 세 폭(320 · 360 · 390 + 320 아주 큰 글씨) — 새 쪽: 가로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 그림 넓이 = 칸 넓이 · 눈금 글 칸 안 ·
//      [10] 5 17px 아래 글 0 · [10] 6 글씨 가짓수 ≤ 6(모두 --fs 토큰 값 17 · 19 · 21 · 24 · 30 · 48) · [10] 7 글 시작 왼쪽 줄 ≤ 3(닫힌 채 · 접은 칸을 모두 연 채) · [10] 8 음수 간격 0 · 안 여백 · 칸 사이 8 · 16 · 24 ·
//      [10] 9 같은 줄(강한 · 약한 업종 · 사고팔기 · 고른 곳 · 큰 업종 · 숫자 칸) 높이 차 < 1px · [10] 10 금빛 경고 두 줄 안(길면 접힘 · 누르면 펼침) · [6] 8 선이 그려지는 동안 큰 숫자 세 번 읽기 + 프레임마다 기록(안 바뀜 · 작은 지수 값은 실제로 움직임)
//   ④ 글 검사(브라우저 없이) — p-today.css 의 font-size 는 var(--fs-n) 뿐 · margin · padding · gap 은 0 · auto · var(--sp-1 ~ 3) 뿐 · p-today.js 글에 옛 낱말 0
//   ⑤ 첫 화면(#/)에 .ptoday · .today-d 0 · #/today 고리 1 이상 · render('home') 은 그릴 것 0([6] 4)
//   ⑥ 새 쪽 화면 오류 0(옛 쪽 오류는 알림으로만)
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep} from './rename.mjs'; // 이름 · 낱말 바꾸기(옛 쪽 글을 새 이름 · 낱말표로 — brand.js · glossary.js 한 곳에서 읽음)
import {fetchJSON, timer, timePage, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', process.env.PW_DIR || '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1');
const LIMIT = has('--all') ? 0 : Number(arg('--limit', '0')) || 0, OUT = arg('--out', null), DUMP = arg('--dump', null); // --dump 파일 = 첫 짝의 뽑은 글(옛 · 새 쪽)
const PICK = arg('--variants', null) ? new Set(String(arg('--variants')).split(',').map(Number)) : null, NOCMP = has('--no-compare');
const fails = [], counts = {}, warn = [], t0 = Date.now(), dumps = [], dumped = new Set(), tm = timer(t0), measure = {};
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 500)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '매수 검토'];
const OLD_WORDS = ['갈래', '몸값', '20거래일', '한 회사 한 표', '큰 회사는 크게', '다섯 문', '쉬는 돈']; // [10] 1 — 내가 쓰는 글에 있으면 안 되는 옛 낱말
const FS_OK = new Set([17, 19, 21, 24, 30, 48]); // app.css :root --fs-1 ~ 6
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = x => JSON.parse(JSON.stringify(x));

/* 자료(시험 서버에서) */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [HOME, CORE, LINES] = await Promise.all([getJ('home.json'), getJ('core.json'), getJ('lines.json')]).catch(e => { console.error('자료를 못 받음', e.message); process.exit(1); });
const IND = new Map(CORE.industries.map(i => [i.name, i]));
const kstDay = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const DAYS = CORE.days;

/* [6] 8 큰 숫자 기댓값 — 쪽 코드를 쓰지 않고 파일에서 따로 셈 */
const fmt2 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%'; // 부호 · 소수 둘째 자리 · 마이너스는 U+2212(쪽 p2 와 같은 꼴)
/** 종가 줄 마지막 ÷ 그 앞 − 1 → 퍼센트 → 소수 둘째 자리(절댓값을 반올림) */
const dayRows = X => { const r = X?.rows; if (!Array.isArray(r) || r.length < 2) return null; const a = r.at(-1)[1], b2 = r.at(-2)[1]; if (!(a > 0 && b2 > 0)) return null; const p = (a / b2 - 1) * 100; return fmt2(Math.sign(p) * Math.floor(Math.abs(p) * 100 + 0.5 + 1e-7) / 100); };
const dayField = X => (X?.day == null || !isFinite(X.day) ? '?' : fmt2(X.day));
/** 큰 숫자 색 — 부호 · 소수 첫째 자리로 반올림해 0 이면 그대로(쪽 cls 와 같은 뜻을 따로 씀) */
const dayCls = X => { const v = Number(X?.day); if (!isFinite(v)) return 'q'; const m = Math.floor(Math.abs(v) * 10 + 0.5 + 1e-7); return m === 0 ? 'fl' : v > 0 ? 'up' : 'dn'; };
const numKo = v => Number(v).toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2});

/* 자료 판 — home(H) · core(C) · lines(L) 를 바꿔 씀 · init = 처음 기억(atlas:m4idx · atlas:m4per) · fail = home.json 을 못 받게 */
const fresh = H => { H.stale = {}; H.errors = []; H.live = false; for (const k of ['KOSPI', 'KOSDAQ']) if (H.idx?.[k]) H.idx[k].live = false; if (H.flows) H.flows.live = false; return H; };
const ALERTS4 = [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.28, why: 'usual', ratio: 2.6}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -5.36, why: 'big', ratio: 3.1}, {kind: 'flow', key: 'KOSPI', name: '코스피', v: -17507}, {kind: 'flow', key: 'KOSDAQ', name: '코스닥', v: 10234}];
const VARIANTS = [
  ['지금 사본 그대로(네 조각 못 받음 · 장 중 값)', H => H],
  ['제때 받은 날(장 마감)', fresh],
  ['장 중에 받은 값(오늘 오전 10:06)', H => { fresh(H); const d = kstDay(); H.kst = d + ' 10:06'; H.live = true; for (const k of ['KOSPI', 'KOSDAQ']) { const x = H.idx[k]; x.live = true; x.date = d; x.rows[x.rows.length - 1][0] = d; } H.flows.live = true; for (const k of ['KOSPI', 'KOSDAQ']) H.flows[k].date = d; H.sectors.date = d; return H; }, {m4idx: '1', m4per: '21'}],
  ['받은 때가 다른 조각(지수 · 사고판 돈 · 미국)', H => { fresh(H); H.stale = {idx: '2026-10-12 14:59', flows: '2026-10-12 14:59', us: '2026-10-13 07:02'}; return H; }],
  ['받은 때 모름(업종 「?」) · 장 밖 값', H => { fresh(H); H.stale = {sectors: true, us: '2026-10-13 07:02'}; H.flows.live = true; return H; }],
  ['사고판 돈 없음', H => { fresh(H); delete H.flows; return H; }],
  ['업종 없음', H => { delete H.sectors; delete H.stale.sectors; return H; }],
  ['오른 곳 수 없음 · 강한 업종만', H => { fresh(H); H.sectors.breadth = null; H.sectors.weak = []; return H; }],
  ['미국 없음(세 지수 밖만)', H => { fresh(H); H.us.rows = H.us.rows.filter(r => !['INX', 'IXIC', 'DJI'].includes(r.key)); return H; }],
  ['미국 둘 · 불안 지수 없음', H => { fresh(H); H.us.rows = H.us.rows.filter(r => ['INX', 'IXIC'].includes(r.key)); return H; }],
  ['코스닥 없음(기억은 코스닥)', H => { fresh(H); delete H.idx.KOSDAQ; delete H.flows.KOSDAQ; return H; }, {m4idx: '1', m4per: '6'}],
  ['지수 없음', H => { delete H.idx; delete H.stale.idx; return H; }],
  ['고른 곳 하루 값 없음', H => { fresh(H); delete H.s365; return H; }],
  ['큰 날 「!」(지수 · 외국인)', H => { fresh(H); H.alerts = clone(ALERTS4); return H; }],
  ['3달 값 모자람(15일)', H => { fresh(H); for (const k of ['KOSPI', 'KOSDAQ']) H.idx[k].rows = H.idx[k].rows.slice(-15); return H; }, {m4idx: '0', m4per: '60'}],
  ['두 지수 날 다름', H => { fresh(H); H.idx.KOSDAQ.rows.splice(10, 1); return H; }],
  ['이상한 날(대부분 그대로 · 미국 모두 내림 · 0억 · ? · 하루 그대로)', H => { fresh(H); H.sectors.breadth = {up: 10, down: 5, flat: 100, n: 115}; for (const r of H.us.rows) r.chg = -Math.abs(r.chg) - 0.01; H.flows.KOSPI.personal = 0.3; H.flows.KOSPI.institutional = null;
    const x = H.idx.KOSPI, n = x.rows.length; x.rows[n - 1][1] = x.rows[n - 2][1]; x.close = x.rows[n - 1][1]; x.day = 0; H.s365.flat = 0; H.s365.none = 3; return H; }],
  ['모두 내린 큰 업종 · 고른 곳 모두 반값 · 고른 기준 이름 없음', H => fresh(H), null, C => { for (const g of C.groups) g.chg = -Math.abs(g.chg) - 0.5; C.facts.dd50 = C.facts.n1y; delete C.rules.name; return C; }],
  ['선 날짜 다름(평소의 몇 배 없음)', H => fresh(H), null, null, L => { L.asOf = '2026-10-12'; return L; }],
  ['home.json 못 받음', null, null, null, null, true],
];
/** 세 폭 검사용 — 때 글 · 금빛 글이 가장 긴 판(장 중 · 못 받은 조각 넷 · 큰 날 「!」 넷) */
const VARIANT_W = ['폭 검사 판(장 중 · 못 받은 조각 · 큰 날 「!」)', H => { fresh(H); const d = kstDay(); H.kst = d + ' 10:06'; H.live = true; for (const k of ['KOSPI', 'KOSDAQ']) { const x = H.idx[k]; x.live = true; x.date = d; x.rows[x.rows.length - 1][0] = d; } H.flows.live = true; for (const k of ['KOSPI', 'KOSDAQ']) H.flows[k].date = d; H.sectors.date = d;
  H.stale = {idx: '2026-10-12 14:59', sectors: '2026-10-12 14:59', flows: '2026-10-12 14:59', us: '2026-10-13 07:02'}; H.alerts = clone(ALERTS4); return H; }];
const list = PICK ? VARIANTS.filter((_, i) => PICK.has(i)) : LIMIT ? VARIANTS.slice(0, LIMIT) : VARIANTS;

/* 브라우저 — 한 번에 하나 · 다 쓰면 닫음 */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** 프레임마다 기록(큰 숫자가 선이 그려지는 동안 안 바뀌는지) — 쪽 코드보다 먼저 심음 */
const REC_INIT = () => {
  window.__rec = [];
  const tick = () => { const v = document.querySelector('#view .ptoday-v'); if (v) window.__rec.push([Math.round(performance.now()), v.textContent, document.querySelector('#view .ptoday-lv')?.textContent ?? '', document.querySelector('#view .ptoday-ch')?.classList.contains('ptoday-play') ? 1 : 0]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
};
async function page(width, v, {height = 844, init = null, motion = 'reduce', font = 0, rec = false} = {}) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, reducedMotion: motion});
  if (init || font) await ctx.addInitScript(([s, f]) => { try { if (s) { localStorage.setItem('atlas:m4idx', s.m4idx); localStorage.setItem('atlas:m4per', s.m4per); } if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [init, font]);
  if (rec) await ctx.addInitScript(REC_INIT);
  if (v) {
    const [, fh, , fc, fl, bad] = v;
    await ctx.route('**/atlas/data/home.json', r => (bad ? r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}) : r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fh ? fh(clone(HOME)) : HOME)})));
    if (fc) await ctx.route('**/atlas/data/core.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fc(clone(CORE)))}));
    if (fl) await ctx.route('**/atlas/data/lines.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fl(clone(LINES)))}));
  }
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return timePage(p, tm); // 화면 일에 쓴 때 — 옛 쪽(/atlas/) · 새 쪽 몫으로(net.mjs)
}
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const W_OLD = () => !!document.querySelector('#view > .vw .m4-seal-box') && !document.querySelector('#view .boot');
const W_PAGE = () => !!document.querySelector('#view .ptoday-page') && !document.querySelector('#view .boot');
const W_ANY = () => !document.querySelector('#view .boot') && document.querySelectorAll('#view > *').length > 0;
async function open(p, url, ready) { await p.goto(url); await p.waitForFunction(ready, null, {timeout: 30000}); await frames(p); await p.waitForTimeout(60); }
const clickBtn = (p, sel, name) => p.evaluate(([s, n]) => { const x = [...document.querySelectorAll(s)].find(y => y.textContent.trim() === n); if (!x) return 'none'; if (x.disabled) return 'disabled'; x.click(); return x.getAttribute('aria-pressed'); }, [sel, name]);

/* 칸마다 글 뽑기 — 옛 · 새 같은 꼴(클래스 이름만 다름) */
const EXTRACT = ([kind]) => {
  const N = s => String(s ?? '').replace(/⁠/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const T = e => N(e?.textContent);
  const O = kind === 'old', view = document.querySelector('#view');
  const root = O ? view.querySelector(':scope > .vw') : view.querySelector('.ptoday');
  if (!root) return null;
  const S = O ? {sh: '.m4-sh', t: '.m4-t', meta: '.m4-meta', mq: '.m4-mq', lead: '.m4-lead', seg: '.m4-seg button', per: '.m4-per button', v: '.m4-v', vt: '.m4-vt', cg: '.m4-cg > span', ch: '.m4-ch', yl: '.m4-yl span', axl: '.m4-axl span', lgd: '.m4-lgd', one: 'one', pc: '.m4-pc', vh: '.m4-vh', hint: '.m4-hint', al: 'p.m4-al', how: 'details.m4-how', bar: '.m4-bar i', bl: '.m4-bl > span', sr: '.m4-sr', nm: '.nm', top: '.top b', sl: 'p.m4-sl', fr: '.m4-fr', fn: '.fn', fb: '.fb i', us: '.m4-us > div', mv: '.m4-mv', tg: '.tg', more: 'details.m4-more', g: '.m4-g', mr: '.m4-mr', say: '.m4-say', q: 'p.m4-q', lf: '.m4-ch .lf'}
    : {sh: '.ptoday-sh', t: '.ptoday-t', meta: '.ptoday-meta', mq: '.ptoday-mq', lead: '.ptoday-lead', seg: '.ptoday-seg button', per: '.ptoday-per button', v: '.ptoday-lv', vt: '.ptoday-vt', ch: '.ptoday-ch', yl: '.ptoday-yl span', axl: '.ptoday-axl span', lgd: '.ptoday-lgd', one: 'ptoday-one', pc: '.ptoday-pc', vh: '.ptoday-vh', hint: '.ptoday-hint', al: 'details.ptoday-al > .nw-t', how: 'details.ptoday-how', bar: '.ptoday-bar i', bl: '.ptoday-bl > span', sr: '.ptoday-sr', nm: '.ptoday-nm', top: '.ptoday-top b', sl: 'p.ptoday-sl', fr: '.ptoday-fr', fn: '.ptoday-fn', fb: '.ptoday-fb i', us: '.ptoday-us > div', mv: '.ptoday-mv', tg: '.ptoday-tg', more: 'details.ptoday-more', g: '.ptoday-g', mr: '.ptoday-mr', say: '.ptoday-say', q: 'details.nw:not(.ptoday-al) > .nw-t', lf: '.ptoday-ch .ptoday-lf'};
  const C3 = e => { const c = (e?.getAttribute('class') || '').split(/\s+/); return c.includes('up') ? 'up' : c.includes('down') || c.includes('dn') ? 'dn' : c.includes('flat') || c.includes('fl') ? 'fl' : c.includes('q') ? 'q' : ''; };
  const BARK = e => { const c = e.getAttribute('class') || ''; return /\b(u|ptoday-bu)\b/.test(c) ? 'u' : /\b(f|ptoday-bf)\b/.test(c) ? 'f' : /\b(d|ptoday-bd)\b/.test(c) ? 'd' : '?'; };
  const texts = (el, skip) => { const out = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const pe = n.parentElement; if (pe.closest('svg')) continue; if (pe.closest('.kk-btn, .kk-box, .kk-pgw, .kk-pgi')) continue; /* 카톡 보내기 단추(사장님 2026-10-25 「진짜모든곳에」 — 옛 쪽에 없는 단추 글 · 자료 글 아님) */ if (skip && pe.closest(skip)) continue; const t = N(n.textContent); if (t) out.push(t); } return out; };
  const KEYS = ['mk', 'br', 'fl', 'us', 'pk', 'gr'];
  const secOf = k => (O ? root.querySelector(`section.m4-sec[aria-labelledby="m4-h-${k}"]`) : root.querySelector(`section.ptoday-sec[data-k="${k}"]`));
  const out = {order: [], secs: {}, top: [], extra: []};
  if (O) out.order = [...root.querySelectorAll('section.m4-sec[aria-labelledby]')].map(s => s.getAttribute('aria-labelledby').slice(5)).filter(k => KEYS.includes(k));
  else out.order = [...root.querySelectorAll('section.ptoday-sec[data-k]')].map(s => s.dataset.k);
  out.top = O ? [...root.querySelectorAll(':scope > .m4-top p.m4-al')].map(T) : [...root.querySelectorAll(':scope > .ptoday-alerts details.ptoday-al > .nw-t')].map(T);
  // 시장 자료 없음 · 칸을 그리지 못함(그 칸 자리 「?」 한 줄)
  out.noHome = O ? [T(root.querySelector(':scope > h1.m4-h1x')), ...[...root.querySelectorAll(':scope > p.q.m4-q')].map(T)].filter(Boolean)
    : [...root.querySelectorAll(':scope > .ptoday-sh h2'), ...root.querySelectorAll(':scope > .ptoday-card > details.nw > .nw-t')].map(T).filter(Boolean);
  out.broken = O ? [...root.querySelectorAll(':scope > section.m4-sec:not([aria-labelledby]) p.m4-q')].map(T) : [...root.querySelectorAll(':scope > section.ptoday-sec:not([data-k]) details.nw > .nw-t')].map(T);
  for (const k of KEYS) {
    const s = secOf(k); if (!s) continue;
    for (const d of s.querySelectorAll('details:not(.nw)')) d.open = true; // 금빛 경고 접힘(details.nw)은 그대로 둠 — 글은 textContent 로 읽음
    const sh = s.querySelector(S.sh), skip = O ? null : 'summary.nw-s'; // 새 쪽 접힌 금빛 줄의 안내 글(「? 조심할 것 …」)은 글 조각 맞대기 밖
    const r = {title: T(sh?.querySelector(S.t)), meta: T(sh?.querySelector(S.meta)), mq: !!sh?.querySelector(S.mq), texts: texts(s, skip),
      how: [...s.querySelectorAll(S.how + ' summary')].map(x => x.getAttribute('aria-label')), q: [...s.querySelectorAll(S.q)].map(T), al: [...s.querySelectorAll(S.al)].map(T), lead: [...s.querySelectorAll(S.lead)].map(T)};
    if (k === 'mk') {
      r.seg = [...s.querySelectorAll(S.seg)].map(x => [T(x), x.getAttribute('aria-pressed'), x.disabled]);
      r.per = [...s.querySelectorAll(S.per)].map(x => [T(x), x.getAttribute('aria-pressed')]);
      r.v = T(s.querySelector(S.v)); r.vt = T(s.querySelector(S.vt)); // 옛: 큰 숫자(지수 값) · 새: 작은 지수 값
      if (O) r.cg = [...s.querySelectorAll(S.cg)].map(x => [N([...x.childNodes].filter(c => c.nodeType === 3 || c.tagName !== 'B').map(c => c.textContent).join('')), T(x.querySelector('b')), C3(x.querySelector('b'))]);
      else if (s.querySelector('.ptoday-hero')) { const bg = s.querySelector('.ptoday-v'), pb = s.querySelector('.ptoday-pw b'); r.cg = [[T(s.querySelector('.ptoday-hl')), T(bg), C3(bg)], [T(s.querySelector('.ptoday-pn')), T(pb), C3(pb)]]; r.big = T(bg); r.bigCls = C3(bg); }
      else { r.cg = []; r.big = ''; r.bigCls = ''; } // 지수를 못 받은 날 — 옛 쪽도 하루 · 기간 칸이 없음
      r.aria = s.querySelector(S.ch)?.getAttribute('aria-label') ?? null; r.yl = [...s.querySelectorAll(S.yl)].map(T); r.ax = [...s.querySelectorAll(S.axl)].map(T);
      const lg = s.querySelector(S.lgd); r.lgd = lg ? [lg.classList.contains(S.one), [...lg.querySelectorAll('b')].map(T)] : null;
      r.pc = T(s.querySelector(S.pc)); const vh = s.querySelector(S.vh); r.vh = vh ? [T(vh), C3(vh.querySelector('b'))] : null; r.hint = T(s.querySelector(S.hint));
      const lf = s.querySelector(S.lf); r.n = lf ? ((lf.getAttribute('d') || '').match(/[ML]/g) || []).length : 0;
    }
    if (k === 'br') {
      r.bar = [...s.querySelectorAll(S.bar)].map(x => [BARK(x), x.style.width]);
      r.bl = [...s.querySelectorAll(S.bl)].map(x => [N(x.firstChild?.textContent), T(x.querySelector('b')), C3(x.querySelector('b'))]);
      let sl = ''; r.rows = [];
      for (const e of s.querySelectorAll(`${S.sl}, ${S.sr}`)) { if (e.matches(S.sl)) { sl = T(e); continue; } const bb = e.querySelector(S.top); r.rows.push([sl, T(e.querySelector(S.nm)), T(bb), C3(bb), e.getAttribute('href')]); }
    }
    if (k === 'fl') r.rows = [...s.querySelectorAll(S.fr)].map(x => [T(x.querySelector(S.fn)), T(x.querySelector('b')), x.querySelector(S.fb)?.style.width ?? null]);
    if (k === 'us') { r.three = [...s.querySelectorAll(S.us)].map(x => [T(x.querySelector('span')), T(x.querySelector('b')), C3(x.querySelector('b'))]); const vh = s.querySelector(S.vh); r.vix = vh ? [T(vh), C3(vh.querySelector('b'))] : null; }
    if (k === 'pk') {
      r.say = T(s.querySelector(S.say)); r.sl = [...s.querySelectorAll(S.sl)].map(T);
      r.rows = [...s.querySelectorAll(S.mv)].map(x => { const bb = x.querySelector(S.top); return [T(x.querySelector(S.nm)), T(bb), C3(bb), T(x.querySelector(S.tg)), x.getAttribute('href'), !!x.closest(S.more)]; });
      const mo = s.querySelector(S.more + ' > summary'); r.more = mo ? [T(mo), mo.getAttribute('aria-label')] : null;
    }
    if (k === 'gr') { r.g = [...s.querySelectorAll(S.g)].map(x => [T(x.querySelector(S.nm)), T(x.querySelector('b')), C3(x.querySelector('b')), x.getAttribute('href')]); const mr = s.querySelector(S.mr); r.mr = mr ? [T(mr), mr.getAttribute('href')] : null; }
    out.secs[k] = r;
  }
  const cl = root.cloneNode(true); cl.querySelectorAll('[data-proper], [lang="ko"]').forEach(e => e.remove()); out.myText = N(cl.textContent);
  out.hrefs = [...root.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  return out;
};
/** 선 누르기 — 그 쪽 그림의 굵은 선 길에서 k 번째 점 자리를 읽어 누르고 지수 값 · 날(새 쪽은 큰 숫자도)을 읽음(처음 · 1/3 · 2/3 · 끝 · 놓음) */
const SCRUB = ([chSel, lfSel, vSel, vtSel, bigSel]) => {
  const ch = document.querySelector(chSel), lf = document.querySelector(lfSel); if (!ch || !lf) return null;
  const svg = lf.ownerSVGElement, pts = [...(lf.getAttribute('d') || '').matchAll(/[ML]\s*([-\d.]+)\s+([-\d.]+)/g)].map(m => +m[1]), n = pts.length; if (n < 2) return null;
  const r = svg.getBoundingClientRect(), z = r.width / svg.viewBox.baseVal.width, cr = ch.getBoundingClientRect(), out = [], rd = k => [k, document.querySelector(vSel)?.textContent ?? '', (document.querySelector(vtSel)?.textContent ?? '').replace(/ /g, ' '), bigSel ? document.querySelector(bigSel)?.textContent ?? '' : null];
  for (const k of [...new Set([0, Math.floor((n - 1) / 3), Math.floor(2 * (n - 1) / 3), n - 1])]) {
    ch.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + pts[k] * z, clientY: cr.top + cr.height / 2, bubbles: true, pointerType: 'mouse'}));
    out.push(rd(k));
  }
  ch.dispatchEvent(new PointerEvent('pointerleave', {bubbles: false, pointerType: 'mouse'}));
  out.push(rd('놓음'));
  return out;
};
const SCRUB_OLD = ['#view > .vw .m4-ch', '#view > .vw .m4-ch .lf', '#view > .vw .m4-v', '#view > .vw .m4-vt', null], SCRUB_NEW = ['#view .ptoday .ptoday-ch', '#view .ptoday .ptoday-ch .ptoday-lf', '#view .ptoday .ptoday-lv', '#view .ptoday .ptoday-vt', '#view .ptoday .ptoday-v'];

/** 금빛 경고(warn.js details.nw) — 닫힌 채 줄 수 · 접힘 · 안내 줄 */
const GOLD = () => {
  const lineCount = el => { if (!el?.isConnected) return 0; const r = document.createRange(); r.selectNodeContents(el); const tops = []; for (const q of r.getClientRects()) { if (q.width < 1 || q.height < 1) continue; if (!tops.some(t => Math.abs(t - q.top) <= 2)) tops.push(q.top); } return tops.length; };
  return [...document.querySelectorAll('#view .ptoday details.nw')].map(d => { const p = d.querySelector('.nw-t'), s = d.querySelector('summary'), long = d.classList.contains('long'), vis = !!p && p.getClientRects().length > 0;
    return {long, open: d.open, box: d.classList.contains('ptoday-al'), lines: vis ? lineCount(p) : 0, text: p?.textContent ?? '', sum: s && s.getClientRects().length ? [s.textContent.trim(), Math.round(s.getBoundingClientRect().height), lineCount(s)] : null}; });
};
/** 접힌 금빛 줄을 눌러 펼침 — 펼친 글 줄 수 · 글 */
const EXPAND = () => {
  const lineCount = el => { const r = document.createRange(); r.selectNodeContents(el); const tops = []; for (const q of r.getClientRects()) { if (q.width < 1 || q.height < 1) continue; if (!tops.some(t => Math.abs(t - q.top) <= 2)) tops.push(q.top); } return tops.length; };
  const out = [];
  for (const d of document.querySelectorAll('#view .ptoday details.nw.long')) { const p = d.querySelector('.nw-t'), s = d.querySelector('summary'); s.click(); out.push({open: d.open, vis: p.getClientRects().length > 0, lines: lineCount(p), text: p.textContent}); s.click(); out[out.length - 1].closedAgain = !d.open; }
  return out;
};

/* 맞대기 — 옛 쪽 = 기준 */
/** [10] 1 말 바꿈표 — 옛 글에만 대어 새 말로(이 표 밖 글이 다르면 맞대기 실패) */
const WORDS = [
  [/큰 갈래 (\d+)개/g, '큰 업종 $1개'],
  [new RegExp(`부터 ${DAYS}거래일 동안`, 'g'), '부터 한 달 동안'],
  [/(가장 덜 내린|가장 많이 오른) 갈래는/g, '$1 큰 업종은'],
  [/(?:갈래를|큰 업종을) 누르면 업종, 회사 차례로/g, '큰 업종을 누르면 그 안의 업종, 회사 차례로'], // 낱말표(glossary.js)가 옛 글을 먼저 「큰 업종을 누르면 업종 …」 로 바꿔 줌 — 새 쪽은 읽기 쉽게 「그 안의」를 더함
  [new RegExp(`그 앞 ${DAYS}거래일 동안`, 'g'), '그 앞 한 달 동안'],
  [new RegExp(`그 회사가 앞 ${DAYS - 1}거래일 동안`, 'g'), '그 회사가 앞 한 달 동안'],
  [/멍거 갈래는/g, '멍거 조건은'], [/린치 갈래는/g, '린치 조건은'],
  [new RegExp(`^${DAYS}거래일$`), '한 달'], // 큰 업종 칸 머리 때
];
const wordsStr = s => WORDS.reduce((t, [a, c]) => t.replace(a, c), s);
const wordsDeep = x => (typeof x === 'string' ? wordsStr(x) : Array.isArray(x) ? x.map(wordsDeep) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, wordsDeep(v)])) : x);
const mapOldHref = h => (h == null ? null : /^#\/c\/([0-9A-Z]{6})$/.test(h) ? '#/w/' + h.slice(4) : /^#\/g\//.test(h) ? '#/ch/g/' + h.slice(4) : /^#\/i\//.test(h) ? '#/ch/i/' + h.slice(4) : h);
const clsSame = (a, b2, t) => a === b2 || (t === '?' && a === 'fl' && b2 === 'q'); // 모름(?)은 새 쪽 금빛
/** 오른 곳과 내린 곳 줄 고리 — 네이버 업종 이름 → core.secInd → 업종(옛: 업종 화면 · 1곳뿐이면 그 회사 / 새: 업종 채널) */
const secInd = (C, name) => { const n = C.secInd?.[String(name).replace(/\s+/g, '')]; return n ? IND.get(n) ?? null : null; };
function compare(at, o, n, C) {
  if (!o) { fail('옛 쪽 못 읽음', at); return; }
  if (!n) { fail('새 쪽 못 읽음', at); return; }
  const same = (k, a, c) => { bump('맞댄 칸'); if (!eq(a, c)) fail(k, at + ' — 옛 ' + JSON.stringify(a).slice(0, 220) + ' · 새 ' + JSON.stringify(c).slice(0, 220)); };
  same('칸 차례', o.order, n.order);
  same('시장 자료 없음 줄', o.noHome, n.noHome);
  same('그리지 못한 칸', o.broken, n.broken);
  same('큰 날 「!」(맨 위)', o.top, n.top);
  for (const k of o.order) {
    const a = o.secs[k], z = n.secs[k], w = at + ' [' + k + ']';
    if (!z) { fail('칸 없음', w); continue; }
    same('칸 머리 ' + k, [a.title, a.meta, a.mq], [z.title, z.meta, z.mq]);
    // 글 조각 — 빠짐 0 · 더함 0
    const zs = new Set(z.texts), as = new Set(a.texts);
    const miss = a.texts.filter(t => !zs.has(t)), more = z.texts.filter(t => !as.has(t));
    bump('글 조각', a.texts.length);
    if (miss.length) fail('옛 글 빠짐 ' + k, w + ' ' + miss.slice(0, 6).join(' | '));
    if (more.length) fail('옛 쪽에 없는 글 ' + k, w + ' ' + more.slice(0, 6).join(' | '));
    same('어떻게 셌나요 ' + k, a.how, z.how); same('「?」 줄 ' + k, a.q, z.q); same('금빛 「!」 ' + k, a.al, z.al);
    if (k === 'mk') {
      same('오늘 한 줄(시장)', a.lead, z.lead);
      for (const key of ['seg', 'per', 'v', 'vt', 'aria', 'yl', 'ax', 'lgd', 'pc', 'vh', 'hint', 'n']) same('시장 ' + key, a[key], z[key]);
      same('시장 하루 · 기간', a.cg.map(x => [x[0], x[1]]), z.cg.map(x => [x[0], x[1]]));
      a.cg.forEach((x, i) => { if (!z.cg[i] || !clsSame(x[2], z.cg[i][2], x[1])) fail('시장 색', w + ' ' + JSON.stringify([x, z.cg[i]])); });
    }
    if (k === 'br') {
      same('오른 곳 막대', a.bar, z.bar);
      same('오른 곳 수', a.bl, z.bl);
      same('강한 · 약한 업종 줄(글)', a.rows.map(r => r.slice(0, 4)), z.rows.map(r => r.slice(0, 4)));
      a.rows.forEach((r, i) => {
        const I = secInd(C, r[1]), oldExp = I ? (I.n === 1 ? '#/c/' + I.members[0] : '#/i/' + encodeURIComponent(I.name)) : null, newExp = I ? '#/ch/i/' + encodeURIComponent(I.name) : null;
        if (r[4] !== oldExp) fail('옛 업종 고리가 예상과 다름(검사를 고칠 것)', w + ' ' + r[1] + ' ' + r[4] + ' ≠ ' + oldExp);
        if (z.rows[i]?.[4] !== newExp) fail('업종 고리', w + ' ' + r[1] + ' ' + z.rows[i]?.[4] + ' ≠ ' + newExp);
      });
    }
    if (k === 'fl') same('사고팔기 줄', a.rows, z.rows);
    if (k === 'us') { same('미국 세 지수', a.three.map(x => x.slice(0, 2)), z.three.map(x => x.slice(0, 2))); same('미국 불안 지수', a.vix?.[0] ?? null, z.vix?.[0] ?? null);
      a.three.forEach((x, i) => { if (!clsSame(x[2], z.three[i]?.[2], x[1])) fail('미국 색', w + ' ' + x[0]); }); if (a.vix && !clsSame(a.vix[1], z.vix?.[1], '')) fail('불안 지수 색', w); }
    if (k === 'pk') {
      same('고른 곳 기준 줄', a.say, z.say); same('고른 곳 묶음 이름', a.sl, z.sl); same('나머지 접은 칸', a.more, z.more);
      same('고른 곳 줄', a.rows.map(r => [r[0], r[1], r[3], mapOldHref(r[4]), r[5]]), z.rows.map(r => [r[0], r[1], r[3], r[4], r[5]]));
      a.rows.forEach((r, i) => { if (!clsSame(r[2], z.rows[i]?.[2], r[1])) fail('고른 곳 색', w + ' ' + r[0]); if (!/^#\/w\/[0-9A-Z]{6}$/.test(z.rows[i]?.[4] ?? '')) fail('고른 곳 고리', w + ' ' + z.rows[i]?.[4]); });
    }
    if (k === 'gr') {
      same('큰 업종', a.g.map(x => [x[0], x[1], mapOldHref(x[3])]), z.g.map(x => [x[0], x[1], x[3]]));
      a.g.forEach((x, i) => { if (!clsSame(x[2], z.g[i]?.[2], x[1])) fail('큰 업종 색', w + ' ' + x[0]); });
      same('봉인 줄', a.mr ? [a.mr[0], a.mr[1]] : null, z.mr ? [z.mr[0], z.mr[1]] : null);
    }
  }
  for (const k of n.order) if (!o.order.includes(k)) fail('옛 쪽에 없는 칸', at + ' ' + k);
}
/** 새 쪽만 — 쓰지 않을 말 · 옛 낱말 · 고리 모양 */
function wordsCheck(at, n) {
  for (const x of BANNED) if (n.myText.includes(x)) fail('쓰지 않을 말', at + ' 「' + x + '」');
  for (const x of OLD_WORDS) { bump('옛 낱말 셈'); if (n.myText.includes(x)) fail('옛 낱말 남음([10] 1)', at + ' 「' + x + '」'); }
  for (const h of n.hrefs) { bump('고리'); if (!/^#\/(w\/[0-9A-Z]{6}|ch\/[ig]\/[^/]+|time|f\/rise)$/.test(h) && h !== '/atlas/#/time') fail('모르는 고리', at + ' ' + h); }
}
/** [6] 8 큰 숫자 = 고른 지수의 마지막 날 하루 바뀜 % — 파일에서 따로 셈 */
function heroCheck(at, n, VH) {
  const mk = n?.secs?.mk; if (!mk?.seg) return;
  if (!mk.seg.length) { bump('큰 숫자 없음(지수 못 받음)'); if (mk.big || mk.v) fail('큰 숫자 — 지수를 못 받았는데 숫자가 있음', at + ' 「' + mk.big + '」「' + mk.v + '」'); return; } // 지수 그림이 없으면 큰 숫자도 없어야 함
  const pr = mk.seg.find(x => x[1] === 'true'); if (!pr) { fail('큰 숫자 — 눌린 지수 단추 없음', at); return; }
  const X = VH?.idx?.[pr[0] === '코스피' ? 'KOSPI' : 'KOSDAQ'], e1 = dayRows(X), e2 = dayField(X); bump('큰 숫자 맞댐');
  if (e1 == null) { fail('큰 숫자 — 자료에서 셈할 수 없는데 지수 그림이 있음', at + ' ' + pr[0]); return; }
  if (e1 !== e2) fail('자료의 day 칸 ≠ 종가 줄에서 셈한 값(자료 탓)', at + ' ' + e2 + ' ≠ ' + e1);
  if (mk.big !== e1) fail('큰 숫자 ≠ 마지막 날 하루 바뀜', at + ' 쪽 「' + mk.big + '」 ≠ 자료 「' + e1 + '」');
  if (mk.bigCls !== dayCls(X)) fail('큰 숫자 색', at + ' ' + mk.bigCls + ' ≠ ' + dayCls(X));
  if (mk.v === mk.big) fail('큰 숫자와 지수 값이 같은 글', at);
  const lvE = numKo(X.close); if (mk.v !== lvE) fail('작은 지수 값 ≠ 마지막 종가', at + ' ' + mk.v + ' ≠ ' + lvE);
}
const PER = [[6, '1주'], [21, '1달'], [60, '3달']], IDX = ['코스피', '코스닥'];

/* ① 자료 판마다 — 옛 첫 화면 · 새 쪽 */
for (const v of list) {
  const name = v[0], init = v[2] ?? null, C = v[3] ? v[3](clone(CORE)) : CORE, VH = v[5] ? null : v[1] ? v[1](clone(HOME)) : HOME;
  const po = NOCMP ? null : await page(390, v, {init}), pn = await page(390, v, {init});
  try {
    if (po) await open(po, base + '/atlas/#/', W_OLD);
    await open(pn, base + NEXT + '#/today', W_PAGE);
  } catch (e) { fail('열림', name + ' ' + e.message.slice(0, 120)); for (const p of [po, pn]) await p?.context().close(); continue; }
  const run = async (tag) => {
    const nn = await pn.evaluate(EXTRACT, ['new']), at = name + ' · ' + tag;
    const o = po ? wordsDeep(oldToNewDeep(await po.evaluate(EXTRACT, ['old']))) : null; // 옛 쪽 글은 이름 · 말만 새 것으로(rename.mjs · WORDS)
    if (DUMP && !dumped.has(name)) { dumped.add(name); dumps.push({name, tag, old: o, page: nn}); }
    if (o) compare(at, o, nn, C); else if (!nn) fail('새 쪽 못 읽음', at);
    if (nn) { wordsCheck(at, nn); heroCheck(at, nn, VH); }
    if (nn?.secs.mk?.seg?.length) { // 선 누르기 — 작은 지수 값 · 날 = 옛 쪽 큰 숫자 · 날 / 큰 숫자는 처음부터 끝까지 그대로
      const sn = await pn.evaluate(SCRUB, SCRUB_NEW), so = po ? await po.evaluate(SCRUB, SCRUB_OLD) : null;
      bump('선 누르기'); if (!sn) fail('선 누르기 못 함', at);
      else {
        if (so && !eq(so.map(x => x.slice(0, 3)), sn.map(x => x.slice(0, 3)))) fail('선을 누른 날 값', at + ' 옛 ' + JSON.stringify(so).slice(0, 200) + ' · 새 ' + JSON.stringify(sn).slice(0, 200));
        for (const x of sn) { bump('선 누른 큰 숫자'); if (x[3] !== nn.secs.mk.big) fail('선을 누르면 큰 숫자가 바뀜', at + ' ' + JSON.stringify(x) + ' · 큰 숫자 ' + nn.secs.mk.big); }
      }
    }
    bump('짝');
  };
  const mkOn = po ? await po.evaluate(() => !!document.querySelector('#view > .vw .m4-seg')) : await pn.evaluate(() => !!document.querySelector('#view .ptoday-seg'));
  if (!mkOn) await run('지수 그림 없음');
  else {
    await run('처음(기억 ' + (init ? init.m4idx + '/' + init.m4per : '없음') + ')');
    // 금빛 경고 — 두 줄 안이면 그대로 · 넘으면 접힘(누르면 펼침)
    await frames(pn); const G = await pn.evaluate(GOLD); let folded = 0;
    for (const g of G) { bump('금빛 줄'); if (!g.long && g.lines > 2) fail('금빛 경고가 두 줄을 넘는데 접히지 않음([10] 10)', name + ' ' + g.lines + '줄 「' + g.text.slice(0, 30) + '」');
      if (g.long) { folded++; bump('금빛 접힘'); if (g.open) fail('접힘이 열려 있음', name + ' 「' + g.text.slice(0, 30) + '」'); if (!g.sum || g.sum[2] !== 1 || !g.sum[0].startsWith('?')) fail('접힌 줄이 「?」 한 줄이 아님', name + ' ' + JSON.stringify(g.sum)); } }
    if (folded) for (const x of await pn.evaluate(EXPAND)) { bump('금빛 펼침'); if (!x.open || !x.vis || x.lines < 3) fail('접힌 줄을 누르면 펼쳐져야 함', name + ' ' + JSON.stringify(x).slice(0, 160)); if (!x.closedAgain) fail('접힌 줄을 다시 누르면 접혀야 함', name); }
    for (const [k, nm] of IDX.entries()) {
      const r = await Promise.all([po ? clickBtn(po, '#view .m4-seg button', nm) : null, clickBtn(pn, '#view .ptoday-seg button', nm)].filter(Boolean));
      if (new Set(r).size !== 1) { fail('지수 단추', name + ' ' + nm + ' ' + r.join(' · ')); continue; }
      if (r[0] === 'disabled') continue;
      for (const [, pnm] of PER) {
        const q = await Promise.all([po ? clickBtn(po, '#view .m4-per button', pnm) : null, clickBtn(pn, '#view .ptoday-per button', pnm)].filter(Boolean));
        if (q.some(x => x !== 'true')) { fail('기간 단추', name + ' ' + nm + ' ' + pnm + ' ' + q.join(' · ')); continue; }
        await Promise.all([po ? frames(po) : null, frames(pn)].filter(Boolean));
        await run(nm + ' · ' + pnm);
        void k;
      }
    }
  }
  const okErr = e => v[5] && /Failed to load resource/.test(e); // home.json 을 일부러 못 받게 한 판의 404
  { const es = pn._errs.filter(e => !okErr(e)); if (es.length) fail('화면 오류', name + ' 새 쪽 ' + es.join(' | ').slice(0, 300)); }
  if (po) { const es = po._errs.filter(e => !okErr(e)); if (es.length) warn.push('옛 쪽 화면 오류 ' + name + ' ' + es.join(' | ').slice(0, 200)); }
  for (const p of [po, pn]) await p?.context().close();
  bump('자료 판');
  console.log(`… ${counts['자료 판']}/${list.length} ${name} · 실패 ${counts.fail || 0} · ${Math.round((Date.now() - t0) / 1000)}초`);
}

/* ② 기억 열쇠 — 옛 쪽 ↔ 새 쪽(같은 사이트 · 같은 기억) */
if (!NOCMP) {
  const pressed = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.textContent.trim()), sel);
  const store = p => p.evaluate(() => [localStorage.getItem('atlas:m4idx'), localStorage.getItem('atlas:m4per')]);
  // 옛 쪽에서 코스닥 · 1주 → 새 쪽
  const p = await page(390, null);
  await open(p, base + '/atlas/#/', W_OLD);
  await clickBtn(p, '#view .m4-seg button', '코스닥'); await clickBtn(p, '#view .m4-per button', '1주');
  const s0 = await store(p); if (!eq(s0, ['1', '6'])) fail('옛 쪽 기억(검사를 고칠 것)', JSON.stringify(s0));
  await open(p, base + NEXT + '#/today', W_PAGE);
  const a2 = [await pressed(p, '#view .ptoday-seg button'), await pressed(p, '#view .ptoday-per button')]; bump('기억');
  if (!eq(a2, [['코스닥'], ['1주']])) fail('기억 — 옛 쪽에서 고른 것이 새 쪽에', JSON.stringify(a2));
  // 새 쪽에서 코스피 · 1달 → 옛 글 꼴 그대로 → 옛 쪽
  await clickBtn(p, '#view .ptoday-seg button', '코스피'); await clickBtn(p, '#view .ptoday-per button', '1달');
  const s1 = await store(p); bump('기억'); if (!eq(s1, ['0', '21'])) fail('기억 — 새 쪽이 남긴 값(옛 글 꼴 \'0\' · \'21\')', JSON.stringify(s1));
  // 고른 지수를 사고팔기가 따라감(새 쪽)
  const fl = await p.evaluate(() => document.querySelector('#view .ptoday-sec[data-k="fl"] .ptoday-meta')?.textContent ?? ''); bump('기억'); if (!fl.replace(/^\?\s*/, '').startsWith('코스피')) fail('사고팔기가 고른 지수를 안 따라감', fl);
  await open(p, base + '/atlas/#/', W_OLD);
  const a3 = [await pressed(p, '#view .m4-seg button'), await pressed(p, '#view .m4-per button')]; bump('기억');
  if (!eq(a3, [['코스피'], ['1달']])) fail('기억 — 새 쪽에서 고른 것이 옛 쪽에', JSON.stringify(a3));
  await p.context().close();
}
{
  // 틀린 값 → 처음 값(코스피 · 3달)
  const pressed = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.textContent.trim()), sel);
  const q = await page(390, null, {init: {m4idx: '7', m4per: '5'}});
  await open(q, base + NEXT + '#/today', W_PAGE);
  const a4 = [await pressed(q, '#view .ptoday-seg button'), await pressed(q, '#view .ptoday-per button')]; bump('기억');
  if (!eq(a4, [['코스피'], ['3달']])) fail('기억 — 틀린 값은 처음 값', JSON.stringify(a4));
  if (q._errs.length) fail('화면 오류', '기억 ' + q._errs.join(' | ').slice(0, 200));
  await q.context().close();
}

/* ③ 세 폭 + 아주 큰 글씨 — 새 쪽(움직임 그대로 — 그림이 다 그려진 뒤 잼) */
/** 한 번 재기([열기]) — 열기 = 접은 칸을 모두 연 채 · 끝에 원래대로 되돌림 · 재는 자는 scripts/atlas11/next/measure.mjs 와 같음(보이는 글 마디 · 글씨 가짓수 0.5px · 왼쪽 줄 · 17px 아래) */
const LAYOUT = ([openAll]) => {
  const vw = document.documentElement.clientWidth, view = document.querySelector('#view'), v = view?.querySelector('.ptoday'); if (!v) return {err: '칸 없음'};
  const dets = [...v.querySelectorAll('details')], was = dets.map(d => d.open); if (openAll) for (const d of dets) d.open = true;
  const out = {sw: document.documentElement.scrollWidth, vw, px: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), out: [], small: [], ch: [], yl: [], neg: [], pad: [], gap: [], heights: [], lists: 0};
  // 보이는 글 마디(measure.mjs 와 같은 규칙)
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']), clipCache = new Map();
  const clipped = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { if (clipCache.has(a)) { if (clipCache.get(a)) return true; continue; } const cs = getComputedStyle(a); let c = false; if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const r = a.getBoundingClientRect(); c = r.width <= 1 || r.height <= 1; } clipCache.set(a, c); if (c) return true; } return false; };
  const R = document.createRange(), texts = [], tw = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
    R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    if (clipped(el)) continue;
    texts.push({n, el, rs});
  }
  const owners = new Map(); for (const t of texts) if (!owners.has(t.el)) owners.set(t.el, t);
  const fs = new Map(), tiny = []; for (const [el, t] of owners) { const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2; fs.set(k, (fs.get(k) || 0) + 1); if (f < 16.99) tiny.push(el.tagName + '.' + (el.getAttribute('class') || '') + ' ' + f + 'px 「' + t.n.nodeValue.trim().slice(0, 14) + '」'); }
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map(); for (const t of texts) { const bl = blockOf(t.el); if (!blocks.has(bl)) blocks.set(bl, t); }
  const xs = new Map(); for (const [bl, t] of blocks) { if (/center|right|end/.test(getComputedStyle(bl).textAlign)) continue; const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); }
  out.fonts = Object.fromEntries([...fs].sort((a, b) => a[0] - b[0])); out.fontKinds = fs.size; out.tiny = tiny; out.lefts = Object.fromEntries([...xs].sort((a, b) => a[0] - b[0])); out.leftLines = xs.size;
  for (const e of [v, ...v.querySelectorAll('*')]) {
    const tag = e.tagName.toLowerCase(); if (e.closest('svg') && tag !== 'svg') continue;
    const cs = getComputedStyle(e), nm = tag + '.' + (e.getAttribute('class') || '').split(/\s+/)[0];
    for (const k of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) if (parseFloat(cs[k]) < 0) out.neg.push(nm + ' ' + k + ' ' + cs[k]);
    for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) { const x = Math.round(parseFloat(cs[k]) * 100) / 100; if (![0, 8, 16, 24].includes(x)) out.pad.push(nm + ' ' + k + ' ' + cs[k]); }
    for (const k of ['rowGap', 'columnGap']) { if (cs[k] === 'normal') continue; const x = Math.round(parseFloat(cs[k]) * 100) / 100; if (![0, 8, 16, 24].includes(x)) out.gap.push(nm + ' ' + k + ' ' + cs[k]); }
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5 || r.left < -0.5) out.out.push((e.getAttribute('class') || tag) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
  }
  for (const e of v.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push((e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  // 같은 줄은 같은 높이 — 목록마다 안쪽 줄 높이 차
  for (const sel of ['.ptoday-rows', '.ptoday-fl', '.ptoday-mvs', '.ptoday-gs', '.ptoday-us', '.ptoday-bl']) for (const box of v.querySelectorAll(sel)) {
    const hs = [...box.children].map(c => c.getBoundingClientRect().height).filter(h => h > 0); if (hs.length < 2) continue; out.lists++;
    if (Math.max(...hs) - Math.min(...hs) >= 1) out.heights.push(sel + ' ' + hs.map(x => Math.round(x * 10) / 10).join('/'));
  }
  for (const ch of v.querySelectorAll('.ptoday-ch')) {
    const svg = ch.querySelector('svg'), cr = ch.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    if (Math.abs(sr.width - cr.width) > 1.01) out.ch.push('그림 ' + Math.round(sr.width) + ' ≠ 칸 ' + Math.round(cr.width));
    const ys = [];
    for (const s of ch.querySelectorAll('.ptoday-yl span')) { const q = s.getBoundingClientRect(); if (q.right > cr.right + 0.5 || q.left < cr.left - 0.5 || q.top < cr.top - 14 || q.bottom > cr.bottom + 14) out.yl.push('밖 ' + s.textContent); ys.push([q.top, q.bottom, s.textContent]); }
    ys.sort((a, b) => a[0] - b[0]); for (let i = 1; i < ys.length; i++) if (ys[i][0] < ys[i - 1][1] - 0.5) out.yl.push('겹침 ' + ys[i - 1][2] + '/' + ys[i][2]);
    const lf = ch.querySelector('.ptoday-lf'); if (!(lf?.getAttribute('d') || '').startsWith('M')) out.ch.push('선 없음');
  }
  dets.forEach((d, i) => { d.open = was[i]; });
  return out;
};
/** 선이 그려지는 동안 큰 숫자 세 번 읽기 — 기간 단추를 눌러 새로 그리게 하고 안에서 때를 맞춰 읽음(주고받는 시간 없이) */
const READ3 = ([want, ms, wait]) => new Promise(res => {
  const q = s => document.querySelector(s), btn = [...document.querySelectorAll('#view .ptoday-per button')].find(x => x.textContent.trim() === want);
  if (!btn || btn.getAttribute('aria-pressed') === 'true') { res({err: '단추 ' + want}); return; }
  const t0 = performance.now(), out = [];
  btn.click();
  const rd = () => out.push([Math.round(performance.now() - t0), q('#view .ptoday-v')?.textContent ?? '', q('#view .ptoday-lv')?.textContent ?? '', q('#view .ptoday-ch')?.classList.contains('ptoday-play') ? 1 : 0, q('#view .ptoday-hero')?.classList.contains('ptoday-sc') ? 1 : 0]);
  for (const m of ms) setTimeout(rd, m);
  setTimeout(() => res({out, endBig: q('#view .ptoday-v')?.textContent ?? '', endLv: q('#view .ptoday-lv')?.textContent ?? '', endPlay: q('#view .ptoday-ch')?.classList.contains('ptoday-play') ? 1 : 0}), wait);
});
async function heroAnim(w, X) {
  const where = w + ' 큰 숫자 달리기', p = await page(w, null, {height: 640, motion: 'no-preference', rec: true});
  try { await open(p, base + NEXT + '#/today', W_PAGE); } catch (e) { fail('열림(큰 숫자)', where + ' ' + e.message.slice(0, 100)); await p.context().close(); return; }
  const want = dayRows(X), still = () => p.waitForFunction(() => !document.querySelector('#view .ptoday-hero.ptoday-sc') && !document.querySelector('#view .ptoday-ch.ptoday-play'), null, {timeout: 8000}).then(() => true, () => false);
  await p.evaluate(() => document.querySelector('#view .ptoday-ch')?.scrollIntoView({block: 'center'})); await p.waitForTimeout(500); await still();
  // (가) 처음 저절로 그려지는 한 번 + 아래 눌러 그리는 두 번 동안 모든 프레임에서 큰 숫자 같음
  const r1 = await p.evaluate(READ3, ['1달', [150, 600, 1050], 1900]); // 3달 → 1달(1.4초 그리기)
  const r2 = await p.evaluate(READ3, ['1주', [100, 450, 800], 1500]); // 1달 → 1주(1.1초 그리기)
  const r3 = await p.evaluate(READ3, ['3달', [150, 700, 1250], 2300]); // 1주 → 3달(1.8초 그리기)
  const rec = await p.evaluate(() => window.__rec ?? []);
  for (const [tag, r] of [['1달', r1], ['1주', r2], ['3달', r3]]) {
    if (r.err) { fail('큰 숫자 읽기', where + ' ' + r.err); continue; }
    const bigs = r.out.map(x => x[1]); bump('큰 숫자 읽음', bigs.length);
    if (r.out.length !== 3) fail('큰 숫자를 세 번 못 읽음', where + ' ' + tag);
    if (r.out.some(x => !x[3])) fail('읽은 때가 선이 그려지는 동안이 아님(검사 시간 맞추기)', where + ' ' + tag + ' ' + JSON.stringify(r.out));
    if (new Set(bigs).size !== 1 || bigs[0] !== want || r.endBig !== want) fail('선이 그려지는 동안 큰 숫자가 바뀜 · 자료와 다름', where + ' ' + tag + ' 읽음 ' + JSON.stringify(bigs) + ' 끝 ' + r.endBig + ' · 자료 ' + want);
    if (new Set(r.out.map(x => x[2])).size < 2) fail('작은 지수 값이 안 움직임(그리기가 안 돈 것)', where + ' ' + tag + ' ' + JSON.stringify(r.out.map(x => x[2])));
    if (r.endPlay) fail('그리기가 끝나지 않음', where + ' ' + tag);
  }
  // (나) 프레임마다 기록 — 큰 숫자 하나뿐 · 그리는 프레임 여럿 · 그동안 지수 값은 여러 가지
  const bigs = new Set(rec.map(x => x[1])), play = rec.filter(x => x[3]), lvs = new Set(play.map(x => x[2])); bump('프레임 기록', rec.length);
  if (bigs.size !== 1 || ![...bigs][0] || [...bigs][0] !== want) fail('프레임 기록 — 큰 숫자가 바뀜 · 자료와 다름', where + ' ' + JSON.stringify([...bigs].slice(0, 6)) + ' · 자료 ' + want);
  if (play.length < 30) fail('프레임 기록 — 그리는 프레임이 모자람(그리기가 안 돎)', where + ' ' + play.length + '개');
  if (lvs.size < 10) fail('프레임 기록 — 그리는 동안 작은 지수 값이 거의 안 바뀜', where + ' ' + lvs.size + '가지');
  measure.hero = {w, want, frames: rec.length, playFrames: play.length, bigKinds: bigs.size, lvKinds: lvs.size, reads: [r1.out, r2.out, r3.out]};
  if (p._errs.length) fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 300));
  await p.context().close();
}
const WIDE = [[320, false], [360, false], [390, false], [320, true]];
if (!has('--no-wide')) { // --no-wide = 고치는 동안만(세 폭을 건너뜀)
  measure.layout = {};
  for (const [w, big] of WIDE) {
    const where = w + (big ? ' 아주 큰 글씨' : '') + ' #/today';
    const p = await page(w, VARIANT_W, {height: 640, motion: 'no-preference', font: big ? 2 : 0}), VW = VARIANT_W[1](clone(HOME));
    try { await open(p, base + NEXT + '#/today', W_PAGE); } catch (e) { fail('열림(폭)', where + ' ' + e.message.slice(0, 100)); await p.context().close(); continue; }
    if (big && !(await p.evaluate(() => document.documentElement.classList.contains('f3')))) fail('아주 큰 글씨가 안 켜짐', where);
    for (const [si, [ix, per]] of [['코스피', '3달'], ['코스닥', '1주']].entries()) {
      const still = () => p.waitForFunction(() => !document.querySelector('#view .ptoday-hero.ptoday-sc') && !document.querySelector('#view .ptoday-ch.ptoday-play'), null, {timeout: 8000}).then(() => true, () => false);
      await p.evaluate(() => document.querySelector('#view .ptoday-ch')?.scrollIntoView({block: 'center'})); await p.waitForTimeout(900); await still();
      await clickBtn(p, '#view .ptoday-seg button', ix); await clickBtn(p, '#view .ptoday-per button', per);
      await p.waitForTimeout(150); await still(); await frames(p); await p.waitForTimeout(300); await still(); await frames(p);
      const at = where + ' ' + ix + ' ' + per, L = await p.evaluate(LAYOUT, [false]), Lo = await p.evaluate(LAYOUT, [true]);
      if (L.err) { fail('폭 검사', at + ' ' + L.err); continue; }
      if (L.sw > L.vw) fail('가로 넘침', at + ' ' + L.sw + '>' + L.vw);
      for (const x of L.out.slice(0, 4)) fail('칸 밖', at + ' ' + x);
      for (const x of Lo.out.slice(0, 4)) fail('칸 밖(접은 칸을 연 채)', at + ' ' + x);
      for (const x of L.small.slice(0, 4)) fail('누르는 자리 44px 안 됨', at + ' ' + x);
      for (const x of Lo.small.slice(0, 4)) fail('누르는 자리 44px 안 됨(접은 칸을 연 채)', at + ' ' + x);
      for (const x of L.ch.slice(0, 3)) fail('그림', at + ' ' + x);
      for (const x of L.yl.slice(0, 3)) fail('눈금 글', at + ' ' + x);
      // [10] 5 · 6 · 7 · 8 · 9
      for (const [tg, M] of [['닫힌 채', L], ['접은 칸을 연 채', Lo]]) {
        bump('폭 재기');
        for (const x of M.tiny.slice(0, 4)) fail('글 17px 안 됨([10] 5)', at + ' ' + tg + ' ' + x);
        if (M.fontKinds > 6) fail('글씨 가짓수가 여섯을 넘음([10] 6)', at + ' ' + tg + ' ' + M.fontKinds + ' ' + JSON.stringify(M.fonts));
        for (const f of Object.keys(M.fonts)) if (!FS_OK.has(Number(f))) fail('글씨 크기가 --fs 토큰 밖([10] 6)', at + ' ' + tg + ' ' + f + 'px');
        if (M.leftLines > 3) fail('글 시작 왼쪽 줄이 셋을 넘음([10] 7)', at + ' ' + tg + ' ' + M.leftLines + ' ' + JSON.stringify(M.lefts));
        for (const x of M.neg.slice(0, 3)) fail('음수 간격([10] 8)', at + ' ' + tg + ' ' + x);
        for (const x of M.pad.slice(0, 3)) fail('안 여백이 8 · 16 · 24 가 아님([10] 8)', at + ' ' + tg + ' ' + x);
        for (const x of M.gap.slice(0, 3)) fail('칸 사이가 8 · 16 · 24 가 아님([10] 8)', at + ' ' + tg + ' ' + x);
        for (const x of M.heights.slice(0, 3)) fail('같은 줄 높이가 다름([10] 9)', at + ' ' + tg + ' ' + x);
      }
      // [10] 10 금빛 경고 — 닫힌 채 두 줄 안 · 접힌 것은 「?」 한 줄 · 눌러 펼침
      await frames(p); const G = await p.evaluate(GOLD); let folded = 0;
      for (const g of G) { bump('금빛 줄'); if (!g.long && g.lines > 2) fail('금빛 경고가 두 줄을 넘는데 접히지 않음([10] 10)', at + ' ' + g.lines + '줄 「' + g.text.slice(0, 30) + '」');
        if (g.long) { folded++; if (g.open) fail('접힘이 열려 있음', at); if (!g.sum || g.sum[2] > (big ? 2 : 1) || !g.sum[0].startsWith('?')) fail('접힌 줄이 「?」 한 줄이 아님(320px 아주 큰 글씨는 두 줄까지)', at + ' ' + JSON.stringify(g.sum)); } }
      if (folded) for (const x of await p.evaluate(EXPAND)) { bump('금빛 펼침'); if (!x.open || !x.vis || x.lines < 3) fail('접힌 줄을 누르면 펼쳐져야 함', at + ' ' + JSON.stringify(x).slice(0, 160)); }
      // [6] 8 큰 숫자 = 마지막 날 하루 바뀜(파일에서 따로 셈)
      const key = ix === '코스피' ? 'KOSPI' : 'KOSDAQ', want = dayRows(VW.idx[key]), got = await p.evaluate(() => document.querySelector('#view .ptoday-v')?.textContent ?? ''), cg = await p.evaluate(() => getComputedStyle(document.querySelector('#view .ptoday-v')).fontSize + '/' + getComputedStyle(document.querySelector('#view .ptoday-lv')).fontSize + '/' + getComputedStyle(document.querySelector('#view .ptoday-pw')).fontSize);
      bump('큰 숫자 맞댐'); if (got !== want) fail('큰 숫자 ≠ 마지막 날 하루 바뀜', at + ' 쪽 「' + got + '」 ≠ 자료 「' + want + '」');
      { const [fb, fl, fp] = cg.split('/').map(parseFloat); bump('큰 숫자 크기'); if (!(fb >= 2 * fl && fb >= 2 * fp)) fail('큰 숫자가 지수 값 · 기간 %의 두 배 이상이 아님([6] 8)', at + ' ' + cg); }
      measure.layout[w + (big ? 'F' : '') + '/' + ix] = {px: L.px, fonts: L.fonts, fontKinds: L.fontKinds, fontsOpen: Lo.fonts, fontKindsOpen: Lo.fontKinds, lefts: L.lefts, leftLines: L.leftLines, leftsOpen: Lo.lefts, leftLinesOpen: Lo.leftLines, tiny: L.tiny.length + Lo.tiny.length, neg: L.neg.length + Lo.neg.length, lists: Lo.lists, heightsBad: L.heights.length + Lo.heights.length, gold: G.length, goldFolded: folded, big: got};
      bump('폭 화면');
    }
    if (p._errs.length) fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 300));
    await p.context().close();
    if (w === 360 && !big) await heroAnim(360, HOME.idx.KOSPI); // 큰 숫자 달리기(움직임 켠 채 · 코스피)
  }
}

/* ⑤ 첫 화면 — 오늘 시장 칸이 없음 · #/today 고리 · render('home') 은 그릴 것 0([6] 4) */
{
  const p = await page(390, null, {height: 844});
  try {
    await open(p, base + NEXT + '#/', W_ANY); await p.waitForTimeout(400);
    const H = await p.evaluate(async () => ({ptoday: document.querySelectorAll('#view .ptoday, #view [class*="ptoday-"], #view .today-d').length, links: document.querySelectorAll('#view a[href="#/today"]').length,
      render: await import('/next/p-today.js').then(async m => { const r = await m.render('home'); return {nodes: (r?.nodes ?? []).length}; }).catch(e => ({err: String(e?.message ?? e).slice(0, 120)}))}));
    bump('첫 화면 맞댐');
    if (H.ptoday) fail('첫 화면에 오늘 시장 칸이 남음([6] 4)', H.ptoday + '개');
    if (H.links < 1) fail('첫 화면에 #/today 고리가 없음([6] 4)', String(H.links));
    if (H.render.err) fail('render(\'home\') 못 부름', H.render.err); else if (H.render.nodes) fail('render(\'home\') 이 그릴 것을 돌려줌([6] 4)', H.render.nodes + '개');
    measure.home = H;
  } catch (e) { fail('열림(첫 화면)', e.message.slice(0, 120)); }
  if (p._errs.length) fail('화면 오류', '첫 화면 ' + p._errs.join(' | ').slice(0, 200));
  await p.context().close();
}
await b.close();

/* ④ 글 검사(브라우저 없이) — css 토큰 · 옛 낱말 */
{
  const cssRaw = await fs.readFile(path.join(ROOT, 'site/next/p-today.css'), 'utf8'), css = cssRaw.replace(/\/\*[\s\S]*?\*\//g, '');
  const SP = /^(margin|padding)(-(top|right|bottom|left))?$|^(row-|column-)?gap$/;
  let nf = 0, ns = 0;
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) for (const d of m[2].split(';')) {
    const i = d.indexOf(':'); if (i < 0) continue; const prop = d.slice(0, i).trim(), val = d.slice(i + 1).trim(), sel = m[1].trim().replace(/\s+/g, ' ').slice(-50);
    if (prop === 'font-size') { nf++; if (!/^var\(--fs-[1-6]\)$/.test(val)) fail('p-today.css 글씨 크기가 --fs 토큰이 아님([10] 6)', sel + ' { ' + prop + ': ' + val + ' }'); }
    if (SP.test(prop)) { ns++; for (const t of val.split(/\s+/)) if (!/^(0|auto|var\(--sp-[123]\))$/.test(t)) fail('p-today.css 간격이 0 · auto · --sp 토큰이 아님([10] 8)', sel + ' { ' + prop + ': ' + val + ' }'); }
  }
  bump('css 글씨 선언', nf); bump('css 간격 선언', ns); if (nf < 10 || ns < 30) fail('css 글 검사가 선언을 거의 못 읽음(검사를 고칠 것)', nf + ' · ' + ns);
  // 글(따옴표 안)만 — 주석은 뺌
  const js = await fs.readFile(path.join(ROOT, 'site/next/p-today.js'), 'utf8'); let code = '', st = null, k = 0;
  while (k < js.length) { const c = js[k], c2 = js[k + 1];
    if (st === null) { if (c === '/' && c2 === '*') { k = js.indexOf('*/', k + 2) + 2; code += ' '; continue; } if (c === '/' && c2 === '/') { k = js.indexOf('\n', k); if (k < 0) break; continue; } if (c === '\'' || c === '"' || c === '`') st = c; code += c; k++; }
    else { if (c === '\\') { code += c + c2; k += 2; continue; } if (c === st) st = null; code += c; k++; } }
  for (const x of OLD_WORDS) { bump('쪽 코드 옛 낱말 셈'); if (code.includes(x)) fail('p-today.js 글에 옛 낱말([10] 1)', '「' + x + '」'); }
  if (/innerHTML|insertAdjacentHTML|eval\(|getContext|\bstyle\s*=/.test(code)) fail('p-today.js 보안 규칙(innerHTML · eval · 캔버스 · style 속성)', '');
}

const sec = Math.round((Date.now() - t0) / 1000);
const res = {made: new Date().toISOString(), base, path: NEXT, variants: list.map(v => v[0]), counts, measure, fails, warn: warn.slice(0, 50), sec, time: tm.get(), net: netSummary()};
console.log(JSON.stringify({time: res.time, net: res.net})); // 옛 쪽 · 새 쪽 여는 데 쓴 초 · 다시 받은 수(명령문 [1] 9)
if (OUT) await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(res, null, 1) + '\n');
if (DUMP) await fs.writeFile(path.resolve(DUMP), JSON.stringify(dumps, null, 1)); // 판마다 첫 짝
console.log(`오늘 시장 맞대기 — 자료 판 ${counts['자료 판'] || 0}개 · 짝 ${counts['짝'] || 0}(옛 첫 화면 ↔ 새 쪽) · 맞댄 칸 ${counts['맞댄 칸'] || 0} · 글 조각 ${counts['글 조각'] || 0} · 큰 숫자 맞댐 ${counts['큰 숫자 맞댐'] || 0} · 선 누르기 ${counts['선 누르기'] || 0} · 금빛 줄 ${counts['금빛 줄'] || 0}(접힘 ${counts['금빛 접힘'] || 0}) · 기억 ${counts['기억'] || 0} · 폭 화면 ${counts['폭 화면'] || 0} · ${sec}초`);
if (warn.length) console.log('알림(옛 쪽):', warn.length, warn.slice(0, 3).join(' / '));
if (fails.length) { console.log('실패', counts.fail); for (const [k, x] of fails.slice(0, 40)) console.log(' ✗', k, '—', x); process.exit(1); }
console.log('실패 0');

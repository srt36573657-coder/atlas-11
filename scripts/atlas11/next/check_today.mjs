// 오늘 시장 — 옛 첫 화면(/atlas/#/ 먹빛 칸 여섯: 시장 · 오른 곳과 내린 곳 · 사고팔기 · 미국 · 고른 곳 · 큰 갈래)과
//   새 첫 화면(/next/?dev=1#/ 「오늘 한 줄」 밑 칸 · p-today.js render('home'))과 새 쪽(/next/?dev=1#/today · render(''))을 같은 자료로 열어 맞대는 검사
//   사장님 2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게」
//   쓰는 법: node scripts/atlas11/next/check_today.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--pw /opt/node-tools/] [--out 결과.json] [--path /next/?dev=1] [--dump 뽑은글.json(판마다 첫 짝)] [--no-wide(고치는 동안만)]
//     --limit N = 앞 자료 판 N개만(고치는 동안) · 기본 · --all = 모든 판
//   ① 자료 판 여럿 — home.json(필요하면 core.json · lines.json)을 page.route 로 바꿔치기해 옛 · 새 쪽에 같은 값을 줌:
//      지금 사본 그대로(네 조각 모두 못 받음) · 제때 받은 날 · 장 중 · 받은 때가 다른 조각 · 받은 때 모름 · 사고판 돈 없음 · 업종 없음 · 오른 곳 수 없음 ·
//      미국 없음 · 미국 둘 · 코스닥 없음 · 지수 없음 · 고른 곳 없음 · 큰 날 「!」 · 3달 값 모자람 · 두 지수 날 다름 · 이상한 날 · 모두 내린 갈래 · 선 날짜 다름 · home.json 못 받음
//      판마다 지수 둘 × 기간 셋 = 여섯 짝을 두 쪽에서 눌러 칸마다 글을 뽑아 맞댐:
//        칸 글 조각(text node)이 옛 · 새 같은 모음인지(빠짐 0 · 더함 0 — 새 첫 화면의 「오늘 한 줄」과 봉인 줄은 첫 화면이 이미 보이므로 첫 화면 어디엔가 있는지) ·
//        머리 때 · 금빛 「?」 · 지수 단추(눌림 · 막힘) · 기간 단추 · 큰 숫자 · 하루 · 기간 % 와 색 · 그림 이름(aria) · 눈금 글 · 처음 · 끝 날 · 그림 이름표 · 선을 누른 날 값(처음 · 1/3 · 2/3 · 끝) ·
//        오른 곳 막대 몫 · 수 · 강한 · 약한 업종 줄(이름 · % · 색 · 고리 → #/ch/i/<업종>) · 사고팔기 줄(누구 · 얼마 · 막대 몫) · 금빛 「!」 · 미국 세 지수 · 불안 지수 ·
//        고른 곳 줄(이름 · % · 색 · 꼬리표 · 접은 칸 · 고리 → #/w/<번호>) · 큰 갈래(이름 · % · 색 · 고리 → #/ch/g/<번호>) · 봉인 줄 · 칸 차례 · 쓰지 않을 말 0
//   ② 기억 열쇠 atlas:m4idx · atlas:m4per — 옛 쪽에서 고른 것이 새 쪽에 이어짐 · 새 쪽에서 고른 것이 옛 글 꼴('1' · '21')로 남아 옛 쪽에 이어짐 · 틀린 값은 처음 값
//   ③ 세 폭(320 · 360 · 390 + 320 아주 큰 글씨) — 새 첫 화면 · 새 쪽: 가로 넘침 0 · 칸 밖 0 · 글 17px 넘게 · 누르는 자리 44px 넘게 · 그림 넓이 = 칸 넓이 · 눈금 글 칸 안
//   ④ 새 쪽 화면 오류 0(옛 쪽 오류는 알림으로만)
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', process.env.PW_DIR || '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1');
const LIMIT = has('--all') ? 0 : Number(arg('--limit', '0')) || 0, OUT = arg('--out', null), DUMP = arg('--dump', null); // --dump 파일 = 첫 짝의 뽑은 글(옛 · 새 첫 화면 · 새 쪽)
const fails = [], counts = {}, warn = [], t0 = Date.now(), dumps = [], dumped = new Set();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 500)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '매수 검토'];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = x => JSON.parse(JSON.stringify(x));

/* 자료(시험 서버에서) */
const getJ = async f => { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [HOME, CORE, LINES] = await Promise.all([getJ('home.json'), getJ('core.json'), getJ('lines.json')]).catch(e => { console.error('자료를 못 받음', e.message); process.exit(1); });
const IND = new Map(CORE.industries.map(i => [i.name, i]));
const kstDay = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);

/* 자료 판 — home(H) · core(C) · lines(L) 를 바꿔 씀 · init = 처음 기억(atlas:m4idx · atlas:m4per) · fail = home.json 을 못 받게 */
const fresh = H => { H.stale = {}; H.errors = []; H.live = false; for (const k of ['KOSPI', 'KOSDAQ']) if (H.idx?.[k]) H.idx[k].live = false; if (H.flows) H.flows.live = false; return H; };
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
  ['큰 날 「!」(지수 · 외국인)', H => { fresh(H); H.alerts = [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.28, why: 'usual', ratio: 2.6}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -5.36, why: 'big', ratio: 3.1}, {kind: 'flow', key: 'KOSPI', name: '코스피', v: -17507}, {kind: 'flow', key: 'KOSDAQ', name: '코스닥', v: 10234}]; return H; }],
  ['3달 값 모자람(15일)', H => { fresh(H); for (const k of ['KOSPI', 'KOSDAQ']) H.idx[k].rows = H.idx[k].rows.slice(-15); return H; }, {m4idx: '0', m4per: '60'}],
  ['두 지수 날 다름', H => { fresh(H); H.idx.KOSDAQ.rows.splice(10, 1); return H; }],
  ['이상한 날(대부분 그대로 · 미국 모두 내림 · 0억 · ? · 하루 그대로)', H => { fresh(H); H.sectors.breadth = {up: 10, down: 5, flat: 100, n: 115}; for (const r of H.us.rows) r.chg = -Math.abs(r.chg) - 0.01; H.flows.KOSPI.personal = 0.3; H.flows.KOSPI.institutional = null;
    const x = H.idx.KOSPI, n = x.rows.length; x.rows[n - 1][1] = x.rows[n - 2][1]; x.close = x.rows[n - 1][1]; x.day = 0; H.s365.flat = 0; H.s365.none = 3; return H; }],
  ['모두 내린 갈래 · 고른 곳 모두 반값 · 고른 기준 이름 없음', H => fresh(H), null, C => { for (const g of C.groups) g.chg = -Math.abs(g.chg) - 0.5; C.facts.dd50 = C.facts.n1y; delete C.rules.name; return C; }],
  ['선 날짜 다름(평소의 몇 배 없음)', H => fresh(H), null, null, L => { L.asOf = '2026-10-12'; return L; }],
  ['home.json 못 받음', null, null, null, null, true],
];
const list = LIMIT ? VARIANTS.slice(0, LIMIT) : VARIANTS;

/* 브라우저 — 한 번에 하나 · 다 쓰면 닫음 */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function page(width, v, {height = 844, init = null, motion = 'reduce', font = 0} = {}) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, reducedMotion: motion});
  if (init || font) await ctx.addInitScript(([s, f]) => { try { if (s) { localStorage.setItem('atlas:m4idx', s.m4idx); localStorage.setItem('atlas:m4per', s.m4per); } if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [init, font]);
  if (v) {
    const [, fh, , fc, fl, bad] = v;
    await ctx.route('**/atlas/data/home.json', r => (bad ? r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}) : r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fh ? fh(clone(HOME)) : HOME)})));
    if (fc) await ctx.route('**/atlas/data/core.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fc(clone(CORE)))}));
    if (fl) await ctx.route('**/atlas/data/lines.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(fl(clone(LINES)))}));
  }
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const W_OLD = () => !!document.querySelector('#view > .vw .m4-seal-box') && !document.querySelector('#view .boot');
const W_HOME = () => !!document.querySelector('#view .ptoday-home') && !document.querySelector('#view .boot');
const W_PAGE = () => !!document.querySelector('#view .ptoday-page') && !document.querySelector('#view .boot');
async function open(p, url, ready) { await p.goto(url); await p.waitForFunction(ready, null, {timeout: 30000}); await frames(p); await p.waitForTimeout(60); }
const clickBtn = (p, sel, name) => p.evaluate(([s, n]) => { const x = [...document.querySelectorAll(s)].find(y => y.textContent.trim() === n); if (!x) return 'none'; if (x.disabled) return 'disabled'; x.click(); return x.getAttribute('aria-pressed'); }, [sel, name]);

/* 칸마다 글 뽑기 — 옛 · 새 같은 꼴(클래스 이름만 다름) */
const EXTRACT = ([kind, mode]) => {
  const N = s => String(s ?? '').replace(/⁠/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const T = e => N(e?.textContent);
  const O = kind === 'old', view = document.querySelector('#view');
  const root = O ? view.querySelector(':scope > .vw') : view.querySelector('.ptoday');
  if (!root) return null;
  const S = O ? {sh: '.m4-sh', t: '.m4-t', meta: '.m4-meta', mq: '.m4-mq', lead: '.m4-lead', seg: '.m4-seg button', per: '.m4-per button', v: '.m4-v', vt: '.m4-vt', cg: '.m4-cg > span', ch: '.m4-ch', yl: '.m4-yl span', axl: '.m4-axl span', lgd: '.m4-lgd', one: 'one', pc: '.m4-pc', vh: '.m4-vh', hint: '.m4-hint', al: 'p.m4-al', how: 'details.m4-how', bar: '.m4-bar i', bl: '.m4-bl > span', sr: '.m4-sr', nm: '.nm', top: '.top b', sl: 'p.m4-sl', fr: '.m4-fr', fn: '.fn', fb: '.fb i', us: '.m4-us > div', mv: '.m4-mv', tg: '.tg', more: 'details.m4-more', g: '.m4-g', mr: '.m4-mr', say: '.m4-say', q: 'p.m4-q', lf: '.m4-ch .lf'}
    : {sh: '.ptoday-sh', t: '.ptoday-t', meta: '.ptoday-meta', mq: '.ptoday-mq', lead: '.ptoday-lead', seg: '.ptoday-seg button', per: '.ptoday-per button', v: '.ptoday-v', vt: '.ptoday-vt', cg: '.ptoday-cg > span', ch: '.ptoday-ch', yl: '.ptoday-yl span', axl: '.ptoday-axl span', lgd: '.ptoday-lgd', one: 'ptoday-one', pc: '.ptoday-pc', vh: '.ptoday-vh', hint: '.ptoday-hint', al: 'p.ptoday-al', how: 'details.ptoday-how', bar: '.ptoday-bar i', bl: '.ptoday-bl > span', sr: '.ptoday-sr', nm: '.ptoday-nm', top: '.ptoday-top b', sl: 'p.ptoday-sl', fr: '.ptoday-fr', fn: '.ptoday-fn', fb: '.ptoday-fb i', us: '.ptoday-us > div', mv: '.ptoday-mv', tg: '.ptoday-tg', more: 'details.ptoday-more', g: '.ptoday-g', mr: '.ptoday-mr', say: '.ptoday-say', q: 'p.ptoday-q', lf: '.ptoday-ch .ptoday-lf'};
  const C3 = e => { const c = (e?.getAttribute('class') || '').split(/\s+/); return c.includes('up') ? 'up' : c.includes('down') || c.includes('dn') ? 'dn' : c.includes('flat') || c.includes('fl') ? 'fl' : c.includes('q') ? 'q' : ''; };
  const BARK = e => { const c = e.getAttribute('class') || ''; return /\b(u|ptoday-bu)\b/.test(c) ? 'u' : /\b(f|ptoday-bf)\b/.test(c) ? 'f' : /\b(d|ptoday-bd)\b/.test(c) ? 'd' : '?'; };
  const texts = (el, skip) => { const out = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const pe = n.parentElement; if (pe.closest('svg')) continue; if (skip && pe.closest(skip)) continue; const t = N(n.textContent); if (t) out.push(t); } return out; };
  const KEYS = ['mk', 'br', 'fl', 'us', 'pk', 'gr'];
  const secOf = k => (O ? root.querySelector(`section.m4-sec[aria-labelledby="m4-h-${k}"]`) : root.querySelector(`section.ptoday-sec[data-k="${k}"]`));
  const out = {order: [], secs: {}, top: [], extra: []};
  if (O) out.order = [...root.querySelectorAll('section.m4-sec[aria-labelledby]')].map(s => s.getAttribute('aria-labelledby').slice(5)).filter(k => KEYS.includes(k));
  else out.order = [...root.querySelectorAll('section.ptoday-sec[data-k]')].map(s => s.dataset.k);
  out.top = O ? [...root.querySelectorAll(':scope > .m4-top p.m4-al')].map(T) : [...root.querySelectorAll(':scope > .ptoday-alerts p.ptoday-al')].map(T);
  // 시장 자료 없음 · 칸을 그리지 못함(그 칸 자리 「?」 한 줄)
  out.noHome = O ? [T(root.querySelector(':scope > h1.m4-h1x')), ...[...root.querySelectorAll(':scope > p.q.m4-q')].map(T)].filter(Boolean)
    : [...root.querySelectorAll(':scope > .ptoday-sh h2'), ...root.querySelectorAll(':scope > .ptoday-card > p.ptoday-q')].map(T).filter(Boolean);
  out.broken = O ? [...root.querySelectorAll(':scope > section.m4-sec:not([aria-labelledby]) p.m4-q')].map(T) : [...root.querySelectorAll(':scope > section.ptoday-sec:not([data-k]) p.ptoday-q')].map(T);
  for (const k of KEYS) {
    const s = secOf(k); if (!s) continue;
    for (const d of s.querySelectorAll('details')) d.open = true;
    const sh = s.querySelector(S.sh);
    const skip = !O || mode === 'page' ? null : k === 'mk' ? S.lead : k === 'gr' ? S.mr : null; // 새 첫 화면은 오늘 한 줄 · 봉인 줄을 첫 화면 다른 자리에 보임
    const r = {title: T(sh?.querySelector(S.t)), meta: T(sh?.querySelector(S.meta)), mq: !!sh?.querySelector(S.mq), texts: texts(s, skip), skipped: skip ? [...s.querySelectorAll(skip)].map(T) : [],
      how: [...s.querySelectorAll(S.how + ' summary')].map(x => x.getAttribute('aria-label')), q: [...s.querySelectorAll(S.q)].map(T), al: [...s.querySelectorAll(S.al)].map(T), lead: [...s.querySelectorAll(S.lead)].map(T)};
    if (k === 'mk') {
      r.seg = [...s.querySelectorAll(S.seg)].map(x => [T(x), x.getAttribute('aria-pressed'), x.disabled]);
      r.per = [...s.querySelectorAll(S.per)].map(x => [T(x), x.getAttribute('aria-pressed')]);
      r.v = T(s.querySelector(S.v)); r.vt = T(s.querySelector(S.vt));
      r.cg = [...s.querySelectorAll(S.cg)].map(x => [N([...x.childNodes].filter(c => c.nodeType === 3 || c.tagName !== 'B').map(c => c.textContent).join('')), T(x.querySelector('b')), C3(x.querySelector('b'))]);
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
  // 새 첫 화면 — 첫 화면 다른 자리(오늘 한 줄 · 봉인 줄 · 큰 날 「!」)의 글 · 쓰지 않을 말 셈(이름은 뺌)
  out.viewText = N(view.textContent);
  const cl = root.cloneNode(true); cl.querySelectorAll('[data-proper], [lang="ko"]').forEach(e => e.remove()); out.myText = N(cl.textContent);
  out.hrefs = [...root.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  return out;
};
/** 선 누르기 — 그 쪽 그림의 굵은 선 길에서 k 번째 점 자리를 읽어 누르고 큰 숫자 · 날을 읽음(처음 · 1/3 · 2/3 · 끝) */
const SCRUB = ([chSel, lfSel, vSel, vtSel]) => {
  const ch = document.querySelector(chSel), lf = document.querySelector(lfSel); if (!ch || !lf) return null;
  const svg = lf.ownerSVGElement, pts = [...(lf.getAttribute('d') || '').matchAll(/[ML]\s*([-\d.]+)\s+([-\d.]+)/g)].map(m => +m[1]), n = pts.length; if (n < 2) return null;
  const r = svg.getBoundingClientRect(), z = r.width / svg.viewBox.baseVal.width, cr = ch.getBoundingClientRect(), out = [];
  for (const k of [...new Set([0, Math.floor((n - 1) / 3), Math.floor(2 * (n - 1) / 3), n - 1])]) {
    ch.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + pts[k] * z, clientY: cr.top + cr.height / 2, bubbles: true, pointerType: 'mouse'}));
    out.push([k, document.querySelector(vSel)?.textContent ?? '', (document.querySelector(vtSel)?.textContent ?? '').replace(/ /g, ' ')]);
  }
  ch.dispatchEvent(new PointerEvent('pointerleave', {bubbles: false, pointerType: 'mouse'}));
  out.push(['놓음', document.querySelector(vSel)?.textContent ?? '', document.querySelector(vtSel)?.textContent ?? '']);
  return out;
};
const SCRUB_OLD = ['#view > .vw .m4-ch', '#view > .vw .m4-ch .lf', '#view > .vw .m4-v', '#view > .vw .m4-vt'], SCRUB_NEW = ['#view .ptoday .ptoday-ch', '#view .ptoday .ptoday-ch .ptoday-lf', '#view .ptoday .ptoday-v', '#view .ptoday .ptoday-vt'];

/* 맞대기 — 옛 쪽 = 기준 */
const N = s => String(s ?? '').replace(/⁠/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const mapOldHref = h => (h == null ? null : /^#\/c\/([0-9A-Z]{6})$/.test(h) ? '#/w/' + h.slice(4) : /^#\/g\//.test(h) ? '#/ch/g/' + h.slice(4) : /^#\/i\//.test(h) ? '#/ch/i/' + h.slice(4) : h);
const clsSame = (a, b, t) => a === b || (t === '?' && a === 'fl' && b === 'q'); // 모름(?)은 새 쪽 금빛
/** 오른 곳과 내린 곳 줄 고리 — 네이버 업종 이름 → core.secInd → 아틀란스 업종(옛: 업종 화면 · 1곳뿐이면 그 회사 / 새: 업종 채널) */
const secInd = (C, name) => { const n = C.secInd?.[String(name).replace(/\s+/g, '')]; return n ? IND.get(n) ?? null : null; };
function compare(at, o, n, mode, C) {
  if (!o) { fail('옛 쪽 못 읽음', at); return; }
  if (!n) { fail('새 쪽 못 읽음', at); return; }
  const same = (k, a, b) => { bump('맞댄 칸'); if (!eq(a, b)) fail(k, at + ' — 옛 ' + JSON.stringify(a).slice(0, 220) + ' · 새 ' + JSON.stringify(b).slice(0, 220)); };
  same('칸 차례', o.order, n.order);
  same('시장 자료 없음 줄', o.noHome, n.noHome);
  same('그리지 못한 칸', o.broken, n.broken);
  if (mode === 'page') same('큰 날 「!」(맨 위)', o.top, n.top);
  else for (const t of o.top) if (!n.viewText.includes(t)) fail('큰 날 「!」 — 새 첫 화면에 없음', at + ' ' + t);
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
    for (const t of a.skipped) { bump('첫 화면 다른 자리 글'); if (!n.viewText.includes(t)) fail('첫 화면에 없음(' + k + ')', w + ' ' + t); }
    same('어떻게 셌나요 ' + k, a.how, z.how); same('「?」 줄 ' + k, a.q, z.q); same('금빛 「!」 ' + k, a.al, z.al);
    if (k === 'mk') {
      if (mode === 'page') same('오늘 한 줄(시장)', a.lead, z.lead); else if (z.lead.length) fail('새 첫 화면 시장 칸에 오늘 한 줄을 되풀이', w);
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
      same('큰 갈래', a.g.map(x => [x[0], x[1], mapOldHref(x[3])]), z.g.map(x => [x[0], x[1], x[3]]));
      a.g.forEach((x, i) => { if (!clsSame(x[2], z.g[i]?.[2], x[1])) fail('큰 갈래 색', w + ' ' + x[0]); });
      if (mode === 'page') same('봉인 줄', a.mr ? [a.mr[0], a.mr[1]] : null, z.mr ? [z.mr[0], z.mr[1]] : null);
      else if (z.mr) fail('새 첫 화면 큰 갈래 칸에 봉인 줄을 되풀이', w);
    }
  }
  for (const k of n.order) if (!o.order.includes(k)) fail('옛 쪽에 없는 칸', at + ' ' + k);
  for (const x of BANNED) if (n.myText.includes(x)) fail('쓰지 않을 말', at + ' 「' + x + '」');
  for (const h of n.hrefs) { bump('고리'); if (!/^#\/(w\/[0-9A-Z]{6}|ch\/[ig]\/[^/]+|time|f\/rise)$/.test(h) && h !== '/atlas/#/time') fail('모르는 고리', at + ' ' + h); }
}
const PER = [[6, '1주'], [21, '1달'], [60, '3달']], IDX = ['코스피', '코스닥'];

/* ① 자료 판마다 — 옛 첫 화면 · 새 첫 화면 · 새 쪽 */
for (const v of list) {
  const name = v[0], init = v[2] ?? null, C = v[3] ? v[3](clone(CORE)) : CORE;
  const po = await page(390, v, {init}), ph = await page(390, v, {init}), pp = await page(390, v, {init});
  try {
    await open(po, base + '/atlas/#/', W_OLD);
    await open(ph, base + NEXT + '#/', W_HOME);
    await open(pp, base + NEXT + '#/today', W_PAGE);
  } catch (e) { fail('열림', name + ' ' + e.message.slice(0, 120)); for (const p of [po, ph, pp]) await p.context().close(); continue; }
  const run = async (tag) => {
    const [o, nh, np] = [await po.evaluate(EXTRACT, ['old', 'home']), await ph.evaluate(EXTRACT, ['new', 'home']), await pp.evaluate(EXTRACT, ['new', 'page'])];
    const o2 = await po.evaluate(EXTRACT, ['old', 'page']);
    if (DUMP && !dumped.has(name)) { dumped.add(name); dumps.push({name, tag, old: o, oldPage: o2, home: nh, page: np}); }
    compare(name + ' · 새 첫 화면 · ' + tag, o, nh, 'home', C);
    compare(name + ' · 새 쪽 · ' + tag, o2, np, 'page', C);
    if (o.secs.mk?.seg?.length) { // 선 누르기
      const so = await po.evaluate(SCRUB, SCRUB_OLD), sh = await ph.evaluate(SCRUB, SCRUB_NEW), sp = await pp.evaluate(SCRUB, SCRUB_NEW);
      bump('선 누르기'); if (!so || !eq(so, sh) || !eq(so, sp)) fail('선을 누른 날 값', name + ' · ' + tag + ' 옛 ' + JSON.stringify(so).slice(0, 200) + ' · 새 첫 화면 ' + JSON.stringify(sh).slice(0, 200) + ' · 새 쪽 ' + JSON.stringify(sp).slice(0, 200));
    }
    bump('짝');
  };
  const hasMk = await po.evaluate(() => !!document.querySelector('#view > .vw .m4-seg'));
  if (!hasMk) await run('지수 그림 없음');
  else {
    await run('처음(기억 ' + (init ? init.m4idx + '/' + init.m4per : '없음') + ')');
    for (const [k, nm] of IDX.entries()) {
      const r = await Promise.all([clickBtn(po, '#view .m4-seg button', nm), clickBtn(ph, '#view .ptoday-seg button', nm), clickBtn(pp, '#view .ptoday-seg button', nm)]);
      if (new Set(r).size !== 1) { fail('지수 단추', name + ' ' + nm + ' ' + r.join(' · ')); continue; }
      if (r[0] === 'disabled') continue;
      for (const [, pn] of PER) {
        const q = await Promise.all([clickBtn(po, '#view .m4-per button', pn), clickBtn(ph, '#view .ptoday-per button', pn), clickBtn(pp, '#view .ptoday-per button', pn)]);
        if (q.some(x => x !== 'true')) { fail('기간 단추', name + ' ' + nm + ' ' + pn + ' ' + q.join(' · ')); continue; }
        await Promise.all([frames(po), frames(ph), frames(pp)]);
        await run(nm + ' · ' + pn);
        void k;
      }
    }
  }
  const okErr = e => v[5] && /Failed to load resource/.test(e); // home.json 을 일부러 못 받게 한 판의 404
  for (const [p, nm] of [[ph, '새 첫 화면'], [pp, '새 쪽']]) { const es = p._errs.filter(e => !okErr(e)); if (es.length) fail('화면 오류', name + ' ' + nm + ' ' + es.join(' | ').slice(0, 300)); }
  { const es = po._errs.filter(e => !okErr(e)); if (es.length) warn.push('옛 쪽 화면 오류 ' + name + ' ' + es.join(' | ').slice(0, 200)); }
  for (const p of [po, ph, pp]) await p.context().close();
  bump('자료 판');
  console.log(`… ${counts['자료 판']}/${list.length} ${name} · 실패 ${counts.fail || 0} · ${Math.round((Date.now() - t0) / 1000)}초`);
}

/* ② 기억 열쇠 — 옛 쪽 ↔ 새 쪽(같은 사이트 · 같은 기억) */
{
  const pressed = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.textContent.trim()), sel);
  const store = p => p.evaluate(() => [localStorage.getItem('atlas:m4idx'), localStorage.getItem('atlas:m4per')]);
  // 옛 쪽에서 코스닥 · 1주 → 새 첫 화면 · 새 쪽
  const p = await page(390, null);
  await open(p, base + '/atlas/#/', W_OLD);
  await clickBtn(p, '#view .m4-seg button', '코스닥'); await clickBtn(p, '#view .m4-per button', '1주');
  const s0 = await store(p); if (!eq(s0, ['1', '6'])) fail('옛 쪽 기억(검사를 고칠 것)', JSON.stringify(s0));
  await open(p, base + NEXT + '#/', W_HOME);
  const a = [await pressed(p, '#view .ptoday-seg button'), await pressed(p, '#view .ptoday-per button')]; bump('기억');
  if (!eq(a, [['코스닥'], ['1주']])) fail('기억 — 옛 쪽에서 고른 것이 새 첫 화면에', JSON.stringify(a));
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
  // 틀린 값 → 처음 값(코스피 · 3달)
  const q = await page(390, null, {init: {m4idx: '7', m4per: '5'}});
  await open(q, base + NEXT + '#/today', W_PAGE);
  const a4 = [await pressed(q, '#view .ptoday-seg button'), await pressed(q, '#view .ptoday-per button')]; bump('기억');
  if (!eq(a4, [['코스피'], ['3달']])) fail('기억 — 틀린 값은 처음 값', JSON.stringify(a4));
  if (q._errs.length) fail('화면 오류', '기억 ' + q._errs.join(' | ').slice(0, 200));
  await q.context().close();
}

/* ③ 세 폭 + 아주 큰 글씨 — 새 첫 화면 · 새 쪽(움직임 그대로 — 그림이 다 그려진 뒤 잼) */
const LAYOUT = () => {
  const vw = document.documentElement.clientWidth, v = document.querySelector('#view .ptoday'); if (!v) return {err: '칸 없음'};
  for (const d of v.querySelectorAll('details')) d.open = true;
  const out = {sw: document.documentElement.scrollWidth, vw, out: [], small: [], tiny: [], ch: [], yl: []};
  for (const e of v.querySelectorAll('*')) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5 || r.left < -0.5) out.out.push((e.getAttribute('class') || e.tagName) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const own = [...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim());
    if (own) { const cs = getComputedStyle(e); if (cs.visibility !== 'hidden' && cs.opacity !== '0' && parseFloat(cs.fontSize) < 16.9) out.tiny.push(e.tagName + '.' + e.getAttribute('class') + ' ' + cs.fontSize + ' 「' + e.textContent.trim().slice(0, 12) + '」'); }
  }
  for (const e of v.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push((e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const ch of v.querySelectorAll('.ptoday-ch')) {
    const svg = ch.querySelector('svg'), cr = ch.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    if (Math.abs(sr.width - cr.width) > 1.01) out.ch.push('그림 ' + Math.round(sr.width) + ' ≠ 칸 ' + Math.round(cr.width));
    const ys = [];
    for (const s of ch.querySelectorAll('.ptoday-yl span')) { const q = s.getBoundingClientRect(); if (q.right > cr.right + 0.5 || q.left < cr.left - 0.5 || q.top < cr.top - 14 || q.bottom > cr.bottom + 14) out.yl.push('밖 ' + s.textContent); ys.push([q.top, q.bottom, s.textContent]); }
    ys.sort((a, b2) => a[0] - b2[0]); for (let i = 1; i < ys.length; i++) if (ys[i][0] < ys[i - 1][1] - 0.5) out.yl.push('겹침 ' + ys[i - 1][2] + '/' + ys[i][2]);
    const lf = ch.querySelector('.ptoday-lf'); if (!(lf?.getAttribute('d') || '').startsWith('M')) out.ch.push('선 없음');
  }
  return out;
};
for (const [w, big] of has('--no-wide') ? [] : [[320, false], [360, false], [390, false], [320, true]]) { // --no-wide = 고치는 동안만(세 폭을 건너뜀)
  for (const [hash, ready, nm] of [['#/', W_HOME, '새 첫 화면'], ['#/today', W_PAGE, '새 쪽']]) {
    const where = w + (big ? ' 아주 큰 글씨' : '') + ' ' + nm;
    const p = await page(w, VARIANTS[2], {height: 640, motion: 'no-preference', font: big ? 2 : 0}); // 장 중 판(때 글이 가장 긺)
    try { await open(p, base + NEXT + hash, ready); } catch (e) { fail('열림(폭)', where + ' ' + e.message.slice(0, 100)); await p.context().close(); continue; }
    if (big && !(await p.evaluate(() => document.documentElement.classList.contains('f3')))) fail('아주 큰 글씨가 안 켜짐', where);
    for (const [ix, per] of [['코스피', '3달'], ['코스닥', '1주']]) {
      // 여는 보드리(첫 화면 · 약 5초)가 끝나고 → 그림이 화면에 들어와 한 번 그려지고 → 단추를 눌러 다시 그려진 뒤에 잼(움직이는 중이면 큰 숫자가 달림)
      await p.waitForFunction(() => !document.querySelector('#view .m4-letter.intro'), null, {timeout: 15000}).catch(() => fail('여는 보드리가 안 끝남', where));
      await p.evaluate(() => document.querySelector('#view .ptoday-ch')?.scrollIntoView({block: 'center'})); await p.waitForTimeout(900);
      const still = () => p.waitForFunction(() => !document.querySelector('#view .ptoday-hero.ptoday-sc'), null, {timeout: 8000}).then(() => true, () => false);
      await still();
      await clickBtn(p, '#view .ptoday-seg button', ix); await clickBtn(p, '#view .ptoday-per button', per);
      await p.waitForTimeout(150); await still(); await frames(p);
      const L = await p.evaluate(LAYOUT), at = where + ' ' + ix + ' ' + per;
      if (L.err) { fail('폭 검사', at + ' ' + L.err); continue; }
      if (L.sw > L.vw) fail('가로 넘침', at + ' ' + L.sw + '>' + L.vw);
      for (const x of L.out.slice(0, 4)) fail('칸 밖', at + ' ' + x);
      for (const x of L.small.slice(0, 4)) fail('누르는 자리 44px 안 됨', at + ' ' + x);
      for (const x of L.tiny.slice(0, 4)) fail('글 17px 안 됨', at + ' ' + x);
      for (const x of L.ch.slice(0, 3)) fail('그림', at + ' ' + x);
      for (const x of L.yl.slice(0, 3)) fail('눈금 글', at + ' ' + x);
      await p.waitForTimeout(300); // 화면에 들어와 늦게 시작한 한 번 그리기도 끝나기를 기다림(움직이는 동안 큰 숫자가 달림)
      if (!(await still())) fail('움직임이 끝나지 않음(큰 숫자가 달리는 중)', at + ' ' + (await p.evaluate(() => document.querySelector('#view .ptoday-v')?.textContent ?? '')));
      const bigN = await p.evaluate(() => document.querySelector('#view .ptoday-v')?.textContent ?? ''), bigE = Number(HOME.idx?.[ix === '코스피' ? 'KOSPI' : 'KOSDAQ']?.close).toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}); // 다 그린 뒤 큰 숫자 = 마지막 종가
      if (bigN !== bigE) fail('다 그린 뒤 큰 숫자', at + ' ' + bigN + ' ≠ ' + bigE);
      bump('폭 화면');
    }
    if (p._errs.length) fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 300));
    await p.context().close();
  }
}
await b.close();

const sec = Math.round((Date.now() - t0) / 1000);
const res = {made: new Date().toISOString(), base, path: NEXT, variants: list.map(v => v[0]), counts, fails, warn: warn.slice(0, 50), sec};
if (OUT) await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(res, null, 1) + '\n');
if (DUMP) await fs.writeFile(path.resolve(DUMP), JSON.stringify(dumps, null, 1)); // 판마다 첫 짝
console.log(`오늘 시장 맞대기 — 자료 판 ${counts['자료 판'] || 0}개 · 짝 ${counts['짝'] || 0}(옛 첫 화면 ↔ 새 첫 화면 · 새 쪽) · 맞댄 칸 ${counts['맞댄 칸'] || 0} · 글 조각 ${counts['글 조각'] || 0} · 선 누르기 ${counts['선 누르기'] || 0} · 기억 ${counts['기억'] || 0} · 폭 화면 ${counts['폭 화면'] || 0} · ${sec}초`);
if (warn.length) console.log('알림(옛 쪽):', warn.length, warn.slice(0, 3).join(' / '));
if (fails.length) { console.log('실패', counts.fail); for (const [k, x] of fails.slice(0, 40)) console.log(' ✗', k, '—', x); process.exit(1); }
console.log('실패 0');

// 4단 지나온 길 — 옛 쪽(/atlas/#/c/<번호>/past)과 새 쪽(/next/?dev=1#/w/<번호>/past)을 같은 자료로 열어 맞대는 검사
//   사장님 2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게」
//   쓰는 법: node scripts/atlas11/next/check_past.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--wide N] [--pw /opt/node-tools/ · 또는 PW_DIR] [--out 결과.json] [--path /next/?dev=1]
//     기본 = 회사 200곳(특별한 곳 먼저 — 하루 30% 넘게 바뀐 날 · 늦게 들어온 회사 · 결산 3해 안 됨 · 금융(순이익만) · 값 배수 없음 · 손해 · 고른 곳 56곳 · 나머지는 고르게 뽑음)
//     --all = 모든 회사(2,557곳) · --limit N = 앞 N곳 · --wide N = 세 폭 검사 회사 수(기본 10)
//   ① 맞대기(390 폭) — 회사마다 기간 셋(20거래일 · 1년 · 3년)을 두 쪽에서 눌러 글을 뽑아 한 칸씩 같은지 봄:
//      제목 · 날 줄 · 7단 중 4단 · 앎의 종류(기록) · 고른 기간 · 그림 이름(aria) · 눈금 글 · 처음 · 끝 날 · 가장 높을 때 · 낮을 때 · 그림 이름표 둘 · 세 숫자(글 · 색) · 1주 값 줄 · 100만 원어치 줄 ·
//      하루 30% 넘게 바뀐 날 「?」 줄 · 금빛 동그라미 수 · 빈 동그라미 수 · 해마다 번 돈(해 · 값 · 막대 길이 · 손해 꼴) · 「? 결산 기록이 없습니다」 · 몸값(접은 칸 줄마다) · 출처 줄 ·
//      다음 챕터 미리 보기 · 맨 아래 자료 줄 · 「?」 알림 줄 · 알림 글(쓰지 않을 말 「매수 · 매도」만 「사고팔기」로) · 선을 누른 날 값(처음 · 1/3 · 2/3 · 끝) ·
//      옛 쪽 숫자 낱말(% · 원 · 곳 · 배 · 일 · 년 · 번째 …)이 새 쪽에 빠짐없이 있는지(접은 칸 포함 · 옛 7단 표시 「n단」만 뺌) · 챕터 일곱(4 금빛 · 다음 챕터 = 5) · 쓰지 않을 말 0
//   ② 세 폭(320 · 360 · 390 + 320 아주 큰 글씨) — 가로 넘침 0 · 칸 밖으로 나간 것 0 · 글 17px 넘게 · 누르는 자리 44px 넘게 · 그림 넓이 = 칸 넓이 · 눈금 글 칸 안 · 화면 오류 0
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep} from './rename.mjs';
import {gloss} from '../../../site/next/glossary.js'; // 낱말표(2026-10-18 [10] 1) — 새 쪽 기간 단추 글(20거래일 → 한 달) // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, watch, settle, timer, netSummary, isRemote} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
import {shardOf} from './shard/part.mjs'; // --shard k/n = 한 번 다 돌 때의 일감(회사 · 없는 번호 · 세 폭)을 n 몫으로 가른 k 번째만(깃허브 여러 대 · 합치기 shard/merge.mjs · 2026-10-18 고도리 길 1)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')); // playwright 가 깔린 폴더(run_all.mjs 는 PW_DIR 로 넘김)
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1');
const ALL = has('--all'), LIMIT = Number(arg('--limit', '0')) || 0, WIDE = Number(arg('--wide', '10')), OUT = arg('--out', null);
const fails = [], counts = {}, warn = [], t0 = Date.now(), tm = timer(t0);
let sink = null; // 실제 사이트에서 회사 하나를 맞대는 동안 걸린 것을 모아 둠 — 걸리면 두 쪽을 새로 열어 한 번 더 맞대고 그 결과만 남김(아래 ①)
const fail = (k, x) => { if (sink) { sink.push([k, x]); return; } counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '매수 검토'];

/* 자료(시험 서버에서) — 회사 목록 · 이름 · 고른 곳 */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [mkt, comp] = await Promise.all([getJ('mkt.json'), getJ('comp.json')]).catch(e => { console.error('자료를 못 받음', e.message); process.exit(1); });
const CO = mkt.companies, codes = Object.keys(CO).sort(), picked = Object.keys(comp.companies || {}).sort();

/* 뽑기 — 특별한 곳 먼저(저장소 사본 site/atlas/data/co 로 고름 · 없으면 건너뜀) → 고른 곳 → 고르게 */
const special = [], wideSet = [];
{
  const dir = path.join(ROOT, 'site/atlas/data/co'), files = await fs.readdir(dir).catch(() => []);
  const K = {jump: [], s20: [], s1y: [], s3y: [], fin: [], net: [], noper: [], nopbr: [], neg: [], big: []};
  let nAll = 0; try { nAll = JSON.parse(await fs.readFile(path.join(ROOT, 'site/atlas/data/days.json'), 'utf8')).dates.length; } catch { /* 사본 없음 */ }
  for (const f of files.sort()) {
    if (!f.endsWith('.json')) continue;
    let c; try { c = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); } catch { continue; }
    const code = c.code; if (!CO[code]) continue;
    if (c.jumps?.length) K.jump.push(code);
    if (nAll && c.k0 > nAll - 21) K.s20.push(code); else if (nAll && c.k0 > nAll - 253) K.s1y.push(code); else if (nAll && c.k0 > nAll - 757) K.s3y.push(code);
    if ((c.fin?.years?.length ?? 0) < 3) K.fin.push(code);
    if (c.key === 'net') K.net.push(code);
    if (c.per == null) K.noper.push(code);
    if (c.pbr == null) K.nopbr.push(code);
    if (['rev', 'op', 'net'].some(k => (c.fin?.[k] || []).some(x => x != null && x < 0))) K.neg.push(code);
    const cl = c.close || [], a = cl.find(x => x != null), b = [...cl].reverse().find(x => x != null); if (a && b) K.big.push([code, b / a]);
  }
  K.big = K.big.sort((p, q) => q[1] - p[1]).map(x => x[0]);
  const take = (xs, n) => xs.slice(0, n);
  for (const x of [...K.jump, ...K.s20, ...take(K.s1y, 12), ...take(K.s3y, 12), ...K.fin, ...take(K.net, 12), ...take(K.noper, 8), ...take(K.nopbr, 4), ...take(K.neg, 8), ...take(K.big, 6), ...take([...K.big].reverse(), 4)]) if (!special.includes(x)) special.push(x);
  const longest = [...codes].sort((p, q) => CO[q].n.length - CO[p].n.length || p.localeCompare(q))[0];
  for (const x of ['005930', longest, K.jump[0], K.s20[0], K.s1y[0], K.fin[0], picked[0], K.net[0], K.big[0], K.neg[0], K.noper[0], K.s3y[0]]) if (x && CO[x] && !wideSet.includes(x)) wideSet.push(x);
}
const order = [];
for (const x of [...special, ...picked]) if (!order.includes(x)) order.push(x);
{ const rest = codes.filter(c => !order.includes(c)), step = Math.max(1, Math.floor(rest.length / Math.max(1, 200 - order.length))); for (let i = 0; i < rest.length && order.length < 200; i += step) order.push(rest[i]); }
const list = ALL ? [...order, ...codes.filter(c => !order.includes(c))] : LIMIT ? order.slice(0, LIMIT) : order;
const SH = shardOf(); // 몫(--shard k/n · 없으면 모두 내 몫)
for (const x of codes.filter(c => !wideSet.includes(c))) { if (wideSet.length >= 12) break; wideSet.push(x); }
const wide = wideSet.slice(0, WIDE);

/* 브라우저 — 한 번에 하나 · 다 쓰면 닫음 */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function page(width, height = 844, init = null) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return watch(p, base); // 망 탈 셈(net.mjs)
}
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
/** 길 바꾸기 — 앞 화면 칸에 표시를 달고 주소를 바꾼 뒤, 표시 없는 새 칸에 그 회사 제목이 뜰 때까지 기다림(앞 회사 글을 읽지 않게) */
//   망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle) — 망 탈 없이 못 그리면 앞과 같은 실패(던짐) · 여는 데 쓴 때를 쪽마다 셈(tm)
async function goOld(p, code) { // 옛 앱이 새로 고치는 사이에 주소를 바꾸면 끊김 — 기다렸다 다시(세 번까지 · 아래 reopenOld 글)
  for (let k = 0; ; k++) {
    try { return await goOld0(p, code); } catch (e) { if (k >= 2 || !RELOADED.test(String(e?.message))) throw e; await p.waitForLoadState('domcontentloaded').catch(() => {}); await p.waitForTimeout(800); }
  }
}
async function goOld0(p, code) {
  const ok = await tm.old(() => settle(p, async () => {
    await p.evaluate(h => { if (location.hash === h) return; document.querySelector('#view > .vw')?.setAttribute('data-stale', '1'); location.hash = h; }, '#/c/' + code + '/past');
    return p.waitForFunction(t => { const v = document.querySelector('#view > .vw:not([data-stale])'); return v && !v.querySelector('.boot') && v.querySelector('.co-head h1')?.textContent === t; }, CO[code].n + ' — 지나온 길', {timeout: 20000}).then(() => true, () => false);
  }, {what: '옛 쪽 ' + code, fail}));
  if (!ok) throw Error(ok === null ? '망 막힘' : '20초 안에 안 그려짐');
}
/** 옛 쪽을 새로 엶(같은 주소 다시 읽기) — 옛 앱이 스스로 새로 고치는 사이(10분 넘게 연 화면에서 자료 made 가 바뀜 → atlas.js freshCheck)에 단추를 누르거나 읽으면 빈 화면 · 끊김
 *  2026-10-20 실제 사이트 큰 시험 past 「기간 단추 — 253450 20거래일 · 1년 · 3년 false true」(옛 쪽만 단추가 없었음 · 이 방에서 같은 회사는 단추 셋 그대로 · check_co · check_grow 와 같은 까닭) */
const RELOADED = /Execution context was destroyed|frame was detached|navigation/i;
/** 검사 자체 시험 — OLD_RELOAD_MS=<밀리초> 면 옛 쪽 탭이 그만큼마다 스스로 새로 고침(옛 앱 freshCheck 흉내 · 다시 열기 길을 이 방에서 돌려 봄) */
const OLD_RELOAD = Number(process.env.OLD_RELOAD_MS) > 0 ? {content: `if (location.pathname.startsWith('/atlas/')) setTimeout(() => location.reload(), ${Number(process.env.OLD_RELOAD_MS)});`} : null;
async function reopenOld(p, code) { await tm.old(() => p.reload({waitUntil: 'domcontentloaded', timeout: 30000}).catch(() => null)); await goOld(p, code); bump('옛 쪽 다시 열림'); }
async function goNew(p, code) {
  const ok = await tm.new(() => settle(p, async () => {
    await p.evaluate(h => { if (location.hash === h) return; document.querySelector('#view > .ppast')?.setAttribute('data-stale', '1'); location.hash = h; }, '#/w/' + code + '/past');
    return p.waitForFunction(t => { const v = document.querySelector('#view > .ppast:not([data-stale])'); return v && v.querySelector('h1.wt')?.textContent === t; }, CO[code].n + ' — 지나온 길', {timeout: 20000}).then(() => true, () => false);
  }, {what: '새 쪽 ' + code, fail}));
  if (!ok) throw Error(ok === null ? '망 막힘' : '20초 안에 안 그려짐');
  await frames(p);
}
const clickPer = (p, sel, name) => p.evaluate(([s, n]) => { const btn = [...document.querySelectorAll(s)].find(x => x.textContent.trim() === n); if (!btn) return false; btn.click(); return btn.getAttribute('aria-pressed') === 'true'; }, [sel, name]);

/* 글 뽑기(같은 꼴로) — 옛 쪽 */
const OLD_X = () => {
  const T = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const v = document.querySelector('#view > .vw'); if (!v) return null;
  for (const d of v.querySelectorAll('details')) d.open = true;
  const fbox = [...v.querySelectorAll('.box')].find(x => T(x.querySelector('h2')) === '해마다 번 돈(결산 기록)'), svg = v.querySelector('.lc svg'), foot = v.querySelector('footer.foot');
  const C = {up: 'up', down: 'dn', flat: 'fl'};
  return {
    h1: T(v.querySelector('.co-head h1')), ws: T(v.querySelector('.co-head small')), lv: T(v.querySelector('.steps .st-t')), per: T(v.querySelector('.seg.seg3 button[aria-pressed="true"]')), pers: [...v.querySelectorAll('.seg.seg3 button')].map(T),
    aria: svg?.getAttribute('aria-label') ?? null, q: T(v.querySelector('.lc > p.q')), yr: [...v.querySelectorAll('.lc .yr span')].map(T), ax: [...v.querySelectorAll('.lc .ax span')].map(T), hl: T(v.querySelector('.lc-ext')),
    key: [...v.querySelectorAll('.lkey > span')].map(T),
    trio: [...v.querySelectorAll('.trio > div')].map(d => { const x = d.querySelector('b'), t = T(x); return [T(d.querySelector('span')), t, t === '?' ? 'q' : C[(x?.className.match(/\b(up|down|flat)\b/) || [])[1]] ?? '']; }),
    won: [...v.querySelectorAll('p.won')].map(T), jump: [...v.querySelectorAll('p.note')].map(T).filter(t => t.startsWith('? 하루에 30%')),
    jc: svg ? svg.querySelectorAll('circle[r="7"]').length : 0, xc: svg ? svg.querySelectorAll('circle[r="4"]').length : 0,
    finH: fbox ? T(fbox.querySelector('h2')) : '',
    fin: fbox ? [...fbox.querySelectorAll('h3')].map(h3 => ({n: T(h3), rows: [...(h3.nextElementSibling?.querySelectorAll('li') ?? [])].map(li => { const f = li.querySelector('.fb'); return [T(li.querySelector('.y')), T(li.querySelector('b')), f?.style.width || '', f?.classList.contains('neg') ? 'neg' : 'pos']; })})) : [],
    finQ: fbox ? T(fbox.querySelector('p.q')) : '', finNote: fbox ? T(fbox.querySelector('p.small')) : '',
    sum: T(v.querySelector('details.more summary')), chk: [...v.querySelectorAll('details.more ul.chk li')].map(T), src: T(v.querySelector('p.src')),
    nx: [...v.querySelectorAll('a.nextst')].map(a => T(a.querySelector('span span'))),
    foot: foot ? [...foot.querySelectorAll(':scope > p')].map(T).filter(t => !t.startsWith('친구에게')) : [],
    text: v.innerText,
  };
};
/* 글 뽑기 — 새 쪽 */
const NEW_X = () => {
  const T = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const v = document.querySelector('#view > .ppast:not([data-stale])'); if (!v) return null;
  for (const d of v.querySelectorAll('details')) d.open = true;
  const svg = v.querySelector('.ppast-lc svg'), fin = v.querySelector('.ppast-fin');
  return {
    h1: T(v.querySelector('h1.wt')), ws: T(v.querySelector('p.ws')), lv: T(v.querySelector('p.ppast-lv')), per: T(v.querySelector('.ppast-seg button[aria-pressed="true"]')), pers: [...v.querySelectorAll('.ppast-seg button')].map(T),
    aria: svg?.getAttribute('aria-label') ?? null, q: T(v.querySelector('.ppast-chart > p.empty')), yr: [...v.querySelectorAll('.ppast-yr span')].map(T), ax: [...v.querySelectorAll('.ppast-ax span')].map(T), hl: T(v.querySelector('.ppast-hl')),
    key: [...v.querySelectorAll('.ppast-key > span')].map(T),
    trio: [...v.querySelectorAll('.ppast-trio > div')].map(d => { const x = d.querySelector('b'); return [T(d.querySelector('span')), T(x), (x?.className.match(/\b(up|dn|fl|q)\b/) || [])[1] ?? '']; }),
    won: [...v.querySelectorAll('p.ppast-won')].map(T), jump: [...v.querySelectorAll('p.ppast-jump, .ppast-jump > .nw-t')].map(T),
    now: [...v.querySelectorAll('p.ppast-now')].map(T), nowTop: (() => { const a = v.querySelector('p.ppast-now'), b = v.querySelector('.chaps'); return !a || !!(b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)); })(), // 맨 위 결 한 줄(총정리 C14) · 챕터 줄 위
    jc: svg ? svg.querySelectorAll('circle.ppast-jmp').length : 0, xc: svg ? svg.querySelectorAll('circle.ppast-ext').length : 0,
    finH: T([...v.querySelectorAll('h2.sec')].find(x => x.nextElementSibling === fin)),
    fin: fin ? [...fin.querySelectorAll('h3')].map(h3 => ({n: T(h3), rows: [...(h3.nextElementSibling?.querySelectorAll('li') ?? [])].map(li => { const f = li.querySelector('.ppast-fb'); return [T(li.querySelector('.ppast-y')), T(li.querySelector('.ppast-fv')), f?.style.width || '', f?.classList.contains('neg') ? 'neg' : 'pos']; })})) : [],
    finQ: fin ? T(fin.querySelector('p.ppast-q')) : '', finNote: fin ? T(fin.querySelector('p.ppast-small')) : '',
    sum: T(v.querySelector('details.ppast-more summary')), chk: [...v.querySelectorAll('details.ppast-more ul.ppast-chk li')].map(T), src: T(v.querySelector('p.ppast-src')),
    nx: [T(v.querySelector('.ppast-nx b')), T(v.querySelector('.ppast-nx span'))], next: [T(v.querySelector('a.chap-next')), v.querySelector('a.chap-next')?.getAttribute('href') ?? ''],
    chaps: [...v.querySelectorAll('.chaps .cp')].map(a => [T(a), a.classList.contains('now'), a.getAttribute('href') ?? '']),
    foot: [...v.querySelectorAll('footer.ppast-foot > p')].map(T),
    text: document.querySelector('#view').innerText,
  };
};
/** 선 누르기 — 그 쪽 그림의 넓이 · 눈금 칸으로 k 번째 날 자리를 셈해 누르고 위 글을 읽음(처음 · 1/3 · 2/3 · 끝) */
const TIPS = ([svgSel, tipSel]) => {
  const svg = document.querySelector(svgSel); if (!svg) return null;
  const up = [...svg.querySelectorAll('path[clip-path]')].find(x => x.getAttribute('stroke-width') === '2'); if (!up) return null;
  const n = (up.getAttribute('d').match(/[ML]/g) || []).length, W = svg.viewBox.baseVal.width, base0 = svg.querySelector('line[stroke-dasharray="2 4"]');
  const padR = W - (+base0.getAttribute('x2') - 6), r = svg.getBoundingClientRect(), out = [];
  for (const k of [...new Set([0, Math.floor((n - 1) / 3), Math.floor(2 * (n - 1) / 3), n - 1])]) {
    const X = 4 + k * (W - 4 - padR) / Math.max(1, n - 1), cx = r.left + X * r.width / W, cy = r.top + r.height / 2;
    svg.dispatchEvent(new PointerEvent('pointermove', {clientX: cx, clientY: cy, bubbles: true, pointerType: 'mouse'}));
    const tip = document.querySelector(tipSel); out.push([k, tip && !tip.hidden ? tip.textContent.replace(/\s+/g, ' ').trim() : '(숨음)']);
  }
  svg.dispatchEvent(new PointerEvent('pointerleave', {bubbles: false, pointerType: 'mouse'}));
  return {n, out};
};
const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const tokens = s => new Set((norm(s).match(/[+−-]?\d[\d,.]*[^\s·()[\]{},:;!?"'「」→]*/g) || []).map(t => t.replace(/[.]+$/, '')));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const OLD_SAFE = '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다.';
const NEW_SAFE = '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 사고팔기 · 보유 또는 시장 전망을 권하지 않습니다.';

function compare(code, perName, o, n) {
  const at = code + ' ' + perName;
  if (!o) { fail('옛 쪽 못 읽음', at); return; }
  if (!n) { fail('새 쪽 못 읽음', at); return; }
  // 옛 쪽이 제대로 열렸는지(둘 다 깨져 같게 보이는 것 막기)
  if (o.trio.length !== 3 || o.won.length !== 2 || o.ax.length !== 2 || o.yr.length < 2 || o.chk.length < 3) fail('옛 쪽이 덜 그려짐', at + ' ' + JSON.stringify([o.trio.length, o.won.length, o.ax.length, o.yr.length, o.chk.length]));
  const same = (k, a, b) => { bump('맞댄 칸'); if (!eq(a, b)) fail(k, at + ' 옛 ' + JSON.stringify(a).slice(0, 180) + ' · 새 ' + JSON.stringify(b).slice(0, 180)); };
  same('제목', o.h1, n.h1); same('날 줄', o.ws, n.ws); same('7단 중 4단 · 앎의 종류', o.lv, n.lv); same('고른 기간', o.per, n.per); same('기간 단추', o.pers, n.pers);
  same('그림 이름(aria)', o.aria, n.aria); same('「?」 그림', o.q, n.q); same('눈금 글', o.yr, n.yr); same('처음 · 끝 날', o.ax, n.ax); same('가장 높을 때 · 낮을 때', o.hl, n.hl);
  same('그림 이름표', o.key, n.key); same('세 숫자', o.trio, n.trio); same('1주 값 · 100만 원어치', o.won, n.won); same('하루 30% 넘게 바뀐 날 「?」', o.jump, n.jump);
  same('금빛 동그라미 수', o.jc, n.jc); same('빈 동그라미 수', o.xc, n.xc);
  same('해마다 번 돈 제목', o.finH, n.finH); same('해마다 번 돈', o.fin, n.fin); same('「? 결산 기록이 없습니다」', o.finQ, n.finQ); same('해마다 번 돈 알림', o.finNote, n.finNote);
  same('몸값 접은 칸 이름', o.sum, n.sum); same('몸값', o.chk, n.chk); same('출처 줄', o.src, n.src);
  same('다음 챕터 미리 보기', o.nx.length ? [...new Set(o.nx)] : [], n.nx[1] ? [n.nx[1]] : []);
  if (n.nx[0] !== '5 누구와 다투나') fail('다음 챕터 이름', at + ' ' + n.nx[0]);
  if (n.next[0] !== '다음 단 · 5 누구와 다투나 ›' || !/^(#\/w\/[0-9A-Z]{6}\/rivals|\/atlas\/#\/c\/[0-9A-Z]{6}\/rivals)$/.test(n.next[1]) || !n.next[1].includes(code)) fail('다음 챕터 고리', at + ' ' + JSON.stringify(n.next));
  const ch = n.chaps; if (ch.length !== 7 || ch.filter(x => x[1]).length !== 1 || !ch[3][1] || !ch[3][0].startsWith('4') || ch.slice(3).some(x => !x[2].includes(code))) fail('챕터 일곱', at + ' ' + JSON.stringify(ch).slice(0, 300));
  // 맨 아래 — 자료 줄 · 「?」 알림은 그대로 · 알림 글은 쓰지 않을 말 둘만 바꿈
  const oF = o.foot.map(t => (t === OLD_SAFE ? NEW_SAFE : t));
  same('맨 아래 자료 · 알림', oF, n.foot);
  if (!o.foot.includes(OLD_SAFE)) fail('옛 쪽 알림 글이 바뀜(검사를 고칠 것)', at);
  // 숫자 낱말 — 옛 쪽 것이 새 쪽에 모두(옛 7단 표시 「n단」만 뺌)
  const nt = tokens(n.text), miss = [...tokens(o.text)].filter(t => !/^\d단$/.test(t) && !nt.has(t));
  bump('숫자 낱말', tokens(o.text).size);
  if (miss.length) fail('옛 쪽 숫자 낱말 빠짐', at + ' ' + miss.slice(0, 12).join(' '));
  for (const w of BANNED) if (n.text.includes(w)) fail('쓰지 않을 말', at + ' 「' + w + '」');
}

/* 맨 위 결 한 줄(사장님 2026-10-22 04:09 「결과부터 나오는 구조」 · 총정리 C14) — 화면 코드를 쓰지 않고 자료(days.json · co/<번호>.json)에서 따로 셈해 맞댐
   1년 선(253거래일 · 기간 단추 「1년」과 같은 날 수)의 첫 값 → 마지막 종가 · 그사이 가장 높던 값보다 몇 % 아래(반올림 · 1 밑이면 「조금」 · 꼭대기면 「바로 이 값」)
   기간 단추를 눌러도 같은 줄 · 챕터 줄 위 · 상장 1년 안 · 값 없음 = 줄 없음 */
const DAYS = await getJ('days.json').catch(() => null), coJ = new Map();
const wonK = v => Math.round(v).toLocaleString('ko-KR') + '원';
async function nowWant(code) {
  if (!coJ.has(code)) coJ.set(code, await getJ('co/' + encodeURIComponent(code) + '.json').catch(() => null));
  const c = coJ.get(code), nAll = DAYS?.dates?.length ?? 0, k0 = c?.k0 ?? 0, Y1 = 253;
  if (!c || !Array.isArray(c.close) || !nAll || nAll - Y1 < k0) return [];
  const cl = c.close.slice(nAll - Y1 - k0), ds = DAYS.dates.slice(nAll - Y1), ok = x => x != null && x > 0;
  const i0 = cl.findIndex(ok); let iL = -1; for (let i = cl.length - 1; i >= 0; i--) if (ok(cl[i])) { iL = i; break; }
  if (i0 < 0 || iL <= i0 || !ds[iL]) return [];
  const a = cl[i0], z = cl[iL], top = Math.max(...cl.filter(ok)), dr = Math.round((1 - z / top) * 100), d = ds[iL];
  const tail = z >= top ? '그사이 가장 높은 값이 바로 이 값이에요.' : dr < 1 ? `그사이 가장 높던 ${wonK(top)}보다 조금 아래예요.` : `그사이 가장 높던 ${wonK(top)}보다는 ${dr}% 아래예요.`;
  return [`1년 전 ${wonK(a)} → ${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일 ${wonK(z)}. ${tail}`];
}
async function nowCheck(code, perName, n) {
  if (!n) return;
  const want = await nowWant(code); bump('맨 위 결 한 줄');
  if (!eq(n.now, want)) fail('맨 위 결 한 줄(총정리 C14)', code + ' ' + perName + ' 새 ' + JSON.stringify(n.now).slice(0, 200) + ' · 자료 ' + JSON.stringify(want).slice(0, 200));
  if (!n.nowTop) fail('맨 위 결 한 줄이 챕터 줄 위가 아님', code + ' ' + perName);
}

/* ① 맞대기 */
const P = [['20d', '20거래일'], ['1y', '1년'], ['3y', '3년']];
{
  const po = await page(390, 844, OLD_RELOAD), pn = await page(390), c0 = list.find(c => CO[c]) ?? codes[0]; // 처음부터 그 쪽으로 엶(첫 화면의 다른 쪽 모듈 오류가 섞이지 않게)
  await Promise.all([tm.old(() => settle(po, async () => { await po.goto(base + '/atlas/#/c/' + c0 + '/past'); return po.waitForFunction(() => !!document.querySelector('#view > .vw') && !document.querySelector('#view .boot'), null, {timeout: 30000}).then(() => true, () => false); }, {what: '옛 쪽 첫 열림', fail})),
    tm.new(() => settle(pn, async () => { await pn.goto(base + NEXT + '#/w/' + c0 + '/past'); return pn.waitForFunction(() => !!document.querySelector('#view > .ppast'), null, {timeout: 30000}).then(() => true, () => false); }, {what: '새 쪽 첫 열림', fail}))]);
  await Promise.all([po.waitForFunction(() => !!document.querySelector('#view > .vw') && !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => fail('옛 쪽 첫 열림', c0)), pn.waitForFunction(() => !!document.querySelector('#view > .ppast'), null, {timeout: 30000}).catch(() => fail('새 쪽 첫 열림', c0))]);
  let first = true;
  /* 실제 사이트는 매시 새 자료로 올라감 — 회사 하나를 맞대는 사이에 바뀌면 옛 쪽 · 새 쪽이 다른 때의 값을 보여 줌
     (2026-10-20 seven 9/11 past 「0155E0 오늘 값 옛 8,400원 · 새 8,340원」 — 회사 이백 곳 가운데 이 한 곳만 · 두 쪽 모두 새로 열면 같은 때 자료)
     → 걸리면 두 쪽을 새로 열어 한 번 더 맞대고 그 결과만 남김 · 진짜 다름은 두 번째에도 걸림 · 이 방(묶은 자료)은 그대로 한 번 */
  const REMOTE = isRemote(base); let staleDone = false; // PAST_STALE_TEST = 검사 자체 시험(첫 회사 첫 맞대기만 걸린 척 · 실제 사이트 쪽은 다시 맞대어 통과 · 이 방은 걸림)
  for (const code of SH.part('c', list)) {
    if (!CO[code]) { fail('목록에 없는 번호', code); continue; }
    for (let again = 0; ; again++) {
      sink = REMOTE && again === 0 ? [] : null;
      try { await oneCo(code); if (process.env.PAST_STALE_TEST && again === 0 && !staleDone) { staleDone = true; fail('시험 · 값 바뀜 흉내', code); } } catch (e) { const g = sink; sink = null; for (const [k, x] of g ?? []) fail(k, x); throw e; } // 던지면 모은 것을 그대로 남김
      const got = sink; sink = null;
      if (!got || !got.length) break;
      bump('값이 바뀌어 다시 맞댐'); warn.push('값이 바뀌어 다시 맞댐 ' + code + ' ' + got.length + '건 · 첫 줄 ' + got[0][0] + ' ' + String(got[0][1]).slice(0, 160)); // 숨기지 않고 남김
      await Promise.all([tm.old(() => po.reload({waitUntil: 'domcontentloaded', timeout: 30000}).catch(() => null)), tm.new(() => pn.reload({waitUntil: 'domcontentloaded', timeout: 30000}).catch(() => null))]);
    }
    if (pn._errs.length) { fail('새 쪽 화면 오류', code + ' ' + pn._errs.join(' | ').slice(0, 300)); pn._errs.length = 0; }
    if (po._errs.length) { warn.push('옛 쪽 화면 오류 ' + code + ' ' + po._errs.join(' | ').slice(0, 200)); po._errs.length = 0; }
    bump('회사');
    if (counts['회사'] % 100 === 0) console.log(`… ${counts['회사']}곳 · 실패 ${counts.fail || 0} · ${Math.round((Date.now() - t0) / 1000)}초`);
  }
  async function oneCo(code) {
    const ok = await Promise.all([goOld(po, code).then(() => true, e => { fail('옛 쪽 열림', code + ' ' + e.message.slice(0, 80)); return false; }), goNew(pn, code).then(() => true, e => { fail('새 쪽 열림', code + ' ' + e.message.slice(0, 80)); return false; })]);
    if (!ok[0] || !ok[1]) return;
    if (first) { // 처음 연 기간 = 1년(두 쪽 모두)
      const [a, z] = await Promise.all([po.evaluate(() => document.querySelector('#view .seg.seg3 button[aria-pressed="true"]')?.textContent), pn.evaluate(() => document.querySelector('#view .ppast-seg button[aria-pressed="true"]')?.textContent)]);
      if (a !== '1년' || z !== '1년') fail('처음 기간', a + ' · ' + z); first = false;
    }
    for (const [, name] of P) {
      const oldClick = () => tm.old(() => clickPer(po, '#view .seg.seg3 button', name)).catch(e => { if (RELOADED.test(String(e?.message))) return false; throw e; });
      let [ca, cb] = await Promise.all([oldClick(), tm.new(() => clickPer(pn, '#view .ppast-seg button', gloss(name)))]);
      if (!ca && cb) ca = await reopenOld(po, code).then(oldClick, () => false); // 옛 쪽만 단추가 없으면 옛 쪽을 새로 열어 한 번 더(새 쪽은 그대로 잼)
      if (!ca || !cb) { fail('기간 단추', code + ' ' + name + ' ' + ca + ' ' + cb); continue; }
      await tm.new(() => frames(pn));
      // 읽는 사이 옛 앱이 새로 고치면(끊김 · 빈 화면 · 기간이 처음 1년으로 돌아감) 다시 열고 같은 기간을 눌러 다시 읽음(두 번까지 · 그래도 안 되면 읽은 그대로 맞대어 실패로 남김)
      const pressedOld = () => po.evaluate(() => document.querySelector('#view .seg.seg3 button[aria-pressed="true"]')?.textContent?.trim() ?? null).catch(() => null);
      const oldRead = async (fn, arg, nullOk = false) => {
        for (let k = 0; ; k++) {
          let v = null, cut = false;
          try { v = await tm.old(() => po.evaluate(fn, arg)); } catch (e) { if (!RELOADED.test(String(e?.message))) throw e; cut = true; }
          if (!cut && (nullOk || v != null) && (await pressedOld()) === name) return v;
          if (k >= 2) return v;
          await reopenOld(po, code); await oldClick();
        }
      };
      const [o, n] = await Promise.all([oldRead(OLD_X).then(x => oldToNewDeep(x)), tm.new(() => pn.evaluate(NEW_X))]); // 옛 쪽 글은 이름만 새 이름으로(rename.mjs)
      compare(code, name, o, n); await nowCheck(code, name, n);
      const [to, tn] = await Promise.all([oldRead(TIPS, ['#view > .vw .lc svg', '#view > .vw .lc .tip'], true), tm.new(() => pn.evaluate(TIPS, ['#view > .ppast .ppast-lc svg', '#view > .ppast .ppast-tip']))]);
      bump('선 누르기');
      if (!to || !tn || !eq(to, tn)) fail('선을 누른 날 값', code + ' ' + name + ' 옛 ' + JSON.stringify(to).slice(0, 200) + ' · 새 ' + JSON.stringify(tn).slice(0, 200));
      const t0v = await pn.evaluate(() => document.querySelector('#view .ppast-tip')?.textContent);
      if (t0v !== '선을 누르면 그날 값이 보여요') fail('선을 놓으면 처음 글', code + ' ' + name + ' ' + t0v);
      bump('화면(기간)');
    }
  }
  // 없는 번호 · 깨진 주소 — 새 쪽은 「?」 줄과 찾기 고리(옛 쪽은 「없는 주소」)
  for (const _ of SH.part('x', ['없는 번호'], 20)) { // 몫 하나에서만(--shard)
  await pn.evaluate(() => { document.querySelector('#view > .ppast')?.setAttribute('data-stale', '1'); location.hash = '#/w/ZZZZZZ/past'; });
  await pn.waitForFunction(() => !document.querySelector('#view .boot') && !document.querySelector('#view > .ppast'), null, {timeout: 20000}).catch(() => {});
  const miss = await pn.evaluate(() => ({t: document.querySelector('#view .empty')?.textContent ?? '', a: document.querySelector('#view a.more')?.getAttribute('href') ?? ''}));
  if (miss.t !== '? 이 번호의 회사를 찾지 못했어요.' || miss.a !== '#/find') fail('없는 번호', JSON.stringify(miss));
  if (pn._errs.length) { fail('새 쪽 화면 오류', '없는 번호 ' + pn._errs.join(' | ').slice(0, 200)); pn._errs.length = 0; }
  bump('없는 번호');
  } // 없는 번호 몫 끝
  await po.context().close(); await pn.context().close();
}

/* ② 세 폭 + 아주 큰 글씨 — 새 쪽만 */
const LAYOUT = () => {
  const vw = document.documentElement.clientWidth, v = document.querySelector('#view > .ppast'); if (!v) return {err: '칸 없음'};
  for (const d of v.querySelectorAll('details')) d.open = true;
  const out = {sw: document.documentElement.scrollWidth, vw, out: [], small: [], tiny: [], svg: null, yr: []};
  for (const e of v.querySelectorAll('*')) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (e.closest('.chaps.row')) continue; // 챕터 줄은 옆으로 미는 칸 — 밀려 가려진 칩은 넘침이 아님(2026-10-17 챕터 한 줄)
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5 || r.left < -0.5) out.out.push((e.className?.baseVal ?? e.className ?? e.tagName) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    if (e.tagName.toLowerCase() !== 'svg' && e.clientWidth && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible') out.out.push('속 넘침 ' + (e.className || e.tagName) + ' ' + e.scrollWidth + '>' + e.clientWidth); // 칸 안에서 글이 옆 칸 · 여백으로 삐져나감
    const own = [...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()); // 제 글이 있는 칸만 글 크기를 잼
    if (own) { const cs = getComputedStyle(e); if (cs.visibility !== 'hidden' && parseFloat(cs.fontSize) < 16.9) out.tiny.push(e.tagName + '.' + e.className + ' ' + cs.fontSize); } // 글씨 크기 단추의 zoom 은 더 키우기만 함
  }
  for (const e of v.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push((e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  const svg = v.querySelector('.ppast-lc svg'), lc = v.querySelector('.ppast-lc');
  if (svg) {
    const r = svg.getBoundingClientRect(), z = r.width / svg.viewBox.baseVal.width, box = v.querySelector('.ppast-chart');
    out.svg = {vb: svg.viewBox.baseVal.width, cw: box.clientWidth, ratio: z, h: r.height / svg.viewBox.baseVal.height};
    const lr = lc.getBoundingClientRect(), ys = [];
    const x2 = +svg.querySelector('line[stroke-dasharray="2 4"]').getAttribute('x2'), plotR = lr.left + (x2 - 6) * z; // 그림 칸 오른쪽 끝(눈금 칸 시작)
    for (const s of lc.querySelectorAll('.ppast-yr span')) { const q = s.getBoundingClientRect(); if (q.right > lr.right + 0.5 || q.left < plotR + 1 || q.top < lr.top - 12 || q.bottom > lr.bottom + 12) out.yr.push('밖 · 그림 칸 침범 ' + s.textContent + ' ' + Math.round(q.left) + '<' + Math.round(plotR)); ys.push([q.top, q.bottom, s.textContent]); }
    ys.sort((a, b) => a[0] - b[0]); for (let i = 1; i < ys.length; i++) if (ys[i][0] < ys[i - 1][1] - 0.5) out.yr.push('겹침 ' + ys[i - 1][2] + '/' + ys[i][2]);
  }
  return out;
};
for (const [w, big] of SH.part('w', wide.length ? [[320, false], [360, false], [390, false], [320, true]] : [], 4 * wide.length, x => x.join(''))) {
  const p = await page(w, 640, big ? () => { try { localStorage.setItem('atlas:font', '2'); } catch { /* 기억 못 함 */ } } : null);
  await p.goto(base + NEXT + '#/w/' + wide[0] + '/past'); await p.waitForFunction(() => !!document.querySelector('#view > .ppast'), null, {timeout: 30000}).catch(() => fail('새 쪽 열림(폭)', w + ' ' + wide[0]));
  for (const code of wide) {
    const where = w + (big ? ' 아주 큰 글씨' : '') + ' ' + code;
    try { await goNew(p, code); } catch (e) { fail('새 쪽 열림(폭)', where + ' ' + e.message.slice(0, 80)); continue; }
    if (big && !(await p.evaluate(() => document.documentElement.classList.contains('f3')))) fail('아주 큰 글씨가 안 켜짐', where);
    for (const [, name] of P) {
      if (!(await clickPer(p, '#view .ppast-seg button', gloss(name)))) { fail('기간 단추', where + ' ' + name); continue; }
      await frames(p); await p.waitForTimeout(30); await frames(p);
      await p.evaluate(TIPS, ['#view > .ppast .ppast-lc svg', '#view > .ppast .ppast-tip']); // 긴 날 값 글도 한 번 띄워 봄
      const L = await p.evaluate(LAYOUT); const at = where + ' ' + name;
      if (L.err) { fail('폭 검사', at + ' ' + L.err); continue; }
      if (L.sw > L.vw) fail('가로 넘침', at + ' ' + L.sw + '>' + L.vw);
      for (const x of L.out.slice(0, 4)) fail('칸 밖', at + ' ' + x);
      for (const x of L.small.slice(0, 4)) fail('누르는 자리 44px 안 됨', at + ' ' + x);
      for (const x of L.tiny.slice(0, 4)) fail('글 17px 안 됨', at + ' ' + x);
      if (!L.svg || Math.abs(L.svg.vb - L.svg.cw) > 1.01) fail('그림 넓이 ≠ 칸 넓이', at + ' ' + JSON.stringify(L.svg));
      for (const x of L.yr.slice(0, 3)) fail('눈금 글', at + ' ' + x);
      bump('폭 화면');
    }
    if (p._errs.length) { fail('새 쪽 화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 300)); p._errs.length = 0; }
  }
  await p.context().close();
}
await b.close();

const sec = Math.round((Date.now() - t0) / 1000);
const res = {made: new Date().toISOString(), base, path: NEXT, mode: ALL ? 'all' : LIMIT ? 'limit ' + LIMIT : 'sample', companies: list.length, wide, ...SH.info(), counts, fails, warn: warn.slice(0, 50), sec, time: tm.get(), net: netSummary()};
console.log(JSON.stringify({time: res.time, net: res.net})); // 옛 쪽 · 새 쪽 여는 데 쓴 초 · 다시 받은 수(명령문 [1] 9)
if (OUT) await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(res, null, 1) + '\n');
console.log(`4단 지나온 길 맞대기 — 회사 ${counts['회사'] || 0}곳 · 기간 화면 ${counts['화면(기간)'] || 0} · 맞댄 칸 ${counts['맞댄 칸'] || 0} · 숫자 낱말 ${counts['숫자 낱말'] || 0} · 선 누르기 ${counts['선 누르기'] || 0} · 폭 화면 ${counts['폭 화면'] || 0}(세 폭 + 아주 큰 글씨 × ${wide.length}곳) · ${sec}초`);
if (warn.length) console.log('알림(옛 쪽):', warn.length, warn.slice(0, 3).join(' / '));
if (fails.length) { console.log('실패', counts.fail); for (const [k, x] of fails.slice(0, 40)) console.log(' ✗', k, '—', x); process.exit(1); }
console.log('실패 0');

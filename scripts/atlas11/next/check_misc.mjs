// 새 아틀란스(/next/) 쪽 다섯 맞대기 — 이야기(#/talk) · 업데이트 기록(#/up) · 봉인(#/time) · 도움말(#/info) · 밖 칸(#/x/<번호>)
//   사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」 · 규칙 74
//   쓰는 법: node scripts/atlas11/next/check_misc.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--all | --limit N] [--out 파일]
//   ① 옛 쪽(/atlas/#/…)과 새 쪽(/next/?dev=1#/…)을 같은 자료로 열어 — 옛 쪽의 모든 줄(접은 칸 글 포함 · 「?」 줄 · 정직 글 · 출처 줄)이 새 쪽에 글자 그대로 있는지 ·
//      숫자 낱말이 빠짐없는지 · 고리(새 주소로 바꾼 것 · 밖 고리의 새 창 · rel)가 같은지 · 남의 말(data-proper)이 같은지 · 깔때기 멈춘 줄이 같은지
//      (옛 쪽 맨 아래 「… 매수 · 매도 …」 글은 쓰지 않을 말이라 새 안전 문장 두 줄이 있어야 함)
//   ② 자료를 바꿔치기한 길 — talk.json · mkt.json · home.json · surge.json 못 받음 · 지수 받은 값 · 급등 기록 · 실패 회차 · 빈 기록 · 봉인 0거래일 · 봉인 없음 · 장 중 값 · co7 없음 — 옛 쪽 · 새 쪽 함께 맞댐
//   ③ 새 쪽만 — 자료 파일(core · updates · time · names)을 못 받으면 「?」 줄 · 화면 오류 없음
//   ④ 세 폭(320 · 360 · 390) + 320 폭 「아주 크게」 글씨(zoom) — 가로 넘침 0 · 봉인 그림 눈금 글 = 눈금선 높이 · 글 17px 넘게 · 누르는 자리 44px 넘게 · 화면 오류 0 · 쓰지 않을 말 0(남의 말 밖) · 캔버스 0 · 접은 칸을 펼쳐도 넘침 0
//   ⑤ 밖 칸 — 회사 주식이 아닌 번호(기본 갈래마다 둘 · --limit N · --all 모두) · 회사 주식 번호는 보는 화면(#/w/) · 없는 번호는 「?」 · 번호 없음은 도움말과 같은 글
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNew, SAFE_LINE} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fourDeep} from '../../../site/next/essence.js'; // 「하루 4번」 글 → 참인 말(사장님 2026-10-18 16:39 [5] 4 · 일꾼 KC — 새 쪽은 요약의 fourADay 일 때만 「하루 4번」 · 옛 쪽 글을 같은 표로 맞춰 맞댐)
import {fetchJSON, stylesReady, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 모양 파일 기다림 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const ALL = argv.includes('--all'), LIMIT = Number(arg('--limit', '0')) || 0, OUT = arg('--out', null);
const ONLY = new Set(String(arg('--only', 'talk,up,time,info,x')).split(',')); // 고치는 동안 빨리(예: --only time,x) — 마지막엔 모두
const on = pg => ONLY.has(pg);
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, x]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 자료 — 시험 서버에서 그대로(바꿔치기 길의 바탕) */
const getJ = f => fetchJSON(base + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, names, updates, time, home, surge, talk] = await Promise.all(['/atlas/data/core.json', '/atlas/data/mkt.json', '/atlas/data/names.json', '/atlas/data/updates.json', '/atlas/data/time.json', '/atlas/data/home.json', '/atlas/data/surge.json', '/atlas/talk.json']
  .map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !names || !updates || !time || !talk) { console.error('자료를 못 받음', fails); process.exit(1); }
const SUMJ = await fetchJSON(base + '/next/data/home-summary.json', 'home-summary.json').catch(() => null); // 첫 화면 요약(fourADay — 못 받으면 새 쪽도 참인 말 · 일꾼 KC)
const clone = x => JSON.parse(JSON.stringify(x));

/* 쓰지 않을 말(규칙 72 ⑥ · next_check.mjs 와 같은 목록) + 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT) */
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
if (!OLD36.length) { console.error('OLD36_TEXT 를 못 읽음'); process.exit(1); }
const BANNED = ['추천', '매수', '매도', '사라', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36]; // 「사라」 = 일꾼 안내 목록(남의 말 밖에서만 셈)

/* 글 맞대기 — 붙임 띄어쓰기(NBSP) · 보이지 않는 이음표(U+2060)는 빼고 봄 */
const norm = s => String(s ?? '').replace(/[  ]/g, ' ').replace(/[⁠​­]/g, '').replace(/\s+/g, ' ').trim();
const SKIP = new Set(['닫기']); // 옛 판(시트)의 닫기 단추 — 새 화면은 보통 쪽(뒤로 가기)
const DISCLAIMER = /^저는 투자 상담사가 아닙니다/; // 옛 맨 아래 글 — 「매수 · 매도」가 쓰지 않을 말이라 새 안전 문장으로 바꿈
const SAFE_NEW = [SAFE_LINE, '투자 상담이 아니에요. 지난 기록을 센 공부예요.']; // SAFE_LINE = 「보드리는 지난 기록만 보여 줘요. …」(rename.mjs)
// 옛 쪽 글은 이름만 새 이름으로 고쳐 맞댐(아틀란스 · ATLAS → 보드리 · 「ATLAS 는 어떻게 셌나요」 → 「보드리는 어떻게 셌나요」) — 원문 기록(업데이트 까닭 · 남의 글)은 두 쪽 모두 글자 그대로라 바꾸지 않음
const KEEP = [...(updates?.records ?? []).map(r => r.reason), ...(updates?.records ?? []).map(r => r.why)].filter(Boolean);
const mapHref = h => { // 옛 주소 → 새 주소(안내 「새 주소로 바꿀 것」)
  let m;
  if ((m = /^#\/c\/([^/]+)(\/(?:past|rivals|grow|range))?$/.exec(h))) return '#/w/' + m[1] + (m[2] || '');
  if ((m = /^#\/g\/(.+)$/.exec(h))) return '#/ch/g/' + m[1];
  if ((m = /^#\/i\/(.+)$/.exec(h))) return '#/ch/i/' + m[1];
  if (h === '#/list') return '#/f/ind';
  return h;
};
function compare(tag, O0, N) {
  if (!O0 || !N) { fail('맞댈 화면 없음', tag); return; }
  const O = {...O0, text: fourDeep(oldToNew(O0.text, [...KEEP, ...O0.proper]), SUMJ)}; // 고리 · 남의 글(data-proper)은 그대로 맞댐 · 「하루 4번」 글은 새 쪽과 같은 표로(fourDeep · 일꾼 KC)
  bump('맞댄 화면');
  const nt = norm(N.text);
  let lines = 0;
  for (const raw of O.text.split('\n')) {
    const l = norm(raw);
    if (!l || !/[0-9A-Za-z가-힣?!]/.test(l) || SKIP.has(l)) continue; // 「›」 「♪」 같은 꾸밈 글자
    if (DISCLAIMER.test(l)) { for (const s of SAFE_NEW) if (!nt.includes(s)) fail('안전 문장 없음', `${tag}: ${s}`); continue; }
    lines++;
    if (!nt.includes(l)) fail('옛 줄 빠짐', `${tag}: ${l.slice(0, 160)}`);
  }
  bump('맞댄 줄', lines);
  const toks = s => new Set(norm(s).match(/[+−]?\d(?:[\d,.:]*\d)?%?/g) || []);
  const nk = toks(N.text); let nn = 0;
  for (const t of toks(O.text)) { nn++; if (!nk.has(t)) fail('숫자 빠짐', `${tag}: ${t}`); }
  bump('맞댄 숫자 낱말', nn);
  const nl = new Map(N.links.map(a => [a.href, a]));
  for (const a of O.links) {
    const w = mapHref(a.href), b = nl.get(w); bump('맞댄 고리');
    if (!b) { fail('고리 빠짐', `${tag}: ${a.href} → ${w}`); continue; }
    if (/^https?:/.test(w) && (b.target !== a.target || b.rel !== a.rel)) fail('밖 고리 속성', `${tag}: ${w} target=${b.target} rel=${b.rel}`);
  }
  const np = new Set(N.proper);
  for (const x of O.proper) { bump('맞댄 남의 말'); if (!np.has(x)) fail('남의 말 빠짐', `${tag}: ${x.slice(0, 60)}`); }
  if (O.proper.length !== N.proper.length) fail('남의 말 수', `${tag}: 옛 ${O.proper.length} · 새 ${N.proper.length}`);
  if (O.stops !== N.stops) fail('깔때기 멈춘 줄 수', `${tag}: 옛 ${O.stops} · 새 ${N.stops}`);
}

/* 브라우저 — 한 번에 하나(기계가 작음) */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function newPage(width, routes = {}, {font = 0} = {}) {
  const ctx = await browser.newContext({viewport: {width, height: 800}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (font) await ctx.addInitScript(k => { try { localStorage.setItem('atlas:font', String(k)); } catch { /* 기억 못 함 */ } }, font); // 글씨 크기(app.js atlas:font · 2 = 아주 크게 = #view zoom)
  for (const [file, how] of Object.entries(routes)) await ctx.route('**' + file, r => (how === 404 ? r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}) : r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(how)})));
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
const closePage = p => p.context().close();
const GRAB = sel => {
  const root = document.querySelector(sel); if (!root) return null;
  for (const d of root.querySelectorAll('details')) d.open = true; // 접은 칸 글도
  return {text: root.innerText, links: [...root.querySelectorAll('a[href]')].map(a => ({href: a.getAttribute('href'), target: a.getAttribute('target') || '', rel: a.getAttribute('rel') || ''})),
    proper: [...root.querySelectorAll('[data-proper]')].map(e => e.textContent.trim()), stops: root.querySelectorAll('li.stop').length};
};
const SHEET = h => h.startsWith('#/info') || h.startsWith('#/x/');
/** 옛 쪽 — 쪽(#view 맨 아래 footer 까지) · 판(#infoSheet — 도움말 · 밖 칸) */
async function openOld(p, hash, opt = {}) { return tm.old(() => openOld0(p, hash, opt)); } // 여는 데 쓴 때(옛 쪽)
async function openOld0(p, hash, {nav = false} = {}) {
  if (nav) {
    await p.evaluate(h => { const b = document.querySelector('#infoBody'); if (b) b.textContent = ''; location.hash = h; }, hash);
  } else await p.goto(base + '/atlas/' + hash, {waitUntil: 'domcontentloaded'});
  if (SHEET(hash)) await p.waitForFunction(() => { const s = document.querySelector('#infoSheet'); return s && !s.hidden && document.querySelector('#infoBody')?.childElementCount > 0; }, null, {timeout: 20000});
  else await p.waitForFunction(() => !!document.querySelector('#view footer.foot') && !document.querySelector('#view .boot'), null, {timeout: 20000});
  return p.evaluate(GRAB, SHEET(hash) ? '#infoSheet' : '#view');
}
/** 새 쪽 — 내 쪽 칸(data-page · 밖 칸은 data-arg 까지) 또는 「?」 빈 칸 · 넓이를 안 뒤 그리는 그림까지 */
async function settleNew(p, pg, a = null) {
  await p.waitForFunction(([pg, a]) => { const v = document.querySelector('#view'); if (!v || v.querySelector('.boot')) return false; const r = v.querySelector(`[data-page="${pg}"]`); if (r && a != null && r.getAttribute('data-arg') !== a) return false; return !!r || !!v.querySelector('.empty'); }, [pg, a], {timeout: 20000});
  await p.waitForFunction(() => [...document.querySelectorAll('#view .pup-chart, #view .ptime-chart')].every(e => e.querySelector('svg')), null, {timeout: 6000}).catch(() => fail('그림 안 그려짐', pg + (a ? ' ' + a : '')));
}
async function openNew(p, hash, pg, a = null, opt = {}) { return tm.new(() => openNew0(p, hash, pg, a, opt)); } // 여는 데 쓴 때(새 쪽)
async function openNew0(p, hash, pg, a = null, {nav = false} = {}) {
  if (nav) await p.evaluate(h => { location.hash = h; }, hash);
  else await p.goto(base + '/next/?dev=1' + hash, {waitUntil: 'domcontentloaded'});
  await settleNew(p, pg, a);
  { const miss = await stylesReady(p); if (miss.length) fail('모양 파일 안 붙음', hash + ' ' + miss.join(' ')); } // 쪽 모듈 .css 가 붙은 뒤에 잼(실제 사이트 #/info 누르는 자리 23px 일 · 2026-10-17)
  return p.evaluate(GRAB, '#view');
}
const realErrs = p => p._errs.filter(e => !/Failed to load resource/.test(e));

/* ① 같은 자료로 옛 쪽 · 새 쪽 — 쪽 넷 */
const PAGES = [['#/talk', 'talk'], ['#/up', 'up'], ['#/time', 'time'], ['#/info', 'info']].filter(([, pg]) => on(pg));
if (PAGES.length) {
  const po = await newPage(390), pn = await newPage(390);
  for (const [hash, pg] of PAGES) {
    try { const O = await openOld(po, hash), N = await openNew(pn, hash, pg); compare(pg, O, N); }
    catch (e) { fail('맞대기 멈춤', `${pg}: ${e.message.split('\n')[0]}`); }
  }
  // 쪽마다 따로 맞대 보는 것(옛 쪽 셈과 따로 · 자료에서 바로)
  try {
    if (on('up')) {
      await openNew(pn, '#/up', 'up');
      const nLi = await pn.evaluate(() => document.querySelectorAll('#view li.pup-r').length);
      if (nLi !== updates.records.length) fail('업데이트 회차 수', `새 ${nLi} · 자료 ${updates.records.length}`); else bump('업데이트 회차', nLi);
    }
    if (on('talk')) {
      await openNew(pn, '#/talk', 'talk');
      const yt = await pn.evaluate(() => [...document.querySelectorAll('#view ul.ptalk-yt a')].map(a => [a.getAttribute('href'), a.target, a.rel]));
      if (yt.length !== talk.youtube.length) fail('유튜브 수', `새 ${yt.length} · 자료 ${talk.youtube.length}`);
      for (const [href, tg, rel] of yt) if (!/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/.test(href) || tg !== '_blank' || rel !== 'noopener noreferrer') fail('유튜브 고리', href);
      const qn = await pn.evaluate(() => document.querySelectorAll('#view figure.ptalk-qt').length);
      if (qn !== talk.maxims.length + 1) fail('격언 수', `새 ${qn} · 자료 ${talk.maxims.length} + 그날 하나`);
    }
    if (realErrs(pn).length) fail('화면 오류(새)', realErrs(pn).slice(0, 3).join(' | '));
    if (realErrs(po).length) bump('옛 쪽 화면 오류(참고 · 실패 아님)', realErrs(po).length);
  } catch (e) { fail('따로 맞대기 멈춤', e.message.split('\n')[0]); }
  await closePage(po); await closePage(pn);
}

/* ⑤ 밖 칸 — 회사 주식이 아닌 번호 · 없는 번호 · 회사 주식 번호 · 번호 없음 */
const nonCo = names.rows.filter(r => r.k && !mkt.companies[r.c]);
const byKind = new Map(); for (const r of nonCo) { if (!byKind.has(r.k)) byKind.set(r.k, []); byKind.get(r.k).push(r); }
let xCodes = ALL ? nonCo.map(r => r.c) : LIMIT ? [] : [...byKind.values()].flatMap(xs => xs.slice(0, 2).map(r => r.c));
if (!ALL && LIMIT) { const ks = [...byKind.values()]; for (let i = 0; xCodes.length < Math.min(LIMIT, nonCo.length); i++) for (const xs of ks) if (xs[i] && xCodes.length < LIMIT) xCodes.push(xs[i].c); }
const coCode = mkt.companies['005930'] ? '005930' : Object.keys(mkt.companies).sort()[0]; // 업종에 회사가 여럿인 회사(옛 쪽 1곳뿐 업종 고리는 회사로 감)
if (on('x')) {
  const po = await newPage(390), pn = await newPage(390);
  try {
    let k = 0;
    for (const c of [...xCodes, 'ZZZZZZ']) {
      try {
        const nav = k++ > 0; // 첫 번호는 새로 엶 · 그 뒤는 주소만 바꿈(같은 주소면 hashchange 가 없음)
        const O = await openOld(po, '#/x/' + c, {nav}), N = await openNew(pn, '#/x/' + c, 'x', c, {nav});
        compare('x/' + c, O, N); bump('밖 칸 번호');
        if (c === 'ZZZZZZ' && !/\? 이 이름표를 못 찾았습니다/.test(N.text)) fail('없는 번호 「?」', c);
        if (c !== 'ZZZZZZ') { const r = names.rows.find(x => x.c === c), want = core.funnel.groups.filter(g => (g.k === 'mg' ? r.sm : r.sl)).length; if (N.stops !== want) fail('멈춘 줄(자료에서 셈)', `${c}: 새 ${N.stops} · 자료 ${want}`); }
      } catch (e) { fail('밖 칸 멈춤', `${c}: ${e.message.split('\n')[0]}`); }
    }
    if (realErrs(pn).length) fail('화면 오류(새 · 밖 칸)', realErrs(pn).slice(0, 3).join(' | '));
    // 번호 없음(#/x/) — 옛 쪽은 도움말 판 · 새 쪽은 #/info 로
    { const O = await openOld(po, '#/x/', {nav: true}); await pn.evaluate(() => { location.hash = '#/x/'; }); await pn.waitForFunction(() => location.hash === '#/info', null, {timeout: 10000}).catch(() => fail('번호 없음 → #/info', 'x/'));
      await settleNew(pn, 'info'); compare('x/(번호 없음)', O, await pn.evaluate(GRAB, '#view')); }
    // 회사 주식 번호 — 옛 쪽은 #/c/ · 새 쪽은 보는 화면 #/w/
    await pn.evaluate(c => { location.hash = '#/x/' + c; }, coCode);
    await pn.waitForFunction(c => location.hash === '#/w/' + c, coCode, {timeout: 10000}).then(() => bump('회사 번호 → 보는 화면')).catch(() => fail('회사 번호 → #/w/', coCode));
    await po.evaluate(c => { location.hash = '#/x/' + c; }, coCode);
    await po.waitForFunction(c => location.hash === '#/c/' + c, coCode, {timeout: 10000}).catch(() => bump('옛 쪽 회사 번호가 #/c/ 로 안 감(참고)'));
  } catch (e) { fail('밖 칸 맞대기 멈춤', e.message.split('\n')[0]); }
  await closePage(po); await closePage(pn);
}

/* 새 쪽 모양 재기(④ 세 폭 · ② 바꿔치기 · ③ 못 받음에서 함께) — 접은 칸을 펼친 채로 잼 */
const SCAN = () => {
  const vw = document.documentElement.clientWidth, view = document.querySelector('#view');
  for (const d of view.querySelectorAll('details')) d.open = true;
  const desc = e => (e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」');
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: view.querySelectorAll('canvas').length, text: ''};
  for (const e of view.querySelectorAll('*')) {
    if (e.ownerSVGElement) continue; // 그림 속 조각은 그림 칸(svg)으로 잼
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of view.querySelectorAll('a[href], button, summary')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  const c = view.cloneNode(true); for (const x of c.querySelectorAll('[data-proper]')) x.remove(); out.text = c.textContent;
  return out;
};
async function layout(pn, tag) {
  const s = await pn.evaluate(SCAN);
  if (s.sw > s.vw) fail('가로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  for (const b of BANNED) if (s.text.includes(b)) fail('쓰지 않을 말', `${tag} 「${b}」`);
}

/* ② 자료를 바꿔치기한 길 — 옛 쪽 · 새 쪽을 같은 바꾼 자료로 */
const VAR = [];
VAR.push(['talk · talk.json 못 받음', '#/talk', 'talk', {'/atlas/talk.json': 404}]);
VAR.push(['talk · mkt.json 못 받음', '#/talk', 'talk', {'/atlas/data/mkt.json': 404}]);
VAR.push(['talk · home · surge 못 받음', '#/talk', 'talk', {'/atlas/data/home.json': 404, '/atlas/data/surge.json': 404}]);
if (home) { const H = clone(home); delete H.stale; VAR.push(['talk · 지수 받은 값(3달 꼭대기와 바닥)', '#/talk', 'talk', {'/atlas/data/home.json': H}]); }
{ // 업데이트 기록 — 급등 기록 다섯 꼴 · 실패 회차 · 새 값 없는 회차 · 네 눈 걸림 · 모든 회사 1등 갈래 · 시장 판독 없음
  const U = clone(updates), R = U.records, inF = [{c: '000001', n: '가나다'}, {c: '000002', n: '라마바'}];
  R[0].surge = {kind: 'first', n: 36, bands: {kind: 'first'}};
  if (R[1]) Object.assign(R[1], {result: '실패', why: '네 눈 점검에 걸려 앞 자료 그대로', surge: {kind: 'fail', why: '자료 문 다섯 가운데 하나가 막힘'}});
  if (R[2]) Object.assign(R[2], {result: '그대로', asOf: null, why: '새 종가 없음(장이 쉼)', surge: {kind: 'pick', in: inF, out: [inF[0]], n: 35, bands: {kind: 'pick', in: 2, out: 1, move: 3}}});
  if (R[3]) Object.assign(R[3], {inspect: {nEach: 10000000, fail: 3, lenses: [{name: '애플', fail: 0}, {name: '구글', fail: 3}, {name: '클로드', fail: 0}, {name: 'CIA', fail: 0}]}, surge: {kind: 'pick', in: [], out: [], n: 30, published: false}});
  if (R[4]) Object.assign(R[4], {top: {...(R[4].top || {short: '반도체', chg: 1.23}), scope: 'mkt'}, surge: {kind: 'carry'}});
  R[0].inspect = {nEach: 10000000, fail: 1, lenses: [{name: '애플', fail: 1}, {name: '구글', fail: 0}, {name: '클로드', fail: 0}, {name: 'CIA', fail: 0}]};
  VAR.push(['up · 급등 · 실패 · 네 눈 걸림', '#/up', 'up', {'/atlas/data/updates.json': U}]);
  const U2 = clone(updates); U2.records[0].market = null; VAR.push(['up · 시장 판독 없음', '#/up', 'up', {'/atlas/data/updates.json': U2}]);
  VAR.push(['up · 기록 없음', '#/up', 'up', {'/atlas/data/updates.json': {...clone(updates), records: [], n: 0}}]);
}
{ // 봉인 — 0거래일 · 지금 규칙 · 앞 값 쓴 곳 / 봉인 없음
  const T = clone(time), K = T.capsules[0];
  K.since = {dates: [K.seal], days: 0, v365: [100], vpool: [100], chg365: null, chgPool: null, have365: 365, havePool: 1300, stale365: 0, stalePool: 0}; K.version = core.rules.version;
  VAR.push(['time · 봉인 뒤 0거래일', '#/time', 'time', {'/atlas/data/time.json': T}]);
  const T2 = clone(time); T2.capsules[0].since.stale365 = 4; VAR.push(['time · 마지막 날 값 없는 곳', '#/time', 'time', {'/atlas/data/time.json': T2}]);
  VAR.push(['time · 봉인 없음', '#/time', 'time', {'/atlas/data/time.json': {...clone(time), capsules: []}}]);
}
{ // 장 중 값 · 고른 뒤 기록 · 「?」 수 없음 — 맨 아래 「?」 줄 · 도움말 「?」 줄
  const C = clone(core); Object.assign(C, {provisional: true, sincePick: 3}); C.funnel.q = 0; if (C.grow) delete C.grow;
  for (const [hash, pg] of PAGES) VAR.push([`${pg} · 장 중 값 · 고른 뒤 3거래일`, hash, pg, {'/atlas/data/core.json': C}]);
  const C2 = clone(core); C2.co7 = 0; VAR.push(['x · co7 없음(회사 번호도 밖 칸)', '#/x/' + coCode, 'x', {'/atlas/data/core.json': C2}, coCode]);
}
for (const [tag, hash, pg, routes, a] of VAR) {
  if (!on(pg)) continue;
  const po = await newPage(390, routes), pn = await newPage(320, routes); // 새 쪽은 가장 좁은 폭(320)으로 — 글은 폭과 상관없음
  try { const O = await openOld(po, hash), N = await openNew(pn, hash, pg, a ?? null); compare('바꿔치기 ' + tag, O, N); bump('바꿔치기 길'); await layout(pn, '320 바꿔치기 ' + tag);
    if (realErrs(pn).length) fail('화면 오류(새 · 바꿔치기)', `${tag}: ${realErrs(pn).slice(0, 2).join(' | ')}`); }
  catch (e) { fail('바꿔치기 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await closePage(po); await closePage(pn);
}

/* ③ 새 쪽만 — 자료 파일을 못 받으면 「?」 줄 · 멈추지 않음(옛 쪽은 「자료를 못 읽었습니다」 · 시트는 「? 이 이름표를 못 찾았습니다」) */
for (const [tag, hash, pg, file, a] of [['up · updates.json', '#/up', 'up', 'updates.json'], ['time · time.json', '#/time', 'time', 'time.json'], ['x · names.json', '#/x/' + xCodes[0], 'x', 'names.json', xCodes[0]],
  ['info · core.json', '#/info', 'info', 'core.json'], ['talk · core.json', '#/talk', 'talk', 'core.json'], ['x · core.json', '#/x/' + xCodes[0], 'x', 'core.json']]) {
  if (!on(pg)) continue;
  const pn = await newPage(360, {['/atlas/data/' + file]: 404});
  try { const N = await openNew(pn, hash, pg, a ?? null); bump('못 받은 길'); await layout(pn, '360 못 받음 ' + tag);
    if (!N.text.split('\n').some(l => norm(l).startsWith('?'))) fail('못 받음 「?」 줄 없음', tag);
    if (realErrs(pn).length) fail('화면 오류(새 · 못 받음)', `${tag}: ${realErrs(pn).slice(0, 2).join(' | ')}`); }
  catch (e) { fail('못 받은 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await closePage(pn);
}

/* ④ 세 폭 — 쪽 넷 + 밖 칸 열 곳까지 · 넷째 판 = 320 폭 「아주 크게」 글씨(#view zoom 1.286) */
for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) {
  const pn = await newPage(w, {}, {font});
  const list = [...PAGES.map(([hash, pg]) => [hash, pg, null]), ...(on('x') ? xCodes.slice(0, 10).map(c => ['#/x/' + c, 'x', c]) : [])];
  let first = true;
  for (const [hash, pg, a] of list) {
    try {
      pn._errs = [];
      await openNew(pn, hash, pg, a, {nav: !first}); first = false;
      const tag = `${w}${font ? ' 아주 크게' : ''} ${hash}`; await layout(pn, tag); bump(font ? '아주 크게 화면' : '세 폭 화면');
      if (font && !(await pn.evaluate(() => document.documentElement.classList.contains('f3')))) fail('글씨 「아주 크게」가 안 걸림', tag);
      if (pg === 'time') { // 봉인 그림 — 눈금 글(100)의 가운데가 기준 점선과 같은 높이(그림이 줄거나 zoom 이어도)
        const d = await pn.evaluate(() => { const lab = [...document.querySelectorAll('#view .ptime-yr span')].find(x => x.textContent === '100'), ln = document.querySelector('#view .ptime-tc svg line[stroke-dasharray="2 4"]'); if (!lab || !ln) return null; const a = lab.getBoundingClientRect(), b = ln.getBoundingClientRect(); return Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)); });
        if (d == null || d > 3) fail('눈금 글 자리', `${tag}: ${d}`); else bump('눈금 글 자리 맞음'); }
      if (realErrs(pn).length) fail('화면 오류(새)', `${tag}: ${realErrs(pn).slice(0, 2).join(' | ')}`);
    } catch (e) { fail('세 폭 멈춤', `${w} ${hash}: ${e.message.split('\n')[0]}`); }
  }
  await closePage(pn);
}

await browser.close();
const res = {when: new Date().toISOString(), base, sec: Math.round((Date.now() - t0) / 1000), xCodes: xCodes.length, all: ALL, time: tm.get(), net: netSummary(), counts, fails};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1)); }
console.log(JSON.stringify({sec: res.sec, xCodes: res.xCodes, time: res.time, net: res.net, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');

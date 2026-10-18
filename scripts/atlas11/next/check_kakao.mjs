#!/usr/bin/env node
/* 카톡 줄 검사(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [6] 1 · 6 · 8 · 일꾼 KB2) — 종목이 나오는 줄 · 카드마다 같은 카톡 단추 하나
   단추 = site/next/share-btn.js shareButtons(o, {kakao: true}) 하나(button.kk-btn[data-kk][data-kind]) · 줄 = 그 단추와 종목 고리를 형제로 둔 칸([data-kkrow="<곳>"])
   쓰는 법: node scripts/atlas11/next/check_kakao.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--all] [--limit N] [--shard k/n] [--out 결과.json]
            [--w 360,320,390] [--path /next/?dev=1] [--no-click] [--routes '#/cal,#/f/surge'](고치는 동안 · 문을 못 지남)
     기본(작은 범위) = 곳마다 길 하나(칩 셋 · 급등 다섯 칸 · 달력 · 종목 파일 · 조건 · 오늘 시장 · 이야기 · 관심 · 보유종목 · 매매일지 · 골똘이 칸 · 첫 화면 · 시황 · 찾기 ·
                       업종 하나 · 큰 업종 하나 · 회사 하나와 그 4 ~ 7단 · 봉인 · 도움말 · 업데이트 · 밖 칸) · 세 폭(360 · 320 · 390)
     --all = 기본 + 업종 77 · 큰 업종 10 모두 + 업종마다 첫 회사 화면 + 고른 곳 모두의 5단(다른 회사 막대) + 찾기 셋 · --limit N = 업종 · 회사 길 N 개까지(run_all --quick)
     --shard k/n = 길을 n 몫으로 가름(shard/part.mjs · 모으기 shard/merge.mjs)
   보는 것(길마다 · 폭마다 · 접은 칸도 펼친 뒤):
     ① 종목 줄 수 = 카톡 단추 수 · 줄마다 단추 정확히 1 · 단추는 모두 줄 안 · 단추가 고리(a) 안 0 · 줄 안에 줄 0
     ② 줄마다 종목 고리(회사 #/w/<번호>[/4 ~ 7단] · 종목 파일 #/cal/<번호>) 정확히 1 · 고리 번호 = 단추 번호 — 줄 = 회사 · 단추 = 보내기(엉키지 않음)
        (매매일지 기록 줄 why.rec 은 고리 없이 이름 글 — 이름이 줄 글에 있는지만 봄)
     ③ 줄 밖 종목 고리 0 — 아래 뺀 꼴(SKIP · 까닭과 수를 결과 counts.skipped 에) 밖 = 「종목 고리 수 = 카톡 단추 수」
     ④ kind — 급등 칩(#/f/surge) · 급등 다섯 칸 · 달력 · 소식(뽑힘 · 옮김 · 빠짐) = surge(받는 카드에 반값 한 줄 [6] 8) · 그 밖 = share
     ⑤ 보이는 줄: 단추 44 × 44px 이상 · 단추 오른쪽 끝 ≥ 줄 오른쪽 끝 − 24px · 단추 오른쪽에 다른 칸 0 · 단추가 화면 안 · 쪽 가로 넘침 0
     ⑥ 누름(길마다 한 번 · 첫 폭 · --no-click 이면 안 함): 카톡 단추 → 글상자(.ps-dlg) 열림 · 이름이 글상자에 · 주소(#) 그대로 → 닫으면 주소 · 자리 그대로 /
        줄 고리 → 그 종목 길로 감(그리는 중 누름은 끝으로 감는 화면이 있어 한 번 더 누름)
   끝 코드: 0 = 실패 0 · 1 = 실패 있음 · 2 = 검사를 못 함(브라우저 · 서버 · 자료) */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {shardOf} from './shard/part.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const has = k => argv.includes(k);
const BASE = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), PATH = arg('--path', '/next/?dev=1');
const ALL = has('--all'), LIMIT = Number(arg('--limit', 0)) || 0, CLICK = !has('--no-click'), OUT = arg('--out', null);
const WIDTHS = String(arg('--w', '360,320,390')).split(',').map(Number).filter(w => w >= 280 && w <= 1600);
const ONLY = arg('--routes', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
const PW = arg('--pw', process.env.PW_DIR || '/opt/node-tools/');
const SH = shardOf(argv);
const T0 = Date.now();

/* 곳 이름 — 줄을 그리는 함수(KB2 · accept/KB2.md 곳 수 표) · 모르는 곳이 나오면 경고(표를 고침) */
const KNOWN = ['chip.card', 'chip.row', 'watch.next', 'ch.grid', 'sub.co', 'me.hist', 'find.co', 'cal.row', 'cal.ev', 'cal.alert', 'cal.gone', 'chx.row', 'cond.row', 'cond.q',
  'gdr.card', 'hold.card', 'hold.news', 'rivals.peer', 'surge.board', 'surge.row', 'surge.track', 'surge.gone', 'talk.card', 'talk.fact', 'today.mv', 'why.rec'];
const SURGE_PLACES = new Set(['surge.board', 'surge.row', 'surge.track', 'surge.gone', 'cal.row', 'cal.ev', 'cal.alert', 'cal.gone']);
const NOLINK = new Set(['why.rec']); // 고리 없이 이름 글만 있는 줄(기록 줄 — 누르면 회사로 가지 않음)
/* 뺀 꼴 — 종목 고리지만 줄 · 카드가 아님(까닭) · 차례대로 맞춤 */
const SKIP = [
  ['.chaps a, nav.wpath a, a.chap-next, nav.wtabs a, a.pco-next', '7단 길 고리 — 그 회사 쪽끼리 오가는 길(줄 · 카드 아님)'],
  ['a.pcal-btn, a.pcal-back', '종목 파일 쪽의 길 단추 「회사 보기 ›」(쪽 자체가 그 종목)'],
  ['a.pchx-chip', '고른 곳 이름 알약(줄 · 카드 아님 · 누르면 회사)'],
  ['a.pchx-inl', '글 속 이름(선을 못 그린 회사 — 문장 안)'],
  ['.psurge-nl a.psurge-inl', '그날 들고 난 이름 목록(이름 글 — 줄 · 카드 아님)'],
  ['a.ps-link', '친구가 연 쪽 「이 회사 자세히 보기」(그 쪽 보내기는 「나도 보내기」 · KB1)'],
  ['[data-kkskip]', '업종 줄(회사가 하나뿐인 업종 — 고리가 그 회사)'],
];

let chromium;
try { ({chromium} = createRequire(PW.endsWith('/') ? PW : PW + '/')('playwright')); } catch (e) { console.error('playwright 를 못 받음 —', PW, e.message); process.exit(2); }

/* 자료 — 길 목록을 만듦(업종 · 큰 업종 · 회사 · 급등 · 종목 파일 · 밖 칸) */
const getJ = async u => { try { const r = await fetch(BASE + u, {cache: 'no-store'}); return r.ok ? await r.json() : null; } catch { return null; } };
const [core, mkt, surge, tr, names] = await Promise.all(['core', 'mkt', 'surge', 'surgetr', 'names'].map(n => getJ('/atlas/data/' + n + '.json')));
if (!core?.industries || !mkt?.companies) { console.error('자료(core · mkt)를 못 받음 —', BASE); process.exit(2); }
const CO = mkt.companies, codes = Object.keys(CO);
const pick1 = ['005930', ...codes].find(c => CO[c]), picked = codes.filter(c => CO[c].p);
const ind1 = core.industries.find(i => (i.members || []).length >= 3) ?? core.industries[0];
const grp1 = core.groups?.[0];
const sm = (surge?.members ?? []).map(m => m.c).filter(c => CO[c]);
const hide1 = sm.at(-1) ?? null; // 급등 · 달력의 「숨긴 곳」 줄을 보이려고 하나 숨김(이 검사 칸 안에서만)
const case1 = tr?.cases?.[0]?.[0] ?? null, x1 = names?.rows?.find(r => !CO[r.c])?.c ?? null;
const enc = encodeURIComponent;
const routes = [];
const add = r => { if (r && !routes.includes(r)) routes.push(r); };
for (const r of ['#/f/surge', '#/f/lead', '#/f/pick', '#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40', '#/cal', case1 ? '#/cal/' + case1 : null, '#/cond', '#/today', '#/talk',
  '#/sub', '#/me', '#/why', '#/gdr', '#/', '#/shorts', '#/find/' + enc(CO[pick1].n.slice(0, 2)), '#/ch/i/' + enc(ind1.name), grp1 ? '#/ch/g/' + enc(grp1.id) : null,
  '#/w/' + pick1, ...['past', 'rivals', 'grow', 'range'].map(k => '#/w/' + pick1 + '/' + k), '#/time', '#/info', '#/up', x1 ? '#/x/' + x1 : null]) add(r);
if (ALL || LIMIT) {
  const cut = xs => (LIMIT ? xs.slice(0, LIMIT) : xs);
  for (const i of cut(core.industries)) add('#/ch/i/' + enc(i.name));
  for (const g of cut(core.groups ?? [])) add('#/ch/g/' + enc(g.id));
  for (const i of cut(core.industries)) { const c = (i.members || []).find(m => CO[m]); if (c) add('#/w/' + c); }
  for (const c of cut(picked)) add('#/w/' + c + '/rivals');
  for (const q of ['삼성', '현대', '에스']) add('#/find/' + enc(q));
}
const want = ONLY ?? routes;
const mine = SH.part('r', want, 1, r => r);

/* 이 검사 칸의 기억(보는 기계에만 있는 상태 — 관심 회사 · 관심 업종 · 본 기록 · 보유 · 매매일지 기록(열한 답 → 골똘이 칸 열림) · 숨긴 곳) */
const TODAY = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const two = [pick1, ...picked, ...codes].filter((c, i, a) => CO[c] && a.indexOf(c) === i).slice(0, 3);
const SEED = {
  'atlas:new:later': JSON.stringify(two.slice(0, 2)),
  'atlas:new:sub': JSON.stringify([grp1 ? 'g:' + grp1.id : null, 'i:' + ind1.name].filter(Boolean)),
  'atlas:new:hist': JSON.stringify(two),
  'atlas:godori-hold': JSON.stringify([{id: 'kk-1', code: pick1, name: CO[pick1].n, buy: 1000, qty: 1, day: TODAY, at: new Date().toISOString()}]),
  'atlas:godori-why': JSON.stringify([{at: '2026-10-16T01:00:00.000Z', code: pick1, name: CO[pick1].n, answers: Array(11).fill(0), verdict: '반만 준비됐어'}]),
  ...(hide1 ? {'atlas:surge-hide': JSON.stringify([hide1])} : {}),
  'atlas:essence-seen': 'true',
};

/* 쪽 안에서 — 줄 · 단추 · 고리 세기(①②③④) + 보이는 줄 모양(⑤) */
function scan({skip, nolink}) {
  const V = document.querySelector('#view'), out = {rows: [], fails: [], skipped: {}, outside: 0, links: 0, btns: 0, nrows: 0, geo: [], overflow: 0};
  if (!V) { out.fails.push(['#view 없음', '']); return out; }
  const RW = /^#\/w\/([0-9A-Z]{6})(?:\/(?:past|rivals|grow|range))?$/, RC = /^#\/cal\/([0-9A-Z]{6})$/;
  const codeOf = href => { const s = String(href ?? ''), m = RW.exec(s) ?? RC.exec(s); return m && !/^KOS(PI|DAQ)$/.test(m[1]) ? m[1] : null; }; // 지수(#/w/KOSPI · KOSDAQ)는 종목 아님
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' ? r : null; };
  const btns = [...V.querySelectorAll('button.kk-btn[data-kk]')], rows = [...V.querySelectorAll('[data-kkrow]')];
  out.btns = btns.length; out.nrows = rows.length;
  for (const b of btns) {
    if (!b.closest('[data-kkrow]')) out.fails.push(['단추가 줄 밖', b.dataset.kk]);
    if (b.closest('a')) out.fails.push(['단추가 고리(a) 안', b.dataset.kk]);
  }
  for (const r of rows) {
    const place = r.dataset.kkrow, bs = [...r.querySelectorAll('button.kk-btn[data-kk]')];
    if (r.parentElement?.closest('[data-kkrow]')) out.fails.push(['줄 안에 줄', place]);
    const links = [...r.querySelectorAll('a[href]')].map(a => codeOf(a.getAttribute('href'))).filter(Boolean);
    const row = {place, n: bs.length, kind: bs[0]?.dataset.kind ?? null, code: bs[0]?.dataset.kk ?? null, links, sb: r.querySelector('a.sb-n')?.dataset.kind ?? null};
    out.rows.push(row);
    if (bs.length !== 1) { out.fails.push(['줄마다 단추 하나가 아님', `${place} 단추 ${bs.length}`]); continue; }
    if (nolink.includes(place)) {
      const nm = String(bs[0].getAttribute('aria-label') ?? '').replace(/ 카톡으로 보내기$/, '');
      if (links.length) out.fails.push(['고리 없는 줄인데 고리', place]);
      if (!nm || !r.textContent.includes(nm)) out.fails.push(['줄 글에 단추 이름 없음', `${place} ${nm}`]);
    } else if (links.length !== 1) out.fails.push(['줄마다 종목 고리 하나가 아님', `${place} ${row.code} 고리 ${links.length}`]);
    else if (links[0] !== row.code) out.fails.push(['고리 번호 ≠ 단추 번호', `${place} 고리 ${links[0]} · 단추 ${row.code}`]);
  }
  // ③ 줄 밖 종목 고리
  for (const a of V.querySelectorAll('a[href]')) {
    const c = codeOf(a.getAttribute('href')); if (!c) continue;
    out.links++;
    if (a.closest('[data-kkrow]')) continue;
    const s = skip.find(([sel]) => a.matches(sel) || a.closest(sel));
    if (s) { out.skipped[s[1]] = (out.skipped[s[1]] ?? 0) + 1; continue; }
    out.outside++;
    out.fails.push(['줄 밖 종목 고리(카톡 단추 없음)', `${a.className || a.tagName} ${a.getAttribute('href')} 「${a.textContent.trim().slice(0, 20)}」`]);
  }
  // ⑤ 보이는 줄 모양
  const W = innerWidth;
  if (document.documentElement.scrollWidth > W + 1) { out.overflow = document.documentElement.scrollWidth - W; out.fails.push(['쪽 가로 넘침', `${document.documentElement.scrollWidth}>${W}`]); }
  for (const r of rows) {
    const b = r.querySelector('button.kk-btn[data-kk]'), rr = vis(r), br = b && vis(b);
    if (!rr || !br) continue;
    out.geo.push(r.dataset.kkrow);
    const tag = `${r.dataset.kkrow} ${b.dataset.kk}`;
    if (br.width < 43.5 || br.height < 43.5) out.fails.push(['단추가 44px 아래', `${tag} ${br.width.toFixed(1)}×${br.height.toFixed(1)}`]);
    if (br.right < rr.right - 24.5) out.fails.push(['단추가 줄 오른쪽 끝이 아님', `${tag} 단추 ${br.right.toFixed(0)} · 줄 ${rr.right.toFixed(0)}`]);
    const scroller = (() => { for (let e = r.parentElement; e && e !== V; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if ((o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 1) return true; } return false; })(); // 옆으로 미는 칸(본 기록) 안 = 밀면 보임
    if (!scroller && (br.right > W + 0.5 || br.left < -0.5)) out.fails.push(['단추가 화면 밖', `${tag} ${br.left.toFixed(0)}~${br.right.toFixed(0)}`]);
    for (const e of r.querySelectorAll('*')) {
      if (e === b || b.contains(e) || e.contains(b)) continue;
      const er = vis(e); if (!er || er.width < 1) continue;
      if (er.left >= br.right - 1 && er.top < br.bottom - 1 && er.bottom > br.top + 1) { out.fails.push(['단추 오른쪽에 다른 칸', `${tag} ${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}`]); break; }
    }
  }
  return out;
}

const browser = await chromium.launch((await fs.stat('/opt/pw-browsers/chromium').catch(() => null)) ? {executablePath: '/opt/pw-browsers/chromium'} : {}).catch(e => { console.error('브라우저를 못 띄움 —', e.message); process.exit(2); });
const ctx = await browser.newContext({viewport: {width: WIDTHS[0], height: 640}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
await ctx.addInitScript(sd => { try { if (window.top !== window) return; if (sessionStorage.getItem('kk-seeded')) return; sessionStorage.setItem('kk-seeded', '1'); for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, v); } catch { /* 기억 못 하는 쪽 */ } }, SEED);
const p = await ctx.newPage();
const st = {n: 0, last: Date.now()}, errs = [];
p.on('request', () => { st.n++; st.last = Date.now(); });
const done = () => { st.n = Math.max(0, st.n - 1); st.last = Date.now(); };
p.on('requestfinished', done); p.on('requestfailed', done);
p.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
const netQuiet = (quiet = 150, cap = 2500) => new Promise(res => { const t0 = Date.now(); const tick = () => { const now = Date.now(); if (st.n === 0 && now - st.last >= quiet) return res(true); if (now - t0 >= cap) return res(false); setTimeout(tick, 20); }; tick(); });
const frames = () => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
/** 길 열기 — 앱 안이면 주소 # 만 바꿈(빠름) · 다 그릴 때까지(「여는 중」 없음 · 새 칸 · 바쁨 표시 없음 · 망 조용) */
async function go(route) {
  if (!p.url().startsWith(BASE + PATH.split('?')[0])) { await p.goto(BASE + PATH + route, {waitUntil: 'commit', timeout: 20000}); }
  else await p.evaluate(hh => { if ((location.hash || '#/') === hh) { window.__kkTok = null; return; } window.__kkTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = hh; }, route); // 이미 그 길(줄 고리를 눌러 온 곳)이면 그린 그대로
  const ok = await p.waitForFunction(() => { const v = document.querySelector('#view'); if (!v || !v.firstElementChild || v.querySelector('.boot')) return false; return !(window.__kkTok && v.firstElementChild === window.__kkTok); }, null, {timeout: 20000, polling: 100}).then(() => true, () => false);
  await netQuiet();
  await p.waitForFunction(() => !document.querySelector('#view [aria-busy="true"]'), null, {timeout: 4000, polling: 100}).catch(() => {});
  await frames();
  return ok;
}
/** 접은 칸 모두 펼침 · 「나머지 n곳 보기」는 그대로(숨은 줄도 ①~④에서 셈) */
async function openAll() {
  const n = await p.evaluate(() => { let k = 0; for (const d of document.querySelectorAll('#view details:not([open])')) { d.open = true; k++; } return k; });
  if (n) { await netQuiet(120, 1500); await frames(); }
}

const fails = [], warn = [], places = {}, skipped = {}, list = [];
let nRows = 0, nBtns = 0, nLinks = 0, clicks = 0;
const fail = (route, w, k, x) => fails.push({route, w, k, x});
for (const route of mine) {
  errs.length = 0;
  const ok = await go(route).catch(e => { fail(route, WIDTHS[0], '못 엶', String(e.message).split('\n')[0]); return false; });
  if (!ok) { fail(route, WIDTHS[0], '그리지 못함', '20초 안에 안 그려짐'); continue; }
  const landed = await p.evaluate(() => location.hash || '#/');
  await openAll();
  let first = null;
  for (const w of WIDTHS) {
    if (p.viewportSize()?.width !== w) { await p.setViewportSize({width: w, height: 640}); await frames(); await netQuiet(80, 800); }
    const s = await p.evaluate(scan, {skip: SKIP, nolink: [...NOLINK]});
    for (const [k, x] of s.fails) fail(route, w, k, x);
    if (w === WIDTHS[0]) {
      first = s;
      nRows += s.nrows; nBtns += s.btns; nLinks += s.links;
      for (const [k, v] of Object.entries(s.skipped)) skipped[k] = (skipped[k] ?? 0) + v;
      for (const r of s.rows) {
        const P = places[r.place] ??= {rows: 0, btns: 0, surge: 0, share: 0, routes: 0};
        P.rows++; P.btns += r.n; if (r.kind === 'surge') P.surge++; else if (r.kind === 'share') P.share++;
        if (!KNOWN.includes(r.place)) warn.push(`모르는 곳 이름 ${r.place} — accept/KB2.md 곳 수 표에 더할 것`);
        // ④ kind
        const exp = SURGE_PLACES.has(r.place) || (r.place.startsWith('chip.') && landed === '#/f/surge') ? 'surge' : r.place === 'hold.news' ? (r.sb === 'mov' ? 'share' : 'surge') : 'share';
        if (r.n === 1 && r.kind !== exp) fail(route, w, 'kind 다름', `${r.place} ${r.code} ${r.kind} — 기대 ${exp}`);
      }
      for (const pl of new Set(s.rows.map(r => r.place))) places[pl].routes++;
      if (s.nrows !== s.btns) fail(route, w, '줄 수 ≠ 단추 수', `줄 ${s.nrows} · 단추 ${s.btns}`);
    }
  }
  for (const e of new Set(errs)) fail(route, WIDTHS[0], '화면 오류', e);
  // ⑥ 누름 — 첫 폭 · 길마다 한 번
  let clicked = '';
  if (CLICK && first?.nrows) {
    if (p.viewportSize()?.width !== WIDTHS[0]) { await p.setViewportSize({width: WIDTHS[0], height: 640}); await frames(); }
    const pickBtn = await p.evaluate(() => {
      for (const e of document.querySelectorAll('[data-kkt],[data-kkl]')) { e.removeAttribute('data-kkt'); e.removeAttribute('data-kkl'); }
      const rows = [...document.querySelectorAll('#view [data-kkrow]')].filter(r => { const b = r.querySelector('button.kk-btn[data-kk]'), x = b?.getBoundingClientRect(); return x && x.width > 0 && x.height > 0; });
      const r = rows[0]; if (!r) return null;
      const b = r.querySelector('button.kk-btn[data-kk]'); b.setAttribute('data-kkt', '1'); b.scrollIntoView({block: 'center'});
      return {place: r.dataset.kkrow, code: b.dataset.kk, name: String(b.getAttribute('aria-label') ?? '').replace(/ 카톡으로 보내기$/, '')};
    });
    if (pickBtn) {
      await frames();
      const before = await p.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
      await p.click('[data-kkt="1"]', {timeout: 5000}).catch(e => fail(route, WIDTHS[0], '카톡 단추를 못 누름', `${pickBtn.place} ${String(e.message).split('\n')[0]}`));
      const box = await p.waitForFunction(() => { const d = document.querySelector('.ps-dlg'); return !!d && (d.tagName !== 'DIALOG' || d.open); }, null, {timeout: 8000, polling: 100}).then(() => true, () => false);
      const mid = await p.evaluate(() => ({hash: location.hash, d: document.querySelector('.ps-dlg #ps-d')?.textContent ?? ''}));
      if (!box) fail(route, WIDTHS[0], '카톡 단추를 눌러도 글상자가 안 열림', `${pickBtn.place} ${pickBtn.code}`);
      else if (pickBtn.name && !(mid.d.includes(pickBtn.name) && /값 [\d,]+원/.test(mid.d))) fail(route, WIDTHS[0], '글상자에 종목 이름 · 오늘 값이 저절로 안 들어감([6] 3)', `${pickBtn.place} ${pickBtn.code} ${pickBtn.name} · 「${mid.d.slice(0, 40)}」`);
      if (mid.hash !== before.hash) fail(route, WIDTHS[0], '카톡 단추가 쪽을 바꿈', `${pickBtn.place} ${before.hash} → ${mid.hash}`);
      if (box) {
        await p.click('.ps-dlg .ps-x', {timeout: 3000}).catch(() => p.keyboard.press('Escape'));
        const shut = await p.waitForFunction(() => { const d = document.querySelector('.ps-dlg'); return !d || (d.tagName === 'DIALOG' && !d.open) || !d.isConnected; }, null, {timeout: 4000, polling: 100}).then(() => true, () => false);
        const after = await p.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
        if (!shut) fail(route, WIDTHS[0], '글상자가 안 닫힘', pickBtn.place);
        if (after.hash !== before.hash) fail(route, WIDTHS[0], '닫은 뒤 쪽이 바뀜', `${before.hash} → ${after.hash}`);
        if (Math.abs(after.y - before.y) > 2) fail(route, WIDTHS[0], '닫은 뒤 보던 자리가 바뀜', `${before.y} → ${after.y}`);
      }
      clicks++; clicked = pickBtn.place;
    }
    // 줄 고리 → 그 종목 길
    const pickLink = await p.evaluate(nolink => {
      const RW = /^#\/w\/([0-9A-Z]{6})(?:\/(?:past|rivals|grow|range))?$/, RC = /^#\/cal\/([0-9A-Z]{6})$/;
      for (const r of document.querySelectorAll('#view [data-kkrow]')) {
        if (nolink.includes(r.dataset.kkrow)) continue;
        const a = [...r.querySelectorAll('a[href]')].find(x => RW.test(x.getAttribute('href')) || RC.test(x.getAttribute('href'))), q = a?.getBoundingClientRect();
        if (!a || !(q.width > 0 && q.height > 0)) continue;
        a.setAttribute('data-kkl', '1'); a.scrollIntoView({block: 'center'});
        return {place: r.dataset.kkrow, href: a.getAttribute('href')};
      }
      return null;
    }, [...NOLINK]);
    if (pickLink) {
      await frames();
      for (let k = 0; k < 2; k++) { // 그리는 중 누름은 끝으로 감는 화면(2단 업종 줄) — 한 번 더
        await p.click('[data-kkl="1"]', {timeout: 5000}).catch(() => {});
        const went = await p.waitForFunction(hh => location.hash === hh, pickLink.href, {timeout: 3000, polling: 100}).then(() => true, () => false);
        if (went) break;
        if (k === 1) fail(route, WIDTHS[0], '줄 고리를 눌러도 그 종목으로 안 감', `${pickLink.place} ${pickLink.href} · 지금 ${await p.evaluate(() => location.hash)}`);
      }
      clicks++;
    }
  }
  list.push({route, rows: first?.nrows ?? 0, btns: first?.btns ?? 0, links: first?.links ?? 0, clicked, fail: fails.filter(f => f.route === route).length});
  console.log(`${list.at(-1).fail ? '실패' : '통과'} ${route} · 줄 ${first?.nrows ?? 0} · 단추 ${first?.btns ?? 0} · 종목 고리 ${first?.links ?? 0}${clicked ? ' · 누름 ' + clicked : ''}`);
}
await browser.close().catch(() => {});

const res = {schema: 'atlas11-next-kakao-1', at: new Date().toISOString(), base: BASE, all: ALL, limit: LIMIT || null, widths: WIDTHS, click: CLICK, ...SH.info(),
  seconds: Math.round((Date.now() - T0) / 1000),
  counts: {routes: mine.length, rows: nRows, btns: nBtns, links: nLinks, clicks, fail: fails.length, places, skipped, list},
  fails: fails.slice(0, 500), warn: [...new Set(warn)].slice(0, 50), ok: fails.length === 0};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true}); await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(res, null, 1) + '\n'); }
for (const f of fails.slice(0, 40)) console.log(`  ✗ ${f.route} · ${f.w} · ${f.k} — ${f.x}`);
for (const w of res.warn) console.log('  경고 ' + w);
console.log(`곳 ${Object.keys(places).length} · ${Object.entries(places).map(([k, v]) => `${k} ${v.rows}`).join(' · ')}`);
console.log(`뺀 꼴 ${Object.entries(skipped).map(([k, v]) => `${k.split(' — ')[0]} ${v}`).join(' · ') || '0'}`);
console.log(`${res.ok ? '모두 통과' : '실패 ' + fails.length} · 길 ${mine.length} · 줄 ${nRows} · 단추 ${nBtns} · 누름 ${clicks} · ${res.seconds}초`);
process.exit(res.ok ? 0 : 1);

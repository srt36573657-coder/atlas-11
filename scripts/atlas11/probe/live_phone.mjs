#!/usr/bin/env node
// 진짜 사이트 폰 엔진 검사(사장님 2026-10-19 「진짜 폰 테스트」) — 폰을 손에 들 수 없어, 폰과 같은 브라우저 엔진 · 화면 · 배율 · 터치로 진짜 사이트를 엶
//   iPhone SE · iPhone 13 = WebKit(아이폰 사파리 엔진) · Galaxy S9+ · Pixel 7 = Chromium(안드로이드 크롬 엔진) — playwright devices 그대로
//   쪽 20곳(#/ · #/t/… · 알림 쪽 2026-10-19 22시 더함)마다: 오류 · 옆으로 넘침 · 17px 아래 글 · 44px 아래 누르는 자리 · #/t/… 의 「다음」 단추가 하나인지
//   「다음」 사슬: #/t/hello 에서 손가락으로 「다음」을 눌러 주소가 그 단추 주소로 바뀌는지(19걸음 · 테마 길이 아니면 멈춤) · 첫 화면 사진 넷(첫 화면 · 싹 · 업종 · 회사)
//   기록 reports/atlas11/probe/live-phone/(summary.json · <기기>-<쪽>.png) · 검사 기록이라 늘 0 으로 끝남 · 엔진이 안 켜지면 적고 나머지 기기만
//   깃허브 실행기(probe which=livephone)에서 돎 — 이 방은 사이트에 못 닿음 · 여기서 시험: LIVE_BASE=http://127.0.0.1:8826 LIVE_PATH=/next/ OUT_DIR=<임시>
//   넘침은 innerWidth 와 기기 화면 넓이 가운데 작은 쪽과 견줌 — 크롬 폰 흉내는 넘치면 화면을 줄여 innerWidth 가 같이 커짐(그대로 견주면 못 잡음)
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const T0 = Date.now(), AT = new Date(T0).toISOString(), env = process.env;
const BASE = String(env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, '');
const NEXT = String(env.LIVE_PATH || '/').replace(/^\/*/, '/').replace(/\/*$/, '/'); // 쪽이 놓인 길(진짜 사이트 '/' · 이 방 시험 서버 '/next/')
const OUT = env.OUT_DIR || 'reports/atlas11/probe/live-phone';
const DEADLINE = T0 + Math.max(60, Number(env.PHONE_BUDGET_S) || 840) * 1000; // 바깥 timeout(900초)보다 먼저 끝내고 적음
const SHOT_CAP = Math.max(500, Number(env.PHONE_SHOT_KB) || 6000) * 1024; // 사진 합이 넘으면 다음 사진부터 화면 점 하나 = 1px(scale css)
const MIN_TEXT = 16.95, MIN_TAP = 43.5, CHAIN_MAX = 19, STAMP = T0.toString(36), HOME_NEXT = '#/t/how'; // HOME_NEXT = 테마 흐름에서 첫 화면 다음 쪽(새 첫 화면에는 「다음」 단추가 없어 주소로 — 2026-10-28 order-1112)
const DEVICES = [['iPhone SE', 'webkit'], ['iPhone 13', 'webkit'], ['Galaxy S9+', 'chromium'], ['Pixel 7', 'chromium']];

const line1 = e => (String(e?.message ?? e).split('\n').find(l => l.trim()) ?? '').trim().slice(0, 240);
const show = h => { try { return decodeURIComponent(h); } catch { return h; } }; // 기록에는 읽히는 글로(2차전지 · 회사 번호)
const norm = h => { const s = show(String(h ?? '')); return s === '' || s === '#' ? '#/' : s; };
const isTheme = h => { const s = norm(h); return s === '#/' || s.startsWith('#/t/'); };
const slug = n => n.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cleanUrl = u => { let s = String(u ?? '').replace(/([?&])v=[^&#]*&?/, '$1').replace(/[?&](#|$)/, '$1'); if (s.startsWith(BASE)) s = s.slice(BASE.length) || '/'; return s.slice(0, 200); };
const urlOf = (hash, k) => `${BASE}${NEXT}?v=${STAMP}-${k}${hash}`; // 쪽마다 새로 엶(주소 뒤 # 만 다르면 같은 쪽 안 이동이라)

const S = {schema: 'atlas11-live-phone-1', at: AT, base: BASE, path: NEXT, partial: true, limits: {text: MIN_TEXT, tap: MIN_TAP, chain: CHAIN_MAX}, data: {}, routes: [], devices: [], ok: false};
function write() {
  try { fs.mkdirSync(OUT, {recursive: true}); S.ms = Date.now() - T0; fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(S, null, 1) + '\n'); } catch (e) { console.error('summary 못 적음:', line1(e)); }
}
function finish() {
  S.partial = false; S.ok = !S.fatal && !S.data.err && S.devices.length === DEVICES.length && S.devices.every(d => d.ok);
  write();
  console.log(JSON.stringify({schema: S.schema, at: S.at, base: S.base, ok: S.ok, ms: S.ms, ...(S.fatal ? {fatal: S.fatal} : {}), ...(S.data.err ? {dataErr: S.data.err} : {}),
    devices: S.devices.map(d => ({name: d.name, engine: d.engine, ok: d.ok, ...(d.launch ? {launch: d.launch} : {}), routes: `${d.routes.length}/${S.routes.length}`,
      errors: d.errors.length, overflow: d.overflow.length, small: d.small.length, tap: d.tap.length, nextOne: d.nextOne.length,
      chain: `${d.nextChain.steps.filter(s => s.ok).length}/${d.nextChain.steps.length}${d.nextChain.ok ? ' ok' : ''}`}))}));
  process.exit(0);
}
process.on('unhandledRejection', e => { S.fatal = 'unhandled: ' + line1(e); finish(); });
process.on('uncaughtException', e => { S.fatal = 'uncaught: ' + line1(e); finish(); });

/* ── 쪽 안에서 잼(page.evaluate) — #view 안만 · svg 안 글은 뺌 · 닫힌 접기 · 1px 소리 글(…-sr) · 숨긴 칸은 안 셈 ── */
function measure({minText, minTap, vpw}) {
  const view = document.querySelector('#view'), se = document.scrollingElement || document.documentElement;
  const nm = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; const c = [...el.classList].slice(0, 2); return c.length ? s + '.' + c.join('.') : s; };
  const sel = el => (el.parentElement && el.parentElement !== view ? nm(el.parentElement) + ' > ' : '') + nm(el);
  const hideMemo = new Map();
  const hider = e => { // 1px · clip 로 숨긴 칸(소리로만 읽는 글) · 높이 0 으로 접은 칸
    if (hideMemo.has(e)) return hideMemo.get(e);
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    const v = (cs.clip && cs.clip !== 'auto') || /inset\(\s*50%/.test(cs.clipPath || '') || ((r.width <= 1 || r.height <= 1) && cs.overflow !== 'visible');
    hideMemo.set(e, v); return v;
  };
  const inClosed = el => { for (let d = el.closest('details:not([open])'); d; d = d.parentElement && d.parentElement.closest('details:not([open])')) { const s = el.closest('summary'); if (!s || s.parentElement !== d) return true; } return false; };
  const shown = el => {
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true, opacityProperty: true, visibilityProperty: true})) return false;
    if (inClosed(el)) return false;
    for (let e = el; e && e !== view && e !== document.body; e = e.parentElement) if (hider(e)) return false;
    return true;
  };
  const vw = window.innerWidth, cw = document.documentElement.clientWidth, ref = Math.min(vw, vpw || vw), sw = se.scrollWidth;
  const out = {hash: location.hash || '#/', title: document.title, sw, vw, cw, over: sw > ref + 1, who: [], small: [], smallN: 0, tap: [], tapN: 0,
    next: document.querySelectorAll('a.th-next').length, empty: view ? [...view.querySelectorAll('.empty')].map(e => e.textContent.trim().slice(0, 80)) : [], boot: !!view?.querySelector('.boot')};
  // 첫 화면 그림 단추 넷(꽃 될 회사 · 회사 찾기 · 싹 달력 · 고객센터)이 찾기 줄 위 한 화면 안인가(사장님 2026-10-27 00:17 「… 첫 화면에 한번에 보일 수 있는 글씨 크기로 줄여주고」) — 첫 화면에만 있음 · 다른 쪽은 null
  { const lab = view ? [...view.querySelectorAll('.s-apps .s-apl')].map(e => e.getBoundingClientRect().bottom) : [], th = view?.querySelector('.s-thumb'), tabs = document.querySelector('.tabs');
    const room = th && th.getBoundingClientRect().height > 0 ? th.getBoundingClientRect().top : (tabs ? tabs.getBoundingClientRect().top : window.innerHeight);
    { const hr = view?.querySelector('section.nh-hero'); out.hero = hr ? {bottom: Math.round(hr.getBoundingClientRect().bottom), room: Math.round(room), vh: window.innerHeight, fit: hr.getBoundingClientRect().bottom <= room + 0.5} : null; } // 새 첫 화면 소개 칸(2026-10-28 order-1112)이 찾기 줄 위 한 화면 안
    out.fold = lab.length ? {apps: Math.round(Math.max(...lab)), room: Math.round(room), vh: window.innerHeight, fit: Math.max(...lab) <= room + 0.5, clock: (() => { const c = view.querySelector('.th-zones .s-art'); if (!c) return null; const r = c.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })()} : null; }
  if (out.over) { // 옆으로 튀어나온 칸 — 부모는 안 튀어나온 바깥 칸만(뿌리) · 가로로 넘기는 줄(overflow-x) 안은 뺌
    const sticks = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > ref + 1; };
    for (const e of document.body.querySelectorAll('*')) {
      if (out.who.length >= 6) break;
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
      const p = e.parentElement;
      if (!sticks(e) || (p && p !== document.body && (sticks(p) || getComputedStyle(p).overflowX !== 'visible'))) continue;
      const r = e.getBoundingClientRect(); out.who.push({sel: sel(e), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width)});
    }
  }
  if (view) {
    const tw = document.createTreeWalker(view, NodeFilter.SHOW_TEXT), rg = document.createRange(), seen = new Map();
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
      const el = n.parentElement; if (!el || el.closest('svg')) continue;
      const px = parseFloat(getComputedStyle(el).fontSize); if (!(px < minText)) continue;
      rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || !shown(el)) continue;
      out.smallN++;
      const key = sel(el) + '|' + px, x = seen.get(key);
      if (x) x.n++; else { const o = {sel: sel(el), px: Math.round(px * 100) / 100, text: t.slice(0, 40), n: 1}; seen.set(key, o); out.small.push(o); }
    }
    for (const el of view.querySelectorAll('a[href], button, summary')) {
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || !shown(el)) continue;
      if (r.width >= minTap && r.height >= minTap) continue;
      out.tapN++;
      if (out.tap.length < 60) out.tap.push({sel: sel(el), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, text: (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30), href: el.getAttribute('href') ?? undefined});
    }
  }
  return out;
}
const VIEW_DRAWN = () => { const v = document.querySelector('#view'); return !!v && v.children.length > 0 && !v.querySelector('.boot') && !v.querySelector(':scope > [data-probe-old]'); };
const waitView = (page, ms) => page.waitForFunction(VIEW_DRAWN, null, {timeout: ms, polling: 100}).then(() => true, () => false);
async function settle(page, idleMs) { // 글꼴 · 늦게 오는 자료가 자리를 바꾼 뒤에 잼
  if (idleMs) await page.waitForLoadState('networkidle', {timeout: idleMs}).catch(() => {});
  await page.evaluate(async () => { try { await document.fonts?.ready; } catch { /* 글꼴 없음 */ } await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }).catch(() => {});
  await page.waitForTimeout(200);
}

/* ── 테마 자료 먼저(맨 앞 싹 업종 · 그 안 맨 앞 회사) → 쪽 20곳 ── */
async function getJson(u) {
  const r = await fetch(u, {headers: {'cache-control': 'no-cache'}, signal: AbortSignal.timeout(20000)});
  if (!r.ok) throw new Error(`${cleanUrl(u)} HTTP ${r.status}`);
  return r.json();
}
let TOP = null, LEAD = null;
try {
  const [th, more] = await Promise.all([getJson(`${BASE}/next/data/theme.json?v=${STAMP}`), getJson(`${BASE}/next/data/theme-more.json?v=${STAMP}`)]);
  TOP = th?.order?.S?.[0] ?? th?.order?.B?.[0] ?? null;
  LEAD = TOP ? more?.inds?.[TOP]?.top?.[0]?.c ?? null : null;
  S.data = {asOf: th?.asOf ?? null, top: TOP, lead: LEAD, ...(TOP ? {} : {err: 'theme.json order.S · order.B empty'}), ...(TOP && !LEAD ? {err: 'theme-more.json inds[top].top empty'} : {})};
} catch (e) { S.data = {err: line1(e)}; }
const ROUTES = ['#/', '#/t/hello', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', '#/t/today', '#/t/alert']; // 알림 쪽(26 · 2026-10-19 22시 더함)
const IND = TOP ? '#/t/i/' + encodeURIComponent(TOP) : null, CO = LEAD ? '#/t/c/' + encodeURIComponent(LEAD) : null;
if (IND) ROUTES.push(IND, ...['path', 'spread', 'big', 'co', 'near'].map(s => IND + '/' + s));
if (CO) ROUTES.push(CO, ...['lead', 'why', 'rank', 'unknown', 'keep'].map(s => CO + '/' + s));
const SHOTS = new Map([['#/', 'home'], ['#/t/sprout', 'sprout'], ['#/t/alert', 'alert'], ...(IND ? [[IND, 'industry']] : []), ...(CO ? [[CO, 'company']] : [])]);
S.routes = ROUTES.map(show);

let pw;
try { pw = createRequire(env.PW_DIR ? env.PW_DIR.replace(/\/?$/, '/') : import.meta.url)('playwright'); } catch (e) { S.fatal = 'playwright: ' + line1(e); finish(); }
fs.mkdirSync(OUT, {recursive: true});
for (const f of fs.readdirSync(OUT)) if (/^[a-z0-9-]+-(home|sprout|industry|company)\.png$/.test(f)) fs.rmSync(path.join(OUT, f), {force: true}); // 지난 사진(이번에 못 찍은 기기 사진이 남아 헷갈리지 않게)
write();

const browsers = {};
async function browserFor(engine) {
  if (!browsers[engine]) { try { browsers[engine] = {b: await pw[engine].launch({timeout: 60000})}; } catch (e) { browsers[engine] = {err: line1(e)}; } }
  return browsers[engine];
}
let shotBytes = 0;

async function runDevice(name, engine, end) {
  const prof = pw.devices[name], start = Date.now(), routesEnd = start + (end - start) * 0.7;
  const D = {name, engine, ok: false, viewport: prof?.viewport ?? null, dpr: prof?.deviceScaleFactor ?? null, touch: !!prof?.hasTouch,
    errors: [], overflow: [], small: [], tap: [], nextOne: [], nextChain: {steps: [], ok: false}, routes: [], shots: []};
  S.devices.push(D);
  if (!prof) { D.launch = 'no playwright device profile'; return; }
  const br = await browserFor(engine); if (br.err) { D.launch = br.err; return; }
  let ctx;
  try { ctx = await br.b.newContext({...prof, locale: 'ko-KR', timezoneId: 'Asia/Seoul'}); } catch (e) { D.launch = 'context: ' + line1(e); return; }
  D.version = br.b.version();
  const G = {errors: new Map(), small: new Map(), tap: new Map()}, C = D.nextChain; let cur = '(start)', shooting = false, page = null;
  const group = (m, key, base, route, n = 1) => { let x = m.get(key); if (!x) m.set(key, x = {...base, routes: [], n: 0}); if (!x.routes.includes(route)) x.routes.push(route); x.n += n; return x; };
  const err = (type, text, extra = {}) => group(G.errors, type + '|' + text, {type, text: String(text).slice(0, 300), ...extra}, cur);
  const fresh = async () => { // 새 탭(처음 · 탭이 죽었을 때)
    try { await page?.close(); } catch { /* 이미 닫힘 */ }
    page = await ctx.newPage();
    page.on('pageerror', e => err('pageerror', line1(e)));
    page.on('console', m => { if (m.type() === 'error' && shooting) { (D.shotNoise ??= []).push({route: cur, text: m.text().replace(/\s+/g, ' ').slice(0, 200)}); return; } if (m.type() === 'error') { const u = m.location()?.url; err('console', m.text().replace(/\s+/g, ' ').slice(0, 300), u ? {url: cleanUrl(u)} : {}); } });
    page.on('crash', () => err('crash', 'page crashed'));
  };
  try {
    await fresh();
    /* 1) 쪽마다 새로 열어 잼 */
    for (const [k, hash] of ROUTES.entries()) {
      if (Date.now() > routesEnd) { D.skipped = ROUTES.slice(k).map(show); break; }
      cur = show(hash);
      const t = Date.now(), row = {route: cur};
      try {
        await page.goto(urlOf(hash, k), {waitUntil: 'domcontentloaded', timeout: 45000});
        if (!(await waitView(page, 30000))) err('boot', '#view .boot still shown after 30s');
        await settle(page, 6000);
        const m = await page.evaluate(measure, {minText: MIN_TEXT, minTap: MIN_TAP, vpw: prof.viewport?.width});
        Object.assign(row, {title: m.title, next: m.next, scrollWidth: m.sw, innerWidth: m.vw, small: m.smallN, tap: m.tapN, ...(m.fold ? {fold: m.fold} : {}), ...(m.hero ? {hero: m.hero} : {})});
        if (norm(m.hash) !== norm(hash)) { row.landed = show(m.hash); err('route', `landed on ${show(m.hash)}`); }
        if (m.over) D.overflow.push({route: cur, scrollWidth: m.sw, innerWidth: m.vw, clientWidth: m.cw, who: m.who});
        for (const s of m.small) group(G.small, s.sel + '|' + s.px, {sel: s.sel, px: s.px, text: s.text}, cur, s.n);
        for (const x of m.tap) { const g = group(G.tap, x.sel, {sel: x.sel, w: x.w, h: x.h, text: x.text, ...(x.href ? {href: show(x.href)} : {})}, cur); g.w = Math.min(g.w, x.w); g.h = Math.min(g.h, x.h); }
        if (hash.startsWith('#/t/') && m.next !== 1) D.nextOne.push({route: cur, count: m.next});
        for (const e of m.empty) if (e.startsWith('?')) err('empty', e);
        const shot = SHOTS.get(hash);
        if (shot) {
          const f = path.join(OUT, `${slug(name)}-${shot}.png`), scale = shotBytes > SHOT_CAP ? 'css' : 'device';
          shooting = true; try { await page.screenshot({path: f, scale, timeout: 20000, caret: 'initial'}); await page.waitForTimeout(50); } finally { shooting = false; } // 사진 찍는 동안 난 오류는 shotNoise 로 따로 남김(사이트 오류 셈 밖) — 아이폰 엔진은 사진 때 Playwright 가 넣는 <style> 이 보안 규칙에 막혀 경고를 남김(2026-10-19 두 번 · 사진 찍은 다섯 쪽에서만) // caret 'hide'(기본)는 Playwright 가 <style> 을 넣어 사이트 보안 규칙(style-src 'self')에 막힘 — 아이폰 엔진만 「Refused to apply a stylesheet」을 남겼음(사진 찍는 다섯 쪽에서만 · 2026-10-19 23:33)
          const bytes = fs.statSync(f).size; shotBytes += bytes; D.shots.push({name: shot, file: path.basename(f), bytes, scale});
        }
      } catch (e) { row.fail = line1(e); err('load', row.fail); await fresh(); }
      row.ms = Date.now() - t; D.routes.push(row);
    }

    /* 1b) 첫 화면 누르기(사장님 2026-10-20 09:46 「주황색 클릭 해봤는데 않돼」) — 손가락으로 누르면 주소가 그 쪽으로 · 다 그려지고 머리 글이 있음
       2026-10-28 새 첫 화면(사장님 11:12 「어」 · docs/design/why-mock-2026-10-28/order-1112.txt): 옛 시계 번호 · 싹 칸 · 주황 숫자 칸은 빠짐 → 업종 모두 보기 · 날짜별 기록 · 오늘 조건에 맞은 회사 · 「왜 사?」 시작하기 */
    D.taps = [];
    for (const [name, sel, want] of [['map-all', 'section.nh-map a.nh-link', '#/f/ind'], ['rec-log', 'section.nh-rec a.nh-link >> nth=0', '#/t/pick'], ['rec-today', 'section.nh-rec a.nh-link >> nth=1', '#/t/picks'], ['why-go', 'section.nh-why a.nh-go', '#/why']]) {
      if (Date.now() > end) break;
      const T = {name, want}; D.taps.push(T); cur = 'tap ' + name;
      try {
        await page.goto(urlOf('#/', 'tap-' + name), {waitUntil: 'domcontentloaded', timeout: 45000});
        if (!(await waitView(page, 30000))) { T.ok = false; T.why = 'home not drawn'; continue; }
        await settle(page, 3000);
        let pt = null;
        if (name === 'clock-1') pt = await page.evaluate(() => { const a = [...document.querySelectorAll('section.th-home svg.th-clock a.th-tapn')].find(x => x.querySelector('.th-nbt')?.textContent === '1'); if (!a) return null; const c = a.querySelector('circle.th-nb'); c.scrollIntoView({block: 'center'}); const b = c.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; });
        else if (name === 'clock-sprout') pt = await page.evaluate(() => { const z = document.querySelector('section.th-home svg.th-clock a.th-tapz'); if (!z) return null; z.scrollIntoView({block: 'center'}); const b = z.getBoundingClientRect(); for (let fy = 0.9; fy > 0.1; fy -= 0.1) for (let fx = 0.08; fx < 0.95; fx += 0.12) { const x = b.left + b.width * fx, y = b.top + b.height * fy; if (document.elementFromPoint(x, y)?.closest('a') === z) return {x, y}; } return null; });
        else { const h = await page.locator(sel).first().elementHandle({timeout: 5000}).catch(() => null); pt = h ? await h.evaluate(el => { el.scrollIntoView({block: 'center'}); const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, top = document.elementFromPoint(x, y); return {x, y, covered: top && !el.contains(top) ? (top.closest('a, button')?.getAttribute('href') ?? top.tagName) : null}; }) : null; if (pt?.covered) T.covered = pt.covered; } // 가운데로 올려 누름(맨 아래 고정 띠 밑에 깔리지 않게)
        if (!pt) { T.ok = false; T.why = 'target not found'; continue; }
        await page.evaluate(() => { for (const c of document.querySelector('#view')?.children ?? []) c.setAttribute('data-probe-old', '1'); }); // 앞 화면 표시(넘어간 쪽이 새로 그려졌는지 가림 — 아래 「다음」 사슬과 같음)
        if (D.touch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y);
        const moved = await page.waitForFunction(w => { let h = location.hash || '#/'; try { h = decodeURIComponent(h); } catch { /* 그대로 */ } return h === w; }, want, {timeout: 10000, polling: 50}).then(() => true, () => false);
        T.to = show(await page.evaluate(() => location.hash).catch(() => '?')); T.ok = moved; if (!moved) T.why = 'hash did not change';
        // 넘어간 쪽이 다 그려질 때까지 봄 — 주소만 바뀌고 그리기 전에 다음 열기로 가면 아이폰 엔진이 받던 쪽 모듈을 끊고 「Importing a module script failed」를 다음 칸에 냄
        //   (2026-10-20 10:40 실제 사이트 탐침: 누르기 여섯 모두 맞는데 아이폰 둘만 그 글 여섯 번 — 누른 쪽마다 하나씩 · 다음 칸 이름으로 적힘)
        if (moved) {
          if (!(await waitView(page, 15000))) { T.ok = false; T.why = 'destination not drawn'; }
          else { await settle(page, 2000); T.h2 = await page.evaluate(() => document.querySelector('#view h2')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) ?? null).catch(() => null); if (!T.h2) { T.ok = false; T.why = 'destination has no heading'; } }
        }
      } catch (e) { T.ok = false; T.why = line1(e); }
    }

    /* 1c) 일곱 단(사장님 2026-10-20 12:59 「지금 3단 클릭 구조로 되어있는걸 7단 클릭구조로 … 토스증권처럼」) — 테마 회사 쪽 「더 깊이 보기」 4단을 손가락으로 →
       넘어간 쪽 줄의 1 · 2 · 3 이 테마 쪽인지 → 「다음 단」 셋(5 · 6 · 7) → 7단 「다음 단」 = #/why/<번호> · 쪽마다 다 그려질 때까지 봄(그리기 전에 떠나지 않게) */
    D.seven = {steps: [], ok: false};
    if (CO && LEAD && Date.now() <= end) {
      cur = 'seven';
      try {
        await page.goto(urlOf(CO, 'seven'), {waitUntil: 'domcontentloaded', timeout: 45000});
        if (!(await waitView(page, 30000))) throw new Error('company not drawn');
        await settle(page, 3000);
        const tapSel = async (sel, want, k) => {
          const h0 = await page.locator(sel).first().elementHandle({timeout: 8000}).catch(() => null);
          if (!h0) return {k, ok: false, why: 'target not found ' + sel};
          const pt = await h0.evaluate(el => { el.scrollIntoView({block: 'center'}); const b = el.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; });
          await page.evaluate(() => { for (const c of document.querySelector('#view')?.children ?? []) c.setAttribute('data-probe-old', '1'); });
          if (D.touch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y);
          const moved = await page.waitForFunction(w => location.hash === w, want, {timeout: 10000, polling: 50}).then(() => true, () => false);
          if (!moved) return {k, ok: false, why: 'hash ' + show(await page.evaluate(() => location.hash))};
          const drawn = await waitView(page, 20000); await settle(page, 2000);
          await page.waitForFunction(() => !!document.querySelector('#view .chaps .cp.now'), null, {timeout: 15000, polling: 100}).catch(() => {});
          const head = await page.evaluate(() => [...document.querySelectorAll('#view .chaps .cp')].slice(0, 3).map(a => a.getAttribute('href')));
          return {k, ok: drawn, to: show(want), head};
        };
        const c = encodeURIComponent(LEAD);
        let st = await tapSel('#view .chaps a.cp >> nth=3', '#/w/' + LEAD + '/past', 4); D.seven.steps.push(st);
        if (st.ok && !(st.head?.[0] === '#/' && st.head?.[2] === '#/t/c/' + c)) { st.ok = false; st.why = 'head not theme ' + JSON.stringify(st.head); }
        for (const [k, sub] of [[5, 'rivals'], [6, 'grow'], [7, 'range']]) {
          if (!st.ok || Date.now() > end) break;
          st = await tapSel('#view a.chap-next >> nth=-1', '#/w/' + LEAD + '/' + sub, k); D.seven.steps.push(st);
        }
        const last = await page.evaluate(() => [...document.querySelectorAll('#view a.chap-next')].at(-1)?.getAttribute('href') ?? null);
        D.seven.end = last; D.seven.ok = D.seven.steps.length === 4 && D.seven.steps.every(x => x.ok) && last === '#/why/' + c;
      } catch (e) { D.seven.why = line1(e); }
    } else D.seven.why = 'no theme company';

    /* 2) 「다음」 사슬 — 손가락으로 누름(터치 기기) · 주소가 단추 주소로 바뀌는지 · 테마 길(#/ · #/t/…)이 아니면 멈춤 */
    cur = 'chain #/t/hello';
    await page.goto(urlOf('#/t/hello', 'chain'), {waitUntil: 'domcontentloaded', timeout: 45000});
    if (!(await waitView(page, 30000))) throw new Error('#/t/hello not drawn');
    await settle(page, 4000);
    for (let s = 1; s <= CHAIN_MAX; s++) {
      if (Date.now() > end) { C.cut = 'time'; break; }
      const from = norm(await page.evaluate(() => location.hash || '#/'));
      cur = 'chain ' + from;
      const loc = page.locator('#view a.th-next').last();
      const step = {k: s, from};
      C.steps.push(step);
      await loc.waitFor({state: 'attached', timeout: 5000}).catch(() => {});
      if (!(await loc.count()) && from === '#/') { // 2026-10-28 새 첫 화면(order-1112)에는 「다음」 단추가 없음 — 테마 흐름은 첫 화면 다음 쪽(HOME_NEXT)을 주소로 이어 엶(나머지 사슬은 그대로 손가락으로 잼)
        step.via = 'address'; step.href = HOME_NEXT;
        await page.goto(urlOf(HOME_NEXT, 'chain-home'), {waitUntil: 'domcontentloaded', timeout: 45000});
        if (!(await waitView(page, 30000))) { step.ok = false; step.why = HOME_NEXT + ' not drawn'; break; }
        step.ok = true; step.to = HOME_NEXT; await settle(page, 0); continue;
      }
      if (!(await loc.count())) { step.ok = false; step.why = 'no a.th-next'; break; }
      const href = await loc.getAttribute('href'); step.href = show(href ?? '');
      await page.evaluate(() => { for (const c of document.querySelector('#view')?.children ?? []) c.setAttribute('data-probe-old', '1'); }); // 앞 화면 표시(새 화면이 그려졌는지 가림)
      const t = Date.now();
      try { await (D.touch ? loc.tap({timeout: 10000}) : loc.click({timeout: 10000})); } catch (e) { step.ok = false; step.why = 'tap: ' + line1(e); break; }
      const want = norm(href);
      const moved = await page.waitForFunction(w => { let h = location.hash || '#/'; try { h = decodeURIComponent(h); } catch { /* 그대로 */ } return (h === '#' ? '#/' : h) === w; }, want, {timeout: 15000, polling: 50}).then(() => true, () => false);
      step.to = norm(await page.evaluate(() => location.hash || '#/').catch(() => { try { return new URL(page.url()).hash; } catch { return '?'; } }));
      if (!moved) { step.ok = false; step.why = 'hash did not change to the button href'; break; }
      if (!isTheme(step.to)) { step.ok = true; step.ms = Date.now() - t; C.end = step.to; break; } // 테마 밖(#/why/<번호> 등)에 닿음 — 사슬 끝
      if (!(await waitView(page, 30000))) { step.ok = false; step.why = 'new page not drawn'; break; }
      step.ok = true; step.ms = Date.now() - t;
      await settle(page, 0);
    }
  } catch (e) { D.broke = line1(e); err('run', D.broke); if (cur.startsWith('chain')) C.steps.push({k: C.steps.length + 1, ok: false, why: D.broke}); }
  finally {
    C.ok = C.steps.length > 0 && C.steps.every(s => s.ok) && (C.end != null || C.steps.length === CHAIN_MAX);
    try { await ctx.close(); } catch { /* 이미 닫힘 */ }
    D.errors = [...G.errors.values()]; D.small = [...G.small.values()]; D.tap = [...G.tap.values()];
    D.ms = Date.now() - start;
    D.ok = !D.broke && !D.skipped && D.routes.length === ROUTES.length && D.routes.every(r => !r.fail) && !D.errors.length && !D.overflow.length && !D.small.length && !D.tap.length && !D.nextOne.length && C.ok && (D.taps ?? []).every(t => t.ok) && D.seven?.ok === true;
  }
}

for (const [k, [name, engine]] of DEVICES.entries()) {
  const left = DEVICES.length - k, end = Date.now() + Math.max(0, DEADLINE - Date.now()) / left; // 남은 시간을 남은 기기 수로 나눔(엔진이 안 켜진 기기는 곧바로 넘김)
  try { await runDevice(name, engine, end); } catch (e) { const d = S.devices.find(x => x.name === name); if (d) d.launch = d.launch ?? 'run: ' + line1(e); }
  write();
}
for (const x of Object.values(browsers)) { try { await x.b?.close(); } catch { /* 이미 닫힘 */ } }
S.shotBytes = shotBytes;
finish();

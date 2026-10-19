#!/usr/bin/env node
// 진짜 사이트 폰 엔진 검사(사장님 2026-10-19 「진짜 폰 테스트」) — 폰을 손에 들 수 없어, 폰과 같은 브라우저 엔진 · 화면 · 배율 · 터치로 진짜 사이트를 엶
//   iPhone SE · iPhone 13 = WebKit(아이폰 사파리 엔진) · Galaxy S9+ · Pixel 7 = Chromium(안드로이드 크롬 엔진) — playwright devices 그대로
//   쪽 19곳(#/ · #/t/…)마다: 오류 · 옆으로 넘침 · 17px 아래 글 · 44px 아래 누르는 자리 · #/t/… 의 「다음」 단추가 하나인지
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
const MIN_TEXT = 16.95, MIN_TAP = 43.5, CHAIN_MAX = 19, STAMP = T0.toString(36);
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

/* ── 테마 자료 먼저(맨 앞 싹 업종 · 그 안 맨 앞 회사) → 쪽 19곳 ── */
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
const ROUTES = ['#/', '#/t/hello', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', '#/t/today'];
const IND = TOP ? '#/t/i/' + encodeURIComponent(TOP) : null, CO = LEAD ? '#/t/c/' + encodeURIComponent(LEAD) : null;
if (IND) ROUTES.push(IND, ...['path', 'spread', 'big', 'co', 'near'].map(s => IND + '/' + s));
if (CO) ROUTES.push(CO, ...['lead', 'why', 'rank', 'unknown', 'keep'].map(s => CO + '/' + s));
const SHOTS = new Map([['#/', 'home'], ['#/t/sprout', 'sprout'], ...(IND ? [[IND, 'industry']] : []), ...(CO ? [[CO, 'company']] : [])]);
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
  const G = {errors: new Map(), small: new Map(), tap: new Map()}, C = D.nextChain; let cur = '(start)', page = null;
  const group = (m, key, base, route, n = 1) => { let x = m.get(key); if (!x) m.set(key, x = {...base, routes: [], n: 0}); if (!x.routes.includes(route)) x.routes.push(route); x.n += n; return x; };
  const err = (type, text, extra = {}) => group(G.errors, type + '|' + text, {type, text: String(text).slice(0, 300), ...extra}, cur);
  const fresh = async () => { // 새 탭(처음 · 탭이 죽었을 때)
    try { await page?.close(); } catch { /* 이미 닫힘 */ }
    page = await ctx.newPage();
    page.on('pageerror', e => err('pageerror', line1(e)));
    page.on('console', m => { if (m.type() === 'error') { const u = m.location()?.url; err('console', m.text().replace(/\s+/g, ' ').slice(0, 300), u ? {url: cleanUrl(u)} : {}); } });
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
        Object.assign(row, {title: m.title, next: m.next, scrollWidth: m.sw, innerWidth: m.vw, small: m.smallN, tap: m.tapN});
        if (norm(m.hash) !== norm(hash)) { row.landed = show(m.hash); err('route', `landed on ${show(m.hash)}`); }
        if (m.over) D.overflow.push({route: cur, scrollWidth: m.sw, innerWidth: m.vw, clientWidth: m.cw, who: m.who});
        for (const s of m.small) group(G.small, s.sel + '|' + s.px, {sel: s.sel, px: s.px, text: s.text}, cur, s.n);
        for (const x of m.tap) { const g = group(G.tap, x.sel, {sel: x.sel, w: x.w, h: x.h, text: x.text, ...(x.href ? {href: show(x.href)} : {})}, cur); g.w = Math.min(g.w, x.w); g.h = Math.min(g.h, x.h); }
        if (hash.startsWith('#/t/') && m.next !== 1) D.nextOne.push({route: cur, count: m.next});
        for (const e of m.empty) if (e.startsWith('?')) err('empty', e);
        const shot = SHOTS.get(hash);
        if (shot) {
          const f = path.join(OUT, `${slug(name)}-${shot}.png`), scale = shotBytes > SHOT_CAP ? 'css' : 'device';
          await page.screenshot({path: f, scale, timeout: 20000});
          const bytes = fs.statSync(f).size; shotBytes += bytes; D.shots.push({name: shot, file: path.basename(f), bytes, scale});
        }
      } catch (e) { row.fail = line1(e); err('load', row.fail); await fresh(); }
      row.ms = Date.now() - t; D.routes.push(row);
    }

    /* 2) 「다음」 사슬 — 손가락으로 누름(터치 기기) · 주소가 단추 주소로 바뀌는지 · 테마 길(#/ · #/t/…)이 아니면 멈춤 */
    cur = 'chain #/t/hello';
    await page.goto(urlOf('#/t/hello', 'chain'), {waitUntil: 'domcontentloaded', timeout: 45000});
    if (!(await waitView(page, 30000))) throw new Error('#/t/hello not drawn');
    await settle(page, 4000);
    for (let s = 1; s <= CHAIN_MAX; s++) {
      if (Date.now() > end) { C.cut = 'time'; break; }
      const from = norm(await page.evaluate(() => location.hash || '#/'));
      cur = 'chain ' + from;
      const loc = (from === '#/' ? page.locator('section.th-home a.th-next') : page.locator('a.th-next')).last();
      const step = {k: s, from};
      C.steps.push(step);
      await loc.waitFor({state: 'attached', timeout: 5000}).catch(() => {});
      if (!(await loc.count())) { step.ok = false; step.why = from === '#/' ? 'no section.th-home a.th-next' : 'no a.th-next'; break; }
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
    D.ok = !D.broke && !D.skipped && D.routes.length === ROUTES.length && D.routes.every(r => !r.fail) && !D.errors.length && !D.overflow.length && !D.small.length && !D.tap.length && !D.nextOne.length && C.ok;
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

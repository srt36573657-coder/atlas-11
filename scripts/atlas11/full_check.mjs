#!/usr/bin/env node
/* ATLAS 11 · 빠짐없이 도는 검사기 v3(규칙 34) — 10배 빠르고 10배 꼼꼼하게
   사장님 2026-10-08 06:42 「시간이 너무 걸리는 문제를 시스템으로 먼저 개선한 후 지금보다 10배 빠르면서도 10배 정교한 시스템이 되는 구조를 먼저 짠 이후 작업하라」
   v2(01:31 · 05:05 · full_check_v2.mjs)는 화면마다 주소를 바꾸고 0.26초씩 기다려 22분(화면 4,286곳 · 영어 · 한국어 두 말). v3:
     ① 화면 안 순회 — 검사기가 화면 안에서 주소를 바꾸고 「다 그린 순간」(받는 파일 0 · 번역 끝 · 다음 그림 틀)을 잼(app.js atlasRoute) · 정해 둔 기다림 0
        다섯 나라 모든 화면 × 영어(390×640 · 글이 가장 긴 말) · 한국어(360×640 · 사장님이 보는 말 · 가장 좁은 폭)
        화면마다: 그림 한 장 · 끝 모습 · 그림 숫자 = 판 자료로 따로 센 값(art_expect.mjs) · 보이는 % 글 · 이름 · 숫자가 아래 탭 위 · 옆 넘침(문서 + 그림 칸 부품마다)
                 · NaN 같은 글자 없음 · 링크가 판에 있는 곳 · 화면 오류 0 · 걸음 계획(기승전결 넷 · 걸음마다 그림 번호 하나 · 움직이는 부품은 다 걸음에 묶임)
     ② 계산 층 — 한국어로 그린 모든 화면의 글(글자 · 읽기 이름표 · 창 제목)을 사이트 번역 함수 그대로(i18n.js · 판 이름 더하기까지) 73개 말로 바꿔 남은 한국어 0
        (v2: 영어 한 말만 · v3: 73개 말 전부)
     ③ 가장 긴 글 층 — 말마다(73) · 화면 종류마다(15) 글이 가장 긴 화면(다섯 나라 가운데)을 그 말로 열어 한 화면 · 옆 넘침 · 가장 큰 글씨(200%) 옆 넘침
     ④ 움직임 — 화면 종류 × 다섯 나라를 4배속으로(art.js atlas11:speed · CSS 는 브라우저 시간을 4배로) 화면 안에서 매 프레임 셈: 한 번에 하나 · 기승전결 넷 · 360×640 · 430×700 한 화면
     ⑤ 빈 날 길 — 판 자료를 바꿔치기(판 목록 해시도 같이) — 한국 판 일부 빔 · 미국 판 모두 빔 · 없는 주소 셋 · 못 읽은 파일 → 두 말로 그림 한 장(빈 하늘) · 기대값 · 움직임
   결과: reports/atlas11/full-check/latest.json(schema 3) — 올리기 문(art_gate.mjs)이 지문 · 다섯 나라 · 두 말 · 73개 말 · 빈 날 · 실패 0 을 봄
   쓰는 법: node scripts/atlas11/full_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--boards kr,us] [--quick] [--kinds home,map] [--lay] [--edge-only] [--jobs 3] [--out 파일] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {Worker} from 'node:worker_threads';
import {existsSync} from 'node:fs';
import {setPlace} from '../../site/app/util.js';
import {codePrint} from './art_gate.mjs';
import {familyOf} from '../../site/app/family.js'; // 갈래 이름표(자료) — 링크 검사용
import {expectOf, compare as cmp, pctText} from './art_expect.mjs'; // 그림 숫자의 기대값(판 자료로 따로 셈 · browser_check 와 함께 씀)

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8823'), PW = arg('--pw', '/opt/node-tools'), EDGE_ONLY = process.argv.includes('--edge-only'), QUICK = process.argv.includes('--quick') || EDGE_ONLY || process.argv.includes('--kinds');
const BOARDS = arg('--boards', 'kr,us,cn,jp,vn').split(','), OUT = arg('--out', 'reports/atlas11/full-check/latest.json'), JOBS = Number(arg('--jobs', '3'));
const LAY = (!QUICK || process.argv.includes('--lay')) && !process.argv.includes('--nolay'); // 고치는 동안 가장 긴 글 층만 더(--kinds home --lay) — 결과는 여전히 빠른 검사(문을 못 지남)
const KINDS = arg('--kinds', null)?.split(',') ?? null; // 고치는 동안: 화면 종류만 골라 빠르게(home,map,land,ind,co,similar,rise,road,agenda,find,log,start,guide,long,korea) — 결과는 빠른 검사로 적혀 문을 못 지남
const ROOT = process.cwd(), DIST = path.join(ROOT, 'dist'), PRE = {kr: '/', us: '/us/', cn: '/cn/', jp: '/jp/', vn: '/vn/'};
const SPEED = 4; // 움직임 검사 빠르기(걸음 사이 0.15초 틈이 0.04초 — 프레임마다 셈)
const require = createRequire(PW.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const fin = v => typeof v === 'number' && Number.isFinite(v);
const HAN = /[가-힣]/;
const fails = [], stats = {pages: 0, byLang: {}, plans: 0, numbers: 0, links: 0, texts: 0, motion: 0, edge: 0, transLangs: 0, transStrings: 0, layoutLangs: 0, layoutPages: 0};
const bad = (b, r, what) => { fails.push({board: b, route: r, what}); };
const compare = (b, r, got, want) => { stats.numbers += cmp(got, want, w => bad(b, r, w)); };
const t0 = Date.now(), lap = {};
const tick = k => { lap[k] = Math.round((Date.now() - t0) / 100) / 10; };

/* ── 화면 안에서 도는 것(바깥 변수를 쓰지 않음 — page.evaluate 로 보냄) ── */
// 새 창 맨 처음: 받는 파일 수 세기 · 오류 모으기
const INIT = ({speed}) => {
  window.__inflight = 0; window.__errs = [];
  const f = window.fetch.bind(window);
  window.fetch = (...a) => { window.__inflight++; return f(...a).finally(() => { window.__inflight--; }); };
  window.addEventListener('error', e => { const t = String(e.message ?? e); if (!/^ResizeObserver loop/.test(t)) window.__errs.push(t); }); // ResizeObserver 알림 = 크기 알림을 다음 프레임으로 미룸(화면 오류가 아님 · 사람 화면에 보이지 않음)
  window.addEventListener('unhandledrejection', e => window.__errs.push(String(e.reason?.message ?? e.reason)));
  if (speed) { try { localStorage.setItem('atlas11:speed', String(speed)); } catch {} }
};
// 화면 여러 곳을 차례로 — 다 그린 순간 잼(collect = 한국어 글 · 한 화면 글을 모음)
const CRAWL = async ({routes, collect}) => {
  const KO = /[가-힣]/, ATTRS = ['aria-label', 'title', 'placeholder', 'alt', 'data-speak'];
  const settle = async () => { for (let i = 0; i < 800 && (window.__inflight || 0) > 0; i++) await new Promise(r => setTimeout(r, 5)); await new Promise(r => setTimeout(r, 0)); }; // 받는 파일 0 → 한 번 쉼(번역 관찰자 · 미룬 일이 끝남) · 잴 때 브라우저가 자리를 바로 셈(프레임을 기다리지 않음)
  const skip = el => { if (!el || el.closest('script, style, noscript, .lang')) return true; const k = el.closest('[lang="ko"]'); return !!k && k !== document.documentElement; }; // 원문 표시(lang="ko") 안은 뺌 — 한국어 화면의 <html lang="ko"> 는 빼지 않음 · 말 고르기 메뉴(.lang)는 말마다 그 말로 새로 그림(번역이 아님)
  const cls = x => String(x.className?.baseVal ?? x.className ?? '').split(' ')[0] || x.tagName;
  const out = [];
  for (const hash of routes) {
    const e0 = window.__errs.length;
    document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', ''));
    try { await window.atlasRoute(hash); } catch (e) { window.__errs.push(String(e?.message ?? e)); }
    await settle();
    const m = {hash};
    m.arts = new Set(document.querySelectorAll('#main section[data-art], #main section.rt[data-place]')).size;
    const ra = document.querySelector('#main .ra:not([data-old])'), sec = ra?.closest('section');
    const chk = document.querySelector('#main [data-check]'); try { m.check = chk ? JSON.parse(chk.dataset.check) : null; } catch { m.check = 'bad-json'; }
    const rt = document.querySelector('#main section.rt[data-place]'); try { m.rot = rt?.dataset.check ? JSON.parse(rt.dataset.check) : null; } catch { m.rot = 'bad-json'; }
    const labs = ra ? [...ra.querySelectorAll('.ra-lab')] : [];
    m.labText = labs.map(x => x.innerText).join(' | ');
    m.labBottom = labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) : null;
    m.tabTop = document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight;
    m.sw = document.documentElement.scrollWidth; m.cw = document.documentElement.clientWidth;
    m.over = []; if (sec) for (const x of sec.querySelectorAll('*')) { const r = x.getBoundingClientRect(); if (r.width && r.right > m.cw + 1) { m.over.push(cls(x)); if (m.over.length >= 3) break; } }
    m.done = !!ra?.classList.contains('ra-done');
    m.plan = ra?.dataset.plan ?? null;
    m.ats = ra ? [...new Set([...ra.querySelectorAll('[data-at]')].map(x => x.dataset.at))] : [];
    m.loose = ra ? [...ra.querySelectorAll('.ra-art [class*="ak-"]')].filter(x => !x.closest('[data-at]')).map(cls).slice(0, 3) : [];
    m.weird = (document.getElementById('main')?.textContent.match(/\b(NaN|undefined|Infinity|null)\b|\[object /g) ?? []).slice(0, 3); // 접힌 칸 안 글까지(자리 셈 없이 빠르게)
    m.links = [...document.querySelectorAll('#main a[href^="#/"]')].map(a => a.getAttribute('href')).filter(h => /^#\/(i|stock|map\/f)\//.test(h));
    m.errs = window.__errs.slice(e0);
    // 맨 위 하규 응원 · 건의 줄(2026-10-08 14:42 마카오 시각 「하규야 힘내라하고 연락처가 아래 있다 위로 올려」) — 모든 화면: 위 막대 바로 다음 · 본문 바로 앞 · 응원 글 · 문자 고리 · 맨 아래 줄에는 다시 나오지 않음
    { const t = document.getElementById('topnote'), tp = document.getElementById('top'), mn = document.getElementById('main');
      m.note = !!t && tp?.nextElementSibling === t && t.nextElementSibling === mn && t.getBoundingClientRect().height > 0 && !!t.querySelector('.tn-cheer')?.textContent.trim() && !!t.querySelector('.tn-contact a[href="sms:+821090117377"]')?.textContent.includes('010-9011-7377');
      m.footDup = !!document.querySelector('#main .b-foot a[href^="sms:"], #main .b-foot .b-cheer, #main .b-foot .b-contact'); }
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), left = new Set(), texts = new Set();
    for (let n = w.nextNode(); n; n = w.nextNode()) if (KO.test(n.nodeValue) && !skip(n.parentElement)) { if (collect) texts.add(n.nodeValue); else left.add(n.nodeValue.trim().slice(0, 60)); }
    if (collect) {
      for (const el of document.querySelectorAll('[aria-label], [title], [placeholder], [alt], [data-speak]')) { if (skip(el)) continue; const keep = el.getAttribute('data-orig-attr')?.split(' ') ?? []; for (const a of ATTRS) { if (keep.includes(a)) continue; const v = el.getAttribute(a); if (v && KO.test(v)) texts.add(v); } }
      if (KO.test(document.title)) texts.add(document.title);
      m.texts = [...texts];
      // 한 화면 글(가장 긴 글 층) — 그림 위 되돌아가기 · 제목 · 그림 이름표 · 그림 아래 이름 · 숫자
      m.lay = []; for (const el of document.querySelectorAll('#main .c-back, #main .b-title, #main .sy-k, #main .ra-t, #main .ra-lab')) { const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let n = w2.nextNode(); n; n = w2.nextNode()) if (n.nodeValue.trim()) m.lay.push(n.nodeValue); }
    } else m.left = [...left].slice(0, 6);
    out.push(m);
  }
  return out;
};
// 움직임 하나 — 주소를 바꾸고 다 그린 뒤 매 프레임: 지금 움직이는 것 수(기다리는 지연 · 끝난 그림 · 누른 단추 · 아래 탭 표시는 뺌) · 기승전결 점
const MOTION = async ({hash, limit}) => {
  document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', ''));
  await window.atlasRoute(hash);
  let most = 0; const beats = new Set(), t1 = performance.now();
  const running = a => { if (a.playState !== 'running' || a.effect?.target?.closest?.('.ra-done, #bottom, [aria-pressed], [aria-current]')) return false; const tm = a.effect?.getComputedTiming?.(); if (!tm) return false; const lt = tm.localTime ?? 0, d = a.effect.getTiming(), delay = d.delay ?? 0, dur = typeof tm.activeDuration === 'number' ? tm.activeDuration : Infinity; return lt >= delay && lt < delay + dur; };
  await new Promise(res => { const f = () => { most = Math.max(most, document.getAnimations().filter(running).length); const ra = document.querySelector('#main .ra:not([data-old])'); if (ra?.dataset.c != null) beats.add(ra.dataset.c); if (ra?.classList.contains('ra-done') || performance.now() - t1 > limit) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
  return {most, beats: [...beats], done: !!document.querySelector('#main .ra:not([data-old]).ra-done'), ms: Math.round(performance.now() - t1)};
};
const FIT = () => { const labs = [...(document.querySelector('#main .ra')?.querySelectorAll('.ra-lab') ?? [])]; return {lb: labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) : null, tab: document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; };

/* ── 창 열기 · 일 나눠 돌리기 ── */
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'; // 같은 크롬 엔진 · 창 없는 가벼운 판(빠름)
const browser = await chromium.launch({executablePath: existsSync(SHELL) ? SHELL : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
async function openPage(b, lang, vp, {motion = false, forge = null} = {}) {
  const ctx = await browser.newContext({viewport: vp, colorScheme: 'dark', isMobile: true, hasTouch: true, reducedMotion: motion ? 'no-preference' : 'reduce'});
  await ctx.addInitScript(INIT, {speed: motion ? SPEED : 0});
  if (forge) await forge(ctx);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !(forge && /Failed to load resource/.test(m.text()))) page.evaluate(t => window.__errs?.push(t), m.text()).catch(() => {}); });
  if (motion) { const cdp = await ctx.newCDPSession(page); await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {playbackRate: SPEED}); }
  await page.goto(`${BASE}${PRE[b]}?lang=${lang}#main`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1' && typeof window.atlasRoute === 'function', null, {timeout: 30000});
  return {ctx, page};
}
async function pool(tasks, n) { let i = 0; const run = async () => { while (i < tasks.length) { const k = i++; await tasks[k](); } }; await Promise.all(Array.from({length: Math.min(n, tasks.length)}, run)); }

/* ── 판 자료 · 기대값 ── */
const places = (await readJson(path.join(DIST, 'places.json'))).places, others = [], boardOf = {};
for (const p of places) { try { const bd = await readJson(path.join(DIST, p.href.replace(/^\//, ''), 'data/atlas11/view/board.json')); boardOf[p.id] = bd; others.push({id: p.id, label: p.label, n: bd.companies.length}); } catch { bad(p.id, '#/find', '판을 읽지 못함'); } }
const story = await readJson(path.join(DIST, 'story.json')).catch(() => null), log = await readJson(path.join(DIST, 'changelog.json')).catch(() => null);
const namesKr = (await readJson(path.join(DIST, 'data/atlas11/names-kr.json')).catch(() => null))?.names ?? null;
const S = {}; // 판마다 · 화면 목록 · 기대값
for (const b of BOARDS) {
  const board = boardOf[b], agenda = await readJson(path.join(DIST, PRE[b].replace(/^\//, ''), 'data/atlas11/view/agenda.json')).catch(() => null);
  setPlace({id: b}); // familyOf 는 판마다 갈래 표가 다름 — 판을 먼저 고르고 셈(v3 첫 판이 판을 하나씩 밀려 셈하던 것)
  const groups = board.groups ?? [], famIds = [...new Set(groups.map(g => familyOf(g.label).id))];
  const routes = [['#/', 'home'], ['#/map', 'map'], ...famIds.map(f => [`#/map/f/${f}`, 'land', f]), ...groups.map(g => [`#/i/${g.id}`, 'ind', g.id]),
    ...(QUICK ? board.companies.slice(0, 12) : board.companies).map(c => [`#/stock/${c.code}`, 'co', c.code]),
    ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'], ['#/agenda', 'agenda'], ['#/find', 'find'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea']];
  const picked = KINDS ? routes.filter(r => KINDS.includes(r[1])) : routes;
  S[b] = {board, routes: picked, kindOf: new Map(routes.map(r => [r[0], r])), E: expectOf(b, board, agenda, story, log, others), gids: new Set(groups.map(g => g.id)), codes: new Set(board.companies.map(c => c.code)), famIds};
}

/* ── 한 화면 판정(바깥에서 — 잰 값으로) ── */
const PLAN_C = [0, 1, 2, 3];
function planProblem(m) {
  if (!m.plan) return '걸음 계획(data-plan) 없음';
  const st = m.plan.split(',').map(x => x.split(':').map(Number)), cs = st.map(x => x[0]), ats = st.map(x => x[1]);
  if (!PLAN_C.every(c => cs.includes(c))) return `기승전결 넷이 아님(${[...new Set(cs)].join(' ')})`;
  for (let i = 1; i < st.length; i++) { if (cs[i] < cs[i - 1]) return '기승전결 차례가 거꾸로'; if (ats[i] <= ats[i - 1]) return '그림 번호 차례가 거꾸로 · 겹침'; }
  const have = new Set(m.ats.map(Number)), empty = ats.filter(a => !have.has(a));
  if (empty.length) return `움직일 부품이 없는 걸음 ${empty.join(' · ')}`;
  if (m.loose.length) return `걸음에 묶이지 않은 움직임 부품 ${m.loose.join(' ')}`;
  return null;
}
function judge(m, {b, kind, id, E, gids, codes, famIds, lang, tag, layoutOnly = false, bigFont = false}) {
  const where = tag ? `${m.hash} [${tag}]` : m.hash, no = w => bad(b, where, w);
  if (m.errs?.length) no('화면 오류: ' + m.errs.slice(0, 2).join(' / '));
  if (m.sw > m.cw + 1) no(`옆으로 넘침 ${m.sw} > ${m.cw}`);
  if (m.over?.length) no('그림 칸 부품이 옆으로 넘침: ' + m.over.join(' '));
  if (!m.note) no('맨 위 하규 응원 · 건의 줄이 없음(위 막대 바로 아래 · 문자 고리 010-9011-7377)');
  if (m.footDup) no('맨 아래 줄에 하규 응원 · 건의 줄이 또 있음(맨 위로 옮김 · 규칙 1)');
  if (bigFont) return; // 가장 큰 글씨는 옆 넘침만(한 화면은 보통 글씨 규칙)
  if (m.arts !== 1) no(`그림 수 ${m.arts}(1이어야 함)`);
  if (!m.done) no('움직임 줄이기 설정에서 끝 모습이 아님');
  if (m.labBottom == null || m.labBottom > m.tabTop + 0.5) no(`이름 · 숫자가 한 화면 밖(아래 끝 ${Math.round(m.labBottom)} · 탭 ${Math.round(m.tabTop)})`);
  if (m.weird.length) no('이상한 글자: ' + m.weird.join(' '));
  if (lang !== 'ko' && m.left?.length) no('번역 안 된 한국어: ' + m.left.join(' / '));
  if (layoutOnly) return;
  const pp = planProblem(m); stats.plans++; if (pp) no('걸음 계획: ' + pp);
  for (const l of m.links) { stats.links++; const [, k, v] = /^#\/(i|stock|map\/f)\/(.+)$/.exec(l) ?? []; if (k === 'i' && !gids.has(v)) no('없는 업종 링크 ' + l); if (k === 'stock' && !codes.has(decodeURIComponent(v))) no('없는 회사 링크 ' + l); if (k === 'map/f' && !famIds.includes(v)) no('없는 갈래 링크 ' + l); }
  // 그림 숫자 ↔ 판 자료(따로 셈) — 값이 비는 날은 빈 하늘({quiet: 화면}) · 없는 주소 · 못 읽은 파일은 오류 화면의 빈 하늘({quiet: 'fail'})
  const want = kind === 'home' ? E.home : kind === 'map' ? E.map : kind === 'land' ? E.land[id] ?? {quiet: 'land'} : kind === 'ind' ? E.ind[id] ?? {quiet: 'industry'} : kind === 'co' ? E.co[id] ?? {quiet: 'fail'}
    : kind === 'similar' ? E.similar : kind === 'rise' ? E.rise : kind === 'road' ? E.road : kind === 'agenda' ? E.agenda : kind === 'find' ? E.find : kind === 'log' ? E.log : kind === 'start' ? E.start : null;
  if (kind === 'home') compare(b, where, E.home.quiet ? m.check : m.rot, want);
  if (kind === 'home' && !E.home.quiet) { const o = m.rot?.outs ?? [], i2 = m.rot?.ins ?? []; stats.numbers += o.length + i2.length; if (o.some((x, k) => k && o[k - 1][1] > x[1])) no('빠지는 곳 1위~3위가 가장 많이 나간 순이 아님'); if (i2.some((x, k) => k && i2[k - 1][1] < x[1])) no('들어가는 곳 1위~3위가 가장 많이 들어간 순이 아님'); } // 10월 8일 12:59 「가장 많이 나간 순」
  else if (['guide', 'long', 'korea'].includes(kind)) { if (!m.check) no('그림 값(data-check) 없음'); }
  else compare(b, where, m.check, want);
  for (const k of ['topAvg', 'v0', 'v', 'avg', 'vl']) if (fin(want?.[k]) && ['map', 'land', 'ind', 'co', 'similar', 'rise', 'road'].includes(kind)) { stats.texts++; if (!m.labText.includes(pctText(want[k]))) no(`보이는 글에 ${pctText(want[k])} 없음`); }
}

/* ── ① 화면 안 순회(영어 · 한국어) + ④ 움직임 ── */
const VP = {en: {width: 390, height: 640}, ko: {width: 360, height: 640}};
const koPages = []; // 한국어로 그린 화면(글 모음) — ② ③ 이 씀
const tasks = [];
for (const b of EDGE_ONLY ? [] : BOARDS) for (const lang of ['en', 'ko']) tasks.push(async () => {
  const {ctx, page} = await openPage(b, lang, VP[lang]);
  const res = await page.evaluate(CRAWL, {routes: S[b].routes.map(r => r[0]), collect: lang === 'ko'});
  for (const m of res) { const [, kind, id] = S[b].kindOf.get(m.hash); judge(m, {b, kind, id, ...S[b], lang, tag: lang === 'en' ? null : lang}); stats.pages++; stats.byLang[lang] = (stats.byLang[lang] ?? 0) + 1; if (lang === 'ko') koPages.push({b, kind, id, hash: m.hash, texts: m.texts, lay: m.lay}); }
  await ctx.close(); console.log(`${b} · ${lang}: 화면 ${res.length}곳 · ${Math.round((Date.now() - t0) / 1000)}초 · 실패 지금까지 ${fails.length}`);
});
for (const b of EDGE_ONLY ? [] : BOARDS) tasks.push(async () => {
  const {ctx, page} = await openPage(b, 'ko', {width: 390, height: 640}, {motion: true});
  const kinds = [...new Map(S[b].routes.map(r => [r[1], r])).values()];
  for (const [hash] of QUICK ? kinds.slice(0, 6) : kinds) await motionOne(page, b, hash);
  await ctx.close(); console.log(`${b} · 움직임 ${QUICK ? 6 : kinds.length}종 · ${Math.round((Date.now() - t0) / 1000)}초`);
});
async function motionOne(page, b, hash, tag = null) {
  const where = tag ? `${hash} [${tag}]` : hash;
  await page.setViewportSize({width: 390, height: 640});
  const r = await page.evaluate(MOTION, {hash, limit: 8000}).catch(e => ({fail: String(e)}));
  stats.motion++;
  if (r.fail) { bad(b, where, '움직임을 재지 못함: ' + r.fail); return; }
  if (r.most > 1) bad(b, where, `한 번에 ${r.most}개가 움직임(1이어야 함)`);
  if (r.beats.length < 4) bad(b, where, `기승전결 가운데 ${r.beats.length}개만 짚음`);
  if (!r.done) bad(b, where, `움직임이 ${r.ms}ms 안에 끝나지 않음`);
  for (const vp of [{width: 360, height: 640}, {width: 430, height: 700}]) {
    await page.setViewportSize(vp); await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))));
    const f = await page.evaluate(FIT);
    if (f.lb == null || f.lb > f.tab + 0.5) bad(b, where, `${vp.width}×${vp.height}: 이름 · 숫자가 한 화면 밖(${Math.round(f.lb)} > ${Math.round(f.tab)})`);
    if (f.sw > f.cw + 1) bad(b, where, `${vp.width}×${vp.height}: 옆으로 넘침`);
  }
}

/* ── ⑤ 빈 날 길 — 판 자료 바꿔치기 ── */
const sha = t => createHash('sha256').update(t).digest('hex');
async function forgeOf(b, board, stocks, missing) {
  const pre = PRE[b], vdir = pre + 'data/atlas11/view/', dir = path.join(DIST, pre.replace(/^\//, ''), 'data/atlas11/view');
  const man = await readJson(path.join(dir, 'manifest.json')), texts = {'board.json': JSON.stringify(board)};
  for (const [code, st] of Object.entries(stocks)) texts[`stocks/${code}.json`] = JSON.stringify(st);
  for (const [name, t] of Object.entries(texts)) if (man.files?.[name]) man.files[name] = {...man.files[name], sha256: sha(t), bytes: Buffer.byteLength(t)};
  const manText = JSON.stringify(man);
  return async ctx => ctx.route(u => u.pathname.startsWith(vdir) || missing.includes(u.pathname), route => {
    const p = new URL(route.request().url()).pathname;
    if (missing.includes(p)) return route.fulfill({status: 404, contentType: 'text/plain', body: 'not found'});
    const name = p.slice(vdir.length);
    if (name === 'manifest.json') return route.fulfill({status: 200, contentType: 'application/json', body: manText});
    if (texts[name] != null) return route.fulfill({status: 200, contentType: 'application/json', body: texts[name]});
    return route.continue();
  });
}
const EDGE = [];
if ((!QUICK || EDGE_ONLY) && BOARDS.includes('kr')) { // A — 한국 판 일부 빔
  const dir = path.join(DIST, 'data/atlas11/view'), bd = structuredClone(boardOf.kr);
  const gs = bd.groups.filter(g => (g.codes ?? []).length >= 2), byCode = new Map(bd.companies.map(c => [c.code, c]));
  const x1 = gs[0].codes[0], x2 = gs[1].codes[0], gNull = gs[2];
  byCode.get(x1).change20 = null; byCode.get(x2).group = null; for (const c of gNull.codes) byCode.get(c).change20 = null;
  bd.similar = {...(bd.similar ?? {}), items: []}; bd.next = {...(bd.next ?? {}), items: []}; bd.start = null;
  const s1 = {...await readJson(path.join(dir, `stocks/${x1}.json`)), change20: null}, s2 = {...await readJson(path.join(dir, `stocks/${x2}.json`)), group: null};
  EDGE.push({b: 'kr', name: '빈 날 A', board: bd, stocks: {[x1]: s1, [x2]: s2}, missing: ['/story.json', '/changelog.json', '/data/atlas11/view/agenda.json'], agenda: null,
    visits: [['#/', 'home'], ['#/i/' + gNull.id, 'ind', gNull.id], ['#/stock/' + x1, 'co', x1], ['#/stock/' + x2, 'co', x2], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/start', 'start'], ['#/agenda', 'agenda'], ['#/log', 'log'],
      ['#/road', 'road'], ['#/map', 'map'], ['#/find', 'find'], ['#/i/zznone', 'ind', 'zznone'], ['#/map/f/zznone', 'land', 'zznone'], ['#/stock/ZZNONE', 'co', 'ZZNONE']], motion: '#/similar'}); // 길잡이 규칙에 맞는 없는 주소(맞지 않으면 첫 화면으로 감)
}
if ((!QUICK || EDGE_ONLY) && BOARDS.includes('us')) { // B — 미국 판 모두 빔
  const dir = path.join(DIST, 'us/data/atlas11/view'), bd = structuredClone(boardOf.us);
  for (const c of bd.companies) c.change20 = null; for (const g of bd.groups) g.change20 = null;
  bd.similar = {...(bd.similar ?? {}), items: []}; bd.next = {...(bd.next ?? {}), items: []}; bd.start = null;
  const c0 = bd.companies[0].code, g0 = bd.groups[0].id, f0 = familyOf(bd.groups[0].label).id;
  const s0 = {...await readJson(path.join(dir, `stocks/${c0}.json`)), change20: null};
  EDGE.push({b: 'us', name: '빈 날 B', board: bd, stocks: {[c0]: s0}, missing: ['/story.json', '/changelog.json'], agenda: await readJson(path.join(dir, 'agenda.json')).catch(() => null),
    visits: [['#/', 'home'], ['#/map', 'map'], ['#/map/f/' + f0, 'land', f0], ['#/i/' + g0, 'ind', g0], ['#/stock/' + c0, 'co', c0], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'],
      ['#/agenda', 'agenda'], ['#/find', 'find'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea']], motion: '#/map'});
}
for (const x of EDGE) tasks.push(async () => {
  const forge = await forgeOf(x.b, x.board, x.stocks, x.missing), E = expectOf(x.b, x.board, x.agenda, null, null, others);
  const groups = x.board.groups ?? [], ctxS = {E, gids: new Set(groups.map(g => g.id)), codes: new Set(x.board.companies.map(c => c.code)), famIds: [...new Set(groups.map(g => familyOf(g.label).id))]};
  for (const lang of ['en', 'ko']) {
    const {ctx, page} = await openPage(x.b, lang, VP[lang], {forge});
    const res = await page.evaluate(CRAWL, {routes: x.visits.map(v => v[0]), collect: false});
    res.forEach((m, i) => { const [, kind, id] = x.visits[i]; judge(m, {b: x.b, kind, id, ...ctxS, lang, tag: `${x.name} · ${lang}`}); stats.edge++; stats.pages++; stats.byLang[lang] = (stats.byLang[lang] ?? 0) + 1; });
    await ctx.close();
  }
  const {ctx, page} = await openPage(x.b, 'ko', {width: 390, height: 640}, {motion: true, forge});
  await motionOne(page, x.b, x.motion, `${x.name} · 움직임`); await ctx.close();
  console.log(`${x.name}(${x.b}): 화면 ${x.visits.length * 2}곳 · ${Math.round((Date.now() - t0) / 1000)}초`);
});
await pool(tasks, JOBS); tick('crawl');

/* ── ② 계산 층(따로 도는 일꾼 — check/trans_worker.mjs) → ③ 가장 긴 글 층(말 하나가 끝나면 바로 그 말 화면을 엶 — 둘이 겹쳐 돎) ── */
const codesI18n = (await fs.readdir(path.join(ROOT, 'site/app/i18n'))).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
const allTexts = [...new Set(koPages.flatMap(p => p.texts))];
if (arg('--dump')) await fs.writeFile(arg('--dump'), JSON.stringify(allTexts)); // 번역 묶음을 만들 때: 한국어로 그린 모든 글(사전에 없는 틀을 뽑는 데 씀)
const layQ = [], layDone = {v: false};
async function layWorker() { for (;;) { const job = layQ.shift(); if (job) { await job(); continue; } if (layDone.v) return; await new Promise(r => setTimeout(r, 50)); } }
const layWorkers = koPages.length && LAY ? Array.from({length: Math.max(1, JOBS - 1)}, layWorker) : [];
function layJob(code, ps) {
  return async () => {
    const {ctx, page} = await openPage('kr', code, VP.ko);
    const r1 = await page.evaluate(CRAWL, {routes: ps.map(p => p.hash), collect: false});
    r1.forEach((mm, i) => { judge(mm, {b: 'kr', kind: ps[i].kind, id: ps[i].id, ...S.kr, lang: code, tag: `${code} · 가장 긴 글`, layoutOnly: true}); stats.layoutPages++; });
    await page.evaluate(() => window.atlasFont(4));
    const r2 = await page.evaluate(CRAWL, {routes: ps.map(p => p.hash), collect: false});
    r2.forEach((mm, i) => { judge(mm, {b: 'kr', kind: ps[i].kind, id: ps[i].id, ...S.kr, lang: code, tag: `${code} · 가장 긴 글 · 글씨 200%`, bigFont: true}); stats.layoutPages++; });
    await ctx.close(); stats.layoutLangs++;
  };
}
if (koPages.length) {
  stats.transStrings = allTexts.length;
  const krLay = koPages.filter(p => p.b === 'kr').map(p => ({kind: p.kind, id: p.id, hash: p.hash, lay: p.lay})); // 가장 긴 글 층은 한국 판 한 번 열기로(다른 판 이름은 ① 영어 · 한국어 모든 화면이 봄)
  await new Promise((res, rej) => {
    const w = new Worker(new URL('./check/trans_worker.mjs', import.meta.url), {workerData: {root: ROOT, codes: codesI18n, texts: allTexts, boards: Object.values(boardOf), namesKr, krLay}});
    w.on('message', msg => {
      if (msg.type === 'shapes') stats.transShapes = msg.shapes;
      if (msg.type === 'lang') {
        stats.transLangs++;
        if (msg.nLeft) bad('all', `?lang=${msg.code}`, `번역 안 된 한국어 ${msg.nLeft}줄: ${msg.left.map(x => x.slice(0, 40)).join(' / ')}`);
        if (msg.code !== 'en' && LAY && krLay.length) layQ.push(layJob(msg.code, msg.worst));
      }
      if (msg.type === 'done') res();
    });
    w.on('error', rej); w.on('exit', c => { if (c) rej(new Error('계산 층 일꾼이 멈춤 ' + c)); });
  });
}
tick('trans');
layDone.v = true; await Promise.all(layWorkers);
if (stats.layoutLangs) stats.layoutLangs += 2; // + 영어 · 한국어(① 모든 화면)
tick('layout');
await browser.close();

const report = {schema: 'atlas11-full-check-3', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), lap, code: await codePrint(ROOT), boards: BOARDS, quick: QUICK, langs: ['en', 'ko'], ...stats, failed: fails.length,
  ok: fails.length === 0 && !QUICK && BOARDS.length === 5 && stats.edge > 0 && stats.transLangs === codesI18n.length && stats.layoutLangs === codesI18n.length + 1, fails: fails.slice(0, 400)};
await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true});
await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({pages: stats.pages, byLang: stats.byLang, plans: stats.plans, numbers: stats.numbers, links: stats.links, texts: stats.texts, motion: stats.motion, edge: stats.edge, transLangs: stats.transLangs, transStrings: stats.transStrings, layoutLangs: stats.layoutLangs, layoutPages: stats.layoutPages, failed: fails.length, ok: report.ok, seconds: report.seconds, lap}));
for (const f of fails.slice(0, 40)) console.log(` ✗ ${f.board} ${f.route} — ${f.what}`);
process.exit(report.ok || (QUICK && !fails.length) ? 0 : 1);

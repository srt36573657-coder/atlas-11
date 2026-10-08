#!/usr/bin/env node
/* 2026-10-08 07시 — 옛 v2(화면마다 주소를 바꾸고 기다림 · 22분). 지금 검사기는 full_check.mjs(v3 · 화면 안 순회). 깊게 다시 볼 때만 씀 — 결과는 --out 으로 다른 곳에 */
/* ATLAS 11 · 빠짐없이 도는 검사기(규칙 34) — 사장님 2026-10-08 01:31 「너 대충했던 모든 곳을 100000만번 점검해서 더 정확히 해라 너 대충하고 있어 너 시스템으로 그짓 못하게 해」
   뽑아 보는 검사(browser_check)와 달리 화면을 하나도 빼지 않는다:
     다섯 나라(kr · us · cn · jp · vn) × 모든 화면 — 불장 · 지도 · 갈래 전부 · 업종 전부(73 · 40) · 회사 전부(365 · 200) · 예비 · 오름 상위 · 출목표 · 일정 · 찾기 · 기록 · 처음 · 안내 · 긴 눈 · 한국 순위
   화면마다 보는 것(하나라도 틀리면 실패 · 숫자로 적음):
     ① 그림 한 장이 있다(돈의 이동 또는 화면 그림 · 한 화면에 하나)
     ② 그림 숫자 = 판 자료로 이 파일이 따로 다시 셈한 값(사이트 코드를 쓰지 않고 셈 — 같은 잘못을 같이 하지 않게) · 보이는 글의 숫자도 같은지
     ③ 그림과 이름 · 숫자가 아래 탭 위에 다 들어감(390×640 · 한 화면에 메인 정보 · 규칙 30)
     ④ 옆으로 넘치지 않음 · ⑤ NaN · undefined · Infinity · null 글자 없음 · ⑥ 화면 안 링크(업종 · 회사 · 갈래)가 판에 있는 곳을 가리킴
     ⑦ 영어 화면에서 한국어가 남지 않음(번역 사전에 없는 말 = 실패 · 이름 · 일부러 한국어로 둔 글자는 뺌) · ⑧ 화면 오류 없음
   그다음 화면 종류마다(나라 다섯 × 15) 움직임을 켜고: ⑨ 한 번에 하나만 움직임 · ⑩ 기승전결 넷이 모두 짚어짐 · ⑪ 360×640 · 430×700 에서도 한 화면
   결과: reports/atlas11/full-check/latest.json — 화면 코드 지문(code) · 화면 수 · 맞댄 숫자 수 · 실패 목록
   이 결과가 「문」: 판을 쌀 때(package.mjs → art_gate.mjs) 지금 화면 코드 지문과 같고 실패 0 이 아니면 사이트에 올라가지 않는다(자동 올리기도 같음)
   2026-10-08 05:05 더함: 모든 화면을 두 말로(영어 390×640 · 한국어 360×640 — 창 둘을 함께) · ⑫ 빈 날 길(자료 바꿔치기 — 값이 비는 날 · 없는 주소 · 못 읽은 파일에도 그림 한 장 · 빈 하늘)
   쓰는 법: node scripts/atlas11/full_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--boards kr,us] [--quick] [--edge-only] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {codePrint} from './art_gate.mjs';
import {familyOf} from '../../site/app/family.js'; // 갈래 이름표(자료) — 링크 검사용
import {expectOf, compare as cmp, pctText} from './art_expect.mjs'; // 그림 숫자의 기대값(판 자료로 따로 셈 · browser_check 와 함께 씀)

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8823'), PW = arg('--pw', '/opt/node-tools'), EDGE_ONLY = process.argv.includes('--edge-only'), QUICK = process.argv.includes('--quick') || EDGE_ONLY; // --edge-only = 빈 날 길만(고치는 동안 빠르게 · 결과는 빠른 검사로 적혀 문을 못 지남)
const BOARDS = arg('--boards', 'kr,us,cn,jp,vn').split(','), OUT = arg('--out', 'reports/atlas11/full-check/latest.json');
const ROOT = process.cwd(), DIST = path.join(ROOT, 'dist'), PRE = {kr: '/', us: '/us/', cn: '/cn/', jp: '/jp/', vn: '/vn/'};
const require = createRequire(PW.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const fin = v => typeof v === 'number' && Number.isFinite(v);
const fails = [], stats = {pages: 0, numbers: 0, links: 0, texts: 0, motion: 0, edge: 0, byLang: {}};
const bad = (b, r, what) => { fails.push({board: b, route: r, what}); };
const compare = (b, r, got, want) => { stats.numbers += cmp(got, want, w => bad(b, r, w)); };

/* ── 한 화면 재기(페이지 안) ── */
const PAGE_PROBE = () => {
  const HAN = /[가-힣]/, out = {};
  const arts = [...document.querySelectorAll('#view section[data-art], #view section.rt[data-place], main section[data-art], main section.rt[data-place]')];
  out.arts = [...new Set(arts)].length;
  const chk = document.querySelector('[data-check]'); out.check = chk ? JSON.parse(chk.dataset.check) : null;
  out.rot = document.querySelector('section.rt[data-place]')?.dataset.check ? JSON.parse(document.querySelector('section.rt[data-place]').dataset.check) : null;
  const lab = document.querySelector('.ra-lab')?.closest('.ra')?.querySelector('.ra-lab'), labs = [...(document.querySelector('.ra')?.querySelectorAll('.ra-lab') ?? [])];
  out.labText = labs.map(x => x.innerText).join(' | ');
  out.labBottom = labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) : null;
  out.artTop = document.querySelector('.ra-art')?.getBoundingClientRect().top ?? null;
  out.tabTop = document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight;
  out.sw = document.documentElement.scrollWidth; out.cw = document.documentElement.clientWidth;
  const txt = document.body.innerText; out.weird = (txt.match(/\b(NaN|undefined|Infinity|null)\b|\[object /g) ?? []).slice(0, 3);
  out.links = [...document.querySelectorAll('a[href^="#/"]')].map(a => a.getAttribute('href')).filter(h => /^#\/(i|stock|map\/f)\//.test(h));
  const left = [], skip = el => !el || el.closest('[lang="ko"], script, style, noscript');
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (HAN.test(n.nodeValue) && !skip(n.parentElement)) left.push(n.nodeValue.trim().slice(0, 60));
  out.left = [...new Set(left)].slice(0, 6);
  out.steps = Number(document.querySelector('.ra')?.dataset.steps ?? 0); out.done = !!document.querySelector('.ra.ra-done');
  return out;
};

const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
const t0 = Date.now(), places = (await readJson(path.join(DIST, 'places.json'))).places;
const others = [];
for (const p of places) { try { const bd = await readJson(path.join(DIST, p.href.replace(/^\//, ''), 'data/atlas11/view/board.json')); others.push({id: p.id, label: p.label, n: bd.companies.length}); } catch { bad(p.id, '#/find', '판을 읽지 못함'); } }
const story = await readJson(path.join(DIST, 'story.json')).catch(() => null), log = await readJson(path.join(DIST, 'changelog.json')).catch(() => null);

/** 화면 하나를 재고 맞대기 — 영어 · 한국어 길(pass)이 함께 씀 · lang = 'en' 이면 남은 한국어도 봄 · tag = 실패 줄에 붙일 이름(「ko」 · 「빈 날 A」 …) */
async function probeOne(page, errs, {b, hash, kind, id, E, gids, codes, famIds, lang, tag}) {
  const where = tag ? `${hash} [${tag}]` : hash, no = w => bad(b, where, w);
  errs.length = 0;
  // 앞 화면 그림에 표를 해 두고 주소를 바꾼 뒤 새 그림이 뜰 때까지 기다림(두 창을 함께 돌려 느려져도 앞 화면을 재지 않게)
  await page.evaluate(h => { document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', '')); location.hash = h; }, hash);
  await page.waitForFunction(h => location.hash === h && document.querySelector('#view, main')?.childElementCount > 0 && !!document.querySelector('.ra:not([data-old])'), hash, {timeout: 8000}).catch(() => {});
  await page.waitForTimeout(kind === 'find' || kind === 'log' ? 700 : 260);
  const m = await page.evaluate(PAGE_PROBE).catch(e => ({fail: String(e)}));
  stats.pages++; stats.byLang[lang] = (stats.byLang[lang] ?? 0) + 1;
  if (m.fail) { no('화면을 재지 못함: ' + m.fail); return; }
  if (errs.length) no('화면 오류: ' + errs.slice(0, 2).join(' / '));
  if (m.arts !== 1) no(`그림 수 ${m.arts}(1이어야 함)`);
  if (!m.done) no('움직임 줄이기 설정에서 끝 모습이 아님');
  if (m.labBottom == null || m.labBottom > m.tabTop + 0.5) no(`이름 · 숫자가 한 화면 밖(아래 끝 ${Math.round(m.labBottom)} · 탭 ${Math.round(m.tabTop)})`);
  if (m.sw > m.cw + 1) no(`옆으로 넘침 ${m.sw} > ${m.cw}`);
  if (m.weird.length) no('이상한 글자: ' + m.weird.join(' '));
  if (lang === 'en' && m.left.length) no('번역 안 된 한국어: ' + m.left.join(' / '));
  for (const l of m.links) { stats.links++; const [, k, v] = /^#\/(i|stock|map\/f)\/(.+)$/.exec(l) ?? []; if (k === 'i' && !gids.has(v)) no('없는 업종 링크 ' + l); if (k === 'stock' && !codes.has(decodeURIComponent(v))) no('없는 회사 링크 ' + l); if (k === 'map/f' && !famIds.includes(v)) no('없는 갈래 링크 ' + l); }
  // 그림 숫자 ↔ 판 자료(따로 셈) — 값이 비는 날은 빈 하늘({quiet: 화면})이어야 함 · 없는 주소 · 못 읽은 파일은 오류 화면의 빈 하늘({quiet: 'fail'})
  const want = kind === 'home' ? E.home : kind === 'map' ? E.map : kind === 'land' ? E.land[id] ?? {quiet: 'land'} : kind === 'ind' ? E.ind[id] ?? {quiet: 'industry'} : kind === 'co' ? E.co[id] ?? {quiet: 'fail'}
    : kind === 'similar' ? E.similar : kind === 'rise' ? E.rise : kind === 'road' ? E.road : kind === 'agenda' ? E.agenda : kind === 'find' ? E.find : kind === 'log' ? E.log : kind === 'start' ? E.start : null;
  if (kind === 'home') compare(b, where, E.home.quiet ? m.check : m.rot, want);
  else if (['guide', 'long', 'korea'].includes(kind)) { if (!m.check) no('그림 값(data-check) 없음'); }
  else compare(b, where, m.check, want);
  // 보이는 % 글 — 그림 값의 변화율이 이름 · 숫자 칸에 그대로 보이는지
  for (const k of ['topAvg', 'v0', 'v', 'avg', 'vl']) if (fin(want?.[k]) && ['map', 'land', 'ind', 'co', 'similar', 'rise', 'road'].includes(kind)) { stats.texts++; if (!m.labText.includes(pctText(want[k]))) no(`보이는 글에 ${pctText(want[k])} 없음`); }
}
/** 새 창(움직임 줄이기 · 어두운 화면) — lang 'en' 은 ?lang=en · 'ko' 는 ?lang=ko · forge = 자료 바꿔치기(빈 날 길) */
async function openPage(b, lang, {width, height}, forge = null) {
  const ctx = await browser.newContext({viewport: {width, height}, colorScheme: 'dark', isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
  if (forge) await forge(ctx);
  const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !(forge && /Failed to load resource/.test(m.text()))) errs.push(m.text()); }); // 빈 날 길은 일부러 없앤 파일(404)을 오류로 세지 않음
  await page.goto(`${BASE}${PRE[b]}?lang=${lang}#/`, {waitUntil: 'networkidle'}); await page.waitForTimeout(900);
  return {ctx, page, errs};
}
/** ⑨⑩⑪ 움직임 하나 — 아래 탭을 누르는 것과 같은 길(주소 # 만 바뀜) · 앞 화면 그림에 표를 해 두고 새 화면 그림이 뜰 때까지 기다린 뒤 잼(앞 화면 그림을 재지 않게) */
async function motionOne(mp, b, hash, tag = null) {
  const where = tag ? `${hash} [${tag}]` : hash;
  await mp.evaluate(() => document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', ''))).catch(() => {});
  await mp.goto(`${BASE}${PRE[b]}#${hash.slice(1)}`, {waitUntil: 'networkidle'}).catch(() => {});
  await mp.waitForSelector('.ra:not([data-old])', {timeout: 10000}).catch(() => {});
  let most = 0, beats = new Set(); const until = Date.now() + 9000;
  while (Date.now() < until) { const s = await mp.evaluate(() => ({ // 지금 실제로 움직이는 것만(기다리는 지연 · 끝난 그림의 숨쉬기는 빼고 — browser_check 와 같은 셈)
      n: document.getAnimations().filter(a => { if (a.playState !== 'running' || a.effect?.target?.closest?.('.ra-done, #bottom, [aria-pressed], [aria-current]')) return false; /* 누른 단추 · 아래 탭의 표시(누른 손에 대한 대답)는 그림 움직임이 아님 */ const tm = a.effect?.getComputedTiming?.(); if (!tm) return false; const lt = tm.localTime ?? 0, d = a.effect.getTiming(), delay = d.delay ?? 0, dur = typeof tm.activeDuration === 'number' ? tm.activeDuration : Infinity; return lt >= delay && lt < delay + dur; }).length,
      c: document.querySelector('.ra:not([data-old])')?.dataset.c, done: !!document.querySelector('.ra.ra-done:not([data-old])')})).catch(() => ({n: 0}));
    most = Math.max(most, s.n); if (s.c != null) beats.add(s.c); if (s.done) break; await mp.waitForTimeout(120); }
  stats.motion++;
  if (most > 1) bad(b, where, `한 번에 ${most}개가 움직임(1이어야 함)`);
  if (beats.size < 4) bad(b, where, `기승전결 가운데 ${beats.size}개만 짚음`);
  for (const [w, hh] of [[360, 640], [430, 700]]) {
    await mp.setViewportSize({width: w, height: hh}); await mp.waitForTimeout(250);
    const f = await mp.evaluate(() => { const labs = [...(document.querySelector('.ra')?.querySelectorAll('.ra-lab') ?? [])]; return {lb: labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom + scrollY)) : null, tab: document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
    if (f.lb == null || f.lb > f.tab + 0.5) bad(b, where, `${w}×${hh}: 이름 · 숫자가 한 화면 밖(${Math.round(f.lb)} > ${Math.round(f.tab)})`);
    if (f.sw > f.cw + 1) bad(b, where, `${w}×${hh}: 옆으로 넘침`);
  }
  await mp.setViewportSize({width: 390, height: 640});
}
const LANGS = [['en', {width: 390, height: 640}], ['ko', {width: 360, height: 640}]]; // 영어 = 글이 가장 긴 말(번역 · 넘침) · 한국어 = 사장님이 보는 말 · 가장 좁은 폭(규칙 30 · 360×640)

for (const b of EDGE_ONLY ? [] : BOARDS) {
  const dir = path.join(DIST, PRE[b].replace(/^\//, ''), 'data/atlas11/view');
  const board = await readJson(path.join(dir, 'board.json')), agenda = await readJson(path.join(dir, 'agenda.json')).catch(() => null);
  const E = expectOf(b, board, agenda, story, log, others), groups = board.groups ?? [], codes = new Set(board.companies.map(c => c.code)), gids = new Set(groups.map(g => g.id));
  const famIds = [...new Set(groups.map(g => familyOf(g.label).id))];
  const routes = [['#/', 'home'], ['#/map', 'map'], ...famIds.map(f => [`#/map/f/${f}`, 'land', f]), ...groups.map(g => [`#/i/${g.id}`, 'ind', g.id]),
    ...(QUICK ? board.companies.slice(0, 12) : board.companies).map(c => [`#/stock/${c.code}`, 'co', c.code]),
    ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'], ['#/agenda', 'agenda'], ['#/find', 'find'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea']];
  // 영어 · 한국어 두 길을 함께(창 둘) — 모든 화면을 두 말로
  await Promise.all(LANGS.map(async ([lang, vp]) => {
    const {ctx, page, errs} = await openPage(b, lang, vp);
    for (const [hash, kind, id] of routes) await probeOne(page, errs, {b, hash, kind, id, E, gids, codes, famIds, lang, tag: lang === 'en' ? null : lang});
    await ctx.close();
  }));
  // ⑨⑩⑪ 움직임 — 화면 종류마다 한 번(움직임 켬 · 한국어)
  const mctx = await browser.newContext({viewport: {width: 390, height: 640}, colorScheme: 'dark', isMobile: true, hasTouch: true});
  const mp = await mctx.newPage();
  const kinds = [...new Map(routes.map(r => [r[1], r])).values()];
  for (const [hash] of QUICK ? kinds.slice(0, 6) : kinds) await motionOne(mp, b, hash);
  await mctx.close();
  console.log(`${b}: 화면 ${routes.length}개 · 지금까지 실패 ${fails.length}개`);
}
/* ── ⑫ 빈 날 길(2026-10-08 05:05 「빈 날 막기」) — 자료를 바꿔치기해 그림이 그릴 값이 없는 날을 만들고, 그날에도 화면마다 그림 한 장(빈 하늘)인지 · 숫자를 지어내지 않는지 ──
   A(한국 판 · 일부 빔): 20거래일 값이 없는 회사 · 업종을 모르는 회사 · 값 있는 회사가 하나도 없는 업종 · 예비 0곳 · 오름 상위 0곳 · 처음 자료 없음 · 돈 이야기 · 일정 · 기록 파일 못 읽음 · 없는 주소 셋
   B(미국 판 · 모두 빔): 회사 · 업종 값이 모두 없음 + 예비 · 오름 상위 0곳 · 처음 없음 · 돈 이야기 · 기록 파일 못 읽음 — 화면 15종 전부
   바꿔치기한 파일은 판 목록(manifest)의 해시도 같이 바꿔 화면의 무결성 검사를 지나게 함(화면 코드는 그대로) · 영어 · 한국어 두 말 · 빈 하늘 움직임 한 번 */
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
if ((!QUICK || EDGE_ONLY) && BOARDS.includes('kr')) { // A
  const dir = path.join(DIST, 'data/atlas11/view'), bd = structuredClone(await readJson(path.join(dir, 'board.json')));
  const gs = bd.groups.filter(g => (g.codes ?? []).length >= 2), byCode = new Map(bd.companies.map(c => [c.code, c]));
  const x1 = gs[0].codes[0], x2 = gs[1].codes[0], gNull = gs[2];
  byCode.get(x1).change20 = null; byCode.get(x2).group = null; for (const c of gNull.codes) byCode.get(c).change20 = null;
  bd.similar = {...(bd.similar ?? {}), items: []}; bd.next = {...(bd.next ?? {}), items: []}; bd.start = null;
  const s1 = {...await readJson(path.join(dir, `stocks/${x1}.json`)), change20: null}, s2 = {...await readJson(path.join(dir, `stocks/${x2}.json`)), group: null};
  EDGE.push({b: 'kr', name: '빈 날 A', board: bd, stocks: {[x1]: s1, [x2]: s2}, missing: ['/story.json', '/changelog.json', '/data/atlas11/view/agenda.json'], agenda: null,
    visits: [['#/', 'home'], ['#/i/' + gNull.id, 'ind', gNull.id], ['#/stock/' + x1, 'co', x1], ['#/stock/' + x2, 'co', x2], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/start', 'start'], ['#/agenda', 'agenda'], ['#/log', 'log'],
      ['#/road', 'road'], ['#/map', 'map'], ['#/find', 'find'], ['#/i/zznone', 'ind', 'zznone'], ['#/map/f/zznone', 'land', 'zznone'], ['#/stock/ZZNONE', 'co', 'ZZNONE']], motion: '#/similar'});
}
if ((!QUICK || EDGE_ONLY) && BOARDS.includes('us')) { // B
  const dir = path.join(DIST, 'us/data/atlas11/view'), bd = structuredClone(await readJson(path.join(dir, 'board.json')));
  for (const c of bd.companies) c.change20 = null; for (const g of bd.groups) g.change20 = null;
  bd.similar = {...(bd.similar ?? {}), items: []}; bd.next = {...(bd.next ?? {}), items: []}; bd.start = null;
  const c0 = bd.companies[0].code, g0 = bd.groups[0].id, f0 = familyOf(bd.groups[0].label).id;
  const s0 = {...await readJson(path.join(dir, `stocks/${c0}.json`)), change20: null};
  EDGE.push({b: 'us', name: '빈 날 B', board: bd, stocks: {[c0]: s0}, missing: ['/story.json', '/changelog.json'], agenda: await readJson(path.join(dir, 'agenda.json')).catch(() => null),
    visits: [['#/', 'home'], ['#/map', 'map'], ['#/map/f/' + f0, 'land', f0], ['#/i/' + g0, 'ind', g0], ['#/stock/' + c0, 'co', c0], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'],
      ['#/agenda', 'agenda'], ['#/find', 'find'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea']], motion: '#/map'});
}
for (const x of EDGE) {
  const forge = await forgeOf(x.b, x.board, x.stocks, x.missing), E = expectOf(x.b, x.board, x.agenda, null, null, others);
  const groups = x.board.groups ?? [], gids = new Set(groups.map(g => g.id)), codes = new Set(x.board.companies.map(c => c.code)), famIds = [...new Set(groups.map(g => familyOf(g.label).id))];
  for (const [lang, vp] of LANGS) {
    const {ctx, page, errs} = await openPage(x.b, lang, vp, forge);
    for (const [hash, kind, id] of x.visits) { await probeOne(page, errs, {b: x.b, hash, kind, id, E, gids, codes, famIds, lang, tag: `${x.name} · ${lang}`}); stats.edge++; }
    await ctx.close();
  }
  const mctx = await browser.newContext({viewport: {width: 390, height: 640}, colorScheme: 'dark', isMobile: true, hasTouch: true}); await forge(mctx);
  const mp = await mctx.newPage(); await mp.goto(`${BASE}${PRE[x.b]}#/`, {waitUntil: 'networkidle'}).catch(() => {}); await mp.waitForTimeout(600);
  await motionOne(mp, x.b, x.motion, `${x.name} · 움직임`); await mctx.close();
  console.log(`${x.name}(${x.b}): 화면 ${x.visits.length * LANGS.length}개 · 지금까지 실패 ${fails.length}개`);
}
await browser.close();
const langs = LANGS.map(([l]) => l); // 두 말(영어 · 한국어)로 모든 화면 · 빈 날 길(edge) — 올리기 문이 둘 다 요구(art_gate.mjs)
const report = {schema: 'atlas11-full-check-2', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), code: await codePrint(ROOT), boards: BOARDS, quick: QUICK, langs, ...stats, failed: fails.length, ok: fails.length === 0 && !QUICK && BOARDS.length === 5 && stats.edge > 0, fails: fails.slice(0, 400)};
await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true});
await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({pages: stats.pages, byLang: stats.byLang, edge: stats.edge, numbers: stats.numbers, links: stats.links, texts: stats.texts, motion: stats.motion, failed: fails.length, ok: report.ok, seconds: report.seconds}));
for (const f of fails.slice(0, 40)) console.log(` ✗ ${f.board} ${f.route} — ${f.what}`);
process.exit(report.ok || (QUICK && !fails.length) ? 0 : 1);

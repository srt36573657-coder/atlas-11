#!/usr/bin/env node
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
   쓰는 법: node scripts/atlas11/full_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--boards kr,us] [--quick] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {codePrint} from './art_gate.mjs';
import {familyOf} from '../../site/app/family.js'; // 갈래 이름표(자료) — 링크 검사용
import {expectOf, compare as cmp, pctText} from './art_expect.mjs'; // 그림 숫자의 기대값(판 자료로 따로 셈 · browser_check 와 함께 씀)

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8823'), PW = arg('--pw', '/opt/node-tools'), QUICK = process.argv.includes('--quick');
const BOARDS = arg('--boards', 'kr,us,cn,jp,vn').split(','), OUT = arg('--out', 'reports/atlas11/full-check/latest.json');
const ROOT = process.cwd(), DIST = path.join(ROOT, 'dist'), PRE = {kr: '/', us: '/us/', cn: '/cn/', jp: '/jp/', vn: '/vn/'};
const require = createRequire(PW.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const fin = v => typeof v === 'number' && Number.isFinite(v);
const fails = [], stats = {pages: 0, numbers: 0, links: 0, texts: 0, motion: 0};
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

for (const b of BOARDS) {
  const dir = path.join(DIST, PRE[b].replace(/^\//, ''), 'data/atlas11/view');
  const board = await readJson(path.join(dir, 'board.json')), agenda = await readJson(path.join(dir, 'agenda.json')).catch(() => null);
  const E = expectOf(b, board, agenda, story, log, others), groups = board.groups ?? [], codes = new Set(board.companies.map(c => c.code)), gids = new Set(groups.map(g => g.id));
  const famIds = [...new Set(groups.map(g => familyOf(g.label).id))];
  const routes = [['#/', 'home'], ['#/map', 'map'], ...famIds.map(f => [`#/map/f/${f}`, 'land', f]), ...groups.map(g => [`#/i/${g.id}`, 'ind', g.id]),
    ...(QUICK ? board.companies.slice(0, 12) : board.companies).map(c => [`#/stock/${c.code}`, 'co', c.code]),
    ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'], ['#/agenda', 'agenda'], ['#/find', 'find'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea']];
  const ctx = await browser.newContext({viewport: {width: 390, height: 640}, colorScheme: 'dark', isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`${BASE}${PRE[b]}?lang=en#/`, {waitUntil: 'networkidle'}); await page.waitForTimeout(900);
  for (const [hash, kind, id] of routes) {
    errs.length = 0;
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForFunction(h => location.hash === h && document.querySelector('#view, main')?.childElementCount > 0, hash, {timeout: 8000}).catch(() => {});
    await page.waitForTimeout(kind === 'find' || kind === 'log' ? 700 : 260);
    const m = await page.evaluate(PAGE_PROBE).catch(e => ({fail: String(e)}));
    stats.pages++;
    if (m.fail) { bad(b, hash, '화면을 재지 못함: ' + m.fail); continue; }
    if (errs.length) bad(b, hash, '화면 오류: ' + errs.slice(0, 2).join(' / '));
    if (m.arts !== 1) bad(b, hash, `그림 수 ${m.arts}(1이어야 함)`);
    if (!m.done) bad(b, hash, '움직임 줄이기 설정에서 끝 모습이 아님');
    if (m.labBottom == null || m.labBottom > m.tabTop + 0.5) bad(b, hash, `이름 · 숫자가 한 화면 밖(아래 끝 ${Math.round(m.labBottom)} · 탭 ${Math.round(m.tabTop)})`);
    if (m.sw > m.cw + 1) bad(b, hash, `옆으로 넘침 ${m.sw} > ${m.cw}`);
    if (m.weird.length) bad(b, hash, '이상한 글자: ' + m.weird.join(' '));
    if (m.left.length) bad(b, hash, '번역 안 된 한국어: ' + m.left.join(' / '));
    for (const l of m.links) { stats.links++; const [, k, v] = /^#\/(i|stock|map\/f)\/(.+)$/.exec(l) ?? []; if (k === 'i' && !gids.has(v)) bad(b, hash, '없는 업종 링크 ' + l); if (k === 'stock' && !codes.has(decodeURIComponent(v))) bad(b, hash, '없는 회사 링크 ' + l); if (k === 'map/f' && !famIds.includes(v)) bad(b, hash, '없는 갈래 링크 ' + l); }
    // 그림 숫자 ↔ 판 자료
    const want = kind === 'home' ? (E.rot ? {from: E.rot.pair.from.id, to: E.rot.pair.to.id, start: E.rot.pair.start, days: E.rot.pair.days, outAmt: E.rot.out[0].amount, inAmt: E.rot.in[0].amount, fomo: E.rot.fomo.to} : null)
      : kind === 'map' ? E.map : kind === 'land' ? E.land[id] : kind === 'ind' ? E.ind[id] : kind === 'co' ? E.co[id] : kind === 'similar' ? E.similar : kind === 'rise' ? E.rise : kind === 'road' ? E.road
      : kind === 'agenda' ? E.agenda : kind === 'find' ? E.find : kind === 'log' ? E.log : kind === 'start' ? E.start : null;
    if (kind === 'home') { if (!E.rot) bad(b, hash, '돈의 이동 자료 없음'); else compare(b, hash, m.rot, want); }
    else if (['guide', 'long', 'korea'].includes(kind)) { if (!m.check) bad(b, hash, '그림 값(data-check) 없음'); }
    else if (kind === 'co' && !fin(board.companies.find(c => c.code === id)?.change20)) { /* 값 없는 회사 — 그림 대신 옛 무대 */ }
    else compare(b, hash, m.check, want);
    // 보이는 % 글 — 그림 값의 변화율이 이름 · 숫자 칸에 그대로 보이는지
    for (const k of ['topAvg', 'v0', 'v', 'avg', 'vl']) if (fin(want?.[k]) && ['map', 'land', 'ind', 'co', 'similar', 'rise', 'road'].includes(kind)) { stats.texts++; if (!m.labText.includes(pctText(want[k]))) bad(b, hash, `보이는 글에 ${pctText(want[k])} 없음`); }
  }
  // ⑨⑩⑪ 움직임 — 화면 종류마다 한 번(움직임 켬 · 한국어)
  const mctx = await browser.newContext({viewport: {width: 390, height: 640}, colorScheme: 'dark', isMobile: true, hasTouch: true});
  const mp = await mctx.newPage();
  const kinds = [...new Map(routes.map(r => [r[1], r])).values()];
  for (const [hash, kind] of QUICK ? kinds.slice(0, 6) : kinds) {
    // 아래 탭을 누르는 것과 같은 길(주소 # 만 바뀜) — 앞 화면 그림에 표를 해 두고 새 화면 그림이 뜰 때까지 기다린 뒤 잼(앞 화면 그림을 재지 않게)
    await mp.evaluate(() => document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', ''))).catch(() => {});
    await mp.goto(`${BASE}${PRE[b]}#${hash.slice(1)}`, {waitUntil: 'networkidle'}).catch(() => {});
    await mp.waitForSelector('.ra:not([data-old])', {timeout: 10000}).catch(() => {});
    let most = 0, beats = new Set(); const until = Date.now() + 9000;
    while (Date.now() < until) { const s = await mp.evaluate(() => ({ // 지금 실제로 움직이는 것만(기다리는 지연 · 끝난 그림의 숨쉬기는 빼고 — browser_check 와 같은 셈)
        n: document.getAnimations().filter(a => { if (a.playState !== 'running' || a.effect?.target?.closest?.('.ra-done, #bottom, [aria-pressed], [aria-current]')) return false; /* 누른 단추 · 아래 탭의 표시(누른 손에 대한 대답)는 그림 움직임이 아님 */ const tm = a.effect?.getComputedTiming?.(); if (!tm) return false; const lt = tm.localTime ?? 0, d = a.effect.getTiming(), delay = d.delay ?? 0, dur = typeof tm.activeDuration === 'number' ? tm.activeDuration : Infinity; return lt >= delay && lt < delay + dur; }).length,
        c: document.querySelector('.ra:not([data-old])')?.dataset.c, done: !!document.querySelector('.ra.ra-done:not([data-old])')})).catch(() => ({n: 0}));
      most = Math.max(most, s.n); if (s.c != null) beats.add(s.c); if (s.done) break; await mp.waitForTimeout(120); }
    stats.motion++;
    if (most > 1) bad(b, hash, `한 번에 ${most}개가 움직임(1이어야 함)`);
    if (beats.size < 4) bad(b, hash, `기승전결 가운데 ${beats.size}개만 짚음`);
    for (const [w, hh] of [[360, 640], [430, 700]]) {
      await mp.setViewportSize({width: w, height: hh}); await mp.waitForTimeout(250);
      const f = await mp.evaluate(() => { const labs = [...(document.querySelector('.ra')?.querySelectorAll('.ra-lab') ?? [])]; return {lb: labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom + scrollY)) : null, tab: document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
      if (f.lb == null || f.lb > f.tab + 0.5) bad(b, hash, `${w}×${hh}: 이름 · 숫자가 한 화면 밖(${Math.round(f.lb)} > ${Math.round(f.tab)})`);
      if (f.sw > f.cw + 1) bad(b, hash, `${w}×${hh}: 옆으로 넘침`);
    }
    await mp.setViewportSize({width: 390, height: 640});
  }
  await ctx.close(); await mctx.close();
  console.log(`${b}: 화면 ${routes.length}개 · 지금까지 실패 ${fails.length}개`);
}
await browser.close();
const report = {schema: 'atlas11-full-check-1', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), code: await codePrint(ROOT), boards: BOARDS, quick: QUICK, ...stats, failed: fails.length, ok: fails.length === 0 && !QUICK && BOARDS.length === 5, fails: fails.slice(0, 400)};
await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true});
await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({pages: stats.pages, numbers: stats.numbers, links: stats.links, texts: stats.texts, motion: stats.motion, failed: fails.length, ok: report.ok, seconds: report.seconds}));
for (const f of fails.slice(0, 40)) console.log(` ✗ ${f.board} ${f.route} — ${f.what}`);
process.exit(report.ok || (QUICK && !fails.length) ? 0 : 1);

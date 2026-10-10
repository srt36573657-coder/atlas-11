#!/usr/bin/env node
/* ATLAS 11 · 빠짐없이 도는 검사기 v3(규칙 34) — 10배 빠르고 10배 꼼꼼하게
   사장님 2026-10-08 06:42 「시간이 너무 걸리는 문제를 시스템으로 먼저 개선한 후 지금보다 10배 빠르면서도 10배 정교한 시스템이 되는 구조를 먼저 짠 이후 작업하라」
   v2(01:31 · 05:05 · full_check_v2.mjs)는 화면마다 주소를 바꾸고 0.26초씩 기다려 22분(화면 4,286곳 · 영어 · 한국어 두 말). v3:
     ① 화면 안 순회 — 검사기가 화면 안에서 주소를 바꾸고 「다 그린 순간」(받는 파일 0 · 번역 끝 · 다음 그림 틀)을 잼(app.js atlasRoute) · 정해 둔 기다림 0
        다섯 나라(2026-10-08 18:33 부터 사이트 판 = 한국 · 미국 · lib/atlas11/places.mjs) 모든 화면 × 영어(390×640 · 글이 가장 긴 말) · 한국어(360×640 · 사장님이 보는 말 · 가장 좁은 폭)
        화면마다: 그림 한 장 · 끝 모습 · 그림 숫자 = 판 자료로 따로 센 값(art_expect.mjs) · 보이는 % 글 · 이름 · 숫자가 아래 탭 위 · 옆 넘침(문서 + 그림 칸 부품마다)
                 · NaN 같은 글자 없음 · 링크가 판에 있는 곳 · 화면 오류 0 · 걸음 계획(기승전결 넷 · 걸음마다 그림 번호 하나 · 움직이는 부품은 다 걸음에 묶임)
     ② 계산 층 — 한국어로 그린 모든 화면의 글(글자 · 읽기 이름표 · 창 제목)을 사이트 번역 함수 그대로(i18n.js · 판 이름 더하기까지) 73개 말로 바꿔 남은 한국어 0
        (v2: 영어 한 말만 · v3: 73개 말 전부)
     ③ 가장 긴 글 층 — 말마다(73) · 화면 종류마다(15) 글이 가장 긴 화면(다섯 나라 가운데)을 그 말로 열어 한 화면 · 옆 넘침 · 가장 큰 글씨(200%) 옆 넘침
     ④ 움직임 — 화면 종류 × 판마다 4배속으로(art.js atlas11:speed · CSS 는 브라우저 시간을 4배로): 처음 모습 = 최신 결과(저절로 재생 없음 · 2026-10-09) → 「재생」을 눌러 매 프레임 셈: 한 번에 하나 · 차례 넷 · 360×640 · 430×700 한 화면
     ⑤ 빈 날 길 — 판 자료를 바꿔치기(판 목록 해시도 같이) — 한국 판 일부 빔 · 미국 판 모두 빔 · 없는 주소 셋 · 못 읽은 파일 → 두 말로 그림 한 장(빈 하늘) · 기대값 · 움직임
     ⑥ 쉬운 말 층(규칙 48 · 2026-10-09 22:40 마카오 시각 「아이큐 92 남자 고등학생이 이해하고 공감가며 사용할수 있도록 … 교차 검증을 100만번」) — 한국어 화면은 처음이 쉬운 말:
        ① ⑤ 의 한국어는 전문가 말(?level=pro · 옛 검사 그대로 · ② 계산 층 재료) · 쉬운 말(?level=easy)로 모든 화면 · 빈 날 길을 한 번 더 — 같은 판정(한 화면 · 그림 · 입체 없음 · 3단 클릭) +
        「이 화면은?」 한 줄 · 펼친 글에 어려운 말(easy-ko.js HARD) 0 · 금지 말을 새로 넣지 않음 · 숫자 맞대기(쉬운 말 화면의 숫자 = 전문가 말 화면의 숫자 — 하나도 빠지거나 바뀌지 않음)
   결과: reports/atlas11/full-check/latest.json(schema 3) — 올리기 문(art_gate.mjs)이 지문 · 다섯 나라 · 두 말 · 73개 말 · 빈 날 · 실패 0 을 봄
   쓰는 법: node scripts/atlas11/full_check.mjs --base http://127.0.0.1:8823 --pw /opt/node-tools [--boards kr,us] [--quick] [--kinds home,map] [--lay] [--edge-only] [--jobs 3] [--out 파일] */
import {SITE_BOARDS} from '../../lib/atlas11/places.mjs'; // 사이트에 싣는 판(2026-10-08 18:33 부터 한국 · 미국)
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
import {expectOf, compare as cmp, pctText, flowExpect} from './art_expect.mjs'; // 그림 숫자의 기대값(판 자료로 따로 셈 · browser_check 와 함께 씀)
import {fmtPct} from '../../site/app/calc.js';
import {hardLeft, addEasyNames} from '../../site/app/easy.js'; // 쉬운 말 층 — 남은 어려운 말(easy-ko.js HARD · 낱말 안 · 이름 자리는 뺌)
import {HARD} from '../../site/app/easy-ko.js';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs'; // 앞날 말(쉬운 말이 새로 넣지 않았나)
import {BANNED} from '../../lib/atlas11/changelog.mjs'; // 판 읽기(%) 값의 보이는 글 모양(소수 한 자리 · 부호) — 그림 이름표 글을 맞댈 때만

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8823'), PW = arg('--pw', '/opt/node-tools'), EDGE_ONLY = process.argv.includes('--edge-only'), QUICK = process.argv.includes('--quick') || EDGE_ONLY || process.argv.includes('--kinds');
const BOARDS = arg('--boards', SITE_BOARDS.join(',')).split(','), OUT = arg('--out', 'reports/atlas11/full-check/latest.json'), JOBS = Number(arg('--jobs', '3'));
const LAY = (!QUICK || process.argv.includes('--lay')) && !process.argv.includes('--nolay'); // 고치는 동안 가장 긴 글 층만 더(--kinds home --lay) — 결과는 여전히 빠른 검사(문을 못 지남)
const KINDS = arg('--kinds', null)?.split(',') ?? null; // 고치는 동안: 화면 종류만 골라 빠르게(market,sectors,home,flowwho,flow,map,land,ind,co,stocks,similar,rise,road,agenda,check,log,watch,start,guide,long,korea) — 결과는 빠른 검사로 적혀 문을 못 지남
const ROOT = process.cwd(), DIST = path.join(ROOT, 'dist'), PRE = {kr: '/', us: '/us/', cn: '/cn/', jp: '/jp/', vn: '/vn/'};
const SPEED = 4; // 움직임 검사 빠르기(걸음 사이 0.15초 틈이 0.04초 — 프레임마다 셈)
const require = createRequire(PW.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const fin = v => typeof v === 'number' && Number.isFinite(v);
const HAN = /[가-힣]/;
const fails = [], stats = {pages: 0, byLang: {}, plans: 0, numbers: 0, links: 0, texts: 0, motion: 0, edge: 0, transLangs: 0, transStrings: 0, layoutLangs: 0, layoutPages: 0, flat: {pages: 0, checks: 0, hits: 0}, click3: {pairs: 0, over: 0, max: 0, hist: {}},
  easy: {pages: 0, edge: 0, what: 0, numPages: 0, numTokens: 0, front: 0, hardChecks: 0, hardHits: 0, bannedChecks: 0, checks: 0, click3: {pairs: 0, over: 0, max: 0, hist: {}}},
  tour: {boards: 0, started: 0, steps: 0, most: 0, paused: 0, resumed: 0, off: 0, rest: 0, checks: 0}}; // flat = 입체 없음 층(2026-10-10 「3d 영구 삭제해」 · 「모두다」 — 본 화면 · 본 부품 · 걸린 것) · click3 = 모든 화면 쌍의 최소 누름 수(3단 클릭 — 규칙 47)
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
const CRAWL = async ({routes, collect, easy = false, nums = false}) => {
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
    // 입체 없음(사장님 2026-10-10 09:51 · 09:53(마카오) 「3d 영구 삭제해」 · 「모두다」 — 옛 규칙 46 「모든 화면 3D」 지움 · 10:00 「가 나 는 지우지마」 = 초대장 사진 · 소개 영상은 따로 쪽이라 이 검사 밖)
    //   화면 전체: 캔버스 · 섬 · 지도 섬 없음 · 그림 칸(조작 단추 줄 빼고 보이는 부품 모두): 3D 변환 · 원근 · 그림자 필터 · 어긋나거나 번진 그림자(입체 그림자 · 파인 홈) · 막대 · 기둥 · 칸의 기울인 면(가상 요소) · 구슬 빛 없음
    { const main = document.getElementById('main'), art = document.querySelector('#main section[data-art], #main section.rt[data-place]'), hit = [];
      const lens3 = x => (x.replace(/rgba?\([^)]*\)/g, '').match(/-?\d*\.?\d+px/g) ?? []).map(parseFloat);
      const depth = bs => bs && bs !== 'none' && bs.split(/,(?![^(]*\))/).some(x => { const [dx = 0, dy = 0, bl = 0] = lens3(x); return (bl > 0 && (dx !== 0 || dy !== 0)) || (dx !== 0 && dy !== 0) || (/inset/.test(x) && bl > 0); }); // 깊이 = 비껴 번진 그림자 · 두 쪽으로 어긋난 그림자(입체 그림자) · 번진 안쪽 그림자(파인 홈) — 테(0 0 0 1px) · 빛무리(0 0 10px) · 한 쪽 띠(inset 3px 0 0)는 평평
      const dropDepth = f => /drop-shadow/.test(f) && [...f.matchAll(/drop-shadow\(([^()]*(?:\([^)]*\)[^()]*)*)\)/g)].some(m2 => { const [dx = 0, dy = 0] = lens3(m2[1]); return dx !== 0 || dy !== 0; });
      if (main?.querySelector('canvas')) hit.push('캔버스');
      if (main?.querySelector('.isl, .imap, [class*="isl-"], [class*="imap-"]')) hit.push('섬 · 지도 섬');
      let n = 0;
      if (art) for (const el of art.querySelectorAll('*')) { if (el.closest('.ra-ctl') || !el.getClientRects().length) continue; const st = getComputedStyle(el); if (st.display === 'none') continue; n++;
        if (/matrix3d/.test(st.transform) || st.perspective !== 'none' || st.transformStyle === 'preserve-3d') hit.push('3D 변환 ' + cls(el));
        if (dropDepth(st.filter)) hit.push('그림자 필터 ' + cls(el));
        if (depth(st.boxShadow)) hit.push('입체 그림자 ' + cls(el));
        if (el.matches('.bc-bar, .hg-col, .cl-seg, .hm-c, .tl-c')) for (const ps of ['::before', '::after']) { const q = getComputedStyle(el, ps); if (q.content !== 'none' && q.transform !== 'none') hit.push(`기울인 면 ${cls(el)}${ps}`); }
        if (el.matches('.da-dot, .bead') && /radial-gradient/.test(st.backgroundImage)) hit.push('구슬 빛 ' + cls(el));
        if (hit.length > 8) break; }
      m.flat = {n, hit: [...new Set(hit)].slice(0, 6)}; }
    // 판단 정보가 먼저인 화면(2026-10-08 20:19 「ATLAS 개편 실행 지시서」 4 — 시장 · 투자자 매매 · 종목 · 검증 · 관심종목): [번호, 위, 아래] · 그림 칸 위 끝
    m.firsts = [...document.querySelectorAll('#main [data-first]')].map(x => { const r = x.getBoundingClientRect(); return [Number(x.dataset.first), Math.round(r.top), Math.round(r.bottom)]; });
    m.artTop = sec ? Math.round(sec.getBoundingClientRect().top) : null;
    m.artFirst = sec?.dataset.first ?? null; // 그림 칸이 판단 정보 칸(시장 · 업종 첫 화면 ④ 핵심 차트 — 2026-10-09 지시서 5)인가
    // 돈 흐름 업종의 회사(2026-10-08 17:41 「돈에 흐름에 관련된 종목들을 표기하라」) — 그림이 실은 값(data-cos) · 화면에 그린 줄(업종 칸마다 회사 고리 차례)
    { const x = document.querySelector('#main [data-cos]'); try { m.cos = x ? JSON.parse(x.dataset.cos) : null; } catch { m.cos = 'bad-json'; }
      m.cosDom = [...document.querySelectorAll('#main .rc-g')].map(g => [g.closest('.rc-side')?.dataset.side ?? null, Number(g.dataset.rank), g.dataset.group, [...g.querySelectorAll('.rc-a')].map(a => a.dataset.code)]); }
    m.cand = [...document.querySelectorAll('#main .cd-row')].map(x => [x.dataset.code, x.dataset.status, Number(x.dataset.rank)]); // 후보 줄(2026-10-09 — 판 읽기 후보와 같은 차례 · 같은 상태)
    { const t = document.querySelector('#main .tu'); m.tour = t ? {mode: t.dataset.tour, auto: t.dataset.tourAuto, pos: t.dataset.tourPos, step: t.dataset.tourStep} : null; } // 저절로 둘러보기(규칙 49 ④) — 움직임 줄이기 창이면 늘 rest(저절로 시작 안 함)
    m.plan = ra?.dataset.plan ?? null;
    m.ats = ra ? [...new Set([...ra.querySelectorAll('[data-at]')].map(x => x.dataset.at))] : [];
    m.loose = ra ? [...ra.querySelectorAll('.ra-art [class*="ak-"]')].filter(x => !x.closest('[data-at]')).map(cls).slice(0, 3) : [];
    m.weird = (document.getElementById('main')?.textContent.match(/\b(NaN|undefined|Infinity|null)\b|\[object /g) ?? []).slice(0, 3); // 접힌 칸 안 글까지(자리 셈 없이 빠르게)
    m.links = [...document.querySelectorAll('#main a[href^="#/"]')].map(a => a.getAttribute('href')).filter(h => /^#\/(i|stock|map\/f)\//.test(h));
    // 3단 클릭(2026-10-09 21:33 「아틀란스를 3단 클릭구조로 … 모든곳에 하나도 빠짐없이」 · 규칙 47) — 이 화면에서 한 번 눌러 가는 곳 모두(위 막대 · 탐색 줄 · 본문 · 아래 탭) · 접힌 칸 안은 「펼치기 + 누르기」 두 번(D)
    { const nav = new Set(); for (const a of document.querySelectorAll('a[href^="#/"]')) { const d = a.closest('details'), folded = !!d && !d.open && !a.closest('summary'); let hh = a.getAttribute('href'); try { hh = decodeURIComponent(hh); } catch {} nav.add((folded ? 'D' : '') + hh); } m.nav = [...nav]; }
    m.errs = window.__errs.slice(e0);
    // 쉬운 말 층(규칙 48): 숫자 모음(본문 글 + 읽기 이름표 — 「이 화면은?」 줄은 뺌) · 「이 화면은?」 · 펼친 글(접힌 칸 · 원문 · 식별자 · 숨은 것 뺌)
    if (nums) { const c = document.getElementById('main').cloneNode(true); c.querySelectorAll('.ez-what, .ez-only').forEach(x => x.remove()); const at = [...c.querySelectorAll('[aria-label], [title], [data-speak]')].map(x => ['aria-label', 'title', 'data-speak'].map(k => x.getAttribute(k) ?? '').join(' ')).join(' ');
      m.nums = ((c.textContent + ' ' + at).match(/[+−\-]?\d[\d,]*(?:\.\d+)?/g) ?? []).sort().join(' '); } // 쉬운 말 화면에만 있는 칸(「이 화면은?」 · 어려운 말 풀이 .ez-only)은 숫자 맞대기에서 뺌
    if (easy) {
      m.what = !!document.querySelector('#main .ez-what') && document.documentElement.dataset.level === 'easy';
      const folded = el => { for (let x = el; x && x.id !== 'main'; x = x.parentElement) if (x.tagName === 'DETAILS' && !x.open && el.closest('summary')?.parentElement !== x) return true; return false; }; // 닫힌 접힘 안(그 접힘의 이름 줄은 보임 · 겹친 접힘도)
      const fr = new Set(), w2 = document.createTreeWalker(document.getElementById('main'), NodeFilter.SHOW_TEXT);
      for (let n = w2.nextNode(); n; n = w2.nextNode()) { const s = n.nodeValue; if (!KO.test(s) && !/\b(?:KST|ROE|EPS|PER)\b|\d%p\b/.test(s)) continue; const p = n.parentElement; if (!p || p.closest('script, style, noscript, code, [data-ident], .lang, .ez-what')) continue;
        const src = p.closest('[lang="ko"]'); if (src && src !== document.documentElement) continue; if (!p.getClientRects().length || folded(p)) continue; fr.add(s.trim()); }
      m.front = [...fr]; }
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
// 움직임 하나 — 주소를 바꾸고 다 그린 뒤: 처음 모습이 최신 결과(끝 모습 · 저절로 재생 없음)인지 → 「재생」을 누르고 매 프레임: 지금 움직이는 것 수(누른 단추 · 아래 탭 표시는 뺌) · 차례 넷
//   2026-10-09 「ATLAS 업데이트 실행 프롬프트」 7 — 처음에는 최신 결과가 멈춘 채로 · 재생은 사람이 고를 때만(옛 검사: 저절로 한 번 재생을 기다림)
const MOTION = async ({hash, limit, scroll = false}) => {
  document.querySelectorAll('.ra').forEach(x => x.setAttribute('data-old', ''));
  await window.atlasRoute(hash);
  const ra0 = document.querySelector('#main .ra:not([data-old])');
  if (scroll) ra0?.scrollIntoView({block: 'center'}); // 판단 정보가 먼저인 화면 — 그림은 아래
  await new Promise(r => setTimeout(r, 300)); // 저절로 재생이 있다면 여기서 시작했을 것(없어야 함)
  const startDone = !!ra0?.classList.contains('ra-done') && ra0?.dataset.step === String(Number(ra0?.dataset.steps) - 1), play = ra0?.querySelector('.ra-play');
  play?.click();
  let most = 0; const beats = new Set(), t1 = performance.now();
  const running = a => { if (a.playState !== 'running' || a.effect?.target?.closest?.('.ra-done, #bottom, [aria-pressed], [aria-current]')) return false; const tm = a.effect?.getComputedTiming?.(); if (!tm) return false; const lt = tm.localTime ?? 0, d = a.effect.getTiming(), delay = d.delay ?? 0, dur = typeof tm.activeDuration === 'number' ? tm.activeDuration : Infinity; return lt >= delay && lt < delay + dur; };
  await new Promise(res => { const f = () => { most = Math.max(most, document.getAnimations().filter(running).length); const ra = document.querySelector('#main .ra:not([data-old])'); if (ra?.dataset.c != null) beats.add(ra.dataset.c); if (ra?.classList.contains('ra-done') || performance.now() - t1 > limit) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const out = {most, beats: [...beats], done: !!document.querySelector('#main .ra:not([data-old]).ra-done'), ms: Math.round(performance.now() - t1), startDone, played: !!play};
  window.scrollTo(0, 0); return out;
};
// 저절로 둘러보기 지켜보기(규칙 49 ④) — 처음 연 첫 화면에서 저절로 시작했나 · 걸음 want 개를 지나는 동안 매 프레임: 움직이는 것 수(웹 움직임 + 칸 그림의 테 차례) · 그림 금빛 = 카드 = 둘러보기 회사
const TOUR_WATCH = async ({want = 5, limit = 15000}) => {
  for (let i = 0; i < 300 && !document.querySelector('#main .tu'); i++) await new Promise(r => setTimeout(r, 20)); // 첫 화면은 판 읽기를 받은 뒤 그림(준비 표시보다 늦을 수 있음)
  const t = document.querySelector('#main .tu'), I = document.querySelector('#main .tl')?.__tl;
  if (!t) return {none: true};
  const t0 = performance.now(); while (t.dataset.tour !== 'play' && performance.now() - t0 < 6000) await new Promise(r => setTimeout(r, 25));
  const out = {started: t.dataset.tour === 'play', auto: t.dataset.tourAuto === '1', waitMs: Math.round(performance.now() - t0), most: 0, seen: [], same: [], ms: 0};
  if (!out.started) return out;
  const running = a => { if (a.playState !== 'running') return false; const tm = a.effect?.getComputedTiming?.(); if (!tm) return false; const lt = tm.localTime ?? 0, d = a.effect.getTiming(), delay = d.delay ?? 0, dur = typeof tm.activeDuration === 'number' ? tm.activeDuration : Infinity; return lt >= delay && lt < delay + dur; };
  const key = () => `${t.dataset.tourPos}.${t.dataset.tourStep}`, seen = new Set([key()]), t1 = performance.now();
  await new Promise(res => { const f = () => { out.most = Math.max(out.most, document.getAnimations().filter(running).length + (I?.state().busy ? 1 : 0)); const k = key();
    if (!seen.has(k)) { seen.add(k); out.same.push([k, t.dataset.tourCode, I?.state().hero ?? null, document.querySelector('#main .cd-card')?.dataset.code ?? null]); }
    if (seen.size >= want || performance.now() - t1 > limit) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
  out.seen = [...seen]; out.ms = Math.round(performance.now() - t1); return out;
};
const TOUR_STATE = () => { const t = document.querySelector('#main .tu'); return t ? {mode: t.dataset.tour, auto: t.dataset.tourAuto, key: `${t.dataset.tourPos}.${t.dataset.tourStep}`, off: !t.querySelector('.tu-off')?.hidden ? t.querySelector('.tu-off')?.innerText.replace(/\s+/g, ' ').trim() : null, store: localStorage.getItem('atlas11:tour')} : null; };
const FIT = () => { const labs = [...(document.querySelector('#main .ra')?.querySelectorAll('.ra-lab') ?? [])]; return {lb: labs.length ? Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) : null, tab: document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; };

/* ── 창 열기 · 일 나눠 돌리기 ── */
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'; // 같은 크롬 엔진 · 창 없는 가벼운 판(빠름)
const browser = await chromium.launch({executablePath: existsSync(SHELL) ? SHELL : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined});
async function openPage(b, lang, vp, {motion = false, forge = null, level = null} = {}) {
  const ctx = await browser.newContext({viewport: vp, colorScheme: 'dark', isMobile: true, hasTouch: true, reducedMotion: motion ? 'no-preference' : 'reduce'});
  await ctx.addInitScript(INIT, {speed: motion ? SPEED : 0});
  if (forge) await forge(ctx);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !(forge && /Failed to load resource/.test(m.text()))) page.evaluate(t => window.__errs?.push(t), m.text()).catch(() => {}); });
  if (motion) { const cdp = await ctx.newCDPSession(page); await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {playbackRate: SPEED}); }
  await page.goto(`${BASE}${PRE[b]}?lang=${lang}${level ? '&level=' + level : lang === 'ko' ? '&level=pro' : ''}#main`, {waitUntil: 'domcontentloaded'}); // 한국어는 전문가 말이 기본 검사(옛 검사 그대로) · 쉬운 말 층만 level=easy(규칙 48)
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
  // 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 9 — 아래 탭 넷(후보 7 #/ · 관심 #/watch · 검증 #/check · 탐색 #/market — 시장 · 업종 · 종목 · 일정) · 옛 화면은 그 탭 안(옛 주소 그대로 · #/find 는 #/stocks 로)
  const vlens = await readJson(path.join(DIST, PRE[b].replace(/^\//, ''), 'data/atlas11/view/lens.json')).catch(() => null), ci = vlens?.cand?.ready ? vlens.cand.items : [];
  const routes = [['#/', 'cand'], [ci.length >= 2 ? `#/compare/${ci[0].code}/${ci[1].code}` : '#/compare', 'compare'], ['#/market', 'market'], ['#/sectors', 'sectors'], ['#/hot', 'home'], ['#/map', 'map'], ...famIds.map(f => [`#/map/f/${f}`, 'land', f]), ['#/flow', 'flowwho'], ['#/flow/rotation', 'flow'], ...groups.map(g => [`#/i/${g.id}`, 'ind', g.id]),
    ...(QUICK ? board.companies.slice(0, 12) : board.companies).map(c => [`#/stock/${c.code}`, 'co', c.code]),
    ['#/stocks', 'stocks'], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'], ['#/agenda', 'agenda'], ['#/check', 'check'], ['#/log', 'log'], ['#/watch', 'watch'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea'], ['#/learn', 'learn']];
  const picked = KINDS ? routes.filter(r => KINDS.includes(r[1])) : routes;
  // 판 읽기(lens.json) · 따로 셈할 재료: 판 목록(지수) · 회사 화면 파일(순매매 × 종가) · 저녁 기록 수(저장소)
  const vdir = path.join(DIST, PRE[b].replace(/^\//, ''), 'data/atlas11/view'), lens = await readJson(path.join(vdir, 'lens.json')).catch(() => null), man = await readJson(path.join(vdir, 'manifest.json'));
  const stockFiles = await Promise.all(board.companies.map(c => readJson(path.join(vdir, 'stocks', c.code + '.json')).catch(() => null)));
  const evDir = b === 'kr' ? path.join(ROOT, 'public/data/atlas11/evening', String(man.universeSet?.id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_')) : path.join(ROOT, `public/data/atlas11/${b}/evening`);
  const cdDir = path.join(ROOT, b === 'kr' ? 'public/data/atlas11/cand' : `public/data/atlas11/${b}/cand`, String(man.universeSet?.id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_')); // 후보 발행본(2026-10-09 — 저녁 기록이 없는 날이면 검증 기록 한 장 · 미국 판도 19:29 「미국장 까지 다 대입」부터 후보 발행본을 남김)
  const dayFiles = async d => (d ? (await fs.readdir(d).catch(() => [])).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)) : []);
  const records = new Set([...await dayFiles(evDir), ...await dayFiles(cdDir)]).size;
  const extra = {market: man.market, flow5: b === 'kr' ? flowExpect(stockFiles) : null, records};
  S[b] = {board, routes: picked, kindOf: new Map(routes.map(r => [r[0], r])), E: expectOf(b, board, agenda, story, log, others, lens, extra), gids: new Set(groups.map(g => g.id)), codes: new Set(board.companies.map(c => c.code)), famIds, lens};
}

/* ── 한 화면 판정(바깥에서 — 잰 값으로) ── */
const PLAN_C = [0, 1, 2, 3];
const INFO_FIRST = new Set(['cand', 'compare', 'market', 'sectors', 'flowwho', 'stocks', 'check', 'watch', 'learn']); // 판단 정보가 그림보다 먼저인 화면(「ATLAS 개편 실행 지시서」 4 · 2026-10-09 업종 탭 · 후보 7 · 비교)
const FIVE = new Set(['market', 'sectors', 'learn']); // ① 기준 → ② 관측 → ③ 핵심 수치 → ④ 핵심 차트(그림 칸) → ⑤ 다음 행동(2026-10-09 지시서 5)
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
  const want = kind === 'home' ? E.home : kind === 'flow' ? E.flow : kind === 'map' ? E.map : kind === 'land' ? E.land[id] ?? {quiet: 'land'} : kind === 'ind' ? E.ind[id] ?? {quiet: 'industry'} : kind === 'co' ? E.co[id] ?? {quiet: 'fail'} : kind === 'sectors' ? E.sectors
    : kind === 'similar' ? E.similar : kind === 'rise' ? E.rise : kind === 'road' ? E.road : kind === 'agenda' ? E.agenda : kind === 'log' ? E.log : kind === 'start' ? E.start
    : kind === 'market' ? E.market : kind === 'flowwho' ? E.flowwho : kind === 'stocks' ? E.stocks : kind === 'check' ? E.check : kind === 'watch' ? E.watch : kind === 'learn' ? E.learn : kind === 'cand' ? E.cand : kind === 'compare' ? E.compare : null;
  if (m.errs?.length) no('화면 오류: ' + m.errs.slice(0, 2).join(' / '));
  if (m.sw > m.cw + 1) no(`옆으로 넘침 ${m.sw} > ${m.cw}`);
  if (m.over?.length) no('그림 칸 부품이 옆으로 넘침: ' + m.over.join(' '));
  if (!m.note) no('맨 위 하규 응원 · 건의 줄이 없음(위 막대 바로 아래 · 문자 고리 010-9011-7377)');
  if (m.footDup) no('맨 아래 줄에 하규 응원 · 건의 줄이 또 있음(맨 위로 옮김 · 규칙 1)');
  if (bigFont) return; // 가장 큰 글씨는 옆 넘침만(한 화면은 보통 글씨 규칙)
  if (m.arts !== 1) no(`그림 수 ${m.arts}(1이어야 함)`);
  stats.flat.pages++; stats.flat.checks += (m.flat?.n ?? 0) + 2; // 입체 없음 층(2026-10-10 「3d 영구 삭제해」 · 「모두다」)
  if (!m.flat) no('입체 없음 층을 재지 못함');
  else if (m.flat.hit.length) { stats.flat.hits += m.flat.hit.length; no(`입체가 남음(2026-10-10 「3d 영구 삭제해」 · 「모두다」 — 옛 규칙 46 지움): ${m.flat.hit.join(' · ')}`); }
  if (!m.done) no('움직임 줄이기 설정에서 끝 모습이 아님');
  if (INFO_FIRST.has(kind)) { // 판단 정보 먼저(지시서 4) — 첫 칸이 한 화면 안 · 칸 번호 차례 · 그림은 정보 칸 아래 · 시장 첫 화면은 ① ~ ⑤ 다섯
    const f = m.firsts ?? [], nums = f.map(x => x[0]);
    if (!f.length) no('판단 정보 칸(data-first) 없음');
    else { if (f[0][2] > m.tabTop + 0.5) no(`첫 정보 칸이 한 화면 밖(아래 끝 ${f[0][2]} · 탭 ${Math.round(m.tabTop)})`); if (nums.some((x, i) => x !== i + 1)) no(`정보 칸 차례가 어긋남(${nums.join(' ')})`);
      if (m.artFirst != null) { if (!nums.includes(Number(m.artFirst))) no(`그림 칸 번호 ${m.artFirst} 가 정보 칸 차례에 없음`); } // 그림 칸이 정보 칸 하나(④ 핵심 차트)
      else if (m.artTop != null && f.at(-1)[2] > m.artTop + 0.5) no('그림이 판단 정보 칸보다 위에 있음'); }
    if (FIVE.has(kind) && nums.length !== 5) no(`${kind === 'market' ? '시장' : '업종'} 첫 화면 정보 칸 ${nums.length}개(① 기준 ~ ⑤ 다음 행동 다섯이어야 함)`);
    if (FIVE.has(kind) && m.artFirst !== '4') no(`④ 핵심 차트가 그림 칸이 아님(그림 칸 번호 ${m.artFirst})`);
  } else if (m.labBottom == null || m.labBottom > m.tabTop + 0.5) no(`이름 · 숫자가 한 화면 밖(아래 끝 ${Math.round(m.labBottom)} · 탭 ${Math.round(m.tabTop)})`);
  if (m.weird.length) no('이상한 글자: ' + m.weird.join(' '));
  if (kind === 'cand' && !layoutOnly) { // 후보 줄 = 판 읽기 후보(같은 발행본) · 7곳 상한 · 값이 없는 날은 줄 없음(지어내지 않음)
    const want2 = E.candRows ?? [];
    if ((m.cand?.length ?? 0) > 7) no(`후보 줄 ${m.cand.length}개(7곳 상한)`);
    if (JSON.stringify(m.cand ?? []) !== JSON.stringify(E.cand?.quiet ? [] : want2)) no(`후보 줄이 판 읽기와 다름: ${JSON.stringify(m.cand)?.slice(0, 160)}`);
    stats.numbers += want2.length * 3;
    // 저절로 둘러보기(규칙 49 ④ · 2026-10-10 「4너에제안대로 해」) — 한국어 화면 · 후보가 있으면 칸이 있음 · 이 검사 창(움직임 줄이기)에서는 저절로 시작하지 않음 · 다른 말 화면에는 없음(번역 미룸)
    stats.tour.checks++;
    if (m.tour && m.tour.mode !== 'rest') no(`움직임 줄이기 창인데 둘러보기가 저절로 돎(${m.tour.mode} · 규칙 49 ④ — 움직임 줄이기 기기는 저절로 시작하지 않음)`);
    else if (m.tour) stats.tour.rest++;
    if (String(lang).startsWith('ko') && want2.length && !E.cand?.quiet && !m.tour) no('한국어 첫 화면에 저절로 둘러보기 칸이 없음(규칙 49 ④)');
    if (!String(lang).startsWith('ko') && m.tour) no(`${lang} 화면에 둘러보기 칸이 있음(한국어 화면만 — 번역 미룸)`); }
  if (lang !== 'ko' && m.left?.length) no('번역 안 된 한국어: ' + m.left.join(' / '));
  if (layoutOnly) return;
  const pp = planProblem(m); stats.plans++; if (pp) no('걸음 계획: ' + pp);
  for (const l of m.links) { stats.links++; const [, k, v] = /^#\/(i|stock|map\/f)\/(.+)$/.exec(l) ?? []; if (k === 'i' && !gids.has(v)) no('없는 업종 링크 ' + l); if (k === 'stock' && !codes.has(decodeURIComponent(v))) no('없는 회사 링크 ' + l); if (k === 'map/f' && !famIds.includes(v)) no('없는 갈래 링크 ' + l); }
  // 그림 숫자 ↔ 판 자료(따로 셈) — 값이 비는 날은 빈 하늘({quiet: 화면}) · 없는 주소 · 못 읽은 파일은 오류 화면의 빈 하늘({quiet: 'fail'})

  if (kind === 'flow') compare(b, where, E.flow.quiet ? m.check : m.rot, want); // 돈 흐름(아래 탭 · 2026-10-08 17:41 — 그 전에는 탭 「불장」 맨 위)
  if (kind === 'flow' && !E.flow.quiet) { const o = m.rot?.outs ?? [], i2 = m.rot?.ins ?? []; stats.numbers += o.length + i2.length; if (o.some((x, k) => k && o[k - 1][1] > x[1])) no('빠지는 곳 1위~3위가 가장 많이 나간 순이 아님'); if (i2.some((x, k) => k && i2[k - 1][1] < x[1])) no('들어가는 곳 1위~3위가 가장 많이 들어간 순이 아님');  const want2 = E.flowCos ?? []; stats.numbers += want2.reduce((t, x) => t + 2 + x[3].length, 0); if (JSON.stringify(m.cos) !== JSON.stringify(want2)) no(`돈 흐름 업종의 회사(data-cos)가 판 자료와 다름: ${JSON.stringify(m.cos)?.slice(0, 160)}`); if (JSON.stringify(m.cosDom) !== JSON.stringify(want2)) no(`돈 흐름 업종의 회사 줄(화면)이 판 자료와 다름: ${JSON.stringify(m.cosDom)?.slice(0, 160)}`); } // 10월 8일 12:59 「가장 많이 나간 순」
  else if (kind === 'flow') { if (m.cos != null) no('돈 흐름이 없는 날인데 업종 회사 칸이 있음'); } // 빈 하늘(위에서 맞댐)
  else if (['guide', 'long', 'korea'].includes(kind)) { if (!m.check) no('그림 값(data-check) 없음'); }
  else compare(b, where, m.check, want);
  for (const k of ['topAvg', 'v0', 'v', 'avg', 'vl', 'mean']) if (fin(want?.[k]) && ['home', 'map', 'land', 'ind', 'co', 'similar', 'rise', 'road', 'sectors', 'learn'].includes(kind)) { stats.texts++; const t = want.u === 'pct' ? fmtPct(want[k]) : pctText(want[k]); if (!m.labText.includes(t)) no(`보이는 글에 ${t} 없음`); } // u = 'pct' — 판 읽기 % 값(소수 아님)
}

/* ── 3단 클릭 층(사장님 2026-10-09 21:33 「아틀란스를 3단 클릭구조로 만든다 모든곳에 하나도 빠짐없이 … 점검 1000000만번」 · 21:37 「슬기롭게 해」 · 규칙 47)
   판 · 말마다 모든 화면 쌍(가는 화면 ≠ 오는 화면)의 최소 누름 수 — 화면에서 실제로 그린 고리만(위 막대 · 탐색 줄 · 본문 · 아래 탭) · 접힌 칸 안 고리 = 두 번 · 3번을 넘는 쌍이 하나라도 있으면 실패 ── */
function click3(b, lang, res, C = stats.click3) {
  const nodes = S[b].routes.map(r => r[0]), idx = new Map(nodes.map((r, i) => [r, i])), N = nodes.length;
  const adj = res.map(m => { const e = new Map(); for (const l of m.nav ?? []) { const f = l.startsWith('D'), t = f ? l.slice(1) : l, j = idx.get(t); if (j == null) continue; const w = f ? 2 : 1; if (!e.has(j) || e.get(j) > w) e.set(j, w); } return [...e]; });
  const overBy = new Map();
  for (let s0 = 0; s0 < N; s0++) {
    const d = new Uint8Array(N).fill(255); d[s0] = 0; let cur = [s0];
    for (let k = 0; k < 3 && cur.length; k++) { const nxt = []; for (const u of cur) for (const [v, w] of adj[u]) { const dv = d[u] + w; if (dv < d[v] && dv <= 3) { d[v] = dv; nxt.push(v); } } cur = nxt; } // 무게 1 · 2 — 세 바퀴면 3 까지 모두 닿음
    for (let t = 0; t < N; t++) { if (t === s0) continue; C.pairs++; const dt = d[t]; C.hist[dt === 255 ? '4+' : dt] = (C.hist[dt === 255 ? '4+' : dt] ?? 0) + 1; if (dt <= 3) { if (dt > C.max) C.max = dt; } else { C.over++; if (!overBy.has(s0)) overBy.set(s0, []); overBy.get(s0).push(nodes[t]); } }
  }
  for (const [s0, list] of overBy) bad(b, lang === 'en' ? nodes[s0] : `${nodes[s0]} [${lang}]`, `3번 안에 못 가는 화면 ${list.length}곳(3단 클릭 · 규칙 47): ${list.slice(0, 3).join(' · ')}`);
}

/* ── ① 화면 안 순회(영어 · 한국어) + ④ 움직임 ── */
const VP = {en: {width: 390, height: 640}, ko: {width: 360, height: 640}};
const koPages = []; // 한국어로 그린 화면(글 모음) — ② ③ 이 씀
const tasks = [];
for (const b of EDGE_ONLY ? [] : BOARDS) for (const lang of ['en', 'ko']) tasks.push(async () => {
  const {ctx, page} = await openPage(b, lang, VP[lang]);
  const res = await page.evaluate(CRAWL, {routes: S[b].routes.map(r => r[0]), collect: lang === 'ko', nums: lang === 'ko'});
  for (const m of res) { const [, kind, id] = S[b].kindOf.get(m.hash); judge(m, {b, kind, id, ...S[b], lang, tag: lang === 'en' ? null : lang}); stats.pages++; stats.byLang[lang] = (stats.byLang[lang] ?? 0) + 1; if (lang === 'ko') { koPages.push({b, kind, id, hash: m.hash, texts: m.texts, lay: m.lay}); PRO[`${b} ${m.hash}`] = {nums: m.nums, texts: m.texts}; } }
  if (!QUICK) click3(b, lang, res);
  await ctx.close(); console.log(`${b} · ${lang}: 화면 ${res.length}곳 · ${Math.round((Date.now() - t0) / 1000)}초 · 실패 지금까지 ${fails.length}`);
});
// ⑥ 쉬운 말 층 — 한국어 쉬운 말(처음 화면)로 모든 화면: 같은 판정 + 쉬운 말 판정(맞대기는 전문가 말 화면이 다 돈 뒤 — 아래 easyJudge)
const PRO = {}, EASYRES = [];
for (const b of EDGE_ONLY ? [] : BOARDS) tasks.push(async () => {
  const {ctx, page} = await openPage(b, 'ko', VP.ko, {level: 'easy'});
  const res = await page.evaluate(CRAWL, {routes: S[b].routes.map(r => r[0]), collect: false, easy: true, nums: true});
  for (const m of res) { const [, kind, id] = S[b].kindOf.get(m.hash); judge(m, {b, kind, id, ...S[b], lang: 'ko', tag: 'ko · 쉬운 말'}); stats.pages++; stats.easy.pages++; EASYRES.push({b, m, tag: 'ko · 쉬운 말'}); }
  if (!QUICK) click3(b, 'ko · 쉬운 말', res, stats.easy.click3);
  await ctx.close(); console.log(`${b} · 쉬운 말: 화면 ${res.length}곳 · ${Math.round((Date.now() - t0) / 1000)}초 · 실패 지금까지 ${fails.length}`);
});
for (const b of EDGE_ONLY ? [] : BOARDS) tasks.push(async () => { await tourOne(b); console.log(`${b} · 둘러보기 · ${Math.round((Date.now() - t0) / 1000)}초`); }); // 규칙 49 ④
for (const b of EDGE_ONLY ? [] : BOARDS) tasks.push(async () => {
  const {ctx, page} = await openPage(b, 'ko', {width: 390, height: 640}, {motion: true});
  const kinds = [...new Map(S[b].routes.map(r => [r[1], r])).values()];
  for (const [hash, kind] of QUICK ? kinds.slice(0, 6) : kinds) await motionOne(page, b, hash, null, kind);
  await ctx.close(); console.log(`${b} · 움직임 ${QUICK ? 6 : kinds.length}종 · ${Math.round((Date.now() - t0) / 1000)}초`);
});
/* ── 둘러보기 층(규칙 49 ④ · 사장님 2026-10-10 05:14 「4너에제안대로 해」) — 판마다 첫 화면을 처음 열어(움직임 줄이기 아님):
   저절로 시작 · 걸음 넘김 · 한 번에 하나(웹 움직임 + 칸 그림의 테 차례) · 그림 금빛 = 카드 = 둘러보기 회사 · 글을 누르면 멈춤(기다려도 그대로) · 「이어 보기」 · 「이 기기에서 끄기」 → 다시 열어도 저절로 안 돎
   움직임 줄이기 창은 ① 모든 화면 판정이 봄(data-tour = rest) */
async function tourOne(b) {
  const where = '#/ [둘러보기]', T = stats.tour, no = w => bad(b, where, w), wait = ms => new Promise(r => setTimeout(r, ms));
  const {ctx, page} = await openPage(b, 'ko', {width: 390, height: 640}, {motion: true});
  try {
    T.boards++;
    await page.evaluate(() => window.atlasRoute('#/')); // 처음 여는 첫 화면(이 창에서 처음 — 저절로 시작할 수 있음)
    const w = await page.evaluate(TOUR_WATCH, {want: 5, limit: 15000}); T.checks += 4;
    if (w.none) { no('첫 화면에 둘러보기 칸이 없음'); return; }
    if (!w.started || !w.auto) { no(`처음 열어 가만히 두어도 저절로 시작하지 않음(${w.waitMs}ms 기다림)`); return; }
    T.started++; T.steps += w.seen.length; T.most = Math.max(T.most, w.most);
    if (w.seen.length < 5) no(`걸음이 넘어가지 않음(${w.seen.join(' ')} · ${w.ms}ms)`);
    if (w.most > 1) no(`둘러보기 동안 한 번에 ${w.most}개가 움직임(1이어야 함)`);
    const diff = w.same.filter(x => !(x[1] === x[2] && x[2] === x[3])); T.checks += w.same.length;
    if (diff.length) no(`그림 금빛 · 카드 · 둘러보기 회사가 다름: ${JSON.stringify(diff.slice(0, 2))}`);
    // 글을 누르면 멈춤(읽는 중) — 기다려도 걸음 그대로
    await page.click('#main .cd-why', {position: {x: 8, y: 6}}); await wait(120);
    const p1 = await page.evaluate(TOUR_STATE); await wait(3200); const p2 = await page.evaluate(TOUR_STATE); T.checks += 2;
    if (p1?.mode !== 'pause') no(`글을 눌러도 멈추지 않음(${p1?.mode})`); else if (p2?.key !== p1.key || p2?.mode !== 'pause') no(`멈춘 뒤에도 걸음이 넘어감(${p1.key} → ${p2?.key})`); else T.paused++;
    // 「이어 보기」 — 칸 그림을 화면에 두고 누르면 다시 넘어감
    await page.evaluate(() => document.querySelector('#main .tl-stage').scrollIntoView({block: 'center'})); await wait(150);
    await page.click('#main .tu-main'); const r0 = await page.evaluate(TOUR_STATE); T.checks += 2;
    const moved = await page.waitForFunction(k => { const t = document.querySelector('#main .tu'); return t && `${t.dataset.tourPos}.${t.dataset.tourStep}` !== k; }, r0?.key, {timeout: 6000}).then(() => true).catch(() => false);
    if (r0?.mode !== 'play' || !moved) no(`「이어 보기」를 눌러도 다시 넘어가지 않음(${r0?.mode})`); else T.resumed++;
    // 멈춤 → 「이 기기에서 끄기」 → 다시 열면 저절로 안 돎(끈 줄은 「다시 켜기」)
    await page.click('#main .tu-main'); await wait(80);
    const sw = await page.$('#main .tu-off:not([hidden]) .tu-sw'); T.checks += 3;
    if (!sw) { no('멈춘 뒤 「이 기기에서 끄기」 단추가 없음'); return; }
    await sw.click(); const o1 = await page.evaluate(TOUR_STATE);
    if (o1?.store !== '"off"') no(`「이 기기에서 끄기」가 저장되지 않음(${o1?.store})`);
    await page.reload({waitUntil: 'domcontentloaded'}); await page.waitForFunction(() => document.documentElement.dataset.ready === '1' && typeof window.atlasRoute === 'function', null, {timeout: 30000});
    await page.evaluate(() => (document.querySelector('#main .tu') ? null : window.atlasRoute('#/'))); await page.waitForSelector('#main .tu', {timeout: 15000});
    await page.evaluate(() => document.querySelector('#main .tl-stage').scrollIntoView({block: 'center'})); await wait(2600);
    const o2 = await page.evaluate(TOUR_STATE);
    if (o2?.mode !== 'rest' || o2?.auto !== '0') no(`끈 뒤 다시 열었는데 저절로 돎(${o2?.mode} · auto ${o2?.auto})`); else if (!/꺼짐/.test(o2?.off ?? '')) no(`끈 뒤 「저절로 돌기: 꺼짐」 줄이 없음(${o2?.off})`); else T.off++;
  } catch (e) { no('둘러보기를 재지 못함: ' + String(e?.message ?? e).slice(0, 200)); }
  finally { await ctx.close(); }
}
async function motionOne(page, b, hash, tag = null, kind = null) {
  const where = tag ? `${hash} [${tag}]` : hash, info = INFO_FIRST.has(kind);
  await page.setViewportSize({width: 390, height: 640});
  const r = await page.evaluate(MOTION, {hash, limit: 8000, scroll: info}).catch(e => ({fail: String(e)}));
  stats.motion++;
  if (r.fail) { bad(b, where, '움직임을 재지 못함: ' + r.fail); return; }
  if (!r.startDone) bad(b, where, '처음 모습이 최신 결과(끝 모습)가 아님 — 저절로 재생하거나 걸음이 처음에 있음');
  if (!r.played) bad(b, where, '「재생」 단추 없음');
  if (r.most > 1) bad(b, where, `한 번에 ${r.most}개가 움직임(1이어야 함)`);
  if (r.beats.length < 4) bad(b, where, `기승전결 가운데 ${r.beats.length}개만 짚음`);
  if (!r.done) bad(b, where, `움직임이 ${r.ms}ms 안에 끝나지 않음`);
  for (const vp of [{width: 360, height: 640}, {width: 430, height: 700}]) {
    await page.setViewportSize(vp); await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))));
    const f = await page.evaluate(FIT);
    if (!info && (f.lb == null || f.lb > f.tab + 0.5)) bad(b, where, `${vp.width}×${vp.height}: 이름 · 숫자가 한 화면 밖(${Math.round(f.lb)} > ${Math.round(f.tab)})`); // 판단 정보가 먼저인 화면은 그림이 아래(지시서 4)
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
  EDGE.push({b: 'kr', name: '빈 날 A', board: bd, stocks: {[x1]: s1, [x2]: s2}, missing: ['/story.json', '/changelog.json', '/data/atlas11/view/agenda.json', '/data/atlas11/view/lens.json'], agenda: null, // 판 읽기 파일도 못 읽은 날(2026-10-08 20:19 지시서 — 0 이나 옛 값으로 채우지 않음)
    visits: [['#/', 'cand'], ['#/compare', 'compare'], ['#/market', 'market'], ['#/sectors', 'sectors'], ['#/hot', 'home'], ['#/flow', 'flowwho'], ['#/flow/rotation', 'flow'], ['#/i/' + gNull.id, 'ind', gNull.id], ['#/stock/' + x1, 'co', x1], ['#/stock/' + x2, 'co', x2], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/start', 'start'], ['#/agenda', 'agenda'], ['#/log', 'log'],
      ['#/road', 'road'], ['#/map', 'map'], ['#/stocks', 'stocks'], ['#/check', 'check'], ['#/watch', 'watch'], ['#/i/zznone', 'ind', 'zznone'], ['#/map/f/zznone', 'land', 'zznone'], ['#/stock/ZZNONE', 'co', 'ZZNONE']], motion: '#/similar'}); // 길잡이 규칙에 맞는 없는 주소(맞지 않으면 첫 화면으로 감)
}
if ((!QUICK || EDGE_ONLY) && BOARDS.includes('us')) { // B — 미국 판 모두 빔
  const dir = path.join(DIST, 'us/data/atlas11/view'), bd = structuredClone(boardOf.us);
  for (const c of bd.companies) c.change20 = null; for (const g of bd.groups) g.change20 = null;
  bd.similar = {...(bd.similar ?? {}), items: []}; bd.next = {...(bd.next ?? {}), items: []}; bd.start = null;
  const c0 = bd.companies[0].code, g0 = bd.groups[0].id, f0 = familyOf(bd.groups[0].label).id;
  const s0 = {...await readJson(path.join(dir, `stocks/${c0}.json`)), change20: null};
  EDGE.push({b: 'us', name: '빈 날 B', board: bd, stocks: {[c0]: s0}, missing: ['/story.json', '/changelog.json', '/us/data/atlas11/view/lens.json'], agenda: await readJson(path.join(dir, 'agenda.json')).catch(() => null),
    visits: [['#/', 'cand'], ['#/compare', 'compare'], ['#/market', 'market'], ['#/sectors', 'sectors'], ['#/hot', 'home'], ['#/flow', 'flowwho'], ['#/flow/rotation', 'flow'], ['#/map', 'map'], ['#/map/f/' + f0, 'land', f0], ['#/i/' + g0, 'ind', g0], ['#/stock/' + c0, 'co', c0], ['#/similar', 'similar'], ['#/rise', 'rise'], ['#/road', 'road'],
      ['#/agenda', 'agenda'], ['#/stocks', 'stocks'], ['#/check', 'check'], ['#/watch', 'watch'], ['#/log', 'log'], ['#/start', 'start'], ['#/guide', 'guide'], ['#/long', 'long'], ['#/korea', 'korea'], ['#/learn', 'learn']], motion: '#/map'});
}
for (const x of EDGE) tasks.push(async () => {
  const forge = await forgeOf(x.b, x.board, x.stocks, x.missing), E = expectOf(x.b, x.board, x.agenda, null, null, others, null); // 판 읽기는 못 읽은 날(빈 하늘)
  const groups = x.board.groups ?? [], ctxS = {E, gids: new Set(groups.map(g => g.id)), codes: new Set(x.board.companies.map(c => c.code)), famIds: [...new Set(groups.map(g => familyOf(g.label).id))]};
  for (const lang of ['en', 'ko', 'ko-easy']) { // 빈 날 길도 쉬운 말로 한 번 더(규칙 48 — 값이 비는 날의 글도 쉬운 말 · 숫자 맞대기)
    const easy = lang === 'ko-easy', L = easy ? 'ko' : lang;
    const {ctx, page} = await openPage(x.b, L, VP[L], {forge, level: easy ? 'easy' : null});
    const res = await page.evaluate(CRAWL, {routes: x.visits.map(v => v[0]), collect: L === 'ko' && !easy, easy, nums: L === 'ko'});
    res.forEach((m, i) => { const [, kind, id] = x.visits[i], tag = `${x.name} · ${easy ? 'ko · 쉬운 말' : lang}`; judge(m, {b: x.b, kind, id, ...ctxS, lang: L, tag}); stats.edge++; stats.pages++; stats.byLang[L] = (stats.byLang[L] ?? 0) + 1;
      if (easy) { stats.easy.pages++; stats.easy.edge++; EASYRES.push({b: x.b, m, tag, pro: `${x.name} ${m.hash}`}); } else if (L === 'ko') PRO[`${x.name} ${m.hash}`] = {nums: m.nums, texts: m.texts}; });
    await ctx.close();
  }
  const {ctx, page} = await openPage(x.b, 'ko', {width: 390, height: 640}, {motion: true, forge});
  await motionOne(page, x.b, x.motion, `${x.name} · 움직임`, x.visits.find(v => v[0] === x.motion)?.[1] ?? null); await ctx.close();
  console.log(`${x.name}(${x.b}): 화면 ${x.visits.length * 2}곳 · ${Math.round((Date.now() - t0) / 1000)}초`);
});
await pool(tasks, JOBS); tick('crawl');

/* ── ⑥ 쉬운 말 판정(규칙 48) — 전문가 말 화면과 맞대기 ── */
const BAN = new RegExp([PREDICTION_WORDS.source, '사라[!.\\s]|팔라[!.\\s]|추천|목표가|확실|보장|무조건', ...BANNED.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))].join('|'), 'g');
{ const names = []; for (const bd of Object.values(boardOf)) { for (const c of bd.companies) names.push(c.name); for (const g of bd.groups ?? []) names.push(g.label); } addEasyNames(names); }
for (const {b, m, tag, pro} of EASYRES) {
  const where = `${m.hash} [${tag}]`, no = w => bad(b, where, w), E2 = stats.easy;
  E2.checks++; if (m.what) E2.what++; else no('쉬운 말 화면 맨 위 「이 화면은?」 한 줄이 없음(규칙 48)');
  const P = PRO[pro ?? `${b} ${m.hash}`];
  if (!P?.nums && P?.nums !== '') no('맞댈 전문가 말 화면이 없음(숫자 맞대기 못 함)');
  else { const a = m.nums.split(' ').filter(Boolean), z = P.nums.split(' ').filter(Boolean); E2.numPages++; E2.numTokens += Math.max(a.length, z.length); E2.checks += Math.max(a.length, z.length);
    if (m.nums !== P.nums) { const ca = new Map(), cz = new Map(); for (const x of a) ca.set(x, (ca.get(x) ?? 0) + 1); for (const x of z) cz.set(x, (cz.get(x) ?? 0) + 1); const lost = [...cz].filter(([x, n]) => (ca.get(x) ?? 0) < n).map(([x]) => x), more = [...ca].filter(([x, n]) => (cz.get(x) ?? 0) < n).map(([x]) => x);
      no(`쉬운 말 화면의 숫자가 전문가 말 화면과 다름(빠짐 ${lost.slice(0, 5).join(' ') || '없음'} · 더함 ${more.slice(0, 5).join(' ') || '없음'})`); } }
  const proBan = new Set((P?.texts ?? []).flatMap(t => t.match(BAN) ?? []));
  const hardHits = [], banHits = [];
  for (const t of m.front ?? []) { E2.front++; E2.hardChecks += HARD.length; E2.bannedChecks++; E2.checks += HARD.length + 1;
    const h = hardLeft(t); if (h.length) { E2.hardHits += h.length; hardHits.push(`${h.join(',')}: ${t.slice(0, 40)}`); }
    for (const w of t.match(BAN) ?? []) if (!proBan.has(w)) banHits.push(`${w}: ${t.slice(0, 40)}`); }
  if (hardHits.length) no(`쉬운 말 화면 펼친 글에 어려운 말 ${hardHits.length}줄: ${hardHits.slice(0, 3).join(' / ')}`);
  if (banHits.length) no(`쉬운 말이 금지 말을 새로 넣음: ${banHits.slice(0, 3).join(' / ')}`);
}
tick('easy');

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

// 실패를 둘로 나눠 적음(2026-10-09) — 「번역 안 된 한국어」(73개 말 사전에 아직 없는 새 글)와 그 밖의 실패 · 올리기 문은 그 밖의 실패가 하나라도 있으면 막고, 번역만 남은 결과는 사장님 번역 면제(trans-waiver.json · 기한 있음)가 있을 때만 지나감
const TRANS = f => /^번역 안 된 한국어/.test(f.what ?? '');
const transFailed = fails.filter(TRANS).length, otherFailed = fails.length - transFailed;
const report = {schema: 'atlas11-full-check-3', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), lap, code: await codePrint(ROOT), boards: BOARDS, quick: QUICK, langs: ['en', 'ko'], ...stats, failed: fails.length, transFailed, otherFailed,
  ok: fails.length === 0 && !QUICK && SITE_BOARDS.every(b => BOARDS.includes(b)) && stats.edge > 0 && stats.transLangs === codesI18n.length && stats.layoutLangs === codesI18n.length + 1 && stats.easy.pages > 0 && stats.easy.edge > 0 && stats.easy.click3.pairs > 0 && stats.tour.boards === BOARDS.length && stats.tour.checks > 0 && stats.flat.pages > 0 && stats.flat.checks > 0,
  shape: !QUICK && SITE_BOARDS.every(b => BOARDS.includes(b)) && stats.edge > 0 && stats.transLangs === codesI18n.length && stats.layoutLangs === codesI18n.length + 1 && stats.easy.pages > 0 && stats.easy.edge > 0 && stats.easy.click3.pairs > 0 && stats.tour.boards === BOARDS.length && stats.tour.checks > 0 && stats.flat.pages > 0 && stats.flat.checks > 0, // 모든 층을 다 돈 결과인가(실패 수와 따로) · 둘러보기 층(규칙 49 ④) · 입체 없음 층(2026-10-10)
  fails: [...fails.filter(f => !TRANS(f)), ...fails.filter(TRANS)].slice(0, 400)};
await fs.mkdir(path.dirname(path.resolve(ROOT, OUT)), {recursive: true});
await fs.writeFile(path.resolve(ROOT, OUT), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify({pages: stats.pages, byLang: stats.byLang, plans: stats.plans, numbers: stats.numbers, links: stats.links, texts: stats.texts, motion: stats.motion, edge: stats.edge, transLangs: stats.transLangs, transStrings: stats.transStrings, layoutLangs: stats.layoutLangs, layoutPages: stats.layoutPages, flat: stats.flat, click3: stats.click3, easy: stats.easy, tour: stats.tour, failed: fails.length, transFailed, otherFailed, ok: report.ok, seconds: report.seconds, lap}));
for (const f of report.fails.slice(0, 40)) console.log(` ✗ ${f.board} ${f.route} — ${f.what}`); // 번역 밖 실패가 먼저
process.exit(report.ok || (QUICK && !fails.length) ? 0 : 1);

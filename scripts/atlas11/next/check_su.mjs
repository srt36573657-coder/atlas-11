#!/usr/bin/env node
// 수르 두 길 검사(/su/ · site/su/ · 주문 2049 — 사장님 2026-11-03 15:49(+04) 「무엇을 클릭하면 그 연관된곳으로 명확하게 이동되서 그 정보를 제공해야」)
//   쓰는 법: node scripts/atlas11/next/check_su.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받기만 함 — 짧아서 늘 모두 돎)
//   ① 누르면 그것이 나옴 — 처음 쪽 줄마다 눌러 그 회사 쪽(큰 제목 = 줄의 회사 이름) · 회사 쪽 업종 단추 → 그 업종 쪽(큰 제목 = 업종 이름 + 업종) · 업종 쪽 첫 회사 → 그 회사
//   ② 고리는 새 판 길뿐 — #/ · #/b · #/k · #/r · #/p · #/c/<번호> · #/k|r|p/<번호> · #/i/<업종> · /next/ · /next/#/why/<번호> (설명 쪽 · 바깥 · 선물 · 카톡 · 신 · 스승 0 · 주문 1238 새 판이 길 넷을 더함)
//   ③ 줄이 자료와 같음 — 꽃이 될 회사(오늘 고른 회사 · 없는 날 가장 가까운 회사 + 「가까운 곳」 · 고른 회사가 아니라는 말) · 돈이 몰린 회사(한 달 앞선 업종 셋의 대장)를 이 검사가 자료에서 따로 셈
//   ④ 왜 여기 있나 — 가까운 회사 쪽에 「맞은 조건」 · 「안 맞은 조건」 · 돈이 몰린 회사 쪽에 「돈이 몰린 회사예요」 · 그림 글(한 달 %)이 회사 자료와 같음
//   ⑤ 세 폭(320 · 360 · 390): 가로 넘침 0 · 글 17px 넘게 · 누르는 것 48 × 48 넘게 · 화면 오류 0 · 모든 쪽 맨 위 안전 문장 · 쓰지 않을 말 · 망치는 길 0(이름 빼고)
//   ⑥ 처음 쪽 길이 3 화면 안(390 × 844 — 두 칸만)
//   ⑧ 「왜 사?」 답하기(주문 1506 · #/q/<번호>) — 열한 질문 끝까지 · 결과 판정 · 매매일지 기록 한 줄 · 쪽 규칙
//   ⑨ 주문 1616(사장님 2026-11-04 11:16(+04) 「첫 장부터 끝 장까지 전부 새로 짜라」) — 다음 단추 일곱 번에 끝(여덟 화면 · 걸음 표시 1~8) · 탭 넷 기승전결 차례 · 쪽마다 맨 위 큰 값 → 큰 그림 → 중간 값 → … → 맨 아래 출처와 조사 날짜
//      · 첫 화면의 그림 넓이 50% 넘게 · 움직이는 그림 둘 넘게 · 큰 값의 여섯 칸(빈 칸 = 「확인 필요」) · 중간 값 · 자세한 값마다 여섯 칸 · 기록 서랍 여섯 · 그림 수 셈
//   ⑦ 첫 화면이 된 뒤(사장님 2026-11-03 18:33(+04) 「응」): 처음 쪽 본질 세 줄(essence.js 그대로 · 회사 수 · 받은 때 = home-summary) · 지금 수르 고리(#/w/ · #/s/ · ?lang=)는 /next/ 로 이어짐 · ?v= · 다른 표는 그대로 · 느린 4G 가장 큰 그림 2.5초 안
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {screenHits, ruinHits} from '../../../site/next/words.js'; // 화면 낱말 · 망치는 길(수익 자랑 gainHits 는 보내는 글 잣대 — 화면 %는 사실 글)
import {essenceData, essenceLines} from '../../../site/next/essence.js'; // 본질 세 줄(첫 화면)

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'su-check-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const LINK_OK = /^(#\/|#\/[bkrpqjmfn]|#\/[ckrpq]\/[0-9A-Z]{6}|#\/c\/[0-9A-Z]{6}\/more|#\/c\/[0-9A-Z]{6}\/y\/(hot|bloom|money|hotNext|moneyNext|bloomNext)|#\/m\/[\w-]+|#\/gift|#\/r\/[mwdynk]|#\/i\/[^/]+|\/next\/|\/next\/\?lang=en|\/next\/#\/(why|share|gift|me|jinhwa|find)(\/[0-9A-Z]{6})?|\/hello\.html|https:\/\/shin-yxy\.gino\.im\/|#\/g(\/[a-z]+)?|\/(next|atlas)\/\?(lang=en&)?su=[a-z]+#\/[\w\/.%-]*|\/(hello|letter|invite|privacy)\.html\?su=[a-z]+(#[\w-]+)?|\/su\/privacy\.html(#[\w-]+)?)$/; // 주문 0054 — 셋의 길 #/g · 옛 쪽을 수르 틀로(?su=<묶음>) · 찾기 · 신 72 · 스승 39 · 급등 // 주문 2044 21곳 길 — #/m 땅 지도 · #/m/<땅> · #/c/<번호>/more · #/f 친구에게(옛 기능 자리: 보내기 · 선물 · 왜 사? · 내 종목 · 진화 · 찾기 · 영어 · 소개 영상 · 만수르) // 새 판(주문 1238) 길 넷 #/b 꽃 · #/k 조건 · #/r 기록 · #/p 멈춤(+ /<번호>) · 주문 1616 기록 서랍 #/r/m · w · d · y · n · 주문 1103 될 듯 21곳 #/n

/** 자료에서 따로 셈(화면 코드 site/su/su-data.js 를 쓰지 않음) */
const J = async u => { const r = await fetch(base + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
// 장 중 값을 받지 않게(자료와 맞대는 검사 — 판 값 그대로 · 404 대신 「값 없음」 답이라 화면 오류 글이 생기지 않음) — 주문 0806
const QUIET = ctx => ctx.route('**/api/price*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({schema: 'su-price-1', day: '0000-00-00', status: 'closed', items: {}})}));
const pctOf = v => (Number.isFinite(v) ? (Math.abs(v).toFixed(1) === '0.0' ? '0.0%' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%') : '?');
/** 회사 쪽 한 달 줄의 바탕(주문 0806) — 42칸 판 값(첫 페이지 spOf 잣대: 21개 · 끝 값 = 그날 현재가)이면 board · 아니면 null(옛 길 co.line) — 화면 코드를 쓰지 않고 따로 셈 */
const S21 = {};
async function lineWant(code) {
  if (!S21.T) [S21.T, S21.N, S21.H] = await Promise.all([J('/su/data/su21.json').catch(() => null), J('/su/data/su21-next.json').catch(() => null), J('/atlas/data/home.json').catch(() => null)]);
  const K6 = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'], day = S21.T?.asOf?.board;
  const bd = [...K6.flatMap(k => S21.T?.lists?.[k] ?? []), ...K6.flatMap(k => S21.N?.lists?.[k] ?? [])].find(x => x?.code === code && Number.isFinite(x.close) && x.close > 0 && x.date === day);
  if (!(bd && Array.isArray(bd.c) && bd.c.length === 21 && bd.c.every(v => Number.isFinite(v) && v > 0) && bd.c[20] === bd.close)) return null;
  const co = await J('/atlas/data/co/' + code + '.json').catch(() => null), mk = co?.c?.market === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI';
  const rows = (S21.H?.idx?.[mk]?.rows ?? []).filter(r => Array.isArray(r) && typeof r[0] === 'string' && Number.isFinite(r[1]) && r[1] > 0), have = new Map(rows.map(r => [r[0], r[1]]));
  let cd = Array.isArray(bd.cd) && bd.cd.length === 21 && bd.cd[20] === bd.date && (!bd.cFrom || bd.cd[0] === bd.cFrom) ? bd.cd : null;
  if (!cd && bd.cFrom) { const ds = rows.map(r => r[0]).filter(x => x >= bd.cFrom && x <= bd.date); if (ds.length === 21 && ds[0] === bd.cFrom && ds[20] === bd.date) cd = ds; }
  return {v: bd.c, cd, from: cd ? cd[0] : bd.cFrom ?? null, to: bd.date, idx: !!cd && cd.every(d => have.has(d)), last: bd.c[20] / bd.c[0] * 100 - 100, it: bd};
}
/** 꺾은선 꼴 — 점마다 높이를 제 가장 낮은 · 높은 점 사이 0 ~ 1 로(두 그림의 크기가 달라도 같은 값이면 같은 꼴) */
const shapeOf = pts => { const ys = pts.map(q => q[1]), lo = Math.min(...ys), hi = Math.max(...ys); return ys.map(y => (hi - lo > 1e-9 ? (y - lo) / (hi - lo) : 0)); };
const ptsOf = (s, re) => [...String(s ?? '').matchAll(re)].map(m => [+m[1], +m[2]]);
const sameShape = (a, b) => a.length === b.length && a.length > 1 && a.every((y, i) => Math.abs(y - b[i]) <= 0.02);
const B = await J('/next/data/theme-bloom.json'), TH = await J('/next/data/theme.json'), SUM = await J('/next/data/home-summary.json').catch(() => null);
const ESS = essenceLines(essenceData({summary: SUM}));
const picks0 = (B?.today?.inds ?? []).flatMap(i => (i?.co ?? []).filter(r => /^[0-9A-Z]{6}$/.test(r?.[0] ?? '')).map(r => ({code: r[0], name: r[1]})));
const near0 = picks0.length ? [] : (B?.near?.today ?? []).filter(r => /^[0-9A-Z]{6}$/.test(r?.[0] ?? '')).map(r => ({code: r[0], name: r[1]}));
const money0 = (TH?.inds ?? []).filter(i => typeof i?.x === 'number' && i.x > 0 && /^[0-9A-Z]{6}$/.test(i?.lead?.[0] ?? '') && typeof i.lead[1] === 'string').sort((a, b) => b.x - a.x).slice(0, 3).map(i => ({code: i.lead[0], name: i.lead[1], ind: i.n}));
// 누르면 열리는 회사만(su.js base 와 같은 셈) — 회사 자료가 가벼운 판뿐(c 없음)이면 누르면 「찾지 못했어요」라 화면 목록에서 뺌(2026-11-05 실리콘투 · 41949468910)
const opensCo = async c => { try { const co = await J('/atlas/data/co/' + c.code + '.json'); return !!co?.c && typeof co.c.name === 'string'; } catch { return false; } };
const keepOpen = async xs => { const ok = await Promise.all(xs.map(opensCo)); return xs.filter((x, i) => ok[i]); };
const [picks, near, money] = await Promise.all([keepOpen(picks0), keepOpen(near0), keepOpen(money0)]);
R.m.dropped = [...picks0, ...near0, ...money0].filter(x => ![...picks, ...near, ...money].some(y => y.code === x.code)).map(x => x.name); // 뺀 회사(결과에 남김)
R.m.data = {picks: picks.length, near: near.length, money: money.map(x => x.name)};

const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const URL_OF = hash => `${base}/su/?v=${Date.now()}${hash}`;
const more = p => p.evaluate(() => { for (const d of document.querySelectorAll('#su main > details.su-more')) d.open = true; }); // 신문 짜임 「자세히」 서랍을 엶 — 그 안 목록 · 단추를 누르는 길(주문 1023 [2] 3 · 4 — 기능은 서랍 안에 그대로)
const open = async (p, hash) => { await p.goto(URL_OF(hash), {waitUntil: 'networkidle'}); await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {}); await p.waitForFunction(() => !document.querySelector('#su main > .su-hero[data-wait]'), null, {timeout: 15000}).catch(() => {}); await p.waitForTimeout(250); };
const settle = async (p, name = null) => { await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {}); await p.waitForFunction(() => !document.querySelector('#su main > .su-hero[data-wait]'), null, {timeout: 15000}).catch(() => {}); /* 큰 그림 자리가 채워질 때까지(주문 1023 — 글 먼저 · 그림 뒤) */ if (name) await p.waitForFunction(n => (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim() === n, name, {timeout: 10000}).catch(() => {}); await p.waitForTimeout(300); }; // 누른 뒤 새 쪽이 그려질 때까지(큰 제목이 바뀜 · 10초 안)
/** 화면 재기 — 넘침 · 작은 글 · 작은 누름 · 고리 · 글 · 큰 제목 */
const measure = p => p.evaluate(() => {
  const v = document.getElementById('su'), out = {w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, small: [], tiny: [], links: [], text: '', h1: '', screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2)};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; if (e.closest('details:not([open]) > :not(summary)')) return false; /* 닫힌 서랍 안은 안 보임(크롬은 닫힌 details 안에도 자리를 셈 — 신문 짜임 「자세히」) */ for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
  for (const a of v.querySelectorAll('a[href], button')) { if (!vis(a)) continue; const r = a.getBoundingClientRect(); out.links.push(a.getAttribute('href') ?? '(단추)'); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${(a.innerText || '').trim().slice(0, 30)} ${Math.round(r.width)}×${Math.round(r.height)}`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.textContent.trim(); if (!t || !n.parentElement || !vis(n.parentElement)) continue; const fs = parseFloat(getComputedStyle(n.parentElement).fontSize); if (fs < 16.95) out.tiny.push(`${t.slice(0, 24)} ${fs}px`); }
  const c = v.cloneNode(true); for (const e of c.querySelectorAll('[data-proper]')) e.remove(); out.text = c.innerText ?? c.textContent;
  out.h1 = (v.querySelector('h1')?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return out;
});
const pageRules = (m, where) => {
  check(m.w <= m.cw, where + ' 가로 넘침', `${m.w} > ${m.cw}`);
  check(!m.tiny.length, where + ' 글 17px 넘게', m.tiny.slice(0, 4).join(' / '));
  check(!m.small.length, where + ' 누르는 것 48 × 48', m.small.slice(0, 4).join(' / '));
  const bad = m.links.filter(h => h !== '(단추)' && !LINK_OK.test(h));
  check(!bad.length, where + ' 고리 다섯 꼴뿐(설명 · 바깥 · 선물 · 카톡 0)', bad.slice(0, 5).join(' '));
  check(m.text.includes(SAFE), where + ' 안전 문장', '');
  const hits = [...screenHits(m.text), ...ruinHits(m.text)].map(x => x.word ?? x);
  check(!hits.length, where + ' 쓰지 않을 말 0', JSON.stringify(hits).slice(0, 120));
};

for (const width of [390, 360, 320]) {
  const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx); // 판 값과 맞대는 검사(장 중에도 같은 답)
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  const W = '[' + width + '] ';
  // 처음 쪽
  await open(p, '#/');
  const m0 = await measure(p); pageRules(m0, W + '처음');
  if (width === 390) { R.m.home = {screens: m0.screens, links: m0.links.length}; check(m0.screens <= 7.5, W + '처음 쪽 7.5 화면 안(주문 1616 — 그림이 화면 대부분이라 그림만큼 길어짐 · 주문 1807·1833 「정보를 빼지 마라」 — 숫자마다 「그래서」 · 낱말 풀이 · 여섯 칸 지도 · 숨기지 않는 네 칸으로 한 화면 반 늘림 · 받은 자료와 글꼴에 따라 0.3 화면 오감)', String(m0.screens)); }
  const ess = await p.evaluate(() => [1, 2, 3].map(i => document.querySelector(`#su [data-ess="${i}"]`)?.textContent ?? null));
  check(JSON.stringify(ess) === JSON.stringify(ESS), W + '처음 쪽 본질 세 줄 = essence.js', JSON.stringify(ess).slice(0, 200));
  if (width === 390) {
    // 지금 수르 고리 · 말 · 카톡 표 → /next/ 로 이어짐 · 수르 두 길 길과 다른 표는 그대로
    for (const [q, hh, want] of [['', '#/w/005930', /^\/next\/$/], ['', '#/why', /^\/next\/$/], ['?lang=en', '#/', /^\/(next|atlas)\/$/], ['?v=1', '#/', /^\/su\/$/], ['?fbclid=x', '#/', /^\/su\/$/]]) {
      await p.goto(`${base}/su/${q}${hh}`, {waitUntil: 'networkidle'}).catch(() => {}); await p.waitForTimeout(800);
      const u = new URL(p.url());
      check(want.test(u.pathname) && (want.source.includes('su') || u.hash === hh || hh === '#/'), W + '고리 이어짐 ' + (q + hh || '(빈)'), u.pathname + u.search + u.hash);
    }
  }
  { // 주문 2044 — 처음 쪽 21곳 한눈에(셋 × 일곱 · 이름 = su21.json · 겹친 곳 ✦ · 누르면 그 회사)
    const T21 = await J('/su/data/su21.json');
    // 주문 1023 [6] 2 · 3 — 21곳은 무하의 세 여인 그림 안 이름표(목록 data-k · 이름 data-name · 겹친 곳 ✦ = aria-label 「두 목록에 함께」)
    const g = await p.evaluate(() => ['hot', 'bloom', 'money'].map(k => [...document.querySelectorAll(`#su main > .su-hero a[data-k="${k}"]`)].map(a => ({href: a.getAttribute('href'), name: a.getAttribute('data-name') ?? '', x: /두 목록에 함께/.test(a.getAttribute('aria-label') ?? '')}))));
    const want21 = ['hot', 'bloom', 'money'].map(k => (T21.lists[k] ?? []).map(c => c.name));
    check(JSON.stringify(g.map(c => c.map(x => x.name))) === JSON.stringify(want21), W + '처음 쪽 21곳 = su21.json(불장 · 꽃이 될 · 돈이 몰리는 일곱씩)', JSON.stringify(g.map(c => c.length)));
    check(g.flat().every((x, j) => new RegExp('^#/c/[0-9A-Z]{6}/y/(hot|bloom|money)$').test(x.href)), W + '21곳 이름 → 그 회사의 「왜?」 쪽(주문 0123)', g.flat().map(x => x.href).filter(h => !/^#\/c\/[0-9A-Z]{6}\/y\/(hot|bloom|money)$/.test(h)).slice(0, 3).join(' '));
    { // 주문 1249(사장님 2026-11-08 12:49) — 처음 쪽 그림 하나에 지금 21곳과 될 듯 21곳을 함께(무대 쇼 · 요즘 옷 세 여인) · 될 듯 이름표 = su21.json 될 듯 셋 일곱씩 · 누르면 그 회사
      const gH = await p.evaluate(() => ['hotNext', 'bloomNext', 'moneyNext'].map(k => [...document.querySelectorAll(`#su main > .su-hero a[data-k="${k}"]`)].map(a => ({href: a.getAttribute('href'), name: a.getAttribute('data-name') ?? ''}))));
      const wantH = ['hotNext', 'bloomNext', 'moneyNext'].map(k => (T21.lists[k] ?? []).map(c => c.name));
      check(JSON.stringify(gH.map(c => c.map(x => x.name))) === JSON.stringify(wantH) && gH.every(c => c.length === 7), W + '처음 쪽 그림에 될 듯 21곳도 함께 = su21.json(될 듯 셋 일곱씩)', JSON.stringify(gH.map(c => c.length)));
      check(gH.flat().every(x => /^#\/c\/[0-9A-Z]{6}\/y\/(hotNext|bloomNext|moneyNext)$/.test(x.href)), W + '처음 쪽 될 듯 이름 → 그 회사의 「왜?」 쪽(주문 0123)', gH.flat().map(x => x.href).filter(h => !/^#\/c\/[0-9A-Z]{6}\/y\/(hotNext|bloomNext|moneyNext)$/.test(h)).slice(0, 3).join(' '));
      check(await p.evaluate(() => document.querySelector('#su main > .su-hero svg')?.getAttribute('data-show') === 'now-next'), W + '처음 쪽 그림 = 지금 · 될 듯 한 무대', '');
      if (width === 390) for (const r of gH.map(c => c[0]).filter(Boolean)) {
        await open(p, '#/'); await p.click(`#su main > .su-hero a[data-k][href="${r.href}"]:is([data-k="hotNext"], [data-k="bloomNext"], [data-k="moneyNext"])`); await settle(p, r.name);
        const m1 = await measure(p);
        check(p.url().endsWith(r.href) && m1.h1.startsWith(r.name + ', 왜 ') && /듯/.test(m1.h1), W + '처음 쪽 될 듯 이름 누르면 그 회사의 「왜?」 쪽 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
        check(await p.evaluate(() => document.querySelectorAll('#su .yw-part .yw-li').length === 36), W + '처음 쪽에서 누른 될 듯 회사 — 서른여섯 가지 — ' + r.name, '');
      }
      if (width === 390) await open(p, '#/');
    }
    const ov = new Set((T21.overlap ?? []).map(o => o.name));
    check(g.flat().every(x => x.x === ov.has(x.name)), W + '겹친 곳마다 ✦ · 안 겹친 곳 없음', [...ov].join(','));
    R.m.t21 = {listed: T21.counts.listed, b365: T21.counts.b365, n: g.flat().length, overlap: ov.size, distinct: T21.distinct};
    const tap21 = width === 390 ? [...new Map(g.flat().map(x => [x.href, x])).values()] : g.map(c => c[0]).filter(Boolean);
    for (const r of tap21) {
      await open(p, '#/'); await p.click(`#su main > .su-hero a[href="${r.href}"]`); await settle(p, r.name);
      const m1 = await measure(p);
      check(p.url().endsWith(r.href) && m1.h1.startsWith(r.name + ', 왜 '), W + '21곳 누르면 그 회사의 「왜?」 쪽 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
      check(await p.evaluate(() => document.querySelectorAll('#su .yw-part .yw-li').length === 36 && document.querySelectorAll('#su .yw-crit .yw-li').length === 7), W + '「왜?」 쪽 서른여섯 가지 · 기준 일곱 — ' + r.name, '');
      pageRules(m1, W + '21곳 회사 ' + r.name);
    }
    { // 주문 1103(사장님 2026-11-08 11:03 · 11:08 「응」) — 될 듯 21곳 #/n · 같은 세 여인 · 불장이 될 듯 · 꽃이 될 듯 · 돈이 몰릴 듯 일곱씩 · 지난 1년 기록 · 누르면 그 회사의 까닭
      await open(p, '#/n');
      const mN = await measure(p); pageRules(mN, W + '될 듯 21곳');
      const gN = await p.evaluate(() => ['hot', 'bloom', 'money'].map(k => [...document.querySelectorAll(`#su main > .su-hero a[data-k="${k}"]`)].map(a => ({href: a.getAttribute('href'), name: a.getAttribute('data-name') ?? ''}))));
      const wantN = ['hotNext', 'bloomNext', 'moneyNext'].map(k => (T21.lists[k] ?? []).map(c => c.name));
      check(JSON.stringify(gN.map(c => c.map(x => x.name))) === JSON.stringify(wantN) && gN.every(c => c.length === 7), W + '될 듯 21곳 = su21.json(될 듯 셋 일곱씩)', JSON.stringify(gN.map(c => c.length)));
      check(await p.evaluate(() => document.querySelector('#su main > .su-hero svg')?.getAttribute('data-mode') === 'next'), W + '될 듯 21곳 그림 = 될 듯 판', '');
      check(['hotNext', 'bloomNext', 'moneyNext'].every(k => Number.isFinite(T21.past?.[k]?.per100) && Number.isFinite(T21.past?.[k]?.base100)), W + '될 듯 셋 지난 1년 기록(100번에 몇 번 · 아무 회사)', JSON.stringify(T21.past ?? null).slice(0, 120));
      check(await p.evaluate(() => [...document.querySelectorAll('#su .su-mode a')].map(a => a.getAttribute('href')).join(' ') === '#/ #/n'), W + '지금 · 될 듯 두 칸 단추', '');
      for (const r of gN.map(c => c[0]).filter(Boolean)) {
        await open(p, '#/n'); await p.click(`#su main > .su-hero a[href="${r.href}"]`); await settle(p, r.name);
        const m1 = await measure(p);
        check(p.url().endsWith(r.href) && m1.h1.startsWith(r.name + ', 왜 ') && /듯/.test(m1.h1), W + '될 듯 21곳 누르면 그 회사의 「왜?」 쪽 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
        check(await p.evaluate(() => document.querySelectorAll('#su .yw-part .yw-li').length === 36), W + '될 듯 21곳에서 누른 회사 — 서른여섯 가지 — ' + r.name, '');
      }
    }
    await open(p, '#/b'); await more(p); // 옛 처음(꽃 · 돈 줄)은 #/b 에 그대로 — 아래 검사는 그 쪽에서(줄은 「자세히」 안)
  }
  const rows = await p.evaluate(() => [...document.querySelectorAll('#su section[aria-label] a.su-row')].map(a => ({sec: a.closest('section').getAttribute('aria-label'), href: a.getAttribute('href'), name: a.querySelector('[data-proper]')?.textContent ?? '', chip: a.querySelector('.su-chip')?.textContent ?? ''})));
  const bl = rows.filter(r => r.sec === '꽃이 될 회사'), mo = rows.filter(r => r.sec === '돈이 몰린 회사');
  const want = picks.length ? picks : near;
  check(JSON.stringify(bl.map(r => r.name)) === JSON.stringify(want.map(r => r.name)), W + '꽃이 될 회사 줄 = 자료', `${bl.map(r => r.name)} / ${want.map(r => r.name)}`);
  check(bl.every(r => r.href === '#/c/' + want.find(x => x.name === r.name)?.code), W + '꽃이 될 회사 줄 → 그 회사 번호', bl.map(r => r.href).join(' '));
  if (near.length) { check(bl.every(r => r.chip === '가까운 곳'), W + '가까운 회사 줄마다 「가까운 곳」', bl.map(r => r.chip).join(',')); check((await p.evaluate(() => document.body.innerText)).includes('고른 회사가 아니에요'), W + '고른 회사가 아니라는 말(#/b)', ''); }
  check(JSON.stringify(mo.map(r => r.name)) === JSON.stringify(money.map(r => r.name)), W + '돈이 몰린 회사 줄 = 한 달 앞선 업종 셋의 대장', `${mo.map(r => r.name)} / ${money.map(r => r.name)}`);
  // ① 누르면 그것이 나옴 — 줄마다(390 에서만 모두 · 다른 폭은 첫 줄씩)
  const tap = width === 390 ? rows : [bl[0], mo[0]].filter(Boolean);
  for (const r of tap) {
    await open(p, '#/b'); await more(p);
    await p.click(`#su a.su-row[href="${r.href}"]`);
    await settle(p, r.name);
    const m1 = await measure(p);
    check(p.url().endsWith(r.href) && m1.h1 === r.name, W + '누르면 그 회사 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
    pageRules(m1, W + '회사 ' + r.name);
    await more(p); const kind = await p.evaluate(() => document.body.innerText); // 「왜 여기 있나」 글은 「자세히」 안
    if (near.some(x => x.name === r.name)) check(kind.includes('조건에 가장 가까운 회사예요') && kind.includes('맞은 조건') && kind.includes('안 맞은 조건'), W + '왜 여기 있나 — 가까운 회사 ' + r.name, '');
    if (picks.some(x => x.name === r.name)) check(kind.includes('꽃이 될 회사예요'), W + '왜 여기 있나 — 고른 회사 ' + r.name, '');
    if (money.some(x => x.name === r.name)) check(kind.includes('돈이 몰린 회사예요'), W + '왜 여기 있나 — 돈이 몰린 회사 ' + r.name, '');
    if (width === 390) { // 그림 글 = 회사 자료(co.line 마지막 · 기준 100)
      const code = r.href.slice(4), lw = await lineWant(code), co = await J('/atlas/data/co/' + code + '.json').catch(() => null), last = lw ? lw.last : co?.line?.length ? co.line[co.line.length - 1] / 100 - 100 : NaN; // 자료가 없으면 멈추지 않고 아래 맞댐이 실패로 적음 · 42칸 회사는 판 값(주문 0806)
      const wantPct = (Math.abs(last).toFixed(1) === '0.0' ? '0.0' : (last > 0 ? '+' : '−') + Math.abs(last).toFixed(1)) + '%';
      const got = await p.evaluate(() => document.querySelector('#su main > .su-hero .su-lg-c .v')?.textContent ?? document.querySelector('.su-lg-c b')?.textContent ?? ''); // 주문 1023 — 무하 아치 창 그림의 끝값 이름표
      check(got === wantPct, W + '그림 한 달 % = 회사 자료 — ' + r.name, `${got} / ${wantPct}`);
      check(await p.evaluate(() => document.querySelectorAll('svg.su-svg polyline').length >= 1), W + '한 달 그림 — ' + r.name, '');
    }
  }
  // 회사 → 업종 → 회사
  const first = (mo[0] ?? bl[0]);
  if (first) {
    await open(p, first.href); await more(p);
    const ind = await p.evaluate(() => ({href: document.querySelector('#su a.su-ind')?.getAttribute('href') ?? '', name: document.querySelector('#su a.su-ind span')?.textContent ?? ''}));
    check(/^#\/i\//.test(ind.href), W + '회사 쪽 업종 단추', ind.href);
    if (ind.href) {
      await p.click('#su a.su-ind'); await settle(p, ind.name);
      const m2 = await measure(p);
      check(m2.h1 === ind.name, W + '누르면 그 업종 — ' + ind.name, m2.h1);
      pageRules(m2, W + '업종 ' + ind.name);
      const c1 = await p.evaluate(() => { const a = document.querySelector('#su a.su-row'); return a ? {href: a.getAttribute('href'), name: a.querySelector('[data-proper]')?.textContent ?? ''} : null; });
      check(!!c1, W + '업종 쪽 회사 줄', '');
      if (c1) { await more(p); await p.click(`#su a.su-row[href="${c1.href}"]`); await settle(p, c1.name); const m3 = await measure(p); check(m3.h1 === c1.name, W + '업종 → 그 회사 — ' + c1.name, m3.h1); }
    }
  }
  if (width === 390) { // 「왜 사?」 답하기(주문 1506) — 열한 질문을 하나씩 답하면 결과 판정 · 매매일지에 같은 열쇠 · 같은 꼴로 한 줄 · 질문 쪽과 결과 쪽도 쪽 규칙 그대로
    const qc = (bl[0] ?? mo[0])?.href?.slice(4) ?? null;
    await open(p, qc ? '#/q/' + qc : '#/q');
    pageRules(await measure(p), W + '「왜 사?」 질문');
    let flow = true;
    for (let i = 0; i < 11 && flow; i++) {
      const b = await p.$('#su .su-a'); if (!b) { flow = false; break; }
      await b.click(); await p.waitForTimeout(120);
      const nx = await p.$('#su .su-qnext'); if (!nx) { flow = false; break; }
      await nx.click(); await p.waitForTimeout(150);
    }
    check(flow, W + '「왜 사?」 열한 질문을 끝까지 답함', '');
    await p.waitForTimeout(400);
    const res = await p.evaluate(() => ({h1: (document.querySelector('#su h1')?.innerText ?? '').trim(), rec: (() => { try { return JSON.parse(localStorage.getItem('atlas:godori-why') || '[]')[0] ?? null; } catch { return null; } })()}));
    check(['좋아, 정해 둔 대로만', '반만 준비됐어', '오늘은 쉬어 가자'].includes(res.h1), W + '「왜 사?」 결과 판정', res.h1);
    check(Array.isArray(res.rec?.answers) && res.rec.answers.length === 11 && res.rec.code === qc && typeof res.rec.verdict === 'string', W + '「왜 사?」 매매일지에 기록 한 줄(같은 열쇠 · 같은 꼴)', JSON.stringify(res.rec ?? null).slice(0, 160));
    pageRules(await measure(p), W + '「왜 사?」 결과');
    // 매매일지(주문 1519 · #/j) — 방금 남긴 기록이 새 판 매매일지에 보임 · 그림 넷 · 쪽 규칙
    await p.click('#su a[href="#/j"]').catch(() => {}); await settle(p, '내 매매일지');
    const jm = await measure(p);
    check(jm.h1 === '내 매매일지', W + '「왜 사?」 결과 → 매매일지', jm.h1);
    const jn = await p.evaluate(() => ({big: (document.querySelector('#su .su-big b')?.textContent ?? '').trim(), rows: document.querySelectorAll('#su .su-jr').length, figs: document.querySelectorAll('#su figure.su-fig').length}));
    check(+jn.big >= 1 && jn.rows >= 1 && jn.figs >= 3, W + '매매일지 — 멈춘 횟수 · 기록 줄 · 그림 셋 넘게', JSON.stringify(jn));
    pageRules(jm, W + '매매일지');
  }
  if (width === 390) { // ⑨ 주문 1616 — 일곱 번 · 탭 · 쪽 차례 · 그림 · 여섯 칸 · 기록 서랍
    const shape = () => p.evaluate(() => {
      const W = innerWidth, H = innerHeight, main = document.querySelector('#su main');
      const area = sel => { let a = 0; for (const e of document.querySelectorAll(sel)) { const q = e.getBoundingClientRect(); a += Math.max(0, Math.min(q.right, W) - Math.max(q.left, 0)) * Math.max(0, Math.min(q.bottom, H) - Math.max(q.top, 0)); } return a; };
      const dock = document.querySelector('#su .su-dock')?.getBoundingClientRect(), tabs = document.querySelector('#su .su-tabs')?.getBoundingClientRect();
      const top = document.querySelector('#su .su-top')?.getBoundingClientRect()?.bottom ?? 0, low = dock?.top ?? tabs?.top ?? H;
      const big = document.querySelector('#su .su-head .su-big')?.getBoundingClientRect(), heroE = document.querySelector('#su main > .su-hero'), hero = heroE?.getBoundingClientRect(), two = document.querySelector('#su main > .su-two')?.getBoundingClientRect();
      const moreE = document.querySelector('#su main > details.su-more'), more = moreE?.getBoundingClientRect(), midsIn = !document.querySelector('#su .su-mids') || !!document.querySelector('#su .su-mids')?.closest('details.su-more');
      // 주문 1023 [1] 1 — 그림 넓이: 큰 그림이 390 × 844 화면에서 실제로 보이는 넓이(머리 줄 아래 · 다음 단추와 탭 위로 자름)
      const vis = q => Math.max(0, Math.min(q.right, W) - Math.max(q.left, 0)) * Math.max(0, Math.min(q.bottom, low) - Math.max(q.top, top));
      const heroVis = hero ? vis(hero) : 0;
      // [1] 2 · 3 — 그림 밖 글: 보이는 글 줄마다 어느 칸인지(큰 값 · 설명 두 줄 · 서랍 이름 · 출처뿐이어야 함)
      const outside = []; { const tw = document.createTreeWalker(main ?? document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (!e || e.closest('[data-g], svg, [aria-hidden="true"]') || e.closest('details:not([open]) > :not(summary)')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const box = e.closest('.su-head, .su-two, summary.su-mores, .su-src, .su-act'); outside.push({box: box ? (box.classList.contains('su-head') ? 'head' : box.classList.contains('su-two') ? 'two' : box.classList.contains('su-src') ? 'src' : box.classList.contains('su-act') ? 'act' : 'more') : 'other', t: t.slice(0, 40)}); } } // act = 기능에 꼭 있는 누르는 곳(「왜 사?」 답 단추 · 한 달 전 약속 — [2] 3)
      const twoN = document.querySelectorAll('#su main > .su-two > p').length;
      // [1] 4 — 무하 요소(그림 안 data-mucha 이름 가짓수) · [1] 3 — 그림 안 이름표 수 · 움직이는 그림(돌고 있는 움직임 수)
      const mucha = heroE ? [...new Set([...heroE.querySelectorAll('[data-mucha]')].map(e => e.getAttribute('data-mucha')))] : [];
      const clean = !!heroE?.querySelector('svg[data-clean="jobs"]'); // 주문 1532 — 잡스 판 첫 페이지(su-apple)는 무하 꾸밈을 덜어냄
      const labels = heroE ? heroE.querySelectorAll('svg text').length : 0;
      const anim = heroE?.getAnimations ? heroE.getAnimations({subtree: true}).length : 0;
      const figs = [...document.querySelectorAll('#su main figure.su-fig')].filter(f => !f.closest('details'));
      const moving = anim > 0 ? 1 : 0; // 신문 짜임 — 보이는 그림은 큰 그림 하나(나머지 그림은 「자세히」 서랍 · 주문 1023 [2] 4)
      const six = document.querySelector('#su main > details.su-more > figure.su-six') ?? document.querySelector('#su main > figure.su-six'); // 큰 값의 여섯 칸 — 신문 짜임에서는 「자세히」 맨 앞
      const tiles = six ? [...six.querySelectorAll('li.su-st')].map(li => ({need: li.classList.contains('su-need'), v: li.querySelector('.su-sv')?.textContent ?? ''})) : [];
      const vals = [...document.querySelectorAll('#su .su-mid, #su .su-vr')], valsSix = vals.filter(v => v.querySelector('details.su-sixd li.su-st')).length;
      const last = main?.lastElementChild;
      // ⑩ 주문 1807 · 1833 — 숫자마다 「그래서」 · 전문가 서랍(눌러야 열림) · 어려운 낱말 셈 · 여섯 칸 지도 · 장식이 글을 가리지 않음
      const mv = [...document.querySelectorAll('#su main > .su-two, #su .su-mid, #su .su-vr')].filter(v => !v.matches('.su-two') || document.querySelector('#su .su-head .su-big')), mw = mv.filter(v => (v.querySelector('.su-mean span')?.textContent ?? '').trim().length > 0).length;
      const pro = document.querySelector('#su main details.su-pro');
      const tr = []; { const tw = document.createTreeWalker(main ?? document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.textContent.trim() || n.parentElement?.closest('details:not([open]) > :not(summary), svg, [aria-hidden="true"]')) continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.bottom > 0 && q.top < H && q.width > 0) tr.push(q); } }
      let orn = 0; for (const o of document.querySelectorAll('#su .su-orn')) { const q = o.getBoundingClientRect(); if (q.bottom <= 0 || q.top >= H) continue; for (const t of tr) orn += Math.max(0, Math.min(q.right, t.right) - Math.max(q.left, t.left)) * Math.max(0, Math.min(q.bottom, t.bottom) - Math.max(q.top, t.top)); }
      const ornN = document.querySelectorAll('#su .su-orn').length;
      return {means: {vals: mv.length, with: mw}, pro: {has: !!pro, open: !!pro?.open, rows: pro?.querySelectorAll('li').length ?? 0}, hard: Number(main?.dataset.hard ?? NaN), hardWords: main?.dataset.hardWords ?? '', glossed: (main?.dataset.glossed ?? '').split(',').filter(Boolean).length,
        smap: !!document.querySelector('#su main figure.su-smap'), orn: Math.round(orn), ornN,
        h1: (document.querySelector('#su h1')?.innerText ?? '').trim(), step: document.querySelector('#su .su-step')?.innerText.replace(/\s+/g, ' ').trim() ?? '', next: document.querySelector('#su .su-next')?.getAttribute('href') ?? null,
        share: Math.round(100 * area('#su main [data-g]') / (W * H)), shareIn: Math.round(100 * area('#su main [data-g]') / Math.max(1, W * (low - top))),
        order: !!(big && hero && two && more && big.bottom <= hero.top + 1 && hero.bottom <= two.top + 1 && two.bottom <= more.top + 1 && midsIn && !moreE.open), lastIsSrc: !!last?.classList?.contains('su-src') && /출처/.test(last.innerText) && /조사 날짜/.test(last.innerText),
        heroShare: Math.round(1000 * heroVis / (W * H)) / 10, outside, twoN, mucha, clean, labels, anim,
        figs: figs.length, moving, tiles, vals: vals.length, valsSix, tabs: [...document.querySelectorAll('#su .su-tabs a')].map(a => ({t: a.innerText.trim(), cur: a.getAttribute('aria-current') === 'page'}))};
    });
    await open(p, '#/');
    const seen = [];
    for (let k = 0; k <= 7; k++) {
      await p.waitForTimeout(150);
      const m = await shape(); seen.push(m);
      check(m.step.includes((k + 1) + ' / 8'), W + '⑨ 걸음 표시 ' + (k + 1) + ' / 8 — ' + m.h1, m.step);
      check(m.order, W + '⑨ 신문 짜임 — 큰 값 한 줄 → 큰 그림 → 설명 두 줄 → 「자세히」(닫힘 · 중간 값은 그 안) → 출처 — ' + m.h1, ''); // 주문 1023 [목표]
      check(m.heroShare >= 70, W + '⑪ 움직이는 그림이 화면의 70% 넘게(390 × 844 · 머리 줄 아래 · 다음 단추 위로 자름) — ' + m.h1, m.heroShare + '%'); // 주문 1023 [1] 1
      check(m.outside.every(o => o.box !== 'other') && m.twoN <= 2, W + '⑪ 그림 밖 글은 큰 값 · 설명 두 줄 · 출처뿐 — ' + m.h1, JSON.stringify(m.outside.filter(o => o.box === 'other')).slice(0, 200) + ' · 설명 ' + m.twoN + '줄'); // [1] 2
      check(m.labels >= 3, W + '⑪ 이름과 숫자는 그림 안 이름표 — ' + m.h1, '이름표 ' + m.labels); // [1] 3
      check(m.mucha.length >= 5 || m.clean, W + '⑪ 무하 요소 다섯 가지 넘게(잡스 판 첫 페이지는 덜어냄 — 주문 1532) — ' + m.h1, m.mucha.join(' ')); // [1] 4
      check(m.lastIsSrc, W + '⑨ 맨 아래 출처와 조사 날짜 — ' + m.h1, '');
      check(m.moving >= 1, W + '⑨ 큰 그림이 움직임 — ' + m.h1, '움직임 ' + m.anim);
      check(m.tiles.length === 6 && m.tiles.every(t => (t.need ? t.v === '확인 필요' : t.v && t.v !== '확인 필요')), W + '⑨ 큰 값의 여섯 칸(빈 칸 = 「확인 필요」) — ' + m.h1, JSON.stringify(m.tiles).slice(0, 160));
      check(m.vals === m.valsSix, W + '⑨ 중간 값 · 자세한 값마다 여섯 칸 — ' + m.h1, m.valsSix + ' / ' + m.vals);
      check(m.tabs.length === 4 && m.tabs.map(t => t.t).join(' ') === '21곳 지도 멈춤 기록' && m.tabs.filter(t => t.cur).length === 1, W + '⑨ 탭 넷 중요한 차례(주문 1023 [4]) · 켜진 탭 하나 — ' + m.h1, JSON.stringify(m.tabs));
      check(m.means.vals >= 1 && m.means.vals === m.means.with, W + '⑩ 숫자마다 「그래서」 한 줄 — ' + m.h1, m.means.with + ' / ' + m.means.vals);
      check(m.pro.has && !m.pro.open && m.pro.rows >= 3, W + '⑩ 전문가용 자세히 — 눌러야 열림 — ' + m.h1, JSON.stringify(m.pro));
      check(Number.isFinite(m.hard), W + '⑩ 어려운 낱말 셈 — ' + m.h1, String(m.hard) + ' ' + m.hardWords);
      check(m.smap, W + '⑩ 여섯 칸 지도 — ' + m.h1, '');
      check(m.orn === 0, W + '⑩ 장식이 글을 가리지 않음(겹친 넓이 0) — ' + m.h1, m.orn + ' · 장식 ' + m.ornN);
      pageRules(await measure(p), W + '⑨ ' + (k + 1) + '번째 화면 ' + m.h1);
      if (k < 7) { const a = await p.$('#su .su-next'); if (!a) { check(false, W + '⑨ 다음 단추 — ' + m.h1, ''); break; } await a.click(); await settle(p); await p.waitForTimeout(300); }
    }
    check(seen.length === 8 && new Set(seen.map(m => m.h1)).size === 8 && seen[7]?.h1 === '친구에게', W + '⑨ 다음 일곱 번에 끝(여덟 화면 · 끝 = 친구에게 — 주문 2044 21곳 → 땅 → 업종 → 회사 → 자세히 → 왜 사? → 매매일지 → 친구에게)', seen.map(m => m.h1).join(' → '));
    R.m.path = seen.map(m => ({h1: m.h1, heroShare: m.heroShare, share: m.share, outside: m.outside.length, two: m.twoN, labels: m.labels, mucha: m.mucha, anim: m.anim, need: m.tiles.filter(t => t.need).length, means: m.means.vals, hard: m.hard, hardWords: m.hardWords, glossed: m.glossed, orn: m.ornN})); // 주문 1023 보고 [7] 2 — 화면마다 합격선 숫자
    R.m.hard = seen.reduce((a, m) => a + (Number.isFinite(m.hard) ? m.hard : 0), 0); R.m.hardWords = [...new Set(seen.flatMap(m => m.hardWords.split(',').filter(Boolean)))];
    // 셋의 길 — 옛 기능 82가지 자리(주문 0054 [4] 1 ~ 8) · 모두(#/g)와 묶음 여덟 · 칸마다 수르 안 고리 · 쓰지 않을 말 0 · 넘침 0
    for (const hh of ['#/g', '#/g/hot', '#/g/bloom', '#/g/money', '#/g/stop', '#/g/guide', '#/g/guest', '#/g/back', '#/g/sky']) {
      await open(p, hh); await p.waitForTimeout(200);
      const n = await p.evaluate(() => document.querySelectorAll('#su .su-fcard').length);
      check(n >= 1, W + '⑨ 셋의 길 ' + hh + ' 칸', String(n));
      pageRules(await measure(p), W + '⑨ 셋의 길 ' + hh);
    }
    // 기록 서랍 여섯 · 서랍 쪽
    await open(p, '#/r');
    const dr = await p.evaluate(() => [...document.querySelectorAll('#su .su-drawer')].map(a => a.getAttribute('href')));
    check(JSON.stringify(dr) === JSON.stringify(['#/r/m', '#/j', '#/j', '#/r/w', '#/r/d', '#/r/k', '#/r/y', '#/r/n']), W + '⑨ 기록 서랍 — 토론 차례(달마다 · 한 달 뒤 · 내 매매일지 · 못 된 까닭 · 날마다 · 한국 시장 일곱 가지(기록창 · 주문 0814) · 옛 기록 더 보기 안 해마다 · 가까운 회사 — 주문 1023 [4])', dr.join(' '));
    R.m.drawers = {};
    for (const hh of ['#/r/d', '#/r/y', '#/r/n']) { await open(p, hh); await p.waitForTimeout(200); const m = await shape(); R.m.drawers[hh] = {h1: m.h1, share: m.share, moving: m.moving}; check(m.tiles.length === 6 && m.lastIsSrc, W + '⑨ 서랍 쪽 ' + hh + ' — ' + m.h1, JSON.stringify(m).slice(0, 160)); pageRules(await measure(p), W + '⑨ 서랍 쪽 ' + hh); }
  }
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' | '));
  // 없는 회사 · 업종 — 「?」 한 줄과 처음으로(빈 화면 아님 · 없는 회사 자료 404 는 일부러 — 오류 셈 뒤)
  await open(p, '#/c/ZZZZZZ'); check((await p.evaluate(() => document.body.innerText)).includes('찾지 못했어요'), W + '없는 회사', '');
  await open(p, '#/i/' + encodeURIComponent('없는 업종')); check((await p.evaluate(() => document.body.innerText)).includes('찾지 못했어요'), W + '없는 업종', '');
  await ctx.close();
}
{ // 느린 4G · CPU 4배 느리게(흰 첫 화면 검사 check_white ③ 과 같은 셈) — 첫 화면이 된 수르 두 길 처음 쪽 가장 큰 그림 2.5초 안
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8}); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  await p.addInitScript(() => { window.__v = {lcp: 0, cls: 0, pic: 0}; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true}); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({type: 'layout-shift', buffered: true});
    /* 무하 큰 그림(svg)이 칠해진 때 — 가장 큰 칠함(LCP)은 글 문단을 잴 때가 많아 그림을 따로 잼(주문 1023 [1] 6 「첫 그림이 느린 휴대폰에서 2.5초 안」) */
    const seen = () => { const f = document.querySelector('#su main > .su-hero'); const g = f && !f.hasAttribute('data-wait') && f.querySelector('svg'); if (!g) return false; requestAnimationFrame(() => requestAnimationFrame(() => { if (!window.__v.pic) window.__v.pic = performance.now(); })); return true; };
    new MutationObserver((_, o) => { if (seen()) o.disconnect(); }).observe(document, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-wait']}); });
  await p.goto(`${base}/su/?v=${Date.now()}#/`, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {}); await p.waitForTimeout(800);
  const v = await p.evaluate(() => window.__v); R.m.speed = {lcp: Math.round(v.lcp), cls: +v.cls.toFixed(3), pic: Math.round(v.pic)};
  check(v.lcp > 0 && v.lcp <= 2500, '느린 4G 가장 큰 그림 2.5초 안', `${Math.round(v.lcp)}ms`);
  console.log(`느린 4G 첫 화면 — 가장 큰 칠함 ${R.m.speed.lcp}ms · 무하 큰 그림 ${R.m.speed.pic}ms`);
  if (/^https:/.test(base)) check(v.pic > 0 && v.pic <= 2500, '느린 4G 무하 큰 그림 2.5초 안(진짜 사이트 · 넷리파이가 줄여 보냄 · 시험 서버는 안 줄여 재기만)', `${Math.round(v.pic)}ms`);
  await ctx.close();
}
{ // ⑫ 첫 페이지 위아래까지 흰 구슬 판(주문 1708 · 사장님 2026-11-08 17:08 「구슬으로 첫페이지 해서 다 변경해야 하잖아」 · 17:18 「맞아」) — 밝은 · 어두운 휴대폰 둘 다
  //   처음 쪽(#/) · 될 듯 21곳(#/n): 바탕 · 맨 위 단추 줄 · 이야기 막대 · 아래 단추 넷 = 흰색 · 큰 제목 대비 7 넘게 · 큰 그림 = 잡스 판 · 둘레 겹테 · 금빛 물결 줄 · 무하 꾸밈 · 뒷하늘 0 · 휴대폰 맨 위 띠 흰색
  //   다른 쪽(#/m 땅 지도)은 옛 꾸밈 그대로(옛 화면은 손대지 않음 — 규칙 75)
  const rgb = s => (/rgba?\(([^)]+)\)/.exec(s)?.[1] ?? '').split(',').map(x => parseFloat(x));
  const lum = s => { const c = rgb(s).slice(0, 3).map(v => v / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const con = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const WHITE = 'rgb(255, 255, 255)';
  const look = p => p.evaluate(() => {
    const bg = e => (e ? getComputedStyle(e).backgroundColor : 'none');
    const shown = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const top = document.querySelector('#su .su-top'), tabs = document.querySelector('#su .su-tabs'), h1 = document.querySelector('#su h1');
    return {clean: !!document.querySelector('#su main > .su-hero svg[data-clean="jobs"]'), body: bg(document.body), top: bg(top), dock: bg(document.querySelector('#su .su-dock')), tabs: bg(tabs),
      h1: h1 ? getComputedStyle(h1).color : '', frame: getComputedStyle(document.getElementById('su'), '::before').content, wave: top ? getComputedStyle(top, '::after').content : '', curve: tabs ? getComputedStyle(tabs, '::before').content : '',
      orn: [...document.querySelectorAll('#su .su-orn, .su-corners, .su-sky')].filter(shown).length, sky: !!document.querySelector('.su-sky'),
      tc: [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.getAttribute('content'))};
  });
  R.m.white = {};
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', colorScheme: scheme});
    const p = await ctx.newPage();
    for (const hh of ['#/', '#/n']) {
      await open(p, hh); await p.waitForTimeout(2200); // 뒷하늘(창이 열리고 1.5초 뒤 붙음)까지 붙은 뒤에 잼
      const w = await look(p); R.m.white[scheme + ' ' + hh] = w;
      const W1 = '⑫ 흰 구슬 판(' + (scheme === 'dark' ? '어두운' : '밝은') + ' 휴대폰 · ' + hh + ') ';
      check(w.clean && [w.body, w.top, w.dock, w.tabs].every(c => c === WHITE), W1 + '— 큰 그림 잡스 판 · 바탕 · 맨 위 단추 줄 · 이야기 막대 · 아래 단추 넷 흰색', JSON.stringify(w).slice(0, 300));
      check(con(w.h1, WHITE) >= 7, W1 + '— 큰 제목 글 대비 7 넘게', w.h1);
      check(w.frame === 'none' && w.wave === 'none' && w.curve === 'none' && w.orn === 0, W1 + '— 둘레 겹테 · 금빛 물결 줄 · 무하 꾸밈 · 뒷하늘 0', JSON.stringify({frame: w.frame, wave: w.wave, curve: w.curve, orn: w.orn}));
      check(w.tc.length >= 1 && w.tc.every(c => c === '#FFFFFF'), W1 + '— 휴대폰 맨 위 띠 흰색', w.tc.join(' '));
    }
    // 주문 2011(사장님 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」) — 다른 쪽도 같은 흰 판(1708 에는 「옛 꾸밈 그대로」를 쟀음)
    for (const hh of ['#/m', '#/r', '#/r/d', '#/g']) {
      await open(p, hh); await p.waitForTimeout(400);
      const o = await look(p); R.m.white[scheme + ' ' + hh] = o;
      check([o.body, o.top, o.dock, o.tabs].every(c => c === WHITE || c === 'none') && o.top === WHITE && o.frame === 'none' && o.wave === 'none' && o.curve === 'none' && o.orn === 0 && o.tc.every(c => c === '#FFFFFF') && con(o.h1, WHITE) >= 7,
        '⑫ 다른 쪽도 흰 판(' + scheme + ' · ' + hh + ') — 바탕 · 위아래 흰색 · 둘레 겹테 · 물결 줄 · 무하 꾸밈 0 · 큰 제목 대비 7', JSON.stringify({body: o.body, top: o.top, dock: o.dock, tabs: o.tabs, frame: o.frame, orn: o.orn, tc: o.tc}));
    }
    await ctx.close();
  }
}
{ // ⑬ 새 판이 올라가면 스스로 새로 고침(주문 1708 · 사장님 2026-11-08 17:08 「왜? 이 디자인이 남아 있어!」) — 판 표(/su/version.json)가 같으면 그대로 · 바뀐 뒤 화면이 다시 보이면 한 번 새로 고침 · 표를 못 받으면 그대로
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage(); let ver = 'A', gone = false, loads = 0;
  await p.route('**/su/version.json*', r => (gone ? r.fulfill({status: 404, contentType: 'text/plain', body: ''}) : r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({v: ver})})));
  p.on('load', () => { loads++; });
  await open(p, '#/'); await p.waitForTimeout(800);
  const show = async () => { await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))).catch(() => {}); await p.waitForTimeout(1800); };
  await show(); const same = loads;
  ver = 'B'; await show(); await p.waitForLoadState('load').catch(() => {}); await p.waitForTimeout(800); const after = loads;
  gone = true; await show(); const lost = loads;
  const at = await p.evaluate(() => location.hash);
  R.m.fresh = {same, after, lost, at};
  check(same === 1 && after === 2 && lost === 2 && at === '#/', '⑬ 새 판이면 스스로 새로 고침 — 같은 판 그대로 · 바뀐 판 한 번 · 표를 못 받으면 그대로 · 보던 쪽 그대로', JSON.stringify(R.m.fresh));
  await ctx.close();
}
{ // ⑭ 첫 페이지 종목마다 현재가 · 한 달 꺾은선(주문 1837 · 사장님 2026-11-08 18:37 「첫패이지에 나온 종목들에 현재가와 꺽기 그래프 한달 올려」) — 처음 쪽 · 될 듯 21곳
  //   칸마다 현재가 = su21.json 그 회사 close(그날 = asOf.board) · 「N원」 글 · 꺾은선 21점 = 그 회사 c 21개 그대로(오르내림 차례가 값과 같음) · 한 달 전 옅은 줄 = 첫 값 높이 · 마지막 점 = 끝 값 · 날짜 글
  const T21 = await J('/su/data/su21.json'), N21 = await J('/su/data/su21-next.json'), day = T21?.asOf?.board ?? ''; // 될 듯 셋의 현재가 · 21 마지막 값 = su21-next.json
  const md = /^\d{4}-(\d{2})-(\d{2})$/.exec(day), mtxt = md ? '현재가는 ' + +md[1] + '월 ' + +md[2] + '일 마지막 값이에요.' : '현재가는 마지막 값이에요.';
  const NFk = new Intl.NumberFormat('ko-KR');
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage();
  R.m.price = {};
  for (const [hh, KM] of [['#/', {hot: 'hot', bloom: 'bloom', money: 'money', hotNext: 'hotNext', bloomNext: 'bloomNext', moneyNext: 'moneyNext'}], ['#/n', {hotNow: 'hot', bloomNow: 'bloom', moneyNow: 'money', hot: 'hotNext', bloom: 'bloomNext', money: 'moneyNext'}]]) {
    await open(p, hh);
    const got = await p.evaluate(() => ({note: (() => { const L = new Map(); for (const e of document.querySelectorAll('#su main > .su-hero text.sa-note')) { const y = e.getAttribute('y'); L.set(y, (L.has(y) ? L.get(y) + ' ' : '') + e.textContent); } return [...L.values()]; })(), // 한 줄 = 같은 높이 두 조각
      cells: [...document.querySelectorAll('#su main > .su-hero a[data-k]')].map(a => {
        const dot = a.querySelector('circle.sa-spA, circle.sa-spB');
        return {k: a.getAttribute('data-k'), name: a.getAttribute('data-name'), px: a.getAttribute('data-px'), live: a.getAttribute('data-live'), t: [...a.querySelectorAll('text')].map(e => e.textContent), label: a.getAttribute('aria-label') ?? '',
          line: a.querySelector('path.sa-sp')?.getAttribute('d') ?? '', base: a.querySelector('path.sa-sp0')?.getAttribute('d') ?? '', dot: dot ? [+dot.getAttribute('cx'), +dot.getAttribute('cy')] : null, ring: !!a.querySelector('circle.sa-spB')};
      })}));
    const bad = [];
    for (const c of got.cells) {
      const key = KM[c.k], it = ((key.endsWith('Next') ? N21 : T21).lists?.[key] ?? []).find(x => x.name === c.name);
      if (!it) { bad.push(c.name + ' 목록에 없음'); continue; }
      const ok = typeof it.close === 'number' && it.close > 0 && (!it.date || it.date === day), price = ok ? NFk.format(it.close) + '원' : null;
      if (!ok) { if (!c.t.includes('확인 필요') || c.line) bad.push(c.name + ' 값 없음인데 「확인 필요」 아님'); continue; }
      if (c.live) { // 장 중 현재가(주문 2011)가 붙은 칸 — 받은 값(data-px)이 글 · 이름표 · 꺾은선 끝과 같은지(판 값과는 다를 수 있음)
        const lp = NFk.format(+c.px) + '원', pts = [...c.line.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)];
        if (!(+c.px > 0) || !c.t.includes(lp) || !c.label.includes('현재가 ' + lp) || pts.length !== 21 || !c.dot) bad.push(c.name + ' 장 중 값 ' + c.px);
        continue;
      }
      if (c.px !== String(it.close) || !c.t.includes(price) || !c.label.includes('현재가 ' + price)) { bad.push(c.name + ' 현재가 ' + c.px + ' ≠ ' + it.close); continue; }
      const pts = [...c.line.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], +m[2]]), v = it.c;
      if (!Array.isArray(v) || v.length !== 21 || pts.length !== 21) { bad.push(c.name + ' 꺾은선 점 ' + pts.length); continue; }
      if (v[20] !== it.close) { bad.push(c.name + ' 끝 값 ≠ 현재가'); continue; }
      const lo = Math.min(...v), hi = Math.max(...v), yT = Math.min(...pts.map(q => q[1])), yB = Math.max(...pts.map(q => q[1]));
      const sameWay = hi === lo ? yB - yT < 0.15 : pts.every((q, i) => Math.abs(q[1] - (yT + ((hi - v[i]) / (hi - lo)) * (yB - yT))) <= 0.15); // 점마다 높이 = 그 값(가장 높은 값 = 위 · 가장 낮은 값 = 아래)
      const xs = pts.every((q, i) => !i || q[0] > pts[i - 1][0]);
      const by = +(/M[\d.]+ ([\d.]+)H/.exec(c.base)?.[1] ?? NaN);
      if (!sameWay || !xs) { bad.push(c.name + ' 꺾은선 오르내림이 값과 다름'); continue; }
      if (!(Math.abs(by - pts[0][1]) < 0.15)) { bad.push(c.name + ' 한 달 전 줄 높이 ' + by + ' ≠ ' + pts[0][1]); continue; }
      if (!c.dot || Math.abs(c.dot[0] - pts[20][0]) > 0.15 || Math.abs(c.dot[1] - pts[20][1]) > 0.15 || c.ring !== key.endsWith('Next')) { bad.push(c.name + ' 마지막 점'); continue; }
    }
    R.m.price[hh] = {cells: got.cells.length, bad: bad.length, note: got.note};
    check(got.cells.length === 42 && !bad.length, '⑭ ' + hh + ' 종목마다 현재가 = 자료 · 한 달 꺾은선 21점 = 자료 그대로 · 한 달 전 줄 · 마지막 점(지금 찬 점 · 될 듯 고리)', got.cells.length + ' · ' + bad.slice(0, 4).join(' | '));
    const liveN = /^현재가는 \d+월 \d+일 (오전|오후) \d+시( \d+분)? 값이에요\.$|^현재가는 \d+월 \d+일 마지막 값이에요\.$/; // 장 중 · 장 끝 값이 붙으면 그 때(주문 2011)
    check((got.note[0] === mtxt || (got.cells.some(c => c.live) && liveN.test(got.note[0] ?? ''))) && /꺾은선은 한 달/.test(got.note[1] ?? ''), '⑭ ' + hh + ' 현재가 날짜 글 — ' + mtxt, got.note.join(' / '));
  }
  await ctx.close();
}
{ // ⑮ 장 중 현재가(주문 2011 · 사장님 2026-11-08 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 현재가가 바뀌게) — /api/price 답을 시험 값으로 바꿔 끼워 화면이 따라 바뀌는지
  //   오늘(판 다음 날) 장 중 값 → 그 칸 현재가 글 · data-px · data-live · 이름표 · 꺾은선(맨 앞 하루를 빼고 오늘 값을 끝에 = 21점 · 끝 점 = 받은 값 높이) · 날짜 글 「○월 ○일 오후 2시 31분 값이에요.」
  //   받은 값이 없는 칸은 그대로 · 함수가 없거나(404) 장 밖이면 아무것도 바꾸지 않음
  const T21 = await J('/su/data/su21.json'), day = T21?.asOf?.board ?? '2026-11-06', h = T21?.lists?.hot?.[0];
  const next = (() => { const d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 3); return d.toISOString().slice(0, 10); })();
  const P = h?.close ? Math.round(h.close * 1.031) : 0, NFk = new Intl.NumberFormat('ko-KR');
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage(); let mode = 'open', asked = 0;
  await p.route('**/api/price*', r => { asked++; if (mode === '404') return r.fulfill({status: 404, contentType: 'text/plain', body: ''});
    return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({schema: 'su-price-1', day: next, hhmm: '1431', status: mode, items: mode === 'shut' ? {} : {[h.code]: {p: P, t: next + 'T14:31'}}})}); });
  const cellOf = () => p.evaluate(code => { const a = document.querySelector(`#su main > .su-hero a.sa-cell[data-code="${code}"]`); if (!a) return null;
    const pts = [...(a.querySelector('path.sa-sp')?.getAttribute('d') ?? '').matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
    const notes = new Map(); for (const e of document.querySelectorAll('#su main > .su-hero text.sa-note')) { const y = e.getAttribute('y'); notes.set(y, (notes.has(y) ? notes.get(y) + ' ' : '') + e.textContent); }
    const other = document.querySelector(`#su main > .su-hero a.sa-cell:not([data-code="${code}"])`);
    return {px: a.getAttribute('data-px'), live: a.getAttribute('data-live'), t: [...a.querySelectorAll('text')].map(e => e.textContent), label: a.getAttribute('aria-label'), pts, dot: !!a.querySelector('circle.sa-spA, circle.sa-spB'),
      note: [...notes.values()][0] ?? '', otherLive: other?.getAttribute('data-live') ?? null};
  }, h?.code ?? '');
  if (h && P) {
    await open(p, '#/'); await p.waitForTimeout(1200);
    const c = await cellOf(), v = h.c, sp = [...v.slice(1), P], lo = Math.min(...sp), hi = Math.max(...sp);
    const yT = c ? Math.min(...c.pts.map(q => q[1])) : 0, yB = c ? Math.max(...c.pts.map(q => q[1])) : 0;
    const shape = !!c && c.pts.length === 21 && c.pts.every((q, i) => Math.abs(q[1] - (yT + ((hi - sp[i]) / (hi - lo || 1)) * (yB - yT))) <= 0.15);
    R.m.live = {asked, px: c?.px, live: c?.live, note: c?.note, shape};
    check(asked >= 1 && c && c.px === String(P) && c.live === next + 'T14:31' && c.t.includes(NFk.format(P) + '원') && /현재가 /.test(c.label) && c.label.includes(NFk.format(P) + '원') && shape && c.dot && c.otherLive === null,
      '⑮ 장 중 현재가 — 받은 칸만 바뀜(글 · data-px · 이름표 · 꺾은선 맨 앞 하루 빼고 오늘 값 끝) · 받은 값이 없는 칸은 그대로', JSON.stringify(R.m.live));
    const md = /^\d{4}-(\d{2})-(\d{2})$/.exec(next);
    check(c?.note === '현재가는 ' + +md[1] + '월 ' + +md[2] + '일 오후 2시 31분 값이에요.', '⑮ 날짜 글 — 장 중 그 때', c?.note ?? '');
    mode = 'shut'; await open(p, '#/'); await p.waitForTimeout(1200);
    const s0 = await cellOf();
    check(s0 && s0.px === String(h.close) && s0.live === null, '⑮ 장 밖(값 없음)이면 판 값 그대로', JSON.stringify({px: s0?.px, live: s0?.live}));
    mode = '404'; await open(p, '#/'); await p.waitForTimeout(1200);
    const s4 = await cellOf();
    check(s4 && s4.px === String(h.close) && s4.live === null, '⑮ 함수가 없으면(404) 판 값 그대로', JSON.stringify({px: s4?.px, live: s4?.live}));
  } else check(false, '⑮ 장 중 현재가 — 불장 첫 회사 자료', JSON.stringify(h ?? null).slice(0, 120));
  await ctx.close();
}
{ // ⑯ 수르에서 넘어간 옛 쪽도 첫 페이지 판(주문 2011 · 사장님 2026-11-08 20:26 「아니 이것도 같이 작업해」 — 서른아홉 스승 · 로마 신처럼 수르에서 눌러 넘어간 옛 쪽)
  //   ?su=<묶음> 으로 연 옛 쪽: 밤 무대 판(clock) 뗌 · 바탕 · 위 막대 · 아래 수르 막대 흰색 · 금빛 테두리 0 · 맨 위 띠 흰색 · 화면을 크게 덮는 어두운 판 0 · 읽기 어려운 글(대비 3 아래) 0 — 밝은 · 어두운 휴대폰 둘 다
  //   옛 주소로 바로 온 손님도 같은 흰 판(주문 2250 · 22:50 「이것도 구슬로 해」) — 수르 막대만 없음 · 서른아홉 스승 · 로마 신은 읽는 종이 바탕 #FDF9F5(그 쪽 검사 「밝은 종이 바탕」)
  const ROUTES = ['/next/?su=hot#/surge', '/next/?su=stop#/sage', '/next/?su=guide#/roman', '/next/?su=stop#/why', '/next/?su=guide#/', '/next/?su=back#/jinhwa', '/hello.html?su=guest', '/letter.html?su=guest', '/invite.html?su=guest', '/su/privacy.html'];
  const WHITE = 'rgb(255, 255, 255)';
  const lookOld = p => p.evaluate(() => {
    const cs = e => getComputedStyle(e), de = document.documentElement, vw = innerWidth, vh = innerHeight;
    const L = c => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const v = m[1].split(',').map(x => parseFloat(x)); if (v.length > 3 && v[3] < 0.5) return null; const q = v.slice(0, 3).map(x => x / 255).map(x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * q[0] + 0.7152 * q[1] + 0.0722 * q[2]; };
    const shown = e => { const s = cs(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.1) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; };
    const media = e => e.matches('video, canvas, img, picture, iframe') || !!e.querySelector('video, canvas, iframe');
    let darkMax = 0, darkSel = '';
    for (const e of document.querySelectorAll('body *')) {
      if (!shown(e) || media(e) || e.closest('svg')) continue;
      const l = L(cs(e).backgroundColor); if (l == null || l > 0.12) continue;
      const r = e.getBoundingClientRect(), a = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / (vw * vh);
      if (a > darkMax) { darkMax = a; darkSel = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].join('.') : ''); }
    }
    const bgOf = e => { for (let x = e; x; x = x.parentElement) { const s = cs(x); if (s.backgroundImage !== 'none' && !/gradient/.test(s.backgroundImage)) return null; const l = L(s.backgroundColor); if (l != null) return l; } return 1; };
    const low = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!shown(e) || e.closest('svg') || e.closest('.suw-bar')) continue;
      const t = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(''); if (!t) continue;
      const fg = L(cs(e).color), bg = bgOf(e); if (fg == null || bg == null) continue;
      const c = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05); if (c < 3) low.push(t.slice(0, 16) + ' ' + c.toFixed(1));
    }
    const top = document.querySelector('header.top, header.band'), view = document.getElementById('view'), bar = document.querySelector('.suw-bar');
    return {cls: de.className, body: cs(document.body).backgroundColor, view: view ? cs(view).backgroundColor : null, top: top ? cs(top).backgroundColor : null, bar: bar ? cs(bar).backgroundColor : null,
      frame: cs(de, '::after').content, tc: [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.getAttribute('content')), darkMax: +darkMax.toFixed(3), darkSel, low: low.slice(0, 6), lowN: low.length};
  });
  const okBg = c => c == null || c === WHITE || c === 'rgba(0, 0, 0, 0)';
  R.m.old = {};
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', colorScheme: scheme});
    const p = await ctx.newPage();
    for (const u of ROUTES) {
      await p.goto(base + u, {waitUntil: 'load', timeout: 45000}).catch(() => {});
      await p.waitForFunction(() => document.documentElement.classList.contains('su-jobs'), null, {timeout: 12000}).catch(() => {});
      await p.waitForTimeout(1500);
      const o = await lookOld(p); R.m.old[scheme + ' ' + u] = o;
      const cl = o.cls.split(/\s+/);
      check(cl.includes('su-wrapped') && cl.includes('su-jobs') && !cl.includes('clock') && o.body === WHITE && (okBg(o.view) || (/pg-(sage|roman)/.test(o.cls) && o.view === 'rgb(253, 249, 245)')) && okBg(o.top) && o.bar === WHITE && (o.frame === 'none' || o.frame === 'normal') && o.tc.every(c => c === '#FFFFFF') && o.darkMax <= 0.12 && o.lowN === 0,
        '⑯ 수르에서 넘어간 옛 쪽도 첫 페이지 판(' + scheme + ' · ' + u + ') — 밤 판 뗌 · 바탕 · 위 · 아래 막대 흰색 · 금빛 테두리 0 · 어두운 판 0 · 흐린 글 0', JSON.stringify(o).slice(0, 400));
    }
    await ctx.close();
  }
  // 옛 주소로 바로 온 손님도 첫 페이지 판(주문 2250 · 사장님 2026-11-08 22:50 「이것도 구슬로 해」) — 밤 판 0 · 흰 바탕 · 위 막대 · 옛 아래 단추 흰색 · 수르 틀(아래 수르 막대)은 없음 · 어두운 판 0 · 흐린 글 0
  const DIRECT = ['/next/#/surge', '/next/#/sage', '/next/#/roman', '/next/#/why', '/next/#/', '/next/#/jinhwa', '/hello.html', '/letter.html', '/invite.html', '/privacy.html'];
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', colorScheme: scheme});
    const p = await ctx.newPage();
    for (const u of DIRECT) {
      await p.goto(base + u, {waitUntil: 'load', timeout: 45000}).catch(() => {});
      await p.waitForFunction(() => document.documentElement.classList.contains('su-jobs'), null, {timeout: 12000}).catch(() => {});
      await p.waitForTimeout(1500);
      const o = await lookOld(p), tabs = await p.evaluate(() => { const t = document.querySelector('nav.tabs, .tabs'); return t && getComputedStyle(t).display !== 'none' ? getComputedStyle(t).backgroundColor : null; });
      R.m.old['direct ' + scheme + ' ' + u] = {...o, tabs};
      const cl = o.cls.split(/\s+/), paper = /pg-(sage|roman)/.test(o.cls);
      check(cl.includes('su-jobs') && !cl.includes('su-wrapped') && !cl.includes('clock') && o.body === WHITE && (okBg(o.view) || (paper && o.view === 'rgb(253, 249, 245)')) && okBg(o.top) && o.bar === null && (tabs === null || tabs === WHITE) && (o.frame === 'none' || o.frame === 'normal') && o.tc.every(c => c === '#FFFFFF') && o.darkMax <= 0.12 && o.lowN === 0,
        '⑯ 옛 주소로 바로 온 손님도 첫 페이지 판(' + scheme + ' · ' + u + ') — 밤 판 0 · 바탕 · 위 막대 · 옛 아래 단추 흰색 · 수르 막대 없음 · 어두운 판 0 · 흐린 글 0', JSON.stringify({...o, tabs}).slice(0, 400));
    }
    await ctx.close();
  }
}
{ // ⑰ 「왜?」 쪽 · 42칸 첫 발견 · 며칠째 · 포모지수(주문 0123 · 사장님 2026-11-09 01:23 「36가지로 중요순으로 기승전결로 … 선정한 기준 7가지」 · 01:44 「몇일째 … 첫 발견 … 42곳 모두」
  //   · 02:01 「포모지수값을 첫페이지 42곳에 모두 … 그이유도 11가지」 · 02:02 「몬트리올(몬테카를로) … 소거법 … 기준 … 이유 7가지」) · 회사 쪽 현재가 = 첫 페이지 값(주문 0200 · 02:00 「어」)
  const [T21, N21, WHY] = await Promise.all([J('/su/data/su21.json'), J('/su/data/su21-next.json'), J('/su/data/su21-why.json').catch(() => null)]);
  const KEY6 = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'], board = T21.asOf?.board;
  const item = (k, code) => (k.endsWith('Next') ? N21.lists?.[k] : T21.lists?.[k])?.find(c => c.code === code);
  const all = KEY6.flatMap(k => (T21.lists?.[k] ?? []).map(c => ({k, ...(item(k, c.code) ?? c)})));
  const DAYRE = /^\d{4}-\d{2}-\d{2}$/, md = d => { const q = /^\d{4}-(\d{2})-(\d{2})$/.exec(d ?? ''); return q ? +q[1] + '월 ' + +q[2] + '일' : null; };
  check(all.length === 42 && all.every(c => Number.isInteger(c.days) && c.days >= 1 && DAYRE.test(c.found ?? '') && c.found <= board && typeof c.since === 'boolean'), '⑰ 42칸 모두 며칠째 · 첫 발견(자료)', JSON.stringify(all.filter(c => !(Number.isInteger(c.days) && DAYRE.test(c.found ?? ''))).map(c => c.k + ' ' + c.name)).slice(0, 200));
  check(T21.days && DAYRE.test(T21.days.from ?? '') && T21.days.to === board, '⑰ 며칠째 셈 바탕(기록 첫날 · 오늘 판)', JSON.stringify(T21.days ?? null).slice(0, 160));
  check(!!WHY && WHY.board === board && WHY.mc?.paths >= 20000 && Array.isArray(WHY.checks) && WHY.checks.length === 7, '⑰ 포모 자료 = 오늘 판 · 몬테카를로 길 2만 개 넘게 · 소거 기준 일곱', WHY ? `${WHY.board} · ${WHY.mc?.paths} · ${WHY.checks?.length}` : '없음');
  const codes = [...new Set(all.map(c => c.code))], F = WHY?.fomo ?? {};
  check(codes.every(c => F[c] && Array.isArray(F[c].checks) && F[c].checks.length === 7 && (F[c].verdict === 'pass' ? Number.isInteger(F[c].v) && F[c].v >= 0 && F[c].v <= 100 && F[c].se <= 0.5 && F[c].paths >= 20000 && F[c].f?.length === 6 : F[c].v === null)), '⑰ 회사마다 포모 — 기준 일곱 · 통과면 0 ~ 100 · 흔들림 0.5 안 · 잣대 여섯', JSON.stringify(codes.filter(c => !F[c]).slice(0, 5)));
  check(all.every(c => (F[c.code]?.verdict === 'pass' ? c.fomo === F[c.code].v : c.fomo === null) && c.fv === (F[c.code]?.verdict ?? 'hold')), '⑰ 42칸 포모지수 = 포모 자료', '');
  const passN = codes.filter(c => F[c]?.verdict === 'pass').length;
  if (/^https:/.test(base)) { // 진짜 사이트 — 올릴 때 굴린 종가로 셈(미리 보기 묶음은 종가를 굴리지 않아 옛 자료 · 그때는 묶음 꼴만 봄)
    check(T21.days?.from < board && all.some(c => c.days > 1), '⑰ 진짜 사이트 — 지난 판 기록으로 센 며칠째(기록 첫날 < 오늘 판 · 2일째 넘는 칸 있음)', JSON.stringify(T21.days ?? null).slice(0, 120));
    check(WHY?.data === board && passN >= Math.ceil(codes.length * 0.8), '⑰ 진짜 사이트 — 포모 자료 날 = 오늘 판 · 열에 여덟 넘게 통과', `${WHY?.data} · ${passN}/${codes.length}`);
  }
  R.m.why = {board, cells: all.length, codes: codes.length, fomoPass: passN, days: Object.fromEntries(all.map(c => [c.k + ' ' + c.code, [c.days, c.found, c.fomo]])), daysFrom: T21.days?.from ?? null};
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  await QUIET(ctx); // 판 값과 맞대는 검사(장 중에도 같은 답 · 장 중 값은 ⑱)
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  await open(p, '#/');
  const cells = await p.evaluate(() => [...document.querySelectorAll('#su main > .su-hero a.sa-cell')].map(a => ({k: a.getAttribute('data-k'), code: a.getAttribute('data-code'), href: a.getAttribute('href'), days: a.getAttribute('data-days'), found: a.getAttribute('data-found'), fomo: a.getAttribute('data-fomo'),
    sp: a.querySelector('path.sa-sp')?.getAttribute('d') ?? '', t1: a.querySelector('text.sa-found')?.textContent ?? '', t2: a.querySelector('text.sa-days')?.textContent ?? '', fs: [...a.querySelectorAll('text.sa-found, text.sa-days')].map(t => parseFloat(getComputedStyle(t).fontSize))})));
  check(cells.length === 42, '⑰ 첫 페이지 칸 42', String(cells.length));
  const badCell = cells.filter(x => { const c = all.find(y => y.k === x.k && y.code === x.code); return !c || x.href !== `#/c/${c.code}/y/${c.k}` || x.t1 !== '첫 발견 ' + md(c.found) || !x.t2.startsWith(c.days + '일째 · ') || !(c.fomo === null ? /포모(지수)? 보류$/.test(x.t2) : new RegExp('포모(지수)? ' + c.fomo + '$').test(x.t2)) || x.fs.some(f => f < 16.95); });
  check(!badCell.length, '⑰ 42칸 모두 「첫 발견 ○월 ○일」 · 「○일째 · 포모지수 ○」 = 자료 · 누르면 「왜?」 쪽 · 글 17px 넘게', JSON.stringify(badCell.slice(0, 3)).slice(0, 300));
  let pages = 0, reasons = 0;
  for (const c of all) {
    await open(p, `#/c/${c.code}/y/${c.k}`);
    const w = await p.evaluate(() => {
      const parts = [...document.querySelectorAll('#su .yw-part')].map(s => ({h: s.querySelector('.yw-h')?.textContent ?? '', n: [...s.querySelectorAll('.yw-li')].map(li => +li.querySelector('.yw-n')?.textContent)}));
      const chips = [...document.querySelectorAll('#su .yw-chip b')].map(b => b.textContent);
      const sents = [...document.querySelectorAll('#su .yw-hero, #su .yw .yw-s, #su .yw .yw-t')].map(e => e.textContent);
      return {h1: document.querySelector('#su h1')?.innerText ?? '', parts, chips, crit: document.querySelectorAll('#su .yw-crit .yw-li').length, fchk: document.querySelectorAll('#su .yw-fomo > ol:first-of-type .yw-li').length,
        f11: document.querySelectorAll('#su .yw-fomo > ol:nth-of-type(2) .yw-li').length, pct: sents.filter(t => t.includes('%')).length, price: [...document.querySelectorAll('#su .yw .yw-s')].map(e => e.textContent).find(t => /마지막 값은 [\d,]+원이에요/.test(t)) ?? null};
    });
    const m = await measure(p); pageRules(m, '⑰ 「왜?」 ' + c.k + ' ' + c.name);
    const nums = w.parts.flatMap(x => x.n), okNums = nums.length === 36 && nums.every((v, i) => v === i + 1) && w.parts.length === 4 && w.parts.every(x => x.n.length === 9) && ['기', '승', '전', '결'].every((g, i) => w.parts[i]?.h.startsWith(g + ' — '));
    const fo = F[c.code], wantChips = [md(c.found), c.days + '일째', c.fomo === null ? '보류' : String(c.fomo)];
    check(w.h1.startsWith(c.name + ', 왜 ') && w.h1.endsWith('?'), '⑰ 「왜?」 물음 — ' + c.k + ' ' + c.name, w.h1);
    check(okNums, '⑰ 서른여섯 가지 · 중요한 차례 1 ~ 36 · 기 · 승 · 전 · 결 아홉씩 — ' + c.k + ' ' + c.name, JSON.stringify(w.parts.map(x => x.n.length)));
    check(w.crit === 7, '⑰ 이렇게 고른 기준 일곱 — ' + c.k + ' ' + c.name, String(w.crit));
    check(JSON.stringify(w.chips) === JSON.stringify(wantChips), '⑰ 첫 발견 · 며칠째 · 포모지수 = 자료 — ' + c.k + ' ' + c.name, JSON.stringify(w.chips) + ' / ' + JSON.stringify(wantChips));
    check(w.fchk === 7 && (fo?.verdict === 'pass' ? w.f11 === 11 : w.f11 === 0), '⑰ 포모 소거 기준 일곱 · 통과면 까닭 열하나 — ' + c.k + ' ' + c.name, w.fchk + ' · ' + w.f11);
    check(w.pct === 0, '⑰ 풀이 문장에 「%」 없음 — ' + c.k + ' ' + c.name, String(w.pct));
    check(!w.price || !Number.isFinite(c.close) || w.price.includes(Number(c.close).toLocaleString('ko-KR') + '원'), '⑰ 마지막 값 = 첫 페이지 값 — ' + c.k + ' ' + c.name, w.price ?? '없음');
    pages++; reasons += nums.length;
  }
  R.m.why.pages = pages; R.m.why.reasons = reasons;
  check(!errs.length, '⑰ 「왜?」 쪽 화면 오류 0', errs.slice(0, 3).join(' / '));
  // 주문 0200 — 회사 쪽 현재가 = 첫 페이지 칸 값(그날 판) · 묶음마다 첫 회사
  for (const k of KEY6) {
    const c = all.find(x => x.k === k); if (!c) continue;
    await open(p, `#/c/${c.code}`); await p.waitForTimeout(600);
    const px = await p.evaluate(() => { const s = document.querySelector('#su svg.su-co-jobs'); return s ? {px: s.getAttribute('data-px'), d: s.getAttribute('data-pdate'), src: s.getAttribute('data-psrc'), n: s.querySelector('text.cj-px tspan.cj-n')?.textContent ?? ''} : null; });
    check(!!px && Number(px.px) === c.close && px.d === board && px.src === 'board' && px.n === Number(c.close).toLocaleString('ko-KR'), '⑰ 회사 쪽 현재가 = 첫 페이지 값(주문 0200) — ' + k + ' ' + c.name, JSON.stringify(px) + ' / ' + c.close + ' ' + board);
  }
  // 주문 0806(사장님 2026-11-09 08:06 「어 그렇게 해」) — 42칸 회사마다 회사 쪽 한 달 꺾은선 = 첫 페이지 칸과 같은 21 값 · 같은 꼴 · 처음 날 · 끝 날 · 끝값 이름표 · 시장 줄은 21날이 지수 자료에 모두 있을 때만
  const coBad = [], seen = new Set(); let coN = 0, idxN = 0, cdN = 0;
  for (const c of all) {
    if (seen.has(c.code)) continue; seen.add(c.code);
    const lw = await lineWant(c.code), cell = cells.find(x => x.code === c.code);
    await open(p, `#/c/${c.code}`); await p.waitForTimeout(300);
    const g = await p.evaluate(() => { const s = document.querySelector('#su svg.su-co-jobs'), co = s?.querySelector('g[data-line="co"]'), ix = s?.querySelector('g[data-line="idx"]');
      return s ? {lsrc: s.getAttribute('data-lsrc'), src: co?.getAttribute('data-src') ?? null, v: co?.getAttribute('data-v') ?? null, n: co?.getAttribute('data-n') ?? null, from: co?.getAttribute('data-from') ?? null, to: co?.getAttribute('data-to') ?? null,
        pts: co?.querySelector('polyline.cj-co')?.getAttribute('points') ?? '', ix: ix ? {from: ix.getAttribute('data-from'), to: ix.getAttribute('data-to'), n: ix.getAttribute('data-n')} : null,
        lab: s.querySelector('.su-lg-c .v')?.textContent ?? '', axis: [...s.querySelectorAll('g[data-per="line"] text')].map(e => e.textContent)} : null; });
    const why = [];
    if (!lw) why.push('판 값 없음');
    else if (!g) why.push('그림 없음');
    else {
      if (g.lsrc !== 'board' || g.src !== 'board') why.push('바탕 ' + g.lsrc + '/' + g.src);
      if (g.v !== lw.v.join(',') || g.n !== '21') why.push('값 ' + String(g.v).slice(0, 40));
      if (g.from !== (lw.from ?? '') || g.to !== board) why.push('날 ' + g.from + '~' + g.to + ' / ' + lw.from + '~' + board);
      if (g.lab !== pctOf(lw.last)) why.push('이름표 ' + g.lab + ' / ' + pctOf(lw.last));
      if (lw.from && (g.axis[0] !== md(lw.from) || g.axis[g.axis.length - 1] !== md(board))) why.push('아래 날 ' + g.axis.join('~'));
      const a = shapeOf(ptsOf(g.pts, /(-?[\d.]+),(-?[\d.]+)/g)), b = shapeOf(ptsOf(cell?.sp, /(-?[\d.]+) (-?[\d.]+)/g));
      if (!sameShape(a, b)) why.push('꼴이 첫 페이지 칸과 다름 ' + a.length + '/' + b.length);
      if (lw.idx ? !(g.ix && g.ix.from === lw.cd[0] && g.ix.to === lw.cd[20] && g.ix.n === '21') : !!g.ix) why.push('시장 줄 ' + JSON.stringify(g.ix) + ' 있어야 ' + lw.idx);
      coN++; if (g.ix) idxN++; if (Array.isArray(lw.it.cd)) cdN++;
    }
    if (why.length) coBad.push(c.code + ' ' + c.name + ': ' + why.join(' · '));
  }
  R.m.coLine = {companies: seen.size, ok: coN - coBad.length, idx: idxN, cd: cdN, bad: coBad.slice(0, 6)};
  check(seen.size >= 30 && !coBad.length, '⑰ 42칸 회사 쪽 한 달 꺾은선 = 첫 페이지 칸 값 21개 · 같은 꼴 · 처음 날 · 끝 날 · 끝값 이름표 · 시장 줄은 날짜가 꼭 맞을 때만(주문 0806)', seen.size + '곳 · ' + coBad.slice(0, 3).join(' | '));
  if (/^https:/.test(base)) check(cdN === seen.size, '⑰ 진짜 사이트 — 42칸 회사 모두 판 날짜 21개(cd)', cdN + '/' + seen.size);
  await ctx.close();
}
{ // ⑲ 기록창 — 한국 시장 일곱 가지(주문 0814 · 사장님 2026-11-09 08:14 「… 다른 나라와 비교할 때 … 정말 아주 다른 특징 … 총 7가지 … 기록창을 만들어 먼저 기재 하라 에이전트 활용하라」 · 08:25 「수르에 올려야해」)
  //   기록 쪽 서랍 → #/r/k · 일곱 칸 = 자료(su/data/kr7.json) 그대로 · 칸마다 한국은 · 다른 나라는(둘 넘게) · 한국 문화와 이어진 까닭 · 근거(하나 넘게) · 한눈 그림 일곱 짝 · 새 문장 「%」 0 · 영어 글자 0 · 쪽 규칙(넘침 · 17px · 48 · 고리 · 안전 문장 · 쓰지 않을 말)
  const K = await J('/su/data/kr7.json').catch(() => null);
  check(!!K && Array.isArray(K.items) && K.items.length === 7 && K.items.every(it => it.t && it.one && it.kr && it.why && it.culture && it.tag && it.vs?.length >= 2 && it.src?.length >= 1), '⑲ 기록창 자료 — 일곱 가지 · 칸마다 한국은 · 다른 나라는 둘 넘게 · 까닭 · 근거', JSON.stringify(K?.items?.map(x => x.t) ?? null).slice(0, 200));
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    const W = '⑲ [' + width + '] ';
    await open(p, '#/r');
    const dr = await p.evaluate(() => [...document.querySelectorAll('#su a.su-drawer')].map(a => ({href: a.getAttribute('href'), t: a.querySelector('b')?.textContent ?? ''})));
    check(dr.some(d => d.href === '#/r/k' && d.t === '한국 시장 일곱 가지'), W + '기록 쪽 서랍 「한국 시장 일곱 가지」 → #/r/k', JSON.stringify(dr.map(d => d.href)));
    await open(p, '#/r/k');
    await p.evaluate(() => { for (const d of document.querySelectorAll('#su details.k7-d')) d.open = true; });
    const m = await measure(p); pageRules(m, W + '기록창');
    const g = await p.evaluate(() => { const hero = document.querySelector('#su .su-hero.k7');
      return {h1: document.querySelector('#su h1')?.innerText ?? '', g: hero?.getAttribute('data-g') ?? null, rows: hero ? hero.querySelectorAll('svg.k7-map g.k7-row').length : 0,
        cards: hero ? [...hero.querySelectorAll('li.k7-li')].map(li => ({t: li.querySelector('.k7-t')?.textContent ?? '', vs: li.querySelectorAll('.k7-v').length, src: li.querySelectorAll('.k7-sr').length, why: li.querySelector('.k7-why')?.textContent ?? ''})) : [],
        text: [...document.querySelectorAll('#su main .su-hero.k7, #su main .k7-how')].map(e => e.innerText).join('\n')}; });
    check(g.g === 'su-kr7' && g.h1.includes('한국 주식시장') && g.rows === 7 && g.cards.length === 7, W + '쪽 꼴 — 큰 제목 · 한눈 그림 일곱 짝 · 일곱 칸', JSON.stringify({h1: g.h1, rows: g.rows, n: g.cards.length}));
    if (K?.items) check(g.cards.every((c, i) => c.t === K.items[i].t && c.vs === K.items[i].vs.length && c.src === K.items[i].src.length && c.why === K.items[i].why), W + '일곱 칸 = 자료 그대로(차례 · 이름 · 다른 나라 · 근거 · 까닭)', JSON.stringify(g.cards.map(c => [c.t, c.vs, c.src])).slice(0, 200));
    check(!g.text.includes('%') && !/[A-Za-z]/.test(g.text), W + '새 문장에 「%」 · 영어 글자 없음', (g.text.match(/.{0,12}(%|[A-Za-z]+).{0,12}/) ?? [''])[0]);
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    if (width === 390) R.m.kr7 = {cards: g.cards.length, rows: g.rows, screens: m.screens};
    await ctx.close();
  }
}
{ // ⑱ 회사 쪽 장 중 한 달 꺾은선(주문 0806 · 사장님 2026-11-09 08:06 「어 그렇게 해」 — 장이 열린 낮에 첫 페이지 꺾은선이 1분마다 바뀌면 회사 쪽 꺾은선도 똑같이)
  //   가) /api/price 답을 시험 값으로 끼움: 판 다음 날 장 중 값 → 회사 쪽 줄 = 맨 앞 하루를 빼고 그 값을 끝에(첫 페이지 relive 와 같은 셈) · 처음 날 = 둘째 날 · 끝 날 = 그날 · 시장 줄 없음 · 끝값 이름표 · 첫 페이지 칸과 같은 꼴
  //       판과 같은 날 값 → 끝 값만 바뀜 · 날짜 · 시장 줄 그대로 · 값 없음 → 판 값 그대로
  //   나) 진짜 답(끼우지 않음): 장 중이면 회사 쪽 줄 끝 = 그 현재가 · 앞 20개 = 판 값 · 첫 페이지 칸과 같은 때 값이면 같은 현재가 · 같은 꼴 / 장 밖이면 판 값 그대로
  const T21 = await J('/su/data/su21.json'), day = T21?.asOf?.board ?? '', h = T21?.lists?.hot?.[0], lw = h ? await lineWant(h.code) : null;
  const next = (() => { const d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 3); return d.toISOString().slice(0, 10); })();
  const P = h?.close ? Math.round(h.close * 1.031) : 0, P2 = h?.close ? Math.round(h.close * 0.987) : 0, NFk = new Intl.NumberFormat('ko-KR'), mdK = d => { const q = /^\d{4}-(\d{2})-(\d{2})$/.exec(d ?? ''); return q ? +q[1] + '월 ' + +q[2] + '일' : null; };
  const coOf = p => p.evaluate(() => { const s = document.querySelector('#su svg.su-co-jobs'), co = s?.querySelector('g[data-line="co"]');
    return s ? {px: s.getAttribute('data-px'), live: s.getAttribute('data-live'), label: s.getAttribute('aria-label') ?? '', v: co?.getAttribute('data-v') ?? null, from: co?.getAttribute('data-from') ?? null, to: co?.getAttribute('data-to') ?? null,
      pts: co?.querySelector('polyline.cj-co')?.getAttribute('points') ?? '', ix: !!s.querySelector('g[data-line="idx"]'), chartLive: s.querySelector('g.cj-chart')?.getAttribute('data-live') ?? null, lab: s.querySelector('.su-lg-c .v')?.textContent ?? '',
      axis: [...s.querySelectorAll('g[data-per="line"] text')].map(e => e.textContent), n: s.querySelector('text.cj-px tspan.cj-n')?.textContent ?? '', d: s.querySelector('text.cj-d')?.textContent ?? ''} : null; });
  const cellOf = (p, code) => p.evaluate(code => { const a = document.querySelector(`#su main > .su-hero a.sa-cell[data-code="${code}"]`); return a ? {px: a.getAttribute('data-px'), live: a.getAttribute('data-live'), sp: a.querySelector('path.sa-sp')?.getAttribute('d') ?? ''} : null; }, code);
  const lastOfV = v => v[20] / v[0] * 100 - 100;
  if (h && P && lw) { // 판 날짜 21개(cd)가 없으면(미리 보기 묶음 — 저장된 옛 판) 밀린 처음 날 글은 없음(그림이 처음 날을 쓰지 않음)
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    let mode = 'open';
    await p.route('**/api/price*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(mode === 'same' ? {schema: 'su-price-1', day, hhmm: '1530', status: 'closed', items: {[h.code]: {p: P2, t: day + 'T15:30'}}}
      : mode === 'none' ? {schema: 'su-price-1', day: next, hhmm: '0901', status: 'open', items: {}} : {schema: 'su-price-1', day: next, hhmm: '1431', status: 'open', items: {[h.code]: {p: P, t: next + 'T14:31'}}})}));
    // 가-1 판 다음 날 장 중
    await open(p, `#/c/${h.code}`); await p.waitForTimeout(1200);
    const a = await coOf(p), want = [...lw.v.slice(1), P];
    await open(p, '#/'); await p.waitForTimeout(1200);
    const cA = await cellOf(p, h.code);
    const okA = !!a && a.px === String(P) && a.live === next + 'T14:31' && a.chartLive === next + 'T14:31' && a.v === want.join(',') && a.from === (lw.cd ? lw.cd[1] : '') && a.to === next && !a.ix && a.lab === pctOf(lastOfV(want))
      && (lw.cd ? a.axis[0] === mdK(lw.cd[1]) : a.axis.length === 1) && a.axis[a.axis.length - 1] === mdK(next) && a.n === NFk.format(P) && a.label.includes('현재가 ' + NFk.format(P) + '원') && a.label.includes('오후 2시 31분 값') && a.label.includes('한 달 줄 ' + pctOf(lastOfV(want)));
    const shA = !!cA && cA.live === next + 'T14:31' && sameShape(shapeOf(ptsOf(a?.pts, /(-?[\d.]+),(-?[\d.]+)/g)), shapeOf(ptsOf(cA.sp, /(-?[\d.]+) (-?[\d.]+)/g)));
    R.m.coLive = {a: a && {px: a.px, live: a.live, from: a.from, to: a.to, ix: a.ix, lab: a.lab}, shape: shA};
    check(okA, '⑱ 회사 쪽 장 중 — 판 다음 날 값이면 꺾은선 맨 앞 하루를 빼고 그 값을 끝에 · 처음 날 = 둘째 날 · 끝 날 = 그날 · 시장 줄 없음 · 끝값 이름표 · 현재가 글(주문 0806)', JSON.stringify(a).slice(0, 300));
    check(shA, '⑱ 회사 쪽 장 중 꺾은선 = 첫 페이지 칸 꺾은선과 같은 꼴(같은 값에서 나옴)', JSON.stringify({cell: cA?.live, n: ptsOf(a?.pts, /(-?[\d.]+),(-?[\d.]+)/g).length}));
    // 가-2 판과 같은 날 값(장 끝 값) → 끝 값만
    mode = 'same'; await open(p, `#/c/${h.code}`); await p.waitForTimeout(1200);
    const b = await coOf(p), want2 = [...lw.v.slice(0, 20), P2];
    check(!!b && b.px === String(P2) && b.v === want2.join(',') && b.from === (lw.from ?? '') && b.to === day && b.ix === lw.idx && b.lab === pctOf(lastOfV(want2)) && b.d === '현재가는 ' + mdK(day) + ' 마지막 값이에요.',
      '⑱ 회사 쪽 — 판과 같은 날 값이면 끝 값만 바뀜 · 날짜 · 시장 줄 그대로', JSON.stringify(b).slice(0, 300));
    // 가-3 받은 값 없음 → 판 값 그대로
    mode = 'none'; await open(p, `#/c/${h.code}`); await p.waitForTimeout(1200);
    const z = await coOf(p);
    check(!!z && z.px === String(h.close) && z.live === null && z.v === lw.v.join(',') && z.from === (lw.from ?? '') && z.to === day, '⑱ 회사 쪽 — 받은 값이 없으면 판 값 그대로', JSON.stringify(z).slice(0, 200));
    check(!errs.length, '⑱ 회사 쪽 장 중 화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  } else check(false, '⑱ 회사 쪽 장 중 — 불장 첫 회사 판 값', JSON.stringify({h: h?.code, lw: !!lw, cd: !!lw?.cd}));
  // 나) 진짜 답 — 지금 이 때(장 중이든 밖이든)
  if (h && lw) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
    const p = await ctx.newPage();
    await open(p, `#/c/${h.code}`); await p.waitForTimeout(2500);
    const a = await coOf(p);
    await open(p, '#/'); await p.waitForTimeout(2500);
    const cA = await cellOf(p, h.code);
    const v = String(a?.v ?? '').split(',').map(Number), sh = !!a?.to && a.to > day;
    const ok = !!a && v.length === 21 && (a.live
      ? +a.px > 0 && v[20] === +a.px && JSON.stringify(v.slice(0, 20)) === JSON.stringify(sh ? lw.v.slice(1) : lw.v.slice(0, 20)) && (sh ? a.from === (lw.cd ? lw.cd[1] : '') && !a.ix : a.from === (lw.from ?? ''))
      : a.px === String(h.close) && a.v === lw.v.join(','));
    const both = !!a?.live && !!cA?.live && a.live === cA.live;
    const okB = !both || (cA.px === a.px && sameShape(shapeOf(ptsOf(a.pts, /(-?[\d.]+),(-?[\d.]+)/g)), shapeOf(ptsOf(cA.sp, /(-?[\d.]+) (-?[\d.]+)/g))));
    R.m.coReal = {live: a?.live ?? null, cellLive: cA?.live ?? null, px: a?.px ?? null, cellPx: cA?.px ?? null, from: a?.from ?? null, to: a?.to ?? null, both};
    check(ok, '⑱ 진짜 답 — 장 중이면 회사 쪽 꺾은선 끝 = 받은 현재가 · 앞 20개 = 판 값 / 장 밖이면 판 값 그대로', JSON.stringify(R.m.coReal));
    check(okB, '⑱ 진짜 답 — 같은 때 값이면 첫 페이지 칸과 회사 쪽이 같은 현재가 · 같은 꼴', JSON.stringify(R.m.coReal));
    // 장이 열려 있으면(날짜 글 「○월 ○일 오전/오후 ○시 ○분 값이에요.」) 1분 뒤 다시 — 회사 쪽 · 첫 페이지 칸 모두 때가 앞으로 · 회사 쪽 줄 끝 = 새 현재가
    if (a?.live && /(오전|오후) \d+시/.test(a.d ?? '')) {
      await open(p, `#/c/${h.code}`); await p.waitForTimeout(2500);
      const a1 = await coOf(p); let a2 = a1;
      for (let i = 0; i < 2 && !(a2?.live > a1?.live); i++) { await p.waitForTimeout(66000); a2 = await coOf(p); } // 1분마다 묻기 · 두 번까지 기다림
      const v2 = String(a2?.v ?? '').split(',').map(Number);
      R.m.coReal.minute = {t1: a1?.live ?? null, t2: a2?.live ?? null, px2: a2?.px ?? null};
      check(!!a1?.live && !!a2?.live && a2.live > a1.live && v2.length === 21 && v2[20] === +a2.px, '⑱ 진짜 답 — 장 중 1분 뒤 회사 쪽 현재가 · 꺾은선 끝이 새 때 값으로 바뀜', JSON.stringify(R.m.coReal.minute));
      await open(p, '#/'); await p.waitForTimeout(2500);
      const c1 = await cellOf(p, h.code); let c2 = c1;
      for (let i = 0; i < 2 && !(c2?.live > c1?.live); i++) { await p.waitForTimeout(66000); c2 = await cellOf(p, h.code); }
      R.m.coReal.minuteCell = {t1: c1?.live ?? null, t2: c2?.live ?? null};
      check(!!c1?.live && !!c2?.live && c2.live > c1.live, '⑱ 진짜 답 — 장 중 1분 뒤 첫 페이지 칸 현재가가 새 때 값으로 바뀜', JSON.stringify(R.m.coReal.minuteCell));
    }
    await ctx.close();
  }
}
await browser.close();
R.ok = R.counts.fail === 0;
console.log(`수르 두 길 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
process.exit(R.ok ? 0 : 1);

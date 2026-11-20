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
//      · 주문 1114-1306 ④ · ① — 누른 답으로 판정을 따로 셈 · 「떨어지면? → 안 정함」은 바로 쉬어 + 안내 한 줄 · 「좋아」 판정 이름 0 · 옛 기록 이름은 새 이름으로 · 판정 칸 차례 · 한 달 뒤 값 「100원이 ○원」
//   ⑨ 주문 1616(사장님 2026-11-04 11:16(+04) 「첫 장부터 끝 장까지 전부 새로 짜라」) — 다음 단추 일곱 번에 끝(여덟 화면 · 걸음 표시 1~8) · 탭 넷 기승전결 차례 · 쪽마다 맨 위 큰 값 → 큰 그림 → 중간 값 → … → 맨 아래 출처와 조사 날짜
//      · 첫 화면의 그림 넓이 50% 넘게 · 움직이는 그림 둘 넘게 · 큰 값의 여섯 칸(빈 칸 = 「확인 필요」) · 중간 값 · 자세한 값마다 여섯 칸 · 기록 서랍 여섯 · 그림 수 셈
//   ⑦ 첫 화면이 된 뒤(사장님 2026-11-03 18:33(+04) 「응」): 처음 쪽 본질 세 줄(essence.js 그대로 · 회사 수 · 받은 때 = home-summary) · 지금 수르 고리(#/w/ · #/s/ · ?lang=)는 /next/ 로 이어짐 · ?v= · 다른 표는 그대로 · 느린 4G 가장 큰 그림 2.5초 안
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {screenHits, ruinHits} from '../../../site/next/words.js'; // 화면 낱말 · 망치는 길(수익 자랑 gainHits 는 보내는 글 잣대 — 화면 %는 사실 글)
import {essenceData, essenceLines} from '../../../site/next/essence.js'; // 본질 세 줄(첫 화면)
import {START as SETTLE_START} from './su21_settle.mjs'; // 정산 첫날(주문 1112-2042 「정산을 오늘 부터 한다 그동안에 기록은 다 지운다」)
import * as S36C from '../../../site/su/su-sonja-36.js'; // 서른여섯 꾀 바탕 글(= su21_s36.py --defs · 시험 su-settle.test.mjs 가 맞댐) — 꾀 칸 자료가 없는 날 쪽이 쓰는 글과 맞댐(주문 1115-2328)
import * as MEANC from '../../../site/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위 · 글만)
import * as STORYC from '../../../site/su/su-sonja-story.js'; // 그림 속 이야기 네 막(주문 1117-0102 — 꾀 쪽 큰 그림 바로 아래 · 글만)

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'su-check-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const LINK_OK = /^(#\/|#\/[kqpjo]|#\/[cqp]\/[0-9A-Z]{6}|#\/k\/g(0[1-9]|[12]\d|3[0-6])|#\/r\/t|#\/gift|\/next\/|\/next\/\?lang=en|\/next\/#\/(why|share|gift|me|jinhwa|find)(\/[0-9A-Z]{6})?|\/hello\.html|https:\/\/shin-yxy\.gino\.im\/|\/next\/\?(lang=en&)?su=[a-z]+#\/(?!(talk|surge|cal|today)(\/|$))[\w\/.%-]*|\/(hello|letter|invite|privacy)\.html\?su=[a-z]+(#[\w-]+)?|\/su\/privacy\.html(#[\w-]+)?)$/; // 주문 1115-2328 — 손자병법 길뿐: 첫 쪽 #/ · 꾀 모음 #/k · 꾀 #/k/g01 ~ g36 · 회사 #/c/<번호> · 멈춤 #/q(/<번호>) · #/p · 일지 #/j · 정산 #/r/t · 선물 · /next/ 옛 쪽(찾기 · 고객센터 …) · 지운 쪽(#/b · #/m · #/n · #/s · #/f · #/r · #/r/<서랍> · #/i/<업종> · #/c/<번호>/more · t · y)으로 가는 고리 0 // 주문 1114-1306 ⑧ · ② — 옛 기능 쪽 #/g · 닫히는 옛 쪽(#/talk · #/surge · #/cal · #/today)과 /atlas/ 화면으로 가는 고리 0

/** 자료에서 따로 셈(화면 코드 site/su/su-data.js 를 쓰지 않음) */
const J = async u => { const r = await fetch(base + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
// 장 중 값을 받지 않게(자료와 맞대는 검사 — 판 값 그대로 · 404 대신 「값 없음」 답이라 화면 오류 글이 생기지 않음) — 주문 0806
const QUIET = ctx => ctx.route('**/api/price*', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({schema: 'su-price-1', day: '0000-00-00', status: 'closed', items: {}})}));
/** 「%」 대신 쓰는 말(주문 1114-1306 · 화면 코드 su-data.js won100 · more100 을 쓰지 않고 따로 셈) — 31.93 → 「100원이 131.9원」 · 8.87 → 「100원에 8.9원 더」 */
const won100Of = v => (Number.isFinite(v) ? '100원이 ' + (Math.round((100 + v) * 10) / 10).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '원' : '?');
const more100Of = v => { if (!Number.isFinite(v)) return '?'; const a = Math.abs(v); return '100원에 ' + (a < 10 ? a.toFixed(1) : String(Math.round(a))) + '원 ' + (v >= 0 ? '더' : '덜'); };
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
const SUM = await J('/next/data/home-summary.json').catch(() => null);
const ESS = essenceLines(essenceData({summary: SUM}));
// 주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답) — 길 다섯 화면(오늘 → 꾀 → 회사 → 「왜 사?」 → 내 매매일지)
//   이 검사가 자료에서 따로 고름: 둘째 화면 꾀 FK = 형세 덜 잃은 차례 맨 위(형세가 없으면 g01) · 셋째 화면 회사 FC = 그 꾀가 고른 첫 곳(없으면 「왜 사?」로 바로)
const T0 = await J('/su/data/su21.json').catch(() => null), G0 = await J('/su/data/su21-s36.json').catch(() => null);
const K36A = Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0'));
const sun0 = T0?.sun?.rule === 'sun-v1' && Array.isArray(T0.sun.rank) && T0.sun.rank.length === 36 && new Set(T0.sun.rank.map(r => r?.k)).size === 36 && T0.sun.rank.every(r => K36A.includes(r.k) && Number.isInteger(r.n)) && ['fall', 'shake', 'rise', 'narrow', 'calm'].includes(T0.sun.land) && Number.isInteger(T0.sun.m?.n) && T0.sun.m.n > 0;
const FK = sun0 ? T0.sun.rank[0].k : 'g01';
const SN0 = !!T0?.s36n && typeof T0.s36n === 'object' && Object.values(T0.s36n).length === 36 && Object.values(T0.s36n).every(x => Number.isInteger(x) && x >= 0); // 쪽은 이 수가 있을 때만 꾀 칸 자료를 받음
const FC = SN0 ? (Array.isArray(G0?.lists?.[FK]) ? G0.lists[FK] : []).find(c => /^[0-9A-Z]{6}$/.test(c?.code ?? '') && typeof c.name === 'string') ?? null : null;
// 지운 쪽(주문 1115-2328) — 옛 고리로 오면 첫 쪽 · 주소 #/
const GONE = ['#/b', '#/m', '#/m/fall', '#/n', '#/s', '#/f', '#/r', '#/r/m', '#/r/w', '#/r/d', '#/r/y', '#/r/k', '#/r/i', '#/r/c', '#/r/s', '#/r/n', '#/r/005930', '#/i/' + encodeURIComponent('반도체'), '#/c/005930/more', '#/c/005930/t', '#/c/005930/y/hot', '#/g', '#/g/hot'];
R.m.data = {fk: FK, fc: FC?.name ?? null, sun: sun0};

const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const URL_OF = hash => `${base}/su/?v=${Date.now()}${hash}`;
const more = p => p.evaluate(() => { for (const d of document.querySelectorAll('#su main > details.su-more, #su main > details.sj-more')) d.open = true; }); // 손자병법 첫 쪽(주문 1115-1706)의 「자세히」도 // 신문 짜임 「자세히」 서랍을 엶 — 그 안 목록 · 단추를 누르는 길(주문 1023 [2] 3 · 4 — 기능은 서랍 안에 그대로)
/** 쪽 열기 — 받은 문서에 #su 가 없으면(진짜 사이트가 다른 쪽 · 오류 쪽을 줌) 그 모습을 R.m.reopen 에 남기고 3초 뒤 두 번까지 다시 엶
 *  (주문 0510 — 진짜 사이트 검사 3/11 · 4/11 에서 「왜?」 쪽 하나가 #su 없이 열려 검사 도구가 멈춤 · 미리 보기 검사는 같은 자료로 실패 0) */
const open = async (p, hash) => {
  for (let i = 0; i < 3; i++) {
    const res = await p.goto(URL_OF(hash), {waitUntil: 'networkidle'}).catch(e => ({err: String(e?.message ?? e).slice(0, 160)}));
    await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {});
    await p.waitForFunction(() => !document.querySelector('#su main > .su-hero[data-wait], #su main > .sj-s36[data-wait], #su main.sj-page[data-wait]'), null, {timeout: 15000}).catch(() => {}); // 손자병법 첫 쪽 꾀 칸 자리(주문 1115-1706)
    await p.waitForTimeout(250);
    if (await p.evaluate(() => !!document.getElementById('su')).catch(() => false)) return;
    (R.m.reopen ??= []).push({hash, try: i + 1, status: typeof res?.status === 'function' ? res.status() : null, err: res?.err ?? null, url: p.url().slice(0, 160), title: (await p.title().catch(() => '')).slice(0, 80),
      body: (await p.evaluate(() => (document.body?.innerText ?? '').slice(0, 160)).catch(() => ''))});
    await p.waitForTimeout(3000);
  }
};
const settle = async (p, name = null) => { await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {}); await p.waitForFunction(() => !document.querySelector('#su main > .su-hero[data-wait], #su main > .sj-s36[data-wait], #su main.sj-page[data-wait]'), null, {timeout: 15000}).catch(() => {}); /* 큰 그림 자리가 채워질 때까지(주문 1023 — 글 먼저 · 그림 뒤) */ if (name) await p.waitForFunction(n => (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim() === n, name, {timeout: 10000}).catch(() => {}); await p.waitForTimeout(300); }; // 누른 뒤 새 쪽이 그려질 때까지(큰 제목이 바뀜 · 10초 안)
/** 화면 재기 — 넘침 · 작은 글 · 작은 누름 · 고리 · 글 · 큰 제목 */
const measure = p => p.evaluate(() => {
  const v = document.getElementById('su'), out = {w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, small: [], tiny: [], links: [], text: '', h1: '', screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2)};
  if (!v) return {...out, nosu: (location.href + ' · ' + document.title + ' · ' + (document.body?.innerText ?? '').slice(0, 120)).slice(0, 300)}; // #su 없는 쪽 — 멈추지 않고 실패로 적음(주문 0510)
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; if (e.closest('details:not([open]) > :not(summary)')) return false; /* 닫힌 서랍 안은 안 보임(크롬은 닫힌 details 안에도 자리를 셈 — 신문 짜임 「자세히」) */ for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
  for (const a of v.querySelectorAll('a[href], button')) { if (!vis(a)) continue; const r = a.getBoundingClientRect(); out.links.push(a.getAttribute('href') ?? '(단추)'); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${(a.innerText || '').trim().slice(0, 30)} ${Math.round(r.width)}×${Math.round(r.height)}`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.textContent.trim(); if (!t || !n.parentElement || !vis(n.parentElement)) continue; const fs = parseFloat(getComputedStyle(n.parentElement).fontSize); if (fs < 16.95) out.tiny.push(`${t.slice(0, 24)} ${fs}px`); }
  const c = v.cloneNode(true); for (const e of c.querySelectorAll('[data-proper]')) e.remove(); out.text = c.innerText ?? c.textContent;
  out.h1 = (v.querySelector('h1')?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return out;
});
const pageRules = (m, where) => {
  if (m.nosu) { check(false, where + ' 쪽이 열림(#su)', m.nosu); return; }
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
  if (width === 390) { R.m.home = {screens: m0.screens, links: m0.links.length}; check(m0.screens <= (m0.text.includes('서른여섯 꾀') ? 31 : 16), W + '처음 쪽 16 화면 안 · 서른여섯 꾀 칸이 있으면 31 화면 안(주문 1115-1706 손자병법 첫 쪽 — 샘플 사 「줄 사이 넉넉히」 · 지금 일곱과 될 듯 일곱을 한 줄씩 위아래로 놓아 꾀 칸이 없을 때 이 컴퓨터 15.1 화면 · 옛 두 줄 그림 판 7.8 을 바꿈 · 꾀 칸이 있으면 이 컴퓨터 지어 낸 자료 23.6 화면) · (주문 1114-0802 「겹치는 그 종목을 별도로 … 또 폴더」 — 꾀 칸 맨 위에 겹친 곳 한 묶음(이 컴퓨터 35곳 · 28.09 화면 · 진짜 사이트와 차이 0.3 화면) · 곳 수가 날마다 달라 세 화면 남김 · 주문 1114-0004 「36 까지 … 종류별로 다 모아가지고 그 총 개수를 정리」 — 꾀마다 일곱 곳 252곳을 그림 아래에 더해 열 화면쯤 늘림 · 진짜 사이트 19.28 화면 · 주문 1114-0151 단추마다 「○일째」를 붙여 이 컴퓨터 21.58 · 진짜 사이트 22.44 화면 · 주문 1114-0325 「모든곳에 꺽기 그래프도 종목마다」 — 단추마다 한 달 꺾은선을 넣고 한 줄에 둘 · 두 줄 칸으로 바꿔 이 컴퓨터 25.86 화면 — 꾀마다 칸 줄이 넷으로 같아 이름 길이로 바뀌지 않음 · 진짜 사이트와 이 컴퓨터 차이 0.9 화면을 더해 두 화면 남김) (주문 1616 — 그림이 화면 대부분이라 그림만큼 길어짐 · 주문 1807·1833 「정보를 빼지 마라」 — 숫자마다 「그래서」 · 낱말 풀이 · 여섯 칸 지도 · 숨기지 않는 네 칸으로 한 화면 반 늘림 · 주문 1112-0253 쉬운 판 「칸 하나 읽는 법」 · 「될 듯은」 풀이로 0.3 화면 늘림 · 받은 자료와 글꼴에 따라 0.3 화면 오감)', String(m0.screens)); }
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
  { // 주문 1115-1843 · 1115-2328 — 처음 쪽 = 병법 서른여섯만 · 옛 21곳 · 불장 · 꽃이 될 · 돈이 몰리는 칸과 그 말 0
    const T21 = await J('/su/data/su21.json');
    // 주문 1115-1843(사장님 2026-11-15(마카오) 17:43 「… 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」 · 17:46 「응」)
    //   처음 쪽 = 손자병법 판(표지 → 형세 보고 → 꾀 차례) · 불장 · 꽃이 될 · 돈이 몰리는(지금 · 될 듯) · 조용한 힘 · 1 · 2 · 3등 · 이름이 오른 회사 · 칸 읽는 법 · 두 단추 · 겹친 곳 = 0 · 그 말도 0(꾀 이름 · 풀이 글 밖)
    const g0 = await p.evaluate(() => { const M = document.querySelector('#su main.sj-page'); if (!M) return null; const c = M.cloneNode(true); for (const e of c.querySelectorAll('section.sj-s36')) e.remove();
      return {parts: M.querySelectorAll('a.sj-row, a.sj-up3a, section.sj-grp, section.sj-quiet, section.sj-count, section.sj-up3, section.sj-how, nav.sj-mode, .sj-ov').length, words: (c.textContent.match(/불장|꽃이 될|돈이 몰리|돈이 몰릴|조용한데 힘이|될 듯/g) ?? []), art: document.querySelector('#su .sj-cover .sj-hwa')?.textContent ?? ''}; });
    check(!!g0 && g0.parts === 0 && g0.words.length === 0 && g0.art === '시장을 읽고덜 잃는꾀를 찾아요', W + '처음 쪽 = 병법 서른여섯만 — 불장 · 꽃이 될 · 돈이 몰리는(지금 · 될 듯) · 조용한 힘 · 1 · 2 · 3등 칸 0 · 그 말 0 · 표지 화제 「형세를 읽고 · 덜 잃는 꾀를 찾아요」(주문 1115-1843)', JSON.stringify(g0));
    check(await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="sonja"]'), k = m ? [...m.children] : []; return !!m && !!k[0]?.classList.contains('sj-cover') && !!k[1]?.classList.contains('sj-sun') && !document.querySelector('#su main > .su-hero'); }), W + '처음 쪽 = 손자병법 판(주문 1115-1706 — 표지 → 형세 보고 · 옛 그림 칸 0)', '');
    R.m.t21 = {listed: T21?.counts?.listed ?? null, board: T21?.asOf?.board ?? null};
  }
  // 주문 1115-2328(사장님 22:28 「어고쳐」) — 사이트 모든 쪽 = 병법 서른여섯만: 지운 쪽은 옛 고리로 와도 첫 쪽(주소도 #/) · 옛 회사 고리 #/k/<번호> 는 그 회사 쪽
  if (width === 390) {
    const bad = [];
    for (const hh of GONE) {
      await open(p, hh); await p.waitForTimeout(150);
      const g = await p.evaluate(() => ({hash: location.hash, page: document.querySelector('#su main')?.getAttribute('data-page') ?? '', h1: (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim(),
        old: document.querySelectorAll('#su .su-hero, #su .su-fcard, #su [data-feat], #su [data-road], #su .su-drawer').length, text: document.getElementById('su')?.innerText ?? ''}));
      if (!(g.hash === '#/' && g.page === 'sonja' && g.h1 === m0.h1 && g.old === 0 && !/불장|꽃이 될|돈이 몰|조용한데 힘이/.test(g.text))) bad.push(hh + ' → ' + g.hash + ' ' + g.page + ' ' + g.h1.slice(0, 12));
    }
    check(!bad.length, W + '⑨ 지운 쪽 ' + GONE.length + '곳(옛 처음 · 땅 지도 · 될 듯 21곳 · 조용한 힘 · 친구에게 · 기록 · 달마다 · 못 된 까닭 · 날마다 · 해마다 · 한국 시장 · 투자자 · 달력 · 업종 · 회사 자세히 · 1 · 2 · 3등 · 「왜?」 · 옛 기능) — 옛 고리로 오면 첫 쪽 · 주소 #/ · 옛 칸 · 그 말 0(주문 1115-2328)', bad.slice(0, 4).join(' / '));
    if (FC) { await open(p, '#/k/' + FC.code); const g = await p.evaluate(() => ({hash: location.hash, page: document.querySelector('#su main')?.getAttribute('data-page') ?? ''}));
      check(g.hash === '#/c/' + FC.code && g.page === 'co', W + '⑨ 옛 회사 고리 #/k/<번호> → 그 회사 쪽(주문 1115-2328)', JSON.stringify(g)); }
  }
  { // 주문 1115-2328 — 새 쪽마다 쪽 규칙(넘침 0 · 글 17px · 누름 48 · 고리 꼴 · 안전 문장 · 쓰지 않을 말 0)
    for (const hh of ['#/k', '#/k/' + FK, ...(FC ? ['#/c/' + FC.code] : []), '#/r/t']) { await open(p, hh); pageRules(await measure(p), W + '손자병법 판 ' + hh); }
  }
  if (width === 390) { // 「왜 사?」 답하기(주문 1506) — 열한 질문을 하나씩 답하면 결과 판정 · 매매일지에 같은 열쇠 · 같은 꼴로 한 줄 · 질문 쪽과 결과 쪽도 쪽 규칙 그대로
    // 주문 1114-1306 ④ · ① — 판정은 이 검사가 누른 답(모양 ● 0 · ▲ 1 · ■ 2 · 답 글)으로 따로 셈 · 「떨어지면? → 안 정함」은 바로 쉬어 + 큰 값 밑 「그래서」 줄에 안내 한 줄 · 판정 이름 셋에 「좋아」 없음
    //   · 옛 기록(판정 글 「좋아, 정해 둔 대로만」 둘 — 한 달 지나 「했어」 · 아직 안 물음)도 매매일지에 새 이름 · 한 달 뒤 값 셋 = 「100원이 ○원」(이 검사가 자료에서 따로 셈) · 판정 칸 차례 쉬어 → 반만 → 준비됨 · 칸마다 센 수
    // 주문 1115-2328 — 「왜 사?」를 여는 회사 = 길의 셋째 화면 회사(첫 꾀가 고른 첫 곳 · 옛 꽃 · 돈 줄은 지움)
    const qc = FC?.code ?? null, qn = FC?.name ?? null, KEYW = 'atlas:godori-why';
    const WV = ['준비됐어, 정해 둔 대로만', '반만 준비됐어', '오늘은 쉬어 가자'], WV_OLD = '좋아, 정해 둔 대로만', SELL_SAY = '팔 곳을 정하기 전에는 사지 않아요.', NEEDT = '확인 필요';
    const WREST = [[3, '거의 다·빌린 돈'], [6, '안 정함'], [8, '곧']]; // 쉬어 가는 답(질문 자리 · 답 글 — 4번 · 7번 · 9번)
    const wantV = got => { const pt = got.map(a => ({'●': 0, '▲': 1, '■': 2})[a.shape] ?? NaN), sc = pt.reduce((a, b) => a + b, 0), reds = pt.filter(x => x === 2).length, stop = WREST.some(([q, t]) => got[q]?.label === t);
      return {v: stop || sc >= 12 || reds >= 4 ? WV[2] : sc >= 6 ? WV[1] : WV[0], stop, sell: got[6]?.label === '안 정함', sc, reds}; };
    // 옛 기록 — 장 스무 번이 지난 날 · 옛 판정 이름 · 하나는 「했어」 답함(한 달 뒤 값 셋을 이 검사가 자료에서 따로 셈 — 이 회사 · 코스피 · 모든 회사 가운데 값) · 하나는 아직 안 물음(맨 위 「한 달 전 약속」)
    const DD = (await J('/atlas/data/days.json').catch(() => null))?.dates ?? [], HOMEJ = await J('/atlas/data/home.json').catch(() => null), MEDJ = await J('/next/data/median20.json').catch(() => null);
    const COJ = qc ? await J('/atlas/data/co/' + qc + '.json').catch(() => null) : null, KX = HOMEJ?.idx?.KOSPI;
    const KM = new Map((Array.isArray(KX?.rows) ? KX.rows : []).filter(x => Array.isArray(x)).map(x => [x[0], x[1]])); if (typeof KX?.date === 'string' && KX.close > 0 && !KM.has(KX.date)) KM.set(KX.date, KX.close);
    const medOf = (a, b) => { const r = (Array.isArray(MEDJ?.rows) ? MEDJ.rows : []).find(x => Array.isArray(x) && x[0] === a && x[1] === b); return r && Number.isFinite(r[2]) ? r[2] : null; };
    let ks = -1; for (let k = DD.length - 21; k >= Math.max(0, DD.length - 120); k--) if (KM.has(DD[k]) && KM.has(DD[k + 20]) && medOf(DD[k], DD[k + 20]) != null) { ks = k; break; }
    if (ks < 0 && DD.length > 20) ks = DD.length - 21;
    const grow = (a, b) => (a > 0 && b > 0 ? (b / a - 1) * 100 : null), ccl = Array.isArray(COJ?.close) ? COJ.close : null, ck0 = Number.isInteger(COJ?.k0) ? COJ.k0 : 0, lv = v => (v == null ? NEEDT : won100Of(v));
    const oldOf = (days, o = {}) => ({at: new Date(Date.now() - days * 864e5).toISOString(), asOf: DD[ks], code: qc, name: qn, price: ccl?.[ks - ck0] ?? null, day: DD[ks], answers: new Array(11).fill(0), score: 2, reds: 1, verdict: WV_OLD,
      groups: {이유: 2, 돈: 0, 때: 0, 마음: 0}, bigDay: null, why: null, promise: null, picks: [], ...o});
    const seeds = ks < 0 ? [] : [oldOf(45, {kept: {a: 'yes', at: new Date(Date.now() - 5 * 864e5).toISOString()}}), oldOf(44)];
    const seedLv = ks < 0 ? null : [...(qc ? [lv(grow(ccl?.[ks - ck0], ccl?.[ks + 20 - ck0]))] : []), lv(grow(KM.get(DD[ks]), KM.get(DD[ks + 20]))), lv(medOf(DD[ks], DD[ks + 20]))];
    check(seeds.length === 2, W + '「왜 사?」 옛 기록 시험 날(장 날 줄 · 스무 번 뒤)', String(DD.length));
    let firstQ = true;
    const whyRun = async (pick, tag) => {
      await open(p, qc ? '#/q/' + qc : '#/q');
      if (firstQ) { firstQ = false; pageRules(await measure(p), W + '「왜 사?」 질문'); await p.evaluate(([k, r]) => { try { localStorage.setItem(k, JSON.stringify(r)); } catch { /* 기억 못 하는 기계 */ } }, [KEYW, seeds]); }
      const got = []; let flow = true;
      for (let i = 0; i < 11 && flow; i++) {
        const b = (await p.$$('#su .su-a'))[pick(i)]; if (!b) { flow = false; break; }
        got.push(await b.evaluate(e => ({shape: (e.querySelector('.su-shape')?.textContent ?? '').trim(), label: (e.querySelector('span')?.textContent ?? '').trim()})));
        await b.click(); await p.waitForTimeout(220); // 답 = 다음(주문 1120-0001 · 참모 d09 「한 돌 한 판」 — 누름 22번 → 11번) · 옛 「다음 질문」 단추가 있으면 그것도 누름
        const nx = await p.$('#su .su-qnext'); if (nx) { await nx.click(); await p.waitForTimeout(150); }
        if (i < 10) { const at = await p.evaluate(() => { const a = [...document.querySelectorAll('#su .su-a')].at(-1)?.getBoundingClientRect(), t = document.querySelector('#su .sj-tabs')?.getBoundingClientRect(); return {n: (document.querySelector('#su .sj-step')?.getAttribute('aria-label') ?? '') && (document.querySelector('#su .su-big .su-bv b')?.textContent ?? ''), low: a ? Math.round(a.bottom + scrollY) : null, tabs: t ? Math.round(t.top) : null, prev: !!document.querySelector('#su .su-reply.su-prev')}; });
          if (i === 0) check(at.low != null && at.tabs != null && at.low <= at.tabs && at.prev, W + '「왜 사?」 답 = 다음 · 둘째 질문 답 셋이 첫 화면 안(아래 탭 위) · 앞 답 한마디가 맨 위(주문 1120-0001 · d09)', JSON.stringify(at)); }
      }
      check(flow && got.length === 11, W + '「왜 사?」 열한 질문을 끝까지 답함 — ' + tag, String(got.length));
      await p.waitForTimeout(400);
      const res = await p.evaluate(k => ({h1: (document.querySelector('#su h1')?.innerText ?? '').trim(), mean: (document.querySelector('#su main > .su-two .su-mean span')?.textContent ?? '').trim(), all: document.getElementById('su')?.textContent ?? '',
        rec: (() => { try { return JSON.parse(localStorage.getItem(k) || '[]')[0] ?? null; } catch { return null; } })()}), KEYW);
      const want = wantV(got);
      check(res.h1 === want.v, W + '「왜 사?」 결과 판정 = 누른 답으로 따로 센 판정 — ' + tag, `${res.h1} / ${want.v} · 점수 ${want.sc} · 빨간 답 ${want.reds}`);
      check(WV.includes(res.h1) && !res.all.includes(WV_OLD) && !res.h1.startsWith('좋아'), W + '「왜 사?」 판정 이름 셋(준비됐어 · 반만 · 쉬어) · 「좋아, 정해 둔 대로만」 0(사도 된다는 말로 읽히지 않게 · 주문 1114-1306 ④) — ' + tag, res.h1);
      check(want.sell ? res.mean === SELL_SAY : !res.all.includes(SELL_SAY), W + '「왜 사?」 「떨어지면? → 안 정함」이면 큰 값 밑 「그래서」 줄 = 「' + SELL_SAY + '」 · 아니면 그 글 0 — ' + tag, res.mean);
      check(Array.isArray(res.rec?.answers) && res.rec.answers.length === 11 && res.rec.answers.every((k, i) => k === pick(i)) && res.rec.code === qc && res.rec.verdict === res.h1, W + '「왜 사?」 매매일지에 기록 한 줄(같은 열쇠 · 같은 꼴 · 누른 답 · 판정 글 = 화면) — ' + tag, JSON.stringify(res.rec ?? null).slice(0, 160));
      pageRules(await measure(p), W + '「왜 사?」 결과 — ' + tag);
      return want;
    };
    const wA = await whyRun(() => 0, '답 첫째씩'), wB = await whyRun(i => (i === 6 ? 2 : 0), '떨어지면? 안 정함');
    check(wA.v === WV[0] && !wA.sell && wB.sell && wB.stop && wB.v === WV[2] && wB.sc < 6 && wB.reds < 4, W + '「왜 사?」 두 길 — 답 첫째씩은 준비됐어 · 7번만 「안 정함」으로 바꾸면 점수 · 빨간 답과 상관없이 바로 쉬어(주문 1114-1306 ④)', JSON.stringify([wA, wB]));
    // 매매일지(주문 1519 · #/j) — 방금 남긴 기록 둘과 옛 기록 둘이 새 판 매매일지에 보임 · 그림 넷 · 쪽 규칙
    await p.click('#su a[href="#/j"]').catch(() => {}); await settle(p, '내 매매일지');
    const jm = await measure(p);
    check(jm.h1 === '내 매매일지', W + '「왜 사?」 결과 → 매매일지', jm.h1);
    const jn = await p.evaluate(() => ({big: (document.querySelector('#su .su-big b')?.textContent ?? '').trim(), rows: document.querySelectorAll('#su .su-jr').length, figs: document.querySelectorAll('#su figure.su-fig').length,
      names: [...document.querySelectorAll('#su .su-jr .su-jrh .su-ma span')].map(e => e.textContent), due: document.querySelector('#su .su-due .su-lead')?.textContent ?? null, all: document.getElementById('su')?.textContent ?? '',
      t3: [...document.querySelectorAll('#su svg.ik-tally text.g-ts')].map(e => e.textContent), t3n: [...document.querySelectorAll('#su svg.ik-tally text.g-tk')].map(e => e.textContent),
      lv: [...document.querySelectorAll('#su .su-jr .su-jrv')].map(e => ({t: e.textContent, b: [...e.querySelectorAll('b.su-lv')].map(x => x.textContent)}))}));
    check(+jn.big >= 1 && jn.rows >= 1 && jn.figs >= 3, W + '매매일지 — 멈춘 횟수 · 기록 줄 · 그림 셋 넘게', JSON.stringify({big: jn.big, rows: jn.rows, figs: jn.figs}));
    const recs = await p.evaluate(k => { try { const x = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } }, KEYW);
    const full = recs.filter(r => r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === 11), vOf = v => (v === WV_OLD ? WV[0] : v);
    check(JSON.stringify(jn.names) === JSON.stringify(full.slice(0, 30).map(r => vOf(r.verdict))) && !jn.all.includes(WV_OLD) && full.filter(r => r.verdict === WV_OLD).length === seeds.length, W + '매매일지 판정 글 = 기록(옛 「좋아, 정해 둔 대로만」도 새 이름으로 보임 · 옛 이름 0 · 기록은 그대로 · 주문 1114-1306 ④)', JSON.stringify(jn.names));
    if (seeds.length) check(jn.due?.includes(' · ' + WV[0]) && !jn.due.includes(WV_OLD), W + '매매일지 맨 위 「한 달 전 약속」 — 옛 기록 판정도 새 이름', jn.due);
    const vc = [WV[2], WV[1], WV[0]].map(v => full.filter(r => vOf(r.verdict) === v).length + '번');
    check(JSON.stringify(jn.t3) === JSON.stringify(['쉬어', '반만', '준비됨']) && JSON.stringify(jn.t3n) === JSON.stringify(vc), W + '매매일지 판정 칸 차례 쉬어 → 반만 → 준비됨 · 칸마다 센 수 = 기록', JSON.stringify([jn.t3, jn.t3n, vc]));
    if (seedLv) check(jn.lv.length === 1 && JSON.stringify(jn.lv[0].b) === JSON.stringify(seedLv) && !jn.lv[0].t.includes('%'), W + '매매일지 한 달 뒤 값 = 「100원이 ○원」(이 회사 · 코스피 · 모든 회사 가운데 값 — 자료에서 따로 셈 · 「%」 0 · 주문 1114-1306 ①)', JSON.stringify([jn.lv, seedLv]).slice(0, 300));
    pageRules(jm, W + '매매일지');
    await p.evaluate(([k, ats]) => { try { const x = JSON.parse(localStorage.getItem(k) || '[]'); localStorage.setItem(k, JSON.stringify(x.filter(r => !ats.includes(r?.at)))); } catch { /* 그대로 */ } }, [KEYW, seeds.map(r => r.at)]); // 옛 기록 시험 줄은 뒤 검사(⑨) 앞에 뺌
  }
  if (width === 390) { // ⑨ 주문 1115-2328 — 길 다섯 화면(오늘 → 꾀 → 회사 → 「왜 사?」 → 내 매매일지) · 다음 단추 네 번에 끝 · 탭 다섯 · 쪽 차례 · 끝 줄
    /** 손자병법 판(첫 쪽 · 꾀 · 회사 — 주문 1115-1706 샘플 사 「화제와 도장」) — 차례 · 걸음 · 탭 · 끝 줄 · 서랍 · 도장 · 빨강 0 · 옛 꾸밈 0 */
    const shapeSj = () => p.evaluate(() => {
      const main = document.querySelector('#su main.sj-page'); if (!main) return null;
      const page = main.getAttribute('data-page') ?? '';
      const kids = [...main.children].map(e => e.className.split(' ').find(c => /^sj-(cover|sun|s36|count|up3|how|grp|quiet|mode|more|end|ph|kway|krec|kco|kst|kpn|cok|costop|two|act|body|figs|whymore)$/.test(c)) ?? e.className);
      const want = page === 'sonja' ? ['sj-cover', 'sj-sun', 'sj-s36', 'sj-more', 'sj-end'] : page === 'kkoe' ? ['sj-ph', 'sj-kway', 'sj-krec', 'sj-kco', 'sj-kst', 'sj-kpn', 'sj-end'] : page === 'co' ? ['sj-ph', 'sj-cok', 'sj-costop', 'sj-end'] : page === 'why' || page === 'journal' ? ['sj-ph', 'sj-two', 'sj-act', 'sj-body', 'sj-figs', 'sj-whymore', 'sj-end'] : [];
      const must = page === 'sonja' ? ['sj-cover', 'sj-sun', 'sj-more', 'sj-end'] : page === 'kkoe' ? ['sj-ph', 'sj-kway', 'sj-krec', 'sj-kco', 'sj-kpn', 'sj-end'] : page === 'why' ? ['sj-ph', 'sj-two', 'sj-act', 'sj-end'] : page === 'journal' ? ['sj-ph', 'sj-two', 'sj-end'] : ['sj-ph', 'sj-cok', 'sj-costop', 'sj-end'];
      const order = kids.every(k => want.includes(k)) && kids.map(k => want.indexOf(k)).every((v, i, a) => !i || v > a[i - 1]) && must.every(k => kids.includes(k));
      const last = main.lastElementChild, more = main.querySelector(':scope > details.sj-more');
      const step = document.querySelector('#su .sj-step'), art = document.querySelector('#su .sj-cover img.sj-art');
      // 한눈 판별(주문 1115-1843) — 꾀 회사 단추마다 한 달 표(내림 · 오름 · 같음) = 그 단추의 한 달 방향 · 내리는 땅 도장(내림) = 짙은 남빛 찬 도장 + 흰 글
      const seals = [...main.querySelectorAll('a.sj-chip')].map(a => { const e = a.querySelector('i.sj-chipm'); return {m: /sj-chipm-(dn|up|eq)/.exec(e?.className ?? '')?.[1] ?? 'na', row: a.getAttribute('data-mon'), t: e?.textContent ?? ''}; });
      const sunSeal = (() => { const e = main.querySelector('section.sj-sun .sj-seal-big, section.sj-ph .sj-seal-big'); return e ? {dn: e.classList.contains('sj-seal-dn'), bg: getComputedStyle(e).backgroundColor, c: getComputedStyle(e).color, t: e.textContent} : null; })();
      return {sonja: true, page, h1: (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim(), order, kids,
        step: step?.innerText.replace(/\s+/g, ' ').trim() ?? '', stepL: step?.getAttribute('aria-label') ?? '', next: document.querySelector('#su .sj-next')?.getAttribute('href') ?? null, nextK: document.querySelector('#su .sj-next .sj-nk')?.textContent ?? '',
        prog: [...document.querySelectorAll('#su .sj-prog li')].map(li => li.className), progL: document.querySelector('#su .sj-prog')?.getAttribute('aria-label') ?? '',
        lastIsSrc: !!last?.classList?.contains('sj-end') && /출처/.test(last.innerText) && /조사 날짜/.test(last.innerText),
        foot: [...main.querySelectorAll(':scope > .sj-end .sj-links a')].map(a => [a.getAttribute('href'), a.querySelector('span')?.textContent ?? '']),
        tabs: [...document.querySelectorAll('#su .sj-tabs a')].map(a => ({t: a.innerText.trim(), cur: a.getAttribute('aria-current') === 'page'})), tabsL: document.querySelector('#su .sj-tabs')?.getAttribute('aria-label') ?? '',
        moreShut: !!more && !more.open, ess: more ? more.querySelectorAll('[data-ess]').length : 0,
        art: !!art && art.complete && art.naturalWidth > 0, old: document.querySelectorAll('#su main > .su-hero, #su .su-orn, #su .su-top, #su .su-tabs, #su .su-dock').length,
        seals, sealsOk: seals.every(x => x.m === x.row && x.t === ({dn: '내림', up: '오름', eq: '같음', na: ''})[x.m]) && (!sunSeal || !sunSeal.dn || (sunSeal.bg === 'rgb(32, 50, 58)' && sunSeal.c === 'rgb(255, 255, 255)')), sunSeal,
        red: [...main.querySelectorAll('*')].filter(e => { const m = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return m && +m[1] > 170 && +m[2] < 90 && +m[3] < 90; }).length,
        hard: Number(main.dataset.hard ?? NaN), hardWords: main.dataset.hardWords ?? ''};
    });
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
        h1: (document.querySelector('#su h1')?.innerText ?? '').trim(), step: document.querySelector('#su .su-step')?.innerText.replace(/\s+/g, ' ').trim() ?? '', stepL: document.querySelector('#su .su-step')?.getAttribute('aria-label') ?? '', next: document.querySelector('#su .su-next')?.getAttribute('href') ?? null,
        share: Math.round(100 * area('#su main [data-g]') / (W * H)), shareIn: Math.round(100 * area('#su main [data-g]') / Math.max(1, W * (low - top))),
        order: !!(big && hero && two && more && big.bottom <= hero.top + 1 && hero.bottom <= two.top + 1 && two.bottom <= more.top + 1 && midsIn && !moreE.open), lastIsSrc: !!last?.classList?.contains('su-src') && /출처/.test(last.innerText) && /조사 날짜/.test(last.innerText),
        heroShare: Math.round(1000 * heroVis / (W * H)) / 10, outside, twoN, mucha, clean, labels, anim,
        figs: figs.length, moving, tiles, vals: vals.length, valsSix, tabs: [...document.querySelectorAll('#su .su-tabs a')].map(a => ({t: a.innerText.trim(), cur: a.getAttribute('aria-current') === 'page'})), tabsL: document.querySelector('#su .su-tabs')?.getAttribute('aria-label') ?? '',
        foot: [...document.querySelectorAll('#su main > .su-src .su-srcl a')].map(a => [a.getAttribute('href'), a.querySelector('span')?.textContent ?? ''])};
    });
    const STEP5 = ['오늘', '꾀', '회사', '「왜 사?」', '내 매매일지']; // 다섯 화면 이름(화면 코드 STEP5 를 쓰지 않고 따로 적음 · 주문 1115-2328)
    const TAB5 = '오늘 꾀 회사 멈춤 일지 정산', TAB5L = '탭 — 오늘 · 꾀 · 회사 · 멈춤 · 일지 · 정산', PAGE3 = ['sonja', 'kkoe', 'co', 'why', 'journal'], CUR3 = [0, 1, -1, 3, 4]; // 회사 쪽은 탭 밖(켜진 탭 0) · 탭 여섯(주문 1120-1220 — 「회사」 탭 = 여러 꾀가 고른 회사 · 셋째)
    const FOOTW = JSON.stringify([['/su/privacy.html', '개인정보 처리방침'], ['/next/?su=back#/help', '고객센터']]);
    await open(p, '#/');
    const seen = [], STEPS9 = FC ? [0, 1, 2, 3, 4] : [0, 1, 3, 4]; // 꾀가 고른 곳이 없는 날(꾀 칸 자료 없음)은 꾀 → 「왜 사?」로 바로(회사 화면을 건너뜀)
    for (const k of STEPS9) {
      await p.waitForTimeout(150);
      if (k <= 4) { // 손자병법 판 다섯 화면(오늘 · 꾀 · 회사 · 「왜 사?」 · 매매일지 — 주문 1116-0300 옛 틀 지움)
        const sj = await shapeSj();
        check(!!sj && sj.page === PAGE3[k], W + '⑨ ' + (k + 1) + '번째 화면 = 손자병법 판 ' + PAGE3[k] + '(main.sj-page · 주문 1115-1706 · 1115-2328)', JSON.stringify(sj?.page ?? null));
        if (!sj) break;
        seen.push(sj);
        check(sj.step.includes((k + 1) + ' / 5') && sj.stepL === (k + 1) + ' / 5 · ' + STEP5[k], W + '⑨ 걸음 표시 ' + (k + 1) + ' / 5 · 읽어 주기 「' + (k + 1) + ' / 5 · ' + STEP5[k] + '」 — ' + sj.h1, sj.step + ' · ' + sj.stepL);
        check(sj.prog.length === 5 && sj.prog.every((c, i) => c === (i === k ? 'sj-pcur' : i < k ? 'sj-pdone' : '')) && sj.progL === '다섯 화면 가운데 ' + (k + 1) + '번째', W + '⑨ 이야기 막대 점 다섯 · 지금 화면 ' + (k + 1) + ' — ' + sj.h1, JSON.stringify([sj.prog, sj.progL]));
        check(sj.order, W + '⑨ 쪽 차례 — ' + (k === 0 ? '표지 → 형세 보고 → 덜 잃은 꾀 차례 → 자세히 → 끝 줄' : k === 1 ? '머리 → 고르는 법 → 같은 땅 기록 → 오늘 닮은 곳 → 정산 → 앞뒤 꾀 → 끝 줄' : '머리 · 한 달 꺾은선 → 고른 꾀 → 사기 전에 멈춤 → 끝 줄') + ' — ' + sj.h1, sj.kids.join(' '));
        check(sj.lastIsSrc && JSON.stringify(sj.foot) === FOOTW, W + '⑨ 맨 아래 출처 · 조사 날짜 · 꼭 있어야 할 길 둘 — ' + sj.h1, JSON.stringify(sj.foot));
        check(sj.tabs.length === 6 && sj.tabs.map(t => t.t).join(' ') === TAB5 && sj.tabs.filter(t => t.cur).length === (CUR3[k] < 0 ? 0 : 1) && (CUR3[k] < 0 || sj.tabs[CUR3[k]].cur) && sj.tabsL === TAB5L,
          W + '⑨ 탭 여섯 오늘 · 꾀 · 회사 · 멈춤 · 일지 · 정산(주문 1115-2328 · 1120-1220 회사 탭) · ' + (CUR3[k] < 0 ? '회사 쪽은 켜진 탭 0' : '「' + TAB5.split(' ')[CUR3[k]] + '」 켜짐') + ' — ' + sj.h1, JSON.stringify(sj.tabs) + ' ' + sj.tabsL);
        if (k === 0) { check(sj.moreShut && sj.ess === 3, W + '⑩ 「자세히」는 눌러야 열림 · 그 안 본질 세 줄 — ' + sj.h1, JSON.stringify({shut: sj.moreShut, ess: sj.ess})); check(sj.art, W + '⑪ 표지 붓 글씨 그림이 열림', '');
          const tc = await p.evaluate(() => { const c = document.querySelector('#su main.sj-page > section.sj-cover > .sj-tc:not(.sj-tc0)'), go = c?.querySelector('a.sj-tcgo'), r = go?.getBoundingClientRect(), t = document.querySelector('#su .sj-tabs')?.getBoundingClientRect(), pm = c?.parentElement?.querySelector(':scope > .sj-pm')?.getBoundingClientRect();
            return {has: !!c, go: go?.getAttribute('href') ?? null, low: r ? Math.round(r.bottom + scrollY) : null, tabs: t ? Math.round(t.top) : null, top: c && pm ? c.getBoundingClientRect().bottom <= pm.top + 1 : false, safe: (c?.querySelector('.sj-tcs')?.textContent ?? '').includes('앞날을 맞히지 않고'), red: c ? [...c.querySelectorAll('*')].filter(e => { const m = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return m && +m[1] > 170 && +m[2] < 90 && +m[3] < 90; }).length : -1}; });
          check(tc.has && /^#\/q(\/[0-9A-Z]{6})?$/.test(tc.go ?? '') && tc.low != null && tc.tabs != null && tc.low <= tc.tabs && tc.top && tc.safe && tc.red === 0, W + '⑫ 오늘 한 장(주문 1120-0001 · m08 깃털 한 장 · d07 멈춤 문) — 첫 화면 맨 위 · 「사기 전에 멈춰요」 큰 단추가 아래 탭 위 · 앞날 아님 한 줄 · 빨강 0', JSON.stringify(tc));
          // ⑫-2 세 태세(주문 1120-0728 · 사장님 2026-11-20(마카오) 07:28 「공격형 지략 그리고 보편적 지략 그리고 수비형 지략을 전술화하여 …」 · 07:32 「맞아」) — 이 검사가 su21.json sun.rank 로 따로 다시 셈(화면 코드 su-stance.js 를 부르지 않음)
          //   수비형 = win3 첫째(없으면 덜 잃은 차례 맨 위) · 공격형 = 남은 꾀 가운데 평균 가장 높은 꾀(평균 0 넘고 · 아무렇게나 일곱보다 더 자주 잃지 않은 꾀) · 보편형 = 남은 꾀 가운데 잃은 몫 차례 + 평균 차례가 가장 작은 꾀 · 센 날 minN 아래는 뺌
          //   줄 차례는 늘 수비 → 보편 → 공격(수익 순위 아님) · 줄마다 가장 나쁜 날 → 잃은 날 → 평균(모두 같은 글씨 크기 · 잃는 쪽 먼저) · 없으면 「억지로 채우지 않았어요」 · 「%」 0 · 부추기는 말 0
          const F = v => typeof v === 'number' && Number.isFinite(v), won = v => (100 * (1 + v)).toFixed(1).replace(/\.0$/, '') + '원', SS = T0?.sun ?? null;
          const want = (() => { if (!SS || SS.rule !== 'sun-v1' || !Array.isArray(SS.rank)) return null;
            const mn = Number.isInteger(SS.minN) && SS.minN > 0 ? SS.minN : Number.isInteger(SS.win3?.minN) && SS.win3.minN > 0 ? SS.win3.minN : 20;
            const ok = SS.rank.filter(r => /^g\d\d$/.test(r?.k ?? '') && Number.isInteger(r.n) && r.n >= mn && Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && F(r.avg) && F(r.worst) && r.worst <= r.avg);
            if (!ok.length) return {none: true};
            const pos = new Map(ok.map((r, i) => [r.k, i])), R = new Map(ok.map(r => [r.k, r]));
            const def = (SS.win3?.rule === 'win3-v1' && Array.isArray(SS.win3.ks) ? SS.win3.ks : []).find(k => pos.has(k)) ?? ok[0].k;
            const cand = ok.filter(r => r.k !== def && (!F(r.exp) || r.lose <= r.exp)), lr = r => r.lose / r.n;
            let att = null; for (const r of cand) if (r.avg > 0 && (!att || r.avg > att.avg || (r.avg === att.avg && lr(r) < lr(att)))) att = r;
            const rest = cand.filter(r => r !== att), L = [...rest].sort((a, b) => lr(a) - lr(b) || pos.get(a.k) - pos.get(b.k)), A = [...rest].sort((a, b) => b.avg - a.avg || pos.get(a.k) - pos.get(b.k));
            let mid = null, best = Infinity; for (const r of rest) { const s = L.indexOf(r) + A.indexOf(r); if (s < best) { best = s; mid = r; } }
            return {none: false, ks: [def, mid?.k ?? null, att?.k ?? null], R}; })();
          const sg = await p.evaluate(() => { const c = document.querySelector('#su main.sj-page > section.sj-cover > .sj-tc:not(.sj-tc0)'); if (!c) return null;
            const t = e => (e?.textContent ?? '').replace(/\s+/g, '');
            return {rule: c.getAttribute('data-stance'), text: c.innerText, rows: [...c.querySelectorAll(':scope > ol.sj-tcst > li.sj-ts')].map(li => ({st: li.getAttribute('data-st'), k: li.getAttribute('data-k'), empty: li.classList.contains('sj-ts0'), href: li.querySelector('a.sj-tsa')?.getAttribute('href') ?? null, txt: t(li),
              lines: [...li.querySelectorAll('.sj-tsv > span')].map(s => ({c: s.className, t: t(s), fs: parseFloat(getComputedStyle(s.querySelector('.sj-tsk') ?? s).fontSize), bfs: parseFloat(getComputedStyle(s.querySelector('b') ?? s).fontSize)}))}))}; });
          const lineOk = (row, r) => row.lines.length === 3 && row.lines.map(l => l.c).join(' ') === 'sj-tsw sj-tsl sj-tsm'
            && row.lines[0].t === ('가장 나쁜 날' + won(r.worst)).replace(/\s+/g, '') && row.lines[1].t === ('잃은 날' + r.n + '번 중 ' + r.lose + '번').replace(/\s+/g, '') && row.lines[2].t === ('평균' + won(r.avg)).replace(/\s+/g, '')
            && row.lines.every(l => l.fs === row.lines[0].fs && l.bfs === row.lines[0].bfs && l.fs >= 16.95) && row.href === '#/k/' + r.k;
          const stOk = !!sg && (!want ? !sg.rule && !sg.rows.length : want.none ? sg.rule === 'stance3-v1' && !sg.rows.length && /센 날이 모자라/.test(sg.text)
            : sg.rule === 'stance3-v1' && sg.rows.map(r => r.st).join(' ') === 'def mid att' && sg.rows.every((row, i) => { const k = want.ks[i];
              return k ? !row.empty && row.k === k && lineOk(row, want.R.get(k)) : row.empty && row.txt.includes('억지로채우지않았어요'); }))
            && !/%/.test(sg.text) && !/사세요|사라|추천|1등|대박|급등|수익률/.test(sg.text);
          check(stOk, W + '⑫-2 세 태세(주문 1120-0728 · 샘플 s04 · s01 · d02) — 수비 → 보편 → 공격 · 이 검사가 sun.rank 로 다시 센 꾀와 같음 · 줄마다 가장 나쁜 날 → 잃은 날 → 평균 같은 크기 · 없으면 억지로 채우지 않음 · 「%」 0',
            JSON.stringify({want: want ? (want.none ? 'none' : want.ks) : null, got: sg ? {rule: sg.rule, rows: sg.rows.map(r => [r.st, r.k, r.empty, r.lines.map(l => l.t + ':' + l.fs + '/' + l.bfs).join('|')])} : null}).slice(0, 600));
          // ⑫-3 대나무 숲(주문 1120-1422 · 사장님 2026-11-20(마카오) 14:22 「여기 첫화면에 멋진 대나무밭 그림 …」) — 오늘 한 장 뒤 그림 · 글 뒤(누를 수 없음) · 카드 안 · 움직임 줄이기면 멈춤은 CSS
          await p.waitForSelector('#su main.sj-page > section.sj-cover > .sj-tc:not(.sj-tc0)', {timeout: 6000}).catch(() => {});
          const bb = await p.evaluate(() => { const c = document.querySelector('#su main.sj-page > section.sj-cover > .sj-tc:not(.sj-tc0)'), b = c?.querySelector(':scope > .sj-tcbam'); if (!c) return {none: true, ph: !!document.querySelector('#su .sj-tc.sj-tc0')}; if (!b) return null;
            const cs = getComputedStyle(b), r = c.getBoundingClientRect(), q = b.getBoundingClientRect(), g = b.querySelector('svg.sj-bam');
            return {first: c.firstElementChild === b, hid: b.getAttribute('aria-hidden'), pos: cs.position, z: cs.zIndex, pe: cs.pointerEvents, inL: q.left >= r.left - 0.5, inR: q.right <= r.right + 0.5, n: g?.querySelectorAll('path').length ?? 0, txt: (g?.textContent ?? '').trim().length,
              glow: getComputedStyle(c.querySelector(':scope > .sj-tck') ?? c).textShadow}; }); // 머리 한 줄(오늘 시장 · ○월 ○일)은 늘 있음 — 형세 자료가 없는 날도
          check(!!bb && (bb.none ? bb.ph : bb.first && bb.hid === 'true' && bb.pos === 'absolute' && bb.z === '-1' && bb.pe === 'none' && bb.inL && bb.inR && bb.n >= 100 && bb.txt === 0 && /252, 254, 253/.test(bb.glow ?? '')), // 자료를 받기 전 자리 카드(sj-tc0)만 있으면 그림 없음이 맞음
            W + '⑫-3 대나무 숲(주문 1120-1422) — 오늘 한 장 뒤 글 속 그림 · 글 뒤(누를 수 없음 · 읽지 않음) · 카드 안 · 글자 0 · 글에 종이빛 테두리', JSON.stringify(bb).slice(0, 300)); } // ⑫ · ⑫-2 · ⑫-3 은 첫 쪽(k 0)에서만 — 다른 쪽엔 오늘 한 장이 없음(미리 보기 2/11 의 실패 셋 = 꾀 · 「왜 사?」 · 일지 쪽에서 돌았던 것)
        check(sj.old === 0, W + '⑪ 옛 꾸밈(그림 칸 · 무하 장식 · 옛 머리 · 탭 · 막대) 0 — 주문 1115-1706 「기존에 있던것 단 한나도 디자임 사용하지말고」 — ' + sj.h1, String(sj.old));
        check(sj.sealsOk, W + '⑪ 한눈 판별 — 회사 단추의 한 달 표(내림 · 오름 · 같음) = 그 회사 한 달 방향 · 내림 도장 = 짙은 남빛 찬 도장 + 흰 글(샘플 사) — ' + sj.h1, sj.seals.length + ' · ' + JSON.stringify(sj.sunSeal));
        check(sj.red === 0, W + '⑪ 빨강 글 0(한국에서 빨강은 오름 — 내림을 빨강으로 읽지 않게) — ' + sj.h1, String(sj.red));
        check(Number.isFinite(sj.hard), W + '⑩ 어려운 낱말 셈 — ' + sj.h1, String(sj.hard) + ' ' + sj.hardWords);
        const nxW = k === 0 ? ['#/k/' + FK, '2 / 5'] : k === 1 ? (FC ? ['#/c/' + FC.code, '3 / 5'] : ['#/q', '4 / 5']) : k === 2 ? [FC ? '#/q/' + FC.code : '#/q', '4 / 5'] : k === 3 ? ['#/j', '5 / 5'] : ['#/', '1 / 5'];
        check(sj.next === nxW[0] && sj.nextK === nxW[1], W + '⑨ 다음 단추 = ' + nxW[1] + ' ' + nxW[0] + ' — ' + sj.h1, JSON.stringify([sj.next, sj.nextK]));
        pageRules(await measure(p), W + '⑨ ' + (k + 1) + '번째 화면 ' + sj.h1);
        if (k === 4) continue; // 끝 화면(매매일지) — 다음 단추는 처음으로
        const a = await p.$('#su .sj-next'); if (!a) { check(false, W + '⑨ 다음 단추 — ' + sj.h1, ''); break; } await a.click(); await settle(p); await p.waitForTimeout(400);
        continue;
      }
      const m = await shape(); seen.push(m); // 「왜 사?」 · 매매일지 = 옛 틀 그대로(신문 짜임 잣대)
      check(m.step.includes((k + 1) + ' / 5'), W + '⑨ 걸음 표시 ' + (k + 1) + ' / 5 — ' + m.h1, m.step);
      check(m.stepL === (k + 1) + ' / 5 · ' + STEP5[k], W + '⑨ 걸음 이름(읽어 주기) ' + (k + 1) + ' / 5 · ' + STEP5[k], m.stepL);
      check(m.order, W + '⑨ 신문 짜임 — 큰 값 한 줄 → 큰 그림 → 설명 두 줄 → 「자세히」(닫힘 · 중간 값은 그 안) → 출처 — ' + m.h1, '');
      check(m.heroShare >= 70, W + '⑪ 움직이는 그림이 화면의 70% 넘게(390 × 844 · 머리 줄 아래 · 다음 단추 위로 자름) — ' + m.h1, m.heroShare + '%');
      check(m.outside.every(o => o.box !== 'other') && m.twoN <= 2, W + '⑪ 그림 밖 글은 큰 값 · 설명 두 줄 · 출처뿐 — ' + m.h1, JSON.stringify(m.outside.filter(o => o.box === 'other')).slice(0, 200) + ' · 설명 ' + m.twoN + '줄');
      check(m.labels >= 3, W + '⑪ 이름과 숫자는 그림 안 이름표 — ' + m.h1, '이름표 ' + m.labels);
      check(m.mucha.length >= 5 || m.clean, W + '⑪ 무하 요소 다섯 가지 넘게(잡스 판은 덜어냄 — 주문 1532) — ' + m.h1, m.mucha.join(' '));
      check(m.lastIsSrc, W + '⑨ 맨 아래 출처와 조사 날짜 — ' + m.h1, '');
      check(JSON.stringify(m.foot) === FOOTW, W + '⑨ 맨 아래 꼭 있어야 할 길 둘(개인정보 처리방침 · 고객센터) — ' + m.h1, JSON.stringify(m.foot));
      check(m.moving >= 1, W + '⑨ 큰 그림이 움직임 — ' + m.h1, '움직임 ' + m.anim);
      check(m.tiles.length === 6 && m.tiles.every(t => (t.need ? /확인 필요$/.test(t.v) : t.v && !t.v.includes('확인 필요'))), W + '⑨ 큰 값의 여섯 칸(빈 칸 = 「확인 필요」) — ' + m.h1, JSON.stringify(m.tiles).slice(0, 160));
      check(m.vals === m.valsSix, W + '⑨ 중간 값 · 자세한 값마다 여섯 칸 — ' + m.h1, m.valsSix + ' / ' + m.vals);
      const curW = k === 3 ? 3 : 4; // 「왜 사?」 = 멈춤 · 매매일지 = 일지(탭 여섯 — 주문 1120-1220)
      check(m.tabs.length === 6 && m.tabs.map(t => t.t).join(' ') === TAB5 && m.tabs.filter(t => t.cur).length === 1 && m.tabs[curW].cur && m.tabsL === TAB5L, W + '⑨ 탭 다섯(옛 틀도 같은 다섯 · 주문 1115-2328) · 「' + TAB5.split(' ')[curW] + '」 켜짐 — ' + m.h1, JSON.stringify(m.tabs) + ' ' + m.tabsL);
      check(m.means.vals >= 1 && m.means.vals === m.means.with, W + '⑩ 숫자마다 「그래서」 한 줄 — ' + m.h1, m.means.with + ' / ' + m.means.vals);
      check(m.pro.has && !m.pro.open && m.pro.rows >= 3, W + '⑩ 전문가용 자세히 — 눌러야 열림 — ' + m.h1, JSON.stringify(m.pro));
      check(Number.isFinite(m.hard), W + '⑩ 어려운 낱말 셈 — ' + m.h1, String(m.hard) + ' ' + m.hardWords);
      check(m.smap, W + '⑩ 여섯 칸 지도 — ' + m.h1, '');
      check(m.orn === 0, W + '⑩ 장식이 글을 가리지 않음(겹친 넓이 0) — ' + m.h1, m.orn + ' · 장식 ' + m.ornN);
      check(k === 3 ? m.next === '#/j' : m.next === '#/', W + '⑨ 다음 단추 — ' + (k === 3 ? '내 매매일지' : '끝 화면은 처음으로(#/ · 옛 「친구에게」는 지움)') + ' — ' + m.h1, String(m.next));
      pageRules(await measure(p), W + '⑨ ' + (k + 1) + '번째 화면 ' + m.h1);
      if (k < 4) { const a = await p.$('#su .su-next'); if (!a) { check(false, W + '⑨ 다음 단추 — ' + m.h1, ''); break; } await a.click(); await settle(p); await p.waitForTimeout(300); }
    }
    check(seen.length === STEPS9.length && new Set(seen.map(m => m.h1)).size === STEPS9.length && seen[seen.length - 1]?.h1 === '내 매매일지', W + '⑨ 다음 단추로 끝까지(다섯 화면 · 끝 = 내 매매일지 — 주문 1115-2328 오늘 → 꾀 → 회사 → 왜 사? → 매매일지 · 꾀가 고른 곳이 없으면 회사를 건너뜀)', seen.map(m => m.h1).join(' → '));
    R.m.path = seen.map(m => (m.sonja ? {h1: m.h1, page: m.page, kids: m.kids, seals: m.seals.length, hard: m.hard, hardWords: m.hardWords} : {h1: m.h1, heroShare: m.heroShare, share: m.share, outside: m.outside.length, two: m.twoN, labels: m.labels, mucha: m.mucha, anim: m.anim, need: m.tiles.filter(t => t.need).length, means: m.means, pro: m.pro.rows, hard: m.hard, glossed: m.glossed, orn: m.orn, ornN: m.ornN}));
    R.m.hard = seen.reduce((a, m) => a + (Number.isFinite(m.hard) ? m.hard : 0), 0); R.m.hardWords = [...new Set(seen.flatMap(m => m.hardWords.split(',').filter(Boolean)))];
  }
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' | '));
  // 없는 회사 — 「찾지 못했어요」 한 줄과 처음으로(빈 화면 아님 · 없는 회사 자료 404 는 일부러 — 오류 셈 뒤)
  await open(p, '#/c/ZZZZZZ'); check((await p.evaluate(() => document.body.innerText)).includes('찾지 못했어요'), W + '없는 회사', '');
  await ctx.close();
}
{ // 느린 4G · CPU 4배 느리게(흰 첫 화면 검사 check_white ③ 과 같은 셈) — 첫 화면이 된 수르 두 길 처음 쪽 가장 큰 그림 2.5초 안
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8}); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  await p.addInitScript(() => { window.__v = {lcp: 0, cls: 0, pic: 0}; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true}); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({type: 'layout-shift', buffered: true});
    /* 무하 큰 그림(svg)이 칠해진 때 — 가장 큰 칠함(LCP)은 글 문단을 잴 때가 많아 그림을 따로 잼(주문 1023 [1] 6 「첫 그림이 느린 휴대폰에서 2.5초 안」) */
    const seen = () => { const art = document.querySelector('#su main.sj-page img.sj-art'); // 손자병법 첫 쪽(주문 1115-1706) — 큰 그림 = 표지 붓 글씨 그림(받아 칠해진 때)
      if (art) { const done = () => requestAnimationFrame(() => requestAnimationFrame(() => { if (!window.__v.pic) window.__v.pic = performance.now(); })); if (art.complete && art.naturalWidth) done(); else art.addEventListener('load', done, {once: true}); return true; }
      const f = document.querySelector('#su main > .su-hero'); const g = f && !f.hasAttribute('data-wait') && f.querySelector('svg'); if (!g) return false; requestAnimationFrame(() => requestAnimationFrame(() => { if (!window.__v.pic) window.__v.pic = performance.now(); })); return true; };
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
  // ⑫-4 산수 뒤 배경(주문 1120-1449 · 사장님 2026-11-20(마카오) 14:49 「이배경을 손자병법 싸이트 전체 뒤 배경으로 하라」) — 한 폭 산수(/su/su-bg.svg)가 모든 손자병법 쪽 뒤에
  //   화면에 붙은 한 장(#su::after · fixed · z -1 · 누를 수 없음) · #su 가 쌓임 한 겹(position relative · z 0 — 글 뒤 · 쪽 바탕 위) · 쪽 바탕 그림(종이 결 · 옥빛 물)은 걷음
  //   글이 산수 위에 바로 앉지 않음 — 서랍(details)을 모두 열고 main 안 보이는 글마다 위로 올라가며 종이 바탕(불투명 85 넘게 또는 그림 바탕)을 찾음 · 없으면 그 글은 산수 위에 앉은 것
  const bgLook = p => p.evaluate(async () => {
    const su = document.getElementById('su'), a = getComputedStyle(su, '::after'), s = getComputedStyle(su), m = document.querySelector('#su main.sj-page');
    for (const d of document.querySelectorAll('#su main.sj-page details')) d.open = true;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const solid = e => { for (let x = e; x && x !== su; x = x.parentElement) { const c = getComputedStyle(x); if (c.backgroundImage !== 'none') return true; const v = (/rgba?\(([^)]+)\)/.exec(c.backgroundColor)?.[1] ?? '').split(',').map(Number); if (v.length === 3 || (v.length === 4 && v[3] >= 0.85)) return true; } return false; };
    const bare = []; const tw = document.createTreeWalker(m ?? document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const e = n.parentElement; if (!n.textContent.trim() || !e || e.closest('svg, [aria-hidden="true"]')) continue; const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue; if (!solid(e)) bare.push(n.textContent.trim().slice(0, 12)); }
    let file = null; try { const res = await fetch('/su/su-bg.svg', {cache: 'no-store'}); const t = res.ok ? await res.text() : ''; file = {ok: res.ok, type: res.headers.get('content-type') ?? '', len: t.length, text: /<text/.test(t), script: /<script|javascript:/i.test(t), ext: /(?:href|src)="https?:/.test(t)}; } catch (e) { file = {err: String(e).slice(0, 80)}; }
    return {c: a.content, pos: a.position, z: a.zIndex, pe: a.pointerEvents, img: /\/su\/su-bg\.svg/.test(a.backgroundImage), size: a.backgroundSize, inset: [a.top, a.left].join(' '), suPos: s.position, suZ: s.zIndex, mainImg: m ? getComputedStyle(m).backgroundImage : null, bare: bare.slice(0, 5), bareN: bare.length, file};
  });
  const bgOk = g => g.c === '""' && g.pos === 'fixed' && g.z === '-1' && g.pe === 'none' && g.img && g.size === 'cover' && g.inset === '0px 0px' && g.suPos === 'relative' && g.suZ === '0' && g.mainImg === 'none' && g.bareN === 0
    && !!g.file?.ok && /svg/.test(g.file.type) && g.file.len > 1000 && !g.file.text && !g.file.script && !g.file.ext;
  const BGW = '⑫-4 산수 뒤 배경(주문 1120-1449) — 한 폭 산수가 화면에 붙어 글 뒤에(누를 수 없음) · 쪽 바탕 그림 걷음 · 서랍을 열어도 산수 위에 바로 앉은 글 0 · 그림 속 글자 0';
  R.m.white = {};
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', colorScheme: scheme});
    const p = await ctx.newPage();
    { // 손자병법 첫 쪽(주문 1115-1706 → 1117-1049 샘플 다 「창호지 한 장」) — 밝은 한지 #F8F4EB 바탕 · 떠 있는 먹 탭 막대 #15120E · 큰 제목 먹 글 대비 7 넘게 · 둘레 겹테 · 무하 꾸밈 0 · 휴대폰 맨 위 띠 한지 색 · 밝은 · 어두운 휴대폰 같은 판
      const PAPER = 'rgb(243, 248, 246)', INKBAR = 'rgb(252, 254, 253)'; // 주문 1119-2026 — 수채화 종이 #F3F8F6 · 아래 탭 흰 판 #FCFEFD(샘플 첫째 · 둘째 합친 판)
      await open(p, '#/'); await p.waitForTimeout(2200);
      const w = await p.evaluate(() => { const bg = e => (e ? getComputedStyle(e).backgroundColor : 'none'), h1 = document.querySelector('#su h1');
        return {sj: !!document.querySelector('#su main.sj-page'), body: bg(document.body), top: bg(document.querySelector('#su .sj-top')), dock: bg(document.querySelector('#su .sj-dock')), tabs: bg(document.querySelector('#su .sj-tabs')),
          h1: h1 ? getComputedStyle(h1).color : '', frame: getComputedStyle(document.getElementById('su'), '::before').content, orn: document.querySelectorAll('#su .su-orn, .su-corners, .su-sky').length,
          tc: [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.getAttribute('content'))}; });
      R.m.white[scheme + ' #/'] = w;
      const W1 = '⑫ 손자병법 한지 판(' + (scheme === 'dark' ? '어두운' : '밝은') + ' 휴대폰 · #/ · 주문 1115-1706) ';
      check(w.sj && w.body === PAPER && w.top === PAPER && w.dock === 'rgba(0, 0, 0, 0)' && w.tabs === INKBAR, W1 + '— 바탕 · 맨 위 단추 줄 밝은 한지 · 듣기와 다음은 떠 있는 알약(막대 바탕 없음) · 아래 탭 떠 있는 먹 막대(주문 1117-1049 샘플 다)', JSON.stringify(w).slice(0, 300));
      check(con(w.h1, PAPER) >= 7, W1 + '— 큰 제목 먹 글 대비 7 넘게', w.h1);
      check((w.frame === 'none' || w.frame === 'normal') && w.orn === 0, W1 + '— 둘레 겹테 · 무하 꾸밈 · 뒷하늘 0', JSON.stringify({frame: w.frame, orn: w.orn}));
      check(w.tc.length >= 1 && w.tc.every(c => c === '#F3F8F6'), W1 + '— 휴대폰 맨 위 띠 밝은 한지 색', w.tc.join(' '));
      { const g = await bgLook(p); check(bgOk(g), W1 + BGW, JSON.stringify(g).slice(0, 400)); }
    }
    for (const hh of ['#/k', '#/k/' + FK, ...(FC ? ['#/c/' + FC.code] : []), '#/r/t', '#/q', '#/j']) { // 주문 1115-2328 — 꾀 모음 · 꾀 · 회사 · 정산도 첫 쪽과 같은 한지 판(샘플 사) · 주문 1116-0300 — 「왜 사?」 · 매매일지도(옛 흰 판 · 옛 틀 지움)
      const PAPER = 'rgb(243, 248, 246)', INKBAR = 'rgb(252, 254, 253)'; // 주문 1119-2026 — 수채화 종이 #F3F8F6 · 아래 탭 흰 판 #FCFEFD(샘플 첫째 · 둘째 합친 판)
      await open(p, hh); await p.waitForTimeout(600);
      const w = await p.evaluate(() => { const bg = e => (e ? getComputedStyle(e).backgroundColor : 'none'), h1 = document.querySelector('#su h1');
        return {sj: !!document.querySelector('#su main.sj-page'), body: bg(document.body), top: bg(document.querySelector('#su .sj-top')), dock: bg(document.querySelector('#su .sj-dock')), tabs: bg(document.querySelector('#su .sj-tabs')),
          h1: h1 ? getComputedStyle(h1).color : '', frame: getComputedStyle(document.getElementById('su'), '::before').content, orn: document.querySelectorAll('#su .su-orn, .su-corners, .su-sky').length, old: document.querySelectorAll('#su .su-top, #su .su-tabs, #su .su-dock, #su main > .su-hero').length,
          cover: document.querySelectorAll('#su .sj-cover').length, tc: [...document.querySelectorAll('meta[name="theme-color"]')].map(m => m.getAttribute('content'))}; });
      R.m.white[scheme + ' ' + hh] = w;
      const W1 = '⑫ 손자병법 한지 판(' + (scheme === 'dark' ? '어두운' : '밝은') + ' 휴대폰 · ' + hh + ' · 주문 1115-2328) ';
      check(w.sj && w.body === PAPER && w.top === PAPER && w.dock === 'rgba(0, 0, 0, 0)' && w.tabs === INKBAR && w.old === 0 && w.cover === 0, W1 + '— 바탕 · 맨 위 단추 줄 밝은 한지 · 떠 있는 알약 · 떠 있는 먹 탭 막대(주문 1117-1049) · 옛 머리 · 탭 · 막대 0 · 표지는 첫 쪽에만', JSON.stringify(w).slice(0, 300));
      check(con(w.h1, PAPER) >= 7, W1 + '— 큰 제목 먹 글 대비 7 넘게', w.h1);
      check((w.frame === 'none' || w.frame === 'normal') && w.orn === 0, W1 + '— 둘레 겹테 · 무하 꾸밈 · 뒷하늘 0', JSON.stringify({frame: w.frame, orn: w.orn}));
      check(w.tc.length >= 1 && w.tc.every(c => c === '#F3F8F6'), W1 + '— 휴대폰 맨 위 띠 밝은 한지 색', w.tc.join(' '));
      { const g = await bgLook(p); check(bgOk(g), W1 + BGW, JSON.stringify(g).slice(0, 400)); }
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
// ⑭ 첫 페이지 줄마다 현재가(주문 1837)는 처음 쪽에 회사 줄이 없어(주문 1115-1843) 지움 · 될 듯 21곳(#/n)도 지움(주문 1115-2328) — 꾀 칸 회사 단추 꺾은선은 ㉔ · 회사 쪽 한 달 꺾은선은 ㉕
{ // ⑮ 장 중 현재가(주문 2011 · 사장님 2026-11-08 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 현재가가 바뀌게) — /api/price 답을 시험 값으로 바꿔 끼워 화면이 따라 바뀌는지
  //   오늘(판 다음 날) 장 중 값 → 그 칸 현재가 글 · data-px · data-live · 이름표 · 꺾은선(맨 앞 하루를 빼고 오늘 값을 끝에 = 21점 · 끝 점 = 받은 값 높이) · 날짜 글 「○월 ○일 오후 2시 31분 값이에요.」
  //   받은 값이 없는 칸은 그대로 · 함수가 없거나(404) 장 밖이면 아무것도 바꾸지 않음
  const T21 = await J('/su/data/su21.json'), N21x = await J('/su/data/su21-next.json').catch(() => null), day = T21?.asOf?.board ?? '2026-11-06';
  const h = [...['hot', 'money', 'bloom'].map(k => T21?.lists?.[k]?.[0]), ...['hotNext', 'moneyNext', 'bloomNext'].map(k => N21x?.lists?.[k]?.[0])].find(x => x && Array.isArray(x.c) && x.c.length === 21 && x.close > 0); // 엄격 셈(주문 0854)이면 불장이 빌 수 있음 — 첫 칸 회사
  const next = (() => { const d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 3); return d.toISOString().slice(0, 10); })();
  const P = h?.close ? Math.round(h.close * 1.031) : 0, NFk = new Intl.NumberFormat('ko-KR');
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'});
  const p = await ctx.newPage(); let mode = 'open', asked = 0;
  await p.route('**/api/price*', r => { asked++; if (mode === '404') return r.fulfill({status: 404, contentType: 'text/plain', body: ''});
    return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({schema: 'su-price-1', day: next, hhmm: '1431', status: mode, items: mode === 'shut' ? {} : {[h.code]: {p: P, t: next + 'T14:31'}}})}); });
  const cellOf = () => p.evaluate(code => { const a = document.querySelector(`#su main.sj-page a.sj-row[data-code="${code}"]`); if (!a) return null; // 손자병법 첫 쪽(주문 1115-1706) — 줄 a.sj-row · 꺾은선 path.sj-sp1 · 날짜 글 .sj-pxnote
    const pts = [...(a.querySelector('path.sj-sp1')?.getAttribute('d') ?? '').matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
    const other = document.querySelector(`#su main.sj-page a.sj-row:not([data-code="${code}"])`);
    return {px: a.getAttribute('data-px'), live: a.getAttribute('data-live'), t: [...a.querySelectorAll('b, span')].map(e => e.textContent), label: a.getAttribute('aria-label'), pts, dot: !!a.querySelector('circle.sj-spe'),
      note: document.querySelector('#su .sj-pxnote')?.textContent ?? '', otherLive: other?.getAttribute('data-live') ?? null};
  }, h?.code ?? '');
  // 주문 1115-1843 — 처음 쪽에는 회사 줄 · 1 · 2 · 3등이 없어 장 중 현재가를 받지 않음(받는 일 하나가 줄어 빨라짐 — 주문 1115-1836) · 회사 쪽 장 중 값은 아래 검사가 그대로 잼
  await open(p, '#/'); await p.waitForTimeout(1500);
  const c0 = await cellOf(); R.m.live = {asked, first: 'none'};
  check(asked === 0 && !c0, '⑮ 처음 쪽은 장 중 현재가를 받지 않음(회사 줄이 없음 — 병법 서른여섯만 · 주문 1115-1843)', JSON.stringify({asked, cell: !!c0}));
  for (const hh of ['#/k', '#/k/' + FK, ...(FC ? ['#/c/' + FC.code] : []), '#/r/t']) { await open(p, hh); await p.waitForTimeout(600); } // 주문 1115-2328 — 새 쪽도 그날 마지막 값만(장 중 값을 받지 않음 · 앞날을 맞히지 않는 지난 기록)
  check(asked === 0, '⑮ 꾀 모음 · 꾀 · 회사 · 정산 쪽도 장 중 현재가를 받지 않음(그날 마지막 값 · 주문 1115-2328)', JSON.stringify({asked}));
  R.m.live.sub = asked;
  await ctx.close();
}
{ // ⑯ 수르에서 넘어간 옛 쪽도 첫 페이지 판(주문 2011 · 사장님 2026-11-08 20:26 「아니 이것도 같이 작업해」 — 서른아홉 스승 · 로마 신처럼 수르에서 눌러 넘어간 옛 쪽)
  //   ?su=<묶음> 으로 연 옛 쪽: 밤 무대 판(clock) 뗌 · 바탕 · 위 막대 · 아래 수르 막대 흰색 · 금빛 테두리 0 · 맨 위 띠 흰색 · 화면을 크게 덮는 어두운 판 0 · 읽기 어려운 글(대비 3 아래) 0 — 밝은 · 어두운 휴대폰 둘 다
  //   옛 주소로 바로 온 손님도 같은 흰 판(주문 2250 · 22:50 「이것도 구슬로 해」) — 수르 막대만 없음 · 서른아홉 스승 · 로마 신은 읽는 종이 바탕 #FDF9F5(그 쪽 검사 「밝은 종이 바탕」)
  // 주문 1114-1306 ⑧ · ② — 지금 큐피트가 실제로 거는 옛 쪽만: 맨 위 「찾기」 · 친구에게(카톡 보내기 · 소개 영상 · 내 종목 · 진화) · 쪽마다 맨 아래(개인정보 처리방침 · 고객센터)
  //   옛 기능 쪽 #/g 에서만 가던 쪽(서른아홉 스승 · 로마 신 · 「왜 사?」 옛 판 · 편지 · 초대장)과 닫히는 급등 쪽은 뺌(옛 주소로 바로 온 손님 판은 아래 DIRECT 가 그대로 봄)
  // 주문 1116-0300(사장님 2026-11-16(마카오) 02:00 「예전 디자인은 모두 삭제 하고 손자병법에 맞게 처음부터 끝까지 깔끔하개」) — 손자병법에서 넘어간 옛 쪽은 손자병법 종이 판(바탕 · 위 · 아래 막대 #F1E3D3 · 창 위 띠 종이색) · 맨 위 「선물」도 손자병법 틀 안
  const ROUTES = ['/next/?su=guide#/find', '/next/?su=guide#/gift', '/next/?su=guest#/share', '/next/?su=stop#/me', '/next/?su=guide#/', '/next/?su=back#/jinhwa', '/next/?su=back#/help', '/hello.html?su=guest', '/su/privacy.html'];
  const WHITE = 'rgb(255, 255, 255)', PAPER = 'rgb(232, 241, 238)'; // 주문 1119-2026 — 넘어간 옛 쪽 종이도 수채화 #E8F1EE
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
  const okBg = c => c == null || c === WHITE || c === 'rgba(0, 0, 0, 0)', okPaper = c => c == null || c === PAPER || c === 'rgba(0, 0, 0, 0)';
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
      check(cl.includes('su-wrapped') && cl.includes('su-jobs') && !cl.includes('clock') && o.body === PAPER && okPaper(o.view) && okPaper(o.top) && o.bar === PAPER && (o.frame === 'none' || o.frame === 'normal') && o.tc.length > 0 && o.tc.every(c => c === '#E8F1EE') && o.darkMax <= 0.12 && o.lowN === 0,
        '⑯ 손자병법에서 넘어간 옛 쪽도 손자병법 종이 판(' + scheme + ' · ' + u + ') — 밤 판 뗌 · 바탕 · 위 · 아래 막대 종이색 · 창 위 띠 종이색 · 금빛 테두리 0 · 어두운 판 0 · 흐린 글 0', JSON.stringify(o).slice(0, 400));
    }
    await ctx.close();
  }
  // 옛 주소로 바로 온 손님도 첫 페이지 판(주문 2250 · 사장님 2026-11-08 22:50 「이것도 구슬로 해」) — 밤 판 0 · 흰 바탕 · 위 막대 · 옛 아래 단추 흰색 · 수르 틀(아래 수르 막대)은 없음 · 어두운 판 0 · 흐린 글 0
  const DIRECT = ['/next/#/sage', '/next/#/roman', '/next/#/why', '/next/#/', '/next/#/jinhwa', '/hello.html', '/letter.html', '/invite.html', '/privacy.html']; // 닫히는 급등 쪽(/next/#/surge)은 뺌(주문 1114-1306 ②)
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
        '⑯ 옛 주소로 바로 온 손님도 첫 페이지 판(' + scheme + ' · ' + u + ') — 밤 판 0 · 바탕 · 위 막대 · 옛 아래 단추 흰색 · 손자병법 막대 없음 · 어두운 판 0 · 흐린 글 0', JSON.stringify({...o, tabs}).slice(0, 400));
    }
    await ctx.close();
  }
}
// ⑰ 「왜?」 쪽 · ⑳ 엄격 셈 · ⑲ 한국 시장 일곱 · 투자자 열하나 · ⑱ 옛 회사 쪽 장 중 꺾은선 · ㉑ 1 · 2 · 3등 달력 · ㉒ 조용한 힘 — 그 쪽들을 지움(주문 1115-2328 · 옛 고리는 ⑨ 지운 쪽 검사가 첫 쪽으로 감을 잼)
/** 돈 셈 한눈에(주문 1112-1304 · 사장님 2026-11-12 13:04 「지금까지 총 매수한 금액이 얼마고 그담에 날짜별로 매수한 금액이 얼마여 가지고 순실이나 수익이 어떻게 됐는지 … 바보도 알 수 있게끔」)
 *  장부 하나를 이 검사가 따로 셈(화면 코드 site/su/su-book.js 를 쓰지 않음): 산 셈마다 산 돈(산 값 × 주 수) · 지금(산 날부터 값 줄 맨 끝 값 × 주 수) · 날짜마다 더함 · 다섯 날 앞은 달마다 더함 · 모두
 *  돈 글은 화면과 맞대기에만 씀 — 결과 파일에는 맞음 · 틀림 · 날 · 수만(명령문 [4] 5 「수익률은 보내지 마라」 · 결과는 저장소에 올라감) */
const NFm = new Intl.NumberFormat('ko-KR'), DAYm = /^\d{4}-\d{2}-\d{2}$/, WDm = ['일', '월', '화', '수', '목', '금', '토'];
const wonM = v => { const a = Math.round(Math.abs(v)), e = Math.floor(a / 1e8), m = Math.floor((a % 1e8) / 1e4), r = a % 1e4; return [e ? NFm.format(e) + '억' : '', m ? NFm.format(m) + '만' : '', r || (!e && !m) ? NFm.format(r) : ''].filter(Boolean).join(' ') + '원'; };
const movedM = v => (Math.round(v) > 0 ? wonM(v) + ' 늘었어요' : Math.round(v) < 0 ? wonM(v) + ' 줄었어요' : '그대로예요');
const hundM = (now, buy) => { const x = 100 * now / buy, a = Math.round(x * 10) / 10, t = a === 100 && now !== buy ? Math.round(x * 100) / 100 : a; return '100원이 ' + t.toLocaleString('ko-KR', {maximumFractionDigits: 2}) + '원'; };
const mdM = d => +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일', SHM = {up: '▲', dn: '▼', eq: '―', one: '○'};
{ // ㉓ 정산(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야 거기에 일 이 삼 등 매일 사
  //   그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」 — docs/design/settle-2026-11-12/order-1728.txt)
  //   가) 자료 su/data/su21-settle.json — 꼴 · 여덟 묶음 차례 · 산 셈 줄(날 · 묶음 · 번호 · 산 값) · 같은 날 같은 묶음 같은 회사 한 번 · 지금 = 그 회사 판 날까지 값
  //       · 오늘 판(board.json) 날 산 값 · 지금 = 판 마지막 값 · 1 · 2 · 3등 = 달력 장부(su21-book.json) 날 · 회사 · 값 그대로
  //   나) #/r/t(390 · 320) — 이 검사가 자료에서 따로 셈: 맨 위 「지금까지」 · 묶음마다 여덟 줄(보이는 차례 SHOW) · 모두 = 맨 위
  //       · 주문 1113-1623(「세분화 할 필요 없이 큰값으로만」 · 「맞아」) — 업종 · 회사 표 0 · 묶음 줄은 이름 · 산 돈 · 늘었나 줄었나만(밑 작은 줄 0)
  //       · 아래 탭 정산 켜짐 · 쪽 규칙 · 「%」 · 영어 0(낱말 풀이 빼고) · 화면 오류 0 — 결과 파일에는 맞음 · 틀림 · 수만(돈 글 0)
  const ST = await J('/su/data/su21-settle.json').catch(() => null), BDs = await J('/data/atlas11/view/board.json').catch(() => null), BKs = await J('/su/data/su21-book.json').catch(() => null);
  // 주문 1113-2224 — 여덟 뒤에 손자병법 서른여섯 꾀(g01 ~ g36 · su21_s36.py 차례) · 여덟과 따로 셈(맨 위 「지금까지」 · 「묶음마다」 = 여덟 · 「서른여섯 꾀」 표 = 서른여섯 · 수익률 높은 차례)
  //   (주문 1113-2033 특징 열하나는 이 주문으로 뺌 — 자료 · 쪽에 t_ 묶음 0)
  const S36s = Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0'));
  // 주문 1114-0802 — 맨 뒤에 겹친 곳(ovl · 그날 첫 화면 마흔세 묶음 가운데 세 묶음 이상에 든 회사 · 날마다 곳 수가 다름) · 여덟 · 서른여섯과 따로 셈(표 하나 · 줄 하나)
  const KS = ['top3', 'hot', 'bloom', 'money', 'quiet', 'hotNext', 'bloomNext', 'moneyNext', ...S36s, 'ovl'], DAYs = /^\d{4}-\d{2}-\d{2}$/, CODEs = /^[0-9A-Z]{6}$/;
  const KNAME = {top3: '1 · 2 · 3등', hot: '불장', bloom: '꽃이 될 곳', money: '돈이 몰리는 곳', quiet: '조용한데 힘이 모이는 곳', hotNext: '불장이 될 듯', bloomNext: '꽃이 될 듯', moneyNext: '돈이 몰릴 듯',
    g01: '몰래 바다 건너기', g02: '딴 데 쳐서 구하기', g03: '남의 칼 빌리기', g04: '쉬다가 치기', g05: '불난 틈 타기', g06: '동쪽 소리 서쪽 치기', g07: '없는 데서 만들기', g08: '몰래 다른 길 가기', g09: '강 건너 불 보기', g10: '웃음 속 칼', g11: '대신 쓰러지기', g12: '손에 걸린 양 끌기', g13: '풀 쳐서 뱀 놀래기', g14: '다시 살아나기', g15: '범을 산에서 끌어내기', g16: '잡으려고 놓아주기', g17: '벽돌 던져 옥 얻기', g18: '우두머리 잡기', g19: '솥 밑 장작 빼기', g20: '흐린 물 고기 잡기', g21: '허물 벗기', g22: '문 닫고 도둑 잡기', g23: '먼 데 사귀고 가까운 데 치기', g24: '길 빌려 치기', g25: '기둥 바꾸기', g26: '빗대어 꾸짖기', g27: '어리석은 척하기', g28: '지붕 올리고 사다리 치우기', g29: '나무에 꽃 달기', g30: '손님이 주인 되기', g31: '미인 꾀', g32: '빈 성 꾀', g33: '적 첩자 쓰기', g34: '제 몸 다치기', g35: '고리 잇기', g36: '달아나기', ovl: '겹친 곳'};
  const SHOWs = ['top3', 'hot', 'hotNext', 'money', 'moneyNext', 'bloom', 'bloomNext', 'quiet']; // 보이는 차례(주문 1113-1623 — 사장님 말씀 차례)
  const okD = !!ST && ST.schema === 'su21-settle-1' && ST.qty === 10 && JSON.stringify(ST.kinds) === JSON.stringify(KS) && Array.isArray(ST.buys) && ST.buys.length > 0 && DAYs.test(ST.asOf ?? '');
  // 주문 1112-2042 — 첫날 = 11월 12일 판 · 그 전 산 셈 0 · 다시 센 지난 날 0
  check(okD && ST.start === SETTLE_START && ST.buys.every(b => b[0] >= ST.start) && (ST.replayTo == null || ST.replayTo >= ST.start), '㉓ 정산 첫날 ' + SETTLE_START + '(주문 1112-2042) — 그 전 산 셈 0 · 다시 센 지난 날 0',
    JSON.stringify({start: ST?.start ?? null, before: (ST?.buys ?? []).filter(b => b[0] < (ST?.start ?? SETTLE_START)).length, replayTo: ST?.replayTo ?? null}));
  const bad0 = [], seen = new Set();
  if (okD) for (const b of ST.buys) {
    const [d, ki, code, px] = b ?? [];
    if (!DAYs.test(d ?? '') || d > ST.asOf || !Number.isInteger(ki) || ki < 0 || ki >= KS.length || !CODEs.test(code ?? '') || !(Number.isFinite(px) && px > 0)) { bad0.push('꼴 ' + JSON.stringify(b).slice(0, 40)); continue; }
    const key = d + ki + code; if (seen.has(key)) bad0.push('겹침 ' + d + ' ' + KS[ki] + ' ' + code); seen.add(key);
    const nw = ST.now?.[code]; if (!Array.isArray(nw) || !(nw[0] > 0) || !DAYs.test(nw[1] ?? '') || nw[1] < d || nw[1] > ST.asOf) bad0.push('지금 ' + code);
    if (!Array.isArray(ST.co?.[code]) || typeof ST.co[code][0] !== 'string') bad0.push('이름 ' + code);
  }
  const per36 = new Map(); for (const [d, ki] of ST?.buys ?? []) if (ki >= 8 && ki < 8 + 36) per36.set(d + ki, (per36.get(d + ki) ?? 0) + 1); // 겹친 곳(ki 44)은 곳 수가 날마다 다름 — 일곱 잣대 밖
  if (okD && [...per36.values()].some(n => n > 7)) bad0.push('서른여섯 꾀 한 날 한 꾀 일곱 넘음');
  check(okD && !bad0.length, '㉓ 정산 자료 — 꼴 · 여덟 + 서른여섯 꾀 묶음 차례 · 산 셈 줄 · 같은 날 같은 묶음 같은 회사 한 번 · 꾀 하루 일곱까지 · 지금 값 날', JSON.stringify({ok: okD, n: ST?.buys?.length ?? 0, bad: bad0.slice(0, 4)}));
  // 판 날 산 값 = 판 마지막 값 · 지금(판 날) = 판 마지막 값 · 1 · 2 · 3등 = 달력 장부
  const bco = new Map((BDs?.companies ?? []).filter(c => c?.date === BDs?.asOf && Number.isFinite(c.close)).map(c => [c.code, c.close])), badB = [];
  if (okD && BDs?.asOf === ST.asOf) {
    for (const [d, , code, px] of ST.buys) if (d === ST.asOf && bco.has(code) && bco.get(code) !== px) badB.push('산 값 ' + code);
    for (const [code, [v, d]] of Object.entries(ST.now ?? {})) if (d === ST.asOf && bco.has(code) && bco.get(code) !== v) badB.push('지금 ' + code);
  } else badB.push('판 날 ' + (BDs?.asOf ?? null) + ' · 정산 판 날 ' + (ST?.asOf ?? null));
  const t3want = (BKs?.days ?? []).filter(d => d.board <= (ST?.asOf ?? '') && d.board >= (ST?.start ?? SETTLE_START)).flatMap(d => (d.picks ?? []).map(p => d.board + ' ' + p.code + ' ' + p.px)).sort();
  const t3got = (ST?.buys ?? []).filter(b => b[1] === 0).map(b => b[0] + ' ' + b[2] + ' ' + b[3]).sort();
  if (JSON.stringify(t3want) !== JSON.stringify(t3got)) badB.push('1 · 2 · 3등 ≠ 달력 장부(' + t3got.length + ' · ' + t3want.length + ')');
  check(!badB.length, '㉓ 정산 값 — 오늘 판 날 산 값 · 지금 = 판 마지막 값 · 1 · 2 · 3등 = 달력 장부(날 · 회사 · 값)', badB.slice(0, 4).join(' / '));
  // 따로 셈 — 산 셈 줄 → 모두 · 묶음 · 업종 · 회사
  const rowsA = okD ? ST.buys.map(([day, ki, code, buy]) => { const [now, nowDay] = ST.now[code], [name, ind] = ST.co[code]; return {day, k: KS[ki], code, name, ind: ind ?? '업종 모름', cost: buy * ST.qty, val: now * ST.qty, one: !(nowDay > day)}; }) : [];
  const rowsS = rowsA.filter(r => !S36s.includes(r.k) && r.k !== 'ovl'), rows36 = rowsA.filter(r => S36s.includes(r.k)), rowsO = rowsA.filter(r => r.k === 'ovl'); // 맨 위 · 「묶음마다」 = 여덟 · 「서른여섯 꾀」 = 서른여섯 · 「겹친 곳」(따로 셈)
  const addS = rs => { const cost = rs.reduce((a, r) => a + r.cost, 0), val = rs.reduce((a, r) => a + r.val, 0), diff = val - cost, one = rs.length > 0 && rs.every(r => r.one), st = one ? 'one' : Math.round(diff) > 0 ? 'up' : Math.round(diff) < 0 ? 'dn' : 'eq';
    return {cost, val, diff, one, st, n: rs.length, res: st === 'one' ? '아직 하루치' : st === 'eq' ? '그대로' : wonM(diff), said: one ? '아직 하루치예요' : movedM(diff), first: rs.map(r => r.day).sort()[0] ?? null, cos: new Set(rs.map(r => r.code)).size}; };
  const grp = (rs, key) => { const m = new Map(); for (const r of rs) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return [...m].map(([k, x]) => ({key: k, rows: x, ...addS(x)})); };
  const byC = gs => [...gs].sort((a, b) => b.cost - a.cost || String(a.key).localeCompare(String(b.key), 'ko'));
  const TS = addS(rowsS), first0 = TS.first, NFs = new Intl.NumberFormat('ko-KR');
  // 주문 1114-0922(사장님 2026-11-14 08:22 「정산은 수익이 높은 순으로 매일 배열되게 만들고」) — 여덟 묶음도 수익률 높은 차례(백만에 하나까지 · 같으면 사장님 말씀 차례 · 아직 하루치 · 산 셈 없는 묶음은 맨 아래 말씀 차례)
  const rateS = g => (g && g.cost > 0 && !g.one ? Math.round(g.diff / g.cost * 1e6) : null);
  const gK = SHOWs.map((k, i) => { const g = grp(rowsS.filter(r => r.k === k), () => k)[0]; return {k, i, g, rate: rateS(g)}; });
  const ordK = [...gK].sort((a, b) => (a.rate === null) - (b.rate === null) || (b.rate ?? 0) - (a.rate ?? 0) || a.i - b.i);
  const kindW = ordK.map(({k, g}) => g ? [KNAME[k], wonM(g.cost), g.res, SHM[g.st], ''] : [KNAME[k], '0원', '아직 없음', '', '']);
  const sayW = (o, what) => { const ga = what === '묶음' ? '이' : '가'; return o.some(x => x.rate !== null) ? '산 돈에 견줘 많이 늘어난 ' + what + ga + ' 맨 위예요. 날마다 다시 줄 세워요.' : '아직 하루치라서 원래 차례로 놓았어요. 하루가 더 지나면 많이 늘어난 ' + what + ga + ' 맨 위로 가요.'; };
  const totOf = T => (T.cost > 0 ? ['모두', wonM(T.cost), T.res, SHM[T.st]] : ['모두', wonM(0), '아직 없음', '']); // 산 셈이 없으면 「아직 없음」(0원은 그대로가 아님)
  const indG = byC(grp(rowsS, r => r.ind)), coG = byC(grp(rowsS, r => r.code));
  const lateS = c => { const d = ST.now[c][1]; return d < ST.asOf ? d : null; }; // 오늘 판에 없어 앞 날 값으로 센 회사 — 맨 위 작은 줄에 수
  const missS = Object.entries(ST?.miss ?? {}).filter(([k]) => !S36s.includes(k) && k !== 'ovl').reduce((a, [, x]) => a + x, 0), lateN = coG.filter(g => lateS(g.key)).length;
  const missO = Number.isFinite(ST?.miss?.ovl) ? ST.miss.ovl : 0, TOS = addS(rowsO); // 겹친 곳(주문 1114-0802)
  const miss36 = Object.entries(ST?.miss ?? {}).filter(([k]) => S36s.includes(k)).reduce((a, [, x]) => a + x, 0), T36S = addS(rows36);
  // 서른여섯 꾀 — 수익률 높은 차례(주문 1113-2224 「정산표에는 수익율이 높은 순으로」 · 백만에 하나까지 · 같으면 꾀 차례 · 산 셈이 없는 꾀는 맨 아래 꾀 차례)
  const g36 = S36s.map((k, i) => { const g = grp(rows36.filter(r => r.k === k), () => k)[0]; return {k, i, g, rate: rateS(g)}; });
  const ord36 = [...g36].sort((a, b) => (a.rate === null) - (b.rate === null) || (b.rate ?? 0) - (a.rate ?? 0) || a.i - b.i);
  const s36W = ord36.map(({k, g}) => g ? [KNAME[k], wonM(g.cost), g.res, SHM[g.st], ''] : [KNAME[k], '0원', '아직 없음', '', '']);
  const cap36W = rows36.length ? mdM(T36S.first) + '부터 · 산 셈 ' + NFs.format(rows36.length) + '번 · 고른 날 ' + NFs.format(new Set(rows36.map(r => r.day)).size) + '일' + (miss36 ? ' · 값이 없어 못 센 ' + NFs.format(miss36) + '번' : '') : '아직 산 셈이 없어요. 장이 끝난 뒤 첫 묶음을 적어요.';
  const capW = (first0 ? mdM(first0) + '부터 · ' : '') + '산 셈 ' + NFs.format(rowsS.length) + '번 · 고른 날 ' + NFs.format(new Set(rowsS.map(r => r.day)).size) + '일' + (missS ? ' · 값이 없어 못 센 ' + NFs.format(missS) + '번' : '') + (lateN ? ' · 앞 날 값으로 센 회사 ' + NFs.format(lateN) + '곳' : '');
  const ovW3 = rowsO.length ? [KNAME.ovl, wonM(TOS.cost), TOS.res, SHM[TOS.st], ''] : [KNAME.ovl, '0원', '아직 없음', '', ''];
  const capOW = rowsO.length ? mdM(TOS.first) + '부터 · 산 셈 ' + NFs.format(rowsO.length) + '번 · 고른 날 ' + NFs.format(new Set(rowsO.map(r => r.day)).size) + '일' + (missO ? ' · 값이 없어 못 센 ' + NFs.format(missO) + '번' : '') : '아직 산 셈이 없어요. 장이 끝난 뒤 첫 묶음을 적어요.';
  R.m.settle = {buys: ST?.buys?.length ?? 0, kinds: KS.slice(0, 8).map(k => rowsS.filter(r => r.k === k).length), s36: S36s.map(k => rows36.filter(r => r.k === k).length), up36: ord36.slice(0, 3).map(x => x.k), inds: indG.length, cos: coG.length, miss: missS, miss36, late: lateN, ovl: rowsO.length, missO};
  // 주문 1115-2328 — 정산 쪽(#/r/t)은 서른여섯 꾀 표만(옛 여덟 묶음 · 겹친 곳 표 · 업종 · 회사 표는 지움 · 장부 자료는 그대로) · 손자병법 판(샘플 사)
  //   이 검사가 장부에서 따로 셈: 맨 위 산 돈 · 지금 · 늘었나 줄었나 · 작은 줄(첫날 · 산 셈 수 · 고른 날 수 · 못 센 수 · 값까지 날) · 꾀마다 서른여섯 줄 수익이 높은 차례(같으면 꾀 차례 · 하루치 · 산 셈 없음은 맨 아래)
  //   · 줄어든 꾀 수 · 가장 많이 줄어든 꾀 · 줄마다 이름(누르면 그 꾀 쪽) · 산 돈 · 늘었나 줄었나(모양 + 글) · 모두 = 서른여섯 합
  const nm36 = k => S36C.NAME[k]; // 꾀 쉬운 이름(su21_s36.py NAME = su21-s36.json name — 자료가 없는 날도 같은 이름)
  const SAIDs = st => (st === 'none' ? '아직 산 적이 없어요' : st === 'one' ? '아직 하루밖에 안 지났어요' : null);
  const resW = g => (!g || !g.n ? '아직 산 적이 없어요' : g.one ? '아직 하루밖에 안 지났어요' : movedM(g.diff));
  const stW = g => (!g || !g.n ? 'none' : g.st);
  const rowsW = ord36.map(({k, g}) => [k, nm36(k), '산 돈 ' + wonM(g ? g.cost : 0), resW(g), SHM[stW(g)] ?? '·']);
  const dn36 = ord36.filter(x => x.g && x.g.n && x.g.st === 'dn').sort((a, b) => a.g.diff - b.g.diff);
  const lossW36 = dn36.length ? '돈이 줄어든 꾀는 ' + dn36.length + '가지예요. 가장 많이 줄어든 꾀는 「' + nm36(dn36[0].k) + '」로, ' + wonM(-dn36[0].g.diff) + ' 줄었어요.' : '돈이 줄어든 꾀는 아직 없어요.';
  const rated36 = ord36.some(x => x.rate !== null), first36 = rows36.map(r => r.day).sort()[0] ?? null;
  const capW36 = (first36 ? mdM(first36) + '부터 · ' : '') + '산 횟수 ' + NFs.format(rows36.length) + '번 · 고른 날 ' + NFs.format(new Set(rows36.map(r => r.day)).size) + '일' + (miss36 ? ' · 값이 없어 못 센 ' + NFs.format(miss36) + '번' : '') + (DAYs.test(ST?.asOf ?? '') ? ' · ' + mdM(ST.asOf) + ' 값까지' : '');
  const ruleW36 = rated36 ? '산 돈에 비해 많이 늘어난 꾀가 맨 위예요. 날마다 다시 줄을 세워요. 줄어든 꾀도 숨기지 않아요.' : '아직 하루밖에 안 지나서 꾀 차례대로 놓았어요. 하루가 더 지나면 많이 늘어난 꾀가 맨 위로 가요.';
  const T36st = rows36.length ? T36S.st : 'none';
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const W = '㉓ 정산 [' + width + '] ';
    await open(p, '#/r/t');
    pageRules(await measure(p), W);
    const g = await p.evaluate(() => { const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), main = document.querySelector('#su main.sj-page[data-page="settle"]'), sec = main?.querySelector('section.sj-st36');
      return {main: !!main, h1: txt(document.querySelector('#su h1')), tab: txt(document.querySelector('#su .sj-tabs a[aria-current="page"]')),
        money: [...(main?.querySelectorAll('section.sj-ph dl.sj-money dd') ?? [])].map(txt), res: txt(main?.querySelector('section.sj-ph .sj-res-big b')), sh: txt(main?.querySelector('section.sj-ph .sj-res-big .sj-shp')), resSt: main?.querySelector('section.sj-ph .sj-res-big')?.getAttribute('data-st') ?? '',
        cap: txt(main?.querySelector('section.sj-ph p.sj-note')), rule: txt(sec?.querySelector('.sj-rule')), loss: txt(sec?.querySelector('.sj-loss')),
        rows: [...(sec?.querySelectorAll('ol.sj-stl > li.sj-str') ?? [])].map(li => [li.getAttribute('data-k'), txt(li.querySelector('.sj-stk')), txt(li.querySelector('.sj-stv > span:first-child')), txt(li.querySelector('.sj-stv .sj-res > span')), txt(li.querySelector('.sj-stv .sj-shp')), li.querySelector('a.sj-sta')?.getAttribute('href') ?? '', txt(li.querySelector('.sj-stn'))]),
        tot: [txt(sec?.querySelector('.sj-sttot > b')), txt(sec?.querySelector('.sj-sttot > span:not(.sj-res)')), txt(sec?.querySelector('.sj-sttot .sj-res > span')), txt(sec?.querySelector('.sj-sttot .sj-shp'))],
        old: document.querySelectorAll('#su .su-hero, #su .st-kinds, #su .st-ovl, #su .st-inds, #su .st-cos, #su .bk-days, #su .su-top, #su .su-tabs').length,
        text: main?.innerText ?? ''}; });
    check(g.main && g.h1 === '서른여섯 꾀 정산' && g.tab === '정산' && g.old === 0, W + '손자병법 판 정산 쪽(주문 1115-2328) — 큰 제목 · 아래 탭 「정산」 켜짐 · 옛 정산 판(여덟 묶음 · 겹친 곳 · 업종 · 회사 표) 0', JSON.stringify({main: g.main, h1: g.h1, tab: g.tab, old: g.old}));
    check(okD && JSON.stringify(g.money) === JSON.stringify([wonM(T36S.cost), rows36.length ? wonM(T36S.val) : '아직 산 적이 없어요']) && g.res === resW(rows36.length ? T36S : null) && g.sh === (SHM[T36st] ?? '·') && g.resSt === T36st,
      W + '맨 위 — 서른여섯 꾀 산 돈 · 지금 · 늘었나 줄었나(모양 + 글) = 장부에서 따로 셈', JSON.stringify({money: g.money, res: g.res, sh: g.sh, st: g.resSt}));
    check(okD && g.cap === capW36, W + '맨 위 작은 줄 — 첫날 · 산 셈 수 · 고른 날 수 · 못 센 수 · 값까지 날(숨기지 않음)', JSON.stringify([g.cap, capW36]));
    check(g.rule === ruleW36 && g.loss === lossW36, W + '차례 까닭 · 손실 먼저 한 줄(주문 1114-0922 「손실을 보지 않게 최우선」) — 줄어든 꾀 수 · 가장 많이 줄어든 꾀', JSON.stringify({rule: g.rule, loss: [g.loss, lossW36]}));
    const rOk = g.rows.length === 36 && g.rows.every((r, i) => JSON.stringify(r.slice(0, 5)) === JSON.stringify(rowsW[i]) && r[5] === '#/k/' + rowsW[i][0] && r[6] === String(i + 1));
    check(okD && rOk, W + '꾀마다 서른여섯 줄 — 수익이 높은 차례(본질 8번 · 같으면 꾀 차례 · 하루치 · 산 셈 없음은 맨 아래) · 이름 · 산 돈 · 늘었나 줄었나 · 모양 · 누르면 그 꾀 쪽 = 따로 셈',
      JSON.stringify({n: g.rows.length, bad: g.rows.map((r, i) => (JSON.stringify(r.slice(0, 5)) === JSON.stringify(rowsW[i]) ? null : [r.slice(0, 5), rowsW[i]])).filter(Boolean).slice(0, 2)}).slice(0, 400));
    check(JSON.stringify(g.tot) === JSON.stringify(['모두', '산 돈 ' + wonM(T36S.cost), resW(rows36.length ? T36S : null), SHM[T36st] ?? '·']), W + '맨 아래 모두 = 서른여섯 줄 합 = 맨 위', JSON.stringify(g.tot));
    const plain = [...new Set(rows36.map(r => r.name))].sort((a, b) => b.length - a.length).reduce((t, n) => t.split(n).join(''), g.text);
    check(!plain.includes('%') && !/[A-Za-z]/.test(plain) && !/불장|꽃이 될|돈이 몰|조용한데 힘이|1 · 2 · 3등/.test(plain), W + '「%」 · 영어 글자 · 옛 묶음 이름(불장 · 꽃이 될 · 돈이 몰리는 · 조용한 힘 · 1 · 2 · 3등) 0', (plain.match(/.{0,12}(%|[A-Za-z]+|불장|꽃이 될|돈이 몰|조용한데 힘이|1 · 2 · 3등).{0,12}/) ?? [''])[0]);
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
}
{ // ㉔ 처음 쪽 모두 몇 곳 · 서른여섯 꾀(주문 1114-0004 · 사장님 2026-11-14 00:04 「36×7 이면 그 값이 나오잖아 지금 28 곳으로 돼 있잖아 … 기존에 있는 불장 … 그것도 내비두고
  //   또 거기다 36 까지라 그 종류별로 다 모아가지고 그 총 개수를 정리 하란 말이야」 · 00:07 「맞아」 — docs/design/s36-2026-11-13/order-0004.txt)
  //   가) 자료 su/data/su21-s36.json — 꼴 · 꾀 서른여섯(g01 ~ g36 차례) · 꾀마다 일곱까지 · 번호 · 이름 · 판 날 = 21곳 판 날
  //   나) #/(390 · 320) — 이 검사가 자료에서 따로 셈: 머리 큰 값 = 오늘 이름이 오른 회사(지금 · 될 듯 · 꾀 칸에서 겹침을 뺀 수 — 주문 1114-1306 ⑤) · 구슬 아래 회사 수 한 줄 + 칸 수 풀이 세 줄 · 그림 아래 꾀 칸(갈래 여섯 · 꾀 서른여섯 · 회사 = 자료 · 누르면 그 회사 쪽) · 정산 고리
  const T36 = await J('/su/data/su21.json').catch(() => null), G36 = await J('/su/data/su21-s36.json').catch(() => null);
  const K36 = Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0'));
  const okG = !!G36 && G36.schema === 'su21-s36-1' && JSON.stringify(G36.kinds) === JSON.stringify(K36) && K36.every(k => Array.isArray(G36.lists?.[k]) && G36.lists[k].length <= 7 && G36.lists[k].every(c => /^[0-9A-Z]{6}$/.test(c?.code ?? '') && typeof c.name === 'string' && c.name.length > 0) && typeof G36.name?.[k] === 'string' && typeof G36.han?.[k] === 'string' && typeof G36.say?.[k] === 'string');
  // 꾀 수는 21곳 판(su21.json s36n — 같은 셈) · 꾀 칸은 그 판과 같은 날 · 같은 수일 때만(옛 판이면 꾀 칸 · 두 줄 없음)
  const SN = T36?.s36n && typeof T36.s36n === 'object' && K36.every(k => Number.isInteger(T36.s36n[k]) && T36.s36n[k] >= 0) && Object.keys(T36.s36n).length === 36 ? T36.s36n : null;
  const same = !!SN && okG && G36.asOf?.board === T36?.asOf?.board && K36.every(k => G36.lists[k].length === SN[k]);
  check(!SN || same, '㉔ 서른여섯 꾀 자료 — 꼴 · 꾀 서른여섯 차례 · 꾀마다 일곱까지 · 판 날 = 21곳 판 날 · 꾀마다 수 = 21곳 판 s36n', JSON.stringify({sn: !!SN, ok: okG, board: G36?.asOf?.board ?? null, t21: T36?.asOf?.board ?? null, n: okG ? K36.map(k => G36.lists[k].length).join('') : null}));
  const n7 = k => Math.min(7, (T36?.lists?.[k] ?? []).length), FILT36 = !!T36?.strict && T36.strict.mode !== 'mark';
  const N28 = (FILT36 ? ['hot', 'bloom', 'money'].reduce((a, k) => a + (T36?.lists?.[k] ?? []).length, 0) : 21) + n7('quiet'), N21 = ['hotNext', 'bloomNext', 'moneyNext'].reduce((a, k) => a + n7(k), 0);
  const N36 = SN ? K36.reduce((a, k) => a + Math.min(7, SN[k]), 0) : 0, ALL36 = N28 + N21 + N36;
  // 오늘 이름이 오른 회사(주문 1114-1306 ⑤ · 점검 A3 — 칸마다 센 수(ALL36 칸)를 회사 수처럼 부르지 않음) — 묶음마다 앞 일곱 칸의 회사 번호를 모아 겹침을 뺀 수(이 검사가 따로 셈 · 꾀 칸 자료가 맞지 않으면 지금 · 될 듯 칸만)
  const CO7 = ['hot', 'bloom', 'money', 'quiet', 'hotNext', 'bloomNext', 'moneyNext'].flatMap(k => (T36?.lists?.[k] ?? []).slice(0, 7));
  const coOf = xs => new Set(xs.map(c => c?.code).filter(c => /^[0-9A-Z]{6}$/.test(c ?? ''))).size, CO49 = coOf(CO7), CO36 = same ? coOf([...CO7, ...K36.flatMap(k => G36.lists[k].slice(0, 7))]) : CO49;
  // su21.json co36(첫 칠함에 바로 그리는 회사 수 — su21.py 가 같은 셈으로 둠 · 주문 1114-1306) = 이 검사가 따로 센 수(꾀 칸 자료가 같은 날일 때) · 없으면 옛 자료(첫 칠함은 「…」 뒤 채움)
  check(T36?.co36 == null || !same || T36.co36 === CO36, '㉔ 자료 회사 수 co36 = 따로 센 오늘 이름이 오른 회사 수(첫 화면 큰 값을 바로 그림 · 주문 1114-1306 ⑤)', JSON.stringify({co36: T36?.co36 ?? null, want: CO36, same}));
  // 손자병법 형세(주문 1114-0922 · 사장님 2026-11-14 08:22 「요즘 주식시장을 병법으로 빚대서 첫페이지에 상황보고를 하고 / 이런 상황일 때 / 살아남을수 있는 전술들을 / 자동으로 배열을 위에서 아래로 해 /
  //   손실을 보지 않게 최우선에 두며 그다음이 수익이다」) — su21.json sun: 땅 = 숫자로 다시 읽은 땅(이 검사가 따로) · 꾀 차례 = 덜 잃은 차례(잃은 몫 → 잃은 주 평균 → 가장 크게 잃은 주 → 평균 → 꾀 차례 · 셀 날 0 은 맨 뒤)
  const SUN = T36?.sun ?? null, LANDN = {fall: '내리는 시장', shake: '흔들리는 시장', rise: '오르는 시장', narrow: '쏠린 시장', calm: '잔잔한 시장'};
  const landOf = m => { const b = m.up / m.n; return b < 0.4 && m.mid < 0 ? 'fall' : Number.isFinite(m.shake) && m.shake >= 1.5 ? 'shake' : b > 0.6 && m.mid > 0 ? 'rise' : m.mean > 0 && b <= 0.5 ? 'narrow' : 'calm'; };
  const keyS = r => (!r.n ? [1, 0, 0, 0, 0, r.k] : [0, Math.round(r.lose / r.n * 1000) / 1000, -r.avgLoss, -r.worst, -r.avg, r.k]);
  const cmpS = (a, b) => { const x = keyS(a), y = keyS(b); for (let i = 0; i < x.length; i++) { if (x[i] < y[i]) return -1; if (x[i] > y[i]) return 1; } return 0; };
  const okSunD = !!SUN && SUN.rule === 'sun-v1' && SUN.land in LANDN && SUN.name === LANDN[SUN.land] && Number.isInteger(SUN.m?.n) && SUN.m.n > 0 && Number.isInteger(SUN.m?.up) && SUN.m.up <= SUN.m.n
    && Array.isArray(SUN.rank) && SUN.rank.length === 36 && new Set(SUN.rank.map(r => r.k)).size === 36 && SUN.rank.every(r => K36.includes(r.k) && Number.isInteger(r.n) && r.n >= 0 && (!r.n || (Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && Number.isFinite(r.avgLoss) && r.avgLoss <= 0 && Number.isFinite(r.worst) && Number.isFinite(r.avg))));
  const sunBad = !SUN ? [] : [!okSunD && '꼴', okSunD && landOf(SUN.m) !== SUN.land && '땅 ≠ 숫자(' + landOf(SUN.m) + ')', okSunD && SUN.rank.some((r, i) => i && cmpS(SUN.rank[i - 1], r) > 0) && '차례 ≠ 덜 잃은 차례',
    okSunD && SUN.hist && !(Number.isInteger(SUN.hist.days) && SUN.hist.days > 0 && Number.isInteger(SUN.hist.same) && SUN.hist.same <= SUN.hist.days && SUN.rank.every(r => r.n <= (SUN.hist.all ? SUN.hist.days : SUN.hist.same))) && '센 날 수'].filter(Boolean);
  check(!sunBad.length, '㉔ 손자병법 형세 자료(주문 1114-0922) — 땅 = 숫자로 다시 읽은 땅 · 꾀 서른여섯 덜 잃은 차례(잃은 몫 → 잃은 주 평균 → 가장 크게 잃은 주 → 평균) · 센 날 수', JSON.stringify({sun: !!SUN, bad: sunBad, land: SUN?.land ?? null, top: (SUN?.rank ?? []).slice(0, 3).map(r => r.k)}));
  const HOME36 = 3; // 첫 쪽 꾀 칸 수(주문 1117-1120 · 사장님 2026-11-17(마카오) 10:20 「어 변경해」 — 샘플 다처럼 첫 쪽은 꾀 셋 · 「서른여섯 꾀 모두 보기」는 꾀 탭 #/k)
  const ORD36 = okSunD && !sunBad.length ? SUN.rank.map(r => r.k) : K36, RK36 = okSunD && !sunBad.length ? Object.fromEntries(SUN.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {};
  const KNs = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'], w100 = r => (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원';
  const lose10W = r => (!r.lose ? '한 번도 잃지 않았어요.' : Math.round(r.lose / r.n * 10) ? '열 번 가운데 ' + KNs[Math.round(r.lose / r.n * 10)] + ' 번 잃었어요.' : '잃은 때가 열 번에 한 번도 안 돼요.');
  const recW = r => (!r ? '' : !r.n ? '사고판 양 자료가 없어서, 지난 기록을 세지 못했어요.' : lose10W(r) + ' ' + r.n + '번 가운데 ' + r.lose + '번이에요.');
  // 며칠째(주문 1114-0151 「지금 이렇게 301 게 이게 며칠째 이렇게 됐는지도 좀 기록 하게 해 봐」) — 꾀마다 회사 · 조용한 힘 일곱에 days(1 넘는 정수) · found(기록 첫날 ~ 판 날) · since
  const DAYz = /^\d{4}-\d{2}-\d{2}$/, runOk = (c, from) => c.days == null || (Number.isInteger(c.days) && c.days >= 1 && DAYz.test(c.found ?? '') && c.found <= (T36?.asOf?.board ?? '') && (!from || c.found >= from) && typeof c.since === 'boolean');
  const allC = okG ? K36.flatMap(k => G36.lists[k]) : [], QL36 = (T36?.lists?.quiet ?? []).slice(0, 7);
  check(allC.every(c => runOk(c, G36.daysFrom)) && QL36.every(c => runOk(c, T36?.quietDays?.from)),
    '㉔ 며칠째 자료(주문 1114-0151) — 꾀마다 회사 · 조용한 힘 일곱 · 1 넘는 정수 · 첫 발견 = 기록 첫날 ~ 판 날(장부에 그날 기록이 없으면 며칠째 없음)', JSON.stringify({bad: allC.filter(c => !runOk(c, G36?.daysFrom)).slice(0, 2), q: QL36.filter(c => !runOk(c, T36?.quietDays?.from)).slice(0, 2), from: G36?.daysFrom ?? null}).slice(0, 300));
  // 한 달 꺾은선(주문 1114-0325 · 사장님 2026-11-14 03:25 「모든곳에 꺽기 그래프도 종목마다 넣어라」) — 꾀 칸 회사마다 line(판 21 마지막 값 c · 그날 마지막 값 close · 판 날 date — 42칸과 같은 값)
  //   자료: 꾀 칸 회사 모두 line 이 있음 · 값이 맞는 회사(c 21개 · 끝 = close · 판 날 = 꾀 칸 판 날)가 꾀 칸 회사의 95 넘게(아니면 셈 · 판이 고장)
  const LINE36 = okG && G36.line && typeof G36.line === 'object' ? G36.line : {};
  const spW36 = c => { const v = LINE36[c?.code]; return v && Array.isArray(v.c) && v.c.length === 21 && v.c.every(x => Number.isFinite(x) && x > 0) && Number.isFinite(v.close) && v.close === v.c[20] && v.date === G36?.asOf?.board ? v.c : null; };
  const chips36 = okG ? K36.flatMap(k => G36.lists[k].slice(0, 7)) : [], spN36 = chips36.filter(spW36).length;
  check(!same || (chips36.every(c => c.code in LINE36) && spN36 * 100 >= chips36.length * 95),
    '㉔ 꾀 칸 한 달 꺾은선 자료(주문 1114-0325) — 회사마다 line · 판 21 마지막 값 · 끝 = 그날 마지막 값 · 판 날 = 꾀 칸 판 날', JSON.stringify({chips: chips36.length, line: Object.keys(LINE36).length, ok: spN36, miss: chips36.filter(c => !(c.code in LINE36)).slice(0, 3).map(c => c.name)}));
  // 겹친 곳(주문 1114-0802 · 사장님 2026-11-14 08:02 「… 그중에서 36개 정도 겹치는 그 종목을 별도로 또 … 또 폴더 또 만들어 그래도 똑같이 만들어」 · 08:06 「맞아」)
  //   첫 화면 마흔세 묶음(지금 셋 · 될 듯 셋 · 조용한 힘 · 꾀 서른여섯 — 묶음마다 앞 일곱) 가운데 세 묶음 이상에 든 회사 · 많이 든 차례 · 같으면 첫 화면에서 먼저 나온 차례 — 이 검사가 따로 셈
  const OVO = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext', 'quiet', ...K36];
  const ovW = (() => { if (!same) return null; const first = new Map(), ins = new Map(); let pos = 0;
    for (const k of OVO) for (const c of (K36.includes(k) ? G36.lists[k] : T36?.lists?.[k] ?? []).slice(0, 7)) { const code = c?.code; if (!first.has(code)) first.set(code, pos); pos++; if (!ins.has(code)) ins.set(code, []); if (!ins.get(code).includes(k)) ins.get(code).push(k); }
    return [...ins].filter(([, v]) => v.length >= 3).sort((a, b) => b[1].length - a[1].length || first.get(a[0]) - first.get(b[0])).map(([code, v]) => ({code, n: v.length, in: v})); })();
  const OVL = same && G36.ovl && Array.isArray(G36.ovl.list) ? G36.ovl : null, OVLL = OVL?.list ?? [];
  check(!same || (!!OVL && OVL.need === 3 && OVL.groups === 43 && JSON.stringify(OVL.order) === JSON.stringify(OVO) && JSON.stringify(OVLL.map(x => ({code: x.code, n: x.n, in: x.in}))) === JSON.stringify(ovW)
      && OVLL.every(x => typeof x.name === 'string' && x.name.length > 0 && x.code in LINE36) && OVLL.every(c => runOk(c, OVL.daysFrom))),
    '㉔ 겹친 곳 자료(주문 1114-0802) — 마흔세 묶음 가운데 세 묶음 이상 · 많이 든 차례(같으면 첫 화면 먼저) = 이 검사가 따로 센 것 · 회사마다 한 달 값 · 며칠째', JSON.stringify({n: OVLL.length, want: ovW?.length ?? null, top: OVLL.slice(0, 3).map(x => x.name + ' ' + x.n), first: (ovW ?? []).slice(0, 3).map(x => x.code + ' ' + x.n)}).slice(0, 400));
  const ovSpN = OVLL.filter(spW36).length;
  R.m.s36 = {all: ALL36, now: N28, next: N21, s36: N36, sn: !!SN, same, empty: okG ? K36.filter(k => !G36.lists[k].length) : null, data: G36?.asOf?.data ?? null, sp: {want: spN36, chips: chips36.length},
    ovl: {n: OVLL.length, sp: ovSpN, top: OVLL.slice(0, 3).map(x => x.n), days: OVLL.map(c => c.days ?? null).filter(Boolean).slice(0, 3), from: OVL?.daysFrom ?? null},
    days: {from: G36?.daysFrom ?? null, max: Math.max(0, ...allC.map(c => c.days ?? 0)), n2: allC.filter(c => (c.days ?? 0) >= 2).length, q: QL36.map(c => c.days ?? null), qFrom: T36?.quietDays?.from ?? null}};
  // ㉘ 세 거름 · 꾀 뜻 · 큰 갈래(주문 1116-1539 · 사장님 2026-11-16(마카오) 14:39 「몬테카를로 … 10번 … 일곱 가지를 필터링 … 말이 같아야 될 거 아니야」 · 주문 1116-1601 15:01 「큰 테마 … 1~5위 … 평균 퍼센트」) — 이 검사가 자료에서 따로 셈
  //   가) 거른 법 s36-v2(흉내 내 보기 200번씩 10번 · 소거 열 가지 · 꾀 뜻 일곱 가지) · 꾀마다 걸러진 수(셋 다 ≤ 하나하나 · 고른 곳 = 셋 다와 7 가운데 작은 것 = 목록 수) · 빈 꾀 = 꾀 뜻에 맞는 곳 없음(채우지 않음)
  //   나) 꾀 뜻 = 고른 회사 — 한 달 값 21개(꾀 칸 꺾은선 = 꾀를 고른 값)로 잴 수 있는 꾀마다(한 달 · 닷새 · 오늘 방향 · 스무 날 높낮이) 고른 곳이 모두 맞음
  //   다) 큰 갈래 다섯 — 고른 회사를 갈래(ind)로 모아 회사가 많은 차례(같으면 꾀 답에 나온 번 · 이름) · 한 달 100원이 평균(넷째 자리) · 오른 곳 · 내린 곳 · 회사(나온 번 · 번호 차례) · 갈래 이름 영어 0
  const PICK28 = 's36-v3', P28 = same ? G36.pick ?? null : null, v2 = P28?.rule === PICK28, NONE28 = '꾀 뜻에 맞는 곳이 없어 고르지 않음'; // v2 = 지금 거른 법(주문 1116-2134 부터 s36-v3 — 세 거름은 그대로 · 차례 = 꾀 점수)
  const FUN28 = k => { const f = v2 ? G36.funnel?.[k] : null, L = same ? G36.lists[k] : null;
    return f && ['n', 'cut', 'mean', 'mc', 'all', 'k'].every(x => Number.isInteger(f[x]) && f[x] >= 0) && f.all <= Math.min(f.cut, f.mean, f.mc) && Math.max(f.cut, f.mean, f.mc) <= f.n && f.k === Math.min(7, f.all) && Array.isArray(L) && L.length === f.k ? f : null; };
  const volMiss28 = k => G36?.by?.[k] === 'vol' && /거래량/.test(G36?.why?.[k] ?? '') && !G36.lists[k].length;
  const funBad = !same || !v2 ? [] : K36.filter(k => !(FUN28(k) || volMiss28(k)) || (!G36.lists[k].length && !(G36.why?.[k] === NONE28 || volMiss28(k))));
  check(!same || (v2 && P28.runs === 10 && P28.paths === 200 && Array.isArray(P28.cut) && P28.cut.length === 10 && P28.cut.every(t => typeof t === 'string' && t && !/[A-Za-z%]/.test(t)) && Array.isArray(P28.angles) && P28.angles.length === 7 && !funBad.length),
    '㉘ 세 거름 자료(주문 1116-1539 · 1116-2134) — 거른 법 s36-v3(흉내 내 보기 200번씩 10번 · 소거 열 가지 · 꾀 뜻 일곱 가지) · 꾀마다 걸러진 수 · 고른 곳 = 셋 다와 7 가운데 작은 것 = 목록 수 · 빈 꾀는 채우지 않음', JSON.stringify({rule: P28?.rule ?? null, runs: P28?.runs ?? null, paths: P28?.paths ?? null, bad: funBad.slice(0, 4)}));
  const mm28 = c => { const v = spW36(c); if (!v) return null; let st = 0; for (let i = 20; i > 0 && v[i] > v[i - 1]; i--) st++; const w20 = v.slice(1);
    return {r20: v[20] / v[0] - 1, r5: v[20] / v[15] - 1, r5p: v[15] / v[10] - 1, r1: v[20] / v[19] - 1, r1p: v[19] / v[18] - 1, up: w20.filter((x, i) => x > v[i]).length, hi: Math.max(...w20), lo: Math.min(...w20), st, v}; };
  const COND28 = {g01: x => x.r20 > 0, g02: x => x.r5 > 0, g03: x => x.r20 > 0, g04: x => x.r5 > 0, g06: x => x.r1 > 0 && x.r1p < 0, g07: x => x.r1 > 0, g08: x => Math.abs(Math.log(1 + x.r20)) < 0.05,
    g10: x => x.r20 > 0 && x.r5 < 0, g11: x => x.r5 < 0, g12: x => x.up >= 11, g14: x => x.v[20] >= 1.05 * x.lo, g16: x => x.r20 < 0, g17: x => x.r5p > 0 && x.r5 > x.r5p,
    g24: x => x.r5 > 0, g26: x => x.r20 >= 0, g28: x => x.r20 > 0 && x.v[20] >= 0.97 * x.hi, g29: x => x.r5 > 0, g31: x => x.r1 > 0, g32: x => x.r20 >= 0, g34: x => x.r1 < 0, g35: x => x.r1 > 0 && x.st >= 2, g36: x => x.r20 < 0};
  const mmBad = []; let mmN = 0;
  if (same && v2) for (const k of K36) { const fn = COND28[k]; if (!fn) continue; for (const c of G36.lists[k]) { const x = mm28(c); if (!x) continue; mmN++; if (!fn(x)) mmBad.push(k + ' ' + c.name); } }
  check(!same || !v2 || !mmBad.length, '㉘ 꾀 뜻 = 고른 회사(주문 1116-1539 「말이 같아야」) — 한 달 값으로 잴 수 있는 꾀 ' + Object.keys(COND28).length + '가지 · 고른 곳마다 꾀 뜻(한 달 · 닷새 · 오늘 방향 · 스무 날 높낮이)에 맞음 · 어긋남 0', JSON.stringify({n: mmN, bad: mmBad.slice(0, 4)}));
  // 라) 꾀 점수(주문 1116-2134 · 사장님 2026-11-16(마카오) 20:34 「이 방정식을 36걔 병법에 올려라 각 방에 맞게 … 이헎개 해서 찾아낸 종목이라고 하라」)
  //   여섯 식 · 꾀마다 섞은 식 = 화면 바탕 글(su-sonja-36.js EQ36 · MIX36) · 꾀마다 수학 하나 이상 + 정서 하나 이상 · 고른 곳마다 꾀 점수 = 식마다 차례(큰 곳 그대로 · 작은 곳 1 − 차례)의 평균 · 목록 = 점수 높은 차례
  //   꺾은선(꾀를 고른 값)으로 잴 수 있는 식 값(한 달 · 닷새 · 하루 · 어제 오름 · 들뜸 · 한 달 흔들림 · 한 달 폭 · 바닥에서 오름 · 오른 날 수) = 이 검사가 따로 셈(꾀를 고른 날 = 판 날일 때)
  const MX28 = same && v2 && G36.mix?.rule === 'mix-v1' ? G36.mix : null, mxBad = []; let mxN = 0;
  if (same && v2) {
    if (!MX28) mxBad.push('mix 없음');
    else {
      const EQ = MX28.eq, RC = MX28.recipe, lineOk = G36.asOf?.data === G36.asOf?.board;
      if (JSON.stringify(EQ) !== JSON.stringify(S36C.EQ36)) mxBad.push('식 글 ≠ 바탕 글');
      if (JSON.stringify(RC) !== JSON.stringify(S36C.MIX36)) mxBad.push('섞은 식 ≠ 바탕 글');
      for (const k of K36) {
        const mx = RC?.[k];
        if (!Array.isArray(mx) || !mx.length || !mx.every(([e, d]) => Array.isArray(EQ?.[e]) && (d === 1 || d === -1)) || !mx.some(([e]) => EQ[e][0] === '수학') || !mx.some(([e]) => EQ[e][0] === '정서')) { mxBad.push(k + ' 섞은 식'); continue; }
        let prev = Infinity;
        for (const c of G36.lists[k]) {
          const r = MX28.val?.[k]?.[c.code];
          if (!Array.isArray(r) || r.length !== 3 || !Array.isArray(r[1]) || !Array.isArray(r[2]) || r[1].length !== mx.length || r[2].length !== mx.length) { mxBad.push(k + ' ' + c.name + ' 값 없음'); break; }
          const sc = mx.reduce((a, [, d], i) => a + (d > 0 ? r[1][i] : 1 - r[1][i]), 0) / mx.length;
          if (!(Math.abs(sc - r[0]) < 2e-4) || !r[1].every(q => q >= 0 && q <= 1)) mxBad.push(k + ' ' + c.name + ' 점수');
          if (r[0] > prev + 1e-9) mxBad.push(k + ' 차례'); prev = r[0];
          const v = lineOk ? spW36(c) : null; if (!v) continue; mxN++;
          const lr = v.slice(1).map((x, i) => Math.log(x / v[i])), m20 = lr.reduce((a, x) => a + x, 0) / 20, w = v.slice(1);
          const W = {r20: Math.log(v[20] / v[0]), r5: Math.log(v[20] / v[15]), r1: lr[19], r1p: lr[18], jump: Math.max(...lr), v20: Math.sqrt(lr.reduce((a, x) => a + (x - m20) ** 2, 0) / 20),
            up: lr.filter(x => x > 0).length, w20: (Math.max(...w) - Math.min(...w)) / (w.reduce((a, x) => a + x, 0) / 20), reb: Math.log(v[20] / Math.min(...w))};
          mx.forEach(([e], i) => { if (e in W && !(Math.abs(W[e] - r[2][i]) <= (e === 'up' ? 0 : 3e-3))) mxBad.push(k + ' ' + c.name + ' ' + e); });
        }
      }
    }
  }
  check(!same || !v2 || !mxBad.length, '㉘ 꾀 점수 자료(주문 1116-2134) — 여섯 식 · 꾀마다 섞은 식 = 화면 바탕 글 · 수학 하나 이상 + 정서 하나 이상 · 고른 곳 점수 = 식마다 차례의 평균 · 점수 높은 차례 · 꺾은선으로 잴 수 있는 식 값 = 이 검사가 따로 셈', JSON.stringify({n: mxN, bad: mxBad.slice(0, 4)}));
  const IND28 = same && G36.ind && typeof G36.ind === 'object' ? G36.ind : null, cmpS28 = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const thW = (() => { if (!same || !v2) return null; const hit = new Map();
    for (const k of K36) for (const c of G36.lists[k]) hit.set(c.code, (hit.get(c.code) ?? 0) + 1);
    const by = new Map(); for (const code of hit.keys()) { const gn = IND28?.[code]; if (typeof gn !== 'string' || !gn || /[A-Za-z%]/.test(gn)) return {bad: code}; if (!by.has(gn)) by.set(gn, []); by.get(gn).push(code); }
    const rows = [...by].map(([name, cs]) => { const rr = cs.map(code => { const v = LINE36[code]?.c; return Array.isArray(v) && v.length === 21 && v.every(x => Number.isFinite(x) && x > 0) ? v[20] / v[0] : null; }).filter(x => x !== null);
      cs.sort((a, b) => hit.get(b) - hit.get(a) || cmpS28(a, b));
      return {name, n: cs.length, hits: cs.reduce((a, c) => a + hit.get(c), 0), avg: rr.length ? rr.reduce((a, x) => a + x, 0) / rr.length : null, up: rr.filter(x => x > 1).length, dn: rr.filter(x => x < 1).length, m: rr.length, codes: cs}; });
    rows.sort((a, b) => b.n - a.n || b.hits - a.hits || cmpS28(a.name, b.name));
    return rows.slice(0, 5); })();
  const TH28 = same && G36.themes?.rule === 'themes-v1' && Array.isArray(G36.themes.rows) ? G36.themes.rows : null;
  const thSame = Array.isArray(thW) && !!TH28 && TH28.length === thW.length && TH28.every((r, i) => { const w = thW[i];
    return r.name === w.name && r.n === w.n && r.hits === w.hits && r.up === w.up && r.dn === w.dn && r.m === w.m && JSON.stringify(r.codes) === JSON.stringify(w.codes) && (w.avg === null ? r.avg === null : Number.isFinite(r.avg) && Math.abs(r.avg - w.avg) < 1.5e-4); });
  check(!same || !v2 || thSame, '㉘ 큰 갈래 다섯 자료(주문 1116-1601) — 고른 회사를 갈래로 모아 회사가 많은 차례(같으면 꾀 답에 나온 번 · 이름) · 한 달 100원이 평균 · 오른 곳 · 내린 곳 · 회사 차례 = 이 검사가 따로 센 것 · 갈래 이름 영어 0',
    JSON.stringify({got: (TH28 ?? []).map(r => r.name + ' ' + r.hits + '/' + r.n), want: Array.isArray(thW) ? thW.map(r => r.name + ' ' + r.hits + '/' + r.n) : thW}).slice(0, 400));
  R.m.s36.pick = {rule: P28?.rule ?? null, empty: same ? K36.filter(k => !G36.lists[k].length).length : null, mm: {n: mmN, bad: mmBad.length}, mix: {n: mxN, bad: mxBad.length}, themes: (TH28 ?? []).map(r => r.name + ' ' + r.hits)};
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const W = '㉔ 처음 쪽 [' + width + '] ';
    await open(p, '#/');
    // 손자병법 첫 쪽(주문 1115-1706 — 빈 파일에서 새로 씀 · 샘플 사 「화제와 도장」) — 같은 자료 · 같은 말을 새 판의 자리에서 읽음(옛 그림 칸 · 구슬 대신)
    //   큰 값 = .sj-count .sj-big · 칸 수 풀이 = .sj-count .sj-mean · 꾀 칸 = section.sj-s36(형세 보고 바로 아래) · 형세 = section.sj-sun(표지 바로 아래) · 꾀 = li.sj-tk · 회사 단추 = a.sj-chip · 겹친 곳 = .sj-ov · 조용한 힘 며칠째 = .sj-qd
    if (same) await p.waitForFunction(() => document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), null, {timeout: 15000}).catch(() => {}); // 꾀 칸은 첫 칠함 뒤에 받음
    await p.waitForFunction(() => !(document.querySelector('#su .sj-count .sj-big')?.textContent ?? '').includes('…'), null, {timeout: 15000}).catch(() => {}); // 큰 값(회사 수)도 꾀 칸 자료를 받은 뒤에 채워짐
    const g = await p.evaluate(() => { const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), main = document.querySelector('#su main.sj-page'), sec = main?.querySelector(':scope > section.sj-s36:not(.sj-wait)');
      const spOf = a => { const sv = a.querySelector('svg.sj-sps'), dot = sv?.querySelector('circle.sj-spe'), r = a.getBoundingClientRect(), v = sv?.getBoundingClientRect();
        return {line: sv?.querySelector('path.sj-sp1')?.getAttribute('d') ?? '', base: sv?.querySelector('path.sj-sp0')?.getAttribute('d') ?? '', dot: dot ? [+dot.getAttribute('cx'), +dot.getAttribute('cy')] : null, n: a.querySelectorAll('svg.sj-sps').length,
          lab: a.getAttribute('aria-label') ?? '', inside: !v || (v.left >= r.left - 0.5 && v.right <= r.right + 0.5 && v.top >= r.top - 0.5 && v.bottom <= r.bottom + 0.5)}; };
      return {big: txt(main?.querySelector('.sj-count .sj-big')), tab: txt(document.querySelector('#su .sj-tabs a')), title: document.title,
        tot: txt(main?.querySelector('.sj-count .sj-mean span')), bl0: txt(main?.querySelector('.sj-count .sj-bl0')), co: main?.querySelector('.sj-count .sj-huge')?.getAttribute('data-co') ?? null,
        unit: [...(main?.querySelectorAll('.sj-count .sj-pu') ?? [])].map(t => t.textContent).join(' '),
        sec: !!sec, after: !!sec && !!sec.previousElementSibling?.matches?.('section.sj-sun'), h: txt(sec?.querySelector('h2.sj-h2')), lead: txt(sec?.querySelector('.sj-lead')), day: txt(sec?.querySelector('.sj-dayl')),
        sets: 0, go: sec?.querySelector('a.sj-go:not(.sj-all)')?.getAttribute('href') ?? null /* 정산 고리 — 「서른여섯 꾀 모두 보기」(a.sj-go.sj-all · 주문 1117-1120)는 셈 밖 */, rule: txt(sec?.querySelector('.sj-rule')), ord: sec?.getAttribute('data-order') ?? null,
        open7: [...(sec?.querySelectorAll(':scope > ol.sj-tricks > li.sj-tk') ?? [])].map(e => e.getAttribute('data-k')), allH: sec?.querySelector(':scope > a.sj-all')?.getAttribute('href') ?? null, allT: txt(sec?.querySelector(':scope > a.sj-all > span')), fold: [...(sec?.querySelectorAll(':scope > details.sj-tmore:not([open]) li.sj-tk') ?? [])].map(e => e.getAttribute('data-k')),
        sun: (() => { const c = main?.querySelector(':scope > section.sj-sun[data-land]'); if (!c) return null; const lp = c.querySelector('figure.sj-landfig svg.ik-land'); // 먹그림(주문 1116-0118) — 깃발 열 · 디딤돌 스물
          return {first: !!c.previousElementSibling?.matches?.('section.sj-cover'), nextS36: c.nextElementSibling?.matches?.('section.sj-s36:not(.sj-wait)') ?? false, land: c.getAttribute('data-land'), name: txt(c.querySelector('.sj-land')), q: txt(c.querySelector('.sj-q p')), m: [...c.querySelectorAll('.sj-m li > p:first-child')].map(txt),
            ink: lp ? {land: lp.getAttribute('data-land'), up: lp.getAttribute('data-up'), upN: lp.querySelectorAll('.ik-bn.ik-up').length, dnN: lp.querySelectorAll('.ik-bn.ik-dn').length, hero: !!lp.querySelector('g')} : null,
            strip: [...(lp?.querySelectorAll('.ik-st') ?? [])].map(r => (r.classList.contains('ik-same') ? 1 : 0) + (r.classList.contains('ik-now') ? 2 : 0)), pc: txt(c.querySelector('.sj-pc')), safe: txt(c.querySelector('.sj-safe')), small: [...c.querySelectorAll('p, li, cite, b, span')].filter(e => e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 17).length}; })(),
        now: (() => { const c = main?.querySelector(':scope > section.sj-sun .sj-now'); if (!c) return null; const a = c.querySelector('a.sj-nowp'), r = a?.getBoundingClientRect(); // 지금 시장(주문 1118-1239)
          return {prev: c.previousElementSibling?.classList?.contains('sj-today') ?? false, k: c.getAttribute('data-k'), open: c.getAttribute('data-open'), prov: c.getAttribute('data-prov'), head: txt(c.querySelector('.sj-nowk')), o: txt(c.querySelector('.sj-nowo')),
            ix: [...c.querySelectorAll('ul.sj-nowi > li')].map(li => [li.getAttribute('data-ix'), txt(li.querySelector('.sj-nowx')), txt(li.querySelector('.sj-nowv')), txt(li.querySelector('.sj-nowc'))]), fl: [...c.querySelectorAll('ul.sj-nowf > li')].map(li => [li.getAttribute('data-ix'), txt(li)]), f0: txt(c.querySelector('.sj-nowf0')),
            href: a?.getAttribute('href') ?? null, win: a?.getAttribute('data-win') ?? null, pick: txt(c.querySelector('.sj-nowp2')), safe: txt(c.querySelector('.sj-nows')), tap: r ? Math.round(Math.min(r.width, r.height)) : null,
            small: [...c.querySelectorAll('p, li, b, span, a, summary')].filter(e => e.textContent.trim() && getComputedStyle(e).display !== 'none' && parseFloat(getComputedStyle(e).fontSize) < 17).length}; })(),
        gs: [...(sec?.querySelectorAll('li.sj-tk') ?? [])].map(e => ({k: e.getAttribute('data-k'), n: e.getAttribute('data-n'), rk: e.getAttribute('data-rank'), h: txt(e.querySelector('.sj-tkh')), s: txt(e.querySelector('.sj-say')), none: txt(e.querySelector('.sj-tnone')), gr: txt(e.querySelector('.sj-tl')), dots: e.querySelectorAll('svg.ik-arrows .ik-ar.ik-broken').length, arrows: e.querySelector('svg.ik-arrows') ? e.querySelectorAll('svg.ik-arrows .ik-ar').length : -1, pic: e.querySelector(':scope > a.sj-tkpic svg.ik-kk')?.getAttribute('data-k') ?? null,
          cs: [...e.querySelectorAll('a.sj-chip')].map(a => [a.getAttribute('href'), txt(a.querySelector('b')), txt(a.querySelector('.sj-chipd'))]), sp: [...e.querySelectorAll('a.sj-chip')].map(spOf)})),
        qd: [...(main?.querySelectorAll('a.sj-row[data-k="quiet"]') ?? [])].map(a => [a.getAttribute('data-code'), a.querySelector('.sj-qd')?.textContent ?? '']),
        ov: (() => { const o = sec?.querySelector('.sj-ov'); if (!o) return null;
          return {after: !!o.previousElementSibling?.matches?.('details.sj-tmore, ol.sj-tricks'), oh: txt(o.querySelector('.sj-h3')), k: o.getAttribute('data-k'), n: o.getAttribute('data-n'), gh: txt(o.querySelector('.sj-ovh')), gs: txt(o.querySelector('.sj-say')),
            cs: [...o.querySelectorAll('a.sj-chip.sj-chip-ov')].map(a => [a.getAttribute('href'), txt(a.querySelector('b')), txt(a.querySelector('.sj-chipn')), txt(a.querySelector('.sj-chipd'))]), sp: [...o.querySelectorAll('a.sj-chip.sj-chip-ov')].map(spOf)}; })(),
        small: [...(sec?.querySelectorAll('a') ?? [])].filter(a => { const r = a.getBoundingClientRect(); return r.width < 47.5 || r.height < 47.5; }).length}; });
    check(g.big === '' && g.tot === '' && g.tab === '오늘', W + '처음 쪽 「오늘 이름이 오른 회사」 큰 값 · 칸 수 풀이 0 · 첫 탭 「오늘」(병법 서른여섯만 — 주문 1115-1843)', JSON.stringify({big: g.big, tot: g.tot, tab: g.tab}));
    const wantG = okG ? ORD36.slice(0, HOME36).map(k => ({k, n: String(Math.min(7, G36.lists[k].length)), rk: RK36[k] ? String(RK36[k].i) : null, h: (RK36[k] ? String(RK36[k].i) : '') + G36.name[k] + ' ' + G36.han[k] + ' · ' + Math.min(7, G36.lists[k].length) + '곳›', s: G36.say[k], gr: recW(RK36[k]), // 꾀 이름 줄을 누르면 그 꾀 쪽(주문 1115-2328 · 끝 「›」)
      dots: RK36[k]?.n && RK36[k].lose ? Math.max(1, Math.round(RK36[k].lose / RK36[k].n * 10)) : 0, arrows: RK36[k]?.n ? 10 : -1, pic: k, cs: G36.lists[k].slice(0, 7).map(c => ['#/c/' + c.code, c.name, Number.isInteger(c.days) && c.days >= 1 ? c.days + '일째' : ''])})) : []; // 꾀 그림 · 화살 열(꺾인 화살 = 잃은 몫 — 주문 1116-0118) // 며칠째(주문 1114-0151) · 덜 잃은 차례 · 지난 기록 · 잃은 몫 점(주문 1114-0922)
    const badG = wantG.map((w, i) => { const x = g.gs[i]; return x && x.k === w.k && x.n === w.n && x.rk === w.rk && x.h === w.h && x.s === w.s && x.gr === w.gr && x.dots === w.dots && x.arrows === w.arrows && x.pic === w.pic && JSON.stringify(x.cs) === JSON.stringify(w.cs) && (w.cs.length ? !x.none : !!x.none) ? null : w.k; }).filter(Boolean);
    check(same ? g.sec && g.after && g.gs.length === HOME36 && !badG.length && g.sets === 0 && JSON.stringify(g.open7) === JSON.stringify(ORD36.slice(0, HOME36)) && g.fold.length === 0 && g.allH === '#/k' && g.allT === '서른여섯 꾀 모두 보기' && g.ord === (ORD36 === K36 ? 'kind' : 'sun') : !g.sec,
      W + '형세 보고 바로 아래 꾀 셋(주문 1114-0922 · 1117-1120 샘플 다) — 덜 잃은 차례 위 셋 · 「서른여섯 꾀 모두 보기」 → 꾀 탭 · 차례 번호 · 쉬운 이름 · 꾀 이름 · 곳 수 · 지난 기록 · 잃은 몫 점 · 고르는 법 · 회사 일곱 = 자료(누르면 그 회사 쪽) · 고르지 못한 꾀는 까닭 한 줄', JSON.stringify({sec: g.sec, before: g.after, n: g.gs.length, bad: badG.slice(0, 4), sets: g.sets, open7: g.open7.length, fold: g.fold.length, all: [g.allH, g.allT], ord: g.ord}));
    // 형세 카드(주문 1114-0922) — 첫 쪽 맨 위 · 바로 아래 꾀 차례 · 땅 이름 · 손자병법 말씀 · 오른 곳 수 = 자료 · 막대 넓이 = 오른 몫 · 스무 날 띠 = 자료(같은 땅 칸 · 오늘 칸) · 안전 문장 · 글씨 17 넘음
    const up10W = okSunD && !sunBad.length ? Math.round(10 * SUN.m.up / SUN.m.n) : null; // 깃발 열 가운데 선 깃발 = 오른 몫(열에 몇 · 주문 1116-0118)
    const sunW = okSunD && !sunBad.length ? {first: true, nextS36: same, land: SUN.land, name: SUN.name, q: '「' + SUN.quote + '」', m0: '큰 회사 ' + SUN.m.n + '곳 가운데 ' + SUN.m.up + '곳이 한 달 전보다 올랐어요.', ink: {land: SUN.land, up: String(up10W), upN: up10W, dnN: 10 - up10W, hero: true},
      strip: (SUN.path ?? []).filter(k => k in LANDN).slice(-20).map((k, i, a) => (k === SUN.land ? 1 : 0) + (i === a.length - 1 ? 2 : 0)), safe: '지난 기록으로 본 모습이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'} : null;
    const sunGot = g.sun ? {first: g.sun.first, nextS36: g.sun.nextS36, land: g.sun.land, name: g.sun.name, q: g.sun.q, m0: g.sun.m[0] ?? '', ink: g.sun.ink, strip: g.sun.strip, safe: g.sun.safe} : null;
    const barOk = true; // 옛 막대 → 깃발 열(위 ink 에서 맞댐)
    check(sunW ? JSON.stringify(sunGot) === JSON.stringify(sunW) && barOk && g.sun.small === 0 && g.sun.m[1] === '회사들을 한 달 동안 오른 만큼 줄 세웠어요. 한가운데 회사는 100원이 ' + w100(SUN.m.mid) + '이 됐어요.' : !g.sun,
      W + '형세 카드(주문 1114-0922 · 먹그림 1116-0118) — 맨 위 · 바로 아래 꾀 차례 · 땅 이름 · 말씀 · 오른 곳 = 자료 · 선 깃발 = 열에 오른 몫 · 손무 · 한가운데 회사 100원이 ○원 · 디딤돌 스물 = 자료(같은 땅 · 오늘) · 안전 문장 · 글씨 17', JSON.stringify({want: !!sunW, diff: sunW && sunGot ? Object.keys(sunW).filter(k => JSON.stringify(sunW[k]) !== JSON.stringify(sunGot[k])) : [!!sunW, !!g.sun], bar: barOk, small: g.sun?.small ?? null, m1: g.sun?.m?.[1] ?? null}).slice(0, 400));
    // 지금 시장(주문 1118-1239 · 사장님 2026-11-18(마카오) 12:39 · 12:48 「응」) — su21.json now 가 있으면 땅 이름 바로 아래 칸 하나 · 지수 둘 = 자료(소수 둘째 자리 · 어제보다 오르내림) ·
    //   외국인이 사고판 돈 = 자료(억 원 · 더 샀어요/팔았어요) · 지금 볼 꾀 = 꾀 셋 맨 앞(없으면 덜 잃은 차례 맨 위) · 받은 때 · 장중이면 굳지 않은 값 · 안전 문장 · 글씨 17 · 누르는 곳 48 / 없으면 칸 없음
    { const NW = T36?.now, IXN = {KOSPI: '코스피', KOSDAQ: '코스닥'}, ixF = new Intl.NumberFormat('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}), nF = new Intl.NumberFormat('ko-KR'), fin2 = v => typeof v === 'number' && Number.isFinite(v);
      const okN = !!NW && /^\d{4}-\d{2}-\d{2}$/.test(NW.day ?? '') && /^\d{2}:\d{2}$/.test(NW.hm ?? '') && !!NW.index && Object.keys(IXN).some(s => fin2(NW.index[s]?.price) && NW.index[s].price > 0) && !!(okSunD && !sunBad.length);
      const md = d => +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일', hmW = hm => { const H = +hm.slice(0, 2), M = +hm.slice(3, 5); return (H < 12 ? '오전 ' : '오후 ') + (H % 12 === 0 ? 12 : H % 12) + '시' + (M ? ' ' + M + '분' : ''); };
      const mv = v => !fin2(v.change) ? '' : v.change > 0 ? '어제보다 ' + ixF.format(v.change) + ' 올랐어요.' : v.change < 0 ? '어제보다 ' + ixF.format(-v.change) + ' 내렸어요.' : '어제와 같아요.';
      const fsay = (s, v) => '외국인은 ' + IXN[s] + '에서 ' + (v === 0 ? '산 돈과 판 돈이 같았어요.' : nF.format(Math.abs(Math.round(v))) + '억 원어치를 더 ' + (v > 0 ? '샀어요.' : '팔았어요.'));
      const NM = G36?.name ?? {}, wk = (SUN?.win3?.ks ?? []).filter(k => typeof NM[k] === 'string'), rk = (SUN?.rank ?? []).map(r => r.k).filter(k => typeof NM[k] === 'string'), pk = wk[0] ?? rk[0] ?? null;
      const want = okN ? {prev: true, k: pk, open: NW.open ? '1' : '0', prov: NW.prov ? '1' : '0', head: '지금 시장 · 한국 시간 ' + md(NW.day) + ' ' + hmW(NW.hm), o: NW.open ? '장이 열려 있을 때 받은 값이에요. 아직 바뀔 수 있어요.' : '',
        ix: Object.keys(IXN).filter(s => fin2(NW.index[s]?.price) && NW.index[s].price > 0).map(s => [s, IXN[s], ixF.format(NW.index[s].price), NW.index[s].today === false ? md(NW.index[s].date) + ' 마지막 값이에요.' : mv(NW.index[s])]),
        fl: Object.keys(IXN).filter(s => fin2(NW.flows?.[s]?.foreign)).map(s => [s, (NW.flows[s].today === false ? md(NW.flows[s].date) + ' 하루 동안 ' : '') + fsay(s, NW.flows[s].foreign)]),
        f0: Object.keys(IXN).some(s => fin2(NW.flows?.[s]?.foreign)) ? '' : '외국인이 사고판 돈은 아직 받지 못했어요.',
        href: pk ? '#/k/' + pk : null, win: pk ? (wk[0] === pk ? '1' : '0') : null, pick: pk ? NM[pk] : '', safe: '하루에 세 번 새로 봐요. 한국 시간으로 오전 10시, 오후 2시, 장이 끝난 뒤 오후 6시예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'} : null;
      const got = g.now ? {prev: g.now.prev, k: g.now.k, open: g.now.open, prov: g.now.prov, head: g.now.head, o: g.now.o, ix: g.now.ix, fl: g.now.fl, f0: g.now.f0, href: g.now.href, win: g.now.win, pick: g.now.pick, safe: g.now.safe} : null;
      const provOk = !okN || !NW.prov || (SUN.prov === true && SUN.day === NW.day && SUN.conf === T36?.asOf?.board);
      check(want ? JSON.stringify(got) === JSON.stringify(want) && g.now.small === 0 && (g.now.tap ?? 0) >= 48 && provOk : !g.now,
        W + '지금 시장(주문 1118-1239) — 땅 이름 바로 아래 · 지수 둘 · 외국인이 사고판 돈 = 자료 · 지금 볼 꾀 = 꾀 셋 맨 앞(없으면 차례 맨 위) · 받은 때 · 장중 = 굳지 않은 값(땅은 그때 값 · 지난 기록은 굳은 날까지) · 글씨 17 · 누르는 곳 48',
        JSON.stringify({want: !!want, diff: want && got ? Object.keys(want).filter(k => JSON.stringify(want[k]) !== JSON.stringify(got[k])).map(k => [k, want[k], got[k]]).slice(0, 3) : null, small: g.now?.small, tap: g.now?.tap, provOk}).slice(0, 600)); }
    // 한 달 꺾은선(주문 1114-0325) — 단추마다 값이 맞는 회사면 꺾은선 하나(21점 = line c 그대로 · 오르내림 차례 = 값 · 한 달 전 옅은 줄 = 첫 값 높이 · 끝 찬 점 = 끝 값 · 단추 안) · 소리 이름표에 한 달 전 값 · 마지막 값 · 값이 없으면 그림 없음
    const spBad = [], bdM = DAYz.test(G36?.asOf?.board ?? '') ? mdM(G36.asOf.board) + ' ' : '';
    const spOne = (c, x, spBad) => { // 단추 하나 — 꾀 칸 · 겹친 곳 같은 잣대
      const v = spW36(c);
      if (!x) { spBad.push(c.name + ' 단추 없음'); return; }
      if (!v) { if (x.n || x.line) spBad.push(c.name + ' 값이 없는데 꺾은선'); return; }
      const pts = ptsOf(x.line, /(-?[\d.]+) (-?[\d.]+)/g), lo = Math.min(...v), hi = Math.max(...v);
      if (x.n !== 1 || pts.length !== 21) { spBad.push(c.name + ' 꺾은선 ' + x.n + ' · 점 ' + pts.length); return; }
      const yT = Math.min(...pts.map(q => q[1])), yB = Math.max(...pts.map(q => q[1])), by = +(/M[\d.]+ ([\d.]+)H/.exec(x.base)?.[1] ?? NaN);
      const sameWay = hi === lo ? yB - yT < 0.15 : pts.every((q, n) => Math.abs(q[1] - (yT + ((hi - v[n]) / (hi - lo)) * (yB - yT))) <= 0.15);
      if (!sameWay || !pts.every((q, n) => !n || q[0] > pts[n - 1][0])) { spBad.push(c.name + ' 오르내림이 값과 다름'); return; }
      if (!(Math.abs(by - pts[0][1]) < 0.15)) { spBad.push(c.name + ' 한 달 전 줄'); return; }
      if (!x.dot || Math.abs(x.dot[0] - pts[20][0]) > 0.15 || Math.abs(x.dot[1] - pts[20][1]) > 0.15) { spBad.push(c.name + ' 끝 점'); return; }
      if (!x.inside) { spBad.push(c.name + ' 꺾은선이 단추 밖'); return; }
      if (!x.lab.includes(' · 한 달 전 ' + NFm.format(v[0]) + '원 · ' + bdM + '마지막 값 ' + NFm.format(v[20]) + '원')) spBad.push(c.name + ' 이름표 ' + x.lab);
    };
    if (same) ORD36.slice(0, HOME36).forEach((k, i) => G36.lists[k].slice(0, 7).forEach((c, j) => spOne(c, g.gs[i]?.sp?.[j], spBad)));
    const spGot = same ? g.gs.reduce((a, x) => a + (x.sp ?? []).filter(y => y.n).length, 0) : 0;
    check(!same || (!spBad.length && spGot === ORD36.slice(0, HOME36).flatMap(k => G36.lists[k].slice(0, 7)).filter(spW36).length), W + '꾀 칸 회사 단추마다 한 달 꺾은선(주문 1114-0325) = 자료 그대로 · 한 달 전 줄 · 끝 점 · 단추 안 · 이름표', JSON.stringify({got: spGot, want: spN36, bad: spBad.slice(0, 4)}).slice(0, 400));
    if (width === 390) R.m.s36.sp.got = spGot;
    // 겹친 곳(주문 1114-0802) — 꾀 칸 머리 바로 아래 · 갈래 「겹친 곳」 · 묶음 머리 「세 묶음 이상에 든 곳 · ○곳」 · 풀이 · 칸 = 자료 차례(누르면 그 회사 쪽 · 이름 · ○묶음 · ○일째) · 꺾은선 = 꾀 칸과 같은 잣대 · 이름표에 묶음 수
    const ovBad = [];
    const ovWant = null; // 주문 1115-1843 — 겹친 곳(위 네 창 · 될 듯 세 창과 함께 센 마흔세 묶음)은 처음 쪽에서 지움(병법 서른여섯만)
    if (same && ovWant) { OVLL.forEach((c, j) => { spOne(c, g.ov?.sp?.[j], ovBad); const x = g.ov?.sp?.[j]; if (x && !x.lab.startsWith(c.name + ' · ' + c.n + '묶음')) ovBad.push(c.name + ' 이름표 묶음 수'); }); }
    const ovGot = g.ov ? (g.ov.sp ?? []).filter(y => y.n).length : 0, ovSame = !g.ov ? null : {after: g.ov.after, oh: g.ov.oh, k: g.ov.k, n: g.ov.n, gh: g.ov.gh, gs: g.ov.gs, cs: g.ov.cs};
    check(!same || (ovWant ? JSON.stringify(ovSame) === JSON.stringify(ovWant) && !ovBad.length && ovGot === ovSpN : !g.ov),
      W + '겹친 곳 0(네 창 · 될 듯 세 창과 함께 센 묶음 — 병법 서른여섯만 · 주문 1115-1843)',
      JSON.stringify({got: ovGot, want: ovSpN, bad: ovBad.slice(0, 3), diff: ovWant && ovSame ? Object.keys(ovWant).filter(k => JSON.stringify(ovSame[k]) !== JSON.stringify(ovWant[k])) : [!!ovWant, !!g.ov]}).slice(0, 400));
    const dayW = (spN36 ? '회사 이름 옆 꺾은선은 한 달 동안의 값이에요. 점선은 한 달 전 값이에요. ' : '') + '한 회사가 여러 꾀에 함께 들 수 있어요.' + (DAYz.test(G36?.daysFrom ?? '') ? ' 「며칠째」는 ' + mdM(G36.daysFrom) + ' 기록부터 셌어요.' : '');
    check(g.qd.length === 0, W + '처음 쪽 조용한 힘 칸 0(병법 서른여섯만 — 주문 1115-1843)', JSON.stringify(g.qd).slice(0, 120));
    const HS = ORD36 !== K36 ? SUN.hist : null, ymW = t => (DAYz.test(t ?? '') ? t.slice(0, 4) + '년 ' + +t.slice(5, 7) + '월' : null);
    const ruleW = HS ? (HS.all ? '장이 열린 날로 지난 ' + HS.days + '일을 모두 봤어요. ' : '장이 열린 날로 지난 ' + HS.days + '일을 봤어요. 그 가운데 오늘처럼 ' + SUN.name + '이었던 ' + HS.same + '일을 골랐어요. ') + '그날마다 꾀가 고른 회사 일곱 곳의 닷새 뒤 값을 봤어요. 잃은 때가 적은 꾀를 위에 놓았어요.' + (ymW(HS.from) && ymW(HS.to) ? ' 센 기간은 ' + ymW(HS.from) + '부터 ' + ymW(HS.to) + '까지예요.' : '') : '';
    check(!same || (g.h === (HS ? '덜 잃은 꾀 차례' : '서른여섯 꾀') && g.lead === '삼십육계는 옛날부터 전해 오는 꾀 서른여섯 가지예요. ' + (G36?.pick?.rule === PICK28 ? '꾀마다 회사를 세 번 거른 뒤, 점수가 높은 회사를 일곱 곳까지 골랐어요.' : '꾀마다 그날 그 꾀를 가장 닮은 회사를 일곱 곳 골랐어요.') && g.rule === ruleW && g.day.endsWith(dayW) && g.go === '#/r/t' && g.small === 0),
      W + '꾀 칸 머리 · 한 줄 풀이(삼십육계 — 손자병법과 따로 · 주문 1114-0922) · 차례 까닭(같은 땅 날 · 닷새 뒤 · 덜 잃은 차례) · 고른 날 · 같은 회사 여러 꾀 · 정산 고리 · 누름 48', JSON.stringify({h: g.h, lead: g.lead, rule: [g.rule, ruleW], day: g.day, go: g.go, small: g.small}).slice(0, 500));
    // 지금 땅의 꾀 셋(주문 1117-1859 · 사장님 2026-11-17(마카오) 18:59 「… 병법 3가지를 선정해서 첫 페이지애 잘보이게 하라」 — docs/design/sonja-win3-2026-11-17/order-1859.txt)
    //   검사가 형세 자료 rank(덜 잃은 차례)에서 다시 셈: 위에서부터 센 날 minN 넘게 · 잃은 번 < 아무렇게나 일곱이 잃을 번 · 꼬리 > 아무렇게나 일곱 꼬리 — 셋까지 · 차례 그대로 · 꾀 칸 맨 위(차례 말씀 바로 아래)
    const SV = okSunD && !sunBad.length ? SUN : null;
    const w3 = await p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), sec = document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), c = sec?.querySelector(':scope > .sj-win3');
      if (!c) return {none: true, any: !!document.querySelector('#su .sj-win3')};
      return {n: c.getAttribute('data-n'), k: t(c.querySelector('.sj-win3k')), l: t(c.querySelector('.sj-win3l')), f: t(c.querySelector('.sj-win3f')), s: t(c.querySelector('.sj-win3s')), none: t(c.querySelector('.sj-tnone')),
        items: [...c.querySelectorAll('li.sj-w3')].map(li => ({k: li.getAttribute('data-k'), href: li.querySelector('a.sj-w3a')?.getAttribute('href') ?? null, num: t(li.querySelector('.sj-w3n')), name: t(li.querySelector('.sj-w3t')), han: t(li.querySelector('.sj-w3h')),
          m: t(li.querySelector('.sj-w3m')), r: t(li.querySelector('.sj-w3r')), r2: t(li.querySelector('.sj-w3r2'))})),
        prev: c.previousElementSibling?.className ?? '', next: c.nextElementSibling?.className ?? ''}; });
    if (same && SV) {
      const ten3 = x => String(Math.round(x * 100)); // 100번 가운데 몇 번(주문 1118-1700)
      const winOkC = r => Number.isInteger(r.n) && r.n >= (Number.isInteger(SV.minN) ? SV.minN : 20) && Number.isInteger(r.lose) && Number.isFinite(r.exp) && Number.isFinite(r.tail) && Number.isFinite(r.tail7) && (r.exp - r.lose) / r.n >= 0.02 - 1e-12 && r.tail - r.tail7 >= 0.002 - 1e-12 && SV.win3?.gap === 0.02 && SV.win3?.tailGap === 0.002;
      const W3 = SV.rank.filter(winOkC).map(r => r.k), ks = SV.win3?.rule === 'win3-v1' && Array.isArray(SV.win3.ks) ? SV.win3.ks.slice(0, 3) : null;
      const dataOk3 = !ks || (JSON.stringify(ks) === JSON.stringify(W3.slice(0, 3)) && SV.win3.cand === W3.length);
      const RBv = Object.fromEntries(SV.rank.map(r => [r.k, r]));
      const KN3 = ['', '하나', '둘', '셋'], n3 = ks ? ks.length : 0;
      const want3 = !ks ? null : {n: String(n3), k: SV.name + '에서 덜 잃은 꾀' + (n3 ? ' ' + KN3[n3] : ''), l: (SV.hist?.all ? '지난 기록을 모두 봤어요.' : '예전에 지금처럼 ' + SV.name + '이었던 날들을 봤어요.') + ' 아무 회사나 고른 것보다 덜 자주 잃고, 크게 잃을 때도 덜 잃은 꾀예요.',
        f: n3 && n3 < 3 ? '두 가지를 모두 갖춘 꾀는 ' + KN3[n3] + '뿐이에요. 억지로 채우지 않았어요.' : '',
        s: '지금 같은 시장이었던 지난 기록으로 고른 꾀예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.', none: ks.length ? '' : '오늘은 두 가지를 모두 갖춘 꾀가 없어요. 아래 꾀 차례를 보세요.',
        items: ks.map((k, i) => { const r = RBv[k]; return {k, href: '#/k/' + k, num: String(i + 1), name: G36.name?.[k] ?? k, han: G36.han?.[k] ?? '', m: G36.mean?.[k] ?? '',
          r: '100번 가운데 ' + ten3(r.lose / r.n) + '번 잃었어요. 아무 회사나 고르면 ' + ten3(r.exp / r.n) + '번 잃었어요.', r2: '가장 나빴던 때는 100원이 ' + w100(r.tail) + '이 됐어요. 아무 회사나 고르면 ' + w100(r.tail7) + '이 됐어요.'}; })};
      const got3 = w3?.none ? null : {n: w3.n, k: w3.k, l: w3.l, f: w3.f, s: w3.s, none: w3.none, items: w3.items};
      const place3 = !ks || (!!got3 && /\bsj-q\b|\bsj-sh\b/.test(w3.prev) && /\bsj-loss\b|\bsj-calm\b|\bsj-th\b|\bsj-tricks\b/.test(w3.next));
      check(dataOk3 && JSON.stringify(got3) === JSON.stringify(want3) && place3 && !(w3?.none && w3.any),
        W + '지금 땅의 꾀 셋(주문 1117-1859) — 덜 잃은 차례 안에서 두 조건(아무렇게나 일곱보다 덜 잃음 · 가장 나빴던 열에 한 주가 얕음) · 셋까지 · 차례 그대로 · 꾀 칸 맨 위',
        JSON.stringify({dataOk3, place3, ks, W3: W3.slice(0, 5), prev: w3?.prev, next: w3?.next, diff: want3 && got3 ? Object.keys(want3).filter(k => JSON.stringify(want3[k]) !== JSON.stringify(got3[k])).map(k => [k, got3[k], want3[k]]) : [!!want3, !!got3]}).slice(0, 700));
    }
    // 크게 덜 잃는 일곱(주문 1117-1731 · 사장님 2026-11-17(마카오) 17:31 「응」 — docs/design/sonja-wise2-2026-11-17/order-1720.txt) — 꾀 칸 안 줄어든 갈래 바로 아래(없으면 큰 갈래 바로 위)
    //   자료 calm 그대로 · 고른 곳마다 거래량 꾀를 뺀 꾀 둘 넘게가 함께 고름(검사가 자료 lists 로 다시 셈) · 업종 둘까지 · 일곱까지 · 지난 기록 두 줄(크게 잃은 꼬리 · 잃은 번 — 하나만 보이면 실패)
    const CM = G36?.calm?.rule === 'calm7-v1' && Array.isArray(G36.calm.list) ? G36.calm : null;
    const cm = await p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), sec = document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), c = sec?.querySelector(':scope > .sj-calm');
      if (!c) return {none: true, any: !!document.querySelector('#su .sj-calm')};
      return {n: c.getAttribute('data-n'), k: t(c.querySelector('.sj-calmk')), l: t(c.querySelector('.sj-calml')), cs: [...c.querySelectorAll('a.sj-chip')].map(a => [a.getAttribute('href'), t(a.querySelector('b'))]),
        r: t(c.querySelector('.sj-calmr')), r2: t(c.querySelector('.sj-calmr2')), d: t(c.querySelector('.sj-calmd')), none: t(c.querySelector('.sj-tnone')), prev: c.previousElementSibling?.className ?? '', next: c.nextElementSibling?.className ?? ''}; });
    if (same) {
      const ten = x => String(Math.round(x * 100)); // 100번 가운데 몇 번(주문 1118-1700)
      const nonVol = G36.kinds.filter(k => G36.by?.[k] !== 'vol'), hitsOf = code => nonVol.filter(k => (G36.lists[k] ?? []).some(c => c?.code === code)).length;
      const L = CM ? CM.list.slice(0, 7) : [], perInd = {};
      for (const c of L) perInd[c.ind] = (perInd[c.ind] ?? 0) + 1;
      const R = CM?.rec, okR = !!R && R.rule === 'calm7-v1' && Number.isInteger(R.n) && R.n > 0 && Number.isInteger(R.lose) && R.lose >= 0 && R.lose <= R.n && Number.isFinite(R.exp) && Number.isFinite(R.tail) && Number.isFinite(R.tail7);
      const dataOk = !CM || (CM.list.length <= 7 && L.every(c => /^\d{6}$/.test(c.code) && hitsOf(c.code) >= 2 && c.n === hitsOf(c.code) && c.ind === G36.ind?.[c.code]) && Object.values(perInd).every(v => v <= 2) && new Set(L.map(c => c.code)).size === L.length);
      const want = !CM ? null : {n: String(L.length), k: '덜 흔들린 회사 일곱 곳', l: '꾀 두 가지 이상이 함께 고른 회사 가운데, 요즘 덜 흔들린 회사예요. 하는 일이 같은 회사는 두 곳까지만 골랐어요.',
        cs: L.map(c => ['#/c/' + encodeURIComponent(c.code), c.name]), none: L.length ? '' : '오늘은 꾀 두 가지 이상이 함께 고른 회사가 없어요.',
        r: okR ? '가장 나빴던 때는 100원이 ' + w100(R.tail) + '이 됐어요. 아무 회사나 일곱 곳을 고르면 ' + w100(R.tail7) + '이 됐어요.' : '지난 기록을 세지 못했어요.',
        r2: okR ? '잃은 때는 100번 가운데 ' + ten(R.lose / R.n) + '번이에요. 아무 회사나 고르면 ' + ten(R.exp / R.n) + '번이에요.' : '',
        d: okR ? '장이 열린 지난 ' + R.n + '일 동안, 날마다 같은 방법으로 골라 닷새 뒤 값과 비교했어요.' + (ymW(R.from) && ymW(R.to) ? ' 센 기간은 ' + ymW(R.from) + '부터 ' + ymW(R.to) + '까지예요.' : '') : ''};
      const got = cm?.none ? null : {n: cm.n, k: cm.k, l: cm.l, cs: cm.cs, none: cm.none, r: cm.r, r2: cm.r2, d: cm.d};
      const place = !CM || cm?.none || ((/\bsj-loss\b/.test(cm.prev) || /\bsj-q\b|\bsj-sh\b|\bsj-win3\b/.test(cm.prev)) && (/\bsj-th\b|\bsj-tricks\b/.test(cm.next)));
      check(dataOk && JSON.stringify(got) === JSON.stringify(want) && place && !(cm?.none && cm.any),
        W + '크게 덜 잃는 일곱(주문 1117-1731) — 자료 그대로 · 두 꾀 넘게(거래량 꾀 뺌) · 업종 둘까지 · 일곱까지 · 지난 기록 두 줄(꼬리 · 잃은 번) · 줄어든 갈래 바로 아래',
        JSON.stringify({dataOk, place, prev: cm?.prev, next: cm?.next, diff: want && got ? Object.keys(want).filter(k => JSON.stringify(want[k]) !== JSON.stringify(got[k])).map(k => [k, got[k], want[k]]) : [!!want, !!got]}).slice(0, 600));
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
  // ㉕ 주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답) — 다른 쪽도 병법 서른여섯만 · 이 검사가 자료에서 따로 셈(화면 코드를 쓰지 않음)
  //   가) 꾀 모음 #/k — 여섯 묶음(묶음 이름 = 자료 set) × 여섯 꾀(삼십육계 차례) · 꾀마다 「제 ○계」 · 쉬운 이름 · 꾀 이름 · 오늘 차례 · 뜻 · 누르면 그 꾀 쪽 · 첫 쪽 꾀 이름 줄도 그 꾀 쪽
  //   나) 꾀 한 가지 #/k/g01 ~ g36(390 은 서른여섯 모두 · 320 은 셋) — 걸음 2 / 5 · 머리(묶음 · 도장 = 오늘 차례 · 뜻 · 지금 땅에서 몇 위) · 고르는 법 · 같은 땅 기록 · 오늘 닮은 곳(누르면 그 회사) · 이 꾀 정산 · 앞뒤 꾀 · 다음 단추
  //   다) 회사 #/c/<번호>(길 셋째 회사 · 오늘 어느 꾀에도 없는 회사 하나) — 걸음 3 / 5 · 이름 · 시장 · 업종 · 고른 꾀(덜 잃은 차례 · 지난 기록 · 고르는 법 · 누르면 그 꾀) · 한 달 꺾은선 글 · 「왜 사?」 고리
  const ST25 = await J('/su/data/su21-settle.json').catch(() => null);
  const useG25 = !!SN && okG && ['mean', 'set', 'say', 'name', 'han'].every(f => K36.every(k => typeof G36[f]?.[k] === 'string' && G36[f][k])), G25 = useG25 ? G36 : S36C.base36(), okT25 = true; // 꾀 칸 자료가 없는 날 = 바탕 글(오늘 고른 곳 0)
  const spW25 = c => (useG25 ? spW36(c) : null);
  const sun25 = okSunD && !sunBad.length ? SUN : null, ymW25 = t => (DAYz.test(t ?? '') ? t.slice(0, 4) + '년 ' + +t.slice(5, 7) + '월' : null), kn25 = k => +k.slice(1);
  const set25 = k => { if (!ST25 || !Array.isArray(ST25.buys) || !Array.isArray(ST25.kinds)) return null; const q = Number.isFinite(ST25.qty) ? ST25.qty : 10;
    const rs = ST25.buys.filter(b => ST25.kinds[b[1]] === k && Number.isFinite(b[3]) && b[3] > 0).map(([d, , code, buy]) => { const [now, nd] = ST25.now?.[code] ?? [buy, d]; return {cost: buy * q, val: now * q, one: !(nd > d)}; });
    const cost = rs.reduce((a, r) => a + r.cost, 0), val = rs.reduce((a, r) => a + r.val, 0), one = rs.length > 0 && rs.every(r => r.one);
    return {dd: [wonM(cost), rs.length ? wonM(val) : '아직 산 적이 없어요'], res: !rs.length ? '아직 산 적이 없어요' : one ? '아직 하루밖에 안 지났어요' : movedM(val - cost)}; };
  const none25 = w => (/거래량|사고판/.test(w ?? '') ? '그날 사고판 양 자료가 없어서 고르지 못했어요.' : /꾀 뜻/.test(w ?? '') ? '오늘은 이 꾀에 맞는 회사가 없어요. 억지로 다른 회사를 채우지 않았어요.' : '지난 값 자료가 모자라서 고르지 못했어요.');
  // 세 거름 수(주문 1116-1539) — 첫 쪽 「고르는 법」 칸 · 꾀 쪽 「주식에서는 이렇게 골라요」 = 자료 funnel(맞지 않으면 그리지 않음)
  const funWant = k => { const f = useG25 ? FUN28(k) : null; return f ? {l: '큰 회사 ' + f.n + '곳을 세 번 걸렀어요.', rows: [['열 가지 기준을 통과한 회사', f.cut + '곳'], ['꾀의 뜻에 맞는 회사', f.mean + '곳'], ['우연으로 보기 어려운 회사', f.mc + '곳'], ['세 가지를 모두 통과한 회사', f.all + '곳']],
    k: !f.all ? '세 가지를 모두 통과한 회사가 없어서, 오늘은 고르지 않았어요.' : f.all > 7 ? '그 가운데 점수가 높은 7곳을 골랐어요.' : '통과한 ' + f.all + '곳을 모두 골랐어요.'} : null; };
  // 꾀 점수 풀이(주문 1116-2134) — 꾀 쪽 「이렇게 점수를 매겨요」 = 바탕 글 MIX36 · EQ36 에서 따로 셈(갈래 수학 → 정서 · 식마다 여섯 식 이름 · 큰 곳 / 작은 곳 글 · 같은 무게 · 「이렇게 해서 찾아낸 회사」)
  const KN25 = ['', '한', '두', '세', '네', '다섯'], EQF25 = {수학: '수학 식 — 값이 움직인 모습', 정서: '정서 식 — 사람 마음이 남긴 흔적'};
  const eqWant = k => { const mx = S36C.MIX36[k] ?? [], fams = ['수학', '정서'].filter(f => mx.some(([e]) => S36C.EQ36[e]?.[0] === f));
    return {h: '이렇게 점수를 매겨요', f: fams.map(f => EQF25[f]), rows: fams.map(f => [f, mx.filter(([e]) => S36C.EQ36[e][0] === f).map(([e, d]) => [e, String(d), S36C.EQ36[e][1], d > 0 ? S36C.EQ36[e][3] : S36C.EQ36[e][4]])]),
      k: '이 ' + KN25[mx.length] + ' 식을 똑같이 중요하게 더해 점수를 내요. 걸러서 남은 회사 가운데 점수가 높은 회사부터 골라요.', end: '이렇게 찾아낸 회사는 아래 제3장에 있어요.'}; };
  const in25 = code => (useG25 ? K36.filter(k => G25.lists[k].slice(0, 7).some(c => c.code === code)) : []);
  let other25 = null; for (const c of ['005930', '000660', '035420', '005380', '051910', '035720', '068270']) { if (in25(c).length) continue; const co = await J('/atlas/data/co/' + c + '.json').catch(() => null); if (typeof co?.c?.name === 'string') { other25 = {code: c, co}; break; } }
  const coW25 = async code => { const co = await J('/atlas/data/co/' + code + '.json').catch(() => null), mine = in25(code), it = mine.length ? G25.lists[mine[0]].find(c => c.code === code) : null;
    const name = typeof co?.c?.name === 'string' && co.c.name ? co.c.name : it?.name ?? null, mk = co?.c?.market === 'KOSDAQ' ? '코스닥' : co?.c?.market === 'KOSPI' ? '코스피' : null;
    const v = spW25({code}), bd = DAYz.test(G25?.asOf?.board ?? '') ? mdM(G25.asOf.board) + ' ' : '', m = v ? (v[20] < v[0] ? 'dn' : v[20] > v[0] ? 'up' : 'eq') : null;
    const ord = [...mine].sort((a, b) => (RK36[a]?.i ?? 99) - (RK36[b]?.i ?? 99) || kn25(a) - kn25(b));
    return {h1: name, kick: [mk, typeof co?.c?.i === 'string' && co.c.i ? co.c.i + ' 업종' : null].filter(Boolean).join(' · ') || '회사', step: '3 / 5 · 회사',
      say: mine.length ? '오늘 서른여섯 꾀 가운데 ' + mine.length + '가지가 이 회사를 골랐어요.' : '오늘은 서른여섯 꾀 가운데 어느 꾀도 이 회사를 고르지 않았어요.', seal: m ? {dn: '내림', up: '오름', eq: '같음'}[m] : '',
      cap: v ? ['한 달 전 ' + wonM(v[0]), bd + '마지막 값 ' + wonM(v[20]), '한 달 동안 100원이 ' + w100(v[20] / v[0] - 1) + '이 됐어요.'] : [],
      ks: ord.map(k => [k, '#/k/' + k, RK36[k] ? recW(RK36[k]) : '', G25.say[k]]), ask: '#/q/' + code, next: ['#/q/' + code, '4 / 5']}; };
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const bad4 = []; p.on('response', r => { const st = r.status(); if (st >= 400) bad4.push(st + ' ' + r.url().slice(0, 160)); }); // 막힌 응답 주소(주문 1119-1319 — 「Failed to load resource: 403」 까닭 찾기 · 걸림 판정은 그대로)
    const W = '㉕ 손자병법 다른 쪽 [' + width + '] ';
    const txtJS = 'const txt = e => (e?.textContent ?? \'\').replace(/\\s+/g, \' \').trim();';
    // 가) 첫 쪽 꾀 이름 줄 → 그 꾀 쪽 · 꾀 모음
    if (same) { await open(p, '#/'); await p.waitForFunction(() => document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), null, {timeout: 15000}).catch(() => {});
      const hs = await p.evaluate(() => [...document.querySelectorAll('#su section.sj-s36 li.sj-tk')].map(li => [li.getAttribute('data-k'), li.querySelector(':scope > a.sj-tkh')?.getAttribute('href') ?? '']));
      check(hs.length === HOME36 && hs.every(([k, hr]) => hr === '#/k/' + k), W + '첫 쪽 꾀 이름 줄을 누르면 그 꾀 쪽(#/k/<꾀> · 첫 쪽 꾀 셋 — 주문 1117-1120)', JSON.stringify(hs.filter(([k, hr]) => hr !== '#/k/' + k).slice(0, 3))); }
    await open(p, '#/k');
    const ga = await p.evaluate(new Function(txtJS + `const main = document.querySelector('#su main.sj-page[data-page="kkoes"]');
      return {main: !!main, h1: txt(document.querySelector('#su h1')), tab: txt(document.querySelector('#su .sj-tabs a[aria-current="page"]')), next: document.querySelector('#su .sj-next')?.getAttribute('href') ?? null,
        sets: [...(main?.querySelectorAll('section.sj-kset') ?? [])].map(s => ({n: s.getAttribute('data-set'), h: txt(s.querySelector('h2')), rows: [...s.querySelectorAll('li.sj-kr')].map(li => [li.getAttribute('data-k'), li.querySelector('a.sj-ka')?.getAttribute('href') ?? '', txt(li.querySelector('.sj-kno')), txt(li.querySelector('.sj-kt b')), txt(li.querySelector('.sj-khan')), txt(li.querySelector('.sj-krk')), txt(li.querySelector('.sj-kmean'))])}))};`));
    const setsW = [0, 1, 2, 3, 4, 5].map(i => ({n: String(i + 1), h: G25.set[K36[i * 6]], rows: K36.slice(i * 6, i * 6 + 6).map(k => [k, '#/k/' + k, '제' + kn25(k) + '계', G25.name[k], G25.han[k], RK36[k] ? RK36[k].i + '번째' : '', G25.mean[k]])}));
    check(okT25 && ga.main && ga.h1 === '병법 서른여섯 가지' && ga.tab === '꾀' && JSON.stringify(ga.sets) === JSON.stringify(setsW) && ga.next === '#/k/' + (sun25 ? ORD36[0] : 'g01'),
      W + '가) 꾀 모음 — 여섯 묶음 × 여섯 꾀(삼십육계 차례 · 묶음 이름 = 자료) · 제 ○계 · 쉬운 이름 · 꾀 이름 · 오늘 차례 · 뜻 · 누르면 그 꾀 쪽 · 탭 「꾀」 · 다음 = 맨 위 꾀', JSON.stringify({main: ga.main, h1: ga.h1, tab: ga.tab, next: ga.next, bad: setsW ? ga.sets.map((s, i) => (JSON.stringify(s) === JSON.stringify(setsW[i]) ? null : [s.n, s.h, s.rows.find((r, j) => JSON.stringify(r) !== JSON.stringify(setsW[i].rows[j]))])).filter(Boolean).slice(0, 2) : 'data'}).slice(0, 500));
    // 나) 꾀 한 가지
    const KS25 = width === 390 ? ORD36 : [...new Set([ORD36[0], ORD36[35], ...K36.filter(k => G25.by?.[k] === 'vol').slice(0, 1)])];
    const badK = [];
    for (const k of KS25) {
      await open(p, '#/k/' + k);
      const gk = await p.evaluate(new Function(txtJS + `const main = document.querySelector('#su main.sj-page[data-page="kkoe"]'), ph = main?.querySelector('section.sj-ph'), way = main?.querySelector('section.sj-kway'), rec = main?.querySelector('section.sj-krec'), kco = main?.querySelector('section.sj-kco'), kst = main?.querySelector('section.sj-kst');
        return {main: !!main, k: main?.getAttribute('data-k') ?? null, h1: txt(document.querySelector('#su h1')), kick: txt(ph?.querySelector('.sj-k')), seal: txt(ph?.querySelector('.sj-seal-big')), q: txt(ph?.querySelector('.sj-q p')), cite: txt(ph?.querySelector('.sj-q cite')), step: ph?.querySelector('.sj-step')?.getAttribute('aria-label') ?? '', say: txt(ph?.querySelector('.sj-do')),
          way: txt(way?.querySelector('.sj-lead')), vol: [...(way?.querySelectorAll('.sj-note') ?? [])].some(e => /사고판 양/.test(e.textContent)),
          fun: (() => { const f = way?.querySelector('.sj-fun'); return f ? {l: txt(f.querySelector('.sj-funl')), rows: [...f.querySelectorAll('.sj-funs > li')].map(x => [txt(x.querySelector('span')), txt(x.querySelector('b'))]), k: txt(f.querySelector('.sj-funk'))} : null; })(),
          eq: (() => { const q = way?.querySelector('.sj-eq'); return q ? {h: txt(q.querySelector('.sj-eqh')), f: [...q.querySelectorAll('.sj-eqf')].map(txt), rows: [...q.querySelectorAll('ul.sj-eqs')].map(u => [u.getAttribute('data-f'), [...u.querySelectorAll(':scope > li')].map(li => [li.getAttribute('data-e'), li.getAttribute('data-d'), txt(li.querySelector('.sj-eqt')), txt(li.querySelector('.sj-eqw'))])]), k: txt(q.querySelector('.sj-eqk')), end: txt(q.querySelector('.sj-eqend'))} : null; })(),
          kh: txt(kco?.querySelector('h2 .sj-brush')), rule: txt(rec?.querySelector('.sj-rule')), tl: txt(rec?.querySelector('.sj-tl')), dots: rec ? rec.querySelectorAll('svg.ik-arrows .ik-ar.ik-broken').length : -1, pic: ph?.querySelector('figure.sj-kfig svg.ik-kk')?.getAttribute('data-k') ?? null, story: [...(ph?.querySelectorAll('figure.sj-kfig > svg.ik-kk ~ ol.sj-story > li') ?? [])].map(li => [txt(li.querySelector('.sj-actt')), txt(li.querySelector('.sj-actb'))]),
          cs: [...(kco?.querySelectorAll('a.sj-chip') ?? [])].map(a => [a.getAttribute('href'), txt(a.querySelector('b')), txt(a.querySelector('.sj-chipd'))]), none: txt(kco?.querySelector('.sj-tnone')), n: kco?.getAttribute('data-n') ?? null,
          st: kst ? {dd: [...kst.querySelectorAll('dl.sj-money dd')].map(txt), res: txt(kst.querySelector('.sj-res b')), go: kst.querySelector('a.sj-go')?.getAttribute('href') ?? ''} : null,
          pn: [...(main?.querySelectorAll('nav.sj-kpn a') ?? [])].map(a => a.getAttribute('href')), next: document.querySelector('#su .sj-next')?.getAttribute('href') ?? null, nextK: txt(document.querySelector('#su .sj-next .sj-nk')), tab: txt(document.querySelector('#su .sj-tabs a[aria-current="page"]'))};`));
      const r = RK36[k] ?? null, H = sun25?.hist ?? null, at = ORD36.indexOf(k), L = useG25 ? G25.lists[k].slice(0, 7) : [], S25 = set25(k);
      const want = okT25 ? {main: true, k, h1: G25.name[k], kick: '삼십육계 제' + kn25(k) + '계 · ' + G25.set[k], seal: r ? '차례 ' + r.i : '꾀', q: '「' + G25.mean[k] + '」', cite: '삼십육계 제' + kn25(k) + '계 ' + G25.han[k], step: '2 / 5 · 꾀',
        say: sun25 ? (r?.n ? '지금은 ' + sun25.name + '이에요. 예전에 이런 시장이었을 때, 이 꾀는 서른여섯 꾀 가운데 ' + r.i + '번째로 덜 잃었어요.' : '지금은 ' + sun25.name + '이에요. 이 꾀는 지난 기록을 세지 못해서 맨 아래에 놓았어요.') : '오늘 시장 모습은 아직 세지 못했어요. 그래서 꾀를 원래 차례대로 놓았어요.',
        way: G25.say[k], vol: G25.by?.[k] === 'vol', fun: funWant(k), eq: eqWant(k), kh: '이렇게 해서 찾아낸 회사',
        rule: sun25 && H ? (H.all ? '장이 열린 날로 지난 ' + H.days + '일을 모두 봤어요. ' : '장이 열린 날로 지난 ' + H.days + '일을 봤어요. 그 가운데 오늘처럼 ' + sun25.name + '이었던 ' + H.same + '일을 골랐어요. ') + '그날마다 이 꾀가 고른 회사 일곱 곳의 닷새 뒤 값을 봤어요.' + (ymW25(H.from) && ymW25(H.to) ? ' 센 기간은 ' + ymW25(H.from) + '부터 ' + ymW25(H.to) + '까지예요.' : '') : '',
        tl: r ? recW(r) : '오늘 시장 모습을 아직 세지 못해서, 지난 기록이 없어요.', dots: r?.n && r.lose ? Math.max(1, Math.round(r.lose / r.n * 10)) : 0, pic: k, story: (STORYC.STORY36[k] ?? []).map((t, i) => [STORYC.ACTS[i], t]),
        cs: L.map(c => ['#/c/' + c.code, c.name, Number.isInteger(c.days) && c.days >= 1 ? c.days + '일째' : '']), none: L.length ? '' : useG25 ? none25(G25.why?.[k]) : '오늘 고른 회사 자료를 아직 받지 못했어요.', n: String(L.length),
        st: S25 ? {dd: S25.dd, res: S25.res, go: '#/r/t'} : null,
        pn: [at > 0 ? '#/k/' + ORD36[at - 1] : null, at < 35 ? '#/k/' + ORD36[at + 1] : null, '#/k'].filter(Boolean), next: L.length ? '#/c/' + L[0].code : '#/q', nextK: L.length ? '3 / 5' : '4 / 5', tab: '꾀'} : null;
      const diff = want ? Object.keys(want).filter(x => JSON.stringify(want[x]) !== JSON.stringify(gk[x])) : ['data'];
      if (diff.length) badK.push(k + ' ' + diff.join(',') + ' ' + JSON.stringify(diff.slice(0, 2).map(x => [gk[x], want?.[x]])).slice(0, 220));
      if (k === KS25[0] || k === KS25[KS25.length - 1]) pageRules(await measure(p), W + '나) 꾀 쪽 #/k/' + k);
    }
    check(!badK.length, W + '나) 꾀 한 가지 ' + KS25.length + '쪽 — 걸음 2 / 5 · 묶음 · 도장 = 오늘 차례 · 뜻 · 지금 땅에서 몇 위 · 고르는 법(사고판 양 꾀 풀이) · 꾀 점수 풀이(주문 1116-2134 — 수학 식 · 정서 식 · 이렇게 해서 찾아낸 곳) · 같은 땅 기록 · 잃은 몫 점 · 찾아낸 곳(누르면 그 회사) · 정산 · 앞뒤 꾀 · 다음 단추 = 자료에서 따로 셈 · 큰 그림 바로 아래 그림 속 이야기 네 막 = su-sonja-story.js(주문 1117-0102)', badK.slice(0, 3).join(' / '));
    // 다) 회사
    for (const c of [FC?.code ?? null, other25?.code ?? null].filter(Boolean)) {
      await open(p, '#/c/' + c);
      const gc = await p.evaluate(new Function(txtJS + `const main = document.querySelector('#su main.sj-page[data-page="co"]'), ph = main?.querySelector('section.sj-ph'), cok = main?.querySelector('section.sj-cok');
        return {h1: txt(document.querySelector('#su h1')), kick: txt(ph?.querySelector('.sj-k')), step: ph?.querySelector('.sj-step')?.getAttribute('aria-label') ?? '', say: txt(ph?.querySelector('.sj-do')), seal: txt(ph?.querySelector('.sj-seal-big')),
          cap: [...(ph?.querySelectorAll('figure.sj-coline figcaption > *') ?? [])].map(txt), ks: [...(cok?.querySelectorAll('li.sj-tk') ?? [])].map(li => [li.getAttribute('data-k'), li.querySelector('a.sj-tkh')?.getAttribute('href') ?? '', txt(li.querySelector('.sj-tl')), txt(li.querySelector('.sj-say'))]),
          ask: main?.querySelector('section.sj-costop a.sj-ask')?.getAttribute('href') ?? '', next: [document.querySelector('#su .sj-next')?.getAttribute('href') ?? '', txt(document.querySelector('#su .sj-next .sj-nk'))]};`));
      const want = okT25 ? await coW25(c) : null;
      const diff = want ? Object.keys(want).filter(x => JSON.stringify(want[x]) !== JSON.stringify(gc[x])) : ['data'];
      check(!diff.length, W + '다) 회사 쪽 ' + (c === FC?.code ? '(길 셋째 회사)' : '(오늘 어느 꾀에도 없는 회사)') + ' — 걸음 3 / 5 · 이름 · 시장 · 업종 · 몇 가지 꾀가 골랐나 · 한 달 꺾은선 글 · 고른 꾀(덜 잃은 차례 · 지난 기록 · 고르는 법 · 누르면 그 꾀) · 「왜 사?」 = 자료에서 따로 셈 — ' + (want?.h1 ?? c),
        JSON.stringify(diff.map(x => [x, gc[x], want?.[x]])).slice(0, 400));
      pageRules(await measure(p), W + '다) 회사 쪽 #/c/' + c);
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / ') + (bad4.length ? ' · 막힌 응답 ' + bad4.slice(0, 3).join(' / ') : ''));
    await ctx.close();
  }
  // ㉖ 주문 1116-0209(사장님 2026-11-16(마카오) 01:09 「에이전트 100개 동원해서 지금 그린그림들이 상황애 맞게 3단애서 7간으로 자연스럽게 움직이게 …」 · 01:12 「응」) — 먹그림 움직임
  //   가) 쪽마다 그림 = svg.ik-anim · 그림마다 감싼 묶음(g.ik-m) · 감싼 묶음에 transform 속성 0(제자리 변환을 덮지 않음) · 단계 표 1 ~ 7(또는 차례 표)
  //   나) 화면 밖 그림은 처음에 ik-play 0 → 끝까지 내려 보면 모두 ik-play · 움직임은 모두 한 번 · 7초 안에 끝남(멈춘 그림으로 돌아옴) — 영화 한 편 그림(svg.ik-film · 주문 1116-2310 → 1117-0102 → 1117-0250 「그리고 22초로 만들어라」)은 22.5초 안
  //   다) 움직임을 줄여 둔 휴대폰(reducedMotion: reduce) — 끝까지 내려 봐도 그림 움직임 0
  for (const rm of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: rm});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    const W = '㉖ 먹그림 움직임 [' + (rm === 'reduce' ? '움직임 줄임' : '보통') + '] ';
    for (const hh of ['#/', '#/k', '#/k/' + (ORD36[0] ?? 'g01'), '#/r/t']) {
      await open(p, hh);
      if (hh === '#/' && same) await p.waitForFunction(() => document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), null, {timeout: 15000}).catch(() => {});
      const a = await p.evaluate(() => { const svgs = [...document.querySelectorAll('#su main svg.ik-anim')].filter(s => !s.closest('details:not([open])')), vh = innerHeight, below = svgs.filter(s => s.getBoundingClientRect().top > vh + 200), wraps = [...document.querySelectorAll('#su main svg.ik-anim g.ik-m')]; // 닫힌 서랍 안 그림은 열어야 보임(그때 놂)
        return {n: svgs.length, noM: svgs.filter(s => !s.querySelector('g.ik-m')).length, tr: wraps.filter(w => w.hasAttribute('transform')).length, st: wraps.filter(w => !/\bik-(s[1-7]|bq\d|tq\d+|aq\d)\b/.test(w.getAttribute('class') ?? '')).length,
          below: below.length, belowPlay: below.filter(s => s.classList.contains('ik-play')).length}; });
      await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } });
      await p.waitForTimeout(400);
      const b = await p.evaluate(() => { const an = document.getAnimations().filter(x => x.effect?.target?.closest?.('svg.ik-anim'));
        const shown = [...document.querySelectorAll('#su main svg.ik-anim')].filter(s => !s.closest('details:not([open])'));
        return {all: shown.length, play: shown.filter(s => s.classList.contains('ik-play')).length, an: an.length,
          long: an.filter(x => { const t = x.effect?.getComputedTiming?.(); return !t || !Number.isFinite(t.endTime) || t.endTime > (x.effect?.target?.closest?.('svg.ik-film') ? 22500 : 7000) || t.iterations !== 1; }).length}; }); // 영화 한 편 그림(svg.ik-film · 주문 1117-0250 「그리고 22초로 만들어라」)은 22.5초 안 · 다른 그림은 7초 안
      const wantN = hh !== '#/' || okSunD || same;
      check(rm === 'reduce' ? b.an === 0 && b.play === 0 : (!wantN || a.n > 0) && a.noM === 0 && a.tr === 0 && a.st === 0 && a.belowPlay === 0 && b.play === b.all && (a.n === 0 || b.an > 0) && b.long === 0, // 그림이 없는 날(형세 · 꾀 칸 자료가 없는 첫 쪽)은 움직임도 0
        W + hh + (rm === 'reduce' ? ' — 끝까지 내려 봐도 그림 움직임 0(멈춘 그림)' : ' — 그림마다 감싼 묶음 · 제자리 변환 0 · 단계 1 ~ 7 · 화면 밖은 기다림 → 내려 보면 한 번 놂 · 7초(영화 그림 22.5초) 안에 끝'), JSON.stringify({...a, ...b}));
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
  // ㉗ 주문 1116-1313(사장님 2026-11-16(마카오) 12:12 「정말 쉽게 뜻을 풀어줘 / 아이큐 85고 이해할수 있게」 · 12:13 「어」 — 그림마다 맨 위에 「이 그림 뜻」을 쉬운 한 줄로 크게)
  //   쪽마다 그림(표지 · 형세 · 꾀 그림 · 화살 열 · 쪽 머리 그림 · 산세 · 손무 · 붓 막대 · 「왜 사?」 · 매매일지) 하나하나에 「그림 뜻」(그림 안 맨 위 figcaption · 바로 앞 · 말 상자 첫 줄)
  //   글 = su-sonja-mean.js(꾀 그림은 그 줄 꾀 · 쪽 머리 그림은 data-hero · 「왜 사?」 그림은 svg 이름) · 보이는 것은 그림보다 위 · 큰 글 22px 넘게 · 이름표 17px 넘게
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    const W = '㉗ 그림 뜻 [' + width + '] ';
    for (const hh of ['#/', '#/k', '#/k/' + (ORD36[0] ?? 'g01'), ...(FC ? ['#/c/' + FC.code] : []), '#/r/t', '#/q', '#/j']) {
      await open(p, hh);
      if (hh === '#/' && same) await p.waitForFunction(() => document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), null, {timeout: 15000}).catch(() => {});
      const g = await p.evaluate(() => {
        const main = document.querySelector('#su main.sj-page'); if (!main) return null;
        const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const capOf = e => { if (e.matches('figure')) { const f = e.querySelector(':scope > figcaption.sj-pm:first-child'); if (f) return f; }
          const pv = e.previousElementSibling; if (pv?.matches('.sj-pm')) return pv;
          if (e.matches('.sj-saysp')) return e.parentElement?.querySelector(':scope > .sj-pm:first-child') ?? null;
          if (e.matches('img.sj-art')) return e.closest('.sj-cover')?.querySelector(':scope > .sj-pm:first-child') ?? null;
          return null; };
        const kind = e => e.matches('img.sj-art') ? 'cover' : e.matches('.sj-saysp') ? 'sonmu' : e.matches('ol.sj-stl') ? 'bars' : e.matches('ol.sj-thl') ? 'themes' : e.matches('figure.sj-coline') ? 'ridge' : e.matches('a.sj-tkpic, a.sj-kpic, figure.sj-kfig') ? 'kkoe'
          : e.querySelector('svg.ik-land') ? 'land' : e.querySelector('svg.ik-arrows') ? 'arrows' : e.querySelector('svg.ik-hero') ? 'hero' : e.querySelector('svg.ik-why, svg.ik-journal, svg.ik-tally, svg.ik-groups') ? 'why' : 'other';
        const pics = [...main.querySelectorAll('img.sj-art, figure.sj-ink, figure.sj-coline, a.sj-tkpic, a.sj-kpic, .sj-saysp, ol.sj-stl, ol.sj-thl')];
        return pics.map(e => { const c = capOf(e), sv = e.querySelector('svg'), shown = !e.closest('details:not([open]) > :not(summary)') && e.getBoundingClientRect().height > 0, cb = c?.getBoundingClientRect(), pb = e.getBoundingClientRect();
          return {kind: kind(e), k: e.closest('[data-k]')?.getAttribute('data-k') ?? null, hero: sv?.getAttribute('data-hero') ?? null, cls: sv?.getAttribute('class') ?? '', cur: sv?.getAttribute('data-cur') ?? '', n: sv?.getAttribute('data-n') ?? '',
            tag: txt(c?.querySelector('.sj-pmt')), t: txt(c?.querySelector('.sj-pmb')), shown, above: !c || !shown ? null : cb.bottom <= pb.top + 1 || (e.matches('figure') && c.parentElement === e) || e.matches('.sj-saysp, img.sj-art'),
            big: c && shown ? parseFloat(getComputedStyle(c.querySelector('.sj-pmb')).fontSize) : null, small: c && shown ? parseFloat(getComputedStyle(c.querySelector('.sj-pmt')).fontSize) : null, wide: c && shown ? cb.right <= innerWidth + 0.5 : null}; });
      });
      const want = x => x.kind === 'kkoe' ? MEANC.PIC[x.k] : x.kind === 'hero' ? MEANC.PM[x.hero] : x.kind === 'why' ? MEANC.whyMean(x.cls, x.cur, x.n) : MEANC.PM[x.kind] ?? null;
      const bad = (g ?? []).filter(x => x.kind === 'other' || x.tag !== MEANC.MEAN_TAG || !x.t || x.t !== want(x) || (x.shown && (!x.above || !(x.big >= 21.9) || !(x.small >= 16.95) || !x.wide)));
      const seen = (g ?? []).filter(x => x.shown).length;
      check(!!g && g.length > 0 && !bad.length && (hh !== '#/' || !same || (g.filter(x => x.kind === 'kkoe').length === HOME36 && g.filter(x => x.kind === 'arrows').length === ORD36.slice(0, HOME36).filter(k => RK36[k]?.n).length)),
        W + hh + ' — 그림 ' + (g?.length ?? 0) + '개(보이는 ' + seen + ')마다 맨 위 「그림 뜻」 한 줄 = su-sonja-mean.js 글 · 그림보다 위 · 큰 글 22px · 이름표 17px · 가로 넘침 0', JSON.stringify(bad.slice(0, 3)).slice(0, 400));
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
  // ㉘ 화면(주문 1116-1601 · 1116-1539) — 첫 쪽 꾀 칸 맨 위 「큰 갈래 차례」 = 이 검사가 따로 센 다섯(차례 · 이름 · 꾀 답에 나온 번 · 회사 수 · 붓 막대 방향과 길이 · 100원이 평균 · 오른 곳 · 내린 곳 · 서랍 회사 = 누르면 그 회사)
  //   · 꾀마다 「고르는 법」 칸에 세 거름 수 = 자료 · 센 법 칸에 세 거름 풀이(소거 이름 = 자료) · 영어 글자 · 「%」 0(회사 이름 빼고) · 누름 48 · 가로 넘침 0
  const R28 = Array.isArray(thW) ? thW : [];
  const in728 = code => K36.filter(k => G36.lists[k].slice(0, 7).some(c => c.code === code)).length, nm28 = code => { for (const k of K36) { const c = G36.lists[k].find(x => x.code === code); if (c) return c.name; } return ''; };
  const avg28 = r => (TH28?.find(x => x.name === r.name)?.avg ?? null); // 화면은 자료의 평균(넷째 자리)으로 그림 — 값은 위 자료 검사가 따로 셈과 맞댐
  const wantTh = same && v2 && R28.length ? {before: true, h: '꾀가 많이 고른 분야', lead: '꾀가 고른 회사를 하는 일이 같은 회사끼리 묶었어요. 회사가 많이 나온 분야부터 ' + R28.length + '개예요.', note: '회사가 많이 나온 차례예요. 많이 오른 차례가 아니에요.', cap: MEANC.PM.themes,
    rows: R28.map((r, i) => { const a = avg28(r), ma = Math.max(0, ...R28.map(avg28).filter(x => x !== null).map(x => Math.abs(x - 1))), sw = a !== null && a !== 1 && ma > 0 ? Math.max(4, Math.round(Math.abs(a - 1) / ma * 140)) : 0;
      return {g: r.name, num: String(i + 1), name: r.name, c: '나온 회사 ' + r.n + '곳 · 꾀가 고른 횟수 ' + r.hits + '번', v: a !== null ? '한 달 동안 100원이 평균 ' + w100(a - 1) + '이 됐어요.' : '한 달 값이 모자라서 평균을 세지 못했어요.',
        ud: '오른 회사 ' + r.up + '곳 · 내린 회사 ' + r.dn + '곳' + (r.m - r.up - r.dn ? ' · 그대로인 회사 ' + (r.m - r.up - r.dn) + '곳' : ''), way: sw ? (a > 1 ? 'up' : 'dn') : 'none', w: sw, sum: '이 분야 회사 ' + r.n + '곳 보기',
        cos: r.codes.map(code => ['#/c/' + encodeURIComponent(code), nm28(code), '꾀 ' + in728(code) + '가지'])}; })} : null;
  const pickW28 = v2 ? ['첫째, 열 가지 기준 — 이런 회사만 남겨요.', '둘째, 꾀의 뜻 — 「고르는 법」에 적힌 모습과 맞아야 해요.', '셋째, 우연인지 따져 보기 — 지난 값을 뒤섞어 ' + P28.paths + '번씩 ' + P28.runs + '번 다시 해 봐요. 우연으로 보기 어려운 회사만 남겨요.',
    '넷째, 점수 — 꾀마다 수학 식과 정서 식을 똑같이 중요하게 더해요. 점수가 높은 회사부터 일곱 곳까지 골라요.', '세 가지를 모두 통과한 회사가 일곱 곳보다 적으면, 적은 대로 둬요. 다른 회사로 채우지 않아요.'] : []; // 넷 = 꾀 점수(주문 1116-2134)
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const W = '㉘ 큰 갈래 · 세 거름 [' + width + '] ';
    await open(p, '#/');
    if (same) await p.waitForFunction(() => document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), null, {timeout: 15000}).catch(() => {});
    const g = await p.evaluate(() => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), sec = document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), th = sec?.querySelector(':scope > .sj-th');
      for (const d of th?.querySelectorAll('details.sj-thd') ?? []) d.open = true; // 서랍을 열어 회사 단추 크기를 잼
      return {sec: !!sec,
        th: th ? {before: !!th.nextElementSibling?.matches?.('ol.sj-tricks'), h: txt(th.querySelector('.sj-thh3')), lead: txt(th.querySelector('.sj-thlead')), note: txt(th.querySelector('.sj-thnote')), cap: txt(th.querySelector(':scope > .sj-pm .sj-pmb')),
          rows: [...th.querySelectorAll('ol.sj-thl > li.sj-thr')].map(li => { const bar = li.querySelector('svg.sj-thbar');
            return {g: li.getAttribute('data-g'), num: txt(li.querySelector('.sj-thn')), name: txt(li.querySelector('.sj-thg')), c: txt(li.querySelector('.sj-thc')), v: txt(li.querySelector('.sj-thv')), ud: txt(li.querySelector('.sj-thud')),
              way: bar?.getAttribute('data-way') ?? null, w: bar ? +bar.getAttribute('data-w') : null, sum: txt(li.querySelector('details.sj-thd > summary')),
              cos: [...li.querySelectorAll('a.sj-thco')].map(a => [a.getAttribute('href'), txt(a.querySelector('b')), txt(a.querySelector('span'))])}; }),
          wide: th.getBoundingClientRect().right <= innerWidth + 0.5 && th.getBoundingClientRect().left >= -0.5, small: [...th.querySelectorAll('a, summary')].filter(a => { const r = a.getBoundingClientRect(); return r.width < 47.5 || r.height < 47.5; }).length,
          font: Math.min(...[...th.querySelectorAll('p, b, span, a, summary, h3')].filter(e => e.textContent.trim()).map(e => parseFloat(getComputedStyle(e).fontSize))), text: th.innerText} : null,
        fun: [...(sec?.querySelectorAll('li.sj-tk') ?? [])].map(li => { const f = li.querySelector('details.sj-cos .sj-fun');
          return [li.getAttribute('data-k'), f ? {l: txt(f.querySelector('.sj-funl')), rows: [...f.querySelectorAll('.sj-funs > li')].map(x => [txt(x.querySelector('span')), txt(x.querySelector('b'))]), k: txt(f.querySelector('.sj-funk'))} : null]; }),
        pick: [...(sec?.querySelectorAll('details.sj-how .sj-pick') ?? [])].map(txt), cut: [...(sec?.querySelectorAll('details.sj-how .sj-pickcut > li') ?? [])].map(txt)};
    });
    const thGot = g.th ? {before: g.th.before, h: g.th.h, lead: g.th.lead, note: g.th.note, cap: g.th.cap, rows: g.th.rows} : null;
    const names28 = [...new Set(K36.flatMap(k => same ? G36.lists[k].map(c => c.name) : []))].sort((a, b) => b.length - a.length);
    const plain28 = names28.reduce((t, n) => t.split(n).join(''), g.th?.text ?? '');
    check(!same ? !g.th : wantTh ? JSON.stringify(thGot) === JSON.stringify(wantTh) && g.th.wide && g.th.small === 0 && g.th.font >= 16.95 && !/[A-Za-z%]/.test(plain28) : !g.th,
      W + '첫 쪽 꾀 칸 맨 위 큰 갈래 차례(주문 1116-1601) — 다섯 = 따로 센 것 · 차례 · 이름 · 회사 수 · 꾀 답에 나온 번 · 붓 막대(오르면 오른쪽 · 길이 = 평균) · 100원이 평균 · 오른 곳 · 내린 곳 · 서랍 회사(누르면 그 회사) · 글씨 17 · 누름 48 · 영어 · 「%」 0',
      JSON.stringify({diff: wantTh && thGot ? Object.keys(wantTh).filter(x => JSON.stringify(wantTh[x]) !== JSON.stringify(thGot[x])) : [!!wantTh, !!thGot], row: wantTh && thGot ? (wantTh.rows.map((r, i) => (JSON.stringify(r) === JSON.stringify(thGot.rows[i]) ? null : [r, thGot.rows[i]])).find(Boolean) ?? null) : null,
        wide: g.th?.wide, small: g.th?.small, font: g.th?.font, en: (plain28.match(/.{0,8}[A-Za-z%]+.{0,8}/) ?? [''])[0]}).slice(0, 500));
    const funBadP = same ? g.fun.filter(([k, f]) => JSON.stringify(f) !== JSON.stringify(funWant(k))).map(([k]) => k) : [];
    check(!same || (g.fun.length === HOME36 && !funBadP.length && (!v2 || g.fun.filter(([, f]) => f).length >= ORD36.slice(0, HOME36).filter(k => G36.by?.[k] !== 'vol').length)),
      W + '꾀마다 「고르는 법」 칸 세 거름 수(주문 1116-1539) — 소거 · 꾀 뜻 · 흉내 내 보기 · 셋 다 · 고른 곳 = 자료(사고판 양 꾀는 그날 양이 있을 때)', JSON.stringify({n: g.fun.length, bad: funBadP.slice(0, 3), got: g.fun.find(([k]) => k === funBadP[0])?.[1] ?? null, want: funBadP[0] ? funWant(funBadP[0]) : null}).slice(0, 400));
    check(!same || (JSON.stringify(g.pick) === JSON.stringify(pickW28) && JSON.stringify(g.cut) === JSON.stringify(v2 ? P28.cut : [])),
      W + '꾀 차례 센 법 칸 — 세 거름 풀이(소거 열 가지 이름 = 자료 · 꾀 뜻 · 흉내 내 보기 200번씩 10번 · 꾀 점수 · 채우지 않음)', JSON.stringify({pick: g.pick, cut: g.cut.length}).slice(0, 400));
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
}
{ // ㉙ 주문 1120-0358(사장님 2026-11-20(마카오) 03:58 「이거 문제다 ㅙ결해라 디자인이 문제다 전체 다 수정하라」 — 휴대폰 사진: 꾀 모음 줄의 「정산에서 100원이 ○원이 됐어요」가 한 글자씩 세로로 무너짐)
  //   쪽마다 · 두 폭(390 · 320) · 큰 글씨(320) — 글이 세로로 무너진 곳(두 줄 넘게 한 줄에 두세 글자) 0 · 화면 옆으로 넘친 글 0 · 잘린 글 0
  //   일부러 세로로 쓴 표지 글(.sj-hwa) · 그림 속 글(svg) · 닫힌 서랍 · 크기가 정해진 도장(.sj-seal)은 뺌
  const FIND29 = () => {
    const W = innerWidth, out = [], txtOf = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
    for (const e of document.querySelectorAll('#su main *, #su .sj-top *, #su .sj-tabs *')) {
      const t = txtOf(e), chars = t.replace(/\s/g, '').length; if (chars < 3 || e.closest('svg, .sj-hwa, .sj-seal, details:not([open]) > :not(summary)')) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || /^vertical/.test(cs.writingMode)) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.45, ch = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth), lines = Math.max(1, Math.round(ch / lh));
      const at = (e.parentElement?.className && typeof e.parentElement.className === 'string' ? e.parentElement.className.trim().split(/\s+/)[0] + ' > ' : '') + ((typeof e.className === 'string' && e.className.trim()) || e.tagName.toLowerCase());
      if (chars >= 4 && ((lines >= 3 && chars / lines < 3) || (lines >= 2 && chars / lines < 2.2))) out.push(['세로', at, Math.round(r.width), lines, t.slice(0, 20)]);
      if (r.right > W + 1 || r.left < -1) out.push(['넘침', at, Math.round(r.left), Math.round(r.right), t.slice(0, 20)]);
      if (/hidden|clip/.test(cs.overflowX + ' ' + cs.overflow) && e.scrollWidth > e.clientWidth + 2 && cs.textOverflow !== 'ellipsis') out.push(['잘림', at, e.scrollWidth, e.clientWidth, t.slice(0, 20)]);
    }
    if (document.documentElement.scrollWidth > W + 1) out.push(['쪽 넘침', document.documentElement.scrollWidth]);
    return out;
  };
  const G29 = await J('/su/data/su21-s36.json').catch(() => null), K29 = Array.isArray(G29?.kinds) ? G29.kinds : [], C29 = K29.map(k => G29?.lists?.[k]?.[0]?.code).find(c => /^[0-9A-Z]{6}$/.test(String(c ?? ''))) ?? null;
  const PAGES29 = ['#/', '#/k', '#/k/' + (K29[0] ?? 'g01'), ...(C29 ? ['#/c/' + C29] : []), '#/r/t', '#/q', '#/j', '#/o']; // #/o 여러 꾀가 고른 회사(주문 1120-0950)
  for (const [width, big] of [[390, false], [320, false], [320, true]]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
    await QUIET(ctx);
    await ctx.addInitScript(b => { try { localStorage.setItem('su-big-text', b ? '1' : '0'); } catch { /* 저장소 없음 */ } }, big);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    const W = '㉙ 글 무너짐 [' + width + (big ? ' · 큰 글씨' : '') + '] ';
    for (const hh of PAGES29) {
      await open(p, hh);
      if (hh === '#/') await p.waitForFunction(() => !document.querySelector('#su main.sj-page > section.sj-s36.sj-wait'), null, {timeout: 15000}).catch(() => {});
      const bad = await p.evaluate(FIND29);
      check(!bad.length, W + hh + ' — 글이 세로로 무너진 곳 · 옆으로 넘친 글 · 잘린 글 0(주문 1120-0358)', JSON.stringify(bad.slice(0, 4)));
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
}
{ // ㉚ 주문 1120-0950(사장님 2026-11-20(마카오) 09:50 「꾀 쪽 맨 위에도 어느 태세인지 표지 … 36가지 종목 중 많이 추천된 순서 … 추천 횟수 … 추적 … 꺾은선」)
  //   가) 꾀 쪽 맨 위 표지 = 첫 쪽 세 태세 줄(⑫-2 가 따로 다시 센 꾀)과 같은 꾀 · 같은 태세 · 다른 꾀에는 표지 0
  //   나) 여러 꾀가 고른 회사(#/o) = 이 검사가 정산 장부(su21-settle.json buys) + 오늘 꾀 칸(su21-s36.json lists)으로 따로 다시 센 「그날 고른 꾀 수」 · 많이 고른 차례 · 두 꾀 넘게 · 스물까지
  //       줄마다 꺾은선 · 「꾀 ○가지가 골랐어요」 · 손실 먼저(가장 낮을 때 → 지금) · 「추천」 「%」 0 · 앞날 아님 한 줄
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  const W = '㉚ [390] ';
  await open(p, '#/');
  const st30 = await p.evaluate(() => [...document.querySelectorAll('#su main.sj-page > section.sj-cover > .sj-tc ol.sj-tcst > li.sj-ts:not(.sj-ts0)')].map(li => [li.getAttribute('data-st'), li.getAttribute('data-k')]));
  const other = ['g01', 'g02', 'g03'].find(k => !st30.some(x => x[1] === k));
  const tagBad = [];
  for (const [st, k] of [...st30, ...(other ? [[null, other]] : [])]) {
    await open(p, '#/k/' + k);
    const t = await p.evaluate(() => { const ph = document.querySelector('#su main.sj-page[data-page="kkoe"] section.sj-ph'), a = ph?.querySelector(':scope > a.sj-kst3');
      return {has: !!a, st: a?.getAttribute('data-st') ?? null, afterKick: !!a && a.previousElementSibling?.matches('.sj-k'), txt: (a?.textContent ?? '').replace(/\s+/g, ' ').trim()}; });
    if (st ? !(t.has && t.st === st && t.afterKick && /(수비형|보편형|공격형) 꾀예요/.test(t.txt)) : t.has) tagBad.push([k, st, t]);
  }
  check(!tagBad.length, W + '가) 꾀 쪽 맨 위 세 태세 표지 — 첫 쪽 세 태세 줄과 같은 꾀 · 같은 태세 · 다른 꾀에는 없음', JSON.stringify({st30, tagBad}).slice(0, 400));
  const D30 = await J('/su/data/su21-settle.json').catch(() => null), G30 = T0?.s36n && G0?.schema === 'su21-s36-1' && Array.isArray(G0?.kinds) && G0.kinds.length === 36 ? G0 : null;
  const KK = /^g(0[1-9]|[12]\d|3[0-6])$/, CD = /^[0-9A-Z]{6}$/, seen = new Map(), add = (d, c, k) => { const m = seen.get(d) ?? new Map(); seen.set(d, m); (m.get(c) ?? m.set(c, new Set()).get(c)).add(k); };
  for (const b of Array.isArray(D30?.buys) ? D30.buys : []) { const k = D30.kinds?.[b?.[1]]; if (KK.test(String(k)) && /^\d{4}-\d{2}-\d{2}$/.test(String(b[0])) && CD.test(String(b[2]))) add(b[0], b[2], k); }
  const td = G30?.asOf?.board;
  if (td && G30?.lists && ![...seen.keys()].some(d => d > td)) { const m = new Map(); for (const [k, L] of Object.entries(G30.lists)) if (KK.test(k) && Array.isArray(L)) for (const c of L) { const code = String(c?.code ?? ''); if (CD.test(code)) (m.get(code) ?? m.set(code, new Set()).get(code)).add(k); } if (m.size) seen.set(td, m); }
  const days = [...seen.keys()].sort(), last = days.length ? seen.get(days[days.length - 1]) : new Map(), cntOf = (d, c) => seen.get(d)?.get(c)?.size ?? 0;
  const q = [...last].map(([c, S]) => [c, S.size]).filter(([, n]) => n >= 2), want = q.length > 20 ? null : new Map(q);
  await open(p, '#/o');
  const o = await p.evaluate(() => { const main = document.querySelector('#su main.sj-page[data-page="picks"]'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {main: !!main, rule: main?.querySelector('section.sj-pks')?.getAttribute('data-rule') ?? null, text: main?.innerText ?? '', wide: document.documentElement.scrollWidth <= innerWidth + 1,
      rows: [...(main?.querySelectorAll('ol.sj-pkl > li.sj-pk') ?? [])].map(li => ({c: li.getAttribute('data-code'), n: +li.getAttribute('data-now'), href: li.querySelector('a.sj-pka')?.getAttribute('href') ?? '', say: t(li.querySelector('.sj-pkn b')),
        sp: !!li.querySelector('svg.sj-pksp circle'), fs: parseFloat(getComputedStyle(li.querySelector('.sj-pkn')).fontSize), m: t(li.querySelector('.sj-pkm'))})),
      chart: !!main?.querySelector('section.sj-pkg svg.sj-pkc'), legend: main?.querySelectorAll('section.sj-pkg ul.sj-pkcl > li').length ?? 0, safe: t(main?.querySelector('p.sj-safe')), tab: t(document.querySelector('#su .sj-tabs a[aria-current="page"]'))}; });
  const rowsOk = o.rows.every((r, i) => CD.test(r.c ?? '') && r.n >= 2 && r.n === cntOf(days[days.length - 1], r.c) && (!want || want.get(r.c) === r.n) && r.href === '#/c/' + r.c && r.say === '꾀 ' + r.n + '가지가 골랐어요.' && r.sp && r.fs >= 16.95
    && (!r.m || /^한 달 가운데 가장 낮을 때 100원이 [\d.]+원/.test(r.m)) && (i === 0 || o.rows[i - 1].n >= r.n));
  check(o.main && o.rule === 'picks-v1' && rowsOk && (want ? o.rows.length === want.size : o.rows.length === 20) && (!o.rows.length || (o.chart && o.legend === Math.min(5, o.rows.length)))
    && o.wide && /앞날을 맞히지 않고/.test(o.safe) && !/%|추천|사세요|사라|1등|대박|급등|수익률/.test(o.text) && o.tab === '회사',
    W + '나) 여러 꾀가 고른 회사(#/o · 탭 「회사」 — 주문 1120-1220) — 이 검사가 장부로 다시 센 꾀 수와 같음 · 많이 고른 차례 · 줄마다 꺾은선 · 손실 먼저 · 「추천」 「%」 0 · 앞날 아님 한 줄',
    JSON.stringify({days: days.length, want: want ? want.size : 'many', got: o.rows.slice(0, 6).map(r => [r.c, r.n, r.say.slice(0, 12)]), chart: o.chart, legend: o.legend, wide: o.wide, tab: o.tab}).slice(0, 500));
  if (o.rows.length) { // 다) 회사 쪽 날마다 고른 꾀 수 꺾은선(주문 1120-1040) — 이 검사가 다시 센 날마다 꾀 수와 같음
    const r0 = o.rows[0], wantN = days.map(d => cntOf(d, r0.c));
    await open(p, '#/c/' + r0.c);
    const cb = await p.evaluate(() => { const b = document.querySelector('#su main.sj-page[data-page="co"] section.sj-cok .sj-cpkbox');
      return b ? {days: b.getAttribute('data-days'), now: b.getAttribute('data-now'), dots: b.querySelectorAll('svg.sj-cpk circle').length, go: b.querySelector('a.sj-go')?.getAttribute('href') ?? '', t: (b.querySelector('.sj-cpkt')?.textContent ?? '').trim(), fs: parseFloat(getComputedStyle(b.querySelector('.sj-cpkt')).fontSize)} : null; });
    check(!!cb && cb.days === String(days.length) && cb.now === String(wantN[wantN.length - 1]) && cb.dots === days.length && cb.go === '#/o' && cb.t.includes('꾀') && cb.fs >= 16.95 && !/%|추천/.test(cb.t),
      W + '다) 회사 쪽 날마다 고른 꾀 수 꺾은선(주문 1120-1040) — 다시 센 꾀 수와 같음 · 점 = 날 수 · 여러 꾀가 고른 회사로 가는 고리', JSON.stringify({c: r0.c, wantN, cb}).slice(0, 300));
  }
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
await browser.close();
R.ok = R.counts.fail === 0;
console.log(`손자병법 두 길 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
process.exit(R.ok ? 0 : 1);

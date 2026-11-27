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
const LINK_OK = /^(https:\/\/finance\.naver\.com\/item\/(news|coinfo)\.naver\?code=[0-9A-Z]{6}|#\/|#\/[kqpjol]|#\/l\/[abds]|#\/[cqp]\/[0-9A-Z]{6}|#\/k\/g(0[1-9]|[12]\d|3[0-6])|#\/r\/t|#\/gift|\/next\/|\/next\/\?lang=en|\/next\/#\/(why|share|gift|me|jinhwa|find)(\/[0-9A-Z]{6})?|\/hello\.html|https:\/\/shin-yxy\.gino\.im\/|\/next\/\?(lang=en&)?su=[a-z]+#\/(?!(talk|surge|cal|today)(\/|$))[\w\/.%-]*|\/(hello|letter|invite|privacy)\.html\?su=[a-z]+(#[\w-]+)?|\/su\/privacy\.html(#[\w-]+)?)$/; // 주문 1115-2328 — 손자병법 길뿐: 첫 쪽 #/ · 꾀 모음 #/k · 꾀 #/k/g01 ~ g36 · 회사 #/c/<번호> · 멈춤 #/q(/<번호>) · #/p · 일지 #/j · 정산 #/r/t · 선물 · /next/ 옛 쪽(찾기 · 고객센터 …) · 지운 쪽(#/b · #/m · #/n · #/s · #/f · #/r · #/r/<서랍> · #/i/<업종> · #/c/<번호>/more · t · y)으로 가는 고리 0 // 주문 1114-1306 ⑧ · ② — 옛 기능 쪽 #/g · 닫히는 옛 쪽(#/talk · #/surge · #/cal · #/today)과 /atlas/ 화면으로 가는 고리 0

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
// 세 태세 셈(주문 1120-0728 — 이 검사가 su21.json sun.rank 로 따로 셈 · 화면 코드 su-stance.js 를 부르지 않음) — 첫 쪽 세 태세 칸은 지웠고(주문 1126-1748) 꾀 쪽 표지(㉚)가 이 셈과 맞는지 봄
const stanceWant = SS => { const F = v => typeof v === 'number' && Number.isFinite(v); if (!SS || SS.rule !== 'sun-v1' || !Array.isArray(SS.rank)) return null;
  const mn = Number.isInteger(SS.minN) && SS.minN > 0 ? SS.minN : Number.isInteger(SS.win3?.minN) && SS.win3.minN > 0 ? SS.win3.minN : 20;
  const ok = SS.rank.filter(r => /^g\d\d$/.test(r?.k ?? '') && Number.isInteger(r.n) && r.n >= mn && Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && F(r.avg) && F(r.worst) && r.worst <= r.avg);
  if (!ok.length) return {none: true};
  const pos = new Map(ok.map((r, i) => [r.k, i])), R = new Map(ok.map(r => [r.k, r]));
  const def = (SS.win3?.rule === 'win3-v1' && Array.isArray(SS.win3.ks) ? SS.win3.ks : []).find(k => pos.has(k)) ?? ok[0].k;
  const cand = ok.filter(r => r.k !== def && (!F(r.exp) || r.lose <= r.exp)), lr = r => r.lose / r.n;
  let att = null; for (const r of cand) if (r.avg > 0 && (!att || r.avg > att.avg || (r.avg === att.avg && lr(r) < lr(att)))) att = r;
  const rest = cand.filter(r => r !== att), L = [...rest].sort((a, b) => lr(a) - lr(b) || pos.get(a.k) - pos.get(b.k)), A = [...rest].sort((a, b) => b.avg - a.avg || pos.get(a.k) - pos.get(b.k));
  let mid = null, best = Infinity; for (const r of rest) { const s2 = L.indexOf(r) + A.indexOf(r); if (s2 < best) { best = s2; mid = r; } }
  return {none: false, ks: [def, mid?.k ?? null, att?.k ?? null], R}; };
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
    const g0 = await p.evaluate(() => { const M = document.querySelector('#su main.sj-page'); if (!M) return null; const c = M.cloneNode(true); for (const e of c.querySelectorAll('section.sj-s36, [data-proper]')) e.remove(); /* 사장님 글(남의 글 표시 — 주식 격언 열 가지 「돈이 몰리는 업종에서만」 · 주문 1120-2116)은 지운 칸 말이 아님 */
      return {parts: M.querySelectorAll('a.sj-row, a.sj-up3a, section.sj-grp, section.sj-quiet, section.sj-count, section.sj-up3, section.sj-how, nav.sj-mode, .sj-ov').length, words: (c.textContent.match(/불장|꽃이 될|돈이 몰리|돈이 몰릴|조용한데 힘이|될 듯/g) ?? []), art: document.querySelector('#su .sj-cover .sj-hwa')?.textContent ?? ''}; });
    check(!!g0 && g0.parts === 0 && g0.words.length === 0 && g0.art === '시장을 읽고덜 잃는꾀를 찾아요', W + '처음 쪽 = 병법 서른여섯만 — 불장 · 꽃이 될 · 돈이 몰리는(지금 · 될 듯) · 조용한 힘 · 1 · 2 · 3등 칸 0 · 그 말 0 · 표지 화제 「형세를 읽고 · 덜 잃는 꾀를 찾아요」(주문 1115-1843)', JSON.stringify(g0));
    check(await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="sonja"]'), k = m ? [...m.children] : []; return !!m && ['sj-greet', 'sj-hero', 'sj-coday', 'sj-todo', 'sj-mind', 'sj-cover', 'sj-sun'].every((c, i) => !!k[i]?.classList.contains(c)) && !document.querySelector('#su main > .su-hero'); }), W + '처음 쪽 = 손자병법 판(주문 1115-1706 — 표지 → 형세 보고 · 옛 그림 칸 0 · 주문 1120-2116 — 격언 열 가지 족자 · 주문 1126-1249 — 오늘의 꾀 한 장 · 주문 1126-1544 — 직원 본보기 차례: 인사 → 오늘의 꾀 → 오늘의 기업 → 오늘의 투자 점검)', '');
    R.m.t21 = {listed: T21?.counts?.listed ?? null, board: T21?.asOf?.board ?? null};
  }
  // 주문 1115-2328(사장님 22:28 「어고쳐」) — 사이트 모든 쪽 = 병법 서른여섯만: 지운 쪽은 옛 고리로 와도 첫 쪽(주소도 #/) · 옛 회사 고리 #/k/<번호> 는 그 회사 쪽
  if (width === 390) {
    const bad = [];
    for (const hh of GONE) {
      await open(p, hh); await p.waitForTimeout(150);
      const g = await p.evaluate(() => ({hash: location.hash, page: document.querySelector('#su main')?.getAttribute('data-page') ?? '', h1: (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim(),
        old: document.querySelectorAll('#su .su-hero, #su .su-fcard, #su [data-feat], #su [data-road], #su .su-drawer').length, text: (() => { const v = document.getElementById('su'); let t = v?.innerText ?? ''; for (const e of v ? v.querySelectorAll('[data-proper]') : []) { const x = e.innerText; if (x) t = t.split(x).join(' '); } return t; })()})); // 사장님 글(남의 글 표시)은 뺌(주문 1120-2116)
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
      const kids = [...main.children].map(e => e.className.split(' ').find(c => /^sj-(greet|hero|coday|todo|cover|sun|s36|mind|count|up3|how|grp|quiet|mode|more|end|ph|kway|krec|kco|kst|kpn|cok|coval|colink|costop|two|act|body|figs|whymore)$/.test(c)) ?? e.className);
      const want = page === 'sonja' ? ['sj-greet', 'sj-hero', 'sj-coday', 'sj-todo', 'sj-mind', 'sj-cover', 'sj-sun', 'sj-s36', 'sj-more', 'sj-end'] /* 주식 격언 열 가지 = 첫 화면 맨 위 · 표지보다 위(주문 1120-2116 · 23:21 「맨 위에 두어라」) */ : page === 'kkoe' ? ['sj-ph', 'sj-kway', 'sj-krec', 'sj-kco', 'sj-kst', 'sj-kpn', 'sj-end'] : page === 'co' ? ['sj-ph', 'sj-coval', 'sj-cok', 'sj-colink', 'sj-costop', 'sj-end'] : page === 'why' || page === 'journal' ? ['sj-ph', 'sj-two', 'sj-act', 'sj-body', 'sj-figs', 'sj-whymore', 'sj-end'] : [];
      const must = page === 'sonja' ? ['sj-greet', 'sj-hero', 'sj-coday', 'sj-todo', 'sj-mind', 'sj-cover', 'sj-sun', 'sj-more', 'sj-end'] : page === 'kkoe' ? ['sj-ph', 'sj-kway', 'sj-krec', 'sj-kco', 'sj-kpn', 'sj-end'] : page === 'why' ? ['sj-ph', 'sj-two', 'sj-act', 'sj-end'] : page === 'journal' ? ['sj-ph', 'sj-two', 'sj-end'] : ['sj-ph', 'sj-cok', 'sj-costop', 'sj-end'];
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
    const TAB5 = '오늘 꾀 회사 멈춤 기록', TAB5L = '탭 — 오늘 · 꾀 · 회사 · 멈춤 · 기록', PAGE3 = ['sonja', 'kkoe', 'co', 'why', 'journal'], CUR3 = [0, 1, -1, 3, 4]; // 회사 쪽은 탭 밖(켜진 탭 0) · 탭 여섯(주문 1120-1220 — 「회사」 탭 = 여러 꾀가 고른 회사 · 셋째)
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
        check(sj.order, W + '⑨ 쪽 차례 — ' + (k === 0 ? '인사 → 오늘의 꾀 → 오늘의 기업 → 오늘의 투자 점검 → 주식 격언 열 가지 → 표지 → 형세 보고 → 덜 잃은 꾀 차례 → 자세히 → 끝 줄' : k === 1 ? '머리 → 고르는 법 → 같은 땅 기록 → 오늘 닮은 곳 → 정산 → 앞뒤 꾀 → 끝 줄' : '머리 · 한 달 꺾은선 → 고른 꾀 → 사기 전에 멈춤 → 끝 줄') + ' — ' + sj.h1, sj.kids.join(' '));
        check(sj.lastIsSrc && JSON.stringify(sj.foot) === FOOTW, W + '⑨ 맨 아래 출처 · 조사 날짜 · 꼭 있어야 할 길 둘 — ' + sj.h1, JSON.stringify(sj.foot));
        check(sj.tabs.length === 5 && sj.tabs.map(t => t.t).join(' ') === TAB5 && sj.tabs.filter(t => t.cur).length === (CUR3[k] < 0 ? 0 : 1) && (CUR3[k] < 0 || sj.tabs[CUR3[k]].cur) && sj.tabsL === TAB5L,
          W + '⑨ 탭 다섯 오늘 · 꾀 · 회사 · 멈춤 · 기록(주문 1124-1942 치지 짜임 — 장부 · 정산 · 분석 · 일지는 기록 탭 안 갈래 · 옛 주문 1115-2328 · 1120-1220 · 1120-1705 · 1124-0432) · ' + (CUR3[k] < 0 ? '회사 쪽은 켜진 탭 0' : '「' + TAB5.split(' ')[CUR3[k]] + '」 켜짐') + ' — ' + sj.h1, JSON.stringify(sj.tabs) + ' ' + sj.tabsL);
        if (k === 0) { check(sj.moreShut && sj.ess === 3, W + '⑩ 「자세히」는 눌러야 열림 · 그 안 본질 세 줄 — ' + sj.h1, JSON.stringify({shut: sj.moreShut, ess: sj.ess})); check(sj.art, W + '⑪ 표지 붓 글씨 그림이 열림', '');
          // ⑫ 오늘 시장 · 세 태세 칸 지움(주문 1126-1748 · 사장님 2026-11-26(서울) 17:48 「지금 첫번째 구역은 헷갈린다 삭제 하라」 — 옛 ⑫ 오늘 한 장 · ⑫-2 세 태세 · 꾀 쪽 표지는 ㉚ 이 따로 셈)
          const tcN = await p.evaluate(() => document.querySelectorAll('#su main.sj-page .sj-tc, #su main.sj-page .sj-tcst').length);
          check(tcN === 0, W + '⑫ 오늘 시장 · 세 태세 칸 지움(주문 1126-1748 「지금 첫번째 구역은 헷갈린다 삭제 하라」) — 첫 쪽에 그 칸 0(먼저 칠한 자리도 0)', String(tcN));
          // ⑫-3 대나무 숲 지움(주문 1120-2116 · 사장님 2026-11-21(마카오) 00:19 「이 사진에 대나무 지워주고」 — 1120-1422 대나무 숲) — 오늘 한 장 안팎 대나무 그림 0
          const bb = await p.evaluate(() => document.querySelectorAll('#su .sj-tcbam, #su svg.sj-bam').length);
          check(bb === 0, W + '⑫-3 대나무 숲 지움(주문 1120-2116 · 00:19 「이 사진에 대나무 지워주고」) — 오늘 한 장 대나무 그림 0', String(bb)); } // ⑫ · ⑫-2 · ⑫-3 은 첫 쪽(k 0)에서만 — 다른 쪽엔 오늘 한 장이 없음(미리 보기 2/11 의 실패 셋 = 꾀 · 「왜 사?」 · 일지 쪽에서 돌았던 것)
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
      check(m.tabs.length === 5 && m.tabs.map(t => t.t).join(' ') === TAB5 && m.tabs.filter(t => t.cur).length === 1 && m.tabs[curW].cur && m.tabsL === TAB5L, W + '⑨ 탭 다섯(옛 틀도 같은 다섯 · 주문 1115-2328) · 「' + TAB5.split(' ')[curW] + '」 켜짐 — ' + m.h1, JSON.stringify(m.tabs) + ' ' + m.tabsL);
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
    check(g.main && g.h1 === '서른여섯 꾀 정산' && g.tab === '기록' && g.old === 0, W + '손자병법 판 정산 쪽(주문 1115-2328) — 큰 제목 · 아래 탭 「기록」 켜짐(주문 1124-1942 — 정산은 기록 탭 안 갈래) · 옛 정산 판(여덟 묶음 · 겹친 곳 · 업종 · 회사 표) 0', JSON.stringify({main: g.main, h1: g.h1, tab: g.tab, old: g.old}));
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
        sets: 0, go: sec?.querySelector('a.sj-go:not(.sj-all):not(.sj-pkgo)')?.getAttribute('href') ?? null, pk: sec?.querySelector('a.sj-go.sj-pkgo')?.getAttribute('href') ?? null /* 여러 꾀가 고른 회사 고리(주문 1120-0950)는 정산 고리 앞에 있음 — 따로 봄 */ /* 정산 고리 — 「서른여섯 꾀 모두 보기」(a.sj-go.sj-all · 주문 1117-1120)는 셈 밖 */, rule: txt(sec?.querySelector('.sj-rule')), ord: sec?.getAttribute('data-order') ?? null,
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
        href: pk ? '#/k/' + pk : null, win: pk ? (wk[0] === pk ? '1' : '0') : null, pick: pk ? NM[pk] : '', safe: '장이 열리는 날 오전 9시부터 오후 3시까지 한 시간마다, 하루 일곱 번 새로 봐요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'} : null;
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
    check(!same || (g.h === (HS ? '덜 잃은 꾀 차례' : '서른여섯 꾀') && g.lead === '삼십육계는 옛날부터 전해 오는 꾀 서른여섯 가지예요. ' + (G36?.pick?.rule === PICK28 ? '꾀마다 회사를 세 번 거른 뒤, 점수가 높은 회사를 일곱 곳까지 골랐어요.' : '꾀마다 그날 그 꾀를 가장 닮은 회사를 일곱 곳 골랐어요.') && g.rule === ruleW && g.day.endsWith(dayW) && g.go === '#/r/t' && g.pk === '#/o' && g.small === 0),
      W + '꾀 칸 머리 · 한 줄 풀이(삼십육계 — 손자병법과 따로 · 주문 1114-0922) · 차례 까닭(같은 땅 날 · 닷새 뒤 · 덜 잃은 차례) · 고른 날 · 같은 회사 여러 꾀 · 정산 고리 · 누름 48', JSON.stringify({go: g.go, pk: g.pk, small: g.small, h: g.h, day: [g.day.slice(-90), dayW.slice(-90)], rule: g.rule === ruleW ? '같음' : [g.rule, ruleW], lead: g.lead}).slice(0, 700)); // 어긋난 곳이 앞에 보이게(2026-11-20 진짜 사이트 검사 — 500자에서 잘려 까닭이 안 보였음)
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
      const place3 = !ks || (!!got3 && /\bsj-q\b|\bsj-sh\b/.test(w3.prev) && /\bsj-loss\b|\bsj-calm\b|\bsj-lead7\b|\bsj-th\b|\bsj-tricks\b/.test(w3.next));
      check(dataOk3 && JSON.stringify(got3) === JSON.stringify(want3) && place3 && !(w3?.none && w3.any),
        W + '지금 땅의 꾀 셋(주문 1117-1859) — 덜 잃은 차례 안에서 두 조건(아무렇게나 일곱보다 덜 잃음 · 가장 나빴던 열에 한 주가 얕음) · 셋까지 · 차례 그대로 · 꾀 칸 맨 위',
        JSON.stringify({dataOk3, place3, ks, W3: W3.slice(0, 5), prev: w3?.prev, next: w3?.next, diff: want3 && got3 ? Object.keys(want3).filter(k => JSON.stringify(want3[k]) !== JSON.stringify(got3[k])).map(k => [k, got3[k], want3[k]]) : [!!want3, !!got3]}).slice(0, 700));
    }
    // 요즘 주도주 일곱 곳(주문 1126-1748 · 사장님 2026-11-26(서울) 17:48 「두번재 그림이 덜 흔들리는걸로 배치 되러 있다 그걸 료즘 주도주 7주로 다시 찾아내 1등부터 7등까지 배치하라」) — 옛 「덜 흔들린 회사 일곱 곳」(주문 1117-1731) 자리
    //   자료 = 첫 화면 자료 lists.hot(불장 일곱) 차례 그대로 · 1등부터 7등 · 등수 도장 · 이름 · 누르면 그 회사 쪽 · 한 달 꺾은선과 오름 · 내림 표 = 그 회사 한 달 값(c 처음 → 끝) · 오른 크기 숫자 0 · 「%」 0 · 옛 덜 흔들린 칸 0
    //   업종 둘까지(검사가 자료에서 셈) · 자리 = 줄어든 갈래(없으면 지금 땅의 꾀 셋 · 차례 말씀) 바로 아래 · 큰 갈래(없으면 꾀 셋) 바로 위
    const TL = await J('/su/data/su21.json').catch(() => null), LH = Array.isArray(TL?.lists?.hot) ? TL.lists.hot.filter(c => c && /^\d{6}$/.test(String(c.code ?? '')) && typeof c.name === 'string' && c.name.trim() !== '').slice(0, 7) : null;
    const lb = await p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), sec = document.querySelector('#su main.sj-page > section.sj-s36:not(.sj-wait)'), c = sec?.querySelector(':scope > .sj-lead7');
      if (!c) return {none: true, old: [...document.querySelectorAll('#su .sj-calmk')].map(t).filter(x => x.includes('덜 흔들린')).length};
      return {n: c.getAttribute('data-n'), k: t(c.querySelector('.sj-calmk')), l: t(c.querySelector('.sj-calml')), d: t(c.querySelector('.sj-calmd')), tag: c.querySelector('.sj-l7l')?.tagName ?? '',
        cs: [...c.querySelectorAll('a.sj-l7c')].map(a => [a.getAttribute('href'), a.getAttribute('data-rank'), t(a.querySelector('.sj-l7r')), t(a.querySelector('.sj-l7n')), a.getAttribute('data-mon'), t(a.querySelector('.sj-chipm')), !!a.querySelector('svg')]),
        text: t(c), none: t(c.querySelector('.sj-tnone')), prev: c.previousElementSibling?.className ?? '', next: c.nextElementSibling?.className ?? '',
        old: [...document.querySelectorAll('#su .sj-calmk')].map(t).filter(x => x.includes('덜 흔들린')).length}; });
    if (same) {
      const perInd = {}; for (const c of LH ?? []) perInd[c.ind] = (perInd[c.ind] ?? 0) + 1;
      const monW = c => { const v = Array.isArray(c.c) && c.c.length >= 2 && c.c.every(x => Number.isFinite(x) && x > 0) ? c.c : null; return !v ? ['na', ''] : v.at(-1) < v[0] ? ['dn', '내림'] : v.at(-1) > v[0] ? ['up', '오름'] : ['eq', '같음']; };
      const bdL = (() => { const b = TL?.asOf?.board; return typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b) ? (+b.slice(5, 7)) + '월 ' + (+b.slice(8, 10)) + '일' : null; })();
      const want = !LH ? null : {n: String(LH.length), k: '요즘 주도주 일곱 곳', l: '요즘 오르는 업종 안에서 한 달 동안 오른 회사 가운데, 새 높은 값을 찍고 사람이 몰린 날이 많은 회사부터 1등이에요. 하는 일이 같은 회사는 두 곳까지만 골랐어요.',
        d: (bdL ? bdL + ' 마지막 값까지 센 지난 기록이에요. ' : '지난 기록이에요. ') + '앞날을 맞히지 않고, 사고팔기를 권하지 않아요.', tag: LH.length ? 'OL' : '',
        cs: LH.map((c, i) => { const [m, w] = monW(c); return ['#/c/' + encodeURIComponent(c.code), String(i + 1), (i + 1) + '등', c.name.trim(), m, w, m !== 'na']; }), none: LH.length ? '' : '오늘은 고른 회사가 없어요.'};
      const got = lb?.none ? null : {n: lb.n, k: lb.k, l: lb.l, d: lb.d, tag: lb.tag, cs: lb.cs, none: lb.none};
      const dataOk = !LH || (Object.values(perInd).every(v => v <= 2) && new Set(LH.map(c => c.code)).size === LH.length);
      const place = !LH || lb?.none || ((/\bsj-loss\b/.test(lb.prev) || /\bsj-q\b|\bsj-sh\b|\bsj-win3\b/.test(lb.prev)) && (/\bsj-th\b|\bsj-tricks\b/.test(lb.next)));
      check(dataOk && JSON.stringify(got) === JSON.stringify(want) && place && !/%|수익률|추천|1위|매수|매도/.test(lb?.text ?? '') && (lb?.old ?? 1) === 0,
        W + '요즘 주도주 일곱 곳(주문 1126-1748) — 자료 lists.hot 차례 그대로 1등부터 7등 · 이름 · 그 회사 쪽 · 한 달 오름 · 내림 표 · 오른 크기 숫자 · 「%」 0 · 업종 둘까지 · 옛 덜 흔들린 칸 0 · 줄어든 갈래 바로 아래',
        JSON.stringify({dataOk, place, prev: lb?.prev, next: lb?.next, old: lb?.old, diff: want && got ? Object.keys(want).filter(k => JSON.stringify(want[k]) !== JSON.stringify(got[k])).map(k => [k, got[k], want[k]]) : [!!want, !!got]}).slice(0, 700));
    }
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
  // ㉕ 주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답) — 다른 쪽도 병법 서른여섯만 · 이 검사가 자료에서 따로 셈(화면 코드를 쓰지 않음)
  //   가) 꾀 모음 #/k — 산 셈이 있는 날 = 요즘 많이 오른 차례 1등 ~ 36등(주문 1126-1752 · 정산 쪽과 같은 차례 · 지난 7일 오르내림) · 산 셈이 없는 날 = 여섯 묶음(묶음 이름 = 자료 set) × 여섯 꾀(삼십육계 차례) · 꾀마다 「제 ○계」 · 쉬운 이름 · 꾀 이름 · 오늘 차례 · 뜻 · 누르면 그 꾀 쪽 · 첫 쪽 꾀 이름 줄도 그 꾀 쪽
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
    // 가-2) 꾀 모음 = 요즘 많이 오른 차례(주문 1126-1752 · 사장님 2026-11-26(서울) 17:52 「꾀 탭에서 … 요즘 상승률 순위에 순으로 배치하라 1위부터 36위까지 그리고 매일 그 순위에 등락을 화살표로 표기하라 7일 자료를 말이야」)
    //   차례 = 정산 쪽(#/r/t · 같은 셈)과 같은 차례 · 1등부터 36등 · 앞 장날 오르내림 = 정산 쪽 표와 같음 · 지난 7일 날마다 오르내린 칸 = 이 검사가 장부 rk + 오늘 차례로 따로 셈 · 산 셈이 없는 날은 옛 여섯 묶음
    await open(p, '#/r/t');
    const st25 = await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="settle"]');
      return {rows: [...(m?.querySelectorAll('section.sj-st36 li.sj-str') ?? [])].map(li => [li.getAttribute('data-k'), (li.querySelector('a.sj-sta .sj-stm')?.textContent ?? '').trim()]), rated: /많이 늘어난 꾀가 맨 위/.test(m?.querySelector('section.sj-st36 .sj-rule')?.textContent ?? '')}; }); // 맨 앞 .sj-rule 은 사고 팔기 견줌 칸(주문 1125-0049)일 수 있음 — 꾀마다 정산 칸 안에서 찾음
    await open(p, '#/k');
    const ga = await p.evaluate(new Function(txtJS + `const main = document.querySelector('#su main.sj-page[data-page="kkoes"]'), rs = main?.querySelector('section.sj-krank');
      return {main: !!main, h1: txt(document.querySelector('#su h1')), tab: txt(document.querySelector('#su .sj-tabs a[aria-current="page"]')), next: document.querySelector('#su .sj-next')?.getAttribute('href') ?? null,
        rank: rs ? {h: txt(rs.querySelector('h2')), rows: [...rs.querySelectorAll('li.sj-krr')].map(li => [li.getAttribute('data-k'), li.querySelector('a.sj-ka')?.getAttribute('href') ?? '', txt(li.querySelector('.sj-krn')), txt(li.querySelector('.sj-kno')), txt(li.querySelector('.sj-kt b')), txt(li.querySelector('.sj-khan')), txt(li.querySelector('a.sj-ka .sj-stm')),
          [...li.querySelectorAll('.sj-kwa')].map(a => [a.getAttribute('data-day'), txt(a)]), txt(li.querySelector('.sj-kmean')), txt(li.querySelector('.sj-krv > span'))]),
          fs: [...rs.querySelectorAll('.sj-krn, .sj-kwa, .sj-kwkk, .sj-krv span')].map(e => parseFloat(getComputedStyle(e).fontSize)), text: txt(rs)} : null,
        sets: [...(main?.querySelectorAll('section.sj-kset') ?? [])].map(s => ({n: s.getAttribute('data-set'), h: txt(s.querySelector('h2')), rows: [...s.querySelectorAll('li.sj-kr')].map(li => [li.getAttribute('data-k'), li.querySelector('a.sj-ka')?.getAttribute('href') ?? '', txt(li.querySelector('.sj-kno')), txt(li.querySelector('.sj-kt b')), txt(li.querySelector('.sj-khan')), txt(li.querySelector('.sj-krk')), txt(li.querySelector('.sj-kmean'))])}))};`));
    if (st25.rated) {
      const D25 = await J('/su/data/su21-settle.json').catch(() => null), today = typeof D25?.asOf === 'string' ? D25.asOf : null, okO = o => Array.isArray(o) && o.length === 36 && new Set(o).size === 36 && o.every(j => Number.isInteger(j) && j >= 0 && j < 36);
      const days = [], orders = []; if (today && Array.isArray(D25?.rk?.days) && Array.isArray(D25?.rk?.order) && D25.rk.days.length === D25.rk.order.length) D25.rk.days.forEach((d, i) => { if (typeof d === 'string' && d < today && okO(D25.rk.order[i])) { days.push(d); orders.push(D25.rk.order[i]); } });
      if (days.length) { days.push(today); orders.push(st25.rows.map(r => K36.indexOf(r[0]))); }
      const weekW = k => { if (orders.length < 2) return []; const j = K36.indexOf(k), rk = orders.map(o => o.indexOf(j) + 1), out = [];
        for (let i = Math.max(1, rk.length - 7); i < rk.length; i++) if (rk[i] > 0 && rk[i - 1] > 0) { const mv = rk[i - 1] - rk[i]; out.push([days[i], mv > 0 ? '▲' + mv : mv < 0 ? '▼' + -mv : '―']); } return out; };
      const rowsW = st25.rows.map(([k, mvT], i) => [k, '#/k/' + k, (i + 1) + '등', '제' + kn25(k) + '계', G25.name[k], G25.han[k], mvT, weekW(k), G25.mean[k]]);
      const rowsG = ga.rank ? ga.rank.rows.map(r => r.slice(0, 9)) : null, valOk = !!ga.rank && ga.rank.rows.every(r => /^처음 넣은 100원이 지금 [0-9.,]+원이에요\.$|하루밖에|산 적이 없어요/.test(r[9]));
      check(okT25 && ga.main && ga.h1 === '병법 서른여섯 가지' && ga.tab === '꾀' && st25.rows.length === 36 && !!ga.rank && ga.rank.h === '요즘 많이 오른 차례' && JSON.stringify(rowsG) === JSON.stringify(rowsW) && valOk && ga.sets.length === 0 && ga.next === '#/k/' + st25.rows[0][0]
        && ga.rank.fs.length > 0 && ga.rank.fs.every(f => f >= 16.9) && !/%|1위|추천|매수|매도/.test(ga.rank.text),
        W + '가) 꾀 모음 = 요즘 많이 오른 차례(주문 1126-1752) — 정산 쪽과 같은 차례 · 1등부터 36등 · 앞 장날 오르내림 = 정산 쪽 · 지난 7일 날마다 오르내린 칸 = 장부 rk + 오늘 차례 · 처음 넣은 100원이 지금 ○원 · 누르면 그 꾀 쪽 · 다음 = 1등 꾀 · 글 17 넘게 · 「1위」 · 「%」 0',
        JSON.stringify({main: ga.main, h1: ga.h1, tab: ga.tab, next: ga.next, n: st25.rows.length, h: ga.rank?.h, valOk, fsMin: ga.rank ? Math.min(...ga.rank.fs) : null, days: days.length, bad: rowsG ? rowsG.map((r, i) => (JSON.stringify(r) === JSON.stringify(rowsW[i]) ? null : [i, r, rowsW[i]])).filter(Boolean).slice(0, 2) : 'no rank'}).slice(0, 900));
    } else {
      const setsW = [0, 1, 2, 3, 4, 5].map(i => ({n: String(i + 1), h: G25.set[K36[i * 6]], rows: K36.slice(i * 6, i * 6 + 6).map(k => [k, '#/k/' + k, '제' + kn25(k) + '계', G25.name[k], G25.han[k], RK36[k] ? RK36[k].i + '번째' : '', G25.mean[k]])}));
      check(okT25 && ga.main && ga.h1 === '병법 서른여섯 가지' && ga.tab === '꾀' && JSON.stringify(ga.sets) === JSON.stringify(setsW) && ga.next === '#/k/' + (sun25 ? ORD36[0] : 'g01'),
        W + '가) 꾀 모음 — 여섯 묶음 × 여섯 꾀(삼십육계 차례 · 묶음 이름 = 자료) · 제 ○계 · 쉬운 이름 · 꾀 이름 · 오늘 차례 · 뜻 · 누르면 그 꾀 쪽 · 탭 「꾀」 · 다음 = 맨 위 꾀', JSON.stringify({main: ga.main, h1: ga.h1, tab: ga.tab, next: ga.next, bad: setsW ? ga.sets.map((s, i) => (JSON.stringify(s) === JSON.stringify(setsW[i]) ? null : [s.n, s.h, s.rows.find((r, j) => JSON.stringify(r) !== JSON.stringify(setsW[i].rows[j]))])).filter(Boolean).slice(0, 2) : 'data'}).slice(0, 500));
    }
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
      await p.evaluate(() => { for (const b of document.querySelectorAll('#su button.sj-f7b[aria-expanded="false"]')) b.click(); }); // 접힌 긴 줄(주문 1127-1714 「더 보기」)은 펼친 뒤 잼 — 펼친 줄 그림도 화면 밖은 기다리고 내려 보면 한 번 놂
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
    const inSwipe = e => { for (let a = e.parentElement; a && a.id !== 'su'; a = a.parentElement) { const c = getComputedStyle(a); if (/auto|scroll/.test(c.overflowX)) { const q = a.getBoundingClientRect(); return q.left >= -1 && q.right <= innerWidth + 1 && a.scrollWidth > a.clientWidth; } } return false; };
    const W = innerWidth, out = [], txtOf = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
    for (const e of document.querySelectorAll('#su main *, #su .sj-top *, #su .sj-tabs *')) {
      const t = txtOf(e), chars = t.replace(/\s/g, '').length; if (chars < 3 || e.closest('svg, .sj-hwa, .sj-seal, details:not([open]) > :not(summary)')) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || /^vertical/.test(cs.writingMode)) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.45, ch = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth), lines = Math.max(1, Math.round(ch / lh));
      const at = (e.parentElement?.className && typeof e.parentElement.className === 'string' ? e.parentElement.className.trim().split(/\s+/)[0] + ' > ' : '') + ((typeof e.className === 'string' && e.className.trim()) || e.tagName.toLowerCase());
      if (chars >= 4 && ((lines >= 3 && chars / lines < 3) || (lines >= 2 && chars / lines < 2.2))) out.push(['세로', at, Math.round(r.width), lines, t.slice(0, 20)]);
      if ((r.right > W + 1 || r.left < -1) && !inSwipe(e)) out.push(['넘침', at, Math.round(r.left), Math.round(r.right), t.slice(0, 20)]); // 옆으로 넘겨 보는 칸(가로 스크롤 · 칸 자신은 화면 안 — 오늘의 꾀 한 장 · 주문 1126-1249) 속 다음 장은 넘침이 아님
      if (/hidden|clip/.test(cs.overflowX + ' ' + cs.overflow) && e.scrollWidth > e.clientWidth + 2 && cs.textOverflow !== 'ellipsis') out.push(['잘림', at, e.scrollWidth, e.clientWidth, t.slice(0, 20)]);
    }
    if (document.documentElement.scrollWidth > W + 1) out.push(['쪽 넘침', document.documentElement.scrollWidth]);
    return out;
  };
  const G29 = await J('/su/data/su21-s36.json').catch(() => null), K29 = Array.isArray(G29?.kinds) ? G29.kinds : [], C29 = K29.map(k => G29?.lists?.[k]?.[0]?.code).find(c => /^[0-9A-Z]{6}$/.test(String(c ?? ''))) ?? null;
  const PAGES29 = ['#/', '#/k', '#/k/' + (K29[0] ?? 'g01'), ...(C29 ? ['#/c/' + C29] : []), '#/r/t', '#/q', '#/j', '#/o', '#/l']; // #/l 장부(주문 1120-1705) // #/o 여러 꾀가 고른 회사(주문 1120-0950)
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
  const sw30 = stanceWant(T0?.sun ?? null), st30 = sw30 && !sw30.none ? [['def', sw30.ks[0]], ['mid', sw30.ks[1]], ['att', sw30.ks[2]]].filter(([, k]) => !!k) : []; // 첫 쪽 세 태세 칸은 지움(주문 1126-1748) — 같은 셈을 검사가 따로 함
  const other = ['g01', 'g02', 'g03'].find(k => !st30.some(x => x[1] === k));
  const tagBad = [];
  for (const [st, k] of [...st30, ...(other ? [[null, other]] : [])]) {
    await open(p, '#/k/' + k);
    const t = await p.evaluate(() => { const ph = document.querySelector('#su main.sj-page[data-page="kkoe"] section.sj-ph'), a = ph?.querySelector(':scope > a.sj-kst3');
      return {has: !!a, st: a?.getAttribute('data-st') ?? null, afterKick: !!a && a.previousElementSibling?.matches('.sj-k'), txt: (a?.textContent ?? '').replace(/\s+/g, ' ').trim()}; });
    if (st ? !(t.has && t.st === st && t.afterKick && /(수비형|보편형|공격형) 꾀예요/.test(t.txt)) : t.has) tagBad.push([k, st, t]);
  }
  check(!tagBad.length, W + '가) 꾀 쪽 맨 위 세 태세 표지 — 검사가 sun.rank 로 따로 센 세 태세와 같은 꾀 · 같은 태세 · 다른 꾀에는 없음(첫 쪽 칸은 주문 1126-1748 로 지움)', JSON.stringify({st30, tagBad}).slice(0, 400));
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
{ // ㉛ 주문 1120-1447(사장님 2026-11-20(마카오) 14:47 「종목 검색 기능 … 검색창 … 상세 정보를 한눈에 … 연간 수익률 및 기간별 주가 변동률 현재 주가와 과거 주가 흐름 … 매출, 영업이익 … 7단 분석 … 뉴스 … 공시」 · 15:27 「5시까지」)
  //   가) 회사 탭(#/o) 맨 위 찾기 칸 — 이 검사가 /atlas/data/mkt.json 으로 따로 고른 곳과 같음(이름 그대로 → 그 회사 맨 위 · 번호 → 그 회사 · 없는 이름 → 줄 0 · 「찾는 회사가 없어요」) · 누르면 #/c/<번호>
  //   나) 회사 쪽 값과 실적 — 이 검사가 /atlas/data/co/<번호>.json close · fin 으로 다시 셈: 지금 값 · 1년 사이 가장 크게 떨어진 때(손실 먼저 · 셈 칸보다 앞) · 1주 · 1달 · 3달 · 1년 100원이 · 세 해 번 돈 · 「%」 0
  //   다) 더 알아보기 — 7단 고리(3 ~ 7단 = /next/?su=back#/w/<번호>(/past · rivals · grow · range)) · 바깥 둘(네이버 증권 뉴스 · 공시 / 증권사 글 — 새 창) · 증권사 앞날 값 · 사고팔기 의견은 화면 글 0
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  const W = '㉛ [390] ', CD = /^[0-9A-Z]{6}$/, nm = t => String(t ?? '').normalize('NFC').toLowerCase().replace(/[\s·.\-()]/g, '');
  const MK = await J('/atlas/data/mkt.json').catch(() => null), CO = MK?.companies && typeof MK.companies === 'object' ? Object.entries(MK.companies).filter(([c, o]) => CD.test(c) && typeof o?.n === 'string' && o.n) : [];
  const pick = CO.find(([c, o]) => c === (FC?.code ?? '005930')) ?? CO.find(([, o]) => !CO.some(([, x]) => x !== o && nm(x.n).startsWith(nm(o.n)) && nm(x.n) !== nm(o.n))) ?? CO[0] ?? null; // 이름이 다른 이름의 앞머리가 아닌 회사(이름 그대로 쓰면 맨 위가 하나로 정해짐)
  await open(p, '#/o');
  const typeIn = async q => { await p.fill('#su section.sj-find input.sj-findi', q); await p.waitForFunction(q => { const n = document.querySelector('#su .sj-findn')?.textContent ?? ''; return !q || /누르면|찾는 회사가 없어요|받지 못했어요/.test(n); }, q, {timeout: 15000}).catch(() => {});
    return p.evaluate(() => ({rows: [...document.querySelectorAll('#su .sj-findl > li.sj-findr')].map(li => [li.getAttribute('data-code'), li.querySelector('a.sj-finda')?.getAttribute('href') ?? '', (li.querySelector('a.sj-finda > b')?.textContent ?? '').trim()]), note: (document.querySelector('#su .sj-findn')?.textContent ?? '').trim()})); };
  const fb = await p.evaluate(() => { const sec = document.querySelector('#su main.sj-page[data-page="picks"] > section.sj-find'), i = sec?.querySelector('input.sj-findi'), r = i?.getBoundingClientRect();
    return {has: !!i, first: !!sec && sec.previousElementSibling?.matches('section.sj-ph') === true, type: i?.getAttribute('type') ?? '', label: i?.getAttribute('aria-label') ?? '', h: r ? Math.round(r.height) : 0, fs: i ? parseFloat(getComputedStyle(i).fontSize) : 0}; });
  const byName = pick ? await typeIn(pick[1].n) : null, byCode = pick ? await typeIn(pick[0]) : null, none = await typeIn('없는회사이름가나다');
  const rowsOk = r => !!r && r.rows.length >= 1 && r.rows.length <= 8 && r.rows.every(([c, href, n]) => CD.test(c ?? '') && href === '#/c/' + c && MK.companies[c]?.n === n);
  check(fb.has && fb.first && fb.type === 'search' && /회사 찾기/.test(fb.label) && fb.h >= 48 && fb.fs >= 16.95 && !!pick && rowsOk(byName) && byName.rows[0][0] === pick[0] && rowsOk(byCode) && byCode.rows[0][0] === pick[0]
    && none.rows.length === 0 && /찾는 회사가 없어요/.test(none.note),
    W + '가) 회사 찾기(#/o 맨 위) — 이름 그대로 → 그 회사가 맨 위 · 번호 → 그 회사 · 없는 이름 → 줄 0 · 줄마다 #/c/<번호> · 이름 = 회사 목록 그대로 · 칸 높이 48 · 글 17px 넘게',
    JSON.stringify({fb, pick: pick?.[0], byName: byName?.rows.slice(0, 3), byCode: byCode?.rows.slice(0, 2), none}).slice(0, 500));
  if (pick) { // 고른 회사를 누르면 그 회사 쪽
    await typeIn(pick[1].n); await p.click('#su .sj-findl > li.sj-findr:first-child a.sj-finda'); await p.waitForFunction(c => location.hash === '#/c/' + c && !!document.querySelector('#su main.sj-page[data-page="co"]'), pick[0], {timeout: 15000}).catch(() => {});
    check(await p.evaluate(c => location.hash === '#/c/' + c && !!document.querySelector('#su main.sj-page[data-page="co"]'), pick[0]), W + '가) 찾은 줄을 누르면 그 회사 쪽(#/c/<번호>)', pick[0]);
  }
  for (const code of [pick?.[0], FC?.code].filter((c, i, a) => c && a.indexOf(c) === i)) {
    const CJ = await J('/atlas/data/co/' + code + '.json').catch(() => null);
    await open(p, '#/c/' + code);
    const g = await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="co"]'), v = m?.querySelector(':scope > section.sj-coval'), l = m?.querySelector(':scope > section.sj-colink'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
      return {v: !!v, after: v?.previousElementSibling?.matches('section.sj-ph') === true, now: t(v?.querySelector('.sj-cynow > b')), low: t(v?.querySelector('.sj-cylow')), lowFirst: !!v && !!v.querySelector('.sj-cylow') && (!v.querySelector('.sj-cysp') || !!(v.querySelector('.sj-cylow').compareDocumentPosition(v.querySelector('.sj-cysp')) & 4)),
        sp: [...(v?.querySelectorAll('.sj-cysp > li') ?? [])].map(li => [li.getAttribute('data-span'), t(li.querySelector('b'))]), fin: [...(v?.querySelectorAll('.sj-cfl > li.sj-cfy') ?? [])].map(li => [li.getAttribute('data-year'), ...[...li.querySelectorAll('.sj-cfm')].map(x => x.getAttribute('data-k') + ':' + t(x.querySelector('b')))]),
        vt: v?.innerText ?? '', lt: l?.innerText ?? '', seven: [...(l?.querySelectorAll('ol.sj-co7 > li a') ?? [])].map(a => a.getAttribute('href')), outs: [...(l?.querySelectorAll('a.sj-colout') ?? [])].map(a => [a.getAttribute('href'), a.getAttribute('target'), a.getAttribute('rel')])}; });
    const cl = Array.isArray(CJ?.close) ? CJ.close.filter(v => typeof v === 'number' && v > 0) : [], n = cl.length, NFk = new Intl.NumberFormat('ko-KR'), w = r => (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원';
    const y = cl.slice(-Math.min(n, 251)); let pk = y[0], dd = 0; for (const v of y) { if (v > pk) pk = v; dd = Math.min(dd, v / pk - 1); }
    const spW = [['1주', 5], ['1달', 20], ['3달', 60], ['1년', 250]].filter(([, d]) => n > d).map(([k, d]) => [k, '100원이 ' + w(cl[n - 1] / cl[n - 1 - d] - 1)]);
    const eok = v => { const a = Math.abs(v); return a >= 10000 ? (a / 10000).toFixed(1).replace(/\.0$/, '') + '조 원' : NFk.format(Math.round(a)) + '억 원'; }, F = CJ?.fin;
    const finW = F && Array.isArray(F.years) ? F.years.map((t, i) => [String(t).slice(0, 4), ...[['rev', F.rev?.[i]], ['op', F.op?.[i]], ['net', F.net?.[i]]].filter(([, v]) => typeof v === 'number' && Number.isFinite(v)).map(([k, v]) => k + ':' + eok(v))]).filter(r => /^\d{4}$/.test(r[0]) && r.length > 1).reverse() : [];
    const sevenW = ['w/' + code, 'w/' + code + '/past', 'w/' + code + '/rivals', 'w/' + code + '/grow', 'w/' + code + '/range'].map(x => '/next/?su=back#/' + x);
    const outW = [['https://finance.naver.com/item/news.naver?code=' + code, '_blank', 'noopener noreferrer'], ['https://finance.naver.com/item/coinfo.naver?code=' + code, '_blank', 'noopener noreferrer']];
    const lowW = y.length >= 2 ? (dd < 0 ? '사이 가장 크게 떨어졌을 때, 100원이 ' + w(dd) + '이 됐어요.' : '사이 떨어진 날이 없었어요.') : null;
    const okV = n >= 2 && g.v && g.after && g.now === NFk.format(cl[n - 1]) + '원' && !!lowW && g.low.endsWith(lowW) && g.lowFirst && JSON.stringify(g.sp) === JSON.stringify(spW)
      && JSON.stringify(g.fin) === JSON.stringify(finW) && !/%/.test(g.vt) && /앞날을 맞히지 않고/.test(g.vt);
    check(okV, W + '나) 회사 쪽 값과 실적(#/c/' + code + ') — 머리 바로 아래 · 지금 값 · 1년 사이 가장 크게 떨어진 때가 셈 칸보다 앞 · 1주 · 1달 · 3달 · 1년 100원이 · 세 해 번 돈 = 이 검사가 회사 자료로 다시 셈 · 「%」 0',
      JSON.stringify({n, now: g.now, low: g.low.slice(-40), lowW, sp: g.sp, spW, fin: g.fin.slice(0, 1), finW: finW.slice(0, 1)}).slice(0, 600));
    const okL = sevenW.every(x => g.seven.includes(x)) && JSON.stringify(g.outs) === JSON.stringify(outW) && !/목표|매수|매도|추천|전망|%/.test(g.lt) && /앞날을 맞히는 글이라서/.test(g.lt);
    check(okL, W + '다) 더 알아보기(#/c/' + code + ') — 7단 고리(3 ~ 7단) · 바깥 둘(뉴스 · 공시 / 증권사 글 — 새 창) · 증권사 앞날 값 · 사고팔기 의견 글 0', JSON.stringify({seven: g.seven, outs: g.outs, lt: g.lt.slice(0, 120)}).slice(0, 500));
    pageRules(await measure(p), W + '회사 쪽 #/c/' + code);
  }
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
{ // ㉜ 주문 1120-1705(사장님 2026-11-20(마카오) 17:05 「종목 찾기를 선물 옆에 배치 … 날짜별로 어떤종목을 … 얼마나 … 어떻게 됐는지 그래프와 데이타로 … 하단에 … 탭 … 적당한 이름 … 모든 거래내역 추적하고 기록」)
  //   가) 맨 위 「찾기」 = 선물 바로 앞 · 보임 · #/o · 누르면 회사 탭 찾기 칸에 커서 · 세 폭(390 · 360 · 320)에서 머리 줄 한 줄(높이 그대로)
  //      (주문 1127-2320 「한국어 · 영어」 탭은 머리 줄 아래 따로 한 줄 — 머리 줄 높이는 그 줄을 빼고 잼 · 탭은 ㊾)
  //   나) 장부(#/l · 탭 「장부」 켜짐) = 이 검사가 정산 장부(su21-settle.json buys · now · qty)로 따로 다시 셈 — 모두 산 돈 · 지금 · 산 날 수 · 회사 수 · 날마다(새 날 먼저 · 회사 곳 수 · 산 번 · 산 돈) · 회사마다 산 돈 차례(맨 위 스물)
  //       꺾은선 · 막대 그림 · 손실 먼저 한 줄 · 「%」 「매수」 「수익률」 0 · 앞날 아님 한 줄
  const W = '㉜ ';
  for (const width of [390, 360, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage();
    await open(p, '#/k');
    const t = await p.evaluate(() => { const a = document.querySelector('#su .sj-top .sj-tools a.sj-findtop'), g = document.getElementById('giftBtn'), top = document.querySelector('#su .sj-top'), r = a?.getBoundingClientRect(), rg = g?.getBoundingClientRect();
      return {has: !!a, shown: !!a && getComputedStyle(a).display !== 'none' && (r?.width ?? 0) >= 47.5 && (r?.height ?? 0) >= 47.5, next: a?.nextElementSibling === g, row: !!r && !!rg && Math.abs(r.top - rg.top) < 2, href: a?.getAttribute('href') ?? '', txt: (a?.textContent ?? '').trim(), topH: (() => { const R = top?.getBoundingClientRect(), lg = top?.querySelector(':scope > .sj-lang'); if (!R) return 0; if (!lg) return Math.round(R.height); /* 「한국어 · 영어」 탭 한 줄(주문 1127-2320)은 머리 줄 아래 따로 — 그 줄은 빼고 잼 */ const rs = [...top.children].filter(c => c !== lg).map(c => c.getBoundingClientRect()).filter(r => r.height > 0); return Math.round(Math.max(...rs.map(r => r.bottom)) - R.top + parseFloat(getComputedStyle(top).paddingBottom)); })(), wide: document.documentElement.scrollWidth <= innerWidth + 1}; });
    let focus = null;
    if (t.has) { await p.click('#su .sj-top a.sj-findtop'); await p.waitForFunction(() => location.hash === '#/o' && document.activeElement?.matches?.('input.sj-findi'), null, {timeout: 12000}).catch(() => {});
      focus = await p.evaluate(() => ({hash: location.hash, active: document.activeElement?.matches?.('#su main.sj-page[data-page="picks"] input.sj-findi') ?? false})); }
    check(t.has && t.shown && t.next && t.row && t.href === '#/o' && t.txt === '찾기' && t.topH <= 72 && t.wide && focus?.hash === '#/o' && focus.active,
      W + '[' + width + '] 가) 맨 위 「찾기」 — 선물 바로 앞 · 같은 줄 · 48 넘게 · 누르면 회사 탭 찾기 칸에 커서 · 머리 줄 한 줄', JSON.stringify({t, focus}).slice(0, 300));
    await ctx.close();
  }
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  const DL = await J('/su/data/su21-settle.json').catch(() => null), KK = /^g(0[1-9]|[12]\d|3[0-6])$/, q = Number.isFinite(DL?.qty) ? DL.qty : 10;
  const rows = Array.isArray(DL?.buys) && Array.isArray(DL?.kinds) ? DL.buys.filter(b => Array.isArray(b) && KK.test(String(DL.kinds[b[1]] ?? '')) && typeof b[3] === 'number' && Number.isFinite(b[3]) && b[3] > 0).map(([d, ki, c, buy]) => {
    const okN = Array.isArray(DL.now?.[c]) && typeof DL.now[c][0] === 'number' && Number.isFinite(DL.now[c][0]), nw = okN ? DL.now[c][0] : buy, nd = okN ? DL.now[c][1] : d;
    return {d, c, k: String(DL.kinds[ki]), cost: buy * q, val: nw * q, one: !(nd > d)}; }) : [];
  const dayM = new Map(), coM = new Map();
  for (const r of rows) { const a = dayM.get(r.d) ?? dayM.set(r.d, {cos: new Set(), n: 0, cost: 0}).get(r.d); a.cos.add(r.c); a.n++; a.cost += r.cost; const b = coM.get(r.c) ?? coM.set(r.c, {cost: 0}).get(r.c); b.cost += r.cost; }
  const W2 = {cost: Math.round(rows.reduce((s, r) => s + r.cost, 0)), val: Math.round(rows.reduce((s, r) => s + r.val, 0)), days: dayM.size, cos: coM.size,
    dayRows: [...dayM.keys()].sort().reverse().map(d => [d, dayM.get(d).cos.size, dayM.get(d).n]), top: [...coM].sort((a, b) => b[1].cost - a[1].cost || (a[0] < b[0] ? -1 : 1)).slice(0, 20).map(([c]) => c)};
  // 거르개 열여덟(주문 1120-1817) — 이 검사가 따로 셈: 기간(마지막 장날 N) · 묶기(회사 · 꾀) · 결과(늘어남 · 줄어듦 — 하루치는 뺌) · 차례(+ 같으면 산 돈 큰 곳 · 이름표 차례)
  const allDays = [...dayM.keys()].sort(), stR = x => (x.one ? 'one' : Math.round(x.val - x.cost) > 0 ? 'up' : Math.round(x.val - x.cost) < 0 ? 'dn' : 'eq');
  const CMPW = {loss: (a, b) => (a.val - a.cost) - (b.val - b.cost), cost: (a, b) => b.cost - a.cost, high: (a, b) => b.val / b.cost - a.val / a.cost};
  const viewW = (by, nDays, res, sort) => { const keepD = new Set(nDays ? allDays.slice(-nDays) : allDays), m = new Map();
    for (const r of rows) { if (!keepD.has(r.d)) continue; const key = by === 'k' ? r.k : r.c, g = m.get(key) ?? m.set(key, {key, cost: 0, val: 0, one: true}).get(key); g.cost += r.cost; g.val += r.val; g.one = g.one && r.one; }
    return [...m.values()].filter(x => res === 'all' || stR(x) === res).sort((a, b) => CMPW[sort](a, b) || b.cost - a.cost || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)); };
  await open(p, '#/l'); await p.evaluate(() => { for (const d of document.querySelectorAll('#su section.sj-ldf details.sj-ldfmore')) d.open = true; }); // 거르개 열다섯 서랍(주문 1127-1922)을 열고 잼
  const readL = () => p.evaluate(() => { const l = document.querySelector('#su section.sj-ldf .sj-ldlist');
    return {d: l ? Object.fromEntries([...l.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name.slice(5), a.value])) : null, keys: [...(l?.querySelectorAll(':scope > ol.sj-ldl1 > li.sj-ldr, :scope > details.sj-ldmore > ol > li.sj-ldr') ?? [])].map(li => li.getAttribute('data-key')),
      days: [...(l?.querySelectorAll(':scope > details.sj-ldd') ?? [])].map(d => [d.getAttribute('data-day'), +d.getAttribute('data-n'), d.querySelectorAll('li.sj-ldr').length, d.open])}; });
  const g = await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="ledger"]'), sec = m?.querySelector('section.sj-ldg'), f = m?.querySelector('section.sj-ldf'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const ch = [...(f?.querySelectorAll('button.sj-ldchip') ?? [])];
    return {main: !!m, rule: sec?.getAttribute('data-rule') ?? null, cost: +(sec?.getAttribute('data-cost') ?? NaN), val: +(sec?.getAttribute('data-val') ?? NaN), days: +(sec?.getAttribute('data-days') ?? NaN), cos: +(m?.querySelector('section.sj-ldfind')?.getAttribute('data-n') ?? 0),
      frule: f?.getAttribute('data-rule') ?? null, chips: ch.length, groups: ['view', 'span', 'res', 'sort'].map(k => ch.filter(b => b.dataset.g === k).length), on: ch.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.g + ':' + b.dataset.v),
      small: ch.filter(b => b.getBoundingClientRect().height < 47.5 || parseFloat(getComputedStyle(b).fontSize) < 16.95).length, charts: sec ? [!!sec.querySelector('svg.sj-ldc polyline.sj-ldval'), !!sec.querySelector('svg.sj-ldb rect.sj-ldbar')] : [],
      loss: t(m?.querySelector('.sj-loss')), text: m?.innerText ?? '', tab: t(document.querySelector('#su .sj-tabs a[aria-current="page"]')), wide: document.documentElement.scrollWidth <= innerWidth + 1}; });
  const L0 = await readL(), opW = (() => { const i = L0.days.findIndex(([, , , o]) => o); return i; })();
  const dayOk = JSON.stringify(L0.days.map(([d, n]) => [d, n])) === JSON.stringify(W2.dayRows.map(([d, n]) => [d, n])) && L0.days.every(([d, n, li]) => li === n) && L0.days.filter(x => x[3]).length === 1;
  const tap = async (gk, v) => { await p.evaluate(() => { for (const d of document.querySelectorAll('#su section.sj-ldf details.sj-ldfmore')) d.open = true; }); await p.click('#su section.sj-ldf button.sj-ldchip[data-g="' + gk + '"][data-v="' + v + '"]'); await p.waitForTimeout(120); };
  await tap('view', 'co'); await tap('sort', 'cost'); const LA = await readL();
  await tap('view', 'k'); await tap('res', 'dn'); await tap('sort', 'loss'); const LB = await readL(), WB = viewW('k', 0, 'dn', 'loss').map(x => x.key);
  await tap('view', 'co'); await tap('span', 'w1'); await tap('res', 'up'); await tap('sort', 'high'); const LC = await readL(), WCx = viewW('co', 5, 'up', 'high'), WC = WCx.map(x => x.key);
  const fOk = g.frule === 'ledger-filter-v1' && g.chips === 18 && JSON.stringify(g.groups) === '[3,6,3,6]' && JSON.stringify(g.on) === JSON.stringify(['view:day', 'span:all', 'res:all', 'sort:loss']) && g.small === 0
    && L0.d?.view === 'day' && dayOk && JSON.stringify(LA.keys.slice(0, 20)) === JSON.stringify(W2.top) && JSON.stringify(LB.keys) === JSON.stringify(WB)
    && JSON.stringify(LC.keys) === JSON.stringify(WC) && +LC.d?.n === WC.length && Math.abs(+LC.d?.cost - Math.round(WCx.reduce((s, x) => s + x.cost, 0))) <= 1;
  check(g.main && g.rule === 'ledger-v1' && Math.abs(g.cost - W2.cost) <= 1 && Math.abs(g.val - W2.val) <= 1 && g.days === W2.days && g.cos === W2.cos && fOk
    && (rows.length ? g.charts.every(Boolean) : true) && /줄어든|아직 돈이 줄어든 회사는 없어요/.test(g.loss) && !/%|매수|매도|수익률|추천|1등|대박/.test(g.text) && /앞날을 맞히지 않고/.test(g.text) && g.tab === '기록' && g.wide,
    W + '나) 장부(#/l · 탭 「장부」) — 이 검사가 정산 장부로 다시 센 모두 산 돈 · 지금 · 산 날 · 회사 수와 같음 · 거르개 열여덟(보기 셋 · 기간 여섯 · 결과 셋 · 차례 여섯 · 처음 날짜별 · 모두 · 모두 · 줄어든 돈 먼저) · 날짜별(새 날 먼저) · 회사별 산 돈 차례 · 꾀별 줄어든 것 · 1주 늘어난 것 100원이 많이 된 차례 = 다시 셈 · 「%」 「매수」 0',
    JSON.stringify({want: {cost: W2.cost, val: W2.val, days: W2.days, cos: W2.cos, top: W2.top.slice(0, 3), B: WB.slice(0, 4), C: WC.slice(0, 4), Cn: WC.length}, got: {cost: g.cost, val: g.val, days: g.days, cos: g.cos, chips: g.chips, groups: g.groups, on: g.on, small: g.small, d0: L0.days.slice(0, 2), op: opW, A: LA.keys.slice(0, 3), B: LB.keys.slice(0, 4), C: LC.keys.slice(0, 4), Cd: LC.d}}).slice(0, 700));
  { // 다) 장부에서 회사 찾기(주문 1120-1804) — 산 돈이 가장 큰 회사 이름 그대로 → 그 회사가 맨 위 · 산 날 줄 수 = 이 검사가 장부로 다시 센 그 회사 산 셈 수 · 없는 이름 → 0 · 「없는 회사예요」
    const c0 = W2.top[0] ?? null, nm0 = c0 ? (Array.isArray(DL?.co?.[c0]) ? DL.co[c0][0] : null) ?? c0 : null, n0 = c0 ? rows.filter(r => r.c === c0).length : 0;
    const typeL = async v => { await p.fill('#su section.sj-ldfind input.sj-ldfi', v); await p.waitForTimeout(250);
      return p.evaluate(() => ({cs: [...document.querySelectorAll('#su section.sj-ldfind .sj-ldfo > .sj-ldfc')].map(e => [e.getAttribute('data-code'), +e.getAttribute('data-n'), e.querySelectorAll('ol.sj-ldt > li').length]), note: (document.querySelector('#su section.sj-ldfind .sj-findn')?.textContent ?? '').trim()})); };
    const sec = await p.evaluate(() => { const s = document.querySelector('#su main.sj-page[data-page="ledger"] > section.sj-ldfind'), i = s?.querySelector('input.sj-ldfi'), r = i?.getBoundingClientRect();
      return {has: !!i, after: s?.previousElementSibling?.matches('section.sj-ph') === true, h: r ? Math.round(r.height) : 0, fs: i ? parseFloat(getComputedStyle(i).fontSize) : 0}; });
    const byName = nm0 ? await typeL(nm0) : null, none = await typeL('없는회사이름가나다'), byCode = c0 ? await typeL(c0) : null;
    check(sec.has && sec.after && sec.h >= 48 && sec.fs >= 16.95 && (!c0 || (byName.cs[0]?.[0] === c0 && byName.cs[0][1] === n0 && byName.cs[0][2] === n0 && byCode.cs[0]?.[0] === c0)) && none.cs.length === 0 && /없는 회사예요/.test(none.note),
      W + '다) 장부에서 회사 찾기(주문 1120-1804) — 머리 바로 아래 · 이름 그대로 → 그 회사 맨 위 · 산 날 줄 수 = 장부로 다시 센 산 셈 수 · 번호로도 · 없는 이름 → 0',
      JSON.stringify({sec, c0, nm0, n0, byName: byName?.cs.slice(0, 2), byCode: byCode?.cs.slice(0, 1), none}).slice(0, 400));
    await p.fill('#su section.sj-ldfind input.sj-ldfi', '');
  }
  { // 라) 고른 것 기억(주문 1120-1935 · 사장님 19:35 「어 그렇게 해」) — 나)에서 마지막으로 고른 회사별 · 1주 · 늘어난 것 · 100원이 많이 된 차례가 다른 쪽에 갔다 와도 그대로 · 「처음대로」를 누르면 날짜별 · 모두 · 모두 · 줄어든 돈 먼저 · 다시 와도 처음대로
    const onOf = () => p.evaluate(() => [...document.querySelectorAll('#su section.sj-ldf button.sj-ldchip[aria-pressed="true"]')].map(b => b.dataset.g + ':' + b.dataset.v).join(' ') + ' | ' + (document.querySelector('#su section.sj-ldf .sj-ldlist')?.getAttribute('data-view') ?? ''));
    await open(p, '#/k'); await open(p, '#/l'); const kept = await onOf();
    const rb = await p.evaluate(() => { const b = document.querySelector('#su section.sj-ldf button.sj-ldreset'), r = b?.getBoundingClientRect(); return b ? {h: Math.round(r.height), fs: parseFloat(getComputedStyle(b).fontSize), t: b.textContent.trim()} : null; });
    if (rb) await p.click('#su section.sj-ldf button.sj-ldreset');
    const reset1 = await onOf(); await open(p, '#/k'); await open(p, '#/l'); const reset2 = await onOf();
    const D0 = 'view:day span:all res:all sort:loss | day';
    check(kept === 'view:co span:w1 res:up sort:high | co' && !!rb && rb.h >= 47.5 && rb.fs >= 16.95 && rb.t === '처음대로' && reset1 === D0 && reset2 === D0,
      W + '라) 거르개 기억(주문 1120-1935) — 다른 쪽에 갔다 와도 고른 것 그대로 · 「처음대로」 = 날짜별 · 모두 · 모두 · 줄어든 돈 먼저 · 다시 와도 처음대로', JSON.stringify({kept, rb, reset1, reset2}).slice(0, 300));
  }
  { // 마) 그림을 누르면 그날 숫자(주문 1120-2041 · 사장님 20:41 「어 그렇게 해」) — 처음은 마지막 날 · 꺾은선 맨 왼쪽을 누르면 첫날까지 쌓인 돈 · 막대 첫째를 누르면 첫날 산 돈 = 이 검사가 장부로 다시 센 값 · 글 17px 넘게
    const dd = allDays, d0 = dd[0], dN = dd[dd.length - 1], c0 = Math.round(rows.filter(r => r.d === d0).reduce((s, r) => s + r.cost, 0)), v0 = Math.round(rows.filter(r => r.d === d0).reduce((s, r) => s + r.val, 0));
    const cN = Math.round(rows.reduce((s, r) => s + r.cost, 0)), vN = Math.round(rows.reduce((s, r) => s + r.val, 0)), cNb = Math.round(rows.filter(r => r.d === dN).reduce((s, r) => s + r.cost, 0));
    const rd = sel => p.evaluate(sel => { const e = document.querySelector(sel); return e ? {day: e.getAttribute('data-day'), cost: +e.getAttribute('data-cost'), val: +e.getAttribute('data-val'), t: e.textContent.trim(), fs: parseFloat(getComputedStyle(e).fontSize)} : null; }, sel);
    const tapAt = async (sel, fx) => { const b = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, sel); if (b) { await p.mouse.click(b.x + b.w * fx, b.y + b.h / 2); await p.waitForTimeout(150); } return !!b; };
    const cA = await rd('#su section.sj-ldg .sj-ldreadc'), bA = await rd('#su section.sj-ldg .sj-ldreadb');
    const okTap = dd.length ? (await tapAt('#su section.sj-ldg svg.sj-ldc', 0.02)) && (await tapAt('#su section.sj-ldg svg.sj-ldb', 0.5 / dd.length)) : true;
    const cB = await rd('#su section.sj-ldg .sj-ldreadc'), bB = await rd('#su section.sj-ldg .sj-ldreadb');
    check(!dd.length || (okTap && cA?.day === dN && Math.abs(cA.cost - cN) <= 1 && Math.abs(cA.val - vN) <= 1 && bA?.day === dN && Math.abs(bA.cost - cNb) <= 1 && cB?.day === d0 && Math.abs(cB.cost - c0) <= 1 && Math.abs(cB.val - v0) <= 1
      && bB?.day === d0 && Math.abs(bB.cost - c0) <= 1 && cA.fs >= 16.95 && /까지 · 쌓인 산 돈/.test(cB.t) && /그날 산 돈/.test(bB.t) && !/%/.test(cB.t + bB.t)),
      W + '마) 장부 그림을 누르면 그날 숫자(주문 1120-2041) — 처음은 마지막 날 · 꺾은선 맨 왼쪽 = 첫날까지 쌓인 돈 · 막대 첫째 = 첫날 산 돈(장부로 다시 셈) · 큰 글', JSON.stringify({d0, dN, c0, v0, cN, cNb, cA, bA, cB, bB}).slice(0, 500));
  }
  { // 바) 장부 맨 위 칸 「100원을 넣었다면」(주문 1123-2358 · 1124-0226 · 1124-0336 — 사장님 2026-11-24(서울) 03:35 「… 바보도 알수 있게 해」 · 03:36 「그래 더 쉽게 해」)
    //     머리 「늘고 줆」 바로 아래 · 이 검사가 정산 장부(buys · now · mk · tt · hz)로 따로 다시 셈 — 큰 세 줄(우리 장부는 지금 ○원이에요 · 모든 회사에 나눠 넣었으면 ○원이에요 · 우리가 ○원 더 많아요)
    //     · 오늘 산 것도 넣음 · 원 단위 · 차이 = 보이는 두 수의 차이 · 가장 나빴던 날(tt 가장 낮은 날) · 아직 일러요(산 날 스무 번 전) · 거르개 아래 한 줄 · 글 17px 넘게 · 쪽 밖으로 안 나감
    const lvW = d => (DL?.mk && typeof DL.mk[d] === 'number' && DL.mk[d] > 0 ? DL.mk[d] : null), R0 = v => Math.round(v);
    const RJ = (Array.isArray(DL?.buys) ? DL.buys : []).map((b, i) => [b, i]).filter(([b]) => Array.isArray(b) && KK.test(String(DL.kinds?.[b[1]] ?? '')) && typeof b[3] === 'number' && b[3] > 0).map(([[d, , c, buy], i]) => {
      const okN = Array.isArray(DL.now?.[c]) && typeof DL.now[c][0] === 'number', nw = okN ? DL.now[c][0] : buy, nd = okN ? DL.now[c][1] : d, l0 = lvW(d), l1 = lvW(nd);
      return {d, i, buy, cost: buy * q, val: nw * q, mv: l0 && l1 ? buy * q * l1 / l0 : null}; });
    const jc = RJ.reduce((s, r) => s + r.cost, 0), jv = RJ.reduce((s, r) => s + r.val, 0), allM = RJ.length > 0 && RJ.every(r => r.mv !== null);
    const MJ = RJ.filter(r => r.mv !== null), mc = MJ.reduce((s, r) => s + r.cost, 0), mval = MJ.reduce((s, r) => s + r.val, 0), mvs = MJ.reduce((s, r) => s + r.mv, 0);
    const wr = jc > 0 ? 100 * jv / jc : null, wrm = allM && jc > 0 ? 100 * mvs / jc : null, wd = wr !== null && wrm !== null ? R0(wr) - R0(wrm) : null, wdays = new Set(RJ.map(r => r.d)).size;
    let wdeep = null; (DL?.tt?.days ?? []).forEach((d, i) => { const w = DL.tt.w?.[i]; if (typeof w === 'number' && w > 0 && (!wdeep || w / 1e4 < wdeep.r)) wdeep = {d, r: w / 1e4}; });
    const wbig = wr === null ? [] : ['우리 장부는 지금 ' + R0(wr) + '원이에요.', wrm === null ? '모든 회사 값은 아직 못 받았어요.' : '모든 회사에 나눠 넣었으면 ' + R0(wrm) + '원이에요.',
      wd === null ? '' : wd > 0 ? '우리가 ' + wd + '원 더 많아요.' : wd < 0 ? '우리가 ' + -wd + '원 더 적어요.' : '둘이 거의 같아요.'].filter(Boolean);
    const wtail = mc > 0 ? '100원이면 우리 ' + R0(100 * mval / mc) + '원, 모든 회사 ' + R0(100 * mvs / mc) + '원이에요.' : '';
    await open(p, '#/l');
    const jg = await p.evaluate(() => { const j = document.querySelector('#su main.sj-page[data-page="ledger"] > section.sj-ph > .sj-judge'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), r = j?.getBoundingClientRect(), mk = document.querySelector('#su section.sj-ldf p.sj-ldmk');
      return j ? {after: j.previousElementSibling?.matches('p.sj-res') === true, head: t(j.querySelector('.sj-jk')), big: [...j.querySelectorAll('p.sj-jbig')].map(t), deep: j.getAttribute('data-deep'), days: +j.getAttribute('data-days'), early: j.getAttribute('data-early'), rule: j.getAttribute('data-rule'),
        items: [...j.querySelectorAll('ul.sj-jl > li > b')].map(t), text: t(j), small: [...j.querySelectorAll('p, li, b, .sj-jsl')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16.95).length,
        inside: !!r && r.left >= 0 && r.right <= innerWidth + 1, mk: mk?.getAttribute('data-mk') ?? null, mkT: t(mk)} : null; });
    const want = {big: wbig, deep: wdeep ? wdeep.d + ' ' + R0(wdeep.r) : '', days: wdays, early: wdays < 20 ? '1' : '0'};
    check(!!jg && jg.after && jg.rule === 'ledger-judge-v2' && jg.head === '100원을 넣었다면' && JSON.stringify(jg.big) === JSON.stringify(want.big) && jg.deep === want.deep && jg.days === want.days && jg.early === want.early
      && JSON.stringify(jg.items) === JSON.stringify(['사고 나서 며칠 뒤?', '가장 나빴던 날', '아직 일러요']) && (wdays < 20 ? /지켜봐야 해요/.test(jg.text) : /일치가 모였어요/.test(jg.text))
      && jg.small === 0 && jg.inside && !/%|매수|매도|수익률|추천|예측|확률|기회|·/.test(jg.text) && jg.mk === wtail && jg.mkT === wtail,
      W + '바) 장부 맨 위 칸 「100원을 넣었다면」(주문 1123-2358 · 1124-0336 쉬운 말) — 우리 장부 · 모든 회사 · 차이 = 정산 장부(mk · tt)로 다시 셈 · 가장 나빴던 날 · 아직 일러요 · 거르개 아래 한 줄 · 「·」 0 · 큰 글',
      JSON.stringify({want, wtail, got: jg && {...jg, text: jg.text.slice(0, 200)}}).slice(0, 800));
    // 사) 사고 나서 며칠 뒤?(주문 1124-0226 · 장부 잣대 2번 · 1124-0336 쉬운 말) — 하루 뒤 · 닷새 뒤 · 스무 날 뒤 = 정산 장부(hz · mk)로 다시 셈 · 아직이면 「아직 몰라요」
    const HZ = [[1, '하루 뒤'], [5, '닷새 뒤'], [20, '스무 날 뒤']];
    const sameW = HZ.map(([k, lab], j) => { let cost = 0, val = 0, mcs = 0, mv = 0, n = 0, nm = 0;
      for (const r of RJ) { const t = DL?.hz?.days?.[r.d]?.[j], pz = DL?.hz?.p?.[r.i]?.[j]; if (typeof t !== 'string' || typeof pz !== 'number' || !(pz > 0)) continue;
        n++; cost += r.cost; val += pz * q; const l0 = lvW(r.d), l1 = lvW(t); if (l0 && l1) { nm++; mcs += r.cost; mv += r.cost * l1 / l0; } }
      const rr = n ? R0(100 * val / cost) : null, rmm = n && nm === n ? R0(100 * mv / mcs) : null;
      return {s: k + ':' + (rr ?? '') + ':' + (rmm ?? ''), line: n ? lab + '에는 우리 ' + rr + '원' + (rmm === null ? '이에요.' : ', 모든 회사 ' + rmm + '원이에요.') : lab + '는 아직 몰라요.'}; });
    const sg = await p.evaluate(() => { const li = document.querySelector('#su main.sj-page[data-page="ledger"] .sj-judge li.sj-jsame'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
      return li ? {same: li.getAttribute('data-same'), lines: [...li.querySelectorAll('.sj-jsl')].map(t)} : null; });
    check(!!sg && sg.same === sameW.map(x => x.s).join('|') && JSON.stringify(sg.lines) === JSON.stringify(sameW.map(x => x.line)),
      W + '사) 사고 나서 며칠 뒤?(주문 1124-0226 · 1124-0336) — 하루 뒤 · 닷새 뒤 · 스무 날 뒤 = 정산 장부(hz · mk)로 다시 셈 · 아직이면 「아직 몰라요」', JSON.stringify({want: sameW, got: sg}).slice(0, 600));
  }
  pageRules(await measure(p), W + '장부 #/l');
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
{ // ㉝ 주문 1120-2116(사장님 2026-11-20(마카오) 21:16 「… 주식을 할 때 가져야 할 자세 11가지 정리한 거 있어 그걸 첫 페이지에 멋지게 나열해봐」 · 21:45 「응 그래」(꾀 칸 바로 아래)
  //   · 23:14 「이게 아니야 돌이를 만들때 주식을 하는 명언이 있던 걸로 기억해 … 기록을 찾아봐 그리고 글을 그 수채화 위에 글을 찾아서 올려」)
  //   · 23:21 「그리고 그 글을 그림에 올려 글을 쓰고 맨 위에 두어라」 · 23:25 「맞아」(물음 「… 첫 화면 맨 위, 「오늘 시장」 칸보다 위에 둘게요. 이 뜻인가요?」)
  //   첫 쪽(390 · 320 · 320 큰 글씨) — 맨 위(표지 앞)에 「손자병법 주식 격언 열 가지」 — 산수 수채화(su-bg.svg)를 깐 족자 위
  //   제목 · 열 줄 = 돌이 첫 화면 편지 site/next/app.js HELLO_MSG(사장님 2026-10-16 글 — 이 검사가 그 파일에서 따로 읽음) 글자 그대로 · 남의 글 표시(data-proper)
  //   줄마다 번호 · 격언(굵게 · 풀이보다 큼) · 풀이 · 글 17px 넘게 · 쪽 안 · 고리 0 · 「권하는 말이 아니라」 한 줄
  const APP33 = await fs.readFile(new URL('../../../site/next/app.js', import.meta.url), 'utf8');
  const HELLO33 = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(APP33)?.[1] ?? '[]').replace(/'/g, '"'));
  check(HELLO33.length === 11 && HELLO33.slice(1).every((t, i) => t.startsWith((i + 1) + '. ')), '㉝ 사장님 주식 격언 열 가지(site/next/app.js HELLO_MSG)를 읽음', JSON.stringify(HELLO33).slice(0, 200));
  for (const [width, big] of [[390, false], [320, false], [320, true]]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
    await QUIET(ctx);
    await ctx.addInitScript(b => { try { localStorage.setItem('su-big-text', b ? '1' : '0'); } catch { /* 저장소 없음 */ } }, big);
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    const W = '㉝ [' + width + (big ? ' · 큰 글씨' : '') + '] ';
    await open(p, '#/');
    await p.waitForFunction(() => !document.querySelector('#su main.sj-page > section.sj-s36.sj-wait'), null, {timeout: 15000}).catch(() => {});
    // 격언 열 가지 접기(주문 1127-2148 · 사장님 2026-11-27(서울) 21:48 「어그래」 — 「첫 화면 격언 열 가지를 맨 위 그대로 두고, 눌러 펼치게 줄여 볼까요?」의 답) — 처음엔 첫째만 · 「나머지 격언 9가지 더 보기」 · 누르면 열 가지 · 「다시 접기」
    await p.waitForSelector('#su section.sj-mind > .sj-gk > button.sj-f7b', {timeout: 15000}).catch(() => {}); // 접기 단추는 자바스크립트가 붙임 — 막 올린 뒤처럼 느릴 때 기다림(2026-11-28 03:12 진짜 사이트 검사에서 단추 전에 잼)
    const f0 = await p.evaluate(() => { const s = document.querySelector('#su main.sj-page[data-page="sonja"] > section.sj-mind'), ol = s?.querySelector(':scope > .sj-gk > ol.sj-gkl'), b = s?.querySelector(':scope > .sj-gk > button.sj-f7b'), r = b?.getBoundingClientRect();
      return {fold: ol?.getAttribute('data-fold') ?? null, n: ol?.children.length ?? 0, vis: ol ? [...ol.children].filter(li => li.getBoundingClientRect().height > 0).map(li => li.getAttribute('data-n')) : [], after: !!b && ol?.nextElementSibling === b,
        t: (b?.textContent ?? '').trim(), ex: b?.getAttribute('aria-expanded') ?? null, h: r ? Math.round(r.height) : 0, fs: b ? parseFloat(getComputedStyle(b).fontSize) : 0, top: s?.previousElementSibling?.matches?.('section.sj-todo') ?? false}; });
    if (f0.after) { await p.click('#su section.sj-mind button.sj-f7b'); await p.waitForTimeout(200); }
    const f1 = await p.evaluate(() => { const b = document.querySelector('#su section.sj-mind button.sj-f7b'), ol = document.querySelector('#su section.sj-mind ol.sj-gkl'); return {t: (b?.textContent ?? '').trim(), ex: b?.getAttribute('aria-expanded') ?? null, vis: ol ? [...ol.children].filter(li => li.getBoundingClientRect().height > 0).length : 0}; });
    check(f0.fold === '1' && f0.n === 10 && JSON.stringify(f0.vis) === '["1"]' && f0.after && f0.t === '나머지 격언 9가지 더 보기' && f0.ex === 'false' && f0.h >= 48 && f0.fs >= 16.95 && f0.top && f1.t === '다시 접기' && f1.ex === 'true' && f1.vis === 10,
      W + '격언 열 가지 접기(주문 1127-2148 · 21:48 「어그래」) — 자리는 그대로(오늘의 투자 점검 다음 · 표지 앞) · 처음엔 첫째만 보임 · 「나머지 격언 9가지 더 보기」 · 누르면 열 가지 모두 · 「다시 접기」 · 48 · 17', JSON.stringify({f0, f1}));
    const g = await p.evaluate(() => {
      const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), main = document.querySelector('#su main.sj-page[data-page="sonja"]'), s = main?.querySelector(':scope > section.sj-mind');
      if (!s) return null;
      s.scrollIntoView({block: 'start'});
      const gk = s.querySelector(':scope > .sj-gk'), L = (gk ?? s).getBoundingClientRect();
      const rows = [...s.querySelectorAll(':scope > .sj-gk > ol.sj-gkl > li.sj-gki')].map(li => { const sm = li.querySelector(':scope > details.sj-gkd > summary.sj-gks'), pp = sm?.querySelector(':scope > p.sj-gkt'), b = pp?.querySelector(':scope > b.sj-gkm'), x = pp?.querySelector(':scope > .sj-gkx'), r = li.getBoundingClientRect();
        return [+li.getAttribute('data-n'), t(sm?.querySelector(':scope > .sj-gkn')), t(b) + ' ' + t(x), pp?.hasAttribute('data-proper') === true, b ? parseFloat(getComputedStyle(b).fontSize) : 0, x ? parseFloat(getComputedStyle(x).fontSize) : 0, Math.round(r.left), Math.round(r.right), Math.round(r.height),
          li.querySelector(':scope > details.sj-gkd')?.open === false && (sm?.getBoundingClientRect().height ?? 0) >= 47.5]; }); // 처음엔 닫힘 · 누르는 줄 48 넘게(주문 1120-2116 · 00:19 「그래 그렇게도 하고」)
      const prev = s.previousElementSibling, next = s.nextElementSibling;
      return {rows, W: innerWidth, l: Math.round(L.left), r: Math.round(L.right), bg: gk ? getComputedStyle(gk.querySelector(':scope > h2') ?? gk, '::before').backgroundImage : '', title: t(gk?.querySelector(':scope > h2')),
        prev: prev ? prev.tagName.toLowerCase() + '.' + [...prev.classList].join('.') : '', next: next ? next.tagName.toLowerCase() + '.' + [...next.classList].join('.') : '',
        go: s.querySelectorAll('a[href]').length, note: t(s.querySelector(':scope > .sj-mnote')), rule: s.getAttribute('data-rule'), n: s.getAttribute('data-n')};
    });
    const want = HELLO33.slice(1).map(x => /^(\d+)\. (.+)$/.exec(x));
    const rowsOk = !!g && g.rows.length === 10 && g.rows.every((r, i) => r[0] === i + 1 && r[1] === String(i + 1) && r[2] === want[i]?.[2] && r[3] && r[5] >= 16.95 && r[4] > r[5] && r[6] >= 0 && r[7] <= g.W && r[8] > 0 && r[9]);
    // 격언을 누르면 맞는 손자병법 말씀(주문 1120-2116 · 00:19 「그래 그렇게도 하고」) — 첫째 · 열째를 눌러 열림 · 말씀 「…」 · 「손자병법 ○○편」 · 한자 0 · 글 17px 넘게 · 다시 누르면 닫힘
    const tap33 = [];
    for (const n of [1, 10]) {
      const sel = '#su section.sj-mind li.sj-gki[data-n="' + n + '"] > details.sj-gkd > summary.sj-gks';
      if (!(await p.$(sel))) { tap33.push(null); continue; }
      if (!(await p.click(sel, {timeout: 8000}).then(() => true).catch(() => false))) { tap33.push({open: false, why: 'click'}); continue; } await p.waitForTimeout(150); // 못 누르면 이 검사만 실패(검사 전체가 멈추지 않게)
      const o = await p.evaluate(sel => { const d = document.querySelector(sel)?.parentElement, q = d?.querySelector(':scope > blockquote.sj-gkq'), qp = q?.querySelector('p'), c = q?.querySelector('cite'), r = q?.getBoundingClientRect();
        return {open: !!d?.open, q: (qp?.textContent ?? '').trim(), c: (c?.textContent ?? '').trim(), fs: qp ? parseFloat(getComputedStyle(qp).fontSize) : 0, cfs: c ? parseFloat(getComputedStyle(c).fontSize) : 0, h: r ? Math.round(r.height) : 0, right: r ? Math.round(r.right) : 0}; }, sel);
      await p.click(sel); await p.waitForTimeout(100);
      o.shut = await p.evaluate(sel => document.querySelector(sel)?.parentElement?.open === false, sel);
      tap33.push(o);
    }
    const tapOk = tap33.every(o => !!o && o.open && o.shut && /^「[^「」]{6,}」$/.test(o.q) && /^손자병법 \S+편$/.test(o.c) && !/[\u4E00-\u9FFF]/.test(o.q + o.c) && o.fs >= 16.95 && o.cfs >= 16.95 && o.h > 0 && o.right <= (g?.W ?? 0));
    check(tapOk, W + '격언을 누르면 맞는 손자병법 말씀(주문 1120-2116 · 00:19 「그래 그렇게도 하고」) — 첫째 · 열째 눌러 열림 · 「말씀」 · 손자병법 ○○편 · 한자 0 · 큰 글 · 다시 누르면 닫힘', JSON.stringify(tap33).slice(0, 400));
    check(rowsOk && g.n === '10' && g.rule === 'gyeok10-v1' && g.title === HELLO33[0] && /su-bg\.svg/.test(g.bg) && g.prev === 'section.sj-sec.sj-todo' && /^section\.sj-cover\b/.test(g.next)
      && g.go === 0 && /권하는 말이 아니라/.test(g.note) && g.l >= 0 && g.r <= g.W,
      W + '첫 쪽 「손자병법 주식 격언 열 가지」(주문 1120-2116) — 오늘의 투자 점검 바로 아래(주문 1126-1544 — 인사 → 오늘의 꾀 → 오늘의 기업 → 오늘의 투자 점검 다음) · 표지(오늘 시장)보다 위 · 산수 수채화 족자 위 · 제목 · 열 줄 = 돌이 편지(사장님 글) 그대로 · 남의 글 표시 · 격언 큰 글 · 고리 0',
      JSON.stringify(g ? {...g, rows: g.rows.filter((r, i) => r[0] !== i + 1 || r[2] !== want[i]?.[2] || !r[3] || r[5] < 16.95 || r[4] <= r[5] || r[7] > g.W).slice(0, 3)} : null).slice(0, 500));
    check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
    await ctx.close();
  }
}
{ // ㉞ 주문 1124-0432(사장님 2026-11-24(서울) 04:32 「어 그래」 — 「이 분석 창을 사이트 장부 옆에 넣어 볼까요?」의 답 · 04:39 「1시간내에 작업 마무리해」 · 분석 주문 1124-0354)
  //   아래 탭 맨 끝 「분석」(#/l/d) · 분석 쪽 = 머스크 판(주문 1124-1625) — 이 검사가 su21-fall.json 으로 따로 다시 셈: 한 줄 답 · 점 그림 · 고르기 · 꾀 목록 무리
  //   자료 스스로 맞음(꾀마다 무리 = 오른 날 · 견줌 몫 잣대 · 단계 수 = 줄 수 · 아무렇게나 몫 합 10) · 「%」 0 · 붉은 글 0 · 쪽 규칙(글 17px · 48 · 고리 · 안전 문장 · 쓰지 않을 말)
  const W = '㉞ ', FD = await J('/su/data/su21-fall.json').catch(() => null);
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  const rows = Array.isArray(FD?.rows) ? FD.rows : [], st = FD?.steps ?? {}, rd = FD?.rand ?? {}, CO = ['long', 'like', 'short', 'few', 'none'];
  const clsW = r => (!r.rose ? 'none' : r.rose < FD.minRose ? 'few' : r.beat >= 0.95 ? 'long' : r.beat <= 0.05 ? 'short' : 'like');
  const sureW = r => (r.cls === 'long' && r.beatEp >= 0.95) || (r.cls === 'short' && r.beatEp <= 0.05);
  const nW = c => rows.filter(r => r.cls === c).length, cntW = nW('long') + nW('like') + nW('short');
  const sortOk = rows.every((r, i) => !i || CO.indexOf(rows[i - 1].cls) < CO.indexOf(r.cls) || (CO.indexOf(rows[i - 1].cls) === CO.indexOf(r.cls) && (rows[i - 1].mean ?? 0) >= (r.mean ?? 0)));
  const selfOk = FD?.rule === 'fall36-v1' && rows.length === 36 && new Set(rows.map(r => r.k)).size === 36 && rows.every(r => r.cls === clsW(r) && r.sure === sureW(r) && r.b.reduce((a, b) => a + b, 0) === r.rose)
    && st.kinds === 36 && st.none === nW('none') && st.few === nW('few') && st.counted === cntW && st.long === nW('long') && st.like === nW('like') && st.short === nW('short') && st.afterNone === 36 - st.none
    && st.sureLong === rows.filter(r => r.cls === 'long' && r.sure).length && st.sureShort === rows.filter(r => r.cls === 'short' && r.sure).length && Array.isArray(rd.share) && Math.abs(rd.share.reduce((a, b) => a + b, 0) - 10) < 0.3 && sortOk;
  check(selfOk, W + '가) 오름 날수 자료(su21-fall.json) 스스로 맞음 — 무리 = 오른 날 · 견줌 몫(0.95 · 0.05) · 덩어리 첫날 · 단계 수 = 줄 수 · 막대 합 = 오른 날 · 차례(무리 → 평균 긴 것)', JSON.stringify({rule: FD?.rule, n: rows.length, st, sortOk}).slice(0, 400));
  const d1 = v => String(Math.round(v * 10) / 10), kN = k => +k.slice(1), GO = ['long', 'like', 'short'];
  // 머스크 판(주문 1124-1625 · 16:25 「분석이 직관적이지 않고 그래 … 머스크라면 어떻게 만들 것인지 해서 만들어」) — 이 검사가 su21-fall.json 으로 따로 다시 셈
  //   한 줄 답(가운데 날 · 뚜렷한 것만 셈) · 점 그림(이틀째 · 닷새째 · 열흘째 · 스무 날째 — 열 번에 몇 번 · 점 열 개 · 이 꾀 대 아무렇게나) · 고르기 · 꾀 목록 무리(한 줄 답과 같은 수) · 누르면 그림이 바뀜
  const dcW = r => (r.cls === 'long' || r.cls === 'short' ? (r.sure ? r.cls : 'like') : r.cls);
  const cntR = rows.filter(r => GO.includes(r.cls)).sort((a, b) => kN(a.k) - kN(b.k));
  const svW = (b, n) => [1, 2, 3, 4].map(k => (n ? Math.round(10 * b.slice(k).reduce((x, y) => x + y, 0) / n) : 0));
  const rsvW = [1, 2, 3, 4].map(k => Math.round((rd.share ?? []).slice(k).reduce((x, y) => x + y, 0)));
  const allBW = cntR.reduce((a, r) => a.map((x, i) => x + r.b[i]), [0, 0, 0, 0, 0]), allNW = cntR.reduce((a, r) => a + r.rose, 0), nLikeW = st.counted - st.sureLong - st.sureShort;
  const heroW = '오른 뒤 절반은 ' + d1(rd.median) + '일 안에 끝나요.';
  const ansW = ['꾀 ' + st.counted + '가지 가운데 ' + nLikeW + '가지는 이 잣대와 뚜렷한 차이가 없었어요.', st.sureLong ? '뚜렷하게 더 오래 버틴 꾀는 ' + st.sureLong + '가지예요.' : '뚜렷하게 더 오래 버틴 꾀는 없었어요.',
    st.sureShort ? '뚜렷하게 빨리 끝난 꾀는 ' + st.sureShort + '가지예요.' : '뚜렷하게 빨리 끝난 꾀는 없었어요.'];
  const GV = {long: '아무렇게나 고른 것보다 뚜렷하게 오래 버텼어요.', like: '아무렇게나 고른 것과 뚜렷한 차이가 없었어요.', short: '아무렇게나 고른 것보다 뚜렷하게 빨리 끝났어요.'}, GH = {long: '더 오래 버틴 꾀', like: '차이가 없던 꾀', short: '빨리 끝난 꾀', few: '아직 가를 수 없는 꾀', none: '셀 수 없는 꾀'};
  const DAYW = ['이틀째', '닷새째', '열흘째', '스무 날째'], daysW = sv => DAYW.map((w, i) => [w + ', 열 번에 몇 번이 산 값 위?', sv[i], 10, sv[i] + '번', rsvW[i], rsvW[i] + '번']);
  const grpW = CO.filter(c => rows.some(r => dcW(r) === c)).map(c => { const rr = rows.filter(r => dcW(r) === c).sort((a, b) => kN(a.k) - kN(b.k));
    return [c, rr.length, GH[c] + ' ' + rr.length + '가지', rr.map(r => [r.k, GO.includes(c), GO.includes(c) ? '보통 ' + d1(r.median) + '일' : c === 'few' ? '오른 날 ' + r.rose + '번' : '자료 없음'])]; });
  await open(p, '#/l');
  const tbL = await p.evaluate(() => { const a = [...document.querySelectorAll('#su .sj-tabs a.sj-tab')], b = a.find(x => x.textContent.trim() === '기록'), r = b?.getBoundingClientRect();
    return {n: a.length, cur: a.find(x => x.getAttribute('aria-current') === 'page')?.textContent.trim() ?? '', href: b?.getAttribute('href') ?? '', last: a.at(-1) === b, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, sw: document.querySelectorAll('#su nav.sj-ldsw').length}; });
  check(tbL.n === 5 && tbL.cur === '기록' && tbL.href === '#/l/a' && tbL.last && tbL.w >= 47.5 && tbL.h >= 47.5 && tbL.sw === 0, W + '나) 아래 탭 맨 끝 「기록」(주문 1124-1942 치지 짜임 — 분석은 기록 탭 안 갈래 · 옛 주문 1124-0432 · 주문 1126-0229 기록 탭은 한눈에부터) — #/l/a · 48 넘게 · 장부 쪽은 「기록」 켜짐 · 옛 단추 둘 0', JSON.stringify(tbL));
  await open(p, '#/l/d');
  await p.waitForSelector('#su main.sj-page[data-page="fall"]', {timeout: 15000}).catch(() => {});
  const g = await p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="fall"]'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {main: !!m, h1: t(document.querySelector('#su h1')), tab: t(document.querySelector('#su .sj-tabs a[aria-current="page"]')), sw: m ? m.querySelectorAll('nav.sj-ldsw a').length : -1,
      hero: t(m?.querySelector('.sj-fans .sj-fhero')), ans: [...(m?.querySelectorAll('.sj-fans p.sj-jbig') ?? [])].map(t),
      opts: [...(m?.querySelectorAll('select.sj-fsel option') ?? [])].map(o => [o.value, o.textContent.trim()]),
      grp: [...(m?.querySelectorAll('.sj-fgrp') ?? [])].map(d => [d.dataset.cls, +d.dataset.n, t(d.querySelector('h3')), [...d.querySelectorAll('.sj-frow')].map(b => [b.dataset.k, b.tagName === 'BUTTON', t(b.querySelector('.sj-fw'))])]),
      old: m ? m.querySelectorAll('ol.sj-fsl, ol.sj-fml, li.sj-fk, svg.sj-fbar, svg.sj-fstrip').length : -1,
      red: m ? [...m.querySelectorAll('*')].filter(e => { const c = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return c && +c[1] > 170 && +c[2] < 90 && +c[3] < 90; }).length : -1, text: m?.innerText ?? ''}; });
  const pic = () => p.evaluate(() => { const m = document.querySelector('#su main.sj-page[data-page="fall"]'), t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), q = m?.querySelector('.sj-fpick');
    return {k: q?.dataset.k ?? '', sv: q?.dataset.sv ?? '', rsv: q?.dataset.rsv ?? '', sel: m?.querySelector('select.sj-fsel')?.value ?? '', verd: t(m?.querySelector('.sj-fverd')),
      days: [...(m?.querySelectorAll('ol.sj-fdl > li.sj-fd') ?? [])].map(li => [t(li.querySelector('.sj-fdw')), li.querySelectorAll('.sj-fdots.me i.on').length, li.querySelectorAll('.sj-fdots.me i').length, t(li.querySelector('.sj-fme b')), li.querySelectorAll('.sj-fdots.rnd i.on').length, t(li.querySelector('.sj-frnd .sj-fdc'))])}; });
  const picOk = (P, k, sv, verd) => P.k === k && P.sel === k && P.sv === sv.join(' ') && P.rsv === rsvW.join(' ') && JSON.stringify(P.days) === JSON.stringify(daysW(sv)) && P.verd === verd;
  check(g.main && g.h1 === '오른 꾀, 며칠 버틸까' && g.tab === '기록' && g.sw === 0 && g.old === 0, W + '다) 분석 쪽(#/l/d) — 물음 제목 · 탭 「기록」 켜짐(기록 탭 안 분석 갈래) · 옛 칸(빼 보기 · 띠 · 막대) 0', JSON.stringify({h1: g.h1, tab: g.tab, sw: g.sw, old: g.old}));
  const P0 = await pic(), likeG = g.grp.find(x => x[0] === 'like');
  check(g.hero === heroW && JSON.stringify(g.ans) === JSON.stringify(ansW) && (likeG?.[1] ?? 0) === nLikeW && picOk(P0, 'all', svW(allBW, allNW), '꾀를 하나 고르면, 그 꾀가 아무렇게나 고른 것과 어땠는지 나와요.'),
    W + '라) 한 줄 답(가운데 날 · 뚜렷한 것만) = 자료로 다시 셈 · 목록 「차이가 없던 꾀」 수 = 한 줄 답 · 첫 그림(꾀 모두) 점 = 열 번에 ○번', JSON.stringify({want: {heroW, ansW, nLikeW, sv: svW(allBW, allNW), rsvW}, got: {hero: g.hero, ans: g.ans, like: likeG?.[1], P0}}).slice(0, 900));
  const T1 = cntR.find(r => dcW(r) === 'short') ?? cntR.find(r => dcW(r) === 'long') ?? cntR[0], T2 = cntR.find(r => dcW(r) === 'like' && r.k !== T1?.k) ?? cntR.find(r => r.k !== T1?.k);
  let P1 = null, P2 = null;
  if (T1) { await p.selectOption('#su select.sj-fsel', T1.k).catch(() => {}); await p.waitForTimeout(200); P1 = await pic(); }
  if (T2) { await p.click('#su button.sj-frow[data-k="' + T2.k + '"]', {timeout: 5000}).catch(() => {}); await p.waitForTimeout(500); P2 = await pic(); }
  check(JSON.stringify(g.opts.map(o => o[0])) === JSON.stringify(['all', ...cntR.map(r => r.k)]) && g.opts.slice(1).every((o, i) => o[1].startsWith('제' + kN(cntR[i].k) + '계 ')) && JSON.stringify(g.grp) === JSON.stringify(grpW)
    && !!T1 && !!T2 && picOk(P1, T1.k, svW(T1.b, T1.rose), GV[dcW(T1)]) && picOk(P2, T2.k, svW(T2.b, T2.rose), GV[dcW(T2)]),
    W + '마) 고르기(꾀 모두 + 셀 수 있는 꾀 제○계 차례) · 꾀 목록 무리 = 자료 그대로 · 고르면 그림이 그 꾀로 · 목록을 누르면 고르기와 그림이 그 꾀로', JSON.stringify({opts: [g.opts.length, cntR.length + 1], grp: g.grp.map(x => [x[0], x[1]]), want: grpW.map(x => [x[0], x[1]]), T1: T1?.k, P1, T2: T2?.k, P2}).slice(0, 900));
  check(g.red === 0 && !/%/.test(g.text) && /앞날을 맞히지 않고, 사고팔기를 권하지 않아요/.test(g.text), W + '바) 붉은 글 0 · 「%」 0 · 앞날 아님 한 줄', JSON.stringify({red: g.red}));
  pageRules(await measure(p), W + '오름 날수 #/l/d');
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
{ // ㉟ 주문 1124-1942(사장님 2026-11-24(서울) 19:42 「여기 ui ux를 1000가지 분석해 그래서 손자 병법에 을 이렇게 고쳐 2시간 이내에 에이전트 100개 가동해서」 — 치지 앱 첫 화면처럼)
  //   열림 쪽(새로 켤 때 한 번 · 먹 바탕 · 가운데 앱 얼굴 · 굵은 한지색 이름 · 누르기를 막지 않음 · 몇 초 안에 걷힘 · 같은 창 다음 쪽은 없음) · 맨 위 이름 옆 앱 얼굴 · 홈 화면 앱(설명 파일 · 얼굴 그림 다섯)
  //   자동 검사 브라우저는 열림 쪽을 안 보임(다른 검사를 가리지 않게) — ?sjopen=1(늘) · ?sjopen=2(사람처럼 창마다 한 번)로 여기서만 잼
  const W = '㉟ ';
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  await p.goto(base + '/su/?sjopen=2#/', {waitUntil: 'domcontentloaded'}).catch(() => {});
  await p.waitForFunction(() => document.documentElement.classList.contains('sj-opening') && document.getAnimations().some(a => /sjOpenIn/.test(a.animationName) && (a.currentTime ?? 0) > 250), null, {timeout: 10000}).catch(() => {});
  const o1 = await p.evaluate(() => { const d = document.documentElement, A = getComputedStyle(d, '::after'), B = getComputedStyle(d, '::before');
    return {on: d.classList.contains('sj-opening'), name: A.content, icon: /su-icon\.svg/.test(A.backgroundImage), fs: parseFloat(A.fontSize), color: A.color, pe: [A.pointerEvents, B.pointerEvents], z: [+A.zIndex, +B.zIndex], bg: B.backgroundColor}; });
  const hitOk = await p.evaluate(() => { const b = document.querySelector('#su .sj-brand'); if (!b) return false; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && b.contains(e); });
  await p.waitForFunction(() => !document.documentElement.classList.contains('sj-opening'), null, {timeout: 8000}).catch(() => {});
  const o2 = await p.evaluate(() => ({on: document.documentElement.classList.contains('sj-opening')}));
  check(o1.on && o1.name === '"손자병법"' && o1.icon && o1.fs >= 40 && o1.color === 'rgb(252, 254, 253)' && o1.pe.every(x => x === 'none') && o1.z.every(z => z > 1e9) && o1.bg === 'rgb(32, 50, 58)' && hitOk && !o2.on,
    W + '가) 열림 쪽(치지 첫 화면처럼) — 먹 바탕 · 가운데 앱 얼굴 · 굵은 한지색 이름 40px 넘게 · 누르기를 막지 않음 · 몇 초 안에 걷힘', JSON.stringify({o1, hitOk, o2}));
  await p.goto(base + '/su/?sjopen=2#/k', {waitUntil: 'domcontentloaded'}).catch(() => {}); await p.waitForTimeout(400);
  const o3 = await p.evaluate(() => document.documentElement.classList.contains('sj-opening'));
  await open(p, '#/');
  const br = await p.evaluate(() => { const a = document.querySelector('#su .sj-top .sj-brand'), i = a?.querySelector('img.sj-brand-ic'), r = i?.getBoundingClientRect(), ra = a?.getBoundingClientRect();
    return {txt: (a?.textContent ?? '').trim(), alt: i?.getAttribute('alt'), src: i?.getAttribute('src') ?? '', w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, done: !!i?.complete && (i?.naturalWidth ?? 0) > 0, ah: ra ? Math.round(ra.height) : 0, wide: document.documentElement.scrollWidth <= innerWidth + 1, open: document.documentElement.classList.contains('sj-opening')}; });
  check(!o3 && !br.open && br.txt === '손자병법' && br.alt === '' && br.src === '/su/su-icon.svg' && br.w >= 27 && br.h >= 27 && br.done && br.ah >= 47.5 && br.wide, W + '나) 맨 위 이름 옆 앱 얼굴(그림만 · 이름 글 그대로 · 누르는 자리 48) · 같은 창 다음 쪽은 열림 쪽 없음 · 자동 검사 브라우저는 열림 쪽 없음', JSON.stringify({o3, br}));
  const man = await J('/su/su.webmanifest').catch(() => null), links = await p.evaluate(() => ({m: document.querySelector('link[rel="manifest"]')?.getAttribute('href') ?? '', t: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ?? '', i: document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? ''}));
  const pics = await Promise.all(['/su/su-icon.svg', '/su/su-icon-180.png', '/su/su-icon-192.png', '/su/su-icon-512.png', '/su/su-icon-512m.png'].map(u => fetch(base + u).then(r => r.ok && /^image\//.test(r.headers.get('content-type') ?? '')).catch(() => false)));
  check(!!man && man.name === '손자병법' && man.short_name === '손자병법' && man.start_url === '/su/' && man.display === 'standalone' && man.background_color === '#20323A' && (man.icons ?? []).length >= 4 && links.m === '/su/su.webmanifest' && links.t === '/su/su-icon-180.png' && links.i === '/su/su-icon.svg' && pics.every(Boolean),
    W + '다) 홈 화면 앱 — 설명 파일(이름 · 주소창 없이 · 먹 바탕) · 앱 얼굴 그림 다섯(둥근 네모 · 휴대폰 · 설명 파일)', JSON.stringify({man: man ? {name: man.name, start: man.start_url, display: man.display, bg: man.background_color, n: (man.icons ?? []).length} : null, links, pics}));
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
{ // ㊱ 주문 1124-1942(사장님 2026-11-24(서울) 20:01 「너 잘못하고 있어 이앱에 구조를 1000가지로 파악 하라고 한거야」 — 치지 앱 짜임 1000가지(에이전트 100명 × 10가지)를 손자병법 짜임에)
  //   아래 탭 여덟(일곱 보임 · 좁은 폰은 옆으로 밂) → 다섯(오늘 · 꾀 · 회사 · 멈춤 · 기록) · 장부 · 정산 · 분석 · 일지는 「기록」 탭 하나 · 기록 쪽 맨 위 갈래 줄 넷(켜진 갈래 하나 · 칸마다 48 · 글씨 17 넘게) · 320 폭에서도 옆으로 밀 일 없음
  const W = '㊱ ', REC = '한눈에 장부 정산 분석 일지 산 회사 판 회사', RECN = ['한눈에', '장부', '정산', '분석', '일지', '산 회사', '판 회사'], RECH = ['#/l/a', '#/l', '#/r/t', '#/l/d', '#/j', '#/l/b', '#/l/s']; // 갈래 일곱(주문 1125-1144 산 회사 · 판 회사 · 1125-2101 한눈에 맨 앞)
  const ctx = await browser.newContext({viewport: {width: 320, height: 640}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await QUIET(ctx);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
  const look = () => p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), tb = [...document.querySelectorAll('#su .sj-tabs a.sj-tab')], nav = document.querySelector('#su nav.sj-rec'), rb = [...(nav?.querySelectorAll('a.sj-recb') ?? [])];
    const box = e => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.left), Math.round(r.right)]; };
    return {tabs: tb.map(a => t(a.querySelector('span'))).join(' '), tabOn: t(document.querySelector('#su .sj-tabs a.sj-tab[aria-current="page"] span')), tabBox: tb.map(box), hid: tb.filter(a => getComputedStyle(a).display === 'none').length,
      navN: document.querySelectorAll('#su nav.sj-rec').length, recs: rb.map(a => t(a)).join(' '), hrefs: rb.map(a => a.getAttribute('href')), on: rb.filter(a => a.getAttribute('aria-current') === 'page').map(a => t(a)), recBox: rb.map(box), fs: rb.map(a => parseFloat(getComputedStyle(a).fontSize)),
      onVis: (() => { const a = nav?.querySelector('a.sj-recon'); if (!a) return false; const r = a.getBoundingClientRect(), q = nav.getBoundingClientRect(); return r.left >= q.left - 1 && r.right <= q.right + 1; })(), // 글자 탭 한 줄 — 켜진 탭이 보임(주문 1126-0229)
      under: !!nav && !!document.querySelector('#su .sj-top') && nav.getBoundingClientRect().top >= document.querySelector('#su .sj-top').getBoundingClientRect().bottom - 1 && (nav.nextElementSibling?.tagName ?? '') === 'MAIN',
      wide: document.documentElement.scrollWidth <= innerWidth + 1, tabsW: (() => { const n = document.querySelector('#su .sj-tabs'); return n ? n.scrollWidth <= n.clientWidth + 1 : false; })()}; });
  for (const [k, hash, page] of [[0, '#/l/a', 'glance'], [1, '#/l', 'ledger'], [2, '#/r/t', 'settle'], [3, '#/l/d', 'fall'], [4, '#/j', 'journal'], [5, '#/l/b', 'held'], [6, '#/l/s', 'sold']]) {
    await open(p, hash);
    await p.waitForSelector('#su nav.sj-rec', {timeout: 15000}).catch(() => {});
    const g = await look(), nm = RECN[k];
    check(g.tabs === '오늘 꾀 회사 멈춤 기록' && g.tabOn === '기록' && g.hid === 0 && g.tabBox.every(b => b[0] >= 47.5 && b[1] >= 47.5) && g.tabsW && g.wide,
      W + '가) ' + nm + ' 쪽(' + hash + ') — 아래 탭 다섯 오늘 · 꾀 · 회사 · 멈춤 · 기록 · 「기록」 켜짐 · 숨긴 탭 0 · 칸마다 48 · 320 폭에서 옆으로 밀 일 없음', JSON.stringify({tabs: g.tabs, on: g.tabOn, hid: g.hid, box: g.tabBox, tabsW: g.tabsW, wide: g.wide}));
    check(g.navN === 1 && g.recs === REC && JSON.stringify(g.hrefs) === JSON.stringify(RECH) && g.on.length === 1 && g.on[0] === nm && g.recBox.every(b => b[1] >= 47.5 && b[0] >= 47.5) && g.fs.every(f => f >= 16.9) && g.under && g.onVis,
      W + '나) ' + nm + ' 쪽 맨 위 기록 갈래 줄 여섯(장부 · 정산 · 분석 · 일지 · 산 회사 · 판 회사 — 세 칸 두 줄) · 「' + nm + '」 켜짐 · 칸마다 48 · 글씨 17 넘게 · 머리 줄 바로 아래', JSON.stringify({n: g.navN, recs: g.recs, hrefs: g.hrefs, on: g.on, box: g.recBox, fs: g.fs, under: g.under}));
  }
  for (const [hash, nm] of [['#/', '오늘'], ['#/k', '꾀'], ['#/o', '회사'], ['#/q', '멈춤']]) {
    await open(p, hash);
    await p.waitForSelector('#su .sj-tabs a.sj-tab', {timeout: 15000}).catch(() => {});
    const g = await look();
    check(g.tabs === '오늘 꾀 회사 멈춤 기록' && g.tabOn === nm && g.navN === 0 && g.tabsW && g.wide, W + '다) ' + nm + ' 쪽(' + hash + ') — 탭 「' + nm + '」 켜짐 · 기록 갈래 줄은 기록 탭 쪽에만 · 옆으로 밀 일 없음', JSON.stringify({tabs: g.tabs, on: g.tabOn, nav: g.navN, tabsW: g.tabsW, wide: g.wide}));
  }
  await open(p, '#/l');
  await p.waitForSelector('#su nav.sj-rec a.sj-recb', {timeout: 15000}).catch(() => {});
  await p.click('#su nav.sj-rec a.sj-recb[href="#/r/t"]').catch(() => {});
  await p.waitForSelector('#su main.sj-page[data-page="settle"]', {timeout: 15000}).catch(() => {});
  const gg = await look();
  check(gg.on.length === 1 && gg.on[0] === '정산' && gg.tabOn === '기록' && await p.evaluate(() => !!document.querySelector('#su main.sj-page[data-page="settle"]')), W + '라) 장부 쪽 갈래 줄에서 「정산」을 누르면 정산 쪽 · 기록 탭은 그대로 켜짐', JSON.stringify({on: gg.on, tab: gg.tabOn}));
  check(!errs.length, W + '화면 오류 0', errs.slice(0, 3).join(' / '));
  await ctx.close();
}
{ // ㊲ 주문 1125-0049(사장님 2026-11-25(서울) 00:40 「이제는 매수 와 매도를 하자 … 그 기준 날짜로 팔고 … 12프로 하락이면 자동으로 팔게 … 오늘까지 한것과 … 상대 비교」 · 00:49 「… 설명칸 … 모든 거래는 종가 기준」)
  //   정산 쪽(#/r/t) 「사기만 · 사고 팔기」 견줌 · 「이렇게 사고 팔아요」 설명칸 — 이 검사가 정산 자료(su21-settle.json)에서 따로 셈
  //   가) 판 셈마다 규칙: 88원 줄(종가 × 100 ≤ 산 값 × 88) · 정한 날(며칠째 ≥ 꾀 날 · 줄 위) · 들고 있음(며칠째 < 꾀 날 · 값 = 가장 늦은 종가) · 판 날 ≥ 산 날
  //   나) 두 셈 = 따로 센 값(산 돈 · 지금 · 판 돈과 남은 것 · 늘고 준 돈 · 판 것 · 들고 있는 것) · 막대 둘 · 한 줄 차이
  //   다) 꾀마다(꾀 차례 · 순위 아님 · 파는 날) · 서랍 단추 48 · 라) 설명칸 네 걸음 · 꾀마다 파는 날 합 36 · 실제 보기 = 자료 보기(산 값 · 판 값 · 며칠째 · 날) · 오류 0
  const W = '㊲ ';
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    await open(p, '#/r/t');
    await p.waitForSelector('#su section.sj-sv', {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(async () => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), D = await fetch('/su/data/su21-settle.json', {cache: 'no-store'}).then(r => r.json()).catch(() => null);
      const KK = /^g(0[1-9]|[12]\d|3[0-6])$/, SV = D?.sell, q = Number.isFinite(D?.qty) ? D.qty : 10, bad = [], per = {};
      let cost = 0, vB = 0, vS = 0, nd = 0, nc = 0, nh = 0, n = 0;
      (D?.buys ?? []).forEach((b, i) => {
        const k = D.kinds[b[1]]; if (!KK.test(k ?? '') || !(b[3] > 0)) return;
        const x = SV?.s?.[i]; if (!Array.isArray(x)) { bad.push('셈 없음 ' + i); return; }
        const now = D.now?.[b[2]]?.[0] > 0 ? D.now[b[2]][0] : b[3], N = SV.days?.[k];
        n++; cost += b[3] * q; vB += now * q; vS += x[2] * q;
        const o = per[k] ??= {cost: 0, vB: 0, vS: 0}; o.cost += b[3] * q; o.vB += now * q; o.vS += x[2] * q;
        if (!(x[1] >= b[0])) bad.push('판 날 차례 ' + i);
        if (x[0] === 'c') { nc++; if (!(x[2] * 100 <= b[3] * SV.cut)) bad.push('88원 줄 ' + i); }
        else if (x[0] === 'd') { nd++; if (!(x[3] >= N) || x[2] * 100 <= b[3] * SV.cut) bad.push('정한 날 ' + i); }
        else if (x[0] === 'h') { nh++; if (!(x[3] < N) || x[2] !== now) bad.push('들고 있음 ' + i); }
        else bad.push('꼴 ' + i);
      });
      const sec = document.querySelector('#su main.sj-page[data-page="settle"] section.sj-sv'), sx = document.querySelector('#su main.sj-page[data-page="settle"] section.sj-svx');
      const det = sec?.querySelector('details.sj-svk'), sum = det?.querySelector('summary')?.getBoundingClientRect();
      if (det) det.open = true;
      const days = SV?.days ?? {}, byN = {}; for (const v of Object.values(days)) byN[v] = (byN[v] ?? 0) + 1;
      const order = [...document.querySelectorAll('#su main.sj-page[data-page="settle"] > section')].map(x => x.classList.contains('sj-sv') ? 'sv' : x.classList.contains('sj-svx') ? 'svx' : x.classList.contains('sj-st36') ? 'st36' : x.classList.contains('sj-ph') ? 'ph' : '');
      return {ok: !!D, has: !!SV, rule: SV?.rule, cut: SV?.cut, n, cost, vB, vS, nd, nc, nh, bad: bad.slice(0, 5), nbad: bad.length, per, days, byN,
        ex: (SV?.ex ?? []).map(e => ({kind: e.kind, b: D.buys[e.i], x: SV.s[e.i], co: D.co?.[D.buys[e.i]?.[2]]?.[0] ?? null, n: days[D.kinds[D.buys[e.i]?.[1]]]})),
        sec: !!sec, sx: !!sx, order: order.filter(Boolean).join(' '),
        cards: [...(sec?.querySelectorAll('.sj-svc > .sj-svcard') ?? [])].map(c => ({m: c.dataset.m, st: c.dataset.st, t: txt(c.querySelector('.sj-svt b')), big: txt(c.querySelector('.sj-svbig b')), l: [...c.querySelectorAll('.sj-svl')].map(txt)})),
        bars: [...(sec?.querySelectorAll('figure.sj-svfig > .sj-svbr') ?? [])].map(b => ({m: b.dataset.m, st: b.dataset.st, v: txt(b.querySelector('.sj-svbv')), w: Math.round(b.querySelector('.sj-svfill')?.getBoundingClientRect().width ?? -1)})),
        say: txt(sec?.querySelector('.sj-svsay')), sumH: sum ? Math.round(sum.height) : 0,
        rows: [...(sec?.querySelectorAll('ol.sj-svkl > li.sj-svkr') ?? [])].map(li => ({k: li.dataset.k, d: txt(li.querySelector('.sj-svkn span')), v: [...li.querySelectorAll('.sj-svbv')].map(txt)})),
        steps: [...(sx?.querySelectorAll('ol.sj-svstep > li') ?? [])].map(li => txt(li.querySelector('b'))),
        dl: [...(sx?.querySelectorAll('ul.sj-svdl > li') ?? [])].map(li => [txt(li.querySelector('b')), txt(li.querySelector('span'))]),
        exs: [...(sx?.querySelectorAll('ol.sj-svexs > li.sj-svex') ?? [])].map(li => ({kind: li.dataset.kind, t: txt(li), pic: !!li.querySelector('svg.sj-svpic polyline')})),
        text: (sec?.innerText ?? '') + ' ' + (sx?.innerText ?? ''), over: document.documentElement.scrollWidth - innerWidth};
    });
    check(g.ok && g.has && g.rule === 'sell-v1' && g.cut === 88 && g.n > 0 && g.nbad === 0, W + width + ' 가) 판 셈마다 규칙 — 88원 줄 · 정한 날 · 들고 있음 · 판 날 차례(자료에서 따로 맞댐)', JSON.stringify({ok: g.ok, has: g.has, rule: g.rule, cut: g.cut, n: g.n, nbad: g.nbad, bad: g.bad}));
    const dB = g.vB - g.cost, dS = g.vS - g.cost, gap = dS - dB, st = d => (Math.round(d) > 0 ? 'up' : Math.round(d) < 0 ? 'dn' : 'eq');
    const cB = g.cards.find(c => c.m === 'buy'), cS = g.cards.find(c => c.m === 'sell');
    check(g.sec && g.order.startsWith('ph sv svx st36') && g.cards.length === 2 && cB?.t === '사기만' && cS?.t === '사고 팔기' && cB.big === movedM(dB) && cS.big === movedM(dS) && cB.st === st(dB) && cS.st === st(dS)
      && JSON.stringify(cB.l) === JSON.stringify(['산 돈 ' + wonM(g.cost), '지금 ' + wonM(g.vB)]) && JSON.stringify(cS.l) === JSON.stringify(['산 돈 ' + wonM(g.cost), '판 돈과 남은 것 ' + wonM(g.vS), '판 것 ' + (g.nd + g.nc).toLocaleString('ko-KR') + '번 · 들고 있는 것 ' + g.nh.toLocaleString('ko-KR') + '번']),
      W + width + ' 나) 두 셈 = 따로 센 값(사기만 · 사고 팔기 · 산 돈 · 지금 · 판 돈과 남은 것 · 판 것 · 들고 있는 것) · 맨 위 다음 · 꾀마다 정산 앞', JSON.stringify({order: g.order, cards: g.cards, want: [movedM(dB), movedM(dS), wonM(g.cost), wonM(g.vB), wonM(g.vS), g.nd, g.nc, g.nh]}));
    const mx = Math.max(Math.abs(dB), Math.abs(dS)), bw = d => (mx > 0 ? Math.abs(d) / mx : 0);
    check(g.bars.length === 2 && g.bars[0].m === 'buy' && g.bars[1].m === 'sell' && g.bars[0].v === movedM(dB) && g.bars[1].v === movedM(dS) && g.bars[0].st === st(dB) && g.bars[1].st === st(dS)
      && (bw(dB) >= bw(dS) ? g.bars[0].w >= g.bars[1].w : g.bars[0].w <= g.bars[1].w) && g.say === (Math.round(gap) === 0 ? '두 셈이 같아요.' : '사고 팔기 셈이 사기만 셈보다 ' + wonM(Math.abs(gap)) + (gap > 0 ? ' 더 많아요.' : ' 더 적어요.')),
      W + width + ' 나) 막대 둘(더 많이 늘고 준 셈이 더 긴 막대) · 한 줄 차이 = 따로 센 값', JSON.stringify({bars: g.bars, say: g.say, gap}));
    const ks = Object.keys(g.per).sort(), want = ks.map(k => ({k, d: g.days[k] + '일째에 팔아요', v: [movedM(g.per[k].vB - g.per[k].cost), movedM(g.per[k].vS - g.per[k].cost)]}));
    check(g.sumH >= 47.5 && JSON.stringify(g.rows.map(r => ({k: r.k, d: r.d, v: r.v}))) === JSON.stringify(want), W + width + ' 다) 꾀마다 견줌 — 꾀 차례(순위 아님) · 파는 날 · 두 셈 · 서랍 단추 48 넘게', JSON.stringify({sumH: g.sumH, n: g.rows.length, want: want.length, first: g.rows[0], w0: want[0]}));
    const dlWant = Object.entries(g.byN).sort((a, b) => a[0] - b[0]).map(([n, c]) => [n + '일째', '꾀 ' + c + '가지']);
    const exOk = g.exs.length === g.ex.length && g.ex.every((e, i) => { const t = g.exs[i]?.t ?? ''; return g.exs[i].kind === e.kind && g.exs[i].pic && t.includes(mdM(e.b[0])) && t.includes('종가 ' + wonM(e.b[3])) && t.includes(mdM(e.x[1])) && t.includes(wonM(e.x[2])) && t.includes(e.x[3] + '일째') && (e.co ? t.includes(e.co) : true) && t.includes(movedM((e.x[2] - e.b[3]) * 10)); });
    check(g.sx && JSON.stringify(g.steps) === JSON.stringify(['1. 사요', '2. 날을 세요', '3. 정한 날에 팔아요', '4. 많이 내리면 바로 팔아요']) && Object.values(g.byN).reduce((a, b) => a + b, 0) === 36 && JSON.stringify(g.dl) === JSON.stringify(dlWant) && exOk && /종가/.test(g.text) && /88원 이하/.test(g.text),
      W + width + ' 라) 설명칸 — 네 걸음 · 꾀마다 파는 날(합 36) · 실제 보기 = 자료(산 날 · 산 값 · 판 날 · 판 값 · 며칠째 · 회사 · 늘고 준 돈) · 꺾은선', JSON.stringify({steps: g.steps, dl: g.dl, ex: g.ex.length, exs: g.exs.map(x => x.kind + ' ' + x.t.slice(0, 80))}));
    check(!/%|매수|매도|추천/.test(g.text) && g.over <= 0 && !errs.length, W + width + ' 「%」 · 어려운 말 0 · 가로 넘침 0 · 화면 오류 0', JSON.stringify({over: g.over, errs: errs.slice(0, 2)}));
    await ctx.close();
  }
}
{ // ㊳ 주문 1125-1144(사장님 2026-11-25(서울) 11:44 「기록 탭에 말이야 그안안 탭을 두개 만들어줘 매수한종목 매동한 종목 그리고 언제 얼망에 매수해고 매도 했는지 그래서 보유기간은 몇일이였고 몇프로에 변동이 있었으며 수익은 어땠는지」)
  //   산 회사(#/l/b · 들고 있는 것) · 판 회사(#/l/s · 판 것 · #/r/s 는 지운 쪽 고리) — 이 검사가 정산 자료(su21-settle.json sell)에서 따로 셈: 묶음 수 · 오른 것 · 내린 것 · 평균 날 · 산 돈 · 늘고 준 돈 합
  //   줄 차례(산 회사 = 산 날 늦은 것부터 · 판 회사 = 판 날 늦은 것부터 · 꾀 · 번호) · 줄마다 회사 · 산 날 · 산 값 · 판 날 · 판 값 · 들고 있은 날 · 판 까닭 · 변동(프로) · 늘고 준 돈 · 서른 개씩 더 보기(48 넘게) · 「%」 0 · 넘침 0 · 오류 0
  const W = '㊳ ', pct = r => { const v = Math.round(r * 1000) / 10; return v > 0 ? v.toFixed(1) + '프로 올랐어요' : v < 0 ? (-v).toFixed(1) + '프로 내렸어요' : '그대로예요'; };
  for (const [hash, mode] of [['#/l/s', 's'], ['#/l/b', 'b']]) for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, hash);
    await p.waitForSelector('#su section.sj-tr', {timeout: 20000}).catch(() => {});
    const look = () => p.evaluate(async md => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), D = await fetch('/su/data/su21-settle.json', {cache: 'no-store'}).then(r => r.json()).catch(() => null);
      const KK = /^g(0[1-9]|[12]\d|3[0-6])$/, SV = D?.sell, q = Number.isFinite(D?.qty) ? D.qty : 10, L = [];
      (D?.buys ?? []).forEach((b, i) => { const x = SV?.s?.[i], k = D.kinds[b[1]]; if (!Array.isArray(x) || !KK.test(k ?? '') || !(b[3] > 0) || !(x[2] > 0)) return; if ((x[0] === 'h') !== (md === 'b')) return;
        L.push({k, code: b[2], co: D.co?.[b[2]]?.[0] ?? b[2], d0: b[0], p0: b[3], how: x[0], d1: x[1], p1: x[2], days: x[3], n: SV.days?.[k], diff: (x[2] - b[3]) * q, r: x[2] / b[3] - 1}); });
      const key = md === 'b' ? 'd0' : 'd1'; L.sort((a, b) => String(b[key]).localeCompare(String(a[key])) || a.k.localeCompare(b.k) || a.code.localeCompare(b.code));
      const sec = document.querySelector('#su section.sj-tr'), btn = sec?.querySelector('button.sj-trmore'), bq = btn && !btn.hidden ? btn.getBoundingClientRect() : null;
      return {ok: !!SV, mode: sec?.dataset.mode, n: +(sec?.dataset.n ?? -1), L, page: document.querySelector('#su main.sj-page')?.dataset.page,
        sum: [...document.querySelectorAll('#su section.sj-ph dl.sj-trsum dd')].map(txt), res: txt(document.querySelector('#su section.sj-ph p.sj-res b')),
        rows: [...(sec?.querySelectorAll('ol.sj-trl0 > li.sj-trow') ?? [])].map(li => ({co: txt(li.querySelector('.sj-trh b')), l: [...li.querySelectorAll('.sj-trl')].map(txt), r: txt(li.querySelector('.sj-trr b')), m: txt(li.querySelector('.sj-trm'))})),
        btn: btn && !btn.hidden ? txt(btn) : '', bh: bq ? Math.round(bq.height) : 0, text: document.querySelector('#su main.sj-page')?.innerText ?? '', over: document.documentElement.scrollWidth - innerWidth};
    }, mode);
    const g = await look(), L = g.L, n = L.length, up = L.filter(t => Math.round(t.diff) > 0).length, dn = L.filter(t => Math.round(t.diff) < 0).length, sum = L.reduce((a, t) => a + t.diff, 0), cost = L.reduce((a, t) => a + t.p0 * 10, 0), avg = n ? Math.round(L.reduce((a, t) => a + t.days, 0) / n * 10) / 10 : 0;
    const nm = mode === 's' ? '판 회사' : '산 회사', F = x => x.toLocaleString('ko-KR');
    check(g.ok && g.page === (mode === 's' ? 'sold' : 'held') && g.mode === mode && g.n === n && JSON.stringify(g.sum) === JSON.stringify([F(n) + '번 · ' + F(new Set(L.map(t => t.code)).size) + '곳', F(up) + '번 · ' + F(dn) + '번 · ' + F(n - up - dn) + '번', '평균 ' + avg + '일', wonM(cost), wonM(L.reduce((a, t) => a + t.p1 * 10, 0)), ...(mode === 's' ? [F(L.filter(t => t.how !== 'c').length) + '번 · ' + F(L.filter(t => t.how === 'c').length) + '번'] : [])]) /* 회사 수 · 그대로 · 지금 값 모두(판 돈 모두) · 판 까닭 — 주문 1126-2137 */ && g.res === (mode === 's' ? '판 것 모두 ' : '지금 값으로 모두 ') + movedM(sum),
      W + nm + ' ' + width + ' 가) 묶음 = 따로 센 값(' + (mode === 's' ? '판 것' : '들고 있는 것') + ' · 오른 것 · 내린 것 · 평균 날 · 산 돈 · 늘고 준 돈 합)', JSON.stringify({page: g.page, n: g.n, want: n, sum: g.sum, res: g.res, w: [up, dn, avg, cost, sum]}));
    const want = L.slice(0, 7).map(t => ({co: t.co, l: ['산 날 ' + mdM(t.d0) + ' · 산 값 ' + wonM(t.p0), mode === 's' ? '판 날 ' + mdM(t.d1) + ' · 판 값 ' + wonM(t.p1) : mdM(t.d1) + ' 종가 ' + wonM(t.p1),
      (mode === 's' ? '들고 있은 날 ' : '들고 있는 날 ') + t.days + '일 · ' + (mode === 's' ? (t.how === 'c' ? '88원 줄 밑으로 내려 팔았어요' : '정한 날(' + t.n + '일째)에 팔았어요') : '정한 날(' + t.n + '일째)까지 ' + Math.max(0, t.n - t.days) + '일')], r: pct(t.r), m: movedM(t.diff)}));
    check(JSON.stringify(g.rows) === JSON.stringify(want), W + nm + ' ' + width + ' 나) 처음 줄 일곱(주문 1127-1922 · 같은 틀) = 자료 차례 · 회사 · 산 날 · 산 값 · 판 날 · 판 값 · 들고 있은 날 · 판 까닭 · 변동 · 늘고 준 돈', JSON.stringify({n: g.rows.length, first: g.rows[0], w0: want[0]}));
    if (n > 7) {
      check(g.btn === Math.min(30, n - 7) + '개 더 보기 · 남은 ' + F(n - 7) + '개' && g.bh >= 47.5, W + nm + ' ' + width + ' 다) 「더 보기」 단추 글 · 48 넘게', JSON.stringify({btn: g.btn, bh: g.bh}));
      await p.click('#su section.sj-tr button.sj-trmore').catch(() => {});
      const g2 = await look();
      check(g2.rows.length === Math.min(37, n) && JSON.stringify(g2.rows.slice(7, 9)) === JSON.stringify(L.slice(7, 9).map(t => ({co: t.co, l: ['산 날 ' + mdM(t.d0) + ' · 산 값 ' + wonM(t.p0), mode === 's' ? '판 날 ' + mdM(t.d1) + ' · 판 값 ' + wonM(t.p1) : mdM(t.d1) + ' 종가 ' + wonM(t.p1), (mode === 's' ? '들고 있은 날 ' : '들고 있는 날 ') + t.days + '일 · ' + (mode === 's' ? (t.how === 'c' ? '88원 줄 밑으로 내려 팔았어요' : '정한 날(' + t.n + '일째)에 팔았어요') : '정한 날(' + t.n + '일째)까지 ' + Math.max(0, t.n - t.days) + '일')], r: pct(t.r), m: movedM(t.diff)}))),
        W + nm + ' ' + width + ' 다) 누르면 서른 개 더(처음 일곱 다음) · 이어진 줄 = 자료 차례', JSON.stringify({n: g2.rows.length}));
    }
    check(!/%|매수|매도|추천/.test(g.text) && g.over <= 0 && !errs.length, W + nm + ' ' + width + ' 「%」 · 어려운 말 0 · 가로 넘침 0 · 화면 오류 0', JSON.stringify({over: g.over, errs: errs.slice(0, 2)}));
    await ctx.close();
  }
}
{ // ㊴ 주문 1125-1359(사장님 2026-11-25(서울) 13:59 「어 해!」 — 「오늘」 화면 맨 위 「지금 시장」 한 줄 · 치지 짜임 1000가지 「오늘 탭 맨 위 지금 시장 상태 한 줄」)
  //   시계를 정해 둔 넷(평일 8시 30분 열리기 전 · 10시 열려 있음 · 오후 4시 닫힘 · 토요일 쉬는 날) — 머리 줄 바로 아래 · main 바로 위 · 상태 · 큰 말 · 다음 일 · 자료 때 · 글 17 넘게 · 다른 쪽에는 없음
  const W = '㊴ ', CASES = [['2026-11-25T08:30:00+09:00', 'pre', '장 열리기 전이에요', '오늘 오전 9시에 열려요'], ['2026-11-25T10:00:00+09:00', 'open', '장이 열려 있어요', '오후 3시 30분에 닫혀요'],
    ['2026-11-25T16:00:00+09:00', 'closed', '오늘 장은 닫혔어요', '다음 장날은 11월 26일 목요일 오전 9시예요'], ['2026-11-28T11:00:00+09:00', 'rest', '오늘은 장이 쉬는 날이에요', '다음 장날은 11월 30일 월요일 오전 9시예요']];
  for (const [when, st, t, sub] of CASES) {
    const ctx = await browser.newContext({viewport: {width: 360, height: 780}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    await p.clock.setFixedTime(new Date(when));
    await open(p, '#/');
    await p.waitForSelector('#su > .sj-mkt', {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), m = document.querySelectorAll('#su > .sj-mkt'), e = m[0];
      return {n: m.length, st: e?.dataset.st, t: t(e?.querySelector('.sj-mktt')), s: t(e?.querySelector('.sj-mkts')), d: t(e?.querySelector('.sj-mktd')), role: e?.getAttribute('role'),
        next: e?.nextElementSibling?.tagName === 'MAIN' && e.nextElementSibling.dataset.page === 'sonja', prev: !!e && (!!e.previousElementSibling?.matches('.sj-top, header') || (!!e.previousElementSibling?.matches('.sj-cheer') && !!e.previousElementSibling.previousElementSibling?.matches('.sj-top, header'))),
        fs: [...(e?.querySelectorAll('b, span') ?? [])].map(x => parseFloat(getComputedStyle(x).fontSize)), shape: !!e?.querySelector('i.sj-mkti'), over: document.documentElement.scrollWidth - innerWidth}; });
    check(g.n === 1 && g.st === st && g.t === t && g.s === sub && /^자료는 (오늘 오[전후] \d+시( \d+분)? 값이에요|\d+월 \d+일 값이에요)$/.test(g.d) && g.role === 'status' && g.next && g.prev && g.shape && g.fs.every(f => f >= 16.95) && g.over <= 0 && !errs.length,
      W + when.slice(0, 16) + ' — ' + t + ' · ' + sub + ' · 자료 때 · 머리 줄(또는 응원 한 줄) 바로 아래 · main 바로 위 · 모양 · 글 17 넘게', JSON.stringify({...g, errs: errs.slice(0, 2)}));
    if (st === 'open') { await open(p, '#/k'); await p.waitForSelector('#su main.sj-page', {timeout: 15000}).catch(() => {}); const k = await p.evaluate(() => document.querySelectorAll('#su .sj-mkt').length); check(k === 0, W + '꾀 쪽에는 지금 시장 한 줄이 없음(「오늘」 맨 위만)', String(k)); }
    await ctx.close();
  }
}
{ // ㊵ 주문 1125-2019(사장님 2026-11-25(서울) 20:19 「한사장 화이팅 힘내! 첫페이지에 너어라 1시간이내에 해」) — 첫 화면(「오늘」) 맨 위 응원 한 줄
  //   글 그대로 「한사장 화이팅 힘내!」 · 하나만 · 머리 줄 바로 아래 · 지금 시장 한 줄 바로 위 · 별 모양 · 글 17 넘게 · 높이 48 넘게 · 가로 넘침 0 · 화면 오류 0 · 다른 쪽(꾀)에는 없음 · 320 · 360 · 390 넓이
  const W = '㊵ ', WANT = '한사장 화이팅 힘내!';
  for (const width of [320, 360, 390]) {
    const ctx = await browser.newContext({viewport: {width, height: 780}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    await open(p, '#/');
    await p.waitForSelector('#su > .sj-cheer', {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => { const t = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), m = document.querySelectorAll('#su > .sj-cheer'), e = m[0], q = e?.querySelector('p.sj-cheerp'), r = e?.getBoundingClientRect(), i = e?.querySelector('i.sj-cheeri');
      return {n: m.length, all: document.querySelectorAll('#su .sj-cheer').length, t: t(q), role: e?.getAttribute('role'), prev: !!e?.previousElementSibling?.matches('.sj-top, header'), next: !!e?.nextElementSibling?.matches('.sj-mkt'),
        shape: !!i && i.getAttribute('aria-hidden') === 'true' && i.getBoundingClientRect().width >= 16, fs: q ? parseFloat(getComputedStyle(q).fontSize) : 0, h: r ? Math.round(r.height) : 0, inW: !!r && r.left >= -0.5 && r.right <= innerWidth + 0.5,
        lines: q ? Math.round(q.getBoundingClientRect().height / parseFloat(getComputedStyle(q).lineHeight)) : 0, over: document.documentElement.scrollWidth - innerWidth}; });
    check(g.n === 1 && g.all === 1 && g.t === WANT && g.role === 'note' && g.prev && g.next && g.shape && g.fs >= 16.95 && g.h >= 47.5 && g.inW && g.lines === 1 && g.over <= 0 && !errs.length,
      W + width + ' — 「' + WANT + '」 · 하나 · 머리 줄 바로 아래 · 지금 시장 바로 위 · 별 · 한 줄 · 글 17 넘게 · 높이 48 넘게 · 넘침 0 · 오류 0', JSON.stringify({...g, errs: errs.slice(0, 2)}));
    if (width === 360) { await open(p, '#/k'); await p.waitForSelector('#su main.sj-page', {timeout: 15000}).catch(() => {}); const k = await p.evaluate(() => document.querySelectorAll('#su .sj-cheer').length); check(k === 0, W + '꾀 쪽에는 응원 한 줄이 없음(첫 화면 맨 위만)', String(k)); }
    await ctx.close();
  }
}
{ // ㊶ 주문 1125-2101(사장님 2026-11-25(서울) 20:52 「전체 투자 자산, 수익률, 자산 배분, 기간별 추이까지 한 화면에서 … 어떠한 꾀가 많이 골랐던 업종이 어떠한 분야였는지 그림으로도 한 눈에」) · 1125-2248(22:48 본보기 그림과 「이렇게 만들어줘 … 제대로 읽어」) — 기록 탭 맨 앞 「한눈에」(#/l/a)
  //   본보기 짜임: 나눔 고르기(꾀별 분포 · 업종별 분포) · 자산 포트폴리오 · 총 평가 금액 · 늘고 준 돈 · 프로 · 동그라미(가운데 총 자산) · 이름표(몫 · 돈) · 한 줄 알림 · 수익률 추이(기간 단추 · 눈금 셋 · 날짜 셋 · 끝 값)
  //   이 검사가 정산 자료(su21-settle.json sell · co · sell.tt)에서 따로 셈: 총 평가 금액 · 들인 돈 · 늘고 준 돈 · 프로 · 가운데 줄인 값 · 꾀 줄 수 · 첫 꾀 가장 많이 고른 업종 · 추이 장날 수 · 끝 값 = 총 평가 금액과 같은 셈
  //   「%」 · 매수 · 매도 · 추천 0 · 빨강 글 0 · 글 17 넘게(동그라미 안 숫자 · 눈금 · 날짜 포함) · 단추 48 넘게 · 가로 넘침 0 · 화면 오류 0 · 390 · 320 넓이
  const W = '㊶ ', pct = r => { const v = Math.round(r * 1000) / 10; return v > 0 ? v.toFixed(1) + '프로 올랐어요' : v < 0 ? (-v).toFixed(1) + '프로 내렸어요' : '그대로예요'; };
  const wonS = v => { const a = Math.abs(v); return a >= 1e8 ? (Math.round(a / 1e6) / 100).toFixed(2) + '억' : a >= 1e4 ? NFm.format(Math.round(a / 1e4)) + '만' : NFm.format(Math.round(a)); };
  const ieyo = w => { const c = String(w).trim().slice(-1).charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 === 0 ? '예요' : '이에요'; };
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, '#/l/a');
    await p.waitForSelector('#su section.sj-pf', {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(async () => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), D = await fetch('/su/data/su21-settle.json', {cache: 'no-store'}).then(r => r.json()).catch(() => null);
      const KK = /^g(0[1-9]|[12]\d|3[0-6])$/, SV = D?.sell, q = Number.isFinite(D?.qty) ? D.qty : 10; let cost = 0, val = 0, n = 0; const per = new Map(), ind = c => (typeof D?.co?.[c]?.[1] === 'string' && D.co[c][1].trim()) || '그 밖 업종';
      const T = []; (D?.buys ?? []).forEach((b, i) => { const x = SV?.s?.[i], k = D.kinds[b[1]]; if (!Array.isArray(x) || !KK.test(k ?? '') || !(b[3] > 0) || !(x[2] > 0)) return; cost += b[3] * q; val += x[2] * q; n++; T.push({d0: b[0], code: b[2], how: x[0], d1: x[1], p0: b[3], p1: x[2], k}); const m = per.get(k) ?? new Map(); m.set(ind(b[2]), (m.get(ind(b[2])) ?? 0) + 1); per.set(k, m); });
      const k0 = [...per.keys()].sort()[0], best0 = k0 ? [...per.get(k0).entries()].filter(([i]) => i !== '그 밖 업종').sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] : null;
      const TT = (SV?.tt?.days ?? []).map((d, i) => [d, SV.tt.c?.[i], SV.tt.v?.[i]]).filter(([d, c, v]) => typeof d === 'string' && Number.isFinite(c) && c > 0 && Number.isFinite(v));
      const sec = document.querySelector('#su section.sj-pf'), legOf = () => [...document.querySelectorAll('#su .sj-pf .sj-gllegi')], arcN = () => document.querySelectorAll('#su .sj-pf svg.sj-gldo circle[data-part]').length, shSum = () => legOf().reduce((a, e) => a + (parseInt((txt(e.querySelector('.sj-pfsh')).match(/(\d+)프로$/) ?? [])[1], 10) || 0), 0);
      const v0 = {kname: legOf().map(li => [li.dataset.k ?? '', li.dataset.part ?? '']), view: sec?.dataset.view, leg: legOf().length, arcs: arcN(), sum: shSum(), k36: legOf().map(li => [li.dataset.k ?? '', txt(li.querySelector('.sj-pfsh')), txt(li.querySelector('.sj-pfam')), li.querySelector('.sj-glkr')?.dataset.st ?? 'none', txt(li.querySelector('.sj-glkr .sj-glkrl')), txt(li.querySelector('.sj-glkr > b') ?? li.querySelector('.sj-glkr'))]), cap: txt(document.querySelector('#su .sj-gllegcap')), kfs: [...document.querySelectorAll('#su .sj-pf .sj-glkm, #su .sj-pf .sj-glkm *')].map(e => parseFloat(getComputedStyle(e).fontSize)), kh: legOf().map(li => Math.round(li.getBoundingClientRect().height)), kcol: legOf().map(li => { const r = li.querySelector('.sj-glkr'); return r ? [r.dataset.st ?? 'none', getComputedStyle(r.querySelector(':scope > b') ?? r).color, getComputedStyle(r.querySelector(':scope > .sj-shp') ?? r).color] : null; })}, bI = document.querySelector('#su .sj-pfsb[data-view="i"]'); bI?.click(); await new Promise(r => setTimeout(r, 120));
      const v1 = {view: sec?.dataset.view, leg: legOf().length, arcs: arcN(), sum: shSum(), on: [...document.querySelectorAll('#su .sj-pfsb[aria-pressed="true"]')].map(b => b.dataset.view), rows: legOf().map(li => [li.dataset.part ?? '', txt(li.querySelector('.sj-pfsh')), txt(li.querySelector('.sj-pfam'))]), cap: txt(document.querySelector('#su .sj-gllegcap')), coI: Object.fromEntries(Object.entries(D?.co ?? {}).map(([c, x]) => [c, x?.[1] ?? null]))};
      const sps = [...document.querySelectorAll('#su .sj-pftr .sj-glsp')], m1 = sps.find(b => b.dataset.span === '1개월'); m1?.click(); await new Promise(r => setTimeout(r, 120));
      // 점 누르기(주문 1127-1705) — 처음 = 마지막 장날 · 「앞 장날」 = 그 앞 날 · 그림 맨 왼쪽을 누르면 첫 장날
      const pkOf = () => { const k = document.querySelector('#su .sj-pftr .sj-glpk'); if (!k) return null; const w = k.querySelector('.sj-glpkh .sj-wkg'); return [k.dataset.day ?? '', txt(k.querySelector('.sj-glpkd')), w?.dataset.st ?? '', txt(w?.querySelector(':scope > b')), txt(w?.querySelector('.sj-wkgm')), txt(k.querySelector('.sj-glpkt')), !!k.querySelector('[data-go="-1"]')?.disabled, !!k.querySelector('[data-go="1"]')?.disabled]; };
      const pk0 = pkOf(); document.querySelector('#su .sj-pftr .sj-glpk [data-go="-1"]')?.click(); await new Promise(r => setTimeout(r, 80)); const pk1 = pkOf();
      const sv = document.querySelector('#su .sj-pftr svg.sj-gltrs'), sr = sv?.getBoundingClientRect(); sv?.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: (sr?.left ?? 0) + 2, clientY: (sr?.top ?? 0) + 10})); await new Promise(r => setTimeout(r, 80)); const pk2 = pkOf();
      const pkH = [...document.querySelectorAll('#su .sj-pftr .sj-glpkb')].map(b => Math.round(b.getBoundingClientRect().height)), pkFs = [...document.querySelectorAll('#su .sj-pftr .sj-glpk *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize));
      const dayRow = li => [li.dataset.day, txt(li.querySelector('.sj-gldh > b')), txt(li.querySelector('.sj-gldd > span') ?? li.querySelector('.sj-gldd')), [...li.querySelectorAll('.sj-gldt')].map(txt), txt(li.querySelector('.sj-gldg > span'))];
      const dsec = document.querySelector('#su section.sj-glday'), dRows0 = [...(dsec?.querySelectorAll('li.sj-gldr') ?? [])].map(dayRow), dMore = dsec?.querySelector('button.sj-gldmore'), dmq = dMore && !dMore.hidden ? dMore.getBoundingClientRect() : null, dMoreT = dMore && !dMore.hidden ? txt(dMore) : '';
      if (dMore && !dMore.hidden) { dMore.click(); await new Promise(r => setTimeout(r, 120)); }
      const dRows1 = [...(dsec?.querySelectorAll('li.sj-gldr') ?? [])].map(dayRow), dMoreAfter = !!dMore && !dMore.hidden;
      const sumC = [...document.querySelectorAll('#su section.sj-pf dl.sj-glsum > .sj-glsc')].map(c => [c.dataset.f, txt(c.querySelector('dt')), txt(c.querySelector('dd:not(.sj-glss)')), txt(c.querySelector('dd.sj-glss'))]);
      const split = [...document.querySelectorAll('#su section.sj-pf ul.sj-glsplit > li.sj-glsr')].map(r => [r.dataset.f, txt(r.querySelector('.sj-glsrk')), txt(r.querySelector('.sj-glsrv > span')), [...r.querySelectorAll('.sj-glsrs')].map(txt)]);
      const main = document.querySelector('#su main'), fsOf = sel => [...document.querySelectorAll(sel)].map(e => parseFloat(getComputedStyle(e).fontSize));
      const kS = document.querySelector('#su section.sj-kgl'), kC = [...(kS?.querySelectorAll('li.sj-kglc') ?? [])]; // 꾀마다 수익률 추이(주문 1127-1412)
      const kgl = kS ? {n: +kS.dataset.n, mx: +kS.dataset.mx, prev: !!kS.previousElementSibling?.matches('section.sj-pftr'), leads: [...kS.querySelectorAll(':scope > p.sj-gllead')].map(txt),
        cards: kC.map(c => [c.dataset.k, c.dataset.st, txt(c.querySelector('.sj-kglh')), txt(c.querySelector('.sj-kglr > b') ?? c.querySelector('.sj-kglr')), +c.dataset.n, (c.querySelector('path.sj-kglp')?.getAttribute('d') ?? '').split(/[ML]/).filter(x => x.trim()).length]),
        col: kC.map(c => { const q = c.querySelector('path.sj-kglp'); return q ? getComputedStyle(q).stroke : null; }), fs: [...kS.querySelectorAll('.sj-kglh, .sj-kglr, .sj-kglr > b, :scope > p')].map(e => parseFloat(getComputedStyle(e).fontSize)),
        tk: D?.sell?.tk ?? null} : null;
      return {pk: [pk0, pk1, pk2], pkH, pkFs, kgl, TTd: TT, T, sumC, split, asOf: txt(document.querySelector('#su section.sj-pf .sj-glasof')), day1: txt(document.querySelector('#su .sj-pftot .sj-glday1 > span')), dN: +(dsec?.dataset.n ?? -1), dRows0, dRows1, dMoreT, dmh: dmq ? Math.round(dmq.height) : 0, dMoreAfter,
        fs2: [...fsOf('#su .sj-glsc dt'), ...fsOf('#su .sj-glsc dd'), ...fsOf('#su .sj-glsrk'), ...fsOf('#su .sj-glsrv'), ...fsOf('#su .sj-glsrs'), ...fsOf('#su .sj-glasof'), ...fsOf('#su .sj-gldh > b'), ...fsOf('#su .sj-gldd'), ...fsOf('#su .sj-gldt'), ...fsOf('#su .sj-gldg'), ...fsOf('#su .sj-gldmore')],
        cost, val, n, nk: per.size, best0, k0, TT: TT.length, lastD: TT.at(-1)?.[0] ?? null, lastR: TT.length ? TT.at(-1)[2] / TT.at(-1)[1] - 1 : null, page: main?.dataset.page, h1: txt(document.querySelector('#su main h1')),
        val0: txt(document.querySelector('#su .sj-pfval')), cost0: txt(document.querySelector('#su .sj-pfcost')), res: txt(document.querySelector('#su .sj-pf .sj-glres b')), pc: txt(document.querySelector('#su .sj-pf .sj-glpct b')), ctr: txt(document.querySelector('#su .sj-pfctr > b')),
        v0, v1, segH: [...document.querySelectorAll('#su .sj-pfsb')].map(b => Math.round(b.getBoundingClientRect().height)), ins: txt(document.querySelector('#su .sj-pfinb')), insH: Math.round(document.querySelector('#su a.sj-pfin')?.getBoundingClientRect().height ?? 0),
        rows: document.querySelectorAll('#su .sj-glk').length, r0: txt(document.querySelector('#su .sj-glk .sj-glkt')), r0k: document.querySelector('#su .sj-glk')?.dataset.k ?? null,
        sh: sps.map(b => Math.round(b.getBoundingClientRect().height)), spOn: sps.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.span), spT: sps.map(b => b.dataset.span + (b.disabled ? '-' : '')).join(' '), segIn: !!document.querySelector('#su section.sj-pf .sj-pfseg'), segBefore: document.querySelector('#su main > .sj-pfseg')?.nextElementSibling?.matches('section.sj-pf') ?? false, dots: document.querySelectorAll('#su .sj-pftr path.sj-pfdot').length, rec0: document.querySelector('#su nav.sj-rec a.sj-recon')?.getAttribute('href') ?? null, tab4: document.querySelector('#su .sj-tabs a.sj-tab[aria-current="page"]')?.getAttribute('href') ?? null, pathN: document.querySelector('#su .sj-pftr .sj-gltrp')?.getAttribute('data-n'), last: txt(document.querySelector('#su .sj-pflast b')),
        ys: document.querySelectorAll('#su .sj-pfy > span').length, xs: document.querySelectorAll('#su .sj-pfx > span').length,
        text: txt(main), red: [...(main?.querySelectorAll('*') ?? [])].filter(e => { if (e.closest('.sj-glkr') || e.closest('.sj-wkg[data-st="up"]')) return false; const m = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return m && +m[1] > 170 && +m[2] < 90 && +m[3] < 90; }).length, // 꾀별 수익률 오름 빨강은 사장님 말씀(주문 1127-1244)이라 뺌
        fs: [...fsOf('#su .sj-pf .sj-gllegi'), ...fsOf('#su .sj-pfsb'), ...fsOf('#su .sj-pfctr > *'), ...fsOf('#su text.sj-pfsl'), ...fsOf('#su .sj-pfy > span'), ...fsOf('#su .sj-pfx > span'), ...fsOf('#su .sj-glsp'), ...fsOf('#su .sj-pfint'), ...fsOf('#su .sj-glkh'), ...fsOf('#su .sj-glkt'), ...fsOf('#su .sj-glk2')], over: document.documentElement.scrollWidth - innerWidth};
    });
    const md = d => +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일';
    check(g.page === 'glance' && g.h1 === '자산 포트폴리오' && g.n > 0 && g.val0 === wonM(g.val) && g.res === movedM(g.val - g.cost) && g.pc === pct(g.val / g.cost - 1) && g.ctr === wonS(g.val),
      W + width + ' 가) 자산 포트폴리오 · 총 평가 금액 · 늘고 준 돈 · 프로 · 가운데 총 자산 = 자료에서 따로 셈', JSON.stringify({h1: g.h1, val0: g.val0, res: g.res, pc: g.pc, ctr: g.ctr, cost: g.cost, val: g.val}));
    // 사) 주문 1126-2137(사장님 2026-11-26(서울) 21:37 「총 매수 금액은 표기 되어 있는대 총 보유 금액은 … 몇종목 보유하고 있는지 … 날짜별 표기와 기타등등은 에이전트 50개 가동해서 …」) — 이 검사가 정산 자료에서 따로 셈
    //   숫자 판 넷(총 보유 금액 · 보유 종목 · 판 돈 · 들인 돈) · 늘고 준 돈 나눠 보기(들고 있는 것 · 판 것 · 모두 — 오른 · 내린 · 그대로 · 정한 날 · 88원 줄) · 기준 날 · 앞 장날보다 · 날마다 보기(새 날이 위 · 다섯 날 + 더 보기 · 산 것 · 판 것 · 들고 있는 것 번 · 곳 · 들인 돈 · 그날 값)
    {
      const F2 = x => x.toLocaleString('ko-KR'), q2 = 10, T2 = g.T, H2 = T2.filter(t => t.how === 'h'), S2 = T2.filter(t => t.how !== 'h'), sumOf = (L, f) => L.reduce((a, t) => a + f(t), 0);
      const held = sumOf(H2, t => t.p1 * q2), cash = sumOf(S2, t => t.p1 * q2), hCost = sumOf(H2, t => t.p0 * q2), sCost = sumOf(S2, t => t.p0 * q2), hDiff = sumOf(H2, t => (t.p1 - t.p0) * q2), sDiff = sumOf(S2, t => (t.p1 - t.p0) * q2);
      const hUp = H2.filter(t => Math.round((t.p1 - t.p0) * q2) > 0).length, hDn = H2.filter(t => Math.round((t.p1 - t.p0) * q2) < 0).length, nCo = new Set(H2.map(t => t.code)).size, nC = S2.filter(t => t.how === 'c').length;
      const vsM = (lab, v) => (Math.round(v) === 0 ? lab + '과 같아요' : lab + '보다 ' + movedM(v)), wk = d => '일월화수목금토'[new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))).getUTCDay()];
      const sumW = [['held', '총 보유 금액', wonM(held), '들고 있는 ' + F2(H2.length) + '번을 그날 종가로'], ['cos', '보유 종목', F2(nCo) + '곳', '같은 회사를 여러 번 산 것은 한 곳으로 셌어요'], ['cash', '판 돈', wonM(cash), '판 것 ' + F2(S2.length) + '번'], ['cost', '들인 돈', wonM(g.cost), '산 것 ' + F2(g.n) + '번']];
      const splitW = [['hold', '들고 있는 것', movedM(hDiff), ['산 돈 ' + wonM(hCost) + ' → 지금 ' + wonM(held), '오른 것 ' + F2(hUp) + '번 · 내린 것 ' + F2(hDn) + '번 · 그대로 ' + F2(H2.length - hUp - hDn) + '번']],
        ['sold', '판 것', movedM(sDiff), ['산 돈 ' + wonM(sCost) + ' → 판 돈 ' + wonM(cash), '정한 날에 판 것 ' + F2(S2.length - nC) + '번 · 88원 줄 밑으로 판 것 ' + F2(nC) + '번']], ['all', '모두', movedM(g.val - g.cost), ['들고 있는 것과 판 것을 더했어요']]];
      const TTd = g.TTd ?? [], DW = TTd.map(([d, c, v], j) => { const hd = T2.filter(t => t.d0 <= d && (t.how === 'h' || t.d1 > d)), gg = v - c, dg = j ? gg - (TTd[j - 1][2] - TTd[j - 1][1]) : null;
        return [d, md(d) + '(' + wk(d) + ')', dg == null ? '첫날이에요' : vsM('앞 장날', dg), ['산 것 ' + F2(T2.filter(t => t.d0 === d).length) + '번 · 판 것 ' + F2(S2.filter(t => t.d1 === d).length) + '번 · 들고 있는 것 ' + F2(hd.length) + '번(' + F2(new Set(hd.map(t => t.code)).size) + '곳)', '들인 돈 ' + wonM(c) + ' · 그날 값 ' + wonM(v)], vsM('들인 돈', gg)]; }).reverse();
      const last = DW[0] ?? null, asOfW = last ? md(last[0]) + '(' + wk(last[0]) + ') 종가로 셌어요 · 모두 가짜 돈이에요' : '', day1W = TTd.length > 1 ? last[2] : '';
      check(JSON.stringify(g.sumC) === JSON.stringify(sumW) && JSON.stringify(g.split) === JSON.stringify(splitW) && Math.abs(hDiff + sDiff - (g.val - g.cost)) < 1 && g.asOf === asOfW && g.day1 === day1W,
        W + width + ' 사) 숫자 판(총 보유 금액 · 보유 종목 · 판 돈 · 들인 돈) · 늘고 준 돈 나눠 보기(들고 있는 것 · 판 것 · 모두) · 기준 날 · 앞 장날보다 = 자료에서 따로 셈(주문 1126-2137)', JSON.stringify({sumC: g.sumC, sumW, split: g.split, splitW, asOf: g.asOf, asOfW, day1: g.day1, day1W}).slice(0, 1500));
      const nD0 = Math.min(5, DW.length);
      check(g.dN === DW.length && JSON.stringify(g.dRows0) === JSON.stringify(DW.slice(0, nD0)) && (DW.length > 5 ? g.dMoreT === '남은 ' + F2(DW.length - 5) + '날 더 보기' && g.dmh >= 47.5 && !g.dMoreAfter : g.dMoreT === '') && JSON.stringify(g.dRows1) === JSON.stringify(DW) && g.fs2.length > 0 && g.fs2.every(f => f >= 16.9),
        W + width + ' 아) 날마다 보기 — 장부 날마다(새 날이 위) · 처음 다섯 날 + 「남은 ○날 더 보기」(48 넘게) · 날마다 산 것 · 판 것 · 들고 있는 것(번 · 곳) · 들인 돈 · 그날 값 · 들인 돈보다 · 앞 장날보다 = 자료에서 따로 셈 · 글 17 넘게(주문 1126-2137)', JSON.stringify({dN: g.dN, want: DW.length, r0: g.dRows0[0], w0: DW[0], more: g.dMoreT, mh: g.dmh, after: g.dMoreAfter, n1: g.dRows1.length, bad: g.dRows1.map((r, i) => (JSON.stringify(r) === JSON.stringify(DW[i]) ? null : [i, r, DW[i]])).filter(Boolean).slice(0, 1), fsMin: Math.min(...g.fs2)}).slice(0, 1500));
    }
    // 나) 꾀별 = 서른여섯 꾀 모두(주문 1127-0938 · 사장님 「지금은 몇개만 표현했다 36개 모두를 표기 하라」) — 이름표 줄마다 꾀 · 몫 · 금액 = 이 검사가 산 셈에서 따로 셈(같으면 꾀 차례 · 산 적 없는 꾀는 0원)
    //   주문 1127-1137(사장님 2026-11-27(서울) 11:37 「매수한 비중이라고 표기하고 그래서 수익률이 얼마인지도 표기하라」) — 몫 = 「산 비중 ○프로」(산 돈 몫) · 금액 = 「산 돈 ○원」 · 차례 = 산 돈 큰 차례 · 「수익률」 + 모양(▲ · ▼ · ―) + ○프로 = 그 꾀 지금 값 ÷ 산 돈 − 1 · 글 17 넘게
    const K36g = Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')), byKg = new Map(K36g.map(k => [k, [0, 0]])); for (const t of g.T) if (byKg.has(t.k)) { const m = byKg.get(t.k); m[0] += t.p0 * 10; m[1] += t.p1 * 10; }
    const totK = [...byKg.values()].reduce((a, m) => a + m[0], 0), wonSg = v => { const a = Math.abs(v); return a >= 1e8 ? (Math.round(a / 1e6) / 100).toFixed(2) + '억' : a >= 1e4 ? NFm.format(Math.round(a / 1e4)) + '만' : NFm.format(Math.round(a)); };
    //   주문 1127-1244(사장님 2026-11-27(서울) 12:44 「배치를 수익률순으로 하고 수익은 빨강 화살펴 내림은 파랑으로 해」) — 차례 = 수익률 높은 차례(같으면 꾀 차례 · 산 적 없는 꾀는 맨 끝) · 오름 ▲ 과 프로 = 빨강 rgb(211, 47, 47) · 내림 ▼ 과 프로 = 파랑 rgb(21, 101, 192) · 그대로는 둘 다 아님
    const rOf = ([c, v]) => (c > 0 ? v / c - 1 : null);
    const k36W = [...byKg.entries()].sort((a, b) => (rOf(a[1]) == null) - (rOf(b[1]) == null) || (rOf(b[1]) ?? 0) - (rOf(a[1]) ?? 0) || K36g.indexOf(a[0]) - K36g.indexOf(b[0])).map(([k, [c, v]]) => { const pm = c > 0 ? Math.round((v / c - 1) * 1000) : null;
      return [k, '산 비중 ' + (totK > 0 ? Math.round(c / totK * 100) : 0) + '프로', '산 돈 ' + wonSg(c) + '원', pm == null ? 'none' : pm > 0 ? 'up' : pm < 0 ? 'dn' : 'eq', pm == null ? '' : '수익률', pm == null ? '산 적 없음' : Math.abs(pm / 10).toFixed(1) + '프로']; });
    const RED = 'rgb(211, 47, 47)', BLUE = 'rgb(21, 101, 192)', colOk = g.v0.kcol.every(x => x != null && (x[0] === 'up' ? x[1] === RED && x[2] === RED : x[0] === 'dn' ? x[1] === BLUE && x[2] === BLUE : x[1] !== RED && x[1] !== BLUE));
    // 업종별 이름표(주문 1127-1554 · 사장님 15:54 「어 붙여」) — 칸 = 들고 있는 값 큰 업종 넷 + 그 밖 업종 + 판 돈(화면 glanceOf 와 같은 셈을 따로) · 「지금 값 비중 ○프로」 · 「지금 값 ○원」(판 돈 칸은 「판 돈 ○원」) · 머리말 셋
    const indI = c => (typeof g.v1.coI?.[c] === 'string' && g.v1.coI[c].trim()) || '그 밖 업종', HI = g.T.filter(t => t.how === 'h'), SI = g.T.filter(t => t.how !== 'h');
    const pickI = new Map(); for (const t of g.T) { const i = indI(t.code); pickI.set(i, (pickI.get(i) ?? 0) + 1); }
    const heldI = new Map(); for (const t of HI) { const i = indI(t.code); heldI.set(i, (heldI.get(i) ?? 0) + t.p1 * 10); }
    const top8 = [...pickI.keys()].filter(i => i !== '그 밖 업종').sort((a, b) => (heldI.get(b) ?? 0) - (heldI.get(a) ?? 0) || pickI.get(b) - pickI.get(a) || a.localeCompare(b)).slice(0, 8);
    const byI = new Map(); for (const t of HI) { const i0 = indI(t.code), k = top8.includes(i0) ? i0 : '그 밖 업종'; byI.set(k, (byI.get(k) ?? 0) + t.p1 * 10); }
    const partsI = [...top8.filter(i => byI.has(i)).map(i => ({name: i, v: byI.get(i)})), ...(byI.has('그 밖 업종') ? [{name: '그 밖 업종', v: byI.get('그 밖 업종')}] : [])], cashI = SI.reduce((a, t) => a + t.p1 * 10, 0);
    const iTopI = partsI.filter(x => x.name !== '그 밖 업종').sort((a, b) => b.v - a.v), iEtcI = partsI.filter(x => x.name === '그 밖 업종').reduce((a, x) => a + x.v, 0) + iTopI.slice(4).reduce((a, x) => a + x.v, 0);
    const iP = [...iTopI.slice(0, 4), ...(iEtcI > 0 ? [{name: '그 밖 업종', v: iEtcI}] : []), ...(cashI > 0 ? [{name: '판 돈', v: cashI, cash: true}] : [])], totI = iP.reduce((a, x) => a + x.v, 0);
    const iW = iP.map(x => [x.name, '지금 값 비중 ' + (totI > 0 ? Math.round(x.v / totI * 100) : 0) + '프로', (x.cash ? '판 돈 ' : '지금 값 ') + wonSg(x.v) + '원']);
    const iCap = ['들고 있는 회사의 업종 가운데 큰 넷과 그 밖 업종, 그리고 판 돈이에요.', '지금 값 비중은 총 평가 금액에서 그 칸이 차지하는 몫이에요.', '총 평가 금액은 들고 있는 것과 판 돈을 더한 값이에요.'].join(' ');
    const kCap = ['서른여섯 꾀 모두예요. 수익률이 높은 차례예요.', '산 비중은 모든 산 돈에서 그 꾀가 쓴 몫이에요.', '수익률은 그 꾀가 쓴 돈이 지금 몇 프로 늘거나 줄었는지예요. 판 것은 판 돈으로 셌어요.', '꾀 줄을 누르면 그 꾀가 사고판 회사가 나와요.'].join(' '); // 넷째 줄 = 꾀 줄 누르기(주문 1127-2155)
    check(g.v0.view === 'k' && g.v0.leg === 36 && g.v0.arcs === 36 && JSON.stringify(g.v0.k36) === JSON.stringify(k36W) && g.v0.cap === kCap && g.v0.kfs.length >= 36 * 4 && g.v0.kfs.every(f => f >= 16.9) && g.v0.kcol.length === 36 && colOk
      && g.v1.view === 'i' && g.v1.on.length === 1 && g.v1.on[0] === 'i' && g.v1.leg >= 1 && g.v1.leg <= 10 && g.v1.arcs === g.v1.leg && g.v1.sum >= 96 && g.v1.sum <= 104 && JSON.stringify(g.v1.rows) === JSON.stringify(iW) && g.v1.cap === iCap && g.segH.length === 2 && g.segH.every(x => x >= 47.5) && g.ins.length > 0 && g.insH >= 47.5,
      W + width + ' 나) 나눔 고르기 둘(꾀별 → 업종별 · 업종별 이름표 「지금 값 비중」 · 「지금 값」 · 「판 돈」 · 머리말 = 자료에서 따로 셈 · 주문 1127-1554) · 꾀별 = 서른여섯 꾀 모두(조각 36 · 이름표 36 · 산 비중 · 산 돈 · 수익률 = 자료에서 따로 셈 · 주문 1127-1137 · 수익률 높은 차례 · 오름 빨강 · 내림 파랑 · 주문 1127-1244) · 업종별 조각 = 이름표 · 몫 합 100 안팎 · 단추 48 넘게 · 한 줄 알림', JSON.stringify({v0: {...g.v0, k36: g.v0.k36.slice(0, 3), kfs: Math.min(...g.v0.kfs), kh: [Math.min(...g.v0.kh), Math.max(...g.v0.kh)], kcol: g.v0.kcol.filter(x => !x || (x[0] === 'up' ? x[1] !== RED || x[2] !== RED : x[0] === 'dn' ? x[1] !== BLUE || x[2] !== BLUE : x[1] === RED || x[1] === BLUE)).slice(0, 2)}, k36W: k36W.slice(0, 3), bad: g.v0.k36.map((r, i) => (JSON.stringify(r) === JSON.stringify(k36W[i]) ? null : [i, r, k36W[i]])).filter(Boolean).slice(0, 2), v1: g.v1, segH: g.segH, ins: g.ins, insH: g.insH}).slice(0, 1500));
    // 자) 꾀마다 수익률 추이(주문 1127-1412 · 사장님 2026-11-27(서울) 14:12 「꾀별로 꺾은선 그래프를 만들어 자료를 수집한 날부터 지금까지 수익률 변화를 꺾은선 그래프로 36개 전부 다해」)
    //   그림 36 = 이름표 차례 그대로 · 이름 · 끝 수익률(모양 · 프로) = 이름표 줄과 같음(장부 날마다 셈 ↔ 산 셈 · 판 셈 · 서로 다른 길로 같은 값) · 점 수 = 그 꾀가 산 셈이 있는 날 수
    //   자료 sell.tk 를 꾀마다 모두 더하면 sell.tt(날마다 산 돈 · 값)와 같음 · 눈금 = 가장 크게 움직인 꾀에 맞춘 같은 눈금 · 글 셋 · 오름 빨강 · 내림 파랑 꺾은선 · 글 17 넘게 · 최근 수익률 추이 바로 아래
    {
      const KG = g.kgl, K = KG?.tk, TD = g.TTd ?? [], N = TD.length, nmK = new Map(g.v0.kname), j36 = new Map((K?.k ?? []).map((k, j) => [k, j]));
      const sumOk = !!K && K.k?.length === 36 && TD.every(([d, c, v], i) => K.c.reduce((a, x) => a + (x?.[i] ?? 0), 0) === c && K.v.reduce((a, x) => a + (x?.[i] ?? 0), 0) === v) && K.c.every(x => x.length === N) && K.v.every(x => x.length === N);
      const rr = k => { const j = j36.get(k); return j == null ? [] : TD.map((_, i) => { const c = K.c[j][i], v = K.v[j][i]; return Number.isFinite(c) && c > 0 && Number.isFinite(v) ? v / c - 1 : null; }); };
      const top = K ? Math.max(0, ...K36g.flatMap(k => rr(k).filter(x => x != null).map(x => Math.abs(x)))) : 0, mxW = [0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1, 2, 5, 10].find(x => x >= top) ?? Math.ceil(top);
      const pS = v => { const a = Math.round(v * 1000) / 10; return (a % 1 === 0 ? a.toFixed(0) : a.toFixed(1)) + '프로'; };
      const leadW = N ? ['서른여섯 꾀마다 처음 산 날부터 장날마다 수익률을 그렸어요. 수익률이 높은 차례예요.', '그림 서른여섯 개 모두 눈금이 같아요. 맨 위가 +' + pS(mxW) + ', 점선이 0, 맨 아래가 -' + pS(mxW) + '예요.', '가로는 ' + md(TD[0][0]) + '부터 ' + md(TD[N - 1][0]) + '까지 장날 ' + NFm.format(N) + '일이에요.', '오른 꾀는 빨강, 내린 꾀는 파랑이에요. 모두 종가로 센 가짜 돈이에요.'] : [];
      const cardW = k36W.map(([k, , , st, , rt]) => { const n = rr(k).filter(x => x != null).length; return [k, st, nmK.get(k) ?? '', rt, n, n]; });
      const colK = (KG?.cards ?? []).every((c, i) => (c[1] === 'up' ? KG.col[i] === 'rgb(211, 47, 47)' : c[1] === 'dn' ? KG.col[i] === 'rgb(21, 101, 192)' : KG.col[i] == null || (KG.col[i] !== 'rgb(211, 47, 47)' && KG.col[i] !== 'rgb(21, 101, 192)')));
      check(!!KG && KG.n === 36 && KG.prev && sumOk && Math.abs(KG.mx - mxW) < 1e-12 && JSON.stringify(KG.leads) === JSON.stringify(leadW) && JSON.stringify(KG.cards) === JSON.stringify(cardW) && colK && KG.fs.length > 36 && KG.fs.every(f => f >= 16.9),
        W + width + ' 자) 꾀마다 수익률 추이 — 꺾은선 36(이름표 차례 · 끝 수익률 = 이름표 줄 · 점 수 = 산 셈 있는 날) · 자료 꾀마다 더하면 날마다 모두와 같음 · 같은 눈금 · 오름 빨강 · 내림 파랑 · 글 17 넘게(주문 1127-1412)',
        JSON.stringify({has: !!KG, n: KG?.n, prev: KG?.prev, sumOk, mx: KG?.mx, mxW, leads: KG?.leads, leadW, bad: (KG?.cards ?? []).map((c, i) => (JSON.stringify(c) === JSON.stringify(cardW[i]) ? null : [i, c, cardW[i]])).filter(Boolean).slice(0, 2), colK, fsMin: KG ? Math.min(...KG.fs) : null}).slice(0, 1500));
    }
    const pp = r => { const v = Math.round(r * 1000) / 10; return (v > 0 ? '+' : v < 0 ? '-' : '') + Math.abs(v).toFixed(1) + '프로'; }, nM = Math.min(g.TT, 22), spWant = ['1개월', '3개월', '6개월', '1년'].map((t, j) => t + (j === 0 || g.TT - 1 > [21, 63, 126][j - 1] ? '' : '-')).join(' ');
    check(g.TT >= 2 && g.sh.length === 4 && g.sh.every(x => x >= 47.5) && g.spT === spWant && g.spOn.length === 1 && g.spOn[0] === '1개월' && +g.pathN === nM && g.dots === nM && g.last === pp(g.lastR) && Math.abs(g.lastR - (g.val / g.cost - 1)) < 1e-9 && g.ys === 3 && g.xs === 3,
      W + width + ' 다) 최근 수익률 추이 — 본보기 기간 넷(쌓인 날보다 긴 것은 못 누름) · 1개월 = 장날 ' + nM + '일 · 점 ' + nM + '개 · 끝 값 말풍선 = 총 평가 금액 셈 · 눈금 셋 · 날짜 셋 · 단추 48 넘게', JSON.stringify({TT: g.TT, sh: g.sh, spT: g.spT, spOn: g.spOn, pathN: g.pathN, dots: g.dots, last: g.last, lastR: g.lastR, ys: g.ys, xs: g.xs}));
    { // 차) 점 누르기(주문 1127-1705 · 사장님 2026-11-27(서울) 17:05 「어」 — 「꺾은선의 점을 누르면 그날 숫자가 뜨게」) — 1개월 · 처음 = 마지막 장날 · 앞 장날 단추 · 그림 맨 왼쪽 = 첫 장날 · 그날 수익률(모양 · 프로) · 늘고 준 돈 · 들인 돈 · 그날 값 = 자료에서 따로 셈 · 단추 48 넘게 · 글 17 넘게
      const wk2 = d => '일월화수목금토'[new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))).getUTCDay()], LM = (g.TTd ?? []).slice(-22);
      const pkW = j => { const [d, c, v] = LM[j], dd = v - c; return [d, md(d) + '(' + wk2(d) + ')', Math.round(dd) > 0 ? 'up' : Math.round(dd) < 0 ? 'dn' : 'eq', Math.abs(Math.round((v / c - 1) * 1000) / 10).toFixed(1) + '프로', movedM(dd), '들인 돈 ' + wonM(c) + ' · 그날 값 ' + wonM(v), j === 0, j === LM.length - 1]; };
      const pkWant = LM.length >= 2 ? [pkW(LM.length - 1), pkW(LM.length - 2), pkW(0)] : null;
      check(!!pkWant && JSON.stringify(g.pk) === JSON.stringify(pkWant) && g.pkH.length === 2 && g.pkH.every(x => x >= 47.5) && g.pkFs.length > 0 && g.pkFs.every(f => f >= 16.9),
        W + width + ' 차) 꺾은선 점 누르기 — 처음 마지막 장날 · 앞 장날 · 그림 맨 왼쪽 = 첫 장날 · 그날 수익률 · 늘고 준 돈 · 들인 돈 · 그날 값 = 자료에서 따로 셈 · 단추 48 · 글 17(주문 1127-1705)', JSON.stringify({pk: g.pk, pkWant, pkH: g.pkH, fsMin: g.pkFs.length ? Math.min(...g.pkFs) : null}).slice(0, 1500));
    }
    check(!g.segIn && g.segBefore && g.rec0 === '#/l/a' && g.tab4 === '#/l/a', W + width + ' 바) 본보기 짜임 — 나눔 고르기는 자산 칸 바로 위(칸 밖) · 기록 갈래 첫 「한눈에」 켜짐 · 아래 탭 「기록」 = #/l/a', JSON.stringify({segIn: g.segIn, segBefore: g.segBefore, rec0: g.rec0, tab4: g.tab4}));
    check(g.rows === g.nk && g.r0k === g.k0 && (!g.best0 || g.r0.startsWith('가장 많이 고른 업종은 ' + g.best0[0] + ieyo(g.best0[0]) + ' · ') && g.r0.endsWith(' 가운데 ' + NFm.format(g.best0[1]) + '번')),
      W + width + ' 라) 꾀마다 많이 고른 업종 — 꾀 줄 = 산 꾀 수 · 첫 꾀 가장 많이 고른 업종 = 자료에서 셈', JSON.stringify({rows: g.rows, nk: g.nk, r0: g.r0, best0: g.best0}));
    check(!/%|매수|매도|추천/.test(g.text) && g.red === 0 && g.fs.length > 0 && g.fs.every(f => f >= 16.9) && g.over <= 0 && !errs.length,
      W + width + ' 마) 「%」 · 매수 · 매도 · 추천 0 · 빨강 0(꾀별 수익률 오름 빨강은 사장님 말씀 · 주문 1127-1244 · 7단 들머리 오른 수익 칸 · 주문 1127-1457) · 글 17 넘게 · 넘침 0 · 오류 0', JSON.stringify({red: g.red, fsMin: Math.min(...g.fs), over: g.over, errs: errs.slice(0, 2)}));
    await ctx.close();
  }
}
{ // ㊷ 주문 1126-1249(사장님 2026-11-26(서울) 12:49 직원 바람 「첫 화면에 오늘의 꾀가 무엇인지 오늘의 주된 컨텐츠를 이미지화 시켜서 만들고 밑에 지금의 aaa처럼 여러 꾀의 내용이 정리」 · 「1시간 이내에 작업 해」) — 첫 화면 맨 위 「오늘의 꾀」 한 장
  //   main 첫째 = section.sj-hero · 넘기는 장 셋(오늘의 꾀 · 오늘 시장 · 오늘의 한 줄 — 오늘 시장을 아직 못 센 때는 둘) · 첫 장 제목 = 지금 시장 칸의 「지금 볼 꾀」(.sj-now 의 data-k 와 같은 꾀) · 「이 꾀 보기」 = #/k/{꾀} · 48 넘게
  //   옆으로 넘기면 점이 따라감 · 글 17 넘게 · 빨강 0 · 「%」 · 매수 · 매도 · 추천 0 · 가로 넘침 0 · 화면 오류 0 · 그 아래 격언 족자 · 표지 그대로 · 320 · 390
  const W = '㊷ ', KR = /^g(0[1-9]|[12]\d|3[0-6])$/, LK = ['fall', 'shake', 'rise', 'narrow', 'calm'];
  //   오늘 시장을 아직 못 센 때(장중 자료가 모자라 sun = null)에도 한 장은 늘 — 가장 최근에 적은 꾀(sunLog 마지막 줄) · 그것도 없으면 「서른여섯 꾀」 · 장은 둘(오늘의 꾀 · 오늘의 한 줄 = 격언 열 가지의 손자 말)
  const T42 = await J('/su/data/su21.json').catch(() => null), sun42 = T42?.sun, okS42 = !!sun42 && sun42.rule === 'sun-v1' && LK.includes(sun42.land) && Number.isInteger(sun42.m?.n) && sun42.m.n > 0 && Number.isInteger(sun42.m?.up) && sun42.m.up >= 0 && sun42.m.up <= sun42.m.n;
  const pk42 = okS42 ? ((sun42.win3?.ks ?? []).filter(k => KR.test(k))[0] ?? (sun42.rank ?? []).map(q => q?.k).filter(k => KR.test(k ?? ''))[0] ?? null) : null;
  const log42 = pk42 ? null : (Array.isArray(T42?.sunLog?.rows) ? T42.sunLog.rows : []).filter(q => typeof q?.day === 'string' && LK.includes(q.land) && KR.test(q.k ?? '')).at(-1) ?? null;
  const from42 = pk42 ? 'now' : log42 ? 'log' : 'none', k42 = pk42 ?? log42?.k ?? null, keys42 = from42 === 'now' ? 'kkoe land word' : 'kkoe word';
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, '#/');
    await p.waitForSelector('#su main > section.sj-hero', {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(async () => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), m = document.querySelector('#su main.sj-page[data-page="sonja"]'), hs = m?.querySelector(':scope > section.sj-hero'), tr = hs?.querySelector('.sj-herot');
      const S = [...(hs?.querySelectorAll('.sj-heros') ?? [])], go = hs?.querySelector('a.sj-herogo'), gr = go?.getBoundingClientRect(), d0 = [...(hs?.querySelectorAll('.sj-herodots > i') ?? [])].map(d => d.classList.contains('sj-heroon') ? 1 : 0).join('');
      if (tr) { tr.style.scrollBehavior = 'auto'; tr.scrollLeft = tr.clientWidth; } await new Promise(r => setTimeout(r, 300));
      const d1 = [...(hs?.querySelectorAll('.sj-herodots > i') ?? [])].map(d => d.classList.contains('sj-heroon') ? 1 : 0).join('');
      const fs = [...(hs?.querySelectorAll('.sj-herok, .sj-heroh, .sj-herop, .sj-herogo, .sj-herostamp > *') ?? [])].map(e => parseFloat(getComputedStyle(e).fontSize));
      return {first: !!m?.children[0]?.classList.contains('sj-greet') && m?.children[1] === hs, second: !!hs?.nextElementSibling?.classList.contains('sj-coday'), n: S.length, keys: S.map(s => s.dataset.slide).join(' '), from: hs?.dataset.from ?? null, sub0: txt(S[0]?.querySelector('.sj-herop')), k: hs?.dataset.k ?? null, nowK: document.querySelector('#su .sj-now')?.dataset.k ?? null,
        title0: txt(S[0]?.querySelector('.sj-heroh')), kick0: txt(S[0]?.querySelector('.sj-herok')), go: go?.getAttribute('href') ?? null, goH: gr ? Math.round(gr.height) : 0, goW: gr ? Math.round(gr.width) : 0, goTxt: txt(go), goCol: go ? getComputedStyle(go).color : '', d0, d1,
        sw: S.map(e => Math.round(e.getBoundingClientRect().width)), tw: tr ? tr.clientWidth : 0, tox: tr ? getComputedStyle(tr).overflowX : '', text: txt(hs), red: [...(hs?.querySelectorAll('*') ?? [])].filter(e => { const q = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return q && +q[1] > 170 && +q[2] < 90 && +q[3] < 90; }).length, fs, over: document.documentElement.scrollWidth - innerWidth};
    });
    const NAME = await p.evaluate(async () => (await import('/su/su-sonja-36.js')).NAME).catch(() => ({}));
    const dLog = log42 ? (+log42.day.slice(5, 7)) + '월 ' + (+log42.day.slice(8, 10)) + '일' : '';
    const goOk = from42 === 'none' ? g.go == null : g.go === '#/k/' + k42 && g.goH >= 47.5 && g.goW >= 47.5 && g.goTxt === '이 꾀 보기 ›' && g.goCol === 'rgb(255, 255, 255)';
    const subOk = from42 === 'log' ? g.sub0.includes('오늘 시장은 아직 세는 중이에요') && g.sub0.includes(dLog + '에 고른 꾀') : from42 === 'none' ? g.sub0.includes('오늘 시장 모습을 다 세면') : !g.sub0.includes('세는 중');
    check(g.first && g.second && g.from === from42 && g.keys === keys42 && g.n === keys42.split(' ').length && (from42 === 'none' ? g.k == null && g.title0 === '서른여섯 꾀' : g.k === k42 && g.title0 === NAME[k42]) && (from42 !== 'now' || g.nowK == null || g.nowK === g.k) && g.kick0 === '오늘의 꾀' && goOk && subOk,
      W + width + ' 가) 첫 화면 인사 바로 아래 오늘의 꾀 한 장(그 아래 오늘의 기업 — 주문 1126-1544) — 오늘 시장을 센 날 = 넘기는 장 셋 · 첫 장 = 지금 볼 꾀 이름 · 아직 못 센 때 = 두 장 · 첫 장 = 가장 최근에 적은 꾀(그 날짜를 밝힘) · 「이 꾀 보기」 = 그 꾀 쪽 · 48 넘게 · 그 아래 격언 족자', JSON.stringify({want: from42, from: g.from, first: g.first, second: g.second, n: g.n, keys: g.keys, k: g.k, k42, nowK: g.nowK, title0: g.title0, sub0: g.sub0.slice(0, 80), go: g.go, goH: g.goH, goTxt: g.goTxt, goCol: g.goCol}));
    check(g.n >= 2 && g.d0 === '1' + '0'.repeat(g.n - 1) && g.d1 === '01' + '0'.repeat(g.n - 2) && g.tox === 'auto' && g.tw > 0 && g.sw.every(w => Math.abs(w - g.tw) <= 1) && g.fs.length > 0 && g.fs.every(f => f >= 16.9) && g.red === 0 && !/%|매수|매도|추천/.test(g.text) && g.over <= 0 && !errs.length,
      W + width + ' 나) 옆으로 넘기면 점이 따라감 · 장마다 한 화면 폭 · 글 17 넘게 · 빨강 0 · 「%」 · 매수 · 매도 · 추천 0 · 넘침 0 · 오류 0', JSON.stringify({d0: g.d0, d1: g.d1, tox: g.tox, tw: g.tw, sw: g.sw, fsMin: Math.min(...g.fs), red: g.red, over: g.over, errs: errs.slice(0, 2)}));
    await ctx.close();
  }
}
{ // ㊸ 주문 1126-1544(사장님 2026-11-26(서울) 15:44 직원 본보기 그림 다시 보내심 — 「오늘도 성장하는 투자자예요!」 → 오늘의 핵심 키워드 → 오늘의 추천 종목 → 오늘의 투자 체크리스트) — 그림 차례 그대로 · 사이트 규칙으로만 바꿈
  //   인사 두 줄 글 그대로(「수익」 → 「실력」) · 오늘의 기업 = 오늘의 꾀(한 장의 data-k)가 고른 회사 가운데 첫째 · 이름 · 마지막 값 · 그 앞날보다 오르내린 몫(▲ ▼ · 프로) · 「›」 = 그 회사 쪽 · 48 넘게 · 사라고 권하지 않는다는 말
  //   자료가 없으면 까닭 한 줄(억지로 채우지 않음) · 투자 점검 셋 글 그대로(체크리스트 → 점검 · 매수 → 사지) · 누르면 표시 · 다시 열어도 그날은 남음 · 다시 누르면 지움 · 줄 48 넘게 · 글 17 넘게 · 빨강 0 · 「%」 · 매수 · 매도 · 추천 0 · 넘침 0 · 오류 0 · 320 · 390
  const W = '㊸ ', KR = /^g(0[1-9]|[12]\d|3[0-6])$/;
  const T43 = await J('/su/data/su21.json').catch(() => null), G43 = await J('/su/data/su21-s36.json').catch(() => null);
  const ok43 = !!G43 && G43.schema === 'su21-s36-1' && Array.isArray(G43.kinds) && G43.kinds.length === 36 && !!G43.lists && typeof G43.lists === 'object' && G43.asOf?.board === T43?.asOf?.board && G43.kinds.every(k => (G43.lists[k] ?? []).length === T43?.s36n?.[k]);
  const TODO = ['시장 흐름 확인하기', '내 투자 회사 점검하기', '무리하게 사지 않기'];
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, '#/');
    await p.waitForFunction(() => { const s = document.querySelector('#su main > section.sj-coday'); return !!s && !s.hasAttribute('data-wait'); }, null, {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => {
      const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), m = document.querySelector('#su main.sj-page[data-page="sonja"]'), K = m ? [...m.children] : [];
      const gr = m?.querySelector(':scope > section.sj-greet'), hs = m?.querySelector(':scope > section.sj-hero'), cd = m?.querySelector(':scope > section.sj-coday'), td = m?.querySelector(':scope > section.sj-todo');
      const go = cd?.querySelector('a.sj-cdgo'), r = go?.getBoundingClientRect(), bs = [...(td?.querySelectorAll('button.sj-tdb') ?? [])];
      const fs = [...(m?.querySelectorAll('.sj-greet p, .sj-greet span, .sj-cdh, .sj-cdn, .sj-cdname, .sj-cdwon, .sj-cdchg, .sj-cdsub, .sj-cdwhy, .sj-tdh, .sj-tdt, .sj-tdn') ?? [])].map(e => parseFloat(getComputedStyle(e).fontSize));
      const all = [gr, cd, td].filter(Boolean);
      return {at: [0, 1, 2, 3].map(i => K[i]?.classList.contains(['sj-greet', 'sj-hero', 'sj-coday', 'sj-todo'][i]) ? 1 : 0).join(''), k: hs?.dataset.k ?? null, cdk: cd?.dataset.k ?? null,
        g1: [...(gr?.querySelectorAll('.sj-grh > span') ?? [])].map(txt), g2: txt(gr?.querySelector('.sj-grs')),
        h2: txt(cd?.querySelector('.sj-cdh')), wait: cd?.hasAttribute('data-wait') ?? null, code: cd?.dataset.code ?? null, name: txt(cd?.querySelector('.sj-cdname')), won: txt(cd?.querySelector('.sj-cdwon')), chg: txt(cd?.querySelector('.sj-cdchg')),
        chgM: cd?.querySelector('.sj-cdchg')?.dataset.m ?? null, logo: txt(cd?.querySelector('.sj-cdlogo')), sub: txt(cd?.querySelector('.sj-cdsub')), why: txt(cd?.querySelector('.sj-cdwhy')), note: txt(cd?.querySelector('.sj-cdn')),
        go: go?.getAttribute('href') ?? null, goH: r ? Math.round(r.height) : 0, goW: r ? Math.round(r.width) : 0, goL: go?.getAttribute('aria-label') ?? '',
        th: txt(td?.querySelector('.sj-tdh')), items: bs.map(b => txt(b.querySelector('.sj-tdt'))), pressed: bs.map(b => b.getAttribute('aria-pressed')).join(','), bh: bs.map(b => Math.round(b.getBoundingClientRect().height)),
        text: all.map(txt).join(' '), fs, red: all.flatMap(e => [...e.querySelectorAll('*')]).filter(e => { const q = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return q && +q[1] > 170 && +q[2] < 90 && +q[3] < 90; }).length, over: document.documentElement.scrollWidth - innerWidth};
    });
    const L = ok43 && KR.test(g.k ?? '') ? G43.lists[g.k] : null, c0 = Array.isArray(L) ? L.find(c => /^\d{6}$/.test(String(c?.code ?? '')) && typeof c?.name === 'string' && c.name.trim()) ?? null : null;
    const ln = c0 ? G43.line?.[c0.code] : null, cs = Array.isArray(ln?.c) ? ln.c.filter(v => Number.isFinite(v) && v > 0) : [], close = Number.isFinite(ln?.close) && ln.close > 0 ? ln.close : cs.at(-1) ?? null, prev = cs.length >= 2 ? cs.at(-2) : null;
    const v = close && prev ? close / prev - 1 : null, wantWon = close ? Math.round(close).toLocaleString('ko-KR') + '원' : null, wantChg = v == null ? '' : (v > 0 ? '▲ ' : v < 0 ? '▼ ' : '― ') + Math.abs(Math.round(v * 1000) / 10).toFixed(1) + '프로';
    const NAME = await p.evaluate(async () => (await import('/su/su-sonja-36.js')).NAME).catch(() => ({}));
    const wantNote = !KR.test(g.k ?? '') ? '오늘의 꾀가 정해지면 그 꾀가 고른 회사를 여기에 보여 드려요.' : !ok43 ? '꾀가 고른 회사 자료가 아직 없어요. 억지로 채우지 않았어요.' : '오늘 이 꾀가 고른 회사가 없어요. 억지로 채우지 않았어요.';
    const cdOk = g.wait === false && g.h2 === '오늘의 기업' && g.cdk === g.k && (c0 && close
      ? g.code === c0.code && g.name === c0.name.trim() && g.logo === c0.name.trim().slice(0, 1) && g.won === wantWon && g.chg === wantChg && (v == null || g.chgM === (v > 0 ? 'up' : v < 0 ? 'dn' : 'eq'))
        && g.go === '#/c/' + c0.code && g.goH >= 47.5 && g.goW >= 47.5 && g.goL === c0.name.trim() + ' 자세히 보기' && /마지막 값/.test(g.sub) && g.why === '「' + NAME[g.k] + '」 꾀가 고른 회사 가운데 첫째예요. 사고팔기를 권하지 않아요.'
      : g.code == null && g.go == null && g.note === wantNote);
    check(g.at === '1111' && JSON.stringify(g.g1) === JSON.stringify(['오늘도', '성장하는 투자자예요!']) && g.g2 === '꾸준한 공부가 실력을 만듭니다' && cdOk,
      W + width + ' 가) 본보기 차례 — 인사 두 줄 → 오늘의 꾀 → 오늘의 기업(오늘의 꾀가 고른 첫 회사 · 이름 · 마지막 값 · 오르내린 몫 · 「›」 = 그 회사 쪽 · 48 넘게 · 권하지 않는다는 말 · 자료가 없으면 까닭 한 줄)',
      JSON.stringify({at: g.at, g1: g.g1, g2: g.g2, k: g.k, cdk: g.cdk, wait: g.wait, want: c0 ? [c0.code, c0.name, wantWon, wantChg] : wantNote, got: [g.code, g.name, g.won, g.chg, g.chgM, g.logo, g.go, g.goH, g.goW, g.why.slice(0, 40), g.note]}));
    // 투자 점검 — 누르면 표시 · 다시 열어도 그날은 남음 · 다시 누르면 지움
    const b0 = '#su main > section.sj-todo li:nth-child(1) > button.sj-tdb';
    const p0 = g.pressed; await p.click(b0).catch(() => {}); await p.waitForTimeout(150);
    const p1 = await p.evaluate(() => [...document.querySelectorAll('#su main > section.sj-todo button.sj-tdb')].map(b => b.getAttribute('aria-pressed')).join(','));
    await p.reload({waitUntil: 'networkidle'}).catch(() => {}); await p.waitForSelector('#su main > section.sj-todo button.sj-tdb', {timeout: 15000}).catch(() => {});
    const p2 = await p.evaluate(() => [...document.querySelectorAll('#su main > section.sj-todo button.sj-tdb')].map(b => b.getAttribute('aria-pressed')).join(','));
    await p.click(b0).catch(() => {}); await p.waitForTimeout(150);
    const p3 = await p.evaluate(() => [...document.querySelectorAll('#su main > section.sj-todo button.sj-tdb')].map(b => b.getAttribute('aria-pressed')).join(','));
    check(g.th === '오늘의 투자 점검' && JSON.stringify(g.items) === JSON.stringify(TODO) && p0 === 'false,false,false' && p1 === 'true,false,false' && p2 === 'true,false,false' && p3 === 'false,false,false' && g.bh.length === 3 && g.bh.every(x => x >= 47.5),
      W + width + ' 나) 오늘의 투자 점검 — 글 셋 그대로(체크리스트 → 점검 · 매수 → 사지) · 누르면 표시 · 다시 열어도 그날은 남음 · 다시 누르면 지움 · 줄 48 넘게', JSON.stringify({th: g.th, items: g.items, p0, p1, p2, p3, bh: g.bh}));
    check(g.fs.length > 0 && g.fs.every(f => f >= 16.9) && g.red === 0 && !/%|매수|매도|추천/.test(g.text) && g.over <= 0 && !errs.length,
      W + width + ' 다) 인사 · 오늘의 기업 · 투자 점검 — 글 17 넘게 · 빨강 0 · 「%」 · 매수 · 매도 · 추천 0 · 넘침 0 · 오류 0', JSON.stringify({fsMin: Math.min(...g.fs), red: g.red, over: g.over, bad: (/%|매수|매도|추천/.exec(g.text) ?? [null])[0], errs: errs.slice(0, 2)}));
    await ctx.close();
  }
}
{ // ㊹ 주문 1127-1457(사장님 2026-11-27(서울) 14:57 「그리고 기록을 누르면 어떤 종목들 매매했고 얼마에 사서 얼마에 매도해서 얼마 수익났는지도 하고 7단 클릭 구조로 만들어」) — 7단 사고판 기록
  //   한눈에 맨 위 = 7단 들머리(판 것 · 들고 있는 것 · 번 · 산 돈 → 판 돈/지금 · 수익률 · 늘고 준 돈 = 이 검사가 정산 자료에서 따로 셈) · #/l/t/s 부터 한 단씩 첫 줄을 눌러 7단까지
  //   단마다 줄 = 따로 묶은 것과 같음(꾀 · 업종 · 종목 · 사고판 건 · 합) · 수익률 높은 차례(6단은 산 날 늦은 차례) · 7단 한 건 = 회사 · 꾀 · 업종 · 산 날 · 산 값 · 산 돈 · 판 날 · 판 값 · 판 돈 · 들고 있은 날 · 수익
  //   일곱 단 길(지금 단 · 앞 단 고리) · 누르는 곳 48 넘게 · 글 17 넘게 · 「%」 · 매수 · 매도 · 추천 0 · 빨강은 오른 수익 칸만 · 넘침 0 · 오류 0 · 390 · 320
  const W = '㊹ ', D44 = await J('/su/data/su21-settle.json').catch(() => null), KR44 = /^g(0[1-9]|[12]\d|3[0-6])$/, q44 = Number.isFinite(D44?.qty) ? D44.qty : 10;
  const T44 = []; (D44?.buys ?? []).forEach((b, i) => { const x = D44?.sell?.s?.[i], k = D44?.kinds?.[b[1]]; if (!Array.isArray(b) || !Array.isArray(x) || !KR44.test(k ?? '') || !(b[3] > 0) || !(x[2] > 0)) return; T44.push({i, k, code: b[2], d0: b[0], p0: b[3], how: x[0], d1: x[1], p1: x[2], days: x[3]}); });
  const ind44 = c => (typeof D44?.co?.[c]?.[1] === 'string' && D44.co[c][1].trim()) || '그 밖 업종', co44 = c => D44?.co?.[c]?.[0] ?? c;
  const sum44 = L => { const c = L.reduce((a, t) => a + t.p0 * q44, 0), v = L.reduce((a, t) => a + t.p1 * q44, 0); return {n: L.length, c, v, d: v - c, r: c > 0 ? v / c - 1 : 0}; };
  const rT44 = r => Math.abs(Math.round(r * 1000) / 10).toFixed(1) + '프로', st44 = d => (Math.round(d) > 0 ? 'up' : Math.round(d) < 0 ? 'dn' : 'eq');
  const mtx44 = (m, held) => NFm.format(m.n) + '번 · 산 돈 ' + wonM(m.c) + ' → ' + (held ? '지금 ' : '판 돈 ') + wonM(m.v), md44 = d => +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일';
  const rowW = (href, m, held) => [href, mtx44(m, held), st44(m.d), rT44(m.r), movedM(m.d)];
  const SOLD = T44.filter(t => t.how !== 'h'), HELD = T44.filter(t => t.how === 'h');
  const grp44 = (L, key) => { const m = new Map(); for (const t of L) { const k = key(t); if (!m.has(k)) m.set(k, []); m.get(k).push(t); } return [...m.entries()].map(([k, G]) => [k, sum44(G)]); };
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const look = () => p.evaluate(() => { const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), S = document.querySelector('#su section.sj-wk'), main = document.querySelector('#su main');
      const rows = [...(S?.querySelectorAll('ol.sj-wkl a.sj-wkrow') ?? [])].map(a => [a.getAttribute('href'), txt(a.querySelector('.sj-wkm')), a.querySelector('.sj-wkg')?.dataset.st ?? '', txt(a.querySelector('.sj-wkg > b')), txt(a.querySelector('.sj-wkg > .sj-wkgm')), txt(a.querySelector('.sj-wkt > b'))]);
      const path = [...(S?.querySelectorAll('ol.sj-wkp > li') ?? [])].map(li => [li.className, !!li.querySelector('a'), txt(li)]);
      const taps = [...(S?.querySelectorAll('a.sj-wkrow, ol.sj-wkp a, a.sj-wkback') ?? [])].map(a => a.getBoundingClientRect().height);
      const fs = [...(S?.querySelectorAll('*') ?? [])].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize));
      const red = [...(main?.querySelectorAll('*') ?? [])].filter(e => { if (e.closest('.sj-wkg[data-st="up"]') || e.closest('.sj-glkr')) return false; const m = /rgba?\((\d+), (\d+), (\d+)/.exec(getComputedStyle(e).color); return m && +m[1] > 170 && +m[2] < 90 && +m[3] < 90; }).length;
      const upC = [...(S?.querySelectorAll('.sj-wkg[data-st="up"] > b') ?? [])].map(e => getComputedStyle(e).color), dnC = [...(S?.querySelectorAll('.sj-wkg[data-st="dn"] > b') ?? [])].map(e => getComputedStyle(e).color);
      return {hash: location.hash, page: main?.dataset.page, lv: S?.dataset.lv ?? null, first: main?.firstElementChild === S, h1: txt(S?.querySelector('.sj-wkh1')), rows, path, taps, fs, red, upC, dnC,
        dl: [...(S?.querySelectorAll('dl.sj-wkdl > *') ?? [])].map(txt), big: S?.querySelector('.sj-wkbig .sj-wkg') ? [S.querySelector('.sj-wkbig .sj-wkg').dataset.st, txt(S.querySelector('.sj-wkbig .sj-wkg > b')), txt(S.querySelector('.sj-wkbig .sj-wkgm'))] : null,
        text: txt(main), over: document.documentElement.scrollWidth - innerWidth}; });
    // 1 · 2단 — 한눈에 맨 위 들머리
    await open(p, '#/l/a'); await p.waitForSelector('#su section.sj-wkin', {timeout: 20000}).catch(() => {});
    const g0 = await look(), want0 = [rowW('#/l/t/s', sum44(SOLD), false), rowW('#/l/t/h', sum44(HELD), true)];
    check(g0.first && g0.lv === '1' && JSON.stringify(g0.rows.map(r => r.slice(0, 5))) === JSON.stringify(want0) && g0.rows.map(r => r[5]).join(' ') === '판 것 들고 있는 것' && g0.taps.every(h => h >= 47.5) && !errs.length,
      W + width + ' 가) 기록을 누르면(한눈에 맨 위) 7단 들머리 — 판 것 · 들고 있는 것(번 · 산 돈 → 판 돈 · 지금 · 수익률 · 늘고 준 돈 = 자료에서 따로 셈)', JSON.stringify({first: g0.first, lv: g0.lv, rows: g0.rows, want0, errs: errs.slice(0, 2)}).slice(0, 1500));
    // 3단 → 7단 — 단마다 첫 줄을 누름(판 것 길)
    const seen = [], segs = ['s']; let L = SOLD, ok = true, why = '';
    const levels = [[t => t.k, k => k], [t => ind44(t.code), x => x], [t => t.code, c => c]];
    for (let lv = 3; lv <= 7; lv++) {
      await open(p, '#/l/t/' + segs.map(encodeURIComponent).join('/')); await p.waitForSelector('#su section.sj-wk', {timeout: 20000}).catch(() => {});
      const g = await look(); seen.push({lv: g.lv, h1: g.h1, n: g.rows.length, taps: g.taps.length ? Math.min(...g.taps) : null, fs: g.fs.length ? Math.min(...g.fs) : null, over: g.over, red: g.red});
      const pathOk = g.path.length === 7 && g.path.every((x, i) => (i + 1 < lv ? x[0] === 'sj-wkdone' && x[1] : i + 1 === lv ? x[0] === 'sj-wkon' && !x[1] : x[0] === 'sj-wknext' && !x[1])) && g.path[lv - 1][2].startsWith(lv + '단 ');
      const tapOk = g.taps.every(h => h >= 47.5), fsOk = g.fs.every(f => f >= 16.9), colOk = g.upC.every(c => c === 'rgb(211, 47, 47)') && g.dnC.every(c => c === 'rgb(21, 101, 192)');
      const base = !/%|매수|매도|추천/.test(g.text) && g.red === 0 && g.over <= 0 && g.page === 'walk' && g.lv === String(lv) && pathOk && tapOk && fsOk && colOk;
      if (lv <= 5) { // 꾀 · 업종 · 종목 — 묶음 = 따로 묶은 것 · 수익률 높은 차례
        const [key] = levels[lv - 3], G = grp44(L, key), byK = new Map(G.map(([k, m]) => [k, m]));
        const hrefK = r => { const s = r[0].split('/'); try { return decodeURIComponent(s[s.length - 1]); } catch { return s[s.length - 1]; } };
        const rowsOk = g.rows.length === G.length && g.rows.every(r => { const m = byK.get(hrefK(r)); return !!m && JSON.stringify(r.slice(1, 5)) === JSON.stringify(rowW('', m, false).slice(1)); }) && g.rows.every((r, i) => !i || byK.get(hrefK(g.rows[i - 1])).r >= byK.get(hrefK(r)).r - 1e-12);
        if (!(base && rowsOk)) { ok = false; why = why || JSON.stringify({lv, base, pathOk, tapOk, fsOk, colOk, red: g.red, rows: g.rows.slice(0, 2), G: G.slice(0, 2).map(([k, m]) => rowW(k, m, false))}).slice(0, 900); }
        const pick = g.rows[0] ? hrefK(g.rows[0]) : null; if (pick == null) { ok = false; why = why || 'no rows lv ' + lv; break; }
        segs.push(pick); L = L.filter(t => key(t) === pick);
      } else if (lv === 6) { // 사고판 건 — 산 날 늦은 차례(같으면 산 셈 차례)
        const LL = [...L].sort((a, b) => b.d0.localeCompare(a.d0) || a.i - b.i), want = LL.map(t => ['#/l/t/' + [...segs, String(t.i)].map(encodeURIComponent).join('/'), ...rowW('', sum44([t]), false).slice(1)]);
        const rowsOk = JSON.stringify(g.rows.map(r => r.slice(0, 5))) === JSON.stringify(want);
        if (!(base && rowsOk)) { ok = false; why = why || JSON.stringify({lv, base, pathOk, rows: g.rows.slice(0, 2), want: want.slice(0, 2)}).slice(0, 900); }
        segs.push(String(LL[0]?.i)); L = LL.slice(0, 1);
      } else { // 7단 한 건
        const t = L[0], m = sum44([t]), dlW = ['회사', co44(t.code) + ' · ' + t.code, '꾀 · 업종', null, '산 날 · 산 값', md44(t.d0) + ' · 한 주 ' + wonM(t.p0), '산 돈', wonM(t.p0 * q44) + '(' + q44 + '주)', '판 날 · 판 값', md44(t.d1) + ' · 한 주 ' + wonM(t.p1), '판 돈', wonM(t.p1 * q44) + '(' + q44 + '주)'];
        const dlOk = g.dl.length === 14 && dlW.every((x, i) => x == null || g.dl[i] === x) && g.dl[3].endsWith(' · ' + ind44(t.code)) && g.dl[12] === '들고 있은 날' && g.dl[13].startsWith(t.days + '일 · ') && JSON.stringify(g.big) === JSON.stringify([st44(m.d), rT44(m.r), movedM(m.d)]);
        if (!(base && dlOk)) { ok = false; why = why || JSON.stringify({lv, base, pathOk, dl: g.dl, dlW, big: g.big}).slice(0, 900); }
      }
    }
    check(ok && !errs.length, W + width + ' 나) 3단 꾀 → 4단 업종 → 5단 종목 → 6단 사고판 건 → 7단 한 건 — 단마다 줄 = 따로 묶은 것 · 수익률 높은 차례 · 한 건 = 산 날 · 산 값 · 판 날 · 판 값 · 수익 · 일곱 단 길 · 48 · 17 · 빨강 · 파랑 · 「%」 · 매수 · 매도 0',
      (why || JSON.stringify(seen)).slice(0, 1500) + ' ' + JSON.stringify(errs.slice(0, 2)));
    await ctx.close();
  }
}
{ // ㊺ 주문 1127-1714(사장님 2026-11-27(서울) 17:14 「손자 병법 전체를 … 정리 정돈 … 머스크라면 … 효율적인 구조로 … 에이전트 100개」) — 첫 정리: 긴 줄 접기
  //   일꾼 100명이 모은 첫 정리 = 「위 일곱 펼침 · 나머지 서랍」 한 틀 — 꾀 모음 #/k 36줄 · 회사 모음 #/o · 정산 #/r/t 꾀마다 36줄은 위 일곱만 보이고, 장부 #/l 날짜별 펼친 날은 앞 스무 줄만 보임
  //   줄은 한 목록 그대로(줄 수 = 자료 수 · 지우지 않음) · 단추 글(「8등부터 36등까지 더 보기」 · 「나머지 13곳 더 보기」 · 「8번째부터 36번째까지 더 보기」 · 「나머지 N줄 더 보기」) · 누르면 모두 보임 · 「다시 접기」 · 다시 누르면 접힘
  //   누르는 곳 48 넘게 · 글 17 넘게 · 가로 넘침 0 · 오류 0 · 390 · 320
  const W = '㊺ ', FOLDS = [['#/k', 'section.sj-krank ol.sj-krl', 7, /^8등부터 (\d+)등까지 더 보기$/, 'all'], ['#/o', 'section.sj-pks ol.sj-pkl', 7, /^나머지 (\d+)곳 더 보기$/, 'left'],
    ['#/r/t', 'section.sj-st36 ol.sj-stl', 7, /^8번째부터 (\d+)번째까지 더 보기$/, 'all'], ['#/l', 'section.sj-ldf details.sj-ldd[open] > ol.sj-ldl', 20, /^나머지 (\d+)줄 더 보기$/, 'left']];
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const look = sel => p.evaluate(sel => { const ol = document.querySelector('#su ' + sel); if (!ol) return null;
      const lis = [...ol.children], b = ol.id ? document.querySelector('#su button.sj-f7b[aria-controls="' + ol.id + '"]') : null, r = b?.getBoundingClientRect();
      return {id: ol.id, n: lis.length, li: lis.every(e => e.tagName === 'LI'), vis: lis.filter(e => e.getBoundingClientRect().height > 0).length, fold: ol.getAttribute('data-fold'), open: ol.hasAttribute('data-open'),
        b: b ? {t: (b.textContent ?? '').trim(), h: Math.round(r.height), fs: parseFloat(getComputedStyle(b).fontSize), ex: b.getAttribute('aria-expanded'), dn: +b.getAttribute('data-n'), after: ol.nextElementSibling === b} : null,
        wide: document.documentElement.scrollWidth <= innerWidth + 1}; }, sel);
    const seen = []; let ok = true, why = '';
    for (const [hh, sel, n0, sayRe, cnt] of FOLDS) {
      await open(p, hh); await p.waitForTimeout(400);
      const a = await look(sel); let good = !!a && a.li && a.wide;
      if (good && a.n <= n0) good = a.vis === a.n && !a.b && a.fold == null; // 줄이 적은 날은 접지 않음
      else if (good) {
        const m = sayRe.exec(a.b?.t ?? ''), want = cnt === 'all' ? a.n : a.n - n0;
        good = a.fold === String(n0) && !a.open && a.vis === n0 && !!a.b && a.b.after && a.b.ex === 'false' && a.b.dn === a.n - n0 && a.b.h >= 48 && a.b.fs >= 16.95 && !!m && +m[1] === want;
        if (good) { await p.click('#su button.sj-f7b[aria-controls="' + a.id + '"]'); await p.waitForTimeout(250); const b2 = await look(sel);
          good = !!b2 && b2.open && b2.vis === b2.n && b2.n === a.n && b2.b?.t === '다시 접기' && b2.b?.ex === 'true' && b2.wide;
          await p.click('#su button.sj-f7b[aria-controls="' + a.id + '"]'); await p.waitForTimeout(250); const c2 = await look(sel);
          good = good && !!c2 && !c2.open && c2.vis === n0 && c2.b?.t === a.b.t && c2.b?.ex === 'false';
          seen.push([hh, a.n, a.vis, a.b.t, b2?.vis, c2?.vis]); }
      }
      if (!a || a.n > n0 || !good) seen.push([hh, a ? [a.n, a.vis, a.fold, a.b] : null]);
      if (!good) { ok = false; why = why || JSON.stringify({hh, a}).slice(0, 700); }
    }
    check(ok && !errs.length, W + width + ' 가) 첫 정리 — 꾀 모음 · 회사 모음 · 정산 꾀마다 = 위 일곱만 보임 · 장부 날짜별 펼친 날 = 앞 스무 줄 · 줄은 한 목록 그대로 · 「더 보기」 단추 글 · 누르면 모두 · 「다시 접기」 · 48 · 17 · 넘침 0 · 오류 0',
      (why || JSON.stringify(seen)).slice(0, 1500) + ' ' + JSON.stringify(errs.slice(0, 2)));
    await ctx.close();
  }
}
{ // ㊻ 주문 1127-1922(사장님 2026-11-27(서울) 19:22 「어 그렇게 해」 — 「다음 정리 다섯 가지도 같은 틀로 이어서 할까요?」의 답) — 다음 정리(같은 틀 「위 일곱 · 나머지는 더 보기 · 서랍」)
  //   ① 장부 #/l 거르개 = 「보기」 셋만 펼침 · 기간 · 결과 · 차례 열다섯은 서랍 「거르개 더 보기 — 기간 · 결과 · 차례」(닫힘) · 고른 것 한 줄은 늘 보임
  //   ② 산 회사 #/l/b · 판 회사 #/l/s = 처음 일곱 줄(「더 보기」마다 서른 — 검사 ㊱ 쪽에서 줄 값까지 맞댐) · ③ 한눈에 #/l/a 꾀마다 많이 고른 업종 = 위 일곱 + 「나머지 꾀 N가지 더 보기」
  //   ⑤ 정산 #/r/t 이렇게 사고 팔아요 = 네 걸음은 펼침 · 꾀마다 파는 날과 실제 보기는 서랍(닫힘) · 누르는 곳 48 · 글 17 · 넘침 0 · 오류 0 · 390 · 320
  const W = '㊻ ';
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const seen = {}; let ok = true, why = '';
    const sumOf = sel => p.evaluate(sel => { const d = document.querySelector('#su ' + sel), sm = d?.querySelector(':scope > summary'), r = sm?.getBoundingClientRect();
      return d ? {open: d.open, t: (sm?.querySelector('.sj-s1')?.textContent ?? '').trim(), h: Math.round(r?.height ?? 0), fs: parseFloat(getComputedStyle(sm.querySelector('.sj-s1')).fontSize), wide: document.documentElement.scrollWidth <= innerWidth + 1} : null; }, sel);
    // ① 장부 거르개
    await open(p, '#/l'); await p.waitForTimeout(300);
    const a = await p.evaluate(() => { const f = document.querySelector('#su section.sj-ldf'), d = f?.querySelector(':scope > details.sj-ldfmore'), vis = e => e.getBoundingClientRect().height > 0;
      const out = [...(f?.querySelectorAll(':scope > .sj-ldfg button.sj-ldchip') ?? [])], inn = [...(d?.querySelectorAll('button.sj-ldchip') ?? [])];
      return {d: !!d, out: out.map(b => b.dataset.g), outVis: out.filter(vis).length, inn: [...new Set(inn.map(b => b.dataset.g))], innN: inn.length, sumVis: vis(f?.querySelector('p.sj-ldsum') ?? document.body) && (f?.querySelector('p.sj-ldsum')?.textContent ?? '').length > 0, resetVis: !!f?.querySelector('button.sj-ldreset') && vis(f.querySelector('button.sj-ldreset'))}; });
    const a2 = await sumOf('section.sj-ldf > details.sj-ldfmore'); seen.l = [a, a2];
    if (!(a.d && JSON.stringify(a.out) === JSON.stringify(['view', 'view', 'view']) && a.outVis === 3 && JSON.stringify(a.inn) === JSON.stringify(['span', 'res', 'sort']) && a.innN === 15 && a.sumVis && a.resetVis
      && a2 && !a2.open && a2.t === '거르개 더 보기 — 기간 · 결과 · 차례' && a2.h >= 48 && a2.fs >= 16.95 && a2.wide)) { ok = false; why = why || 'l ' + JSON.stringify(seen.l); }
    // ② 산 회사 · 판 회사 처음 일곱
    for (const hh of ['#/l/b', '#/l/s']) { await open(p, hh); await p.waitForTimeout(300);
      const b = await p.evaluate(() => { const sec = document.querySelector('#su section.sj-tr'); return {n: +(sec?.dataset.n ?? -1), rows: sec?.querySelectorAll('ol.sj-trl0 > li.sj-trow').length ?? -1}; });
      seen[hh] = b; if (!(b.n >= 0 && b.rows === Math.min(7, b.n))) { ok = false; why = why || hh + ' ' + JSON.stringify(b); } }
    // ③ 한눈에 꾀마다 많이 고른 업종
    await open(p, '#/l/a'); await p.waitForTimeout(400);
    const lk = () => p.evaluate(() => { const ol = document.querySelector('#su section.sj-glkk ol.sj-glks'); if (!ol) return null; const lis = [...ol.children], b = ol.id ? document.querySelector('#su button.sj-f7b[aria-controls="' + ol.id + '"]') : null, r = b?.getBoundingClientRect();
      return {id: ol.id, n: lis.length, vis: lis.filter(e => e.getBoundingClientRect().height > 0).length, fold: ol.getAttribute('data-fold'), b: b ? {t: (b.textContent ?? '').trim(), h: Math.round(r.height), fs: parseFloat(getComputedStyle(b).fontSize), ex: b.getAttribute('aria-expanded')} : null}; });
    const c = await lk(); let c2 = null, c3 = null;
    if (c && c.n > 7) { await p.click('#su button.sj-f7b[aria-controls="' + c.id + '"]'); await p.waitForTimeout(250); c2 = await lk(); await p.click('#su button.sj-f7b[aria-controls="' + c.id + '"]'); await p.waitForTimeout(250); c3 = await lk(); }
    seen.a = [c, c2?.vis, c3?.vis];
    if (!(c && (c.n <= 7 ? c.vis === c.n && !c.b : c.fold === '7' && c.vis === 7 && c.b?.t === '나머지 꾀 ' + (c.n - 7) + '가지 더 보기' && c.b.h >= 48 && c.b.fs >= 16.95 && c.b.ex === 'false'
      && c2?.vis === c.n && c2?.b?.t === '다시 접기' && c3?.vis === 7))) { ok = false; why = why || 'a ' + JSON.stringify(seen.a); }
    // ⑤ 정산 이렇게 사고 팔아요
    await open(p, '#/r/t'); await p.waitForTimeout(400);
    const e = await p.evaluate(() => { const x = document.querySelector('#su section.sj-svx'), d = x?.querySelector(':scope > details.sj-svmore'), vis = el => !!el && el.getBoundingClientRect().height > 0;
      return {d: !!d, steps: x?.querySelectorAll(':scope > ol.sj-svstep > li').length ?? 0, stepVis: vis(x?.querySelector(':scope > ol.sj-svstep')), days: !!d?.querySelector('.sj-svdays'), ex: !!d?.querySelector('ol.sj-svexs, p.sj-svnote'), daysVis: !d?.querySelector('.sj-svdays')?.closest('details:not([open])')}; }); // 닫힌 서랍 안 = 안 보임(크기 대신 닫힘으로 잼)
    const e2 = await sumOf('section.sj-svx > details.sj-svmore'); seen.t = [e, e2];
    if (!(e.d && e.steps > 0 && e.stepVis && e.days && e.ex && !e.daysVis && e2 && !e2.open && e2.t === '꾀마다 파는 날과 실제 보기' && e2.h >= 48 && e2.fs >= 16.95 && e2.wide)) { ok = false; why = why || 't ' + JSON.stringify(seen.t); }
    check(ok && !errs.length, W + width + ' 가) 다음 정리 — 장부 거르개 열다섯 서랍 · 산 회사 · 판 회사 처음 일곱 · 한눈에 꾀마다 업종 위 일곱 · 정산 파는 날과 실제 보기 서랍 · 48 · 17 · 넘침 0 · 오류 0',
      (why || JSON.stringify(seen)).slice(0, 1500) + ' ' + JSON.stringify(errs.slice(0, 2)));
    await ctx.close();
  }
}
{ // ㊼ 주문 1127-2155(사장님 2026-11-27(서울) 21:55 「여기를 클릭하면 어떤 종목을 매수 매도 했고 지금 보유하고 있는 종목들이 나오게 하고 언제 사고 얼마에 사서 얼마가 됐는지 그리고 꺾은선 그래프로 나오게 하고 수익이 높은 순으로 배열해라」)
  //   한눈에 꾀 줄 서른여섯 = 줄 전체가 누르는 곳(#/l/k/꾀 · 48 넘게) · 누르면 그 꾀 쪽 — 이 검사가 정산 자료(su21-settle.json)에서 따로 셈:
  //   판 것 · 들고 있는 것 수 · 산 돈 · 판 돈과 지금 값 · 수익률 · 늘고 준 돈 · 줄 = 수익률 높은 차례(같으면 늘어난 돈 · 산 날 늦은 차례) · 줄마다 회사 · 산 날 · 산 값 · 판 날 · 판 값(들고 있으면 종가) · 변동 · 늘고 준 돈
  //   꺾은선 = 이 꾀 날마다 수익률(점 수 · 끝 오름 빨강 · 내림 파랑) · 위 일곱 + 「나머지 N개 더 보기」 · 48 · 17 · 넘침 0 · 오류 0 · 390 · 320
  const W = '㊼ ', D = await J('/su/data/su21-settle.json').catch(() => null), SV = D?.sell, q = Number.isFinite(D?.qty) ? D.qty : 10, KR = /^g(0[1-9]|[12]\d|3[0-6])$/;
  const pct = r => { const v = Math.round(r * 1000) / 10; return v > 0 ? v.toFixed(1) + '프로 올랐어요' : v < 0 ? (-v).toFixed(1) + '프로 내렸어요' : '그대로예요'; };
  const rT = r => Math.abs(Math.round(r * 1000) / 10).toFixed(1) + '프로';
  const T = []; (D?.buys ?? []).forEach((b, i) => { const x = SV?.s?.[i], k = D?.kinds?.[b?.[1]]; if (!Array.isArray(b) || !Array.isArray(x) || !KR.test(k ?? '') || !(b[3] > 0) || !(x[2] > 0)) return;
    T.push({i, k, code: b[2], co: D.co?.[b[2]]?.[0] ?? b[2], d0: b[0], p0: b[3], how: x[0], d1: x[1], p1: x[2], days: x[3], n: SV.days?.[k], diff: (x[2] - b[3]) * q, r: x[2] / b[3] - 1}); });
  const rowW = t => { const sold = t.how !== 'h'; return {co: t.co, l: ['산 날 ' + mdM(t.d0) + ' · 산 값 ' + wonM(t.p0), sold ? '판 날 ' + mdM(t.d1) + ' · 판 값 ' + wonM(t.p1) : mdM(t.d1) + ' 종가 ' + wonM(t.p1),
    (sold ? '들고 있은 날 ' : '들고 있는 날 ') + t.days + '일 · ' + (sold ? (t.how === 'c' ? '88원 줄 밑으로 내려 팔았어요' : '정한 날(' + t.n + '일째)에 팔았어요') : '정한 날(' + t.n + '일째)까지 ' + Math.max(0, t.n - t.days) + '일')], r: pct(t.r), m: movedM(t.diff)}; };
  const ofK = k => T.filter(t => t.k === k).sort((a, b) => b.r - a.r || b.diff - a.diff || String(b.d0).localeCompare(String(a.d0)) || a.i - b.i);
  const serK = k => { const tt = SV?.tt, tk = SV?.tk, j = tk?.k?.indexOf(k) ?? -1; if (!tt || j < 0) return []; return tt.days.map((d, i) => { const c = tk.c[j]?.[i], v = tk.v[j]?.[i]; return c > 0 && Number.isFinite(v) ? v / c - 1 : null; }).filter(v => v != null); };
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, '#/l/a'); await p.waitForTimeout(400);
    const a = await p.evaluate(() => [...document.querySelectorAll('#su section.sj-pf li.sj-glkl')].map(li => { const x = li.querySelector(':scope > a.sj-glka'), r = x?.getBoundingClientRect(), rl = li.getBoundingClientRect();
      return {k: li.dataset.k, name: (li.querySelector(':scope > b')?.textContent ?? '').trim(), href: x?.getAttribute('href') ?? null, lab: x?.getAttribute('aria-label') ?? '', h: r ? Math.round(r.height) : 0, cover: !!r && r.top <= rl.top + 1 && r.bottom >= rl.bottom - 1}; }));
    const linkOk = a.length === 36 && a.every(x => KR.test(x.k ?? '') && x.href === '#/l/k/' + x.k && x.lab === x.name + ' · 이 꾀가 사고판 회사 보기' && x.h >= 48 && x.cover);
    const pick = a.find(x => ofK(x.k).length > 7) ?? a[0];
    let g = null, f2 = null;
    if (pick) {
      await p.click('#su section.sj-pf li.sj-glkl[data-k="' + pick.k + '"] > a.sj-glka'); await p.waitForTimeout(600);
      await p.waitForSelector('#su main.sj-page[data-page="ktr"]', {timeout: 15000}).catch(() => {});
      const look = () => p.evaluate(() => { const txt = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), m = document.querySelector('#su main.sj-page[data-page="ktr"]'), sec = m?.querySelector('section.sj-ktl'), ol = sec?.querySelector('ol.sj-trl0'), b = sec?.querySelector('button.sj-f7b'), br = b?.getBoundingClientRect(), sv = m?.querySelector('section.sj-ktc svg.sj-ktcs');
        const red = [...(m?.querySelectorAll('*') ?? [])].filter(e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).color === 'rgb(211, 47, 47)').filter(e => !e.closest('.sj-res[data-st="up"], .sj-glkr[data-st="up"]')).length;
        return {hash: location.hash, h1: txt(m?.querySelector('h1')), sum: [...(m?.querySelectorAll('dl.sj-ktsum dd') ?? [])].map(txt), big: txt(m?.querySelector('.sj-res-big b')), bigSt: m?.querySelector('.sj-res-big')?.dataset.st ?? '',
          n: +(sec?.dataset.n ?? -1), rows: [...(ol?.children ?? [])].map(li => ({co: txt(li.querySelector('.sj-trh b')), l: [...li.querySelectorAll('.sj-trl')].map(txt), r: txt(li.querySelector('.sj-trr b')), m: txt(li.querySelector('.sj-trm'))})),
          vis: ol ? [...ol.children].filter(li => li.getBoundingClientRect().height > 0).length : 0, fold: ol?.getAttribute('data-fold') ?? null, btn: b ? {t: txt(b), h: Math.round(br.height), fs: parseFloat(getComputedStyle(b).fontSize)} : null,
          chart: sv ? {st: sv.dataset.st, n: +(sv.closest('section')?.dataset.n ?? -1), path: !!sv.querySelector('path.sj-ktcp')} : null, red, wide: document.documentElement.scrollWidth <= innerWidth + 1,
          small: [...(m?.querySelectorAll('p, b, span, dt, dd, h1, h2, button') ?? [])].filter(e => e.textContent.trim() && e.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(e).fontSize) < 16.95).length}; });
      g = await look();
      if (g.btn) { await p.click('#su section.sj-ktl button.sj-f7b'); await p.waitForTimeout(250); f2 = await look(); }
    }
    const L = pick ? ofK(pick.k) : [], cost = L.reduce((x, t) => x + t.p0 * q, 0), val = L.reduce((x, t) => x + t.p1 * q, 0), diff = val - cost, nS = L.filter(t => t.how !== 'h').length, st = Math.round(diff) > 0 ? 'up' : Math.round(diff) < 0 ? 'dn' : 'eq';
    const ser = pick ? serK(pick.k) : [], last = ser.length ? ser[ser.length - 1] : null, cst = last == null ? null : Math.round(last * 1000) > 0 ? 'up' : Math.round(last * 1000) < 0 ? 'dn' : 'eq';
    const want = L.map(rowW);
    const pageOk = !!g && g.hash === '#/l/k/' + pick.k && g.h1 === pick.name && g.n === L.length && JSON.stringify(g.sum) === JSON.stringify([NFm.format(nS) + '번 · ' + NFm.format(L.length - nS) + '번', wonM(cost), wonM(val)])
      && g.big === '수익률 ' + (cost > 0 ? rT(val / cost - 1) : '0.0프로') + ' · ' + movedM(diff) && g.bigSt === st && JSON.stringify(g.rows) === JSON.stringify(want)
      && (L.length > 7 ? g.fold === '7' && g.vis === 7 && g.btn?.t === '나머지 ' + (L.length - 7) + '개 더 보기' && g.btn.h >= 48 && g.btn.fs >= 16.95 && f2?.vis === L.length && f2?.btn?.t === '다시 접기' : g.vis === L.length && !g.btn)
      && (ser.length >= 2 ? !!g.chart && g.chart.path && g.chart.n === ser.length && g.chart.st === cst : !g.chart) && g.red === 0 && g.wide && g.small === 0;
    check(!!D && linkOk && pageOk && !errs.length, W + width + ' 가) 한눈에 꾀 줄 서른여섯을 누르면 그 꾀가 사고판 회사(#/l/k/꾀) — 줄 = 따로 센 값 · 수익률 높은 차례 · 산 날 · 산 값 · 판 날 · 판 값 · 종가 · 변동 · 늘고 준 돈 · 모두 · 꺾은선 · 위 일곱 + 더 보기 · 48 · 17 · 빨강은 오른 수익만 · 넘침 0 · 오류 0',
      JSON.stringify({linkOk, bad: a.filter(x => !(x.href === '#/l/k/' + x.k && x.h >= 48 && x.cover)).slice(0, 2), pick: pick?.k, g: g ? {...g, rows: g.rows.slice(0, 2)} : null, want: want.slice(0, 2), sum: [nS, L.length - nS, wonM(cost), wonM(val)], cst, sn: ser.length, errs: errs.slice(0, 2)}).slice(0, 1500));
    await ctx.close();
  }
}
{ // ㊽ 주문 1127-2306(사장님 2026-11-27(서울) 23:06 「그래 1시간 안에 작업 해」 — 「회사 줄마다 그 회사 값 꺾은선도 작게 붙여 볼까요?」의 답) — 회사 줄 값 꺾은선
  //   꾀 사고판 회사(#/l/k/꾀) · 산 회사(#/l/b) · 판 회사(#/l/s) 줄마다 = 산 날부터 판 날(들고 있으면 가장 늦은 종가 날)까지 그 회사 종가 꺾은선 — 이 검사가 정산 자료(sell.px)에서 따로 셈:
  //   종가 점 수 · 오름 빨강 · 내림 파랑(선만) · 종가가 하나뿐이면 그리지 않음 · 그림 이름 · 넘침 0 · 오류 0 · 390 · 320
  const W = '㊽ ', D = await J('/su/data/su21-settle.json').catch(() => null), SV = D?.sell, PX = SV?.px, q = Number.isFinite(D?.qty) ? D.qty : 10, KR = /^g(0[1-9]|[12]\d|3[0-6])$/;
  const want = i => { const b = D?.buys?.[i], x = SV?.s?.[i]; if (!Array.isArray(b) || !Array.isArray(x)) return null; const d = PX?.d ?? [], c = PX?.c?.[b[2]] ?? [], i0 = d.indexOf(b[0]), i1 = d.indexOf(x[1]);
    let n = 0; if (i0 >= 0 && i1 >= i0) for (let j = i0; j <= i1; j++) if (Number.isFinite(c[j]) && c[j] > 0) n++; const dv = Math.round((x[2] - b[3]) * q); return {n: n >= 2 ? n : 0, st: dv > 0 ? 'up' : dv < 0 ? 'dn' : 'eq', co: D.co?.[b[2]]?.[0] ?? b[2]}; };
  const T = (D?.buys ?? []).map((b, i) => [D?.kinds?.[b?.[1]], SV?.s?.[i]]).filter(([k, x]) => KR.test(k ?? '') && Array.isArray(x)).map(([k]) => k), cnt = {}; for (const k of T) cnt[k] = (cnt[k] ?? 0) + 1;
  const kPick = Object.entries(cnt).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? 'g01';
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const seen = {}; let ok = !!PX && Array.isArray(PX.d) && PX.d.length > 1, why = ok ? '' : 'no px';
    for (const hh of ['#/l/k/' + kPick, '#/l/b', '#/l/s']) {
      await open(p, hh); await p.waitForTimeout(400);
      const rows = await p.evaluate(() => [...document.querySelectorAll('#su main.sj-page ol.sj-trl0 > li.sj-trow')].filter(li => li.getBoundingClientRect().height > 0).map(li => { const sv = li.querySelector(':scope > svg.sj-trsp');
        return {i: +li.dataset.i, sv: sv ? {n: +sv.dataset.n, st: sv.dataset.st, lab: sv.getAttribute('aria-label') ?? '', line: !!sv.querySelector('path.sj-trspl'), base: !!sv.querySelector('line.sj-trspb'), h: Math.round(sv.getBoundingClientRect().height)} : null}; }));
      const wide = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
      let drawn = 0;
      for (const r of rows) { const w = want(r.i); if (!w) { ok = false; why = why || hh + ' no data ' + r.i; continue; }
        const good = w.n ? !!r.sv && r.sv.n === w.n && r.sv.st === w.st && r.sv.line && r.sv.base && r.sv.h >= 40 && r.sv.lab.startsWith(w.co + ' 종가 꺾은선 — ') : !r.sv;
        if (w.n) drawn++; if (!good) { ok = false; why = why || JSON.stringify({hh, r, w}).slice(0, 600); } }
      seen[hh] = [rows.length, drawn]; if (!rows.length || !wide) { ok = false; why = why || hh + ' rows ' + rows.length + ' wide ' + wide; }
    }
    if (!Object.values(seen).some(([, dn]) => dn > 0)) { ok = false; why = why || 'no line drawn'; }
    check(ok && !errs.length, W + width + ' 가) 회사 줄 값 꺾은선 — 꾀 사고판 회사 · 산 회사 · 판 회사 줄마다 산 날부터 판 날까지 종가(점 수 = 자료) · 산 값 점선 · 오름 빨강 · 내림 파랑 · 하나뿐이면 없음 · 넘침 0 · 오류 0',
      (why || JSON.stringify(seen)).slice(0, 1500) + ' ' + JSON.stringify(errs.slice(0, 2)));
    await ctx.close();
  }
}
{ // ㊾ 주문 1127-2320(사장님 2026-11-27(서울) 23:20 「이거 영어 번역판으로도 상단에 탭을 만들어서 만들어 알겠지」) — 영어판 첫 판(기록 탭 · 위아래 길잡이)
  //   맨 위 머리 줄 안 「한국어 · 영어」 탭(48 넘게 · 17 넘게 · 고른 쪽 눌림) · 한국어판이 처음 · 「영어」를 누르면 다시 그려 영어(html lang=en)
  //   영어판 = 한눈에 · 꾀 사고판 회사 · 산 회사 · 판 회사 · 7단 첫 쪽에 한국어 글 0(회사 이름 같은 남의 이름 data-proper 은 그대로) · 쪽 이름도 영어 · 넘침 0 · 오류 0 · 「한국어」를 누르면 한국어로 돌아옴 · 390 · 320
  const W = '㊾ ', HANr = /[가-힣]/;
  const tabsOf = p => p.evaluate(() => [...document.querySelectorAll('#su header.sj-top .sj-lang button.sj-langb')].map(b => { const r = b.getBoundingClientRect(); return {l: b.dataset.lang, t: (b.textContent ?? '').trim(), on: b.getAttribute('aria-pressed'), h: Math.round(r.height), fs: parseFloat(getComputedStyle(b).fontSize)}; }));
  const leftOf = p => p.evaluate(() => { const H = /[가-힣]/, out = []; const w = document.createTreeWalker(document.getElementById('su'), NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && H.test(t) && !n.parentElement.closest('[data-proper], script, style')) out.push(t.slice(0, 40)); }
    return {lang: document.documentElement.lang, title: document.title, left: out, wide: document.documentElement.scrollWidth <= innerWidth + 1}; });
  for (const width of [390, 320]) {
    const ctx = await browser.newContext({viewport: {width, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    await QUIET(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e?.message ?? e).slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await open(p, '#/'); await p.waitForTimeout(300);
    const h0 = await tabsOf(p); // 첫 쪽(index.html 머리 줄)에도 탭
    await p.goto(base + '/su/?lang=en#/', {waitUntil: 'networkidle'}).catch(() => {}); await p.waitForTimeout(500); // 옛 수르 길 ?lang= 은 그대로 옛 쪽 · 손자병법 말은 그대로(새는 것 0)
    const oldGo = new URL(p.url()).pathname;
    await open(p, '#/l/a'); await p.waitForTimeout(400);
    const leak0 = await p.evaluate(() => ({lang: document.documentElement.lang, kept: (() => { try { return localStorage.getItem('su-lang'); } catch { return 'x'; } })()}));
    const k0 = await tabsOf(p), kFirst = await p.evaluate(() => document.querySelector('#su section.sj-pf li.sj-glkl')?.dataset.k ?? 'g01');
    const KO2 = JSON.stringify([['ko', '한국어', 'true'], ['en', '영어', 'false']]);
    const koOk = JSON.stringify(k0.map(x => [x.l, x.t, x.on])) === KO2 && k0.every(x => x.h >= 48 && x.fs >= 16.95) && JSON.stringify(h0.map(x => [x.l, x.t, x.on])) === KO2 && h0.every(x => x.h >= 48 && x.fs >= 16.95)
      && oldGo !== '/su/' && leak0.lang !== 'en' && leak0.kept !== 'en';
    await Promise.all([p.waitForNavigation({timeout: 15000}).catch(() => {}), p.click('#su header.sj-top button.sj-langb[data-lang="en"]')]); await p.waitForTimeout(1200);
    await p.waitForSelector('#su main.sj-page', {timeout: 15000}).catch(() => {}); await p.waitForTimeout(800);
    const endEn = await p.evaluate(async () => { try { const E = await import('/su/su-en.js'); return ['자료 2026년 11월 27일(금) · 받은 때 11월 28일 0시', '자료 2026년 11월 27일 · 받은 때 11월 27일 23시', '자료 11월 27일'].map(x => E.enText(x)); } catch (e) { return ['오류 ' + e]; } }); // 끝 칸 「받은 때」는 진짜 사이트에만 나옴(시험 자료엔 없음) — 말 판으로 따로 봄
    const seen = {endEn}; let ok = koOk && endEn.length === 3 && endEn.every(x => !HANr.test(x)), why = koOk ? '' : 'ko tabs ' + JSON.stringify({k0, h0, oldGo, leak0});
    for (const hh of ['#/l/a', '#/l/k/' + kFirst, '#/l/b', '#/l/s', '#/l/t']) {
      await open(p, hh); await p.waitForTimeout(700);
      const g = await leftOf(p), t = await tabsOf(p); seen[hh] = [g.left.length, g.title];
      const good = g.lang === 'en' && g.left.length === 0 && !HANr.test(g.title) && g.wide && JSON.stringify(t.map(x => [x.l, x.t, x.on])) === JSON.stringify([['ko', 'Korean', 'false'], ['en', 'English', 'true']]) && t.every(x => x.h >= 48 && x.fs >= 16.95);
      if (!good) { ok = false; why = why || JSON.stringify({hh, lang: g.lang, title: g.title, left: g.left.slice(0, 4), wide: g.wide, t}).slice(0, 700); }
    }
    await Promise.all([p.waitForNavigation({timeout: 15000}).catch(() => {}), p.click('#su header.sj-top button.sj-langb[data-lang="ko"]')]); await p.waitForTimeout(1200);
    await p.waitForSelector('#su main.sj-page', {timeout: 15000}).catch(() => {}); await p.waitForTimeout(600);
    const back = await p.evaluate(() => ({lang: document.documentElement.lang, h: (document.querySelector('#su .sj-recnav a[aria-current="page"], #su nav a[aria-current="page"]')?.textContent ?? '').trim(), ko: /[가-힣]/.test(document.querySelector('#su main')?.innerText ?? '')}));
    if (!(back.lang !== 'en' && back.ko)) { ok = false; why = why || 'back ' + JSON.stringify(back); }
    await p.goto(base + '/su/?hl=en#/l/b', {waitUntil: 'networkidle'}).catch(() => {}); await p.waitForTimeout(1200); // 저장소 없는 휴대폰 길 ?hl=en
    const hl1 = await p.evaluate(() => document.documentElement.lang);
    await Promise.all([p.waitForNavigation({timeout: 15000}).catch(() => {}), p.click('#su header.sj-top button.sj-langb[data-lang="ko"]')]); await p.waitForTimeout(1200);
    const hl2 = await p.evaluate(() => ({lang: document.documentElement.lang, q: location.search, hash: location.hash}));
    if (!(hl1 === 'en' && hl2.lang !== 'en' && !/hl=/.test(hl2.q) && hl2.hash === '#/l/b')) { ok = false; why = why || 'hl ' + JSON.stringify({hl1, hl2}); }
    check(ok && !errs.length, W + width + ' 가) 영어판 — 맨 위 「한국어 · 영어」 탭(48 · 17 · 눌림) · 영어를 누르면 한눈에 · 꾀 사고판 회사 · 산 회사 · 판 회사 · 7단에 한국어 글 0 · 쪽 이름 영어 · 넘침 0 · 「한국어」로 돌아옴 · 오류 0',
      (why || JSON.stringify(seen)).slice(0, 1500) + ' ' + JSON.stringify(errs.slice(0, 2)));
    await ctx.close();
  }
}
await browser.close();
R.ok = R.counts.fail === 0;
console.log(`손자병법 두 길 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
process.exit(R.ok ? 0 : 1);

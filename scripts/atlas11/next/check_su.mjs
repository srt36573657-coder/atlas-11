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
const LINK_OK = /^(#\/|#\/[bkrpqjmf]|#\/[ckrpq]\/[0-9A-Z]{6}|#\/c\/[0-9A-Z]{6}\/more|#\/m\/[\w-]+|#\/gift|#\/r\/[mwdyn]|#\/i\/[^/]+|\/next\/|\/next\/\?lang=en|\/next\/#\/(why|share|gift|me|jinhwa|find)(\/[0-9A-Z]{6})?|\/hello\.html|https:\/\/shin-yxy\.gino\.im\/|#\/g(\/[a-z]+)?|\/(next|atlas)\/\?(lang=en&)?su=[a-z]+#\/[\w\/.%-]*|\/(hello|letter|invite|privacy)\.html\?su=[a-z]+(#[\w-]+)?)$/; // 주문 0054 — 셋의 길 #/g · 옛 쪽을 수르 틀로(?su=<묶음>) · 찾기 · 신 72 · 스승 39 · 급등 // 주문 2044 21곳 길 — #/m 땅 지도 · #/m/<땅> · #/c/<번호>/more · #/f 친구에게(옛 기능 자리: 보내기 · 선물 · 왜 사? · 내 종목 · 진화 · 찾기 · 영어 · 소개 영상 · 만수르) // 새 판(주문 1238) 길 넷 #/b 꽃 · #/k 조건 · #/r 기록 · #/p 멈춤(+ /<번호>) · 주문 1616 기록 서랍 #/r/m · w · d · y · n

/** 자료에서 따로 셈(화면 코드 site/su/su-data.js 를 쓰지 않음) */
const J = async u => { const r = await fetch(base + u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
const B = await J('/next/data/theme-bloom.json'), TH = await J('/next/data/theme.json'), SUM = await J('/next/data/home-summary.json').catch(() => null);
const ESS = essenceLines(essenceData({summary: SUM}));
const picks = (B?.today?.inds ?? []).flatMap(i => (i?.co ?? []).filter(r => /^[0-9A-Z]{6}$/.test(r?.[0] ?? '')).map(r => ({code: r[0], name: r[1]})));
const near = picks.length ? [] : (B?.near?.today ?? []).filter(r => /^[0-9A-Z]{6}$/.test(r?.[0] ?? '')).map(r => ({code: r[0], name: r[1]}));
const money = (TH?.inds ?? []).filter(i => typeof i?.x === 'number' && i.x > 0 && /^[0-9A-Z]{6}$/.test(i?.lead?.[0] ?? '') && typeof i.lead[1] === 'string').sort((a, b) => b.x - a.x).slice(0, 3).map(i => ({code: i.lead[0], name: i.lead[1], ind: i.n}));
R.m.data = {picks: picks.length, near: near.length, money: money.map(x => x.name)};

const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const URL_OF = hash => `${base}/su/?v=${Date.now()}${hash}`;
const open = async (p, hash) => { await p.goto(URL_OF(hash), {waitUntil: 'networkidle'}); await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(250); };
const settle = async (p, name = null) => { await p.waitForFunction(() => !document.querySelector('#su .su-boot'), null, {timeout: 20000}).catch(() => {}); if (name) await p.waitForFunction(n => (document.querySelector('#su h1')?.innerText ?? '').replace(/\s+/g, ' ').trim() === n, name, {timeout: 10000}).catch(() => {}); await p.waitForTimeout(300); }; // 누른 뒤 새 쪽이 그려질 때까지(큰 제목이 바뀜 · 10초 안)
/** 화면 재기 — 넘침 · 작은 글 · 작은 누름 · 고리 · 글 · 큰 제목 */
const measure = p => p.evaluate(() => {
  const v = document.getElementById('su'), out = {w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, small: [], tiny: [], links: [], text: '', h1: '', screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2)};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
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
    const g = await p.evaluate(() => [...document.querySelectorAll('#su .su-21g ol')].map(o => [...o.querySelectorAll('li.su-21t a')].map(a => ({href: a.getAttribute('href'), name: a.querySelector('span')?.textContent ?? '', x: !!a.querySelector('i')}))));
    const want21 = ['hot', 'bloom', 'money'].map(k => (T21.lists[k] ?? []).map(c => c.name));
    check(JSON.stringify(g.map(c => c.map(x => x.name))) === JSON.stringify(want21), W + '처음 쪽 21곳 = su21.json(불장 · 꽃이 될 · 돈이 몰리는 일곱씩)', JSON.stringify(g.map(c => c.length)));
    check(g.flat().every(x => /^#\/c\/[0-9A-Z]{6}$/.test(x.href)), W + '21곳 이름 → 그 회사', '');
    const ov = new Set((T21.overlap ?? []).map(o => o.name));
    check(g.flat().every(x => x.x === ov.has(x.name)), W + '겹친 곳마다 ✦ · 안 겹친 곳 없음', [...ov].join(','));
    R.m.t21 = {listed: T21.counts.listed, b365: T21.counts.b365, n: g.flat().length, overlap: ov.size, distinct: T21.distinct};
    const tap21 = width === 390 ? [...new Map(g.flat().map(x => [x.href, x])).values()] : g.map(c => c[0]).filter(Boolean);
    for (const r of tap21) {
      await open(p, '#/'); await p.click(`#su .su-21g a[href="${r.href}"]`); await settle(p, r.name);
      const m1 = await measure(p);
      check(p.url().endsWith(r.href) && m1.h1 === r.name, W + '21곳 누르면 그 회사 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
      check(await p.evaluate(() => !!document.querySelector('#su .su-why21')), W + '왜 21곳에 들었나 칸 — ' + r.name, '');
      pageRules(m1, W + '21곳 회사 ' + r.name);
    }
    await open(p, '#/b'); // 옛 처음(꽃 · 돈 줄)은 #/b 에 그대로 — 아래 검사는 그 쪽에서
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
    await open(p, '#/b');
    await p.click(`#su a.su-row[href="${r.href}"]`);
    await settle(p, r.name);
    const m1 = await measure(p);
    check(p.url().endsWith(r.href) && m1.h1 === r.name, W + '누르면 그 회사 — ' + r.name, `${p.url().split('#')[1]} · ${m1.h1}`);
    pageRules(m1, W + '회사 ' + r.name);
    const kind = await p.evaluate(() => document.body.innerText);
    if (near.some(x => x.name === r.name)) check(kind.includes('조건에 가장 가까운 회사예요') && kind.includes('맞은 조건') && kind.includes('안 맞은 조건'), W + '왜 여기 있나 — 가까운 회사 ' + r.name, '');
    if (picks.some(x => x.name === r.name)) check(kind.includes('꽃이 될 회사예요'), W + '왜 여기 있나 — 고른 회사 ' + r.name, '');
    if (money.some(x => x.name === r.name)) check(kind.includes('돈이 몰린 회사예요'), W + '왜 여기 있나 — 돈이 몰린 회사 ' + r.name, '');
    if (width === 390) { // 그림 글 = 회사 자료(co.line 마지막 · 기준 100)
      const code = r.href.slice(4), co = await J('/atlas/data/co/' + code + '.json'), last = co.line[co.line.length - 1] / 100 - 100;
      const wantPct = (Math.abs(last).toFixed(1) === '0.0' ? '0.0' : (last > 0 ? '+' : '−') + Math.abs(last).toFixed(1)) + '%';
      const got = await p.evaluate(() => document.querySelector('.su-lg-c b')?.textContent ?? '');
      check(got === wantPct, W + '그림 한 달 % = 회사 자료 — ' + r.name, `${got} / ${wantPct}`);
      check(await p.evaluate(() => document.querySelectorAll('svg.su-svg polyline').length >= 1), W + '한 달 그림 — ' + r.name, '');
    }
  }
  // 회사 → 업종 → 회사
  const first = (mo[0] ?? bl[0]);
  if (first) {
    await open(p, first.href);
    const ind = await p.evaluate(() => ({href: document.querySelector('#su a.su-ind')?.getAttribute('href') ?? '', name: document.querySelector('#su a.su-ind span')?.textContent ?? ''}));
    check(/^#\/i\//.test(ind.href), W + '회사 쪽 업종 단추', ind.href);
    if (ind.href) {
      await p.click('#su a.su-ind'); await settle(p, ind.name);
      const m2 = await measure(p);
      check(m2.h1 === ind.name, W + '누르면 그 업종 — ' + ind.name, m2.h1);
      pageRules(m2, W + '업종 ' + ind.name);
      const c1 = await p.evaluate(() => { const a = document.querySelector('#su a.su-row'); return a ? {href: a.getAttribute('href'), name: a.querySelector('[data-proper]')?.textContent ?? ''} : null; });
      check(!!c1, W + '업종 쪽 회사 줄', '');
      if (c1) { await p.click(`#su a.su-row[href="${c1.href}"]`); await settle(p, c1.name); const m3 = await measure(p); check(m3.h1 === c1.name, W + '업종 → 그 회사 — ' + c1.name, m3.h1); }
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
      const big = document.querySelector('#su .su-head .su-big')?.getBoundingClientRect(), hero = document.querySelector('#su .su-hero')?.getBoundingClientRect(), mids = document.querySelector('#su .su-mids')?.getBoundingClientRect();
      const figs = [...document.querySelectorAll('#su main figure.su-fig')].filter(f => !f.closest('details'));
      const moving = figs.filter(f => f.querySelector('svg') && f.querySelector('[class*="a-"]')).length;
      const six = document.querySelector('#su main > figure.su-six');
      const tiles = six ? [...six.querySelectorAll('li.su-st')].map(li => ({need: li.classList.contains('su-need'), v: li.querySelector('.su-sv')?.textContent ?? ''})) : [];
      const vals = [...document.querySelectorAll('#su .su-mid, #su .su-vr')], valsSix = vals.filter(v => v.querySelector('details.su-sixd li.su-st')).length;
      const last = main?.lastElementChild;
      // ⑩ 주문 1807 · 1833 — 숫자마다 「그래서」 · 전문가 서랍(눌러야 열림) · 어려운 낱말 셈 · 여섯 칸 지도 · 장식이 글을 가리지 않음
      const mv = [...document.querySelectorAll('#su .su-head .su-big, #su .su-mid, #su .su-vr')], mw = mv.filter(v => (v.querySelector('.su-mean span')?.textContent ?? '').trim().length > 0).length;
      const pro = document.querySelector('#su main details.su-pro');
      const tr = []; { const tw = document.createTreeWalker(main ?? document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.textContent.trim() || n.parentElement?.closest('details:not([open]) > :not(summary), svg, [aria-hidden="true"]')) continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.bottom > 0 && q.top < H && q.width > 0) tr.push(q); } }
      let orn = 0; for (const o of document.querySelectorAll('#su .su-orn')) { const q = o.getBoundingClientRect(); if (q.bottom <= 0 || q.top >= H) continue; for (const t of tr) orn += Math.max(0, Math.min(q.right, t.right) - Math.max(q.left, t.left)) * Math.max(0, Math.min(q.bottom, t.bottom) - Math.max(q.top, t.top)); }
      const ornN = document.querySelectorAll('#su .su-orn').length;
      return {means: {vals: mv.length, with: mw}, pro: {has: !!pro, open: !!pro?.open, rows: pro?.querySelectorAll('li').length ?? 0}, hard: Number(main?.dataset.hard ?? NaN), hardWords: main?.dataset.hardWords ?? '', glossed: (main?.dataset.glossed ?? '').split(',').filter(Boolean).length,
        smap: !!document.querySelector('#su main figure.su-smap'), orn: Math.round(orn), ornN,
        h1: (document.querySelector('#su h1')?.innerText ?? '').trim(), step: document.querySelector('#su .su-step')?.innerText.replace(/\s+/g, ' ').trim() ?? '', next: document.querySelector('#su .su-next')?.getAttribute('href') ?? null,
        share: Math.round(100 * area('#su main [data-g]') / (W * H)), shareIn: Math.round(100 * area('#su main [data-g]') / Math.max(1, W * (low - top))),
        order: !!(big && hero && big.bottom <= hero.top + 1 && (!mids || hero.bottom <= mids.top + 1)), lastIsSrc: !!last?.classList?.contains('su-src') && /출처/.test(last.innerText) && /조사 날짜/.test(last.innerText),
        figs: figs.length, moving, tiles, vals: vals.length, valsSix, tabs: [...document.querySelectorAll('#su .su-tabs a')].map(a => ({t: a.innerText.trim(), cur: a.getAttribute('aria-current') === 'page'}))};
    });
    await open(p, '#/');
    const seen = [];
    for (let k = 0; k <= 7; k++) {
      await p.waitForTimeout(150);
      const m = await shape(); seen.push(m);
      check(m.step.includes((k + 1) + ' / 8'), W + '⑨ 걸음 표시 ' + (k + 1) + ' / 8 — ' + m.h1, m.step);
      check(m.order, W + '⑨ 맨 위 큰 값 → 큰 그림 → 중간 값 — ' + m.h1, '');
      check(m.lastIsSrc, W + '⑨ 맨 아래 출처와 조사 날짜 — ' + m.h1, '');
      check(m.share >= 50, W + '⑨ 첫 화면 그림 넓이 50% 넘게 — ' + m.h1, m.share + '%');
      check(m.moving >= 2, W + '⑨ 움직이는 그림 둘 넘게 — ' + m.h1, String(m.moving));
      check(m.tiles.length === 6 && m.tiles.every(t => (t.need ? t.v === '확인 필요' : t.v && t.v !== '확인 필요')), W + '⑨ 큰 값의 여섯 칸(빈 칸 = 「확인 필요」) — ' + m.h1, JSON.stringify(m.tiles).slice(0, 160));
      check(m.vals === m.valsSix, W + '⑨ 중간 값 · 자세한 값마다 여섯 칸 — ' + m.h1, m.valsSix + ' / ' + m.vals);
      check(m.tabs.length === 4 && m.tabs.map(t => t.t).join(' ') === '21곳 지도 기록 멈춤' && m.tabs.filter(t => t.cur).length === 1, W + '⑨ 탭 넷 기승전결 차례 · 켜진 탭 하나 — ' + m.h1, JSON.stringify(m.tabs));
      check(m.means.vals >= 1 && m.means.vals === m.means.with, W + '⑩ 숫자마다 「그래서」 한 줄 — ' + m.h1, m.means.with + ' / ' + m.means.vals);
      check(m.pro.has && !m.pro.open && m.pro.rows >= 3, W + '⑩ 전문가용 자세히 — 눌러야 열림 — ' + m.h1, JSON.stringify(m.pro));
      check(Number.isFinite(m.hard), W + '⑩ 어려운 낱말 셈 — ' + m.h1, String(m.hard) + ' ' + m.hardWords);
      check(m.smap, W + '⑩ 여섯 칸 지도 — ' + m.h1, '');
      check(m.orn === 0, W + '⑩ 장식이 글을 가리지 않음(겹친 넓이 0) — ' + m.h1, m.orn + ' · 장식 ' + m.ornN);
      pageRules(await measure(p), W + '⑨ ' + (k + 1) + '번째 화면 ' + m.h1);
      if (k < 7) { const a = await p.$('#su .su-next'); if (!a) { check(false, W + '⑨ 다음 단추 — ' + m.h1, ''); break; } await a.click(); await settle(p); await p.waitForTimeout(300); }
    }
    check(seen.length === 8 && new Set(seen.map(m => m.h1)).size === 8 && seen[7]?.h1 === '친구에게', W + '⑨ 다음 일곱 번에 끝(여덟 화면 · 끝 = 친구에게 — 주문 2044 21곳 → 땅 → 업종 → 회사 → 자세히 → 왜 사? → 매매일지 → 친구에게)', seen.map(m => m.h1).join(' → '));
    R.m.path = seen.map(m => ({h1: m.h1, share: m.share, shareIn: m.shareIn, figs: m.figs, moving: m.moving, need: m.tiles.filter(t => t.need).length, means: m.means.vals, hard: m.hard, hardWords: m.hardWords, glossed: m.glossed, orn: m.ornN}));
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
    check(JSON.stringify(dr) === JSON.stringify(['#/r/m', '#/r/w', '#/r/d', '#/r/y', '#/r/n', '#/j']), W + '⑨ 기록 서랍 여섯(달 · 못 된 까닭 · 날 · 해 · 가까운 회사 · 내 매매일지)', dr.join(' '));
    R.m.drawers = {};
    for (const hh of ['#/r/d', '#/r/y', '#/r/n']) { await open(p, hh); await p.waitForTimeout(200); const m = await shape(); R.m.drawers[hh] = {h1: m.h1, share: m.share, moving: m.moving}; check(m.moving >= 1 && m.tiles.length === 6 && m.lastIsSrc, W + '⑨ 서랍 쪽 ' + hh + ' — ' + m.h1, JSON.stringify(m).slice(0, 160)); pageRules(await measure(p), W + '⑨ 서랍 쪽 ' + hh); }
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
  await p.addInitScript(() => { window.__v = {lcp: 0, cls: 0}; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true}); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({type: 'layout-shift', buffered: true}); });
  await p.goto(`${base}/su/?v=${Date.now()}#/`, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {}); await p.waitForTimeout(800);
  const v = await p.evaluate(() => window.__v); R.m.speed = {lcp: Math.round(v.lcp), cls: +v.cls.toFixed(3)};
  check(v.lcp > 0 && v.lcp <= 2500, '느린 4G 가장 큰 그림 2.5초 안', `${Math.round(v.lcp)}ms`);
  await ctx.close();
}
await browser.close();
R.ok = R.counts.fail === 0;
console.log(`수르 두 길 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
process.exit(R.ok ? 0 : 1);

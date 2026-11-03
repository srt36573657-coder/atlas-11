#!/usr/bin/env node
// 수르 두 길 검사(/su/ · site/su/ · 주문 2049 — 사장님 2026-11-03 15:49(+04) 「무엇을 클릭하면 그 연관된곳으로 명확하게 이동되서 그 정보를 제공해야」)
//   쓰는 법: node scripts/atlas11/next/check_su.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받기만 함 — 짧아서 늘 모두 돎)
//   ① 누르면 그것이 나옴 — 처음 쪽 줄마다 눌러 그 회사 쪽(큰 제목 = 줄의 회사 이름) · 회사 쪽 업종 단추 → 그 업종 쪽(큰 제목 = 업종 이름 + 업종) · 업종 쪽 첫 회사 → 그 회사
//   ② 고리는 다섯 꼴뿐 — #/ · #/c/<번호> · #/i/<업종> · /next/ · /next/#/why/<번호> (설명 쪽 · 바깥 · 선물 · 카톡 · 신 · 스승 0)
//   ③ 줄이 자료와 같음 — 꽃이 될 회사(오늘 고른 회사 · 없는 날 가장 가까운 회사 + 「가까운 곳」 · 고른 회사가 아니라는 말) · 돈이 몰린 회사(한 달 앞선 업종 셋의 대장)를 이 검사가 자료에서 따로 셈
//   ④ 왜 여기 있나 — 가까운 회사 쪽에 「맞은 조건」 · 「안 맞은 조건」 · 돈이 몰린 회사 쪽에 「돈이 몰린 회사예요」 · 그림 글(한 달 %)이 회사 자료와 같음
//   ⑤ 세 폭(320 · 360 · 390): 가로 넘침 0 · 글 17px 넘게 · 누르는 것 48 × 48 넘게 · 화면 오류 0 · 모든 쪽 맨 위 안전 문장 · 쓰지 않을 말 · 망치는 길 0(이름 빼고)
//   ⑥ 처음 쪽 길이 3 화면 안(390 × 844 — 두 칸만)
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
const LINK_OK = /^(#\/|#\/c\/[0-9A-Z]{6}|#\/i\/[^/]+|\/next\/|\/next\/#\/why(\/[0-9A-Z]{6})?)$/;

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
  if (width === 390) { R.m.home = {screens: m0.screens, links: m0.links.length}; check(m0.screens <= 3, W + '처음 쪽 3 화면 안', String(m0.screens)); }
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
  const rows = await p.evaluate(() => [...document.querySelectorAll('#su section[aria-label] a.su-row')].map(a => ({sec: a.closest('section').getAttribute('aria-label'), href: a.getAttribute('href'), name: a.querySelector('[data-proper]')?.textContent ?? '', chip: a.querySelector('.su-chip')?.textContent ?? ''})));
  const bl = rows.filter(r => r.sec === '꽃이 될 회사'), mo = rows.filter(r => r.sec === '돈이 몰린 회사');
  const want = picks.length ? picks : near;
  check(JSON.stringify(bl.map(r => r.name)) === JSON.stringify(want.map(r => r.name)), W + '꽃이 될 회사 줄 = 자료', `${bl.map(r => r.name)} / ${want.map(r => r.name)}`);
  check(bl.every(r => r.href === '#/c/' + want.find(x => x.name === r.name)?.code), W + '꽃이 될 회사 줄 → 그 회사 번호', bl.map(r => r.href).join(' '));
  if (near.length) { check(bl.every(r => r.chip === '가까운 곳'), W + '가까운 회사 줄마다 「가까운 곳」', bl.map(r => r.chip).join(',')); check(m0.text.includes('고른 회사가 아니에요'), W + '고른 회사가 아니라는 말', ''); }
  check(JSON.stringify(mo.map(r => r.name)) === JSON.stringify(money.map(r => r.name)), W + '돈이 몰린 회사 줄 = 한 달 앞선 업종 셋의 대장', `${mo.map(r => r.name)} / ${money.map(r => r.name)}`);
  // ① 누르면 그것이 나옴 — 줄마다(390 에서만 모두 · 다른 폭은 첫 줄씩)
  const tap = width === 390 ? rows : [bl[0], mo[0]].filter(Boolean);
  for (const r of tap) {
    await open(p, '#/');
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

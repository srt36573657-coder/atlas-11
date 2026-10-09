#!/usr/bin/env node
/**
 * ATLAS 11 · 선물형 초대장 동작 검사 — 사장님 2026-10-09 16:12(마카오 시각) 첨부 프롬프트 「7. 완성 기준」을 실제 브라우저로 누른다
 *   흐름: 초대장 작성 → 미리보기 → 공유 링크 생성 → 다른 기기(따로 연 브라우저)에서 열기 → 열기 움직임 → 개인 메시지 → ATLAS 후보 화면 이동
 *   더 보는 것: 긴 이름 · 빈 메시지 · 긴 메시지 · 잘못된 · 없는 · 기간이 지난 링크 · 새로고침 · 링크 복사(공유 창이 없는 곳) · 움직임 줄이기 · 320px · 컴퓨터 화면 · 글자로만(HTML 아님) · 보안 규칙(CSP) 어김 0
 *   이 기계에서 못 보는 것(보고에 「확인 못 함」으로): 아이폰 Safari · 카카오톡 안 브라우저(웹킷) · 실제 카카오 공유(열쇠 없음) · 넷리파이 실제 저장소
 *   쓰는 법: node scripts/atlas11/invite_dev.mjs --dir dist --port 8824 --seed-expired  (다른 창)
 *           node scripts/atlas11/check/invite_check.mjs --base http://127.0.0.1:8824 --pw <playwright 폴더> --expired <번호> [--shots <폴더>]
 *   결과: reports/atlas11/invite-check/latest.json(검사마다 통과 · 까닭)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const base = arg('--base', 'http://127.0.0.1:8824'), shots = arg('--shots', null), expired = arg('--expired', null);
const require = createRequire(path.resolve(arg('--pw', process.env.PW ?? '.')) + '/node_modules/');
const {chromium} = require('playwright');
const DEFAULT_MESSAGE = '좋은 기회는 소중한 사람과 함께 나누고 싶었습니다.\n당신의 다음 선택에 도움이 되길 바랍니다.';
const checks = [], csp = [], pageErrors = [];
const check = (id, ok, detail = '') => { checks.push({id, ok: !!ok, detail: String(detail).slice(0, 300)}); console.log(`${ok ? '✓' : '✗'} ${id}${detail ? ' · ' + String(detail).slice(0, 160) : ''}`); };
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'};
async function ctxOf(opts = {}) {
  const ctx = await browser.newContext({...PHONE, ...opts});
  ctx.on('page', p => watch(p));
  return ctx;
}
function watch(page) {
  page.on('console', m => { const t = m.text(); if (/Refused to|Content Security Policy/i.test(t)) csp.push(t.slice(0, 200)); });
  page.on('pageerror', e => pageErrors.push(e.message.slice(0, 200)));
}
const shot = async (page, name, full = false) => { if (shots) { await fs.mkdir(shots, {recursive: true}); await page.screenshot({path: path.join(shots, name + '.png'), fullPage: full}); } };
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const api = async (body) => { const r = await fetch(base + '/api/invite', {method: 'POST', headers: {'content-type': 'application/json', origin: base}, body: JSON.stringify(body)}); return r.json(); };

try {
  // ① 보내는 사람(휴대폰 A)
  const A = await ctxOf(); await A.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: base});
  const a = await A.newPage(); watch(a);
  await a.goto(base + '/invite.html'); await a.waitForSelector('#iv-to'); await a.evaluate(() => document.fonts.ready);
  check('작성 화면이 열림 · 기본 메시지', (await a.inputValue('#iv-msg')) === DEFAULT_MESSAGE && (await a.locator('h1').first().textContent()).includes('초대장 보내기'));
  check('작성 화면 옆 넘침 없음', await noOverflow(a));
  await shot(a, 's1-compose');
  await a.click('button[type=submit]');
  check('빈 이름이면 막고 알려 줌', (await a.textContent('#iv-to-err')).includes('받는 사람') && (await a.textContent('#iv-from-err')).includes('보내는 사람') && (await a.evaluate(() => document.activeElement?.id)) === 'iv-to');
  await a.fill('#iv-to', '김하늘'); await a.fill('#iv-from', '신바다');
  let posts = 0; a.on('request', q => { if (q.method() === 'POST' && new URL(q.url()).pathname === '/api/invite') posts++; });
  const firstMade = a.waitForResponse(q => q.request().method() === 'POST' && new URL(q.url()).pathname === '/api/invite', {timeout: 8000});
  await a.click('button[type=submit]'); await a.waitForSelector('.iv-frame .iv-gift');
  await firstMade;
  check('미리 보기와 함께 주소를 만들어 둠(휴대폰은 누른 그 순간만 복사 · 공유를 허락 — 누른 뒤 서버를 기다리지 않게) · 주소 칸은 아직 숨김', posts === 1 && (await a.locator('#iv-url').count()) === 0, `요청 ${posts}번`);
  check('미리 보기: 받는 쪽 화면 그대로(이름 · 보낸 사람)', (await a.textContent('.iv-frame .iv-to')).includes('김하늘님께') && (await a.textContent('.iv-frame .iv-from')).includes('신바다'));
  await shot(a, 's2-preview', true);
  const t0 = Date.now(); await a.click('.iv-frame .iv-gift'); await a.waitForSelector('.iv-frame .iv-open .iv-card', {timeout: 6000});
  await a.waitForFunction(() => getComputedStyle(document.querySelector('.iv-frame .iv-card')).opacity === '1', null, {timeout: 6000});
  check('미리 보기에서도 열어 볼 수 있음(메시지까지)', (await a.textContent('.iv-frame .iv-msg')).includes('좋은 기회는'), `${Date.now() - t0}ms`);
  await a.click('.iv-share .iv-btn.sec'); await a.waitForSelector('#iv-url', {timeout: 8000});
  const url = await a.inputValue('#iv-url');
  check('링크 만들기: 주소에는 번호만(이름 · 메시지 없음)', /\/i\/[A-Za-z0-9_-]{22}$/.test(url) && !/하늘|기회|%ED/.test(url), url);
  const clip = await a.evaluate(() => navigator.clipboard.readText()).catch(() => null);
  check('링크 복사', clip === url && (await a.textContent('.iv-status')).includes('복사'), clip);
  await a.click('.iv-share .iv-btn.pri'); await a.waitForTimeout(400);
  const st = await a.textContent('.iv-status');
  check('카카오톡으로 보내기: 카카오 열쇠 · 공유 창이 없는 곳은 링크 복사로', /복사|공유/.test(st) && !(await a.locator('.iv-status.bad').count()), st);
  check('같은 글로 두 번 눌러도 주소 하나', (await a.inputValue('#iv-url')) === url && posts === 1, `요청 ${posts}번`);
  await shot(a, 's3-made', true);
  await a.type('#iv-to', '님'); await a.waitForTimeout(100);
  check('글을 고치면 지난 미리 보기를 닫음(옛 글이 보내지지 않게)', await a.locator('.iv-pv').isHidden());

  // ①-2 느린 연결: 주소가 오기 전에 누르면 「만드는 중」 → 「한 번 더 눌러 주세요」(휴대폰이 기다린 뒤의 공유 창을 막을 수 있어서) → 다시 누르면 보냄
  const SL = await ctxOf(); await SL.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: base});
  const sl = await SL.newPage(); watch(sl);
  await sl.route('**/api/invite', async rt => { if (rt.request().method() === 'POST') await new Promise(r => setTimeout(r, 1500)); await rt.continue(); });
  await sl.goto(base + '/invite.html'); await sl.waitForSelector('#iv-to');
  await sl.fill('#iv-to', '하늘'); await sl.fill('#iv-from', '바다'); await sl.click('button[type=submit]'); await sl.waitForSelector('.iv-share .iv-btn.pri');
  await sl.click('.iv-share .iv-btn.pri'); const slow1 = await sl.textContent('.iv-status');
  await sl.waitForFunction(() => /한 번 더/.test(document.querySelector('.iv-status')?.textContent ?? ''), null, {timeout: 8000});
  const slow2 = await sl.textContent('.iv-status');
  await sl.click('.iv-share .iv-btn.pri'); await sl.waitForTimeout(400); const slow3 = await sl.textContent('.iv-status');
  check('느린 연결: 「만드는 중」 → 「한 번 더」 → 보내기(이 기계는 공유 창이 없어 링크 복사)', /만드는 중/.test(slow1) && /한 번 더/.test(slow2) && /복사/.test(slow3) && /\/i\/[A-Za-z0-9_-]{22}$/.test(await sl.inputValue('#iv-url')), `${slow1} → ${slow2} → ${slow3}`);
  await SL.close();

  // ② 받는 사람(다른 기기 — 따로 연 브라우저 · 저장소 공유 없음)
  const B = await ctxOf(); const b = await B.newPage(); watch(b);
  await b.goto(url); await b.waitForSelector('.iv-gift'); await b.evaluate(() => document.fonts.ready); await b.waitForTimeout(300);
  check('다른 기기: 누가 누구에게(받는 이름이 먼저) · 누를 곳 하나', (await b.textContent('.iv-to')).includes('김하늘님께') && (await b.textContent('.iv-from')).includes('신바다') && (await b.locator('.iv-act-closed .iv-btn').count()) === 1);
  const fold = await b.evaluate(() => { const r = document.querySelector('.iv-act-closed .iv-btn').getBoundingClientRect(); return r.bottom <= innerHeight; });
  check('닫힌 화면: 이름 · 선물 · 「열어 보기」가 첫 화면 안', fold);
  check('검색 제외 · 제목', (await b.getAttribute('meta[name=robots]', 'content')).includes('noindex') && (await b.title()).includes('김하늘님께'));
  await shot(b, 'r1-closed');
  const g = await b.locator('.iv-gift').boundingBox(); const t1 = Date.now();
  await b.mouse.click(g.x + g.width * 0.2, g.y + g.height * 0.4);
  await b.waitForTimeout(700); await shot(b, 'r2-opening');
  await b.waitForFunction(() => { const c = document.querySelector('.iv-open .iv-card'); return c && getComputedStyle(c).opacity === '1'; }, null, {timeout: 6000});
  const readMs = Date.now() - t1;
  check('열기 → 메시지를 읽을 수 있을 때까지 3~5초 안', readMs <= 5000, `${readMs}ms`);
  check('개인 메시지 그대로(줄 바꿈 포함)', (await b.textContent('.iv-msg')) === DEFAULT_MESSAGE && (await b.textContent('.iv-sign')).includes('신바다'));
  const stars = await b.evaluate(() => [...document.querySelectorAll('.iv-star')].map(s => ({o: getComputedStyle(s).opacity, t: s.style.transform})));
  check('별 일곱이 자리에(북두칠성)', stars.length === 7 && stars.every(s => Number(s.o) > 0.5 && s.t.startsWith('translate')));
  await b.waitForTimeout(500);
  const go = await b.evaluate(() => ({t: document.querySelector('.iv-go .iv-btn')?.textContent, href: document.querySelector('.iv-go .iv-btn')?.getAttribute('href'), sub: document.querySelector('.iv-go-sub')?.textContent}));
  check('후보 단추: 판 자료의 후보 수 · 기준 날짜 · 연구용', /^ATLAS 후보( \d곳)? (화면 )?보기$/.test(go.t) && go.href === '/#/' && /\d+월 \d+일\(.\) 15:30 종가 기준/.test(go.sub) && go.sub.includes('연구용'), JSON.stringify(go));
  check('열린 화면 옆 넘침 없음', await noOverflow(b));
  await shot(b, 'r3-open'); await shot(b, 'r3-open-full', true);
  await b.click('.iv-go .iv-btn'); await b.waitForURL(u => new URL(u).pathname === '/' , {timeout: 8000});
  await b.waitForFunction(() => /기준/.test(document.querySelector('#main')?.innerText ?? ''), null, {timeout: 15000}).catch(() => {});
  const spa = await b.evaluate(() => ({hash: location.hash, txt: (document.querySelector('#main')?.innerText ?? '').slice(0, 300)}));
  check('단추 → ATLAS 후보 7 화면(그때의 최신 판 · 기준 날짜 보임)', /종가/.test(spa.txt) && /후보/.test(spa.txt), spa.txt.replace(/\n/g, ' ').slice(0, 120));
  await shot(b, 'r4-atlas');
  await b.goBack(); await b.waitForSelector('.iv-gift');
  check('뒤로 · 다시 열면 닫힌 합부터(새로 받은 선물처럼)', (await b.locator('.iv-scene:not(.iv-open)').count()) === 1);
  await b.reload(); await b.waitForSelector('.iv-gift');
  await b.click('.iv-act-closed .iv-link'); await b.waitForSelector('.iv-open .iv-card');
  check('새로고침 → 「바로 보기」 = 움직임 없이 바로 메시지', (await b.textContent('.iv-msg')) === DEFAULT_MESSAGE);
  await b.click('.iv-after .iv-link');
  check('「다시 보기」 = 닫힌 합으로', (await b.locator('.iv-scene:not(.iv-open) .iv-gift').count()) === 1);

  // ③ 움직임 줄이기
  const R = await ctxOf({reducedMotion: 'reduce'}); const r = await R.newPage(); watch(r);
  await r.goto(url); await r.waitForSelector('.iv-gift'); const t2 = Date.now(); await r.click('.iv-act-closed .iv-btn');
  await r.waitForSelector('.iv-open .iv-card'); const rm = Date.now() - t2;
  check('움직임 줄이기: 움직임 없이 같은 정보', rm < 800 && (await r.textContent('.iv-msg')) === DEFAULT_MESSAGE && (await r.evaluate(() => document.getAnimations().filter(x => x.playState === 'running').length)) === 0, `${rm}ms`);

  // ④ 긴 이름 · 긴 메시지 · 빈 메시지 · 320px
  const longTo = '가나다라마바사아자차카타파하가나다라마바사아자차', longFrom = 'ABCDEFGHIJKLMNOPQRSTUVWX';
  const longMsg = Array.from({length: 12}, (_, i) => `${String(i + 1).padStart(2, '0')}줄 소중한 분께 드리는 긴 메시지`).join('\n'); // 12줄 · 300자 안(가장 긴 메시지)
  const L = await api({to: longTo, from: longFrom, message: longMsg}); const E = await api({to: '하늘', from: '바다', message: ''});
  const S = await ctxOf({viewport: {width: 320, height: 568}}); const s = await S.newPage(); watch(s);
  await s.goto(base + '/i/' + L.id); await s.waitForSelector('.iv-gift'); await s.evaluate(() => document.fonts.ready);
  check('320px · 긴 이름(24자): 닫힌 화면 넘침 없음', await noOverflow(s) && (await s.textContent('.iv-to')).includes(longTo));
  await shot(s, 'x1-320-long-closed');
  await s.click('.iv-act-closed .iv-link'); await s.waitForSelector('.iv-open .iv-card');
  const lm = await s.textContent('.iv-msg');
  const goVisible = await s.evaluate(() => { const b = document.querySelector('.iv-go .iv-btn'); b.scrollIntoView(); const r = b.getBoundingClientRect(); return r.top >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; });
  check('320px · 긴 메시지(12줄 · 300자 안): 잘리지 않음 · 단추는 그 아래 그대로', await noOverflow(s) && lm === longMsg && goVisible, `${Array.from(lm).length}자 · ${lm.split('\n').length}줄 · 단추 보임 ${goVisible}`);
  await shot(s, 'x2-320-long-open', true);
  await s.goto(base + '/i/' + E.id); await s.waitForSelector('.iv-gift'); await s.click('.iv-act-closed .iv-link'); await s.waitForSelector('.iv-open .iv-card');
  check('빈 메시지: 「보낸 사람이 초대장을 보냈습니다」 한 줄', (await s.textContent('.iv-msg')).includes('바다님이 ATLAS 초대장을 보냈습니다'));
  await s.goto(base + '/invite.html'); await s.waitForSelector('#iv-to');
  check('320px · 작성 화면 넘침 없음', await noOverflow(s));
  await shot(s, 'x3-320-compose', true);

  // ⑤ 열 수 없는 링크
  const N = await ctxOf(); const n = await N.newPage(); watch(n);
  await n.goto(base + '/i/abc'); await n.waitForSelector('.iv-note h1');
  check('잘못된 링크 안내', (await n.textContent('.iv-note h1')).includes('주소가 올바르지 않습니다'));
  await n.goto(base + '/i/' + 'Zz'.repeat(11)); await n.waitForSelector('.iv-note h1');
  check('없는 링크 안내', (await n.textContent('.iv-note h1')).includes('찾을 수 없는 초대장'));
  await shot(n, 'e1-notfound');
  if (expired) { await n.goto(base + '/i/' + expired); await n.waitForSelector('.iv-note h1'); check('기간이 지난 링크 안내(180일)', (await n.textContent('.iv-note h1')).includes('기간이 지난') && (await n.textContent('.iv-note p')).includes('180일')); await shot(n, 'e2-expired'); }
  else check('기간이 지난 링크 안내(180일)', false, '--expired 번호 없음');
  await n.goto(base + '/invite.html?i=' + E.id); await n.waitForSelector('.iv-gift');
  check('주소 다른 꼴(/invite.html?i=번호)도 열림', (await n.textContent('.iv-to')).includes('하늘님께'));

  // ⑥ 글자로만(HTML 아님) · 응답 머리글
  const X = await api({to: '<b>하늘</b>', from: 'x"><img src=x onerror=alert(1)>', message: '<script>alert(1)</script><img src=x onerror=alert(2)>'});
  let alerted = false; n.on('dialog', d => { alerted = true; d.dismiss(); });
  await n.goto(base + '/i/' + X.id); await n.waitForSelector('.iv-gift'); await n.click('.iv-act-closed .iv-link'); await n.waitForSelector('.iv-open .iv-card');
  check('받은 글은 글자로만(태그가 실행되지 않음)', !alerted && (await n.locator('.iv-card img, .iv-card script, .iv-card b:not(.iv-sign b)').count()) === 0 && (await n.textContent('.iv-msg')).includes('<script>'));
  const head = await fetch(`${base}/api/invite?id=${X.id}`);
  check('읽기 응답: 저장 안 함 · 검색 제외 · 주소 안 넘김', head.headers.get('cache-control') === 'no-store' && /noindex/.test(head.headers.get('x-robots-tag') ?? '') && head.headers.get('referrer-policy') === 'no-referrer');

  // ⑦ 컴퓨터 화면
  const D = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const d = await D.newPage(); watch(d);
  await d.goto(url); await d.waitForSelector('.iv-gift'); await d.click('.iv-gift');
  await d.waitForFunction(() => { const c = document.querySelector('.iv-open .iv-card'); return c && getComputedStyle(c).opacity === '1'; }, null, {timeout: 6000});
  check('컴퓨터 화면에서도 열림 · 넘침 없음', await noOverflow(d));
  await d.waitForTimeout(500); await shot(d, 'd1-desktop');
} catch (e) { check('검사 도중 오류', false, e.message); }
check('보안 규칙(CSP) 어김 0', csp.length === 0, csp.slice(0, 2).join(' | '));
check('화면 오류 0', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
await browser.close();
const pass = checks.filter(c => c.ok).length, fail = checks.length - pass;
const report = {schema: 'atlas11-invite-check-1', at: new Date().toISOString(), base, engine: 'chromium(playwright) — 아이폰 Safari · 카카오톡 안 브라우저(웹킷)는 이 기계에서 못 봄', pass, fail, checks,
  notChecked: ['아이폰 Safari', '카카오톡 안 브라우저', '실제 카카오 공유(카카오 열쇠 없음)', '넷리파이 실제 저장소(올린 뒤 확인)']};
await fs.mkdir('reports/atlas11/invite-check', {recursive: true});
await fs.writeFile('reports/atlas11/invite-check/latest.json', JSON.stringify(report, null, 2) + '\n');
console.log(`\n통과 ${pass} · 실패 ${fail}`);
process.exitCode = fail ? 1 : 0;

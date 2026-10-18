#!/usr/bin/env node
/**
 * 60초 시연 영상 찍기 — 친구 카드 → 두 번 → 친구가 보낸 쪽 → 매매일지 → 첫 화면(사장님 2026-10-18 order-0015 [11] 5 · [2] · 일꾼 D1)
 *   가짜 카카오 시험 서버가 먼저 떠 있어야 함(진짜 카카오로 가는 요청 0 · 스위치 파일 config/atlas11/kakao.json 은 그대로 꺼짐):
 *     node scripts/atlas11/invite_dev.mjs --dir site --port 8839 --owner-key testowner-key-1234567890 --fake-kakao
 *   (또는 --spawn: 이 스크립트가 같은 서버를 띄웠다가 끝에 끔)
 *   쓰는 법: node scripts/atlas11/next/demo/record_demo.mjs [--base http://127.0.0.1:8839] [--out <폴더>] [--spawn] [--probe-only] [--scale 2] [--speed 150] [--shots] [--verbose] [--compose-only] [--drop-frames]
 *   하는 일: ① 보낸 사람 카드 글 만들기(p-share.js cardOf — 진짜 카드와 같은 글) ② 걸음 재기(누름 수 · 영상 없음) ③ 글상자 글을 기계 목소리(espeak-ng 한국어)로 읽어 길이 재기
 *            ④ 무대(위 띠 「시험용 가짜 카카오로 찍었어요」 · 폰 화면 · 아래 글상자 + 누름 수)를 Playwright + Chromium 으로 찍기
 *               — 그림은 Chromium 화면 중계(CDP screencast · recordVideo 가 속으로 쓰는 것과 같음)를 받아 그림마다 찍힌 때를 적음. recordVideo 영상 시계는 바쁜 기계에서 실제보다 7 ~ 13% 느리게 가서 소리와 안 맞았음
 *            ⑤ 그림을 찍힌 때대로 놓고 읽기 소리를 그 장면이 시작한 때에 맞춰 demo.mp4(H.264 + AAC) + events.json + notes.md
 *   이 스크립트는 사이트 파일을 고치지 않음 — 무대 · 카드 흉내는 브라우저에만 끼워 줌(/__demo/ 주소) · index.html 에 kakao.js 줄이 없으면 브라우저에서만 끼움(notes 에 적음)
 */
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn, execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {stageHtml, cardHtml, DISCLAIMER} from './stage.mjs';
import {numKo, synth, mixTrack, makeClock, encodeFrames, monotone} from './compose_demo.mjs';

const runFile = promisify(execFile), HERE = path.dirname(fileURLToPath(import.meta.url));
const {chromium} = createRequire('/opt/node-tools/')('playwright');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i + 1] ?? d); };
const flag = n => process.argv.includes(n);
const BASE = arg('--base', 'http://127.0.0.1:8839').replace(/\/+$/, '');
const OUT = path.resolve(arg('--out', '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/demo'));
const SCALE = Number(arg('--scale', '2')), SPEED = Number(arg('--speed', '150'));
const W = 390 * SCALE, H = 844 * SCALE, TOP = 44; // 무대 크기 · 위 띠 높이(390 폭 기준)
const CODE = '005930', DAY = '2026-10-12', MSG = '이거 어때?';
/** 매매일지 답(글로 찾음 — 차례가 바뀌어도 맞음 · 못 찾으면 첫 답) · 세 번째 「클 일이 있다」는 고르지 않음(날짜 칸이 더 생김) */
const ANSWERS = ['내가 따져 봄', '했다', '돈을 잘 번다', '내 돈 열에 하나 이하', '조용히 조금씩 오름', '조금', '팔 곳 정함', '정함', '1년 넘게', '차분', '두 곳'];
const HOLD = {card: 1100, consent: 2200, friend: 1300, q: 850, lines: 950, res: 2600, home: 3400, tail: 1000}; // 눌린 뒤 보여 주는 때(ms) — 누름은 빨리 감지 않음
const VOICE_LAG = 0.03; // 읽기 시작을 글이 뜬 때보다 이만큼(초) 뒤에
const WAIT_MAX = 1000; // 기다림(서버 · 첫 열기)은 이만큼(ms)까지만 보이게 빨리 감음
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const events = [];
const ev = (name, extra = {}) => { const e = {name, t: extra.t ?? Date.now(), ...extra}; events.push(e); return e; };
const fail = msg => { throw new Error(msg); };
let lastStep = {label: 'start', at: Date.now()}; const step = label => { lastStep = {label, at: Date.now()}; if (flag('--verbose')) log('·', label); };

/* ───── 찍을 때 사이트 파일 상태(나중에 바뀌었는지 보려고) ───── */
const WATCH = ['site/next/index.html', 'site/next/app.js', 'site/next/kakao.js', 'site/next/p-share.js', 'site/next/p-why.js', 'site/next/p-share.css', 'config/atlas11/kakao.json'];
async function fileState() {
  const o = {};
  for (const f of WATCH) { try { const b = await fs.readFile(f); o[f] = {size: b.length, sha1: crypto.createHash('sha1').update(b).digest('hex').slice(0, 12)}; } catch { o[f] = null; } }
  return o;
}

/* ───── 가게 자료 · 서버 확인 ───── */
async function getJson(p) { const r = await fetch(BASE + p); if (!r.ok) fail(`${p} ${r.status}`); return r.json(); }
async function preflight() {
  let me; try { me = await (await fetch(BASE + '/api/kakao/me')).json(); } catch { fail(`서버가 안 떠 있어요 — ${BASE}`); }
  if (me?.on !== true) fail('서버가 가짜 카카오 모드가 아니에요(/api/kakao/me on:true 가 아님) — invite_dev.mjs --fake-kakao 로 띄워 주세요');
  const cfg = JSON.parse(await fs.readFile('config/atlas11/kakao.json', 'utf8').catch(() => '{"on":"?"}'));
  return {fakeOn: true, configOn: cfg.on};
}
async function senderData() {
  const [co, days] = await Promise.all([getJson(`/atlas/data/co/${CODE}.json`), getJson('/atlas/data/days.json')]);
  const idx = days.dates.indexOf(DAY) - (co.k0 ?? 0), price = idx >= 0 ? Math.round(co.close[idx]) : null;
  if (!price) fail(`${CODE} 의 ${DAY} 값이 없어요`);
  return {name: co.c.name, price, today: co.c.price, todayDay: co.c.priceDate};
}

/* ───── 걸음 하나하나(재기와 찍기가 같이 씀) ───── */
/** 이 쪽 안에서 요소 위치(폰 화면 안 390 폭 기준) — 가려지면(위 막대 · 아래 단추) 필요한 만큼만 밀어 보이게 · 다른 것에 가려지면 ok:false */
async function rectOf(fr, sel, nth = 0) {
  return fr.evaluate(({sel, nth}) => {
    const el = document.querySelectorAll(sel)[nth]; if (!el) return {err: 'no-element ' + sel + '#' + nth};
    const hdr = document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0, tab = document.querySelector('nav.tabs')?.getBoundingClientRect().top ?? innerHeight;
    const top = hdr + 8, bot = tab - 8;
    let r = el.getBoundingClientRect(), moved = 0;
    if (r.top < top || r.bottom > bot) { const d = r.top < top ? r.top - top : r.bottom - bot; window.scrollBy(0, d); moved = d; r = el.getBoundingClientRect(); }
    // 넓은 단추는 오른쪽 가까이를 누름(누르는 곳 표시가 단추 글을 가리지 않게) · 좁은 것은 가운데
    const fx = r.width >= 250 ? 0.88 : r.width >= 200 ? 0.8 : 0.5, x = r.left + r.width * fx, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
    return {x, y, w: r.width, h: r.height, moved, ok: !!hit && (el === hit || el.contains(hit)), hit: hit ? (hit.className || hit.tagName).toString().slice(0, 40) : null};
  }, {sel, nth});
}
/** 매매일지 한 판 — 질문 열한 개(답 한 번씩) → 마지막 두 줄(말 칩 + 결과 보기) → 결과. tap(sel, nth, kind) 이 실제 누름 · phase(name) 은 알림 */
async function walkJournal(fr, tap, phase = async () => {}) {
  const taps = {q: 0, lines: 0};
  for (let guard = 0; guard < 60; guard++) {
    step('journal 상태 읽기');
    const st = await fr.evaluate(() => ({res: !!document.querySelector('.wy-res'), why: !!document.querySelector('.wy-why'), step: document.querySelector('.wy-step')?.textContent ?? '',
      opts: [...document.querySelectorAll('.wy-opt .wy-ot')].map(e => e.textContent.trim()), date: !!document.querySelector('.wy-date'), chips: document.querySelectorAll('.wy-chip').length}));
    if (st.res) break;
    if (st.opts.length) {
      if (st.date) fail('3번 「클 일이 있다」 날짜 칸이 열렸어요 — 이 시연은 그 답을 고르지 않아요');
      let k = st.opts.indexOf(ANSWERS[taps.q]); if (k < 0) k = 0;
      if (taps.q === 0) await phase('q');
      await tap('.wy-opt', k, 'q'); taps.q++;
      step('journal 다음 쪽 기다림');
      await fr.waitForFunction(prev => document.querySelector('.wy-res') || document.querySelector('.wy-why') || ((document.querySelector('.wy-step')?.textContent ?? '') !== prev), st.step, {timeout: 10000});
    } else if (st.why) {
      await phase('lines');
      if (!st.chips) fail('마지막 두 줄 말 칩이 없어요');
      await tap('.wy-chip', 0, 'lines'); taps.lines++;
      await tap('.wy-next', 0, 'lines'); taps.lines++;
      await fr.waitForSelector('.wy-res', {timeout: 10000});
    } else await sleep(150);
  }
  return taps;
}

/* ───── 재기(영상 없음) ───── */
async function probe(browser, S) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 700}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  await ctx.addInitScript(() => { window.__GODORI_KAKAO_TEST__ = true; });
  const p = await ctx.newPage();
  const res = {};
  try {
    await p.goto(`${BASE}/next/?dev=1`, {waitUntil: 'load'});
    await p.waitForFunction(() => document.querySelector('#view > :not(.boot)'), null, {timeout: 20000});
    // 진짜 카드 글 — p-share.js cardOf · kakao.js startUrl(켜진 서버가 아니어도 주소 셈은 같음)
    res.card = await p.evaluate(async ({code, day, price, name, msg}) => {
      try {
        const P = await import('/next/p-share.js'), Kk = await import('/next/kakao.js');
        const see = P.stockUrl({code, day, price, kind: 'share', msg}, location.origin + '/next/?dev=1');
        const K = Kk.createKakao({fetch: null, test: true});
        return {real: true, card: P.cardOf({name, msg, lead: '', price, day, see}, K, location.origin), see};
      } catch (e) { return {real: false, why: String(e).slice(0, 160)}; }
    }, {code: CODE, day: DAY, price: S.price, name: S.name, msg: MSG});
    const see = `${BASE}/next/?dev=1#/s/${CODE}/${DAY}/${S.price}/s/${Buffer.from(MSG).toString('base64url')}`;
    if (!res.card.real) { // 카드 글을 못 만들면 같은 식을 손으로
      const to = '/next/?dev=1#/s/' + CODE + '/' + DAY + '/' + S.price + '/s/' + Buffer.from(MSG).toString('base64url');
      const md = `${+DAY.slice(5, 7)}월 ${+DAY.slice(8, 10)}일`, value = `${md} 값 ${S.price.toLocaleString('ko-KR')}원`;
      res.card = {real: false, why: res.card.why, see, card: {title: S.name, value, said: [MSG], description: MSG + '\n' + value, imageUrl: BASE + '/og-makbi.jpg', url: see,
        buttons: [{title: '카카오로 시작하기', url: BASE + '/api/kakao/start?to=' + encodeURIComponent(to)}, {title: '그냥 보기', url: see}]}};
    }
    // 마지막 쪽까지 한 번 돌려 누름 수 재기(질문 · 마지막 두 줄) — 누름은 그냥 click
    await p.goto(res.card.see, {waitUntil: 'load'}); await p.waitForSelector('.wy-opt', {timeout: 20000});
    const direct = async (sel, nth) => { await p.locator(sel).nth(nth).scrollIntoViewIfNeeded(); await p.locator(sel).nth(nth).click(); };
    res.taps = await walkJournal(p.mainFrame(), direct);
    res.homeTab = await p.evaluate(() => !!document.querySelector('nav.tabs a[data-tab="home"]'));
  } finally { await ctx.close(); }
  return res;
}

/* ───── 글상자 글(읽는 글 = 화면 글) ───── */
const NB = '\u00a0'; // 줄이 바뀔 때 「열한 / 번」으로 끊기지 않게 숫자와 「번」 사이는 안 끊기는 띄어쓰기 — 읽을 때는 보통 띄어쓰기로
const spoken = t => t.replace(/\u00a0/g, ' ');
function captionsFor(q, l, total) {
  return {
    n0: DISCLAIMER,
    n1: `카드에서 ${numKo(2)}${NB}번만 누르면 가입 끝`,
    n2: `질문마다 한${NB}번씩, ${numKo(q)}${NB}번 눌러요`,
    n3: `마지막 두 줄은 ${numKo(l)}${NB}번 눌러요`,
    n4: `첫 화면까지 모두 ${numKo(total)}${NB}번이에요`,
    n5: DISCLAIMER,
  };
}

/* ───── 찍기 ───── */
async function record(browser, {card, caps, clips, patched}) {
  const framesDir = path.join(OUT, 'frames'); await fs.rm(framesDir, {recursive: true, force: true}); await fs.mkdir(framesDir, {recursive: true});
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', bypassCSP: true});
  await ctx.addInitScript(() => { window.__GODORI_KAKAO_TEST__ = true; });
  await ctx.route('**/__demo/stage.html', r => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: stageHtml({u: SCALE})}));
  await ctx.route('**/__demo/card.html', r => r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: cardHtml(card.card)}));
  await ctx.route(u => /^\/next\/(index\.html)?$/.test(u.pathname), async r => { // index.html 에 kakao.js 줄이 아직 없으면 브라우저에서만 끼움(통합이 넣었으면 그대로 지나감)
    const resp = await r.fetch(); let body = await resp.text();
    if (!body.includes('/next/kakao.js')) { body = body.replace('<script type="module" src="/next/app.js"></script>', '<script type="module" src="/next/app.js"></script>\n<script type="module" src="/next/kakao.js"></script>'); patched.index = true; }
    const headers = {...resp.headers()}; delete headers['content-length']; delete headers['content-encoding'];
    await r.fulfill({status: resp.status(), headers, body});
  });
  const hosts = {}; // 이 브라우저가 보낸 요청이 간 곳 — 진짜 카카오(바깥)로 간 요청이 없는지 보려고 셈
  ctx.on('request', r => { try { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol)) hosts[u.host] = (hosts[u.host] ?? 0) + 1; } catch {} });
  const page = await ctx.newPage();
  const dog = setInterval(async () => { // 25초 넘게 한 걸음도 못 나가면 알리고 멈춤
    if (Date.now() - lastStep.at < 25000) return;
    clearInterval(dog); console.error('멈춤: 마지막 걸음 =', lastStep.label);
    await page.screenshot({path: path.join(OUT, 'stuck.png'), timeout: 5000}).catch(e => console.error('화면도 못 찍음', String(e).slice(0, 80)));
    process.exit(2);
  }, 5000);
  const errors = []; page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });

  // 화면 중계 받기 — 그림마다 찍힌 때(Chromium 시계 · 서버 시계와 같음)를 적음
  const frames = [], writes = []; let fi = 0;
  const cdp = await ctx.newCDPSession(page);
  cdp.on('Page.screencastFrame', ({data, metadata, sessionId}) => {
    const file = path.join(framesDir, `f${String(fi++).padStart(5, '0')}.jpg`);
    frames.push({file, t: metadata.timestamp * 1000});
    writes.push(fs.writeFile(file, Buffer.from(data, 'base64')));
    cdp.send('Page.screencastFrameAck', {sessionId}).catch(() => {});
  });
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1});

  let tapN = 0; const shot = async name => { if (flag('--shots')) await page.screenshot({path: path.join(OUT, `shot-${name}.png`)}); };
  const stage = (fn, ...a) => page.evaluate(([fn, a]) => window.stage[fn](...a), [fn, a]);
  // 읽는 글은 모두 아래 글상자에 같은 글로 뜸(맨 위 띠의 「시험용 가짜 카카오로 찍었어요」는 따로 늘 떠 있음) — 글상자 글을 바꿀 때 오른쪽 칸 이름표도 같은 그림에 함께 바꿈
  const say = async (id, tag) => { const r = await stage('cap', caps[id], tag); ev('say', {id, text: caps[id], t: r.t, seq: r.seq, sec: clips[id].sec, speechEnd: clips[id].speechEnd}); return r.t; };
  let lastSay = null;
  const waitVoice = async (pad = 250) => { if (!lastSay) return; const left = lastSay.t + lastSay.sec * 1000 + pad - Date.now(); if (left > 0) await sleep(left); };
  const speak = async (id, tag) => { await waitVoice(); const t = await say(id, tag); lastSay = {t, sec: clips[id].sec}; return t; };
  let fr = null;
  /** 폰 화면 안 요소를 누름 — 누르는 곳 표시 + 누름 수 올림 → 잠깐 뒤 실제 누름 */
  const tap = async (sel, nth = 0, kind = '') => {
    step(`tap ${sel}#${nth} 위치 재기`);
    const r = await rectOf(fr, sel, nth);
    if (r.err) fail(r.err); if (!r.ok) fail(`가려진 단추 ${sel}#${nth} → ${r.hit}`);
    if (r.moved) await sleep(350);
    const rr = r.moved ? await rectOf(fr, sel, nth) : r;
    const sx = rr.x, sy = rr.y + TOP;
    step(`tap ${sel}#${nth} 표시`);
    tapN++;
    const tm = await stage('tapNum', sx, sy, tapN);
    await sleep(300);
    const tc = Date.now(); ev('tap', {n: tapN, kind, sel, t: tc, marker: tm.t, seq: tm.seq, x: Math.round(sx), y: Math.round(sy)});
    step(`tap ${sel}#${nth} 클릭`);
    await page.mouse.click(sx * SCALE, sy * SCALE);
    step(`tap ${sel}#${nth} 끝`);
    return tc;
  };

  try {
    await page.goto(`${BASE}/__demo/stage.html`, {waitUntil: 'load'});
    await page.waitForSelector('#phone');
    fr = page.frame({name: 'phone'}); if (!fr) fail('폰 화면 틀을 못 찾음');
    await fr.goto(`${BASE}/__demo/card.html`, {waitUntil: 'load'});
    await fr.waitForSelector('#start'); await sleep(700);
    for (let i = 0; i < 40 && frames.length === 0; i++) await sleep(100); // 시작 때의 그림이 이미 와 있어야 함
    if (!frames.length) fail('시작 그림이 안 왔어요(화면 중계가 안 나옴)');
    /* 시작 — 영상은 첫 글상자 글(n0)이 뜨는 때부터 */
    const r0 = await stage('cap', caps.n0, '');
    const tOff = r0.t; ev('start', {t: tOff});
    ev('say', {id: 'n0', text: caps.n0, t: r0.t, seq: r0.seq, sec: clips.n0.sec, speechEnd: clips.n0.speechEnd});
    lastSay = {t: r0.t, sec: clips.n0.sec};
    await shot('1-card');

    /* 장면 1 — 친구 카드 → 누름 1 → 가짜 카카오 동의 → 누름 2 → 친구가 보낸 쪽 */
    await speak('n1', '가입'); ev('scene', {id: 'card'});
    await sleep(HOLD.card);
    await tap('#start', 0, 'card');
    await fr.waitForSelector('#agree', {timeout: 20000}); ev('consent-shown');
    await shot('2-consent');
    await sleep(HOLD.consent);
    await tap('#agree', 0, 'consent');
    await fr.waitForSelector('.wy-opt', {timeout: 30000}); ev('friend-shown');
    await shot('3-friend');
    await sleep(HOLD.friend);

    /* 장면 2 — 매매일지: 질문마다 한 번 → 마지막 두 줄 → 결과 */
    await speak('n2', '질문'); ev('scene', {id: 'journal'});
    const taps = await walkJournal(fr, async (sel, nth, kind) => {
      await tap(sel, nth, kind);
      await sleep(kind === 'q' ? HOLD.q : HOLD.lines);
    }, async name => {
      if (name === 'lines') { await sleep(300); await speak('n3', '두 줄'); await shot('4-lines'); await sleep(HOLD.lines); }
    });
    ev('result-shown'); await shot('5-result');
    await sleep(HOLD.res);

    /* 장면 3 — 첫 화면 */
    await speak('n4', '첫 화면'); ev('scene', {id: 'home'});
    await sleep(700);
    await tap('nav.tabs a[data-tab="home"]', 0, 'home');
    await fr.waitForFunction(() => /^#\/?$/.test(location.hash) && document.querySelector('#view > :not(.boot)'), null, {timeout: 20000}); ev('home-shown');
    await sleep(1200); await shot('6-home');
    await sleep(HOLD.home);
    await speak('n5'); await sleep(clips.n5.sec * 1000 + HOLD.tail);
    const tEnd = Date.now(); ev('end', {t: tEnd});
    clearInterval(dog);
    await cdp.send('Page.stopScreencast').catch(() => {});
    await Promise.all(writes);
    const order = frames.reduce((n, f, i) => n + (i && f.t < frames[i - 1].t ? 1 : 0), 0); // 순서가 거꾸로 온 그림 수
    return {ctx, taps, tapN, errors, tOff, tEnd, frames, outOfOrder: order, hosts};
  } catch (e) {
    clearInterval(dog);
    await page.screenshot({path: path.join(OUT, 'fail.png')}).catch(() => {});
    e.partial = {events, errors};
    await ctx.close().catch(() => {});
    throw e;
  }
}

/* ───── 메모 ───── */
function notesText(rep) {
  const nm = {card: '장면 1 · 친구 카드와 가입(누름 2번)', journal: '장면 2 · 매매일지(질문 11 + 마지막 두 줄 2)', home: '장면 3 · 첫 화면(누름 1번)'};
  const sc = rep.scenes.map(s => `- ${nm[s.id]}: ${s.at}초부터`).join('\n');
  const says = rep.says.map(s => `- ${s.at}초부터 · ${s.sec}초 · 「${s.text.replace(/ /g, ' ')}」`).join('\n');
  const frameNote = rep.says.concat(rep.tapTimes).some(x => x.byFrame === false)
    ? '일부 때는 그림에서 못 찾아 적어 둔 때로 맞춤(아래 확인 결과 참고)' : `글이 바뀐 때 · 누르는 곳 표시가 뜬 때는 모두 찍은 그림에서 처음 보인 때로 맞춤(일어난 때와 그림에서 처음 보인 때의 차 ${rep.latency.minMs} ~ ${rep.latency.maxMs}ms · ${rep.latency.n}곳)`;
  const mm = rep.info.streams?.find(x => x.codec_name === 'h264');
  return `# 60초 시연 영상 메모 (일꾼 D1 · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)

영상: ${rep.out}
길이 ${rep.sec}초(60초 안) · ${mm?.width}×${mm?.height} · H.264 + AAC · 폰 390×700 화면을 2배로 찍음

## 장면 시각(0초 = 친구 카드가 화면에 뜬 때 · 맨 위 띠 「${DISCLAIMER}」는 처음부터 끝까지 떠 있음)
${sc}

## 누름 수(찍을 때 센 것 · 영상 아래 「누름 N」 칸과 같음)
- 가입: 카드 단추 ${rep.taps.card} + 카카오 동의 ${rep.taps.consent} = ${rep.taps.card + rep.taps.consent}번
- 매매일지 질문 ${rep.taps.q}번(질문마다 한 번) + 마지막 두 줄 ${rep.taps.lines}번(말 칩 하나 + 「결과 보기」)
- 첫 화면: ${rep.taps.home}번(아래 「오늘 장」)
- 합계 ${rep.total}번 — 카드에서 첫 화면까지(우리 화면에서 더 누른 것 0)
- 카카오 동의 화면 안의 누름 수는 가짜 화면으로는 못 잼 → 진짜 카카오는 사장님 폰에서 셈(order [11] 3)

## 읽어 준 글 = 글상자 글(같은 글 · 읽는 때 = 글이 뜬 때)
${says}
- 목소리는 espeak-ng 한국어 기계 목소리예요(사람 목소리 아님). 귀로 들어 확인하지는 못했고, 소리가 들리는 때 · 길이 · 크기만 기계로 맞대어 봤어요.
- 누를 때 나는 「톡」 소리는 누르는 곳 표시가 뜬 때에 맞췄어요.

## 가짜인 것 · 없는 것
- 카톡 안의 그림 카드는 카카오톡 안에서만 그려져서 못 찍음 → 카드 모양 흉내 한 장(글 · 단추 이름 · 주소는 p-share.js cardOf() 진짜 값${rep.cardReal ? '' : ' — 못 불러서 같은 식으로 손으로 만듦'})
- 카카오 동의 화면은 tests/atlas11/fake-kakao 의 가짜 화면(화면 위에 「가짜 카카오 · 시험용 화면(진짜 카카오 아님)」이 늘 적힘) · 진짜 카카오로 간 요청 0 · config/atlas11/kakao.json 은 그대로 꺼짐
- 서버는 이 영상용으로 따로 띄운 시험 서버(--fake-kakao · 열쇠도 가짜) · 끝에 끔
- 찍는 동안 브라우저가 요청을 보낸 곳: ${Object.entries(rep.hosts ?? {}).map(([h, n]) => `${h} ${n}번`).join(' · ') || '(적어 두지 못함)'} → 이 컴퓨터 밖으로 간 요청 ${Object.keys(rep.hosts ?? {}).filter(h => !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(h)).length}곳
- index.html 에 kakao.js 줄: ${rep.patched.index ? '아직 없어서 브라우저에서만 끼워 찍음' : '이미 들어 있어 그대로 찍음'}
- 가입을 마친 친구 길만 찍음 → 매매일지 끝의 「이 기록 지키기」 권유 칸은 안 뜸(가입 안 한 사람 길은 안 찍음)
- 종목 = 삼성전자 · 보낸 날 값 = 사이트 자료(10월 12일 251,000원) 그대로 · 지금값 = 10월 13일 종가
- 기다림(서버 · 첫 열기) 빨리 감은 곳: ${rep.speedups.length ? rep.speedups.map(x => `${x.sec}초 구간을 ${x.speed.toFixed(1)}배`).join(' · ') : '없음'}(누름은 안 감음)
- 화면 오류 ${rep.errors.length}건${rep.errors.length ? ': ' + rep.errors.join(' | ') : ''}

## 찍은 방법(소리와 글이 어긋나지 않게)
- Playwright 가 영상 파일(recordVideo)로 찍으면 영상 시계가 바쁜 기계에서 실제보다 7 ~ 13% 느리게 가서(첫 시도에서 최대 4초 어긋남) 쓰지 않음.
- 대신 크로미엄 화면 중계(CDP screencast)로 그림 ${rep.frames}장을 받아 찍힌 때대로 이어 붙임 — 중계가 적어 보내는 때는 앞뒤로 흔들려(순서가 거꾸로 온 그림 ${rep.outOfOrder}장) 온 차례는 두고 때만 고름.
- 글상자 글이 바뀔 때마다 그림 아래 왼쪽 끝에 번호를 새겨 두고, 찍은 그림에서 그 번호를 읽어 「글이 처음 보인 그림」을 찾아 읽는 소리를 거기에 맞춤(번호 칸은 영상에서 지움 · 못 읽은 그림 ${rep.seqBad}장). ${frameNote}.

## 찍을 때 사이트 파일(앞 12자리 · 나중에 바뀌었는지 맞대어 보려고)
${Object.entries(rep.siteFiles ?? {}).map(([f, v]) => `- ${f}: ${v ? v.sha1 + ' · ' + v.size + '바이트' : '없음'}`).join('\n')}
- 찍는 동안 바뀐 파일: ${rep.siteChangedWhileRecording?.length ? rep.siteChangedWhileRecording.join(' · ') : '없음'}

## 걸린 시간
- 찍고 합치는 데 ${rep.tookSec}초
`;
}

/* ───── 큰 흐름 ───── */
/** 찍은 그림마다 무대가 새겨 둔 번호(#seq)를 읽음 — 읽는 일은 seq_scan.py · 엉뚱하게 읽힌 값(앞 값보다 작거나 갑자기 큰 값)은 -1 */
async function scanSeq(frames) {
  const listPath = path.join(OUT, 'frames-list.json');
  await fs.writeFile(listPath, JSON.stringify(frames.map(f => f.file)));
  const {stdout} = await runFile('python3', ['-I', path.join(HERE, 'seq_scan.py'), listPath, '--scale', String(SCALE)], {maxBuffer: 16 * 1024 * 1024});
  const raw = JSON.parse(stdout); let last = 0, bad = 0;
  const seqs = raw.map(v => { if (v < 0 || v < last || v > last + 8) { bad++; return -1; } last = v; return v; });
  await fs.rm(listPath, {force: true});
  return {seqs, bad, max: last};
}

/** 1단계 — 서버 확인 · 재기 · 읽기 만들기 · 찍기. 찍은 결과(그림 · 때 · 일어난 일)를 capture.json 에 적음 */
async function capturePhase() {
  const t0 = Date.now();
  const pf = await preflight(); log('서버 확인', pf);
  const S = await senderData(); log('보낸 사람 자료', S);
  const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  try {
    const pr = await probe(browser, S);
    log('재기', JSON.stringify({card: pr.card.real ? 'cardOf(진짜)' : 'cardOf 못 씀 → 손으로: ' + pr.card.why, taps: pr.taps, homeTab: pr.homeTab}));
    const total = 2 + pr.taps.q + pr.taps.lines + 1;
    const caps = captionsFor(pr.taps.q, pr.taps.lines, total);
    const clips = {};
    await fs.mkdir(path.join(OUT, 'tts'), {recursive: true});
    for (const [id, text] of Object.entries(caps)) clips[id] = await synth(spoken(text), path.join(OUT, 'tts', id + '.wav'), {speed: SPEED});
    log('읽기 길이(초)', Object.fromEntries(Object.entries(clips).map(([k, v]) => [k, +v.sec.toFixed(2)])));
    if (flag('--probe-only')) { await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify({pr, caps, clips}, null, 1)); return null; }
    const patched = {index: false};
    const filesBefore = await fileState();
    const R = await record(browser, {card: pr.card, caps, clips, patched});
    const filesAfter = await fileState();
    const changed = WATCH.filter(f => JSON.stringify(filesBefore[f]) !== JSON.stringify(filesAfter[f]));
    if (changed.length) log('찍는 동안 바뀐 사이트 파일', changed.join(' · '));
    await R.ctx.close();
    log('찍기 끝', `그림 ${R.frames.length}장 · 순서 거꾸로 온 그림 ${R.outOfOrder}장`);
    const outside = Object.keys(R.hosts).filter(h => !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(h));
    if (outside.length) fail('이 컴퓨터 밖으로 요청이 갔어요: ' + outside.join(' · '));
    const sc = await scanSeq(R.frames);
    R.frames.forEach((f, i) => { f.seq = sc.seqs[i]; });
    log('번호 읽기', `읽은 그림 ${R.frames.length - sc.bad}장 · 못 읽은 그림 ${sc.bad}장 · 마지막 번호 ${sc.max}`);
    const cap = {events, tOff: R.tOff, tEnd: R.tEnd, frames: R.frames, errors: R.errors, outOfOrder: R.outOfOrder, seqBad: sc.bad, hosts: R.hosts, siteFiles: filesBefore, siteChangedWhileRecording: changed, patched, cardReal: pr.card.real, probe: pr.taps, caps,
      clips: Object.fromEntries(Object.entries(clips).map(([k, v]) => [k, {wav: v.wav, text: v.text, sec: v.sec, speechStart: v.speechStart, speechEnd: v.speechEnd}])), captureSec: Math.round((Date.now() - t0) / 1000)};
    await fs.writeFile(path.join(OUT, 'capture.json'), JSON.stringify(cap));
    return cap;
  } finally { await browser.close().catch(() => {}); }
}

/** 2단계 — 읽기 소리를 「글이 처음 보인 그림」의 때에 놓고 한 줄 소리로 → 그림을 찍힌 때대로 놓아 mp4 · events.json · notes.md */
async function composePhase(cap) {
  const t0 = Date.now();
  const evs = cap.events, E = name => evs.filter(e => e.name === name), clips = cap.clips;
  // 기다림 구간만 빨리 감음(누름은 안 감음)
  const speedups = [];
  for (const [tapKind, shown] of [['consent', 'friend-shown'], ['home', 'home-shown']]) {
    const a = E('tap').find(t => t.kind === tapKind), b = E(shown)[0];
    if (a && b) { const from = a.t + 450, to = b.t; if (to - from > WAIT_MAX + 300) speedups.push({from, to, speed: Math.min(12, (to - from) / WAIT_MAX), sec: +((to - from) / 1000).toFixed(1)}); }
  }
  const frames = monotone(cap.frames); // 그림이 온 차례 = 찍은 차례 · 찍힌 때만 흔들려서 차례는 두고 때를 고름
  /** 번호 seq 가 처음 보인 그림의 때(없으면 null) */
  const seen = seq => { if (seq == null) return null; const f = frames.find(f => f.seq >= 0 && f.seq >= seq); return f ? f.t : null; };
  const tStart = seen(E('say').find(e => e.id === 'n0')?.seq) ?? cap.tOff; // 영상 시작 = 첫 글상자 글이 처음 보인 그림
  const clock = makeClock(tStart, speedups), length = clock.out(cap.tEnd), sec = t => clock.out(t);
  const lat = []; // 글 · 표시가 일어난 때와 그림에서 처음 보인 때의 차(ms)
  const sayEv = E('say').map(e => { const v = seen(e.seq); if (v != null) lat.push(v - e.t); return {id: e.id, text: e.text, sec: e.sec, speechStart: clips[e.id].speechStart, speechEnd: clips[e.id].speechEnd, byFrame: v != null, at: sec(v ?? e.t)}; });
  for (let i = 1; i < sayEv.length; i++) { // 앞 읽기의 말소리가 끝난 뒤에 다음 말소리가 시작해야 함
    const prev = sayEv[i - 1], cur = sayEv[i];
    if (cur.at + VOICE_LAG + cur.speechStart < prev.at + VOICE_LAG + prev.speechEnd + 0.05) fail(`읽는 소리가 겹침: ${prev.id} 와 ${cur.id}`);
  }
  const tapEv = E('tap').map(e => { const v = seen(e.seq); if (v != null) lat.push(v - e.marker); return {...e, byFrame: v != null, vis: v ?? e.marker}; });
  const latMin = Math.min(...lat), latMax = Math.max(...lat);
  if (lat.length < 20 || latMin < -400 || latMax > 2500) fail(`그림에서 찾은 때가 이상해요: ${lat.length}곳 · 가장 이른 ${Math.round(latMin)}ms · 가장 늦은 ${Math.round(latMax)}ms`);
  for (let i = 1; i < tapEv.length; i++) if (tapEv[i].vis <= tapEv[i - 1].vis) fail(`누름 ${tapEv[i].n} 이 앞 누름보다 먼저 보여요`);
  const mixed = await mixTrack({clips: sayEv.map(s => ({wav: clips[s.id].wav, at: s.at + VOICE_LAG})), ticks: tapEv.map(t => sec(t.vis)), length: length + 0.3, out: path.join(OUT, 'mix.wav')});
  const out = path.join(OUT, 'demo.mp4');
  const enc = await encodeFrames({frames, tOff: tStart, tEnd: cap.tEnd, clock, audio: path.join(OUT, 'mix.wav'), out, listPath: path.join(OUT, 'frames.txt')});
  const byKind = k => tapEv.filter(t => t.kind === k).length;
  const sayAt = id => sayEv.find(s => s.id === id)?.at;
  const rep = {
    out, sec: +length.toFixed(1), total: tapEv.length, taps: {card: byKind('card'), consent: byKind('consent'), q: byKind('q'), lines: byKind('lines'), home: byKind('home')},
    scenes: [{id: 'card', at: +sayAt('n1').toFixed(1)}, {id: 'journal', at: +sayAt('n2').toFixed(1)}, {id: 'home', at: +sayAt('n4').toFixed(1)}],
    says: sayEv.map(s => ({id: s.id, at: +s.at.toFixed(1), sec: +s.sec.toFixed(1), text: s.text, byFrame: s.byFrame})),
    tapTimes: tapEv.map(t => ({n: t.n, kind: t.kind, at: +sec(t.vis).toFixed(1), byFrame: t.byFrame})),
    timeline: {says: sayEv.map(s => ({id: s.id, at: +s.at.toFixed(3), voiceStart: +(s.at + VOICE_LAG + s.speechStart).toFixed(3), voiceEnd: +(s.at + VOICE_LAG + s.speechEnd).toFixed(3)})), taps: tapEv.map(t => ({n: t.n, at: +sec(t.vis).toFixed(3)}))},
    speedups, patched: cap.patched, cardReal: cap.cardReal, errors: cap.errors, frames: cap.frames.length, outOfOrder: cap.outOfOrder, seqBad: cap.seqBad, latency: {n: lat.length, minMs: Math.round(latMin), maxMs: Math.round(latMax)}, hosts: cap.hosts, siteFiles: cap.siteFiles, siteChangedWhileRecording: cap.siteChangedWhileRecording,
    probe: cap.probe, mix: mixed, info: enc.info, enc: {used: enc.used, sum: enc.sum, length: enc.length}, tookSec: cap.captureSec + Math.round((Date.now() - t0) / 1000),
  };
  await fs.writeFile(path.join(OUT, 'events.json'), JSON.stringify({events: evs, rep}, null, 1));
  await fs.writeFile(path.join(OUT, 'notes.md'), notesText(rep));
  log('완료', JSON.stringify({sec: rep.sec, total: rep.total, taps: rep.taps, frames: rep.frames, outOfOrder: rep.outOfOrder, seqBad: rep.seqBad, byFrame: [...rep.says, ...rep.tapTimes].filter(x => x.byFrame === false).length, took: rep.tookSec}));
  return rep;
}

async function main() {
  await fs.mkdir(OUT, {recursive: true});
  let server = null;
  if (flag('--spawn')) {
    const port = new URL(BASE).port;
    server = spawn('node', ['scripts/atlas11/invite_dev.mjs', '--dir', 'site', '--port', port, '--owner-key', 'testowner-key-1234567890', '--fake-kakao'], {stdio: 'ignore'});
    for (let i = 0; i < 40; i++) { await sleep(250); try { const r = await fetch(BASE + '/api/kakao/me'); if (r.ok) break; } catch {} }
  }
  try {
    let cap;
    if (flag('--compose-only')) cap = JSON.parse(await fs.readFile(path.join(OUT, 'capture.json'), 'utf8')); // 찍어 둔 것으로 소리 · 영상만 다시
    else cap = await capturePhase();
    if (!cap) return;
    await composePhase(cap);
    if (flag('--drop-frames')) await fs.rm(path.join(OUT, 'frames'), {recursive: true, force: true});
  } finally { if (server) { server.kill('SIGTERM'); await sleep(300); } }
}
main().catch(e => { console.error('실패:', e.message); if (e.partial) console.error(JSON.stringify(e.partial).slice(0, 1500)); process.exit(1); });

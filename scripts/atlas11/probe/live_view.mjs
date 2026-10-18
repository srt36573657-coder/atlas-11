// 탐침 — 올라간 사이트(aaa7377.com)를 진짜 브라우저(휴대폰 크기)로 열어 봄(사장님 2026-10-13 03:35 「못한거 해내」 · 03:38 「모든 흔적 다 지워」)
//   깃허브 실행기에서만 바깥에 닿음 · 결과 reports/atlas11/probe/live-view/(그림 · summary.json)
//   ① 소개 그림 · 영상 · 달 · 링크 미리보기 파일을 받아 git 블롭 번호로 셈 — 옛 그림(지운 판 43개) 가운데 하나라도 나오면 실패
//   ② 첫 화면(먹빛 판 · 2026-10-15 09:41 · 규칙 67) 시장 칸 · 고른 곳 칸 · ③ 업데이트 탭의 10월 12일 21:11 줄 · ④ 소개 한 장(hello.html) · ⑤ 옛 판 첫 화면 띠 — 그림으로 남김
//   ⑥ 고도리(/ · 2026-10-17 21:10 「하나로 묶은 명령문」) — 아래 단추 다섯 · 창 제목 = 탭 이름(한국어 · 영어) · 질문 칸은 종목 고르기부터 · 고도리 칸 잠금 → 기록을 넣으면 열림 · 「틀린다면 이유」 ·
//      보유종목(점검 → 편지 → 바로 가기 → 본 기록) · 회사 화면 단추 셋 + 「이 회사로 왜 사?」 · 보내기 글상자 · 시황 사실 수 = 자료 · 쓰지 않을 말(words.js screenHits)
//   2026-10-18 첫 번째 묶음에 맞춤 — 고도리 칸: 잠금 = section.gdr.lock1 a.gdr-l1(→ #/why) · 오늘 끝낸 날 첫 화면 = section.gdr.today1(a.gdr-t1a → #/gdr · a.gdr-t1b → #/why) · 쉬어 가는 날 = rest1 한 줄 · 어제만 끝냈으면 열린 칸 · 첫 화면 = 일곱 덩이(칩 → 이야기 입구 → 띠 → 질문 칸 → 고도리 칸 → 더 보기 → 안전 줄 · 카드 없음) ·
//      회사 화면 = 탭 넷(nav.wtabs · 4 ~ 7단 · 옛 일곱 칸 없음) · 「한 달 동안 ±n%」 · 보유종목 편지는 접는 칸(.hd-fold) 안 · 칩 열 개
//   시험: LIVE_BASE=http://127.0.0.1:<포트>(고도리 앱이 / 에) · LIVE_OUT=<폴더> · LIVE_STEPS=<단계 이름,…>(시험에서만) · PW_DIR · PW_EXE=<브라우저 파일> — 올라간 사이트(기본)는 늘 모든 단계
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {nameScan, oldNamesIn, allowFromData, LETTER_TITLE, TITLE_TAIL, NEW_NAME} from '../next/rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76 · 2026-10-17 17:34 「보드리를 고도리로」)
import {josa, NAME_EN} from '../../../site/next/brand.js'; // 새 화면(보드리)에 옛 이름이 남았나(2026-10-17 15:48 「아틀란스에서 보드리로 모두 변경해」)
import {screenHits} from '../../../site/next/words.js'; // 화면에 쓰지 않을 말 한 곳(2026-10-17 21:10 [4] 4 — 「사라져」 · 「공매도」는 셈 밖 · includes('사라') 로 바로 보지 않음)
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
// 기본 = 올라간 사이트(바깥) · 시험 = LIVE_BASE(이 기계의 시험 서버 — 고도리 앱이 / 에 있어야 함) · LIVE_OUT(결과 폴더) · LIVE_STEPS(고른 단계만 — 시험에서만 · 올라간 사이트에서는 늘 모든 단계)
const LIVE_URL = 'https://aaa7377.com', B = (process.env.LIVE_BASE || LIVE_URL).replace(/\/+$/, ''), LIVE = B === LIVE_URL;
const ONLY = !LIVE && process.env.LIVE_STEPS ? new Set(process.env.LIVE_STEPS.split(',').map(s => s.trim()).filter(Boolean)) : null;
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-view'; await fs.mkdir(dir, {recursive: true});
const NREADY = new Set(((/const READY = new Set\(\[([^\]]*)\]\);/.exec(await fs.readFile(new URL('../../../site/next/app.js', import.meta.url), 'utf8')) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1))); // 새 아틀란스로 옮긴 쪽(규칙 74)
// 지운 옛 그림 판(git 블롭 번호 · 그림이 아니라 번호만)
const OLD = new Set(`${(await fs.readFile('scripts/atlas11/probe/old-media-blobs.txt', 'utf8'))}`.split(/\s+/).filter(Boolean));
const blobId = buf => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const MEDIA = ['/media/makbi-moon.svg', '/media/makbi-icon.svg', '/media/makbi-hello.svg', '/media/makbi-poster.jpg', '/media/makbi-intro.mp4', '/media/makbi-intro.webm', '/og-makbi.jpg',
  // 옛 주소 — 지운 그림이 다시 나오지 않는지(없거나 첫 화면 글이 와야 함)
  '/media/atlas-moon-face.jpg', '/media/atlas-hello-wide.jpg', '/media/atlas-hello-132.jpg', '/media/atlas-hello-face.jpg', '/media/atlas-hello.jpg', '/media/atlas-hello.mp4', '/media/atlas-hello.webm', '/og-hello.jpg'];
const out = {made: new Date().toISOString(), base: B, live: LIVE, media: [], oldFound: 0, sameAsRepo: 0, shots: [], texts: {}, errors: [], skipped: []};
for (const p of MEDIA) {
  try {
    const r = await fetch(B + p + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)});
    const buf = Buffer.from(await r.arrayBuffer()), id = blobId(buf);
    let repo = null; try { repo = blobId(await fs.readFile('site' + p)); } catch { /* 저장소에 없음 */ }
    const row = {path: p, status: r.status, bytes: buf.length, old: OLD.has(id), sameAsRepo: repo === id};
    out.media.push(row); if (row.old) out.oldFound++; if (row.sameAsRepo) out.sameAsRepo++;
  } catch (e) { out.errors.push(`${p}: ${String(e.message).slice(0, 80)}`); }
}
const b = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {}); // PW_EXE = 이 기계의 브라우저(시험) · 깃허브 실행기는 PW_DIR 의 playwright 가 받은 브라우저
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const page = await ctx.newPage();
const shot = async (name, opts = {}) => { const f = `${dir}/${name}.png`; await page.screenshot({path: f, ...opts}); out.shots.push(f); };
const step = async (name, fn) => { if (ONLY && !ONLY.has(name)) { out.skipped.push(name); return; } try { await fn(); } catch (e) { out.errors.push(`${name}: ${String(e.message).slice(0, 120)}`); } };
// 고도리 화면 글의 쓰지 않을 말(words.js screenHits) — 남의 글 [data-proper] · 원문 [lang="ko"] 은 화면에서 빼고, 자료의 실제 이름(회사 · 업종 · 갈래)은 여기서 뺌(이름은 권하는 말이 아님)
const viewText = () => page.evaluate(() => { const cl = document.querySelector('#view')?.cloneNode(true); cl?.querySelectorAll('[data-proper], [lang="ko"], script, style').forEach(e => e.remove()); return cl?.textContent ?? ''; });
let realNamesP = null;
const realNames = () => (realNamesP ??= (async () => { const J = async f => { try { return await (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)})).json(); } catch { return null; } };
  const [mkt, names, core] = await Promise.all([J('mkt.json'), J('names.json'), J('core.json')]), s = new Set();
  for (const o of Object.values(mkt?.companies ?? {})) if (o?.n) s.add(o.n);
  for (const r of names?.rows ?? []) if (r?.n) s.add(r.n);
  for (const x of [...(core?.industries ?? []), ...(core?.groups ?? [])]) { if (x?.name) s.add(x.name); if (x?.short) s.add(x.short); }
  return [...s].filter(n => String(n).length >= 2 && screenHits(n).length).sort((a, c) => c.length - a.length); })()); // 쓰지 않을 말이 든 이름만(예: 이름에 「신호」)
const banned = async () => { let t = await viewText(); for (const n of await realNames()) t = t.split(n).join(' '); return screenHits(t); };
// 고도리 아래 단추 다섯(사장님 2026-10-17 21:10 [2] · 규칙 2 「탭 이름 = 화면 제목」) — data-tab · 가는 곳 · 이름(한국어 · 영어)
const TABS5 = [['home', '#/', '오늘 장', 'Today'], ['shorts', '#/shorts', '시황', 'Recap'], ['why', '#/why', '매매일지', 'Journal'], ['sub', '#/sub', '관심', 'Watch'], ['me', '#/me', '보유종목', 'Holdings']];
const WHY_KEY = 'atlas:godori-why'; // 매매일지 기록(이 기기에만 · site/next/p-why.js) — 고도리 칸은 열한 질문을 한 번 끝내야 열림(doneOnce)
const viewDone = () => page.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
/** 새 화면 안에서 주소(#/…)만 바꿈 — 바뀜 알림(hashchange)이 지나간 뒤 「여는 중」이 없어질 때까지(앞 화면을 새 화면으로 잘못 읽지 않게) */
const goHash = async hash => { await page.evaluate(hh => new Promise(res => { if (location.hash === hh) { res(); return; } addEventListener('hashchange', () => setTimeout(res, 0), {once: true}); setTimeout(res, 3000); location.hash = hh; }), hash); await viewDone(); };
let allowP = null; // 새 화면 옛 이름 검사 — 자료의 실제 이름(회사 「아틀라스링크」 등)은 옛 이름이 아님(올라간 자료에서 한 번 받음)
const nameAllow = () => (allowP ??= (async () => { const J = async f => { try { return await (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)})).json(); } catch { return null; } };
  const [mkt, names, core] = await Promise.all([J('mkt.json'), J('names.json'), J('core.json')]); return allowFromData({mkt, names, extra: [...(core?.industries ?? []).map(i => i.name), ...(core?.groups ?? []).map(g => g.name)]}); })());
await step('첫 화면', async () => {
  await page.goto(B + '/atlas/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForSelector('#view .m4-sec', {timeout: 30000}); await page.waitForTimeout(9000); // 여는 홍표(5초) · 사장님 글이 다 써질 때까지
  await shot('p1-home-top');
  out.texts.moon = await page.evaluate(() => { const hd = document.querySelector('h1.head, .co-head h1'); return hd ? getComputedStyle(hd, '::before').backgroundImage : null; });
});
await step('시장 칸', async () => { // 먹빛 첫 화면(2026-10-15 09:41 · 규칙 67) — 오늘 한 줄(평소와 견줌) · 큰 날만 금빛 알림 · 두 산줄기 · 「어떻게 셌나요?」
  await page.evaluate(() => { const e = document.querySelector('#m4-h-mk')?.closest('.m4-sec'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(2600); await shot('p2-home-market');
  out.texts.market = await page.evaluate(() => ({lead: document.querySelector('#view .m4-lead')?.innerText ?? '', alerts: [...document.querySelectorAll('#view .m4-al')].map(x => x.innerText), meta: document.querySelector('#view .m4-meta')?.innerText ?? '', qs: [...document.querySelectorAll('#view .m4-q')].map(x => x.innerText)}));
  await page.evaluate(() => document.querySelectorAll('#view details.m4-how').forEach(d => { d.open = true; })); await page.waitForTimeout(300);
  out.texts.how = await page.evaluate(() => [...document.querySelectorAll('#view details.m4-how')].map(d => d.innerText).join('\n').slice(0, 2000));
  await page.evaluate(() => { const e = document.querySelector('#m4-h-pk')?.closest('.m4-sec'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(600); await shot('p3-home-picks');
});
await step('업데이트 탭', async () => {
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  out.texts.moonUp = await page.evaluate(() => { const hd = document.querySelector('h1.head, .co-head h1'); return hd ? getComputedStyle(hd, '::before').backgroundImage : null; });
  const lines = await page.evaluate(() => [...document.querySelectorAll('#view li, #view p, #view details, #view tr')].map(e => e.innerText).filter(t => /21:11/.test(t)).slice(0, 4));
  out.texts.up2111 = lines;
  const hit = page.locator('#view li, #view details, #view tr').filter({hasText: '21:11'}).first();
  if (await hit.count()) { await hit.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await hit.screenshot({path: `${dir}/p4-up-2111.png`}); out.shots.push(`${dir}/p4-up-2111.png`); }
  await page.evaluate(() => window.scrollTo(0, 0)); await shot('p4-up-top');
});
await step('소개 한 장', async () => {
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(800);
  out.texts.hello = await page.evaluate(() => ({poster: document.querySelector('video')?.getAttribute('poster') ?? null, src: [...document.querySelectorAll('video source')].map(s => s.getAttribute('src')), og: document.querySelector('meta[property="og:image"]')?.content ?? null}));
  await shot('p5-hello');
  // 이름 바꾸기(2026-10-17 15:48 「아틀란스에서 보드리로 모두 변경해」) — 소개 쪽 글 · 창 제목 · 이름표 · 머리말 · 보내기 글에 옛 이름(아틀란스 · ATLAS)이 없나
  const hs = await page.evaluate(nameScan), hshare = await page.evaluate(() => [window.__helloShare?.title ?? '', window.__helloShare?.text ?? ''].join(' '));
  const hold = [...oldNamesIn(hs), ...oldNamesIn({text: hshare})];
  out.helloName = {title: hs.title, share: hshare, old: hold.slice(0, 8), ok: !hold.length && hs.title === josa(NEW_NAME, '를') + ' 소개합니다' && hshare.startsWith(josa(NEW_NAME, '를') + ' 소개합니다 ')};
  if (!out.helloName.ok) out.errors.push('소개 쪽 이름: ' + JSON.stringify(out.helloName).slice(0, 300));
});
await step('36곳 없음', async () => { // 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 옛 주소 · 탭 · 글 · 자료 파일
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/36', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({hash: location.hash, tabs: [...document.querySelectorAll('nav.tabbar a')].map(a => a.textContent.trim()), seen: (document.body.innerText.match(/매수 검토|셈 차례|봉인 36곳|365곳 · 36곳|36곳이 365곳 평균보다|36곳 탭/g) ?? []).length}));
  await shot('p7-no36');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  r.seenUp = (await page.evaluate(() => document.body.innerText.match(/매수 검토|셈 차례|봉인 36곳|365곳 · 36곳|36곳이 365곳 평균보다|36곳 탭/g) ?? [])).length; // 업데이트 탭 글도(13:0x)
  r.seen += r.seenUp;
  const get = async u => { try { const x = await fetch(B + u + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}); const t = await x.text(); return {status: x.status, json: /^\s*\{/.test(t), picks: /"picks"|매수 검토/.test(t)}; } catch { return {status: 0}; } };
  const pick = await get('/atlas/data/pick36.json'), range = await get('/atlas/data/range.json'); // 없는 파일은 404 또는 첫 화면 글(되돌려 보내기) — 36곳 자료(JSON)만 아니면 됨
  out.no36 = {...r, pick36: pick, range, ok: (r.hash === '#/' || r.hash === '') && r.tabs.length === 5 && /^급등( \d+)?$/.test(r.tabs[3] ?? '') && r.tabs[4] === '달력' && r.seen === 0 && !pick.json && !pick.picks && range.status === 200 && range.json && !range.picks};
  if (!out.no36.ok) out.errors.push('36곳 없음: ' + JSON.stringify(out.no36).slice(0, 160));
});
await step('줄 선 그래프', async () => { // 사장님 2026-10-13 12:30 「이 사진처럼 그 업종 이라든지 종목에 그래프가 표현되게해」
  const cnt = () => page.evaluate(() => { const rows = [...document.querySelectorAll('#view .board .row')]; return {rows: rows.length, lines: rows.filter(r => (r.querySelector('.track .spk .ln')?.getAttribute('d') ?? '').length > 10).length}; });
  const cntHome = () => page.evaluate(() => { const rows = [...document.querySelectorAll('#view .m4-tr')]; return {rows: rows.length, lines: rows.filter(r => (r.querySelector('.m4-spk .ln')?.getAttribute('d') ?? '').length > 10).length}; }); // 먹빛 첫 화면 — 요즘 오르는 업종 줄마다 1주 선
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('#m4-h-ri')?.closest('.m4-sec'); if (b) window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(2500); // 선이 그려질 때까지
  const home = await cntHome(); await shot('p8-home-board');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/list', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2500);
  const list = await cnt(); await shot('p9-list');
  out.spark = {home, list, ok: home.rows > 0 && home.lines === home.rows && list.rows > 0 && list.lines === list.rows};
  if (!out.spark.ok) out.errors.push('줄 선 그래프: ' + JSON.stringify(out.spark));
});
await step('멍거 · 린치 조건', async () => { // 사장님 2026-10-14 06:05 「가」(멍거 26곳과 린치 18곳을 함께) — 자료 판 · 이름 밑 갈래마다 수 · 3단 든 까닭(멍거 갈래 · 린치만 든 곳) · 업데이트 탭 기준 바뀜 줄 · 옛 기준 말 0
  const core = await (await fetch(B + '/atlas/data/core.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const comp = (await (await fetch(B + '/atlas/data/comp.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json()).companies;
  // 멍거 · 린치 조건(ml-v1 · 2026-10-14 06:05 「가」) — 첫 화면 이름 · 갈래마다 수 · 멍거 갈래 회사 · 린치만 든 회사의 「왜 … 들었나요?」(경주가 끝난 뒤 찍음)
  const n = core.funnel?.picked ?? null, name = `${core.rules?.name ?? '?'} ${n}곳`, line = core.rules?.line ?? '?';
  const cM = Object.keys(comp).find(c => comp[c].pick?.tags?.includes('mg')), cL = Object.keys(comp).find(c => JSON.stringify(comp[c].pick?.tags) === '["ly"]');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const home = await page.evaluate(() => (document.querySelector('#m4-h-pk')?.closest('.m4-sec')?.innerText ?? '') + '\n' + (document.querySelector('#view .foot')?.innerText ?? '')); // 먹빛 첫 화면 — 고른 곳 칸(이름 밑 갈래마다 수) · 맨 아래 자료 줄(멍거 · 린치 조건 N곳)
  await page.evaluate(() => { const e = document.querySelector('#m4-h-pk')?.closest('.m4-sec'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(1500); await shot('p12-ml-home');
  const whyOf = async (c, tag) => { if (!c) return '';
    await page.goto(B + '/atlas/?v=' + Date.now() + '#/c/' + c, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
    const t = await page.evaluate(() => [...document.querySelectorAll('#view .box')].find(b => /왜 멍거 · 린치 조건/.test(b.innerText))?.innerText ?? '');
    await page.evaluate(() => { const b = [...document.querySelectorAll('#view .box')].find(x => /왜 멍거 · 린치 조건/.test(x.innerText)); if (b) b.scrollIntoView({block: 'center'}); }); await page.waitForTimeout(400); await shot(tag); return t; };
  const why = await whyOf(cM, 'p13-ml-why-mg'), whyL = await whyOf(cL, 'p14-ml-why-ly');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const up = await page.evaluate(() => document.body.innerText);
  const strip = t => t.split('옛 규칙(대세 업종)').join('').split('옛 규칙(힘 붙음)').join('');
  const old = /대세|힘 붙은 365곳|그중 「힘 붙음」/.test(strip(up + home + why + whyL));
  out.munger = {version: core.rules?.version ?? null, n, line, home, why: why.slice(0, 300), whyL: whyL.slice(0, 300), turn: /이 회차에 고르는 기준이 바뀌었습니다/.test(up), old,
    ok: core.rules?.version === 'ml-v1' && n > 0 && Object.keys(comp).length === n && home.includes(name) && home.includes(line) && /^멍거 조건 \d+곳 · 린치 조건 \d+곳 · 둘 다 \d+곳$/.test(line)
      && /멍거 조건 — 세 조건을 모두 넘었습니다/.test(why) && /자기 돈 100원에 빚/.test(why) && /린치 조건 — 두 조건을 모두 넘었습니다/.test(whyL) && /크는 빠르기에 견줘 값/.test(whyL) && !old};
  if (!out.munger.ok) out.errors.push('멍거 · 린치 조건: ' + JSON.stringify({...out.munger, why: undefined}).slice(0, 200));
});
await step('전 종목 찾기', async () => { // 사장님 2026-10-14 08:38 「우리나라 주식 종목 전 종목을 전부 등록 시켜」 · 08:41 「가」 — 찾기 이름표 = 모음 회사 모두 · 몸값이 가장 작은 회사도 찾힘
  const core = await (await fetch(B + '/atlas/data/core.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const names = await (await fetch(B + '/atlas/data/names.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const last = names.rows.findLast(r => r.s !== 'in'), mk = {KOSPI: 0, KOSDAQ: 0}; for (const r of names.rows) mk[r.m] = (mk[r.m] ?? 0) + 1;
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/find', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  await page.fill('#q', last?.n ?? '?'); await page.waitForTimeout(800);
  const hits = await page.$eval('#hits', x => x.innerText).catch(() => ''); await shot('p15-find-all');
  // 목록 모두(2026-10-14 11:02 「이거 다 올려」) — 글자 섞인 번호 회사를 번호로 · 상장 펀드를 이름으로 찾음(사진 p16 · p17)
  const findShot = async (q, tag) => { await page.goto(B + '/atlas/?v=' + Date.now() + '#/find', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200); await page.fill('#q', q); await page.waitForTimeout(800); const t = await page.$eval('#hits', x => x.innerText).catch(() => ''); await shot(tag); return t; };
  const nc = names.rows.find(r => /[A-Z]/.test(r.c) && !r.k), etf = names.rows.find(r => r.k === 'etf' && /^KODEX 200$/.test(r.n)) ?? names.rows.find(r => r.k === 'etf');
  const hNc = nc ? await findShot(nc.c, 'p16-find-newcode') : '', hEtf = etf ? await findShot(etf.n, 'p17-find-etf') : '';
  const kinds = {}; for (const r of names.rows) if (r.k) kinds[r.k] = (kinds[r.k] ?? 0) + 1;
  out.allFind = {universe: core.funnel?.universe ?? null, companies: core.funnel?.companies ?? null, rows: names.rows.length, kospi: mk.KOSPI, kosdaq: mk.KOSDAQ, kinds, collected: names.collected, last: last && {c: last.c, n: last.n}, hit: !!last && hits.includes(last.n),
    newCode: nc && {c: nc.c, n: nc.n, hit: hNc.includes(nc.n)}, etf: etf && {c: etf.c, n: etf.n, hit: hEtf.includes(etf.n) && /상장 펀드/.test(hEtf)},
    ok: names.rows.length === core.funnel?.universe && names.rows.length >= 2400 && !!last && hits.includes(last.n) && (!nc || hNc.includes(nc.n)) && (!etf || (hEtf.includes(etf.n) && /상장 펀드/.test(hEtf)))};
  if (!out.allFind.ok) out.errors.push('전 종목 찾기: ' + JSON.stringify(out.allFind).slice(0, 200));
});
await step('모든 회사', async () => { // 사장님 2026-10-14 12:01(싱가포르) 「나」 — 첫 화면부터 갈래 · 업종 · 회사 흐름 = 모든 회사 · 고른 곳은 금빛(사진 p18 · p19 · p20)
  const J = async f => (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const core = await J('core.json'), mk = await J('mkt.json');
  const mem = core.industries.reduce((t, i) => t + i.members.length, 0), pkI = core.industries.filter(i => i.pk > 0);
  const gold = pkI.slice().sort((a, b) => b.pk - a.pk || b.n - a.n)[0]; // 고른 곳이 가장 많이 든 업종
  const shown = gold.members.filter(c => mk.companies[c]?.l?.some(x => x != null)), shownN = shown.length, shownPk = shown.filter(c => mk.companies[c].p).length; // 기준일 종가가 없어 선을 못 그린 회사는 줄 대신 「?」 한 줄
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('#m4-h-ri')?.closest('.m4-sec'); if (b) window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(2500); // 사진 = 요즘 오르는 업종 칸(먹빛 첫 화면)
  const home = await page.evaluate(() => ({rows: document.querySelectorAll('#view .m4-tr').length, gold: document.querySelectorAll('#view .m4-tr .m4-pk').length, tab: document.querySelector('#tabList')?.textContent ?? '',
    head: document.querySelector('#m4-h-ri')?.textContent ?? '', names: [...document.querySelectorAll('#view .m4-tr .nm')].map(x => x.textContent.replace(/\u2060/g, '')), glinks: [...document.querySelectorAll('#view .m4-g')].map(a => a.getAttribute('href'))})); // 요즘 오르는 업종(규칙 64) — 줄 = core.rise · 큰 갈래 고리 = 열 개(20거래일 많이 오른 차례)
  await shot('p18-home-all');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/i/' + encodeURIComponent(gold.name), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000);
  const ind = await page.evaluate(() => ({rows: document.querySelectorAll('#view .board .row').length, pk: [...document.querySelectorAll('#view .board .row.pk')].map(a => a.getAttribute('href')), x: document.querySelectorAll('#view .board .row[href^="#/x/"]').length, c: document.querySelectorAll('#view .board .row[href^="#/c/"]').length}));
  await page.evaluate(() => { const r = document.querySelector('#view .board .row.pk'); if (r) window.scrollTo(0, r.getBoundingClientRect().top + window.scrollY - 260); }); await page.waitForTimeout(600);
  await shot('p19-industry-gold');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/list', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2500);
  const list = await page.evaluate(() => ({rows: document.querySelectorAll('#view .board .row').length, pk: document.querySelectorAll('#view .board .row.pk').length, head: document.querySelector('#view h1')?.textContent ?? ''}));
  await shot('p20-list-all');
  out.allCo = {mkt: mk.n, companies: core.funnel?.companies ?? null, mktN: core.mkt?.n ?? null, groups: core.groups.length, industries: core.industries.length, members: mem, picked: core.funnel?.picked ?? null, pk: mk.pk, pkIndustries: pkI.length, home, gold: {name: gold?.name, n: gold?.n, pk: gold?.pk, shown: shownN}, ind: {...ind, pk: ind.pk.length}, list,
    ok: !!core.mkt && mk.n === core.mkt.n && mk.n === core.funnel?.companies && mem === mk.n && mk.pk === core.funnel?.picked && home.rows === (core.rise?.list?.length ?? core.groups.length) && (!core.rise || (home.head === '요즘 오르는 업종' && JSON.stringify(home.names) === JSON.stringify(core.rise.list.map(r => r.name)) && JSON.stringify(home.glinks) === JSON.stringify(core.groups.slice().sort((a, b) => b.chg - a.chg).map(g => '#/g/' + g.id)))) && home.tab === '업종 ' + core.industries.length
      && ind.rows === shownN && ind.pk.length === shownPk && ind.pk.every(h => /^#\/c\//.test(h)) && (core.co7 ? ind.x === 0 && ind.c === shownN : ind.x === shownN - shownPk) && list.rows === core.industries.length && list.pk === pkI.length};
  if (!out.allCo.ok) out.errors.push('모든 회사: ' + JSON.stringify(out.allCo).slice(0, 240));
});
await step('오늘 업종 고리 · 상품권 · 1장 글', async () => { // 사장님 2026-10-14(싱가포르) 15:01 「여기 클릭 하면 7단구조 나오게해」 · 14:56 · 14:59 상품권 · 15:19 · 15:54 1장 글(규칙 62 · 사진 p21 · p22 · p23)
  const J = async f => (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const core = await J('core.json'), home = await J('home.json');
  const hrefInd = i => (i.n === 1 ? ((core.co7 || !core.mkt || i.pk ? '#/c/' : '#/x/') + i.members[0]) : '#/i/' + encodeURIComponent(i.name)); // 모든 회사 7단(2026-10-14 17:25)이면 모두 회사
  const want = g => { const n = core.secInd?.[String(g?.name ?? '').replace(/\s+/g, '')], i = n ? core.industries.find(x => x.name === n) : null; return i ? hrefInd(i) : null; };
  const first = home.sectors?.strong?.[0] ?? null, w = want(first);
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view .m4-sec', {timeout: 30000}); await page.waitForTimeout(9000); // 여는 홍표 · 글 쓰기가 끝날 때까지
  const s1 = await page.evaluate(() => ({msg: document.querySelector('#view .m4-letter .hmsg')?.innerText ?? '', promo: document.querySelector('#view .m4-letter .m4-gift')?.textContent ?? ''}));
  await shot('p22-slide1');
  await page.evaluate(() => { const e = document.querySelector('#m4-h-br')?.closest('.m4-sec'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(1500);
  const got = await page.evaluate(() => [...document.querySelectorAll('#view a.m4-sr')].map(a => a.getAttribute('href'))); // 먹빛 첫 화면 「오른 곳과 내린 곳」 칸의 강한 · 약한 업종 줄
  await shot('p21-sec-slide');
  let after = null;
  if (got[0]) { await page.locator('#view a.m4-sr').first().click(); await page.waitForTimeout(2000); after = await page.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent ?? '', step: document.querySelector('#view .steps, #view .lv')?.textContent ?? ''})); await shot('p21-sec-industry'); }
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(800);
  const hp = await page.evaluate(() => ({bar: document.querySelector('.hp-pbar')?.textContent ?? '', box: document.querySelector('#hp-promo')?.innerText ?? '', sms: document.querySelector('#hp-promo a[href^="sms:"]')?.getAttribute('href') ?? null, tel: document.querySelector('#hp-promo a[href^="tel:"]')?.getAttribute('href') ?? null}));
  await page.evaluate(() => document.querySelector('#hp-promo')?.scrollIntoView({block: 'center'})); await page.waitForTimeout(400);
  await shot('p23-hello-promo');
  out.promo = {secFirst: first?.name ?? null, want: w, got: got.slice(0, 6), after, s1, hp,
    ok: !!w && got[0] === w && !!after && after.hash === w && /아틀란스 주식 격언 열 가지/.test(s1.msg) && /10\. 기회는 찾아오는 거지, 만드는 게 아니다\./.test(s1.msg) && !/하규는|안상미/.test(s1.msg) && !/10명중에|못버는건/.test(s1.msg) && /스타벅스 상품권 1만원/.test(s1.promo) && !/커피 1잔|상품권 1장/.test(s1.promo)
      && /010-9011-7377/.test(hp.box) && hp.sms === 'sms:01090117377' && hp.tel === 'tel:01090117377' && /스타벅스 상품권 1만원/.test(hp.bar) && /스타벅스 상품권 1만원/.test(hp.box) && !/1잔|상품권 1장|1장씩/.test(hp.box + hp.bar) && /3명만 소개해도/.test(hp.bar) && /3명마다 1만원씩/.test(hp.box) && !/10명/.test(hp.box + hp.bar) && /3명만 소개해도/.test(s1.promo) /* 2026-10-16 21:35 「3명만 추천해도 1만원」 */}; // 18:19(싱가포르) 「스타벅스 상품권 1만원 이라고 해 1장이 아니라」
  if (!out.promo.ok) out.errors.push('오늘 업종 고리 · 상품권 · 1장 글: ' + JSON.stringify(out.promo).slice(0, 300));
});
await step('홍표 영상', async () => { // 사장님 2026-10-14(싱가포르) 21:50 「막비 이름을 홍표 라고 해」 · 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」(규칙 65 · 사진 p26)
  // 편지 칸 띠 「친구에게 소개하기 · 고도리 1분 영상 · 보내기」 = 지금 사이트(새 화면 /) — 첫 화면에 없으면 「나」 칸(2026-10-17 고도리 한 장 명령문 1 「첫 화면 편지를 「나」 칸으로 옮겨라」) · 옛 /atlas/ 는 손대지 않아 옛 이름 그대로라 보지 않음(규칙 75)
  let band = '';
  for (const hash of ['#/me', '#/']) { // 편지 띠는 이제 「나」 칸(2026-10-17 17:54 명령 1) — 먼저 봄 · 2026-10-18 첫 번째 묶음부터 편지는 접는 칸(.hd-fold) 안이라 띠가 처음엔 visibility:hidden — 글자만 읽으면 되므로 붙기만 기다림(state: attached)
    await page.goto(B + '/?v=' + Date.now() + hash, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200);
    band = await page.waitForSelector('#view .m4-letter .m4-act', {state: 'attached', timeout: 8000}).then(() => page.evaluate(() => document.querySelector('#view .m4-letter .m4-act')?.textContent ?? '')).catch(() => '');
    if (band) break;
  }
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(600);
  const hv = await page.evaluate(async () => {
    const v = document.querySelector('video.hp-vid'), meta = n => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.getAttribute('content') ?? '';
    if (v) { v.preload = 'auto'; v.load(); await new Promise(r => { if (v.readyState >= 1) r(); else { v.addEventListener('loadedmetadata', r, {once: true}); setTimeout(r, 20000); } }); }
    return {dur: v ? v.duration : null, label: v?.getAttribute('aria-label') ?? '', desc: meta('description'), og: meta('og:description'), alt: meta('og:image:alt'), body: document.body.innerText, share: window.__helloShare?.text ?? ''};
  });
  await shot('p26-hello-video');
  const all = [band, hv.label, hv.desc, hv.og, hv.alt, hv.body, hv.share].join(' '); // 옛 판(/old/) 띠는 그대로(옛 판 화면 코드 안 고침 — 규칙 65)
  out.hongpyo = {band, dur: hv.dur, label: hv.label, desc: hv.desc, alt: hv.alt, share: hv.share,
    ok: band.includes(NEW_NAME + ' 1분 영상') && Math.abs((hv.dur ?? 0) - 60) < 0.6 && [hv.label, hv.desc, hv.og, hv.alt].every(x => String(x ?? '').includes(NEW_NAME)) && String(hv.share ?? '').includes(josa(NEW_NAME, '가') + ' 1분') && !/막비|24초|35초|홍표|보드리|Bodri|10명/.test(all)}; // 2026-10-16 21:00 「홍표 → 보드리」 · 2026-10-17 1분 영상(옛 35초 · 10명 글이 다시 나오면 걸림)
  if (!out.hongpyo.ok) out.errors.push('홍표 영상: ' + JSON.stringify(out.hongpyo).slice(0, 300));
});
await step('여는 홍표', async () => { // 사장님 2026-10-15(싱가포르) 04:10 「열면 홍표 니오게 해」 · 05:05 「첫화면 5초 있다 움직여」 · 06:01 「가」(규칙 66 · 사진 p27 · p28) — 열면 1장에 홍표 그림 + 「홍표!」 세 번 → 5초에 사장님 글
  // 지금 사이트(/ = 새 화면)의 「나」 칸에서 봄 — 2026-10-17 17:54 「고도리 만들기 · 한 장 명령문」 명령 1 로 편지가 「나」 칸으로 옮겨 가 열면 이름 새가 편지를 처음 그릴 때(= 「나」 칸을 처음 열 때) 나옴 ·
  // 말풍선 = 지금 이름(brand.js) · 편지 첫 줄 = LETTER_TITLE · 끝 줄 = site/next/app.js HELLO_MSG 끝 줄(옛 /atlas/ 는 손대지 않아 옛 이름 그대로라 여기서 보지 않음 — 규칙 75)
  const LAST = (JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(await fs.readFile(new URL('../../../site/next/app.js', import.meta.url), 'utf8')) || [, '[]'])[1].replace(/'/g, '"')).at(-1) ?? '\u0000');
  await page.goto(B + '/?v=' + Date.now() + '#/me', {waitUntil: 'commit', timeout: 60000}); await page.waitForSelector('#view .hpi', {timeout: 30000}); const t0 = Date.now();
  // 2026-10-17 21:10 [2] 5 — 「보유종목」 칸은 맨 위가 보유종목 점검이고 편지는 그 밑 · 여는 그림 칸이 화면 밖이면 편지를 화면 안으로 올림(그림 · 말풍선 · 글은 그대로 봄)
  const scrolled = await page.evaluate(() => { const a = document.querySelector('#view a.m4-letter'), r = (a?.querySelector('.hpi') ?? a)?.getBoundingClientRect(); if (!a || !r || (r.top >= 64 && r.bottom <= innerHeight - 50)) return false; window.scrollTo(0, Math.max(0, a.getBoundingClientRect().top + window.scrollY - 64)); return true; });
  const look = () => page.evaluate(() => { const a = document.querySelector('#view a.m4-letter'), pi = a?.querySelector('.hpi'), img = pi?.querySelector('img.hpi-bird'), ls = [...(a?.querySelectorAll('.hml') ?? [])]; // 먹빛 첫 화면(2026-10-15) 편지 칸
    return {intro: !!a?.classList.contains('intro'), img: img ? img.complete && img.naturalWidth > 0 : false, bub: [...(pi?.querySelectorAll('.hpi-b') ?? [])].map(x => [x.textContent, +getComputedStyle(x).opacity]),
      shown: ls.some(x => getComputedStyle(x).visibility === 'visible'), ml: ls.length ? Math.min(...ls.map(x => +getComputedStyle(x).opacity)) : null, msg: a?.querySelector('.hmsg')?.innerText ?? '',
      bird: img ? (q => [Math.round(q.top), Math.round(q.bottom), innerHeight])(img.getBoundingClientRect()) : null}; }); // 그림이 첫 화면 안(틀림 장부 45)
  await page.waitForTimeout(Math.max(0, 2700 - (Date.now() - t0))); const i1 = await look(); i1.at = Date.now() - t0;
  await page.waitForTimeout(Math.max(0, 4000 - (Date.now() - t0))); const i4 = await look(); i4.at = Date.now() - t0; // 홍표 5초 — 4초에도 홍표 그대로 · 글은 아직(4.2초에 제자리로 날아감)
  await shot('p27-hello-intro'); // 사진은 두 번 잰 뒤(느린 기계에서 사진 찍는 사이에 4초 잼이 4.2초 너머로 밀리지 않게 — 사진은 날아가기 앞 말풍선 셋이 다 뜬 때)
  await page.waitForTimeout(Math.max(0, 8200 - (Date.now() - t0))); // 5초에 글 쓰기 시작 · 7.4초쯤 다 씀
  await page.waitForFunction(() => { const a = document.querySelector('#view a.m4-letter'), ls = [...(a?.querySelectorAll('.hml') ?? [])]; return !!a && !a.classList.contains('intro') && ls.length > 0 && ls.every(x => getComputedStyle(x).visibility === 'visible' && +getComputedStyle(x).opacity > 0.95); }, null, {timeout: 15000}).catch(() => {}); // 실행기가 느린 날 — 글이 다 써질 때까지 15초 안(2026-10-17 20:3x 끝 줄이 아직 숨어 걸린 일 · 숨은 줄은 innerText 에 안 잡힘)
  const i2 = await look(); await shot('p28-hello-text');
  out.helloIntro = {scrolled, i1, i4: {intro: i4.intro, shown: i4.shown, bub: i4.bub.length, op: i4.bub.map(x => x[1]), at: i4.at}, i2: {intro: i2.intro, shown: i2.shown, ml: i2.ml, first: i2.msg.split('\n')[0], last: i2.msg.includes(LAST)},
    ok: i1.intro && i1.img && i1.bub.length === 3 && i1.bub.every(([t, o]) => t === NEW_NAME + '!' && o > 0.9) && !!i1.bird && i1.bird[0] >= 50 && i1.bird[1] <= i1.bird[2] - 50 && !i1.shown && i4.intro && !i4.shown && i4.bub.length === 3 && i4.bub.every(([, o]) => o > 0.9)
      && !i2.intro && i2.shown && i2.ml > 0.95 && i2.msg.split('\n')[0] === LETTER_TITLE && i2.msg.includes(LAST)};
  if (!out.helloIntro.ok) out.errors.push('여는 홍표: ' + JSON.stringify(out.helloIntro).slice(0, 300));
});
await step('모든 회사 7단', async () => { // 사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」 — 고른 곳 밖 회사도 업종 줄 → 3단 회사 → 4 · 5 · 6 · 7단(사진 p24 · p25)
  const J = async f => (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const core = await J('core.json'), mk = await J('mkt.json'), rg = await J('range.json');
  const oth = Object.keys(mk.companies).filter(c => !mk.companies[c].p), code = oth.find(c => mk.companies[c].l.some(x => x != null) && rg.others?.[c]?.ok) ?? oth[0], m = mk.companies[code];
  const ind = core.industries.find(i => i.name === m.i), co = await J('co/' + code + '.json');
  const r = {code, name: m.n, co7: core.co7 ?? null, mkt: mk.n, others: oth.length, rangeOthers: Object.keys(rg.others ?? {}).length, rangeNotOk: Object.values(rg.others ?? {}).filter(x => !x?.ok).length, coFile: !!co?.c, steps: []};
  if (ind && ind.n > 1) { await page.goto(B + '/atlas/?v=' + Date.now() + '#/i/' + encodeURIComponent(ind.name), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
    r.rowHref = await page.evaluate(c => document.querySelector(`#view .board .row[href$="/${c}"]`)?.getAttribute('href') ?? document.querySelector(`#view a[href$="/${c}"]`)?.getAttribute('href') ?? null, code);
    if (r.rowHref) { await page.locator(`#view a[href="${r.rowHref}"]`).first().click(); await page.waitForTimeout(2000); } }
  else { await page.goto(B + '/atlas/?v=' + Date.now() + '#/c/' + code, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000); }
  const look = () => page.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent ?? '', step: document.querySelector('#view .st-t b')?.textContent ?? '', text: document.querySelector('#view')?.innerText ?? ''}));
  let x = await look(); r.steps.push({hash: x.hash, step: x.step, chip: x.text.includes(`${core.rules.name} ${core.funnel.picked}곳 밖`), why: x.text.includes(`왜 ${core.rules.name} ${core.funnel.picked}곳 밖인가요?`)});
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await shot('p24-other-3');
  for (const [sub, n] of [['past', 4], ['rivals', 5], ['grow', 6], ['range', 7]]) {
    const href = `#/c/${code}/${sub}`; const a = page.locator(`#view a[href="${href}"]`).first();
    if (await a.count()) { await a.click(); await page.waitForTimeout(1800); } else { r.steps.push({hash: null, step: null, missing: href}); break; }
    x = await look(); r.steps.push({hash: x.hash, step: x.step, ...(sub === 'grow' ? {notYet: x.text.includes('세 팀 이야기는 조사 전입니다')} : {}), ...(sub === 'range' ? {model: x.text.includes('모형 가정 아래 추정 · 검증 전'), dirs: await page.evaluate(() => document.querySelectorAll('#view ul.dirbars li').length)} : {})});
  }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await shot('p25-other-7');
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/x/' + code, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000); r.oldX = (await look()).hash;
  const S = r.steps, want = n => `7단 중 ${n}단`;
  out.co7 = {...r, ok: !!core.co7 && core.co7 === mk.n && r.rangeOthers === r.others && r.coFile && (!ind || ind.n === 1 || r.rowHref === '#/c/' + code) && S.length === 5 && S.every((s2, k) => s2.hash === (k ? `#/c/${code}/${['past', 'rivals', 'grow', 'range'][k - 1]}` : '#/c/' + code) && s2.step === want(k + 3))
    && S[0].chip && S[0].why && S[3].notYet && S[4].model && S[4].dirs === rg.dirs.length && r.oldX === '#/c/' + code};
  if (!out.co7.ok) out.errors.push('모든 회사 7단: ' + JSON.stringify(out.co7).slice(0, 300));
});
await step('급등 탭', async () => { // 규칙 69(사장님 2026-10-15 14:27 「탭을 하나 더 만들어라 … 최근 5일에 급등한 종목을 36개 …」) — 올라간 자료와 화면이 같은지 · 1등 빛 0 · 그림이 첫 화면 안 · 접은 칸까지 기관 이름 0
  const S = await (await fetch(B + '/atlas/data/surge.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)})).json();
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/surge', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view .svr svg', {timeout: 30000}); await page.waitForTimeout(1500);
  await shot('p29-surge-top');
  const g = await page.evaluate(() => { const s = document.querySelector('#view .svr svg')?.getBoundingClientRect(), t = document.querySelector('.tabbar')?.getBoundingClientRect();
    document.querySelectorAll('#view details').forEach(d => { d.open = true; });
    return {h1: document.querySelector('#view h1')?.textContent ?? '', tab: document.querySelector('#tabSurge')?.textContent ?? '', win: document.querySelectorAll('#view .row.win').length, inView: !!(s && t && s.bottom <= t.top),
      rows: [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => x.querySelector('.nm')?.firstChild?.textContent ?? ''), text: document.querySelector('#view').innerText}; });
  await page.evaluate(() => { const e = document.querySelector('#view .sv-board'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(500); await shot('p30-surge-rows');
  out.surge = {version: S.version, kind: S.kind, n: S.n, asOf: S.asOf, provisional: S.provisional, kst: S.kst, h1: g.h1, tab: g.tab, win: g.win, inView: g.inView, rowsSame: JSON.stringify(g.rows) === JSON.stringify(S.members.map(m => m.n)), noAgency: !/CIA|씨아이에이|정보기관|중앙정보국/i.test(g.text)};
  out.surge.ok = S.version === 'sv-v1' && g.h1 === `급등 ${S.n}곳` && g.tab === `급등 ${S.n}` && g.win === 0 && g.inView && out.surge.rowsSame && out.surge.noAgency;
  if (!out.surge.ok) out.errors.push('급등 탭: ' + JSON.stringify(out.surge).slice(0, 300));
});
await step('달력 탭', async () => { // 사장님 2026-10-15 19:28 「달력 턉」 · 20:04 「종목이름 등락률」 · 20:51 「추적하는 시스탬」 · 규칙 70 — 올라간 자료(surgetr.json)와 화면 머리 · 답 · 날짜 줄이 같은지 · 종목 파일 하나 · 회사 3단 고리
  const tr = await fetch(B + '/atlas/data/surgetr.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)}), T = tr.ok ? await tr.json() : null;
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/cal', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view h1', {timeout: 30000}); await page.waitForTimeout(900);
  await shot('p34-cal-top');
  const g = await page.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? '', tab: document.querySelector('#tabCal')?.getAttribute('aria-current'), n10: document.querySelector('#view .cal-cl b')?.textContent ?? null, days: [...document.querySelectorAll('#view section.cal-day[data-d]')].map(x => x.dataset.d), rows: document.querySelectorAll('#view a.cal-row').length, text: document.querySelector('#view').innerText, sw: document.documentElement.scrollWidth, cw: innerWidth}));
  let cs = null; const c0 = T?.cases?.find(r => r[6] !== 'n')?.[0] ?? T?.cases?.[0]?.[0];
  if (c0) { await page.goto(B + '/atlas/?v=' + Date.now() + '#/cal/' + c0, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view h1', {timeout: 30000}); await page.waitForTimeout(700); await shot('p35-cal-case');
    cs = await page.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? '', co: document.querySelector('#view .cal-co')?.getAttribute('href') ?? null, lane: !!document.querySelector('#view .cal-lane svg'), steps: document.querySelectorAll('#view ol.cal-steps li').length})); }
  out.cal = {status: tr.status, version: T?.version ?? null, asOf: T?.asOf ?? null, N: T?.N ?? null, n10: T?.n10 ?? null, m10: T?.m10 ?? null, cases: T?.cases?.length ?? null, h1: g.h1, n10Shown: g.n10, days: g.days.length, rows: g.rows, case: cs};
  out.cal.ok = T?.version === 'tr-v1' && g.h1 === '달력' && g.tab === 'page' && (!T.N || g.n10 === `10곳 중 ${T.n10}곳꼴`) && g.rows === T.cases.length && JSON.stringify(g.days) === JSON.stringify(T.days.map(x => x.d)) && g.sw <= g.cw && !/급등|NaN|undefined/.test(g.text) && (!cs || (cs.h1 === T.cases.find(r => r[0] === c0)[1] && /^#\/[cx]\//.test(cs.co ?? '') && cs.steps >= 1));
  if (!out.cal.ok) out.errors.push('달력 탭: ' + JSON.stringify(out.cal).slice(0, 400));
});
await step('급등 다섯 칸', async () => { // 사장님 2026-10-15 16:28 「총 5개」 · 16:34 「달력에 기록 … 매일 매일 선택됐다 탈락 됐다 이동 했다」 · 16:40 「관심 없음」 — 올라간 자료(surge.json bands · surgecal.json)와 화면이 같은지 · 다섯 칸 한 줄 · 달력 · 며칠 뒤
  const S = await (await fetch(B + '/atlas/data/surge.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)})).json();
  const cr = await fetch(B + '/atlas/data/surgecal.json?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)}), K = cr.ok ? await cr.json() : null;
  const NAME = {b10: '10%대', b20: '20%대', b30: '30%대', b40: '40% 이상'}, bands = {};
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/surge', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view .sv-wk', {timeout: 30000}); await page.waitForTimeout(800);
  const main = await page.evaluate(() => ({chips: [...document.querySelectorAll('#view nav.sv-chips a')].map(a => [a.getAttribute('href'), a.textContent.trim()]), rows: new Set([...document.querySelectorAll('#view nav.sv-chips a')].map(a => Math.round(a.getBoundingClientRect().top))).size,
    cells: document.querySelectorAll('#view .sv-wk button.sv-cell').length, track: !!document.querySelector('#view .sv-trs'), text: document.querySelector('#view').innerText}));
  await page.evaluate(() => { const e = document.querySelector('#view .sv-cal'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 120); }); await page.waitForTimeout(400); await shot('p31-surge-cal');
  await page.evaluate(() => { const e = document.querySelector('#view .sv-trs'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 220); }); await page.waitForTimeout(400); await shot('p32-surge-track');
  for (const b of ['b10', 'b20', 'b30', 'b40']) {
    await page.goto(B + '/atlas/?v=' + Date.now() + '#/surge/' + b.slice(1), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view h1', {timeout: 30000}); await page.waitForTimeout(700);
    if (b === 'b10') await shot('p33-surge-10');
    const g = await page.evaluate(() => ({h1: (document.querySelector('#view h1')?.textContent ?? '').replace(/\u2060/g, '').replace(/\u00a0/g, ' '), cur: document.querySelector('#view nav.sv-chips a[aria-current="page"]')?.getAttribute('href') ?? '', win: document.querySelectorAll('#view .row.win').length,
      rows: [...document.querySelectorAll('#view .board .row')].sort((a, c) => a.getBoundingClientRect().top - c.getBoundingClientRect().top).map(x => x.querySelector('.nm')?.firstChild?.textContent ?? ''), cells: document.querySelectorAll('#view .sv-wk button.sv-cell').length, sw: document.documentElement.scrollWidth, cw: innerWidth}));
    const B0 = S.bands?.[b]; bands[b] = {h1: g.h1, ok: !!B0 && g.h1 === `${NAME[b]} ${B0.n}곳` && g.cur === '#/surge/' + b.slice(1) && g.win === 0 && JSON.stringify(g.rows) === JSON.stringify(B0.members.map(m => m.n)) && g.cells >= 1 && g.sw <= g.cw};
  }
  out.surge5 = {bands: S.bands?.version ?? null, cal: K?.version ?? null, calStatus: cr.status, days: K?.days?.length ?? null, track: K?.track?.length ?? null, tracked: K?.track?.filter(t => t.path?.length).length ?? null, chips: main.chips.map(x => x[1]).join(' '), oneRow: main.rows === 1, cells: main.cells, trackBox: main.track, each: bands};
  out.surge5.ok = S.bands?.version === 'sb-v1' && K?.version === 'sk-v1' && main.chips.length === 5 && main.rows === 1 && main.cells >= 1 && main.track && Object.values(bands).every(x => x.ok) && !/CIA|씨아이에이|정보기관|중앙정보국/i.test(main.text);
  if (!out.surge5.ok) out.errors.push('급등 다섯 칸: ' + JSON.stringify(out.surge5).slice(0, 400));
});
await step('옛 판 지움', async () => { // 2026-10-15(싱가포르) 23:35 「알틀란스는 영구 삭제한다」 — /old/ 는 첫 화면(새 ATLAS)으로 · 맨 아래 「옛 ATLAS」 고리 없음
  await page.goto(B + '/old/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500); await shot('p6-old');
  const g = await page.evaluate(() => ({path: location.pathname, newAtlas: !!document.querySelector('.tabs a[data-tab="home"]'), oldLink: [...document.querySelectorAll('a[href]')].some(a => /\/old\//.test(a.getAttribute('href')))})); // 2026-10-17 부터 첫 화면 = 새 아틀란스(규칙 74)
  out.oldGone = {...g, ok: g.path === '/' && g.newAtlas && !g.oldLink}; if (!out.oldGone.ok) out.errors.push('옛 판 지움: ' + JSON.stringify(g));
});
await step('조건 찾기 탭', async () => { // 사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 업데이트 탭 빼고」 · 23:54 「가」 · 규칙 72 — 아래 탭 「조건」 · 칸 셋 · 남은 곳 · 정직 두 줄 · 업데이트 기록은 도움말(?)에서
  const X = await (await fetch(B + '/atlas/data/cond.json?v=' + Date.now(), {signal: AbortSignal.timeout(60000)})).json().catch(() => null);
  const core = await (await fetch(B + '/atlas/data/core.json?v=' + Date.now(), {signal: AbortSignal.timeout(60000)})).json().catch(() => null);
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/cond', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view h1', {timeout: 30000}); await page.waitForTimeout(900);
  await shot('p36-cond');
  const g = await page.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? '', tab: document.querySelector('#tabCond')?.getAttribute('aria-current'), tabs: [...document.querySelectorAll('nav.tabbar a')].map(a => a.getAttribute('href')),
    slots: document.querySelectorAll('#view button.cd-slot').length, big: document.querySelector('#view .cd-big b')?.textContent ?? null, rows: document.querySelectorAll('#view .cd-row, #view .cd-list li').length, flow: document.querySelector('#view .cd-flow')?.textContent ?? '',
    hon: (document.querySelector('#view')?.innerText ?? '').includes('사고팔 곳을 고른 목록이 아니에요.'), q: [...document.querySelectorAll('#view p.q')].some(p => /조건 자료/.test(p.textContent)), /* 조건 자료를 못 받음 · 날이 다름만(맨 아래 「? 장 중 값」 줄은 장 중이면 늘 있음 — 2026-10-16 첫 탐침이 이것을 잘못 잡음) */ sw: document.documentElement.scrollWidth, cw: innerWidth}));
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/info', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(900);
  const up = await page.evaluate(() => [...document.querySelectorAll('#infoSheet a[href="#/up"]')].length);
  const last = g.flow.split('→').map(x => x.trim()).filter(Boolean).at(-1);
  out.cond = {status: X ? 200 : null, version: X?.version ?? null, asOf: X?.asOf ?? null, coreAsOf: core?.asOf ?? null, ...g, upLink: up,
    ok: X?.version === 'cd-v1' && X?.asOf === core?.asOf && g.h1 === '조건 찾기' && g.tab === 'page' && g.tabs.includes('#/cond') && !g.tabs.includes('#/up') && g.slots === 3 && g.big != null && last === g.big && g.hon && !g.q && up >= 1 && g.sw <= g.cw};
  if (!out.cond.ok) out.errors.push('조건 찾기 탭: ' + JSON.stringify(out.cond).slice(0, 400));
});
await step('영어 판', async () => { // 사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」 · 규칙 71 — 지구 단추 · ?lang=en · 보이는 한국어 0(사장님 글 · 기사 원문 lang="ko" 빼고) · 끝에 ?lang=ko 로 되돌림(이 기계 기억)
  const han = async () => page.evaluate(() => { const H = /[가-힣]/, bad = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!el || el.closest('[lang="ko"], script, style, noscript, [hidden], [aria-hidden="true"]')) continue; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue; if (H.test(n.nodeValue)) bad.push(n.nodeValue.trim().slice(0, 40)); } return {en: document.documentElement.classList.contains('en'), lang: document.documentElement.lang, btn: !(document.querySelector('#langBtn')?.hidden ?? true), han: bad.length, first: bad.slice(0, 3), sw: document.documentElement.scrollWidth, cw: innerWidth}; });
  const R = {};
  for (const [k, h] of [['home', '#/'], ['list', '#/list'], ['cond', '#/cond'], ['surge', '#/surge'], ['cal', '#/cal'], ['up', '#/up'], ['co', '#/c/005930']]) { await page.goto(B + '/atlas/?lang=en&v=' + Date.now() + h, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view h1, #view .m4-sec', {timeout: 30000}).catch(() => {}); await page.waitForTimeout(1500); if (k === 'home' || k === 'cond') await shot('p37-en-' + k); R[k] = await han(); const m = await page.evaluate(() => (window.__atlasI18n?.missing?.() ?? []).map(x => String(x.key).slice(0, 160))); R[k].miss = m.length; R[k].missFirst = m.slice(0, 5); } // 사이트에만 있는 글(장 중 · 새 업데이트 기록)도 사전에 있나 — 남은 틀 0
  await page.goto(B + '/atlas/?lang=ko&v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({lang: document.documentElement.lang, en: document.documentElement.classList.contains('en')}));
  out.english = {pages: R, back, ok: Object.values(R).every(x => x.en && x.lang === 'en' && x.btn && x.han === 0 && x.miss === 0 && x.sw <= x.cw) && back.lang === 'ko' && !back.en};
  if (!out.english.ok) out.errors.push('영어 판: ' + JSON.stringify(out.english).slice(0, 400));
});
await step('편지 여는 밤', async () => { // 사장님 2026-10-17 01:29 「그래 이제 만들어봐」 · 규칙 73 — 초대받은 분만: 손님 화면 · /api/letter 손님 답 · 검색 제외 머리말 · 다른 사이트에서 쓰기 403(쓰는 것 없음)
  const NC = {'Cache-Control': 'no-cache'};
  const hr = await fetch(B + '/letter.html?v=' + Date.now(), {headers: NC, signal: AbortSignal.timeout(30000)}), robots = hr.headers.get('x-robots-tag') ?? '';
  const ar = await fetch(B + '/api/letter', {headers: NC, signal: AbortSignal.timeout(30000)}), A = ar.ok ? await ar.json().catch(() => null) : null;
  const xr = await fetch(B + '/api/letter', {method: 'POST', headers: {'content-type': 'application/json', origin: 'https://probe.invalid'}, body: JSON.stringify({op: 'join', code: 'x'.repeat(16), nick: '탐침'}), signal: AbortSignal.timeout(30000)});
  await page.goto(B + '/letter.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('.hero .clk', {timeout: 30000}).catch(() => {}); await page.waitForTimeout(1500); await shot('p40-letter');
  const g = await page.evaluate(() => ({h1: document.querySelector('.hero h1')?.textContent ?? '', clock: document.querySelector('.hero .clk')?.textContent ?? '', guest: document.querySelector('.card h2')?.textContent ?? '', write: !!document.querySelector('#write'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    title: document.title, kick: document.querySelector('.hero .kick')?.textContent ?? ''}));
  g.old = oldNamesIn(await page.evaluate(nameScan)).slice(0, 6); // 이름 바꾸기(2026-10-17) — 옛 이름(아틀란스 · ATLAS) 남음 0 · 창 제목 「편지 여는 밤 · 보드리」 · 머리 「보드리 편지」
  out.letter = {html: hr.status, robots, api: ar.status, week: A?.week ?? null, current: A?.current ?? null, opensAt: A?.opensAt ?? null, open: A?.open ?? null, count: A?.count ?? null, member: A?.member ?? null, owner: A?.owner ?? null, foreign: xr.status, ...g,
    ok: hr.status === 200 && /noindex/.test(robots) && ar.status === 200 && /^\d{4}-\d{2}-\d{2}$/.test(A?.week ?? '') && A?.week === A?.current && A?.open === false && A?.member === false && A?.owner === false && Number.isInteger(A?.count) && xr.status === 403
      && g.h1.includes('편지가 열려요') && /\d+일 \d{2}시간/.test(g.clock) && g.guest === '초대받은 분만 쓸 수 있어요' && !g.write && g.sw <= g.cw && !g.old.length && g.title === '편지 여는 밤' + TITLE_TAIL && g.kick === NEW_NAME + ' 편지'};
  if (!out.letter.ok) out.errors.push('편지 여는 밤: ' + JSON.stringify(out.letter).slice(0, 400));
});
await step('새 아틀란스 첫 화면', async () => { // 규칙 74 · 77 — 첫 화면(/) = 고도리 · 아래 단추 다섯(2026-10-17 21:10 [2] — 오늘 장 · 시황 · 매매일지 · 관심 · 보유종목) · 질문 칸은 종목 고르기부터 · 고도리 칸 잠금 → 열림 · 보유종목 · 회사 화면 · 시황 · 매매일지
  const hr = await fetch(B + '/?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}), robots = hr.headers.get('x-robots-tag') ?? '', body = await hr.text(); // 첫 화면(/) = 새 아틀란스(2026-10-17 04:04 「모두 바꿔」)
  const J = async u => { try { const r = await fetch(B + u + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)}); return r.ok ? await r.json() : null; } catch { return null; } };
  const [G, H, core, mkt] = await Promise.all([J('/next/data/gdr.json'), J('/atlas/data/home.json'), J('/atlas/data/core.json'), J('/atlas/data/mkt.json')]);
  const allow = await nameAllow(), old = [], bad = []; // 옛 이름(아틀란스 · ATLAS · 아틀라스 · 보드리)이 보이는 글 · 창 제목 · 이름표에 남았나 — 회사 이름(아틀라스링크 등)은 뺌 · 쓰지 않을 말(words.js)
  const look = async where => { const s = await page.evaluate(nameScan); for (const x of oldNamesIn(s, allow).slice(0, 3)) old.push(where + ' ' + x); if (!s.title.endsWith(TITLE_TAIL)) old.push(where + ' 창 제목 「' + s.title + '」'); for (const w of await banned()) bad.push(where + ' 「' + w + '」'); };
  // ① 처음 기계 — 매매일지 기록 없음(고도리 칸 잠금) · 앞 단계가 남긴 기록이 있으면 지우고 다시 엶
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await viewDone();
  if (await page.evaluate(k => { const had = localStorage.getItem(k) != null; localStorage.removeItem(k); return had; }, WHY_KEY)) { await page.reload({waitUntil: 'networkidle', timeout: 60000}); await viewDone(); }
  await page.waitForTimeout(1500); await shot('p41-next-home');
  const home = await page.evaluate(() => ({tabs: [...document.querySelectorAll('.tabs a')].map(a => [a.dataset.tab ?? '', a.getAttribute('href') ?? '', a.textContent.trim()]), blocks: [...document.querySelectorAll('#view > *')].map(e => e.tagName.toLowerCase() + (e.classList[0] ? '.' + e.classList[0] : '')).join(','), chips: document.querySelectorAll('#view .chip').length, q: document.querySelectorAll('#view .empty').length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    tk: document.querySelector('#view a.tk-entry')?.getAttribute('href') ?? '', letterOnHome: document.querySelectorAll('#view .m4-letter').length, // 편지는 「보유종목」 칸(2026-10-17 17:54 명령 1 · 21:10 [2] 5)
    wy: (s => (s ? {find: !!s.querySelector('input.wy-find'), q: s.querySelector('.wy-q')?.textContent ?? '', opts: s.querySelectorAll('.wy-opt').length} : null))(document.querySelector('#view > section.wy')), // 「친구야, 왜 사?」는 종목 고르기부터(21:10 [3])
    gdr: (s => (s ? {lock: s.classList.contains('lock1'), go: s.querySelector('a.gdr-l1')?.getAttribute('href') ?? null, cells: s.querySelectorAll('.gdr-cell').length} : null))(document.querySelector('#view > section.gdr')), // 열한 질문을 한 번 끝내기 전엔 잠금([6] 1) — 잠금 칸 = section.gdr.lock1 · 고리 a.gdr-l1(2026-10-18 첫 번째 묶음 · 옛 lock · a.gdr-go)
    order: [...document.querySelectorAll('#view > *')].map(e => e.matches('section.wy') ? 'wy' : e.matches('section.gdr') ? 'gdr' : e.matches('.chips') ? 'chips' : '').filter(Boolean).slice(0, 3).join(',')}));
  await look('#/');
  // ② 고도리 칸 화면(잠금) — 잠금 칸 · 열한 질문 고리만(「어떻게 골랐나」 없음)
  await goHash('#/gdr'); await page.waitForTimeout(400); await shot('p47-next-gdr-lock');
  const gLock = await page.evaluate(() => ({lock: !!document.querySelector('#view section.gdr.lock1'), go: document.querySelector('#view section.gdr.lock1 a.gdr-l1')?.getAttribute('href') ?? null, fun: !!document.querySelector('#view section.gdr-fun'), cells: document.querySelectorAll('#view .gdr-cell').length}));
  await look('#/gdr');
  // ③ 회사 화면 — 관심 담기 · 보내기 · 같이 따져 줘 + 「이 회사로 왜 사?」 · 보내기 = 「친구에게 무슨 말을 할래?」 글상자(p-share · 알림 한 줄이 아님)
  await goHash('#/w/005930'); await page.waitForTimeout(500); await shot('p42-next-watch');
  const watch = await page.evaluate(() => ({h1: document.querySelector('#view .wt')?.textContent ?? '', ws: document.querySelector('#view .ws')?.textContent ?? '', tabs: [...document.querySelectorAll('#view nav.wtabs a')].map(a => a.getAttribute('href')), chapsOld: document.querySelectorAll('#view .chaps').length, nx: document.querySelectorAll('#view .nx').length,
    acts: [...document.querySelectorAll('#view .acts > *')].map(e => e.textContent.trim()), whyGo: (a => (a ? [a.getAttribute('href'), a.textContent.trim()] : null))(document.querySelector('#view a.why-go'))}));
  await look('#/w/005930');
  let dlg = null; const sendB = page.locator('#view .acts button', {hasText: '보내기'}).first();
  if (await sendB.count()) {
    await sendB.click();
    dlg = await page.waitForSelector('.ps-dlg .ps-h', {timeout: 15000}).then(() => page.evaluate(() => { const d = document.querySelector('.ps-dlg'); return {h: d.querySelector('.ps-h')?.textContent ?? '', open: d.matches('dialog') ? d.open : d.getAttribute('aria-modal') === 'true', ta: !!d.querySelector('textarea.ps-t'), go: !!d.querySelector('.ps-go'), x: !!d.querySelector('.ps-x'), stock: d.querySelector('.ps-d b')?.textContent ?? ''}; })).catch(() => null);
    if (dlg) { await page.waitForTimeout(300); await shot('p45-next-share'); await page.locator('.ps-dlg .ps-x').click(); dlg.closed = await page.waitForFunction(() => !document.querySelector('.ps-dlg'), null, {timeout: 5000}).then(() => true).catch(() => false); }
  }
  // ④ 보유종목 — 맨 위 제목 → 보유종목 점검 → 사장님 편지(열면 고도리) → 바로 가기 → 본 기록(「본 기록 지우기」 · ③에서 본 회사)
  //   편지 · 상품권 줄 = 지금 화면(site/next/app.js)의 HELLO_MSG · HELLO_PROMO 글자 그대로 · 첫 줄 LETTER_TITLE
  const SRC = await fs.readFile(new URL('../../../site/next/app.js', import.meta.url), 'utf8'), MSG = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(SRC) || [, '[]'])[1].replace(/'/g, '"')), PROMO = (/const HELLO_PROMO = '([^']*)';/.exec(SRC) || [])[1];
  await goHash('#/me');
  await page.waitForFunction(() => document.querySelector('#view .m4-letter')?.classList.contains('landed'), null, {timeout: 15000}).catch(() => {}); await page.waitForTimeout(800); await shot('p44-next-me');
  const me = await page.evaluate(() => { const v = document.querySelector('#view'), clr = [...(v?.querySelectorAll('button') ?? [])].find(b => /본 기록 지우기/.test(b.textContent));
    const kind = e => (e.matches('h1') ? 'h1' : e.matches('section.hd') ? 'hold' : e.matches('.lw, .hd-fold') && e.querySelector('a.m4-letter') ? 'letter' : e.matches('h2') ? 'h2:' + e.textContent.trim() : null);
    return {order: [...(v?.children ?? [])].map(kind).filter(Boolean), h1: v?.querySelector('h1')?.textContent ?? '', holdH: Math.round(v?.querySelector('section.hd')?.getBoundingClientRect().height ?? 0), letter: [...(v?.querySelectorAll('.m4-msg .hml') ?? [])].map(e => e.textContent),
      promo: v?.querySelector('.m4-gift')?.textContent ?? '', landed: !!v?.querySelector('.m4-letter.landed'), rec: !!v?.querySelector('section.wy-me'), clear: !!clr}; });
  await look('#/me');
  // ⑤ 창 제목 = 탭 이름 · 지금 탭 표시(규칙 2) — 다섯 탭 + 시황 한 장 · 회사로 연 매매일지(④ 뒤 — 이 판에서 「보유종목」을 처음 열 때 여는 고도리가 한 번만 나와서)
  const titles = [];
  for (const [tab, hash, name] of [...TABS5, ['shorts', '#/shorts/1', '시황'], ['why', '#/why/005930', '매매일지']]) { await goHash(hash); titles.push({hash, title: await page.evaluate(() => document.title), cur: await page.evaluate(() => document.querySelector('.tabs a[aria-current="page"]')?.dataset.tab ?? null), want: name + TITLE_TAIL, tab}); }
  // ⑥ 시황 — 오늘 자료로 셀 수 있는 사실만(지수 · 오른 곳과 내린 곳 · 1주 오른 업종 · 큰 갈래 가장 오름 · 가장 내림 · 미국 — app.js shortFacts 와 같은 조건) · 급등 목록 없음
  const gs = (core?.groups ?? []).filter(g => Number.isFinite(g?.chg));
  const want = [Number.isFinite(H?.idx?.KOSPI?.day) && 'idx', Object.values(mkt?.companies ?? {}).some(c => Array.isArray(c?.l) && c.l.filter(x => x != null).length >= 2) && 'breadth', core?.rise?.list?.[0] && 'rise', gs.length >= 1 && 'gtop', gs.length >= 2 && 'glow', Number.isFinite(H?.us?.rows?.[0]?.chg) && 'us'].filter(Boolean);
  await goHash('#/shorts'); await page.waitForTimeout(500); await shot('p43-next-shorts');
  const shorts = await page.evaluate(() => ({n: document.querySelectorAll('#view .sh').length, surge: /급등/.test(document.querySelector('#view')?.innerText ?? '')}));
  await look('#/shorts');
  // ⑦ 매매일지 — 제목 · 「친구야, 왜 사?」는 종목 고르기부터 · 그 밑에 기록 · #/why/<번호> 는 그 회사를 고른 채 1번 질문
  await goHash('#/why'); await page.waitForTimeout(400); await shot('p46-next-why');
  const why = await page.evaluate(() => { const v = document.querySelector('#view'), s = v?.querySelector('section.wy');
    return {h1: v?.querySelector('h1')?.textContent ?? '', find: !!s?.querySelector('input.wy-find'), q: s?.querySelector('.wy-q')?.textContent ?? '', opts: s?.querySelectorAll('.wy-opt').length ?? -1, recAfter: !!s?.nextElementSibling?.matches('section.wy-me'), recH: v?.querySelector('section.wy-me h2')?.textContent ?? ''}; });
  await look('#/why');
  await goHash('#/why/005930'); await page.waitForTimeout(400);
  const whyCo = await page.evaluate(() => { const s = document.querySelector('#view section.wy'); return {q: s?.querySelector('.wy-q')?.textContent ?? '', opts: s?.querySelectorAll('.wy-opt').length ?? 0, stock: s?.querySelector('.wy-stn')?.textContent ?? '', find: !!s?.querySelector('input.wy-find')}; });
  await look('#/why/005930');
  // ⑧ 열한 질문을 끝낸 기계 — 끝낸 기록 한 줄(p-why.js 기록 꼴 · 답 열한 개 0 ~ 2)을 넣고 다시 엶 → 고도리 칸 열림 · 「어떻게 골랐나」 · 카드마다 「틀린다면 이유」(gdr.json wrong) · 끝에 기록을 지워 처음 기계로 되돌림
  //    2026-10-18 첫 번째 묶음 — 첫 화면 칸 자리: 오늘 끝낸 기록이면 한 줄(section.gdr.today1 · 「오늘 점수 준비 n / 22」→ #/gdr · 「다시 하기 ›」→ #/why) · 오늘 쉬어 가자면 닫는 한 줄(rest1) · 어제만 끝냈으면 옛 그대로 열린 칸(칸 수 = 고른 곳 + 쉬는 돈) · 열린 칸은 #/gdr 에서도
  const rec = {at: new Date().toISOString(), asOf: G?.asOf ?? null, code: '005930', name: watch.h1 || '삼성전자', price: null, day: null, answers: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 0, reds: 0, verdict: '좋아, 정해 둔 대로만', groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, bigDay: null, why: '', promise: null, picks: []};
  const gdrRead = () => page.evaluate(() => (s => (s ? {lock: s.classList.contains('lock1'), one: s.classList.contains('today1'), rest: s.classList.contains('rest1'), cells: s.querySelectorAll('.gdr-cell').length, sum: s.querySelector('.gdr-sum')?.textContent ?? '', links: [...s.querySelectorAll('a[href]')].map(a => a.getAttribute('href')), text: (s.innerText ?? '').replace(/\s+/g, ' ').trim()} : null))(document.querySelector('#view > section.gdr')));
  const homeAs = async r => { await page.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify([x])), [WHY_KEY, r]); await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await viewDone(); await page.waitForTimeout(1200); };
  const toGdr = async name => { await page.evaluate(() => { const e = document.querySelector('#view > section.gdr'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 68); }); await page.waitForTimeout(400); await shot(name); };
  await homeAs(rec); // 오늘 끝냄 → 한 줄
  const homeOne = await gdrRead();
  await toGdr('p48-next-home-open');
  await look('#/ 오늘 끝냄');
  await homeAs({...rec, verdict: '오늘은 쉬어 가자'}); // 오늘 쉬어 가자 → 닫는 한 줄
  const homeRest = await gdrRead();
  await look('#/ 쉬어 가는 날');
  await homeAs({...rec, at: new Date(Date.now() - 864e5).toISOString()}); // 어제만 끝냄 → 열린 칸(옛 그대로)
  const homeOpen = await gdrRead();
  await toGdr('p48b-next-home-open-yesterday');
  await look('#/ 열림');
  await goHash('#/gdr'); await page.waitForTimeout(400);
  const gOpen = await page.evaluate(() => ({lock: !!document.querySelector('#view section.gdr.lock1'), fun: !!document.querySelector('#view section.gdr-fun'), cells: document.querySelectorAll('#view .gdr-cell').length}));
  await look('#/gdr 열림');
  const wrong = [];
  for (const p of [G?.picks?.[0], G?.picks?.at(-1)].filter((p, i, a) => p && a.indexOf(p) === i)) {
    await goHash('#/gdr/' + p.no); await page.waitForTimeout(500);
    const t = await page.evaluate(no => document.querySelector('#gdr-' + no + ' .gdr-wrong')?.textContent ?? null, p.no);
    const w = typeof p.wrong === 'string' && p.wrong.trim() ? '틀린다면 이유 ' + p.wrong : null;
    wrong.push({no: p.no, got: t, ok: t != null && (w ? t === w : /^틀린다면 이유 \?/.test(t))});
    if (wrong.length === 1) await shot('p50-next-gdr-card');
    await look('#/gdr/' + p.no);
  }
  await goHash('#/why'); await page.waitForTimeout(300);
  const whyRec = await page.evaluate(() => document.querySelector('#view section.wy-me h2')?.textContent ?? '');
  await page.evaluate(k => localStorage.removeItem(k), WHY_KEY);
  out.next = {html: hr.status, robots, home, titles: titles.filter(t => t.title !== t.want || t.cur !== t.tab), gLock, watch, dlg, me: {...me, letter: me.letter.length, first: me.letter[0] ?? null}, shorts: {...shorts, want}, why, whyCo, gdr: {picks: G?.picks?.length ?? null, homeOne, homeRest, homeOpen, gOpen, wrong, whyRec}, old: old.slice(0, 8), bad: bad.slice(0, 8)};
  const okTabs = JSON.stringify(home.tabs) === JSON.stringify(TABS5.map(([t, hh, n]) => [t, hh, n])) && titles.length === 7 && titles.every(t => t.title === t.want && t.cur === t.tab);
  const okHome = home.blocks === 'div.chips,a.tk-entry,a.hm-band,section.wy,section.gdr,details.hm-more,p.safe' && home.chips === 10 && home.q === 0 && home.sw <= home.cw && !home.letterOnHome && home.tk === (NREADY.has('talk') ? '#/talk' : '/atlas/#/talk')
    && home.wy?.find === true && home.wy.q === '어떤 종목이야?' && home.wy.opts === 0 && home.gdr?.lock === true && home.gdr.go === '#/why' && home.gdr.cells === 0 && home.order === 'chips,wy,gdr' && gLock.lock && gLock.go === '#/why' && !gLock.fun && gLock.cells === 0;
  const okWatch = watch.h1 === '삼성전자' && /한 달 동안 [+−]?\d/.test(watch.ws) && JSON.stringify(watch.tabs) === JSON.stringify(['past', 'rivals', 'grow', 'range'].map(k => '#/w/005930/' + k)) && watch.chapsOld === 0 && watch.nx >= 1 && watch.acts.length === 3 && /^관심 담[기음]$/.test(watch.acts[0]) && watch.acts[1] === '보내기' && watch.acts[2] === '같이 따져 줘'
    && watch.whyGo?.[0] === '#/why/005930' && /이 회사로 왜 사\?/.test(watch.whyGo[1]) && dlg?.h === '친구에게 무슨 말을 할래?' && dlg.open && dlg.ta && dlg.go && dlg.x && dlg.stock === watch.h1 && dlg.closed === true;
  const okMe = me.h1 === '보유종목' && me.order.slice(0, 3).join(',') === 'h1,hold,letter' && me.order.indexOf('h2:바로 가기') > 2 && me.order.indexOf('h2:본 기록') > me.order.indexOf('h2:바로 가기') && !me.rec && me.clear && me.landed
    && MSG[0] === LETTER_TITLE && JSON.stringify(me.letter) === JSON.stringify(MSG) && me.promo === PROMO;
  const okShorts = want.length >= 1 && shorts.n === want.length && !shorts.surge;
  const okWhy = why.h1 === '매매일지' && why.find && why.q === '어떤 종목이야?' && why.opts === 0 && why.recAfter && why.recH === '왜 사? 기록 0번' && /^1\. /.test(whyCo.q) && whyCo.opts === 3 && whyCo.stock === watch.h1 && !whyCo.find;
  const okOpen = !!G && homeOne?.one === true && homeOne.links.join() === '#/gdr,#/why' && /^오늘 점수 준비 (\d+|\?) \/ 22 · 다시 하기 ›$/.test(homeOne.text) && homeOne.cells === 0 && !homeOne.lock && !homeOne.rest
    && homeRest?.rest === true && homeRest.text === '오늘은 담는 칸을 닫아 둘게' && homeRest.cells === 0 && !homeRest.lock && !homeRest.one
    && homeOpen?.lock === false && !homeOpen.one && !homeOpen.rest && homeOpen.cells === G.picks.length + 1 && homeOpen.sum.startsWith('비중 합 100%') && !gOpen.lock && gOpen.fun && gOpen.cells === G.picks.length + 1 && wrong.length >= Math.min(1, G.picks.length) && wrong.every(x => x.ok) && whyRec === '왜 사? 기록 1번'; // 카드(틀린다면 이유)는 고른 곳이 있을 때만 — 고른 곳 0 이면 칸 하나(현금으로 둠)뿐
  out.next.part = {tabs: okTabs, home: okHome, watch: okWatch, me: okMe, shorts: okShorts, why: okWhy, open: okOpen, names: !old.length, words: !bad.length};
  out.next.ok = hr.status === 200 && !/noindex/.test(robots) && body.includes('/next/app.js') && Object.values(out.next.part).every(Boolean);
  if (!out.next.ok) out.errors.push('새 아틀란스 첫 화면: ' + JSON.stringify({part: out.next.part, titles: out.next.titles, old: out.next.old, bad: out.next.bad}).slice(0, 500));
});
await step('고도리 영어 단추', async () => { // 아래 단추 다섯 영어 이름 · 창 제목 「<이름> · Godori」(2026-10-17 21:10 [2]) — 끝에 ?lang=ko 로 되돌림(이 기계 기억 atlas:lang)
  await page.goto(B + '/?lang=en&v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await viewDone(); await page.waitForTimeout(1200);
  const tabs = await page.evaluate(() => [...document.querySelectorAll('.tabs a')].map(a => [a.dataset.tab ?? '', a.textContent.trim()]));
  const titles = [];
  for (const [tab, hash, , en] of TABS5) { await goHash(hash); await page.waitForTimeout(300); titles.push({tab, got: await page.evaluate(() => document.title), want: en + ' · ' + NAME_EN}); }
  await shot('p49-next-en-tabs');
  await page.goto(B + '/?lang=ko&v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await viewDone();
  const back = await page.evaluate(() => ({lang: document.documentElement.lang, en: document.documentElement.classList.contains('en'), tab: document.querySelector('.tabs a[data-tab="home"]')?.textContent.trim() ?? '', title: document.title}));
  out.nextEn = {tabs, titles, back, ok: JSON.stringify(tabs) === JSON.stringify(TABS5.map(([t, , , en]) => [t, en])) && titles.every(t => t.got === t.want) && back.lang === 'ko' && !back.en && back.tab === TABS5[0][2] && back.title === TABS5[0][2] + TITLE_TAIL};
  if (!out.nextEn.ok) out.errors.push('고도리 영어 단추: ' + JSON.stringify(out.nextEn).slice(0, 400));
});
await step('새 아틀란스 모든 쪽', async () => { // 사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 — 옮긴 쪽(app.js READY)마다 실제 사이트에서 열어 봄(숫자 맞대기는 livenext 의 쪽 검사)
  const done = () => page.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
  const R = [['co', '#/w/005930', '.co-d'], ['past', '#/w/005930/past', '.chaps .cp.now'], ['rivals', '#/w/005930/rivals', '.chaps .cp.now'], ['grow', '#/w/005930/grow', '.chaps .cp.now'], ['range', '#/w/005930/range', '.chaps .cp.now'],
    ['chx', '#/ch/g/' + 'semi', '.chx-d'], ['surge', '#/surge', null], ['surge', '#/surge/20', null], ['cal', '#/cal', null], ['cond', '#/cond', null], ['talk', '#/talk', null], ['up', '#/up', null], ['time', '#/time', null], ['info', '#/info', null], ['today', '#/today', null],
    ['why', '#/why', 'section.wy input.wy-find', 60], ['why', '#/why/005930', 'section.wy .wy-opt', 60], ['gdr', '#/gdr', 'section.gdr.lock1 a.gdr-l1[href="#/why"]', 60]].filter(([k]) => NREADY.has(k)); // why · gdr = 고도리 한 장 명령문(2026-10-17 17:54) · 매매일지는 종목 고르기부터(#/why/<번호> 는 1번 질문) · 처음 기계의 고도리 칸은 잠금(21:10 [6] 1) · 넷째 = 글 길이 하한
  const got = [], allow = await nameAllow();
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await done();
  await page.evaluate(k => localStorage.removeItem(k), WHY_KEY); // 처음 기계(매매일지 기록 없음) — 고도리 칸 잠금을 봄(열린 칸은 「새 아틀란스 첫 화면」 ⑧)
  for (const [k, hash, sel, min = 150] of R) {
    await goHash(hash); await page.waitForTimeout(700);
    const g = await page.evaluate(sel => ({url: location.pathname + location.hash, n: (document.querySelector('#view')?.innerText ?? '').trim().length /* 쪽 모듈은 한 칸(div)에 담겨 칸 수가 1 — 글 길이로 봄 */, bad: [...document.querySelectorAll('#view .empty')].map(e => e.textContent).filter(t => /그리지 못했어요/.test(t)).length, sel: sel ? !!document.querySelector('#view ' + sel) : true, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, title: document.title}), sel);
    g.old = oldNamesIn(await page.evaluate(nameScan), allow).slice(0, 3); // 옛 이름(아틀란스 · ATLAS · 아틀라스) 남음 — 회사 이름은 뺌
    g.words = await banned(); // 쓰지 않을 말(words.js screenHits — 「사라져」 · 「공매도」는 셈 밖)
    g.ok = g.url.startsWith('/') && !g.url.includes('/atlas/') && g.n >= min && !g.bad && g.sel && g.sw <= g.cw && !g.old.length && !g.words.length && g.title.endsWith(TITLE_TAIL); g.k = k; got.push(g);
    if (got.length <= 6) await shot('p5' + got.length + '-next-' + k);
  }
  out.nextPages = {ready: [...NREADY], pages: got, ok: got.every(g => g.ok)};
  if (!out.nextPages.ok) out.errors.push('새 아틀란스 모든 쪽: ' + JSON.stringify(got.filter(g => !g.ok)).slice(0, 400));
});
await b.close();
out.ok = out.oldFound === 0 && out.errors.length === 0;
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({oldFound: out.oldFound, sameAsRepo: out.sameAsRepo, media: out.media.length, shots: out.shots.length, errors: out.errors}));

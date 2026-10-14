// 탐침 — 올라간 사이트(aaa7377.com)를 진짜 브라우저(휴대폰 크기)로 열어 봄(사장님 2026-10-13 03:35 「못한거 해내」 · 03:38 「모든 흔적 다 지워」)
//   깃허브 실행기에서만 바깥에 닿음 · 결과 reports/atlas11/probe/live-view/(그림 · summary.json)
//   ① 소개 그림 · 영상 · 달 · 링크 미리보기 파일을 받아 git 블롭 번호로 셈 — 옛 그림(지운 판 43개) 가운데 하나라도 나오면 실패
//   ② 맨 위 2장 → 「자세히 ›」 글 · ③ 업데이트 탭의 10월 12일 21:11 줄 · ④ 소개 한 장(hello.html) · ⑤ 옛 판 첫 화면 띠 — 그림으로 남김
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = 'https://aaa7377.com', dir = 'reports/atlas11/probe/live-view'; await fs.mkdir(dir, {recursive: true});
// 지운 옛 그림 판(git 블롭 번호 · 그림이 아니라 번호만)
const OLD = new Set(`${(await fs.readFile('scripts/atlas11/probe/old-media-blobs.txt', 'utf8'))}`.split(/\s+/).filter(Boolean));
const blobId = buf => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const MEDIA = ['/media/makbi-moon.svg', '/media/makbi-icon.svg', '/media/makbi-hello.svg', '/media/makbi-poster.jpg', '/media/makbi-intro.mp4', '/media/makbi-intro.webm', '/og-makbi.jpg',
  // 옛 주소 — 지운 그림이 다시 나오지 않는지(없거나 첫 화면 글이 와야 함)
  '/media/atlas-moon-face.jpg', '/media/atlas-hello-wide.jpg', '/media/atlas-hello-132.jpg', '/media/atlas-hello-face.jpg', '/media/atlas-hello.jpg', '/media/atlas-hello.mp4', '/media/atlas-hello.webm', '/og-hello.jpg'];
const out = {made: new Date().toISOString(), base: B, media: [], oldFound: 0, sameAsRepo: 0, shots: [], texts: {}, errors: []};
for (const p of MEDIA) {
  try {
    const r = await fetch(B + p + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)});
    const buf = Buffer.from(await r.arrayBuffer()), id = blobId(buf);
    let repo = null; try { repo = blobId(await fs.readFile('site' + p)); } catch { /* 저장소에 없음 */ }
    const row = {path: p, status: r.status, bytes: buf.length, old: OLD.has(id), sameAsRepo: repo === id};
    out.media.push(row); if (row.old) out.oldFound++; if (row.sameAsRepo) out.sameAsRepo++;
  } catch (e) { out.errors.push(`${p}: ${String(e.message).slice(0, 80)}`); }
}
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const page = await ctx.newPage();
const shot = async (name, opts = {}) => { const f = `${dir}/${name}.png`; await page.screenshot({path: f, ...opts}); out.shots.push(f); };
const step = async (name, fn) => { try { await fn(); } catch (e) { out.errors.push(`${name}: ${String(e.message).slice(0, 120)}`); } };
await step('첫 화면', async () => {
  await page.goto(B + '/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForSelector('.hbar', {timeout: 30000}); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[aria-label="‖ 멈춤"], .hplay')?.click?.());
  await shot('p1-slide1');
  out.texts.moon = await page.evaluate(() => { const hd = document.querySelector('h1.head, .co-head h1'); return hd ? getComputedStyle(hd, '::before').backgroundImage : null; });
});
await step('2장', async () => {
  await page.click('button[aria-label="다음 장"]'); await page.waitForTimeout(900); await shot('p2-slide2');
  out.texts.slide2 = await page.evaluate(() => [...document.querySelectorAll('.hs')].filter(s => !s.hidden && getComputedStyle(s).visibility !== 'hidden').map(s => s.innerText).join('\n').slice(0, 800));
  const more = page.locator('.hs:not([hidden]) .hmore').filter({hasText: '자세히'}).first();
  await more.click({timeout: 10000}); await page.waitForSelector('.hdet:not([hidden])', {timeout: 10000}); await page.waitForTimeout(500);
  out.texts.detail = (await page.locator('.hdet').innerText()).slice(0, 2000);
  await page.locator('.hdet').screenshot({path: `${dir}/p3-slide2-detail.png`}); out.shots.push(`${dir}/p3-slide2-detail.png`);
});
await step('업데이트 탭', async () => {
  await page.goto(B + '/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
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
});
await step('36곳 없음', async () => { // 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 옛 주소 · 탭 · 글 · 자료 파일
  await page.goto(B + '/?v=' + Date.now() + '#/36', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({hash: location.hash, tabs: [...document.querySelectorAll('nav.tabbar a')].map(a => a.textContent.trim()), seen: (document.body.innerText.match(/매수 검토|셈 차례|봉인 36곳|365곳 · 36곳|36곳이 365곳 평균보다|36곳 탭/g) ?? []).length}));
  await shot('p7-no36');
  await page.goto(B + '/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  r.seenUp = (await page.evaluate(() => document.body.innerText.match(/매수 검토|셈 차례|봉인 36곳|365곳 · 36곳|36곳이 365곳 평균보다|36곳 탭/g) ?? [])).length; // 업데이트 탭 글도(13:0x)
  r.seen += r.seenUp;
  const get = async u => { try { const x = await fetch(B + u + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}); const t = await x.text(); return {status: x.status, json: /^\s*\{/.test(t), picks: /"picks"|매수 검토/.test(t)}; } catch { return {status: 0}; } };
  const pick = await get('/atlas/data/pick36.json'), range = await get('/atlas/data/range.json'); // 없는 파일은 404 또는 첫 화면 글(되돌려 보내기) — 36곳 자료(JSON)만 아니면 됨
  out.no36 = {...r, pick36: pick, range, ok: (r.hash === '#/' || r.hash === '') && r.tabs.length === 3 && r.seen === 0 && !pick.json && !pick.picks && range.status === 200 && range.json && !range.picks};
  if (!out.no36.ok) out.errors.push('36곳 없음: ' + JSON.stringify(out.no36).slice(0, 160));
});
await step('줄 선 그래프', async () => { // 사장님 2026-10-13 12:30 「이 사진처럼 그 업종 이라든지 종목에 그래프가 표현되게해」
  const cnt = () => page.evaluate(() => { const rows = [...document.querySelectorAll('#view .board .row')]; return {rows: rows.length, lines: rows.filter(r => (r.querySelector('.track .spk .ln')?.getAttribute('d') ?? '').length > 10).length}; });
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('#view .board'); if (b) window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 140); }); await page.waitForTimeout(9000); // 경주가 끝날 때까지
  const home = await cnt(); await shot('p8-home-board');
  await page.goto(B + '/?v=' + Date.now() + '#/list', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2500);
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
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const home = await page.evaluate(() => document.querySelector('#view .say.pk')?.innerText ?? '');
  await page.evaluate(() => { const e = document.querySelector('#view .say.pk'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 160); }); await page.waitForTimeout(9000); await shot('p12-ml-home'); // 경주가 끝날 때까지
  const whyOf = async (c, tag) => { if (!c) return '';
    await page.goto(B + '/?v=' + Date.now() + '#/c/' + c, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
    const t = await page.evaluate(() => [...document.querySelectorAll('#view .box')].find(b => /왜 멍거 · 린치 조건/.test(b.innerText))?.innerText ?? '');
    await page.evaluate(() => { const b = [...document.querySelectorAll('#view .box')].find(x => /왜 멍거 · 린치 조건/.test(x.innerText)); if (b) b.scrollIntoView({block: 'center'}); }); await page.waitForTimeout(400); await shot(tag); return t; };
  const why = await whyOf(cM, 'p13-ml-why-mg'), whyL = await whyOf(cL, 'p14-ml-why-ly');
  await page.goto(B + '/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
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
  await page.goto(B + '/?v=' + Date.now() + '#/find', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  await page.fill('#q', last?.n ?? '?'); await page.waitForTimeout(800);
  const hits = await page.$eval('#hits', x => x.innerText).catch(() => ''); await shot('p15-find-all');
  // 목록 모두(2026-10-14 11:02 「이거 다 올려」) — 글자 섞인 번호 회사를 번호로 · 상장 펀드를 이름으로 찾음(사진 p16 · p17)
  const findShot = async (q, tag) => { await page.goto(B + '/?v=' + Date.now() + '#/find', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200); await page.fill('#q', q); await page.waitForTimeout(800); const t = await page.$eval('#hits', x => x.innerText).catch(() => ''); await shot(tag); return t; };
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
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('#view h2.sec.rt') ?? document.querySelector('#view .board'); if (b) window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY - 70); }); await page.waitForTimeout(9000); // 사진 = 경주 제목 · 오름 · 내림 줄 · 금빛 설명 · 경주
  const home = await page.evaluate(() => ({rows: document.querySelectorAll('#view .board .row').length, gold: document.querySelectorAll('#view .board .badge.gold').length, say: document.querySelector('#view .gold-say')?.textContent ?? '', tab: document.querySelector('#tabList')?.textContent ?? '',
    head: document.querySelector('#view h2.sec.rt')?.textContent ?? '', names: [...document.querySelectorAll('#view .board .row .nm .nt')].map(x => x.textContent), glinks: [...document.querySelectorAll('#view .glinks a')].map(a => a.getAttribute('href'))})); // 요즘 오르는 업종(2026-10-14 20:01 「1주일로 해」 · 규칙 64) — 줄 = core.rise · 큰 갈래 고리
  await shot('p18-home-all');
  await page.goto(B + '/?v=' + Date.now() + '#/i/' + encodeURIComponent(gold.name), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000);
  const ind = await page.evaluate(() => ({rows: document.querySelectorAll('#view .board .row').length, pk: [...document.querySelectorAll('#view .board .row.pk')].map(a => a.getAttribute('href')), x: document.querySelectorAll('#view .board .row[href^="#/x/"]').length, c: document.querySelectorAll('#view .board .row[href^="#/c/"]').length}));
  await page.evaluate(() => { const r = document.querySelector('#view .board .row.pk'); if (r) window.scrollTo(0, r.getBoundingClientRect().top + window.scrollY - 260); }); await page.waitForTimeout(600);
  await shot('p19-industry-gold');
  await page.goto(B + '/?v=' + Date.now() + '#/list', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2500);
  const list = await page.evaluate(() => ({rows: document.querySelectorAll('#view .board .row').length, pk: document.querySelectorAll('#view .board .row.pk').length, head: document.querySelector('#view h1')?.textContent ?? ''}));
  await shot('p20-list-all');
  out.allCo = {mkt: mk.n, companies: core.funnel?.companies ?? null, mktN: core.mkt?.n ?? null, groups: core.groups.length, industries: core.industries.length, members: mem, picked: core.funnel?.picked ?? null, pk: mk.pk, pkIndustries: pkI.length, home, gold: {name: gold?.name, n: gold?.n, pk: gold?.pk, shown: shownN}, ind: {...ind, pk: ind.pk.length}, list,
    ok: !!core.mkt && mk.n === core.mkt.n && mk.n === core.funnel?.companies && mem === mk.n && mk.pk === core.funnel?.picked && home.rows === (core.rise?.list?.length ?? core.groups.length) && (!core.rise || (home.head === '요즘 오르는 업종 — 지난 1주' && JSON.stringify(home.names) === JSON.stringify(core.rise.list.map(r => r.name)) && JSON.stringify(home.glinks) === JSON.stringify(core.groups.map(g => '#/g/' + g.id)))) && home.tab === '업종 ' + core.industries.length
      && ind.rows === shownN && ind.pk.length === shownPk && ind.pk.every(h => /^#\/c\//.test(h)) && (core.co7 ? ind.x === 0 && ind.c === shownN : ind.x === shownN - shownPk) && list.rows === core.industries.length && list.pk === pkI.length};
  if (!out.allCo.ok) out.errors.push('모든 회사: ' + JSON.stringify(out.allCo).slice(0, 240));
});
await step('오늘 업종 고리 · 상품권 · 1장 글', async () => { // 사장님 2026-10-14(싱가포르) 15:01 「여기 클릭 하면 7단구조 나오게해」 · 14:56 · 14:59 상품권 · 15:19 · 15:54 1장 글(규칙 62 · 사진 p21 · p22 · p23)
  const J = async f => (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const core = await J('core.json'), home = await J('home.json');
  const hrefInd = i => (i.n === 1 ? ((core.co7 || !core.mkt || i.pk ? '#/c/' : '#/x/') + i.members[0]) : '#/i/' + encodeURIComponent(i.name)); // 모든 회사 7단(2026-10-14 17:25)이면 모두 회사
  const want = g => { const n = core.secInd?.[String(g?.name ?? '').replace(/\s+/g, '')], i = n ? core.industries.find(x => x.name === n) : null; return i ? hrefInd(i) : null; };
  const first = home.sectors?.strong?.[0] ?? null, w = want(first);
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('.hbar', {timeout: 30000}); await page.waitForTimeout(800);
  const s1 = await page.evaluate(() => ({msg: document.querySelector('.hs-hello .hmsg')?.innerText ?? '', promo: document.querySelector('.hs-hello .hpr')?.textContent ?? ''}));
  await shot('p22-slide1');
  await page.click('#ht-sec'); await page.waitForTimeout(900);
  const got = await page.evaluate(() => [...document.querySelectorAll('#hs-sec a.srow')].map(a => a.getAttribute('href')));
  await shot('p21-sec-slide');
  let after = null;
  if (got[0]) { await page.locator('#hs-sec a.srow').first().click(); await page.waitForTimeout(2000); after = await page.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent ?? '', step: document.querySelector('#view .steps, #view .lv')?.textContent ?? ''})); await shot('p21-sec-industry'); }
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(800);
  const hp = await page.evaluate(() => ({bar: document.querySelector('.hp-pbar')?.textContent ?? '', box: document.querySelector('#hp-promo')?.innerText ?? '', sms: document.querySelector('#hp-promo a[href^="sms:"]')?.getAttribute('href') ?? null, tel: document.querySelector('#hp-promo a[href^="tel:"]')?.getAttribute('href') ?? null}));
  await page.evaluate(() => document.querySelector('#hp-promo')?.scrollIntoView({block: 'center'})); await page.waitForTimeout(400);
  await shot('p23-hello-promo');
  out.promo = {secFirst: first?.name ?? null, want: w, got: got.slice(0, 6), after, s1, hp,
    ok: !!w && got[0] === w && !!after && after.hash === w && /하규는 아틀란스 해서 부자 될겁니다/.test(s1.msg) && /안상미 전무님/.test(s1.msg) && !/10명중에|못버는건/.test(s1.msg) && /스타벅스 상품권 1만원/.test(s1.promo) && !/커피 1잔|상품권 1장/.test(s1.promo)
      && /010-9011-7377/.test(hp.box) && hp.sms === 'sms:01090117377' && hp.tel === 'tel:01090117377' && /스타벅스 상품권 1만원/.test(hp.bar) && /스타벅스 상품권 1만원/.test(hp.box) && !/1잔|상품권 1장|1장씩/.test(hp.box + hp.bar)}; // 18:19(싱가포르) 「스타벅스 상품권 1만원 이라고 해 1장이 아니라」
  if (!out.promo.ok) out.errors.push('오늘 업종 고리 · 상품권 · 1장 글: ' + JSON.stringify(out.promo).slice(0, 300));
});
await step('모든 회사 7단', async () => { // 사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」 — 고른 곳 밖 회사도 업종 줄 → 3단 회사 → 4 · 5 · 6 · 7단(사진 p24 · p25)
  const J = async f => (await fetch(B + '/atlas/data/' + f + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)})).json();
  const core = await J('core.json'), mk = await J('mkt.json'), rg = await J('range.json');
  const oth = Object.keys(mk.companies).filter(c => !mk.companies[c].p), code = oth.find(c => mk.companies[c].l.some(x => x != null) && rg.others?.[c]?.ok) ?? oth[0], m = mk.companies[code];
  const ind = core.industries.find(i => i.name === m.i), co = await J('co/' + code + '.json');
  const r = {code, name: m.n, co7: core.co7 ?? null, mkt: mk.n, others: oth.length, rangeOthers: Object.keys(rg.others ?? {}).length, rangeNotOk: Object.values(rg.others ?? {}).filter(x => !x?.ok).length, coFile: !!co?.c, steps: []};
  if (ind && ind.n > 1) { await page.goto(B + '/?v=' + Date.now() + '#/i/' + encodeURIComponent(ind.name), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
    r.rowHref = await page.evaluate(c => document.querySelector(`#view .board .row[href$="/${c}"]`)?.getAttribute('href') ?? document.querySelector(`#view a[href$="/${c}"]`)?.getAttribute('href') ?? null, code);
    if (r.rowHref) { await page.locator(`#view a[href="${r.rowHref}"]`).first().click(); await page.waitForTimeout(2000); } }
  else { await page.goto(B + '/?v=' + Date.now() + '#/c/' + code, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000); }
  const look = () => page.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent ?? '', step: document.querySelector('#view .st-t b')?.textContent ?? '', text: document.querySelector('#view')?.innerText ?? ''}));
  let x = await look(); r.steps.push({hash: x.hash, step: x.step, chip: x.text.includes(`${core.rules.name} ${core.funnel.picked}곳 밖`), why: x.text.includes(`왜 ${core.rules.name} ${core.funnel.picked}곳 밖인가요?`)});
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await shot('p24-other-3');
  for (const [sub, n] of [['past', 4], ['rivals', 5], ['grow', 6], ['range', 7]]) {
    const href = `#/c/${code}/${sub}`; const a = page.locator(`#view a[href="${href}"]`).first();
    if (await a.count()) { await a.click(); await page.waitForTimeout(1800); } else { r.steps.push({hash: null, step: null, missing: href}); break; }
    x = await look(); r.steps.push({hash: x.hash, step: x.step, ...(sub === 'grow' ? {notYet: x.text.includes('세 팀 이야기는 조사 전입니다')} : {}), ...(sub === 'range' ? {model: x.text.includes('모형 가정 아래 추정 · 검증 전'), dirs: await page.evaluate(() => document.querySelectorAll('#view ul.dirbars li').length)} : {})});
  }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await shot('p25-other-7');
  await page.goto(B + '/?v=' + Date.now() + '#/x/' + code, {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(2000); r.oldX = (await look()).hash;
  const S = r.steps, want = n => `7단 중 ${n}단`;
  out.co7 = {...r, ok: !!core.co7 && core.co7 === mk.n && r.rangeOthers === r.others && r.coFile && (!ind || ind.n === 1 || r.rowHref === '#/c/' + code) && S.length === 5 && S.every((s2, k) => s2.hash === (k ? `#/c/${code}/${['past', 'rivals', 'grow', 'range'][k - 1]}` : '#/c/' + code) && s2.step === want(k + 3))
    && S[0].chip && S[0].why && S[3].notYet && S[4].model && S[4].dirs === rg.dirs.length && r.oldX === '#/c/' + code};
  if (!out.co7.ok) out.errors.push('모든 회사 7단: ' + JSON.stringify(out.co7).slice(0, 300));
});
await step('옛 판', async () => {
  await page.goto(B + '/old/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500); await shot('p6-old');
});
await b.close();
out.ok = out.oldFound === 0 && out.errors.length === 0;
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({oldFound: out.oldFound, sameAsRepo: out.sameAsRepo, media: out.media.length, shots: out.shots.length, errors: out.errors}));

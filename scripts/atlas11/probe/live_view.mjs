// 탐침 — 올라간 사이트(aaa7377.com)를 진짜 브라우저(휴대폰 크기)로 열어 봄(사장님 2026-10-13 03:35 「못한거 해내」 · 03:38 「모든 흔적 다 지워」)
//   깃허브 실행기에서만 바깥에 닿음 · 결과 reports/atlas11/probe/live-view/(그림 · summary.json)
//   ① 소개 그림 · 영상 · 달 · 링크 미리보기 파일을 받아 git 블롭 번호로 셈 — 옛 그림(지운 판 43개) 가운데 하나라도 나오면 실패
//   ② 첫 화면(먹빛 판 · 2026-10-15 09:41 · 규칙 67) 시장 칸 · 고른 곳 칸 · ③ 업데이트 탭의 10월 12일 21:11 줄 · ④ 소개 한 장(hello.html) · ⑤ 옛 판 첫 화면 띠 — 그림으로 남김
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = 'https://aaa7377.com', dir = 'reports/atlas11/probe/live-view'; await fs.mkdir(dir, {recursive: true});
const NREADY = new Set(((/const READY = new Set\(\[([^\]]*)\]\);/.exec(await fs.readFile(new URL('../../../site/next/app.js', import.meta.url), 'utf8')) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1))); // 새 아틀란스로 옮긴 쪽(규칙 74)
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
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForSelector('#view .m4-sec', {timeout: 30000}); await page.waitForTimeout(600);
  const band = await page.evaluate(() => document.querySelector('#view .m4-letter .m4-act')?.textContent ?? ''); // 먹빛 첫 화면 편지 칸 「친구에게 소개하기 · 홍표 35초 영상 · 보내기」
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(600);
  const hv = await page.evaluate(async () => {
    const v = document.querySelector('video.hp-vid'), meta = n => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.getAttribute('content') ?? '';
    if (v) { v.preload = 'auto'; v.load(); await new Promise(r => { if (v.readyState >= 1) r(); else { v.addEventListener('loadedmetadata', r, {once: true}); setTimeout(r, 20000); } }); }
    return {dur: v ? v.duration : null, label: v?.getAttribute('aria-label') ?? '', desc: meta('description'), og: meta('og:description'), alt: meta('og:image:alt'), body: document.body.innerText, share: window.__helloShare?.text ?? ''};
  });
  await shot('p26-hello-video');
  const all = [band, hv.label, hv.desc, hv.og, hv.alt, hv.body, hv.share].join(' '); // 옛 판(/old/) 띠는 그대로(옛 판 화면 코드 안 고침 — 규칙 65)
  out.hongpyo = {band, dur: hv.dur, label: hv.label, desc: hv.desc, alt: hv.alt, share: hv.share,
    ok: /보드리 1분 영상/.test(band) && Math.abs((hv.dur ?? 0) - 60) < 0.6 && /보드리/.test(hv.label) && /보드리/.test(hv.desc) && /보드리/.test(hv.og) && /보드리/.test(hv.alt) && /보드리가 1분/.test(hv.share) && !/막비|24초|35초|홍표|10명/.test(all)}; // 2026-10-16 21:00 「홍표 → 보드리」 · 2026-10-17 1분 영상(옛 35초 · 10명 글이 다시 나오면 걸림)
  if (!out.hongpyo.ok) out.errors.push('홍표 영상: ' + JSON.stringify(out.hongpyo).slice(0, 300));
});
await step('여는 홍표', async () => { // 사장님 2026-10-15(싱가포르) 04:10 「열면 홍표 니오게 해」 · 05:05 「첫화면 5초 있다 움직여」 · 06:01 「가」(규칙 66 · 사진 p27 · p28) — 열면 1장에 홍표 그림 + 「홍표!」 세 번 → 5초에 사장님 글
  await page.goto(B + '/atlas/?v=' + Date.now() + '#/', {waitUntil: 'commit', timeout: 60000}); await page.waitForSelector('#view .hpi', {timeout: 30000}); const t0 = Date.now();
  const look = () => page.evaluate(() => { const a = document.querySelector('#view a.m4-letter'), pi = a?.querySelector('.hpi'), img = pi?.querySelector('img.hpi-bird'), ls = [...(a?.querySelectorAll('.hml') ?? [])]; // 먹빛 첫 화면(2026-10-15) 편지 칸
    return {intro: !!a?.classList.contains('intro'), img: img ? img.complete && img.naturalWidth > 0 : false, bub: [...(pi?.querySelectorAll('.hpi-b') ?? [])].map(x => [x.textContent, +getComputedStyle(x).opacity]),
      shown: ls.some(x => getComputedStyle(x).visibility === 'visible'), ml: ls.length ? Math.min(...ls.map(x => +getComputedStyle(x).opacity)) : null, msg: a?.querySelector('.hmsg')?.innerText ?? '',
      bird: img ? (q => [Math.round(q.top), Math.round(q.bottom), innerHeight])(img.getBoundingClientRect()) : null}; }); // 그림이 첫 화면 안(틀림 장부 45)
  await page.waitForTimeout(Math.max(0, 2700 - (Date.now() - t0))); const i1 = await look(); await shot('p27-hello-intro');
  await page.waitForTimeout(Math.max(0, 4000 - (Date.now() - t0))); const i4 = await look(); // 홍표 5초 — 4초에도 홍표 그대로 · 글은 아직(4.2초에 제자리로 날아감)
  await page.waitForTimeout(Math.max(0, 8200 - (Date.now() - t0))); const i2 = await look(); await shot('p28-hello-text'); // 5초에 글 쓰기 시작 · 7.4초쯤 다 씀
  out.helloIntro = {i1, i4: {intro: i4.intro, shown: i4.shown, bub: i4.bub.length}, i2: {intro: i2.intro, shown: i2.shown, ml: i2.ml},
    ok: i1.intro && i1.img && i1.bub.length === 3 && i1.bub.every(([t, o]) => t === '보드리!' && o > 0.9) && !!i1.bird && i1.bird[0] >= 50 && i1.bird[1] <= i1.bird[2] - 50 && !i1.shown && i4.intro && !i4.shown && i4.bub.length === 3 && i4.bub.every(([, o]) => o > 0.9)
      && !i2.intro && i2.shown && i2.ml > 0.95 && /아틀란스 주식 격언 열 가지/.test(i2.msg) && /좋은 때를 기다립니다\./.test(i2.msg)};
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
  const g = await page.evaluate(() => ({h1: document.querySelector('.hero h1')?.textContent ?? '', clock: document.querySelector('.hero .clk')?.textContent ?? '', guest: document.querySelector('.card h2')?.textContent ?? '', write: !!document.querySelector('#write'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  out.letter = {html: hr.status, robots, api: ar.status, week: A?.week ?? null, current: A?.current ?? null, opensAt: A?.opensAt ?? null, open: A?.open ?? null, count: A?.count ?? null, member: A?.member ?? null, owner: A?.owner ?? null, foreign: xr.status, ...g,
    ok: hr.status === 200 && /noindex/.test(robots) && ar.status === 200 && /^\d{4}-\d{2}-\d{2}$/.test(A?.week ?? '') && A?.week === A?.current && A?.open === false && A?.member === false && A?.owner === false && Number.isInteger(A?.count) && xr.status === 403
      && g.h1.includes('편지가 열려요') && /\d+일 \d{2}시간/.test(g.clock) && g.guest === '초대받은 분만 쓸 수 있어요' && !g.write && g.sw <= g.cw};
  if (!out.letter.ok) out.errors.push('편지 여는 밤: ' + JSON.stringify(out.letter).slice(0, 400));
});
await step('새 아틀란스 첫 화면', async () => { // 사장님 2026-10-17 02:22 · 02:24 「가」 · 02:38 「정교하게 만들어라」 · 규칙 74 — /next/ 홈 · 보는 화면 · 쇼츠 · 검색 제외 머리말(모든 회사 · 채널 맞대기는 탐침 livenext)
  const hr = await fetch(B + '/?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}), robots = hr.headers.get('x-robots-tag') ?? '', body = await hr.text(); // 첫 화면(/) = 새 아틀란스(2026-10-17 04:04 「모두 바꿔」)
  const done = () => page.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await done(); await page.waitForTimeout(6500); await shot('p41-next-home');
  const home = await page.evaluate(() => ({tabs: [...document.querySelectorAll('.tabs a')].map(a => a.textContent.trim()), cards: document.querySelectorAll('#view .card').length, chips: document.querySelectorAll('#view .chip').length, q: document.querySelectorAll('#view .empty').length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    letter: [...document.querySelectorAll('#view .m4-msg .hml')].map(e => e.textContent), promo: document.querySelector('#view .m4-gift')?.textContent ?? '', landed: !!document.querySelector('#view .m4-letter.landed'), tk: document.querySelector('#view a.tk-entry')?.getAttribute('href') ?? ''}));
  const SRC = await fs.readFile(new URL('../../../site/atlas/atlas.js', import.meta.url), 'utf8'), MSG = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(SRC) || [, '[]'])[1].replace(/'/g, '"')), PROMO = (/const HELLO_PROMO = '([^']*)';/.exec(SRC) || [])[1];
  await page.evaluate(() => { location.hash = '#/w/005930'; }); await done(); await page.waitForTimeout(500); await shot('p42-next-watch');
  const watch = await page.evaluate(() => ({h1: document.querySelector('#view .wt')?.textContent ?? '', ws: document.querySelector('#view .ws')?.textContent ?? '', ch: document.querySelectorAll('#view .chaps a.cp').length, nx: document.querySelectorAll('#view .nx').length}));
  await page.evaluate(() => { location.hash = '#/shorts'; }); await done(); await page.waitForTimeout(500); await shot('p43-next-shorts');
  const shorts = await page.evaluate(() => document.querySelectorAll('#view .sh').length);
  out.next = {html: hr.status, robots, home: {...home, letter: home.letter.length}, watch, shorts,
    ok: hr.status === 200 && !/noindex/.test(robots) && body.includes('/next/app.js') && home.tabs.join(',') === '홈,쇼츠,편지,구독,나' && home.cards >= 5 && home.chips === 8 && home.q === 0 && home.sw <= home.cw
      && JSON.stringify(home.letter) === JSON.stringify(MSG) && home.promo === PROMO && home.landed && home.tk === (NREADY.has('talk') ? '#/talk' : '/atlas/#/talk')
      && watch.h1 === '삼성전자' && /20거래일 동안 [+−]?\d/.test(watch.ws) && watch.ch === 7 && watch.nx >= 1 && shorts >= 8};
  if (!out.next.ok) out.errors.push('새 아틀란스 첫 화면: ' + JSON.stringify(out.next).slice(0, 400));
});
await step('새 아틀란스 모든 쪽', async () => { // 사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 — 옮긴 쪽(app.js READY)마다 실제 사이트에서 열어 봄(숫자 맞대기는 livenext 의 쪽 검사)
  const done = () => page.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
  const R = [['co', '#/w/005930', '.co-d'], ['past', '#/w/005930/past', '.chaps .cp.now'], ['rivals', '#/w/005930/rivals', '.chaps .cp.now'], ['grow', '#/w/005930/grow', '.chaps .cp.now'], ['range', '#/w/005930/range', '.chaps .cp.now'],
    ['chx', '#/ch/g/' + 'semi', '.chx-d'], ['surge', '#/surge', null], ['surge', '#/surge/20', null], ['cal', '#/cal', null], ['cond', '#/cond', null], ['talk', '#/talk', null], ['up', '#/up', null], ['time', '#/time', null], ['info', '#/info', null], ['today', '#/today', null]].filter(([k]) => NREADY.has(k));
  const got = [];
  await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}); await done();
  for (const [k, hash, sel] of R) {
    await page.evaluate(hh => { location.hash = hh; }, hash); await done(); await page.waitForTimeout(700);
    const g = await page.evaluate(sel => ({url: location.pathname + location.hash, n: (document.querySelector('#view')?.innerText ?? '').trim().length /* 쪽 모듈은 한 칸(div)에 담겨 칸 수가 1 — 글 길이로 봄 */, bad: [...document.querySelectorAll('#view .empty')].map(e => e.textContent).filter(t => /그리지 못했어요/.test(t)).length, sel: sel ? !!document.querySelector('#view ' + sel) : true, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, title: document.title}), sel);
    g.ok = g.url.startsWith('/') && !g.url.includes('/atlas/') && g.n >= 150 && !g.bad && g.sel && g.sw <= g.cw; g.k = k; got.push(g);
    if (got.length <= 6) await shot('p5' + got.length + '-next-' + k);
  }
  out.nextPages = {ready: [...NREADY], pages: got, ok: got.every(g => g.ok)};
  if (!out.nextPages.ok) out.errors.push('새 아틀란스 모든 쪽: ' + JSON.stringify(got.filter(g => !g.ok)).slice(0, 400));
});
await b.close();
out.ok = out.oldFound === 0 && out.errors.length === 0;
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({oldFound: out.oldFound, sameAsRepo: out.sameAsRepo, media: out.media.length, shots: out.shots.length, errors: out.errors}));

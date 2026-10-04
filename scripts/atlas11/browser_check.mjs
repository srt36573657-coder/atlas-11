/**
 * ATLAS 11 · 실제 브라우저 조작 검사 — 판(예측 없음 · 52곳 → 2026-10-06 부터 180곳 · 시대 트렌드 8갈래로 묶음)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8823 --pw <playwright 폴더>
 * 보는 것(PC 1280×800 · 휴대폰 390×844 터치 흉내 — 실제 아이폰 기기 검증 아님)
 *   처음 화면: 갈래 단추 = 판의 갈래 · 첫 갈래만 펼침 · 단추를 누르면 그 갈래로 · 모든 갈래를 펼치면 회사 카드 = 판의 곳 수(갈래마다 판의 차례 그대로) · 카드마다 종가 = 판 종가 ·
 *         우량/트렌드 표시 · 출목표 동그라미 수 = 따로 센 수 · 일정·공시 줄 = 일정표 · 이름을 누르면 회사 화면
 *         바뀔 묶음 미리 보기(바꾸기 전까지만): 이름 칸은 접힌 칸 안 · 열면 새 묶음의 곳 수 · 「새」 수 = 판의 added
 *   회사: 이름 · 종가 · 지난 60거래일 그래프 마지막 날짜 · 지난 1년 숫자 · 일정·공시 모두 · 수급·기사·공시 기록(눌러 열기)
 *   일정: 시장 일정 수 · 회사·업종 일정(같은 일정은 한 줄) 수 · 예고 공시 수 · ★★★ 공시 수
 *   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records) → 처음 화면
 *   앞날 말 없음: 화면 글(공식 이름 data-ident 는 따로)에 전망·예측·확률·오를 쪽·내릴 쪽·목표가·추천 … 이 없어야 · 예측 표시(data-forecast-date) 0
 *   콘솔 오류 0 · 요청 실패 0 · 무결성(판 목록 SHA-256) · 어두운 화면
 *   또렷함(화면 3 × 보기 5): 1 내일·오늘·어제 · 2 흐릿한 말 · 3 단위·기준 빠진 숫자 · 5 대비 · 7 잘린 글자 — 0 이 아니면 실패 · 검사기 자체 시험
 * 결과: reports/atlas11/browser/<시각>/report.json + 화면 사진
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';
import {SCREENS, VIEWS, renderAll} from './clarity_check.mjs';
import {roadOf} from '../../site/app/road.js';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') ?? 'http://localhost:8823', pwDir = arg('--pw') ?? process.cwd();
const {chromium} = createRequire(path.join(pwDir, 'package.json'))('playwright');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(process.cwd(), 'reports/atlas11/browser', stamp); await fs.mkdir(dir, {recursive: true});
const checks = [];
const check = (name, ok, detail = null) => { checks.push({name, ok: Boolean(ok), detail}); console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' · ' + JSON.stringify(detail).slice(0, 260) : '')); };
const get = async p => (await fetch(base + '/' + p)).json();
const manifest = await get('data/atlas11/view/manifest.json'), board = await get('data/atlas11/view/board.json'), agenda = await get('data/atlas11/view/agenda.json');
const won = v => Math.round(v).toLocaleString('ko-KR') + '원';
const kd = d => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00Z').getUTCDay()]})`;
// 우리 글에서 쓰지 않는 말(사장님 명령들) — 공식 이름(data-ident: 일정 이름·공시 제목·기사 제목)은 따로 본다
const OUR_FORBIDDEN = /사라[!.\s]|팔라[!.\s]|추천|목표가|확실|보장|무조건/;
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});

/** 화면 글 두 갈래: 우리 글(식별자 뺌) · 공식 이름(식별자) — 열린 칸만(닫힌 접힘 안은 innerText 에 없음) */
const textsOf = page => page.evaluate(() => {
  const main = document.getElementById('main'), clone = main.cloneNode(true);
  const idents = [...main.querySelectorAll('[data-ident]')].map(e => e.innerText);
  for (const e of clone.querySelectorAll('[data-ident]')) e.remove();
  clone.removeAttribute('id'); document.body.append(clone); const ours = clone.innerText; clone.remove();
  return {ours: ours + '\n' + document.getElementById('top').innerText + '\n' + document.getElementById('bottom').innerText, idents, marks: document.querySelectorAll('[data-forecast-date]').length};
});
async function wordsCheck(page, label) {
  const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? []);
  const badIdent = t.idents.filter(x => PREDICTION_WORDS.test(x));
  check(`${label}: 앞날 말·쓰지 않는 말 없음(우리 글 ${bad.length} · 공식 이름 ${badIdent.length}) · 예측 표시 ${t.marks}`, !bad.length && !badIdent.length && t.marks === 0, bad.length || badIdent.length ? {bad: bad.slice(0, 5), badIdent: badIdent.slice(0, 3)} : null);
}

async function scenario(label, viewport, {mobile = false} = {}) {
  const context = await browser.newContext({viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage();
  const consoleErrors = [], failedRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failedRequests.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); });
  const shot = name => page.screenshot({path: path.join(dir, `${label}-${name}.png`), fullPage: false});

  // ① 처음 화면(52곳 → 2026-10-06 부터 180곳 · 시대 트렌드 8갈래 + 그 밖으로 묶음 · 2026-10-04 18:24 「알아서 해」)
  const N = board.companies.length, H = `처음 화면(${N}곳)`;
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-card .road'); await page.waitForTimeout(400);
  await shot('01-home');
  const top = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), kinds: document.querySelector('.b-kinds')?.innerText.trim() ?? null, late: [...document.querySelectorAll('.b-late')].map(e => e.innerText.trim()), strip: document.querySelector('.mstrip')?.innerText.replace(/\s+/g, ' ').trim(),
    active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
    chips: [...document.querySelectorAll('.g-chip')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), open: [...document.querySelectorAll('details.g-sec')].map(d => d.open), cardsNow: document.querySelectorAll('.b-card').length}));
  check(`${label} ${H}: 제목 「${top.title}」 = 판의 묶음 이름 · 「${top.when}」 · 아래 탭 ${top.tabs.join('·')}(처음 화면 눌림)${board.kinds ? ` · 「${top.kinds}」` : ''}`, top.title === manifest.universeSet.label && top.when === `${kd(board.asOf)} 15:30 종가 · 한국거래소 정규장` && top.tabs.join() === `${N}곳,일정` && top.active === 'home' && (!board.kinds || top.kinds === `우량주 ${board.kinds.quality}곳 · 시대 트렌드 ${board.kinds.trend}곳`), top);
  check(`${label} ${H}: 갈래 단추 ${top.chips.length}개 = 판의 갈래(이름·곳 수) · 처음에는 첫 갈래만 펼침 · 그려진 카드 ${top.cardsNow}장 = 첫 갈래 ${board.groups[0].count}곳`, top.chips.join('|') === board.groups.map(g => `${g.label} ${g.count}곳`).join('|') && top.open.length === board.groups.length && top.open.filter(Boolean).length === 1 && top.open[0] === true && top.cardsNow === board.groups[0].count, {chips: top.chips, open: top.open, cardsNow: top.cardsNow});
  check(`${label} ${H}: 늦은 종가 표시 ${top.late.length}줄 = 판의 늦은 회사 ${board.late.length}곳`, top.late.length === board.late.length && board.late.every((c, i) => top.late[i]?.startsWith(c.name + ': ' + kd(c.date))), top.late);
  check(`${label} ${H}: 시장 띠(코스피·코스닥 · 기준 날짜)`, manifest.market ? manifest.market.items.every(i => top.strip.includes(i.name)) && top.strip.includes(kd(manifest.market.items[0].date) + ' 15:30 KST 종가') : /시장 지수 없음/.test(top.strip), {strip: top.strip});
  // 마지막 갈래 단추를 누르면 그 갈래가 펼쳐지고 그 자리로 간다
  const lastG = board.groups.at(-1);
  await page.locator(`.g-chip[data-group="${lastG.id}"]`).click(); await page.waitForTimeout(400);
  const jumped = await page.evaluate(id => { const d = document.getElementById('g-' + id), r = d.getBoundingClientRect(); return {open: d.open, top: Math.round(r.top), cards: d.querySelectorAll('.b-card').length}; }, lastG.id);
  check(`${label} ${H}: 「${lastG.label}」 단추 → 그 갈래가 펼쳐지고(카드 ${jumped.cards}장 = ${lastG.count}) 화면 위쪽으로 옴`, jumped.open && jumped.cards === lastG.count && jumped.top >= 0 && jumped.top < 200, jumped);
  // 모든 갈래를 펼쳐 카드 전부를 판과 맞대어 본다(갈래마다 판의 codes 차례 그대로)
  await page.evaluate(() => { for (const d of document.querySelectorAll('details.g-sec')) d.open = true; }); await page.waitForTimeout(600);
  const home = await page.evaluate(() => ({sections: [...document.querySelectorAll('details.g-sec')].map(d => ({id: d.dataset.group, codes: [...d.querySelectorAll('.b-card')].map(c => c.dataset.code)})),
    cards: [...document.querySelectorAll('.b-card')].map(c => ({code: c.dataset.code, name: c.querySelector('.b-name')?.textContent.trim(), kind: c.querySelector('.b-kind')?.textContent.trim() ?? null, price: c.querySelector('.b-close')?.textContent.trim(), date: c.querySelector('.b-date')?.textContent.trim(), /* 화면 밖 카드는 그리기를 미루므로(content-visibility) innerText 대신 textContent */ beads: c.querySelectorAll('.road .bead').length, up: c.querySelectorAll('.road .bead.up').length, ev: c.querySelectorAll('.ag-ev .ag-li').length, ds: c.querySelectorAll('.ag-ds .ag-li').length, href: c.querySelector('.b-name-row')?.getAttribute('href')}))}));
  const sectionsOk = home.sections.map(x => `${x.id}:${x.codes.join(',')}`).join('|') === board.groups.map(g => `${g.id}:${g.codes.join(',')}`).join('|');
  const byCode = new Map(home.cards.map(c => [c.code, c])), KIND = {quality: '우량', trend: '트렌드'};
  const mism = board.companies.filter(c => { const hc = byCode.get(c.code); const road = roadOf(c.c); return !hc || hc.name !== c.name || hc.kind !== (KIND[c.kind] ?? null) || hc.price !== won(c.close) || hc.date !== `${kd(c.date)} 15:30 종가` || hc.beads !== road.cells.length || hc.up !== road.all.up || hc.href !== '#/stock/' + c.code; }).map(c => c.code);
  check(`${label} ${H}: 카드 ${home.cards.length}장 · 갈래마다 판의 차례 그대로 · 이름·우량/트렌드 표시·종가·날짜·출목표 동그라미 수(빨강 포함)·회사 화면 링크가 판과 같음`, home.cards.length === N && byCode.size === N && sectionsOk && !mism.length, {mism: mism.slice(0, 5), sectionsOk});
  const agMis = board.companies.filter(c => { const e = agenda.byCode[c.code], hc = byCode.get(c.code); return hc?.ev !== Math.min(2, e.upcoming.length) || hc?.ds !== Math.min(2, e.disclosures.length); }).map(c => c.code);
  check(`${label} ${H}: 카드마다 일정·공시 줄 수(각 2줄까지) = 일정표`, !agMis.length, {agMis: agMis.slice(0, 5)});
  if (manifest.universeNext) {
    const n = manifest.universeNext, total = n.companies.length;
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150);
    const nx = await page.evaluate(() => { const box = document.querySelector('.nx'); const chips = box?.querySelector('.nx-chips'); return {h: box?.querySelector('.nx-h')?.innerText.trim(), when: box?.querySelector('.nx-when')?.innerText.trim(), lines: [...(box?.querySelectorAll('.nx-when') ?? [])].map(e => e.innerText.trim()), closed: chips ? !chips.closest('details').open : null, first: box ? box.getBoundingClientRect().top < innerHeight : false}; });
    await page.locator('.nx details summary', {hasText: `새 ${total}곳 이름 보기`}).click(); await page.waitForTimeout(150);
    const chips = await page.evaluate(() => ({n: document.querySelectorAll('.nx-chip').length, news: document.querySelectorAll('.nx-chip .nx-new').length, names: [...document.querySelectorAll('.nx-chip .nx-n')].map(e => e.innerText.trim())}));
    check(`${label} ${H}: 바뀔 묶음 미리 보기 「${nx.h}」 · ${kd(n.from)} 16:00 · 이름 칸은 접혀 있다가 열면 ${chips.n}곳 = ${total} · 「새」 ${chips.news} = ${n.added}${n.kinds ? ` · 우량 ${n.kinds.quality} · 트렌드 ${n.kinds.trend}` : ''}`, nx.first && nx.h === `${n.label}으로 바뀝니다` && nx.when.startsWith(`${kd(n.from)} 16:00 매일 실행 때 바뀝니다`) && nx.closed === true && chips.n === total && chips.news === n.added && chips.names.join() === n.companies.map(c => c.name).join() && (!n.kinds || nx.lines.includes(`우량주 ${n.kinds.quality}곳 · 시대 트렌드 ${n.kinds.trend}곳`)), {nx, chips: {n: chips.n, news: chips.news}});
  }
  await wordsCheck(page, `${label} ${H}(갈래 모두 펼침)`);
  // 이름 누르기(휴대폰은 터치) → 회사 화면
  const pick = board.companies[1];
  const link = page.locator(`.b-card[data-code="${pick.code}"] .b-name-row`); await link.scrollIntoViewIfNeeded();
  if (mobile) await link.tap(); else await link.click();
  await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
  check(`${label} ${H} → ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pick.code}`, (await page.evaluate(() => location.hash)) === '#/stock/' + pick.code && (await page.locator('.b-title').innerText()).trim() === pick.name);

  // ② 회사 화면 세 곳(처음 · 늦은 종가 회사가 있으면 그 회사 · 마지막)
  const picks = [board.companies[0], ...board.late.map(l => board.companies.find(c => c.code === l.code)), board.companies.at(-1)].filter(Boolean);
  for (const c of picks) {
    const s = await get('data/atlas11/view/stocks/' + c.code + '.json'), e = agenda.byCode[c.code];
    await page.goto(base + '/#/stock/' + c.code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    if (c === picks[0]) await shot('02-company');
    const r = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), price: document.querySelector('.b-price.big .b-close')?.innerText.trim(), date: document.querySelector('.b-price.big .b-date')?.innerText.trim(), ticks: [...document.querySelectorAll('.c-chart .lc-tick')].map(t => t.textContent), path: document.querySelector('.c-chart .lc-line')?.getAttribute('d')?.split(/[ML]/).filter(Boolean).length ?? 0,
      info: [...document.querySelectorAll('.c-info dd')].map(d => d.innerText.trim()), ev: document.querySelectorAll('.ag-ev .ag-li').length, ds: document.querySelectorAll('.ag-ds .ag-li').length, beads: document.querySelectorAll('.road .bead').length}));
    const wantTick = `${s.closes60.at(-1).date.slice(5, 7)}/${s.closes60.at(-1).date.slice(8, 10)}`;
    check(`${label} 회사 ${c.name}: 이름 · 종가 ${r.price} · 「${r.date}」 · 지난 ${s.closes60.length}거래일 선(점 ${r.path}) · 마지막 눈금 ${wantTick} · 1년 최고·최저 · 출목표 ${r.beads}개 · 일정 ${r.ev}·공시 ${r.ds}줄 = 일정표`,
      r.title === c.name && r.price === won(c.close) && r.date === `${kd(c.date)} 15:30 종가` && r.path === s.closes60.length && r.ticks.includes(wantTick) && r.info[0] === won(c.info.high52) && r.info[1] === won(c.info.low52) && r.beads === roadOf(c.c).cells.length && r.ev === e.upcoming.length && r.ds === e.disclosures.length, r);
    await page.locator('.c-ctx summary').click(); await page.waitForTimeout(150);
    const ctx = await page.evaluate(() => ({news: document.querySelectorAll('.c-ctx .c-news')[0]?.querySelectorAll('li').length ?? 0, flows: document.querySelectorAll('.c-ctx tbody tr').length}));
    check(`${label} 회사 ${c.name}: 수급·기사·공시 기록 열림 · 기사 ${ctx.news}건 = ${s.context?.news.length ?? 0} · 수급 ${ctx.flows}거래일 = ${s.context?.flows.length ?? 0}`, ctx.news === (s.context?.news.length ?? 0) && ctx.flows === (s.context?.flows.length ?? 0), ctx);
    await wordsCheck(page, `${label} 회사 ${c.name}(기록 열림)`);
  }

  // ③ 일정
  await page.goto(base + '/#/agenda', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-box'); await page.waitForTimeout(300);
  await shot('03-agenda');
  const ev = new Set(Object.values(agenda.byCode).flatMap(x => x.upcoming.map(u => u.id))), notices = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => d.notice)).length, big = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => !d.notice && d.level === 3)).length;
  const a = await page.evaluate(() => { const box = [...document.querySelectorAll('.b-box')]; const byLabel = l => box.find(b => b.getAttribute('aria-label') === l); return {market: byLabel('시장 전체 일정')?.querySelectorAll('.ag-li').length, company: byLabel('회사·업종 일정')?.querySelectorAll('.ag-li').length, notices: byLabel('예고 공시')?.querySelectorAll('.ag-li').length, big: byLabel('아주 중요한 공시')?.querySelectorAll('.ag-li').length, days: document.querySelectorAll('.a-day').length, active: document.querySelector('.bottom-link.active')?.dataset.route}; });
  check(`${label} 일정: 시장 ${a.market}건 · 회사·업종 ${a.company}건(${a.days}날) · 예고 공시 ${a.notices}건 · ★★★ 공시 ${a.big}건 = 일정표 · 아래 탭 「일정」 눌림`, a.market === agenda.market.length && a.company === ev.size && a.notices === notices && a.big === big && a.active === 'agenda', {a, want: {market: agenda.market.length, company: ev.size, notices, big}});
  await wordsCheck(page, `${label} 일정`);

  // ④ 지운 화면의 옛 주소 → 처음 화면
  for (const old of ['#/forecast', '#/up', '#/down', '#/scores', '#/race', '#/evolution', '#/status', '#/records', '#/game']) {
    await page.goto(base + '/' + old, {waitUntil: 'networkidle'}); await page.waitForSelector('.b-card'); await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({hash: location.hash, cards: document.querySelectorAll('.b-card').length, title: document.querySelector('.b-title')?.innerText.trim()}));
    check(`${label} 옛 주소 ${old} → 처음 화면(#/ · 「${r.title}」 · 첫 갈래 카드 ${r.cards}장)`, r.hash === '#/' && r.title === manifest.universeSet.label && r.cards === board.groups[0].count, r);
  }
  // ⑤ 무결성 · 글씨 단추
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-card'); await page.waitForTimeout(300);
  const integ = await page.evaluate(() => document.querySelector('.b-foot .integrity-text')?.innerText);
  check(`${label} 무결성: 「${integ}」`, /모두 판 목록의 SHA-256 과 같음/.test(integ ?? ''), {integ});
  await page.locator('#font-btn').click(); await page.waitForTimeout(200);
  const fs1 = await page.evaluate(() => [document.documentElement.style.fontSize, document.documentElement.dataset.fontStep]);
  check(`${label} 글씨 단추: 125% 로 커짐`, fs1[0] === '125%' && fs1[1] === '1', {fs1});
  check(`${label} 콘솔 오류 0 · 요청 실패 0`, consoleErrors.length === 0 && failedRequests.length === 0, {consoleErrors: consoleErrors.slice(0, 3), failedRequests: failedRequests.slice(0, 3)});
  await context.close();
}

async function darkCheck() {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, colorScheme: 'dark', locale: 'ko-KR'});
  const page = await context.newPage();
  for (const [hash, wait, name] of [['#/', '.b-card .road', 'home'], ['#/stock/' + board.companies[0].code, '.c-chart svg.lc', 'company'], ['#/agenda', '.b-box', 'agenda']]) {
    await page.goto(base + '/' + hash, {waitUntil: 'networkidle'}); await page.waitForSelector(wait); await page.waitForTimeout(300);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.screenshot({path: path.join(dir, `mobile-dark-${name}.png`)});
    check(`어두운 화면 ${name}: 바탕이 검정(${bg})`, bg === 'rgb(0, 0, 0)', {bg});
  }
  await context.close();
}

async function clarityCheck() {
  const table = {};
  for (const v of VIEWS) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage(); table[v.id] = {};
    for (const s of SCREENS) {
      await page.goto(base + '/' + s.hash, {waitUntil: 'networkidle'}); await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => {}); await page.waitForTimeout(500); await renderAll(page);
      const m = await page.evaluate(measureClarity);
      table[v.id][s.id] = {relDays: m.relDays, vague: m.vague, bareNumbers: m.bareNumbers, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors, truncated: m.truncated, formatDates: m.formatDates};
      // 휴대폰 흉내에서는 글이 넘치면 화면(레이아웃) 폭 자체가 넓어져 「잘린 글자」 재기가 못 본다 — 화면 폭이 기기 폭 그대로인지 따로 본다
      const vw = await page.evaluate(() => ({inner: innerWidth, visual: Math.round(visualViewport.width), scroll: document.documentElement.scrollWidth}));
      check(`화면 폭 ${v.id} ${s.id}: ${vw.inner}px = 기기 폭 ${v.viewport.width}px(넘친 칸이 화면을 넓히지 않음)`, vw.inner === v.viewport.width && vw.scroll <= v.viewport.width, vw);
      check(`잘린 글자 ${v.id} ${s.id}: ${m.truncated}`, m.truncated === 0, m.truncated ? {truncated: m.samples.truncated, pageOverflowX: m.pageOverflowX} : undefined);
      check(`또렷함 ${v.id} ${s.id}: 1 내일·오늘·어제 ${m.relDays} · 2 흐릿한 말 ${m.vague} · 3 단위·기준 빠진 숫자 ${m.bareNumbers} · 5 대비 모자람 ${m.lowContrast} · (참고) 날짜 모양 ${m.formatDates}`, m.relDays + m.vague + m.bareNumbers + m.lowContrast === 0, m.relDays + m.vague + m.bareNumbers + m.lowContrast ? {rel: m.samples.relDays, vague: m.samples.vague, bare: m.samples.bareNumbers, contrast: m.samples.lowContrast} : null);
    }
    await ctx.close();
  }
  // 검사기 자체 시험: 흐릿한 말 하나 · 단위 없는 숫자 하나 · 잘린 이름 하나 · 앞날 말 하나를 일부러 넣으면 늘어야 한다
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const page = await ctx.newPage();
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-card .road'); await page.waitForTimeout(500); await renderAll(page);
  const before = await page.evaluate(measureClarity);
  await page.evaluate(() => { const box = document.createElement('section'); box.className = 'b-box'; box.innerHTML = '<p>내일 42 정도.</p><p>곧 많이 오릅니다.</p>'; document.getElementById('main').prepend(box); });
  const plant = await page.evaluate(measureClarity);
  const delta = {relDays: plant.relDays - before.relDays, vague: plant.vague - before.vague, bareNumbers: plant.bareNumbers - before.bareNumbers};
  check('검사기 자체 시험: 「내일 42 정도.」「곧 많이 오릅니다.」를 넣으면 1·2·3번이 모두 1 이상 늘어난다', delta.relDays >= 1 && delta.vague >= 1 && delta.bareNumbers >= 1, delta);
  await page.evaluate(() => { const name = document.createElement('div'); name.textContent = '한화에어로스페이스'; Object.assign(name.style, {width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}); document.getElementById('main').prepend(name); });
  const cut = await page.evaluate(measureClarity);
  check('검사기 자체 시험(7번): 「…」로 잘린 회사 이름 하나를 넣으면 잘린 글자가 1 늘어난다', cut.truncated - plant.truncated === 1, {before: plant.truncated, after: cut.truncated});
  await page.evaluate(() => { const p = document.createElement('p'); p.textContent = '10월 6일(화) 전망 · 오를 쪽'; document.getElementById('main').prepend(p); });
  const t = await textsOf(page);
  check('검사기 자체 시험(앞날 말): 화면에 「전망 · 오를 쪽」을 넣으면 잡는다', PREDICTION_WORDS.test(t.ours));
  await ctx.close();
  return table;
}

let clarity = null;
try {
  await scenario('pc', {width: 1280, height: 800});
  await scenario('mobile', {width: 390, height: 844}, {mobile: true});
  await darkCheck();
  clarity = await clarityCheck();
} finally { await browser.close(); }
// 배포 묶음: 게임 쪽은 없고 옛 주소는 처음 화면으로 돌린다(넷리파이 _redirects)
try { const red = await fs.readFile(path.join(process.cwd(), 'dist/_redirects'), 'utf8'); let game = true; try { await fs.access(path.join(process.cwd(), 'dist/game')); } catch { game = false; } check(`배포 묶음: game/ 폴더 없음 · _redirects 에 /game/* → / (${red.trim().split('\n').length}줄)`, !game && /^\/game\/\*\s+\/\s+302$/m.test(red)); } catch (e) { check('배포 묶음 dist/ 를 읽지 못함', false, {e: e.message}); }
const summary = {schema: 'atlas11-browser-check-3', at: new Date().toISOString(), base, prediction: 'off', boardId: manifest.boardId, asOf: manifest.asOf, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (터치 흉내 — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;

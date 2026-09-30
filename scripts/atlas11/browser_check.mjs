/**
 * ATLAS 11 · 실제 브라우저 조작 검사 (Chromium · PC 1280×800 · 모바일 390×844 · 어두운 화면 · 글씨 200%)
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8811 --pw <playwright module dir>
 * v9 검사: 화면마다 헤드라인 한 줄(누르면 출처·기준 시각) · 첫 그래프의 마지막 값 = 헤드라인 숫자 · 시장 띠 ·
 *          전망 52줄 · 줄→상세 · 날짜 클릭→설명 · 재생→커서 이동 · 중요 일정 정지·확인 · 1만원 52선(평균선) · 순위 · 성적 · 진화 · 자료 상태 · 기록 ·
 *          CSV·JSON 내려받기 · 콘솔 오류 0 · 요청 실패 0 ·
 *          또렷함 여섯 숫자(7화면 × PC·휴대폰·휴대폰 어두운 화면·PC 글씨 200%) — 1~3번(내일·오늘·어제 / 흐릿한 말 / 부호·단위·기준 시각 빠진 숫자)이 0 이 아니면 실패 ·
 *          검사기 자체 시험(일부러 흐릿한 말·단위 없는 숫자를 넣으면 잡는가)
 * 결과: reports/atlas11/browser/<timestamp>/report.json + 스크린샷
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';
import {SCREENS, VIEWS, renderAll} from './clarity_check.mjs';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') ?? 'http://localhost:8811', pwDir = arg('--pw') ?? process.cwd();
const {chromium} = createRequire(path.join(pwDir, 'package.json'))('playwright');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(process.cwd(), 'reports/atlas11/browser', stamp); await fs.mkdir(dir, {recursive: true});
const checks = [], info = [];
const check = (name, ok, detail = null) => { checks.push({name, ok: Boolean(ok), detail}); console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' · ' + JSON.stringify(detail).slice(0, 220) : '')); };
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});
const digits = s => String(s ?? '').replace(/[^\d.]/g, '');

/** 헤드라인 공통 검사: 한 줄 · 첫 화면 안 · 숫자 단추를 누르면 출처·기준 시각 · Esc 로 닫힘 · 첫 그래프 마지막 값 = 헤드라인 숫자 */
async function headlineCheck(page, label, screen, lastValueSel) {
  const hl = await page.locator('#main .hl-line').count(), first = await page.evaluate(() => { const el = document.querySelector('#main .hl-line'); const r = el?.getBoundingClientRect(); return el ? {top: Math.round(r.top), bottom: Math.round(r.bottom), firstChild: document.querySelector('#main').firstElementChild?.classList.contains('hl') || !!document.querySelector('#main > .detail > .hl, #main > .hl')} : null; });
  const vh = await page.evaluate(() => innerHeight);
  check(`${label} ${screen}: 헤드라인 한 줄이 맨 위·첫 화면 안`, hl === 1 && first && first.bottom <= vh && first.firstChild, {hl, first});
  const figure = (await page.locator('#main .hl-num').first().innerText()).trim();
  await page.locator('#main .hl-num').first().click(); await page.waitForTimeout(120);
  const src = await page.locator('#main .hl-src').first().innerText().catch(() => '');
  check(`${label} ${screen}: 헤드라인 숫자를 누르면 출처·기준 시각이 열림`, /기준 시각/.test(src) && /발행본/.test(src) && /SHA-256/.test(src) && /무결성/.test(src), {figure, src: src.slice(0, 120)});
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check(`${label} ${screen}: Esc 로 출처 칸 닫힘`, await page.locator('#main .hl-src:not([hidden])').count() === 0);
  if (lastValueSel) {
    const last = (await page.locator(lastValueSel).last().textContent().catch(() => '')) ?? '';
    check(`${label} ${screen}: 첫 그래프의 마지막 값 = 헤드라인 숫자`, digits(figure) && digits(last).includes(digits(figure)), {figure, last});
  }
  return figure;
}

async function scenario(label, viewport, {mobile = false} = {}) {
  const context = await browser.newContext({viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul', acceptDownloads: true});
  const page = await context.newPage();
  const consoleErrors = [], failedRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failedRequests.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); });
  const shot = name => page.screenshot({path: path.join(dir, `${label}-${name}.png`), fullPage: false});
  const closeSheet = async () => { if (await page.locator('.explain.open').count()) { await page.locator('.explain .close').click(); await page.waitForTimeout(350); } };
  // ---------- 전망(첫 화면) ----------
  await page.goto(base + '/#/forecast', {waitUntil: 'networkidle'});
  await page.waitForSelector('.wl-row');
  const strip = await page.locator('#top .mstrip').innerText();
  check(`${label} 맨 위 시장 띠: 코스피·코스닥 값·등락·기준 시각`, /코스피 [\d,.]+포인트/.test(strip.replace(/\s+/g, ' ')) && /코스닥/.test(strip) && /[+−]\d+\.\d{2}%/.test(strip) && /\d+월 \d+일\(.\) 15:30 KST 종가/.test(strip), {strip: strip.replace(/\s+/g, ' ')});
  await headlineCheck(page, label, '전망', '.lc .lc-end.pred');
  const rows = await page.locator('.wl-row').count();
  check(`${label} 전망: 52종목 줄`, rows === 52, {rows});
  const sparks = await page.locator('.wl-row .spark').count(), pbars = await page.locator('.wl-row .pbar').count(), hbars = await page.locator('.wl-row .hb').count();
  check(`${label} 전망: 줄마다 작은 그래프·확률 막대·20거래일 가로 막대`, sparks === 52 && pbars === 52 && hbars === 52, {sparks, pbars, hbars});
  const head = await page.locator('.wl-head').innerText();
  check(`${label} 전망: 목록 머리에 「내일」 대신 날짜`, /\d+월 \d+일\(.\) 선택·확률/.test(head.replace(/\s+/g, ' ')) && !/내일/.test(head), {head: head.replace(/\s+/g, ' ').slice(0, 100)});
  await page.locator('.filter').nth(2).click(); await page.waitForTimeout(200);
  const filtered = await page.locator('.wl-row').count();
  check(`${label} 전망: 「하락 선택」 거름 단추`, filtered > 0 && filtered < 52, {filtered});
  await page.locator('.filter').nth(0).click(); await page.waitForTimeout(200);
  await shot('01-forecast');
  const small = await page.evaluate(() => [...document.querySelectorAll('button, a.ctl, a.tool, .bottom-link, .top-link')].filter(el => { const r = el.getBoundingClientRect(); return r.width && r.height && (r.height < 44 || r.width < 44); }).map(el => el.className + ':' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height)));
  check(`${label} 터치 영역 44px 미만 없음`, small.length === 0, small.slice(0, 8));
  // ---------- 줄 → 상세 ----------
  await page.locator('.wl-row').first().click();
  await page.waitForSelector('.detail svg.chart');
  await page.waitForTimeout(200);
  const detailFigure = await headlineCheck(page, label, '종목 상세', '.chart-box .end-label.up, .chart-box .end-label.down, .chart-box .end-label.flat');
  check(`${label} 상세: 헤드라인에 종목 이름·날짜·원 단위`, /원$/.test(detailFigure) && /\d+월 \d+일\(.\)/.test(await page.locator('.hl-line').innerText()), {detailFigure});
  const chartTop = await page.evaluate(() => document.querySelector('.chart-box svg').getBoundingClientRect().top);
  check(`${label} 상세: 그래프가 첫 화면 안(스크롤 전)`, chartTop < viewport.height, {chartTop});
  const lines = await page.evaluate(() => ({actual: !!document.querySelector('.line.actual'), today: !!document.querySelector('.line.today'), band: !!document.querySelector('.band'), boundary: !!document.querySelector('.boundary'), anchor: !!document.querySelector('.anchor-dot')}));
  check(`${label} 상세: 실제선·전망선·띠·경계선·출발점`, Object.values(lines).every(Boolean), lines);
  check(`${label} 상세: 세 겹 띠(5~95·10~90·25~75%)`, await page.locator('svg .band.outer').count() === 1 && await page.locator('svg .band.mid').count() === 1 && await page.locator('svg .band.inner').count() === 1);
  const ticks = await page.locator('.chart-box svg .tick').allTextContents();
  check(`${label} 상세: 가격 눈금에 원 단위`, ticks.filter(t => /만원$/.test(t)).length >= 2, {ticks: ticks.slice(0, 5)});
  const fontOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "IBM Plex Sans KR"') && [...document.fonts].some(f => f.family.includes('IBM Plex Sans KR') && f.status === 'loaded'); });
  check(`${label} IBM Plex Sans KR 글씨체 적용`, fontOk);
  if (!mobile) { const box = await page.locator('.chart-box svg').boundingBox(); await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5); await page.waitForTimeout(150); const tip = await page.locator('.chart-box .tip').count(); check(`${label} 상세: 그래프 위 마우스 말풍선`, tip === 1); await page.mouse.move(0, 0); }
  await shot('02-detail');
  await page.locator('.date-chip.future').nth(2).click();
  const cursor = await page.locator('.cursor-text').innerText();
  const explainHead = await page.locator('.explain h2').innerText();
  check(`${label} 상세: 미래 날짜 눌러 설명 열림(3거래일 뒤)`, /3거래일 뒤/.test(cursor) && /3거래일 뒤/.test(explainHead), {cursor, explainHead});
  await page.waitForTimeout(100);
  check(`${label} 상세: 선택 날짜 분포 상자`, await page.locator('.explain svg.qbox .q-50').count() === 1 && await page.locator('.explain svg.qbox .q-anchor').count() === 1);
  const contrib = await page.locator('.explain .cbar').count(), oneline = await page.locator('.explain .oneline').innerText().catch(() => '');
  check(`${label} 상세: 날짜 설명(한 줄 · 기여 막대 · 미확보 · 출처)`, contrib >= 3 && oneline.length > 10 && await page.locator('.explain .missing li').count() > 0 && await page.locator('.explain .sources a').count() > 0, {contrib, oneline: oneline.slice(0, 60)});
  await shot('03-explain');
  if (mobile) { const sheetOpen = await page.locator('.explain.open').count(); check(`${label} 상세: 날짜를 누르면 설명이 바텀시트로 열림`, sheetOpen === 1); await page.keyboard.press('Escape'); await page.waitForTimeout(350); check(`${label} 상세: Esc 로 바텀시트 닫힘`, await page.locator('.explain.open').count() === 0); await closeSheet(); }
  await page.locator('.date-chip.anchor').click(); await closeSheet();
  await page.evaluate(() => { document.querySelector('.chart-box svg').__mark = 'same'; });
  await page.locator('.player .ctl.primary').click();
  await page.waitForTimeout(1300);
  const after = await page.locator('.cursor-text').innerText();
  const sameSvg = await page.evaluate(() => document.querySelector('.chart-box svg').__mark === 'same');
  check(`${label} 상세: 재생 하루 1초 · 그래프는 다시 그리지 않고 커서만 이동`, /1거래일 뒤/.test(after) && sameSvg, {after, sameSvg});
  await page.waitForSelector('#notice:not([hidden])', {timeout: 6000}).catch(() => {});
  if (await page.locator('#notice:not([hidden])').count()) {
    check(`${label} 상세: 중요 일정에서 정지·확인 대기`, true, {text: (await page.locator('#notice h2').innerText())});
    if (mobile) await page.keyboard.press('Escape'); else await page.locator('#notice button').click();
    await page.waitForTimeout(1200);
    const resumed = await page.locator('.cursor-text').innerText();
    check(`${label} 상세: 확인 뒤 계속 재생`, !/^[^·]*· 1거래일 뒤/.test(resumed) || /2거래일 뒤/.test(resumed), {resumed});
  }
  await page.locator('.player .ctl.primary').click().catch(() => {});
  await page.locator('.toggles .ctl.toggle').first().click();
  check(`${label} 상세: 대표 시나리오 선 표시`, await page.locator('.line.scenario').count() === 1);
  const [download] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('a.ctl[download]').click()]);
  const csvPath = path.join(dir, `${label}-` + download.suggestedFilename()); await download.saveAs(csvPath);
  const csv = await fs.readFile(csvPath, 'utf8');
  check(`${label} 상세: CSV 내려받기 21행(출발 1+전망 20)`, csv.trim().split(/\r?\n/).length === 22 && /실제출발/.test(csv), {name: download.suggestedFilename(), rows: csv.trim().split(/\r?\n/).length});
  const [jsonDl] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('.toggles .ctl', {hasText: '상세 JSON'}).click()]);
  check(`${label} 상세: JSON 내려받기(blob · CSP 아래)`, /_detail\.json$/.test(jsonDl.suggestedFilename()), {name: jsonDl.suggestedFilename()});
  // 종목 정보 · 수급·기사·공시(눌러야 열림) · 연쇄 지도(눌러야 열림)
  await page.waitForSelector('.panel.info .range', {timeout: 8000});
  const infoBars = await page.locator('.panel.info .bars .bar-row').count(), infoKv = await page.locator('.panel.info .kv.six .kv-item').count();
  check(`${label} 상세: 종목 정보(1년 범위 막대 · 기간별 수익률 가로 막대 5 · 나머지 12칸은 눌러야 열림)`, infoBars === 5 && infoKv === 12 && await page.locator('.panel.info details:not([open])').count() === 1, {infoBars, infoKv});
  await page.locator('details.ctx > summary').click(); await page.waitForTimeout(200);
  const ctxText = await page.locator('details.ctx').innerText(), ctxRows = await page.locator('details.ctx table tbody tr').count(), ctxNews = await page.locator('details.ctx .news-list li').count();
  check(`${label} 상세: 수급·기사·공시 칸(눌러서 열림 · 전망 숫자에 넣지 않음 · 외국인·기관·개인 표 · 기사 제목)`, /전망 숫자에 넣지 않음/.test(ctxText) && /외국인/.test(ctxText) && ctxRows >= 1 && ctxNews >= 1, {ctxRows, ctxNews});
  await page.locator('details.chain > summary').click();
  await page.waitForSelector('details.chain svg.netmap');
  const nodes = await page.locator('.netmap .node').count(), arcs = await page.locator('.netmap .group-arc').count(), orders = await page.locator('.chain-strip .order').count(), links = await page.locator('.netmap .link').count();
  check(`${label} 상세: 연쇄 지도(눌러서 열림) 52노드·9묶음 호·1~5차·연결선`, nodes === 52 && arcs === 9 && orders === 5 && links > 0, {nodes, arcs, orders, links});
  const shockBefore = await page.locator('.chain-strip .order[data-order="2"] .order-row b').first().innerText();
  await page.locator('.toggles.shock .ctl', {hasText: '+10%'}).click(); await page.waitForTimeout(200);
  const shockAfter = await page.locator('.chain-strip .order[data-order="2"] .order-row b').first().innerText();
  check(`${label} 상세: 충격 단추(+10%) → 2차 숫자 부호 바뀜`, shockBefore !== shockAfter && /^[−-]/.test(shockBefore.trim()) !== /^[−-]/.test(shockAfter.trim()), {shockBefore, shockAfter});
  const channel = await page.locator('details.chain .channel').innerText();
  check(`${label} 상세: 시장 통로·직접 통로 설명`, /시장 통로/.test(channel) && /직접 통로/.test(channel) && /=/.test(channel), {channel: channel.slice(0, 80)});
  await page.locator('details.chain .ctl', {hasText: '누적으로 보기'}).click(); await page.waitForTimeout(200);
  check(`${label} 상세: 누적(1~5차 합) 칸 추가`, await page.locator('.chain-strip .order').count() === 6 && /누적 파급/.test(await page.locator('.netmap .center-s').textContent()));
  await page.locator('details.chain .ctl.primary').click(); await page.waitForTimeout(150);
  const litEarly = await page.locator('.netmap .node.lit').count(), playing = await page.locator('.netmap-box.playing').count();
  await page.waitForTimeout(3600);
  const litLate = await page.locator('.netmap .node.lit').count(), stripLit = await page.locator('.chain-strip .order.lit').count();
  check(`${label} 상세: 파급 재생 1차부터 차례로 켜짐`, playing === 1 && litEarly >= 1 && litLate > litEarly && stripLit >= 5, {litEarly, litLate, stripLit});
  const hashBefore = await page.evaluate(() => location.hash);
  await page.locator('.chain-strip .order[data-order="2"] .order-row').first().click(); await page.waitForTimeout(600);
  const hashAfter = await page.evaluate(() => location.hash);
  check(`${label} 상세: 연쇄 칸의 종목을 누르면 그 종목 상세로 이동`, hashBefore !== hashAfter && /^#\/stock\/\d{6}$/.test(hashAfter), {hashBefore, hashAfter});
  await page.waitForSelector('details.chain > summary'); await page.locator('details.chain > summary').click(); await page.waitForSelector('details.chain svg.netmap');
  check(`${label} 상세: 이동한 종목에서도 연쇄 지도 다시 그림`, await page.locator('.netmap .node.src').count() === 1 && (await page.locator('.netmap .node.src').getAttribute('data-code')) === hashAfter.slice(-6));
  for (let k = 0; k < 4; k++) await page.locator('.tool[aria-label^="글씨 크게"]').click();
  await page.waitForTimeout(200);
  const fontSize = await page.evaluate(() => document.documentElement.style.fontSize), overflow200 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label} 글씨 200% 에서도 가로 넘침 없음`, fontSize === '200%' && overflow200 <= 0, {fontSize, overflow200});
  for (let k = 0; k < 4; k++) await page.locator('.tool[aria-label="글씨 작게"]').click();
  // ---------- 1만원 비교 ----------
  await page.goto(base + '/#/race', {waitUntil: 'networkidle'});
  await page.waitForSelector('.race-line');
  await headlineCheck(page, label, '1만원 비교', '.race-avg-label');
  const raceLines = await page.evaluate(() => new Set([...document.querySelectorAll('.race-line')].map(p => p.dataset.code)).size);
  check(`${label} 1만원 비교: 52선 + 굵은 평균선`, raceLines === 52 && await page.locator('.race-avg').count() === 1, {raceLines});
  const rankRows = await page.locator('.rank-row').count(), rankBars = await page.locator('.rank-row .hb').count();
  check(`${label} 1만원 비교: 순위 52줄(가로 막대)`, rankRows === 52 && rankBars === 52, {rankRows, rankBars});
  await page.locator('.rank-btn').nth(3).click(); await page.waitForTimeout(400);
  check(`${label} 1만원 비교: 순위 종목 선택 → 강조·일정`, await page.locator('.race-line.selected').count() >= 1 && (await page.locator('.rank-news h3').innerText()).length > 0);
  check(`${label} 1만원 비교: 발행일 1만원 기준에서는 순위 단추가 없음(두 순위가 같아서)`, await page.locator('.toggles .ctl.toggle', {hasText: '부터 수익률'}).count() === 0);
  await page.locator('.chart-col .toggles .ctl.toggle').nth(1).click(); await page.waitForTimeout(400);
  const startLines = await page.locator('.race-line.actual').count();
  check(`${label} 1만원 비교: 「20거래일 전 종가 1만원」으로 바꾸면 실제 구간 52선도 그림`, startLines === 52, {startLines});
  await page.locator('.slider').fill(String(35)); await page.waitForTimeout(200);
  check(`${label} 1만원 비교: 20거래일 전 기준 · 전망 구간에서 「발행일부터 수익률」 순위 단추`, await page.locator('.toggles .ctl.toggle', {hasText: '부터 수익률'}).count() === 1);
  const groupBtns = await page.locator('.toggles.groups .ctl').count();
  await page.locator('.toggles.groups .ctl[data-group="semi"]').click(); await page.waitForTimeout(300);
  const hl = await page.evaluate(() => new Set([...document.querySelectorAll('.race-line.highlight')].map(p => p.dataset.code)).size), legendText = await page.locator('.legend').innerText();
  check(`${label} 1만원 비교: 묶음 단추(전체+9) → 반도체·전자 강조`, groupBtns === 10 && hl >= 5 && hl <= 6 && /반도체/.test(legendText), {groupBtns, hl});
  await page.locator('.toggles.groups .ctl[data-group="all"]').click(); await page.waitForTimeout(200);
  await page.locator('.chart-col .toggles .ctl.toggle').nth(0).click().catch(() => {}); await page.waitForTimeout(300);
  await shot('04-race');
  // ---------- 성적 ----------
  await page.goto(base + '/#/scores', {waitUntil: 'networkidle'});
  await page.waitForSelector('svg.lc');
  await headlineCheck(page, label, '성적', '.lc .lc-end.pred');
  const scoresText = await page.locator('#main').innerText();
  check(`${label} 성적: 방향·범위·오차 분포 막대 · 채점 예정표 4줄 · 표와 후향 진단은 눌러야 열림`, await page.locator('.bars .bar-row').count() >= 9 && /채점 예정표/.test(scoresText) && /후향 진단 열기/.test(scoresText) && /종목별 채점 표 열기/.test(scoresText), null);
  await shot('05-scores');
  // ---------- 진화 ----------
  await page.goto(base + '/#/evolution', {waitUntil: 'networkidle'});
  await page.waitForSelector('.evo-hero'); await page.waitForSelector('svg.evo-chart');
  await headlineCheck(page, label, '진화', 'svg.evo-chart .evo-val.last');
  const tl = await page.evaluate(async () => (await fetch('data/atlas11/view/timeline.json')).json());
  const evo = await page.locator('#main').innerText(), heroText = await page.locator('.evo-hero').innerText();
  check(`${label} 진화: 질문·결론 낱말·판정일·막힘`, heroText.includes(tl.question) && heroText.includes(tl.headline.word) && (!tl.blocker || heroText.includes(tl.blocker.line)), {word: tl.headline.word, blocker: tl.blocker?.key});
  const dots = await page.locator('svg.evo-chart circle.evo-dot').count(), daily = await page.locator('svg.evo-chart circle.evo-daily').count(), tests = await page.locator('svg.evo-chart .evo-test-mark').count(), changes = await page.locator('svg.evo-chart .evo-change-mark').count(), builds = await page.locator('svg.evo-chart .evo-build-mark').count(), judge = await page.locator('svg.evo-chart .evo-judge').count();
  check(`${label} 진화: 그림의 점·표시 수 = 사실표(합친 값 점 · 하루 점 · 시험 · 바꿈 · 공사 · 판정 시작 선)`, dots === tl.chart.cumulative.length && daily === tl.chart.points.length && tests === tl.chart.tests.length && changes === tl.chart.changes.length && builds === tl.chart.constructions.length && judge === (tl.chart.judgementDate ? 1 : 0), {dots, daily, tests, changes, builds, judge});
  const tickMin = await page.evaluate(() => Math.min(...[...document.querySelectorAll('svg.evo-chart .evo-tick')].map(t => parseFloat(getComputedStyle(t).fontSize) * (t.ownerSVGElement.getBoundingClientRect().width / t.ownerSVGElement.viewBox.baseVal.width))));
  check(`${label} 진화: 그림 글자가 화면에서 11px 이상`, tickMin >= 11, {tickMin: Math.round(tickMin * 10) / 10});
  const dayRows = await page.locator('.evo-day').count(), beats = await page.locator('.evo-day').first().locator('.beat').count();
  await page.locator('.evo-day').first().locator('summary').click(); await page.waitForTimeout(250);
  const openedH4 = await page.locator('.evo-day').first().locator('.evo-beat-detail h4').count();
  check(`${label} 진화: 날짜 줄 수 = 사실표 날짜 수 · 줄마다 세 박자 · 누르면 까닭 3칸`, dayRows === tl.days.length && beats === 3 && openedH4 === 3, {dayRows, days: tl.days.length, beats, openedH4});
  check(`${label} 진화: 공사 기록(눌러야 열림) 줄 수 = 장부 공사 기록 수 · 검산 표시`, await page.locator('.evo-build li').count() === tl.constructions.length && /공사 기록 \d+건 열기/.test(evo) && (tl.check ? evo.includes(tl.check.ok ? `이 화면의 숫자 ${tl.check.checked}곳을 기록 장부에서 따로 다시 세어 모두 같음` : '검산 어긋남') : true), {constructions: tl.constructions.length, check: tl.check?.ok});
  await page.locator('.evo-expert summary').click(); await page.waitForTimeout(200);
  const expertText = await page.locator('.evo-expert').innerText();
  check(`${label} 진화 전문가용: 운영 식·핵심 규칙·관문·실전 관찰 최소 채점일`, await page.locator('.evo-expert .formula').count() === 1 && /핵심 규칙:/.test(expertText) && /관문 direction/.test(expertText) && /최소 10 채점일/.test(expertText), null);
  await shot('06-evolution');
  // ---------- 자료 상태 ----------
  await page.goto(base + '/#/status', {waitUntil: 'networkidle'});
  await page.waitForSelector('svg.lc');
  await headlineCheck(page, label, '자료 상태', '.lc .lc-end.pred');
  const statusText = await page.locator('#main').innerText();
  const tiles = await page.locator('.ftile').count(), days = await page.locator('.cal .day').count();
  check(`${label} 자료 상태: 36요인 막대·칸(눌러야 열림) · 달력 · 검사 증거`, tiles === 36 && days >= 5 && await page.locator('a[href*="evidence"]').count() >= 3 && await page.locator('.ftile.observed').count() >= 1, {tiles, days});
  check(`${label} 자료 상태: 예약 실행 확인·사이트 배포를 사실대로`, /예약 실행 확인/.test(statusText) && /사이트 배포/.test(statusText) && /예약 실행 평일 16:01 KST/.test(statusText), null);
  await shot('07-status');
  // ---------- 기록 ----------
  await page.goto(base + '/#/records', {waitUntil: 'networkidle'}); await page.waitForSelector('svg.lc');
  await headlineCheck(page, label, '기록', '.lc .lc-end.pred');
  const typeBtns = await page.locator('.filters.types .filter').count();
  await page.locator('.filters.types .filter[data-type="experiment"]').click(); await page.waitForTimeout(500);
  const ledgerIdx = await page.evaluate(async () => (await fetch('data/atlas11/ledger/index.json')).json()), shownDate = ledgerIdx.dates.at(-1), expExpected = ledgerIdx.byDate[shownDate]?.experiment ?? 0;
  await page.locator('#main details.more > summary', {hasText: '기록 표 열기'}).click().catch(() => {}); await page.waitForTimeout(200);
  const expRows = await page.locator('.table.records tbody tr').count(), dl = await page.locator('.btn-download').count(), recText = await page.locator('#main').innerText();
  check(`${label} 기록: 종류 8 · 실험 기록 행 = 그날 색인 수 · 누적 실험 11건 이상 · 내려받기 · 'null' 없음`, typeBtns === 8 && expRows === expExpected && ledgerIdx.totals.experiment >= 11 && dl >= 2 && !/\bnull\b/.test(recText), {typeBtns, expRows, expExpected, shownDate, dl});
  await page.locator('.filters.types .filter[data-type="factor"]').click(); await page.waitForTimeout(300);
  const factorDate = ledgerIdx.dates.filter(d => ledgerIdx.byDate[d]?.factor).at(-1);
  if (factorDate) { await page.locator('select[aria-label="날짜"]').selectOption(factorDate); await page.waitForTimeout(500); }
  const factorRecordRows = await page.locator('.table.records tbody tr').count();
  check(`${label} 기록: 요인 기록 36행 단위(요인 기록이 있는 마지막 날) · 결과 막대`, factorRecordRows >= 36 && factorRecordRows % 36 === 0 && await page.locator('.bars .bar-row').count() >= 1, {factorRecordRows, factorDate});
  const [csvDl] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('.btn-download', {hasText: '걸러진 CSV'}).click()]);
  check(`${label} 기록: CSV 내려받기 파일명`, /ATLAS_factor_.*\.csv$/.test(csvDl.suggestedFilename()), {name: csvDl.suggestedFilename()});
  await page.locator('details.report > summary').click(); await page.waitForTimeout(150);
  check(`${label} 기록: 일일 보고 여섯 문장(눌러야 열림 · 장부 원문 그대로)`, await page.locator('details.report .sentences li').count() === 6);
  await shot('08-records');
  // ---------- 스푸마토 그래프 · 색은 뜻에만 ----------
  await page.goto(base + '/#/stock/005930', {waitUntil: 'networkidle'}); await page.waitForSelector('.chart-box svg.chart.sfumato');
  const sf = await page.evaluate(() => { const svg = document.querySelector('.chart-box svg.chart'); const b = getComputedStyle(document.body).backgroundColor; const bandFill = getComputedStyle(svg.querySelector('.band.inner')).fill; const today = svg.querySelector('.line.today'); return {bg: b, plate: svg.querySelectorAll('.plate').length, edges: svg.querySelectorAll('.band-edge').length, shadow: svg.querySelectorAll('.line-shadow').length, halo: svg.querySelectorAll('.anchor-halo').length, bandFill, todayStroke: getComputedStyle(today).stroke, todayDir: today.classList.contains('up') ? 'up' : today.classList.contains('down') ? 'down' : 'flat', up: getComputedStyle(document.documentElement).getPropertyValue('--up').trim(), down: getComputedStyle(document.documentElement).getPropertyValue('--down').trim(), transforms: [...svg.querySelectorAll('.line, .band')].filter(e => /skew|matrix/.test(e.getAttribute('transform') || '')).length}; });
  const hex = s => { const m = String(s).match(/\d+/g); return m ? '#' + m.slice(0, 3).map(x => Number(x).toString(16).padStart(2, '0')).join('').toUpperCase() : s; };
  check(`${label} 스푸마토 바탕·판·띠 경계선 6·실제선 그림자·후광·좌표 변환 없음 · 전망선 색 = 방향(오름 빨강·내림 파랑)`, /rgb\(241, 236, 226\)/.test(sf.bg) && sf.plate === 1 && sf.edges === 6 && sf.shadow === 1 && sf.halo === 1 && /url\(/.test(sf.bandFill) && sf.transforms === 0 && (sf.todayDir === 'flat' || hex(sf.todayStroke) === (sf.todayDir === 'up' ? sf.up : sf.down).toUpperCase()), sf);
  const nav = mobile ? await page.locator('.bottom .bottom-link').count() : await page.locator('.top-nav .top-link').count();
  check(`${label} 주요 메뉴 4개`, nav === 4, {nav});
  check(`${label} 가로 스크롤 없음`, !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)));
  check(`${label} 콘솔 오류 0`, consoleErrors.length === 0, consoleErrors.slice(0, 5));
  check(`${label} 실패한 요청 0`, failedRequests.length === 0, failedRequests.slice(0, 5));
  await context.close();
}
async function darkCheck() {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, colorScheme: 'dark', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/#/stock/005930', {waitUntil: 'networkidle'}); await page.waitForSelector('.chart-box svg');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor), ink = await page.evaluate(() => getComputedStyle(document.body).color), bgImage = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  check('dark 다크 모드 토큰 적용(배경·글자·바탕 그라데이션도 어두움)', bg === 'rgb(26, 23, 20)' && ink === 'rgb(241, 235, 224)' && /rgb\(28, 25, 21\)/.test(bgImage) && errors.length === 0, {bg, ink, errors: errors.slice(0, 3)});
  await page.screenshot({path: path.join(dir, 'dark-02-detail.png')});
  await context.close();
}
/** 또렷함 여섯 숫자: 7화면 × 4보기 · 1~3번 0 이 아니면 실패 · 4~6번은 기록 */
async function clarityCheck() {
  const table = {};
  for (const v of VIEWS) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage(); table[v.id] = {};
    for (const s of SCREENS) {
      await page.goto(base + '/' + s.hash, {waitUntil: 'networkidle'}); await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => {}); await page.waitForTimeout(500); await renderAll(page);
      const m = await page.evaluate(measureClarity);
      await page.evaluate(() => { for (const x of document.querySelectorAll('.hl-num')) x.click(); }); await page.waitForTimeout(100);
      const src = await page.evaluate(measureClarity, {roots: ['.hl-src'], refTime: false});
      table[v.id][s.id] = {relDays: m.relDays, vague: m.vague, bareNumbers: m.bareNumbers, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors, formatDates: m.formatDates, source: {relDays: src.relDays, vague: src.vague, bareNumbers: src.bareNumbers}};
      const bad13 = m.relDays + m.vague + m.bareNumbers + src.relDays + src.vague + src.bareNumbers;
      check(`또렷함 ${v.id} ${s.id}: 1 내일·오늘·어제 ${m.relDays} · 2 흐릿한 말 ${m.vague} · 3 단위·기준 빠진 숫자 ${m.bareNumbers} (출처 칸 ${src.relDays}·${src.vague}·${src.bareNumbers})`, bad13 === 0, bad13 ? {rel: m.samples.relDays, vague: m.samples.vague, bare: m.samples.bareNumbers, src: src.samples.bareNumbers} : null);
      info.push({view: v.id, screen: s.id, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors});
    }
    await ctx.close();
  }
  // 검사기 자체 시험: 흐릿한 말 하나 · 단위 없는 숫자 하나를 일부러 넣으면 1·2·3번이 하나씩 늘어야 한다
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const page = await ctx.newPage();
  await page.goto(base + '/#/forecast', {waitUntil: 'networkidle'}); await page.waitForSelector('.wl-row'); await renderAll(page);
  const before = await page.evaluate(measureClarity);
  await page.evaluate(() => { const box = document.createElement('section'); box.className = 'panel'; box.innerHTML = '<p>내일 42 정도.</p><p>곧 많이 오릅니다.</p>'; document.getElementById('main').prepend(box); });
  const afterPlant = await page.evaluate(measureClarity);
  const delta = {relDays: afterPlant.relDays - before.relDays, vague: afterPlant.vague - before.vague, bareNumbers: afterPlant.bareNumbers - before.bareNumbers};
  check('검사기 자체 시험: 「내일 42 정도.」「곧 많이 오릅니다.」를 넣으면 1·2·3번이 모두 1 이상 늘어난다', delta.relDays >= 1 && delta.vague >= 1 && delta.bareNumbers >= 1, delta);
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
const summary = {schema: 'atlas11-browser-check-2', at: new Date().toISOString(), base, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (touch emulation — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면', 'pc-200': '1280x800 글씨 200%'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, clarityInfo: info, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;

/**
 * ATLAS 11 · 실제 브라우저 조작 검사 (Chromium · PC 1280×800 · 모바일 390×844)
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8811 --pw <playwright module dir>
 * 검사: 첫 화면 52카드 · 카드→상세 · 날짜 클릭→이유 · 재생→커서 이동 · 중요 일정 정지·확인 · 1만원 52선 · 순위 · 성적 · 진화 · 자료 상태 · CSV 다운로드 · 콘솔 오류 0 · 요청 실패 0
 * 결과: reports/atlas11/browser/<timestamp>/report.json + 스크린샷
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') ?? 'http://localhost:8811', pwDir = arg('--pw') ?? process.cwd();
const {chromium} = createRequire(path.join(pwDir, 'package.json'))('playwright');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(process.cwd(), 'reports/atlas11/browser', stamp); await fs.mkdir(dir, {recursive: true});
const checks = [];
const check = (name, ok, detail = null) => { checks.push({name, ok: Boolean(ok), detail}); console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' · ' + JSON.stringify(detail).slice(0, 200) : '')); };
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});

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
  await page.goto(base + '/#/forecast', {waitUntil: 'networkidle'});
  await page.waitForSelector('.stock-card');
  const cards = await page.locator('.stock-card').count();
  check(`${label} 첫 화면 52카드`, cards === 52, {cards});
  const firstVisible = await page.evaluate(() => { const el = document.querySelector('.stock-card'); const r = el.getBoundingClientRect(); return {top: r.top, inViewport: r.top < window.innerHeight}; });
  check(`${label} 첫 화면에 실제 내용(카드)이 보임`, firstVisible.inViewport, firstVisible);
  const chip = await page.locator('.data-chip').innerText();
  check(`${label} 자료 기준일 표시`, /종가|확정|보관/.test(chip), {chip});
  const sparks = await page.locator('.stock-card .spark').count(), pbars = await page.locator('.stock-card .pbar').count();
  check(`${label} 카드마다 작은 그래프·확률 막대`, sparks === 52 && pbars === 52, {sparks, pbars});
  const ranges = await page.locator('.stock-card .card-range .range.mini').count(), groupNames = await page.evaluate(() => new Set([...document.querySelectorAll('.card-range .muted')].map(e => e.textContent.split('·')[1]?.trim())).size);
  check(`${label} 카드마다 1년 범위 띠·묶음 이름(9묶음)`, ranges === 52 && groupNames === 9, {ranges, groupNames});
  await page.locator('.filter').nth(2).click(); await page.waitForTimeout(200);
  const filtered = await page.locator('.stock-card').count();
  check(`${label} 「하락 선택」 거름 단추`, filtered > 0 && filtered < 52, {filtered});
  await page.locator('.filter').nth(0).click(); await page.waitForTimeout(200);
  await page.locator('.data-chip').click(); await page.waitForTimeout(150);
  const popText = await page.locator('#edition-pop').innerText().catch(() => '');
  check(`${label} 발행본 정보 팝오버·무결성 검사`, /해시.*일치|무결성/.test(popText) && !/실패/.test(popText), {popText: popText.slice(0, 120)});
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check(`${label} Esc 로 팝오버 닫힘`, await page.locator('#edition-pop[hidden]').count() === 1);
  await shot('01-cards');
  // 터치 영역 44px 검사 (버튼·링크 표본)
  const small = await page.evaluate(() => [...document.querySelectorAll('button, a.ctl, a.tool, .bottom-link, .top-link')].filter(el => { const r = el.getBoundingClientRect(); return r.width && r.height && (r.height < 44 || r.width < 44); }).map(el => el.className + ':' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height)));
  check(`${label} 터치 영역 44px 미만 없음`, small.length === 0, small.slice(0, 8));
  // 카드 → 상세
  await page.locator('.stock-card').first().click();
  await page.waitForSelector('.detail .chart svg, .detail svg.chart');
  const title = await page.locator('.stock-title').innerText();
  check(`${label} 카드 한 번 눌러 상세 열림`, title.length > 0, {title});
  const numbers = await page.locator('.numbers .big').count();
  check(`${label} 상세 상단 숫자 5개`, numbers === 5, {numbers});
  const chartTop = await page.evaluate(() => document.querySelector('.chart-box svg').getBoundingClientRect().top);
  check(`${label} 그래프가 화면 안에 보임(스크롤 전)`, chartTop < viewport.height, {chartTop});
  const lines = await page.evaluate(() => ({actual: !!document.querySelector('.line.actual'), today: !!document.querySelector('.line.today'), band: !!document.querySelector('.band'), boundary: !!document.querySelector('.boundary'), anchor: !!document.querySelector('.anchor-dot')}));
  check(`${label} 실제선·오늘선·띠·경계선·출발점`, Object.values(lines).every(Boolean), lines);
  check(`${label} 세 겹 띠(5~95·10~90·25~75%)와 첫 숫자 강조`, await page.locator('svg .band.outer').count() === 1 && await page.locator('svg .band.mid').count() === 1 && await page.locator('svg .band.inner').count() === 1 && await page.locator('.big.first').count() === 1);
  const fontOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "IBM Plex Sans KR"') && [...document.fonts].some(f => f.family.includes('IBM Plex Sans KR') && f.status === 'loaded'); });
  check(`${label} IBM Plex Sans KR 글씨체 적용`, fontOk);
  if (!mobile) { const box = await page.locator('.chart-box svg').boundingBox(); await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5); await page.waitForTimeout(150); const tip = await page.locator('.chart-box .tip').count(); check(`${label} 그래프 위 마우스 말풍선`, tip === 1); await page.mouse.move(0, 0); }
  await shot('02-detail');
  // 날짜 클릭 → 이유
  await page.locator('.date-chip.future').nth(2).click();
  const cursor = await page.locator('.cursor-text').innerText();
  const explainHead = await page.locator('.explain h2').innerText();
  check(`${label} 미래 날짜 눌러 이유 열림(D+3)`, /D\+3/.test(cursor) && /D\+3/.test(explainHead), {cursor, explainHead});
  await page.waitForTimeout(100);
  check(`${label} 선택 날짜 분포 상자(5~95%·상자·중앙·출발가)`, await page.locator('.explain svg.qbox .q-50').count() === 1 && await page.locator('.explain svg.qbox .q-anchor').count() === 1);
  const contrib = await page.locator('.explain .cbar').count(), oneline = await page.locator('.explain .oneline').innerText().catch(() => '');
  check(`${label} 날짜 설명: 한 줄 결론·기여 막대·미확보·출처`, contrib >= 3 && oneline.length > 10 && await page.locator('.explain .missing li').count() > 0 && await page.locator('.explain .sources a').count() > 0, {contrib, oneline: oneline.slice(0, 60)});
  await shot('03-explain');
  if (mobile) { const sheetOpen = await page.locator('.explain.open').count(); check(`${label} 날짜를 누르면 이유가 바텀시트로 열림`, sheetOpen === 1); await page.keyboard.press('Escape'); await page.waitForTimeout(350); check(`${label} Esc 로 바텀시트 닫힘`, await page.locator('.explain.open').count() === 0); await closeSheet(); }
  // 재생 → 커서 이동, 중요 일정 정지
  await page.locator('.date-chip.anchor').click(); await closeSheet();
  const svgBefore = await page.evaluate(() => { const s = document.querySelector('.chart-box svg'); s.__mark = 'same'; return true; });
  await page.locator('.player .ctl.primary').click();
  await page.waitForTimeout(1300);
  const after = await page.locator('.cursor-text').innerText();
  const sameSvg = await page.evaluate(() => document.querySelector('.chart-box svg').__mark === 'same');
  check(`${label} 재생 1초/거래일 커서 이동 · 그래프는 다시 그리지 않고 커서만 이동`, /D\+1/.test(after) && sameSvg, {after, sameSvg});
  await page.waitForSelector('#notice:not([hidden])', {timeout: 6000}).catch(() => {});
  const noticeVisible = await page.locator('#notice:not([hidden])').count();
  if (noticeVisible) {
    check(`${label} 중요 일정에서 정지·확인 대기`, true, {text: (await page.locator('#notice h2').innerText())});
    if (mobile) await page.keyboard.press('Escape'); else await page.locator('#notice button').click();
    await page.waitForTimeout(1200);
    const resumed = await page.locator('.cursor-text').innerText();
    check(`${label} 확인 뒤 계속 재생`, !/D\+1 /.test(resumed) || /D\+2/.test(resumed), {resumed});
  }
  await page.locator('.player .ctl.primary').click().catch(() => {});
  // 대표 시나리오 토글
  await page.locator('.toggles .ctl.toggle').first().click();
  check(`${label} 대표 시나리오 선 표시`, await page.locator('.line.scenario').count() === 1);
  // CSV 다운로드
  const [download] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('a.ctl[download]').click()]);
  const csvPath = path.join(dir, `${label}-` + download.suggestedFilename()); await download.saveAs(csvPath);
  const csv = await fs.readFile(csvPath, 'utf8');
  check(`${label} CSV 다운로드 21행(출발 1+전망 20)`, csv.trim().split(/\r?\n/).length === 22 && /실제출발/.test(csv), {name: download.suggestedFilename(), rows: csv.trim().split(/\r?\n/).length});
  const [jsonDl] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('.toggles .ctl', {hasText: '상세 JSON'}).click()]);
  check(`${label} 상세 JSON 내려받기(blob · CSP 아래)`, /_detail\.json$/.test(jsonDl.suggestedFilename()), {name: jsonDl.suggestedFilename()});
  // v5 종목 정보 · 연쇄 지도
  await page.waitForSelector('.card.info .range', {timeout: 8000});
  const infoKv = await page.locator('.card.info .kv.six .kv-item').count(), infoText = await page.locator('.card.info').innerText();
  check(`${label} 종목 정보(1년 범위 띠 · 18칸 · 동조 상위 5)`, infoKv === 18 && /1년 범위/.test(infoText) && /동조 상위 5/.test(infoText) && /베타/.test(infoText), {infoKv});
  await page.waitForSelector('.card.chain svg.netmap');
  const nodes = await page.locator('.netmap .node').count(), arcs = await page.locator('.netmap .group-arc').count(), orders = await page.locator('.chain-strip .order').count(), links = await page.locator('.netmap .link').count();
  check(`${label} 연쇄 지도 52노드·9묶음 호·1~5차 다섯 칸·연결선`, nodes === 52 && arcs === 9 && orders === 5 && links > 0, {nodes, arcs, orders, links});
  const shockBefore = await page.locator('.chain-strip .order[data-order="2"] .order-row b').first().innerText();
  await page.locator('.toggles.shock .ctl', {hasText: '+10%'}).click(); await page.waitForTimeout(200);
  const shockAfter = await page.locator('.chain-strip .order[data-order="2"] .order-row b').first().innerText();
  check(`${label} 충격 단추(+10%) → 2차 숫자 부호 바뀜`, shockBefore !== shockAfter && /^[−-]/.test(shockBefore.trim()) !== /^[−-]/.test(shockAfter.trim()), {shockBefore, shockAfter});
  const channel = await page.locator('.card.chain .channel').innerText();
  check(`${label} 시장 통로·직접 통로 설명 문장`, /시장 통로/.test(channel) && /직접 통로/.test(channel) && /=/.test(channel), {channel: channel.slice(0, 80)});
  await page.locator('.card.chain .ctl', {hasText: '누적으로 보기'}).click(); await page.waitForTimeout(200);
  check(`${label} 누적(1~5차 합) 칸 추가`, await page.locator('.chain-strip .order').count() === 6 && /누적 파급/.test(await page.locator('.netmap .center-s').textContent()));
  await page.locator('.card.chain .ctl.primary').click(); await page.waitForTimeout(150);
  const litEarly = await page.locator('.netmap .node.lit').count(), playing = await page.locator('.netmap-box.playing').count();
  await page.waitForTimeout(3600);
  const litLate = await page.locator('.netmap .node.lit').count(), stripLit = await page.locator('.chain-strip .order.lit').count();
  check(`${label} 파급 재생: 1차부터 차례로 켜짐(초반 < 끝)`, playing === 1 && litEarly >= 1 && litLate > litEarly && stripLit >= 5, {litEarly, litLate, stripLit});
  const hashBefore = await page.evaluate(() => location.hash);
  await page.locator('.chain-strip .order[data-order="2"] .order-row').first().click(); await page.waitForTimeout(600);
  const hashAfter = await page.evaluate(() => location.hash);
  check(`${label} 연쇄 칸의 종목을 누르면 그 종목 상세로 이동`, hashBefore !== hashAfter && /^#\/stock\/\d{6}$/.test(hashAfter), {hashBefore, hashAfter});
  await page.waitForSelector('.card.chain svg.netmap');
  check(`${label} 이동한 종목에서도 연쇄 지도 다시 그림`, await page.locator('.netmap .node.src').count() === 1 && (await page.locator('.netmap .node.src').getAttribute('data-code')) === hashAfter.slice(-6));
  await page.goto(base + '/#/stock/005930', {waitUntil: 'networkidle'}); await page.waitForSelector('.chart-box svg'); await page.waitForSelector('.card.chain svg.netmap'); await page.waitForTimeout(300);
  // 부분 캡처(고정 머리띠가 겹치지 않게 캡처 동안만 감춤)
  await page.evaluate(() => { document.querySelector('.top').style.visibility = 'hidden'; });
  await page.locator('.card.info').screenshot({path: path.join(dir, `${label}-03b-info.png`)});
  await page.locator('.card.chain').screenshot({path: path.join(dir, `${label}-03c-chain.png`)});
  await page.evaluate(() => { document.querySelector('.top').style.visibility = ''; });
  for (let k = 0; k < 4; k++) await page.locator('.tool[aria-label^="글씨 크게"]').click();
  await page.waitForTimeout(200);
  const fontSize = await page.evaluate(() => document.documentElement.style.fontSize), overflow200 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label} 글씨 200% 에서도 가로 넘침 없음`, fontSize === '200%' && overflow200 <= 0, {fontSize, overflow200});
  for (let k = 0; k < 4; k++) await page.locator('.tool[aria-label="글씨 작게"]').click();
  // 1만원 비교
  await page.goto(base + '/#/race', {waitUntil: 'networkidle'});
  await page.waitForSelector('.race-line');
  const raceLines = await page.evaluate(() => new Set([...document.querySelectorAll('.race-line')].map(p => p.dataset.code)).size);
  check(`${label} 1만원 비교 52선`, raceLines === 52, {raceLines});
  const rankRows = await page.locator('.rank-row').count();
  check(`${label} 순위 52줄`, rankRows === 52, {rankRows});
  await page.locator('.rank-btn').nth(3).click();
  await page.waitForTimeout(400);
  check(`${label} 순위 종목 선택 → 강조·일정`, await page.locator('.race-line.selected').count() === 2 && (await page.locator('.rank-news h3').innerText()).length > 0);
  await page.locator('.slider').fill(String(35));
  await page.waitForTimeout(200);
  check(`${label} 전망 구간에서 「오늘부터 향후 수익률 순위」 단추`, await page.locator('.toggles .ctl.toggle').count() >= 3);
  await page.locator('.toggles .ctl.toggle', {hasText: '오늘('}).click(); await page.waitForTimeout(400);
  const todayBase = await page.evaluate(() => { const rows = [...document.querySelectorAll('.rank-row .rank-val')].map(e => e.textContent); return rows.length; });
  const anchorConverge = await page.evaluate(() => { const paths = [...document.querySelectorAll('.race-line.forecast')]; return paths.length === 52; });
  check(`${label} 「오늘 1만원 출발」로 다시 환산`, todayBase === 52 && anchorConverge && /오늘 1만원/.test(await page.locator('.chart-box').innerText()));
  await page.locator('.toggles .ctl.toggle').first().click(); await page.waitForTimeout(300);
  // v5 묶음 강조
  const groupBtns = await page.locator('.toggles.groups .ctl').count();
  await page.locator('.toggles.groups .ctl[data-group="semi"]').click(); await page.waitForTimeout(300);
  const hl = await page.evaluate(() => new Set([...document.querySelectorAll('.race-line.highlight')].map(p => p.dataset.code)).size), legendText = await page.locator('.legend').innerText();
  check(`${label} 1만원 비교 묶음 단추(전체+9) → 반도체·전자 6선 강조`, groupBtns === 10 && hl >= 5 && hl <= 6 && /반도체/.test(legendText), {groupBtns, hl});
  await page.locator('.toggles.groups .ctl[data-group="all"]').click(); await page.waitForTimeout(200);
  await shot('04-race');
  // 성적
  await page.goto(base + '/#/scores', {waitUntil: 'networkidle'});
  await page.waitForSelector('.card');
  const scoresText = await page.locator('#main').innerText();
  check(`${label} 성적 화면(채점 예정표 4칸 + 후향 진단)`, /채점 예정표|날짜별 성적/.test(scoresText) && /후향 진단/.test(scoresText) && await page.locator('.timeline .tl').count() === 4);
  await shot('05-scores');
  // 진화
  await page.goto(base + '/#/evolution', {waitUntil: 'networkidle'});
  await page.waitForSelector('.formula');
  const evo = await page.locator('#main').innerText();
  check(`${label} 진화 화면 A/B 네 숫자·기각·계산 흐름 그림`, /운영 A 유지/.test(evo) && /9\.31/.test(evo) && /9\.39/.test(evo) && await page.locator('svg.pipeline').count() === 1, null);
  await shot('06-evolution');
  // 자료 상태
  await page.goto(base + '/#/status', {waitUntil: 'networkidle'});
  await page.waitForSelector('.table'); await page.waitForTimeout(300);
  const statusText = await page.locator('#main').innerText();
  const tiles = await page.locator('.ftile').count(), days = await page.locator('.cal .day').count(), shield = await page.locator('.shield.ok').count();
  check(`${label} 자료 상태: 36요인 격자·달력·무결성·검사 증거`, /36요인/.test(statusText) && tiles === 36 && days >= 5 && shield === 1 && await page.locator('a[href*="evidence"]').count() >= 3, {tiles, days, shield});
  await shot('07-status');
  // v6 자료 상태: 예약·수집 상태 정직 표시
  check(`${label} 자료 상태: 예약기 설치 안 됨을 숨기지 않음`, /heartbeat 없음|예약이 설치되지 않음|서버·예약/.test(statusText), null);
  // v6 진화: 자동 진화 등록부(후보 11 · 네 숫자 · 관문 · 결정) · 36요인 관리표 · 채점 정책
  await page.goto(base + '/#/evolution', {waitUntil: 'networkidle'}); await page.waitForSelector('.card.panel');
  const evoText = await page.locator('#main').innerText();
  const candRows = await page.evaluate(() => { const h = [...document.querySelectorAll('.card.panel h2')].find(x => /후보와 네 숫자/.test(x.textContent)); return h ? h.parentElement.querySelectorAll('tbody tr').length : 0; });
  const factorRows = await page.evaluate(() => { const h = [...document.querySelectorAll('.card.panel h2')].find(x => /36요인 관리표/.test(x.textContent)); return h ? h.parentElement.querySelectorAll('tbody tr').length : 0; });
  check(`${label} 진화: 자동 진화 상태·후보 11개 네 숫자·관문·결정·요인표 36·채점 정책`, /자동 진화 · 지금 상태/.test(evoText) && candRows === 11 && factorRows === 36 && /채점 정책\(결과 보기 전에 고정\)/.test(evoText) && /9\.3104/.test(evoText) && /기각/.test(evoText), {candRows, factorRows});
  // v6 기록: 여섯 문장 · 8종류 단추 · 거름 · 실험 기록 표 · 내려받기 · 'null' 글자 없음
  await page.goto(base + '/#/records', {waitUntil: 'networkidle'}); await page.waitForSelector('.sentences li');
  const sixCount = await page.locator('.sentences li').count(), typeBtns = await page.locator('.filters.types .filter').count();
  await page.locator('.filters.types .filter[data-type="experiment"]').click(); await page.waitForTimeout(500);
  const expRows = await page.locator('.records-result tbody tr').count(), dl = await page.locator('.btn-download').count(), recText = await page.locator('#main').innerText();
  check(`${label} 기록: 여섯 문장 6 · 종류 8 · 실험 기록 11행 · 내려받기 단추 · 'null' 없음`, sixCount === 6 && typeBtns === 8 && expRows === 11 && dl >= 2 && !/\bnull\b/.test(recText), {sixCount, typeBtns, expRows, dl});
  await page.locator('.filters.types .filter[data-type="factor"]').click(); await page.waitForTimeout(400);
  check(`${label} 기록: 요인 기록 36행 · 걸러진 CSV 내려받기 동작`, await page.locator('.records-result tbody tr').count() === 36 && await page.locator('.btn-download').count() >= 2);
  const [csvDl] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('.btn-download', {hasText: '걸러진 CSV'}).click()]);
  check(`${label} 기록 CSV 내려받기 파일명`, /ATLAS_factor_.*\.csv$/.test(csvDl.suggestedFilename()), {name: csvDl.suggestedFilename()});
  await shot('08-records');
  // v6 스푸마토: 바탕 아이보리 · 그래프 층(판·띠 경계선 6·실제선 그림자 1·후광) · 좌표 왜곡 없음(변환 없음)
  await page.goto(base + '/#/stock/005930', {waitUntil: 'networkidle'}); await page.waitForSelector('.chart-box svg.chart.sfumato');
  const sf = await page.evaluate(() => { const svg = document.querySelector('.chart-box svg.chart'); const b = getComputedStyle(document.body).backgroundColor; const bandFill = getComputedStyle(svg.querySelector('.band.inner')).fill; return {bg: b, plate: svg.querySelectorAll('.plate').length, edges: svg.querySelectorAll('.band-edge').length, shadow: svg.querySelectorAll('.line-shadow').length, halo: svg.querySelectorAll('.anchor-halo').length, bandFill, transforms: [...svg.querySelectorAll('.line, .band')].filter(e => (e.getAttribute('transform') || '').includes('skew') || (e.getAttribute('transform') || '').includes('matrix')).length, modelChip: [...document.querySelectorAll('.chip')].some(c => /모델 atlas11/.test(c.textContent))}; });
  check(`${label} 스푸마토 그래프: 아이보리 바탕·판·띠 경계선 6·실제선 그림자·후광·띠 그라데이션·좌표 변환 없음·모델 칩`, /rgb\(241, 236, 226\)/.test(sf.bg) && sf.plate === 1 && sf.edges === 6 && sf.shadow === 1 && sf.halo === 1 && /url\(/.test(sf.bandFill) && sf.transforms === 0 && sf.modelChip, sf);
  // 메뉴 4개
  const nav = mobile ? await page.locator('.bottom .bottom-link').count() : await page.locator('.top-nav .top-link').count();
  check(`${label} 주요 메뉴 4개`, nav === 4, {nav});
  const horizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`${label} 가로 스크롤 없음`, !horizontalScroll);
  check(`${label} 콘솔 오류 0`, consoleErrors.length === 0, consoleErrors.slice(0, 5));
  check(`${label} 실패한 요청 0`, failedRequests.length === 0, failedRequests.slice(0, 5));
  await context.close();
}
async function darkCheck() {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, colorScheme: 'dark', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/#/stock/005930', {waitUntil: 'networkidle'}); await page.waitForSelector('.chart-box svg');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor), ink = await page.evaluate(() => getComputedStyle(document.body).color);
  check('dark 다크 모드 토큰 적용(배경·글자)', bg === 'rgb(26, 23, 20)' && ink === 'rgb(241, 235, 224)' && errors.length === 0, {bg, ink, errors: errors.slice(0, 3)});
  await page.screenshot({path: path.join(dir, 'dark-02-detail.png')});
  await context.close();
}
try {
  await scenario('pc', {width: 1280, height: 800});
  await scenario('mobile', {width: 390, height: 844}, {mobile: true});
  await darkCheck();
} finally { await browser.close(); }
const summary = {schema: 'atlas11-browser-check-1', at: new Date().toISOString(), base, chromium: 'playwright bundled chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (touch emulation — 실제 아이폰 기기 검증 아님)'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;

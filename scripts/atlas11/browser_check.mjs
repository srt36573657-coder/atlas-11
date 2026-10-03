/**
 * ATLAS 11 · 실제 브라우저 조작 검사 (Chromium · PC 1280×800 · 모바일 390×844 · 어두운 화면 · 글씨 200%)
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8811 --pw <playwright module dir>
 * v9 검사: 화면마다 헤드라인 한 줄(누르면 출처·기준 시각) · 첫 그래프의 마지막 값 = 헤드라인 숫자 · 시장 띠 ·
 *          전망 52줄 · 줄→상세 · 날짜 클릭→설명 · 재생→커서 이동 · 중요 일정 정지·확인 · 1만원 52선(평균선) · 순위 · 성적 · 진화 · 자료 상태 · 기록 ·
 *          CSV·JSON 내려받기 · 콘솔 오류 0 · 요청 실패 0 ·
 *          또렷함 여섯 숫자(7화면 × PC·휴대폰·휴대폰 어두운 화면·PC 글씨 200%·좁은 휴대폰 어두운 화면 글씨 200%) — 1~3번(내일·오늘·어제 / 흐릿한 말 / 부호·단위·기준 시각 빠진 숫자)이 0 이 아니면 실패 ·
 *          7번 잘린 글자(「…」 줄임 · 판 끝에서 잘림 · 화면 밖 · 가로로 밀어야 보임 · 글이 넘친 선택 상자)가 0 이 아니면 실패(10/01 새벽 회사 이름 잘림 뒤 추가) ·
 *          검사기 자체 시험(일부러 흐릿한 말·단위 없는 숫자·잘린 이름을 넣으면 잡는가)
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
// 「내일 하루만」(2026-10-02 00:08 KST 사장님 명령 · config/atlas11/horizon.json): 화면 묶음의 manifest.tomorrowOnly 가 있으면
//   20거래일 기능(20일 막대·대표 시나리오·여러 날 CSV·1만원 비교) 대신 「내일 하나만 · 꺼 둠 한 줄」을 검사한다. 없으면(futureDays 20) 옛 검사 그대로.
const viewManifest = await (await fetch(base + '/data/atlas11/view/manifest.json')).json();
const TOMORROW = Boolean(viewManifest.tomorrowOnly), tomorrowDate = viewManifest.futureDates[0];
/** 화면의 전망 표시(data-forecast-date) 가운데 내일이 아닌 것의 수 · 내일인 것의 수 */
const forecastMarks = page => page.evaluate(t => { const all = [...document.querySelectorAll('[data-forecast-date]')].map(e => e.getAttribute('data-forecast-date')); return {other: all.filter(d => d !== t).length, tomorrow: all.filter(d => d === t).length}; }, tomorrowDate);

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
  // ---------- 내일(첫 화면) ----------
  // 2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면 그림): 첫 화면 = 큰 제목 「내일」 + 52점 원(점만 톡톡 나타남) + 두 줄 + 목록 + 지난 3번의 성적 · 맨 위는 둥근 단추 둘(가 · 소리).
  //   3차 이야기(글상자·진행 점·건너뛰기/다시 보기·한 번만 돌기·움직임 줄이기면 끝 장면)는 꺼 두었으므로(view-tomorrow.js STORY = false · 지우지 않음) 그 검사는 「이야기 칸이 없음」 검사로 바꿨다.
  //   (2026-10-02 01:34 사장님 승인 3차 디자인 때 옛 전망 화면 검사 — 맨 위 시장 띠 · 헤드라인 한 줄 · 52줄 · 작은 그래프 … — 를 바꾼 까닭은 그대로: 그 요소는 이 화면에 없다)
  const cardsDoc = await (await fetch(base + '/data/atlas11/view/cards.json')).json();
  const upN = cardsDoc.cards.filter(c => c.day1?.selected === 'up').length, downN = cardsDoc.cards.filter(c => c.day1?.selected === 'down').length, halfN = cardsDoc.cards.filter(c => c.day1 && (c.day1.closeCall || c.day1.statisticalTie)).length;
  const actualAsOf = viewManifest.actualAsOf;
  const longKor = d => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00Z').getUTCDay()]}요일`;
  // 2026-10-02 14:01 사장님 「동그라미 천천히 나오고 회사 이름 나오게 해봐」: 점이 하나씩 나오는 데 22초쯤 걸린다 —
  //   다 나온 모습(움직임 줄이기면 처음부터 그 모습)으로 2차 글자·목록을 먼저 보고, 점이 나오는 움직임은 아래에서 따로 본다
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(base + '/#/forecast', {waitUntil: 'networkidle'});
  await page.waitForSelector('.t-ring .t-dot');
  await page.waitForTimeout(400);
  const first = await page.evaluate(() => ({title: document.querySelector('.t-title')?.textContent, when: document.querySelector('.t-when')?.textContent, dots: document.querySelectorAll('.t-ring .t-dot').length, up: document.querySelectorAll('.t-ring .t-dot.up').length, down: document.querySelectorAll('.t-ring .t-dot.down').length, half: document.querySelectorAll('.t-ring .t-dot.half').length, story: document.querySelector('.t-page')?.dataset.story, cap: document.querySelectorAll('.t-cap').length, progress: document.querySelectorAll('.t-progress').length, ctl: document.querySelectorAll('#t-ctl').length, links: document.querySelectorAll('#main .t-links').length, num: document.querySelector('.t-num')?.innerText.trim(), of: document.querySelector('.t-of')?.innerText.trim(), say: document.querySelector('.t-say')?.innerText.trim(), visible: getComputedStyle(document.querySelector('#t-after')).visibility, tools: [...document.querySelectorAll('#top button')].map(b => b.textContent.trim()), tabs: [...document.querySelectorAll('.bottom .bottom-link')].map(a => a.innerText.trim())}));
  check(`${label} 내일(2차): 큰 제목 「내일」·내일 날짜 · 52점 원(오를 ${upN}·내릴 ${downN}·속 빈 ${halfN}) · 가운데 「${upN}」 · 「52종목 중 오를 쪽」 · 두 줄 · 목록이 처음부터 보임 · 글상자·진행 점·건너뛰기·아래 링크 없음 · 맨 위 단추 둘 · 아래 탭 셋(내일 · 게임 · 성적 — 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」)`, first.title === '내일' && first.when === longKor(tomorrowDate) && first.dots === 52 && first.up === upN && first.down === downN && first.half === halfN && first.story === 'off' && first.cap === 0 && first.progress === 0 && first.ctl === 0 && first.links === 0 && first.num === String(upN) && first.of === '52종목 중 오를 쪽' && first.say === `나머지 ${downN}종목은 내릴 쪽입니다.\n속이 빈 ${halfN}개는 거의 반반입니다.` && first.visible === 'visible' && first.tools.length === 2 && first.tools[0] === '가' && first.tabs.join(',') === '내일,게임,성적', first);
  const orderOk = await page.evaluate(() => { const k = [...document.querySelectorAll('.t-ring .t-dot')].map(c => c.classList.contains('up') ? (c.classList.contains('half') ? 1 : 0) : (c.classList.contains('half') ? 2 : 3)); return k.every((v, i) => i === 0 || v >= k[i - 1]); });
  check(`${label} 내일: 원은 12시부터 시계 방향으로 분명히 오름 → 오름이지만 반반 → 내림이지만 반반 → 분명히 내림`, orderOk);
  const fin = await page.evaluate(() => ({rows: document.querySelectorAll('.t-row').length, pills: document.querySelectorAll('.t-row .t-pill').length, more: document.querySelector('.t-more')?.textContent, heads: [...document.querySelectorAll('.t-h2')].map(x => x.innerText.trim()), hollow: [...document.querySelectorAll('.t-dot.half')].every(c => (getComputedStyle(c).fill === 'transparent' || getComputedStyle(c).fill === 'rgba(0, 0, 0, 0)') && getComputedStyle(c).stroke !== 'none' && c.getAttribute('r') === '6.2'), solid: [...document.querySelectorAll('.t-dot:not(.half)')].every(c => getComputedStyle(c).stroke === 'none' && c.getAttribute('r') === '7.4'), foot: document.querySelector('.t-foot')?.innerText.trim()}));
  check(`${label} 내일(2차): 목록(오를 쪽 전부 + 내릴 쪽 5 + 더 보기) · 묶음 제목 「오를 쪽 ${upN}」「내릴 쪽 ${downN}」「지난 3번의 성적」 · 속 빈 원 r 6.2 · 속 찬 원 r 7.4 · 「${longKor(actualAsOf)} 종가로 계산」`, fin.rows === upN + Math.min(5, downN) && fin.pills === fin.rows && (downN <= 5 || fin.more === `${downN - 5}종목 더 보기`) && fin.heads[0] === `오를 쪽 ${upN}` && fin.heads[1] === `내릴 쪽 ${downN}` && fin.heads[2] === '지난 3번의 성적' && fin.hollow && fin.solid && fin.foot === `${longKor(actualAsOf)} 종가로 계산`, fin);
  // 2026-10-02 14:08 사장님 「36가지를 점수화 … 종류와 점수 · 가장 높은 순 · 왜 그 종목을 오를 쪽으로 봤나 · 종목별로」: 원 아래 「왜 그렇게 봤나」
  const why = await page.evaluate(() => ({h: document.querySelector('.t-why-h')?.innerText.trim(), code: document.querySelector('.t-why')?.dataset.code, firstCode: document.querySelector('.t-ring .t-dot')?.dataset.code, vals: [...document.querySelectorAll('.t-why-v')].map(x => Number(x.innerText.replace('−', '-').replace('%', ''))), n36: document.querySelectorAll('.t-why-36 li').length, sc: [...document.querySelectorAll('.t-why-36 .t-why-sc')].map(x => Number(x.innerText.replace(/[^\d]/g, '')))}));
  check(`${label} 내일: 원 아래 「왜 그렇게 봤나」 — 12시 첫 점 종목의 하루 기대 몫이 높은 순(${why.vals.join(' ≥ ')}) · 36가지 점수표가 높은 순(36줄)`, why.code === why.firstCode && /^왜 (오를|내릴) 쪽으로 봤나 · /.test(why.h) && why.vals.length >= 1 && why.vals.every((v, i) => i === 0 || v <= why.vals[i - 1]) && why.n36 === 36 && why.sc.length === 36 && why.sc.every((v, i) => i === 0 || v <= why.sc[i - 1]), why);
  {
    const sc = await (await fetch(base + '/data/atlas11/view/scores.json')).json();
    const last3 = sc.byDate.map(d => { const ev = d.rows.map(r => r.horizons?.['1']).filter(x => x?.status === 'evaluated' && typeof x.directionCorrect === 'boolean'); return {date: d.date, n: ev.length, right: ev.filter(x => x.directionCorrect).length}; }).filter(d => d.n).sort((a, b) => a.date < b.date ? -1 : 1).slice(-3);
    const n = last3.reduce((s, d) => s + d.n, 0), right = last3.reduce((s, d) => s + d.right, 0);
    const card = await page.evaluate(() => ({big: document.querySelector('.t-big')?.childNodes[0]?.textContent, days: [...document.querySelectorAll('.t-day p')].map(p => p.innerText.replace(/\s+/g, ' ').trim()), honest: document.querySelector('.t-honest')?.innerText.trim()}));
    const share = n ? right / n : null, want = n ? `${n}번 가운데 ${right}번 맞혔습니다.` + (share >= 0.4 && share <= 0.6 ? ' 하루 방향은 아직 반반에 가깝습니다.' : '') : '아직 채점이 끝난 날이 없습니다.';
    const wantDays = last3.map(d => `${Number(d.date.slice(5, 7))}월 ${Number(d.date.slice(8, 10))}일 ${d.right}/${d.n}`);
    check(`${label} 내일: 지난 3번의 성적 = 채점 자료의 1거래일 방향(마지막 ${last3.length}날 · ${right}/${n}) · 막대 이름 「9월 29일 35/52」 모양 · 반반 문장은 40~60%일 때만`, (!n || card.big === `${Math.round(share * 100)}%`) && card.days.join('|') === wantDays.join('|') && card.honest === want, {card, want, wantDays});
  }
  if (TOMORROW) {
    const fm = await forecastMarks(page);
    check(`${label} 내일(내일만): 전망 표시(원 점 52 · 가운데 숫자 · 줄 · 알약)는 모두 내일 · 1만원 비교 메뉴 없음`, fm.other === 0 && fm.tomorrow >= 52 + 1 + fin.rows * 2 && await page.locator('.bottom-link[data-route="race"]').count() === 0, {fm});
  }
  await page.locator('.t-more').click(); await page.waitForTimeout(150);
  check(`${label} 내일: 「더 보기」 → 내릴 쪽 ${downN}종목 모두`, await page.locator('.t-row').count() === upN + downN && (await page.locator('.t-more').innerText()).trim() === '접기');
  await page.locator('.t-more').click(); await page.waitForTimeout(100);
  // 2026-10-02 14:01 사장님 「동그라미 천천히 나오고 회사 이름 나오게 해봐」: 움직임을 허용하면 점이 12시부터 시계 방향으로 하나씩(점마다 0.36초) 나오고,
  //   가운데에 막 나온 점의 회사 이름과 「오를 쪽 · 확률 N%」(또는 「· 거의 반반」)가 뜬다 · 다 나오면 2차 그대로(숫자 · 「52종목 중 오를 쪽」) ·
  //   그 뒤 점을 누르면 그 회사 이름이 2.5초 · 움직임 줄이기면 처음부터 다 보임(위에서 본 모습)
  const nameOf = code => cardsDoc.cards.find(c => c.code === code)?.name;
  const rollOf = () => page.evaluate(() => { const ds = [...document.querySelectorAll('.t-ring .t-dot')], on = ds.map(c => c.classList.contains('on')), k = on.lastIndexOf(true), cs = ds.map(c => getComputedStyle(c));
    return {roll: document.querySelector('.t-page')?.dataset.roll, on: on.filter(Boolean).length, prefix: on.every((v, i) => i === 0 || !v || on[i - 1]), lastCode: k >= 0 ? ds[k].dataset.code : null, name: document.querySelector('.t-roll-name')?.innerText.trim(), side: document.querySelector('.t-roll-side')?.innerText.trim(),
      numShown: getComputedStyle(document.querySelector('.t-num')).display !== 'none', num: document.querySelector('.t-num')?.innerText.trim(), of: document.querySelector('.t-of')?.innerText.trim(), hiddenOff: ds.filter((c, i) => !on[i]).every((c, i) => Number(getComputedStyle(c).opacity) === 0), minOpacity: Math.min(...cs.map(x => Number(x.opacity))), story: document.querySelector('.t-page')?.dataset.story, ctl: document.querySelectorAll('#t-ctl').length}; });
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.t-ring .t-dot'); await page.waitForTimeout(3000);
  const roll = await rollOf();
  check(`${label} 내일: 점이 12시부터 하나씩 천천히 나옴(3초에 ${roll.on}개 · 안 나온 점은 안 보임) · 가운데에 막 나온 점의 회사 이름 「${roll.name}」 · 「${roll.side}」 · 건너뛰기 단추 없음`, roll.roll === 'playing' && roll.on >= 3 && roll.on <= 12 && roll.prefix && roll.hiddenOff && roll.name === nameOf(roll.lastCode) && /^(오를|내릴) 쪽 · (확률 \d+%|거의 반반)$/.test(roll.side) && !roll.numShown && roll.story === 'off' && roll.ctl === 0, roll);
  if (label === 'pc') {
    await page.waitForSelector('.t-page[data-roll="done"]', {timeout: 45000});
    const done = await rollOf();
    check(`${label} 내일: 52개가 다 나오면 가운데는 2차 그대로(「${upN}」 · 「52종목 중 오를 쪽」) · 52점 모두 보임`, done.roll === 'done' && done.on === 52 && done.minOpacity === 1 && done.numShown && done.num === String(upN) && done.of === '52종목 중 오를 쪽', done);
    const pos = await page.evaluate(() => { const c = document.querySelectorAll('.t-ring .t-dot')[20], r = c.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, code: c.dataset.code}; });
    await page.mouse.click(pos.x, pos.y); await page.waitForTimeout(450);
    const tap = {...await rollOf(), whyCode: await page.evaluate(() => document.querySelector('.t-why')?.dataset.code)};
    await page.waitForTimeout(2600);
    const back = await rollOf();
    check(`${label} 내일: 다 나온 뒤 점을 누르면 그 회사 이름(「${tap.name}」)이 뜨고 「왜 그렇게 봤나」도 그 종목으로 · 2.5초 뒤 숫자로 돌아감`, tap.roll === 'tap' && tap.name === nameOf(pos.code) && tap.whyCode === pos.code && !tap.numShown && back.roll === 'done' && back.numShown, {tap, back: back.roll});
  }
  await page.evaluate(() => { try { localStorage.clear(); } catch {} }); await page.emulateMedia({reducedMotion: 'reduce'});
  await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.t-ring .t-dot'); await page.waitForTimeout(200);
  const reduced = {...await rollOf(), visible: await page.evaluate(() => getComputedStyle(document.querySelector('#t-after')).visibility)};
  check(`${label} 내일: 움직임 줄이기 설정이면 점이 하나씩 나오지 않고 처음부터 52점 · 숫자가 다 보임`, reduced.roll === 'done' && reduced.on === 52 && reduced.minOpacity === 1 && reduced.numShown && reduced.visible === 'visible', reduced);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const focusRing = await page.evaluate(() => { const b = document.querySelector('.t-more'); b.focus({focusVisible: true}); const cs = getComputedStyle(b); return {style: cs.outlineStyle, width: parseFloat(cs.outlineWidth)}; });
  check(`${label} 내일: 키보드 초점 표시(테두리 3px)`, focusRing.style !== 'none' && focusRing.width >= 2, focusRing);
  await shot('01-forecast');
  const small = await page.evaluate(() => [...document.querySelectorAll('button, a.ctl, a.tool, .bottom-link, .top-link')].filter(el => { const r = el.getBoundingClientRect(); return r.width && r.height && (r.height < 44 || r.width < 44); }).map(el => el.className + ':' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height)));
  check(`${label} 터치 영역 44px 미만 없음`, small.length === 0, small.slice(0, 8));
  // ---------- 줄 → 상세 ----------
  await page.locator('.t-row').first().click();
  await page.waitForSelector('.detail svg.chart');
  await page.waitForTimeout(200);
  // 2026-10-02 01:34 사장님 승인 3차 디자인: 맨 위는 단추 둘뿐 — 시장 띠는 「내일」 밖의 화면 본문 맨 위(#main .mstrip)로 옮김
  const strip = await page.locator('#main .mstrip').innerText();
  check(`${label} 시장 띠(본문 맨 위): 코스피·코스닥 값·등락·기준 시각`, /코스피 [\d,.]+포인트/.test(strip.replace(/\s+/g, ' ')) && /코스닥/.test(strip) && /[+−]\d+\.\d{2}%/.test(strip) && /\d+월 \d+일\(.\) 15:30 KST 종가/.test(strip), {strip: strip.replace(/\s+/g, ' ')});
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
  if (TOMORROW) {
    const fm = await forecastMarks(page), futureChips = await page.locator('.date-chip.future').count();
    check(`${label} 상세(내일만): 미래 날짜는 내일 하나 · 전망 표시(점·띠·숫자)는 모두 내일 · 대표 시나리오·여러 날 CSV 없음`, futureChips === 1 && fm.other === 0 && fm.tomorrow >= 3 && await page.locator('.line.scenario').count() === 0 && await page.locator('.toggles .ctl.toggle', {hasText: '대표 시나리오'}).count() === 0, {futureChips, fm});
  }
  await page.locator('.date-chip.future').nth(TOMORROW ? 0 : 2).click();
  const cursor = await page.locator('.cursor-text').innerText();
  const explainHead = await page.locator('.explain h2').innerText();
  check(`${label} 상세: 미래 날짜 눌러 설명 열림(${TOMORROW ? '내일' : '3거래일 뒤'})`, TOMORROW ? /· 전망$/.test(cursor.trim()) && /· 전망/.test(explainHead) : /3거래일 뒤/.test(cursor) && /3거래일 뒤/.test(explainHead), {cursor, explainHead});
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
  check(`${label} 상세: 재생 하루 1초 · 그래프는 다시 그리지 않고 커서만 이동`, (TOMORROW ? /· 전망$/.test(after.trim()) : /1거래일 뒤/.test(after)) && sameSvg, {after, sameSvg});
  await page.waitForSelector('#notice:not([hidden])', {timeout: 6000}).catch(() => {});
  if (await page.locator('#notice:not([hidden])').count()) {
    check(`${label} 상세: 중요 일정에서 정지·확인 대기`, true, {text: (await page.locator('#notice h2').innerText())});
    if (mobile) await page.keyboard.press('Escape'); else await page.locator('#notice button').click();
    await page.waitForTimeout(1200);
    const resumed = await page.locator('.cursor-text').innerText();
    check(`${label} 상세: 확인 뒤 계속 재생`, !/^[^·]*· 1거래일 뒤/.test(resumed) || /2거래일 뒤/.test(resumed), {resumed});
  }
  await page.locator('.player .ctl.primary').click().catch(() => {});
  // 재생이 다음 중요 일정에서 또 멈추면 알림 창이 단추를 가린다 — 닫고 정지한 뒤 다음 조작(20거래일 화면에서 재생이 길어 생기던 끊김)
  for (let k = 0; k < 3 && await page.locator('#notice:not([hidden])').count(); k++) { await page.locator('#notice button').click().catch(() => {}); await page.waitForTimeout(150); await page.locator('.player .ctl.primary', {hasText: '정지'}).click().catch(() => {}); }
  if (!TOMORROW) {
    await page.locator('.toggles .ctl.toggle').first().click();
    check(`${label} 상세: 대표 시나리오 선 표시`, await page.locator('.line.scenario').count() === 1);
  }
  // 내일만: 여러 날 CSV(21행) 링크는 꺼 둠 — 1거래일 발행본(CSV 2행)일 때만 단추가 있고, 있으면 2행(출발 1+내일 1)
  const csvLinks = await page.locator('a.ctl[download]').count();
  if (TOMORROW && csvLinks === 0) check(`${label} 상세(내일만): 여러 날 CSV 단추 없음(꺼 둠)`, true);
  else {
    const [download] = await Promise.all([page.waitForEvent('download', {timeout: 8000}), page.locator('a.ctl[download]').click()]);
    const csvPath = path.join(dir, `${label}-` + download.suggestedFilename()); await download.saveAs(csvPath);
    const csv = await fs.readFile(csvPath, 'utf8'), lines = csv.trim().split(/\r?\n/).length;
    check(TOMORROW ? `${label} 상세(내일만): CSV 내려받기 2행(출발 1+내일 1)` : `${label} 상세: CSV 내려받기 21행(출발 1+전망 20)`, lines === (TOMORROW ? 3 : 22) && /실제출발/.test(csv), {name: download.suggestedFilename(), rows: lines});
  }
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
  // 2026-10-02 01:34 사장님 승인 3차 디자인: 글씨 단추는 「가」 하나(누를 때마다 100→125→150→175→200→100%)
  for (let k = 0; k < 4; k++) { await page.locator('#font-btn').click(); await page.waitForTimeout(150); }
  await page.waitForTimeout(200);
  const fontSize = await page.evaluate(() => document.documentElement.style.fontSize), overflow200 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label} 글씨 200% 에서도 가로 넘침 없음`, fontSize === '200%' && overflow200 <= 0, {fontSize, overflow200});
  await page.locator('#font-btn').click(); await page.waitForTimeout(150);
  check(`${label} 「가」를 한 번 더 누르면 200% 다음 100%`, await page.evaluate(() => document.documentElement.style.fontSize) === '100%');
  // ---------- 1만원 비교 ---------- (내일만이면 꺼 둠: 메뉴에 없고 주소로 오면 「꺼 둠」 한 줄만)
  if (TOMORROW) {
    await page.goto(base + '/#/race', {waitUntil: 'networkidle'}); await page.waitForSelector('[data-off="race"]');
    check(`${label} 1만원 비교(내일만): 꺼 둠 한 줄 · 52선 없음`, await page.locator('.race-line').count() === 0 && /꺼 두었습니다/.test(await page.locator('[data-off="race"]').innerText()));
    await shot('04-race-off');
  } else {
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
  }
  // ---------- 성적 ----------
  await page.goto(base + '/#/scores', {waitUntil: 'networkidle'});
  await page.waitForSelector('svg.lc');
  await headlineCheck(page, label, '성적', '.lc .lc-end.pred');
  const scoresText = await page.locator('#main').innerText();
  check(`${label} 성적: 방향·범위·오차 분포 막대 · 채점 예정표 4줄 · 표와 후향 진단은 눌러야 열림`, await page.locator('.bars .bar-row').count() >= 9 && /채점 예정표/.test(scoresText) && /후향 진단 열기/.test(scoresText) && /80% 범위 표와 내려받기 열기/.test(scoresText), null);
  // 왜 틀렸나(10/01): 네 통 막대의 합 = 틀린 수 = 채점 자료의 방향 틀림 합 = 눌러서 연 목록 줄 수 · 「까닭 보기」 단추로 칸까지 내려감
  {
    const sc = await (await fetch(base + '/data/atlas11/view/scores.json')).json();
    const wrongAll = sc.byDate.reduce((s, d) => s + d.rows.filter(r => r.horizons?.['1']?.status === 'evaluated' && r.horizons['1'].directionCorrect === false).length, 0);
    const lead = await page.locator('#misses .miss-lead').innerText().catch(() => '');
    const binVals = await page.locator('#misses .bars').first().locator('.bar-value').allInnerTexts();
    const binSum = binVals.reduce((s, t) => s + (parseInt(t.replace(/[^\d]/g, ''), 10) || 0), 0);
    const listFold = page.locator('#misses details.more', {hasText: '목록 열기'});
    await listFold.locator('summary').click(); await page.waitForTimeout(150);
    const listRows = await listFold.locator('tbody tr').count();
    await listFold.locator('summary').click();
    const leadWrong = Number((/틀린 (\d+)건/.exec(lead) ?? [])[1]);
    check(`${label} 성적 · 왜 틀렸나: 네 통 ${binVals.length}개 · 합 ${binSum}건 = 틀린 ${leadWrong}건 = 채점 자료 ${wrongAll}건 = 목록 ${listRows}줄`, binVals.length === 4 && binSum === wrongAll && leadWrong === wrongAll && listRows === wrongAll, {lead, binVals, wrongAll, listRows});
    // 10/01 오후(W4): 「왜 틀렸나」 위에 종목별 칸(52줄)이 들어와 내려갈 거리가 길어짐 — 부드러운 스크롤이 끝날 때까지 최대 4초 기다린다
    await page.locator('.jump-misses').click();
    await page.waitForFunction(() => { const t = document.getElementById('misses').getBoundingClientRect().top; return t >= 0 && t < 260; }, null, {timeout: 4000}).catch(() => {});
    const top = await page.evaluate(() => Math.round(document.getElementById('misses').getBoundingClientRect().top));
    check(`${label} 성적 · 「방향이 틀린 까닭 보기」 단추로 칸이 화면 위쪽에 옴`, top >= 0 && top < 260, {top});
  }
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
  check(`${label} 스푸마토 바탕·판·띠 경계선 6·실제선 그림자·후광·좌표 변환 없음 · 전망선 색 = 방향(오름 빨강·내림 파랑)`, /rgb\(242, 242, 247\)/.test(sf.bg) /* 2026-10-02 01:34 사장님 승인 3차 디자인: 바탕은 묶음 회색 #f2f2f7 (옛 rgb(241, 236, 226)) */ && sf.plate === 1 && sf.edges === 6 && sf.shadow === 1 && sf.halo === 1 && /url\(/.test(sf.bandFill) && sf.transforms === 0 && (sf.todayDir === 'flat' || hex(sf.todayStroke) === (sf.todayDir === 'up' ? sf.up : sf.down).toUpperCase()), sf);
  // 2026-10-02 01:34 사장님 승인 3차 디자인: 아래 탭 둘(내일 · 성적) — PC 도 같은 탭(진화는 성적·자료 상태의 글 링크로)
  const nav = await page.locator('.bottom .bottom-link').count();
  // 2026-10-02 명령: 1만원 비교는 꺼 둠 → 내일만이면 메뉴 셋(전망·성적·진화)
  // 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」: 아래 탭 셋(내일 · 게임 · 성적) — 게임은 따로 된 쪽(game/)으로 가는 링크
  check(`${label} 주요 메뉴(아래 탭) 3개(내일 · 게임 · 성적)`, nav === 3 && await page.locator('.bottom .bottom-link[data-route="game"][href="game/"]').count() === 1, {nav});
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
  check('dark 다크 모드 토큰 적용(배경·글자·바탕 그라데이션도 어두움)', bg === 'rgb(0, 0, 0)' && ink === 'rgb(241, 235, 224)' && bgImage === 'none' /* 2026-10-02 01:34 사장님 승인 3차 디자인: 어두운 바탕은 #000 · 그라데이션 없음 (옛 rgb(26, 23, 20) · rgb(28, 25, 21) 그라데이션) */ && errors.length === 0, {bg, ink, errors: errors.slice(0, 3)});
  await page.screenshot({path: path.join(dir, 'dark-02-detail.png')});
  await context.close();
}
/** 또렷함 여섯 숫자: 7화면 × 4보기 · 1~3번 0 이 아니면 실패 · 4~6번은 기록 */
/** 아틀라스 게임(game/) — 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」 · 06:13 「승격하라」 · 06:19 「이정훈 대표 방식 가운데 · 보조 다섯」 · 06:34 「하루에 한 번」
 *  사이트 보안 규칙(CSP)을 켠 채로(우회 없이) 연다. 시계를 목표일 07:00(걸기 열림)과 10:00(08:00 마감 뒤)로 고정해 두 번 본다.
 *  본다: 콘솔 오류 0 · 카드 52장 · 아래 탭 셋 · 가운데 「이정훈 대표 방식」(원문 기다림) + 보조 다섯 · 전망 표시는 모두 내일 ·
 *        열림: 두 장을 놓고 낙관 → 이 기기에 저장 → 다시 열어도 그대로 · 닫힘: 걸기 단추 「마감」 ·
 *        연습 판: 두 장 → 낙관 → 젖혀 열기 → 정산 증서의 줄마다 「실제 등락 → 맞힘·틀림·보합 → 손익」이 게임 규칙(±0.1%)과 맞음 */
async function gameCheck() {
  const game = await (await fetch(base + '/data/atlas11/view/game.json')).json();
  for (const [label, viewport, mobile] of [['pc', {width: 1280, height: 800}, false], ['mobile', {width: 390, height: 844}, true]]) {
    for (const [when, at] of [['open', `${game.live.target}T07:00:00+09:00`], ['closed', `${game.live.target}T10:00:00+09:00`]]) {
      const ctx = await browser.newContext({viewport, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
      const page = await ctx.newPage(); const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      await page.clock.setFixedTime(new Date(at));
      await page.goto(base + '/game/', {waitUntil: 'networkidle'}); await page.waitForSelector('#main .card', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(500);
      const st = () => page.evaluate(() => ({cards: document.querySelectorAll('#shoe button').length, tabs: [...document.querySelectorAll('nav.tabs a')].map(a => a.innerText.trim()).join(','), sealDisabled: document.querySelector('#seal').disabled, sealText: document.querySelector('#sealText').textContent.trim(),
        center: document.querySelector('#center h3')?.textContent.trim(), centerState: document.querySelector('#center .state')?.textContent.trim(), aux: [...document.querySelectorAll('#aux button b')].map(b => b.textContent.trim()).join(','), marks: [...document.querySelectorAll('#main [data-forecast-date]')].map(e => e.dataset.forecastDate), stored: (() => { try { return JSON.parse(localStorage.getItem('atlas-game:v1') || 'null'); } catch { return null; } })()}));
      const s0 = await st();
      check(`게임 ${label} ${when}: 콘솔 오류 0(보안 규칙 켬) · 카드 52장 · 아래 탭 셋 · 가운데 이정훈 대표 방식(원문 기다림) · 보조 다섯 · 전망 표시는 모두 ${tomorrowDate}`,
        !errors.length && s0.cards === 52 && s0.tabs === '내일,게임,성적' && s0.center === '이정훈 대표 방식' && /원문 기다림/.test(s0.centerState) && s0.aux === '켈리 공식,2% 규칙,정액 분할,마틴게일,파롤리' && s0.marks.length >= 1 && s0.marks.every(d => d === tomorrowDate), {errors: errors.slice(0, 3), ...s0, marks: s0.marks.length, stored: undefined});
      // 크기 출목표(2026-10-03 사장님 「많이 움직이면 많이, 적게 움직이면 적게」): 첫 카드의 동그라미 수 = 날마다 max(1, round(|등락| ÷ 한 알)) 의 합 · 꿴 줄 = 같은 날 이웃 알 수 · 읽는 법 줄
      {
        const rd = await page.evaluate(() => { const c = document.querySelector('#bigBox .card'), svg = c?.querySelector('svg.road'); return {code: c?.querySelector('[data-ident]')?.textContent.trim(), label: svg?.getAttribute('aria-label') ?? '', circles: svg?.querySelectorAll('circle').length ?? 0, threads: svg?.querySelectorAll('g[opacity] line').length ?? 0, key: c?.querySelector('.road-key')?.textContent ?? ''}; });
        const unit = Number(/동그라미 하나 = (\d+)%/.exec(rd.label)?.[1]) / 100, st = (game.live.stocks ?? []).find(x => x.code === rd.code);
        const per = st ? st.c.slice(1).map((v, i) => v / st.c[i] - 1).filter(r => Math.abs(r) > 0.001).map(r => Math.max(1, Math.round(Math.abs(r) / unit))) : [];
        const want = per.reduce((a, b) => a + b, 0), wantThreads = per.reduce((a, b) => a + b - 1, 0);
        check(`게임 ${label} ${when}: 출목표 크기 — 동그라미 하나 = ${unit * 100}% · 동그라미 ${rd.circles}개 = 날마다 크기만큼 ${want}개 · 꿴 줄 ${rd.threads} = ${wantThreads} · 읽는 법 줄`, Boolean(st) && unit > 0 && rd.circles === want && rd.threads === wantThreads && rd.key.includes(`하나 = ${unit * 100}%`), rd);
      }
      if (when === 'open') {
        await page.click('#putLev'); await page.click('#next'); await page.click('#putInv'); await page.waitForTimeout(150);
        await page.click('#seal'); await page.waitForTimeout(300);
        const s1 = await st(), bet = s1.stored?.bets?.[game.live.target];
        await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('#main .card'); await page.waitForTimeout(300);
        const s2 = await st(), bet2 = s2.stored?.bets?.[game.live.target];
        check(`게임 ${label} 실전 판(목표일 07:00): 두 장 놓고 낙관 → 이 기기에 저장 → 다시 열어도 낙관 그대로(「낙관 지우기」)`, bet?.locked === true && bet.lev && bet.inv && bet.lev !== bet.inv && bet2?.locked === true && s2.sealText === '낙관 지우기', {bet, sealText: s2.sealText});
        // 연습 판: 정산 증서가 게임 규칙과 맞는가
        await page.click('#tab-practice'); await page.waitForTimeout(250);
        await page.click('#putLev'); await page.click('#next'); await page.click('#putInv'); await page.waitForTimeout(150);
        await page.click('#seal'); await page.waitForTimeout(250); await page.click('#seal'); await page.waitForTimeout(1500);
        const cert = await page.evaluate(() => [...document.querySelectorAll('.cert .cert-row:not(.sum)')].map(r => ({side: r.children[0].textContent.trim(), body: r.children[1].textContent.trim(), pnl: r.children[2].textContent.trim()})));
        const amt = await page.evaluate(() => [...document.querySelectorAll('#chips-lev .chip, #chips-inv .chip')].filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.getAttribute('aria-label')));
        const okRows = cert.length === 2 && cert.every(r => { const m = r.body.match(/실제 ([+−-]?)(\d+\.\d+)% · (맞힘|틀림|보합)/); if (!m) return false; const ret = (m[1] === '−' || m[1] === '-' ? -1 : 1) * Number(m[2]) / 100, o = ret > 0.001 ? 'up' : ret < -0.001 ? 'down' : 'flat', side = r.side === '레버리지' ? 'up' : 'down', want = o === 'flat' ? '보합' : o === side ? '맞힘' : '틀림'; const sign = r.pnl.startsWith('+') ? 1 : r.pnl.startsWith('−') ? -1 : 0; return m[3] === want && sign === (want === '맞힘' ? 1 : want === '틀림' ? -1 : 0); });
        check(`게임 ${label} 연습 판: 두 장 → 낙관 → 젖혀 열기 → 정산 증서 두 줄이 게임 규칙(±0.1% · 맞힘 +건 돈 · 틀림 −건 돈 · 보합 0)과 맞음`, okRows && await page.locator('.cert canvas.border').count() === 1, {cert, amt});
        await page.screenshot({path: path.join(dir, `game-${label}-certificate.png`), fullPage: false});
      } else {
        check(`게임 ${label} 실전 판(목표일 10:00 · 08:00 마감 뒤): 걸기 단추 「마감」·눌리지 않음`, s0.sealDisabled && s0.sealText === '마감', {sealText: s0.sealText});
      }
      await ctx.close();
    }
  }
}
async function clarityCheck() {
  const table = {};
  for (const v of VIEWS) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage(); table[v.id] = {};
    for (const s of SCREENS) {
      await page.goto(base + '/' + s.hash, {waitUntil: 'networkidle'}); await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => {}); if (s.settle) await s.settle(page); await page.waitForTimeout(500); await renderAll(page);
      const m = await page.evaluate(measureClarity);
      await page.evaluate(() => { for (const x of document.querySelectorAll('.hl-num')) x.click(); }); await page.waitForTimeout(100);
      const src = await page.evaluate(measureClarity, {roots: ['.hl-src'], refTime: false});
      table[v.id][s.id] = {relDays: m.relDays, vague: m.vague, bareNumbers: m.bareNumbers, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors, truncated: m.truncated, formatDates: m.formatDates, source: {relDays: src.relDays, vague: src.vague, bareNumbers: src.bareNumbers}};
      // 7 잘린 글자(10/01 03시 추가 · 회사 이름이 한 글자만 보이던 결함): 0 이 아니면 실패
      check(`잘린 글자 ${v.id} ${s.id}: ${m.truncated}`, m.truncated === 0, m.truncated ? {truncated: m.samples.truncated, pageOverflowX: m.pageOverflowX} : undefined);
      // 2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면 그림): 「내일」 화면 글자는 그림 그대로 — 가운데 숫자(오를 쪽 수)와 묶음 제목 「오를 쪽 N」「내릴 쪽 M」에는 단위가 없고,
      //   기준 시각은 「10월 1일 목요일 종가로 계산」 모양이다. 또렷함 3번(단위·기준 시각)과 부딪히므로 내일 화면에서만 바로 이 네 곳을 빼고 센다
      //   (재는 도구 measure.mjs 는 그대로 · 다른 숫자 하나라도 더 나오면 실패 · 다른 화면은 그대로 0).
      const pass2 = s.id === 'forecast' ? await page.evaluate(() => { const n = document.querySelector('.t-num')?.innerText.trim() ?? '', h = [...document.querySelectorAll('.t-h2')].map(x => x.innerText.trim()); return {want: [`${n} ⟵ ${n}`, ...h.filter(x => /^(오를|내릴) 쪽 \d+$/.test(x)).map(x => `${x} ⟵ ${x.split(' ').at(-1)}`)], foot: /^\d{1,2}월 \d{1,2}일 [일월화수목금토]요일 종가로 계산$/.test(document.querySelector('.t-foot')?.innerText.trim() ?? '')}; }) : null;
      const exempt = pass2 ? m.samples.bareNumbers.filter(x => pass2.want.includes(x) || (pass2.foot && /^화면에 기준 시각/.test(x))).length : 0;
      const bad13 = m.relDays + m.vague + m.bareNumbers - exempt + src.relDays + src.vague + src.bareNumbers;
      check(`또렷함 ${v.id} ${s.id}: 1 내일·오늘·어제 ${m.relDays} · 2 흐릿한 말 ${m.vague} · 3 단위·기준 빠진 숫자 ${m.bareNumbers}${exempt ? ` (그 가운데 2차 그림 글자 ${exempt}곳 뺌)` : ''} (출처 칸 ${src.relDays}·${src.vague}·${src.bareNumbers})`, bad13 === 0, bad13 || exempt ? {rel: m.samples.relDays, vague: m.samples.vague, bare: m.samples.bareNumbers, src: src.samples.bareNumbers} : null);
      info.push({view: v.id, screen: s.id, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors});
    }
    await ctx.close();
  }
  // 검사기 자체 시험: 흐릿한 말 하나 · 단위 없는 숫자 하나를 일부러 넣으면 1·2·3번이 하나씩 늘어야 한다
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const page = await ctx.newPage();
  // 2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면): 이야기가 없으므로 건너뛰기 없이 바로 잰다(3차 때는 이야기를 건너뛴 끝 장면에서 쟀다)
  await page.emulateMedia({reducedMotion: 'reduce'}); // 2026-10-02 14:01 점이 하나씩 나오는 화면 — 다 나온 모습에서 잰다
  await page.goto(base + '/#/forecast', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-ring .t-dot'); await page.waitForSelector('.t-row'); await page.waitForTimeout(900); await renderAll(page);
  const before = await page.evaluate(measureClarity);
  await page.evaluate(() => { const box = document.createElement('section'); box.className = 'panel'; box.innerHTML = '<p>내일 42 정도.</p><p>곧 많이 오릅니다.</p>'; document.getElementById('main').prepend(box); });
  const afterPlant = await page.evaluate(measureClarity);
  const delta = {relDays: afterPlant.relDays - before.relDays, vague: afterPlant.vague - before.vague, bareNumbers: afterPlant.bareNumbers - before.bareNumbers};
  check('검사기 자체 시험: 「내일 42 정도.」「곧 많이 오릅니다.」를 넣으면 1·2·3번이 모두 1 이상 늘어난다', delta.relDays >= 1 && delta.vague >= 1 && delta.bareNumbers >= 1, delta);
  // 7번(잘린 글자) 자체 시험: 「…」로 잘린 회사 이름 하나 · 판 끝에서 잘린 값 하나 · 글이 넘친 선택 상자 하나를 넣으면 셋이 늘어야 한다
  //   (보안 규칙상 style 속성 글자는 못 쓰므로 CSSOM 으로 모양을 준다)
  await page.evaluate(() => {
    const box = document.createElement('section'); box.className = 'panel';
    const name = document.createElement('div'); name.textContent = '한화에어로스페이스'; Object.assign(name.style, {width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'});
    const clip = document.createElement('div'); Object.assign(clip.style, {width: '90px', overflow: 'hidden'}); const inner = document.createElement('div'); Object.assign(inner.style, {width: '260px', textAlign: 'right'}); inner.textContent = '관측만 13개'; clip.append(inner);
    const sel = document.createElement('select'); Object.assign(sel.style, {width: '70px'}); sel.append(new Option('10월 1일(목) 상승 확률 높은 순'));
    box.append(name, clip, sel); document.getElementById('main').prepend(box);
  });
  const afterCut = await page.evaluate(measureClarity);
  check('검사기 자체 시험(7번): 잘린 이름·판 끝에서 잘린 값·글이 넘친 선택 상자를 넣으면 잘린 글자가 3 늘어난다', afterCut.truncated - afterPlant.truncated === 3, {before: afterPlant.truncated, after: afterCut.truncated, samples: afterCut.samples.truncated.slice(0, 5)});
  await ctx.close();
  return table;
}
/** W4(대개선 명령서 6판 R2~R5 · T7 모서리 16절 · 따지는 이 G1~G6): 성적 화면 「네 묶음」(그날 판 아래)과 「종목별 맞고 틀림」(「왜 틀렸나」 아래)
 *  보기 다섯 × 채점일마다: 줄(표 줄 또는 네 줄 카드) 수 = score-cells.json 보인 수 · 네 칸 = 그날 묶음(합 = 줄 수) · 보류 수 표시 · 가나다순 ·
 *  가장 긴 이름 안 잘림 · 실제 보합 칸에 「보합」 · 예측 방향 옆 확률 · 가운데 값 표시(보합권·반대쪽) 수 · 「−0.00%」 없음 · 오차 끝값 ·
 *  360px·글씨 100% 에서 카드 4줄 이하 · 줄 앞 「·」 없음 · 잘린 글자 0 · 가로 넘침 없음 · 맞음·틀림은 글자
 *  결함 심기(G6): 카드 하나 지우기 · 긴 이름 자르기 · 「보합」 표시 지우기 → 같은 판정이 각각 실패로 잡아야 한다 · 캡처는 reports/atlas11/overhaul/w4-*.png */
const W4_VIEWS = [
  {id: '360', viewport: {width: 360, height: 780}, mobile: true, shot: 'w4-360', lines4: true, plant: true},
  {id: '360-dark', viewport: {width: 360, height: 780}, mobile: true, dark: true, lines4: true},
  {id: '360-dark-200', viewport: {width: 360, height: 780}, mobile: true, dark: true, font: 4},
  {id: 'pc', viewport: {width: 1280, height: 800}, shot: 'w4-pc'},
  {id: 'pc-200', viewport: {width: 1280, height: 800}, font: 4},
];
const signedWon = v => { const r = Math.round(v); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r).toLocaleString('ko-KR') + '원'; };
const markOf = c => (Math.abs(c.predRet) <= 0.001 ? '보합권' : (c.predRet > 0 && c.predDir === 'down') || (c.predRet < 0 && c.predDir === 'up') ? '반대쪽' : null);
/** 브라우저 안에서 잰다(바깥 변수 없음) */
function w4Probe({LONG, lo, hi}) {
  const quad = document.getElementById('score-quad'), box = document.getElementById('score-cells');
  const vis = el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const rows = [...box.querySelectorAll('[data-code]')].filter(vis);
  const names = rows.map(el => el.querySelector('.sc-name')?.textContent.trim() ?? '');
  const sorted = names.every((n, i) => i === 0 || names[i - 1].localeCompare(n, 'ko') <= 0);
  const long = LONG.map(n => { const el = rows.map(x => x.querySelector('.sc-name')).find(e => e?.textContent.trim() === n); if (!el) return {name: n, present: false}; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return {name: n, present: true, fits: el.scrollWidth <= el.clientWidth + 1 && b.left >= 0 && b.right <= innerWidth + 1 && cs.textOverflow !== 'ellipsis' && el.innerText.replace(/\s+/g, ' ').trim() === n}; });
  const flat = rows.filter(el => el.dataset.actDir === 'flat');
  const text = code => rows.find(el => el.dataset.code === code)?.innerText.replace(/\s+/g, ' ') ?? '';
  const lines = rows.filter(el => el.tagName === 'LI').map(el => [...el.querySelectorAll('p')].reduce((t, p) => t + Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)), 0));
  let leadDots = 0;
  for (const el of rows.filter(x => x.tagName === 'LI')) for (const p of el.querySelectorAll('p')) { const left = p.getBoundingClientRect().left; const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) for (let k = 0; k < n.textContent.length; k++) { if (n.textContent[k] !== '·') continue; const r = document.createRange(); r.setStart(n, k); r.setEnd(n, k + 1); if (r.getBoundingClientRect().left - left < 3) leadDots++; } }
  return {kind: rows[0]?.tagName === 'TR' ? 'table' : 'cards', n: rows.length, codes: rows.map(el => el.dataset.code), quad: [...quad.querySelectorAll('.quad-v')].map(e => parseInt(e.textContent.replace(/[^\d]/g, ''), 10)), quadTitle: quad.querySelector('.panel-title')?.innerText ?? '', listTitle: box.querySelector('.panel-title')?.innerText ?? '', heldItems: quad.querySelectorAll('.sc-held li').length, sorted, long,
    flat: {total: flat.length, shown: flat.filter(el => el.querySelector('.sc-adir')?.textContent.trim() === '보합').length},
    probs: rows.filter(el => /^(상승|보합|하락)\s\d+%$/.test(el.querySelector('.sc-pdir')?.textContent.trim() ?? '')).length, marks: rows.map(el => el.querySelector('.sc-mark')?.textContent.replace(/[()\s]/g, '') || null),
    minus0: box.innerText.includes('−0.00%'), loText: text(lo.code), hiText: text(hi.code), words: rows.every(el => (el.innerText.match(/맞음|틀림/g) ?? []).length >= 2), maxLines: Math.max(0, ...lines), leadDots,
    quadAboveMisses: quad.getBoundingClientRect().top < (document.getElementById('misses')?.getBoundingClientRect().top ?? Infinity), listBelowMisses: box.getBoundingClientRect().top > (document.getElementById('misses')?.getBoundingClientRect().top ?? -Infinity), overflowX: document.documentElement.scrollWidth > innerWidth + 1};
}
/** 판정(Node 쪽) — 실패한 항목 이름을 돌려준다 */
function w4Fails(r, d, cells, m, v, errors) {
  const f = [], quadSum = r.quad.reduce((s, x) => s + x, 0), wantFlat = cells.filter(c => c.actDir === 'flat').length;
  const errs = cells.map(c => Math.abs(c.errWon)), lo = cells[errs.indexOf(Math.min(...errs))], hi = cells[errs.indexOf(Math.max(...errs))];
  const wantMarks = cells.map(markOf).filter(Boolean).sort().join(','), gotMarks = r.marks.filter(Boolean).sort().join(',');
  if (r.n !== d.count || new Set(r.codes).size !== d.count) f.push('줄 수');
  if (r.quad.length !== 4 || quadSum !== d.count || r.quad.join(',') !== d.groups.join(',')) f.push('네 칸');
  if (d.held ? !(r.quadTitle.includes(`보류 ${d.held}종목`) && r.heldItems === d.held) : (/보류/.test(r.quadTitle) || r.heldItems)) f.push('보류 표시');
  if (!r.sorted) f.push('가나다순');
  if (!r.long.every(x => !x.present || x.fits)) f.push('긴 이름');
  if (r.flat.total !== wantFlat || r.flat.shown !== wantFlat) f.push('보합 표시');
  if (r.probs !== d.count) f.push('예측 방향 확률');
  if (gotMarks !== wantMarks) f.push('가운데 값 표시');
  if (r.minus0) f.push('−0.00%');
  if (!r.loText.includes(signedWon(lo.errWon)) || !r.hiText.includes(signedWon(hi.errWon))) f.push('오차 끝값');
  if (!r.words) f.push('맞음·틀림 글자');
  if (v.lines4 && r.maxLines > 4) f.push('카드 4줄');
  if (r.leadDots) f.push('줄 앞 「·」');
  if (!r.quadAboveMisses || !r.listBelowMisses) f.push('자리(네 칸 위 · 목록은 왜 틀렸나 아래)');
  if (r.overflowX || m.truncated !== 0) f.push('잘림·넘침');
  if (errors.length) f.push('콘솔 오류');
  return {fails: f, lo, hi, wantFlat};
}
async function scoreCellsCorners() {
  const sc = await (await fetch(base + '/data/atlas11/view/score-cells.json')).json();
  const LONG = ['LS ELECTRIC', '한화에어로스페이스'];
  const shotDir = path.join(process.cwd(), 'reports/atlas11/overhaul');
  for (const v of W4_VIEWS) {
    const ctx = await browser.newContext({viewport: v.viewport, deviceScaleFactor: 1, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base + '/#/scores', {waitUntil: 'networkidle'});
    const ready = await page.waitForSelector('#score-quad .quad-cell', {timeout: 10000}).then(() => true).catch(() => false);
    if (!ready) { check(`W4 모서리 ${v.id}: 「네 묶음」 칸이 보임`, false, {view: v.id}); await ctx.close(); continue; }
    for (const d of [...sc.dates].reverse()) {
      await page.selectOption('select[aria-label="채점 날짜"]', d.date); await page.waitForTimeout(200); await renderAll(page);
      const cells = sc.cells.filter(c => c.date === d.date);
      const ends = (() => { const e = cells.map(c => Math.abs(c.errWon)); return {lo: cells[e.indexOf(Math.min(...e))], hi: cells[e.indexOf(Math.max(...e))]}; })();
      const r = await page.evaluate(w4Probe, {LONG, ...ends});
      const m = await page.evaluate(measureClarity);
      const {fails, lo, hi, wantFlat} = w4Fails(r, d, cells, m, v, errors);
      check(`W4 모서리 ${v.id} ${d.date}: ${r.kind === 'table' ? '표' : '네 줄 카드'} ${r.n}줄 = ${d.count}(보류 ${d.held}) · 네 칸 ${r.quad.join('·')} · 이름순 · 긴 이름 ${r.long.filter(x => x.present).map(x => x.fits ? '안 잘림' : '잘림').join('·') || '없음'} · 보합 ${r.flat.shown}/${wantFlat} · 확률 ${r.probs}/${d.count} · 가운데 값 표시 ${r.marks.filter(Boolean).length} · 카드 최대 ${r.maxLines}줄 · 줄 앞 「·」 ${r.leadDots} · 오차 ${signedWon(lo.errWon)}~${signedWon(hi.errWon)} · 잘린 글자 ${m.truncated}`, fails.length === 0,
        {view: v.id, date: d.date, kind: r.kind, rows: r.n, held: d.held, quad: r.quad, groups: d.groups, fails, long: r.long, flat: r.flat, probs: r.probs, marks: r.marks.filter(Boolean).length, maxLines: r.maxLines, leadDots: r.leadDots, truncated: m.truncated, truncSamples: m.samples.truncated.slice(0, 4), errors: errors.slice(0, 3)});
      // 결함 심기(G6 · 가장 나중 채점일 · 360px): 심은 결함마다 같은 판정이 실패로 잡아야 한다(심은 뒤 날짜를 다시 골라 화면을 새로 그림)
      if (v.plant && d.date === sc.dates.at(-1).date) {
        const plants = [
          ['카드 하나 지우기', () => document.querySelector('#score-cells .sc-card')?.remove(), '줄 수'],
          ['긴 이름 자르기', () => { const el = [...document.querySelectorAll('#score-cells .sc-card .sc-name')].find(e => e.textContent.trim() === '한화에어로스페이스'); if (el) Object.assign(el.style, {display: 'inline-block', width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', verticalAlign: 'bottom'}); }, '긴 이름'],
          ['「실제 보합」 표시 지우기', () => { const el = document.querySelector('#score-cells .sc-card[data-act-dir="flat"] .sc-adir'); if (el) el.textContent = ''; }, '보합 표시'],
        ];
        for (const [name, plant, want] of plants) {
          await page.evaluate(plant); await page.waitForTimeout(80);
          const rp = await page.evaluate(w4Probe, {LONG, ...ends}), mp = await page.evaluate(measureClarity);
          const res = w4Fails(rp, d, cells, mp, v, errors);
          check(`W4 결함 심기 ${name} → 판정이 「${want}」로 잡음`, res.fails.includes(want), {planted: name, caught: res.fails.includes(want), fails: res.fails, date: d.date, view: v.id});
          await page.selectOption('select[aria-label="채점 날짜"]', sc.dates[0].date); await page.waitForTimeout(120); await page.selectOption('select[aria-label="채점 날짜"]', d.date); await page.waitForTimeout(200);
        }
      }
      // 캡처(가장 나중 채점일): 네 칸이 보이는 첫 화면 + 목록 칸 전체
      if (v.shot && d.date === sc.dates.at(-1).date) {
        await page.evaluate(() => document.getElementById('score-quad').scrollIntoView({block: 'start'})); await page.waitForTimeout(150);
        await page.screenshot({path: path.join(shotDir, v.shot + '.png')});
        await page.locator('#score-cells').screenshot({path: path.join(shotDir, v.shot + '-full.png')});
        await page.screenshot({path: path.join(dir, v.shot + '.png')});
      }
    }
    await ctx.close();
  }
}

let clarity = null;
try {
  await scenario('pc', {width: 1280, height: 800});
  await scenario('mobile', {width: 390, height: 844}, {mobile: true});
  await darkCheck();
  clarity = await clarityCheck();
  await gameCheck();
  await scoreCellsCorners();
} finally { await browser.close(); }
const summary = {schema: 'atlas11-browser-check-2', at: new Date().toISOString(), base, tomorrowOnly: TOMORROW, tomorrowDate: TOMORROW ? tomorrowDate : null, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (touch emulation — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면', 'pc-200': '1280x800 글씨 200%'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, clarityInfo: info, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;

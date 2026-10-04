/**
 * ATLAS 11 · 실제 브라우저 조작 검사 — 36칸 판(예측 없음 · 업종 36개 × 5곳 = 180곳)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면 · 두 번이면 어디든
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8823 --pw <playwright 폴더>
 * 보는 것(PC 1280×800 · 휴대폰 390×844 터치 흉내 — 실제 아이폰 기기 검증 아님)
 *   처음 화면: 제목 「요즘 불장 N」 = 판의 불장 수 · 기간(가장 많은 회사의 첫날~끝날) · 업종 칸 = 판의 업종 차례 그대로(이름 · n위 · 지난 20거래일 평균 · 몇 곳 올랐나 · 칸 색 범위) ·
 *         「불장」 = 판의 불장 업종(1위부터 빈틈없이) · 색 보기표 6칸(칸 색과 같은 색) · 다음 불장 후보 = 판 · 칸을 누르면 그 업종 화면
 *   업종 화면 36장 모두: 머리(n칸 가운데 n위 · 불장 · 평균 · 몇 곳 올랐나) · 「누가 끌었나」 막대(차례 · 값 · 방향 · 길이) · 카드(합쳐서 180장 = 판 · 겹침 없음 · 종가 · 날짜 · 출목표 · 일정·공시 줄) ·
 *         앞날 말 없음 · 옆으로 넘치지 않음 · 회사 화면 「‹ 업종」 → 그 업종 · 없는 업종 주소 → 알림
 *   출목표 한 판(#/road · 2026-10-04 22:12): 업종별(처음) = 36칸 판 차례 · 흐름별 = 아홉 칸 표 흐름마다 · 칸 180개 모두(이름 · 변화 · 선 그래프 · 출목표 동그라미 · n일째 · 업종 · 수급 · 기사) = 따로 센 값 ·
 *         흐름 줄 → 그 묶음 · 칸 → 회사 → 「‹ 출목표」 → 보던 자리·고른 묶음 그대로 · 탭을 다시 누르면 맨 위
 *   회사: 이름 · 종가 · 지난 60거래일 그래프 마지막 날짜 · 지난 1년 숫자 · 일정·공시 모두 · 수급·기사·공시 기록(눌러 열기)
 *   일정: 시장 일정 수 · 회사·업종 일정(같은 일정은 한 줄) 수 · 예고 공시 수 · ★★★ 공시 수
 *   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records · #/game) → 처음 화면
 *   앞날 말 없음: 화면 글(공식 이름 data-ident 는 따로)에 전망·예측·확률·오를 쪽·내릴 쪽·목표가·추천 … 이 없어야 · 예측 표시(data-forecast-date) 0
 *   콘솔 오류 0 · 요청 실패 0 · 무결성(판 목록 SHA-256) · 어두운 화면
 *   또렷함(화면 6 × 보기 5): 1 내일·오늘·어제 · 2 흐릿한 말 · 3 단위·기준 빠진 숫자 · 5 대비 · 7 잘린 글자 — 0 이 아니면 실패 · 검사기 자체 시험
 * 결과: reports/atlas11/browser/<시각>/report.json + 화면 사진
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';
import {SCREENS, VIEWS, renderAll, screenHash} from './clarity_check.mjs';
import {roadOf, STORY} from '../../site/app/road.js';
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
const p1 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(1) + '%';
/** 가장 많은 값(같으면 늦은 날) — 화면의 기간 글과 따로 셈 */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 칸 색 범위(보기표: −8% 아래 · −3% 아래 · −3%~+3% · +3% 이상 · +8% 이상 · +15% 이상) — 화면 코드와 따로 적어 맞대 봄 */
const heatWant = v => !Number.isFinite(v) ? 'na' : v >= 0.15 ? 'h3' : v >= 0.08 ? 'h2' : v >= 0.03 ? 'h1' : v > -0.03 ? 'n' : v > -0.08 ? 'c1' : 'c2';
const upWant = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';
/** 출목표 한 판 — 화면 코드와 따로 적은 흐름 규칙(road.js 아홉 칸 표 · 둘 다 잠잠하면 「거의 안 움직임」) · 지금 몇 일째 */
const calmW = x => x === 'still' ? 'flat' : x;
const flowWant = r => r.before.side === 'still' && r.now.side === 'still' ? 'still' : `${calmW(r.before.side)}-${calmW(r.now.side)}`;
const FLOW_ORDER_W = ['up-up', 'flat-up', 'down-up', 'up-flat', 'flat-flat', 'still', 'down-flat', 'up-down', 'flat-down', 'down-down'];
const flowTextW = k => k === 'still' ? `${roadOf(board.companies[0].c).days}거래일 내내 거의 안 움직임` : STORY[k.split('-')[0]][k.split('-')[1]];
const streakWant = r => r.streak.side ? `${r.streak.side === 'up' ? '오름' : '내림'} ${r.streak.len}일째` : '움직임 없음';
/** 선 그래프 · 수급 · 기사(2026-10-04 22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」) — 화면 코드와 따로 적은 규칙 */
const pW = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%';
const retsW = c => c.c.map(v => v / c.c[0] - 1);
const scaleW = cs => { const all = cs.flatMap(retsW); return {lo: Math.min(-0.03, ...all), hi: Math.max(0.03, ...all)}; };
const scaleTextW = sc => `선 그래프 눈금은 이 묶음이 함께 씀(${pW(sc.lo, 0)} ~ ${pW(sc.hi, 0)} · 점선이 첫날 종가)`;
const sharesW = v => { const a = Math.abs(v), sg = v > 0 ? '+' : v < 0 ? '−' : ''; return a >= 1e8 ? `${sg}${(a / 1e8).toFixed(1)}억주` : a >= 1e4 ? `${sg}${Math.round(a / 1e4).toLocaleString('ko-KR')}만주` : `${sg}${a.toLocaleString('ko-KR')}주`; };
const stampW = iso => { const d = new Date(Date.parse(iso) + 9 * 3600e3).toISOString(); return `${kd(d.slice(0, 10))} ${d.slice(11, 16)} KST`; };
/** 칸·카드 하나의 그래프·수급·기사가 판과 같은가(같지 않은 곳의 이름을 돌려줌) */
const briefMisW = (x, c, sc) => {
  const bad = [], b = c.brief, side = c.c.at(-1) > c.c[0] ? 'up' : c.c.at(-1) < c.c[0] ? 'down' : 'flat';
  if (!x.sp || x.sp.n !== c.c.length || x.sp.pts !== c.c.length || x.sp.lo !== sc.lo.toFixed(4) || x.sp.hi !== sc.hi.toFixed(4) || x.sp.side !== side) bad.push('그래프');
  if (b?.flows ? x.fl.join('|') !== `${sharesW(b.flows.foreign)}|${sharesW(b.flows.institution)}` || x.flMiss !== null : x.fl.length || x.flMiss !== (b && !b.missing.includes('수급') ? '수급 자료 없음' : '아직 모으지 않음')) bad.push('수급');
  if (b?.news ? x.nwT !== b.news.title || x.nwH !== `기사 · ${stampW(b.news.publishedAt)} · ${b.news.office ?? '언론사 이름 없음'}` || x.nwMiss !== null
    : x.nwT !== null || x.nwMiss !== (!b || b.missing.includes('기사') ? '아직 모으지 않음' : b.newsCount ? `회사 이름이 든 기사 없음 · 모은 기사 ${b.newsCount}건은 회사 화면에` : '모은 기사 없음')) bad.push('기사');
  return bad;
};
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

  // ① 처음 화면 = 36칸 판(2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」) — 업종 칸 · 「불장」 · 색 보기표 · 다음 불장 후보 · 칸을 누르면 업종 화면
  const N = board.companies.length, G = board.groups.length, HOT = board.hot?.items ?? [], NEXT = board.next?.items ?? [], H = `처음 화면(업종 ${G}칸)`;
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(400);
  await shot('01-home');
  const top = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), kinds: document.querySelector('.b-kinds')?.innerText.trim() ?? null, late: [...document.querySelectorAll('.b-late')].map(e => e.innerText.trim()), strip: document.querySelector('.mstrip')?.innerText.replace(/\s+/g, ' ').trim(),
    active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
    tiles: [...document.querySelectorAll('.t-grid > .t-tile')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), heat: [...a.classList].find(c => c.startsWith('heat-'))?.slice(5) ?? null, bg: getComputedStyle(a).backgroundColor, rank: a.querySelector('.t-rank')?.textContent.trim(), fire: a.querySelector('.t-fire')?.textContent.trim() ?? null, name: a.querySelector('.t-name')?.textContent.trim(), chg: a.querySelector('.t-chg')?.textContent.trim(), up: a.querySelector('.t-up')?.textContent.trim()})),
    legend: [...document.querySelectorAll('.t-legend li')].map(li => ({heat: li.dataset.heat, text: li.textContent.trim(), bg: getComputedStyle(li.querySelector('.t-sw')).backgroundColor})),
    next: [...document.querySelectorAll('.nc-list .nc-row')].map(a => ({href: a.getAttribute('href'), name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim()})),
    cards: document.querySelectorAll('.b-card').length, text52: /(?<!\d)52\s?(종목|곳)|업종 대표/.test(document.body.textContent)}));
  const kindsWant = board.kinds ? [`업종 ${G}개`, `우량주 ${board.kinds.quality ?? 0}곳`, `시대 트렌드 ${board.kinds.trend ?? 0}곳`, board.kinds.profit ? `흑자 ${board.kinds.profit}곳` : null, board.kinds.size ? `채움 ${board.kinds.size}곳` : null].filter(Boolean).join(' · ') : null;
  const fromM = mode(board.companies.map(c => c.cFrom)), toM = mode(board.companies.map(c => c.date));
  check(`${label} ${H}: 제목 「${top.title}」 = 판의 불장 ${HOT.length}개 · 「${top.when}」(가장 많은 회사의 기간) · 아래 탭 ${top.tabs.join('·')}(처음 화면 눌림) · 처음 화면엔 회사 카드 없음 · 옛 「52」 글 없음${board.kinds ? ` · 「${top.kinds}」` : ''}`,
    top.title === `요즘 불장 ${HOT.length}개` && top.when === `${manifest.universeSet.label} 가운데 · 지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)}까지` && top.tabs.join() === `${N}곳,출목표,일정` && top.active === 'home' && top.cards === 0 && !top.text52 && (!board.kinds || top.kinds === kindsWant), {...top, tiles: undefined, next: undefined, legend: undefined});
  const tileMis = board.groups.map((g, i) => { const t = top.tiles[i]; return t && t.id === g.id && t.href === '#/i/' + g.id && t.name === g.label && t.rank === `${i + 1}위` && t.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && t.up === upWant(g) && t.heat === heatWant(g.change20) && (t.fire === '불장') === Boolean(g.hot) ? null : {i, g: g.label, t}; }).filter(Boolean);
  check(`${label} ${H}: 업종 칸 ${top.tiles.length}개 = 판의 업종 ${G}개 · 차례·이름·n위·20거래일 평균·몇 곳 올랐나·칸 색 범위·누르면 갈 주소가 판과 같음`, top.tiles.length === G && !tileMis.length, {tileMis: tileMis.slice(0, 3)});
  const fires = top.tiles.map((t, i) => t.fire ? i : -1).filter(i => i >= 0);
  check(`${label} ${H}: 「불장」 칸 ${fires.length}개 = 판의 불장 ${HOT.length}개 · 1위부터 빈틈없이 · 판의 불장 목록과 같은 업종 · 모두 오른 업종 · 큰 순`, fires.length === HOT.length && fires.every((x, i) => x === i) && HOT.every((x, i) => top.tiles[i]?.id === x.id && x.change20 > 0 && (!i || HOT[i - 1].change20 >= x.change20)), {fires});
  // 칸 색: 같은 범위 = 같은 색 · 다른 범위 = 다른 색 · 보기표 6칸의 그 범위 색과 같음
  const bgOf = {}; for (const t of top.tiles) (bgOf[t.heat] ??= new Set()).add(t.bg);
  const legendOk = top.legend.map(l => l.heat + ':' + l.text).join('|') === 'c2:−8% 아래|c1:−3% 아래|n:−3%~+3%|h1:+3% 이상|h2:+8% 이상|h3:+15% 이상' && new Set(top.legend.map(l => l.bg)).size === 6;
  const colorOk = Object.entries(bgOf).filter(([k]) => k !== 'na').every(([k, s]) => s.size === 1 && top.legend.find(l => l.heat === k)?.bg === [...s][0]);
  check(`${label} ${H}: 칸 색 보기표 6칸(범위 글 · 색 6가지) · 칸 색 = 보기표의 같은 범위 색(이번 판에 쓰인 범위 ${Object.keys(bgOf).join('·')})`, legendOk && colorOk, {legend: top.legend.map(l => `${l.heat} ${l.bg}`), bgOf: Object.fromEntries(Object.entries(bgOf).map(([k, s]) => [k, [...s]]))});
  check(`${label} ${H}: 다음 불장 후보 ${top.next.length}곳 = 판(${NEXT.length}) · 이름·업종·20거래일 변화·회사 화면 링크가 판과 같음 · 불장 업종 회사 없음 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지`, board.next && top.next.length === NEXT.length && NEXT.every((x, i) => top.next[i]?.href === '#/stock/' + x.code && top.next[i]?.name === x.name && top.next[i]?.ind === x.groupLabel && top.next[i]?.chg === p1(x.change20)) && !NEXT.some(x => HOT.some(hh => hh.id === x.groupId)) && Object.values(NEXT.reduce((m, x) => (m[x.groupId] = (m[x.groupId] ?? 0) + 1, m), {})).every(v => v <= (board.next.perIndustry ?? 2)), {next: top.next.slice(0, 3)});
  check(`${label} ${H}: 늦은 종가 표시 ${top.late.length}줄 = 판의 늦은 회사 ${board.late.length}곳`, top.late.length === board.late.length && board.late.every((c, i) => top.late[i]?.startsWith(c.name + ': ' + kd(c.date))), top.late);
  check(`${label} ${H}: 시장 띠(코스피·코스닥 · 기준 날짜)`, manifest.market ? manifest.market.items.every(i => top.strip.includes(i.name)) && top.strip.includes(kd(manifest.market.items[0].date) + ' 15:30 KST 종가') : /시장 지수 없음/.test(top.strip), {strip: top.strip});
  await wordsCheck(page, `${label} ${H}`);
  // 칸 누르기(휴대폰은 터치) — 셋째 불장 칸 → 그 업종 화면
  const hg = HOT[2] ?? board.groups[0];
  const tileLoc = page.locator(`.t-tile[data-group="${hg.id}"]`); await tileLoc.scrollIntoViewIfNeeded();
  if (mobile) await tileLoc.tap(); else await tileLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card .road`); await page.waitForTimeout(300);
  await shot('02-industry');
  const ij = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim()}));
  check(`${label} ${H}: 「${hg.label}」 칸 ${mobile ? '터치' : '누름'} → 업종 화면 #/i/${hg.id}(제목 「${ij.title}」)`, ij.hash === '#/i/' + hg.id && ij.title === hg.label, ij);

  // ①-2 업종 화면 36장 모두 — 머리 · 「누가 끌었나」 막대 · 카드(합쳐서 180장 = 판) · 앞날 말 · 화면 폭
  const byCodeB = new Map(board.companies.map(c => [c.code, c])), KIND = {quality: '우량', trend: '트렌드', profit: '흑자', size: '채움'};
  const seen = new Map(), headMis = [], barMis = [], cardMis = [], agMis = [], wordsBad = [], overflow = [], briefMis = []; let cardsTotal = 0;
  for (const [k, g] of board.groups.entries()) {
    await page.evaluate(id => { location.hash = '#/i/' + id; }, g.id);
    await page.waitForSelector(`article.i-page[data-group="${g.id}"] .b-card .road`); await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const art = document.querySelector('article.i-page'), back = art.querySelector('.c-back');
      return {rank: art.querySelector('.i-rank')?.firstChild?.textContent.trim(), fire: art.querySelector('.i-rank .t-fire')?.textContent.trim() ?? null, title: art.querySelector('.b-title')?.textContent.trim(), chg: art.querySelector('.b-when .chg20')?.textContent.trim(), when: art.querySelector('.b-when')?.textContent.trim(), back: [back?.getAttribute('href'), back?.textContent.trim()],
        bars: [...art.querySelectorAll('.mv-row')].map(li => { const bar = li.querySelector('.mv-bar'); return {code: li.dataset.code, name: li.querySelector('.mv-name')?.textContent.trim(), href: li.querySelector('.mv-name')?.getAttribute('href'), val: li.querySelector('.mv-val')?.textContent.trim(), w: parseFloat(bar.style.width), left: bar.style.left, right: bar.style.right}; }),
        /* 화면 밖 카드는 그리기를 미루므로(content-visibility) innerText 대신 textContent */
        cards: [...art.querySelectorAll('.b-card')].map(c => ({code: c.dataset.code, name: c.querySelector('.b-name')?.textContent.trim(), kind: c.querySelector('.b-kind')?.textContent.trim() ?? null, price: c.querySelector('.b-close')?.textContent.trim(), date: c.querySelector('.b-date')?.textContent.trim(), beads: c.querySelectorAll('.road .bead').length, up: c.querySelectorAll('.road .bead.up').length, ev: c.querySelectorAll('.ag-ev .ag-li').length, ds: c.querySelectorAll('.ag-ds .ag-li').length, href: c.querySelector('.b-name-row')?.getAttribute('href'), sp: (() => { const sp = c.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...c.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: c.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: c.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: c.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: c.querySelector('.nw-miss')?.textContent.trim() ?? null})),
        scaleNote: [...art.querySelectorAll('.t-sub')].map(p => p.textContent.trim()).find(t => t.startsWith('선 그래프 눈금')) ?? null,
        sw: document.documentElement.scrollWidth, iw: innerWidth};
    });
    if (!(r.title === g.label && r.rank === `${G}칸 가운데 ${k + 1}위` && (r.fire === '불장') === Boolean(g.hot) && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.when.endsWith(` · ${upWant(g)}`) && r.back[0] === '#/' && r.back[1] === `‹ 요즘 불장 ${HOT.length}개`)) headMis.push({g: g.label, r: {...r, bars: undefined, cards: undefined}});
    const cs = g.codes.map(code => byCodeB.get(code)), max = Math.max(0.01, ...cs.map(c => Math.abs(c.change20)).filter(Number.isFinite));
    if (r.bars.map(b => b.code).join() !== g.codes.join() || cs.some((c, i) => { const b = r.bars[i], v = c.change20; return b.name !== c.name || b.href !== '#/stock/' + c.code || b.val !== p1(v) || Math.abs(b.w - Math.max(1.5, Math.abs(v) / max * 50)) > 0.01 || (v < 0 ? b.right !== '50%' : b.left !== '50%'); })) barMis.push({g: g.label, bars: r.bars});
    if (r.cards.map(c => c.code).join() !== g.codes.join()) cardMis.push({g: g.label, order: r.cards.map(c => c.code)});
    for (const hc of r.cards) {
      cardsTotal++; seen.set(hc.code, (seen.get(hc.code) ?? 0) + 1);
      const c = byCodeB.get(hc.code), road = c && roadOf(c.c), e = agenda.byCode[hc.code];
      if (!c || hc.name !== c.name || hc.kind !== (KIND[c.kind] ?? null) || hc.price !== won(c.close) || hc.date !== `${kd(c.date)} 15:30 종가` || hc.beads !== road.cells.length || hc.up !== road.all.up || hc.href !== '#/stock/' + c.code) cardMis.push({g: g.label, code: hc.code});
      if (c) { const bm = briefMisW(hc, c, scaleW(cs)); if (bm.length) briefMis.push({g: g.label, code: hc.code, bad: bm}); }
      if (hc.ev !== Math.min(2, e.upcoming.length) || hc.ds !== Math.min(2, e.disclosures.length)) agMis.push(hc.code);
    }
    if (r.scaleNote !== scaleTextW(scaleW(cs))) briefMis.push({g: g.label, scaleNote: r.scaleNote});
    if (r.sw > r.iw) overflow.push({g: g.label, sw: r.sw, iw: r.iw});
    const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? [], t.idents.filter(x => PREDICTION_WORDS.test(x)));
    if (bad.length || t.marks) wordsBad.push({g: g.label, bad: bad.slice(0, 3), marks: t.marks});
  }
  check(`${label} 업종 화면 ${G}장 모두: 제목·「${G}칸 가운데 n위」·「불장」 표시·지난 20거래일 평균·몇 곳 올랐나·「‹ 요즘 불장 ${HOT.length}개」 = 판`, !headMis.length, {headMis: headMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 「누가 끌었나」 막대 = 그 업종 회사 · 차례·이름·값·회사 화면 링크 · 방향(오름은 0 오른쪽 · 내림은 0 왼쪽) · 길이(가장 큰 값이 반 폭)`, !barMis.length, {barMis: barMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 카드 합 ${cardsTotal}장 · 서로 다른 회사 ${seen.size}곳 = 판 ${N}곳(겹침 없음) · 업종마다 판의 차례 · 이름·표시·종가·날짜·출목표 동그라미 수(빨강 포함)·회사 화면 링크가 판과 같음`, cardsTotal === N && seen.size === N && [...seen.values()].every(v => v === 1) && !cardMis.length, {cardMis: cardMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 카드마다 일정·공시 줄 수(각 2줄까지) = 일정표`, !agMis.length, {agMis: agMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 카드마다 선 그래프(종가 ${board.companies[0].c.length}개 · 5곳 같은 눈금 · 오름/내림 색) · 수급(외국인·기관 5거래일 합) · 회사 이름이 든 최근 기사(시각·언론사·제목) = 판(없으면 「아직 모으지 않음」)`, !briefMis.length, {briefMis: briefMis.slice(0, 4)});
  check(`${label} 업종 화면 ${G}장 모두: 앞날 말·쓰지 않는 말 없음 · 예측 표시 0`, !wordsBad.length, {wordsBad: wordsBad.slice(0, 3)});
  check(`${label} 업종 화면 ${G}장 모두: 화면이 옆으로 넘치지 않음(폭 ${viewport.width}px)`, !overflow.length, {overflow: overflow.slice(0, 3)});
  // 업종 화면에서 회사 이름 → 회사 화면 → 「‹ 업종」 → 그 업종 화면
  await page.evaluate(id => { location.hash = '#/i/' + id; }, hg.id); await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card .road`); await page.waitForTimeout(200);
  const pickCode = hg.codes?.[1] ?? board.groups.find(g => g.id === hg.id).codes[1], pick = byCodeB.get(pickCode);
  const link = page.locator(`.b-card[data-code="${pickCode}"] .b-name-row`); await link.scrollIntoViewIfNeeded();
  if (mobile) await link.tap(); else await link.click();
  await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
  const cb = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
  check(`${label} 업종 「${hg.label}」 → ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pickCode}(「${cb.title}」) · 되돌아가기 「${cb.back[1]}」 = 그 업종`, cb.hash === '#/stock/' + pickCode && cb.title === pick.name && cb.back[0] === '#/i/' + hg.id && cb.back[1] === '‹ ' + hg.label, cb);
  const backLoc = page.locator('.c-back'); if (mobile) await backLoc.tap(); else await backLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"]`); await page.waitForTimeout(150);
  check(`${label} 회사 화면 「‹ ${hg.label}」 ${mobile ? '터치' : '누름'} → 그 업종 화면으로 돌아옴`, (await page.evaluate(() => location.hash)) === '#/i/' + hg.id);
  // 다음 불장 후보 1위 줄 → 회사 화면(되돌아가기는 그 회사의 업종)
  if (NEXT.length) {
    await page.evaluate(() => { location.hash = '#/'; }); await page.waitForSelector('.nc-row'); await page.waitForTimeout(200);
    const n0 = NEXT[0], row = page.locator(`.nc-row[href="#/stock/${n0.code}"]`); await row.scrollIntoViewIfNeeded();
    if (mobile) await row.tap(); else await row.click();
    await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    const nr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: document.querySelector('.c-back')?.getAttribute('href')}));
    check(`${label} 다음 불장 후보 1위 「${n0.name}」 ${mobile ? '터치' : '누름'} → 회사 화면 · 되돌아가기 = 그 회사 업종 「${n0.groupLabel}」`, nr.hash === '#/stock/' + n0.code && nr.title === n0.name && nr.back === '#/i/' + n0.groupId, nr);
  }
  // 없는 업종 주소 → 알림 + 처음 화면으로 가는 길
  await page.evaluate(() => { location.hash = '#/i/zzzzzzzz'; }); await page.waitForSelector('.b-page .b-note'); await page.waitForTimeout(100);
  const unk = await page.evaluate(() => ({note: document.querySelector('.b-page .b-note')?.textContent.trim(), back: document.querySelector('.c-back')?.getAttribute('href')}));
  check(`${label} 없는 업종 주소 #/i/zzzzzzzz → 「${unk.note}」 · 처음 화면으로 가는 길`, unk.note === '이 업종은 지금 판에 없습니다' && unk.back === '#/', unk);

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

  // ③-2 출목표 한 판(#/road) — 2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 잡스라면 그리고 애플이라면 해서 추가로 더 만들어」
  //   업종별(처음) = 36칸 판 차례 · 업종 안은 판의 차례 / 흐름별 = 아홉 칸 표의 흐름(+거의 안 움직임)마다 · 지난 20거래일 많이 오른 순 · 칸마다 출목표 = 따로 센 값
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-tile'); await page.waitForTimeout(300);
  await shot('04-road');
  const roadRead = () => page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, mode: document.querySelector('.f-body')?.dataset.mode,
    segs: [...document.querySelectorAll('.f-seg-b')].map(b => `${b.dataset.mode}:${b.getAttribute('aria-pressed')}:${b.textContent.trim()}`),
    secs: [...document.querySelectorAll('.f-body > .f-sec')].map(s => ({domId: s.id, id: s.dataset.group ?? s.dataset.flow, rank: s.querySelector('.f-h-rank')?.textContent.trim() ?? null, name: (s.querySelector('.f-h-name') ?? s.querySelector('.t-h2'))?.firstChild?.textContent.trim(), fire: !!s.querySelector('.f-h .t-fire'), chg: s.querySelector('.f-h-chg')?.textContent.trim() ?? null, codes: [...s.querySelectorAll('.f-tile')].map(t => t.dataset.code)})),
    rows: [...document.querySelectorAll('.f-row')].map(b => ({flow: b.dataset.flow, lab: b.querySelector('.f-lab')?.textContent.trim(), n: b.querySelector('.f-n')?.textContent.trim()})),
    tiles: [...document.querySelectorAll('.f-tile')].map(t => ({code: t.dataset.code, href: t.getAttribute('href'), name: t.querySelector('.f-name')?.textContent.trim(), chg: t.querySelector('.f-chg')?.textContent.trim(), ind: t.querySelector('.f-ind')?.textContent.trim() ?? null, beads: t.querySelectorAll('.road .bead').length, up: t.querySelectorAll('.road .bead.up').length, st: t.querySelector('.f-st')?.textContent.trim(), unit: t.querySelector('.f-unit')?.textContent.trim() ?? null, sec: t.closest('.f-sec')?.id ?? null, sp: (() => { const sp = t.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...t.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: t.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: t.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: t.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: t.querySelector('.nw-miss')?.textContent.trim() ?? null})),
    notes: [...document.querySelectorAll('.f-body > .f-sec')].map(sct => ({id: sct.id, note: [...sct.querySelectorAll(':scope > .t-sub')].map(p => p.textContent.trim()).join(' ')})), ctx: document.querySelector('.f-ctx')?.textContent.trim() ?? null,
    sw: document.documentElement.scrollWidth, iw: innerWidth}));
  const secScale = r => new Map(r.secs.map(x => [x.domId, scaleW(x.codes.map(code => byCodeB.get(code)))]));
  const briefTileMis = r => { const sc = secScale(r); return r.tiles.map(t => ({code: t.code, bad: briefMisW(t, byCodeB.get(t.code), sc.get(t.sec))})).filter(x => x.bad.length).concat(r.notes.filter(n => !n.note.includes(scaleTextW(sc.get(n.id)))).map(n => ({sec: n.id, note: n.note.slice(-60)}))); };
  const ctxGot = board.companies.filter(c => c.brief && !c.brief.missing.includes('수급') && !c.brief.missing.includes('기사')).length, ctxDay = board.companies.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  const ctxWant = ctxGot === N ? `수급·기사: ${N}곳 모두 · ${ctxDay ? kd(ctxDay) + ' 관측 수집' : ''}` : `수급·기사: ${N}곳 가운데 ${ctxGot}곳만 모았음${ctxDay ? `(${kd(ctxDay)} 관측 수집)` : ''} · 나머지 ${N - ctxGot}곳은 다음 관측 수집 때 채움`;
  const tileMisOf = (tiles, withInd) => tiles.filter(t => { const c = byCodeB.get(t.code), road = c && roadOf(c.c); return !c || t.href !== '#/stock/' + c.code || t.name !== c.name || t.chg !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || t.beads !== road.cells.length || t.up !== road.all.up || t.st !== streakWant(road) || t.unit !== (road.unit > 0.01 ? `동그라미 하나 = ${Math.round(road.unit * 100)}%` : null) || (withInd ? t.ind !== board.groups.find(g => g.id === c.group?.id)?.label : t.ind !== null); }).map(t => t.code);
  const r1 = await roadRead();
  check(`${label} 출목표 한 판: 제목 「${r1.title}」 = 판 ${N}곳 · 「${r1.when}」 · 아래 탭 「출목표」 눌림 · 처음 보이는 묶음 = 업종별(단추 ${r1.segs.join(' | ')})`, r1.title === `출목표 ${N}곳` && r1.when === `지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지 · 한 화면에 모두` && r1.active === 'road' && r1.mode === 'ind' && r1.segs.join('|') === `ind:true:업종별 ${G}개|flow:false:흐름별 ${new Set(board.companies.map(c => flowWant(roadOf(c.c)))).size}가지`, {...r1, secs: undefined, tiles: undefined});
  const secMis = board.groups.map((g, k) => { const s = r1.secs[k]; return s && s.id === g.id && s.rank === `${k + 1}위` && s.name === g.label && s.fire === Boolean(g.hot) && s.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && s.codes.join() === g.codes.join() ? null : {k, g: g.label, s}; }).filter(Boolean);
  check(`${label} 출목표 한 판(업종별): 묶음 ${r1.secs.length}개 = 판의 업종 ${G}개 · 36칸 판 차례 · n위·이름·「불장」·평균 · 업종 안 회사 차례가 판과 같음`, r1.secs.length === G && !secMis.length, {secMis: secMis.slice(0, 2)});
  const tm1 = tileMisOf(r1.tiles, false);
  check(`${label} 출목표 한 판(업종별): 칸 ${r1.tiles.length}개 = 판 ${N}곳(겹침 없음) · 이름·20거래일 변화·출목표 동그라미 수(빨강 포함)·「오름/내림 n일째」·「동그라미 하나 = n%」·회사 화면 링크를 따로 센 값과 맞댐`, r1.tiles.length === N && new Set(r1.tiles.map(t => t.code)).size === N && !tm1.length, {tm1: tm1.slice(0, 5)});
  const bt1 = briefTileMis(r1);
  check(`${label} 출목표 한 판(업종별): 칸 ${r1.tiles.length}개마다 선 그래프(종가 ${board.companies[0].c.length}개 · 업종 5곳 같은 눈금 · 눈금 글) · 수급 · 회사 이름이 든 최근 기사 = 판 · 「${r1.ctx}」`, !bt1.length && r1.ctx === ctxWant, {bt1: bt1.slice(0, 4), ctx: r1.ctx, ctxWant});
  check(`${label} 출목표 한 판(업종별): 화면이 옆으로 넘치지 않음(${r1.sw}px ≤ ${r1.iw}px)`, r1.sw <= r1.iw, {sw: r1.sw, iw: r1.iw});
  await wordsCheck(page, `${label} 출목표 한 판(업종별)`);
  // 흐름별로 바꾸기
  const seg = page.locator('.f-seg-b[data-mode="flow"]'); if (mobile) await seg.tap(); else await seg.click(); await page.waitForTimeout(300);
  const r2 = await roadRead();
  const flowsWant = FLOW_ORDER_W.map(k => ({k, items: board.companies.filter(c => flowWant(roadOf(c.c)) === k).sort((a, b) => b.change20 - a.change20 || a.code.localeCompare(b.code))})).filter(f => f.items.length);
  const flowMis = flowsWant.map((f, i) => { const s = r2.secs[i], row = r2.rows[i]; return s && s.id === f.k && s.name === flowTextW(f.k) && s.codes.join() === f.items.map(c => c.code).join() && row?.flow === f.k && row?.lab === flowTextW(f.k) && row?.n === `${f.items.length}곳` ? null : {k: f.k, s: s && {...s, codes: s.codes.length}, row}; }).filter(Boolean);
  check(`${label} 출목표 한 판(흐름별 ${mobile ? '터치' : '누름'}): 흐름 ${r2.secs.length}가지 = 따로 나눈 ${flowsWant.length}가지 · 차례(최근 5거래일 오름 쪽부터) · 이름 · 곳 수(합 ${r2.secs.reduce((s, x) => s + x.codes.length, 0)} = ${N}) · 묶음 안은 20거래일 많이 오른 순 · 흐름 목록 줄도 같음`, r2.mode === 'flow' && r2.secs.length === flowsWant.length && !flowMis.length && r2.segs[1] === `flow:true:흐름별 ${flowsWant.length}가지`, {flowMis: flowMis.slice(0, 2)});
  const tm2 = tileMisOf(r2.tiles, true);
  check(`${label} 출목표 한 판(흐름별): 칸 ${r2.tiles.length}개 = 판 ${N}곳 · 칸마다 업종 이름까지 판과 같음`, r2.tiles.length === N && new Set(r2.tiles.map(t => t.code)).size === N && !tm2.length, {tm2: tm2.slice(0, 5)});
  const bt2 = briefTileMis(r2);
  check(`${label} 출목표 한 판(흐름별): 칸마다 선 그래프(흐름 묶음마다 같은 눈금) · 수급 · 기사 = 판`, !bt2.length, {bt2: bt2.slice(0, 4)});
  await wordsCheck(page, `${label} 출목표 한 판(흐름별)`);
  // 흐름 목록 셋째 줄을 누르면 그 묶음이 화면 위쪽으로
  const f3 = flowsWant[2] ?? flowsWant[0], frow = page.locator(`.f-row[data-flow="${f3.k}"]`);
  if (mobile) await frow.tap(); else await frow.click(); await page.waitForTimeout(900);
  const fj = await page.evaluate(k => Math.round(document.getElementById('f-' + k).getBoundingClientRect().top), f3.k);
  check(`${label} 출목표 한 판: 흐름 목록 「${flowTextW(f3.k)}」 줄 → 그 묶음이 화면 위쪽으로(위에서 ${fj}px)`, fj >= 0 && fj < 200, {fj});
  // 칸 누르기 → 회사 화면(되돌아가기 「‹ 출목표」) → 되돌아오면 보던 자리 · 고른 묶음(흐름별) 그대로
  const pk = f3.items[0], tl = page.locator(`.f-tile[data-code="${pk.code}"]`); await tl.scrollIntoViewIfNeeded();
  const yBefore = await page.evaluate(() => Math.round(scrollY));
  if (mobile) await tl.tap(); else await tl.click();
  await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
  const rc = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
  check(`${label} 출목표 한 판 → ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pk.code}(「${rc.title}」) · 되돌아가기 「${rc.back[1]}」`, rc.hash === '#/stock/' + pk.code && rc.title === pk.name && rc.back[0] === '#/road' && rc.back[1] === '‹ 출목표', rc);
  const bk = page.locator('.c-back'); if (mobile) await bk.tap(); else await bk.click();
  await page.waitForSelector('.f-tile'); await page.waitForTimeout(400);
  const back = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode}));
  check(`${label} 회사 화면 「‹ 출목표」 → 출목표 한 판 · 보던 자리(${yBefore}px → ${back.y}px) · 고른 묶음 「흐름별」 그대로`, back.hash === '#/road' && Math.abs(back.y - yBefore) <= 2 && back.mode === 'flow', {yBefore, back});
  // 지금 탭을 한 번 더 누르면 맨 위로(화면은 그대로)
  const tab = page.locator('.bottom-link[data-route="road"]'); if (mobile) await tab.tap(); else await tab.click(); await page.waitForTimeout(900);
  const tt = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode}));
  check(`${label} 출목표 탭을 한 번 더 ${mobile ? '터치' : '누름'} → 맨 위로(${tt.y}px) · 화면은 그대로`, tt.hash === '#/road' && tt.y === 0 && tt.mode === 'flow', tt);
  // 다시 업종별로(다음 검사들이 처음 모습을 보도록)
  const seg2 = page.locator('.f-seg-b[data-mode="ind"]'); if (mobile) await seg2.tap(); else await seg2.click(); await page.waitForTimeout(200);
  check(`${label} 출목표 한 판: 업종별로 되돌림`, (await page.evaluate(() => document.querySelector('.f-body')?.dataset.mode)) === 'ind');

  // ④ 지운 화면의 옛 주소 → 처음 화면
  for (const old of ['#/forecast', '#/up', '#/down', '#/scores', '#/race', '#/evolution', '#/status', '#/records', '#/game']) {
    await page.goto(base + '/' + old, {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({hash: location.hash, tiles: document.querySelectorAll('.t-grid > .t-tile').length, title: document.querySelector('.b-title')?.innerText.trim()}));
    check(`${label} 옛 주소 ${old} → 처음 화면(#/ · 「${r.title}」 · 업종 칸 ${r.tiles}개)`, r.hash === '#/' && r.title === `요즘 불장 ${HOT.length}개` && r.tiles === G, r);
  }
  // ⑤ 무결성 · 글씨 단추
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(300);
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
  for (const [hash, wait, name] of [['#/', '.t-tile', 'home'], ['#/i/' + (board.hot?.items?.[0]?.id ?? board.groups[0].id), '.b-card .road', 'industry'], ['#/road', '.f-tile', 'road'], ['#/stock/' + board.companies[0].code, '.c-chart svg.lc', 'company'], ['#/agenda', '.b-box', 'agenda']]) {
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
      await page.goto(base + '/' + screenHash(s, board), {waitUntil: 'networkidle'}); await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => {}); if (s.settle) await s.settle(page); await page.waitForTimeout(500); await renderAll(page);
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
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(500); await renderAll(page);
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

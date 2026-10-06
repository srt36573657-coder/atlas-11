/**
 * ATLAS 11 · 실제 브라우저 조작 검사 — 36칸 판(예측 없음 · 업종 36개 × 5곳 = 180곳)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면 · 두 번이면 어디든
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8823 --pw <playwright 폴더>
 * 보는 것(PC 1280×800 · 휴대폰 390×844 터치 흉내 — 실제 아이폰 기기 검증 아님)
 *   2026-10-05 02:44 「잡스였다면」 개혁(보고서 「잡스였다면 ATLAS 개혁 공부」)에 맞춰 고침 — 첫 줄 결론 · 칸 하나에 넷 · 앞날 말 걷어 냄 · 연속 글 대신 오른 날 수 · 화면 잇기
 *   처음 화면(탭 「불장」): 제목 「불장 N개」 = 판의 불장 수 · 결론 한 줄(업종 몇 개가 올랐나 · 기간) · 업종 칸 = 판의 업종 차례 그대로(「불장 n위」 또는 n위 · 이름 · 20거래일 평균 · 몇 곳 올랐나 · 오름/내림 선) ·
 *         칸 바탕은 한 색 · 색 보기표 없음 · 칸을 누르면 그 업종 화면 · 22곳 목록은 처음 화면에 없음(자기 탭)
 *   2026-10-05 05:07 「해」 — 아래 탭 다섯(불장 · 예비 · 22곳 · 출목표 · 일정):
 *     「예비」(#/similar) 불장 닮은 7곳 = 판 · 판의 셈을 이 검사기가 따로 다시 셈(공통점 후보 아홉 · 절반 넘게 · 10%p · 한 업종 2곳) · 줄마다 공통점 ✓ · 같은 눈금 선 그래프 · 공통점 막대 · 저녁 7시 들고 남 칸 = 판 ·
 *        줄 → 회사 → 「‹ 불장 닮은 N곳」 → 보던 자리 · 회사 화면에서도 「예비」 탭 눌림
 *     「오름 상위」(#/rise) 불장 밖에서 많이 오른 22곳 = 판(이름 · 업종 · 작은 선 그래프 같은 눈금 · 변화) · 줄 → 회사 → 「‹ 불장 밖에서 많이 오른 N곳」
 *   업종 화면 36장 모두: 머리(업종 n개 가운데 n위 · 불장 · 평균 · 몇 곳 올랐나) · 「누가 끌었나」 막대(차례 · 값 · 방향 · 길이) · 카드(합쳐서 180장 = 판 · 겹침 없음 · 넷만: 이름·변화 · 선 그래프 · 수급 · 기사) ·
 *         앞날 말 없음 · 옆으로 넘치지 않음 · 회사 화면 「‹ 업종」 → 그 업종 · 없는 업종 주소 → 알림
 *   출목표 한 판(#/road · 2026-10-04 22:12): 업종별(처음) = 36칸 판 차례 · 흐름별 = 아홉 칸 표 흐름마다 · 칸 180개 모두(이름 · 변화 · 선 그래프 · 출목표 동그라미 · 오른 날 수 · 업종 · 수급 · 기사) = 따로 센 값 ·
 *         흐름 줄 → 그 묶음 · 칸 → 회사 → 「‹ 출목표」 → 보던 자리·고른 묶음 그대로 · 탭을 다시 누르면 맨 위
 *   회사: 이름 · 종가 · 지난 20거래일 변화(앞 화면과 같은 숫자) · 지난 60거래일 그래프 마지막 날짜 · 그 안의 20거래일 띠 · 지난 1년 숫자 · 일정·공시 모두 · 수급·기사·공시 기록(눌러 열기) · 같은 업종 4곳
 *   일정: 시장 일정 수 · 회사·업종 일정(같은 일정은 한 줄) 수 · 예고 공시 수 · ★★★ 공시 수
 *   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records · #/game) → 처음 화면
 *   앞날 말 없음: 화면 글(공식 이름 data-ident 는 따로)에 전망·예측·확률·오를 쪽·내릴 쪽·목표가·추천 … 이 없어야 · 예측 표시(data-forecast-date) 0
 *   콘솔 오류 0 · 요청 실패 0 · 무결성(판 목록 SHA-256) · 어두운 화면
 *   또렷함(화면 6 × 보기 5): 1 내일·오늘·어제 · 2 흐릿한 말 · 3 단위·기준 빠진 숫자 · 5 대비 · 7 잘린 글자 — 0 이 아니면 실패 · 검사기 자체 시험
 *   2026-10-05 10:24 「잡스라면 … 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」 1차: 아래 탭 넷(불장 · 업종 · 출목표 · 일정)
 *     탭 「불장」(#/): 제목 「불장 업종 N개」 · 큰 흐름 한 줄 · 큰 흐름 장 = 판의 불장을 큰 갈래(site/app/family.js)로 묶은 것 · 맨 위 스위치 셋 [불장 | 예비 | 오름 상위]
 *     탭 「업종」(#/map): 옛 처음 화면의 73칸 판 그대로 + 큰 갈래 단추 · 업종 화면 「‹ 업종」 · 예비 · 오름 상위은 스위치로 가고 탭 「불장」이 눌린 채로
 *   2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로 배치해줘」: 큰 흐름 장 · 갈래 단추 = 갈래 평균이 큰 순 · 예비 줄 · 업종 화면 다섯 곳 · 같은 업종 넷 = 지난 20거래일 많이 오른 순
 *     출목표: 처음 = 「오른 순」(365곳 · 20곳씩 「1위~20위」) · 업종별 안도 오른 순 · 흐름별 묶음은 묶음 평균이 큰 순
 * 결과: reports/atlas11/browser/<시각>/report.json + 화면 사진
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';
import {familiesByRise, familyOf, riseDesc, FAMILIES, OTHER} from '../../site/app/family.js';
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
/** 칸 위 가는 선 = 오름(up) · 내림(down) · 같음(flat) — 화면 코드와 따로 적어 맞대 봄(2026-10-05 잡스 개혁: 칸 바탕 세기 색은 덜어 냄) */
const signW = v => Number.isFinite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'flat';
const upWant = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';
/** 출목표 한 판 — 화면 코드와 따로 적은 흐름 규칙(road.js 아홉 칸 표 · 둘 다 잠잠하면 「거의 안 움직임」) · 지금 몇 일째 */
const calmW = x => x === 'still' ? 'flat' : x;
const flowWant = r => r.before.side === 'still' && r.now.side === 'still' ? 'still' : `${calmW(r.before.side)}-${calmW(r.now.side)}`;
const FLOW_ORDER_W = ['up-up', 'flat-up', 'down-up', 'up-flat', 'flat-flat', 'still', 'down-flat', 'up-down', 'flat-down', 'down-down'];
const flowTextW = k => k === 'still' ? `${roadOf(board.companies[0].c).days}거래일 내내 거의 안 움직임` : STORY[k.split('-')[0]][k.split('-')[1]];
/** 연속 글(「오름 n일째」) 대신 20거래일 가운데 오른 날 수(±0.1% 안쪽은 보합) — 화면 코드와 따로 셈 */
const upDaysW = c => { const cs = c.c, rets = cs.slice(1).map((v, i) => v / cs[i] - 1); return `${rets.length}거래일 중 오른 날 ${rets.filter(r => r > 0.001).length}일`; };
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
/** 태양(2026-10-05 13:53 · 14:30 · 14:40) — 화면 코드(shapes.js)와 따로 센다: 후보 여덟 · 오른 순 위 20% · 50% 넘게 · 10%p 넘게 · 공통 모양을 모두 가짐
   15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」 B: 불장 · 업종 · 업종 화면 · 회사 · 예비 · 오름 상위의 태양 표시를 모두 이 값과 맞댄다 */
const SUNW = (() => {
  const runs = rd => rd.cells.reduce((o, c) => { const l = o.at(-1); if (l && l.s === c.side) l.n++; else o.push({s: c.side, n: 1}); return o; }, []);
  const day = (rd, side) => Object.values(rd.cells.filter(c => c.side === side).reduce((m, c) => (m[c.day] = (m[c.day] ?? 0) + 1, m), {}));
  const rec = (rd, side) => rd.cells.filter(c => c.side === side && c.day >= rd.days - rd.recentDays).length;
  const SH = [['longRed', '긴 빨강 줄', rd => runs(rd).some(x => x.s === 'up' && x.n >= 6)], ['redTwice', '빨강이 파랑의 2배', rd => { const u = rd.cells.filter(c => c.side === 'up').length, d = rd.cells.length - u; return u > 0 && u >= 2 * d; }],
    ['bigRedDay', '하루 빨강 5개', rd => day(rd, 'up').some(n => n >= 5)], ['recentRed', '끝 5일 빨강', rd => rec(rd, 'up') >= rec(rd, 'down') + 2], ['lastRed', '끝 줄 빨강', rd => rd.cells.at(-1)?.side === 'up'],
    ['shortBlue', '짧은 파랑 줄', rd => { const rs = runs(rd); return rs.some(x => x.s === 'up') && rs.every(x => x.s !== 'down' || x.n <= 2); }], ['noBigBlue', '큰 파랑 날 없음', rd => rd.cells.length > 0 && day(rd, 'down').every(n => n < 3)],
    ['redCols', '빨강 줄이 더 많음', rd => { const rs = runs(rd); return rs.filter(x => x.s === 'up').length > rs.filter(x => x.s === 'down').length; }]];
  const ranked = [...board.companies].sort(riseDesc), topN = Math.round(ranked.length * 0.2), top = ranked.slice(0, topN), rest = ranked.slice(topN), roads = new Map(board.companies.map(c => [c.code, roadOf(c.c)]));
  const sh = SH.map(([id, name, f]) => { const a = top.filter(c => f(roads.get(c.code))).length, b = rest.filter(c => f(roads.get(c.code))).length; return {id, name, f, sa: a / top.length, gap: a / top.length - b / rest.length}; });
  let pick = sh.filter(t => t.sa > 0.5 && t.gap > 0.10); if (pick.length < 3) pick = [...pick, ...sh.filter(t => !pick.includes(t) && t.gap > 0).sort((x, y) => y.gap - x.gap).slice(0, 3 - pick.length)];
  const common = sh.filter(t => pick.includes(t)), has = new Map(board.companies.map(c => [c.code, common.filter(t => t.f(roads.get(c.code))).map(t => t.id)]));
  return {common, has, topN, set: new Set(common.length ? board.companies.filter(c => has.get(c.code).length === common.length).map(c => c.code) : [])};
})();
const sunN = codes => codes.filter(code => SUNW.set.has(code)).length;
const sunNT = codes => sunN(codes) ? `${sunN(codes)}곳` : null;
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
/** 「보던 자리」를 재기 전에 누를 줄을 화면 가운데로 — 2026-10-06 00:50 고침: 줄이 아래 탭 막대 밑에 걸리면(10/6 00:41 「저녁 7시 들고 남」 첫 기록이 생겨 그 칸이 길어지자 「오름 상위」 6번째 줄이 그 자리)
 *  Playwright 가 누르기 직전에 화면을 다시 내려(28px → 416px) 잰 자리와 누른 자리가 달라짐 · 사이트는 누른 자리(416px)로 정확히 돌아왔음 — 사람은 가려진 줄을 누르지 않는다 */
async function toMid(loc) { await loc.scrollIntoViewIfNeeded(); await loc.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'})); }

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
  const N = board.companies.length, G = board.groups.length, HOT = board.hot?.items ?? [], NEXT = board.next?.items ?? [], H = `탭 「지도」(업종 ${G}칸)`, byCodeB0 = new Map(board.companies.map(c => [c.code, c]));
  // ①-0 탭 「불장」(#/ · 2026-10-05 10:24 「잡스라면 36가지」 13~15 · 20번) — 불장 업종만 · 같은 큰 갈래끼리 한 장 · 맨 위 스위치 셋
  {
    await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.hf-row, .h-page .b-note'); await page.waitForTimeout(300);
    await shot('01-hot');
    const hr = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), sum: document.querySelector('.hf-sum')?.innerText.trim() ?? null,
      segs: [...document.querySelectorAll('.hs-seg .hs-b')].map(a => ({seg: a.dataset.seg, href: a.getAttribute('href'), cur: a.getAttribute('aria-current'), label: a.querySelector('.hs-l')?.textContent.trim(), n: a.querySelector('.hs-n')?.textContent.trim()})),
      cards: [...document.querySelectorAll('.hf-card')].map(c => ({fam: c.dataset.family, name: c.querySelector('.hf-name')?.textContent.trim(), n: c.querySelector('.hf-n')?.textContent.trim(), avg: c.querySelector('.hf-avg b')?.textContent.trim(), avgLab: c.querySelector('.hf-avg')?.textContent.replace(/\s+/g, ' ').trim(), rows: [...c.querySelectorAll('.hf-row')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), rank: a.querySelector('.hf-rank')?.textContent.trim(), name: a.querySelector('.hf-gname')?.textContent.trim(), chg: a.querySelector('.hf-chg')?.textContent.trim(), up: a.querySelector('.hf-up')?.textContent.trim(), sun: a.querySelector('.hf-sun .sun-n-t')?.textContent.trim() ?? null}))})),
      tiles: document.querySelectorAll('.t-tile').length, active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
      promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), mvx: document.querySelector('.hs-seg + .mvx')?.dataset.state ?? null, sw: document.documentElement.scrollWidth, iw: innerWidth}));
    check(`${label} 탭 「불장」: 저녁 7시 들고 남 칸이 스위치 바로 아래(${hr.mvx}) = 판`, hr.mvx === (!board.moves ? 'none' : board.moves.first ? 'first' : 'moves'), {mvx: hr.mvx});
    // 2026-10-05 15:24 「잡스가 … 36가지」 A6 — 기록이 없으면 한 줄(제목 · 설명) · 휴대폰 첫 화면을 두 줄 차지하지 않게
    if (!board.moves) { const mq = await page.evaluate(() => { const p = document.querySelector('.hs-seg + .mvx .mvx-h'); const lh = parseFloat(getComputedStyle(p).lineHeight) || parseFloat(getComputedStyle(p).fontSize) * 1.5; return {t: p?.innerText.replace(/\s+/g, ' ').trim(), h: p.getBoundingClientRect().height, lh}; });
      check(`${label} 탭 「불장」: 저녁 7시 들고 남(기록 없음) 「${mq.t}」 한 줄(${Math.round(mq.h)}px)`, mq.t === '저녁 7시 들고 남 아직 기록 없음 · 거래일 19:00마다 적음' && (viewport.width < 600 ? mq.h < mq.lh * 1.9 : true), mq); }
    const flowsW = familiesByRise(board.groups.filter(g => g.hot)), SIMN = board.similar?.items?.length ?? 0;
    check(`${label} 탭 「불장」: 제목 「${hr.title}」 · 큰 흐름 한 줄 「${hr.sum}」 · 아래 탭 여섯 ${hr.tabs.join('·')}(「불장」 눌림) · 73칸 판은 여기 없음`, hr.title === `불장 업종 ${HOT.length}개` && (HOT.length ? hr.sum === `큰 흐름 ${flowsW.length}개 — ${flowsW.map(f => f.fam.label).join(' · ')}` : hr.sum === null) && hr.tabs.join() === '불장,지도,출목표,일정,찾기,기록' && hr.active === 'home' && hr.tiles === 0, {...hr, cards: undefined, segs: undefined});
    check(`${label} 탭 「불장」 맨 위 스위치 셋: 불장 ${HOT.length}개 · 예비 ${SIMN}곳 · 오름 상위 ${NEXT.length}곳 · 「불장」 고름`, hr.segs.map(x => `${x.seg}|${x.href}|${x.label}|${x.n}|${x.cur ?? ''}`).join() === [`home|#/|불장|${HOT.length}개|page`, `similar|#/similar|예비|${SIMN}곳|`, `rise|#/rise|오름 상위|${NEXT.length}곳|`].join(), hr.segs);
    const cardMisH = flowsW.map((f, k) => { const c = hr.cards[k]; return c && c.fam === f.fam.id && c.name === f.fam.label && c.n === `불장 업종 ${f.groups.length}개` && c.avg === (Number.isFinite(f.avg) ? p1(f.avg) : '없음') && c.avgLab === `평균 ${c.avg}` && c.rows.length === f.groups.length && f.groups.every((g, j) => { const r = c.rows[j], i = board.groups.indexOf(g); return r && r.id === g.id && r.href === '#/i/' + g.id && r.rank === `불장 ${i + 1}위` && r.name === g.label && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.up === upWant(g) && r.sun === sunNT(g.codes); }) ? null : {k, f: f.fam.label, c}; }).filter(Boolean);
    check(`${label} 탭 「불장」: 큰 흐름 ${hr.cards.length}장 = 판의 불장 ${HOT.length}개를 큰 갈래로 묶은 것(갈래 차례 = 갈래 평균이 큰 순 · 장 머리에 「평균」 한 번 · 장 안은 오른 순) · 줄마다 「불장 n위」 · 이름 · 20거래일 평균 · 몇 곳 올랐나 · 태양 몇 곳(따로 센 값) · 누르면 그 업종 · 옆으로 넘치지 않음`, hr.cards.length === flowsW.length && hr.cards.reduce((t, c) => t + c.rows.length, 0) === HOT.length && !cardMisH.length && hr.sw <= hr.iw, {cardMisH: cardMisH.slice(0, 2), sw: hr.sw});
    check(`${label} 탭 「불장」: 「${hr.promise}」 접힌 칸 · 맨 아래 약속 한 줄 「${hr.footPromise}」`, hr.promise === 'ATLAS가 하지 않는 일 7가지' && hr.footPromise === '지난 기록만 보여 줍니다 · 앞날을 맞히지 않습니다', {promise: hr.promise, footPromise: hr.footPromise});
    await wordsCheck(page, `${label} 탭 「불장」`);
    if (HOT.length) {
      const g0 = flowsW[0].groups[0], rl = page.locator(`.hf-row[data-group="${g0.id}"]`); await rl.scrollIntoViewIfNeeded();
      if (mobile) await rl.tap(); else await rl.click();
      await page.waitForSelector(`article.i-page[data-group="${g0.id}"] .b-card`); await page.waitForTimeout(200);
      const ib = await page.evaluate(() => ({hash: location.hash, back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 탭 「불장」 줄 「${g0.label}」 ${mobile ? '터치' : '누름'} → 업종 화면 · 되돌아가기 「${ib.back[1]}」 · 탭 「불장」 눌린 채로`, ib.hash === '#/i/' + g0.id && ib.back[0] === '#/' && ib.back[1] === '‹ 불장' && ib.active === 'home', ib);
    }
    // 2026-10-05 15:24 「잡스가 … 36가지」 B5 — 맨 아래 태양 보기표 한 줄 · 「출목표에서 태양 n곳 모아 보기 ›」 → 출목표 묶는 법 「태양」 맨 위
    if (SUNW.set.size) {
      await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
      const sk = await page.evaluate(() => { const k = document.querySelector('.h-page .sun-key'); return k ? {t: k.textContent.replace(/\s+/g, ' ').trim(), href: k.querySelector('a.sun-go')?.getAttribute('href'), sun: !!k.querySelector('svg.sun')} : null; });
      check(`${label} 탭 「불장」: 태양 보기표 「${sk?.t}」`, sk?.sun && sk.href === '#/road/sun' && sk.t === `= 태양(지난 20거래일 오른 회사 출목표의 공통 모양 ${SUNW.common.length}가지를 모두 가진 회사) 수 · 출목표에서 태양 ${SUNW.set.size}곳 모아 보기 ›`, sk);
      const lk = page.locator('.h-page .sun-key a.sun-go'); await lk.scrollIntoViewIfNeeded(); if (mobile) await lk.tap(); else await lk.click();
      await page.waitForSelector('.f-body[data-mode="sun"][data-ready] .f-tile'); await page.waitForTimeout(400);
      const sv = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, pressed: document.querySelector('.f-seg-b[aria-pressed="true"]')?.dataset.mode, n: document.querySelectorAll('.f-tile').length, active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「태양 모아 보기 ›」 ${mobile ? '터치' : '누름'} → 출목표 「태양」 맨 위(주소 #/road · 칸 ${sv.n}개 = 태양 ${SUNW.set.size}곳 · 아래 탭 「출목표」 눌림)`, sv.hash === '#/road' && sv.y === 0 && sv.mode === 'sun' && sv.pressed === 'sun' && sv.n === SUNW.set.size && sv.active === 'road', sv);
      await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('atlas11:road')) localStorage.removeItem(k); }); // 아래 출목표 검사는 처음 들어온 사람처럼(고른 묶는 법 기억을 지움)
    }
  }
  // ① 탭 「업종」(#/map) = 옛 처음 화면의 73칸 판 — 업종 칸 · 「불장」 · 큰 갈래 단추 · 칸을 누르면 업종 화면
  await page.goto(base + '/#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(400);
  await shot('01-map');
  const top = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), kinds: document.querySelector('.b-kinds')?.textContent.trim() ?? null, ncRows: document.querySelectorAll('.nc-row').length, promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), late: [...document.querySelectorAll('.b-late')].map(e => e.innerText.trim()), strip: document.querySelector('.mstrip')?.innerText.replace(/\s+/g, ' ').trim(),
    active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
    tiles: [...document.querySelectorAll('.t-grid > .t-tile')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), sign: [...a.classList].find(c => c.startsWith('s-'))?.slice(2) ?? null, bg: getComputedStyle(a).backgroundColor, rank: a.querySelector('.t-rank')?.textContent.trim() ?? null, fire: a.querySelector('.t-fire')?.textContent.trim() ?? null, name: a.querySelector('.t-name')?.textContent.trim(), chg: a.querySelector('.t-chg')?.textContent.trim(), dsign: a.querySelector('.t-chg')?.dataset.sign ?? 'flat', up: a.querySelector('.t-up')?.textContent.trim(), kids: a.children.length, sun: a.querySelector('.t-sun .sun-n-t')?.textContent.trim() ?? null})),
    legend: document.querySelectorAll('.t-legend, .t-sw').length,
    cards: document.querySelectorAll('.b-card').length, text52: /(?<!\d)52\s?(종목|곳)|업종 대표/.test(document.body.textContent)}));
  const kindsWant = board.kinds ? [`업종 ${G}개`, `우량주 ${board.kinds.quality ?? 0}곳`, `시대 트렌드 ${board.kinds.trend ?? 0}곳`, board.kinds.profit ? `흑자 ${board.kinds.profit}곳` : null, board.kinds.size ? `채움 ${board.kinds.size}곳` : null].filter(Boolean).join(' · ') : null;
  const fromM = mode(board.companies.map(c => c.cFrom)), toM = mode(board.companies.map(c => c.date));
  const upsG = board.groups.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
  check(`${label} ${H}: 제목 「${top.title}」 = 판의 불장 ${HOT.length}개 · 결론 한 줄 「${top.when}」(업종 ${upsG}개 오름 · 가장 많은 회사의 기간) · 아래 탭 여섯 ${top.tabs.join('·')}(「업종」 눌림) · 회사 카드·22곳 줄 없음 · 옛 「52」 글 없음${board.kinds ? ` · 접힌 칸 「${top.kinds}」` : ''}`,
    top.title === `지도 업종 ${G}개` && top.when === `업종 ${G}개 가운데 ${upsG}개 오름 · ${N}곳 · 지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)}까지` && top.tabs.join() === '불장,지도,출목표,일정,찾기,기록' && top.active === 'map' && top.cards === 0 && top.ncRows === 0 && !top.text52 && (!board.kinds || top.kinds === kindsWant), {...top, tiles: undefined, legend: undefined});
  const tileMis = board.groups.map((g, i) => { const t = top.tiles[i]; return t && t.id === g.id && t.href === '#/i/' + g.id && t.name === g.label && (g.hot ? t.fire === `불장 ${i + 1}위` && t.rank === null : t.rank === `${i + 1}위` && t.fire === null) && t.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && t.up === upWant(g) && t.sign === signW(g.change20) && t.dsign === signW(g.change20) && t.kids === 4 && t.sun === sunNT(g.codes) ? null : {i, g: g.label, t}; }).filter(Boolean);
  check(`${label} ${H}: 업종 칸 ${top.tiles.length}개 = 판의 업종 ${G}개 · 칸마다 넷(「불장 n위」 또는 n위 · 이름 · 20거래일 평균 ▲▼ · 몇 곳 올랐나) · 첫 줄 태양 수(따로 센 값 · 없으면 비움) · 차례 · 오름/내림 선 · 누르면 갈 주소가 판과 같음`, top.tiles.length === G && !tileMis.length, {tileMis: tileMis.slice(0, 3)});
  const fires = top.tiles.map((t, i) => t.fire ? i : -1).filter(i => i >= 0);
  check(`${label} ${H}: 「불장」 칸 ${fires.length}개 = 판의 불장 ${HOT.length}개 · 1위부터 빈틈없이 · 판의 불장 목록과 같은 업종 · 모두 오른 업종 · 큰 순`, fires.length === HOT.length && fires.every((x, i) => x === i) && HOT.every((x, i) => top.tiles[i]?.id === x.id && x.change20 > 0 && (!i || HOT[i - 1].change20 >= x.change20)), {fires});
  // 칸 바탕은 한 색(세기 색 없음) · 색 보기표 없음(2026-10-05 잡스 개혁 — 설명표가 따로 필요하면 그림이 스스로 말하지 못한다는 신호 · 애플 WWDC17)
  const bgs = new Set(top.tiles.map(t => t.bg));
  check(`${label} ${H}: 칸 바탕 ${bgs.size}색(한 색) · 색 보기표 없음 · 오름 칸 ${top.tiles.filter(t => t.sign === 'up').length}개 · 내림 칸 ${top.tiles.filter(t => t.sign === 'down').length}개`, bgs.size === 1 && top.legend === 0, {bgs: [...bgs], legend: top.legend});
  check(`${label} ${H}: 맨 아래 약속 한 줄 「${top.footPromise}」`, top.footPromise === '지난 기록만 보여 줍니다 · 앞날을 맞히지 않습니다', {footPromise: top.footPromise});
  // (옛 · 2026-10-06 00:21 까지) 큰 갈래 단추 12개(.fm-b) — 지금은 지도 한 장 · 땅을 누르면 그 갈래 화면
  // 지도 한 장(2026-10-06 00:21 「잡스라면 … 개선하라」 · site/app/landmap.js) — 땅 = 큰 갈래(family.js 차례 · 넓이 = 업종 수) · 칸 = 업종(땅 안은 오른 순 · 오름/내림 색)
  //   · 이름이 잘리지 않음 · 땅끼리 겹치지 않음 · 누르는 자리 44px 넘음
  //   · 2026-10-06 07:03 「왜 3단 클릭 구조가 아니지?」 — 땅 = 그 갈래 화면 링크(#/map/f/<갈래>) · 세 번이면 회사(땅 → 업종 → 회사) · 되돌아가기는 거꾸로(회사 → 업종 → 갈래 → 지도)
  //     (옛 00:21 판: 땅을 누르면 73칸 거르기 · 「모두 보기」 — 뺌)
  {
    const ORDERW = [...FAMILIES, OTHER].map(f => f.id), byF = new Map();
    for (const g of board.groups) { const f = familyOf(g.label); if (!byF.has(f.id)) byF.set(f.id, {fam: f, groups: []}); byF.get(f.id).groups.push(g); }
    const landsW = [...byF.values()].sort((a, b) => ORDERW.indexOf(a.fam.id) - ORDERW.indexOf(b.fam.id)).map(x => { const gs = [...x.groups].sort(riseDesc), v = gs.map(g => g.change20).filter(Number.isFinite); return {id: x.fam.id, label: x.fam.label, gs, avg: v.length ? v.reduce((t, y) => t + y, 0) / v.length : null}; });
    const avgT = a => Number.isFinite(a) ? (a > 0 ? '+' : a < 0 ? '−' : '') + (Math.abs(a) * 100).toFixed(Math.abs(a) < 0.0005 ? 2 : 1) + '%' : '없음';
    const lm = await page.evaluate(() => { window.scrollTo(0, 0); const el = document.querySelector('.lm'), r0 = el.getBoundingClientRect();
      return {w: Math.round(r0.width), h: Math.round(r0.height), sw: document.documentElement.scrollWidth, iw: innerWidth, lands: [...el.querySelectorAll('.lm-n')].map(b => { const l = b.querySelector('.lm-lab'), r = b.getBoundingClientRect();
        return {id: b.dataset.family, n: +b.dataset.n, tag: b.tagName, href: b.getAttribute('href'), name: b.querySelector('.lm-name')?.textContent.replace(/​/g, ''), avg: b.querySelector('.lm-avg')?.textContent.trim(),
          cells: [...b.querySelectorAll('.lm-c')].map(c => c.dataset.group + '|' + ([...c.classList].find(k => k.startsWith('s-'))?.slice(2) ?? '')), x: r.left - r0.left, y: r.top - r0.top, w: r.width, h: r.height,
          clip: l.scrollWidth > l.clientWidth + 1 || [...l.children].some(c => c.offsetWidth > l.clientWidth), cellsH: b.querySelector('.lm-cells').getBoundingClientRect().height}; })}; });
    const landMis = landsW.map((L, k) => { const x = lm.lands[k]; return x && x.id === L.id && x.n === L.gs.length && x.name === L.label && x.avg === avgT(L.avg) && x.cells.join() === L.gs.map(g => g.id + '|' + signW(g.change20)).join() && x.tag === 'A' && x.href === '#/map/f/' + L.id && !x.clip && x.cellsH >= 16 ? null : {k, L: L.label, x: {...x, cells: x?.cells.slice(0, 3)}}; }).filter(Boolean);
    const nCells = lm.lands.reduce((t, x) => t + x.cells.length, 0);
    check(`${label} ${H}: 지도 한 장 — 땅 ${lm.lands.length}개 = 판의 큰 갈래 ${landsW.length}개(family.js 차례) · 땅마다 이름 · 갈래 평균 · 칸 = 그 갈래 업종(오른 순 · 오름/내림 색) · 칸 ${nCells}개 = 업종 ${G}개 · 이름 잘림 없음 · 땅마다 그 갈래 화면 링크`, lm.lands.length === landsW.length && !landMis.length && nCells === G, {landMis: landMis.slice(0, 3)});
    const area = lm.lands.reduce((t, x) => t + x.w * x.h, 0), ratioMis = lm.lands.filter(x => Math.abs((x.w * x.h) / area - x.n / G) > 0.05).map(x => `${x.id} ${((x.w * x.h) / area * 100).toFixed(1)}% · 업종 ${(x.n / G * 100).toFixed(1)}%`);
    const overlap = lm.lands.some((a, i) => lm.lands.some((b, j) => j > i && a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1));
    check(`${label} ${H}: 지도 ${lm.w}×${lm.h}px · 땅 넓이 = 업종 수 비율(어긋남 ${ratioMis.length}개) · 땅끼리 겹침 없음 · 가장 좁은 땅 ${Math.round(Math.min(...lm.lands.map(x => Math.min(x.w, x.h))))}px(누르는 자리 44px 넘음) · 옆으로 넘치지 않음`, !ratioMis.length && !overlap && lm.lands.every(x => x.w >= 44 && x.h >= 44) && lm.sw <= lm.iw && lm.w > 0 && lm.h > 0, {ratioMis, overlap});
    // 세 번이면 회사: ① 땅 → 그 갈래 화면 ② 업종 칸 → 업종 화면 ③ 회사 → 회사 화면 · 되돌아가기 셋으로 다시 지도
    const press1 = async loc => { if (mobile) await loc.tap(); else await loc.click(); };
    const L1 = landsW[0];
    await press1(page.locator(`.lm-n[data-family="${L1.id}"]`)); await page.waitForSelector('.l-page .l-grid .t-tile'); await page.waitForTimeout(300);
    await shot('01b-land');
    const lp = await page.evaluate(() => { const tiles = [...document.querySelectorAll('.l-grid > .t-tile')];
      return {hash: location.hash, y: Math.round(scrollY), title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), when: document.querySelector('.b-when')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route,
        tiles: tiles.map(t => ({id: t.dataset.group, href: t.getAttribute('href'), name: t.querySelector('.t-name')?.textContent.trim(), band: !!t.querySelector('.t-band'), over: [...t.querySelectorAll('.t-top > *')].some(k => k.getBoundingClientRect().right > t.getBoundingClientRect().right - 1)})), sw: document.documentElement.scrollWidth, iw: innerWidth}; });
    const upN = L1.gs.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
    check(`${label} 지도 땅 「${L1.label}」 ${mobile ? '터치' : '누름'}(한 번) → 갈래 화면 #/map/f/${L1.id} · 맨 위부터 · 제목 「${lp.title}」 · 「${lp.back[1]}」 · 탭 「지도」 눌린 채로 · 칸 ${lp.tiles.length}개 = 그 갈래 업종(오른 순 · 칸마다 지도 색 띠 · 누르면 그 업종) · 옆으로 넘치지 않음`,
      lp.hash === '#/map/f/' + L1.id && lp.y === 0 && lp.title === `${L1.label} 업종 ${L1.gs.length}개` && lp.when?.startsWith(`업종 ${L1.gs.length}개 가운데 ${upN}개 오름 · 갈래 평균 ${avgT(L1.avg)} · 지난 20거래일`) && lp.back[0] === '#/map' && lp.back[1] === '‹ 지도' && lp.active === 'map'
      && lp.tiles.map(t => t.id).join() === L1.gs.map(g => g.id).join() && lp.tiles.every((t, k) => t.href === '#/i/' + L1.gs[k].id && t.name === L1.gs[k].label && t.band && !t.over) && lp.sw <= lp.iw, {...lp, tiles: lp.tiles.slice(0, 3)});
    await wordsCheck(page, `${label} 갈래 화면 「${L1.label}」`);
    const g1 = L1.gs[0];
    await press1(page.locator(`.l-grid .t-tile[data-group="${g1.id}"]`)); await page.waitForSelector(`article.i-page[data-group="${g1.id}"] .b-card`); await page.waitForTimeout(300);
    const ip = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route, co: document.querySelector('article.i-page a[href^="#/stock/"]')?.getAttribute('href')}));
    check(`${label} 갈래 화면 칸 「${g1.label}」 ${mobile ? '터치' : '누름'}(두 번) → 업종 화면 #/i/${g1.id} · 되돌아가기 「${ip.back[1]}」 = 그 갈래 · 탭 「지도」 눌린 채로`, ip.hash === '#/i/' + g1.id && ip.title === g1.label && ip.back[0] === '#/map/f/' + L1.id && ip.back[1] === '‹ ' + L1.label && ip.active === 'map' && !!ip.co, ip);
    await press1(page.locator(`article.i-page a[href="${ip.co}"]`).first()); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    const cp = await page.evaluate(() => ({hash: location.hash, back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
    check(`${label} 업종 화면 회사 ${mobile ? '터치' : '누름'}(세 번) → 회사 화면 ${cp.hash} · 되돌아가기 「${cp.back[1]}」 · 탭 「지도」 눌린 채로 — 지도에서 세 번이면 회사`, cp.hash === ip.co && cp.back[0] === '#/i/' + g1.id && cp.back[1] === '‹ ' + g1.label && cp.active === 'map', cp);
    const hashes = [];
    for (const want of [`article.i-page[data-group="${g1.id}"] .b-card`, '.l-page .l-grid .t-tile', '.lm-n']) { await press1(page.locator('.c-back').first()); await page.waitForSelector(want); await page.waitForTimeout(250); hashes.push(await page.evaluate(() => location.hash)); }
    check(`${label} 되돌아가기 세 번 → ${hashes.join(' → ')}(업종 → 갈래 → 지도)`, hashes.join() === ['#/i/' + g1.id, '#/map/f/' + L1.id, '#/map'].join(), hashes);
    const unk = await page.evaluate(async () => { location.hash = '#/map/f/zzz'; await new Promise(r => setTimeout(r, 400)); return {note: document.querySelector('.l-page .b-note')?.textContent.trim(), back: document.querySelector('.c-back')?.getAttribute('href')}; });
    check(`${label} 없는 갈래 주소 #/map/f/zzz → 「${unk.note}」 · 지도로 가는 길`, unk.note === '이 갈래는 지금 판에 없습니다' && unk.back === '#/map', unk);
    await page.evaluate(() => { location.hash = '#/map'; }); await page.waitForSelector('.lm-n'); await page.waitForTimeout(300);
  }
  check(`${label} ${H}: 늦은 종가 표시 ${top.late.length}줄 = 판의 늦은 회사 ${board.late.length}곳`, top.late.length === board.late.length && board.late.every((c, i) => top.late[i]?.startsWith(c.name + ': ' + kd(c.date))), top.late);
  check(`${label} ${H}: 시장 띠(코스피·코스닥 · 기준 날짜)`, manifest.market ? manifest.market.items.every(i => top.strip.includes(i.name)) && top.strip.includes(kd(manifest.market.items[0].date) + ' 15:30 KST 종가') : /시장 지수 없음/.test(top.strip), {strip: top.strip});
  // 맨 아래 접힌 상자 「지난 6개월 앞서 달린 곳」(2026-10-06 14:55 「해」 · lib/atlas11/lead6.mjs) — 처음엔 접힘 · 펼치면 판의 120거래일 위 20% 표시와 같음(검사기가 판에서 따로 고르고 줄 세움) · 지수 자리 한 줄 · 73칸 설명 줄(t-key)은 뺌(규칙 1)
  {
    const L = board.lead6, byC = new Map(board.companies.map(c => [c.code, c])), d120 = (a, b) => b.change120 - a.change120;
    const rowsW = board.groups.filter(g => g.lead6).sort(d120).map(g => ({g, cs: g.codes.map(c => byC.get(c)).filter(c => c?.lead6).sort(d120)})).filter(r => r.cs.length), nW = rowsW.reduce((t, r) => t + r.cs.length, 0);
    const before = await page.evaluate(() => ({open: document.querySelector('details.m6')?.open ?? null, tkey: [...document.querySelectorAll('.t-page > .t-key')].filter(p => !p.classList.contains('sun-key')).length}));
    const sumLoc = page.locator('details.m6 > summary'); await sumLoc.scrollIntoViewIfNeeded(); if (mobile) await sumLoc.tap(); else await sumLoc.click(); await page.waitForTimeout(250);
    const m6 = await page.evaluate(() => { const d = document.querySelector('details.m6'); return d ? {open: d.open, n: d.querySelector('.m6-n')?.textContent.trim(), ix: d.querySelector('.m6-ix')?.textContent.trim(), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      rows: [...d.querySelectorAll('.m6-list > li')].map(li => ({href: li.querySelector('.m6-g')?.getAttribute('href'), g: li.querySelector('.m6-g span')?.textContent.trim(), gchg: li.querySelector('.m6-g b')?.textContent.trim(), cs: [...li.querySelectorAll('.m6-cs a')].map(a => ({href: a.getAttribute('href'), t: a.textContent.trim()}))}))} : null; });
    const n2 = v => v.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}), ix = L?.index;
    const ixW = ix ? `${ix.name}: ${kd(ix.date)} 종가 ${n2(ix.close)}포인트 — 지난 ${ix.days}거래일 가운데 가장 높던 ${kd(ix.highDate)} ${n2(ix.high)}포인트${ix.gap < 0 ? `보다 ${(Math.abs(ix.gap) * 100).toFixed(1)}% 아래` : '와 같음'}` : null;
    const mis = rowsW.map((r, i) => { const x = m6?.rows[i]; return x && x.href === '#/i/' + r.g.id && x.g === r.g.label && x.gchg === p1(r.g.change120) && x.cs.length === r.cs.length && r.cs.every((c, k) => x.cs[k].href === '#/stock/' + c.code && x.cs[k].t === `${c.name} ${p1(c.change120)}`) ? null : {i, g: r.g.label, x}; }).filter(Boolean);
    check(`${label} ${H}: 맨 아래 접힌 상자 「지난 6개월 앞서 달린 곳」 — 처음엔 접힘 · 펼치면 업종 ${rowsW.length}개 · 회사 ${nW}곳(판의 120거래일 위 20% 표시에서 따로 고른 값 · 120거래일 변화 순 · 누르면 그 업종 · 그 회사) · 지수 자리 「${m6?.ix}」 · 옆으로 넘치지 않음 · 73칸 설명 줄 뺌`,
      Boolean(L) && before.open === false && before.tkey === 0 && m6?.open === true && m6.n === `업종 ${rowsW.length}개 · 회사 ${nW}곳` && m6.rows.length === rowsW.length && !mis.length && (ixW ? m6.ix === ixW : Boolean(m6.ix?.startsWith('지수 자리:'))) && m6.sw <= m6.cw, {before, n: m6?.n, ixW, mis: mis.slice(0, 2)});
    if (mobile) await sumLoc.tap(); else await sumLoc.click(); await page.waitForTimeout(150); // 접어 둔 채로 다음 검사(처음 들어온 사람과 같게)
  }
  await wordsCheck(page, `${label} ${H}`);
  // 칸 누르기(휴대폰은 터치) — 셋째 불장 칸 → 그 업종 화면
  const hg = HOT[2] ?? board.groups[0];
  const tileLoc = page.locator(`.t-tile[data-group="${hg.id}"]`); await tileLoc.scrollIntoViewIfNeeded();
  if (mobile) await tileLoc.tap(); else await tileLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card`); await page.waitForTimeout(300);
  await shot('02-industry');
  const ij = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim()}));
  check(`${label} ${H}: 「${hg.label}」 칸 ${mobile ? '터치' : '누름'} → 업종 화면 #/i/${hg.id}(제목 「${ij.title}」)`, ij.hash === '#/i/' + hg.id && ij.title === hg.label, ij);

  // ①-2 업종 화면 36장 모두 — 머리 · 「누가 끌었나」 막대 · 카드(합쳐서 180장 = 판) · 앞날 말 · 화면 폭
  const byCodeB = new Map(board.companies.map(c => [c.code, c])), KIND = {quality: '우량', trend: '트렌드', profit: '흑자', size: '채움'};
  const seen = new Map(), headMis = [], barMis = [], cardMis = [], agMis = [], wordsBad = [], overflow = [], briefMis = [], namesMis = []; let cardsTotal = 0;
  for (const [k, g] of board.groups.entries()) {
    await page.evaluate(id => { location.hash = '#/i/' + id; }, g.id);
    await page.waitForSelector(`article.i-page[data-group="${g.id}"] .b-card`); await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const art = document.querySelector('article.i-page'), back = art.querySelector('.c-back');
      return {rank: art.querySelector('.i-rank')?.firstChild?.textContent.trim(), fire: art.querySelector('.i-rank .t-fire')?.textContent.trim() ?? null, title: art.querySelector('.b-title')?.textContent.trim(), chg: art.querySelector('.b-when .chg20')?.textContent.trim(), when: art.querySelector('.b-when')?.textContent.trim(), back: [back?.getAttribute('href'), back?.textContent.trim()],
        bars: [...art.querySelectorAll('.mv-row')].map(li => { const bar = li.querySelector('.mv-bar'); return {code: li.dataset.code, name: li.querySelector('.mv-name')?.textContent.trim(), href: li.querySelector('.mv-name')?.getAttribute('href'), val: li.querySelector('.mv-val')?.textContent.trim(), w: parseFloat(bar.style.width), left: bar.style.left, right: bar.style.right}; }),
        /* 화면 밖 카드는 그리기를 미루므로(content-visibility) innerText 대신 textContent */
        isun: art.querySelector('.i-rank .i-sun .sun-n-t')?.textContent.trim() ?? null,
        cards: [...art.querySelectorAll('.b-card')].map(c => ({code: c.dataset.code, sunTag: !!c.querySelector('.b-name-row svg.sun-tag'), name: c.querySelector('.b-name')?.textContent.trim(), c20: c.querySelector('.b-c20')?.textContent.trim(), moved: c.querySelectorAll('.road, .ag-box, .b-price, .b-kind').length, kids: c.children.length, href: c.querySelector('.b-name-row')?.getAttribute('href'), sp: (() => { const sp = c.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...c.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: c.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: c.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: c.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: c.querySelector('.nw-miss')?.textContent.trim() ?? null})),
        names: (() => { const d = art.querySelector('details.i-names'); return d ? {open: d.open, sum: d.querySelector('summary')?.textContent.trim(), src: art.querySelector('.i-src')?.textContent.trim() ?? null} : null; })(),
        scaleNote: [...art.querySelectorAll('.t-sub')].map(p => p.textContent.trim()).find(t => t.startsWith('선 그래프 눈금')) ?? null, orderNote: [...art.querySelectorAll('.t-h2 small')].map(x => x.textContent.trim()).find(t => t.includes("순 ·")) ?? null, how: art.querySelectorAll('.b-how').length,
        sw: document.documentElement.scrollWidth, iw: innerWidth};
    });
    if (!(r.title === g.label && r.rank === `업종 ${G}개 가운데 ${k + 1}위` && (r.fire === '불장') === Boolean(g.hot) && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.when.endsWith(` · ${upWant(g)}`) && r.back[0] === '#/map' && r.back[1] === '‹ 지도' && r.orderNote?.startsWith('· 지난 20거래일 많이 오른 순 ·') && r.isun === sunNT(g.codes))) headMis.push({g: g.label, r: {...r, bars: undefined, cards: undefined}});
    const cs = g.codes.map(code => byCodeB.get(code)).sort(riseDesc), csCodes = cs.map(c => c.code).join(), max = Math.max(0.01, ...cs.map(c => Math.abs(c.change20)).filter(Number.isFinite)); // 오른 순(2026-10-05 11:36)
    if (r.bars.map(b => b.code).join() !== csCodes || cs.some((c, i) => { const b = r.bars[i], v = c.change20; return b.name !== c.name || b.href !== '#/stock/' + c.code || b.val !== p1(v) || Math.abs(b.w - Math.max(1.5, Math.abs(v) / max * 50)) > 0.01 || (v < 0 ? b.right !== '50%' : b.left !== '50%'); })) barMis.push({g: g.label, bars: r.bars});
    if (r.cards.map(c => c.code).join() !== csCodes) cardMis.push({g: g.label, order: r.cards.map(c => c.code)});
    for (const hc of r.cards) {
      cardsTotal++; seen.set(hc.code, (seen.get(hc.code) ?? 0) + 1);
      const c = byCodeB.get(hc.code);
      // 카드 하나에 넷(이름·변화 줄 · 선 그래프 · 수급·기사 칸) — 값 줄 · 출목표 · 일정·공시 · 종류 표시는 회사 화면으로 옮김(2026-10-05 잡스 개혁)
      if (!c || hc.name !== c.name || hc.c20 !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || hc.moved !== 0 || hc.kids !== 3 || hc.href !== '#/stock/' + c.code || hc.sunTag !== SUNW.set.has(c.code)) cardMis.push({g: g.label, code: hc.code, hc: {c20: hc.c20, moved: hc.moved, kids: hc.kids}});
      if (c) { const bm = briefMisW(hc, c, scaleW(cs)); if (bm.length) briefMis.push({g: g.label, code: hc.code, bad: bm}); }
    }
    if (r.how) agMis.push(g.label);
    if (!(r.names && !r.names.open && r.names.sum === '업종 이름 출처' && (g.from && g.to ? r.names.src === `${kd(g.from)}부터 ${kd(g.to)} 15:30 종가까지` : r.names.src === null))) namesMis.push({g: g.label, names: r.names}); // A4 업종 이름 출처는 접힘 · 기간 한 줄만
    if (!r.scaleNote?.startsWith(scaleTextW(scaleW(cs)))) briefMis.push({g: g.label, scaleNote: r.scaleNote});
    if (r.sw > r.iw) overflow.push({g: g.label, sw: r.sw, iw: r.iw});
    const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? [], t.idents.filter(x => PREDICTION_WORDS.test(x)));
    if (bad.length || t.marks) wordsBad.push({g: g.label, bad: bad.slice(0, 3), marks: t.marks});
  }
  check(`${label} 업종 화면 ${G}장 모두: 제목·「업종 ${G}개 가운데 n위」·「불장」 표시·태양 수·지난 20거래일 평균·몇 곳 올랐나·「‹ 업종」(들어온 탭) = 판 · 카드 머리 「지난 20거래일 많이 오른 순」`, !headMis.length, {headMis: headMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 「누가 끌었나」 막대 = 그 업종 회사 · 차례·이름·값·회사 화면 링크 · 방향(오름은 0 오른쪽 · 내림은 0 왼쪽) · 길이(가장 큰 값이 반 폭)`, !barMis.length, {barMis: barMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 카드 합 ${cardsTotal}장 · 서로 다른 회사 ${seen.size}곳 = 판 ${N}곳(겹침 없음) · 업종마다 판의 차례 · 카드 하나에 넷(이름·20거래일 변화 · 선 그래프 · 수급 · 기사 — 값 줄·출목표·일정은 회사 화면) · 태양 회사만 이름 곁 해 · 회사 화면 링크가 판과 같음`, cardsTotal === N && seen.size === N && [...seen.values()].every(v => v === 1) && !cardMis.length, {cardMis: cardMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 읽는 법 접힌 칸 없음(카드에 출목표·별이 없으므로)`, !agMis.length, {agMis: agMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 업종 이름 출처(한국거래소 · 네이버 증권)는 접힘 「업종 이름 출처」 · 머리에는 기간 한 줄만(「잡스가 … 36가지」 A4)`, !namesMis.length, {namesMis: namesMis.slice(0, 3)});
  check(`${label} 업종 화면 ${G}장 모두: 카드마다 선 그래프(종가 ${board.companies[0].c.length}개 · 5곳 같은 눈금 · 오름/내림 색) · 수급(외국인·기관 5거래일 합) · 회사 이름이 든 최근 기사(시각·언론사·제목) = 판(없으면 「아직 모으지 않음」)`, !briefMis.length, {briefMis: briefMis.slice(0, 4)});
  check(`${label} 업종 화면 ${G}장 모두: 앞날 말·쓰지 않는 말 없음 · 예측 표시 0`, !wordsBad.length, {wordsBad: wordsBad.slice(0, 3)});
  check(`${label} 업종 화면 ${G}장 모두: 화면이 옆으로 넘치지 않음(폭 ${viewport.width}px)`, !overflow.length, {overflow: overflow.slice(0, 3)});
  // 업종 화면에서 회사 이름 → 회사 화면 → 「‹ 업종」 → 그 업종 화면
  await page.evaluate(id => { location.hash = '#/i/' + id; }, hg.id); await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card`); await page.waitForTimeout(200);
  const pickCode = hg.codes?.[1] ?? board.groups.find(g => g.id === hg.id).codes[1], pick = byCodeB.get(pickCode);
  const link = page.locator(`.b-card[data-code="${pickCode}"] .b-name-row`); await link.scrollIntoViewIfNeeded();
  if (mobile) await link.tap(); else await link.click();
  await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
  const cb = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
  check(`${label} 업종 「${hg.label}」 → ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pickCode}(「${cb.title}」) · 되돌아가기 「${cb.back[1]}」 = 그 업종`, cb.hash === '#/stock/' + pickCode && cb.title === pick.name && cb.back[0] === '#/i/' + hg.id && cb.back[1] === '‹ ' + hg.label, cb);
  const backLoc = page.locator('.c-back'); if (mobile) await backLoc.tap(); else await backLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"]`); await page.waitForTimeout(150);
  check(`${label} 회사 화면 「‹ ${hg.label}」 ${mobile ? '터치' : '누름'} → 그 업종 화면으로 돌아옴`, (await page.evaluate(() => location.hash)) === '#/i/' + hg.id);
  // ①-3 탭 「오름 상위」(#/rise · 2026-10-05 05:07 「해」 — 처음 화면 아래에 있던 목록을 자기 탭으로) — 판과 같은 22곳 · 줄 → 회사 → 「‹ 불장 밖에서 많이 오른 N곳」 → 보던 자리
  {
    const tH = page.locator('.bottom-link[data-route="home"]'); if (mobile) await tH.tap(); else await tH.click(); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(150);
    const t22 = page.locator('.hs-b[data-seg="rise"]'); if (mobile) await t22.tap(); else await t22.click();
    await page.waitForSelector('.r-page'); await page.waitForTimeout(300);
    await shot('02b-rise');
    const rr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, seg: document.querySelector('.hs-b[aria-current="page"]')?.dataset.seg ?? null, moves: document.querySelector('.r-moves')?.innerText.trim() ?? null, mvx: document.querySelector('.hs-seg + .mvx')?.dataset.state ?? null,
      next: [...document.querySelectorAll('.nc-list .nc-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), sun: !!a.querySelector('.nc-name svg.sun-tag'), name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const scN = scaleW(NEXT.map(x => byCodeB0.get(x.code)));
    check(`${label} 스위치 「오름 상위」 ${mobile ? '터치' : '누름'} → #/rise · 제목 「${rr.title}」 · 「${rr.when}」 · 탭 「불장」 눌림 · 스위치 「오름 상위」 고름`, rr.hash === '#/rise' && rr.title === `오름 상위 ${NEXT.length}곳` && rr.when === `불장 ${HOT.length}개 업종 밖 회사 ${NEXT.length}곳 — 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지` && rr.active === 'home' && rr.seg === 'rise', {...rr, next: undefined});
    check(`${label} 「오름 상위」: 줄 ${rr.next.length}개 = 판(${NEXT.length}곳) · 줄마다 이름·업종·작은 선 그래프(종가 ${board.companies[0].c.length}개 · ${NEXT.length}곳 같은 눈금)·20거래일 변화·회사 화면 링크 · 불장 업종 회사 없음 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · 옆으로 넘치지 않음`, board.next && rr.next.length === NEXT.length && NEXT.every((x, i) => rr.next[i]?.href === '#/stock/' + x.code && rr.next[i]?.name === x.name && rr.next[i]?.ind === x.groupLabel && rr.next[i]?.chg === p1(x.change20) && rr.next[i]?.sp?.n === byCodeB0.get(x.code).c.length && rr.next[i]?.sp?.lo === scN.lo.toFixed(4) && rr.next[i]?.sp?.hi === scN.hi.toFixed(4) && rr.next[i]?.sun === SUNW.set.has(x.code)) && !NEXT.some(x => HOT.some(hh => hh.id === x.groupId)) && Object.values(NEXT.reduce((m, x) => (m[x.groupId] = (m[x.groupId] ?? 0) + 1, m), {})).every(v => v <= (board.next.perIndustry ?? 2)) && rr.sw <= rr.iw, {next: rr.next.slice(0, 3), sw: rr.sw});
    const mvState = !board.moves ? 'none' : board.moves.first ? 'first' : 'moves';
    check(`${label} 「오름 상위」: 저녁 7시 들고 남 칸이 스위치 바로 아래(${rr.mvx}) = 판(${mvState}) · 옛 한 줄 없음`, rr.mvx === mvState && rr.moves === null, {mvx: rr.mvx, moves: rr.moves});
    await wordsCheck(page, `${label} 「오름 상위」`);
    if (NEXT.length) {
      const n0 = NEXT[Math.min(5, NEXT.length - 1)], row = page.locator(`.nc-row[href="#/stock/${n0.code}"]`); await toMid(row);
      const y0 = await page.evaluate(() => Math.round(scrollY));
      if (mobile) await row.tap(); else await row.click();
      await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
      const nr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「오름 상위」 줄 「${n0.name}」 ${mobile ? '터치' : '누름'} → 회사 화면 · 되돌아가기 「${nr.back[1]}」 · 탭 「불장」 눌린 채로`, nr.hash === '#/stock/' + n0.code && nr.title === n0.name && nr.back[0] === '#/rise' && nr.back[1] === '‹ 오름 상위' && nr.active === 'home', nr);
      const bk = page.locator('.c-back'); if (mobile) await bk.tap(); else await bk.click();
      await page.waitForSelector('.r-page .nc-row'); await page.waitForTimeout(400);
      const rb = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
      check(`${label} 회사 화면 「‹ 오름 상위」 → 오름 상위 · 보던 자리(${y0}px → ${rb.y}px)`, rb.hash === '#/rise' && Math.abs(rb.y - y0) <= 2, {y0, rb});
    }
  }
  // ①-4 탭 「예비」(#/similar · 2026-10-05 05:03 「불장에 공통된점을 찾아 아직 불징이 아닌 종목 7개를」 · 05:07 「해」) — 이 검사기가 판의 셈을 따로 다시 센다
  {
    const SIM = board.similar, ts = page.locator('.hs-b[data-seg="similar"]'); if (mobile) await ts.tap(); else await ts.click();
    await page.waitForSelector('.s-page'); await page.waitForTimeout(300);
    await shot('02c-similar');
    // 따로 센 공통점 후보 아홉(화면·판 코드와 따로 적음) — true / false / null(모름)
    const fin = v => typeof v === 'number' && Number.isFinite(v);
    const TW = {ups: c => c.c?.length >= 21 ? c.c.slice(1).filter((v, i) => v / c.c[i] - 1 > 0.001).length >= 10 : null, r5: c => c.c?.length >= 6 ? c.c.at(-1) > c.c.at(-6) : null, r20: c => fin(c.change20) ? c.change20 > 0 : null,
      fgn: c => fin(c.brief?.flows?.foreign) ? c.brief.flows.foreign > 0 : null, ins: c => fin(c.brief?.flows?.institution) ? c.brief.flows.institution > 0 : null, hold: c => c.brief?.flows?.holdPct ? c.brief.flows.holdPct.last > c.brief.flows.holdPct.first : null,
      y1: c => fin(c.info?.ret252) ? c.info.ret252 > 0 : null, top: c => fin(c.info?.pos52) ? c.info.pos52 >= 0.8 : null, news: c => c.brief && !c.brief.missing.includes('기사') && fin(c.brief.newsNamed) ? c.brief.newsNamed > 0 : null};
    const hotIds = new Set(HOT.map(x => x.id)), hotCs = board.companies.filter(c => hotIds.has(c.group?.id)), restCs = board.companies.filter(c => !hotIds.has(c.group?.id));
    const tal = (cs, f) => { const v = cs.map(f).filter(x => x !== null); return {yes: v.filter(Boolean).length, known: v.length}; }, rt = x => x.known ? x.yes / x.known : 0;
    const tw = Object.entries(TW).map(([id, f]) => { const h = tal(hotCs, f), r = tal(restCs, f); return {id, h, r, gap: rt(h) - rt(r)}; });
    let commonW = tw.filter(t => t.h.known && rt(t.h) > 0.5 && t.gap > 0.10); if (hotCs.length && commonW.length < 3) commonW = [...commonW, ...tw.filter(t => t.h.known && t.gap > 0 && !commonW.includes(t)).sort((a, b) => b.gap - a.gap).slice(0, 3 - commonW.length)];
    const cIds = Object.keys(TW).filter(id => commonW.some(t => t.id === id)), needW = Math.floor(cIds.length / 2) + 1;
    const scored = restCs.map(c => ({c, has: cIds.filter(id => TW[id](c) === true)})).filter(x => cIds.length && x.has.length >= needW).sort((a, b) => b.has.length - a.has.length || (fin(b.c.change20) ? b.c.change20 : -Infinity) - (fin(a.c.change20) ? a.c.change20 : -Infinity) || a.c.code.localeCompare(b.c.code));
    const per = new Map(), simW = []; for (const x of scored) { const g = x.c.group?.id ?? 'none'; if ((per.get(g) ?? 0) >= 2) continue; per.set(g, (per.get(g) ?? 0) + 1); simW.push(x); if (simW.length === 7) break; }
    check(`${label} 「예비」: 판의 닮은 ${SIM.items.length}곳 = 이 검사기가 따로 센 ${simW.length}곳(공통점 ${cIds.join('·')} · ${needW}가지 이상 · 한 업종 2곳 · 같으면 20거래일 많이 오른 차례)`, SIM.common.join() === cIds.join() && SIM.items.map(x => x.code).join() === simW.map(x => x.c.code).join() && SIM.items.every((x, i) => x.has.join() === simW[i].has.join()), {board: SIM.items.map(x => x.name), mine: simW.map(x => x.c.name), common: SIM.common, cIds});
    const sr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, seg: document.querySelector('.hs-b[aria-current="page"]')?.dataset.seg ?? null,
      mvx: (() => { const b = document.querySelector('.hs-seg + .mvx'); return b ? {state: b.dataset.state, head: b.querySelector('.mvx-h')?.innerText.replace(/\s+/g, ' ').trim(), rows: [...b.querySelectorAll('.mvx-row')].map(r => ({kind: r.dataset.kind, n: +r.dataset.n, who: r.querySelector('.mvx-who')?.textContent.trim()})), n22: b.querySelector('.mvx-22')?.textContent.trim() ?? null} : null; })(),
      rows: [...document.querySelectorAll('.sm-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), sun: !!a.querySelector('.nc-name svg.sun-tag'), all: a.querySelector('.sm-all')?.textContent.trim() ?? null, name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), cnt: a.querySelector('.sm-cnt > b')?.textContent.trim(), chips: [...a.querySelectorAll('.sm-chip')].map(c => `${c.dataset.trait}:${c.classList.contains('on') ? 'on' : c.classList.contains('unk') ? 'unk' : 'off'}:${c.querySelector('.sm-ck')?.textContent}`), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      bars: [...document.querySelectorAll('.tr-row')].map(r => ({id: r.dataset.trait, w: [...r.querySelectorAll('.tr-fill')].map(f => parseFloat(f.style.width)), vals: [...r.querySelectorAll('.tr-val')].map(v => v.textContent.trim()), ns: [...r.querySelectorAll('.tr-n')].map(v => v.textContent.trim())})),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const commonT = SIM.common.map(id => SIM.traits.find(t => t.id === id));
    check(`${label} 스위치 「예비」 ${mobile ? '터치' : '누름'} → #/similar · 제목 「${sr.title}」 · 「${sr.when}」 · 탭 「불장」 눌림 · 스위치 「예비」 고름`, sr.hash === '#/similar' && sr.title === `예비 ${SIM.items.length}곳` && sr.when === `불장 닮은 ${SIM.items.length}곳 — 불장 ${HOT.length}개 업종 ${SIM.hotCompanies}곳의 공통점 ${SIM.common.length}가지를 많이 가진, 불장 밖 회사 · ${kd(toM)} 종가` && sr.active === 'home' && sr.seg === 'similar', {...sr, rows: undefined, bars: undefined, mvx: undefined});
    const scS = scaleW(SIM.items.map(x => byCodeB0.get(x.code)));
    const SIMS = [...SIM.items].sort(riseDesc); // 보이는 차례 = 지난 20거래일 많이 오른 순(2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로」) · 고르는 셈은 위에서 판 차례로 따로 맞댐
    const rowMis = SIMS.map((x, i) => { const r = sr.rows[i], full = x.matched === commonT.length && commonT.length; const chipsWant = full ? [] : commonT.map(t => `${t.id}:${x.has.includes(t.id) ? 'on:✓' : x.unknown.includes(t.id) ? 'unk:?' : 'off:·'}`); // 모두 가지면 「✓ 모두」 한마디(「잡스가 … 36가지」 D3)
      return r && r.href === '#/stock/' + x.code && r.name === x.name && r.ind === x.groupLabel && r.chg === p1(x.change20) && r.cnt === `공통점 ${commonT.length}가지 중 ${x.matched}가지` && r.chips.join() === chipsWant.join() && r.all === (full ? '✓ 모두' : null) && r.sun === SUNW.set.has(x.code) && r.sp?.n === byCodeB0.get(x.code).c.length && r.sp?.lo === scS.lo.toFixed(4) && r.sp?.hi === scS.hi.toFixed(4) ? null : {i, x: x.name, r}; }).filter(Boolean);
    check(`${label} 「예비」: 줄 ${sr.rows.length}개 = 판 · 지난 20거래일 많이 오른 차례 · 줄마다 이름 · 업종 · 20거래일 변화 · 「공통점 n가지 중 m가지」 · 공통점 표시(모두 가지면 「✓ 모두」 · 아니면 ✓ 가짐 · 「·」 안 가짐 · 「?」 모름 — 색만이 아님) · 태양 회사만 이름 곁 해 · 선 그래프(${SIM.items.length}곳 같은 눈금) · 옆으로 넘치지 않음`, sr.rows.length === SIM.items.length && !rowMis.length && sr.sw <= sr.iw, {rowMis: rowMis.slice(0, 2), sw: sr.sw});
    const pc = x => `${Math.round((x.known ? x.yes / x.known : 0) * 100)}%`;
    const barMisS = commonT.map((t, i) => { const b = sr.bars[i], w = x => Math.max(1, (x.known ? x.yes / x.known : 0) * 100); return b && b.id === t.id && Math.abs(b.w[0] - w(t.hot)) < 0.01 && Math.abs(b.w[1] - w(t.rest)) < 0.01 && b.vals.join() === `${pc(t.hot)},${pc(t.rest)}` && b.ns.join() === `${t.hot.yes}/${t.hot.known}곳,${t.rest.yes}/${t.rest.known}곳` ? null : {t: t.id, b}; }).filter(Boolean);
    check(`${label} 「예비」: 공통점 막대 ${sr.bars.length}줄 = 판의 공통점 ${commonT.length}가지 · 줄마다 불장 · 나머지 몇 %(막대 길이 = %)`, sr.bars.length === commonT.length && !barMisS.length, {barMisS: barMisS.slice(0, 2)});
    const mv = board.moves, names = xs => xs.length ? xs.map(x => x.label ?? (x.groupLabel ? `${x.name}(${x.groupLabel})` : x.name)).join(' · ') : '없음';
    const mvOk = !mv ? sr.mvx?.state === 'none' : mv.first ? sr.mvx?.state === 'first' && sr.mvx.head.includes(`${kd(mv.to)} 종가 · 처음 기록`)
      : sr.mvx?.state === 'moves' && sr.mvx.head.startsWith(`저녁 7시 들고 남 ${kd(mv.from)} 종가 → ${kd(mv.to)} 종가 · `) && [['hot-in', mv.hotIn], ['hot-out', mv.hotOut], ['became', mv.becameHot], ['sim-in', mv.similarIn], ['sim-out', mv.similarOut]].every(([k, xs], i) => sr.mvx.rows[i]?.kind === k && sr.mvx.rows[i]?.n === xs.length && sr.mvx.rows[i]?.who === names(xs)) && sr.mvx.n22 === `오름 상위: 새로 든 곳 ${mv.nextIn.length}곳 · 빠진 곳 ${mv.nextOut.length}곳`;
    check(`${label} 「예비」: 맨 위 「저녁 7시 들고 남」 칸 = 판(${!mv ? '기록 없음' : mv.first ? '처음 기록' : `${mv.from} → ${mv.to}`})`, mvOk, sr.mvx);
    await wordsCheck(page, `${label} 「예비」`);
    if (SIM.items.length) {
      const s0 = SIM.items.at(-1), row = page.locator(`.sm-row[href="#/stock/${s0.code}"]`); await toMid(row);
      const y0 = await page.evaluate(() => Math.round(scrollY));
      if (mobile) await row.tap(); else await row.click();
      await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
      const cr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「예비」 줄 「${s0.name}」 ${mobile ? '터치' : '누름'} → 회사 화면 · 되돌아가기 「${cr.back[1]}」 · 탭 「불장」 눌린 채로`, cr.hash === '#/stock/' + s0.code && cr.title === s0.name && cr.back[0] === '#/similar' && cr.back[1] === '‹ 예비' && cr.active === 'home', cr);
      const bk = page.locator('.c-back'); if (mobile) await bk.tap(); else await bk.click();
      await page.waitForSelector('.s-page .sm-row'); await page.waitForTimeout(400);
      const sb = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
      check(`${label} 회사 화면 「‹ 예비」 → 예비 · 보던 자리(${y0}px → ${sb.y}px)`, sb.hash === '#/similar' && Math.abs(sb.y - y0) <= 2, {y0, sb});
    }
  }
  // 없는 업종 주소 → 알림 + 처음 화면으로 가는 길
  await page.evaluate(() => { location.hash = '#/i/zzzzzzzz'; }); await page.waitForSelector('.b-page .b-note'); await page.waitForTimeout(100);
  const unk = await page.evaluate(() => ({note: document.querySelector('.b-page .b-note')?.textContent.trim(), back: document.querySelector('.c-back')?.getAttribute('href')}));
  check(`${label} 없는 업종 주소 #/i/zzzzzzzz → 「${unk.note}」 · 들어온 탭으로 가는 길(${unk.back})`, unk.note === '이 업종은 지금 판에 없습니다' && ['#/', '#/map'].includes(unk.back), unk);

  // ② 회사 화면 세 곳(처음 · 늦은 종가 회사가 있으면 그 회사 · 마지막)
  // 태양 회사 한 곳도 넣는다(2026-10-05 15:24 「잡스가 … 36가지」 B2 — 태양 점검 칸이 태양 · 태양 아님 둘 다 맞는지)
  const picks = [...new Set([board.companies[0], ...board.late.map(l => board.companies.find(c => c.code === l.code)), [...board.companies].sort(riseDesc).find(c => SUNW.set.has(c.code)), board.companies.at(-1)].filter(Boolean))];
  for (const c of picks) {
    const s = await get('data/atlas11/view/stocks/' + c.code + '.json'), e = agenda.byCode[c.code];
    await page.goto(base + '/#/stock/' + c.code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    if (c === picks[0]) await shot('02-company');
    const r = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), c20: document.querySelector('.c-20')?.innerText.trim(), band: document.querySelector('.c-chart .lc-band')?.dataset.from ?? null, near: [...document.querySelectorAll('.c-near .nc-row')].map(a => a.getAttribute('href').slice(8)), price: document.querySelector('.b-price.big .b-close')?.innerText.trim(), date: document.querySelector('.b-price.big .b-date')?.innerText.trim(), ticks: [...document.querySelectorAll('.c-chart .lc-tick')].map(t => t.textContent), path: document.querySelector('.c-chart .lc-line')?.getAttribute('d')?.split(/[ML]/).filter(Boolean).length ?? 0,
      info: [...document.querySelectorAll('.c-info dd')].map(d => d.textContent.trim()) /* 1년 숫자는 접힌 칸 안(2026-10-05 「잡스라면」 22·25번) — 접힌 칸 글은 innerText 가 빈 글이라 textContent 로 */, ev: document.querySelectorAll('.ag-ev .ag-li').length, ds: document.querySelectorAll('.ag-ds .ag-li').length, beads: document.querySelectorAll('.road .bead').length}));
    const wantTick = `${s.closes60.at(-1).date.slice(5, 7)}/${s.closes60.at(-1).date.slice(8, 10)}`;
    check(`${label} 회사 ${c.name}: 이름 · 종가 ${r.price} · 「${r.date}」 · 지난 ${s.closes60.length}거래일 선(점 ${r.path}) · 마지막 눈금 ${wantTick} · 1년 최고·최저 · 출목표 ${r.beads}개 · 일정 ${r.ev}·공시 ${r.ds}줄 = 일정표`,
      r.title === c.name && r.price === won(c.close) && r.date === `${kd(c.date)} 15:30 종가` && r.path === s.closes60.length && r.ticks.includes(wantTick) && r.info[0] === won(c.info.high52) && r.info[1] === won(c.info.low52) && r.beads === roadOf(c.c).cells.length && r.ev === e.upcoming.length && r.ds === e.disclosures.length, r);
    // 앞 화면과 이어 보이기(2026-10-05 잡스 개혁): 20거래일 변화 = 판 · 60거래일 그래프 안 20거래일 띠의 첫날 = 판의 첫날 · 같은 업종 4곳 = 판의 업종 차례
    const gq = board.groups.find(g => g.id === c.group?.id), nearWant = gq ? gq.codes.filter(x => x !== c.code).map(x => byCodeB.get(x)).sort(riseDesc).map(x => x.code) : [];
    check(`${label} 회사 ${c.name}: 「${r.c20}」 = 판의 20거래일 변화 · 그래프 띠 첫날 ${r.band} = ${c.cFrom} · 같은 업종 ${r.near.length}곳 = 판`, r.c20 === `지난 20거래일 ${Number.isFinite(c.change20) ? p1(c.change20) : '없음'} · ${kd(c.cFrom)}부터 ${kd(c.date)}까지` && r.band === c.cFrom && r.near.join() === nearWant.join(), {c20: r.c20, band: r.band, near: r.near, nearWant});
    { const cs = await page.evaluate(() => { const x = document.querySelector('.c-sun'); return {title: !!document.querySelector('.b-title svg.sun-tag'), near: [...document.querySelectorAll('.c-near .nc-row')].map(a => `${a.getAttribute('href').slice(8)}:${!!a.querySelector('.nc-name svg.sun-tag')}`), box: x ? {on: x.dataset.sun, has: x.dataset.has, h: x.querySelector('.c-sun-h')?.textContent.trim(), sun: !!x.querySelector('.c-sun-h svg.sun'), li: [...x.querySelectorAll('.c-sun-list li')].map(li => `${li.dataset.shape}:${li.dataset.has}`), go: x.querySelector('.sun-go')?.getAttribute('href'), in: !!x.closest('.b-box')?.querySelector('.rd-box')} : null}; });
      const on = SUNW.set.has(c.code), hs = SUNW.has.get(c.code) ?? [], k = SUNW.common.length;
      check(`${label} 회사 ${c.name}: 태양 점검(출목표 칸 안) 「${cs.box?.h}」 · 모양 ${k}가지마다 ✓/· · 이름 곁 해 ${cs.title ? '있음' : '없음'} · 같은 업종 줄 해 = 따로 센 값`, !!cs.box && cs.box.in && cs.box.on === String(on) && cs.box.has === String(hs.length) && cs.box.sun === on
        && cs.box.h === (on ? `태양 — 오른 회사들의 공통 모양 ${k}가지를 모두 가짐` : `태양 아님 — 오른 회사들의 공통 모양 ${k}가지 가운데 ${hs.length}가지`) && cs.box.li.join() === SUNW.common.map(t => `${t.id}:${hs.includes(t.id)}`).join() && cs.box.go === '#/road/sun'
        && cs.title === on && cs.near.every(x => { const [code, v] = x.split(':'); return v === String(SUNW.set.has(code)); }), cs); }
    await page.locator('.c-ctx summary').click(); await page.waitForTimeout(150);
    const ctx = await page.evaluate(() => ({news: document.querySelectorAll('.c-ctx .c-news')[0]?.querySelectorAll('li').length ?? 0, flows: document.querySelectorAll('.c-ctx tbody tr').length}));
    check(`${label} 회사 ${c.name}: 수급·기사·공시 기록 열림 · 기사 ${ctx.news}건 = ${s.context?.news.length ?? 0} · 수급 ${ctx.flows}거래일 = ${s.context?.flows.length ?? 0}`, ctx.news === (s.context?.news.length ?? 0) && ctx.flows === (s.context?.flows.length ?? 0), ctx);
    await wordsCheck(page, `${label} 회사 ${c.name}(기록 열림)`);
    { const b = c.brief, nm = await page.evaluate(() => document.querySelector('.c-brief .nw-miss')?.textContent.trim() ?? null); // C1 회사 화면 안에서는 「회사 화면에」 대신 「아래 「수급·기사·공시 기록」에」
      const want = !b ? null : b.news ? null : b.missing.includes('기사') ? '아직 모으지 않음' : b.newsCount ? `회사 이름이 든 기사 없음 · 모은 기사 ${b.newsCount}건은 아래 「수급·기사·공시 기록」에` : '모은 기사 없음';
      check(`${label} 회사 ${c.name}: 수급·기사 칸 기사 줄 「${nm ?? '기사 있음'}」 — 회사 화면이 저를 가리키지 않음`, nm === want, {nm, want}); }
  }

  // ②-2 이어 보기(2026-10-05 15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」 E2~E6)
  {
    const RK = [...board.companies].sort(riseDesc), press2 = async loc => { await loc.scrollIntoViewIfNeeded(); if (mobile) await loc.tap(); else await loc.click(); };
    const rankRead = () => page.evaluate(() => { const n = document.querySelector('.c-rank'); return n ? {prev: n.querySelector('.c-rk-prev')?.getAttribute('href') ?? null, prevT: n.querySelector('.c-rk-prev')?.textContent.trim() ?? null, next: n.querySelector('.c-rk-next')?.getAttribute('href') ?? null, nextT: n.querySelector('.c-rk-next')?.textContent.trim() ?? null, mid: n.querySelector('.c-rk-mid')?.textContent.trim(), midHref: n.querySelector('.c-rk-mid')?.getAttribute('href')} : null; });
    const rkMis = [];
    for (const i of [0, 12, RK.length - 1]) { const c = RK[i]; await page.goto(base + '/#/stock/' + c.code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(150);
      const r = await rankRead(), want = {prev: i ? '#/stock/' + RK[i - 1].code : null, prevT: i ? `‹ ${i}위` : null, next: RK[i + 1] ? '#/stock/' + RK[i + 1].code : null, nextT: RK[i + 1] ? `${i + 2}위 ›` : null, mid: `오른 순 ${RK.length}곳 가운데 ${i + 1}위 · 출목표 자리 ›`, midHref: '#/road/at/' + c.code};
      if (JSON.stringify(r) !== JSON.stringify(want)) rkMis.push({i, r, want}); }
    check(`${label} 회사 화면 오른 순 자리 「‹ n위 · 오른 순 ${RK.length}곳 가운데 n위 · n위 ›」 = 따로 센 차례(1위 · 13위 · ${RK.length}위)`, !rkMis.length, {rkMis: rkMis.slice(0, 2)});
    // 13위 회사에서 「14위 ›」 → 14위 회사 · 가운데 → 출목표 오른 순 그 칸(테)
    await page.goto(base + '/#/stock/' + RK[12].code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(150);
    await press2(page.locator('.c-rk-next')); await page.waitForFunction(code => location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), RK[13].code); await page.waitForTimeout(200);
    const t14 = await page.evaluate(() => document.querySelector('.b-title')?.innerText.trim());
    check(`${label} 회사 화면 「14위 ›」 ${mobile ? '터치' : '누름'} → 오른 순 14위 「${t14}」 회사 화면`, t14 === RK[13].name, {t14});
    await press2(page.locator('.c-rk-mid')); await page.waitForSelector('.f-body[data-mode="rise"][data-ready] .f-tile.f-hit'); await page.waitForTimeout(300);
    const at = await page.evaluate(() => { const t = document.querySelector('.f-tile.f-hit'), b = t?.getBoundingClientRect(); return {hash: location.hash, tab: document.querySelector('.f-body')?.dataset.tab, code: t?.dataset.code, focus: document.activeElement === t, inView: b ? b.top >= 0 && b.bottom <= innerHeight + 1 || (b.top < innerHeight / 2 && b.bottom > innerHeight / 2) : false, active: document.querySelector('.bottom-link.active')?.dataset.route}; });
    check(`${label} 회사 화면 「오른 순 … 14위 · 출목표 자리 ›」 → 출목표 「오른 순」 「1위~20위」 탭의 그 칸(금빛 테 · 화면 가운데 · 초점)`, at.hash === '#/road' && at.tab === 'r1' && at.code === RK[13].code && at.focus && at.inView && at.active === 'road', at);
    // 그 칸 → 회사 → 같은 업종 칸 「… 업종 화면 ›」 → 업종 화면 「‹ 출목표」(아래 탭 「출목표」 눌린 채로)
    await press2(page.locator(`.f-tile[data-code="${RK[13].code}"]`)); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(200);
    const g13 = board.groups.find(g => g.id === RK[13].group?.id), ng = await page.evaluate(() => ({href: document.querySelector('.c-near-go a')?.getAttribute('href') ?? null, t: document.querySelector('.c-near-go a')?.textContent.trim() ?? null}));
    check(`${label} 회사 화면 같은 업종 칸 「${ng.t}」 → #/i/${g13?.id}`, ng.href === '#/i/' + g13?.id && ng.t === `${g13?.label} 업종 화면 · 누가 끌었나 ›`, ng);
    await press2(page.locator('.c-near-go a')); await page.waitForSelector(`article.i-page[data-group="${g13.id}"] .b-card`); await page.waitForTimeout(200);
    const ib = await page.evaluate(() => ({back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route, road: document.querySelector('.i-road a')?.getAttribute('href') ?? null, roadT: document.querySelector('.i-road a')?.textContent.trim() ?? null}));
    const fam13 = familyOf(g13.label);
    check(`${label} 출목표 → 회사 → 업종 화면: 되돌아가기 「${ib.back[1]}」 · 아래 탭 「출목표」 눌림 · 「${ib.roadT}」`, ib.back[0] === '#/road' && ib.back[1] === '‹ 출목표' && ib.active === 'road' && ib.road === '#/road/g/' + g13.id && ib.roadT === `출목표에서 「${fam13.label}」 갈래와 함께 보기 ›`, ib);
    // 업종 화면 「출목표에서 … 함께 보기 ›」 → 출목표 「업종별」 그 갈래 탭 · 그 업종 묶음(금빛 테 · 화면 위)
    await press2(page.locator('.i-road a')); await page.waitForSelector(`.f-body[data-mode="ind"][data-ready] #f-${g13.id}.f-hit`); await page.waitForTimeout(300);
    const ig = await page.evaluate(id => { const sct = document.getElementById('f-' + id), b = sct?.getBoundingClientRect(); return {hash: location.hash, tab: document.querySelector('.f-body')?.dataset.tab, top: b ? Math.round(b.top) : null, codes: [...(sct?.querySelectorAll('.f-tile') ?? [])].length}; }, g13.id);
    check(`${label} 업종 화면 「출목표에서 … 함께 보기 ›」 → 출목표 「업종별」 「${fam13.label}」 탭 · 「${g13.label}」 묶음 칸 ${ig.codes}개(화면 위 ${ig.top}px)`, ig.hash === '#/road' && ig.tab === fam13.id && ig.codes === g13.codes.length && ig.top !== null && ig.top >= -2 && ig.top < 200, ig);
    await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('atlas11:road')) localStorage.removeItem(k); }); // 아래 출목표 검사는 처음 들어온 사람처럼
  }

  // ③ 일정
  await page.goto(base + '/#/agenda', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-box'); await page.waitForTimeout(300);
  await shot('03-agenda');
  const ev = new Set(Object.values(agenda.byCode).flatMap(x => x.upcoming.map(u => u.id))), notices = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => d.notice)).length, big = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => !d.notice && d.level === 3)).length;
  const a = await page.evaluate(() => { const box = [...document.querySelectorAll('.b-box')]; const byLabel = l => box.find(b => b.getAttribute('aria-label') === l); return {market: byLabel('시장 전체 일정')?.querySelectorAll('.ag-li').length, company: byLabel('회사·업종 일정')?.querySelectorAll('.ag-li').length, notices: byLabel('예고 공시')?.querySelectorAll('.ag-li').length, big: byLabel('아주 중요한 공시')?.querySelectorAll('.ag-li').length, days: document.querySelectorAll('.a-day').length, active: document.querySelector('.bottom-link.active')?.dataset.route}; });
  check(`${label} 일정: 시장 ${a.market}건 · 회사·업종 ${a.company}건(${a.days}날) · 예고 공시 ${a.notices}건 · ★★★ 공시 ${a.big}건 = 일정표 · 아래 탭 「일정」 눌림`, a.market === agenda.market.length && a.company === ev.size && a.notices === notices && a.big === big && a.active === 'agenda', {a, want: {market: agenda.market.length, company: ev.size, notices, big}});
  await wordsCheck(page, `${label} 일정`);
  // 2026-10-05 15:24 「잡스가 … 36가지」 D1 · D2 — 긴 공시 목록은 앞 10건만 펼침(접힌 줄도 목록 안에 그대로 · 위 수 검사가 모두 셈)
  { const af = await page.evaluate(() => ['예고 공시', '아주 중요한 공시'].map(l => { const b = [...document.querySelectorAll('.b-box')].find(x => x.getAttribute('aria-label') === l), d = b?.querySelector('details.ag-fold'); return {l, all: b?.querySelectorAll('.ag-li').length ?? 0, shown: [...(b?.querySelectorAll('.ag-li') ?? [])].filter(li => !li.closest('details.ag-fold')).length, sum: d?.querySelector('summary')?.textContent.trim() ?? null, open: d?.open ?? null}; }));
    const word = {'예고 공시': '예고·알림 공시', '아주 중요한 공시': '아주 중요 공시'};
    check(`${label} 일정: 긴 공시 목록 접기 — ${af.map(x => `${x.l} ${x.shown}건 펼침 · ${x.all - x.shown}건 접힘`).join(' · ')}`, af.every(x => x.all <= 12 ? x.shown === x.all && x.sum === null : x.shown === 10 && x.open === false && x.sum === `${word[x.l]} ${x.all - 10}건 더 보기 · 모두 ${x.all}건`), af); }

  // ③-2 출목표(#/road) — 묶는 법 셋 × 그 안의 탭
  //   2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 … 추가로 더 만들어」 · 22:51 「그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
  //   2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로」 · 12:28 「출목표를 클릭하면 지금 365개 다 나오잖아 불편해 … 그 안에 탭을 더 만들어서 편하면서도 직관적으로」
  //   탭을 하나씩 모두 눌러 365곳이 빠짐·겹침 없이 이 검사기가 따로 줄 세운 차례대로 나오는지 센다(오른 순 19개 · 업종별 12개 · 흐름별 10가지)
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300);
  await shot('04-road');
  const roadRead = () => page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab ?? null,
    segs: [...document.querySelectorAll('.f-seg-b')].map(b => `${b.dataset.mode}:${b.getAttribute('aria-pressed')}:${b.textContent.trim()}`),
    hint: document.querySelector('.f-tabs-h')?.textContent.trim() ?? null,
    strip: (() => { const s = document.querySelector('.f-tabs'); return s ? {role: s.getAttribute('role'), scroll: s.dataset.scroll ?? null} : null; })(),
    tabs: [...document.querySelectorAll('.f-tabs .f-tab')].map(b => `${b.dataset.tab}|${b.getAttribute('aria-selected')}|${b.querySelector('.f-tab-l')?.textContent.trim()}|${b.querySelector('.f-tab-n')?.textContent.trim() ?? ''}|${b.querySelector('.f-tab-s svg.sun .sun-rays line') ? '☀' : ''}${b.querySelector('.f-tab-s')?.textContent.trim() ?? ''}`),
    spkBox: (() => { const x = document.querySelector('.f-spk-box'); return x ? {h: (x.querySelector('.f-spk-h svg.sun .sun-rays line') ? '☀' : '') + x.querySelector('.f-spk-h')?.textContent.trim(), t: x.querySelector('.f-spk-t')?.textContent.trim(), list: [...x.querySelectorAll('.f-spk-li')].map(li => `${li.dataset.shape}|${li.querySelector('.f-spk-n')?.textContent.trim()}|${li.querySelectorAll('.spk-pic .bead').length}`), all: [...x.querySelectorAll('.f-spk-all li')].map(li => ({id: li.dataset.shape, common: li.dataset.common, text: li.textContent.replace(/\s+/g, ' ').trim()}))} : null; })(),
    lead: document.querySelector('.f-body > .f-lead')?.textContent.trim() ?? null,
    more: document.querySelector('.f-body > .f-more')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
    pager: (() => { const g = document.querySelector('.f-body > .f-pager'); return g ? {next: g.querySelector('.f-pg-next')?.textContent.trim() ?? null, prev: g.querySelector('.f-pg-prev')?.textContent.trim() ?? null, pos: g.querySelector('.f-pg-pos')?.textContent.trim() ?? null} : null; })(),
    mean: (() => { const m = document.querySelector('.f-body .f-mean .spark.mini'); return m ? {n: +m.dataset.points, lo: m.dataset.lo, hi: m.dataset.hi, side: ['up', 'down', 'flat'].find(k => m.classList.contains(k)) ?? null} : null; })(),
    secs: [...document.querySelectorAll('.f-body > .f-sec')].map(s => ({domId: s.id, id: s.dataset.group ?? s.dataset.flow, rank: s.querySelector('.f-h-rank')?.textContent.trim() ?? null, name: (s.querySelector('.f-h-name') ?? s.querySelector('.t-h2'))?.firstChild?.textContent.trim(), fire: !!s.querySelector('.f-h .t-fire'), chg: s.querySelector('.f-h-chg')?.textContent.trim() ?? null, codes: [...s.querySelectorAll('.f-tile')].map(t => t.dataset.code)})),
    tiles: [...document.querySelectorAll('.f-tile')].map(t => ({code: t.dataset.code, href: t.getAttribute('href'), name: t.querySelector('.f-name')?.textContent.trim(), chg: t.querySelector('.f-chg')?.textContent.trim(), ind: t.querySelector('.f-ind')?.textContent.trim() ?? null, beads: t.querySelectorAll('.road .bead').length, up: t.querySelectorAll('.road .bead.up').length, st: t.querySelector('.f-st')?.textContent.trim(), unit: t.querySelector('.f-unit')?.textContent.trim() ?? null, sec: t.closest('.f-sec')?.id ?? null, sp: (() => { const sp = t.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...t.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: t.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: t.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: t.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: t.querySelector('.nw-miss')?.textContent.trim() ?? null, spk: t.dataset.sparkle ?? null, spkT: t.querySelector('.f-spk')?.textContent.trim() ?? null, late: t.querySelector('.f-late')?.textContent.trim() ?? null, sun: !!t.querySelector('.f-spk svg.sun .sun-rays line')})),
    notes: [...document.querySelectorAll('.f-body > .f-sec')].map(sct => ({id: sct.id, note: [...sct.querySelectorAll(':scope > .t-sub')].map(p => p.textContent.trim()).join(' ')})), ctx: document.querySelector('.f-ctx')?.textContent.trim() ?? null,
    stripHidden: document.querySelector('.f-tabs')?.hidden ?? null, pagerN: document.querySelectorAll('.f-body > .f-pager').length, lead2: document.querySelector('.f-body > .f-lead')?.textContent.trim() ?? null,
    go: (() => { const g = document.querySelector('.f-spk-go'); return g ? {t: g.textContent.trim(), sun: !!g.querySelector('svg.sun .sun-rays line')} : null; })(),
    first: (() => { const t = document.querySelector('.f-tile'); return t ? Math.round(t.getBoundingClientRect().top + scrollY) : null; })(), ih: innerHeight, keyIn: !!document.querySelector('.f-spk-box details.f-spk-how .f-key'), keyHead: document.querySelectorAll('.b-head .f-key').length, spkS: document.querySelector('.f-spk-box .f-spk-s')?.textContent.trim() ?? null,
    sw: document.documentElement.scrollWidth, iw: innerWidth}));
  const secScale = r => new Map(r.secs.map(x => [x.domId, scaleW(x.codes.map(code => byCodeB.get(code)))]));
  const briefTileMis = r => { const sc = secScale(r); return r.tiles.map(t => ({code: t.code, bad: briefMisW(t, byCodeB.get(t.code), sc.get(t.sec))})).filter(x => x.bad.length).concat(r.notes.filter(n => !n.note.includes(scaleTextW(sc.get(n.id)))).map(n => ({sec: n.id, note: n.note.slice(-60)}))); };
  const ctxGot = board.companies.filter(c => c.brief && !c.brief.missing.includes('수급') && !c.brief.missing.includes('기사')).length, ctxDay = board.companies.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  const ctxWant = ctxGot === N ? `수급·기사: ${N}곳 모두${ctxDay ? ` · ${kd(ctxDay)} 기준` : ''}` : `수급·기사: ${N}곳 가운데 ${ctxGot}곳만 모았음${ctxDay ? `(${kd(ctxDay)} 기준)` : ''} · 나머지 ${N - ctxGot}곳은 다음 관측 수집 때 채움`;
  const tileMisOf = (tiles, withInd) => tiles.filter(t => { const c = byCodeB.get(t.code), road = c && roadOf(c.c); return !c || t.href !== '#/stock/' + c.code || t.name !== c.name || t.chg !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || t.beads !== road.cells.length || t.up !== road.all.up || t.st !== upDaysW(c) || t.unit !== (road.unit > 0.01 ? `동그라미 하나 = ${Math.round(road.unit * 100)}%` : null) || (withInd ? t.ind !== board.groups.find(g => g.id === c.group?.id)?.label : t.ind !== null) || t.late !== (c.date && c.date < toM ? `${kd(c.date)} 종가까지` : null); }).map(t => t.code); // 늦은 종가 칸 표시(「잡스가 … 36가지」 F1)
  const press = async loc => { if (mobile) await loc.tap(); else await loc.click(); };
  const waitTab = id => page.waitForSelector(`.f-body[data-tab="${id}"][data-ready] .f-tile`);
  /** 「더 보기」를 다 눌러 그 탭을 모두 펼친다(누른 수를 돌려줌) */
  const expandAll = async () => { let k = 0; for (; k < 40; k++) { const m = page.locator('.f-body > .f-more'); if (!(await m.count())) break; await press(m); await page.waitForTimeout(60); } return k; };
  // 이 검사기가 따로 세운 차례 — 오른 순(20곳씩) · 큰 갈래(갈래 평균이 큰 순) · 흐름(묶음 평균이 큰 순 · 같으면 아홉 칸 표 차례)
  const rankedW = [...board.companies].sort(riseDesc), CH = 20, chunksW = Array.from({length: Math.ceil(N / CH)}, (_, i) => rankedW.slice(i * CH, i * CH + CH));
  const famW = familiesByRise(board.groups), rd0 = roadOf(board.companies[0].c);
  // 출목표 반짝(2026-10-05 13:53 「출목표를 보면 상승할 때에 묘한 공통점 … 반짝반짝 해가지고 바보도 알 수 있게끔」) — 화면 코드(shapes.js)와 따로 센다
  //   후보 여덟(표에 보이는 동그라미·줄) · 오른 순 위 20% 와 나머지 · 위 20%의 50% 넘게 · 나머지보다 10%p 넘게 = 공통 · 반짝 = 공통을 모두 가짐
  const runsW = rd => rd.cells.reduce((o, c) => { const l = o.at(-1); if (l && l.s === c.side) l.n++; else o.push({s: c.side, n: 1}); return o; }, []);
  const dayW = (rd, side) => Object.values(rd.cells.filter(c => c.side === side).reduce((m, c) => (m[c.day] = (m[c.day] ?? 0) + 1, m), {}));
  const recW = (rd, side) => rd.cells.filter(c => c.side === side && c.day >= rd.days - rd.recentDays).length;
  const SHAPE_W = [['longRed', '긴 빨강 줄', '긴 빨강 줄', rd => runsW(rd).some(x => x.s === 'up' && x.n >= 6)],
    ['redTwice', '빨강이 파랑의 2배', '빨강 2배', rd => { const u = rd.cells.filter(c => c.side === 'up').length, d = rd.cells.length - u; return u > 0 && u >= 2 * d; }],
    ['bigRedDay', '하루 빨강 5개', '하루 빨강 5개', rd => dayW(rd, 'up').some(n => n >= 5)],
    ['recentRed', '끝 5일 빨강', '끝 5일 빨강', rd => recW(rd, 'up') >= recW(rd, 'down') + 2],
    ['lastRed', '끝 줄 빨강', '끝 줄 빨강', rd => rd.cells.at(-1)?.side === 'up'],
    ['shortBlue', '짧은 파랑 줄', '짧은 파랑', rd => { const rs = runsW(rd); return rs.some(x => x.s === 'up') && rs.every(x => x.s !== 'down' || x.n <= 2); }],
    ['noBigBlue', '큰 파랑 날 없음', '큰 파랑 없음', rd => rd.cells.length > 0 && dayW(rd, 'down').every(n => n < 3)],
    ['redCols', '빨강 줄이 더 많음', '빨강 줄 많음', rd => { const rs = runsW(rd); return rs.filter(x => x.s === 'up').length > rs.filter(x => x.s === 'down').length; }]];
  const roadW = new Map(board.companies.map(c => [c.code, roadOf(c.c)])), topNW = Math.round(N * 0.2), topW = rankedW.slice(0, topNW), restW = rankedW.slice(topNW);
  const shapeW = SHAPE_W.map(([id, name, short, f]) => { const a = topW.filter(c => f(roadW.get(c.code))).length, b = restW.filter(c => f(roadW.get(c.code))).length; return {id, name, short, f, a, b, sa: a / topW.length, gap: a / topW.length - b / restW.length}; });
  let pickW = shapeW.filter(t => t.sa > 0.5 && t.gap > 0.10); if (pickW.length < 3) pickW = [...pickW, ...shapeW.filter(t => !pickW.includes(t) && t.gap > 0).sort((x, y) => y.gap - x.gap).slice(0, 3 - pickW.length)];
  const commonW = shapeW.filter(t => pickW.includes(t)), kW = commonW.length;
  const spkW = new Set(kW ? board.companies.filter(c => commonW.every(t => t.f(roadW.get(c.code)))).map(c => c.code) : []);
  const pcW = (y, n) => `${n ? Math.round(y / n * 100) : 0}%`;
  /** 칸마다 반짝 표시 = 따로 센 값(반짝이면 뜨거운 태양 그림 + 「오른 모양 n가지」 · 아니면 표시 없음 — 2026-10-05 14:30 「모양을 뜨거운 태양으로 하셔」) */
  const spkMisOf = tiles => tiles.filter(t => spkW.has(t.code) ? !(t.spk === String(kW) && t.spkT === `태양 · 오른 모양 ${kW}가지` && t.sun) : !(t.spk === null && t.spkT === null && !t.sun)).map(t => ({code: t.code, spk: t.spk, spkT: t.spkT, sun: t.sun}));
  const spkCount = codes => codes.filter(code => spkW.has(code)).length;
  const avgW = xs => { const v = xs.map(c => c.change20).filter(Number.isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : -Infinity; };
  const flowsWant = FLOW_ORDER_W.map(k => ({k, items: board.companies.filter(c => flowWant(roadOf(c.c)) === k).sort(riseDesc)})).filter(f => f.items.length)
    .map(f => ({...f, avg: avgW(f.items)})).sort((a, b) => b.avg - a.avg);
  const chipW = k => k === 'still' ? '거의 안 움직임' : flowTextW(k);
  const segsWant = on => [`rise:${on === 'rise'}:오른 순 ${N}곳`, ...(spkW.size ? [`sun:${on === 'sun'}:태양 ${spkW.size}곳`] : []), `ind:${on === 'ind'}:업종별 ${G}개`, `flow:${on === 'flow'}:흐름별 ${flowsWant.length}가지`].join('|'); // 태양 = 2026-10-05 14:40 「한 곳으로 모아줘」
  const riseLabels = chunksW.map((xs, k) => `${k * CH + 1}위~${k * CH + xs.length}위`);
  const starW = codes => { const n = spkCount(codes); return n ? `☀${n}곳` : ''; };
  const tabsWant = {rise: sel => chunksW.map((xs, k) => `r${k * CH + 1}|${k === sel}|${riseLabels[k]}||${starW(xs.map(c => c.code))}`),
    ind: sel => famW.map((f, k) => `${f.fam.id}|${k === sel}|${f.fam.label}|${Number.isFinite(f.avg) ? p1(f.avg) : '없음'}|${starW(f.groups.flatMap(g => g.codes))}`),
    flow: sel => flowsWant.map((f, k) => `${f.k}|${k === sel}|${chipW(f.k)}|${f.items.length}곳|${starW(f.items.map(c => c.code))}`)};
  const pagerWant = (labels, i) => ({next: i + 1 < labels.length ? `${i + 2}번째 탭 · ${labels[i + 1]} 보기 ›` : null, prev: i > 0 ? `‹ ${i}번째 탭 · ${labels[i - 1]}` : null, pos: `탭 ${labels.length}개 가운데 ${i + 1}번째`});
  const pagerOk = (r, labels, i) => { const w = pagerWant(labels, i); return r.pager?.next === w.next && r.pager?.prev === w.prev && r.pager?.pos === w.pos; };

  // ⓪ 처음 = 「오른 순」 첫 탭(1위~20위)
  const r0 = await roadRead();
  check(`${label} 출목표: 제목 「${r0.title}」 = 판 ${N}곳 · 「${r0.when}」 · 아래 탭 「출목표」 눌림 · 처음 = 오른 순 첫 탭(단추 ${r0.segs.join(' | ')})`, r0.title === `출목표 ${N}곳` && r0.when === `지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지` && r0.active === 'road' && r0.mode === 'rise' && r0.tab === 'r1' && r0.segs.join('|') === segsWant('rise'), {...r0, secs: undefined, tiles: undefined, notes: undefined});
  check(`${label} 출목표 오른 순: 탭 ${r0.tabs.length}개 = 20곳씩 ${chunksW.length}개(「${riseLabels[0]}」 … 「${riseLabels.at(-1)}」) · 첫 탭 고름 · 탭 줄 = 옆으로 밀어 보는 tablist · 「${r0.hint}」 · 한 번에 칸 ${r0.tiles.length}개`, r0.tabs.join() === tabsWant.rise(0).join() && r0.strip?.role === 'tablist' && r0.strip?.scroll === 'x' && r0.hint === `탭 ${chunksW.length}개 · 20곳씩 · 지난 20거래일 많이 오른 차례` && r0.tiles.length === CH, {tabs: r0.tabs.slice(0, 3), strip: r0.strip, hint: r0.hint, tiles: r0.tiles.length});
  check(`${label} 출목표 맨 위 반짝 상자(태양 그림): 「${r0.spkBox?.h}」 = 따로 센 ${spkW.size}곳 · 공통 모양 ${kW}가지(${commonW.map(t => t.short).join(' · ')}) · 모양마다 작은 출목표 그림 · 펼치면 후보 ${SHAPE_W.length}가지(오른 ${topNW}곳 · 나머지 ${restW.length}곳에서 몇 곳)`,
    !!r0.spkBox && r0.spkBox.h === `☀태양 ${spkW.size}곳` && r0.spkBox.t === `지난 20거래일 많이 오른 ${topNW}곳(오른 순 1위~${topNW}위)의 출목표에 많이 보이는 모양 ${kW}가지를 모두 가진 곳`
      && r0.spkBox.list.length === kW && r0.spkBox.list.every((x, i) => { const [id, short, nb] = x.split('|'); return id === commonW[i].id && short === commonW[i].short && +nb > 0; })
      && r0.spkBox.all.length === SHAPE_W.length && shapeW.every((t, i) => { const x = r0.spkBox.all[i], on = commonW.includes(t); return x && x.id === t.id && x.common === String(on) && x.text.startsWith(`${on ? '✓' : '·'} ${t.name} — `) && x.text.endsWith(`오른 ${topNW}곳 가운데 ${t.a}곳(${pcW(t.a, topNW)}) · 나머지 ${restW.length}곳 가운데 ${t.b}곳(${pcW(t.b, restW.length)})`); }),
    {spkBox: r0.spkBox, want: {n: spkW.size, common: commonW.map(t => `${t.id} ${t.a}/${topNW} ${t.b}/${restW.length}`)}});
  check(`${label} 출목표 맨 위 태양 상자: 단추 「${r0.go?.t}」(태양 그림) — 2026-10-05 14:40 「태양이 있는 곳을 한 곳으로 모아줘」`, !spkW.size ? r0.go === null : r0.go?.t === `태양 ${spkW.size}곳 한곳에 모아 보기 ›` && r0.go.sun, r0.go);
  // 2026-10-05 15:24 「잡스가 … 36가지」 A1 · A2 — 태양 상자는 제목 · 뜻 한 줄 · 모양 그림 · 단추 · 읽는 법(접힘) · 칸 읽는 법도 그 접힘 안 · 휴대폰 첫 화면에 첫 칸
  check(`${label} 출목표 첫 화면: 태양 상자 뜻 한 줄 「${r0.spkS}」 · 칸 읽는 법은 접힘 안 · 첫 칸 ${r0.first}px(${mobile ? `휴대폰 첫 화면 ${r0.ih}px 안` : 'PC'})`, (!spkW.size || (r0.spkS === `오른 회사들의 공통 모양 ${kW}가지를 모두 가진 곳` && r0.keyIn && r0.keyHead === 0)) && (!mobile || r0.first < r0.ih), {spkS: r0.spkS, keyIn: r0.keyIn, keyHead: r0.keyHead, first: r0.first, ih: r0.ih});
  await wordsCheck(page, `${label} 출목표 오른 순(첫 탭)`);
  // (옛 E1 출목표 제목 줄 「찾기」는 2026-10-05 20:24 아래 탭 「찾기」로 옮김 — 아래 ⑥에서 본다)
  {
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let spkSeen = 0;
    for (let k = 0; k < chunksW.length; k++) {
      if (k) { await press(page.locator('.f-body .f-pg-next')); await waitTab('r' + (k * CH + 1)); await page.waitForTimeout(k === 1 ? 800 : 60); }
      const r = k ? await roadRead() : r0, xs = chunksW[k], a = k * CH + 1, b = a + xs.length - 1, s = r.secs[0], note = r.notes[0]?.note ?? '';
      if (k === 1) { const y = await page.evaluate(() => Math.round(document.querySelector('.f-seg').getBoundingClientRect().top)); check(`${label} 출목표 맨 아래 「${pagerWant(riseLabels, 0).next}」 ${mobile ? '터치' : '누름'} → 그 탭 · 화면은 묶는 법 단추 자리로 올라감(위에서 ${y}px)`, r.tab === 'r21' && y >= 40 && y <= 100, {y, tab: r.tab}); }
      if (!(r.tab === 'r' + a && r.tabs.join() === tabsWant.rise(k).join() && r.secs.length === 1 && s?.domId === `f-r${a}` && s?.name === `${a}위~${b}위` && s?.codes.join() === xs.map(c => c.code).join() && note.startsWith(`${a}위 ${p1(xs[0].change20)} ~ ${b}위 ${p1(xs.at(-1).change20)} · `) && !note.includes('많이 오른 차례') /* 「많이 오른 차례」는 탭 줄 위 한 줄에 한 번만(「잡스가 … 36가지」 A1) */ && r.more === null && pagerOk(r, riseLabels, k))) mis.push({k, tab: r.tab, sec: s && {...s, codes: s.codes.length}, pager: r.pager, more: r.more});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, true); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 오른 순: 탭 ${chunksW.length}개를 맨 아래 넘김 단추로 하나씩 — 탭마다 20곳 = 이 검사기가 따로 줄 세운 지난 20거래일 많이 오른 차례(1위 ${rankedW[0].name} ${p1(rankedW[0].change20)} … ${N}위 ${rankedW.at(-1).name} ${p1(rankedW.at(-1).change20)}) · 머리 「a위~b위」 · 첫·끝 값 · 넘김 단추 글 · 「탭 n개 가운데 m번째」`, !mis.length, {mis: mis.slice(0, 2)});
    check(`${label} 출목표 오른 순: 탭 ${chunksW.length}개 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 이름·업종 이름·20거래일 변화·출목표 동그라미·「오른 날 n일」·「동그라미 하나 = n%」·회사 화면 링크 = 판`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 오른 순: 칸마다 선 그래프(20곳 탭마다 같은 눈금 · 눈금 글) · 수급 · 기사 = 판 · 「${r0.ctx}」 · 탭 ${chunksW.length}개 모두 옆으로 넘치지 않음`, !briefMis.length && r0.ctx === ctxWant && !over.length, {briefMis: briefMis.slice(0, 2), ctx: r0.ctx, ctxWant, over});
    check(`${label} 출목표 오른 순: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳(공통 모양 ${kW}가지를 모두 가진 곳) · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 태양 + 반짝 수 「n곳」(탭 줄 맞댐)`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 오른 순(마지막 탭)`);
    const t1 = page.locator('.f-tabs .f-tab[data-tab="r1"]'); await press(t1); await waitTab('r1'); await page.waitForTimeout(200);
    const rb = await page.evaluate(() => { const s = document.querySelector('.f-tabs'), b = s.querySelector('[aria-selected="true"]'), sr = s.getBoundingClientRect(), br = b.getBoundingClientRect(); return {tab: document.querySelector('.f-body').dataset.tab, sel: b.dataset.tab, inView: br.left >= sr.left - 1 && br.right <= sr.right + 1, first: document.querySelector('.f-tile')?.dataset.code}; });
    check(`${label} 출목표 탭 줄 「${riseLabels[0]}」 ${mobile ? '터치' : '누름'} → 첫 탭으로 · 고른 탭이 탭 줄 안에 보임`, rb.tab === 'r1' && rb.sel === 'r1' && rb.inView && rb.first === rankedW[0].code, rb);
    if (!mobile) {
      await page.locator('.f-tabs .f-tab[data-tab="r1"]').focus(); await page.keyboard.press('ArrowRight'); await waitTab('r21');
      const kb = await page.evaluate(() => ({tab: document.querySelector('.f-body').dataset.tab, focus: document.activeElement?.dataset?.tab ?? null}));
      await page.keyboard.press('Home'); await waitTab('r1');
      check(`${label} 출목표 탭 줄: 오른쪽 화살표 글쇠 → 둘째 탭(${kb.tab} · 초점도 그 탭) · Home → 첫 탭`, kb.tab === 'r21' && kb.focus === 'r21' && (await page.evaluate(() => document.querySelector('.f-body').dataset.tab)) === 'r1', kb);
    }
  }
  // ① 업종별 — 큰 갈래 12개가 탭
  await press(page.locator('.f-seg-b[data-mode="ind"]')); await page.waitForSelector('.f-body[data-mode="ind"][data-ready] .f-tile'); await page.waitForTimeout(250);
  {
    const i0 = await roadRead(), famLabels = famW.map(f => f.fam.label);
    check(`${label} 출목표 「업종별」 ${mobile ? '터치' : '누름'} → 단추 ${i0.segs.join(' | ')} · 탭 ${i0.tabs.length}개 = 큰 갈래 ${famW.length}개(갈래 평균이 큰 순 · 탭마다 갈래 평균) · 첫 탭 「${famLabels[0]}」 · 「${i0.hint}」`, i0.mode === 'ind' && i0.segs.join('|') === segsWant('ind') && i0.tab === famW[0].fam.id && i0.tabs.join() === tabsWant.ind(0).join() && i0.hint === `큰 갈래 탭 ${famW.length}개 · 갈래 평균이 큰 순 · 갈래 이름은 ATLAS가 업종 이름을 보고 묶은 것`, {tabs: i0.tabs.slice(0, 3), hint: i0.hint, tab: i0.tab});
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let maxShown = 0, spkSeen = 0;
    for (const [k, f] of famW.entries()) {
      if (k) { await press(page.locator(`.f-tabs .f-tab[data-tab="${f.fam.id}"]`)); await waitTab(f.fam.id); await page.waitForTimeout(60); }
      const first = await page.evaluate(() => document.querySelectorAll('.f-body .f-tile').length); maxShown = Math.max(maxShown, first);
      await expandAll();
      const r = await roadRead(), gs = board.groups.filter(g => familyOf(g.label).id === f.fam.id), cnt = gs.reduce((t, g) => t + g.codes.length, 0);
      const secOk = r.secs.length === gs.length && gs.every((g, j) => { const s = r.secs[j], gi = board.groups.indexOf(g), want = g.codes.map(code => byCodeB.get(code)).sort(riseDesc).map(c => c.code); return s && s.id === g.id && s.rank === `${gi + 1}위` && s.name === g.label && s.fire === Boolean(g.hot) && s.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && s.codes.join() === want.join(); });
      if (!(r.tab === f.fam.id && r.tabs.join() === tabsWant.ind(k).join() && secOk && r.lead === `${f.fam.label} · 업종 ${gs.length}개 · ${cnt}곳 · 갈래 평균 ${Number.isFinite(f.avg) ? p1(f.avg) : '없음'}` && pagerOk(r, famLabels, k) && first === Math.min(cnt, cnt <= 45 ? cnt : 20))) mis.push({k, fam: f.fam.label, tab: r.tab, lead: r.lead, secs: r.secs.map(s => s.id), pager: r.pager, first});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, false); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 업종별: 탭 ${famW.length}개를 하나씩 — 탭마다 그 갈래 업종 묶음만(판 차례 · n위·이름·「불장」·평균) · 업종 안은 많이 오른 순 · 맨 위 「갈래 · 업종 n개 · m곳 · 갈래 평균」 · 넘김 단추 · 처음 보이는 칸 많아야 ${maxShown}개`, !mis.length && maxShown <= 45, {mis: mis.slice(0, 2), maxShown});
    check(`${label} 출목표 업종별: 탭 ${famW.length}개 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 이름·변화·출목표·「오른 날 n일」·링크 = 판(업종 이름은 묶음 머리에)`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 업종별: 칸마다 선 그래프(업종 5곳 같은 눈금 · 눈금 글) · 수급 · 기사 = 판 · 탭 ${famW.length}개 모두 옆으로 넘치지 않음`, !briefMis.length && !over.length, {briefMis: briefMis.slice(0, 2), over});
    check(`${label} 출목표 업종별: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳 · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 반짝 수`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 업종별(마지막 탭)`);
  }
  // ② 흐름별 — 흐름 10가지가 탭 · 탭 머리에 묶음 평균 선(모든 흐름 같은 눈금) · 45곳이 넘으면 20곳씩 「더 보기」
  await press(page.locator('.f-seg-b[data-mode="flow"]')); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); await page.waitForTimeout(250);
  const meanW = cs => { const ok = cs.filter(c => c.date === toM); const n = Math.min(...ok.map(c => c.c.length)); return ok.length ? Array.from({length: n}, (_, i) => ok.reduce((t, c) => t + c.c[i] / c.c[0] - 1, 0) / ok.length) : []; };
  const meansW = new Map(flowsWant.map(f => [f.k, meanW(f.items)])), allM = [...meansW.values()].flat(), mlo = Math.min(-0.03, ...allM), mhi = Math.max(0.03, ...allM);
  {
    const q0 = await roadRead(), f0 = flowsWant[0], flowLabels = flowsWant.map(f => chipW(f.k));
    check(`${label} 출목표 「흐름별」 ${mobile ? '터치' : '누름'} → 탭 ${q0.tabs.length}가지 = 따로 나눈 흐름 ${flowsWant.length}가지(묶음 평균 지난 20거래일 변화가 큰 순: ${flowsWant.map(f => p1(f.avg)).join(' · ')}) · 탭마다 곳 수 · 첫 탭 「${flowLabels[0]}」`, q0.mode === 'flow' && q0.segs.join('|') === segsWant('flow') && q0.tab === f0.k && q0.tabs.join() === tabsWant.flow(0).join() && q0.hint === `흐름 탭 ${flowsWant.length}가지 · 묶음 평균(지난 20거래일 변화)이 큰 순 · 앞 ${rd0.beforeDays}거래일 → 끝 ${rd0.recentDays}거래일의 오른 날·내린 날 동그라미 수로 나눔`, {tabs: q0.tabs.slice(0, 3), hint: q0.hint});
    // 「더 보기」 — 첫 탭(가장 큰 흐름일 때가 많음)
    const total0 = f0.items.length, big0 = total0 > 45;
    const moreSteps = [];
    if (big0) {
      let shownN = 20, r = q0;
      for (let guard = 0; guard < 40 && r.more; guard++) {
        moreSteps.push({shown: r.tiles.length, more: r.more, okOrder: r.tiles.map(t => t.code).join() === f0.items.slice(0, shownN).map(c => c.code).join(), okLabel: r.more === `이 탭 ${shownN + 1}위~${Math.min(total0, shownN + 20)}위 더 보기 · 남은 ${total0 - shownN}곳`});
        const mb = page.locator('.f-body > .f-more'); await mb.scrollIntoViewIfNeeded(); await page.waitForTimeout(60); const y0 = await page.evaluate(() => Math.round(scrollY)); await press(mb); await page.waitForTimeout(80); shownN = Math.min(total0, shownN + 20); r = await roadRead();
        const y1 = await page.evaluate(() => Math.round(scrollY)); moreSteps.at(-1).still = Math.abs(y1 - y0) <= 2;
      }
      moreSteps.push({shown: r.tiles.length, more: r.more, okOrder: r.tiles.map(t => t.code).join() === f0.items.map(c => c.code).join(), okLabel: r.more === null, still: true});
    }
    check(`${label} 출목표 흐름별 첫 탭 「${flowLabels[0]}」 ${total0}곳: ${big0 ? `처음 20곳 · 「더 보기」 ${moreSteps.length - 1}번에 ${total0}곳 모두(차례 그대로 · 글에 다음 등수와 남은 곳 수 · 누르는 동안 화면은 그 자리)` : '45곳 이하라 한 번에 모두'}`, big0 ? q0.tiles.length === 20 && moreSteps.every(s => s.okOrder && s.okLabel && s.still) && moreSteps.at(-1).shown === total0 : q0.tiles.length === total0 && q0.more === null, {moreSteps});
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let spkSeen = 0;
    for (const [k, f] of flowsWant.entries()) {
      if (k) { await press(page.locator(`.f-tabs .f-tab[data-tab="${f.k}"]`)); await waitTab(f.k); await page.waitForTimeout(60); }
      const first = await page.evaluate(() => document.querySelectorAll('.f-body .f-tile').length);
      await expandAll();
      const r = await roadRead(), s = r.secs[0], m = meansW.get(f.k);
      const meanOk = r.mean && r.mean.n === m.length && r.mean.lo === mlo.toFixed(4) && r.mean.hi === mhi.toFixed(4) && r.mean.side === (m.at(-1) > 0 ? 'up' : m.at(-1) < 0 ? 'down' : 'flat');
      if (!(r.tab === f.k && r.tabs.join() === tabsWant.flow(k).join() && r.secs.length === 1 && s?.id === f.k && s?.name === flowTextW(f.k) && s?.codes.join() === f.items.map(c => c.code).join() && meanOk && pagerOk(r, flowLabels, k) && (k === 0 || first === (f.items.length > 45 ? 20 : f.items.length)))) mis.push({k, flow: f.k, tab: r.tab, sec: s && {...s, codes: s.codes.length}, mean: r.mean, pager: r.pager, first});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, true); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 흐름별: 탭 ${flowsWant.length}가지를 하나씩 — 탭마다 그 흐름 회사만(많이 오른 순) · 머리 이름 · 묶음 평균 선(종가 ${meansW.get(f0.k).length}개 · 흐름 ${flowsWant.length}가지 같은 눈금 ${pW(mlo, 0)} ~ ${pW(mhi, 0)} · 오름/내림 색) · 45곳이 넘는 탭은 처음 20곳 · 넘김 단추`, !mis.length, {mis: mis.slice(0, 2)});
    check(`${label} 출목표 흐름별: 탭 ${flowsWant.length}가지 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 업종 이름까지 판과 같음`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 흐름별: 칸마다 선 그래프(흐름마다 같은 눈금) · 수급 · 기사 = 판 · 탭 ${flowsWant.length}가지 모두 옆으로 넘치지 않음`, !briefMis.length && !over.length, {briefMis: briefMis.slice(0, 2), over});
    check(`${label} 출목표 흐름별: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳 · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 반짝 수`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 흐름별(마지막 탭)`);
    // 셋째 탭 칸 → 회사 화면(「‹ 출목표」) → 되돌아오면 같은 묶는 법 · 같은 탭 · 보던 자리
    const f3 = flowsWant[2] ?? flowsWant[0];
    await press(page.locator(`.f-tabs .f-tab[data-tab="${f3.k}"]`)); await waitTab(f3.k); await page.waitForTimeout(150);
    const pk = f3.items[Math.min(5, f3.items.length - 1)], tl = page.locator(`.f-tile[data-code="${pk.code}"]`); await toMid(tl); await page.waitForTimeout(150);
    const yBefore = await page.evaluate(() => Math.round(scrollY));
    await press(tl); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    const rc = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
    check(`${label} 출목표 흐름별 「${chipW(f3.k)}」 칸 ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pk.code}(「${rc.title}」) · 되돌아가기 「${rc.back[1]}」`, rc.hash === '#/stock/' + pk.code && rc.title === pk.name && rc.back[0] === '#/road' && rc.back[1] === '‹ 출목표', rc);
    await press(page.locator('.c-back')); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(400);
    const back = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab}));
    check(`${label} 회사 화면 「‹ 출목표」 → 출목표 · 같은 묶는 법(흐름별) · 같은 탭(${back.tab}) · 보던 자리(${yBefore}px → ${back.y}px)`, back.hash === '#/road' && back.mode === 'flow' && back.tab === f3.k && Math.abs(back.y - yBefore) <= 2, {yBefore, back});
    // 지금 탭(아래 「출목표」)을 한 번 더 누르면 맨 위로 · 묶는 법과 탭은 그대로
    await press(page.locator('.bottom-link[data-route="road"]')); await page.waitForTimeout(900);
    const tt = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab}));
    check(`${label} 출목표 탭을 한 번 더 ${mobile ? '터치' : '누름'} → 맨 위로(${tt.y}px) · 묶는 법·탭은 그대로(${tt.mode} · ${tt.tab})`, tt.hash === '#/road' && tt.y === 0 && tt.mode === 'flow' && tt.tab === f3.k, tt);
  }
  // ③ 태양 — 한곳에 모아 보기(2026-10-05 14:40 「태양이 있는 곳을 한 곳으로 모아줘 그래야 저기 이용하는 사람들이 쉬울 거 아냐」)
  //   맨 위 상자 단추 → 묶는 법 「태양」 · 태양 칸만 오른 순 그대로 모두(「더 보기」 없이) · 오른 순 자리 20칸마다 묶음 머리 · 탭 줄·넘김 단추 없음
  if (spkW.size) {
    const goBtn = page.locator('.f-spk-go'); await goBtn.scrollIntoViewIfNeeded(); await press(goBtn);
    await page.waitForSelector('.f-body[data-mode="sun"][data-ready] .f-tile'); await page.waitForTimeout(900);
    const sr = await roadRead(), segY = await page.evaluate(() => Math.round(document.querySelector('.f-seg').getBoundingClientRect().top));
    const sunsW = rankedW.filter(c => spkW.has(c.code)), inTopW = rankedW.slice(0, topNW).filter(c => spkW.has(c.code)).length;
    const bandsW = chunksW.map((xs, k) => ({a: k * CH + 1, b: k * CH + xs.length, xs: xs.filter(c => spkW.has(c.code))})).filter(x => x.xs.length);
    const secOk = sr.secs.length === bandsW.length && bandsW.every((w, j) => { const s = sr.secs[j]; return s && s.domId === `f-s${w.a}` && s.name === `오른 순 ${w.a}위~${w.b}위` && s.codes.join() === w.xs.map(c => c.code).join() && (sr.notes[j]?.note ?? '').startsWith(`${w.b - w.a + 1}곳 가운데 ${w.xs.length}곳 · 지난 20거래일 많이 오른 차례 · `); });
    check(`${label} 출목표 태양 상자 단추 ${mobile ? '터치' : '누름'} → 묶는 법 「태양」(단추 ${sr.segs.join(' | ')}) · 화면은 묶는 법 자리로(위에서 ${segY}px) · 탭 줄·넘김 단추 없음`, sr.mode === 'sun' && sr.segs.join('|') === segsWant('sun') && sr.stripHidden === true && sr.pagerN === 0 && segY >= 40 && segY <= 100 && sr.hint === `태양 ${spkW.size}곳만 한곳에 · 지난 20거래일 많이 오른 차례`, {mode: sr.mode, segs: sr.segs, stripHidden: sr.stripHidden, pagerN: sr.pagerN, segY, hint: sr.hint});
    check(`${label} 출목표 태양 한곳: 칸 ${sr.tiles.length}개 = 따로 센 태양 ${spkW.size}곳 모두 · 오른 순 그대로(${sunsW.slice(0, 3).map(c => c.name).join(' · ')} …) · 묶음 ${sr.secs.length}개(「오른 순 1위~20위 · 태양 n곳」) · 맨 위 「1위~${topNW}위 안 ${inTopW}곳 · 밖 ${spkW.size - inTopW}곳」`,
      sr.tiles.length === spkW.size && sr.tiles.map(t => t.code).join() === sunsW.map(c => c.code).join() && secOk && sr.lead2 === `태양 ${spkW.size}곳 = 오른 회사 출목표의 공통 모양 ${kW}가지를 모두 가진 곳 · 오른 순 1위~${topNW}위 안 ${inTopW}곳 · 밖 ${spkW.size - inTopW}곳`,
      {tiles: sr.tiles.length, secs: sr.secs.map(x => `${x.domId}:${x.name}:${x.codes.length}`), lead: sr.lead2});
    const tmS = tileMisOf(sr.tiles, true), smS = spkMisOf(sr.tiles), btS = briefTileMis(sr);
    check(`${label} 출목표 태양 한곳: 칸마다 태양 표 · 이름·업종·20거래일 변화·출목표·링크 = 판 · 선 그래프(묶음마다 같은 눈금) · 수급 · 기사 · 옆으로 넘치지 않음`, !tmS.length && !smS.length && !btS.length && sr.sw <= sr.iw, {tmS: tmS.slice(0, 3), smS: smS.slice(0, 3), btS: btS.slice(0, 2), sw: sr.sw});
    await wordsCheck(page, `${label} 출목표 태양 한곳`);
  }
  // 다른 아래 탭에서 출목표 탭을 누르면 늘 「오른 순」 첫 탭(1위~20위) 맨 위 — 흐름별 셋째 탭을 보다 떠났어도
  {
    await press(page.locator('.bottom-link[data-route="agenda"]'));
    await page.waitForFunction(() => location.hash === '#/agenda' && !document.querySelector('.f-body') && document.querySelector('.bottom-link.active')?.dataset.route === 'agenda'); await page.waitForTimeout(200);
    await press(page.locator('.bottom-link[data-route="road"]')); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300);
    const rr = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab, pressed: document.querySelector('.f-seg-b[aria-pressed="true"]')?.dataset.mode, sel: document.querySelector('.f-tab[aria-selected="true"]')?.dataset.tab, first: [...document.querySelectorAll('.f-tile')].slice(0, 3).map(t => t.dataset.code), n: document.querySelectorAll('.f-tile').length}));
    check(`${label} 흐름별을 보다 일정 탭 → 출목표 탭 ${mobile ? '터치' : '누름'} → 「오른 순」 첫 탭 「${riseLabels[0]}」 맨 위(${rr.y}px) · 칸 ${rr.n}개 · 첫 칸 ${rankedW.slice(0, 3).map(c => c.name).join(' · ')}`, rr.hash === '#/road' && rr.mode === 'rise' && rr.pressed === 'rise' && rr.tab === 'r1' && rr.sel === 'r1' && rr.y === 0 && rr.n === CH && rr.first.join() === rankedW.slice(0, 3).map(c => c.code).join(), rr);
    // 업종별 · 흐름별도 첫 탭부터(들어올 때 모든 탭을 처음으로)
    await press(page.locator('.f-seg-b[data-mode="flow"]')); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); await page.waitForTimeout(150);
    const ft = await page.evaluate(() => ({tab: document.querySelector('.f-body')?.dataset.tab, n: document.querySelectorAll('.f-tile').length}));
    check(`${label} 그때 「흐름별」을 누르면 첫 탭 「${chipW(flowsWant[0].k)}」부터(펼친 「더 보기」도 처음으로 · 칸 ${ft.n}개)`, ft.tab === flowsWant[0].k && ft.n === (flowsWant[0].items.length > 45 ? 20 : flowsWant[0].items.length), ft);
    await press(page.locator('.f-seg-b[data-mode="rise"]')); await page.waitForSelector('.f-body[data-mode="rise"][data-ready] .f-tile'); await page.waitForTimeout(100);
  }

  // ⑥ 아래 탭 「찾기」(2026-10-05 20:24 사장님 「아틀란스에서 종목을 찾는 기능을 넣어라」) — 한국 · 미국 판을 함께 · 셈은 site/app/find.js 그대로(단위 시험 tests/atlas11/find.test.mjs)
  {
    let places = null; try { places = await (await fetch(base + '/places.json')).json(); } catch {}
    const us = places?.places?.find(p => p.id === 'us'), usBoard = us ? await (await fetch(base + us.href.replace(/\/$/, '') + '/data/atlas11/view/board.json')).json() : null;
    const boardsW = [{place: {id: 'kr', label: '한국', href: '/'}, here: true, companies: board.companies}, ...(usBoard ? [{place: {id: 'us', label: '미국', href: us.href}, here: false, companies: usBoard.companies}] : [])];
    const NW = boardsW.reduce((t, b) => t + b.companies.length, 0), scopeW = boardsW.map(b => `${b.place.label} ${b.companies.length}곳`).join(' · ');
    await press(page.locator('.bottom-link[data-route="find"]')); await page.waitForSelector('.fd-page #fd-in'); await page.waitForTimeout(200);
    const f0 = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), focus: document.activeElement?.id ?? null, active: document.querySelector('.bottom-link.active')?.dataset.route, tries: [...document.querySelectorAll('.fd-try-b')].map(b => b.textContent.trim()), sw: document.documentElement.scrollWidth, iw: innerWidth}));
    check(`${label} 아래 탭 「찾기」 ${mobile ? '터치' : '누름'} → #/find · 제목 「${f0.title}」(= ${scopeW}) · 글 칸에 바로 커서 · 보기 단추 ${f0.tries.length}개`, f0.hash === '#/find' && f0.title === `찾기 ${NW}곳` && f0.focus === 'fd-in' && f0.active === 'find' && f0.tries.length >= 2 && f0.sw <= f0.iw, f0);
    const {findIn: findW, stockHref: hrefW, chosung: choW} = await import(new URL('../../site/app/find.js', import.meta.url));
    const read = () => page.evaluate(() => ({msg: document.querySelector('.fd-msg')?.textContent.trim() ?? '', hits: [...document.querySelectorAll('.fd-hit')].map(a => ({code: a.dataset.code, place: a.dataset.place, href: a.getAttribute('href'), name: a.querySelector('.fd-name')?.childNodes[0]?.textContent.trim(), sun: !!a.querySelector('.fd-name .sun-tag, .fd-name [class*="sun"]'), mkt: a.querySelector('.fd-mkt')?.textContent.trim()})), recent: !document.querySelector('.fd-recent')?.hidden}));
    const fi = page.locator('#fd-in');
    const same = (got, want) => got.hits.length === Math.min(20, want.length) && want.slice(0, 20).every((w, k) => { const x = got.hits[k]; return x && x.code === w.c.code && x.place === w.place.id && x.href === hrefW(w) && x.name === w.c.name && x.mkt === w.place.label; })
      && got.msg === (!want.length ? '' : want.length > 20 ? `${want.length}곳 가운데 20곳 · 글자를 더 넣으면 좁혀짐` : `${want.length}곳`);
    // 한국 회사 한 글자 · 미국 회사 이름 · 초성 · 기호 — 화면 줄 = find.js 로 다시 센 줄(차례 · 시장 · 주소까지)
    const kr0 = [...board.companies].sort((a, b) => (b.change20 ?? -9) - (a.change20 ?? -9))[3], qs = [kr0.name.slice(0, 1), choW(kr0.name), kr0.code, ...(usBoard ? [usBoard.companies[0].name, usBoard.companies[0].code.toLowerCase()] : [])];
    for (const q of qs) {
      await fi.fill(q); await page.waitForTimeout(150);
      const got = await read(), want = findW(boardsW, q);
      check(`${label} 찾기 「${q}」 → ${got.hits.length}곳 보임(「${got.msg}」) = find.js 로 센 ${want.length}곳의 앞 ${Math.min(20, want.length)}곳 · 차례 · 시장 · 주소 같음 · 첫 줄 ${got.hits[0]?.name ?? '없음'}(${got.hits[0]?.mkt ?? ''})`, want.length > 0 && same(got, want) && !got.recent, {got: {...got, hits: got.hits.slice(0, 3)}, want: want.slice(0, 3).map(w => `${w.place.id}:${w.c.code}`)});
    }
    await fi.fill('없는회사이름'); await page.waitForTimeout(120);
    const nf = await read();
    check(`${label} 찾기: 없는 이름 → 「${nf.msg}」 · 줄 0개`, nf.msg === `「없는회사이름」에 맞는 회사가 ${scopeW} 안에 없습니다 · ATLAS 는 고른 ${NW}곳만 봅니다` && nf.hits.length === 0, nf);
    // 한국 회사 이름 끝까지 넣고 Enter → 회사 화면 · 「‹ 찾기」 → 넣은 글자 · 결과 그대로
    await fi.fill(kr0.name); await page.waitForTimeout(120); await fi.press('Enter');
    await page.waitForFunction(code => location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), kr0.code); await page.waitForTimeout(200);
    const fc = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), back: document.querySelector('.c-back')?.textContent.trim()}));
    check(`${label} 찾기: 「${kr0.name}」 넣고 Enter → 그 회사 화면 · 되돌아가기 「${fc.back}」`, fc.title === kr0.name && fc.back === '‹ 찾기', fc);
    await press(page.locator('.c-back')); await page.waitForSelector('.fd-page #fd-in'); await page.waitForTimeout(250);
    const fb = await page.evaluate(() => ({hash: location.hash, value: document.querySelector('#fd-in')?.value, n: document.querySelectorAll('.fd-hit').length}));
    check(`${label} 회사 화면 「‹ 찾기」 → 찾기 그대로(넣은 글자 「${fb.value}」 · 줄 ${fb.n}개)`, fb.hash === '#/find' && fb.value === kr0.name && fb.n >= 1, fb);
    // 글자를 지우면 「최근 찾은 회사」에 방금 그 회사(이 기기에만)
    await fi.fill(''); await page.waitForTimeout(150);
    const rc = await read();
    check(`${label} 찾기: 글자를 지우면 「최근 찾은 회사」 — 첫 줄 ${rc.hits[0]?.name ?? '없음'}`, rc.recent && rc.hits[0]?.code === kr0.code && rc.hits[0]?.place === 'kr', {recent: rc.recent, first: rc.hits[0]});
    // 미국 회사 줄 누름 → 미국 판 그 회사 화면(/us/#/stock/기호)
    if (usBoard) {
      const u0 = usBoard.companies[0];
      await fi.fill(u0.name); await page.waitForTimeout(150);
      await press(page.locator(`.fd-hit[data-place="us"][data-code="${u0.code}"]`));
      await page.waitForFunction(code => location.pathname === '/us/' && location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), u0.code, {timeout: 20000}); await page.waitForTimeout(200);
      const uc = await page.evaluate(() => ({path: location.pathname + location.hash, title: document.querySelector('.b-title')?.innerText.trim(), close: document.querySelector('.b-price .b-close')?.textContent.trim()}));
      check(`${label} 찾기: 미국 「${u0.name}」 줄 ${mobile ? '터치' : '누름'} → 미국 판 회사 화면 ${uc.path} · 「${uc.title}」 · 값 「${uc.close}」`, uc.path === '/us/#/stock/' + u0.code && uc.title === u0.name && /달러$/.test(uc.close ?? ''), uc);
      await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg');
    }
  }

  // ④ 지운 화면의 옛 주소 → 처음 화면
  for (const old of ['#/forecast', '#/up', '#/down', '#/scores', '#/race', '#/evolution', '#/status', '#/records', '#/game']) {
    await page.goto(base + '/' + old, {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({hash: location.hash, rows: document.querySelectorAll('.hf-row').length, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim()}));
    check(`${label} 옛 주소 ${old} → 탭 「불장」(#/ · 「${r.title}」 · 불장 줄 ${r.rows}개)`, r.hash === '#/' && r.title === `불장 업종 ${HOT.length}개` && r.rows === HOT.length, r);
  }
  // ⑤ 아래 탭 「기록」(#/log · 2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 기록 하는 탭」) — 검사기가 /changelog.json 을 따로 읽어 화면과 줄마다 맞댐
  //   무결성은 이 탭 맨 아래 「기술 정보」(옛 모든 화면 맨 아래 접힘을 옮김 — 규칙 1)
  //   이슈(2026-10-06 18:37 「이슈칸을 만들어서 기록해」) — 칩 「이슈」 · 출처 줄 · 거르기 넷 · 이슈가 한 줄은 있어야(판을 만들 때 저절로 쌓임)
  {
    const CHIP = {update: '업데이트', data: '자료 변경', issue: '이슈'};
    const log = await (await fetch(base + '/changelog.json')).json(), want = log.entries, byKind = k => want.filter(e => k === 'all' || e.kind === k);
    await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
    const footTech = await page.evaluate(() => document.querySelectorAll('.b-foot .b-tech, .b-foot .integrity-text').length);
    const tLog = page.locator('.bottom-link[data-route="log"]'); if (mobile) await tLog.tap(); else await tLog.click(); await page.waitForSelector('.lg-page .lg-item'); await page.waitForTimeout(250);
    const read = () => page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      items: [...document.querySelectorAll('.lg-item')].map(li => ({id: li.dataset.id, kind: li.dataset.kind, chip: li.querySelector('.lg-kind')?.textContent.trim(), time: li.querySelector('.lg-time')?.textContent.trim(), dt: li.querySelector('.lg-time')?.getAttribute('datetime'),
        title: li.querySelector('.lg-title')?.textContent.trim(), what: [...li.querySelectorAll('.lg-what li')].map(x => x.textContent.trim()), removed: li.querySelector('.lg-removed')?.textContent.trim() ?? null, src: li.querySelector('.lg-src')?.textContent.trim() ?? null, day: li.closest('.lg-day')?.dataset.date})),
      days: [...document.querySelectorAll('.lg-day')].map(d => d.dataset.date), pressed: document.querySelector('.lg-seg [aria-pressed="true"]')?.dataset.show,
      integ: document.querySelector('.lg-tech .integrity-text')?.textContent ?? null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    const r0 = await read();
    const mis = want.map((e, i) => { const x = r0.items[i]; return x && x.id === e.id && x.kind === e.kind && x.chip === CHIP[e.kind] && x.dt === e.live && x.time === e.live.slice(11, 16) && x.title === e.title && x.what.join('|') === e.what.join('|') && x.day === e.live.slice(0, 10)
      && (e.removed?.length ? x.removed === '뺀 것 ' + e.removed.join(' · ') : x.removed === null) && (e.source ? x.src === '출처 · ' + e.source : x.src === null) ? null : {i, id: e.id, x}; }).filter(Boolean);
    const daysW = [...new Set(want.map(e => e.live.slice(0, 10)))], newestFirst = want.every((e, i) => !i || want[i - 1].live >= e.live);
    check(`${label} 아래 탭 「기록」(#/log): 줄 ${r0.items.length}개 = 기록 파일 ${want.length}개(이슈 ${log.count.issue} · 업데이트 ${log.count.update} · 자료 변경 ${log.count.data} · 검사에 걸려 빠진 줄 ${log.problems.length}) · 같은 차례(새것이 위) · 날짜 묶음 ${r0.days.length}개 · 줄마다 종류 · 올라간 때 · 제목 · 무엇 · 뺀 것 · 출처 · 「기록」 눌림 · 옆으로 넘치지 않음`,
      r0.hash === '#/log' && r0.title === `기록 ${want.length}개` && r0.active === 'log' && want.length > 0 && r0.items.length === want.length && !mis.length && r0.days.join() === daysW.join() && newestFirst && log.problems.length === 0 && log.count.issue >= 1 && r0.sw <= r0.cw && r0.pressed === 'all', {mis: mis.slice(0, 2), days: r0.days, problems: log.problems.slice(0, 3), issue: log.count.issue});
    for (const k of ['issue', 'update', 'data', 'all']) {
      const b = page.locator(`.lg-seg [data-show="${k}"]`); if (mobile) await b.tap(); else await b.click(); await page.waitForTimeout(150);
      const r = await read(), w = byKind(k);
      check(`${label} 기록 「${k === 'all' ? '모두' : CHIP[k]}」 누름 → ${r.items.length}줄 = 기록 파일 ${w.length}줄(같은 차례) · 옆으로 넘치지 않음`, r.pressed === k && r.items.length === w.length && r.items.every((x, i) => x.id === w[i].id) && r.sw <= r.cw, {pressed: r.pressed, n: r.items.length, sw: r.sw, cw: r.cw});
    }
    check(`${label} 무결성(기록 탭 맨 아래 「기술 정보」): 「${r0.integ}」 · 다른 화면 맨 아래 「기술 정보」 ${footTech}개(옮김 · 규칙 1)`, /모두 판 목록의 SHA-256 과 같음/.test(r0.integ ?? '') && footTech === 0, {integ: r0.integ, footTech});
  }
  // ⑥ 글씨 단추
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(300);
  await page.locator('#font-btn').click(); await page.waitForTimeout(200);
  const fs1 = await page.evaluate(() => [document.documentElement.style.fontSize, document.documentElement.dataset.fontStep]);
  check(`${label} 글씨 단추: 125% 로 커짐`, fs1[0] === '125%' && fs1[1] === '1', {fs1});
  check(`${label} 콘솔 오류 0 · 요청 실패 0`, consoleErrors.length === 0 && failedRequests.length === 0, {consoleErrors: consoleErrors.slice(0, 3), failedRequests: failedRequests.slice(0, 3)});
  await context.close();
}

async function darkCheck() {
  // 밤 화면 바탕 = style.css 첫 어두운 덩어리의 --bg — 2026-10-05 16:29 사장님 「청자가 낫다」: 옛 밤 판 검정(#000) → 밤 청자(docs/design/celadon)
  //   검사기는 색 값을 따로 적지 않고 화면 옷(style.css)에서 읽는다 · 그 값의 글자 대비는 tests/atlas11/palette.test.mjs 가 잰다(기준 그대로)
  const css = await (await fetch(base + '/app/style.css')).text(), dm = css.indexOf('@media (prefers-color-scheme: dark)'), ra = css.indexOf(':root {', dm);
  const darkHex = css.slice(ra, css.indexOf('}', ra)).match(/--bg:\s*(#[0-9A-Fa-f]{6})/)?.[1] ?? '#000000';
  const darkBg = `rgb(${[1, 3, 5].map(i => parseInt(darkHex.slice(i, i + 2), 16)).join(', ')})`;
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, colorScheme: 'dark', locale: 'ko-KR'});
  const page = await context.newPage();
  for (const [hash, wait, name] of [['#/', '.h-page .hs-seg', 'home'], ['#/map', '.t-tile', 'map'], ['#/i/' + (board.hot?.items?.[0]?.id ?? board.groups[0].id), '.b-card .spark', 'industry'], ['#/similar', '.s-page', 'similar'], ['#/rise', '.r-page', 'rise'], ['#/road', '.f-body[data-ready] .f-tile', 'road'], ['#/stock/' + board.companies[0].code, '.c-chart svg.lc', 'company'], ['#/agenda', '.b-box', 'agenda']]) {
    await page.goto(base + '/' + hash, {waitUntil: 'networkidle'}); await page.waitForSelector(wait); await page.waitForTimeout(300);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.screenshot({path: path.join(dir, `mobile-dark-${name}.png`)});
    check(`어두운 화면 ${name}: 바탕이 밤 바탕색 ${darkHex}(${bg})`, bg === darkBg, {bg, darkBg});
  }
  await context.close();
}

/* 미국 판(2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」) — 사이트 판 목록(places.json)에 미국이 있을 때만
   같은 화면 코드가 /us/ 에서 미국 판 묶음을 읽는다: 위 막대 「한국 · 미국」 · 보던 탭 그대로 건너감 · 달러(소수 둘째 자리) · 뉴욕 16:00 종가 · 수급 · 공시 없음을 그렇다고 적음 · 무결성 */
async function usCheck() {
  let places = null; try { places = await (await fetch(base + '/places.json')).json(); } catch {}
  const us = places?.places?.find(p => p.id === 'us');
  if (!us) { check(`미국 판: 판 목록(places.json)에 없음 → 한국 판만 · 위 막대 시장 단추 없음`, Array.isArray(places?.places) && places.places.length === 1 && places.places[0].id === 'kr', {places: places?.places ?? null}); return; }
  const ub = base + us.href.replace(/\/$/, ''), ug = async p => (await fetch(ub + '/' + p)).json();
  const um = await ug('data/atlas11/view/manifest.json'), ubd = await ug('data/atlas11/view/board.json');
  check(`미국 판 묶음: 예측 끔 · 시장 미국 · ${ubd.companies.length}곳 · 업종 ${ubd.groups.length}개`, um.prediction === 'off' && um.place?.id === 'us' && ubd.companies.length === um.companies, {companies: ubd.companies.length, groups: ubd.groups.length, asOf: um.asOf});
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage(), errs = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failed.push(r.url())); page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  const mkt = () => page.evaluate(() => [...document.querySelectorAll('.mkt-b')].map(a => ({id: a.dataset.place, t: a.textContent.trim(), cur: a.getAttribute('aria-current')})));
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-titlerow');
  const k1 = await mkt();
  check(`미국 판 단추: 한국 판 위 막대 「${k1.map(x => x.t).join(' · ')}」 · 한국이 눌린 채`, k1.length === 2 && k1[0].id === 'kr' && k1[0].cur === 'page' && k1[1].id === 'us' && !k1[1].cur, k1);
  await page.click('.mkt-b[data-place="us"]'); await page.waitForURL(/\/us\/#\/road$/, {timeout: 15000}).catch(() => {}); await page.waitForSelector('.f-titlerow', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
  const r1 = await page.evaluate(() => ({url: location.pathname + location.hash, n: document.querySelector('.f-titlerow .b-count')?.textContent.trim() ?? null}));
  const k2 = await mkt();
  check(`「미국」 누름 → 미국 판 출목표 그대로(${r1.url}) · 「${r1.n}」 = 미국 판 ${ubd.companies.length}곳 · 미국이 눌린 채`, r1.url === '/us/#/road' && r1.n === `${ubd.companies.length}곳` && k2.find(x => x.id === 'us')?.cur === 'page', {r1, k2});
  await page.screenshot({path: path.join(dir, 'us-road.png')});
  await page.goto(ub + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.mstrip'); await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({time: document.querySelector('.mstrip .m-time')?.textContent.trim() ?? null, names: [...document.querySelectorAll('.mstrip .m-name')].map(x => x.textContent.trim()), title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim()}));
  const wantStrip = um.market?.items?.length ? `${kd(um.market.items[0].date)} 16:00 뉴욕 시각 종가` : null;
  check(`미국 판 불장: 시장 띠 「${st.time}」 · ${st.names.join(' · ')} = 판(뉴욕 지수)`, um.market ? st.time === wantStrip && JSON.stringify(st.names) === JSON.stringify(um.market.items.map(i => i.name)) : /^시장 지수 없음/.test(st.time ?? ''), {st, wantStrip});
  await page.screenshot({path: path.join(dir, 'us-home.png')});
  const c0 = [...ubd.companies].sort((a, b) => (b.change20 ?? -9) - (a.change20 ?? -9))[0];
  await page.goto(ub + '/#/stock/' + encodeURIComponent(c0.code), {waitUntil: 'networkidle'}); await page.waitForSelector('.b-price'); await page.waitForTimeout(400);
  const cp = await page.evaluate(() => ({name: document.querySelector('h1')?.textContent.trim(), close: document.querySelector('.b-price .b-close')?.textContent.trim(), date: document.querySelector('.b-price .b-date')?.textContent.trim(), flow: document.querySelector('.c-brief .fl')?.textContent.replace(/\s+/g, ' ').trim() ?? null, integ: document.querySelector('.integrity-text')?.textContent.trim() ?? null}));
  const wantClose = c0.close.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '달러';
  check(`미국 회사 화면 ${c0.code}: 「${cp.name}」 · 값 「${cp.close}」 = 판 종가(달러 · 소수 둘째 자리) · 「${cp.date}」`, cp.name === c0.name && cp.close === wantClose && cp.date === `${kd(c0.date)} 16:00(뉴욕) 종가`, {cp, wantClose});
  check(`미국 회사 화면: 수급 줄 「${cp.flow}」 — 미국은 투자자별 매매 공개 자료가 없다고 적음(0 으로 채우지 않음)`, cp.flow === `수급 · ${um.place.flowsNone}`, {flow: cp.flow});
  await page.screenshot({path: path.join(dir, 'us-company.png')});
  await page.goto(ub + '/#/agenda', {waitUntil: 'networkidle'}); await page.waitForSelector('.a-page'); await page.waitForTimeout(300);
  const ag = await page.evaluate(() => ({disc: document.querySelector('[aria-label="공시"] p')?.textContent.trim() ?? null, krDisc: document.querySelectorAll('[aria-label="예고 공시"], [aria-label="아주 중요한 공시"]').length}));
  check(`미국 판 일정: 공시 칸 「${ag.disc}」 한 칸 · 한국 공시 칸 둘(예고 · ★★★) 없음`, ag.disc === um.place.disclosuresNone && ag.krDisc === 0, ag);
  await page.click('.mkt-b[data-place="kr"]'); await page.waitForURL(u => /\/#\/agenda$/.test(String(u)) && !/\/us\//.test(String(u)), {timeout: 15000}).catch(() => {}); await page.waitForSelector('.a-page', {timeout: 15000}).catch(() => {});
  const back = await page.evaluate(() => ({url: location.pathname + location.hash, strip: document.querySelector('.mstrip .m-time')?.textContent.trim() ?? null}));
  check(`「한국」 누름 → 한국 판 일정 그대로(${back.url}) · 시장 띠 「${back.strip}」`, back.url === '/#/agenda' && /15:30 KST/.test(back.strip ?? ''), back);
  // 미국 판 「기록」 탭 — 한국 판과 같은 /changelog.json · 무결성(미국 판 묶음)은 이 탭 맨 아래(옛 맨 아래 「기술 정보」를 옮김)
  const usLog = await (await fetch(base + '/changelog.json')).json();
  await page.goto(ub + '/#/log', {waitUntil: 'networkidle'}); await page.waitForSelector('.lg-page .lg-item'); await page.waitForTimeout(300);
  const ul = await page.evaluate(() => ({n: document.querySelectorAll('.lg-item').length, first: document.querySelector('.lg-item')?.dataset.id, tabs: document.querySelectorAll('.bottom-link').length, here: document.querySelector('.mkt-b[aria-current="page"]')?.dataset.place, integ: document.querySelector('.lg-tech .integrity-text')?.textContent.trim() ?? null}));
  check(`미국 판 「기록」 탭: 줄 ${ul.n}개 = /changelog.json ${usLog.entries.length}개 · 아래 탭 ${ul.tabs}개 · 미국 눌림 · 무결성 「${ul.integ}」`, ul.n === usLog.entries.length && ul.first === usLog.entries[0]?.id && ul.tabs === 6 && ul.here === 'us' && /모두 판 목록의 SHA-256 과 같음/.test(ul.integ ?? ''), ul);
  check(`미국 판 화면들: 콘솔 오류 0 · 요청 실패 0`, errs.length === 0 && failed.length === 0, {errs: errs.slice(0, 3), failed: failed.slice(0, 3)});
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
    // 지도 탭 맨 아래 「지난 6개월 앞서 달린 곳」은 닫힌 접힘이라 위 재기에서 빠진다 — 펼친 뒤 상자 안만 따로 잰다(한국 · 미국 판 · 보기 5가지)
    //   2026-10-06 15시: 펼친 상자를 따로 재어 보니 좁은 휴대폰 어두운 화면 글씨 200%에서 긴 회사 이름이 화면을 넓힘(한국 +6px · 미국 +303px) · 지수 값에 단위 없음 → 고친 뒤 이 검사를 붙임
    for (const where of ['/', '/us/']) {
      await page.goto(base + where + '#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.lm-c', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
      const opened = await page.evaluate(() => { const d = document.querySelector('details.m6'); if (!d) return false; d.open = true; d.scrollIntoView(); return true; }); await page.waitForTimeout(300);
      const m6 = await page.evaluate(measureClarity, {roots: ['details.m6'], refTime: false});
      const vw6 = await page.evaluate(() => ({inner: innerWidth, scroll: document.documentElement.scrollWidth, rows: document.querySelectorAll('details.m6 .m6-list > li').length}));
      check(`펼친 「지난 6개월」 상자 ${where === '/' ? '한국' : '미국'} 판 ${v.id}: 줄 ${vw6.rows}개 · 화면 폭 ${vw6.inner}px = 기기 폭 ${v.viewport.width}px · 잘린 글자 ${m6.truncated} · 또렷함 1 ${m6.relDays} · 2 ${m6.vague} · 3 ${m6.bareNumbers} · 5 ${m6.lowContrast}`,
        opened && vw6.rows > 0 && vw6.inner === v.viewport.width && vw6.scroll <= v.viewport.width && m6.truncated === 0 && m6.relDays + m6.vague + m6.bareNumbers + m6.lowContrast === 0,
        {opened, vw6, bare: m6.samples.bareNumbers, trunc: m6.samples.truncated, vague: m6.samples.vague, contrast: m6.samples.lowContrast});
    }
    await ctx.close();
  }
  // 검사기 자체 시험: 흐릿한 말 하나 · 단위 없는 숫자 하나 · 잘린 이름 하나 · 앞날 말 하나를 일부러 넣으면 늘어야 한다
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const page = await ctx.newPage();
  await page.goto(base + '/#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(500); await renderAll(page);
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
  await usCheck();
  clarity = await clarityCheck();
} finally { await browser.close(); }
// 배포 묶음: 게임 쪽은 없고 옛 주소는 처음 화면으로 돌린다(넷리파이 _redirects)
try { const red = await fs.readFile(path.join(process.cwd(), 'dist/_redirects'), 'utf8'); let game = true; try { await fs.access(path.join(process.cwd(), 'dist/game')); } catch { game = false; } check(`배포 묶음: game/ 폴더 없음 · _redirects 에 /game/* → / (${red.trim().split('\n').length}줄)`, !game && /^\/game\/\*\s+\/\s+302$/m.test(red)); } catch (e) { check('배포 묶음 dist/ 를 읽지 못함', false, {e: e.message}); }
const summary = {schema: 'atlas11-browser-check-4', at: new Date().toISOString(), base, prediction: 'off', boardId: manifest.boardId, asOf: manifest.asOf, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (터치 흉내 — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;

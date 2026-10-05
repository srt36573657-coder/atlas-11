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
 *   업종 화면 36장 모두: 머리(n칸 가운데 n위 · 불장 · 평균 · 몇 곳 올랐나) · 「누가 끌었나」 막대(차례 · 값 · 방향 · 길이) · 카드(합쳐서 180장 = 판 · 겹침 없음 · 넷만: 이름·변화 · 선 그래프 · 수급 · 기사) ·
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
 * 결과: reports/atlas11/browser/<시각>/report.json + 화면 사진
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';
import {groupByFamily} from '../../site/app/family.js';
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
  const N = board.companies.length, G = board.groups.length, HOT = board.hot?.items ?? [], NEXT = board.next?.items ?? [], H = `탭 「업종」(업종 ${G}칸)`, byCodeB0 = new Map(board.companies.map(c => [c.code, c]));
  // ①-0 탭 「불장」(#/ · 2026-10-05 10:24 「잡스라면 36가지」 13~15 · 20번) — 불장 업종만 · 같은 큰 갈래끼리 한 장 · 맨 위 스위치 셋
  {
    await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.hf-row, .h-page .b-note'); await page.waitForTimeout(300);
    await shot('01-hot');
    const hr = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), sum: document.querySelector('.hf-sum')?.innerText.trim() ?? null,
      segs: [...document.querySelectorAll('.hs-seg .hs-b')].map(a => ({seg: a.dataset.seg, href: a.getAttribute('href'), cur: a.getAttribute('aria-current'), label: a.querySelector('.hs-l')?.textContent.trim(), n: a.querySelector('.hs-n')?.textContent.trim()})),
      cards: [...document.querySelectorAll('.hf-card')].map(c => ({fam: c.dataset.family, name: c.querySelector('.hf-name')?.textContent.trim(), n: c.querySelector('.hf-n')?.textContent.trim(), rows: [...c.querySelectorAll('.hf-row')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), rank: a.querySelector('.hf-rank')?.textContent.trim(), name: a.querySelector('.hf-gname')?.textContent.trim(), chg: a.querySelector('.hf-chg')?.textContent.trim(), up: a.querySelector('.hf-up')?.textContent.trim()}))})),
      tiles: document.querySelectorAll('.t-tile').length, active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
      promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), mvx: document.querySelector('.hs-seg + .mvx')?.dataset.state ?? null, sw: document.documentElement.scrollWidth, iw: innerWidth}));
    check(`${label} 탭 「불장」: 저녁 7시 들고 남 칸이 스위치 바로 아래(${hr.mvx}) = 판`, hr.mvx === (!board.moves ? 'none' : board.moves.first ? 'first' : 'moves'), {mvx: hr.mvx});
    const flowsW = groupByFamily(board.groups.filter(g => g.hot)), SIMN = board.similar?.items?.length ?? 0;
    check(`${label} 탭 「불장」: 제목 「${hr.title}」 · 큰 흐름 한 줄 「${hr.sum}」 · 아래 탭 넷 ${hr.tabs.join('·')}(「불장」 눌림) · 73칸 판은 여기 없음`, hr.title === `불장 업종 ${HOT.length}개` && (HOT.length ? hr.sum === `큰 흐름 ${flowsW.length}개 — ${flowsW.map(f => f.fam.label).join(' · ')}` : hr.sum === null) && hr.tabs.join() === '불장,업종,출목표,일정' && hr.active === 'home' && hr.tiles === 0, {...hr, cards: undefined, segs: undefined});
    check(`${label} 탭 「불장」 맨 위 스위치 셋: 불장 ${HOT.length}개 · 예비 ${SIMN}곳 · 오름 상위 ${NEXT.length}곳 · 「불장」 고름`, hr.segs.map(x => `${x.seg}|${x.href}|${x.label}|${x.n}|${x.cur ?? ''}`).join() === [`home|#/|불장|${HOT.length}개|page`, `similar|#/similar|예비|${SIMN}곳|`, `rise|#/rise|오름 상위|${NEXT.length}곳|`].join(), hr.segs);
    const cardMisH = flowsW.map((f, k) => { const c = hr.cards[k]; return c && c.fam === f.fam.id && c.name === f.fam.label && c.n === `불장 업종 ${f.groups.length}개` && c.rows.length === f.groups.length && f.groups.every((g, j) => { const r = c.rows[j], i = board.groups.indexOf(g); return r && r.id === g.id && r.href === '#/i/' + g.id && r.rank === `불장 ${i + 1}위` && r.name === g.label && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.up === upWant(g); }) ? null : {k, f: f.fam.label, c}; }).filter(Boolean);
    check(`${label} 탭 「불장」: 큰 흐름 ${hr.cards.length}장 = 판의 불장 ${HOT.length}개를 큰 갈래로 묶은 것(갈래 차례 = 가장 앞 업종 차례 · 장 안은 판 차례) · 줄마다 「불장 n위」 · 이름 · 20거래일 평균 · 몇 곳 올랐나 · 누르면 그 업종 · 옆으로 넘치지 않음`, hr.cards.length === flowsW.length && hr.cards.reduce((t, c) => t + c.rows.length, 0) === HOT.length && !cardMisH.length && hr.sw <= hr.iw, {cardMisH: cardMisH.slice(0, 2), sw: hr.sw});
    check(`${label} 탭 「불장」: 「${hr.promise}」 접힌 칸 · 맨 아래 약속 한 줄 「${hr.footPromise}」`, hr.promise === 'ATLAS가 하지 않는 일 7가지' && hr.footPromise === '지난 기록만 보여 줍니다 · 앞날을 맞히지 않습니다', {promise: hr.promise, footPromise: hr.footPromise});
    await wordsCheck(page, `${label} 탭 「불장」`);
    if (HOT.length) {
      const g0 = flowsW[0].groups[0], rl = page.locator(`.hf-row[data-group="${g0.id}"]`); await rl.scrollIntoViewIfNeeded();
      if (mobile) await rl.tap(); else await rl.click();
      await page.waitForSelector(`article.i-page[data-group="${g0.id}"] .b-card`); await page.waitForTimeout(200);
      const ib = await page.evaluate(() => ({hash: location.hash, back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 탭 「불장」 줄 「${g0.label}」 ${mobile ? '터치' : '누름'} → 업종 화면 · 되돌아가기 「${ib.back[1]}」 · 탭 「불장」 눌린 채로`, ib.hash === '#/i/' + g0.id && ib.back[0] === '#/' && ib.back[1] === '‹ 불장' && ib.active === 'home', ib);
    }
  }
  // ① 탭 「업종」(#/map) = 옛 처음 화면의 73칸 판 — 업종 칸 · 「불장」 · 큰 갈래 단추 · 칸을 누르면 업종 화면
  await page.goto(base + '/#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(400);
  await shot('01-map');
  const top = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), kinds: document.querySelector('.b-kinds')?.textContent.trim() ?? null, ncRows: document.querySelectorAll('.nc-row').length, promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), late: [...document.querySelectorAll('.b-late')].map(e => e.innerText.trim()), strip: document.querySelector('.mstrip')?.innerText.replace(/\s+/g, ' ').trim(),
    active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
    tiles: [...document.querySelectorAll('.t-grid > .t-tile')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), sign: [...a.classList].find(c => c.startsWith('s-'))?.slice(2) ?? null, bg: getComputedStyle(a).backgroundColor, rank: a.querySelector('.t-rank')?.textContent.trim() ?? null, fire: a.querySelector('.t-fire')?.textContent.trim() ?? null, name: a.querySelector('.t-name')?.textContent.trim(), chg: a.querySelector('.t-chg')?.textContent.trim(), dsign: a.querySelector('.t-chg')?.dataset.sign ?? 'flat', up: a.querySelector('.t-up')?.textContent.trim(), kids: a.children.length})),
    legend: document.querySelectorAll('.t-legend, .t-sw').length,
    cards: document.querySelectorAll('.b-card').length, text52: /(?<!\d)52\s?(종목|곳)|업종 대표/.test(document.body.textContent)}));
  const kindsWant = board.kinds ? [`업종 ${G}개`, `우량주 ${board.kinds.quality ?? 0}곳`, `시대 트렌드 ${board.kinds.trend ?? 0}곳`, board.kinds.profit ? `흑자 ${board.kinds.profit}곳` : null, board.kinds.size ? `채움 ${board.kinds.size}곳` : null].filter(Boolean).join(' · ') : null;
  const fromM = mode(board.companies.map(c => c.cFrom)), toM = mode(board.companies.map(c => c.date));
  const upsG = board.groups.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
  check(`${label} ${H}: 제목 「${top.title}」 = 판의 불장 ${HOT.length}개 · 결론 한 줄 「${top.when}」(업종 ${upsG}개 오름 · 가장 많은 회사의 기간) · 아래 탭 넷 ${top.tabs.join('·')}(「업종」 눌림) · 회사 카드·22곳 줄 없음 · 옛 「52」 글 없음${board.kinds ? ` · 접힌 칸 「${top.kinds}」` : ''}`,
    top.title === `업종 ${G}개` && top.when === `업종 ${G}개 가운데 ${upsG}개 오름 · ${N}곳 · 지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)}까지` && top.tabs.join() === '불장,업종,출목표,일정' && top.active === 'map' && top.cards === 0 && top.ncRows === 0 && !top.text52 && (!board.kinds || top.kinds === kindsWant), {...top, tiles: undefined, legend: undefined});
  const tileMis = board.groups.map((g, i) => { const t = top.tiles[i]; return t && t.id === g.id && t.href === '#/i/' + g.id && t.name === g.label && (g.hot ? t.fire === `불장 ${i + 1}위` && t.rank === null : t.rank === `${i + 1}위` && t.fire === null) && t.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && t.up === upWant(g) && t.sign === signW(g.change20) && t.dsign === signW(g.change20) && t.kids === 4 ? null : {i, g: g.label, t}; }).filter(Boolean);
  check(`${label} ${H}: 업종 칸 ${top.tiles.length}개 = 판의 업종 ${G}개 · 칸마다 넷(「불장 n위」 또는 n위 · 이름 · 20거래일 평균 ▲▼ · 몇 곳 올랐나) · 차례 · 오름/내림 선 · 누르면 갈 주소가 판과 같음`, top.tiles.length === G && !tileMis.length, {tileMis: tileMis.slice(0, 3)});
  const fires = top.tiles.map((t, i) => t.fire ? i : -1).filter(i => i >= 0);
  check(`${label} ${H}: 「불장」 칸 ${fires.length}개 = 판의 불장 ${HOT.length}개 · 1위부터 빈틈없이 · 판의 불장 목록과 같은 업종 · 모두 오른 업종 · 큰 순`, fires.length === HOT.length && fires.every((x, i) => x === i) && HOT.every((x, i) => top.tiles[i]?.id === x.id && x.change20 > 0 && (!i || HOT[i - 1].change20 >= x.change20)), {fires});
  // 칸 바탕은 한 색(세기 색 없음) · 색 보기표 없음(2026-10-05 잡스 개혁 — 설명표가 따로 필요하면 그림이 스스로 말하지 못한다는 신호 · 애플 WWDC17)
  const bgs = new Set(top.tiles.map(t => t.bg));
  check(`${label} ${H}: 칸 바탕 ${bgs.size}색(한 색) · 색 보기표 없음 · 오름 칸 ${top.tiles.filter(t => t.sign === 'up').length}개 · 내림 칸 ${top.tiles.filter(t => t.sign === 'down').length}개`, bgs.size === 1 && top.legend === 0, {bgs: [...bgs], legend: top.legend});
  check(`${label} ${H}: 맨 아래 약속 한 줄 「${top.footPromise}」`, top.footPromise === '지난 기록만 보여 줍니다 · 앞날을 맞히지 않습니다', {footPromise: top.footPromise});
  // 큰 갈래 단추(2026-10-05 「잡스라면」 19번) — 「모두」 + 판의 갈래 · 누르면 그 갈래 칸만(판 차례 그대로) · 「모두」로 되돌림
  {
    const famW = groupByFamily(board.groups), upsOf = gs => gs.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
    const fm = await page.evaluate(() => [...document.querySelectorAll('.fm-b')].map(b => ({id: b.dataset.family, pressed: b.getAttribute('aria-pressed'), label: b.querySelector('.fm-l')?.textContent.trim(), n: b.querySelector('.fm-n')?.textContent.trim()})));
    check(`${label} ${H}: 큰 갈래 단추 ${fm.length}개 = 「모두」 + 판의 갈래 ${famW.length}개 · 단추마다 「오른 업종/업종 수」 · 처음엔 「모두」`, fm.map(b => `${b.id}|${b.label}|${b.n}|${b.pressed}`).join() === [`all|모두|${upsOf(board.groups)}/${G}|true`, ...famW.map(f => `${f.fam.id}|${f.fam.label}|${upsOf(f.groups)}/${f.groups.length}|false`)].join(), fm);
    const f1 = famW[0], fb = page.locator(`.fm-b[data-family="${f1.fam.id}"]`); if (mobile) await fb.tap(); else await fb.click(); await page.waitForTimeout(150);
    const vis = await page.evaluate(() => [...document.querySelectorAll('.t-grid > .t-tile')].filter(t => !t.hidden && t.offsetParent !== null).map(t => t.dataset.group));
    check(`${label} ${H}: 「${f1.fam.label}」 단추 ${mobile ? '터치' : '누름'} → 보이는 칸 ${vis.length}개 = 그 갈래 업종 ${f1.groups.length}개(판 차례 그대로)`, vis.join() === f1.groups.map(g => g.id).join(), {vis});
    const fa = page.locator('.fm-b[data-family="all"]'); if (mobile) await fa.tap(); else await fa.click(); await page.waitForTimeout(150);
    const allN = await page.evaluate(() => [...document.querySelectorAll('.t-grid > .t-tile')].filter(t => !t.hidden && t.offsetParent !== null).length);
    check(`${label} ${H}: 「모두」 → 보이는 칸 ${allN}개 = ${G}개`, allN === G, {allN});
  }
  check(`${label} ${H}: 늦은 종가 표시 ${top.late.length}줄 = 판의 늦은 회사 ${board.late.length}곳`, top.late.length === board.late.length && board.late.every((c, i) => top.late[i]?.startsWith(c.name + ': ' + kd(c.date))), top.late);
  check(`${label} ${H}: 시장 띠(코스피·코스닥 · 기준 날짜)`, manifest.market ? manifest.market.items.every(i => top.strip.includes(i.name)) && top.strip.includes(kd(manifest.market.items[0].date) + ' 15:30 KST 종가') : /시장 지수 없음/.test(top.strip), {strip: top.strip});
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
  const seen = new Map(), headMis = [], barMis = [], cardMis = [], agMis = [], wordsBad = [], overflow = [], briefMis = []; let cardsTotal = 0;
  for (const [k, g] of board.groups.entries()) {
    await page.evaluate(id => { location.hash = '#/i/' + id; }, g.id);
    await page.waitForSelector(`article.i-page[data-group="${g.id}"] .b-card`); await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const art = document.querySelector('article.i-page'), back = art.querySelector('.c-back');
      return {rank: art.querySelector('.i-rank')?.firstChild?.textContent.trim(), fire: art.querySelector('.i-rank .t-fire')?.textContent.trim() ?? null, title: art.querySelector('.b-title')?.textContent.trim(), chg: art.querySelector('.b-when .chg20')?.textContent.trim(), when: art.querySelector('.b-when')?.textContent.trim(), back: [back?.getAttribute('href'), back?.textContent.trim()],
        bars: [...art.querySelectorAll('.mv-row')].map(li => { const bar = li.querySelector('.mv-bar'); return {code: li.dataset.code, name: li.querySelector('.mv-name')?.textContent.trim(), href: li.querySelector('.mv-name')?.getAttribute('href'), val: li.querySelector('.mv-val')?.textContent.trim(), w: parseFloat(bar.style.width), left: bar.style.left, right: bar.style.right}; }),
        /* 화면 밖 카드는 그리기를 미루므로(content-visibility) innerText 대신 textContent */
        cards: [...art.querySelectorAll('.b-card')].map(c => ({code: c.dataset.code, name: c.querySelector('.b-name')?.textContent.trim(), c20: c.querySelector('.b-c20')?.textContent.trim(), moved: c.querySelectorAll('.road, .ag-box, .b-price, .b-kind').length, kids: c.children.length, href: c.querySelector('.b-name-row')?.getAttribute('href'), sp: (() => { const sp = c.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...c.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: c.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: c.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: c.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: c.querySelector('.nw-miss')?.textContent.trim() ?? null})),
        scaleNote: [...art.querySelectorAll('.t-sub')].map(p => p.textContent.trim()).find(t => t.startsWith('선 그래프 눈금')) ?? null, how: art.querySelectorAll('.b-how').length,
        sw: document.documentElement.scrollWidth, iw: innerWidth};
    });
    if (!(r.title === g.label && r.rank === `${G}칸 가운데 ${k + 1}위` && (r.fire === '불장') === Boolean(g.hot) && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.when.endsWith(` · ${upWant(g)}`) && r.back[0] === '#/map' && r.back[1] === '‹ 업종')) headMis.push({g: g.label, r: {...r, bars: undefined, cards: undefined}});
    const cs = g.codes.map(code => byCodeB.get(code)), max = Math.max(0.01, ...cs.map(c => Math.abs(c.change20)).filter(Number.isFinite));
    if (r.bars.map(b => b.code).join() !== g.codes.join() || cs.some((c, i) => { const b = r.bars[i], v = c.change20; return b.name !== c.name || b.href !== '#/stock/' + c.code || b.val !== p1(v) || Math.abs(b.w - Math.max(1.5, Math.abs(v) / max * 50)) > 0.01 || (v < 0 ? b.right !== '50%' : b.left !== '50%'); })) barMis.push({g: g.label, bars: r.bars});
    if (r.cards.map(c => c.code).join() !== g.codes.join()) cardMis.push({g: g.label, order: r.cards.map(c => c.code)});
    for (const hc of r.cards) {
      cardsTotal++; seen.set(hc.code, (seen.get(hc.code) ?? 0) + 1);
      const c = byCodeB.get(hc.code);
      // 카드 하나에 넷(이름·변화 줄 · 선 그래프 · 수급·기사 칸) — 값 줄 · 출목표 · 일정·공시 · 종류 표시는 회사 화면으로 옮김(2026-10-05 잡스 개혁)
      if (!c || hc.name !== c.name || hc.c20 !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || hc.moved !== 0 || hc.kids !== 3 || hc.href !== '#/stock/' + c.code) cardMis.push({g: g.label, code: hc.code, hc: {c20: hc.c20, moved: hc.moved, kids: hc.kids}});
      if (c) { const bm = briefMisW(hc, c, scaleW(cs)); if (bm.length) briefMis.push({g: g.label, code: hc.code, bad: bm}); }
    }
    if (r.how) agMis.push(g.label);
    if (!r.scaleNote?.startsWith(scaleTextW(scaleW(cs)))) briefMis.push({g: g.label, scaleNote: r.scaleNote});
    if (r.sw > r.iw) overflow.push({g: g.label, sw: r.sw, iw: r.iw});
    const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? [], t.idents.filter(x => PREDICTION_WORDS.test(x)));
    if (bad.length || t.marks) wordsBad.push({g: g.label, bad: bad.slice(0, 3), marks: t.marks});
  }
  check(`${label} 업종 화면 ${G}장 모두: 제목·「${G}칸 가운데 n위」·「불장」 표시·지난 20거래일 평균·몇 곳 올랐나·「‹ 업종」(들어온 탭) = 판`, !headMis.length, {headMis: headMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 「누가 끌었나」 막대 = 그 업종 회사 · 차례·이름·값·회사 화면 링크 · 방향(오름은 0 오른쪽 · 내림은 0 왼쪽) · 길이(가장 큰 값이 반 폭)`, !barMis.length, {barMis: barMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 카드 합 ${cardsTotal}장 · 서로 다른 회사 ${seen.size}곳 = 판 ${N}곳(겹침 없음) · 업종마다 판의 차례 · 카드 하나에 넷(이름·20거래일 변화 · 선 그래프 · 수급 · 기사 — 값 줄·출목표·일정은 회사 화면) · 회사 화면 링크가 판과 같음`, cardsTotal === N && seen.size === N && [...seen.values()].every(v => v === 1) && !cardMis.length, {cardMis: cardMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 읽는 법 접힌 칸 없음(카드에 출목표·별이 없으므로)`, !agMis.length, {agMis: agMis.slice(0, 5)});
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
      next: [...document.querySelectorAll('.nc-list .nc-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const scN = scaleW(NEXT.map(x => byCodeB0.get(x.code)));
    check(`${label} 스위치 「오름 상위」 ${mobile ? '터치' : '누름'} → #/rise · 제목 「${rr.title}」 · 「${rr.when}」 · 탭 「불장」 눌림 · 스위치 「오름 상위」 고름`, rr.hash === '#/rise' && rr.title === `오름 상위 ${NEXT.length}곳` && rr.when === `불장 ${HOT.length}개 업종 밖 회사 ${NEXT.length}곳 — 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지` && rr.active === 'home' && rr.seg === 'rise', {...rr, next: undefined});
    check(`${label} 「오름 상위」: 줄 ${rr.next.length}개 = 판(${NEXT.length}곳) · 줄마다 이름·업종·작은 선 그래프(종가 ${board.companies[0].c.length}개 · ${NEXT.length}곳 같은 눈금)·20거래일 변화·회사 화면 링크 · 불장 업종 회사 없음 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · 옆으로 넘치지 않음`, board.next && rr.next.length === NEXT.length && NEXT.every((x, i) => rr.next[i]?.href === '#/stock/' + x.code && rr.next[i]?.name === x.name && rr.next[i]?.ind === x.groupLabel && rr.next[i]?.chg === p1(x.change20) && rr.next[i]?.sp?.n === byCodeB0.get(x.code).c.length && rr.next[i]?.sp?.lo === scN.lo.toFixed(4) && rr.next[i]?.sp?.hi === scN.hi.toFixed(4)) && !NEXT.some(x => HOT.some(hh => hh.id === x.groupId)) && Object.values(NEXT.reduce((m, x) => (m[x.groupId] = (m[x.groupId] ?? 0) + 1, m), {})).every(v => v <= (board.next.perIndustry ?? 2)) && rr.sw <= rr.iw, {next: rr.next.slice(0, 3), sw: rr.sw});
    const mvState = !board.moves ? 'none' : board.moves.first ? 'first' : 'moves';
    check(`${label} 「오름 상위」: 저녁 7시 들고 남 칸이 스위치 바로 아래(${rr.mvx}) = 판(${mvState}) · 옛 한 줄 없음`, rr.mvx === mvState && rr.moves === null, {mvx: rr.mvx, moves: rr.moves});
    await wordsCheck(page, `${label} 「오름 상위」`);
    if (NEXT.length) {
      const n0 = NEXT[Math.min(5, NEXT.length - 1)], row = page.locator(`.nc-row[href="#/stock/${n0.code}"]`); await row.scrollIntoViewIfNeeded();
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
      rows: [...document.querySelectorAll('.sm-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), cnt: a.querySelector('.sm-cnt > b')?.textContent.trim(), chips: [...a.querySelectorAll('.sm-chip')].map(c => `${c.dataset.trait}:${c.classList.contains('on') ? 'on' : c.classList.contains('unk') ? 'unk' : 'off'}:${c.querySelector('.sm-ck')?.textContent}`), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      bars: [...document.querySelectorAll('.tr-row')].map(r => ({id: r.dataset.trait, w: [...r.querySelectorAll('.tr-fill')].map(f => parseFloat(f.style.width)), vals: [...r.querySelectorAll('.tr-val')].map(v => v.textContent.trim()), ns: [...r.querySelectorAll('.tr-n')].map(v => v.textContent.trim())})),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const commonT = SIM.common.map(id => SIM.traits.find(t => t.id === id));
    check(`${label} 스위치 「예비」 ${mobile ? '터치' : '누름'} → #/similar · 제목 「${sr.title}」 · 「${sr.when}」 · 탭 「불장」 눌림 · 스위치 「예비」 고름`, sr.hash === '#/similar' && sr.title === `예비 ${SIM.items.length}곳` && sr.when === `불장 닮은 ${SIM.items.length}곳 — 불장 ${HOT.length}개 업종 ${SIM.hotCompanies}곳의 공통점 ${SIM.common.length}가지를 많이 가진, 불장 밖 회사 · ${kd(toM)} 종가` && sr.active === 'home' && sr.seg === 'similar', {...sr, rows: undefined, bars: undefined, mvx: undefined});
    const scS = scaleW(SIM.items.map(x => byCodeB0.get(x.code)));
    const rowMis = SIM.items.map((x, i) => { const r = sr.rows[i]; const chipsWant = commonT.map(t => `${t.id}:${x.has.includes(t.id) ? 'on:✓' : x.unknown.includes(t.id) ? 'unk:?' : 'off:·'}`);
      return r && r.href === '#/stock/' + x.code && r.name === x.name && r.ind === x.groupLabel && r.chg === p1(x.change20) && r.cnt === `공통점 ${commonT.length}가지 중 ${x.matched}가지` && r.chips.join() === chipsWant.join() && r.sp?.n === byCodeB0.get(x.code).c.length && r.sp?.lo === scS.lo.toFixed(4) && r.sp?.hi === scS.hi.toFixed(4) ? null : {i, x: x.name, r}; }).filter(Boolean);
    check(`${label} 「예비」: 줄 ${sr.rows.length}개 = 판 · 줄마다 차례 · 이름 · 업종 · 20거래일 변화 · 「공통점 n가지 중 m가지」 · 공통점 표시(✓ 가짐 · 「·」 안 가짐 · 「?」 모름 — 색만이 아님) · 선 그래프(${SIM.items.length}곳 같은 눈금) · 옆으로 넘치지 않음`, sr.rows.length === SIM.items.length && !rowMis.length && sr.sw <= sr.iw, {rowMis: rowMis.slice(0, 2), sw: sr.sw});
    const pc = x => `${Math.round((x.known ? x.yes / x.known : 0) * 100)}%`;
    const barMisS = commonT.map((t, i) => { const b = sr.bars[i], w = x => Math.max(1, (x.known ? x.yes / x.known : 0) * 100); return b && b.id === t.id && Math.abs(b.w[0] - w(t.hot)) < 0.01 && Math.abs(b.w[1] - w(t.rest)) < 0.01 && b.vals.join() === `${pc(t.hot)},${pc(t.rest)}` && b.ns.join() === `${t.hot.yes}/${t.hot.known}곳,${t.rest.yes}/${t.rest.known}곳` ? null : {t: t.id, b}; }).filter(Boolean);
    check(`${label} 「예비」: 공통점 막대 ${sr.bars.length}줄 = 판의 공통점 ${commonT.length}가지 · 줄마다 불장 · 나머지 몇 %(막대 길이 = %)`, sr.bars.length === commonT.length && !barMisS.length, {barMisS: barMisS.slice(0, 2)});
    const mv = board.moves, names = xs => xs.length ? xs.map(x => x.label ?? (x.groupLabel ? `${x.name}(${x.groupLabel})` : x.name)).join(' · ') : '없음';
    const mvOk = !mv ? sr.mvx?.state === 'none' : mv.first ? sr.mvx?.state === 'first' && sr.mvx.head.includes(`${kd(mv.to)} 종가 · 처음 기록`)
      : sr.mvx?.state === 'moves' && sr.mvx.head.startsWith(`저녁 7시 들고 남 ${kd(mv.from)} 종가 → ${kd(mv.to)} 종가 · `) && [['hot-in', mv.hotIn], ['hot-out', mv.hotOut], ['became', mv.becameHot], ['sim-in', mv.similarIn], ['sim-out', mv.similarOut]].every(([k, xs], i) => sr.mvx.rows[i]?.kind === k && sr.mvx.rows[i]?.n === xs.length && sr.mvx.rows[i]?.who === names(xs)) && sr.mvx.n22 === `오름 상위: 새로 든 곳 ${mv.nextIn.length}곳 · 빠진 곳 ${mv.nextOut.length}곳`;
    check(`${label} 「예비」: 맨 위 「저녁 7시 들고 남」 칸 = 판(${!mv ? '기록 없음' : mv.first ? '처음 기록' : `${mv.from} → ${mv.to}`})`, mvOk, sr.mvx);
    await wordsCheck(page, `${label} 「예비」`);
    if (SIM.items.length) {
      const s0 = SIM.items.at(-1), row = page.locator(`.sm-row[href="#/stock/${s0.code}"]`); await row.scrollIntoViewIfNeeded();
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
  const picks = [board.companies[0], ...board.late.map(l => board.companies.find(c => c.code === l.code)), board.companies.at(-1)].filter(Boolean);
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
    const gq = board.groups.find(g => g.id === c.group?.id), nearWant = gq ? gq.codes.filter(x => x !== c.code) : [];
    check(`${label} 회사 ${c.name}: 「${r.c20}」 = 판의 20거래일 변화 · 그래프 띠 첫날 ${r.band} = ${c.cFrom} · 같은 업종 ${r.near.length}곳 = 판`, r.c20 === `지난 20거래일 ${Number.isFinite(c.change20) ? p1(c.change20) : '없음'} · ${kd(c.cFrom)}부터 ${kd(c.date)}까지` && r.band === c.cFrom && r.near.join() === nearWant.join(), {c20: r.c20, band: r.band, near: r.near, nearWant});
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
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300); // 칸은 조금씩 붙임 — 다 붙인 뒤(data-ready) 잰다
  await shot('04-road');
  const roadRead = () => page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, mode: document.querySelector('.f-body')?.dataset.mode,
    segs: [...document.querySelectorAll('.f-seg-b')].map(b => `${b.dataset.mode}:${b.getAttribute('aria-pressed')}:${b.textContent.trim()}`),
    secs: [...document.querySelectorAll('.f-body > .f-sec')].map(s => ({domId: s.id, id: s.dataset.group ?? s.dataset.flow, rank: s.querySelector('.f-h-rank')?.textContent.trim() ?? null, name: (s.querySelector('.f-h-name') ?? s.querySelector('.t-h2'))?.firstChild?.textContent.trim(), fire: !!s.querySelector('.f-h .t-fire'), chg: s.querySelector('.f-h-chg')?.textContent.trim() ?? null, codes: [...s.querySelectorAll('.f-tile')].map(t => t.dataset.code)})),
    rows: [...document.querySelectorAll('.f-row')].map(b => { const m = b.querySelector('.spark.mini'); return {flow: b.dataset.flow, lab: b.querySelector('.f-lab')?.textContent.trim(), n: b.querySelector('.f-n')?.textContent.trim(), mini: m ? {n: +m.dataset.points, lo: m.dataset.lo, hi: m.dataset.hi, side: ['up', 'down', 'flat'].find(k => m.classList.contains(k)) ?? null} : null}; }),
    tiles: [...document.querySelectorAll('.f-tile')].map(t => ({code: t.dataset.code, href: t.getAttribute('href'), name: t.querySelector('.f-name')?.textContent.trim(), chg: t.querySelector('.f-chg')?.textContent.trim(), ind: t.querySelector('.f-ind')?.textContent.trim() ?? null, beads: t.querySelectorAll('.road .bead').length, up: t.querySelectorAll('.road .bead.up').length, st: t.querySelector('.f-st')?.textContent.trim(), unit: t.querySelector('.f-unit')?.textContent.trim() ?? null, sec: t.closest('.f-sec')?.id ?? null, sp: (() => { const sp = t.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...t.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: t.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: t.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: t.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: t.querySelector('.nw-miss')?.textContent.trim() ?? null})),
    notes: [...document.querySelectorAll('.f-body > .f-sec')].map(sct => ({id: sct.id, note: [...sct.querySelectorAll(':scope > .t-sub')].map(p => p.textContent.trim()).join(' ')})), ctx: document.querySelector('.f-ctx')?.textContent.trim() ?? null,
    sw: document.documentElement.scrollWidth, iw: innerWidth}));
  const secScale = r => new Map(r.secs.map(x => [x.domId, scaleW(x.codes.map(code => byCodeB.get(code)))]));
  const briefTileMis = r => { const sc = secScale(r); return r.tiles.map(t => ({code: t.code, bad: briefMisW(t, byCodeB.get(t.code), sc.get(t.sec))})).filter(x => x.bad.length).concat(r.notes.filter(n => !n.note.includes(scaleTextW(sc.get(n.id)))).map(n => ({sec: n.id, note: n.note.slice(-60)}))); };
  const ctxGot = board.companies.filter(c => c.brief && !c.brief.missing.includes('수급') && !c.brief.missing.includes('기사')).length, ctxDay = board.companies.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  const ctxWant = ctxGot === N ? `수급·기사: ${N}곳 모두${ctxDay ? ` · ${kd(ctxDay)} 기준` : ''}` : `수급·기사: ${N}곳 가운데 ${ctxGot}곳만 모았음${ctxDay ? `(${kd(ctxDay)} 기준)` : ''} · 나머지 ${N - ctxGot}곳은 다음 관측 수집 때 채움`;
  const tileMisOf = (tiles, withInd) => tiles.filter(t => { const c = byCodeB.get(t.code), road = c && roadOf(c.c); return !c || t.href !== '#/stock/' + c.code || t.name !== c.name || t.chg !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || t.beads !== road.cells.length || t.up !== road.all.up || t.st !== upDaysW(c) || t.unit !== (road.unit > 0.01 ? `동그라미 하나 = ${Math.round(road.unit * 100)}%` : null) || (withInd ? t.ind !== board.groups.find(g => g.id === c.group?.id)?.label : t.ind !== null); }).map(t => t.code);
  const r1 = await roadRead();
  check(`${label} 출목표 한 판: 제목 「${r1.title}」 = 판 ${N}곳 · 「${r1.when}」 · 아래 탭 「출목표」 눌림 · 처음 보이는 묶음 = 업종별(단추 ${r1.segs.join(' | ')})`, r1.title === `출목표 ${N}곳` && r1.when === `지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지 · 한 화면에 모두` && r1.active === 'road' && r1.mode === 'ind' && r1.segs.join('|') === `ind:true:업종별 ${G}개|flow:false:흐름별 ${new Set(board.companies.map(c => flowWant(roadOf(c.c)))).size}가지`, {...r1, secs: undefined, tiles: undefined});
  const secMis = board.groups.map((g, k) => { const s = r1.secs[k]; return s && s.id === g.id && s.rank === `${k + 1}위` && s.name === g.label && s.fire === Boolean(g.hot) && s.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && s.codes.join() === g.codes.join() ? null : {k, g: g.label, s}; }).filter(Boolean);
  check(`${label} 출목표 한 판(업종별): 묶음 ${r1.secs.length}개 = 판의 업종 ${G}개 · 36칸 판 차례 · n위·이름·「불장」·평균 · 업종 안 회사 차례가 판과 같음`, r1.secs.length === G && !secMis.length, {secMis: secMis.slice(0, 2)});
  const tm1 = tileMisOf(r1.tiles, false);
  check(`${label} 출목표 한 판(업종별): 칸 ${r1.tiles.length}개 = 판 ${N}곳(겹침 없음) · 이름·20거래일 변화·출목표 동그라미 수(오른 날 포함)·「20거래일 중 오른 날 n일」(연속 글 없음)·「동그라미 하나 = n%」·회사 화면 링크를 따로 센 값과 맞댐`, r1.tiles.length === N && new Set(r1.tiles.map(t => t.code)).size === N && !tm1.length, {tm1: tm1.slice(0, 5)});
  const bt1 = briefTileMis(r1);
  check(`${label} 출목표 한 판(업종별): 칸 ${r1.tiles.length}개마다 선 그래프(종가 ${board.companies[0].c.length}개 · 업종 5곳 같은 눈금 · 눈금 글) · 수급 · 회사 이름이 든 최근 기사 = 판 · 「${r1.ctx}」`, !bt1.length && r1.ctx === ctxWant, {bt1: bt1.slice(0, 4), ctx: r1.ctx, ctxWant});
  check(`${label} 출목표 한 판(업종별): 화면이 옆으로 넘치지 않음(${r1.sw}px ≤ ${r1.iw}px)`, r1.sw <= r1.iw, {sw: r1.sw, iw: r1.iw});
  await wordsCheck(page, `${label} 출목표 한 판(업종별)`);
  // 흐름별로 바꾸기
  const seg = page.locator('.f-seg-b[data-mode="flow"]'); if (mobile) await seg.tap(); else await seg.click(); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); await page.waitForTimeout(300);
  const r2 = await roadRead();
  const flowsWant = FLOW_ORDER_W.map(k => ({k, items: board.companies.filter(c => flowWant(roadOf(c.c)) === k).sort((a, b) => b.change20 - a.change20 || a.code.localeCompare(b.code))})).filter(f => f.items.length);
  const flowMis = flowsWant.map((f, i) => { const s = r2.secs[i], row = r2.rows[i]; return s && s.id === f.k && s.name === flowTextW(f.k) && s.codes.join() === f.items.map(c => c.code).join() && row?.flow === f.k && row?.lab === flowTextW(f.k) && row?.n === `${f.items.length}곳` ? null : {k: f.k, s: s && {...s, codes: s.codes.length}, row}; }).filter(Boolean);
  check(`${label} 출목표 한 판(흐름별 ${mobile ? '터치' : '누름'}): 흐름 ${r2.secs.length}가지 = 따로 나눈 ${flowsWant.length}가지 · 차례(최근 5거래일 오름 쪽부터) · 이름 · 곳 수(합 ${r2.secs.reduce((s, x) => s + x.codes.length, 0)} = ${N}) · 묶음 안은 20거래일 많이 오른 순 · 흐름 목록 줄도 같음`, r2.mode === 'flow' && r2.secs.length === flowsWant.length && !flowMis.length && r2.segs[1] === `flow:true:흐름별 ${flowsWant.length}가지`, {flowMis: flowMis.slice(0, 2)});
  // 흐름 목록 줄마다 묶음 평균 선(2026-10-05 00:26 「출목표 처음 보이는 곳에 … 바로 그래프도」) — 같은 날 종가까지 있는 회사만 날마다 평균 · 모든 줄 같은 눈금
  const meanW = cs => { const ok = cs.filter(c => c.date === toM); const n = Math.min(...ok.map(c => c.c.length)); return ok.length ? Array.from({length: n}, (_, i) => ok.reduce((t, c) => t + c.c[i] / c.c[0] - 1, 0) / ok.length) : []; };
  const meansW = new Map(flowsWant.map(f => [f.k, meanW(f.items)])), allM = [...meansW.values()].flat(), mlo = Math.min(-0.03, ...allM), mhi = Math.max(0.03, ...allM);
  const miniMis = flowsWant.map((f, i) => { const m = r2.rows[i]?.mini, r = meansW.get(f.k); return m && m.n === r.length && m.lo === mlo.toFixed(4) && m.hi === mhi.toFixed(4) && m.side === (r.at(-1) > 0 ? 'up' : r.at(-1) < 0 ? 'down' : 'flat') ? null : {k: f.k, m}; }).filter(Boolean);
  check(`${label} 출목표 한 판(흐름별): 흐름 목록 ${r2.rows.length}줄마다 묶음 평균 선(종가 ${meansW.get(flowsWant[0].k).length}개 · 모든 줄 같은 눈금 ${pW(mlo, 0)} ~ ${pW(mhi, 0)} · 오름/내림 색) — 첫 화면부터 그래프`, !miniMis.length, {miniMis: miniMis.slice(0, 3)});
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
  await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(400);
  const back = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode}));
  check(`${label} 회사 화면 「‹ 출목표」 → 출목표 한 판 · 보던 자리(${yBefore}px → ${back.y}px) · 고른 묶음 「흐름별」 그대로`, back.hash === '#/road' && Math.abs(back.y - yBefore) <= 2 && back.mode === 'flow', {yBefore, back});
  // 지금 탭을 한 번 더 누르면 맨 위로(화면은 그대로)
  const tab = page.locator('.bottom-link[data-route="road"]'); if (mobile) await tab.tap(); else await tab.click(); await page.waitForTimeout(900);
  const tt = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode}));
  check(`${label} 출목표 탭을 한 번 더 ${mobile ? '터치' : '누름'} → 맨 위로(${tt.y}px) · 화면은 그대로`, tt.hash === '#/road' && tt.y === 0 && tt.mode === 'flow', tt);
  // 다시 업종별로(다음 검사들이 처음 모습을 보도록)
  const seg2 = page.locator('.f-seg-b[data-mode="ind"]'); if (mobile) await seg2.tap(); else await seg2.click(); await page.waitForSelector('.f-body[data-mode="ind"][data-ready] .f-tile'); await page.waitForTimeout(200);
  check(`${label} 출목표 한 판: 업종별로 되돌림`, (await page.evaluate(() => document.querySelector('.f-body')?.dataset.mode)) === 'ind');
  // 큰 갈래 단추(2026-10-05 「잡스라면」 — 업종별에서만 보임) — 누르면 그 갈래 업종 묶음만 · 「모두」로 되돌림
  {
    const segI = page.locator('.f-seg-b[data-mode="ind"]'); if (mobile) await segI.tap(); else await segI.click(); await page.waitForSelector('.f-body[data-mode="ind"][data-ready] .f-tile'); await page.waitForTimeout(150);
    const famW = groupByFamily(board.groups), f1 = famW[1] ?? famW[0];
    const fr0 = await page.evaluate(() => ({shown: !document.querySelector('.f-fam')?.hidden, btns: [...document.querySelectorAll('.f-fam .fm-b')].map(b => `${b.dataset.family}|${b.getAttribute('aria-pressed')}`)}));
    const fb = page.locator(`.f-fam .fm-b[data-family="${f1.fam.id}"]`); if (mobile) await fb.tap(); else await fb.click(); await page.waitForTimeout(200);
    const fr1 = await page.evaluate(() => [...document.querySelectorAll('.f-body > .f-sec')].filter(x => !x.hidden).map(x => x.dataset.group));
    const fa = page.locator('.f-fam .fm-b[data-family="all"]'); if (mobile) await fa.tap(); else await fa.click(); await page.waitForTimeout(150);
    const fr2 = await page.evaluate(() => [...document.querySelectorAll('.f-body > .f-sec')].filter(x => !x.hidden).length);
    check(`${label} 출목표 업종별: 큰 갈래 단추 ${fr0.btns.length}개(「모두」 + ${famW.length}) · 「${f1.fam.label}」 → 묶음 ${fr1.length}개 = 그 갈래 업종 ${f1.groups.length}개 · 「모두」 → ${fr2}개 = ${G}개`, fr0.shown && fr0.btns.length === famW.length + 1 && fr0.btns[0] === 'all|true' && fr1.join() === f1.groups.map(g => g.id).join() && fr2 === G, {fr0, fr1, fr2});
  }

  // ④ 지운 화면의 옛 주소 → 처음 화면
  for (const old of ['#/forecast', '#/up', '#/down', '#/scores', '#/race', '#/evolution', '#/status', '#/records', '#/game']) {
    await page.goto(base + '/' + old, {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({hash: location.hash, rows: document.querySelectorAll('.hf-row').length, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim()}));
    check(`${label} 옛 주소 ${old} → 탭 「불장」(#/ · 「${r.title}」 · 불장 줄 ${r.rows}개)`, r.hash === '#/' && r.title === `불장 업종 ${HOT.length}개` && r.rows === HOT.length, r);
  }
  // ⑤ 무결성 · 글씨 단추
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(300);
  const integ = await page.evaluate(() => document.querySelector('.b-foot .integrity-text')?.textContent); // 「기술 정보」 접힌 칸 안(잡스 개혁 — 기술 말은 접어 둠)
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
  for (const [hash, wait, name] of [['#/', '.h-page .hs-seg', 'home'], ['#/map', '.t-tile', 'map'], ['#/i/' + (board.hot?.items?.[0]?.id ?? board.groups[0].id), '.b-card .spark', 'industry'], ['#/similar', '.s-page', 'similar'], ['#/rise', '.r-page', 'rise'], ['#/road', '.f-body[data-ready] .f-tile', 'road'], ['#/stock/' + board.companies[0].code, '.c-chart svg.lc', 'company'], ['#/agenda', '.b-box', 'agenda']]) {
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
  clarity = await clarityCheck();
} finally { await browser.close(); }
// 배포 묶음: 게임 쪽은 없고 옛 주소는 처음 화면으로 돌린다(넷리파이 _redirects)
try { const red = await fs.readFile(path.join(process.cwd(), 'dist/_redirects'), 'utf8'); let game = true; try { await fs.access(path.join(process.cwd(), 'dist/game')); } catch { game = false; } check(`배포 묶음: game/ 폴더 없음 · _redirects 에 /game/* → / (${red.trim().split('\n').length}줄)`, !game && /^\/game\/\*\s+\/\s+302$/m.test(red)); } catch (e) { check('배포 묶음 dist/ 를 읽지 못함', false, {e: e.message}); }
const summary = {schema: 'atlas11-browser-check-4', at: new Date().toISOString(), base, prediction: 'off', boardId: manifest.boardId, asOf: manifest.asOf, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (터치 흉내 — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;
